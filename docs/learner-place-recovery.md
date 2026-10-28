# Learner place recovery

Diagnostic questions, selected answers, checked answers, skips and position remain in the existing validated browser-local diagnostic draft. A restored unfinished run shows Resume diagnostic. Previous question revisits checked/skipped questions, with explicit Change my answer / Try this question controls. Server grading and the existing seven-day account-import window remain unchanged. Incomplete revisions cannot import a stale completed diagnostic receipt.

Flashcard, PBQ and lesson libraries preserve filters and list scroll in tab session storage, scoped to the learner. Expanded lesson domains and PBQ pagination survive returns. Flashcards additionally preserve the current card, shuffled order and side; lesson sections and study modes are remembered per lesson. This is browser navigation state, not a new cloud progress system.

Opening a deck, PBQ, lesson or expanded diagnostic adds a browser history step. Back returns to the list or closes the diagnostic; Forward reopens the detail. Existing routes are respected on refresh. Closing the diagnostic returns focus to its opening control, including the inline explanation button. List returns restore focus to the opened card. Account transitions close detail state synchronously to avoid racing browser Back.

Validation on 2026-10-28:
- Four navigation/storage tests: tab-storage reload, learner isolation, denied/malformed storage, Back/Forward metadata, and synchronous modal-to-auth transitions.
- Full site audit, production build and all 65 MCQ engine tests passed.
- Local browser: diagnostic refresh at question 2, skip revisit and answer correction, modal Back/focus, completed diagnostic to signup, filtered deck Back/Forward and card-2 reload, filtered PBQ Back/Forward and detail reload, lesson search/expanded groups/section-2 restoration.
- Mobile diagnostic: 390px viewport, 369px dialog/content width, no horizontal overflow.

Local browser API fixture generated diagnostic questions only; no real learner accounts, emails or cloud progress were changed. Diagnostic persistence requires available browser storage. Tab session preferences are not a promise of cross-device recovery. PBQ answer-entry drafts are not newly persisted by this navigation change.
