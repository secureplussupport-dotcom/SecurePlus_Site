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
   - Site URL: `https://secure-plus-site.vercel.app`
   - Redirect URL: `https://secure-plus-site.vercel.app/**`
   - Redirect URL: `http://127.0.0.1:5173/**`
6. In Authentication -> Email Templates -> Confirm signup, make sure the button/link uses:

```html
<a href="{{ .ConfirmationURL }}">Confirm signup</a>
```

Do the same pattern for Reset password:

```html
<a href="{{ .ConfirmationURL }}">Reset password</a>
```

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
3. Create monthly recurring price.
4. Copy the price ID into `STRIPE_PRICE_PRO`.
5. Add webhook endpoint after Vercel deploy:

```txt
https://your-domain.com/api/stripe/webhook
```

Events:

- `checkout.session.completed`
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
```

4. Deploy.
5. Test signup, login, Google login, checkout, billing portal, account deletion.

## 5. Production Readiness

Before accepting real payments:

- Rotate any keys that were shared during testing.
- Switch Stripe to live mode.
- Create live Stripe product/price.
- Add live webhook endpoint.
- Configure Supabase production redirect URLs.
- Configure production SMTP for auth emails.
- Move Pro-only content behind a server-side tier check.
