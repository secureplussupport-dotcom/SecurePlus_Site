import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import base from '../server/mcq-engine/base-catalogue.json' with { type: 'json' };
import { CONCEPT_TAGS } from '../src/data/sy0701ConceptTags.js';
import { normalizeMcqDifficulty } from '../src/lib/mcqDifficulty.js';

const knownTags = new Set(CONCEPT_TAGS.map(tag => tag.id));
const stemKey = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const fail = message => { throw new Error(message); };
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));

export function inspectMcqBatch(batch, { existing = [], readback = null, history = null } = {}) {
  if (!Array.isArray(batch) || batch.length === 0) fail('Batch must be a non-empty JSON array.');
  if (!Array.isArray(existing)) fail('Existing overrides must be a JSON array.');
  const occupied = new Map(base.map(q => [q.id, q]));
  for (const row of existing) {
    if (row.question_kind !== 'mcq') continue;
    occupied.set(row.question_id, row.payload || {});
  }
  const stems = new Set([...occupied.values()].map(q => stemKey(q.q)).filter(Boolean));
  const ids = new Set();
  const levels = { core: 0, applied: 0 };
  for (const q of batch) {
    if (!q || typeof q !== 'object' || Array.isArray(q)) fail('Each question must be an object.');
    if (!/^m\d+$/.test(q.id || '')) fail(`Invalid MCQ ID: ${q.id}`);
    if (ids.has(q.id) || occupied.has(q.id)) fail(`${q.id}: ID already exists in this batch or the supplied catalogue.`);
    ids.add(q.id);
    if (!['core', 'applied'].includes(q.difficulty) || normalizeMcqDifficulty(q.difficulty) !== q.difficulty) fail(`${q.id}: use Core or Applied difficulty.`);
    levels[q.difficulty]++;
    if (!String(q.ch || '').trim() || !String(q.topic || '').trim()) fail(`${q.id}: chapter and topic are required.`);
    const stem = stemKey(q.q);
    if (stem.length < 20 || stems.has(stem)) fail(`${q.id}: missing, short, or duplicate question stem.`);
    stems.add(stem);
    if (!Array.isArray(q.opts) || q.opts.length !== 4 || q.opts.some(opt => !String(opt || '').trim()) || new Set(q.opts.map(stemKey)).size !== 4) fail(`${q.id}: four distinct non-empty options are required.`);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) fail(`${q.id}: correct must be an option index from 0 to 3.`);
    if (!String(q.exp || '').trim()) fail(`${q.id}: correct-answer explanation is required.`);
    if (!q.wrongFeedback || typeof q.wrongFeedback !== 'object' || [0, 1, 2, 3].some(i => i !== q.correct && !String(q.wrongFeedback[i] || '').trim())) fail(`${q.id}: feedback is required for each wrong option.`);
    if (!Array.isArray(q.conceptTagIds) || !q.conceptTagIds.length || new Set(q.conceptTagIds).size !== q.conceptTagIds.length || q.conceptTagIds.some(tag => !knownTags.has(tag))) fail(`${q.id}: concept tags must be distinct known tag IDs.`);
  }
  if (readback !== null) {
    if (!Array.isArray(readback)) fail('Readback must be a JSON array.');
    for (const q of batch) {
      const rows = readback.filter(row => row.question_kind === 'mcq' && row.question_id === q.id);
      if (rows.length !== 1 || rows[0].status !== 'active' || rows[0].action !== 'upsert' || !isDeepStrictEqual(rows[0].payload, q)) fail(`${q.id}: live readback does not exactly match the approved payload.`);
    }
  }
  if (history !== null) {
    if (!Array.isArray(history)) fail('History must be a JSON array.');
    for (const q of batch) {
      const rows = history.filter(row => row.question_kind === 'mcq' && row.question_id === q.id && row.change_type === 'add');
      if (rows.length !== 1 || !isDeepStrictEqual(rows[0].next_override?.payload, q)) fail(`${q.id}: exactly one matching addition-history row is required.`);
    }
  }
  return { count: batch.length, ...levels, ids: batch.map(q => q.id), sha256: createHash('sha256').update(JSON.stringify(batch)).digest('hex'), existing: existing.length ? `${existing.length} rows checked` : 'not checked', readback: readback === null ? 'not checked' : 'matched', history: history === null ? 'not checked' : 'matched' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [batchPath, ...args] = process.argv.slice(2);
    if (!batchPath || args.length % 2 || args.some((arg, i) => i % 2 === 0 && !['--existing', '--readback', '--history'].includes(arg))) fail('Usage: node scripts/prepare-mcq-publication.mjs batch.json [--existing overrides.json] [--readback rows.json] [--history rows.json]');
    const paths = Object.fromEntries(Array.from({ length: args.length / 2 }, (_, i) => [args[2 * i].slice(2), args[2 * i + 1]]));
    const result = inspectMcqBatch(readJson(batchPath), { existing: paths.existing ? readJson(paths.existing) : [], readback: paths.readback ? readJson(paths.readback) : null, history: paths.history ? readJson(paths.history) : null });
    console.log(`PASS ${result.count} MCQs (${result.core} Core, ${result.applied} Applied); IDs ${result.ids.join(',')}; SHA256 ${result.sha256}; existing ${result.existing}; readback ${result.readback}; history ${result.history}.`);
  } catch (error) { console.error(`FAIL ${error.message}`); process.exitCode = 1; }
}
