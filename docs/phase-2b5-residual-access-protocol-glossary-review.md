# Phase 2B-5 — seventeen residual access and protocol glossary definitions

Date: 2026-10-14. Baseline: `6c579cfd6c153d9273773dc1d51642bc69e9a6fa`. **LOCAL/default-off/unwired/learner-invisible review; NOT READY.**

Exactly17 remaining delivered glossary records were inspected. Nine bounded vocabulary proposals qualify; seven selected prior holds remain unresolved and DNAT adds one genuinely new hold. All109 previous distinct holds are preserved; total110. No question, feedback, complete-pair, parent/card/lesson, canonical role/scope/label/link, independent family, trusted, mastery, publication or activation approval is added.

The approved master plan remains product authority and the Phase1 audit supplies historical verified current-state evidence. Both were read in full earlier in this continuing session. No unresolved product conflict changes behavior. Only this focused audit, packet and report change. Review judgments are proposals pending owner approval, not human editorial approval or observed learning effectiveness.

## Exact seventeen revisions and decisions

The effective and published record signatures are identical. The packet also binds the distinct definition value, normalized display entry, both displayed subfields and exact source row. The phrase key uses its encoded catalogue ID; it is not a newly invented record. There is no question override or lesson-proximity overlay for these definitions.

| Exact record ID | Effective / published signature | Disposition | Source |
|---|---|---|---|
| glossary:abac | `sha256:b392959efe48e846e7f3aa6f9d767bf1d28b70d10e7606fecbaeadd571764312` | Bounded glossary proposal | `src/App.jsx:2237` |
| glossary:cors | `sha256:ec45f3a98b8ebd171e49df981c4edb9bc29f3eddbd29b1603a4e33f52766e206` | Bounded glossary proposal | `src/App.jsx:2266` |
| glossary:dnat | `sha256:baa387ad25e226d7bf8ed48d1399d6ae46fa7825966bf8ec66b89008638888d8` | New HOLD, zero credit | `src/App.jsx:2285` |
| glossary:hotp | `sha256:9fa7311680a06f2f8ab999933fc7e62acd1627b60a04673b92c91242e43115ad` | Bounded glossary proposal | `src/App.jsx:2302` |
| glossary:osint | `sha256:e35eff385b17ad16eb8ee2ae7f9fe3ae928a7daa0f73d2f73027c493fe4ab264` | Bounded glossary proposal | `src/App.jsx:2339` |
| glossary:owasp | `sha256:558065aa1f1fad5fcf6c6a8cdd7971f19ec03dc31f885a9e84f83f2f878c098e` | Prior HOLD, zero credit | `src/App.jsx:2340` |
| glossary:p12 | `sha256:7a5ff193667ee670ad329de68074e38a82f11a77211314589f41cac1cf4a31d1` | Bounded glossary proposal | `src/App.jsx:2347` |
| glossary:pfx | `sha256:4b9e298958b96aec0bc4405bdc63b525be9f79829587675da3aa5eed1a4411c1` | Bounded glossary proposal | `src/App.jsx:2346` |
| glossary:rce | `sha256:64a4e6ce2ad67af39eb2b3b3c098641f8c1a3e6eac220d13ac3e5b50ea8071b2` | Bounded glossary proposal | `src/App.jsx:2354` |
| glossary:sql%20injection | `sha256:909f227de99d25202e56848a2ba7f3543e8e3f96bde902dcd5d7c2468dfa7110` | Prior HOLD, zero credit | `src/App.jsx:2397` |
| glossary:sqli | `sha256:87b715a70e29d6d69c740fda8937ddef73413a2ee2758c3952f69d511231605f` | Prior HOLD, zero credit | `src/App.jsx:2371` |
| glossary:srtp | `sha256:bad78ec629823eefa280b7c80a882d319f9a9b4a0ecd316c48d7d219621c86a4` | Prior HOLD, zero credit | `src/App.jsx:2372` |
| glossary:ssh | `sha256:c8461c36a4ee1bdb9e35f61298a24bcd79ca0754186ce7633ebd989ffc288a47` | Prior HOLD, zero credit | `src/App.jsx:2373` |
| glossary:ssid | `sha256:0b2ef0baeb15de5a045aa9181b5735eafce2af912f9d7e1b054257bf47c44727` | Prior HOLD, zero credit | `src/App.jsx:2374` |
| glossary:totp | `sha256:55fa0373379bdeb8a46f8a411fcbabfda0f5a8f5e1895a42fd2baa7766aab370` | Bounded glossary proposal | `src/App.jsx:2303` |
| glossary:vdi | `sha256:fa5c0b3b2eb03f4b9ab412a9c06c0f38f931df6d5d54f5d3d0ee64d5539a2578` | Bounded glossary proposal | `src/App.jsx:2386` |
| glossary:zta | `sha256:16e75b6db91b31d2d0d124cf0c947036747e385b040ee4abad72029562ee6b8c` | Prior HOLD, zero credit | `src/App.jsx:2392` |

