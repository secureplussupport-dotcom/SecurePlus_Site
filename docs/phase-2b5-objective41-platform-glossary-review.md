# Phase 2B-5 — objective 4.1 platform and access glossary

**NOT READY.** LOCAL/default-off/unwired/learner-invisible; 12 October 2026. Baseline **84cd163e5c95962438fb5f8f6673af23d9eb13fb**. Packet SHA-256 **8ee4bcfbe959fe3ae2d13119e7aea24d1a3fc3df96bc3534e7a4e7fd40ad8f27**; audit SHA-256 **c0d6bbde72736dab721f39e664faacb933b60542e463d88dea7ca569e5b85880**. Only this packet, report and focused audit change.

The master plan and Phase 1 audit were read in full earlier in this continuing session and remain source-bound. The master plan governs approved decisions; audit facts are checked against source. The inherited approved free-PBQ/current preview-Pro-coin implementation gap remains unresolved without an entitlement change. This finite glossary review requires no behavior change or new conflict resolution.

## Exact scope and semantic result

Select exactly the following **16 inventory-only identities**, in delegated order, from objective4.1 remainingRecordIds in **docs/drafts/phase-2b5-hardening-access-terms-proposals.json**. Baseline packet/report/audit hashes are **e64ef961820fd127f19b98bab7bea0357dc467d2d8530a9f9dafbcf93bc16c53 / fbbc4b51e807e122952d07698e0ee4dd1d7de8ed0d0a9ad4ab35b5e3cd54250b / c4d7bb6b538f9d4a7f7ac4c4d10c805d4621175e6f7c8766bc8ab7d12eb20e98**. All catalogue/definition/display revisions and source lines/file hashes are pinned; no card, lesson, question or feedback receives a fresh disposition.

**13 glossary drafts qualify pending owner approval; CYOD, SRTP and SSH are held at zero credit.** No definition is rewritten. Earlier OWASP, SQL injection, SSID and SQLi holds are excluded and remain unresolved. SRTP/SSH glossary decisions are made independently from their distinct held cards, whose exact dispositions remain bound.

| Identity | Source line in src/App.jsx | Decision | Catalogue revision |
| --- | ---: | --- | --- |
| glossary:byod | 2256 | Vocabulary draft; owner pending | sha256:1334cb9545de1179ab08de9ea8bedb35be5980b40ee56de8723268441926072b |
| glossary:cope | 2265 | Vocabulary draft; owner pending | sha256:89d405a507690509537be7dc9d821ba0b8b009a19ca9d0f3e2e83d5ec4331bff |
| glossary:cyod | 2273 | HOLD; zero credit | sha256:699175d96e6799cb7c081d10280278ec4d9c01e4a1bc904619648a04ddcd3888 |
| glossary:kdc | 2312 | Vocabulary draft; owner pending | sha256:04d0c4a7bff7c8dfa75b92ce496457ab497838acc5752e673f9e260df4dcf125 |
| glossary:ldaps | 2314 | Vocabulary draft; owner pending | sha256:a9945b4ad5496cafa8a9406480a6a9b8e2ceb1718231cf49a6e52644512b4a57 |
| glossary:mam | 2316 | Vocabulary draft; owner pending | sha256:52ead224280ece6565de2fa593926ccb54559b0322e4cd6e20e89515f4fbeb23 |
| glossary:mdm | 2318 | Vocabulary draft; owner pending | sha256:94788d9d641f3006feb1609f9a92d43c47fcd9ef829098740a38ea4b7c3db9c3 |
| glossary:nac | 2327 | Vocabulary draft; owner pending | sha256:1f0709e9b53fbae1ff9ab42fd02c698b0f35e3f8110f870d6f76d6dc5d2e858f |
| glossary:nat | 2328 | Vocabulary draft; owner pending | sha256:6b3622986b0ad0241210d372effd909cda2ab1f80e54ec190aed2b2aa1e3ecb1 |
| glossary:pat | 2329 | Vocabulary draft; owner pending | sha256:16727c887df4fd0d2e83ab152d3c03acaba757fb6a90693aecc074ce8456529b |
| glossary:scada | 2363 | Vocabulary draft; owner pending | sha256:abc74915992a73df50c3fc913e50b6b0dbf31cbe2a4e7eec6fb145058e6833b0 |
| glossary:sdn | 2364 | Vocabulary draft; owner pending | sha256:f7b441a4080956123c42dc237c006d4fae5b7a235bc9c922b712fdc0efe301b8 |
| glossary:srtp | 2372 | HOLD; zero credit | sha256:bad78ec629823eefa280b7c80a882d319f9a9b4a0ecd316c48d7d219621c86a4 |
| glossary:ssh | 2373 | HOLD; zero credit | sha256:c8461c36a4ee1bdb9e35f61298a24bcd79ca0754186ce7633ebd989ffc288a47 |
| glossary:vpc | 2387 | Vocabulary draft; owner pending | sha256:6d641f4940d99a28f5a26e5b318d2d382b7fd22bde73e98d3b85c2c60f1b9acd |
| glossary:xdr | 2390 | Vocabulary draft; owner pending | sha256:28da014244b43e25ff6a2e7e2cbfbfaa8d15045ab2b5575dbf7b39e2904f22e9 |

