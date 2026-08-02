export function subscriptionTier(status) {
  return status === "active" || status === "trialing" ? "pro" : "free";
}

export function unixToIso(seconds) {
  const value = Number(seconds || 0);
  return Number.isFinite(value) && value > 0 ? new Date(value * 1000).toISOString() : null;
}

export function subscriptionPeriodEnd(subscription) {
  const direct = unixToIso(subscription?.current_period_end);
  if (direct) return direct;

  const itemEnds = (subscription?.items?.data || [])
    .map((item) => Number(item?.current_period_end || 0))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (itemEnds.length) return unixToIso(Math.max(...itemEnds));
  return unixToIso(subscription?.cancel_at);
}

export function subscriptionProfilePatch(subscription, extra = {}) {
  const customer =
    typeof subscription?.customer === "string"
      ? subscription.customer
      : subscription?.customer?.id || null;

  return {
    tier: subscriptionTier(subscription?.status),
    stripe_customer_id: customer,
    stripe_subscription_id: subscription?.id || null,
    subscription_status: subscription?.status || null,
    subscription_cancel_at_period_end: Boolean(subscription?.cancel_at_period_end),
    subscription_current_period_end: subscriptionPeriodEnd(subscription),
    ...extra,
  };
}

export function isCancellationSchemaError(error) {
  return (
    error?.code === "42703" ||
    /subscription_cancel_at_period_end|subscription_current_period_end|schema cache/i.test(error?.message || "")
  );
}

export function withoutCancellationColumns(patch = {}) {
  const {
    subscription_cancel_at_period_end,
    subscription_current_period_end,
    ...safePatch
  } = patch;
  return safePatch;
}
