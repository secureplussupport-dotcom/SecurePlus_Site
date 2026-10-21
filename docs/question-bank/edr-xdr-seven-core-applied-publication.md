# EDR/XDR MCQ publication

Published seven owner-supplied questions on 2026-10-21 under the existing `ops.edr-xdr` tag: one Core (`m848`) and six Applied (`m849`–`m854`). Correct options in order: B, C, A, D, B, C, D. The exact wording, options, explanations, and wrong-option feedback are preserved in [`edr-xdr-seven-core-applied.json`](edr-xdr-seven-core-applied.json); this batch received structural validation rather than an editorial accuracy review.

The publication checker passed against a fresh 166-row MCQ override snapshot with no ID or stem collisions. All seven active `upsert` records and their seven `add` history records were inserted atomically, with no human attribution. Exact live readback and history matched the prepared payload; canonical payload SHA-256: `cede554842a7b6bca48409340563d6e7125edff291617dc1ce44f96f390358a4`.

The refreshed public MCQ page shows 515 questions (previously 508), with Chapter 4 increasing from 142 to 149. Recalculating the production merge from all 173 active live MCQ overrides gives 249 Core and 266 Applied questions. `ops.edr-xdr` now has two Core and six Applied single-tag questions, meeting both minima. Its gap fell from seven to zero; the total benchmark shortfall fell from 256 to 249 (108 Core, 141 Applied). See [`../mcq-bank-additions-core-applied.md`](../mcq-bank-additions-core-applied.md).
