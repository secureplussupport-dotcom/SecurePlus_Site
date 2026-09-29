import { SECOND_PASS_MCQ_REVIEW, SECOND_PASS_PBQ_REVIEW } from "../src/data/sy0701SecondPassReview.js";
import assert from "node:assert/strict";
import { readAuthoredBank, readMcqEnhancer, readPbqEnhancer, readPbqDatabaseAdapters } from "./lib/read-authored-bank.mjs";
import { MCQ_REVIEW, RETIRED_MCQ_REVIEW, applyMcqEditorialReview } from "../src/data/sy0701EditorialReview.js";
import { PBQ_REVIEW, RETIRED_PBQ_REVIEW, applyPbqEditorialReview } from "../src/data/sy0701PbqReview.js";
import { LESSON_REVIEW } from "../src/data/sy0701LessonReview.js";
import { CONCEPT_DEEP_DIVES } from "../src/data/conceptDeepDives.js";
import { SY0701_OBJECTIVES, getSy0701DeepDiveProfile } from "../src/data/sy0701DeepDiveMap.js";
import { buildDeepDivePracticeQuestions } from "../src/lib/deepDiveStudy.js";
import { PUBLISHED_CONTENT_SNAPSHOT, isCapturedOverride, isSnapshotDisabled, preferReviewedPbq } from "../src/data/sy0701PublishedSnapshot.js";
import { readFileSync } from "node:fs";

