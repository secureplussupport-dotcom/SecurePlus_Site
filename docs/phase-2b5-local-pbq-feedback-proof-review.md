# Phase 2B-5 — shared offline after-answer PBQ feedback proof

**VIABLE AS A SOURCE-BOUND DELIVERY PROOF; NOT READY FOR RUNTIME OR LEARNING ACTIVATION.** Baseline:879254e41a00f361aea6bba8e7724450fdb94935. Exactly17 held feedback identities: the seven older question-only gaps p004,p011,p029,p041,p043,p046,p211 plus ten slot rows p012,p019,p035,p056,p061,p067,p073,p077,p079,p223. The approved master plan remains product authority; Phase1 audit supplies historical current-state evidence. No unresolved product conflict changes behavior in this offline slice.

The new module is one shared compile/project contract reusing feedbackBundle, the unified local PBQ proof for ten rows, existing select-fill-v2 for six older rows and native whole-choice grading for p211. Existing helpers, active content and all181 holds are unchanged. Prior semantic reviews are bound and reused; zero new semantic reviews or feedback qualifications are claimed. p007/p030 retain their previously bounded feedback credit and are excluded; p008/p022 remain separately held.

## What the proof adds

compileOfflinePbqFeedback(recordId,published,{enabled:true}) returns an internal versioned JSON proof bound to fixed original LOCAL parent and feedback fingerprints, publication-stage provenance, prior candidate parent/feedback/row fingerprints and exact compiler/helper sources. It retains no raw originalPublished object or hypothetical trusted UUID. The internal model contains expected values and teaching; never send it before an answer.

projectOfflinePbqFeedback(proof,selections,published,{enabled:true,mode}) accepts practice_after_answer or exam_completed_review for teaching. Both require a valid complete stable selection, recompile the exact original source, and compare the entire proof beyond its recomputed checksum. practice_before_answer and exam_before_answer return null, even for a correct selection. All operations default off. Unknown options/modes, changed sources, changed/rehashed proofs and malformed selections fail closed; empty/incomplete completed responses are rejected. JSON limits reject getters without execution, non-JSON/hidden/symbol data, cycles, sparse arrays and excessive payloads.

After-answer output is an explicit plain-text allowlist: source context/main, each part's selected/correct labels, source solution and selected/correct option definitions, plus all offered definitions. Correct and plausible wrong selections receive the source-specific contrast; **juxtaposed source definitions are not newly authored pair-specific causal explanations**. Source slot order, stable helper IDs, offered-value restrictions, aliases and reusable values are preserved. No mandatory bijection or partial mastery is introduced. p211 carries its exact requirements diagram and all four source option bodies; no new scenario premise is invented.

Modes are caller declarations in an offline proof. No owner/session authorization, authenticated completed-exam gate, persisted submission, UI integration, escaping renderer or analytics/entitlement flow is implemented. A future trusted caller must authorize completion and render the plain text safely. This is not a production API or a way to grant learner access to feedback.

## Current delivery compared with the offline proposal

| Context | Sixteen selector rows | p211 SCENARIO |
|---|---|---|
| Current practice after answer | Part rationales/corrections plus option definitions | All4 option bodies; required diagram absent |
| Current completed expanded Exam | Prompt/selected/correction labels; no part rationale or definitions | All4 option bodies; required diagram absent |
| Proposed offline after-answer, both modes | Exact part rationales and selected/correct/all-option definitions | Exact requirements diagram and all4 option bodies |
| Proposed feedback before answer | null | null |

The audit executes pinned source-derived pure practice/Exam graders and existing feedback-body functions, and binds the actual JSX branches that include/omit each field. It does not render React, operate submit handlers or observe a browser. The protected current application remains unchanged, so its delivery gap is **not repaired in runtime**. Correct match/label recognition and content delivery do not establish learning, transfer or recovery.

## Exact row bindings and unresolved blockers

### 1. explanation:pbq:p004

