# Security notes

## Reporting

Report potential vulnerabilities privately to **secureplus.support@gmail.com**. Include a reproducible description and the affected component; do not include live credentials or learner records in a public issue.

## Implemented boundaries

- API routes verify the Supabase bearer token and derive the user identity on the server.
- Adaptive state is held in a private schema with RLS and restricted browser-role access. Engine RPCs are invoked by the verified server using its service role.
- Answer grading uses selected option IDs and owned question snapshots. Client-submitted correctness is not trusted by the adaptive engine.
- Answer recording and guest diagnostic import use database transactions and idempotency checks.
- Stripe webhook signatures and server-side fulfillment validate billing events. New purchases use one-time access passes; legacy subscription support is separate.
- Account deletion has an authenticated confirmation flow. See the implementation before changing its token or email behavior.

Relevant examples: [`http.mjs`](server/mcq-engine/http.mjs), [`MCQ engine migration`](supabase/migrations/20261019163949_mcq_three_deck_engine.sql), [`diagnostic import`](supabase/migrations/20261024012841_guest_diagnostic_handoff.sql), [`database tests`](scripts/test-mcq-engine-database.mjs).

## Credentials

Do not commit real `.env` files, service-role keys, database passwords, OAuth secrets, Stripe secrets or email-provider credentials. `.env.example` contains placeholders only. Browser `VITE_` values are public build inputs; never put privileged credentials there.

## Public repository safeguards

GitHub secret scanning and push protection are enabled. The `Repository privacy`
workflow checks tracked paths and scans Git history with Gitleaks on pushes and pull
requests. Its scanner version and download checksum are pinned; candidate values
are redacted and no scan-report artifacts are uploaded.

Local environment files, credential files, operational exports and database dumps
are ignored and checked by `scripts/audit-repository-privacy.mjs`. These filename
rules do not detect personal data pasted into an otherwise ordinary source file.
Use synthetic/example identities in fixtures and screenshots; never commit learner
records, billing exports, browser sessions or database backups.

Before publishing changes:

```bash
node --test scripts/test-repository-privacy.mjs
node scripts/audit-repository-privacy.mjs
gitleaks git --log-opts="--all" --redact --no-banner .
```

`.gitleaksignore` contains only exact historical finding fingerprints reviewed as
revision checksums, developer text or the explicit `password123` teaching example.
It does not exempt whole files or disable scanner rules. Review each new finding;
if an actual secret was published, revoke/rotate it before considering history
cleanup. Removing a current file or adding an ignore rule does not erase history
or copies already downloaded. Commit attribution remains public.

## Known boundaries

Practice content is available in the client bundle. The product is not a secure examination platform or an anti-cheating system. Client presentation gates should not be described as content secrecy.

Passing local audits does not establish that every deployed policy, external service or dependency is secure. Dependency advisories, connected permission checks and security review are separate work. CI and local tests must not use production learner accounts or production database writes.
