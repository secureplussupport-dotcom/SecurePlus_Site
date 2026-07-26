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
let validatedProAcademyPassPriceId = "";

function isProAcademyPassPrice(price) {
  return Boolean(
    price?.active &&
    price?.type === "recurring" &&
    price?.unit_amount === PRO_ACADEMY_PASS_AMOUNT &&
    price?.currency === PRO_ACADEMY_PASS_CURRENCY &&
    price?.recurring?.interval === PRO_ACADEMY_PASS_INTERVAL &&
    price?.recurring?.interval_count === PRO_ACADEMY_PASS_INTERVAL_COUNT
  );
}

async function getProAcademyPassPriceId(stripe) {
  if (validatedProAcademyPassPriceId) return validatedProAcademyPassPriceId;
  const priceId = requireEnv("STRIPE_PRICE_PRO");
  const price = await stripe.prices.retrieve(priceId);
  if (!isProAcademyPassPrice(price)) {
    const error = new Error(
      "STRIPE_PRICE_PRO must be an active $9.99 USD recurring price billed every 3 months."
    );
    error.code = "invalid_pro_academy_pass_price";
    throw error;
  }
  validatedProAcademyPassPriceId = price.id;
  return validatedProAcademyPassPriceId;
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
    const proAcademyPassPriceId = await getProAcademyPassPriceId(stripe);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: authUser.id,
      line_items: [
        {
          price: proAcademyPassPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl(appUrl),
      cancel_url: process.env.STRIPE_CANCEL_URL || `${appUrl}/?checkout=cancelled`,
      metadata: {
        supabase_user_id: authUser.id,
        plan: "pro_academy_pass_3_month",
        referral_code: referralCode,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: authUser.id,
          plan: "pro_academy_pass_3_month",
          referral_code: referralCode,
        },
      },
    });

    return json(res, 200, { url: session.url });
  } catch (error) {
    console.error("Stripe checkout failed:", error);
    if (error?.code === "invalid_pro_academy_pass_price") {
      return json(res, 503, {
        error: "The Pro Academy Pass is being updated in Stripe. Please try again shortly.",
      });
    }
    return json(res, 500, { error: "Unable to start Stripe Checkout." });
  }
}
