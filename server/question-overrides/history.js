import {
  getBearerToken,
  getSupabaseAdmin,
  isQuestionAdminSchemaError,
  json,
  requireQuestionAdmin,
} from "../../api/_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("allow", "GET");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = getBearerToken(req);
    if (!token) return json(res, 401, { error: "Sign in before you view question history." });

    const supabase = getSupabaseAdmin();
    const admin = await requireQuestionAdmin(supabase, token, "view question history");
    if (!admin.ok) return json(res, admin.status, { error: admin.error });

    const limit = Math.min(Math.max(Number.parseInt(req.query?.limit || "20", 10) || 20, 1), 50);
    const { data, error } = await supabase
      .from("question_override_history")
      .select("id,question_kind,question_id,change_type,previous_override,next_override,changed_by_email,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    return json(res, 200, { ok: true, history: data || [] });
  } catch (error) {
    console.error("Question override history failed:", error);
    if (isQuestionAdminSchemaError(error)) {
      return json(res, 409, {
        error: "Question Manager history setup is missing. Run supabase/question-admin.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: error.message || "Unable to load question history." });
  }
}
