import crypto from "node:crypto";
import {
  getBearerToken,
  getJsonBody,
  getStripe,
  getSupabaseAdmin,
  json,
} from "../../api/_utils.js";

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

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  let claimedRequestId = null;
  let supabase = null;
  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before deleting your account." });

    const body = await getJsonBody(req);
    const deletionToken = String(body.deletionToken || "").trim();
    if (!/^[A-Za-z0-9_-]{32,256}$/.test(deletionToken)) {
      return json(res, 400, { error: "This deletion link is invalid. Request a new email from Account settings." });
    }

    supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const now = new Date().toISOString();
    const { data: claimedRequest, error: claimError } = await supabase
      .from("account_deletion_requests")
      .update({ used_at: now })
      .eq("token_hash", hashToken(deletionToken))
      .eq("user_id", authData.user.id)
      .is("used_at", null)
      .gt("expires_at", now)
      .select("id")
      .maybeSingle();
    if (claimError) throw claimError;
    if (!claimedRequest) {
      const { data: existingRequest, error: lookupError } = await supabase
        .from("account_deletion_requests")
        .select("user_id,expires_at,used_at")
        .eq("token_hash", hashToken(deletionToken))
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (existingRequest?.user_id && existingRequest.user_id !== authData.user.id) {
        return json(res, 403, { error: "This deletion link belongs to a different account. Sign in to the account that requested deletion." });
      }
      return json(res, 410, { error: "This deletion link has expired or was already used. Request a new email from Account settings." });
    }
    claimedRequestId = claimedRequest.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (profile?.stripe_subscription_id && !process.env.STRIPE_SECRET_KEY) {
      const configurationError = new Error("Account deletion is temporarily unavailable because membership cancellation is not configured. Your account and subscription remain active; contact support.");
      configurationError.statusCode = 503;
      configurationError.publicMessage = true;
      throw configurationError;
    }

    if (profile?.stripe_subscription_id) {
      const stripe = getStripe();
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
      } catch (stripeError) {
        if (stripeError?.code !== "resource_missing") throw stripeError;
      }
    }

    const { error: signOutError } = await supabase.auth.admin.signOut(token, "global");
    if (signOutError) throw signOutError;

    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
    if (deleteError) throw deleteError;

    return json(res, 200, { deleted: true });
  } catch (error) {
    console.error("Account deletion failed:", error);
    if (supabase && claimedRequestId) {
      try {
        await supabase
          .from("account_deletion_requests")
          .update({ used_at: null })
          .eq("id", claimedRequestId);
      } catch {}
    }
    if (isMissingDeletionSchema(error)) {
      return json(res, 503, {
        error: "Account deletion setup is incomplete. Run supabase/account-deletion.sql in the Supabase SQL Editor.",
      });
    }
    return json(res, error?.publicMessage ? error.statusCode : 500, {
      error: error?.publicMessage
        ? error.message
        : "Unable to delete the account. Your data has not been removed; please try again or contact support.",
    });
  }
}
