# Phase 2B-5 — unified source-bound local PBQ proof v1

**VIABLE AS AN OFFLINE PROOF; NOT READY FOR RUNTIME OR ADAPTIVE ACTIVATION.** Baseline:71ce848dd7e6f7bea15ff13c73adab3bbadc873b. Exactly12 original question sources: p007,p012,p019,p030,p035,p056,p061,p067,p073,p077,p079,p223. One new reusable module, one focused audit, this report and a fingerprint-only packet. No protected/shared helper, runtime/active source, existing import statement, private/database or learner behavior changes. All181 holds and all existing counts remain exact.

The approved master plan supplies product requirements; Phase1 audit supplies historical implementation evidence. No unresolved product conflict changes behavior here. The prior two six-row diagnostic packets are read as immutable evidence, not as approval to publish their editorial candidates or clear their parent holds.

## Material advance over the preceding diagnostics

The new [local module](../scripts/lib/content-mapping/local-pbq-proof.mjs) provides **one versioned JSON model, one grader and one safe learner projection** across the HOTSPOT whole-choice and reusable-slot grammars. It reuses existing native compilation, select-fill-v2 compilation, stable-selection validation and normalization, while leaving every existing helper byte-identical.

The earlier slot diagnostic retained originalPublished inside its returned object and accepted a caller-supplied source fingerprint. The new proof retains no original payload or hypothetical trusted UUID. Its twelve source fingerprints and stage provenance are fixed inside the reviewed module. Both grading and projection require the exact original LOCAL publication object again, validate it against that authority, rebuild the expected versioned model and compare the complete canonical proof. Changing a key/model and recomputing its checksum therefore **does not authorize it**. A serialized proof can be graded through a fresh module instance with the original pinned source; there is no hidden object-identity cache.

The model explicitly binds compiler source fingerprint, native compiler source, slot compiler source and normalizer source. The three existing dependency versions are pinned and fail closed on drift. Source metadata omissions and their original fingerprints are part of the versioned model. A change to code/source/normalization requires new proof review; a model hash is not an approved trusted UUID or rollout authorization.

### Interface contract

Run from the repository root, as with the reused source helpers. Each operation defaults off and returns null without constructing a proof/score/view unless enabled is the boolean true. Importing the module validates its static code dependencies; it does not activate learner behavior.

- compileOfflinePbq(recordId,published,{enabled:true}) returns an **internal** JSON proof. It contains private grading assignments for local review; never send the full proof to a learner.
- gradeOfflinePbq(proof,selections,published,{enabled:true}) revalidates source/model and returns only whole correct/score0-or1, coarse precision, eligibleEvidence=false, trustedRevisionId=null and newCredit=0.
- learnerOfflinePbq(proof,published,{enabled:true,mode,displayOrder?}) accepts only practice_before_answer or exam_before_answer, rebuilding the same authority before returning the public allowlist. Value display order is a complete permutation; default values and slot prompts retain source order.

Invalid data/options/proofs throw; there is no invalid-input fallback to a passing result. JSON boundaries reject non-JSON values, accessors without executing them, hidden/symbol properties, sparse arrays, excessive depth/trees/text and cyclic data. Both answer modes retain existing helper component IDs. Whole-choice requires one native option self-selection; slots require one valid value for every slot and allow value reuse. Completeness is the **complete-response proof contract**, not an implementation of legacy form answered-state or incomplete exam submission behavior. No component weighting or partial mastery is introduced.

The learner payload excludes grading assignments, expected/accepted values, authority, original source, metadata omissions, solutions and feedback. Practice slot hints are supplied only where the current source workspace permits them; exam projections contain no hints. Top-level selector hints are omitted from the diagnostic model display, matching their absence from the selector UI. The current legacy practice partial-ratio display and incomplete-form lifecycle are untouched; this module supplies whole/coarse evidence only.

No owner/session authorization, ingestion transaction, immutable database publication, entitlement or UI integration is implemented. A future caller must resolve the expected LOCAL source in trusted context and preserve the distinction between this proof and a native/trusted manifest revision. The module is not a production API or permission boundary for learner accounts.

## Exact twelve-row sources and remaining blockers

### 1. pbq:p007

