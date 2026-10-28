# Readability and keyboard review — 28 October 2026

Changes: readable caption sizes and opaque text in both themes; locked lessons retain their text contrast; independent lesson/PBQ actions replace nested controls; diagnostic answer hints describe disabled state; native study dialogs contain focus, close with Escape, and restore the opener. Flashcard accessible names include the term/definition. Definition popovers expose their description and close with Escape. Signup opened from a study dialog returns to the original study control.

## Checks

- Shared text, secondary text and caption colours meet 4.5:1 against each light/dark base surface (`scripts/test-light-theme.mjs`).
- Local axe-core 4.14.0 checks with WCAG 2 A/AA, 2.1 AA and 2.2 AA tags: no detected violations in the tested lesson library (both themes), flashcard library (desktop/dark and 320px/light), diagnostic question (both themes), account popup, flashcard lesson-path dialog, and PBQ library after fixing its status-icon role.
- Keyboard: Enter opens lessons and related lesson dialogs; Space selects a diagnostic answer; selecting an answer enables Check answer; Tab/Shift+Tab wrap in study dialogs; Escape returns focus from the locked-lesson, lesson-path, account and expanded diagnostic dialogs. The lesson-path → login → close sequence returns to the original lesson link.
- Accessibility tree: modal names and background isolation, disabled-answer description, separate open/star controls, flashcard term and definition labels. No nested interactive controls in the checked diagnostic, lesson-library and PBQ-library DOMs.
- Mobile: 320px flashcard and PBQ libraries have no horizontal page overflow. Caption sizing and lock-badge placement were visually checked.

## Limits

This is a focused regression pass, not site-wide accessibility certification. Automated contrast evaluation reports manual-review cases on gradient backgrounds; palette contrast tests and rendered-style/visual checks supplement those results. No spoken VoiceOver/NVDA session was performed. Authenticated practice, billing and destructive account actions were not exercised against production. No real account or learning records were created during testing; the diagnostic used a local API fixture.
