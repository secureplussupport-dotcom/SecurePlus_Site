const SUPPORT_EMAIL = "secureplus.support@gmail.com";
const BRAND_LOGO_URL = "https://www.secureplusprep.com/secureplus-logo.png";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderAccountDeletionEmail({ confirmationUrl, email, expiresInMinutes = 15 }) {
  const safeUrl = escapeHtml(confirmationUrl);
  const safeEmail = escapeHtml(email);
  const subject = "Continue deleting your SecurePlus account";
  const text = [
    "Continue deleting your SecurePlus account",
    "",
    `A request was made to delete ${email}.`,
    `Open the secure link below within ${expiresInMinutes} minutes. You will see one final confirmation screen before anything is deleted.`,
    "",
    confirmationUrl,
    "",
    "If you did not request this, ignore this email. Your account will remain active.",
    `Need help? Contact ${SUPPORT_EMAIL}.`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f3eb;color:#2c2925;font-family:Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">This link expires in ${expiresInMinutes} minutes and does not delete the account by itself.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f7f3eb;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;background:#fffdf8;border:1px solid #eadfce;border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(82,60,35,.10);">
            <tr>
              <td style="padding:25px 28px;background:#203e3b;color:#ffffff;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="width:44px;vertical-align:middle;">
                      <img src="${BRAND_LOGO_URL}" width="44" height="44" alt="SecurePlus" style="display:block;width:44px;height:44px;border:0;border-radius:11px;outline:none;text-decoration:none;">
                    </td>
                    <td style="padding-left:12px;vertical-align:middle;">
                      <div style="font-size:18px;font-weight:800;line-height:1.2;color:#ffffff;">SecurePlus</div>
                      <div style="margin-top:3px;font-size:11px;font-weight:700;line-height:1.3;color:#c8d9d4;">Account security</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px 28px;">
                <div style="margin-bottom:10px;color:#a64f4f;font-size:12px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;">Account security</div>
                <h1 style="margin:0 0 14px;font-size:27px;line-height:1.25;color:#2c2925;">Continue your deletion request</h1>
                <p style="margin:0 0 10px;font-size:15px;line-height:1.7;color:#625b52;">A request was made to delete <strong style="color:#2c2925;">${safeEmail}</strong>.</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#625b52;">Open the secure link within <strong>${expiresInMinutes} minutes</strong>. Nothing is deleted until you approve one final confirmation inside SecurePlus.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="background:#b64747;border-radius:12px;">
                      <a href="${safeUrl}" style="display:inline-block;padding:15px 22px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;line-height:1.2;border-radius:12px;">Continue account deletion</a>
                    </td>
                  </tr>
                </table>
                <div style="padding:15px 16px;border:1px solid #d7e7df;border-radius:13px;background:#f1f8f4;color:#466156;font-size:13px;line-height:1.65;">
                  <strong>Did not request this?</strong><br>Ignore this message. The link will expire and your account will stay active.
                </div>
                <p style="margin:22px 0 6px;font-size:12px;line-height:1.6;color:#81776b;">If the button does not open, copy this address:</p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#a64f4f;word-break:break-all;">${safeUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid #eadfce;background:#fbf7f0;color:#81776b;font-size:12px;line-height:1.6;">
                This is an automated security message from SecurePlus.<br>Support: ${SUPPORT_EMAIL}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
