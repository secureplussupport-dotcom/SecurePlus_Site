# Phase 2B-5 — cross-objective recovery candidate census

7 October 2026. Baseline `080bb3cb63c1689f07c9bfb65548d4730716bb06`. **Local proposal only; Phase 2B-5 and production remain NOT READY.**

Screened all 480 effective local assessments whose existing objective is not 3.4. Retained and manually read all **111 candidates: 92 MCQs / 19 PBQs**. Classifications: **8 direct semantic overlaps, 19 contextual mentions, 84 irrelevant matches**. This narrows the prior three-question metadata census; it does not establish complete bank-wide semantic coverage, independent family counts, approved scope or learner evidence.

## Exact sources and reproducible selection

- [Candidate census JSON](drafts/phase-2b5-cross-objective34-census.json), SHA-256 `2613a81bfc9a9720a90f5225d1265df3f538f5bcf543e29c9a4a2dc9b224b782`.
- Effective local bank: `sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391`, 395 MCQs / 88 PBQs. Uses the existing effective-bank reader and publication precedence, not raw authored substitutes.
- Unchanged inventory/mapping package: `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`; pins the delivery inventory, reader, master plan, Phase 1 audit and existing taxonomy/mapping sources.
- Prior objective 3.4 proposal: `ceb33e92b12cde3c0a2c19f6d089f7b88f6cacf3263c86efc491f8b5b88cdaa2`; m177/p026/p211 are excluded here and cross-referenced without duplicate review.
- Prior objective 5.2 proposal: `de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c`. Pending owner packet stays `01f96e9c4edff2ef61d25c296fb96c585ad1a00db0709f47c0d261b7fbb5d953`, with no boxes checked.

The JSON stores exact regex rules and a per-candidate rationale, original objective, observed difficulty/format, local semantic revision, separately captured published-record revision, captured trusted revision and precision. The original objective is preserved even when an answer shares 3.4 reasoning. No objective reassignment, canonical primary/secondary role, human approval, weight or family credit is proposed.

Search every string leaf, including stems/scenarios, options/items/blanks/keys, diagrams/logs/configuration, explanations/feedback and metadata. Five rule groups cover inflected recovery/backup/continuity terms and metrics; availability/redundancy/failover/clustering; sites/diversity; exercises/capacity/power; and functional paraphrases such as battery, alternate facility, distributed requests and continued operations. This deliberately includes distractors and wrong feedback to reduce narrow keyword exclusion. For example, the added paraphrase screen finds m615's distributed traffic and m731's continued operation; inspecting their answers rejects both as 3.4 implementations.

Read every retained candidate's complete stem/scenario, all options or matching/ordering rows, key and feedback; also read PBQ diagrams, logs and configuration. Classification is a semantic judgment after inspection, not an automated keyword-to-concept map. “Direct” means at least one required decision shares resilience/continuity/backup/testing reasoning. A metric, phase, function or contractual target alone is contextual; unrelated meanings, distractors and wrong feedback are irrelevant. These judgments are local agent proposals. **369 unmatched assessments were screened but not semantically reviewed**; synonyms or implicit reasoning may remain. Private/live data, starter questions, guest demos, lesson checks and unpublished drafts are outside this assessment screen.

## Required reasoning found outside the original label

| Candidate / original objective | Actual answer requirement | Effect on apparent gap |
| --- | --- | --- |
| m088 / 5.2, medium MCQ | Choose retained three-hour backup versions meeting four-hour RPO; reject live replication with no history after deletion | Backup-frequency/recoverability reasoning already exists outside 3.4. Reuse its existing `versioned-backup-interval` comparison and prior pilot proposal; do not commission another interval/deletion variant merely to fill a 3.4-labelled slot. |
| m068, m352, m630 / 4.8, easy MCQs | Recognise discussion without live system changes as tabletop rather than operational testing | The claim that testing methods have no assessment is too broad. These three share one narrow distinction; do not count them as three independent families or proof of executing a recovery test. |
| m708 / 2.5, medium MCQ | Choose distributed upstream CDN/DDoS capacity with restricted origin access rather than resources behind a saturated link | Partial availability/capacity reasoning exists. It does not size infrastructure/personnel, compare HA clustering, or establish platform/multi-cloud independence. |
| p041 / 3.3, easy SELECT & FILL PBQ | One row selects encryption before shipping backup tapes off site, with protected keys; other rows concern different data states | Backup-media encryption has direct content overlap. No isolated outcome, new canonical identity or independent family is established. |
| p043 / 4.8, easy SELECT & FILL PBQ | One blank identifies tabletop discussion; other blanks concern custody, legal hold, hunting and forensics | Reuses the same tabletop distinction inside mixed terminology. It does not add independent testing coverage or component evidence. |
| p048 / 5.2, medium ORDERING PBQ | Apply supplied BIA recovery targets after safe downtime procedures; dependencies and serial resources are stated | Continuity recovery-priority application already exists. Preserve `supplied-recovery-priority-ordering` from the existing proposal; sorting supplied priorities does not derive a BIA or prove a specific concept per row. |

These eight overlap candidates contain three easy and two medium MCQs, two easy and one medium PBQs, and zero hard assessments. This is an observed distribution, not difficulty calibration. Existing labels remain 5.2/4.8/2.5/3.3. The [prior 3.4 review](phase-2b5-objective34-semantic-review.md) separately covers differential restore-set identification, the supplied recovery workflow and p211's mixed recovery/retention design. The WORM storage/malware collision remains unresolved; malware Worm matches here do not repair it.

