#!/usr/bin/env node
import fs from "node:fs";

const path=process.argv[2]||"data/comments/issue-5.json";
const data=JSON.parse(fs.readFileSync(path,"utf8"));
const errors=[];
const fail=(message)=>errors.push(message);
const nodes=Array.isArray(data.nodes)?data.nodes:[];
const ids=new Set();

if(data.schema!=="nocturna.comment-tree/v1") fail("schema invalido");
if(data.repository!=="outocarlos003-lang/Nocturna") fail("repository invalido");
if(data.issue?.number!==5) fail("issue invalida");
if(!data.issue?.url) fail("issue.url ausente");
if(!data.issue?.rootNodeId) fail("issue.rootNodeId ausente");
if(nodes.length===0) fail("nenhum no canonico");

for(const n of nodes){
  if(!/^[0-9]+$/.test(String(n.nodeId))) fail("nodeId invalido: "+n.nodeId);
  if(ids.has(String(n.nodeId))) fail("nodeId duplicado: "+n.nodeId);
  ids.add(String(n.nodeId));
  if(!n.sourceId) fail("sourceId ausente em "+n.nodeId);
  if(!n.commentUrl) fail("commentUrl ausente em "+n.nodeId);
  if(typeof n.content!=="string") fail("content ausente em "+n.nodeId);
  if(!n.author?.displayName) fail("autoria ausente em "+n.nodeId);
  if(!Number.isInteger(n.depth)||n.depth<0) fail("depth invalido em "+n.nodeId);
  if(!Number.isInteger(n.order)||n.order<1) fail("order invalido em "+n.nodeId);
}
const root=nodes.filter(n=>String(n.nodeId)===String(data.issue.rootNodeId));
if(root.length!==1) fail("raiz deve existir exatamente uma vez");
if(root[0]?.parentNodeId!==null) fail("raiz possui pai");
if(root[0]?.depth!==0) fail("raiz deve ter depth 0");

for(const n of nodes){
  if(String(n.nodeId)===String(data.issue.rootNodeId)) continue;
  if(n.parentNodeId===null||n.parentNodeId===undefined) fail("no sem pai: "+n.nodeId);
  const p=nodes.find(x=>String(x.nodeId)===String(n.parentNodeId));
  if(!p) fail("pai inexistente: "+n.nodeId+" -> "+n.parentNodeId);
  else {
    if(String(p.nodeId)===String(n.nodeId)) fail("auto-pai: "+n.nodeId);
    if(n.depth!==p.depth+1) fail("depth incoerente: "+n.nodeId);
    if(String(n.parentCommentId)!==String(p.commentId)) fail("parentCommentId incoerente: "+n.nodeId);
    if(n.parentAuthor!==p.author.displayName) fail("parentAuthor incoerente: "+n.nodeId);
  }
}
const sorted=nodes.slice().sort((a,b)=>a.order-b.order);
for(let i=1;i<sorted.length;i++) if(sorted[i].order!==sorted[i-1].order+1) fail("ordem nao monotona entre "+sorted[i-1].nodeId+" e "+sorted[i].nodeId);
const numeric=nodes.map(n=>Number(n.nodeId)).sort((a,b)=>a-b);
for(let i=0;i<numeric.length;i++) if(numeric[i]!==i+1) fail("IDs historicos devem formar serie 1..N; encontrado "+numeric.join(","));

if(errors.length){ console.error("FALHAS:\n"+errors.join("\n")); process.exit(1); }
console.log("OK: "+nodes.length+" nos; raiz "+data.issue.rootNodeId+"; proximo "+data.identity.nextNodeId);
