# Phase 2B-5 — unsupported local PBQ remediation design

**NOT READY.** 11 October 2026. Baseline **cb49d1e4f705113c66774df807a9536398d3f8b4**. Packet SHA-256 **754c40a982e0bc0b8c031493fde678b159f54a5fd1120d7a777bf0564d90ab99**. One finite LOCAL/default-off/unwired/learner-invisible design and feasibility slice. Only this draft packet, report and focused audit change.

## Decision and authority

The master plan and Phase 1 audit were read in full earlier in this continuing session. The master plan supplies approved product decisions; the audit supplies verified historical implementation facts. Current sources and all **74 prior substantive packets** were rechecked. No unresolved authority conflict calls for changing learner behavior here.

Inspect exactly the **23** identities still marked unsupported_grammar_no_new_credit in the latest remainingBankQuestions. Implement two reusable diagnostic helpers inside the focused audit: a guarded HOTSPOT metadata projection and a source-bound slot/value fixture. They are not exported, registered, imported by runtime or published. The protected compiler, learning contracts, learner UI and all mappings remain unchanged.

**Zero new question, full-feedback, component-skill, family, canonical or mastery credit.** All 23 original published records still fail the current trusted compiler and retain null trusted IDs. Four hypothetical compatibility projections compile in memory; 19 diagnostic slot fixtures mirror legacy grading. Neither result approves content, teaching, delivery, independent evidence, roles, scope, weights or activation. No hypothetical trusted UUID or grading key is exported.

## Actual root causes and smallest reusable changes

| Group | Current slice | Original first compiler failure | What the source proves |
| --- | ---: | --- | --- |
| HOTSPOT metadata |4|Unsupported question field: hotspots|Both actual renderers use the diagram and ordinary choice list; whole grading uses the numeric choice index. Neither renderer/grader reads hotspot correctness metadata.|
| Native slot activities |8|Unsupported question field: selectionFeedback|Seven originally authored fills and one already-authored Select & Fill activity now deliver reusable shared selectors. Removing feedback metadata still yields Unsupported answer grammar.|
| Converted matching activities |11|Unsupported question field: selectionFeedback|Current delivered slots preserve all legacy matching identities/prompts/values/solutions, but retain old items/targets/mapping alongside them. The current grader uses slots rather than the retained map.|

The first unknown-field error is not the whole root cause. For all 19 fill activities, merely accepting selectionFeedback or deleting it cannot supply an answer grammar: they have no single choice key. The compiler also rejects component fields, the trusted non-choice grader currently assumes ordering with distinct values, and the learner projection has no slot-prompt allowlist. Treating these activities as single-choice questions or forcing a once-only matching constraint would change their meaning.

### hotspot_unused_metadata — 4 rows

Guard an explicit HOTSPOT metadata compatibility projection and reuse the existing whole single-choice compiler, stable option IDs, learner allowlist and coarse grader. Bind the original source separately; do not broadly discard unknown fields.

**Implemented offline:** Audit-only source-bound projection dropping hotspots, with original compilation still blocked and all learner fields/keys preserved internally.

**Blockers:**

- Actual trusted compiler is protected and remains unchanged.
- Resolve stale metadata and p022 wrong-option correction before full semantic/teaching review.
- A projected revision is not the existing published source revision or a human decision.

**Acceptance criteria:**

- Only approved HOTSPOT records with a visible nonempty diagram, a valid single numeric key, unique metadata IDs and exactly one matching metadata key enter this compatibility path.
- Current choice labels/key/diagram must survive unchanged; unknown or mixed grammar still fails closed.
- Preserve raw source and projected fingerprints with a versioned, explicitly reviewed policy; never expose hotspots correctness metadata.
- Recheck all offered responses, permutations, presentation and complete teaching; grant no independent hotspot-position skill.

### native_slot_grammar — 8 rows

One versioned whole-response reusable-slot grammar over the delivered blanks and shared pool, using existing normalisation and stable-selection validation. Extend compiler, learner projection and whole grader together only in a separately authorised phase.

**Implemented offline:** Audit-only source-bound slot/value identity fixture and coarse all-slots matcher; no trusted revision or adapter registration.

**Blockers:**

- Removing selectionFeedback still fails Unsupported answer grammar; DISPLAY_FIELDS accepts only scalar data.
- The current gradeRevision non-choice branch expects ordered positions with distinct item values, incompatible with reusable selector values.
- Current learnerRevision exposes option/item components and ordering positions; it has no safe slot-prompt projection.
- Exam review omits per-slot explanations/value definitions; bespoke wrong slot/value contrasts and overlapping labels need semantic review.

