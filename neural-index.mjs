// Gera uma camada semântica completa para rastrear o conteúdo da Nocturna por relações, não apenas por palavras-chave.
// Fonte canônica: DATA editorial de index.html. Nenhum campo de DATA é descartado.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const base = process.argv[2] || "https://outocarlos003-lang.github.io/Nocturna/";
const root = process.cwd();
const source = readFileSync(join(root, "index.html"), "utf8");
const m = source.match(/const DATA=(\{[\s\S]*?\});\s*\/\*END DATA\*\//);
if (!m) throw new Error("DATA editorial não encontrada em index.html");
const DATA = vm.runInNewContext("(" + m[1] + ")");
const abs = p => base.replace(/\/$/, "") + "/" + p.replace(/^\//, "");
const esc = s => String(s ?? "").replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));

const nodes = [];
const edges = [];
const addNode = (id, type, label, data = {}) => nodes.push({ id, type, label, ...data });
const addEdge = (from, to, relation, data = {}) => edges.push({ from, to, relation, ...data });

addNode("site:nocturna", "site", DATA.site?.name || "Nocturna", { source: "index.html:DATA.site" });
addNode("page:home", "page", "Página inicial", { url: abs("/") });
addEdge("site:nocturna", "page:home", "contains");

if (DATA.site) addEdge("page:home", "site:nocturna", "identifies");
if (DATA.contact) {
  addNode("contact:primary", "contact", "Contato", { data: DATA.contact });
  addEdge("site:nocturna", "contact:primary", "has-contact");
}

for (const c of DATA.cats || []) {
  const id = "category:" + c.id;
  addNode(id, "category", c.name, { slug: c.slug, description: c.description ?? null, source: "index.html:DATA.cats" });
  addEdge("site:nocturna", id, "has-category");
}

const tagMap = new Map();
for (const p of DATA.pubs || []) {
  const pid = "article:" + p.id;
  addNode(pid, "article", p.title, {
    url: abs("artigos/" + encodeURIComponent(p.id) + "/"),
    source: "index.html:DATA.pubs[" + p.id + "]",
    // Cópia integral do registro editorial. Isto preserva inclusive campos futuros adicionados ao DATA.
    record: p
  });
  addEdge("site:nocturna", pid, "publishes");
  if (p.date) addEdge(pid, "time:" + p.date, "dated");
  for (const cid of p.cats || []) {
    const c = (DATA.cats || []).find(x => x.id === cid);
    if (!c) continue;
    const id = "category:" + c.id;
    addEdge(pid, id, "classified-as");
  }
  for (const tag of p.tags || []) {
    const tid = "tag:" + tag;
    if (!tagMap.has(tag)) {
      tagMap.set(tag, tid);
      addNode(tid, "tag", tag, { url: abs("tags/" + encodeURIComponent(tag) + "/") });
      addEdge("site:nocturna", tid, "uses-tag");
    }
    addEdge(pid, tid, "tagged-with");
  }
  if (p.image?.src) {
    const iid = "image:" + p.id;
    addNode(iid, "image", p.image.caption || p.image.alt || p.id, { url: abs(p.image.src), alt: p.image.alt || "" });
    addEdge(pid, iid, "illustrated-by");
  }
}

for (const p of DATA.pubs || []) {
  const pid = "article:" + p.id;
  const related = (DATA.pubs || []).filter(x => x.id !== p.id && (
    (x.cats || []).some(c => (p.cats || []).includes(c)) ||
    (x.tags || []).some(t => (p.tags || []).includes(t))
  ));
  for (const x of related) addEdge(pid, "article:" + x.id, "semantically-related");
}

for (const p of DATA.pubs || []) if (p.date) {
  const tid = "time:" + p.date;
  if (!nodes.some(n => n.id === tid)) addNode(tid, "date", p.date, { url: abs("arquivo/") });
  addEdge("site:nocturna", tid, "has-publication-date");
}

// Páginas institucionais também entram no grafo, para que a navegação não dependa apenas do acervo editorial.
const pages = [
  ["page:artigos", "Artigos", "artigos/", "collection"],
  ["page:categorias", "Categorias", "categorias/", "taxonomy"],
  ["page:tags", "Tags", "tags/", "taxonomy"],
  ["page:arquivo", "Arquivo", "arquivo/", "archive"],
  ["page:sobre", "Sobre", "sobre/", "about"],
  ["page:faq", "FAQ", "faq/", "faq"],
  ["page:contato", "Contato", "contato/", "contact"],
  ["page:privacidade", "Privacidade e cookies", "privacidade/", "privacy"]
];
for (const [id, label, path, type] of pages) {
  addNode(id, "page", label, { url: abs(path), pageType: type });
  addEdge("site:nocturna", id, "has-page");
}

