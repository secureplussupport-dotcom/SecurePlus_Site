# Phase 2B-5 — thirteen-term card-gap reconciliation

LOCAL review complete against baseline 9058c9028d6aa4bed95aa730868c703bc2d10736. Default-off, unwired, all holds retained, NOT READY for activation. This finite review reproduces earlier 13 term candidates; it is not a new content release or whole-phase completion.

## Exact selection and accounting

The stored remainingCatalogueRecordIds array selects exactly 13 sy0701-term IDs, identical to the earlier term-review list: chapter 3 architecture/cloud 3 (architecture 1 + cloud 2), lifecycle 2, recovery 1, chapter 4 operations 3, chapter 5 governance/risk 4. No substitutions. Prior architecture/network 13 + remaining acronym 16 = 29 distinct acronym IDs. These 29 and the 13 distinct term IDs are disjoint and their union equals every one of the 42 remaining card IDs. Earlier acronym findings, including SOC/SoC identity and TAXII expansion/factory-ID holds, carry no transferred approval.

All 13 candidates are exact earlier reviewed meanings: 11 original prior drafts plus the 2 previously context-narrowed playbook/runbook and custodian/steward definitions. New wording 0; examples 0; new IDs 0; credit 0. The sound current fragments below are retained in context, while missing distinctions and overstated outcomes remain explicit. No card is treated as wholly wrong merely because it is held, and no fragment qualifies the full current face.

## 1. Perimeter Security

Exact ID: `flashcard:sy0701-term-chapter3-architecture-models-perimeter-security`; parent `deck:chapter3-architecture-models`, ordinal 4. Authored source `src/data/sy0701AcronymFlashcards.js:437`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Boundary-focused design that trusts internal traffic more than external traffic; common in older network models.

Sound current core: Boundary-focused controls and the historical model are useful context; implicit internal trust is not necessary to define all boundary protection.

Reused LOCAL candidate: In network architecture, controls that inspect or restrict traffic at defined boundaries. They can coexist with resource-focused authorization without automatically trusting internal traffic.

Retained hold: HOLD: the full category is defined as trusting internal traffic more; boundary protections can coexist with resource-based Zero Trust without implicit internal trust.

Boundary: Boundary controls do not require implicit trust in internal traffic; no claim that a perimeter alone authorizes resource access.

Raw current→candidate: `sha256:be8a48da7c256554d80e7ffcf188c3ad1651aa7952c31b928485b738543a6e5c` → `sha256:7ee8ac3d89fe0f4efc2ba7b2aaf404204675a24255a737eb96432bb3c488cbe8`. Flat/catalogue: `sha256:63068da56469f01e4706d9b7064ca94f6468097c1c73b366e44cd53c5988e4b1` → `sha256:00103e35ba63ca951423f4cfaaacd9d34806e121147db4ce5346426c62bff835`. Meaning: `sha256:d77711874e2b14e132f4c1157955cb363abf9ce0a87a9dd2ea6ed505029276ad` → `sha256:efc43618d03aeeea796856c5d971abebecb54b5e8d98184c53a370f25f2d1349`. Native front: `sha256:d77711874e2b14e132f4c1157955cb363abf9ce0a87a9dd2ea6ed505029276ad` → `sha256:efc43618d03aeeea796856c5d971abebecb54b5e8d98184c53a370f25f2d1349`; back-copy: `sha256:285e13ba954457aa5b150dc3796777dc0bd1b0b78af48e56bee30013751a9bd6` → `sha256:4aa3ff2788101b24c069c6eb3ccd79426a03994374a9cb5371749df7b3b18b68`. Back-main remains `sha256:32c8e6606b4eec8f0254fb07f66d05bf8e8adbae85988843b8ffc052be26a53f`.

Exact prior review row `sha256:061f6580b4e5ca10ce8ac53dc3a5ed24578a4e7b0fdc9fe9b17ebcf46b7b9438` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:fc961fc88be672cbadab3ebdfa00201b9bfe5c94b70006d05033a88c44342fa4` in `docs/drafts/phase-2b5-architecture-cloud-decks-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/207/final): Abstract: resource-based authorization and absence of location-only implicit trust. Perimeter coexistence is reviewer inference.

## 2. Hybrid Cloud

Exact ID: `flashcard:sy0701-term-chapter3-cloud-deployment-models-hybrid-cloud`; parent `deck:chapter3-cloud-deployment-models`, ordinal 3. Authored source `src/data/sy0701AcronymFlashcards.js:452`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Environment that connects private cloud or on-premises resources with public cloud services.

Sound current core: Connecting environments is relevant; on-premises resources plus public services alone do not establish distinct clouds and portability.

Reused LOCAL candidate: Two or more distinct private, community or public cloud infrastructures that retain their identities and are connected to enable data or application portability.

Retained hold: HOLD: ordinary on-premises resources plus public services do not necessarily form distinct cloud infrastructures bound for data/application portability.

Boundary: Distinct cloud infrastructures and portability are necessary in the cited definition; ordinary on-premises plus public SaaS is insufficient, and public cloud is not mandatory in every hybrid composition.

