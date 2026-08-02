# SecurePlus

SecurePlus is a React/Vite practice platform for CompTIA Security+ study. It includes MCQ practice, PBQ simulations, daily challenges, progress tracking, Stripe subscription routes, and Supabase schema/policies for Free vs Pro access.

Support: `secureplus.support@gmail.com`

## Stack

- Frontend: React + Vite
- Hosting target: Vercel
- Auth/database: Supabase
- Payments: Stripe Checkout + Stripe Billing Portal
- Analytics: PostHog
- API runtime: Vercel serverless functions in `api/`

## Repository Structure

```txt
api/
  _utils.js
  account/delete.js
  stripe/checkout.js
  stripe/portal.js
  stripe/webhook.js
src/
  App.jsx
  main.jsx
  lib/supabaseClient.js
  lib/analytics.js
docs/
  launch-runbook.md
  github-actions-verify-template.yml
supabase/
  schema.sql
.env.example
index.html
package.json
vite.config.js
```

## Local Setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open:

```txt
http://127.0.0.1:5173/
```

The frontend can run as a local demo using browser `localStorage`. Real Supabase auth and Stripe checkout need environment variables and the Vercel API runtime.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
ACCOUNT_DELETE_FROM_EMAIL=SecurePlus <noreply@secureplusprep.com>
ACCOUNT_DELETE_SITE_URL=https://secureplusprep.com

STRIPE_SECRET_KEY=
STRIPE_PRICE_PRO=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_WEBHOOK_SECRET=

APP_URL=
STRIPE_SUCCESS_URL=
STRIPE_CANCEL_URL=

VITE_PUBLIC_POSTHOG_TOKEN=
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Frontend-safe:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PUBLIC_POSTHOG_TOKEN`
- `VITE_PUBLIC_POSTHOG_HOST`

Server-only:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ACCOUNT_DELETE_FROM_EMAIL`
- `ACCOUNT_DELETE_SITE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Never expose server-only keys in browser code or commit them to GitHub.

## Supabase Setup

1. Create a Supabase project.
2. Go to SQL Editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/pbqs.sql`.
5. Run `supabase/cipher-coins.sql` last. This closes the old referral trial, creates the Cipher Coin wallet/ledger, and updates PBQ access rules.
6. Run `supabase/account-deletion.sql`. This adds short-lived, server-only account deletion requests.
7. Confirm these tables exist:
   - `profiles`
   - `attempts`
   - `referrals`
   - `cipher_coin_transactions`
   - `cipher_coin_unlocks`
   - `cipher_coin_daily_activity`
   - `account_deletion_requests`
8. Enable only the auth providers you actually use. Current plan: Email + Google.

The schema includes:

- `profiles.tier` with allowed values `free` and `pro`
- Stripe customer/subscription fields
- `attempts` for quiz/PBQ history
- `referrals` for the +100 Cipher Coin reward given to both learners
- An immutable, idempotent Cipher Coin ledger and permanent PBQ unlock records
- Row Level Security policies
- Signup trigger that creates a Free profile automatically

## Analytics Setup

Create a free PostHog project, then add these to Vercel:

