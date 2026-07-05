import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
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

export async function getJsonBody(req) {
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
  } catch {
    return {};
  }
}

export async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}
