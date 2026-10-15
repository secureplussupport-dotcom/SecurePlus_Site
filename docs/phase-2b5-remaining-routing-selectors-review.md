# Phase 2B-5 — remaining thirteen routing selectors

Date: 2026-10-15 (Asia/Singapore). Baseline: `0baaaf2ebfcfb8c88817bd2cea598ac7d92f96e5`. **LOCAL/default-off/unwired/learner-invisible; Phase 2B-5 and production NOT READY.**

All 13 specified remaining selector identities were reviewed. Five qualify only as bounded mechanisms: guest lesson-topic preview, fixed guest PBQ preview, related flashcard-to-lesson discovery, declared-level signup starter selection and starred-card filtering. Eight new whole-selector holds preserve unsupported measurement, session, restore, chronology, yield or repair claims. No subset was deferred. All 161 prior distinct held identities remain unresolved; **169 distinct holds** now exist.

Across both selector slices, all 26 identities now have either a bounded disposition or a hold: **7/26 bounded mechanisms, 19/26 held**. This is completed selector inspection, not universal qualification or Phase 2B-5 completion. No teaching, bank, support, canonical role/scope/link, family, trusted/mastery, human approval, publication, activation or Phase 3 credit is added.

The three task artifacts are this report, a source-bound packet and focused audit. The master plan remains approved product authority and the Phase 1 audit remains historical implementation evidence. Stronger product/learning claims that current source cannot establish are recorded as holds; no behavior is silently changed to resolve them.

## Exact row judgments

### intervention:guest-feature-lesson-topic

**Bounded mechanism disposition pending owner; catalogue credit 1.** Selector revision: `sha256:70d3f678f4cebce9ec239c8db58be0a25ff863721f632ecfd71780410b73e87d`. Effective code-unit bundle: `sha256:febe02d91c31f1d24e6bb29d4bf88be194ded501dc1f8afcddbe6b65eaa8571f`. Catalogue revision: `sha256:70d3f678f4cebce9ec239c8db58be0a25ff863721f632ecfd71780410b73e87d`.

A title choice selects one of three authored guest lesson-preview prompts, with first-prompt fallback.

Observed inputs: selected preview title; fixed authored prompt list. Output kinds: guest_demo_lesson_prompt.

Qualified as a small preview lookup only. Actual clicks update the highlighted title and displayed prompt; they do not open a catalogue Deep Dive, assess an answer or use learner history. Unknown/null titles fall back to the first preview. Prior prompt-content proposals remain separate and no actual lesson, concept link or recovered weakness is approved.

Source units: `src/App.jsx:24613`. Specific claim/branch locations: `src/App.jsx:24621`, `src/App.jsx:24633`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:guest-feature-review-topic

**HOLD; credit 0.** Selector revision: `sha256:f4f196810c3ef01191c6bc9474edd9c99ed9ff5d44f06574900c37d4447396de`. Effective code-unit bundle: `sha256:3218f8c4b6261061750ebb763b01f4deef840c3a889a640c27286968a2ebdc4b`. Catalogue revision: `sha256:f4f196810c3ef01191c6bc9474edd9c99ed9ff5d44f06574900c37d4447396de`.

A fixed PKI/IAM/Logs dictionary supplies percentage, miss signal and a three-step illustrative queue.

Observed inputs: selected synthetic topic; fixed authored path dictionary. Output kinds: guest_demo_review_path.

HOLD: the displayed accuracy-detected, adaptive-queue, priority and spaced labels are driven by fixed authored values, without actual history, measured accuracy or scheduling. Topic clicks choose a dictionary entry; they do not calculate a learner weakness. The preview itself has no visible synthetic-signal qualification. Unknown topics have no active-path fallback. The current title buttons keep normal UI topics in range, but the broader measured/adaptive learner claim remains unsupported.

Source units: `src/App.jsx:24565`. Specific claim/branch locations: `src/App.jsx:24609`, `src/App.jsx:24599`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:guest-feature-teaching

**HOLD; credit 0.** Selector revision: `sha256:c1b884830ca2a9e52d91cc367918b2a34918ecc93ada4a21a90b3d29621fa864`. Effective code-unit bundle: `sha256:1588c6784a789effd932b45003dda08e40f77cf99c9d0d4084d47af233c1725e`. Catalogue revision: `sha256:c1b884830ca2a9e52d91cc367918b2a34918ecc93ada4a21a90b3d29621fa864`.

