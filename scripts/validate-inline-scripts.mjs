import { readFileSync } from "node:fs";

const file = "index.html";
const html = readFileSync(file, "utf8");
const scripts = [...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)];
const failures = [];
let checked = 0;

for (const [index, match] of scripts.entries()) {
  const attrs = match[1] || "";
  const source = match[2] || "";
  const type = attrs.match(/\\btype\\s*=\\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();

  // JSON-LD and other data script blocks are not executable JavaScript.
  if (type && !["text/javascript", "application/javascript", "module", "text/ecmascript", "application/ecmascript"].includes(type)) {
    continue;
  }

  const id = attrs.match(/\\bid\\s*=\\s*["']([^"']+)["']/i)?.[1] || `inline-script-${index + 1}`;
  try {
    // The published index uses classic inline scripts. Parsing without running
    // catches syntax errors while avoiding side effects from application code.
    new Function(source);
    checked++;
  } catch (error) {
    failures.push(`${id}: ${error.message}`);
  }
}

if (failures.length) {
  console.error(`JavaScript syntax validation failed for ${failures.length} inline script(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Inline JavaScript syntax valid: ${checked} executable script(s) checked in ${file}.`);
}