Raw current→candidate: `sha256:d18dedb699e1043a11dba1b655d38cbfde59a38d50598ce3c4a4af7534c52615` → `sha256:2ca4481d9d51f84a10d20d4e09c655cb4f6c752da1f77d8e598aab5d6a94b969`. Flat/catalogue: `sha256:c8f8d90e88742a0605ed8267db3a7161a994855118f4f3da0a7fa605ad5f362b` → `sha256:9b59a2d832a9a9576545f7b92e6f1b71ff6ae00eb36467dd2cc35026f05bdac6`. Meaning: `sha256:6df754aed6a121c72821ff8d1e87b2dd4f8c95e1a710ec9d147a15c04689c73d` → `sha256:b0e5cff20528f5c0a8755f4037451e64ce9c2117ea43b9bb4b6aab303b343abe`. Native front: `sha256:6df754aed6a121c72821ff8d1e87b2dd4f8c95e1a710ec9d147a15c04689c73d` → `sha256:b0e5cff20528f5c0a8755f4037451e64ce9c2117ea43b9bb4b6aab303b343abe`; back-copy: `sha256:d6d5907fe08b9c22273dd37abe7a33892284c2205243f64305a6f8bc39f3c0cd` → `sha256:0211e117d946a6ff6df246b6ab1ae574c28e8d439f6ca0f1c0f67f49bd27b23f`. Back-main remains `sha256:bfc4ac66b17a887ff5319f17b6ac72677e4dd5552e3d885ffdb63ccc632cdf3a`.

Exact prior review row `sha256:a78f5d53eb033940f0e3da6b71f4476d471174f0ec6552cfe0c0d7bdba52fe12` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:5d980adcd62c3db8028976f28652acc9ee52e5d956a4ce381bfe4aed4092b311` in `docs/drafts/phase-2b5-architecture-cloud-decks-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf): Section2, printed p3: distinct cloud infrastructures, preserved entities and data/application portability.

## 3. Public Cloud

Exact ID: `flashcard:sy0701-term-chapter3-cloud-deployment-models-public-cloud`; parent `deck:chapter3-cloud-deployment-models`, ordinal 1. Authored source `src/data/sy0701AcronymFlashcards.js:450`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Cloud infrastructure owned by a third-party provider and accessed over the internet.

Sound current core: Provider operation and internet access are possible characteristics; public-use provisioning is the distinguishing criterion missing from this face.

Reused LOCAL candidate: Cloud infrastructure offered for use by the general public. Provider ownership or internet connectivity alone does not define this deployment model.

Retained hold: HOLD: the definition omits provisioning for open use by the general public; ownership and access path are insufficient distinguishing criteria.

Boundary: General-public availability distinguishes deployment, not internet transport, provider ownership or public readability of customer data.

Raw current→candidate: `sha256:178ada4de5ac3cd1095fc7248d87c3e0ccb693dd989be629e079be78c11137b1` → `sha256:b04baf7bbfaeb056361f57e4511a0df03399ac3196259a33cc8885b232afc6a2`. Flat/catalogue: `sha256:3f6faa3401cc882803d34ce53a821734e19d3f679affaa92a6fc32d14ab209f2` → `sha256:0a1af5cf1a35c2fbc60814e8ab9c9067eff4a677244dc54c103ffaf95e4c5e00`. Meaning: `sha256:f5ca5c6cb5dc28ba1e576919c9bb5aff8b5dfbfc8f5ec286b65d915486b7b5f1` → `sha256:8e510a266d869060e601c048e7d0d937feadc3ca4d45cd81459c3860954f13cc`. Native front: `sha256:f5ca5c6cb5dc28ba1e576919c9bb5aff8b5dfbfc8f5ec286b65d915486b7b5f1` → `sha256:8e510a266d869060e601c048e7d0d937feadc3ca4d45cd81459c3860954f13cc`; back-copy: `sha256:0b6ade3cf4cf031d5509814187c59f9058fce1e26947ee7df73b407ac58b59d1` → `sha256:bfa9f3bf8a18f04a852d4398a98c03a9d3a71690aa9badac32b43940706aa94a`. Back-main remains `sha256:5f931aa18a2632b2d4b7d186044366f47adebbae9cac70e2da1f2346e1aebe23`.

Exact prior review row `sha256:a209a8d2ae8a2a6b931fade1d025c4510405ebc59bc781904c5d9ce181ffbcf3` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:d777c1042c53a49da27dda520dfabd056e3768c2f4f9557da8bda6411622ff7e` in `docs/drafts/phase-2b5-architecture-cloud-decks-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf): Section2, printed p3: open use by general public; ownership alone does not distinguish the model.

## 4. Anonymization

Exact ID: `flashcard:sy0701-term-chapter3-data-lifecycle-protection-anonymization`; parent `deck:chapter3-data-lifecycle-protection`, ordinal 5. Authored source `src/data/sy0701AcronymFlashcards.js:509`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Irreversibly removing identifying links so individuals cannot be re-identified.

Sound current core: Reducing identifying links is the intended goal; removing links is not evidence that re-identification is impossible.

Reused LOCAL candidate: Transforming data with the aim that people are no longer identifiable. Whether that result is achieved depends on remaining identifiers, available linking information and assessed re-identification risk.

Retained hold: HOLD new: irreversible removal of explicit links does not establish an absolute cannot-be-reidentified outcome with auxiliary data and quasi-identifiers. Distinguish the intended anonymization goal from a demonstrated privacy result.

Boundary: The candidate states a privacy goal and assessment limits; it is not an achieved irreversible result. NIST cautions against ambiguous anonymization usage. No label rename or legal finding.

