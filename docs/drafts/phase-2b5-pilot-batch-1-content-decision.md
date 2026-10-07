# Pilot batch 1 — owner content decision record

Date: 7 October 2026, Asia/Singapore. Status: **OWNER-APPROVED CONTENT ONLY; METADATA AND PUBLICATION PENDING.** Phase 2B-5 remains NOT READY.

## Authenticated human source

- Reviewer: product owner, from the human user message returned by Codex's authenticated chat reader; recorded locally by the implementation agent.
- Source chat: **“Vet Security+ SY0-701 questions”**, ID `01a0ec5b-7f84-71f1-920b-7b0cd42850d2`, host `local`.
- Source turn: `01a113ad-9d14-74a0-913f-497393d37fb3`.
- Source human message: `01a113ad-9f1d-70f2-9049-5491c0c920e5`.
- Source turn started: 7 October 2026 at 08:05:07 Singapore time (`2026-10-07T00:05:07Z`). The reader exposes the turn timestamp, not a separate message timestamp.
- Exact owner wording (spelling retained):

> i apporve all questions, but have trouble understanding the related concpets tagged to each question

This is source-attributed human authorization, not an agent signature or a claim of a cryptographic signature. The explicit natural-language approval overrides the earlier form's requirement for a checked reply **for question content only**. The owner's stated uncertainty about tags is preserved. No checkbox or broader decision is inferred.

## Exact review binding

- [Draft batch](phase-2b5-pilot-batch-1.json): SHA-256 `91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda`.
- [Mapping package](../evidence/phase-2b5/mapping-package.json): SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`.
- Repository state when approval was verified: `70dddb09ada2bbb63e148a355fd4085eab24d85f`.
- Original reviewer form at that commit: SHA-256 `ae53f44c1ca23cba6523f409223ad93534bd6c16c3a3602ea23de5ed0f543137`.

The batch and package bytes were verified before recording. Approval attaches only to the fifteen exact draft content revisions in that batch. A content change needs renewed content review; a new mapping package needs deliberate rebinding. This record does not approve unrelated source records or any private payload.

## Content decisions

For every row, **approved content** means the exact stem, four options, proposed correct-answer index, overall explanation and all four option-feedback entries. All primary/secondary concept proposals, difficulty, objective/domain/chapter/topic scope and family judgments remain pending. MCQ format, cognitive skill and mapping-version proposals are also unapproved metadata.

| Exact draft ID | Stem/options/answer/explanation/feedback | Concept tags/roles | Difficulty | Objective scope | Family judgment |
| --- | --- | --- | --- | --- | --- |
| `draft.pilot1.rto.01` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.rto.02` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.rto.03` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.rpo.01` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.rpo.02` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.rpo.03` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.mtd.01` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.mtd.02` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.mtd.03` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.mttr.01` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.mttr.02` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.mttr.03` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.bia.01` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.bia.02` | Owner-approved content only | Pending | Pending | Pending | Pending |
| `draft.pilot1.bia.03` | Owner-approved content only | Pending | Pending | Pending | Pending |

MTD supporting-context scope remains pending for mtd.01–03. mtd.01 retains its same-family proposal with m196 and zero novelty credit; no independent-family approval was granted. The other fourteen family labels remain proposals.

## Storage and action boundary

The immutable draft JSON retains its original `humanApproved: false`, unpublished state and zero mastery weights. This separate record stores the subsequent, narrower content decision; a passing original draft audit validates that unchanged snapshot, not metadata approval or runtime eligibility. This dated record supersedes earlier statements that all fifteen questions still await content approval, but does not change their outstanding metadata gates.

No active bank or mapping, publication, runtime, database, deployment or automation configuration was changed. No local approval flags in the JSON were flipped. Trusted revision integration and publication require separate authority. [Plain-language tag guide](phase-2b5-pilot-tag-guide.md) and [remaining review choices](phase-2b5-pilot-batch-1-review.md) cover the decisions still needed.
