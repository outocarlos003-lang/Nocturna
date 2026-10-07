// Uso: node validate.mjs
import { readFileSync, existsSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const match = html.match(/\/\*DATA\*\/([\s\S]*?)\/\*END DATA\*\//);
if (!match) throw new Error("DATA editorial não encontrada em index.html");
const DATA = new Function(match[1] + ";return DATA")();
const fail = [], ok = (c, m) => c || fail.push(m);
const cats = Array.isArray(DATA.cats) ? DATA.cats : [];
const pubs = Array.isArray(DATA.pubs) ? DATA.pubs : [];
const series = Array.isArray(DATA.series) ? DATA.series : [];
let CONTENT = null;
try { CONTENT = JSON.parse(readFileSync("data/content.json", "utf8")); }
catch (e) { fail.push(`data/content.json inválido ou ausente: ${e.message}`); }

ok(cats.length > 0, "categorias presentes");
ok(new Set(cats.map(c => c.id)).size === cats.length, "ids de categorias únicos");
ok(new Set(cats.map(c => c.slug)).size === cats.length, "slugs de categorias únicos");
ok(pubs.length > 0, "publicações presentes");
ok(new Set(pubs.map(p => p.id)).size === pubs.length, "publicações únicas");
ok(CONTENT?.pubs && typeof CONTENT.pubs === "object", "mapa de conteúdos presente");

const catIds = new Set(cats.map(c => c.id));
pubs.forEach(p => {
  ok(/^[-a-z0-9]+$/.test(p.id), `id inválido em publicação ${p.id || "(sem id)"}`);
  ok(typeof p.title === "string" && p.title.trim().length > 0, `título ausente em ${p.id}`);
  ok(typeof CONTENT?.pubs?.[p.id] === "string", `conteúdo ausente em ${p.id}`);
  (p.cats || []).forEach(k => ok(catIds.has(k), `categoria inexistente em ${p.id}`));
  (p.tags || []).forEach(t => ok(typeof t === "string" && t.trim().length > 0, `tag inválida em ${p.id}`));
  if (p.date) ok(/^\d{4}-\d{2}-\d{2}$/.test(p.date), `data inválida em ${p.id}`);
  if (p.image?.src) {
    const imagePath = p.image.src.replace(/^\/Nocturna\//, "").replace(/^\//, "");
    ok(existsSync(imagePath), `imagem ${imagePath}`);
  }
  if (p.image) ok(typeof p.image.alt === "string" && p.image.alt.trim().length > 0, `alt ausente em ${p.id}`);
});

const seriesIds = new Set(series.map(s => s.id));
ok(seriesIds.size === series.length, "coleções únicas");
series.forEach(s => {
  ok(/^[-a-z0-9]+$/.test(s.id), `id inválido em coleção ${s.id || "(sem id)"}`);
  ok(typeof s.slug === "string" && s.slug.trim().length > 0, `slug ausente em ${s.id}`);
  ok(Array.isArray(s.blocks), `blocos ausentes em ${s.id}`);
  for (const b of s.blocks || []) {
    ok(typeof b.id === "string" && b.id.length > 0, `id de bloco ausente em ${s.id}`);
    ok(typeof b.slug === "string" && b.slug.length > 0, `slug de bloco ausente em ${s.id}/${b.id}`);
    ok(Array.isArray(b.chapters), `capítulos ausentes em ${s.id}/${b.id}`);
    for (const c of b.chapters || []) {
      ok(typeof c.id === "string" && c.id.length > 0, `id de capítulo ausente em ${s.id}/${b.id}`);
      ok(typeof c.slug === "string" && c.slug.length > 0, `slug de capítulo ausente em ${s.id}/${b.id}/${c.id}`);
      ok(typeof c.title === "string" && c.title.trim().length > 0, `título de capítulo ausente em ${s.id}/${b.id}/${c.id}`);
      (c.cats || []).forEach(k => ok(catIds.has(k), `categoria inexistente em capítulo ${s.id}/${b.id}/${c.id}`));
    }
  }
});

const man = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
ok(html.includes('rel="manifest" href="/Nocturna/manifest.webmanifest"'), "manifest referenciado");
man.icons.forEach(i => ok(existsSync(i.src === "/Nocturna/icon.svg" ? "icon.svg" : i.src), `ícone ${i.src}`));
ok(existsSync("social-card.svg"), "social-card.svg");
ok(!/fetch\(|import\s|<script[^>]+src=["']https?:\/\/|<link[^>]+(?:href|src)=["'](?:https?:)?\/\//.test(html), "sem dependências externas");
ok(/^\d{10,15}$/.test(String(DATA.contact?.wa || "")), "WhatsApp normalizado");
ok(html.includes('content="/Nocturna/social-card.svg"'), "og:image absoluto");

// O roteador usa hash. Links absolutos /Nocturna/#/... precisam chegar ao navegador como #/..., sem hash duplicado.
ok(html.includes('id="nocturna-navigation-bridge"'), "ponte de navegação instalada");
ok(html.includes('id="nocturna-state-bridge"'), "ponte de estado instalada");

console.log(fail.length ? "FALHAS:\n" + fail.join("\n") : "OK");
process.exit(fail.length ? 1 : 0);
