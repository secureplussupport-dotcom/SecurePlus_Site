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
const acronymChapterGroups = groupSy0701AcronymSetsByChapter();
requireValue(SY0701_ACRONYM_SETS.length >= 8, `Expected at least eight chapter/topic acronym sets; found ${SY0701_ACRONYM_SETS.length}.`);
requireValue(SY0701_ACRONYM_CARDS.length >= 150, `Expected at least 150 acronym cards from the expanded supplied input; found ${SY0701_ACRONYM_CARDS.length}.`);
requireValue(acronymChapterGroups.length === 5, `Acronym cards must be grouped across all five SY0-701 chapters; found ${acronymChapterGroups.length}.`);
requireValue(SY0701_ACRONYM_SETS.every(set => set.setType === "acronym" || set.setType === "term"), "Every flashcard set must declare whether it is an Acronym or Term set.");
requireValue(SY0701_ACRONYM_SETS.filter(set => set.chapterId === 3 && set.setType === "term").length >= 5, "Chapter 3 Security Architecture must include categorized term-only flashcard sets.");
["chapter3-architecture-models", "chapter3-cloud-deployment-models", "chapter3-network-design-zones", "chapter3-resilience-recovery", "chapter3-data-lifecycle-protection"].forEach(setId => {
  const set = SY0701_ACRONYM_SETS.find(item => item.id === setId);
  requireValue(set?.setType === "term" && set.cards.every(card => card.cardType === "term"), `[${setId}] must be a definition-only term deck.`);
});
requireValue(SY0701_ACRONYM_SETS.filter(set => set.chapterId === 4 && set.setType === "term").length >= 4, "Chapter 4 Security Operations must include categorized term-only flashcard sets.");
["chapter4-hardening-baselines", "chapter4-monitoring-logging", "chapter4-forensics-response", "chapter4-vulnerability-access-ops"].forEach(setId => {
  const set = SY0701_ACRONYM_SETS.find(item => item.id === setId);
  requireValue(set?.setType === "term" && set.cards.every(card => card.cardType === "term"), `[${setId}] must be a definition-only term deck.`);
});
requireValue(SY0701_ACRONYM_SETS.filter(set => set.chapterId === 5 && set.setType === "term").length >= 4, "Chapter 5 Security Program Management must include categorized term-only flashcard sets.");
["chapter5-governance-data-roles", "chapter5-risk-analysis-response", "chapter5-vendor-supply-chain", "chapter5-awareness-training"].forEach(setId => {
  const set = SY0701_ACRONYM_SETS.find(item => item.id === setId);
  requireValue(set?.setType === "term" && set.cards.every(card => card.cardType === "term"), `[${setId}] must be a definition-only term deck.`);
});
["GPO", "IPFIX", "UEBA", "PICERL", "CVE", "CVSS", "PAM", "JIT"].forEach(acronym => {
  requireValue(SY0701_ACRONYM_CARDS.some(card => card.chapterId === 4 && card.acronym === acronym), `Chapter 4 acronym ${acronym} must be present.`);
});
["ZTA", "FaaS", "DMZ", "HA", "RAID"].forEach(acronym => {
  requireValue(SY0701_ACRONYM_CARDS.some(card => card.chapterId === 3 && card.acronym === acronym), `Chapter 3 acronym ${acronym} must be present.`);
});
["CIS", "CSF", "CTF", "EF", "HIPAA", "ISMS"].forEach(acronym => {
  requireValue(SY0701_ACRONYM_CARDS.some(card => card.chapterId === 5 && card.acronym === acronym), `Chapter 5 acronym ${acronym} must be present.`);
});
["SIEM", "SOAR", "FIM"].forEach(acronym => {
  const matches = SY0701_ACRONYM_CARDS.filter(card => card.acronym === acronym);
  requireValue(matches.length === 1, `Overlapping acronym ${acronym} must not be duplicated.`);
});
["AV", "ALE", "ARO", "BPA", "GDPR", "NIST", "PCI DSS", "PHI", "PII", "SLA", "SLE", "SOC"].forEach(acronym => {
  const matches = SY0701_ACRONYM_CARDS.filter(card => card.acronym === acronym);
  requireValue(matches.length === 1, `Overlapping acronym ${acronym} must not be duplicated.`);
});
["DLP", "SASE", "CASB", "SDN", "VPC", "VPN", "DMZ", "HA", "RAID", "ZTA", "FaaS"].forEach(acronym => {
  const matches = SY0701_ACRONYM_CARDS.filter(card => card.acronym === acronym);
  requireValue(matches.length === 1, `Overlapping acronym ${acronym} must not be duplicated.`);
});
requireValue(unique(SY0701_ACRONYM_SETS.map(set => set.id)), "Acronym set IDs must be unique.");
requireValue(unique(SY0701_ACRONYM_CARDS.map(card => card.id)), "Acronym card IDs must be unique.");
requireValue(SY0701_ACRONYM_SOURCE.officialUrl === SY0701_BLUEPRINT.sourceUrl, "Acronym cards must point to the reviewed official SY0-701 blueprint.");
requireValue(/^\d{4}-\d{2}-\d{2}$/.test(SY0701_ACRONYM_SOURCE.reviewedAt), "Acronym review date must use YYYY-MM-DD.");
SY0701_ACRONYM_SETS.forEach(set => {
  requireValue(appSource.includes(`"${set.id}"`), `[acronym set ${set.id}] needs a dedicated focused icon mapping in App.jsx.`);
});
requireValue(!appSource.includes("Free standalone active recall"), "Flashcards page must not show the removed Free standalone active recall badge.");
requireValue(appSource.includes("last-minute Security+ recall pack before exam day") && appSource.includes("share the same set with friends"), "Flashcards page must position the feature as last-minute exam prep with a share-with-friends theme.");
requireValue(appSource.includes("STARRED_FLASHCARD_SET_ID"), "Flashcards must support a curated starred flashcard set.");
requireValue(appSource.includes("Sign up to save this flashcard"), "Guest flashcard starring must prompt account creation instead of silently saving.");
requireValue(appSource.includes("flashcard_curated_set"), "Guest curated-set access should route to account creation.");
requireValue(appSource.includes("FlashcardShareActions"), "Flashcards must expose share controls for sets and the collection.");
requireValue(appSource.includes("view:\"flashcards\""), "Flashcard share links must route directly to the Flashcards page.");
requireValue(appSource.includes("https://wa.me/?text="), "Flashcards must support direct WhatsApp sharing.");
requireValue(appSource.includes("https://discord.com/channels/@me"), "Flashcards must open Discord after copying the share message.");
requireValue(appSource.includes("https://www.instagram.com/"), "Flashcards must open Instagram after copying the share message.");
requireValue(appSource.includes("https://www.reddit.com/submit?url="), "Flashcards must support Reddit sharing.");
requireValue(appSource.includes("copyText(shareUrl"), "Copy Link must copy only the flashcard URL.");
requireValue(appSource.includes("flashcard-share-menu") && appSource.includes("aria-expanded={open}"), "Flashcard share locations must be hidden behind an expandable widget.");
requireValue(appSource.includes("social-whatsapp") && appSource.includes("social-discord") && appSource.includes("social-instagram") && appSource.includes("social-reddit"), "Flashcard share icons must use platform-specific color classes.");
requireValue(appSource.includes('type==="copy"'), "Copy Link must use a distinct link icon rather than the generic share icon.");
requireValue(appSource.includes(".flashcard-share-btn svg{width:29px;height:29px"), "Flashcard share platform glyphs must be large enough to fill the icon boxes.");
requireValue(appSource.includes("flashcards-cipher-card") && appSource.includes('animation="flashcards"'), "Flashcards page must place Cipher in the hero with a flashcard-specific animation.");
requireValue(!appSource.includes("Mixed challenge") && !appSource.includes('direction==="mixed"'), "Flashcards must not show the removed Mixed Challenge mode.");
requireValue(appSource.includes(".flashcards-cipher-card>strong") && appSource.includes(".flashcards-cipher-card>.flashcards-cipher-copy"), "Flashcards Cipher card must not style every nested mascot span.");
requireValue(appSource.includes(".deep-dive-acronym-set-card::before") && appSource.includes("radial-gradient(circle at 95% 8%"), "Flashcards set cards must have stronger color contrast and creative accents.");
requireValue(appSource.includes("deep-dive-flashcard-watermark") && appSource.includes("<BrandMark size={16}/>SecurePlus"), "Every flashcard face must include a small SecurePlus watermark.");
requireValue(appSource.includes("flashcards-fan-glyph"), "Flashcards navigation icon must use a fan of cards.");
requireValue(appSource.includes("getFlashcardRelatedDeepDives") && appSource.includes("flashcard-learn-more") && appSource.includes("flashcard_learn_more"), "Flashcards must link to Concept Deep Dives through a closable Learn More flow.");
requireValue(appSource.includes("FlashcardSavePrompt"), "Guest flashcard starring must show a soft login/signup prompt.");
requireValue(appSource.includes("ASSISTANT_FLASHCARD_SET_ID") && appSource.includes("buildCipherWeakFlashcardSet") && appSource.includes("Build weak flashcards"), "Cipher Assistant must expose a Pro weak-area flashcard deck builder.");
requireValue(appSource.includes('message.kind==="flashcardConfirm"') && appSource.includes("Open deck") && appSource.includes("cipher_assistant_flashcards_started"), "Cipher Assistant weak-area flashcards must preview before opening the generated deck.");
requireValue(appSource.includes("assistantFlashcardSet") && appSource.includes("assistantSet={assistantFlashcardSet}"), "Flashcards page must accept the temporary Cipher-generated weak-area deck.");
requireValue(appSource.includes("effectiveAssistantFlashcardSet") && appSource.includes("buildCipherStarterFlashcardSet") && appSource.includes('assistantSet={effectiveAssistantFlashcardSet}'), "Pro users must see a Cipher-assisted flashcard deck even before pressing the assistant builder.");
requireValue(appSource.includes("showAssistantDeck") && appSource.includes("cipher-made-set-card") && appSource.includes("Cipher made") && appSource.includes("--set-color:#14b8a6"), "Pro Cipher-made weak-area decks must be visible with a distinct color in the flashcard inventory.");
requireValue(appSource.includes("RANDOM_FLASHCARD_SET_ID") && appSource.includes("buildRandomFlashcardSet") && appSource.includes("Randomised set"), "Flashcards page must include a randomised set builder beside the saved decks.");
requireValue(appSource.includes(".deep-dive-acronym-set-card{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:15px") && appSource.includes("min-height:148px;padding:22px") && appSource.includes(".flashcards-inventory-grid{grid-template-columns:repeat(auto-fit,minmax(315px,1fr))"), "Flashcard widgets must be larger and more visible in the inventory and set grids.");
requireValue(appSource.includes("RANDOM_FLASHCARD_COUNTS = [10,20,30]") && appSource.includes("flashcard-random-intro") && appSource.includes("flashcard-randomising-buffer") && appSource.includes("RANDOMISING...") && appSource.includes("randomiseAndStudy") && appSource.includes("randomiseAndSave"), "Random flashcard builder must use fixed 10/20/30 choices, clear selectors, and a Cipher randomising buffer.");
requireValue(appSource.includes("flashcard-section-divider-face") && appSource.includes("Definition cards next") && appSource.includes("Acronym cards next"), "Mixed random decks must insert coloured divider cards between term and acronym sections.");
requireValue(appSource.includes("Save this random set") && appSource.includes("writeSavedRandomFlashcardSets") && appSource.includes("savedRandomSets.map") && appSource.includes("Generated") && appSource.includes("saveGeneratedSetName"), "Generated decks must be saveable and renameable in the flashcard inventory for signed-in users.");
requireValue(appSource.includes("FlashcardModeChooser") && appSource.includes("flashcard-mode-sheet") && appSource.includes("flashcard-mode-card"), "Flashcard sets must open through a dedicated mode chooser instead of an inline selector.");
requireValue(!appSource.includes('role="tablist" aria-label="Choose flashcard direction"'), "Flashcard mode selection must not remain as a tab selector above the card.");
requireValue(appSource.includes("FLASHCARD_DEFAULT_MODE_PREFIX") && appSource.includes("flashcard-default-checkbox") && appSource.includes("flashcard-default-mode-card"), "Signed-in users must be able to save and change a default flashcard mode.");
requireValue(appSource.includes("flashcard-mode-recommended") && appSource.includes("Guess from Example") && appSource.includes("flashcardThink"), "Example-enabled flashcard sets must show a recommended Guess from Example mode with Cipher thinking.");
requireValue(appSource.includes("flashcardTeach") && appSource.includes("flashcardInspect") && appSource.includes("flashcardThink"), "Flashcard mode chooser must use dedicated Cipher animation variants for every mode.");
requireValue(mascotSource.includes("flashcardTeach") && mascotSource.includes("flashcardInspect") && mascotSource.includes("flashcardThink"), "Cipher animation registry must include dedicated flashcard mode animations.");
requireValue(mascotSource.includes("cipher-prop-board") && mascotSource.includes("cipher-prop-pointer") && mascotSource.includes("cipher-prop-magnifier") && mascotSource.includes("cipher-prop-question"), "Flashcard mode props must live inside the Cipher mascot rig, not as external add-ons.");
requireValue(appSource.includes(".cipher-prop-board{right:0;top:10%;width:40%;") && appSource.includes(".cipher-prop-pointer{left:50%;top:51%;width:35%;") && appSource.includes(".cipher-motion-flashcardTeach .cipher-arm-right{z-index:10;}"), "Test Definition Cipher animation must align the board, pointer, and hand so the stick appears held and points toward the board.");
requireValue(appSource.includes("createPortal(chooser,document.body)") && appSource.includes("width:min(96vw,1120px)") && appSource.includes("max-height:min(700px,calc(100dvh - 72px))"), "Flashcard mode chooser must render fully inside the viewport while giving each mode column more room.");
requireValue(appSource.includes("flashcard-change-mode-btn"), "Flashcard set view must include a visible Change Mode button.");
requireValue(appSource.includes("flashcard-type-badge") && appSource.includes('set.setType==="term"?"Term":"Acronym"'), "Flashcard set cards must visibly label Acronym and Term decks.");
requireValue(appSource.includes('flashcardSetType(set)==="term"') && appSource.includes('startFlashcardSet(id,"definition")'), "Term-only flashcard decks must open directly in Test Definition mode.");
requireValue(appSource.includes(".flashcards-fan-glyph rect{fill:color-mix(in srgb,currentColor 7%,transparent);stroke:currentColor;stroke-width:1.05;}"), "Flashcards nav icon must use lighter card strokes so the fan does not become a purple mesh.");
requireValue(appSource.includes("--chapter-filter-color") && appSource.includes("chapterColor(group.chapterId)") && appSource.includes('"--deep-accent":"#0ea5e9"'), "Flashcards page must use clearer blue/teal contrast and per-chapter selector colours.");
requireValue(!appSource.includes("Matched by shared Security+ keywords, acronyms, and objectives."), "Flashcard Learn More trigger should stay subtle without the bottom descriptor.");
requireValue(appSource.includes(".deep-dive-flashcard-front>strong{font-size:clamp(21px,2.75vw,29px);font-weight:720;") && appSource.includes(".deep-dive-flashcard-front{background:radial-gradient(circle at 16% 14%,color-mix(in srgb,var(--set-color) 7%,transparent)"), "Flashcard front face must use softer typography and a less glaring surface for reading comfort.");
requireValue(appSource.includes("flashcards-mobile-quick") && appSource.includes("mobileQuickSets.map") && appSource.includes(".flashcards-page .deep-dives-proof,.flashcards-page .deep-dives-blueprint-link,.flashcards-page .flashcard-share-actions.compact{display:none;}"), "Flashcards mobile page must expose quick-start sets above secondary information.");
requireValue(appSource.includes(".flashcards-controls{position:sticky;top:0;z-index:35") && appSource.includes(".flashcards-hero-side{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);"), "Flashcards mobile controls must stay compact and accessible near the top of the screen.");

