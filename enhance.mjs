import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const root=process.cwd(),index=join(root,"index.html");
let html=readFileSync(index,"utf8");
if(!html.includes('id="nocturna-asset-loader"')){
  throw new Error("Loader de assets do Nocturna ausente. Não inline CSS/JS; restaure o loader antes de executar enhance.mjs.");
}
writeFileSync(index,html,"utf8");
console.log("Artifact preservado: Dark Romanticism usa cache-busting automático.");
