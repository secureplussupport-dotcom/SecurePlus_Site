# Archived: Mascot Manager and Cipher Coins

Archived on 22 October 2026 at the owner's request.

- Mascot Manager is absent from navigation, its route redirects home, and dynamic placement reads/rendering stop. Existing inline mascot illustrations remain part of the site's design.
- Cipher Coins and coin referrals have no active page, navigation entry, wallet pill, signup promotion, walkthrough, check-in, rewards, purchases or coin unlock flow.
- Legacy mutation and referral HTTP endpoints return 410. Wallet reads remain authenticated and read-only so previously purchased PBQs stay accessible. Wallet reads no longer repair/grant welcome coins.
- Perfect-set achievement tracking continues without coin rewards. Free PBQ previews and Pro access remain; previously purchased unlocks are retained and labelled “Unlocked”.
- Database migration disables the welcome trigger and revokes coin RPC execution and mascot-placement writes from API roles. It does not delete any rows, tables or original function definitions.
- The implementation, assets, original SQL and historical records are retained for recovery, guarded by `src/lib/archivedFeatures.js`. Restoring requires deliberately reviewing both the application guards and database grants/trigger; flipping a browser flag alone is insufficient.

Checks: `npm run audit:coins`, `npm run audit`, `npm run build`. The archive audit now verifies closed entry points and no welcome writes instead of expecting new coin awards.
