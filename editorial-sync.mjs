import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = process.cwd();
const indexPath = join(root, "index.html");
const editorialDir = join(root, "editorial");
const source = readFileSync(indexPath, "utf8");
const files = readdirSync(editorialDir).filter(name => name.endsWith(".json")).sort();
const payloads = files.map(name => JSON.parse(readFileSync(join(editorialDir, name), "utf8")));
const m = source.match(/\/\*DATA\*\/const DATA=([\s\S]*?);\s*\/\*END DATA\*\//);
if (!m) throw new Error("DATA editorial não encontrada em index.html");
const DATA = vm.runInNewContext("(" + m[1] + ")");
DATA.cats = Array.isArray(DATA.cats) ? DATA.cats : [];
DATA.pubs = Array.isArray(DATA.pubs) ? DATA.pubs : [];
let theology = DATA.cats.find(c => c.slug === "teologia" || c.id === "cat-teologia");
if (!theology) {
  theology = {id:"cat-teologia",slug:"teologia",name:"Teologia",description:"Publicações sobre graça, YAHUSHA, YAHUAH, Evangelho e temas teológicos presentes no acervo."};
  DATA.cats.push(theology);
}
for (const payload of payloads) {
  if (!Array.isArray(payload.cats) || payload.cats.length === 0) payload.cats = [theology.id];
  const i = DATA.pubs.findIndex(p => p.id === payload.id);
  if (i >= 0) DATA.pubs[i] = payload;
  else DATA.pubs.push(payload);
}
const featuredId = "arquiteto-da-correspondencia-ontologica";
for (const p of DATA.pubs) p.featured = p.id === featuredId;
const replacement = "/*DATA*/const DATA=" + JSON.stringify(DATA) + ";\n/*END DATA*/\nfunction ";
const next = source.replace(m[0], replacement);
writeFileSync(indexPath, next, "utf8");
for (const payload of payloads) {
  if (!payload.image?.src) throw new Error("Imagem ausente: " + payload.id);
  const imagePath = join(root, payload.image.src.replace(/^\/Nocturna\//,"").replace(/^\//,""));
  if (!existsSync(imagePath)) throw new Error("Imagem editorial ausente: " + payload.image.src);
}
console.log("Editorial sincronizado: " + payloads.length + " arquivo(s).");
