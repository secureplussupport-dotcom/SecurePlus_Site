import {
  CONCEPT_DEEP_DIVES,
  CONCEPT_DEEP_DIVE_CATEGORIES,
  CONCEPT_DEEP_DIVE_REVIEWED_AT,
} from "../src/data/conceptDeepDives.js";
import { readFileSync } from "node:fs";
import {
  buildDeepDivePracticeQuestions,
} from "../src/lib/deepDiveStudy.js";
import { getDeepDiveRecommendations } from "../src/lib/deepDiveRecommendations.js";
import {
  SY0701_ACRONYM_CARDS,
  SY0701_ACRONYM_SETS,
  SY0701_ACRONYM_SOURCE,
  groupSy0701AcronymSetsByChapter,
} from "../src/data/sy0701AcronymFlashcards.js";
import {
  getSy0701DeepDiveProfile,
  sortDeepDivesBySy0701,
  SY0701_BLUEPRINT,
  SY0701_DEEP_DIVE_PROFILES,
  SY0701_DOMAINS,
  SY0701_KEYWORD_DEFINITIONS,
  SY0701_OBJECTIVES,
} from "../src/data/sy0701DeepDiveMap.js";

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
const mappedObjectiveCodes = new Set(Object.values(SY0701_DEEP_DIVE_PROFILES).flatMap(profile => profile.objectiveCodes));
let practiceQuestionCount = 0;
const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const mascotSource = readFileSync(new URL("../src/lib/MascotAnimation.jsx", import.meta.url), "utf8");

