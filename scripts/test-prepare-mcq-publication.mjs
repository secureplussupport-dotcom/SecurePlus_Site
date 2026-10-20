import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectMcqBatch } from './prepare-mcq-publication.mjs';
import sample from '../docs/question-bank/fido2-passwordless-four-core-applied.json' with { type: 'json' };

const batch = sample.map((q, i) => ({ ...q, id: `m900${i}` }));
const row = q => ({ question_kind: 'mcq', question_id: q.id, status: 'active', action: 'upsert', payload: structuredClone(q) });
const history = q => ({ question_kind: 'mcq', question_id: q.id, change_type: 'add', next_override: row(q) });

test('a valid owner batch has one compact result and matching readback', () => {
  const result = inspectMcqBatch(batch, { readback: batch.map(row), history: batch.map(history) });
  assert.equal(result.count, 4);
  assert.equal(result.core, 2);
  assert.equal(result.applied, 2);
  assert.equal(result.readback, 'matched');
  assert.equal(result.history, 'matched');
});

test('rejects collisions, invalid tags, and missing feedback before publication', () => {
  assert.throws(() => inspectMcqBatch(batch, { existing: [row(batch[0])] }), /ID already exists/);
  assert.throws(() => inspectMcqBatch([{ ...batch[0], conceptTagIds: ['unknown.tag'] }]), /known tag IDs/);
  assert.throws(() => inspectMcqBatch([{ ...batch[0], wrongFeedback: {} }]), /feedback is required/);
});

test('rejects changed live payloads and missing history', () => {
  const changed = batch.map(row);
  changed[0].payload.q = 'A changed question';
  assert.throws(() => inspectMcqBatch(batch, { readback: changed }), /readback does not exactly match/);
  assert.throws(() => inspectMcqBatch(batch, { history: [] }), /addition-history/);
});