**Acceptance criteria:**

- Freeze exact slot IDs, visible prompts, selectable values, accepted aliases and normalisation version into an immutable source-bound model.
- One input for every slot; reject empty/missing/duplicate/unknown/wrong-role/foreign identities while allowing value reuse.
- Validate normalised label collisions and selectable accepted values; preserve whole binary/coarse outcomes without per-slot mastery.
- Allowlist learner prompts and values while withholding expected mappings, solutions, hints where appropriate and source/private payloads.
- Complete practice/exam teaching and evaluate precise target/family/role/weight decisions independently before credit.

### converted_matching_slot_grammar — 11 rows

Reuse the same delivered-slot grammar as native fills. Treat retained items/targets/correctMapping as source-bound conversion history, not a second simultaneous answer grammar.

**Implemented offline:** Audit verifies all eleven exact conversions and uses the same slot fixture; no drag engine or new learner activity is added.

**Blockers:**

- Legacy matching structures persist alongside delivered blanks, but current practice/exam grade only the blanks.
- A bijection/ordering rule would change current UI semantics because values remain reusable.
- p223 is snapshot-only and has pattern-to-name instructions but name-to-pattern delivered slots.
- Current multi-target activities lack approved independent component skills and complete contextual wrong-choice teaching.

**Acceptance criteria:**

- Prove every delivered slot identity/prompt/value/solution is preserved from the reviewed conversion and choose one canonical delivered grammar.
- Do not derive the key from target position, shuffle order or an assumed once-only use constraint.
- Resolve instruction direction and retained metadata/teaching before canonicalisation; retain snapshot provenance without inventing an authored row.
- Apply the native-slot whole-grade, immutable-identity, learner allowlist, delivery and semantic gates without creating separate component weights.

The HOTSPOT helper removes exactly one field in a source-bound diagnostic object. It never edits the actual question or compiler. Four successful projected compiles therefore do **not** prove the original source is supported. A future explicit compatibility policy must bind original and projected revisions and retain raw-source provenance; blindly dropping all unknown fields is unacceptable.

The slot helper uses hash-derived diagnostic IDs and the existing normaliser, matcher and validateStableSelections. It does not implement a trusted persistence grammar, production API, database adapter or learner renderer. A future versioned compiler/projection/grader must be designed together and approved before changing any protected file. Current whole/coarse scoring does not justify independent slot weights or split skills.

## Exact 23-row source and presentation inventory

