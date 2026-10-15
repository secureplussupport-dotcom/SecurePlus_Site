# Phase 2B-5 — field-bound glossary corrections and owner-choice previews

**LOCAL DRAFTS ONLY; 150/162 glossary credit and all181 holds unchanged.** Baseline:45b14f67bef206236c0e108e5829c84aa3bc9031. Exactly BPA,CYOD,DNAT,OWASP,PHI,SOC,SQL injection,SQLi,SRTP,SSH,SSID,ZTA. The approved master plan remains product authority; the Phase1 audit supplies historical facts. Naming/identity decisions are held before any behavior change. No active source is edited.

The existing twelve-held review and twelve-definition draft packet are reused, not counted again. This slice makes a narrower reviewable advance: ten single-definition drafts plus two explicit owner-choice rows; four old definitions refined, six retained, BPA's conditional security-partner alternative and SOC's three separate sense previews; exact current/candidate field fingerprints and fresh primary-reference version/scope records. These are14 review options, not14 new glossary identities or teaching credits. No new glossary/module/alias routing or dependency is installed.

## Candidate text, field revisions and reference scopes

### BPA — owner choice required

**security-partners-context** — Business Partners Agreement

Agreement recording responsibilities and security expectations between business partners.

Scope: Conditional security-partner sense supported by the existing local card; no legal-partnership or profit-sharing definition is approved.

Field `fullName`: current `sha256:ef8595e2687684bcfa00660fd6b7aaba5aed7049acc18038a520271cc6c991fb` → candidate `sha256:9a3c1b81422d8aafaa4a6d3042c6a7c4dc6222bad38aed497e9db7eb41b6af18`.
Field `definition`: current `sha256:c230bc38fcff55bca95375cddae545ea08c634643c54f1a34bb2dfd2131d3c22` → candidate `sha256:b579b2b14ff231149dee35abe32894b347b1cff76b36522169d205e4ee09add8`.

Candidate record `sha256:2d1b5f1d2d1538f378a2a372c72063c3af6312f6089b74f436689c9b1c78b492`; value `sha256:7a6cd3c7c16d4ffc4907dddb42702584d9bd5ad074db75a649f65657ce3dca96`.

Decision: Confirm security-partner naming/scope or request separately reviewed legal-partnership wording; no default canonical identity. No candidate is selected by default.

Current record `sha256:e68748c4ff5d75aa8a898a86e5764e092fd74e42b38bbd5d8110d1dea914bdbc`; current value `sha256:002669e9e7b148f53b9b0a15f5a7992c7e659efacb624dd86e9d14c11561fcda`; current source `src/App.jsx:2255`. Prior draft `sha256:88ac9c69d19d746d85619116022a73a831be080c6724fd8e472ad4312413d893`; new complete draft `sha256:7279612349161487826c83c8c9c7030c6b3bfeed72826c437a02828f30ac18e2`.
Primary product context: the existing Business Partners Agreement flashcard at `sha256:02813847a0018293590826e008a8aced7477e9d97cc4072cddbd0a7630fa6b39`. This is not a legal/canonical naming authority.

Cross-link: Preserve existing lexical source references; review ambiguous parent contexts before any future link approval. All current holds and zero new credit remain.

### CYOD

**definition-draft** — Choose Your Own Device

Device-use model in which employees choose from an organization's approved device list. Ownership and payment depend on the organization's policy.

Scope: Approved-list selection does not itself establish ownership, funding or management controls. NIST describes an employee-purchased example; this is not a new BYOD/COPE taxonomy.

Field `fullName`: current `sha256:a25359bea6bd739f85f69261a431782de4d2f2380ff229b3fb30368202b7115e` → candidate `sha256:a25359bea6bd739f85f69261a431782de4d2f2380ff229b3fb30368202b7115e`.
Field `definition`: current `sha256:cae8a03da82cae85f8674a3b13e1d4b571a68d285c03d7da43e39dd40cef4f05` → candidate `sha256:23e1a6efddc75643c27e10bbada2aeddef151be9895a29d0fcb140fec6f24e4e`.

Candidate record `sha256:2432c19af88d0e6d294bc6c12f8686ebbac70db8c277baea292731348d037eda`; value `sha256:211b1f87ffb8c026ff42cb9ee1346b43aa39ccc30085017d2434d4e1b9811055`.

