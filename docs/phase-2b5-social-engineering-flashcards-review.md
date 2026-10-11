# Phase 2B-5 — social-engineering flashcard proposals

**NOT READY.** 11 October 2026. Baseline **da981a94308befffeceffba49240b36210ee5cc8**. Packet SHA-256 **4858dd3d7960e4c2251805f770f4e0f827dabd93f68d8c904bd4f678cf315806**. One finite LOCAL/default-off/unwired/learner-invisible slice: this report, the new draft packet and its focused audit only.

## Authority and decision

The master plan and Phase 1 audit were read in full earlier in this continuing session. The master plan supplies approved product decisions; the audit supplies verified historical implementation facts. Current source files and all substantive prior packets were rechecked. No unresolved authority conflict requires a behavioral change in this draft slice.

**These are Codex proposals pending owner approval.** The continuing delegation covers question-content/family proposal work, not flashcard or canonical-taxonomy approval. It permits preparing this reviewable local proposal; it cannot approve card content, concept identities, roles, objective scope, teaching publication, calibration, weights, independence or activation. No approval is inferred, and no approval request interrupts the slice.

Review all **13** exact social-engineering card identities, sorted from BEC through Whaling. Qualify **11 distinct card-content/family/support-link proposals**; defer **Phishing and Tailgating** with explicit zero credit. There are **zero new question judgments, feedback judgments or deck judgments**. A qualified draft card proposal is not an approved understanding or mastery outcome.

| Card | Decision | Authored entry | Narrow review and limitations |
| --- | --- | --- | --- |
| BEC | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:264 | The offered business-payment impersonation example supports BEC vocabulary. The term expansion alone does not teach how to evaluate a request. |
| Dumpster Diving | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:269 | The supplied discarded-paper example distinguishes information collection from a live screen observation or electronic message lure. |
| Impersonation | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:266 | The claimed vendor role supports broad impersonation vocabulary. The merged person/brand title is retained as observed, not split into canonical skills. |
| Phishing | Deferred; zero credit | src/data/sy0701AcronymFlashcards.js:259 | The mass-message example is consistent with bulk phishing, but broad in the definition can be read as excluding targeted variants. |
| Pretexting | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:267 | An invented audit rationale is the distinguishing teaching cue; recognise the story dimension rather than an acronym expansion. |
| Shoulder Surfing | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:270 | The stated nearby PIN observation supports the difference between watching information in use and searching discarded material. |
| Smishing | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:263 | The SMS delivery premise distinguishes this vocabulary cue from a voice call; the example suggests a fraudulent request rather than a proven destination result. |
| Spear Phishing | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:260 | Recipient-role tailoring supports targeted phishing vocabulary; a named individual is not required for every targeted group or organisation. |
| Tailgating | Deferred; zero credit | src/data/sy0701AcronymFlashcards.js:271 | The attacker example suggests unauthorised following entry, but the definition only requires following without credentials and can include legitimate escorted entry. |
| Typosquatting | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:268 | Accept only the explicitly stated mistyping route as a narrow vocabulary proposal; the visually substituted character alone does not establish the mechanism. |
| Vishing | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:262 | The telephone support-call example teaches the voice channel cue; the full term label is not proof of mechanism understanding. |
| Watering Hole | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:265 | The supplied routinely visited forum compromise is the teaching cue rather than a direct message campaign or a mistyped domain. |
| Whaling | Codex proposal; owner pending | src/data/sy0701AcronymFlashcards.js:261 | The stated CEO victim supports executive-targeted phishing vocabulary; focus on the recipient rather than the impersonated sender. |