| Identity | Observed objective | Delivered / historical format | Input cardinality | Authored available | Snapshots / captures | Source citations |
| --- | --- | --- | ---: | --- | --- | --- |
| pbq:p007 | 4.8 | HOTSPOT / same HOTSPOT | 1 | yes | 0 / 0 | src/App.jsx:12474, src/data/sy0701PbqReview.js:63, src/data/sy0701ConciseExplanations.js:409 |
| pbq:p008 | 2.3 | HOTSPOT / same HOTSPOT | 1 | yes | 0 / 0 | src/App.jsx:12506, src/data/sy0701PbqReview.js:64, src/data/sy0701ConciseExplanations.js:410 |
| pbq:p012 | 2.2 | SELECT & FILL / FILL BLANK | 4 | yes | 0 / 0 | src/App.jsx:12577, src/data/sy0701PbqReview.js:68, src/data/sy0701ConciseExplanations.js:414 |
| pbq:p019 | 2.2 | SELECT & FILL / FILL BLANK | 5 | yes | 0 / 0 | src/App.jsx:12745, src/data/sy0701PbqReview.js:75, src/data/sy0701ConciseExplanations.js:421 |
| pbq:p022 | 3.1 | HOTSPOT / same HOTSPOT | 1 | yes | 0 / 0 | src/App.jsx:12796, src/data/sy0701PbqReview.js:78, src/data/sy0701SecondPassReview.js:533, src/data/sy0701ConciseExplanations.js:424 |
| pbq:p024 | 4.4 | SELECT & FILL / DRAG & DROP | 5 | yes | 0 / 0 | src/App.jsx:12862, src/data/sy0701PbqReview.js:80, src/data/sy0701SecondPassReview.js:629, src/data/sy0701ConciseExplanations.js:426 |
| pbq:p030 | 4.8 | HOTSPOT / same HOTSPOT | 1 | yes | 1 / 1 | src/App.jsx:12991, src/data/sy0701PbqReview.js:86, src/data/sy0701ConciseExplanations.js:432, src/data/sy0701PublishedSnapshot.js:1616, src/data/sy0701PublishedSnapshot.js:1620 |
| pbq:p031 | 5.4 | SELECT & FILL / DRAG & DROP | 5 | yes | 0 / 0 | src/App.jsx:13027, src/data/sy0701PbqReview.js:87, src/data/sy0701SecondPassReview.js:773, src/data/sy0701ConciseExplanations.js:433 |
| pbq:p035 | 3.2 | SELECT & FILL / FILL BLANK | 5 | yes | 0 / 0 | src/App.jsx:13119, src/data/sy0701PbqReview.js:91, src/data/sy0701SecondPassReview.js:724, src/data/sy0701ConciseExplanations.js:437 |
| pbq:p036 | 2.4 | SELECT & FILL / DRAG & DROP | 6 | yes | 0 / 0 | src/App.jsx:13133, src/data/sy0701PbqReview.js:45, src/data/sy0701ConciseExplanations.js:438 |
| pbq:p050 | 4.4 | SELECT & FILL / FILL BLANK | 5 | yes | 0 / 0 | src/App.jsx:13477, src/data/sy0701PbqReview.js:39, src/data/sy0701SecondPassReview.js:782, src/data/sy0701ConciseExplanations.js:452 |
| pbq:p056 | 4.6 | SELECT & FILL / DRAG & DROP | 5 | yes | 0 / 0 | src/App.jsx:13674, src/data/sy0701PbqReview.js:44, src/data/sy0701SecondPassReview.js:791, src/data/sy0701ConciseExplanations.js:457 |
| pbq:p061 | 2.2 | SELECT & FILL / DRAG & DROP | 5 | yes | 0 / 0 | src/App.jsx:13823, src/data/sy0701PbqReview.js:31, src/data/sy0701ConciseExplanations.js:461 |
| pbq:p062 | 2.3 | SELECT & FILL / SELECT & FILL | 4 | yes | 0 / 0 | src/App.jsx:13887, src/data/sy0701PbqReview.js:32, src/data/sy0701SecondPassReview.js:794, src/data/sy0701ConciseExplanations.js:462 |
| pbq:p067 | 4.5 | SELECT & FILL / FILL BLANK | 3 | yes | 0 / 0 | src/App.jsx:14056, src/data/sy0701PbqReview.js:35, src/data/sy0701ConciseExplanations.js:465 |
| pbq:p073 | 3.2 | SELECT & FILL / DRAG & DROP | 5 | yes | 0 / 0 | src/App.jsx:14236, src/data/sy0701PbqReview.js:21, src/data/sy0701ConciseExplanations.js:469 |
| pbq:p077 | 3.1 | SELECT & FILL / FILL BLANK | 3 | yes | 0 / 0 | src/App.jsx:14385, src/data/sy0701PbqReview.js:24, src/data/sy0701ConciseExplanations.js:472 |
| pbq:p079 | 4.5 | SELECT & FILL / DRAG & DROP | 5 | yes | 0 / 0 | src/App.jsx:14437, src/data/sy0701PbqReview.js:26, src/data/sy0701SecondPassReview.js:654, src/data/sy0701ConciseExplanations.js:474 |
| pbq:p082 | 3.2 | SELECT & FILL / FILL BLANK | 3 | yes | 0 / 0 | src/App.jsx:14543, src/data/sy0701PbqReview.js:10, src/data/sy0701ConciseExplanations.js:476 |
| pbq:p083 | 4.9 | SELECT & FILL / DRAG & DROP | 5 | yes | 0 / 0 | src/App.jsx:14576, src/data/sy0701PbqReview.js:11, src/data/sy0701ConciseExplanations.js:477 |
| pbq:p085 | 4.9 | SELECT & FILL / DRAG & DROP | 5 | yes | 0 / 0 | src/App.jsx:14661, src/data/sy0701PbqReview.js:13, src/data/sy0701ConciseExplanations.js:479 |
| pbq:p095 | 5.4 | SELECT & FILL / DRAG & DROP | 5 | yes | 0 / 0 | src/App.jsx:15010, src/data/sy0701PbqReview.js:17, src/data/sy0701ConciseExplanations.js:483 |
| pbq:p223 | 2.4 | SELECT & FILL / DRAG & DROP | 4 | no; snapshot-only | 1 / 1 | src/data/sy0701ConciseExplanations.js:487, src/data/sy0701PublishedReview.js:139, src/data/sy0701PublishedSnapshot.js:1646, src/data/sy0701PublishedSnapshot.js:1650 |

