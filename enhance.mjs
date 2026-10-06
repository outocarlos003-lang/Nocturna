import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const root=process.cwd(),index=join(root,"index.html");
let html=readFileSync(index,"utf8"),css=readFileSync(join(root,"dark-romanticism.css"),"utf8"),js=readFileSync(join(root,"dark-romanticism.js"),"utf8");
const cssTag='<style id="nocturna-dark-romanticism-css">\n'+css+'\n</style>',jsTag='<script id="nocturna-dark-romanticism-js">\n'+js+'\n</script>';
if(!html.includes('id="nocturna-dark-romanticism-css"'))html=html.replace("</head>",cssTag+"</head>");
if(!html.includes('id="nocturna-dark-romanticism-js"'))html=html.replace("</body>",jsTag+"</body>");
writeFileSync(index,html,"utf8");console.log("Camada Dark Romanticism inline aplicada ao artifact do GitHub Pages.");