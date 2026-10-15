# Phase 2B-5 — first sixteen held flashcard correction drafts

**Exactly 16 selected cards reviewed; 16 small meaning-only offline drafts and 16 context notes prepared. All 16 current card holds and all 181 global holds remain.** No full current-source teaching qualifies, no current credit is added and no active content changes. Baseline: 089fc0c802f15c0fb5b6d3367b6a4f64352490c6. Master plan remains approved product authority; Phase 1 audit is historical implementation evidence. No unresolved identity/naming concern is treated as permission to change behavior.

Selection is the first 16 rows of the preceding packet's childDependencies after filtering existingHoldPreserved===true, in its stored order. The full dependency-array revision, exact predicate/range and selected-row revision are bound. Endpoints are Perimeter Security and the MAC/Media Access Control Address card. All 16 IDs are distinct; no substitution, sorting, neighboring review or deck-navigation approval transfer. Ten parent decks are read for membership/delivery context only.

## Source-bound candidate text

### 1. Perimeter Security

Record: `flashcard:sy0701-term-chapter3-architecture-models-perimeter-security`. Parent: `deck:chapter3-architecture-models`, authored ordinal 4 (zero-based). Expansion unchanged: Perimeter Security.

**Current meaning:** Boundary-focused design that trusts internal traffic more than external traffic; common in older network models.

**Retained hold:** HOLD: the full category is defined as trusting internal traffic more; boundary protections can coexist with resource-based Zero Trust without implicit internal trust.

**Offline replacement meaning:** In network architecture, controls that inspect or restrict traffic at defined boundaries. They can coexist with resource-focused authorization without automatically trusting internal traffic.

**Context note:** Network-boundary context only; no guarantee that perimeter controls alone authorize access or prevent compromise.

