# Phase 2B-5 — fourteen guest-demo records

Date: 2026-10-14. Baseline: `ec03d252091b6a6f4d9093d6b0a06fd2e74fc74f`. **LOCAL/default-off/unwired/learner-invisible; Phase2B-5 and production NOT READY.**

All 14 named guest-demo records were reviewed. Six bounded teaching proposals qualify: one MFA card, two standalone explanation snippets and three short lesson-preview prompts. Eight records add new holds: both assessment demos, both feedback bundles, the ordering hint and three review paths. All 133 prior distinct holds remain unresolved, giving **141** total. No selected identity overlaps a prior hold, and no requested record is deferred to another slice.

Catalogue proposals advance **1652+6=1658/1878**, leaving **220**. Support stays **725/834**, leaving 109, because these guest kinds are outside that834 support scope. Main-bank counts stay **463/483 questions, 464/483 full feedback and 456/483 COMPLETE pairs**. Nine starter pairs stay **0/9**. Guest assessment pairs separately remain **0/2**; none is added to the 483 bank.

The master plan remains approved product authority; the Phase1 audit supplies historical verified current-state evidence. Both were read in full earlier in this continuing session. This review changes no product decision or learner behavior. The six judgments are Codex local proposals pending owner review, not human approval. Canonical roles, objectives, difficulty/skills, teaching links, family independence, trusted revisions, mastery, efficacy, publication and activation remain unapproved. Only this report, its packet and focused audit change.

## Actual reachability and preview context

The guest app mounts GuestDashboardGate, which maps fixed showcase features into GuestFeatureShowcaseCard and then GuestFeaturePreview. Each showcase has its own component state. The preview has no signup or Pro check and uses no account attempts or adaptive runtime. Buttons that open the full MCQ/PBQ/flashcard/lesson product are separate from preview interactions; this review does not infer those destinations' access or teaching from the preview. Source reachability is verified; no current production page or browser session is observed.

The in-view observer controls presentation classes. It does not generate content or validate learning. The MFA card has manual flipping and a 6.2-second automatic flip; reduced motion disables the timer, while in-view status does not gate it. Both faces are mounted and aria-hidden/visual flip state select the presented face. This is a recall showcase, not a graded recall task or measured retention result.

The MCQ answers immediately on click and permits retries. Both explanation snippets are always visible in a separate sibling showcase, regardless of the MCQ answer state. Their buttons change emphasis, not whether the text is revealed. They are useful standalone teaching pieces, but they cannot silently become the MCQ's complete selected-answer feedback.

The lesson preview changes a one-sentence prompt by fixed title lookup. It does not open an actual Deep Dive or run a test. Three comparison/attention cues qualify only as their exact prompt records, not full lessons, detection skill or fulfillment of a complete Learn→Test journey. The broader feature CTA is separate.

## Exact fourteen revisions and dispositions

