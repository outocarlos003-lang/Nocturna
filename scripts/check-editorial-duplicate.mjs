#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const DUPLICATE_THRESHOLD = 0.90;

export function normalizeLetters(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]/g, "");
}

// Banded Levenshtein distance: only explores the edit-distance band that can
// still meet the configured similarity threshold.
export function similarity(leftValue, rightValue) {
  const a = normalizeLetters(leftValue);
  const b = normalizeLetters(rightValue);
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  const limit = Math.floor((1 - DUPLICATE_THRESHOLD) * maxLength);
  if (Math.abs(a.length - b.length) > limit) {
    return 1 - Math.abs(a.length - b.length) / maxLength;
  }
  let previous = new Map();
  for (let j = 0; j <= Math.min(b.length, limit); j++) previous.set(j, j);
  for (let i = 1; i <= a.length; i++) {
    const current = new Map();
    const start = Math.max(0, i - limit);
    const end = Math.min(b.length, i + limit);
    if (start === 0) current.set(0, i);
    let rowMin = Infinity;
    for (let j = Math.max(1, start); j <= end; j++) {
      const deletion = (previous.get(j) ?? Infinity) + 1;
      const insertion = (current.get(j - 1) ?? Infinity) + 1;
      const substitution = (previous.get(j - 1) ?? Infinity) + (a[i - 1] === b[j - 1] ? 0 : 1);
      const value = Math.min(deletion, insertion, substitution);
      current.set(j, value);
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > limit) return Math.max(0, 1 - (limit + 1) / maxLength);
    previous = current;
  }
  const distance = previous.get(b.length);
  if (distance === undefined) return 0;
  return 1 - distance / maxLength;
}

function collectChapters(series) {
  return (series || []).flatMap(s => (s.blocks || []).flatMap(b =>
    (b.chapters || []).map(c => ({
      label: `capítulo: ${s.title || s.id} / ${b.title || b.id} / ${c.title || c.id}`,
      text: c.content || c.sourceText || ""
    }))
  ));
}

function collectCandidate(item) {
  const units = [];
  const visit = (node, label) => {
    if (!node || typeof node !== "object") return;
    const body = node.content ?? node.sourceText;
    if (typeof body === "string" && body.trim()) units.push({ label, text: body });
    for (const [i, block] of (node.blocks || []).entries()) {
      for (const [j, chapter] of (block.chapters || []).entries()) {
        visit(chapter, `capítulo proposto ${i + 1}.${j + 1}: ${chapter.title || chapter.id || "sem título"}`);
      }
    }
  };
  visit(item, `item proposto: ${item.title || item.id || "sem título"}`);
  if (Array.isArray(item?.blocks) && item.blocks.length) {
    const aggregate = item.blocks.flatMap(block => (block.chapters || []).map(ch => ch.content || ch.sourceText || "")).filter(Boolean).join("\n");
    if (aggregate) units.push({ label: `coleção proposta agregada: ${item.title || item.id || "sem título"}`, text: aggregate });
  }
  return units;
}

function readData() {
  const html = readFileSync("index.html", "utf8");
  const match = html.match(/const DATA=(\{[\s\S]*?\});\s*\/\*END DATA\*\//);
  if (!match) throw new Error("DATA editorial não encontrada em index.html.");
  return JSON.parse(match[1]);
}

function collectCorpus(DATA) {
  const units = [];
  for (const pub of DATA.pubs || []) {
    if (pub.content) units.push({ label: `publicação: ${pub.title || pub.id}`, text: pub.content });
  }
  units.push(...collectChapters(DATA.series));
  for (const series of DATA.series || []) {
    const chapters = (series.blocks || []).flatMap(block => block.chapters || []);
    const aggregate = chapters.map(ch => ch.content || ch.sourceText || "").filter(Boolean).join("\n");
    if (aggregate) units.push({ label: `coleção agregada: ${series.title || series.id}`, text: aggregate });
  }
  try {
    for (const file of readdirSync("editorial/posts").filter(name => name.endsWith(".md"))) {
      const raw = readFileSync(join("editorial/posts", file), "utf8");
      const end = raw.indexOf("\n---", 4);
      const body = end >= 0 ? raw.slice(end + 4).replace(/^\n/, "") : raw;
      if (body.trim()) units.push({ label: `arquivo editorial: ${file}`, text: body });
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return units;
}

function selfTest() {
  const original = "A lei organiza a vida comum e preserva a dignidade das pessoas.";
  const near = "A lei organiza a vida comum e preserva a dignidade das pessoa.";
  const distinct = "Uma estrela atravessa o céu noturno enquanto o mar permanece silencioso.";
  if (similarity(original, near) < DUPLICATE_THRESHOLD) throw new Error("Falhou o teste positivo de similaridade >=90%.");
  if (similarity(original, distinct) >= DUPLICATE_THRESHOLD) throw new Error("Falhou o teste negativo de similaridade <90%.");
  if (similarity("AÇÃO, fé!", "acao fe") !== 1) throw new Error("Normalização de acentos/pontuação falhou.");
  console.log("Política de duplicatas aprovada: >=90% sinaliza duplicata; <90% não bloqueia.");
}

const inputPath = process.argv[2];
if (inputPath === "--self-test") {
  selfTest();
} else if (!inputPath) {
  console.error("Uso: node scripts/check-editorial-duplicate.mjs caminho/solicitacao.json | --self-test");
  process.exit(2);
} else {
  let request;
  try { request = JSON.parse(readFileSync(inputPath, "utf8")); }
  catch (error) {
    console.error(`JSON inválido ou arquivo inacessível: ${error.message}`);
    process.exit(2);
  }
  const candidateUnits = collectCandidate(request?.item || request);
  if (!candidateUnits.length) {
    console.error("Solicitação sem texto integral: informe item.content, item.sourceText ou item.blocks[].chapters[].content.");
    process.exit(2);
  }
  const corpus = collectCorpus(readData());
  const duplicates = [];
  for (const candidate of candidateUnits) {
    for (const existing of corpus) {
      const score = similarity(candidate.text, existing.text);
      if (score >= DUPLICATE_THRESHOLD) {
        duplicates.push({ candidate: candidate.label, existing: existing.label, score });
      }
    }
  }
  const unique = new Map();
  for (const match of duplicates) {
    const key = [match.candidate, match.existing].join(" :: ");
    if (!unique.has(key) || unique.get(key).score < match.score) unique.set(key, match);
  }
  if (unique.size) {
    console.error("Inserção bloqueada: correspondência textual >=90% identificada.");
    for (const match of unique.values()) {
      console.error(`- ${(match.score * 100).toFixed(2)}% | ${match.candidate} <> ${match.existing}`);
    }
    process.exit(1);
  }
  console.log(`Nenhuma duplicata >=90% encontrada. ${candidateUnits.length} unidade(s) proposta(s) comparada(s) com ${corpus.length} unidade(s) do acervo.`);
}
