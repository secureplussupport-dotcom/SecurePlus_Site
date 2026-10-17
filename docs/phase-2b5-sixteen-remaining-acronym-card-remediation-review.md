# Phase 2B-5 — sixteen remaining acronym-card remediation reviews

Baseline **74401af09c0920c16aeb9ef4afb71ff222e8ab82**. Exactly16 remaining held sy0701-acronym IDs, derived in stored remainingCatalogueRecordIds order as the complement of the prior13 among29. Family counts are asserted: application/software attacks2; cloud/mobile/hardware1; malware1; password/credential1; risk/governance5; security operations2; social engineering2; threat intel2. The exact16 labels/IDs are asserted with no substitution. The prior13 and these16 are disjoint and cover all29 remaining acronym identities; the other13 held term cards remain separate in the42-card gap.

Master plan and Phase1 audit were read in full earlier in this continuous session. The master plan remains approved product authority and the audit historical implementation evidence; no unresolved conflict changes behavior.

**Eleven exact existing meaning/example drafts revalidated, four clear current vocabulary records preserved with placement/identity holds, and one unchanged TAXII expansion/identity hold. All16 current card holds and181 global holds remain.** No new correction wording, label or expansion is proposed. LOCAL/default-off/unwired only; no current card, glossary, lesson, deck, role/skill/objective, teaching-link, trusted/mastery, human/canonical, publication or activation credit is added.

## Root causes and bounded proposals

| Group | Cards | Existing evidence and retained limit |
|---|---|---|
| Definition, mechanism or outcome |Buffer Overflow; Race Condition; Ransomware; Rainbow Table|Reuse buffer-boundary, explicitly stated check/change/use, demand-versus-recovery and chain/recomputation/candidate-verification wording. Examples do not establish exploitation, universal TOCTOU or instant recovery.|
| Path, breadth and authorization |Side-Loading; Phishing; Tailgating|Reuse legitimate off-store alternatives, mass/targeted umbrella scope and unauthorized following-entry. Retained malicious examples do not define every off-store install, every message or every escorted entry. Attack-deck captions and compound terms still need separate scope review.|
| Context and role |MOA/MOU; PHI; CIO/CSO|Reuse explicit study grouping, prior bounded HIPAA context/exclusions and common-but-variable role scope. No universal legal force, real health-record classification, CSO→CISO rename or organization chart is approved.|
| Clear vocabulary, held placement/identity |CTF; ISP; OID; operations SOC|Do not rewrite sound introductory text. Naming does not teach governance/privacy/compliance placement, supplier assurance, identifier trust or resolve SOC/SoC identity.|
| Signing-domain semantics |DKIM|Reuse the signing-domain responsibility and covered-content/key distinction; signature validity does not establish visible-author identity, truth or safety. No message, DNS key or live algorithm is checked.|
| Expansion/identity blocker |TAXII|Meaning/example-only work cannot repair the expansion on the back. Prior TAXII2.1 expansion correction would change the source-factory ID. Preserve the current face and explicit hold; no migration, alias or replacement card is created.|

## Buffer Overflow