## Context and rejected matches

All 19 contextual candidates are retained with their own exact-source rationale: m002/m011 (availability harm/mitigation), m018/m095 (fail-closed tradeoff), m022/m169/p025 (containment before unsafe recovery), m032/m635 (RTO definition), m086/m196 (BIA/MTD planning inputs), m091/m645 (SLA commitments), m118 (HSM custody with backup context), m154 (clinical safety/availability constraint), m168/p004 (IR lifecycle with a recovery step), m639 (change backout), and p060 (corrective/recovery control classification). They are useful comparison or prerequisite material; none is promoted to direct resilience implementation evidence.

The other 84 candidates are rejected for their tested understanding, not dropped silently. Notable traps include malware Worm (m054/m125/p036), forensic memory snapshots (m098), Kubernetes cluster authorisation (m451), public repository snapshots (m607), privacy retention (m030/m090), password/key recovery (m159/p018/p058), custody continuity (p030), forward-secret cryptographic recovery (m705/m717/p224), and platform diversity offered as a wrong answer (m653). These cannot fill backup, HA, storage-retention or multi-cloud coverage merely because a term matches. The JSON lists every rejected record and reason.

## Remaining gaps and next draft decision

| Apparent gap | Result of this check | Next useful bounded work |
| --- | --- | --- |
| Backup frequency/recoverability and encryption | Partly covered by m088 and p041, alongside m177's existing differential restore-set distinction | Compare current and earlier recovery drafts before adding variants. p041 needs separate grammar/component work and scope review; its presence is not eligible mastery coverage. |
| Testing methods | Tabletop recognition exists, repeatedly; no retained answer evaluates a restored service's measured test result | **One original recovery-test-result question is warranted as a candidate for the next local drafting slice.** First compare unmatched candidates/earlier drafts against this specific reasoning goal; then design a result interpretation that goes beyond “assume tested restoration.” No question is commissioned, authored or credited here. |
| Capacity/availability | m708 tests upstream distributed capacity; no retained answer sizes resources or compares clustering versus balancing for a stated failure | Review implicit architecture reasoning in unmatched questions before declaring absence. An eventual draft must assess a distinct resource/failure decision, not reskin m708. |
| Platform diversity / multi-cloud correlated dependencies | No retained answer chooses independent failure domains; cloud responsibilities and cluster privilege are different | Focused semantic review of unmatched architecture questions remains necessary before a new draft or bank-wide shortage claim. |
| Power continuity / recovery-site selection | No retained answer selects UPS/generator behaviour or compares hot/warm/cold readiness under a requirement; p211 remains the prior mixed hot-site case | These survive as **provisional screen gaps**. Check unmatched implicit power/site scenarios and prior drafts before commissioning original cases. |
| Continuity workflow / protected retention | p048 supplies priority ordering and p004 includes IR recovery; neither teaches a full defensible restore/acceptance/cutover workflow. No retained answer establishes administrator-resistant storage retention | Prior workflow teaching and storage identity blockers remain. Reuse the exact dependency audit rather than treating phase vocabulary, legal retention or malware Worm as their solution. |

“Warranted” here is a proposed original reasoning goal under the owner's delegated local question/family authority, not proof of an independent family or a canonical identity. The comparison is required before family credit. All other possible drafting areas remain conditional. No shortage budget is declared satisfied; no human review is fabricated. Detailed scope judgments are inferences from inspected answers, using the official objective boundaries already cited in the prior 3.4 report.

## Grammar, private boundary and checks

All 19 PBQs retain captured coarse precision and zero component evidence. The direct-overlap p041/p043 grammars remain **unsupported** by the trusted compiler, with null trusted revision IDs; the audit verifies rejection. Their visible blanks/items are not trusted concept outcomes. p048 still compiles to its separately captured revision, but its whole ordering score cannot isolate BIA/RTO mastery. Other records retain captured trusted IDs/nulls without a new claim that every grammar was compiled here.

Private p017 remains separately bound to `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`; selected payload unavailable, trusted revision=null, no source refresh or local fallback substitution. No private source was added to the screen and no private semantic completeness is claimed.

Run `node scripts/audit-cross-objective34-census.mjs`. It reproduces selection, checks all 111 exact local/published/captured revisions and original objectives, validates the partition and zero proposal flags/weights, preserves the separate private boundary, checks runtime non-import and all 25 release-file hashes. Seven negative cases reject stale local revisions, silent relabelling, distractor promotion, positive PBQ weight, invented trusted revision, direct concept promotion and dropped candidates. Search fixtures cover paraphrase and option/feedback matching. These checks verify reproducibility and boundaries, not independent editorial or psychometric approval.

Passed: dedicated audit/reproduction, prior objective-3.4 and objective-5.2 audits, owner-packet audit, all 29 content-mapping tests and byte reproduction, staged whitespace and `[skip deploy]` check. No new browser, build, database, private-catalogue or deployment verification is claimed for this offline census.

**NOT READY.** No active mappings, owner decisions, teaching, runtime, publication or learner flows change. Current identity/role/scope decisions, independent semantics, wider coverage, grammar/component attribution, private processing and calibration remain unresolved. Task-only commit/push with `[skip deploy]`; unrelated dirty files stay unstaged.
