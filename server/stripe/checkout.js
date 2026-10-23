import { passLineItem } from "./access-pass.js";
import {
  getBearerToken,
  getJsonBody,
  getStripe,
  getSupabaseAdmin,
  json,
  requireEnv,
} from "../../api/_utils.js";

function successUrl(appUrl) {
  const base = process.env.STRIPE_SUCCESS_URL || `${appUrl}/?checkout=success`;
  const withCheckout = base.includes("checkout=")
    ? base
    : `${base}${base.includes("?") ? "&" : "?"}checkout=success`;
  return withCheckout.includes("{CHECKOUT_SESSION_ID}")
    ? withCheckout
    : `${withCheckout}${withCheckout.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;
}

function checkoutCancelUrl(appUrl) {
  const base = process.env.STRIPE_CANCEL_URL || `${appUrl}/?view=pricing`;
  const withCheckout = base.includes("checkout=")
    ? base
    : `${base}${base.includes("?") ? "&" : "?"}checkout=cancelled`;
  return withCheckout.includes("view=")
    ? withCheckout
    : `${withCheckout}${withCheckout.includes("?") ? "&" : "?"}view=pricing`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before upgrading." });
    const body = await getJsonBody(req);
    const planKey=body?.plan;
    if(!["sprint","comprehensive"].includes(planKey))return json(res,400,{error:"Choose a Sprint or Comprehensive Pass. Refresh the pricing page."});
    const lineItem=passLineItem(planKey);
    const referralCode = String(body.referralCode || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "")
      .slice(0, 32);

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

    const appUrl = process.env.APP_URL || "https://www.secureplusprep.com";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      adaptive_pricing: { enabled: false },
      customer: customerId,
      client_reference_id: authUser.id,
      line_items:[lineItem],
      success_url: successUrl(appUrl),
      cancel_url: checkoutCancelUrl(appUrl),
      metadata:{supabase_user_id:authUser.id,access_pass:planKey},
      payment_intent_data:{metadata:{supabase_user_id:authUser.id,access_pass:planKey}},
    });

    return json(res, 200, { url: session.url });
  } catch (error) {
    console.error("Stripe checkout failed:", error);
    if (error?.code === "invalid_pro_price") {
      return json(res, 503, {
        error: "The selected Pro plan is being updated in Stripe. Please try again shortly.",
      });
    }
    return json(res, 500, { error: "Unable to start Stripe Checkout." });
  }
}