Parent published: `sha256:109b8a1a5c3d15e77e2e99699d340f9dfb40c605754e2d23fc98a860a7436948`; LOCAL effective: `sha256:024b18d1e37f4fa4d26b25d7cafe1bdda2d5c638b69b97e08a5bb54e1cd95921`.
Feedback: `sha256:eaa0fd524513f431b6d84701714b27fef42827a3eae442890a56f89bfdb190a9`; authored: `sha256:b5eec2e0efa2aec96ae96c5633a4fbd3bda51190334ab2e93c763edbc657a6b1`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:109b8a1a5c3d15e77e2e99699d340f9dfb40c605754e2d23fc98a860a7436948` / `sha256:eaa0fd524513f431b6d84701714b27fef42827a3eae442890a56f89bfdb190a9`. Candidate row `sha256:68eff7229133ee0ed8fd960ad3f65ba3c2da099264805bd16bfc81d9d774c559` in `docs/drafts/phase-2b5-seven-feedback-gap-recheck-proposals.json`; candidate text is not applied.
New proof: `sha256:ae29b65a504e966af482ea4b89a650d3075ad1b670e0a11be7674cca07957261`; 6 parts, 6 offered values; 43 focused response cases and 86 after-answer views.

**Retained boundary, reused from the prior review:** Trusted compiler rejects selectionFeedback and the Select & Fill answer/component grammar. Completed Exam Mode omits per-blank explanations and selectionFeedback definitions; primitive correct-answer display does not supply their rationale.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 2. explanation:pbq:p011

Parent published: `sha256:7d2d3463800b21c65930a70d0884dc2f155b20a6a22e79b110a2a36932a4f514`; LOCAL effective: `sha256:2d6de2893bfae0e4c259054634f73e305d432a46db6fca15b4d7d16ef292da5e`.
Feedback: `sha256:af50d88dd14a25607952e3f6d402393d0faee6680d375e8342178c243f12c772`; authored: `sha256:9d8ad046fdb1deca36438f3867d5a044221ac522c23306bdec4ccbe66ab81084`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:7d2d3463800b21c65930a70d0884dc2f155b20a6a22e79b110a2a36932a4f514` / `sha256:af50d88dd14a25607952e3f6d402393d0faee6680d375e8342178c243f12c772`. Candidate row `sha256:22850b54e2cafb999a089a050f3c9fcb6992aad212c3ea22a09ad611836f2604` in `docs/drafts/phase-2b5-seven-feedback-gap-recheck-proposals.json`; candidate text is not applied.
New proof: `sha256:8d9c6234cf0efdd7f6a4f17fa22b8bab6c04243b46cde77afe87bc8948525dec`; 4 parts, 4 offered values; 21 focused response cases and 42 after-answer views.

**Retained boundary, reused from the prior review:** Unsupported trusted Select & Fill grammar remains null-trusted even when every legacy response is marked. The full alternate-response/delivery contract is incomplete; Exam Mode omits component rationale and definition details.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 3. explanation:pbq:p029

Parent published: `sha256:4302b539f791a242cf09fbdddb0fa052d1a37f9a60a1e5f54874dc753047c3d0`; LOCAL effective: `sha256:9a3f36434c3e9aea527dec69350e17b1c5d3c861f09529f0b92d4c9d15023466`.
Feedback: `sha256:28867f8831569a36709e908912e5656e9126e2c50174ca9f73ae23df5e0b14c9`; authored: `sha256:4cf5c5f93d32c537e59b47e09c1387ead414b3ddf72be7d54bcffdc8ac14de49`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:4302b539f791a242cf09fbdddb0fa052d1a37f9a60a1e5f54874dc753047c3d0` / `sha256:28867f8831569a36709e908912e5656e9126e2c50174ca9f73ae23df5e0b14c9`. Candidate row `sha256:38070e19249df3a6feb1bdfd5aa2f09390a8135d204972bb1ac42bf5790d0bc6` in `docs/drafts/phase-2b5-seven-feedback-gap-recheck-proposals.json`; candidate text is not applied.
New proof: `sha256:39ed38690d791935541edd6fa9a1e5f5d244d712db66083aecc20b7d168c8087`; 5 parts, 5 offered values; 31 focused response cases and 62 after-answer views.

**Retained boundary, reused from the prior review:** The exact published Select & Fill bundle cannot compile; field removal is a rejection diagnostic only. Exam Mode supplies no per-blank or option-definition explanations, so practice teaching is not complete across both delivery contexts.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 4. explanation:pbq:p041

Parent published: `sha256:41e116ba6f285dde1547a6683d231a4698517b72d576a4bf6d8a4b2e335e7547`; LOCAL effective: `sha256:90c11d373871ab5573323c8c3205ef5a0207b074f4bfc04cb4ef885d57ce4703`.
Feedback: `sha256:d9bd692824b7457d0a7139e86a72ce3215e099d1b0c23fcacd15dde56ff28b4e`; authored: `sha256:f2f2dcc65cf6949c72f08f3b21e11f32660abf40e2bf14e0b19bc93d8ccf0645`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:41e116ba6f285dde1547a6683d231a4698517b72d576a4bf6d8a4b2e335e7547` / `sha256:d9bd692824b7457d0a7139e86a72ce3215e099d1b0c23fcacd15dde56ff28b4e`. Candidate row `sha256:91a4597f20e70a762dbf77ea956dcfb6bc9dcbb6a854e7db72c65421fd1bf643` in `docs/drafts/phase-2b5-seven-feedback-gap-recheck-proposals.json`; candidate text is not applied.
New proof: `sha256:82db21c03fb95ea07295dd6c302206cc26a05bd1f1ae5c4c128f87b135d610f8`; 5 parts, 5 offered values; 31 focused response cases and 62 after-answer views.

