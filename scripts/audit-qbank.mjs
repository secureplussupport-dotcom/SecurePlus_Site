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

const rawMcqs = evaluateLiteral("MCQ_BANK_RAW");
const importedMcqs = evaluateLiteral("IMPORTED_MCQ_BANK");
const lowQualityIds = new Set(evaluateLiteral("LOW_QUALITY_MCQ_IDS"));
const mcqs = [...rawMcqs, ...importedMcqs].filter(q => !lowQualityIds.has(q.id));
const basePbqs = evaluateLiteral("PBQ_BANK_BASE");
const importedPbqs = evaluateLiteral("IMPORTED_PBQ_BANK");
const pbqs = [...basePbqs, ...importedPbqs];
const errors = [];
const warnings = [];

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

  if (q.type === "DRAG & DROP") {
    if (!Array.isArray(q.items) || !Array.isArray(q.targets) || !q.correctMapping) push(errors, q.id, "drag/drop PBQ needs items, targets, and correctMapping");
  } else if (q.type === "ORDERING") {
    if (!Array.isArray(q.items) || !Array.isArray(q.correctOrder)) push(errors, q.id, "ordering PBQ needs items and correctOrder");
  } else if (q.type === "FILL BLANK") {
    if (!Array.isArray(q.blanks) || q.blanks.some(blank => !blank.answer)) push(errors, q.id, "fill-blank PBQ needs blanks with answers");
  } else if (!("correct" in q) && !q.answer && !q.correctMapping && !q.correctOrder) {
    push(errors, q.id, "PBQ needs a correct answer, answer text, mapping, or ordering key");
  }
}

console.log(`Question bank audit`);
console.log(`- Active MCQs: ${mcqs.length} (${rawMcqs.length} base, ${importedMcqs.length} imported, ${lowQualityIds.size} hidden low-quality)`);
console.log(`- PBQs: ${pbqs.length} (${basePbqs.length} base, ${importedPbqs.length} imported)`);
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
