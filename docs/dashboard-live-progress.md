# Dashboard refresh and loading feedback

Readiness, practice allowance and the daily streak now live at the app level, so navigation does not discard their last successful snapshots. Opening the readiness breakdown only reveals charts; it does not start data collection.

- Answers refresh readiness and activity totals. Completing the Daily Challenge refreshes its streak immediately.
- Returning to Dashboard, regaining focus, reconnecting and a 30-second visible-tab interval refresh the snapshots. Allowance also refreshes at its next quota release.
- Simultaneous requests are coalesced. A mutation during an outstanding request queues one follow-up. Disposed requests cannot publish into a different account or unmounted view. These are session-memory snapshots, not persistent shared-user caches.
- Refresh failures preserve existing values and expose a retry notice for readiness. An initial missing value stays unavailable rather than becoming a fabricated zero.

Cipher placeholders cover app startup, pending navigation, set creation, answer checks, exam marking, personal flashcard loading, account updates and the existing practice-bank wait. They show actual pending work; no artificial minimum delay is added. Exam marking remains ordered and uses its existing idempotent answer events. Its counter reflects checked questions.

Mastery, scoring, sampling, quota enforcement and database schemas are unchanged. API response latency still determines completion time; the interface no longer waits for an extra allowance read before opening a generated set.

Validation: `npm run audit:mcq-engine` includes request-coalescing, stale-owner, late-failure and retry tests. UI checks use clearly labelled simulated delays to verify loading/recovery and cached-value refresh without writing learner records.
