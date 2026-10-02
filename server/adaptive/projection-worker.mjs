import { canonicalPayload } from '../../src/lib/learningPersistenceContracts.js';
import { assessReplayChronology } from './chronology.mjs';
import { createHash } from 'node:crypto';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const hash = value => createHash('sha256').update(canonicalPayload(value)).digest('hex');
const requireThat = (ok, message) => { if (!ok) throw new Error(message); };

// The projector is injected and version-pinned by the caller. It receives a
// complete immutable snapshot and returns cache rows only; it cannot write.
export async function rebuildAdaptiveOwner(sql, ownerId, { now = new Date().toISOString(), project } = {}) {
  requireThat(typeof ownerId === 'string' && UUID.test(ownerId), 'Invalid adaptive owner');
  requireThat(typeof project === 'function', 'Missing version-pinned projection adapter');
  return sql.begin(async tx => {
    await tx`
      insert into adaptive_private.owner_state(owner_id) values (${ownerId})
      on conflict(owner_id) do nothing
    `;
    const [state] = await tx`
      select * from adaptive_private.owner_state where owner_id=${ownerId} for update
    `;
    const sessions = await tx`
      select s.session_id,s.owner_id,s.set_index,s.started_at,
        max(e.occurred_at) filter(where e.status in ('completed','abandoned')) as closed_at,
        s.mapping_version,s.algorithm_version,s.configuration_version
      from public.adaptive_sessions s
      left join public.adaptive_session_events e on e.owner_id=s.owner_id and e.session_id=s.session_id
      where s.owner_id=${ownerId}
      group by s.session_id
      order by s.set_index
    `;
    const evidence = await tx`
      select e.*,s.set_index,q.scenario_family,m.model_revision_key
      from public.adaptive_answer_evidence e
      left join public.adaptive_sessions s on s.owner_id=e.owner_id and s.session_id=e.session_id
      left join public.adaptive_question_revisions q on q.revision_id=e.revision_id
      left join public.adaptive_question_mappings m on m.mapping_version=e.mapping_version and m.revision_id=e.revision_id and m.concept_role='primary'
      where e.owner_id=${ownerId}
      order by e.occurred_at,e.receipt_index
    `;
    const chronology = assessReplayChronology({
      ownerId,
      now,
      sessions: sessions.map(row => ({ ownerId, sessionId: row.session_id, setIndex: Number(row.set_index), startedAt: row.started_at.toISOString(), closedAt: row.closed_at?.toISOString() ?? null })),
      evidence: evidence.filter(row => row.session_id).map(row => ({ ownerId, evidenceId: row.evidence_id, sessionId: row.session_id, setIndex: Number(row.set_index), occurredAt: row.occurred_at.toISOString(), receivedAt: row.received_at.toISOString(), supersedesEvidenceId: row.supersedes_evidence_id })),
    });
    if (chronology.status === 'quarantined') {
      await tx`
        update adaptive_private.owner_state set replay_status='quarantined',quarantine_reasons=${chronology.reasonCodes},last_replay_at=clock_timestamp(),last_replay_sha256=${chronology.inputSha256}
        where owner_id=${ownerId}
      `;
      return { status: 'quarantined', reasonCodes: chronology.reasonCodes, inputSha256: chronology.inputSha256, promotionAllowed: false };
    }

    const complete = evidence.filter(row => row.provenance === 'complete');
    const boundary = state.complete_evidence_from ?? complete.reduce((minimum, row) => !minimum || row.occurred_at < minimum ? row.occurred_at : minimum, null);
    if (boundary && state.complete_evidence_from == null) await tx`update adaptive_private.owner_state set complete_evidence_from=${boundary} where owner_id=${ownerId}`;
    const snapshot = Object.freeze({ ownerId, now, generation: Number(state.evidence_generation), completeEvidenceFrom: boundary?.toISOString() ?? null, sessions, evidence });
    const projected = await project(snapshot);
    requireThat(Array.isArray(projected), 'Projection adapter must return rows');
    const inputSha256 = hash({ chronology: chronology.inputSha256, generation: snapshot.generation, projectionRows: projected });
    const watermark = evidence.reduce((maximum, row) => Math.max(maximum, Number(row.receipt_index ?? 0)), 0);
    for (const row of projected) {
      requireThat(row.ownerId === ownerId && row.inputGeneration === snapshot.generation, 'Projection adapter returned stale or foreign state');
      await tx`
        insert into public.adaptive_concept_projections(
          owner_id,concept_id,mapping_version,algorithm_version,configuration_version,state,evidence_level,
          effective_sample,distinct_questions,distinct_scenarios,complete_evidence_count,ever_sticky,lapse_count,
          unresolved_evidence_ids,last_answer_at,last_intervention_at,proven_at,mastered_at,next_due_task_id,
          input_generation,receipt_watermark,replay_from,input_sha256,projection_status
        ) values (
          ${ownerId},${row.conceptId},${row.mappingVersion},${row.algorithmVersion},${row.configurationVersion},${row.state},${row.evidenceLevel},
          ${row.effectiveSample},${row.distinctQuestions},${row.distinctScenarios},${row.completeEvidenceCount},${row.everSticky},${row.lapseCount},
          ${row.unresolvedEvidenceIds},${row.lastAnswerAt},${row.lastInterventionAt},${row.provenAt},${row.masteredAt},${row.nextDueTaskId},
          ${snapshot.generation},${watermark},${boundary},${inputSha256},'ready'
        )
        on conflict(owner_id,concept_id,mapping_version,algorithm_version,configuration_version) do update set
          state=excluded.state,evidence_level=excluded.evidence_level,effective_sample=excluded.effective_sample,
          distinct_questions=excluded.distinct_questions,distinct_scenarios=excluded.distinct_scenarios,
          complete_evidence_count=excluded.complete_evidence_count,ever_sticky=excluded.ever_sticky,lapse_count=excluded.lapse_count,
          unresolved_evidence_ids=excluded.unresolved_evidence_ids,last_answer_at=excluded.last_answer_at,
          last_intervention_at=excluded.last_intervention_at,proven_at=excluded.proven_at,mastered_at=excluded.mastered_at,
          next_due_task_id=excluded.next_due_task_id,input_generation=excluded.input_generation,
          receipt_watermark=excluded.receipt_watermark,replay_from=excluded.replay_from,input_sha256=excluded.input_sha256,
          projection_status='ready'
      `;
    }
    await tx`
      update adaptive_private.owner_state set replay_status='ready',quarantine_reasons='{}',last_replay_at=clock_timestamp(),last_replay_sha256=${inputSha256}
      where owner_id=${ownerId} and evidence_generation=${snapshot.generation}
    `;
    return { status: 'ready', projectionCount: projected.length, inputGeneration: snapshot.generation, inputSha256, promotionAllowed: false };
  });
}
