# Logs/syslog MCQ publication

Published seven owner-supplied `ops.logs-syslog` questions on 2026-10-21: two Core (`m855`–`m856`) and five Applied (`m857`–`m861`). Correct options in order: B, D, C, A, B, D, B. The supplied wording and feedback are preserved in [`logs-syslog-seven-core-applied.json`](logs-syslog-seven-core-applied.json); validation covered structure and publication integrity rather than factual accuracy.

Preflight passed against 173 live MCQ overrides, with no ID or stem collisions. The seven active upserts and their seven addition-history records were inserted atomically without human attribution. Both administrative readback and the public anonymous API returned exact matching payloads. Canonical payload SHA-256: `6b231dc5a8ba297a31038af0d215eb87504367c572b8ece73224669eeb10db4b`.

The production merge now contains 522 MCQs (251 Core, 271 Applied), including 180 active live override records. `ops.logs-syslog` has two Core and six Applied weighted questions, so its benchmark shortfall fell from seven to zero. The overall shortfall fell from 249 to 242 (106 Core, 136 Applied); see [`../mcq-bank-additions-core-applied.md`](../mcq-bank-additions-core-applied.md). The redesigned public MCQ page intentionally hides bank totals, so public delivery was verified through the anonymous content API rather than a visible total.