**Retained boundary, reused from the prior review:** The mixed data-state matching parent judgment is retained; unsupported Select & Fill must not become a whole-choice or ordering revision. Exam Mode omits each detailed part solution and selection-definition teaching; no complete feedback or per-concept mastery credit.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 5. explanation:pbq:p043

Parent published: `sha256:a456da2d113fe701f3c318f9fcf954f22949b1a44f75d28dda63baf73b7303ba`; LOCAL effective: `sha256:8ad231beed8f8c572bfb74c6e0edd653915b5b51295ab1e81e0eb6265fe8c077`.
Feedback: `sha256:86df2d021fbbb2b40d3158e353d143991d347eff1d2e15d80b803b524b271a48`; authored: `sha256:6204f57e1d8fa4e573bf13d6eae2323a0ea64c6dc473aab5902bec555b7880c3`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:a456da2d113fe701f3c318f9fcf954f22949b1a44f75d28dda63baf73b7303ba` / `sha256:86df2d021fbbb2b40d3158e353d143991d347eff1d2e15d80b803b524b271a48`. Candidate row `sha256:bd1132339283d8029c94d3ed8a2ecf6f8555fd1b9803fa87f2f2dcf0c183bb3f` in `docs/drafts/phase-2b5-seven-feedback-gap-recheck-proposals.json`; candidate text is not applied.
New proof: `sha256:2fcd1f3f846c92544d6468b1439ffeaba826fa5cd25f76bf0187b55260f05673`; 5 parts, 5 offered values; 31 focused response cases and 62 after-answer views.

**Retained boundary, reused from the prior review:** Trusted Select & Fill rejection remains independent of the earlier mixed/coarse parent review. The missing component teaching in completed exam cannot be repaired by correct-answer labels or the general main paragraph.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 6. explanation:pbq:p046

Parent published: `sha256:f32e8f3daa1aa7f2d896946685a15146ecbcea91bbfb513de2b2a3babca51fdf`; LOCAL effective: `sha256:d2629e7c14a26019362f3f2b6e93a6a29ae46300257897df44a7bc9d0531b5c0`.
Feedback: `sha256:b446d0fe4dd2d34185ed9accf8fd3e0e6ff814ff6e0f3e540e20d5e9b9951605`; authored: `sha256:8e6494db9ef41aea06833856400ed59ac82a9edec180b5256076595acde066ad`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:f32e8f3daa1aa7f2d896946685a15146ecbcea91bbfb513de2b2a3babca51fdf` / `sha256:b446d0fe4dd2d34185ed9accf8fd3e0e6ff814ff6e0f3e540e20d5e9b9951605`. Candidate row `sha256:3a7f14e11a49ec78321cd591232db1f5ea0f642bc3c21f6f57f4b0ae4a2add41` in `docs/drafts/phase-2b5-seven-feedback-gap-recheck-proposals.json`; candidate text is not applied.
New proof: `sha256:05f21dd8beec207f0b741d0eab4a396a8cc4c4598f41b8e2efffe0a7de651546`; 5 parts, 5 offered values; 31 focused response cases and 62 after-answer views.