| Term | Whole-definition qualification or hold |
| --- | --- |
| BYOD | Qualify personal device use for work access as the BYOD model; ownership is personal, with enterprise permission and safeguards separate. |
| COPE | Qualify organization ownership plus permitted personal use; personally enabled does not transfer ownership to the employee. |
| CYOD | HOLD: the definition makes approved CYOD devices enterprise-owned, while NIST explicitly includes employee-purchased devices selected from an enterprise list. Choice does not establish ownership. |
| KDC | Qualify the Kerberos ticket-issuing service, with authentication-server and ticket-granting functions distinguished from directory lookup. |
| LDAPS | Qualify LDAP carried over TLS as directory-transport protection; this is not a replacement for directory access control or Kerberos ticket issuance. |
| MAM | Qualify enterprise application/data management on mobile devices at app scope, distinct from whole-device management. |
| MDM | Qualify the platform category for device policies, software delivery and remote-wipe capability, without guaranteeing every enrolled device implements every action. |
| NAC | Qualify identity and endpoint-posture checks used to determine network admission, with the admitted access determined by policy. |
| NAT | Qualify the traditional private-to-public IP mapping use as brief NAT vocabulary, without restricting every NAT architecture to that topology. |
| PAT | Qualify the NAT variant using transport port identifiers to distinguish many internal flows; this is vocabulary, not complete packet processing. |
| SCADA | Qualify industrial supervisory monitoring/control and data acquisition, with the listed sectors as examples rather than a synonym for all industrial control systems. |
| SDN | Qualify separating network control from forwarding as the SDN architectural distinction, without requiring every forwarding function to be a physical box. |
| SRTP | HOLD: encrypted transport is presented as the defining property without binding an encryption-enabled SRTP profile; RFC3711 permits the NULL cipher with no confidentiality. |
| SSH | HOLD: encrypted remote administration is categorical without binding a secure negotiated mode; RFC4253 permits the non-recommended none cipher with no confidentiality. |
| VPC | Qualify a logically isolated virtual network within a public-cloud environment; isolated describes the network boundary, not absolute security or permanent internet disconnection. |
| XDR | Qualify integrated detection/response using signals across multiple domains, with endpoints/networks/cloud as category examples rather than mandatory complete coverage in every product. |

The packet preserves each fullName/definition hash and semantic comparison. CYOD's ownership restriction conflicts with employee-owned approved-list usage. SRTP/SSH descriptions leave encryption categorical despite NULL/none parameters. Review notes do not silently repair those learner definitions. NAT qualifies at its traditional private/public use, not all address realms or firewall enforcement. VPC qualifies at logical network isolation, not physical isolation or permanent disconnection. MAM/MDM, KDC/LDAPS, NAC posture/authorization, supervisory SCADA versus all ICS, SDN control/forwarding and vendor-dependent XDR remain bounded vocabulary; no real management, network or security outcome is inferred.

