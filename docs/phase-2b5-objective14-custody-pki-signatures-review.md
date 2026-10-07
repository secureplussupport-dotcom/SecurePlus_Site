# Phase 2B-5: objective 1.4 custody, PKI and signatures

**LOCAL SEMANTIC PROPOSALS — NOT READY.** Eight effective MCQs and their eight answer-linked feedback bundles have pending agent dispositions. The unchanged broad objective-1.4 census has **235 records**. Thirteen prior packets account for **54 exact-revision dispositions**; this slice adds sixteen, bringing the total to **70**, with **165 remaining**. Counts measure agent review, not approved coverage, independent families or eligible mastery evidence. The unchanged master plan governs product decisions; the Phase 1 audit supplies historical implementation evidence. No unresolved product-decision conflict was found and no behavior changes here.

Baseline: `9d43bac9bf56163a8c9ab01e31a529aeffeb7eff`. [Proposal packet](drafts/phase-2b5-objective14-custody-pki-signatures-proposals.json), SHA-256 `bc452ce1e68c91f2627251cc817b5706edc847d8c96bd0b214ba1dc7eece23f6`. It binds exact local/catalogue revisions, trusted/source metadata, all prior dispositions, selected IDs and all remaining IDs. No question text, grading keys, private payloads or learner history is exported.

## Exact denominator and selection

| Kind | Candidates | Prior | New | Remaining |
| --- | ---: | ---: | ---: | ---: |
| MCQ | 46 | 12 | 8 | 26 |
| PBQ | 11 | 0 | 0 | 11 |
| Feedback bundle | 57 | 12 | 8 | 37 |
| Flashcard | 40 | 13 | 0 | 27 |
| Glossary definition | 47 | 16 | 0 | 31 |
| Deck container | 3 | 1 | 0 | 2 |
| Lesson | 3 | 0 | 0 | 3 |
| Lesson section | 10 | 0 | 0 | 10 |
| Keyword guide | 3 | 0 | 0 | 3 |
| Trap bundle | 3 | 0 | 0 | 3 |
| Lesson check, including displayed generated checks | 12 | 0 | 0 | 12 |
| **Total** | **235** | **54** | **16** | **165** |

Selected MCQs: **m118, m728, m005, m238, m410, m734, m652 and m713**, each with its `explanation:mcq:<id>` bundle. All are exact remaining IDs from the prior encryption/key-use packet. Eight directly relevant items survive, so no loosely related items are needed to fill the selection. Prior records are deduplicated rather than reviewed or counted again. The packet lists all 165 remaining IDs; the census covers broad local package tags, not unavailable live/private payloads or untagged content.

## Actual decisions, usefulness and qualifications

All eight retain MCQ format and objective 1.4, with no additional assessed objective. The [official SY0-701 objectives v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) covers key management, HSMs, signatures and certificate/PKI decisions within cryptography. Their names do not independently establish implementation competence.

| ID / observed difficulty | Actual assessed decision | Correction usefulness and limit |
| --- | --- | --- |
| m118 / medium | Choose HSM generation/storage to protect key material from application-server extraction, rather than self-encryption, encoding or rotation alone. | Feedback distinguishes extraction resistance from misuse of permitted operations. Non-exportability is a key policy/configuration assumption, not a universal hardware guarantee. No access-control, provisioning, backup, rotation or device-assurance validation is demonstrated. |
| m728 / easy | Identify the specified dedicated cryptographic hardware appliance as an HSM. | Main correction and three wrong corrections distinguish a platform enclave, NIPS and SDP gateway. A device name does not prove non-exportability, security certification, access controls or correct integration. Useful role recognition, not secure deployment. |
| m005 / medium | Recognize successful chain validation when the root is already locally trusted, required intermediates are supplied and all other checks pass, despite the server omitting the root. | Feedback separates root trust from certificate transmission and rejects disabling validation. Root trust and other checks are premises; no hostname/time/revocation validation or live TLS execution is independently tested. A server-sent root is not automatically trusted. |
| m238 / medium | Infer only that the reported path and validity-period checks passed against the configured trust store. | Corrections reject unperformed revocation, hostname and live-connectivity conclusions. This assesses the limit of a result, not execution of a validation tool or universal certificate validity. |
| m410 / medium | Choose approved managed distribution of a verified private root to the actual client trust stores when hostname, dates and chain are supplied as sound. | Feedback contrasts trust configuration with renewal, serving a root or changing a signature algorithm. Other checks remain required. No root is installed here, and answer selection does not prove safe distribution or resolve every warning. |
| m734 / easy | Recognize OCSP for a signed per-certificate status response from an authorized responder. | Feedback adds applicability, signature and freshness checks, and contrasts a scoped CRL, SCEP enrollment and ACME certificate management. Cached/publication delays matter; recognition does not validate a response, establish instant awareness or complete hostname/path/time checks. |
| m652 / medium | Choose a validated sender-key digital signature to support origin/integrity verification and evidence relevant to non-repudiation. | Corrections distinguish shared-secret attribution, recipient confidentiality and recomputable unkeyed checksums. Identity binding and key custody qualify attribution; no absolute or legal guarantee, universal hash-encryption construction or successful implementation is inferred. |
| m713 / medium | Infer only that signature, signed data, verification key or parameters do not form a valid combination. | Corrections separate confidentiality encryption, certificate-policy expiry and unsupported private-key attribution. Failure alone does not identify tampering, a unique cause or certificate trust; no successful remediation is demonstrated. |

