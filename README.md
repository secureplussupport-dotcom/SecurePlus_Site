# SecurePlus

SecurePlus is a React/Vite practice platform for CompTIA Security+ study. It includes MCQ practice, PBQ simulations, daily challenges, progress tracking, Stripe subscription routes, and Supabase schema/policies for Free vs Pro access.

Support: `secureplus.support@gmail.com`

## Stack

- Frontend: React + Vite
- Hosting target: Vercel
- Auth/database: Supabase
- Payments: Stripe Checkout + Stripe Billing Portal
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
```

Frontend-safe:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

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
5. Enable only the auth providers you actually use. Current plan: Email + Google.

The schema includes:

- `profiles.tier` with allowed values `free` and `pro`
- Stripe customer/subscription fields
- `attempts` for quiz/PBQ history
- Row Level Security policies
- Signup trigger that creates a Free profile automatically

## Stripe Setup

Create a recurring Stripe price for Pro, then set:

```bash
STRIPE_PRICE_PRO=price_xxx
```

API routes:

- `POST /api/stripe/checkout`: creates a subscription Checkout Session for the logged-in Supabase user
- `POST /api/stripe/portal`: opens Stripe Billing Portal for cancellation/membership management
- `POST /api/stripe/webhook`: verifies Stripe webhook signatures and updates `profiles.tier`
- `POST /api/account/delete`: deletes the logged-in Supabase user; profile/attempts cascade through Supabase

Stripe webhook events:

- `checkout.session.completed`
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
