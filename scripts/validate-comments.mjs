#!/usr/bin/env node
import fs from "node:fs";

const path=process.argv[2]||"data/comments/issue-1.json";
const data=JSON.parse(fs.readFileSync(path,"utf8"));
const errors=[];
const fail=(message)=>errors.push(message);
const nodes=Array.isArray(data.nodes)?data.nodes:[];
const ids=new Set();
const sourceIds=new Set();
const byId=new Map();

if(data.schema!=="nocturna.comment-tree/v1") fail("schema invalido");
if(data.repository!=="outocarlos003-lang/Nocturna") fail("repository invalido");
if(data.issue?.number!==1) fail("issue invalida");
if(!data.issue?.url) fail("issue.url ausente");
if(!data.issue?.rootNodeId) fail("issue.rootNodeId ausente");
if(!data.issue?.rootCommentId) fail("issue.rootCommentId ausente");
if(data.issue?.rootAuthor!=="Johan Liebert") fail("issue.rootAuthor deve ser Johan Liebert");
if(nodes.length===0) fail("nenhum no canonico");

for(const n of nodes){
  const id=String(n.nodeId);
  const sourceId=String(n.sourceId||"");
  if(!/^[0-9]+$/.test(id)) fail("nodeId invalido: "+n.nodeId);
  if(ids.has(id)) fail("nodeId duplicado: "+n.nodeId);
  if(!sourceId) fail("sourceId ausente em "+n.nodeId);
  if(sourceIds.has(sourceId)) fail("sourceId duplicado: "+sourceId);
  ids.add(id); sourceIds.add(sourceId); byId.set(id,n);
  if(!n.commentId) fail("commentId ausente em "+n.nodeId);
  if(!n.commentUrl) fail("commentUrl ausente em "+n.nodeId);
  if(typeof n.content!=="string") fail("content ausente em "+n.nodeId);
  if(!n.author?.displayName) fail("autoria ausente em "+n.nodeId);
  if(!Number.isInteger(n.depth)||n.depth<0) fail("depth invalido em "+n.nodeId);
  if(n.order!==undefined && (!Number.isInteger(n.order)||n.order<1)) fail("order invalido em "+n.nodeId);
}

const root=nodes.filter(n=>String(n.nodeId)===String(data.issue.rootNodeId));
if(root.length!==1) fail("raiz deve existir exatamente uma vez");
const rootNode=root[0];
if(rootNode?.parentNodeId!==null) fail("raiz possui pai");
if(rootNode?.depth!==0) fail("raiz deve ter depth 0");
if(rootNode?.author?.displayName!=="Johan Liebert") fail("raiz deve ser Johan Liebert");
if(String(rootNode?.commentId)!==String(data.issue.rootCommentId)) fail("rootCommentId nao corresponde ao comentario raiz");

const expectedGenealogy=new Map();
for(const node of nodes){
  const id=String(node.nodeId);
  const chain=[];
  const seen=new Set();
  let cursor=node;
  while(String(cursor.nodeId)!==String(data.issue.rootNodeId)){
    const cursorId=String(cursor.nodeId);
    if(seen.has(cursorId)){ fail("ciclo genealogico em "+node.nodeId); break; }
    seen.add(cursorId);
    chain.push(cursor);
    if(cursor.parentNodeId===null||cursor.parentNodeId===undefined){
      fail("no sem ancestral ate a raiz: "+node.nodeId);
      break;
    }
    cursor=byId.get(String(cursor.parentNodeId));
    if(!cursor){
      fail("pai inexistente: "+node.nodeId+" -> "+node.parentNodeId);
      break;
    }
  }
  if(!cursor || String(cursor.nodeId)!==String(data.issue.rootNodeId)) continue;
  const branchNodeId=chain.length?String(chain[chain.length-1].nodeId):null;
  const expected={
    rootNodeId:String(data.issue.rootNodeId),
    rootCommentId:data.issue.rootCommentId,
    branchNodeId,
    depth:chain.length
  };
  expectedGenealogy.set(id,expected);
  if(node.depth!==expected.depth) fail("depth incoerente: "+node.nodeId);
  if(node.rootNodeId!==undefined && String(node.rootNodeId)!==expected.rootNodeId) fail("rootNodeId incoerente: "+node.nodeId);
  if(node.rootCommentId!==undefined && String(node.rootCommentId)!==String(expected.rootCommentId)) fail("rootCommentId incoerente: "+node.nodeId);
  if(node.branchNodeId!==undefined && String(node.branchNodeId)!==String(expected.branchNodeId)) fail("branchNodeId incoerente: "+node.nodeId);

  if(String(node.nodeId)===String(data.issue.rootNodeId)) continue;
  const parent=byId.get(String(node.parentNodeId));
  if(!parent) continue;
  if(String(parent.nodeId)===String(node.nodeId)) fail("auto-pai: "+node.nodeId);
  if(String(node.parentCommentId)!==String(parent.commentId)) fail("parentCommentId incoerente: "+node.nodeId);
  if(node.parentAuthor!==parent.author.displayName) fail("parentAuthor incoerente: "+node.nodeId);
}

const childrenByParent=new Map();
for(const n of nodes){
  const key=String(n.parentNodeId===null?"root":n.parentNodeId);
  if(!childrenByParent.has(key)) childrenByParent.set(key,[]);
  childrenByParent.get(key).push(n);
}
for(const [parentId,children] of childrenByParent){
  const withOrder=children.filter(n=>Number.isInteger(n.order));
  if(withOrder.length && withOrder.length!==children.length) fail("ordem parcial entre irmaos do pai "+parentId);
  const sorted=withOrder.slice().sort((a,b)=>a.order-b.order);
  for(let i=1;i<sorted.length;i++) if(sorted[i].order===sorted[i-1].order) fail("ordem duplicada entre "+sorted[i-1].nodeId+" e "+sorted[i].nodeId);
}

const numeric=nodes.map(n=>Number(n.nodeId)).sort((a,b)=>a-b);
for(let i=0;i<numeric.length;i++) if(numeric[i]!==i+1) fail("IDs historicos devem formar serie 1..N; encontrado "+numeric.join(","));

if(errors.length){ console.error("FALHAS:\n"+errors.join("\n")); process.exit(1); }
console.log("OK: "+nodes.length+" nos; raiz "+data.issue.rootNodeId+" / comment "+data.issue.rootCommentId+"; proximo "+data.identity.nextNodeId);
