# Fast MCQ batch publishing

Use one JSON file per owner-supplied batch, in the same shape as `fido2-passwordless-four-core-applied.json`. Keep the owner's wording, four options, answer index, explanation, wrong-option feedback, Core/Applied level, and concept tags in that file. PBQs are outside this workflow.

1. Read the supplied questions once. Extract the batch to `docs/question-bank/<batch>.json`. If the owner says to publish without an accuracy review, preserve their content; still check the data structure. Do not echo the full question text back into the chat.
2. Fetch a fresh MCQ `question_overrides` snapshot. Run `node scripts/prepare-mcq-publication.mjs docs/question-bank/<batch>.json --existing <snapshot.json>`. The command prints one compact line with IDs, level counts, a payload hash, and any failure. The snapshot must be current; `existing not checked` is not publication clearance.
3. Publish all passing rows together through the existing Question Manager tables. Each `question_overrides` row uses `question_kind=mcq`, `question_id=<id>`, `action=upsert`, `status=active`, and the exact JSON object as `payload`. Create one corresponding `question_override_history` `add` row per question in the same transaction. Do not attribute a system import to a human account.
4. Fetch only the published IDs and their `add` history. Run the command again with the **pre-publication** snapshot plus `--readback <rows.json> --history <history.json>`. Exact payloads and one addition record per ID must match. Then check the effective catalogue count and one public MCQ page count before claiming the batch is live.
5. Refresh `docs/mcq-bank-additions-core-applied.md` from the new live snapshot. Report only IDs, Core/Applied counts, tag, before/after benchmark gap, and whether live readback passed. Keep the JSON as the durable content record; a short publication note is enough.

The checker makes validation and readback concise; it does not write to Supabase or prove live delivery on its own. Stop on a collision or mismatch rather than silently editing an existing question.
