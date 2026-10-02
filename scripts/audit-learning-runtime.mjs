import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { readPublicationFixtures } from './lib/read-publication-fixtures.mjs';
import { PUBLISHED_CONTENT_SNAPSHOT } from '../src/data/sy0701PublishedSnapshot.js';
import { RETIRED_MCQ_REVIEW } from '../src/data/sy0701EditorialReview.js';
import { RETIRED_PBQ_REVIEW } from '../src/data/sy0701PbqReview.js';
import { QUESTION_MAPPINGS } from '../src/data/learningMappings.js';
import { resolvePublication } from '../server/adaptive/publication.mjs';
import { compileRevision, learnerRevision, gradeRevision } from '../server/adaptive/revision.mjs';
import { assessReplayChronology } from '../server/adaptive/chronology.mjs';
import { shadowWritesAllowed, createShadowRunner } from '../server/adaptive/shadow.mjs';

const { assets, pipeline, oracle, serializePbq } = readPublicationFixtures();
const copy = structuredClone;
const base = resolvePublication(assets, pipeline);
const mcq = base.mcqs.find(q => q.id === 'm032'), pbq = base.pbqs.find(q => q.id === 'p211'), ordering = base.pbqs.find(q => q.id === 'p048');
const mcqRevision = compileRevision(mcq, 'mcq');
const override = (kind, id, payload, extra = {}) => ({ status: 'active', question_kind: kind, question_id: id, action: 'upsert', payload, updated_at: '2026-10-01T00:00:00Z', ...extra });
const remote = (q, date) => ({ ...serializePbq({ ...q, is_pro: false }, 1), updated_at: date });
const parity = extra => {
  const input = { ...assets, ...extra }, actual = resolvePublication(input, pipeline), expected = oracle(input);
  assert.deepEqual({ mcqs: actual.mcqs, pbqs: actual.pbqs }, expected);
  return actual;
};

