# Phase 2B-5 — thirteen architecture/network card remediation proposals

Baseline **fce5e33250fc82db3236fcf0271a3532c84e6e25**. Exactly13 held sy0701-acronym cards selected from remainingCatalogueRecordIds in stored order:1 ZTA card,6 cloud-endpoint-infrastructure cards,3 network-architecture-protocols cards and3 network-wireless-attacks cards. Exact IDs and labels are asserted, with no substitution or added card. Master plan and Phase1 audit were read in full earlier in this continuous session; master plan governs approved product decisions and audit historical implementation facts. No unresolved conflict changes behavior.

**Ten exact prior drafts revalidated, two new bounded meaning revisions (OT/ICS and SDLC/SDLM), one unchanged chip SoC meaning. All13 card holds and181 global holds remain.** Twelve candidate cards change:11 meanings and3 examples, with overlap. These are LOCAL/default-off/unwired proposals, not current card qualification, human/canonical approval, publication or learner mastery.

## Root-cause groups

| Group | Selected cards | Proposal / retained limit |
|---|---|---|
| Architecture and grouped scope |ZTA; BYOD/COPE/CYOD; IaaS/PaaS/SaaS; OT/ICS; SDLC/SDLM|Resource authorization, choice/ownership, service capability/control and OT scope need explicit boundaries. New SDLC text removes a security guarantee; methodology grouping/expansion remains unapproved.|
| Identity collision |MAC; chip SoC|MAC wording needs locally assigned/randomized-address scope. Chip SoC wording is already clear. Shared labels/support nodes remain separate mapping holds; no alias, merge or split.|
| Conditional protocol protection |SRTP; SSH; VPN|Reuse profile/key/configuration qualifications and historical counterexamples. The name alone is not deployed protection, current cipher advice or a universal encrypted tunnel.|
| Attack, position and outcome |Deauthentication/disassociation; On-Path Attack; RFID/NFC cloning|Reuse scoped forged-frame/PMF and weak-reader examples; define the on-path example's forwarding position. Disconnect, plaintext visibility or a readable identifier alone does not prove the claimed follow-on result.|

## ZTA

Exact ID: `flashcard:sy0701-acronym-chapter3-architecture-resilience-acronyms-zta-zero-trust-architecture`; parent `deck:chapter3-architecture-resilience-acronyms`, ordinal 3. Source `src/data/sy0701AcronymFlashcards.js:421` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:daec4de1b4946c648b73452bef9a1623ac3751f39d4c4f2593a844d4c7bb2bd5`).

**Current meaning:** Security model based on never trust, always verify with continuous checks for users, devices, and sessions.

**LOCAL proposal:** meaning: Architecture that protects resources through explicit authentication and authorization, without granting implicit trust solely because of network location or device ownership.

**Root hold:** HOLD: never-trust/always-verify plus continuous checks does not state resource access authorization or removal of implicit trust based on network location/ownership.

**Boundary:** Authentication alone does not grant access to every resource. Existing exact draft is revalidated, without transferring card/glossary/parent approval.

Catalogue/source current→candidate `sha256:bd42662e344b45b36803fef81f7511a066d2225e53ee29666a018b0643ce35da` → `sha256:4cc965103b55036280d095b033d49a2aaccbd78b4bd79c1eabbab6a1765da227`; raw delivered card `sha256:6f143d343306dd58d31d3b3716115d69a2f8efe37bbb0dc84b3c35141a273b44` → `sha256:46e270102f7e1cd12fb8cf70872048ebed61c979a88aa92d14951d21c8ac8ab1`; meaning `sha256:2bed1de15b289a9bf7e804a996b4df7bcfd8c1e9e40ef048b4518e5d3e81ba5f` → `sha256:dd894a02213dd0826ee2dd029413212c86b51c8cefde6e6a3f3e30487e3b919b`; example null → null; mode/face projection `sha256:68e63083c53751389b2e48af1d207bf2b08535a992f35501d45c3fe14e72a283` → `sha256:8e2c1a84f0e5012ab93b0b113c4b3753813c94cf4a37fcca8f9fb38a346cede3`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:d1b9e837c2f66099abf66bc4f23a0cf8a83d28d6909a597932ee816a56a4787b` in docs/drafts/phase-2b5-architecture-cloud-decks-proposals.json. Prior draft `sha256:87bbf5120dc89a67754bfbefa566dd0c781c43ac8ddd0c02b0ea6dcddda80093` in docs/drafts/phase-2b5-first-sixteen-held-card-drafts-proposals.json. Review row `sha256:a86eefbd45f07311a7d3a4f771324db71c59acde87c9c02500d0cfadb59662a0`. Qualification prior/new/remaining0/0/1; no current hold clears.

[csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/207/final): Abstract: resource focus, no location/ownership-only implicit trust, distinct authentication/authorization.

## BYOD / COPE / CYOD

Exact ID: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-byod-cope-cyod-bring-your-own-device-corporate-owned-personally-enabled-choose-your-own-device`; parent `deck:cloud-endpoint-infrastructure`, ordinal 3. Source `src/data/sy0701AcronymFlashcards.js:378` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:df19459c5a69d7f403ba6b3600bd6fbd49981c4d73b6dafe16c9a0ffde5a9831`).

**Current meaning:** Mobile-device ownership models with different security and privacy tradeoffs.

**LOCAL proposal:** meaning: BYOD uses personally owned devices for work. COPE uses organization-owned devices with permitted personal use. CYOD offers an approved device list; ownership and funding depend on the organization's policy.

**Root hold:** HOLD: the meaning only announces different security/privacy tradeoffs; it does not distinguish personally owned work devices, corporate-owned personally enabled devices, or selection from an approved device catalogue.

**Boundary:** Selection from an approved list does not settle ownership or funding. Existing exact draft is revalidated, without transferring card/glossary/parent approval.

