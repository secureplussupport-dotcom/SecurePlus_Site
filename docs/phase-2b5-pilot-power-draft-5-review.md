# Phase 2B-5 — one load-aware power-continuity MCQ

7 October 2026. Baseline `3892a7c0b33335971f9b05ef58e052743f15ac0a`. **CODEX_REVIEWED_UNDER_DELEGATION_PENDING_INDEPENDENT_GATE.** One original offline question, one proposed reasoning family, zero independently approved new families and zero eligible mastery evidence. Phase 2B-5 remains **NOT READY**.

The owner's prospective instruction, human message `01a113bf-b3d5-7e12-bb2a-e0c3c2ddc701`, authorizes local question/family decisions: “you dont need my approval for the next questions or family tags anymore. just execute.” This item is Codex-reviewed under that delegation; it is not personally human-reviewed. The master plan supplies approved product decisions and the Phase 1 audit supplies historical current-state evidence; this offline slice changes no behavior and presents no unresolved product conflict.

## Exact draft and bounded gap

Draft: `docs/drafts/phase-2b5-pilot-power-draft-5.json`, SHA-256 `27cde25ba68bce538fb06a50d58a6d0c9534da18e7b707b14037529f78e3c084`.

Question: `draft.pilot5.power.01`, semantic signature `sha256:7b06947cb4fee4bbdcd1afa673744414f3cdc53469a9a73aa9e0c8bdaf0a68c9`. Proposed family: `load-dependent-ups-generator-bridge`. Proposed medium difficulty is uncalibrated; proposed 3.4 scope is unapproved. Primary mastery identity is null and secondary identities are empty because no reviewed identity for this reasoning has been established. No RTO/RPO role, power term or objective topic is promoted into an approved mastery concept.

The effective reader applies the existing publication/editorial/feedback precedence to 395 MCQs and 88 PBQs across every objective, bank signature `sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391`. Both saved search rules inspect every string leaf, including options, feedback, diagrams and PBQ answer structures. Power terms and implicit load/runtime/transfer/shutdown/capacity descriptions retain **61 candidates**, sorted-ID signature `sha256:066ff7e9e4d4bb8033f8a3c6bb9cf5490828932a104a73b90b341bdb0cb4f20e`; 422 are unmatched. A supplemental reproducible screen for energy, amperage, volts, kVA, mains, diesel, capacitors, standby and electrical/supply-interruption wording adds zero candidates from the unmatched pool.

All 61 retained candidates' full answer logic was inspected, combining this focused review with exact earlier reviews in this conversation. The packet preserves every original objective, local semantic revision, captured published-record revision and assessed-understanding judgment separately. None of those retained answers requires selecting a UPS-to-generator bridge using load-dependent tested battery duration. Examples explain the lexical exclusions: m061's power plant tests air-gapped isolation; m098/m171/p084 power-off wording tests forensic volatility; m060/p022 runtime concerns software responsibility; m065/m076/m299/m708/m709/p223 capacity concerns quotas, storage or networks; m714 boot wording tests attestation. Data/evidence/role transfers do not assess electrical transfer.

Also inspected all 21 existing offline MCQs and six worksheet rows, including options, keys and feedback, and compared three teaching drafts as supporting text only. Their exact hashes are pinned in `sourceBindings`. Serial restoration-time arithmetic (`draft.pilot1.rto.02`), manual-workaround throughput (`draft.pilot1.mtd.02` / `draft.pilot4.bia.02`), upstream DDoS capacity (m708) and site/backup/retention design (p211) assess different decisions. The proposed item requires recognizing that sufficient output watt capacity does not imply sufficient battery duration and removing an explicitly optional load changes continuity feasibility.

This justifies one bounded local draft, not a claim of complete semantic absence across the bank. The 422 unmatched records were screened rather than individually reviewed in full. Private/live content and unobserved drafts remain outside this evidence. Search exclusions and lexical similarity cannot establish psychometric independence; the independent gate is pending.

## Key, distractors and ambiguity challenge

