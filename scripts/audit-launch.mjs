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
  "api/economy.js",
  "server/economy/referral-claim.js",
  "server/economy/referral-me.js",
  "server/economy/coins-me.js",
  "server/economy/coins-action.js",
  "server/economy/welcome-grant.js",
  "api/account/delete.js",
  "api/account/delete-request.js",
  "api/account/_deletion-email.js",
  "api/feedback/submit.js",
  "supabase/schema.sql",
  "supabase/cipher-coins.sql",
  "supabase/account-deletion.sql",
  "supabase/email-templates/confirm-signup.html",
  "supabase/email-templates/magic-link.html",
  "supabase/email-templates/password-changed.html",
  "supabase/email-templates/reset-password.html",
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
    "RESEND_API_KEY",
    "ACCOUNT_DELETE_FROM_EMAIL",
    "ACCOUNT_DELETE_SITE_URL",
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
    "server/economy/referral-claim.js",
    "server/economy/referral-me.js",
    "server/economy/coins-me.js",
    "server/economy/coins-action.js",
    "api/account/delete.js",
    "api/account/delete-request.js",
  ]) {
    requireContains(file, "getBearerToken(req)", "authenticated API route must require a bearer token");
    requireContains(file, "supabase.auth.getUser(token)", "authenticated API route must verify the token with Supabase");
    requirePattern(file, /if\s*\(\s*req\.method\s*!==|req\.method !== "GET" && req\.method !== "POST"/, "API route should reject unexpected HTTP methods");
  }

  requireContains("api/stripe/checkout.js", 'mode: "subscription"', "Stripe checkout must create a subscription session");
  requireContains("api/account/delete-request.js", 'from("account_deletion_requests")', "deletion requests must be stored server-side");
  requireContains("api/account/delete-request.js", 'process.env.RESEND_API_KEY', "deletion emails must use the configured transactional provider");
  requireContains("api/account/delete-request.js", 'supabase.auth.signInWithOtp', "deletion email must retain a safe Supabase fallback until transactional email is configured");
  for (const file of [
    "api/account/_deletion-email.js",
    "api/feedback/submit.js",
    "supabase/email-templates/confirm-signup.html",
    "supabase/email-templates/magic-link.html",
    "supabase/email-templates/password-changed.html",
    "supabase/email-templates/reset-password.html",
  ]) {
    requireContains(file, "https://www.secureplusprep.com/secureplus-logo.png", "email template must use the public SecurePlus logo");
    requireContains(file, 'alt="SecurePlus"', "email logo must keep accessible fallback text");
  }
  requireContains("api/account/delete.js", 'body.deletionToken', "account deletion must require a single-use email token");
  requireContains("api/account/delete.js", 'supabase.auth.admin.signOut(token, "global")', "account deletion must revoke Supabase sessions before deleting the user");
  requireContains("supabase/account-deletion.sql", "alter table public.account_deletion_requests enable row level security", "deletion requests must have RLS enabled");
  requireContains("supabase/account-deletion.sql", "revoke all on table public.account_deletion_requests from anon, authenticated", "browser clients must not access deletion tokens");
  requireContains("api/stripe/checkout.js", 'requireEnv("STRIPE_PRICE_PRO")', "Stripe checkout must use the configured Pro price ID");
  requireContains("api/stripe/checkout.js", "PRO_ACADEMY_PASS_AMOUNT = 999", "Stripe checkout must require the advertised $9.99 amount");
  requireContains("api/stripe/checkout.js", 'PRO_ACADEMY_PASS_INTERVAL = "month"', "Stripe checkout must use a monthly interval base");
  requireContains("api/stripe/checkout.js", "PRO_ACADEMY_PASS_INTERVAL_COUNT = 3", "Stripe checkout must bill every three months");
  requireContains("api/stripe/checkout.js", "isProAcademyPassPrice", "Stripe checkout must validate the configured price before charging");
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
  const coinsSchema=read("supabase/cipher-coins.sql");
  for (const table of ["cipher_coin_transactions", "cipher_coin_unlocks", "cipher_coin_daily_activity"]) {
    requireContains("supabase/cipher-coins.sql", `alter table public.${table} enable row level security`, `${table} must have RLS enabled`);
  }
  requireContains("supabase/cipher-coins.sql", "unique (user_id, reference_key)", "coin rewards must have idempotent ledger references");
  requireContains("supabase/cipher-coins.sql", "grant execute on function public.award_cipher_coins", "coin mutations should be service-role-only RPCs");
  requireContains("server/economy/coins-me.js", "ensureCipherWelcomeGrant", "wallet loads must persist or repair the welcome grant before returning a balance");
  requireContains("server/economy/coins-action.js", "ensureCipherWelcomeGrant", "coin spending must verify the welcome grant before subtracting coins");
  requireContains("server/economy/welcome-grant.js", "authUser?.created_at", "welcome-grant eligibility must use the immutable Auth creation date");
  requireContains("server/economy/welcome-grant.js", "onboarding_welcome:${authUser.id}", "welcome grants must use an idempotent per-user reference");
  requireContains("supabase/cipher-coins.sql", "drop index if exists public.referrals_one_new_user_per_referrer_idx", "Cipher Coin referrals should allow multiple successful invitations per referrer");
  requireContains("supabase/cipher-coins.sql", "'referral_referrer'", "referrer reward must be recorded in the coin ledger");
  requireContains("supabase/cipher-coins.sql", "'referral_new_user'", "new-user referral reward must be recorded in the coin ledger");
  if (!coinsSchema.includes("revoke insert, update, delete on public.cipher_coin_transactions from anon, authenticated")) {
    push(errors, "supabase/cipher-coins.sql", "clients must not be able to mutate the Cipher Coin ledger directly");
  }

  const app = read("src/App.jsx");
  requireContains("src/App.jsx", 'n.id==="exam"&&user.tier!=="pro"&&coinWallet.examPasses<1?"coins":n.id', "free users without an Exam pass should be redirected to the Coin Vault");
  requireContains("src/App.jsx", "isFreePBQPreview", "free users should only get the configured PBQ preview");
  requireContains("src/App.jsx", '!coinWallet.unlockedPbqIds.includes(q.id)?setView("coins"):setPbqQ(q)', "PBQ start handler should allow only previews, Pro access, or permanent coin unlocks");
  requireContains("src/App.jsx", 'performCipherCoinAction(user,"check_in")', "signed-in users should receive an idempotent daily check-in attempt");
  requireContains("src/App.jsx", 'onConsumeExamPass={handleConsumeExamPass}', "free Exam Mode access must consume a pass at start");
  requireContains("src/App.jsx", "tier: hasProAccess ? \"pro\" : \"free\"", "the app should use the same trusted Pro profile signals as PBQ RLS");
  requireContains("src/App.jsx", "mergeRemotePBQBanks(PBQ_BANK,remotePbqBank)", "partial remote PBQ results must not replace the complete local PBQ baseline");
  requireContains("src/App.jsx", 'const SELECT_FILL_PBQ_TYPE = "SELECT & FILL"', "fill-blank and legacy matching PBQs should share one visible format");
  requireContains("src/App.jsx", "function PBQSelectionWorkspace", "Select & Fill PBQs should use the reusable tap-to-select workspace");
  requireContains("src/App.jsx", "selectionOptions:question.selectionOptions || []", "the shared PBQ selector options should persist in the Supabase payload");
  requireContains("src/App.jsx", 'distractors.length<2', "Question Manager should require at least two distractors for Select & Fill questions");
  requireContains("src/App.jsx", "Start Free MCQ Practice", "the homepage should lead with the free MCQ practice CTA");
  requireContains("src/App.jsx", "Try a PBQ Preview", "the homepage should offer a secondary PBQ preview CTA");
  requireContains("src/App.jsx", "Create free account to save Smart Review", "guest results should invite learners to preserve their weak-area Smart Review");
  requireContains("src/App.jsx", "GUEST_SMART_REVIEW_BRIDGE_KEY", "guest quiz attempts should survive account creation for Smart Review");
  requireContains("src/App.jsx", 'allowedGuestViews=new Set(["dashboard","mcq","pbq","daily"', "guests should be able to enter the PBQ preview without signing in");
  requireContains("src/App.jsx", "Use 50 coins or unlock all PBQs with Pro", "PBQ interest should present both the coin and Pro paths");
  requireContains("src/App.jsx", "ATHENA_STARTER_QUESTION_SETS", "new-user starter questions should use the concise curated onboarding set");
  requireContains("src/App.jsx", "picked.slice(0,5)", "the fallback new-account baseline should stay limited to five questions");
  requireContains("src/App.jsx", 'correct?"Correct.":"Incorrect."', "MCQ explanations should start with a standard colour-coded verdict");
  requireContains("src/App.jsx", 'setStage("preparing")', "completed onboarding questions should transition through the ID preparation buffer");
  requireContains("src/App.jsx", "Preparing your ID…", "the onboarding buffer should explain that the tailored ID is being prepared");
  requirePattern("src/App.jsx", /user\?\.tier\s*===\s*"pro"\s*&&\s*\["active",\s*"trialing"\]\.includes\(user\?\.subscriptionStatus/, "paid Pro should depend on active/trialing subscription status");
  requireContains("src/App.jsx", 'fetch("/api/stripe/checkout"', "upgrade flow should call the server-side Stripe checkout endpoint");
  if (/wallet\?\.status==="ready"\?Number\(wallet\?\.balance\|\|0\):CIPHER_WELCOME_GRANT/.test(app)) {
    push(errors, "src/App.jsx", "onboarding must not display an unverified 150-coin balance while the persisted wallet is loading");
  }

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
