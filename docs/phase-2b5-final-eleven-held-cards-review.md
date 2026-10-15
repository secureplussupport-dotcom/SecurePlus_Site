# Phase 2B-5 — final eleven remaining flashcards

**11 cards reviewed, 11 offline correction drafts: 10 meanings and five examples. One current meaning and two current examples are preserved. All 181 holds and existing credit remain unchanged.** Baseline: b745e37222cfcc16109db45b8476df985f8eeef3. Approved master-plan decisions govern; Phase 1 audit supplies historical facts. No unresolved product conflict requires active behavior changes.

Selection preserves the baseline remainingCatalogueRecordIds order after filtering flashcards and excluding the 31 existingHoldPreserved child IDs from the remaining-deck packet: Buffer Overflow through Compensating Control. These are exactly the other 11 of 42 remaining flashcard records. The preceding two packets reviewed 31 deck children; their offline drafts are preserved and are not merged into these comparisons. Six current parents supply context. Other parent members remain current and are not re-reviewed.

The complete 138-packet inventory was checked for prior instructionalProposals/currentMeaningFindings for these IDs: none exists. All 11 have verified specific prior content deferrals; none is presumed defective merely because it was remaining. The On-Path Attack meaning is bounded introductory vocabulary and is preserved; its example alone changes. The existing buffer-overflow and ransomware examples already support their limited illustrations and are preserved. No previous full teaching qualification is revoked.

## Current text and proposed corrections

### 1. Buffer Overflow

Record: `flashcard:sy0701-acronym-application-software-attacks-buffer-overflow-buffer-overflow`. Parent: `deck:application-software-attacks`, ordinal 6 (zero-based). Current expansion: **Buffer Overflow**.

**Current meaning:** Too much data is written into memory, causing corruption or possible code execution.

**Current example:** A field built for 20 characters receives 2,000 characters and overwrites nearby memory.

**Verified prior hold:** The standalone definition says excessive data in memory without identifying writes beyond a buffer boundary. That can confuse memory exhaustion with overflow; the clearer adjacent-memory illustration is absent from the definition prompt.

**Offline replacement meaning:** Writing beyond the allocated boundary of a memory buffer, potentially corrupting adjacent memory, crashing a program or enabling code execution.

**Content/identity/placement boundary:** The authored adjacent-memory example is retained. Excessive allocation or memory exhaustion alone is not a buffer-boundary write; possible code execution is not guaranteed.

