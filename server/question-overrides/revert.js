import {
  getBearerToken,
  getJsonBody,
  getSupabaseAdmin,
  isQuestionAdminSchemaError,
  json,
  requireQuestionAdmin,
} from "../../api/_utils.js";

function overrideSnapshot(row) {
  if (!row) return null;
  return {
    question_kind: row.question_kind,
    question_id: row.question_id,
    action: row.action,
    payload: row.payload || {},
    sort_order: row.sort_order ?? null,
    status: row.status || "active",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const supabase = getSupabaseAdmin();
    const admin = await requireQuestionAdmin(supabase, getBearerToken(req), "revert question changes");
    if (!admin.ok) return json(res, admin.status, { error: admin.error });

    const body = await getJsonBody(req);
    const historyId = String(body.historyId || "").trim();
    if (!historyId) return json(res, 400, { error: "History item is required." });

    const { data: recentRows, error: recentError } = await supabase
      .from("question_override_history")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(3);
    if (recentError) throw recentError;
    if (!(recentRows || []).some(row => row.id === historyId)) {
      return json(res, 403, { error: "Only the last 3 question changes can be reverted." });
    }

    const { data: history, error: historyError } = await supabase
      .from("question_override_history")
      .select("id,question_kind,question_id,previous_override,next_override")
      .eq("id", historyId)
      .maybeSingle();
    if (historyError) throw historyError;
    if (!history) return json(res, 404, { error: "History item was not found." });

    const { data: currentRow, error: currentError } = await supabase
      .from("question_overrides")
      .select("question_kind,question_id,action,payload,sort_order,status")
      .eq("question_kind", history.question_kind)
      .eq("question_id", history.question_id)
      .maybeSingle();
    if (currentError) throw currentError;

    const previous = history.previous_override;
    if (previous) {
      const { error: upsertError } = await supabase
        .from("question_overrides")
        .upsert({
          question_kind: previous.question_kind || history.question_kind,
          question_id: previous.question_id || history.question_id,
          action: previous.action || "upsert",
          payload: previous.payload || {},
          sort_order: previous.sort_order ?? null,
          status: previous.status || "active",
          updated_by: admin.user.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: "question_kind,question_id" });
      if (upsertError) throw upsertError;
    } else {
      const { error: deleteError } = await supabase
        .from("question_overrides")
        .delete()
        .eq("question_kind", history.question_kind)
        .eq("question_id", history.question_id);
      if (deleteError) throw deleteError;
    }

    const { error: logError } = await supabase
      .from("question_override_history")
      .insert({
        question_kind: history.question_kind,
        question_id: history.question_id,
        change_type: "revert",
        previous_override: overrideSnapshot(currentRow),
        next_override: previous || null,
        changed_by: admin.user.id,
        changed_by_email: admin.user.email || "",
      });
    if (logError) throw logError;

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("Question override revert failed:", error);
    if (isQuestionAdminSchemaError(error)) {
      return json(res, 409, {
        error: "Question Manager history setup is missing. Run supabase/question-admin.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: error.message || "Unable to revert question change." });
  }
}