### ABAC

Current displayed expansion: Attribute-Based Access Control. Current definition: Fine-grained access control using attributes such as user, resource, action, location, and device state.

Recognize access decisions using subject, resource, action and environment attributes. Qualified authorization vocabulary. Policy evaluates attributes; collecting device/location facts is not itself a grant. ABAC is a decision model, not a synonym for ZTA or evidence that a deployed policy is trustworthy.

### CORS

Current displayed expansion: Cross-Origin Resource Sharing. Current definition: Browser mechanism that uses HTTP headers to control cross-origin resource access.

Recognize a browser-enforced HTTP-header mechanism for cross-origin resource sharing. Qualified browser response-access vocabulary. CORS is not server authentication, authorization or a universal request firewall; some cross-origin requests are sent without preflight. Non-browser clients need not enforce it.

### DNAT

Current displayed expansion: Destination Network Address Translation. Current definition: Translation of inbound public traffic to specific internal hosts or services.

Destination-address/port rewriting differs from source rewriting. HOLD: the definition limits DNAT to inbound public traffic directed at internal services without naming destination rewriting. Locally generated/output-chain translation and other address scopes are counterexamples; the common forwarding use case is not the general mechanism.

### HOTP

Current displayed expansion: HMAC-based One-Time Password. Current definition: Counter-based one-time password algorithm used for MFA tokens.

Recognize a shared-secret HMAC OTP with an event/counter moving factor. Qualified algorithm vocabulary, unlike the time-step moving factor of TOTP. Use in MFA tokens does not mean the OTP alone supplies multiple independent factors, phishing resistance or synchronized counters. No secret, OTP or authentication is generated.

### OSINT

Current displayed expansion: Open-Source Intelligence. Current definition: Reconnaissance using publicly available information such as websites, DNS, repositories, and records.

Recognize public-source information gathering in a reconnaissance use case. Qualified security reconnaissance sense. Open-source means publicly obtainable information, not necessarily open-source software, reliable truth or permission for every collection/reuse. A list of sources does not establish a complete intelligence analysis. No real person, account, repository secret or data collection.

### OWASP

Current displayed expansion: Open Web Application Security Project. Current definition: Community authority for web application security, known for the OWASP Top 10.

Retain the exact prior stale-name and informational-authority hold. HOLD: authored Open Web expansion is historical, whereas the foundation now uses Open Worldwide. Community resources and Top10 guidance are not regulatory authority, certification or a complete security assessment. Prior hold remains unresolved.

### P12

Current displayed expansion: PKCS #12. Current definition: Certificate archive format often used to bundle certificates with password-protected private keys.

Recognize the PKCS#12 personal-information/certificate container vocabulary. Qualified common certificate/private-key bundle use; often password-protected is not always encrypted. Contents, algorithms and integrity vary. A file extension neither proves safe storage nor a trusted certificate. Compare PFX without approving a new independent family.

### PFX

Current displayed expansion: Personal Information Exchange. Current definition: Binary certificate archive format that can include certificates and private keys.

Recognize a binary personal-information exchange container that may hold certificates and private keys. Qualified contemporary PKCS#12 usage: .pfx and .p12 commonly name the same format, not separate cryptographic protections. May include does not require a private key; actual encoding/content and protection are untested. No key material exported.

### RCE

Current displayed expansion: Remote Code Execution. Current definition: Severe vulnerability that lets an attacker run code or commands on a remote system.

Recognize an attacker-enabled remote code/command execution vulnerability impact. Qualified introductory security use of the term; severe is a qualitative warning, not a CVSS score, guaranteed privilege, exploitability or every command execution. Authorized administration is not an RCE vulnerability solely because it executes code remotely. No exploit is supplied or run.

### SQL injection

Current displayed expansion: (none). Current definition: A vulnerability where attacker-controlled input changes a SQL query.

