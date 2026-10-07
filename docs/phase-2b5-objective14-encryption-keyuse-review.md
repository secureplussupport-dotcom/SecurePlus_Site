# Phase 2B-5: objective 1.4 encryption modes and key use

**LOCAL SEMANTIC PROPOSALS — NOT READY.** Eight effective MCQs and their eight answer-linked feedback bundles have pending agent dispositions. The unchanged broad objective-1.4 census contains **235 records**. The previous twelve packets account for **38 distinct exact-revision dispositions** (the original 30 support dispositions plus eight password-storage records); this slice adds sixteen, bringing the total to **54**, with **181 remaining**. These are review counts, not approved coverage, independent families or eligible mastery evidence. The unchanged master plan governs product decisions and the Phase 1 audit supplies historical implementation evidence. No unresolved product-decision conflict was found; no behavior changes here.

Baseline: `dcd18106586d4d011fd9107e2e775d079c5726f3`. [Proposal packet](drafts/phase-2b5-objective14-encryption-keyuse-proposals.json), SHA-256 `c70dfd0c824e86a259679d3b77f21eb470c993a6a677907844beca2b6b79f459`. It binds every broad candidate's exact effective/catalogue revisions, all prior dispositions, the sixteen selected record IDs and all 181 remaining IDs. No question text, grading keys, private payloads or learner history is exported.

## Exact denominator and bounded selection

| Kind | Candidates | Prior | New | Remaining |
| --- | ---: | ---: | ---: | ---: |
| MCQ | 46 | 4 | 8 | 34 |
| PBQ | 11 | 0 | 0 | 11 |
| Feedback bundle | 57 | 4 | 8 | 45 |
| Flashcard | 40 | 13 | 0 | 27 |
| Glossary definition | 47 | 16 | 0 | 31 |
| Deck container | 3 | 1 | 0 | 2 |
| Lesson | 3 | 0 | 0 | 3 |
| Lesson section | 10 | 0 | 0 | 10 |
| Keyword guide | 3 | 0 | 0 | 3 |
| Trap bundle | 3 | 0 | 0 | 3 |
| Lesson check, including displayed generated checks | 12 | 0 | 0 | 12 |
| **Total** | **235** | **38** | **16** | **181** |

Selected MCQs are **m008, m626, m206, m212, m106, m405, m705 and m717**, each accompanied by its `explanation:mcq:<id>` record. All were exact remaining IDs in the password-storage packet. No prior revision is re-counted. This is the broad tagged package census, not an inference about untagged content or unavailable production/private payloads.

## Assessed decisions and feedback

All retain objective 1.4 and MCQ format; no other objective receives assessed credit. The [official SY0-701 objectives v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) covers encryption, public/private keys and key exchange within cryptography; mentioning TLS does not establish secure protocol deployment.

| ID / observed difficulty | Assessed decision and useful correction | Qualification |
| --- | --- | --- |
| m008 / medium | Choose recipient public-key encryption for the supplied verified key, short-message, offline-recipient scenario with no shared secret. Corrections distinguish a missing shared AES/session key and a non-decryptable hash. | Key ownership and suitable encryption scheme are supplied assumptions, not demonstrated validation. No padding, hybrid-envelope or sender-authentication skill. DH has noninteractive constructions; do not infer that an offline recipient universally rules out every DH-based design. |
| m626 / easy | Identify the recipient public encryption key as the sender input. Feedback separates that key from a shared secret, the protected private key and a CA signing key. | A suitable supported encryption scheme and verified recipient ownership matter. Not every asymmetric algorithm/key supports encryption. No certificate-validation, key-custody, integrity, sender-origin or non-repudiation competence is independently assessed. |
| m206 / easy | Recognize DH's shared-secret agreement role, distinct from direct application encryption or signing. Corrections contrast RSA schemes, ECDSA and DSA roles. | Agreement alone does not authenticate the peer against an active on-path attacker. No parameter/public-key validation, KDF or protocol implementation is assessed; distractor algorithms receive no mastery credit. |
| m212 / medium | Recognize the listed integrated AES-GCM authenticated-encryption mode for record confidentiality and modification detection. Feedback distinguishes separate CBC/HMAC composition, ECB/CRC32 and unauthenticated 3DES-CBC. | Correctly composed CBC plus MAC can be secure; this is not an algorithm-superiority decision. Nonce uniqueness and tag verification are operational requirements taught by feedback, not demonstrated implementation. AEAD authentication is not certified sender identity or non-repudiation. No disk-sector claim. |
| m106 / medium | Identify past-session protection after replacing static transport with authenticated ephemeral agreement. Corrections separate the property from automatic revocation, removal of authentication and endpoint plaintext protection. | Sound agreement and erased secrets matter. Does not demonstrate key revocation, endpoint protection, future post-compromise recovery or that all TLS 1.3 modes provide the same property. |
| m405 / medium | Identify ephemeral agreement as the reason recorded sessions withstand later signing-key theft, rather than pinning or same-key certificate renewal. | Agreement and erasure are supplied; neither is verified by answer selection. A TLS version/cipher-suite name alone does not prove key-exchange mode. |
| m705 / medium | Recognize DHE/ECDHE session isolation under the stated erasure assumption. Feedback contrasts static transport, signatures alone and password stretching. | Design recognition, not a deployment task. Sound authenticated implementation, secret erasure and independent session establishment remain assumptions. No recovery-clock or endpoint protection evidence. |
| m717 / easy | Name forward secrecy for past-session confidentiality after later long-term authentication-key compromise. Feedback adds that fresh session keys alone are insufficient and contrasts non-repudiation, stretching and pinning. | Does not verify that session secrets cannot be recovered from the long-term key, that erasure occurred or that endpoint/peer identity is secure. |

