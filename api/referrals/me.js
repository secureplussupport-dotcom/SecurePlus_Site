import {
  getBearerToken,
  getSupabaseAdmin,
  json,
} from "../_utils.js";

function makeCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}

function isMissingReferralSchema(error) {
  return error?.code === "42703" || error?.code === "42P01";
}

async function ensureProfile(supabase, authUser) {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id,email,referral_code,pro_trial_until")
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
    .select("id,email,referral_code,pro_trial_until")
    .maybeSingle();

  if (insertError) throw insertError;
  return inserted;
}

async function ensureReferralCode(supabase, profile) {
  if (profile.referral_code) return profile;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = makeCode();
    const { data, error } = await supabase
      .from("profiles")
      .update({ referral_code: code, updated_at: new Date().toISOString() })
      .eq("id", profile.id)
      .select("id,email,referral_code,pro_trial_until")
      .maybeSingle();

    if (!error) return data;
    if (error.code !== "23505") throw error;
  }

  throw new Error("Unable to create a unique referral code.");
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before viewing referrals." });

    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const profile = await ensureReferralCode(
      supabase,
      await ensureProfile(supabase, authData.user)
    );

    const { count: invitedCount, error: invitedError } = await supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", authData.user.id);
    if (invitedError) throw invitedError;

    return json(res, 200, {
      ok: true,
      referralCode: profile.referral_code,
      proTrialUntil: profile.pro_trial_until || null,
      invitedCount: invitedCount || 0,
    });
  } catch (error) {
    console.error("Referral profile failed:", error);
    if (isMissingReferralSchema(error)) {
      return json(res, 409, {
        error: "Referral database setup is missing. Run supabase/referrals.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: "Unable to load referral details." });
  }
}