Catalogue/source current→candidate `sha256:2581e269f4827325a49a24e66a1c66494542bf3ed4e5ce112a1a7f0d7aed3177` → `sha256:9dd877e06136d9df67267bf3f048c0b4004c7d42cd29c5733a2e76db9e7437c4`; raw delivered card `sha256:911af755e80d5a32f72576f96cb7aba522f227fb2de05703d46735fdf4ae8126` → `sha256:20d755f27e8d0cf1066c7ae07541bad0fa58b3f46bce05ebe714b9d8027c9565`; meaning `sha256:bad4d0f74ecb42cf145441a45bedfd91018f14dfeb71e9c70b3e4c984e89b790` → `sha256:35b1aaef6b55166c5f1fd9e3da98ef1006b3a349081f306ae97a3efdf0364ab0`; example null → null; mode/face projection `sha256:a1fa7989a69aa4ca98a38e0bd0ceb792375b38b8e73ffdf5f5ebd6439f5fae82` → `sha256:d1e4785f7c607739b2e60ba1f09834d1ae1eb98be2d590ad2129c0dc84dda0f9`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:75fd7e884d81338c8417d782acedbdee3a504a78c466f73812baa01698472f23` in docs/drafts/phase-2b5-cloud-endpoint-first-cards-proposals.json. Prior draft `sha256:f1fc02e3a8a0d35ad3966003ab0dbafb7548fdcf67b6494732d75bab3effe909` in docs/drafts/phase-2b5-first-sixteen-held-card-drafts-proposals.json. Review row `sha256:078a5dfe82fc1772cc3e522983a83c63831587103731462897ac7f72b9959234`. Qualification prior/new/remaining0/0/1; no current hold clears.

[csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/124/r2/final): Earlier bound section5.1.3 CYOD evidence retained; final landing page reread, fresh PDF retrieval unavailable. No full mobile-policy audit.

## IaaS / PaaS / SaaS

Exact ID: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-iaas-paas-saas-infrastructure-platform-software-as-a-service`; parent `deck:cloud-endpoint-infrastructure`, ordinal 13. Source `src/data/sy0701AcronymFlashcards.js:388` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:61576b80c084ed41d0ffdb0975d5252c29f9e42ecf37289ca84389b1f7d28938`).

**Current meaning:** Cloud service models with different responsibility split between customer and provider.

**LOCAL proposal:** meaning: IaaS provides processing, storage and networking while customers control their operating systems and applications. PaaS provides a managed platform for customer-deployed applications. SaaS provides provider-run applications. Customer access, data and configuration responsibilities still depend on the service and agreement.

**Root hold:** HOLD: different responsibility split supplies no individual service capability or customer/provider control boundary for IaaS, PaaS and SaaS.

**Boundary:** A provider-run application does not eliminate customer access/data/configuration duties. Existing exact draft is revalidated, without transferring card/glossary/parent approval.

Catalogue/source current→candidate `sha256:281092d0216b6e856cfde999baa142be95e98d73d595f351358f398ee03cda7d` → `sha256:069da7b4287dc99fc4f7e91d3f7288b1cd7dc1e3fa0d438a6ad04f41f709d4ce`; raw delivered card `sha256:e4fa9da96f60c77da06b2ed30212d3fd5a7520596eb195cad40b3e5dae53457b` → `sha256:6544382280513c2a0e23f199ba14a3b0f2c800b97b94a3c06ca2f35ceb9c8631`; meaning `sha256:447244ee0eeb0a4695bab9c94b7aa49c6f292ff9444748262c85551b52ecab35` → `sha256:796a199a72af67a8dc379a90c01a783042e78ad5a337e05bb30b486343eeed78`; example null → null; mode/face projection `sha256:17c5cb91b9c9fcffa5a2dfe2015cd7e4572dea6d32386bfdfa677cc1a1e3ff6c` → `sha256:ad47ff3405c73d877e95b923c683506ef8ed341bbfcbbef324c626bd467cce42`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:12f77761bf3233f5e0804eda9732d877f4af172ef1b4a00e6e81a42699a426fc` in docs/drafts/phase-2b5-cloud-endpoint-first-cards-proposals.json. Prior draft `sha256:a9d38711a1f332682a12ead104ebfa208d3c0da15ec36c7b5552e1d76eec6c34` in docs/drafts/phase-2b5-first-sixteen-held-card-drafts-proposals.json. Review row `sha256:e2f87ad7cc0175f88c8079b142fdc4a531bcc2ba8fe46e76bfdfae38106c4e23`. Qualification prior/new/remaining0/0/1; no current hold clears.

[nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf): Section2 service/deployment definitions; bounded capability/control distinctions, not modern service conformance.

## MAC

Exact ID: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-mac-media-access-control-address`; parent `deck:cloud-endpoint-infrastructure`, ordinal 16. Source `src/data/sy0701AcronymFlashcards.js:391` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:be9517b7970c77041a56d1eeb67cdf50bfc6e8e60d879056f03124ea6d8bee1b`).

**Current meaning:** Unique hardware address assigned to a network interface.

**LOCAL proposal:** meaning: Address used by a network interface at the link layer. It may be assigned locally or randomized, so it is not reliable proof of a unique physical device. Here MAC refers to media access control.

**Root hold:** HOLD: calling every MAC a unique hardware address overstates permanent physical-device identity; the existing support identity also collides with Mandatory Access Control.

**Boundary:** An interface can use a locally assigned or randomized address. Existing exact draft is revalidated, without transferring card/glossary/parent approval.

