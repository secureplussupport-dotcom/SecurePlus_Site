# Phase 2B-5: objective 1.3 change-management questions

**LOCAL SEMANTIC PROPOSALS — NOT READY.** Four effective MCQs and their four feedback bundles have pending agent dispositions. The exact broad objective-1.3 census is **46 records**: 20 already have dispositions in prior packets, this slice adds eight, and **18 remain**. These are review counts, not approved coverage or eligible mastery evidence. The source-bound master plan and historical Phase 1 audit remain unchanged; no unresolved product-decision conflict was found and no behavior is changed.

Baseline: `522b76d251020e2639f4bbb94845d5bd6d54096d`. [Proposal packet](drafts/phase-2b5-objective13-change-mcq-proposals.json), SHA-256 `191d496358740cc07567452eb64fd1d2f3ab508cd83279a6c1f840355bc8ee67`. It records every candidate's kind, source, exact revision and disposition status, plus all eight prior packets. Question text, grading keys, private payloads and learner history are not exported.

## Exact candidate denominator

| Kind | Candidates | Previously dispositioned | New slice | Remaining |
| --- | ---: | ---: | ---: | ---: |
| MCQ | 4 | 0 | 4 | 0 |
| Feedback bundle | 4 | 0 | 4 | 0 |
| Flashcard | 9 | 9 | 0 | 0 |
| Glossary definition | 18 | 10 | 0 | 8 |
| Deck container | 1 | 1 | 0 | 0 |
| Lesson | 1 | 0 | 0 | 1 |
| Lesson section | 3 | 0 | 0 | 3 |
| Keyword guide | 1 | 0 | 0 | 1 |
| Trap bundle | 1 | 0 | 0 | 1 |
| Lesson check, including displayed generated checks | 4 | 0 | 0 | 4 |
| **Total** | **46** | **20** | **8** | **18** |

The earlier objective-1.1 support packet accounts for the nine cards, deck and ten glossary definitions; they are deduplicated by exact source identity rather than counted as new work. None of the tagged candidates is a PBQ. This is the effective local package census, not a search of every untagged item or unavailable live/private payload.

## Assessed decisions and feedback

All four effective questions retain objective 1.3. The [official SY0-701 objectives v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) identify approval, impact analysis, test results and backout plans under this objective. CI/CD is a related workflow interpretation within release validation, not an explicitly named syllabus bullet or proof of dedicated security testing.

| ID | Actual assessed decision | Feedback usefulness and qualification |
| --- | --- | --- |
| m232 | Reassess a previously approved change after new vulnerability information materially changes its risk. | Main feedback and three wrong-choice corrections distinguish stale approval, automatic cancellation and deferring a patch without required re-approval. The emergency path is conditional on local policy; discovery 48 hours beforehand does not by itself classify the change as an emergency. No vulnerability exploitation or risk-calculation competence is inferred. |
| m416 | Recognize combined peer-review, build and test release gates. | Corrections distinguish the described workflow from threat modelling alone, penetration testing alone and DAST alone. A functional test suite does not establish security testing. The second reviewer supplies context; this is not a separately assessed split-duties outcome or a secure-pipeline implementation exercise. |
| m639 | Recognize the document specifying reversal of a failed production change. | Feedback contrasts reversal steps with impact prediction, business continuity and a generic playbook. Naming a backout plan does not demonstrate safe reversibility, rollback execution, data recovery or any RTO/RPO/MTD/MTTR/BIA outcome. |
| m649 | Identify the approval record required by the explicitly stated normal-change policy. | Corrections distinguish authorisation from artefact integrity, availability and monitoring output. This does not assert that every standard, pre-approved or emergency change needs CAB approval, nor that the record's authenticity has been verified. |

These distinctions are consistent with security impact analysis throughout a change and organisation-specific change-control procedures. [NIST SP 800-128, §§3.3.2–3.3.3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-128.pdf) describes controlled evaluation, testing and approval, including pre-approved exceptions and unscheduled changes. Its rollback provisions preserve previous baselines; recognising the procedure does not prove successful restoration. No teaching, policy or answer text is edited here.

Each feedback bundle contains one main correction and three specific wrong-choice corrections, all read in full. The actual `getWrongOptionFeedback` helper uses those authored corrections without its generic fallback. They remain answer-linked instruction with weight zero, not four new assessments per question. DAST in m416 and hashing in m649 receive existing support-node links only as instructional contrasts; distractors receive no assessed secondary role. Their glossary definitions and related lessons are not silently reviewed through these mentions.

