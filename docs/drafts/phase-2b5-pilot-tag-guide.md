# What the pilot question tags mean

7 October 2026. Your approval of all fifteen questions is recorded as [content approval](phase-2b5-pilot-batch-1-content-decision.md). The labels below are still proposals. [Remaining choices](phase-2b5-pilot-batch-1-review.md) ask only about concept labels, difficulty/skills and scope. The owner's [fourteen family judgments](phase-2b5-pilot-batch-1-family-decision.md) are now recorded separately.

A **concept tag** names the specific understanding a question checks. It lets the future review system choose useful practice after a miss. The code, such as `recovery.rto`, is simply a stable internal name for that skill.

| Proposed primary tag | Plain meaning | Concrete example from your approved drafts |
| --- | --- | --- |
| RTO — `recovery.rto` | How soon must an acceptable service be restored? | **rto.02:** restoring identity, the portal and validation takes 15 + 20 + 10 = 45 minutes. The target is 40 minutes, so service restoration is late. |
| RPO — `recovery.rpo` | How much recent data can be lost, expressed as a time window? | **rpo.01:** failure at 09:20 with recoverable data only through 08:55 leaves a 25-minute data-loss window. |
| MTD — `recovery.mtd` | How long can a business function remain disrupted before the harm is unacceptable? | **mtd.03:** the database returns after four hours, but required reconciliation takes another 2.5 hours. Business interruption lasts 6.5 hours against a six-hour limit. |
| MTTR — `recovery.mttr` | How long did repairs/recovery take on average, using a consistent clock? | **mttr.01:** observed repairs of 20, 30 and 40 minutes average 30 minutes. This describes past observations; it does not set a deadline. |
| BIA — `continuity.bia` | Which business functions matter, what happens if they stop, and what resources do they depend on? | **bia.02:** identity services earn no direct revenue, but order fulfillment cannot run without them. That dependency matters to recovery priority. |

All short question IDs here have the prefix `draft.pilot1.`. Each tag is proposed for the three questions with the matching prefix: rto.01–03, rpo.01–03, mtd.01–03, mttr.01–03 and bia.01–03.

**Primary concept** means the main skill being assessed. **Secondary concept** means another skill genuinely needed to solve the same question. All fifteen drafts currently propose one primary concept and **no secondary concepts**. Related terms used as context, contrasts or distractors do not automatically become secondary evidence. For example, rto.01 mentions a data-loss allowance, but asks whether the service-restoration deadline was met; it proposes only RTO. Reviewing an RPO comparison can help explain that miss without labeling RPO weak.

A **scenario family** groups questions that use the same reasoning pattern. Changing a company name or four hours to six hours still tests the same pattern. rto.02 asks you to add required recovery steps; rto.03 asks whether a monthly availability claim proves a per-outage recovery target. Those families use different reasoning; the owner has accepted that distinction in the separate family record. mtd.01 is deliberately grouped with existing m196 and receives no new-family credit.

**Difficulty** is a proposed learning level: easy for straightforward interpretation/calculation, medium for applying or comparing requirements, hard for evaluating evidence and assumptions. These levels have not been measured with learners. You can ask to change a difficulty without rejecting an approved question.

**Objective 5.2** is the broad SY0-701 syllabus home for BIA and the named recovery metrics. MTD is supporting continuity context in this pilot; it is not an explicitly named exam bullet. Whether to retain that supporting scope is a separate choice. Domain 5, objective 5.2 and the topic “business-continuity-metrics” are broad organization labels, not extra primary concepts.

Approving a tag or family records your editorial decision locally. Publication, adaptive use and deployment remain separate decisions. The draft question bytes remain unchanged, and Phase 2B-5 remains NOT READY.
