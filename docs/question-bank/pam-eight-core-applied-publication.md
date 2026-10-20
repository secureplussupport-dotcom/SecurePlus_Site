# Eight PAM questions

The owner supplied two Core and six Applied MCQs. The question wording, options, answer keys, and explanations were imported as supplied, without an accuracy review. Each has the sole concept tag `iam.pam`.

| ID | Difficulty | Focus | Correct option |
|---|---|---|---|
| m754 | Core | Credential vault and rotation | B |
| m755 | Core | Just-in-time access | D |
| m756 | Applied | Shared account session attribution | A |
| m757 | Applied | Break-glass account alerting | C |
| m758 | Applied | Post-session credential rotation | B |
| m759 | Applied | Multi-party approval | D |
| m760 | Applied | Temporary elevation against cached credentials | A |
| m761 | Applied | Pipeline secrets vault | C |

The payloads in `pam-eight-core-applied.json` were inserted into the live Question Manager `question_overrides` table in one database transaction, with one matching `add` entry each in `question_override_history`. No application deployment or schema change was needed. The import was not attributed to a human account.

Preflight found no live ID or exact-stem conflicts. Post-write database comparison matched all eight payloads exactly and found one matching addition-history entry per ID. The public guest MCQ page displayed 422 questions, up from 414, including 134 in Chapter 4, up from 126. The effective catalogue and refreshed coverage calculation also contain 422 MCQs.

These eight single-tag questions close the `iam.pam` Core and Applied gaps. The overall calculated additions across grouped concepts fell from 354 to 346; see `docs/mcq-bank-additions-core-applied.md`.
