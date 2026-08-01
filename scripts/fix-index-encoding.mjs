import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "index.html");
let t = fs.readFileSync(file, "utf8");

const pairs = [
  ["\u00e2\u20ac\u201d", "\u2014"],
  ["\u00e2\u20ac\u201c", "\u2014"],
  ["\u00e2\u20ac\u00a6", "\u2026"],
  ["\u00c2\u00b7", "\u00b7"]
];

for (const [a, b] of pairs) {
  const n = t.split(a).length - 1;
  if (n) {
    t = t.split(a).join(b);
    console.log("replaced", n, "->", b);
  }
}

t = t.replace(/Cupcakes .{1,8} Play Free/g, "Cupcakes \u2014 Play Free");
t = t.replace(/download .{1,8} works on/g, "download \u2014 works on");
t = t.replace(/Game first .{1,8} visible/g, "Game first \u2014 visible");
t = t.replace(/Cupcakes .{1,8} free cupcake/g, "Cupcakes \u2014 free cupcake");
t = t.replace(/puzzle .{1,8} merge cupcakes/g, "puzzle \u2014 merge cupcakes");
t = t.replace(/Loading guide.{1,4}</g, "Loading guide\u2026<");
t = t.replace(/only .{1,8} keyboard/g, "only \u2014 keyboard");
t = t.replace(/title="Settings">.{1,4}<\/button>/, 'title="Settings">\u2699</button>');
t = t.replace(
  /mobile-play-hint">.{1,8} Swipe to move .{1,4} Desktop/,
  "mobile-play-hint\">\uD83D\uDC46 Swipe to move \u00B7 Desktop"
);
t = t.replace(/<summary>.{1,8} Tile Legend/, "<summary>\uD83D\uDCCB Tile Legend");
t = t.replace(/Back to top" hidden>.{1,4}<\/button>/, 'Back to top" hidden>\u2191</button>');

// Footer separators in noscript block
t = t.replace(/(Play<\/a>)\s*.\s*(?=\n\s*<a href="how-to-play)/, "$1 \u00B7");
t = t.replace(/(How to Play<\/a>)\s*.\s*(?=\n\s*<a href="about)/, "$1 \u00B7");
t = t.replace(/(About<\/a>)\s*.\s*(?=\n\s*<a href="contact)/, "$1 \u00B7");
t = t.replace(/(Contact<\/a>)\s*.\s*(?=\n\s*<a href="privacy)/, "$1 \u00B7");
t = t.replace(/(Privacy<\/a>)\s*.\s*(?=\n\s*<a href="terms)/, "$1 \u00B7");

t = t.replace(/content\.min\.css\?v=\d+/g, "content.min.css?v=37");
t = t.replace(/extras\.min\.css\?v=\d+/g, "extras.min.css?v=37");
t = t.replace(/content-ui\.min\.js\?v=\d+/g, "content-ui.min.js?v=9");

fs.writeFileSync(file, t, "utf8");
console.log(JSON.stringify(t.split(/\n/)[4]));
console.log("emdash", t.includes("\u2014"));
console.log("v37", t.includes("content.min.css?v=37"));
console.log("v9", t.includes("content-ui.min.js?v=9"));
