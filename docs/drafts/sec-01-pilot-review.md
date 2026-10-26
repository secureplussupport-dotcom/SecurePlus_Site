# SEC-01 lesson pilot

Review URL: https://www.secureplusprep.com/pilots/sec-01/

A separate, public, noindex pilot for the proposed 47-lesson arrangement. It does not replace the current Deep Dives, alter existing tag-to-lesson recommendations, add MCQs to the practice bank, or write scores or progress. Micro-check selections exist only in page memory and reset on reload.

The pilot preserves the supplied SEC-01 scope: `sec.cia-triad`, `sec.non-repudiation`, `sec.defense-in-depth`; payroll anchor; CIA mechanism; exam trap; three micro-checks (answers B, C, B). The supplied backend schema is represented as static JSON in `src/pilots/sec01/lesson.json`; no backend or database change is required.

Editorial precision changes:

- No unauthorized viewing/disclosure is an explicit scenario assumption. Encrypted transit alone cannot establish confidentiality.
- Shared credentials weaken individual attribution. Unique accounts support accountability; correctly implemented digital signatures supply independently verifiable evidence of origin and integrity.
- A hardware-bound signing key strengthens key protection but does not make misuse, compromise or disputes impossible. The second question asks for the strongest additional evidence rather than an absolute guarantee.
- The ransomware question explicitly excludes unauthorized viewing as well as exfiltration. It tests unauthorized modification and loss of usable access, not merely host uptime.
- Raw hashes require a trusted reference; shared-key MACs do not supply non-repudiation.

Primary references:

- https://csrc.nist.gov/glossary/term/information_security
- https://csrc.nist.gov/pubs/fips/186-5/final
- https://csrc.nist.gov/glossary/term/non_repudiation

Validation: `node --test scripts/test-sec01-pilot.mjs`, `npm run audit`, `npm run build`, production HTML/asset inspection, and desktop/mobile browser checks. The old lesson library remains the current library pending review of this pilot.
