/**
 * LiteSpeed-style static build: CSS + split game JS (core + extras).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { minify } from "terser";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const write = (p, s) => fs.writeFileSync(path.join(root, p), s);

function minifyCss(parts) {
  let css = parts
    .map((p) => {
      let chunk = read(p);
      // When bundling into /css/, rewrite font urls from style/fonts/
      if (p.indexOf("clear-sans.css") !== -1) {
        chunk = chunk.replace(
          /url\("([^"]+\.woff)"\)/g,
          'url("../style/fonts/$1")'
        );
      }
      return chunk;
    })
    .join("\n");
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

async function minifyJs(parts, outFile) {
  const joined = parts.map(read).join("\n;\n");
  const out = await minify(joined, {
    compress: { passes: 2 },
    mangle: true,
    format: { comments: false }
  });
  if (!out.code) throw new Error("terser failed for " + outFile);
  write(outFile, out.code);
  console.log(outFile, Math.round(out.code.length / 1024) + "KB");
}

const appCss = minifyCss([
  // fonts loaded separately (non-blocking) for faster FCP
  "style/main.css",
  "css/site.css",
  "css/responsive.css"
]);
write("css/app.min.css", appCss);
console.log("css/app.min.css", Math.round(appCss.length / 1024) + "KB");

const extrasCss = minifyCss([
  "css/juice.css",
  "css/enhancements.css",
  "css/fun.css"
]);
write("css/extras.min.css", extrasCss);
console.log("css/extras.min.css", Math.round(extrasCss.length / 1024) + "KB");

write("css/content.min.css", minifyCss(["css/content.css"]));
console.log("css/content.min.css", Math.round(fs.statSync(path.join(root, "css/content.min.css")).size / 1024) + "KB");

await minifyJs(
  [
    "js/bind_polyfill.js",
    "js/classlist_polyfill.js",
    "js/animframe_polyfill.js",
    "js/l10n.js",
    "js/localization.js",
    "js/keyboard_input_manager.js",
    "js/html_actuator.js",
    "js/grid.js",
    "js/tile.js",
    "js/local_storage_manager.js",
    "js/game_manager.js",
    "js/application.js"
  ],
  "js/game-core.min.js"
);

await minifyJs(
  [
    "js/sounds.js",
    "js/effects.js",
    "js/game-juice.js",
    "js/enhancements.js",
    "js/play-modes.js",
    "js/fun.js",
    "js/game-extras-boot.js"
  ],
  "js/game-extras.min.js"
);
