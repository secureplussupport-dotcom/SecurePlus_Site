import { createHash } from 'node:crypto';
import { canonicalPayload, validateStableSelections } from '../../src/lib/learningPersistenceContracts.js';

const requireThat = (ok, reason) => { if (!ok) throw new Error(reason); };
const hash = value => createHash('sha256').update(canonicalPayload(value)).digest('hex');
const clean = value => JSON.parse(JSON.stringify(value));
const byId = (a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
const uuidFromHash = hex => `${hex.slice(0, 8)}-${hex.slice(8, 12)}-8${hex.slice(13, 16)}-${((parseInt(hex[16], 16) & 3) | 8).toString(16)}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
const componentId = (questionId, kind, identity) => `${kind}:${hash([questionId, kind, identity]).slice(0, 40)}`;
const DISPLAY_FIELDS = ['q', 'ch', 'topic', 'difficulty', 'objective', 'title', 'type', 'cat', 'scenario', 'question', 'logData', 'currentConfig', 'codeBlock', 'codeLanguage', 'diagram', 'hint', 'syllabusDomain', 'emoji', 'beyondTextbook'];
const KNOWN_FIELDS = new Set([...DISPLAY_FIELDS, 'id', 'source', 'opts', 'choices', 'options', 'correct', 'wrongFeedback', 'optionFeedback', 'exp', 'explanation', 'answer', 'items', 'correctOrder', 'editorialReviewed', 'is_pro', 'remoteUpdatedAt', '_baseOrder', '_adminOrder', 'payload', 'legacySelectionType', 'acronyms', 'targets', 'targetLayout', 'correctMapping', 'blanks', 'selectionOptions']);

// Initial grammar covers the pilot: MCQ, whole-choice PBQ, and ordering PBQ.
// Unsupported parts/blanks fail closed until a separately tested grammar exists.
export function compileRevision(question, questionType, provenance = []) {
  requireThat(['mcq', 'pbq'].includes(questionType) && (questionType === 'mcq' ? /^m\d{3,6}$/ : /^p\d{3,6}$/).test(question.id), 'Invalid question identity');
  for (const key of Object.keys(question)) requireThat(KNOWN_FIELDS.has(key), `Unsupported question field: ${key}`);
  const ordering = questionType === 'pbq' && question.type === 'ORDERING';
  const options = questionType === 'mcq' ? question.opts : question.choices;
  requireThat(ordering || Array.isArray(options), 'Unsupported answer grammar');
  requireThat(ordering || question.items == null, 'Unsupported mixed answer grammar');
  for (const key of ['targets', 'targetLayout', 'correctMapping', 'blanks', 'selectionOptions']) requireThat(question[key] == null, 'Unsupported component grammar');
  const display = Object.fromEntries(DISPLAY_FIELDS.filter(key => question[key] !== undefined).map(key => [key, question[key]]));
  requireThat(Object.values(display).every(value => ['string', 'number', 'boolean'].includes(typeof value)), 'Invalid display field');
  let components, expected, answerMode;
  if (ordering) {
    requireThat(Array.isArray(question.items) && question.items.length >= 2 && question.items.length <= 100, 'Invalid ordering items');
    const itemIds = question.items.map(item => item.id);
    requireThat(itemIds.every(id => typeof id === 'string' && id.length > 0) && new Set(itemIds).size === itemIds.length, 'Duplicate or missing authored item ID');
    requireThat(Array.isArray(question.correctOrder) && question.correctOrder.length === itemIds.length && new Set(question.correctOrder).size === itemIds.length && question.correctOrder.every(id => itemIds.includes(id)), 'Invalid ordering key');
    components = question.items.map(item => {
      requireThat(typeof item.label === 'string' && item.label.length > 0, 'Missing item label');
      requireThat(Object.keys(item).every(k => ['id', 'label', 'explanation'].includes(k)), 'Unsupported item field');
      return { id: componentId(question.id, 'item', item.id), kind: 'item', authoredId: item.id, label: item.label, feedback: item.explanation ?? '' };
    });
    const positions = question.items.map((_, index) => ({ id: componentId(question.id, 'position', index + 1), kind: 'position', position: index + 1 }));
    expected = question.correctOrder.map((id, index) => ({ componentId: positions[index].id, valueId: componentId(question.id, 'item', id) }));
    components.push(...positions);
    answerMode = 'ordering';
  } else {
    requireThat(options.length >= 2 && options.length <= 100 && options.every(s => typeof s === 'string' && s.trim()), 'Invalid choices');
    requireThat(new Set(options).size === options.length, 'Ambiguous duplicate choice labels');
    requireThat(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < options.length, 'Invalid grading key');
    for (const field of ['wrongFeedback', 'optionFeedback']) {
      const feedback = question[field];
      requireThat(feedback == null || (typeof feedback === 'object' && !Array.isArray(feedback) && Object.entries(feedback).every(([index, text]) => /^(0|[1-9]\d*)$/.test(index) && Number(index) < options.length && typeof text === 'string')), 'Invalid choice feedback');
    }
    if (questionType === 'pbq' && question.options) requireThat(canonicalPayload(question.options) === canonicalPayload(options), 'Divergent choice aliases');
    components = options.map((label, index) => ({
      id: componentId(question.id, 'option', label), kind: 'option', label,
      wrongFeedback: question.wrongFeedback?.[index] ?? '', optionFeedback: question.optionFeedback?.[index] ?? '',
    }));
    const correctId = components[question.correct].id;
    expected = [{ componentId: correctId, valueId: correctId }];
    answerMode = 'single_choice';
  }
  const sorted = clean(components).sort(byId);
  const gradingKey = { answerMode, expected: expected.sort((a, b) => a.componentId < b.componentId ? -1 : 1) };
  const semantic = clean({ grammarVersion: 'pilot-revision-v1', questionId: question.id, questionType, display, components: sorted, gradingKey,
    explanation: { exp: question.exp ?? null, explanation: question.explanation ?? null }, answer: question.answer ?? '', acronyms: question.acronyms ?? [], source: question.source ?? null });
  const contentSha256 = hash(semantic);
  return Object.freeze({ revisionId: uuidFromHash(contentSha256), contentSha256, questionId: question.id, questionType,
    evidencePrecision: questionType === 'pbq' ? 'coarse' : 'direct', components: sorted, semantic, gradingKey,
    provenance: clean(provenance) });
}

export function learnerRevision(revision, displayOrder = null) {
  const selectable = revision.components.filter(c => ['option', 'item'].includes(c.kind));
  const order = displayOrder ?? selectable.map(c => c.id);
  requireThat(Array.isArray(order) && order.length === selectable.length && new Set(order).size === order.length && order.every(id => selectable.some(c => c.id === id)), 'Invalid display permutation');
  // Explicit allowlist: no explanation, answer, feedback, expected selection,
  // source payload, provenance or correctOrder can escape via object spreading.
  return { revisionId: revision.revisionId, questionId: revision.questionId, questionType: revision.questionType,
    ...clean(revision.semantic.display), answerMode: revision.gradingKey.answerMode,
    components: order.map(id => { const c = selectable.find(c => c.id === id); return { id, kind: c.kind, label: c.label }; }),
    positions: revision.components.filter(c => c.kind === 'position').sort((a, b) => a.position - b.position).map(c => ({ id: c.id, position: c.position })) };
}

// Pure grading kernel. Caller must resolve the authenticated owner's manifest
// and protected immutable revision inside the future ingestion transaction.
export function gradeRevision(revision, selectedComponents) {
  requireThat(hash(revision.semantic) === revision.contentSha256 && uuidFromHash(revision.contentSha256) === revision.revisionId &&
    revision.questionId === revision.semantic.questionId && revision.questionType === revision.semantic.questionType &&
    canonicalPayload(revision.components) === canonicalPayload(revision.semantic.components) && canonicalPayload(revision.gradingKey) === canonicalPayload(revision.semantic.gradingKey), 'Revision integrity mismatch');
  const selected = validateStableSelections(selectedComponents, revision);
  if (revision.gradingKey.answerMode === 'single_choice') {
    requireThat(selected.length === 1 && selected[0].componentId === selected[0].valueId && revision.components.some(c => c.id === selected[0].valueId && c.kind === 'option'), 'Invalid single choice');
  } else {
    const positions = revision.components.filter(c => c.kind === 'position');
    requireThat(selected.length === positions.length && new Set(selected.map(s => s.valueId)).size === selected.length && selected.every(s => positions.some(c => c.id === s.componentId) && revision.components.some(c => c.id === s.valueId && c.kind === 'item')), 'Invalid ordering selection');
  }
  const correct = canonicalPayload(selected) === canonicalPayload(revision.gradingKey.expected);
  return { correct, score: correct ? 1 : 0, evidencePrecision: revision.questionType === 'pbq' ? 'coarse' : 'direct' };
}
