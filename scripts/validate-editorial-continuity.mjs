#!/usr/bin/env node
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const match = html.match(/const DATA=(\{[\s\S]*?\});\s*\/\*END DATA\*\//);
if (!match) throw new Error("DATA editorial não encontrada em index.html");
const DATA = JSON.parse(match[1]);
const series = Array.isArray(DATA.series) ? DATA.series : [];
const errors = [];
const warnings = [];
const fail = message => errors.push(message);
const warn = message => warnings.push(message);
const normalize = value => String(value ?? "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
const chapterList = s => (s.blocks || []).flatMap(b =>
  (b.chapters || []).map(c => ({ series: s, block: b, chapter: c }))
);
const legacyDuplicateSeries = new Set([
  "se-o-trono-nunca-morreu-antes-da-semente-a-espada",
  "a-fenomenologia-da-regeneracao-pela-palavra-viva"
]);

// Detecta títulos de coleção repetidos. A colisão histórica conhecida é
// explicitamente allowlisted para não quebrar a publicação até revisão editorial.
const byTitle = new Map();
for (const s of series) {
  const key = normalize(s.title);
  if (!key) continue;
  if (!byTitle.has(key)) byTitle.set(key, []);
  byTitle.get(key).push(s);
}
for (const [title, rows] of byTitle) {
  if (rows.length < 2) continue;
  const ids = new Set(rows.map(s => s.id));
  const knownLegacy = rows.length === 2 && [...ids].every(id => legacyDuplicateSeries.has(id));
  const message = `título de coleção duplicado: ${rows.map(s => s.id).join(" <> ")} (${title})`;
  if (knownLegacy) warn(`COLISÃO HISTÓRICA EXPLICITAMENTE PERMITIDA: ${message}`);
  else fail(message);
}

// Um mesmo número/identidade de capítulo não pode aparecer em coleções diferentes,
// salvo os dois capítulos legados já duplicados no par acima.
const roman = {i:1,ii:2,iii:3,iv:4,v:5,vi:6,vii:7,viii:8,ix:9,x:10,xi:11,xii:12,xiii:13,xiv:14,xv:15, xvi:16, xvii:17, xviii:18, xix:19, xx:20};
function numberOf(chapter) {
  const text = normalize(chapter.title);
  const m = text.match(/(?:^| )capitulo\s+(\d+|i{1,3}|iv|v?i{0,3}|ix|x{1,3}|xl|l)\b/);
  if (!m) {
    const id = normalize(chapter.id).match(/^capitulo (\d+|[ivxlcdm]+)$/);
    if (!id) return null;
    return /^\d+$/.test(id[1]) ? Number(id[1]) : roman[id[1]] ?? null;
  }
  return /^\d+$/.test(m[1]) ? Number(m[1]) : roman[m[1]] ?? null;
}
const chapterOccurrences = new Map();
for (const s of series) for (const item of chapterList(s)) {
  const n = numberOf(item.chapter);
  const key = n == null ? normalize(item.chapter.id) : `n:${n}`;
  if (!chapterOccurrences.has(key)) chapterOccurrences.set(key, []);
  chapterOccurrences.get(key).push(item);
}
for (const [key, rows] of chapterOccurrences) {
  const differentCollections = new Set(rows.map(x => x.series.id));
  if (differentCollections.size < 2) continue;
  const knownLegacy = rows.every(x => legacyDuplicateSeries.has(x.series.id)) &&
    rows.length === 2 &&
    rows.some(x => x.chapter.id === "capitulo-i") &&
    rows.some(x => x.chapter.id === "capitulo-ii");
  // A numeration key may occur in many unrelated collections, so only compare
  // normalized chapter identity/title when the collection titles also collide.
  const collidingTitles = rows.every(x => [...byTitle.values()].some(group =>
    group.length > 1 && group.some(s => s.id === x.series.id)));
  if (!collidingTitles) continue;
  const msg = `capítulo/numeração repetida entre coleções com título colidente (${key}): ${rows.map(x => x.series.id + "/" + x.block.id + "/" + x.chapter.id).join(" <> ")}`;
  if (knownLegacy) warn(`CAPÍTULO LEGADO DUPLICADO EXPLICITAMENTE PERMITIDO: ${msg}`);
  else fail(msg);
}

// Em títulos de coleção repetidos, compare os capítulos par a par. O par legado
// conhecido mantém I e II duplicados por enquanto; qualquer nova sobreposição bloqueia CI.
for (const group of byTitle.values()) {
  if (group.length < 2) continue;
  for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) {
    const left = group[i], right = group[j];
    const knownPair = group.length === 2 &&
      legacyDuplicateSeries.has(left.id) && legacyDuplicateSeries.has(right.id);
    const rightChapters = chapterList(right);
    for (const a of chapterList(left)) {
      const an = numberOf(a.chapter);
      for (const b of rightChapters) {
        const bn = numberOf(b.chapter);
        const sameNumber = an != null && bn != null && an === bn;
        const sameTitle = normalize(a.chapter.title) === normalize(b.chapter.title);
        if (!sameNumber && !sameTitle) continue;
        const legacyIorII = knownPair && ["capitulo-i", "capitulo-ii"].includes(a.chapter.id) &&
          a.chapter.id === b.chapter.id && sameNumber;
        const msg = `sobreposição de capítulos em coleções com título repetido: ${left.id}/${a.block.id}/${a.chapter.id} <> ${right.id}/${b.block.id}/${b.chapter.id}`;
        if (legacyIorII) warn(`SOBREPOSIÇÃO LEGADA EXPLICITAMENTE PERMITIDA: ${msg}`);
        else fail(msg);
      }
    }
  }
}

// Dentro de cada bloco, IDs e números de capítulo devem ser únicos e a ordem
// numérica deve ser crescente. Lacunas são bloqueantes: podem indicar capítulo
// inserido na coleção errada ou capítulo omitido.
for (const s of series) for (const b of s.blocks || []) {
  const label = `${s.id}/${b.id}`;
  const chapters = b.chapters || [];
  const ids = chapters.map(c => c.id);
  if (new Set(ids).size !== ids.length) fail(`ID de capítulo duplicado em ${label}`);
  const numbered = chapters.map(c => ({ c, n: numberOf(c) })).filter(x => x.n != null);
  const seen = new Map();
  for (const x of numbered) {
    if (seen.has(x.n)) fail(`número de capítulo ${x.n} repetido em ${label}: ${seen.get(x.n)} e ${x.c.id}`);
    else seen.set(x.n, x.c.id);
  }
  for (let i = 1; i < numbered.length; i++) {
    if (numbered[i].n < numbered[i - 1].n) fail(`ordem numérica de capítulos decrescente em ${label}: ${numbered[i - 1].c.id} → ${numbered[i].c.id}`);
    if (numbered[i].n > numbered[i - 1].n + 1) fail(`lacuna de numeração em ${label}: ${numbered[i - 1].n} → ${numbered[i].n}`);
  }
}

if (warnings.length) console.warn("AVISOS EDITORIAIS:\n" + warnings.map(x => "- " + x).join("\n"));
if (errors.length) {
  console.error("FALHAS DE INTEGRIDADE EDITORIAL:\n" + errors.map(x => "- " + x).join("\n"));
  process.exit(1);
}
console.log(`Integridade de continuidade editorial: OK (${series.length} coleções; ${warnings.length} aviso(s) legado(s)).`);
