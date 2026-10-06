#!/usr/bin/env node
import fs from "node:fs";

const OWNER="outocarlos003-lang";
const REPO="Nocturna";
const ISSUE=1;
const PATH="data/comments/issue-1.json";
const token=process.env.GITHUB_TOKEN;
if(!token) throw new Error("GITHUB_TOKEN obrigatorio");

const data=JSON.parse(fs.readFileSync(PATH,"utf8"));
const nodes=Array.isArray(data.nodes)?data.nodes:[];
const byNode=new Map(nodes.map(n=>[String(n.nodeId),n]));
const bySource=new Map(nodes.map(n=>[String(n.sourceId),n]));
const root=byNode.get(String(data.issue?.rootNodeId));
if(!root) throw new Error("raiz ausente na projecao");
if(root.author?.displayName!=="Johan Liebert") throw new Error("raiz deve ser Johan Liebert");

const api=async(url)=>{
  const res=await fetch("https://api.github.com"+url,{headers:{
    Accept:"application/vnd.github+json",
    "X-GitHub-Api-Version":"2026-03-10",
    Authorization:"Bearer "+token
  }});
  const text=await res.text();
  let body={}; try{body=JSON.parse(text)}catch{}
  if(!res.ok) throw new Error("GitHub "+res.status+": "+(body.message||text));
  return body;
};

const comments=[];
for(let page=1;;page++){
  const batch=await api(`/repos/${OWNER}/${REPO}/issues/${ISSUE}/comments?per_page=100&page=${page}`);
  comments.push(...batch);
  if(batch.length<100) break;
}

const markerRe=/<!-- nocturna-node:v1 (\{[\s\S]*?\}) -->/;
const liveByNode=new Map();
const liveBySource=new Map();
for(const comment of comments){
  const match=String(comment.body||"").match(markerRe);
  if(!match) continue;
  let marker;
  try{ marker=JSON.parse(match[1]); }catch{ throw new Error(`marker invalido no comentario ${comment.id}`); }
  if(!marker.nodeId || !marker.sourceId) throw new Error(`marker incompleto no comentario ${comment.id}`);
  const nodeId=String(marker.nodeId);
  const sourceId=String(marker.sourceId);
  if(liveByNode.has(nodeId)) throw new Error(`nodeId materializado duplicado: ${nodeId}`);
  if(liveBySource.has(sourceId)) throw new Error(`sourceId materializado duplicado: ${sourceId}`);
  liveByNode.set(nodeId,{comment,marker});
  liveBySource.set(sourceId,{comment,marker});
}

const escapeMeta=(value)=>String(value).replace(/\\/g,"\\\\").replace(/\r?\n/g," ");
const expectedBody=(node,parent)=>[
  `<!-- nocturna-node:v1 ${JSON.stringify({
    nodeId:String(node.nodeId),
    sourceId:String(node.sourceId),
    parentNodeId:node.parentNodeId===null?null:String(node.parentNodeId),
    rootNodeId:String(data.issue.rootNodeId),
    depth:Number(node.depth),
    author:String(node.author?.displayName||"")
  })} -->`,
  "",
  `> **Nocturna genealogy** · node ${escapeMeta(node.nodeId)} · depth ${Number(node.depth)}`,
  `> Pai: node ${escapeMeta(node.parentNodeId)} · comentário GitHub #${escapeMeta(parent.commentId)}`,
  `> Autor semântico: ${escapeMeta(node.author?.displayName||"")}`,
  "",
  String(node.content||"").trim()
].join("\n");

for(const node of nodes){
  const nodeId=String(node.nodeId);
  if(nodeId===String(root.nodeId)) continue;
  const live=liveByNode.get(nodeId) || liveBySource.get(String(node.sourceId));
  if(!live) throw new Error(`node ${nodeId} não está materializado no GitHub`);
  if(String(live.marker.nodeId)!==nodeId) throw new Error(`nodeId divergente no comentario ${live.comment.id}`);
  if(String(live.marker.sourceId)!==String(node.sourceId)) throw new Error(`sourceId divergente no comentario ${live.comment.id}`);
  if(String(live.marker.parentNodeId)!==String(node.parentNodeId)) throw new Error(`parentNodeId divergente no node ${nodeId}`);
  if(String(live.marker.rootNodeId)!==String(data.issue.rootNodeId)) throw new Error(`rootNodeId divergente no node ${nodeId}`);
  if(Number(live.marker.depth)!==Number(node.depth)) throw new Error(`depth divergente no node ${nodeId}`);
  if(String(live.comment.id)!==String(node.commentId)) throw new Error(`commentId divergente no node ${nodeId}`);
  const parent=byNode.get(String(node.parentNodeId));
  if(!parent) throw new Error(`pai ausente no node ${nodeId}`);
  const expected=expectedBody(node,parent);
  if(String(live.comment.body||"")!==expected) throw new Error(`conteudo materializado divergente no node ${nodeId}`);
}

for(const [nodeId] of liveByNode){
  if(!byNode.has(nodeId)) throw new Error(`comentario materializado sem node na projecao: ${nodeId}`);
}
for(const [sourceId] of liveBySource){
  if(!bySource.has(sourceId)) throw new Error(`comentario materializado sem sourceId na projecao: ${sourceId}`);
}

console.log(`OK: GitHub e projeção sincronizados; ${nodes.length} nós canônicos, ${liveByNode.size} materializados`);