Catalogue/source current→candidate `sha256:074efb8abf7f886cdcbb44244c761dbe81036353ea6878d1e6e08ee039224dc0` → `sha256:afbd624f684a1b248a11e4809d55abf11cd15cef8c6c13d9c148f582a633efe7`; raw delivered card `sha256:e46312ebec2cdb2c17bc599b628d0b3edb47dd9d72cbe52cfe10c60d4d72cdaa` → `sha256:a9062c138580201ebb772ce4791cd272dfb2aa863fc9faab775ea06106c5079b`; meaning `sha256:b23e64a970ba2753f413b16ad1ddcb05f38c9c7c279a81f03bf913ff94423cef` → `sha256:66f8ccaa50cc61c3a28908a5488c07df54cdfce2daf97fb26bc08f15f15b088a`; example null → null; mode/face projection `sha256:3e0a4c4c91ddf224547607b3698dd63577ac252e135f45f34399cfe67b385ee1` → `sha256:95a0e966759c32d99e980f0589633586bf343d799b50da7b976f92626998f55b`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:d9722179645c8d965e31f3a046efe78dcffdaa0308d9e558ae78c7f4f7cd08cd` in docs/drafts/phase-2b5-cloud-endpoint-remaining-cards-proposals.json. Prior draft `sha256:6e8eca0cb471d3e6efa47fe6d4b9ba67683afbcc6ae026ad79cffc87f0f09a37` in docs/drafts/phase-2b5-first-sixteen-held-card-drafts-proposals.json. Review row `sha256:a4f93325aeb8458b66eaa2035991ce92284f6f3b447a792c97c75e04605970ee`. Qualification prior/new/remaining0/0/1; no current hold clears.

[support.apple.com](https://support.apple.com/en-us/102509): Private/rotating Wi-Fi MAC addresses as a counterexample to fixed hardware identity; no device configuration performed.

## OT / ICS

Exact ID: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-ot-ics-operational-technology-industrial-control-systems`; parent `deck:cloud-endpoint-infrastructure`, ordinal 20. Source `src/data/sy0701AcronymFlashcards.js:395` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:ef5ca57e368ff153208db0344774bb71e776dcbe76f7179649fea3af2caebb33`).

**Current meaning:** Systems used to monitor or control physical industrial processes.

**LOCAL proposal:** meaning: OT comprises programmable systems or devices that monitor or control physical devices, processes or events. Industrial control systems are one type of OT; building automation, transport and physical access systems are other examples.

**Root hold:** HOLD: the single industrial-process meaning does not distinguish broader operational technology from industrial control systems.

**Boundary:** Building automation is an OT example beyond industrial processes. This corrects the industrial-only scope and makes the broader OT/ICS relationship explicit without approving a compound canonical skill.

Catalogue/source current→candidate `sha256:6dda077eb2cb28cbcd92a9a39bf8404fb9710e692380057192bc65578f52b45b` → `sha256:e308e4b6eb869c3d6690db71af52c2696b1b9290076be2f159a4906d53fd6f71`; raw delivered card `sha256:cde11bcb572d3897d153e92d01c8225e9d7c8aacd573fb4ca1a3aaeb0c5cf141` → `sha256:1fb78d130f6ef5537e52973a43d0e65da07527393f2f4d6307b00c30b9711ed0`; meaning `sha256:fb27d10371630f12426a5fd9f7761f851ba22fac81805902f1ffe7ed21f5e0dc` → `sha256:04ab0fa1d549a9aad1cf6e1263a8ba2d2560687466eafe714d1610d93a17ce5d`; example null → null; mode/face projection `sha256:adb50330b77c3eebf001257091c78926f2eee92175260fb441ccb7cabcccf58e` → `sha256:196ccd0373a289a3d159b8dbe8310444eb94c7f4e62d906a3a11b75204bd54be`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:e7ea71c225db4d4cdbc552ab8850be31830a1ca8fb09d27245162621e4e42722` in docs/drafts/phase-2b5-cloud-endpoint-remaining-cards-proposals.json. Review row `sha256:96be208e9cbbe980a08aec4116a13ccd0df478a633a03311e88a0718187c24bf`. Qualification prior/new/remaining0/0/1; no current hold clears.

[csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/82/r3/final): Final2023 abstract: OT programmable systems/devices interacting with physical environments; examples include ICS, building automation, transport and physical access. New draft is reviewer synthesis, not a current system security assessment.

## SDLC / SDLM

Exact ID: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-sdlc-sdlm-software-development-life-cycle-software-development-life-cycle-methodology`; parent `deck:cloud-endpoint-infrastructure`, ordinal 25. Source `src/data/sy0701AcronymFlashcards.js:400` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:809bf2ee94ca5906aee30368f08aa1121534598e4c467862d82cc03752857b15`).

**Current meaning:** Structured process for planning, building, testing, and maintaining software securely.

**LOCAL proposal:** meaning: Planning, building, testing and maintaining software follow a development life cycle. Security practices need explicit integration into that work; a lifecycle or methodology label alone does not establish secure software.

**Root hold:** HOLD: the shared process meaning does not distinguish a development lifecycle from a lifecycle methodology and implies security without explicit secure-development practices.

**Boundary:** A named lifecycle or methodology does not establish integrated secure practices. This narrows only the unsupported security guarantee. It does not validate the SDLM expansion or teach a separate methodology taxonomy.

