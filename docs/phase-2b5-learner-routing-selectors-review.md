# Phase 2B-5 — thirteen learner-routing selectors

Date: 2026-10-14. Baseline: `239fe190a6598d7d6ce08b769a0c8146466cf7b0`. **LOCAL/default-off/unwired/learner-invisible. Phase 2B-5 and production NOT READY.**

All 13 specified selector identities were reviewed, with no subset deferred. Two mechanisms qualify as bounded routing/reveal dispositions: inline glossary delivery and the source-order next flashcard deck. Eleven new whole-selector holds record unsupported or ambiguous routing/session/learner claims. All 150 prior distinct holds remain unresolved; **161 distinct holds** now exist. Useful narrower behavior inside a held selector is recorded without qualifying the entire identity.

The three task artifacts are this report, a source-bound packet and the focused adversarial audit. No runtime, live application, source wording, access, payment/voucher, storage, account/attempt, selector, active mapping, registry, compiler, diagnostic, ledger or deployment behavior changes. The master plan remains approved product authority; the Phase 1 audit remains historical implementation evidence. Current conflicts with the intended learning loop are recorded as source-bound holds before any behavioral change. No canonical label/scope/link or Phase 3 decision is approved.

## Exact source and decision scope

### intervention:cipher-study-routing

**HOLD; credit 0.** Selector revision: `sha256:4197a6704a618899826d65d1690d9e9af733f73475b524a6f1e43eb6336d84e2`. Effective code-unit bundle: `sha256:a9c6e280d9af5debd81bbc2aa51e5d1f39b056e5827380755485504eb5169644`. Catalogue revision: `sha256:4197a6704a618899826d65d1690d9e9af733f73475b524a6f1e43eb6336d84e2`.

Preset assistant chooses an MCQ repair chapter, offers a sprint and optionally supplies a Pro flashcard deck.

Observed inputs: current view; attempt-derived weak chapter/topics; tier; supplied assistant deck. Output kinds: mcq, flashcard.

HOLD: learner text describes best next move, missed concepts and a prepared 10-question sprint, but context uses latest MCQ IDs plus historical chapter accuracy, not canonical concept diagnosis. The same question corrected later can still drive lowest historical accuracy, and orphan IDs can supply a chapter fallback. Supplied assistant content precedes weak/starter rebuilding without checking alignment. Preset disclosure is present and useful, but it does not validate those stronger targeting/preparation claims. No FAQ, pricing/payment outcome or external service promise is approved.

Source units: `src/App.jsx:27933`, `src/App.jsx:33571`. Specific surfaced-claim/branch locations: `src/App.jsx:28014`, `src/App.jsx:28020`, `src/App.jsx:28114`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:daily-challenges

**HOLD; credit 0.** Selector revision: `sha256:72f694a0e80ce2591c647017d374ee32038ad4eb6fb6fe12530c41c487f6e0d5`. Effective code-unit bundle: `sha256:8ded0c0b8a433a649a9a65cd539d66074c02dbbd734ea90c88595637703b1a1d`. Catalogue revision: `sha256:72f694a0e80ce2591c647017d374ee32038ad4eb6fb6fe12530c41c487f6e0d5`.

Local weekday chooses one fixed five-MCQ set used by the full challenge and landing widget.

Observed inputs: local calendar weekday; hardcoded question IDs; effective banks. Output kinds: mcq, pbq.

HOLD: all seven current weekday lists resolve to five local MCQs, and the schedule repeats rather than adapting to a learner. The two consumers recompute a new date-keyed question list but retain question index, selection and results across an enduring mount. A calendar rollover can therefore change the question under existing progress without a challenge-identity reset. This is a source-derived conditional transition, not an observed live failure; a whole daily-session/routing claim needs a defined rollover boundary. Unrendered descriptions are not treated as surfaced promises. No streak, reward or coin operation was executed.

Source units: `src/App.jsx:16238`, `src/App.jsx:22756`, `src/App.jsx:23054`. Specific surfaced-claim/branch locations: `src/App.jsx:22846`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:deep-dive-recommendations

