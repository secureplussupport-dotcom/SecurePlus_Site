# Phase 2B-5 — password cards and network glossary review

**NOT READY.** 12 October 2026. Baseline **bf71e2d73c1372a067b3021c7832482422eaddd8**. Packet SHA-256 **77d742fdf06d2d550b530f34eb0b12b893627c7454a7dca41ef82cb00f9fcad4**. Focused audit SHA-256 **d59da095e0a4739bc079bf26b614032fe39a259b7f78fdebe6da3691f4953bb4**. LOCAL/default-off/unwired/learner-invisible. Only this packet, report and focused audit change.

## Approved authority and finite selection

The master plan and Phase1 product-loop audit were read in full earlier in this continuing session and remain source-bound. The master plan governs approved product decisions; the audit supplies implementation evidence checked against current source. No unresolved document conflict changes behavior in this slice. Current chapter/token matching remains an observed migration gap, not an approved concept graph.

The preceding packet **docs/drafts/phase-2b5-malware-flashcards-proposals.json**, SHA **b1fb37555497459b14bf47ee0c81c34f05bd0c92d3f4c780382789852adb64a3**, report SHA **dba910d1aaae704e61121c89b4311cd2b1f7a316c531345a925f946bf9e8d961**, audit SHA **bc4603a07d010f629b43134b8340d5acfc595123ff00764d015c80c1dd080918**, supplies the exact objective2.4 census. Select exactly11 inventory-only identities: **deck:password-credential-attacks**, its five cards, and **glossary:bgp/dhcp/edr/icmp/udp**. Qualify **four card drafts, five glossary drafts and one partial container draft**. **Rainbow Table is held at zero credit.** No additional records receive credit.

Every draft retains null primary/scope/canonical-role proposals, null trusted revision, empty assessed roles, zero mastery and independent-family evidence, zero question/feedback credit, and no owner/human/publication/activation approval. Existing supporting-node links are candidates of weight0. Repeated faces, reused definitions, cross-objective memberships and containers are not independent assessments or proven post-miss recovery.

| Record | Decision | Exact source entry | Catalogue revision |
| --- | --- | --- | --- |
| deck:password-credential-attacks | Partial draft; owner pending | src/data/sy0701AcronymFlashcards.js:236 | sha256:9315f4b4e62eb9cf0ae759fa6de32f236e20b8f84def84ab7802d3b5fe692d3d |
| flashcard:sy0701-acronym-password-credential-attacks-brute-force-brute-force-attack | Qualified draft; owner pending | src/data/sy0701AcronymFlashcards.js:243 | sha256:222707846be81d1021c87f0c862609abd22c56bba67dbd1cff1dcc23f379ffc7 |
| flashcard:sy0701-acronym-password-credential-attacks-credential-replay-credential-replay | Qualified draft; owner pending | src/data/sy0701AcronymFlashcards.js:245 | sha256:f4bb60a13be4a2cf503855eb2f27cfd83c1579ee75ce2359a8212a7457d5afb1 |
| flashcard:sy0701-acronym-password-credential-attacks-dictionary-attack-dictionary-attack | Qualified draft; owner pending | src/data/sy0701AcronymFlashcards.js:246 | sha256:e8d3379d5a80a57927f12c0d220446b85df36f2f931e32b262f64776476a4b4e |
| flashcard:sy0701-acronym-password-credential-attacks-password-spraying-password-spraying | Qualified draft; owner pending | src/data/sy0701AcronymFlashcards.js:244 | sha256:a8d34e6e5934852de4eb3d23c8757d64096d13ce5393395d4a67dbc40e94b5fc |
| flashcard:sy0701-acronym-password-credential-attacks-rainbow-table-rainbow-table-attack | Held; zero credit | src/data/sy0701AcronymFlashcards.js:247 | sha256:e5f47f28bad4189cb0e5592d8644844535322d06434bca1892f9298ea29d4f21 |
| glossary:bgp | Qualified draft; owner pending | src/App.jsx:2252 | sha256:c7d7577d36f1f16163d9105f63636e85a424c9db0388131bdddba4250a65bc5d |
| glossary:dhcp | Qualified draft; owner pending | src/App.jsx:2281 | sha256:7289247f6c5a761a5efc7038bc51af4f158055e0a7cd200b1e73d4c3693907c6 |
| glossary:edr | Qualified draft; owner pending | src/App.jsx:2290 | sha256:51aecfa7148d7d3db8c0059b70fb195127a8e2316346328ffec124febfc6103b |
| glossary:icmp | Qualified draft; owner pending | src/App.jsx:2308 | sha256:88514de9a283064c161d77e0b9c70e0e91844c341cb7ce87a9df46669830ad16 |
| glossary:udp | Qualified draft; owner pending | src/App.jsx:2384 | sha256:704f1acf5d9a70c6c524ae921351b6be402aacd6fb73840bed98baf527df2ad3 |