test('publication: complete local bank equals current application oracle', () => {
  parity({});
  assert.deepEqual([base.mcqs.length, base.pbqs.length], [395, 88]);
});
test('publication: captured override cannot undo editorial review', () => {
  const row = PUBLISHED_CONTENT_SNAPSHOT.find(r => r.question_kind === 'mcq' && r.question_id === 'm013');
  const result = parity({ overrides: [{ ...row, status: 'active', payload: { q: 'stale replacement' }, sort_order: 1 }] });
  assert.notEqual(result.mcqs.find(q => q.id === row.question_id).q, 'stale replacement');
});
test('publication: new override, payload ID correction and last active row wins', () => {
  const result = parity({ overrides: [override('mcq', 'm032', { q: 'first' }), override('mcq', 'm032', { id: 'm999', q: 'last' }), override('mcq', 'm032', { q: 'inactive' }, { status: 'draft' })] });
  assert.equal(result.mcqs.find(q => q.id === 'm032').q, 'last');
});
test('publication: disable removes local questions and historical revision still grades', () => {
  const result = parity({ overrides: [override('mcq', 'm032', {}, { action: 'disable' })] });
  assert.ok(!result.mcqs.some(q => q.id === 'm032'));
  assert.equal(gradeRevision(mcqRevision, mcqRevision.gradingKey.expected).correct, true);
});
test('publication: retirement survives new overrides and remote rows', () => {
  const mid = Object.keys(RETIRED_MCQ_REVIEW)[0], pid = Object.keys(RETIRED_PBQ_REVIEW)[0];
  const result = parity({ overrides: [override('mcq', mid, { ...mcq, id: mid }), override('pbq', pid, { ...pbq, id: pid })], remotePbqRows: [remote({ ...pbq, id: pid }, '2026-10-01T00:00:00Z')] });
  assert.ok(!result.mcqs.some(q => q.id === mid) && !result.pbqs.some(q => q.id === pid));
});
for (const [name, date, expected] of [['old', '2026-09-01T00:00:00Z', pbq.title], ['cutoff-equal', '2026-09-05T13:32:13Z', pbq.title], ['missing-date', undefined, pbq.title], ['new', '2026-09-30T00:00:00Z', 'Remote title']]) {
  test(`publication: ${name} remote PBQ honors reviewed cutoff`, () => {
    const result = parity({ remotePbqRows: [remote({ ...pbq, title: 'Remote title' }, date)] });
    assert.equal(result.pbqs.find(q => q.id === 'p211').title, expected);
  });
}
test('publication: newer remote PBQ wins conflict with live override', () => {
  const result = parity({ overrides: [override('pbq', 'p211', { title: 'Override title' })], remotePbqRows: [remote({ ...pbq, title: 'Remote title' }, '2026-09-30T00:00:00Z')] });
  assert.equal(result.pbqs.find(q => q.id === 'p211').title, 'Remote title');
});
test('publication: preserve current remote merge after local disable', () => {
  const result = parity({ overrides: [override('pbq', 'p211', {}, { action: 'disable' })], remotePbqRows: [remote(pbq, '2026-09-30T00:00:00Z')] });
  assert.ok(result.pbqs.some(q => q.id === 'p211'));
});
test('publication: no remote merge when application remote capability is absent', () => {
  const result = parity({ remoteEnabled: false, remotePbqRows: [remote({ ...pbq, title: 'Ignored remote' }, '2026-09-30T00:00:00Z')] });
  assert.equal(result.pbqs.find(q => q.id === 'p211').title, pbq.title);
});
test('publication: provenance is deterministic and caller assets remain untouched', () => {
  const before = JSON.stringify(assets), a = resolvePublication(assets, pipeline), b = resolvePublication(assets, pipeline);
  assert.deepEqual(a.provenance, b.provenance);
  assert.equal(JSON.stringify(assets), before);
  assert.ok(a.provenance['mcq:m032'].some(step => step.stage === 'final_effective_content'));
  assert.throws(() => resolvePublication(assets, {}), /Missing trusted/);
});

