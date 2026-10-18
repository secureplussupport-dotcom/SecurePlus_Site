# Security+ concept tag web

The tag catalogue is generated from the site's existing SY0-701 acronym cards. It currently has 236 distinct concepts: 235 acronym-card concepts and MTD from the existing continuity pilot. Each has a stable ID, a visible `#` tag, a name, and its source card when applicable. MAC, RBAC, and SOC/SoC have separate IDs and labels for their different meanings.

The web has 131 explicit, two-way review links across 169 concepts. Examples: `#RTO ↔ #RPO`, `#BIA ↔ #BCP ↔ #DRP`, `#CRL ↔ #OCSP`, `#SIEM ↔ #SOAR`, `#CVE ↔ #CVSS`, and `#SQLi ↔ #WAF`. A link means useful related review, not that two tags are synonyms; some connect an attack to its defense. The full list lives in [sy0701ConceptWeb.js](../src/data/sy0701ConceptWeb.js). Cards are not linked merely because they share a flashcard set. The 67 remaining concepts have no defensible explicit link yet and stay isolated.

This delivers the concept repository and relationship web only. It does not tag MCQs, alter Smart Review, change mastery scores, or touch PBQs. The next step is a searchable multi-tag field in Question Manager, followed by an MCQ-only Smart Review selector that uses the saved tags and these explicit neighbors. Untagged questions remain untagged; no semantic match is inferred from question text.