for (const set of SY0701_ACRONYM_SETS) {
  const prefix = `[acronym set ${set.id || "missing-id"}]`;
  requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(set.id || ""), `${prefix} ID must be a URL-safe slug.`);
  requireValue(words(set.title) >= 2 && words(set.title) <= 7, `${prefix} title must be 2-7 words.`);
  requireValue(words(set.description) >= 6 && words(set.description) <= 22, `${prefix} description must be 6-22 words.`);
  requireValue(Number.isInteger(set.chapterId) && set.chapterId >= 1 && set.chapterId <= 5, `${prefix} chapterId must be 1-5.`);
  requireValue(typeof set.chapterTitle === "string" && set.chapterTitle.trim(), `${prefix} needs a chapter title.`);
  requireValue(typeof set.topic === "string" && words(set.topic) >= 2 && words(set.topic) <= 8, `${prefix} needs a casual topic label.`);
  requireValue(set.objectiveCodes.length >= 1 && set.objectiveCodes.every(code => SY0701_OBJECTIVES[code]), `${prefix} references an unknown SY0-701 objective.`);
  requireValue(set.cards.length >= 3 && set.cards.length <= 32, `${prefix} must contain 3-32 focused topic cards.`);
  set.cards.forEach(card => {
    requireValue(Boolean(card.acronym && card.expansion && card.meaning), `${card.id || prefix} is incomplete.`);
    requireValue(words(card.expansion) <= 18, `${card.id} expansion is too long for active recall.`);
    requireValue(words(card.meaning) >= 5 && words(card.meaning) <= 32, `${card.id} plain-English meaning must be 5-32 words.`);
    requireValue(typeof card.topic === "string" && card.topic.trim(), `${card.id} needs a topic label.`);
    if (card.cardType === "attack") {
      requireValue(typeof card.example === "string" && words(card.example) >= 8 && words(card.example) <= 34, `${card.id} attack card needs an 8-34 word example.`);
    }
  });
}

