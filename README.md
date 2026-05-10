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
supabase/
  schema.sql
.env.example
index.html
package.json
vite.config.js
```

## Local Setup

```bash
npm install
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

STRIPE_SECRET_KEY=
STRIPE_PRICE_PRO=
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
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Never expose server-only keys in browser code or commit them to GitHub.

## Supabase Setup

1. Create a Supabase project.
2. Go to SQL Editor.
3. Run `supabase/schema.sql`.
4. Confirm these tables exist:
   - `profiles`
   - `attempts`
   - `referrals`
5. Enable only the auth providers you actually use. Current plan: Email + Google.

The schema includes:

- `profiles.tier` with allowed values `free` and `pro`
- Stripe customer/subscription fields
- `attempts` for quiz/PBQ history
- `referrals` for the referral free-trial program
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

When a new user signs up with the link, `/api/referrals/claim` grants both users a 7-day Pro trial in Supabase. Run the latest `supabase/schema.sql` before launching this feature.

If the rest of the database is already set up, you can run only:

```txt
supabase/referrals.sql
```

The Referrals page calls `/api/referrals/me`, which creates or returns the user's real Supabase referral code. Do not use browser-only/local referral codes for live referrals.

## Stripe Setup

Create a yearly recurring Stripe price for Pro (`$4.99 USD / year`), then set:

```bash
STRIPE_PRICE_PRO=price_xxx
```

API routes:

- `POST /api/stripe/checkout`: creates a subscription Checkout Session for the logged-in Supabase user
- `POST /api/stripe/sync`: verifies the logged-in user's Stripe subscription and updates Supabase after Checkout returns
- `POST /api/stripe/portal`: opens Stripe Billing Portal for cancellation/membership management
- `POST /api/stripe/webhook`: verifies Stripe webhook signatures and updates `profiles.tier`
- `POST /api/account/delete`: deletes the logged-in Supabase user; profile/attempts cascade through Supabase

Stripe webhook events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

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
npm run build
```

Preview production build:

```bash
npm run preview
```

## GitHub Commit Checklist

Before pushing:

```bash
npm run build
```

Check that these are not committed:

- `.env`
- `.env.local`
- `node_modules/`
- `dist/`
- screenshots
- standalone `securityplus-FINAL.html`

Recommended first commit:

```bash
git init
git add .
git commit -m "Initial SecurePlus app"
```
