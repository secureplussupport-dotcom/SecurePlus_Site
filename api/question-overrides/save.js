import {
  getBearerToken,
  getJsonBody,
  getSupabaseAdmin,
  json,
} from "../_utils.js";

function cleanText(value, max = 1000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanQuestionKind(value) {
  const kind = cleanText(value, 10).toLowerCase();
  return kind === "pbq" ? "pbq" : "mcq";
}

function cleanAction(value) {
  const action = cleanText(value, 20).toLowerCase();
  return action === "disable" ? "disable" : "upsert";
}

function cleanPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function isMissingQuestionAdminSchema(error) {
  return (
    error?.code === "42P01" ||
    error?.code === "42703" ||
    error?.code === "PGRST205" ||
    /question_overrides|app_admins|schema cache|relation/i.test(error?.message || "")
  );
}

async function requireAdmin(supabase, token) {
  if (!token) return { ok: false, status: 401, error: "Sign in before using Question Manager." };

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
  if (!adminRow) {
    return { ok: false, status: 403, error: "This account is not allowed to edit questions." };
  }

  return { ok: true, user: authData.user };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const supabase = getSupabaseAdmin();
    const admin = await requireAdmin(supabase, getBearerToken(req));
    if (!admin.ok) return json(res, admin.status, { error: admin.error });

    const body = await getJsonBody(req);
    const questionKind = cleanQuestionKind(body.questionKind);
    const action = cleanAction(body.action);
    const payload = cleanPayload(body.payload);
    const questionId = cleanText(body.questionId || payload.id, 80);
    const sortOrderValue = Number.parseInt(body.sortOrder, 10);
    const sortOrder = Number.isFinite(sortOrderValue) && sortOrderValue > 0 ? sortOrderValue : null;

    if (!questionId) return json(res, 400, { error: "Question ID is required." });
    if (action === "upsert" && !payload.id) return json(res, 400, { error: "Question payload is missing its ID." });

    const { data, error } = await supabase
      .from("question_overrides")
      .upsert({
        question_kind: questionKind,
        question_id: questionId,
        action,
        payload: action === "disable" ? { id: questionId } : payload,
        sort_order: action === "disable" ? null : sortOrder,
        status: "active",
        updated_by: admin.user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "question_kind,question_id" })
      .select("question_kind,question_id,action,sort_order,status,updated_at")
      .maybeSingle();

    if (error) throw error;

    return json(res, 200, { ok: true, override: data });
  } catch (error) {
    console.error("Question override save failed:", error);
    if (isMissingQuestionAdminSchema(error)) {
      return json(res, 409, {
        error: "Question Manager database setup is missing. Run supabase/question-admin.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: error.message || "Unable to save question change." });
  }
}
