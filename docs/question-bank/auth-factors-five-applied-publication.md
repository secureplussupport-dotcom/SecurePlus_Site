# Five Applied authentication-factor questions

The owner supplied five MCQs and requested publication without an accuracy review. Their question text, options, answer keys, and explanations were imported as supplied. Each question has the sole concept tag `iam.auth-factors` and the `applied` difficulty.

| ID | Focus | Correct option |
|---|---|---|
| m740 | Password and security questions | B |
| m741 | Behavioral authentication factor | D |
| m742 | RFID badge and smart card | A |
| m743 | Location policy | C |
| m744 | Local face unlock and VPN factors | B |

The five payloads in `auth-factors-five-applied.json` were inserted into the existing live `question_overrides` table with corresponding `add` entries in `question_override_history`. No application deployment or schema change was required. The database import did not attribute the change to a human account.

Validation: IDs were unused locally and in the live override table. Readback matched all five payloads exactly, and each has one addition-history entry. The effective MCQ catalogue loads 405 questions, including the five new Applied questions. The public MCQ practice page displays 405 questions, up from 400, and Chapter 4 displays 117, up from 112.

The refreshed coverage calculation uses the owner's 0.5 credit rule for questions with multiple concept tags. `iam.auth-factors` now meets its Heavy weight minimum; the full report is `docs/mcq-bank-additions-core-applied.md`. The five new single-tag questions reduced the total calculated additions from 377 to 372.
