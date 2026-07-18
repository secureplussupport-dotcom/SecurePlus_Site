import {
  CONCEPT_DEEP_DIVES,
  CONCEPT_DEEP_DIVE_CATEGORIES,
  CONCEPT_DEEP_DIVE_REVIEWED_AT,
} from "../src/data/conceptDeepDives.js";
import { buildDeepDiveDeck, buildDeepDiveFlashcards } from "../src/lib/deepDiveStudy.js";

const failures = [];
const requireValue = (condition, message) => {
  if (!condition) failures.push(message);
};
const words = value => String(value || "").trim().split(/\s+/).filter(Boolean).length;
const unique = values => new Set(values).size === values.length;
const primaryDomains = [
  "attack.mitre.org",
  "cheatsheetseries.owasp.org",
  "cisa.gov",
  "csrc.nist.gov",
  "cwe.mitre.org",
  "edpb.europa.eu",
  "eur-lex.europa.eu",
  "fidoalliance.org",
  "first.org",
  "iana.org",
  "icann.org",
  "learn.microsoft.com",
  "nist.gov",
  "oasis-open.org",
  "openid.net",
  "owasp.org",
  "rfc-editor.org",
];
const isPrimaryDomain = hostname => primaryDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));

requireValue(CONCEPT_DEEP_DIVES.length >= 32, `Expected at least 32 lessons; found ${CONCEPT_DEEP_DIVES.length}.`);
requireValue(unique(CONCEPT_DEEP_DIVES.map(dive => dive.id)), "Lesson IDs must be unique.");
requireValue(unique(CONCEPT_DEEP_DIVES.map(dive => dive.title)), "Lesson titles must be unique.");
requireValue(/^\d{4}-\d{2}-\d{2}$/.test(CONCEPT_DEEP_DIVE_REVIEWED_AT), "Review date must use YYYY-MM-DD.");
requireValue(CONCEPT_DEEP_DIVE_CATEGORIES[0] === "All topics", "The category list must begin with All topics.");

