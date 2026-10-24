# MCQ transition latency — 24 October 2026

## Measured bottleneck

One live guest diagnostic run before this change took approximately 3.83 seconds on the click path: an access request (1.17 seconds), followed by generation (2.67 seconds). This is a single observation, not a percentile or service guarantee. Browser resource timings excluded the initial page load.

The live API response identified Singapore ingress and US function execution (`sin1::iad1`). The existing Supabase project is in Singapore (`ap-southeast-1`). Cross-region database round trips therefore affect each serial call.

## Changes

- Place only `api/sessions.js` in Vercel's Singapore region, beside the existing database. Other functions retain their configuration.
- After verified authentication, overlap independent access, fresh catalogue, mastery and optional bookmark reads. Keep the final quota/version-checked transaction and reread mastery on a version conflict.
- Coalesce simultaneous access requests for the same bearer token only while they are in flight. Subsequent requests still refresh; no generated sets or learner data are cached.
- Prepare the guest's signed cookie while the landing page is open, without generating a set or spending quota. Retry failed preparation and invalidate readiness when generation reports a missing/invalid cookie.
- Shorten page entry to 160 ms and diagnostic question exit/entry to 80/160 ms. Retain loading feedback and reduced-motion support.

No database migration, grading, mastery, selection, quota, account privilege or PBQ changes.

## Verification

`npm run audit:mcq-engine` passes 62 tests plus the source catalogue check. Additional tests prove concurrent reads start only after authentication, writes await all reads, failures cannot charge quota, conflicts reread state, access requests are isolated by bearer token, and guest preparation does not cache generation. `npm run audit:mcq-engine:database`, the full `npm run audit`, and `npm run build` pass.

Registered-user speed has not been measured with a live account. Concurrency is verified through controlled HTTP tests; production timing must be distinguished from that evidence.

## Production verification

Implementation commit `11580080c3f5864c53d8472b84e3a8f59ba70164` deployed successfully. The public root served the new `/assets/main-dDPIMPLi.js` bundle, and the live access endpoint returned HTTP 200 with `sin1::sin1` routing, confirming Singapore function execution.

Two fresh-page guest diagnostic checks loaded actual questions successfully. Initial access completed in the background (101 ms and 76 ms); clicking started generation directly with no additional access request. Generation took 300 ms and 280 ms, compared with the prior 3.83-second serial access/generation observation. These small, uncontrolled samples are evidence of the removed wait, not a production percentile or promise. No answers were submitted and no registered learner progress was changed. Repository privacy CI also passed.