const { mcqs: rawMcqs, pbqs: rawPbqs } = readAuthoredBank();
const normalize = value => String(value).trim().toLowerCase();
const unique = values => new Set(values.map(normalize)).size === values.length;
const meaningful = value => typeof value === "string" && value.trim().length >= 25;
function coverage(raw, retained, retired, label) {
  assert(unique(raw.map(q => q.id)), `${label}: duplicate source IDs`);
  assert.deepEqual(new Set(raw.map(q => q.id)), new Set([...Object.keys(retained), ...Object.keys(retired)]), `${label}: every active authored item needs a review or retirement decision`);
  for (const q of raw) assert(Boolean(retained[q.id]) !== Boolean(retired[q.id]), `${q.id}: conflicting review decisions`);
}
coverage(rawMcqs, MCQ_REVIEW, RETIRED_MCQ_REVIEW, "MCQ");
coverage(rawPbqs, PBQ_REVIEW, RETIRED_PBQ_REVIEW, "PBQ");
const mcqs = rawMcqs.filter(q => MCQ_REVIEW[q.id]).map(readMcqEnhancer()).map(applyMcqEditorialReview);
const pbqs = rawPbqs.filter(q => PBQ_REVIEW[q.id]).map(applyPbqEditorialReview);
const seenObjectives = new Set();
function tags(q) {
  assert(SY0701_OBJECTIVES[q.objective], `${q.id}: invalid objective ${q.objective}`);
  assert.equal(String(q.ch), q.objective.split(".")[0], `${q.id}: chapter/objective mismatch`);
  assert(["easy", "medium", "hard"].includes(q.difficulty), `${q.id}: invalid difficulty`);
  seenObjectives.add(q.objective);
}
for (const q of mcqs) {
  tags(q);
  assert(meaningful(q.q) && meaningful(q.exp), `${q.id}: missing question/explanation`);
  assert(q.topic?.trim(), `${q.id}: missing topic`);
  assert(q.opts.length === 4 && unique(q.opts), `${q.id}: four distinct options required`);
  assert(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.opts.length, `${q.id}: invalid key`);
  q.opts.forEach((_, index) => {
    if (index !== q.correct) assert(meaningful(q.wrongFeedback?.[index]), `${q.id}: missing authored explanation for option ${index}`);
  });
}
for (const q of pbqs) {
  tags(q);
  assert(meaningful(q.explanation), `${q.id}: missing overall explanation`);
  if (q.type === "SELECT & FILL") {
    assert(q.blanks.length >= 2 && unique(q.blanks.map(b => b.id)), `${q.id}: invalid blank IDs`);
    assert(q.selectionOptions.length >= 3 && unique(q.selectionOptions), `${q.id}: invalid selection bank`);
    q.blanks.forEach(b => {
      assert(q.selectionOptions.includes(b.answer), `${q.id}/${b.id}: answer outside option bank`);
      assert(meaningful(b.explanation), `${q.id}/${b.id}: missing authored solution`);
    });
    q.selectionOptions.forEach(option => assert(meaningful(q.selectionFeedback[option]), `${q.id}: missing option meaning`));
  } else if (q.type === "ORDERING") {
    assert.deepEqual(new Set(q.correctOrder), new Set(q.items.map(item => item.id)), `${q.id}: ordering key must contain each item once`);
    assert(unique(q.correctOrder), `${q.id}: repeated ordering key`);
    q.items.forEach(item => assert(meaningful(item.explanation), `${q.id}/${item.id}: missing step rationale`));
  } else {
    const choices = q.choices || q.options;
    assert(choices?.length >= 3 && unique(choices), `${q.id}: invalid answer choices`);
    assert(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < choices.length, `${q.id}: invalid key`);
    choices.forEach((_, index) => assert(meaningful(q.optionFeedback?.[index]), `${q.id}: missing option ${index} rationale`));
  }
}
const enhancePbq = readPbqEnhancer();
for (const q of pbqs) {
  const displayed = enhancePbq(q);
  assert.equal(displayed.explanation, q.explanation, `${q.id}: runtime truncated/replaced the reviewed solution`);
  assert.equal(displayed.objective, q.objective, `${q.id}: runtime replaced objective`);
  if (q.blanks) assert.deepEqual(displayed.blanks, q.blanks, `${q.id}: runtime replaced selection solutions`);
  if (q.optionFeedback) for (const [index, feedback] of Object.entries(q.optionFeedback)) {
    assert(displayed.optionFeedback[index].includes(feedback), `${q.id}: runtime replaced option ${index} explanation`);
  }
}
assert.deepEqual(seenObjectives, new Set(Object.keys(SY0701_OBJECTIVES)), "Question banks must cover all 28 objective groups (not proof of every sub-bullet)");
assert.deepEqual(new Set(CONCEPT_DEEP_DIVES.map(d => d.id)), new Set(Object.keys(LESSON_REVIEW)), "Every lesson needs an explicit editorial decision");
let generated = 0;
for (const dive of CONCEPT_DEEP_DIVES) {
  const profile = getSy0701DeepDiveProfile(dive);
  for (const q of buildDeepDivePracticeQuestions(dive)) {
    generated++;
    assert(unique(q.options) && q.options.includes(q.answer), `${q.id}: ambiguous/invalid options`);
    assert(!profile.beyondSections.includes(q.sectionIndex), `${q.id}: enrichment leaked into exam practice`);
    q.options.forEach(option => assert(meaningful(q.optionFeedback[option]), `${q.id}: missing feedback`));
  }
}
// Follow-up patches must survive the published snapshot and legacy-enhancement
// pipeline. In particular, historical public overrides must not restore stale
// choices while retaining a revised key or explanation.
for (const [patches, bank] of [[SECOND_PASS_MCQ_REVIEW, mcqs], [SECOND_PASS_PBQ_REVIEW, pbqs]]) {
  for (const [id, patch] of Object.entries(patches)) {
    const effective = bank.find(q => q.id === id);
    assert(effective, `${id}: second-pass correction has no active reviewed item`);
    for (const [field, value] of Object.entries(patch)) {
      assert.deepEqual(effective[field], value, `${id}: second-pass ${field} lost to earlier content`);
    }
  }
}
// Factual/structural regressions that formerly gave learners contradictory keys.
const p011 = pbqs.find(q => q.id === "p011");
// These two Pro rows also live in Supabase. Check the actual write/read path,
// including duplicate payload representations and entitlement preservation.
const adapters = readPbqDatabaseAdapters();
for (const id of ["p003", "p017"]) {
  const authored = {...pbqs.find(q => q.id === id), is_pro:true};
  const serialized = adapters.serialize(authored, id === "p003" ? 8 : 1);
  const restored = adapters.normalize(serialized);
  assert.equal(restored.is_pro, true, `${id}: database round trip changed entitlement`);
  for (const field of ["scenario", "question", "answer", "correct", "explanation", "difficulty", "objective", "choices"]) {
    assert.deepEqual(restored[field] || "", authored[field] || "", `${id}: database round trip changed ${field}`);
  }
  authored.choices.forEach((_, i) => assert(restored.optionFeedback[i].includes(authored.optionFeedback[i]), `${id}: database round trip lost feedback ${i}`));
}
assert.deepEqual(p011.blanks.find(b => b.id === "d").acceptedAnswers, ["Fraction", "Proportion"]);
assert(!p011.blanks.find(b => b.id === "b").acceptedAnswers?.includes("Fraction"));
assert.match(mcqs.find(q => q.id === "m005").exp, /root|anchor/i);
assert.match(pbqs.find(q => q.id === "p070").explanation, /default deny/i);
const ambiguous = { id: "test-ambiguous", sections: [{ table: { columns: ["Actual", "Observed"], rows: [["Malicious", "Alert"], ["Benign", "Alert"]] } }] };
assert.equal(buildDeepDivePracticeQuestions(ambiguous).length, 0, "Repeated observation cannot identify one unique answer");
const captured = PUBLISHED_CONTENT_SNAPSHOT.find(r=>r.question_id==="m404");
assert(isCapturedOverride(captured));
assert(!isCapturedOverride({...captured,updated_at:"2026-09-06T00:00:00Z"}), "Later admin edits must remain publishable");
const local={id:"p001",editorialReviewed:true,explanation:"Reviewed",is_pro:false};
assert.equal(preferReviewedPbq(local,{id:"p001",explanation:"Stale",is_pro:true,remoteUpdatedAt:"2026-09-01T00:00:00Z"}).explanation,"Reviewed");
assert.equal(preferReviewedPbq(local,{id:"p001",is_pro:true}).is_pro,true, "Content revision must preserve remote entitlement policy");
assert.equal(preferReviewedPbq(local,{id:"p001",explanation:"New admin publication",remoteUpdatedAt:"2026-09-06T00:00:00Z"}).explanation,"New admin publication");
const activeMcqs = mcqs.filter(q=>!isSnapshotDisabled(q.id,"mcq"));
assert.equal(activeMcqs.find(q=>q.id==="m402").correct,0, "Published key must not override revised options");
assert.equal(activeMcqs.find(q=>q.id==="m404").correct,1, "Salt answer must match the published/reviewed options");
const app=readFileSync("src/App.jsx","utf8");
assert(app.includes("if (isCapturedOverride(row)) {"), "Stale overrides must not restore corrected errors");
assert(app.includes("preferReviewedPbq(question,remoteById.get(question.id))"));
console.log(`Editorial integrity passed: ${activeMcqs.length} active MCQs (${mcqs.length} reviewed, ${mcqs.length-activeMcqs.length} existing admin disables preserved), ${pbqs.length} PBQs, ${CONCEPT_DEEP_DIVES.length} lessons, ${generated} generated practice questions.`);
console.log(`Retired: ${Object.keys(RETIRED_MCQ_REVIEW).length} MCQs and ${Object.keys(RETIRED_PBQ_REVIEW).length} PBQs. Feedback checked before UI fallbacks.`);
console.log(`Includes ${PUBLISHED_CONTENT_SNAPSHOT.length} captured public override records and database round-trip checks for p003/p017. See docs/content-review.md for the dated live database comparison. Tests do not certify factual accuracy.`);
