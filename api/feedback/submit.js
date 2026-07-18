import {
  getBearerToken,
  getJsonBody,
  getSupabaseAdmin,
  json,
} from "../_utils.js";

const SUPPORT_EMAIL = "secureplus.support@gmail.com";
const BRAND_LOGO_URL = "https://www.secureplusprep.com/secureplus-logo.png";
const FEEDBACK_DESCRIPTION_MIN_LENGTH = 20;
const FEEDBACK_DESCRIPTION_MIN_WORDS = 5;

function cleanText(value, max = 1000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanMultiline(value, max = 4000) {
  return String(value || "").trim().slice(0, max);
}

function cleanIssueType(value) {
  const allowed = new Set([
    "inaccurate_answer",
    "obvious_answer",
    "confusing_context",
    "typo",
    "bad_explanation",
    "technical_bug",
    "other",
  ]);
  const issueType = cleanText(value, 40);
  return allowed.has(issueType) ? issueType : "other";
}

function countWords(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isMissingFeedbackSchema(error) {
  return (
    error?.code === "42P01" ||
    error?.code === "42703" ||
    error?.code === "PGRST205" ||
    /feedback_reports|app_admins|schema cache|relation/i.test(error?.message || "")
  );
}

async function sendFeedbackNotification(report) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const to = process.env.FEEDBACK_NOTIFY_EMAIL || SUPPORT_EMAIL;
  const from = process.env.FEEDBACK_FROM_EMAIL || "SecurePlus <noreply@secureplusprep.com>";
  const subject = `SecurePlus feedback: ${report.question_kind.toUpperCase()} ${report.question_id}`;
  const text = [
    "New SecurePlus feedback received.",
    "",
    `Question: ${report.question_kind} ${report.question_id}`,
    `Issue type: ${report.issue_type}`,
    `Reporter: ${report.user_email || report.contact_email || "Guest/unknown"}`,
    `Title: ${report.title}`,
    "",
    report.message,
    "",
    `Open the SecurePlus Internal Feedback page from the root account to review it.`,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html: `<!doctype html>
        <html lang="en">
          <body style="margin:0;padding:0;background:#f7f3eb;color:#2c2925;font-family:Arial,sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f7f3eb;">
              <tr><td align="center" style="padding:28px 14px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:580px;background:#fffdf8;border:1px solid #eadfce;border-radius:18px;overflow:hidden;">
                  <tr><td style="padding:22px 24px;background:#203e3b;color:#ffffff;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                      <td style="width:44px;vertical-align:middle;"><img src="${BRAND_LOGO_URL}" width="44" height="44" alt="SecurePlus" style="display:block;width:44px;height:44px;border:0;border-radius:11px;outline:none;text-decoration:none;"></td>
                      <td style="padding-left:12px;vertical-align:middle;"><div style="font-size:18px;font-weight:800;color:#ffffff;">SecurePlus</div><div style="margin-top:3px;font-size:11px;font-weight:700;color:#c8d9d4;">Internal feedback alert</div></td>
                    </tr></table>
                  </td></tr>
                  <tr><td style="padding:26px 24px;">
                    <h1 style="margin:0 0 18px;font-size:23px;line-height:1.3;color:#2c2925;">New feedback received</h1>
                    <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#625b52;"><strong>Question:</strong> ${escapeHtml(report.question_kind)} ${escapeHtml(report.question_id)}<br>
                    <strong>Issue type:</strong> ${escapeHtml(report.issue_type)}<br>
                    <strong>Reporter:</strong> ${escapeHtml(report.user_email || report.contact_email || "Guest/unknown")}</p>
                    <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#625b52;"><strong style="color:#2c2925;">${escapeHtml(report.title)}</strong></p>
                    <div style="padding:14px 16px;border:1px solid #d7e7df;border-radius:12px;background:#f1f8f4;color:#466156;font-size:14px;line-height:1.7;">${escapeHtml(report.message).replaceAll("\n", "<br>")}</div>
                    <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#81776b;">Open the SecurePlus Internal Feedback page from the root account to review it.</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.warn("Feedback notification email failed:", response.status, body);
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await getJsonBody(req);
    const message = cleanMultiline(body.message, 4000);
    if (message.length < FEEDBACK_DESCRIPTION_MIN_LENGTH) {
      return json(res, 400, { error: `Description must be at least ${FEEDBACK_DESCRIPTION_MIN_LENGTH} characters.` });
    }
    if (countWords(message) < FEEDBACK_DESCRIPTION_MIN_WORDS) {
      return json(res, 400, { error: `Description must be at least ${FEEDBACK_DESCRIPTION_MIN_WORDS} words.` });
    }

    const supabase = getSupabaseAdmin();
    const token = getBearerToken(req);
    let authUser = null;
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      authUser = data?.user || null;
    }

    const report = {
      user_id: authUser?.id || null,
      user_email: authUser?.email || null,
      contact_email: cleanText(body.contactEmail, 320),
      question_kind: cleanText(body.questionKind, 20) || "question",
      question_id: cleanText(body.questionId, 80) || "unknown",
      chapter: cleanText(body.chapter, 40),
      difficulty: cleanText(body.difficulty, 40),
      title: cleanText(body.title, 500) || "Question",
      selected_answer: cleanText(body.selectedAnswer, 40),
      correct_answer: cleanText(body.correctAnswer, 40),
      issue_type: cleanIssueType(body.issueType),
      message,
      page_url: cleanText(body.pageUrl, 900),
      user_agent: cleanText(req.headers["user-agent"], 500),
      status: "open",
    };

    const { data: inserted, error: insertError } = await supabase
      .from("feedback_reports")
      .insert(report)
      .select("id")
      .maybeSingle();

    if (insertError) throw insertError;

    const notificationSent = await sendFeedbackNotification(report);
    return json(res, 200, { ok: true, id: inserted?.id, notificationSent });
  } catch (error) {
    console.error("Feedback submission failed:", error);
    if (isMissingFeedbackSchema(error)) {
      return json(res, 409, {
        error: "Feedback database setup is missing. Run supabase/feedback.sql in Supabase SQL Editor.",
      });
    }
    return json(res, 500, { error: "Unable to submit feedback." });
  }
}
