import {
  getBearerToken,
  getSupabaseAdmin,
  json,
} from "../_utils.js";

function isMissingQuestionAdminSchema(error) {
  return (
    error?.code === "42P01" ||
    error?.code === "42703" ||
    error?.code === "PGRST205" ||
    /question_override_history|question_overrides|app_admins|schema cache|relation/i.test(error?.message || "")
  );
}

async function requireAdmin(supabase, token) {
  if (!token) return { ok: false, status: 401, error: "Sign in before viewing question history." };

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    return { ok: false, status: 401, error: "Your login session expired. Sign in again." };
  }

  const email = String(authData.user.email || "").trim().toLowerCase();
  const { data: adminRow, error: adminError } = await supabase
    .from("app_admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (adminError) throw adminError;
  if (!adminRow) return { ok: false, status: 403, error: "This account is not allowed to view question history." };

  return { ok: true, user: authData.user };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("allow", "GET");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const supabase = getSupabaseAdmin();
    const admin = await requireAdmin(supabase, getBearerToken(req));
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
    if (isMissingQuestionAdminSchema(error)) {
      return json(res, 409, {
        error: "Question Manager history setup is missing. Run supabase/question-admin.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: error.message || "Unable to load question history." });
  }
}
