import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function push(list, file, message) {
  list.push(`${file}: ${message}`);
}

function requireFile(file) {
  if (!exists(file)) push(errors, file, "required PWA asset is missing");
}

function pngSize(file) {
  const buffer = fs.readFileSync(path.join(root, file));
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function requireContains(file, text, message = `missing ${text}`) {
  if (!read(file).includes(text)) push(errors, file, message);
}

requireFile("public/manifest.webmanifest");
requireFile("public/sw.js");
requireFile("public/favicon-v2-48.png");
requireFile("public/favicon-v2-192.png");
requireFile("public/icon-512.png");
requireFile("public/maskable-icon-512.png");
requireFile("public/apple-touch-icon-v2.png");

if (!errors.length) {
  let manifest;
  try {
    manifest = JSON.parse(read("public/manifest.webmanifest"));
  } catch (error) {
    push(errors, "public/manifest.webmanifest", `invalid JSON: ${error.message}`);
  }

  if (manifest) {
    if (!manifest.name || manifest.name.length < 10) push(errors, "public/manifest.webmanifest", "name should describe the app");
    if (!manifest.short_name || manifest.short_name.length > 12) push(warnings, "public/manifest.webmanifest", "short_name should be concise for mobile home screens");
    if (manifest.start_url !== "/?source=pwa") push(errors, "public/manifest.webmanifest", "start_url should preserve the PWA source marker");
    if (manifest.scope !== "/") push(errors, "public/manifest.webmanifest", "scope should cover the whole app");
    if (manifest.display !== "standalone") push(errors, "public/manifest.webmanifest", "display should be standalone");
    if (manifest.orientation !== "portrait") push(warnings, "public/manifest.webmanifest", "orientation should stay portrait for phone-first study sessions");
    if (!manifest.theme_color || !manifest.background_color) push(errors, "public/manifest.webmanifest", "theme_color and background_color are required");

    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
    const iconSrcs = new Set(icons.map(icon => icon.src));
    for (const src of ["/favicon-v2-192.png", "/icon-512.png", "/maskable-icon-512.png"]) {
      if (!iconSrcs.has(src)) push(errors, "public/manifest.webmanifest", `missing icon ${src}`);
    }
    if (!icons.some(icon => String(icon.purpose || "").includes("maskable"))) {
      push(errors, "public/manifest.webmanifest", "missing maskable icon");
    }

    const shortcuts = Array.isArray(manifest.shortcuts) ? manifest.shortcuts : [];
    for (const url of ["/security-plus-daily-challenge/", "/security-plus-mcq-practice/"]) {
      if (!shortcuts.some(shortcut => shortcut.url === url)) {
        push(warnings, "public/manifest.webmanifest", `missing useful app shortcut ${url}`);
      }
    }
  }

  for (const [file, expected] of [
    ["public/favicon-v2-48.png", 48],
    ["public/favicon-v2-192.png", 192],
    ["public/icon-512.png", 512],
    ["public/maskable-icon-512.png", 512],
    ["public/apple-touch-icon-v2.png", 180],
  ]) {
    const size = pngSize(file);
    if (!size) {
      push(errors, file, "must be a PNG image");
      continue;
    }
    if (size.width !== expected || size.height !== expected) {
      push(errors, file, `expected ${expected}x${expected}, found ${size.width}x${size.height}`);
    }
  }

  requireContains("index.html", '<link rel="manifest" href="/manifest.webmanifest" />', "index.html must link the web app manifest");
  requireContains("index.html", 'name="theme-color"', "index.html must set theme-color");
  requireContains("index.html", 'name="apple-mobile-web-app-capable" content="yes"', "index.html must support iOS home-screen mode");
  requireContains("index.html", 'rel="apple-touch-icon"', "index.html must include an Apple touch icon");
  requireContains("src/main.jsx", 'navigator.serviceWorker.register("/sw.js")', "production app must register the service worker");
  requireContains("src/main.jsx", "import.meta.env.PROD", "service worker registration should only run in production");

  const serviceWorker = read("public/sw.js");
  for (const asset of [
    "/",
    "/manifest.webmanifest",
    "/favicon-v2-192.png",
    "/icon-512.png",
    "/maskable-icon-512.png",
    "/secureplus-logo.png",
  ]) {
    if (!serviceWorker.includes(`"${asset}"`)) push(errors, "public/sw.js", `app shell should cache ${asset}`);
  }
  requireContains("public/sw.js", "request.mode === \"navigate\"", "service worker must handle offline navigation");
  requireContains("public/sw.js", "caches.keys()", "service worker must clean old caches on activate");
}

console.log("PWA/mobile readiness audit");
console.log("- Checked manifest, mobile meta tags, app icons, and service worker registration");

if (errors.length) {
  console.error(`\nFound ${errors.length} PWA issue${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`\nPWA warnings (${warnings.length}):`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

console.log("PWA/mobile readiness audit passed with no structural errors.");
