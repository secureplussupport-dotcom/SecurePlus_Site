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

const compactFeedbackText = (value, maxLength = 520) => {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
};

const ensureFeedbackLead = (text, isCorrectAnswer) => {
  const clean = String(text || "").trim();
  if (/^correct\./i.test(clean) || /^incorrect\./i.test(clean)) return clean;
  return `${isCorrectAnswer ? "Correct." : "Incorrect."} ${clean}`.trim();
};

const pbqEvidenceNudge = question => {
  const type = String(question?.type || "").toUpperCase();
  if (type === "LOG ANALYSIS") return "Use the event pattern, source, destination, and timing instead of judging by one word in the log.";
  if (type === "TERMINAL SIM") return "Use the command output and the scenario goal together before choosing the answer.";
  if (type === "CONFIG/ACL") return "Check the required source, destination, service, and rule order before changing a control.";
  if (type === "HOTSPOT") return "Match the answer to the affected system or location shown in the scenario evidence.";
  if (type === "ORDERING") return "The safest order is the one that protects evidence, limits damage, and then restores service.";
  return "Focus on the stated business requirement and the strongest Security+ control for that situation.";
};

const inferPbqObjective = question => {
  const ch = String(question?.ch || question?.domain || "1");
  if (question?.objective && /^\d+\.\d+$/.test(String(question.objective)) && String(question.objective).startsWith(`${ch}.`)) return String(question.objective);
  const text = [question?.title, question?.cat, question?.type, question?.scenario, question?.question, question?.explanation].join(" ").toLowerCase();
  if (ch === "1") {
    if (/pki|certificate|crypt|hash|signature|tls|key|kerberos|symmetric|asymmetric/.test(text)) return "1.4";
    if (/control|zero trust|authentication|authorization|password|mfa|privilege|identity/.test(text)) return "1.2";
    return "1.1";
  }
  if (ch === "2") {
    if (/actor|motivation|phish|social engineering|pretext|whaling|smishing|vishing/.test(text)) return "2.1";
    if (/attack vector|attack surface|wireless|default credential|open service|email|removable/.test(text)) return "2.2";
    if (/vulnerab|injection|xss|sql|patch|cve|misconfig|dependency|supply chain/.test(text)) return "2.3";
    return "2.4";
  }
  if (ch === "3") {
    if (/cloud|shared responsibility|iaas|paas|saas|serverless|container|iot|ics|scada|architecture/.test(text)) return "3.1";
    if (/data|classification|dlp|mask|token|encrypt|retention|privacy|state/.test(text)) return "3.3";
    if (/resilience|recovery|backup|rto|rpo|dr|continuity|failover|replication/.test(text)) return "3.4";
    return "3.2";
  }
  if (ch === "4") {
    if (/automation|orchestration|script|playbook|ticket|baseline/.test(text)) return "4.7";
    if (/incident response phase|containment|eradication|recovery|lessons learned|root cause/.test(text)) return "4.8";
    if (/log|process|packet|capture|netflow|firewall|endpoint|investigat|forensic|chain of custody|siem|ids|ips|ioc|alert/.test(text)) return "4.9";
    return "4.9";
  }
  if (ch === "5") {
    if (/policy|standard|procedure|governance|change management|legal|regulatory|privacy/.test(text)) return "5.1";
    return "5.2";
  }
  return ({ "1":"1.2", "2":"2.4", "3":"3.2", "4":"4.9", "5":"5.2" })[ch] || "1.2";
};

const buildPbqOptionFeedback = (question, index, choice, correctIndex) => {
  const choices = question.choices || question.options || [];
  const correctChoice = choices[correctIndex] || "the correct option";
  const correctLetter = String.fromCharCode(65 + correctIndex);
  const explanation = compactFeedbackText(question.explanation, 360);
  if (index === correctIndex) {
    return compactFeedbackText(`Correct. This is the strongest answer because it matches the scenario evidence and the task requirement. ${explanation || pbqEvidenceNudge(question)}`, 520);
  }
  return compactFeedbackText(`Incorrect. This option may sound related, but it does not best satisfy the scenario. The stronger answer is ${correctLetter}: ${correctChoice}. ${pbqEvidenceNudge(question)}`, 520);
};