Catalogue/source current→candidate `sha256:4721092517df51b1125b01a104169a89ecc6663e7a3abf36c6aaeb26064261f3` → `sha256:732f32238561aa6f5d511d1e38f7ee7249e7e35e398cc5d2b266729af59f3f45`; raw delivered card `sha256:638037b7bbf7aee837f567d82cbf63859f20970d3e9642922f4efe922c3d32dd` → `sha256:b7509e4c8083d8ebfcdc3e5e68c3f8ea7c36e272c1e31313a372ccc4e51aed09`; meaning `sha256:05c4f184211ab0669b8f1c6588e33fff8587e96ba75a4121893bb6118e22bb58` → `sha256:690d2fa475a3498c4c7f44a39217813d35b2e77446414ed76152f8d27131536a`; example null → null; mode/face projection `sha256:cd447fb09758c60fb7aebb7ffc5b47c50141e476ccc7d6d10b466db0b70360b9` → `sha256:4253e018d3789cda88eaee6b3d830581b5681e22d7aa72c4cce97f1543754c27`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:c53cf5bc2a8136edd4aefa5b16735f84982e716d643ec99e08838d3fd77efa67` in docs/drafts/phase-2b5-cloud-endpoint-remaining-cards-proposals.json. Review row `sha256:9caa5942de58b0de574cbcdebf90624af70b19610e96b396eebc0fc7fe6075be`. Qualification prior/new/remaining0/0/1; no current hold clears.

[csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/218/final): Final2022 SSDF1.1 abstract: secure practices usually need explicit integration into SDLC models. Does not establish a universal SDLM expansion or methodology taxonomy; grouping hold remains.

## SoC

Exact ID: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-soc-system-on-chip`; parent `deck:cloud-endpoint-infrastructure`, ordinal 29. Source `src/data/sy0701AcronymFlashcards.js:404` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:d66f10f6d9130de1100f283913a5389d447593e8fd03449d85daae8434018a5a`).

**Current meaning:** Chip that combines many computer components into one integrated circuit.

**LOCAL proposal:** Preserve the current chip meaning exactly; no content correction is warranted.

**Root hold:** HOLD SUPPORT IDENTITY ONLY: the chip definition is clear, but its existing sy0701.term.soc support node also represents Security Operations Center.

**Boundary:** Clear chip wording does not disambiguate a shared support node. The prior chip meaning remains clear; the shared support identity stays held.

Catalogue/source current→candidate `sha256:aba30d96bfc84fdd56da7c85a34da4da5d8a296e2b93be2da5162bb7f85ff6d2` → `sha256:aba30d96bfc84fdd56da7c85a34da4da5d8a296e2b93be2da5162bb7f85ff6d2`; raw delivered card `sha256:a8103147b89a1b6ea0d857dae18396851f81a73b497b280eb1d305199cc0ec41` → `sha256:a8103147b89a1b6ea0d857dae18396851f81a73b497b280eb1d305199cc0ec41`; meaning `sha256:9a4ba3dbf05f4c8e2e68dc9d037b760de348be3bcbe01b74f6247fe6d003cb0e` → `sha256:9a4ba3dbf05f4c8e2e68dc9d037b760de348be3bcbe01b74f6247fe6d003cb0e`; example null → null; mode/face projection `sha256:1114160b32a82ba735105a93c19d1d400f37cbc0fcceefcbe1b2c7f401730f92` → `sha256:1114160b32a82ba735105a93c19d1d400f37cbc0fcceefcbe1b2c7f401730f92`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:1e68321b75e8eb987a42c67ffac878cc9cef4b32cd7c81ce27b6a7e241e35b96` in docs/drafts/phase-2b5-cloud-endpoint-remaining-cards-proposals.json. Review row `sha256:13c5df29400002681fca6b5d59aa2c086fa22875f70d987075b2b00cbd3b6b6a`. Qualification prior/new/remaining0/0/1; no current hold clears.



## SRTP

Exact ID: `flashcard:sy0701-acronym-network-architecture-protocols-srtp-secure-real-time-transport-protocol`; parent `deck:network-architecture-protocols`, ordinal 20. Source `src/data/sy0701AcronymFlashcards.js:356` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:904a0d9dbb002bf81b00e2f3ccc1309bb56fd5eb539761665315cdd3439cfd67`).

**Current meaning:** Adds encryption and integrity protection to real-time voice or video traffic.

**LOCAL proposal:** meaning: An RTP security extension supporting confidentiality, message authentication and replay protection. Actual protections depend on the selected profile, transforms, keys and configuration; null encryption does not hide media.

**Root hold:** HOLD: the delivered definition asserts encryption and integrity without identifying a profile or enabled protections; the whole card leaves an unconditional guarantee ambiguous.

**Boundary:** A stipulated null-encryption transform does not hide media. Existing exact draft is revalidated, without transferring card/glossary/parent approval.

Catalogue/source current→candidate `sha256:112f12c5f2243e5b137360c0558c57d993c44009e72a470fc80a436a7089c37c` → `sha256:02a01768e313b1319e6ff6d80c725f0e8653816f6774438029cc12774a8c7679`; raw delivered card `sha256:26699a3cd756639bf9f8cb3e4cbf806a11f47145b071d203f9df4d0a69cf0c0e` → `sha256:b377b3c819c5c997a4caeb29a92f14f8c58ff6d29261ed15dc0bff388a5740cc`; meaning `sha256:1d6ef8be867bbb33e0621fc94e6c625657309c230136a97f78cd106bbd729354` → `sha256:1b74beb6d23db5a97a0beee2f6b6eb6aa9072585f633e55de62f3df288c0292f`; example null → null; mode/face projection `sha256:b42f81d19e624618dd195a4d505e2c006e831328b082cccb115b666ae897d659` → `sha256:908acd0d19e0c10b643fd5abd36c89f4777afab6a11890ef9734cff046189858`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:f7f835f7d7591c7248d29100d8af42c397d080a73e572ec3de3006222ca0cd15` in docs/drafts/phase-2b5-network-protocol-cards-remaining-proposals.json. Prior draft `sha256:726bb0e8071bb316619b48ff40474eb199a58707e0ea108e3a23e0ada8970242` in docs/drafts/phase-2b5-final-eleven-held-cards-proposals.json. Review row `sha256:ba666576bedb8b9f5e5b7e344c56adb1068ee536508960ea46f13340ddc97577`. Qualification prior/new/remaining0/0/1; no current hold clears.

[www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc3711.html): Historical SRTP sections4.1.3,9.5: null encryption and weak/null SRTP authentication distinctions; not a current algorithm recommendation.

## SSH

