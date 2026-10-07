# Phase 2B-5: objective 1.2 resilience lesson review

**LOCAL SEMANTIC PROPOSALS — NOT READY.** Ten additional source records have pending dispositions, bringing the broad objective-1.2 census to **96/126**. The remaining **30** are 13 cards, 16 glossary definitions and one deck container. These are review counts, not approved coverage, closed queue items or independent mastery evidence. No unresolved master-plan/audit conflict was found; approved product decisions remain unchanged.

Baseline: `0f9f01349f15fcd1f9192785d1d02b2fd4ca94ba`. Packet: `docs/drafts/phase-2b5-objective12-resilience-lesson-proposals.json`, SHA-256 `8dd1cae60ca07bad8d4046e7653beafd05f4f02bd66d12763cd0c621a90a36de`. It binds the authored lesson, actual profile, helpers, renderer, selectors and all five prior packets. Source object and paragraph/row revisions are checked separately. No question, model-answer payload, grading key, private payload or learner history is exported.

| New record | Pending scope and meaning |
| --- | --- |
| Lesson container | Mixed navigation; inherited tags and aliases are not independent instruction. |
| Asset section | 4.2 ownership, support state and sanitization; no recovery-metric inference. |
| Recovery table section | 5.2 metric distinctions; 3.4 architecture context. Four separately bound rows. |
| Continuity/physical section | Paragraph 1: 3.4 resilience. Paragraph 2: 1.2 physical layers and deception; 1.1 functions are context. |
| Keyword guide | RTO/RPO: 5.2; secure baseline: 4.1. Three separately bound definitions. |
| Trap bundle | Timing: 5.2; availability/backups: 3.4; monitored decoy: 1.2. |
| Reveal check | 5.2 timing distinction, model-answer reveal rather than submitted assessment. |
| Three displayed generated checks | Same vocabulary-guide recall; shared vocabulary context, no per-check keyed concept export or family credit. |

These per-unit proposals follow the [official SY0-701 objectives v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be): named recovery metrics occur under 5.2; resilience under 3.4; asset management under 4.2; secure baselines under 4.1; physical/deception concepts under 1.2. The current profile remains `3.4 / 4.2 / 1.2`; new scope proposals do not silently rewrite it.

RTO concerns restoration timing and RPO concerns the recoverable data point/tolerated loss; neither is a guarantee of an observed successful recovery. [NIST SP 800-34 Rev. 1](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-34r1.pdf), §3.2.1, distinguishes these targets and their relationship to acceptable disruption. The table also separates MTTR averages from incident deadlines and MTBF from non-repairable lifetime. Availability language in the continuity paragraph provides no automatic RTO/RPO/MTTR evidence. The pending pilot locator for section 1 already links RTO, RPO and MTTR; it is preserved, not counted as a new record or a rendered UI anchor. MTBF retains a supporting node. BIA appears only as an alias, and MTD is not taught in this lesson.

## Delivered source flow and limits

The selected lesson is Pro gated; the fixed free preview is `web-social-dns-attacks`. Its six guided steps are keywords, three sections, traps and reveal check. Paragraph first sentences are visible; supporting sentences use native disclosures. Four table tabs display one metric row at a time. Keywords likewise display the selected entry. No section is marked beyond textbook. “Applied” is an authored instructional label, not calibrated assessment difficulty.

The helper generates six checks, but the page takes only the first three keyword checks. The three comparison checks and nine generated helper cards are excluded, with exact package-exclusion signatures. The comparison helper stops at three rows, so it does not even generate a fourth MTBF check. No helper card is imported by the page. These unused outputs cannot inflate delivered assessment coverage.

For an accessible lesson, practice feedback appears after submission, includes the main correction and collapsed details for all wrong options, and has no additional Pro feedback gate. Completion is a local self-report; best practice score is local vocabulary recall. Neither has a trusted revision adapter. Related PBQ/Smart Review actions delegate using the broad domain; the flashcard action selects the first overlapping deck (`security-principles-access-models`), not a verified recovery deck. That deck and its cards receive no new dispositions in this slice. All delivery observations are source-level; no fresh browser or live private-data verification is claimed.

## Miss usefulness and overlap

Twenty pure single-miss fixtures reproduce the actual legacy recommendation helper using the previously reviewed MCQs. They read no learner history. The packet keeps their exact prior revisions and candidate lesson IDs, without approving those routes as remediation.

- Availability (`m002`): resilience provides availability context, but the foundation lesson teaches the CIA distinction directly. No recovery mastery follows from an availability miss.
- Integrity (`m033`, `m103`, `m399`, `m656`): references to corruption do not teach the assessed integrity property. The helper can still recommend this lesson; that mismatch is recorded.
- Vestibules (`m036`, `m602`): a passing physical-control mention is partial support, not complete interlock/occupancy correction.
- Decoy (`m260`): the paragraph and trap provide useful recognition teaching. Their overlap with existing feedback does not establish delayed recovery or a new family.
- Zero Trust, least privilege, split duties and dual control: this lesson does not target those required decisions. Its physical paragraph likewise does not supply the stated-site ordering correction assessed by `p055`.

Table rows, guide entries, traps, reveal check and generated vocabulary checks repeat related instruction; they are not independent outcomes. Prior foundation/identity lessons, earlier question families and CIA/MAC/RBAC/TOU ambiguity dispositions remain unchanged. Ambiguous CIA identities and missing exact asset, sanitization, availability, decoy and vestibule identities stay withheld rather than being invented. Existing canonical recovery nodes are linked only where timing is actually taught, as instructional support with weight zero; topic/support nodes are never promoted into mastery.

## Separately scoped follow-ups

The inherited “Used in objective” chips incorrectly imply every keyword shares all three profile codes. Per-unit objective metadata needs a separate content change. The sanitization paragraph mentions verification but omits the distinct final validation/acceptance step described by [NIST SP 800-88 Rev. 2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-88r2.pdf), §§4.5.1–4.5.2. Verification checks execution results; validation decides whether sanitization is effective enough to accept. This slice changes neither teaching text nor policy.

Keyword/comparison tabs and practice radios use buttons with selected state, but their rendering blocks lack arrow-key group handling and explicit tab/panel associations. A separately scoped keyboard/screen-reader review should resolve those concerns. No browser accessibility pass or learner-visible fix is claimed here.

## Validation and release boundary

Validation passed: `node scripts/audit-objective12-resilience-lesson.mjs`; all 29 tests in `npm run audit:content-mapping`; exact package reproduction; and the Vercel skip-marker guard. `git diff --check` passed before staging. The focused check rejects source drift, stale subunits, inherited scope promotion, keyed per-check mappings, invented primary/trusted identities, mastery weights and family credit. It verifies the 10/96/30 census, 12 unused outputs, current selectors, miss fixtures and all 25 active release checksums. The standard audit reproduces the unchanged package and checks its existing invariants.

The package remains SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`: 1,878 records; 435 concepts (5 mastery, 28 topic, 402 supporting); review queue 2,954; unresolved question mappings 489; existing primary question proposals seven. New approved mappings and eligible evidence: **zero**. Private selected `p017` remains unavailable at `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted revision null, no substitute or fresh query.

Task-only commit/push uses `[skip deploy]`. Adaptive runtime remains unpublished, unwired, default-off and learner-invisible. No deployment, live migration, activation, shadow writes or cohort change is authorized by this review. The next bounded slice is the remaining instructional card/glossary/deck review; Phase 2B-5 and production migration remain **NOT READY**.
