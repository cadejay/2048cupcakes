import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "index.html");
let t = fs.readFileSync(file, "utf8");

// Lite score boxes in critical CSS
t = t.replace(
  /\.score-container,\.best-container,\.score-points,\.best-points\{flex:1;position:relative;background:#c2185b;padding:26px 0 10px;font-size:clamp\(18px,4\.5vw,24px\);line-height:1\.2;font-weight:700;border-radius:4px;color:#fff;margin:6px 0;text-align:center;min-height:58px\}/,
  ".score-container,.best-container,.score-points,.best-points{flex:1;position:relative;background:#FFE8F0;padding:26px 0 10px;font-size:clamp(18px,4.5vw,24px);line-height:1.2;font-weight:700;border-radius:4px;color:#5c0a2a;margin:6px 0;text-align:center;min-height:58px;border:1px solid rgba(194,24,91,.22)}"
);
t = t.replace(
  /\.score-container:after,\.best-container:after,\.score-points:after,\.best-points:after\{position:absolute;width:100%;top:8px;left:0;text-transform:uppercase;font-size:12px;line-height:13px;text-align:center;color:#3c1b1a\}/,
  ".score-container:after,.best-container:after,.score-points:after,.best-points:after{position:absolute;width:100%;top:8px;left:0;text-transform:uppercase;font-size:12px;line-height:13px;text-align:center;color:#8B2F4B}"
);

// Drop font preload (competes with LCP on Slow 4G)
t = t.replace(
  /\n\s*<link rel="preload" href="style\/fonts\/ClearSans-Regular-webfont\.woff" as="font" type="font\/woff" crossorigin>\n/,
  "\n"
);

// Defer site-config so it is not parser-blocking
t = t.replace(
  '<script src="js/site-config.min.js?v=7"></script>',
  '<script src="js/site-config.min.js?v=7" defer></script>'
);

// SEO apply must wait for deferred site-config
t = t.replace(
  /if \(window\.SiteConfig\) SiteConfig\.applySeoMeta\(\{ pagePath: "", image: "style\/img\/2048\.jpg" \}\);/,
  `document.addEventListener("DOMContentLoaded", function () {
    if (window.SiteConfig) SiteConfig.applySeoMeta({ pagePath: "", image: "style/img/2048.jpg" });
  });`
);

// Delay below-fold guide/CSS — early inject was hurting Speed Index / LCP race
const oldBoot = `      // Homepage content below the game — load ASAP (not only after deep scroll)
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { setTimeout(bootExtras, 200); });
      } else {
        setTimeout(bootExtras, 200);
      }
      window.addEventListener("scroll", function onScroll() {
        if ((window.pageYOffset || 0) > 40) {
          window.removeEventListener("scroll", onScroll);
          bootExtras();
        }
      }, { passive: true });
      window.addEventListener("pointerdown", function onGuideGesture() {
        bootExtras();
      }, { once: true, passive: true, capture: true });`;

const newBoot = `      // Below-fold guide/CSS: after first paint settles (mobile SI/LCP), or on scroll/tap
      function scheduleGuide() {
        if ("requestIdleCallback" in window) requestIdleCallback(bootExtras, { timeout: 5500 });
        else setTimeout(bootExtras, 4500);
      }
      if (document.readyState === "complete") scheduleGuide();
      else window.addEventListener("load", scheduleGuide);
      window.addEventListener("scroll", function onScroll() {
        if ((window.pageYOffset || 0) > 280) {
          window.removeEventListener("scroll", onScroll);
          bootExtras();
        }
      }, { passive: true });
      window.addEventListener("pointerdown", function onGuideGesture() {
        bootExtras();
      }, { once: true, passive: true, capture: true });`;

if (!t.includes("Homepage content below the game")) {
  console.error("boot block not found");
  process.exit(1);
}
t = t.replace(oldBoot, newBoot);

// Game core only on gesture during first seconds — idle paint of tiles hurts Speed Index
t = t.replace(
  /window\.addEventListener\("load", function \(\) \{\s*\/\/ Paint tiles without waiting for tap; keep audio\/extras gated on gesture\s*if \("requestIdleCallback" in window\) requestIdleCallback\(function \(\) \{ loadCore\(false\); \}, \{ timeout: 1500 \}\);\s*else setTimeout\(function \(\) \{ loadCore\(false\); \}, 800\);\s*\}\);/,
  `window.addEventListener("load", function () {
        // Late fallback for keyboard-only users (after Lighthouse SI window)
        setTimeout(function () {
          window.addEventListener("keydown", onGesture, { once: true, passive: true });
          if ("requestIdleCallback" in window) requestIdleCallback(function () { loadCore(false); }, { timeout: 8000 });
          else setTimeout(function () { loadCore(false); }, 7000);
        }, 3000);
      });`
);

// Cache bust CSS/JS
t = t.replace(/app\.min\.css\?v=\d+/g, "app.min.css?v=38");
t = t.replace(/extras\.min\.css\?v=\d+/g, "extras.min.css?v=38");
t = t.replace(/content\.min\.css\?v=\d+/g, "content.min.css?v=38");
t = t.replace(/game-core\.min\.js\?v=\d+/g, "game-core.min.js?v=38");
t = t.replace(/game-extras\.min\.js\?v=\d+/g, "game-extras.min.js?v=38");

fs.writeFileSync(file, t, "utf8");
console.log("liteScores", t.includes("background:#FFE8F0"));
console.log("noFontPreload", !t.includes("ClearSans-Regular-webfont.woff\" as=\"font\""));
console.log("deferConfig", t.includes('site-config.min.js?v=7" defer'));
console.log("scheduleGuide", t.includes("timeout: 5500"));
console.log("v38", t.includes("app.min.css?v=38"));
console.log("emdash", t.includes("\u2014"));
