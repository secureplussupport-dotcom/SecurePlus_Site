# SEC-01 lesson pilot

Review URL: https://www.secureplusprep.com/pilots/sec-01/

A separate, public, noindex pilot for the proposed 47-lesson arrangement. It does not replace the current Deep Dives, alter existing tag-to-lesson recommendations, add MCQs to the practice bank, or write scores or progress. Micro-check selections exist only in page memory and reset on reload.

The pilot preserves the supplied SEC-01 scope: `sec.cia-triad`, `sec.non-repudiation`, `sec.defense-in-depth`; payroll anchor; CIA mechanism; exam trap; three micro-checks (answers B, C, B). The supplied backend schema is represented as static JSON in `src/pilots/sec01/lesson.json`; no backend or database change is required.

Editorial precision changes:

- No unauthorized viewing/disclosure is an explicit scenario assumption. Encrypted transit alone cannot establish confidentiality.
- Shared credentials weaken individual attribution. Unique accounts support accountability; correctly implemented digital signatures supply independently verifiable evidence of origin and integrity.
- A hardware-bound signing key strengthens key protection but does not make misuse, compromise or disputes impossible. The second question asks for the strongest additional evidence rather than an absolute guarantee.
- The ransomware question explicitly excludes unauthorized viewing as well as exfiltration. It tests unauthorized modification and loss of usable access, not merely host uptime.
- Raw hashes require a trusted reference; shared-key MACs do not supply non-repudiation.

Primary references:

- https://csrc.nist.gov/glossary/term/information_security
- https://csrc.nist.gov/pubs/fips/186-5/final
- https://csrc.nist.gov/glossary/term/non_repudiation

Validation: `node --test scripts/test-sec01-pilot.mjs`, `npm run audit`, `npm run build`, production HTML/asset inspection, and desktop/mobile browser checks. The old lesson library remains the current library pending review of this pilot.

## Compact tab revision — 26 October 2026

Keywords opens first, followed by Incident, How it works, Exam trap and Quick checks. Only one panel is visible. Arrow keys/Home/End navigate the tabs. Principle buttons reveal one compact explanation at a time. Micro-check feedback replaces the options instead of extending the page; selections survive tab changes and reset on reload.

Keyword IDs, full forms and definitions come directly from the existing flashcard seed through `sy0701AcronymFlashcards.js`. Non-repudiation currently has an empty definition in that bank, so the pilot explicitly says “Definition coming soon.” No replacement definition or new card was invented.

Stars use the main Flashcards `flashcard:<stable-card-id>` keys. Guests save into the same `starred:guest` device storage; signed-in users use the existing authenticated `/api/sessions/star` endpoint and owner cache. Mutations reload current bookmarks, retain unrelated question/card bookmarks, reject changed sign-in context, and surface failures without claiming a save. No schema changes. Checks remain page-local and do not write learner scores.

Validation for this revision: six focused tests covering grading, exact seed content, guest persistence, authenticated endpoint contract, failure preservation and sign-in changes; production build; browser checks of all five panels at desktop/phone sizes, both themes, keyboard navigation, all three check answers and the actual CIA card in the main guest saved-card set. Authenticated writes are covered with an injected endpoint fixture; no real account bookmarks were changed during testing.
