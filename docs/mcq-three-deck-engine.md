# Three-deck MCQ engine

This replaces the prior MCQ review algorithm under the owner's 20 October 2026 specification. Existing Gemini tags, the Question Manager tag menu, auto-tagging, and multiple-tag editing remain. PBQs never enter its scorecard, history, cooldown or selection.

## Behavior

- Sets contain 10, 20 or 30 distinct MCQs, prepared and stored upfront. The selector supports every integer from 10 through 30.
- Deck 1 targets rounded 20%: eligible failed questions, oldest failure first. Unfilled capacity passes to Deck 2.
- Deck 2 targets rounded 30% plus that capacity: unseen questions for recorded weak concepts, lowest score first. Unfilled capacity passes to Deck 3.
- Deck 3 fills the rest with unseen questions. Unmastered/unseen concepts have sampling weight 1; mastered concepts have weight 0.5. After unseen supply is exhausted, seen questions are ordered by lowest current score, then oldest last exposure. Each question appears once per set.
- Scores start at 50, gain 20 on correct answers and lose 35 on incorrect answers, bounded to 0–100. A score of 80 is mastered.
- A wrong answer first decrements existing buffers, then sets this question's counter to 30. Thirty **subsequent** completed MCQ submissions make it eligible. Retried HTTP requests never advance the counter twice. Another wrong answer resets it to 30. A correct submission removes its buffer row, as specified in the per-answer transaction rules.
- Quarantined questions cannot sneak into an adaptive set through exhaustion fallback. If fewer than the requested distinct eligible questions remain, generation returns a clear shortage rather than returning duplicates or shortening the set. Existing generated sets remain fixed; quarantine is checked at generation.
- Both the question sequence and option sequence use Fisher-Yates. The adaptive screen stores selected option UUIDs, and grading uses a private, immutable session snapshot. Generation/resume payloads exclude answer keys and explanations for unanswered items; answered feedback includes the correct option ID and explanation.

The prose rules take precedence where the provided pseudocode differs: weakest-first remediation, weakest/oldest fallback, and quarantine protection. Rounding uses nearest integer with halves rounded upward.

## Tags and existing progress

The specification has one scored concept per question. The engine uses the imported primary tag when it is still selected in Question Manager, otherwise the first selected valid tag. Secondary and distractor classifications remain in the tag data; they do not receive extra scoring credit. BIA/RTO/RPO remain one `risk.bia-rto-rpo` group as approved by the owner. An intentionally untagged question remains available to manual practice but is excluded from adaptive generation until tagged.

The server catalogue contains all 395 effective local MCQs and merges current active Question Manager publications at request time. New correctly tagged manager MCQs can therefore enter without a frontend redeploy. Option IDs change when their question/option/answer revision changes. Each generated session keeps its original source snapshot so later edits cannot change an in-progress answer key.

The new scorecard starts from new server-verified submissions. Existing attempts, reports and tagging are preserved; old client-reported correctness is not silently imported as verified mastery. Signed-in random/starred practice, daily MCQs, diagnostic MCQs and submitted exam MCQs feed the same counter. An exam draft is not a completed submission; answered MCQs are recorded when the exam is submitted. PBQ portions stay outside the engine.

The legacy client still includes question content/keys for guest and manual practice. This change strips secrets from the **new adaptive API**, not from the entire existing website bundle. It is not an exam-security or anti-cheating guarantee.

## Persistence and endpoints

Migration: `supabase/migrations/20261019163949_mcq_three_deck_engine.sql`.

Private schema `mcq_engine` stores question snapshots, per-user mastery, failed buffers, sessions and history. User state references `auth.users` with deletion cascades. Tables have RLS and no browser-role grants. Only the authenticated server's service role can call the four RPCs. The public API verifies the bearer token and ignores submitted owner IDs. Service credentials never reach the client.

- `POST /api/sessions/generate`: `{set_size, filters?}` → `{session_id, version, questions}`.
- `POST /api/sessions/answer`: `{session_id?, event_id, question_id, selected_option_id}` → evaluation. Stable event IDs and one answer per owned session question make retries idempotent. The optional session ID allows other published MCQ modes to use the same atomic state transition.
- `POST /api/sessions/state`: the current user's scorecard, buffers and last-seen question IDs.
- `POST /api/sessions/resume`: `{session_id}` → the owned set and its already saved evaluations.

