# Phase 2B-5 — final local objective 1.4 PBQs

Baseline `6aa5a53ebebdbb890dfceed2c0fb5965310a89f9`. **LOCAL_SEMANTIC_PROPOSALS_NOT_READY.** One bounded offline slice reviews p037/p049/p224 and three feedback bundles. Approved master-plan product decisions and verified Phase 1 historical implementation facts remain authoritative within their scopes. No unresolved conflict or behavior change is introduced. Pending agent dispositions are not owner approval, active mappings or eligible evidence.

Packet SHA-256 `67dc31de331b3a5dcaeae140683354e3afa0f3cb30971a68086bed3006bb5056`. Exact source bindings include 21 prior packets, the prior terminal report/audit, source grading/delivery units, package, master plan, Phase 1 and release manifest. Prior question/feedback/instruction rows are deduplicated by record ID; comparison-only/inspection inventories never count as dispositions.

## Effective meanings and scope

| PBQ | Effective format / difficulty | Decision count | Trusted revision | Trusted content SHA-256 |
| --- | --- | --- | --- | --- |
| p037 | HOTSPOT / easy | 1 | null — hotspots rejected | null |
| p049 | SCENARIO / medium | 1 | fe8fca4a-4b46-8056-8643-98a8add332b6 | fe8fca4a4b462056064398a8add332b66071c410e9f4fb0338dc2c0641e58df0 |
| p224 | SCENARIO / medium | 1 | e39e92d7-639c-8566-ad21-ab14aaf78c58 | e39e92d7639c8566ad21ab14aaf78c582d3a5e3e863689eac0387a0b73062ca7 |

**p037:** Select salted, cost-tuned password hashing and matching-library verification to replace reversible base64 storage under the stated database-read threat, rather than timing comparison, UI renaming or transport-only protection. Base64 is reversible encoding. A salt reduces reusable precomputation; the password-hashing work cost raises per-guess effort. Password guessing remains possible. The item chooses a storage remedy, not an algorithm parameter, library implementation, database migration or executed security test. The diagram is static text and its four hotspot annotations create no separate target scores or subskills. Constant-time comparison and TLS address different risks.

**p049:** Select the supplied combined TLS protocol/suite change removing deprecated versions and static-RSA/3DES suites while retaining approved TLS 1.2 ECDHE-AEAD and TLS 1.3 support; one combined decision, not independently scored findings. This is a proposed configuration-change recognition from supplied text, not an applied server policy, observed negotiation, scan, compatibility test or proof of secure deployment. Static RSA transport differs from RSA signatures with ephemeral agreement. HSTS or certificate expiry alone does not repair the listed protocol/suite choices. No blanket DHE/CBC endorsement, fixed certificate lifetime, current key-size policy or full TLS-security assessment follows.

**p224:** Choose authenticated ephemeral key agreement for past recorded TLS sessions to resist later long-term authentication-key theft under the supplied session-secret-erasure premise; reuse the earlier forward-secrecy decision family. The current scenario specifies static RSA key transport, authenticated ephemeral agreement and secret erasure. Historic wording that the server private key encrypts transported session keys is superseded: RSA transport encrypts premaster material with the public key and decrypts with the private key. Forward secrecy is conditional on suitable parameters, authenticated peers and ephemeral-secret management; it is not protection against an active compromised endpoint, retained session secrets or every future session. No configuration, handshake, key erasure or recovery-clock skill was executed.

[CompTIA SY0-701 v7 objective 1.4](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) includes hashing, salting, key stretching, transport encryption and key exchange. These items cover narrow decisions in those subjects. No separate code-analysis/hardening objective, full-objective coverage or observed implementation is inferred. Effective p037 easy/p049 medium/p224 medium labels are retained without calibration; raw medium/hard labels do not regain authority through format or scenario length.