Guest showcase type chooses fixed flashcard, MCQ, explanation, ordering, timer, review and lesson-preview branches.

Observed inputs: hardcoded feature type; in-view state; local flip/choice/sequence/focus state. Output kinds: guest_demo_flashcard, guest_demo_mcq, guest_demo_explanation, guest_demo_feedback, guest_demo_pbq, guest_demo_hint, guest_demo_review_path, guest_demo_lesson_prompt.

HOLD: branch selection and separate feature CTAs are real mechanics, but the aggregate presents an adaptive-review illustration as detected learner evidence. The MCQ correct-key class and CSS hover cue exist before selection; the ordering branch highlights the actual next key and accepts external text without offered-value validation. These are independent observations of this delivery unit, not an automatic transfer of child holds. Useful standalone teaching and preview interaction do not validate unassisted grading, measured personalization or the full product learning loop. The timer illustration remains excluded from instructional credit.

Source units: `src/App.jsx:24376`, `src/App.jsx:24638`, `src/App.jsx:24676`. Specific claim/branch locations: `src/App.jsx:24444`, `src/App.jsx:24519`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:guest-pbq-preview

**Bounded mechanism disposition pending owner; catalogue credit 1.** Selector revision: `sha256:866281eb8ad2f1760c18ee21d814eb28d3efd6e929d66057cac51f4c8d4b26c5`. Effective code-unit bundle: `sha256:fe5bc64c496d20f3fa1e02d9c9121cdca5244f2f2802eaf19335a8bfa225950d`. Catalogue revision: `sha256:866281eb8ad2f1760c18ee21d814eb28d3efd6e929d66057cac51f4c8d4b26c5`.

Guest preview resolves the single designated preview ID from live input first, then the local fallback, otherwise null.

Observed inputs: live/local bank; fixed free-preview ID. Output kinds: pbq.

Qualified as fixed-ID routing only: the exact source applies the same preview predicate to both banks, sets the selected PBQ and opens the PBQ view. The current local fallback contains p001. An incoming same-ID live variant takes precedence, without this audit approving its payload or creating historical revision guarantees. Empty injected banks return null; this does not authorize a non-preview question. No sign-in, unlock, payment, PBQ grading or canonical relationship is inferred.

Source units: `src/App.jsx:34456`. Specific claim/branch locations: `src/App.jsx:34457`, `src/App.jsx:34463`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:practice-launch

**HOLD; credit 0.** Selector revision: `sha256:3068f284d528b579176264da5a129cd35fc34a6e581ece2c8a49cb133a1df84a`. Effective code-unit bundle: `sha256:36b211e03ad46456752ac35112bd2ef318e28419e37395a940ce8bd2afb725a7`. Catalogue revision: `sha256:3068f284d528b579176264da5a129cd35fc34a6e581ece2c8a49cb133a1df84a`.

MCQ practice launches random, Smart Review, missed, starred and focused chapter pools and supports saved-session resume.

Observed inputs: bank and filters; guest/account status; missed/starred IDs; chapter review request; session results. Output kinds: mcq, lesson.

HOLD: the chapter request effect depends on a callback whose identity changes with attempts, but the request nonce is not consumed or acknowledged. A callback dependency update can replay the same request and reset session state. Saved questions/results also re-enter by serialized object without a current-bank revision check. Feedback is Pro-gated while stem/option glossary assistance remains available, so counts or correctness cannot be promoted to an unassisted mastery signal. Useful filtering, guest practice and question-level review remain recorded; no actual session, save, sound or telemetry ran.

Source units: `src/App.jsx:24992`. Specific claim/branch locations: `src/App.jsx:25165`, `src/App.jsx:25137`, `src/App.jsx:25831`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:random-flashcards

**HOLD; credit 0.** Selector revision: `sha256:5067328f9c5ada8d7a95711a4b05cb83c92fa548a9dc532ba27d49e4f21edd78`. Effective code-unit bundle: `sha256:1ea905e915f451f707c3a522f2c155b227a65232d5e359b37d7ba1541752cb79`. Catalogue revision: `sha256:5067328f9c5ada8d7a95711a4b05cb83c92fa548a9dc532ba27d49e4f21edd78`.

