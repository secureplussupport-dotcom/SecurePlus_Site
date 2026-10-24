# SecurePlus documentation

**New here?** Start with the [project overview](../README.md), then take the [engineering walkthrough](engineering-overview.md).

## Start and explore

| Guide | Purpose |
| --- | --- |
| [Developer setup](developer-setup.md) | Run the frontend, understand environment variables and identify connected-service requirements. |
| [Engineering walkthrough](engineering-overview.md) | Architecture, code entry points, decisions, trade-offs and AI-assisted development. |
| [Deployment checklist](../DEPLOYMENT.md) | Release checks and service configuration boundaries. |
| [Security notes](../SECURITY.md) | Trust boundaries, reporting and known limitations. |

## Current product guides

| Area | Guide |
| --- | --- |
| Adaptive MCQs | [Three-deck engine](mcq-three-deck-engine.md) · [Core recovery](mcq-core-recovery.md) |
| Guest conversion | [Diagnostic and signup funnel](guest-diagnostic-funnel.md) |
| Flashcards | [Flashcard rebuild](flashcards-rebuild.md) |
| Reports | [Exam readiness](exam-readiness.md) · [Dashboard metrics](dashboard-metrics.md) |
| Fresh progress | [Live dashboard progress](dashboard-live-progress.md) |
| Exam rehearsal | [MCQ exam mode](mcq-exam-mode.md) |
| Access and billing | [Access model implementation](access-model-implementation.md) |
| Retired systems | [Archived coin and mascot systems](archived-coin-and-mascot-systems.md) |

Feature guides are dated records. Later implemented behavior can supersede older details; for example, the [guest diagnostic guide](guest-diagnostic-funnel.md) supersedes the earlier lifetime-only diagnostic behavior in the access-model rollout note.

## Historical records

`phase-*` documents and `drafts/` retain the development history, candidate proposals and audit evidence. They are not all active product specifications. The active adaptive endpoint path is `api/sessions.js` → `server/mcq-engine/http.mjs`; earlier `server/adaptive/` experiments are separate.

Use `package.json` for executable checks and `supabase/migrations/` for versioned database changes. A passing local audit does not by itself prove a deployment is live.
