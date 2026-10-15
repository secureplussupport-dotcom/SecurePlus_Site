# Phase 2B-5 — remaining fifteen held deck cards

**Exactly 15 records reviewed in stored positions 17–31: five sound current-meaning findings, nine offline meaning corrections, one offline expansion correction and 15 context notes. All 181 current holds remain intact; no current catalogue/support/card credit.** Baseline: c4e4eb0b5a3e819a9c2bccde8c7f84ad613f2148. The master plan remains approved authority; Phase 1 audit is historical evidence. No active content, canonical decision or unresolved identity/scope concern is silently changed.

Selection is childDependencies filtered by existingHoldPreserved===true, then slice(16), from the immutable remaining-deck packet. Exactly 15 distinct IDs run from OT/ICS to TAXII. The first-half packet's exact 16 IDs and this selection are disjoint and concatenate to all 31 held dependency rows in stored order. Six parents supply membership/rendering context; other parent cards are not substantively re-reviewed.

## Exact current meanings and reviewable corrections

### 17. OT / ICS

Record: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-ot-ics-operational-technology-industrial-control-systems`. Parent: `deck:cloud-endpoint-infrastructure`; authored ordinal 20 (zero-based).

**Current expansion:** Operational Technology / Industrial Control Systems

**Current meaning:** Systems used to monitor or control physical industrial processes.

**Current disposition:** Current text hold retained; offline correction reviewed.

**Retained hold:** HOLD: the single industrial-process meaning does not distinguish broader operational technology from industrial control systems.

**Offline replacement meaning:** OT includes technology that monitors or controls physical processes and devices. ICS is OT used specifically to control industrial processes.

**Context note:** OT is broader than industrial control; the industrial examples are not its entire scope. No process operation, safety or security result is established.

Source: `src/data/sy0701AcronymFlashcards.js:395`; current raw `sha256:cde11bcb572d3897d153e92d01c8225e9d7c8aacd573fb4ca1a3aaeb0c5cf141`; current catalogue/published `sha256:6dda077eb2cb28cbcd92a9a39bf8404fb9710e692380057192bc65578f52b45b`. Review projection raw `sha256:b8ac15fdc20c87fa6d1d59e9ca5704898ea7933fa7d047b37392995797d59505`; catalogue `sha256:b2eabb3077248fc721d5f08adf7a3558d8d0dd05bcef7107db03af05755d3457`; complete review `sha256:9bc13af04b7906083b0b1d7199d6da754bad3b9a9b6f08e929e13ad95dfb5be1`. [Primary reference](https://csrc.nist.gov/pubs/sp/800/82/r3/final)

Current full-record hold unresolved; zero current/parent/canonical credit.

### 18. SDLC / SDLM

Record: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-sdlc-sdlm-software-development-life-cycle-software-development-life-cycle-methodology`. Parent: `deck:cloud-endpoint-infrastructure`; authored ordinal 25 (zero-based).

**Current expansion:** Software Development Life Cycle / Software Development Life-Cycle Methodology

**Current meaning:** Structured process for planning, building, testing, and maintaining software securely.

**Current disposition:** Current text hold retained; offline correction reviewed.

**Retained hold:** HOLD: the shared process meaning does not distinguish a development lifecycle from a lifecycle methodology and implies security without explicit secure-development practices.

**Offline replacement meaning:** An SDLC describes the software lifecycle. With the authored SDLM label here, a lifecycle methodology organizes how those activities are carried out. Security requires explicit secure-development practices throughout.

**Context note:** SDLM is retained as this source's supplied expansion, not verified as a universal standard acronym. The proposed distinction is contextual; naming a lifecycle or methodology does not make software secure.

