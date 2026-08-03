import crypto from "node:crypto";
import {
  getBearerToken,
  getSupabaseAdmin,
  json,
} from "../../api/_utils.js";
import { renderAccountDeletionEmail } from "./_deletion-email.js";

const EXPIRY_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 60;
const SUPPORT_EMAIL = "secureplus.support@gmail.com";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function isMissingDeletionSchema(error) {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST204" ||
    error?.code === "PGRST205" ||
    /account_deletion_requests|schema cache|relation/i.test(error?.message || "")
  );
}

function firstHeader(value) {
  return Array.isArray(value) ? value[0] : value;
}

function safeSiteOrigin(req) {
  const configured = process.env.ACCOUNT_DELETE_SITE_URL || process.env.PUBLIC_SITE_URL || process.env.APP_URL;
  const candidates = [
    configured,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "",
    firstHeader(req.headers.origin),
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        return url.origin;
      }
    } catch {}
  }
  return "https://secureplusprep.com";
}

async function sendDeletionEmail({ supabase, requestId, to, confirmationUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const { error } = await supabase.auth.signInWithOtp({
      email: to,
      options: {
        emailRedirectTo: confirmationUrl,
        shouldCreateUser: false,
      },
    });
    if (error) {
      const deliveryError = new Error(
        error.status === 429
          ? "The account email service is temporarily rate-limited. Wait a few minutes, then try again."
          : "The account email service could not accept this message. Please try again or contact support."
      );
      deliveryError.statusCode = error.status === 429 ? 429 : 502;
      throw deliveryError;
    }
    return { deliveryId: null, deliveryChannel: "supabase_auth" };
  }

  const message = renderAccountDeletionEmail({ confirmationUrl, email: to, expiresInMinutes: EXPIRY_MINUTES });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": `account-delete-${requestId}`,
    },
    body: JSON.stringify({
      from: process.env.ACCOUNT_DELETE_FROM_EMAIL || process.env.FEEDBACK_FROM_EMAIL || "SecurePlus <noreply@secureplusprep.com>",
      to,
      reply_to: SUPPORT_EMAIL,
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  const rawBody = await response.text().catch(() => "");
  let body = {};
  try { body = rawBody ? JSON.parse(rawBody) : {}; } catch { body = { message: rawBody }; }
  if (!response.ok) {
    console.warn("Account deletion email rejected:", response.status, body?.message || body?.name || "Unknown provider error");
    const error = new Error("The deletion email provider rejected this message. Please try again in a minute or contact support.");
    error.statusCode = 502;
    throw error;
  }
  return { deliveryId: body?.id || null, deliveryChannel: "resend" };
}

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  let supabase;
  let requestId;
  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before requesting account deletion." });

    supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user) return json(res, 401, { error: "Your login session expired. Sign in again." });
    if (!user.email) return json(res, 400, { error: "This account has no email address. Contact support for help." });

    const cutoff = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000).toISOString();
    const { data: recent, error: recentError } = await supabase
      .from("account_deletion_requests")
      .select("created_at")
      .eq("user_id", user.id)
      .is("used_at", null)
      .gt("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recentError) throw recentError;
    if (recent?.created_at) {
      const elapsed = Math.floor((Date.now() - new Date(recent.created_at).getTime()) / 1000);
      const retryAfterSeconds = Math.max(1, RESEND_COOLDOWN_SECONDS - elapsed);
      res.setHeader("retry-after", String(retryAfterSeconds));
      return json(res, 429, {
        error: `A deletion email was just sent. Wait ${retryAfterSeconds} seconds before requesting another.`,
        retryAfterSeconds,
      });
    }

    const { error: cleanupError } = await supabase
      .from("account_deletion_requests")
      .delete()
      .eq("user_id", user.id);
    if (cleanupError) throw cleanupError;

    const rawToken = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000).toISOString();
    const { data: inserted, error: insertError } = await supabase
      .from("account_deletion_requests")
      .insert({ user_id: user.id, token_hash: hashToken(rawToken), expires_at: expiresAt })
      .select("id")
      .single();
    if (insertError) throw insertError;
    requestId = inserted.id;

    const confirmationUrl = `${safeSiteOrigin(req)}/?delete_account_token=${encodeURIComponent(rawToken)}`;
    const { deliveryId, deliveryChannel } = await sendDeletionEmail({ supabase, requestId, to: user.email, confirmationUrl });
    if (deliveryId) {
      const { error: deliveryUpdateError } = await supabase
        .from("account_deletion_requests")
        .update({ email_delivery_id: deliveryId })
        .eq("id", requestId);
      if (deliveryUpdateError) console.warn("Unable to record deletion email delivery id:", deliveryUpdateError.message);
    }

    return json(res, 200, {
      sent: true,
      email: user.email,
      deliveryChannel,
      expiresInMinutes: EXPIRY_MINUTES,
      resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error("Account deletion request failed:", error);
    if (supabase && requestId) {
      try { await supabase.from("account_deletion_requests").delete().eq("id", requestId); } catch {}
    }
    if (isMissingDeletionSchema(error)) {
      return json(res, 503, {
        error: "Account deletion setup is incomplete. Run supabase/account-deletion.sql in the Supabase SQL Editor.",
      });
    }
    return json(res, error?.statusCode || 500, {
      error: error?.message || "Unable to send the account deletion email.",
    });
  }
}