Exact ID `flashcard:sy0701-acronym-application-software-attacks-buffer-overflow-buffer-overflow`; parent `deck:application-software-attacks`, ordinal 6. Source `src/data/sy0701AcronymFlashcards.js:203` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:cee4fb31c19f2948c6a94684cae0aba90f2e8d827e5c1f9f65f69640b13959a2`).

**Current meaning:** Too much data is written into memory, causing corruption or possible code execution. Current example: A field built for 20 characters receives 2,000 characters and overwrites nearby memory.

**LOCAL proposal:** meaning: Writing beyond the allocated boundary of a memory buffer, potentially corrupting adjacent memory, crashing a program or enabling code execution.

**Exact retained root hold:** The standalone definition says excessive data in memory without identifying writes beyond a buffer boundary. That can confuse memory exhaustion with overflow; the clearer adjacent-memory illustration is absent from the definition prompt.

**Boundary:** Allocation exhaustion alone is not a write beyond buffer bounds; code execution is a possible consequence, not a demonstrated exploit. The authored adjacent-memory example is retained. Excessive allocation or memory exhaustion alone is not a buffer-boundary write; possible code execution is not guaranteed.

Source/catalogue current→candidate `sha256:9d5a25c4a672c2474e7547e10bff010dc08a57ba35c7e023968b7daf7bc5b2ba` → `sha256:9570b13549c73c36755e2ba869cb11bb3df58f6de4c51e7d9226de5cddcba077`; raw delivered card `sha256:16b3bd6c9dafcc48a8f633d794bcd7ef4a840dbe484958e6a0a4cbcdbfbb564f` → `sha256:266a9cc51505adaa38e32814a3f76275125838d109fbeb5eee1b1c300b952258`; meaning `sha256:d9fd9a89dfd37fd770355950c21ee5b4c5ded47cd1e2bfa9d836969aa1c1b741` → `sha256:9776881ba0f8d6b4815ded8c0d884e9044560feb17afe462c86f760fdb25b2e4`; example `sha256:a6acec56a7accfd6d0289dc812920933cf1861e73d9bd20dc7bdf53e41dcf95a` → `sha256:a6acec56a7accfd6d0289dc812920933cf1861e73d9bd20dc7bdf53e41dcf95a`; mode/face projection `sha256:13a342fcab946640ac31aab9fccbad26eb6c67d3498ee533c7608148be85e180` → `sha256:3da4382d38381172a9187d5b3050ed05274feeec0ec0a28e5175c368bd5a67ff`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:ee1c7ca40ea3319e199b41884e603eef7f1db6913a7d08ac838e15ef51ca33b4` in docs/drafts/phase-2b5-final-eleven-held-cards-proposals.json; hold `sha256:904184d12ad8cddc34e9d8d7d309c39c6950af9e1883fe6d609cc96c099c42fe` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json; new review row `sha256:2908d2218252a372a542f7a3cb29f7dd3a5abc59c00c0c4dbd31c817d5629f92`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[cwe.mitre.org](https://cwe.mitre.org/data/definitions/120.html): Classic buffer-boundary write and potential consequences, not every memory error.

## Race Condition

Exact ID `flashcard:sy0701-acronym-application-software-attacks-race-condition-time-of-check-time-of-use-race-condition`; parent `deck:application-software-attacks`, ordinal 9. Source `src/data/sy0701AcronymFlashcards.js:206` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:7ea327534d458e59debf661db19682c30eeaf2b1919665879e3e88d534687708`).

**Current meaning:** Exploits timing gaps between a security check and the later action. Current example: A withdraw button is triggered twice before the account balance update completes.

**LOCAL proposal:** meaning: In the check/use race shown here, a resource is checked and then used after its state changes, invalidating the earlier check. This is one kind of race condition. example: Two concurrent withdrawals each check that the same account has enough funds. The first reduces the balance before the second uses its stale check to withdraw.

**Exact retained root hold:** The term names general races, the expansion and definition narrow to a check/use gap, while the double-withdraw illustration supplies only concurrent action before an update. It leaves the checked state and later invalidated use unstated.

**Boundary:** Concurrent withdrawal events alone do not identify a check/use race; the draft explicitly stipulates the checked balance, intervening state change and stale use. The supplied expansion names TOCTOU while the broad label says Race Condition. The draft explicitly scopes this card to check/use; it does not make all races TOCTOU or approve a label/identity remapping. Concurrent requests alone are insufficient.

Source/catalogue current→candidate `sha256:632899030c6679af1d00bc90dd7d3f915546ac327e7317d1834d5f3904de600a` → `sha256:ed601ed6b7b4e23e2accdaa142240140252f7ed738e9dbcc992710c05ad10fa6`; raw delivered card `sha256:349106582f2a99442c3896676f3f796e828d4c5635d6c85adbe8d8f309b03491` → `sha256:b98d65f3f023156d1d8f1e8b36fcebe6b29f02e2838a81b88bf7a98f6b77b356`; meaning `sha256:4b0dffe96f277d44a9264ea8f9d35e9432c36fd26fc7d21d83a9d2a9a59df533` → `sha256:d79b31635c0fb138726bec5620e5e2b2aaa33330d5e4b74b998e9cb1691b359c`; example `sha256:4815b8256fd183f5db244a4e866dab11ad45d8034df0801dbdc0e8ae51c14295` → `sha256:691c66f8556904b4264861d517823c14db1f07fe3cf29c12fe70c37405fa079c`; mode/face projection `sha256:9e36168d3d402069ddad801363420c2065b1711e3e46336c212e4ec75378ef31` → `sha256:d465afd9864fee2066941aa992c14e51a9859cf264d862c81557b49310a1651a`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:6d5623311f0835f73a58ebc421766babab660c32c4613f592da8ffa3cfa0216f` in docs/drafts/phase-2b5-final-eleven-held-cards-proposals.json; hold `sha256:e09dffa1f9f180c8e0befc7aa08783aed4dac9f18c670993aa06f37c56899534` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json; new review row `sha256:c28fc07e9b4321e027fc8d905ce272f347b9de1b3ae41afedb22ba40a04fe1a0`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[cwe.mitre.org](https://cwe.mitre.org/data/definitions/367.html): Checked resource state can change before use; concurrent withdrawal is a reviewer-authored illustration.

## Side-Loading

Exact ID `flashcard:sy0701-acronym-cloud-mobile-hardware-attacks-side-loading-side-loading`; parent `deck:cloud-mobile-hardware-attacks`, ordinal 1. Source `src/data/sy0701AcronymFlashcards.js:298` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:96507e1e7d5736e22e890cfd8a934a5a39cef3aff2de9f5facdcb9f2e58e3145`).

**Current meaning:** Installs apps from untrusted sources outside approved app stores. Current example: A downloaded APK from a file-sharing forum installs adware with the promised app.

**LOCAL proposal:** meaning: Installing an app outside the platform's official app-store distribution path. This may be authorized enterprise or developer distribution or an untrusted download; the path alone does not establish trust or malice.

**Exact retained root hold:** The definition makes untrusted sourcing part of side-loading itself. Off-store installation may also use a legitimate developer or enterprise source; the malicious example does not repair that universal trust inference.

**Boundary:** An off-store distribution path can be legitimate developer/enterprise delivery; the retained malicious APK example is one case, not every sideload. The existing APK/adware example remains an illustrative malicious case. Legitimate off-store enterprise/developer distribution defeats the current universal untrusted-source implication. The authored attack cardType, deck placement and attack-name captions remain unchanged and require separate review; no installation is performed.

Source/catalogue current→candidate `sha256:db602a1eb68aea22d4d1c4063afa43fc539435b6fc2ba97122152ab1b8d83f7d` → `sha256:5d441e525dcebc418a832107f26c64d9a8392a7a2e6b0decd249dab1e2bc6796`; raw delivered card `sha256:f616982f5f53add25177903d412fe3af758d178921fdf461ac75268909ad9797` → `sha256:01f7bbafa9085232b8a471842f3a28907dfa87e72a91f920dd01354e41b4e324`; meaning `sha256:b1d79a2238a5ed17241415033efdb828f1372b5aaa01e8295b3f23a8e501c354` → `sha256:c3780a14a7144b718854517761bb95143793adec76ef9e561ec28195580d8444`; example `sha256:be6cc03a624eccf4228248ceefc0a057751e76b6bce2c89d590d875a4e9ef56b` → `sha256:be6cc03a624eccf4228248ceefc0a057751e76b6bce2c89d590d875a4e9ef56b`; mode/face projection `sha256:8dae214ba44e5006e278fb692c03ba4831c6f693c50647d0605c243f20504806` → `sha256:f2b976d4a3890fecb7ae08aea418cba30ff0b0ac26a135da28fffe39cb6b93dd`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:3e66e2fed1a84ac40f8027de37cefd872e810a699680fceca6e76b0e5287ffa6` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:7d6caf4ae69efb91c22efc8157a53b37f7faa0ca6526065da073f0a7c01ab1ed` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json; new review row `sha256:f2ba4023f32d7704e3e93ad61e257ae539a212d6badecf79c4a4e2aa5eb3a522`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[developer.android.com](https://developer.android.com/distribute/marketing-tools/alternative-distribution): Website/private-enterprise distribution example; distribution path does not establish maliciousness or compliance. No APK or device action.

## Ransomware

Exact ID `flashcard:sy0701-acronym-malware-attacks-ransomware-ransomware`; parent `deck:malware-attacks`, ordinal 0. Source `src/data/sy0701AcronymFlashcards.js:221` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:34efad31f920275542b4f58e09057d1ff17cbaf5381c67bff9d991859ad0613a`).

**Current meaning:** Malware that encrypts or blocks access to data until payment is demanded. Current example: Office spreadsheets become encrypted and a message demands Bitcoin for the unlock key.

**LOCAL proposal:** meaning: Malware that blocks access to files or systems, often by encryption, while attackers demand payment for restoration. Neither receiving a demand nor paying guarantees recovery.

**Exact retained root hold:** Hold the whole card: the standalone definition describes blocked access until payment is demanded, which can imply that making the demand ends the denial. The clearer encrypted-file/payment-demand example does not repair the definition delivered in every mode.

**Boundary:** A payment demand does not end denial of access; payment is not a recovery guarantee. Preserve the encrypted-spreadsheet/payment-demand example. The demand accompanies denial of access rather than ending it; this is vocabulary, not recovery guidance or a payment recommendation.

Source/catalogue current→candidate `sha256:67aa31ac627e2b88caba8cdde7199f7ba37f3f8312c86cd8883ea8fa46103ae6` → `sha256:52f64f5d14d7e4ca8ae88f648ec642c21362cf5d0228039f571c3eac982079fd`; raw delivered card `sha256:c69f69071d2d8d746e2939c322946e207d161bec5f5e5e39943079cef3695be8` → `sha256:45f36756d122cd1b2a27a031f17364304145b0582aee7ab05ef676024060428c`; meaning `sha256:c20bc055a80bd2ee500435145b7df6ea1dc1a7e137fbcb1fd4e55b7b63205727` → `sha256:132446d9bad899b1e2f23448306b530f2d63e1d017f12a3f00bce0c6a4ad44a3`; example `sha256:90347a1c5627372422fa0554062f8ada8c4de385c39936cabfac621cbdfe6f67` → `sha256:90347a1c5627372422fa0554062f8ada8c4de385c39936cabfac621cbdfe6f67`; mode/face projection `sha256:d817c5009801d075cd8fe9b176c0070cfe989651a78d038f1e9a55b14a61681b` → `sha256:fb89e20eb5c3da9574a269c87352c6547dc9a5bde851df52a9ee7dcf57696f46`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:bbe4726f939b229a2a203f6d13aa4ba5fbc7b1bdfc1c9bfeca1baedf7203b6ba` in docs/drafts/phase-2b5-final-eleven-held-cards-proposals.json; hold `sha256:229c6d7a8e8c711eeea004c42e63d6f53b62208cdcc0113907ac1df7302024b4` in docs/drafts/phase-2b5-malware-flashcards-proposals.json; new review row `sha256:7203aec3d9f2dfb4539687c92276fcc282eee32e6365dc00893a56032bec1600`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[www.ic3.gov](https://www.ic3.gov/CrimeInfo/Ransomware): Access denial and ransom demand; payment does not guarantee recovery. CISA guide body retrieval failed; no recovery workflow adopted.

## Rainbow Table

Exact ID `flashcard:sy0701-acronym-password-credential-attacks-rainbow-table-rainbow-table-attack`; parent `deck:password-credential-attacks`, ordinal 4. Source `src/data/sy0701AcronymFlashcards.js:247` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:e7c20df9f59484d3b072ed8939d8b4b3684551d89a0721251a91d585fcc496d2`).

