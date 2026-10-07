# Phase 2B-5: objective 1.2 glossary review

**LOCAL SEMANTIC PROPOSALS — NOT READY.** The last 16 glossary definitions have pending agent dispositions. This completes **126/126 distinct dispositions in the broad objective-1.2 candidate census**, with zero remaining candidates in that group. It does not approve mappings, close review-queue items, establish mastery coverage or complete Phase 2B-5.

Baseline: `db08782733045a6c379109c1b6cf70e157d9a8cf`. [Proposal packet](drafts/phase-2b5-objective12-glossary-mapping-proposals.json), SHA-256 `377378ea1423ceafead0d73bfaace111e0a7181eb1da50200ec5454fe386c32e`. All seven prior packets, approved master plan, historical Phase 1 audit, source precedence helpers, catalogue, renderer and release manifest remain bound and unchanged. No unresolved product-document conflict was found; this slice changes no behavior. Exact authored definitions and full names were read locally; the packet exports identity, source locations, object/entry hashes and review judgments rather than question text, grading keys, private payloads or learner history.

## Definition decisions

All 16 definitions are objects with `fullName` and `definition`, not colon-parsed strings. The table gives proposed instructional scope; inherited objective tags remain observed metadata. Context codes are separately recorded in the packet and grant no credit. IdP, OIDC and TACACS+ scope is an agent inference within IAM, rather than a claim that each term is explicitly named in the syllabus.

| Definition | Pending scope | Meaning, limit and usefulness after a miss |
| --- | --- | --- |
| BIA | 5.2; resilience context | Critical operations, dependencies and disruption impact inform continuity priorities. Process vocabulary alone does not teach how to analyze impact or distinguish MTD from RTO. |
| DLP | 4.4 / 4.5; data-protection context | Policy-based sensitive-data detection/blocking. Does not prescribe a fixed control function, deployment point or all CIA properties. |
| EAP | 4.1; IAM context | Authentication framework, not a single method or encryption algorithm. Does not teach method selection or server trust. |
| IdP | 4.6 | Federation authentication and assertions/tokens. Does not establish authorization policy or relying-party validation. |
| LDAP | 4.6; secure-protocol context | Directory access and modification protocol. Does not imply encrypted transport, federation or an identity-provider service. |
| MTBF | 5.2; resilience context | Reliability interval for repairable systems. Distinct from non-repairable lifetime and restoration duration; glossary delivery is unverified. |
| MTTR | Precise scope withheld | Authored repair/respond expansion and definition combine different clocks. Withhold the exact `recovery.mttr` link until that distinction is resolved. |
| OAuth | 4.6 | Delegated resource authorization. Does not itself authenticate a user or guarantee that all historical grants avoid password disclosure. |
| OIDC | 4.6 | Authentication and identity claims on OAuth 2.0. Does not teach ID-token validation or establish trusted claims. |
| PKI | 1.4 | Certificate/key/policy trust infrastructure. Does not itself guarantee encryption, valid certificate paths or correct key usage. |
| RPO | 5.2; resilience context | Time-based acceptable data loss. Does not prove recovery success or teach backup-strategy selection. |
| RTO | 5.2; resilience context | Acceptable restoration-time target. Distinct from RPO, MTTR averages and maximum tolerable business disruption; not an observed recovery guarantee. |
| SAML | 4.6 | XML assertion exchange, commonly for federated SSO. Does not teach signature, audience or replay validation. |
| SSO | 4.6 | One-login application experience. Does not establish federation trust or merge authentication with authorization. |
| TACACS+ | 4.6; protocol context | Device-administration AAA with separated functions; retain the plus identity. The encrypted-payload wording needs a separate correction before security assurances are approved. |
| VPN | 3.2; crypto/protocol context | Encrypted secure-connection meaning in this authored context. Does not guarantee all VPN services encrypt, protect endpoints or secure every application end to end. |

These scope judgments use the [official SY0-701 objectives v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be): 5.2 identifies continuity metrics; 4.1 covers wireless authentication; 4.4/4.5 identify DLP tooling; 4.6 covers IAM; 1.4 identifies PKI; 3.2 identifies secure VPN access. They do not actively retag content or certify scenario competence.

The existing canonical MTTR node means repair/recover, while this definition adds incident response. The syllabus uses repair in 5.2 and recover in its acronym appendix, which provides no basis to merge response timing into the recovery node. Preserve the narrower prior card/table decisions and propose a separately scoped wording/identity decision. [Official objectives v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be). RTO/RPO/BIA remain planning vocabulary rather than successful recovery evidence. [NIST SP 800-34 Rev. 1, §3.2](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-34r1.pdf).

