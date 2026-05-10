import {
  getRawBody,
  getStripe,
  getSupabaseAdmin,
  json,
  requireEnv,
} from "../_utils.js";

function subscriptionTier(status) {
  return status === "active" || status === "trialing" ? "pro" : "free";
}

async function updateProfileByUserId(supabase, userId, patch) {
  if (!userId) return;
  const { error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

async function updateProfileByCustomerId(supabase, customerId, patch) {
  if (!customerId) return;
  const { error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", customerId);
  if (error) throw error;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  const stripe = getStripe();
  const supabase = getSupabaseAdmin();

  let event;
  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch (error) {
    console.error("Stripe webhook signature failed:", error);
    return json(res, 400, { error: "Invalid Stripe signature." });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id || session.client_reference_id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      let subscriptionStatus = "active";
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        subscriptionStatus = subscription.status;
      }

      await updateProfileByUserId(supabase, userId, {
        tier: subscriptionTier(subscriptionStatus),
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : session.customer?.id,
        stripe_subscription_id: subscriptionId || null,
        subscription_status: subscriptionStatus,
      });
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      await updateProfileByCustomerId(supabase, subscription.customer, {
        tier: subscriptionTier(subscription.status),
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
      });
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      await updateProfileByCustomerId(supabase, invoice.customer, {
        tier: "free",
        subscription_status: "past_due",
      });
    }

    return json(res, 200, { received: true });
  } catch (error) {
    console.error("Stripe webhook handling failed:", error);
    return json(res, 500, { error: "Webhook handling failed." });
  }
}
