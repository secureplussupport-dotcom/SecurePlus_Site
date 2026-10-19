# MCQ tagging replacement — 20 October 2026

The owner supplied one Gemini classification for each of the 395 active MCQs. This replaces the earlier MCQ tag IDs. The supplied file's SHA-256 is `926cda35788960c82c834e4713352947fcf810ce217394d9844aee2b9f398cec`; the imported version is `gemini-mcq-tags-2026-10-20`.

Smart Review uses the supplied primary and secondary tags as exact-match mastery tags. The 635 distractor references, cognitive levels and difficulty weights are retained as metadata, but do not schedule questions or change scores. No concept relationships are used. A missed MCQ reserves another available MCQ with the same tag and keeps the original missed question in review until its latest answer is correct, subject to set size. PBQs are excluded.

The import contains 170 distinct tag IDs, 155 of which appear in a primary or secondary role, and 940 mastery-tag assignments. All 395 MCQs have at least one other MCQ sharing a mastery tag. This is coverage, not a claim that Gemini's semantic classifications have been independently fact-checked. Nineteen mastery tags occur on only one question, and 44 primary tags have only one primary question. The supplied taxonomy combines BIA, RTO and RPO as `risk.bia-rto-rpo`; it cannot separately measure RTO versus RPO mastery. The owner requested that taxonomy and no relationship web.

Current Question Manager saves made with this version take precedence over the import, including an intentional empty tag list. Older saved tag IDs fall back to the replacement assignment. The live override census checked on 20 October had 51 active MCQ upserts and two disables, unchanged since the question export. No database rows were changed by this import.

The separate five-concept adaptive release candidate remains default-off and is not coverage proof for the new 170-tag system. This change does not activate its trusted runtime or publish new questions.
