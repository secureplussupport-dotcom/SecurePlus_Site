# Phase 2B-5 — objective 1.4 algorithm and TPM cards review

Offline agent dispositions only; **NOT READY** for owner approval, publication, activation, migration or deployment. Baseline **3e704aa4e931a88b365aaf8d4e26a81d903c1b3e**; packet SHA-256 **a51fdc4514d4307cd161b5d9fa0984ff767e7e01ae7a5bc3aecb4efe49606120**. Only this packet, report and focused audit change.

## Selection and exact revision boundary

Exactly eight cards from the previous packet's **51 remaining IDs**: **AES / AES-256,DES,ECC,HMAC,RC4,RSA,SHA,TPM**, in authored order at indexes **0,5,7,10,19,20,22,23**. The **crypto-keys-pki** container and eight prior CA/CRL/CSR/HSM/OCSP/PKI/RA/SCEP card dispositions are references only and are not recounted. Eight other crypto cards, the attack deck/three attack cards and all glossary candidates receive no new dispositions. No content edit is proposed as already approved.

The packet binds card literal lines, parent membership/order, flattened catalogue revisions, raw cards actually passed to the lab, each acronym/expansion/meaning revision and both rendered face outputs. The raw and flattened signatures differ because catalogue records add metadata. Pure probes confirm exact front/back/reveal text; no remote overlay, browser session, learner instance or stored deck was read. All prior 26 packets and their applicable source/report/audit hashes are bound. Master-plan product requirements and Phase 1 current-state evidence remain separated; the known free-Domain1 lesson access gap is preserved without behavior changes.

[CompTIA SY0-701 v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) supplies objective-1.4 encryption/key-length, hashing and TPM context plus algorithm-name acronym entries. Proposed links support narrow vocabulary within those subjects, not every branch of 1.4, protocol implementation, assessed key-role decisions or complete algorithm selection. Inherited **1.4/3.1** tags stay observed metadata; 3.1 is not promoted as precise scope. The official-list badge and reviewedAt date do not approve definitions.

## Complete selected dispositions

| Record | Proposed scope | Teaching and hold |
| --- | --- | --- |
| flashcard:sy0701-acronym-crypto-keys-pki-aes-aes-256-advanced-encryption-standard | 1.4 vocabulary support; weight 0 | Recognize AES as symmetric encryption and AES-256 as its 256-bit-key variant; this is algorithm/key-size vocabulary, not a complete secure construction. HOLD stronger protection as a universal deployment claim: larger keyspace is not proof that AES-128 is practically broken, nor a larger AES block. AES-128/192/256 all use 128-bit blocks; mode, nonce/IV, authentication and key custody remain separate. Preserve compound sy0701.term.aes-aes-256 separately from generic sy0701.term.aes; no identity union or quantum-safe inference. |
| flashcard:sy0701-acronym-crypto-keys-pki-des-data-encryption-standard | 1.4 vocabulary support; weight 0 | Recognize DES as legacy insecure symmetric encryption, not a suitable modern protection choice. Retain legacy/insecure recognition only. DES withdrawal does not establish instant recovery of every ciphertext, nor reapprove distinct TDEA/3DES. No implementation, key search, migration plan or adversary capability is assessed. |
| flashcard:sy0701-acronym-crypto-keys-pki-ecc-elliptic-curve-cryptography | 1.4 vocabulary support; weight 0 | Recognize ECC as an asymmetric algorithm family with smaller keys than RSA at comparable classical security strengths under suitable parameters. HOLD an unqualified strong-security or always-faster comparison: compare matched classical security strength, not equal raw key-bit numbers; curve, scheme, parameters, implementation and target hardware matter. ECC is not a single encryption primitive and the card does not teach ECDH versus ECDSA, authentication, forward secrecy or post-quantum safety. |
| flashcard:sy0701-acronym-crypto-keys-pki-hmac-hash-based-message-authentication-code | 1.4 vocabulary support; weight 0 | Recognize HMAC as keyed-hash message authentication using a shared secret, supporting integrity and secret-key-holder authenticity. HOLD authenticity as unique-signer attribution or non-repudiation: every shared-secret holder can generate a tag. HMAC is neither encryption nor an unkeyed digest nor a public-key signature; safe key/algorithm/tag/protocol handling is not taught. Preserve the existing overloaded MAC hold; do not merge Media Access Control or Mandatory Access Control. |
| flashcard:sy0701-acronym-crypto-keys-pki-rc4-rivest-cipher-4 | 1.4 vocabulary support; weight 0 | Recognize RC4 as a legacy stream cipher unsuitable for modern secure designs; protocol migration and attack execution are not taught. Retain avoidance of this legacy stream cipher. RFC 7465 explicitly prohibits RC4 negotiation in TLS; this is not an assertion that every old RC4 ciphertext is instantly recoverable or a tested TLS migration. Larger keys do not cure keystream biases; no learner attack or deployment was executed. |
| flashcard:sy0701-acronym-crypto-keys-pki-rsa-rivest-shamir-adleman | 1.4 vocabulary support; weight 0 | Recognize RSA as an asymmetric cryptosystem supporting distinct encryption and signature schemes, not an interchangeable operation. Retain two distinct uses only. Secure schemes/encoding, appropriate parameters, trusted key binding and operation-specific roles are required; signing is not generic private-key encryption. Encryption uses recipient public key and corresponding private-key decryption; signature generation/verification has separate semantics. The same RSA key pair across schemes is not automatically safe, and RSA naming gives no forward-secrecy or post-quantum guarantee. |
| flashcard:sy0701-acronym-crypto-keys-pki-sha-secure-hash-algorithm | 1.4 vocabulary support; weight 0 | Recognize SHA as hash-family vocabulary producing algorithm-specific digests for comparison, not encryption or automatic origin authentication. HOLD integrity checks without a trusted reference or authenticated construction: an attacker can replace both message and untrusted digest. Output length is per chosen hash, not identical across all SHA variants; SHA naming does not approve SHA-1 collision use. Distinguish collision, preimage and second-preimage properties; no password work cost/salt/KDF, sender authentication, safety verdict or hash implementation is assessed. SHA stays distinct from hashing/SHA-1/SHA-256 identities. |
| flashcard:sy0701-acronym-crypto-keys-pki-tpm-trusted-platform-module | 1.4 vocabulary support; weight 0 | Recognize TPM platform key protection and measurement support; this is a platform-module role, not proven device integrity or a fleet HSM. HOLD hardware chip as requiring a discrete chip: TPM 2.0 can be discrete, integrated or firmware based. Key residency, authorization and export/duplication limits depend on object policy/attributes and integration; not every key is non-exportable. Measured Boot records evidence for a verifier; it is distinct from Secure Boot enforcement and does not alone prove a malware-free endpoint. TPM and HSM remain distinct roles; no physical device, attestation, custody or cryptographic operation was tested. |