Random configuration samples current term/acronym cards, inserts type dividers and rebuilds saved ID lists through the builder.

Observed inputs: count and mode; term/acronym toggles; optional source cards; saved IDs/order. Output kinds: flashcard, deck_container.

HOLD: saved input count is normalized again to 10/20/30 and mixed-type quotas are reapplied. An accepted 11-ID mixed set restores 10 cards, and duplicate incoming IDs remain duplicated. Unknown IDs are silently removed; supplied saved IDs are not restricted to a historical/native namespace. Those restore/identity limits prevent whole saved-deck qualification even though ordinary generation is useful. No saved account state was loaded, and no child content, randomness quality or historical replay contract is approved.

Source units: `src/App.jsx:414`, `src/App.jsx:497`. Specific claim/branch locations: `src/App.jsx:416`, `src/App.jsx:558`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:related-flashcard-lessons

**Bounded mechanism disposition pending owner; catalogue credit 1.** Selector revision: `sha256:3911f68afa8755b7ae87ff029b37600e9554e17f09190fb0b28703d66efe43af`. Effective code-unit bundle: `sha256:3520205838a35a5cba9bd0e641607defdae5a4ab267afc067c085c91224de049`. Catalogue revision: `sha256:3911f68afa8755b7ae87ff029b37600e9554e17f09190fb0b28703d66efe43af`.

Current deck metadata/cards feed a bounded tag/token heuristic that lists up to three existing Deep Dives for more context.

Observed inputs: selected deck metadata/cards; lesson aliases/profiles. Output kinds: lesson.

Qualified only as legacy content discovery. Exact phrases/tokens, domain and broad objective overlap determine source-order-stable suggestions; no history, diagnosis or mastery criterion is used. The learner action offers more context, with source-bound account/Pro gates. Null and the starred collection return no suggestions. Authored titles or definitions can influence rank and are not semantic validation; no precise remediation, canonical teaching link, destination quality or held-content clearance follows.

Source units: `src/App.jsx:734`, `src/App.jsx:656`. Specific claim/branch locations: `src/App.jsx:735`, `src/App.jsx:31164`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:signup-diagnostic

**Bounded mechanism disposition pending owner; catalogue credit 1.** Selector revision: `sha256:538ffc90ba09b75b8365ca73d02a1f1cec762fe97ad04bfd26c598c6aa9a0281`. Effective code-unit bundle: `sha256:2c2f6f1afb22bc42facf2d92152899c2e855e5cb2d4effdedf40a97f2fbe7d53`. Catalogue revision: `sha256:538ffc90ba09b75b8365ca73d02a1f1cec762fe97ad04bfd26c598c6aa9a0281`.

Declared experience selects a fixed three-question original starter set, with new-level fallback and cloned option arrays.

Observed inputs: declared experience level; authored starter sets. Output kinds: starter_question.

Qualified as optional declared-level selection/check mechanics, not a validated diagnostic. The interface explicitly says it is not a readiness score; correctness styling and the explanation are gated until checking. The result is relative to the authored key, not a new judgment that the question or its rationale qualifies. Unknown experience values select the new set; tier is not an input. All 18 starter question/feedback holds and zero qualified pairs remain unchanged. No native m/p identity, profile write, account creation or trusted score is approved.

Source units: `src/App.jsx:21886`. Specific claim/branch locations: `src/App.jsx:22221`, `src/App.jsx:22245`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:smart-review

**HOLD; credit 0.** Selector revision: `sha256:d8691fa8f6f79b634e1a750328cad444898b2ec62ae4ef2518879890da83c2c8`. Effective code-unit bundle: `sha256:97c2bbe5983bcae5675e64ca7e64590be212b7c53f84b8a86149e246b285e6dc`. Catalogue revision: `sha256:d8691fa8f6f79b634e1a750328cad444898b2ec62ae4ef2518879890da83c2c8`.

Legacy SM2-style question ranking combines latest responses, repetition, due dates, topical/chapter history, stars and relaxed diversity passes.

Observed inputs: MCQ bank; attempt chronology; starred IDs; focus topics/chapter; count; mode; current time. Output kinds: mcq.

