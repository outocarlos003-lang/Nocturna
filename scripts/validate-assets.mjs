import { readFileSync } from "node:fs";

const html=readFileSync("index.html","utf8");
if(!html.includes('id="nocturna-asset-loader"')) {
  throw new Error("Loader de assets com cache-busting não encontrado.");
}
if(/<link[^>]+href=["'][^"']*dark-romanticism\.css(?:["'?])/i.test(html)) {
  throw new Error("Referência estática ao dark-romanticism.css encontrada.");
}
if(/<script[^>]+src=["'][^"']*dark-romanticism\.js(?:["'?])/i.test(html)) {
  throw new Error("Referência estática ao dark-romanticism.js encontrada.");
}
if(/id=["']nocturna-dark-romanticism-(?:css|js)["']/i.test(html)) {
  throw new Error("Cópia inline antiga do Dark Romanticism encontrada.");
}
console.log("Asset loading validation: OK");
