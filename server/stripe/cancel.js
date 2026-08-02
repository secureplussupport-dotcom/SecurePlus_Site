import {
  getBearerToken,
  getStripe,
  getSupabaseAdmin,
  json,
} from "../../api/_utils.js";
import {
  isCancellationSchemaError,
  subscriptionProfilePatch,
  withoutCancellationColumns,
} from "./_subscription.js";

async function updateProfile(supabase, userId, patch) {
  let { data, error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("id,email,tier,subscription_status,subscription_cancel_at_period_end,subscription_current_period_end,stripe_customer_id,stripe_subscription_id,pro_trial_until,referral_code")
    .maybeSingle();

  if (isCancellationSchemaError(error)) {
    ({ data, error } = await supabase
      .from("profiles")
      .update({ ...withoutCancellationColumns(patch), updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select("id,email,tier,subscription_status,stripe_customer_id,stripe_subscription_id,pro_trial_until,referral_code")
      .maybeSingle());
    if (!error && data) data = { ...data, ...patch };
  }

  if (error) throw error;
  return data;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before cancelling membership renewal." });

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const authUser = authData.user;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,stripe_customer_id,stripe_subscription_id,subscription_status")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile?.stripe_subscription_id) {
      return json(res, 400, { error: "No active Stripe subscription is linked to this account." });
    }

    const existingSubscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
    const subscriptionCustomer =
      typeof existingSubscription.customer === "string"
        ? existingSubscription.customer
        : existingSubscription.customer?.id || "";

    if (profile.stripe_customer_id && subscriptionCustomer !== profile.stripe_customer_id) {
      return json(res, 403, { error: "This subscription does not belong to the signed-in account." });
    }

    if (existingSubscription.status === "canceled") {
      const updatedProfile = await updateProfile(supabase, authUser.id, subscriptionProfilePatch(existingSubscription));
      return json(res, 200, {
        ok: true,
        alreadyCanceled: true,
        profile: updatedProfile,
      });
    }

    const subscription = existingSubscription.cancel_at_period_end
      ? existingSubscription
      : await stripe.subscriptions.update(existingSubscription.id, {
          cancel_at_period_end: true,
        });

    const updatedProfile = await updateProfile(supabase, authUser.id, subscriptionProfilePatch(subscription));

    return json(res, 200, {
      ok: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Stripe renewal cancellation failed:", error);
    return json(res, 500, { error: "Unable to cancel membership renewal." });
  }
}