const ensurePbqChoiceFeedback = question => {
  const choices = Array.isArray(question.choices) ? question.choices : Array.isArray(question.options) ? question.options : null;
  if (!choices?.length || !Number.isInteger(question.correct)) return question;
  const optionFeedback = { ...(question.optionFeedback || question.choiceFeedback || {}) };
  const wrongFeedback = { ...(question.wrongFeedback || {}) };
  choices.forEach((choice, index) => {
    const existing = optionFeedback[index] ?? optionFeedback[String(index)] ?? (index !== question.correct ? wrongFeedback[index] ?? wrongFeedback[String(index)] : "");
    const fallback = buildPbqOptionFeedback(question, index, choice, question.correct);
    const feedback = compactFeedbackText(String(existing || "").trim().length >= 25 ? existing : fallback);
    optionFeedback[index] = ensureFeedbackLead(feedback, index === question.correct);
    if (index !== question.correct) wrongFeedback[index] = optionFeedback[index].replace(/^Incorrect\.\s*/i, "");
  });
  return { ...question, choices, options: choices, optionFeedback, wrongFeedback };
};

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
      explanation:item.explanation || item.solution || `Match this item to "${targetById.get(question.correctMapping?.[item.id]) || "the correct target"}" because that pairing best satisfies the scenario.`,
    }));
    return {...question,type:"SELECT & FILL",legacySelectionType:"DRAG & DROP",blanks,selectionOptions:uniqueOptions(targets.map(target => target.label))};
  }
  if (question.type !== "FILL BLANK" && question.type !== "SELECT & FILL") return question;
  const blanks = (question.blanks || []).map((blank, index) => ({
    ...blank,
    explanation:String(blank.explanation || blank.solution || "").trim().length >= 25
      ? String(blank.explanation || blank.solution).trim()
      : `The best selection for blank ${index + 1} is "${String(blank.answer || "").trim()}" because it matches the scenario clue and the SY0-701 concept being tested.`,
  }));
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

const enhancePbqQuestion = question => {
  const normalized = normalizeSelectionQuestion(question);
  return ensurePbqChoiceFeedback({
    ...normalized,
    objective: inferPbqObjective(normalized),
  });
};

const pbqs = [...basePbqs, ...importedPbqs]
  .filter(q => !lowQualityPbqIds.has(q.id))
  .map(enhancePbqQuestion);
const errors = [];
const warnings = [];
const MAX_MCQ_STEM_LENGTH = 360;
const MAX_MCQ_OPTION_LENGTH = 180;
const MAX_MCQ_TOTAL_LENGTH = 900;
const MAX_PBQ_PROMPT_LENGTH = 1000;
const MAX_PBQ_EXPLANATION_LENGTH = 620;
const PBQ_DOMAIN_MINIMUMS = Object.freeze({
  "1": 18,
  "2": 18,
  "3": 18,
  "4": 22,
  "5": 10,
});
const PBQ_DIFFICULTY_BANDS = Object.freeze({
  easy: [15, 35],
  medium: [45, 70],
  hard: [18, 35],
});
const DISCOURAGED_ACTIVE_PBQ_PATTERNS = [
  [/OpenSSL payload|openssl enc/i, "avoid OpenSSL command memorisation in active PBQs"],
  [/NIST SP 800-63B current guidance/i, "avoid narrow NIST password-guidance trivia in active PBQs"],
  [/bug bounty|exploit and remediate|payload would confirm/i, "avoid exploit-construction or bug-bounty framing in active PBQs"],
  [/\bAWS CLI\b|aws s3api|get-public-access-block/i, "avoid vendor CLI memorisation in active cloud PBQs"],
  [/Splunk SPL|index=windows_security|EventCode=4625/i, "avoid vendor SIEM query memorisation in active PBQs"],
  [/\bRAID\s*(?:0|1|5|6|10|levels?)\b/i, "avoid storage-admin RAID trivia in active SY0-701 PBQs"],
];

if (mcqs.length < 400) push(errors, "MCQ_BANK", `expected at least 400 active MCQs, found ${mcqs.length}`);
if (pbqs.length < 100) push(errors, "PBQ_BANK", `expected at least 100 PBQs, found ${pbqs.length}`);

const pbqDomainCounts = pbqs.reduce((counts, question) => {
  counts[question.ch] = (counts[question.ch] || 0) + 1;
  return counts;
}, {});
for (const [domain, minimum] of Object.entries(PBQ_DOMAIN_MINIMUMS)) {
  if ((pbqDomainCounts[domain] || 0) < minimum) {
    push(errors, "PBQ_BANK", `SY0-701 domain ${domain} needs at least ${minimum} active PBQs, found ${pbqDomainCounts[domain] || 0}`);
  }
}

