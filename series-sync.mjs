import { readFileSync, writeFileSync } from "node:fs";

const indexPath = "index.html";
const source = readFileSync(indexPath, "utf8");
const match = source.match(/\/\*DATA\*\/const DATA=([\s\S]*?);\n\/\*END DATA\*\//);
if (!match) throw new Error("DATA editorial não encontrada em index.html");
const DATA = JSON.parse(match[1]);
if (!Array.isArray(DATA.series)) throw new Error("DATA.series não encontrada");

const series = DATA.series.find(
  s => s.id === "se-o-trono-nunca-morreu-antes-da-semente-a-espada" ||
       s.slug === "se-o-trono-nunca-morreu-antes-da-semente-a-espada"
);
if (!series) throw new Error("Coleção da semente não encontrada");

const block = (series.blocks || []).find(
  b => b.id === "antes-da-semente-a-espada" ||
       b.slug === "antes-da-semente-a-espada"
);
if (!block) throw new Error("Bloco ANTES DA SEMENTE, A ESPADA não encontrado");

function syncChapter(payload, { appendIfMissing = false } = {}) {
  const chapters = Array.isArray(block.chapters) ? block.chapters : [];
  let chapter = chapters.find(c => c.id === payload.id || c.slug === payload.slug);
  if (!chapter && appendIfMissing) {
    chapter = {};
    chapters.push(chapter);
    block.chapters = chapters;
  }
  if (!chapter) throw new Error("Capítulo " + payload.id + " não encontrado");
  Object.assign(chapter, payload);
}

for (const numeral of ["ii", "v", "vi", "vii", "viii", "ix"]) {
  const chapter = JSON.parse(
    readFileSync("editorial/series-se-o-trono-nunca-morreu-capitulo-" + numeral + ".json", "utf8")
  );
  syncChapter(chapter, { appendIfMissing: ["v", "vi", "vii", "viii", "ix"].includes(numeral) });
}

const replacement = "/*DATA*/const DATA=" + JSON.stringify(DATA) + ";\n/*END DATA*/";
const next = source.replace(match[0], replacement);
if (next === source) throw new Error("Nenhuma alteração foi aplicada ao DATA editorial");
writeFileSync(indexPath, next, "utf8");
console.log("Capítulos II, V, VI, VII, VIII e IX sincronizados em DATA.series sem alterar DATA.pubs.");
