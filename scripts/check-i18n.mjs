// Verifies every locale dictionary has exactly the same key structure as English
// (including array lengths), and that no value is empty. Run in CI: npm run i18n:check
import { readFileSync } from "node:fs";

const load = (l) => JSON.parse(readFileSync(new URL(`../messages/${l}.json`, import.meta.url), "utf8"));
const base = load("en");
const locales = ["zh-TW"];
let errors = 0;

function walk(a, b, path, locale) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return report(`${path}: expected array`, locale);
    if (a.length !== b.length) report(`${path}: array length ${b.length} ≠ ${a.length}`, locale);
    a.forEach((v, i) => walk(v, b[i], `${path}[${i}]`, locale));
  } else if (a && typeof a === "object") {
    if (!b || typeof b !== "object") return report(`${path}: expected object`, locale);
    for (const k of Object.keys(a)) {
      if (!(k in b)) report(`${path}.${k}: missing`, locale);
      else walk(a[k], b[k], `${path}.${k}`, locale);
    }
    for (const k of Object.keys(b)) if (!(k in a)) report(`${path}.${k}: extra key`, locale);
  } else if (typeof a !== typeof b) {
    report(`${path}: type ${typeof b} ≠ ${typeof a}`, locale);
  } else if (typeof b === "string" && b.trim() === "") {
    report(`${path}: empty string`, locale);
  }
}

function report(msg, locale) {
  errors++;
  console.error(`[${locale}] ${msg}`);
}

for (const l of locales) walk(base, load(l), "$", l);
if (errors) {
  console.error(`\n✗ ${errors} i18n issue(s) found`);
  process.exit(1);
}
console.log("✓ All locale dictionaries match the English structure");
