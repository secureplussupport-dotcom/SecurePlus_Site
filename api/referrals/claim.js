import {
  getBearerToken,
  getJsonBody,
  getSupabaseAdmin,
  json,
} from "../_utils.js";

function cleanCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32);
}

function isMissingReferralSchema(error) {
  return error?.code === "42703" || error?.code === "42P01" || error?.code === "42883";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before using a referral." });

    const body = await getJsonBody(req);
    const rawReferralCode = body.referralCode || "";
    const referralCode = cleanCode(rawReferralCode);
    if (!referralCode) return json(res, 400, { error: "Referral code is required." });

    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const { data: claimResult, error: claimError } = await supabase.rpc("claim_referral_reward", {
      referred_account_id: authData.user.id,
      raw_referral_code: referralCode,
    });
    if (claimError) throw claimError;

    if (!claimResult?.ok) {
      const error = claimResult?.error || "Unable to apply referral.";
      const status =
        error.includes("not found") ? 404 :
        error.includes("own referral") ? 400 :
        error.includes("already") || error.includes("used") ? 409 :
        400;
      return json(res, status, { error });
    }

    if (
      claimResult.coinsAwarded === undefined &&
      claimResult.cipherCoins === undefined &&
      !claimResult.alreadyClaimed
    ) {
      return json(res, 409, {
        error: "The old Pro-trial referral reward is closed. Run supabase/cipher-coins.sql to enable the new Cipher Coin reward.",
      });
    }

    return json(res, 200, {
      ok: true,
      alreadyClaimed: Boolean(claimResult.alreadyClaimed),
      coinsAwarded: Number(claimResult.coinsAwarded || 0),
      cipherCoins: Number(claimResult.cipherCoins || 0),
      referrerRewardGranted: claimResult.referrerRewardGranted,
    });
  } catch (error) {
    console.error("Referral claim failed:", error);
    if (isMissingReferralSchema(error)) {
      return json(res, 409, {
        error: "Cipher Coin referral setup is missing. Run supabase/cipher-coins.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: "Unable to apply referral." });
  }
}
