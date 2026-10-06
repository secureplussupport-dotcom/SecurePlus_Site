# Pilot draft batch 1 — owner review checklist

7 October 2026, Asia/Singapore. **Blank review form; no approvals recorded. Phase 2B-5 remains NOT READY.**

- Exact [draft batch](phase-2b5-pilot-batch-1.json), committed in `6535d56c0b914d7f68d1c12435515c98501a417d`: SHA-256 `91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda`.
- Exact [mapping package](../evidence/phase-2b5/mapping-package.json): SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`.
- [Coverage ledger and existing-family comparison](../phase-2b5-pilot-coverage-gap-ledger.md). Fifteen questions; fourteen new family proposals. No private payloads were inspected.

## How to return decisions

Read each question and its feedback, then copy only the decision lines you choose into an owner reply in the authenticated monitoring chat **“Vet Security+ SY0-701 questions”**, ID `01a0ec5b-7f84-71f1-920b-7b0cd42850d2`. Change those boxes to `[x]` and include both package hashes above. The monitor will verify the hashes before recording each checked decision in a separate local review record attributed to that human message. A changed batch or package needs renewed review.

A box counts only when the owner explicitly posts it checked in that chat. Agent-filled forms, checked repository files, silence, elapsed time and unrelated earlier approvals are not human approval. After an hour with no reply, only independent preparation and already-authorized work can continue; blank decisions stay pending.

**Content/tag boxes** authorize only local recording of approval of the exact displayed stem, options, proposed answer, explanation, per-option feedback and proposed tags. They do not approve a new independent family. **Family boxes** separately authorize only local recording of the proposed family as independent of the existing direct families and the other approved new families for that concept, based on reasoning rather than wording, numbers or IDs. Leave them blank if the rationale is insufficient; propose a merge instead. Unchecked decisions remain pending.

Shared tags for every question: MCQ; objective `5.2`; domain `sy0701.domain-5`; chapter `sy0701.objective-5.2`; topic `business-continuity-metrics`; no secondary concepts; mapping proposal `pilot-draft-1-unapproved`. Difficulty is proposed and uncalibrated. Non-MTD questions use explicit BIA objective scope; MTD uses supporting context only. Accuracy/source notes are retained in the hash-bound batch. No checkbox changes the draft's zero mastery weight, its unpublished state or the active mappings. No publication, activation, migration, deployment, shadow enrollment or learner-facing change is authorized.

## Separate MTD scope decision

MTD is part of the approved pilot but is not an explicitly named SY0-701 objective bullet. This scope choice is separate from approving individual questions or family independence.

- [ ] **S-MTD** — Authorize only local recording that these three MTD drafts may be reviewed as supporting business-continuity context under objective 5.2, without presenting MTD as an explicit exam bullet. This does not approve their content or families.

## Questions and decisions

### draft.pilot1.rto.01

A retailer requires checkout to resume within 30 minutes of an outage and permits up to one hour of lost transactions. In a recovery exercise, checkout becomes usable after 45 minutes and the restored transactions are 20 minutes old at the outage. Which statement about the service-restoration requirement is correct?

- **A.** It was met because the restored data is only 20 minutes old.
- **B.** It was met because service returned within the one-hour data-loss allowance.
- **C.** It was missed because checkout became usable 15 minutes after the 30-minute deadline. **(proposed correct)**
- **D.** It was missed because every recovery must finish within the 20-minute age of the data.

**Explanation:** The service took 45 minutes against a 30-minute RTO. The 20-minute lost-data window fits the separate one-hour allowance. Meeting a data target does not compensate for late service restoration.

**Proposed tags:** difficulty `medium`; primary `recovery.rto`; skill `interpretation`; family `recovery-exercise-time-versus-data`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** Data age does not shorten the actual service outage; checkout still took 45 minutes against a 30-minute requirement.
- **B feedback:** One hour is the data-loss allowance, not the service deadline. The service deadline remains 30 minutes.
- **C feedback:** Correct: 45 minutes of elapsed restoration exceeds the 30-minute service target by 15 minutes.
- **D feedback:** Twenty minutes is the age of the recoverable data at the outage, not a deadline for completing restoration.

</details>

**Family rationale:** Unlike m032/m635 metric naming, adjudicates an observed service-restoration outcome without substituting the separate data allowance. The question asks only about the service target; RPO is distractor contrast, with no secondary mastery attribution.

- [ ] **Q-rto.01** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-rto.01** — Authorize only local recording that `recovery-exercise-time-versus-data` is an independent family for `recovery.rto`, under the comparison rule above.

### draft.pilot1.rto.02

A portal has a 40-minute RTO measured from outage until users can complete a transaction. Its tested runbook must restore identity services for 15 minutes, then restore the portal for 20 minutes, then validate transactions for 10 minutes. The steps cannot overlap. What does the exercise show?

- **A.** The end-to-end runbook takes 45 minutes and misses the RTO. **(proposed correct)**
- **B.** The runbook meets the RTO because restoring the portal itself takes only 20 minutes.
- **C.** The runbook takes 25 minutes because validation can replace identity restoration.
- **D.** The runbook meets the RTO because none of the individual steps lasts 40 minutes.

**Explanation:** The required sequential path is 15 + 20 + 10 = 45 minutes. Its end point is usable transactions, so dependencies and validation are included. The team must reduce and retest that path against the 40-minute target.

**Proposed tags:** difficulty `medium`; primary `recovery.rto`; skill `calculation`; family `serial-recovery-dependency-budget`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** Correct: add all required non-overlapping steps up to the specified acceptable service level.
- **B feedback:** The portal cannot provide the specified service before its identity dependency and validation are complete.
- **C feedback:** The stem requires all three steps and forbids overlap; dropping the portal restoration or another step is invalid.
- **D feedback:** A limit on the whole outage is not a separate allowance for every step.

</details>

**Family rationale:** Requires critical-path budgeting rather than naming a metric or sorting supplied recovery priorities as in p048. Distinct from the outcome comparison in draft.rto.01; no architecture or retention choice from p211.

- [ ] **Q-rto.02** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-rto.02** — Authorize only local recording that `serial-recovery-dependency-budget` is an independent family for `recovery.rto`, under the comparison rule above.

### draft.pilot1.rto.03

A service owner sets a 45-minute RTO for each disruption. A hosting proposal advertises 99.99% monthly availability but supplies no maximum outage duration, recovery test results or dependency-restoration commitments. Which conclusion is justified before accepting the proposal?

- **A.** The availability percentage guarantees every outage will end within 45 minutes.
- **B.** The percentage proves the recovery point objective is shorter than 45 minutes.
- **C.** No recovery test is needed because monthly availability is higher than 99%.
- **D.** The percentage alone cannot establish the RTO; require evidence for end-to-end restoration within 45 minutes. **(proposed correct)**

**Explanation:** An aggregate availability claim does not specify a tested per-disruption restoration bound. Acceptance needs evidence about the required service, dependencies and recovery time. A percentage is also not evidence of recoverable data age.

**Proposed tags:** difficulty `hard`; primary `recovery.rto`; skill `evidence_evaluation`; family `availability-contract-versus-outage-target`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** A monthly aggregate does not, by itself, define or prove a maximum duration for each individual disruption.
- **B feedback:** Availability describes service time, not the age of data that can be recovered.
- **C feedback:** A high advertised percentage does not demonstrate that this service can meet its recovery target.
- **D feedback:** Correct: ask for a recovery commitment and realistic end-to-end test evidence against the stated target.

</details>

**Family rationale:** Evaluates an evidence gap in a contract, rather than metric identification, recovery arithmetic or the supplied combined design of p211. Hard is a proposed inference load, not a calibrated label.

- [ ] **Q-rto.03** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-rto.03** — Authorize only local recording that `availability-contract-versus-outage-target` is an independent family for `recovery.rto`, under the comparison rule above.

### draft.pilot1.rpo.01

A booking database fails at 09:20. The latest successfully tested recovery point contains all committed bookings through 08:55. There is no other recoverable copy. What data-loss window would this recovery point leave?

- **A.** 5 minutes
- **B.** 25 minutes **(proposed correct)**
- **C.** 55 minutes
- **D.** The time required to restart the database

**Explanation:** The recovery point is 25 minutes before the failure. Bookings committed during that interval are outside the available copy. This is a data-loss window; the stem gives no service-restoration duration.

**Proposed tags:** difficulty `easy`; primary `recovery.rpo`; skill `interpretation`; family `recoverable-point-timeline`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** The difference between 08:55 and 09:20 is 25 minutes, not five.
- **B feedback:** Correct: compare the failure time with the last recoverable committed data.
- **C feedback:** Fifty-five is the minute value in the earlier clock time, not the elapsed interval.
- **D feedback:** Restart duration answers a restoration-time question, not the age of recoverable data.

</details>

**Family rationale:** Reads an actual recovered timeline instead of choosing backup frequency as in m088. It measures a potential window, not an approved objective or proof that all missing bookings actually occurred.

- [ ] **Q-rpo.01** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-rpo.01** — Authorize only local recording that `recoverable-point-timeline` is an independent family for `recovery.rpo`, under the comparison rule above.

### draft.pilot1.rpo.02

An order service acknowledges writes after storing them on the primary. Replication to a recovery site is asynchronous, and a burst of orders can remain queued on the primary for an unknown duration. The primary and its queue could be lost together. Management permits no more than ten minutes of lost orders. What evidence is most relevant to checking that requirement?

- **A.** A measured upper bound on the age of acknowledged orders not yet durably recoverable at the recovery site **(proposed correct)**
- **B.** The recovery server's advertised CPU speed
- **C.** The average time users take to enter an order
- **D.** A screenshot showing that the replica process is running

**Explanation:** The relevant exposure is acknowledged data that would disappear with the primary before becoming durably recoverable elsewhere. A running replica does not bound backlog age. Measure and test the worst relevant recoverable-data lag against the ten-minute allowance.

**Proposed tags:** difficulty `medium`; primary `recovery.rpo`; skill `scenario_application`; family `asynchronous-replication-durability-gap`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** Correct: a bounded recoverable-data lag can be compared with the permitted loss window.
- **B feedback:** CPU speed alone cannot prove that recent acknowledged orders have reached a durable recovery copy.
- **C feedback:** Order-entry duration does not tell how much committed data could be lost with the primary.
- **D feedback:** A healthy-looking process can still have a backlog older than the allowed window.

</details>

**Family rationale:** Requires durability and backlog evidence in an asynchronous failure model, rather than changing the interval in m088 or subtracting two provided timestamps. No claim that replication alone preserves historical clean versions.

- [ ] **Q-rpo.02** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-rpo.02** — Authorize only local recording that `asynchronous-replication-durability-gap` is an independent family for `recovery.rpo`, under the comparison rule above.

### draft.pilot1.rpo.03

A database has a 15-minute RPO. At 14:00, responders stop the database after discovering corruption that began at 11:00 and affected every later copy. Restore testing confirms the latest usable clean recovery point is 10:55. No transaction logs or other clean copies can reconstruct later data. New snapshots were taken every five minutes. Which assessment is correct?

- **A.** The RPO is met because snapshots were frequent.
- **B.** The 13:55 corrupted snapshot meets the RPO because it is recent.
- **C.** The available clean recovery point leaves a 185-minute window, so the 15-minute RPO is not met. **(proposed correct)**
- **D.** The RPO depends only on how quickly the corrupted server restarts.

**Explanation:** The usable point is 10:55, which is 185 minutes before 14:00. Recent corrupted snapshots are not usable recovery points. Snapshot cadence cannot substitute for recoverability when the stated clean reconstruction paths are absent.

**Proposed tags:** difficulty `hard`; primary `recovery.rpo`; skill `evidence_evaluation`; family `corruption-clean-recovery-point`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** Frequent copies do not meet the objective if those copies contain unrecoverable corruption.
- **B feedback:** The stem explicitly rules out all later copies as usable clean recovery points.
- **C feedback:** Correct: evaluate the latest usable point, not merely the most recent snapshot timestamp.
- **D feedback:** Restart speed cannot recover missing clean data or reduce its age at the interruption.

</details>

**Family rationale:** Applies usable-point selection after delayed corruption, beyond m088's explicitly successful, tested version schedule. Shares the general backup domain with m088; editor must judge whether clean-point reasoning is sufficiently independent.

- [ ] **Q-rpo.03** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-rpo.03** — Authorize only local recording that `corruption-clean-recovery-point` is an independent family for `recovery.rpo`, under the comparison rule above.

### draft.pilot1.mtd.01

A dispatch team can absorb an outage for up to four hours by clearing the resulting backlog later. Beyond four hours, shipments miss a stated contractual cutoff and management considers the harm unacceptable. Its technology team aims to restore the system in one hour. What is the maximum tolerable downtime for the dispatch function in this scenario?

- **A.** One hour, because that is the technology restoration target
- **B.** The average duration of past repairs
- **C.** Four hours, because that is the outer acceptable disruption limit **(proposed correct)**
- **D.** The time between the last backup and the outage

**Explanation:** The four-hour business tolerance is the outer interruption limit. The one-hour restoration target is intended to leave time for business recovery before that limit. This supporting continuity concept is not an explicitly named SY0-701 objective bullet.

**Proposed tags:** difficulty `easy`; primary `recovery.mtd`; skill `interpretation`; family `outer-business-interruption-limit`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** One hour is the chosen restoration target, which is shorter than the stated business tolerance.
- **B feedback:** An observed repair average does not set the business's unacceptable-harm boundary.
- **C feedback:** Correct: use the business impact threshold specified in the scenario.
- **D feedback:** Backup age concerns recoverable data, not how long dispatch disruption is tolerable.

</details>

**Family rationale:** Shares m196's business-limit-versus-restoration-target distinction. Retained as an easier value-interpretation check, not a new independent family. New MTD family proposals are the workaround reassessment and business reprocessing scenarios.

- [ ] **Q-mtd.01** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.

**Same family as m196; no novelty credit. No family-independence box is offered for this question.**

### draft.pilot1.mtd.02

A warehouse previously could tolerate only two hours without its automated picking system. A tested manual process now sustains the required shipping service for eight hours, after which capacity limits cause unacceptable business disruption. Management accepts that impact assessment. What should continuity planners do with the business downtime tolerance?

- **A.** Keep two hours permanently because hardware and software have not changed.
- **B.** Reassess the business tolerance using the validated workaround and its eight-hour limit, then review recovery targets. **(proposed correct)**
- **C.** Set the tolerance equal to the backup frequency.
- **D.** Make the tolerance unlimited because a manual process exists.

**Explanation:** Tolerance follows business impact and feasible continuity arrangements. The accepted manual process changes the impact timeline, but has a finite capacity limit. Recovery targets still need review; the scenario does not automatically approve an eight-hour technical RTO.

**Proposed tags:** difficulty `medium`; primary `recovery.mtd`; skill `scenario_application`; family `manual-workaround-changes-business-tolerance`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** Business impact can change even when the technical assets remain the same.
- **B feedback:** Correct: include the tested workaround and its limits in the business tolerance assessment.
- **C feedback:** Backup frequency is not a measure of how long shipping can continue acceptably.
- **D feedback:** The workaround stops sustaining the required service after eight hours, so it does not remove the limit.

</details>

**Family rationale:** Tests reassessment when an alternative business process changes tolerance, unlike m196 definition and draft.mtd.01 threshold reading. Manual effectiveness is stipulated, not inferred from paper procedures alone.

- [ ] **Q-mtd.02** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-mtd.02** — Authorize only local recording that `manual-workaround-changes-business-tolerance` is an independent family for `recovery.mtd`, under the comparison rule above.

### draft.pilot1.mtd.03

A finance function has a six-hour maximum tolerable downtime. After an outage, its database is restored in four hours. Staff must then complete two and a half hours of non-overlapping reconciliation before the function can resume acceptable operations. No workaround is available. Which finding follows?

- **A.** The function stayed within tolerance because the database returned in four hours.
- **B.** The tolerance is the age of the restored database backup.
- **C.** The reconciliation can be ignored because the server is already online.
- **D.** The total interruption is six and a half hours, exceeding the business tolerance by 30 minutes. **(proposed correct)**

**Explanation:** Acceptable business operation resumes after 4 + 2.5 = 6.5 hours. Technical restoration alone does not finish the business interruption. The six-hour tolerance is exceeded by half an hour.

**Proposed tags:** difficulty `hard`; primary `recovery.mtd`; skill `calculation`; family `technical-recovery-plus-business-reprocessing`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** The business remains interrupted during the required reconciliation even though the database is available.
- **B feedback:** Data age is a recovery-point issue, distinct from elapsed business interruption.
- **C feedback:** The scenario requires reconciliation before acceptable operations can resume and excludes a workaround.
- **D feedback:** Correct: include both sequential phases and compare the result with the business limit.

</details>

**Family rationale:** Evaluates business resumption after technical recovery, distinct from m196 naming, impact-threshold reading and workaround reassessment. Related to draft.rto.02 timing, but measures the business boundary, not the system target.

- [ ] **Q-mtd.03** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-mtd.03** — Authorize only local recording that `technical-recovery-plus-business-reprocessing` is an independent family for `recovery.mtd`, under the comparison rule above.

### draft.pilot1.mttr.01

A team defines repair time as elapsed time from service failure to verified service restoration. Three completed failures took 20, 30 and 40 minutes to repair under that definition. What is the mean time to repair for these failures?

- **A.** 30 minutes **(proposed correct)**
- **B.** 40 minutes
- **C.** 90 minutes
- **D.** The agreed service-restoration target

**Explanation:** The observed durations total 90 minutes across three completed repairs, giving a mean of 30 minutes. It is an observed average under the stated clock definition, not a target or the longest repair.

**Proposed tags:** difficulty `easy`; primary `recovery.mttr`; skill `calculation`; family `observed-repair-duration-average`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** Correct: (20 + 30 + 40) / 3 = 30 minutes.
- **B feedback:** Forty minutes is the longest observed repair, not their average.
- **C feedback:** Ninety minutes is the total repair time; divide it by the three repairs.
- **D feedback:** An agreed target is not calculated from observed repair durations.

</details>

**Family rationale:** Fills the absent direct MTTR MCQ slot with an observed-data calculation; no existing pilot MCQ calculates this metric.

- [ ] **Q-mttr.01** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-mttr.01** — Authorize only local recording that `observed-repair-duration-average` is an independent family for `recovery.mttr`, under the comparison rule above.

### draft.pilot1.mttr.02

A service has a target of restoration within 60 minutes for each outage. Under a consistent failure-to-verified-restoration clock, its last three repair durations were 10, 10 and 100 minutes. A report shows MTTR of 40 minutes. Which interpretation is correct?

- **A.** All three outages met the target because 40 is below 60.
- **B.** MTTR is 100 minutes because the longest outage defines the mean.
- **C.** The reported mean is correct, but one outage exceeded the restoration target. **(proposed correct)**
- **D.** The repair durations prove that no committed data was lost.

**Explanation:** The mean is (10 + 10 + 100) / 3 = 40 minutes. An average below a target does not show that every observation met it; the 100-minute outage exceeded 60 minutes. These timings say nothing about recovered data age.

**Proposed tags:** difficulty `medium`; primary `recovery.mttr`; skill `interpretation`; family `mean-versus-incident-tail`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** A mean hides individual values; the 100-minute observation fails the per-outage target.
- **B feedback:** The largest observation is not the arithmetic mean.
- **C feedback:** Correct: distinguish the observed average from the target and inspect individual incidents.
- **D feedback:** Repair-duration data alone cannot establish the recovered data-loss window.

</details>

**Family rationale:** Uses distribution/outlier interpretation, not another average calculation alone. RTO is a contextual contrast; primary evidence proposal is understanding the limits of MTTR.

- [ ] **Q-mttr.02** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-mttr.02** — Authorize only local recording that `mean-versus-incident-tail` is an independent family for `recovery.mttr`, under the comparison rule above.

### draft.pilot1.mttr.03

A dashboard claims an automation rollout reduced MTTR from 32 to 12 minutes. Before rollout, the clock ran from service failure until users could complete a validated transaction. After rollout, it starts only when a technician begins repair and stops when the server boots; no comparable transaction-restoration timings are retained. What is the strongest supported conclusion?

- **A.** Automation definitely cut end-to-end service recovery by 20 minutes.
- **B.** The values use different clock boundaries, so they do not establish an improvement in the original recovery metric. **(proposed correct)**
- **C.** The new value proves every outage meets the recovery time objective.
- **D.** The new value proves the system fails less frequently.

**Explanation:** The reporting definition changed at both ends. The two means cannot establish a change in the original failure-to-usable-service duration without comparable measurements. Repair averages also do not prove every target is met or measure failure frequency.

**Proposed tags:** difficulty `hard`; primary `recovery.mttr`; skill `evidence_evaluation`; family `repair-measurement-boundary-change`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** The difference may result from excluding detection, waiting and validation rather than faster end-to-end recovery.
- **B feedback:** Correct: compare consistent definitions before attributing a change to the rollout.
- **C feedback:** A mean with narrower boundaries does not prove a per-outage service-restoration guarantee.
- **D feedback:** Failure frequency is not determined by a repair-duration average.

</details>

**Family rationale:** Assesses validity of a changed measurement contract, distinct from average calculation and outlier interpretation. No causal effect is inferred from two incomparable reports.

- [ ] **Q-mttr.03** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-mttr.03** — Authorize only local recording that `repair-measurement-boundary-change` is an independent family for `recovery.mttr`, under the comparison rule above.

### draft.pilot1.bia.01

A team has an inventory of servers and replacement prices but has not analyzed the business consequences of outages. To begin a useful business impact analysis for an appointment service, which input should it obtain next?

- **A.** The recovery team's server boot sequence and configuration templates
- **B.** The replacement prices and depreciation schedule of the database equipment
- **C.** The security team's annual estimates of attack likelihood against the portal
- **D.** Business owners' time-dependent disruption impacts and viable workarounds **(proposed correct)**

**Explanation:** Asset prices alone do not show how interruption affects the business. Business-owner input about functions, time-dependent consequences and feasible alternatives makes the impact assessment useful for continuity decisions.

**Proposed tags:** difficulty `easy`; primary `continuity.bia`; skill `scenario_application`; family `business-impact-input-elicitation`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** Technical restoration instructions support a recovery plan but do not establish the missing business impact of losing the service.
- **B feedback:** Asset accounting does not capture how interruption affects supported business functions over time.
- **C feedback:** Likelihood estimates contribute to risk analysis but do not describe the missing consequences of disruption.
- **D feedback:** Correct: establish business effects and feasible continuity assumptions with their owners.

</details>

**Family rationale:** Chooses the missing evidence needed to perform BIA, instead of identifying the document title as m086 does. Avoids ranking assets by price or inventing domain-specific safety requirements.

- [ ] **Q-bia.01** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-bia.01** — Authorize only local recording that `business-impact-input-elicitation` is an independent family for `continuity.bia`, under the comparison rule above.

### draft.pilot1.bia.02

A business impact analysis finds that order fulfillment cannot operate without a shared identity service. Fulfillment has a one-hour recovery need; a reporting application using the same identity service can wait a day. The identity server has no direct revenue line item. How should planners treat it?

- **A.** Give it low priority because it earns no direct revenue.
- **B.** Include its dependency on fulfillment in recovery priorities so it is available in time for the critical process. **(proposed correct)**
- **C.** Schedule it solely around the reporting application's one-day need.
- **D.** Prioritize it only if it is the most expensive server to replace.

**Explanation:** Recovery priorities must reflect the processes a resource enables. A shared resource can be critical even without direct revenue. Its availability must support fulfillment; the exact implementation schedule still requires tested dependency and resource planning.

**Proposed tags:** difficulty `medium`; primary `continuity.bia`; skill `scenario_application`; family `shared-dependency-recovery-priority`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** Indirect enablement of a critical process can make a resource important despite having no direct revenue.
- **B feedback:** Correct: use the dependent critical function's needs when setting resource recovery priorities.
- **C feedback:** The less urgent application does not remove the more urgent dependency.
- **D feedback:** Replacement cost alone does not establish operational criticality.

</details>

**Family rationale:** Tests identifying an enabling dependency and its impact, rather than following supplied hospital priorities in p048 or naming the BIA document in m086. Exact time calculation is intentionally absent.

- [ ] **Q-bia.02** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-bia.02** — Authorize only local recording that `shared-dependency-recovery-priority` is an independent family for `continuity.bia`, under the comparison rule above.

### draft.pilot1.bia.03

Last year, a BIA allowed a claims portal to be unavailable for a day because staff could process requests by phone. The company now accepts time-sensitive partner submissions only through that portal, and the phone process cannot handle them. A proposal copies the old recovery priority because outage probability and server prices are unchanged. What is the best response?

- **A.** Reassess disruption impacts, partner time constraints and viable alternatives with business owners before retaining the old priority. **(proposed correct)**
- **B.** Retain the old priority because BIA measures only the probability of an outage.
- **C.** Retain the old priority because the same hardware is used.
- **D.** Replace the BIA with a vulnerability scan and derive recovery priority from patch severity.

**Explanation:** The business function and effective alternatives changed, so the old impact assumptions may be invalid. Unchanged outage likelihood and asset price do not establish unchanged consequences. Updated business evidence must inform any new recovery priority.

**Proposed tags:** difficulty `hard`; primary `continuity.bia`; skill `evidence_evaluation`; family `changed-business-service-impact-scope`.

<details>
<summary>Per-option feedback — included in the content approval</summary>

- **A feedback:** Correct: review the changed service and continuity assumptions; do not fabricate a new deadline without owner evidence.
- **B feedback:** Probability is relevant to risk assessment, but BIA needs the consequences of disruption to the current business.
- **C feedback:** Technical sameness does not imply that business impacts or dependencies are unchanged.
- **D feedback:** Patch severity cannot substitute for analysis of the current function's disruption consequences.

</details>

**Family rationale:** Tests stale-scope reassessment after a business-model and fallback change, distinct from collecting initial inputs and identifying a shared technical dependency. Related to draft.mtd.02 workarounds but asks whether BIA evidence remains valid, not the numerical tolerance.

- [ ] **Q-bia.03** — Authorize only local recording of approval of this exact question, answer, explanations/feedback and proposed tags at the batch/package hashes above.
- [ ] **F-bia.03** — Authorize only local recording that `changed-business-service-impact-scope` is an independent family for `continuity.bia`, under the comparison rule above.

## Reject or revise

Leave the affected approval box blank. Reply using this format; a correction requests a revised packet, not approval of the old or rewritten content:

```text
Batch SHA-256: 91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda
Mapping package SHA-256: 056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97
Decision ID: Q-rpo.03 / F-rpo.03 / S-MTD (choose one)
Decision: reject / revise / merge family (choose one)
Correction or replacement wording:
Reason:
Merge with question/family, if applicable:
```

## Remaining gates

Checked content, family and scope decisions remain distinct. MTD needs its supporting-context decision as well as individual content decisions. Canonical pilot identities and the wider taxonomy remain pending under their separate checklist. Publication and trusted revision/mapping integration require separate approval; this form alone supplies no eligible adaptive evidence. Private revision processing, component-graded PBQs, MTD/BIA teaching coverage, repeated-lapse variant capacity and later rollout checks remain open. The 15-minute monitor remains active.