All four HOTSPOT diagrams are present and rendered in both practice and exam. The 19 slot activities contain **87 visible slot sentences and 87 selectable shared values** across their individual pools. These are source-derived visibility observations, not browser evidence or approval that every task is semantically sound. Empty surrounding scenarios in some activities do not hide their displayed slot prompts. No selected task requires a stored terminal answer, private payload or post-answer solution as its only critical premise.

Every row binds the actual authored (or null), preeditorial, local-effective, published and feedback revisions; source-line anchors; and field fingerprints across instructions, diagram/log/code/config, choices/key, hotspots, blanks, legacy items/targets/map, pool/teaching, objective/domain/difficulty. The packet withholds the actual prompts, options, keys and feedback. All 23 remain zero-credit preflights.

**p030** has one local captured snapshot/override alongside an authored row. **p223** has one captured snapshot/override and no authored row. The actual pure publication pipeline replays both captures and matches the current published fingerprints. Capture presence is not permission to bypass editorial precedence, reinterpret p223 as authored, fetch private content, or transfer local review to private variants. Relevant snapshot anchors are included in their row citations.

## Row-level semantic and teaching blockers

**pbq:p007 — hotspot_unused_metadata.** Prioritisation uses fictional confirmed active encryption, not proof every other alert is harmless. Unused hotspot labels retain older firmware wording while the displayed diagram says firewall update. No incident response is executed.

**pbq:p008 — hotspot_unused_metadata.** Current diagram is pseudocode rather than executable SQL. It asks for a concatenation location while main teaching also describes parameterisation/password verification; no implemented fix or independent authentication skill is demonstrated.

**pbq:p012 — native_slot_grammar.** Four channel/targeting labels overlap rather than mutually exclusive universal attacks. The first four prompts recur in p019. Whole correctness is not four independent skills or a new assessed family.

**pbq:p019 — native_slot_grammar.** Five overlapping channel/targeting labels include executive targeting; four prompts repeat p012. Require precise-label instructions and assessment/family approval, not bulk-only phishing or named-person-only targeting.

**pbq:p022 — hotspot_unused_metadata.** Unused hotspot metadata retains Application Data/IAM alternatives while actual choices use Runtime/Application. Wrong correction at index3 still contrasts IAM although that offered choice is Application. Align source/teaching before full review; the supplied unmanaged agreement is not a universal cloud allocation.

**pbq:p024 — converted_matching_slot_grammar.** Five product-function associations are a multi-target vocabulary activity; policy, deployment and visibility limit capabilities. No blocking, data loss prevention or verified tool configuration is assessed.

**pbq:p030 — hotspot_unused_metadata.** The fictional custody log supplies a missing handover record; no universal signature rule, legal admissibility, untouched-original rule or actual evidence handling is established. Preserve the earlier unsupported/teaching hold and observed uncalibrated difficulty change.

**pbq:p031 — converted_matching_slot_grammar.** Five high-level regime/scope matches mix industry standard and laws. Applicability/exceptions and authoritative legal scope need separate review; no compliance or legal conclusion is approved. Compare p095 without inferring independence.

**pbq:p035 — native_slot_grammar.** Five network/security terms mix device, zone, inspection and detection roles. Retain passive-IDS/inline-IPS context and bastion-versus-jump distinctions; the categorical prompt does not validate a deployed control or separate skills.

**pbq:p036 — converted_matching_slot_grammar.** Six malware categories overlap; retain denial/extortion and privileged-concealment qualifications. No observed malware, universal unique category or six separate trusted skills is approved. Preserve earlier combined-target deferral.

**pbq:p050 — native_slot_grammar.** Five monitoring terms mix telemetry, classifiers and decoys. Classification assumes stipulated ground truth; no observed false-positive rate, packet capture, UEBA implementation or independent components is measured.

**pbq:p056 — converted_matching_slot_grammar.** Five access models can coexist. Labels do not prove enforcement, strongest security or Zero Trust competence; retained drag instruction is hidden in exam and does not describe the selector UI. Preserve earlier semantic deferral.

