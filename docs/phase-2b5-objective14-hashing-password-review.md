# Phase 2B-5: objective 1.4 hashing and password derivation

**LOCAL SEMANTIC PROPOSALS — NOT READY.** Seven effective MCQs and seven answer-linked feedback bundles receive pending agent dispositions. The unchanged broad objective-1.4 census contains **235 records**. Fifteen prior packets account for **86 exact-revision dispositions**; fourteen new records bring the total to **100**, with **135 remaining**. These are review counts, not approved coverage or eligible evidence. The unchanged master plan governs product decisions and the Phase 1 audit supplies historical implementation evidence. No unresolved product-decision conflict was found; no behavior changes here.

Baseline: `9eac2c9c13049ed381caa59cee1b87db4f9c6fb3`. [Proposal packet](drafts/phase-2b5-objective14-hashing-password-proposals.json), SHA-256 `3dc23520359035e91a10ac4a6e6f864782a0032e23ae40fcd2236b87f32d7a88`. The packet binds local/authored/pre-editorial/catalogue/trusted revisions, prior dispositions, all selected and remaining IDs, conditional delivery and negative dispositions. It exports no literal grading content, private payloads or learner history.

## Exact denominator

| Kind | Candidates | Prior | New | Remaining |
| --- | ---: | ---: | ---: | ---: |
| MCQ | 46 | 28 | 7 | 11 |
| PBQ | 11 | 0 | 0 | 11 |
| Feedback bundle | 57 | 28 | 7 | 22 |
| Flashcard | 40 | 13 | 0 | 27 |
| Glossary definition | 47 | 16 | 0 | 31 |
| Deck container | 3 | 1 | 0 | 2 |
| Lesson | 3 | 0 | 0 | 3 |
| Lesson section | 10 | 0 | 0 | 10 |
| Keyword guide | 3 | 0 | 0 | 3 |
| Trap bundle | 3 | 0 | 0 | 3 |
| Lesson check, including displayed generated checks | 12 | 0 | 0 | 12 |
| **Total** | **235** | **86** | **14** | **135** |

Selected: **m042, m116, m207, m211, m403, m404 and m624**, each with its `explanation:mcq:<id>` bundle. All seven are exact remaining IDs in the prior certificate-lifecycle packet. The eighteen remaining MCQ stems were inspected for selection; only these seven directly assess hashing/collision/digest/salt/precomputation/derivation. The other eleven questions remain pending. No eighth question is forced into scope, and selection inspection does not itself count as a disposition. This census covers broad effective local package tags, not untagged content or unavailable production/private payloads.

## Assessed decisions, skill roles and feedback

All retain MCQ format and objective 1.4. The [official SY0-701 objectives v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) places hashing, salting and key stretching within cryptography. None of these recognition decisions demonstrates executed derivation, attack, authentication or file verification.

| ID / difficulty | Actual assessed decision | Correction usefulness and negative disposition |
| --- | --- | --- |
| m042 / medium | Recognize reuse of a covered precomputed table in the supplied unsalted-MD5 scenario. | Corrections distinguish new dictionary/brute-force guesses and login credential stuffing. Table coverage and hash settings bound usefulness; no universal best attack, instant success, guaranteed recovery or hash decryption. |
| m116 / easy | Identify MD5's practical collision weakness where collision resistance is required. | Corrections distinguish the other algorithm families and separate collision resistance from password-guessing cost. No all-context MD5/HMAC judgment, preimage reversal or suitable password storage follows from the algorithm name. |
| m207 / medium | Identify difficulty finding any colliding input pair as collision resistance. | Wrong corrections distinguish a supplied digest, specified input and avalanche behavior. Resistance means computational infeasibility, not mathematical impossibility. Preimage and second-preimage are instructional contrasts, not independently assessed secondary skills; a preimage need not be the original input. |
| m211 / easy | Identify prevention of reusable precomputation as salt's primary purpose. | Corrections distinguish digest length, decryption and per-guess work cost. Public salts do not stop guessing or replace a suitable password hash/work factor. This repeats m004's decision; no new independent family. |
| m403 / easy | Name the published file-derived value as a cryptographic hash digest. | The main correction requires a trusted reference and preserves safety/origin limits. Naming the value does not execute a comparison or authenticate its publisher. Control of both file and reference permits replacement of both; no absolute every-modification claim. |
| m404 / medium | Identify salt's precomputation purpose despite supplied salt length and work-factor context. | Corrections separate public salt from guess cost, reversible encryption and length hiding. This repeats m004/m211; the given length is context, not tested entropy or parameter calibration. Historical PBKDF2/HMAC-SHA256/600,000 wording is not current configuration approval. |
| m624 / easy | Name salting as the per-record random-value technique. | Corrections distinguish stretching, obfuscation and private-key signing. The technique name does not demonstrate derivation or assess stretching independently. Public salt plus suitable hashing/work cost still permits guessing; no additional approved independence. |