Phishing's current definition uses broad alongside a mass-message example. **Our review inference** is that this risks teaching a bulk-only distinction: prior m046/m123 already hold that inference, and targeted phishing remains within phishing. NIST defines deceptive information solicitation without a bulk-recipient requirement; the MS-ISAC primer explicitly treats spear phishing as targeted phishing. These references support the distinction, not approval of this card. [NIST phishing glossary](https://csrc.nist.gov/glossary/term/phishing), [MS-ISAC spear-phishing primer](https://www.cisecurity.org/-/media/project/cisecurity/cisecurity/data/media/files/uploads/2017/03/Security-Primer-Spear-Phishing.pdf).

Tailgating's example supplies an attacker, but its current definition only describes following a credentialed person without personal credential use. **Our review inference** is that the missing unauthorised-entry condition also admits legitimate escorted entry. Hold the definition and the slash-title consent distinction; no universal tailgating/piggybacking awareness rule, precise numbered objective or independent physical-access skill is approved. Preserve m432's combined-entry/lure qualifications and m036/m602's controlled-vestibule limitations. No card is rewritten.

## Meaning, confusion and teaching-link proposals

**BEC — business_email_deception_support.** The offered business-payment impersonation example supports BEC vocabulary. The term expansion alone does not teach how to evaluate a request.

- A forged executive sender does not make the victim an executive; do not infer whaling from the sender title.
- Spoofed email can support this scenario without establishing mailbox takeover, malware, a completed payment or stolen data.
- BEC can overlap spear phishing, impersonation and pretext; these are not mutually exclusive skills.

Existing supporting-node candidate: **sy0701.term.bec**, proposed only as a zero-weight instructional reference pending owner approval. Compare prior question judgments **m124, m658, m646**; exact source, packet and immutable disposition hashes are retained.

**Dumpster Diving — discarded_material_information_collection_support.** The supplied discarded-paper example distinguishes information collection from a live screen observation or electronic message lure.

- Discarded sensitive material is the defining cue; ordinary lawful waste handling is not evidence of an attack.
- The fictional discovery is not a measured intrusion, credential exploit, collection result or demonstrated secure disposal skill.

Existing supporting-node candidate: **sy0701.term.dumpster-diving**, proposed only as a zero-weight instructional reference pending owner approval. No separately reviewed matching assessment is asserted for this card.

**Impersonation — claimed_trusted_identity_support.** The claimed vendor role supports broad impersonation vocabulary. The merged person/brand title is retained as observed, not split into canonical skills.

- Clothing and a clipboard are identity cues, not proof of vendor legitimacy or authorised server-room access.
- This physical-person example does not independently teach brand-domain deception or BEC.
- A fabricated story may accompany impersonation; claiming an identity and constructing a pretext are overlapping dimensions.

Existing supporting-node candidate: **sy0701.term.impersonation**, proposed only as a zero-weight instructional reference pending owner approval. Compare prior question judgments **m009, m124**; exact source, packet and immutable disposition hashes are retained.

**Pretexting — fabricated_story_support.** An invented audit rationale is the distinguishing teaching cue; recognise the story dimension rather than an acronym expansion.

- A pretext can be delivered by phone, text, email or other interaction; it does not require one specific channel.
- A claimed trusted role may accompany the story, so pretexting and impersonation are not exclusive.
- No login, caller identity verification or successful recovery is measured.

Existing supporting-node candidate: **sy0701.term.pretexting**, proposed only as a zero-weight instructional reference pending owner approval. Compare prior question judgments **m009, m047**; exact source, packet and immutable disposition hashes are retained.

**Shoulder Surfing — direct_sensitive_information_observation_support.** The stated nearby PIN observation supports the difference between watching information in use and searching discarded material.

- The key cue is observation of sensitive content, not proximity alone.
- This fictional PIN example establishes no real captured credential, authorised access or practised physical defence.

Existing supporting-node candidate: **sy0701.term.shoulder-surfing**, proposed only as a zero-weight instructional reference pending owner approval. No separately reviewed matching assessment is asserted for this card.

**Smishing — SMS_deception_channel_support.** The SMS delivery premise distinguishes this vocabulary cue from a voice call; the example suggests a fraudulent request rather than a proven destination result.