**Current meaning:** Uses precomputed hash lookups to recover plaintext passwords from hashes. Current example: A known MD5 hash is looked up and instantly revealed as the password 'password'.

**LOCAL proposal:** meaning: A precomputed password-hash time-memory trade-off using chains of hashing and position-dependent reduction functions. Stored chain endpoints guide recomputation of candidate passwords; a successful match must be checked against the target hash. example: For a compatible unsalted hash, a rainbow table search reaches a stored chain endpoint. Recomputing that chain produces a candidate password, whose hash is checked against the target.

**Exact retained root hold:** Hold the whole card at zero credit: its definition describes generic precomputed hash lookup, and its instant MD5 lookup example supplies no rainbow-chain or time-memory distinction. The example cannot establish that the table is a rainbow table.

**Boundary:** A complete hash dictionary is not proof of rainbow-chain reconstruction; compatible hash/table assumptions and candidate verification remain necessary. Generic stored hash lookup is not sufficient to identify a rainbow chain. The candidate supplies endpoint search and recomputation rather than instant guaranteed recovery. Compatible function/parameters and coverage matter.

Source/catalogue current→candidate `sha256:e5f47f28bad4189cb0e5592d8644844535322d06434bca1892f9298ea29d4f21` → `sha256:1786a8e839bf8dd6d1f785b415b6caa720fdd15be90f40a23887cdaef65df512`; raw delivered card `sha256:8b734ee8b51d38ac1948e8cd4c348d6bcc52f73fb530a57d3552a999b9887fe1` → `sha256:905f0358473dc46b7a3ea72795cf2d8390a26ae8c1e2c301044ee95896b33eb1`; meaning `sha256:bd82e5eb76568ce1bab6ae6f53b8662c093f59461e5a8f4446849c401a6d2d87` → `sha256:5fc400b121ce166104c74e3b89feec15415f2b5491e76ecb82dea7fc4dc85adb`; example `sha256:eb9a8112fbd4524281fe8907d9630b7bf8d740569bac24408a44d366b404e968` → `sha256:1e1db047b88ec534b4686e90405f9a795cfe2f1a247c47627a1f713cdce19999`; mode/face projection `sha256:535d04138ccdbd59a6bbb99b4793d25b4a4ea687c09ede45f63f884a8badec29` → `sha256:c9ac6d2ae221f7b08a81640eb77c7266c15f82c4afd7a3614e3ccb59821c8f95`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:cb23c1d909c2e95bdfbb04ccd41b9f0fbd82b08858b878bc1f94c0d0df40c8fc` in docs/drafts/phase-2b5-final-eleven-held-cards-proposals.json; hold `sha256:d3696aa7cfa7b1ac8abbc05e6145820805189d3a81328ffbc832e6013e04f161` in docs/drafts/phase-2b5-password-network-glossary-proposals.json; new review row `sha256:bc6b42b436a6cae5ae39c5346685ac3e7d7e86d3e8cb8460f852c679b0542242`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[www.cs.miami.edu](https://www.cs.miami.edu/~burt/learning/Csc609.082/docs/crypto03.pdf): Oechslin author-paper copy, sections1.1 and3: endpoint storage/reconstruction and position-dependent reductions; no historical performance transferred to current systems.

## CTF

Exact ID `flashcard:sy0701-acronym-risk-governance-business-ctf-capture-the-flag`; parent `deck:risk-governance-business`, ordinal 8. Source `src/data/sy0701AcronymFlashcards.js:625` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:108cc5f2c4831c4a1137290fdfbb13b49e70871b69755660096a28efdf86c0a8`).

**Current meaning:** Interactive security challenge format used for training, practice, and awareness activities.

**LOCAL proposal:** Preserve the already clear introductory vocabulary; placement or support identity remains held.

**Exact retained root hold:** HOLD SCOPE, not factual rejection: no privacy/compliance or agreement/governance responsibility is taught in this short card. The broad inherited deck5.4 tag supplies no such relationship; precise placement/usefulness needs owner review.

**Boundary:** Naming a challenge format does not establish training effectiveness, assessed mastery, governance or privacy/compliance placement. The current definition soundly identifies a security challenge format. It does not teach privacy/compliance or establish the inherited governance placement, training effectiveness, mastery or a precise objective.

Source/catalogue current→candidate `sha256:2fffa03c7febc5312c0977e35d6a1bfa0d65193dea19ddc1a553ca5ce31933c4` → `sha256:2fffa03c7febc5312c0977e35d6a1bfa0d65193dea19ddc1a553ca5ce31933c4`; raw delivered card `sha256:1507eca410b81cb99b2a0c8b718cd211feaacb42968056a5457a8b89cff63f48` → `sha256:1507eca410b81cb99b2a0c8b718cd211feaacb42968056a5457a8b89cff63f48`; meaning `sha256:a3dca0f3caecf1985961b744cfe795fc0a571586730d738abc93099b02deb845` → `sha256:a3dca0f3caecf1985961b744cfe795fc0a571586730d738abc93099b02deb845`; example null → null; mode/face projection `sha256:8780e2953469f2ea02a25094b1b020c693d2a4cd7349d85aedac373207fce442` → `sha256:8780e2953469f2ea02a25094b1b020c693d2a4cd7349d85aedac373207fce442`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:dc5c89efd240283dbb4187259853dbbc6161a2e09c19a7b86e735ccf340bb702` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:e55b32beb7507aa8ccc27d6a63c851ceb782e94169276af094573948285fa244` in docs/drafts/phase-2b5-risk-governance-residual-terms-proposals.json; new review row `sha256:00b847919f6909635815071fa3c095860703db3117f7915a1b8f326b0316c6bd`. Prior/new/remaining card qualification0/0/1. No current hold clears.



## ISP

