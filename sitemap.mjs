// Uso: node sitemap.mjs https://outocarlos003-lang.github.io/Nocturna/
import { readFileSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import vm from "node:vm";

const base = process.argv[2];
if (!/^https?:\/\/[^/]+(?:\/[^/]*)*\/$/.test(base || "")) {
  console.error("Informe uma URL pública real terminando em /");
  process.exit(1);
}
const root = process.cwd();
const source = readFileSync(join(root, "index.html"), "utf8");
const m = source.match(/const DATA=(\{[\s\S]*?\});\s*\/\*END DATA\*\//);
if (!m) throw new Error("DATA editorial não encontrada em index.html");
const DATA = vm.runInNewContext("(" + m[1] + ")");
if (!Array.isArray(DATA.pubs) || !Array.isArray(DATA.cats)) throw new Error("DATA editorial inválida.");
for (const p of DATA.pubs) {
  if (!p?.id || !p?.title || typeof p?.content !== "string") throw new Error("Publicação inválida em index.html.");
}
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const abs = p => base.replace(/\/$/, "") + "/" + p.replace(/^\//, "");
const catPath = c => "/categorias/" + encodeURIComponent(c.slug) + "/";
const tagPath = t => "/tags/" + encodeURIComponent(t) + "/";
const pubPath = p => "/artigos/" + encodeURIComponent(p.id) + "/";
const routeShell = (route, title, description) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(abs(route))}"><title>${esc(title)}</title><script>const root="/Nocturna/";const route=${JSON.stringify(route)};location.replace(root+"#"+route+location.search);</script></head><body><main><p>Carregando Nocturna…</p><noscript><p>Ative JavaScript para abrir esta rota no núcleo editorial.</p><p><a href="${esc(base+"#"+route)}">Abrir</a></p></noscript></main></body></html>`;

const generatedRoots = ["artigos","publicacoes","buscar","categorias","tags","arquivo","sobre","faq","contato","privacidade","series"];
for (const dir of generatedRoots) rmSync(join(root, dir), {recursive:true, force:true});

const routes = new Map();
const add = (route,title,description) => routes.set(route,{title,description});
add("/artigos/","Artigos — Nocturna","Todas as publicações da Nocturna.");
add("/publicacoes/","Publicações — Nocturna","Todas as publicações da Nocturna.");
add("/buscar/","Buscar — Nocturna","Pesquisa no acervo da Nocturna.");
add("/categorias/","Categorias — Nocturna","Categorias editoriais da Nocturna.");
add("/tags/","Tags — Nocturna","Tags editoriais da Nocturna.");
const tags=[...new Set(DATA.pubs.flatMap(p=>p.tags||[]))].sort((a,b)=>a.localeCompare(b,"pt"));
for(const c of DATA.cats) add(catPath(c),c.name+" — Nocturna",c.description||"Publicações da categoria "+c.name+" na Nocturna.");
for(const t of tags) add(tagPath(t),"Tag: "+t+" — Nocturna","Publicações marcadas com "+t+" na Nocturna.");
add("/arquivo/","Arquivo — Nocturna","Arquivo cronológico das publicações da Nocturna.");
add("/sobre/","Sobre — Nocturna","Sobre a Nocturna, publicação digital de leitura.");
add("/faq/","FAQ — Nocturna","Perguntas frequentes sobre a Nocturna.");
add("/contato/","Contato — Nocturna","Contato da Nocturna.");
add("/privacidade/","Privacidade e cookies — Nocturna","Como a Nocturna trata dados, cookies e armazenamento.");
for(const p of DATA.pubs) add(pubPath(p),p.title+" — Nocturna",p.summary||p.title);
const seriesPath = s => "/series/" + encodeURIComponent(s.slug) + "/";
const blockPath = (s,b) => seriesPath(s) + encodeURIComponent(b.slug) + "/";
const chapterPath = (s,b,c) => blockPath(s,b) + encodeURIComponent(c.slug) + "/";
for(const s of DATA.series||[]){
  add(seriesPath(s),s.title+" — Nocturna",s.summary||s.title);
  for(const b of s.blocks||[]){
    add(blockPath(s,b),b.title+" — Nocturna",b.summary||b.title);
    for(const c of b.chapters||[]) add(chapterPath(s,b,c),c.title+" — Nocturna",c.summary||c.title);
  }
}
for(const [route,meta] of routes){
  const file=join(root,route.replace(/^\//,""),"index.html");
  mkdirSync(dirname(file),{recursive:true});
  writeFileSync(file,routeShell(route,meta.title,meta.description),"utf8");
}
const all=["/",...routes.keys()];
const today=new Date().toISOString().slice(0,10);
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+all.map(u=>'  <url><loc>'+esc(abs(u))+'</loc><lastmod>'+today+'</lastmod></url>').join("\n")+"\n</urlset>\n";
writeFileSync(join(root,"sitemap.xml"),xml,"utf8");
writeFileSync(join(root,"robots.txt"),"User-agent: *\nAllow: /\nSitemap: "+abs("/sitemap.xml")+"\n","utf8");
console.log("Fonte editorial única: index.html:DATA.");
console.log("Cascas mínimas: "+routes.size+"; cópias editoriais fora do núcleo: 0.");
console.log("Sitemap: "+all.length+" URLs públicas.");