Public-key encryption uses a recipient public encryption key and corresponding private decryption key in a suitable scheme; encryption and signature schemes have different purposes. [RFC 8017, §§6–7](https://www.rfc-editor.org/rfc/rfc8017). DH belongs to key establishment. [NIST SP 800-56A Rev. 3](https://csrc.nist.gov/pubs/sp/800/56/a/r3/final). GCM's record protection depends on correct nonce and tag handling. [NIST SP 800-38D, §§7–8 and Appendix A](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf). TLS 1.3 distinguishes PSK-only and PSK-with-DHE modes; PSK-only lacks the stated forward-secrecy property, and the record cipher suite does not establish the negotiated agreement mode. [RFC 8446, §4.2.9 and Appendix E.1](https://www.rfc-editor.org/rfc/rfc8446). These sources qualify the local recognition items; no active teaching or answer text is edited.

All eight effective bundles were read in full. Each contains a main correction and three specific wrong-choice corrections. The actual helper returns those authored corrections without fallback; the shuffler preserves correction-to-option association. Existing encryption/AES/DH/hash/PKI/RSA/ECDSA/GCM/CBC/PFS/DHE/ECDHE/TLS support nodes are linked only where they teach or contrast the relevant decision. No assessed secondary role, promoted support node or new mastery identity is created. Feedback is instruction attached to its parent, with zero weight and family credit; it does not demonstrate learning recovery.

## Source precedence and actual delivery

The packet separates authored, pre-editorial snapshot-merged, effective-local, published-catalogue and compiler-derived trusted revisions. Seven selected IDs have no item-specific bound snapshot/authenticated capture and retain distinct authored versus effective revisions. m717 has **no local authored literal**: its pre-editorial source is the published snapshot, reconciled against the existing authenticated capture fingerprint. That historical row is active, but its explanation/feedback and wording are superseded by the effective editorial revision. The existing reconciliation records that its snapshot payload matches the captured PostgreSQL `jsonb::text` fingerprint. That database fingerprint and the local canonical-JSON revision use different serializations and are retained separately; neither is substituted for the reviewed effective content. An isolated replay through the actual publication helper confirms the older captured row cannot undo the effective editorial revision. No fresh remote query is performed.

The editorial pipeline also replaces older blanket TLS claims in m106/m405 and generic wrong-choice feedback in m626/m705. Effective difficulties are retained: m008/m106/m405/m705 are medium despite older hard labels, and m626 is easy despite its older medium label. Published objects add `_baseOrder`; m717 additionally carries `_adminOrder: 422` from the captured sort metadata. Removing only these ordering fields matches exact local semantic content. Existing trusted IDs reproduce the compiler/catalogue identities but confer neither mapping approval nor live-deployment proof.

The existing practice pool selects questions, starts a set and displays the selected stem/options; guest practice can use that pool. Main feedback requires submission and Pro. Inline wrong-option detail additionally requires the selected option to be wrong, so all wrong corrections are not shown simultaneously. These are bound source observations, not fresh browser tests. Nested glossary triggers inside disabled submitted option buttons remain browser-unverified. No learner-session, grading, persistence, entitlement, analytics or remote-fetch handler runs in these checks.

The actual option shuffler is exercised with fixed local randomness. The check verifies unchanged answer meaning/options and all wrong-feedback associations. A different display order remains the same authored decision, not new evidence.

## Decision groups, near-duplicates and legacy routing

Four provisional groups cover **recipient public-key role (m008/m626)**, **DH's purpose (m206)**, **integrated AEAD recognition (m212)** and **past-session forward secrecy (m106/m405/m705/m717)**. There are no identical selected stems, but the four forward-secrecy variants largely reuse the same outcome and assumptions. Different TLS framing, certificate-control distractors, design wording or a property-name prompt do not justify four independent families. The two public-key questions likewise reuse the recipient-key role, with additional missing-shared-secret context in m008. Agreement-purpose recognition and AEAD record protection are related to, but different from, the forward-secrecy property. All independence decisions remain pending and credit remains zero.

Remaining **m105** was read for exact-revision near-duplicate comparison with m008/m626. Its effective public-key-distribution decision repeats their recipient-key role. Its snapshot/captured antecedent and current correction were compared, but a full proposal disposition is deferred; both its question and feedback stay among the 181 remaining records. Comparison does not close the queue or create a ninth selected assessment.

Prior encryption/PKI/TLS support dispositions and password hash/work-factor questions keep their exact meanings and holds. Hashing as an encryption contrast and password stretching as a forward-secrecy distractor do not add fresh password mastery or independent evidence.

Pure single-miss fixtures route m008/m626/m206/m212/m106/m405 to `crypto-modes-pqc-transition` then `keys-passwords-encryption`; m705 routes to `pki-email-trust` then `keys-passwords-encryption`; m717 routes to `crypto-modes-pqc-transition` then `pki-email-trust`. These are exact legacy selector outputs only. No new lesson semantic review or validated remediation is inferred from objective/topic/lexical matches.

## Validation and remaining gate

Validation passed: `node scripts/audit-objective14-encryption-keyuse.mjs`, all 29 tests in `npm run audit:content-mapping` and exact package reproduction. The focused check binds the 235/38/16/54/181 census, selected/remaining IDs, twelve prior packets, exact source/captured/trusted identities, preserved editorial precedence, conditional feedback gates, authored corrections, source difficulty/format, permutations, group cardinalities, comparison-only m105 and selector outputs. Negative checks reject stale revisions, invented authored/trusted/primary identities, assessed distractor links, scope/difficulty/family promotion and ungated feedback. It verifies all **25 active release hashes** remain unchanged, the selected private p017 boundary remains null-trusted/unavailable and the report binds the exact packet hash. The Vercel `[skip deploy]` guard passed; staged whitespace is checked before committing.

Remaining objective-1.4 candidates are **34 MCQs, 11 PBQs, 45 feedback bundles and 91 instructional/support records**. They include key length/algorithm-selection qualifications, at-rest protection, key custody/hardware, signatures and origin, collision resistance, certificates/revocation/PKI, password-storage variants and the three crypto lessons/support surfaces. No full objective coverage, secure key lifecycle or production protocol capability is established by this bounded recognition slice.

The active package remains SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`: 1,878 records, 435 concepts (5 mastery, 28 topic, 402 support), **2,954 review decisions**, **489 unresolved question mappings**, seven existing primary proposals. All eight primary proposals remain null because the only mastery identities are BIA, MTD, MTTR, RPO and RTO. Approved new mappings and eligible evidence remain **zero**. Prior CIA/MAC/RBAC/TOU ambiguities, withheld MTTR, unverified MTBF, FAR collision and MOA/MOU holds are unchanged. Private selected p017 remains unavailable at `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted revision null, no query or fallback substitution.

Commit/push only this packet, report and focused check with `[skip deploy]`; preserve unrelated dirt. Adaptive stays unpublished, unwired, default-off and learner-invisible. No live migration, deployment, activation, shadow writes, cohort change, credentials, pricing/legal or Phase 3 change is authorized. **Phase 2B-5 and production migration remain NOT READY.**