| Exact record ID | Authored / effective / catalogue revision | Local disposition | Source |
|---|---|---|---|
| guest-demo:flashcard:mfa | `sha256:7c6fdfee68d901b9579887094e8d8d5af1df43fc31e848ee19f4be07554b6ae3` | Bounded teaching proposal | `src/App.jsx:24401`, `src/App.jsx:24423` |
| guest-demo:lesson-prompt:dns-attacks | `sha256:f6cc1b5aa9f56c1a2d53ee6182b01e132aaed74959051482b0af13cb9edb33ed` | Bounded teaching proposal | `src/App.jsx:24613` |
| guest-demo:lesson-prompt:phishing | `sha256:a7f99625a1b3fff9983b09f868e58d56e24bb47dd82732366951d99a7faff864` | Bounded teaching proposal | `src/App.jsx:24613` |
| guest-demo:lesson-prompt:web-attacks | `sha256:41f34defe6fabeeba1400ed3ebb9076f9bf25084c44bcde635c15495434a80f8` | Bounded teaching proposal | `src/App.jsx:24613` |
| guest-demo:mcq:access-control | `sha256:f48c1f3b4c6de579cb2505622e244fffdea3808bfbe0e6f1126a41ca992c4408` | New HOLD, zero credit | `src/App.jsx:24433` |
| guest-demo:mcq:distractor-explanation | `sha256:a2b3092d84444effefc3104459ecd871d1fb18883cd78d916bc97a4a6c2dd6b3` | Bounded teaching proposal | `src/App.jsx:24472` |
| guest-demo:mcq:feedback | `sha256:5076e0ab10894734c7eda1e3710fc5645cd6763de862147d9b4969a503c981fc` | New HOLD, zero credit | `src/App.jsx:24453` |
| guest-demo:mcq:solution-explanation | `sha256:d958c4954fd6bad856e8cd7de842e6f10c9321e115d08de814a0db3459bc8e75` | Bounded teaching proposal | `src/App.jsx:24463` |
| guest-demo:pbq:feedback | `sha256:380f2a079f6eda09df5feb9d9d1caaf352380c2ddb460c55b87e84810530a055` | New HOLD, zero credit | `src/App.jsx:24536` |
| guest-demo:pbq:hint | `sha256:eccaba10b85ef73fdc750a2189a1ab9b523aa74a57f709f7612af3c42c1907b5` | New HOLD, zero credit | `src/App.jsx:24519`, `src/App.jsx:24523` |
| guest-demo:pbq:incident-response-ordering | `sha256:171ad8b185b224dddf731f19c46acb987537392c6708bb016d41dfaae08245b8` | New HOLD, zero credit | `src/App.jsx:24484` |
| guest-demo:review-path:iam | `sha256:9e018d89f0780e2e7fe865d5a7689ec0d6d04bf9cc5ca7dabb70bfc501a45dc3` | New HOLD, zero credit | `src/App.jsx:24566` |
| guest-demo:review-path:logs | `sha256:19242ef1b5b5468830dd115a527cb933eb54f9a58358403e2b222ed55ec52555` | New HOLD, zero credit | `src/App.jsx:24566` |
| guest-demo:review-path:pki | `sha256:1c14cd2132bba45cedd768b6a2d0ffede6ebdc65f938bb45e7662c19eca1ae03` | New HOLD, zero credit | `src/App.jsx:24566` |

Eight records use a revision recipe that binds exact JSX branch/subsurface provenance. The three review-path records and three lesson prompts instead bind each exact authored value and ID; a whole branch hash is not substituted for a value hash. The packet records each recipe, component hashes, source-unit hashes, parents, selectors and reachability separately. The wording above names the actual split; no invented standalone question payload or editorial/publication transformation is substituted.

Authored, local effective and catalogue signatures match the existing source reader. Catalogue here means the pinned local inventory, not a newly published or verified live deployment. All 14 retain empty objective tags, null trusted revisions and zero adaptive weights. No private/remote override layer applies to these literal demos. Raw teacher text, full stems, choices, grading sequences, path steps, private payloads and learner data are withheld from the packet. Public source anchors/hashes and reviewer summaries preserve reviewability.

### guest-demo:flashcard:mfa

Recognize that MFA combines different authentication-factor types. Qualified bounded acronym/definition card. Its password-plus-authenticator example is a knowledge/possession example under the intended authenticator assumptions, not two knowledge secrets or a guarantee of phishing resistance. Both faces are mounted; flipping changes visual/aria-hidden state. Manual flip and a6.2-second timer reveal teaching; reduced motion disables auto-flip, and the timer is not conditioned on in-view state. No grading or recall mastery is demonstrated.

### guest-demo:lesson-prompt:dns-attacks

Prompt the learner to distinguish poisoned resolution from traffic tunneling. Qualified only as a comparison prompt, not a full lesson, detection rule or evidence of either attack. Forged/corrupted DNS answers and using DNS as a communications channel differ; observing a suspicious DNS record alone cannot establish either. No packet clues, controls or learner check are delivered here.

### guest-demo:lesson-prompt:phishing

Direct attention to urgency, claimed identity and communications channel as phishing clues. Qualified as a bounded attention prompt. A clue is not proof: legitimate messages can be urgent and phishing can appear calm or familiar. Independent verification is still needed. This preview provides no message analysis task, safe-link assessment, full phishing lesson or completed learner test.

### guest-demo:lesson-prompt:web-attacks

