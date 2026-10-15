# Phase 2B-5 — offline replacements for twelve held glossary entries

**Twelve Codex-reviewed local replacement definitions and twelve context notes are drafted. All 181 current holds remain intact; no active-source teaching credit or activation approval is added.** Baseline: 93410e566da4209445cc0880f8789ddbd174d1ef. This is an offline editorial candidate packet, not an installed glossary patch. Approved authority remains the master plan; the Phase 1 audit is historical current-state evidence. The prior report's unresolved naming and identity concerns remain unresolved for active behavior.

## Reviewable candidate text

### BPA

**Proposed expansion:** Business Partners Agreement

**Proposed definition:** Agreement setting out responsibilities and security expectations between business partners.

**Context/disambiguation note:** This draft uses the existing security-partner card sense. It does not define every legal partnership agreement or require shared profits; the intended naming/context still needs approval.

**Addresses the prior hold:** Business Partnership Agreement and profit/loss sharing differ from the neighboring Business Partners Agreement security-responsibility label. A security/vendor relationship need not be a profit-sharing partnership.

Current source: `src/App.jsx:2255`; record `sha256:e68748c4ff5d75aa8a898a86e5764e092fd74e42b38bbd5d8110d1dea914bdbc`; definition `sha256:002669e9e7b148f53b9b0a15f5a7992c7e659efacb624dd86e9d14c11561fcda`. Candidate record: `sha256:41b562af2c87b4c7130041b74f7c482f14f16e1c68d1de7ba8f38870f388eb2a`; complete reviewed draft: `sha256:f7dcef426796e47a3f67f9ad471248f883d1181e1225df18e97a0496771d9630`.

Current hold retained; zero current teaching credit.

### CYOD

**Proposed expansion:** Choose Your Own Device

**Proposed definition:** Device-use model in which employees choose from an organization's approved device list. Ownership and payment depend on the organization's policy.

**Context/disambiguation note:** Approved-list selection does not itself establish ownership, funding or management controls. NIST describes an employee-purchased example; this is not a new BYOD/COPE taxonomy.

**Addresses the prior hold:** The entry makes enterprise ownership mandatory. NIST SP 800-124r2 section 5.1.3 explicitly describes employee-purchased CYOD devices, which defeats that universal wording.

Current source: `src/App.jsx:2273`; record `sha256:699175d96e6799cb7c081d10280278ec4d9c01e4a1bc904619648a04ddcd3888`; definition `sha256:c9bdbeeb4e1b78f7c35f5b40aed7109cc62a2ffa79b9c914f72a54a47752f689`. Candidate record: `sha256:2432c19af88d0e6d294bc6c12f8686ebbac70db8c277baea292731348d037eda`; complete reviewed draft: `sha256:286eb6308bdc870fe024ae36ff5c31ee152ecdeea5716ac16b4a9a13fae0dbd4`. [Primary reference](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-124r2.pdf)

Current hold retained; zero current teaching credit.

### DNAT

**Proposed expansion:** Destination Network Address Translation

**Proposed definition:** Translation that changes a packet's destination IP address or transport port. Public-to-internal forwarding is one use; the mechanism can also apply to other traffic.

**Context/disambiguation note:** Locally generated/output-chain translation is a counterexample to public-inbound-only wording. Source translation changes a different endpoint; no network rule or connectivity is tested.

**Addresses the prior hold:** The definition omits destination-address/port rewriting and limits the mechanism to public inbound traffic and internal hosts. Netfilter permits destination translation in output chains for locally generated traffic.

