# Guest diagnostic and signup funnel

The landing page preserves “Diagnose your weak spots. Follow your path. Pass with confidence.” The primary action starts the embedded diagnostic; the secondary action opens `?view=why-different`. Login remains available in the header. The signup entry is signup-first; the existing Athena account-creation journey is unchanged.

## Question selection and feedback

`server/mcq-engine/diagnostic.mjs` derives a deterministic pool from the effective Question Manager catalogue: six distinct tagged concepts per domain, 30 questions total. Only Core questions with prompts at most 240 characters, options at most 140 characters, and an existing correct-answer explanation qualify. Shortest qualifying prompts take precedence; IDs break ties. Concepts do not repeat across the pool. Each test randomly selects two questions per domain and shuffles questions and options. No PBQs are involved.

The active draft lives only in tab memory. Navigation and expansion retain it; reload/reopen clears it. Answers lock on Check answer. Compact mode marks the answer and offers expansion; only full format renders the correct-answer explanation. The existing glossary renderer provides definitions. Native modal focus containment, Escape dismissal, reduced motion, and mobile layouts are supported.

## Account handoff

Clicking Start focused set saves a completed diagnostic receipt in the existing guest bridge. It survives authentication/email/OAuth navigation. The browser keeps the receipt until the import RPC confirms success. Sync failures retain it and expose a retry action.

Generation stores an immutable question snapshot in the private `mcq_engine.guest_diagnostics` table, bound to a signed HttpOnly browser cookie. The server grades selected option IDs against that snapshot, ignoring client correctness/tags/scores. A single database transaction records all ten engine answers, mastery, failed-question cooldowns and mirrored attempt rows. A baseline can be claimed once per account; exact retries return the original response without adding credit. Foreign-browser/account claims, invalid options, incomplete answers and expired snapshots are rejected. Import does not consume registered practice allowance. Ten fresh diagnostics per browser per hour are allowed to limit abuse; receipts expire after seven days. Registered practice quotas are unchanged.

One diagnostic miss adds that exact concept to flashcard recommendations until a later correct answer on the concept. Normal practice still requires two consecutive misses. Diagnostic results recommend existing matching Deep Dives and cards. Successful signup/login import opens the MCQ page with Smart Review as its existing default; it does not bypass signup onboarding or automatically consume a practice set.

Diagnostic answers initialize the selection engine’s mastery. The previously agreed exam-readiness calculation remains MCQ-set/Exam-only; it is not redefined by this landing-page change.

## Verification

`npm run audit:mcq-engine` includes `scripts/test-guest-diagnostic.mjs`: pool/domain bounds, Core-only selection, output projection, snapshot ownership, transactional rollback, replay protection, server grading, mastery/retest persistence, one-miss flashcard eligibility and service-only grants. Existing engine/database and full audit suites remain required. Browser checks cover compact marking, expanded explanation, complete results, signup entry, reload reset and phone layout. No real learner accounts are created for QA.

The database migration is additive. Previous security-advisor warnings about Auth trigger functions and leaked-password protection are pre-existing; this migration uses invoker functions with service-role-only execution and a private RLS-protected table.

## Animated product explanation

The landing page and About Us page share `SmartReviewStory`: a labelled illustrative diagnostic miss, linked Deep Dive and turning flashcard, targeted/discovery/due-retest cards, and the original question answered correctly at a later retest. It does not generate attempts or mutate learner progress. The retest scene explicitly states the 30-other-answer eligibility rule.

The four scenes loop automatically every 4.2 seconds with animated entrances and exits, coloured step markers and direct step controls. There is no pause/play button. Playback pauses offscreen, in a hidden tab, on mouse hover or while keyboard focus is inside the story. Reduced-motion users receive manual steps and static artwork. The fixed illustration stage prevents layout shifts between scenes. Supporting text, diagnostic options, captions and domain labels were enlarged; the catchphrase, two main landing CTAs and signup onboarding remain intact.

The landing hero pairs Security+ identity/threat/network illustrations with a prominent blue diagnostic CTA. Scroll reveals run once; answer feedback, question transitions and results use short opacity/transform animations with reduced-motion alternatives. These are presentation changes; diagnostic selection, scoring and account handoff are unchanged.
