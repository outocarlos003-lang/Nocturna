// Uso: node sitemap.mjs https://outocarlos003-lang.github.io/Nocturna/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import vm from "node:vm";

const base = process.argv[2];
if (!/^https?:\/\/[^/]+(?:\/[^/]*)*\/$/.test(base || "")) {
  console.error("Informe a URL pública real terminando em /");
  process.exit(1);
}

const root = process.cwd();
const source = readFileSync(join(root, "index.html"), "utf8");
const m = source.match(/const DATA=(\{[\s\S]*?\});\s*\/\*END DATA\*\//);
if (!m) throw new Error("DATA editorial não encontrada em index.html");
const DATA = vm.runInNewContext("(" + m[1] + ")");
const editorialSource = {
  file: "index.html",
  selector: "DATA",
  principle: "single-source-of-truth"
};
if (!Array.isArray(DATA.pubs) || !Array.isArray(DATA.cats)) {
  throw new Error("DATA editorial inválida: pubs e cats precisam existir em index.html");
}
for (const p of DATA.pubs) {
  if (!p?.id || !p?.title || typeof p?.content !== "string") {
    throw new Error("Publicação inválida em index.html: cada DATA.pubs precisa de id, title e content.");
  }
}
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const abs = p => base + p.replace(/^\//,"");
const catPath = c => "/categorias/" + encodeURIComponent(c.slug) + "/";
const tagPath = t => "/tags/" + encodeURIComponent(t) + "/";
const pubPath = p => "/artigos/" + encodeURIComponent(p.id) + "/";

function page(route, title, description, body, ld) {
  let html = source;
  html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>"+esc(title)+"</title>");
  html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="'+esc(description)+'">');
  html = html.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="'+esc(title)+'">');
  html = html.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="'+esc(description)+'">');
  html = html.replace("</head>", '<meta name="robots" content="index,follow"><meta name="author" content="Riquelmi"><meta property="og:url" content="'+esc(abs(route))+'"><meta name="twitter:title" content="'+esc(title)+'"><meta name="twitter:description" content="'+esc(description)+'"></head>');
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '<script type="application/ld+json">'+JSON.stringify(ld)+'</script>');
  html = html.replace("</head>", '<link rel="canonical" href="'+esc(abs(route))+'"><script>window.__STATIC_ROUTE='+JSON.stringify(route.replace(/\/$/,""))+';</script></head>');
  return html.replace('<main id="main" class="wrap"></main>', '<main id="main" class="wrap">'+body+"</main>");
}
function writeRoute(route, title, description, body, ld) {
  const file = join(root, route.replace(/^\//,""), "index.html");
  mkdirSync(dirname(file), {recursive:true});
  writeFileSync(file, page(route,title,description,body,ld), "utf8");
  return route;
}
function cards(items) {
  if (!items.length) return '<p class="empty">Nenhum conteúdo disponível.</p>';
  return '<ul class="grid">'+items.map(p =>
    '<li class="card"><h2><a href="'+abs(pubPath(p))+'">'+esc(p.title)+'</a></h2>'+
    (p.summary?'<p>'+esc(p.summary)+'</p>':'')+
    '<small>'+(p.date?esc(p.date)+" · ":"")+
    (p.cats||[]).map(id=>DATA.cats.find(c=>c.id===id)).filter(Boolean).map(c=>'<a href="'+abs(catPath(c))+'">'+esc(c.name)+'</a>').join(" · ")+
    '</small></li>'
  ).join("")+"</ul>";
}

const routes = ["/"];
writeRoute("/artigos/","Artigos — Nocturna","Todas as publicações da Nocturna.",'<h1>Artigos</h1>'+cards(DATA.pubs),{"@context":"https://schema.org","@type":"CollectionPage","name":"Artigos — Nocturna","url":abs("/artigos/")});
// Alias editorial rastreável: Publicações aponta para o mesmo acervo de Artigos.
writeRoute("/publicacoes/","Publicações — Nocturna","Todas as publicações da Nocturna.",'<h1>Publicações</h1>'+cards(DATA.pubs),{"@context":"https://schema.org","@type":"CollectionPage","name":"Publicações — Nocturna","url":abs("/publicacoes/")});

writeRoute("/categorias/","Categorias — Nocturna","Categorias editoriais da Nocturna.",'<h1>Categorias</h1><ul class="grid">'+DATA.cats.map(c=>'<li class="card"><h2><a href="'+abs(catPath(c))+'">'+esc(c.name)+'</a></h2><p>'+esc(c.description||"Publicações da categoria "+c.name+" na Nocturna.")+'</p></li>').join("")+"</ul>",{"@context":"https://schema.org","@type":"CollectionPage","name":"Categorias — Nocturna","url":abs("/categorias/")});
routes.push("/artigos/","/categorias/");

const tags=[...new Set(DATA.pubs.flatMap(p=>p.tags||[]))].sort((a,b)=>a.localeCompare(b,"pt"));
writeRoute("/tags/","Tags — Nocturna","Tags editoriais da Nocturna.",'<h1>Tags</h1><ul class="grid">'+tags.map(t=>'<li class="card"><h2><a href="'+abs(tagPath(t))+'">'+esc(t)+'</a></h2><small>'+DATA.pubs.filter(p=>(p.tags||[]).includes(t)).length+' publicação(ões)</small></li>').join("")+"</ul>",{"@context":"https://schema.org","@type":"CollectionPage","name":"Tags — Nocturna","url":abs("/tags/")});
routes.push("/tags/");

for (const c of DATA.cats) {
  const items=DATA.pubs.filter(p=>(p.cats||[]).includes(c.id));
  routes.push(writeRoute(catPath(c),c.name+" — Nocturna",c.description||"Publicações da categoria "+c.name+" na Nocturna.",
    '<h1>'+esc(c.name)+'</h1>'+cards(items),{"@context":"https://schema.org","@type":"CollectionPage","name":c.name,"url":abs(catPath(c))}));
}
for (const t of tags) {
  const items=DATA.pubs.filter(p=>(p.tags||[]).includes(t));
  routes.push(writeRoute(tagPath(t),"Tag: "+t+" — Nocturna","Publicações marcadas com "+t+" na Nocturna.",
    '<h1>Tag: '+esc(t)+'</h1>'+cards(items),{"@context":"https://schema.org","@type":"CollectionPage","name":"Tag: "+t,"url":abs(tagPath(t))}));
}
const years=[...new Set(DATA.pubs.filter(p=>p.date).map(p=>p.date.slice(0,4)))].sort((a,b)=>b.localeCompare(a));
const archiveBody='<h1>Arquivo</h1><p class="meta">Arquivo cronológico das publicações da Nocturna.</p>'+years.map(y=>'<section><h2>'+y+'</h2>'+cards(DATA.pubs.filter(p=>p.date&&p.date.startsWith(y)))+'</section>').join("");
const core = [
  ["/arquivo/","Arquivo — Nocturna","Arquivo cronológico das publicações da Nocturna.",archiveBody],
  ["/sobre/","Sobre — Nocturna","Sobre a Nocturna, publicação digital de leitura.",
   '<h1>Sobre</h1><div class="read"><p>A Nocturna é uma publicação digital organizada em cinco categorias: Metafísica, Teologia, Ficção, Psicologia e Filosofia. By Riquelmi.</p></div>'],
  ["/faq/","FAQ — Nocturna","Perguntas frequentes sobre a Nocturna.",
   '<h1>FAQ</h1><details open><summary>O que é a Nocturna?</summary><p>Uma publicação digital de leitura organizada em cinco categorias.</p></details><details><summary>Como pesquisar?</summary><p>Use o campo de pesquisa do site.</p></details><details><summary>O site coleta dados?</summary><p>Não. Veja Privacidade e cookies.</p></details>'],
  ["/contato/","Contato — Nocturna","Contato da Nocturna.",
   '<h1>Contato</h1><p>Use a página de Contato da Nocturna para iniciar uma mensagem.</p>'],
  ["/privacidade/","Privacidade e cookies — Nocturna","Como a Nocturna trata dados, cookies e armazenamento.",
   '<h1>Privacidade e cookies</h1><div class="read"><p>Este site não usa cookies, não grava dados no navegador e não carrega scripts, fontes ou imagens de terceiros. O formulário de contato não envia dados a nenhum servidor: apenas abre seu aplicativo de e-mail.</p></div>']
];
for (const [route,title,description,body] of core) {
  routes.push(writeRoute(route,title,description,body,{"@context":"https://schema.org","@type":"WebPage","name":title.replace(" — Nocturna",""),"description":description,"url":abs(route)}));
}

for (const p of DATA.pubs) {
  const cats=(p.cats||[]).map(id=>DATA.cats.find(c=>c.id===id)).filter(Boolean);
  const related=DATA.pubs.filter(x=>x.id!==p.id&&(((x.cats||[]).some(c=>(p.cats||[]).includes(c)))||((x.tags||[]).some(t=>(p.tags||[]).includes(t))))).slice(0,4);
  const body='<article class="read"><h1>'+esc(p.title)+'</h1>'+
    (p.image?'<figure><img src="'+esc(abs("/"+p.image.src.replace(/^\//,"")))+'" alt="'+esc(p.image.alt)+'" loading="eager" style="display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:8px"><figcaption class="meta">'+esc(p.image.caption)+'</figcaption></figure>':'')+
    '<p class="meta">'+cats.map(c=>'<a href="'+abs(catPath(c))+'">'+esc(c.name)+'</a>').join(" · ")+((p.tags||[]).length?" · "+p.tags.map(t=>'<a href="'+abs(tagPath(t))+'">'+esc(t)+'</a>').join(" · "):"")+'</p>'+
    '<div class="read-content" style="white-space:pre-wrap">'+esc(p.content||"")+'</div>'+
    (related.length?'<section><h2>Relacionados</h2>'+cards(related)+"</section>":"")+'</article>';
  const articleText = String(p.content || "");
  const articleLd = {
    "@context":"https://schema.org",
    "@type":"Article",
    "headline":p.title,
    "description":p.summary||undefined,
    "datePublished":p.date||undefined,
    "dateModified":p.date||undefined,
    "author":{"@type":"Person","name":"Riquelmi"},
    "publisher":{"@type":"Organization","name":"Nocturna"},
    "mainEntityOfPage":abs(pubPath(p)),
    "url":abs(pubPath(p)),
    "articleBody":articleText,
    "wordCount":articleText.trim()?articleText.trim().split(/\s+/u).length:0,
    "keywords":(p.tags||[]).join(", "),
    "inLanguage":"pt-BR",
    "image":p.image?abs("/"+p.image.src.replace(/^\//,"")):undefined
  };
  routes.push(writeRoute(pubPath(p),p.title+" — Nocturna",p.summary||p.title,body,articleLd));
}

const all=[...new Set(["/",...routes])];
const today=new Date().toISOString().slice(0,10);
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
  all.map(u=>'  <url><loc>'+esc(abs(u))+'</loc><lastmod>'+today+'</lastmod></url>').join("\n")+"\n</urlset>\n";
writeFileSync(join(root,"sitemap.xml"),xml,"utf8");
writeFileSync(join(root,"robots.txt"),"User-agent: *\nAllow: /\nSitemap: "+abs("/sitemap.xml")+"\n","utf8");
console.log("Fonte editorial única: "+editorialSource.file+" ("+editorialSource.selector+").");
console.log("Rastreamento/indexação: "+all.length+" URLs públicas no sitemap.");