**Retained boundary, reused from the prior review:** Exact trusted Select & Fill grammar is unsupported; no field/adapter substitution is promoted. Completed Exam Mode lacks part-solution and selection-definition rationale for every response.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 7. explanation:pbq:p211

Parent published: `sha256:62894e03c5f39c75b69713ef7c7ad5205ce73da9f42097744f159636f8758f91`; LOCAL effective: `sha256:bf0a42cc62da920122329a6253d9aaff8fd5f9a35038153d581650e132be81c3`.
Feedback: `sha256:9831b5fb55788f52cea2c225bbaa2f2a28c2ff60c9d7450b35dd28addecedd2a`; authored: `sha256:dd180470bb59566df9cdecf2aad9736f33e521313db095c5a9dc6e98faa3a49e`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:62894e03c5f39c75b69713ef7c7ad5205ce73da9f42097744f159636f8758f91` / `sha256:9831b5fb55788f52cea2c225bbaa2f2a28c2ff60c9d7450b35dd28addecedd2a`. Candidate row `sha256:dc2210c12f12284fe0fe18e585c05c9ff3010afbd2cd50ca95a96f9b486593b7` in `docs/drafts/phase-2b5-seven-feedback-gap-recheck-proposals.json`; candidate text is not applied.
New proof: `sha256:30c9c76e0770ecf2117f2f89b2279c66af4ce27800bd43606fbde9c220c4fafb`; 1 parts, 4 offered values; 5 focused response cases and 10 after-answer views.

**Retained boundary, reused from the prior review:** Required diagram is not displayed by SCENARIO practice; all option explanations depend on requirements the practice view omits. Answering Exam Mode displays the diagram, but completed expanded review omits it. The existing immutable-retention taxonomy blocker and zero per-concept evidence remain; no feedback credit.

Current practice and completed Exam already contain all four option bodies but omit the required diagram; the offline projection carries that exact diagram and all four bodies. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 8. explanation:pbq:p012

Parent published: `sha256:a5fc0571a956742690726a044e2fb2030510c353caf7c619c6c6a7faf6063d0b`; LOCAL effective: `sha256:51e56b33b6c062cab28814cb27f2c2e24680df38ece3b0e3ddc99f6e40910c19`.
Feedback: `sha256:8c6cfa49fd53b1cd3e33967b7bf42212cc5c411dae09d360a457eded6134cf9f`; authored: `sha256:adc9b9cdce2af89e8b727409a9027f2aef9ae5b049d305e6c11d9244ccc1cac3`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:cb88a2c2ee6af92d7e568a2ce528f74b4b8b485b77de606ae205e83d589bf616` / `sha256:8c6cfa49fd53b1cd3e33967b7bf42212cc5c411dae09d360a457eded6134cf9f`. Candidate row `sha256:3c8097f201b67abb05c84da57d1c828eebe21071760ba02eeb8e7dfa970a8798` in `docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json`; candidate text is not applied.
New proof: `sha256:9490e3f25eb83b9baa5d69dcb3cf054f97c3492cd71bf023c9c8206b47583d39`; 4 parts, 4 offered values; 21 focused response cases and 42 after-answer views.

**Retained boundary, reused from the prior review:** HOLD: the title asks for channel and the task asks for attack type, while one single keyed label must be chosen from overlapping umbrella/subtype labels without a most-specific-label rule. The draft narrows the response contract but does not approve taxonomy, task independence, full exam teaching or a production slot grammar. Four prompts recur in p019.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 9. explanation:pbq:p019