Source: `src/data/sy0701AcronymFlashcards.js:203`; raw `sha256:16b3bd6c9dafcc48a8f633d794bcd7ef4a840dbe484958e6a0a4cbcdbfbb564f`; published/catalogue `sha256:9d5a25c4a672c2474e7547e10bff010dc08a57ba35c7e023968b7daf7bc5b2ba`; candidate raw `sha256:266a9cc51505adaa38e32814a3f76275125838d109fbeb5eee1b1c300b952258`; candidate catalogue `sha256:9570b13549c73c36755e2ba869cb11bb3df58f6de4c51e7d9226de5cddcba077`; review `sha256:4bb3e538c4bb7c6c2935475015fa6afa446eab1d42cc19712362d7af14bda48a`. [Primary context](https://cwe.mitre.org/data/definitions/120.html). Existing hold retained, zero full teaching or canonical credit.

### 2. Race Condition

Record: `flashcard:sy0701-acronym-application-software-attacks-race-condition-time-of-check-time-of-use-race-condition`. Parent: `deck:application-software-attacks`, ordinal 9 (zero-based). Current expansion: **Time-of-Check / Time-of-Use Race Condition**.

**Current meaning:** Exploits timing gaps between a security check and the later action.

**Current example:** A withdraw button is triggered twice before the account balance update completes.

**Verified prior hold:** The term names general races, the expansion and definition narrow to a check/use gap, while the double-withdraw illustration supplies only concurrent action before an update. It leaves the checked state and later invalidated use unstated.

**Offline replacement meaning:** In the check/use race shown here, a resource is checked and then used after its state changes, invalidating the earlier check. This is one kind of race condition.

**Offline replacement example:** Two concurrent withdrawals each check that the same account has enough funds. The first reduces the balance before the second uses its stale check to withdraw.

**Content/identity/placement boundary:** The supplied expansion names TOCTOU while the broad label says Race Condition. The draft explicitly scopes this card to check/use; it does not make all races TOCTOU or approve a label/identity remapping. Concurrent requests alone are insufficient.

Source: `src/data/sy0701AcronymFlashcards.js:206`; raw `sha256:349106582f2a99442c3896676f3f796e828d4c5635d6c85adbe8d8f309b03491`; published/catalogue `sha256:632899030c6679af1d00bc90dd7d3f915546ac327e7317d1834d5f3904de600a`; candidate raw `sha256:b98d65f3f023156d1d8f1e8b36fcebe6b29f02e2838a81b88bf7a98f6b77b356`; candidate catalogue `sha256:ed601ed6b7b4e23e2accdaa142240140252f7ed738e9dbcc992710c05ad10fa6`; review `sha256:92c3e82a1d4bb421d68f83c82f18f2b701afe21935a89eafd86161b228f81375`. [Primary context](https://cwe.mitre.org/data/definitions/367.html). Existing hold retained, zero full teaching or canonical credit.

### 3. Ransomware

Record: `flashcard:sy0701-acronym-malware-attacks-ransomware-ransomware`. Parent: `deck:malware-attacks`, ordinal 0 (zero-based). Current expansion: **Ransomware**.

**Current meaning:** Malware that encrypts or blocks access to data until payment is demanded.

**Current example:** Office spreadsheets become encrypted and a message demands Bitcoin for the unlock key.

**Verified prior hold:** Hold the whole card: the standalone definition describes blocked access until payment is demanded, which can imply that making the demand ends the denial. The clearer encrypted-file/payment-demand example does not repair the definition delivered in every mode.

**Offline replacement meaning:** Malware that blocks access to files or systems, often by encryption, while attackers demand payment for restoration. Neither receiving a demand nor paying guarantees recovery.

**Content/identity/placement boundary:** Preserve the encrypted-spreadsheet/payment-demand example. The demand accompanies denial of access rather than ending it; this is vocabulary, not recovery guidance or a payment recommendation.

Source: `src/data/sy0701AcronymFlashcards.js:221`; raw `sha256:c69f69071d2d8d746e2939c322946e207d161bec5f5e5e39943079cef3695be8`; published/catalogue `sha256:67aa31ac627e2b88caba8cdde7199f7ba37f3f8312c86cd8883ea8fa46103ae6`; candidate raw `sha256:45f36756d122cd1b2a27a031f17364304145b0582aee7ab05ef676024060428c`; candidate catalogue `sha256:52f64f5d14d7e4ca8ae88f648ec642c21362cf5d0228039f571c3eac982079fd`; review `sha256:0d49e35fae1e52889792e90cc978ca50b03b8b9da048b32af2027b3e16930502`. [Primary context](https://www.ic3.gov/CrimeInfo/Ransomware). Existing hold retained, zero full teaching or canonical credit.

### 4. SRTP

Record: `flashcard:sy0701-acronym-network-architecture-protocols-srtp-secure-real-time-transport-protocol`. Parent: `deck:network-architecture-protocols`, ordinal 20 (zero-based). Current expansion: **Secure Real-Time Transport Protocol**.

**Current meaning:** Adds encryption and integrity protection to real-time voice or video traffic.

**Verified prior hold:** HOLD: the delivered definition asserts encryption and integrity without identifying a profile or enabled protections; the whole card leaves an unconditional guarantee ambiguous.

**Offline replacement meaning:** An RTP security extension supporting confidentiality, message authentication and replay protection. Actual protections depend on the selected profile, transforms, keys and configuration; null encryption does not hide media.

**Content/identity/placement boundary:** The historical RFC distinguishes null encryption and optional/weak SRTP authentication from SRTCP requirements. No cipher suite is recommended, no current deployment is inspected and no security guarantee follows from the name.

Source: `src/data/sy0701AcronymFlashcards.js:356`; raw `sha256:26699a3cd756639bf9f8cb3e4cbf806a11f47145b071d203f9df4d0a69cf0c0e`; published/catalogue `sha256:112f12c5f2243e5b137360c0558c57d993c44009e72a470fc80a436a7089c37c`; candidate raw `sha256:b377b3c819c5c997a4caeb29a92f14f8c58ff6d29261ed15dc0bff388a5740cc`; candidate catalogue `sha256:02a01768e313b1319e6ff6d80c725f0e8653816f6774438029cc12774a8c7679`; review `sha256:b16f25cabc764129eddf8259c4426d1913e039b22e521cbf73d19d820fcc4ab8`. [Primary context](https://www.rfc-editor.org/rfc/rfc3711.html). Existing hold retained, zero full teaching or canonical credit.

### 5. SSH

Record: `flashcard:sy0701-acronym-network-architecture-protocols-ssh-secure-shell`. Parent: `deck:network-architecture-protocols`, ordinal 21 (zero-based). Current expansion: **Secure Shell**.

**Current meaning:** Encrypted remote administration protocol, commonly used for command-line access.

**Verified prior hold:** HOLD: encrypted remote administration describes the intended common SSH use, but the unqualified delivered sentence leaves negotiated confidentiality as a categorical property.

**Offline replacement meaning:** Protocol commonly used for remote command-line administration over a transport with negotiated encryption and integrity protection. Confidentiality depends on the encryption actually in use; the historical none cipher provides none.

**Content/identity/placement boundary:** The historical none option is a counterexample to categorical confidentiality, not recommended configuration or evidence that common modern clients enable it. Host identity, algorithms, keys and authorization still matter.

Source: `src/data/sy0701AcronymFlashcards.js:357`; raw `sha256:5cda1c751675961587c98d8bb17352e32894de6b14cd9f8469d68c88cb5e87c3`; published/catalogue `sha256:42d94d9d9309d8763e4cf6361f9b3993194d3a3ed3a8b465d7835cbccbe53f75`; candidate raw `sha256:4dc57c62761ef976adec0845563df94af2f11face489cb5015ea53683fb00c7e`; candidate catalogue `sha256:af50f743600f07bec8c26bf04031ca83a15d81ecdf83b26f7b7dcc1378263696`; review `sha256:f13a9edaca7aefea30a43af3c7052376bcfa0ec166b1d34cdb3527648129333b`. [Primary context](https://www.rfc-editor.org/rfc/rfc4253.html). Existing hold retained, zero full teaching or canonical credit.

### 6. VPN

Record: `flashcard:sy0701-acronym-network-architecture-protocols-vpn-virtual-private-network`. Parent: `deck:network-architecture-protocols`, ordinal 26 (zero-based). Current expansion: **Virtual Private Network**.

**Current meaning:** Encrypted tunnel that protects traffic across an untrusted network.

**Verified prior hold:** HOLD: a generic VPN is defined as an encrypted protective tunnel, omitting legitimate VPN architectures without cryptographic privacy and the necessary secure-tunnel scope.

**Offline replacement meaning:** A logical private network carried over shared infrastructure. Secure remote-access or site-to-site VPNs commonly use encrypted tunnels, but the generic VPN label alone does not guarantee encryption.

**Content/identity/placement boundary:** Shared-infrastructure isolation is distinct from encryption. A secure-tunnel use case does not define every provider VPN, and a VPN does not establish endpoint trust or end-to-end safety.

Source: `src/data/sy0701AcronymFlashcards.js:362`; raw `sha256:ff4b97cadb8648d608e20b6656673f3962f1794ca08519a3c234c2ec15cfb100`; published/catalogue `sha256:ba9de88a25f5c00d13da887e62634ed17fa028792c53e1205e6d357af1b158e7`; candidate raw `sha256:58a92d44931656eee1b35e6e26575696283b62a2de2727a3a552b6140a5fd766`; candidate catalogue `sha256:849b92fc391dcabd718b2344b885157f7736fa813d14b987964f3f410b7a391c`; review `sha256:fe33eff37edb83135b81eeefd723baa39ae64036175ebbf94e7ee249f6fccdfe`. [Primary context](https://www.rfc-editor.org/rfc/rfc4110.html). Existing hold retained, zero full teaching or canonical credit.

### 7. Deauthentication

Record: `flashcard:sy0701-acronym-network-wireless-attacks-deauthentication-disassociation-deauthentication`. Parent: `deck:network-wireless-attacks`, ordinal 9 (zero-based). Current expansion: **Disassociation / Deauthentication**.

**Current meaning:** Forged wireless management frames force clients to disconnect from Wi-Fi.

**Current example:** Fake deauth frames kick a laptop off corporate Wi-Fi so it reconnects to an evil twin.

**Verified prior hold:** The bare term and combined disassociation/deauthentication expansion are defined only as forged frames forcing disconnects. Legitimate protocol transitions are conflated with attack traffic, and frame acceptance/protection is left unconditional.

**Offline replacement meaning:** In this attack context, forged deauthentication or disassociation frames attempt to terminate a Wi-Fi connection. These frames also have legitimate uses; negotiated management-frame protection can reject forgeries.

**Offline replacement example:** A client without negotiated protected management frames accepts forged deauthentication frames and disconnects. This alone does not establish that it joins an evil twin.

**Content/identity/placement boundary:** The attack deck and attack captions can describe the scoped forged-frame case, not every legitimate disconnect. Management-frame protection is contextual; disconnect does not prove evil-twin association or defeat all wireless attacks.

Source: `src/data/sy0701AcronymFlashcards.js:182`; raw `sha256:83d2c18f194ead49fe98aba8bad66569ba6b4296ee7c3715155278e9c5979cbb`; published/catalogue `sha256:5d1b036d29a94d03a47c072994ee14efcbf02b7bab9c555ee1ad18046bc0dd5b`; candidate raw `sha256:82672ae96366a8d997eb922b6c185d2bd0cf2f11bd1a7c945309d354614725cd`; candidate catalogue `sha256:cd49e828a78cf1ba3b51ca06d90be86fc43d5fe1705de76306bd5300f30f2a78`; review `sha256:14bf19e693b164a5c2962f05b2bfc1b99a530c0dd859aca56df57227133459e6`. [Primary context](https://www.cisco.com/c/en/us/support/docs/wireless-mobility/wireless-lan-wlan/212576-configure-802-11w-management-frame-prote.html). Existing hold retained, zero full teaching or canonical credit.

### 8. On-Path Attack

Record: `flashcard:sy0701-acronym-network-wireless-attacks-on-path-attack-on-path-attack`. Parent: `deck:network-wireless-attacks`, ordinal 5 (zero-based). Current expansion: **On-Path Attack**.

**Current meaning:** Attacker secretly intercepts or changes communication between two parties.

**Current example:** A coffee-shop Wi-Fi attacker reads unencrypted login traffic between a laptop and website.

**Verified prior hold:** The label requires an intervening communication position, but the coffee-shop example only supplies reading plaintext traffic. A passive receiver can read exposed wireless traffic without relaying or mediating it.

**Offline replacement example:** A malicious Wi-Fi gateway forwards traffic between a laptop and a website while reading the unencrypted login data passing through it.

**Content/identity/placement boundary:** The existing definition is preserved as bounded introductory attacker-interception vocabulary. Its original passive wireless-reading example is underdetermined; the proposed forwarding gateway establishes intervening position without claiming decryption of protected traffic.

Source: `src/data/sy0701AcronymFlashcards.js:178`; raw `sha256:a11c287f954300c82057afe06baa1ee9516f6e7991d288d6ed916c528599cd84`; published/catalogue `sha256:2c5fc5c750615d6ae939d0ed9b7e4c28fa541f50d5730301aa57f9bf499c46ae`; candidate raw `sha256:51f81851cfc1cded60f78f7b5f776811ed2a92bc3f9e95a0e074ae24e3d4fb1d`; candidate catalogue `sha256:d8e1f80d3040ff019796071727af0166ad2c9d012675804816b4a888153651b8`; review `sha256:928bd954a1ae6f7d433569fb74aff6947a6e6b1e405133bd68e6fc03ff9de856`. [Primary context](https://www.rfc-editor.org/rfc/rfc3552.html). Existing hold retained, zero full teaching or canonical credit.

### 9. RFID / NFC Cloning

Record: `flashcard:sy0701-acronym-network-wireless-attacks-rfid-nfc-cloning-rfid-nfc-tag-cloning`. Parent: `deck:network-wireless-attacks`, ordinal 10 (zero-based). Current expansion: **RFID / NFC Tag Cloning**.

**Current meaning:** Copies contactless identifiers to bypass physical access controls.

**Current example:** A hidden scanner copies an employee badge on the subway for later building access.

**Verified prior hold:** The combined label reduces contactless credential cloning to identifier copying and implies an access bypass without identifying a vulnerable credential/reader policy. Its subway scanning illustration supplies no tag, range or authentication context.

**Offline replacement meaning:** Replicating a contactless credential or its data to impersonate it. Copying a readable identifier bypasses access checks only where the reader relies on that identifier without effective additional authentication.

**Offline replacement example:** A badge system authorizes entry using only a readable static identifier. A copied identifier presented by an emulator is accepted because the reader performs no additional credential authentication.

**Content/identity/placement boundary:** This is a deliberately vulnerable identifier-only policy example, not a universal RFID/NFC result, radio-range claim or proof that an actual credential can be cloned. Authenticated credentials can require more than an identifier.

Source: `src/data/sy0701AcronymFlashcards.js:183`; raw `sha256:11db0751cb40f41e999f082c52cb28fe15e053c797ff172db309416b8d8a8aec`; published/catalogue `sha256:3a140125e6ebb27b95265001404aecc0d1ca7c3bcb4798c1906e7151c38a300d`; candidate raw `sha256:58113393857165635814150dad4073d28765b8e4ad5c600d27fb8b29adcbad74`; candidate catalogue `sha256:6656050ceec60a44c7b7d63cc19622d4c48167385f681275e9c4fa5b6392501b`; review `sha256:331aa324f60ed31c0251deddcae6a5587b87d36cbf4bbd7b92ab8cc026a87422`. [Primary context](https://www.nxp.com/docs/en/application-note/AN14223.pdf). Existing hold retained, zero full teaching or canonical credit.

### 10. Rainbow Table

Record: `flashcard:sy0701-acronym-password-credential-attacks-rainbow-table-rainbow-table-attack`. Parent: `deck:password-credential-attacks`, ordinal 4 (zero-based). Current expansion: **Rainbow Table Attack**.

**Current meaning:** Uses precomputed hash lookups to recover plaintext passwords from hashes.

**Current example:** A known MD5 hash is looked up and instantly revealed as the password 'password'.

**Verified prior hold:** Hold the whole card at zero credit: its definition describes generic precomputed hash lookup, and its instant MD5 lookup example supplies no rainbow-chain or time-memory distinction. The example cannot establish that the table is a rainbow table.

**Offline replacement meaning:** A precomputed password-hash time-memory trade-off using chains of hashing and position-dependent reduction functions. Stored chain endpoints guide recomputation of candidate passwords; a successful match must be checked against the target hash.

**Offline replacement example:** For a compatible unsalted hash, a rainbow table search reaches a stored chain endpoint. Recomputing that chain produces a candidate password, whose hash is checked against the target.

**Content/identity/placement boundary:** Generic stored hash lookup is not sufficient to identify a rainbow chain. The candidate supplies endpoint search and recomputation rather than instant guaranteed recovery. Compatible function/parameters and coverage matter.

Source: `src/data/sy0701AcronymFlashcards.js:247`; raw `sha256:8b734ee8b51d38ac1948e8cd4c348d6bcc52f73fb530a57d3552a999b9887fe1`; published/catalogue `sha256:e5f47f28bad4189cb0e5592d8644844535322d06434bca1892f9298ea29d4f21`; candidate raw `sha256:905f0358473dc46b7a3ea72795cf2d8390a26ae8c1e2c301044ee95896b33eb1`; candidate catalogue `sha256:1786a8e839bf8dd6d1f785b415b6caa720fdd15be90f40a23887cdaef65df512`; review `sha256:43d731ed5043c5973b671ecfca11b4d88f56fe733f9cc9c7bc05ca5075925b11`. [Primary context](https://www.cs.miami.edu/~burt/learning/Csc609.082/docs/crypto03.pdf). Existing hold retained, zero full teaching or canonical credit.

### 11. Compensating Control

Record: `flashcard:sy0701-term-chapter4-vulnerability-access-ops-compensating-control`. Parent: `deck:chapter4-vulnerability-access-ops`, ordinal 4 (zero-based). Current expansion: **Compensating Control**.

**Current meaning:** Alternative control used when the primary control, such as immediate patching, cannot be applied.

**Verified prior hold:** HOLD: the delivered alternative-when-primary-unavailable definition omits comparable protective effectiveness and could treat any available substitute as compensation.

**Offline replacement meaning:** An alternative safeguard used in place of a required or recommended control when it cannot be applied, providing equivalent or comparable protection for the relevant security requirement.

**Content/identity/placement boundary:** Substitution alone is not compensation. Comparable protection must be justified against the relevant requirement; no real deployment, patch exception, compliance approval or effectiveness measurement is established.

Source: `src/data/sy0701AcronymFlashcards.js:603`; raw `sha256:a81dd9a356a4749b5ae02d1bb15572f84048f6f18cbbea8b7c9aa6b190cb0434`; published/catalogue `sha256:3d1f93e707419d2488c507569a3eed0260cca85f0d8e89311973d92b0581e8fd`; candidate raw `sha256:59cd5829f24780692102d0f0ab1948f89949526a36b2630d973fff64a4cd10f9`; candidate catalogue `sha256:fe5746367e566346a650d672358b38df7091b2543935f0d7784a78b703abe3bb`; review `sha256:11d5ffecf8f7c0adc2689984c2d4cfaa1bf05244e0ffa85a0c05c56d73fc0574`. [Primary context](https://csrc.nist.gov/glossary/term/compensating_security_control). Existing hold retained, zero full teaching or canonical credit.

## Identity and placement

All 11 labels, expansions, authored card types, parent membership, topics, chapter/objective metadata and source support identities are unchanged in the review projection. The actual source factory reproduces all 11 candidate raw objects with **unchanged IDs**, including the term factory for Compensating Control. This is compatibility evidence only: no canonical identity, precise objective, role, difficulty, skill, teaching link, family, trusted revision, human approval or publication is granted.

The broad Race Condition label and specific TOCTOU expansion remain distinct scopes. Its candidate explicitly teaches only the check/use subtype; general race coverage and any future title/remapping decision stay unresolved. Deauthentication/disassociation are legitimate protocol actions as well as attacker-abused frames; the attack deck and unchanged attack captions apply only to the explicitly forged-frame candidate. Rainbow Table names a precomputed structure while the expansion names its use in an attack; the chain description does not turn every precomputed lookup into a rainbow table. The glossary lexical matches remain separate, with current signatures and holds; plain card faces do not render glossary tooltips or inherit glossary approval.

Parent context records bind current titles, descriptions, metadata, complete membership, prior qualified references and any current holds. Existing parent qualifications are carried without transferring them to these children; six parents do not become six newly qualified teaching units. The packet also binds each child's raw fields, exact source line, flattened catalogue revision and prior disposition revision.

## Source delivery and related lessons

The pinned existing source face/mode helpers and factories are reused. **44 mode comparisons and 58 static face/text-node renders pass (29 current and 29 candidates)**. Each side projects definition/acronym requests for all 11 plus seven authored example requests. Existing mode fallback, term behavior and the label-versus-expansion test are retained; label inequality is not a semantic certification of an acronym. Attack caption expressions are bound for all seven example cards: Guess the full attack name / Full attack name. No new caption or placement approval follows.

Two original example fronts remain unchanged; five have explicit offline replacements. Five focused delivery counterexamples show that changing only a meaning leaves the old underdetermined example on the actual example-mode front, while each proposed example replacement reaches that front. The same buffer-overflow/ransomware examples are not independent evidence, and the five reviewer-authored examples are not executed attacks or measured learner outcomes. One hostile synthetic markup/ampersand/quote escaping check passes. The checks execute existing pure source expressions and React static text nodes, not the full interactive component, browser, keyboard, screen reader, storage or learner handlers. Context notes stay offline and are not automatically delivered; any essential qualification is included in candidate face text.

The actual related-lesson selector runs on six current parents and six candidate parents containing only these 11 card changes. All unselected children remain exact current objects. **3/6 ordered target lists change.** These are source text/chapter/objective similarity observations, not teaching-link, entitlement or routing approval. Current and candidate lesson targets pin current revisions and any holds.

| Parent | Current ordered targets | Candidate ordered targets | Changed |
|---|---|---|---|
| deck:application-software-attacks | lesson:secure-software-applications, lesson:api-session-browser-security, lesson:software-memory-concurrency | lesson:secure-software-applications, lesson:software-memory-concurrency, lesson:api-session-browser-security | true |
| deck:malware-attacks | lesson:malware-indicators-attacks, lesson:api-session-browser-security, lesson:threat-actors-surfaces | lesson:malware-indicators-attacks, lesson:api-session-browser-security, lesson:threat-actors-surfaces | false |
| deck:network-architecture-protocols | lesson:network-protocols-ports, lesson:dns-time-management-security, lesson:enterprise-network-segmentation | lesson:network-protocols-ports, lesson:ipsec-secure-media, lesson:dns-time-management-security | true |
| deck:network-wireless-attacks | lesson:dns-time-management-security, lesson:wifi-access-defense, lesson:web-social-dns-attacks | lesson:wifi-access-defense, lesson:network-defense-architecture, lesson:web-social-dns-attacks | true |
| deck:password-credential-attacks | lesson:api-session-browser-security, lesson:malware-indicators-attacks, lesson:web-social-dns-attacks | lesson:api-session-browser-security, lesson:malware-indicators-attacks, lesson:web-social-dns-attacks | false |
| deck:chapter4-vulnerability-access-ops | lesson:security-operations-automation, lesson:identity-zero-trust, lesson:incident-response-monitoring | lesson:security-operations-automation, lesson:identity-zero-trust, lesson:incident-response-monitoring | false |

Guest/free native study, the account/Pro gate on the related-lesson action, saved/native-ID lookup precedence, self-rating/Again completion and the default-off/unwired specimen retain their prior limits. Name recall, navigation, exposure or a text match establishes no mastery, personalization or benefit.

## Primary reference limits

- [Primary source](https://cwe.mitre.org/data/definitions/120.html): Classic buffer-boundary write and potential consequences, not every memory error.
- [Primary source](https://cwe.mitre.org/data/definitions/367.html): Checked resource state can change before use; concurrent withdrawal is a reviewer-authored illustration.
- [Primary source](https://www.ic3.gov/CrimeInfo/Ransomware): Access denial and ransom demand; payment does not guarantee recovery. CISA guide body retrieval failed; no recovery workflow adopted.
- [Primary source](https://www.rfc-editor.org/rfc/rfc3711.html): Historical SRTP sections4.1.3,9.5: null encryption and weak/null SRTP authentication distinctions; not a current algorithm recommendation.
- [Primary source](https://www.rfc-editor.org/rfc/rfc4253.html): Historical section6.3 none option supplies no encryption and is not recommended; no assertion about installed clients.
- [Primary source](https://www.rfc-editor.org/rfc/rfc4110.html): Sections1.2 and6.5 distinguish shared VPN infrastructure and optional encryption; not a deployment security assessment.
- [Primary source](https://www.cisco.com/c/en/us/support/docs/wireless-mobility/wireless-lan-wlan/212576-configure-802-11w-management-frame-prote.html): Implementation-specific PMF description protects deauthentication/disassociation frames; no universal attack-prevention guarantee.
- [Primary source](https://www.rfc-editor.org/rfc/rfc3552.html): Section3.5 distinguishes attacker position from mere passive reading; gateway example is an explicit reviewer construction.
- [Primary source](https://www.nxp.com/docs/en/application-note/AN14223.pdf): UID-only authorization versus added credential authentication in a scoped EV-charging example; badge case is a reviewer analogy, not a universal contactless exploit.
- [Primary source](https://www.cs.miami.edu/~burt/learning/Csc609.082/docs/crypto03.pdf): Oechslin author-paper copy, sections1.1 and3: endpoint storage/reconstruction and position-dependent reductions; no historical performance transferred to current systems.
- [Primary source](https://csrc.nist.gov/glossary/term/compensating_security_control): Equivalent or comparable protection in the cited NIST baseline-control context; no real compliance determination.

Only targeted primary passages were inspected; historical RFC counterexamples are not newest-algorithm or installed-client guidance. CISA guide/news body retrieval failed; the retrieved IC3 page supplies ransomware context. EPFL-hosted PDFs were unavailable; the university-hosted Oechslin author-paper copy supplied sections1.1 and3 on chains and reconstruction. No full-paper review, historical benchmark transfer or measured recovery claim. The NXP example concerns a specific UID-only EV-charging policy; the badge illustration is an explicit reviewer analogy. No universal radio range, device cloning, credential bypass, Wi-Fi protection or effectiveness guarantee is made.

## Reconciliation and gates

| Measure | New credit | Current / total | Remaining |
|---|---:|---:|---:|
| Catalogue dispositions |0|1694 /1878|184|
| Support teaching |0|748 /834|86|
| Flashcard teaching |0|271 /313|42|
| Deck dispositions |0|14 /29|15|
| Glossary definitions |0|150 /162|12|
| Bank questions |0|463 /483|20|
| Bank feedback |0|464 /483|19|
| Bank complete pairs |0|456 /483|27|

All 42 remaining flashcards now have bounded offline text reviews across the 16+15+11 slices. They remain **42 unqualified current teaching records**; this does not mean the phase or activation is complete. Across those slices, 37 cards have proposed corrections and five preserve their entire current text; this slice additionally preserves the On-Path meaning while changing its example. No candidate has been published.

All181 holds remain unresolved: these11 are substantively inspected here, the other170 are carried. Remaining184 catalogue identities are180 held plus4 unheld private identities; carried pbq:p036 lies outside that set. Prior credit is reconstructed from138 packets; instructional rows stay786 raw,772 distinct,14 repeats. The audit verifies752 inherited field bindings,31 immediate baseline fields,425 source bindings and25 protected release hashes. Bank/starter/guest/page/selector/objective/census references, mapping package, ledger, native-v1/v2 and private source choices remain pinned. No duplicate catalogue census or private payload.

The focused guard rejects **1233 mutated packets** covering selection/order, source/parent/factory pins, changed candidate fields or generic rehashed drafts, missing context, wrong faces/modes/examples, unsupported links, erased holds, false approvals/credit and unsafe exports. It preserves a manually reviewed result; equality alone does not establish complete semantics or learner benefit.

Required gates: deterministic write/recheck, all29 mapping tests and deterministic package reproduction, git diff --check, source/protected pins, [skip deploy] exit0/control1, exactly this packet/report/audit committed and pushed, remote ref and exact-byte verification, empty index and eight unrelated dirty entries untouched. No runtime/source data, database/private compilation, browser/live/account/storage/analytics, deployment, automation or Phase3 work. **NOT READY for activation.**
