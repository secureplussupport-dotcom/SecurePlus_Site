// Local audit oracle only: execute existing trusted source functions, never
// request-controlled strings. Production server modules do not import this file.
import { readFileSync } from 'node:fs';
import { readAuthoredInputs, readMcqEnhancer, readPbqEnhancer, readPbqDatabaseAdapters } from './read-authored-bank.mjs';
import { mergePublishedSnapshot, isCapturedOverride, preferReviewedPbq } from '../../src/data/sy0701PublishedSnapshot.js';
import { isMcqEditoriallyActive, applyMcqEditorialReview } from '../../src/data/sy0701EditorialReview.js';
import { isPbqEditoriallyActive, applyPbqEditorialReview } from '../../src/data/sy0701PbqReview.js';

export function readPublicationFixtures() {
  const source = readFileSync('src/App.jsx', 'utf8');
  const section = (begin, end) => {
    const start = source.indexOf(begin), finish = source.indexOf(end, start);
    if (start < 0 || finish < 0) throw new Error(`Missing runtime oracle: ${begin}`);
    return source.slice(start, finish);
  };
  const ensureMcqFeedback = Function(`"use strict"; ${section('function ensureMcqWrongFeedback(', 'function normalizeQuestionStem(')}; return ensureMcqWrongFeedback;`)();
  const pipeline = { enhanceMcq: readMcqEnhancer(), ensureMcqFeedback, enhancePbq: readPbqEnhancer(), normalizeRemotePbq: readPbqDatabaseAdapters().normalize };
  const oracle = input => {
    const base = kind => mergePublishedSnapshot([...input.authored[kind], ...input.imported[kind]].filter(q => !input.excluded[kind].includes(q.id)), kind)
      .filter(kind === 'mcq' ? isMcqEditoriallyActive : isPbqEditoriallyActive)
      .map(q => kind === 'mcq' ? ensureMcqFeedback(applyMcqEditorialReview(pipeline.enhanceMcq(q))) : pipeline.enhancePbq(applyPbqEditorialReview(q)));
    const run = Function('BASE_MCQ_BANK', 'BASE_PBQ_BANK', 'isMcqEditoriallyActive', 'isPbqEditoriallyActive', 'isCapturedOverride', 'ensureMcqWrongFeedback', 'preferReviewedPbq', 'enhancePBQQuestion', 'rows', 'remote', 'remoteEnabled', `"use strict";
      let MCQ_BANK=BASE_MCQ_BANK, PBQ_BANK=BASE_PBQ_BANK;
      ${section('function applyQuestionOverrides(', '// ═══════════════════════════════════════════════════════════════\n// DAILY CHALLENGE')}
      ${section('function mergeRemotePBQBanks(', 'function buildSupabasePBQMutation(')}
      applyQuestionOverrides(rows);
      return {mcqs:MCQ_BANK,pbqs:remoteEnabled?mergeRemotePBQBanks(PBQ_BANK,remote):PBQ_BANK};
    `);
    return run(base('mcq'), base('pbq'), isMcqEditoriallyActive, isPbqEditoriallyActive, isCapturedOverride, ensureMcqFeedback, preferReviewedPbq, pipeline.enhancePbq,
      input.overrides ?? [], (input.remotePbqRows ?? []).map(pipeline.normalizeRemotePbq), input.remoteEnabled ?? true);
  };
  return { assets: readAuthoredInputs(), pipeline, oracle, serializePbq: readPbqDatabaseAdapters().serialize };
}
