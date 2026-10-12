# Phase 2B-5 — remaining network protocol cards

**NOT READY.** Local review dated 12 October 2026; baseline **6e90a504084459dbddd6bc1eacc68629c6ead9d9**. Packet SHA-256 **5b112e910a1832ea99b6ffeda6bb9d89f657fedc91b8476f47b5cc7b8614c4f2**; focused audit SHA-256 **7ea7ed4d624e4a7c893357ba074661ccb091f3346e79ef4062c3b71c1b0a8e3f**. Default-off, unwired and learner-invisible. Only this packet, report and focused audit change.

## Selection and decision

The master plan and Phase 1 audit were read in full earlier in this continuing session and remain source-bound. The master plan governs product decisions; the audit supplies current-state evidence verified against source. The approved free-PBQ requirement and current preview/Pro/coin implementation remain an existing gap; this slice changes no entitlement or behavior. No unresolved document conflict requires a behavior change here.

The preceding packet **docs/drafts/phase-2b5-network-protocol-cards-proposals.json** (SHA **912573c42ba2694e954d5455cfce5f122514a8b1291a8a89fafda25be8d148bf**), report (SHA **464859efa3919beab2f8928f315ca09f02a14bf205b8042a7294ec0c58dd4dc8**) and audit (SHA **6f65a326302dd6db06dd30bcf977a655f6488a00936d88a76519c175f9756ecd**) bind exactly the remaining **15** network-deck children, in source order from NTP through WPA/WEP. Selection equals its unreviewedChildRecordIds; catalogue and delivered-card revisions must match. The first 13 cards and previously credited partial deck receive **zero additional credit**. Their exact proposal/delivery bindings are preserved separately.

**12 vocabulary drafts qualify pending owner review; SRTP, SSH and VPN are held at zero credit.** No learner wording is rewritten to remove those holds. Every row retains null primary/scope/assessed-role proposals and trusted revision, zero mastery, no independent/question/feedback/family evidence, and no human/publication/activation/recovery approval. Existing support-node links are unapproved candidates of weight 0. Family labels describe vocabulary only.

| Exact reviewed record | Source line | Outcome | Catalogue revision |
| --- | ---: | --- | --- |
| flashcard:sy0701-acronym-network-architecture-protocols-ntp-network-time-protocol | 349 | Draft; owner pending | sha256:72b461da22217a0a6cfaecb90fa0af7b3d069450b5325853f2b094a29b54589d |
| flashcard:sy0701-acronym-network-architecture-protocols-p2p-peer-to-peer | 350 | Draft; owner pending | sha256:3c231946f0e3f78a1b16d151ab039415c6b350a306d1f56bee1c9f304a3aa2df |
| flashcard:sy0701-acronym-network-architecture-protocols-rdp-remote-desktop-protocol | 351 | Draft; owner pending | sha256:cbedb631d025d403fef9f211f1a336b744e14f0f3801181d09418168935fb75f |
| flashcard:sy0701-acronym-network-architecture-protocols-sd-wan-software-defined-wide-area-network | 352 | Draft; owner pending | sha256:9c07649475e37d742827705583969c6a82065d5d59a335f71861525d27b3d37b |
| flashcard:sy0701-acronym-network-architecture-protocols-sdn-software-defined-networking | 353 | Draft; owner pending | sha256:bc3fa43a413c0a77c5409827d25fbde812de85c636d5faf4d04c334199487762 |
| flashcard:sy0701-acronym-network-architecture-protocols-smtp-smtps-simple-mail-transfer-protocol-secure-smtp | 354 | Draft; owner pending | sha256:d315700dfaccdfc725158a4a17ed72a8162a468480b0d4a625cc2edf7efda5a6 |
| flashcard:sy0701-acronym-network-architecture-protocols-snmp-simple-network-management-protocol | 355 | Draft; owner pending | sha256:eb384343d14aa1076eeefccb46b21eab003e54df9317915842304ac93ab718fd |
| flashcard:sy0701-acronym-network-architecture-protocols-srtp-secure-real-time-transport-protocol | 356 | HOLD; zero credit | sha256:112f12c5f2243e5b137360c0558c57d993c44009e72a470fc80a436a7089c37c |
| flashcard:sy0701-acronym-network-architecture-protocols-ssh-secure-shell | 357 | HOLD; zero credit | sha256:42d94d9d9309d8763e4cf6361f9b3993194d3a3ed3a8b465d7835cbccbe53f75 |
| flashcard:sy0701-acronym-network-architecture-protocols-ssl-tls-secure-sockets-layer-transport-layer-security | 358 | Draft; owner pending | sha256:c15a0ac15429eaa35e6a1462f13f605026925911aee1a55ec0963c6c511fd936 |
| flashcard:sy0701-acronym-network-architecture-protocols-tcp-ip-transmission-control-protocol-internet-protocol | 359 | Draft; owner pending | sha256:5a7b6ea9ab9e9e20db064c14752076e4d1ea3634bfaf4b5bab4c57a7de535f1a |
| flashcard:sy0701-acronym-network-architecture-protocols-vlan-virtual-local-area-network | 360 | Draft; owner pending | sha256:778e64021ec70179f3327ba29dfaab0b14bb7e3c592ffb061cbb1f640de9ab61 |
| flashcard:sy0701-acronym-network-architecture-protocols-vpc-virtual-private-cloud | 361 | Draft; owner pending | sha256:1837deabb83a6fb21b683be7cd567f1d86c7f8b7d7525e193f5c6f77d6e8a603 |
| flashcard:sy0701-acronym-network-architecture-protocols-vpn-virtual-private-network | 362 | HOLD; zero credit | sha256:ba9de88a25f5c00d13da887e62634ed17fa028792c53e1205e6d357af1b158e7 |
| flashcard:sy0701-acronym-network-architecture-protocols-wpa-wep-wi-fi-protected-access-wired-equivalent-privacy | 363 | Draft; owner pending | sha256:906007059d3dd29adc642461a3ca2545ff00a1d7cb4c48d5e4729f092e403ce3 |

