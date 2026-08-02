import {
  getBearerToken,
  getStripe,
  getSupabaseAdmin,
  json,
} from "../../api/_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before managing billing." });

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile?.stripe_customer_id) {
      return json(res, 400, { error: "No Stripe customer exists for this account." });
    }

    const appUrl = process.env.APP_URL || req.headers.origin || "http://localhost:5173";
    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/?billing=return`,
    });

    return json(res, 200, { url: portal.url });
  } catch (error) {
    console.error("Stripe portal failed:", error);
    return json(res, 500, { error: "Unable to open billing portal." });
  }
}