Raw current→candidate: `sha256:399f544e718664ed1780686b2d81797876eaaa0b067d609e816ba9ff0be1bd51` → `sha256:ccbca86c8dd46031f963e879222f8fccdba7f3d3fe74f4734f7324765d7bbcf9`. Flat/catalogue: `sha256:3de5e39f4367d4e37b46587be9db9e1671cf969479f68a6f4044a71f5efac307` → `sha256:de85d209c9d5bbc31f51e878252bf82fc81ebb24985dced1a9eedb71990205f0`. Meaning: `sha256:18fe0319838314e2a8ac0076c061920eeeaaf490b64e3adb90dc2a6d4a287549` → `sha256:335cf250676e8713c608ae44804802f88eb5cbba9e95699f51f1640f49d65f4f`. Native front: `sha256:18fe0319838314e2a8ac0076c061920eeeaaf490b64e3adb90dc2a6d4a287549` → `sha256:335cf250676e8713c608ae44804802f88eb5cbba9e95699f51f1640f49d65f4f`; back-copy: `sha256:a90bbe4e7347ce899d5890f4747ec9dc4a350538361f2dac6bf3b50ce9669c3f` → `sha256:ca3689be20b3936ce9236161c3e89fe9c41436809a651a061cb0794ce56f794c`. Back-main remains `sha256:9bf78fc022429fcac976bfd1ed3b79b4a646fea64ef19e891bdbe4f06e5eed01`.

Exact prior review row `sha256:e86b57ac54ce0d6cc26ce310b21463278fb5c650300db85a9ce8766a78bfe3d1` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:52f7b35f3b4a45d0980767b816acbd11b8a119414ffe8966d680f90146ca7f41` in `docs/drafts/phase-2b5-chapter3-residual-term-cards-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-188.pdf): Final2023 section2.2, printed p13, indexed primary passage and abstract: linkage risk and inconsistent anonymization usage; targeted PDF reopen/find timed out.

## 5. Tokenization

Exact ID: `flashcard:sy0701-term-chapter3-data-lifecycle-protection-tokenization`; parent `deck:chapter3-data-lifecycle-protection`, ordinal 3. Authored source `src/data/sy0701AcronymFlashcards.js:507`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Replacing sensitive data with a token that has no useful value outside the token vault.

Sound current core: Replacing sensitive data with tokens is the sound mechanism; authorized utility outside a vault is not excluded.

Reused LOCAL candidate: Replacing sensitive data with substitute tokens to reduce exposure of the original data. Tokens can still support authorized processing; protection depends on design, allowed use and access to mapping or detokenization functions.

Retained hold: HOLD new: no useful value outside the vault conflates inability to recover the original value with legitimate application/payment utility. A vault example does not establish universal harmlessness, authorization or attacker uselessness.

Boundary: Replacing data does not make tokens useless or harmless. The historical PCI example supports authorized use and design-dependent protection, not current compliance.

Raw current→candidate: `sha256:7a263a6038b1f3638de3570fd965dc014c132885fe976340d3f0ffbddb78e792` → `sha256:f871a91be2419b3ff065bbc82a3c2b820be5bc37b2d74fbe0355c4b9e2e5b4aa`. Flat/catalogue: `sha256:c0cdeb80cab1c123520c65cbe1ab94f263ac0abbc1f8414dc5529689385a700b` → `sha256:bfc58f9543c1f485de125929ad42a97bf45104f507d4a67ce2e132ee01a17933`. Meaning: `sha256:f70a1f54d8c3a28f2828daa75d1bfabcd71ae8acb1add0741fcaf61d122be7d1` → `sha256:ec52606876c7f72e8826b64cfd3e05b9207af394a499ec4a9dcbe5d5461ddafa`. Native front: `sha256:f70a1f54d8c3a28f2828daa75d1bfabcd71ae8acb1add0741fcaf61d122be7d1` → `sha256:ec52606876c7f72e8826b64cfd3e05b9207af394a499ec4a9dcbe5d5461ddafa`; back-copy: `sha256:11b63a864bdb318016bb75e5139395f79eb98eb272e021e7b1f3254f163b3076` → `sha256:7def64f131528ac5e9cab478a45f604406a3102eed2c0cffe975177bc9fabb83`. Back-main remains `sha256:54970d02a4dbab94302adeb0cd7c2bc61e8f524b98681853b8496e0cbb4b86f9`.

