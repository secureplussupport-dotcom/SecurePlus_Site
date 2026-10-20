# Four Applied SQL injection questions

The owner supplied four Applied MCQs. Their wording, options, answer keys, and explanations were imported as supplied. Each has the sole concept tag `att.app-sqli`.

| ID | Focus | Correct option |
|---|---|---|
| m762 | Blind SQL injection | A |
| m763 | Numeric-input filter bypass | C |
| m764 | Database-account least privilege | B |
| m765 | Parameterized queries | D |

The payloads in `sqli-four-applied.json` were inserted into the live Question Manager `question_overrides` table in one database transaction, with one matching `add` entry each in `question_override_history`. No application deployment or schema change was needed. The import was not attributed to a human account.

Preflight found no live ID or exact-stem conflicts. Post-write database comparison matched all four payloads exactly and found one matching addition-history entry per ID. The public guest MCQ page displayed 426 questions, up from 422, including 96 in Chapter 2, up from 92. The effective catalogue and refreshed coverage calculation also contain 426 MCQs.

These four single-tag Applied questions close the `att.app-sqli` Applied gap. The overall calculated additions across grouped concepts fell from 346 to 342; see `docs/mcq-bank-additions-core-applied.md`.
