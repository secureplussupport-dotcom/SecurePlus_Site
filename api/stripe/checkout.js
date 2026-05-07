import {
  getBearerToken,
  getStripe,
  getSupabaseAdmin,
  json,
  requireEnv,
} from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before upgrading." });

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const authUser = authData.user;
    const email = authUser.email || "";

    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,tier,stripe_customer_id")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const profile = existingProfile || {
      id: authUser.id,
      email,
      tier: "free",
      stripe_customer_id: null,
    };

    if (!existingProfile) {
      const { error } = await supabase.from("profiles").insert(profile);
      if (error) throw error;
    }

    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabase_user_id: authUser.id,
        },
      });
      customerId = customer.id;

      const { error } = await supabase
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authUser.id);
      if (error) throw error;
    }

    const appUrl = process.env.APP_URL || req.headers.origin || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: authUser.id,
      line_items: [
        {
          price: requireEnv("STRIPE_PRICE_PRO"),
          quantity: 1,
        },
      ],
      success_url:
        process.env.STRIPE_SUCCESS_URL || `${appUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL || `${appUrl}/?checkout=cancelled`,
      metadata: {
        supabase_user_id: authUser.id,
        plan: "pro",
      },
      subscription_data: {
        metadata: {
          supabase_user_id: authUser.id,
          plan: "pro",
        },
      },
    });

    return json(res, 200, { url: session.url });
  } catch (error) {
    console.error("Stripe checkout failed:", error);
    return json(res, 500, { error: "Unable to start Stripe Checkout." });
  }
}
