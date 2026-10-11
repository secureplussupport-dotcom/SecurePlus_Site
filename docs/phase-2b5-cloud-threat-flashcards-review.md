# Phase 2B-5 — cloud/mobile/hardware and threat-protection flashcard proposals

**NOT READY.** 11 October 2026. Baseline **c26de5aa09d555b5dccabd64f53a490ab11af4d6**. Packet SHA-256 **eeb50ee864f56653d605c143d569dcfb3316ac47c2212fc2999b667bc5774d24**. One finite LOCAL/default-off/unwired/learner-invisible slice: this report, its draft packet and focused audit only.

## Authority and exact decisions

The master plan and Phase 1 audit were read in full earlier in this continuing session. Approved product decisions follow the master plan; historical implementation facts follow the audit, with current source verification below. No unresolved authority conflict requires changing behavior in this draft slice.

Review exactly the **17 inventory_only_unreviewed objective2.2 cards** selected from the preceding social-card packet: six cloud/mobile/hardware cards and eleven threat-intelligence/protection cards. Qualify **14 distinct card-content/family/support-link proposals** and defer **Side-Loading, DKIM and TAXII** with explicit zero credit. No card is rewritten. Earlier **Phishing and Tailgating holds remain zero credit**. No new question, feedback, deck, lesson or selector judgment is claimed.

**Every qualified row is a Codex draft pending owner approval.** Continuing question delegation cannot approve flashcards, canonical identities, roles, objective scopes, teaching publication, calibration, weights, family independence or activation. It permits preparing a reviewable packet; no approval is inferred or requested this turn. Existing supporting-node references remain zero-weight candidates, with primaryConceptProposal and objectiveScopeProposal null.

| Card | Decision | Authored entry | Narrow qualification / hold |
| --- | --- | --- | --- |
| Firmware Attack | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:300 | The supplied device-code persistence example supports firmware-target vocabulary, without making persistence a universal outcome. |
| Jailbreaking / Rooting | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:299 | Qualify the shared restriction-bypass risk only; the one iOS illustration does not separately teach Android rooting or every mobile privilege boundary. |
| Physical Attack | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:302 | The deliberate power disruption supports a broad physical/environmental attack comparison, not a universal recovery outcome. |
| Side-Loading | Deferred; zero credit | src/data/sy0701AcronymFlashcards.js:298 | The definition makes untrusted sourcing part of side-loading itself. Off-store installation may also use a legitimate developer or enterprise source; the malicious example does not repair that universal trust inference. |
| Supply Chain Attack | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:301 | The breached-service-provider example supports indirect trusted-path compromise, while retaining distinctions from the earlier update-channel questions. |
| VM Escape | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:297 | The explicit guest-to-host example supports escape vocabulary; authorised guest networking or sharing alone is not an escape. |
| AV | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:314 | Qualify antivirus as a tool category with malware detection/blocking/removal capabilities, rather than a guarantee that all three succeed. |
| DKIM | Deferred; zero credit | src/data/sy0701AcronymFlashcards.js:317 | The authorization wording leaves the signing domain and purported author insufficiently separated. A valid signature establishes a domain responsibility claim under its key, not approval by the visible sender or a trustworthy human. |
| DLP | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:315 | The qualified prevention wording supports data-movement policy vocabulary; scope and approved locations remain contextual. |
| DMARC | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:316 | Qualify only the overview of SPF/DKIM-based mail policy. The current short definition does not teach the aligned-pass decision or receiver discretion. |
| FIM | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:318 | Qualify integrity monitoring as detecting changes for review, not automatically deciding that every change is unauthorized or malicious. |
| SCAP | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:319 | Qualify standards-enabled configuration/vulnerability automation; SCAP is a suite of interoperable specifications, not a scanner or a universal security test. |
| STIX | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:320 | The format description supports threat-intelligence representation vocabulary, with language/object relationships beyond a flat indicator list. |
| SWG | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:321 | Qualify web-traffic filtering as a gateway capability dependent on visibility and policy, not a guarantee of safe browsing. |
| TAXII | Deferred; zero credit | src/data/sy0701AcronymFlashcards.js:322 | The expansion retains Indicator Information, while TAXII2.1 names Intelligence Information. With no version or historical qualification, acronym recall would reinforce an ambiguous version boundary. |
| WAF | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:323 | The qualified help-block wording supports application-traffic filtering vocabulary, without claiming a complete SQL-injection/XSS fix. |
| WIDS / WIPS | Draft; owner pending | src/data/sy0701AcronymFlashcards.js:324 | Qualify the combined label as wireless detection/prevention capabilities only; distinguish observation from attempted prevention rather than scoring two skills. |

