#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const dir=fs.mkdtempSync(path.join(os.tmpdir(),"nocturna-genealogy-"));
const fixture=path.join(dir,"issue-1.json");
const base={
  schema:"nocturna.comment-tree/v1",
  repository:"outocarlos003-lang/Nocturna",
  issue:{number:1,url:"https://github.com/outocarlos003-lang/Nocturna/issues/1",rootNodeId:"1",rootCommentId:100,rootAuthor:"Johan Liebert"},
  identity:{nextNodeId:3},
  nodes:[
    {nodeId:"1",sourceId:"root",commentId:100,commentUrl:"https://github.com/x#issuecomment-100",content:"root",author:{displayName:"Johan Liebert"},parentNodeId:null,depth:0,rootNodeId:"1",rootCommentId:100,branchNodeId:null,order:1},
    {nodeId:"2",sourceId:"child",commentId:101,commentUrl:"https://github.com/x#issuecomment-101",content:"child",author:{displayName:"A"},parentNodeId:"1",parentCommentId:100,parentAuthor:"Johan Liebert",depth:1,rootNodeId:"1",rootCommentId:100,branchNodeId:"2",order:2}
  ]
};

const run=(data)=>{
  fs.writeFileSync(fixture,JSON.stringify(data,null,2));
  return spawnSync(process.execPath,["scripts/validate-comments.mjs",fixture],{encoding:"utf8"});
};
const expectPass=(name,data)=>{
  const result=run(data);
  if(result.status!==0) throw new Error(`${name} deveria passar:\n${result.stderr}`);
};
const expectFail=(name,data,needle)=>{
  const result=run(data);
  if(result.status===0) throw new Error(`${name} deveria falhar`);
  if(needle && !String(result.stderr).includes(needle)) throw new Error(`${name} falhou pelo motivo errado:\n${result.stderr}`);
};

expectPass("árvore válida",base);
const cycle=structuredClone(base);
cycle.nodes[1].parentNodeId="2";
expectFail("ciclo",cycle,"ciclo genealogico");
const orphan=structuredClone(base);
 orphan.nodes[1].parentNodeId="999";
expectFail("pai ausente",orphan,"pai inexistente");
const duplicateSource=structuredClone(base);
duplicateSource.nodes[1].sourceId="root";
expectFail("sourceId duplicado",duplicateSource,"sourceId duplicado");
const wrongDepth=structuredClone(base);
wrongDepth.nodes[1].depth=9;
expectFail("depth divergente",wrongDepth,"depth incoerente");

fs.rmSync(dir,{recursive:true,force:true});
console.log("OK: invariantes genealógicas cobrem árvore válida, ciclo, órfão, identidade duplicada e profundidade divergente");
