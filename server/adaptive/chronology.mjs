import { qualifiedTimestamp } from '../../src/lib/learningPersistenceContracts.js';
import { publicationSignature } from './publication.mjs';

// Pure preflight only. All rows must be loaded through an authenticated owned
// snapshot in the future transaction/worker. This does not publish projections.
export function assessReplayChronology({ ownerId, sessions, evidence, now }) {
  const clock = qualifiedTimestamp(now);
  if (typeof ownerId !== 'string' || !ownerId) throw new Error('Missing trusted owner');
  const reasons = new Set();
  const indexes = new Set(), ids = new Set();
  const timeline = sessions.map(session => {
    if (session.ownerId !== ownerId) throw new Error('Unowned session');
    if (!Number.isSafeInteger(session.setIndex) || session.setIndex < 1 || indexes.has(session.setIndex) || typeof session.sessionId !== 'string' || !session.sessionId || ids.has(session.sessionId)) throw new Error('Invalid trusted session order');
    indexes.add(session.setIndex); ids.add(session.sessionId);
    const start = qualifiedTimestamp(session.startedAt);
    const end = session.closedAt === null ? Infinity : qualifiedTimestamp(session.closedAt);
    if (start > clock || end < start || (end !== Infinity && end > clock)) reasons.add('session_clock_conflict');
    return { ...session, start, end };
  }).sort((a, b) => a.setIndex - b.setIndex);
  for (let i = 1; i < timeline.length; i++) {
    const previous = timeline[i - 1], next = timeline[i];
    if (previous.start >= next.start) reasons.add('trusted_set_order_conflict');
    if (previous.end > next.start) reasons.add('overlapping_sessions');
  }
  const byId = new Map(timeline.map(s => [s.sessionId, s]));
  const eventIds = new Set();
  const answers = evidence.map(event => {
    if (event.ownerId !== ownerId) throw new Error('Unowned evidence');
    const session = byId.get(event.sessionId);
    if (!session || session.setIndex !== event.setIndex) throw new Error('Evidence outside owned session');
    if (typeof event.evidenceId !== 'string' || !event.evidenceId || eventIds.has(event.evidenceId)) throw new Error('Invalid evidence identity');
    eventIds.add(event.evidenceId);
    const occurred = qualifiedTimestamp(event.occurredAt), received = qualifiedTimestamp(event.receivedAt);
    if (occurred < session.start || occurred > session.end || occurred > clock || received > clock || occurred > received + 300000) reasons.add('evidence_clock_conflict');
    return { ...event, occurred, received };
  }).sort((a, b) => a.occurred - b.occurred || a.setIndex - b.setIndex || (a.evidenceId < b.evidenceId ? -1 : a.evidenceId > b.evidenceId ? 1 : 0));
  for (let i = 1; i < answers.length; i++) {
    if (answers[i].setIndex < answers[i - 1].setIndex) reasons.add('occurrence_set_order_conflict');
    if (answers[i].occurred === answers[i - 1].occurred && answers[i].setIndex !== answers[i - 1].setIndex) reasons.add('ambiguous_simultaneous_evidence');
  }
  // The digest retains received/occurred metadata and corrections. Reordering
  // input rows does not change it. Never silently retime or delete evidence.
  const canonicalSessions = timeline.map(({ start, end, ...session }) => session);
  const canonicalEvidence = answers.map(({ occurred, received, ...event }) => event);
  return { policyVersion: 'chronology-quarantine-v1', status: reasons.size ? 'quarantined' : 'ready_for_replay',
    reasonCodes: [...reasons].sort(), inputSha256: publicationSignature({ ownerId, sessions: canonicalSessions, evidence: canonicalEvidence }),
    // Caller must still pin versions, replay, and atomically compare generation.
    promotionAllowed: false };
}