**HOLD; credit 0.** Selector revision: `sha256:c05f9bf90cfd71e54cf47587e2f10c473d2a5b7ac23da274b920db6313c5c569`. Effective code-unit bundle: `sha256:c0f49c451e0b72016cba8b810379d37fa7eb4b2897f55a4ab5a9fbeba3536dc3`. Catalogue revision: `sha256:c05f9bf90cfd71e54cf47587e2f10c473d2a5b7ac23da274b920db6313c5c569`.

Legacy lesson ranking combines objective/topic/domain hints and lexical overlap over missed-question fields.

Observed inputs: missed question content and objective/topic metadata; limit; lesson profiles. Output kinds: lesson.

HOLD: the surfaced chosen-from-missed-concepts and match-description language is stronger than the grounding. Options and explanations change ranking and matched terms even for an otherwise unrelated synthetic prompt; those can be distractors or supplied solution text rather than demonstrated misunderstandings. Unknown domains can yield no result, and domain fallback follows the first miss. Existing lesson IDs and deterministic scores establish routing behavior, not approved concept/teaching links or recovered weakness. Destinations keep their own independent holds.

Source units: `src/lib/deepDiveRecommendations.js:1`. Specific surfaced-claim/branch locations: `src/App.jsx:24060`, `src/lib/deepDiveRecommendations.js:183`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:diagnostic

**HOLD; credit 0.** Selector revision: `sha256:7416745118df4983510ce8aa4ef2f555330baa9c70aae8fa48549fc9d926afc0`. Effective code-unit bundle: `sha256:ae476f7df5760ea348e2fdf9653edeb7f309e1f281b48f90b4ef224225d1ebf3`. Catalogue revision: `sha256:7416745118df4983510ce8aa4ef2f555330baa9c70aae8fa48549fc9d926afc0`.

Five short easy questions, one per chapter where a native candidate or authored fallback exists, seed later MCQ review.

Observed inputs: effective MCQs; chapter order; concise fallback sets. Output kinds: mcq, starter_question.

HOLD: the current default includes m032 with an RTO glossary link in the stem before submission, while the interface calls this a mini mock test/baseline. A single sampled answer per domain and assisted recall do not establish missed canonical concepts. The summary announces personalized Smart Review before the completion callback saves; failure handling can still mark the baseline done. Empty native pools fall back to separately held starter identities, without proving those assessment/feedback contracts. Native/starter question and feedback judgments are not requalified by this selector review.

Source units: `src/App.jsx:2056`, `src/App.jsx:33131`. Specific surfaced-claim/branch locations: `src/App.jsx:33232`, `src/App.jsx:33188`, `src/App.jsx:33258`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:exam-selection

**HOLD; credit 0.** Selector revision: `sha256:1904fadabb741f53ac262ed9e6100595d0d260a756d4aa8887739860ea431315`. Effective code-unit bundle: `sha256:02fc93573e0760a0baf34dfcca7edf2ead6960a2c2d5c9ca5c1f278450e20577`. Catalogue revision: `sha256:1904fadabb741f53ac262ed9e6100595d0d260a756d4aa8887739860ea431315`.

Timed local practice samples non-enrichment PBQs first and MCQs second, with saved-session resume and result review.

Observed inputs: effective banks; requested MCQ/PBQ counts; access state; exam results. Output kinds: mcq, pbq.

HOLD: selection can underfill a requested size and voucher consumption precedes pool construction. Saved questions are reused without current-revision resampling, and a saved zero timer falls through to the configured duration. The composition UI permits all-PBQ runs; inline glossary support also remains available before answers. The explicit practice-not-official-scoring disclaimer is preserved and is not called an official-score claim. These selection/resume/assistance limits prevent qualification as a coherent timed-assessment selector; no voucher, storage, timer or result write occurred.

Source units: `src/App.jsx:26638`. Specific surfaced-claim/branch locations: `src/App.jsx:26746`, `src/App.jsx:26922`, `src/App.jsx:26985`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:flashcard-navigation