Parent published: `sha256:2fe067e03fe2c1a05ec1c0dc7b38abc711b27e086a80a37dfa5fb0124066b741`; LOCAL effective: `sha256:d987b9f07b30ad674654b1d0e0856427beac40fc213f03bc27fcb407779c8006`.
Feedback: `sha256:016b08ac931c03f22b17d32b91ce9a31e6e477e751dcb995450bd3e716a37f12`; authored: `sha256:ec59fd8124c07bbd84441f2415e1bfd94abb54aa74a0cf2ad160e3274d29d8d3`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:60b4842ccfd890f6ea95babac08c9fe9c3d2d338194e765806c2103d85790856` / `sha256:016b08ac931c03f22b17d32b91ce9a31e6e477e751dcb995450bd3e716a37f12`. Candidate row `sha256:ebf10824caa349b1222ab8e001155894810b61d8880dc67c2e3ac0ceff8a565e` in `docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json`; candidate text is not applied.
New proof: `sha256:c42bab0f83ee24a06168e4450749a5c2e3e7ba39c6086dc8fe9eca481cd8d20a`; 5 parts, 5 offered values; 31 focused response cases and 62 after-answer views.

**Retained boundary, reused from the prior review:** HOLD: the channel framing also includes targeting/whaling and grades one exclusive label without specifying most-specific targeting versus the phishing umbrella. One extra executive clue is not independent evidence from p012. Overlapping labels, role/scope and teaching gates remain held.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 10. explanation:pbq:p035

Parent published: `sha256:2523717bcd158f80e260ae7d0f26fe4f2bf8969226956ec6030da13119352b81`; LOCAL effective: `sha256:a7e6637d0afd081bd108bb3b7e02e4ef24c84812afd1c7bb5f1117cff5678287`.
Feedback: `sha256:daead2d6a8ff57900a9deb9bc3e7169fb4e7a4472c834859f7ea29b64c2b65f3`; authored: `sha256:340394fa245c7ef157392972dfece7beb1c9a5d73b0921bdf542ce4ba7a15468`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:6ab8c5949af9d403f360e0f5cbb8478a4527d45e11250c44f1cd007b194b151b` / `sha256:0a44bfd63798d51164f9f7499aed7e781674b2e2487cf7dc1f60be943bcdca25`. Candidate row `sha256:ef76ee1e149d66b4291235807b2778990f22d93301dd3b5e8049a0ef3b207a41` in `docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json`; candidate text is not applied.
New proof: `sha256:5b82fa26290d7fe23826e1fe81d1124951d07c869070d2f4022662687b918c4d`; 5 parts, 5 offered values; 31 focused response cases and 62 after-answer views.

**Retained boundary, reused from the prior review:** HOLD: the IDS/IPS clue categorically says IDS does not block and IPS does block suspicious traffic, without scoping a passive IDS and configured prevention behavior. The candidate changes a nested blank sentence, so the feedback-bundle fingerprint also changes even though solution copy is identical. No current feedback or teaching approval transfers. Other control, visibility and policy limits remain.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 11. explanation:pbq:p056

Parent published: `sha256:3e52fdd7c63a5f25d1f3709512ace5ed5529d4ff4471a9b0865aa8589d351611`; LOCAL effective: `sha256:5aba08d9de3bbca166f34f88901771c28e41aee7a6f5b778c1b7b9d43b7008f6`.
Feedback: `sha256:74eb5ae74ec1b46654ee44bfd0ab4346cc9e673dd2322664314c26dfeb3ace78`; authored: `sha256:a36f314454215f08b2a9cd385f37633b5f936ddc6b4676856596a05e8a572352`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:ea54b2cdaca62c6b5d030231b32353e211b2e37b2faff81297f8388f7c1de2ac` / `sha256:74eb5ae74ec1b46654ee44bfd0ab4346cc9e673dd2322664314c26dfeb3ace78`. Candidate row `sha256:06ee220186b900ed93b611881c3d56b68ec1e23eea244f880bcee753ff40c41a` in `docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json`; candidate text is not applied.
New proof: `sha256:a8052c234cff3e3e3955bfdef372e06efce89725b340842e991b007a0ce60bd1`; 5 parts, 5 offered values; 31 focused response cases and 62 after-answer views.

**Retained boundary, reused from the prior review:** SELECT & FILL is unsupported: selectionFeedback is an unknown field and the component grammar is not installed. Do not strip grading-bearing fields to manufacture another revision; no question or full-feedback credit. The hint omission enables the existing offline v2 helper but does not install trusted persistence or resolve overlapping access-model semantics. The legacy map is conversion history, not a mandatory bijection; exam teaching and the paired feedback hold remain.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 12. explanation:pbq:p061

Parent published: `sha256:c1aab7f74cb26a56f5f03b87d9217dabecdcfb502660aded33d29899a8991504`; LOCAL effective: `sha256:74f9c003097f08f0760ab4d038cb688ded81490fb62c41a97159ed931247497d`.
Feedback: `sha256:33f3e6a3c53c4487ba9858a23ddf9e8d24607febf0ee16e2e373125e3a17440b`; authored: `sha256:53aaaf55b28e8e625ca271b3c924575de5d8a8991323219c507c2a5203b9c050`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:f773cdc0f327a9dd2aaa473490d8fb1ebe7f39d2b4ab0e0764c66eeaa18f3317` / `sha256:33f3e6a3c53c4487ba9858a23ddf9e8d24607febf0ee16e2e373125e3a17440b`. Candidate row `sha256:36b7824942133380c661449bc034024642eada25db97091ef079002b1cfa4a6b` in `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json`; candidate text is not applied.
New proof: `sha256:2565c2b9d77b877344f45c76caf8ecce7ddfbac581597ba8274619029dcd4232`; 5 parts, 5 offered values; 31 focused response cases and 62 after-answer views.