All complete record identities, parent membership, metadata fingerprints, authored/delivered revisions, precise line/file hashes and support candidates are in sourceChecks. Source wording is unchanged. The frozen card inventory has no parentId; deck relations derive from flattened setId and exact authored membership, explicitly recorded rather than invented inventory fields. No question override/snapshot layer substitutes for cards or glossary entries.

## Semantic decisions and uncertainty

**Brute Force — iterative_password_or_key_candidate_trial_support.** Qualify repeated candidate trials and the fictional sequential four-digit PIN illustration; the supplied definition allows password or key search, while the example alone depicts credential attempts.

- Online guessing interacts with rate limits, lockouts and authentication policy; offline key/hash trials do not contact the login verifier. Neither universal exhaustive order nor guaranteed success is established.
- A wordlist is a candidate-selection strategy that can overlap brute force. Candidate trials differ from replay of already stolen material; no real PIN search, decryption or authentication is executed.

Candidate **sy0701.term.brute-force** remains unapproved instructional support of weight0.

**Credential Replay — reuse_of_stolen_authentication_material_support.** Qualify reuse of stolen credentials or session material, with a stolen cookie accepted in another browser as the stipulated example.

- Replay uses already obtained authentication material rather than searching password candidates. The cookie example depends on acceptance and validity, not a universal bypass of MFA.
- Expiry, revocation, audience, session/device binding and proof-of-possession requirements limit reuse. This does not establish pass-the-hash, defeat every challenge protocol, or approve stolen credential use.

Candidate **sy0701.term.credential-replay** remains unapproved instructional support of weight0.

**Dictionary Attack — wordlist_based_credential_candidate_support.** Qualify wordlist-based password candidates and variations, with the supplied login-script illustration as online guessing rather than evidence of hash recovery.

- Wordlists can also drive offline cracking; online lockouts do not constrain an attacker-owned offline trial process. The fictional candidate count is not a measured success rate.
- Dictionary selection and brute force overlap rather than forming exclusive families. It is not inherently credential stuffing using known username/password pairs, nor replay of an accepted session.

Candidate **sy0701.term.dictionary-attack** remains unapproved instructional support of weight0.

**Password Spraying — few_password_candidates_many_accounts_support.** Qualify a few common candidates spread across many accounts, with avoiding per-account lockouts understood as the strategy intent rather than a success guarantee.

- Spraying contrasts with many guesses concentrated on one account. Cross-account, IP, tenant and time-based controls can still detect or block it; the fictional example supplies no successful login or bypass.
- A spray can use dictionary candidates, so candidate-source and distribution labels overlap. Stolen session replay and offline hash recovery are distinct premises; no actual account attempts occur.

Candidate **sy0701.term.password-spraying** remains unapproved instructional support of weight0.

**Rainbow Table — rainbow_method_vs_generic_hash_lookup_held.** Hold the whole card at zero credit: its definition describes generic precomputed hash lookup, and its instant MD5 lookup example supplies no rainbow-chain or time-memory distinction. The example cannot establish that the table is a rainbow table.

- Rainbow-table chains use position-dependent reductions and stored chain endpoints with reconstruction, rather than requiring a complete hash-to-password dictionary. A brief card need not teach the algorithm, but its distinguishing method is not supplied here.
- Recovery requires matching hash/precomputation coverage and relevant salt/algorithm parameters; a hash is not decrypted and lookup is not universally instant. Offline recovery is separate from online login lockout. No new recovery evidence or generic lookup promotion is granted.

No card or support-reference promotion.