**HOLD; credit 0.** Selector revision: `sha256:e88530855f742ee5cf01f085d8138fa95c30373bf477aa1d1f43c7a14eb592a1`. Effective code-unit bundle: `sha256:df105eecc105b68891528f15cb3854e686e2e0f1606e9dc580dd6b944b18bff4`. Catalogue revision: `sha256:e88530855f742ee5cf01f085d8138fa95c30373bf477aa1d1f43c7a14eb592a1`.

Catalogue, chapter, current-ID shared/saved decks and assistant requests resolve a deck/mode for study.

Observed inputs: chapter filter; requested/saved/shared/assistant deck IDs; mode; authored cards. Output kinds: flashcard, deck_container.

HOLD: matching saved IDs take precedence over native catalogue IDs, so a native URL is not exclusive or revision-pinned content. Shared parsing drops unknown IDs but keeps duplicates; two occurrences of one ID can flow to the pass whose completion counts distinct IDs. Native current decks remain useful, but the generalized input/identity contract is ambiguous and can make completion unreachable. Persisting new generated sets with a prefix does not retroactively normalize all hydrated inputs. No actual saved account state, collision or corrupted deck was fetched or written.

Source units: `src/App.jsx:31898`. Specific surfaced-claim/branch locations: `src/App.jsx:32089`, `src/App.jsx:32161`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:flashcard-study-pass

**HOLD; credit 0.** Selector revision: `sha256:f394533691556b6234ba22aa955ef14f44a63ae0aaa42de8c63b65c0baad7797`. Effective code-unit bundle: `sha256:d4f8b9e2727307fe7d5f877608d04d3cf2cc9db069c5e2c2534088613b4b0987`. Catalogue revision: `sha256:f394533691556b6234ba22aa955ef14f44a63ae0aaa42de8c63b65c0baad7797`.

Flip, move, shuffle, self-rate, complete a pass and continue to another deck or lesson.

Observed inputs: deck; mode; card order; local pass progress. Output kinds: flashcard, lesson, deck_container.

HOLD: pass completion counts distinct rated identities irrespective of Again/Got it; mastered is a self-rated label rather than measured retention. More concretely, duplicated incoming card IDs can make the distinct-ID completion threshold unreachable. All-Again completion does not itself increase the mastered count; those two signals are kept distinct. Native-container content qualifications do not approve this broader state/presentation contract or turn a reveal/selection into independent mastery evidence.

Source units: `src/App.jsx:30903`. Specific surfaced-claim/branch locations: `src/App.jsx:31077`, `src/App.jsx:31020`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:glossary-delivery

**Bounded mechanism disposition pending owner; catalogue credit 1.** Selector revision: `sha256:8684bb55616f18bd246f9ed2873ff8ed21769e6f8285588dbeb87a2ebb775ef2`. Effective code-unit bundle: `sha256:5339c00a0f03764933ac5980fe944f35f1b2ba87c013d533890c6d45d860c5e8`. Catalogue revision: `sha256:8684bb55616f18bd246f9ed2873ff8ed21769e6f8285588dbeb87a2ebb775ef2`.

Case-insensitive inline term matching exposes the bound glossary entry on pointer or keyboard activation.

Observed inputs: rendered text; glossary definitions. Output kinds: glossary_definition.

Qualified only as an explicit definition-reveal mechanism. Longest-first matching uses non-alphanumeric boundaries within formatting segments; formatting can break a longer phrase. Outside pointer interaction closes the popup, and Enter/Space toggle it. Plain React text rendering does not interpret input markup. No word-sense disambiguation, dictionary correctness, human approval or canonical mapping is inferred. It is assistance wherever a consumer renders it, including assessment options/stems; this qualification does not approve an unassisted exam/diagnostic claim or clear any held glossary entry.

Source units: `src/App.jsx:20657`, `src/App.jsx:2404`. Specific surfaced-claim/branch locations: `src/App.jsx:20738`, `src/App.jsx:20756`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:lesson-navigation

**HOLD; credit 0.** Selector revision: `sha256:96bb76e903452092f979401acb1f6917f0d6c68dd3b6223956d610625aca7891`. Effective code-unit bundle: `sha256:6aea9a4422fef3fad90ef012cd584fb3be7a5af6551e268194f71b66348173ef`. Catalogue revision: `sha256:96bb76e903452092f979401acb1f6917f0d6c68dd3b6223956d610625aca7891`.

