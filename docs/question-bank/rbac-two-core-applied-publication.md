# Two RBAC questions

The owner supplied one Core and one Applied MCQ. Wording, options, answer keys, and explanations are preserved in `rbac-two-core-applied.json`; each has the sole tag `iam.rbac`.

| ID | Difficulty | Correct option |
|---|---|---|
| m791 | Core | C |
| m792 | Applied | A |

Both payloads passed the publication preflight (SHA256 `158c6cd7d1c0b83ea8397b8d1210db536851cde83788950f00f0177c8cc822f6`; 109 existing live override rows checked). They were added to live `question_overrides`, with one matching `add` row each in `question_override_history`. The database readback matched both payloads exactly, and the refreshed public MCQ page showed 453 questions, up from 451. No application deployment or schema change was needed.

The `iam.rbac` benchmark gap fell from 1 Core and 1 Applied to zero in both levels. The overall grouped-concept additions fell from 322 to 320 at this publication step; see `docs/mcq-bank-additions-core-applied.md`.
