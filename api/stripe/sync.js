import {
  getBearerToken,
  getStripe,
  getSupabaseAdmin,
  json,
} from "../_utils.js";

function subscriptionTier(status) {
  return status === "active" || status === "trialing" ? "pro" : "free";
}

function pickBestSubscription(subscriptions = []) {
  return (
    subscriptions.find((sub) => sub.status === "active" || sub.status === "trialing") ||
    subscriptions[0] ||
    null
  );
}

async function updateProfile(supabase, userId, patch) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("id,email,tier,subscription_status,stripe_customer_id,stripe_subscription_id,pro_trial_until,referral_code")
    .maybeSingle();

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
    if (!token) return json(res, 401, { error: "Sign in before syncing billing." });

    const supabase = getSupabaseAdmin();
    const stripe = getStripe();

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const authUser = authData.user;
    const { sessionId } = req.body || {};

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,stripe_customer_id")
      .eq("id", authUser.id)
      .maybeSingle();
    if (profileError) throw profileError;

    let customerId = profile?.stripe_customer_id || null;
    let subscription = null;

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      });

      const sessionUserId = session.metadata?.supabase_user_id || session.client_reference_id;
      if (sessionUserId !== authUser.id) {
        return json(res, 403, { error: "Checkout session does not belong to this user." });
      }

      customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      subscription =
        typeof session.subscription === "string"
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription;
    }

    if (!subscription && customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
      });
      subscription = pickBestSubscription(subscriptions.data);
    }

    if (!subscription) {
      return json(res, 404, { error: "No Stripe subscription found for this account." });
    }

    const updatedProfile = await updateProfile(supabase, authUser.id, {
      tier: subscriptionTier(subscription.status),
      stripe_customer_id: customerId || subscription.customer,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
    });

    return json(res, 200, {
      ok: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Stripe billing sync failed:", error);
    return json(res, 500, { error: "Unable to sync Stripe subscription." });
  }
}
