# Phase 2B-5 — objective 1.4 network/email glossary review

Offline agent dispositions only; **NOT READY** for approval, publication, activation, migration or deployment. Baseline **5ee5d4f83e4a8b1d9f40141cb6b3c541754c4d11**; packet SHA-256 **e32f4374c1067fbd493fd289cead64eb42dbe1cfa60e77ceed423b3fdf1a3632**. Only packet, report and focused audit change.

## Exact boundary and current definitions

Exactly eight IDs from the prior packet's **15 remaining**: **glossary:ah,glossary:dkim,glossary:dmarc,glossary:dnssec,glossary:ipsec,glossary:mitm,glossary:ngfw,glossary:nips**. All **31 prior packets** and source revisions are bound. No question, feedback, card, lesson, deck or other glossary entry receives a new disposition. Only disposition arrays count.

All eight are authored object entries in ACRONYM_GLOSSARY_TERMS. Actual getEntry returns their fullName/definition unchanged. Literal/source line, term-plus-definition, separate definition, rendered entry/name/body and matcher/renderer revisions are bound; no corrected fallback is substituted.

| Record | Exact current full name and definition | Source line |
| --- | --- | --- |
| glossary:ah | Authentication Header: IPsec protocol that provides integrity and authentication, but not confidentiality. | src/App.jsx:2240 |
| glossary:dkim | DomainKeys Identified Mail: Email authentication method that uses cryptographic signatures to verify message origin. | src/App.jsx:2282 |
| glossary:dmarc | Domain-based Message Authentication, Reporting, and Conformance: Email governance framework that coordinates SPF and DKIM checks and handling policy. | src/App.jsx:2284 |
| glossary:dnssec | Domain Name System Security Extensions: Cryptographic extensions that help validate DNS responses and detect tampering. | src/App.jsx:2286 |
| glossary:ipsec | Internet Protocol Security: Protocol suite for authenticated and encrypted VPN communications using AH and ESP. | src/App.jsx:2311 |
| glossary:mitm | Man-in-the-Middle / On-Path Attack: Attack where an adversary intercepts or alters communications between endpoints. | src/App.jsx:2320 |
| glossary:ngfw | Next-Generation Firewall: Firewall combining packet filtering with deep inspection, application awareness, and IPS features. | src/App.jsx:2331 |
| glossary:nips | Network-based Intrusion Prevention System: Network inline sensor that can block suspicious traffic. | src/App.jsx:2333 |

## Complete conservative dispositions