All17 exact IDs, catalogue revisions, authored/delivered-card revisions, parent deck revisions, source-line/file fingerprints and rendered-face fingerprints are in the packet. Face values and answer-bearing source payloads are not exported. The finite draft cannot repair runtime content, approve an objective tag, or demonstrate a learner understood a term.

## Meaning, contrasts, family and support links

**Firmware Attack — low_level_firmware_compromise_support.** The supplied device-code persistence example supports firmware-target vocabulary, without making persistence a universal outcome.

- Firmware is distinct from ordinary application or disk-resident malware; disk formatting is not a universal firmware remediation.
- No boot-chain verification, firmware exploit, signing-key compromise or actual recovery is assessed.

Existing supporting-node candidate **sy0701.term.firmware-attack** is proposed only as an owner-pending, zero-weight instructional reference. Compare prior question judgments **m250** using their exact source, packet, immutable disposition and qualification hashes; no approval transfers.

**Jailbreaking / Rooting — mobile_security_restriction_bypass_support.** Qualify the shared restriction-bypass risk only; the one iOS illustration does not separately teach Android rooting or every mobile privilege boundary.

- Jailbreaking and rooting are platform-dependent changes, not identical operations or proof of malicious intent.
- Do not infer that every restriction disappears, every rooted app escapes isolation, or every off-store install requires elevated privileges.
- The example is a stipulated bypass, not an executed exploit or separately approved platform skill.

Existing supporting-node candidate **sy0701.term.jailbreaking-rooting** is proposed only as an owner-pending, zero-weight instructional reference. No separately reviewed matching question is asserted.

**Physical Attack — intentional_physical_environment_disruption_support.** The deliberate power disruption supports a broad physical/environmental attack comparison, not a universal recovery outcome.

- A natural failure can be environmental without being an attack; the supplied intentional action is the distinguishing premise.
- Tampering and environmental disruption overlap here; neither subcategory receives independent assessment or mastery credit.

Existing supporting-node candidate **sy0701.term.physical-attack** is proposed only as an owner-pending, zero-weight instructional reference. No separately reviewed matching question is asserted.

**Side-Loading — off_store_installation_trust_definition_held.** The definition makes untrusted sourcing part of side-loading itself. Off-store installation may also use a legitimate developer or enterprise source; the malicious example does not repair that universal trust inference.

- Hold until the installation route is separated from source trust and malware risk.
- Side-loading does not itself require rooting/jailbreaking and does not establish malware, compromise or universal absence of verification.

No support-link or full-card proposal credit is promoted for this held row. No separately reviewed matching question is asserted.

**Supply Chain Attack — trusted_third_party_path_compromise_support.** The breached-service-provider example supports indirect trusted-path compromise, while retaining distinctions from the earlier update-channel questions.

- Service-provider credential abuse and compromised software updates are related paths, not identical mechanics or independent evidence.
- Do not infer a malicious supplier, zero-day, APT attribution, actual victim access or validated vendor controls.

Existing supporting-node candidate **sy0701.term.supply-chain-attack** is proposed only as an owner-pending, zero-weight instructional reference. Compare prior question judgments **m127, m250** using their exact source, packet, immutable disposition and qualification hashes; no approval transfers.

**VM Escape — guest_isolation_boundary_escape_support.** The explicit guest-to-host example supports escape vocabulary; authorised guest networking or sharing alone is not an escape.

