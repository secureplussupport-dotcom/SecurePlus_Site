import { useState, useEffect, useCallback, useRef } from "react";
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
};

const normalizeEmail = email => (email || "").trim().toLowerCase();

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

async function getSupabaseProfile(authUser) {
  if (!supabase || !authUser) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,email,tier,subscription_status")
    .eq("id", authUser.id)
    .maybeSingle();

  return {
    id: authUser.id,
    email: data?.email || authUser.email,
    name: profileName(authUser),
    tier: data?.tier === "pro" && ["active", "trialing"].includes(data?.subscription_status) ? "pro" : "free",
    subscriptionStatus: data?.subscription_status || null,
    authProvider: "supabase",
  };
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

// ═══════════════════════════════════════════════════════════════
// CSS — Clean light/dark design
// ═══════════════════════════════════════════════════════════════
const makeCSS = (t) => `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{background:${t.bg};}
body{background:
radial-gradient(circle at top left, ${t.accent}18, transparent 34rem),
linear-gradient(180deg, ${t.bg}, ${t.bg});color:${t.text};font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;font-size:15px;line-height:1.6;transition:background .3s,color .3s;}
button,input,select{font:inherit;}
button:focus-visible,input:focus-visible,select:focus-visible,.nav-lnk:focus-visible,.opt:focus-visible{outline:3px solid ${t.accent}38;outline-offset:2px;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:${t.bg};}
::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px;}
.card{background:${t.surface};border:1px solid ${t.border};border-radius:8px;box-shadow:0 14px 36px rgba(7,12,24,.10);}
.card-hover{transition:border-color .2s,box-shadow .2s,transform .2s;}
.card-hover:hover{border-color:${t.accent};box-shadow:0 16px 36px ${t.accent}16;transform:translateY(-1px);}
.label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:${t.textDim};}
.mono{font-family:'JetBrains Mono',monospace;}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:38px;padding:9px 16px;border-radius:8px;border:none;font-size:14px;font-weight:700;cursor:pointer;transition:all .18s;font-family:'Inter',sans-serif;white-space:nowrap;}
.btn-primary{background:${t.accent};color:#fff;}
.btn-primary:hover{background:${t.accentHover};box-shadow:0 10px 22px ${t.accent}35;}
.btn-primary:disabled{opacity:.45;cursor:not-allowed;box-shadow:none;}
.btn-outline{background:transparent;color:${t.accent};border:1.5px solid ${t.accent};}
.btn-outline:hover{background:${t.accent}12;}
.btn-ghost{background:transparent;color:${t.textSec};border:1px solid ${t.border};}
.btn-ghost:hover{color:${t.text};background:${t.panel};}
.btn-danger{background:transparent;color:${t.red};border:1px solid ${t.red}44;}
.btn-danger:hover{background:${t.red}12;}
.btn:active{transform:scale(.97);}
.input{width:100%;background:${t.inputBg};border:1.5px solid ${t.border};border-radius:8px;padding:11px 14px;font-size:14px;color:${t.text};font-family:'Inter',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;}
.input:focus{border-color:${t.accent};box-shadow:0 0 0 3px ${t.accent}20;}
.input::placeholder{color:${t.textDim};}
.tab{padding:9px 18px;cursor:pointer;border-bottom:2px solid transparent;font-size:13px;font-weight:500;color:${t.textSec};transition:all .15s;white-space:nowrap;}
.tab:hover{color:${t.text};}
.tab.act{color:${t.accent};border-bottom-color:${t.accent};}
.nav-lnk{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:13px;font-weight:700;color:${t.textSec};cursor:pointer;transition:all .15s;}
.nav-lnk:hover{color:${t.text};background:${t.panel};}
.nav-lnk.act{color:${t.text};background:${t.accent}18;border:1px solid ${t.accent}28;}
.prog-track{background:${t.border};border-radius:99px;overflow:hidden;}
.prog-fill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(.16,1,.3,1);}
.opt{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border-radius:8px;border:1.5px solid ${t.border};cursor:pointer;transition:all .18s;background:${t.surface};min-width:0;}
.opt:hover:not(.done){border-color:${t.accent};background:${t.accent}08;}
.opt.sel{border-color:${t.accent};background:${t.accent}10;}
.opt.ok{border-color:${t.green}!important;background:${t.green}0d!important;}
.opt.bad{border-color:${t.red}!important;background:${t.red}0d!important;}
.opt.done{cursor:default;}
.opt-ltr{width:30px;height:30px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;border:1.5px solid ${t.border};color:${t.textDim};transition:all .18s;}
.opt:hover:not(.done) .opt-ltr,.opt.sel .opt-ltr{border-color:${t.accent};color:${t.accent};}
.opt.ok .opt-ltr{border-color:${t.green};color:${t.green};}
.opt.bad .opt-ltr{border-color:${t.red};color:${t.red};}
.terminal{background:#0d1117;border:1px solid #30363d;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#c9d1d9;padding:16px;overflow-y:auto;max-height:280px;line-height:1.7;}
.log-block{font-family:'JetBrains Mono',monospace;font-size:12.5px;background:${t.inputBg};border:1px solid ${t.border};border-radius:8px;padding:16px;color:${t.textSec};line-height:1.9;white-space:pre-wrap;overflow-x:auto;}
.drag-item{padding:10px 14px;background:${t.surface};border:1.5px solid ${t.border};border-radius:7px;cursor:grab;user-select:none;transition:all .2s;font-size:13px;color:${t.text};}
.drag-item:hover{border-color:${t.accent};}
.drop-zone{min-height:44px;border:2px dashed ${t.border};border-radius:7px;padding:8px;transition:all .2s;display:flex;align-items:center;justify-content:center;}
.drop-zone.over{border-color:${t.accent};background:${t.accent}08;}
.order-item{padding:10px 14px;background:${t.surface};border:1.5px solid ${t.border};border-radius:7px;display:flex;align-items:center;gap:10px;font-size:13px;cursor:default;transition:border-color .2s;color:${t.text};}
.order-item:hover{border-color:${t.accent}44;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{from{opacity:.6}to{opacity:1}}
.fu{animation:fadeUp .35s cubic-bezier(.16,1,.3,1) both;}
.chip{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;border:1px solid;line-height:1.4;}
.app-shell{display:flex;min-height:100vh;background:transparent;}
.sidebar{width:226px;min-height:100vh;background:${t.panel};border-right:1px solid ${t.border};display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh;}
.app-main{flex:1;overflow-y:auto;min-width:0;}
.mobile-topbar{display:none;}
.auth-layout{width:100%;max-width:980px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:24px;align-items:stretch;}
@media (max-width: 860px){
  body{font-size:14px;}
  .app-shell{display:block;padding-bottom:72px;}
  .sidebar{position:fixed;left:0;right:0;bottom:0;top:auto;width:100%;height:64px;min-height:64px;border-right:0;border-top:1px solid ${t.border};z-index:20;}
  .sidebar > div{display:none!important;}
  .sidebar nav{flex-direction:row!important;overflow-x:auto;padding:8px!important;gap:6px!important;}
  .nav-lnk{min-width:58px;flex-direction:column;gap:2px;padding:7px 9px;font-size:10px;text-align:center;}
  .nav-lnk span:first-child{font-size:15px!important;}
  .mobile-topbar{display:flex;position:sticky;top:0;z-index:15;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:${t.panel}f2;backdrop-filter:blur(14px);border-bottom:1px solid ${t.border};}
  main > div{padding-left:16px!important;padding-right:16px!important;}
  [style*="grid-template-columns:1fr 1fr"],[style*="gridTemplateColumns:1fr 1fr"]{grid-template-columns:1fr!important;}
  [style*="grid-template-columns:repeat(4,1fr)"],[style*="gridTemplateColumns:repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
  [style*="grid-template-columns:1fr 1fr 1fr"],[style*="gridTemplateColumns:1fr 1fr 1fr"]{grid-template-columns:1fr!important;}
  .card{box-shadow:0 10px 26px rgba(7,12,24,.08);}
  .btn{width:auto;white-space:normal;}
  .auth-layout{grid-template-columns:1fr!important;}
  .auth-layout > section:first-child h1{font-size:30px!important;}
  .auth-layout > section:first-child{padding:24px!important;}
}
`;

// ═══════════════════════════════════════════════════════════════
// MICRO COMPONENTS
// ═══════════════════════════════════════════════════════════════
function ProgBar({v,c,h=8}) {
  return <div className="prog-track" style={{height:h}}><div className="prog-fill" style={{width:`${Math.min(v,100)}%`,background:c,height:h}}/></div>;
}
function SimBadge({type,t}) {
  const s=Object.values(SIM_TYPES).find(x=>x.id===type)||SIM_TYPES.TERMINAL;
  return <span className="chip" style={{background:`${s.color}15`,color:s.color,borderColor:`${s.color}30`}}>{s.emoji} {s.label}</span>;
}
function DiffBadge({d,t}) {
  const map={easy:{c:"#10b981",label:"Easy"},medium:{c:"#f59e0b",label:"Medium"},hard:{c:"#ef4444",label:"Hard"}};
  const {c,label}=map[d]||map.easy;
  return <span className="chip" style={{background:`${c}15`,color:c,borderColor:`${c}30`}}>{label}</span>;
}
function ChBadge({chId,t}) {
  const ch=CHAPTERS.find(c=>c.id===chId);
  if(!ch) return null;
  return <span className="chip" style={{background:`${t.accent}12`,color:t.accent,borderColor:`${t.accent}25`,fontSize:11}}>{ch.emoji} Ch.{ch.id}</span>;
}
function Alert({msg,type="error",t}) {
  if(!msg) return null;
  const c=type==="success"?t.green:type==="warn"?t.amber:t.red;
  return <div style={{padding:"10px 14px",borderRadius:8,background:`${c}12`,border:`1px solid ${c}30`,color:c,fontSize:13,marginBottom:12}}>{msg}</div>;
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
    setResults(r=>[...r,{qid:current.id,correct,selected}]);
    setSubmitted(true);
  };
  const nextQ = () => {
    if(qIndex<questions.length-1){ setQIndex(i=>i+1); setSelected(null); setSubmitted(false); setShowWrong(false); }
    else setStep("done");
  };

  const correctCount = results.filter(r=>r.correct).length;

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
      <button className="btn btn-primary" style={{padding:"12px 32px",fontSize:15,width:"100%"}} onClick={()=>setStep("quiz")}>
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
        {["100 MCQs across all 5 exam domains","50 PBQ simulations with 8 question types","Progress tracking and weak area analysis","Chapter-by-chapter study organisation"].map((f,i)=>(
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
            <p style={{fontSize:13,color:t.textSec,lineHeight:1.7}}>{current.exp}</p>
            {selected!==current.correct&&current.wrongFeedback&&(
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
  const handle=async()=>{
    resetMessages();setLoading(true);
    try{
      const email=normalizeEmail(form.email);
      if(!email){setErr("Please enter your email.");setLoading(false);return;}

      if(isSupabaseConfigured){
        if(mode==="reset"){
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
          if(error) throw error;
          setOk("Password reset email sent. Check your inbox.");
          setLoading(false);
          return;
        }

        if(mode==="login"){
          const { data, error } = await supabase.auth.signInWithPassword({ email, password: form.pass });
          if(error) throw error;
          const appUser=await getSupabaseProfile(data.user);
          onLogin(appUser);
        } else {
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
            onLogin(appUser);
          } else {
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
          onLogin(user);
        } else {
          if(!form.name||!form.pass){setErr("Please fill in all fields.");setLoading(false);return;}
          if(form.pass!==form.confirm){setErr("Passwords do not match.");setLoading(false);return;}
          const passwordIssue=getPasswordIssue(form.pass);
          if(passwordIssue){setErr(passwordIssue);setLoading(false);return;}
          const exists=await DB.getUser(email);
          if(exists){setErr("An account with this email already exists.");setLoading(false);return;}
          const user={name:form.name,email,password:form.pass,tier:"free",joined:new Date().toISOString(),streak:0};
          await DB.saveUser(user);
          await DB.saveSession({email:user.email,name:user.name,tier:user.tier,loggedIn:true});
          setOk("Account created! Welcome to SecurePlus.");
          setTimeout(()=>onLogin(user),800);
        }
      }
    } catch(e){setErr(e.message||"Something went wrong. Please try again.");}
    setLoading(false);
  };
  const handleGoogle=async()=>{
    resetMessages();setLoading(true);
    try{
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
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:"24px",background:"transparent"}}>
      <div className="auth-layout fu">
        <section className="card" style={{padding:"34px 34px",display:"flex",flexDirection:"column",justifyContent:"space-between",overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",inset:"auto -80px -120px auto",width:260,height:260,borderRadius:"50%",background:`${t.accent}16`}} />
          <div style={{position:"relative"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,padding:"7px 11px",border:`1px solid ${t.border}`,borderRadius:8,background:t.panel,marginBottom:24}}>
              <span>🔐</span>
              <span style={{fontWeight:800,color:t.text}}>SecurePlus</span>
            </div>
            <h1 style={{fontSize:40,lineHeight:1.05,fontWeight:800,color:t.text,marginBottom:14,letterSpacing:0}}>
              Security+ practice that feels like the exam room.
            </h1>
            <p style={{color:t.textSec,fontSize:16,lineHeight:1.7,maxWidth:520}}>
              CompTIA Security+ drills, PBQ simulations, daily challenges, and progress signals in one focused workspace.
            </p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:34,position:"relative"}}>
            {[
              {v:MCQ_BANK.length,l:"MCQs"},
              {v:PBQ_BANK.length,l:"PBQs"},
              {v:"5",l:"Domains"},
            ].map(s=>(
              <div key={s.l} style={{padding:"14px 14px",border:`1px solid ${t.border}`,borderRadius:8,background:t.panel}}>
                <div style={{fontSize:24,fontWeight:800,color:t.text}}>{s.v}</div>
                <div className="label">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Daily challenge link */}
        <section>
        <div className="card" style={{padding:"14px 18px",marginBottom:16,cursor:"pointer",borderColor:`${t.accent}40`}} onClick={onDaily}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:24}}>🎯</span>
            <div>
              <div style={{fontWeight:600,fontSize:14,color:t.text}}>Try Today's Free Daily Challenge</div>
              <div style={{fontSize:12,color:t.textSec}}>No account required — 5 questions daily</div>
            </div>
            <span style={{marginLeft:"auto",color:t.accent,fontSize:18}}>→</span>
          </div>
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
                if(!u){u={name:"Demo User",email:"demo@secureplus.io",password:"demo123",tier:"pro",joined:new Date().toISOString(),streak:14};await DB.saveUser(u);}
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
            Terms of Service
          </button>
        </div>
        </section>
      </div>
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
          Welcome back, {user.name.split(" ")[0]} 👋
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
                      <span style={{fontSize:12,color:t.textSec}}>{ch.emoji} {ch.title.split(",")[0]}</span>
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
              <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:4}}>Unlock PBQ Simulations</div>
              <div style={{fontSize:13,color:t.textSec,marginBottom:12}}>{PBQ_BANK.length} performance-based questions with terminal, drag & drop, log analysis and more.</div>
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
function MCQPractice({user,onSave,t}) {
  const [chFilter,setChFilter]=useState("all");
  const [diffFilter,setDiffFilter]=useState("all");
  const [topicFilter,setTopicFilter]=useState("all");
  const [started,setStarted]=useState(false);
  const [questions,setQuestions]=useState([]);
  const [qi,setQi]=useState(0);
  const [selected,setSelected]=useState(null);
  const [submitted,setSubmitted]=useState(false);
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

  const startQuiz=()=>{
    const pool=[...filtered].sort(()=>Math.random()-.5).slice(0,Math.min(10,filtered.length));
    setQuestions(pool);setQi(0);setSelected(null);setSubmitted(false);setResults([]);setDone(false);setStarted(true);
  };

  const current=questions[qi];

  const submitQ=()=>{
    if(selected===null)return;
    const correct=selected===current.correct;
    const r={qid:current.id,correct,selected,title:current.q.slice(0,60),ch:current.ch,domain:CHAPTERS.find(c=>c.id===current.ch)?.title||"",mcq:true};
    setResults(rs=>[...rs,r]);
    onSave(r);
    setSubmitted(true);setShowWrong(false);
  };
  const nextQ=()=>{
    if(qi<questions.length-1){setQi(i=>i+1);setSelected(null);setSubmitted(false);setShowWrong(false);}
    else setDone(true);
  };

  const correctCount=results.filter(r=>r.correct).length;

  if(!started) return(
    <div style={{padding:"24px",maxWidth:800,margin:"0 auto"}}>
      <h2 style={{fontSize:22,fontWeight:700,color:t.text,marginBottom:4}}>MCQ Practice</h2>
      <p style={{color:t.textSec,marginBottom:20,fontSize:14}}>{MCQ_BANK.length} questions across all 5 CompTIA Security+ chapters</p>

      <div className="card" style={{padding:"20px 24px",marginBottom:16}}>
        <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:14}}>Filter Questions</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div>
            <label className="label" style={{display:"block",marginBottom:6}}>Chapter</label>
            <select className="input" value={chFilter} onChange={e=>setChFilter(e.target.value)}>
              <option value="all">All Chapters ({MCQ_BANK.length})</option>
              {CHAPTERS.map(ch=>(
                <option key={ch.id} value={ch.id}>{ch.emoji} Ch.{ch.id}: {ch.title.slice(0,25)}... ({MCQ_BANK.filter(q=>q.ch===ch.id).length})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" style={{display:"block",marginBottom:6}}>Difficulty</label>
            <select className="input" value={diffFilter} onChange={e=>setDiffFilter(e.target.value)}>
              <option value="all">All Difficulties</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
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
        <div style={{marginTop:16,padding:"12px 14px",background:t.panel,borderRadius:7,fontSize:13,color:t.textSec}}>
          {filtered.length} questions match your filters · Up to 10 will be selected
        </div>
      </div>

      {/* Chapter overview */}
      <div className="card" style={{padding:"20px 24px",marginBottom:20}}>
        <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:14}}>Chapter Overview</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {CHAPTERS.map(ch=>(
            <div key={ch.id} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 14px",borderRadius:8,background:chFilter===ch.id?`${t.accent}10`:t.panel,cursor:"pointer",border:`1px solid ${chFilter===ch.id?t.accent:t.border}`,transition:"all .15s"}} onClick={()=>setChFilter(ch.id===chFilter?"all":ch.id)}>
              <span style={{fontSize:22}}>{ch.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:t.text}}>Ch.{ch.id}: {ch.title}</div>
                <div style={{fontSize:11,color:t.textDim}}>{ch.weight}% of exam · {MCQ_BANK.filter(q=>q.ch===ch.id).length} questions available</div>
              </div>
              <span className="chip" style={{background:`${t.accent}12`,color:t.accent,borderColor:`${t.accent}25`,fontSize:11}}>{ch.weight}%</span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"13px",fontSize:15}} onClick={startQuiz} disabled={filtered.length===0}>
        Start Quiz ({Math.min(10,filtered.length)} Questions) →
      </button>
    </div>
  );

  if(done) return(
    <div style={{padding:"24px",maxWidth:600,margin:"0 auto",textAlign:"center"}} className="fu">
      <div style={{fontSize:48,marginBottom:12}}>{correctCount>=8?"🏆":correctCount>=5?"✅":"📚"}</div>
      <h2 style={{fontSize:24,fontWeight:700,color:t.text,marginBottom:8}}>Quiz Complete!</h2>
      <div style={{fontSize:42,fontWeight:700,color:correctCount>=8?t.green:correctCount>=5?t.amber:t.red,marginBottom:16}}>
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
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <button className="btn btn-primary" onClick={()=>{setStarted(false);setDone(false);}}>New Quiz →</button>
        <button className="btn btn-ghost" onClick={startQuiz}>Retry Same →</button>
      </div>
    </div>
  );

  return(
    <div style={{padding:"24px",maxWidth:700,margin:"0 auto"}} className="fu" key={qi}>
      {/* Progress */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{display:"flex",gap:5}}>
          {questions.map((_,i)=>(
            <div key={i} style={{width:9,height:9,borderRadius:"50%",background:i<qi?(results[i]?.correct?t.green:t.red):i===qi?t.accent:t.border,transition:"background .3s"}}/>
          ))}
        </div>
        <span style={{fontSize:13,color:t.textSec,marginLeft:"auto"}}>Question {qi+1} of {questions.length}</span>
      </div>

      {/* Question card */}
      <div className="card" style={{padding:"22px 26px",marginBottom:18}}>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <ChBadge chId={current.ch} t={t}/>
          <DiffBadge d={current.difficulty} t={t}/>
          <span className="chip" style={{background:`${t.accent}10`,color:t.textSec,borderColor:t.border,fontSize:11}}>{current.topic}</span>
        </div>
        <p style={{fontSize:16,lineHeight:1.75,color:t.text,fontWeight:400}}>{current.q}</p>
      </div>

      {/* Options */}
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
        {current.opts.map((opt,i)=>{
          let cls="opt";
          if(submitted){cls+=" done"; if(i===current.correct)cls+=" ok"; else if(i===selected&&i!==current.correct)cls+=" bad";}
          else if(selected===i)cls+=" sel";
          return(
            <div key={i} className={cls} onClick={()=>!submitted&&setSelected(i)}>
              <div className="opt-ltr">{String.fromCharCode(65+i)}</div>
              <span style={{fontSize:14,flex:1,lineHeight:1.55,color:t.text}}>{opt}</span>
              {submitted&&i===current.correct&&<span style={{color:t.green,fontSize:16,flexShrink:0}}>✓</span>}
              {submitted&&i===selected&&i!==current.correct&&<span style={{color:t.red,fontSize:16,flexShrink:0}}>✗</span>}
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
          <div className="card" style={{padding:"18px 22px",marginBottom:14,borderColor:selected===current.correct?t.green:t.red}}>
            <div style={{fontWeight:700,color:selected===current.correct?t.green:t.red,marginBottom:10,fontSize:16}}>
              {selected===current.correct?"✓ Correct!":"✗ Incorrect"}
            </div>
            <p style={{fontSize:13,color:t.textSec,lineHeight:1.75}}>{current.exp}</p>
            {selected!==current.correct&&current.wrongFeedback&&current.wrongFeedback[selected]&&(
              <div style={{marginTop:12,padding:"12px 14px",background:`${t.red}08`,borderRadius:7,border:`1px solid ${t.red}25`}}>
                <div style={{fontSize:12,fontWeight:600,color:t.red,marginBottom:4}}>Why option {String.fromCharCode(65+selected)} is wrong:</div>
                <div style={{fontSize:13,color:t.textSec,lineHeight:1.6}}>{current.wrongFeedback[selected]}</div>
              </div>
            )}
          </div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center"}} onClick={nextQ}>
            {qi<questions.length-1?"Next Question →":"See Results →"}
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
  const isPro=user.tier==="pro";
  const attempted=new Set(attempts.map(a=>a.qid));
  const correct=new Set(attempts.filter(a=>a.correct).map(a=>a.qid));

  const filtered=PBQ_BANK.filter(q=>{
    if(chFilter!=="all"&&q.ch!==chFilter)return false;
    if(typeFilter!=="all"&&q.type!==typeFilter)return false;
    return true;
  });

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
              <div style={{fontSize:13,color:t.textSec}}>Upgrade to access all PBQ simulations with terminal commands, drag & drop, log analysis, and more.</div>
            </div>
            <button className="btn btn-primary" style={{flexShrink:0}} onClick={onUpgrade}>Upgrade — $4.99/year →</button>
          </div>
        </div>
      )}

      {/* Sim type cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:20}}>
        {Object.values(SIM_TYPES).map(s=>{
          const count=PBQ_BANK.filter(q=>q.type===s.id).length;
          const active=typeFilter===s.id;
          return(
            <div key={s.id} className="card" style={{padding:"14px 16px",cursor:"pointer",borderColor:active?s.color:t.border,background:active?`${s.color}10`:t.surface,transition:"all .15s"}} onClick={()=>setTypeFilter(active?"all":s.id)}>
              <div style={{fontSize:24,marginBottom:6}}>{s.emoji}</div>
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
            {ch.emoji} Ch.{ch.id}
          </button>
        ))}
        {chFilter!=="all"&&<button className="btn btn-ghost" style={{fontSize:11,padding:"5px 10px"}} onClick={()=>setChFilter("all")}>Clear ✕</button>}
      </div>

      <div style={{fontSize:13,color:t.textDim,marginBottom:12}}>Showing {filtered.length} questions</div>

      {/* Question list */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(q=>{
          const done=attempted.has(q.id);
          const ok=correct.has(q.id);
          const ch=CHAPTERS.find(c=>c.id===q.ch);
          return(
            <div key={q.id} className={`card card-hover`} style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,cursor:isPro?"pointer":"default",opacity:isPro?1:.75}} onClick={()=>isPro&&onStart(q)}>
              <span style={{fontSize:22,flexShrink:0}}>{q.emoji||"📌"}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                  <SimBadge type={q.type} t={t}/>
                  <DiffBadge d={q.difficulty} t={t}/>
                  {ch&&<span style={{fontSize:11,color:t.textDim}}>{ch.emoji} Ch.{ch.id}</span>}
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
function PBQSim({q,onDone,t}) {
  const [termInput,setTermInput]=useState("");
  const [termHistory,setTermHistory]=useState([]);
  const [selected,setSelected]=useState(null);
  const [submitted,setSubmitted]=useState(false);
  const [mapping,setMapping]=useState({});
  const [orderItems,setOrderItems]=useState(()=>q.items?[...q.items].sort(()=>Math.random()-.5):[]);
  const [blanks,setBlanks]=useState(()=>q.blanks?Object.fromEntries(q.blanks.map(b=>[b.id,""])):{}); 
  const [dragOver,setDragOver]=useState(null);
  const [dragged,setDragged]=useState(null);
  const [showHint,setShowHint]=useState(false);

  const isCorrect=()=>{
    if(["TERMINAL SIM","HOTSPOT","LOG ANALYSIS","CONFIG/ACL","SCENARIO"].includes(q.type))return selected===q.correct;
    if(q.type==="DRAG & DROP")return q.items?.every(item=>mapping[item.id]===q.correctMapping?.[item.id]);
    if(q.type==="ORDERING")return q.correctOrder?.every((id,i)=>orderItems[i]?.id===id);
    if(q.type==="FILL BLANK")return q.blanks?.every(b=>blanks[b.id]?.trim().toLowerCase()===b.answer.toLowerCase());
    return false;
  };

  const submit=()=>setSubmitted(true);

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

  return(
    <div style={{padding:"24px",maxWidth:860,margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <button className="btn btn-ghost" style={{fontSize:12}} onClick={()=>onDone(null)}>← Back to PBQ Bank</button>
        <span style={{fontSize:20}}>{q.emoji||simType.emoji}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:600,fontSize:15,color:t.text}}>{q.title}</div>
          <div style={{display:"flex",gap:8,marginTop:4}}><SimBadge type={q.type} t={t}/><DiffBadge d={q.difficulty} t={t}/></div>
        </div>
      </div>

      {/* Scenario */}
      <div className="card" style={{padding:"18px 22px",marginBottom:18,borderLeft:`3px solid ${simType.color}`}}>
        <div className="label" style={{marginBottom:8}}>Scenario</div>
        <p style={{fontSize:14,color:t.textSec,lineHeight:1.75}}>{q.scenario}</p>
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
          <div className="card" style={{padding:"16px 20px",fontSize:13,color:t.textSec,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{q.scenario}</div>
        </div>
      )}

      {/* DRAG & DROP */}
      {q.type==="DRAG & DROP"&&!submitted&&(
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:500,fontSize:13,color:t.text,marginBottom:12}}>Drag each item to its matching target</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <div className="label" style={{marginBottom:8}}>Items</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {q.items.filter(item=>!Object.keys(mapping).includes(item.id)).map(item=>(
                  <div key={item.id} className={`drag-item ${dragged?.id===item.id?"":""}`} draggable onDragStart={()=>setDragged(item)} onDragEnd={()=>setDragged(null)}>
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
                        onDragOver={e=>{e.preventDefault();setDragOver(target.id);}}
                        onDragLeave={()=>setDragOver(null)}
                        onDrop={()=>{
                          if(dragged){setMapping(m=>{const n={...m};Object.keys(n).forEach(k=>{if(n[k]===target.id)delete n[k];});n[dragged.id]=target.id;return n;});}
                          setDragOver(null);setDragged(null);
                        }}>
                        {placed?<div className="drag-item" style={{width:"100%",background:`${t.green}10`,borderColor:`${t.green}40`,color:t.text}}>{placed.label}</div>
                          :<span style={{fontSize:11,color:t.textDim}}>Drop here</span>}
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
          <div style={{fontWeight:500,fontSize:13,color:t.text,marginBottom:10}}>{q.question||"Select the best answer:"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {(q.choices||q.options||[]).map((choice,i)=>{
              let cls="opt";
              if(submitted){cls+=" done"; if(i===q.correct)cls+=" ok"; else if(i===selected&&i!==q.correct)cls+=" bad";}
              else if(selected===i)cls+=" sel";
              return(
                <div key={i} className={cls} onClick={()=>!submitted&&setSelected(i)}>
                  <div className="opt-ltr">{String.fromCharCode(65+i)}</div>
                  <span style={{fontSize:14,flex:1,lineHeight:1.55,color:t.text}}>{choice}</span>
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
            <button className="btn btn-ghost" onClick={()=>{setSubmitted(false);setSelected(null);setTermHistory([]);setMapping({});setOrderItems(q.items?[...q.items].sort(()=>Math.random()-.5):[]);setBlanks(q.blanks?Object.fromEntries(q.blanks.map(b=>[b.id,""])):{})}}>
              Try Again
            </button>
            <button className="btn btn-primary" onClick={()=>onDone({qid:q.id,correct:isCorrect(),type:q.type,title:q.title,ch:q.ch,domain:q.cat,pbq:true})}>
              Continue →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════
function Pricing({user,onUpgrade,onCancelMembership,onDeleteAccount,onNavigate,t,billingLoading=false}) {
  return(
    <div style={{padding:"32px 24px",maxWidth:700,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h2 style={{fontSize:26,fontWeight:700,color:t.text,marginBottom:8}}>Simple Pricing</h2>
        <p style={{color:t.textSec,fontSize:14}}>Annual billing · Cancel anytime</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:32}}>
        {/* FREE */}
        <div className="card" style={{padding:"28px 24px"}}>
          <div className="label" style={{marginBottom:8}}>Free</div>
          <div style={{fontSize:36,fontWeight:700,color:t.text,marginBottom:4}}>$0</div>
          <div style={{fontSize:13,color:t.textDim,marginBottom:20}}>Forever</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {["All MCQ practice questions","Daily Challenge","Basic score tracking","Access to study guide"].map(f=>(
              <div key={f} style={{display:"flex",gap:8,fontSize:13,color:t.textSec}}>
                <span style={{color:t.green}}>✓</span>{f}
              </div>
            ))}
            {["PBQ simulations","Progress analytics","Chapter breakdowns"].map(f=>(
              <div key={f} style={{display:"flex",gap:8,fontSize:13,color:t.textDim}}>
                <span>✕</span><span style={{textDecoration:"line-through"}}>{f}</span>
              </div>
            ))}
          </div>
          {user.tier==="free"?<button className="btn btn-ghost" style={{width:"100%",justifyContent:"center"}} disabled>Current Plan</button>
            :<button className="btn btn-ghost" style={{width:"100%",justifyContent:"center"}} onClick={()=>onUpgrade("free")}>Downgrade</button>}
        </div>

        {/* PRO */}
        <div className="card" style={{padding:"28px 24px",borderColor:t.accent,boxShadow:`0 4px 24px ${t.accent}18`,position:"relative"}}>
          <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)"}}>
            <span style={{background:t.accent,color:"#fff",padding:"3px 14px",borderRadius:99,fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>Most Popular</span>
          </div>
          <div className="label" style={{marginBottom:8}}>Pro</div>
          <div style={{fontSize:36,fontWeight:700,color:t.accent,marginBottom:4}}>$4.99</div>
          <div style={{fontSize:13,color:t.textDim,marginBottom:4}}>per year</div>
          <div style={{fontSize:13,color:t.green,fontWeight:600,marginBottom:18}}>Roughly only $0.40/month</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {["Everything in Free","All 50 PBQ simulations","8 simulation types","Full progress analytics","Chapter-by-chapter tracking","Per-question feedback"].map(f=>(
              <div key={f} style={{display:"flex",gap:8,fontSize:13,color:t.textSec}}>
                <span style={{color:t.green}}>✓</span>{f}
              </div>
            ))}
          </div>
          {user.tier==="pro"?<button className="btn btn-ghost" style={{width:"100%",justifyContent:"center"}} disabled>Current Plan</button>
            :<button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"12px"}} onClick={()=>onUpgrade("pro")} disabled={billingLoading}>
              {billingLoading?"Opening Stripe...":"Upgrade yearly →"}
            </button>}
        </div>
      </div>

      {/* Stripe note */}
      <div className="card" style={{padding:"18px 22px"}}>
        <div style={{fontWeight:600,fontSize:14,color:t.text,marginBottom:8}}>💳 Payment via Stripe</div>
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
            Terms of Service
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
// EXAM OBJECTIVES + SUPPORT
// ═══════════════════════════════════════════════════════════════
function ObjectivesPage({t}) {
  return(
    <div style={{padding:"28px 24px",maxWidth:860,margin:"0 auto"}}>
      <h2 style={{fontSize:22,fontWeight:700,color:t.text,marginBottom:4}}>CompTIA Security+ (V7) Exam Objectives</h2>
      <p style={{color:t.textSec,fontSize:14,marginBottom:20}}>
        SecurePlus is organised around the current Security+ domain structure. This page avoids locking the product name to a single exam code, since exam versions can change over time.
      </p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:20}}>
        {CHAPTERS.map(ch=>(
          <div key={ch.id} className="card" style={{padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start",marginBottom:8}}>
              <div style={{fontWeight:700,color:t.text,fontSize:14}}>{ch.emoji} {ch.title}</div>
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
      <h2 style={{fontSize:22,fontWeight:700,color:t.text,marginBottom:6}}>
        {isPrivacy ? "Privacy Policy" : "Terms of Service"}
      </h2>
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
          <span>🔐</span>
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

  const t=darkMode?THEMES.dark:THEMES.light;

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
        const savedAttempts=await loadSupabaseAttempts(session.user.id);
        if(!active)return;
        setUser(appUser);
        setAttempts(savedAttempts);
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
      if(sess?.loggedIn){const u=await DB.getUser(sess.email);if(u){setUser(u);const a=await DB.getAttempts(u.email);setAttempts(a);}}
      setLoading(false);
    })();
    return()=>{active=false;};
  },[]);

  const handleLogin=useCallback(async u=>{
    setUser(u);
    const a=u?.authProvider==="supabase" ? await loadSupabaseAttempts(u.id) : await DB.getAttempts(u.email);
    setAttempts(a);setView("dashboard");setShowDaily(false);
  },[]);
  const handleLogout=useCallback(async()=>{
    if(isSupabaseConfigured) await supabase.auth.signOut();
    await DB.clearSession();setPasswordRecovery(false);setUser(null);setAttempts([]);setView("dashboard");
  },[]);
  const handleCancelMembership=useCallback(async()=>{
    if(!isSupabaseConfigured){
      alert("Membership cancellation will use Stripe's billing portal once Supabase and Stripe env vars are configured. For now, contact secureplus.support@gmail.com.");
      return;
    }
    setBillingLoading(true);
    try{
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
  const handlePBQDone=useCallback(async result=>{
    if(result&&user){
      if(user.authProvider==="supabase") await saveSupabaseAttempt(user.id,result);
      else await DB.saveAttempt(user.email,result);
      setAttempts(a=>[result,...a]);
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
          <span style={{fontWeight:700,fontSize:15,color:t.text}}>🔐 SecurePlus</span>
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
          <span style={{fontWeight:700,fontSize:15,color:t.text}}>🔐 SecurePlus</span>
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
        <PBQSim q={pbqQ} onDone={handlePBQDone} t={t}/>
      </div>
    </>
  );

  const navItems=[
    {id:"dashboard",emoji:"🏠",label:"Dashboard"},
    {id:"mcq",emoji:"📝",label:"MCQ Practice"},
    {id:"pbq",emoji:"💡",label:"PBQ Simulator"},
    {id:"daily",emoji:"🎯",label:"Daily Challenge"},
    {id:"pricing",emoji:"💳",label:"Pricing"},
    {id:"objectives",emoji:"📋",label:"Objectives"},
    {id:"privacy",emoji:"🔒",label:"Privacy Policy"},
    {id:"terms",emoji:"📄",label:"Terms of Service"},
  ];

  return(
    <>
      <style>{CSS}</style>
      <div className="app-shell">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Logo */}
          <div style={{padding:"18px 16px",borderBottom:`1px solid ${t.border}`}}>
            <div style={{fontWeight:700,fontSize:16,color:t.text}}>🔐 SecurePlus</div>
            <div style={{fontSize:11,color:t.textDim,marginTop:2}}>CompTIA Security+ Practice Platform</div>
          </div>

          {/* User */}
          <div style={{padding:"12px 14px",borderBottom:`1px solid ${t.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:`${t.accent}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:t.accent}}>
                {user.name[0]?.toUpperCase()}
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
                <span style={{fontSize:10,fontWeight:600,color:user.tier==="pro"?t.accent:t.textDim,textTransform:"uppercase"}}>
                  {user.tier}
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{flex:1,padding:"10px 10px",display:"flex",flexDirection:"column",gap:2}}>
            {navItems.map(n=>(
              <div key={n.id} className={`nav-lnk ${view===n.id?"act":""}`} onClick={()=>setView(n.id)}>
                <span style={{fontSize:16}}>{n.emoji}</span>
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
              <div style={{fontWeight:800,fontSize:15,color:t.text}}>🔐 SecurePlus</div>
              <div style={{fontSize:11,color:t.textDim}}>CompTIA Security+ Practice</div>
            </div>
            <button className="btn btn-ghost" style={{fontSize:12,minHeight:34,padding:"6px 10px"}} onClick={()=>setDarkMode(d=>!d)}>
              {darkMode?"Light":"Dark"}
            </button>
          </div>
          {view==="dashboard"&&<Dashboard user={user} attempts={attempts} onNav={setView} t={t}/>}
          {view==="mcq"&&<MCQPractice user={user} onSave={handleSaveAttempt} t={t}/>}
          {view==="pbq"&&<PBQBank user={user} attempts={attempts} onStart={q=>user.tier==="free"?setView("pricing"):setPbqQ(q)} onUpgrade={()=>setView("pricing")} t={t}/>}
          {view==="daily"&&<DailyChallenge t={t} user={user} onLogin={()=>setView("dashboard")}/>}
          {view==="pricing"&&<Pricing user={user} onUpgrade={handleUpgrade} onCancelMembership={handleCancelMembership} onDeleteAccount={handleDeleteAccount} onNavigate={setView} t={t} billingLoading={billingLoading}/>}
          {view==="objectives"&&<ObjectivesPage t={t}/>}
          {view==="privacy"&&<LegalPage type="privacy" t={t}/>}
          {view==="terms"&&<LegalPage type="terms" t={t}/>}
        </main>
      </div>
    </>
  );
}