const reorderChoices = (q, indices, kind) => {
  const result = copy(q), key = kind === 'mcq' ? 'opts' : 'choices';
  result[key] = indices.map(i => q[key][i]);
  if (kind === 'pbq') result.options = [...result.choices];
  result.correct = indices.indexOf(q.correct);
  for (const feedback of ['wrongFeedback', 'optionFeedback']) if (q[feedback]) result[feedback] = Object.fromEntries(indices.flatMap((old, index) => q[feedback][old] === undefined ? [] : [[index, q[feedback][old]]]));
  return result;
};
for (const [name, q, kind] of [['MCQ', mcq, 'mcq'], ['choice PBQ', pbq, 'pbq']]) {
  test(`identity: ${name} option reorder preserves revision and grading`, () => {
    const a = compileRevision(q, kind), b = compileRevision(reorderChoices(q, [3, 1, 0, 2], kind), kind);
    assert.equal(a.revisionId, b.revisionId);
    assert.deepEqual(a.components, b.components);
    assert.deepEqual(gradeRevision(a, a.gradingKey.expected), gradeRevision(b, a.gradingKey.expected));
  });
}
test('identity: authored ordering IDs survive input item shuffling', () => {
  const a = compileRevision(ordering, 'pbq'), b = compileRevision({ ...ordering, items: [...ordering.items].reverse() }, 'pbq');
  assert.equal(a.revisionId, b.revisionId);
  assert.equal(gradeRevision(a, [...a.gradingKey.expected].reverse()).correct, true);
});
test('identity: semantic, feedback and grading changes require new revisions', () => {
  for (const delta of [{ q: mcq.q + ' Changed.' }, { correct: 0 }, { exp: 'Changed explanation' }, { wrongFeedback: { ...mcq.wrongFeedback, 0: 'Changed feedback' } }]) assert.notEqual(compileRevision({ ...mcq, ...delta }, 'mcq').revisionId, mcqRevision.revisionId);
});
test('identity: administrative ordering, timestamps and access metadata are not answer revisions', () => {
  assert.equal(compileRevision({ ...mcq, _adminOrder: 20, remoteUpdatedAt: '2026-10-02T00:00:00Z', is_pro: true }, 'mcq').revisionId, mcqRevision.revisionId);
});
test('identity: all seven provisional pilot questions compile; PBQs stay coarse', () => {
  for (const mapping of QUESTION_MAPPINGS) {
    const q = [...base.mcqs, ...base.pbqs].find(q => q.id === mapping.questionId), r = compileRevision(q, mapping.format);
    assert.match(r.revisionId, /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.equal(gradeRevision(r, r.gradingKey.expected).evidencePrecision, mapping.evidencePrecision);
  }
});
test('identity: duplicate choices and unsupported component formats fail closed', () => {
  assert.throws(() => compileRevision({ ...mcq, opts: [mcq.opts[0], mcq.opts[0]] }, 'mcq'), /duplicate/);
  assert.throws(() => compileRevision({ ...pbq, blanks: [{ id: 'b1', answer: 'secret' }] }, 'pbq'), /Unsupported/);
  assert.throws(() => compileRevision({ ...mcq, unknownAnswerField: 'secret' }, 'mcq'), /Unsupported/);
  assert.throws(() => compileRevision({ ...ordering, correctOrder: ['a', 'a'] }, 'pbq'), /Invalid ordering/);
});
test('grading: shuffled learner view keeps stable identities and contains no grading keys', () => {
  for (const r of [mcqRevision, compileRevision(pbq, 'pbq'), compileRevision(ordering, 'pbq')]) {
    const order = r.components.filter(c => ['option', 'item'].includes(c.kind)).map(c => c.id).reverse();
    const view = learnerRevision(r, order);
    assert.deepEqual(view.components.map(c => c.id), order);
    const forbidden = ['correct', 'expected', 'gradingKey', 'explanation', 'feedback', 'wrongFeedback', 'optionFeedback', 'correctOrder', 'answer', 'payload', 'provenance'];
    const visit = obj => { for (const [key, value] of Object.entries(obj)) { assert.ok(!forbidden.includes(key), key); if (value && typeof value === 'object') visit(value); } };
    visit(view);
    assert.equal(gradeRevision(r, r.gradingKey.expected).correct, true);
  }
});
test('grading: wrong answers score zero without returning grading truth', () => {
  const wrong = mcqRevision.components.find(c => c.id !== mcqRevision.gradingKey.expected[0].valueId).id;
  assert.deepEqual(gradeRevision(mcqRevision, [{ componentId: wrong, valueId: wrong }]), { correct: false, score: 0, evidencePrecision: 'direct' });
});
test('grading: reject displayed indices, forged correctness and foreign components', () => {
  for (const selected of [[{ componentId: 1, valueId: 1 }], [{ componentId: 'other', valueId: 'other' }], [{ ...mcqRevision.gradingKey.expected[0], correct: true }], []]) assert.throws(() => gradeRevision(mcqRevision, selected));
  const other = compileRevision({ ...mcq, id: 'm999' }, 'mcq');
  assert.throws(() => gradeRevision(other, mcqRevision.gradingKey.expected));
});
test('grading: corrupt protected revision/key or relabelled PBQ fails integrity check', () => {
  for (const change of [r => r.semantic.display.q = 'corrupt', r => r.gradingKey.expected[0].valueId = 'corrupt', r => r.questionType = 'pbq']) {
    const r = copy(mcqRevision); change(r); assert.throws(() => gradeRevision(r, mcqRevision.gradingKey.expected), /integrity/);
  }
});
test('grading: ordering requires every unique item in a valid position', () => {
  const r = compileRevision(ordering, 'pbq'), answer = copy(r.gradingKey.expected);
  answer[0].valueId = answer[1].valueId;
  assert.throws(() => gradeRevision(r, answer), /Invalid ordering/);
  assert.throws(() => gradeRevision(r, r.gradingKey.expected.slice(1)), /Invalid ordering/);
  const swapped = copy(r.gradingKey.expected);
  [swapped[0].valueId, swapped[1].valueId] = [swapped[1].valueId, swapped[0].valueId];
  assert.deepEqual(gradeRevision(r, swapped), { correct: false, score: 0, evidencePrecision: 'coarse' });
});

const ownerId = 'synthetic-owner-a', time = minute => new Date(Date.UTC(2026, 9, 1, 12, minute)).toISOString();
const session = (index, start, end) => ({ ownerId, sessionId: `session-${index}`, setIndex: index, startedAt: time(start), closedAt: end === null ? null : time(end) });
const event = (index, occurred, received, id = `event-${index}`) => ({ ownerId, evidenceId: id, sessionId: `session-${index}`, setIndex: index, occurredAt: time(occurred), receivedAt: time(received) });
const history = { ownerId, sessions: [session(1, 0, 10), session(2, 20, 30)], evidence: [event(1, 5, 6), event(2, 25, 26)], now: time(60) };
test('chronology: two devices with ordered sessions produce deterministic preflight', () => {
  const a = assessReplayChronology(history), b = assessReplayChronology({ ...history, sessions: [...history.sessions].reverse(), evidence: [...history.evidence].reverse() });
  assert.deepEqual(a, b); assert.equal(a.status, 'ready_for_replay'); assert.equal(a.promotionAllowed, false);
});
test('chronology: offline delayed and out-of-order receipt do not manufacture a conflict', () => {
  const result = assessReplayChronology({ ...history, evidence: [event(2, 25, 26), event(1, 5, 45)] });
  assert.equal(result.status, 'ready_for_replay');
});
test('chronology: overlapping devices and resumed earlier sessions quarantine', () => {
  const result = assessReplayChronology({ ...history, sessions: [session(1, 0, 40), session(2, 20, 30)], evidence: [...history.evidence, event(1, 35, 36, 'resumed-answer')] });
  assert.ok(result.reasonCodes.includes('overlapping_sessions') && result.reasonCodes.includes('occurrence_set_order_conflict'));
  assert.equal(result.status, 'quarantined'); assert.equal(result.promotionAllowed, false);
});
test('chronology: simultaneous sessions and tied occurrence times quarantine', () => {
  const result = assessReplayChronology({ ...history, sessions: [session(1, 0, 10), session(2, 0, 10)], evidence: [event(1, 5, 6), event(2, 5, 6)] });
  assert.ok(result.reasonCodes.includes('trusted_set_order_conflict') && result.reasonCodes.includes('ambiguous_simultaneous_evidence'));
});
test('chronology: clock skew and future evidence quarantine without retiming', () => {
  const input = { ...history, evidence: [event(1, 5, 6), event(2, 40, 26)] }, before = copy(input);
  assert.ok(assessReplayChronology(input).reasonCodes.includes('evidence_clock_conflict'));
  assert.deepEqual(input, before);
});
test('chronology: late correction preserves occurrence order and changes input digest', () => {
  const corrected = { ...history, evidence: [...history.evidence, { ...event(1, 5, 50, 'correction-1'), supersedesEvidenceId: 'event-1' }] };
  const result = assessReplayChronology(corrected);
  assert.equal(result.status, 'ready_for_replay'); assert.notEqual(result.inputSha256, assessReplayChronology(history).inputSha256);
});
test('chronology: interrupted and resumed single session remains replayable', () => {
  assert.equal(assessReplayChronology({ ...history, sessions: [session(1, 0, null)], evidence: [event(1, 5, 6), event(1, 35, 36, 'resume')] }).status, 'ready_for_replay');
});
test('chronology: unclosed earlier session quarantines subsequent sessions', () => {
  assert.equal(assessReplayChronology({ ...history, sessions: [session(1, 0, null), history.sessions[1]] }).status, 'quarantined');
});
test('chronology: cross-owner rows, forged set indices and duplicate sessions fail', () => {
  assert.throws(() => assessReplayChronology({ ...history, evidence: [{ ...history.evidence[0], ownerId: 'synthetic-owner-b' }] }), /Unowned/);
  assert.throws(() => assessReplayChronology({ ...history, sessions: [{ ...history.sessions[0], ownerId: 'synthetic-owner-b' }] }), /Unowned/);
  assert.throws(() => assessReplayChronology({ ...history, evidence: [{ ...history.evidence[0], setIndex: 2 }] }), /outside/);
  assert.throws(() => assessReplayChronology({ ...history, sessions: [history.sessions[0], history.sessions[0]] }), /Invalid trusted/);
});

const enabled = { ADAPTIVE_SHADOW_WRITES_ENABLED: 'true', ADAPTIVE_SHADOW_WRITES_KILL_SWITCH: 'false', ADAPTIVE_RUNTIME_ENVIRONMENT: 'disposable_local', NODE_ENV: 'test' };
test('shadow: missing, malformed, partial and production configuration all deny writes', () => {
  for (const env of [{}, { ADAPTIVE_SHADOW_WRITES_ENABLED: 'true' }, { ...enabled, NODE_ENV: 'production' }, { ...enabled, VERCEL_ENV: 'preview' }, { ...enabled, ADAPTIVE_SHADOW_WRITES_ENABLED: true }, { ...enabled, ADAPTIVE_SHADOW_WRITES_KILL_SWITCH: undefined }, { ...enabled, ADAPTIVE_RUNTIME_ENVIRONMENT: 'production' }]) assert.equal(shadowWritesAllowed(env), false);
});
test('shadow: disabled runner performs no writes and ignores browser input', async () => {
  let writes = 0;
  const run = createShadowRunner({ readEnvironment: () => ({}), write: async () => writes++ });
  assert.deepEqual(await run(enabled), { status: 'disabled' }); assert.equal(writes, 0);
});
test('shadow: kill switch is reread before each operation', async () => {
  let writes = 0; const env = { ...enabled };
  const run = createShadowRunner({ readEnvironment: () => env, write: async () => writes++ });
  assert.deepEqual(await run(), { status: 'written' });
  env.ADAPTIVE_SHADOW_WRITES_KILL_SWITCH = 'true';
  assert.deepEqual(await run(), { status: 'disabled' }); assert.equal(writes, 1);
});
test('shadow: failures and failing telemetry do not escape to legacy caller', async () => {
  const logs = [], secret = 'sensitive-answer learner@example.invalid';
  const run = createShadowRunner({ readEnvironment: () => enabled, write: async () => { throw new Error(secret); }, log: record => logs.push(record) });
  const result = await run(); assert.equal(result.status, 'failed');
  assert.equal(logs.length, 1); assert.ok(!JSON.stringify(logs).includes(secret));
  assert.deepEqual(Object.keys(logs[0]).sort(), ['code', 'incidentId']);
  assert.equal((await createShadowRunner({ readEnvironment: () => { throw new Error(secret); }, write: async () => {}, log: () => { throw new Error(secret); } })()).status, 'failed');
});
test('boundary: no frontend or production API imports the independent kernels', () => {
  const walk = path => readdirSync(path, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(`${path}/${entry.name}`) : [`${path}/${entry.name}`]);
  for (const file of [...walk('src'), ...walk('api')].filter(f => /\.(?:js|jsx|mjs|ts)$/.test(f))) assert.ok(!readFileSync(file, 'utf8').includes('server/adaptive'), file);
});
