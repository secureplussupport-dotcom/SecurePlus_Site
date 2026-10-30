# Flashcard definition completion — 30 October 2026

Completed the 189 blank definitions in the existing 502-card static bank.
All 313 previously populated definitions remain byte-for-byte unchanged.
No cards, deck memberships, IDs, concept tags, or learner-progress keys changed.

| Domain | Previously blank definitions filled | Remaining blanks |
|---|---:|---:|
| 1 — General Security Concepts | 58 | 0 |
| 2 — Threats, Vulnerabilities, and Mitigations | 35 | 0 |
| 3 — Security Architecture | 37 | 0 |
| 4 — Security Operations | 37 | 0 |
| 5 — Security Program Management and Oversight | 22 | 0 |
| Total | 189 | 0 |

## Scope and editorial method

Definitions are original, concise study explanations checked against the
[official SY0-701 objectives](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be)
and primary technical references. The bank is an owner-supplied vocabulary;
supporting terms are not a claim that every term is a separate official exam
objective. Deck subsection numbers remain custom groupings.

First pass: meaning, mechanism and concise wording for every missing term.
Second pass: review cryptographic/authentication boundaries, attack distinctions,
protocol properties, recovery measures and standards versions. Each added card
records its reference basis in `definition_source`. Sources support the
explanations; these are not quotations, CompTIA endorsement, or a claim about
unseen examination questions. The prior 313 definitions were preserved, not
subjected to a fresh full editorial review in this change.

## Important distinctions retained

- Diffie–Hellman establishes keying material; it is not bulk encryption or authentication by itself.
- CBC needs separate integrity protection; GCM is authenticated encryption and must not reuse a nonce with the same key.
- MD5 is collision-broken; its speed also makes it unsuitable for password storage.
- Digital signatures authenticate/sign data; they do not encrypt a message.
- A wildcard certificate does not automatically cover deeper subdomains or the bare parent domain.
- P12/PFX containers can contain private keys; DER is an encoding, not encryption.
- DNSSEC authenticates DNS data; it does not encrypt DNS queries.
- SNMPv3 supports encryption but requires an appropriate security level.
- ESP uses IP protocol 50, not TCP port 50; LDAP StartTLS and implicit TLS are distinguished.
- TOTP can be relayed; passwordless is not automatically multifactor or phishing-resistant.
- Pass-the-hash uses a stolen hash; Kerberoasting attempts offline cracking of service-ticket material.
- CORS is a browser response-reading policy, not server-side authorization.
- Resource reuse is explained in the syllabus's virtualization context.
- Clustering is not a backup; immutability does not remove the need for recovery testing.
- SOC 2 is an assurance examination/report, not an ISO-style certification.
- The legacy NIST Rev. 2 response phases are explicitly distinguished from current SP 800-61 Rev. 3 / CSF 2.0 alignment.

## Main reference families

- [NIST security controls, SP 800-53](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final), [configuration management, SP 800-128](https://csrc.nist.gov/pubs/sp/800/128/upd1/final), [zero trust, SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final), and [key management, SP 800-57](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final).
- [RFC 8439, ChaCha20](https://www.rfc-editor.org/rfc/rfc8439.txt), [NIST GCM](https://csrc.nist.gov/pubs/sp/800/38/d/final), [RFC 6151, MD5 limits](https://www.rfc-editor.org/rfc/rfc6151.txt), [RFC 5280, certificates](https://www.rfc-editor.org/rfc/rfc5280.txt), [RFC 7292, PKCS #12](https://www.rfc-editor.org/rfc/rfc7292.txt).
- [MITRE ATT&CK](https://attack.mitre.org/), [Kerberoasting](https://attack.mitre.org/techniques/T1558/003/), [pass-the-hash](https://attack.mitre.org/techniques/T1550/002/), [unquoted paths](https://attack.mitre.org/techniques/T1574/009/), [Lockheed Martin Cyber Kill Chain](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html), [the original Diamond Model paper](https://www.activeresponse.org/wp-content/uploads/2013/07/diamond.pdf).
- [OWASP input validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [XXE prevention](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html).
- [DNSSEC, RFC 4033](https://www.rfc-editor.org/rfc/rfc4033.txt), [ESP, RFC 4303](https://www.rfc-editor.org/rfc/rfc4303.txt), [SNMPv3, RFC 3414](https://www.rfc-editor.org/rfc/rfc3414.txt), [Kerberos, RFC 4120](https://www.rfc-editor.org/rfc/rfc4120.txt), [SPF, RFC 7208](https://www.rfc-editor.org/rfc/rfc7208.txt), [S/MIME, RFC 8551](https://www.rfc-editor.org/rfc/rfc8551.txt).
- [FIDO passkeys](https://fidoalliance.org/passkeys/), [TOTP, RFC 6238](https://www.rfc-editor.org/rfc/rfc6238.txt), [HOTP, RFC 4226](https://www.rfc-editor.org/rfc/rfc4226.txt), [NIST authentication guidance](https://csrc.nist.gov/pubs/sp/800/63/b/4/final).
- [NIST sanitization, SP 800-88 Rev. 2](https://csrc.nist.gov/pubs/sp/800/88/r2/final), [contingency planning, SP 800-34](https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final), [forensics, SP 800-86](https://csrc.nist.gov/pubs/sp/800/86/final), [incident response Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) and [withdrawn Rev. 2](https://csrc.nist.gov/pubs/sp/800/61/r2/final).
- [ISO/IEC 27001](https://www.iso.org/standard/27001), [CIS Controls](https://www.cisecurity.org/controls), [AICPA Trust Services Criteria](https://us.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria-redlined.pdf), [NTIA SBOM](https://www.ntia.gov/page/software-bill-materials).

## Validation

- The flashcard suite checks all 502 nonempty definitions, 189 added-source references, the unchanged hash of the prior 313 ID/definition pairs, deck/schema integrity, term-first reveal behavior, and important mechanism/version distinctions.
- Build and full product audit are run before delivery.
- Separate pending Why/About/free-lesson rework is excluded from this content release.