**pbq:p061 — converted_matching_slot_grammar.** The PRIMARY delivery-method prompt mixes channel, recipient targeting and visited-site location. Phishing answer still uses broad-email wording while teaching explicitly rejects bulk-only definition. Hold dimension/specificity clarity and independence; no canonical card approval transfers.

**pbq:p062 — native_slot_grammar.** Four vulnerability recognition clues are stipulated facts, not executed database/browser requests or a validated exploit. Whole response asks four targets; approve scope/feedback and families separately before any new credit.

**pbq:p067 — native_slot_grammar.** Three mail protocols have distinct functions and can work together. Preserve alignment/either-pass and trust limits; no sender authentication or configured policy is tested. Keep the earlier combined-target deferral.

**pbq:p073 — converted_matching_slot_grammar.** Five zone purposes do not establish inherent internal trust, implemented isolation or a universal trust ordering. Guest access and management separation are source-specific premises; no network configuration is tested.

**pbq:p077 — native_slot_grammar.** Three slots combine two supplied service-contract duties with a CASB label; product integration and exact contract scope are unvalidated. No universal allocation or three separately assessed skills is approved.

**pbq:p079 — converted_matching_slot_grammar.** Five endpoint controls cover different functions with limits. MOST effective is not a comparative efficacy measurement, and matching does not implement encryption/EDR/allowlisting/firewall/patching. Preserve earlier combined-target deferral.

**pbq:p082 — native_slot_grammar.** Three connectivity/routing terms depend on configured paths and endpoint trust. Naming VPN/IPsec/split tunnel is not working encryption, routing enforcement or three independent skills.

**pbq:p083 — converted_matching_slot_grammar.** Five log-source question matches do not prove complete telemetry or attribution to a person. Recorded identities, enabled collection, DNS requests, URL visibility and endpoint coverage need corroboration; no logs are queried.

**pbq:p085 — converted_matching_slot_grammar.** Five artefact-purpose matches are investigation clues. Retention/configuration/tampering limit conclusions; a shortcut, startup entry or timeline artefact is not proof of a particular human action or successful execution.

**pbq:p095 — converted_matching_slot_grammar.** Five legal/standard labels repeat p031 scope associations with different wording. No current applicability, compliance, legal obligation or independent family is approved; separate authoritative review remains required.

**pbq:p223 — converted_matching_slot_grammar.** Authored row is unavailable; captured published snapshot supplies this local row, not a private variant. The scenario asks pattern-to-attack but delivered prompts present attack-name-to-pattern after conversion. Resolve direction/assessment target and retained historical interpretations; no actual network, badge, DNS or switch operation is executed.

Two concrete alignment issues require resolution before full review: **p022** retains Application Data/IAM hotspot metadata while its live choice list uses Runtime/Application, and its last wrong correction discusses IAM rather than the offered Application choice. **p223** asks for pattern-to-attack matching while its delivered slots present attack names and ask for patterns. These are current source findings, not proposed learner edits.

p012/p019 share the first four slot prompts; p031/p095 repeat regime/scope associations; p061 mixes channel, targeting and site location. These comparisons are review cautions, not automatically merged families or new assessed independence. Existing malware, access-model, protocol, endpoint, forensic, legal-scope and network limits remain unresolved. Legal applicability and product effectiveness were not independently validated by this mechanical feasibility review.

## Practice, exam and feedback behavior

The audit executes the actual pure whole/part/submit expressions at **src/App.jsx:26223**, **src/App.jsx:26229**, **src/App.jsx:26292**, exam grader/answered expressions at **src/App.jsx:26786**, **src/App.jsx:26793**, and initial-answer expression at **src/App.jsx:26681**. No real submit, persistence, reward, analytics, network, terminal, SQL, browser script, device, scanner or forensic operation is invoked.

HOTSPOT is currently a **single-choice activity**, not a clickable diagram region or separately graded coordinate. Practice and exam use the same whole index key. The four original diagrams/choice lists survive the diagnostic projection unchanged. All 16 actual offered paths agree: **4 correct,12 wrong**. Invalid or incomplete projected inputs fail closed through the existing trusted compiler/grade/learner helpers.

All 19 Select & Fill activities use the same **reusable shared selector** in both modes. The source at **src/App.jsx:21030** explicitly keeps every option available for every slot and permits reuse or non-use. All 11 retained matching conversions preserve the delivered slot IDs, prompt text, mapped label and explanation exactly; no legacy bijection or shuffled target-position rule is substituted. Seven activities are historical FILL BLANK, one historical SELECT & FILL, and 11 historical DRAG & DROP.

