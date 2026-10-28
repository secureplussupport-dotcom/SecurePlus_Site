# Learner-facing progress definitions

- Diagnostic: an attempt is a submitted, non-skipped answer. The cursor says “Question N of 10”; the bar counts attempts, with skips separately labelled “not attempted”. Skipping neither marks a correct option nor reveals its explanation. After an attempt, the inline and expanded views show the identical explanation. Results use the same attempted/skipped counts. Existing server handling already excludes skips from incorrect-answer scoring.
- Lessons: progress counts unique sections opened in guided mode. Jumping to the final section credits that section only. Library, lesson cards and detail use the same view record. All sections viewed is not a claim of mastery. Legacy manual-complete flags remain untouched in storage but cannot prove a section was viewed; actual view tracking begins with this change. View records stay in this tab's session storage, scoped per learner.
- Practice labs: progress counts distinct questions with a submitted answer, immediately on Check answer. Selecting a choice or navigating does not count. Saved lab answers and position are per lesson, and explicit retry resets that lab.
- MCQ practice: the bar counts submitted answers, rather than the furthest question opened.
- Flashcards: saved for later means bookmarked; remembered means the learner chose Got it. The bar counts remembered cards. Navigation, flipping and saving do not award recall credit. Removing a bookmark no longer marks the card remembered. Existing bookmarks remain, with an explicit note when the current card is already saved. No bookmark defaults were introduced.

## Free MCQ feedback

All registered Free and Pro users receive correct-answer and every distractor explanation after answering in MCQ practice, and in exam answer review and Daily Challenge. The upgrade comparison explicitly includes these explanations in both tiers. The guest diagnostic continues to show only the correct-answer explanation after attempting.

The answer endpoint enriches a successfully graded response from its owned, pinned question snapshot; no other question's answer is revealed. Resume enriches answered records only. Unanswered learner projections still omit answers and explanations. No database migration or entitlement change is needed.

## Verification

- Four progress tests cover attempts/skips, last-section jumps and duplicate views, submitted lab questions, and independent bookmarks/recall.
- A server regression verifies all option explanations after grading and on resume while unanswered projections remain hidden.
- Full site audit, production build and 66 MCQ engine tests passed.
- Local browser: skip gives zero additional attempts and no answer highlight; inline/expanded explanations match; jumping from the first to last section yields 2/6 both in lesson and library; checking a lab answer immediately yields 1/3 and survives reload; Got it changes remembered only, save/un-save changes bookmarks only; a Free account fixture displays all three distractor explanations plus the correct-answer explanation with no Pro gate.
- Browser QA uses isolated local fixtures; no real accounts or cloud learner records were changed.
