import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const siteUrl = "https://www.secureplusprep.com";
const requiredTerms = ["Security+", "SecurePlus"];
const softwareApplicationPages = new Set([
  "security-plus-acronyms",
  "security-plus-cryptography-practice",
  "security-plus-daily-challenge",
  "security-plus-domain-1-practice",
  "security-plus-domain-2-practice",
  "security-plus-domain-3-practice",
  "security-plus-domain-4-practice",
  "security-plus-domain-5-practice",
  "security-plus-flashcards",
  "security-plus-mcq-practice",
  "security-plus-pbq-practice",
  "security-plus-port-numbers",
  "security-plus-practice-questions",
]);
const consolidatedPageSlugs = new Set([
  "security-plus-comptia-practice-test",
  "security-plus-comptia-study-guide",
  "security-plus-free-comptia-practice",
  "security-plus-firewall-pbq-practice",
  "security-plus-pbq-practices",
  "security-plus-study-notes",
  "security-plus-sy0-701-practice",
  "sy0-601-pbq-practice",
]);
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

function jsonLdObjects(html, file) {
  const scripts = [...html.matchAll(/<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
  const objects = [];
  for (const script of scripts) {
    try {
      objects.push(JSON.parse(script));
    } catch (error) {
      push(errors, file, `invalid JSON-LD: ${error.message}`);
    }
  }
  return objects;
}

function flattenStructuredData(items) {
  return items.flatMap(item => Array.isArray(item?.["@graph"]) ? item["@graph"] : item ? [item] : []);
}

function hasSchemaType(items, type) {
  return items.some(item => {
    const itemType = item?.["@type"];
    return Array.isArray(itemType) ? itemType.includes(type) : itemType === type;
  });
}

function publicPageFiles() {
  return fs
    .readdirSync(publicDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && (entry.name.startsWith("security-plus-") || entry.name.startsWith("sy0-")))
    .filter(entry => !consolidatedPageSlugs.has(entry.name))
    .map(entry => `public/${entry.name}/index.html`)
    .filter(file => fs.existsSync(path.join(root,file)))
    .sort();
}

const interactiveSeoPages = ["security-plus-flashcards/index.html"];
const pageFiles = ["index.html", ...publicPageFiles(), ...interactiveSeoPages].sort();
const sitemap = read("public/sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
function pageSlug(file) {
  if(file==="index.html")return "";
  return file.startsWith("public/")?file.split("/")[1]:file.split("/")[0];
}

const staticPageUrls = [...publicPageFiles(), ...interactiveSeoPages].map(file => `${siteUrl}/${pageSlug(file)}/`);
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
  const slug=pageSlug(file);
  const route = file === "index.html" ? "/" : `/${slug}/`;
  const canonical = getTag(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const title = getTag(html, /<title>(.*?)<\/title>/is);
  const description = getTag(html, /<meta\s+name="description"\s+content="([^"]+)"/i);
  const h1 = getTag(html, /<h1\b[^>]*>(.*?)<\/h1>/is);
  const structuredItems = flattenStructuredData(jsonLdObjects(html, file));

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

  if (!structuredItems.length) push(warnings, file, "missing JSON-LD structured data");
  if (file === "index.html" && !hasSchemaType(structuredItems, "SoftwareApplication")) {
    push(warnings, file, "root app JSON-LD should include SoftwareApplication");
  }
  if (file !== "index.html") {
    const isInteractiveEntry=interactiveSeoPages.includes(file);
    if (!isInteractiveEntry&&!html.includes('class="lead"')) push(errors, file, "missing short explanation lead copy");
    if (!isInteractiveEntry&&!html.includes('class="cta"')) push(errors, file, "missing CTA block to start practice");
    if (!html.includes("Original scenario-based practice. Not exam dumps.")) {
      push(errors, file, "missing original-practice disclaimer");
    }
    if (!isInteractiveEntry&&!html.includes("seo-sample-question")) {
      push(errors, file, "missing visible sample question section");
    }
    if (!hasSchemaType(structuredItems, "Course")) push(errors, file, "missing Course JSON-LD");
    if (!hasSchemaType(structuredItems, "FAQPage")) push(errors, file, "missing FAQPage JSON-LD");
    if (!isInteractiveEntry&&!html.includes('class="wrap card seo-faq"')) push(errors, file, "FAQPage JSON-LD must match a visible FAQ block");
    if (isInteractiveEntry&&!html.includes('src="/src/main.jsx"')) push(errors, file, "interactive SEO entry must hydrate the React application");
    if (softwareApplicationPages.has(slug) && !hasSchemaType(structuredItems, "SoftwareApplication")) {
      push(errors, file, "practice-oriented page is missing SoftwareApplication JSON-LD");
    }
  }
}

const sy0701Path = "/security-plus-practice-questions/";
for (const file of pageFiles) {
  if (!read(file).includes(sy0701Path)) push(errors, file, `missing internal link to ${sy0701Path}`);
}

const flashcardsPath = "/security-plus-flashcards/";
for (const file of pageFiles) {
  if (!read(file).includes(flashcardsPath)) push(errors, file, `missing internal link to ${flashcardsPath}`);
}

const flashcardsPage = read("security-plus-flashcards/index.html");
for (const proof of ["313", "29", "General Security Concepts", "Security Operations", "Not exam dumps."]) {
  if (!flashcardsPage.includes(proof)) push(errors, "security-plus-flashcards/index.html", `missing flashcard proof: ${proof}`);
}

const vercelConfig=JSON.parse(read("vercel.json"));
const flashcardRedirect=(vercelConfig.redirects||[]).find(route=>route.source===flashcardsPath);
if(flashcardRedirect)push(errors,"vercel.json",`${flashcardsPath} must return the interactive HTTP-200 entry instead of redirecting`);

const expectedConsolidationRedirects = [
  ["/security-plus-comptia-practice-test/", "/security-plus-practice-questions/"],
  ["/security-plus-comptia-study-guide/", "/security-plus-study-guide/"],
  ["/security-plus-free-comptia-practice/", "/security-plus-practice-questions/"],
  ["/security-plus-sy0-701-practice/", "/security-plus-practice-questions/"],
  ["/security-plus-firewall-pbq-practice/", "/security-plus-pbq-practice/"],
  ["/security-plus-pbq-practices/", "/security-plus-pbq-practice/"],
  ["/security-plus-study-notes/", "/security-plus-study-guide/"],
  ["/sy0-601-pbq-practice/", "/sy0-601-vs-sy0-701/"],
];
for (const [source,destination] of expectedConsolidationRedirects) {
  const redirect=(vercelConfig.redirects||[]).find(route=>route.source===source);
  if(!redirect)push(errors,"vercel.json",`missing consolidation redirect from ${source}`);
  else if(redirect.destination!==destination||redirect.permanent!==true) {
    push(errors,"vercel.json",`${source} should permanently redirect to ${destination}`);
  }
  if(sitemapUrls.includes(`${siteUrl}${source}`)) {
    push(errors,"public/sitemap.xml",`consolidated URL should not remain in sitemap: ${source}`);
  }
}
if (sitemap.includes("free-comptia")) {
  push(errors, "public/sitemap.xml", "sitemap should not advertise free-branded practice URLs");
}
if (sitemapUrls.length > 18) {
  push(errors, "public/sitemap.xml", `sitemap should stay focused after consolidation, found ${sitemapUrls.length} URLs`);
}

if (!appFallback.includes("CompTIA Security+ PBQ, MCQ, and flashcard practice site")) {
  push(warnings, "index.html", "fallback HTML should describe the PBQ, MCQ, and flashcard practice site");
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
