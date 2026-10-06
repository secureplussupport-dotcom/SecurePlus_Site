# Next editorial batch: 33 identities

Prepared for the owner; every identity/mapping decision below is still pending. This is not signed approval and does not authorize runtime publication. Match source revisions to mapping-package.json before deciding.

The two recorded PBQ source choices are reconciled separately in source-selection-decisions.json. Their original approval remains bound to package 2704b7fb7ccf4ecf2042edc4ac1f0015abd9ed4d12059dee5e664562be9c7ad5; regeneration cannot turn that into approval of new concepts or weights. Private p017 fingerprint matches its captured selected revision, but actual trusted compilation remains blocked by the unavailable protected in-memory handoff.

## Five pilot concepts

For each identity, choose keep, rename, merge or split. A concept is a specific skill we can assess separately; knowing a label is weaker than applying it in a new scenario. Confirm the exact objective and primary/secondary role only after reading the referenced questions privately. Different wording does not by itself make questions independent. All five currently lack enough independently human-reviewed families.

| Identity | Name | Current primary question proposals | Independently approved families | Decision |
| --- | --- | --- | ---: | --- |
| continuity.bia | Business Impact Analysis | mcq:m086 | 0 | Pending: keep / rename / merge / split; exact objective and roles |
| recovery.mtd | Maximum Tolerable Downtime | mcq:m196 | 0 | Pending: keep / rename / merge / split; exact objective and roles |
| recovery.mttr | Mean Time to Repair / Recover | none | 0 | Pending: keep / rename / merge / split; exact objective and roles |
| recovery.rpo | Recovery Point Objective | mcq:m088 | 0 | Pending: keep / rename / merge / split; exact objective and roles |
| recovery.rto | Recovery Time Objective | mcq:m032, mcq:m635, pbq:p048, pbq:p211 | 0 | Pending: keep / rename / merge / split; exact objective and roles |

Exact proposed question revisions:

- mcq:m032: sha256:c6c2951ce7458d7a61cb32f71f16c289e576c68f59663a80d75adf26b00630bc; proposed concept recovery.rto; proposed family restoration-target-identification.
- mcq:m086: sha256:9e148f874378cf9c70ce57a1a2a285ecb6900911fe8bc5adf6c94e2d6b061d2f; proposed concept continuity.bia; proposed family critical-function-impact-document.
- mcq:m088: sha256:1a2b43e815c9c682156636929e645c41a914979b8dbe766e32eff25867f8de29; proposed concept recovery.rpo; proposed family versioned-backup-interval.
- mcq:m196: sha256:c7d172bacf975a87dd3b79a33d1ff48182005a31eab9fc1fe4610b6e24c6000f; proposed concept recovery.mtd; proposed family outer-business-interruption-limit.
- mcq:m635: sha256:3df3c1be0e2e4477d1ed3e517e1eb521a67533b7dd3b84f72854efeeb9ebfcd0; proposed concept recovery.rto; proposed family restoration-target-identification.
- pbq:p048: sha256:c363b32b3efd0f4ae36fd5a58da0c0c6dbc5c5098d2031b5ef164387dcaa7f27; proposed concept recovery.rto; proposed family supplied-recovery-priority-ordering.
- pbq:p211: sha256:62894e03c5f39c75b69713ef7c7ad5205ce73da9f42097744f159636f8758f91; proposed concept recovery.rto; proposed family combined-recovery-and-retention-design.

## 28 objective topics

These are syllabus containers, not automatically separate mastery skills. Choose retain as topic, rename/merge, or propose a narrower assessed concept. A question's objective tag is a candidate scope marker; the MCQ count below is not proof that all skills within the objective are covered. Supporting terms keep zero mastery weight.

| Identity | Objective topic | Tagged MCQs | Decision |
| --- | --- | ---: | --- |
| sy0701.objective.1.1 | Types of security controls | 15 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.1.2 | Fundamental security concepts | 20 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.1.3 | Change management and security | 4 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.1.4 | Appropriate cryptographic solutions | 46 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.2.1 | Threat actors and motivations | 7 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.2.2 | Threat vectors and attack surfaces | 17 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.2.3 | Types of vulnerabilities | 21 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.2.4 | Indicators of malicious activity | 37 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.2.5 | Enterprise mitigation techniques | 10 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.3.1 | Security implications of architecture models | 22 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.3.2 | Security principles for enterprise infrastructure | 22 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.3.3 | Strategies to protect data | 8 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.3.4 | Resilience and recovery in security architecture | 1 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.4.1 | Security techniques for computing resources | 13 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.4.2 | Hardware, software, and data asset management | 1 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.4.3 | Vulnerability management | 19 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.4.4 | Security alerting and monitoring | 9 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.4.5 | Enterprise security capabilities | 13 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.4.6 | Identity and access management | 29 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.4.7 | Security automation and orchestration | 2 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.4.8 | Incident response activities | 18 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.4.9 | Investigation data sources | 3 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.5.1 | Security governance | 10 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.5.2 | Risk management | 21 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.5.3 | Third-party risk management | 5 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.5.4 | Security compliance and privacy | 12 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.5.5 | Audits and assessments | 7 | Pending: retain topic / rename or merge / propose narrower concept |
| sy0701.objective.5.6 | Security awareness practices | 3 | Pending: retain topic / rename or merge / propose narrower concept |

Record decisions in a new human review record bound to the current package hash. Do not edit the original PBQ decision record or claim an agent-generated recommendation is human approval. The remaining 402 supporting terms, question mappings, intervention usefulness, weights and family independence still require later batches.
