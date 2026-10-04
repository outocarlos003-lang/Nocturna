import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = process.cwd();
const skip = new Set([".git", ".github", "node_modules"]);
const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const full = join(dir, name), st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (name.toLowerCase() === "index.html") files.push(full);
  }
}
walk(root);

const css = `<style id="nocturna-neural-style">
#nocturna-neural-launcher{position:fixed;right:14px;bottom:14px;z-index:9999;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:min(94vw,430px)}
#nocturna-neural-launcher button,#nocturna-neural-launcher a{min-height:44px;padding:.62rem .78rem;border:1px solid #9c2d49;border-radius:8px;background:#7a1f35;color:#fff;font:600 .9rem system-ui,sans-serif;text-decoration:none;cursor:pointer;box-shadow:0 5px 18px #0008}
#nocturna-neural-launcher .nn-alt{background:#1c1b1d;border-color:#38333c;color:#e9e1cf}
#nocturna-neural-panel{position:fixed;inset:0;z-index:10000;background:#121212ee;backdrop-filter:blur(8px);display:none;overflow:auto;padding:clamp(1rem,4vw,2.5rem)}
#nocturna-neural-panel.open{display:block}
#nocturna-neural-card{max-width:72rem;margin:auto;background:#1c1b1d;border:1px solid #38333c;border-radius:12px;padding:1rem;box-shadow:0 18px 60px #0009}
#nocturna-neural-panel h2,#nocturna-neural-panel h3{font-family:Georgia,serif;color:#e9e1cf}
#nocturna-neural-search{display:flex;gap:.5rem;position:sticky;top:0;background:#1c1b1d;padding:.2rem 0 .8rem;z-index:2}
#nocturna-neural-search input{flex:1;min-height:46px;padding:.65rem .8rem;border:1px solid #38333c;border-radius:8px;background:#121212;color:#e9e1cf;font:1rem system-ui,sans-serif}
#nocturna-neural-search button{min-height:46px;border:1px solid #9c2d49;border-radius:8px;background:#7a1f35;color:#fff;padding:.6rem .9rem;font-weight:700}
.nn-breadcrumb{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;color:#b2aa98;font:.9rem system-ui,sans-serif;margin:.6rem 0 1rem}.nn-breadcrumb a{color:#e0bfae}.nn-sep{opacity:.55}
.nn-results{display:grid;gap:.65rem}.nn-result{display:block;padding:.8rem;border:1px solid #38333c;border-radius:8px;background:#121212;color:#e9e1cf;text-decoration:none}.nn-result:hover{border-color:#9c2d49}.nn-result strong{display:block;font-family:Georgia,serif}.nn-result small{display:block;color:#b2aa98;margin-top:.2rem;overflow-wrap:anywhere}.nn-empty{padding:1rem;border:1px dashed #38333c;border-radius:8px;color:#b2aa98}
.nn-related{display:flex;flex-wrap:wrap;gap:.45rem;margin:.6rem 0 1.2rem}.nn-related a{padding:.45rem .65rem;border:1px solid #38333c;border-radius:999px;color:#e0bfae;text-decoration:none;background:#121212}
@media(max-width:600px){#nocturna-neural-launcher{left:10px;right:10px;bottom:10px;justify-content:stretch}.nn-mobile-full{flex:1}#nocturna-neural-card{border-radius:8px}}
</style>`;

