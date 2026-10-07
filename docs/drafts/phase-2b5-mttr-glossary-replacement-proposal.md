# MTTR glossary — one replacement proposal

7 October 2026. Baseline `924928da777ee9c4ed6e2cc23ff0debd5999b81f`. **LOCAL DRAFT ONLY; not approved, published or integrated. Phase 2B-5 remains NOT READY.**

## Candidate text

For the existing `MTTR` glossary key, propose exactly this entry:

```json
{
  "fullName": "Mean Time to Repair / Recover",
  "definition": "Average elapsed time from service failure to verified restoration of acceptable service, calculated across completed repairs using the same start and end points."
}
```

This is one candidate, not an active edit or a new “respond” glossary entry. Its proposed unit scope is **objective 5.2, repair/recover definition support**, linked to the existing proposed `recovery.mttr` identity. Scope/link decisions remain pending; reading a tooltip earns zero mastery evidence.

## Exact current comparison

| Unit | Inspected wording | Exact semantic revision |
| --- | --- | --- |
| Current `glossary:mttr` parent, `{term, definition}` | Name: Mean Time To Repair / Mean Time To Respond. Definition: Average time to restore failed equipment or respond to an active incident. | `sha256:09b9dd6eebf37a22c75b8c89f22c7dacf5a61fe36252cd6835d09f27b5785220` |
| Current definition object only | Same name/definition object, excluding the term wrapper | `sha256:769ae53401583ed797b74089d262347de92f3d3ffdceade00eece4416de53594` |
| MTTR acronym card | Mean Time to Repair / Recover; average time needed to repair a failure or restore service | `sha256:e0df2c38a13edc4d27a6835abc6e470a8c74880a68577a320d99b33a516ccbd7` |
| Complete resilience recovery-metrics table, section index 1 | MTTR: average time to repair or restore; distinct from a per-incident deadline | `sha256:b0cee02c7ac294cb5e4d5912bb3acb90f2c147f4055f4fbe04d7dbfcd454ac3b` |

The current full name and definition mix restoration with responding to an incident. Those endpoints can differ. The candidate retains the card/table's repair/recover meaning and selects a clear **service failure → verified acceptable service** clock. Starting a response, technician work or server boot alone does not end that proposed clock. It includes elapsed waiting/repair/validation until the stated endpoint; “acceptable” service must be defined for the scenario or service rather than invented by the glossary.

Only completed repairs enter this proposed average; an ongoing incident's final duration is unknown and its elapsed duration should be disclosed separately when interpreting a report. A short completed-repair mean does not prove every incident was brief. This is a consistent learning convention, **not a claim that all organizations use identical MTTR boundaries**, and not a recovery target or guarantee. Scenario questions must state their own measurement boundary and use comparable observations.

[CompTIA's official SY0-701 objectives, v5.0](https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf), checked 7 October 2026, call MTTR “mean time to repair” under objective 5.2 on PDF page 14, and “Mean Time to Recover” in the acronym list on PDF page 19. The repair/recover expansion in the candidate reflects those meanings. The explicit clock and completed-repair cohort are our proposed instructional convention; the syllabus does not prescribe that formula boundary. No incident-response objective is inferred from the old word “respond.”

## What remains undecided

The owner would still need to approve or revise the **exact candidate name/definition, explicit service-recovery clock convention, proposed 5.2 unit scope and support-only link** at this artifact's SHA-256, bound to the current glossary parent revision above and unchanged package hashes below. These are distinct decisions; accepting wording alone does not approve scope/link or publication. Any revised candidate needs a new hash and deliberate review binding. The prospective question/family delegation does not imply current teaching approval; silence, agent text and passing checks do not supply it. No question or family approval is resubmitted here, and no approval is requested in this implementation chat.

An editorial decision would authorize only a separate local decision record. Active glossary replacement, rebinding the revised unit, mapping adoption and delivery need separately authorized implementation and checks. Until then, T06 stays withheld with scope null; this document does not unlock it or revise any pending checkbox.

| Unchanged comparison artifact | SHA-256 |
| --- | --- |
| Active mapping package | `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97` |
| Original unit/link proposals | `de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c` |
| Current unit-scope proposals, with T06 null | `18d9b7fc2114672c02d14eeeff23db5a36a2f5528b36c005262be50fdf9f09fb` |
| Original 27-choice owner packet, still blank | `01f96e9c4edff2ef61d25c296fb96c585ad1a00db0709f47c0d261b7fbb5d953` |

## Consistency check and delivery limit

Run `node scripts/audit-mttr-glossary-proposal.mjs`. It recomputes the current glossary/definition/card/table revisions, parses the single candidate, checks its exact clock/cohort wording and pending boundary, pins comparison artifacts and verifies all 25 active release files plus the source-level delivery guard. A drift or mixed respond-name fails; the script records no consent and performs no source or runtime write. Passed: this check, existing unit-scope and owner-packet audits, staged whitespace and Vercel `[skip deploy]` checks before push.

The glossary is conditional inline support: a matching term must be rendered and its tooltip opened. No browser delivery, learner exposure, tooltip layout/accessibility, live catalogue or private payload was inspected here. This candidate is learner-invisible and unwired. Wider metadata, taxonomy, compiler/private processing, coverage, calibration and rollout gates remain open. **NOT READY; no publication, deployment, migration, activation, shadow writes or cohorts.**