Prompt tracing untrusted input to a possible execution context. Qualified only as an injection-oriented analysis cue within a broad web-attacks topic. Not all web attacks execute injected code; CSRF, access-control failures and other mechanisms require different reasoning. No payload, application assessment, output-context remediation, full lesson or test is delivered.

### guest-demo:mcq:access-control

Recognize least privilege among the three illustrated labels. HOLD: no supported native guest identity/payload adapter. Answer-key CSS classes are always present and hover/active colors reveal correctness before an answer click; a separate explanation card also already states the concept. Clicks grade immediately and retries are unlimited. Recognition can be discussed, but this is assisted demonstration, not independent or trusted assessment.

### guest-demo:mcq:distractor-explanation

Contrast physical-entry tailgating with an authorization principle. Qualified standalone explanation of the named physical-access distractor. It is always visible and emphasis is optional. It supplies neither a complete account of physical access nor rationale for the other MCQ distractor, and it is not conditionally attached to the learner-selected wrong answer.

### guest-demo:mcq:feedback

Provide immediate verdict/retry status after a choice. HOLD complete feedback: the two wrong choices receive the identical generic retry, with no selected-misconception rationale. The correct status is only a short minimum-access cue. The separate explanation showcase is not wired to answer state and covers only one distractor, so it cannot be silently merged into complete per-choice feedback.

### guest-demo:mcq:solution-explanation

Explain the minimum-needed-access purpose of least privilege. Qualified standalone solution teaching. It is visible immediately in a separate explanation showcase; focus clicks only emphasize it. Role here describes necessary access and does not approve a precise RBAC mapping. It does not make the leaking MCQ or complete three-choice feedback valid.

### guest-demo:pbq:feedback

Display a coarse complete-sequence verdict and containment-first cue. HOLD: all five wrong legal permutations get the same retry. One already starts with containment, so that retry misdiagnoses its actual recovery/cleanup ordering error. Neither every step nor why recovery/eradication belong in the particular sequence is explained. Successful placement and the secured wording do not prove containment or a real incident result.

### guest-demo:pbq:hint

Expose the internal expected value for the next empty slot. HOLD as qualified distinct teaching: this is an answer-bearing highlight, not a rationale or explicitly labeled guided-learning mode. It is present before response and depends on a fixed index key rather than validation of the whole prefix. After some wrong placements it can disappear. It cannot establish unassisted novelty, a correct response plan or separate teaching efficacy.

### guest-demo:pbq:incident-response-ordering

Illustrate a simplified containment/cleanup/recovery dependency. HOLD: unsupported native guest namespace, no actual question-shaped payload contract, and no incident/plan premises justify a universal linear response sequence. A keyed next-step highlight aids completion before grading. The actual plain-text drop handler accepts unknown strings and marks all nonempty slots complete; full sequence correctness is coarse and supplies no separate skill or incident-response mastery.

### guest-demo:review-path:iam

Show an illustrative identity/access topic path. HOLD full displayed record: fixed percentage, recent-miss signal, priority and spacing labels are presented as detected accuracy and highest-impact adaptation without learner-history input or a visible synthetic-data label in the preview. Access minimization, federation and MFA are different topics, not measured weaknesses or proven prerequisites.

### guest-demo:review-path:logs

Show an illustrative logging-to-response topic path. HOLD full displayed record: the local dictionary drives every metric and step, while the interface claims detected accuracy and a rebuilt adaptive queue. No log evidence, learner miss history, impact ranking or real spaced schedule is used. Plausible topic order alone cannot validate those claims or a response finding.

### guest-demo:review-path:pki

Show an illustrative certificate-trust topic path. HOLD full displayed record: fabricated measurement provenance is unresolved. The fixed path can name roots, chains and validation, but it neither evaluates certificates nor measures a learner. No actual trust decision, diagnostic precision, calculated priority or spaced-retention result is approved.

The two independent explanation proposals do not approve their held parent. Their source parent/child relationship remains observed metadata. Neither parent approval, all-option completeness nor a canonical teaching link is transferred. The three short prompts are full reviews of those narrow prompt values, not limited references promoted to full Deep Dive approval. Existing unrelated limited guide references remain limited.

