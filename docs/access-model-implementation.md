# Access model change — 22 October 2026

Owner source: Pro vs Free vs Unregistered privileges attachment. Clarifications: guests get 10 MCQs total until signup; existing recurring subscriptions stay unchanged.

- Guest: lifetime 10-question diagnostic; every curated flashcard deck available.
- Free account: 50 generated MCQs in rolling 12 hours, max 30 per set; full bank and standard tools; Daily Challenge and identical exam retakes exempt. Resuming a set costs nothing; abandoned free sets expire 12 hours after creation. Missed-question batches explicitly confirm quota use.
- Pro: unlimited generation, sets up to 90, filters and unlimited searchable/category-tagged bookmarks.
- New Stripe purchases: USD 11.99/30 days or USD 24.99/90 days; one-time payment, no renewal. Existing recurring subscribers retain their existing billing and cancellation controls.
- Free question bookmarks: 10 active MCQ/PBQ slots with explicit oldest-item replacement approval. Flashcard bookmarks remain separate.
- Pacing: 45 seconds Core / 75 seconds Applied, highlighted in report only; does not change mastery or selection.
- Planned Cipher Assistant diagnostics based on exam date are not activated by this change.

Implementation checklist: atomic server quota and ownership checks; guest diagnostic; server-generated random/exam/missed/starred sets; resumable plans/expiry; bookmark cap and replacement; pass purchases/webhooks/expiry; UI and legal/pricing copy; adversarial/database/browser verification; scoped push and live probes.

Verification: 47 MCQ unit/API tests, six access-model tests, PostgreSQL quota/pass/bookmark tests (including parallel generation requests), and the existing database integration suite. Preserved historical Smart Review plans are backfilled with their original timestamps. Guest diagnostics use a signed HttpOnly browser identifier and retain the in-progress diagnostic locally. No existing subscription is cancelled or modified by this release. No card is charged during automated verification.

Additional owner request: in “Test Definition” flashcards the answer shows only the term/acronym, without repeating the definition from the other side. Acronym-test explanations and example-mode meanings remain.

Exam rehearsal scales at 60 seconds per question, so a 90-question set has a 90-minute budget. Individual report targets remain 45s Core / 75s Applied. Official exam duration reference: https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be (test details). This remains an MCQ rehearsal, not a replica of the mixed MCQ/PBQ exam.

If Pro expires with more than ten saved questions, older extras are archived without deletion. Free keeps ten active slots; returning to Pro restores the archived bookmarks. Flashcard stars are excluded from this question-slot cap.