Source: `src/data/sy0701AcronymFlashcards.js:437`; raw `sha256:be8a48da7c256554d80e7ffcf188c3ad1651aa7952c31b928485b738543a6e5c`; current catalogue/published `sha256:63068da56469f01e4706d9b7064ca94f6468097c1c73b366e44cd53c5988e4b1`. Candidate raw `sha256:7ee8ac3d89fe0f4efc2ba7b2aaf404204675a24255a737eb96432bb3c488cbe8`; candidate catalogue `sha256:00103e35ba63ca951423f4cfaaacd9d34806e121147db4ce5346426c62bff835`; reviewed draft `sha256:89dd95fb9fa710b7ec8c0a961c9e286c86bf8494b07158c0d660bfc8b2f4d8cd`. [Primary reference](https://csrc.nist.gov/pubs/sp/800/207/final)

Current hold unresolved; zero current/parent/canonical credit.

### 2. ZTA

Record: `flashcard:sy0701-acronym-chapter3-architecture-resilience-acronyms-zta-zero-trust-architecture`. Parent: `deck:chapter3-architecture-resilience-acronyms`, authored ordinal 3 (zero-based). Expansion unchanged: Zero Trust Architecture.

**Current meaning:** Security model based on never trust, always verify with continuous checks for users, devices, and sessions.

**Retained hold:** HOLD: never-trust/always-verify plus continuous checks does not state resource access authorization or removal of implicit trust based on network location/ownership.

**Offline replacement meaning:** Architecture that protects resources through explicit authentication and authorization, without granting implicit trust solely because of network location or device ownership.

**Context note:** Reuse the bounded ZTA glossary candidate text, with a new exact card binding. The glossary hold and canonical mapping remain separate and unresolved.

Source: `src/data/sy0701AcronymFlashcards.js:421`; raw `sha256:6f143d343306dd58d31d3b3716115d69a2f8efe37bbb0dc84b3c35141a273b44`; current catalogue/published `sha256:bd42662e344b45b36803fef81f7511a066d2225e53ee29666a018b0643ce35da`. Candidate raw `sha256:46e270102f7e1cd12fb8cf70872048ebed61c979a88aa92d14951d21c8ac8ab1`; candidate catalogue `sha256:4cc965103b55036280d095b033d49a2aaccbd78b4bd79c1eabbab6a1765da227`; reviewed draft `sha256:f3d281705211c049403c518db9af7f76a2efe157e8c1dc8af553a779de0fa014`. [Primary reference](https://csrc.nist.gov/pubs/sp/800/207/final)

Current hold unresolved; zero current/parent/canonical credit.

### 3. Public Cloud

Record: `flashcard:sy0701-term-chapter3-cloud-deployment-models-public-cloud`. Parent: `deck:chapter3-cloud-deployment-models`, authored ordinal 1 (zero-based). Expansion unchanged: Public Cloud.

**Current meaning:** Cloud infrastructure owned by a third-party provider and accessed over the internet.

**Retained hold:** HOLD: the definition omits provisioning for open use by the general public; ownership and access path are insufficient distinguishing criteria.

**Offline replacement meaning:** Cloud infrastructure offered for use by the general public. Provider ownership or internet connectivity alone does not define this deployment model.

**Context note:** Public availability of the service does not mean every workload or customer dataset is publicly accessible.

Source: `src/data/sy0701AcronymFlashcards.js:450`; raw `sha256:178ada4de5ac3cd1095fc7248d87c3e0ccb693dd989be629e079be78c11137b1`; current catalogue/published `sha256:3f6faa3401cc882803d34ce53a821734e19d3f679affaa92a6fc32d14ab209f2`. Candidate raw `sha256:b04baf7bbfaeb056361f57e4511a0df03399ac3196259a33cc8885b232afc6a2`; candidate catalogue `sha256:0a1af5cf1a35c2fbc60814e8ab9c9067eff4a677244dc54c103ffaf95e4c5e00`; reviewed draft `sha256:acffc26e1cb7784f1b6b5fdfcade1dc46d345100ba053d3cf067fb13e8937efa`. [Primary reference](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf)

Current hold unresolved; zero current/parent/canonical credit.

### 4. Hybrid Cloud

Record: `flashcard:sy0701-term-chapter3-cloud-deployment-models-hybrid-cloud`. Parent: `deck:chapter3-cloud-deployment-models`, authored ordinal 3 (zero-based). Expansion unchanged: Hybrid Cloud.

**Current meaning:** Environment that connects private cloud or on-premises resources with public cloud services.

**Retained hold:** HOLD: ordinary on-premises resources plus public services do not necessarily form distinct cloud infrastructures bound for data/application portability.

**Offline replacement meaning:** Two or more distinct private, community or public cloud infrastructures that retain their identities and are connected to enable data or application portability.

**Context note:** An ordinary on-premises server plus an internet service is not sufficient; private/community composition need not contain public cloud.

Source: `src/data/sy0701AcronymFlashcards.js:452`; raw `sha256:d18dedb699e1043a11dba1b655d38cbfde59a38d50598ce3c4a4af7534c52615`; current catalogue/published `sha256:c8f8d90e88742a0605ed8267db3a7161a994855118f4f3da0a7fa605ad5f362b`. Candidate raw `sha256:2ca4481d9d51f84a10d20d4e09c655cb4f6c752da1f77d8e598aab5d6a94b969`; candidate catalogue `sha256:9b59a2d832a9a9576545f7b92e6f1b71ff6ae00eb36467dd2cc35026f05bdac6`; reviewed draft `sha256:24d4adcf9ea7ae31e06119d108cd98e22872f85fc03d2572536d70ecdbdac310`. [Primary reference](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf)

Current hold unresolved; zero current/parent/canonical credit.

### 5. Tokenization

Record: `flashcard:sy0701-term-chapter3-data-lifecycle-protection-tokenization`. Parent: `deck:chapter3-data-lifecycle-protection`, authored ordinal 3 (zero-based). Expansion unchanged: Tokenization.

**Current meaning:** Replacing sensitive data with a token that has no useful value outside the token vault.

**Retained hold:** HOLD new: no useful value outside the vault conflates inability to recover the original value with legitimate application/payment utility. A vault example does not establish universal harmlessness, authorization or attacker uselessness.

**Offline replacement meaning:** Replacing sensitive data with substitute tokens to reduce exposure of the original data. Tokens can still support authorized processing; protection depends on design, allowed use and access to mapping or detokenization functions.

**Context note:** A vault is one implementation pattern, not a guarantee that every token is harmless, unusable or recoverable only through that pattern. No current PCI compliance claim.

Source: `src/data/sy0701AcronymFlashcards.js:507`; raw `sha256:7a263a6038b1f3638de3570fd965dc014c132885fe976340d3f0ffbddb78e792`; current catalogue/published `sha256:c0cdeb80cab1c123520c65cbe1ab94f263ac0abbc1f8414dc5529689385a700b`. Candidate raw `sha256:f871a91be2419b3ff065bbc82a3c2b820be5bc37b2d74fbe0355c4b9e2e5b4aa`; candidate catalogue `sha256:bfc58f9543c1f485de125929ad42a97bf45104f507d4a67ce2e132ee01a17933`; reviewed draft `sha256:174af4ffba15ee6a0b34000cc654486c64f2b0289404d6a923a75e7246f04c0f`. [Primary reference](https://www.pcisecuritystandards.org/documents/Tokenization_Guidelines_Info_Supplement.pdf)

Current hold unresolved; zero current/parent/canonical credit.

### 6. Anonymization

Record: `flashcard:sy0701-term-chapter3-data-lifecycle-protection-anonymization`. Parent: `deck:chapter3-data-lifecycle-protection`, authored ordinal 5 (zero-based). Expansion unchanged: Anonymization.

**Current meaning:** Irreversibly removing identifying links so individuals cannot be re-identified.

**Retained hold:** HOLD new: irreversible removal of explicit links does not establish an absolute cannot-be-reidentified outcome with auxiliary data and quasi-identifiers. Distinguish the intended anonymization goal from a demonstrated privacy result.

**Offline replacement meaning:** Transforming data with the aim that people are no longer identifiable. Whether that result is achieved depends on remaining identifiers, available linking information and assessed re-identification risk.

**Context note:** Deleting names alone does not demonstrate anonymization. This describes the privacy goal and need for assessment, not a legal anonymity finding or an achieved irreversible result.

Source: `src/data/sy0701AcronymFlashcards.js:509`; raw `sha256:399f544e718664ed1780686b2d81797876eaaa0b067d609e816ba9ff0be1bd51`; current catalogue/published `sha256:3de5e39f4367d4e37b46587be9db9e1671cf969479f68a6f4044a71f5efac307`. Candidate raw `sha256:ccbca86c8dd46031f963e879222f8fccdba7f3d3fe74f4734f7324765d7bbcf9`; candidate catalogue `sha256:de85d209c9d5bbc31f51e878252bf82fc81ebb24985dced1a9eedb71990205f0`; reviewed draft `sha256:52832bad6f41a83f367ac7a38d7a89f85e97284d1159e43388c5513ed9fc0c00`. [Primary reference](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-188.pdf)

Current hold unresolved; zero current/parent/canonical credit.

### 7. Geographic Dispersal

Record: `flashcard:sy0701-term-chapter3-resilience-recovery-geographic-dispersal`. Parent: `deck:chapter3-resilience-recovery`, authored ordinal 8 (zero-based). Expansion unchanged: Geographic Dispersal.

**Current meaning:** Spreading systems across regions so one local disaster does not take down the whole service.

**Retained hold:** HOLD: across-region placement alone does not ensure one local disaster cannot take down the whole service. Shared dependencies, data/traffic failover, capacity and independent operability remain unspecified; the outcome is overstated rather than expressed as a risk-reduction goal.

**Offline replacement meaning:** Distributing systems across separated locations to reduce exposure to a single local event. Continued service also depends on controlling common failure dependencies, usable capacity, data availability and tested failover.

**Context note:** Separated sites may still share DNS, identity, control or other failure dependencies. Placement is not an achieved RTO/RPO or service-continuity guarantee.

Source: `src/data/sy0701AcronymFlashcards.js:491`; raw `sha256:0e1bb542ff25e75af60fe890d167565e8bf5ab72949b8a06d00596ec13aeb995`; current catalogue/published `sha256:53b765350c7ceec15e4d1d0ef75cc5931c0383ded8853069c2f66884d330c7be`. Candidate raw `sha256:794e097e2c7da3f8501209a8d9ab6cfff1a93fc186b728cc77d6168d1b2b124c`; candidate catalogue `sha256:181f4ad3cfe70ec5056226e1575f1d7dc8e1663cd8c75f61864d7dee00ab323f`; reviewed draft `sha256:00cfd589fa9f1db78d08b9a64e7517c40a38665262f9a99c4b88ad18000196d1`. [Primary reference](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_fault_isolation_multiaz_region_system.html)

Current hold unresolved; zero current/parent/canonical credit.

### 8. Playbook / Runbook

Record: `flashcard:sy0701-term-chapter4-forensics-response-playbook-runbook`. Parent: `deck:chapter4-forensics-response`, authored ordinal 0 (zero-based). Expansion unchanged: Playbook / Runbook.

**Current meaning:** Documented step-by-step procedure analysts follow during repeatable incident response tasks.

**Retained hold:** HOLD: one step-by-step incident-task definition supplies no component distinction or relationship for Playbook versus Runbook.

**Offline replacement meaning:** In a common study convention, a playbook sets incident-response guidance, decisions and roles; a runbook gives detailed steps for a specific task. Organizations may combine these or use the names differently.

**Context note:** This is a declared terminology convention, not a universal hierarchy or a human-versus-automation distinction. The compound card does not create two assessed skills.

Source: `src/data/sy0701AcronymFlashcards.js:581`; raw `sha256:a7f5b53791cdde1968530b5502b83e8ee3352a6a3da8eb14ca2ce04949f4d0de`; current catalogue/published `sha256:36d3220f20e5db5d501157bda7120f397b4dec41d17fca04350efc58226dde4f`. Candidate raw `sha256:d1122434d16071d7f84cac2fccf7a60029bcb50d363edda7d3396e5666cdd09b`; candidate catalogue `sha256:6376966326e206bf213b39c9261ea302fe6fe69bfe157ea8f9d62faf38b38b5c`; reviewed draft `sha256:bdc3e4ec0cd5aa15f5b28eabb2aefd871b5c8b5f11f71bc5fc72a16c64f125a2`. [Primary reference](https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-documents.html)

Current hold unresolved; zero current/parent/canonical credit.

### 9. Log Integrity

Record: `flashcard:sy0701-term-chapter4-monitoring-logging-log-integrity`. Parent: `deck:chapter4-monitoring-logging`, authored ordinal 3 (zero-based). Expansion unchanged: Log Integrity.

**Current meaning:** Using controls such as hashing to prove logs were not altered, deleted, or tampered with.

**Retained hold:** HOLD: controls such as hashing are described as proving logs were not altered, deleted or tampered with without a protected baseline or completeness evidence.

**Offline replacement meaning:** Protecting logs against unauthorized changes and detecting alteration using controls such as restricted access and comparisons with protected integrity baselines. A hash alone does not prove logs are complete or undeleted.

**Context note:** A replaceable baseline can match altered content, and a valid surviving record hash does not reveal missing records. These are reviewer counterexamples, not a deployed logging assessment.

Source: `src/data/sy0701AcronymFlashcards.js:569`; raw `sha256:34894dcd5f276bf994643b0f2a2de79e21d86d5d3bc47308af4ac8b9aefa0ef3`; current catalogue/published `sha256:9e654c7927659a7d3bfecbeaa9ac30fbfcd1c4007cee01135e1de7f0577ee120`. Candidate raw `sha256:814351e5e3e5c8bb86615c9bfadf9b6abd70fb00d7c6206b5f059ffd6e5d8be7`; candidate catalogue `sha256:02a24510644c6a9a923a861741eb7cd3fd902040708bebcbc76b882e9cb354f4`; reviewed draft `sha256:c6b9f7288c08adf1130f5431b00727fac9686d96e91d467b842252ac3d1d8e2e`. [Primary reference](https://csrc.nist.gov/pubs/sp/800/92/final)

Current hold unresolved; zero current/parent/canonical credit.

### 10. Data Processor

Record: `flashcard:sy0701-term-chapter5-governance-data-roles-data-processor`. Parent: `deck:chapter5-governance-data-roles`, authored ordinal 5 (zero-based). Expansion unchanged: Data Processor.

**Current meaning:** Third party that processes personal data on behalf of a data controller.

**Retained hold:** HOLD: the authored card calls a processor a Third party. Colloquial external-provider usage is understandable, but GDPR Article4(10), as explained by EDPB paragraphs86-89, excludes the processor from third party in that same processing relationship.

**Offline replacement meaning:** In GDPR, a person or body processing personal data on a controller's behalf and instructions. The controller determines the purposes and means of processing.

**Context note:** Use the processing relationship rather than an informal third-party label. Actual legal roles depend on the activity; no contract, organisation or individual is classified.

Source: `src/data/sy0701AcronymFlashcards.js:665`; raw `sha256:905120ea7ff4db97d2a56f26b07f392590dbab8e2e9c5e1e3363d314dda6d35a`; current catalogue/published `sha256:d35196c45a5932c1333fd972329a5c66e12fbf0aa657b8575be47e4f7390029e`. Candidate raw `sha256:d7617c9b6af4a68456cc8109859e074dac3fbbefbb669caff546d3ff2fa6068b`; candidate catalogue `sha256:5c3f09e3dc243bc72d195fa1e026ef99eeed1fc7d27c659d6cfd52cfcc752f3f`; reviewed draft `sha256:5ce6f082133a2280f706330b8528b4078074e85cc962c331d4c5efb2f3c62cae`. [Primary reference](https://www.edpb.europa.eu/sme/learn-the-basics/data-controller-or-data-processor_en)

Current hold unresolved; zero current/parent/canonical credit.

### 11. Data Custodian / Steward

Record: `flashcard:sy0701-term-chapter5-governance-data-roles-data-custodian-steward`. Parent: `deck:chapter5-governance-data-roles`, authored ordinal 6 (zero-based). Expansion unchanged: Data Custodian / Steward.

**Current meaning:** Technical role that maintains data and implements controls such as storage, backups, access, and retention.

**Retained hold:** HOLD: one combined label supplies only technical storage/backup/access/retention work; it does not distinguish the lesson steward quality/governance coordination from custodian implementation.

**Offline replacement meaning:** A custodian implements technical storage, access and lifecycle controls. A steward coordinates data definitions, quality and governance with business users and the data owner. Organizations can combine or name these roles differently.

**Context note:** A bounded study distinction consistent with the referenced government model, not universal job descriptions or a canonical split of this compound identity.

Source: `src/data/sy0701AcronymFlashcards.js:666`; raw `sha256:6d158d5ae8ac74fef7f21f44cb6ff67c0fa2e3739131d0629f299301ef23a926`; current catalogue/published `sha256:32d1b618f5d91e736a30d371b2eb430c7891f9bf7f9df122b579a7dce6f1293b`. Candidate raw `sha256:45305d5e8758416a3b6f5afa8f082c2794e31436a05f447a406385add3f1d703`; candidate catalogue `sha256:30b0ae872b062c5c693d74a17013c86831b348c3578574c51fa6d530a98c3c1b`; reviewed draft `sha256:2c1ba3838b668f304d90777f8ab0ac7c98a48d75a27a430180a0992f040dc893`. [Primary reference](https://www.gov.uk/government/publications/data-ownership-in-government/data-ownership-model)

Current hold unresolved; zero current/parent/canonical credit.

### 12. Qualitative Risk Analysis

Record: `flashcard:sy0701-term-chapter5-risk-analysis-response-qualitative-risk-analysis`. Parent: `deck:chapter5-risk-analysis-response`, authored ordinal 1 (zero-based). Expansion unchanged: Qualitative Risk Analysis.

**Current meaning:** Risk analysis that uses descriptive ratings such as high, medium, low, or a numbered risk matrix.

**Retained hold:** HOLD: an unspecified numbered risk matrix is not necessarily qualitative. Ordinal category codes, semi-quantitative scores and measured quantitative values differ; the card omits the distinction needed to classify them.

**Offline replacement meaning:** Assessing risk with defined categories such as Low, Medium and High. A numbered matrix must be interpreted: category labels, semi-quantitative scores and measured quantities are different kinds of values.

**Context note:** Numbers alone do not determine the assessment type or justify arithmetic on ordinal labels; the scale, rules and uncertainty need context.

Source: `src/data/sy0701AcronymFlashcards.js:679`; raw `sha256:f280bb4bd4b9373ef7b19085687ca5827a9f828cabe3cec5a7cb80841d05f6f7`; current catalogue/published `sha256:c9d8c45bde8ff5a7ca1a69638c166b9614b91753cb289522d210f65b9a75a7eb`. Candidate raw `sha256:2d250cb14233fc568743704175d65dbc17a5ee85639ad287384834bd9babf63f`; candidate catalogue `sha256:ebac23a4260373443e50a2c7c37ff48a030d0d4e0199439fd97872e47a85a6e9`; reviewed draft `sha256:f73a0ba0fadffc5f1aee4d8000fc9677db00f59b3401ca907dff092952227f9d`. [Primary reference](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf)

Current hold unresolved; zero current/parent/canonical credit.

### 13. Risk Tolerance

Record: `flashcard:sy0701-term-chapter5-risk-analysis-response-risk-tolerance`. Parent: `deck:chapter5-risk-analysis-response`, authored ordinal 3 (zero-based). Expansion unchanged: Risk Tolerance.

**Current meaning:** Acceptable variation from the organization's risk appetite for a specific situation or system.

**Retained hold:** HOLD: acceptable variation from risk appetite uses the wrong or ambiguous reference point. Tolerance describes acceptable risk/performance bounds for objectives in context, aligned with appetite; it is not blanket permission to vary outside appetite. The actual objective/threshold basis is missing.

**Offline replacement meaning:** Specific acceptable risk or performance bounds for a stated objective, used to guide decisions and aligned with the organization's risk appetite.

**Context note:** Definitions vary by source/context. Tolerance is not blanket permission to exceed appetite, a measured risk result or an actual acceptance decision.

Source: `src/data/sy0701AcronymFlashcards.js:681`; raw `sha256:3135ac0e8cf18c511b24bcbe226ff6638a43534ee79f8e590736c22f9bc616d0`; current catalogue/published `sha256:c14bc7d0e42ecab05ca4508847bbb15f3dfcba519e6cdba63848d138edf2f639`. Candidate raw `sha256:64a0244db6381e642f64f980c87208fa3085c2b9c8d0b9c499184ef596dfacc3`; candidate catalogue `sha256:ebc0688b96eaa318f87347da35fe5638008e58b57b35bcf15bdeea1eadf443ba`; reviewed draft `sha256:25688e762323b4d42a0956bcf2a3943c59d1c7eb21e0d7447ce796d7920f9e78`. [Primary reference](https://csrc.nist.gov/glossary/term/risk_tolerance)

Current hold unresolved; zero current/parent/canonical credit.

### 14. BYOD / COPE / CYOD

Record: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-byod-cope-cyod-bring-your-own-device-corporate-owned-personally-enabled-choose-your-own-device`. Parent: `deck:cloud-endpoint-infrastructure`, authored ordinal 3 (zero-based). Expansion unchanged: Bring Your Own Device / Corporate-Owned Personally Enabled / Choose Your Own Device.

**Current meaning:** Mobile-device ownership models with different security and privacy tradeoffs.

**Retained hold:** HOLD: the meaning only announces different security/privacy tradeoffs; it does not distinguish personally owned work devices, corporate-owned personally enabled devices, or selection from an approved device catalogue.

**Offline replacement meaning:** BYOD uses personally owned devices for work. COPE uses organization-owned devices with permitted personal use. CYOD offers an approved device list; ownership and funding depend on the organization's policy.

**Context note:** Distinguish ownership, permitted use and approved-list choice rather than treating all three as ownership categories. The current CYOD glossary and its offline candidate remain independent.

Source: `src/data/sy0701AcronymFlashcards.js:378`; raw `sha256:911af755e80d5a32f72576f96cb7aba522f227fb2de05703d46735fdf4ae8126`; current catalogue/published `sha256:2581e269f4827325a49a24e66a1c66494542bf3ed4e5ce112a1a7f0d7aed3177`. Candidate raw `sha256:20d755f27e8d0cf1066c7ae07541bad0fa58b3f46bce05ebe714b9d8027c9565`; candidate catalogue `sha256:9dd877e06136d9df67267bf3f048c0b4004c7d42cd29c5733a2e76db9e7437c4`; reviewed draft `sha256:b8613731a8800f6e6d6df666fc05622830e3cd91fcafb9b6cc5707d5e676efa7`. [Primary reference](https://csrc.nist.gov/pubs/sp/800/124/r2/final)

Current hold unresolved; zero current/parent/canonical credit.

### 15. IaaS / PaaS / SaaS

Record: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-iaas-paas-saas-infrastructure-platform-software-as-a-service`. Parent: `deck:cloud-endpoint-infrastructure`, authored ordinal 13 (zero-based). Expansion unchanged: Infrastructure / Platform / Software as a Service.

**Current meaning:** Cloud service models with different responsibility split between customer and provider.

**Retained hold:** HOLD: different responsibility split supplies no individual service capability or customer/provider control boundary for IaaS, PaaS and SaaS.

**Offline replacement meaning:** IaaS provides processing, storage and networking while customers control their operating systems and applications. PaaS provides a managed platform for customer-deployed applications. SaaS provides provider-run applications. Customer access, data and configuration responsibilities still depend on the service and agreement.

**Context note:** These are introductory service capabilities/control boundaries, not a complete security responsibility matrix or a claim that SaaS removes all customer duties.

Source: `src/data/sy0701AcronymFlashcards.js:388`; raw `sha256:e4fa9da96f60c77da06b2ed30212d3fd5a7520596eb195cad40b3e5dae53457b`; current catalogue/published `sha256:281092d0216b6e856cfde999baa142be95e98d73d595f351358f398ee03cda7d`. Candidate raw `sha256:6544382280513c2a0e23f199ba14a3b0f2c800b97b94a3c06ca2f35ceb9c8631`; candidate catalogue `sha256:069da7b4287dc99fc4f7e91d3f7288b1cd7dc1e3fa0d438a6ad04f41f709d4ce`; reviewed draft `sha256:ba9badcd3cb3370d5f99f7115077622b3c1ca7f1ce4e76379cc806cf22d4b36e`. [Primary reference](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf)

Current hold unresolved; zero current/parent/canonical credit.

### 16. MAC

Record: `flashcard:sy0701-acronym-cloud-endpoint-infrastructure-mac-media-access-control-address`. Parent: `deck:cloud-endpoint-infrastructure`, authored ordinal 16 (zero-based). Expansion unchanged: Media Access Control Address.

**Current meaning:** Unique hardware address assigned to a network interface.

**Retained hold:** HOLD: calling every MAC a unique hardware address overstates permanent physical-device identity; the existing support identity also collides with Mandatory Access Control.

**Offline replacement meaning:** Address used by a network interface at the link layer. It may be assigned locally or randomized, so it is not reliable proof of a unique physical device. Here MAC refers to media access control.

**Context note:** Mandatory Access Control is a different meaning of MAC. Correcting this text does not repair the shared support-node identity, approve a node split or change any glossary/card alias.

Source: `src/data/sy0701AcronymFlashcards.js:391`; raw `sha256:e46312ebec2cdb2c17bc599b628d0b3edb47dd9d72cbe52cfe10c60d4d72cdaa`; current catalogue/published `sha256:074efb8abf7f886cdcbb44244c761dbe81036353ea6878d1e6e08ee039224dc0`. Candidate raw `sha256:a9062c138580201ebb772ce4791cd272dfb2aa863fc9faab775ea06106c5079b`; candidate catalogue `sha256:afbd624f684a1b248a11e4809d55abf11cd15cef8c6c13d9c148f582a633efe7`; reviewed draft `sha256:a0f243dfdb790fb86c580c8a6736c3989645fcd57f26335393f722fd98a66cba`. [Primary reference](https://support.apple.com/en-us/102509)

Current hold unresolved; zero current/parent/canonical credit.

## Current and candidate delivery

All 16 raw source and flattened catalogue/published revisions match their immutable prior bindings and current imports. Each parent revision, authored ordinal, ordered membership, expansion, meaning and individual source field is pinned. All selected examples are absent. The source factory re-creates each candidate with only meaning changed; IDs, labels, expansions, topics, card types and inherited metadata remain exact. Candidate raw and hypothetical flattened-catalogue revisions are separate from current revisions and are not new trusted IDs. No glossary draft, cleaner neighbor or parent navigation finding supplies approval.

The existing sourceUnit helpers execute the actual mode and front/back expressions. There are 64 current/candidate mode comparisons and 40 face projections/static text-node renders: 20 current plus 20 candidate. Term cards use definition mode; the four acronym cards can request definition/acronym mode with the existing real-acronym fallback. Definition mode puts meaning on the front and term/expansion on the back; acronym mode, where eligible, puts the label first and the expansion/meaning after reveal. No card becomes a graded question or an independent family because its direction changes. Unsupported/example requests fall back because these16 have no authored examples.

The source uses plain text nodes for frontText, answerMain and answerCopy, not recursive GlossaryText or dangerous HTML. One hostile synthetic escaping check passes, including markup, ampersand and quotes. These are offline field/text projections, not the complete React component, interactive browser, screen reader or actual submit/storage flow. Separate context notes are not automatically shown by the current two-face renderer. Essential distinctions are included in candidate meaning; later publication must review any required note delivery as well.

The current native deck/account and Pro-related-lesson boundaries stay as in the preceding report. Existing self-ratings and Again pass completion remain recall mechanics, not demonstrated correctness, delayed retention or recovery. Native/saved-ID collision behavior is inherited unchanged. No navigation result or prior qualified child is transferred into current teaching credit.

Ten parent in-memory projections preserve every card ID, order and metadata; exactly 16 meaning fields differ, while all unselected members retain identical source values. The actual coarse related-lesson selector runs on each current/candidate parent: **2 of 10 ordered target lists change**. Both lists bind the same current lesson catalogue revisions, with zero approved teaching-link credit. Even an ID-preserving wording correction can change similarity scoring; unchanged targets would not prove semantic correctness either. No candidate parent or route is installed, and actual downstream learner behavior is unobserved.

| Changed parent | Current ordered targets | Candidate ordered targets |
|---|---|---|
| deck:chapter3-cloud-deployment-models | lesson:cloud-containers-automation, lesson:ipsec-secure-media, lesson:platform-cloud-hardening | lesson:cloud-containers-automation, lesson:ipsec-secure-media, lesson:data-classification-lifecycle |
| deck:chapter5-governance-data-roles | lesson:data-legal-responsibility, lesson:data-classification-lifecycle, lesson:governance-change-vendors | lesson:data-legal-responsibility, lesson:risk-resilience-governance (current hold), lesson:governance-change-vendors |

Current target holds remain explicit. A candidate suggestion can include a currently held lesson; no clearer card text establishes that destination's suitability or teaching qualification.

MAC has a separately bound duplicate-label comparison with the Mandatory Access Control card. Current observed support identity is shared; the networking draft does not repair that mapping, merge/split nodes or approve an alias. Lexical glossary references are pinned separately for selected labels/expansions, while actual flashcard faces remain plain text. The ZTA wording reuses the exact earlier offline glossary candidate text with a new card-specific revision; it transfers no current glossary/card qualification or canonical approval. Compound device/cloud, procedure and data-role cards describe their components without multiplying skill or family credit.

Three synthetic log-integrity checks show the limited reasoning behind the correction: a protected original fingerprint detects different content, a replaced comparison baseline can equal altered content, and a surviving record fingerprint cannot establish completeness of an omitted event stream. This is reviewer inference and synthetic equality reasoning, not a cryptographic implementation, authentic log store, legal evidence or an operational test.

## Primary reference scope

- [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/207/final): Abstract: resource focus, no location/ownership-only implicit trust, distinct authentication/authorization.
- [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf): Section2 service/deployment definitions; bounded capability/control distinctions, not modern service conformance.
- [www.pcisecuritystandards.org](https://www.pcisecuritystandards.org/documents/Tokenization_Guidelines_Info_Supplement.pdf): Historical2011 section2.2 approved applications/tokenization requests; example and design dependence, not current PCI requirements.
- [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-188.pdf): Section2.2 terminology and targeted linkage/threat-model passages; privacy goal versus assessed re-identification risk.
- [docs.aws.amazon.com](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_fault_isolation_multiaz_region_system.html): Multi-location dependencies and independence limits; vendor example, not an operational recovery test.
- [docs.aws.amazon.com](https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-documents.html): Vendor runbook as ordered task actions; no universal playbook/runbook hierarchy. CISA playbook search excerpt only; fresh CISA page/PDF retrieval unavailable.
- [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/92/final): Legacy final log-management abstract only. PDF text-find unavailable; protected-baseline/completeness limits are explicit reviewer inferences and synthetic checks.
- [www.edpb.europa.eu](https://www.edpb.europa.eu/sme/learn-the-basics/data-controller-or-data-processor_en): Controller purpose/means versus processor acting on behalf/instructions. No legal applicability finding.
- [www.gov.uk](https://www.gov.uk/government/publications/data-ownership-in-government/data-ownership-model): Steward and custodian sections; context-specific coordination/quality versus technical implementation example.
- [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf): Section2.3 assessment approaches: qualitative categories versus semi-quantitative scales and quantitative measures.
- [csrc.nist.gov](https://csrc.nist.gov/glossary/term/risk_tolerance): Multiple context-bound definitions: acceptable risk or objective-relative performance bounds; no universal formula.
- [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/124/r2/final): Earlier bound section5.1.3 CYOD evidence retained; final landing page reread, fresh PDF retrieval unavailable. No full mobile-policy audit.
- [support.apple.com](https://support.apple.com/en-us/102509): Private/rotating Wi-Fi MAC addresses as a counterexample to fixed hardware identity; no device configuration performed.

Only named sections, abstracts and scoped vendor/regulator examples were read; full standards, legal applicability and service configuration were not assessed. The CISA page/PDF and refreshed mobile PDF were unavailable; earlier source-bound mobile evidence and indexed playbook context remain limited. Log PDF text-find also remained unavailable, so its abstract supports context only and the baseline/completeness reasoning is explicitly reviewer inference. Initial obsolete government URL failed; the current government data-ownership page's steward/custodian sections were read successfully. No actual data anonymization, token/payment system, failover, network, legal role assignment, device setting or real logs are used.

## Reconciliation

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

Candidate progress is separately 16 drafts plus 16 context notes, not 32 catalogue dispositions. This selection's current teaching remains 0/16; all 16 are existing holds, with zero new distinct holds or resolutions. All 181 prior holds remain exact, including parent/child/glossary and carried pbq:p036 holds. All 184 remaining catalogue IDs persist: 180 held and 4 unheld private identities. Parent navigation findings remain limited, prior qualified teaching is unchanged and other 165 global held identities are not re-reviewed. Earlier glossary/PBQ drafts stay offline and unactivated.

All 136 preceding substantive-schema packets reconcile to 1694 distinct credited records; instructional rows remain 786 raw, 772 distinct and 14 repeated occurrences. All 752 inherited field fingerprints, 26 baseline field bindings, 419 source bindings and 25 protected release hashes are verified. Compact census/objective references remain exact; no duplicate 1878-row census or new objective membership. Ledger, native-v1/v2, active mapping package, private source choices and default-off/unwired specimen remain unchanged. No canonical roles/concepts/skills/difficulty/objectives/families, human approval, publication, trusted evidence, mastery or Phase 3 inference.

## Checks and repository delivery

The focused guard rejects **1425 altered packets**, including changed selection/order, stale raw/catalogue/parent/field/draft revisions, generic fully rehashed replacement, erased notes/holds, wrong faces/modes, false downstream link or parent activation, MAC canonical-split and ZTA transfer claims, false current coverage and unsafe/private/learner exports. Equality guards preserve this manually reviewed text; they do not establish educational benefit or complete correctness by themselves.

Required gates: deterministic write/recheck, all 29 content-mapping tests and deterministic active-package reproduction, git diff --check, protected/source pins and actual **[skip deploy] exit 0 / control 1**. Commit/push only this report, packet and audit; separately verify exact remote refs and artifact bytes, empty index and eight unrelated dirty entries. No active src/runtime, storage/account/analytics, private payload/database, live/browser, deployment, pricing/legal process or automation changes. **NOT READY for activation.**