- Hold a URL or visual brand cue as proof of domain takeover, Unicode homograph, mistyping mechanism or malware.
- Targeting and pretext can overlap the SMS channel; do not treat all text chat platforms as separately reviewed here.
- The request does not prove payment data was supplied or recovered.

Existing supporting-node candidate: **sy0701.term.smishing**, proposed only as a zero-weight instructional reference pending owner approval. Compare prior question judgments **m253, m659**; exact source, packet and immutable disposition hashes are retained.

**Spear Phishing — deliberately_targeted_phishing_support.** Recipient-role tailoring supports targeted phishing vocabulary; a named individual is not required for every targeted group or organisation.

- This remains phishing and can target selected groups as well as a specific person.
- A finance role or spoofed authority does not by itself make the victim an executive or prove BEC payment success.
- The recognisable example is not verified detection, message authentication or independent transfer.

Existing supporting-node candidate: **sy0701.term.spear-phishing**, proposed only as a zero-weight instructional reference pending owner approval. Compare prior question judgments **m658, m124, m046**; exact source, packet and immutable disposition hashes are retained.

**Typosquatting — mistyped_domain_collection_support.** Accept only the explicitly stated mistyping route as a narrow vocabulary proposal; the visually substituted character alone does not establish the mechanism.

- Lookalike spelling can also support brand impersonation; a visual similarity is not proof of a typing mistake or a Unicode/IDN homograph.
- The stored example is a stipulated collection story, not verified registration, captured credentials, resolver poisoning or a real contacted website.
- Preserve earlier lookalike/mistyping feedback holds; this card does not repair those sources.

Existing supporting-node candidate: **sy0701.term.typosquatting**, proposed only as a zero-weight instructional reference pending owner approval. Compare prior question judgments **m015, m253**; exact source, packet and immutable disposition hashes are retained.

**Vishing — voice_deception_channel_support.** The telephone support-call example teaches the voice channel cue; the full term label is not proof of mechanism understanding.

- A phone channel can coexist with an invented support story, impersonation and targeted recipients.
- The request establishes no true helpdesk identity, disclosed password, account takeover or validated caller verification.

Existing supporting-node candidate: **sy0701.term.vishing**, proposed only as a zero-weight instructional reference pending owner approval. Compare prior question judgments **m009, m609**; exact source, packet and immutable disposition hashes are retained.

**Watering Hole — compromised_frequented_site_support.** The supplied routinely visited forum compromise is the teaching cue rather than a direct message campaign or a mistyped domain.

- Audience or industry context does not prove executive targeting, an APT actor or a particular successful exploit.
- Drive-by delivery may overlap; no browser, exploit, website or guarantee that every visitor is infected is verified.

Existing supporting-node candidate: **sy0701.term.watering-hole**, proposed only as a zero-weight instructional reference pending owner approval. Compare prior question judgments **m251**; exact source, packet and immutable disposition hashes are retained.

**Whaling — executive_victim_targeting_support.** The stated CEO victim supports executive-targeted phishing vocabulary; focus on the recipient rather than the impersonated sender.

- Whaling is targeted phishing; senior-victim targeting can coexist with channel, pretext and business fraud.
- A fake legal story need not involve payment, malware or a compromised executive mailbox.
- A CEO sender impersonation to a non-executive victim alone is not whaling; no legal event or login is actually validated.

Existing supporting-node candidate: **sy0701.term.whaling**, proposed only as a zero-weight instructional reference pending owner approval. Compare prior question judgments **m646, m124, m658**; exact source, packet and immutable disposition hashes are retained.

