import fs from "fs";
const t = fs.readFileSync("index.html", "utf8");
const a = fs.readFileSync("css/app.min.css", "utf8");
console.log({
  FFE8: t.includes("#FFE8F0"),
  schedule: t.includes("5500"),
  fontPreload: /as="font"/.test(t),
  appLite: a.includes("#FFE8F0"),
  seoWrapped: t.includes('DOMContentLoaded") && t.includes("applySeoMeta"),
  lateCore: t.includes("timeout: 8000"),
  emdash: t.includes("\u2014"),
  v38: t.includes("app.min.css?v=38")
});
