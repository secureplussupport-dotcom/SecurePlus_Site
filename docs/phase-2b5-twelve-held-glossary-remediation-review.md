# Phase 2B-5 — twelve held glossary remediation proposals

Exactly BPA, CYOD, DNAT, OWASP, PHI, SOC, SQL injection, SQLi, SRTP, SSH, SSID and ZTA; no substitution. Baseline **4146fa8f65d1b4ab50e036c39ebf4d05219b79fe**. Master plan and Phase1 audit were read in full earlier in this continuous session; master plan remains product authority and audit historical evidence. No unresolved product conflict changes behavior.

**12 Codex-reviewed LOCAL proposals:11 prior definitions revalidated,1 revised two-sense SOC candidate. All12 current holds and all181 global holds remain.** No runtime, human/canonical approval, publication or activation. These are proposed definitions, not12 new glossary qualifications.

## BPA

Record `glossary:bpa`; source `src/App.jsx:2255`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** Business Partnership Agreement and profit/loss sharing differ from the neighboring Business Partners Agreement security-responsibility label. A security/vendor relationship need not be a profit-sharing partnership.

**Codex-reviewed LOCAL proposal:** Business Partners Agreement — Agreement setting out responsibilities and security expectations between business partners.

Exact prior definition reused. This draft uses the existing security-partner card sense. It does not define every legal partnership agreement or require shared profits; the intended naming/context still needs approval.

Current→candidate source: `sha256:e68748c4ff5d75aa8a898a86e5764e092fd74e42b38bbd5d8110d1dea914bdbc` → `sha256:41b562af2c87b4c7130041b74f7c482f14f16e1c68d1de7ba8f38870f388eb2a`; definition-value: `sha256:002669e9e7b148f53b9b0a15f5a7992c7e659efacb624dd86e9d14c11561fcda` → `sha256:af599d09c865a72c97a3954c32083db3efdd61b9322970aad5222f29755032c8`; rendered entry: `sha256:002669e9e7b148f53b9b0a15f5a7992c7e659efacb624dd86e9d14c11561fcda` → `sha256:af599d09c865a72c97a3954c32083db3efdd61b9322970aad5222f29755032c8`; usage projection: `sha256:fbefc6c5bc9f9bba764f66380df4c83b498d670538e5ecfdd8dc8ec4d3779af6` → `sha256:a0da872ece8bd2408888eac743e31fce0675138ad1dc136ab4086b0a4787d0b5`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:88ac9c69d19d746d85619116022a73a831be080c6724fd8e472ad4312413d893` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:4c5925e55dc539e9372380d95c93e3e523aa848cbc9e640a1f0fd316a19974ad` in docs/drafts/phase-2b5-risk-governance-residual-terms-proposals.json, field deferredSelectedRows. Review row `sha256:b3934841d5d0b1e742d3d77d6dd51e9fed6cfc62542210dc2c0e68b9cd334cd7`. Lexical source union: 1 references, with zero inferred delivered teaching or parent credit.

[lecbyo.files.cmp.optimizely.com](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be): Official SY0-701 V7 objectives p15 and acronym list p17: Business partners agreement / Business Partners Agreement. Naming and third-party context only, not a universal contract definition. [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/47/r1/final): Abstract and indexed executive summary: protection agreements and participant responsibilities for information exchanges. Supports the security-agreement context; applying that context to BPA is reviewer synthesis, not a NIST BPA definition.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## CYOD

Record `glossary:cyod`; source `src/App.jsx:2273`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** The entry makes enterprise ownership mandatory. NIST SP 800-124r2 section 5.1.3 explicitly describes employee-purchased CYOD devices, which defeats that universal wording.

**Codex-reviewed LOCAL proposal:** Choose Your Own Device — Device-use model in which employees choose from an organization's approved device list. Ownership and payment depend on the organization's policy.

Exact prior definition reused. Approved-list selection does not itself establish ownership, funding or management controls. NIST describes an employee-purchased example; this is not a new BYOD/COPE taxonomy.

Current→candidate source: `sha256:699175d96e6799cb7c081d10280278ec4d9c01e4a1bc904619648a04ddcd3888` → `sha256:2432c19af88d0e6d294bc6c12f8686ebbac70db8c277baea292731348d037eda`; definition-value: `sha256:c9bdbeeb4e1b78f7c35f5b40aed7109cc62a2ffa79b9c914f72a54a47752f689` → `sha256:211b1f87ffb8c026ff42cb9ee1346b43aa39ccc30085017d2434d4e1b9811055`; rendered entry: `sha256:c9bdbeeb4e1b78f7c35f5b40aed7109cc62a2ffa79b9c914f72a54a47752f689` → `sha256:211b1f87ffb8c026ff42cb9ee1346b43aa39ccc30085017d2434d4e1b9811055`; usage projection: `sha256:354d813b1f686b35c4bea643ba043d2d23c4861d8d155fda8dec7bf6a52e628a` → `sha256:2a8cb062d5693d802aa9a1d253020f39d13ce65b1c652789226915b45d9cab8a`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:9aca58e132973f0d7bef388174d0824601ad9906536854d57add69e4b6e77ea9` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:d4eb8463fec27de259aa646cd275b8b39d1ec91a152cb7f536781079d791bf5f` in docs/drafts/phase-2b5-objective41-platform-glossary-proposals.json, field deferredSelectedRows. Review row `sha256:85eeac155cd32d4610e665b1b941835a542e07832c1224cc6c470ac5e25ee77f`. Lexical source union: 3 references, with zero inferred delivered teaching or parent credit.

[nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-124r2.pdf): Section 5.1.3: employee-owned CYOD is a counterexample to mandatory enterprise ownership.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## DNAT

Record `glossary:dnat`; source `src/App.jsx:2285`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** The definition omits destination-address/port rewriting and limits the mechanism to public inbound traffic and internal hosts. Netfilter permits destination translation in output chains for locally generated traffic.

**Codex-reviewed LOCAL proposal:** Destination Network Address Translation — Translation that changes a packet's destination IP address or transport port. Public-to-internal forwarding is one use; the mechanism can also apply to other traffic.

Exact prior definition reused. Locally generated/output-chain translation is a counterexample to public-inbound-only wording. Source translation changes a different endpoint; no network rule or connectivity is tested.

Current→candidate source: `sha256:baa387ad25e226d7bf8ed48d1399d6ae46fa7825966bf8ec66b89008638888d8` → `sha256:638edc852077af87c2ccbb773d843c4c166e96b8cdb9b4294b3a7e2ab749cee6`; definition-value: `sha256:4cef04da7b4848713e7885eaf4fd8ad11deba35eb3f8d60125b6e8831a5f8c0e` → `sha256:815e68a85237bb2b44e5879672f71852af9e7426af21e0cee7b78fbb83635151`; rendered entry: `sha256:4cef04da7b4848713e7885eaf4fd8ad11deba35eb3f8d60125b6e8831a5f8c0e` → `sha256:815e68a85237bb2b44e5879672f71852af9e7426af21e0cee7b78fbb83635151`; usage projection: `sha256:b4b5b25ac8a12516e119270d9500968a7495faeee153d17bfe132c3e48b7aef7` → `sha256:66012bc59e80aea073064da73ebc78ec64d2d4528b49ed2065096e66a6254111`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:7dd7e9e079701ac1c2b354d0cdd4e515da77c6d362eff84070fa5f2a42a4fc0a` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:a547d2dcadf00247642d752744c5328c9b3eefbff5245da31b15e7e9284bf820` in docs/drafts/phase-2b5-residual-access-protocol-glossary-proposals.json, field deferredSelectedRows. Review row `sha256:358e827c4e2a927e7e408eeb0ac6887e6b9239a8910e317c91b16bcbcae4ae85`. Lexical source union: 0 references, with zero inferred delivered teaching or parent credit.

