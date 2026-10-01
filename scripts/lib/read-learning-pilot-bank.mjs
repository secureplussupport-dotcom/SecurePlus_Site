import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readAuthoredBank, readMcqEnhancer, readPbqEnhancer } from './read-authored-bank.mjs';
import { isMcqEditoriallyActive, applyMcqEditorialReview } from '../../src/data/sy0701EditorialReview.js';
import { isPbqEditoriallyActive, applyPbqEditorialReview } from '../../src/data/sy0701PbqReview.js';
import { isSnapshotDisabled } from '../../src/data/sy0701PublishedSnapshot.js';

// Local effective publication pipeline, not raw literals. No remote reads/writes.
// Existing editorial audit checks authored wrong-option feedback completeness.
export function readLearningPilotBank() {
  const raw = readAuthoredBank();
  const source = readFileSync('src/App.jsx', 'utf8');
  const start = source.indexOf('function ensureMcqWrongFeedback(');
  const end = source.indexOf('function normalizeQuestionStem(', start);
  if (start < 0 || end < 0) throw new Error('Missing final MCQ feedback pipeline');
  const ensureFeedback = Function(`"use strict"; ${source.slice(start, end)}; return ensureMcqWrongFeedback;`)();
  return {
    mcqs: raw.mcqs.filter(isMcqEditoriallyActive).filter(q => !isSnapshotDisabled(q.id, 'mcq')).map(readMcqEnhancer()).map(applyMcqEditorialReview).map(ensureFeedback),
    pbqs: raw.pbqs.filter(isPbqEditoriallyActive).filter(q => !isSnapshotDisabled(q.id, 'pbq')).map(applyPbqEditorialReview).map(readPbqEnhancer()),
  };
}
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
export const contentSignature = value => `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
