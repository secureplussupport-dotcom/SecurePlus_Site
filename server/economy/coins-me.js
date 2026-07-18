import {
  getBearerToken,
  getSupabaseAdmin,
  json,
} from "../../api/_utils.js";

function isMissingCipherCoinSchema(error) {
  return (
    error?.code === "42P01" ||
    error?.code === "42703" ||
    error?.code === "42883" ||
    error?.code === "PGRST204" ||
    error?.code === "PGRST205" ||
    /cipher_coin|cipher_coins|exam_passes|schema cache|relation/i.test(error?.message || "")
  );
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in to view Cipher Coins." });

    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const userId = authData.user.id;
    const [profileResult, transactionsResult, unlocksResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("cipher_coins,lifetime_cipher_coins,exam_passes")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("cipher_coin_transactions")
        .select("id,amount,balance_after,event_type,reference_key,metadata,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("cipher_coin_unlocks")
        .select("id,unlock_type,resource_id,coin_cost,unlocked_at,consumed_at")
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false }),
    ]);

    const firstError = profileResult.error || transactionsResult.error || unlocksResult.error;
    if (firstError) throw firstError;

    const profile = profileResult.data || {};
    const unlocks = unlocksResult.data || [];

    return json(res, 200, {
      ok: true,
      balance: Number(profile.cipher_coins || 0),
      lifetimeEarned: Number(profile.lifetime_cipher_coins || 0),
      examPasses: Number(profile.exam_passes || 0),
      unlockedPbqIds: unlocks
        .filter(item => item.unlock_type === "pbq")
        .map(item => item.resource_id),
      unlocks,
      transactions: transactionsResult.data || [],
    });
  } catch (error) {
    console.error("Cipher Coin wallet load failed:", error);
    if (isMissingCipherCoinSchema(error)) {
      return json(res, 409, {
        error: "Cipher Coin setup is pending. Run supabase/cipher-coins.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: "Unable to load Cipher Coins." });
  }
}
