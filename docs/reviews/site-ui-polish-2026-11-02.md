# Site UI polish — 2 November 2026

A shared visual pass across the current main version of SecurePlus. It keeps the flashcard page's warm paper / dark slate identity and makes the controls and reading experience more consistent.

## Changes

- System body text for clearer reading; Montserrat remains on headings. Question stems and answers use lighter weights without changing their content.
- Readable captions across landing, dashboard, readiness, flashcards, study plan, reports, account/support, Why we're different and pricing, including mobile rules.
- Shared button shapes, quieter secondary actions, visible keyboard focus, softer surface borders, and a consistent selected Account tab.
- Calmer sidebar selection; less distracting hover shine and question-option movement.
- Dashboard spacing and metric typography; mobile readiness explanation spans the card instead of being squeezed beside the dial.
- Account identity stacks cleanly on narrow screens, study-plan weeks use consistent surfaces, and pricing artwork accommodates larger labels.

Only styles and a stylesheet import changed in application code. No scheduling, mastery, readiness calculations, question content, access permissions, authentication flow, prices or pass durations changed.

The separate pending Why/About and free-lesson access rework in the original checkout was not included. Its eight files matched the pre-task SHA-256 snapshot after this work.

## Verification

- `npm run build`: passed; existing large-chunk warning remains.
- `npm run audit`: passed, including contrast, launch readiness, Improvement Pack, editorial and strict question-bank checks.
- `git diff --check`: passed.
- Browser: Dashboard, Study Plan, MCQ setup, flashcard shelf, Deep Dive index, Account & Support, and Upgrade rendered with isolated test data.
- Automated axe checks for those seven pages and both practice/exam report cards: no WCAG A/AA violations reported in light or dark, at desktop and 320px widths (36 page/theme/size checks).
- Responsive checks at 320, 390, 768 and 1024px on the seven main pages: no document horizontal overflow. Desktop visual review also used 1440px.
- Full application shell and guest landing inspected separately, including the visible mobile signup button. Escape from signup returned keyboard focus to the signup trigger.
- Mobile visual inspection led to fixes for the account identity, decorative caption, pricing artwork and readiness text.

Browser tests used local fixtures, not production learner records. They verify rendering and UI interactions; payment processing and live account mutations were not exercised. Automated accessibility checks do not replace a full assistive-technology audit.
