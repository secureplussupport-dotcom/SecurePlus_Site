# Security Notes

## Secrets

Do not commit:

- Stripe secret keys
- Stripe webhook secrets
- Supabase service role key
- Database passwords
- Google OAuth client secrets
- `.env` or `.env.local`

Use Vercel environment variables for server-only secrets.

## Supabase RLS

`supabase/schema.sql` enables Row Level Security.

Current policy model:

- Authenticated users can read only their own profile.
- Authenticated users can read only their own attempts.
- Authenticated users can insert attempts only for their own `user_id`.
- Users cannot directly update `profiles.tier`.
- Stripe webhook/server-side code updates Pro membership.

## Stripe

- Checkout route requires a valid Supabase bearer token.
- Billing portal route requires a valid Supabase bearer token.
- Webhook route verifies Stripe signature before updating Supabase.

## Content Rendering

The current app does not use `dangerouslySetInnerHTML`.

If AI-generated HTML is ever rendered, sanitize it first:

```js
import DOMPurify from "dompurify";

const safeHtml = DOMPurify.sanitize(aiHtml);

return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;
```

Prefer rendering plain text or structured Markdown components instead of raw HTML.

## Known Limitation

Pro-only PBQ content is currently present in the frontend bundle. This is acceptable for prototype UX gating, but not for strong premium protection.

Production fix:

1. Store Pro-only content in Supabase or server-side files.
2. Add an API route like `/api/content/pbq`.
3. Verify the logged-in user's `profiles.tier`.
4. Return PBQs only when `tier = 'pro'`.

## Abuse Considerations

- Rate limits are controlled in Supabase/hosting config, not by users.
- Users cannot modify Supabase project rate limits through this app.
- Account deletion and billing management require server-side token verification.
- Search/database operations should use Supabase query builder or parameterized SQL only.
