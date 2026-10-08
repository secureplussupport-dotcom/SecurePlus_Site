# Phase 2B-5 — objective 1.4 crypto glossary review

Offline agent dispositions only; **NOT READY** for owner approval, publication, activation, migration or deployment. Baseline **8ed7674042fb7cd545f53db0376947ca3901ef52**; packet SHA-256 **6ff229373bb6f6f98acf4a4907d4541183e49e61a6089da24aa53addd67c91ce**. Only this packet, report and focused audit change.

## Exact selected boundary and definitions

Exactly eight IDs from the prior packet's **31 remaining IDs**: **glossary:aes,glossary:cbc,glossary:gcm,glossary:fde,glossary:hashing,glossary:hmac,glossary:md5,glossary:rsa**. No question, paired feedback, lesson, deck/card, related destination or other glossary definition receives a new disposition. All **29 prior packets** and applicable source/report/audit hashes are verified. Only disposition arrays count.

Seven definitions are object entries in **ACRONYM_GLOSSARY_TERMS**; **Hashing** is a string added by **GLOSSARY_TERMS** after its acronym spread. The actual getEntry function returns object fullName/definition fields; a string without a colon produces an empty fullName and the original string as definition. Each row binds its exact source line, authored literal, term-plus-definition revision, separate definition revision and rendered entry/name/body hashes. No fallback or repairing glossary entry is substituted.

| ID | Exact current tooltip definition | Shape/source line |
| --- | --- | --- |
| glossary:aes | Symmetric block cipher using 128, 192, or 256-bit keys for storage and transit encryption. | object;src/App.jsx:2239 |
| glossary:cbc | Block cipher mode where each plaintext block is combined with the previous ciphertext block. | object;src/App.jsx:2259 |
| glossary:gcm | Efficient symmetric encryption mode that provides confidentiality and integrity. | object;src/App.jsx:2295 |
| glossary:fde | Encryption of an entire storage drive to protect data at rest. | object;src/App.jsx:2291 |
| glossary:hashing | A one-way transformation used to verify integrity or store passwords safely when done with salts and slow algorithms. | string;src/App.jsx:2400 |
| glossary:hmac | Integrity and authenticity mechanism combining a hash function with a shared secret key. | object;src/App.jsx:2301 |
| glossary:md5 | Legacy 128-bit hash algorithm now considered broken due to collision weaknesses. | object;src/App.jsx:2317 |
| glossary:rsa | Classic public-key cryptographic algorithm based on factoring large prime numbers. | object;src/App.jsx:2357 |

Object full names remain **Advanced Encryption Standard;Cipher Block Chaining;Galois/Counter Mode;Full Disk Encryption;Hash-based Message Authentication Code;Message Digest 5;Rivest, Shamir, and Adleman**. Hashing has no rendered full name. These are verified current-source facts, not approved corrected teaching.

## Complete local dispositions