**BGP — inter_autonomous_system_routing_support.** Qualify the Border Gateway Protocol expansion and inter-autonomous-system routing role as brief vocabulary; this is not a complete account of all BGP peerings.

- Internal BGP peers within an autonomous system also exist; the short definition does not imply BGP operates only between systems.
- The sole source reference is an incorrect-option routing contrast in m050, not evidence that the selected DNS attack is BGP hijacking. No route authenticity, RPKI, hijack detection or router configuration skill is approved.

Candidate **sy0701.term.bgp** remains unapproved instructional support of weight0.

**DHCP — automatic_host_address_configuration_support.** Qualify automatic distribution of IP addressing settings, keeping host configuration distinct from DNS name resolution or identity authentication.

- DHCPv4 supports automatic, dynamic and administrator-assigned allocation; not every assignment must be temporary. DHCPv6 and a complete exchange are outside this short entry.
- A received configuration need not be trustworthy or globally unique. Rogue servers, conflicting static addresses and overlapping scopes remain possible; no snooping, starvation defense, lease or DORA execution is tested.

Candidate **sy0701.term.dhcp** remains unapproved instructional support of weight0.

**EDR — endpoint_detection_investigation_response_support.** Qualify endpoint monitoring and support for detection, investigation and containment as a tool category, with capabilities conditional on sensors, configuration and response authority.

- EDR is not guaranteed to capture all events, detect every threat, prevent compromise or automatically contain every host. Provider capabilities and licensing differ.
- Endpoint response differs from a promise of complete cross-domain XDR correlation or every antivirus function. Existing cards, lessons and PBQs are source references only; no incident response or unsupported component is newly approved.

Candidate **sy0701.term.edr** remains unapproved instructional support of weight0.

**ICMP — network_control_diagnostic_error_support.** Qualify Internet Control Message Protocol diagnostic and error-reporting purposes, including the stated ping example as one echo-message use.

- ICMP is not a TCP/UDP application service; echo is only one message type. Filtering or no response is not proof that a host is down, and control/error reporting does not guarantee packet delivery.
- The selected source reference in m143 is wrong-option Smurf feedback. It does not turn the UDP scenario into ICMP; ICMPv6 operation, broadcast reflection premises and a successful attack are not taught or tested here.

Candidate **sy0701.term.icmp** remains unapproved instructional support of weight0.

**UDP — connectionless_datagram_transport_support.** Qualify connectionless datagram transport, interpreting the speed phrase as low setup/transport overhead rather than guaranteed superiority over TCP; retain conditional spoofing/amplification risk.

- UDP supplies no inherent delivery, ordering or congestion guarantee; applications may add reliability, congestion handling and cryptographic protection. Connectionless does not mean every application must be insecure or unreliable.
- Spoofing requires a permitted path and amplification requires application response behavior and reachable services; UDP alone does not amplify packets. The entry supplies no incident, measured speed, guaranteed DDoS or operational mitigation coverage.

Candidate **sy0701.term.udp** remains unapproved instructional support of weight0.

The deck at **src/data/sy0701AcronymFlashcards.js:235** retains all five children. Its title/description groups password guessing, token reuse and hash recovery; the container disposition qualifies navigation for four child drafts while preserving the fifth hold. It does not approve all children, all2.4/4.6 skills, an attack simulation, or another distinct assessed item.

