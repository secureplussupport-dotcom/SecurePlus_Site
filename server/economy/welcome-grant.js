import { CIPHER_COINS_ACTIVE } from "../../src/lib/archivedFeatures.js";
export const CIPHER_WELCOME_GRANT = 150;

// The welcome economy first went live on 17 July 2026. Using the immutable
// Auth creation timestamp keeps this repair limited to genuinely new accounts;
// user-editable profile metadata is intentionally not used for eligibility.
export const CIPHER_WELCOME_LAUNCH_AT = Date.parse("2026-07-17T00:00:00.000Z");

export function isCipherWelcomeEligible(authUser) {
  const createdAt = Date.parse(String(authUser?.created_at || ""));
  return Boolean(authUser?.id && Number.isFinite(createdAt) && createdAt >= CIPHER_WELCOME_LAUNCH_AT);
}

export async function ensureCipherWelcomeGrant(supabase, authUser) {
  if (!CIPHER_COINS_ACTIVE) return { ok: true, eligible: false, awarded: false, amount: 0, reason: "archived" };
  if (!isCipherWelcomeEligible(authUser)) {
    return { ok: true, eligible: false, awarded: false, amount: 0, reason: "account_predates_welcome_grant" };
  }

  const { data, error } = await supabase.rpc("award_cipher_coins", {
    target_user_id: authUser.id,
    reward_amount: CIPHER_WELCOME_GRANT,
    reward_event_type: "onboarding_welcome",
    reward_reference_key: `onboarding_welcome:${authUser.id}`,
    reward_metadata: {
      source: "academy_onboarding",
      repair: "wallet_guard",
    },
  });

  if (error) throw error;
  if (!data?.ok) {
    const failure = new Error(data?.error || "Unable to secure the welcome Cipher Coins.");
    failure.status = 409;
    throw failure;
  }

  return { eligible: true, ...data };
}