- Access to the host or another guest concerns breached isolation, not merely communication between machines.
- No real hypervisor exploit, access to all guests, physical separation or demonstrated mitigation is established.

Existing supporting-node candidate **sy0701.term.vm-escape** is proposed only as an owner-pending, zero-weight instructional reference. Compare prior question judgments **m062** using their exact source, packet, immutable disposition and qualification hashes; no approval transfers.

**AV — anti_malware_tool_role_support.** Qualify antivirus as a tool category with malware detection/blocking/removal capabilities, rather than a guarantee that all three succeed.

- The name is not limited to classic viruses, and products differ in coverage and enabled capabilities.
- No real scan, clean system, malware attribution, prevention result or recovery is verified.

Existing supporting-node candidate **sy0701.term.av** is proposed only as an owner-pending, zero-weight instructional reference. No separately reviewed matching question is asserted.

**DKIM — signing_domain_responsibility_definition_held.** The authorization wording leaves the signing domain and purported author insufficiently separated. A valid signature establishes a domain responsibility claim under its key, not approval by the visible sender or a trustworthy human.

- Hold until signer identity and author-domain alignment are explicit and legitimate content is not implied.
- Preserve DMARC alignment/either-pass and p067 combined-protocol holds; no cryptographic verification or sender authentication occurs.

No support-link or full-card proposal credit is promoted for this held row. Compare prior question judgments **m144, m616, m278, m288** using their exact source, packet, immutable disposition and qualification hashes; no approval transfers.

**DLP — sensitive_data_movement_control_support.** The qualified prevention wording supports data-movement policy vocabulary; scope and approved locations remain contextual.

- Policy can apply to several channels and data states; a location label does not prove sensitivity, authorisation or a leak.
- Detection or blocking depends on visibility and configuration; no prevention guarantee, encryption equivalence or actual exfiltration result is claimed.

Existing supporting-node candidate **sy0701.term.dlp** is proposed only as an owner-pending, zero-weight instructional reference. No separately reviewed matching question is asserted.

**DMARC — aligned_mail_authentication_policy_support.** Qualify only the overview of SPF/DKIM-based mail policy. The current short definition does not teach the aligned-pass decision or receiver discretion.

- DMARC pass requires an aligned SPF or DKIM pass; both mechanisms need not pass, and failing only one need not mean DMARC failure.
- Domain validation does not approve a human sender, safe content or a business-payment request; receiver disposition is local policy.
- Reports, DNS rollout and configuration are unassessed; current RFC9989 replaces RFC7489, and the card specifies no version.

Existing supporting-node candidate **sy0701.term.dmarc** is proposed only as an owner-pending, zero-weight instructional reference. Compare prior question judgments **m144, m616, m278, m288** using their exact source, packet, immutable disposition and qualification hashes; no approval transfers.

**FIM — file_change_observation_support.** Qualify integrity monitoring as detecting changes for review, not automatically deciding that every change is unauthorized or malicious.

- Approved updates can change important files; a baseline difference requires context and investigation.
- No immutable baseline, blocking, rollback, complete visibility or validated compromise is established.

Existing supporting-node candidate **sy0701.term.fim** is proposed only as an owner-pending, zero-weight instructional reference. No separately reviewed matching question is asserted.

**SCAP — security_automation_specification_suite_support.** Qualify standards-enabled configuration/vulnerability automation; SCAP is a suite of interoperable specifications, not a scanner or a universal security test.

- Machine-readable content and processing support automation; a protocol name does not demonstrate a scan or compliance.
- No version, product conformance, complete vulnerability coverage or independently understood component standard is approved.

Existing supporting-node candidate **sy0701.term.scap** is proposed only as an owner-pending, zero-weight instructional reference. Compare prior question judgments **m722, m423** using their exact source, packet, immutable disposition and qualification hashes; no approval transfers.

**STIX — structured_threat_intelligence_representation_support.** The format description supports threat-intelligence representation vocabulary, with language/object relationships beyond a flat indicator list.

