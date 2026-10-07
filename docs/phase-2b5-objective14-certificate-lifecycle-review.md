# Phase 2B-5: objective 1.4 certificate lifecycle

**LOCAL SEMANTIC PROPOSALS — NOT READY.** Eight effective MCQs and eight answer-linked feedback bundles have pending agent dispositions. The unchanged broad objective-1.4 census contains **235 records**. Fourteen prior packets account for **70 exact-revision dispositions**; this slice adds sixteen, bringing the total to **86**, with **149 remaining**. Counts measure review, not approved coverage or eligible evidence. The unchanged master plan governs product decisions; the Phase 1 audit supplies historical implementation evidence. No unresolved product-decision conflict was found; no behavior changes here.

Baseline: `4c0cdb21a96570b9ae1f356a4abb29fd2513a06f`. [Proposal packet](drafts/phase-2b5-objective14-certificate-lifecycle-proposals.json), SHA-256 `a0985e8b84c69b0d70cd1ecdb35d887a207cad5bdf83195aa4193a0bf2e14fae`. It binds exact local/catalogue/trusted revisions, prior dispositions, all selected and remaining IDs, source/delivery/selector bindings and negative dispositions. No literal question text, grading keys, private payloads or learner history is exported in the packet.

## Exact denominator

| Kind | Candidates | Prior | New | Remaining |
| --- | ---: | ---: | ---: | ---: |
| MCQ | 46 | 20 | 8 | 18 |
| PBQ | 11 | 0 | 0 | 11 |
| Feedback bundle | 57 | 20 | 8 | 29 |
| Flashcard | 40 | 13 | 0 | 27 |
| Glossary definition | 47 | 16 | 0 | 31 |
| Deck container | 3 | 1 | 0 | 2 |
| Lesson | 3 | 0 | 0 | 3 |
| Lesson section | 10 | 0 | 0 | 10 |
| Keyword guide | 3 | 0 | 0 | 3 |
| Trap bundle | 3 | 0 | 0 | 3 |
| Lesson check, including displayed generated checks | 12 | 0 | 0 | 12 |
| **Total** | **235** | **70** | **16** | **149** |

Selected: **m043, m037, m110, m111, m112, m221, m222 and m411**, each with its `explanation:mcq:<id>` bundle. All are exact remaining IDs from the prior custody/PKI/signature packet and directly test certificate-lifecycle decisions. No quota filling or prior-disposition duplication is needed. The packet lists all 149 remaining IDs. This census covers broad effective local package tags, not untagged content or unavailable production/private payloads.

## Assessed decisions, skill roles and feedback

All retain MCQ format and objective 1.4. No additional assessed objective is inferred. The [official SY0-701 objectives v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) covers certificate/PKI decisions within cryptography; these items remain recognition or bounded inference, not executed validation.

