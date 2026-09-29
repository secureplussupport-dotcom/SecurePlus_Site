# SY0-701 editorial review — completed 29 September 2026

## Result and scope

The reviewed release contains **395 active MCQs, 88 PBQs and 32 Concept Deep Dives** (106 sections). The Deep Dives generate 171 practice questions after ambiguous and optional-enrichment table questions are excluded.

The review covered the active repository bank and **56 publicly served database override records** retrieved read-only from the site's normal public data interface. That public snapshot added 29 MCQ IDs and four PBQ IDs to the repository review candidates and included edits to existing questions. Earlier repository-only counts therefore understated the site's published content.

| Content | Review candidates | Removed by this review | Existing admin disables retained | Active in this release |
| --- | ---: | ---: | ---: | ---: |
| MCQs | 441 | 44 | 2 | 395 |
| PBQs | 109 | 21 | 0 | 88 |
| Deep Dives | 32 | 0 | 0 | 32 |

Previously hidden low-quality source records were not reactivated, except where an already published override supplied the active version reviewed here. Original source and history remain recoverable in Git; this release does not delete learners' historical attempts. The two existing database PBQs were synchronized with the final reviewed definitions on 29 September.

**Database comparison completed, 29 September 2026:** authenticated access to the SecurePlus project confirmed all 56 override records match the captured baseline (IDs, kind, action, status, payload and publication timestamp; zero mismatches). The entire `pbqs` table contained two rows, `p003` and `p017`, both existing reviewed IDs; there were no additional database-only PBQs. Their stale definitions were corrected in place, keeping Pro entitlement and ordering. A read-back comparison confirmed exact payload and metadata matches and four option explanations per row. No learner/account records were read or changed. Historical override revisions are archival records, not additional active questions.

## Editorial decisions

- Mapped retained questions to valid objective groups and corrected primary chapters/topics where needed. All 28 numbered objective groups are represented. This does **not** demonstrate exhaustive coverage of every syllabus sub-bullet or constitute CompTIA approval.
- Reassessed difficulty by the reasoning needed: direct recognition is generally easy, contextual application/comparison medium, and genuinely multistep reasoning hard. Vendor trivia, obscure command syntax and lengthy wording do not justify a hard label. These are editorial ratings, not difficulty estimates calibrated from learner-response data.
- Added specific explanations for each wrong MCQ option and every choice-based PBQ option. Matching/selection PBQs explain each selection and each blank; ordering PBQs explain each step.
- Replaced implausible placeholders, unnecessary jargon, absolute guarantees and prompts with several reasonable answers. Some easy questions intentionally remain straightforward recognition exercises.
- Retired `m661`–`m700` as duplicates, with replacement IDs recorded in the ledger. Retired `m716`, `m719`, `m720` and `m732` for unsupported proxy-speed claims or excessive/duplicated protocol/vendor trivia. Existing admin disables for `m309` and `m437` remain effective.
- Retired `p201`–`p210` and `p212`–`p222`: their unrelated placeholder distractors disclosed the only substantive answer. Rewrote and retained `p211`.
- Preserved clearly labelled optional “Beyond the textbook” reading; it is not advertised as required exam material and its marked comparison tables do not generate exam-scoped quizzes.
- Removed the unsupported “500+” MCQ claim from the guest copy and MCQ SEO metadata. The live count is computed from the actual active bank.

## Representative corrections

| Area | Correction |
| --- | --- |
| Answer-key consistency | Reconciled the public `m402` and `m404` answer keys with the revised choices; retired contradictory duplicate `m679`. |
| Passwords and MFA | Distinguished salt from work factor; authentication factors from location/risk signals; app-only management from a supposed MAM-exclusive selective wipe. |
| PKI and TLS | A trusted root need not be transmitted; OCSP is freshness-bounded rather than instantaneous; signatures are not universally “decrypted hashes”; forward secrecy depends on key establishment and secret handling. |
| Email authentication | DMARC can pass through either aligned SPF or aligned DKIM. Neither successful authentication nor DNS publication proves the human sender is trustworthy. |
| API authorization | Validating a token does not prevent broken object-level authorization. The API must check access to the requested object and action. |
| Trusted platforms | Attestation evaluates covered measurements and a baseline; it does not guarantee absence of runtime malware, and a TPM does not independently measure all code. |
| Network controls | Full-tunnel VPN coverage requires routing enforcement; MAC flooding does not universally broadcast all frames; DHCP snooping is a defense; CDN protection and DNS filtering are not absolute guarantees. |
| Forensics | Hash equality supports byte-integrity verification, not complete chain of custody or guaranteed admissibility. Collection order and live actions depend on the scenario. |
| Vulnerabilities | CVSS severity is not complete business risk; unpatched does not always mean zero-day; TOCTOU needs an atomic check/use binding rather than simply another check. |
| Risk and privacy | Qualified GDPR scope and response duties; insurance does not transfer every responsibility; exceptions/acceptance need appropriate authority and obligations considered. |
| Deep Dive classification | Wireless hardening and secure DNS/time management assigned to primary domain 4; data classification/lifecycle assigned to primary domain 3. |

## Delivery and maintenance

