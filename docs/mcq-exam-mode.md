# Integrated MCQ exam mode

Exam mode lives in MCQ practice. Legacy Exam links open this setup with the toggle on; the separate mixed MCQ/PBQ exam is retired. PBQ practice remains separate.

- Free and guest users: 10, 20 or 30 questions. Pro: integer slider from 10 to 50. No coins or vouchers are required; existing wallet history is retained.
- Only the count is configurable. Smart Review history and practice filters do not select exam questions.
- Primary concept groups use a 3:2:1 allocation (Heavyweight, Standard, Niche), with random concepts/questions and final question/option shuffling. Untiered concepts use neutral Standard sampling. Scarce tiers redistribute available slots, without inventing questions or exceeding the concept cap of `ceil(count / 10)`.
- Questions are unique MCQs from the effective bank; PBQs and Beyond the textbook content are excluded.
- Allowance remains 72 seconds per question. The wall clock continues into overtime; submission freezes elapsed time, including across grading retries. Overtime is bold red on the report.
- Answers, flags and eliminations remain editable until final submission. Definitions and marking are hidden until answer review. Signed-in Supabase users reuse authoritative standalone MCQ grading and stable event IDs. Guest/demo users grade locally.
- The existing animated MCQ result component supplies domain accuracy, strongest signal, next focus and weak-point links. No pass/fail judgement is made.
- Review is the primary CTA. Retake keeps the questions, clears answers/flags and restarts the clock with new answer event IDs. Another exam returns to setup with mode/count retained in component memory only. Reload resets setup. Only guide completion is remembered in local storage.

Validation: focused selection/timing tests against fixtures and the effective catalogue; existing HTTP/SQL grading, idempotency and access-isolation suites; browser checks of free/Pro controls, guide, submission, report, definitions, retake, return state and responsive layout. Local test account data is disposable and does not establish live learner coverage.