| ID / difficulty | Actual assessed decision | Correction usefulness and negative disposition |
| --- | --- | --- |
| m043 / medium | Infer that an unconfigured internal issuer is the most likely certificate-warning cause for an ordinary public client. | Feedback explains accepted-root trust and managed/private versus ordinary public use. A generic warning does not uniquely prove the cause; expiry or other policy/name/path failures remain possible. The RSA family name does not guarantee acceptance of every parameter choice. No client configuration is inspected or root installed. |
| m037 / easy | Recognize individual OCSP status querying rather than downloading a revocation list. | Main correction preserves freshness limits; wrong feedback contrasts CRL, pinning and escrow roles. No response applicability/signature/authorization is validated, no instantaneous or complete certificate-validity claim, and no recovery credit from escrow. |
| m110 / easy | Recognize OCSP querying with compromise/revocation supplied as context, distinct from CSR or CAA. | Corrections separate status, issuance requests and issuer policy, preserving cache/publication delays. The framing does not demonstrate compromise investigation, completed revocation, response validation or incident recovery. |
| m111 / easy | Identify the CSR containing applicant public key and identity details, with the private key retained. | Wrong corrections distinguish CRL, the request's signature alone and a root certificate. Request signing is not independent identity validation or issuance approval. No key generation/custody, signed-request construction, CA workflow or installation occurs. |
| m112 / medium | Identify CAA as DNS-based issuer-authorization policy for compliant CAs. | Corrections distinguish DNSSEC, stapling and transparency logs. Issuer compliance and trustworthy DNS matter; CAA cannot cryptographically stop a malicious CA from signing and is not browser revocation validation. No DNS policy processing or monitoring is executed. |
| m221 / easy | Recognize a wildcard marker in the stated SAN DNS name. | Feedback teaches one-label limits and exclusions for apex/multiple levels. Those limits are teaching, not independently assessed hostname-matching cases. The marker proves neither EV identity checks, self-signing, issuer trust, time nor revocation status. |
| m222 / medium | Choose revocation/replacement of a compromised intermediate and affected chain while preserving the uncompromised root. | Corrections explain why leaf replacement alone or waiting is insufficient and root rebuilding is unnecessary under the premise. Root soundness is assumed; dissemination, reissuance, key replacement and client behavior remain unperformed. PKI recovery wording does not assess a recovery clock or successful restoration. |
| m411 / medium | Recognize server-stapled signed, time-bounded status delivery during TLS rather than a separate client query. | Corrections distinguish a local CRL, CAA and CT. Applicability, authorized signer, signature and freshness still require validation. Fewer lookups does not imply zero delay, complete trust, a universal failure policy or configured TLS deployment. |

