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

let comments=[];
for(let page=1;;page++){
  const batch=await api("/repos/"+OWNER+"/"+REPO+"/issues/"+ISSUE+"/comments?per_page=100&page="+page);
  comments.push(...batch);
  if(batch.length<100)break;
}
const byComment=new Map(data.nodes.map(n=>[String(n.commentId),n]));
const ids=new Set(data.nodes.map(n=>String(n.nodeId)));
const sourceIds=new Set(data.nodes.map(n=>n.sourceId));
let next=Math.max(0,...data.nodes.map(n=>Number(n.nodeId)))+1;
let changed=false;

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
  // A identidade de quem responde vem do próprio autor real do comentário no GitHub.
  // A interface do Nocturna não escolhe personagem nem usuário em nome do respondente.
  const replyAuthor=String(c.user?.login||c.user?.name||"").trim();
  if(!replyAuthor) continue;
  if(!/^github-issue1-reply-[A-Za-z0-9_-]{16,100}$/.test(meta["source-id"])) continue;

  const commentId=String(c.id);
  const sourceId=meta["source-id"];
  if(byComment.has(commentId)) continue;
  if(sourceIds.has(sourceId)) throw new Error("source-id duplicado: "+sourceId);

  const parentId=meta["parent-node"];
  const parent=byComment.get(meta["parent-comment"]) || data.nodes.find(n=>String(n.nodeId)===parentId);
  if(!parent) throw new Error("pai inexistente para comentario "+commentId);
  if(String(parent.commentId)!==String(meta["parent-comment"])) throw new Error("parent-comment nao corresponde ao pai");
  if(parent.author.displayName!==meta["parent-author"]) throw new Error("parent-author nao corresponde ao pai");
  if(ids.has(String(next))) throw new Error("nodeId duplicado: "+next);

  const node={
    nodeId:String(next++),
    sourceId,
    issueNumber:ISSUE,
    threadKey:String(next-1),
    parentNodeId:String(parent.nodeId),
    parentThreadKey:String(parent.nodeId),
    depth:parent.depth+1,
    order:data.nodes.length+1,
    parentCommentId:parent.commentId,
    parentAuthor:parent.author.displayName,
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
  ids.add(node.nodeId);
  sourceIds.add(sourceId);
  changed=true;
}

if(changed){
  data.identity.nextNodeId=next;
  fs.writeFileSync(PATH,JSON.stringify(data,null,2)+"\n");
  console.log("projecao atualizada");
}else{
  console.log("nenhum comentario canonico novo");
}
