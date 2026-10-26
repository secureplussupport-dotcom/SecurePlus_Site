# Beginner diagnostic preview

The guest 10Q Diagnostic introduces Smart Review; it is not an aptitude test or an exam-readiness score.

## Content and experience

- `server/mcq-engine/beginner-diagnostic-bank.json` is the source for 30 preview-only questions: six distinct concepts in each of the five SY0-701 domains. Each question has three short options, a plain-English explanation and an existing concept tag.
- Each preview selects two questions per domain and shuffles questions/options. Reload starts a new browser-tab preview; navigation and expansion retain it.
- Preview IDs use `diag-` and are never merged into the registered 395-question MCQ catalogue or available for logged-in selection. Question Manager edits affect the registered bank, not this separate preview file.
- “New to this? Skip & learn later” records no selected option. Friendly feedback and the existing fixed explanation panel remain in place. Answered and skipped questions both advance exploration.
- The result shows concepts explored and topics to learn, rather than percentage scores or pass/fail language. The signup CTA carries the completed path into a real connected account.

## Signup and practice

The signed-browser snapshot remains the authority for question IDs, options and concept tags. The private import validates all ten decisions before recording anything, permits an explicit boolean skip with no selected option, and retains expiry, ownership, idempotency and one-baseline checks.

New preview decisions are stored with the claimed snapshot. They do **not** insert practice attempts, history, mastery scores, streaks or failed-question IDs. A missed or skipped concept becomes a learning priority returned by `guest_diagnostic_focus` and `mcq_engine_state`. Smart Review can select actual registered MCQs under that tag, and personalised flashcards use the same tag. A later real correct answer clears that preview priority. Existing real mastery takes precedence over a preview interest. Preview questions themselves are never retested inside registered practice.

Previously generated legacy diagnostic snapshots remain importable with their original grading behavior; explicit skips are never graded. The migration replaces service-only, invoker functions, without rewriting existing user data or expanding grants. Deploy it before the application release.

## Verification

The guest diagnostic tests cover 30-question isolation, known tags, six concepts per domain, shuffled two-per-domain sets, browser serialization, all-skipped and mixed imports, ownership, exact replay, contradictory skip payloads, rollback, restricted grants, legacy imports and real-bank remediation. The full MCQ and PostgreSQL integration suites also check existing grading, quota, replay, pacing, readiness and Core recovery behavior. UI checks cover the complete all-skipped journey, full-format presentation and a stable mobile frame when feedback appears. Real-account signup is not automated or represented by the local visual fixture.