| Record | Proposed scope;weight0 | Teaching and qualification hold |
| --- | --- | --- |
| glossary:ah | precise scope withheld;context 1.4/3.2 | Recognize AH as IPsec integrity and data-origin authentication without confidentiality; retain contextual cryptographic/protocol support with precise numbered scope withheld. HOLD authentication as unique-person identity or safe plaintext. AH excludes mutable IP-header fields and does not encrypt; anti-replay effectiveness requires receiver checks and sound security-association/key handling. Header changes such as NAT complicate deployment. AH is not ESP, tunnel/transport mode, an authenticated-encryption construction or proof of IPsec configuration competence. Preserve prior AH-card context-only scope; no packet, replay window, peer or VPN was configured or tested. |
| glossary:dkim | 4.5;context 1.4 | Recognize DKIM as verification of covered canonicalized message content under a signing domain, not automatic visible-author authentication or a safety verdict. HOLD message origin as visible From alignment, human authorship or trusted content. Verification binds signing domain d= to covered selected headers and canonicalized body, potentially limited by l=; it does not promise all-byte immutability, encryption or safe attachments. Key retrieval/trust, algorithms and custody matter. DMARC alignment is a separate check. Preserve the existing DKIM support identity lacking 4.5 as a metadata mismatch, not an approved schema edit; no DNS lookup or signature was verified. |
| glossary:dmarc | 4.5;context none | Recognize DMARC as Author Domain alignment using a passing SPF or DKIM result, with requested handling/reporting policy rather than mandatory universal receiver action. HOLD coordinates SPF and DKIM as requiring both to pass: one passing aligned identifier is sufficient. SPF envelope/HELO, DKIM signing domain and visible Author Domain are distinct identities with strict/relaxed alignment rules. Requested reject/quarantine/report handling remains subject to receiver policy; pass is not encryption, guaranteed delivery, trustworthy content or human identity. Use current RFC9989 rather than superseded RFC7489; no DNS policy, mail flow, receiver decision or report was tested. |
| glossary:dnssec | precise scope withheld;context 1.4/2.4/4.5 | Recognize DNSSEC as origin authentication and integrity for signed DNS data through validated trust, not encrypted DNS transport; precise numbered implementation scope withheld. HOLD validate responses as universal protection from poisoning or all DNS threats. Validation needs appropriate trust anchors, chain, signatures and time/algorithm handling; unsigned/insecure, bogus and indeterminate states must remain distinct. Signed origin does not imply safe destinations or availability. DNSSEC supplies no query confidentiality and is not DoH/DoT, CAA issuance authorization or filtering policy. Existing support identity has empty codes; do not invent a precise 1.4/2.4/4.5 assessment or edit it. No resolver or DNS answer was validated. |
| glossary:ipsec | precise scope withheld;context 1.4/3.2 | Recognize IPsec suite context only; hold the all-encrypted and combined-AH-and-ESP reading pending explicit configuration and optional-service qualifications. HOLD authenticated and encrypted using AH and ESP as automatic suite-wide encryption or mandatory simultaneous protocols. AH has no confidentiality; ESP services depend on selected transforms and configuration, including integrity-only use. Security-association policy, peer/key establishment, modes and enabled receiver checks determine protection; not all traffic is automatically protected. Preserve prior AH and the inspected lesson optional-encryption premises. No precise support link or full 1.4/3.2 implementation assessment is approved; no VPN was configured. |
| glossary:mitm | 2.4;context 1.4 | Recognize MITM/on-path as adversary positioning to intercept or alter endpoint communications; narrow attack vocabulary, not a demonstrated cryptographic break. HOLD intercepts or alters as ability to read/forge any correctly authenticated encrypted channel. Attack viability depends on path/relay position, endpoint identity verification, key/protocol and user/device assumptions. Passive observation, replay, endpoint compromise and forward secrecy are separate concerns. Correct peer authentication and integrity constrain impersonation/modification; encryption alone without identity binding is insufficient. No attack, decrypted capture or prevention was demonstrated. Metadata-only MITM references are not rendered tooltip exposure. |
| glossary:ngfw | 3.2;context none | Recognize NGFW as a network firewall capability category combining application-aware inspection and prevention features under actual product and deployment conditions. HOLD feature bundle as uniform enabled product, guaranteed detection/prevention, WAF/CASB/SIEM/HSM equivalence or automatic TLS payload visibility. Actual rules, inspection parsers, signatures, licenses, capacity, placement and TLS decryption/endpoint visibility govern coverage; evasion and false positives/negatives remain. Encrypted traffic may expose metadata while hiding content. TLS inspection requires an appropriate authorized termination/decryption path and trusted endpoint configuration, not simply an NGFW label. No appliance or traffic was inspected. |
| glossary:nips | 3.2;context none | Recognize NIPS as network intrusion-prevention capability in an inline enforcement path that can block detected activity, not a guarantee that every attack is prevented. HOLD can block as all malicious traffic blocked or label proving active enforcement. Inline placement, enabled prevention/rules, visibility, tuning, performance and failure behavior matter; passive observation alone does not block packets in the path. False positives can block benign traffic and false negatives can miss attacks; encrypted payloads need an appropriate observation/decryption point. NIPS is not HIPS, NIDS, generic IPS, HSM or the combined HIPS/NIPS card identity. No sensor, rule or throughput was tested. |