- `src/data/sy0701EditorialReview.js`: item-level MCQ decisions and duplicate retirement map.
- `src/data/sy0701PbqReview.js`: PBQ corrections, per-part feedback and retirement decisions.
- `src/data/sy0701PublishedSnapshot.js`: the read-only captured public baseline, including existing disable decisions.
- `src/data/sy0701PublishedReview.js`: corrections to those published additions/edits.
- `src/data/sy0701LessonReview.js`: explicit review record for every lesson.

Captured database override payloads are merged **before** editorial corrections and are not reapplied afterward. Their admin ordering is retained when loaded. A later override with a different publication timestamp remains eligible for the normal admin workflow. Retired IDs cannot be silently reintroduced through overrides.

For reviewed built-in PBQ IDs, older database copies (dated at or before `2026-09-05T13:32:13Z`, or lacking a publication date) cannot replace this complete reviewed definition. Remote `is_pro` entitlement metadata is preserved. Newer admin publications and remote-only IDs remain supported; those changes require their own review. This client precedence rule remains in place. The two database rows inspected on 29 September were separately synchronized as described above; the 56 captured override records retain their historical payloads, with the reviewed client corrections applied afterward.

Admin edits published after this review can supersede its findings. Do not represent the review date as ongoing certification. For the next content update, review the actual effective question, including published overrides, not just the original source literal.

## Validation

- `npm run build`: passed; existing large-bundle warning remains.
- `npm run audit`: passed, including launch/security, engagement, SEO, PWA, Deep Dives and strict question-bank checks.
- New `npm run audit:editorial`: checks review/retirement coverage, objective/chapter consistency, unique options, answer bounds, authored feedback **before fallbacks**, each PBQ part's rationale, runtime preservation of full explanations, enrichment isolation and regression cases.
- The audit executes the application's actual legacy MCQ enhancement and PBQ display-normalization functions, preventing a test-only content path from concealing overwritten corrections.
- Local guest browser check: MCQ catalog showed 395; PBQ catalog showed 88. Ran the simulated port scan, submitted the correct response, and verified the PBQ preview showed the overall solution plus specific explanations for all four choices. Guest MCQs retain the existing explanation-access rules; this work does not change subscription entitlements.

These automated checks establish structure and integration, not factual truth. Factual judgments came from the editorial review and primary-source checks. The authenticated database comparison is now complete for the current project and content tables. Later publications require another review.

## Final continuation — 29 September 2026

- Recovered the previous review and verified its pushed release before continuing.
- `p003`: replaced weak distractors with competing interpretations of process/network evidence; no port, filename, CPU threshold or parent process is treated as proof of malware. Domain 4, objective 4.9, medium difficulty.
- `p017`: uses four plausible responses to one defined payment-channel risk: mitigation, transfer, avoidance and acceptance. The avoidance answer ends the activity while acknowledging retained records and obligations. Domain 5, objective 5.2, medium difficulty.
- Synchronized both database rows through the application's production serialization format. Preserved `is_pro=true`, sort positions 8 and 1, original IDs and creation timestamps. Updates checked the previously read modification timestamps to avoid overwriting concurrent edits.
- Added regression checks through the application's actual database serialization and normalization functions: answer keys, evidence, choices, difficulty, objective, explanations and Pro entitlement survive the round trip.
- Authenticated comparison: 56/56 overrides matched the reviewed snapshot; 2/2 database PBQs matched their final corrections. Counts remain 395 MCQs, 88 PBQs, 32 lessons and 171 generated lesson questions.

## Primary references used

- [CompTIA SY0-701 objectives, version 7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be): scope and numbered objective mapping.
- [TLS 1.3 — RFC 8446](https://www.rfc-editor.org/rfc/rfc8446.html): certificate transmission and key-establishment qualifications.
- [Kerberos V5 — RFC 4120](https://www.rfc-editor.org/rfc/rfc4120.html): tickets, authentication, clock skew and replay protection.
- [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html): password and authentication guidance, distinguished from required exam memorization.
- [DMARC — RFC 9989](https://www.rfc-editor.org/info/rfc9989/): current alignment and message-authentication distinctions.
- [NIST SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final): forensic collection and investigation context.
- [FIRST CVSS 4.0 specification](https://www.first.org/cvss/v4.0/specification-document): vulnerability severity and its limits.
- [FIRST TLP 2.0](https://www.first.org/tlp/): information-sharing boundaries.
- [GDPR official text](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng): jurisdiction, duties and qualified rights.
- [W3C WebAuthn](https://www.w3.org/TR/webauthn-3/): relying-party scope and origin-bound authentication, not blanket session protection.
- [OASIS STIX 2.1](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html): structured intelligence representation.
- [NIST SCAP](https://csrc.nist.gov/projects/security-content-automation-protocol): standardized assessment content, not an automatic interoperability guarantee.

The lessons also retain their topic-specific primary references. Checking link structure or approved source domains does not imply every linked external document was re-audited in full.

- [Microsoft Sysmon documentation](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon): process and connection evidence, correlation and limits of event collection.
- [NIST SP 800-39](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-39.pdf): risk response and avoidance of the activity giving rise to risk.