Decision: Draft wording can be reviewed without a new naming choice; activation and human review still required. The single candidate is available for explicit offline preview only.

Current record `sha256:699175d96e6799cb7c081d10280278ec4d9c01e4a1bc904619648a04ddcd3888`; current value `sha256:c9bdbeeb4e1b78f7c35f5b40aed7109cc62a2ffa79b9c914f72a54a47752f689`; current source `src/App.jsx:2273`. Prior draft `sha256:9aca58e132973f0d7bef388174d0824601ad9906536854d57add69e4b6e77ea9`; new complete draft `sha256:9e772b5d18c8c192ed0117806564352d3d34adb1d6f009508fb1a652859b404f`.
[Primary source](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-124r2.pdf) — NIST SP 800-124r2, May 2023; 5.1.3.3, printed p36. Approved enterprise list and employee-purchased example; no ownership universal.

Cross-link: Preserve existing lexical source references; review ambiguous parent contexts before any future link approval. All current holds and zero new credit remain.

### DNAT

**definition-draft** — Destination Network Address Translation

Translation that changes a packet's destination IP address or transport port. Public-to-internal forwarding is one use; the mechanism can also apply to other traffic.

Scope: Locally generated/output-chain translation is a counterexample to public-inbound-only wording. Source translation changes a different endpoint; no network rule or connectivity is tested.

Field `fullName`: current `sha256:729c4e780cdc542464837ad5a48950fc3832f3e034d63d6eb91b8dee12fa48e0` → candidate `sha256:729c4e780cdc542464837ad5a48950fc3832f3e034d63d6eb91b8dee12fa48e0`.
Field `definition`: current `sha256:ae3d56686989a5b0b15da3fe563b158980d3cee1cddc10c947111af2adfb73b6` → candidate `sha256:3c9d0fd201146a9c70c2a9baf24d45748b43298b2952849960cbf9075185dbd3`.

Candidate record `sha256:638edc852077af87c2ccbb773d843c4c166e96b8cdb9b4294b3a7e2ab749cee6`; value `sha256:815e68a85237bb2b44e5879672f71852af9e7426af21e0cee7b78fbb83635151`.

Decision: Draft wording can be reviewed without a new naming choice; activation and human review still required. The single candidate is available for explicit offline preview only.