requireValue(CONCEPT_DEEP_DIVES.length >= 32, `Expected at least 32 lessons; found ${CONCEPT_DEEP_DIVES.length}.`);
requireValue(unique(CONCEPT_DEEP_DIVES.map(dive => dive.id)), "Lesson IDs must be unique.");
requireValue(unique(CONCEPT_DEEP_DIVES.map(dive => dive.title)), "Lesson titles must be unique.");
requireValue(Object.keys(SY0701_DEEP_DIVE_PROFILES).length === CONCEPT_DEEP_DIVES.length, "Every lesson needs exactly one SY0-701 syllabus profile.");
requireValue(SY0701_DOMAINS.length === 5, "The SY0-701 map must contain five exam domains.");
requireValue(SY0701_DOMAINS.reduce((total, domain) => total + domain.weight, 0) === 100, "SY0-701 domain weights must total 100%.");
requireValue(Object.keys(SY0701_OBJECTIVES).length === 28, "The SY0-701 map must contain all 28 numbered objectives.");
requireValue(mappedObjectiveCodes.size === Object.keys(SY0701_OBJECTIVES).length, "The Deep Dive path must cover all 28 SY0-701 objectives.");
requireValue(SY0701_BLUEPRINT.exam === "SY0-701 V7" && SY0701_BLUEPRINT.documentVersion === "7.0", "The syllabus map must identify the reviewed official blueprint version.");
requireValue(/^https:\/\//.test(SY0701_BLUEPRINT.sourceUrl), "The official blueprint source must use HTTPS.");
requireValue(/^\d{4}-\d{2}-\d{2}$/.test(CONCEPT_DEEP_DIVE_REVIEWED_AT), "Review date must use YYYY-MM-DD.");
requireValue(CONCEPT_DEEP_DIVE_CATEGORIES[0] === "All topics", "The category list must begin with All topics.");
// Flashcards were reorganised by explicit owner request on 23 October 2026.
// The executable bank suite additionally checks schema, all prior IDs, exact-tag
// selection, streak resets, pending definitions and lossless review batching.
const acronymChapterGroups = groupSy0701AcronymSetsByChapter();
requireValue(acronymChapterGroups.length === 5, "Flashcards must span the five official domains.");
requireValue(SY0701_ACRONYM_SETS.length === 35, "The supplied bank must have 35 curated decks.");
requireValue(SY0701_ACRONYM_CARDS.length === 502, "The supplied bank must retain all 502 keyword entries.");
requireValue(unique(SY0701_ACRONYM_CARDS.map(card => card.id)), "Flashcard IDs must be unique.");
requireValue(SY0701_ACRONYM_SOURCE.officialUrl === SY0701_BLUEPRINT.sourceUrl, "Flashcards must cite the official blueprint.");
for (const set of SY0701_ACRONYM_SETS) {
  requireValue(set.cards.length >= 10 && set.cards.length <= 20, `${set.id}: curated decks need 10-20 cards.`);
  requireValue(set.chapterTitle === SY0701_DOMAINS.find(domain=>domain.id===set.chapterId)?.name, `${set.id}: official domain name required.`);
  for (const card of set.cards) {
    requireValue(Boolean(card.id && card.term && card.keywords.length && card.concept_tags.length), `${card.id}: term and tag links required.`);
    requireValue(typeof card.definition === "string", `${card.id}: definition must be a string, including intentionally blank entries.`);
  }
}
requireValue(appSource.includes("flashcardFaces(activeCard") && appSource.includes('const frontPrompt="Test by term"'), "Every entry point must use term-first recall.");
requireValue(!appSource.includes("function FlashcardModeChooser"), "Archived modes must not remain in the active flow.");
requireValue(appSource.includes("personalisedFlashcards(engineState)"), "Personalised review must use exact server concept streaks.");
requireValue(appSource.includes("FlashcardShareActions") && appSource.includes("importPendingGuestFlashcards"), "Sharing and the guest-save bridge must remain available.");
requireValue(appSource.includes("flashcard-learn-more") && appSource.includes("onOpenDeepDive"), "Related lessons must remain accessible.");

for (const dive of CONCEPT_DEEP_DIVES) {
  const prefix = `[${dive.id || "missing-id"}]`;
  const syllabus = getSy0701DeepDiveProfile(dive);
  requireValue(Boolean(syllabus), `${prefix} is missing its SY0-701 syllabus profile.`);
  if (syllabus) {
    requireValue(syllabus.studyOrder >= 1 && syllabus.studyOrder <= CONCEPT_DEEP_DIVES.length, `${prefix} has an invalid syllabus study order.`);
    requireValue(syllabus.objectiveCodes.length >= 1 && syllabus.objectiveCodes.every(code => SY0701_OBJECTIVES[code]), `${prefix} references an unknown SY0-701 objective.`);
    requireValue(syllabus.domainId === Number(syllabus.objectiveCodes[0].split(".")[0]), `${prefix} domain does not match its primary objective.`);
    requireValue(words(syllabus.title) >= 3 && words(syllabus.title) <= 12, `${prefix} beginner title must be 3-12 words.`);
    requireValue(words(syllabus.plainSummary) >= 10 && words(syllabus.plainSummary) <= 32, `${prefix} plain summary must be 10-32 words.`);
    requireValue(syllabus.examKeywords.length >= 3 && syllabus.examKeywords.length <= 5, `${prefix} needs 3-5 exam keywords.`);
    requireValue(syllabus.examKeywords.every(keyword => SY0701_KEYWORD_DEFINITIONS[keyword]), `${prefix} has an exam keyword without a plain-English definition.`);
    requireValue(unique(syllabus.examKeywords), `${prefix} repeats an exam keyword.`);
    requireValue(syllabus.beyondSections.every(index => Number.isInteger(index) && index >= 0 && index < dive.sections.length), `${prefix} has an invalid Beyond the textbook section index.`);
  }
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

  const practiceQuestions = buildDeepDivePracticeQuestions(dive);
  practiceQuestionCount += practiceQuestions.length;
  requireValue(practiceQuestions.length >= 3 && practiceQuestions.length <= 6, `${prefix} must generate 3-6 practice-lab questions.`);
  requireValue(unique(practiceQuestions.map(item => item.id)), `${prefix} generates duplicate practice-lab question IDs.`);
  practiceQuestions.forEach(item => {
    requireValue(Boolean(item.prompt && item.clue && item.answer && item.explanation && item.source), `${item.id} is incomplete.`);
    requireValue(item.options.length >= 2 && item.options.length <= 4, `${item.id} must have 2-4 answer choices.`);
    requireValue(unique(item.options), `${item.id} repeats an answer choice.`);
    requireValue(item.options.includes(item.answer), `${item.id} does not include its correct answer.`);
    requireValue(item.options.every(option => String(item.optionFeedback?.[option] || "").length >= 20), `${item.id} must explain every answer option.`);
    requireValue(item.sectionIndex === undefined || !syllabus.beyondSections.includes(item.sectionIndex), `${item.id} must not test optional enrichment as exam-core content.`);
  });
}

requireValue(!/\b(?:TODO|FIXME|lorem ipsum)\b|\?\?\?/i.test(JSON.stringify(CONCEPT_DEEP_DIVES)), "Lesson data contains placeholder copy.");
requireValue(!/\b(?:authorisation|authorised|unauthorised|organisation|organisational|behaviour|defence|prioritise|sanitisation|synchronisation|virtualisation|recognise|standardise)\b/i.test(JSON.stringify(CONCEPT_DEEP_DIVES)), "Lesson copy must use the American-English keywords used in the CompTIA objectives.");
requireValue(unique(Object.values(SY0701_DEEP_DIVE_PROFILES).map(item => item.studyOrder)), "SY0-701 study order values must be unique.");
requireValue(sortDeepDivesBySy0701(CONCEPT_DEEP_DIVES).every((dive, index, ordered) => index === 0 || getSy0701DeepDiveProfile(ordered[index - 1]).studyOrder < getSy0701DeepDiveProfile(dive).studyOrder), "Lessons are not sorted into a unique SY0-701 study path.");

const recommendationChecks = [
  {
    question:{ id:"audit-wifi", ch:"3", topic:"Wireless Security", q:"A university needs WPA3-Enterprise with individual credentials using 802.1X and RADIUS." },
    expected:"wifi-access-defense",
  },
  {
    question:{ id:"audit-pki", ch:"1", topic:"PKI & Certificates", q:"Which method checks whether a certificate was revoked using OCSP?" },
    expected:"pki-email-trust",
  },
  {
    question:{ id:"audit-siem", ch:"4", topic:"Monitoring & SIEM", q:"An analyst correlates logs in a SIEM during incident response." },
    expected:"incident-response-monitoring",
  },
  {
    question:{ id:"audit-risk", ch:"5", topic:"Risk Management", q:"Calculate SLE and ALE, then record the selected risk treatment." },
    expected:"risk-resilience-governance",
  },
];
recommendationChecks.forEach(({question,expected})=>{
  const recommendations=getDeepDiveRecommendations([question],{limit:2});
  requireValue(recommendations[0]?.id===expected, `Smart Review mapped ${question.id} to ${recommendations[0]?.id||"nothing"}; expected ${expected}.`);
  requireValue(recommendations.every(item=>CONCEPT_DEEP_DIVES.some(dive=>dive.id===item.id)), `Smart Review returned an unknown lesson for ${question.id}.`);
  requireValue(recommendations.every(item=>item.objectiveCodes.length&&item.domainId), `Smart Review returned incomplete syllabus metadata for ${question.id}.`);
});

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
console.log(`- ${practiceQuestionCount} structurally checked tap-based questions across ${CONCEPT_DEEP_DIVES.length} practice labs (not a factual certification)`);
console.log(`- ${SY0701_ACRONYM_CARDS.length} high-yield acronym cards across ${SY0701_ACRONYM_SETS.length} standalone active-recall sets`);
console.log(`- All ${CONCEPT_DEEP_DIVES.length} lessons mapped across all 28 SY0-701 objectives and five domains`);
console.log(`- Smart Review lesson matching passed ${recommendationChecks.length} representative weak-area checks`);
console.log(`- ${Object.values(SY0701_DEEP_DIVE_PROFILES).filter(item => item.beyondSections.length).length} lessons clearly label optional Beyond the textbook sections`);
console.log(`- ${sourceReferences.length} source references (${uniqueSourceUrls.size} distinct HTTPS URLs)`);
console.log(`- All sources use the approved primary-source domain set`);
console.log(`- Reviewed dataset date: ${CONCEPT_DEEP_DIVE_REVIEWED_AT}`);