Current source: `src/App.jsx:2285`; record `sha256:baa387ad25e226d7bf8ed48d1399d6ae46fa7825966bf8ec66b89008638888d8`; definition `sha256:4cef04da7b4848713e7885eaf4fd8ad11deba35eb3f8d60125b6e8831a5f8c0e`. Candidate record: `sha256:638edc852077af87c2ccbb773d843c4c166e96b8cdb9b4294b3a7e2ab749cee6`; complete reviewed draft: `sha256:352bc8dba2425ec458c65e4338c1f23b2721d72545fedc234d7015bbe92f91bb`. [Primary reference](https://netfilter.org/projects/nftables/manpage.html)

Current hold retained; zero current teaching credit.

### OWASP

**Proposed expansion:** Open Worldwide Application Security Project

**Proposed definition:** Nonprofit foundation and community developing software-security resources, including the OWASP Top 10. Its guidance is not a regulatory approval or security certification.

**Context/disambiguation note:** The current foundation name replaces the historical Open Web expansion in this offline draft only. Top 10 is not a complete assessment or proof that software is secure.

**Addresses the prior hold:** Open Web is historical; OWASP now expands to Open Worldwide Application Security Project. Community authority is not a regulatory or certification power.

Current source: `src/App.jsx:2340`; record `sha256:558065aa1f1fad5fcf6c6a8cdd7971f19ec03dc31f885a9e84f83f2f878c098e`; definition `sha256:f9e31d9acb5b90e405372331bfd432ee7032c95452b9787cc4f00b139459d42b`. Candidate record: `sha256:b984d539443f95449af848fce9134ed758358e5b2f323b4815aafec0d2644244`; complete reviewed draft: `sha256:ac56b1cd1ebace2f76244f5b8f7bd9dc2e7dd55d09fd5ecbac99ea38ed7aa147`. [Primary reference](https://owasp.org/about/)

Current hold retained; zero current teaching credit.

### PHI

**Proposed expansion:** Protected Health Information

**Proposed definition:** Under HIPAA, individually identifiable health information held or transmitted by a covered entity or its business associate, subject to defined exclusions.

**Context/disambiguation note:** Not all personal health information is HIPAA PHI. Some employment and education records are excluded; actual classification depends on context. No real records or legal applicability are decided.

**Addresses the prior hold:** The current text substitutes unspecified strong regulation for defined scope. HHS ties HIPAA PHI to covered entities/business associates and describes exclusions; identifiable health information alone is insufficient.

Current source: `src/App.jsx:2348`; record `sha256:a4b37ec7e3d08dfdd5646cfd5e01898577682522e040028b186fc35e26cc0f36`; definition `sha256:feb68690f4d8391305be2e97f4fdc34c1c5a7e49938da3d77d0ae6f5d0a97454`. Candidate record: `sha256:1ba93062fe4762ee689d1266407d100fe372c29e12f06b3a56b5a28a09ee67ba`; complete reviewed draft: `sha256:77cd2704ba2435eef052bb30f3fbca3df63ded71c4a870f37cf770286cbfb0a7`. [Primary reference](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html)

Current hold retained; zero current teaching credit.

### SOC

**Proposed expansion:** Security Operations Center / System and Organization Controls / System on Chip

**Proposed definition:** Meaning depends on context: a security operations team or function; the AICPA assurance-services suite associated with reports such as SOC 2; or a chip integrating computing components, often written SoC.

**Context/disambiguation note:** Case-insensitive matching cannot select a sense from capitalization. This composite draft exposes the ambiguity; contextual routing, separate entries and canonical identity changes remain unapproved.

**Addresses the prior hold:** The compound entry combines center and report meanings, uses historical Service Organization Control wording rather than current System and Organization Controls, and also receives chip-context SoC matches.

Current source: `src/App.jsx:2369`; record `sha256:32ad65efbd30fbe4459eccdde0074ab82c9e40bb79524c6a3646233cc152b75b`; definition `sha256:f79b39f4675fc4014ff9297f999e809c1f5bd1dfa872f0826ac649c03786fa90`. Candidate record: `sha256:576d7339c8b5462df512b6c9203858bd33d6e6068a2b1f55a67cfbbac6609b4c`; complete reviewed draft: `sha256:baadd792174c093d0fda5ba4e1d6c6d0f24ae4904146f4b167fe5c3521647ed2`. [Primary reference](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)

Current hold retained; zero current teaching credit.

### SQL injection

**Proposed expansion:** (none; preserve the phrase entry)

**Proposed definition:** A vulnerability in which untrusted input is interpreted as SQL code, changing the intended meaning or behavior of a database query. Safely bound parameter values remain data.

**Context/disambiguation note:** Same vulnerability meaning as SQLi, with a separately bound phrase-key record. A legitimate bound value can affect results without being SQL injection; non-web SQL-using software can also be affected.

**Addresses the prior hold:** Changes a SQL query omits the critical distinction between input treated as data and input interpreted as SQL code with unintended semantics. Safely bound inputs can change query values/results.

Current source: `src/App.jsx:2397`; record `sha256:909f227de99d25202e56848a2ba7f3543e8e3f96bde902dcd5d7c2468dfa7110`; definition `sha256:f366aa1b2b8a46ec406e184101eec51fd88d0c4798c78bf1639415c65f3201c2`. Candidate record: `sha256:52bbe2a243a078f0062028ff57e37cb8cb409c3905617dc79e5d44002ad2c582`; complete reviewed draft: `sha256:0866cf336aafb749a858b582296ab10ce09570e2f6b8f958fb7a2c70ed485def`. [Primary reference](https://owasp.org/www-community/attacks/SQL_Injection)

Current hold retained; zero current teaching credit.

### SQLi

**Proposed expansion:** SQL Injection

**Proposed definition:** A vulnerability in which untrusted input is interpreted as SQL code, changing the intended meaning or behavior of a database query. Safely bound parameter values remain data.

**Context/disambiguation note:** Same vulnerability meaning as the phrase SQL injection. Equal draft wording does not merge the two catalogue records, approve their observed nodes or create two independent skills.

**Addresses the prior hold:** Changes backend database queries has the same missing code/data distinction; web-only wording also narrows a vulnerability possible in other SQL-using software.

Current source: `src/App.jsx:2371`; record `sha256:87b715a70e29d6d69c740fda8937ddef73413a2ee2758c3952f69d511231605f`; definition `sha256:e1e06fa82fa6bbc5581945f01b307a2b2b21ee00c96a7757a80bb0066a44374f`. Candidate record: `sha256:9acfbbe94f13a118b53e2a93321b487c7b188d770f31e13fbf6192035767c44a`; complete reviewed draft: `sha256:64ece121448a46c6a2ef9d6358ec929091fda930d52a46304490ed50e6e7c070`. [Primary reference](https://owasp.org/www-community/attacks/SQL_Injection)

Current hold retained; zero current teaching credit.

### SRTP

**Proposed expansion:** Secure Real-time Transport Protocol

**Proposed definition:** Profile that can protect RTP and RTCP media traffic with confidentiality, message authentication and replay protection. Actual protections depend on configured transforms and key management.

**Context/disambiguation note:** The historical NULL cipher supplies no confidentiality. This definition describes available protections rather than guaranteeing all of them; it is not a current cipher recommendation or operational configuration.

**Addresses the prior hold:** The categorical encrypted-transport description fails the historical RFC 3711 section 4.1.3 NULL-cipher counterexample. This does not recommend that mode or judge current cipher policy.

Current source: `src/App.jsx:2372`; record `sha256:bad78ec629823eefa280b7c80a882d319f9a9b4a0ecd316c48d7d219621c86a4`; definition `sha256:acf41bdf39b990933da8e306ecbd3e793c688cb8f5946ae4c7c5dd24aefc578f`. Candidate record: `sha256:131010c91da2637b15a6402d80aa76f842d7a465bb60b8a7e482533874b6adfa`; complete reviewed draft: `sha256:7e2b03a6e0eed3459fe0e6d3af8c88b5dca3ce54f1513a92dfade9472b026bdb`. [Primary reference](https://www.rfc-editor.org/rfc/rfc3711)

Current hold retained; zero current teaching credit.

### SSH

**Proposed expansion:** Secure Shell

**Proposed definition:** Protocol suite for remote login and other network services, designed to authenticate the server and protect channel confidentiality and integrity. Actual protection depends on negotiated algorithms and configuration.

**Context/disambiguation note:** Host verification, client authentication and authorization remain separate requirements. Historical optional none encryption is a counterexample, not a recommendation. No connection or current algorithm policy is assessed.

**Addresses the prior hold:** Historical RFC 4253 section 6.3 explicitly permits a nonrecommended none cipher. The categorical description alone cannot establish negotiated confidentiality, host verification or authorization.

Current source: `src/App.jsx:2373`; record `sha256:c8461c36a4ee1bdb9e35f61298a24bcd79ca0754186ce7633ebd989ffc288a47`; definition `sha256:3b1f654fb83f159cbcccf25fafbef4ff48a30e5c5be213d90ebee14e088212de`. Candidate record: `sha256:5e260754b10eb26e30870c3e92dba35e0f2eaefb6e19ec66e5a54fd38590531b`; complete reviewed draft: `sha256:0dbc3a48f23096e80114ae990d3324dad86446ba3ff7bcb11cbb5d29758794a4`. [Primary reference](https://www.rfc-editor.org/rfc/rfc4253)

Current hold retained; zero current teaching credit.

### SSID

**Proposed expansion:** Service Set Identifier

**Proposed definition:** Identifier naming a wireless service set. Its name can be advertised in beacons or withheld from those broadcasts; the name alone does not authenticate the network.

**Context/disambiguation note:** A configured SSID still exists when its name is not broadcast. Suppression is not encryption or reliable concealment, and a copied name does not establish access-point identity.

**Addresses the prior hold:** SSID name broadcasting can be disabled while the identifier remains configured. A name does not prove AP identity, authentication or encryption; the broadcast clause is not universal.

Current source: `src/App.jsx:2374`; record `sha256:0b2ef0baeb15de5a045aa9181b5735eafce2af912f9d7e1b054257bf47c44727`; definition `sha256:5a5db762f2917ccc7903d0edc770457557056f1d225c1cee81f65844d35ce576`. Candidate record: `sha256:228f20def74259486c16dcaf6ec0c44c9f46f9715cf2d55b0378bcc1b6122ad7`; complete reviewed draft: `sha256:688f0a1b72b1cbaa44660704bec8ec4f003f3b75cc980d9a94b557adcafc99d6`. [Primary reference](https://www.cisco.com/c/en/us/support/docs/smb/wireless/cisco-small-business-100-series-wireless-access-points/smb5177-disable-ssid-broadcast-on-a-wireless-access-point.html)

Current hold retained; zero current teaching credit.

### ZTA

**Proposed expansion:** Zero Trust Architecture

**Proposed definition:** Architecture that protects resources through explicit authentication and authorization, without granting implicit trust solely because of network location or device ownership.

**Context/disambiguation note:** Authentication and authorization are distinct and consider subjects and devices before resource sessions. The slogan is a mnemonic; ABAC may inform a policy but is not the architecture itself or proof of secure operation.

**Addresses the prior hold:** Never trust, always verify omits resource-focused authentication/authorization and no implicit trust solely from location or ownership. A neighboring ABAC/Zero Trust entry cannot supply missing semantics.

Current source: `src/App.jsx:2392`; record `sha256:16e75b6db91b31d2d0d124cf0c947036747e385b040ee4abad72029562ee6b8c`; definition `sha256:783435b66103df8113c5eb82c3556e83aac4af9a88ce7e53db0b39079a5d42f9`. Candidate record: `sha256:a98cb93fef9ca530bb434629c74844a2d3626ec0bb8d3c32b700ddfdb8a93de2`; complete reviewed draft: `sha256:4317219d7952d8a6e1f7b79dc0e47a1ecbc42a4e115ed6d2aa111a4a6ab40cb7`. [Primary reference](https://csrc.nist.gov/pubs/sp/800/207/final)

Current hold retained; zero current teaching credit.

## Candidate delivery and adversarial findings

The replacement entries preserve all twelve existing keys and their string/object shape. The phrase SQL injection stays a string; the other entries retain fullName/definition objects. Their hypothetical record/definition signatures are separate from the unchanged current-source signatures. The two SQL definitions use identical meaning text, but remain separately bound catalogue records with different candidate record revisions. No canonical merge, split, mapping, independent skill or family is inferred.

The exact existing source matcher, formatting splitter and getEntry expressions are reused against an in-memory copy containing only the twelve candidate values. No second production matcher, dependency, override, route, runtime import or publication adapter is added. All 108 candidate case/format/boundary probes preserve current matches while resolving the candidate text, alongside 108 current-source matching probes and 12 current-source context probes replayed from the pinned prior audit. Twelve candidate context probes include SQL phrase/acronym, split formatting, hyphenation, embedded tokens, CYOD/BYOD/COPE, ABAC/ZTA and SSH/SRTP/SSID.

All three SOC contexts—chip, operations and assurance report—still match the single compound key. The draft names all three senses and updates the AICPA expansion, but does not choose a sense or route from capitalization. A shorter context-specific entry would require a separately approved context/identity decision. The chip/center cards and observed objective 5.5 remain comparisons, not new aliases, catalogue identities or a 22nd tracked objective.

Both SQL entries explain that untrusted input is interpreted as SQL code, rather than merely changing values/results, and avoid a mandatory web-only scope. A safely bound parameter is the benign contrast. Existing m723 metadata still does not prove a visible SQLi-key tooltip: its visible feedback matches the separate phrase key. The clearer acronym flashcard transfers no approval to either current or candidate definition.

BPA deliberately uses the existing security-partner card sense rather than implying every vendor agreement forms a profit-sharing legal partnership; active naming remains unapproved. CYOD separates device choice from ownership/payment. DNAT states destination rewriting rather than treating one inbound forwarding use as exhaustive. PHI names HIPAA's covered-entity/business-associate context and exclusions without classifying real records. OWASP uses the current foundation name and bounds guidance authority. SSH/SRTP describe intended/available protection with configuration limits; historical unencrypted modes are counterexamples, not recommended modes. SSID is defined independently of optional beacon-name advertisement. ZTA names resource protection and distinct authentication/authorization without equating it to ABAC or a slogan.

All 66 lexical cross-link references retain their exact current parent revisions and zero transferred approval; candidate text does not rewrite parent cards, lessons, assessments or mappings. The existing source probes freshly replay 53 MCQ field-group occurrences, 2 lesson paragraph segments and 3 plain-table observations. These are different units, not 66 verified live tooltip encounters. PBQ field-level practice/Exam tooltip delivery and its gates are not freshly exercised. Existing Pro/submission gates, disabled option ancestors, plain card/table surfaces and the absence of recursive parsing in popup text remain as documented in the prior report.

Twelve candidate and twelve current-source static text-node specimens pass, with one candidate and one current synthetic escaping check. This checks text projection, not the full interactive component or browser/keyboard/screen-reader operation. Context notes are reviewed editorial metadata outside the two-field popup; they are **not automatically delivered** by the existing renderer. No candidate is represented as fully integrated or live teaching. Publishing a future replacement requires reviewing the chosen sense and delivery of any necessary note, plus the actual parent links and entitlements.

## Sources and limits

The prior packet pins the ten targeted primary references and their exact claim scopes. This slice additionally reads [RFC4251 abstract/introduction](https://www.rfc-editor.org/rfc/rfc4251) for SSH architecture purpose and [OWASP's SQL injection prevention guidance](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) for the SQL code/data distinction. References support the bounded draft wording; they are not full standards, legal-applicability or contemporary algorithm audits. No query, attack, network rule, connection, wireless scan or real health record is used.

## Exact reconciliation

| Measure | Prior | New current-source credit | Current /total | Remaining |
|---|---:|---:|---:|---:|
| Catalogue dispositions |1694|0|1694 /1878|184|
| Support teaching |748|0|748 /834|86|
| Glossary definitions |150|0|150 /162|12|
| Bank questions |463|0|463 /483|20|
| Bank full feedback |464|0|464 /483|19|
| Complete bank pairs |456|0|456 /483|27|

Candidate progress is separately 12 replacement definitions plus 12 notes, not 24 current-source dispositions. All 12 selected prior holds remain; no new distinct hold is created or cleared. Global holds stay 181, including carried pbq:p036 outside the 184 remaining records; 180 remaining records are held and 4 private records unheld. All 134 prior substantive-schema packets reconcile to 1694 distinct credited records; instructional arrays stay 786 raw rows, 772 distinct records and 14 repeated occurrences. Cards/decks, lessons/guides/traps, starters/guests, pages/selectors, earlier candidate drafts, question-only feedback gaps and held-parent feedback qualifications stay pinned, with no implied upgrade.

All 752 inherited field fingerprints, 23 immediate baseline field bindings, 413 source bindings and 25 protected release hashes are checked. Compact census/objective references avoid a duplicate 1878-row census. Mapping package, ledger, native-v1/v2, private source-selection decisions and default-off/unwired specimen remain exact. No roles, objectives, canonical identity, difficulty, human approval, trusted revision, family independence, mastery or Phase 3 approval.

## Verification and repository delivery

The focused guard rejects **1410 altered packets**, including source/candidate signature drift, current-definition substitution, missing notes, generic rehashed replacements, cross-link drift/approval transfer, SQL identity conflation, SOC automatic disambiguation, erased prior holds, false coverage and unsafe/private/learner exports. Equality guards protect this manually reviewed draft; they do not establish semantics or learner benefit on their own.

Required gates: deterministic write/recheck, all 29 content-mapping tests and deterministic active-package reproduction, git diff --check, source/protected pins and actual **[skip deploy] exit 0 / control 1**. Commit/push only this report, its packet and audit; verify exact remote refs and artifact bytes separately, empty index and eight unrelated dirty entries preserved. No active src/runtime, content, mapping, private payload, database, live/browser/account/analytics/payment, deployment or automation changes. **NOT READY for activation.**
