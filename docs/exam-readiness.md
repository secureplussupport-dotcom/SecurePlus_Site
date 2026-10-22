# Exam readiness

Readiness is the equal-weight average of concept mastery over attempted concepts in MCQ practice sets and Exam mode. The existing mastery rule is replayed only over those activities: start at 50, add 20 for a correct answer, subtract 35 for an incorrect answer, clamp to 0–100. Each concept enters the denominator only after an eligible answer. Display uses one decimal, truncated rather than rounded up across the 80-point milestone. An exact average of at least 80 is **Exam ready**; each concept is mastered at 80 points.

Daily Challenge, diagnostic and PBQ activity do not contribute. Unanswered Exam questions do not create mastery evidence. This change does not modify Smart Review selection or its existing mastery state. Readiness is a scoped reporting calculation.

## Evidence and compatibility

New answer events record immutable activity source and source-bound chapter in the private engine history. Retries cannot relabel an event. Owned historical MCQ sessions remain identifiable and count. Unlabelled historical standalone events cannot be distinguished reliably from Daily Challenge or diagnostic events and are excluded, with a short note in the breakdown. No historical progress is deleted or relabelled. Public `attempts` rows are not used to infer missing cloud provenance.

The authenticated `/api/sessions/readiness` endpoint obtains user identity from the verified token, then invokes a service-only read RPC. It returns concept mastery and chapter aggregates, without raw answers. Anonymous and direct authenticated database execution are denied. Existing answer/pacing RPCs remain compatible with older clients.

## Visuals

- Motivational score and 80% milestone; no red readiness indicators.
- Chapter accuracy is correct / all eligible answers in that chapter. A common line spans all bars at 85%, labelled target accuracy. Unattempted chapters show a dash.
- Mastery donut: mastered vs still-growing **attempted** concepts.
- Chapter donut: each chapter's share of unmastered attempted concepts. A concept is attributed once, to its latest eligible source chapter. Unknown chapter evidence appears explicitly as unavailable.
- Breakdown opens inside the hero, directly beneath the readiness score controls and before the dashboard metrics. Bars reveal with a short stagger; pie segments form through a clockwise SVG mask. Each opening replays the reveal. Reduced-motion settings show the completed charts immediately. Responsive dark/light layouts retain readable labels and empty/error states.

## Validation

`npm run audit:mcq-engine`, `npm run audit:mcq-engine:database`, `npm run audit`, `npm run build`, and `git diff --check`. Disposable PostgreSQL verifies activity exclusions, legacy handling, mastery replay, idempotence, owner isolation and grants. Browser checks cover the real Dashboard component with sample data at desktop and 390px mobile, both themes and no-attempt state. Sample data is not written to any live account.