All source lines above are in **src/data/sy0701AcronymFlashcards.js** with file/line hashes in sourceChecks. Authored constructors/flattening/deck units **src/data/sy0701AcronymFlashcards.js:22, src/data/sy0701AcronymFlashcards.js:51, src/data/sy0701AcronymFlashcards.js:720, src/data/sy0701AcronymFlashcards.js:328** reproduce each front, expansion, meaning and absent example. Catalogue parentId is absent; authored membership and flattened setId bind the parent. No snapshot/question-override precedence is applied to these direct authored cards.

## Whole-card semantics and primary-source limits

**NTP:** Qualify clock synchronization as the protocol purpose, without promising exact agreement, availability or trusted time. NTP conveys time information rather than allocating addresses or resolving names. Client/server and peer modes exist. A short definition does not verify a time source, offset, accuracy, authentication or resilience; inspected NTPv4 background is not complete current conformance.

**P2P:** Qualify direct peer interaction and decentralized service participation as a model description, without asserting every function lacks a central dependency. Peers can both request and provide services; direct communication alone does not establish a wholly peer-managed discovery function. Hybrid systems can retain central indexes or rendezvous. No topology, availability, authorization or absence of a central point of failure is tested.

**RDP:** Qualify the Microsoft remote graphics/input protocol role; this is vocabulary rather than a successful or secure remote login. Graphical desktop interaction differs from a typical SSH shell; the transport carries remote display and local input. No installed service, exposure, credentials, authentication, negotiated security layer or safe Internet accessibility is established.

**SD-WAN:** Qualify software policy influencing WAN routing/path choices across available connectivity, without promising optimal or secure delivery. Cisco policy documentation illustrates control-plane route distribution and data-plane path policy; vendor behavior is not universal SD-WAN conformance. Available links, routing reachability, QoS and encryption configuration are separate. No failover, throughput, policy application or actual path is tested.

**SDN:** Qualify abstraction between control and forwarding planes enabling programmable network behavior; hardware forwarding is the familiar example rather than a physical-location requirement. Control and forwarding are logical responsibilities; software or virtual forwarding can also exist. SDN is broader than SD-WAN path policy, and separation does not prove centralized security, isolation, availability or a working controller.