Exact ID: `flashcard:sy0701-acronym-network-architecture-protocols-ssh-secure-shell`; parent `deck:network-architecture-protocols`, ordinal 21. Source `src/data/sy0701AcronymFlashcards.js:357` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:9804d139e4f2b6f2184759e616ae11f7ca134c0107790a5454a1f6d6f5c9b546`).

**Current meaning:** Encrypted remote administration protocol, commonly used for command-line access.

**LOCAL proposal:** meaning: Protocol commonly used for remote command-line administration over a transport with negotiated encryption and integrity protection. Confidentiality depends on the encryption actually in use; the historical none cipher provides none.

**Root hold:** HOLD: encrypted remote administration describes the intended common SSH use, but the unqualified delivered sentence leaves negotiated confidentiality as a categorical property.

**Boundary:** The historical none cipher is not confidentiality or a recommended configuration. Existing exact draft is revalidated, without transferring card/glossary/parent approval.

Catalogue/source current→candidate `sha256:42d94d9d9309d8763e4cf6361f9b3993194d3a3ed3a8b465d7835cbccbe53f75` → `sha256:af50f743600f07bec8c26bf04031ca83a15d81ecdf83b26f7b7dcc1378263696`; raw delivered card `sha256:5cda1c751675961587c98d8bb17352e32894de6b14cd9f8469d68c88cb5e87c3` → `sha256:4dc57c62761ef976adec0845563df94af2f11face489cb5015ea53683fb00c7e`; meaning `sha256:ba5c98f20b0a137fdafaa8ea8b86a65639d76c9f72930cc58d8ccc311e83368c` → `sha256:98327b475da34ea4ce6fba605d59f3d56eb6a5283a68f1046cfdf5510c1724fd`; example null → null; mode/face projection `sha256:32403f9e7b79b45bcff3807e76cc8a0f0181b245c31c7ac8cc4e0788ed1809ed` → `sha256:52a06dbb652ce4983d7bcddd4322fbca5273108b1a3ac6960fb2625cd85013b0`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:98053402066de28c97a187ee3cb010ffcc941e335a839443b8bfcc214a52f60e` in docs/drafts/phase-2b5-network-protocol-cards-remaining-proposals.json. Prior draft `sha256:d5777baa8673bf24b749ada871232e61ad8ffa22d81aa3f1ca626f31c76a0ee5` in docs/drafts/phase-2b5-final-eleven-held-cards-proposals.json. Review row `sha256:620c2d04489a514252b9c32ee82c251ae62212eb28c5882f06ece3fd7d8bf85c`. Qualification prior/new/remaining0/0/1; no current hold clears.

[www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc4253.html): Historical section6.3 none option supplies no encryption and is not recommended; no assertion about installed clients.

## VPN

Exact ID: `flashcard:sy0701-acronym-network-architecture-protocols-vpn-virtual-private-network`; parent `deck:network-architecture-protocols`, ordinal 26. Source `src/data/sy0701AcronymFlashcards.js:362` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:0dc279c68906c1a12cace6a849b3a1aed1a6542499a18be2ea9d4475824ed13f`).

**Current meaning:** Encrypted tunnel that protects traffic across an untrusted network.

**LOCAL proposal:** meaning: A logical private network carried over shared infrastructure. Secure remote-access or site-to-site VPNs commonly use encrypted tunnels, but the generic VPN label alone does not guarantee encryption.

**Root hold:** HOLD: a generic VPN is defined as an encrypted protective tunnel, omitting legitimate VPN architectures without cryptographic privacy and the necessary secure-tunnel scope.

**Boundary:** The cited BGP/MPLS architecture lacks cryptographic privacy. Existing exact draft is revalidated, without transferring card/glossary/parent approval.

Catalogue/source current→candidate `sha256:ba9de88a25f5c00d13da887e62634ed17fa028792c53e1205e6d357af1b158e7` → `sha256:849b92fc391dcabd718b2344b885157f7736fa813d14b987964f3f410b7a391c`; raw delivered card `sha256:ff4b97cadb8648d608e20b6656673f3962f1794ca08519a3c234c2ec15cfb100` → `sha256:58a92d44931656eee1b35e6e26575696283b62a2de2727a3a552b6140a5fd766`; meaning `sha256:1c39127f1c655fdad92850441c231a79d9a0caed049531f7483d252d80f09e93` → `sha256:eb49a34cec7d557c8908115b1c10ad2b20eb1fcaa6dd18a62ba528ee57bca459`; example null → null; mode/face projection `sha256:5a17dcef7393748ffd03468295e76fa577fe6d215067e99523dd7070f54010c9` → `sha256:01727026529514ab98389287637d771646cbe7d66dd8927decde28553efe1080`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:e4b8b48689f584c6758163c01c5394fc6a7e919a6cb38343972ad5109f1747e4` in docs/drafts/phase-2b5-network-protocol-cards-remaining-proposals.json. Prior draft `sha256:0c598cfafe834a67c4c9c72f23a8847e7390ef5c8de810c0591abffae8bbe35c` in docs/drafts/phase-2b5-final-eleven-held-cards-proposals.json. Review row `sha256:516e6114a8c558d2a6fc9bd051c950be8e11eaf624fa56199d57d095e15472b4`. Qualification prior/new/remaining0/0/1; no current hold clears.

[www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc4110.html): Sections1.2 and6.5 distinguish shared VPN infrastructure and optional encryption; not a deployment security assessment.

## Deauthentication