Exact prior review row `sha256:5dbd59aec348db4c04415cebf7cd63a032cae7155f937f6272a9b9f1ef9ed319` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:bb86c6c2ea6f18dcf4edb41bd3e2b94090a74cc9c2fa15c87aa4be007f627bf1` in `docs/drafts/phase-2b5-chapter3-residual-term-cards-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [www.pcisecuritystandards.org](https://www.pcisecuritystandards.org/documents/Tokenization_Guidelines_Info_Supplement.pdf): Historical2011 sections2.1-2.2, PDF pp6-8: authorized applications and example tokenization operation; no modern compliance clearance.

## 6. Geographic Dispersal

Exact ID: `flashcard:sy0701-term-chapter3-resilience-recovery-geographic-dispersal`; parent `deck:chapter3-resilience-recovery`, ordinal 8. Authored source `src/data/sy0701AcronymFlashcards.js:491`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Spreading systems across regions so one local disaster does not take down the whole service.

Sound current core: Separated locations reduce exposure to a local event; location alone does not establish continuous service.

Reused LOCAL candidate: Distributing systems across separated locations to reduce exposure to a single local event. Continued service also depends on controlling common failure dependencies, usable capacity, data availability and tested failover.

Retained hold: HOLD: across-region placement alone does not ensure one local disaster cannot take down the whole service. Shared dependencies, data/traffic failover, capacity and independent operability remain unspecified; the outcome is overstated rather than expressed as a risk-reduction goal.

Boundary: Separated locations reduce correlated exposure; shared dependencies or unusable failover can still interrupt service. No achieved RTO/RPO.

Raw current→candidate: `sha256:0e1bb542ff25e75af60fe890d167565e8bf5ab72949b8a06d00596ec13aeb995` → `sha256:794e097e2c7da3f8501209a8d9ab6cfff1a93fc186b728cc77d6168d1b2b124c`. Flat/catalogue: `sha256:53b765350c7ceec15e4d1d0ef75cc5931c0383ded8853069c2f66884d330c7be` → `sha256:181f4ad3cfe70ec5056226e1575f1d7dc8e1663cd8c75f61864d7dee00ab323f`. Meaning: `sha256:416fa5e748caca631997b7304a3c010422ab8dd4a0ece6b3a83cd6c8717db9ac` → `sha256:392c274c0de2594120d33cd3e1fd094251e18d97b68c1e0c2d0f7453a83e7b3d`. Native front: `sha256:416fa5e748caca631997b7304a3c010422ab8dd4a0ece6b3a83cd6c8717db9ac` → `sha256:392c274c0de2594120d33cd3e1fd094251e18d97b68c1e0c2d0f7453a83e7b3d`; back-copy: `sha256:38f19c11b97524ea40eb030964e60b4fbfa6259092b324fd93a6737cc2d24224` → `sha256:37d0f73ad3ed2b2b74fab76c86e37dcdb313f20aed24509d82c7b1e6d3f0f9b1`. Back-main remains `sha256:30c58460e8361d7d4bc9f6bb9d3928a6b6eb62009f9f8d91b197c249cc57dd7d`.

Exact prior review row `sha256:d0316e4f5c596347da6aad7421ac420eacb408580380378fd3cd70964b1189f0` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:7dd16435bc797c703d22c48c8f153475758463cd504bf55e178cc84cb3831a1d` in `docs/drafts/phase-2b5-recovery-risk-term-cards-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [docs.aws.amazon.com](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_fault_isolation_multiaz_region_system.html): Implementation/anti-patterns: replication, component dependencies and independently operable regions; vendor example only.

## 7. Playbook / Runbook

Exact ID: `flashcard:sy0701-term-chapter4-forensics-response-playbook-runbook`; parent `deck:chapter4-forensics-response`, ordinal 0. Authored source `src/data/sy0701AcronymFlashcards.js:581`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Documented step-by-step procedure analysts follow during repeatable incident response tasks.

Sound current core: Documented procedures are relevant to response work; the combined label does not establish a universal playbook/runbook distinction.

Reused LOCAL candidate: In CISA's incident-response playbooks, procedures guide response decisions and actions. In AWS Systems Manager, a runbook defines ordered task steps. These examples do not establish a universal hierarchy between the terms.

Retained hold: HOLD: one step-by-step incident-task definition supplies no component distinction or relationship for Playbook versus Runbook.

Boundary: The old common-convention hierarchy lacks a universal primary-source basis. New text names two evidenced examples, retains overlap/terminology hold, and creates no two-skill assessment.

Raw current→candidate: `sha256:a7f5b53791cdde1968530b5502b83e8ee3352a6a3da8eb14ca2ce04949f4d0de` → `sha256:b986ae83eb29427c935ecf4d6429a5bb350b5d6c22c915f98bb2c38dfab97535`. Flat/catalogue: `sha256:36d3220f20e5db5d501157bda7120f397b4dec41d17fca04350efc58226dde4f` → `sha256:068944ab3c1564c6e1d99b8a59fa849e82bb701703c73b2ebd52024432bb84c1`. Meaning: `sha256:ef11b0516a11673a7933b6ef7eb6d5f7d100ef43e2442c885217756b246bf771` → `sha256:c3ade94d4ec29150b276dee90f0d7c649be51788be8228f9dbde24a28f8ca266`. Native front: `sha256:ef11b0516a11673a7933b6ef7eb6d5f7d100ef43e2442c885217756b246bf771` → `sha256:c3ade94d4ec29150b276dee90f0d7c649be51788be8228f9dbde24a28f8ca266`; back-copy: `sha256:779c65f3820a4f3b9fb12e7f993f9d518ebe09f0add0fd0717293c4be136e966` → `sha256:2d4d125660a3fcaf2d642c654041e8068b85cf12dac32fbb4f81f5b56264ff63`. Back-main remains `sha256:3d22031a409440198e2e5a83cc70e922e525c0b80584f2943eee30177f61c996`.

Exact prior review row `sha256:1ca56c18e92caba402773d42ed95663f8fdc26f3f604f94304520fd6759ce261` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:d894f1056ed068d21c1e22ff9df595231a5437ebaaa85a5f678bec5ca89345ce` in `docs/drafts/phase-2b5-monitoring-forensics-decks-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [content.govdelivery.com](https://content.govdelivery.com/accounts/USDHSCISA/bulletins/2fc7609): CISA official2021 bulletin: response operational procedures, decision trees and detailed steps. Full CISA PDF retrieval failed. [docs.aws.amazon.com](https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-documents.html): Opening paragraphs: vendor runbooks contain ordered actions/steps; no universal playbook-versus-runbook hierarchy.

## 8. Log Integrity

Exact ID: `flashcard:sy0701-term-chapter4-monitoring-logging-log-integrity`; parent `deck:chapter4-monitoring-logging`, ordinal 3. Authored source `src/data/sy0701AcronymFlashcards.js:569`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Using controls such as hashing to prove logs were not altered, deleted, or tampered with.

Sound current core: Integrity controls and comparisons are relevant; a hash alone does not prove completeness or absence of deletion.

Reused LOCAL candidate: Protecting logs against unauthorized changes and detecting alteration using controls such as restricted access and comparisons with protected integrity baselines. A hash alone does not prove logs are complete or undeleted.

Retained hold: HOLD: controls such as hashing are described as proving logs were not altered, deleted or tampered with without a protected baseline or completeness evidence.

Boundary: A comparison requires a protected baseline; a valid remaining digest does not prove no omitted records. Completeness limit is reviewer inference, not a real log-system test.

Raw current→candidate: `sha256:34894dcd5f276bf994643b0f2a2de79e21d86d5d3bc47308af4ac8b9aefa0ef3` → `sha256:814351e5e3e5c8bb86615c9bfadf9b6abd70fb00d7c6206b5f059ffd6e5d8be7`. Flat/catalogue: `sha256:9e654c7927659a7d3bfecbeaa9ac30fbfcd1c4007cee01135e1de7f0577ee120` → `sha256:02a24510644c6a9a923a861741eb7cd3fd902040708bebcbc76b882e9cb354f4`. Meaning: `sha256:b8c553f0cdb4790b20487ce14bab7aa791162c02d55a634e464b8fda8bd521eb` → `sha256:376dd55cc25b8c4f0d1e066b389d29bb8debc4beeb98edd9a5b74c5f7e076594`. Native front: `sha256:b8c553f0cdb4790b20487ce14bab7aa791162c02d55a634e464b8fda8bd521eb` → `sha256:376dd55cc25b8c4f0d1e066b389d29bb8debc4beeb98edd9a5b74c5f7e076594`; back-copy: `sha256:d2e0d0469de7811e9f36c33949167d44976274ec32a19ce9dcb0042f9724264c` → `sha256:af8e3b030665737177c92f638e9c681dc547fba809fc3d4816e3a6310d1aac42`. Back-main remains `sha256:0c14bb57cb6da188715c092387896259b177f107dde113f94a283dff027bf99f`.

Exact prior review row `sha256:9db62562f99490b00c04e4a7759fac66a11352bc0c370bf7fa04a688808ef3b8` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:11f39158ef378c8d5ff6ff39f692f3b7b600a6bccb2af5788fe7078981c26c65` in `docs/drafts/phase-2b5-monitoring-forensics-decks-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [csrc.nist.gov](https://csrc.nist.gov/glossary/term/log_file_integrity_checking): NIST SP800-92 comparison definition; protected-baseline and completeness limitations are reviewer inferences checked synthetically. [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/92/final): Final2006 abstract for log-management context; PDF retrieved but targeted text-find failed. A government mirror proved to be an April2006 draft and is not substituted for final evidence. No legacy algorithm recommendation.

## 9. Compensating Control

Exact ID: `flashcard:sy0701-term-chapter4-vulnerability-access-ops-compensating-control`; parent `deck:chapter4-vulnerability-access-ops`, ordinal 4. Authored source `src/data/sy0701AcronymFlashcards.js:603`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Alternative control used when the primary control, such as immediate patching, cannot be applied.

Sound current core: An alternative when a primary control cannot be applied is relevant; comparable protection for the requirement is still necessary.

Reused LOCAL candidate: An alternative safeguard used in place of a required or recommended control when it cannot be applied, providing equivalent or comparable protection for the relevant security requirement.

Retained hold: HOLD: the delivered alternative-when-primary-unavailable definition omits comparable protective effectiveness and could treat any available substitute as compensation.

Boundary: An available substitute must provide comparable protection for the relevant requirement; no real patch exception or compliance approval.

Raw current→candidate: `sha256:a81dd9a356a4749b5ae02d1bb15572f84048f6f18cbbea8b7c9aa6b190cb0434` → `sha256:59cd5829f24780692102d0f0ab1948f89949526a36b2630d973fff64a4cd10f9`. Flat/catalogue: `sha256:3d1f93e707419d2488c507569a3eed0260cca85f0d8e89311973d92b0581e8fd` → `sha256:fe5746367e566346a650d672358b38df7091b2543935f0d7784a78b703abe3bb`. Meaning: `sha256:e7da2d9061b70395608b6ea308192534cda8c07bf1a8d6505c0236c41a309862` → `sha256:b1060a5e0cd69bcd44a2b91edd1ab657a9080a95dcd083bc2b7db2bdaa827a29`. Native front: `sha256:e7da2d9061b70395608b6ea308192534cda8c07bf1a8d6505c0236c41a309862` → `sha256:b1060a5e0cd69bcd44a2b91edd1ab657a9080a95dcd083bc2b7db2bdaa827a29`; back-copy: `sha256:55bfe09752938207120448774e115eaa53948ec9ee31a28aaa7863ddd467844b` → `sha256:314db7c7a5080da863bb8d311c6d7cb08011a249dd21678660753dc13f2735ec`. Back-main remains `sha256:5233bd4edbd36ee71a6a0c0f15bec0d77dfc6026a5379f00be73fc41657a5743`.

Exact prior review row `sha256:5b8be0ac97bf21f9f1d1a55fa8f34b9f64f8ecd9b91fab462ad9e65ad8dcc756` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:80389c35a83e1a59977112bcfc44a0f531383ecd5f194317347836e42a587db7` in `docs/drafts/phase-2b5-hardening-access-terms-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [csrc.nist.gov](https://csrc.nist.gov/glossary/term/compensating_security_control): Definitions sourced to baseline-control contexts require equivalent/comparable protection; no real control effectiveness measured.

## 10. Data Custodian / Steward

Exact ID: `flashcard:sy0701-term-chapter5-governance-data-roles-data-custodian-steward`; parent `deck:chapter5-governance-data-roles`, ordinal 6. Authored source `src/data/sy0701AcronymFlashcards.js:666`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Technical role that maintains data and implements controls such as storage, backups, access, and retention.

Sound current core: Technical maintenance and controls describe custodian work in the cited model; they do not establish every stewardship responsibility.

Reused LOCAL candidate: In the UK government data ownership model, a custodian implements technical data controls; a steward coordinates data definitions, quality and governance with the data owner. Organizations may name or combine these roles differently.

Retained hold: HOLD: one combined label supplies only technical storage/backup/access/retention work; it does not distinguish the lesson steward quality/governance coordination from custodian implementation.

Boundary: The prior unqualified role descriptions are narrowed on the delivered meaning face to the referenced government model; compound identity/split and universal-role approval remain held.

Raw current→candidate: `sha256:6d158d5ae8ac74fef7f21f44cb6ff67c0fa2e3739131d0629f299301ef23a926` → `sha256:9ed5f3c1c0e5e21e3bc0b2b48c8069aab14186d369050a9c26f554e9c5bb8bea`. Flat/catalogue: `sha256:32d1b618f5d91e736a30d371b2eb430c7891f9bf7f9df122b579a7dce6f1293b` → `sha256:e5fc284918cdd32dbf6a376f2dc540c551e45e965dcbb1929ebb7ea80877c9a5`. Meaning: `sha256:b0c2c60bdee8d9b8a6d9d9849a61036eabdc0625471175a178cda0b445d0f3cf` → `sha256:5d0c8e116992bd59207a63dac47ea2a8b0059551ffc81621fc942ffaa316356e`. Native front: `sha256:b0c2c60bdee8d9b8a6d9d9849a61036eabdc0625471175a178cda0b445d0f3cf` → `sha256:5d0c8e116992bd59207a63dac47ea2a8b0059551ffc81621fc942ffaa316356e`; back-copy: `sha256:2eedbb7f7d8d935b1e7b73d89346013edfed80758ca451ef5868793374c3c457` → `sha256:85ccc84ff2e55cc73449ebfee3e311eded7c8d153ee89b0b076bdc9c0672b16f`. Back-main remains `sha256:08254ceb6d3acd5fdfca93c6072172e4f8463847f0b89f5469666a916f432588`.

Exact prior review row `sha256:2a6c6d5baf4ef38a9c8d85589ee6b83cb6471aaf227a33c6e16f79ed098546ce` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:974e3a90b62ae20540aa541289305cec2b7ac60ca3bc337228a887c57d2f5d66` in `docs/drafts/phase-2b5-data-roles-privacy-teaching-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [www.gov.uk](https://www.gov.uk/government/publications/data-ownership-in-government/data-ownership-model): Sections6 Data stewards and Data custodians: governance/definitions/quality and technical implementation; contextual model only.

## 11. Data Processor

Exact ID: `flashcard:sy0701-term-chapter5-governance-data-roles-data-processor`; parent `deck:chapter5-governance-data-roles`, ordinal 5. Authored source `src/data/sy0701AcronymFlashcards.js:665`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Third party that processes personal data on behalf of a data controller.

Sound current core: Processing on a controller's behalf is the sound relationship; informal third-party wording does not establish the cited GDPR terminology.

Reused LOCAL candidate: In GDPR, a person or body processing personal data on a controller's behalf and instructions. The controller determines the purposes and means of processing.

Retained hold: HOLD: the authored card calls a processor a Third party. Colloquial external-provider usage is understandable, but GDPR Article4(10), as explained by EDPB paragraphs86-89, excludes the processor from third party in that same processing relationship.

Boundary: Use the GDPR processing relationship and instructions, not an informal third-party synonym. No actual organization is classified; the prior legal-terminology hold stays exact.

Raw current→candidate: `sha256:905120ea7ff4db97d2a56f26b07f392590dbab8e2e9c5e1e3363d314dda6d35a` → `sha256:d7617c9b6af4a68456cc8109859e074dac3fbbefbb669caff546d3ff2fa6068b`. Flat/catalogue: `sha256:d35196c45a5932c1333fd972329a5c66e12fbf0aa657b8575be47e4f7390029e` → `sha256:5c3f09e3dc243bc72d195fa1e026ef99eeed1fc7d27c659d6cfd52cfcc752f3f`. Meaning: `sha256:08a5247e3ecbc22afa2c185019ec65e257bd24223ab678d58ca19a337e6b65b6` → `sha256:17ed62d5846e1267b717570a24d18757b86ecb4dc12c86fcfa4d3da17a36a8c6`. Native front: `sha256:08a5247e3ecbc22afa2c185019ec65e257bd24223ab678d58ca19a337e6b65b6` → `sha256:17ed62d5846e1267b717570a24d18757b86ecb4dc12c86fcfa4d3da17a36a8c6`; back-copy: `sha256:9a7a8c84d7902ad46d7fd5d575c0dea185aea0abd9898509cda0e2f60b7bb91c` → `sha256:8d9d532ddb2865eafc783bb3cba8f0376dc20bae8de11a655a14255a42e49696`. Back-main remains `sha256:372eabad66675a4fd35f5a5628108045e2436004a83c557abf5a59d24045cc65`.

Exact prior review row `sha256:7bc720bf2366f4a1f5f54cb399ba5be856d159148d3fe43e4ccb216debd5ad4f` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:153a4183349bca3c5187d484121966f6455f18407996fe154569aec6d5d344e2` in `docs/drafts/phase-2b5-data-roles-privacy-teaching-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [www.edpb.europa.eu](https://www.edpb.europa.eu/sme/learn-the-basics/data-controller-or-data-processor_en): Controller purposes/means and processor behalf/instructions. Prior Article4 third-party concern retained, no fresh legal case adjudication.

## 12. Qualitative Risk Analysis

Exact ID: `flashcard:sy0701-term-chapter5-risk-analysis-response-qualitative-risk-analysis`; parent `deck:chapter5-risk-analysis-response`, ordinal 1. Authored source `src/data/sy0701AcronymFlashcards.js:679`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Risk analysis that uses descriptive ratings such as high, medium, low, or a numbered risk matrix.

Sound current core: Descriptive Low/Medium/High categories are sound examples; an unspecified numbered matrix does not settle the measurement approach.

Reused LOCAL candidate: Assessing risk with defined categories such as Low, Medium and High. A numbered matrix must be interpreted: category labels, semi-quantitative scores and measured quantities are different kinds of values.

Retained hold: HOLD: an unspecified numbered risk matrix is not necessarily qualitative. Ordinal category codes, semi-quantitative scores and measured quantitative values differ; the card omits the distinction needed to classify them.

Boundary: Category labels, semi-quantitative bins and measured quantities differ. An unqualified numbered matrix cannot establish which approach was used.

Raw current→candidate: `sha256:f280bb4bd4b9373ef7b19085687ca5827a9f828cabe3cec5a7cb80841d05f6f7` → `sha256:2d250cb14233fc568743704175d65dbc17a5ee85639ad287384834bd9babf63f`. Flat/catalogue: `sha256:c9d8c45bde8ff5a7ca1a69638c166b9614b91753cb289522d210f65b9a75a7eb` → `sha256:ebac23a4260373443e50a2c7c37ff48a030d0d4e0199439fd97872e47a85a6e9`. Meaning: `sha256:887319119bcea958e65795cfd6f393357aa51b8686ed9973974878cca6c8cc3c` → `sha256:b8256d3ecb64ac39131b837f6aaf7cce547cdbaf0aae8642e4c253d8d6ec264c`. Native front: `sha256:887319119bcea958e65795cfd6f393357aa51b8686ed9973974878cca6c8cc3c` → `sha256:b8256d3ecb64ac39131b837f6aaf7cce547cdbaf0aae8642e4c253d8d6ec264c`; back-copy: `sha256:2e3b4affc26c54dad5492d6e70e935fc569ec530ecbe26fcfaeb0c3d46e75241` → `sha256:23afa85e9ec4696c0717cfeeb299eb8c47b5b42e2393dd9c7107c008a1010f72`. Back-main remains `sha256:6722aca8922d39d7a0c66bed45fdc3c6da74244cc5c43d9c649c573d9a55b3f3`.

Exact prior review row `sha256:195a53ef9f062ebdde92263a5aca9d52f49c1823c0ff7d51d7bfa2b35464b371` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:0f090fcf16fcc614ead188b9ad89f65542b289c3d7162c424aa1c90c59257bde` in `docs/drafts/phase-2b5-recovery-risk-term-cards-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf): Section2.3.2 printed p14: qualitative nonnumerical categories, semi-quantitative scales and quantitative meanings.

## 13. Risk Tolerance

Exact ID: `flashcard:sy0701-term-chapter5-risk-analysis-response-risk-tolerance`; parent `deck:chapter5-risk-analysis-response`, ordinal 3. Authored source `src/data/sy0701AcronymFlashcards.js:681`, file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`.

Current: Acceptable variation from the organization's risk appetite for a specific situation or system.

Sound current core: Situation-specific acceptable bounds and appetite alignment are relevant; acceptable variation outside appetite is not established.

Reused LOCAL candidate: Specific acceptable risk or performance bounds for a stated objective, used to guide decisions and aligned with the organization's risk appetite.

Retained hold: HOLD: acceptable variation from risk appetite uses the wrong or ambiguous reference point. Tolerance describes acceptable risk/performance bounds for objectives in context, aligned with appetite; it is not blanket permission to vary outside appetite. The actual objective/threshold basis is missing.

Boundary: Tolerance is tied to objectives/context and aligned with appetite, not blanket permission to deviate outside appetite; no actual risk acceptance.

Raw current→candidate: `sha256:3135ac0e8cf18c511b24bcbe226ff6638a43534ee79f8e590736c22f9bc616d0` → `sha256:64a0244db6381e642f64f980c87208fa3085c2b9c8d0b9c499184ef596dfacc3`. Flat/catalogue: `sha256:c14bc7d0e42ecab05ca4508847bbb15f3dfcba519e6cdba63848d138edf2f639` → `sha256:ebc0688b96eaa318f87347da35fe5638008e58b57b35bcf15bdeea1eadf443ba`. Meaning: `sha256:e6e992970f67db4c265fa0155d9bb108483e605ad4fa1a69d46056edcbcd7e94` → `sha256:59323d820f57f44cb59a1c7b6f1dd09687af7ddc2177e979323857f7d4cf043e`. Native front: `sha256:e6e992970f67db4c265fa0155d9bb108483e605ad4fa1a69d46056edcbcd7e94` → `sha256:59323d820f57f44cb59a1c7b6f1dd09687af7ddc2177e979323857f7d4cf043e`; back-copy: `sha256:b0644347a20558479d30399549ce8844a7ef7213da7618bb28fae37c9c45af8f` → `sha256:2862cca08b3ad502969d5aecbecff7b523d328181b44983e0fe58410ad5397af`. Back-main remains `sha256:b48efaab1c0a3d561b441de16d81578181067b8c74c1082a3c2c4c9a6fdfc1bd`.

Exact prior review row `sha256:c49a89c98069bcdfaec54486964f8b5f80b4ec19641773547d4820277061ba89` in `docs/drafts/phase-2b5-thirteen-held-term-remediation-proposals.json`; inherited hold `sha256:7bf9a5a82a1936677a9ab3dbd48be993d1ff7b55ca4cce454ee7e091ce2bb1b0` in `docs/drafts/phase-2b5-recovery-risk-term-cards-proposals.json`. No new wording, example, identity or credit. Prior evidence only: [csrc.nist.gov](https://csrc.nist.gov/glossary/term/risk_tolerance): Context-bound definitions, including objective-relative performance variance; no universal formula.

## Reproduced delivery and adversarial checks

The prior audit's exact source block `sha256:d908257385f8028740074934b21965175b1884e5882b6ccd5aa66dac1d691b0e` is executed unchanged in memory, using the current 493-source baseline and existing card-face/selector helper. Every row and all mode, face, related, weak, collection, next-deck, glossary, collision, neighbor, selector and log proof arrays reproduce the earlier packet exactly. The actual prompt expression is additionally bound with 208 current/candidate projections. This is source execution and static text rendering, not an interactive browser test.

All 313 IDs and order stay exact; 13 candidate meanings change and 300 unselected cards remain structurally unchanged. Labels, expansions, type, topic, metadata and factory identities remain exact. Term cards have no authored examples.104 mode contexts cover term/acronym hosts and definition/acronym/example/unknown requests;208 current/candidate faces remain definition-first, with the definition repeated on the back. Requested acronym mode in a mixed host does not create a reverse term-first drill. Both faces exist in markup; reveal/self-rating is not an independent assessment.39 completion checks preserve the actual pass rule, including an again rating that can complete a pass. Hostile text is escaped; no glossary parser or dangerous HTML insertion is present in the lab.

Nine parent contexts preserve child order and native/share/chapter routing. A synthetic saved-ID collision can shadow a native deck, without claiming a real collision.13 weak-topic contexts yield 4 changed candidate selection lists; 9 parent contexts yield 2 changed related lists. 28 starred/preserve-order random-builder/saved-hydration checks and 9 next-deck checks preserve identities and source navigation. No real saved deck, storage, random sample, user history or handler is exercised. Seven selector signatures, 13 exact-ID/collision checks, 13 neighbor comparisons and glossary-match bindings remain unchanged; label/support-node equality is not semantic equivalence. These lexical changes would need review before integration; they do not approve teaching links, roles, objectives, families or a canonical split/merge.

Three log counterexamples show changed content against a protected baseline, a replaced baseline matching changed content, and a surviving digest failing to establish completeness. They are synthetic checks, not production log validation. Other bounded counterexamples are the row boundaries: coexistence of perimeter controls and resource authorization, ordinary on-premises/public-service mixing, private customer data on public infrastructure, linking information, authorized token utility, shared regional dependencies, context-specific compound terminology, comparable protection and ordinal versus measured risk values. No privacy result, achieved RTO/RPO, compliance exception, real legal classification or risk acceptance is demonstrated.

All primary references retain their earlier finite scopes and retrieval failures. No fresh external retrieval, full-standard verification, current compliance clearance or real legal advice is claimed. The earlier named CISA/AWS and UK government contexts remain on the proposed meaning face. A context note alone does not repair a face and is not automatically delivered.

Equality/export guards reject 2317 altered packets, including stale or rehashed/crossed candidates, invented faces/prompts, false current-vocabulary rejection, selector/collision equivalence, lost 42-card union, cleared holds, duplicate credit, publication and private/learner exports. JSON serialization preserves the exact packet. These checks bind the reviewed result; they do not prove arbitrary prose or learner outcomes.

## Prior + new + remaining

| Measure | Prior | New credit | Combined / total | Remaining |
|---|---:|---:|---:|---:|
| Selected term cards |0|0|0/13|13 held|
| All cards |271|0|271/313|42|
| Glossary |150|0|150/162|12|
| Catalogue |1694|0|1694/1878|184|
| Support |748|0|748/834|86|
| Questions |463|0|463/483|20|
| Full feedback |464|0|464/483|19|
| COMPLETE pairs |456|0|456/483|27|
| Decks |14|0|14/29|15|

All 181 holds remain (13 selected + 168 others): 180 among 184 remaining catalogue IDs, plus 4 unheld private records; carried p036 is outside remaining catalogue. 160 prior packets reconcile 1694 credited identities, 786 raw / 772 distinct instructional occurrences / 14 repeats, 752 inherited fields, 83 immediate baseline fields, 496 source bindings and 25 protected release hashes. Remaining arrays, census/objective/source-selection bindings, ledger, v1/v2 helpers, 447 native-supported questions and exact active package stay unchanged. No card/glossary/parent credit is borrowed across records.

## Delivery limits

The initial focused-audit existence check failed, then this three-artifact reconciliation was added. Required validation: deterministic write/recheck, syntax, all 29 mapping tests and exact package reproduction, git diff --check, actual skip-deploy exit0/control1, task-only commit/push and exact remote refs/blob bytes. The eight unrelated dirty entries must remain untouched.

No owner decision blocks this finite review. Semantic, placement, compound identity, canonical role/teaching/objective/family and publication holds remain. No owner 27 packet, active source, compiler, runtime, learner, private payload, database, browser, automation, build/deploy or Phase 3 work. Package/lock retain 7 previously known native advisories (critical 1 / high 4 / moderate 1 / low 1); no fresh dependency security clearance. **LOCAL 13-term revalidation and 42-card gap reconciliation complete; current credit unchanged; NOT READY for activation.**
