# Pilot batch 1 — remaining metadata choices

7 October 2026, Asia/Singapore. **All fifteen questions have owner-approved content, and the fourteen family judgments are approved.** See the [content record](phase-2b5-pilot-batch-1-content-decision.md) and [family record](phase-2b5-pilot-batch-1-family-decision.md). This form does not ask you to approve their wording, answers or explanations again. Every box below is blank and concerns only a remaining decision.

- Exact [draft batch](phase-2b5-pilot-batch-1.json), SHA-256 `91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda`.
- Exact [mapping package](../evidence/phase-2b5/mapping-package.json), SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`.
- [Plain-language guide](phase-2b5-pilot-tag-guide.md) explains primary/secondary concepts and families; [coverage ledger](../phase-2b5-pilot-coverage-gap-ledger.md) describes existing families. The complete original question-and-feedback form is preserved in commit `70dddb09ada2bbb63e148a355fd4085eab24d85f`.

Copy chosen lines into your reply in **“Vet Security+ SY0-701 questions”**, authenticated chat ID `01a0ec5b-7f84-71f1-920b-7b0cd42850d2`, change their boxes to `[x]` and include both hashes. Each checked line authorizes **only local recording of that exact metadata decision** after hash verification, in a separate record attributed to your reply. An explicit natural-language decision can also authorize its clearly stated scope. Agent-filled forms, repository checkmarks, silence and elapsed time do not create approval. Unchecked choices stay pending; after an hour, independent authorized preparation can continue.

All short IDs below begin `draft.pilot1.`. For each choice, either check to **keep the stated proposal**, leave blank and request **revise**, or state **reject**. A group can be accepted together; to split a group, name the exact question IDs and the change you want. No checkbox changes content, mastery weight, publication, the active bank/mappings or runtime. Phase 2B-5 remains NOT READY.

## 1. Main skill tags and secondary roles

These five choices approve only the stated primary tag for the named questions and the current proposal of **no secondary concepts**. Difficulty and scope remain separate. Family decisions are already recorded.

- [ ] **T-RTO** — Keep rto.01, rto.02 and rto.03 tagged RTO (`recovery.rto`): judge whether service is restored within its target time; no secondary concepts.
- [ ] **T-RPO** — Keep rpo.01, rpo.02 and rpo.03 tagged RPO (`recovery.rpo`): judge how much recent data is recoverable or could be lost; no secondary concepts.
- [ ] **T-MTD** — Keep mtd.01, mtd.02 and mtd.03 tagged MTD (`recovery.mtd`): judge the outer acceptable business-disruption limit; no secondary concepts.
- [ ] **T-MTTR** — Keep mttr.01, mttr.02 and mttr.03 tagged MTTR (`recovery.mttr`): calculate or interpret observed average repair/recovery time; no secondary concepts.
- [ ] **T-BIA** — Keep bia.01, bia.02 and bia.03 tagged BIA (`continuity.bia`): assess business disruption impacts and dependencies; no secondary concepts.

## 2. Proposed difficulty and reasoning skills

These choices approve only the exact difficulty/skill labels in the batch. “Hard” means more inference in the draft, not measured exam difficulty. Skill labels: interpretation = explain provided facts; calculation = work out a value; scenario application = apply a concept; evidence evaluation = decide what evidence supports.

- [ ] **D-RTO** — Keep rto.01 medium/interpretation, rto.02 medium/calculation and rto.03 hard/evidence evaluation.
- [ ] **D-RPO** — Keep rpo.01 easy/interpretation, rpo.02 medium/scenario application and rpo.03 hard/evidence evaluation.
- [ ] **D-MTD** — Keep mtd.01 easy/interpretation, mtd.02 medium/scenario application and mtd.03 hard/calculation.
- [ ] **D-MTTR** — Keep mttr.01 easy/calculation, mttr.02 medium/interpretation and mttr.03 hard/evidence evaluation.
- [ ] **D-BIA** — Keep bia.01 easy/scenario application, bia.02 medium/scenario application and bia.03 hard/evidence evaluation.

## 3. Syllabus and supporting scope

- [ ] **S-COMMON** — Keep all fifteen as MCQs under objective 5.2, domain `sy0701.domain-5`, chapter `sy0701.objective-5.2`, topic `business-continuity-metrics`; keep RTO/RPO/MTTR/BIA as explicit BIA objective scope. MTD's supporting-scope choice remains separate.
- [ ] **S-MTD** — Keep mtd.01–03 as supporting continuity context under objective 5.2, without presenting MTD as an explicitly listed SY0-701 exam bullet.

## Completed family review

The owner's “all pass” reply approved the fourteen exact family judgments in the [separate family record](phase-2b5-pilot-batch-1-family-decision.md). mtd.01 stays in m196's existing family with zero novelty credit. The rpo.03/m088 clean-point reasoning caveat is preserved. There is no repeat family-approval request here; future local question and family work is authorized without further approval requests.

## Correction format

```text
Batch SHA-256: 91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda
Mapping package SHA-256: 056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97
Decision ID: T-RPO / D-RPO / S-COMMON / S-MTD (choose one)
Questions affected:
Choice: keep / revise / reject (choose one)
Requested concept tag, secondary role, difficulty, skill or scope change:
Reason:
```

Canonical pilot identities and wider taxonomy are separate pending decisions. These local records do not publish revisions or create eligible adaptive evidence. Private processing, component PBQs, MTD/BIA teaching gaps, repeated-lapse capacity and later integration/rollout gates remain open. No live action is authorized; the 15-minute monitor remains active.
