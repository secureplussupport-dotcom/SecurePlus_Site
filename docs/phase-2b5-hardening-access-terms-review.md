# Phase 2B-5 — hardening and vulnerability/access term decks

**NOT READY.** LOCAL/default-off/unwired/learner-invisible; 12 October 2026. Baseline **82781979e2c6eb5481955b581e36609693534ef5**. Packet SHA-256 **e64ef961820fd127f19b98bab7bea0357dc467d2d8530a9f9dafbcf93bc16c53**; focused audit SHA-256 **c4d7bb6b538f9d4a7f7ac4c4d10c805d4621175e6f7c8766bc8ab7d12eb20e98**. Only this packet, report and focused audit change.

## Exact scope and result

The master plan and Phase 1 audit were read in full earlier in this continuing session and remain source-bound. The master plan governs product decisions; the audit supplies current-state facts checked against source. The approved free-PBQ requirement/current preview-Pro-coin implementation gap is inherited; no entitlement or behavior changes here. No unresolved document conflict requires a behavior change in this slice.

Baseline **docs/drafts/phase-2b5-network-protocol-cards-remaining-proposals.json** (SHA **5b112e910a1832ea99b6ffeda6bb9d89f657fedc91b8476f47b5cc7b8614c4f2**), report SHA **14d5ee3b1d0740c2809d01059d47161a3ae143fd570e40d6f0f7f801c76757c2** and audit SHA **7ea7ed4d624e4a7c893357ba074661ccb091f3346e79ef4062c3b71c1b0a8e3f** bind the preceding census. Select exactly **13 inventory-only objective4.1 identities**: hardening-baselines container and four source-order children, then vulnerability-access-ops container and seven children. All source/census revisions and authored/delivered member records are pinned.

**10 card drafts and two navigation drafts qualify pending owner approval; Compensating Control is held at zero credit.** Hardening has four qualified child drafts; vulnerability/access has six and one hold, so that container remains partial. No learner wording is rewritten. Containers qualify only as navigation at bounded vocabulary scope, not full topics or objectives. Even the all-child-qualified hardening container has allChildrenApproved=false.

| Exact selected identity | Source line | Decision | Catalogue revision |
| --- | ---: | --- | --- |
| deck:chapter4-hardening-baselines | 544 | Navigation draft; owner pending | sha256:4e2bae22ec0db4e8d6a3a984411b1f73a6f73ccefa649be2c2d636dd39b3dc2e |
| flashcard:sy0701-term-chapter4-hardening-baselines-secure-baseline | 551 | Vocabulary draft; owner pending | sha256:e3f91334a3eeaa34d547415495ed64790de4e704b4ec2b1e0ade9e454a2ce49e |
| flashcard:sy0701-term-chapter4-hardening-baselines-hardening | 552 | Vocabulary draft; owner pending | sha256:460592e1e1859bcbccb0763ae4570f56bfaf915dc1ffe48f176b69904e4b0f3c |
| flashcard:sy0701-term-chapter4-hardening-baselines-application-whitelisting-blacklisting | 553 | Vocabulary draft; owner pending | sha256:56bf9a2776276ff7d31b33fb24fec371db80cfb70c42e1932ca9753163cb01db |
| flashcard:sy0701-term-chapter4-hardening-baselines-sandboxing | 554 | Vocabulary draft; owner pending | sha256:a66f48f2d7c6893003621b79e9525d66d0532e1cdb172ca0521e8e2199fc0140 |
| deck:chapter4-vulnerability-access-ops | 592 | Navigation draft; owner pending | sha256:40570b411ac80a076358f2a9824e683ae0cf1413cd8d78f1fe4f1953b5a95998 |
| flashcard:sy0701-term-chapter4-vulnerability-access-ops-vulnerability-scanning | 599 | Vocabulary draft; owner pending | sha256:14de760de83425a58d481cc162bf30976b7ada0e490ef3a272e58bf83f4d2bd1 |
| flashcard:sy0701-term-chapter4-vulnerability-access-ops-false-positive | 600 | Vocabulary draft; owner pending | sha256:f2c7782e47c4a2b6f298bed5c6ed0f5d2ff5a8d0193f84959119c10f3c9200d7 |
| flashcard:sy0701-term-chapter4-vulnerability-access-ops-false-negative | 601 | Vocabulary draft; owner pending | sha256:b61b1aeb23627b5bedf590cd1384528abc5c3fc866f120184fd3cd54a8a1d220 |
| flashcard:sy0701-term-chapter4-vulnerability-access-ops-patch-management | 602 | Vocabulary draft; owner pending | sha256:6f4513f4ec686af9d62bd252daf2326893b62ccf46bcd6c8f4b9eef8be8aadfa |
| flashcard:sy0701-term-chapter4-vulnerability-access-ops-compensating-control | 603 | HOLD; zero credit | sha256:3d1f93e707419d2488c507569a3eed0260cca85f0d8e89311973d92b0581e8fd |
| flashcard:sy0701-term-chapter4-vulnerability-access-ops-provisioning-deprovisioning | 604 | Vocabulary draft; owner pending | sha256:9c60228a0a780c44609651bbb565dcbdbf215f1df465288317593ec969c7119a |
| flashcard:sy0701-term-chapter4-vulnerability-access-ops-least-privilege-principle | 605 | Vocabulary draft; owner pending | sha256:32a98a66c4bcd7414ae3a87e5ce013924e8cce1133566e12ba043b56adcd2b15 |

