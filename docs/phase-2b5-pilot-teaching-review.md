# Phase 2B-5 — MTD/BIA teaching reuse and draft review

7 October 2026, Asia/Singapore. Baseline `c9a73fb16d01f1e85710f5a4a29d60de4d28accb`. **LOCAL ONLY; NOT READY for teaching-link adoption, publication or adaptive activation.**

The master plan governs product decisions; the Phase 1 audit supplies historical implementation facts. This bounded slice investigates the pilot teaching gaps, proposes reuse of useful effective content and drafts only the missing instructional forms. It changes no active content, mappings or learner behavior.

## Finding: useful support exists, dedicated teaching is missing

Inspected the effective imported `CONCEPT_DEEP_DIVES`, their actual sections, profile keyword guides, traps, self-checks and the first three displayed generated checks; the 313 actual flashcards; 162 inline definitions; effective explanations/feedback from the 395-MCQ/88-PBQ bank; and nine signup-starter explanations. Read the matching items and the related resilience, risk/governance and recovery lessons in full. Source-level delivery and exclusion rules follow the existing mapping generator and App renderer.

| Concept | Existing material worth reusing | Confirmed narrow shortage | Minimum new offline content |
| --- | --- | --- | --- |
| BIA | Existing definition card, conditional glossary definition, effective m086 explanation and document contrasts | No dedicated lesson section explaining business-owner impact inputs, time-dependent consequences, dependencies and feasible alternatives was found in this bounded review | One applied teaching section; no second BIA definition card |
| MTD | Effective m196 explanation correctly distinguishes the outer business limit from RTO; existing recovery-metrics table supplies contrasts | No MTD flashcard or dedicated MTD section was found | One definition card and one section with business-resumption arithmetic |

The effective p048 explanation also reinforces using the supplied BIA priorities and actual dependencies. It supports that ordering exercise but does not teach how to conduct a BIA; no dedicated BIA-process link is inferred from it.

The earlier ledger's “teaching gap” does not mean these concepts have no useful explanation. Conversely, the BIA alias on `resilience-assets-physical` is search metadata, not a BIA lesson. Its recovery-metrics section teaches RTO/RPO/MTTR/MTBF and has no MTD row. Broad inherited objectives and risk/asset-cost discussions do not establish a reviewed BIA process or MTD section.

The reproducible named-term census is an aid to this bounded semantic review, not proof that all potentially useful paraphrases were found. Generic continuity, change-impact and vulnerability-priority sections were read as candidates and do not fill these specific gaps. Unused generated flashcards are excluded because the App does not deliver them. Public SEO pages and guest marketing demos are outside this bounded slice. Private/live content was not inspected, and no browser delivery claim is made.

## Exact revision bindings and proposed reuse

