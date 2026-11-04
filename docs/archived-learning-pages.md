# Temporarily archived learning pages

Archived on 4 November 2026: **Study Plan**, **Daily Challenge**, and learner-facing **PBQ Simulations**.

- `src/lib/archivedFeatures.js` holds the three disabled feature flags and archived public paths.
- Both initial URLs and in-app navigation normalize archived views to Dashboard (Home for guests). Sidebar, mobile More, guest More, dashboard shortcuts and related-PBQ lesson buttons hide archived destinations.
- Study Plan setup and dashboard widgets are disabled. Its hook no longer generates/persists plans or loads planner state while disabled; the shared activity history still supplies the daily streak.
- PBQ practice and standalone daily views do not mount. PBQ content and editing remain available in Question Manager for administrators.
- The three public landing-page paths (including child paths) temporarily redirect to `/`, and are excluded from the sitemap. Their source HTML remains in the repository.
- Upgrade and assistant offers no longer advertise Daily Challenge/PBQ practice. The diagnostic signup action says “Save my results”; its existing save/import flow is retained.

No database migration or deletion was performed. Question banks, prior attempts, saved questions, planner preferences, historical streaks and server editing endpoints are retained. MCQ practice/Exam Mode, readiness, flashcards and Concept Deep Dives remain active. Prices and pass durations are unchanged.

To restore a page, enable its feature flag, restore its public URL/sitemap entry and visible offers as appropriate, and rerun the archive-policy tests with the new policy. The page implementations remain intact.

Verification: `npm run build`, `npm run audit`, archive-specific unit tests and `git diff --check` passed. Browser checks verified guest and signed-in navigation, mobile More, all three old query URLs returning to Home/Dashboard (six cases), no planner popup/widget, and lesson access without a Related PBQ button. Testing used isolated local accounts and made no production learner-data changes.
