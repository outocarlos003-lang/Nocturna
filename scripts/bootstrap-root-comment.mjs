#!/usr/bin/env node
import fs from "node:fs";

const OWNER="outocarlos003-lang";
const REPO="Nocturna";
const ISSUE=1;
const PATH="data/comments/issue-1.json";
const token=process.env.GITHUB_TOKEN;
if(!token) throw new Error("GITHUB_TOKEN obrigatorio");

const api=async(url,options={})=>{
  const res=await fetch("https://api.github.com"+url,{...options,headers:{
    Accept:"application/vnd.github+json",
    "X-GitHub-Api-Version":"2026-03-10",
    Authorization:"Bearer "+token,
    ...(options.headers||{})
  }});
  const text=await res.text();
  let body={}; try{body=JSON.parse(text)}catch{}
  if(!res.ok) throw new Error("GitHub "+res.status+": "+(body.message||text));
  return body;
};

const defaultRootBody=[
"<!-- nocturna-root:v1 -->",
"",
"# Nocturna — raiz da conversa",
"",
"Este comentário é o **nó raiz real** da árvore canônica.",
"",
"Todas as respostas canônicas — de personagens ou de participantes humanos que optarem pelo fluxo canônico — devem apontar para este comentário ou para um descendente verificável.",
"",
"A relação pai → filho será preservada pelo sistema, junto com autor, identidade, profundidade, ordem e permalink."
].join("\n");

const issue=await api("/repos/"+OWNER+"/"+REPO+"/issues/"+ISSUE);
const comments=await api("/repos/"+OWNER+"/"+REPO+"/issues/"+ISSUE+"/comments?per_page=100");
let root=comments.find(c=>String(c.body||"").includes("<!-- nocturna-root:v1 -->"));

if(!root){
  root=await api("/repos/"+OWNER+"/"+REPO+"/issues/"+ISSUE+"/comments",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({body:defaultRootBody})
  });
  console.log("comentario raiz criado:",root.id);
}else{
  console.log("comentario raiz ja existente:",root.id);
}

const data=JSON.parse(fs.readFileSync(PATH,"utf8"));
const rootNode=data.nodes.find(n=>String(n.nodeId)==="2");
if(!rootNode) throw new Error("nodeId 2 (raiz historica) nao encontrado");

const previousRootContent=rootNode.content;
rootNode.commentId=root.id;
rootNode.commentUrl=root.html_url;
const rootBody=String(root.body||"");
const rootAuthor=String(root.user?.login||root.user?.name||"github");
rootNode.author={displayName:rootAuthor,role:"Raiz canônica"};
rootNode.parentCommentId=null;
rootNode.parentAuthor=null;
rootNode.content=rootBody.replace(/^<!-- nocturna-root:v1 -->\s*/,"").trim();
rootNode.origin={
  kind:"github-issue-comment",
  location:root.html_url,
  migrated:false,
  normalized:true,
  historicalIssueBody:previousRootContent
};

for(const node of data.nodes){
  if(String(node.nodeId)!=="2" && String(node.parentNodeId)==="2"){
    node.parentCommentId=root.id;
    node.parentAuthor=rootAuthor;
  }
}

data.issue.rootNodeId="2";
data.issue.rootCommentId=root.id;
data.issue.rootCommentUrl=root.html_url;
data.issue.rootAuthor=rootAuthor;

const current=await api("/repos/"+OWNER+"/"+REPO+"/contents/"+PATH);
const encoded=Buffer.from(JSON.stringify(data,null,2)+"\n","utf8").toString("base64");
await api("/repos/"+OWNER+"/"+REPO+"/contents/"+PATH,{
  method:"PUT",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
    message:"comments: materialize Issue #1 root comment",
    content:encoded,
    sha:current.sha
  })
});
console.log("projecao relinkada ao comentario raiz",root.id);