const graph = {
  schema: "nocturna-neural-graph/v1",
  generatedAt: new Date().toISOString(),
  source: { file: "index.html", selector: "DATA", principle: "lossless-record-preservation" },
  semantics: {
    nodeTypes: ["site", "page", "category", "article", "tag", "image", "date", "contact"],
    edgeRelations: ["contains", "identifies", "has-contact", "has-category", "publishes", "dated", "classified-as", "uses-tag", "tagged-with", "illustrated-by", "semantically-related", "has-publication-date", "has-page"],
    note: "O grafo mantém cada registro editorial completo em article.record; relações são adicionais e não substituem o conteúdo original."
  },
  sourceData: DATA,
  nodes,
  edges
};

mkdirSync(join(root, "dados-neurais"), { recursive: true });
writeFileSync(join(root, "dados-neurais", "grafo.json"), JSON.stringify(graph, null, 2) + "\n", "utf8");

const articleCount = (DATA.pubs || []).length;
const categoryCount = (DATA.cats || []).length;
const tagCount = tagMap.size;
const articleLinks = edges.filter(e => e.relation === "semantically-related").length;
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mapa neural — Nocturna</title><meta name="description" content="Mapa semântico rastreável da Nocturna: publicações, categorias, tags, datas, imagens e relações editoriais."><link rel="canonical" href="${esc(abs("mapa-neural/"))}"><style>body{margin:0;background:#121212;color:#e9e1cf;font:16px/1.65 system-ui,sans-serif}main{max-width:72rem;margin:auto;padding:2rem 1.25rem}a{color:#e0bfae}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:1rem}.card{background:#1c1b1d;border:1px solid #38333c;border-radius:8px;padding:1rem}.muted{color:#b2aa98}.path{font-family:ui-monospace,monospace;font-size:.9em;overflow-wrap:anywhere}summary{cursor:pointer;padding:.6rem 0}code{background:#1c1b1d;padding:.15rem .35rem;border-radius:4px}</style></head><body><main><p><a href="${esc(abs("/"))}">← Nocturna</a></p><h1>Mapa neural</h1><p>Esta página expõe as relações que permitem percorrer o acervo por múltiplos caminhos semânticos. O conteúdo editorial original permanece integralmente preservado no <code>grafo.json</code>.</p><div class="grid"><div class="card"><strong>${articleCount}</strong><br>publicações</div><div class="card"><strong>${categoryCount}</strong><br>categorias</div><div class="card"><strong>${tagCount}</strong><br>tags</div><div class="card"><strong>${articleLinks}</strong><br>relações semânticas entre artigos</div><div class="card"><strong>${nodes.length}</strong><br>nós no grafo</div><div class="card"><strong>${edges.length}</strong><br>arestas no grafo</div></div><h2>Como rastrear</h2><ol><li>Comece por uma publicação e siga <code>classified-as</code> para categorias.</li><li>Siga <code>tagged-with</code> para conceitos editoriais compartilhados.</li><li>Siga <code>semantically-related</code> para artigos relacionados por categorias ou tags.</li><li>Consulte <code>dated</code> e o <a href="${esc(abs("arquivo/"))}">arquivo</a> para a dimensão temporal.</li><li>Use o JSON para consumo por agentes, indexadores, buscadores e sistemas de recuperação semântica.</li></ol><h2>Preservação</h2><p class="muted">Cada publicação contém seu registro completo em <code>article.record</code>. O grafo acrescenta relações; não resume, substitui ou apaga os campos da fonte.</p><p><a href="${esc(abs("dados-neurais/grafo.json"))}">Abrir grafo JSON completo</a></p></main></body></html>`;
mkdirSync(join(root, "mapa-neural"), { recursive: true });
writeFileSync(join(root, "mapa-neural", "index.html"), html, "utf8");
console.log(`Camada neural gerada: ${nodes.length} nós, ${edges.length} relações, ${articleCount} publicações preservadas integralmente.`);