Lines refer to **src/data/sy0701AcronymFlashcards.js**. Constructors/flattening and both complete makeTermSet blocks **src/data/sy0701AcronymFlashcards.js:37, src/data/sy0701AcronymFlashcards.js:64, src/data/sy0701AcronymFlashcards.js:720, src/data/sy0701AcronymFlashcards.js:543, src/data/sy0701AcronymFlashcards.js:591** bind title, description, topic, chapter, colors, tags, child order and all card fields. Catalogue parentId is absent; authored membership plus flattened setId derive parents. Direct term cards have no question snapshot/override precedence. Term names equal expansion; cardType=term and examples are absent. No face or example is invented.

Every draft/hold retains null primary/scope/canonical-role and trusted-revision proposals, empty assessed roles, zero mastery/question/feedback/family evidence, no independence, human/publication/activation approval or verified recovery. Existing support-node candidates have weight0; held cards have no link proposals. Secure Baseline's word approved does not grant owner approval to the draft or any real configuration.

## Whole-card semantic rationale

| Term | Decision and bounded interpretation |
| --- | --- |
| Secure Baseline | Qualify an organization-approved minimum security configuration as a configuration-management concept, not approval of this content or proof that any real system conforms. |
| Hardening | Qualify attack-surface reduction through unnecessary-function removal and safer configuration; the examples are not an exhaustive or universally safe procedure. |
| Application Whitelisting / Blacklisting | Qualify the contrast between allow-policy and deny-policy execution controls, without inferring perfect enforcement or that approved software is harmless. |
| Sandboxing | Qualify restricted execution intended to make host impact harder. The delivered cannot easily wording describes risk reduction rather than an absolute no-impact or no-escape guarantee. |
| Vulnerability Scanning | Qualify automated discovery/reporting of known weaknesses as the scanning role, not exhaustive coverage or confirmation that every reported weakness is real. |
| False Positive | Qualify a reported condition that is absent in the relevant ground truth and scope, rather than an analyst simply deciding to dismiss an alert. |
| False Negative | Qualify failure to detect a condition that is actually present, within the detector task being evaluated. |
| Patch Management | Qualify testing and deployment of corrective software updates as part of patch management; the short card is not a complete enterprise lifecycle or assurance of successful remediation. |
| Compensating Control | HOLD: the delivered alternative-when-primary-unavailable definition omits comparable protective effectiveness and could treat any available substitute as compensation. |
| Provisioning & Deprovisioning | Qualify creation, modification and removal of accounts/permissions as lifecycle work, without promising immediate or complete revocation in every connected system. |
| Least Privilege Principle | Qualify minimizing user/process/system access to what the assigned function needs, without asserting a particular role or implementation satisfies the principle. |

