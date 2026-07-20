import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appPath = path.join(root, "src", "App.jsx");
const source = fs.readFileSync(appPath, "utf8");
const strict = process.argv.includes("--strict");

function findArrayLiteral(name) {
  const needle = `const ${name} =`;
  const declaration = source.indexOf(needle);
  if (declaration === -1) throw new Error(`Could not find ${name}`);
  const start = source.indexOf("[", declaration);
  if (start === -1) throw new Error(`Could not find array literal for ${name}`);
  return readBalanced(start, "[", "]");
}

function readBalanced(start, openChar, closeChar) {
  let depth = 0;
  let state = "code";
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (state === "lineComment") {
      if (char === "\n") state = "code";
      continue;
    }
    if (state === "blockComment") {
      if (char === "*" && next === "/") {
        state = "code";
        i += 1;
      }
      continue;
    }
    if (state === "single" || state === "double" || state === "template") {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (
        (state === "single" && char === "'") ||
        (state === "double" && char === "\"") ||
        (state === "template" && char === "`")
      ) {
        state = "code";
      }
      continue;
    }

    if (char === "/" && next === "/") {
      state = "lineComment";
      i += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      state = "blockComment";
      i += 1;
      continue;
    }
    if (char === "'") {
      state = "single";
      continue;
    }
    if (char === "\"") {
      state = "double";
      continue;
    }
    if (char === "`") {
      state = "template";
      continue;
    }

    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }

  throw new Error(`Could not parse balanced ${openChar}${closeChar} literal`);
}

function evaluateLiteral(name) {
  const literal = findArrayLiteral(name);
  return Function(`"use strict"; return (${literal});`)();
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findDuplicates(items, getKey) {
  const seen = new Map();
  const duplicates = [];
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    if (seen.has(key)) duplicates.push([key, seen.get(key), item]);
    else seen.set(key, item);
  }
  return duplicates;
}

function push(errorList, id, message) {
  errorList.push(`${id || "unknown"}: ${message}`);
}

function ensureMcqWrongFeedback(question) {
  if (!Array.isArray(question?.opts)) return question;
  const wrongFeedback = { ...(question.wrongFeedback || {}) };
  const correctText = question.opts[question.correct] || "the correct answer";
  question.opts.forEach((_, index) => {
    if (index === question.correct) return;
    const existing = wrongFeedback[index] || wrongFeedback[String(index)];
    if (existing && String(existing).length >= 25) return;
    wrongFeedback[index] = `This option does not best satisfy the scenario. The stronger answer is ${String.fromCharCode(65 + question.correct)}: ${correctText}. ${question.exp || ""}`.trim();
  });
  return { ...question, wrongFeedback };
}

const rawMcqs = evaluateLiteral("MCQ_BANK_RAW");
const importedMcqs = evaluateLiteral("IMPORTED_MCQ_BANK");
const lowQualityIds = new Set(evaluateLiteral("LOW_QUALITY_MCQ_IDS"));
const mcqs = [...rawMcqs, ...importedMcqs]
  .filter(q => !lowQualityIds.has(q.id))
  .map(ensureMcqWrongFeedback);