**SMTP / SMTPS:** Qualify email sending and SMTP over TLS as a compound transport vocabulary prompt. Secure SMTP is a descriptive expansion, not an independent message-encryption standard. TLS can be implicit or established through STARTTLS; the pair does not assert SMTP is always cleartext. RFC8314 Section3.3 concerns submission, not all relay hops. Transport TLS is not end-to-end mail encryption or storage protection. Certificate validation, required negotiation and supported versions remain configuration requirements, with no observed connection.

**SNMP:** Qualify management and collection of network-device information; no confidentiality claim is present in this definition. Management operations and notifications differ from graphical administration, mail transfer or clock synchronization. Framework security levels include noAuthNoPriv, authNoPriv and authPriv; the name or version alone does not establish authentication or encryption. No access-control or device operation is verified.

**SRTP:** HOLD: the delivered definition asserts encryption and integrity without identifying a profile or enabled protections; the whole card leaves an unconditional guarantee ambiguous. RFC3711 Section4.1.3 permits the NULL cipher and Section7.5 permits a zero-length SRTP authentication tag under conditions. Default transforms are not universal negotiated services. Voice/video describes common RTP use, not arbitrary real-time traffic. No profile, key management or authenticated media is observed; review notes cannot silently rewrite the learner-visible sentence.

**SSH:** HOLD: encrypted remote administration describes the intended common SSH use, but the unqualified delivered sentence leaves negotiated confidentiality as a categorical property. RFC4251 describes secure remote login; RFC4253 Section6.3 explicitly permits a non-recommended none cipher with no confidentiality. Historical allowed algorithms are not current secure recommendations. The card does not bind a version or secure negotiated mode. Command-line use is common rather than exclusive; host verification and user authorization are separate, unobserved requirements.

**SSL / TLS:** Qualify the historical SSL-to-TLS succession and encrypted-transport purpose only; legacy is not a recommendation and modern does not describe every TLS version. RFC7568 Section3 prohibits SSLv3; RFC8996 Sections4/5 prohibit TLS1.0/1.1. The card does not say SSL or all TLS versions are currently safe. Version, cipher and certificate choices matter; transport protection does not establish application authorization, safe endpoints or storage encryption. No handshake or current full security configuration is assessed.

**TCP/IP:** Qualify the common name for the Internet protocol suite; TCP and IP are named constituents, not the entire list of protocols. TCP provides transport services and IP internetwork datagrams; UDP and other suite protocols also exist. The phrase most modern networks is broad background rather than a measured deployment statistic or every-packet TCP claim. No intrinsic encryption, universal delivery, routing or protocol conformance is proved.

**VLAN:** Qualify logical traffic grouping in a switched network, without asserting complete security separation. A VLAN is a logical broadcast/bridging domain rather than a separate physical network or encrypted tunnel. Inter-VLAN routing and switch configuration govern communication. Membership alone does not prove firewall policy, no leakage, correct tagging or successful segmentation.

**VPC:** Qualify logical cloud network isolation using the provider-network model, without asserting an air gap or automatic traffic privacy. AWS VPC is the inspected implementation example; provider-specific controls are not universal across every cloud. The overview itself includes an Internet gateway. Routes, security controls and connectivity choices matter; isolated does not mean no Internet access or automatic encryption.

**VPN:** HOLD: a generic VPN is defined as an encrypted protective tunnel, omitting legitimate VPN architectures without cryptographic privacy and the necessary secure-tunnel scope. RFC4364 Section13.1 states BGP/MPLS VPN architecture supplies no cryptographic privacy; adding cryptography is separate. Logical private reachability is not encryption. An encrypted VPN protects configured traffic within its tunnel boundaries; it does not inherently protect all application traffic, endpoints or activity outside the tunnel. No secure VPN configuration is observed and learner text is unchanged.

**WPA / WEP:** Qualify WEP obsolescence and WPA-family chronology only. Newer is not a claim that every WPA version or configuration is safe. Original WPA Personal, WPA/WPA2 mixed modes, WEP and TKIP remain deprecated choices in the inspected Apple guidance; WPA2 AES and WPA3 are distinguished there. This compound prompt does not assess version choice, authentication or a secure wireless deployment. Neither the glossary history nor later versions transfer independent evidence to this card.

