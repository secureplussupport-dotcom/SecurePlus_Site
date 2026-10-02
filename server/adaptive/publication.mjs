// Server-only pure publication kernel. Not wired to an endpoint or database.
import { createHash } from 'node:crypto';
import { canonicalPayload } from '../../src/lib/learningPersistenceContracts.js';
import { mergePublishedSnapshot, isCapturedOverride, preferReviewedPbq, PUBLISHED_CONTENT_SNAPSHOT } from '../../src/data/sy0701PublishedSnapshot.js';
import { isMcqEditoriallyActive, applyMcqEditorialReview } from '../../src/data/sy0701EditorialReview.js';
import { isPbqEditoriallyActive, applyPbqEditorialReview } from '../../src/data/sy0701PbqReview.js';

// Source assets and pure enhancement/normalization functions are trusted inputs,
// never request JSON. Packaging the inline App.jsx assets for a deployed server
// remains blocked with the database runtime; audit helpers are not server loaders.
export const publicationSignature = value => createHash('sha256').update(canonicalPayload(JSON.parse(JSON.stringify(value)))).digest('hex');

export function resolvePublication({ authored, imported, excluded, overrides = [], remotePbqRows = [], remoteEnabled = true }, pipeline) {
  for (const name of ['enhanceMcq', 'ensureMcqFeedback', 'enhancePbq', 'normalizeRemotePbq']) {
    if (typeof pipeline?.[name] !== 'function') throw new Error(`Missing trusted publication function: ${name}`);
  }
  const provenance = {};
  const note = (kind, id, stage, source) => {
    const key = `${kind}:${id}`;
    (provenance[key] ??= []).push({ stage, sourceSha256: publicationSignature(source) });
  };
  const merge = kind => {
    const active = kind === 'mcq' ? isMcqEditoriallyActive : isPbqEditoriallyActive;
    const hidden = new Set(excluded[kind]);
    const input = [...authored[kind], ...imported[kind]];
    input.forEach(q => note(kind, q.id, 'authored_or_imported', q));
    input.filter(q => hidden.has(q.id)).forEach(q => note(kind, q.id, 'low_quality_filtered', q));
    PUBLISHED_CONTENT_SNAPSHOT.filter(row => row.question_kind === kind).forEach(row => note(kind, row.question_id, 'captured_snapshot', row));
    const snapshot = mergePublishedSnapshot(input.filter(q => !hidden.has(q.id)), kind);
    snapshot.filter(q => !active(q)).forEach(q => note(kind, q.id, 'editorial_retirement', q));
    const base = snapshot.filter(active).map(q => kind === 'mcq'
      ? pipeline.ensureMcqFeedback(applyMcqEditorialReview(pipeline.enhanceMcq(q)))
      : pipeline.enhancePbq(applyPbqEditorialReview(q)));
    const byId = new Map(base.map((q, index) => {
      note(kind, q.id, 'enhancement_and_review', q);
      return [q.id, { ...q, _baseOrder: index + 1 }];
    }));
    // Deliberately preserve application row order, including last-write wins.
    for (const row of overrides.filter(row => row.status === 'active' && row.question_kind === kind)) {
      const id = row.question_id;
      if (!id) continue;
      note(kind, id, 'active_override', row);
      if (row.action === 'disable') { byId.delete(id); continue; }
      if (!active({ id })) continue;
      const order = Number(row.sort_order);
      if (isCapturedOverride(row)) {
        const existing = byId.get(id);
        if (existing && Number.isFinite(order) && order > 0) byId.set(id, { ...existing, _adminOrder: order });
        continue;
      }
      const next = { ...(byId.get(id) || {}), ...(row.payload || {}), id };
      if (Number.isFinite(order) && order > 0) next._adminOrder = order;
      byId.set(id, kind === 'mcq' ? pipeline.ensureMcqFeedback(next) : next);
    }
    return [...byId.values()].sort((a, b) => {
      const ao = Number.isFinite(Number(a._adminOrder)) ? Number(a._adminOrder) : Number.MAX_SAFE_INTEGER;
      const bo = Number.isFinite(Number(b._adminOrder)) ? Number(b._adminOrder) : Number.MAX_SAFE_INTEGER;
      return ao - bo || (a._baseOrder || Number.MAX_SAFE_INTEGER) - (b._baseOrder || Number.MAX_SAFE_INTEGER) || String(a.id).localeCompare(String(b.id));
    });
  };
  const mcqs = merge('mcq');
  let pbqs = merge('pbq');
  if (remoteEnabled) {
    const remote = remotePbqRows.map(pipeline.normalizeRemotePbq).filter(q => q?.id && isPbqEditoriallyActive(q));
    remote.forEach(q => note('pbq', q.id, 'normalized_remote_pbq', q));
    const byId = new Map(remote.map(q => [q.id, q]));
    const localIds = new Set(pbqs.map(q => q.id));
    pbqs = [...pbqs.map(q => preferReviewedPbq(q, byId.get(q.id))), ...remote.filter(q => !localIds.has(q.id))].map(pipeline.enhancePbq);
  }
  for (const [kind, bank] of [['mcq', mcqs], ['pbq', pbqs]]) bank.forEach(q => note(kind, q.id, 'final_effective_content', q));
  // Contains grading truth. Only a revision compiler's explicit safe view may be
  // sent to learners. Historical revision retention belongs to durable storage.
  return { mcqs, pbqs, provenance };
}