HOLD: missing/invalid attempt dates use the ambient clock rather than the supplied options.now, so a fixed now/history does not fully pin chronology. Source-bound clock cases change scores with identical explicit inputs. Correcting the same question immediately clears its latest-miss status and reduces its priority; topic/hard/enrichment caps relax to fill the set. These are useful question-level review mechanics but do not establish concept recovery, novel evidence or the stronger spaced/concept-repair promise. No canonical model/role/family/weight is approved and no learner history is queried.

Source units: `src/App.jsx:1883`. Specific claim/branch locations: `src/App.jsx:1886`, `src/App.jsx:1994`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:starred-flashcards

**Bounded mechanism disposition pending owner; catalogue credit 1.** Selector revision: `sha256:4cd813dfd6f3ff8510bc7f7d373966cdfa697b15aa921e541c5ed49a3a1b3079`. Effective code-unit bundle: `sha256:a0e29016593f2bd0566a3aea552fd74eb3421801b5443b1e4924fbb5ddff9d86`. Catalogue revision: `sha256:4cd813dfd6f3ff8510bc7f7d373966cdfa697b15aa921e541c5ed49a3a1b3079`.

Star keys select unique current authored cards in catalogue order, with a curated set and count/topic summary.

Observed inputs: starred card IDs; authored card bank. Output kinds: flashcard, deck_container.

Qualified as favorites/current-ID filtering only. Duplicate keys do not duplicate output, unknown/other-kind keys are ignored, and empty/null selection returns no cards. The set is user-curated rather than a measured weak area. Current content resolves by ID, not historical revision; source summary labels are descriptive, not mastery. Dictionary, card, deck and pass holds remain independent, and no real personal stars or saved state were read.

Source units: `src/App.jsx:383`. Specific claim/branch locations: `src/App.jsx:404`, `src/App.jsx:385`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:starter-deck

**HOLD; credit 0.** Selector revision: `sha256:3530d2b084f3efaedd829ecd925cef2fe53dbbb2894c6bf2e9973d37effbf2a2`. Effective code-unit bundle: `sha256:8ab6fbf265702e3ce6ba5275c54197c1253fa7e8aa5cd96baf6b1a2f40e07a8f`. Catalogue revision: `sha256:3530d2b084f3efaedd829ecd925cef2fe53dbbb2894c6bf2e9973d37effbf2a2`.

The Pro fallback assistant deck takes source-order slices from five hardcoded topic priorities, then fills to 18 unique current cards.

Observed inputs: priority topic list; authored cards. Output kinds: flashcard.

HOLD: the intrinsic description calls these high-yield Security+ terms, but the source provides string/topic matching and first-card order rather than a reviewed importance/yield model. It is a useful preset starter collection while weak-area data is absent; it is not individualized weakness diagnosis or demonstrated exam coverage. Existing topic tags, selected child content and canonical objective/family links are not automatically approved by this container-shaped selector. Owner must bound the yield claim or provide reviewed grounding.

Source units: `src/App.jsx:698`. Specific claim/branch locations: `src/App.jsx:723`, `src/App.jsx:730`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:weak-area-actions

**HOLD; credit 0.** Selector revision: `sha256:f24623d2fef37e77cb48a77d565969d1264b9f70898152a03725d932893c7105`. Effective code-unit bundle: `sha256:4b971a0d3892896a72d12b455562a3c88e9f83f11450566f5c6b04d1ab572ae8`. Catalogue revision: `sha256:f24623d2fef37e77cb48a77d565969d1264b9f70898152a03725d932893c7105`.

Dashboard ranks chapters with latest misses, repeated misses and historical accuracy, then offers review, lessons and flashcards.

Observed inputs: latest MCQ outcomes; chapter/topic aggregates; bank. Output kinds: mcq, lesson, flashcard.

HOLD: the visible repair sequence describes missed concepts and related/targeted flashcards, but the source supplies coarse chapter/topic signals and delegates to legacy lexical routes. For the current RTO miss, its Business Continuity topic feeds an18-card deck with no RTO/RPO/MTD/MTTR target. Immediate correction also removes the latest-miss chapter action without an independent proof gate. This is a judgment of the action promise/output chain, not automatic inheritance of a held destination. No learner recovery or canonical remediation link is established.

