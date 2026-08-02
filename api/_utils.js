import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

export class SafeInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "SafeInputError";
    this.status = 400;
  }
}

const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const CONTROL_CHARS_GLOBAL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const UNSAFE_TEXT_PATTERNS = [
  { pattern: /<\s*\/?\s*(script|iframe|object|embed|svg|math|link|meta|base|form|input|button|textarea|select|option|img|video|audio|source|style)\b/i, label: "HTML/script tag" },
  { pattern: /\bon[a-z]+\s*=/i, label: "script event handler" },
  { pattern: /\b(?:javascript|vbscript)\s*:/i, label: "script URL" },
  { pattern: /\bdata\s*:\s*(?:text\/html|image\/svg\+xml|application\/javascript)/i, label: "executable data URL" },
  { pattern: /\bsrcdoc\s*=/i, label: "embedded HTML document" },
  { pattern: /style\s*=\s*["'][^"']*expression\s*\(/i, label: "executable style expression" },
  { pattern: /file\s*:\s*\/\//i, label: "local file URL" },
];

export function unsafeTextReason(value) {
  const text = String(value || "");
  if (CONTROL_CHARS_RE.test(text)) return "hidden control character";
  const match = UNSAFE_TEXT_PATTERNS.find(item => item.pattern.test(text));
  return match?.label || "";
}

export function normalizeSafeText(value, {
  field = "Text",
  max = 1000,
  multiline = false,
  allowEmpty = true,
} = {}) {
  const normalized = String(value || "")
    .replace(CONTROL_CHARS_GLOBAL_RE, "")
    .replace(/\r\n?/g, "\n");
  const text = multiline ? normalized.trim() : normalized.replace(/\s+/g, " ").trim();
  if (!allowEmpty && !text) throw new SafeInputError(`${field} is required.`);
  if (text.length > max) throw new SafeInputError(`${field} is too long. Limit it to ${max} characters.`);
  const reason = unsafeTextReason(text);
  if (reason) {
    throw new SafeInputError(`${field} contains an unsafe ${reason}. Use plain text only; do not paste HTML, SVG, data URLs, scripts, or local file links.`);
  }
  return text;
}

export function normalizeSafeId(value, { field = "Question ID", max = 80 } = {}) {
  const id = normalizeSafeText(value, { field, max, multiline: false, allowEmpty: false });
  if (!/^[a-z0-9][a-z0-9_-]{1,79}$/i.test(id)) {
    throw new SafeInputError(`${field} can use only letters, numbers, hyphens, and underscores.`);
  }
  return id;
}

export function sanitizeJsonPayload(value, {
  field = "Payload",
  maxDepth = 8,
  maxStringLength = 12000,
  maxTotalStringLength = 50000,
} = {}) {
  let total = 0;
  const visit = (item, pathLabel, depth) => {
    if (depth > maxDepth) throw new SafeInputError(`${field} is too deeply nested.`);
    if (item == null || typeof item === "boolean") return item;
    if (typeof item === "number") {
      if (!Number.isFinite(item)) throw new SafeInputError(`${pathLabel} must be a finite number.`);
      return item;
    }
    if (typeof item === "string") {
      const cleaned = normalizeSafeText(item, {
        field: pathLabel,
        max: maxStringLength,
        multiline: true,
      });
      total += cleaned.length;
      if (total > maxTotalStringLength) throw new SafeInputError(`${field} is too large. Keep the saved question content under ${maxTotalStringLength} characters.`);
      return cleaned;
    }
    if (Array.isArray(item)) {
      if (item.length > 200) throw new SafeInputError(`${pathLabel} has too many items.`);
      return item.map((child, index) => visit(child, `${pathLabel}[${index}]`, depth + 1));
    }
    if (typeof item === "object") {
      const entries = Object.entries(item);
      if (entries.length > 200) throw new SafeInputError(`${pathLabel} has too many fields.`);
      const output = {};
      for (const [key, child] of entries) {
        if (["__proto__", "constructor", "prototype"].includes(key)) {
          throw new SafeInputError(`${pathLabel} contains an unsafe object key.`);
        }
        const safeKey = normalizeSafeText(key, { field: `${pathLabel} field name`, max: 80, multiline: false, allowEmpty: false });
        if (/^on[a-z]/i.test(safeKey) || ["dangerouslySetInnerHTML", "srcdoc", "style"].includes(safeKey)) {
          throw new SafeInputError(`${pathLabel} contains an unsafe object key.`);
        }
        output[safeKey] = visit(child, `${pathLabel}.${safeKey}`, depth + 1);
      }
      return output;
    }
    throw new SafeInputError(`${pathLabel} has an unsupported value.`);
  };
  return visit(value, field, 0);
}

export function requireJsonContentType(req) {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (contentType && !contentType.includes("application/json")) {
    throw new SafeInputError("This endpoint accepts JSON only. File uploads and form-data are not supported.");
  }
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getStripe() {
  return new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2025-04-30.basil",
  });
}

export function getSupabaseAdmin() {
  return createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

function getAdminEmails() {
  const configured = [
    process.env.ADMIN_EMAILS,
    process.env.ADMIN_EMAIL,
    process.env.OWNER_EMAIL,
    process.env.ROOT_ADMIN_EMAIL,
  ]
    .filter(Boolean)
    .join(",");

  return new Set(
    `${configured},secureplus.support@gmail.com`
      .split(",")
      .map(email => String(email || "").trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isQuestionAdminSchemaError(error) {
  return (
    error?.code === "42P01" ||
    error?.code === "42703" ||
    error?.code === "PGRST204" ||
    error?.code === "PGRST205" ||
    /question_override_history|question_overrides|app_admins|schema cache|relation/i.test(error?.message || "")
  );
}

export async function requireQuestionAdmin(supabase, token, actionLabel = "use Question Manager") {
  if (!token) {
    return { ok: false, status: 401, error: `Sign in before you ${actionLabel}.` };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) {
    return { ok: false, status: 401, error: "Your login session expired. Sign in again." };
  }

  const user = authData.user;
  const email = String(user.email || "").trim().toLowerCase();
  if (!email) {
    return { ok: false, status: 403, error: "This account has no email address, so it cannot use Question Manager." };
  }

  if (getAdminEmails().has(email)) {
    return { ok: true, user };
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("app_admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (adminError) {
    if (isQuestionAdminSchemaError(adminError)) {
      return {
        ok: false,
        status: 403,
        error: "This account is not listed as a Question Manager admin. Add the owner email to ADMIN_EMAILS in Vercel, or run supabase/question-admin.sql and add the email to app_admins.",
      };
    }
    throw adminError;
  }

  if (!adminRow) {
    return { ok: false, status: 403, error: "This account is not allowed to use Question Manager." };
  }

  return { ok: true, user };
}

export async function getJsonBody(req, { throwSafeErrors = false } = {}) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  try {
    const rawBody = await getRawBody(req);
    if (!rawBody.length) return {};
    return JSON.parse(rawBody.toString("utf8"));
  } catch (error) {
    if (throwSafeErrors && error instanceof SafeInputError) throw error;
    return {};
  }
}

export async function getRawBody(req) {
  const chunks = [];
  const maxBytes = Number.parseInt(process.env.MAX_JSON_BODY_BYTES || "1048576", 10);
  let totalBytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    totalBytes += buffer.length;
    if (Number.isFinite(maxBytes) && maxBytes > 0 && totalBytes > maxBytes) {
      throw new SafeInputError("Request body is too large.");
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}