| Record | Scope/concept proposal | Teaching and qualification hold |
| --- | --- | --- |
| glossary:aes | 1.4 narrow vocabulary support;weight0 | Recognize AES as a symmetric block cipher with 128/192/256-bit key variants; a primitive rather than a complete storage or transport protection design. HOLD automatic secure storage/transit and key-size-as-block-size interpretations. Every AES variant has a 128-bit block; 128/192/256 are key lengths. Mode, IV/nonce handling, authentication, key custody and implementation determine the resulting protection. AES-256 is not a 256-bit block, unconditional faster encryption or proof that AES-128 is broken. Preserve generic AES versus compound AES/AES-256 card identities; no cipher was run. |
| glossary:cbc | 1.4 narrow vocabulary support;weight0 | Recognize CBC as a chaining confidentiality mode; the first block uses an IV and subsequent blocks use the previous ciphertext block. HOLD every-block shortcut: first plaintext block is XORed with an unpredictable CBC IV, then later blocks with preceding ciphertext before encryption. Suitable padding or another defined length-handling convention is needed where applicable; CBC alone has no message authentication. IV integrity, error handling and safely composed authentication matter; no blanket IV secrecy claim, AEAD equivalence or tested padding-oracle safety. |
| glossary:gcm | 1.4 narrow vocabulary support;weight0 | Recognize GCM as authenticated encryption with selected associated-data authentication, subject to key, nonce and tag-validation requirements. HOLD unconditional provides and efficient claims. Nonces/IVs must satisfy uniqueness requirements for a given key; reuse can undermine confidentiality and authentication. Validate the tag before accepting authenticated plaintext; tag length, usage limits and failed-verification handling affect forgery risk. Associated data is authenticated, not encrypted. GCM naming alone proves neither replay protection, signer attribution nor suitability as ordinary disk-sector encryption. |
| glossary:fde | 1.4 narrow vocabulary support;weight0 | Recognize FDE as protection of encrypted storage data against offline access when unlock and recovery keys remain protected. HOLD literal entire-drive guarantee: encrypted-volume scope and boot/metadata exceptions depend on implementation. Protect unlock/recovery keys and configured storage coverage; an unlocked session or compromised endpoint may expose plaintext. FDE is not transport encryption, per-file access policy, malware prevention, backup protection or data-loss prevention. Preserve distinction from EFS/FDE compound card; no disk, key or endpoint was inspected. |
| glossary:hashing | 1.4 narrow vocabulary support;weight0 | Recognize cryptographic hashing as a digest transformation; distinguish trusted-reference integrity, keyed authentication and purpose-built password hashing. HOLD safely from salts and slow algorithms alone: use a suitable password-hashing scheme with unique salts and an appropriate cost/security policy. Salts inhibit precomputation, not all guessing. A fast digest alone is not a password KDF; matching an untrusted digest does not authenticate source or prove harmless content. Hashing is not encryption, HMAC or a digital signature; one-way is computational resistance rather than impossible guessing or reversal. |
| glossary:hmac | 1.4 narrow vocabulary support;weight0 | Recognize HMAC as a specified keyed-hash message-authentication construction whose shared secret is used for generation and verification. HOLD authenticity as unique-person attribution or non-repudiation: any authorized shared-key holder can generate a valid tag. Use the actual HMAC construction, a suitable hash, protected sufficiently strong keys and appropriate tag validation; arbitrary key-plus-hash concatenation is not HMAC. It does not encrypt, supply freshness/replay defense by itself, or merge into MAC access-control/address senses. No message/tag operation or provisioning was performed. |
| glossary:md5 | 1.4 narrow vocabulary support;weight0 | Recognize MD5 as a legacy 128-bit-output hash with practical collision weaknesses; collision attacks and password guessing are different problems. HOLD broken as arbitrary preimage recovery, every HMAC failure or instant password recovery. Collision resistance is unsuitable for new collision-dependent security designs; unsalted fast password hashing also permits economical guessing/precomputation for a separate reason. Salting MD5 does not repair collisions or make it a suitable modern password scheme. Migration needs use-specific replacement, compatibility and stored-verifier/key lifecycle planning; no migration was executed. |
| glossary:rsa | RSA precise scope/link withheld;1.4 context;weight0 | Recognize the RSA family name only; hold the published factoring-large-prime-numbers explanation pending correction to the composite-modulus problem and separately specified schemes. HOLD mathematical wording: prime numbers are not the composite RSA modulus being factored. Factoring the modulus exposes its factors; do not assert every RSA inversion is proven equivalent to factoring. RSA encryption and signatures use separate encodings/schemes and roles: recipient public/private encryption-decryption, signer private/public signing-verification. Private-key encryption is not a general signature description; key trust, size, custody and scheme separation remain required. RSA naming does not imply PFS or quantum resistance; no operation was executed. |

[CompTIA SY0-701 v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) names symmetric/asymmetric encryption, key length, full-disk encryption, hashing and key stretching in1.4. **CBC/GCM/HMAC** are conservatively inferred mode/construction support, not named-bullet or whole-objective assessment. MD5 keeps **2.4 context only**. Broad observed objective tags are unions of source references, not reviewed scope. Seven existing supporting nodes receive pending weight0 links; **RSA's link is withheld** because its current definition misstates the factoring problem. No new canonical identity or assessed primary is proposed.

## Primary-source semantic limits

