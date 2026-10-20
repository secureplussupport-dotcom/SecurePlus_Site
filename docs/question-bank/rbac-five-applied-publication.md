# Five Applied RBAC questions

The owner supplied five MCQs and requested publication without an accuracy review. The supplied question wording, options, answer keys, and explanations were imported as supplied. Each has the sole concept tag `iam.rbac` and the `applied` difficulty.

| ID | Focus | Correct option |
|---|---|---|
| m749 | Hierarchical role inheritance | B |
| m750 | Dynamic separation of duties | A |
| m751 | Role explosion | D |
| m752 | Static roles versus runtime context | C |
| m753 | Role removal after job transfer | A |

The payloads in `rbac-five-applied.json` were inserted into the live Question Manager `question_overrides` table in one database transaction, with one matching `add` entry each in `question_override_history`. No application deployment or schema change was needed. The import was not attributed to a human account.

Preflight found no live ID or exact-stem conflicts. Post-write database comparison matched every payload exactly and found one matching addition-history entry per ID. The public guest MCQ page displayed 414 questions, up from 409, including 126 in Chapter 4, up from 121. The effective catalogue and refreshed coverage calculation also contain 414 MCQs.

These five single-tag Applied questions close the `iam.rbac` Applied gap from 5 to 0. The overall calculated additions across grouped concepts fell from 359 to 354; see `docs/mcq-bank-additions-core-applied.md`.