Source units: `src/App.jsx:24116`. Specific claim/branch locations: `src/App.jsx:24131`, `src/App.jsx:24301`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

### intervention:weak-area-deck

**HOLD; credit 0.** Selector revision: `sha256:9d831a1f889d9a71e04dec1677daa175c981da5660b16474b2dc2cc14a59fa9f`. Effective code-unit bundle: `sha256:0aface0d8622f6d2ead482af88649e1b73c34fc030b50120d5e98d0224ff9c50`. Catalogue revision: `sha256:9d831a1f889d9a71e04dec1677daa175c981da5660b16474b2dc2cc14a59fa9f`.

Weak chapter plus topic/term/token overlap ranks current cards and backfills up to 18 unique identities.

Observed inputs: weak chapter; weak topics; authored cards. Output kinds: flashcard.

HOLD: the description presents a deck built from named weak signals even when broad-topic and fallback order omit the needed target. The actual Business Continuity context from m032 produces18 cards with none of the four recovery metrics; naming RTO directly produces a different result. Empty/unknown chapter returns null, while unsupported topics can still receive generic chapter cards. Useful broad vocabulary review is not an approved concept-repair mapping or proof of improvement.

Source units: `src/App.jsx:656`. Specific claim/branch locations: `src/App.jsx:687`, `src/App.jsx:679`. The packet binds full source-unit/dependency/call-site revisions and fragment hashes.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, measured learner outcome or human approval is inferred.

## Source authority, precedence and reused evidence

The audit checks each current inventory/catalogue signature against its exact code-unit bundle and dependency hashes. It records observed inputs/output kinds, determinism statements, call-site lines and surfaced claim locations. These are source observations, not approved interfaces or canonical teaching links. The 13 selected identities bind 17 selector units, plus specific supporting fragments for signup controls, dashboard claims, modes, restore/session behavior and guest hover cues.

Existing evidence is reused rather than recomputing child qualifications: 16 field-level bindings pin the guest 14 review, starter-pair review and lesson/deck-container review. Their current file/source hashes are verified. This carries guest MCQ/ordering/review provenance and feedback limits, the unsupported starter question/feedback identities, and saved-ID/child-content observations without transferring those conclusions automatically to a routing row. Fresh selector probes below exercise the actual source expressions, and every new hold gives its own claim/output reason.

Guest feature type selects fixed JSX branches and local state. The topic preview is a three-title lookup and changes only a short authored prompt, with no actual Deep Dive navigation. Review-topic selection reads a fixed PKI/IAM/Logs dictionary. The whole showcase also contains pre-answer MCQ key styling and ordering-key assistance, so useful teaching cannot be treated as unassisted assessment. The timed-exam illustration remains explicitly outside instructional credit.

Guest PBQ preview uses live-bank matching ID first, then local-bank matching ID, otherwise null; the current fallback contains p001. A same-ID incoming variant can change delivered content. This review qualifies the fixed route, not the payload, grading, entitlement state, publication or historical identity of that variant. No actual private/live input is fetched.

Random and saved sets use current authored card IDs, then normalize counts/modes and reapply type quotas. A save/restore operation is therefore not historical replay or necessarily an exact identity-list restoration. Starred filtering instead takes matching current authored cards once in source order; it makes no claim that they were missed, spaced, learned or stable historical versions. Related-lesson discovery uses deck title/body tokens, domain and objective overlap to list up to three context destinations. Its account/Pro checks are source-bound; no real lesson opens or destination approval occurs.

The optional signup set uses declared experience, not subscription tier or inferred ability. Its interface explicitly says it is not a readiness score. Fresh option-state checks distinguish selected pre-answer styling from post-check correctness/feedback. The nine authored starter questions and their nine feedback bundles still have 18 separate holds and 0 qualified pairs; qualifying a selector does not resolve their semantics, identity or complete-feedback contracts. No account is created, profile saved or canonical score accepted here.

## Focused source replays