Exact ID `flashcard:sy0701-acronym-risk-governance-business-isp-internet-service-provider`; parent `deck:risk-governance-business`, ordinal 14. Source `src/data/sy0701AcronymFlashcards.js:631` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:4e88899acb0de8b0a0907d0d8d6c1d46ab1281c100932fec8c35010c5b6d1453`).

**Current meaning:** Organization that provides Internet connectivity.

**LOCAL proposal:** Preserve the already clear introductory vocabulary; placement or support identity remains held.

**Exact retained root hold:** HOLD SCOPE, not factual rejection: this connectivity definition alone supplies no privacy/compliance, supplier assurance, service agreement or governance decision. Inherited tags do not establish the needed relevance.

**Boundary:** Naming a connectivity provider does not establish supplier assurance, service obligations, resilience or canonical governance scope. The current definition soundly identifies a connectivity provider. Supplier assurance, service obligations, resilience and privacy/compliance are not taught merely by the name; placement remains held.

Source/catalogue current→candidate `sha256:9b31bbfa7656ebff135fc013b29327d63f48cc2f14603634c4f9113cf81c6719` → `sha256:9b31bbfa7656ebff135fc013b29327d63f48cc2f14603634c4f9113cf81c6719`; raw delivered card `sha256:9f77385c68bb26bae6cd28a5989cb29852fcce16b59e4d60c0daaaf3e0d456aa` → `sha256:9f77385c68bb26bae6cd28a5989cb29852fcce16b59e4d60c0daaaf3e0d456aa`; meaning `sha256:49fa80e01c36a220dd36c4f189f8916e7db0f2bd6c04c212cbcc2a699ac9b208` → `sha256:49fa80e01c36a220dd36c4f189f8916e7db0f2bd6c04c212cbcc2a699ac9b208`; example null → null; mode/face projection `sha256:1358d991ccf9abea2b0a745514a8196af5ea21148780cd8f93853480d19a0b53` → `sha256:1358d991ccf9abea2b0a745514a8196af5ea21148780cd8f93853480d19a0b53`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:fa4e314f87161c2146faacaf326e101f38d8311d00a6c54e898ac640263c65e4` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:97153f37bc83bc8e2c0a9bdb98647ff48f63f361e59e9359af3c0ac99fdca285` in docs/drafts/phase-2b5-risk-governance-residual-terms-proposals.json; new review row `sha256:b2899c50cf2fbc9509b275e42b91e0512f16a42b6429fba8dd8f669fca258435`. Prior/new/remaining card qualification0/0/1. No current hold clears.



## MOA / MOU

Exact ID `flashcard:sy0701-acronym-risk-governance-business-moa-mou-memorandum-of-agreement-memorandum-of-understanding`; parent `deck:risk-governance-business`, ordinal 15. Source `src/data/sy0701AcronymFlashcards.js:632` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:47f21c6d7e845a50468fd425314eb8389302e72fca3ba91d6f444e071a7c4668`).

**Current meaning:** Documents that define cooperation and shared responsibilities between organizations.

**LOCAL proposal:** meaning: For this study collection, MOA and MOU are grouped as cooperation memoranda. The issuing organization's defined usage and each document's actual terms determine its commitments; the title alone does not establish legal force.

**Exact retained root hold:** HOLD PARTIAL GROUP: only a generic shared purpose is supplied; no contextual distinction or explicit organization-specific equivalence is taught. Primary agency examples sometimes use these titles interchangeably, so do not invent a universal binding/non-binding divide. Owner must define the intended contextual grouping or supply distinct meanings.

**Boundary:** The title and study grouping do not settle commitments or universal legal force; actual issuing usage and terms remain relevant. This proposes an explicit study grouping, not universal legal equivalence or a binding/nonbinding rule. An owner must still approve the intended usage; no agreement, payment authority or legal effect is assessed.

Source/catalogue current→candidate `sha256:9812bdefab19f41a186ea67d0df9a2f7be701635c28de1f00cb033714af5445a` → `sha256:1fe7a0e7c13c0150ed832dc1a75a7aa387016c27fd54ac05b0137933b9196721`; raw delivered card `sha256:9458e90d7607a50ddd0841d10b5c0d52b7bf4c944fe5a5afe50923d28fc10c44` → `sha256:ad2c2a8420e9170433824c89bb69a45c38c90bd6f3e547e766c819e075e89d55`; meaning `sha256:aba3de73f4d4263217d3072e42dd79d6bd98802614af927241827dd4f32877ce` → `sha256:559b0689a5a1cd2bef9f6b6b07dbda0f37d2df1a470830cd480a17e299c7bba9`; example null → null; mode/face projection `sha256:ce7d02cccd38679f8a0cb6c5ff300b1d592bcf6c9ee73e6570e8a3f3c917f436` → `sha256:f1463fc4e2940ee5e6d6c5317f52ab611a7c1b8e0c7d56b32d3f787819b8f5d4`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:9f20b830ce1c947229fa42c5912def618cd95bf07c41c60ffba9f8108bb81a53` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:b33b0febf958576266e69b5682cffad405f8eba703b9a5166780a2515c2c208c` in docs/drafts/phase-2b5-risk-governance-residual-terms-proposals.json; new review row `sha256:692e0db7f95ea573ed731a8c68df54e1be131d44a19bbbccf1af9680007bbbc2`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[www.usgs.gov](https://www.usgs.gov/survey-manual/50026-domestic-memorandum-understanding): Earlier bound agency naming example retained; fresh body/find retrieval unavailable. Candidate explicitly proposes study grouping, not universal legal equivalence.

## OID

Exact ID `flashcard:sy0701-acronym-risk-governance-business-oid-object-identifier`; parent `deck:risk-governance-business`, ordinal 22. Source `src/data/sy0701AcronymFlashcards.js:639` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:bce15ff739c594687325d7875152d711f0747ef9a61b4793eb4f97dfea359be3`).

**Current meaning:** Unique identifier used to name objects in systems such as PKI, SNMP, and directories.

**LOCAL proposal:** Preserve the already clear introductory vocabulary; placement or support identity remains held.

**Exact retained root hold:** HOLD SCOPE, not factual rejection: naming in PKI/SNMP/directories alone does not teach compliance/governance or agreement decisions. OID allocation does not prove certificate trust, access authority or security. Precise instructional placement remains unresolved.

**Boundary:** An identifier is not proof of trust, security authority, certificate validation or governance placement. The current definition is sound naming vocabulary in its technical examples. Identifier assignment does not prove certificate trust, security authority or relevance to governance/compliance; placement remains held.

Source/catalogue current→candidate `sha256:2ffab2c220e2296461e9ba32c5fb41090ea90ce03ab16c47520a380648aa0813` → `sha256:2ffab2c220e2296461e9ba32c5fb41090ea90ce03ab16c47520a380648aa0813`; raw delivered card `sha256:c2be378fc35f473a6023a36caf5ad308bcf29554535ec9cf6a8a42461ae4379c` → `sha256:c2be378fc35f473a6023a36caf5ad308bcf29554535ec9cf6a8a42461ae4379c`; meaning `sha256:2ef52c40fac3b44ca11b323f432778597278499fcf06ce453f79c2706bb6de2a` → `sha256:2ef52c40fac3b44ca11b323f432778597278499fcf06ce453f79c2706bb6de2a`; example null → null; mode/face projection `sha256:bc23d1a24982a744cef331d9d35bc248f56348d040482a02ef018e86c462c808` → `sha256:bc23d1a24982a744cef331d9d35bc248f56348d040482a02ef018e86c462c808`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:3fdca209cd7f0bcbf3d4489e0fa3e99f00e1febf86d1a872c5eef9410a2f9ca1` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:3a47c68a3cd3bbbdb055c84d8386dc194d41fa45089fc3841bee326094bc334f` in docs/drafts/phase-2b5-risk-governance-residual-terms-proposals.json; new review row `sha256:14e900aa404fd5c4ce65fd29a1e648ca63938604a5a69ef306d3f6d260911ecf`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc2578): Sections3.5–3.6 object naming/registration in SMIv2; not trust, certificate validation or governance placement.

## PHI

Exact ID `flashcard:sy0701-acronym-risk-governance-business-phi-protected-health-information`; parent `deck:risk-governance-business`, ordinal 24. Source `src/data/sy0701AcronymFlashcards.js:641` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:3bb5065be7dfc22d7390c1d29ce95c31c12b8e309b8e333d6963f843df02c8d5`).

