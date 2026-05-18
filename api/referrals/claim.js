import {
  getBearerToken,
  getJsonBody,
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

function makeCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}

function isMissingReferralSchema(error) {
  return error?.code === "42703" || error?.code === "42P01";
}

async function ensureReferredProfile(supabase, authUser) {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id,pro_trial_until")
    .eq("id", authUser.id)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing;

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: authUser.id,
      email: authUser.email || "",
      tier: "free",
      referral_code: makeCode(),
    })
    .select("id,pro_trial_until")
    .maybeSingle();

  if (insertError) throw insertError;
  return inserted;
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

    const referredUser = authData.user;
    const { data: referrer, error: referrerError } = await supabase
      .from("profiles")
      .select("id,referral_code,tier,subscription_status,pro_trial_until")
      .eq("referral_code", referralCode)
      .maybeSingle();

    if (referrerError) throw referrerError;
    if (!referrer) return json(res, 404, { error: "Referral code was not found." });
    if (referrer.id === referredUser.id) {
      return json(res, 400, { error: "You cannot use your own referral code." });
    }

    const { data: referrerExistingReferral, error: referrerExistingError } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", referrer.id)
      .limit(1)
      .maybeSingle();
    if (referrerExistingError) throw referrerExistingError;
    if (referrerExistingReferral) {
      return json(res, 409, { error: "This referral code has already been used." });
    }

    const { data: existingReferral, error: existingError } = await supabase
      .from("referrals")
      .select("id")
      .eq("referred_user_id", referredUser.id)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existingReferral) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("pro_trial_until")
        .eq("id", referredUser.id)
        .maybeSingle();
      return json(res, 200, {
        ok: true,
        alreadyClaimed: true,
        proTrialUntil: profile?.pro_trial_until || null,
      });
    }

    const referredProfile = await ensureReferredProfile(supabase, referredUser);

    const referredTrialUntil = extendTrialFrom(referredProfile?.pro_trial_until);
    const referrerHasPaidPro =
      referrer.tier === "pro" && ["active", "trialing"].includes(referrer.subscription_status || "");
    const referrerTrialUntil = referrerHasPaidPro ? referrer.pro_trial_until : extendTrialFrom(referrer.pro_trial_until);

    const { error: insertError } = await supabase.from("referrals").insert({
      referrer_id: referrer.id,
      referred_user_id: referredUser.id,
      referral_code: referralCode,
      status: referrerHasPaidPro ? "referred_trial_granted" : "trial_granted",
    });
    if (insertError) throw insertError;

    const { error: referredUpdateError } = await supabase
      .from("profiles")
      .update({ pro_trial_until: referredTrialUntil, updated_at: new Date().toISOString() })
      .eq("id", referredUser.id);
    if (referredUpdateError) throw referredUpdateError;

    if (!referrerHasPaidPro) {
      const { error: referrerUpdateError } = await supabase
        .from("profiles")
        .update({ pro_trial_until: referrerTrialUntil, updated_at: new Date().toISOString() })
        .eq("id", referrer.id);
      if (referrerUpdateError) throw referrerUpdateError;
    }

    return json(res, 200, {
      ok: true,
      trialDays: TRIAL_DAYS,
      proTrialUntil: referredTrialUntil,
      referrerRewardGranted: !referrerHasPaidPro,
    });
  } catch (error) {
    console.error("Referral claim failed:", error);
    if (isMissingReferralSchema(error)) {
      return json(res, 409, {
        error: "Referral database setup is missing. Run supabase/referrals.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: "Unable to apply referral." });
  }
}
