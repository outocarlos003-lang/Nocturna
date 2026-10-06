#!/usr/bin/env node
import fs from "node:fs";

const OWNER="outocarlos003-lang";
const REPO="Nocturna";
const ISSUE=1;
const PATH="data/comments/issue-1.json";
const token=process.env.GITHUB_TOKEN;
if(!token) throw new Error("GITHUB_TOKEN obrigatorio");
const data=JSON.parse(fs.readFileSync(PATH,"utf8"));

const api=async(url,options={})=>{
  const res=await fetch("https://api.github.com"+url,{...options,headers:{
    Accept:"application/vnd.github+json",
    "X-GitHub-Api-Version":"2026-03-10",
    Authorization:"Bearer "+token,
    ...(options.headers||{})
  }});
  const body=await res.json();
  if(!res.ok) throw new Error("GitHub "+res.status+": "+(body.message||"erro"));
  return body;
};

const nodes=Array.isArray(data.nodes)?data.nodes:[];
const byNode=new Map(nodes.map(n=>[String(n.nodeId),n]));
const byComment=new Map(nodes.map(n=>[String(n.commentId),n]));
const ids=new Set(nodes.map(n=>String(n.nodeId)));
const sourceIds=new Set(nodes.map(n=>n.sourceId));
let next=Math.max(0,...nodes.map(n=>Number(n.nodeId)))+1;
let changed=false;

const rootNode=byNode.get(String(data.issue?.rootNodeId));
if(!rootNode) throw new Error("raiz canonica ausente");
if(rootNode.parentNodeId!==null) throw new Error("raiz canonica possui pai");
if(rootNode.author?.displayName!=="Johan Liebert") throw new Error("a raiz canonica deve ser Johan Liebert");
if(!rootNode.commentId) throw new Error("raiz canonica sem commentId");

data.issue.rootCommentId=rootNode.commentId;
data.issue.rootCommentUrl=rootNode.commentUrl;
data.issue.rootAuthor="Johan Liebert";

const genealogy=new Map();
const visit=(node,rootId=rootNode.nodeId,branchId=null,stack=new Set())=>{
  const id=String(node.nodeId);
  if(stack.has(id)) throw new Error("ciclo genealogico detectado em "+id);
  if(genealogy.has(id)) return genealogy.get(id);
  const nextStack=new Set(stack); nextStack.add(id);
  const isRoot=id===String(rootNode.nodeId);
  const currentBranch=isRoot?null:(branchId??id);
  const result={rootNodeId:String(rootId),rootCommentId:rootNode.commentId,branchNodeId:currentBranch,depth:isRoot?0:Number(node.depth)};
  genealogy.set(id,result);
  return result;
};

// Reconcilia apenas metadados relacionais derivados. Conteudo, identidade e origem nao sao reescritos.
for(const node of nodes){
  let cursor=node;
  const chain=[];
  const seen=new Set();
  while(String(cursor.nodeId)!==String(rootNode.nodeId)){
    const id=String(cursor.nodeId);
    if(seen.has(id)) throw new Error("ciclo genealogico detectado em "+id);
    seen.add(id); chain.push(cursor);
    if(cursor.parentNodeId===null||cursor.parentNodeId===undefined) throw new Error("no sem ancestral ate a raiz: "+id);
    cursor=byNode.get(String(cursor.parentNodeId));
    if(!cursor) throw new Error("pai inexistente: "+id+" -> "+node.parentNodeId);
  }
  const branch=chain.length?chain[chain.length-1].nodeId:null;
  const expected={rootNodeId:String(rootNode.nodeId),rootCommentId:rootNode.commentId,branchNodeId:branch,depth:chain.length};
  for(const [key,value] of Object.entries(expected)){
    if(node[key]!==value){ node[key]=value; changed=true; }
  }
  genealogy.set(String(node.nodeId),expected);
}

let comments=[];
for(let page=1;;page++){
  const batch=await api("/repos/"+OWNER+"/"+REPO+"/issues/"+ISSUE+"/comments?per_page=100&page="+page);
  comments.push(...batch);
  if(batch.length<100)break;
}

for(const c of comments){
  const body=String(c.body||"");
  const m=body.match(/<!-- nocturna-reply:v1\n([\s\S]*?)\n-->/);
  if(!m) continue;
  const meta=Object.fromEntries(m[1].split("\n").map(line=>{
    const i=line.indexOf("=");
    return i<0?[line,""]:[line.slice(0,i),line.slice(i+1)];
  }));
  const required=["parent-node","parent-comment","parent-author","source-id"];
  if(required.some(k=>!meta[k])) continue;
  const replyAuthor=String(c.user?.login||c.user?.name||"").trim();
  if(!replyAuthor) continue;
  if(!/^github-issue1-reply-[A-Za-z0-9_-]{16,100}$/.test(meta["source-id"])) continue;

  const commentId=String(c.id);
  const sourceId=meta["source-id"];
  if(byComment.has(commentId)) continue;
  if(sourceIds.has(sourceId)) throw new Error("source-id duplicado: "+sourceId);

  const parentId=meta["parent-node"];
  const parent=byComment.get(meta["parent-comment"]) || byNode.get(parentId);
  if(!parent) throw new Error("pai inexistente para comentario "+commentId);
  if(String(parent.commentId)!==String(meta["parent-comment"])) throw new Error("parent-comment nao corresponde ao pai");
  if(parent.author.displayName!==meta["parent-author"]) throw new Error("parent-author nao corresponde ao pai");
  if(ids.has(String(next))) throw new Error("nodeId duplicado: "+next);

  const parentGenealogy=genealogy.get(String(parent.nodeId));
  if(!parentGenealogy) throw new Error("genealogia do pai ausente: "+parent.nodeId);

  const node={
    nodeId:String(next++),
    sourceId,
    issueNumber:ISSUE,
    threadKey:String(next-1),
    parentNodeId:String(parent.nodeId),
    parentThreadKey:String(parent.nodeId),
    depth:parentGenealogy.depth+1,
    order:data.nodes.length+1,
    parentCommentId:parent.commentId,
    parentAuthor:parent.author.displayName,
    rootNodeId:String(parentGenealogy.rootNodeId),
    rootCommentId:parentGenealogy.rootCommentId,
    branchNodeId:parentGenealogy.branchNodeId??String(next-1),
    commentId:c.id,
    commentUrl:c.html_url,
    author:{
      displayName:replyAuthor,
      role:c.user?.type==="Bot"?"Resposta canônica":"Participação humana"
    },
    content:body.replace(m[0],"").trim(),
    origin:{
      kind:"github-issue-comment",
      location:c.html_url,
      migrated:false,
      normalized:true
    }
  };
  data.nodes.push(node);
  byComment.set(commentId,node);
  byNode.set(node.nodeId,node);
  ids.add(node.nodeId);
  sourceIds.add(sourceId);
  genealogy.set(node.nodeId,{rootNodeId:node.rootNodeId,rootCommentId:node.rootCommentId,branchNodeId:node.branchNodeId,depth:node.depth});
  changed=true;
}

data.identity.nextNodeId=next;

if(changed){
  fs.writeFileSync(PATH,JSON.stringify(data,null,2)+"\n");
  console.log("projecao genealogica atualizada");
}else{
  console.log("nenhuma alteracao genealogica necessaria");
}
