# Deployment Guide

Use this checklist when moving SecurePlus from local development to a hosted site.

## 1. Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in SQL Editor.
3. Confirm `profiles` and `attempts` exist.
4. In Authentication settings:
   - Enable email/password.
   - Enable Google only if you have Google OAuth credentials.
   - Keep Apple disabled unless you join Apple Developer Program.
5. Add site URLs in Authentication -> URL Configuration:
   - Site URL: `https://secureplusprep.com`
   - Redirect URL: `https://secureplusprep.com/**`
   - Redirect URL: `https://secure-plus-site.vercel.app/**`
   - Redirect URL: `http://127.0.0.1:5173/**`
6. In Authentication -> Emails -> Templates, use the branded templates in `supabase/email-templates`:
   - `confirm-signup.html` for Confirm signup.
   - `reset-password.html` for Reset password.

The subjects should be:

```txt
Confirm your SecurePlus account
Reset your SecurePlus password
```

Keep `{{ .ConfirmationURL }}` exactly as written in both templates. Supabase replaces it with the secure verification or password-reset link.

If a confirmation email opens a page of raw HTML, the most common causes are a bad Site URL, missing Redirect URL, or a broken email template link.

## 2. Google OAuth

1. Create OAuth credentials in Google Cloud.
2. Authorized JavaScript origins:
   - `http://127.0.0.1:5173`
   - `https://your-domain.com`
3. Authorized redirect URI:
   - Supabase callback URL from Authentication -> Providers -> Google.
4. Paste Client ID and Client Secret into Supabase Google provider settings.

## 3. Stripe

1. Stay in test mode while building.
2. Create SecurePlus Pro product.
3. Create yearly recurring price: `$4.99 USD / year`.
4. Copy the price ID into `STRIPE_PRICE_PRO`.
5. Add webhook endpoint after Vercel deploy:

```txt
https://your-domain.com/api/stripe/webhook
```

Events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## 4. Vercel

1. Push repo to GitHub.
2. Import repo into Vercel.
3. Add environment variables:

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

4. Deploy.
5. Test signup, login, Google login, checkout, billing portal, account deletion.

## 5. PostHog Analytics

Use PostHog first because it gives you funnels, user paths, question events, and drop-off visibility in one free-tier dashboard.

1. Create a free PostHog Cloud project.
2. Copy the Project API Key into Vercel as `VITE_PUBLIC_POSTHOG_TOKEN`.
3. Set `VITE_PUBLIC_POSTHOG_HOST` to the host shown in PostHog, usually `https://us.i.posthog.com`.
4. Redeploy Vercel after adding the variables.
5. In PostHog, create funnels such as:
   - Landing viewed -> Signup completed -> MCQ quiz started.
   - PBQ locked clicked -> Upgrade button clicked -> Checkout started.
   - MCQ quiz started -> MCQ quiz completed.

Useful custom events already sent by the app:

- `app_viewed`
- `signup_started`
- `signup_completed`
- `daily_challenge_started`
- `mcq_question_answered`
- `mcq_quiz_completed`
- `pbq_locked_clicked`
- `checkout_started`
- `referral_link_copied`
- `referral_claimed`

## 6. SEO

The app includes static landing content in `index.html`, meta description, Open Graph tags, structured data, `robots.txt`, `sitemap.xml`, and an Open Graph image.

After your custom domain is live:

1. Confirm `https://secureplusprep.com/sitemap.xml` opens.
2. Add `secureplusprep.com` to Google Search Console.
3. Submit the sitemap URL.
4. Search Console may take days or weeks to show impressions. That delay is normal.

For stronger SEO later, migrate the public marketing pages to Next.js or another server-rendered/static-rendered framework. The app now has the basic static SEO layer, but blog/content pages will help ranking much more than the dashboard app alone.

## 7. Referral Program

The referral program gives both users 7 days of Pro trial access:

1. Run the latest `supabase/schema.sql`, or run `supabase/referrals.sql` if your main tables already exist.
2. Deploy the Vercel API routes `/api/referrals/me` and `/api/referrals/claim`.
3. Users can copy links from the Referrals page.
4. A link looks like:

```txt
https://secureplusprep.com/?ref=ABC123
```

The server checks the referral code and blocks self-referrals.

## 8. Production Readiness

Before accepting real payments:

- Rotate any keys that were shared during testing.
- Switch Stripe to live mode.
- Create live Stripe product/price.
- Add live webhook endpoint.
- Configure Supabase production redirect URLs.
- Configure production SMTP for auth emails.
- Move Pro-only content behind a server-side tier check.
