# Phase 2B-5 pilot coverage and draft batch 1

Date: 7 October 2026, Asia/Singapore. Baseline: `8eafd87fc0a0758470f78d27113309059068b3b2` (private-helper remediation independently accepted). **DRAFTS ONLY; NOT READY for publication or adaptive evidence.**

The master plan governs product decisions; the Phase 1 audit supplies historical facts. This slice follows the standing instruction to author against measured concept/difficulty/format/family gaps. It does not resolve the bank-wide 489 unmapped question revisions by generating more labels. All draft content, mappings, difficulties and family judgments require exact human editorial approval.

## Verified baseline and limits

Reconstructed the current effective local bank using `readLearningPilotBank`: 395 MCQs, 88 PBQs. Its full canonical signature is `sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391`. The unchanged mapping package SHA-256 is `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`.

Checked all seven pilot mapping signatures against the bank. A full-bank acronym/expanded-name search found only m032, m086, m088, m196, m635, p048 and p211. A broader stem/options search for restoration, backup, repair, downtime, outages, business impact and continuity was also read: backup type m177, restoration sequence p026, incident lifecycle questions, vulnerability prioritization and SLA naming m645 do not directly test these five pilot concepts. Mentions in answers, distractors or explanations are not direct evidence. This agent search is a bounded content review, not proof that every future question is classified.

No remote catalogue was refreshed. The dated private p003/p017 metadata from the earlier package remains historical; their actual payloads are unavailable for this duplicate/content review. Claims below concern the effective local captured bank, not independently verified live browser delivery or unseen private material. Private trusted IDs remain null. Local source selections and all active mappings remain unchanged.

## Gap ledger

E/M/H = proposed easy/medium/hard; difficulty labels are not calibrated. Existing families are agent-reviewed, with **zero human-approved independent families** for every concept. Each row separates format and reasoning skill from raw counts.

| Concept | Current direct MCQs; E/M/H | Existing family / skill | Coarse PBQ context (zero direct evidence) | Measured shortage | Batch E/M/H; proposed new families |
| --- | --- | --- | --- | --- | --- |
| RTO `recovery.rto` | m032, m635; 2/0/0 | One: restoration-target-identification; interpretation / identification | p048 ordering, p211 combined design | No direct application/complex inference MCQs; no independent post-miss family | 0/2/1; 3 proposed new families |
| RPO `recovery.rpo` | m088; 0/1/0 | One: versioned-backup-interval; application | p211 combined design | No easy point interpretation or harder usable-point/evidence judgment; one family only | 1/1/1; 3 proposed new families |
| MTD `recovery.mtd` | m196; 0/1/0 | One: outer-business-interruption-limit; distinction | None | No workaround reassessment or end-to-end business resumption; no mapped MTD teaching resource | 1/1/1; 2 proposed new families, easy check deliberately shares m196 family |
| MTTR `recovery.mttr` | None; 0/0/0 | No direct family | None | No direct calculation, average interpretation or measurement-validity MCQ | 1/1/1; 3 proposed new families |
| BIA `continuity.bia` | m086; 0/1/0 | One: critical-function-impact-document; identification | p048 supplies BIA targets but does not test BIA reasoning | No direct input elicitation, dependency analysis or changed-impact assessment; dedicated mapped teaching section absent | 1/1/1; 3 proposed new families |

No direct component-graded PBQ coverage exists for any of the five concepts. This small batch uses MCQs for precise concept judgments; PBQ authoring/grading and teaching-resource shortages remain open. For RTO, add medium/hard work rather than a third easy naming question. For the other concepts, span E/M/H where the proposed reasoning permits. No count implies adequate novelty after repeated lapses: the pilot ordinarily needs two fresh families after a miss and three after sticky history, plus delayed checks. Drafts supply **zero** eligible families until approval, revision binding and separately authorized integration.

## Original draft batch

[Full questions, four options, correct answers, overall and per-option feedback, proposed mappings, family rationale and accuracy notes](drafts/phase-2b5-pilot-batch-1.json).

| Draft suffix (all IDs start `draft.pilot1.`) | Difficulty / skill | Scenario reasoning / family proposal |
| --- | --- | --- |
| rto.01 | Medium / interpretation | Judge service restoration without substituting the separate data-loss allowance |
| rto.02 | Medium / calculation | Budget a serial dependency-and-validation path against the end-to-end target |
| rto.03 | Hard / evidence evaluation | Distinguish an advertised availability aggregate from evidence for a per-outage recovery target |
| rpo.01 | Easy / interpretation | Determine the data-loss window from the latest usable recovery point |
| rpo.02 | Medium / application | Identify durability/backlog-age evidence needed for asynchronous site recovery |
| rpo.03 | Hard / evidence evaluation | Reject frequent but corrupted copies; assess the latest verified clean point |
| mtd.01 | Easy / interpretation | Read an outer business-impact threshold; **same family as m196**, no novelty credit |
| mtd.02 | Medium / application | Reassess tolerance after a validated finite-capacity manual workaround |
| mtd.03 | Hard / calculation | Include post-restoration business reconciliation before the process is usable |
| mttr.01 | Easy / calculation | Compute an observed repair-duration average with explicit boundaries |
| mttr.02 | Medium / interpretation | Recognize that a favorable mean can conceal an individual long outage |
| mttr.03 | Hard / evidence evaluation | Reject a claimed improvement based on changed measurement boundaries |
| bia.01 | Easy / application | Select missing business-owner impact inputs beyond an asset-price inventory |
| bia.02 | Medium / application | Recognize the critical role of a shared enabling dependency |
| bia.03 | Hard / evidence evaluation | Reassess stale impacts after a changed business service and unusable fallback |

