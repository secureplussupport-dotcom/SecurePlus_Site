# Two MFA questions

The owner supplied one Core and one Applied MCQ. Wording, options, answer keys, and explanations are preserved in `mfa-two-core-applied.json`; each has the sole tag `iam.mfa`.

| ID | Difficulty | Correct option |
|---|---|---|
| m789 | Core | C |
| m790 | Applied | B |

Both payloads passed the publication preflight (SHA256 `ada390ce52c21eba5512bf2abdc515f7ce15800f854cdcf3b9a7125ddbec8fa3`; 107 existing live override rows checked). They were added to live `question_overrides`, with one matching `add` row each in `question_override_history`. The database readback matched both payloads exactly, and the refreshed public MCQ page showed 451 questions, up from 449. No application deployment or schema change was needed.

The `iam.mfa` benchmark gap fell from 1 Core and 1 Applied to zero in both levels. The overall grouped-concept additions fell from 324 to 322 at this publication step.