Retain the separate exact phrase-key definition hold. HOLD: changes a SQL query omits attacker input interpreted as SQL code and unintended query semantics, so legitimate bound-data behavior can fit the wording. Keep the encoded catalogue ID glossary:sql%20injection; another SQLi entry cannot repair it.

### SQLi

Current displayed expansion: SQL Injection. Current definition: Web vulnerability where attacker input changes backend database queries.

Retain the independently bound acronym-key SQL-injection hold. HOLD: input changes backend queries likewise omits the code/data boundary; restricting the term to web applications is also incomplete. The acronym and phrase are two delivered records for related vocabulary, not two independent assessed concepts.

### SRTP

Current displayed expansion: Secure Real-time Transport Protocol. Current definition: Encrypted transport for securing real-time voice and media streams.

Retain the prior unconditional-encryption hold. HOLD: RFC3711 permits a NULL cipher, so the encrypted transport description does not establish confidentiality for every SRTP profile. RTP protection, keying, authentication and replay configuration are separate. The historical option is a counterexample, not recommended configuration.

### SSH

Current displayed expansion: Secure Shell. Current definition: Encrypted remote administration protocol replacing insecure cleartext terminal access.

Retain the prior unconditional-encryption hold. HOLD: historical RFC4253 permits the non-recommended none cipher. Secure remote login is a purpose, not proof of negotiated confidentiality, host verification, user authorization or secure operation. No real connection or current cipher recommendation.

### SSID

Current displayed expansion: Service Set Identifier. Current definition: Human-readable wireless network name broadcast by access points.

Retain the identifier-versus-broadcast hold. HOLD: an SSID still exists when beacon name broadcast is suppressed. A readable name is neither unique AP identity nor trustworthy authentication, and suppression is not encryption. No wireless scan or settings change.

### TOTP

Current displayed expansion: Time-based One-Time Password. Current definition: Time-based one-time password algorithm used by authenticator apps.

Recognize an OTP based on a shared-secret algorithm and time-step moving factor. Qualified authenticator-app vocabulary; implementations require clock/validation-window/replay handling. Not every app uses the same interval or every OTP has phishing resistance; no authentication, measured drift or MFA deployment.

### VDI

Current displayed expansion: Virtual Desktop Infrastructure. Current definition: Centralized desktop hosting where users access virtual desktops remotely.

Recognize centrally hosted/managed virtual desktops accessed remotely. Qualified vendor-neutral hosting purpose, not every remote screen/application session or a mandatory cloud/product choice. Connection, identity, host management and data controls determine actual security. No hosted desktop or isolation claim.

### ZTA

Current displayed expansion: Zero Trust Architecture. Current definition: Architecture based on never trust, always verify for each access request.

Retain the prior slogan-only architecture hold. HOLD: never trust, always verify omits resource-focused authentication/authorization and removal of implicit trust solely from location/ownership. ABAC or a nearby Zero Trust entry cannot supply missing architecture semantics or approve canonical links.

Each held entry remains at its exact authored revision. Its previous disposition and fingerprint remain available in selectedPriorHoldReferences/priorHeldRows; review notes, clearer card text and lessons cannot repair the delivered entry. DNAT is the only new held identity. No live wording is rewritten.

## Delivered matcher, lookup, renderer and privacy

The current GlossaryText source uses longest-first alternatives, ASCII alphanumeric token boundaries and case-insensitive matching. It normalizes matched text to an exact authored key before lookup. Direct lowercase lookup is empty for all17 canonical keys; normalizing the learner text is therefore a real prerequisite. Unknown lookup yields empty strings. SQL injection and SQLi have independent keys and signatures; P12 and PFX do too. There is no semantic synonym remapping or context-sensitive disambiguation. Expanded phrases not explicitly keyed do not automatically become tooltip links.

All153 synthetic term/case/format/boundary probes reconcile readGlossary with the actual extracted parse/match/split/lookup expressions. They cover canonical/lower/uppercase, bold/underline/highlight, punctuation, repeated appearances and embedded alphanumeric rejection. Ten alias-comparison inputs bind exact matches and resolved entries, including the two SQL keys, P12/PFX, HOTP/TOTP, ABAC/ZTA and SSH/SRTP/SSID. Repetition, spelling aliases and multiple records add no independent assessment credit.