**Current meaning:** Health information that can identify a person.

**LOCAL proposal:** meaning: Under HIPAA, individually identifiable health information held or transmitted by a covered entity or its business associate, subject to defined exclusions.

**Exact retained root hold:** HOLD: the isolated meaning supplies identifiability but not the HIPAA covered-entity/business-associate context or relevant exclusions. A learner could classify all identifiable health data as PHI. This judgment comes from the card itself; the separate held glossary does not automatically hold it and neighboring HIPAA wording cannot repair it. No real record or legal applicability is classified.

**Boundary:** Identifiability plus health content alone does not establish HIPAA scope; the prior candidate includes covered-entity/business-associate context and exclusions without classifying real data. Reuse the exact earlier offline PHI glossary candidate with a separate card binding. Identifiable health information alone does not establish HIPAA scope, and defined exclusions remain relevant. No real records classified.

Source/catalogue current→candidate `sha256:686e91e27a2d783eff72f191009785f5a179e773abfb67d1139e7ac2ab9487b7` → `sha256:ed3514c22f040f676f625aa0fb3222e0b87ace6b62f9a9ab5964f186cd4a4ebd`; raw delivered card `sha256:81a9a548a928c70a00a4a54eb6bb6f1172bff91b7f1b6fa1ebb6185c1bce9b03` → `sha256:579a2fc51fb22faef84eaafbb469e7d3e641e316a31de4b24de46308c8080bb3`; meaning `sha256:55185847a65ba24d99b84ab5f17425de5c18abc1ef1dd7b8436c103dc21e77bf` → `sha256:c738ad045e0199a0cc713897b3757de5b90d1f5e56aa85464d772af7a4f392b6`; example null → null; mode/face projection `sha256:c6029f06212eb116bbf74df6ffab77cc36b8ac5e83d81905a4c4e2ca6d14423c` → `sha256:14a92e99d037d81f276a303587a001b67674179459f32226acea68f381109f7e`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:0d0d8ec94b1af5fe83d148f3f0e4564c871b380ce43d0b81e70cd5f811a44271` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:14cde759affa07f2b0d0f326a2db66dbd93d535e9ff419badc1fb7365489561a` in docs/drafts/phase-2b5-governance-awareness-vendor-cards-proposals.json; new review row `sha256:e494aa37bd2ee2d71d572f104cbbce3dd9bdcd5db49a9ff1616819ff739e3a1a`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[www.hhs.gov](https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html): Covered-entity/business-associate context and exclusions in What Information is Protected; no legal classification of real data.

## CIO / CSO

Exact ID `flashcard:sy0701-acronym-security-operations-response-cio-cso-chief-information-officer-chief-security-officer`; parent `deck:security-operations-response`, ordinal 1. Source `src/data/sy0701AcronymFlashcards.js:523` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:3d6b286836795a6fbf5a620a70c7e10fc668d9999d4c10e2c173cc5d8a65c023`).

**Current meaning:** Senior leaders responsible for IT direction and security risk.

**LOCAL proposal:** meaning: Commonly, a CIO leads the organization's IT strategy and services, while a CSO leads its security function. That function's physical, information or other scope depends on the organization.

**Exact retained root hold:** HOLD: the shared senior-leader statement lists IT direction and security risk without assigning duties to CIO versus CSO.

**Boundary:** Titles and scope vary; CSO is not automatically renamed CISO or given a universal information/physical-security responsibility map. CIO and CSO responsibilities may overlap and vary; CSO is not silently renamed CISO. This is a common role distinction, not a universal organization chart, legal assignment or new canonical skill.

Source/catalogue current→candidate `sha256:7556fc3e41e5119100293d3a7e5bf35ea58b610c486246f1f542281f771fac2b` → `sha256:d28c5aa06ecb824d6dc89ab49d402289c23e66ec5443dade115f1c1dbdea1b8d`; raw delivered card `sha256:9a13f7dca8fa5c8b5c816cd01df1b26b89c280b89d0393220c703d1df4912c84` → `sha256:7a0b30ea3e97135683203b52c29dcc9da4dd689ede5d82513d29dafaffcf7d7e`; meaning `sha256:0baa1c570b9207dccb6da337bef54d2045682d066fe2ba7d3666aa3584be446c` → `sha256:3b1b3c1c6005026f284e600aba00824effe208f8a9081268a74d0304fda55f16`; example null → null; mode/face projection `sha256:5d33f27948536d1a1b864caf19f2a6ed0276733487f5b973904c883035f009d3` → `sha256:a4e53f8aba6f097c78c8523311821e58ed4227e0887b8a7a8443f2182a2fb962`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:c35c2796bf542c6a417927824a0e48cd95fdb8ca4a9ad6395eac2f83ea72746d` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:ace8dbb12f88439ad176eb3eeb0b41b54f53f4749d093649e7575d804f0bda7b` in docs/drafts/phase-2b5-security-operations-deck-proposals.json; new review row `sha256:cfe0d2957f16f9d7390e94d9b930cfec8067218d30d75328411c703cc22dee9f`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[csrc.nist.gov](https://csrc.nist.gov/glossary/term/chief_information_officer): Scoped government IT-management definition. Common CSO contrast is bounded; DHS current PDF/page unavailable beyond primary indexed role excerpt.

## SOC

Exact ID `flashcard:sy0701-acronym-security-operations-response-soc-security-operations-center`; parent `deck:security-operations-response`, ordinal 16. Source `src/data/sy0701AcronymFlashcards.js:538` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:a56ffabcf2d6b6aec6d81d58feae995c98db66df4d6dd62f15631bf43a6fc478`).

**Current meaning:** Central team or function that monitors, detects, and responds to security events.

**LOCAL proposal:** Preserve the already clear introductory vocabulary; placement or support identity remains held.

**Exact retained root hold:** HOLD SUPPORT IDENTITY ONLY: the operations-center definition is clear, but sy0701.term.soc also merges the distinct chip SoC and multi-meaning held glossary.

**Boundary:** A clear operations-center meaning does not resolve the shared support node with chip SoC and the operations/assurance glossary. The current center definition is sound as a monitoring/detection/response function. The chip SoC and multi-meaning glossary share the observed support identity; definition clarity does not resolve that identity hold.

