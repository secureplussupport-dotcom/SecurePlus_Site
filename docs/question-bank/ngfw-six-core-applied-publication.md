# Six NGFW questions

The owner supplied one Core and five Applied MCQs. Their wording, options, answer keys, and explanations are preserved in `ngfw-six-core-applied.json`, each with the sole tag `net.app-ngfw`.

| IDs | Core | Applied | Correct options |
|---|---:|---:|---|
| m820–m825 | 1 | 5 | C, A, D, B, C, A |

The batch passed publication preflight (SHA256 `e02243366a7b3da29f47dbe997d4a17548969a3957bbcd6719792bbac5205c5c`; 138 existing live override rows checked). All six were inserted into live `question_overrides` in one transaction with one matching `add` row each in `question_override_history`. Database readback matched every payload exactly. The refreshed public MCQ page displayed 486 questions, up from 480. No app deployment or schema change was needed.

The `net.app-ngfw` Core and Applied benchmark gaps both fell to zero. The remaining grouped-concept additions fell from 284 to 278; see `docs/mcq-bank-additions-core-applied.md`.