MD5 collision weakness is distinct from preimage resistance and HMAC/password-storage requirements. [RFC 6151, §§1–2](https://www.rfc-editor.org/rfc/rfc6151). Collision resistance concerns any colliding pair; preimage resistance starts from a given hash output. [NIST collision resistance](https://csrc.nist.gov/glossary/term/collision_resistance), [NIST preimage resistance](https://csrc.nist.gov/glossary/term/preimage_resistance). Password salts prevent reusable precomputation; a suitable derivation scheme and cost factor address guessing cost. [NIST SP 800-63B-4, §3.1.1.2](https://pages.nist.gov/800-63-4/sp800-63b.html), [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). This review makes no new algorithm or parameter deployment recommendation.

All seven effective stems, options, grading keys, main explanations and three specific wrong corrections were read in full. The real feedback helper returns authored corrections, and the real shuffler preserves the answer and option-to-correction association. Existing rainbow-table/salting/hashing/MD5/collision-attack support identities receive only zero-weight instructional support or contrast links. No assessed secondary role, invented preimage/PBKDF2 identity, mastery promotion or independent feedback assessment is proposed. Usefulness remains reasoned correction, not measured learning recovery.

## Exact source precedence and conditional delivery

All seven local authored literals exist. Six pre-editorial versions match their authored inputs and have zero item-specific snapshot/authenticated-capture rows. **m404 has all three stages**: authored literal, a different captured snapshot antecedent, and a different current effective editorial revision. Its recorded snapshot timestamp is `2026-07-04T08:27:25.739+00:00`; captured PostgreSQL-content SHA-256 is `21da0457fea70236033de8370d0d86e36919738af060fa17acbaee8de51056d5`, with captured sort order 289. Existing reconciliation reports matching capture signature and payload. This is bound historical evidence, not a fresh database read. PostgreSQL `jsonb::text` hashing and canonical local JSON signatures use different serialization; they are not directly equated.

m404's older authored/captured text names PBKDF2, HMAC-SHA256 and 600,000 iterations; the captured correction overclaimed defeating bulk cracking. Effective teaching instead separates precomputation reuse from expensive new guesses. Recorded snapshot replay preserves editorial precedence. Published versions add only `_baseOrder` and, for m404, `_adminOrder`; stripping those reproduces local semantic content exactly. Catalogue and trusted compiler fingerprints remain observations, not approved mappings or deployment proof.

Other existing source changes qualify m042's old universal-effectiveness/latency framing, m116's broad broken-algorithm claim, m207's absolute reverse-input phrasing, m211's old output/module-validation distractors, m403's absolute modification claim and m624's generic repeated correction. Current difficulties remain **medium/easy/medium/easy/easy/medium/easy**. No older hard/medium label is restored or calibration claimed. No active content is edited.

The source-bound renderer selects the existing practice pool and starts a set before displaying a question; guest practice remains available. Main feedback requires submission and Pro. Wrong-option detail additionally requires the selected option to be wrong; all wrong corrections are not displayed simultaneously. Source inspection does not prove browser interaction, and nested glossary triggers inside disabled submitted option buttons remain unverified. Pure isolated helper probes invoke no learner session, persistence, entitlement, analytics, database or remote-fetch handler.

## Families, prior comparisons and teaching routes

Six provisional decision groups cover precomputed-attack recognition, MD5 collision weakness, collision-property discrimination, salt primary purpose, digest naming and salt technique naming. **m211/m404 reuse m004's exact `password-salt-precomputation-purpose` label.** m624's technique name and m042's inverse attack cue remain correlated with that earlier purpose/storage teaching; their different labels do not grant independent credit.

All four prior password questions and their feedback are compared at bound revisions. m004 supplies salt-purpose recognition; m039 distinguishes hashing from decryption while permitting guessing; m045 recognizes a work-factor scheme rather than calibrating cost; m104 chooses salted non-reversible storage, with work factor only in correction. None is re-counted. Collision weakness/definition does not re-assess the earlier one-way or cost decision. m403's digest name does not duplicate or establish m652's signature-origin mechanism or m008/m626 recipient-key confidentiality. Prior m622/m208/m406 neighbor comparisons stay comparison-only and pending; neither their questions nor feedback gain new dispositions here.

Single-miss pure fixtures return `keys-passwords-encryption` then `crypto-modes-pqc-transition` for all seven. These are exact legacy selector outputs, not approved teaching or validated remediation. Their instruction/support surfaces need separate semantic, delivery and usefulness review.

## Validation and remaining gate

Validation passed: `node scripts/audit-objective14-hashing-password.mjs`, all 29 tests in `npm run audit:content-mapping`, exact package reproduction and the Vercel `[skip deploy]` guard. Staged whitespace is checked before commit. The focused check binds the 235/86/14/100/135 census, fifteen prior packets, seven authored literals, m404's sole capture antecedent, compiler identities, conditional renderer gates, authored corrections and shuffled remapping, exact prior family comparisons, observed difficulty/skill roles and remaining IDs. Negative cases reject stale local/published/authored/trusted identities, assessed distractor links, primary/topic/mastery/scope/family/difficulty/skill promotion, superseded m404 capture and ungated feedback. It also binds all 25 release hashes, report/packet hash and private p017's null trusted revision.

Remaining: **11 MCQs, 11 PBQs, 22 feedback bundles and 91 instructional/support records**. Pending MCQs are m035, m075, m105, m137, m159, m208, m210, m406, m622, m625 and m648. They cover other key/encryption/origin/device/HSM/at-rest/key-length/quantum/steganography/tokenization decisions. No full objective coverage or phase completion is claimed.

The active package remains SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`: 1,878 records, 435 concepts (5 mastery, 28 topic, 402 support), **2,954 review decisions**, **489 unresolved question mappings** and seven existing primary proposals. The only mastery identities remain BIA, MTD, MTTR, RPO and RTO. Seven primary proposals are null, assessed secondary roles empty, weights/family credit zero; approved new mappings and eligible evidence zero. Prior CIA/MAC/RBAC/TOU ambiguities, withheld MTTR, unverified MTBF, FAR collision and MOA/MOU holds remain unchanged. Private p017 stays unavailable at `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted revision null, no query or fallback substitution.

Commit/push only this packet/report/check with `[skip deploy]`; preserve unrelated dirt. Adaptive stays unpublished, unwired, default-off and learner-invisible. No active package/runtime/browser/database/learner/live-state/cohort/deployment or Phase 3 change occurs. **Phase 2B-5 and production migration remain NOT READY.**
