# Five Applied MFA questions

Owner supplied five questions and requested publication as Applied MCQs with the sole concept tag `iam.mfa`.

Published directly to the existing live Question Manager `question_overrides` table, with five corresponding `add` entries in `question_override_history`, in one transaction. No existing questions or PBQs were changed. The import uses system/database access under the owner's request; no human account identity is attributed in the history actor fields.

| ID | Scenario | Difficulty | Sole concept tag | Correct option |
|---|---|---|---|---|
| m735 | Password plus security question | Applied | iam.mfa | A |
| m736 | Push fatigue and number matching | Applied | iam.mfa | C |
| m737 | Real-time phishing relay and FIDO2 | Applied | iam.mfa | B |
| m738 | Impossible-travel step-up authentication | Applied | iam.mfa | D |
| m739 | Smart cards left in readers | Applied | iam.mfa | A |

The published content is reproduced in `mfa-five-applied.json`. Answer letters were retained. Technical edits before publication:

- Number matching mitigates blind push approval; it does not guarantee protection from phishing/social engineering or require all authenticator apps to have an out-of-band connection. [CISA number-matching guidance](https://www.cisa.gov/sites/default/files/publications/fact-sheet-implement-number-matching-in-mfa-applications-508c.pdf).
- The phishing-resistance explanation uses relying-party/origin binding, and the FIDO2 key option explicitly requires PIN/biometric user verification. SMS delivery does not make a relayed code origin-bound. [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html).
- Risk-based step-up is framed as gating a suspicious sign-in, rather than automatically resolving every already-compromised session.
- A card plus PIN remains two factors even if the card is left in the reader. Leaving it available weakens custody of the possession factor. Removed the unsupported universal 3–5 PIN retry limit and automatic non-repudiation guarantee. [NIST authenticator requirements](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/).

Validation: new IDs unused locally and in the live table; no exact stem duplicates; four options and specific feedback for each distractor; safe payload validation; effective server catalogue loads all five as single-tag Applied MCQs with keys A/C/B/D/A. Post-write readback matched every payload, and each question has one change-history entry. Live browser shows 400 MCQs (previously 395), including 112 in Chapter 4 (previously 107). The base repository catalogue still has its 395 original questions; the five active Question Manager publications are merged at runtime without a new deployment. No runtime code or database schema change was needed.

Coverage after publication, using the owner's multi-tag 0.5 rule: `iam.mfa` has 4.5 Core and 6.5 Applied weighted questions, meeting minimums 2 and 6. The five new questions each have exactly one tag and contribute one Applied credit each. The full additions report is refreshed at `docs/mcq-bank-additions-core-applied.md`: 377 single-tag questions remaining (127 Core, 250 Applied).