for (const dive of CONCEPT_DEEP_DIVES) {
  const prefix = `[${dive.id || "missing-id"}]`;
  requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dive.id || ""), `${prefix} ID must be a URL-safe slug.`);
  requireValue(Number.isInteger(dive.chapter) && dive.chapter >= 1 && dive.chapter <= 5, `${prefix} chapter must be 1-5.`);
  requireValue(typeof dive.category === "string" && dive.category.trim(), `${prefix} category is required.`);
  requireValue(typeof dive.title === "string" && dive.title.trim(), `${prefix} title is required.`);
  requireValue(typeof dive.subtitle === "string" && words(dive.subtitle) >= 4, `${prefix} subtitle is too short.`);
  requireValue(typeof dive.summary === "string" && words(dive.summary) >= 12 && words(dive.summary) <= 65, `${prefix} summary must be 12-65 words.`);
  requireValue(Number.isInteger(dive.minutes) && dive.minutes >= 5 && dive.minutes <= 30, `${prefix} minutes must be 5-30.`);
  requireValue(["Core", "Applied", "Advanced"].includes(dive.difficulty), `${prefix} difficulty is not recognised.`);
  requireValue(Array.isArray(dive.aliases) && dive.aliases.length >= 5 && unique(dive.aliases.map(alias => alias.toLowerCase())), `${prefix} needs at least five unique aliases.`);
  requireValue(Array.isArray(dive.objectives) && dive.objectives.length >= 2 && dive.objectives.every(Boolean), `${prefix} needs at least two objectives.`);
  requireValue(Array.isArray(dive.sections) && dive.sections.length >= 2, `${prefix} needs at least two guided sections.`);
  requireValue(Array.isArray(dive.traps) && dive.traps.length >= 3 && dive.traps.every(Boolean), `${prefix} needs at least three exam traps.`);
  requireValue(dive.check?.question && dive.check?.answer, `${prefix} needs a complete application check.`);
  requireValue(Array.isArray(dive.sources) && dive.sources.length >= 2, `${prefix} needs at least two primary sources.`);

  dive.sections?.forEach((section, sectionIndex) => {
    const sectionPrefix = `${prefix} section ${sectionIndex + 1}`;
    requireValue(typeof section.title === "string" && section.title.trim(), `${sectionPrefix} needs a title.`);
    requireValue(Boolean(section.body?.length || section.table), `${sectionPrefix} has no teaching content.`);
    section.body?.forEach((paragraph, paragraphIndex) => {
      requireValue(words(paragraph) >= 8, `${sectionPrefix} paragraph ${paragraphIndex + 1} is too short.`);
      requireValue(words(paragraph) <= 80, `${sectionPrefix} paragraph ${paragraphIndex + 1} exceeds the bite-size limit.`);
    });
    if (section.table) {
      requireValue(section.table.columns?.length >= 2, `${sectionPrefix} table needs at least two columns.`);
      requireValue(section.table.rows?.length >= 2, `${sectionPrefix} table needs at least two rows.`);
      section.table.rows?.forEach((row, rowIndex) => {
        requireValue(row.length === section.table.columns.length, `${sectionPrefix} table row ${rowIndex + 1} is not rectangular.`);
        requireValue(row.every(cell => typeof cell === "string" && cell.trim()), `${sectionPrefix} table row ${rowIndex + 1} contains an empty cell.`);
      });
    }
  });

  requireValue(unique(dive.sources.map(source => source.url)), `${prefix} repeats a source URL.`);
  dive.sources?.forEach((source, sourceIndex) => {
    const sourcePrefix = `${prefix} source ${sourceIndex + 1}`;
    requireValue(typeof source.label === "string" && source.label.trim(), `${sourcePrefix} needs a label.`);
    try {
      const url = new URL(source.url);
      requireValue(url.protocol === "https:", `${sourcePrefix} must use HTTPS.`);
      requireValue(isPrimaryDomain(url.hostname), `${sourcePrefix} is not from the approved primary-source set: ${url.hostname}.`);
    } catch {
      failures.push(`${sourcePrefix} has an invalid URL.`);
    }
  });

  const cards = buildDeepDiveFlashcards(dive);
  requireValue(cards.length >= 5, `${prefix} generates fewer than five flashcards.`);
  requireValue(unique(cards.map(item => item.id)), `${prefix} generates duplicate flashcard IDs.`);
  cards.forEach(item => {
    requireValue(item.front && item.back, `${prefix} generated an incomplete flashcard.`);
    requireValue(words(item.front) <= 35, `${item.id} question is too long for a flashcard.`);
    requireValue(words(item.back) <= 55, `${item.id} answer is too long for a flashcard.`);
  });
}

const deck = buildDeepDiveDeck(CONCEPT_DEEP_DIVES);
requireValue(unique(deck.map(item => item.id)), "Generated flashcard IDs must be unique across the full library.");
requireValue(!/\b(?:TODO|FIXME|lorem ipsum)\b|\?\?\?/i.test(JSON.stringify(CONCEPT_DEEP_DIVES)), "Lesson data contains placeholder copy.");

if (failures.length) {
  console.error(`Deep Dive audit failed with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

const sourceReferences = CONCEPT_DEEP_DIVES.flatMap(dive => dive.sources);
const uniqueSourceUrls = new Set(sourceReferences.map(source => source.url));
const sectionCount = CONCEPT_DEEP_DIVES.reduce((total, dive) => total + dive.sections.length, 0);
console.log("Deep Dive content audit passed.");
console.log(`- ${CONCEPT_DEEP_DIVES.length} complete lessons across ${sectionCount} guided sections`);
console.log(`- ${deck.length} concise flashcards with unique IDs`);
console.log(`- ${sourceReferences.length} source references (${uniqueSourceUrls.size} distinct HTTPS URLs)`);
console.log(`- All sources use the approved primary-source domain set`);
console.log(`- Reviewed dataset date: ${CONCEPT_DEEP_DIVE_REVIEWED_AT}`);