const js = `<script id="nocturna-neural-script">(()=>{
const root=new URL("/Nocturna/",location.origin),q=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])),norm=s=>String(s??"").toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"");
const rel=location.pathname.startsWith(root.pathname)?location.pathname.slice(root.pathname.length):location.pathname.replace(/^\\//,""),parts=rel.split("/").filter(Boolean),pathLabel=parts.map(x=>decodeURIComponent(x).replace(/[-_]+/g," ")).filter(x=>x!=="index.html");
const launcher=document.createElement("div");launcher.id="nocturna-neural-launcher";launcher.innerHTML='<button class="nn-mobile-full" id="nn-open">⌕ Pesquisa neural</button><a class="nn-alt" href="'+root.href+'">⌂ Núcleo</a><a class="nn-alt" href="'+new URL("explorar/",root).href+'">⇄ Explorar</a>';document.body.appendChild(launcher);
const panel=document.createElement("div");panel.id="nocturna-neural-panel";panel.innerHTML='<div id="nocturna-neural-card"><div id="nocturna-neural-search"><input id="nn-q" type="search" placeholder="Pesquisar em páginas, artigos, categorias, tags, pastas…" autocomplete="off" aria-label="Pesquisa neural transversal"><button id="nn-close" type="button">Fechar</button></div><div id="nn-bc"></div><section><h2>Pesquisa transversal</h2><p id="nn-status" class="nn-empty">Carregando índice semântico…</p><div id="nn-results" class="nn-results"></div></section><section><h3>Continuidade deste nó</h3><div id="nn-related" class="nn-related"></div></section></div></div>';document.body.appendChild(panel);
const open=()=>{panel.classList.add("open");q("#nn-q").focus()},close=()=>panel.classList.remove("open");q("#nn-open").onclick=open;q("#nn-close").onclick=close;panel.addEventListener("click",e=>{if(e.target===panel)close()});document.addEventListener("keydown",e=>{if(e.key==="Escape")close();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();open()}});
q("#nn-bc").innerHTML='<div class="nn-breadcrumb"><a href="'+root.href+'">Nocturna</a>'+pathLabel.map(p=>'<span class="nn-sep">›</span><span>'+esc(p)+"</span>").join("")+"</div>";
let graph=null,urls=[];
Promise.all([fetch(new URL("dados-neurais/grafo.json",root),{cache:"no-store"}).then(r=>r.ok?r.json():null),fetch(new URL("sitemap.xml",root),{cache:"no-store"}).then(r=>r.ok?r.text():"")]).then(([g,xml])=>{graph=g;try{const d=new DOMParser().parseFromString(xml,"application/xml");urls=[...d.querySelectorAll("loc")].map(x=>x.textContent.trim()).filter(Boolean)}catch{}renderRelated();render("")}).catch(()=>{q("#nn-status").textContent="O índice transversal não pôde ser carregado agora."});
function currentNode(){if(!graph?.nodes)return null;const here=location.href.replace(/\\/$/,"");return graph.nodes.find(n=>n.url&&String(n.url).replace(/\\/$/,"")===here)||null}
function renderRelated(){const box=q("#nn-related"),n=currentNode();if(!n||!graph?.edges){box.innerHTML='<span class="nn-empty">Este nó ainda não possui relações explícitas no grafo.</span>';return}const ids=new Set(graph.edges.filter(e=>e.from===n.id||e.to===n.id).map(e=>e.from===n.id?e.to:e.from));const nodes=graph.nodes.filter(x=>ids.has(x.id)&&x.url).slice(0,24);box.innerHTML=nodes.map(x=>'<a href="'+esc(x.url)+'">'+esc(x.label||x.id)+"</a>").join("")||'<span class="nn-empty">Nenhuma conexão adicional disponível.</span>'}
function render(term){const box=q("#nn-results"),status=q("#nn-status"),t=norm(term);let rows=[];if(graph?.nodes)rows=graph.nodes.filter(n=>n.url&&(!t||norm([n.label,n.type,n.id,n.source,JSON.stringify(n.record||"")].join(" ")).includes(t))).map(n=>({url:n.url,label:n.label||n.id,type:n.type,path:n.source||n.id}));if(!rows.length&&urls.length)rows=urls.filter(u=>!t||norm(u).includes(t)).map(u=>({url:u,label:decodeURIComponent(u).replace(/\\/$/,"").split("/").pop()||"Nocturna",type:"página",path:u}));rows=rows.slice(0,80);status.textContent=t?(rows.length+" resultado(s) encontrados"):(graph?((graph.nodes||[]).length+" nós disponíveis para rastreamento"):(urls.length+" URLs indexadas"));box.innerHTML=rows.map(r=>'<a class="nn-result" href="'+esc(r.url)+'"><strong>'+esc(r.label)+'</strong><small>'+esc(r.type||"conteúdo")+" · "+esc(r.path||r.url)+"</small></a>").join("")||'<div class="nn-empty">Nenhum conteúdo corresponde à pesquisa.</div>'}
q("#nn-q").addEventListener("input",e=>render(e.target.value));
})();</script>`;