Profile-ordered/searchable gated lessons deliver keywords, authored sections/traps, reveal-only checks and three derived practice items.

Observed inputs: query/domain; lesson selection; tier; lesson profile; local study step. Output kinds: lesson, lesson_section, lesson_check, deck_container.

HOLD: the learner end action promises related flashcards/matching acronyms, but selection takes the first deck with any overlapping broad objective and otherwise the first catalogue deck. The resilience/recovery lesson can select the security-principles/access deck with no RTO/RPO/MTD/MTTR card. Search, optional flags and existing Pro/free-preview gates are source-proven; self-marked completion and best recall percentage do not supply mastery or validate this remediation link. All source-container/content holds remain independent.

Source units: `src/App.jsx:31239`. Specific surfaced-claim/branch locations: `src/App.jsx:31741`, `src/App.jsx:31466`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:lesson-related-pbq

**HOLD; credit 0.** Selector revision: `sha256:beeeda0e5bbece13337727c60f0d35df0fbd3d2884eda83232c58406c29d64fe`. Effective code-unit bundle: `sha256:ef0c8c374ce6c8f0db4c21f0ca06c280e9fac13b9df6225156175d182e449c04`. Catalogue revision: `sha256:beeeda0e5bbece13337727c60f0d35df0fbd3d2884eda83232c58406c29d64fe`.

Lesson actions launch a ten-question chapter review or choose a same-chapter/access fallback PBQ.

Observed inputs: lesson chapter; effective PBQ bank; tier/unlocked IDs. Output kinds: pbq, mcq.

HOLD: the related label is not grounded in a specific skill. With no requested-chapter candidate, an accessible preview from another chapter can be selected; when the first same-chapter candidate is locked, it can block that accessible fallback and route to access UI. Chapter/type/entitlement routing is useful legacy behavior but not an approved teaching link. No unlock, wallet interaction, learner navigation or current private-bank query occurred.

Source units: `src/App.jsx:34435`. Specific surfaced-claim/branch locations: `src/App.jsx:34444`, `src/App.jsx:31732`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:next-flashcard-deck

**Bounded mechanism disposition pending owner; catalogue credit 1.** Selector revision: `sha256:164a0c7bc855937950f553f217ab829f84d06ebf14acc8b49aaf4a49ce2c9dd3`. Effective code-unit bundle: `sha256:3081c7ca1fa49fd12bd653d1363328f96116ce8b6cb39d1fd1dfd08a55552ee7`. Catalogue revision: `sha256:164a0c7bc855937950f553f217ab829f84d06ebf14acc8b49aaf4a49ce2c9dd3`.

Continue-studying chooses the cyclic successor in the authored deck catalogue.

Observed inputs: current deck ID; authored deck order. Output kinds: deck_container.

Qualified strictly as ordered navigation: all 29 current native decks advance to the next source entry, the last wraps to the first, unknown/null current IDs choose the first and an empty injected catalogue yields null. There is no learner-history or concept criterion. A destination keeps its own content/hold status; no relevance, novelty, improved retention, family independence or mastery is approved.

Source units: `src/App.jsx:464`. Specific surfaced-claim/branch locations: `src/App.jsx:31104`, `src/App.jsx:466`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:next-related-pbq

**HOLD; credit 0.** Selector revision: `sha256:d0bf4ead5b984dc63ae04943dbbe0ca512f481ba27fde00c46387ed489819e75`. Effective code-unit bundle: `sha256:fa2c67bf54146693fdf754feaba9e1c835bc803e313a6458cd6629fa8cce1362`. Catalogue revision: `sha256:d0bf4ead5b984dc63ae04943dbbe0ca512f481ba27fde00c46387ed489819e75`.

Next-question helper prefers never-correct same chapter/type, then same chapter, then a cyclic successor.

Observed inputs: current PBQ; successful attempt IDs; effective PBQ bank order. Output kinds: pbq.