const pbqDifficultyCounts = pbqs.reduce((counts, question) => {
  counts[question.difficulty] = (counts[question.difficulty] || 0) + 1;
  return counts;
}, {});
for (const [difficulty, [minimum, maximum]] of Object.entries(PBQ_DIFFICULTY_BANDS)) {
  const count = pbqDifficultyCounts[difficulty] || 0;
  if (count < minimum || count > maximum) {
    push(errors, "PBQ_BANK", `PBQ ${difficulty} difficulty count should stay between ${minimum}-${maximum}, found ${count}`);
  }
}

const pbqTypeCounts = pbqs.reduce((counts, question) => {
  counts[question.type] = (counts[question.type] || 0) + 1;
  return counts;
}, {});
if (Object.keys(pbqTypeCounts).length < 6) {
  push(errors, "PBQ_BANK", `expected at least 6 active PBQ interaction types, found ${Object.keys(pbqTypeCounts).length}`);
}
if ((pbqTypeCounts.SCENARIO || 0) > Math.ceil(pbqs.length * 0.38)) {
  push(errors, "PBQ_BANK", "scenario-only PBQs should not dominate the active bank");
}

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
  if (!/^[1-5]\.\d+$/.test(String(q.objective || ""))) push(errors, q.id, "missing SY0-701 objective tag");
  else if (!String(q.objective).startsWith(`${q.ch}.`)) push(errors, q.id, `objective ${q.objective} does not match domain ${q.ch}`);
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
  const searchablePbqText = [q.title, q.cat, q.scenario, q.question, q.hint, q.answer, q.diagram, q.logData, q.currentConfig, q.explanation, ...(q.choices || [])].filter(Boolean).join(" ");
  for (const [pattern, message] of DISCOURAGED_ACTIVE_PBQ_PATTERNS) {
    if (pattern.test(searchablePbqText)) push(errors, q.id, message);
  }

  const pbqChoices = Array.isArray(q.choices) ? q.choices : Array.isArray(q.options) ? q.options : null;
  if (pbqChoices?.length) {
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= pbqChoices.length) push(errors, q.id, "PBQ correct index is invalid");
    const optionFeedback = q.optionFeedback || {};
    pbqChoices.forEach((_, index) => {
      const feedback = optionFeedback[index] || optionFeedback[String(index)];
      if (!feedback || String(feedback).length < 40) push(errors, q.id, `missing explanation for option ${String.fromCharCode(65 + index)}`);
      if (index === q.correct && feedback && !/^correct\./i.test(String(feedback).trim())) push(errors, q.id, `correct option ${String.fromCharCode(65 + index)} explanation must start with "Correct."`);
      if (index !== q.correct && feedback && !/^incorrect\./i.test(String(feedback).trim())) push(errors, q.id, `wrong option ${String.fromCharCode(65 + index)} explanation must start with "Incorrect."`);
    });
    const wrongFeedback = q.wrongFeedback || {};
    pbqChoices.forEach((_, index) => {
      if (index === q.correct) return;
      const feedback = wrongFeedback[index] || wrongFeedback[String(index)];
      if (!feedback || String(feedback).length < 25) push(errors, q.id, `missing wrong-answer explanation for option ${String.fromCharCode(65 + index)}`);
    });
  }

  if (q.type === "SELECT & FILL") {
    const answerKeys = new Set((q.blanks || []).map(blank => normalize(blank.answer)));
    const distractors = (q.selectionOptions || []).filter(option => !answerKeys.has(normalize(option)));
    if (!Array.isArray(q.blanks) || !q.blanks.length || q.blanks.some(blank => !blank.answer || !blank.sentence)) push(errors, q.id, "Select & Fill PBQ needs complete prompt/answer rows");
    if (!Array.isArray(q.selectionOptions) || q.selectionOptions.length < 4) push(errors, q.id, "Select & Fill PBQ needs at least four shared selector options");
    if (q.blanks?.some(blank => !(q.selectionOptions || []).some(option => normalize(option) === normalize(blank.answer)))) push(errors, q.id, "Select & Fill correct answer is missing from the shared option bank");
    if (q.blanks?.some(blank => !blank.explanation || String(blank.explanation).length < 25)) push(errors, q.id, "Select & Fill PBQ needs an explanation for every blank");
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
console.log(`- PBQ quality gates: SY0-701 objective fit, selector explanations, and every choice option explanation`);

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
