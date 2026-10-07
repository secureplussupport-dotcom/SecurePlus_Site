# Pilot batch 1 — owner scenario-family decision

Date: 7 October 2026, Asia/Singapore. **Fourteen family-independence judgments approved; mtd.01 same-family classification acknowledged.** Content was approved separately. Concept tags, difficulty/skills, objective scope and integration remain pending. Phase 2B-5 remains NOT READY.

## Authenticated decision source

- Reviewer: product owner, identified through the human message returned by Codex's authenticated chat reader; recorded locally by the implementation agent.
- Source chat: **“Vet Security+ SY0-701 questions”**, ID `01a0ec5b-7f84-71f1-920b-7b0cd42850d2`, host `local`.
- Source turn: `01a113bf-0e6d-7fc3-a26b-7e2b570b79d1`; human message `01a113bf-0f6f-7d53-b8d1-36aa0b559a7f`.
- Turn started: 7 October 2026 at 08:24:10 Singapore time (`2026-10-07T00:24:10Z`); no separate message timestamp is exposed.
- Exact owner reply:

> all pass

The reply follows the complete fourteen-item family list presented in source turn `01a113b3-0559-7ae3-8314-4d3587e8268e`, assistant final message `msg_0109beafc9f9df66016ac58e4a12c087d08e93fc53bdcf68a0`. That list stated the same-family mtd.01 rule and called out rpo.03 versus m088 for scrutiny. Both exact hashes below were present. The natural-language reply authorizes these listed family decisions, without requiring fourteen copied checkbox lines. It is not a blanket approval of other metadata or phases.

## Exact package binding

