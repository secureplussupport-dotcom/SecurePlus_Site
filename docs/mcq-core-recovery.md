# Core recovery after consecutive misses

After two consecutive incorrect MCQ answers on the same concept tag, Smart Review makes the next encounter with that tag a Core question, if an eligible one exists. Answers on other tags do not break this tag's streak; a correct answer on the tag resets it. Existing per-concept streak evidence is reused. Mastery scoring does not change.

The rule applies when building future Smart Review sets and to unanswered questions in the current owned set. It does not interrupt with an immediate unrelated question. If a Core question is already scheduled, it moves before the next Applied question on the same tag. Otherwise an eligible Core replaces that unanswered slot. Core recovery takes precedence over the normal deck quotas. Set size, unique question IDs, answer snapshots and completed answers remain intact.

Availability respects current practice filters and missed-question cooldowns. If no eligible Core exists, the normal question continues. Older sessions without saved filter metadata conservatively retain any chapter, topic and difficulty common to their plan. Exam mode and random practice retain their existing selection.

The service-only recovery RPC locks owner/session state and rejects stale versions, foreign sessions, duplicate IDs, size changes, PBQs and modifications to answered snapshots. Server answer retries return the current sanitized plan. The frontend preserves answer feedback and clears draft choices only for changed questions. Saved sessions resume the updated plan.

Validation: MCQ engine suite, disposable PostgreSQL/API integration, full repository audit, production build and diff check. Integration covers a second miss formed inside a set, Core replacement from outside the plan, sanitized answer response, preserved grades, resumed plan, replay idempotence, correct-answer streak reset, owner isolation and service-only grants.