const attackSets = SY0701_ACRONYM_SETS.filter(set => set.cards.some(card => card.cardType === "attack"));
requireValue(attackSets.length >= 7, `Expected at least seven dedicated attack flashcard stacks; found ${attackSets.length}.`);
requireValue(attackSets.every(set => set.cards.every(card => card.example)), "Every attack stack card must support example-based guessing.");

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
console.log(`- ${practiceQuestionCount} vetted tap-based questions across ${CONCEPT_DEEP_DIVES.length} practice labs`);
console.log(`- ${SY0701_ACRONYM_CARDS.length} high-yield acronym cards across ${SY0701_ACRONYM_SETS.length} standalone active-recall sets`);
console.log(`- All ${CONCEPT_DEEP_DIVES.length} lessons mapped across all 28 SY0-701 objectives and five domains`);
console.log(`- Smart Review lesson matching passed ${recommendationChecks.length} representative weak-area checks`);
console.log(`- ${Object.values(SY0701_DEEP_DIVE_PROFILES).filter(item => item.beyondSections.length).length} lessons clearly label optional Beyond the textbook sections`);
console.log(`- ${sourceReferences.length} source references (${uniqueSourceUrls.size} distinct HTTPS URLs)`);
console.log(`- All sources use the approved primary-source domain set`);
console.log(`- Reviewed dataset date: ${CONCEPT_DEEP_DIVE_REVIEWED_AT}`);
