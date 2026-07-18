import {
  getBearerToken,
  getJsonBody,
  getSupabaseAdmin,
  json,
} from "../../api/_utils.js";

const ACTIONS = new Set([
  "check_in",
  "daily_challenge",
  "unlock_pbq",
  "buy_exam_pass",
  "consume_exam_pass",
]);

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

function cleanResourceId(value) {
  return String(value || "").trim().replace(/[^A-Za-z0-9_-]/g, "").slice(0, 120);
}

async function callRpc(supabase, name, parameters) {
  const { data, error } = await supabase.rpc(name, parameters);
  if (error) throw error;
  if (!data?.ok) {
    const failure = new Error(data?.error || "Cipher Coin action failed.");
    failure.status = /not enough/i.test(failure.message) ? 409 : 400;
    failure.details = data;
    throw failure;
  }
  return data;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in to use Cipher Coins." });

    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return json(res, 401, { error: "Supabase session is invalid or expired." });
    }

    const body = await getJsonBody(req);
    const action = String(body.action || "").trim().toLowerCase();
    if (!ACTIONS.has(action)) return json(res, 400, { error: "Unknown Cipher Coin action." });

    const userId = authData.user.id;
    let result;

    if (action === "check_in") {
      result = await callRpc(supabase, "claim_cipher_daily_check_in", {
        target_user_id: userId,
      });
    }

    if (action === "daily_challenge") {
      const score = Math.round(Number(body.score));
      const total = Math.round(Number(body.total));
      if (!Number.isFinite(score) || !Number.isFinite(total) || total !== 5 || score < 0 || score > total) {
        return json(res, 400, { error: "A complete five-question challenge result is required." });
      }
      result = await callRpc(supabase, "record_cipher_daily_challenge", {
        target_user_id: userId,
        submitted_score: score,
        submitted_total: total,
      });
    }

    if (action === "unlock_pbq") {
      const resourceId = cleanResourceId(body.resourceId);
      if (!resourceId) return json(res, 400, { error: "Choose a PBQ to unlock." });

      const { data: pbq, error: pbqError } = await supabase
        .from("pbqs")
        .select("id")
        .eq("id", resourceId)
        .maybeSingle();
      if (pbqError) throw pbqError;
      if (!pbq) return json(res, 404, { error: "That PBQ is not available." });

      result = await callRpc(supabase, "purchase_cipher_coin_item", {
        target_user_id: userId,
        requested_item_type: "pbq",
        requested_resource_id: resourceId,
      });
    }

    if (action === "buy_exam_pass") {
      result = await callRpc(supabase, "purchase_cipher_coin_item", {
        target_user_id: userId,
        requested_item_type: "exam_pass",
        requested_resource_id: "",
      });
    }

    if (action === "consume_exam_pass") {
      result = await callRpc(supabase, "consume_cipher_exam_pass", {
        target_user_id: userId,
      });
    }

    return json(res, 200, { ok: true, action, ...result });
  } catch (error) {
    console.error("Cipher Coin action failed:", error);
    if (isMissingCipherCoinSchema(error)) {
      return json(res, 409, {
        error: "Cipher Coin setup is pending. Run supabase/cipher-coins.sql in Supabase SQL Editor.",
      });
    }
    return json(res, error.status || 500, {
      error: error.message || "Unable to complete the Cipher Coin action.",
      ...(error.details || {}),
    });
  }
}
