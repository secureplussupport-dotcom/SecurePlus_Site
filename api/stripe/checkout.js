import {
  getBearerToken,
  getJsonBody,
  getStripe,
  getSupabaseAdmin,
  json,
  requireEnv,
} from "../_utils.js";

const PRO_ACADEMY_PASS_AMOUNT = 999;
const PRO_ACADEMY_PASS_CURRENCY = "usd";
const PRO_ACADEMY_PASS_INTERVAL = "month";
const PRO_ACADEMY_PASS_INTERVAL_COUNT = 3;
const PRO_MONTHLY_AMOUNT = 499;
const PRO_MONTHLY_INTERVAL_COUNT = 1;
const PRO_PLAN_CONFIGS = Object.freeze({
  monthly: {
    envName: "STRIPE_PRICE_PRO_MONTHLY",
    amount: PRO_MONTHLY_AMOUNT,
    intervalCount: PRO_MONTHLY_INTERVAL_COUNT,
    metadataPlan: "pro_monthly",
    description: "$4.99 USD recurring price billed every month",
  },
  three_month: {
    envName: "STRIPE_PRICE_PRO",
    amount: PRO_ACADEMY_PASS_AMOUNT,
    intervalCount: PRO_ACADEMY_PASS_INTERVAL_COUNT,
    metadataPlan: "pro_3_month_plus",
    description: "$9.99 USD recurring price billed every 3 months",
  },
});
const validatedPriceIds = new Map();

function isConfiguredProPrice(price, planConfig) {
  return Boolean(
    price?.active &&
    price?.type === "recurring" &&
    price?.unit_amount === planConfig.amount &&
    price?.currency === PRO_ACADEMY_PASS_CURRENCY &&
    price?.recurring?.interval === PRO_ACADEMY_PASS_INTERVAL &&
    price?.recurring?.interval_count === planConfig.intervalCount
  );
}

async function getConfiguredProPriceId(stripe, planKey) {
  if (validatedPriceIds.has(planKey)) return validatedPriceIds.get(planKey);
  const planConfig = PRO_PLAN_CONFIGS[planKey];
  const priceId = requireEnv(planConfig.envName);
  const price = await stripe.prices.retrieve(priceId);
  if (!isConfiguredProPrice(price, planConfig)) {
    const error = new Error(
      `${planConfig.envName} must be an active ${planConfig.description}.`
    );
    error.code = "invalid_pro_price";
    throw error;
  }
  validatedPriceIds.set(planKey, price.id);
  return price.id;
}

function successUrl(appUrl) {
  const base = process.env.STRIPE_SUCCESS_URL || `${appUrl}/?checkout=success`;
  const withCheckout = base.includes("checkout=")
    ? base
    : `${base}${base.includes("?") ? "&" : "?"}checkout=success`;
  return withCheckout.includes("{CHECKOUT_SESSION_ID}")
    ? withCheckout
    : `${withCheckout}${withCheckout.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;
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
    const planKey = body?.plan === "monthly" ? "monthly" : "three_month";
    const planConfig = PRO_PLAN_CONFIGS[planKey];
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

    const appUrl = process.env.APP_URL || req.headers.origin || "http://localhost:5173";
    const selectedPriceId = await getConfiguredProPriceId(stripe, planKey);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: authUser.id,
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl(appUrl),
      cancel_url: process.env.STRIPE_CANCEL_URL || `${appUrl}/?checkout=cancelled`,
      metadata: {
        supabase_user_id: authUser.id,
        plan: planConfig.metadataPlan,
        selected_plan: planKey,
        referral_code: referralCode,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: authUser.id,
          plan: planConfig.metadataPlan,
          selected_plan: planKey,
          referral_code: referralCode,
        },
      },
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