Exact ID: `flashcard:sy0701-acronym-network-wireless-attacks-deauthentication-disassociation-deauthentication`; parent `deck:network-wireless-attacks`, ordinal 9. Source `src/data/sy0701AcronymFlashcards.js:182` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:04e83ae80ef502aadd833559206e780274d0adfd93bb0c44321877bf7ed349c3`).

**Current meaning:** Forged wireless management frames force clients to disconnect from Wi-Fi. Current example: Fake deauth frames kick a laptop off corporate Wi-Fi so it reconnects to an evil twin.

**LOCAL proposal:** meaning: In this attack context, forged deauthentication or disassociation frames attempt to terminate a Wi-Fi connection. These frames also have legitimate uses; negotiated management-frame protection can reject forgeries. example: A client without negotiated protected management frames accepts forged deauthentication frames and disconnects. This alone does not establish that it joins an evil twin.

**Root hold:** The bare term and combined disassociation/deauthentication expansion are defined only as forged frames forcing disconnects. Legitimate protocol transitions are conflated with attack traffic, and frame acceptance/protection is left unconditional.

**Boundary:** Protected management frames can reject forgeries; a disconnect does not establish evil-twin association. Existing exact draft is revalidated, without transferring card/glossary/parent approval.

Catalogue/source current→candidate `sha256:5d1b036d29a94d03a47c072994ee14efcbf02b7bab9c555ee1ad18046bc0dd5b` → `sha256:cd49e828a78cf1ba3b51ca06d90be86fc43d5fe1705de76306bd5300f30f2a78`; raw delivered card `sha256:83d2c18f194ead49fe98aba8bad66569ba6b4296ee7c3715155278e9c5979cbb` → `sha256:82672ae96366a8d997eb922b6c185d2bd0cf2f11bd1a7c945309d354614725cd`; meaning `sha256:70380cce36843aa9b475fd102aa5a2d3185e8ab58dd60aa4c9fc2fecce592a0a` → `sha256:51071e32711e2fe9a3ad234d396fa771f74e5996b0b8e7eab0fe25cb7230c467`; example `sha256:b66a538ca19f484a84d580aa9bf9756fb990bdd650e976d8a4858e05fa835a9e` → `sha256:3c393af0efa2ab9eeecc6596c60a2f969e68cc0e756262a915b4a6789626ab7b`; mode/face projection `sha256:1066d5a222c2ae2291cecb124a578f552ff8b92db74ea182ea01828f7beb986c` → `sha256:385be51a1541566f2f9266ae68b10caed5c5d5bfb1c7d1285b005c78d74dd66d`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:aea94234e08d8cfc330c6cfc384984713a69712cf3b9a20f15c13da0edd99795` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json. Prior draft `sha256:06b2259e9fc6ab77c8318336e0b8530464ed45c0ccc2ca1f24e50a9b3390199b` in docs/drafts/phase-2b5-final-eleven-held-cards-proposals.json. Review row `sha256:5c19dfd0924ad3d452c3ad51b77b543215ba87cf247fe779f4dc12296ceed093`. Qualification prior/new/remaining0/0/1; no current hold clears.

