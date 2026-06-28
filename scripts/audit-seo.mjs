import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const siteUrl = "https://www.secureplusprep.com";
const requiredTerms = ["Security+", "SecurePlus"];
const errors = [];
const warnings = [];

function push(list, file, message) {
  list.push(`${file}: ${message}`);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function getTag(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ");
}

function publicPageFiles() {
  return fs
    .readdirSync(publicDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith("security-plus-"))
    .map(entry => `public/${entry.name}/index.html`)
    .sort();
}

const pageFiles = ["index.html", ...publicPageFiles()];
const sitemap = read("public/sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const staticPageUrls = publicPageFiles().map(file => `${siteUrl}/${file.split("/")[1]}/`);
const appFallback = read("index.html");

if (!read("public/robots.txt").includes(`${siteUrl}/sitemap.xml`)) {
  push(errors, "public/robots.txt", "missing absolute sitemap URL");
}

for (const url of [`${siteUrl}/`, ...staticPageUrls]) {
  if (!sitemapUrls.includes(url)) push(errors, "public/sitemap.xml", `missing ${url}`);
}

for (const file of pageFiles) {
  const html = read(file);
  const visibleText = stripTags(html);
  const route = file === "index.html" ? "/" : `/${file.split("/")[1]}/`;
  const canonical = getTag(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const title = getTag(html, /<title>(.*?)<\/title>/is);
  const description = getTag(html, /<meta\s+name="description"\s+content="([^"]+)"/i);
  const h1 = getTag(html, /<h1\b[^>]*>(.*?)<\/h1>/is);

  if (canonical !== `${siteUrl}${route}`) push(errors, file, `canonical should be ${siteUrl}${route}`);
  if (!title || title.length < 35 || title.length > 70) push(warnings, file, `title length should be 35-70 characters, found ${title.length}`);
  if (!description || description.length < 90 || description.length > 170) push(warnings, file, `description length should be 90-170 characters, found ${description.length}`);
  if (!h1) push(errors, file, "missing h1");

  for (const term of requiredTerms) {
    if (!visibleText.includes(term) && !title.includes(term) && !description.includes(term)) {
      push(warnings, file, `does not mention ${term}`);
    }
  }

  if (!html.includes('property="og:title"')) push(warnings, file, "missing Open Graph title");
  if (!html.includes('property="og:image"')) push(warnings, file, "missing Open Graph image");
}

const sy0701Path = "/security-plus-sy0-701-practice/";
for (const file of pageFiles) {
  if (!read(file).includes(sy0701Path)) push(errors, file, `missing internal link to ${sy0701Path}`);
}

if (!appFallback.includes("CompTIA Security+ PBQ / MCQ practice site")) {
  push(warnings, "index.html", "fallback HTML should describe the PBQ / MCQ practice site");
}

console.log("SEO audit");
console.log(`- Checked pages: ${pageFiles.length}`);
console.log(`- Sitemap URLs: ${sitemapUrls.length}`);

if (errors.length) {
  console.error(`\nFound ${errors.length} SEO error${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`\nSEO warnings (${warnings.length}):`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

console.log("SEO audit passed with no structural errors.");