Practice requires all slots nonempty before submission and evaluates all-slot correctness plus a displayed partial ratio. Exam marks a partly filled activity answered but whole-grades it wrong until every expected value matches. Initial states are empty/unanswered. Hints are stripped recursively at **src/App.jsx:2445** and the exam workspace passes showHints=false; the same slot sentences and shared values remain. The matcher at **src/App.jsx:2457** preserves current case, whitespace, punctuation and British/American spelling behavior. A future immutable grammar must freeze these semantics rather than silently replacing them with raw string equality.

All 23 have a main explanation. The four hotspot main explanations appear through their correct-option teaching; the duplicate separate-main panel is suppressed by hasSeparatePbqSolution, so this is not missing main feedback. They provide **16 option bodies and 12 wrong corrections**, but p022's mismatch prevents completeness approval.

The 19 fills supply **87 slot explanations and 87 shared-value definitions** in practice. Exam review shows the slot prompt, chosen value and expected value, but omits **blank.explanation and selectionFeedback**; only the activity's main teaching is available separately. The shared definitions explain what values mean, not bespoke corrections for each wrong slot/value combination. **No one has approved the324 wrong slot/value pairings as complete contextual feedback**. Structural text presence does not close the36 full-feedback gaps.

## Bounded offline and adversarial proof

| Fixture | Coverage | Interpretation |
| --- | --- | --- |
| HOTSPOT offered responses |16 paths;4 correct,12 wrong|Actual practice/exam/trusted projected whole grades agree; original compilation remains blocked.|
| HOTSPOT display permutations |96 displays;384 grading paths|Stable choice identity and learner answer-field allowlist survive every four-option permutation.|
| Slot/value pairings |411 pairings;87 expected,324 wrong|Change one slot at a time in an otherwise complete response; all actual practice/exam grades agree with the diagnostic fixture.|
| Legacy fractional wrong responses |324|One incorrect slot still produces a partial practice ratio; diagnostic whole grade remains false, with no component mastery credit.|
| Shared-pool display permutations |2250 displays;4500 grading paths|Complete correct and one-wrong vectors retain grading under every pool permutation.|
| Reverse slot/response order |19 fixtures|Stable identities, not array position, determine the diagnostic result.|
| Invalid slot fixtures / projection failures |229 / 24|Reject empty/missing/duplicate/unknown/foreign/wrong-role identities, extra learner fields, private namespace, stale source and fixture tampering, even when a tampered integrity hash is recomputed.|

This is bounded proof over supplied values and selected complete vectors. It does not exhaust every response Cartesian product, arbitrary text/aliases, random distributions, React rendering or live attempt transport. Repeated selector values are valid input even when the resulting answer is wrong. Fixtures contain no new independent assessments or learner evidence.

The export guard additionally rejects **829 packet mutations**, including stale source/feedback/citation revisions, incorrect compiler support claims, hidden critical evidence, multi-skill credit, duplicate identities, private substitution, dropped prior holds, wrong denominators, raw grading/content export and activation. Original records stay null-trusted and unchanged even when a diagnostic projection compiles.

## Exact root-group and objective reconciliation

There are **36 currently compiler-unsupported local PBQs** overall. **13** already have prior pending question judgments, seven with full feedback; they are not re-reviewed or recredited here. Existing semantic judgments do not make their grammars supported. This slice targets only the other23. Prior outcomes are preserved rather than removed retroactively.

| Root group across the36 unsupported rows | Total | Prior questions | New questions | Combined questions | Remaining questions | Prior full feedback | New feedback | Remaining full feedback |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| hotspot_unused_metadata | 5 | 1 | 0 | 1 | 4 | 1 | 0 | 4 |
| native_slot_grammar | 12 | 4 | 0 | 4 | 8 | 1 | 0 | 11 |
| converted_matching_slot_grammar | 19 | 8 | 0 | 8 | 11 | 5 | 0 | 14 |

The root groups leave **23 question gaps and29 full-feedback gaps**: the23 unreviewed questions plus six older unsupported question-only feedback gaps. The seventh older feedback gap, p211, is outside this unsupported-format scope. Six supported question deferrals and their feedback account for the rest of the bank's29/36 gaps.