Source checks retain keyboard Enter/Space handling, focusability, expanded-state indication, click toggle and outside-pointer close. The source has no dangerouslySetInnerHTML path and emits term/fullName/definition as React text children. Seventeen source-bound static text-node specimens exercise current entry values; a synthetic script/image/ampersand probe verifies React text escaping. These are text-node specimens, not the full interactive component or a browser accessibility/security certification. No real learner, secret, cookie, certificate, OTP, account or private data is used or exported. Packet safety checks reject learner/private/answer payload additions.

The component is a conditional inline tooltip, not an observed standalone glossary route. MCQ source renders stems/options through glossary text and gates main/wrong feedback on submitted Pro access. Disabled option ancestry after submission can affect interaction; that browser behavior is unverified. Source-derived MCQ surface probes: 49; lesson paragraph segment probes: 2; matching plain table-cell references: 3. The tables and flashcard lab use plain text and do not inherit glossary tooltip behavior. Source-bound usage/card/lesson neighbors receive zero parent disposition and zero automatic repair or link approval. Lexical source usage is not proof that a learner encountered the term.

## Technical distinctions and primary-source limits

SQL-injection phrase/acronym definitions both remain held for the code/data boundary; legitimate query changes from bound values are not injection merely because a result changes. P12/PFX describe commonly related container names rather than two independent protections. Password protection is a common use, not proof that a container has encryption, safe algorithms, trusted certificates or every required key. HOTP uses an event counter; TOTP derives its moving factor from time steps. Shared-secret OTP vocabulary alone does not establish multiple factors, phishing resistance or correct replay/clock handling.

ABAC evaluates attributes against authorization policy; ZTA is an architecture with resource-focused decisions and no implicit trust solely from location or ownership. The held ZTA slogan cannot be repaired by qualifying ABAC. SSH/SRTP protocol names differ from the SSID identifier. Historical optional unencrypted modes are counterexamples to categorical wording, not recommended contemporary deployments. Wireless name suppression does not create encryption or reliable AP identity. CORS controls browser sharing of responses, not server authorization or all request emission. VDI does not require a particular cloud vendor; public-source reconnaissance does not establish unlimited collection rights or reliable intelligence.

