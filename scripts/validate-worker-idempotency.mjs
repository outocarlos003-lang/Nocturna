import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worker = readFileSync(new URL("../index.js", import.meta.url), "utf8");

// The idempotency guard must walk every page until it finds the source ID
// or reaches the final (short) page; checking only page 1 can duplicate replies.
assert.match(worker, /for\s*\(\s*let page = 1;\s*;\s*page\+\+\s*\)/);
assert.match(worker, /comments\?per_page=100&page=\$\{page\}/);
assert.match(worker, /comments\.find\(comment => String\(comment\.body \|\| ""\)\.includes\(\`source-id=\$\{sourceId\}\`\)\)/);
assert.match(worker, /if\s*\(existing\s*\|\|\s*comments\.length\s*<\s*100\)\s*break/);
assert.doesNotMatch(worker, /issues\/\$\{ISSUE\}\/comments\?per_page=100\`/);

console.log("Worker idempotency pagination checks passed.");
