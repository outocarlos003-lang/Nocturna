#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const args=process.argv.slice(2);
const manifestPath=args.includes('--manifest') ? args[args.indexOf('--manifest')+1] : 'migration/discussions/manifest.json';
const write=args.includes('--write');

function fail(message){ console.error('ERRO:',message); process.exit(1); }
if(!fs.existsSync(manifestPath)) fail('Manifesto não encontrado: '+manifestPath);

const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(manifest.version!==1) fail('Versão de manifesto não suportada.');
if(!manifest.repository) fail('repository é obrigatório.');
if(!Array.isArray(manifest.records)) fail('records deve ser um array.');

const sha256=(value)=>crypto.createHash('sha256').update(value,'utf8').digest('hex');
const marker=(sourceId)=>'<!-- nocturna-migration:v1 source-id='+sourceId+' -->';

const seen=new Set();
const threads=new Map();
for(const [i,r] of manifest.records.entries()){
  if(!r.thread?.key) fail('records['+i+']: thread.key ausente.');
  if(!r.source?.id) fail('records['+i+']: source.id ausente.');
  if(!r.source?.url) fail('records['+i+']: source.url ausente.');
  if(!r.source?.author?.login) fail('records['+i+']: source.author.login ausente.');
  if(typeof r.content?.markdown!=='string') fail('records['+i+']: content.markdown ausente.');
  const actual=sha256(r.content.markdown);
  if(r.content.sha256 && r.content.sha256!=='PREENCHER_PELO_EXPORTADOR' && r.content.sha256!==actual)
    fail('records['+i+']: hash SHA-256 não corresponde ao conteúdo.');
  if(seen.has(r.source.id)) fail('ID de origem duplicado: '+r.source.id);
  seen.add(r.source.id);
  if(!threads.has(r.thread.key)) threads.set(r.thread.key,[]);
  threads.get(r.thread.key).push(r);
}

const endpoint='https://api.github.com/graphql';
const token=process.env.GITHUB_TOKEN||process.env.GH_TOKEN;

async function graphql(query,variables={}){
  if(!token) fail('Execução real exige GITHUB_TOKEN ou GH_TOKEN.');
  const res=await fetch(endpoint,{
    method:'POST',
    headers:{
      Authorization:'Bearer '+token,
      'Content-Type':'application/json',
      'User-Agent':'Nocturna-Discussion-Migrator/1.0'
    },
    body:JSON.stringify({query,variables})
  });
  const json=await res.json();
  if(!res.ok || json.errors) fail(JSON.stringify(json.errors||json));
  return json.data;
}

function buildBody(r){
  const meta=[
    marker(r.source.id),
    '<!-- source-url: '+r.source.url+' -->',
    '<!-- source-author: '+r.source.author.login+' -->',
    '<!-- source-created-at: '+(r.source.createdAt||'')+' -->',
    '<!-- source-updated-at: '+(r.source.updatedAt||'')+' -->',
    '<!-- source-sha256: '+sha256(r.content.markdown)+' -->',
    '<!-- source-reply-to: '+(r.replyToSourceId||'')+' -->'
  ].join('\n');
  return meta+'\n\n'+r.content.markdown;
}

async function findExistingDiscussion(repositoryId, sourceId){
  const data=await graphql(
    'query($repositoryId:ID!){ node(id:$repositoryId){ ... on Repository { discussions(first:100,orderBy:{field:CREATED_AT,direction:DESC}){ nodes{id number url body category{id slug}} } } } }',
    {repositoryId}
  );
  const list=data.node?.discussions?.nodes||[];
  return list.find(d=>typeof d.body==='string' && d.body.includes(marker(sourceId)))||null;
}

async function getExistingComments(discussionId){
  const data=await graphql(
    'query($discussionId:ID!){ node(id:$discussionId){ ... on Discussion { comments(first:100){ nodes{id body} } } } }',
    {discussionId}
  );
  return data.node?.comments?.nodes||[];
}

console.log(JSON.stringify({
  repository:manifest.repository,
  mode:write?'write':'dry-run',
  records:manifest.records.length,
  threads:threads.size,
  sourceIds:[...seen]
},null,2));

if(!write) {
  console.log('DRY-RUN: nenhuma Discussion ou comentário será criado.');
  process.exit(0);
}

const [owner,name]=manifest.repository.split('/');
if(!owner||!name) fail('repository deve estar no formato owner/name.');

const repoData=await graphql(
'query($owner:String!,$name:String!){ repository(owner:$owner,name:$name){ id discussionCategories(first:25){nodes{id name slug isAnswerable}} } }',
{owner,name}
);

if(!repoData.repository) fail('Repositório não encontrado ou sem acesso.');
const categories=new Map(repoData.repository.discussionCategories.nodes.map(c=>[c.slug,c]));
const destinationByThread=new Map();

for(const [threadKey,records] of threads){
  const first=records[0];
  const categorySlug=first.destination?.categorySlug;
  const category=categories.get(categorySlug);
  if(!category) fail('Categoria inexistente para '+threadKey+': '+categorySlug);

  const title=first.thread.title || 'Migração Nocturna: '+threadKey;
  const body=buildBody(first);

  let discussion=await findExistingDiscussion(repoData.repository.id,first.source.id);
  if(discussion) console.log('Já existe, reutilizando '+discussion.url);
  if(!discussion){
  const created=await graphql(
'mutation($input:CreateDiscussionInput!){ createDiscussion(input:$input){ discussion{id number url} } }',
{
    input:{
      repositoryId:repoData.repository.id,
      categoryId:category.id,
      title,
      body,
      clientMutationId:'nocturna:'+threadKey
    }
  });

  discussion=created.createDiscussion.discussion;
  if(!discussion) fail('GitHub não retornou a Discussion criada para '+threadKey);
  }
  destinationByThread.set(threadKey,discussion);

  const existingComments=await getExistingComments(discussion.id);
  const commentMap=new Map();
  for(const c of existingComments){
    const match=typeof c.body==='string' ? c.body.match(/nocturna-migration:v1 source-id=([^ ]+) -->/) : null;
    if(match) commentMap.set(match[1],c.id);
  }
  const pending=[...records.slice(1)].filter(r=>!commentMap.has(r.source.id));
  while(pending.length){
    let progressed=false;
    for(let i=pending.length-1;i>=0;i--){
      const r=pending[i];
      const parentId=r.replyToSourceId ? commentMap.get(r.replyToSourceId) : null;
      if(r.replyToSourceId && !parentId) continue;
      const result=await graphql(
'mutation($input:AddDiscussionCommentInput!){ addDiscussionComment(input:$input){ comment{id url} } }',
{
        input:{
          discussionId:discussion.id,
          body:buildBody(r),
          replyToId:parentId||null,
          clientMutationId:'nocturna-comment:'+r.source.id
        }
      });
      const comment=result.addDiscussionComment.comment;
      if(!comment) fail('GitHub não retornou comentário para '+r.source.id);
      commentMap.set(r.source.id,comment.id);
      pending.splice(i,1);
      progressed=true;
    }
    if(!progressed) fail('Relação de resposta incompleta ou cíclica na thread '+threadKey+'.');
  }
  console.log('Sincronizada '+threadKey+' -> '+discussion.url);
}
