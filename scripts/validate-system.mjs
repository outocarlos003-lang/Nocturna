#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const errors=[];
const fail=(m)=>errors.push(m);
const exists=(p)=>fs.existsSync(path.join(root,p));

const files=[];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if([".git","node_modules"].includes(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else files.push(full);
  }
}
walk(root);

const htmlFiles=files.filter(p=>p.endsWith(".html"));
for(const file of htmlFiles){
  const rel=path.relative(root,file).replaceAll(path.sep,"/");
  const html=fs.readFileSync(file,"utf8");
  for(const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)){
    const ref=match[1].trim();
    if(!ref||ref.includes("${")||ref.startsWith("#")||/^(?:https?:|mailto:|tel:|data:|javascript:|blob:)/i.test(ref)) continue;
    const clean=ref.split(/[?#]/,1)[0];
    if(!clean) continue;
    let target;
    if(clean.startsWith("/Nocturna/")) target=clean.slice("/Nocturna/".length);
    else if(clean.startsWith("/")) target=clean.slice(1);
    else target=path.posix.normalize(path.posix.join(path.posix.dirname(rel),clean));
    if(target==="") target="index.html";
    if(!exists(target)&&!exists(target.replace(/\/$/,"/index.html"))&&/\.[A-Za-z0-9]+$/.test(target)){
      fail(`${rel}: referência local ausente -> ${ref}`);
    }
  }
}

for(const p of [
  "manifest.webmanifest","robots.txt","sitemap.xml","icon.svg",
  "index.html","404.html","wrangler.jsonc","index.js","data/comments/issue-1.json"
]) if(!exists(p)) fail(`arquivo estrutural ausente: ${p}`);

const manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.webmanifest"),"utf8"));
for(const icon of manifest.icons||[]){
  const p=icon.src.replace(/^\/Nocturna\//,"").replace(/^\//,"");
  if(!exists(p)) fail(`manifest: ícone ausente -> ${icon.src}`);
}

const wranglerText=fs.readFileSync(path.join(root,"wrangler.jsonc"),"utf8").replace(/^\s*\/\/.*$/gm,"");
const wrangler=JSON.parse(wranglerText);
if(wrangler.main&&!exists(wrangler.main)) fail(`wrangler: main ausente -> ${wrangler.main}`);

const workflowDir=path.join(root,".github/workflows");
if(fs.existsSync(workflowDir)){
  for(const name of fs.readdirSync(workflowDir).filter(x=>/\.ya?ml$/.test(x))){
    const yml=fs.readFileSync(path.join(workflowDir,name),"utf8");
    for(const match of yml.matchAll(/node\s+([\\w./-]+\.mjs)/g)){
      if(!exists(match[1])) fail(`${name}: script de workflow ausente -> ${match[1]}`);
    }
  }
}

const projection=JSON.parse(fs.readFileSync(path.join(root,"data/comments/issue-1.json"),"utf8"));
if(projection.issue?.rootNodeId&&!projection.nodes.some(n=>String(n.nodeId)===String(projection.issue.rootNodeId))){
  fail("projeção: issue.rootNodeId sem nó correspondente");
}

if(errors.length){
  console.error("FALHAS:\n"+errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${files.length} arquivos; ${htmlFiles.length} HTMLs; referências estruturais verificadas.`);