The offline password qualification is supported by [NIST SP 800-63B-4 §3.1.1.2](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/#passwordver): salts and password-hashing cost address offline guessing, without guaranteeing guessing is impossible. [RFC 8996](https://www.rfc-editor.org/rfc/rfc8996.html) deprecates TLS 1.0/1.1. [RFC 9325 §§4.1–4.2,7.3–7.4](https://www.rfc-editor.org/rfc/rfc9325.html) supports the static-RSA/legacy-suite and ephemeral-agreement qualifications; the listed DHE/CBC suite is not a blanket endorsed fallback. [RFC 5246 §7.4.7.1](https://www.rfc-editor.org/rfc/rfc5246.html#section-7.4.7.1) specifies public-key encryption of premaster material in RSA transport. These are semantic checks, not new server policy, compatibility measurements or compliance certification.

## Authored, snapshot, capture and editorial precedence

p037/p049 have authored literals, no imported duplicate, item-specific snapshot or historical authenticated capture. Their authored/pre-editorial hashes agree, and effective review changes supersede old base64 comparisons, broad TLS vulnerability labels and the claim that all prior sessions are exposed regardless of their negotiated exchange. Editorial review merges published/second-pass/concise overlays, then applies the existing pure enhancement/feedback normalization. The effective concise main explanations and three individual wrong corrections are checked; a longer superseded correction is not substituted.

p224 has **no authored or imported literal**. A captured active upsert supplies its local snapshot before editorial review. Exact historical stages:

| Stage | Fingerprint / metadata |
| --- | --- |
| Snapshot payload and pre-editorial local record, canonical JSON | sha256:a74fc17ae0e44e6afd25915c974111b5a7e1408a0a18dbf5b3d652e155874af7 |
| Snapshot row, canonical JSON | sha256:22bbdd92e6a03f1ca10d5dc29a3408c457804cf6ad212bde4a0928a3a8e68058 |
| Historical authenticated payload, recorded PostgreSQL jsonb::text | 5b0f69faa1a5ef759765e0008e2f08df717d8e64d4f48e3d168f2158b254c93d |
| Capture timestamp / action / status / admin ordering | 2026-07-11T15:43:51.216+00:00 / upsert / active / 107 |
| Local effective editorial/enhanced record | sha256:14e740ec6a5ed28dc805cf07ccfb2210bd7e66dde05f4301b574b2ee0c6cc427 |
| Published effective record, including ordering | sha256:db32771446da017f058a36c3573192dd7eae644061ba57b8b7a5231b9009390e |

Recorded reconciliation says capture identity/payload matched using PostgreSQL serialization; its fingerprint is not the local canonical hash. No PostgreSQL query, refreshed private payload or fresh authentication is performed here. The exact snapshot payload can be reapplied to the pure publication function and is ignored as superseded content; its ordering is retained. The old private-key-encrypts-transport claim and formatting debris do not return. The separate remote merge preserves effective editorial content for older revisions and allows a future admin revision; fingerprints do not prove current live deployment.

## Actual grading and static delivery

All four choices and no-choice fixtures use the **actual extracted** practice whole/part/completeness and exam correctness/answered expressions. One correct choice scores 1/1; each of three wrong choices scores 0/1. An evidence diagram or arbitrary typed terminal text with no choice is insufficient to submit/count as answered. Practice saves a binary single-part ratio; its per-part marking pane is hidden for these choice questions. None has independently scored configuration, protocol, diagram location or crypto operations.

p049/p224 compile as **coarse whole-question single-choice** with four option components. Stable trusted correctness/score match practice/exam for every choice. Empty selection, mismatched option/value, multiple choices and tampered revision integrity are rejected. p037's original published record rejects **Unsupported question field: hotspots**; trusted revision/content hash and trusted scores remain null. No fields are stripped, source replaced or revision fabricated to obtain trust. Pure negative fixtures changing hotspot flags and removing diagram text leave the existing selected-choice grading unchanged; changed source content still cannot substitute for the exact reviewed revision.

p037's four hotspot annotations are metadata; practice displays its pseudocode in the expandable static evidence viewer then renders q.question and choice buttons. No hotspot target clicks or separate hotspot answers are wired. The diagram stays available after submission. Exam displays the same supplied diagram during answering and grades only its selected choice; the expanded completed option review does not re-render the diagram. p049's TLS configuration is supplied scenario prose, not an editable server configuration or execution workspace. p224 is likewise scenario and choices. No source pseudocode, command, database migration, hash, key exchange or TLS negotiation was executed.

All three are outside the p001 free preview. Practice uses existing Pro/coin access; exam startup uses Pro or a consumed voucher and samples its existing eligible pool separately from individual coin unlocks. No entitlement/payment was exercised. Scenario/question/choices and static evidence assertions are source-bound, not browser delivery verification. Exam strips hints; no fresh learner session, saved result, telemetry or sync handler is run.

## Feedback, families and zero-credit boundary

Each feedback bundle binds parent local/published/trusted identities, the effective main correction, three authored wrong corrections and all four option explanations. Submitted accessible practice shows every option without a separate Pro feedback gate. Main correction appears through the correct-option card; its duplicate standalone panel is suppressed. Completed exam option teaching requires expanding the PBQ card and likewise suppresses that standalone main panel. Teaching after a miss is source-reasoned, not measured recovery or separate assessed evidence.

p037 corrections distinguish stolen reversible storage from timing side channels, column/UI visibility and network transport. p049 corrections distinguish protocol/suite repair from disabling modern TLS, certificate lifetime changes or HSTS alone. p224 corrections distinguish ephemeral establishment from password work cost, unchanged static-key pinning or a certificate signature hash. No distractor creates a secondary assessed concept. Existing hashing/salting/TLS/RSA/ECDHE/certificate support links remain zero-weight; unavailable precise identities are not invented.

p037 **reuses** m104's salted nonreversible password-storage choice family, with m039/m045/m211/m624/m042/p005 as related password/role teaching. It adds no new hotspot family or separately scored salt/work-factor subskills. p224 **reuses** m705/m717's past-session forward-secrecy family. p010's grouped handshake order is related, not proof of operational competence. p049 proposes one combined TLS remediation family pending independence review against those forward-secrecy decisions, m212 AEAD, m005 trust and p010 workflow order. p049/p224 overlap on static-RSA limitations; format, part counts, repeats, hints and corrections add no independent family. Next-related empty-history source probes: p037→p060, p049→p021, p224→p021; no approved remediation.

Primary mastery remains null; assessed/secondary canonical roles and partial weights remain empty. New mastery weights, owner approvals, family credit and eligible evidence are **zero**. All inherited canonical ambiguities/holds and the five available BIA/recovery mastery identities remain unchanged.

## Exact census and remaining gate

**235 candidates; 138 prior +6 new =144 distinct pending agent dispositions.** New: **3 PBQs +3 feedback**, zero MCQs/instruction records. Remaining **91**, all instruction/support: **2 decks,27 flashcards,31 glossary definitions,3 keyword guides,3 lessons,12 checks,10 sections,3 trap groups**. **0 local objective-1.4 MCQs,0 PBQs,0 paired feedback** remain unreviewed. This completes local question/feedback disposition only; 46 MCQs,11 PBQs and57 feedback bundles are not owner-approved coverage.

The global package is unchanged:1878 records,435 identities (5 mastery/28 topic/402 support),2954 queue rows,489 unresolved question mappings,7 existing primary proposals. Private p017 remains `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted null, payload unavailable, no refreshed read or local fallback substitution.

Run `node scripts/audit-objective14-final-pbqs.mjs` and `npm run audit:content-mapping`. Focused deterministic checks cover exact source stages/capture serialization, original compiler rejection, choice grading, static delivery/feedback gates, prior-family comparison, negative promotions, census/remaining set and **25 unchanged release hashes**. No active package, runtime/config, browser, database, learner, deployment, production migration, live/shadow/cohort/activation or Phase 3 change. Push only packet/report/audit with **[skip deploy]**, preserving unrelated dirt. Phase 2B-5 remains **NOT READY**.