There are 15 drafts and 14 **new family proposals**, not 14 verified independent families. Different stems or IDs are insufficient. mtd.01 is explicitly grouped with the existing family. rpo.03 shares backup/recoverability subject matter with m088 but introduces delayed-corruption clean-point selection; an editor may merge those families. Cross-concept timing and workaround similarities are disclosed in each rationale. Empty secondary proposals avoid attributing mastery from contrasts alone; reviewers must change them only where solving the task genuinely needs a second concept.

## Source and accuracy review

References were checked on 7 October 2026. Questions are original hypothetical scenarios, not copied exam questions. Published objectives establish scope; references establish terminology. Invented organizations, requirements and timings are stated scenario assumptions, not claims about real regulations or standard recovery guarantees.

- [CompTIA SY0-701 objectives, version 5.0](https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf), PDF page 14, objective 5.2: BIA, RTO, RPO and MTTR are explicit. MTD is supporting continuity context in the approved pilot, **not an explicit listed exam bullet**. The MTTR objective says repair while the acronym list (PDF page 19) says recover; drafts define their timing boundaries and do not ask learners to pick between the two expansions.
- [NIST SP 800-34 Rev. 1](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-34r1.pdf), sections 3.2.1–3.2.3, printed pages 17–19: checked the distinctions among recoverable data, system restoration and total business interruption, including reprocessing and dependencies. BIA questions use business consequences and supporting resources rather than asset price alone.
- [IBM MTTR](https://www.ibm.com/think/topics/mttr), formula and definition-boundary discussion; [IBM MTTR vs. MTBF](https://www.ibm.com/think/topics/mttr-vs-mtbf), repair-average formula: checked average repair duration and the difference from failure frequency. The first article has an inconsistent final sentence in its worked example; that sentence was not adopted. Our arithmetic is recomputed independently.

Agent accuracy review checked each key and all three distractors for one best answer under the stated assumptions. Six drafts include explicit arithmetic; outcome checks also use stated numerical bounds. The offline audit recomputes these relationships. It cannot certify human understanding, difficulty, distractor effectiveness, semantic independence or complete factual correctness; those remain editorial judgments.

## Duplicate review and runnable checks

Run:

```sh
node scripts/audit-pilot-drafts.mjs
```

The audit checks the batch boundary, feedback/options/keys, objective context, zero approvals/weights, immutable baseline, mapped revisions, numerical relationships, absence from active bank/mappings/imports and deterministic evidence. `--write` regenerates the separate [draft validation record](evidence/phase-2b5/pilot-draft-validation.json) after deliberate review. It does not regenerate the active mapping package.

Near-copy screening compares every draft stem with all 483 effective local question stems and the other 14 drafts. It normalizes numbers and punctuation before token-set Jaccard similarity, rejecting scores of 0.65 or greater. A built-in numeric-substitution check verifies that changing four hours to six hours supplies no lexical novelty. The highest observed score is 0.2979, below the 0.65 screening threshold. The validation record retains the top three IDs/scores per draft without exporting existing question text. This inexpensive lexical screen can miss semantic paraphrases and does not confer family independence. The family reasoning review above is separate and agent-authored; private revisions are outside comparison.

Validation passed: the dedicated offline draft audit, all 29 existing content-mapping tests plus byte-for-byte package reproduction, all learning-pilot replay/catalogue checks, whitespace checks and the Vercel `[skip deploy]` check. The active package remains byte-identical. Build/browser, broader runtime/database and live checks were not repeated for this isolated draft-only slice.

## Editorial handoff and remaining gates

Review exact batch bytes and its SHA-256 in the validation record. For each draft, approve/revise/reject the stem, answer, each distractor/feedback, scope, proposed difficulty, primary/secondary roles and family grouping. Merge families where the same reasoning could answer both; do not approve independence merely because contexts differ. Decide whether MTD context is useful in this pilot without presenting it as an explicit exam bullet.

Then separately approve any new immutable content revisions and mappings before integration. Approval of this batch is not permission to publish, migrate, activate adaptive learning or deploy. Broader taxonomy, private revision processing, component PBQs, MTD/BIA teaching links, repeated-lapse variant budgets and learner calibration remain open. Phase 2B-5 stays NOT READY.

Exact slice files: this ledger, `docs/drafts/phase-2b5-pilot-batch-1.json`, `scripts/audit-pilot-drafts.mjs` and `docs/evidence/phase-2b5/pilot-draft-validation.json`. No app, runtime, database, active mapping, entitlement, deployment or automation configuration changes. The existing 15-minute monitor remains active; unrelated workspace files remain unstaged.
