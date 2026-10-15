# Phase 2B-5 — twelve remaining glossary definitions and cross-links

**LOCAL review complete; all 12 exact current definitions retain their prior holds. NOT READY for activation.** No new full-definition or cross-link teaching qualification, no new distinct hold and no cleared hold. Glossary coverage stays 150/162; the remaining 12 are exactly this selection. Useful mnemonic/lookup fragments are described below without counting them as approval of the complete delivered entry.

Approved product authority remains docs/secureplus-rebrand-master-plan.md. The Phase 1 audit supplies historical current-state evidence; current source pins and the immediately preceding three-artifact review supply this recheck. No new master-plan conflict is inferred, and the preexisting naming/identity conflicts remain unresolved before any behavior change. Baseline commit: 3f421f66b98737cd8b57955c452b04d6a091445f.

## Exact selection and source precedence

| Record | Current source revision | Source line | Lexical references |
|---|---|---:|---:|
| glossary:bpa | `sha256:e68748c4ff5d75aa8a898a86e5764e092fd74e42b38bbd5d8110d1dea914bdbc` | 2255 | 1 |
| glossary:cyod | `sha256:699175d96e6799cb7c081d10280278ec4d9c01e4a1bc904619648a04ddcd3888` | 2273 | 3 |
| glossary:dnat | `sha256:baa387ad25e226d7bf8ed48d1399d6ae46fa7825966bf8ec66b89008638888d8` | 2285 | 0 |
| glossary:owasp | `sha256:558065aa1f1fad5fcf6c6a8cdd7971f19ec03dc31f885a9e84f83f2f878c098e` | 2340 | 4 |
| glossary:phi | `sha256:a4b37ec7e3d08dfdd5646cfd5e01898577682522e040028b186fc35e26cc0f36` | 2348 | 5 |
| glossary:soc | `sha256:32ad65efbd30fbe4459eccdde0074ab82c9e40bb79524c6a3646233cc152b75b` | 2369 | 9 |
| glossary:sql%20injection | `sha256:909f227de99d25202e56848a2ba7f3543e8e3f96bde902dcd5d7c2468dfa7110` | 2397 | 25 |
| glossary:sqli | `sha256:87b715a70e29d6d69c740fda8937ddef73413a2ee2758c3952f69d511231605f` | 2371 | 2 |
| glossary:srtp | `sha256:bad78ec629823eefa280b7c80a882d319f9a9b4a0ecd316c48d7d219621c86a4` | 2372 | 2 |
| glossary:ssh | `sha256:c8461c36a4ee1bdb9e35f61298a24bcd79ca0754186ce7633ebd989ffc288a47` | 2373 | 11 |
| glossary:ssid | `sha256:0b2ef0baeb15de5a045aa9181b5735eafce2af912f9d7e1b054257bf47c44727` | 2374 | 3 |
| glossary:zta | `sha256:16e75b6db91b31d2d0d124cf0c947036747e385b040ee4abad72029562ee6b8c` | 2392 | 1 |

All twelve are authored inline GLOSSARY_TERMS values in src/App.jsx. readGlossary, the existing sourceUnit helper and the actual parseInlineFormats/matcher/split/getEntry expressions are reused. No question override or runtime glossary replacement is applied. The packet separately pins authored records, definitions, fullName/definition fields and rendered entries, plus source lines, renderer and matching units. Existing support_only precision, zero weights, null trusted revision and observed concept links are observations, not canonical decisions.

### BPA — prior hold retained

Current expansion: Business Partnership Agreement. Current definition: Legal agreement defining operations, governance, and profit/loss sharing between partners.

Agreement vocabulary is useful, but the source does not establish the intended security-partner sense.

**Hold:** Business Partnership Agreement and profit/loss sharing differ from the neighboring Business Partners Agreement security-responsibility label. A security/vendor relationship need not be a profit-sharing partnership.

**Minimum prerequisite:** Resolve the intended expansion and relationship scope against the approved product context; review the delivered entry and its card link together without silently renaming a canonical identity.

