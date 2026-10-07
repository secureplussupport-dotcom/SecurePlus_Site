# Phase 2B-5: objective 1.4 password-storage questions

**LOCAL SEMANTIC PROPOSALS — NOT READY.** Four effective MCQs and their four feedback bundles have pending agent dispositions. The complete broad objective-1.4 census contains **235 records**. Thirty exact revisions already have dispositions in eleven prior packets; this slice adds eight, bringing the total to **38**, with **197 remaining**. These counts measure review progress, not approved objective coverage or eligible mastery evidence. The unchanged master plan governs product decisions; the Phase 1 audit supplies historical implementation evidence. No unresolved product-decision conflict was found; no behavior changes here.

Baseline: `7c7da59c0d04851d6dde125d3eaf7fda9a370dec`. [Proposal packet](drafts/phase-2b5-objective14-password-mcq-proposals.json), SHA-256 `cb88cdfee8cbf4f6a6386f89572029c9d35e43519b9dd3acd9bcdc2910382ee2`. Each candidate has its exact effective-local and catalogue revisions, publication/trusted metadata and disposition status. The packet binds the prior review chain and deduplicates prior dispositions. It exports no question text, grading keys, private payloads or learner history.

## Exact candidate denominator

| Kind | Candidates | Prior | New | Remaining |
| --- | ---: | ---: | ---: | ---: |
| MCQ | 46 | 0 | 4 | 42 |
| PBQ | 11 | 0 | 0 | 11 |
| Feedback bundle | 57 | 0 | 4 | 53 |
| Flashcard | 40 | 13 | 0 | 27 |
| Glossary definition | 47 | 16 | 0 | 31 |
| Deck container | 3 | 1 | 0 | 2 |
| Lesson | 3 | 0 | 0 | 3 |
| Lesson section | 10 | 0 | 0 | 10 |
| Keyword guide | 3 | 0 | 0 | 3 |
| Trap bundle | 3 | 0 | 0 | 3 |
| Lesson check, including displayed generated checks | 12 | 0 | 0 | 12 |
| **Total** | **235** | **30** | **8** | **197** |

Prior support dispositions comprise the identity-authentication deck, thirteen cards and sixteen glossary definitions: AAA, CIA, DLP, EAP, encryption, IdP, MFA, NIST, OAuth, OIDC, PKI, SAML, SSO, TACACS+, TLS and VPN. They retain their original meanings, holds and zero weights. No prior objective-1.4 question or feedback disposition is counted. The packet lists all 197 remaining IDs. This census covers the effective package's broad tags; it does not infer coverage from untagged content or unavailable live/private payloads.

## Assessed decisions and feedback

All four retain objective 1.4. The [official SY0-701 objectives v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) name hashing, salting and key stretching under cryptography. Password-management context under 4.6 is not an additional assessed objective.

| ID | Actual assessed understanding | Feedback usefulness and qualification |
| --- | --- | --- |
| m004 | Recognize unique salts as protection against reused precomputed password tables. | Main correction separates precomputation from per-guess cost; three authored wrong-choice corrections address guessing cost, network interception and replay. Salt is not a secret key or session freshness control. No salt-generation, entropy or storage implementation is assessed. |
| m039 | Recognize hashing as having no decryption operation; distinguish reversible encryption, encoding and compression. | Feedback explicitly preserves guessing and digest comparison as possible attacks. The fixed-length description is conventional for this item, not a universal claim covering every extendable-output construction. No successful verifier implementation or password recovery is demonstrated. |
| m045 | Recognize bcrypt's configurable work factor as increasing offline guessing cost. | Corrections distinguish fast general-purpose hashing and reversible encryption from password hashing with a work factor. This tests recognition, not cost selection, benchmark calibration, memory hardness or universal algorithm suitability. Weak passwords remain guessable. |
| m104 | Select the offered salted password-hashing scheme that meets nonreversible storage and distinct stored values for equal passwords. | Feedback adds work-factor teaching, but the stem does **not independently require a cost threshold**. Its contrasts address reversible encryption, unsalted fast hashing and reversible encoding. No modern algorithm-selection, input-limit, pepper, tuning or migration competence follows. |