## Source precedence, delivery and families

The packet separates authored, pre-editorial snapshot-merged, effective local and published-catalogue revisions. There is **no item-specific captured override** for any selected ID in the bound public snapshot or authenticated capture. The pre-editorial objects therefore match authored objects here, while the effective editorial pipeline supplies the reviewed current wording/feedback and tags. In particular, authored m639/m649 have old chapter-4/medium metadata; effective versions are chapter 1/easy. Preserve the effective versions rather than restoring those old labels. Published objects add `_baseOrder`; removing that metadata reproduces the exact effective semantic objects. Existing compiler-derived trusted IDs match the catalogue, but do not confer mapping approval or prove current live deployment. No fresh production query is made.

The source renderer selects these questions through the existing practice pool, starts a set, and displays the selected stem/options. Guest practice can use that pool. Main explanations require submission and Pro; inline wrong-option detail also requires the selected option to be wrong. Feedback is not available to all users, nor are all three wrong corrections shown simultaneously. Source-bound observations are not fresh browser tests. No grading, persistence, entitlement, analytics or remote-fetch handler is invoked.

The focused check executes the real option shuffler with fixed local randomness. It checks the same option set, preserved keyed meaning and feedback remapping, without exporting indices or executing a learner session. A different display order remains the same authored decision and family.

Four provisional semantic family labels distinguish risk-triggered re-review, release-gate recognition, backout-document recognition and required-approval-record recognition. The two approval questions require different judgments: reconsider a change versus identify policy-required evidence. These labels remain agent comparisons pending editorial independence decisions; no calibrated new family credit is awarded. Prior directive/managerial control questions m003/m203, category/factor question m601 and split-duties question m044 retain their exact dispositions and family labels.

Pure single-miss recommendation fixtures return governance-change-vendors for all four; risk-resilience-governance additionally appears for m416/m639, and security-foundations-controls for m649. These are exact current selector outputs, not reviewed teaching or approved remediation. The governance lesson's ten records remain pending in the census. Recovery-related routing cannot create recovery mastery, and an already reviewed foundations lesson does not automatically correct an approval-record miss.

The only five mastery identities available are BIA, MTD, MTTR, RPO and RTO. None encodes these change-management decisions, so all four **primary mastery proposals remain null**. No canonical identity is invented, no topic/support node is promoted, and all weights and new family credit remain zero. Earlier CIA/MAC/RBAC/TOU ambiguities, withheld MTTR glossary linkage and unverified MTBF glossary delivery remain unchanged.

## Validation and remaining gate

Validation passed: `node scripts/audit-objective13-change-mcq.mjs`, all 29 tests in `npm run audit:content-mapping`, exact package reproduction, all 25 unchanged release checksums and the Vercel skip-marker guard. Diff whitespace checks passed before staging. The focused check binds the 46/20/8/28/18 census, source precedence and compiler identities, feedback and actual gates, source difficulty labels, deterministic permutation/feedback association, prior comparisons and selector outputs. Negative cases reject stale effective/published/feedback revisions, invented primary/trusted identities, distractor credit, scope/family/difficulty promotion and ungated feedback claims.

Remaining records are **eight glossary definitions** (DAST, FAR, MOA, MOU, NDA, SLA, SOW, TLS) and **ten governance-change-vendors lesson records** (lesson, three sections, keyword guide, traps, reveal check and three displayed generated checks). They require their own meaning, delivery and usefulness review. Four reviewed tagged MCQs do not establish full objective coverage: ownership/stakeholders, maintenance windows, SOPs, dependencies, downtime/restarts, allow/deny lists, documentation and version-control decisions are not independently assessed by this slice. This is a bounded finding, not a claim that those topics are absent across the entire bank.

The active package remains SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`: 1,878 records, 435 concepts (5 mastery, 28 topic, 402 support), **2,954 review decisions**, **489 unresolved question mappings**, seven existing primary proposals. Approved new mappings and eligible evidence are **zero**. Private selected p017 remains unavailable at `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted revision null, no fresh query or fallback substitution.

Canonical/role/scope/difficulty approval, other semantic review, precise teaching and qualified evidence, family calibration, private-source verification and rollout readiness remain phase-wide gates. Commit/push only this packet/report/check with `[skip deploy]`; preserve unrelated dirt. Adaptive remains unpublished, unwired, default-off and learner-invisible. No live migration, deployment, activation, shadow writes, cohort change, credentials, pricing/legal or Phase 3 change is authorized. **Phase 2B-5 and production migration remain NOT READY.**