const sourceIndex = readFileSync(join(root, "index.html"), "utf8");
const dataMatch = sourceIndex.match(/const DATA=(\\{[\\s\\S]*?\\});\\s*\\/\\*END DATA\\*\\//);
const editorialData = dataMatch ? vm.runInNewContext("(" + dataMatch[1] + ")") : { pubs: [] };
const articleById = new Map((editorialData.pubs || []).map(p => [p.id, p]));
const htmlEscape = s => String(s ?? "").replace(/[&<>\"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" }[c]));
const articleStaticHtml = p => {
  const paragraphs = String(p.content || "").split(/\\n\\n+/).map(x => x.trim()).filter(Boolean);
  const body = paragraphs.map(x => "<p>" + htmlEscape(x).replace(/\\n/g, "<br>") + "</p>").join("\\n");
  return "<article class=\"read\" data-ai-readable=\"full-article\"><p class=\"meta\">Publicação digital de leitura</p><h1 tabindex=\"0\">" + htmlEscape(p.title) + "</h1><div class=\"read-content\">" + body + "</div></article>";
};
const hydrateStaticArticle = (html, file) => {
  const m = file.replace(/\\\\/g, "/").match(/(?:^|\\/)artigos\\/([^/]+)\\/index\\.html$/);
  if (!m) return html;
  const p = articleById.get(decodeURIComponent(m[1]));
  if (!p || !p.content) return html;
  const staticArticle = articleStaticHtml(p);
  const mainPattern = /<main id="main"[^>]*>[\\s\\S]*?<\\/main>/i;
  if (mainPattern.test(html)) html = html.replace(mainPattern, "<main id=\"main\" class=\"wrap\">" + staticArticle + "</main>");
  const alt = '<link rel="alternate" type="text/plain" title="Conteúdo editorial integral" href="/Nocturna/llms-full.txt">';
  if (!html.includes('title="Conteúdo editorial integral"')) html = html.replace(/<\\/head>/i, alt + "</head>");
  return html;
};
let changed=0;
for(const file of files){
  let html=readFileSync(file,"utf8");
  // Pré-renderiza o corpo integral de artigos no HTML estático para leitores, indexadores e agentes que não executam JavaScript.
  html = hydrateStaticArticle(html, file);
  // Remove qualquer atalho público para o mapa, inclusive os que estejam embutidos em strings JavaScript.
  const before=html;
  html=html.replace(/<a\b[^>]*href=["'][^"']*mapa-neural[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,"");
  html=html.replace(/<a\b[^>]*>\s*Mapa\s+neural\s*<\/a>/gi,"");
  html=html.replace(/<button\b[^>]*>\s*Mapa\s+neural\s*<\/button>/gi,"");
  // Também impede que uma interface antiga o recrie dinamicamente.
  const guard=`<style id="nocturna-hide-neural-map">a[href*="mapa-neural"],button[data-neural-map],.neural-map-link{display:none!important}</style><script id="nocturna-hide-neural-map-script">(()=>{const hide=()=>{document.querySelectorAll('a[href*="mapa-neural"],button[data-neural-map],.neural-map-link').forEach(e=>e.remove());document.querySelectorAll('a,button').forEach(e=>{if(e.textContent.trim().toLocaleLowerCase('pt-BR')==='mapa neural')e.remove()})};const start=()=>{hide();new MutationObserver(hide).observe(document.documentElement,{subtree:true,childList:true})};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start()})();</script>`;
  if(!html.includes('nocturna-hide-neural-map-script')) html=html.replace(/<\/head>/i,guard+"</head>");
  if(!html.includes('id="nocturna-neural-script"')) html=html.replace(/<\/head>/i,css+"</head>").replace(/<\/body>/i,js+"</body>");
  if(html!==before){writeFileSync(file,html,"utf8");changed++}
}
console.log(`Camada neural atualizada em ${changed} páginas HTML; ${files.length} páginas HTML encontradas.`);
