# Four FIDO2 passwordless questions

The owner supplied four MCQs: two Core and two Applied. Question wording, options, answer keys, and explanations were imported as supplied, without an accuracy review. Each has the sole concept tag `iam.fido2-passwordless`. The existing acronym glossary supplies terms such as SAML; no new glossary keywords were added.

| ID | Difficulty | Focus | Correct option |
|---|---|---|---|
| m745 | Core | Relying-party public key | A |
| m746 | Core | Client-to-authenticator protocol | D |
| m747 | Applied | Phishing-site origin binding | B |
| m748 | Applied | Relying-party database breach | C |

The payloads in `fido2-passwordless-four-core-applied.json` were inserted into the existing live Question Manager `question_overrides` table, with four matching `add` entries in `question_override_history`. No app deployment or database schema change was needed. The database import was not attributed to a human account.

Readback matched all four payloads exactly, and each has one addition-history entry. The public MCQ page displays 409 questions, up from 405, with 121 in Chapter 4, up from 117. The effective catalogue and refreshed coverage calculation also contain 409 MCQs.

Using the owner's 0.5 credit rule for multi-tag questions, `iam.fido2-passwordless` now has 2 Core and 3.5 Applied credits. This meets its Standard minimum of 2 Core and 3 Applied. The remaining single-tag additions across all grouped concepts fell from 369 to 365; see `docs/mcq-bank-additions-core-applied.md`.