- STIX representation and TAXII exchange are distinct standards; STIX does not require one transport or prove feed interoperability.
- Serialization/version must be specified in an actual implementation; machine readability does not prove freshness, truth, confidence or safe automated blocking.
- Retain the prior combined STIX/TAXII family holds; this card creates no separately assessed standard or component skill.

Existing supporting-node candidate **sy0701.term.stix** is proposed only as an owner-pending, zero-weight instructional reference. Compare prior question judgments **m185, m722, m423** using their exact source, packet, immutable disposition and qualification hashes; no approval transfers.

**SWG — web_gateway_policy_filtering_support.** Qualify web-traffic filtering as a gateway capability dependent on visibility and policy, not a guarantee of safe browsing.

- An SWG protects browsing paths; a WAF protects application traffic, with possible product overlap rather than universal exclusivity.
- Encrypted-traffic visibility, bypass, content categories and deployment are unassessed; do not equate the label with a VPN or endpoint antivirus.

Existing supporting-node candidate **sy0701.term.swg** is proposed only as an owner-pending, zero-weight instructional reference. No separately reviewed matching question is asserted.

**TAXII — version_ambiguous_threat_exchange_expansion_held.** The expansion retains Indicator Information, while TAXII2.1 names Intelligence Information. With no version or historical qualification, acronym recall would reinforce an ambiguous version boundary.

- Hold the expansion and exclusive-STIX reading; TAXII2.1 exchanges CTI over HTTPS and can transport other supported formats.
- Version, content negotiation, authentication, source trust and useful indicators are separate; no feed, parser or exchange is verified.

No support-link or full-card proposal credit is promoted for this held row. Compare prior question judgments **m185, m722, m423** using their exact source, packet, immutable disposition and qualification hashes; no approval transfers.

**WAF — web_application_traffic_filter_support.** The qualified help-block wording supports application-traffic filtering vocabulary, without claiming a complete SQL-injection/XSS fix.

- Rules, placement and visibility affect coverage; a WAF does not replace secure coding, input handling or remediation.
- The protective application role differs from outbound browsing gateways, but deployment/product capabilities may overlap; no request, exploit or rule is tested.

Existing supporting-node candidate **sy0701.term.waf** is proposed only as an owner-pending, zero-weight instructional reference. No separately reviewed matching question is asserted.

**WIDS / WIPS — wireless_monitoring_prevention_role_support.** Qualify the combined label as wireless detection/prevention capabilities only; distinguish observation from attempted prevention rather than scoring two skills.

- An alert does not guarantee blocking, an unknown AP is not automatically unauthorized, and authorised prevention requires context.
- Capabilities vary by sensor coverage, channel and configuration; do not universally exclude assisting response from detection or assume every wireless threat is observed.
- No RF monitoring, containment, rogue-device finding or separately assessed WIDS/WIPS implementation is approved.

Existing supporting-node candidate **sy0701.term.wids-wips** is proposed only as an owner-pending, zero-weight instructional reference. No separately reviewed matching question is asserted.