All proposed/held rows retain null primary/scope/canonical-role and trusted-revision proposals, empty assessed roles, zero mastery/question/feedback/family evidence, no independence/publication/activation or owner approval. Existing supporting-node candidates have weight0; held rows have no link proposals. Broad objective tags are observed membership only. A correct expansion alone does not qualify a flawed definition.

## Source delivery, aliases and usage

Dictionary **src/App.jsx:2235** spreads ACRONYM_GLOSSARY_TERMS into GLOSSARY_TERMS. These16 object entries are not overridden. Renderer **src/App.jsx:20677**, inline formatting **src/App.jsx:20657**, matcher **src/App.jsx:20680**, entry lookup **src/App.jsx:20683** and part split **src/App.jsx:20694** normalize matched case before direct lookup; raw lowercase lookup is empty. Exact delivered full name/definition equals authored content, with no snapshot/question override. Popup text is plain and nonrecursive. Keyboard Enter/space, focus, aria expansion, toggling and outside-pointer close are source-observed; no browser interaction occurs.

**240 pure source-derived probes** cover exact/lowercase, bold/underline/highlight, punctuation, alphanumeric extensions, within-term format splits, unregistered full-name/plural aliases, Unicode/underscore boundaries, external alphanumeric text separated by formatting, and repeats. The pattern uses **ASCII alphanumeric boundaries per format segment**: éNAT and _NAT_ can match, and A**NAT**9 can match because formatting splits the text. These are observed matcher limitations, not stricter whole-word validation or a behavior fix. Three collision probes verify LDAP/LDAPS, NAT/PAT and BYOD/COPE/CYOD longest-first matching without shorter substring credit. Matching does not resolve meanings from context, and repeated links create no independent evidence.

| Glossary | Lexical source references | Local MCQ field probes | Lesson body segment probes | Plain card references |
| --- | ---: | ---: | ---: | ---: |
| glossary:byod | 5 | 3 | 0 | 1 |
| glossary:cope | 4 | 3 | 0 | 1 |
| glossary:cyod | 3 | 3 | 0 | 1 |
| glossary:kdc | 5 | 3 | 1 | 0 |
| glossary:ldaps | 2 | 0 | 0 | 0 |
| glossary:mam | 1 | 2 | 0 | 0 |
| glossary:mdm | 4 | 2 | 1 | 1 |
| glossary:nac | 5 | 7 | 0 | 0 |
| glossary:nat | 8 | 6 | 1 | 1 |
| glossary:pat | 1 | 0 | 0 | 1 |
| glossary:scada | 4 | 1 | 0 | 1 |
| glossary:sdn | 4 | 4 | 0 | 1 |
| glossary:srtp | 2 | 0 | 1 | 1 |
| glossary:ssh | 11 | 8 | 1 | 2 |
| glossary:vpc | 1 | 0 | 0 | 1 |
| glossary:xdr | 3 | 2 | 1 | 1 |

All **63 lexical reference rows** bind parent catalogue signatures/objective tags and local question revisions where present. Source-union references do not prove a tooltip was displayed/opened, approved scope, a correct answer or a new parent judgment. The glossary entry is the reviewed content; usage parents remain context only.

Question context/stem **src/App.jsx:20800** and selected options/feedback **src/App.jsx:24992**, with actual wrong-feedback/fallback helper **src/App.jsx:1140**, produce **44 matched field-group probes**. Stem splitting **src/App.jsx:20782** and actual inline formatting precede matching. Feedback requires submitted Pro context; wrong feedback also depends on the selected wrong option. Options have a disabled ancestor after submission, so popup interaction then is unverified. Parent routes/pools still determine guest/free access; GlossaryText has no own account/tier gate.

DeepDiveReadableBites **src/App.jsx:31203** and sentences **src/App.jsx:1331** produce **6 source-derived first-sentence/collapsed-detail probes**, binding each section/profile revision. Parent navigation **src/App.jsx:31239** requires selected Pro context except separately existing previews; no actual account result is claimed. **7 plain table observations** stay outside glossary delivery. Lab **src/App.jsx:30903** has plain faces without GlossaryText: **13 card references**, including the earlier held SRTP/SSH cards, gain no tooltip/content credit. PBQ prose/renderer **src/App.jsx:20765, src/App.jsx:26211** have conditional GlossaryText paths; **8 PBQ references** are bound source context only, without blanket component, premise, feedback or key approval. No raw stems/options/keys/faces, private payloads or learner identifiers are exported.