Source/catalogue current→candidate `sha256:40681b5924386a681fdcab479da754164b95a1bfdf5ba60b1ac639d56bbeae26` → `sha256:40681b5924386a681fdcab479da754164b95a1bfdf5ba60b1ac639d56bbeae26`; raw delivered card `sha256:175d6e21fa343e8d2624f10cc74f18be878943b6a559b6a35d0e3290d2b4e713` → `sha256:175d6e21fa343e8d2624f10cc74f18be878943b6a559b6a35d0e3290d2b4e713`; meaning `sha256:37855d4f53157f13b073f0013046eabf5fda1537279101ba860df0bd08f0d047` → `sha256:37855d4f53157f13b073f0013046eabf5fda1537279101ba860df0bd08f0d047`; example null → null; mode/face projection `sha256:272bf4c1904a17424cd9178b93fb1e5373f7c9b68fec4f0cf36b3a2009a11d29` → `sha256:272bf4c1904a17424cd9178b93fb1e5373f7c9b68fec4f0cf36b3a2009a11d29`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:068399608f284004f8bbf978bb480d4ffbe246bb90682c54db642caf5529312c` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:34a1794613a4f144d0e6caccf7150babfd484ffcb7e49eb0e7b01131bab151e2` in docs/drafts/phase-2b5-security-operations-deck-proposals.json; new review row `sha256:d5f9183452c1ee2bcafffba60e819e1e665b47931bd71978aa3dccfff9e7bc01`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[www.microsoft.com](https://www.microsoft.com/en-us/security/business/security-101/what-is-a-security-operations-center-soc): Monitoring/detection/response function and managed-center context only; no vendor benefit, compliance or effectiveness claim adopted.

## Phishing

Exact ID `flashcard:sy0701-acronym-social-engineering-attacks-phishing-phishing`; parent `deck:social-engineering-attacks`, ordinal 0. Source `src/data/sy0701AcronymFlashcards.js:259` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:0080dd3f3e6c46b2886d40196ca6b29976d75dc7389beb512e0609587f8fea0a`).

**Current meaning:** Broad message-based attempt to trick users into revealing information or taking unsafe action. Current example: Many users receive a fake password-reset email linking to a credential-harvesting page.

**LOCAL proposal:** meaning: Deceptive electronic messages designed to induce disclosure of sensitive information or unsafe action. Phishing can be mass-distributed or targeted; spear phishing and whaling are targeted variants.

**Exact retained root hold:** The mass-message example is consistent with bulk phishing, but broad in the definition can be read as excluding targeted variants.

**Boundary:** Mass distribution is one example; the umbrella concept does not require many recipients or make every targeted subtype an independent assessed family. The existing mass-message example is preserved as one phishing case. Recipient breadth is not the umbrella definition; direction changes and example recall do not establish independent detection skill.

Source/catalogue current→candidate `sha256:154e5fa68f0043e425d424d0b300b00133914c1473208a497b1336b03c861a61` → `sha256:945f35ca15146bbb54c979d83b66a8909ceb084a18467d1e4a05c2aa2eaae0e1`; raw delivered card `sha256:b7bbba7c63d97d0d77fe20db19dade958b5502a1166378141e1a98c69ab3b7f7` → `sha256:b0d94d681007ba95ca811d3b28ddfe8acc516cdfaf29adb1186c1aca84a53e7b`; meaning `sha256:b3f7719589fa15a29e9f05fedfb272c0942809c3546d07a95bb846bc5f9d3eaf` → `sha256:6efd4a463a3b0f59d433c7d52f0644204e7a7f2efc52368ba0daa51726f2a9f0`; example `sha256:c06d55975e01831306bc3ff92fb24ca372e030ef7bf0ffbcee71b0d9778d6791` → `sha256:c06d55975e01831306bc3ff92fb24ca372e030ef7bf0ffbcee71b0d9778d6791`; mode/face projection `sha256:629124a00019291d37b43b73945f5f1c57d6853a7e2d8921007ab896060299c1` → `sha256:9c4ab51fdc25e17e0c8a24722d78e34b3539bb20d52858c04b00a154ffd40c69`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:f988807c382e64d54e750dc89de9f1d1ba34e23bcb4199a2e5fbc93038e09ec2` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:873ed0203afdec953c68267ffe514d2b3eb514b75451e3727e954dcb527347a4` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json; new review row `sha256:59bd246acdcf0b6e526b3592351f1833a81f327a6601afeae6525aae11d9a93f`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[csrc.nist.gov](https://csrc.nist.gov/glossary/term/phishing): Deceptive electronic solicitation without a bulk-recipient requirement. Targeting distinction also retains the earlier separately reviewed spear-phishing context.

## Tailgating

Exact ID `flashcard:sy0701-acronym-social-engineering-attacks-tailgating-tailgating-piggybacking`; parent `deck:social-engineering-attacks`, ordinal 12. Source `src/data/sy0701AcronymFlashcards.js:271` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:42d188b5feddfbaf19cf831112a563119c7a7b39af4bf8476b8e9cd3785df817`).

**Current meaning:** Follows an authorized person into a restricted area without using credentials. Current example: An attacker carrying coffee walks behind an employee through a badge-controlled door.

**LOCAL proposal:** meaning: Unauthorized entry into a restricted area by following an authorized person through its access boundary. A legitimately authorized escorted visitor is not an attacker merely because they did not present separate credentials.

**Exact retained root hold:** The attacker example suggests unauthorised following entry, but the definition only requires following without credentials and can include legitimate escorted entry.

**Boundary:** Lack of separately presented credentials does not make an authorized escorted visitor an attacker; unauthorized following-entry is the scoped case. This is the supplied following-entry attack sense of the Tailgating/Piggybacking label. Terminology and escort policies vary; a person noticing or allowing entry does not by itself establish authorization.

Source/catalogue current→candidate `sha256:b2cdc6db442358b5334c3a76277cf94938d8456bd1f5c7a15ab6e04cebacb2f8` → `sha256:bb2f56071758a2b0544d6df6ba402dd9ee67f9f4af6e3ba148ea22654718a188`; raw delivered card `sha256:44838e93a4f8f239e869b58a4606437479ca01b496ca06f1465e9f69458d3371` → `sha256:a6a0a59814b92bc106202defefbf9cf38a02036f62d6e0306ef1f8ad351acf27`; meaning `sha256:64a8d6e98b2c4528b65d8cb8ecd30eeedf6e535f30b1670aa35222e52e915b76` → `sha256:b99d2c2c2eddfd1978ca880e635089af5b7fb6f12f0dc549e602d921f412b652`; example `sha256:32fe180999d6b21b481ce38ca2d6f0ae9d147ddc544e3ceaf7b477f62da45058` → `sha256:32fe180999d6b21b481ce38ca2d6f0ae9d147ddc544e3ceaf7b477f62da45058`; mode/face projection `sha256:c0c78ddeb1f929479d7fea836fcae99cb1c3aa5a30df6f521cc57222345dfd1f` → `sha256:d665d45e15dbf6c92316570f7519a1315ed759437249eda034828ebdc4d6ebfe`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:b5e6f96c38ca70bbe43e336b1a17f36795a29762dba1c8efae1033a7414c6a45` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:d83a8b584531308c4eaba134658edfd4ecaca2e614ca35b24088118143ef6630` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json; new review row `sha256:9861ea6b80329188c8243c21eddd1fe61a798040fded46ea3cc2fbae3628dc0d`. Prior/new/remaining card qualification0/0/1. No current hold clears.



