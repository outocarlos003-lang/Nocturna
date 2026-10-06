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

await api("/repos/"+OWNER+"/"+REPO+"/issues/"+ISSUE);
const comments=await api("/repos/"+OWNER+"/"+REPO+"/issues/"+ISSUE+"/comments?per_page=100");
const root=comments.find(c=>String(c.body||"").includes("<!-- nocturna-root:v1 -->"));
if(!root) throw new Error("comentario raiz Johan Liebert nao encontrado; nenhuma nova origem sera criada");

const data=JSON.parse(fs.readFileSync(PATH,"utf8"));
const rootNode=data.nodes.find(n=>String(n.nodeId)===String(data.issue?.rootNodeId||"2"));
if(!rootNode) throw new Error("no raiz canonica nao encontrado");
if(rootNode.author?.displayName!=="Johan Liebert") throw new Error("a raiz canonica deve preservar Johan Liebert");

const previousRootContent=rootNode.content;
const githubAuthor=String(root.user?.login||root.user?.name||"github");
rootNode.commentId=root.id;
rootNode.commentUrl=root.html_url;
rootNode.author={displayName:"Johan Liebert",role:"Comentário inicial"};
rootNode.parentNodeId=null;
rootNode.parentThreadKey=null;
rootNode.parentCommentId=null;
rootNode.parentAuthor=null;
rootNode.depth=0;
rootNode.content=String(root.body||"").replace(/^<!-- nocturna-root:v1 -->\s*/,"").trim();
rootNode.origin={
  kind:"github-issue-comment",
  location:root.html_url,
  migrated:false,
  normalized:true,
  historicalIssueBody:previousRootContent,
  githubAuthor
};

for(const node of data.nodes){
  if(String(node.nodeId)!==String(rootNode.nodeId) && String(node.parentNodeId)===String(rootNode.nodeId)){
    node.parentCommentId=root.id;
    node.parentAuthor="Johan Liebert";
  }
}

data.issue.rootNodeId=String(rootNode.nodeId);
data.issue.rootCommentId=root.id;
data.issue.rootCommentUrl=root.html_url;
data.issue.rootAuthor="Johan Liebert";
data.issue.authority="github";

// A bootstrap step only reconciles the checked-out projection. Persistence is
// performed once, at the end of the workflow, to avoid racing the Git branch.
fs.writeFileSync(PATH,JSON.stringify(data,null,2)+"\n");
console.log("raiz canonica preservada",root.id,"autor GitHub:",githubAuthor);