| Observed objective | Source-inspected rows: hotspot / native / converted | Broad pending / total | Broad remaining local / private | Bank questions pending / total | Bank question gaps | Bank full feedback pending / total | Full-feedback gaps |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| 2.2 | 0 / 2 / 1 | 74/134 | 60 / 0 | 18/21 | 3 | 18/21 | 3 |
| 2.3 | 1 / 1 / 0 | 60/162 | 102 / 0 | 21/25 | 4 | 21/25 | 4 |
| 2.4 | 0 / 0 / 2 | 108/199 | 91 / 0 | 40/42 | 2 | 40/42 | 2 |
| 3.1 | 1 / 1 / 0 | 101/220 | 119 / 0 | 23/26 | 3 | 23/26 | 3 |
| 3.2 | 0 / 2 / 1 | 87/220 | 133 / 0 | 24/27 | 3 | 24/27 | 3 |
| 4.4 | 0 / 1 / 1 | 36/120 | 84 / 0 | 11/13 | 2 | 11/13 | 2 |
| 4.5 | 0 / 1 / 1 | 67/169 | 102 / 0 | 15/17 | 2 | 15/17 | 2 |
| 4.6 | 0 / 0 / 1 | 97/151 | 54 / 0 | 33/34 | 1 | 33/34 | 1 |
| 4.8 | 2 / 0 / 0 | 53/130 | 77 / 0 | 24/27 | 3 | 22/27 | 5 |
| 4.9 | 0 / 0 / 2 | 20/96 | 74 / 2 | 6/9 | 3 | 6/9 | 3 |
| 5.4 | 0 / 0 / 2 | 39/115 | 76 / 0 | 12/14 | 2 | 12/14 | 2 |

Every objective has **zero new dispositions**; the23 preflight inspections are not additional judgments. Exact census IDs, revisions, statuses and remaining IDs are in the packet. The 11 affected broad catalogues contain **1716 summed memberships,1209 distinct records,298 shared records**. Each selected question has one observed objective; neither its tag nor overlapping support records approve canonical scope or additional global credit.

All-bank counts stay **454/483 questions**, **447/483 full feedback and complete pairs**, **395/395 MCQs**, **59/88 PBQ questions**, **52/88 PBQ full-feedback pairs**. There are still **29 question gaps and36 full-feedback gaps**. The current catalogue stays **1121 pending dispositions/proposals out of1878**, with757 remaining; authored support remains **220/834**, with614 remaining. All counts are pending review/approval rather than approved learning coverage.

## Preserved boundaries and final checks

Reconcile the74 prior packets,42 older distinct question judgments (30 MCQs+12 PBQs),22 duplicate references and seven limited support/link references. The latest11 card proposals and two card deferrals retain exact hashes and pending-owner status; they supply no canonical approval. Frozen triage remains inventory only. All prior earliest ambiguities, KEV limits, pilot/source/feedback links, RTO/RPO/MTTR roles, p014 single-key hold, p048/p211 roles, hidden-evidence holds, recent grading/delivery holds and13 recent semantic deferrals remain bound and unresolved.

Preserve the six supported deferrals **LOCAL p003,p009,p032,p047,p068,p074** and seven older full-feedback gaps **p004,p211,p011,p029,p046,p041,p043**. LOCAL p003 is not private p003. Private p003/p017 question/feedback fingerprints and null trusted identities remain unchanged; no private payload is fetched, exported or substituted. No owner, teaching, topic, concept, weight, calibration or independent-family approval is inferred.

The active package remains **1878 records,435 concept identities,2954 queued decisions,489 unresolved question mappings,seven existing primary proposals**. Frozen ledger SHA-256 **e0ceeec3c5cc8adb94b36175954a8cefaebcb4f29f4c66aa38c400f65de3bb12**; active package SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All **25 protected release hashes** remain exact. No runtime source, database, learner UI, scheduler, config, adapter registration or Phase 3 work occurs.

Run node scripts/audit-unsupported-pbq-remediation-design.mjs, npm run audit:content-mapping (29 tests plus deterministic package reproduction), and git diff --check before the task-only **[skip deploy]** commit/push. Verify the configured skip hook, exact HEAD=origin/main=remote and all three file SHA-256 values; preserve unrelated dirty/generated files. No browser, private database, learner-state flow or production verification is claimed.

**Phase 2B-5 remains NOT READY.** The design isolates reusable grammar work and explicit acceptance gates; it does not approve or activate the23 assessments.
