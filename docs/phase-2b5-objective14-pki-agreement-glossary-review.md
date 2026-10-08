# Phase 2B-5 — objective 1.4 PKI and agreement glossary review

Offline agent dispositions only; **NOT READY** for owner approval, publication, activation, migration or deployment. Baseline **99a415ce2277e54400fc8ffbfc921789a43af35c**; packet SHA-256 **85bc2ed1b25309db1700fc5c09627c342051863dab870a59aad8925e34e7fbf2**. Only this packet, report and focused audit change.

## Exact selected boundary and authored definitions

Exactly eight IDs from the prior packet's **23 remaining IDs**: **glossary:ca,glossary:crl,glossary:csr,glossary:dh,glossary:dhe,glossary:ecc,glossary:hsm,glossary:ocsp**. No question, feedback, lesson, deck/card, related destination or other definition receives a new disposition. All **30 prior packets** and bound revisions are verified. Only disposition arrays count.

All eight are object entries in ACRONYM_GLOSSARY_TERMS. Actual getEntry returns their authored fullName and definition unchanged. Each row binds source line, authored literal, term-plus-definition revision, separate definition revision and rendered entry/name/body hashes. No corrected fallback is substituted.

| ID | Current full name and tooltip definition | Source line |
| --- | --- | --- |
| glossary:ca | Certificate Authority: Trusted PKI entity that verifies identities and signs digital certificates. | src/App.jsx:2257 |
| glossary:crl | Certificate Revocation List: Published list of certificates revoked before expiration. | src/App.jsx:2267 |
| glossary:csr | Certificate Signing Request: Request containing a public key and identity details sent to a CA for certificate issuance. | src/App.jsx:2269 |
| glossary:dh | Diffie-Hellman: Key exchange algorithm for establishing shared secrets over untrusted networks. | src/App.jsx:2279 |
| glossary:dhe | Diffie-Hellman Ephemeral: Ephemeral Diffie-Hellman key exchange that supports forward secrecy. | src/App.jsx:2280 |
| glossary:ecc | Elliptic Curve Cryptography: Asymmetric cryptography using elliptic curves to provide strong security with smaller keys. | src/App.jsx:2289 |
| glossary:hsm | Hardware Security Module: Tamper-resistant hardware used to generate, store, and protect cryptographic keys. | src/App.jsx:2304 |
| glossary:ocsp | Online Certificate Status Protocol: Real-time protocol for checking whether a digital certificate is valid or revoked. | src/App.jsx:2337 |

## Complete local dispositions

