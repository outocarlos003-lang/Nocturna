#!/usr/bin/env node
import { readFileSync } from "node:fs";

const usage = "Uso: node scripts/validate-editorial-request.mjs caminho/solicitacao.json";
const inputPath = process.argv[2];
if (!inputPath) {
  console.error(usage);
  process.exit(2);
}

const fail = [];
const check = (condition, message) => { if (!condition) fail.push(message); };
const nonempty = value => typeof value === "string" && value.trim().length > 0;
const validKey = value => typeof value === "string" && /^[-a-z0-9]+$/.test(value);

let request;
try {
  request = JSON.parse(readFileSync(inputPath, "utf8"));
} catch (error) {
  console.error(`JSON inválido ou arquivo inacessível: ${error.message}`);
  process.exit(2);
}

const html = readFileSync("index.html", "utf8");
const dataMatch = html.match(/\/\*DATA\*\/([\s\S]*?)\/\*END DATA\*\//);
if (!dataMatch) {
  console.error("Não foi possível localizar DATA em index.html.");
  process.exit(2);
}
let DATA;
try {
  DATA = new Function(dataMatch[1] + ";return DATA")();
} catch (error) {
  console.error(`Não foi possível ler DATA: ${error.message}`);
  process.exit(2);
}

const operation = request?.operation;
const item = request?.item;
const series = Array.isArray(DATA.series) ? DATA.series : [];
const categories = new Set((DATA.cats || []).map(category => category.id));
const seriesTarget = series.find(entry => entry.id === request?.parentSeriesId);
const blockTarget = seriesTarget?.blocks?.find(entry => entry.id === request?.parentBlockId);

if (!["add-series", "add-block", "add-chapter"].includes(operation)) {
  fail.push("operation deve ser add-series, add-block ou add-chapter.");
}
if (!item || typeof item !== "object" || Array.isArray(item)) {
  fail.push("item deve ser um objeto.");
} else {
  for (const field of ["id", "slug", "title"]) {
    check(nonempty(item[field]), `item.${field} é obrigatório.`);
  }
  check(validKey(item.id), "item.id deve conter apenas letras minúsculas, números e hífens.");
  check(validKey(item.slug), "item.slug deve conter apenas letras minúsculas, números e hífens.");
  check(nonempty(item.summary), "item.summary é obrigatório.");
  check(Array.isArray(item.cats) && item.cats.length > 0, "item.cats deve conter pelo menos uma categoria.");
  if (Array.isArray(item.cats)) {
    for (const cat of item.cats) check(categories.has(cat), `Categoria inexistente: ${cat}`);
  }
}

let siblings = [];
if (operation === "add-series") {
  siblings = series;
  check(nonempty(item?.date), "item.date é obrigatório para uma coleção.");
  check(Array.isArray(item?.blocks) && item.blocks.length > 0, "A nova coleção precisa conter pelo menos um bloco completo.");
  check(Array.isArray(item?.chapters) === false, "Capítulos devem ficar dentro de blocos, não diretamente na coleção.");
} else if (operation === "add-block") {
  check(Boolean(seriesTarget), `Coleção de destino não encontrada: ${request?.parentSeriesId || "(ausente)"}`);
  siblings = seriesTarget?.blocks || [];
  check(Array.isArray(item?.chapters) && item.chapters.length > 0, "O novo bloco precisa conter pelo menos um capítulo completo.");
} else if (operation === "add-chapter") {
  check(Boolean(seriesTarget), `Coleção de destino não encontrada: ${request?.parentSeriesId || "(ausente)"}`);
  check(Boolean(blockTarget), `Bloco de destino não encontrado: ${request?.parentBlockId || "(ausente)"}`);
  siblings = blockTarget?.chapters || [];
  check(nonempty(item?.content), "item.content é obrigatório para um capítulo.");
  check(nonempty(item?.sourceText), "item.sourceText é obrigatório: inclua a fonte original integral para comparação.");
  check(item?.content === item?.sourceText, "item.content diverge da fonte original em item.sourceText.");
}

if (item && typeof item === "object") {
  check(!siblings.some(entry => entry.id === item.id), `ID já existente no destino: ${item.id}`);
  check(!siblings.some(entry => entry.slug === item.slug), `Slug já existente no destino: ${item.slug}`);
}

const checkNested = (entries, label) => {
  if (!Array.isArray(entries)) return;
  for (const [index, entry] of entries.entries()) {
    check(entry && validKey(entry.id), `${label} ${index + 1}: id inválido.`);
    check(entry && validKey(entry.slug), `${label} ${index + 1}: slug inválido.`);
    check(entry && nonempty(entry.title), `${label} ${index + 1}: título ausente.`);
    check(entry && nonempty(entry.summary), `${label} ${index + 1}: resumo ausente.`);
    check(entry && Array.isArray(entry.cats) && entry.cats.length > 0, `${label} ${index + 1}: categorias ausentes.`);
    for (const cat of entry?.cats || []) check(categories.has(cat), `${label} ${index + 1}: categoria inexistente ${cat}.`);
    if (label === "Capítulo") {
      check(nonempty(entry?.content), `Capítulo ${index + 1}: conteúdo integral ausente.`);
      check(nonempty(entry?.sourceText), `Capítulo ${index + 1}: fonte original (sourceText) ausente para comparação.`);
      check(entry?.content === entry?.sourceText, `Capítulo ${index + 1}: conteúdo diverge da fonte original (sourceText).`);
    }
    if (label === "Bloco") {
      check(Array.isArray(entry?.chapters) && entry.chapters.length > 0, `Bloco ${index + 1}: capítulos ausentes.`);
      for (const [ci, chapter] of (entry?.chapters || []).entries()) {
        check(validKey(chapter?.id), `Capítulo ${ci + 1}: id inválido.`);
        check(validKey(chapter?.slug), `Capítulo ${ci + 1}: slug inválido.`);
        check(nonempty(chapter?.title), `Capítulo ${ci + 1}: título ausente.`);
        check(nonempty(chapter?.summary), `Capítulo ${ci + 1}: resumo ausente.`);
        check(nonempty(chapter?.content), `Capítulo ${ci + 1}: conteúdo integral ausente.`);
        check(Array.isArray(chapter?.cats) && chapter.cats.length > 0, `Capítulo ${ci + 1}: categorias ausentes.`);
        for (const cat of chapter?.cats || []) check(categories.has(cat), `Capítulo ${ci + 1}: categoria inexistente ${cat}.`);
      }
    }
  }
};
if (operation === "add-series") checkNested(item?.blocks, "Bloco");
if (operation === "add-block") checkNested(item?.chapters, "Capítulo");

if (fail.length) {
  console.error("Solicitação editorial rejeitada:");
  for (const message of [...new Set(fail)]) console.error(`- ${message}`);
  process.exit(1);
}

console.log("Solicitação editorial válida.");
console.log(`Operação: ${operation}`);
console.log(`Item: ${item.title} (${item.id})`);
console.log("Nenhum arquivo do site foi alterado. Esta ferramenta valida a proposta; a integração continua dependendo de revisão e PR.");