## MCQ answer cues and missing feedback

The three options carry answer-key-correct/answer-key-wrong classes before any click. Existing CSS assigns green/red hover and active presentation from those classes. A learner can therefore obtain a correctness cue without selecting. This is source-evidenced styling behavior; a fresh browser hover was not executed. Correctness is also available from the independently visible explanation showcase. Client-source access is not treated as a secret-protection boundary; these are visible teaching/assessment cues.

Four initial/selected states and 12 retry transitions exercise the actual extracted comparison/state expressions. One offered response is keyed correct and two wrong. Both wrong choices produce the exact same generic retry; neither gets selected-misconception rationale in the MCQ feedback branch. The separate Tailgating contrast does not explain Piggybacking or become answer-state-bound teaching. Thus the MCQ question and full-feedback rows are independently held, while the two accurate explanation snippets qualify only as teaching.

The native compiler rejects both guest assessment namespaces before any content grammar is considered. The audit tests that narrow namespace boundary only. JSX is not a native question object, so no fabricated question-shaped payload, rewritten m/p ID, ordering adapter or trusted revision is constructed to force support.

## Ordering interaction and adversarial checks

The ordering preview has three local slots, three offered labels, one fixed exact sequence comparison and an answer-bearing highlight for the next empty slot. No separate submit button exists: filling all slots computes a coarse verdict. Buttons disable used steps after placement, but occupied slots can be removed. Drag/drop and tap share the actual placeStep transformation; reset clears slots and dragged state. Tracking is stubbed locally and never sent.

| Executed source fixture | Count / result |
|---|---|
| All stored label-or-null combinations |64, including duplicate fixtures|
| Valid unique-label placement states |34|
| Valid complete permutations |6: one correct, five wrong|
| Valid states showing an answer-bearing hint |13|
| Incomplete valid states with no hint |15|
| Offered-value/slot placement transforms |306|
| Slot removal transforms |102|
| Reset transforms |34|
| Complete tap-only paths |6|
| Unknown nonempty drop-text/valid-slot probes |9 accepted, never correct|
| Invalid-index diagnostics |4, outside current fixed UI slot indices|

All six complete legal permutations are compared to the extracted actual key. The same retry is shown for all five wrong ones. One wrong permutation already starts with containment, so the retry's containment-first diagnosis does not explain its actual recovery/cleanup ordering error. The success text is a UI verdict, not evidence that an incident was contained or a real recovery was successful. There is no part-specific rationale or independently attributable skill result.

The hint explicitly compares an unused offered label with the keyed value at the next open index. It reveals guidance before completion, does not validate the entire preceding response, and can disappear after some wrong placements. The interface does not identify an assisted learning mode. This is not independent performance or a qualified standalone rationale intervention.

The drop handler accepts plain text from outside the offered bank. Nonempty unknown strings, whitespace and markup-like strings can occupy a valid slot. Three distinct unknown values can count as complete, although the whole answer remains wrong. The audit also tests the transformation's missing bounds on positive/out-of-range or non-index targets; those targets are diagnostics and are not reachable through the current fixed UI slot indices. Negative targets and empty/null/undefined steps are rejected by the existing early return. These observations do not claim a backend vulnerability or successful attack.

A synthetic React text-node probe escapes markup-like text; it is not a render or interaction test of the guest component. No injected string is executed. The ordering parent, hint and feedback are held for their respective identity, semantic, assistance, input-contract and feedback limits. A familiar simplified containment/eradication/recovery dependency is not rejected as inherently wrong, but it lacks an incident-specific plan and cannot stand in for the full current response process.

## Synthetic review-path provenance

PKI, IAM and Logs select fixed dictionary values. The default is PKI, and changing topics selects another fixed value; no attempt history, measured misses, impact calculation or spaced schedule is read. The reader correctly marks these synthetic, but the rendered preview displays recent-miss counts, detected-accuracy language, highest-impact ordering and a rebuilt adaptive queue without a visible synthetic-data label in that preview context. The surrounding feature wrapper describes personalization, not synthetic sample measurements.