A trust anchor is configured input to path validation, delivered through a trusted procedure; it is not established merely by receiving a root from a server. Application checks remain distinct. [RFC 5280, §§6.1–6.2](https://www.rfc-editor.org/rfc/rfc5280). OCSP response acceptance requires matching the certificate, verifying the response and authorization, and checking time/freshness. [RFC 6960, §3.2](https://www.rfc-editor.org/rfc/rfc6960). Signatures support modification detection and signatory evidence, while key protection remains an essential separate obligation. [FIPS 186-5](https://csrc.nist.gov/pubs/fips/186-5/final), [NIST SP 800-57 Part 1 Rev. 5](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final). These sources qualify recognition outcomes; no active teaching, key handling or certificate configuration is changed.

All effective main explanations and authored wrong-choice corrections were read in full. Each bundle has three wrong corrections; m728 also retains an empty correct-choice placeholder, which is not a fourth correction or new evidence. The actual feedback helper returns the authored wrong corrections without fallback. Existing HSM, PKI, OCSP, CRL, digital-signature and encryption support identities link only relevant instruction/contrasts with weight zero. No assessed secondary role or promoted mastery node is created. Feedback remains conditional instruction attached to its parent, not an independent assessment or validated learning recovery.

## Source precedence, trusted identities and delivery

Five selected IDs have local authored literals and no item-specific bound capture. **m728, m734 and m713 have no local authored literals**; their pre-editorial inputs are published snapshots reconciled against existing authenticated capture fingerprints. The packet retains local canonical-JSON snapshot revisions separately from PostgreSQL `jsonb::text` captured hashes. Existing reconciliation binds them; they are not directly equated across serializations. No fresh production query occurs.

The reviewed effective editorial versions supersede the old captured/authored wording. m005's old question conflated omission of a root with omission of an intermediate and keyed failure; its effective version supplies trusted-root/intermediate premises and keys success. This resolved content-history difference is not an unresolved approved-product conflict. m734's old snapshot described instantaneous status and includes a truncated enrollment correction; current feedback supplies freshness limits and complete correction text. m713 replaces a universal decrypted-signature-hash explanation with a bounded invalid-combination inference. m652 removes absolute non-repudiation and universal hash-encryption language. These existing editorial changes are preserved, not newly applied.

Effective difficulty/domain labels are retained: m118/m005 hard to medium; m238/m410 easy to medium; captured m728 chapter 3/medium to chapter 1/easy; m734 medium to easy; captured m713 chapter 3/easy to chapter 1/medium; m652 remains medium. No calibration, promotion or transfer claim follows from those labels.

Published records add `_baseOrder`; m728/m734/m713 also carry captured `_adminOrder` values 433/439/419. Removing only these ordering fields reproduces each exact effective local semantic object. Isolated replay of each older snapshot through the real publication helper preserves current editorial precedence. Trusted IDs reproduce the compiler and catalogue identities, without conveying mapping approval or current live-deployment proof.

The existing MCQ renderer selects from the practice pool, starts a set and displays the selected question/options; guest practice remains possible. Main explanations require submission and Pro; inline wrong detail also requires the selected option to be wrong. All wrong corrections are not simultaneously displayed. These are source observations, not fresh browser tests. Nested glossary triggers in disabled submitted option buttons remain browser-unverified. No learner-session, grading, persistence, entitlement, analytics or remote-fetch handler is invoked.

The actual shuffler runs with fixed local randomness. The focused check verifies preserved options/keyed meaning and wrong-feedback associations. A changed display order does not create a new family or independent evidence.

## Decision groups, neighbors and recommendations

Eight provisional groups name the actual decisions above. They are agent comparisons, not eight approved independent families. m118's extraction-protection choice relates to m728's appliance-name recognition. m005/m238/m410/m734 share PKI context but ask about supplied trust, result limits, managed trust configuration and status-protocol recognition respectively; together they still do not execute full certificate validation. m652's valid-signature mechanism differs from m713's failure-inference limit.

Six effective neighbors were read for comparison only: **m622** repeats dedicated-HSM recognition; **m043** diagnoses missing internal-root trust; **m037/m110** repeat OCSP protocol recognition with different distractors/revoked-key context; **m208** names missing origin authentication despite confidentiality; **m406** asks for target-device signature benchmarking rather than universal algorithm superiority. Their question and feedback records remain in the 165 remaining candidates. No full disposition, queue closure or new family credit is attributed to those comparisons. There are no identical selected stems; semantic overlap still limits independence.

Prior encryption/PKI/TLS support dispositions and all eight prior encryption/key-use question revisions are preserved. Recipient confidentiality, DH agreement, AEAD record authentication and forward secrecy do not establish HSM custody, full certificate validation or identity-bound non-repudiation. A CA label, digital-signature name or hardware mention receives no extra evidence credit.

Single-miss local fixtures route m118 to `keys-passwords-encryption` then `crypto-modes-pqc-transition`; m728 to `keys-passwords-encryption` then `pki-email-trust`; m005/m238/m410/m734/m652 to `pki-email-trust` then `keys-passwords-encryption`; m713 to `crypto-modes-pqc-transition` then `pki-email-trust`. These are exact legacy selector outputs only. No new lesson semantic/delivery approval or validated remediation follows from routing.

## Validation and remaining gate

Validation passed: `node scripts/audit-objective14-custody-pki-signatures.mjs`, all 29 tests in `npm run audit:content-mapping` and exact package reproduction. The focused check binds the 235/54/16/70/165 census, exact selected/remaining revisions, thirteen prior packets, three captured sources and ordering metadata, actual conditional gates, authored corrections, shuffle/remapping, difficulty/format, comparisons and selector outputs. Negative checks reject stale revisions, invented authored/trusted/primary identities, assessed distractor links, scope/family/difficulty promotion and ungated feedback. It verifies all 25 release hashes unchanged, report/packet binding and private p017's null trusted revision. The `[skip deploy]` guard passed; staged whitespace is checked before committing.

Remaining objective-1.4 candidates: **26 MCQs, 11 PBQs, 37 feedback bundles and 91 instructional/support records**. They include the six comparison-only neighbors, certificate issuance/names/intermediate compromise/stapling, signature-performance selection, hash/collision/password variants, at-rest protection, key length/quantum qualifications, tokenization/steganography and the crypto lessons/support surfaces. Naming these gaps is not a claim of full objective coverage or secure deployment capability.

The active package remains SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`: 1,878 records, 435 concepts (5 mastery, 28 topic, 402 support), **2,954 review decisions**, **489 unresolved question mappings**, seven existing primary proposals. The only mastery identities remain BIA, MTD, MTTR, RPO and RTO, so all eight primary proposals are null, all assessed secondary roles empty, and weights/new family credit zero. Approved mappings and eligible new evidence remain zero. Prior CIA/MAC/RBAC/TOU ambiguities, withheld MTTR, unverified MTBF, FAR collision and MOA/MOU holds are unchanged. Private selected p017 stays unavailable at `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted revision null, with no query or fallback substitution.

Commit/push only this packet/report/check with `[skip deploy]`; preserve unrelated dirt. Adaptive stays unpublished, unwired, default-off and learner-invisible. No live migration, deployment, activation, shadow writes, cohort change, credentials, pricing/legal or Phase 3 change is authorized. **Phase 2B-5 and production migration remain NOT READY.**