## DKIM

Exact ID `flashcard:sy0701-acronym-threat-intel-protection-dkim-domainkeys-identified-mail`; parent `deck:threat-intel-protection`, ordinal 3. Source `src/data/sy0701AcronymFlashcards.js:317` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:618158885bef3a2602020ee27a4f4718d93bd8323682f9aea0fb662e8794fb5e`).

**Current meaning:** Email signature method that helps prove a message was authorized by a domain.

**LOCAL proposal:** meaning: Email-signature mechanism in which the signing domain claims responsibility for a message. A valid signature verifies covered content under that domain's key; it does not authenticate the visible From author or prove the message safe.

**Exact retained root hold:** The authorization wording leaves the signing domain and purported author insufficiently separated. A valid signature establishes a domain responsibility claim under its key, not approval by the visible sender or a trustworthy human.

**Boundary:** A valid signing-domain signature over covered content does not authenticate the visible From author, establish truth or prove message safety. The signing-domain responsibility claim is distinct from the purported author. Covered content, key/DNS trust and signature validity do not establish truth, recipient authorization, From-author identity or message safety. No email verified.

Source/catalogue current→candidate `sha256:767b84b54f4546f04c7ac23f868e940a12db217799b67bc31d536e106696bff9` → `sha256:0c858f14ae2e8ef2da6cb75d67306ce5b2c62741f7712f0df8d170d6030a25b9`; raw delivered card `sha256:50d76d47800d485acc058d32852c1c988a03b74c51698ecb06b663660260381c` → `sha256:13967f9adf638c7f2dedd5d3a8ec9db08177e279428d0958c0aa5a5b0ad5749c`; meaning `sha256:7bd94b86d90f5aee0768cea7a184dd7a908911e86fe6f28ece1d39b24bda9245` → `sha256:fb2deb1fd7df4df34fa1dd651787211f38da8af5b874fc397813679aad7f12e0`; example null → null; mode/face projection `sha256:6babfa4b2a96efe8ab54356a710a6f6d9ad6c3d2aac7b4d26703ea7a3c356cef` → `sha256:01a87ddefc632762508472de901a20fa9918702535733518192329a1e6bb01b8`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:fa01c15e68cbc80ac491c620a5d7bc90691f064ed036a7dfe3b7a8f9266f4d14` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:81d0d57c6ea5a4d94717417272b3c51ae3193460757108bc6cfda34181c00ebd` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json; new review row `sha256:7843e6f816167b329fbc6847406cf003b7bc6c9d55f127062386bfd0e3a9b17e`. Prior/new/remaining card qualification0/0/1. No current hold clears.

[www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc6376): Abstract: signing-domain responsibility versus purported author, cryptographic signature and key lookup; no complete/current-algorithm or message assessment.

## TAXII

Exact ID `flashcard:sy0701-acronym-threat-intel-protection-taxii-trusted-automated-exchange-of-indicator-information`; parent `deck:threat-intel-protection`, ordinal 8. Source `src/data/sy0701AcronymFlashcards.js:322` (file SHA-256 `39d2905c3b957321ef9244bfed61591739e23fe9354d89279f5deda8b90586b1`, prefix anchor `sha256:3f405dcec9a9fb6a884db465ecc0815afdaff0e57b392a04dda489f7d75ecc66`).

**Current meaning:** Protocol used to exchange STIX threat intelligence.

**LOCAL proposal:** Keep meaning/example and expansion unchanged. The prior expansion-only correction and factory-ID compatibility issue are references, not adopted changes.

**Exact retained root hold:** The expansion retains Indicator Information, while TAXII2.1 names Intelligence Information. With no version or historical qualification, acronym recall would reinforce an ambiguous version boundary.

**Boundary:** A meaning-only edit cannot repair an expansion shown on acronym recall; the prior TAXII2.1 expansion correction changes the source-factory ID and remains outside this slice. The corrected expansion is scoped to TAXII2.1; the current STIX-exchange meaning remains a sound common use, not an exclusive format claim. Changing expansion changes the factory-generated card ID, so identity compatibility remains unresolved before any publication.

Source/catalogue current→candidate `sha256:1028c249d0e4475d993d05a805e6bf47724553b4261e5a3733a2ab0ae8b96e94` → `sha256:1028c249d0e4475d993d05a805e6bf47724553b4261e5a3733a2ab0ae8b96e94`; raw delivered card `sha256:d8e9e3e83fe46e80a56e6fd803689cd528187859db8052239691818924b95c9c` → `sha256:d8e9e3e83fe46e80a56e6fd803689cd528187859db8052239691818924b95c9c`; meaning `sha256:a3010f0de6252be56c1ab48a3856ecb9bd63ee07bf9d4080a164309116a9215b` → `sha256:a3010f0de6252be56c1ab48a3856ecb9bd63ee07bf9d4080a164309116a9215b`; example null → null; mode/face projection `sha256:b188ccdfcddfa5a6327d4ca43700f3b67b1dead94ec9dc9c1348ff7715748f67` → `sha256:b188ccdfcddfa5a6327d4ca43700f3b67b1dead94ec9dc9c1348ff7715748f67`. Exact per-mode front/back/static text hashes and protected fields are in the packet.

Prior review `sha256:3804cf8efc1e89c40b588321dc6539c9baaedb333d651f4bbbba52f26e940783` in docs/drafts/phase-2b5-remaining-fifteen-held-card-drafts-proposals.json; hold `sha256:7f4f2039a9f65f6ec74d1ed1bec9ecf944474a12c90a42d4e28c8476b8c79367` in docs/drafts/phase-2b5-api-malware-teaching-proposals.json; new review row `sha256:42ad10fc3634f93b38ba29c3b46b47a7f9dba2920fb660c199b58ffa5c7b8f20`. Prior/new/remaining card qualification0/0/1. No current hold clears. Prior unadopted expansion draft `sha256:3804cf8efc1e89c40b588321dc6539c9baaedb333d651f4bbbba52f26e940783` would generate `sy0701-acronym-threat-intel-protection-taxii-trusted-automated-exchange-of-intelligence-information`; it remains outside meaning/example proposal fields.

[docs.oasis-open.org](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html): TAXII2.1 Introduction/terminology Intelligence Information expansion and STIX/other-content section; no claim of newest version or installed feed.

## Actual faces, unchanged helper and source protection

The exact pure mode/face/completion helper source unit `sha256:f2133a8259147f80d3edb1f6cd89112029c74c1c8c2de22354cfd35542c8d5d4` matches the previous13-card packet binding. The actual source prompt expression, makeCard factory, flattening function, glossary matcher, collection helpers and lexical selectors are reused rather than replaced by approximations. Source flows from native authored rows through factory/raw study cards and separately enriched flattened catalogue metadata; PBQ question overrides and private source precedence do not apply to these cards.

All11 adopted meaning/example replacements reproduce their earlier raw and catalogue signatures exactly. Four current clear-vocabulary findings reproduce unchanged current sources, while TAXII's prior expansion draft remains explicitly excluded. The factory reproduces all16 current candidate IDs with original labels/expansions/topics/types/metadata. Flattening keeps313 IDs in source order:11 selected cards change,5 selected cards and297 unselected cards remain exact. No new ID is generated for publication. Candidate text stays inside offline artifacts and in-memory sets.

**48 requested-mode checks and96 current/candidate face projections** execute the actual definition/acronym/example expressions. Seven selected cards have authored example-mode delivery and9 example requests fall back to definition. Twelve labels satisfy the app's unequal-label acronym test; this is string comparison, not a linguistic acronym validator. The other four full names use definition fronts in requested acronym mode. Definition fronts and every definition-bearing back reflect the candidate meaning; new examples do not silently repair an unchanged incorrect definition.96 static text specimens and a hostile-string escaping check pass. Captions and examples remain source-bound; no context note is automatically delivered.

The lab renders plain text and has no GlossaryText or dangerous HTML insertion. Both faces exist in source markup, with self-rating rather than an independent graded response. Sixty-four current/candidate empty/full-pass completion invariance checks preserve the actual completion rule; they establish neither mastery nor learning. No browser, full interactive React, keyboard, screen-reader, timer, submit/rating handler, user storage or real learner is exercised.

Eight parent-deck contexts preserve child IDs/order and bind actual related-lesson/profile outputs. Candidate text changes1 related-target lists in memory. Sixteen synthetic weak-topic contexts record1 changed selection lists, with each selected-card inclusion observed rather than assumed. Four current/candidate deterministic collection checks preserve starred identities and actual random-builder/hydration rules; preserve-order fixtures are not random-sampling or real saved-deck observations. Seven selector signatures remain unchanged. Lexical usage changes are a future integration concern, not approved adaptive teaching links, skill mapping or recovered-learning evidence, and none is applied.

## Neighbor/glossary collisions and TAXII factory boundary

Every selected source ID occurs once. Exact-label/support-node peers and current/candidate label/meaning/example glossary matches are fingerprinted without inheriting their approval or holds. Clear glossary wording cannot qualify a card, and clear card vocabulary cannot approve its chapter placement or a lesson/deck. Compound labels do not become independent assessed families.

Operations SOC, chip SoC and the operations/assurance glossary share **sy0701.term.soc**. Both card meanings remain unchanged and clear within their own introductory contexts, yet the shared identity remains held. Case does not split that support node. The latest held glossary candidate still has exactly two operations/assurance senses; no chip sense or router is added. The lab does not render glossary popups, so matching SoC processor to SOC is a lexical comparison, not a repaired/broken chip-card tooltip observed here.

Seven matcher controls bind SOC/SoC/SOC2, PHI, DKIM and TAXII hits plus **OID's actual nonmatch**. No OID glossary entry or expansion alias is invented. All matching remains the current matcher/dictionary, without new disambiguation, alias, split/merge, canonical role or teaching approval.

TAXII's current expansion has Indicator Information; the prior version-scoped2.1 draft uses Intelligence Information. Its exact earlier row/boundary and old→corrected expansion/factory-ID hashes remain bound as evidence. The earlier corrected generated ID is absent from the313 current cards and differs from the original. Applying that expansion while pretending the source factory preserves the old ID would be an identity error. This slice's allowed proposal fields are only meaning/example, so it adopts no expansion change. The old expansion remains visible on acronym-recall backs and the full card remains held; adding a footnote to the meaning would not repair that face. A later authorized expansion/version and identity-compatibility decision is necessary before publication, not an owner question blocking this offline review.

## Source evidence and semantic counterexamples

All source references are reused at their exact prior finite scopes. The previous final-eleven and remaining-fifteen packets bind the actual source/candidate fields and citations: buffer/check-use mechanism; payment/recovery separation; rainbow chain and candidate verification; authorized off-store distribution; context-limited cooperation memoranda; HIPAA coverage/exclusions; variable role scope; phishing and unauthorized entry; DKIM signing-domain responsibility; and TAXII2.1 naming/identity. The four clear current meanings are inspected directly from authored faces; inherited governance labels do not supply missing teaching.

Sixteen reviewer counterexamples bind exact current/candidate source and definition-bearing face revisions. They are semantic stress cases, not exploitation, password recovery, precomputed table generation, software installation, phishing/entry attempts, legal data classification, contract interpretation for a real agreement, DNS/email/cryptographic verification, private content or measured learner outcomes. PHI and MOA/MOU wording remains the earlier bounded proposal, with no fresh legal applicability review or real-case advice. Historical cryptographic/hash references are not current algorithm recommendations. Prior primary-source/paper retrieval limits remain carried, not upgraded to a full standard or fresh external verification. No browser or external content retrieval is performed for this slice.

Equality/export guards reject **1751 altered packets**, including stale/rehashed source/raw/face/protection claims, changed labels/expansions, erased clear-vocabulary findings, false glossary/context matches, automatic support-node equivalence, TAXII expansion adoption/identity migration, cleared holds, duplicate credit and private/learner exports. The entire packet must survive plain-JSON serialization exactly. These checks protect the reviewed result; they do not prove arbitrary prose true or a deployment safe.

## Prior + new + remaining

| Measure | Prior | New current credit | Combined / total | Remaining |
|---|---:|---:|---:|---:|
| Selected cards |0|0|0/16|16 held|
| All flashcards |271|0|271/313|42|
| Glossary |150|0|150/162|12|
| Catalogue |1694|0|1694/1878|184|
| Support |748|0|748/834|86|
| Questions |463|0|463/483|20|
| Full feedback |464|0|464/483|19|
| COMPLETE pairs |456|0|456/483|27|
| Decks |14|0|14/29|15|

Draft accounting:11 earlier meaning/example replacements revalidated +4 unchanged clear-vocabulary reviews +1 unchanged expansion-held review. There are11 changed meanings and2 changed examples, with overlap; zero new wording or expansion proposals. Previous13 plus current16 equals29 acronym identities, not29 newly qualified cards. The separate13 held term records remain in the42-card gap. No duplicate card/glossary/lesson/deck, family, objective, role, skill, teaching or mastery credit.

All181 holds remain:16 selected cards plus165 others. Of184 remaining catalogue IDs,180 are held plus4 unheld private records; p036 remains carried outside remaining catalogue. 159 prior packets reconcile1694 credited identities,786 raw instructional occurrences/772 distinct/14 repeats,752 inherited fields,82 immediate baseline fields,493 source files and25 protected release hashes. Remaining arrays, census/objective/source-choice bindings, ledger, active v1/v2 helpers,447 native-supported questions and exact active package remain unchanged.

## Delivery and remaining decisions

Initial contract check failed because this focused complement audit was absent. No owner answer blocks the finite review. Later decisions still include TAXII expansion/version and ID compatibility; SOC/SoC support identity; compound-role/term conventions and precise governance/teaching placement; and approval of changed source revisions. None is silently resolved or implemented.

Required gates: deterministic focused write/recheck, syntax, all29 mapping tests plus exact package reproduction, git diff --check, actual skip-deploy exit0/control1, task-only three-file commit/push and exact remote refs/blob bytes; preserve eight unrelated dirty entries. The unchanged owner27-choice packet is not repeated.

No active learner/card/runtime/compiler/glossary/alias, canonical role/skill/objective/teaching approval, private/database, storage/analytics, browser, automation, build/deployment or Phase3 change. Package/lock hashes retain7 prior native advisories (critical1/high4/moderate1/low1); no fresh dependency audit or security clearance. **LOCAL sixteen-card review complete; all current holds remain; NOT READY for activation.**
