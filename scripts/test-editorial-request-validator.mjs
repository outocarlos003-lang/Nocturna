#!/usr/bin/env node
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const html = readFileSync("index.html", "utf8");
const match = html.match(/\/\*DATA\*\/([\s\S]*?)\/\*END DATA\*\//);
if (!match) throw new Error("DATA não encontrado em index.html.");
const DATA = new Function(match[1] + ";return DATA")();
const series = (DATA.series || []).find(s => Array.isArray(s.blocks) && s.blocks.some(b => Array.isArray(b.chapters)));
if (!series) throw new Error("Não existe série com bloco e capítulo para testar.");
const block = series.blocks.find(b => Array.isArray(b.chapters));
const category = DATA.cats?.[0]?.id;
if (!category) throw new Error("Não existe categoria para testar.");

const directory = mkdtempSync(join(tmpdir(), "nocturna-editorial-test-"));
const validator = "scripts/validate-editorial-request.mjs";
const run = (name, request) => {
  const path = join(directory, name + ".json");
  writeFileSync(path, JSON.stringify(request, null, 2), "utf8");
  return spawnSync(process.execPath, [validator, path], { encoding: "utf8" });
};

try {
  const valid = run("valid", {
    operation: "add-chapter",
    parentSeriesId: series.id,
    parentBlockId: block.id,
    item: {
      id: "teste-automatizado-editorial",
      slug: "teste-automatizado-editorial",
      title: "Capítulo de teste automatizado",
      summary: "Resumo usado apenas para testar o validador.",
      content: "Conteúdo integral fictício para testar a validação sem publicar nada.",
      sourceText: "Conteúdo integral fictício para testar a validação sem publicar nada.",
      cats: [category]
    }
  });
  if (valid.status !== 0) {
    console.error(valid.stdout);
    console.error(valid.stderr);
    throw new Error("A solicitação válida foi rejeitada.");
  }

  const invalid = run("invalid", {
    operation: "add-chapter",
    parentSeriesId: series.id,
    parentBlockId: block.id,
    item: {
      id: "teste-invalido-editorial",
      slug: "teste-invalido-editorial",
      title: "Capítulo inválido",
      summary: "Resumo de teste.",
      cats: ["categoria-que-nao-existe"]
    }
  });
  if (invalid.status === 0) throw new Error("O validador aceitou uma solicitação inválida.");
  if (!invalid.stderr.includes("Categoria inexistente") && !invalid.stderr.includes("content")) {
    console.error(invalid.stdout);
    console.error(invalid.stderr);
    throw new Error("A solicitação inválida falhou por um motivo inesperado.");
  }

  const mismatch = run("mismatch", {
    operation: "add-chapter",
    parentSeriesId: series.id,
    parentBlockId: block.id,
    item: {
      id: "teste-divergencia-editorial",
      slug: "teste-divergencia-editorial",
      title: "Capítulo com divergência",
      summary: "Teste de igualdade textual exata.",
      content: "Texto encurtado.",
      sourceText: "Texto original integral que não pode ser encurtado.",
      cats: [category]
    }
  });
  if (mismatch.status === 0) throw new Error("O validador aceitou conteúdo divergente da fonte original.");
  if (!mismatch.stderr.includes("diverge da fonte original")) {
    console.error(mismatch.stdout);
    console.error(mismatch.stderr);
    throw new Error("A divergência falhou por um motivo inesperado.");
  }

  console.log("Teste aprovado: solicitação válida aceita.");
  console.log("Teste aprovado: solicitação inválida rejeitada.");
  console.log("Teste aprovado: conteúdo divergente da fonte original rejeitado.");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