Mode: **single_choice**. Origin: **authored_local**; authored revision `sha256:23c0572341acdc1ac710f3d100735a073dfa8810627e57cb435719a61ba734c7`, snapshots/captures 0/0.

Current LOCAL effective: `sha256:381dd90e40d617e80ac0aeaaa34e41e85601d95e6c43d21da8e307041eab89f9`.
Original published source: `sha256:f21627a72d012a0bfae327a109509b6ee2986d94233bc8d67760a467bb053444`.
Current feedback: `sha256:16b004791fcad40c030f6a4010f8389b0a7f38036a9528e2679f6797e3ef3b87`.
Prior offline source candidate: `sha256:19784f314fb5f4a66634d1640481e987967d44b278bb3fdc115741983fb8dd95`.
Prior and new metadata-only source projection: `sha256:19784f314fb5f4a66634d1640481e987967d44b278bb3fdc115741983fb8dd95`.
New versioned proof model: `sha256:df6676575019be16cacc6a2256b25d6110bfc595a10d221160324d810e834d2d`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json` (row fingerprint `sha256:cd39bf771db9ed4fc82a4129e84a6199fbd3bc2af474af2e8ae560f8348048a1`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: `hotspots` at `sha256:12df6a6278a5442c99392790aae774d3614530a475ad8d55a4829bfd260a76dd`.

**Current hold:** HOTSPOT carries an unsupported hotspots field. Do not strip authored grading-bearing metadata to manufacture a supported revision.

**Remaining semantic/teaching boundary:** The current metadata still describes a firewall-update alert as firmware. Choice/diagram grading ignores that label, but the stale metadata is not approved or erased from the source. Prior feedback qualification is preserved; question grammar/publication remains held.

Whole-response cases: 4, with1 correct and3 incorrect; display permutations 24, learner-mode projections 48. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 1, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 2. pbq:p012

Mode: **reusable_slot_values**. Origin: **authored_local**; authored revision `sha256:adc9b9cdce2af89e8b727409a9027f2aef9ae5b049d305e6c11d9244ccc1cac3`, snapshots/captures 0/0.

Current LOCAL effective: `sha256:51e56b33b6c062cab28814cb27f2c2e24680df38ece3b0e3ddc99f6e40910c19`.
Original published source: `sha256:a5fc0571a956742690726a044e2fb2030510c353caf7c619c6c6a7faf6063d0b`.
Current feedback: `sha256:8c6cfa49fd53b1cd3e33967b7bf42212cc5c411dae09d360a457eded6134cf9f`.
Prior offline source candidate: `sha256:cb88a2c2ee6af92d7e568a2ce528f74b4b8b485b77de606ae205e83d589bf616`.
Prior and new metadata-only source projection: `sha256:a5fc0571a956742690726a044e2fb2030510c353caf7c619c6c6a7faf6063d0b`.
New versioned proof model: `sha256:1c00bf06d640e9414bf992bf95d8ef86daf2fe127f3a953327810df4996a9a2f`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json` (row fingerprint `sha256:3c8097f201b67abb05c84da57d1c828eebe21071760ba02eeb8e7dfa970a8798`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: none.

**Current hold:** HOLD: the title asks for channel and the task asks for attack type, while one single keyed label must be chosen from overlapping umbrella/subtype labels without a most-specific-label rule.

**Remaining semantic/teaching boundary:** The draft narrows the response contract but does not approve taxonomy, task independence, full exam teaching or a production slot grammar. Four prompts recur in p019.

Whole-response cases: 256, with1 correct and255 incorrect; display permutations 24, learner-mode projections 48. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 0, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 3. pbq:p019

Mode: **reusable_slot_values**. Origin: **authored_local**; authored revision `sha256:ec59fd8124c07bbd84441f2415e1bfd94abb54aa74a0cf2ad160e3274d29d8d3`, snapshots/captures 0/0.

Current LOCAL effective: `sha256:d987b9f07b30ad674654b1d0e0856427beac40fc213f03bc27fcb407779c8006`.
Original published source: `sha256:2fe067e03fe2c1a05ec1c0dc7b38abc711b27e086a80a37dfa5fb0124066b741`.
Current feedback: `sha256:016b08ac931c03f22b17d32b91ce9a31e6e477e751dcb995450bd3e716a37f12`.
Prior offline source candidate: `sha256:60b4842ccfd890f6ea95babac08c9fe9c3d2d338194e765806c2103d85790856`.
Prior and new metadata-only source projection: `sha256:2fe067e03fe2c1a05ec1c0dc7b38abc711b27e086a80a37dfa5fb0124066b741`.
New versioned proof model: `sha256:2ed01fcb56eca6adfb625e5a4b20e66fbc8e17c68b27f78dd48db2f5e1272c2f`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json` (row fingerprint `sha256:ebf10824caa349b1222ab8e001155894810b61d8880dc67c2e3ac0ceff8a565e`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: none.

**Current hold:** HOLD: the channel framing also includes targeting/whaling and grades one exclusive label without specifying most-specific targeting versus the phishing umbrella.

**Remaining semantic/teaching boundary:** One extra executive clue is not independent evidence from p012. Overlapping labels, role/scope and teaching gates remain held.

Whole-response cases: 3125, with1 correct and3124 incorrect; display permutations 120, learner-mode projections 240. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 0, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 4. pbq:p030

Mode: **single_choice**. Origin: **authored_local**; authored revision `sha256:823c245050166b33cb460339ce46c9f30865d89bcb0ebf64e30d4fa5cb7a7266`, snapshots/captures 1/1.

Current LOCAL effective: `sha256:eec144ddaf46d82b65631d0dc2ae3c827f184405d17f6e9d1e7d5f60c1096b48`.
Original published source: `sha256:9c29b7815b77b884e18ec61a03586618572e0056a570c4d42be4fe011571f88c`.
Current feedback: `sha256:0051a6b262c87004fdacbc9a5731b69de7bd03da8324bf0aabf261106327d923`.
Prior offline source candidate: `sha256:70cb0af469a2ad29714e0eb954df6e0b6da7e9864d6dffcfc7af66f0bf880cbc`.
Prior and new metadata-only source projection: `sha256:70cb0af469a2ad29714e0eb954df6e0b6da7e9864d6dffcfc7af66f0bf880cbc`.
New versioned proof model: `sha256:cafb4c0fa8ef7b26c7f04c193867fa94c853ea7b5000a6cb4cf5f527497fa747`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json` (row fingerprint `sha256:9c3040f4bd00aaf6ef8ca53333cfbe5cfea2125bcae1194a092f63745a7bc263`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: `hotspots` at `sha256:e6264079110257f23d2e08cac235b71dd2874241ece4924f16cd5aa5d0c41d8e`.

**Current hold:** Captured HOTSPOT carries an unsupported hotspots field. Verified editorial precedence does not install a trusted grammar.

**Remaining semantic/teaching boundary:** No new substantive source-text correction is warranted here. The fictional log does not approve a universal signature rule, legal admissibility, actual custody continuity or calibrated difficulty. Prior feedback qualification remains credited exactly once.

Whole-response cases: 4, with1 correct and3 incorrect; display permutations 24, learner-mode projections 48. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 1, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 5. pbq:p035

Mode: **reusable_slot_values**. Origin: **authored_local**; authored revision `sha256:340394fa245c7ef157392972dfece7beb1c9a5d73b0921bdf542ce4ba7a15468`, snapshots/captures 0/0.

Current LOCAL effective: `sha256:a7e6637d0afd081bd108bb3b7e02e4ef24c84812afd1c7bb5f1117cff5678287`.
Original published source: `sha256:2523717bcd158f80e260ae7d0f26fe4f2bf8969226956ec6030da13119352b81`.
Current feedback: `sha256:daead2d6a8ff57900a9deb9bc3e7169fb4e7a4472c834859f7ea29b64c2b65f3`.
Prior offline source candidate: `sha256:6ab8c5949af9d403f360e0f5cbb8478a4527d45e11250c44f1cd007b194b151b`.
Prior and new metadata-only source projection: `sha256:2523717bcd158f80e260ae7d0f26fe4f2bf8969226956ec6030da13119352b81`.
New versioned proof model: `sha256:50e7e7c92053296128a0ea8173160409c1039f4b4f676212d2ab6c67db615630`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json` (row fingerprint `sha256:ef76ee1e149d66b4291235807b2778990f22d93301dd3b5e8049a0ef3b207a41`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: none.

**Current hold:** HOLD: the IDS/IPS clue categorically says IDS does not block and IPS does block suspicious traffic, without scoping a passive IDS and configured prevention behavior.

**Remaining semantic/teaching boundary:** The candidate changes a nested blank sentence, so the feedback-bundle fingerprint also changes even though solution copy is identical. No current feedback or teaching approval transfers. Other control, visibility and policy limits remain.

Whole-response cases: 3125, with1 correct and3124 incorrect; display permutations 120, learner-mode projections 240. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 0, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 6. pbq:p056

Mode: **reusable_slot_values**. Origin: **authored_local**; authored revision `sha256:a36f314454215f08b2a9cd385f37633b5f936ddc6b4676856596a05e8a572352`, snapshots/captures 0/0.

Current LOCAL effective: `sha256:5aba08d9de3bbca166f34f88901771c28e41aee7a6f5b778c1b7b9d43b7008f6`.
Original published source: `sha256:3e52fdd7c63a5f25d1f3709512ace5ed5529d4ff4471a9b0865aa8589d351611`.
Current feedback: `sha256:74eb5ae74ec1b46654ee44bfd0ab4346cc9e673dd2322664314c26dfeb3ace78`.
Prior offline source candidate: `sha256:ea54b2cdaca62c6b5d030231b32353e211b2e37b2faff81297f8388f7c1de2ac`.
Prior and new metadata-only source projection: `sha256:ea54b2cdaca62c6b5d030231b32353e211b2e37b2faff81297f8388f7c1de2ac`.
New versioned proof model: `sha256:d48e8adae20f7955338e2abff12120bd37457f28a6806edacc8d599fbe23e970`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-first-six-remaining-pbq-grammars-proposals.json` (row fingerprint `sha256:06ee220186b900ed93b611881c3d56b68ec1e23eea244f880bcee753ff40c41a`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: `hint` at `sha256:da2e1bb87b6c6e9160a43c6fffbbb4318937e87f4700d4787c0698dd41f440cf`.

**Current hold:** SELECT & FILL is unsupported: selectionFeedback is an unknown field and the component grammar is not installed. Do not strip grading-bearing fields to manufacture another revision; no question or full-feedback credit.

**Remaining semantic/teaching boundary:** The hint omission enables the existing offline v2 helper but does not install trusted persistence or resolve overlapping access-model semantics. The legacy map is conversion history, not a mandatory bijection; exam teaching and the paired feedback hold remain.

Whole-response cases: 3125, with1 correct and3124 incorrect; display permutations 120, learner-mode projections 240. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 0, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 7. pbq:p061

Mode: **reusable_slot_values**. Origin: **authored_local**; authored revision `sha256:53aaaf55b28e8e625ca271b3c924575de5d8a8991323219c507c2a5203b9c050`, snapshots/captures 0/0.

Current LOCAL effective: `sha256:74f9c003097f08f0760ab4d038cb688ded81490fb62c41a97159ed931247497d`.
Original published source: `sha256:c1aab7f74cb26a56f5f03b87d9217dabecdcfb502660aded33d29899a8991504`.
Current feedback: `sha256:33f3e6a3c53c4487ba9858a23ddf9e8d24607febf0ee16e2e373125e3a17440b`.
Prior offline source candidate: `sha256:f773cdc0f327a9dd2aaa473490d8fb1ebe7f39d2b4ab0e0764c66eeaa18f3317`.
Prior and new metadata-only source projection: `sha256:a49bbfc7adf3a76c912d6ebe6bf3b41de738aa7739f6990a4c6b63d434289a1c`.
New versioned proof model: `sha256:703759b2872d799d0d04b300526ce7d71b5a8d0a1403c2c4ed6831035c25b9e2`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json` (row fingerprint `sha256:36b7824942133380c661449bc034024642eada25db97091ef079002b1cfa4a6b`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: `hint` at `sha256:da2e1bb87b6c6e9160a43c6fffbbb4318937e87f4700d4787c0698dd41f440cf`.

**Current hold:** HOLD: PRIMARY delivery method conflates channel, targeting and attack location. The bank/example qualifications in post-answer teaching do not repair that task instruction.

**Remaining semantic/teaching boundary:** The task remains multi-target label recognition. No universal bulk-only phishing definition, visitor compromise, canonical family independence, production slot grammar or complete exam teaching is approved.

Whole-response cases: 3125, with1 correct and3124 incorrect; display permutations 120, learner-mode projections 240. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 0, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 8. pbq:p067

Mode: **reusable_slot_values**. Origin: **authored_local**; authored revision `sha256:6ca0eb31f405bad6238434921b139422ce5d77f1a591697f4504432c5f3cf619`, snapshots/captures 0/0.

Current LOCAL effective: `sha256:939395909b42f8831e1ce03f8a372e63d21aabb86d808c043f61dc720df0a565`.
Original published source: `sha256:f3914be7e6b493cc65b446bbbda91ccd74c49ad3272298a67389d29d36304852`.
Current feedback: `sha256:99dc0e60528e6996b9e836d0679c63a54690b8fc98f1c8378aeff5d018997d40`.
Prior offline source candidate: `sha256:f3914be7e6b493cc65b446bbbda91ccd74c49ad3272298a67389d29d36304852`.
Prior and new metadata-only source projection: `sha256:a8eb400d24dda88b4403d4e149cddf9a64ea9f892a3875bb9fda6a0e2f253472`.
New versioned proof model: `sha256:2ef3f69ecbd8928abea32d0003e38297c42af9e1cd35ef9a59d797e4f1a4dabb`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json` (row fingerprint `sha256:46d45fe399083fd40760f66243211df5b2a99e42a4759359b3a911112e2b3218`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: `hint` at `sha256:8819b2379536e1b6097fca86a4bd0578d41e4a9c47683661f669c0103e2cd7a8`.

**Current hold:** SELECT & FILL is unsupported: selectionFeedback is an unknown field and the component grammar is not installed. Do not strip grading-bearing fields to manufacture another revision; no question or full-feedback credit.

**Remaining semantic/teaching boundary:** No content error is invented. The existing envelope identity, covered-signature and either-aligned-pass qualifiers remain source-bound introductory vocabulary, not an actual mail validation, configuration, trust result, complete feedback approval or installed trusted grammar.

Whole-response cases: 27, with1 correct and26 incorrect; display permutations 6, learner-mode projections 12. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 0, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 9. pbq:p073

Mode: **reusable_slot_values**. Origin: **authored_local**; authored revision `sha256:af635387b43d47c3f8f70e48c2eacafb8fdf2a8d6911c079009f811a3caf0e09`, snapshots/captures 0/0.

Current LOCAL effective: `sha256:317b018966acbc729e607b300cd053a1dc2d0a42586b9047e441eba582a359f6`.
Original published source: `sha256:9af9f242835314be6353f8f0ea925925e2cafdea2fa03d070e9bc8d37107870f`.
Current feedback: `sha256:2ae97adf8263d212bd028cc65914e15a70da482b79d068ae150e2694fce978f6`.
Prior offline source candidate: `sha256:a18307b2a322b76f5e8ce8cbe51270e4d017b0cb059975568a140d0bd9376024`.
Prior and new metadata-only source projection: `sha256:b2546d4aa965eca3fd56ad521a0a4c33973d1d1873fd7dfcb8a592188111ffdc`.
New versioned proof model: `sha256:6e3b126d4f8bb3555a275b546bdb3ae18995cc096a02f5807f272645ff499102`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json` (row fingerprint `sha256:8d7e70f772707c64bc032020defdaf65ffbd9085f8dcbeea468e3b45947043f4`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: `hint` at `sha256:da2e1bb87b6c6e9160a43c6fffbbb4318937e87f4700d4787c0698dd41f440cf`.

**Current hold:** HOLD: the instruction requests trust level and purpose, but the slots/values grade purposes and controls without a trust-level contract; source teaching correctly rejects trust based only on location.

**Remaining semantic/teaching boundary:** Purpose recognition does not approve inherent internal trust, implemented segmentation, universal guest restrictions or a new network policy. Full semantic, family and teaching gates remain held.

Whole-response cases: 3125, with1 correct and3124 incorrect; display permutations 120, learner-mode projections 240. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 0, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 10. pbq:p077

Mode: **reusable_slot_values**. Origin: **authored_local**; authored revision `sha256:eb9abd7a7a6ae5e13c22fa2a4208bb4e4c7a1518a4b97f57506bacead52da8c3`, snapshots/captures 0/0.

Current LOCAL effective: `sha256:d9d2fe093b7ed46cbfd8cfc45978e415555c169cdea8ce056b9a414abe737072`.
Original published source: `sha256:9e07e58f1b321662775d7f35b0e8bbefd5c0a31758a91791bae54af4af8883ae`.
Current feedback: `sha256:95d29e04c23d8337e4e3733f81195a316ffdfeab48bdaaa3a30671797fb74090`.
Prior offline source candidate: `sha256:1e9a2e9d10b669cce23a20050fa9c03de1f734937369db66bb1ea0ecbdedc1ff`.
Prior and new metadata-only source projection: `sha256:a3e6c913476df3f913fc483ef4f248bb64bbc984519f567df64e59bd2ddab60b`.
New versioned proof model: `sha256:1d37e9659507fcffe8a377ff817f36747de86768b3055585144ceab3bfb91fe0`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json` (row fingerprint `sha256:71c0c0f95b0c0f028a175ac63831400a930f6b4573c98406f306ce3be2cf9476`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: `hint` at `sha256:8819b2379536e1b6097fca86a4bd0578d41e4a9c47683661f669c0103e2cd7a8`.

**Current hold:** HOLD: who is responsible frames the task, but the first two blanks select security-element names and the third selects a CASB label; the keyed response does not answer the complete asked role question.

**Remaining semantic/teaching boundary:** The contract premises are fictional, not universal IaaS/SaaS duties, real legal allocation or inspected CASB integration. Correct label matching is not a responsible-party assessment or measured enforcement.

Whole-response cases: 27, with1 correct and26 incorrect; display permutations 6, learner-mode projections 12. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 0, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 11. pbq:p079

Mode: **reusable_slot_values**. Origin: **authored_local**; authored revision `sha256:de7c61252d21b94e1e8a89b54b7a973e28e0fc8588be4bec48adce5286fdc3ed`, snapshots/captures 0/0.

Current LOCAL effective: `sha256:2b022f2ad9d4f6524c3deae828f9128e040f024baec2104e3731e68f3ff78d44`.
Original published source: `sha256:479c56850aedec2203f0d1e70950ece92e20d500565800c8a0200d552436d140`.
Current feedback: `sha256:a5112769770f2dab59db7e785fac9b3d2f84100c5d8f0235516c8d91b6067d9c`.
Prior offline source candidate: `sha256:b89b52a435922c2efcec36e3461870bc1fbb3126832b1255710f540d0f424f4e`.
Prior and new metadata-only source projection: `sha256:3e74e8b9a07969be55cb742b32e7500186c19b11b8c02926a3f57ef5cdbd97dc`.
New versioned proof model: `sha256:bdaf12c5e0679eab84ff7fe7029a3e67c10c2bc983475fa667a8b904fe1d8944`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json` (row fingerprint `sha256:568651b18b9f9438c5be26a8eb6541abb5b86accf1572a6a73b0dfc49842f336`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: `hint` at `sha256:da2e1bb87b6c6e9160a43c6fffbbb4318937e87f4700d4787c0698dd41f440cf`.

**Current hold:** SELECT & FILL is unsupported: selectionFeedback is an unknown field and the component grammar is not installed. Do not strip grading-bearing fields to manufacture another revision; no question or full-feedback credit.

**Remaining semantic/teaching boundary:** Existing device/key/session, visibility, policy and update limitations remain. No product configuration, successful protection, comparative ranking or independent component skills are established.

Whole-response cases: 3125, with1 correct and3124 incorrect; display permutations 120, learner-mode projections 240. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 0, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

### 12. pbq:p223

Mode: **reusable_slot_values**. Origin: **captured_snapshot**; authored revision **null — no authored row**, snapshots/captures 1/1.

Current LOCAL effective: `sha256:06a1cfd2a732e42705bf69cf72a2c6ca96705e7731a3eea7ec8cfdc9a319905c`.
Original published source: `sha256:77ac1d7fa1590f4e51beaa5fd93d60a0c3fb47f4067a7f6b245f1b32ee36e179`.
Current feedback: `sha256:2ed17331dcfd95d577562c8f7fc1c168f44fd4d36946110d086f74d906a510f6`.
Prior offline source candidate: `sha256:dbdd7b4f03eb2482a14c512506419d46d12c2eb7689dcc9682e633dd3eedfc1b`.
Prior and new metadata-only source projection: `sha256:6d6c5089dc1af44c53830703b546bb015e6491eae763d579230fcb9f567a48f3`.
New versioned proof model: `sha256:37743e390db5e82ee01282d5386ed65ab19c1fa0984d4766227308a33f6db67f`.

The exact prior row and source candidate are bound from `docs/drafts/phase-2b5-remaining-six-pbq-grammars-proposals.json` (row fingerprint `sha256:c4dc87554e5194a47875e79386ca93b13e43b0bb49baade4473f00a87da79a65`). The pending editorial candidate is **not merged** into this compiler input. Metadata omissions: `acronyms` at `sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`, `beyondTextbook` at `sha256:fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa`.

**Current hold:** HOLD: the instruction asks observed-pattern-to-attack, while delivered slots present attack-name-to-pattern; the snapshot-only origin and diagnostic metadata projection cannot repair that direction.

**Remaining semantic/teaching boundary:** Authored source is absent. Capture replay supplies this local snapshot-only revision, not private data or author approval. Reversing task direction is an explicit offline assessment proposal requiring approval; no observed-incident diagnosis, universal switch behavior or runtime publication follows.

Whole-response cases: 256, with1 correct and255 incorrect; display permutations 24, learner-mode projections 48. JSON round-trip grading succeeds through a fresh module instance; recomputed-checksum tampering fails. Prior feedback credit: 0, carried without recounting. Current native trusted revision remains null; new proof trusted revision is null. Question/feedback/COMPLETE/family/teaching/activation credit stays zero.

## Provenance, projection and separate parent holds

All twelve new metadata-only source projections exactly match their earlier source-bound diagnostic projections. The compiler does not install the first/remaining-six instruction drafts, change keys, infer a target-order key or repair their teaching. HOTSPOT p007/p030 preserve source identity, diagram, native whole-choice key and complete metadata fingerprint before omitting only hotspots internally. p007's stale hidden label and p030's fictional/legal-scope limits stay held.

Ten reusable-slot records preserve blanks, normalizer semantics, offered values, accepted-value mapping, reusable selections and retained matching history. Current helper-incompatible top-level hints are fingerprinted before omission; p223's empty acronyms/false beyondTextbook flags are similarly bound. No general ignore-unknown-fields policy is added. Those original fields still exist in the published source and every original remains unsupported by current native v1. No hypothetical v1 UUID created inside the native helper is returned or registered.

There are11 authored-local rows and one snapshot-only row. p030 also has a captured snapshot; p223's authored revision is explicitly null and its captured/effective/local/publication stages are preserved. No authored record, private alternative or canonical family is invented. Its current name-to-pattern versus requested pattern-to-name direction hold remains even though the reusable-slot mechanics can be compiled.

**p008 and p022 are explicitly excluded.** Their exact parent-hold/source references remain in the packet. The new compiler rejects those identifiers; they are not folded into a general HOTSPOT repair or given new semantic review/credit. Their holds remain among the existing181.

Private namespaces, nonselected local questions, unknown records and all source substitutions are rejected. All selected inputs are the existing LOCAL publication objects and recorded metadata. No private payload is fetched, compiled, substituted or exported. This is not a fresh private/database read, and fingerprint provenance is not permission to act on a live service.

## Functional and adversarial proof

The initial focused contract check failed because the new module did not exist; the implemented contract then passed. The complete audit uses the real existing compilers and source-derived practice/exam whole/part graders, not mocks of their scoring semantics.

- **19,324 complete-response cases**:8 choices across the two HOTSPOT rows and19,316 complete combinations across ten slot rows. Exactly12 whole responses are correct,19,312 incorrect; all95,960 slot-result comparisons agree with legacy practice/exam. Native whole-choice grading also agrees. Repeated values are valid selections and are not forced into a bijection.
- **828 value-display permutations and1,656 practice/exam learner projections** preserve stable IDs, source slot order, value order defaults and hint visibility. Every learner payload passes the recursive hidden-field checks. The views are source/data projections, not a full browser, React component, keyboard or screen-reader run.
- **12 JSON round trips through a fresh module instance**, with all36 default-off operation checks. The proof can be serialized without raw source retention, and validated with the exact original source rather than a process-local cache.
- **703 rejected invalid inputs** cover missing/duplicate/unknown/foreign/wrong-role selections, unknown options, private/out-of-scope identifiers, stale/source-array changes, unknown payload fields, JSON/accessor/cycle/size failures, model/key/provenance/dependency/version tampering and recalculated checksums. Both grading and learner projection reject altered/rehashed proofs. New proof objects are rejected by the existing native trusted grader.
- The original12 v1 compilations are still explicitly rejected with their existing unsupported fields. No source, legacy runtime, normalizer, stable-selection contract or active package is patched to manufacture compatibility. All447 currently native-supported revisions still reconcile through the existing triage guard.
- **876 altered review packets rejected** preserve selection/order, exact prior/candidate/model revisions, source origin, counts, separate parent holds, all181 holds, default-off status, audit limitations, no credit/trust/activation and safe export. These equality guards protect the reviewed result, not independent proof of teaching semantics or benefit.

The remaining blockers are source-bound per row: channel/target-specificity ambiguity; categorical control wording; retained access-model/zone/contract/efficacy scope; snapshot direction/authorship; full exam feedback delivery; and the prior HOTSPOT content/legal limits. Compiler correctness does not resolve any of those. Full-feedback credit for p007/p030 remains previously bounded and is not re-counted. The other ten paired feedback records retain their holds; no correct match proves recovery, family independence or mastery.

## Native dependency audit scope

A read-only npm audit --json against the unchanged authoritative lockfile exited1 and reported **7 existing advisories:1 critical,4 high,1 moderate,1 low**. The project audit is not clean and project-wide security is not certified. Lockfile and package hashes are pinned in the packet. No dependency installation, version/lockfile change or forced audit remediation was performed.

The new proof's inspected transitive static import graph has13 Node/data modules and **zero external package imports**. The reported advisory packages are not imported by this proof path. This scoped offline proof can therefore be evaluated independently of the existing mobile/build/dependency findings; those findings are not declared fixed or harmless in the rest of the project. No build or deployment is performed in this slice.

## Exact prior/new/remaining accounting

| Bank measure | Prior | New | Combined / total | Remaining |
|---|---:|---:|---:|---:|
| Questions |463|0|463 /483|20|
| Full feedback |464|0|464 /483|19|
| COMPLETE question/feedback pairs |456|0|456 /483|27|

| Within these twelve pairs | Prior | New | Combined /12 | Remaining |
|---|---:|---:|---:|---:|
| Questions |0|0|0 /12|12|
| Full feedback |2|0|2 /12|10|
| COMPLETE pairs |0|0|0 /12|12|

Twelve original sources compile into the new LOCAL proof version; **zero current native grammars, question/feedback decisions, COMPLETE pairs or trusted revisions are repaired/promoted**. All181 existing holds preserve exact source/disposition fingerprints, zero additions/resolutions. The selected12 questions/10 held feedback bundles account for22 carried holds; the other159, including p008/p022, remain unchanged.

Catalogue dispositions stay1694/1878 (remaining184), support748/834 (remaining86), instructional rows786 raw/772 distinct/14 repeats. The142 prior-packet inventory reconstructs existing credit without recounting feedback or candidate diagnostics. Verify752 inherited fields,41 immediate baseline fields,440 source bindings and25 protected release hashes. Bank/source-choice/private/census/objective/ledger/native/specimen and all prior support/page/selector/guest/starter boundaries remain pinned. No canonical role/concept/objective/difficulty/skill/family/teaching link, human review, novelty, weight or activation is added.

## Delivery gates and limits

Required: deterministic write/recheck; all29 mapping tests and exact package reproduction; native dependency-audit result recorded honestly; git diff --check; source/protected/ledger/native/lockfile pins; [skip deploy] exit0/control1; only new module/audit/report/packet committed and pushed; remote refs and exact file bytes verified; empty index and eight unrelated dirty entries preserved.

No protected shared code, current import statements, active learner sources, database/private compilation, owner/account/storage/analytics/entitlement flow, live/browser action, deployment, automation or Phase3 work. **VIABLE OFFLINE PROOF, NOT A PRODUCTION OR LEARNING-ELIGIBILITY RELEASE.**
