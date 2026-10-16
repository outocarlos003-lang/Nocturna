// Validação preventiva do acervo editorial. Executada antes de alterar o índice público.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const fail = [];
const ok = (condition, message) => { if (!condition) fail.push(message); };
const unquote = value => {
  const v = String(value ?? "").trim();
  if (v.length >= 2 && ((v[0] === '"' && v.at(-1) === '"') || (v[0] === "'" && v.at(-1) === "'"))) return v.slice(1, -1);
  return v;
};
const parseArray = value => {
  const v = String(value ?? "").trim();
  if (!v.startsWith("[") || !v.endsWith("]")) return null;
  return v.slice(1, -1).split(",").map(item => unquote(item.trim())).filter(Boolean);
};
const files = readdirSync("editorial/posts").filter(file => file.endsWith(".md")).sort();
ok(files.length > 0, "nenhum Markdown encontrado em editorial/posts");

const html = readFileSync("index.html", "utf8");
const match = html.match(/const DATA=(\{[\s\S]*?\});\s*\/\*END DATA\*\//);
ok(Boolean(match), "DATA editorial não encontrada em index.html");
let DATA = {};
if (match) {
  try { DATA = vm.runInNewContext("(" + match[1] + ")"); }
  catch (error) { fail.push("DATA editorial inválida: " + error.message); }
}
const categoryIds = new Set((DATA.cats || []).map(category => category.id));
const ids = new Map();

for (const file of files) {
  const text = readFileSync(join("editorial/posts", file), "utf8");
  const end = text.indexOf("\n---\n", 4);
  if (!text.startsWith("---\n") || end < 0) {
    fail.push(file + ": front matter ausente ou não terminado");
    continue;
  }
  const fm = {};
  for (const line of text.slice(4, end).split("\n")) {
    const colon = line.indexOf(":");
    if (colon < 1) continue;
    const key = line.slice(0, colon).trim();
    const raw = line.slice(colon + 1).trim();
    fm[key] = raw.startsWith("[") ? parseArray(raw) : unquote(raw);
  }
  for (const field of ["id", "title", "date", "summary", "image", "imageAlt", "imageCaption"]) {
    ok(typeof fm[field] === "string" && fm[field].trim().length > 0, file + ": campo obrigatório ausente/inválido: " + field);
  }
  for (const field of ["cats", "tags"]) ok(Array.isArray(fm[field]) && fm[field].length > 0, file + ": " + field + " deve ser uma lista não vazia");
  if (typeof fm.id === "string" && fm.id) {
    ok(/^[-a-z0-9]+$/.test(fm.id), file + ": id deve usar apenas letras minúsculas, números e hífens");
    if (ids.has(fm.id)) fail.push(file + ": id duplicado também usado em " + ids.get(fm.id));
    else ids.set(fm.id, file);
  }
  if (typeof fm.date === "string") {
    ok(/^\d{4}-\d{2}-\d{2}$/.test(fm.date), file + ": date deve usar YYYY-MM-DD sem aspas obrigatórias");
    if (/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) {
      const d = new Date(fm.date + "T00:00:00Z");
      ok(!Number.isNaN(d.valueOf()) && d.toISOString().slice(0,10) === fm.date, file + ": date não é uma data válida");
    }
  }
  for (const category of fm.cats || []) ok(categoryIds.has(category), file + ": categoria inexistente em index.html: " + category);
  if (typeof fm.image === "string" && fm.image) {
    const imagePath = fm.image.replace(/^\//, "");
    ok(imagePath.startsWith("editorial/images/"), file + ": image deve apontar para editorial/images/");
    ok(existsSync(imagePath), file + ": imagem não encontrada: " + imagePath);
  }
  ok(text.slice(end + 5).trim().length > 0, file + ": corpo do artigo vazio");
}
console.log("Validação preventiva: " + files.length + " arquivos Markdown, " + ids.size + " IDs únicos.");
if (fail.length) {
  console.error("FALHAS PREVENTIVAS:\n" + fail.map(message => "- " + message).join("\n"));
  process.exit(1);
}
console.log("OK: metadados, IDs, categorias, datas, imagens e corpos aprovados.");
