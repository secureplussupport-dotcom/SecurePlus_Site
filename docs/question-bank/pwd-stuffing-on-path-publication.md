# Password-stuffing and on-path MCQs

The owner supplied 11 questions in one attachment. The full wording, four options, answers, and explanations are preserved in `pwd-stuffing-seven-core-applied.json` and `on-path-four-applied.json`.

| Concept tag | IDs | Core | Applied | Correct options |
|---|---|---:|---:|---|
| `att.pwd-stuffing` | m794–m800 | 1 | 6 | B, A, C, D, B, A, C |
| `att.on-path-mitm` | m801–m804 | 0 | 4 | B, D, A, C |

Both batches passed the publication preflight against 112 existing live override rows. SHA256 hashes were `a8e6f371c37edf6ae3e373cde6f6758e7efa33b5a93d5fa1c910d40f9a26babd` and `fb5b9e17eae4b9310d62181f1a9c9cc9e2fa026f1bf1a5a0a846904f903e236b`. All 11 were inserted into live `question_overrides` in one transaction with one matching `add` record each in `question_override_history`. Database readback matched every payload exactly. The refreshed public MCQ page displayed 465 questions, up from 454. No application deployment or schema change was needed for the questions.

With the owner's same-turn move of `cry.diffie-hellman`, `net.wifi-802-1x`, and `arch.shared-resp` to Standard, the calculated grouped-concept additions fell from 319 to 310. The 11 new questions then brought the remaining gap to 299; both supplied attack tags now meet their Core and Applied minima. See `docs/mcq-bank-additions-core-applied.md`.