HOLD: the surfaced Try a different PBQ label is not guaranteed for a valid one-item runtime bank, which returns the current question. An unknown current ID falls to the first source row, and any historical correct attempt excludes a candidate from preferred branches even if later missed. Empty runtime input falls back to the local bank. These exact branches establish coarse navigation, not reliable difference, concept relatedness or independently novel evidence. The signed-in caller restricts this action to Pro; no production entitlement state was observed.

Source units: `src/App.jsx:16272`. Specific surfaced-claim/branch locations: `src/App.jsx:26557`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

### intervention:pbq-catalogue-selection

**HOLD; credit 0.** Selector revision: `sha256:a043b959e69c25e991b29b7db13224867f83a137ce5a3cf0f7f728d6343e7580`. Effective code-unit bundle: `sha256:2597ecf5bc46c57b7fc6b7d39fd4422ee9d89dd185fd59defac2b9a1e0e91df4`. Catalogue revision: `sha256:a043b959e69c25e991b29b7db13224867f83a137ce5a3cf0f7f728d6343e7580`.

Browse/filter/paginate/star PBQs and use Pro random practice with unseen/historically-missed priorities.

Observed inputs: bank; chapter/type/missed/starred filters; attempts; tier; visible count. Output kinds: pbq.

HOLD: empty bank or load error returns upgrade UI independently of the actual tier, so even a Pro empty/error state is represented as an access upgrade rather than a distinct data failure. History also permits the same ID in ever-correct and ever-missed sets; the list ranks ever-correct rows last rather than using latest correctness. Random practice uses the whole bank rather than the visible filtered list and falls back to the last source row when exhausted. Those limits must remain explicit before approving the whole workspace/recommended-review claim. No payment, unlock, live load failure or account history was exercised.

Source units: `src/App.jsx:25917`. Specific surfaced-claim/branch locations: `src/App.jsx:26046`, `src/App.jsx:25968`. Complete source-unit/dependency/call-site revisions and claim-fragment hashes are in the packet.

No instructional item, destination content, canonical concept/objective/role, teaching link, family independence, trusted revision, learner outcome or human approval is inferred.

## How source revisions and reachability were checked

The current delivery inventory supplies 13 exact intervention identities and 18 bound selector code units. For each row the audit independently recomputes the selector signature from its source-unit provenance and dependency hashes, verifies exact catalogue metadata, and binds every documented delivery marker/call-site line. Additional helper fragments pin option shuffling, chapters, historical attempt reduction, readiness-context inputs, diagnostic completion, study modes, hint stripping and the learner-facing lesson path. These helpers are evidence dependencies, not extra selector/content dispositions.

Actual source calls include signed-in Cipher, diagnostic, Exam Mode, PBQ catalogue/simulation, Deep Dive and flashcard pages. The same flashcard, glossary and daily mechanisms also have guest consumers; their source presence is included because it affects the selected mechanism, but no other guest selector is reclassified. A present call site and a successful pure replay are source reachability evidence, not proof a real learner opened a tooltip, received a particular private bank, completed a session or achieved learning improvement.

The I/O contract in each row is observed source behavior only. Runtime bank props, tier/unlocked IDs, saved/current IDs, query/domain, question metadata and attempt history can change the result. Source-order fallbacks are distinguished from empty results, filtered lists from global random pools, and explicit supplied content from fallback generation. No source string, objective tag, recommendation score, self-rating, answer reveal or exposure is treated as a canonical learning-model contract.

## Concrete probes and limits