Source: `src/App.jsx:2255`. Current record `sha256:e68748c4ff5d75aa8a898a86e5764e092fd74e42b38bbd5d8110d1dea914bdbc`; definition `sha256:002669e9e7b148f53b9b0a15f5a7992c7e659efacb624dd86e9d14c11561fcda`. Prior hold: `docs/drafts/phase-2b5-risk-governance-residual-terms-proposals.json` → `deferredSelectedRows`, fingerprint `sha256:4c5925e55dc539e9372380d95c93e3e523aa848cbc9e640a1f0fd316a19974ad`. No current credit or hold resolution.

### CYOD — prior hold retained

Current expansion: Choose Your Own Device. Current definition: Device model where employees choose from approved enterprise-owned devices.

An approved device list describes choice, not necessarily ownership.

**Hold:** The entry makes enterprise ownership mandatory. NIST SP 800-124r2 section 5.1.3 explicitly describes employee-purchased CYOD devices, which defeats that universal wording. [Primary reference](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-124r2.pdf).

**Minimum prerequisite:** Describe approved-list selection separately from ownership, funding and management policy; do not inherit the BYOD/COPE compound card as approval.

Source: `src/App.jsx:2273`. Current record `sha256:699175d96e6799cb7c081d10280278ec4d9c01e4a1bc904619648a04ddcd3888`; definition `sha256:c9bdbeeb4e1b78f7c35f5b40aed7109cc62a2ffa79b9c914f72a54a47752f689`. Prior hold: `docs/drafts/phase-2b5-objective41-platform-glossary-proposals.json` → `deferredSelectedRows`, fingerprint `sha256:d4eb8463fec27de259aa646cd275b8b39d1ec91a152cb7f536781079d791bf5f`. No current credit or hold resolution.

### DNAT — prior hold retained

Current expansion: Destination Network Address Translation. Current definition: Translation of inbound public traffic to specific internal hosts or services.

The expansion identifies destination translation; public inbound forwarding is one use.

