import { fulfillAccessPass } from "./access-pass.js";
import {
  getRawBody,
  getStripe,
  getSupabaseAdmin,
  json,
  requireEnv,
} from "../../api/_utils.js";
import {
  isCancellationSchemaError,
  subscriptionProfilePatch,
  subscriptionTier,
  withoutCancellationColumns,
} from "./_subscription.js";

async function updateProfileByUserId(supabase, userId, patch) {
  if (!userId) return;
  let { error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (isCancellationSchemaError(error)) {
    ({ error } = await supabase
      .from("profiles")
      .update({ ...withoutCancellationColumns(patch), updated_at: new Date().toISOString() })
      .eq("id", userId));
  }
  if (error) throw error;
}

async function updateProfileByCustomerId(supabase, customerId, patch) {
  if (!customerId) return;
  let { error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", customerId);
  if (isCancellationSchemaError(error)) {
    ({ error } = await supabase
      .from("profiles")
      .update({ ...withoutCancellationColumns(patch), updated_at: new Date().toISOString() })
      .eq("stripe_customer_id", customerId));
  }
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
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      if(session.metadata?.access_pass){
        if(session.payment_status==='paid')await fulfillAccessPass(supabase,session);
        return json(res,200,{received:true});
      }
      if(session.mode!=="subscription")return json(res,200,{received:true});
      const userId = session.metadata?.supabase_user_id || session.client_reference_id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      let subscriptionStatus = "active";
      let subscriptionPatch = {};
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        subscriptionStatus = subscription.status;
        subscriptionPatch = subscriptionProfilePatch(subscription);
      }

      await updateProfileByUserId(supabase, userId, {
        tier: subscriptionTier(subscriptionStatus),
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : session.customer?.id,
        stripe_subscription_id: subscriptionId || null,
        subscription_status: subscriptionStatus,
        ...subscriptionPatch,
      });
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      await updateProfileByCustomerId(supabase, subscription.customer, subscriptionProfilePatch(subscription));
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      await updateProfileByCustomerId(supabase, invoice.customer, {
        tier: "free",
        subscription_status: "past_due",
        subscription_cancel_at_period_end: false,
      });
    }

    return json(res, 200, { received: true });
  } catch (error) {
    console.error("Stripe webhook handling failed:", error);
    return json(res, 500, { error: "Webhook handling failed." });
  }
}