| Probe | Evidence and boundary |
|---|---|
| MCQ option permutation |1185 fixtures: 395 local MCQs × 3 fixed random controls preserve the keyed option text and truthy indexed wrong-feedback alignment. No uniform-randomness or new feedback-quality claim.|
| Calendar daily routing |Seven weekday fixtures each select five current local MCQs; all IDs exist and repeat on the same weekday. A persistent-mount Wednesday→Thursday composition retains index/results while the date-keyed list changes in source. No actual clock rollover, reward or streak ran.|
| General diagnostic |Current native, empty-native fallback and one-domain pools each return one per chapter from native/fallback data. Current IDs are m101,m113,m056,m218,m032. RTO matches in m032's stem before answer; no bank question/feedback approval transfers.|
| Deep Dive recommendation |Six input cases cover no misses, unknown domain, domain fallback, option/explanation lexical influence and the actual local m032 input. Repeated runs are deterministic. Outputs are existing lesson IDs; match descriptions do not establish causal misconceptions.|
| Cipher context and supply |Four synthetic history cases and 12 precedence fixtures show empty context, latest correction versus historical accuracy, an orphan-ID chapter fallback, supplied Pro content, weak fallback and starter fallback. Downstream builders are stubbed for precedence only; no real learner history or generated deck is used.|
| Next deck |All 29 native source-order transitions, last-to-first wrap, null/unknown first-deck fallback and an injected empty catalogue. Destination content and held status remain separate.|
| Next PBQ |18 synthetic chapter/type/history cases; current-null returns null, empty runtime bank falls back locally, an unknown ID selects the first row, and a singleton returns itself under a different-PBQ UI label. The signed-in caller's Pro condition is bound.|
| Glossary |Five text fixtures cover case/boundary matching, formatted phrase splitting, a whole phrase, empty input and markup-like text. Actual pointer/keyboard/toggle/outside-click branches are source-bound; no interactive DOM or dictionary correctness audit is claimed.|
| Flashcard identity and completion |29 native/saved-ID collision fixtures and 29 source pass cases preserve native order/self-rating semantics. Shared-ID parsing keeps two copies of one valid ID while dropping an unknown ID; the distinct-ID pass cannot reach a two-card threshold. No real shared URL or saved account state was loaded.|
| Lesson gates and end deck |96 tier/lesson fixtures and 32 actual broad-objective deck selections. Only the existing free-preview unit opens without Pro. The resilience/recovery lesson selects a deck with no RTO/RPO/MTD/MTTR targets, despite the related-flashcards action.|
| Lesson→PBQ |16 synthetic tier/bank/unlock fixtures show same-chapter precedence, inaccessible-first blocking and cross-chapter preview fallback. The preview predicate is stubbed for branch testing; no real unlock/access request or canonical relatedness result.|
| PBQ catalogue |48 tier/chapter/type/historical-miss cases bind filtering and starred membership. Ever-correct and ever-missed can overlap. Empty/error upgrade UI is present independently of tier; no real load failure or payment state is observed.|
| Exam |15 actual local-bank size/composition fixtures exclude enrichment and place PBQs first, including full-PBQ composition. A thin synthetic bank requested at 10 returns 1. Extracted resume setters restore a zero saved timer to 720 configured seconds. No voucher, timer, storage, grading session or real exam handler runs.|

The native MCQ bank used here is 395 rows and the local PBQ fallback is 88 rows. Current local PBQ types are the seven source formats present in that bank; UI format totals and private variants are not assumed identical. Synthetic question IDs use audit-only names and are not invented native m/p records, accepted publication fixtures or trusted evidence. Public native IDs appear only as source references; raw stems, options, answer keys, learner identity/history and private payloads are excluded from exports.

## Why useful navigation is not mastery

The two qualified identities are narrowly mechanical. GlossaryText reveals the entry associated with a matched term. That can help instruction and can assist an assessment; the qualification does not approve either a held dictionary meaning or an unassisted-test interpretation. A cyclic next-deck link is a valid continuation path even when its destination keeps an unresolved content hold; it does not claim semantic remediation or novel evidence.

The other records combine useful behavior with a stronger whole-session or learner promise. Cipher and lesson recommendations use broad/lexical signals while speaking in concepts. Daily date selection lacks a mounted-session boundary. A diagnostic's assisted default RTO item is not an isolated measure of understanding. Exam selection/resume has underfill and elapsed-time limits. Saved/shared flashcards lack a consistent identity/unique-pass contract. Lesson end actions can pick unrelated or blocked fallbacks. PBQ next/catalogue states can contradict different/access-error expectations. Self-rated mastered and completion labels are not proof of retention. These judgments come from each selector's own code and visible claims, not automatic transfer of any content/destination hold.