The sole glossary-delivery selector is revision-bound, remaining an unapproved intervention. No canonical routing, graded understanding, trusted mastery, post-miss recovery, storage or telemetry is demonstrated.

## Primary references and inspection limits

References support only the listed portions. Indexed-only NIST device-model/management and Cisco posture excerpts are identified; direct NIST800124r2 PDF find/open failed after the initial open. Historical implementation examples do not establish current product support, full standards conformance or deployment guarantees. Vendor descriptions supply examples, not universal marketing outcomes.

- [BYOD/COPE/CYOD deployment discussion, primary indexed excerpt](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-124r2.pdf): Personal BYOD, enterprise-issued COPE and employee-purchased approved-list CYOD; direct PDF find/open failed, not a full document audit.
- [App-data protection and benefits; wipe distinctions](https://learn.microsoft.com/en-us/intune/app-management/protection/overview): App-scope protection with/without device enrollment, product-specific conditions; not all MAM/MDM products.
- [Mobile technology and wipe examples, primary indexed excerpt](https://www.nccoe.nist.gov/publication/1800-4/VolB/): Device policy capability and conditional erasure, historical implementation example not current product support.
- [Sections1.4 and1.7 KDC glossary](https://www.rfc-editor.org/rfc/rfc4120.html): Ticket/session-key service with AS/TGS functions; authentication is separate from authorization.
- [Summary and certificate requirements](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/enable-ldap-over-ssl-3rd-certification-authority): LDAP with TLS and certificate requirements in AD example, not verified binding or authorization.
- [Authorization-policy example, primary indexed excerpt](https://www.cisco.com/c/en/us/support/docs/security/identity-services-engine-22/210523-ISE-posture-style-comparison-for-pre-and.html): Restricted remediation and policy-driven posture access, historical ISE example not universal NAC ordering.
- [Abstract; Sections4.1.1/4.1.2 and security considerations](https://www.rfc-editor.org/rfc/rfc2663.html): Traditional and general NAT, transport-identifier translation and separate firewall functions; old IPsec limitations not current recommendations.
- [Definition](https://csrc.nist.gov/glossary/term/Supervisory_Control_and_Data_Acquisition): Supervisory monitoring/control of dispersed assets; not every ICS or safe real-time operation.
- [Definition and architectural description](https://opennetworking.org/sdn-definition/): Decoupled control/forwarding and logical controller view, not deployment security or a single physical controller.
- [Abstract; Sections4.1.3 and5.1](https://www.rfc-editor.org/rfc/rfc3711.html): RTP protection profile, NULL cipher without confidentiality and default versus enabled transforms; no current deployment assessment.
- [Introduction; Section6.3](https://www.rfc-editor.org/rfc/rfc4253.html): Negotiated SSH algorithms and non-recommended none cipher; historical counterexample not a present cipher recommendation.
- [Overview and network connectivity features](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html): Logical network isolation with subnets and optional internet/peering connectivity, provider example not physical isolation.
- [Definition, components and domain comparison](https://www.microsoft.com/en-us/security/business/security-101/what-is-xdr): Cross-domain detection/response category with vendor-described examples; marketing outcomes and universal integrations not approved.

## Preserved lineage and exact arithmetic

Reconcile **88 preceding substantive packets**, exact source/census revisions and actual disposition arrays. Prior instructional occurrences409/distinct401 retain eight repeats;13 new distinct drafts yield **422/414**. Six limited links remain uncredited. Older question-only42 (30MCQ/12PBQ),22 duplicate references and seven support-only references retain prior treatment.

Preserve **46 preceding explicit held identities**, with **67 exact inherited field bindings**; three new glossary holds yield **49 unique held identities**. Compensating Control, earlier SRTP/SSH/VPN cards, excluded four glossary holds, Password/Rainbow Table and other partial-container states, all earlier semantic holds,23 unsupported PBQ design/compiler/delivery holds and seven older full-feedback gaps remain unresolved. Canonical/taxonomy/pilot/KEV/recovery/independence/component/owner/operational limits remain unchanged. Four private p003/p017 question/feedback records remain unavailable, unreviewed/null-trusted without private fetching or local substitution.

| Measure | Prior | New | Combined pending | Remaining |
| --- | ---: | ---: | ---: | ---: |
| Support /834 |390|13|403|431|
| Catalogue /1878 |1291|13|1304|574|
| Glossary /162 |98|13|111|51|
| Cards /313 |144|0|144|169|
| Containers /29 |11|0|11|18|
| Questions /483 |454|0|454|29|
| Full feedback /complete pairs /483 |447|0|447|36|

MCQ questions/pairs remain395/395; PBQ questions59/88 and pairs52/88. Held entries have been reviewed but remain outstanding for qualifying-draft accounting. **13 distinct drafts yield56 objective memberships**, not56 global credits. Objective4.1 is **136+13=149/203**,54remaining. All18 objective/by-kind/global censuses reconcile:

| Objective | Candidates | Prior | New glossary | Combined pending | Remaining local / private |
| --- | ---: | ---: | ---: | ---: | --- |
| 2.2 | 134 | 115 | 0 | 115 | 19/0 |
| 2.3 | 162 | 142 | 0 | 142 | 20/0 |
| 2.4 | 199 | 181 | 0 | 181 | 18/0 |
| 2.5 | 66 | 40 | 2 | 42 | 24/0 |
| 3.1 | 220 | 111 | 5 | 116 | 104/0 |
| 3.2 | 220 | 140 | 6 | 146 | 74/0 |
| 3.3 | 164 | 75 | 8 | 83 | 81/0 |
| 3.4 | 176 | 79 | 8 | 87 | 89/0 |
| 4.1 | 203 | 136 | 13 | 149 | 54/0 |
| 4.2 | 68 | 51 | 0 | 51 | 17/0 |
| 4.3 | 86 | 69 | 0 | 69 | 17/0 |
| 4.4 | 120 | 41 | 2 | 43 | 77/0 |
| 4.5 | 169 | 73 | 7 | 80 | 89/0 |
| 4.6 | 151 | 110 | 2 | 112 | 39/0 |
| 4.7 | 42 | 12 | 1 | 13 | 29/0 |
| 4.8 | 130 | 54 | 1 | 55 | 75/0 |
| 4.9 | 96 | 25 | 1 | 26 | 68/2 |
| 5.2 | 141 | 67 | 0 | 67 | 72/2 |

Bind **2547 total metadata memberships**, **1421 distinct objective-associated records**, **536 shared records** and **652 inherited overlap references**, with no duplicate global credit or transferred semantic approval. The full by-kind census is in the packet.

## Verification and release boundary

Run **node scripts/audit-objective41-platform-glossary.mjs** and **npm run audit:content-mapping**. The focused audit verifies16 exact definitions/display hashes,240 boundary probes, three collision probes, all usage parent revisions/surface probes,88 prior packets, inherited/new holds, all18 censuses, JSON round trip, deterministic packet/report reproduction, no runtime import, **259 bound files** and **25 unchanged protected release hashes**. **2132 adversarial packet mutations are rejected**, including stale definitions/delivery/usage, fabricated alias behavior, transferred card decisions, lost holds, false security guarantees, extra/duplicate credit, unsafe exports and trust/approval/activation escalation.

All29 mapping tests/deterministic unchanged active-package reproduction, configured [skip deploy] marker0/control1 and git diff checks precede the task-only three-file commit/push. HEAD=origin/main=remote, remote artifact byte hashes, protected25, ledger/.gitignore hashes, empty post-commit index and exact unrelated dirty entries are verified afterward. Final commit/artifact hashes are reported separately; the report cannot self-bind its own hash. Push is not live deployment evidence.

No fresh learner browser, real account/progress action, private/database read, production action, migration/deployment/activation, runtime or entitlement change, Phase3 or another slice. Owner approval, canonical roles/scope, private coverage, complete supported feedback/premise delivery, independent/calibrated learning and release/rollback gates remain open. This finite review is complete with three holds; **Phase2B-5 NOT READY**.
