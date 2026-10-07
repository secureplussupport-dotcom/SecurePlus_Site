# Phase 2B-5: objective 1.2 identity flashcard review

**LOCAL SEMANTIC PROPOSALS — NOT READY.** Exactly **13 cards and one overlapping deck container** receive new pending dispositions. Combined with the six prior packets, **110/126** broad objective-1.2 records now have agent dispositions; **16 glossary definitions remain**. These counts do not mean approved competence coverage or independent evidence. All weights, family credit and new approved mappings remain **zero**.

Baseline: `f79f6c0f1f798904ad3ef18c69e38d6a3ee62d6e`, independently verified on remote main before this slice. The approved master plan and Phase 1 audit retain their previous hashes, with no unresolved conflict requiring a behavior change. Packet: `docs/drafts/phase-2b5-objective12-flashcards-mapping-proposals.json`, SHA-256 `143dde6ff3996d594cd7981101c530048902c894449641f972cc38f8aa1c58fe`. It binds every raw visible card, each acronym/expansion/meaning face field, flattened catalogue revision, deck membership, actual source selection and previous review packets. No authored teaching payload, graded answer, private payload or learner history is exported.

## Per-card meaning and scope

All thirteen cards inherit `1.2 / 1.4 / 3.2`, and the deck appears in Chapter 1. Those are observed metadata, not precise instructional scope. Proposed codes below are editorial inferences from each delivered meaning; they remain pending. A context code alone is not approved instruction or an assessment outcome.

| Card | Pending instructional scope | Usefulness ceiling |
| --- | --- | --- |
| CAPTCHA | Exact scope withheld; 4.6 context | Bot mitigation vocabulary, not named identity proofing or guaranteed bot exclusion. |
| EAP | 4.1; 4.6/1.2 context | Authentication framework recall, not a configured method or security guarantee. |
| IdP | 4.6; 1.2 context | Federation service role, not a Zero Trust policy decision/enforcement role. |
| LEAP | Exact scope withheld; 4.1 context | Legacy-method warning, not modern wireless deployment skill. |
| MFA | 4.6; 1.2 context | Different-factor vocabulary, not control-category classification or phishing resistance. |
| OAuth | 4.6; 1.2 context | Delegated authorization, not end-user authentication or complete least-privilege implementation. |
| OIDC | 4.6; 1.2 context | Identity layer recall, not validation of tokens or sessions. |
| PAP | Exact scope withheld; 4.5/4.6 context | Legacy plaintext exchange warning, not a configured secure replacement. |
| PIV | 4.6; 1.2 context | Credential purpose, not complete factor, certificate or access-policy validation. |
| RADIUS | 4.1/4.6; 1.2 context | Network AAA service purpose, not three separate role outcomes or protocol configuration. |
| SAML | 4.6; 1.2 context | Assertion/federation vocabulary, not assertion trust or access-policy implementation. |
| SSO | 4.6; 1.2 context | Participating-app sign-in experience, not unlimited permission or permanent authentication. |
| TACACS+ | 4.6; 1.2/4.5 context | Device-administration AAA purpose, retaining the plus distinction; no command-policy or transport assurance. |

The [official SY0-701 objectives v7](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) place federation, SSO, OAuth, SAML and multifactor implementation under 4.6; wireless authentication/AAA settings occur under 4.1; fundamental AAA roles occur under 1.2. Acronym-list inclusion and deck tags do not establish card-level cryptographic or architectural instruction. The nonexhaustive objective examples also do not justify claiming these context-only cards are categorically outside the exam.

Thirteen existing supporting identities receive **instructional support proposals at weight zero**, never primary mastery links. Canonical names retain their exact meanings, including TACACS+ versus legacy TACACS. No new identity is invented. CIA alias, MAC cross-domain, role/rule RBAC and TOU access-window/race-condition withholdings in prior packets remain unchanged. A protocol name cannot promote AAA vocabulary into three assessed roles, and an MFA mention cannot establish Zero Trust, compensating-control or control-category mastery.

## Technical distinctions and separately scoped content work

