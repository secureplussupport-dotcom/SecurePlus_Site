# One DDoS question

The owner supplied one Core MCQ. Its wording, options, answer key, and explanations are preserved in `ddos-one-core.json` as `m819` (correct option C), with the sole tag `att.dos-ddos`.

The publication preflight passed (SHA256 `c31db90630d1c8a6c0dd58662486e231bed045ba61f901705c89ccf28449b34d`; 137 existing live override rows checked). The question was added to live `question_overrides` with one matching `add` record in `question_override_history`. Database readback matched the payload exactly. The refreshed public MCQ page displayed 480 questions, up from 479. No application deployment or schema change was needed.

The `att.dos-ddos` Core benchmark gap fell from one to zero. The remaining grouped-concept additions fell from 285 to 284; see `docs/mcq-bank-additions-core-applied.md`.