The scenario states a complete essential load of 600 W and an optional 400 W display; the UPS limit is 1,500 W. Verified minimum runtimes under the same test conditions are 12 minutes at 600 W and seven minutes at 1,000 W. Generator readiness takes eight minutes, followed by two minutes to transfer usable power to the UPS input. Uninterrupted service and two minutes of remaining battery runtime are explicit requirements.

| Option | Recomputed result | Judgment |
| --- | --- | --- |
| A / index 0: essential equipment only on UPS; display off | Bridge = 8 + 2 = 10 minutes. Runtime = 12; reserve = 2. Output load 600 < 1,500 W. | Only correct plan; meets both requirements. |
| B / index 1: both loads because output rating permits them | Load = 1,000 < 1,500 W, but battery lasts seven minutes: three minutes short of transfer. | Confuses power capacity with duration. |
| C / index 2: generator only | No equipment power during the first ten minutes after utility loss. | Verified eventual capacity cannot bridge startup/transfer. |
| D / index 3: controlled shutdown at minute six | Deliberately interrupts service before transfer and subsequent restart. | May protect data, but fails this specified continuity goal. |

All four options have individual feedback; the explanation matches the key. The complete load includes every essential dependency. The display can stay off without affecting the service. Generator fuel/capacity, compatibility and uninterrupted switching are explicitly verified, and no alternative source exists. These premises remove competing interpretations about omitted dependencies, transfer interruptions or an unverified generator. Times, loads and the two-minute reserve are hypothetical stipulations, not externally recommended engineering thresholds. No linear battery scaling, VA conversion, future-outage guarantee or claim that controlled shutdown is universally inappropriate is made.

Official [CompTIA SY0-701 objectives](https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf), PDF page 9, list generators and UPS under 3.4 power, alongside capacity planning. This supports the proposed scope; it does not approve canonical metadata. Schneider's [UPS selector](https://www.se.com/us/en/work/products/tools/ups-selector/) supports evaluating battery runtime at the connected load. Its [UPS buying guide](https://www.se.com/us/en/work/support/product-support/ups-buying-guide-for-selecting-a-battery-backup-system/) supports the load/runtime relationship and battery support while generators start. Only those claims are used; no VA conversion formula is adopted from the guide.

The numeric-normalized lexical comparison covers all 483 effective questions, 21 prior MCQs, six worksheet rows and three teaching drafts. The nearest stems are `draft.pilot2.pbq.01:rto` (0.1591), `draft.pilot4.mttr.02` (0.1579) and `draft.pilot1.rto.01` (0.1538); their complete logic was compared. They concern service/data recovery or repair statistics, not load-dependent electrical bridging. A numeric-only rewrite correctly scores 1 in the check. These scores are triage aids, not approval thresholds or semantic proof.

## Boundaries and runnable checks

Active mapping-package SHA-256 remains `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`. All 25 active release-file hashes remain unchanged. The pending owner decision packet is unchanged. Selected private p017 remains `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, unavailable payload, null trusted revision, no refreshed private read and no local-fallback substitution.

Run `node scripts/audit-pilot-power-draft-5.mjs`. The small check verifies source pins, exact retained revisions, search reproduction, prior counts, item structure, arithmetic/key, zero weights and approval flags, private boundaries, unchanged release files and absence of runtime imports. Eight deliberately invalid variants must fail, including changed key/runtime, missing feedback, positive weight, false human/scope/family approval and RTO identity promotion. Structural checks support the bounded editorial reasoning above; they cannot automatically certify semantic novelty.

Passed: dedicated power-draft check, prior cross-objective census and recovery-test precheck, owner-packet audit, all 29 content-mapping tests and byte reproduction, and Vercel `[skip deploy]` check. No new browser, build, database, private catalogue, learner delivery or deployment validation is claimed for these offline files.

**NOT READY.** Independent review, canonical identity, current scope/difficulty decisions, integration, teaching/component evidence, private processing and broader coverage/calibration remain pending. This item is unpublished, unactivated, unwired and zero weight, with zero approved family credit. The task-only commit uses `[skip deploy]`; unrelated dirty files remain unstaged.
