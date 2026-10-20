# Eight SSRF questions

The owner supplied two Core MCQs in the message and six Applied MCQs in the attachment. The wording, options, answer keys, and explanations were imported as supplied. Markdown links in three question stems were rendered as their visible URLs for plain-text display. Each question has the sole concept tag `att.app-ssrf`.

| ID | Difficulty | Focus | Correct option |
|---|---|---|---|
| m781 | Core | Internal server request | C |
| m782 | Core | Destination URL allowlist | A |
| m783 | Applied | Cloud metadata endpoint | B |
| m784 | Applied | Private-subnet egress control | C |
| m785 | Applied | URL scheme restriction | A |
| m786 | Applied | Alternate loopback address format | B |
| m787 | Applied | Backend-server trust boundary | C |
| m788 | Applied | Metadata session token | A |

The payloads in `ssrf-eight-core-applied.json` were inserted into live Question Manager `question_overrides` in one transaction, with one `add` row per question in `question_override_history`. The import was not attributed to a human account. No application deployment or schema change was needed.

Preflight found no live ID or exact-stem conflicts. Post-write comparison matched all eight payloads exactly and found one matching addition-history row per ID. The public guest MCQ page displayed 449 questions, up from 441, including 119 in Chapter 2, up from 111. The effective catalogue and refreshed coverage calculation also contain 449 MCQs.

These eight single-tag questions close the `att.app-ssrf` Core and Applied gaps. The overall calculated additions across grouped concepts fell from 327 to 319; see `docs/mcq-bank-additions-core-applied.md`.
