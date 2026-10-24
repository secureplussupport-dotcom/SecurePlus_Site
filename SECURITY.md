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

## Known boundaries

Practice content is available in the client bundle. The product is not a secure examination platform or an anti-cheating system. Client presentation gates should not be described as content secrecy.

Passing local audits does not establish that every deployed policy, external service or dependency is secure. Dependency advisories, connected permission checks and security review are separate work. CI and local tests must not use production learner accounts or production database writes.