Unique salts frustrate reused precomputation; a work factor increases the expense of guessing. Hashing does not have a decryption operation, yet low-entropy secrets can still be guessed. These qualifications align with [NIST SP 800-63B-4, §3.1.1.2](https://pages.nist.gov/800-63-4/sp800-63b.html) and the [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). OWASP's modern deployment guidance prefers Argon2id or scrypt and treats bcrypt as a legacy option; identifying bcrypt among this item's choices is not a universal deployment recommendation. No teaching or answer text is edited here.

Each bundle contains one main correction and three authored wrong-choice corrections, read in full. The actual wrong-feedback helper returns those corrections without its fallback. Feedback remains conditional instruction with zero weight, not extra assessments. Existing hashing, salting, encryption and MD5 support identities are linked only where they teach or contrast the parent decision. There is no assessed secondary credit from distractors, and no invented bcrypt identity. Mentioning hashing does not assess file integrity, authenticity, signatures or certificate validation; contrasting encryption does not establish confidentiality mastery.

## Source precedence, delivery and independence

Authored, pre-editorial snapshot-merged, effective-local and published-catalogue revisions are recorded separately. Neither bound snapshot nor authenticated capture contains an item-specific override for these four IDs. The effective editorial pipeline supplies the reviewed wording and feedback. In particular, m045 retains its effective **easy** label rather than the older authored medium label; m104's effective wrong-choice corrections are present despite their absence in the authored input. Published records add `_baseOrder`; removing it reproduces each exact effective semantic object. Compiler-derived trusted IDs match catalogue metadata, without conveying mapping approval or live-deployment proof. No fresh production query is made.

The source renderer selects an existing question through the practice pool, starts a set and displays its stem/options. Guest practice remains possible. Main explanations require submission and Pro; inline wrong-option detail additionally requires the selected option to be wrong. All wrong corrections are not displayed simultaneously. This is source inspection, not a fresh browser or learner-session test. Nested glossary triggers inside submitted disabled option buttons remain browser-unverified. No grading, persistence, entitlement, analytics or remote-fetch handler is invoked.

The focused check executes the real shuffler with fixed local randomness, verifies preserved keyed meaning and checks correction-to-option remapping. A different display order does not create independent evidence. The four provisional family labels distinguish salt purpose, hash representation, guess cost and composite storage constraints. m104 reuses hashing/salt understanding from the other questions; its work-factor feedback does not make cost an independently required stem outcome. Shared password-storage context remains correlated. All family-independence decisions are pending, with zero new family credit.

Exact prior comparisons preserve encryption/MFA/PKI/TLS support dispositions and the m649 approval-record question/feedback. Hashing as an approval-evidence contrast does not assess password representation. Repeated vocabulary, linked feedback and option permutations do not become fresh families.

Single-miss local fixtures return `keys-passwords-encryption` and `crypto-modes-pqc-transition` for each selected question. These are current selector outputs only; this slice performs no new semantic lesson review or validated remediation assessment. Objective/topic/lexical routing does not confer mastery or prove that either lesson repairs the specific miss.

The only five mastery identities available remain BIA, MTD, MTTR, RPO and RTO. None encodes these password-storage decisions: all four primary mastery proposals are **null**, all assessed secondary roles are empty, and all weights are zero. No topic/support promotion or new taxonomy is proposed. Prior CIA/MAC/RBAC/TOU ambiguities, withheld MTTR linkage, unverified MTBF delivery, FAR common-word collision and withheld MOA/MOU precise links remain unchanged.

## Validation and remaining gate

Validation passed: `node scripts/audit-objective14-password-mcq.mjs`, all 29 tests in `npm run audit:content-mapping` and exact package reproduction. The focused check binds the 235/30/8/38/197 census, exact revisions and source precedence, actual conditional feedback gates, authored corrections, source difficulty labels, permutation/remapping, prior comparisons and selector outputs. Negative checks reject stale revisions, invented primary/trusted identities, distractor credit, scope/family/difficulty promotion and ungated feedback claims. It verifies all 25 release checksums remain unchanged and the report binds the exact packet hash. The Vercel `[skip deploy]` guard passed; staged diff whitespace is checked before committing.

There remain **42 MCQs, 11 PBQs, 53 feedback bundles and 91 instructional/support records** in this broad census. Encryption modes, key lifecycle, signatures, certificates, PKI, hardware/security modules and other cryptographic decisions need their own source-bound assessment and teaching review. These four questions do not demonstrate full objective coverage or secure password-storage implementation. Algorithm choice, practical parameter/input limits and family independence remain separate pending review decisions, not active fixes.

The active package remains SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`: 1,878 records, 435 concepts (5 mastery, 28 topic, 402 support), **2,954 review decisions**, **489 unresolved question mappings**, seven existing primary proposals. Approved new mappings and eligible evidence remain **zero**. Private selected p017 remains unavailable at `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted revision null, with no fresh query or fallback substitution.

Commit/push only this packet, report and focused check with `[skip deploy]`; preserve unrelated dirt. Adaptive remains unpublished, unwired, default-off and learner-invisible. No live migration, deployment, activation, shadow writes, cohort change, credentials, pricing/legal or Phase 3 change is authorized. **Phase 2B-5 and production migration remain NOT READY.**