Full comparisonTeaching and qualificationHolds in the packet distinguish baseline/hardening; allow/block policies, audit/enforcement and bypasses; sandbox policy/kernel/broker limits; scanning versus remediation and ground truth for false positives/negatives; tested patches versus the full verified lifecycle; equivalent compensation; disabling/removal/timing and downstream access; and least privilege versus a valid login or role label. These are reviewer qualifications, with no canonical teaching approval or additional learner-visible text.

## Primary references and inspection limits

The following support only the listed portions. Indexed excerpts and historical implementation context are explicit. Interpretations do not constitute full-document/current standards conformance, legal/compliance guidance or validated deployment outcomes.

- [Definitions, primary indexed excerpt](https://csrc.nist.gov/glossary/term/baseline_configuration): Formally agreed configuration and change-control concept, not actual SecurePlus owner approval.
- [Definitions](https://csrc.nist.gov/glossary/term/hardening): Reducing attack possibilities by patching and removing nonessential services.
- [Abstract/executive summary; Sections2.3 and2.7](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-167.pdf): Execution-control policy, audit versus enforcement, attributes and bypass considerations; no implementation assessment.
- [Definitions](https://csrc.nist.gov/glossary/term/sandbox): Restricted permissions/resources and controlled execution, within each identified source context.
- [Overview and design principles](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/design/sandbox.md): OS-dependent example; VM/emulation alone not security; not a universal sandbox guarantee.
- [What does and does not protect; communication channels; startup/handles; IPC bugs](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/design/sandbox_faq.md): Historical Chromium implementation example of policy, kernel and broker limitations; old platform examples not current support assertions.
- [Section4.3 application-scanning limitations, primary indexed excerpt](https://nvlpubs.nist.gov/NISTpubs/Legacy/SP/NISTspecialpublication800-115.pdf): Automated scan errors and interpretation/calibration, not observed scan coverage.
- [Scanner false-positive/false-negative discussion, primary indexed excerpt](https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8011-4.pdf): Reported absent vulnerability versus missed present vulnerability; direct find unavailable, not a full document audit.
- [Abstract](https://csrc.nist.gov/pubs/sp/800/40/r4/final): Enterprise patch planning, acquisition, installation and verification lifecycle.
- [Sections2.2/2.3 and opening Section3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-40r4.pdf): Testing, software/firmware scope and risk/availability tradeoffs; not successful patching.
- [Definitions](https://csrc.nist.gov/glossary/term/compensating_security_control): Equivalent/comparable protection in the stated baseline contexts; no generic substitute approval.
- [Requirement03.01.01 and discussion, primary indexed excerpt](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/800-171r3/NIST.SP.800-171r3.html): Policy-driven account creation/modification/disabling/removal and defined notification timeframes in CUI context; no universal timing claim.
- [Definitions](https://csrc.nist.gov/glossary/term/least_privilege): Minimum necessary resources and privileges for assigned function, not verified enforcement.

## Actual delivery, access and selector checks

Pure mode **src/App.jsx:30820**, name predicate **src/App.jsx:458**, chooser **src/App.jsx:30837** and face **src/App.jsx:30923** sources confirm term-only definition mode: **11 offered faces**, **22 unavailable acronym/example preference fallbacks**, and **33 reversed-order face comparisons**. Front is the full meaning; back is the term and repeated definition. Acronym requests normalize to definition, and even a directly forced acronym direction cannot turn a marked term card into an acronym test. No example/expanded-acronym assessment is offered. Reordering, repeat definitions and prompts create no independent evidence.

Navigation **src/App.jsx:31898** opens ordinary decks for guests/free users. Term decks bypass the chooser and start definition mode for guests and signed-in users alike; saved mode defaults do not override this branch. Sixteen source-derived opening probes (two decks × guest/signed-in × four defaults) confirm this with synthetic callbacks only. Lab **src/App.jsx:30903** displays plain text without GlossaryText popups. Source mastered IDs are local, with conditional Supabase sync; no browser/account, network, storage, telemetry or actual learner handler runs. Lexical glossary-usage records stay context only.

Rate source **src/App.jsx:31011** executes four synthetic paths: Again/Got it for each four/seven-card deck. Completion requires each distinct child; duplicates do not count twice and the penultimate child does not complete a pass. The held card still exists in the runtime seven-card deck. Self-rating/completion never establish a graded answer or trusted mastery.

Related matcher **src/App.jsx:734** and tokens **src/App.jsx:656** use each entire deck, including held text. Hardening links **lesson:endpoint-mobile-hardening, lesson:platform-cloud-hardening, lesson:ot-iot-cyber-physical**; vulnerability/access links **lesson:security-operations-automation, lesson:identity-zero-trust, lesson:incident-response-monitoring**. Exact lesson/profile revisions are bound without fresh lesson/remediation approval. Clicking those links requires an account then Pro; starred decks suppress them.

Weak source **src/App.jsx:657** uses chapter/topic/token matching. Synthetic chapter4 with each deck topic produces 18 distinct cards: own-deck counts **4/7**, whole-slice counts **8/7**. Other selected cards gain no semantic credit, and the held card can be recommended without approval. Missing/unknown chapter returns null. Random source/config **src/App.jsx:497, src/App.jsx:414** runs six preserve-order term-only probes for definition/acronym preferences and 10/20/30 requested cards: effective mode is always definition, actual counts **10/11/11**. An acronym-only request over this term pool selects zero cards. Production randomness/saved decks are not observed.

Entry sources **src/App.jsx:28061, src/App.jsx:24140, src/App.jsx:24294, src/App.jsx:34421, src/App.jsx:32155, src/App.jsx:33571** show different weak-deck gates: assistant open/preview and inventory require Pro, while the dashboard recommendation has no Pro check and root/initial assistant-object opening has no tier check. This is a source-observed entry-point mismatch, not a uniformly Pro-gated entitlement or a fresh account result. Random study has no account gate in its callback; saving prompts guests to sign up. No existing entitlement is changed.

Next-deck source **src/App.jsx:464** binds actual successor containers **deck:chapter4-monitoring-logging, deck:risk-governance-business** without new content approval. All **seven selector bindings**, next navigation, recommendation/context links and self-ratings remain unapproved interventions, with no canonical concept routing or demonstrated post-miss recovery.

## Lineage and exact arithmetic

Reconcile **87 prior packets** against actual substantive rows, source signatures and immutable census. Prior instructional occurrences397/distinct389 retain eight repeats;12 new distinct drafts yield **409/401**. Six limited links remain uncredited. Older question-only42 (30MCQ/12PBQ),22 duplicates and seven support-only references retain their treatment.

Preserve **45 inherited explicit held rows**, including SRTP/SSH/VPN, plus **56 exact hold/lineage fields**. One new hold yields46 held identities. Password/Rainbow Table and network partial-container states, all earlier glossary/card/semantic holds,23 unsupported PBQ design/compiler/delivery holds, seven older feedback gaps and canonical/taxonomy/pilot/KEV/recovery/independence/component/owner/operational limits remain unresolved. Four private p003/p017 question/feedback records remain unavailable, unreviewed/null-trusted, without private fetching or local substitution.

| Measure | Prior | New | Combined pending | Remaining |
| --- | ---: | ---: | ---: | ---: |
| Support /834 |378|12|390|444|
| Catalogue /1878 |1279|12|1291|587|
| Cards /313 |134|10|144|169|
| Containers /29 |9|2|11|18|
| Glossary /162 |98|0|98|64|
| Questions /483 |454|0|454|29|
| Full feedback /complete pairs /483 |447|0|447|36|

MCQ questions/pairs stay395/395; PBQ questions59/88 and pairs52/88. Seven older feedback-only gaps remain seven. Held identities are reviewed but remain outstanding for qualifying-draft accounting. The legacy newPartialDeckProposals counter counts both pending scoped navigation drafts; separate child coverage records distinguish one all-child-qualified container and one with a hold. It is not a claim that both have unresolved child text.

Observed tags yield **38 new objective memberships** (hardening5 identities×2; vulnerability7 qualifying identities×4), not38 global credits. Metadata does not approve canonical scope or full competencies. All18 objective/by-kind/global censuses reconcile:

| Objective | Candidates | Prior | New cards / containers | Combined pending | Remaining local / private |
| --- | ---: | ---: | --- | ---: | --- |
| 2.2 | 134 | 115 | 0/0 | 115 | 19/0 |
| 2.3 | 162 | 142 | 0/0 | 142 | 20/0 |
| 2.4 | 199 | 181 | 0/0 | 181 | 18/0 |
| 2.5 | 66 | 40 | 0/0 | 40 | 26/0 |
| 3.1 | 220 | 111 | 0/0 | 111 | 109/0 |
| 3.2 | 220 | 140 | 0/0 | 140 | 80/0 |
| 3.3 | 164 | 75 | 0/0 | 75 | 89/0 |
| 3.4 | 176 | 79 | 0/0 | 79 | 97/0 |
| 4.1 | 203 | 124 | 10/2 | 136 | 67/0 |
| 4.2 | 68 | 39 | 10/2 | 51 | 17/0 |
| 4.3 | 86 | 62 | 6/1 | 69 | 17/0 |
| 4.4 | 120 | 41 | 0/0 | 41 | 79/0 |
| 4.5 | 169 | 73 | 0/0 | 73 | 96/0 |
| 4.6 | 151 | 103 | 6/1 | 110 | 41/0 |
| 4.7 | 42 | 12 | 0/0 | 12 | 30/0 |
| 4.8 | 130 | 54 | 0/0 | 54 | 76/0 |
| 4.9 | 96 | 25 | 0/0 | 25 | 69/2 |
| 5.2 | 141 | 67 | 0/0 | 67 | 72/2 |

Objective4.1 **136/203,67 remaining**;4.2 **51/68,17**;4.3 **69/86,17**;4.6 **110/151,41**. Other objectives are unchanged. Bind **2547 total metadata memberships**, **1421 distinct objective-associated records**, **536 shared records**, and **307 inherited overlaps**, with no duplicate global credit.

## Validation and delivery boundary

Run **node scripts/audit-hardening-access-terms.mjs**, **npm run audit:content-mapping**, **git diff --check**. The focused audit rejects **1518 adversarial packet mutations** covering source/member/face/parent drift, unavailable modes, unsafe exports, invented approval/security outcomes, lost holds, inflated/duplicated credit, access/matching/progress and trust/activation. JSON round-trip, deterministic packet/report reproduction, no runtime import, all13 identities/11 whole cards/two containers, seven selectors,16 synthetic term-opening probes,87 prior packets, all18 censuses, **256 bound files** and **25 unchanged protected release hashes** are checked.

All29 mapping tests and deterministic unchanged active-package reproduction passed before the task-only three-file commit/push. Verify configured [skip deploy] behavior (marker0/control1), unstaged unrelated work, empty post-commit index, final HEAD=origin/main=remote, exact remote artifact SHA-256, ledger/.gitignore and all25 protected hashes. Resulting commit/artifact hashes are reported separately; the report cannot self-bind its own hash.

No fresh learner browser, real account/progress operation, private/database read, production action, migration/deployment/activation, runtime or entitlement change, Phase3 or another slice. Owner/canonical roles/scope, private coverage, supported complete feedback/premise delivery, independent/calibrated learning and release/rollback gates remain open. This finite slice is complete with one hold; **Phase2B-5 NOT READY**.
