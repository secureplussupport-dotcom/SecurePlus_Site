import {
  getBearerToken,
  getStripe,
  getSupabaseAdmin,
  json,
} from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before deleting your account." });

    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (profile?.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
    if (deleteError) throw deleteError;

    return json(res, 200, { deleted: true });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return json(res, 500, { error: "Unable to delete account." });
  }
}