All three complete displayed records remain held. Their topic lists can be plausible illustrations without proving actual weakness, sequence prerequisites, algorithm behavior, accuracy, personalization or efficacy. The audit source-binds each topic's metric, signal, ordered list and queue-label revision separately and tests three topic choices. An unknown topic has no activePath fallback; current topic buttons offer only the known keys. This is a source diagnostic, not a claim that ordinary clicks currently crash.

## Semantic counterexamples and primary sources

- two_passwords_not_two_factor_types: A second password or security question remains a knowledge factor; the card example is bounded to separate factor types and does not guarantee phishing resistance.
- visible_answer_and_partial_rationales_not_independent_assessment: A learner can inspect the correct hover color or always-visible solution before choosing. One physical-access contrast does not explain both wrong choices or establish an observed misconception.
- wrong_after_containment_retry_misdiagnosed: A wrong complete ordering may already place containment first; the uniform retry then attributes the wrong cause. Highlighted keyed values are assistance, not independent recovery/cleanup understanding.
- external_drag_text_not_offered_step: Nonempty outside-bank plain text can fill slots and count as a complete but wrong response. It is not a validated offered action or a containment outcome.
- fresh_guest_has_no_measured_misses: Choosing another fixed dictionary key changes displayed accuracy and recent-miss claims even without any attempt history. No actual detection or spacing algorithm is involved.
- dns_suspicion_not_attack_classification: An unusual DNS query can have a legitimate explanation; poisoning and channel abuse need different evidence and can coexist. This prompt supplies no such evidence.
- urgency_or_familiarity_not_proof: A real emergency can be urgent and a deceptive request can appear routine or familiar; independent verification matters.
- web_attack_not_always_code_execution: Cross-site request forgery can abuse a logged-in browser without executing newly injected attacker code. The prompt is a limited injection-oriented cue, not a universal web-attack model.

Counterexamples are reviewer reasoning tied to exact source revisions; they create no new question family or learner evidence. Only targeted official definitions, overview passages and indexed primary excerpts were checked. Applying them to these short demos is reviewer inference, not full standards conformance, an incident procedure, legal advice or an evaluated production system.