const basePbqs = evaluateLiteral("PBQ_BANK_BASE");
const importedPbqs = evaluateLiteral("IMPORTED_PBQ_BANK");
const lowQualityPbqIds = new Set(evaluateLiteral("LOW_QUALITY_PBQ_IDS"));
const selectionDistractors = {
  "1":["Hashing","Tokenization","Data masking","Digital signature","Key escrow","Key stretching","Certificate revocation"],
  "2":["Phishing","Vishing","Smishing","Whaling","Pretexting","Tailgating","Watering-hole attack"],
  "3":["Network segmentation","NAC","Firewall","IDS","IPS","VPN","Zero Trust"],
  "4":["Preparation","Detection and analysis","Containment","Eradication","Recovery","Lessons learned","Root cause analysis"],
  "5":["Risk acceptance","Risk avoidance","Risk transfer","Risk mitigation","SLE","ALE","ARO","Exposure factor"],
};
const uniqueOptions = values => {
  const seen = new Set();
  return values.map(value => String(value || "").trim()).filter(value => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const normalizeSelectionQuestion = question => {
  if (question.type === "DRAG & DROP") {
    const targets = (question.targets || []).filter(target => target.droppable !== false);
    const targetById = new Map(targets.map((target, index) => [target.id, target.label || `Answer area ${index + 1}`]));
    const blanks = (question.items || []).map((item, index) => ({
      id:item.id || `b${index}`,
      sentence:item.label || `Prompt ${index + 1}`,
      answer:targetById.get(question.correctMapping?.[item.id]) || "",
    }));
    return {...question,type:"SELECT & FILL",legacySelectionType:"DRAG & DROP",blanks,selectionOptions:uniqueOptions(targets.map(target => target.label))};
  }
  if (question.type !== "FILL BLANK" && question.type !== "SELECT & FILL") return question;
  const blanks = question.blanks || [];
  const answers = uniqueOptions(blanks.map(blank => blank.answer));
  const hinted = blanks.flatMap(blank => /[,;|]/.test(String(blank.hint || "")) ? String(blank.hint).split(/[,;|]/) : []);
  const selectionOptions = uniqueOptions([...answers, ...(question.selectionOptions || []), ...hinted]);
  const answerKeys = new Set(answers.map(normalize));
  for (const option of selectionDistractors[String(question.ch || "1")] || []) {
    const distractorCount = selectionOptions.filter(value => !answerKeys.has(normalize(value))).length;
    if (selectionOptions.length >= Math.max(4, answers.length + 2) && distractorCount >= 2) break;
    if (!selectionOptions.some(value => normalize(value) === normalize(option))) selectionOptions.push(option);
  }
  return {...question,type:"SELECT & FILL",legacySelectionType:"FILL BLANK",blanks,selectionOptions};
};
const pbqs = [...basePbqs, ...importedPbqs]
  .filter(q => !lowQualityPbqIds.has(q.id))
  .map(normalizeSelectionQuestion);
const errors = [];
const warnings = [];
const MAX_MCQ_STEM_LENGTH = 360;
const MAX_MCQ_OPTION_LENGTH = 180;
const MAX_MCQ_TOTAL_LENGTH = 900;
const MAX_PBQ_PROMPT_LENGTH = 1000;
const MAX_PBQ_EXPLANATION_LENGTH = 620;

if (mcqs.length < 400) push(errors, "MCQ_BANK", `expected at least 400 active MCQs, found ${mcqs.length}`);
if (pbqs.length < 100) push(errors, "PBQ_BANK", `expected at least 100 PBQs, found ${pbqs.length}`);

for (const [id] of findDuplicates(mcqs, q => q.id)) push(errors, id, "duplicate active MCQ id");
for (const [id] of findDuplicates(pbqs, q => q.id)) push(errors, id, "duplicate PBQ id");
for (const [, first, second] of findDuplicates(mcqs, q => normalize(q.q))) {
  push(warnings, second.id, `duplicate MCQ question text also used by ${first.id}`);
}
for (const [, first, second] of findDuplicates(pbqs, q => normalize(`${q.title || ""} ${q.scenario || ""} ${q.question || ""}`))) {
  push(warnings, second.id, `duplicate PBQ prompt/title also used by ${first.id}`);
}

for (const q of mcqs) {
  if (!q.id) push(errors, q.id, "missing id");
  if (!q.ch) push(errors, q.id, "missing chapter");
  if (!["easy", "medium", "hard"].includes(q.difficulty)) push(errors, q.id, "difficulty must be easy, medium, or hard");
  if (!q.topic) push(errors, q.id, "missing topic");
  if (!q.q || q.q.length < 20) push(errors, q.id, "question text is missing or too short");
  if (!Array.isArray(q.opts) || q.opts.length !== 4) push(errors, q.id, "must have exactly 4 answer options");
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= (q.opts?.length || 0)) push(errors, q.id, "correct index is invalid");
  if (!q.exp || q.exp.length < 60) push(errors, q.id, "missing or very short correct-answer explanation");
  if (q.q && q.q.length > MAX_MCQ_STEM_LENGTH) {
    push(warnings, q.id, `question stem is too long for smooth MCQ practice (${q.q.length}/${MAX_MCQ_STEM_LENGTH} chars)`);
  }
  if (Array.isArray(q.opts)) {
    const longestOption = Math.max(...q.opts.map(option => String(option).length));
    const totalPromptLength = q.q.length + q.opts.map(String).join(" ").length;
    if (longestOption > MAX_MCQ_OPTION_LENGTH) {
      push(warnings, q.id, `answer option is too long (${longestOption}/${MAX_MCQ_OPTION_LENGTH} chars)`);
    }
    if (totalPromptLength > MAX_MCQ_TOTAL_LENGTH) {
      push(warnings, q.id, `question plus options are too saturated (${totalPromptLength}/${MAX_MCQ_TOTAL_LENGTH} chars)`);
    }
  }

  const wrongFeedback = q.wrongFeedback || {};
  if (!wrongFeedback || typeof wrongFeedback !== "object") push(warnings, q.id, "missing wrongFeedback object");
  if (Array.isArray(q.opts)) {
    q.opts.forEach((_, index) => {
      if (index === q.correct) return;
      const feedback = wrongFeedback[index] || wrongFeedback[String(index)];
      if (!feedback || String(feedback).length < 25) push(warnings, q.id, `missing explanation for wrong option ${String.fromCharCode(65 + index)}`);
    });
  }
}

for (const q of pbqs) {
  if (!q.id) push(errors, q.id, "missing id");
  if (!q.type) push(errors, q.id, "missing type");
  if (!q.ch) push(errors, q.id, "missing chapter");
  if (!["easy", "medium", "hard"].includes(q.difficulty)) push(errors, q.id, "difficulty must be easy, medium, or hard");
  if (!q.title || q.title.length < 10) push(errors, q.id, "missing or very short title");
  if (!q.question && !q.scenario) push(errors, q.id, "missing question/scenario prompt");
  if (!q.explanation || q.explanation.length < 60) push(errors, q.id, "missing or very short explanation");
  const promptLength = [q.title, q.scenario, q.question, q.diagram, q.logData].filter(Boolean).join(" ").length;
  if (promptLength > MAX_PBQ_PROMPT_LENGTH) {
    push(warnings, q.id, `PBQ prompt is too long for smooth practice (${promptLength}/${MAX_PBQ_PROMPT_LENGTH} chars)`);
  }
  if (q.explanation && q.explanation.length > MAX_PBQ_EXPLANATION_LENGTH) {
    push(warnings, q.id, `PBQ explanation is too long (${q.explanation.length}/${MAX_PBQ_EXPLANATION_LENGTH} chars)`);
  }

  if (q.type === "SELECT & FILL") {
    const answerKeys = new Set((q.blanks || []).map(blank => normalize(blank.answer)));
    const distractors = (q.selectionOptions || []).filter(option => !answerKeys.has(normalize(option)));
    if (!Array.isArray(q.blanks) || !q.blanks.length || q.blanks.some(blank => !blank.answer || !blank.sentence)) push(errors, q.id, "Select & Fill PBQ needs complete prompt/answer rows");
    if (!Array.isArray(q.selectionOptions) || q.selectionOptions.length < 4) push(errors, q.id, "Select & Fill PBQ needs at least four shared selector options");
    if (q.blanks?.some(blank => !(q.selectionOptions || []).some(option => normalize(option) === normalize(blank.answer)))) push(errors, q.id, "Select & Fill correct answer is missing from the shared option bank");
    if (q.legacySelectionType === "FILL BLANK" && distractors.length < 2) push(errors, q.id, "converted fill-blank PBQ needs at least two plausible distractors");
  } else if (q.type === "ORDERING") {
    if (!Array.isArray(q.items) || !Array.isArray(q.correctOrder)) push(errors, q.id, "ordering PBQ needs items and correctOrder");
  } else if (!("correct" in q) && !q.answer && !q.correctMapping && !q.correctOrder) {
    push(errors, q.id, "PBQ needs a correct answer, answer text, mapping, or ordering key");
  }
}

console.log(`Question bank audit`);
console.log(`- Active MCQs: ${mcqs.length} (${rawMcqs.length} base, ${importedMcqs.length} imported, ${lowQualityIds.size} hidden low-quality)`);
console.log(`- PBQs: ${pbqs.length} (${basePbqs.length} base, ${importedPbqs.length} imported, ${lowQualityPbqIds.size} hidden low-quality)`);
console.log(`- MCQ duplicate IDs/text: 0 expected`);
console.log(`- PBQ duplicate IDs/prompts: 0 expected`);

if (errors.length) {
  console.error(`\nFound ${errors.length} issue${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors.slice(0, 80)) console.error(`- ${error}`);
  if (errors.length > 80) console.error(`- ...and ${errors.length - 80} more`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`\nQuality warnings (${warnings.length}):`);
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
  if (warnings.length > 40) console.log(`- ...and ${warnings.length - 40} more`);
  if (strict) process.exit(1);
}

console.log("Audit passed with no structural errors.");
