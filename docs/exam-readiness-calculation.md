# Exam readiness, evidence version 2

Readiness is deterministic: the mean of all concept mastery values in each domain,
then a weighted sum using D1 12%, D2 22%, D3 18%, D4 28%, D5 20%.
`src/data/readinessConceptDomains.json` assigns each current tag exactly one primary
reporting domain. The catalogue completeness test rejects missing or extra tags.
These are reporting assignments, not relationships between concepts or new tags.
Security/cryptography tags belong to D1; attacks/vulnerabilities to D2;
architecture/network/data-protection tags to D3; IAM/operations/response to D4;
governance/risk to D5. Explicit operations exceptions are threat feeds, CVSS/CVE
(objective 4.3), input validation and WPA settings (4.1), sanitization (4.2),
and DLP (4.4/4.5). 802.1X remains architecture under port security (3.2).
These primary reporting assignments follow the [official objectives](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be),
not the tag prefix alone. Cross-domain concepts still have exactly one reporting
home, so they never receive duplicate weight.

Unattempted concepts start at 50. MCQ-set/exam history is replayed in timestamp,
event-ID order using the unchanged +20/-35, clamped 0–100 rule. Daily Challenge,
diagnostic, lessons, flashcards and unclassified standalone activity do not enter
readiness. Accuracy is a separate answered-question ratio. Public historical
attempts without source evidence remain available for overall activity totals,
not readiness or confidence. A new user sees no estimate, not a baseline 50%.

Confidence uses distinct question IDs, all five attempted domains and dated
practice evidence. Medium needs at least 50 distinct questions and two practice
days. High needs at least 150, three practice days and seven days between first
and last actual practice. Otherwise confidence is Low. Repeats cannot create new
question IDs. Practice-day boundaries for confidence are UTC, consistently in SQL
and local replay. Time passing without practice cannot promote confidence.

Labels and weights use unrounded values. Displayed readiness and domain mastery
use Math.round; rounding each domain can change the weighted displayed sum by at
most 0.5 point, so it reconciles within one point. Low evidence cannot show Exam
ready. More than 14 days without practice adds the stale notice while preserving
the last evidence-based label. Nothing decays mastery automatically.

The additive, read-only RPC `mcq_engine_readiness_evidence(uuid)` is executable only
by service_role. The authenticated HTTP route verifies the user's token and passes
that user's ID; it never accepts a caller-supplied owner. Old RPCs and grading
functions are unchanged, permitting rollback to the earlier application bundle.

Validation: `npm run audit:mcq-engine`, `npm run audit:mcq-engine:database`,
`npm run audit:improvements`. The disposable PostgreSQL suite verifies owner
isolation, exact evidence, zero history, replay behaviour and database permissions.
