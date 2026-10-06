# Phase 2B-5 review package

NOT READY. This is a proposal package, not completed semantic mapping or permission to activate adaptive learning.

The census contains 395 effective local MCQs, 88 local PBQs, and 2 later private PBQ variants, plus 9 separately authored signup starter questions. Only 7 question mappings carry an existing reviewed pilot primary concept; 487 question revisions need semantic mapping. Candidate term matching has **zero mastery weight** and is not coverage.

## How to review

1. Verify checksums.json and run `npm run audit:content-mapping`.
2. Start with P0 private revisions, then P1 taxonomy and question mappings in review-queue.md.
3. Find the exact ID/source hash in mapping-package.json and inspect the secured source. Record primary/secondary concepts, objective, role, weight, rationale and justified scenario family. Missing source must stay unresolved.
4. Approve or reject each proposal in a separate signed review record bound to the package SHA. This package cannot record human approval automatically.
5. Evaluate independent post-miss variants and interventions before any mastery claim. Runtime, migration and live activation require separate decisions.

## Counting rules

Counts overlap: lessons contain sections, checks and keyword guides; explanations belong to questions; decks contain cards. Private variants are alternative role-dependent publications, not extra questions delivered together. Raw layers, disabled/retired items and unused generated helpers are exclusions. Public pages and selectors are listed separately. Browser-session delivery was not tested by this package; effective-source proof is not browser proof. The authenticated SELECT is a dated snapshot of question_overrides and pbqs, not a claim about every database or external draft.

| Content kind | Records |
| --- | ---: |
| deck_container | 29 |
| explanation_bundle | 494 |
| flashcard | 313 |
| glossary_definition | 162 |
| intervention_selector | 23 |
| keyword_guide | 32 |
| lesson | 32 |
| lesson_check | 128 |
| lesson_section | 106 |
| lesson_traps | 32 |
| mcq | 395 |
| pbq | 90 |
| public_learning_page | 16 |
| starter_question | 9 |

## Objective matrix

Inherited deck/lesson objective tags are broad candidates; counts below are not semantic coverage.

| Objective | Overlapping records | MCQs | Existing primary MCQ proposals |
| --- | ---: | ---: | ---: |
| 1.1 | 69 | 15 | 0 |
| 1.2 | 126 | 20 | 0 |
| 1.3 | 46 | 4 | 0 |
| 1.4 | 235 | 46 | 0 |
| 2.1 | 34 | 7 | 0 |
| 2.2 | 134 | 17 | 0 |
| 2.3 | 162 | 21 | 0 |
| 2.4 | 199 | 37 | 0 |
| 2.5 | 66 | 10 | 0 |
| 3.1 | 220 | 22 | 0 |
| 3.2 | 220 | 22 | 0 |
| 3.3 | 164 | 8 | 0 |
| 3.4 | 176 | 1 | 0 |
| 4.1 | 203 | 13 | 0 |
| 4.2 | 68 | 1 | 0 |
| 4.3 | 86 | 19 | 0 |
| 4.4 | 120 | 9 | 0 |
| 4.5 | 169 | 13 | 0 |
| 4.6 | 151 | 29 | 0 |
| 4.7 | 42 | 2 | 0 |
| 4.8 | 130 | 18 | 0 |
| 4.9 | 96 | 3 | 0 |
| 5.1 | 103 | 10 | 0 |
| 5.2 | 141 | 21 | 5 |
| 5.3 | 98 | 5 | 0 |
| 5.4 | 115 | 12 | 0 |
| 5.5 | 41 | 7 | 0 |
| 5.6 | 26 | 3 | 0 |

## Schema boundaries

The trusted question compiler supplies UUID revision IDs only when the actual grammar is supported. Source SHA-256 and trusted semantic SHA-256 are different namespaces. Unsupported private/PBQ/content records have null trusted IDs; no UUID is invented. New terms are proposed supporting nodes and objective nodes are topics. Promotion to mastery concepts needs editorial decisions and independently assessed evidence. Roles/weights on instructional rows are review metadata, not new database columns. Explanations, pages, guides, deck containers and selectors have no approved persistence content-kind adapter. They remain catalogue-only.

## Privacy and runtime

Artifacts contain identifiers, hashes and proposed taxonomy, not questions, options, grading keys, feedback text, learner data or credentials. Reading questions/feedback for hashing happens only in memory. No app imports, migrations, writes to production, shadow enrollment or Phase 3 changes are introduced.