[CompTIA SY0-701 v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) names on-path network attacks in **2.4**, IPS/NGFW appliances and IPsec in **3.2**, and DKIM/DMARC email controls in **4.5**. Narrow vocabulary recognition is proposed for DKIM/DMARC4.5, MITM2.4 and NGFW/NIPS3.2 (NIPS inferred from network IPS). **AH/DNSSEC retain context only**, with precise numbered scope withheld. **IPsec precise scope and link are withheld** because all-encrypted/combined-protocol shorthand needs correction or qualification. No selected definition receives precise1.4 scope merely because its observed source-tag union includes1.4; cryptographic context is not assessment or implementation competence.

Seven existing support-node links are pending and weight0; no identity is created or approved. DKIM's existing node lacks4.5. DNSSEC/MITM/NGFW/NIPS nodes have empty objective codes, and IPsec's card-derived codes differ from current3.2 protocol context. These metadata mismatches remain held without active edits or invented identities. HIPS/NIPS compound card identity stays separate. Prior RSA and OCSP content-error holds remain explicit.

## Primary-source checks

[RFC4302 §§1,2.5,3.3.3,3.4.3](https://www.rfc-editor.org/rfc/rfc4302.html) separates AH integrity/data-origin authentication from confidentiality, excludes mutable header fields and requires receiver replay checks for effective replay protection. [RFC4301 §§3–5](https://www.rfc-editor.org/rfc/rfc4301.html) binds IPsec behavior to policy and security associations. [RFC4303 §1](https://www.rfc-editor.org/rfc/rfc4303.html) permits selected ESP confidentiality/integrity services, including integrity-only operation. AH and ESP are not mandatory simultaneous protocols; the suite name proves neither encryption nor protection of all traffic. No protocol operation, transform or current deployment recommendation was tested.

[RFC6376 §§1.2–1.5,3.4–3.5](https://www.rfc-editor.org/rfc/rfc6376.html) binds DKIM signing-domain identity to selected canonicalized content; optional l= limits body coverage. It does not require signing-domain identity to equal visible authorship. Origin shorthand needs these qualifications, not an inference of all-byte immutability, safe content, encryption or human trust.

Current [RFC9989 §§4,5.3,5.4](https://www.rfc-editor.org/rfc/rfc9989.html) supersedes RFC7489/9091 and preserves a passing aligned SPF **or** DKIM identifier, not both-required logic. Author Domain authorization supplies no value judgment about the human or content; final handling stays receiver policy. The reviewed PKI/email lesson already cites RFC9989; do not replace it with the superseded reference. No policy, alignment evaluation, lookup, signature or mail handling ran.

[RFC4033 §§3–6](https://www.rfc-editor.org/rfc/rfc4033.html) separates DNS data origin/integrity from query confidentiality and channel protection. Trust anchors/chains and secure/insecure/bogus/indeterminate states matter. DNSSEC is distinct from CAA policy, DNS filtering and DoH/DoT; valid signed data proves neither safe destinations nor availability. Its broad help-validate wording supports context, not full configuration scope.

[NIST's MitM definition](https://csrc.nist.gov/glossary/term/man_in_the_middle_attack) requires positioning between communicating parties. Interception/alteration capability depends on authentication, integrity, keys, endpoints and relay/path assumptions; the definition does not establish a break of correctly authenticated encrypted traffic or make forward secrecy a universal on-path defense.

[NIST SP800-41r1 §§2.1.3,2.1.6,2.3](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-41r1.pdf) explains application inspection and encrypted-content limits. The NGFW bundle is a capability description, not uniform enabled behavior, TLS plaintext visibility or WAF/CASB/SIEM/HSM equivalence. [NIST SP800-94 §§2.2,4.2.2,4.3.3.4,4.3.4](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-94.pdf) distinguishes inline prevention and passive observation, false positives/negatives and encrypted-payload/load limits. These historical sources support enduring capability boundaries, not a current appliance certification or purchasing recommendation. No sensor, rule, traffic, license, throughput or authorized TLS-inspection configuration was checked.

## Actual tooltip delivery and collisions

Source-only verification; no fresh browser-open or entitlement test. Exact pure format/matcher/getEntry/split expressions run in memory. The matcher is case-insensitive, longest-first and ASCII-alphanumeric-boundary-based per inline format segment. Entire bold DKIM, underlined DMARC and highlighted DNSSEC match; IPSEC normalizes to IPsec. Extended tokens and DK + bold IM do not match a complete DKIM token. HIPS/NIPS triggers two separate glossary keys, not the compound card identity. Expanded Man-in-the-Middle / On-Path Attack alone does not trigger MITM.

Synthetic **Ah, now I see.** and **The puppy nips at my sleeve.** trigger AH/NIPS despite ordinary meanings. Those exact phrases are absent from the checked local MCQ/PBQ/lesson prose; these are context-insensitive matcher probes, not observed learner exposures or a claim that every collision variant was searched. No matching fix is made.

Terms are role-button focusable spans with aria-expanded, click/Enter/Space toggles and outside-pointer close; no hover-only open, independent glossary Pro/account gate or recursive tooltip overlay was found. Parent access and reveal rules still govern delivery. Actual native browser interaction/accessibility remains unverified.

| Definition | Source-rendered parent | Field/gate | Parent status |
| --- | --- | --- | --- |
| AH | mcq:m153 | options;selected_unsubmitted_question_and_rendered_options | source_inspection_only_not_semantically_reviewed_here |
| DKIM | mcq:m278 | stem;selected_question_and_rendered_stem | source_inspection_only_not_semantically_reviewed_here |
| DMARC | mcq:m278 | options;selected_unsubmitted_question_and_rendered_options | source_inspection_only_not_semantically_reviewed_here |
| DNSSEC | mcq:m112 | options;selected_unsubmitted_question_and_rendered_options | prior_disposition_reference_only |
| IPsec | mcq:m153 | stem;selected_question_and_rendered_stem | source_inspection_only_not_semantically_reviewed_here |
| NGFW | mcq:m622 | options;selected_unsubmitted_question_and_rendered_options | prior_disposition_reference_only |
| NIPS | mcq:m728 | options;selected_unsubmitted_question_and_rendered_options | prior_disposition_reference_only |

These **seven** probes bind exact field/local/published revisions and real QuestionStemText splitting. Unreviewed parents such as m153/m278 are inspected for token delivery only; this does not disposition their teaching, choices or grading. Options before submission render GlossaryText; after submission, options and selected wrong feedback sit inside disabled buttons, so nested tooltip interaction is unverified. Detailed practice explanation/selected wrong feedback require submitted Pro.

**MITM has no rendered-prose probe in the checked local corpus**. Its three references m707/m717/m721 are acronym metadata. Normal MCQPractice does not read .acronyms as a rendered surface; metadata/body distinctions and hashes are retained. No tooltip opening or universal absence across private/live/other inputs is claimed. MITM remains an available conditional definition with null verifiedSurfaceExample.

Three lesson-body probes bind actual sentence splitting: AH in ipsec-secure-media section0 body[1]'s first visible sentence; DKIM/DMARC in pki-email-trust section1 body[1]'s **collapsed supporting detail** after the first SPF sentence. Current lessons require Pro and selected section, plus supporting-detail open for the latter two. AH's source chapter3 section is additionally marked beyond by the profile; a body token is no assessed configuration skill. The approved free-Domain1 lesson gap stays held.

Four plain-JSX table inspections (AH in IPsec, DNSSEC in free web/social preview and DNS/time lesson, NGFW in network-defense) are excluded as glossary delivery proof. Card faces and plain model/check reveals also have no automatic glossary overlay. AH's card is a prior disposition reference; exact DKIM/DMARC/IPsec and compound HIPS/NIPS cards are source-inspection-only. DNSSEC/MITM/NGFW/NIPS have no exact-acronym card. No card, lesson, metadata or table is counted again.

## Prior overlap and preserved conflicts

**AH**: flashcard:sy0701-acronym-crypto-keys-pki-ah-authentication-header, mcq:m103, mcq:m656; prior AH card context and generic integrity authentication not IPsec configuration. Applicable prior question comparisons also bind paired feedback; no new disposition/family/evidence.

**DKIM**: section:pki-email-trust:1, check:pki-email-trust; qualified signed covered canonicalized content signing domain not visible author or safe content. Applicable prior question comparisons also bind paired feedback; no new disposition/family/evidence.

**DMARC**: section:pki-email-trust:1, keywords:pki-email-trust, check:pki-email-trust; aligned SPF OR DKIM not both or universal receiver enforcement. Applicable prior question comparisons also bind paired feedback; no new disposition/family/evidence.

**DNSSEC**: mcq:m112, section:pki-email-trust:0; signed DNS data not CAA authorized issuer policy or certificate validity. Applicable prior question comparisons also bind paired feedback; no new disposition/family/evidence.

**IPsec**: flashcard:sy0701-acronym-crypto-keys-pki-ah-authentication-header; suite encryption shorthand does not override prior AH no confidentiality. Applicable prior question comparisons also bind paired feedback; no new disposition/family/evidence.

**MITM**: mcq:m717; metadata reference only forward secrecy question does not teach on path attack or render MITM. Applicable prior question comparisons also bind paired feedback; no new disposition/family/evidence.

**NGFW**: mcq:m622, glossary:hsm; network filtering distractor distinct from dedicated cryptographic module. Applicable prior question comparisons also bind paired feedback; no new disposition/family/evidence.

**NIPS**: mcq:m728, glossary:hsm; network prevention distractor distinct from key management appliance. Applicable prior question comparisons also bind paired feedback; no new disposition/family/evidence.

Usage inventories bind all lexical-reference hashes and mark prior dispositions versus inspection-only content. The prior PKI/email section/model already limits DKIM content coverage and domain identity and gives aligned SPF-or-DKIM policy; glossary shorthand cannot override it. Prior AH-card no-confidentiality and context-only scope remain. IPsec's current shorthand conflicts with those service-selection premises; precise linking stays held and no behavior changes. The m717 forward-secrecy question's MITM metadata is not on-path teaching. NGFW/NIPS HSM distractors do not confer cryptographic key-custody scope. Repeated support does not prove recovery or an independent family.

## Exact census and checks

**235 candidates:220 prior +8 new =228 distinct pending dispositions;7 remain**, all glossary definitions. Exact remaining IDs:

- glossary:bios
- glossary:pem
- glossary:pfs
- glossary:s%2Fmime
- glossary:san
- glossary:tokenization
- glossary:tpm

Global package remains **1878 records/435 identities** (5 mastery/28 topic/402 support), **2954 queue rows**, **489 unresolved questions**, **7 existing primary proposals**. Every earlier canonical/CIA/MAC/RBAC/TOU/MTTR/MTBF/FAR/MOA/MOU and crypto/keys/modes/PKI/algorithm/exchange/attack/RSA/OCSP hold remains. Private p017 is **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, trusted null, unavailable/unreviewed; no fresh private fetch or substitute. All new approval, assessed primary, mastery weight, families and eligible evidence are **zero**.

Run `node scripts/audit-objective14-network-email-glossary.mjs` and `npm run audit:content-mapping`. Deterministic checks bind authored/rendered definitions, exact15-to7 census, prior revisions, selector/renderer/access units, seven MCQ probes, three lesson-body probes, metadata-only MITM, four excluded tables, five card references and existing support metadata. Negative mutations reject stale revisions/location/parent, metadata as rendered fields, invented browser delivery, changed gates, scope/identity promotion, expanded teaching, missing qualifications, IPsec link approval and trusted/mastery/family/approval credit. Exact package/bank and **25 active release hashes** stay unchanged. No active content/package/runtime/browser/database/learner/live/shadow/cohort/deploy/migration/Phase3 edits. Task-only **[skip deploy]** push; Phase2B-5 remains **NOT READY**.
