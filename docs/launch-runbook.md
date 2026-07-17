# SecurePlus Launch Runbook

This guide is the beginner-friendly checklist for getting SecurePlus ready for real users.

## 1. Before You Deploy

Run these commands locally:

```bash
npm ci
npm run audit
npm run build
npm audit --audit-level=moderate
```

What these mean:

- `npm ci` installs the exact dependency versions from `package-lock.json`.
- `npm run audit` checks launch security, SEO pages, PWA/mobile install files, and the MCQ/PBQ question bank.
- `npm run build` confirms Vercel can create the production site.
- `npm audit --audit-level=moderate` checks dependency security issues.

Do not launch if any of these fail.

## 2. Supabase Setup

In Supabase SQL Editor, run:

```txt
supabase/schema.sql
supabase/pbqs.sql
supabase/cipher-coins.sql
```

Then check these tables exist:

- `profiles`
- `attempts`
- `referrals`
- `starred_questions`
- `cipher_coin_transactions`
- `cipher_coin_unlocks`
- `cipher_coin_daily_activity`

Important security expectation:

- Users can read only their own rows.
- Users cannot directly change `profiles.tier`.
- Stripe webhook/server code is responsible for changing Free/Pro status.
- Coin balances can change only through server-side functions, and every change has a unique ledger reference.
- Free users can read only public PBQs or PBQs permanently unlocked in their own wallet.

Run this project check after editing the SQL:

```bash
npm run audit:launch
```

## 3. Supabase Auth Settings

In Supabase Dashboard:

1. Go to `Authentication` -> `URL Configuration`.
2. Set Site URL to your main website, for example:

```txt
https://www.secureplusprep.com
```

3. Add Redirect URLs for your production and local sites:

```txt
https://www.secureplusprep.com/**
https://secureplusprep.com/**
http://127.0.0.1:5173/**
```

4. Turn on email confirmation if you want users to verify email before using the account.
5. For Google login, add the Supabase callback URL inside Google Cloud OAuth settings.

## 4. Email Templates

The saved templates are in:

```txt
supabase/email-templates/
```

Paste them in Supabase:

- `confirm-signup.html` for account verification
- `reset-password.html` for password reset
- `magic-link.html` for account deletion confirmation

The full paste instructions are in:

```txt
supabase/email-templates/README.md
```

## 5. Stripe Setup

Create one yearly recurring price:

```txt
$4.99 USD per year
```

Save the Stripe price ID as:

```bash
STRIPE_PRICE_PRO=price_xxx
```

Add a webhook endpoint:

```txt
https://www.secureplusprep.com/api/stripe/webhook
```

Select these events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Save the webhook signing secret as:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## 6. Vercel Environment Variables

Add these in Vercel Project Settings -> Environment Variables.

Frontend-safe variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PUBLIC_POSTHOG_TOKEN=
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Server-only variables:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_PRO=
STRIPE_WEBHOOK_SECRET=
APP_URL=https://www.secureplusprep.com
STRIPE_SUCCESS_URL=https://www.secureplusprep.com/?checkout=success
STRIPE_CANCEL_URL=https://www.secureplusprep.com/?checkout=cancelled
```

Never put server-only variables inside React code.

## 7. Production Test Checklist

After deployment, test these in order:

1. Open the homepage.
2. Create a new account by email.
3. Confirm the verification email arrives.
4. Sign in.
5. Complete an MCQ set as Free user.
6. Confirm Free user can use MCQs.
7. Click a locked PBQ and confirm it nudges to Upgrade.
8. Upgrade with Stripe test card if in test mode:

```txt
4242 4242 4242 4242
Any future expiry
Any CVC
```

9. Return to the app and press `Sync billing` if Pro does not appear immediately.
10. Confirm Pro can open PBQs and Exam Mode.
11. Cancel membership through the Stripe portal.
12. Confirm account deletion sends the verification email.

## 8. Updating Questions

After adding or editing MCQ/PBQ content:

```bash
npm run audit:qbank:strict
npm run build
```

The strict question-bank audit checks:

- Enough active MCQs and PBQs
- No duplicate IDs
- No duplicate question text
- Valid answer keys
- Explanations exist
- Wrong-answer feedback exists for MCQs

## 9. Updating SEO Pages

After editing public pages under `public/security-plus-*`:

```bash
npm run audit:seo
```

This checks sitemap coverage, page titles, descriptions, canonical URLs, Open Graph basics, and internal links.

## 10. Updating Mobile/PWA Files

After editing `manifest.webmanifest`, icons, `sw.js`, or mobile app tags:

```bash
npm run audit:pwa
```

This checks install metadata, icon sizes, Apple home-screen tags, and service worker basics.

## 11. Current Known Limitation

The app currently bundles MCQ and PBQ content in frontend JavaScript. The UI gates Pro-only PBQs, but a determined technical user could inspect the JavaScript bundle.

Before the platform grows much larger, move Pro-only PBQ content behind a server API or Supabase query that checks:

```txt
profiles.tier = 'pro'
subscription_status in ('active', 'trialing')
```

That is the stronger long-term premium-content protection model.
