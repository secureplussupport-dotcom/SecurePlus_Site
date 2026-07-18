# SecurePlus Supabase Email Templates

These files are the source copies for SecurePlus authentication emails. Hosted Supabase projects do not read them automatically; paste each template into the Supabase dashboard.

## Templates To Install

| Supabase template | Subject | File |
| --- | --- | --- |
| Confirm signup | `Verify your email for SecurePlus` | `confirm-signup.html` |
| Reset password | `Reset your SecurePlus password` | `reset-password.html` |
| Password changed notification | `Your SecurePlus password was changed` | `password-changed.html` |
| Magic Link | `Continue your SecurePlus account security request` | `magic-link.html` |

## Install In Supabase

1. Open Supabase Dashboard.
2. Go to `Authentication` -> `Emails` -> `Templates`.
3. Select the matching template from the table above.
4. Replace its subject and body with the listed subject and file contents.
5. Save before moving to the next template.
6. Under `Authentication` -> `Emails` -> `Security Notifications`, enable `Password changed`, paste `password-changed.html`, and save.

Keep `{{ .ConfirmationURL }}` exactly as written. Supabase replaces it with the secure action URL.

## Production Delivery Checklist

Good HTML cannot guarantee inbox placement. Complete these delivery controls:

1. Use custom SMTP in `Authentication` -> `SMTP Settings`. The Supabase default sender is for testing and is heavily rate-limited.
2. Keep the current verified sender as `no-reply@secureplusprep.com`. If a dedicated `auth.secureplusprep.com` sending domain is added later, verify it separately with the SMTP provider before using it.
3. Verify SPF and DKIM records supplied by the SMTP provider.
4. Publish a DMARC record for the sending domain. Start with monitoring, then strengthen the policy after reviewing reports.
5. Disable click tracking and open tracking for authentication email. Rewritten links can break Supabase confirmation URLs.
6. Keep the From name stable, such as `SecurePlus`.
7. Use a real Reply-To or clearly state that the mailbox is not monitored.
8. Test signup, password reset, and password-changed notification with Gmail, Outlook, and Apple Mail.
9. Add CAPTCHA to signup and password-reset forms before increasing email rate limits.

## Content Decisions

- No remote images or tracking pixels.
- One primary action in each action email.
- No promotional claims, pricing, urgency, emojis, or large marketing sections.
- Short subjects that state the account action clearly.
- A plain-text fallback URL for action emails.
- Security guidance for requests the recipient did not initiate.

## Account Deletion Note

`/api/account/delete-request` always creates a short-lived, single-use server request. It sends the dedicated security email through Resend when `RESEND_API_KEY` is configured, and temporarily falls back to this Supabase Magic Link template otherwise. Both routes return the user to one final confirmation screen, so automated email-link scanners cannot delete an account by opening the URL.

## Recommended Sender Settings

- Sender name: `SecurePlus`
- Sender address: `no-reply@secureplusprep.com`
- Reply-To: `secureplus.support@gmail.com`
- Authentication Site URL: `https://secureplusprep.com`
- Allowed redirect URL: `https://secureplusprep.com/**`