**Review inference:** the Side-Loading definition overstates source distrust as intrinsic to the installation route. Android documents legitimate developer website/private/enterprise distribution; that does not prove any particular download safe. The current malicious illustration cannot turn every off-store installation into an attack. [Android alternative distribution](https://developer.android.com/distribute/marketing-tools/alternative-distribution).

**Review inference:** DKIM's current authorization shorthand leaves the signer/author distinction ambiguous. DKIM binds a signing-domain responsibility claim and deliberately separates the signer from the purported author; its current card has no scenario resolving that boundary. Keep zero credit until reviewed wording addresses it. [RFC6376 abstract and section2.1](https://www.rfc-editor.org/rfc/rfc6376).

DMARC remains a qualified overview only. An aligned SPF or DKIM pass can satisfy authentication; neither a domain pass nor requested handling proves a safe message, a human sender or payment authorization. Receiver policy still decides handling. The current standard is RFC9989, which obsoletes RFC7489; no card version/configuration is approved here. Preserve m144/m616/m278/m288 and **p067's zero-credit combined-protocol preflight** through exact source/disposition hashes. [RFC9989 sections4.1,4.4 and5.4](https://datatracker.ietf.org/doc/html/rfc9989).

STIX describes structured CTI; representation is distinct from TAXII exchange. TAXII2.1 uses Intelligence Information in its expansion, while this unversioned card uses Indicator Information. **Review inference:** retaining that historical expansion without a version is ambiguous, so TAXII receives zero credit. TAXII2.1 supports HTTPS exchange and non-STIX content; compatibility/trust require separate evidence. Preserve the combined m185/m722/m423 family; these cards do not split it into assessed components. [OASIS STIX introduction](https://oasis-open.github.io/cti-documentation/stix/intro), [TAXII2.1 section1.6 and AppendixA](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html).

SCAP is a specification suite supporting interoperable security automation; the short card is qualified vocabulary rather than a scanner or proven compliance result. [NIST SCAP overview](https://csrc.nist.gov/projects/security-content-automation-protocol).

The VM escape comparison retains the actual isolation breach cue, not ordinary authorised guest/host communication. Jailbreaking/rooting remains one qualified broad restriction-bypass comparison, with no independent Android-rooting or complete sandbox-removal claim. Apple describes jailbreak security risks; AOSP documents several app-isolation layers, so neither off-store installation nor a single privilege label demonstrates that all protections disappear. [NIST escape definition](https://csrc.nist.gov/glossary/term/escape), [Apple modification guidance](https://support.apple.com/en-mide/guide/iphone/iph9385bb26a/27/ios/27), [AOSP sandbox](https://source.android.com/docs/security/app-sandbox).

For the combined WIDS/WIPS card, observation and attempted prevention are different capabilities. Sensor coverage and configuration constrain both; this label neither guarantees containment nor approves two independent skills. NIST discusses wireless detection and prevention separately in sections5.3.3–5.3.4. No RF work or containment is performed. [NIST SP800-94](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-94.pdf).

## Actual card-face behavior and provenance

Both decks use makeSet with setType acronym, at src/data/sy0701AcronymFlashcards.js:51; makeCard at src/data/sy0701AcronymFlashcards.js:22 creates IDs and copies face fields. Flattening at src/data/sy0701AcronymFlashcards.js:720 adds parent/set/chapter/objective metadata. App imports authored decks/cards directly at src/App.jsx:94; package.mjs imports them at16 and builds card/deck records at104–105. Exact flattened signatures equal active-package card revisions. Delivered raw-card and parent signatures are bound separately. No question editorial/snapshot/private override layer applies to these card imports. No second card variant or invented example is inferred.

Execute the extracted actual pure safe-mode, inequality-predicate and face expressions at **src/App.jsx:30820**, **src/App.jsx:458**, **src/App.jsx:30923**. Check **40 available card/mode combinations**:

- 17 definition-to-term faces, with existing definition on the back.
- 13 term/expansion faces in acronym mode: two unequal-name attack cards (Physical Attack and VM Escape) plus all eleven protection cards. The Physical Attack title is not thereby a real abbreviation.
- Four equal-name attack cards fall back to definition-to-term tasks in acronym mode.
- Six supplied attack-example faces. The eleven protection cards have no examples; the chooser omits example mode, and safe-mode requests fall back to definition. No eleven extra example faces or new teaching are fabricated.

These counts include the three held cards as **source inspections**, not proposal credit. The card ID remains the same across modes, order/shuffle and self-ratings. Flip/reveal, acronym expansion, self-rated mastered status and completing a pass are not graded understanding, recovery, transfer or independent evidence. The audit invokes no React event handlers, learner storage, sync, analytics, rewards or real ratings. Current behavior remains unchanged.

Navigation/chooser/lab are source-bound at **src/App.jsx:31898**, **src/App.jsx:30837**, **src/App.jsx:30903**. Ordinary deck entry has no account/Pro gate in the inspected handler; related lesson opening retains account-then-Pro gates. Card faces have no inline GlossaryText. Seven selector revisions remain identical to the active package. Random/starred/saved/weak-topic reuse is source-bound only, without exercising actual learner-state flows or claiming a browser run.

Related-lesson selector output at **src/App.jsx:734**:

**deck:cloud-mobile-hardware-attacks** — 6 exact children; container credit0.

- lesson:platform-cloud-hardening — sha256:deaba07011672f1542e82fdac38d5a67035bbc0925b2806f302f9fb494bf51de; observed link, weight0, no approved remediation.
- lesson:threat-actors-surfaces — sha256:da7bf6d1fe6ce25e9bafb89247e70582bfeb249cfa399351006ea58cdeeda771; observed link, weight0, no approved remediation.
- lesson:secure-software-applications — sha256:5e1ae97dbfaee40566cd7cc35f273623c2491b805e3c9a5b1e9177435abc3aa8; observed link, weight0, no approved remediation.

**deck:threat-intel-protection** — 11 exact children; container credit0.

- lesson:secure-software-applications — sha256:5e1ae97dbfaee40566cd7cc35f273623c2491b805e3c9a5b1e9177435abc3aa8; observed link, weight0, no approved remediation.
- lesson:data-classification-lifecycle — sha256:abbc002f1c6ee5f90c19c3bf1a6437118a2782e2b55649a98e20ee5a180edcf1; observed link, weight0, no approved remediation.
- lesson:web-social-dns-attacks — sha256:a4de336332e79c8530cae86101c4fd2db1af46bdf4ce04617a76c9a8a75da799; observed link, weight0, no approved remediation.

Neither deck gains new disposition credit; these lesson links are observations only. Proposed card support links identify existing catalogue support-node candidates, not newly approved remediation or published teaching. No family is split/merged, and new family/mastery/independence credit remains zero.

## Exact prior/new/combined/remaining reconciliation

Reconcile **74 prior substantive packets**, including the11 previous social-card proposals, and separately bind the latest23-row unsupported-PBQ design (no substantive question/feedback arrays). The frozen triage is inventory only. Retain412 tracked question judgments plus42 older distinct judgments (30MCQ/12PBQ),22 duplicate references and seven context/support-only references without promoting limited links.

Inventory **239 instructional occurrences**, **231 distinct identities**, eight duplicate occurrences. Raw flashcard references64 include four limited pilot links; **60** are full current card dispositions. Two limited keyword guides also stay unreviewed. Five explanation identities overlap feedback, not the eight-kind support denominator. All17 new candidates are absent from every prior substantive proposal array. The new14 rows produce253 instructional occurrences /245 distinct identities, raw78 card references, with74 full-card dispositions and four limited links still excluded.

| Coverage | Prior pending | New | Combined pending / total | Remaining |
| --- | ---: | ---: | ---: | ---: |
| Catalogue identities, overlapping content kinds |1121|14|1135/1878|743|
| Authored support units in eight kinds |220|14|234/834|600|
| Full flashcard content |60|14|74/313|239|
| Local-bank question judgments |454|0|454/483|29|
| Full feedback / complete question-feedback pairs |447|0|447/483|36|
| Local MCQ questions / complete pairs |395|0|395/395|0|
| Local PBQ question judgments |59|0|59/88|29|
| Local PBQ full feedback / complete pairs |52|0|52/88|36|

The834 support identities comprise flashcards, deck containers, glossary definitions, keyword guides, lessons, checks, sections and traps. Their instructional meaning overlaps; containers/children are not independent skills or additive learner coverage. The1878 catalogue is broader still. Neither denominator measures approved mastery.

| Kind | Total | Prior | New | Combined | Remaining |
| --- | ---: | ---: | ---: | ---: | ---: |
| deck_container | 29 | 4 | 0 | 4 | 25 |
| explanation_bundle | 494 | 447 | 0 | 447 | 47 |
| flashcard | 313 | 60 | 14 | 74 | 239 |
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

| Objective membership observed | Broad total | Prior | New card proposals | Combined | Remaining local / private |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2.2 | 134 | 74 | 14 | 88 | 46 / 0 |
| 2.4 | 199 | 108 | 9 | 117 | 82 / 0 |
| 3.1 | 220 | 101 | 5 | 106 | 114 / 0 |
| 3.3 | 164 | 35 | 5 | 40 | 124 / 0 |
| 4.2 | 68 | 24 | 9 | 33 | 35 / 0 |

All five affected objective censuses are in the packet. The six attack cards inherit2.2/3.1/3.3 and the eleven protection cards inherit2.2/2.4/4.2; those are broad parent tags, not approved exact scope. The five censuses sum **785 memberships**, cover **595 distinct catalogue identities**, and share **141 identities** across objectives. New14 distinct proposals create42 observed memberships, not42 global reviews or skills. Objective2.2's remaining46 include five held cards: new Side-Loading/DKIM/TAXII plus earlier Phishing/Tailgating. All inherited scopes and primary-canonical proposals remain null; shared tags cannot transfer question/mastery credit.

## Preserved holds and unsupported-PBQ boundary

The preceding social-card packet SHA-256 remains **4858dd3d7960e4c2251805f770f4e0f827dabd93f68d8c904bd4f678cf315806**, with11 owner-pending proposals and two zero-credit definitions. Preserve its complete earlier holds: source ambiguity, KEV teaching limits, RTO/RPO/MTTR roles, hidden evidence, pilot feedback links, single-pair p014, p048/p211 recovery roles, seven older full-feedback gaps, recent grading/delivery qualifications and13 recent semantic deferrals. Exact immutable hashes and source revisions are carried forward; none is repaired or recredited by a card review.

Latest unsupported design SHA-256 **754c40a982e0bc0b8c031493fde678b159f54a5fd1120d7a777bf0564d90ab99** remains bound, with all23 exact source/design-row revisions and projection/slot/root-cause proof hashes. The4 HOTSPOT projections and19 offline slot fixtures remain design-only: **zero question/feedback credit**, null original trusted IDs, no registered grammar/adapter/runtime helper. The previously demonstrated bounded fixture totals remain unchanged (411 slot/value pairings; 324 wrong pairings; 229 invalid inputs and 24 projection failures). This card audit preserves that proof by exact hash, not a claim to rerun it or approve all response Cartesian products.

Question gaps remain23 unsupported plus six supported semantic deferrals; feedback gaps remain those29 plus seven older question-only gaps. The four private p003/p017 question/feedback identities retain exact fingerprints/null trusted IDs, with unavailable semantics unreviewed. No private payload is fetched, exported, substituted by a local fallback or counted as covered.

## Validation and release boundary

The focused audit rejects **895 packet mutations** for stale authored/face/deck/line revisions, wrong parent, definition holds receiving credit, invented examples, false scope/canonical approval, duplicate/shared credit, loss of prior holds, unsupported-PBQ credit, raw face/answer/private exports and false activation. Packet output must equal the source-rebuilt expected draft. This verifies provenance and finite logic; semantic judgments remain qualified human-review proposals, not algorithmically proven truth.

All25 protected release checksums match; frozen ledger **e0ceeec3c5cc8adb94b36175954a8cefaebcb4f29f4c66aa38c400f65de3bb12** and active package **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97** remain unchanged. Active package:1878 records,435 concepts,2954 queued decisions,489 unresolved question mappings,seven existing primary question proposals. Every new trusted ID stays null, all evidence/link weights zero, owner/publication/activation approvals false.

Run node scripts/audit-cloud-threat-flashcards.mjs, all29 mapping tests plus deterministic package reproduction, git diff --check and the configured Vercel [skip deploy] hook. Stage/commit/push only these three artifacts with [skip deploy]; verify exact HEAD=origin/main=remote and full64-character SHA-256 values after push, preserving unrelated Android/generated files. This report contains no live-deployment claim.

**Phase2B-5 remains NOT READY.** No runtime, production, private database, browser, canonical approval, activation or Phase3 work occurs. Remaining content/feedback, owner teaching/mapping decisions and independent assessed families require separate work.
