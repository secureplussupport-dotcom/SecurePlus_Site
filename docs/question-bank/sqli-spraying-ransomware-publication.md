# SQL injection, password spraying, and ransomware MCQs

The owner supplied 14 MCQs in three messages. Their wording, options, keys, and explanations are preserved in `sqli-one-applied.json`, `pwd-spraying-seven-core-applied.json`, and `ransomware-six-applied.json`.

| Concept tag | IDs | Core | Applied | Correct options |
|---|---|---:|---:|---|
| `att.app-sqli` | m805 | 0 | 1 | A |
| `att.pwd-spraying` | m806–m812 | 2 | 5 | C, A, D, B, C, A, D |
| `att.mal-ransomware` | m813–m818 | 0 | 6 | C, A, D, B, C, A |

Each batch passed publication preflight against 123 existing live override rows. Their SHA256 hashes were `2f9a15de690b325a69be46d73398504473ed46843e08261cd7c41ed43cf64fa8`, `170d751573998b599fc70883f59f8d591d3a860582b2a6b38732dbd3eaa378a8`, and `8088f92598b3ade5f120179dfefc20c7ef61e10170d9af3bb64850b1bc91f12e`. All 14 were inserted into live `question_overrides` in one transaction, each with one matching `add` entry in `question_override_history`. Database readback matched every payload exactly. The refreshed public MCQ page displayed 479 questions, up from 465. No app deployment or schema change was needed.

All three supplied tags now meet their Core and Applied minimums. The remaining grouped-concept additions fell from 299 to 285; see `docs/mcq-bank-additions-core-applied.md`.