**Retained boundary, reused from the prior review:** HOLD: PRIMARY delivery method conflates channel, targeting and attack location. The bank/example qualifications in post-answer teaching do not repair that task instruction. The task remains multi-target label recognition. No universal bulk-only phishing definition, visitor compromise, canonical family independence, production slot grammar or complete exam teaching is approved.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 13. explanation:pbq:p067

Parent published: `sha256:f3914be7e6b493cc65b446bbbda91ccd74c49ad3272298a67389d29d36304852`; LOCAL effective: `sha256:939395909b42f8831e1ce03f8a372e63d21aabb86d808c043f61dc720df0a565`.
Feedback: `sha256:99dc0e60528e6996b9e836d0679c63a54690b8fc98f1c8378aeff5d018997d40`; authored: `sha256:6ca0eb31f405bad6238434921b139422ce5d77f1a591697f4504432c5f3cf619`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:f3914be7e6b493cc65b446bbbda91ccd74c49ad3272298a67389d29d36304852` / `sha256:99dc0e60528e6996b9e836d0679c63a54690b8fc98f1c8378aeff5d018997d40`. Candidate row `sha256:46d45fe399083fd40760f66243211df5b2a99e42a4759359b3a911112e2b3218` in `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json`; candidate text is not applied.
New proof: `sha256:eadd15944e0822a914f21a4879ce96bf90f2af7f50a66abeac864786b26c54a0`; 3 parts, 3 offered values; 13 focused response cases and 26 after-answer views.

**Retained boundary, reused from the prior review:** SELECT & FILL is unsupported: selectionFeedback is an unknown field and the component grammar is not installed. Do not strip grading-bearing fields to manufacture another revision; no question or full-feedback credit. No content error is invented. The existing envelope identity, covered-signature and either-aligned-pass qualifiers remain source-bound introductory vocabulary, not an actual mail validation, configuration, trust result, complete feedback approval or installed trusted grammar.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 14. explanation:pbq:p073

Parent published: `sha256:9af9f242835314be6353f8f0ea925925e2cafdea2fa03d070e9bc8d37107870f`; LOCAL effective: `sha256:317b018966acbc729e607b300cd053a1dc2d0a42586b9047e441eba582a359f6`.
Feedback: `sha256:2ae97adf8263d212bd028cc65914e15a70da482b79d068ae150e2694fce978f6`; authored: `sha256:af635387b43d47c3f8f70e48c2eacafb8fdf2a8d6911c079009f811a3caf0e09`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:a18307b2a322b76f5e8ce8cbe51270e4d017b0cb059975568a140d0bd9376024` / `sha256:2ae97adf8263d212bd028cc65914e15a70da482b79d068ae150e2694fce978f6`. Candidate row `sha256:8d7e70f772707c64bc032020defdaf65ffbd9085f8dcbeea468e3b45947043f4` in `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json`; candidate text is not applied.
New proof: `sha256:52f2dbb0e7df415ae83410fd66ca773513c5a55d869f00e94e7de90043dc8ea1`; 5 parts, 5 offered values; 31 focused response cases and 62 after-answer views.

**Retained boundary, reused from the prior review:** HOLD: the instruction requests trust level and purpose, but the slots/values grade purposes and controls without a trust-level contract; source teaching correctly rejects trust based only on location. Purpose recognition does not approve inherent internal trust, implemented segmentation, universal guest restrictions or a new network policy. Full semantic, family and teaching gates remain held.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 15. explanation:pbq:p077