**Hold:** The definition omits destination-address/port rewriting and limits the mechanism to public inbound traffic and internal hosts. Netfilter permits destination translation in output chains for locally generated traffic. [Primary reference](https://netfilter.org/projects/nftables/manpage.html).

**Minimum prerequisite:** State the destination rewrite mechanism and identify inbound port forwarding as an example rather than the complete definition.

Source: `src/App.jsx:2285`. Current record `sha256:baa387ad25e226d7bf8ed48d1399d6ae46fa7825966bf8ec66b89008638888d8`; definition `sha256:4cef04da7b4848713e7885eaf4fd8ad11deba35eb3f8d60125b6e8831a5f8c0e`. Prior hold: `docs/drafts/phase-2b5-residual-access-protocol-glossary-proposals.json` → `deferredSelectedRows`, fingerprint `sha256:a547d2dcadf00247642d752744c5328c9b3eefbff5245da31b15e7e9284bf820`. No current credit or hold resolution.

### OWASP — prior hold retained

Current expansion: Open Web Application Security Project. Current definition: Community authority for web application security, known for the OWASP Top 10.

The Top 10 reference can orient learners to community resources.

**Hold:** Open Web is historical; OWASP now expands to Open Worldwide Application Security Project. Community authority is not a regulatory or certification power. [Primary reference](https://owasp.org/about/).

**Minimum prerequisite:** Use the current foundation name and a bounded community/software-security description; clarify what Top 10 guidance does and does not establish.

Source: `src/App.jsx:2340`. Current record `sha256:558065aa1f1fad5fcf6c6a8cdd7971f19ec03dc31f885a9e84f83f2f878c098e`; definition `sha256:f9e31d9acb5b90e405372331bfd432ee7032c95452b9787cc4f00b139459d42b`. Prior hold: `docs/drafts/phase-2b5-api-malware-teaching-proposals.json` → `preservedGlossaryDeferrals`, fingerprint `sha256:67e736cd22a35b60c1604214cd5c287991572b4d1c3c4120d258621fb8ecc8d4`. No current credit or hold resolution.

### PHI — prior hold retained

Current expansion: Protected Health Information. Current definition: Health information tied to an individual and subject to strong regulatory protection.

The expansion and identifiable-health-data association are useful preliminary vocabulary.

**Hold:** The current text substitutes unspecified strong regulation for defined scope. HHS ties HIPAA PHI to covered entities/business associates and describes exclusions; identifiable health information alone is insufficient. [Primary reference](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html).

**Minimum prerequisite:** Name the intended regulatory context and scope without implying all health data is HIPAA PHI or classifying real records.

Source: `src/App.jsx:2348`. Current record `sha256:a4b37ec7e3d08dfdd5646cfd5e01898577682522e040028b186fc35e26cc0f36`; definition `sha256:feb68690f4d8391305be2e97f4fdc34c1c5a7e49938da3d77d0ae6f5d0a97454`. Prior hold: `docs/drafts/phase-2b5-data-classification-privacy-proposals.json` → `deferredSelectedRows`, fingerprint `sha256:2a962de7fc325a9ce8f9165f856d0963657086760cf8e7acc51042a30622fd8a`. No current credit or hold resolution.

### SOC — prior hold retained

Current expansion: Security Operations Center / Service Organization Control. Current definition: Either a team/facility monitoring security telemetry, or a class of audit reports such as SOC 2.

Operations centers and assurance reports are recognizable but different senses.

**Hold:** The compound entry combines center and report meanings, uses historical Service Organization Control wording rather than current System and Organization Controls, and also receives chip-context SoC matches. [Primary reference](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services).

**Minimum prerequisite:** Resolve the intended contextual senses and naming before reviewing links. A wording fix for one sense cannot approve the compound node or silently create a new chip alias.

Source: `src/App.jsx:2369`. Current record `sha256:32ad65efbd30fbe4459eccdde0074ab82c9e40bb79524c6a3646233cc152b75b`; definition `sha256:f79b39f4675fc4014ff9297f999e809c1f5bd1dfa872f0826ac649c03786fa90`. Prior hold: `docs/drafts/phase-2b5-objective31-glossary-proposals.json` → `deferredSelectedRows`, fingerprint `sha256:db86867d4ba54077b90a169937b40c756786f81772b432e27859f01804e770fb`. No current credit or hold resolution.

### SQL injection — prior hold retained

Current expansion: (no separate expansion). Current definition: A vulnerability where attacker-controlled input changes a SQL query.

The phrase points toward an input-related database vulnerability.

**Hold:** Changes a SQL query omits the critical distinction between input treated as data and input interpreted as SQL code with unintended semantics. Safely bound inputs can change query values/results. [Primary reference](https://owasp.org/www-community/attacks/SQL_Injection).

**Minimum prerequisite:** Describe the code/data boundary, separately review this exact phrase-key record and its delivery, and do not transfer the SQLi card disposition.

Source: `src/App.jsx:2397`. Current record `sha256:909f227de99d25202e56848a2ba7f3543e8e3f96bde902dcd5d7c2468dfa7110`; definition `sha256:f366aa1b2b8a46ec406e184101eec51fd88d0c4798c78bf1639415c65f3201c2`. Prior hold: `docs/drafts/phase-2b5-api-malware-teaching-proposals.json` → `preservedGlossaryDeferrals`, fingerprint `sha256:2b67dc40ca5675ddbf65854919706416ccd22af43b5d240829b39b6138553d45`. No current credit or hold resolution.

### SQLi — prior hold retained

Current expansion: SQL Injection. Current definition: Web vulnerability where attacker input changes backend database queries.

The acronym expansion is recognizable as SQL injection.

**Hold:** Changes backend database queries has the same missing code/data distinction; web-only wording also narrows a vulnerability possible in other SQL-using software. [Primary reference](https://owasp.org/www-community/attacks/SQL_Injection).

**Minimum prerequisite:** Describe untrusted input interpreted as SQL code with unintended behavior and avoid a mandatory web-only scope; bind this record separately from the phrase.

Source: `src/App.jsx:2371`. Current record `sha256:87b715a70e29d6d69c740fda8937ddef73413a2ee2758c3952f69d511231605f`; definition `sha256:e1e06fa82fa6bbc5581945f01b307a2b2b21ee00c96a7757a80bb0066a44374f`. Prior hold: `docs/drafts/phase-2b5-api-malware-teaching-proposals.json` → `preservedGlossaryDeferrals`, fingerprint `sha256:51a3317786553aefe800559c63d3566318ccbb1355b899651c190f49783b8f35`. No current credit or hold resolution.

### SRTP — prior hold retained

Current expansion: Secure Real-time Transport Protocol. Current definition: Encrypted transport for securing real-time voice and media streams.

The expansion identifies RTP security vocabulary, not achieved confidentiality.

**Hold:** The categorical encrypted-transport description fails the historical RFC 3711 section 4.1.3 NULL-cipher counterexample. This does not recommend that mode or judge current cipher policy. [Primary reference](https://www.rfc-editor.org/rfc/rfc3711).

**Minimum prerequisite:** Describe RTP/RTCP protection and distinguish available confidentiality, authentication and replay properties from configured/achieved protections.

Source: `src/App.jsx:2372`. Current record `sha256:bad78ec629823eefa280b7c80a882d319f9a9b4a0ecd316c48d7d219621c86a4`; definition `sha256:acf41bdf39b990933da8e306ecbd3e793c688cb8f5946ae4c7c5dd24aefc578f`. Prior hold: `docs/drafts/phase-2b5-objective41-platform-glossary-proposals.json` → `deferredSelectedRows`, fingerprint `sha256:8e07c1776a275d96ee89de093e684f3b68fbe1b2265ffee2af7ecb9dd8d419af`. No current credit or hold resolution.

### SSH — prior hold retained

Current expansion: Secure Shell. Current definition: Encrypted remote administration protocol replacing insecure cleartext terminal access.

Secure remote administration is a common purpose.

**Hold:** Historical RFC 4253 section 6.3 explicitly permits a nonrecommended none cipher. The categorical description alone cannot establish negotiated confidentiality, host verification or authorization. [Primary reference](https://www.rfc-editor.org/rfc/rfc4253).

**Minimum prerequisite:** Bound the secure-channel purpose without asserting every negotiated connection is encrypted or securely authenticated. This review makes no present-day algorithm recommendation.

Source: `src/App.jsx:2373`. Current record `sha256:c8461c36a4ee1bdb9e35f61298a24bcd79ca0754186ce7633ebd989ffc288a47`; definition `sha256:3b1f654fb83f159cbcccf25fafbef4ff48a30e5c5be213d90ebee14e088212de`. Prior hold: `docs/drafts/phase-2b5-objective41-platform-glossary-proposals.json` → `deferredSelectedRows`, fingerprint `sha256:812ec039b801635b002e91bb4f0facc2b6347bb70c9819bfb02651dfe827ee23`. No current credit or hold resolution.

### SSID — prior hold retained

Current expansion: Service Set Identifier. Current definition: Human-readable wireless network name broadcast by access points.

The expansion identifies the wireless network-name vocabulary.

**Hold:** SSID name broadcasting can be disabled while the identifier remains configured. A name does not prove AP identity, authentication or encryption; the broadcast clause is not universal. [Primary reference](https://www.cisco.com/c/en/us/support/docs/smb/wireless/cisco-small-business-100-series-wireless-access-points/smb5177-disable-ssid-broadcast-on-a-wireless-access-point.html).

**Minimum prerequisite:** Define the identifier independently of optional name advertisement; do not claim name suppression supplies security.

Source: `src/App.jsx:2374`. Current record `sha256:0b2ef0baeb15de5a045aa9181b5735eafce2af912f9d7e1b054257bf47c44727`; definition `sha256:5a5db762f2917ccc7903d0edc770457557056f1d225c1cee81f65844d35ce576`. Prior hold: `docs/drafts/phase-2b5-api-malware-teaching-proposals.json` → `preservedGlossaryDeferrals`, fingerprint `sha256:5683f3949e0fd691f17755f12369cf1962a87be616d489b6ebb37ac5b1e93eb8`. No current credit or hold resolution.

### ZTA — prior hold retained

Current expansion: Zero Trust Architecture. Current definition: Architecture based on never trust, always verify for each access request.

The slogan is a mnemonic, not sufficient architecture teaching.

**Hold:** Never trust, always verify omits resource-focused authentication/authorization and no implicit trust solely from location or ownership. A neighboring ABAC/Zero Trust entry cannot supply missing semantics. [Primary reference](https://csrc.nist.gov/pubs/sp/800/207/final).

**Minimum prerequisite:** Explain the resource/session and authentication/authorization boundary; keep ABAC and ZTA distinct without approving new canonical mappings.

Source: `src/App.jsx:2392`. Current record `sha256:16e75b6db91b31d2d0d124cf0c947036747e385b040ee4abad72029562ee6b8c`; definition `sha256:783435b66103df8113c5eb82c3556e83aac4af9a88ce7e53db0b39079a5d42f9`. Prior hold: `docs/drafts/phase-2b5-objective31-glossary-proposals.json` → `deferredSelectedRows`, fingerprint `sha256:679b86ecb786fdb2206c6019a77d92ea330aee6557f82fefcb3729f50e62c83b`. No current credit or hold resolution.

## Delivery and cross-link findings

108 case/format/boundary probes and 12 context probes execute the extracted source expressions. Longest-first case-insensitive matching resolves canonical/lower/uppercase, bold, underline, highlight, punctuation and repetition; embedded alphanumeric text is rejected. Splitting the SQL phrase across formatting fragments does not produce a whole-phrase tooltip. No synonym expansion, conceptual understanding or contextual sense selection is implied.

The encoded glossary:sql%20injection phrase and glossary:sqli acronym retain separate authored/definition signatures and observed nodes. Both are held for missing SQL code-versus-data teaching. m723 references SQLi in metadata but its visible feedback matches the phrase key; metadata is not proof of an acronym tooltip. The existing flashcard cannot repair either definition or create an independent assessment family.

SoC processor, SOC 2 report and SOC security monitoring all resolve to the same compound SOC entry. The chip flashcard is separately source-bound; its plain-text face does not repair the popup. Observed objective 5.5 remains outside the existing 21 tracked objectives; no denominator expansion, silent alias, node split or transferred approval.

The 66 lexical references are bound to exact current parent revisions in usageInventory; zero DNAT references means none in this local catalogue union, not proof of global/private/live absence. Fresh pure-source probes identify 53 MCQ field-group occurrences, 2 lesson paragraph segments and 3 plain-table observations. They are different units and must not be summed into unique pages or learner encounters. Neighboring cards are bound for comparison, not substantively re-reviewed or newly credited. PBQ references remain exact lexical-parent bindings; their practice/Exam gates and field-level tooltip delivery are not freshly exercised in this slice.

GlossaryText adds no account gate itself. Actual MCQ feedback retains its Pro/submission gate; question stems and options use their existing pools, and submitted options have a disabled ancestor. Selected lesson paragraph delivery remains conditional on the existing Pro path and collapsed-detail state. Tables and flashcard faces are plain text. Popup definitions are text nodes and are not recursively glossary-parsed. Source contains click, Enter/Space, tabIndex, aria-expanded and outside-pointer close handling; these are source observations, not browser/keyboard/screen-reader verification. Twelve static text-node specimens and one hostile synthetic escaping check pass; the full interactive component is not rendered. No standalone glossary route is observed in the bound catalogue/delivery sources.

## Targeted primary references

- [owasp.org](https://owasp.org/about/): Current foundation expansion and community scope only.
- [owasp.org](https://owasp.org/www-community/attacks/SQL_Injection): Data-plane input versus SQL command execution; parameterized example and non-web platform scope only. No exploit run or universal impact claim.
- [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-124r2.pdf): Section 5.1.3: employee-owned CYOD is a counterexample to mandatory enterprise ownership.
- [netfilter.org](https://netfilter.org/projects/nftables/manpage.html): NAT statements: destination address/port rewriting and output-chain use. No rule or network action executed.
- [www.hhs.gov](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html): What Information is Protected and covered-entity/business-associate context and exclusions; no legal classification or advice.
- [www.aicpa-cima.com](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services): Current System and Organization Controls name and assurance-report context only.
- [www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc3711): Historical section 4.1.3 NULL cipher only; counterexample, not a recommended configuration or current profile audit.
- [www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc4253): Historical section 6.3 optional none cipher explicitly not recommended; no contemporary deployment or cipher recommendation.
- [www.cisco.com](https://www.cisco.com/c/en/us/support/docs/smb/wireless/cisco-small-business-100-series-wireless-access-points/smb5177-disable-ssid-broadcast-on-a-wireless-access-point.html): Legacy WAP example separates configured SSID and broadcast setting. Do not adopt its security/undetectability claims.
- [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/207/final): Publication abstract: resource focus, location/ownership not sole trust basis, distinct authentication/authorization. Full standard not assessed.

Only the named sections/abstracts were read on 2026-10-15, not complete standards or current deployment conformance. BPA is a source-context naming/scope conflict rather than a legal determination. Historical unencrypted modes are counterexamples to categorical wording, not current recommendations. The legacy Cisco page is used only for its separate broadcast control, not its security or undetectability claims. No real records, network rules, attacks, wireless scans or connections are used.

## Reconciliation and boundaries

| Measure | Prior | New credit | Current /total | Remaining |
|---|---:|---:|---:|---:|
| Catalogue dispositions |1694|0|1694 /1878|184|
| Support teaching |748|0|748 /834|86|
| Glossary definitions |150|0|150 /162|12|
| Bank questions |463|0|463 /483|20|
| Bank full feedback |464|0|464 /483|19|
| Complete bank pairs |456|0|456 /483|27|

The 184 remaining catalogue rows comprise 180 held and 4 unheld private identities. All 181 distinct prior holds persist; pbq:p036 is the carried hold outside that remaining set. These 12 reselected glossary holds are not 12 new holds. All 133 earlier substantive-schema packets reconcile to 1694 distinct credited records; instructional arrays remain 786 raw rows, 772 distinct records and 14 repeated occurrences. Rechecks, metadata, cross-links, cards and aliases add zero credit.

All 752 inherited field fingerprints and 22 immediate baseline field bindings are verified. Compact census/objective references and prior page qualifications remain pinned instead of duplicating the 1878-row census. All 410 source bindings and 25 protected release hashes remain exact; the ledger, native-v1/v2, source-selection decisions and disabled/unwired local specimen stay unchanged. No canonical concept, role, objective, skill, difficulty, family, teaching link, human approval, trusted revision, mastery or Phase 3 decision is added. Prior seven older PBQ feedback gaps, eight qualified feedback records on held parents and zero on unreviewed parents stay exact; local candidate drafts do not become current teaching credit.

## Verification and delivery contract

The focused packet guard rejects **1311 altered packets**, covering stale source/definition/display/cross-link bindings, false contextual disambiguation, erased holds, duplicate/false credit, canonical/human/trusted/mastery/activation promotion and raw/private/learner fields. These checks protect a manually reviewed result; equality guards do not prove the semantics themselves. Required gates are deterministic write/recheck, all 29 content-mapping tests and deterministic active-package reproduction, git diff --check, source/protected pins and actual **[skip deploy] exit 0 / control 1**. Commit/push only this report, its packet and audit; verify exact remote refs and artifact bytes separately after push, with an empty index and eight unrelated dirty entries preserved.

No active definition, mapping, runtime, private payload, database, browser, learner account, analytics, pricing, legal process, deployment or automation is changed. Repository delivery does not establish production delivery. The next substantive progress requires correcting and re-reviewing the held source definitions and ambiguous links; repeating a matcher audit alone will not raise coverage.
