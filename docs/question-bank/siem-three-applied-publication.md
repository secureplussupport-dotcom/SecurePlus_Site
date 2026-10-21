# SIEM Applied MCQ publication

On 2026-10-21, three owner-supplied, single-tag Applied MCQs were added to the live Question Manager as `m845`–`m847`. The durable question, option, answer, and explanation payload is in [`siem-three-applied.json`](siem-three-applied.json). The questions were published as supplied, without an editorial accuracy review.

| ID | Tested concept | Correct option | Tag | Difficulty |
|---|---|---|---|---|
| m845 | SIEM field normalization | C | ops.siem | Applied |
| m846 | Time synchronization in event correlation | A | ops.siem | Applied |
| m847 | User and entity behavior analytics | D | ops.siem | Applied |

Prepublication validation found no ID or stem collision among 163 active live MCQ overrides. One atomic database statement inserted the three `add` overrides and their three history records. Exact live readback and history matched the prepared payload. The publication check reported payload SHA-256 `56d3ba9705ec9575ae14855d0342fcd9949ab6742d1aa1e3debe5ff37c0037df` (the JSON file-byte SHA-256 is `4ac7e605b6a2b3a71980b4bb334d7ba3460c0c79c3cd6862368eea90ababc5fa`).

After refreshing the public MCQ page, its visible count rose from 505 to 508 and Chapter 4 from 139 to 142. The effective bank is now 248 Core and 260 Applied MCQs. The `ops.siem` benchmark shortfall fell from three Applied questions to zero; the overall single-tag shortfall fell from 259 to 256 (109 Core, 147 Applied). This publication changed question content only; it did not change the app, schema, algorithm, or PBQs.
