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

function allowedSecretPlaceholder(value) {
  return /(xxx|example|placeholder|your_|test_key|price_three_month_xxx|price_monthly_xxx|whsec_xxx|phc_xxx)/i.test(String(value || ""));
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
  "api/stripe.js",
  "server/stripe/checkout.js",
  "server/stripe/sync.js",
  "server/stripe/webhook.js",
  "server/stripe/portal.js",
  "server/stripe/cancel.js",
  "server/stripe/_subscription.js",
  "api/economy.js",
  "server/economy/referral-claim.js",
  "server/economy/referral-me.js",
  "server/economy/coins-me.js",
  "server/economy/coins-action.js",
  "server/economy/welcome-grant.js",
  "api/account.js",
  "api/attempts.js",
  "api/feedback.js",
  "api/question-overrides.js",
  "server/account/delete.js",
  "server/account/delete-request.js",
  "server/account/_deletion-email.js",
  "server/attempts/submit.js",
  "server/feedback/submit.js",
  "server/question-overrides/save.js",
  "server/question-overrides/history.js",
  "server/question-overrides/revert.js",
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
    "STRIPE_PRICE_PRO_MONTHLY",
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
  requireContains("api/_utils.js", "function unsafeTextReason", "shared API utilities must detect unsafe text payloads");
  requireContains("api/_utils.js", "function sanitizeJsonPayload", "shared API utilities must recursively sanitize saved JSON payloads");
  requireContains("api/_utils.js", "function requireJsonContentType", "mutating JSON APIs must reject form-data/file-upload payloads");
  requireContains("api/_utils.js", "MAX_JSON_BODY_BYTES", "API raw-body parsing should enforce a configurable request size limit");

  for (const file of [
    "server/stripe/checkout.js",
    "server/stripe/sync.js",
    "server/stripe/portal.js",
    "server/economy/referral-claim.js",
    "server/economy/referral-me.js",
    "server/economy/coins-me.js",
    "server/economy/coins-action.js",
    "server/account/delete.js",
    "server/account/delete-request.js",
    "server/question-overrides/history.js",
    "server/question-overrides/save.js",
    "server/question-overrides/revert.js",
  ]) {
    const routeSource = read(file);
    requireContains(file, "getBearerToken(req)", "authenticated API route must require a bearer token");
    if (!routeSource.includes("supabase.auth.getUser(token)") && !routeSource.includes("requireQuestionAdmin(")) {
      push(errors, file, "authenticated API route must verify the token with Supabase or a shared admin-auth helper");
    }
    requirePattern(file, /if\s*\(\s*req\.method\s*!==|req\.method !== "GET" && req\.method !== "POST"/, "API route should reject unexpected HTTP methods");
    const tokenIndex = routeSource.indexOf("getBearerToken(req)");
    const adminClientIndex = routeSource.indexOf("getSupabaseAdmin()");
    if (tokenIndex >= 0 && adminClientIndex >= 0 && adminClientIndex < tokenIndex) {
      push(errors, file, "authenticated API route should check bearer token before creating privileged service clients");
    }
  }

  const apiFunctionFiles = walkFiles("api").filter(file => file.endsWith(".js"));
  if (apiFunctionFiles.length > 12) {
    push(errors, "api", `Vercel Hobby allows at most 12 Serverless Functions; found ${apiFunctionFiles.length} JS files under api/`);
  }
  requireContains("api/stripe.js", "checkout", "Stripe dispatcher must expose checkout operation");
  requireContains("api/stripe.js", "webhook", "Stripe dispatcher must expose webhook operation");
  requireContains("api/account.js", '"delete-request"', "account dispatcher must expose delete-request operation");
  requireContains("api/account.js", "delete: deleteAccount", "account dispatcher must expose delete operation");
  requireContains("api/attempts.js", "submit: submitAttempt", "attempts dispatcher must expose submit operation");
  requireContains("api/feedback.js", "submit: submitFeedback", "feedback dispatcher must expose submit operation");
  requireContains("api/question-overrides.js", "history", "Question Manager dispatcher must expose history operation");
  requireContains("api/question-overrides.js", "revert", "Question Manager dispatcher must expose revert operation");
  requireContains("api/question-overrides.js", "save", "Question Manager dispatcher must expose save operation");
  requireContains("vercel.json", '"/api/account/delete-request"', "legacy account deletion request URL must rewrite to the account dispatcher");
  requireContains("vercel.json", '"/api/attempts/submit"', "legacy attempts submit URL must rewrite to the attempts dispatcher");
  requireContains("vercel.json", '"/api/feedback/submit"', "legacy feedback submit URL must rewrite to the feedback dispatcher");
  requireContains("vercel.json", '"/api/question-overrides/save"', "legacy Question Manager save URL must rewrite to the Question Manager dispatcher");
  requireContains("server/stripe/checkout.js", 'mode: "payment"', "New Stripe purchases must be non-renewing payment sessions");
  requireContains("server/account/delete-request.js", 'from("account_deletion_requests")', "deletion requests must be stored server-side");
  requireContains("server/account/delete-request.js", 'process.env.RESEND_API_KEY', "deletion emails must use the configured transactional provider");
  requireContains("server/account/delete-request.js", 'supabase.auth.signInWithOtp', "deletion email must retain a safe Supabase fallback until transactional email is configured");
  for (const file of [
    "server/account/_deletion-email.js",
    "server/feedback/submit.js",
    "supabase/email-templates/confirm-signup.html",
    "supabase/email-templates/magic-link.html",
    "supabase/email-templates/password-changed.html",
    "supabase/email-templates/reset-password.html",
  ]) {
    requireContains(file, "https://www.secureplusprep.com/secureplus-logo.png", "email template must use the public SecurePlus logo");
    requireContains(file, 'alt="SecurePlus"', "email logo must keep accessible fallback text");
  }
  requireContains("server/account/delete.js", 'body.deletionToken', "account deletion must require a single-use email token");
  requireContains("server/account/delete.js", 'supabase.auth.admin.signOut(token, "global")', "account deletion must revoke Supabase sessions before deleting the user");
  requireContains("server/question-overrides/save.js", "requireJsonContentType(req)", "Question Manager saves must reject non-JSON/file-upload payloads");
  requireContains("server/question-overrides/save.js", "sanitizeJsonPayload", "Question Manager saves must sanitize nested question JSON before storage");
  requireContains("server/question-overrides/save.js", "normalizeSafeId", "Question Manager saves must validate question IDs before using them in database writes");
  requireContains("server/question-overrides/save.js", 'from("pbqs")', "PBQ saves must go through the validated server route instead of direct browser mutation");
  requireContains("server/feedback/submit.js", "requireJsonContentType(req)", "feedback submissions must reject non-JSON/file-upload payloads");
  requireContains("server/feedback/submit.js", "normalizeSafeText", "feedback submissions must validate unsafe markup before storage/email");
  requireContains("supabase/account-deletion.sql", "alter table public.account_deletion_requests enable row level security", "deletion requests must have RLS enabled");
  requireContains("supabase/account-deletion.sql", "revoke all on table public.account_deletion_requests from anon, authenticated", "browser clients must not access deletion tokens");
  requireContains("supabase/account-deletion.sql", "grant usage on schema public to service_role", "the server role must be able to reach the deletion request table through the Data API");
  requireContains("supabase/account-deletion.sql", "notify pgrst, 'reload schema'", "account deletion setup should refresh the PostgREST schema cache");
  requireContains("server/stripe/checkout.js", "client_reference_id: authUser.id", "Stripe checkout must bind the session to the Supabase user id");
  requireContains("server/stripe/sync.js", "sessionUserId !== authUser.id", "Stripe sync must reject checkout sessions owned by another user");
  requireContains("server/stripe/webhook.js", "stripe.webhooks.constructEvent", "Stripe webhook must verify the webhook signature");
  requireContains("server/stripe/webhook.js", 'requireEnv("STRIPE_WEBHOOK_SECRET")', "Stripe webhook must use STRIPE_WEBHOOK_SECRET");
  requireContains("server/stripe/webhook.js", 'event.type === "customer.subscription.updated"', "Stripe webhook should handle subscription updates");
  requireContains("server/stripe/webhook.js", 'event.type === "customer.subscription.deleted"', "Stripe webhook should handle subscription deletion");

  requireContains("server/stripe/checkout.js", 'passLineItem(planKey)', "checkout must use server-owned pass pricing");
  requireContains("server/stripe/access-pass.js", "payment_status!=='paid'", "only verified paid pass sessions may grant access");
  requireContains("src/lib/accessModel.js", "amount:1199", "Sprint Pass must cost $11.99");
  requireContains("src/lib/accessModel.js", "amount:2499", "Comprehensive Pass must cost $24.99");
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
  requireContains("supabase/schema.sql", "question_type in ('mcq', 'pbq', 'flashcard')", "starred question storage must allow curated flashcards");
  requireContains("supabase/starred-flashcards.sql", "question_type in ('mcq', 'pbq', 'flashcard')", "existing Supabase installs need a flashcard-star migration");
  requireContains("supabase/starred-flashcards.sql", "length(question_id) between 1 and 160", "flashcard-star migration must allow long flashcard IDs");
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
  if (app.includes("dangerouslySetInnerHTML")) {
    push(errors, "src/App.jsx", "public question text must not be rendered with dangerouslySetInnerHTML");
  }
  requireContains("src/App.jsx", "cleanAdminSafeText", "Question Manager must validate unsafe text before saving questions");
  requireContains("src/App.jsx", "cleanAdminQuestionId", "Question Manager must validate question IDs before saving questions");
  requireContains("src/App.jsx", "HTML/script tag", "Question Manager should give a clear unsafe-content error for pasted markup");
  requireContains("src/App.jsx", 'return saveQuestionOverrideRequest({kind:"pbq"', "PBQ saves should use the validated server route");
  requireContains("src/App.jsx", 'role="switch" aria-checked={examMode}', "Exam mode should be integrated into MCQ setup");
  requireContains("src/App.jsx", "isFreePBQPreview", "free users should only get the configured PBQ preview");
  requireContains("src/App.jsx", 'onStart={q=>setPbqQ(q)}', "Registered Free and Pro users must be able to start PBQs");
  requireContains("src/App.jsx", 'CIPHER_COINS_ACTIVE?await performCipherCoinAction(user,"check_in")', "archived economy must not run daily coin check-ins");
  requireContains("src/App.jsx", 'if(type!=="pbq"||busy||isPro)return;', "timed MCQ exams should not require coin purchases");
  requireContains("src/App.jsx", "tier: hasProAccess ? \"pro\" : \"free\"", "the app should use the same trusted Pro profile signals as PBQ RLS");
  requireContains("src/App.jsx", "mergeRemotePBQBanks(PBQ_BANK,remotePbqBank)", "partial remote PBQ results must not replace the complete local PBQ baseline");
  requireContains("src/App.jsx", 'const SELECT_FILL_PBQ_TYPE = "SELECT & FILL"', "fill-blank and legacy matching PBQs should share one visible format");
  requireContains("src/App.jsx", "function PBQSelectionWorkspace", "Select & Fill PBQs should use the reusable tap-to-select workspace");
  requireContains("src/App.jsx", "selectionOptions:question.selectionOptions || []", "the shared PBQ selector options should persist in the Supabase payload");
  requireContains("src/App.jsx", 'distractors.length<2', "Question Manager should require at least two distractors for Select & Fill questions");
  requireContains("src/components/GuestLanding.jsx", "10 Q diagnostic", "the homepage should lead with the 10-question diagnostic CTA");
  requireContains("src/components/GuestLanding.jsx", "Why we’re different", "the homepage should offer the Why we’re different page as its secondary CTA");
  requireContains("src/components/GuestDiagnostic.jsx", "Build my free study plan", "diagnostic results should lead to signup and saved Smart Review progress");
  requireContains("src/App.jsx", "GUEST_SMART_REVIEW_BRIDGE_KEY", "guest quiz attempts should survive account creation for Smart Review");
  requireContains("src/App.jsx", 'allowedGuestViews=new Set(["dashboard","mcq","pbq","daily"', "guests should be able to enter the PBQ preview without signing in");
  requirePattern("src/App.jsx", /const guestTopNavItems=\[\s*\{id:"mcq",label:"10Q Diagnostic"\},\s*\{id:"pbq",label:"PBQ Simulations"\},\s*\{id:"flashcards",label:"Flashcards"\},\s*\];/, "guest top navigation should keep only the three primary practice destinations visible");
  requirePattern("src/App.jsx", /const guestMoreItems=\[\s*\{id:"objectives",label:"Security\+ Objectives"\},\s*\{id:"about",label:"Why we’re different"\},\s*\{id:"deep-dives",label:"Concept Deep Dives"\},\s*\{id:"privacy",label:"Privacy Policy"\},\s*\{id:"terms",label:"Terms & Conditions"\},\s*\];/, "guest More menu should contain Why we’re different, the exam guide, deep dives, privacy, and terms links");
  requireContains("src/App.jsx", "guest-top-nav-more-menu", "guest secondary navigation should open in an expandable More menu");
  requireContains("src/App.jsx", "clearLocalAuthState({preserveRoute:true})", "guest session restoration must preserve direct routes such as the canonical Flashcards page");
  requireContains("src/App.jsx", "const quizSizes = isGuest?[10]:choices.sizes.map(option=>option.size)", "MCQ practice should use tier-aware fixed question counts");
  requireContains("src/App.jsx", 'const activeDiffFilter=!isPro?"all":diffFilter', "guest MCQ practice must not filter by difficulty");
  requireContains("src/App.jsx", 'const activeTopicFilter=!isPro?"all":topicFilter', "guest MCQ practice must not filter by topic");
  requireContains("src/App.jsx", '<FilterSelect disabled={!isPro} value={chFilter} onChange={setChFilter} options={chapterOptions} label="Chapter filter"/>', "only Pro should allow chapter filtering");
  const mcqSource=read("src/App.jsx").split("function MCQPractice(")[1].split("function UpgradeModal(")[0];
  const mcqSetup=mcqSource.split("  if(!started) return(")[1].split("  if(done) return <McqSetResults")[0];
  const disclosure=read("src/App.jsx").split("function PracticeSetupDisclosure(")[1].split("function MCQPractice(")[0];
  if(!mcqSource.includes('const [reviewMode,setReviewMode]=useState("smart")')) push(errors,"src/App.jsx","MCQ setup must default to Smart Review");
  if(!mcqSource.includes('mode:isGuest?"diagnostic":mode')) push(errors,"src/App.jsx","guests must use only the bounded diagnostic");
  if(!mcqSetup.includes('role="tooltip"')||!mcqSetup.includes('event.key==="Escape"')||!mcqSetup.includes('onMouseEnter=')||!mcqSetup.includes('onFocus=')) push(errors,"src/App.jsx","mode descriptions must support hover, focus, click and Escape dismissal");
  if(!mcqSetup.includes("Recommended")||!mcqSource.includes('label:"Randomised"')) push(errors,"src/App.jsx","MCQ modes must retain recommended Smart Review and Randomised");
  if(!disclosure.includes('<details className="practice-secondary mcq-customise">')||disclosure.includes("if(isGuest)")) push(errors,"src/App.jsx","customization must default to collapsed for every user");
  if(/Unseen questions|questions available|matching questions|mcq-launch-steps|practice-meta-pill|Browse all five exam chapters|guest-mcq-showcase/.test(mcqSetup)) push(errors,"src/App.jsx","the MCQ hub must omit retired counters, introductory panels and chapter navigation");
  for(const label of ["Retests due","Concepts to review","Questions","Start my set","No pending sets!","You’re on a roll!","Build your review list now!","Let’s review your list!"]){
    if(!mcqSetup.includes(label)) push(errors,"src/App.jsx",`MCQ hub is missing ${label}`);
  }
  if(mcqSetup.indexOf('aria-label="Question selection mode"')>mcqSetup.indexOf('aria-label="Start MCQ practice"')||mcqSetup.indexOf('aria-label="MCQ review queues"')>mcqSetup.indexOf("<PracticeSetupDisclosure>")) push(errors,"src/App.jsx","MCQ mode, hub, review queues and customization must follow the requested order");
  requireContains("src/App.jsx", "Unlock all PBQs with Pro", "PBQ interest should present the active Pro path");
  requireContains("src/App.jsx", "ATHENA_STARTER_QUESTION_SETS", "new-user starter questions should use the concise curated onboarding set");
  requireContains("src/App.jsx", "picked.slice(0,5)", "the fallback new-account baseline should stay limited to five questions");
  requireContains("src/App.jsx", 'correct?"Correct.":"Incorrect."', "MCQ explanations should start with a standard colour-coded verdict");
  requireContains("src/App.jsx", 'setStage("preparing")', "completed onboarding questions should transition through the ID preparation buffer");
  requireContains("src/App.jsx", "Preparing your ID…", "the onboarding buffer should explain that the tailored ID is being prepared");
  requireContains("src/App.jsx", "Hello, I’m Cipher!", "onboarding intro should introduce Cipher instead of Athena");
  requireContains("src/App.jsx", "Cipher’s starter set", "onboarding starter set should be branded as Cipher");
  requireContains("src/App.jsx", ".athena-cipher-intro .cipher-mascot", "onboarding Cipher mascot should have protected sizing to avoid intro-card distortion");
  requireContains("src/App.jsx", ".nav-lnk:hover .nav-glyph-achievements,.nav-glyph-achievements.active{color:#b45309", "Achievements navigation icon should light up amber/orange only on hover or active state");
  requireContains("src/App.jsx", ".nav-lnk:hover .nav-glyph-deep-dives,.nav-glyph-deep-dives.active{color:#1d4ed8", "Concept Deep Dives navigation icon should light up blue only on hover or active state");
  requireContains("src/App.jsx", "stroke:currentColor!important", "SVG navigation icons should inherit the coloured glyph stroke");
  if (app.includes(".nav-glyph-achievements{color:") || app.includes(".nav-glyph-deep-dives{color:")) {
    push(errors, "src/App.jsx", "Achievements and Concept Deep Dives icons should not have permanent default colours");
  }
  if (app.includes("Mint Academy ID")) {
    push(errors, "src/App.jsx", "auth UI should not show the old Mint Academy ID wording");
  }
  requireContains("src/App.jsx", "showLoginModal&&createPortal((", "the login dialog must render at document level so it stays centred in the viewport");
  requireContains("src/App.jsx", "document.body.style.overflow=\"hidden\"", "the centred login dialog should prevent the landing page from scrolling behind it");
  requirePattern("src/App.jsx", /user\?\.tier\s*===\s*"pro"\s*&&\s*\["active",\s*"trialing"\]\.includes\(user\?\.subscriptionStatus/, "paid Pro should depend on active/trialing subscription status");
  requireContains("src/App.jsx", 'fetch("/api/stripe/checkout"', "upgrade flow should call the server-side Stripe checkout endpoint");
  requireContains("src/App.jsx", 'PRO_MONTHLY_PASS_PRICE = "$11.99 / 30 days"', "pricing should offer the $11.99 Sprint Pass");
  requireContains("src/App.jsx", 'PRO_THREE_MONTH_PLAN_NAME = "3-Month Plus"', "pricing should name the recommended three-month option clearly");
  requireContains("src/App.jsx", "return <UpgradePage", "pricing must render the upgrade page");
  requireContains("src/components/UpgradePage.jsx", "One payment. No automatic renewal.", "pricing must explain non-renewal");
  requireContains("src/components/UpgradePage.jsx", 'recommended&&<span className="up-value">Recommended</span>', "pricing should visually recommend the three-month plan");
  requireContains("src/App.jsx", "plan:selectedPlan", "upgrade requests should send the selected plan without accepting a client price ID");
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
    const secretPatterns = [
      ["Stripe secret key", /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/g],
      ["Stripe restricted key", /\brk_(?:live|test)_[A-Za-z0-9]{20,}\b/g],
      ["Stripe webhook secret", /\bwhsec_[A-Za-z0-9]{20,}\b/g],
      ["Supabase JWT-like key", /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g],
      ["Resend API key", /\bre_[A-Za-z0-9_]{16,}\b/g],
      ["PostHog project token", /\bphc_[A-Za-z0-9]{16,}\b/g],
      ["Google API key", /\bAIza[0-9A-Za-z_-]{20,}\b/g],
      ["private key block", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
    ];
    for (const [label, pattern] of secretPatterns) {
      for (const match of text.matchAll(pattern)) {
        if (!allowedSecretPlaceholder(match[0])) push(errors, file, `looks like a real ${label} is committed`);
      }
    }
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