Existing practice-score disclaimers are preserved: the exam explicitly distinguishes its percentage practice target from official scaled scoring. The held judgment does not allege that it claims a real CompTIA score, infer current production voucher behavior, or validate a readiness model. Cipher's preset-study disclosure is also preserved. Its pricing/payment/support FAQ copy is source-bound as part of the unit but not approved as an external service or policy assessment; no contact, payment, account or support action was taken.

## Prior evidence and exact accounting

All 127 prior substantive packets reconcile with the 1681 previous distinct qualified dispositions. Source bindings 384 and prior field bindings 732 preserve the preceding chain. All 150 prior distinct held records remain unresolved, including 15 held deck containers and the risk-parent promise hold. Eleven new selector identities are held at zero, without counting a destination/content hold again as a new hold on that same identity.

| Catalogue kind | Total | Prior | New qualified | Combined pending | Remaining |
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
|intervention_selector|26|0|2|2|24|
|keyword_guide|32|32|0|32|0|
|lesson|32|31|0|31|1|
|lesson_check|128|115|0|115|13|
|lesson_section|106|103|0|103|3|
|lesson_traps|32|32|0|32|0|
|mcq|395|395|0|395|0|
|pbq|90|68|0|68|22|
|public_learning_page|16|0|0|0|16|
|starter_question|9|0|0|0|9|

Broad catalogue: **1683/1878**, remaining **195**. Intervention selectors: **2/26** qualified mechanisms; 24 remain, comprising 11 selected held selectors and 13 unselected selectors. The remaining 195 catalogue IDs include 160 of 161 held identities; pbq:p036 retains its carried hold despite a previous disposition. There are 35 remaining unheld identities. These totals overlap and must not be added.

Support stays **748/834**, remaining **86**: prior 748 + new 0. No selector belongs to that support denominator. Card/deck/lesson/guide/trap counts remain 271/313, 14/29, 31/32, 32/32, 32/32. Glossary definition count remains 150/162; qualifying its reveal mechanism does not qualify another definition. All 21 tracked objective coverage totals and remaining IDs are unchanged; selected selectors have no objective memberships and no new denominator is created.

Bank questions/full-feedback/COMPLETE pairs remain **463/483**, **464/483**, **456/483**, leaving 20/19/27. Starter pairs stay 0/9; guest bounded records stay 6/14 with 0/2 pairs. The saved mixed-set omission, direct-guide/limited-reference distinctions, unsupported/private/combined-skill boundaries and every previous hold remain bound and unresolved.

For compatibility with the existing substantive-packet reconciler, the two typed selector rows live in its primary instructionalProposals array. They are explicitly tagged mechanism reviews, with newTeachingContentProposalCredit=0 and no support/bank/instructional-item credit. Mechanical primary-array rows move 773→775 and distinct identities 759→761, with 14 repeats. These are serialized disposition counts, not two new teaching items or a role reclassification. Both new catalogue dispositions have canonical roles/objectives/skills/links/family/trusted/mastery/human approval/publication/activation unset or false.

## Validation and release boundary

The focused audit executes extracted pure expressions/functions and isolated prefixes with synthetic callbacks only. It rejects **3848 altered packets** covering exact selector provenance/claims, observed contracts, I/O cases, state and precedence, disclosure/empty/fallback boundaries, erased holds, source pins, false support/content/teaching/mastery credit, canonical or human approval, raw/private/learner export and READY promotion. The runtime source scan rejects importing this packet. A recheck without --write must match packet/report bytes exactly.

Release gates: focused write/recheck determinism; all 29 existing content-mapping tests and deterministic package verification; 25 protected release fingerprints; all source bindings; git diff --check; [skip deploy] exit 0 and unmarked control exit 1; a task-only three-artifact commit/push; and matching HEAD/origin/main/remote-main/API refs plus exact GitHub blobs. Actual results are in the release transcript, not a production-delivery assertion. The eight unrelated dirty entries remain unstaged.

No runtime/learner-visible edits, live or private-bank queries, browser interaction, real storage/analytics/attempt/profile writes, coin/voucher/payment/unlock operations, activation/publication, deployment or Phase 3 work occurred. The source replays do not establish a real learner outcome. This finite 13-record review is complete as an offline judgment; Phase 2B-5 and production remain NOT READY.