Parent published: `sha256:9e07e58f1b321662775d7f35b0e8bbefd5c0a31758a91791bae54af4af8883ae`; LOCAL effective: `sha256:d9d2fe093b7ed46cbfd8cfc45978e415555c169cdea8ce056b9a414abe737072`.
Feedback: `sha256:95d29e04c23d8337e4e3733f81195a316ffdfeab48bdaaa3a30671797fb74090`; authored: `sha256:eb9abd7a7a6ae5e13c22fa2a4208bb4e4c7a1518a4b97f57506bacead52da8c3`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:1e9a2e9d10b669cce23a20050fa9c03de1f734937369db66bb1ea0ecbdedc1ff` / `sha256:95d29e04c23d8337e4e3733f81195a316ffdfeab48bdaaa3a30671797fb74090`. Candidate row `sha256:71c0c0f95b0c0f028a175ac63831400a930f6b4573c98406f306ce3be2cf9476` in `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json`; candidate text is not applied.
New proof: `sha256:f4dcfc54f66fb9d5c813f10ea5865adbef7eb677d0560cafa37978ac337c8d91`; 3 parts, 3 offered values; 13 focused response cases and 26 after-answer views.

**Retained boundary, reused from the prior review:** HOLD: who is responsible frames the task, but the first two blanks select security-element names and the third selects a CASB label; the keyed response does not answer the complete asked role question. The contract premises are fictional, not universal IaaS/SaaS duties, real legal allocation or inspected CASB integration. Correct label matching is not a responsible-party assessment or measured enforcement.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 16. explanation:pbq:p079

Parent published: `sha256:479c56850aedec2203f0d1e70950ece92e20d500565800c8a0200d552436d140`; LOCAL effective: `sha256:2b022f2ad9d4f6524c3deae828f9128e040f024baec2104e3731e68f3ff78d44`.
Feedback: `sha256:a5112769770f2dab59db7e785fac9b3d2f84100c5d8f0235516c8d91b6067d9c`; authored: `sha256:de7c61252d21b94e1e8a89b54b7a973e28e0fc8588be4bec48adce5286fdc3ed`; snapshot/capture rows:0/0.
Bound prior candidate parent/feedback: `sha256:b89b52a435922c2efcec36e3461870bc1fbb3126832b1255710f540d0f424f4e` / `sha256:a5112769770f2dab59db7e785fac9b3d2f84100c5d8f0235516c8d91b6067d9c`. Candidate row `sha256:568651b18b9f9438c5be26a8eb6541abb5b86accf1572a6a73b0dfc49842f336` in `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json`; candidate text is not applied.
New proof: `sha256:9e0a6897025501391bcabf1de0412a063f4a4df5cfc0aa30aa2006a8aa5f1825`; 5 parts, 5 offered values; 31 focused response cases and 62 after-answer views.

**Retained boundary, reused from the prior review:** SELECT & FILL is unsupported: selectionFeedback is an unknown field and the component grammar is not installed. Do not strip grading-bearing fields to manufacture another revision; no question or full-feedback credit. Existing device/key/session, visibility, policy and update limitations remain. No product configuration, successful protection, comparative ranking or independent component skills are established.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.

### 17. explanation:pbq:p223

Parent published: `sha256:77ac1d7fa1590f4e51beaa5fd93d60a0c3fb47f4067a7f6b245f1b32ee36e179`; LOCAL effective: `sha256:06a1cfd2a732e42705bf69cf72a2c6ca96705e7731a3eea7ec8cfdc9a319905c`.
Feedback: `sha256:2ed17331dcfd95d577562c8f7fc1c168f44fd4d36946110d086f74d906a510f6`; authored: **null: captured snapshot only**; snapshot/capture rows:1/1.
Bound prior candidate parent/feedback: `sha256:dbdd7b4f03eb2482a14c512506419d46d12c2eb7689dcc9682e633dd3eedfc1b` / `sha256:2ed17331dcfd95d577562c8f7fc1c168f44fd4d36946110d086f74d906a510f6`. Candidate row `sha256:c4dc87554e5194a47875e79386ca93b13e43b0bb49baade4473f00a87da79a65` in `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json`; candidate text is not applied.
New proof: `sha256:80b341d6eb58b5404f59aeb61acac7ffbfb99b88303b132eb7affea2e3b269b5`; 4 parts, 4 offered values; 21 focused response cases and 42 after-answer views.

**Retained boundary, reused from the prior review:** HOLD: the instruction asks observed-pattern-to-attack, while delivered slots present attack-name-to-pattern; the snapshot-only origin and diagnostic metadata projection cannot repair that direction. Authored source is absent. Capture replay supplies this local snapshot-only revision, not private data or author approval. Reversing task direction is an explicit offline assessment proposal requiring approval; no observed-incident diagnosis, universal switch behavior or runtime publication follows.

Current practice supplies every part rationale and option definition; completed Exam supplies labels/corrections but omits those teaching details. Both offline after-answer modes carry the exact source part and definition text. Whole/coarse scoring and prior holds remain unchanged; no full-feedback/COMPLETE/family credit.


p041's mixed/overlapping data-state and primary-protection judgment is preserved; carrying more teaching does not make those contexts exclusive. p223 still has no authored source, one snapshot/capture and the observed-pattern versus name-to-pattern direction mismatch; no authorship is inferred and its pending candidate is not adopted. Other parent taxonomy, categorical-control, access-model, zone/contract/efficacy scope, family and full-teaching holds retain their prior evidence. The common subset proved across all17 is **source-faithful offline delivery**, not complete semantic qualification.

## Verification and limits

- Initial contract check failed with module-not-found; implementation then passed all17 rows.
- 447 focused response cases /894 after-answer projections, including356 part/value branches and74 whole responses reusing one offered value in every slot. All75 source-specific parts and78 offered-value definitions match their pinned source teaching; both after-answer modes agree.
- 68 null pre-answer checks,34 default-off checks and17 JSON round trips through a fresh module instance. Source order, stable IDs and selection-order independence are asserted.
- 1273 rejected invalid/tampered inputs: source/private/candidate/array/text drift, recomputed proof checksums, key/rationale/provenance/version changes, foreign/missing/duplicate/wrong-role selections, bad modes/options and bounded JSON failures. No getter executes.
- Reused pinned older probes enumerate59,416 complete offered responses and compare native grading/part teaching, aliases and incomplete response boundaries. New focused projection tests do not claim exhaustive enumeration of every projected combination. Whole/coarse results match legacy; partial-ratio UI and incomplete Exam lifecycle remain untouched.
- 974 altered packets rejected;143 prior packets,752 inherited fields,72 immediate baseline fields,444 source fingerprints and25 protected release files reconcile. All447 native-supported revisions remain observed; new native support/trusted credit is zero.
- Required delivery gates: all29 mapping tests and exact package reproduction; deterministic packet/report recheck; git diff --check; skip-deploy exit0/control1; exact task-only commit/push and remote-byte verification, empty index and eight unrelated dirty entries preserved.

Read-only npm audit against the same pinned lockfile again exits1:7 existing advisories, including1 critical and4 high. The new module's inspected 16-file static Node/data import path imports zero external packages; none of the advisory packages is in that path. No dependency change or project-wide security clearance is claimed.

## Prior, new and remaining

| Bank measure | Prior | New | Combined / total | Remaining |
|---|---:|---:|---:|---:|
| Questions |463|0|463/483|20|
| Full feedback |464|0|464/483|19|
| COMPLETE pairs |456|0|456/483|27|

| Within these seventeen pairs | Prior | New | Combined /17 | Remaining |
|---|---:|---:|---:|---:|
| Questions |7|0|7/17|10|
| Full feedback |0|0|0/17|17|
| COMPLETE pairs |0|0|0/17|17|

Catalogue1694/1878, remaining184; support748/834, remaining86; instructional786 raw/772 distinct/14 repeats. All181 existing holds remain exact:27 selected parent/feedback holds and154 others, zero additions or resolutions. No new canonical, objective, concept, difficulty, skill, family, teaching-link, human-review, mastery, trusted or activation credit.

No protected compiler/helper, active/runtime content, existing import statement, private/database payload, live/browser action, deployment, automation or Phase3 work. **OFFLINE DELIVERY PROOF ONLY; ALL CURRENT FEEDBACK HOLDS REMAIN.**