Current record `sha256:baa387ad25e226d7bf8ed48d1399d6ae46fa7825966bf8ec66b89008638888d8`; current value `sha256:4cef04da7b4848713e7885eaf4fd8ad11deba35eb3f8d60125b6e8831a5f8c0e`; current source `src/App.jsx:2285`. Prior draft `sha256:7dd7e9e079701ac1c2b354d0cdd4e515da77c6d362eff84070fa5f2a42a4fc0a`; new complete draft `sha256:ec23c8f646cbbd4192727c4ab32f4c21ce91059de434078eaebdd3d466fe9c60`.
[Primary source](https://netfilter.org/projects/nftables/manpage.html) — Online manpage, unversioned snapshot read 2026-10-16; NAT statements; Tables70/71. Destination address/port rewriting and prerouting/output chains; no rule applied.

Cross-link: Preserve existing lexical source references; review ambiguous parent contexts before any future link approval. All current holds and zero new credit remain.

### OWASP

**definition-draft** — Open Worldwide Application Security Project

Nonprofit foundation and community developing software-security resources, including the OWASP Top 10. Its guidance is not a regulatory approval or security certification.

Scope: The current foundation name replaces the historical Open Web expansion in this offline draft only. Top 10 is not a complete assessment or proof that software is secure.

Field `fullName`: current `sha256:2048990b49764a5cb1bb36ea0a573879eb3d2da6c6e51db3d05bdbfec9c05ffc` → candidate `sha256:fa721864cde757bcea17b42b6c7f7a49fb59f283b8c98a69bd74d6d89fa3e0cb`.
Field `definition`: current `sha256:a5adb2d7d2853ac68979df07625ee1fc21069417cd567ee9fbc1d329b364d006` → candidate `sha256:e0994be109cf881d31c0170ff5be377a4df841c1477d288aabd52b748c076ea0`.

Candidate record `sha256:b984d539443f95449af848fce9134ed758358e5b2f323b4815aafec0d2644244`; value `sha256:7f47fc08a3927b81a93cdf81c5dac33a2479912d15ae88bc82fb920893bad1e0`.

Decision: Draft wording can be reviewed without a new naming choice; activation and human review still required. The single candidate is available for explicit offline preview only.

Current record `sha256:558065aa1f1fad5fcf6c6a8cdd7971f19ec03dc31f885a9e84f83f2f878c098e`; current value `sha256:f9e31d9acb5b90e405372331bfd432ee7032c95452b9787cc4f00b139459d42b`; current source `src/App.jsx:2340`. Prior draft `sha256:52187ff8139f37f57400904b6676145563ebb05db33a47d530dac5a9b2313de4`; new complete draft `sha256:d4a0d2c4992f3d5a0a387ef360d4589f1de11ae9e2dd948830a85f17990d9c5c`.
[Primary source](https://owasp.org/about/) — Unversioned foundation page read 2026-10-16; The OWASP Foundation. Current Open Worldwide expansion and nonprofit/community software-security scope.

Cross-link: Preserve existing lexical source references; review ambiguous parent contexts before any future link approval. All current holds and zero new credit remain.

### PHI

**definition-draft** — Protected Health Information

Under HIPAA, individually identifiable health information held or transmitted by a covered entity or its business associate, subject to defined exclusions.

Scope: Not all personal health information is HIPAA PHI. Some employment and education records are excluded; actual classification depends on context. No real records or legal applicability are decided.

Field `fullName`: current `sha256:87267ed24f9023b9ad76ac898108c294e157a87d46b5f0fa59cb109402e4470d` → candidate `sha256:87267ed24f9023b9ad76ac898108c294e157a87d46b5f0fa59cb109402e4470d`.
Field `definition`: current `sha256:3cb0a26ff93ed9f0d47247c304e3405027e2e3d1d95160bd6b5cbd3e9f5892c4` → candidate `sha256:c738ad045e0199a0cc713897b3757de5b90d1f5e56aa85464d772af7a4f392b6`.

Candidate record `sha256:1ba93062fe4762ee689d1266407d100fe372c29e12f06b3a56b5a28a09ee67ba`; value `sha256:2e4e470f1b2b5884c5f8193df9bca33306a398c936bc99cdddd8388363700b0c`.

Decision: Draft wording can be reviewed without a new naming choice; activation and human review still required. The single candidate is available for explicit offline preview only.

Current record `sha256:a4b37ec7e3d08dfdd5646cfd5e01898577682522e040028b186fc35e26cc0f36`; current value `sha256:feb68690f4d8391305be2e97f4fdc34c1c5a7e49938da3d77d0ae6f5d0a97454`; current source `src/App.jsx:2348`. Prior draft `sha256:5754272db8a9ceab469d5a7c7602db90502664d24c104ca213b621f9fc44baa4`; new complete draft `sha256:a1bfa937e53db62d4acee2ba31a37b65c2e5f704d362643b5b54d69fa3bc0a50`.
[Primary source](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html) — HHS summary, content reviewed 2025-03-14; read 2026-10-16; What Information is Protected; covered entities/business associates. HIPAA scope and exclusions; no classification of actual records or legal opinion.

Cross-link: Preserve existing lexical source references; review ambiguous parent contexts before any future link approval. All current holds and zero new credit remain.

### SOC — owner choice required

**operations-center** — Security Operations Center

Team or function that monitors security events, investigates potential threats and coordinates incident response.

Scope: Operations context only; not an assurance report or a chip.

Field `fullName`: current `sha256:b6d391c9a18463e0cbb4becb3fd6e3abae68b858148a64e62732794b92178ec2` → candidate `sha256:f38c8d72d6e1b871689ea8e8b455663eb0e6881ac851de6ffb5b2d5da1c47833`.
Field `definition`: current `sha256:ca1a437cb8db904865c264bafca834f3e7abf323376578fac0040a7bd6cc4393` → candidate `sha256:05c25655e2bae7d9cd31be678d6f238607ae28d7c84dbff90d91210b46deaa39`.

Candidate record `sha256:a34846c6711f6ee8bd38ccd7568453de11026e2a9a02263b08d8344df385023e`; value `sha256:102693b8589a5069c96a56c724fa9d59ed910281e45081bb47a7a626bc48a410`.

**assurance-reports** — System and Organization Controls

AICPA suite of assurance services and reports about organizational or system controls, including SOC 2.

Scope: Assurance context only; no certificate, operations team or hardware identity implied.

Field `fullName`: current `sha256:b6d391c9a18463e0cbb4becb3fd6e3abae68b858148a64e62732794b92178ec2` → candidate `sha256:6811d7dad67d7cd19d27306182dc44450afac2bd7f7976530ba6ba9c87c64aba`.
Field `definition`: current `sha256:ca1a437cb8db904865c264bafca834f3e7abf323376578fac0040a7bd6cc4393` → candidate `sha256:3734fbf9cedca3c4479a5f1e084187d8c70d2b23f8b460580e300022ad5ce829`.

Candidate record `sha256:965f23e47e51c6a76f4f415323d524be78fb99c7262572755c17da0f0673b98a`; value `sha256:18cb57099568c6bf146f8b0147decfbce1b951938951248ddfc24f4736522466`.

**chip-context** — System on Chip

Integrated circuit combining processing and other system components on one chip, often abbreviated SoC.

Scope: Hardware context only; capitalization cannot safely route the current case-insensitive matcher.

Field `fullName`: current `sha256:b6d391c9a18463e0cbb4becb3fd6e3abae68b858148a64e62732794b92178ec2` → candidate `sha256:d61c2cc93227897205e5baf9a47b0de076b63f86ca76b94e12d0ed815973f312`.
Field `definition`: current `sha256:ca1a437cb8db904865c264bafca834f3e7abf323376578fac0040a7bd6cc4393` → candidate `sha256:ea272cc1df7d895adb326adfc35e47d115027155e86780f7e9ece51d492d54d3`.

Candidate record `sha256:8ad6430203cf9ee9c49848c673c2a6cadbb8e57e87c5fdebc73af480ac1c4c77`; value `sha256:0c7fb634f34153acbf8d3289fd37a148a2bbd94ea9a66fec768ff60eef8b3c44`.

Decision: Choose a contextual sense/menu policy and review affected links; no automatic case-based routing or canonical split. No candidate is selected by default.

Current record `sha256:32ad65efbd30fbe4459eccdde0074ab82c9e40bb79524c6a3646233cc152b75b`; current value `sha256:f79b39f4675fc4014ff9297f999e809c1f5bd1dfa872f0826ac649c03786fa90`; current source `src/App.jsx:2369`. Prior draft `sha256:11a9a98ca64898ca93d1610c00548965d3a0bb4b74b0d335ce6146b31dfd2d0f`; new complete draft `sha256:0b96cc42fd1ef3f6fd518a400b3274f57ecd87aa2f652c4d356483f8fe2db018`.
[Primary source](https://www.cisco.com/site/us/en/learn/topics/security/what-is-siem.html) — Unversioned Cisco explainer read 2026-10-16; Difference between SIEM and SOC. Operations-center team monitors, analyzes and responds; no mandatory facility/24x7 guarantee.
[Primary source](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) — Unversioned AICPA suite page read 2026-10-16; Title; introduction; trust/transparency. Current System and Organization Controls name and assurance services/reports.
[Primary source](https://www.arm.com/glossary/soc-development) — Unversioned Arm glossary read 2026-10-16; What is SoC Development. System-on-a-chip integrates processing components on an integrated circuit; no performance/security benefit claim.

Cross-link: Preserve existing lexical source references; review ambiguous parent contexts before any future link approval. All current holds and zero new credit remain.

### SQL injection

**definition-draft**

Untrusted input is interpreted as SQL code and changes a query's intended behavior. Properly bound parameter values stay data. Also called SQLi.

Scope: Same vulnerability meaning as SQLi, with a separately bound phrase-key record. A legitimate bound value can affect results without being SQL injection; non-web SQL-using software can also be affected.

Field `$value`: current `sha256:f366aa1b2b8a46ec406e184101eec51fd88d0c4798c78bf1639415c65f3201c2` → candidate `sha256:b29e11e85b62fa05da491894db2179594bc05133fd14e3ac3ae5481ca55e6944`.

Candidate record `sha256:02759ef572015f5cecffc6ba47b4fb3e7437e2918ff8844036ace6f310a91d2b`; value `sha256:b29e11e85b62fa05da491894db2179594bc05133fd14e3ac3ae5481ca55e6944`.

Decision: Draft wording can be reviewed without a new naming choice; activation and human review still required. The single candidate is available for explicit offline preview only.

Current record `sha256:909f227de99d25202e56848a2ba7f3543e8e3f96bde902dcd5d7c2468dfa7110`; current value `sha256:f366aa1b2b8a46ec406e184101eec51fd88d0c4798c78bf1639415c65f3201c2`; current source `src/App.jsx:2397`. Prior draft `sha256:63ffba7ea3e38f739a045b2a86d1ba1970642597e4cfffa7f1d9f78f1d8ed99c`; new complete draft `sha256:6c8d57642e58175c87aa85c377fd4c464a4a682686d6fd96bcbae8a13cbfe45d`.
[Primary source](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) — Unversioned OWASP cheat sheet read 2026-10-16; Prepared Statements with Parameterized Queries. SQL code/data separation and safely bound data; no exploit or database used.

Cross-link: plain-text lookup reference to glossary:sqli; no clickable popup link, alias or canonical merge. All current holds and zero new credit remain.

### SQLi

**definition-draft** — SQL Injection

SQL injection occurs when untrusted input is interpreted as SQL code and changes a query's intended behavior. Properly bound parameter values stay data.

Scope: Same vulnerability meaning as the phrase SQL injection. Equal draft wording does not merge the two catalogue records, approve their observed nodes or create two independent skills.

Field `fullName`: current `sha256:cfc800956fc8e03d1183dd54b55e4bdb59aa6d3f294e3355c3359e05d0c98c7e` → candidate `sha256:cfc800956fc8e03d1183dd54b55e4bdb59aa6d3f294e3355c3359e05d0c98c7e`.
Field `definition`: current `sha256:64421986f7126a2175c4a28ae398258a248d8cfe629ea2245ef3d13ff19ca504` → candidate `sha256:c24d370d19eca1174f33ea98b9cc25d0be000d8762607225483af5ce8b1dd98e`.

Candidate record `sha256:dc60bf3cfd88e46c24280de4f594ac380b203c3cec77add0db809e307a99ca10`; value `sha256:668c46d433c19ea09e739072a70dfee88f576ac7117496ea9469c2b30ee04226`.

Decision: Draft wording can be reviewed without a new naming choice; activation and human review still required. The single candidate is available for explicit offline preview only.

Current record `sha256:87b715a70e29d6d69c740fda8937ddef73413a2ee2758c3952f69d511231605f`; current value `sha256:e1e06fa82fa6bbc5581945f01b307a2b2b21ee00c96a7757a80bb0066a44374f`; current source `src/App.jsx:2371`. Prior draft `sha256:91ecb906c7adf10153975fadd62b6664af5f11500ed2f47ebf84b9ee0b35a684`; new complete draft `sha256:e97fe0bca9af1d29248475fc2b656fdc9b582e84cf96afe3dd870a146e5d9a33`.
[Primary source](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) — Unversioned OWASP cheat sheet read 2026-10-16; Prepared Statements with Parameterized Queries. SQL code/data separation and safely bound data; no exploit or database used.

Cross-link: plain-text lookup reference to glossary:sql%20injection; no clickable popup link, alias or canonical merge. All current holds and zero new credit remain.

### SRTP

**definition-draft** — Secure Real-time Transport Protocol

Profile adding security services to RTP media and RTCP control traffic. Available protections include confidentiality, message authentication and replay protection; configured transforms and key management determine what is provided.

Scope: The historical NULL cipher supplies no confidentiality. This definition describes available protections rather than guaranteeing all of them; it is not a current cipher recommendation or operational configuration.

Field `fullName`: current `sha256:128f7e9331bd052e7bd13b8cc75a5138249218a5ac366cfefcbac72b15c17d11` → candidate `sha256:128f7e9331bd052e7bd13b8cc75a5138249218a5ac366cfefcbac72b15c17d11`.
Field `definition`: current `sha256:6c1d6aff4a6478e1c935b796586ccf5f1ed1aa6d2ceef0c432a2faace52d5cdc` → candidate `sha256:b7e64d3d49c27fc58c31d649a75ca5b484d0edc70b28f0679424d21ecc7c77cc`.

Candidate record `sha256:df535ca6d661dced2e33fa4fa9821c5afa41da0ff3cd1b8ba60d077449fd39cd`; value `sha256:7e20cfa1434e8164e27dd9a297a90e4a716bef109a15f8e77e18af3c7bb50aa3`.

Decision: Draft wording can be reviewed without a new naming choice; activation and human review still required. The single candidate is available for explicit offline preview only.

Current record `sha256:bad78ec629823eefa280b7c80a882d319f9a9b4a0ecd316c48d7d219621c86a4`; current value `sha256:acf41bdf39b990933da8e306ecbd3e793c688cb8f5946ae4c7c5dd24aefc578f`; current source `src/App.jsx:2372`. Prior draft `sha256:ae7394317c9edf58a1c734f0c409b38e368ec0f368734858de06db2ca51ee204`; new complete draft `sha256:57f54dd7626bfa82b729003d90f4fe15e0d031e87cde7cd3192344fcfbf0026a`.
[Primary source](https://www.rfc-editor.org/rfc/rfc3711) — RFC3711, March 2004; 1,2,4.1.3. RTP/RTCP available services and historical NULL counterexample, not current cipher advice.

Cross-link: Preserve existing lexical source references; review ambiguous parent contexts before any future link approval. All current holds and zero new credit remain.

### SSH

**definition-draft** — Secure Shell

Protocol suite for remote login and other network services, designed to authenticate the server and protect channel confidentiality and integrity. Actual protection depends on negotiated algorithms and configuration.

Scope: Host verification, client authentication and authorization remain separate requirements. Historical optional none encryption is a counterexample, not a recommendation. No connection or current algorithm policy is assessed.

Field `fullName`: current `sha256:beb38d6b2e72f68a393ad80fb7fa54d8c3076bb87de3dd0e2a40bc3c0b32e76b` → candidate `sha256:beb38d6b2e72f68a393ad80fb7fa54d8c3076bb87de3dd0e2a40bc3c0b32e76b`.
Field `definition`: current `sha256:2add34c85d1fdc8f520c15419b2f3ddc70074827a83b1ce0cfc11692d9fe7a27` → candidate `sha256:ebc6eabe727cf73b28e2ffe74e65df6a5e097272668b276063ee7e3b5e960fb1`.

Candidate record `sha256:5e260754b10eb26e30870c3e92dba35e0f2eaefb6e19ec66e5a54fd38590531b`; value `sha256:d95a1f4bb8b3b8301ef8fde8fa9c2eefaa6b539ac98228382893107e54d1441e`.

Decision: Draft wording can be reviewed without a new naming choice; activation and human review still required. The single candidate is available for explicit offline preview only.

Current record `sha256:c8461c36a4ee1bdb9e35f61298a24bcd79ca0754186ce7633ebd989ffc288a47`; current value `sha256:3b1f654fb83f159cbcccf25fafbef4ff48a30e5c5be213d90ebee14e088212de`; current source `src/App.jsx:2373`. Prior draft `sha256:6cd82119c54823bb2378cf8acc8f9c4fd0edee48000183ec879325f82434f2ca`; new complete draft `sha256:0cec77f2a683f98f035c5386f2b784b2603519971ac365a18ffb70bb98cd044b`.
[Primary source](https://www.rfc-editor.org/rfc/rfc4251) — RFC4251, January 2006; Abstract;1. Remote login/services and transport server authentication/confidentiality/integrity purpose.
[Primary source](https://www.rfc-editor.org/rfc/rfc4253) — RFC4253, January 2006; 6.3/6.4, historical algorithms. Optional none as historical counterexample only; no contemporary algorithm recommendation.

Cross-link: Preserve existing lexical source references; review ambiguous parent contexts before any future link approval. All current holds and zero new credit remain.

### SSID

**definition-draft** — Service Set Identifier

Name identifying a wireless service set. It remains configured when its name is omitted from beacon advertisements.

Scope: A configured SSID still exists when its name is not broadcast. Suppression is not encryption or reliable concealment, and a copied name does not establish access-point identity.

Field `fullName`: current `sha256:641aea8bdc4d39f2156e505366200cfae96ad41c872d200d62dc766b5b2a2276` → candidate `sha256:641aea8bdc4d39f2156e505366200cfae96ad41c872d200d62dc766b5b2a2276`.
Field `definition`: current `sha256:9e22a97a97c6221aa422b2f706cc6879aec16164e5af43c9e255bd9101854218` → candidate `sha256:27114d36396d213f1278f42ae914368b7874717579369fc840fc41ac8ea4e51e`.

Candidate record `sha256:025c639d01e127b1721e9e30972cdd21e16782f5073cd4ea92d7b804cbb80f46`; value `sha256:ca50f6a8d881d6b08878b150393e811ccec0259e2997fb69f035e36867a16060`.

Decision: Draft wording can be reviewed without a new naming choice; activation and human review still required. The single candidate is available for explicit offline preview only.

Current record `sha256:0b2ef0baeb15de5a045aa9181b5735eafce2af912f9d7e1b054257bf47c44727`; current value `sha256:5a5db762f2917ccc7903d0edc770457557056f1d225c1cee81f65844d35ce576`; current source `src/App.jsx:2374`. Prior draft `sha256:741d1569b7d2c6048d4feb4c57b632d3a7d959049d82e8fe73fafe838d3264cd`; new complete draft `sha256:6151abbf0c16278b187ba4a70e83627608a67b12c9269bd3b8b398484cf793f2`.
[Primary source](https://www.cisco.com/c/en/us/support/docs/smb/wireless/cisco-small-business-100-series-wireless-access-points/smb5177-disable-ssid-broadcast-on-a-wireless-access-point.html) — SMB5177; revision1.0 dated2018-12-13; header says2017-08-18; Separate configured network and SSID Broadcast checkbox. Configuration/name-advertisement distinction only. Reject its invisibility/security claim; not a current device recommendation.

Cross-link: Preserve existing lexical source references; review ambiguous parent contexts before any future link approval. All current holds and zero new credit remain.

### ZTA

**definition-draft** — Zero Trust Architecture

Architecture that protects resources through explicit authentication and authorization, without granting implicit trust solely because of network location or device ownership.

Scope: Authentication and authorization are distinct and consider subjects and devices before resource sessions. The slogan is a mnemonic; ABAC may inform a policy but is not the architecture itself or proof of secure operation.

Field `fullName`: current `sha256:da1ac0b14c8b6b69de9c3777da23da13b5d702166a34357fcf7078c7bac185f2` → candidate `sha256:da1ac0b14c8b6b69de9c3777da23da13b5d702166a34357fcf7078c7bac185f2`.
Field `definition`: current `sha256:6437c70f2383561eccb0fbddbf213f865d585a8700730b144f96775f80444ee1` → candidate `sha256:dd894a02213dd0826ee2dd029413212c86b51c8cefde6e6a3f3e30487e3b919b`.

Candidate record `sha256:a98cb93fef9ca530bb434629c74844a2d3626ec0bb8d3c32b700ddfdb8a93de2`; value `sha256:afdf152ec1c63536e4cb8a23b3e52c6b049ef9d281f7f93584ea8b73ef5ccdb7`.

Decision: Draft wording can be reviewed without a new naming choice; activation and human review still required. The single candidate is available for explicit offline preview only.

Current record `sha256:16e75b6db91b31d2d0d124cf0c947036747e385b040ee4abad72029562ee6b8c`; current value `sha256:783435b66103df8113c5eb82c3556e83aac4af9a88ce7e53db0b39079a5d42f9`; current source `src/App.jsx:2392`. Prior draft `sha256:85b3d803273e77fdda5fdad1660870eeff7c08caacd6f50fcd40e3da6dac34f9`; new complete draft `sha256:2a063d36c7998efdcb0ed63de64063c3562425cdfa19a72b2106b6cf18164ac6`.
[Primary source](https://csrc.nist.gov/pubs/sp/800/207/final) — NIST SP800-207, August 2020; Abstract. Resource focus; no implicit trust solely by location/ownership; distinct authentication/authorization.

Cross-link: Preserve existing lexical source references; review ambiguous parent contexts before any future link approval. All current holds and zero new credit remain.


## Naming and cross-link decisions

**BPA remains held for owner choice.** The prior draft chose the security-partner card sense; the new preview refuses to select it automatically. An owner must confirm that scope/name or request a separately reviewed legal-partnership definition. No legal or profit-sharing rule is invented and the card does not approve the glossary's canonical identity.

**SOC remains held for owner choice.** Operations, assurance and chip meanings have independently scoped preview text. The current case-insensitive matcher maps SoC processor, SOC2 report and SOC security monitoring to the same key. Case cannot choose a meaning, and no replacement/alias/split/menu policy is selected. Owner choice must cover contextual delivery and affected links; previewing one option records no choice or approval.

SQL injection and SQLi remain two separate catalogue records and observed nodes. Their plain-text vocabulary references do not create aliases, concept links, independent skills or extra counts. The existing popup renders definition text without recursive glossary parsing, so these references are not clickable nested tooltips. Hyphenated SQL-injection and a phrase split across formatting fragments remain unmatched as before. Existing parent references remain66 exact lexical bindings, not66 verified live encounters; DNAT's zero local references says nothing about private/live absence.

The SSID source has inconsistent header/revision-history dates, both recorded; only its separate configured-name/broadcast checkbox is used. Its invisibility/security claim is explicitly excluded. RFC3711/4251/4253 are historical specification versions and purpose/counterexample sources, not current algorithm recommendations. Unversioned web references are dated reads, not invented release versions. HHS scope is terminology only, with no actual record classification or legal applicability decision. Only the named primary sections were examined, not complete standards or contemporary deployment conformance.

## Preview and adversarial proof

The preview is a default-off pure function inside the new audit. It accepts only a complete exact curated row and exact current source value. BPA/SOC require an explicit preview option; preview does not record an owner decision. A changed candidate with a recomputed checksum still fails comparison against the curated source-bound row. Unknown options, stale source, modified fields, invented aliases, automatic sense selection, unsupported absolute claims, unsafe markup and bad bounded JSON fail closed. Getters are rejected without execution.

The actual readGlossary/sourceUnit helpers and existing matcher/formatter/getEntry/split expressions run against an in-memory value copy. **14 static previews,126 candidate case/format/boundary checks,12 context checks and108 replayed current-source matching checks pass.** All162 keys stay exact, with no duplicate case-insensitive keys or aliases. 158 invalid source/candidate/choice/markup/JSON inputs and 928 altered packets are rejected. One independent hostile React text-node escape probe passes. Unsupported-claim mutation checks protect the exact sourced candidate wording; they are not a general factuality detector.

Current popup shape is preserved: the SQL phrase remains a string, other values remain fullName/definition objects. Every raw field's current and candidate fingerprints are recorded. Context notes and owner decisions are review metadata, not automatically delivered popup content. Full GlossaryText interaction, keyboard/screen reader behavior, PBQ tooltip gates and a live browser are not exercised. Existing Pro/submission gates and plain card/table surfaces remain as documented in the bound earlier review; source-derived text projection does not prove learner benefit or production delivery.

## Exact accounting and release gates

| Measure | Prior | New credit | Combined /total | Remaining |
|---|---:|---:|---:|---:|
| Glossary definitions |150|0|150/162|12|
| Catalogue dispositions |1694|0|1694/1878|184|
| Support teaching |748|0|748/834|86|
| Bank questions |463|0|463/483|20|
| Bank full feedback |464|0|464/483|19|
| COMPLETE pairs |456|0|456/483|27|

The12 selected holds are carried, not new. Global181 holds remain exact; no additions/resolutions or approved concept/role/objective/teaching-link/human/mastery/family/trusted/activation decisions. All145 prior packets,752 inherited field bindings,75 immediate baseline fields,451 source fingerprints and25 protected release files reconcile. Instructional rows remain786 raw/772 distinct/14 repeats. All earlier PBQ proofs, source-selection/private boundaries, census/ledger/native-v1/v2 and disabled local specimen stay pinned.

Required gates: deterministic write/recheck, all29 mapping tests and exact active-package reproduction, git diff --check, actual skip-deploy exit0/control1, only new audit/report/packet committed and pushed, exact remote refs/bytes verified, empty index and eight unrelated dirty entries preserved. Read-only npm audit against unchanged package/lockfile still reports7 existing advisories (1 critical,4 high,1 moderate,1 low); no fix or project-wide security clearance is claimed. Static previews reuse existing React/ReactDOM; no dependency is added.

No src/App.jsx, active/runtime, private/database, live/browser, account/analytics/entitlement, deployment, automation or Phase3 change. **Ten single-definition drafts; BPA and SOC still need owner choice; all current-source holds remain.**
