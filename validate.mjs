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
ok(cats.length > 0, "categorias presentes");
ok(new Set(cats.map(c => c.id)).size === cats.length, "ids de categorias únicos");
ok(new Set(cats.map(c => c.slug)).size === cats.length, "slugs de categorias únicos");
ok(pubs.length > 0, "publicações presentes");
ok(new Set(pubs.map(p => p.id)).size === pubs.length, "publicações únicas");

// Coleções são validadas recursivamente para impedir que uma inserção parcial
// publique uma coleção sem blocos, capítulos, conteúdo ou categorias válidas.
ok(Array.isArray(DATA.series), "DATA.series deve ser uma lista de coleções");
ok(new Set(series.map(s => s.id)).size === series.length, "ids de coleções únicos");
ok(new Set(series.map(s => s.slug)).size === series.length, "slugs de coleções únicos");
const seriesIds = new Set(), seriesSlugs = new Set();
series.forEach((s, si) => {
  const label = s.title || s.id || `coleção ${si + 1}`;
  ok(typeof s.id === "string" && /^[-a-z0-9]+$/.test(s.id), `id inválido em ${label}`);
  ok(typeof s.slug === "string" && /^[-a-z0-9]+$/.test(s.slug), `slug inválido em ${label}`);
  ok(typeof s.title === "string" && s.title.trim().length > 0, `título ausente em ${label}`);
  ok(Array.isArray(s.blocks) && s.blocks.length > 0, `coleção sem blocos: ${label}`);
  (s.blocks || []).forEach((block, bi) => {
    const blockLabel = block.title || block.id || `${label}, bloco ${bi + 1}`;
    ok(typeof block.id === "string" && /^[-a-z0-9]+$/.test(block.id), `id de bloco inválido em ${blockLabel}`);
    ok(typeof block.slug === "string" && /^[-a-z0-9]+$/.test(block.slug), `slug de bloco inválido em ${blockLabel}`);
    ok(typeof block.title === "string" && block.title.trim().length > 0, `título ausente em ${blockLabel}`);
    ok(Array.isArray(block.chapters) && block.chapters.length > 0, `bloco sem capítulos: ${blockLabel}`);
    (block.chapters || []).forEach((chapter, ci) => {
      const chapterLabel = chapter.title || chapter.id || `${blockLabel}, capítulo ${ci + 1}`;
      ok(typeof chapter.id === "string" && /^[-a-z0-9]+$/.test(chapter.id), `id inválido em ${chapterLabel}`);
      ok(typeof chapter.slug === "string" && /^[-a-z0-9]+$/.test(chapter.slug), `slug inválido em ${chapterLabel}`);
      ok(typeof chapter.title === "string" && chapter.title.trim().length > 0, `título ausente em ${chapterLabel}`);
      ok(typeof chapter.content === "string" && chapter.content.trim().length > 0, `conteúdo ausente em ${chapterLabel}`);
      (chapter.cats || []).forEach(k => ok(catIds.has(k), `categoria inexistente em ${chapterLabel}: ${k}`));
    });
  });
  (s.cats || []).forEach(k => ok(catIds.has(k), `categoria inexistente em coleção ${label}: ${k}`));
});

const catIds = new Set(cats.map(c => c.id));
pubs.forEach(p => {
  ok(/^[-a-z0-9]+$/.test(p.id), `id inválido em publicação ${p.id || "(sem id)"}`);
  ok(typeof p.title === "string" && p.title.trim().length > 0, `título ausente em ${p.id}`);
  ok(typeof p.content === "string", `conteúdo ausente em ${p.id}`);
  (p.cats || []).forEach(k => ok(catIds.has(k), `categoria inexistente em ${p.id}`));
  (p.tags || []).forEach(t => ok(typeof t === "string" && t.trim().length > 0, `tag inválida em ${p.id}`));
  if (p.date) ok(/^\d{4}-\d{2}-\d{2}$/.test(p.date), `data inválida em ${p.id}`);
  if (p.image?.src) {
    const imagePath = p.image.src.replace(/^\/Nocturna\//, "").replace(/^\//, "");
    ok(existsSync(imagePath), `imagem ${imagePath}`);
  }
  if (p.image) ok(typeof p.image.alt === "string" && p.image.alt.trim().length > 0, `alt ausente em ${p.id}`);
});

const man = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
ok(html.includes('rel="manifest" href="/Nocturna/manifest.webmanifest"'), "manifest referenciado");
man.icons.forEach(i => ok(existsSync(i.src === "/Nocturna/icon.svg" ? "icon.svg" : i.src), `ícone ${i.src}`));
ok(existsSync("social-card.svg"), "social-card.svg");
ok(!/fetch\(|import\s|<script[^>]+src=["']https?:\/\/|<link[^>]+(?:href|src)=["'](?:https?:)?\/\//.test(html), "sem dependências externas");
ok(/^\d{10,15}$/.test(String(DATA.contact?.wa || "")), "WhatsApp normalizado");
ok(html.includes('content="/Nocturna/social-card.svg"'), "og:image absoluto");

console.log(fail.length ? "FALHAS:\n" + fail.join("\n") : "OK");
process.exit(fail.length ? 1 : 0);
