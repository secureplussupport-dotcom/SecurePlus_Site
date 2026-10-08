# Phase 2B-5 — objective 1.4 PKI PBQs

Baseline `4e429289948c4395e515d234c4ae34c8092ba569`. **LOCAL_SEMANTIC_PROPOSALS_NOT_READY.** One bounded offline slice covers p010, p033 and p052 plus three feedback bundles. All are pending agent dispositions, not owner approval or runtime mappings. Master-plan product requirements remain approved; Phase 1 remains historical evidence. This slice makes no behavior changes.

## Source and approved/current-state boundary

Packet SHA-256 `7a5fb1b1d82708211f332b6f748aba2051e494adbca18f2a850fe0a61e503ea0`. Bind 19 prior packets plus the prior PBQ report/audit, source delivery/grading units, master plan/Phase 1, exact package and release manifest. Selected local authored literals exist, imports/snapshots/historical authenticated item captures do not. Authored and pre-editorial revisions agree; effective editorial revisions differ and supersede earlier claims. Publication signatures, effective signatures, feedback hashes and compiled identities are separate. The same pure editorial/enhancement and captured publication pipeline is checked. Stale remote content cannot undo review; later live/private/admin revisions remain possible. No fresh authenticated or browser read.

**Approved/current access gap:** The master plan includes p033 among five baseline free PBQs. The Phase 1 audit and unchanged current source use p001 preview plus Pro/earned unlocks; p033 is the third prescribed coin reveal. The approved decision governs future entitlement changes. This is a known implementation gap, not permission to alter access in this semantic slice. No unresolved conflict requires a behavior change here. Practice access and exam access are separate: exam startup checks Pro or consumes a voucher, then samples its existing eligible bank without the individual practice coin gate. Neither payment action nor a learner entitlement was exercised.

## Three full semantic dispositions

| PBQ | Effective format / difficulty | Parts | Pending assessed decision |
| --- | --- | --- | --- |
| p010 | ORDERING / medium | 5 | Stated full TLS 1.2 ECDHE server-authenticated grouped milestone order, no resumption/early data. |
| p033 | ORDERING / medium | 6 | Stated protected-key CSR issuance, deployment and monitoring workflow order. |
| p052 | SELECT & FILL / easy; formerly DRAG & DROP | 5 | Explicit anchor, subordinate issuer, CSR, OCSP and CRL role matching. |

**p010:** The supplied TLS version/mode and grouped messages constrain the order. Client capabilities, selected server parameters, certificate/signed key-exchange validation, ephemeral agreement and Finished verification are distinct grouped stages. No packet-by-packet TLS 1.3, resumption, early-data, actual handshake, full certificate validation, derived secrets or forward-secrecy/key-erasure competence is demonstrated.

**p033:** The workflow assumes an authorized issuer and protected key integration. CSR signing demonstrates associated-key possession, not validated requested identity or issued trust. HSM custody and controlled backup/migration are implementation choices; private-key non-exportability or never leaving a web server is not a universal rule. No commands, CA approval, installed service, live renewal policy, fixed lifetime or key-custody assurance is demonstrated.

**p052:** A root is trusted by explicit relying-party configuration, not merely self-signing. Intermediate issuance is constrained by its chain. A CSR conveys public information and a signature, not a private key. OCSP and CRL status require scope, signature/authority and freshness checks; they are not instant awareness or complete path/name/time validation. Offline roots/HSMs and online intermediates are common designs rather than definitions.

[CompTIA SY0-701 v7 objective 1.4](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) lists PKI/key exchange and certificate/CA/CSR/status subjects. These narrow composite decisions support that scope without full-objective or separately scored skill coverage. p010's historical TLS 1.2 grouping is reviewed against [RFC 5246 §7.3](https://www.rfc-editor.org/rfc/rfc5246#section-7.3) and [RFC 8422 §2](https://datatracker.ietf.org/doc/html/rfc8422#section-2); this is source interpretation, not a current deployment recommendation or TLS 1.3 sequence. CSR public information and signing are specified in [RFC 2986 §3](https://www.rfc-editor.org/rfc/rfc2986.txt). Explicit trust/chain constraints and CRL checking are reviewed against [RFC 5280 §6](https://www.rfc-editor.org/rfc/rfc5280#section-6), and response authorization/signature/freshness against [RFC 6960 §3.2](https://www.rfc-editor.org/rfc/rfc6960#section-3.2). These sources support qualifications; no production operation or compliance claim follows.

Current difficulty labels are retained without calibration. The older hard labels for p010/p033 and medium p052 label do not regain authority because of format or part count. Universal TLS order, server returning all supported suites, private key never leaving a server, fixed renewal lifetimes, automatically trusted self-signatures and instant OCSP validity claims are superseded, not reintroduced. CSR possession proof is distinct from issuer identity validation.

## Actual scoring and negative cases

