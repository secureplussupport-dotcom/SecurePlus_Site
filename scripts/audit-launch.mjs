import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const warnings = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function push(list, file, message) {
  list.push(`${file}: ${message}`);
}

function requireContains(file, text, message = `missing ${text}`) {
  if (!read(file).includes(text)) push(errors, file, message);
}

function requirePattern(file, pattern, message) {
  if (!pattern.test(read(file))) push(errors, file, message);
}

function walkFiles(dir) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  const entries = fs.readdirSync(full, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(rel));
    else files.push(rel);
  }
  return files;
}

const requiredFiles = [
  "api/_utils.js",
  "api/stripe/checkout.js",
  "api/stripe/sync.js",
  "api/stripe/webhook.js",
  "api/stripe/portal.js",
  "api/referrals/claim.js",
  "api/referrals/me.js",
  "api/account/delete.js",
  "supabase/schema.sql",
  ".env.example",
];

for (const file of requiredFiles) {
  if (!exists(file)) push(errors, file, "required launch file is missing");
}

if (!errors.length) {
  const env = read(".env.example");
  for (const name of [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_PRO",
    "STRIPE_WEBHOOK_SECRET",
    "APP_URL",
    "VITE_PUBLIC_POSTHOG_TOKEN",
  ]) {
    if (!env.includes(`${name}=`)) push(errors, ".env.example", `missing ${name}`);
  }

  requireContains("api/_utils.js", "SUPABASE_SERVICE_ROLE_KEY", "server API must use Supabase service role only on the server");
  requireContains("api/_utils.js", "STRIPE_SECRET_KEY", "server API must load Stripe secret from process.env");
  requireContains("api/_utils.js", "persistSession: false", "server Supabase admin client should not persist sessions");

  for (const file of [
    "api/stripe/checkout.js",
    "api/stripe/sync.js",
    "api/stripe/portal.js",
    "api/referrals/claim.js",
    "api/referrals/me.js",
    "api/account/delete.js",
  ]) {
    requireContains(file, "getBearerToken(req)", "authenticated API route must require a bearer token");
    requireContains(file, "supabase.auth.getUser(token)", "authenticated API route must verify the token with Supabase");
    requirePattern(file, /if\s*\(\s*req\.method\s*!==|req\.method !== "GET" && req\.method !== "POST"/, "API route should reject unexpected HTTP methods");
  }

  requireContains("api/stripe/checkout.js", 'mode: "subscription"', "Stripe checkout must create a subscription session");
  requireContains("api/stripe/checkout.js", 'requireEnv("STRIPE_PRICE_PRO")', "Stripe checkout must use the configured Pro price ID");
  requireContains("api/stripe/checkout.js", "client_reference_id: authUser.id", "Stripe checkout must bind the session to the Supabase user id");
  requireContains("api/stripe/sync.js", "sessionUserId !== authUser.id", "Stripe sync must reject checkout sessions owned by another user");
  requireContains("api/stripe/webhook.js", "stripe.webhooks.constructEvent", "Stripe webhook must verify the webhook signature");
  requireContains("api/stripe/webhook.js", 'requireEnv("STRIPE_WEBHOOK_SECRET")', "Stripe webhook must use STRIPE_WEBHOOK_SECRET");
  requireContains("api/stripe/webhook.js", 'event.type === "customer.subscription.updated"', "Stripe webhook should handle subscription updates");
  requireContains("api/stripe/webhook.js", 'event.type === "customer.subscription.deleted"', "Stripe webhook should handle subscription deletion");

  const schema = read("supabase/schema.sql");
  for (const table of ["profiles", "attempts", "referrals", "starred_questions"]) {
    requireContains("supabase/schema.sql", `alter table ${table} enable row level security`, `${table} must have RLS enabled`);
  }
  if (/create policy\s+"Users can update own profile"/i.test(schema)) {
    push(errors, "supabase/schema.sql", "users must not be able to update their own profile tier/subscription fields directly");
  }
  requireContains("supabase/schema.sql", 'check (tier in (\'free\', \'pro\'))', "profiles tier must be constrained");
  requireContains("supabase/schema.sql", "profiles_subscription_status_check", "subscription status must be constrained");
  requireContains("supabase/schema.sql", "auth.uid() = user_id", "attempt/starred policies must scope rows to the signed-in user");
  requireContains("supabase/schema.sql", "referrals_one_new_user_per_referrer_idx", "referrals must enforce one new user per referrer");

  const app = read("src/App.jsx");
  requireContains("src/App.jsx", 'n.id==="exam"&&user.tier!=="pro"?"pricing":n.id', "free users pressing Exam Mode should be redirected to Upgrade");
  requireContains("src/App.jsx", "isFreePBQPreview", "free users should only get the configured PBQ preview");
  requireContains("src/App.jsx", 'user.tier==="free"&&!isFreePBQPreview(q)?setView("pricing"):setPbqQ(q)', "PBQ start handler should gate non-preview PBQs");
  requireContains("src/App.jsx", 'user?.tier === "pro" && ["active","trialing"].includes(user?.subscriptionStatus)', "paid Pro should depend on active/trialing subscription status");
  requireContains("src/App.jsx", 'fetch("/api/stripe/checkout"', "upgrade flow should call the server-side Stripe checkout endpoint");

  const trackedTextFiles = [
    ...walkFiles("api"),
    ...walkFiles("src"),
    ...walkFiles("scripts"),
    ...walkFiles("supabase"),
    "index.html",
    "package.json",
    ".env.example",
  ].filter(file => /\.(js|jsx|mjs|sql|html|json|example)$/.test(file));

  for (const file of trackedTextFiles) {
    const text = read(file);
    const leakedStripeSecret = text.match(/\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/);
    const leakedWebhookSecret = text.match(/\bwhsec_[A-Za-z0-9]{20,}\b/);
    if (leakedStripeSecret) push(errors, file, "looks like a real Stripe secret key is committed");
    if (leakedWebhookSecret) push(errors, file, "looks like a real Stripe webhook secret is committed");
  }
}

console.log("Launch/security audit");
console.log("- Checked server API auth gates, Stripe webhook checks, RLS schema, env placeholders, and Pro UI gates");

if (errors.length) {
  console.error(`\nFound ${errors.length} launch issue${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

console.log("Launch/security audit passed with no structural errors.");