[netfilter.org](https://netfilter.org/projects/nftables/manpage.html): NAT statements: destination address/port rewriting and output-chain use. No rule or network action executed.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## OWASP

Record `glossary:owasp`; source `src/App.jsx:2340`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** Open Web is historical; OWASP now expands to Open Worldwide Application Security Project. Community authority is not a regulatory or certification power.

**Codex-reviewed LOCAL proposal:** Open Worldwide Application Security Project — Nonprofit foundation and community developing software-security resources, including the OWASP Top 10. Its guidance is not a regulatory approval or security certification.

Exact prior definition reused. The current foundation name replaces the historical Open Web expansion in this offline draft only. Top 10 is not a complete assessment or proof that software is secure.

Current→candidate source: `sha256:558065aa1f1fad5fcf6c6a8cdd7971f19ec03dc31f885a9e84f83f2f878c098e` → `sha256:b984d539443f95449af848fce9134ed758358e5b2f323b4815aafec0d2644244`; definition-value: `sha256:f9e31d9acb5b90e405372331bfd432ee7032c95452b9787cc4f00b139459d42b` → `sha256:7f47fc08a3927b81a93cdf81c5dac33a2479912d15ae88bc82fb920893bad1e0`; rendered entry: `sha256:f9e31d9acb5b90e405372331bfd432ee7032c95452b9787cc4f00b139459d42b` → `sha256:7f47fc08a3927b81a93cdf81c5dac33a2479912d15ae88bc82fb920893bad1e0`; usage projection: `sha256:69767883433313901f08ef1d87c2458faf9bc71df3e47f2cf7d6e19efad63dd9` → `sha256:c0a670cc76a6605131f85cd0cc720dc412293ca200a8af2c6a93f471e1d10a1b`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:52187ff8139f37f57400904b6676145563ebb05db33a47d530dac5a9b2313de4` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:67e736cd22a35b60c1604214cd5c287991572b4d1c3c4120d258621fb8ecc8d4` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json, field preservedGlossaryDeferrals. Review row `sha256:38e82894939d1db14681087b793bf97592c404c8d387c5591b081ebb773346bd`. Lexical source union: 4 references, with zero inferred delivered teaching or parent credit.

[owasp.org](https://owasp.org/about/): Current foundation expansion and community scope only.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## PHI

Record `glossary:phi`; source `src/App.jsx:2348`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** The current text substitutes unspecified strong regulation for defined scope. HHS ties HIPAA PHI to covered entities/business associates and describes exclusions; identifiable health information alone is insufficient.

**Codex-reviewed LOCAL proposal:** Protected Health Information — Under HIPAA, individually identifiable health information held or transmitted by a covered entity or its business associate, subject to defined exclusions.

Exact prior definition reused. Not all personal health information is HIPAA PHI. Some employment and education records are excluded; actual classification depends on context. No real records or legal applicability are decided.

Current→candidate source: `sha256:a4b37ec7e3d08dfdd5646cfd5e01898577682522e040028b186fc35e26cc0f36` → `sha256:1ba93062fe4762ee689d1266407d100fe372c29e12f06b3a56b5a28a09ee67ba`; definition-value: `sha256:feb68690f4d8391305be2e97f4fdc34c1c5a7e49938da3d77d0ae6f5d0a97454` → `sha256:2e4e470f1b2b5884c5f8193df9bca33306a398c936bc99cdddd8388363700b0c`; rendered entry: `sha256:feb68690f4d8391305be2e97f4fdc34c1c5a7e49938da3d77d0ae6f5d0a97454` → `sha256:2e4e470f1b2b5884c5f8193df9bca33306a398c936bc99cdddd8388363700b0c`; usage projection: `sha256:4218d11c57cb9ff443f154e1af42f4812cbad2c493f92627203e7413ecd90020` → `sha256:f3bc38c910f7c08cca6126b43d0ddb0f936ae7e68fd2d5adac2b9979bbee29f0`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:5754272db8a9ceab469d5a7c7602db90502664d24c104ca213b621f9fc44baa4` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:2a962de7fc325a9ce8f9165f856d0963657086760cf8e7acc51042a30622fd8a` in docs/drafts/phase-2b5-data-classification-privacy-proposals.json, field deferredSelectedRows. Review row `sha256:671ba538e7f9ca793b45a448a5bf8ae51303d0b52ffc133fe6072c4a9985a071`. Lexical source union: 5 references, with zero inferred delivered teaching or parent credit.

[www.hhs.gov](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html): What Information is Protected and covered-entity/business-associate context and exclusions; no legal classification or advice.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## SOC

Record `glossary:soc`; source `src/App.jsx:2369`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** The compound entry combines center and report meanings, uses historical Service Organization Control wording rather than current System and Organization Controls, and also receives chip-context SoC matches.

**Codex-reviewed LOCAL proposal:** Security Operations Center / System and Organization Controls — Two meanings: a security operations team or function that monitors and responds to threats; or the AICPA assurance-services suite associated with reports such as SOC 2. Context determines the meaning. This entry does not cover chip usage.

The prior three-sense SOC draft is not adopted. The candidate preserves operations and assurance as two senses; chip usage remains a separate usage hold. Preserve the current operations/assurance two-sense boundary. Case-insensitive SoC chip mentions still select this key; a definition-only draft does not repair that usage. No third sense, context router, alias or canonical split is approved.

Current→candidate source: `sha256:32ad65efbd30fbe4459eccdde0074ab82c9e40bb79524c6a3646233cc152b75b` → `sha256:32901d20e3231a7840617ee3b91cee121081727420656f0507dc47eca1a509a4`; definition-value: `sha256:f79b39f4675fc4014ff9297f999e809c1f5bd1dfa872f0826ac649c03786fa90` → `sha256:e6d91f95056ab1825d1fe18c207a3b9aa26bf72c9e20b26fc32dd1f10f113f7f`; rendered entry: `sha256:f79b39f4675fc4014ff9297f999e809c1f5bd1dfa872f0826ac649c03786fa90` → `sha256:e6d91f95056ab1825d1fe18c207a3b9aa26bf72c9e20b26fc32dd1f10f113f7f`; usage projection: `sha256:d0827ea48e4b5c30b8bd23c1446380ac7410451d4d137fa9709dcc4ef91912b7` → `sha256:8ccfbb96412fb6c45923427c502471d821e510ce066125559ee7ceac3f394c09`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:11a9a98ca64898ca93d1610c00548965d3a0bb4b74b0d335ce6146b31dfd2d0f` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:db86867d4ba54077b90a169937b40c756786f81772b432e27859f01804e770fb` in docs/drafts/phase-2b5-objective31-glossary-proposals.json, field deferredSelectedRows. Review row `sha256:e412b0403f0ae0acbbab3541f9d15f4a693a41f47e26f810263dabd08ddf4669`. Lexical source union: 9 references, with zero inferred delivered teaching or parent credit.

[www.aicpa-cima.com](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services): Current System and Organization Controls name and assurance-report context only. [learn.microsoft.com](https://learn.microsoft.com/en-us/defender-xdr/integrate-microsoft-365-defender-secops-roles): Opening scope and SecOps roles: security operations teams and monitoring/response functions. No required organizational structure or chip alias.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## SQL injection

Record `glossary:sql%20injection`; source `src/App.jsx:2397`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** Changes a SQL query omits the critical distinction between input treated as data and input interpreted as SQL code with unintended semantics. Safely bound inputs can change query values/results.

**Codex-reviewed LOCAL proposal:** A vulnerability in which untrusted input is interpreted as SQL code, changing the intended meaning or behavior of a database query. Safely bound parameter values remain data.

Exact prior definition reused. Same vulnerability meaning as SQLi, with a separately bound phrase-key record. A legitimate bound value can affect results without being SQL injection; non-web SQL-using software can also be affected.

Current→candidate source: `sha256:909f227de99d25202e56848a2ba7f3543e8e3f96bde902dcd5d7c2468dfa7110` → `sha256:52bbe2a243a078f0062028ff57e37cb8cb409c3905617dc79e5d44002ad2c582`; definition-value: `sha256:f366aa1b2b8a46ec406e184101eec51fd88d0c4798c78bf1639415c65f3201c2` → `sha256:cd6b15d16abca40a11da1860d1133db7af6e3b93b7142d0e1d7096dbd9b95c86`; rendered entry: `sha256:46d7720d925f6d541243b02bd8d2e6c30006f30c0703ce75b8c34752b3c78025` → `sha256:4efffd9d3d91359516ad53ef081e7ef2fe88d74fad08e61bfe2055ac772d821f`; usage projection: `sha256:43efb1884fee60c9605d8e2270e6320e32ad99bb5de2ebfbc5a18b1ab64c782e` → `sha256:acaef9d0d2f5d7c16e7355adc70def98c77547666a0e0121468063e9926b0c82`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:63ffba7ea3e38f739a045b2a86d1ba1970642597e4cfffa7f1d9f78f1d8ed99c` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:2b67dc40ca5675ddbf65854919706416ccd22af43b5d240829b39b6138553d45` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json, field preservedGlossaryDeferrals. Review row `sha256:02cb6845438e6d89baf4df27443a3ce97c0bf9f8b0080da288f16de0abd557cb`. Lexical source union: 25 references, with zero inferred delivered teaching or parent credit.

[owasp.org](https://owasp.org/www-community/attacks/SQL_Injection): Data-plane input versus SQL command execution; parameterized example and non-web platform scope only. No exploit run or universal impact claim. [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html): Prepared statements/parameter binding keep code separate from data. No query, exploit or application was executed.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## SQLi

Record `glossary:sqli`; source `src/App.jsx:2371`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** Changes backend database queries has the same missing code/data distinction; web-only wording also narrows a vulnerability possible in other SQL-using software.

**Codex-reviewed LOCAL proposal:** SQL Injection — A vulnerability in which untrusted input is interpreted as SQL code, changing the intended meaning or behavior of a database query. Safely bound parameter values remain data.

Exact prior definition reused. Same vulnerability meaning as the phrase SQL injection. Equal draft wording does not merge the two catalogue records, approve their observed nodes or create two independent skills.

Current→candidate source: `sha256:87b715a70e29d6d69c740fda8937ddef73413a2ee2758c3952f69d511231605f` → `sha256:9acfbbe94f13a118b53e2a93321b487c7b188d770f31e13fbf6192035767c44a`; definition-value: `sha256:e1e06fa82fa6bbc5581945f01b307a2b2b21ee00c96a7757a80bb0066a44374f` → `sha256:2d17103918669889133be08906a0ea7a96a72fdad6fe7c6df758fecc7258870d`; rendered entry: `sha256:e1e06fa82fa6bbc5581945f01b307a2b2b21ee00c96a7757a80bb0066a44374f` → `sha256:2d17103918669889133be08906a0ea7a96a72fdad6fe7c6df758fecc7258870d`; usage projection: `sha256:d6251c829cf861b735ca9083ca64260764af72eca58db02f42b86f68c15105ab` → `sha256:359e026166eaae6b6e9a2ed6eb34dad73e5c02eb691442625fdc047d4bf748d9`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:91ecb906c7adf10153975fadd62b6664af5f11500ed2f47ebf84b9ee0b35a684` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:51a3317786553aefe800559c63d3566318ccbb1355b899651c190f49783b8f35` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json, field preservedGlossaryDeferrals. Review row `sha256:bb409d7294f8dadb0253032295768600924c3c2f165a675a85e33a3780c926d3`. Lexical source union: 2 references, with zero inferred delivered teaching or parent credit.

[owasp.org](https://owasp.org/www-community/attacks/SQL_Injection): Data-plane input versus SQL command execution; parameterized example and non-web platform scope only. No exploit run or universal impact claim. [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html): Prepared statements/parameter binding keep code separate from data. No query, exploit or application was executed.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## SRTP

Record `glossary:srtp`; source `src/App.jsx:2372`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** The categorical encrypted-transport description fails the historical RFC 3711 section 4.1.3 NULL-cipher counterexample. This does not recommend that mode or judge current cipher policy.

**Codex-reviewed LOCAL proposal:** Secure Real-time Transport Protocol — Profile that can protect RTP and RTCP media traffic with confidentiality, message authentication and replay protection. Actual protections depend on configured transforms and key management.

Exact prior definition reused. The historical NULL cipher supplies no confidentiality. This definition describes available protections rather than guaranteeing all of them; it is not a current cipher recommendation or operational configuration.

Current→candidate source: `sha256:bad78ec629823eefa280b7c80a882d319f9a9b4a0ecd316c48d7d219621c86a4` → `sha256:131010c91da2637b15a6402d80aa76f842d7a465bb60b8a7e482533874b6adfa`; definition-value: `sha256:acf41bdf39b990933da8e306ecbd3e793c688cb8f5946ae4c7c5dd24aefc578f` → `sha256:2a861c97bffc5f823a3b5fadcfa58a577b8a5775e7e1a1013d8ba176a9e38726`; rendered entry: `sha256:acf41bdf39b990933da8e306ecbd3e793c688cb8f5946ae4c7c5dd24aefc578f` → `sha256:2a861c97bffc5f823a3b5fadcfa58a577b8a5775e7e1a1013d8ba176a9e38726`; usage projection: `sha256:0c54bf336a7ab4af71f2f046786085b58c18ae6a666c181204dd7cc1271856cb` → `sha256:7dca5e06d9c2861555c60bd7d6fd0991eaf46083bbac8ecd78017dfa5f5aa06d`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:ae7394317c9edf58a1c734f0c409b38e368ec0f368734858de06db2ca51ee204` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:8e07c1776a275d96ee89de093e684f3b68fbe1b2265ffee2af7ecb9dd8d419af` in docs/drafts/phase-2b5-objective41-platform-glossary-proposals.json, field deferredSelectedRows. Review row `sha256:f0d10657129f2f454844c8a013f776be7642012a969bf97686db123c27ecc67e`. Lexical source union: 2 references, with zero inferred delivered teaching or parent credit.

[www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc3711): Historical section 4.1.3 NULL cipher only; counterexample, not a recommended configuration or current profile audit.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## SSH

Record `glossary:ssh`; source `src/App.jsx:2373`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** Historical RFC 4253 section 6.3 explicitly permits a nonrecommended none cipher. The categorical description alone cannot establish negotiated confidentiality, host verification or authorization.

**Codex-reviewed LOCAL proposal:** Secure Shell — Protocol suite for remote login and other network services, designed to authenticate the server and protect channel confidentiality and integrity. Actual protection depends on negotiated algorithms and configuration.

Exact prior definition reused. Host verification, client authentication and authorization remain separate requirements. Historical optional none encryption is a counterexample, not a recommendation. No connection or current algorithm policy is assessed.

Current→candidate source: `sha256:c8461c36a4ee1bdb9e35f61298a24bcd79ca0754186ce7633ebd989ffc288a47` → `sha256:5e260754b10eb26e30870c3e92dba35e0f2eaefb6e19ec66e5a54fd38590531b`; definition-value: `sha256:3b1f654fb83f159cbcccf25fafbef4ff48a30e5c5be213d90ebee14e088212de` → `sha256:d95a1f4bb8b3b8301ef8fde8fa9c2eefaa6b539ac98228382893107e54d1441e`; rendered entry: `sha256:3b1f654fb83f159cbcccf25fafbef4ff48a30e5c5be213d90ebee14e088212de` → `sha256:d95a1f4bb8b3b8301ef8fde8fa9c2eefaa6b539ac98228382893107e54d1441e`; usage projection: `sha256:6525b723eeffbf3fda7a269c1ef31d9c4cebd3039ad7992bdda75ae713541721` → `sha256:c21e6eb76d627ae961839b7cad82eb6da3b295d8859b5658bf8dafd71ca3fd47`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:6cd82119c54823bb2378cf8acc8f9c4fd0edee48000183ec879325f82434f2ca` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:812ec039b801635b002e91bb4f0facc2b6347bb70c9819bfb02651dfe827ee23` in docs/drafts/phase-2b5-objective41-platform-glossary-proposals.json, field deferredSelectedRows. Review row `sha256:f15979d81642d796a19cc6c62f3f6191dde655edc303c569fa299bfa0b9a622f`. Lexical source union: 11 references, with zero inferred delivered teaching or parent credit.

[www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc4253): Historical section 6.3 optional none cipher explicitly not recommended; no contemporary deployment or cipher recommendation. [www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc4251): Abstract and introduction: remote-login/services purpose; server authentication and client authentication are distinct. No current cipher recommendation.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## SSID

Record `glossary:ssid`; source `src/App.jsx:2374`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** SSID name broadcasting can be disabled while the identifier remains configured. A name does not prove AP identity, authentication or encryption; the broadcast clause is not universal.

**Codex-reviewed LOCAL proposal:** Service Set Identifier — Identifier naming a wireless service set. Its name can be advertised in beacons or withheld from those broadcasts; the name alone does not authenticate the network.

Exact prior definition reused. A configured SSID still exists when its name is not broadcast. Suppression is not encryption or reliable concealment, and a copied name does not establish access-point identity.

Current→candidate source: `sha256:0b2ef0baeb15de5a045aa9181b5735eafce2af912f9d7e1b054257bf47c44727` → `sha256:228f20def74259486c16dcaf6ec0c44c9f46f9715cf2d55b0378bcc1b6122ad7`; definition-value: `sha256:5a5db762f2917ccc7903d0edc770457557056f1d225c1cee81f65844d35ce576` → `sha256:14305818bc9ee95e191db2926eaa66b34f70df86efeceb34afb36c8abde7aa29`; rendered entry: `sha256:5a5db762f2917ccc7903d0edc770457557056f1d225c1cee81f65844d35ce576` → `sha256:14305818bc9ee95e191db2926eaa66b34f70df86efeceb34afb36c8abde7aa29`; usage projection: `sha256:c0ca55134e7503ff521481b9797f912c8f609aa50a9454351446c46d6ed0b5fd` → `sha256:87ce86e9aadf857aeeaa651f043fb73f82f73fa67eb8cf007ade50afff2c8ee5`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:741d1569b7d2c6048d4feb4c57b632d3a7d959049d82e8fe73fafe838d3264cd` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:5683f3949e0fd691f17755f12369cf1962a87be616d489b6ebb37ac5b1e93eb8` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json, field preservedGlossaryDeferrals. Review row `sha256:2cf98d3f2111d1c6227d533321c7391efe5f92abb2b4e60f7d5ed2d59ede40f3`. Lexical source union: 3 references, with zero inferred delivered teaching or parent credit.

[www.cisco.com](https://www.cisco.com/c/en/us/support/docs/smb/wireless/cisco-small-business-100-series-wireless-access-points/smb5177-disable-ssid-broadcast-on-a-wireless-access-point.html): Legacy WAP example separates configured SSID and broadcast setting. Do not adopt its security/undetectability claims.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## ZTA

Record `glossary:zta`; source `src/App.jsx:2392`, file SHA-256 `f7ee10eb1685036dff67b6f4fdd700ad6c30a87ceef7361f127e536056e40d49`.

**Retained root-cause hold:** Never trust, always verify omits resource-focused authentication/authorization and no implicit trust solely from location or ownership. A neighboring ABAC/Zero Trust entry cannot supply missing semantics.

**Codex-reviewed LOCAL proposal:** Zero Trust Architecture — Architecture that protects resources through explicit authentication and authorization, without granting implicit trust solely because of network location or device ownership.

Exact prior definition reused. Authentication and authorization are distinct and consider subjects and devices before resource sessions. The slogan is a mnemonic; ABAC may inform a policy but is not the architecture itself or proof of secure operation.

Current→candidate source: `sha256:16e75b6db91b31d2d0d124cf0c947036747e385b040ee4abad72029562ee6b8c` → `sha256:a98cb93fef9ca530bb434629c74844a2d3626ec0bb8d3c32b700ddfdb8a93de2`; definition-value: `sha256:783435b66103df8113c5eb82c3556e83aac4af9a88ce7e53db0b39079a5d42f9` → `sha256:afdf152ec1c63536e4cb8a23b3e52c6b049ef9d281f7f93584ea8b73ef5ccdb7`; rendered entry: `sha256:783435b66103df8113c5eb82c3556e83aac4af9a88ce7e53db0b39079a5d42f9` → `sha256:afdf152ec1c63536e4cb8a23b3e52c6b049ef9d281f7f93584ea8b73ef5ccdb7`; usage projection: `sha256:bdf1ee04607df6b6327b753307fe97444e68e1e8bb83239d3056fbaf3f254058` → `sha256:8927342585a8e83c547f0b0a8c59e9a97d7c898ab8d73c431cb17072fbbfd8e9`. The latter binds unchanged source references/field projections plus the candidate popup entry, not an installed usage change. Full-name/definition-text subfield hashes are in the packet.

Prior draft row `sha256:85b3d803273e77fdda5fdad1660870eeff7c08caacd6f50fcd40e3da6dac34f9` in docs/drafts/phase-2b5-glossary-definition-drafts-proposals.json; original hold `sha256:679b86ecb786fdb2206c6019a77d92ea330aee6557f82fefcb3729f50e62c83b` in docs/drafts/phase-2b5-objective31-glossary-proposals.json, field deferredSelectedRows. Review row `sha256:e66bfd5c9b5a20643ba26bd96acea6df09c541cafd378c51235343a2976c49ed`. Lexical source union: 1 references, with zero inferred delivered teaching or parent credit.

[csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/207/final): Publication abstract: resource focus, location/ownership not sole trust basis, distinct authentication/authorization. Full standard not assessed.

Semantic and owner/editorial holds remain; current/new/remaining qualification0/0/1.

## Matcher, renderer and collision order

The pinned prior12-row source probe is reused unchanged from scripts/audit-twelve-held-glossary.mjs; the prior writer/census is not run. The actual formatter, longest-key-first matcher, case normalization, exact getEntry and splitGlossaryParts expressions execute against current and candidate dictionaries. All162 keys and their string/object shapes stay exact; the150 unselected values remain byte-equivalent. Full-name changes do not introduce matcher aliases. SQL injection sorts before SQLi, but both remain separate keys, source revisions and observed support nodes. Equal candidate wording does not merge their identities or create two independent skills.

The source108 and candidate108 case/format/boundary probes agree, with24 further contextual cases. A whole formatted SQL phrase matches; split formatting, hyphen, extra spaces, newline and concatenated SQLInjection do not create phrase aliases. ASCII alphanumeric boundaries reject xSOCz/SOC2 but accept underscores and non-ASCII surrounding letters, so the matcher is not a general linguistic tokenizer. Expansion-only text such as Business Partners Agreement or Security Operations Center does not automatically invoke its acronym key. Normalized hits resolve the original exact key; direct getEntry lowercase or alternate-case calls return empty entries.

Operations SOC, SOC2 report wording with a separator, and chip-context SoC all still normalize to the same key. The candidate preserves exactly the two current operations/assurance meanings and corrects AICPA naming. It explicitly says chip usage is outside this entry. This does not repair chip-context routing. The previous three-sense draft is separately fingerprinted and not adopted; no third alias/sense or identity split is approved.

The actual source renders term/fullName/definition as text nodes, with click/Enter/Space controls and outside-pointer close. Twenty-four current/candidate static text specimens and one new hostile-string escaping check pass; source probe also replays its12 current specimens and escaping check. This is not a full interactive component or browser/accessibility test. Popup definition text is not recursively parsed, and separate context notes are not automatically delivered. Opening or reading a popup does not establish learner mastery.

## Actual source call sites versus lexical occurrences

The66 lexical source-reference union is revalidated against exact current parent revisions. It is not66 visible popup encounters. The existing actual stem splitter, wrong-option feedback helper, paragraph splitter and glossary helpers reproduce53 MCQ field-group projections,2 lesson paragraph segments and3 plain table observations. MCQ feedback retains its submitted/Pro condition; option ancestors are disabled after submission, so keyboard/pointer interaction there remains unverified. Collapsed lesson support text needs expansion; lesson entry/access still applies. Cards and table cells use plain text.

This slice additionally inspects10 public/local PBQ parents with24 matching raw field occurrences and30 conditional practice/completed-exam source projections: 22 parser-call projections and8 plain-text projections. Those counts have different units and do not add to66. Choice/options and wrongFeedback/optionFeedback aliases are distinguished; shadowed aliases do not create additional delivered evidence. Scenario and effective option-feedback prose call the glossary; terminal output, evidence diagrams/logs and selector/correct-answer labels remain plain. Practice part solutions can call the glossary, while completed-exam blank solutions are omitted and main solution text is plain. No terminal command, answer submission, feedback-grading helper, native compiler or learner handler is executed.

| Entry | Lexical source references | MCQ field groups | Lesson segments | Plain card comparisons | PBQ projections |
|---|---:|---:|---:|---:|---:|
| BPA | 1 | 0 | 0 | 1 | 0 |
| CYOD | 3 | 3 | 0 | 1 | 0 |
| DNAT | 0 | 0 | 0 | 0 | 0 |
| OWASP | 4 | 0 | 0 | 0 | 0 |
| PHI | 5 | 3 | 0 | 1 | 0 |
| SOC | 9 | 6 | 0 | 2 | 4 |
| SQL injection | 25 | 31 | 0 | 2 | 11 |
| SQLi | 2 | 0 | 0 | 1 | 0 |
| SRTP | 2 | 0 | 1 | 1 | 0 |
| SSH | 11 | 8 | 1 | 2 | 15 |
| SSID | 3 | 2 | 0 | 0 | 0 |
| ZTA | 1 | 0 | 0 | 1 | 0 |

DNAT has no current source-reference union; synthetic matching does not establish a delivered lesson. m723 metadata lists SQLi, but its inspected visible feedback matches the phrase SQL injection; metadata cannot establish an SQLi popup. OWASP lesson metadata/profile occurrences do not become paragraph delivery just because the name appears. All source parents and existing held targets remain exact, with zero glossary/card/lesson/objective credit transfer.

The just-gated13-term packet is bound by its glossaryChecks/collisionChecks/neighborChecks/deliveryLimits fields. Its13 selected IDs occur once with zero exact-label/shared-node collisions; its inspected label/current/candidate meanings contain zero matches for these12 held glossary keys. It separately binds the ZTA acronym-card comparison and other neighbors. That absence is finite and lexical; plain term-card faces still do not render glossary popups, and neither the term drafts nor neighbors clear these holds.

## Semantic boundaries and any later owner decision

BPA naming is now supported by the official SY0-701 objectives/acronym list. The proposed security-partner responsibility wording is reviewer synthesis of the native card context and NIST's broader security-agreement guidance, not a universal legal contract definition or an approved canonical rename. CYOD choice does not prescribe ownership/payment; DNAT describes endpoint rewriting beyond inbound forwarding. OWASP resources are not regulatory clearance. HIPAA PHI has scope/exclusions; no health record is classified. SQL inputs used as data differ from unintended SQL code. SRTP/SSH describe available/intended protection, with historical unencrypted counterexamples and no current algorithm recommendation. SSID name suppression is not authentication. ZTA names resource-focused authentication/authorization without transferring ABAC or neighboring card approval.

No owner answer blocks this offline review. One concrete later usage issue remains: **SoC processor still opens the operations/assurance SOC popup.** Recommendation: review contextual suppression of this unrelated popup before later publication while preserving the two senses; do not silently add a chip sense or split an identity. No routing choice is implemented or approval inferred. SQL injection/SQLi stay separate as instructed, so their merger is not reopened.

## Prior + new + remaining

| Measure | Prior | New current credit | Combined / total | Remaining |
|---|---:|---:|---:|---:|
| Selected glossary qualification |0|0|0/12|12 held|
| Glossary |150|0|150/162|12|
| Cards |271|0|271/313|42|
| Catalogue |1694|0|1694/1878|184|
| Support |748|0|748/834|86|
| Questions |463|0|463/483|20|
| Full feedback |464|0|464/483|19|
| COMPLETE pairs |456|0|456/483|27|

Draft identities12 prior +0 new =12:11 exact definitions reused and1 SOC revision supersedes earlier draft wording only in this packet. All181 holds remain:12 selected +169 others, zero additions/resolutions. All184 remaining catalogue IDs,180 remaining held identities and4 unheld private records stay exact. 154 prior packets reconcile1694 distinct credited records,786 instructional occurrences/772 distinct/14 repeats,752 inherited fields,81 immediate baseline fields,478 file bindings and25 protected release hashes. No duplicate glossary, card, lesson, deck, objective, family or assessment credit. Compact census/objective references, ledger, native-v1/v2, source-selection and active package are unchanged.

## Checks, retrieval limits and repository delivery

The focused guard rejects **1752 altered packets**, including fully rehashed crossed definitions, stale source/definition/usage/field signatures, false tooltip/alias/context claims, adoption of the old three-sense SOC draft, SQL identity conflation, erased holds, duplicate credit and private/learner payload injection. Equality guards protect manually reviewed definitions and claims; they do not prove educational effectiveness or universal factual correctness. Required gates: deterministic write/recheck, syntax, all29 mapping tests/exact package reproduction, git diff --check, skip-deploy exit0/control1, task-only commit/push and remote byte/ref verification.

Primary references were read only for the named sections, abstracts or indexed passages. NIST800-124r2 final PDF/indexed section5.1.3 supports employee-owned CYOD as a counterexample; targeted PDF find failed, so no full mobile-policy review is claimed. Initial bare RFC3711 retrieval failed; the RFC Editor HTML version supplied sections4.1.3 and protection context. Official exam objectives support BPA naming/context only; NIST broader information-exchange guidance is explicitly distinguished from a BPA definition. Historical RFC none/NULL modes and a legacy Cisco setting are counterexamples, not current configuration advice. No full standards, legal applicability, protocol conformance, wireless scan, network rule, exploit, health-data or deployed-browser assessment.

Unchanged dependency hashes retain7 prior native npm advisories (critical1/high4/moderate1/low1), unfixed; no fresh security clearance. No runtime/shared helper, canonical metadata/teaching link, human approval, private payload/database, real learner state/storage/analytics, build/browser, automation, deployment or activation change. Deliver only this audit, packet and report with [skip deploy], preserve eight unrelated dirty entries and verify exact remote refs/bytes. **Codex-reviewed LOCAL proposals only; NOT READY for activation.**