| Probe | Evidence and boundary |
|---|---|
| Guest lesson topic |5 title/null/unknown cases select the exact prompt or first-prompt fallback. No catalogue lesson opens.|
| Guest review topic |3 fixed dictionaries reproduce their own percentages and step order; unknown input has no active path. Actual accuracy/history is absent.|
| Guest aggregate |Current 14-record guest census is verified, along with key/hover/ordering-hint and fixed-review source branches. Prior child judgments remain separate; timer illustration remains excluded.|
| Guest PBQ preview |4 live/local/same-ID/missing-ID cases plus empty injected banks bind exact precedence and null behavior. No live bank/entitlement query or grading.|
| Starred cards |4 empty/single/subset/all cases include duplicate, unknown and other-kind keys. Outputs are unique in authored order, including current-ID content resolution; no personal stars read.|
| Random/saved cards |108 count/mode/toggle cases bind normalization, membership and divider counts. Preserved-order fixtures do not certify random distribution. An accepted 11-card mixed ID list restores 10, retaining a duplicate ID in a separate case and dropping an unknown-only set.|
| Related lessons |All 29 current native decks produce stable source-ranked outputs of at most 3 distinct existing lesson IDs. Null/starred inputs return none. This is context discovery, not exact misconception diagnosis.|
| Signup |10 declared/unknown level inputs bind three authored questions and independent option copies. 288 option-state checks enforce the observed before/after-check styling boundary; source feedback is gated. No learner profile or account write.|
| Smart Review |16 valid-history/count cases are deterministic with fixed dates/now, unique and pool-bounded. Missing-date clock fixtures hold options.now constant but change scores as ambient time changes. Immediate same-question correction clears the latest miss and reduces priority; soft diversity caps relax to fill.|
| Weak-area cards |6 empty/unknown/current-topic/exact-term contexts bind current outputs. The current m032 Business Continuity topic yields 18 cards and no RTO/RPO/MTD/MTTR target; a directly supplied RTO term changes that output. No recovery or canonical mapping is approved.|
| Starter deck |The source preset yields 18 unique cards, independent of learner history. The high-yield claim is not validated by a priority string or authored source order.|
| Weak-area actions |4 fixed history cases bind chapter priorities, repeated misses and action removal after immediate correction. The proposed repair sequence inherits no demonstrated recovery from its downstream helper outputs.|
| Practice launch/resume |The same request body is invoked twice with a fixed nonce; source callback/effect dependencies and lack of nonce consumption permit replay when attempts change. Serialized saved question objects return without current-bank revision comparison. No real React effect, attempt save, session persistence or telemetry runs.|

All replays are local pure functions/expressions or isolated prefixes using synthetic callbacks. Dates, histories, profile/result containers, same-ID variants and saved inputs are fixtures. No real browser session, React effect scheduling, storage/network handler, sound, timers, analytics, signup/payment/unlock, account profile or learner history is exercised. The practice replay is a source-derived dependency risk, not a claim of a production browser failure observed here.

Only metadata, IDs, hashes, locations, counts and bounded judgments leave the audit. Raw stems, choices, keys, body/definition payloads and learner/private instances are excluded. Synthetic identifiers are audit fixtures, not newly invented native m/p publication records or accepted trusted evidence.

## Mechanical qualification and independent holds

The five positive judgments concern lookup, filtering, current-ID context discovery or optional starter-set selection. They approve no child content, diagnostic validity, teaching link or learning outcome. The signup disclaimer supports this narrow boundary; the fixed guest review's accuracy-detected wording does not. The related-lesson UI offers more context rather than claiming to identify a specific misconception, while the weak-area descriptions promise targeted repair that the current RTO output does not supply.

Whole-selector holds come from each selector's own source and surfaced claims. The guest review is fixed-data lookup presented as measured adaptation; the aggregate also exposes answer assistance. Random restore can omit or duplicate identities. Smart Review has an ambient-clock fallback outside options.now and no independent concept-proof gate. Starter priorities do not establish relative exam yield. Weak-area actions/decks can omit the named recovery target. Practice launch/resume lacks a consumed nonce/current-revision contract. None of these findings automatically holds an unrelated child or clears a previous content/family hold.

Useful legacy behavior is retained in the evidence. The review does not claim every related destination is wrong, every repeated practice answer is useless, a preset starter deck cannot help, or all dictionaries/questions are invalid. It declines stronger whole-record promises and evidence credit until the specific gaps are resolved through separately authorized work.

## Exact prior + new + remaining accounting