BEC need not imply takeover of a real business mailbox: the FBI describes spoofing and other deception routes. Its sender/victim distinction must remain separate from executive-targeted whaling. This is a vocabulary comparison, not a live fraud finding or a verified payment control. [FBI BEC explanation](https://www.fbi.gov/news/stories/business-e-mail-compromise-on-the-rise).

The MS-ISAC primer supports voice/SMS channel contrasts and whaling's senior-victim target. MITRE describes community-frequented site compromise as a watering-hole campaign; neither a site label nor visiting it demonstrates successful exploitation. [MS-ISAC primer](https://www.cisecurity.org/-/media/project/cisecurity/cisecurity/data/media/files/uploads/2017/03/Security-Primer-Spear-Phishing.pdf), [MITRE Drive-by Compromise](https://attack.mitre.org/techniques/T1189/).

These comparisons retain the prior channel, targeting, lookalike-domain, combined-answer, actor-attribution and feedback qualifications. Family labels are proposed content groupings with **zero new family credit**. No prior question family is split or merged, and none of these cards supplies an independently assessed post-miss variant. Existing lesson-link selector output below remains an observation; it is not semantic approval of those lessons or a new teaching-link disposition.

## Exact prior/new/combined/remaining counts

Reconcile **73 prior substantive packets**. The frozen triage is inventory only. Its current overlay has412 tracked question judgments;42 older distinct question judgments (30 MCQs,12 PBQs) bring all-bank coverage to454. Preserve **22 duplicate references** and **seven support/link-only references**, without converting those links to full current feedback or instructional review.

Independently inventory **228 instructional row occurrences**, **220 distinct identities**, **eight duplicate occurrences**. These include **53 card references**, but only **49** currently have substantive full card dispositions; four pilot-linked cards and two keyword guides remain limited support references with no newly inferred full-content review. Five explanation identities in the instructional arrays overlap feedback and do not enlarge the support-unit denominator. All13 current candidates are absent from every prior substantive proposal array.

| Coverage | Prior pending | New | Combined pending / total | Remaining |
| --- | ---: | ---: | ---: | ---: |
| All catalogue dispositions, overlapping content kinds |1110|11 card proposals|1121/1878|757|
| Authored support units in the eight kinds below |209|11 card proposals|220/834|614|
| Flashcard full content dispositions/proposals |49|11|60/313|253|
| Local-bank question judgments |454|0|454/483|29|
| Local-bank full feedback / complete pairs |447|0|447/483|36|
| Local PBQ question judgments |59|0|59/88|29|
| Local PBQ full feedback / complete pairs |52|0|52/88|36|
| Older question-only full-feedback gaps |7|0 closed|7 gaps|7|

The834 support-unit denominator comprises flashcards, decks, glossary definitions, keyword guides, lessons, lesson checks, lesson sections and lesson traps. It counts distinct catalogue identities; lessons/checks/sections and decks/cards overlap instructional meaning and cannot be summed as independent skills. The1878 census additionally includes private metadata, separate starter and guest assessments, selector definitions, public pages and other teaching. Neither denominator is approved learner coverage. The483 bank denominator excludes two private alternatives, nine starters and two guest demos.

| Catalogue kind | Total | Prior | New | Combined pending | Remaining |
| --- | ---: | ---: | ---: | ---: | ---: |
| deck_container | 29 | 4 | 0 | 4 | 25 |
| explanation_bundle | 494 | 447 | 0 | 447 | 47 |
| flashcard | 313 | 49 | 11 | 60 | 253 |
| glossary_definition | 162 | 73 | 0 | 73 | 89 |
| guest_demo_explanation | 2 | 0 | 0 | 0 | 2 |
| guest_demo_feedback | 2 | 0 | 0 | 0 | 2 |
| guest_demo_flashcard | 1 | 0 | 0 | 0 | 1 |
| guest_demo_hint | 1 | 0 | 0 | 0 | 1 |
| guest_demo_lesson_prompt | 3 | 0 | 0 | 0 | 3 |
| guest_demo_mcq | 1 | 0 | 0 | 0 | 1 |
| guest_demo_pbq | 1 | 0 | 0 | 0 | 1 |
| guest_demo_review_path | 3 | 0 | 0 | 0 | 3 |
| intervention_selector | 26 | 0 | 0 | 0 | 26 |
| keyword_guide | 32 | 8 | 0 | 8 | 24 |
| lesson | 32 | 8 | 0 | 8 | 24 |
| lesson_check | 128 | 32 | 0 | 32 | 96 |
| lesson_section | 106 | 27 | 0 | 27 | 79 |
| lesson_traps | 32 | 8 | 0 | 8 | 24 |
| mcq | 395 | 395 | 0 | 395 | 0 |
| pbq | 90 | 59 | 0 | 59 | 31 |
| public_learning_page | 16 | 0 | 0 | 0 | 16 |
| starter_question | 9 | 0 | 0 | 0 | 9 |

The remaining29 bank questions are23 unsupported-grammar rows and six supported deferrals: **LOCAL p003,p009,p032,p047,p068,p074**. The36 feedback gaps are those29 plus seven older question-only gaps: **p004,p211,p011,p029,p046,p041,p043**. Existing395/395 MCQ judgments and full feedback remain pending approval. Exact remaining identities, revisions and statuses are preserved from the residual-PBQ packet; a card proposal cannot close any of these holes.

| Inherited objective catalogue | Broad records | Prior pending | New card proposals | Combined pending | Remaining local / private | Remaining cards |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| 2.2 | 134 | 63 | 11 | 74 | 60 / 0 | 19 |
| 2.4 | 199 | 97 | 11 | 108 | 91 / 0 | 42 |
| 5.3 | 98 | 35 | 11 | 46 | 52 / 0 | 37 |

**2.2:**63/134 prior;11 new proposals;74/134 combined;60 remain, including19 cards. **2.4:**97/199 prior;108/199 combined;91 remain, including42 cards. **5.3:**35/98 prior;46/98 combined;52 remain, including37 cards. The packet includes all census identities, revisions, kinds, statuses and remaining IDs, plus prior/new/remaining kind counts for each objective.

These three inherited catalogues contain **431 summed memberships,356 distinct identities,58 shared identities**. All13 candidates inherit all three tags, giving39 candidate memberships; the11 qualified proposals give33 new memberships but **only11 global proposals**. Both deferrals remain in all three denominators. Shared tags are observations rather than precise approved scope. Every proposed objectiveScopeProposal stays null, including context tags; no card inherits separate 2.4 or5.3 mastery credit.

## Actual source precedence and front/back delivery

App imports the authored deck and flattened card catalogue directly at src/App.jsx:94. The package imports the same data at scripts/lib/content-mapping/package.mjs:16 and creates card/deck records at lines104–105. Flattening at src/data/sy0701AcronymFlashcards.js:720 adds set/chapter/objective metadata; the delivered deck card retains its original face fields. All13 flattened source signatures exactly match the active package, with separately bound delivered-card and parent-deck revisions. No MCQ/PBQ editorial override is applied to these direct card imports. This is current local source evidence, not a database-wide or deployed-browser observation.

Each authored entry binds its exact line/hash. Four source-face fields per card are hashed separately without exporting the authored faces. The audit executes the actual extracted pure face expressions at **src/App.jsx:30923**, safe-mode expressions at **src/App.jsx:30820**, and real-acronym predicate at **src/App.jsx:458**. It checks **39 mode/card combinations**, with front, answer title/body and full-face fingerprints:

- Definition mode:13 definition-to-term faces.
- Example mode:13 supplied example-to-attack-name faces, all with the existing definition on the back. No example is invented.
- Acronym mode:six actual term/expansion faces (BEC,Impersonation,Smishing,Tailgating,Vishing,Watering Hole); seven equal-name/expansion cards fall back to definition-to-term faces. The slash titles and expanded Watering Hole name satisfy the existing inequality predicate but are not thereby real abbreviations or independent skills.

No word expansion, source reading, flip, example reveal, self-rating or pass completion is treated as understanding/mastery. The actual code reuses activeCard.id across modes and ratings. Shuffle/reuse does not add authored content or independent evidence. This slice does not change that behavior or claim an actual learner response.

Navigation, mode chooser and study-pass sources are bound at **src/App.jsx:31898**, **src/App.jsx:30837**, **src/App.jsx:30903**. Ordinary deck entry has no account/Pro gate in the inspected openSet handler; lesson opening retains account-then-Pro gates. The card-face expressions use plain face fields without inline GlossaryText. Seven selector revisions remain identical to the active package. Actual React callbacks, sync, storage, rewards, analytics and learner handlers are never invoked. Random/saved/starred/weak-topic definitions are source-bound observations, not newly exercised learner-state flows.

The source-only related-lesson selector at **src/App.jsx:734** produces:

- lesson:threat-actors-surfaces — sha256:da7bf6d1fe6ce25e9bafb89247e70582bfeb249cfa399351006ea58cdeeda771; selector observation only, weight0, no approved remediation.
- lesson:web-social-dns-attacks — sha256:a4de336332e79c8530cae86101c4fd2db1af46bdf4ce04617a76c9a8a75da799; selector observation only, weight0, no approved remediation.
- lesson:malware-indicators-attacks — sha256:a33d9db766472673585845fde91fe284bd2980a40c1e4474a6b96b169a7edc23; selector observation only, weight0, no approved remediation.

The deck remains a bound container observation with13 children and **zero new review credit**. This avoids silently adding a fourteenth proposal or approving shared deck scope. No new lesson/selector disposition or canonical identifier is created.

## Preserved boundaries and validation

The last residual-PBQ packet is SHA-256 **8139aef76416216e4572a3ef5e123241e06c67358fbc7c4ef88b337f39afcd54**. Its source bindings and immutable prior-hold objects are carried forward: earliest ambiguities, KEV teaching limits, RTO/RPO/MTTR roles, private-source boundaries, pilot feedback links, p014's single keyed decision, p048/p211 recovery roles, hidden-evidence holds, seven older full-feedback gaps and recent grading/delivery qualifications. All **13 recent semantic deferrals** remain zero credit. No pilot role/weight/teaching publication or existing approval transfers to these cards.

Private p003/p017 question and feedback identities retain their source fingerprints and null trusted IDs; no payload is fetched, compared, exported or replaced by a local fallback. Existing unavailable/private scopes and unsupported PBQ delivery holes remain unresolved. No grammar, learner UI, question, card, lesson, database, flag, scheduler or runtime module changes.

The active package remains **1878 records,435 concept identities,2954 queued decisions,489 unresolved question mappings,seven existing primary question proposals**. Frozen ledger SHA-256 **e0ceeec3c5cc8adb94b36175954a8cefaebcb4f29f4c66aa38c400f65de3bb12** and active package SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97** remain exact. All **25 protected release files** match their saved checksums. New trusted IDs are null, links/weights stay zero, and human/publication/activation/independence approvals stay false.

The focused audit rejects **582 mutations**, covering stale card/face/deck/line revisions, wrong parent/deck, invented content or identities, duplicated records, shared-objective transfer, link-only credit promotion, lost deferrals/holds, raw-face/answer/private export and false activation. Every export is compared with the source-rebuilt expected packet. Run node scripts/audit-social-engineering-flashcards.mjs, npm run audit:content-mapping (29 mapping tests plus deterministic package reproduction), and git diff --check before the task-only [skip deploy] commit/push. Confirm the configured Vercel skip hook, exact HEAD=origin/main=remote and all three file SHA-256 values after push.

**Phase 2B-5 remains NOT READY.** No fresh browser, learner-runtime, private database or production validation is claimed. Owner approval, canonical mappings/calibration, independent assessment families, remaining content/feedback and deployment decisions remain separate work.