| Record | Proposed scope | Teaching and qualification hold |
| --- | --- | --- |
| glossary:ca | 1.4 narrow vocabulary support;weight0 | Recognize a CA as a certificate issuer under an issuance policy; relying-party acceptance depends on locally established trust and path/application checks. HOLD trusted as universal or automatic from the issuer name, CA label or self-signature. A CA may be an intermediate issuer rather than the relying-party trust anchor; the anchor is an independently selected validation input. Requested identity verification and possible RA delegation follow issuance policy and do not guarantee trustworthy content or correct issuance. Path, name, usage and revocation checks still matter; no trust store or certificate was validated. |
| glossary:crl | 1.4 narrow vocabulary support;weight0 | Recognize a CRL as signed revocation-list information for its defined issuer, scope and publication time, rather than proof of complete certificate validity. HOLD list absence as full validity or immediate revocation awareness. Verify signed authorized issuer, applicability/scope and freshness; account for distribution points and delta/indirect CRL handling where applicable. Expired or out-of-scope lists cannot prove status. Signature/path, validity-time, application-name and usage checks remain separate; no CRL was fetched, validated or used to certify a live certificate. |
| glossary:csr | 1.4 narrow vocabulary support;weight0 | Recognize a CSR as a signed certification request carrying a subject public key and requested identity/attributes, not an issued certificate or private-key transfer. HOLD request as issuance or verified identity: a PKCS#10 request is signed using the subject private key to bind requested contents and demonstrate relevant key possession, but CA authorization and independent identity/policy checks remain separate. Requested fields/extensions need not be granted. The public key is sent; the private key remains protected with the applicant. CSR is not CSRF, an issued certificate, a trust anchor or a universal all-enrollment format; no request was parsed or signed. |
| glossary:dh | 1.4 narrow vocabulary support;weight0 | Recognize Diffie-Hellman as key agreement for deriving a shared secret; channel authentication, parameter validation and secret handling are separate prerequisites. HOLD untrusted network wording as peer authentication. Unauthenticated agreement is vulnerable to an active on-path intermediary; authenticate/bind peers and use suitable validated groups/public values, fresh or otherwise protocol-required secrets, sound derivation and custody. DH does not directly encrypt application data or create signatures. Generic DH does not necessarily mean DHE or forward secrecy, and finite-field versus elliptic-curve variants are distinct constructions; no exchange was executed. |
| glossary:dhe | 1.4 narrow vocabulary support;weight0 | Recognize ephemeral finite-field Diffie-Hellman agreement as supporting session forward secrecy under authenticated protocol, fresh-secret and erasure premises. HOLD supports as automatic forward secrecy from the acronym: fresh ephemeral private values, appropriate groups, authenticated protocol binding and secure disposal are required. Later long-term authentication-key theft must not recover earlier session secrets under those premises; exposed session keys or endpoint plaintext are outside that protection. DHE is not generic DH, ECDHE, ECDSA, a bulk cipher or automatic post-quantum protection; no session or erasure was verified. |
| glossary:ecc | 1.4 narrow vocabulary support;weight0 | Recognize ECC as a family of elliptic-curve public-key constructions, with smaller keys relative to suitable classical schemes at matched security strength. HOLD smaller keys without a comparator and matched classical security target. Curve, parameters, protocol, operation, implementation and hardware matter; fewer raw bits do not automatically imply higher security or universal faster execution. ECC is not one cipher, ECDHE or ECDSA and is not automatically quantum resistant. No curve/parameter validation, performance benchmark or cryptographic operation was performed. |
| glossary:hsm | 1.4 narrow vocabulary support;weight0 | Recognize an HSM as a cryptographic hardware boundary that can generate, store and use keys under device and integration policy, not an automatic custody guarantee. HOLD tamper-resistant as tamper-proof, validated device, universal key non-exportability or safe calling endpoint. Supported algorithms, key attributes, firmware, roles/access controls, export/wrapping and recovery policy depend on module and integration. A compromised authorized caller can misuse permitted operations without extracting the key. Preserve HSM versus TPM/Secure Enclave distinctions; no actual device, certificate, custody configuration or key policy was inspected. |
| glossary:ocsp | OCSP precise scope/link withheld;1.4 context;weight0 | Recognize OCSP status-query context only; hold the real-time valid-or-revoked definition pending correction to signed, applicable and fresh revocation-status information. HOLD real-time and valid-or-revoked as complete instantaneous validity. OCSP includes good/revoked/unknown states; good alone does not establish issuance or every certificate/path/name/usage check. Responses may be cached, pre-produced or stapled and require matching certificate, valid signature, authorized responder and acceptable freshness/applicability. Failure/unknown handling is application policy, not automatic validity. No responder, response or live certificate was queried or validated. |

[CompTIA SY0-701 v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) places PKI, certificates, CA, CRL, OCSP, CSR and HSM in objective1.4. DH/DHE/ECC are conservative vocabulary inferences under key exchange/public-key teaching, not claims of named-bullet or whole-objective assessment. Seven existing supporting nodes receive pending weight0 links. **OCSP's precise scope and link are withheld**: its real-time and valid-or-revoked wording conflicts with prior reviewed status teaching. Broad observed tags remain unions of source references. No new canonical identity or assessed primary is proposed. Prior RSA's mathematical-error link hold remains explicit.

## Primary-source semantic limits