The EAP wording correctly describes a framework rather than one fixed mechanism. [RFC 3748](https://www.rfc-editor.org/rfc/rfc3748.html) permits multiple authentication methods. LEAP's password-attack warning is consistent with [Cisco's authentication-method guidance](https://www.cisco.com/c/en/us/td/docs/security/vpn_client/anyconnect/anyconnect47/administration/guide/b_AnyConnect_Administrator_Guide_4-7/configure_nam.html). PAP supplies no native password confidentiality/replay protection; an outer transport is a separate question. [RFC 1334](https://www.rfc-editor.org/rfc/rfc1334.html), §2.1, supports the legacy warning without proving every encapsulated deployment exposes the password to every observer.

OAuth authorization and OIDC authentication remain separate meanings. The card's password-avoidance benefit needs a flow qualifier: historical [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749.html), §4.3, also defined a password grant, while current [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html), §2.4, prohibits that grant. [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html) adds identity information based on authorization-server authentication; an OAuth access token alone is not interchangeable with that authentication result. These cards do not teach issuer, audience, signature, nonce or trust validation.

The MFA example needs a mechanism qualifier rather than implying every authenticator app delivers an independent or phishing-resistant factor. [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) distinguishes factor possession/control and permitted authentication methods. The IdP sentence likewise should not imply every provider directly stores all identity/credential data; services can delegate components. Both are separately scoped precision proposals, with no learner-visible correction here.

PIV's federal physical/logical credential context follows [FIPS 201-3](https://csrc.nist.gov/pubs/fips/201-3/final). SAML exchanges assertions about authentication, attributes and authorization, as specified by [OASIS SAML Core](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf). [RFC 2865](https://www.rfc-editor.org/rfc/rfc2865.html) supports RADIUS network authentication/authorization vocabulary; accounting is separately specified by [RFC 2866](https://www.rfc-editor.org/rfc/rfc2866.html). [RFC 8907](https://www.rfc-editor.org/rfc/rfc8907.html) describes TACACS+ device administration and separate AAA functions. The two card definitions provide purpose recognition, not configuration or assurances about all traffic encryption. CAPTCHA is a human/bot differentiation approach with limitations, not proof of a particular identity; the [W3C CAPTCHA note](https://www.w3.org/TR/turingtest/) supports that distinction. No CAPTCHA feature is implemented or altered by this review.

## Actual study and selection flow

The standard deck is reachable by `/security-plus-flashcards/`, Chapter 1 browsing and the **third default mobile quick-start entry**. Guests can open it without payment or an account. Guests choose a study mode; a signed-in user's valid saved default can skip that chooser. Definition mode shows the meaning before revealing expansion/acronym; acronym mode shows the abbreviation before revealing expansion/meaning. None of the thirteen cards has an example, so example-mode requests fall back to definition mode. Both modes, flips and shuffle reuse the same thirteen authored cards.

The standard-deck fallback supplies raw child cards to AcronymFlashcardLab. Special decks and matching saved IDs take precedence in the navigation resolver; random/shared/starred/saved mixes reuse flattened current catalogue cards by ID. Saved learner-specific instances and live synchronization were not read. Card faces use plain JSX, not GlossaryText: a package reference to a card does not prove an inline glossary was delivered. No remaining glossary definition is dispositioned in this slice.

“Again” and “Got it” are self-ratings shown after reveal, with local persistence and conditional existing account sync. Pass completion counts uniquely rated IDs rather than validated correctness. The visible “mastered” wording is not trusted adaptive evidence. No rating, cloud write, analytics capture or React handler was executed. Source review confirms native buttons/reveal state; no fresh browser or screen-reader verification is claimed.

The related-lesson selector deterministically returns **federation-modern-auth**, **kerberos-aaa-enterprise-auth** and **security-foundations-controls** using text/domain/objective overlap. Their exact catalogue revisions are bound as routing probes only, without adding semantic dispositions. Opening these lessons requires an account then Pro. The next-deck action goes to **network-wireless-attacks** by array order, not diagnosed weakness. Assistant decks retain their Pro gate; random study is guest-accessible, while saving generated decks and the saved inventory require an account. None of those selection variants creates independent content.

A pure synthetic 13-ID replay demonstrates a delivery ceiling: saved-ID hydration passes the mix through the existing 10/20/30 count-rounding builder and retains **ten** cards. It reads no saved learner data and constructs no new teaching. Investigate replay fidelity in a separate delivery change; this slice records the exact existing behavior without fixing it. Synthetic random and starred selections likewise reuse source objects rather than new revisions.

## Miss usefulness, overlap and remaining work

The packet compares **23 prior question dispositions** at exact local/published revisions: three controls questions and twenty previously reviewed 1.2 MCQs. These are semantic comparisons, not new question reviews, learner outcomes or observed recommendations to individual cards. MFA can partially refresh the factor distinction needed by `m601`, but it does not teach its technical-category decision. It does not explain compensating substitution in `m003`/`m203`.

The federation cards do not teach the specific Zero Trust policy roles or implicit-trust rejection assessed by earlier questions. OAuth's brief limited-resource wording does not fully explain applied least privilege. The other prior CIA, integrity, vestibule, physical-ordering, deception, split-duty and dual-control decisions are outside this deck's targeted teaching. The previous MFA glossary overlaps factor vocabulary; RADIUS/TACACS+ overlap the previous AAA card/definition at purpose level. IdP/OAuth/OIDC/SAML/SSO are complementary vocabulary, not five independent assessed recovery outcomes. EAP and LEAP are related but different meanings. No prior family gains credit through these overlaps.

Remaining after this slice: **16 glossary definitions**, with exact IDs/revisions in the packet. The active package stays at 1,878 records, 435 concepts (5 mastery, 28 topics, 402 supporting), review queue 2,954, unresolved question mappings 489 and seven existing primary question proposals. Package SHA-256 remains `056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97`. Private selected `p017` remains unavailable at `sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42`, trusted revision null, without substitution or fresh query.

## Validation and release boundary

Validation passed: `node scripts/audit-objective12-flashcards-mapping.mjs`; all 29 tests in `npm run audit:content-mapping`; exact package reproduction; and the Vercel skip-marker guard. `git diff --check` passed before staging. The focused check binds the exact 14-ID remainder, thirteen raw/catalogue/face revision sets, pending per-card scopes, current selectors, mode fallback, related/next-deck outputs, synthetic reuse and replay ceiling, source precedence and all 25 release hashes. Negative checks reject stale faces, recalled-card mastery, invented trusted revisions, inherited scope promotion, scenario fabrication and topic/support promotion. The standard audit reproduces the unchanged package and its existing invariants.

Commit/push only the three review artifacts using `[skip deploy]`, preserving unrelated dirt. All new approved mappings and eligible evidence remain zero. Adaptive runtime remains unpublished, unwired, default-off and learner-invisible. No live migration, deployment, activation, shadow writes, cohorts or Phase 3 are authorized by this review. Phase 2B-5 and production migration remain **NOT READY**.