All eight use their existing supporting identities only. The compound **sy0701.term.aes-aes-256** remains distinct from generic **sy0701.term.aes**; **sy0701.term.sha** remains distinct from hashing or individual hash variants. No overloaded MAC union, TPM/HSM union, recovery-primary substitute or new canonical node is introduced. Acronym/meaning reversal, repeated reveal, shuffle, saved/stars/weak reuse and self-rating are the same authored content, not independent families.

## Primary-source qualifications

[FIPS 197](https://csrc.nist.gov/pubs/fips/197/final) specifies AES key sizes 128/192/256 with a 128-bit block size for all three. AES-256's larger keyspace does not establish complete deployment security. The modes/nonce/authentication and endpoint/key-custody limits remain the prior lesson and m035/m212 qualifications; no claim that AES-128 is practically broken is accepted.

The [withdrawn FIPS 46-3 record](https://csrc.nist.gov/pubs/fips/46-3/final) marks DES's obsolete standard boundary. It does not authorize current DES use or treat distinct TDEA as a newly approved substitute. [RFC 7465 §2](https://datatracker.ietf.org/doc/html/rfc7465) prohibits offering/selecting RC4 cipher suites in TLS and requires terminating an RC4-only handshake. These sources support legacy recognition/avoidance, not instant recovery of arbitrary ciphertext or a tested migration.

[NIST SP 800-57 Part 1 Rev.5, Table 2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf) compares estimated classical security strength separately from raw RSA/ECC key size; for example its 128-bit-strength row associates RSA modulus 3072 with ECC range 256–383. This is not a performance benchmark or quantum-safety promise. ECC naming does not distinguish agreement from signature schemes; m406/m206/m210 and the optional PQC lesson already supply deeper, differently bounded instruction.

[FIPS 198-1](https://csrc.nist.gov/pubs/fips/198-1/final) defines HMAC using a cryptographic hash and shared secret. Its record currently describes proposed withdrawal; [SP 800-224](https://csrc.nist.gov/pubs/sp/800/224/ipd) is explicitly an initial public draft in the inspected record. This review does not promote that draft to final or claim completed withdrawal. Shared-secret authentication is not unique attribution among key holders, confidentiality or a public-key signature. The card omits operational key/tag/protocol constraints and does not repair the prior overloaded MAC identity hold.

[RFC 8017 §§6–8](https://www.rfc-editor.org/rfc/rfc8017.html) separates RSA encryption/decryption schemes from signature generation/verification. Encryption uses a recipient public key and matching private key; adequate scheme encoding and trusted key binding remain prerequisites. The RFC advises a given pair for one scheme and does not recommend the traditional combined use for new applications. The inspected RSA glossary's factoring-large-prime-numbers wording is held: the modulus is a product of primes, not a single large prime to factor. This is a collision observation only; its glossary record remains pending.

[FIPS 180-4](https://csrc.nist.gov/pubs/fips/180-4/upd1/final) defines algorithm-specific secure hash digests. [NIST's hash overview](https://csrc.nist.gov/projects/hash-functions) distinguishes SHA families, digest/security properties and SHA-1's deprecated/disallowed signature use; it also distinguishes SHAKE extendable output. Bare SHA does not approve every family member. A comparison needs a trusted reference or authenticated construction; an attacker-controlled digest can be replaced along with the message. This card neither assesses collision/preimage distinctions nor supplies password hashing/salt/work-factor/KDF instruction.

[Microsoft TPM recommendations](https://learn.microsoft.com/en-us/windows/security/hardware-security/tpm/tpm-recommendations) describe discrete, integrated and firmware TPM 2.0 implementations and platform integration. [TCG TPM 2.0 Library Part 1 v184 §§21,23](https://trustedcomputinggroup.org/wp-content/uploads/Trusted-Platform-Module-2.0-Library-Part-1-Version-184_pub.pdf) distinguishes fixedTPM/fixedParent, authorization and duplication attributes. The TPM label does not prove every key is non-exportable. [Microsoft's boot-process documentation](https://learn.microsoft.com/en-us/windows/security/operating-system-security/system-security/secure-the-windows-10-boot-process) distinguishes recording/verifying boot measurements from Secure Boot enforcement. No hardware, attestation, fleet key-management design, endpoint health or cryptographic operation was tested.

## Actual delivery and access

Source-only evidence, no fresh browser/entitlement test. Standard authored decks and reveal/definition feedback are available to guests/free without Pro. The prior container is the second default mobile quick set, chapter-filtered quick sets/full browsing use source order. Guests see the mode chooser; signed-in users can save a default. Definition mode presents the meaning and reveals expansion/acronym plus meaning; acronym mode presents the acronym and reveals expansion plus definition. Pure existing face expressions are executed and hashed for each selected raw card. No example exists; requested example mode falls back to definition. Plain JSX does not render glossary overlays or scenario-specific corrections.

One card is active; previous/next wrap, movement resets flip, shuffle resets the pass. Native buttons/aria-pressed are observed in source, not browser-audited. Again/Got it appear after reveal and self-rate the same authored ID. Completion counts all **24 distinct rated cards**, regardless of Again/Got it; the mastered label and device/eligible-account persistence are self-report, not trusted grading/mastery. No React, rating, save, capture, storage or sync handler runs in the check.

Learn More's actual ranked prior lessons are **crypto-modes-pqc-transition,keys-passwords-encryption,pki-email-trust**. Guests must sign up, then the source requires Pro. The master-plan all-Domain1-free lesson decision and current access gap are preserved. Coarse objective/lexical ranking is not precise or validated post-miss remediation. Source-order next deck is **identity-authentication**, which receives no semantic review here. Assistant-generated inventory is Pro; generated-deck saving requires an account, not Pro. Shared links resolve current card IDs and cap at30.

## Selector reuse and saved truncation

Pure synthetic probes read no personal deck/star/history. Preserved-order random10 returns authored indexes0–9, including selected **AES / AES-256,DES,ECC**. Hydration of all **24** source IDs, acronym-only, normalizes to **20** and keeps indexes0–19. Selected **AES / AES-256,DES,ECC,HMAC,RC4** survive; **RSA,SHA,TPM** at indexes20/22/23 are omitted. These are observed source limits, not new behavior.

Eight selected IDs replay as eight because the available pool is below normalized target10. Unknown IDs are dropped. Reversed star inputs return current author order. Both-type configuration on an all-acronym pool returns **10 real cards plus one divider**, with no backfill of missing term allocation. Hold the exact-mix promise: neither rounding/type allocation nor current-ID resolution guarantees all saved cards or historical faces. Shared delivery resolves current IDs directly rather than invoking saved hydration. Six fixed synthetic weak-topic probes return18 cards plus selected intersections; they exercise broad chapter/topic/token selectors, not learner recovery or canonical adaptive mapping.

## Prior overlap and exclusions

Every selected row binds prior relations without recounting them. AES relates to m035/m212,p005 and the modes guide; DES's prior m212 relation is explicitly a **distinct 3DES distractor**, not an assessed DES family. RC4 relates to general stream reuse instruction, which does not specifically assess RC4. ECC relates to parameter/performance, agreement and quantum boundaries in m406/m206/m210. HMAC relates to trusted integrity/authentication m103/m656, separate CBC+HMAC composition m212 and primitive recognition p005. RSA relates to recipient-key direction m008/m626, signature/trust m208/m713, forward secrecy m106 and quantum m210. SHA relates to trusted digests m103/m403, collision m207, salt/work-cost m211,p005 and password/modes instruction. TPM relates to platform-versus-HSM m622,p018/p054, keys hardware teaching and the **prior HSM card**. Each question comparison also binds its paired feedback.

Related lesson containers are prior references. Five exact glossary collisions **AES,ECC,HMAC,RSA,TPM** are inspected as metadata/qualification context, with no new glossary disposition or overlay; all five remain pending. DES/RC4/SHA have no exact glossary key. Alias inspection, decks, prior PKI cards, other algorithm/attack cards, comparison questions/PBQs/feedback and selector inventories add zero dispositions, eligible evidence or families. No private payload or keyed answer material is exported.

## Exact census and validation

**235 candidates:184 prior +8 new =192 distinct pending dispositions;43 remain**: **1 deck container,11 flashcards,31 glossary definitions**. Eight remaining crypto cards are **AH,DHE,ECDHE,ECDSA,PEM,PFS,PKCS,PSK**; three attack cards are **Birthday attack,Collision attack,Downgrade attack**. Only **cryptographic-attacks** remains as a deck container. No local 1.4 lesson/check/question/paired-feedback candidate remains undispositioned in this broad census. Containers remain separate records, not extra unique teaching items.

Exact remaining IDs, in catalogue order:

- deck:cryptographic-attacks
- flashcard:sy0701-acronym-crypto-keys-pki-ah-authentication-header
- flashcard:sy0701-acronym-crypto-keys-pki-dhe-diffie-hellman-ephemeral
- flashcard:sy0701-acronym-crypto-keys-pki-ecdhe-elliptic-curve-diffie-hellman-ephemeral
- flashcard:sy0701-acronym-crypto-keys-pki-ecdsa-elliptic-curve-digital-signature-algorithm
- flashcard:sy0701-acronym-crypto-keys-pki-pem-privacy-enhanced-mail
- flashcard:sy0701-acronym-crypto-keys-pki-pfs-perfect-forward-secrecy
- flashcard:sy0701-acronym-crypto-keys-pki-pkcs-public-key-cryptography-standards
- flashcard:sy0701-acronym-crypto-keys-pki-psk-pre-shared-key
- flashcard:sy0701-acronym-cryptographic-attacks-birthday-attack-birthday-attack
- flashcard:sy0701-acronym-cryptographic-attacks-collision-attack-collision-attack
- flashcard:sy0701-acronym-cryptographic-attacks-downgrade-attack-downgrade-attack
- glossary:aes
- glossary:ah
- glossary:bios
- glossary:ca
- glossary:cbc
- glossary:crl
- glossary:csr
- glossary:dh
- glossary:dhe
- glossary:dkim
- glossary:dmarc
- glossary:dnssec
- glossary:ecc
- glossary:fde
- glossary:gcm
- glossary:hashing
- glossary:hmac
- glossary:hsm
- glossary:ipsec
- glossary:md5
- glossary:mitm
- glossary:ngfw
- glossary:nips
- glossary:ocsp
- glossary:pem
- glossary:pfs
- glossary:rsa
- glossary:s%2Fmime
- glossary:san
- glossary:tokenization
- glossary:tpm

Global package remains 1878records/435identities (5mastery/28topic/402support),2954queue rows,489unresolved questions and7existing primary proposals. New primary proposals, human approvals, weights, independent families and eligible evidence remain **zero**. The existing five mastery identities and all CIA/MAC/RBAC/TOU/MTTR/MTBF/FAR/MOA/MOU/crypto/keys/modes/PKI holds are unchanged. Private p017 stays **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, trusted null, payload unavailable/unreviewed; no fresh read or substitute.

Run `node scripts/audit-objective14-algorithm-cards.mjs` and `npm run audit:content-mapping`. Deterministic checks bind exact authored/raw/flattened/face revisions, prior relationships, source gates, pure face/completion and selector outputs, remaining membership/order and census. Negative mutations reject stale revisions/faces, inherited scope, generic-AES/SHA/MAC/TPM-HSM identity unions, trusted/mastery/family/approval promotion and fabricated scenario mode. All **25 active release hashes unchanged**, exact package/bank unchanged. No runtime/browser/database/learner/deploy/live/migration/shadow/cohort/Phase3 change. Task-only **[skip deploy]** push; Phase2B-5 remains **NOT READY**.