[FIPS197](https://csrc.nist.gov/pubs/fips/197/final) separates AES key lengths from its fixed128-bit block. AES is the underlying cipher; its name or larger key does not establish a complete authenticated storage/transport design. Generic AES glossary and compound AES/AES-256 card identities stay distinct.

[NIST SP800-38A §§5.3,6.2 and Appendices A,C](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf) defines CBC's first-block IV, later-block chaining and confidentiality role. CBC IVs must be unpredictable; padding/length conventions and authenticated composition need separate care. The published every-block wording omits the first-block case. No encryption, padding or oracle-safety test ran.

[NIST SP800-38D §§5.2,7.2,8 and Appendices A–D](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf) requires IV uniqueness under a key and authentication-tag validation, with length/use limits and separate replay considerations. GCM confidentiality/integrity claims depend on those conditions. Associated data is authenticated, not encrypted. The efficient label was not benchmarked; no deployment, tag or nonce handling was verified.

[NIST SP800-111 §§3.1.1,3.2](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-111.pdf) describes storage scope, boot/pre-boot behavior and plaintext access after authentication. At-rest encryption does not stop malware using an unlocked endpoint or protect other copies/transport. Entire-drive is qualified by configured coverage and implementation exceptions; the prior removed-drive/key-protection questions explicitly avoid requiring every boot-metadata byte to be encrypted.

[NIST hash-function properties](https://csrc.nist.gov/projects/hash-functions) distinguish collision, preimage and second-preimage resistance. An unkeyed digest supplies no trusted origin by itself. [NIST SP800-63B-4 §3.1.1.2](https://pages.nist.gov/800-63-4/sp800-63b.html) specifies a suitable salted password-hashing scheme with a cost factor to make each guess expensive. The glossary's safely phrase requires those scheme/parameter/policy premises; salt and slowness alone do not establish comprehensive password security.

[RFC2104 §§1–3](https://www.rfc-editor.org/rfc/rfc2104.html) defines HMAC's construction and shared generation/verification secret. Arbitrary concatenation is not that construction; any holder can generate tags, so validity does not establish unique-person attribution or non-repudiation. Encryption and replay/freshness are separate. Its historical algorithm examples are not new-design approval; the MAC address/access-control glossary collision remains outside this slice.

[RFC6151 §2](https://www.rfc-editor.org/rfc/rfc6151.html) addresses MD5 collision-dependent uses separately from HMAC-MD5. It does not support a universal all-HMAC-break inference or a current migration approval. Prior password/table teaching addresses guessing economics, not collision recovery. Salting MD5 fixes neither its collision weakness nor suitability as a modern password scheme; no stored verifier, migration or compatibility test ran.

[RFC8017 §§3,6–8](https://www.rfc-editor.org/rfc/rfc8017.html) defines the composite modulus as a product of primes and separates encryption/decryption and signing/verification schemes. The source's **factoring large prime numbers** wording is wrong. Public-key encryption and private-key signing have distinct encodings, key roles and trust premises; generic private-key encryption is not an adequate signature description. The RFC recommends scheme separation for new use. Keep precise RSA linking held pending an explicit content correction, without modifying the earlier qualified RSA-card disposition.

## Actual renderer and trigger boundary

Source-only verification, no browser-open or entitlement test. The matcher is **case-insensitive, longest-first, ASCII-alphanumeric-boundary-based**, separately within inline formatting segments. Actual pure parser/matcher/getEntry/split expressions run in memory. **AES-256/AES-GCM** can trigger AES/GCM; **HMAC-SHA256** triggers HMAC without automatically triggering MAC. Entire bold/underline/highlight terms match. **MD5sum,CBCx,hashingx**, and inflected **hashes/hashed/hash** do not. A format split inside **HA** + bold **SH** + **ING** does not create one Hashing token.

Synthetic **We are hashing out a launch plan** does trigger Hashing despite having ordinary-word meaning. No hashing-out phrase was found in the checked local MCQ/PBQ/lesson prose, so this is a matcher vulnerability probe, not fabricated observed exposure. The renderer has no semantic-context disambiguation. It neither recursively applies GlossaryText inside the tooltip nor automatically repairs card faces or plain lesson-check/comparison text.

Terms render as focusable spans with role button, aria-expanded, click/Enter/Space toggles and outside-pointer close. Opening requires interaction after the matching prose is rendered; there is no hover-only open path or independent glossary Pro/account gate. The parent content's access/reveal rules still apply. Accessibility/native interaction in a real browser remains unverified.

Eight exact source-rendered probes are bound:

| Definition | Parent | Rendered field/gate |
| --- | --- | --- |
| AES | mcq:m008 | options;selected_unsubmitted_question_and_rendered_options |
| CBC | mcq:m212 | options;selected_unsubmitted_question_and_rendered_options |
| GCM | mcq:m212 | options;selected_unsubmitted_question_and_rendered_options |
| FDE | mcq:m075 | options;selected_unsubmitted_question_and_rendered_options |
| Hashing | mcq:m004 | stem;selected_question_and_rendered_stem |
| HMAC | mcq:m212 | options;selected_unsubmitted_question_and_rendered_options |
| MD5 | mcq:m042 | stem;selected_question_and_rendered_stem |
| RSA | mcq:m106 | stem;selected_question_and_rendered_stem |

Normal practice stems use splitQuestionStem and GlossaryText for context/question; options render before submission. After submission, options and selected wrong feedback are inside disabled option buttons, so nested tooltip interaction cannot be claimed from source alone. Detailed explanation and selected wrong-option feedback require **Pro** in this practice path. Definitions add support, not assessment/grading/recovery. Usage references are not proof that these exact surfaces were selected or tooltips opened.

Four prior lesson-body probes bind real sentence splitting: **AES** in the modes section's first visible sentence; **CBC** in its collapsed supporting detail; **GCM** in the next paragraph's first sentence; **Hashing** in the keys lesson's first sentence. These crypto lessons require Pro and the selected section; CBC's rest requires opening supporting detail. The approved all-Domain1-free access gap remains held. Lesson aliases, comparison labels, plain check reveals and flashcard faces are excluded as tooltip proof.

## Prior overlap and conflicts

AES repeats **m035** key-vs-block-size feedback, m104/m212 and the modes lesson. CBC/GCM compare with **m212**, paired feedback, **p049** and the modes lesson; their short definitions omit the earlier IV/padding/authentication and nonce/tag premises. FDE compares with **m075,m159** and feedback's offline protected-key, unlocked-session and metadata limits. The unreviewed compound **EFS/FDE** card and source p079 reference are inspection-only, not new dispositions or a generic FDE identity merge.

Hashing compares with prior **m004,m039,m042,m103,m656,m403,m207**, paired feedback, **p005,p002,p057**, keys/modes sections and SHA vocabulary. Preserve KDF, trusted-reference, signature, collision/preimage and canned-terminal-output boundaries. The tooltip is a repeated shortcut, not proof of safe file or password processing.

HMAC compares with **m103,m656,m210,m212**, paired feedback, primitive teaching and its prior card; shared-key authenticity does not prove an individual signer, encryption or canonical MAC-sense union. MD5 compares with **m042,m116,m207**, their feedback and the already reviewed Collision/Birthday cards. No MD5 collision, preimage/password recovery or migration was executed.

RSA compares with **m106,m206,m210**, paired feedback, **p049,p224**, the modes lesson and prior RSA card. The glossary's mathematical error does not override the earlier scheme/key-role/forward-secrecy qualifications. AES and FDE compound cards remain separate supporting candidates; three already dispositioned crypto cards are references, while the EFS/FDE card remains unreviewed here. Every prior question/PBQ comparison also binds paired feedback. Usage inventories and all prior surfaces add zero dispositions, families or evidence.

## Exact census and checks

**235 candidates:204 prior +8 new =212 distinct pending dispositions;23 remain**, all glossary definitions. Exact remaining IDs, in catalogue order:

- glossary:ah
- glossary:bios
- glossary:ca
- glossary:crl
- glossary:csr
- glossary:dh
- glossary:dhe
- glossary:dkim
- glossary:dmarc
- glossary:dnssec
- glossary:ecc
- glossary:hsm
- glossary:ipsec
- glossary:mitm
- glossary:ngfw
- glossary:nips
- glossary:ocsp
- glossary:pem
- glossary:pfs
- glossary:s%2Fmime
- glossary:san
- glossary:tokenization
- glossary:tpm

Global package remains **1878 records/435 identities** (5 mastery/28 topic/402 support), **2954 queue rows**, **489 unresolved questions**, **7 existing primary proposals**. New approved mappings, canonical identities, primary mastery, weights, independent families and eligible evidence stay **zero**. All earlier canonical/CIA/MAC/RBAC/TOU/MTTR/MTBF/FAR/MOA/MOU and crypto/keys/modes/PKI/algorithm/exchange/attack holds remain unchanged. Private p017 stays **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, trusted null, payload unavailable/unreviewed; no fresh read or fallback substitute.

Run `node scripts/audit-objective14-crypto-glossary.mjs` and `npm run audit:content-mapping`. Focused deterministic verification binds exact definitions/rendered entries, authored and renderer units, selected31-to23 census, prior source revisions, usage references, eight MCQ and four lesson-body exposure probes and synthetic ordinary/format/token boundaries. Negative cases reject stale source/entry/location/parent, unsupported fields, false browser exposure, inherited scope, compound/MAC/RSA-error link promotion, expanded claims, deleted qualifications and trusted/mastery/family/approval credit. Exact package/bank and all **25 active release hashes** are unchanged. No active package/runtime/browser/database/learner/live/shadow/cohort/deploy/migration/Phase3 change. Task-only **[skip deploy]** push; Phase2B-5 remains **NOT READY**.
