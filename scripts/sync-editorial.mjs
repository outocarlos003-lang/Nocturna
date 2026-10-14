import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = process.cwd();
const indexPath = join(root, "index.html");
const editorialDir = join(root, "editorial", "posts");
const source = readFileSync(indexPath, "utf8");
const match = source.match(/const DATA=(\{[\s\S]*?\});\s*\/\*END DATA\*\//);
if (!match) throw new Error("DATA editorial não encontrada em index.html");
const DATA = vm.runInNewContext("(" + match[1] + ")");
if (!Array.isArray(DATA.pubs)) throw new Error("DATA.pubs inválido em index.html");

const scalar = v => {
  const s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
  if (s === "true") return true;
  if (s === "false") return false;
  return s;
};
const array = v => {
  const s = v.trim().slice(1, -1);
  const out = [];
  let buf = "", quote = null, depth = 0;
  for (const ch of s) {
    if (quote) { buf += ch; if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
    if (ch === "[" || ch === "{") depth++;
    if (ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) { if (buf.trim()) out.push(scalar(buf)); buf = ""; }
    else buf += ch;
  }
  if (buf.trim()) out.push(scalar(buf));
  return out;
};
const parse = (raw, file) => {
  if (!raw.startsWith("---\n")) throw new Error(`Front matter ausente: ${file}`);
  const end = raw.indexOf("\n---", 4);
  if (end < 0) throw new Error(`Front matter sem fechamento: ${file}`);
  const meta = {};
  for (const line of raw.slice(4, end).split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i < 1) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
    meta[k] = v.startsWith("[") && v.endsWith("]") ? array(v) : scalar(v);
  }
  for (const k of ["id","title","date","summary","cats","tags","image","imageAlt","imageCaption"]) if (meta[k] === undefined) throw new Error(`Campo obrigatório '${k}' ausente em ${file}`);
  if (!Array.isArray(meta.cats) || !Array.isArray(meta.tags)) throw new Error(`cats/tags inválidos em ${file}`);
  return { meta, body: raw.slice(end + 4).replace(/^\n/, "").replace(/\r\n/g, "\n") };
};

const incoming = readdirSync(editorialDir).filter(f => f.endsWith(".md")).sort().map(f => parse(readFileSync(join(editorialDir, f), "utf8"), f));
const byId = new Map(DATA.pubs.map(p => [p.id, p]));
for (const { meta, body } of incoming) byId.set(meta.id, {
  ...byId.get(meta.id), id: meta.id, title: meta.title, date: meta.date, featured: meta.featured ?? false,
  summary: meta.summary, cats: meta.cats, tags: meta.tags,
  image: { src: meta.image, alt: meta.imageAlt, caption: meta.imageCaption }, content: body
});
DATA.pubs = [...byId.values()].sort((a,b) => String(b.date||"").localeCompare(String(a.date||"")) || String(a.title||"").localeCompare(String(b.title||""), "pt"));
writeFileSync(indexPath, source.replace(match[1], JSON.stringify(DATA)), "utf8");
console.log(`Sincronizadas ${incoming.length} fontes editoriais; DATA.pubs=${DATA.pubs.length}.`);
