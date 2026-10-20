import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSet, learnerQuestion } from '../server/mcq-engine/engine.mjs';
const question = (id, tag = 'a') => ({ id, format: 'mcq', concept_tag: tag, prompt: id, options: [{ id: `${id}-a`, text: 'a', is_correct: true }, { id: `${id}-b`, text: 'b', is_correct: false }], explanation: 'secret' });
const bank = Array.from({ length: 80 }, (_, i) => question(`m${String(i).padStart(3, '0')}`, i < 40 ? 'a' : 'b'));
const empty = () => ({ mastery: [], failed: [], history: [] });
const seeded = () => { let seed = 19; return () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296); };
test('every allowed size is unique, upfront, and shuffled without answer keys', () => {
  for (let n = 10; n <= 30; n++) {
    const set = generateSet(bank, empty(), n, seeded());
    assert.equal(set.length, n); assert.equal(new Set(set.map(q => q.id)).size, n);
    assert.equal(set.filter(q => q.deck === 3).length, n);
    assert(!JSON.stringify(set.map(learnerQuestion)).includes('is_correct'));
    assert(!JSON.stringify(set.map(learnerQuestion)).includes('secret'));
    for (const q of set) assert.deepEqual([...q.options.map(o => o.id)].sort(), bank.find(b => b.id === q.id).options.map(o => o.id).sort());
  }
  for (const n of [9, 31, 10.5, '10']) assert.throws(() => generateSet(bank, empty(), n));
});
test('20/30/50 quotas, oldest retests, weakest remediation and waterfall', () => {
  const state = empty(); state.mastery = [{ concept_tag: 'a', score: 15 }, { concept_tag: 'b', score: 70 }];
  state.failed = [0, 1, 2].map(i => ({ question_id: bank[i].id, cooldown_counter: 0, created_at: `2026-01-0${i + 1}` }));
  state.history = state.failed.map(row => ({ question_id: row.question_id, last_seen_at: row.created_at }));
  const set = generateSet(bank, state, 10, seeded());
  assert.deepEqual(set.filter(q => q.deck === 1).map(q => q.id).sort(), ['m000', 'm001']);
  assert.equal(set.filter(q => q.deck === 2).length, 3); assert(set.filter(q => q.deck === 2).every(q => q.concept_tag === 'a'));
  state.failed = []; state.history = [];
  assert.equal(generateSet(bank, state, 10, seeded()).filter(q => q.deck === 2).length, 5);
  state.mastery = [{ concept_tag: 'c', score: 0 }];
  assert.equal(generateSet(bank, state, 10, seeded()).filter(q => q.deck === 3).length, 10);
});
test('exhaustion prefers lowest score then oldest latest exposure and cannot bypass quarantine', () => {
  const state = empty(); state.mastery = [{ concept_tag: 'a', score: 90 }, { concept_tag: 'b', score: 15 }];
  state.history = bank.map((q, i) => ({ question_id: q.id, last_seen_at: new Date(i * 1000).toISOString() }));
  state.failed = [{ question_id: 'm040', cooldown_counter: 1, created_at: '2026-01-01' }];
  const set = generateSet(bank, state, 10, seeded());
  assert.deepEqual(set.map(q => q.id).sort(), bank.slice(41, 51).map(q => q.id));
  assert.throws(() => generateSet(bank.slice(0, 10), { ...state, failed: [{ question_id: 'm000', cooldown_counter: 1 }] }, 10), /eligible/);
});
test('mastered discovery has half the relative sampling weight', () => {
  const state = empty(); state.mastery = [{ concept_tag: 'b', score: 80 }];
  const rng = seeded(); let a = 0, b = 0;
  for (let i = 0; i < 5000; i++) {
    const q = generateSet(bank, state, 10, rng).find(q => q.deck === 3);
    if (q.concept_tag === 'a') a++; else b++;
  }
  assert(a / b > 1.7 && a / b < 2.3, `observed ${a / b}`);
});
test('PBQs and duplicate catalogue IDs are rejected', () => {
  assert.throws(() => generateSet([...bank, { ...question('p001'), format: 'pbq' }], empty(), 10));
  assert.throws(() => generateSet([...bank, bank[0]], empty(), 10));
});