```bash
VITE_PUBLIC_POSTHOG_TOKEN=phc_xxx
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

The app tracks safe product events such as signup, Daily Challenge starts, MCQ answers, locked PBQ clicks, upgrade clicks, checkout starts, and referral link copies. It does not track passwords or card details.

Recommended PostHog funnels:

- Landing page -> signup -> MCQ quiz started.
- PBQ locked clicked -> upgrade clicked -> checkout started.
- MCQ quiz started -> MCQ quiz completed.

## Referral Program

Users can open the Referrals page and copy a link like:

```txt
https://secureplusprep.com/?ref=ABC123
```

When a new user signs up with the link, `/api/referrals/claim` grants 100 Cipher Coins to both users in Supabase. Each new account can claim one referral, while a referrer can invite multiple new learners.

If the rest of the database is already set up, you can run only:

```txt
supabase/cipher-coins.sql
```

The Referrals page calls `/api/referrals/me`, which creates or returns the user's real Supabase referral code. The old seven-day Pro referral reward is retired; do not run `supabase/referrals.sql` for a new installation.

## Stripe Setup

Under the **Pro Academy Pass** product, create these two recurring Stripe prices:

```txt
Monthly Flex: $4.99 USD every month
3-Month Plus: $9.99 USD every 3 months
```

Stripe recurring amounts and billing intervals cannot be edited in place. Create new Prices under the existing SecurePlus Pro product, then save both Price IDs:

```bash
STRIPE_PRICE_PRO=price_three_month_xxx
STRIPE_PRICE_PRO_MONTHLY=price_monthly_xxx
```

Checkout validates the selected Price on the server before charging: Monthly Flex must be an active `$4.99 USD` monthly Price, and 3-Month Plus must be an active `$9.99 USD` Price renewing every 3 months. Yearly or incorrectly priced IDs are rejected so customers cannot be billed differently from the pricing page. Existing subscriptions are not silently changed; manage those separately in Stripe.

API routes:

- `POST /api/stripe/checkout`: creates a subscription Checkout Session for the logged-in Supabase user
- `POST /api/stripe/cancel`: schedules the logged-in user's Stripe subscription to stop renewing at the end of the current paid period
- `POST /api/stripe/sync`: verifies the logged-in user's Stripe subscription and updates Supabase after Checkout returns
- `POST /api/stripe/portal`: opens Stripe Billing Portal for cancellation/membership management
- `POST /api/stripe/webhook`: verifies Stripe webhook signatures and updates `profiles.tier`
- `POST /api/account/delete-request`: verifies the session, creates a 15-minute single-use request, and sends through Resend or the temporary Supabase Auth fallback
- `POST /api/account/delete`: requires the signed-in session and matching single-use token, cancels an active subscription, revokes sessions, and deletes the Supabase user

For the most reliable production account-deletion delivery, add `RESEND_API_KEY`, use a verified sender in `ACCOUNT_DELETE_FROM_EMAIL`, and set `ACCOUNT_DELETE_SITE_URL` to the public site origin. Until that key is configured, SecurePlus falls back to the Supabase Auth mailer. The UI reports provider rejection and provides a one-minute resend cooldown instead of claiming an email was sent when it was not accepted.

Stripe webhook events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Run `supabase/stripe-cancellation.sql` once if your Supabase project existed before the cancellation-status columns were added. SecurePlus uses Stripe's period-end cancellation, so users are not billed again but keep Pro until their current paid period ends.

Test card:

```txt
4242 4242 4242 4242
Any future expiry
Any CVC
```

## Vercel Deployment

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add all environment variables in Vercel Project Settings.
4. Deploy.
5. Add the deployed domain to Supabase Auth URL settings.
6. Add the deployed webhook URL in Stripe:

```txt
https://your-domain.com/api/stripe/webhook
```

## Mobile App Install

SecurePlus is configured as an installable Progressive Web App (PWA). After Vercel deploys it, students can add it to their phone home screen.

iPhone:

1. Open `https://www.secureplusprep.com` in Safari.
2. Tap the Share button.
3. Tap `Add to Home Screen`.
4. Confirm the name `SecurePlus`.

Android:

1. Open `https://www.secureplusprep.com` in Chrome.
2. Tap the three-dot menu.
3. Tap `Add to Home screen` or `Install app`.
4. Confirm the install.

The PWA uses `public/manifest.webmanifest`, `public/sw.js`, and the app icons in `public/`. For App Store or Play Store distribution later, wrap the same React app with Capacitor.

## Security Notes

- RLS prevents users from reading another user's `profiles` or `attempts`.
- Users cannot directly update `profiles.tier`; Stripe webhook/server-side code handles Pro status.
- Server routes validate Supabase bearer tokens before checkout, billing portal, or account deletion.
- Stripe webhook verifies the Stripe signature before updating membership.
- No `dangerouslySetInnerHTML` is used in the current app.
- No real API keys or secrets should be committed.

Known limitation before production:

- Premium PBQ content is currently bundled in frontend JavaScript. The UI blocks Free users, but determined users could inspect the bundle. For strong premium protection, move Pro-only content to Supabase or an API route and verify `profiles.tier = 'pro'` server-side before returning it.

## Build

```bash
npm run audit
npm run build
```

`npm run audit` runs all launch checks:

- `audit:launch` for subscription/security guardrails
- `audit:seo` for public SEO pages and sitemap coverage
- `audit:pwa` for mobile/PWA install readiness
- `audit:qbank:strict` for MCQ/PBQ quality gates

For question-bank-only checks:

```bash
npm run audit:qbank
npm run audit:qbank:strict
```

Preview production build:

```bash
npm run preview
```

## GitHub Commit Checklist

Before pushing:

```bash
npm run audit
npm run build
npm audit --audit-level=moderate
```

Check that these are not committed:

- `.env`
- `.env.local`
- `node_modules/`
- `dist/`
- screenshots
- standalone `securityplus-FINAL.html`

For the step-by-step beginner launch checklist, see:

```txt
docs/launch-runbook.md
```

Recommended first commit:

```bash
git init
git add .
git commit -m "Initial SecurePlus app"
```
