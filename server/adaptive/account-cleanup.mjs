// Future confirmed-deletion integration; no API route imports this module.
// The Stripe/Supabase clients are server capabilities and are never serialized.
export function createAccountCleanup({ supabase, stripe, queue, log }) {
  return {
    queue, log,
    async cancelSubscription(ownerId) {
      const { data, error } = await supabase.from('profiles').select('stripe_subscription_id').eq('id', ownerId).maybeSingle();
      if (error) throw new Error('Subscription lookup unavailable');
      if (!data?.stripe_subscription_id) return;
      if (!stripe?.subscriptions?.cancel) throw new Error('Subscription cancellation unavailable');
      try { await stripe.subscriptions.cancel(data.stripe_subscription_id); }
      catch (error) { if (error?.code !== 'resource_missing') throw new Error('Subscription cancellation failed'); }
    },
    async deleteAuthUser(ownerId) {
      const { error } = await supabase.auth.admin.deleteUser(ownerId);
      if (error && error.code !== 'user_not_found') throw new Error('Auth deletion failed');
    },
  };
}