[www.cisco.com](https://www.cisco.com/c/en/us/support/docs/wireless-mobility/wireless-lan-wlan/212576-configure-802-11w-management-frame-prote.html): Implementation-specific PMF description protects deauthentication/disassociation frames; no universal attack-prevention guarantee.

## On-Path Attack

Exact ID: `flashcard:sy0701-acronym-network-wireless-attacks-on-path-attack-on-path-attack`; parent `deck:network-wireless-attacks`, ordinal 5. Source `src/data/sy0701AcronymFlashcards.js:178` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:f95e45a86fd3e8c2d81f5ea4e8b087625e3460d31acf47555b65b9c75fa1b867`).

**Current meaning:** Attacker secretly intercepts or changes communication between two parties. Current example: A coffee-shop Wi-Fi attacker reads unencrypted login traffic between a laptop and website.

**LOCAL proposal:** example: A malicious Wi-Fi gateway forwards traffic between a laptop and a website while reading the unencrypted login data passing through it.

**Root hold:** The label requires an intervening communication position, but the coffee-shop example only supplies reading plaintext traffic. A passive receiver can read exposed wireless traffic without relaying or mediating it.

**Boundary:** A passive plaintext listener need not be a forwarding intermediary. Existing exact draft is revalidated, without transferring card/glossary/parent approval.

Catalogue/source current→candidate `sha256:2c5fc5c750615d6ae939d0ed9b7e4c28fa541f50d5730301aa57f9bf499c46ae` → `sha256:d8e1f80d3040ff019796071727af0166ad2c9d012675804816b4a888153651b8`; raw delivered card `sha256:a11c287f954300c82057afe06baa1ee9516f6e7991d288d6ed916c528599cd84` → `sha256:51f81851cfc1cded60f78f7b5f776811ed2a92bc3f9e95a0e074ae24e3d4fb1d`; meaning `sha256:f8c4fa8419f4b3d6de44a1c0017106f25e605b2a880286a9aaeabd8c64383097` → `sha256:f8c4fa8419f4b3d6de44a1c0017106f25e605b2a880286a9aaeabd8c64383097`; example `sha256:d412224a4bb7518a19bc87a492f20c712828dbba12db21659d29886dccccf04d` → `sha256:0c8c769598866e9510098e0ee65d9d35621c5ed293b981ab45830b626865321d`; mode/face projection `sha256:0cb60961aa4dde324fac4b8936ab2aaa9f2ee1ce4f7f1d529a773bc838d37021` → `sha256:197868515030548f34a7d92514e1c93440c262ff3b71935a6fad3f338a624bf3`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:c3f8b4fc6c9a7c0f8b6613f483f4e1bfc36950d54c65de1fe315a04c0e9460bf` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json. Prior draft `sha256:87061f75669f39b5522cc63ecaa6211df8230d39595f6c3a4a5726a141f844e4` in docs/drafts/phase-2b5-final-eleven-held-cards-proposals.json. Review row `sha256:a745854aa646e0723c16ed65153e036cece90679469d17ae25f3d8e08a48641e`. Qualification prior/new/remaining0/0/1; no current hold clears.

[www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc3552.html): Section3.5 distinguishes attacker position from mere passive reading; gateway example is an explicit reviewer construction.

## RFID / NFC Cloning

Exact ID: `flashcard:sy0701-acronym-network-wireless-attacks-rfid-nfc-cloning-rfid-nfc-tag-cloning`; parent `deck:network-wireless-attacks`, ordinal 10. Source `src/data/sy0701AcronymFlashcards.js:183` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:44aa1fb33bd134d519de78aea88c1f660ccb4c7bec64f29c99f4b88bf4a60f07`).

**Current meaning:** Copies contactless identifiers to bypass physical access controls. Current example: A hidden scanner copies an employee badge on the subway for later building access.

**LOCAL proposal:** meaning: Replicating a contactless credential or its data to impersonate it. Copying a readable identifier bypasses access checks only where the reader relies on that identifier without effective additional authentication. example: A badge system authorizes entry using only a readable static identifier. A copied identifier presented by an emulator is accepted because the reader performs no additional credential authentication.

**Root hold:** The combined label reduces contactless credential cloning to identifier copying and implies an access bypass without identifying a vulnerable credential/reader policy. Its subway scanning illustration supplies no tag, range or authentication context.

**Boundary:** A readable identifier alone does not satisfy effective additional credential authentication. Existing exact draft is revalidated, without transferring card/glossary/parent approval.

Catalogue/source current→candidate `sha256:3a140125e6ebb27b95265001404aecc0d1ca7c3bcb4798c1906e7151c38a300d` → `sha256:6656050ceec60a44c7b7d63cc19622d4c48167385f681275e9c4fa5b6392501b`; raw delivered card `sha256:11db0751cb40f41e999f082c52cb28fe15e053c797ff172db309416b8d8a8aec` → `sha256:58113393857165635814150dad4073d28765b8e4ad5c600d27fb8b29adcbad74`; meaning `sha256:805a3b8d97c6b59433f47dc502f04a5015bd6a5debfc96a998a88497f52ff506` → `sha256:384311010eeb18c8cf40480679ee2e192484d663952ec8455cecc0a5ab050918`; example `sha256:285d136a1f707761896006e14250d9b9c9097ac97db4a64e5f09ac1a84054524` → `sha256:e1fa1145682a3b4901574f6f23bf7addc18f249b41c5392722d8331a74d5a4dc`; mode/face projection `sha256:4f3a7a0930943c45d02d1f39dc139c0d6fda93063b2019e8575fdf39935baf50` → `sha256:84ada4a2fd1ccf3b627e6d7c91097ecda0d73397381081140d0162e7458e36c6`. Per-mode front/back/static text hashes and every protected field are in the packet.

Prior hold `sha256:1ba7e08561dd1c90da6e3cafee5f853ed422d168ef7a38a47fbadb2d04d0b246` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json. Prior draft `sha256:756e1a5b01e80539a5a8c2fa414b97466fac3650c648ef87a6f934f3bd22f69b` in docs/drafts/phase-2b5-final-eleven-held-cards-proposals.json. Review row `sha256:f8a65bdb790dd32105817668f56881f2297245d9d9b615bc36c133ceb0f57c5a`. Qualification prior/new/remaining0/0/1; no current hold clears.

[www.nxp.com](https://www.nxp.com/docs/en/application-note/AN14223.pdf): UID-only authorization versus added credential authentication in a scoped EV-charging example; badge case is a reviewer analogy, not a universal contactless exploit.

## Actual faces, factory and protected fields

The exact source-derived mode, unequal-label acronym test, face and completion helpers are reused from scripts/audit-lesson-deck-containers.mjs, source unit `sha256:f2133a8259147f80d3edb1f6cd89112029c74c1c8c2de22354cfd35542c8d5d4`. The prior18-card recheck is evidence for these13 source rows and chip identity, not18 new reviews. Ten prior candidate raw/catalogue fingerprints reproduce exactly. The actual makeCard factory reproduces all13 current/candidate identities; labels, expansions, IDs, topics, card types and metadata stay unchanged. Flattening the four in-memory candidate decks retains313 IDs in source order; the300 unselected cards remain exact, and selected chip SoC also stays exact. No source file/deck is overwritten.

**39 requested-mode checks and78 current/candidate face projections** use actual deck mode availability. Three selected authored example requests produce examples;10 fall back to definition. Twelve labels satisfy the app's unequal-label acronym filter; On-Path Attack does not. This filter compares strings rather than validating linguistic acronyms. Definition mode uses meaning on the front and repeats it on the back; example mode repeats meaning as exam copy; acronym mode also displays meaning after reveal. Thus changing only an unrendered context note cannot repair an unconditional meaning. The OT/SDLC scope qualifications are placed in the delivered candidate meaning itself.

The lab renders ordinary text nodes, with no GlossaryText or dangerous HTML insertion.78 static text specimens and a hostile-string escaping control pass. Both faces exist in markup; no interactive React/browser/keyboard/screen-reader observation, event handler, rating, storage or real account is executed. Fifty-two empty/full-pass completion invariance checks pass for current/candidate cards; these are self-rating/pass observations, not independent assessment or mastered concepts. No new mastery metric or protection guarantee is inferred from reveal, repetition or a self-rating.

## Collisions, glossary matcher and source usage

Thirteen current/candidate glossary comparisons cover labels, meanings and examples. They are lexical comparisons only: a card face is not a glossary popup. Seven explicit matcher cases preserve current SoC/SOC, CYOD, SRTP, SSH and ZTA matches. Every selected source ID occurs once. Peer label/support-node collisions are bound to exact catalogue source revisions; equality does not prove equivalent meanings or approve a canonical union.

The chip card, operations-center SOC card and SOC glossary share **sy0701.term.soc**. Current chip meaning remains clear and its face/source hashes stay unchanged. The latest held glossary candidate retains exactly two operations/assurance senses and explicitly excludes chip usage. Case-insensitive SoC processor still lexically matches SOC, but the chip card lab does not invoke that tooltip. This is not a reason to call the chip meaning factually wrong, add a third glossary sense, remap a node or approve alias routing. The independent identity and contextual-usage holds remain. MAC likewise does not acquire a new canonical meaning simply because its text clarifies media access control.

The prior term-card packet and latest glossary remediation packet are fingerprinted, particularly separate ZTA/CYOD/SRTP/SSH records and SOC two-sense boundaries. Clearer card text does not clear their glossary holds or duplicate card/glossary/lesson/deck credit. No glossary dictionary, matcher or renderer is changed.

Four parent-deck projections preserve child membership/order and bind actual related-lesson/profile outputs. 2 related-target lists change under candidate text. Thirteen synthetic weak-topic contexts bind current/candidate selection IDs, with0 changed selections; inclusion is observed per row rather than assumed. Four deterministic collection checks preserve selected current/candidate starred identities, real random-builder mode rules and saved-ID hydration. These use synthetic keys/contexts and preserve-order input, not real user history, saved decks or measured random sampling. Seven source selector revisions remain exact. Any changed lexical selector output is recorded for later review, not applied, approved as an adaptive teaching link, or counted as recovery/learning evidence.

## Primary evidence, protection counterexamples and retrieval limits

The new OT draft is reviewer synthesis of the [NIST SP800-82r3 final2023 abstract](https://csrc.nist.gov/pubs/sp/800/82/r3/final), which places ICS among broader physical-environment systems. The SDLC draft uses the [NIST SP800-218 SSDF1.1 abstract](https://csrc.nist.gov/pubs/sp/800/218/final): security practices need integration into SDLC implementations. That abstract does not validate the separate SDLM expansion or supply a universal methodology taxonomy. Neither draft is an industrial security assessment or a claim of secure output.

The [NIST SP800-207 abstract](https://csrc.nist.gov/pubs/sp/800/207/final) and [SP800-145 service-model sections](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf) were refreshed for resource/authorization and capability/control boundaries. [RFC4364 section13.1](https://www.rfc-editor.org/rfc/rfc4364.html#section-13.1) was refreshed as the specific counterexample to a generic VPN encryption guarantee. Prior unchanged draft references for CYOD ownership, private MAC addresses, SRTP NULL modes, historical SSH none, negotiated management-frame protection, mediated communication and weak-reader cloning remain pinned to their earlier limited retrieval scopes; no fresh full-standard or current configuration review is claimed.

Thirteen reviewer counterexamples bind exact current/candidate card and definition-bearing face hashes. They distinguish authenticated identity from authorization, approved choice from ownership, cloud service from all responsibility, changing addresses from physical identity, industrial OT from broader OT, lifecycle labels from integrated practices, confidentiality from a protocol name, legitimate transitions from forged attacks, a listener from a forwarding intermediary and readable identifiers from effective authentication. These are source-bound semantic stress cases, **not protocol implementations, radio/cloud/network/crypto/badge tests or learner outcomes**. Negative guards protect the reviewed conditional wording; equality to reviewed prose is not a general proof of semantic truth.

An Arm glossary request returned a404 page; it supplies no chip-definition evidence. The unchanged chip decision relies on exact local authored content and the prior finite review, with no invented vendor verification. Only named abstracts/sections were inspected; no full standards conformance, current cryptographic policy, framework completion or hardware security clearance is asserted.

## Prior + new + remaining

| Measure | Prior | New current credit | Combined / total | Remaining |
|---|---:|---:|---:|---:|
| Selected cards |0|0|0/13|13 held|
| All flashcards |271|0|271/313|42|
| Glossary |150|0|150/162|12|
| Catalogue |1694|0|1694/1878|184|
| Support |748|0|748/834|86|
| Questions |463|0|463/483|20|
| Full feedback |464|0|464/483|19|
| COMPLETE pairs |456|0|456/483|27|
| Decks |14|0|14/29|15|

Draft accounting is10 prior replacements revalidated +2 new scoped meanings +1 unchanged chip review, not13 newly qualified cards. No card/glossary/lesson/deck, objective, role, family, teaching-link, trusted/mastery or canonical credit is added. All181 holds remain:13 selected cards and168 others. Of184 remaining catalogue identities,180 are held plus4 unheld private records; p036 remains carried outside remaining catalogue. 158 prior packets reconcile1694 credited identities,786 instructional occurrences/772 distinct/14 repeats,752 inherited fields,71 immediate baseline fields,490 file bindings and25 protected release hashes. Remaining arrays, census/objective/source-choice bindings, ledger, active v1/v2 helpers,447 native-supported questions and deterministic package remain exact.

## Checks, delivery and remaining decisions

Initial contract check failed because this focused audit was absent. The source citation guard follows the earlier packet's prefix-anchor convention and separately verifies full-file hashes; a prefix hash is not a full source-line hash. The implemented guard rejects **1574 altered packets**, including stale source/raw/face/matcher/neighbor/protection data, rehashed unconditional-protection row replacements, false chip-meaning errors, third SOC senses, node/role/alias remapping, erased holds, duplicate credit and private/learner exports.

No owner answer blocks this offline review. Any later canonical identity disambiguation, compound-skill separation, label/SDLM taxonomy decision, contextual glossary routing or publication requires its own reviewed contract; none is implemented or inferred. Required repository gates: deterministic focused write/recheck, syntax, all29 mapping tests plus exact package reproduction, git diff --check, actual skip-deploy exit0/control1, task-only three-file commit/push and exact remote refs/bytes. Preserve eight unrelated dirty items. The unchanged owner27-choice packet is not repeated.

No active card/runtime/learner, glossary/alias, canonical role/skill/objective/teaching approval, private/database, storage/analytics, automation, build/browser, deployment or Phase3 change. Unchanged package/lock bytes retain7 prior native advisories (critical1/high4/moderate1/low1); no fresh dependency audit or security clearance. **LOCAL card proposals complete; all13 current card holds retained; NOT READY for activation.**