[Teaching packet](drafts/phase-2b5-pilot-teaching-draft-3.json) contains five support-link proposals and three original drafts. [Validation evidence](evidence/phase-2b5/pilot-teaching-validation.json) binds the exact packet/report/script bytes, the effective inspected corpus and each content revision. The active mapping package remains SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`.

| Existing record | Proposed target / use | Revision boundary |
| --- | --- | --- |
| flashcard:sy0701-acronym-risk-governance-business-bia-business-impact-analysis | BIA definition support | Exact delivered card, including inherited deck metadata; those objectives are not automatically approved card scope |
| glossary:bia | BIA brief definition support | Exact term/definition object; tooltip remains conditional |
| explanation:mcq:m086 | BIA post-answer support | Exact effective explanation/feedback bundle; no grading text copied into the link export |
| explanation:mcq:m196 | MTD post-answer boundary support | Exact effective explanation/feedback bundle, rather than superseded raw authored text |
| section:resilience-assets-physical:1 | MTD contrast context only | Exact section; no claim of direct MTD teaching or a new approved objective assignment |

The two effective parent MCQs were re-read. Their revisions still match the existing pilot signatures: m086 `sha256:314994d739ecbe82485e02f29dda4c628773b1ff363b93913182892515e52872`; m196 `sha256:064871a82f7228185d753db57a4ff070d965ea05ffbf8499a65dbad23303a600`. Explanation-bundle hashes are separate from parent question hashes. The audit reconstructs each reused payload through the current source readers and rejects stale package signatures or changed effective bytes.

These links remain proposals with zero mastery weight. Existing primary/supporting roles, canonical identities and inherited objective scope are not approved by this report. A support link does not turn a related concept into a tested weakness or a question into fresh transfer evidence.

## Three original drafts and factual review

- `draft.pilot3.mtd.card`: concise outer-interruption definition, acceptable business operation as the end point, and distinction from RTO/RPO.
- `draft.pilot3.mtd.section`: explains required work after technical restoration. A six-hour business limit, four-hour system restoration and ninety-minute sequential reconciliation give five and a half hours of interruption and thirty minutes remaining. The hypothetical explicitly excludes overlap and a workaround. Its successful exercise is not a future guarantee; data age is not added to elapsed interruption.
- `draft.pilot3.bia.section`: explains obtaining owner impacts over time, identifying dependencies and validating alternatives. The dispatch/reporting example uses stated business needs and a required shared identity service. It does not invent an identity restoration budget, assume all organizations restore identity first, or equate asset price/outage likelihood with disruption consequences.

Both sections use the existing title/body/table content shape; the card uses acronym/expansion/meaning. No new lesson framework or renderer is introduced. Supporting RTO/RPO/MTTR links in the MTD section are context proposals, not secondary mastery evidence.

Checked [CompTIA SY0-701 objectives version 5.0](https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf), PDF page 14, objective 5.2: BIA is explicit. MTD is supporting continuity context in the approved pilot, **not an explicit named SY0-701 bullet**. The packet proposes that distinction; it does not approve the current S-COMMON/S-MTD metadata choices.

Checked [NIST SP 800-34 Rev. 1](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf), sections 3.2.1–3.2.3, printed pages 16–19: process-owner impact input, downtime limits, reprocessing, resource requirements and recovery priorities. Numerical values and organizations in the drafts are original hypothetical assumptions. No regulatory obligation, universal recovery sequence or promised workaround effectiveness is invented.

This is Codex author/content review under the authorized local scope. No human approval of teaching links, exact scope or concept roles is claimed. Separate independent accuracy/usefulness and link review remains open. The prior question/family approvals and the future authoring delegation remain separate records; no repeat owner question/family request is introduced here.

## Runnable checks and remaining gates

Run `node scripts/audit-pilot-teaching-drafts.mjs`; `--write` deliberately refreshes only this slice's evidence.

The audit validates five reconstructed reuse bindings, three exact draft revisions, support-only flags, the MTD example arithmetic, and the separate teaching-versus-metadata census. Adversarial cases reject stale package hashes, changed source definitions, missing/opaque private payloads and fabricated approval statuses. It verifies the active release-manifest files are unchanged and that src/api/server import no draft. Those checks do not certify semantics, learning effectiveness or canonical mapping approval.

Passed: dedicated teaching audit and deterministic evidence check, existing content-mapping audit (29 tests and byte reproduction), learning-pilot replay/catalogue checks, whitespace and Vercel `[skip deploy]` checks. No new browser/build, database or production checks are claimed for this isolated teaching slice.

Residual gaps: independent review and exact teaching-link roles/objectives, eventual content-kind adapters/publication, unapproved current pilot metadata and wider taxonomy, private revisions, component-PBQ runtime support, independent-family budgets, and learner calibration. Drafts do not increase active MTD/BIA lesson/card counts or eligible evidence. Phase 2B-5 remains incomplete and production NOT READY.

Task files are the packet, this report, the audit and its validation evidence. Existing teaching content, bank, mappings, runtime, database, learner flows and fifteen-minute automation are unchanged. Task-only commit/push uses `[skip deploy]`; unrelated workspace work remains unstaged.
