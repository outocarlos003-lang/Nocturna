// Uso: node scripts/sitemap.mjs https://URL-PUBLICA-REAL/
// Gera sitemap.xml somente com URL base real informada (nunca inventada).
import { writeFileSync } from "node:fs";
const base = process.argv[2];
if (!/^https?:\/\/.+\/$/.test(base || "")) { console.error("Informe a URL pública real terminando em /"); process.exit(1); }
writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}</loc></url></urlset>\n`);
console.log("sitemap.xml gerado");
