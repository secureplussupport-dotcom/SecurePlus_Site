# Archived MCQ-only adaptive algorithm — local release candidate

Superseded on 20 October 2026 by the owner-supplied three-deck specification. See [the replacement engine](mcq-three-deck-engine.md). The evidence below describes the retired prototype, not the current release path.

The local algorithm candidate is implemented and tested end to end. It is default OFF and has no live route, migration, credentials, enrollment or activation change. This release supersedes the earlier assumption that PBQ concept tagging or grammar work is an adaptive-learning prerequisite. PBQs remain standalone practice; their catalogue/editorial queue is not an adaptive release gate.

## Implemented behavior

- Adaptive mappings, normalized answers, retained exposure, trusted catalogue loading, session generation and ingestion accept MCQs only. PBQs cannot lower MCQ freshness through shared scenario labels, alter mastery or scheduling, advance practice-set spacing, or affect trusted projections. Known older/retired MCQ exposure remains conservative, including unmapped revisions.
- Actual selected options are graded through the existing protected revision compiler; client correctness is not accepted as grading authority. The shared server session selector is also used by the local candidate. It preserves composition limits, excludes retired revisions, reports shortages, and does not fabricate filler. Proven/mastered concepts are not permanently classified as weak merely because they once had a miss.
- Existing replay, weighted evidence, exact-repeat discounts, contradictory misses, sticky recovery, direct/supporting review, fresh transfer, delayed proof and spaced retention are reused. No mastery thresholds or weights were relaxed. Repeated answers and review completion alone cannot manufacture proof or mastery.
- Trusted execution still requires approved, source-pinned version payloads, immutable owned session plans and a permitted control state. Production hard-deny, kill-switch and default-OFF behavior remain. The algorithm contract is now identified as `secureplus-mcq-only-v1`; previously approved payloads cannot silently authorize changed implementation bytes.

## Exact scope and evidence

| Population | Count | Meaning |
|---|---:|---|
| Effective product MCQs | 395 | Existing published/effective local bank; unchanged |
| Source-bound MCQ mapping proposals | 5 | m032, m635, m088, m196, m086; still pending human approval |
| Effective MCQs without a primary mapping | 390 | Outside the current bounded candidate; not silently inferred from keywords |
| Existing continuity concepts | 5 | RTO, RPO, MTD, MTTR, BIA |
| Additional synthetic test questions | 26 | Algorithm fixtures only; never published, approved or counted in the 395 |
| Synthetic-mode exercise set | 31 | Five real sources plus 26 fictional test fixtures |
| PBQs in adaptive scope | 0 | No tagging, mastery, scheduling or grammar prerequisite |

Source-bound rehearsal: initial **5/10** requested questions, after-miss **4/10**, fresh RTO transfer **unavailable**. RTO has two questions in one family; RPO, MTD and BIA each have one question; MTTR has none. These are genuine coverage shortages. The five mapped MCQs are pending editorial/canonical approval, not a broad pilot ready for learners.

Synthetic mode returns ten distinct MCQs before and after a miss. It exercises all five concepts through varied repair, separate delayed proof, spaced mastery and isolated trusted-worker replay. A sticky path includes longer retention, relapse and explicit remaining-family exhaustion. Synthetic family labels are test assumptions, not evidence of independent assessment families, calibrated difficulty, teaching quality or learning efficacy. Generic synthetic wrong-option feedback is unsuitable for publishing. No product question was authored or published by this change.

Current gates pass: **25 focused MCQ tests; 29 content-mapping tests plus deterministic package reproduction; 40 runtime tests; 15 boundary tests; 14 operational tests; 20 persistence contract scenarios; existing pilot replay checks; production build**. The build retains its existing large-chunk warning. Native MCQ/PBQ grading outside the adaptive algorithm is preserved.

Real PostgreSQL/HTTP integration was not rerun: the local Docker daemon is unavailable. Earlier operational/database evidence is historical and is not relabeled as a current pass. Live environment, schema, control row, target commit, purpose credentials, scheduler and alert delivery were not inspected or changed.

## Run the delivered candidate

```sh
node scripts/run-mcq-release-candidate.mjs
# DISABLED
node scripts/run-mcq-release-candidate.mjs --enabled
# Five source-bound MCQs, honest shortage, no synthetic content
node scripts/run-mcq-release-candidate.mjs --enabled --synthetic
# Algorithm exercise only; synthetic fixtures never count as product coverage
node --test scripts/audit-mcq-only-release.mjs
```

Both enabled modes are local-only and refuse production/Vercel execution. They use files and memory, with no database, network, publication or enrollment capability. The source signatures and deterministic rehearsal receipt are emitted by the runner. File SHA-256 values and the regenerated mapping-package SHA are recorded in `docs/evidence/mcq-only-release-checksums.json`.

The broad catalogue still has **491 unresolved question mappings**, including nonadaptive items, after removing the two PBQ algorithm mappings. Its explicit `adaptiveScope` reports **395 MCQs / five mapped proposals / 390 unmapped / zero PBQs**. This separates editorial inventory from algorithm eligibility. Earlier Phase 2B-5 PBQ packets and release checksums remain historical source-bound records; their old runtime-source pins are superseded by this implementation change, not rewritten to pretend current verification. Existing 181 content holds remain unchanged; no canonical, teaching, family, trusted or publication credit is awarded here.

## Production go/no-go

**Learner activation / live shadow: NO-GO.** A complete local algorithm does not supply approved live content or deployed infrastructure. The current shared boundary deliberately rejects production execution.

Before a bounded live pilot, establish:

1. A reviewed MCQ-only production adapter and actual route/session integration, preserving server grading, ownership, production-control and rollback guarantees. This candidate does not add a live route.
2. Exact live-target schema, purpose-role/TLS/pool budgets, central OFF/kill state, version payload approvals, scheduler and operational monitoring checks. Re-run the changed trusted path against the disposable database before a live decision.
3. Sufficient reviewed real MCQ variants and direct teaching links for the chosen bounded scope, with approved concept/family definitions. The current five-item set cannot honestly deliver the ten-question default or fresh RTO repair. Synthetic cases do not fill that gap. Mapping the other 390 questions is required for a broad rollout, not automatically for every bounded pilot.
4. A separately approved deployment/activation decision tied to an exact candidate commit and acceptance/rollback criteria. No credential, cohort or migration action is authorized by this document.

**Control-OFF code-only deployment: candidate for review, not a verified live GO.** The smallest safe next release step is to verify the exact target and release commit, prepare an inert deployment with central control OFF/kill ON and no new route, migration or credentials, prove the deployed marker and unchanged learner behavior, then obtain the owner's deployment decision. Such a release brings code to the host; it does not launch adaptation or improve learner outcomes by itself. No deployment occurs in this task; commits use `[skip deploy]`.

Narrow master-plan correction proposed for the PBQ paragraph in `docs/secureplus-rebrand-master-plan.md` (currently line 409): “Adaptive evidence, mastery and scheduling apply only to MCQs. PBQs remain separate practice and require no adaptive concept tags or step-level mastery mapping.” The owner correction controls this candidate; production behavior and the approved plan file were not silently rewritten.
