import {
  getBearerToken,
  getJsonBody,
  getSupabaseAdmin,
  isQuestionAdminSchemaError,
  json,
  normalizeSafeId,
  normalizeSafeText,
  requireJsonContentType,
  requireQuestionAdmin,
  SafeInputError,
  sanitizeJsonPayload,
} from "../../api/_utils.js";

function cleanText(value, max = 1000) {
  return normalizeSafeText(value, { max, multiline: false });
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
  return sanitizeJsonPayload(value, {
    field: "Question payload",
    maxDepth: 8,
    maxStringLength: 12000,
    maxTotalStringLength: 50000,
  });
}

function buildPbqRow(question, sortOrder) {
  const domain = Number.parseInt(question.ch || question.domain || "1", 10) || 1;
  const evidence = {
    logData: question.logData || "",
    currentConfig: question.currentConfig || "",
    codeBlock: question.codeBlock || "",
    codeLanguage: question.codeLanguage || "",
    diagram: question.diagram || "",
    hint: question.hint || "",
  };
  Object.keys(evidence).forEach(key => {
    if (!evidence[key]) delete evidence[key];
  });

  const interactiveData = {
    choices: question.choices || question.options || [],
    items: question.items || [],
    targets: question.targets || [],
    targetLayout: question.targetLayout || null,
    blanks: question.blanks || [],
    selectionOptions: question.selectionOptions || [],
  };
  Object.keys(interactiveData).forEach(key => {
    if (interactiveData[key] === null || (Array.isArray(interactiveData[key]) && !interactiveData[key].length)) delete interactiveData[key];
  });

  const correctAnswer = {
    correct: question.correct,
    answer: question.answer || "",
    correctMapping: question.correctMapping || null,
    correctOrder: question.correctOrder || null,
  };
  Object.keys(correctAnswer).forEach(key => {
    if (correctAnswer[key] === null || correctAnswer[key] === "" || correctAnswer[key] === undefined) delete correctAnswer[key];
  });

  const payload = sanitizeJsonPayload({
    scenario: question.scenario || "",
    question: question.question || "",
    explanation: question.explanation || "",
    evidence,
    interactiveData,
    correctAnswer,
    wrongFeedback: question.wrongFeedback || {},
    optionFeedback: question.optionFeedback || {},
    objective: question.objective || "",
    syllabusDomain: question.syllabusDomain || `Domain ${String(question.ch || domain)}`,
    difficulty: question.difficulty || "medium",
    cat: question.cat || "",
    ch: String(question.ch || domain),
    beyondTextbook: Boolean(question.beyondTextbook),
    acronyms: question.acronyms || [],
    sortOrder,
    appQuestion: question,
  }, {
    field: "PBQ payload",
    maxDepth: 8,
    maxStringLength: 12000,
    maxTotalStringLength: 50000,
  });

  return {
    id: question.id,
    title: normalizeSafeText(question.title || "Untitled PBQ", { field: "PBQ title", max: 160 }),
    type: normalizeSafeText(question.type || "SCENARIO", { field: "PBQ type", max: 40 }),
    domain,
    is_pro: question.is_pro ?? question.isPro ?? true,
    payload,
    updated_at: new Date().toISOString(),
  };
}

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
    requireJsonContentType(req);
    const supabase = getSupabaseAdmin();
    const admin = await requireQuestionAdmin(supabase, getBearerToken(req), "edit questions");
    if (!admin.ok) return json(res, admin.status, { error: admin.error });

    const body = await getJsonBody(req, { throwSafeErrors: true });
    const questionKind = cleanQuestionKind(body.questionKind);
    const action = cleanAction(body.action);
    const payload = cleanPayload(body.payload);
    const questionId = normalizeSafeId(body.questionId || payload.id, { field: "Question ID", max: 80 });
    const sortOrderValue = Number.parseInt(body.sortOrder, 10);
    const sortOrder = Number.isFinite(sortOrderValue) && sortOrderValue > 0 ? sortOrderValue : null;

    if (!questionId) return json(res, 400, { error: "Question ID is required." });
    if (action === "upsert" && !payload.id) return json(res, 400, { error: "Question payload is missing its ID." });

    if (questionKind === "pbq") {
      if (action === "disable") {
        const { error: deletePbqError } = await supabase
          .from("pbqs")
          .delete()
          .eq("id", questionId);
        if (deletePbqError) throw deletePbqError;
      } else {
        const pbqRow = buildPbqRow(payload, sortOrder);
        const { error: pbqUpsertError } = await supabase
          .from("pbqs")
          .upsert(pbqRow, { onConflict: "id" });
        if (pbqUpsertError) throw pbqUpsertError;
      }
    }

    const { data: previousRow, error: previousError } = await supabase
      .from("question_overrides")
      .select("question_kind,question_id,action,payload,sort_order,status")
      .eq("question_kind", questionKind)
      .eq("question_id", questionId)
      .maybeSingle();
    if (previousError) throw previousError;

    const nextOverride = {
      question_kind: questionKind,
      question_id: questionId,
      action,
      payload: action === "disable" ? { id: questionId } : payload,
      sort_order: action === "disable" ? null : sortOrder,
      status: "active",
    };

    const { data, error } = await supabase
      .from("question_overrides")
      .upsert({
        ...nextOverride,
        updated_by: admin.user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "question_kind,question_id" })
      .select("question_kind,question_id,action,sort_order,status,updated_at")
      .maybeSingle();

    if (error) throw error;

    const changeType = action === "disable" ? "delete" : previousRow ? "change" : "add";
    const { error: historyError } = await supabase
      .from("question_override_history")
      .insert({
        question_kind: questionKind,
        question_id: questionId,
        change_type: changeType,
        previous_override: overrideSnapshot(previousRow),
        next_override: nextOverride,
        changed_by: admin.user.id,
        changed_by_email: admin.user.email || "",
      });
    if (historyError) throw historyError;

    return json(res, 200, { ok: true, override: data });
  } catch (error) {
    console.error("Question override save failed:", error);
    if (error instanceof SafeInputError) {
      return json(res, error.status, { error: error.message });
    }
    if (isQuestionAdminSchemaError(error)) {
      return json(res, 409, {
        error: "Question Manager database setup is missing. Run supabase/question-admin.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: error.message || "Unable to save question change." });
  }
}