- [csrc.nist.gov](https://csrc.nist.gov/glossary/term/least_privilege): Minimum necessary access for functions/tasks; not an authorization or RBAC implementation review.
- [www.cyber.gc.ca](https://www.cyber.gc.ca/en/guidance/cyber-security-privacy-risk-management/itsp10033/physical-environmental-protection): Indexed physical-access discussion: tailgating/piggybacking can result in unauthorized facility entry; no universal distinction between the two terms is imposed.
- [www.cisa.gov](https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/require-multifactor-authentication): MFA extra proof and differences among methods only; no tested account or phishing-resistance guarantee.
- [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-61r3.pdf): RS.MI-01/02 and recovery context: containment/eradication/recovery require incident-specific strategy; the three labels are not a complete universal response plan.
- [www.nist.gov](https://www.nist.gov/itl/smallbusinesscyber/guidance-topic/phishing): Urgency and message verification clues, not a definitive classification rule.
- [www.rfc-editor.org](https://www.rfc-editor.org/info/rfc5452/): Primary indexed forged-DNS-answer context only; the direct HTML retrieval failed, so no full RFC conformance claim.
- [attack.mitre.org](https://attack.mitre.org/techniques/T1071/004/): DNS as an adversary communication channel; no actual DNS observation or detection conclusion.
- [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html): Untrusted input and execution/output context as a limited web-injection cue, not all web attacks or a reviewed application.

The NIST tailgating glossary and CISA MFA PDF were unavailable; the Canadian primary indexed physical-access discussion and official CISA HTML supplied the stated narrow context. Direct RFC HTML retrieval failed, so only the official indexed information page supports the forged-answer comparison. No unavailable material is represented as fully read.

## One shared local remediation specification

- Remove pre-answer hover/active correctness signals or explicitly define an assisted showcase that supplies no assessment evidence; do not merge independent explanation cards into observed post-answer feedback.
- Define a separately authorized guest identity/payload contract without inventing m/p IDs, with strict offered-value and slot-index validation before any trusted use.
- Bound ordering to an explicit incident-response scenario/plan, label assistance and distinguish each wrong permutation with response-specific rationale.
- Clearly identify synthetic review percentages/miss counts and fixed routes; no measured accuracy, priority or spacing claim without evidence.

- All three MCQ choices and both wrong-choice rationales must be bound to their actual displayed feedback; preserve useful guest teaching and distinguish instruction from assessment.
- Recheck34 valid partial/complete order states, six complete permutations,306 placement transforms,102 removals and34 resets, including completion/feedback/hint gates.
- Unknown/drop text, empty values, duplicates, occupied slots, invalid indices and stale revisions need explicit fail-closed outcomes in any proposed identity/response contract.
- An already-contained wrong ordering must not be diagnosed as lacking first containment; hints cannot supply independent mastery/novelty.
- Synthetic review paths require clear provenance in the rendered context. Keep all141 holds, protected25, native/diagnostic/ledger/specimen and main-bank/starter boundaries unchanged until separately reviewed.

This specification is unimplemented and adds no runtime module, allowlist, active adapter, content rewrite or automatic hold resolution. Full-product tier policy, pricing, deployment, private data, migrations, shadows/cohorts and Phase3 remain outside scope. The existing default-off local delivery specimen remains unchanged.

## Exact reconciliation and release boundary

| Measure | Prior | Newly qualified | Combined / total | Remaining |
|---|---|---|---|---|
| Catalogue substantive proposals |1652|6|1658 /1878|220|
| Support 834 scope |725|0|725 /834|109|
| Guest-demo records |0|6|6 /14|8 held|
| Guest assessment questions |0|0|0 /2|2|
| Guest full feedback bundles |0|0|0 /2|2|
| Guest complete pairs |0|0|0 /2|2|
| Starter complete pairs |0|0|0 /9|9|
| Main-bank questions |463|0|463 /483|20|
| Main-bank full feedback |464|0|464 /483|19|
| Main-bank COMPLETE pairs |456|0|456 /483|27|
| Distinct unresolved holds |133|8|141|Unresolved|

Six new instructional rows give 750 raw instructional proposals/737 distinct records/13 repeated occurrences; the prior 744/731/13 reconciliation is preserved. These six guest rows do not increase the separately defined834 support denominator. All 21 tracked objective censuses remain unchanged because the guest records have no objective tags; no objective is invented from a topic label. Flashcard 271/313 and glossary 150/162 support coverage remain unchanged, leaving 42 and 12. The guest MFA card is a separate identity and does not create another existing-bank flashcard credit.

The audit reconciles124 prior substantive packets, 375 source bindings, 672 inherited field fingerprints, all 133 prior held identities/revisions and 25 protected release files. Two reused guest-completeness helper/test source files are now explicitly pinned as well as remaining bound by the active mapping package. Existing private/source-choice boundaries, native version1, diagnostic version2, question ledger, disabled specimen, starter holds, PBQ holds, the limited guide reference and saved mixed-set restore omission remain exact/unresolved. The excluded marketing exam timer remains excluded, with zero credit and no additional scope.

The existing guest-completeness guard is reused and rejects88 omission/drift/parent/selector/weight/inclusion mutations. The focused packet audit rejects **3148** additional altered packets covering sources, response paths, hints, false rationale completeness, synthetic-versus-measured provenance, raw grading/private/learner exports, erased holds, inflated coverage/pairs, canonical/trusted/mastery claims and READY promotion.

Required release checks are focused write/recheck agreement, all 29 mapping tests/deterministic package, protected/source/native/diagnostic/ledger/specimen pins, whitespace and actual skip-deploy exit0/control1. Commit/push exactly this packet, report and focused audit with **[skip deploy]**; then match HEAD/origin/main/ls-remote/GitHub API and exact remote bytes. Preserve eight unrelated dirty entries and an empty index. Remote verification occurs after push and is reported separately; a Git push is not production delivery.

No full guest-component render, fresh browser, pointer/keyboard session, computed-style/accessibility observation, real analytics event, learner handler, account/history write or production action is performed. Build/browser checks are outside this local source-review slice. The phase and production remain NOT READY.