[RFC5280 §§6.1–6.3](https://www.rfc-editor.org/rfc/rfc5280.html) treats the relying party's trust anchor as a separate validation input, with locally restricted trust policy. A certificate issuer may be an intermediate CA; its label or self-signature does not select an anchor. CRL use requires signature/authority, applicable scope and freshness checks. Absence from a list does not establish complete path/application validity; delta and indirect lists add handling requirements.

[RFC6960 §§2.2,2.4–2.6,3.2](https://www.rfc-editor.org/rfc/rfc6960.html) distinguishes good, revoked and unknown. Good does not by itself guarantee issuance or full certificate validity. Cached, pre-produced and stapled responses must match the certificate and pass signature, responder-authorization and time/applicability checks. Correct the glossary under a separately approved content change; no OCSP responder or certificate was queried here.

[RFC2986 §§3–4](https://www.rfc-editor.org/rfc/rfc2986.html) defines a signed certification request containing subject/public-key information and optional attributes. Signing uses the applicant's private key; the request is not a transfer of that key, an issued certificate or independent identity approval. Requested fields are subject to CA policy. CSR and CSRF retain separate identities.

[NIST SP800-56A r3](https://csrc.nist.gov/pubs/sp/800/56/a/r3/final) covers discrete-log key establishment in finite fields and elliptic curves. [RFC5246 AppendixF.1.1](https://www.rfc-editor.org/rfc/rfc5246.html) distinguishes anonymous and authenticated exchanges and fresh DH private values; this historical protocol explanation is not a new deployment recommendation. [RFC8446 AppendixE.1](https://www.rfc-editor.org/rfc/rfc8446.html) makes forward-secrecy and secret-erasure premises explicit. Generic DH agreement is not authentication, application-data encryption, a signature or necessarily ephemeral. DHE supports earlier-session protection under authenticated, fresh-secret and erasure conditions, not after theft of the relevant session secrets or endpoint plaintext. DHE and ECDHE are distinct variants.

[NIST SP800-57 part1 r5 §5.6.1.1,Table2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf) compares key sizes at matched classical security strength. ECC's smaller keys need a comparator and suitable parameters. The family label establishes neither universal speed nor quantum resistance; no benchmark or curve validation ran. ECC, ECDHE and ECDSA are not one operation or merged identity.

[FIPS140-3](https://csrc.nist.gov/pubs/fips/140-3/final) covers module interfaces, roles, firmware, physical security and key management at different levels; an HSM label is no evidence of actual device validation. As a specific implementation counterexample to universal non-exportability, [AWS CloudHSM SDK5 attributes](https://docs.aws.amazon.com/cloudhsm/latest/userguide/java-lib-attributes_5.html) allow key export policy to vary. Its [JCE extraction documentation](https://docs.aws.amazon.com/cloudhsm/latest/userguide/java-lib-configs-getencoded.html) separately disables clear private/secret extraction by default and describes opt-in conditions. These are vendor-specific distinctions, not defaults for all HSMs. Authorized operations may be misused by a compromised caller even without key extraction. No device, configuration, firmware, key or validation certificate was inspected.

## Actual renderer, gates and exposure probes

Source-only verification; no browser-open or entitlement test. Exact pure format/matcher/getEntry/split expressions run in memory. Matching is case-insensitive, longest-first, with ASCII-alphanumeric boundaries separately within inline-format segments. Bold OCSP, underlined ECC and highlighted HSM match. DH and DHE match independently; DHE/ECDHE matches DHE only, and CSRF is not CSR. Embedded/extended tokens and an ECC word split across formatting do not match the selected term.

Synthetic **ca. 2020** triggers CA despite meaning circa; **corporate social responsibility (CSR)** triggers CSR despite a business meaning. Neither exact phrase occurs in the checked local MCQ/PBQ/lesson prose. These expose context-insensitive matching limits, not fabricated observed learner exposure or evidence of no other collision. No renderer fix is made.

Focusable role-button spans use aria-expanded, click/Enter/Space toggles and outside-pointer close. No hover-only open path, independent account/Pro gate or recursive glossary inside the tooltip was found. Parent access/reveal gates still apply; accessibility and native event behavior require separate browser verification.

| Definition | Bound prior parent | Rendered field/gate |
| --- | --- | --- |
| CA | mcq:m043 | stem;selected_question_and_rendered_stem |
| CRL | mcq:m037 | options;selected_unsubmitted_question_and_rendered_options |
| CSR | mcq:m111 | options;selected_unsubmitted_question_and_rendered_options |
| DH | mcq:m206 | options;selected_unsubmitted_question_and_rendered_options |
| DHE | mcq:m705 | explanation;selected_submitted_Pro_question_and_rendered_explanation |
| ECC | mcq:m043 | options;selected_unsubmitted_question_and_rendered_options |
| HSM | mcq:m118 | options;selected_unsubmitted_question_and_rendered_options |
| OCSP | mcq:m037 | options;selected_unsubmitted_question_and_rendered_options |

Normal practice stems split context/question, both through GlossaryText; options render before submission. Submitted options and selected wrong feedback sit within disabled option buttons, so tooltip interaction is unverified. **DHE m705 is a submitted Pro explanation probe**, not a free option occurrence or glossary overlay on its card. The HSM probe binds the first visible sentence of keys-passwords-encryption section2 body[0]; the selected lesson/section currently requires Pro. The approved all-Domain1-free lesson gap stays held.

PKI section0 CRL/OCSP comparison labels/cells are **plain JSX** and excluded as glossary delivery proof. Flashcard faces are also plain text. Seven exact-acronym cards are prior disposition references, with raw/delivered and catalogue revisions bound; **no exact DH card exists**. No card, plain reveal, table, lexical usage link or opened tooltip becomes assessment or recovery evidence.

## Prior overlap and conflict preservation

**CA** compares with mcq:m005, mcq:m043, mcq:m410, pbq:p018, pbq:p052, section:pki-email-trust:0, flashcard:sy0701-acronym-crypto-keys-pki-ca-certificate-authority and paired MCQ/PBQ feedback: issuer vocabulary not trust anchor selection or full path validation. These are prior revisions, not additional dispositions.

**CRL** compares with mcq:m037, mcq:m110, mcq:m734, pbq:p052, section:pki-email-trust:0, flashcard:sy0701-acronym-crypto-keys-pki-crl-certificate-revocation-list and paired MCQ/PBQ feedback: list role repetition with authority scope freshness and full validity limits. These are prior revisions, not additional dispositions.

**CSR** compares with mcq:m111, pbq:p033, pbq:p052, flashcard:sy0701-acronym-crypto-keys-pki-csr-certificate-signing-request and paired MCQ/PBQ feedback: public key signed request not issuance identity approval or CSRF. These are prior revisions, not additional dispositions.

**DH** compares with mcq:m206, mcq:m106, pbq:p010, section:crypto-modes-pqc-transition:2, flashcard:sy0701-acronym-crypto-keys-pki-dhe-diffie-hellman-ephemeral and paired MCQ/PBQ feedback: generic agreement not ephemeral variant or authenticated handshake execution. These are prior revisions, not additional dispositions.

**DHE** compares with mcq:m106, mcq:m405, mcq:m705, mcq:m717, pbq:p049, pbq:p224, section:crypto-modes-pqc-transition:2, flashcard:sy0701-acronym-crypto-keys-pki-dhe-diffie-hellman-ephemeral, flashcard:sy0701-acronym-crypto-keys-pki-pfs-perfect-forward-secrecy and paired MCQ/PBQ feedback: same forward secrecy property repetition with authentication freshness and erasure premises. These are prior revisions, not additional dispositions.

**ECC** compares with mcq:m210, mcq:m206, section:crypto-modes-pqc-transition:3, flashcard:sy0701-acronym-crypto-keys-pki-ecc-elliptic-curve-cryptography, flashcard:sy0701-acronym-crypto-keys-pki-ecdhe-elliptic-curve-diffie-hellman-ephemeral, flashcard:sy0701-acronym-crypto-keys-pki-ecdsa-elliptic-curve-digital-signature-algorithm and paired MCQ/PBQ feedback: matched classical strength family not equal raw bits single operation or PQC. These are prior revisions, not additional dispositions.

**HSM** compares with mcq:m118, mcq:m622, mcq:m728, pbq:p018, pbq:p054, section:keys-passwords-encryption:2, flashcard:sy0701-acronym-crypto-keys-pki-hsm-hardware-security-module, flashcard:sy0701-acronym-crypto-keys-pki-tpm-trusted-platform-module and paired MCQ/PBQ feedback: module custody vocabulary not verified nonexportability or TPM enclave union. These are prior revisions, not additional dispositions.

**OCSP** compares with mcq:m037, mcq:m110, mcq:m734, pbq:p018, pbq:p052, section:pki-email-trust:0, flashcard:sy0701-acronym-crypto-keys-pki-ocsp-online-certificate-status-protocol and paired MCQ/PBQ feedback: real time full validity glossary error does not override qualified prior status dispositions. These are prior revisions, not additional dispositions.

The source-only usage inventory preserves every selected definition's lexical reference and marks previously dispositioned versus inspection-only records. Parent/feedback/card/lesson hashes remain exact. Glossary shorthand does not override prior signed-status, request/issuance, custody, algorithm-role, matched-strength or forward-secrecy qualifications. All relation/family credits and approved recovery remain zero. OCSP's unresolved authored-content conflict is reported and its precise link withheld; no approved behavior is changed.

## Exact census and validation

**235 candidates:212 prior +8 new =220 distinct pending dispositions;15 remain**, all glossary definitions. Exact remaining IDs in catalogue order:

- glossary:ah
- glossary:bios
- glossary:dkim
- glossary:dmarc
- glossary:dnssec
- glossary:ipsec
- glossary:mitm
- glossary:ngfw
- glossary:nips
- glossary:pem
- glossary:pfs
- glossary:s%2Fmime
- glossary:san
- glossary:tokenization
- glossary:tpm

Global package stays **1878 records/435 identities** (5 mastery/28 topic/402 support), **2954 queue rows**, **489 unresolved questions**, **7 existing primary proposals**. All earlier canonical/CIA/MAC/RBAC/TOU/MTTR/MTBF/FAR/MOA/MOU and crypto/keys/modes/PKI/algorithm/exchange/attack/RSA holds remain. Private p017 stays **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, trusted null, payload unavailable/unreviewed; no fresh read or substitute. New approved mappings, identities, primary mastery, evidence, weight and families are zero.

Run `node scripts/audit-objective14-pki-agreement-glossary.mjs` and `npm run audit:content-mapping`. The focused check binds definitions, rendered entries, authored/renderer units, exact23-to15 census, prior comparisons/feedback and usage revisions, eight MCQ field probes, one lesson-body probe, seven card references and excluded plain-table inspection. Negative checks reject stale revisions/location/parent, invented browser delivery, unsupported fields, scope/identity promotion, unqualified expanded teaching, OCSP link approval and any trusted/mastery/family/approval credit. Exact package/bank and **25 active release hashes** are unchanged. No active content/package/runtime/browser/database/learner/live/shadow/cohort/deploy/migration/Phase3 change. Task-only **[skip deploy]** push; Phase2B-5 stays **NOT READY**.
