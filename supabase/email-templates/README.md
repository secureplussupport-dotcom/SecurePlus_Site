# SecurePlus Supabase Email Templates

Supabase hosted projects do not read these files directly. These templates are here so the project has a saved copy you can paste into the Supabase dashboard.

## Where To Paste

1. Open Supabase Dashboard.
2. Go to `Authentication` -> `Emails` -> `Templates`.
3. Open `Confirm signup`.
4. Set subject to:
   `Confirm your SecurePlus account`
5. Paste `confirm-signup.html` into the message/body editor.
6. Open `Reset password`.
7. Set subject to:
   `Reset your SecurePlus password`
8. Paste `reset-password.html` into the message/body editor.
9. Save each template.

## Important

Keep `{{ .ConfirmationURL }}` exactly as written. Supabase replaces it with the secure verification or password-reset link.

Source: Supabase email template docs list `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`, and other supported variables for auth emails.
