#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { basename, dirname, resolve } from "node:path";

const [inputArg, outputArg] = process.argv.slice(2);
if (!inputArg) {
  console.error("Uso: node scripts/prepare-editorial-proposal.mjs solicitacao.json [proposta.md]");
  process.exit(2);
}
const inputPath = resolve(inputArg);
let request;
try {
  request = JSON.parse(readFileSync(inputPath, "utf8"));
} catch (error) {
  console.error(`JSON inválido ou arquivo inacessível: ${error.message}`);
  process.exit(2);
}

const validation = spawnSync(process.execPath, [
  "scripts/validate-editorial-request.mjs",
  inputPath
], { encoding: "utf8" });
if (validation.status !== 0) {
  process.stderr.write(validation.stdout || "");
  process.stderr.write(validation.stderr || "");
  console.error("Proposta não gerada: a solicitação precisa passar na validação.");
  process.exit(validation.status || 1);
}

const item = request.item;
const safeId = String(item.id).replace(/[^a-z0-9-]/g, "-");
const outputPath = resolve(outputArg || `editorial-proposal-${safeId}.md`);
const operationNames = {
  "add-series": "Adicionar coleção",
  "add-block": "Adicionar bloco",
  "add-chapter": "Adicionar capítulo"
};
const parentLines = [];
if (request.parentSeriesId) parentLines.push(`- Coleção de destino: ${request.parentSeriesId}`);
if (request.parentBlockId) parentLines.push(`- Bloco de destino: ${request.parentBlockId}`);
const proposal = [
  "# Proposta editorial para revisão",
  "",
  "> Artefato de revisão gerado automaticamente. Não foi aplicado ao site nem publicado.",
  "",
  `- Operação: ${operationNames[request.operation]}`,
  `- Título: ${item.title}`,
  `- Identificador: ${item.id}`,
  `- Slug: ${item.slug}`,
  ...parentLines,
  "",
  "## Lista de revisão",
  "",
  "- [ ] Confirmar o destino e a posição na estrutura editorial.",
  "- [ ] Revisar título, resumo, categorias e conteúdo integral.",
  "- [ ] Conferir IDs e slugs contra os dados atuais.",
  "- [ ] Aplicar a alteração em uma branch dedicada.",
  "- [ ] Executar todos os validadores e revisar o diff.",
  "- [ ] Abrir pull request para revisão humana antes de integrar.",
  "",
  "## Solicitação validada (JSON)",
  "",
  "```json",
  JSON.stringify(request, null, 2),
  "```",
  ""
].join("\n");

try {
  writeFileSync(outputPath, proposal, { encoding: "utf8", flag: "wx" });
} catch (error) {
  if (error.code === "EEXIST") {
    console.error(`A proposta já existe e não será sobrescrita: ${outputPath}`);
    process.exit(1);
  }
  console.error(`Não foi possível gravar a proposta: ${error.message}`);
  process.exit(2);
}
console.log(`Proposta editorial criada: ${basename(outputPath)}`);
console.log("O arquivo é apenas um pacote de revisão; nenhum arquivo do site foi alterado.");
