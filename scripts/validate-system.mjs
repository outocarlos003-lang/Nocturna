#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const fail = message => errors.push(message);
const exists = relativePath => fs.existsSync(path.join(root, relativePath));

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
}
walk(root);

const htmlFiles = files.filter(file => file.endsWith(".html"));
for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const ref = match[1].trim();
    if (!ref || ref.includes("${") || ref.startsWith("#") || /^(?:https?:|mailto:|tel:|data:|javascript:|blob:)/i.test(ref)) continue;
    const clean = ref.split(/[?#]/, 1)[0];
    if (!clean) continue;
    let target;
    if (clean.startsWith("/Nocturna/")) target = clean.slice("/Nocturna/".length);
    else if (clean.startsWith("/")) target = clean.slice(1);
    else target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), clean));
    if (target === "") target = "index.html";
    const fileTarget = exists(target);
    const directoryTarget = exists(target.replace(/\/$/, "/index.html"));
    if (!fileTarget && !directoryTarget && /\.[A-Za-z0-9]+$/.test(target)) {
      fail(`${rel}: referência local ausente -> ${ref}`);
    }
  }
}

for (const required of [
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "icon.svg",
  "social-card.svg",
  "index.html",
  "404.html",
  "data/comments/issue-1.json",
  "index.js",
  "wrangler.jsonc"
]) if (!exists(required)) fail(`arquivo estrutural ausente: ${required}`);

if (exists("manifest.webmanifest")) {
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8")); }
  catch (error) { fail(`manifest.webmanifest inválido: ${error.message}`); manifest = null; }
  for (const icon of manifest?.icons || []) {
    const iconPath = String(icon.src || "").replace(/^\/Nocturna\//, "").replace(/^\//, "");
    if (!iconPath || !exists(iconPath)) fail(`manifest: ícone ausente -> ${icon.src}`);
  }
  if (manifest && manifest.start_url !== "/Nocturna/") fail("manifest: start_url deve apontar para /Nocturna/");
  if (manifest && manifest.scope !== "/Nocturna/") fail("manifest: scope deve apontar para /Nocturna/");
}

if (exists("wrangler.jsonc")) {
  let wrangler;
  try {
    const source = fs.readFileSync(path.join(root, "wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, "");
    wrangler = JSON.parse(source);
  } catch (error) { fail(`wrangler.jsonc inválido: ${error.message}`); }
  if (wrangler?.main && !exists(wrangler.main)) fail(`wrangler: main ausente -> ${wrangler.main}`);
  if (wrangler?.main !== "index.js") fail("wrangler: main deve apontar para index.js");
}

const workflowDir = path.join(root, ".github/workflows");
if (fs.existsSync(workflowDir)) {
  for (const name of fs.readdirSync(workflowDir).filter(file => /\.ya?ml$/.test(file))) {
    const workflow = fs.readFileSync(path.join(workflowDir, name), "utf8");
    for (const match of workflow.matchAll(/(?:node\s+|node\s+-{1,2}[A-Za-z-]+\s+)([\w./-]+\.(?:mjs|js))/g)) {
      if (!exists(match[1])) fail(`${name}: script de workflow ausente -> ${match[1]}`);
    }
  }
}

if (exists("data/comments/issue-1.json")) {
  try {
    const projection = JSON.parse(fs.readFileSync(path.join(root, "data/comments/issue-1.json"), "utf8"));
    if (projection.issue?.rootNodeId && !projection.nodes?.some(node => String(node.nodeId) === String(projection.issue.rootNodeId))) {
      fail("projeção: issue.rootNodeId sem nó correspondente");
    }
  } catch (error) { fail(`projeção canônica inválida: ${error.message}`); }
}

if (exists("index.html")) {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  if (!html.includes('rel="manifest" href="/Nocturna/manifest.webmanifest"')) fail("index.html: manifest não referenciado pelo caminho canônico");
  if (!html.includes('content="/Nocturna/social-card.svg"')) fail("index.html: og:image não aponta para social-card.svg");
}

if (errors.length) {
  console.error("FALHAS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${files.length} arquivos; ${htmlFiles.length} HTMLs; referências e configuração estrutural verificadas.`);
