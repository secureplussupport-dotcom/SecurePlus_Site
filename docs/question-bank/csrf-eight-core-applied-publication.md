# Eight CSRF questions

The owner supplied two Core and six Applied MCQs. The question wording, options, answer keys, and explanations were imported as supplied. Each has the sole concept tag `att.app-csrf`.

| ID | Difficulty | Focus | Correct option |
|---|---|---|---|
| m773 | Core | Forged authenticated form submission | C |
| m774 | Core | Anti-CSRF synchronizer token | A |
| m775 | Applied | Browser-sent ambient credentials | D |
| m776 | Applied | SameSite cookie restriction | B |
| m777 | Applied | Missing-token validation bypass | C |
| m778 | Applied | State-changing HTTP GET | A |
| m779 | Applied | XSS bypassing CSRF token protection | D |
| m780 | Applied | Re-authentication for sensitive updates | B |

The payloads in `csrf-eight-core-applied.json` were inserted into the live Question Manager `question_overrides` table in one database transaction, with one matching `add` entry each in `question_override_history`. No application deployment or schema change was needed. The import was not attributed to a human account.

Preflight found no live ID or exact-stem conflicts. Post-write database comparison matched all eight payloads exactly and found one matching addition-history entry per ID. The public guest MCQ page displayed 441 questions, up from 433, including 111 in Chapter 2, up from 103. The effective catalogue and refreshed coverage calculation also contain 441 MCQs.

These eight single-tag questions close the `att.app-csrf` Core and Applied gaps. The overall calculated additions across grouped concepts fell from 335 to 327; see `docs/mcq-bank-additions-core-applied.md`.