- [Draft batch](phase-2b5-pilot-batch-1.json): SHA-256 `91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda`.
- [Mapping package](../evidence/phase-2b5/mapping-package.json): SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`.
- Repository state verified before recording: `4d5e844be02a5f7be92910039a75f87600edfc9a`.
- [Earlier content-only decision](phase-2b5-pilot-batch-1-content-decision.md) remains a separate record.

Approval is bound to the exact content and family proposals in this batch and the existing-family comparison at this package. Changed content, family definitions or comparison revisions require deliberate re-review/rebinding under the applicable authority; this record cannot silently approve new bytes.

## Approved family decisions

Each row records owner approval of its submitted family-independence judgment within the proposed concept group, relative to the existing direct families and other listed new families. The group is comparison context, not approval of the primary/secondary concept assignment. Different wording, IDs or numbers alone do not establish independence.

| Decision ID | Exact draft ID | Exact approved family label |
| --- | --- | --- |
| `F-rto.01` | `draft.pilot1.rto.01` | `recovery-exercise-time-versus-data` |
| `F-rto.02` | `draft.pilot1.rto.02` | `serial-recovery-dependency-budget` |
| `F-rto.03` | `draft.pilot1.rto.03` | `availability-contract-versus-outage-target` |
| `F-rpo.01` | `draft.pilot1.rpo.01` | `recoverable-point-timeline` |
| `F-rpo.02` | `draft.pilot1.rpo.02` | `asynchronous-replication-durability-gap` |
| `F-rpo.03` | `draft.pilot1.rpo.03` | `corruption-clean-recovery-point` |
| `F-mtd.02` | `draft.pilot1.mtd.02` | `manual-workaround-changes-business-tolerance` |
| `F-mtd.03` | `draft.pilot1.mtd.03` | `technical-recovery-plus-business-reprocessing` |
| `F-mttr.01` | `draft.pilot1.mttr.01` | `observed-repair-duration-average` |
| `F-mttr.02` | `draft.pilot1.mttr.02` | `mean-versus-incident-tail` |
| `F-mttr.03` | `draft.pilot1.mttr.03` | `repair-measurement-boundary-change` |
| `F-bia.01` | `draft.pilot1.bia.01` | `business-impact-input-elicitation` |
| `F-bia.02` | `draft.pilot1.bia.02` | `shared-dependency-recovery-priority` |
| `F-bia.03` | `draft.pilot1.bia.03` | `changed-business-service-impact-scope` |

**Same-family rule:** `draft.pilot1.mtd.01` remains grouped with existing `m196` as `outer-business-interruption-limit`. The owner acknowledged this conservative classification. It contributes **zero new-family/novelty credit**; no fifteenth independent family is recorded.

**rpo.03 caveat retained:** m088 chooses a versioned-backup interval under assumptions of successful backups and tested restoration. rpo.03 instead identifies the latest usable clean point after delayed corruption when later copies and reconstruction paths are unusable. The owner accepted the reasoning distinction after it was explicitly flagged. Both involve recoverability; this editorial decision does not demonstrate psychometric independence, learner transfer or a clean-source guarantee. Preserve this limitation during later mapping and calibration rather than presenting the family labels as experimental proof.

## Existing comparison revisions rechecked

The five existing direct MCQs were re-read from the effective local bank and matched to their committed pilot signatures/families. Their historical concept roles remain separate from approval of new draft metadata.

| Existing ID | Exact effective local signature | Existing family |
| --- | --- | --- |
| m032 | `sha256:072ce4c7b9f8e0f1f70dbea7320cebfb13d18d482093240eb98485850478e200` | restoration-target-identification |
| m635 | `sha256:d2f6ffed09aa5b1fd7a933da2e5e531906923f96ef00c90b910b184b0cc25233` | restoration-target-identification |
| m088 | `sha256:d828be6f37d110e5cf80620d9c7aa4b8129dbc28cbf1e221233f19baadf01158` | versioned-backup-interval |
| m196 | `sha256:064871a82f7228185d753db57a4ff070d965ea05ffbf8499a65dbad23303a600` | outer-business-interruption-limit |
| m086 | `sha256:314994d739ecbe82485e02f29dda4c628773b1ff363b93913182892515e52872` | critical-function-impact-document |

No private question payload was retrieved or compared. The earlier effective-local-bank and lexical checks do not establish independence against unavailable private material.

## Subsequent instruction for future work

The same owner subsequently wrote in source turn `01a113bf-b154-7c83-96b0-1023ff85e229`, human message `01a113bf-b3d5-7e12-bb2a-e0c3c2ddc701`, started 7 October 2026 at 08:24:52 Singapore time (`2026-10-07T00:24:52Z`):

> you dont need my approval for the next questions or family tags anymore. just execute.

This standing authorization permits prospective local question drafting, content-quality review, concept/family proposals and family classification without asking the owner to approve each future question or family tag. Future batches must retain exact source hashes, factual/syllabus checks, distractor review, semantic near-duplicate assessment and an independent adversarial family comparison. Uncertain questions or mappings must be revised or rejected. Future agent judgments must be attributed as agent-reviewed under delegated authority, not falsely recorded as exact content personally reviewed by the owner. This later instruction is distinct from the fourteen exact human family decisions above. It does not retrospectively approve this batch's primary/secondary tags, difficulty/skills, S-COMMON/S-MTD scope or canonical identities, and contains no authorization for publication or live actions.

## Remaining decisions and unchanged runtime boundary

Primary/secondary concept assignments, proposed difficulty/cognitive skills, MCQ/domain/objective/chapter/topic scope (S-COMMON), MTD supporting context (S-MTD), canonical identities and wider taxonomy remain undecided. See the [remaining metadata choices](phase-2b5-pilot-batch-1-review.md).

Draft JSON, its original approval flags/zero weights, active bank, mapping package and runtime remain unchanged. The original audit validates that immutable proposal snapshot; its zero integrated human-approved-family count does not erase this separate, subsequent decision. No revision publication, adaptive mapping adoption, deployment, migration, activation, cohort or production write is authorized. The existing fifteen-minute monitor stays active. This record supersedes only the family-pending portions of the earlier content record and review materials.
