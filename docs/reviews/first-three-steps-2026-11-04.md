# First three steps — 4 November 2026

New accounts created on/after 4 November 2026 00:00 UTC receive a starter challenge at the top of Dashboard. Existing accounts are not enrolled. It is independent of the archived Study Plan.

The challenge records three real completion events:

1. Finish one MCQ practice set or exam. Importing a guest diagnostic does not complete this step.
2. Mark any Concept Deep Dive complete through its existing completion control.
3. Rate every card in any flashcard deck. Opening the deck alone is insufficient.

While the challenge is unfinished, Dashboard hides its practice/readiness hero. Other tools remain accessible. New diagnostic signups land on Dashboard. Recommendations reuse exact diagnostic weak concept tags and existing concept-to-lesson/card mappings. Matching lessons and decks have a Recommended badge; users may choose any lesson or deck. Recommended lesson domains open by default on the first library visit, and the continue-learning card prioritises a matching lesson without overriding saved filters.

The progress card disappears after durable completion. A Cipher celebration marks the achievement. Completion earns one qualifying calendar day for the daily streak. It does not add a second day if another activity has already qualified that date. Mastery, readiness and question selection are unchanged.

## Persistence and access

`learner_first_steps` stores only the three completion flags, completion/acknowledgement timestamps and the dated reward. The authenticated `sync_first_steps` RPC merges flags monotonically under a row lock, derives ownership from `auth.uid()`, and records the reward only once in the learner's timezone. Authenticated users can read only their own row; direct writes and anonymous access are denied. Account deletion cascades to this row.

The completion and acknowledgement remain after browser storage is cleared. Local cached completion never regresses when an older response arrives. Celebration dismissal is immediate locally; if that acknowledgement fails to sync, the next online/focus refresh retries it. A completed/acknowledged tour stops syncing. Recommendations and first-step updates use action/focus/online refreshes without periodic polling. This does not turn full lesson/card activity history into cloud persistence; it persists the starter challenge and its reward.

Migration applied and verified: `20261104082209_first_steps_journey.sql`.

## Verification

- Node tests cover cohort eligibility, real completion vs opening, arbitrary lesson/deck choice, permanent dismissal, stale-response merging and dated streak idempotency.
- All concepts in the real 30-question diagnostic have both an existing lesson and flashcard deck recommendation.
- `supabase/tests/first_steps_journey.sql` passed against the connected database using rolled-back synthetic identities: ownership, partial/full completion, replay, timezone changes, acknowledgement, legacy-account exclusion and anonymous/direct-write denial. No test users or rows remained.
- Actual Data API RPC is registered and returns 401/42501 for anonymous calls.
- Browser checks used an isolated account and RPC mock: top-of-dashboard placement, hidden readiness, recommendation badges on both shelves, completion/celebration, acknowledgement failure/reconnect, reload and fresh-device restoration, and existing-account exclusion.
- An actual 15-card deck review (not a fixture completion event) completed the deck step.
- Desktop/mobile layouts checked at 320, 390, 768, 1024 and 1440px; no horizontal overflow. Axe checks on the starter card and celebration reported no A/AA violations in the checked light/dark states. Native-dialog focus/keyboard behaviour and reduced-motion CSS are retained.
- `npm run build`, full `npm run audit`, and `git diff --check` passed. Existing large bundle warning remains.

[Supabase RLS reference](https://supabase.com/docs/guides/database/postgres/row-level-security) informed ownership policies and grants.
