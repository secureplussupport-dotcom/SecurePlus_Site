# Learning workspace redesign

Dashboard, MCQ setup and Study Plan share larger type, stronger contrast and a quieter card hierarchy. This is a presentation change; mastery, readiness, quota and scheduling rules are unchanged.

- Dashboard: practice and readiness lead; consolidated metrics; first steps retained; shorter recommendation copy.
- MCQ: compact allowance and exam control; prominent mode/count/start controls; live review signals and collapsed rules retained; three visible review queues.
- Study Plan: focus + editable target, a chronological week rail, current week open and future lesson paths expandable. Displayed date ranges are inclusive; the scheduling engine still stores exclusive end dates and excludes exam day.
- Local-only study progress remains labelled. No new assets, dependencies or database changes.

## Validation

- Production build, full `npm run audit`, `audit:improvements` and `audit:mcq-engine` passed.
- Browser fixture: all three pages in light/dark at desktop and 390px, no horizontal overflow; automated WCAG A/AA checks found zero violations in the checked states.
- Manually exercised: readiness breakdown, target editor open/focus, future week disclosure, question count, Randomised/Smart Review, exam guide and Pro 90-question option, missed-question preview and cancel.
- Fixture uses fictional data and mocked APIs. It validates rendering and interaction, not production account data or payments.
