# Dashboard practice metrics

The dashboard shows Accuracy, Questions completed, Daily streak and Practice allowance.

- Accuracy is correct / all recorded completed MCQ answers. MCQ practice, Exam and Daily Challenge answers contribute; repeat answers count. This is separate from concept mastery and the readiness average.
- Questions completed is the same answer-event denominator. PBQs are excluded.
- Cloud totals aggregate private engine history without a client-side 1,000-row limit. Legacy public MCQ attempts before the first private event are also counted. Public rows after that cutover are mirrors and are excluded to prevent double credit. Older unlabelled MCQ events still count toward overall activity, unlike the narrower readiness calculation.
- Daily Challenge saves its MCQ result into normal attempt history as well, keeping local/demo activity and existing review history consistent. Its existing completion/streak rules stay intact.
- Daily streak reuses the existing stored streak; the seven-day ribbon reflects that current consecutive streak, not invented historical activity.

## Quota status

There is no active 12-hour quota backend yet. Production Free accounts show a pending gauge with **12-hour quota coming soon**. No quota size, remaining count or reset deadline is fabricated, and no enforcement is added. Pro accounts show an infinity symbol and **Unlimited MCQ practice**, with no quota count or timer.

The presentation component accepts a future authoritative `quota` value with `limit`, `remaining` and ISO `resetAt`. When connected, it shows remaining MCQs, a proportional gauge and time until reset. Expired quota data shows a refreshing state rather than inventing a refill. Sample connected quota values appear only in the disposable design preview. The quota backend and its connection remain future work.

## Validation

The MCQ engine tests include activity calculations, repeated answers, unanswered/PBQ exclusion, empty states, streak ribbon and quota formatting/expiry. Disposable PostgreSQL verifies all-source totals, legacy cutoff, no double credit and unchanged readiness. Browser checks cover Pro, Free pending, sample connected quota, empty data and light/dark mobile layouts. Build, repository audits and diff checks are required before push.
