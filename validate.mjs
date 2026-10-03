// Uso: node validate.mjs
import { readFileSync, existsSync } from "node:fs";
const html = readFileSync("index.html", "utf8");
const DATA = new Function(html.match(/\/\*DATA\*\/([\s\S]*?)\/\*END DATA\*\/(?=)/)[1] + ";return DATA")();
const fail = [], ok = (c, m) => c || fail.push(m);
const slugs = ["metafisica", "teologia", "ficcao", "psicologia", "filosofia"];
ok(DATA.cats.map(c => c.slug).join() === slugs.join(), "cinco categorias e slugs");
ok(new Set(DATA.cats.map(c => c.id)).size === 5, "ids únicos");
const ids = new Set(DATA.pubs.map(p => p.id));
ok(ids.size === DATA.pubs.length, "publicações únicas");
DATA.pubs.forEach(p => (p.cats || []).forEach(k => ok(DATA.cats.some(c => c.id === k), `categoria inexistente em ${p.id}`)));
const man = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
ok(html.includes('rel="manifest" href="manifest.webmanifest"'), "manifest referenciado");
man.icons.forEach(i => ok(existsSync(i.src), `ícone ${i.src}`));
ok(existsSync("social-card.svg"), "social-card.svg");
ok(!/fetch\(|import\s|<script src|<link[^>]+stylesheet/.test(html), "sem dependências externas");
ok(DATA.contact.wa === "5569992353704", "WhatsApp normalizado");
console.log(fail.length ? "FALHAS:\n" + fail.join("\n") : "OK");
process.exit(fail.length ? 1 : 0);