- [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/162/upd2/final): Publication abstract: subject/object/action/environment attribute evaluation for authorization; full standard not reviewed.
- [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/207/final): Publication abstract: resource focus, no implicit trust from location/ownership and distinct authentication/authorization; full standard not reviewed.
- [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS): Browser response sharing and simple-request/preflight distinctions, not server authorization.
- [netfilter.org](https://netfilter.org/projects/nftables/manpage.html): NAT-statements section: destination address/port modification in prerouting/output; no firewall command run.
- [www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc4226): Section5 counter/shared-secret vocabulary only; no algorithm or authentication conformance tested.
- [www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc6238): Sections4/5 time-step and validation/replay limitations only; no secret/OTP generated.
- [www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc7292): PKCS#12/PFX container and protection-mode vocabulary; no key import/export or implementation review.
- [learn.microsoft.com](https://learn.microsoft.com/en-us/sql/t-sql/statements/backup-certificate-transact-sql?view=sql-server-ver17): Remarks: .pfx/.p12 common binary PKCS#12 format names; vendor example is not a universal product contract.
- [owasp.org](https://owasp.org/about/): Current Worldwide name and foundation/community purpose, not legal/certification authority.
- [owasp.org](https://owasp.org/www-community/attacks/SQL_Injection): Injection/query construction distinction only; no exploit/query/database request.
- [www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc3711): Section4.1.3 NULL cipher counterexample; not a current recommendation or full protocol review.
- [www.rfc-editor.org](https://www.rfc-editor.org/rfc/rfc4253): Section6.3 historical non-recommended none cipher counterexample; no current cipher recommendation or connection.
- [www.cisco.com](https://www.cisco.com/c/en/us/support/docs/smb/wireless/cisco-small-business-100-series-wireless-access-points/smb5177-disable-ssid-broadcast-on-a-wireless-access-point.html): Suppressed broadcast is configurable; vendor security/detection claims are not adopted or tested.
- [learn.microsoft.com](https://learn.microsoft.com/en-us/azure/virtual-desktop/overview): Vendor-hosted virtual desktop example only; no vendor-specific requirement or cloud resource.

Only the identified abstracts/sections/pages were inspected. Applying them to short definitions is a review inference. No complete standard, legal/compliance conclusion, real network/browser configuration, database attack, authentication conformance, key import/export, risk assessment or deployed vendor product was tested. The Cisco source demonstrates configurability only; its broad security/detection assertions are not adopted.

## Preserved holds and exact reconciliation

The audit preserves109 distinct prior holds,552 inherited field fingerprints,355 source bindings,118 earlier substantive packets and25 protected release files. Seven of those109 are reselected, with zero resolution/credit; DNAT brings total110. Previous diagnostic compiler, native version1, version2, private p003/p017 source-selection, active package, ledger and disabled local delivery specimen remain exact. Inherited historical diagnostic fields are carry-forward context, not newly executed glossary checks. The limited risk-resilience guide reference stays limited.

| Census | Prior | New proposals | Combined pending | Remaining |
|---|---:|---:|---:|---:|
| Catalogue /1878 |1621|9 glossary|1630|248|
| Learning support /834 |697|9 glossary|706|128|
| Glossary /162 |132|9|141|21|
| Flashcards /313 |261|0|261|52|
| Bank questions /483 |463|0|463|20|
| Full source feedback /483 |461|0|461|22|
| COMPLETE pairs /483 |456|0|456|27|

Instructional occurrences716 +9 =725; distinct records703 +9 =712; repeated occurrences remain13. Five feedback dispositions on held parents still do not count as complete pairs. Synonyms, repeated mentions, containers and context neighbors do not multiply global record/family credit.

| Objective | Broad | Prior | New glossary | Combined | Remaining LOCAL / private | Selected held memberships |
|---|---:|---:|---:|---:|---|---:|
| 2.2 | 134 | 115 | 0 | 115 | 19/0 | 3 |
| 2.3 | 162 | 146 | 0 | 146 | 16/0 | 3 |
| 2.4 | 199 | 183 | 0 | 183 | 16/0 | 3 |
| 2.5 | 66 | 61 | 0 | 61 | 5/0 | 1 |
| 3.1 | 220 | 189 | 0 | 189 | 31/0 | 1 |
| 3.2 | 220 | 191 | 0 | 191 | 29/0 | 5 |
| 3.3 | 164 | 138 | 0 | 138 | 26/0 | 2 |
| 3.4 | 176 | 150 | 0 | 150 | 26/0 | 3 |
| 4.1 | 203 | 187 | 0 | 187 | 16/0 | 5 |
| 4.2 | 68 | 59 | 0 | 59 | 9/0 | 1 |
| 4.3 | 86 | 82 | 1 | 83 | 3/0 | 1 |
| 4.4 | 120 | 112 | 0 | 112 | 8/0 | 0 |
| 4.5 | 169 | 155 | 1 | 156 | 13/0 | 2 |
| 4.6 | 151 | 144 | 2 | 146 | 5/0 | 0 |
| 4.7 | 42 | 37 | 0 | 37 | 5/0 | 0 |
| 4.8 | 130 | 114 | 0 | 114 | 16/0 | 1 |
| 4.9 | 96 | 83 | 0 | 83 | 11/2 | 2 |
| 5.1 | 103 | 84 | 0 | 84 | 19/0 | 0 |
| 5.2 | 141 | 105 | 0 | 105 | 34/2 | 0 |
| 5.3 | 98 | 75 | 0 | 75 | 23/0 | 0 |
| 5.4 | 115 | 94 | 0 | 94 | 21/0 | 0 |

All21 tracked censuses reconcile. Four newly proposed tracked memberships are4.3 one,4.5 one and4.6 two. OSINT contributes one observed5.5 membership outside those tracked21, explicitly bound without inventing a tracked denominator. Five total new observed memberships do not multiply nine distinct global records. Source association and zero-objective rows do not approve or invent canonical assessed scope. Objectives3.4 and5.2 retain their prior totals;5.4 remains94/115 with21 remaining.

## Verification and release boundary

The focused audit rejects **2875** altered packets covering source/definition/row/display, aliases and token boundaries, semantic qualifications, unsafe learner/private exports, neighbor/family transfer, erased prior holds, false credit/counts and READY claims. Required release gates: focused write/recheck, all29 mapping tests/deterministic package, protected/source/native/ledger/specimen pins, whitespace, actual [skip deploy] exit0/control1, three task artifacts committed/pushed, exact remote refs and artifact bytes, empty index and eight unrelated dirty entries preserved. Remote completion is verified separately after push; a push is not live delivery.

No active runtime, private payload, live mutation, migration, shadow/cohort, pricing, publication, activation, owner/canonical approval, Phase3 or next-slice action. **This finite glossary review is complete; Phase2B-5 and production remain NOT READY.**