| PBQ | Trusted revision | Trusted content SHA-256 | Practice miss fixture / trusted score |
| --- | --- | --- | --- |
| p010 | b5b2bdad-30c8-8c8f-a5d2-abf53bb984b2 | b5b2bdad30c8fc8f25d2abf53bb984b2cea08927b845085068f2885db37b6457 | 3/5 parts; whole incorrect / 0 |
| p033 | bf1ead06-a370-8186-b93c-3f23d94cd2a0 | bf1ead06a3700186f93c3f23d94cd2a0035a2b6d4bb2e3a1b9cddf5e7b6f8c1d | 4/6 parts; whole incorrect / 0 |
| p052 | null — compiler rejects selectionFeedback | null | 4/5 parts; whole incorrect / null |

p010/p033 compile as **coarse whole-question** ordering only: all-correct, two swapped positions and complete rotation reproduce practice/exam whole correctness. Practice partial ratios 3/5 and 4/6 on a swap do not become trusted partial scores; trusted scores are binary 1/0. Missing/duplicate placements, duplicate selected positions and tampered revision hashes are rejected. There are no per-position concept/family weights.

p052 remains trustedRevisionId/contentSha256 **null**: actual compile rejects selectionFeedback, and removing only that field still fails unsupported answer grammar. No question fields are stripped to manufacture a revision. Five pure fixtures cover all correct, one wrong, all wrong, normalized correct and all empty. One wrong gives practice 4/5 and whole incorrect; trusted score stays null. All-wrong/one-wrong selections use actual available options. Empty/normalized fixtures exercise grading only, not permitted submission or new evidence.

The audit rejects stale effective/publication identities, invented p052 trust, topic/recovery primary mastery, direct-precision or hard-difficulty promotion, weights, partial mastery, independent evidence and per-step family labels. It reuses the bound earlier pure PBQ probe helper, without executing its generator or React submit/save/achievement/terminal handlers. No answer text, keyed order, stable grading components, authored placements, private payload or learner records are exported.

## Delivery, feedback and family comparison

Practice ordering uses drag/pointer controls; no keyboard reorder control is present in the bound source. This is a source limitation, not a browser accessibility test or fix. The scenario qualifies p010/p033; ordering does not separately render q.question/q.hint. Ordering initializes a shuffled complete list, so a nonempty list is already answerable and checking does not prove it was reordered. p052 uses reusable shared option buttons against five blank prompts with exactly five option meanings; it is not original drag/drop or free text. Its empty scenario and unrendered separate practice q.question do not remove the task carried by the title/prompts. It has no per-blank practice study clues; its old drag hint is not rendered and exam hint stripping removes it. Practice requires all blanks nonempty; exam counts some nonempty blank response as answered but grades all five.

Accessible submitted practice has no separate Pro feedback gate. Both ordering PBQs show main corrections, position-specific marking, expected item rationale and explicit correct order on a miss. p052 shows main/per-blank corrections and optional details for option meanings. These 5/6/5 part corrections are feedback under one parent, not independent evidence; authored wrong-option correction sets are absent. Exam main solutions are available after completion; p052's expanded card gives blank response/correction without explanatory per-blank teaching. Exam ordering review does not list corrected sequences or item rationales. Source reasoning supports correction usefulness, not validated recovery. Next-related empty-history probes: p010→p033, p033→p010, p052→p005; no approved remediation is inferred.

Three provisional composite family labels remain unapproved. Compare p010 with prior root trust, public-key and forward-secrecy recognition; p033 with m111 CSR, HSM/custody and p018/p054; p052 with prior explicit-anchor/issuer/CSR/OCSP and p018 roles. p055's spatial ordering is a different supplied decision, but ordering format alone adds no novelty. Within this slice, certificate/CSR/issuer roles overlap across the three composites. No step, blank, hint, feedback, retry or rearrangement grants an independent family. Primary mastery stays null; secondary/assessed roles empty; support links are existing instructional identities at zero weight. All inherited canonical holds and the five available recovery/BIA mastery identities are unchanged.

## Counts and remaining work

**235 candidates; 128 prior +6 new =134 distinct pending agent dispositions.** New records: 3 PBQs +3 feedback, zero MCQs/instruction. Remaining **101**: **0 MCQs, 5 PBQs, 5 PBQ feedback, 91 instruction/support** (2 decks, 27 flashcards, 31 glossary, 3 keyword guides, 3 lessons, 12 checks, 10 sections, 3 traps). Pending PBQs: **p002/p037/p049/p057/p224**, with paired feedback. Prior inspection-only entries never count as dispositions; deduplicate prior question/feedback/instruction by record ID.

Package unchanged:1878 records,435 identities (5 mastery/28 topic/402 support),2954 queue rows,489 unresolved question mappings,7 existing primary proposals. New human approvals, eligible evidence, assessed/mastery weights and family credits remain **zero**. Private p017 stays `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted null, unavailable payload, no refreshed read or local fallback substitution.

Run `node scripts/audit-objective14-pki-pbqs.mjs` and `npm run audit:content-mapping`. The focused audit binds packet/report/source, exact census and remaining set, precedence/feedback/format, real compiler/grade kernels, negative mutations, prior comparisons and **25 unchanged release hashes**. No active package/mapping, runtime/config, browser, database, learner, production migration, live-state/shadow/cohort/activation, deployment or Phase 3 change. Push only packet/report/audit with **[skip deploy]**; preserve unrelated dirt. Phase 2B-5 remains **NOT READY**.
