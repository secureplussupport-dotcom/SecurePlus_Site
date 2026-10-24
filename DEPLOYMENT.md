# Deployment checklist

Start with the [developer setup guide](docs/developer-setup.md) for environment variables and database prerequisites. The public deployment target is Vercel; the API entry points are in `api/`.

## Before release

```bash
npm ci
npm run audit:mcq-engine
npm run audit:mcq-engine:database
npm run audit
npm run build
```

Review dependency advisories separately with `npm audit`. Passing structural checks does not establish that dependencies are vulnerability-free.

## Configure services

1. Create or select the intended Supabase environment and verify base tables, migrations, RLS and service-only function grants. Do not replay historical setup scripts blindly.
2. Configure the actual deployment origin in Supabase Auth's site URL and redirect allowlist. Enable only the authentication providers you intend to support.
3. Set frontend public keys and server-only credentials in the deployment environment. Keep service-role, Stripe and email-provider secrets out of `VITE_` variables.
4. Enable the frontend/server MCQ flags together only after the current engine, access and diagnostic migrations have been applied and checked.
5. For billing, configure the signed Stripe webhook endpoint and verify test-mode fulfillment first. New purchases use one-time access passes; legacy recurring subscriptions have separate management paths.
6. Configure verified email delivery and account-deletion URLs if those features are enabled.

## Verify the release

A successful push or build is not proof that the new code is live. Check the actual site's referenced bundle or visible behavior after deployment. Then test relevant connected flows using a test account: authentication, generated sets, saved progress, access limits and any billing change being released.

Use [feature documentation](docs/README.md) for source-specific checks and known boundaries. Guest diagnostic details live in [the funnel guide](docs/guest-diagnostic-funnel.md). PWA assets are in `public/manifest.webmanifest` and `public/sw.js`.

## Recovery

Keep the prior working Vercel deployment available for a frontend/API rollback. Database changes need a separate reviewed recovery plan; reverting an application commit does not reverse a migration. Preserve learner progress and existing subscriptions during releases.
