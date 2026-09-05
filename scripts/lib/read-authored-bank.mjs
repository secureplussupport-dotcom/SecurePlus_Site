import fs from "node:fs";
import { mergePublishedSnapshot } from "../../src/data/sy0701PublishedSnapshot.js";

// Execute the same pure legacy enhancement functions used by the application,
// before the new editorial overlay. Do not reimplement a divergent test copy.
export function readMcqEnhancer(file = "src/App.jsx") {
  const source = fs.readFileSync(file, "utf8");
  const start = source.indexOf("const SY0701_STUDY_NOTE_MCQ_ENHANCEMENTS =");
  const end = source.indexOf("const BASE_MCQ_BANK =", start);
  if (start < 0 || end < 0) throw new Error("Missing MCQ enhancement pipeline");
  return Function(`"use strict"; ${source.slice(start, end)}; return applySy0701StudyNoteEnhancement;`)();
}

export function readPbqEnhancer(file = "src/App.jsx") {
  const source = fs.readFileSync(file, "utf8");
  const start = source.indexOf("const SY0701_DOMAIN_LABELS=");
  const end = source.indexOf("const BASE_PBQ_BANK =", start);
  if (start < 0 || end < 0) throw new Error("Missing PBQ enhancement pipeline");
  // Reviewed selectors intentionally bypass legacy random option generation.
  return Function(`"use strict"; const SELECT_FILL_PBQ_TYPE="SELECT & FILL"; ${source.slice(start, end)}; return enhancePBQQuestion;`)();
}

// Read authored literals, before runtime fallbacks can hide missing feedback.
export function readAuthoredBank(file = "src/App.jsx") {
  const source = fs.readFileSync(file, "utf8");
  const read = name => {
    const declaration = source.indexOf(`const ${name} =`);
    if (declaration < 0) throw new Error(`Missing bank: ${name}`);
    const start = source.indexOf("[", declaration);
    let depth = 0, quote = "", escaped = false, comment = "";
    for (let i = start; i < source.length; i++) {
      const c = source[i], next = source[i + 1];
      if (comment === "line") { if (c === "\n") comment = ""; continue; }
      if (comment === "block") { if (c === "*" && next === "/") { comment = ""; i++; } continue; }
      if (quote) {
        if (escaped) escaped = false;
        else if (c === "\\") escaped = true;
        else if (c === quote) quote = "";
        continue;
      }
      if (c === "/" && next === "/") { comment = "line"; i++; continue; }
      if (c === "/" && next === "*") { comment = "block"; i++; continue; }
      if (["'", '"', "`"].includes(c)) { quote = c; continue; }
      if (c === "[") depth++;
      if (c === "]" && --depth === 0) {
        return Function(`"use strict"; return (${source.slice(start, i + 1)});`)();
      }
    }
    throw new Error(`Unclosed bank: ${name}`);
  };
  const hiddenMcqs = new Set(read("LOW_QUALITY_MCQ_IDS"));
  const hiddenPbqs = new Set(read("LOW_QUALITY_PBQ_IDS"));
  return {
    mcqs: mergePublishedSnapshot([...read("MCQ_BANK_RAW"), ...read("IMPORTED_MCQ_BANK")].filter(q => !hiddenMcqs.has(q.id)), "mcq", {includeDisabled:true}),
    pbqs: mergePublishedSnapshot([...read("PBQ_BANK_BASE"), ...read("IMPORTED_PBQ_BANK")].filter(q => !hiddenPbqs.has(q.id)), "pbq", {includeDisabled:true}),
  };
}
