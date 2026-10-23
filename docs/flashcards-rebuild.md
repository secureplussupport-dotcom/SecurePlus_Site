# Term-first flashcard library — 23 October 2026

The owner-supplied inventory is the source for 502 cards in 35 curated decks, all within the requested 10–20 range (actual range: 13–16). Five printed deck counts in the attachment differed from their row lists; counts now come directly from the cards.

## Content and identity

`src/data/sy0701_flashcard_seed.json` is the single content source. Its JSON schema and TypeScript declaration describe the structure; the schema is validated in both audit and prebuild. Every card has stable identity, keyword aliases and exact links to existing MCQ concept tags. Broad multi-tag source headings are narrowed for explicit keywords (for example, SSRF uses `att.app-ssrf`, SOAR uses `ops.soar`, AES uses `cry.sym-aes`). No new tags, question assignments or relationship web were introduced.

All 313 prior card IDs and their existing definitions are retained, with 189 additional cards whose definitions remain empty strings. No LLM generation, backend authoring interface or database seeding was performed. Existing progress and stars still reference the same IDs. Old deck links resolve to the first new deck containing their original cards. Existing saved mix IDs remain usable; saved preferences cannot bring back retired directions.

The five top-level names match the official SY0-701 domains. The supplied subdomains are custom study sections, not claimed official objective numbers. RBAC role/rule meanings and the certificate/storage meanings of SAN retain separate identities.

## Recall and personalised review

Every entry point opens directly in Test by term. Front: term or abbreviation only, with no acronym expansion or definition. Back: full form where known, then the definition and linked concept tags. Screen readers see only the active face. Pending definitions display a clear placeholder; those cards cannot be newly marked remembered until the definition is provided.

Personalised review reads the existing authenticated MCQ engine state, for Free and Pro. `wrong_streak >= 2` includes every card with the exact concept tag. Other topics do not reset that streak; a correct answer on that concept does. There is no keyword similarity or chapter fallback in the personalised selection. Multiple qualifying tags never duplicate a card. Large review queues are balanced into batches of no more than 20 without dropping matches. A qualifying queue with fewer than 10 cards remains a short review queue; unrelated cards are not invented to pad it. Curated decks always meet the 10–20 requirement.

Signed-in progress comes from the user's existing flashcard records, never another account's local fallback. Guests retain local progress and the existing signup bridge. A failed state request shows an unavailable state, not a fabricated empty review. No new migration, privilege, billing change or PBQ change is required.

## Verification

- Seven executable bank checks: strict schema and malformed input, all 502 records, all 313 prior IDs/definitions, legacy links, term faces and pending entries, exact-tag streak selection/reset, and lossless batching for sizes 0–502.
- Disposable PostgreSQL integration: actual persisted two-miss state selects the full expected card collection and is isolated from another user; existing score, pacing, quota and ownership checks retained.
- Site audit, all 47 MCQ checks, production build and diff whitespace checks.
- Browser checks: direct deck open, front/back, pending definition, tag search, small-screen layout and existing star availability. No real learner answers or progress were created for verification.