Source: `src/data/sy0701AcronymFlashcards.js:400`; current raw `sha256:638037b7bbf7aee837f567d82cbf63859f20970d3e9642922f4efe922c3d32dd`; current catalogue/published `sha256:4721092517df51b1125b01a104169a89ecc6663e7a3abf36c6aaeb26064261f3`. Review projection raw `sha256:0f68042aacc112f801b401095e9022ef109d24b79b8b1d8b0afc4a678a44001a`; catalogue `sha256:03dd9beb64f2a794ccaf9dec18dad2b0f53e9b6e901630f6d4e6ef5823f9af98`; complete review `sha256:ab564d525e47f8806abe1b13d327f954d3c5c6b725a329444dc19d6f8b3a1126`. [Primary reference](https://csrc.nist.gov/pubs/sp/800/218/final)

Current full-record hold unresolved; zero current/parent/canonical credit.

### 19. SoC

Record: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-soc-system-on-chip`. Parent: `deck:cloud-endpoint-infrastructure`; authored ordinal 29 (zero-based).

**Current expansion:** System on Chip

**Current meaning:** Chip that combines many computer components into one integrated circuit.

**Current disposition:** Sound bounded current meaning; identity/placement hold retained. No text replacement.

**Retained hold:** HOLD SUPPORT IDENTITY ONLY: the chip definition is clear, but its existing sy0701.term.soc support node also represents Security Operations Center.

**Context note:** The current chip definition is sound introductory naming content. Its shared sy0701.term.soc support node and case-insensitive glossary collision with Security Operations Center remain held; no text replacement or node split.

Source: `src/data/sy0701AcronymFlashcards.js:404`; current raw `sha256:a8103147b89a1b6ea0d857dae18396851f81a73b497b280eb1d305199cc0ec41`; current catalogue/published `sha256:aba30d96bfc84fdd56da7c85a34da4da5d8a296e2b93be2da5162bb7f85ff6d2`. Review projection raw `sha256:a8103147b89a1b6ea0d857dae18396851f81a73b497b280eb1d305199cc0ec41`; catalogue `sha256:aba30d96bfc84fdd56da7c85a34da4da5d8a296e2b93be2da5162bb7f85ff6d2`; complete review `sha256:df000631cff0957ae8b00560742543b0a4304cd85255ac877a48d781a08ccd43`.

Current full-record hold unresolved; zero current/parent/canonical credit.

### 20. Side-Loading

Record: `flashcard:sy0701-acronym-cloud-mobile-hardware-attacks-side-loading-side-loading`. Parent: `deck:cloud-mobile-hardware-attacks`; authored ordinal 1 (zero-based).

**Current expansion:** Side-Loading

**Current meaning:** Installs apps from untrusted sources outside approved app stores.

**Current disposition:** Current text hold retained; offline correction reviewed.

**Retained hold:** The definition makes untrusted sourcing part of side-loading itself. Off-store installation may also use a legitimate developer or enterprise source; the malicious example does not repair that universal trust inference.

**Offline replacement meaning:** Installing an app outside the platform's official app-store distribution path. This may be authorized enterprise or developer distribution or an untrusted download; the path alone does not establish trust or malice.

**Context note:** The existing APK/adware example remains an illustrative malicious case. Legitimate off-store enterprise/developer distribution defeats the current universal untrusted-source implication. The authored attack cardType, deck placement and attack-name captions remain unchanged and require separate review; no installation is performed.

Source: `src/data/sy0701AcronymFlashcards.js:298`; current raw `sha256:f616982f5f53add25177903d412fe3af758d178921fdf461ac75268909ad9797`; current catalogue/published `sha256:db602a1eb68aea22d4d1c4063afa43fc539435b6fc2ba97122152ab1b8d83f7d`. Review projection raw `sha256:01f7bbafa9085232b8a471842f3a28907dfa87e72a91f920dd01354e41b4e324`; catalogue `sha256:5d441e525dcebc418a832107f26c64d9a8392a7a2e6b0decd249dab1e2bc6796`; complete review `sha256:67407b6b3059a41b663df3a1c83cdcf475e53d11e7c1fed9b96965bdb86be05c`. [Primary reference](https://developer.android.com/distribute/marketing-tools/alternative-distribution)

Current full-record hold unresolved; zero current/parent/canonical credit.

### 21. CTF

Record: `flashcard:sy0701-acronym-risk-governance-business-ctf-capture-the-flag`. Parent: `deck:risk-governance-business`; authored ordinal 8 (zero-based).

**Current expansion:** Capture the Flag

**Current meaning:** Interactive security challenge format used for training, practice, and awareness activities.

**Current disposition:** Sound bounded current meaning; identity/placement hold retained. No text replacement.

**Retained hold:** HOLD SCOPE, not factual rejection: no privacy/compliance or agreement/governance responsibility is taught in this short card. The broad inherited deck5.4 tag supplies no such relationship; precise placement/usefulness needs owner review.

**Context note:** The current definition soundly identifies a security challenge format. It does not teach privacy/compliance or establish the inherited governance placement, training effectiveness, mastery or a precise objective.

Source: `src/data/sy0701AcronymFlashcards.js:625`; current raw `sha256:1507eca410b81cb99b2a0c8b718cd211feaacb42968056a5457a8b89cff63f48`; current catalogue/published `sha256:2fffa03c7febc5312c0977e35d6a1bfa0d65193dea19ddc1a553ca5ce31933c4`. Review projection raw `sha256:1507eca410b81cb99b2a0c8b718cd211feaacb42968056a5457a8b89cff63f48`; catalogue `sha256:2fffa03c7febc5312c0977e35d6a1bfa0d65193dea19ddc1a553ca5ce31933c4`; complete review `sha256:e450337707769a9c8652236fd638e116dcb570b2a0ef3d70cddb4468d8cae418`.

Current full-record hold unresolved; zero current/parent/canonical credit.

### 22. ISP

Record: `flashcard:sy0701-acronym-risk-governance-business-isp-internet-service-provider`. Parent: `deck:risk-governance-business`; authored ordinal 14 (zero-based).

**Current expansion:** Internet Service Provider

**Current meaning:** Organization that provides Internet connectivity.

**Current disposition:** Sound bounded current meaning; identity/placement hold retained. No text replacement.

**Retained hold:** HOLD SCOPE, not factual rejection: this connectivity definition alone supplies no privacy/compliance, supplier assurance, service agreement or governance decision. Inherited tags do not establish the needed relevance.

**Context note:** The current definition soundly identifies a connectivity provider. Supplier assurance, service obligations, resilience and privacy/compliance are not taught merely by the name; placement remains held.

Source: `src/data/sy0701AcronymFlashcards.js:631`; current raw `sha256:9f77385c68bb26bae6cd28a5989cb29852fcce16b59e4d60c0daaaf3e0d456aa`; current catalogue/published `sha256:9b31bbfa7656ebff135fc013b29327d63f48cc2f14603634c4f9113cf81c6719`. Review projection raw `sha256:9f77385c68bb26bae6cd28a5989cb29852fcce16b59e4d60c0daaaf3e0d456aa`; catalogue `sha256:9b31bbfa7656ebff135fc013b29327d63f48cc2f14603634c4f9113cf81c6719`; complete review `sha256:b67da36ede310de90929fffd377f9cab6a029fee15a75fd32cf3fe6cdf85f3cb`.

Current full-record hold unresolved; zero current/parent/canonical credit.

### 23. MOA / MOU

Record: `flashcard:sy0701-acronym-risk-governance-business-moa-mou-memorandum-of-agreement-memorandum-of-understanding`. Parent: `deck:risk-governance-business`; authored ordinal 15 (zero-based).

**Current expansion:** Memorandum of Agreement / Memorandum of Understanding

**Current meaning:** Documents that define cooperation and shared responsibilities between organizations.

**Current disposition:** Current text hold retained; offline correction reviewed.

**Retained hold:** HOLD PARTIAL GROUP: only a generic shared purpose is supplied; no contextual distinction or explicit organization-specific equivalence is taught. Primary agency examples sometimes use these titles interchangeably, so do not invent a universal binding/non-binding divide. Owner must define the intended contextual grouping or supply distinct meanings.

**Offline replacement meaning:** For this study collection, MOA and MOU are grouped as cooperation memoranda. The issuing organization's defined usage and each document's actual terms determine its commitments; the title alone does not establish legal force.

**Context note:** This proposes an explicit study grouping, not universal legal equivalence or a binding/nonbinding rule. An owner must still approve the intended usage; no agreement, payment authority or legal effect is assessed.

Source: `src/data/sy0701AcronymFlashcards.js:632`; current raw `sha256:9458e90d7607a50ddd0841d10b5c0d52b7bf4c944fe5a5afe50923d28fc10c44`; current catalogue/published `sha256:9812bdefab19f41a186ea67d0df9a2f7be701635c28de1f00cb033714af5445a`. Review projection raw `sha256:ad2c2a8420e9170433824c89bb69a45c38c90bd6f3e547e766c819e075e89d55`; catalogue `sha256:1fe7a0e7c13c0150ed832dc1a75a7aa387016c27fd54ac05b0137933b9196721`; complete review `sha256:49269902504acdd70af4f4ec57cd4ddbfd93f3272bc7f2b1d867385cffbf3e55`. [Primary reference](https://www.usgs.gov/survey-manual/50026-domestic-memorandum-understanding)

Current full-record hold unresolved; zero current/parent/canonical credit.

### 24. OID

Record: `flashcard:sy0701-acronym-risk-governance-business-oid-object-identifier`. Parent: `deck:risk-governance-business`; authored ordinal 22 (zero-based).

**Current expansion:** Object Identifier

**Current meaning:** Unique identifier used to name objects in systems such as PKI, SNMP, and directories.

**Current disposition:** Sound bounded current meaning; identity/placement hold retained. No text replacement.

**Retained hold:** HOLD SCOPE, not factual rejection: naming in PKI/SNMP/directories alone does not teach compliance/governance or agreement decisions. OID allocation does not prove certificate trust, access authority or security. Precise instructional placement remains unresolved.

**Context note:** The current definition is sound naming vocabulary in its technical examples. Identifier assignment does not prove certificate trust, security authority or relevance to governance/compliance; placement remains held.

Source: `src/data/sy0701AcronymFlashcards.js:639`; current raw `sha256:c2be378fc35f473a6023a36caf5ad308bcf29554535ec9cf6a8a42461ae4379c`; current catalogue/published `sha256:2ffab2c220e2296461e9ba32c5fb41090ea90ce03ab16c47520a380648aa0813`. Review projection raw `sha256:c2be378fc35f473a6023a36caf5ad308bcf29554535ec9cf6a8a42461ae4379c`; catalogue `sha256:2ffab2c220e2296461e9ba32c5fb41090ea90ce03ab16c47520a380648aa0813`; complete review `sha256:ba98428d42b402e102836f6efd3b52bae5f68af91daa43e6119e9577d7fb908e`. [Primary reference](https://www.rfc-editor.org/rfc/rfc2578)

Current full-record hold unresolved; zero current/parent/canonical credit.

### 25. PHI

Record: `flashcard:sy0701-acronym-risk-governance-business-phi-protected-health-information`. Parent: `deck:risk-governance-business`; authored ordinal 24 (zero-based).

**Current expansion:** Protected Health Information

**Current meaning:** Health information that can identify a person.

**Current disposition:** Current text hold retained; offline correction reviewed.

**Retained hold:** HOLD: the isolated meaning supplies identifiability but not the HIPAA covered-entity/business-associate context or relevant exclusions. A learner could classify all identifiable health data as PHI. This judgment comes from the card itself; the separate held glossary does not automatically hold it and neighboring HIPAA wording cannot repair it. No real record or legal applicability is classified.

**Offline replacement meaning:** Under HIPAA, individually identifiable health information held or transmitted by a covered entity or its business associate, subject to defined exclusions.

**Context note:** Reuse the exact earlier offline PHI glossary candidate with a separate card binding. Identifiable health information alone does not establish HIPAA scope, and defined exclusions remain relevant. No real records classified.

Source: `src/data/sy0701AcronymFlashcards.js:641`; current raw `sha256:81a9a548a928c70a00a4a54eb6bb6f1172bff91b7f1b6fa1ebb6185c1bce9b03`; current catalogue/published `sha256:686e91e27a2d783eff72f191009785f5a179e773abfb67d1139e7ac2ab9487b7`. Review projection raw `sha256:579a2fc51fb22faef84eaafbb469e7d3e641e316a31de4b24de46308c8080bb3`; catalogue `sha256:ed3514c22f040f676f625aa0fb3222e0b87ace6b62f9a9ab5964f186cd4a4ebd`; complete review `sha256:b810c3a5cd1469326a594203d6a54ff04644be3e36693aa43a9ff4ae186d561d`. [Primary reference](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html)

Current full-record hold unresolved; zero current/parent/canonical credit.

### 26. CIO / CSO

Record: `flashcard:sy0701-acronym-security-operations-response-cio-cso-chief-information-officer-chief-security-officer`. Parent: `deck:security-operations-response`; authored ordinal 1 (zero-based).

**Current expansion:** Chief Information Officer / Chief Security Officer

**Current meaning:** Senior leaders responsible for IT direction and security risk.

**Current disposition:** Current text hold retained; offline correction reviewed.

**Retained hold:** HOLD: the shared senior-leader statement lists IT direction and security risk without assigning duties to CIO versus CSO.

**Offline replacement meaning:** Commonly, a CIO leads the organization's IT strategy and services, while a CSO leads its security function. That function's physical, information or other scope depends on the organization.

**Context note:** CIO and CSO responsibilities may overlap and vary; CSO is not silently renamed CISO. This is a common role distinction, not a universal organization chart, legal assignment or new canonical skill.

Source: `src/data/sy0701AcronymFlashcards.js:523`; current raw `sha256:9a13f7dca8fa5c8b5c816cd01df1b26b89c280b89d0393220c703d1df4912c84`; current catalogue/published `sha256:7556fc3e41e5119100293d3a7e5bf35ea58b610c486246f1f542281f771fac2b`. Review projection raw `sha256:7a0b30ea3e97135683203b52c29dcc9da4dd689ede5d82513d29dafaffcf7d7e`; catalogue `sha256:d28c5aa06ecb824d6dc89ab49d402289c23e66ec5443dade115f1c1dbdea1b8d`; complete review `sha256:26632a668b2198fc2819c96fa3411a98a4839af21ba2a6c9f7a1fe50af6d4374`. [Primary reference](https://csrc.nist.gov/glossary/term/chief_information_officer)

Current full-record hold unresolved; zero current/parent/canonical credit.

### 27. SOC

Record: `flashcard:sy0701-acronym-security-operations-response-soc-security-operations-center`. Parent: `deck:security-operations-response`; authored ordinal 16 (zero-based).

**Current expansion:** Security Operations Center

**Current meaning:** Central team or function that monitors, detects, and responds to security events.

**Current disposition:** Sound bounded current meaning; identity/placement hold retained. No text replacement.

**Retained hold:** HOLD SUPPORT IDENTITY ONLY: the operations-center definition is clear, but sy0701.term.soc also merges the distinct chip SoC and multi-meaning held glossary.

**Context note:** The current center definition is sound as a monitoring/detection/response function. The chip SoC and multi-meaning glossary share the observed support identity; definition clarity does not resolve that identity hold.

Source: `src/data/sy0701AcronymFlashcards.js:538`; current raw `sha256:175d6e21fa343e8d2624f10cc74f18be878943b6a559b6a35d0e3290d2b4e713`; current catalogue/published `sha256:40681b5924386a681fdcab479da754164b95a1bfdf5ba60b1ac639d56bbeae26`. Review projection raw `sha256:175d6e21fa343e8d2624f10cc74f18be878943b6a559b6a35d0e3290d2b4e713`; catalogue `sha256:40681b5924386a681fdcab479da754164b95a1bfdf5ba60b1ac639d56bbeae26`; complete review `sha256:c0450c9417ac6cf60d3f73e320532e9a0b176de3a2a8c7a505ad43045d45149e`. [Primary reference](https://www.microsoft.com/en-us/security/business/security-101/what-is-a-security-operations-center-soc)

Current full-record hold unresolved; zero current/parent/canonical credit.

### 28. Phishing

Record: `flashcard:sy0701-acronym-social-engineering-attacks-phishing-phishing`. Parent: `deck:social-engineering-attacks`; authored ordinal 0 (zero-based).

**Current expansion:** Phishing

**Current meaning:** Broad message-based attempt to trick users into revealing information or taking unsafe action.

**Current disposition:** Current text hold retained; offline correction reviewed.

**Retained hold:** The mass-message example is consistent with bulk phishing, but broad in the definition can be read as excluding targeted variants.

**Offline replacement meaning:** Deceptive electronic messages designed to induce disclosure of sensitive information or unsafe action. Phishing can be mass-distributed or targeted; spear phishing and whaling are targeted variants.

**Context note:** The existing mass-message example is preserved as one phishing case. Recipient breadth is not the umbrella definition; direction changes and example recall do not establish independent detection skill.

Source: `src/data/sy0701AcronymFlashcards.js:259`; current raw `sha256:b7bbba7c63d97d0d77fe20db19dade958b5502a1166378141e1a98c69ab3b7f7`; current catalogue/published `sha256:154e5fa68f0043e425d424d0b300b00133914c1473208a497b1336b03c861a61`. Review projection raw `sha256:b0d94d681007ba95ca811d3b28ddfe8acc516cdfaf29adb1186c1aca84a53e7b`; catalogue `sha256:945f35ca15146bbb54c979d83b66a8909ceb084a18467d1e4a05c2aa2eaae0e1`; complete review `sha256:e88f8647b8e6dd54a99c822669279a74fad0addbd47fd1c61dcc213b10f9f906`. [Primary reference](https://csrc.nist.gov/glossary/term/phishing)

Current full-record hold unresolved; zero current/parent/canonical credit.

### 29. Tailgating

Record: `flashcard:sy0701-acronym-social-engineering-attacks-tailgating-tailgating-piggybacking`. Parent: `deck:social-engineering-attacks`; authored ordinal 12 (zero-based).

**Current expansion:** Tailgating / Piggybacking

**Current meaning:** Follows an authorized person into a restricted area without using credentials.

**Current disposition:** Current text hold retained; offline correction reviewed.

**Retained hold:** The attacker example suggests unauthorised following entry, but the definition only requires following without credentials and can include legitimate escorted entry.

**Offline replacement meaning:** Unauthorized entry into a restricted area by following an authorized person through its access boundary. A legitimately authorized escorted visitor is not an attacker merely because they did not present separate credentials.

**Context note:** This is the supplied following-entry attack sense of the Tailgating/Piggybacking label. Terminology and escort policies vary; a person noticing or allowing entry does not by itself establish authorization.

Source: `src/data/sy0701AcronymFlashcards.js:271`; current raw `sha256:44838e93a4f8f239e869b58a4606437479ca01b496ca06f1465e9f69458d3371`; current catalogue/published `sha256:b2cdc6db442358b5334c3a76277cf94938d8456bd1f5c7a15ab6e04cebacb2f8`. Review projection raw `sha256:a6a0a59814b92bc106202defefbf9cf38a02036f62d6e0306ef1f8ad351acf27`; catalogue `sha256:bb2f56071758a2b0544d6df6ba402dd9ee67f9f4af6e3ba148ea22654718a188`; complete review `sha256:944bcac3f805e22a2935ed2d8f5879ac7862d2f2ae3e612ae5e2a50f4417bc23`.

Current full-record hold unresolved; zero current/parent/canonical credit.

### 30. DKIM

Record: `flashcard:sy0701-acronym-threat-intel-protection-dkim-domainkeys-identified-mail`. Parent: `deck:threat-intel-protection`; authored ordinal 3 (zero-based).

**Current expansion:** DomainKeys Identified Mail

**Current meaning:** Email signature method that helps prove a message was authorized by a domain.

**Current disposition:** Current text hold retained; offline correction reviewed.

**Retained hold:** The authorization wording leaves the signing domain and purported author insufficiently separated. A valid signature establishes a domain responsibility claim under its key, not approval by the visible sender or a trustworthy human.

**Offline replacement meaning:** Email-signature mechanism in which the signing domain claims responsibility for a message. A valid signature verifies covered content under that domain's key; it does not authenticate the visible From author or prove the message safe.

**Context note:** The signing-domain responsibility claim is distinct from the purported author. Covered content, key/DNS trust and signature validity do not establish truth, recipient authorization, From-author identity or message safety. No email verified.

Source: `src/data/sy0701AcronymFlashcards.js:317`; current raw `sha256:50d76d47800d485acc058d32852c1c988a03b74c51698ecb06b663660260381c`; current catalogue/published `sha256:767b84b54f4546f04c7ac23f868e940a12db217799b67bc31d536e106696bff9`. Review projection raw `sha256:13967f9adf638c7f2dedd5d3a8ec9db08177e279428d0958c0aa5a5b0ad5749c`; catalogue `sha256:0c858f14ae2e8ef2da6cb75d67306ce5b2c62741f7712f0df8d170d6030a25b9`; complete review `sha256:f28b307f658d1b4fed94f6b7b7a70dfafd97e95bc520b1f49fe3f1f1f96324eb`. [Primary reference](https://www.rfc-editor.org/rfc/rfc6376)

Current full-record hold unresolved; zero current/parent/canonical credit.

### 31. TAXII

Record: `flashcard:sy0701-acronym-threat-intel-protection-taxii-trusted-automated-exchange-of-indicator-information`. Parent: `deck:threat-intel-protection`; authored ordinal 8 (zero-based).

**Current expansion:** Trusted Automated eXchange of Indicator Information

**Current meaning:** Protocol used to exchange STIX threat intelligence.

**Current disposition:** Current text hold retained; offline correction reviewed.

**Retained hold:** The expansion retains Indicator Information, while TAXII2.1 names Intelligence Information. With no version or historical qualification, acronym recall would reinforce an ambiguous version boundary.

**Offline replacement expansion:** Trusted Automated eXchange of Intelligence Information

**Context note:** The corrected expansion is scoped to TAXII2.1; the current STIX-exchange meaning remains a sound common use, not an exclusive format claim. Changing expansion changes the factory-generated card ID, so identity compatibility remains unresolved before any publication.

Source: `src/data/sy0701AcronymFlashcards.js:322`; current raw `sha256:d8e9e3e83fe46e80a56e6fd803689cd528187859db8052239691818924b95c9c`; current catalogue/published `sha256:1028c249d0e4475d993d05a805e6bf47724553b4261e5a3733a2ab0ae8b96e94`. Review projection raw `sha256:f53beca12490bf0ebaffc24c8df4f6ea32c432a0b08b2473b8d0cef968c73496`; catalogue `sha256:846b76771ad1260ad3eded5707ddceadffd9f216d01ff9e2038d2840f690351c`; complete review `sha256:e5056400b723b4d426e25c93b9ce5e1c91d9c144a7305385619d4fce426a941f`. [Primary reference](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html)

Current full-record hold unresolved; zero current/parent/canonical credit.

## Narrow meaning findings and retained semantic holds

SoC and SOC already provide clear chip and security-operations-center meanings. Their distinct raw/catalogue revisions remain bound, but both use the observed sy0701.term.soc support identity and resolve to the same glossary entry under case-insensitive matching. Capitalization does not resolve this mapping; no identity split, glossary alias or parent approval is added. They qualify only as bounded meaning findings, not fully mapped teaching records.

CTF, ISP and OID already describe a challenge format, connectivity provider and technical identifier. Their current text remains untouched; it does not establish the governance/privacy/compliance relationship implied by inherited placement/tags. Generic naming does not become training effectiveness, supplier assurance, certificate trust or a precise objective. The three scope holds remain, with no new full-record credit. The other ten rows have concrete offline text corrections, rather than an invented error in these five definitions.

OT/ICS now separates broader physical-process/device technology from industrial control. SDLC/SDLM separates lifecycle from organizing methodology and removes inherent-security wording, while retaining SDLM as the source's supplied expansion pending terminology approval. Side-loading separates distribution channel from trust. MOA/MOU proposes an explicit study grouping without a universal binding/nonbinding rule. PHI reuses the bound earlier glossary candidate with its HIPAA scope/exclusions. CIO/CSO assigns the IT and security functions while preserving organizational variation. Phishing includes both broad and targeted campaigns. Tailgating uses unauthorized entry rather than credential absence. DKIM separates signing-domain responsibility from the purported visible author. These are bounded editorial candidates, not implemented operations, legal classifications or measured learning outcomes.

## TAXII expansion and generated identity

TAXII's existing STIX-exchange meaning is a sound common use; the changed field is expansion alone, scoped to TAXII2.1 Intelligence Information. The source still has Indicator Information without a version. A meaning-only contextual note leaves that old expansion on the actual acronym-mode back; the focused source-face counterexample demonstrates this. Correcting the expansion repairs that offline recall text but changes the ID generated by the existing source factory.

- Current factory ID: `sy0701-acronym-threat-intel-protection-taxii-trusted-automated-exchange-of-indicator-information`.
- Corrected factory ID observed in the pure projection: `sy0701-acronym-threat-intel-protection-taxii-trusted-automated-exchange-of-intelligence-information`.
- No new catalogue/trusted/canonical record, migration or alias is created or approved. Original ID remains an offline review anchor only; identity compatibility is an explicit unresolved publication prerequisite.

The candidate raw/catalogue fingerprints with the original ID describe review projections. The separately bound factory-output fingerprint includes the generated ID change. They must not be treated as an installed, ID-preserving factory patch. The other fourteen records retain factory IDs; only ten cards have text differences, consisting of nine meaning fields and one expansion field.

## Actual source delivery and downstream comparison

The existing sourceUnit, factory, mode and front/back helpers are reused. All 15 raw and flattened catalogue/published revisions, ordinals, expansion/meaning/field revisions, source lines and parent membership hashes are verified. Current code uses plain text card faces rather than recursive GlossaryText; lexical glossary references stay separately bound and receive no repair/credit from a card draft.

There are 60 current/review mode comparisons and 66 face/static text-node projections: 33 current plus 33 review projections. Thirty requested definition/acronym faces plus three authored-example faces are projected on each side. The real-acronym helper is the existing label-versus-expansion inequality, not a semantic certificate that a label is an abbreviation; equal-label names can fall back to definition-first faces. Only the three selected attack cards have authored examples. Their source text/fronts are unchanged while definition copy is clarified; the same examples are not new scenarios or independent evidence. Three caption bindings also preserve the actual Guess the full attack name / Full attack name labels. For Side-Loading, the neutral distribution definition does not repair the authored attack cardType, attack-deck placement or those captions; that semantic/placement issue remains within its existing hold. No caption/placement approval is inferred. One hostile synthetic markup/ampersand/quote escaping check passes.

These checks execute source field expressions and render text nodes, not the complete React component or live browser/keyboard/screen-reader flow. Context notes are offline metadata and are not automatically delivered on the current two faces. Relevant boundaries appear in the replacement text; future publication must assess any necessary note delivery. Guest/free native study, account/Pro related-lesson action, self-rating/Again completion, saved/native-ID collisions and the default-off/unwired specimen retain their previous limits. No state, sync, share, storage, analytics or learner handler runs.

The actual related-lesson selector compares current parents with projections containing only this slice's text changes; earlier first-half drafts are not silently merged. All unselected members retain exact current values. **0 of six ordered target lists change.** This is a text/chapter/objective similarity result, not validated routing. Both lists pin current lesson revisions and any existing holds, with zero teaching-link/parent approval. The threat-tool parent is explicitly an old-ID review projection, not the final factory publication state.

| Changed parent | Current ordered targets | Review projection targets |
|---|---|---|
| None | All six ordered lists | Unchanged in these review projections |

No change in a suggestion list proves correctness either. Source matching does not resolve held conceptual identities, placement, entitlements or underlying teaching quality.

## Primary reference and retrieval scope

- [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/82/r3/final): Abstract: OT includes industrial control and other physical monitoring/control systems; no industrial operation or safety audit.
- [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/218/final): Abstract: SDLC models need explicit secure-development practices. Does not establish SDLM as a universal acronym.
- [developer.android.com](https://developer.android.com/distribute/marketing-tools/alternative-distribution): Website/private-enterprise distribution example; distribution path does not establish maliciousness or compliance. No APK or device action.
- [www.usgs.gov](https://www.usgs.gov/survey-manual/50026-domestic-memorandum-understanding): Earlier bound agency naming example retained; fresh body/find retrieval unavailable. Candidate explicitly proposes study grouping, not universal legal equivalence.
- [www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc2578): Sections3.5–3.6 object naming/registration in SMIv2; not trust, certificate validation or governance placement.
- [www.hhs.gov](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html): Covered-entity/business-associate context and exclusions in What Information is Protected; no legal classification of real data.
- [csrc.nist.gov](https://csrc.nist.gov/glossary/term/chief_information_officer): Scoped government IT-management definition. Common CSO contrast is bounded; DHS current PDF/page unavailable beyond primary indexed role excerpt.
- [www.microsoft.com](https://www.microsoft.com/en-us/security/business/security-101/what-is-a-security-operations-center-soc): Monitoring/detection/response function and managed-center context only; no vendor benefit, compliance or effectiveness claim adopted.
- [csrc.nist.gov](https://csrc.nist.gov/glossary/term/phishing): Deceptive electronic solicitation without a bulk-recipient requirement. Targeting distinction also retains the earlier separately reviewed spear-phishing context.
- [www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc6376): Abstract: signing-domain responsibility versus purported author, cryptographic signature and key lookup; no complete/current-algorithm or message assessment.
- [docs.oasis-open.org](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html): TAXII2.1 Introduction/terminology Intelligence Information expansion and STIX/other-content section; no claim of newest version or installed feed.

Only targeted primary passages/abstracts and explicitly limited indexed evidence were used. Some initial guessed URLs were unavailable; full USGS body refresh and DHS CSO page/PDF remained unavailable. The earlier bound memorandum example stays limited, and no universal legal/title rule is inferred. The SDLM name and organization-specific conventions remain unresolved. Tailgating's authorization condition is the explicit reviewer counterexample already behind the source hold, not a new universal escort/consent policy. Preserved generic meanings are not a fresh full hardware, identifier-standard, training, network, latest-course or compliance assessment. No real health record, agreement, app installation, email, feed, device, security center or incident is operated on.

## Exact reconciliation

| Measure | Prior | New current-source credit | Current /total | Remaining |
|---|---:|---:|---:|---:|
| Catalogue dispositions |1694|0|1694 /1878|184|
| Support teaching |748|0|748 /834|86|
| Flashcard teaching |271|0|271 /313|42|
| Deck-container dispositions |14|0|14 /29|15|
| Glossary definitions |150|0|150 /162|12|
| Bank questions |463|0|463 /483|20|
| Bank full feedback |464|0|464 /483|19|
| Complete bank pairs |456|0|456 /483|27|

This slice has five sound bounded meanings, ten text-correction drafts and 15 context notes; current full-record teaching stays 0/15 and all 15 selected holds persist. Combined with the prior 16-card slice, all 31 held deck dependencies have an offline review: 26 text corrections and five preserved sound meanings. This does not clear any of the 42 remaining flashcard teaching records; eleven are outside those 31 dependency rows and not reviewed by these two slices. All 181 prior holds retain exact source/disposition fingerprints, with zero additions/resolutions; the other 166 held identities are carried, not re-reviewed. Remaining catalogue IDs stay 184: 180 held plus four unheld private identities, with held pbq:p036 outside that set.

All 137 prior substantive-schema packets reconcile to 1694 distinct credited records; instructional rows stay 786 raw, 772 distinct and 14 repeated occurrences. All 752 inherited field fingerprints, 27 immediate baseline fields, 422 source bindings and 25 protected release hashes are verified. Census/objective references, bank/feedback/starter/guest/page/selector counts, prior drafts, ledger, native-v1/v2, mapping package and private source choices remain pinned. No duplicate 1878-row census, current objective membership, canonical role/concept/skill/difficulty/family, human approval, publication, trusted evidence, mastery or Phase 3 inference.

## Checks and repository delivery

The focused guard rejects **1398 altered packets**, including changed selection/order, stale raw/catalogue/parent/review/field/factory revisions, generic rehashed text, dropped context, five narrow meanings promoted into full/scope approval, wrong faces/modes/examples, false downstream links/activation, SoC/SOC split or PHI transfer, TAXII ID/expansion denial, erased holds, false credit and unsafe/private/learner exports. Equality guards preserve a manually reviewed result; they do not independently prove complete semantics or learner benefit.

Required gates: deterministic write/recheck, all 29 mapping tests and deterministic active-package reproduction, git diff --check, protected/source pins and actual **[skip deploy] exit 0 / control 1**. Commit/push only this report, packet and audit; separately verify exact remote refs and artifact bytes, empty index and eight unrelated dirty entries. No active src/runtime, private payload/database, live/browser/account/storage/analytics, pricing/legal process, deployment or automation changes. **NOT READY for activation.**
