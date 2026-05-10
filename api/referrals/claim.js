import {
  getBearerToken,
  getSupabaseAdmin,
  json,
} from "../_utils.js";

const TRIAL_DAYS = 7;

function cleanCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function extendTrialFrom(value) {
  const now = new Date();
  const current = value ? new Date(value) : null;
  const base = current && current > now ? current : now;
  return addDays(base, TRIAL_DAYS).toISOString();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before using a referral." });

    const { referralCode: rawReferralCode } = req.body || {};
    const referralCode = cleanCode(rawReferralCode);
    if (!referralCode) return json(res, 400, { error: "Referral code is required." });

    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const referredUser = authData.user;
    const { data: referrer, error: referrerError } = await supabase
      .from("profiles")
      .select("id,referral_code,pro_trial_until")
      .eq("referral_code", referralCode)
      .maybeSingle();

    if (referrerError) throw referrerError;
    if (!referrer) return json(res, 404, { error: "Referral code was not found." });
    if (referrer.id === referredUser.id) {
      return json(res, 400, { error: "You cannot use your own referral code." });
    }

    const { data: existingReferral, error: existingError } = await supabase
      .from("referrals")
      .select("id")
      .eq("referred_user_id", referredUser.id)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existingReferral) return json(res, 200, { ok: true, alreadyClaimed: true });

    const { data: referredProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id,pro_trial_until")
      .eq("id", referredUser.id)
      .maybeSingle();
    if (profileError) throw profileError;

    const referredTrialUntil = extendTrialFrom(referredProfile?.pro_trial_until);
    const referrerTrialUntil = extendTrialFrom(referrer.pro_trial_until);

    const { error: insertError } = await supabase.from("referrals").insert({
      referrer_id: referrer.id,
      referred_user_id: referredUser.id,
      referral_code: referralCode,
      status: "trial_granted",
    });
    if (insertError) throw insertError;

    const { error: referredUpdateError } = await supabase
      .from("profiles")
      .update({ pro_trial_until: referredTrialUntil, updated_at: new Date().toISOString() })
      .eq("id", referredUser.id);
    if (referredUpdateError) throw referredUpdateError;

    const { error: referrerUpdateError } = await supabase
      .from("profiles")
      .update({ pro_trial_until: referrerTrialUntil, updated_at: new Date().toISOString() })
      .eq("id", referrer.id);
    if (referrerUpdateError) throw referrerUpdateError;

    return json(res, 200, { ok: true, trialDays: TRIAL_DAYS, proTrialUntil: referredTrialUntil });
  } catch (error) {
    console.error("Referral claim failed:", error);
    return json(res, 500, { error: "Unable to apply referral." });
  }
}