A CSR includes request information and an applicant signature; CA identity validation is a separate step. [RFC 2986, §3](https://www.rfc-editor.org/rfc/rfc2986). CAA's effectiveness depends on issuer observance and expresses issuance policy rather than removing reliance on mis-issued certificates. [RFC 8659, §5](https://www.rfc-editor.org/rfc/rfc8659). Modern TLS identity matching uses SAN identifiers; a supported wildcard matches one complete left-most label. [RFC 9525, §6.3](https://www.rfc-editor.org/rfc/rfc9525). OCSP acceptance includes certificate correspondence, signature, signer authorization and freshness. [RFC 6960, §3.2](https://www.rfc-editor.org/rfc/rfc6960). Configured trust anchors and revocation processing remain distinct from a protocol name. [RFC 5280, §§6.1–6.3](https://www.rfc-editor.org/rfc/rfc5280). No active content or policy is edited.

All eight effective stems, options, keys, main explanations and authored wrong corrections were read in full. Each bundle contains a main correction and three specific wrong-choice corrections. The real feedback helper returns them without fallback; the real shuffler keeps corrections attached to their options. Existing PKI/OCSP/CRL/CSR/DNSSEC/SAN/certificate support identities receive only zero-weight teaching or contrast links. No assessed secondary role, new CAA/wildcard identity or promoted topic/support mastery is created. Feedback and permutations do not add independent assessments.

## Source precedence and conditional delivery

All eight have local authored literals, with pre-editorial inputs matching those literals and **zero item-specific snapshot/authenticated-capture rows** in the bound sources. Their effective editorial revisions differ and remain authoritative for the reviewed teaching. Older m037/m110/m411 wording asserted real-time status; current wording preserves caching/freshness limits. m112's old stem overclaimed protection against rogue/compromised CAs; the effective version limits the outcome to compliant-issuer policy. m221 moves its identifier from old CN framing to SAN. m222 retains its supplied compromise scenario while qualifying the affected-chain response. These are existing source-history differences, not newly applied edits or unresolved product requirements.

Observed difficulties remain medium/easy/easy/easy/medium/easy/medium/medium respectively. Do not restore older medium labels for m037/m110/m111 or the older hard label for m112. No calibration or competence-transfer claim follows. Published records add only `_baseOrder`; stripping it reproduces exact local semantic content. Catalogue/trusted compiler identities are retained without inventing approved mappings or live-deployment proof. No fresh browser, database, production or learner-state inspection is performed.

The bound renderer selects the existing practice pool and starts a set before displaying a question; guest practice can use that pool. Main explanations require submission and Pro; wrong-option detail also requires the selected option to be wrong. All wrong corrections are not simultaneously displayed. Source inspection does not establish browser interaction; nested glossary triggers inside disabled submitted option buttons stay unverified. Isolated pure source-helper probes do not invoke session/grading/persistence/entitlement/analytics/remote-fetch handlers or alter active state.

## Families, six prior neighbors and teaching

Seven provisional decision groups cover trust diagnosis, individual status protocol, request document, issuer policy, wildcard marker, intermediate-compromise action and stapled delivery. **m037/m110 reuse the prior m734 OCSP group**: different distractors or revoked-key context do not create fresh independent families. Stapling is a different delivery question, not a stronger or complete validation outcome. CSR, CAA, wildcard and compromise steps likewise do not collectively prove executed full validation.

All six earlier comparison-only neighbors were reconciled at unchanged exact revisions. **m043/m037/m110 now receive full pending question/feedback dispositions** as part of the selected sixteen records; their earlier comparisons counted zero. **m622/m208/m406 remain comparison-only**, because hardware-appliance recognition, missing origin authentication and target-device signature benchmarking do not directly assess this certificate-lifecycle scope. Their question/feedback records remain in the 149 candidates. No comparison itself contributes a disposition or family credit.

Prior m005/m238/m410 keep their chain/trust/inference meanings; m734 keeps its status-protocol group. Prior signature/key-use/forward-secrecy and PKI/TLS support dispositions remain unchanged. A CSR signature or trusted-CA label is not independent identity validation, confidentiality, qualified non-repudiation or successful key custody. Intermediate “recovery” and escrow context grant no RTO/RPO/MTD/MTTR/BIA evidence.

Single-miss fixtures return `pki-email-trust` then `keys-passwords-encryption` for all eight. Those are exact legacy selector outputs, not approved teaching or demonstrated remediation. The three crypto lessons/support surfaces need their own semantic, delivery and usefulness reviews.

## Validation and remaining gate

Validation passed: `node scripts/audit-objective14-certificate-lifecycle.mjs`, all 29 tests in `npm run audit:content-mapping` and exact package reproduction. The focused check binds 235/70/16/86/149, all exact selected/remaining IDs, fourteen prior packets, unchanged source selection, zero selected captures, trusted/compiler identities, actual conditional feedback gates, authored correction/remapping, observed difficulty/skill roles, prior OCSP family reuse and all six neighbor outcomes. Negative cases reject stale revisions, invented primary/authored/trusted identities, assessed distractor links, scope/family/difficulty/skill promotion and ungated feedback. It binds explicit negative dispositions, all 25 unchanged release hashes, report/packet hash and private p017's null trusted revision. The Vercel `[skip deploy]` guard passed; staged whitespace is checked before committing.

Remaining objective-1.4 candidates: **18 MCQs, 11 PBQs, 29 feedback bundles and 91 instructional/support records**. Remaining questions cover password/salt/precomputation variants, hashing/collision/integrity, recipient-key and origin variants, device signature-performance choice, HSM naming, at-rest protection, key length/quantum qualifications, steganography and tokenization. All eleven PBQs and crypto instruction/support still require bounded semantic review; this slice claims neither full objective coverage nor an approved deployment capability.

The active package remains SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`: 1,878 records, 435 concepts (5 mastery, 28 topic, 402 support), **2,954 review decisions**, **489 unresolved question mappings**, seven existing primary proposals. The only mastery identities remain BIA, MTD, MTTR, RPO and RTO. All eight primary proposals are null, assessed secondary roles empty, weights/family credit zero; approved new mappings and eligible evidence zero. Prior CIA/MAC/RBAC/TOU ambiguities, withheld MTTR, unverified MTBF, FAR collision and MOA/MOU holds are unchanged. Private selected p017 stays unavailable at `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted revision null, no query or fallback substitution.

Commit/push only this packet/report/check with `[skip deploy]`; preserve unrelated dirt. Adaptive stays unpublished, unwired, default-off and learner-invisible. No active package/runtime/browser/database/learner/live-state/cohort/deployment or Phase 3 change occurs. **Phase 2B-5 and production migration remain NOT READY.**
