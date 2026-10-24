# Developer setup

## 1. Frontend preview

Use Node.js 24 and npm. With a fresh checkout and no configured `.env.local`:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. This is enough to inspect the landing page, public flashcards and local demo interface. The login screen offers a local demo workspace when Supabase is not configured.

This mode does **not** supply the Vercel API. The guest diagnostic's generation request, server-backed adaptive state, real authentication and billing require the connected setup below. `npm run preview` serves the built frontend; it does not start the API either.

## 2. Connected development

```bash
cp .env.example .env.local
```

Replace placeholders before starting the application. Never commit the filled file.

| Setting | Location | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Browser | Supabase project URL and public client key. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Server only | Authenticated API operations and private engine access. |
| `VITE_MCQ_ENGINE_ENABLED`, `MCQ_ENGINE_ENABLED` | Browser / server | Enable both only after the engine schema and permissions are verified. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Server only | Checkout and signed webhook handling. Use a test-mode project for development. |
| `APP_URL`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL` | Server | Redirects for the development origin. |
| `RESEND_API_KEY`, `ACCOUNT_DELETE_FROM_EMAIL`, `ACCOUNT_DELETE_SITE_URL` | Server only | Account-deletion confirmation email. |
| `VITE_PUBLIC_POSTHOG_TOKEN`, `VITE_PUBLIC_POSTHOG_HOST` | Browser, optional | Product analytics. |

`VITE_` values are bundled into frontend JavaScript. A service-role key, Stripe secret or mail-provider key must never use that prefix. Public-client keys are not a substitute for database permissions.

Use the Vercel development runtime for the API routes:

```bash
npx vercel dev
```

The Vercel CLI may ask you to link a project. Use your own development services and the URL/port it prints. Configure Supabase Auth redirects for that development origin. Do not point experimental changes at production learner data.

### Database setup

The repository includes base schema files and historical incremental changes; there is not yet a single clean-room bootstrap command. Review [`supabase/schema.sql`](../supabase/schema.sql) and the dependencies of the current migrations before applying them to an empty development project. The active MCQ engine starts with [`20261019163949_mcq_three_deck_engine.sql`](../supabase/migrations/20261019163949_mcq_three_deck_engine.sql) and later MCQ/access/diagnostic migrations extend it.

Some later migrations also depend on profile, PBQ, bookmark and billing tables from the base setup. Verify the schema and service-role grants rather than assuming that applying only one SQL file creates the full product. Historical coin/referral setup scripts are not the current activation instructions.

### Billing

New checkout uses one-time Sprint and Comprehensive access passes, defined in [`accessModel.js`](../src/lib/accessModel.js) and fulfilled through [`access-pass.js`](../server/stripe/access-pass.js). Existing recurring subscriptions retain their legacy management paths. Older `STRIPE_PRICE_PRO*` placeholders in `.env.example` are not required by the current new-purchase checkout path.

## 3. Run the checks

```bash
npm run audit:mcq-engine
npm run audit:mcq-engine:database
npm run audit
npm run build
```

PGlite integration tests run against a disposable local PostgreSQL engine in WASM. They do not require Docker, a live database password or Supabase access.

`npm run audit` is the project's structural/product audit. It is different from `npm audit`, which reports dependency advisories. Neither command is a complete penetration test.

## 4. Build preview

```bash
npm run build
npm run preview
```

Open the URL printed by Vite. See the [deployment checklist](../DEPLOYMENT.md) before shipping a connected environment.
