# Seven XSS questions

The owner supplied two Core and five Applied MCQs. The question wording, options, answer keys, and explanations were imported as supplied. Each has the sole concept tag `att.app-xss`.

| ID | Difficulty | Focus | Correct option |
|---|---|---|---|
| m766 | Core | Stored XSS | B |
| m767 | Core | Context-aware output encoding | A |
| m768 | Applied | Reflected XSS | D |
| m769 | Applied | DOM-based XSS and URL fragments | C |
| m770 | Applied | Content Security Policy | B |
| m771 | Applied | HttpOnly cookie flag | A |
| m772 | Applied | HTML event-handler bypass | D |

The payloads in `xss-seven-core-applied.json` were inserted into the live Question Manager `question_overrides` table in one database transaction, with one matching `add` entry each in `question_override_history`. No application deployment or schema change was needed. The import was not attributed to a human account. The example HTML strings are rendered by React as text in the question UI.

Preflight found no live ID or exact-stem conflicts. Post-write database comparison matched all seven payloads exactly and found one matching addition-history entry per ID. The public guest MCQ page displayed 433 questions, up from 426, including 103 in Chapter 2, up from 96. The effective catalogue and refreshed coverage calculation also contain 433 MCQs.

These seven single-tag questions close the `att.app-xss` Core and Applied gaps. The overall calculated additions across grouped concepts fell from 342 to 335; see `docs/mcq-bank-additions-core-applied.md`.