All 128 previous substantive packets reconcile with 1683 prior distinct qualified dispositions. The audit verifies 387 source-file bindings, 161 prior held identities and 752 prior field bindings. Fifteen already-held deck containers, all starter pairs, old bank/guest/private/combined-skill boundaries, limited-guide references and the saved mixed-set omission remain unchanged. Eight new selector holds are distinct from every prior held identity, giving 169 total.

| Catalogue kind | Total | Prior | New qualified mechanisms | Combined pending | Remaining |
|---|---:|---:|---:|---:|---:|
|deck_container|29|14|0|14|15|
|explanation_bundle|494|464|0|464|30|
|flashcard|313|271|0|271|42|
|glossary_definition|162|150|0|150|12|
|guest_demo_explanation|2|2|0|2|0|
|guest_demo_feedback|2|0|0|0|2|
|guest_demo_flashcard|1|1|0|1|0|
|guest_demo_hint|1|0|0|0|1|
|guest_demo_lesson_prompt|3|3|0|3|0|
|guest_demo_mcq|1|0|0|0|1|
|guest_demo_pbq|1|0|0|0|1|
|guest_demo_review_path|3|0|0|0|3|
|intervention_selector|26|2|5|7|19|
|keyword_guide|32|32|0|32|0|
|lesson|32|31|0|31|1|
|lesson_check|128|115|0|115|13|
|lesson_section|106|103|0|103|3|
|lesson_traps|32|32|0|32|0|
|mcq|395|395|0|395|0|
|pbq|90|68|0|68|22|
|public_learning_page|16|0|0|0|16|
|starter_question|9|0|0|0|9|

Catalogue: **1688/1878**, remaining **190**. Selectors: prior 2 + new 5 =**7/26** bounded dispositions, with 19 held and 0 unselected. All 26 have been inspected across the two slices. The remaining 190 catalogue IDs include 168 of 169 held identities; pbq:p036 retains its carried qualification hold despite a prior disposition. There are 22 remaining unheld IDs. These counts overlap and must not be added.

Support: **748/834**, remaining **86**; prior 748 + new 0. These selectors are outside that denominator. Cards/decks/lessons/keyword guides/traps remain 271/313, 14/29, 31/32, 32/32, 32/32. Glossary definitions remain 150/162. All 21 tracked objective totals/remaining IDs are unchanged, with no selector memberships or new objective denominator.

Bank question/full-feedback/COMPLETE-pair totals remain **463/483**, **464/483**, **456/483**, leaving 20/19/27. Starter pairs remain 0/9; guest bounded records remain 6/14 with 0/2 qualified pairs. No bank, support, family, precise scope, difficulty, skill, primary concept or teaching link is approved or newly credited.

The existing primary-array reconciler stores five typed selector rows in instructionalProposals solely for disposition compatibility. Each has newTeachingContentProposalCredit=0. Mechanical primary-array rows move 775→780, distinct identities 761→766 and repeats stay 14; this does not mean five new instructional items. Canonical roles/objectives/links, human review/approval, publication/activation, trusted revisions, family and mastery all remain unset or false.

## Validation and release limits

The focused guard rejects **3942 altered packets** across source signatures, input/output/claim bindings, reused evidence, restore/count/mode/selection cases, signup feedback visibility, chronology, repeated requests, child/destination approval, erased holds, inflated coverage/content/mastery credit, raw/private/learner exports and READY promotion. It scans runtime sources for an accidental proposal import. A recheck without --write must reproduce identical packet/report bytes.

Release gates: deterministic focused write/recheck; all 29 existing content-mapping tests and deterministic active-package verification; 25 protected release fingerprints and all source bindings; git diff --check; skip marker exit 0/control 1; a task-only three-artifact [skip deploy] commit/push; matching HEAD/origin/main/remote-main/API refs; and exact remote artifact bytes/SHA-256s. Actual results are recorded in the release transcript and do not establish deployed behavior. The eight unrelated dirty entries remain unstaged and the index is empty after release.

No runtime or learner-visible edit, live/private payload query, migration, deployment, publication/activation, real account/attempt write or Phase 3 work occurs. No browser or learning-outcome validation is claimed. This finite 13-record review is complete as an offline judgment; Phase 2B-5 and production remain NOT READY.