Each answer transaction locks a per-user owner row, validates the private option, updates all counters, updates the primary score, handles the buffer, writes history and advances a state version. Any error rolls all changes back. Generation checks this version before committing its batch and retries if an answer changed state during selection. No runtime from `server/adaptive` is used by these endpoints.

## Verification and delivery

Run `npm run audit:mcq-engine` and `npm run audit:mcq-engine:database`. The latter runs the actual migration and API → SQL flow on disposable PostgreSQL in WASM (PGlite), with no external database connection. It verifies delay boundaries, bounds, idempotency, rollback after a late failure, owner isolation, stale-state rejection, pinned grading and browser-role denial. Also run `npm run audit`, `npm run audit:content-mapping`, and a production build with `VITE_MCQ_ENGINE_ENABLED=true`.

`node scripts/preview-mcq-engine.mjs` starts a loopback-only preview on port 5198 with a disposable test user, the actual MCQ screen, 395 local sources, API handler and SQL functions. The preview mocks authentication only and has no connection to live accounts. It prints a local URL. Stopping it discards its database and temporary page.

The preview inspection sidebar shows the active question's scored primary tag, secondary tags and distractor tags, each question's actual stored Retest/Remediation/Discovery allocation, and the current encountered concepts below 80 with their scores. Its Start another set button calls the same generator. Inspection fields and event hooks exist only in the loopback preview; production payloads and screens are unchanged. Set `MCQ_PREVIEW_PORT` to choose another local port. Run `node scripts/test-mcq-preview-inspection.mjs` to verify the metadata projection excludes grading keys.

Local browser verification on 20 October: generated ten MCQs, submitted a wrong answer, observed server feedback, reloaded the page and resumed the same saved answer.

Activation is off by default in source. The owner approved production rollout on 20 October 2026; both production flags are now `true`.

### Production delivery, 20 October 2026

- Source commit: `6635b45a5364b825772c0b0f12201c86901b8a80`, deployed from a clean Git archive. Unrelated local Android/generated/draft files were excluded.
- Vercel deployment: `dpl_6toHqcALqRKWpjLUneugh9pe3M8C`, Ready and promoted to https://www.secureplusprep.com/. Unique deployment: https://secure-plus-site-kij0978m6-secureplussupport-dotcoms-projects.vercel.app.
- Migration applied to Supabase project `uscaqeymulsaeqxjvbfq`. Migration SHA256: `3407f4a67fff20fab2b9baf6e10ed77ad148eb05ddcdbe8285085a6298be152f`.
- All six engine tables have RLS enabled; anon/authenticated lack table access and RPC execution, while service_role can execute the four RPCs. Security advisor reports the intentionally policy-free private tables as INFO only.
- A real PostgreSQL transaction verified ten-question session creation, wrong-answer score 15, cooldown 30, retry idempotency, state version 1 and owned-session retrieval. The transaction was rolled back; a follow-up confirmed zero test users/questions/sessions remained. The first smoke attempt used one question and correctly hit the minimum-set-size validation before being corrected to ten.
- All four public POST routes return the expected unauthenticated 401. An invalid bearer token returns the expected sign-in-again 401, rather than a configuration failure.
- Public HTML serves `/assets/main-j-VIc6_r.js`, which contains the new session API and 30-other-MCQ copy and excludes the preview inspector marker. The live browser opened a 30-question guest MCQ set with 395 available questions. Screenshot: `output/mcq-engine-live-release.png` (local, untracked).
- Verification limit: no authenticated browser account was available. Hosted authenticated generate/answer/resume through HTTP has not been exercised; the corresponding local API-to-PostgreSQL flow and live SQL functions passed separately. Guest practice is not evidence of adaptive selection.

Rollback: disable both production flags, rebuild and redeploy (the frontend flag is a build-time value), or promote the prior deployment `dpl_6wn9Czz7Z4mgToWCbkUvnCcDFcZR`. Leave the new tables intact so recorded progress remains recoverable. Prior deployment URL: https://secure-plus-site-dvk28hykb-secureplussupport-dotcoms-projects.vercel.app.
