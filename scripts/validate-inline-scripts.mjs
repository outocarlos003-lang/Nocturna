#!/usr/bin/env node
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("index.html", "utf8");
const errors = [];
let checked = 0;

for (const [index, match] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].entries()) {
  const [, attrs, source] = match;
  if (/\bsrc\s*=/i.test(attrs)) continue;
  const type = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
  if (type && !["text/javascript", "application/javascript", "module"].includes(type)) continue;
  if (!source.trim()) continue;

  checked++;
  const id = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1] || `inline-${index + 1}`;
  try {
    new vm.Script(source, { filename: `index.html#${id}` });
  } catch (error) {
    errors.push(`${id}: ${error.message}`);
  }
}

if (errors.length) {
  console.error("Inline JavaScript syntax errors:\n" + errors.join("\n"));
  process.exit(1);
}

console.log(`Inline JavaScript syntax validation passed (${checked} scripts checked).`);