**Rainbow Table hold is a review inference, not a claim that the fictional hash lookup is impossible.** [Oechslin's original2003 paper, sections1.1 and3](https://www.cs.miami.edu/~burt/learning/Csc609.082/docs/crypto03.pdf), read via a university-hosted author-paper copy, distinguishes chain endpoint storage/reconstruction and position-dependent reductions from a full precomputed lookup. The card can also describe a generic dictionary; its instant MD5 example does not resolve that ambiguity. IACR/EPFL copies were unavailable, so no access to those copies is claimed. No historical benchmark is transferred to current MD5/password performance. [NIST80063B,3.1.1.2 and AppendixA](https://pages.nist.gov/800-63-4/sp800-63b.html) supplies salted/costed verifier and offline-attack context; no deployed password storage is inspected.

[MITRE password guessing](https://attack.mitre.org/techniques/T1110/001/) and [spraying](https://attack.mitre.org/techniques/T1110/003/) support candidate/distribution distinctions and policy-dependent lockout limits. [MITRE cracking](https://attack.mitre.org/techniques/T1110/002/) identifies offline hash recovery. [MITRE session-cookie reuse](https://attack.mitre.org/techniques/T1550/004/) supports accepted stolen-session reuse. [RFC6750,1.2](https://www.rfc-editor.org/rfc/rfc6750) supplies a bearer-possession analogy; the card's cookie is not asserted to implement OAuth. Wordlist selection, broad brute-force search and spraying can overlap; labels do not create independent mastery families.

[RFC4271 abstract/1.1/3](https://www.rfc-editor.org/rfc/rfc4271) supports the BGP role and internal peers. [RFC2131,1/7](https://www.rfc-editor.org/rfc/rfc2131) bounds DHCPv4 allocation/configuration and unauthenticated-server risks. [Microsoft EDR capabilities](https://learn.microsoft.com/en-us/defender-endpoint/overview-endpoint-detection-response) illustrates investigation/response with product/event-coverage conditions, not universal guarantees. [RFC792 introduction/echo](https://www.rfc-editor.org/rfc/rfc792) bounds ICMP reporting and ping. [RFC768](https://www.rfc-editor.org/rfc/rfc768) and [RFC8085,1/6](https://www.rfc-editor.org/rfc/rfc8085) support minimal datagrams, application-added functions and conditional amplification/spoofing premises. These inspected sections verify bounded vocabulary; no complete standards-conformance, network or incident test is claimed.

## Actual card renderer, gates and matchers

Direct makeCard/makeSet and flattened exports: **src/data/sy0701AcronymFlashcards.js:22, src/data/sy0701AcronymFlashcards.js:51, src/data/sy0701AcronymFlashcards.js:720, src/data/sy0701AcronymFlashcards.js:235**. The mode/predicate/face source at **src/App.jsx:30820, src/App.jsx:458, src/App.jsx:30923** is executed as a pure source-derived probe. All five cards offer definition/acronym/example modes: **15 offered face probes and15 reverse-order probes**. Two acronym-mode prompts use the name-difference predicate (**Brute Force and Rainbow Table**); three fall back to definition mode. The predicate accepts name variations, not just linguistic acronyms. All answer backs repeat the definition, so the Rainbow Table limitation is reachable in every mode. Other modes or shuffles add no evidence.

The chooser at **src/App.jsx:30837** offers all modes to guests. Ordinary opening at **src/App.jsx:31898** requires neither account nor Pro; the example-bearing deck prompts for a mode even with a signed-in default. The lab at **src/App.jsx:30903** uses plain text with no GlossaryText popup. Reveal/Again/Got it uses self-ratings; every distinct rated card counts toward pass completion regardless of self-label. Stored mastered IDs and conditional Supabase synchronization are source-observed; no React/account/storage/network/telemetry/rating handler executes here.

Related lessons from **src/App.jsx:734** with **src/App.jsx:656** tokens are **lesson:api-session-browser-security, lesson:malware-indicators-attacks, lesson:web-social-dns-attacks**. Exact lesson revisions are context-only, without fresh content or remediation approval. The related-lesson click requires an account then Pro; starred containers suppress destinations. Weak-area selection at **src/App.jsx:657** uses chapter/topic/lexical metadata and deduplicated fallback ranking. Synthetic chapter2/topic context selects all five candidate cards among18; the other13 receive zero new credit. Missing chapter returns null. Random acronym mode at **src/App.jsx:497** uses the same predicate, admitting only the two name-difference cards here. None of the eight bound selectors becomes an approved intervention.

## Actual glossary renderer and usage limits

Dictionary source **src/App.jsx:2235** spreads ACRONYM_GLOSSARY_TERMS into GLOSSARY_TERMS without overriding these five keys. Renderer **src/App.jsx:20677**, formatting **src/App.jsx:20657**, matcher **src/App.jsx:20680**, entry **src/App.jsx:20683**, part split **src/App.jsx:20694** use case-insensitive, longest-first, ASCII-alphanumeric boundaries within each inline-format segment. The45 probes check six exact/case/format/punctuation matches and three extension/split exclusions per term. Five further boundary checks reject automatic full-name or plural aliases. Matching makes no context-sensitive sense decision. Popup full name/definition are plain text without recursive popups. The component exposes keyboard Enter/space, focus, aria expansion and outside-pointer close, but no own account/Pro gate; parent routes still control availability. No real browser interaction is claimed.

The usage census is **BGP1, DHCP7, EDR12, ICMP2, UDP7** source references. Every parent catalogue/local revision is bound in usageInventory, including already reviewed parents. Lexical union metadata and a reference are not proof of a visible popup, correct answer, approved objective scope or a new parent disposition.

| Glossary | Actual local MCQ surface probe | Source-observed gate |
| --- | --- | --- |
| glossary:bgp | mcq:m050 / options | selected_question_visible_options |
| glossary:dhcp | mcq:m152 / options | selected_question_visible_options |
| glossary:edr | mcq:m132 / stem | selected_question_visible_stem |
| glossary:icmp | mcq:m143 / wrong_feedback | selected_question_submitted_Pro_feedback |
| glossary:udp | mcq:m143 / stem | selected_question_visible_stem |

Question context/stem **src/App.jsx:20800**, option/main/wrong feedback **src/App.jsx:24992** use GlossaryText. BGP appears in m050's incorrect routing option; ICMP appears in m143's incorrect Smurf feedback, while that stem describes UDP reflection/amplification. The distinctions remain independent of tooltip content. Main and wrong feedback require selected/submitted Pro context; options have a disabled ancestor after submission, so actual popup interaction then is unverified. No acronym-only metadata is promoted to delivery.

DeepDiveReadableBites **src/App.jsx:31203** uses GlossaryText for first sentences and separately collapsed detail. The source-derived lesson probes are **glossary:dhcp section:network-protocols-ports:2 body[0] first_sentence; glossary:dhcp section:network-protocols-ports:2 body[0] collapsed_supporting_detail; glossary:edr section:endpoint-mobile-hardening:0 body[1] collapsed_supporting_detail; glossary:udp section:network-protocols-ports:0 body[0] collapsed_supporting_detail**. Parent navigation **src/App.jsx:31239** requires selected Pro context except separately existing preview routes. Tables/headings/keywords/aliases remain plain or unrendered contexts; **1** selected-term table observations are bound separately, without claiming popups. The three DHCP/EDR/ICMP card references have plain faces and no glossary popup.

PBQ prose/renderer **src/App.jsx:20765, src/App.jsx:26211** contain conditional GlossaryText paths; the five PBQ references are bound source context only, without blanket component/rendering/feedback approval. EDR's p079/p083 SELECT & FILL records keep unsupported-design/null-trusted holds. UDP in p027's contrast feedback does not establish UDP traffic in its TCP SYN scenario. No answer keys, raw choices/faces, private payloads or learner identifiers enter this review export.

## Preserved lineage and accounting

Verify all **83 preceding substantive packets**, source bindings, current ledger/package and exact prior census revisions against actual bound disposition arrays. Older question-only judgments42 (30MCQ/12PBQ), duplicate references22 and support-only references7 retain their prior treatment. Prior instructional occurrences361/distinct353 contain eight repeats;10 new distinct dispositions yield371 occurrences/distinct363. Six limited instructional references remain uncredited; five explanation-context records remain outside the eight support kinds. None of these selected identities occurred in prior instructional arrays.

**34 preceding semantic holds** plus the new Rainbow Table hold remain unresolved. **18 exact prior field bindings** preserve older dispositions/reasons. Ransomware card and section:malware-indicators-attacks:0 remain separate, zero-credit holds; no password/network qualification repairs them. Preserve ten earlier card holds, four earlier glossary holds including SQLi/SQL injection, Wi-Fi teaching holds, memory practice/feedback holds, recent question deferrals,23 unsupported PBQs, older question-only feedback gaps, CORS zero-credit API teaching and optional authorization Beyond the textbook. Pilot/KEV/recovery/single-pair/hidden-evidence/owner/canonical/grammar/component/operational limits remain unchanged. Four private p003/p017 question/feedback identities remain unavailable/unreviewed/null-trusted without fetching or substituting a local fallback.

| Measure | Prior | New | Combined pending | Remaining |
| --- | ---: | ---: | ---: | ---: |
| Eight support kinds /834 |342|10|352|482|
| Entire catalogue /1878 |1243|10|1253|625|
| Cards /313 |105|4|109|204|
| Containers /29 |7|1 partial|8|21|
| Glossary /162 |93|5|98|64|
| Questions /483 |454|0|454|29|
| Full feedback and complete pairs /483 |447|0|447|36|

MCQ questions/pairs remain395/395; PBQ questions59/88 and complete pairs52/88. **10 distinct dispositions produce35 observed objective memberships**, not35 global credits. Objective2.4 is171+10=181/199 with18remaining;4.6 is98+5=103/151 with48remaining;4.1 is95+3=98/203 with105remaining;2.3 remains142/162 with20remaining. Glossary broad tags retain observed memberships only; BGP/DHCP/EDR/ICMP/UDP do not establish full attack/architecture/operations competency.

| Observed objective | Denominator | Prior | New card / partial deck / glossary | Combined pending | Remaining local/private |
| --- | ---: | ---: | --- | ---: | --- |
| 2.2 | 134 | 115 | 0/0/0 | 115 | 19/0 |
| 2.3 | 162 | 142 | 0/0/0 | 142 | 20/0 |
| 2.4 | 199 | 171 | 4/1/5 | 181 | 18/0 |
| 2.5 | 66 | 40 | 0/0/0 | 40 | 26/0 |
| 3.1 | 220 | 110 | 0/0/1 | 111 | 109/0 |
| 3.2 | 220 | 111 | 0/0/3 | 114 | 106/0 |
| 3.3 | 164 | 46 | 0/0/3 | 49 | 115/0 |
| 3.4 | 176 | 50 | 0/0/3 | 53 | 123/0 |
| 4.1 | 203 | 95 | 0/0/3 | 98 | 105/0 |
| 4.2 | 68 | 39 | 0/0/0 | 39 | 29/0 |
| 4.3 | 86 | 62 | 0/0/0 | 62 | 24/0 |
| 4.4 | 120 | 39 | 0/0/2 | 41 | 79/0 |
| 4.5 | 169 | 70 | 0/0/3 | 73 | 96/0 |
| 4.6 | 151 | 98 | 4/1/0 | 103 | 48/0 |
| 4.7 | 42 | 12 | 0/0/0 | 12 | 30/0 |
| 4.8 | 130 | 54 | 0/0/0 | 54 | 76/0 |
| 4.9 | 96 | 23 | 0/0/2 | 25 | 69/2 |
| 5.2 | 141 | 67 | 0/0/0 | 67 | 72/2 |

The full global and18-objective censuses reproduce1878 identities,625remaining, **2547 memberships**, **1421 distinct objective-associated records** and **536 shared records**. **612** revision-bound prior overlaps add zero new semantic/independence credit. All by-kind and prior+new+remaining splits reconcile; the other eight observed objectives receive no new membership.

## Verification and release boundary

Run **node scripts/audit-password-network-glossary.mjs** and **npm run audit:content-mapping**. The focused audit verifies exact11 selection, whole cards/15faces/15reverse probes, partial deck, five full glossary definitions,45matcher/five alias-boundary probes, actual local surface/lesson probes, source gates, eight selector bindings,83prior packets, all inherited holds, full accounting and25 protected release hashes. **986 rejected adversarial mutations** cover drift in content/revisions/faces/parents/definitions/matcher results, missing holds, trust/approval/scope/weight escalation, extra/duplicate credit, stale references, unsafe exports and activation. It regenerates source-bound packet/report text and validates a JSON round trip before writing.

All29 mapping tests and deterministic package reproduction, configured **[skip deploy]** handling and git diff checks precede the task-only three-file commit/push. HEAD/origin/remote identity, remote byte hashes, all25protected hashes and the exact unrelated dirty state are checked afterward. This report describes local review evidence; push does not establish deployed behavior.

Exact-revision owner approval, final canonical scope/roles, trusted component grammar, private coverage, independence/calibration, verified recovery and operational release/rollback gates remain open. No learner runtime/browser, Supabase/private fetch, migration, deployment, activation, entitlement or Phase3 work. **Phase2B-5 NOT READY.**