OAuth authorization and OIDC authentication remain separate. Current OAuth security guidance forbids the historical password-credentials grant; the short password-free definition cannot become an unrestricted historical assertion. [RFC 9700, §2.4](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.4), [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html). LDAP directory operations do not imply an IdP or protected transport. [RFC 4511](https://www.rfc-editor.org/rfc/rfc4511.html). PKI supports certificate-based trust and differentiated key usages, rather than automatic confidentiality. [RFC 5280, §4.2.1.3](https://www.rfc-editor.org/rfc/rfc5280.html#section-4.2.1.3).

TACACS+ is semantically identifiable as device-administration AAA, but RFC 8907 explicitly treats its legacy body mechanism as obfuscation, lacking modern integrity/privacy/replay protection. Record a separate content correction; do not approve “encrypted payloads” as a modern security guarantee or change the live definition here. [RFC 8907, §§4.5, 10.1](https://www.rfc-editor.org/rfc/rfc8907.html). The VPN proposal is limited to secure encrypted connections; implementing their protections remains a separate decision. [NIST SP 800-77 Rev. 1](https://csrc.nist.gov/pubs/sp/800/77/r1/final).

## Actual source delivery and interaction gates

There are **15 verified local source occurrences**, comprising 14 MCQ stem/option probes and one PBQ feedback probe. None is a fresh browser tooltip-opening test or a live/private-bank verification. Each probe binds the effective local parent revision, published catalogue revision and actual rendered field-group hash. Parent questions receive no new semantic disposition, correctness credit or family label from these probes.

MCQ probes are BIA/m196 stem, DLP/m075 options, EAP/m712 stem, IdP/m726 stem, LDAP/m034 options, MTTR/m635 options, OAuth/m077 options, PKI/m222 stem, RPO/m088 stem, RTO/m032 stem, SAML/m217 stem, SSO/m108 options, TACACS+/m034 options and VPN/m130 stem. `QuestionStemText` splits prose into actual context/question pieces; options pass their text to `GlossaryText`. These probes require the corresponding selected question and rendered text, with no submission/Pro-feedback gate. A token in a distractor proves only conditional vocabulary availability. General MCQ explanations require submission and Pro; inline wrong feedback additionally requires the selected wrong option.

OIDC is present in p225's **all-option feedback**, rendered after submission through `PBQProseText` and then `GlossaryText`. The real `hasSeparatePbqSolution` helper returns false: its standalone explanation is suppressed, so that would be an invalid probe. The check exercises supplied feedback for the actual choice list and the stripped rendered group. The PBQ must be available and opened through the applicable Pro/preview/coin path; p225 is not the p001 free preview. Configured remote question precedence and conditional local fallback remain intact. No entitlement, grading, state-save, analytics or remote-fetch handler is executed.

`GlossaryText` matches case-insensitive, longest-first boundary tokens within formatted segments. The matched span opens its own definition on click, Enter or Space and toggles/ closes on the recorded source interactions. The popover presents the exact object full name and definition as plain JSX; it does not recursively expose other dictionary entries. Option term spans sit inside option buttons, and submitted options are disabled; post-submission focus/activation there has not been verified in a browser and needs a separate accessibility review before any delivery guarantee.

**MTBF has no verified local glossary occurrence in the checked sources.** Its two catalogue references are a card and the resilience lesson. Card faces and the lesson's MTBF table cells use plain JSX; neither calls `GlossaryText`. The lesson's actual body paragraphs contain no matching token. The focused scan also finds no MTBF in the checked effective MCQ/PBQ prose groups. Do not force a table/card/metadata probe, and do not extrapolate this limited finding into “globally unused” or absent private content. The definition retains a semantic support proposal with delivery explicitly unverified.

## Overlap and approval boundary

Seven identity definitions overlap the previously reviewed EAP, IdP, OAuth, OIDC, SAML, SSO and TACACS+ cards. All 16 corresponding card objects are separately revision-bound for comparison; nine outside the earlier card slice receive no new dispositions. The MTTR card/table say repair/recover and remain narrower than the glossary. BIA occurs only as an alias in the resilience lesson; RTO/RPO/MTTR/MTBF repeat its related metric instruction. None is a new independent outcome.

These definitions do not supply the missing CIA, control-category/function, physical ordering, policy-role, least-privilege, split-duties or dual-control teaching needed to remediate earlier assessed decisions. Lookup alongside existing explanation/option feedback repeats vocabulary; it is not validated recovery. All prior question/feedback revisions and family labels remain unchanged. CIA/CIA-triad, MAC cross-domain meanings, role/rule RBAC and TOU access-window/race-condition dispositions remain withheld as before.

Fifteen definitions propose existing zero-weight instructional links: 12 support nodes and the three already-existing BIA/RPO/RTO mastery identities used **only as instructional support**. MTTR linkage is withheld. No new canonical identity, primary mastery role, trusted revision, topic/support promotion, approved remediation or family credit is created.

## Validation and remaining phase-wide gate

Validation passed: `node scripts/audit-objective12-glossary-mapping.mjs`, all 29 tests in `npm run audit:content-mapping`, all 25 unchanged active release hashes, exact package reproduction and the Vercel skip-marker guard. Diff whitespace checks passed before staging. The focused check rejects stale sources/fields, metadata-as-delivery, suppressed OIDC solution probes, forced MTBF occurrences, inherited scope, MTTR autolinking, primary/trusted mappings, mastery weights and family credit. It verifies 16 new plus 110 prior dispositions without duplicate census credit.

The unchanged package is SHA-256 `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`: 1,878 records, 435 concepts (5 mastery, 28 topic, 402 support), review queue **2,954**, unresolved question mappings **489**, seven existing primary question proposals. Human approvals and new eligible evidence remain **zero**. Private selected p017 remains unavailable at `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted revision null, no fresh query or fallback substitution.

Residual work is phase-wide semantic review outside this completed candidate group, canonical/role/scope/difficulty and content decisions, precise teaching/remediation and qualified evidence, family calibration, private-source verification and rollout readiness. Existing review-batch/guide requirements continue to govern those decisions; 126/126 is not phase completion. Task-only commit/push uses `[skip deploy]` and preserves unrelated dirt. Adaptive remains unpublished, unwired, default-off and learner-invisible. No live migration, deployment, activation, shadow writes, cohort change or Phase 3 is authorized. **Phase 2B-5 and production migration remain NOT READY.**
