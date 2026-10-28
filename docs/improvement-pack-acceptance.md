# Improvement Pack implementation and checks

Baseline requested: `1674c62`. Initial inspection found that free explanations,
fast Google/email-link signup, guest diagnostic import, breadcrumbs and saved vs
remembered definitions were already implemented. Those flows were retained.
Later main accessibility commits through `0fa0925` were merged and retained too.
Before delivery, main had advanced through PRs #1–#4 (`3ce4826`). Those were
merged as well. The compact readiness layout revert stays in effect. Shared
first-step/Smart Review helpers are reused; completed onboarding records and
dated MCQ/card/challenge activity migrate once. Numeric streak seeds and section
opens cannot prove completed activity, so they do not become invented days.
Readiness now includes all 179 tags exactly once in primary reporting domains;
the prior question-occurrence catalogue omitted untaught tags and repeated some
across domains. The matching catalogue builder and completeness check now share
the explicit domain mapping. Both readiness RPC migrations have been applied.
The old profile/exam-plan signup wizard is not used.

## Delivered

- Two-step post-signup goals: booked date or explicitly unbooked target/month,
  then 20/30/60/custom minutes. Month targets use month-end. Skip enters the
  dashboard with six weeks and 20 minutes/day. Study Plan provides an editor.
- Deterministic, budgeted weekly plan: primary/secondary domains, lessons in path
  order, MCQ targets and a linked deck. Initial signup choices replace the
  provisional default; subsequent changes preserve the current/past weeks and
  regenerate future weeks only when target, daily goal or mastery changes.
  Due retests, weakest attempted concepts, the next primary-domain lesson, then
  unattempted coverage determine Focus of the Day. Unknown retest status disables
  its action until refreshed rather than pretending no retests are due.
- Explicit device scope: goals, plan, lesson/card activity, first-three-steps and
  deck position are saved for the account on this browser. MCQ mastery/evidence
  remains server-backed. Clearing browser data loses device-only progress.
- Meaningful streak: dated 10+ MCQ answers, an explicitly completed lesson section,
  10 distinct cards rated, or a completed Daily Challenge, regardless of score.
  The dashboard explains today's qualifying activity. Undated numeric legacy
  streaks do not earn inferred days. Stored lesson completions can establish the
  first-lesson milestone but never backfill a streak date.
- Persistent first MCQ set / completed lesson / opened deck milestones. All three
  checkmarks replace that card with the Study Plan widget.
- Smart Review explanation and live due/cooldown/weakest indicators. Repair shows
  its result and allowance implications before generation; cancellation spends no
  allowance. Existing grading and question selection remain unchanged.
- Authenticated, owner-scoped billing on Account and Upgrade: current pass/start/
  expiry/days, paginated purchase history and Stripe receipt links. Stripe receipt
  outages retain the purchase with an explicit unavailable state. Existing
  subscriptions, pass prices and durations are unchanged. Refresh Pro explanation
  is in Account. Delete account is visible without opening an accordion; the
  existing email-verification deletion flow remains in control.
- Personalised flashcard counts distinguish matched vs selected neighbouring
  cards. Search highlights literal matches and identifies why a deck matched.
  Deck order and index survive reload, with Resume and Start over controls.
- Shared primary/selected/locked patterns, 44px button/icon targets, removal of
  practice tagline badges, and destination-shaped skeletons for Dashboard, MCQ,
  flashcards, lessons and pricing. No artificial loading delays were added.
- All-concept, domain-weighted readiness, independent accuracy and evidence-based
  confidence. See [calculation details](exam-readiness-calculation.md).

## Validation

- `npm run audit:improvements`: planner targets with no date, past date, under
  14 days, six weeks, more than 16 weeks; no attempts/all mastered; date/goal/
  mastery updates; fixed current weeks; per-week time budgets; all streak sources;
  account isolation/storage failures; initial vs later goal saves; billing auth,
  owner spoofing, unsafe/foreign receipts, outages and pagination; search/preview.
- `npm run audit:mcq-engine`: readiness fixtures include no estimate, 10 questions
  with nine correct/eight concepts, repeated IDs, weak 28%-weighted domain, skips,
  all-85 mastery, confidence thresholds and staleness. Existing engine tests pass.
- `npm run audit:mcq-engine:database`: disposable PostgreSQL validates replay,
  distinct samples, empty history, owner isolation and service-only RPC grants.
- `npm run audit`, `npm run build`, repository privacy audit, `git diff --check`.
- Browser checks used isolated, fictitious local accounts and API fixtures; no
  purchases, learner records, emails or deletions were created in production.
  Popup skip and both setup steps, editable targets, month-end scheduling,
  repair preview/cancel/focus return, billing/receipt/delete visibility, search
  highlights and deck resume after reload were checked through the interface.
- axe-core WCAG A/AA checks: zero automated violations on Study Plan, Dashboard
  with breakdown, MCQ setup, flashcard reader, lesson shelf, Account and Upgrade
  in both themes. Filtered flashcard shelf and repair/setup dialogs also passed.
  This is automated plus keyboard/AX inspection, not certification of every page
  or a substitute for testing with a human screen-reader user.

The additive readiness-evidence RPC was applied to the connected project and
verified read-only with zero-history evidence; anon/authenticated execution is
denied and service_role execution is allowed. Repository push and live bundle
verification are separate delivery steps, recorded in the task response.