SRTP and SSH holds concern unconditional delivered encryption wording, even though protected/default operation is conventional. The finite instruction requires ambiguous guarantees to be held; review-only qualifications cannot become an invisible correction to a learner face. The earlier IPsec vocabulary proposal is inherited at its exact revision without fresh approval or re-credit. SSL/TLS and WPA/WEP instead explicitly describe history/legacy or chronology; their drafts do not approve legacy deployments or all newer versions.

The following primary references support only the listed inspected portions. Indexed excerpts are explicitly marked; no complete standards audit, live configuration or successful protocol operation is claimed. Review qualifications are interpretations from those portions.

- [Abstract and Section1, primary indexed excerpt](https://www.rfc-editor.org/info/rfc5905/): NTPv4 clock synchronization purpose, not exact accuracy, trusted source or complete updated conformance.
- [Section2 definition examples and Section3 taxonomies, primary indexed excerpt](https://www.rfc-editor.org/info/rfc5694/): Peer service participation; centralized indexes and hybrid architectures remain possible.
- [Protocol landing-page description](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdpbcgr/5073f4ed-1e93-45e1-b039-6e30c385867c): Remote graphical display and input role only; no security-layer or connection validation.
- [Policy overview; centralized and localized policy](https://www.cisco.com/c/en/us/td/docs/routers/sdwan/26x-later/policies/policies-configuration-guide/policy_overview_12221.html): Cisco example of control route distribution and data traffic path policies, not universal vendor behavior.
- [Abstract and Section2, primary indexed excerpt](https://www.rfc-editor.org/info/rfc7426/): Programmability and logical control/forwarding separation; no particular physical topology.
- [Sections1,2,3 and3.3](https://www.rfc-editor.org/info/rfc8314/): Implicit TLS and STARTTLS for SMTP submission; relay outside scope and no end-to-end mail encryption substitution.
- [Section3.4.3 and security-level definitions, primary indexed excerpt](https://www.rfc-editor.org/info/rfc3411/): SNMP security levels vary; management framework is not automatically private.
- [Abstract; Sections4.1.3,5.1,7.5](https://www.rfc-editor.org/info/rfc3711/): SRTP capabilities and defaults versus NULL confidentiality and zero-length SRTP tag; delivered guarantee held.
- [Abstract and Section1](https://www.rfc-editor.org/info/rfc4251/): SSH remote login and layered transport/authentication/channel purposes.
- [Section6.3 and6.4](https://www.rfc-editor.org/info/rfc4253/): Historic negotiated none encryption/MAC options are not recommended; no endorsement of obsolete algorithms.
- [Introduction and Section3](https://www.rfc-editor.org/info/rfc7568/): SSLv3 prohibited; succession does not make legacy use safe.
- [Sections4 and5](https://datatracker.ietf.org/doc/html/rfc8996): TLS1.0/1.1 prohibited; no approval of every TLS version or cipher.
- [Section1.1.3, primary indexed excerpt](https://www.rfc-editor.org/rfc/inline-errata/rfc1122.html): Internet suite layers, TCP/UDP and IP roles; historical background not exhaustive current conformance.
- [Virtual Local Area Network Definition, primary indexed excerpt](https://www.cisco.com/en/US/docs/ios/12_4/lan_switch/configuration/guide/confvlan.html): Logical switch broadcast domains; historical example not current device configuration.
- [What is Amazon VPC and opening example](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html): AWS logical isolation and optional Internet gateway; not an air gap or universal provider guarantee.
- [Section13.1](https://www.rfc-editor.org/info/rfc4364/): BGP/MPLS VPN architecture does not supply cryptographic privacy; generic encryption definition held.
- [Security](https://support.apple.com/en-us/102766): Current vendor guidance distinguishes WPA2 AES/WPA3 from WPA Personal, mixed WPA/WPA2, WEP and TKIP; chronology alone no security endorsement.

## Modes, routes and selectors

Pure source-derived mode **src/App.jsx:30820**, predicate **src/App.jsx:458** and face **src/App.jsx:30923** probes bind exact outputs for all 15 whole cards, including held text. Definition mode asks from the meaning and reveals term/meaning; acronym mode asks the acronym and reveals expansion/meaning. These are repeated vocabulary faces, not independent transfer assessments. Chooser **src/App.jsx:30837** offers both: **30 offered faces**, **15 synthetic example preferences falling back to definition**, and **45 reverse-order comparisons**. Neither this slice nor the full 28-card deck has examples, term markers or dividers; no scenario is invented.

Navigation **src/App.jsx:31898** allows ordinary guests/free users to open the deck; guests choose a mode, while signed-in users with a valid default can skip the chooser. An example default falls back. Lab **src/App.jsx:30903** displays plain text without a GlossaryText popup. Source progress uses local mastered IDs and conditional Supabase synchronization, but no account, network, persistence, telemetry or real progress handler executes.

The actual rate closure **src/App.jsx:31011** runs only with synthetic callbacks. Both all-Again and all-Got-it paths complete after **28 distinct** cards. The selected 15 alone do not complete the pass; duplicate ratings add no distinct completion. Self-ratings establish neither graded understanding nor mastery. Runtime retains all 28 cards, including the three holds.

Related matcher **src/App.jsx:734** and tokens **src/App.jsx:656** use the whole deck, including inherited and held text. Its bound links are **lesson:network-protocols-ports, lesson:dns-time-management-security, lesson:enterprise-network-segmentation**, with exact lesson/profile revisions and no new lesson/remediation approval. Related-link clicks require an account then Pro; starred decks suppress links. Ordinary deck access remains separate.

Weak selector **src/App.jsx:657** with synthetic chapter 3/deck topic returns **18** distinct cards, **nine** from this selected slice and nine inherited cards. Missing/unknown chapter returns null. This chapter/token match supplies no canonical mapping or recovery evidence, including when held cards are selected. Random builder/config **src/App.jsx:497, src/App.jsx:414** use the real whole-deck pool in six preserve-order probes: definition/acronym and requested 10/20/30 give actual 10/20/28, with **0/7/15 selected-slice** cards in each mode. No production randomness or saved deck is observed. All **seven** selector bindings remain unapproved interventions. Lexical glossary references bind observed usage without visible card popups, inherited approval or independence.

## Same container and preserved accounting

The unchanged deck metadata/membership at **src/data/sy0701AcronymFlashcards.js:328** still covers 28 children. All child text has now been read across two slices, but only **25 child drafts** qualify (13 inherited + 12 new); **three held children** keep containerCoverage=partial_with_selected_semantic_holds. There are no unread children and allChildDraftsQualified=false, allChildrenApproved=false. The previously counted partial container is reused with **newDeckContainerProposalCredit=0**; it is not upgraded to a full architecture/container approval.

**86** preceding packets reconcile against their actual substantive arrays, exact source bindings and immutable census. Prior instructional occurrences **385**, distinct **377**, retain eight repeats; 12 new distinct drafts produce **397 occurrences / 389 distinct**. Six limited instructional links remain uncredited. Older question-only 42 (30 MCQ/12 PBQ), 22 duplicates and seven support-only references keep prior treatment.

All **42 inherited explicit held rows**, plus **45 exact hold/lineage fields**, remain bound and unresolved. Three new holds make **45 explicit held identities**. Preserve the seven older feedback gaps, 23 unsupported PBQ compiler/grammar/delivery holds, password/Rainbow Table partial-container and card/glossary/malware/memory/Wi-Fi/CORS/authorization holds. Preserve canonical/taxonomy/pilot/KEV/recovery/independence/component/owner/operational limits. Four private p003/p017 question/feedback records remain unavailable, unreviewed and null-trusted; no private payload is fetched or substituted.

| Measure | Prior | New qualifying drafts | Combined pending | Remaining |
| --- | ---: | ---: | ---: | ---: |
| Support / 834 |366|12|378|456|
| Catalogue / 1878 |1267|12|1279|599|
| Cards / 313 |122|12|134|179|
| Containers / 29 |9|0|9|20|
| Glossary / 162 |98|0|98|64|
| Questions / 483 |454|0|454|29|
| Full feedback / complete pairs / 483 |447|0|447|36|

MCQ questions/pairs stay 395/395; PBQ questions 59/88 and pairs 52/88. The seven older feedback-only gaps remain seven. Held cards are read but not counted as qualifying drafts, so they remain in outstanding census counts.

The 12 new drafts have four observed deck tags each, producing **48 memberships**, not 48 distinct global credits. All 15 reviewed cards have those tags; the three holds add zero. Broad metadata is not canonical scope or full architecture competency. All 18 objective censuses and by-kind splits reconcile:

| Objective | Candidates | Prior | New cards / containers | Combined pending | Remaining local / private |
| --- | ---: | ---: | --- | ---: | --- |
| 2.2 | 134 | 115 | 0/0 | 115 | 19/0 |
| 2.3 | 162 | 142 | 0/0 | 142 | 20/0 |
| 2.4 | 199 | 181 | 0/0 | 181 | 18/0 |
| 2.5 | 66 | 40 | 0/0 | 40 | 26/0 |
| 3.1 | 220 | 111 | 0/0 | 111 | 109/0 |
| 3.2 | 220 | 128 | 12/0 | 140 | 80/0 |
| 3.3 | 164 | 63 | 12/0 | 75 | 89/0 |
| 3.4 | 176 | 67 | 12/0 | 79 | 97/0 |
| 4.1 | 203 | 112 | 12/0 | 124 | 79/0 |
| 4.2 | 68 | 39 | 0/0 | 39 | 29/0 |
| 4.3 | 86 | 62 | 0/0 | 62 | 24/0 |
| 4.4 | 120 | 41 | 0/0 | 41 | 79/0 |
| 4.5 | 169 | 73 | 0/0 | 73 | 96/0 |
| 4.6 | 151 | 103 | 0/0 | 103 | 48/0 |
| 4.7 | 42 | 12 | 0/0 | 12 | 30/0 |
| 4.8 | 130 | 54 | 0/0 | 54 | 76/0 |
| 4.9 | 96 | 25 | 0/0 | 25 | 69/2 |
| 5.2 | 141 | 67 | 0/0 | 67 | 72/2 |

Objective 4.1 is **124/203, 79 remaining**; 3.2 **140/220, 80**; 3.3 **75/164, 89**; 3.4 **79/176, 97**. All other objectives are unchanged. The packet binds **2547 total metadata memberships**, **1421 distinct objective-associated records**, **536 shared records**, and **249 inherited overlapping records**, without duplicate global credit.

## Verification and release boundary

Commands: **node scripts/audit-network-protocol-cards-remaining.mjs**, **npm run audit:content-mapping**, **git diff --check**. The focused audit rejects **1509 adversarial mutations** and verifies exact 15 selection/delivery revisions; all fields/modes/parents; reused 13-child/container credit; three semantic holds; source access/gates/matchers; six random and two pass probes; seven selectors; 86 prior packets; all18 objective/global censuses; JSON round trip; deterministic packet/report reproduction; safe exports; no runtime import; **253 bound files**; and **25 unchanged protected release hashes**.

All 29 mapping tests and deterministic unchanged active-package reproduction passed. The configured Vercel [skip deploy] predicate was verified (marker returns 0, control returns 1). The final delivery check verifies the empty staged index after commit, exact HEAD/origin/main/remote equality and remote artifact SHA-256 values; those resulting commit/artifact hashes are reported in the completion response. Preserve the ledger, .gitignore hash and original eight unrelated dirty entries. Report the resulting commit and report hash separately; a report cannot bind its own hash.

No fresh learner browser, real account/progress handler, private database read, migration, deployment, activation, runtime/entitlement change, Phase 3 or another slice. Owner/canonical roles and scope, private coverage, complete supported feedback/premise delivery, calibrated independent learning and release/rollback gates remain open. This finite 15-card review is complete with three holds; **Phase 2B-5 remains NOT READY**.
