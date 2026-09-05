// Publicly served question overrides captured read-only on 2026-09-05.
// This preserves the published baseline for the editorial review and offline use.
// Newer admin edits still take precedence; this is not a database migration.
export const PUBLISHED_CONTENT_SNAPSHOT = [
  {
    "question_kind": "mcq",
    "question_id": "m013",
    "action": "upsert",
    "payload": {
      "q": "A threat actor group has nation-state funding, uses previously unknown zero-day exploits, and maintains persistent access to a target for 18 months without detection. Which category BEST describes this actor?",
      "ch": "2",
      "id": "m013",
      "exp": "An advanced persistent threat is suggested by high resources, advanced tooling or zero-days, stealth, and long dwell time. The category is an evidence-based assessment, not absolute attribution.",
      "opts": [
        "Script kiddie",
        "Hacktivist",
        "Advanced Persistent Threat (APT)",
        "Insider threat"
      ],
      "topic": "Threat Actors",
      "correct": 2,
      "acronyms": [
        "APT"
      ],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "Script kiddies usually rely on existing tools and do not match the zero-day, high-resource, long-term profile.",
        "1": "Hacktivists are usually motivated by visibility or a cause. The scenario emphasizes stealthy long-term access and advanced capability.",
        "2": "",
        "3": "An insider has legitimate access. The scenario points to an externally resourced, persistent actor group."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-08-04T12:51:00.484+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m015",
    "action": "upsert",
    "payload": {
      "q": "An attacker registers the domain 'cornpany.com' (using 'rn' instead of 'm') and hosts a convincing copy of the corporate intranet login page. Which technique is this?",
      "ch": "2",
      "id": "m015",
      "exp": "Typosquatting (URL hijacking) registers domain names that are common misspellings of legitimate sites. Users who mistype the URL land on the attacker's convincing fake page and submit credentials.",
      "opts": [
        "Watering hole attack",
        "Business email compromise",
        "Typosquatting",
        "Vishing"
      ],
      "topic": "Social Engineering",
      "correct": 2,
      "acronyms": [],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "A watering hole attack compromises a legitimate website that the target is known to visit — not a fake lookalike domain.",
        "1": "Business email compromise targets executives to authorise fraudulent financial transfers — unrelated to a fake website.",
        "2": "",
        "3": "Vishing is a voice-based attack. This attack operates entirely through a deceptive website."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-07T08:39:43.165+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m020",
    "action": "upsert",
    "payload": {
      "q": "A SCADA system controlling water treatment cannot be taken offline for patching because the vendor no longer supports the software. What is the MOST appropriate security control?",
      "ch": "3",
      "id": "m020",
      "exp": "When patching is impossible, the best practice is to isolate the system (air-gap or VLAN segmentation), apply compensating controls (strict firewall rules, one-way data diodes, enhanced monitoring), and document the accepted residual risk. Replacement is ideal but often requires years of planning in OT environments.",
      "opts": [
        "Accept the risk with no additional controls",
        "Immediately replace the entire system",
        "Implement network segmentation and compensating controls",
        "Install third-party antivirus on the SCADA system"
      ],
      "topic": "Secure Design",
      "correct": 2,
      "acronyms": [
        "SCADA"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Accepting risk with NO additional controls is negligent when protecting critical infrastructure. Risk must be reduced to an acceptable level.",
        "1": "Immediate replacement of SCADA/ICS infrastructure is rarely feasible — it requires regulatory approval, procurement, and extended validation to avoid causing outages to critical systems.",
        "2": "",
        "3": "Antivirus on SCADA systems is often incompatible with industrial software and may cause instability. Isolation and monitoring are the industry-standard approach."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-07T08:40:16.128+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m025",
    "action": "upsert",
    "payload": {
      "q": "During a forensic investigation, the analyst needs to ensure that evidence collected from a device will be admissible in court. Which action is MOST critical?",
      "ch": "4",
      "id": "m025",
      "exp": "Maintaining chain of custody requires proving the evidence was not altered. Hashing the original media and the forensic image (using SHA-256 or MD5) before and after acquisition proves the copy is an exact duplicate and was not tampered with.",
      "opts": [
        "Taking photos of the device",
        "Creating a cryptographic hash of the disk image BEFORE and AFTER acquisition",
        "Running antivirus on the device",
        "Interviewing the device owner"
      ],
      "topic": "Digital Forensics",
      "correct": 1,
      "acronyms": [
        "MD5"
      ],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "Photos document the physical state but do not prove the digital contents were not modified.",
        "1": "",
        "2": "Running antivirus modifies the device (log files, quarantine actions) — this taints the evidence and can make it inadmissible.",
        "3": "Interviewing the owner is useful for investigation context but does not preserve or verify the integrity of digital evidence."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-04T08:28:44.467+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m027",
    "action": "upsert",
    "payload": {
      "q": "A company allows employees to use personal smartphones for work email (BYOD). Which solution gives the organisation control over ONLY the corporate data and apps on the device, without wiping the entire personal phone?",
      "ch": "4",
      "id": "m027",
      "exp": "MAM (Mobile Application Management) manages only the corporate apps and the data within them, without touching personal apps or data. This makes it ideal for BYOD where employees legitimately object to full device management.",
      "opts": [
        "MDM — Mobile Device Management",
        "MAM — Mobile Application Management",
        "COPE — Corporate-Owned, Personally Enabled",
        "COBO — Corporate-Owned, Business Only"
      ],
      "topic": "Endpoint Hardening",
      "correct": 1,
      "acronyms": [
        "BYOD",
        "COPE",
        "MAM",
        "MDM"
      ],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "MDM manages the entire device — it can remotely wipe the whole phone, which raises privacy concerns for personal BYOD devices.",
        "1": "",
        "2": "COPE means the company owns the device but allows personal use — this is not BYOD (the employee owns the phone).",
        "3": "COBO means the company owns the device and it is used only for business — no personal use. This is the opposite of BYOD."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-16T07:03:44.542+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m031",
    "action": "upsert",
    "payload": {
      "q": "An organisation chooses to purchase cyber insurance to cover potential losses from a data breach. Which risk response strategy does this represent?",
      "ch": "5",
      "id": "m031",
      "exp": "Risk transfer shifts the financial consequences of a risk to a third party (the insurer). The risk itself still exists — it has not been eliminated or reduced — but the financial impact is transferred. Outsourcing IT operations also transfers risk contractually.",
      "opts": [
        "Risk avoidance",
        "Risk mitigation",
        "Risk transfer",
        "Risk acceptance"
      ],
      "topic": "Risk Management",
      "correct": 2,
      "acronyms": [
        "MFA"
      ],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "Risk avoidance eliminates the risk by stopping the risky activity entirely (e.g. not launching an online service at all).",
        "1": "Risk mitigation implements controls to reduce the likelihood or impact of the risk (e.g. deploying MFA or encryption).",
        "2": "",
        "3": "Risk acceptance acknowledges the risk and decides to live with it without further action — insurance is an active response, not passive acceptance."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-18T07:58:58.221+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m048",
    "action": "upsert",
    "payload": {
      "q": "After a disgruntled employee is terminated, payroll records are deleted three months later. Investigation reveals code planted before departure set to trigger on a specific date. What malware type is this?",
      "ch": "2",
      "id": "m048",
      "exp": "A logic bomb remains dormant until a specific condition is met (a date, event, or account deletion). It is a common insider threat tool — planted before departure to cause damage later.",
      "opts": [
        "Trojan",
        "Logic bomb",
        "Worm",
        "Ransomware"
      ],
      "topic": "Malware Types",
      "correct": 1,
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "A Trojan is disguised as legitimate software and relies on a user installing it. It is not defined by dormant code that activates when a condition is met.",
        "1": "",
        "2": "A worm spreads automatically between systems. The scenario describes code already planted in one system and waiting for a specific trigger.",
        "3": "Ransomware encrypts data and demands payment. The scenario instead describes trigger-based destructive code without a ransom demand."
      }
    },
    "status": "active",
    "updated_at": "2026-07-04T07:14:24.936+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m070",
    "action": "upsert",
    "payload": {
      "q": "An analyst creates a bit-for-bit copy of a suspect's hard drive and hashes both the original and copy with SHA-256, confirming they match. Why is this step critical?",
      "ch": "4",
      "id": "m070",
      "exp": "Hashing the original and the forensic copy before analysis proves the copy is identical to the original (forensically sound). Any evidence found in the copy can be attributed to the original media — maintaining chain of custody.",
      "opts": [
        "To confirm the drive is not encrypted",
        "To prove the copy is forensically sound and any findings reflect the original evidence",
        "To ensure the original drive can be reused",
        "To meet the GDPR data minimisation requirement"
      ],
      "topic": "Digital Forensics",
      "correct": 1,
      "acronyms": [
        "GDPR"
      ],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "Disk encryption status is determined by examining partition structure, not by hash comparison.",
        "1": "",
        "2": "Forensic best practice requires preserving the original — working copies are used for analysis.",
        "3": "GDPR data minimisation relates to collecting only necessary personal data — forensic evidence handling is governed by chain of custody."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-07T14:14:06.399+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m105",
    "action": "upsert",
    "payload": {
      "q": "An organisation wants to use asymmetric cryptography to allow anyone to send it encrypted messages, while ensuring only the organisation can decrypt them. Which key should be distributed publicly?",
      "ch": "1",
      "id": "m105",
      "exp": "In asymmetric cryptography, the public key is shared openly and used by senders to encrypt messages. Only the corresponding private key — held exclusively by the organisation — can decrypt them. Distributing the private key would destroy confidentiality. Symmetric and pre-shared keys require secure prior exchange.",
      "opts": [
        "Symmetric session key",
        "Private key",
        "Public key",
        "Pre-shared key"
      ],
      "topic": "Cryptography Concepts",
      "correct": 2,
      "acronyms": [],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "This option does not best satisfy the scenario. The stronger answer is C: Public key. In asymmetric cryptography, the public key is shared openly and used by senders to encrypt messages. Only the corresponding private key — held exclusively by the organisation — can decrypt them. Distributing the private key would destroy confidentiality. Symmetric and pre-shared keys require secure prior exchange.",
        "1": "This option does not best satisfy the scenario. The stronger answer is C: Public key. In asymmetric cryptography, the public key is shared openly and used by senders to encrypt messages. Only the corresponding private key — held exclusively by the organisation — can decrypt them. Distributing the private key would destroy confidentiality. Symmetric and pre-shared keys require secure prior exchange.",
        "2": "",
        "3": "This option does not best satisfy the scenario. The stronger answer is C: Public key. In asymmetric cryptography, the public key is shared openly and used by senders to encrypt messages. Only the corresponding private key — held exclusively by the organisation — can decrypt them. Distributing the private key would destroy confidentiality. Symmetric and pre-shared keys require secure prior exchange."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-14T12:50:13.999+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m130",
    "action": "upsert",
    "payload": {
      "q": "A security researcher discovers an unpatched vulnerability in a widely deployed VPN product for which no public exploit yet exists. The researcher privately notifies the vendor. Which term describes this vulnerability before the vendor releases a patch?",
      "ch": "2",
      "id": "m130",
      "exp": "A zero-day vulnerability is one that is unknown to the software vendor or for which no patch exists. \"Zero-day\" refers to the zero days the vendor has had to address it. Once the vendor is notified and issues a patch, it becomes a \"known vulnerability.\" Legacy vulnerabilities affect end-of-life systems. Residual risk is what remains after controls are applied.",
      "opts": [
        "Legacy vulnerability",
        "Known vulnerability",
        "Zero-day vulnerability",
        "Residual vulnerability"
      ],
      "topic": "Vulnerability Types",
      "correct": 2,
      "acronyms": [
        "CVE",
        "VPN"
      ],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "Legacy vulnerability applies strictly to outdated, obsolete, or End-of-Life (EOL) software that the vendor no longer supports. This VPN is current and actively deployed.",
        "1": "Known vulnerability requires the flaw to be publicly disclosed and cataloged (like having a CVE ID) so the industry can track it. This flaw is still confidential.",
        "2": "",
        "3": "Residual vulnerability refers to the remaining risk left over after security controls or patches have been applied. No patch has been created yet."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-18T13:04:26.314+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m200",
    "action": "upsert",
    "payload": {
      "q": "An organisation's security policy states that \"all sensitive data must be encrypted at rest.\" The IT team interprets this differently — one team uses AES-128, another uses AES-256, and a third uses 3DES. Which governance document is MISSING that would resolve this inconsistency?",
      "ch": "5",
      "id": "m200",
      "exp": "Correct. Standards define mandatory, quantifiable technical requirements (such as mandating AES-256) to ensure consistent implementation across all teams.",
      "opts": [
        "A more detailed security policy",
        "A security standard specifying encryption standards",
        "A security procedure for implementing encryption",
        "A security guideline recommending encryption best practices"
      ],
      "topic": "Security Frameworks",
      "correct": 1,
      "acronyms": [
        "AES"
      ],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "Incorrect. Policies provide high-level management direction and intent, not specific technical parameters like algorithm types or key lengths.",
        "1": "",
        "2": "Incorrect. Procedures outline the step-by-step instructions on how to perform a task, whereas the missing piece here is the defining rule or baseline itself.",
        "3": "Incorrect. Guidelines are recommendations and non-mandatory suggestions, which would still leave room for different teams to choose varying encryption methods."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T03:39:59.753+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m287",
    "action": "upsert",
    "payload": {
      "q": "A developer uses the function printf(user_input) instead of printf(\"%s\", user_input). An attacker passes \"%x %x %x %x\" as input. The application prints memory contents. What vulnerability class is this?",
      "ch": "2",
      "id": "m287",
      "exp": "Format string vulnerability: when user input is used as a format string directly (printf(user_input) rather than printf(\"%s\",user_input)), an attacker can inject format specifiers. %x reads 4 bytes from the stack. %s reads from an arbitrary address. %n writes to memory — enabling arbitrary write primitives. Mitigation: always use a static format string and pass user input as an argument.",
      "opts": [
        "Buffer overflow — the user input overflows the printf buffer",
        "Format string vulnerability — user-controlled format specifiers allow reading/writing arbitrary memory",
        "SQL injection — the format string modifies a database query",
        "Integer overflow — the %x specifiers cause integer arithmetic errors"
      ],
      "topic": "Vulnerability Types",
      "correct": 1,
      "difficulty": "hard",
      "wrongFeedback": {
        "0": "This option does not best satisfy the scenario. The stronger answer is B: Format string vulnerability — user-controlled format specifiers allow reading/writing arbitrary memory. Format string vulnerability: when user input is used as a format string directly (printf(user_input) rather than printf(\"%s\",user_input)), an attacker can inject format specifiers. %x reads 4 bytes from the stack. %s reads from an arbitrary address. %n writes to memory — enabling arbitrary write primitives. Mitigation: always use a static format string and pass user input as an argument.",
        "1": "",
        "2": "This option does not best satisfy the scenario. The stronger answer is B: Format string vulnerability — user-controlled format specifiers allow reading/writing arbitrary memory. Format string vulnerability: when user input is used as a format string directly (printf(user_input) rather than printf(\"%s\",user_input)), an attacker can inject format specifiers. %x reads 4 bytes from the stack. %s reads from an arbitrary address. %n writes to memory — enabling arbitrary write primitives. Mitigation: always use a static format string and pass user input as an argument.",
        "3": "This option does not best satisfy the scenario. The stronger answer is B: Format string vulnerability — user-controlled format specifiers allow reading/writing arbitrary memory. Format string vulnerability: when user input is used as a format string directly (printf(user_input) rather than printf(\"%s\",user_input)), an attacker can inject format specifiers. %x reads 4 bytes from the stack. %s reads from an arbitrary address. %n writes to memory — enabling arbitrary write primitives. Mitigation: always use a static format string and pass user input as an argument."
      },
      "beyondTextbook": true
    },
    "status": "active",
    "updated_at": "2026-07-04T08:20:22.484+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m309",
    "action": "disable",
    "payload": {
      "id": "m309"
    },
    "status": "active",
    "updated_at": "2026-07-06T04:37:09.696+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m402",
    "action": "upsert",
    "payload": {
      "q": "A financial platform automatically rolls back a database transaction and isolates the affected schema partition whenever a SQL injection pattern is detected mid-query. Which two control functions does this mechanism combine?",
      "ch": "1",
      "id": "m402",
      "exp": "It is Detective because it actively identifies the malicious SQL injection pattern while it is running (\"mid-query\").\nIt is Corrective because it automatically reverses the damage (rolls back the transaction) and contains the threat (isolates the partition) after it is found.",
      "opts": [
        "Detective and preventive",
        "Detective and Deterrent",
        "Preventive and Compensating",
        "Detective and Corrective"
      ],
      "topic": "Control Types",
      "correct": 3,
      "acronyms": [
        "WAF"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Why \"Preventive\" is wrong: Preventive controls stop an attack from succeeding before it can execute or cause any state change. In a SQL injection context, input validation, parameterized queries, or a Web Application Firewall (WAF) blocking the payload entirely are preventive. In this scenario, the query is already executing (\"detected mid-query\"), meaning prevention failed, and the system must now react to it.",
        "1": "Why \"Deterrent\" is wrong: Deterrent controls are designed to discourage an attacker from attempting an assault in the first place by turning them away psychologically. Examples include warning banners (\"Unauthorized access will be prosecuted\"), security cameras, or guard dogs. Rollback and isolation are technical enforcement actions, not psychological warnings.",
        "2": "Why \"Preventive\" is wrong: Preventive controls stop an attack from succeeding before it can execute or cause any state change. In a SQL injection context, input validation, parameterized queries, or a Web Application Firewall (WAF) blocking the payload entirely are preventive. In this scenario, the query is already executing (\"detected mid-query\"), meaning prevention failed, and the system must now react to it.\n\nWhy \"Compensating\" is wrong: Compensating controls are substitute measures used when a primary security control is impossible, too expensive, or technically unfeasible to implement. For example, if an legacy database cannot use encryption, a compensating control might be extra strict network isolation and enhanced log monitoring. The scenario describes a highly advanced, automated primary response mechanism, not a fallback workaround.",
        "3": "Corrective controls restore state after damage — roll-back before commit is preventive, not corrective because no damage has yet been committed."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-06T04:49:46.323+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m404",
    "action": "upsert",
    "payload": {
      "q": "A developer secures user passwords using PBKDF2 with HMAC-SHA256 and 600,000 iterations. Before hashing, a unique, randomly generated 128-bit value is prepended to each password and stored alongside the final hash. **What is the PRIMARY purpose of this randomly generated value?**",
      "ch": "1",
      "id": "m404",
      "exp": "The random per-user value (salt) ensures identical passwords produce different digests, defeating rainbow table and bulk cracking attacks.",
      "opts": [
        "To defend against brute-force attacks by increasing computational complexity.",
        "To prevent the use of precomputed rainbow tables against the stored hashes.",
        "To securely encrypt the passwords using symmetric key algorithms.",
        "To mask the original length of the user's password."
      ],
      "topic": "Cryptography",
      "correct": 1,
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Increasing computational complexity is the job of the 600,000 iterations (the PBKDF2 function itself), which deliberately slows down a computer attempting to guess passwords one by one.",
        "1": "",
        "2": "The \"randomly generated 128-bit value\" is a salt. Its primary purpose is to ensure that two identical passwords result in completely different hashes. This completely breaks precomputed crack lists (rainbow tables), forcing attackers to crack each password individually from scratch.",
        "3": "PBKDF2 and SHA-256 are one-way hashing functions, not encryption. Hashing cannot be decrypted back into cleartext, and no symmetric keys are used here."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-04T08:27:25.739+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m420",
    "action": "upsert",
    "payload": {
      "q": "A network administrator replaces all legacy Telnet sessions to network devices with SSH. Beyond encrypting the session, SSH provides an additional security property that Telnet cannot. Which property does SSH provide that Telnet does not?",
      "ch": "1",
      "id": "m420",
      "exp": "SSH presents a host key that the client verifies, proving the server identity before credentials are sent — Telnet has no equivalent authentication mechanism.",
      "opts": [
        "Compression of management traffic to reduce bandwidth on low-throughput WAN links connecting remote branch office network devices",
        "Server authentication using host keys, which allows the client to verify the identity of the device before credentials are transmitted",
        "Automatic session timeout that disconnects idle administrative sessions after a configurable period of inactivity on the managed device",
        "Rate limiting of login attempts to prevent automated brute-force tools from testing large numbers of credential combinations against the device"
      ],
      "topic": "Secure Protocols",
      "correct": 1,
      "acronyms": [
        "SSH"
      ],
      "difficulty": "hard",
      "wrongFeedback": {
        "0": "SSH supports optional compression but this is not a security property unique to SSH versus Telnet — compression is a performance feature.",
        "1": "",
        "2": "Session timeout is a configuration feature available independently of the protocol; Telnet sessions can also be configured to time out — it is not unique to SSH.",
        "3": "Rate limiting login attempts is a configuration of the authentication service or firewall, not a property of the SSH protocol itself — Telnet with the same authentication service could equally implement login-attempt rate limiting."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-19T05:51:47.482+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m432",
    "action": "upsert",
    "payload": {
      "q": "An attacker gains physical access to an office by carrying a large stack of boxes and walking closely behind a badged employee through a secured door as the employee holds it open. Later, the attacker plugs a USB device into an unlocked workstation in a conference room. Which TWO physical social engineering vectors are used in sequence here?",
      "ch": "2",
      "id": "m432",
      "exp": "Following through a held door is tailgating; leaving or plugging in a USB to tempt/infect someone is baiting — both physical social engineering techniques.",
      "opts": [
        "Shoulder surfing followed by dumpster diving",
        "Tailgating followed by baiting",
        "Pretexting followed by vishing",
        "Whaling followed by piggybacking"
      ],
      "topic": "Social Engineering",
      "correct": 1,
      "difficulty": "hard",
      "wrongFeedback": {
        "0": "Shoulder surfing requires observing someone's screen or keyboard; dumpster diving involves searching physical waste — neither is described in this scenario.",
        "1": "",
        "2": "Pretexting involves fabricating a scenario to gain trust — no fabricated story is described; vishing is voice-based phone deception — no phone call is made.",
        "3": "Whaling is a spear-phishing attack targeting senior executives via email or phone; piggybacking is conceptually similar to tailgating but typically involves the target being aware — neither matches the box-carrying door-hold scenario described."
      }
    },
    "status": "active",
    "updated_at": "2026-07-04T08:16:49.936+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m433",
    "action": "upsert",
    "payload": {
      "q": "A forensic analyst examines a compromised workstation and discovers a programme that intercepts operating system API calls to hide its own process entries from task managers, masks its network connections from netstat output, and conceals its files from directory listings. __Which malware category does this behaviour describe?__",
      "ch": "2",
      "id": "m433",
      "exp": "Intercepting OS APIs to hide processes, files, and connections from administrative tools is the defining behaviour of a rootkit.",
      "opts": [
        "Logic Bomb",
        "Rootkit",
        "Keylogger",
        "Worm"
      ],
      "topic": "Malware",
      "correct": 1,
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "A logic bomb remains dormant until triggered — it does not intercept OS APIs to hide itself; its defining characteristic is conditional activation, not active concealment of processes.",
        "1": "",
        "2": "A keylogger specifically records input device data — it does not characteristically hook process listing or file system APIs to hide its own entries from management tools.",
        "3": "A polymorphic worm modifies its signature to evade detection and propagates across networks — the behaviour described focuses on OS-level concealment on a single host, not on propagation or signature mutation."
      }
    },
    "status": "active",
    "updated_at": "2026-07-04T07:09:10.889+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m437",
    "action": "disable",
    "payload": {
      "id": "m437"
    },
    "status": "active",
    "updated_at": "2026-07-08T15:06:54.201+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m443",
    "action": "upsert",
    "payload": {
      "q": "An organisation wants to prevent its internal workstations from reaching known malicious domains without deploying endpoint agents. The solution should apply to all devices on the network, including guest BYOD endpoints, with minimal per-device configuration. Which control is MOST appropriate?",
      "ch": "2",
      "id": "m443",
      "exp": "DNS RPZ on the internal resolver applies to all devices using that resolver — including BYOD — with no per-device agent, configuration, or software required.",
      "opts": [
        "Installing a host-based firewall on each workstation configured with a deny rule for the known malicious IP addresses from the threat feed",
        "Configuring DNS response policy zones (RPZ) on the internal DNS resolver to redirect queries for malicious domains to a sinkhole address",
        "Deploying an endpoint detection and response agent on all workstations to block DNS queries to blacklisted domains at the process level",
        "Publishing a company-wide browser extension that checks each URL against a real-time threat feed before the browser renders the page"
      ],
      "topic": "Mitigation Techniques",
      "correct": 1,
      "acronyms": [
        "BYOD",
        "EDR"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Host-based firewall rules require per-device configuration and installation — they cannot be applied to guest BYOD devices centrally and require IP-based blocking rather than domain-name-based blocking.",
        "1": "",
        "2": "EDR agent deployment requires installation on each device and cannot be forced onto guest BYOD endpoints that the organisation does not manage.",
        "3": "A browser extension requires installation on each device, cannot be enforced on BYOD devices, and applies only to browser traffic — not to DNS queries from other applications on the same device."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-16T06:59:33.134+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m679",
    "action": "upsert",
    "payload": {
      "q": "Following the successful resolution of a major network breach, corporate executives and engineering teams assemble to dissect the exact event timeline, evaluate the effectiveness of their incident playbooks, and document permanent architectural changes to prevent future exploitation. Which phase of the Incident Response lifecycle does this meeting represent?",
      "ch": "3",
      "id": "m679",
      "exp": "Post-incident lessons learned workshops gather engineering teams and business directors together after a technical breach to formally analyze timeline logs, identify playbook flaws, and implement long-term security configuration improvements.",
      "opts": [
        "Incident Preparation and Training",
        "Containment, Eradication and Recovery",
        "Post-Incident Lessons Learned",
        "Detection and Analysis"
      ],
      "topic": "Security Operations",
      "correct": 2,
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "This option does not best satisfy the scenario. The stronger answer is C: Post-Incident Lessons Learned. Post-incident lessons learned workshops gather engineering teams and business directors together after a technical breach to formally analyze timeline logs, identify playbook flaws, and implement long-term security configuration improvements.",
        "1": "This option does not best satisfy the scenario. The stronger answer is C: Post-Incident Lessons Learned. Post-incident lessons learned workshops gather engineering teams and business directors together after a technical breach to formally analyze timeline logs, identify playbook flaws, and implement long-term security configuration improvements.",
        "2": "This option does not best match the scenario. The stronger answer is D: System Recovery Validation. Post-incident lessons learned workshops gather engineering teams and business directors together after a technical breach to formally analyze timeline logs, identify playbook flaws, and implement long-term security configuration improvements.",
        "3": "This option does not best satisfy the scenario. The stronger answer is C: Post-Incident Lessons Learned. Post-incident lessons learned workshops gather engineering teams and business directors together after a technical breach to formally analyze timeline logs, identify playbook flaws, and implement long-term security configuration improvements."
      }
    },
    "status": "active",
    "updated_at": "2026-07-04T06:47:53.153+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m690",
    "action": "upsert",
    "payload": {
      "q": "Which specific corporate identity role bears the ultimate business accountability for** **determining data access privileges, defining preservation lifetimes, and assigning initial classification labels?",
      "ch": "5",
      "id": "m690",
      "exp": "The Data Owner is an executive data stakeholder who bears ultimate structural accountability for evaluating data importance classification tiers, authorising directory access rights, and defining retention lifecycles based on business objectives.",
      "opts": [
        "Data Processor Agent",
        "Data Custodian Administrator",
        "Data Owner Corporate Executive",
        "Data Controller System Manager"
      ],
      "topic": "Identity & Access",
      "correct": 2,
      "acronyms": [
        "GDPR"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "A processor is a third-party entity (like a cloud provider or external vendor) that processes data only on behalf of, and according to the instructions of, the data controller. They have zero authority to determine access privileges, assign original classification labels, or hold ultimate business accountability.",
        "1": "A custodian is responsible for the technical maintenance and implementation of security controls (like managing backups, encryption, and access rights). They do not determine the rules or classification levels; they simply enforce the rules defined by the Data Owner. They hold operational responsibility, not ultimate business accountability.",
        "2": "",
        "3": "While a Data Controller (as a legal entity under privacy laws like GDPR) does determine the overall purpose of data collection, pairing it with \"System Manager\" skews this option toward a technical management role. In standard security governance frameworks (like CompTIA Security+), the specific, granular role explicitly tasked with assigning classifications and defining data retention lifetimes for a corporate asset is defined precisely as the Data Owner, making this option an inaccurate description for the specific corporate role required."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-19T05:51:26.48+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m706",
    "action": "upsert",
    "payload": {
      "q": "An enterprise network security team notices that an adversary is using DNS queries to exfiltrate proprietary data from an isolated corporate network. These requests are automatically forwarded across the internet to a malicious server that the adversary controls. **What attack technique is being demonstrated**?",
      "ch": "2",
      "id": "m706",
      "exp": "DNS Tunnelling: hiding stolen files inside normal DNS lookups to sneak them past firewalls.",
      "opts": [
        "DNS Tunneling",
        "DNS Cache Poisoning",
        "Domain Hijacking",
        "Typosquatting"
      ],
      "topic": "Network Security",
      "correct": 0,
      "acronyms": [],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "",
        "1": "DNS Cache Poisoning: feeding fake address listings into a server's memory to redirect users to a scam site.",
        "2": "Domain Hijacking: stealing the administrative login to a website (like GoDaddy) to take full control of it.",
        "3": "Typosquatting: buying misspelled domain names (e.g., g00gle.com) to trap users who make typos."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-05T00:38:46.916+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m707",
    "action": "upsert",
    "payload": {
      "q": "A security analyst is reviewing network logs and notices an unauthorized user successfully logged into an internal financial application. Upon closer inspection, the analyst discovers that the attacker captured a valid authentication packet transmitted across an unencrypted wireless network earlier that morning and simply re-sent the exact same packet to the server a few hours later. The server accepted the packet as valid.\n**Which of the following attack types has occurred, and what mitigation would best prevent it in the future?**",
      "ch": "2",
      "id": "m707",
      "exp": "A replay attack occurs when an attacker intercepts or captures valid network traffic (such as an authentication session or token) and later re-transmits (replays) it to a server to gain unauthorized access or replicate an action. Because the data itself is legitimate, the receiving system will accept it unless it has controls to check if the message is fresh. Implementing cryptographic nonces (a number used only once) or unique timestamps ensures that old requests are recognized as stale and automatically rejected.",
      "opts": [
        "Replay attack; implement session tokens with cryptographic nonces or timestamps.",
        "Pass-the-hash attack; implement a local administrator password solution (LAPS).",
        "Man-in-the-middle (MITM) attack; enforce the use of static IP addressing.",
        "DNS poisoning; configure DNS Security Extensions (DNSSEC)."
      ],
      "topic": "Network Attacks",
      "correct": 0,
      "acronyms": [
        "DNSSEC",
        "MITM"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "",
        "1": "A pass-the-hash (PtH) attack involves harvesting a stored password hash from a system's memory and using that hash to authenticate to other resources without needing the plaintext password. The scenario explicitly notes capturing live transit data over a network rather than extracting hashes from local operating system storage.",
        "2": "While the initial capture of the packet resembles a passive interception phase often associated with on-path/MITM tactics, simply re-transmitting a delayed packet hours later is a distinct replay attack. Furthermore, enforcing static IP addressing does not prevent someone from replaying network traffic.",
        "3": "DNS poisoning alters the translation directory of a name server to redirect traffic to fake websites. It has nothing to do with capturing and resending valid user authentication traffic to an authentic corporate service."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-05T00:47:50.327+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m708",
    "action": "upsert",
    "payload": {
      "q": "A company's website is crashing due to a massive DDoS attack. The IT team needs a solution that hides their true web server IP address and absorbs the huge spike in traffic by distributing the load across servers worldwide.\n\nWhich of the following should the company implement?",
      "ch": "2",
      "id": "m708",
      "exp": "A CDN uses a global network of servers to share the traffic load. It acts as a shield, soaking up massive DDoS traffic before it can ever reach and crash your main web server, while keeping your real IP hidden.",
      "opts": [
        "A reverse proxy server",
        "A Next-Generation Firewall (NGFW)",
        "A Content Delivery Network (CDN)",
        "A Network Address Translation (NAT) gateway"
      ],
      "topic": "Mitigation Techniques",
      "correct": 2,
      "acronyms": [
        "DDoS",
        "NAT",
        "NGFW"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "While a proxy can hide an IP address, a single localized proxy server does not have a global network of data centers to absorb a massive, worldwide traffic attack.",
        "1": "Firewalls block malicious data payloads, but they operate at your front door. If a massive wave of traffic floods your network connection, a firewall cannot stop the internet pipe itself from getting clogged.",
        "2": "",
        "3": "NAT is simply used to map internal private IP addresses to a public IP so devices can browse the internet. It has nothing to do with protecting websites from traffic spikes."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-05T04:12:59.494+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m709",
    "action": "upsert",
    "payload": {
      "q": "A network administrator needs to monitor traffic entering and leaving a critical database server in real time using a network intrusion detection system (NIDS). The NIDS appliance is plugged into an adjacent port on the same network switch.\n\nWhich feature should the administrator configure on the switch to send a copy of the database server's traffic to the NIDS?",
      "ch": "2",
      "id": "m709",
      "exp": "Port mirroring (also known as SPAN - Switched Port Analyzer) configures a network switch to copy traffic from a specific port (the source) and send it to another port (the destination) where a monitoring device like a NIDS or protocol analyzer is listening. It allows deep packet inspection without disrupting the live production traffic.",
      "opts": [
        "Port Mirroring",
        "Port Security",
        "Port Forwarding",
        "ARP Spoofing"
      ],
      "topic": "Network Security",
      "correct": 0,
      "acronyms": [
        "ARP",
        "MAC",
        "NAT",
        "NIDS"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "",
        "1": "Port security is a defensive feature that restricts input to an interface by limiting and identifying the MAC addresses of workstations allowed to connect to that port. It is used to prevent unauthorized devices from plugging into the wall, not for monitoring traffic.",
        "2": "Port forwarding is used in NAT environments to route inbound traffic from an external public IP and port to an internal private IP address and port (e.g., directing external web traffic to an internal web server). It does not duplicate traffic for security analysis.",
        "3": "ARP spoofing is a malicious attack where a threat actor sends fake ARP messages onto a local network to associate their MAC address with the IP address of a legitimate server, allowing them to intercept traffic. While it redirects traffic, it is a cyberattack, not a legitimate management feature configured by an administrator."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-05T04:26:03.663+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m710",
    "action": "upsert",
    "payload": {
      "q": "An attacker crashes a victim's gateway by sending small queries to open public DNS resolvers. The attacker alters the packet headers so the public servers send massive, unrequested responses directly to the victim instead.\nWhich combination of network features makes this specific vulnerability possible?",
      "ch": "2",
      "id": "m710",
      "exp": "This forces students to think about the root cause. DNS primarily uses UDP, which is stateless and does not require a connection handshake. This allows the attacker to easily fake (spoof) the source IP header. Combine that with open recursive servers (servers that answer queries for anyone on the internet), and the attacker has a free, unauthenticated platform to reflect and magnify traffic.",
      "opts": [
        "The stateful three-way handshake of TCP and loose firewall access control lists.",
        "The stateless nature of UDP and the availability of open recursive servers.",
        "Temporary caching flaws in Layer 2 switches and weak MAC address security.",
        "The lack of asymmetric encryption keys in authoritative zone files."
      ],
      "topic": "Network Attacks",
      "correct": 1,
      "acronyms": [
        "DNSSEC",
        "MAC",
        "UDP"
      ],
      "difficulty": "hard",
      "wrongFeedback": {
        "0": "If DNS relied strictly on TCP for these basic queries, this attack would fail. TCP requires a stateful three-way handshake (SYN → SYN-ACK → ACK). If an attacker tries to spoof the victim's IP, the server's SYN-ACK goes to the victim, who drops it because they never sent a SYN. The connection closes immediately, making amplification impossible.",
        "1": "",
        "2": "Layer 2 switches handle local MAC addresses inside a building. DNS amplification is a Layer 3 (IP) and Layer 4 (UDP) protocol attack that happens across the global public internet.",
        "3": "This sounds highly technical and mentions \"encryption keys\" (like DNSSEC), which might trick a student. However, DNSSEC digital signatures actually make the records larger, which accidentally gives attackers more amplification power if the system isn't properly configured. The lack of encryption keys is not what enables the traffic reflection."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-05T09:25:15.497+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m711",
    "action": "upsert",
    "payload": {
      "q": "An organization is developing a cloud-based mobile application that interacts with a backend database. The security team insists on implementing strict API rate limiting and robust token-based authentication (such as OAuth 2.0). Which of the following best describes the primary function of an API in this architecture and the security risk mitigated by these controls?",
      "ch": "3",
      "id": "m711",
      "exp": "An API (Application Programming Interface) fundamentally serves as a software intermediary that allows two different applications or systems to communicate and exchange data seamlessly using a standardized set of rules definitions.Token-based authentication prevents unauthorized data access (BOLA), while rate limiting stops traffic spikes from overwhelming the backend (DoS).",
      "opts": [
        "The API compiles backend source code into executable files; the controls prevent unauthorized reverse-engineering of the application.",
        "The API acts as an intermediary interface allowing different software systems to interact; the controls mitigate risks like Broken Object Level Authorization (BOLA) and Denial of Service (DoS) attacks.",
        "The API functions as a network firewall to filter OSI Layer 3 traffic; the controls prevent IP spoofing and distributed botnet intrusions.",
        "The API serves exclusively as a data encryption engine for local storage; the controls protect data-at-rest from physical theft."
      ],
      "topic": "Application Security",
      "correct": 1,
      "acronyms": [
        "API",
        "OAuth"
      ],
      "difficulty": "hard",
      "wrongFeedback": {
        "0": "Compilers turn source code into executables, not APIs. API controls cannot stop a user from reverse-engineering a mobile app binary.",
        "1": "",
        "2": "APIs operate at the Application Layer (Layer 7), not the Network Layer (Layer 3). They do not act as network firewalls or stop IP spoofing.",
        "3": "APIs manage data transmission and integration; they are not local data-at-rest encryption engines."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-06T14:44:28.552+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m712",
    "action": "upsert",
    "payload": {
      "q": "An organization is implementing port-based network access control to ensure that only authorized devices can connect to the physical office network switches. When a user plugs in their laptop, the switch blocks all traffic except for authentication requests, which it forwards to a backend RADIUS server.\nIn this IEEE 802.1X architecture, which role is the network switch performing?",
      "ch": "3",
      "id": "m712",
      "exp": "In an IEEE 802.1X framework, the Authenticator is the network device (such as a switch or wireless access point) that acts as a gatekeeper. It enforces network access control by blocking unauthorized traffic and passing credentials between the connecting device and the backend validation server.",
      "opts": [
        "Supplicant",
        "Authenticating Server",
        "Authenticator",
        "Certificate Authority"
      ],
      "topic": "Network Architecture",
      "correct": 2,
      "acronyms": [
        "CA",
        "EAP",
        "PKI",
        "TACACS+",
        "TLS"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "The Supplicant is the client software running on the user's endpoint device (e.g., the laptop) that requests access and provides credentials.",
        "1": "The Authentication Server is the backend service (typically a RADIUS or TACACS+ server) that verifies the credentials provided by the supplicant and tells the authenticator whether to grant access.",
        "2": "",
        "3": "A Certificate Authority (CA) issues digital certificates used in asymmetric cryptography. While 802.1X can use certificates (like in EAP-TLS), the CA is a PKI component, not a direct core role within the 802.1X exchange protocol."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-06T14:54:08.679+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m713",
    "action": "upsert",
    "payload": {
      "q": "A security analyst is reviewing an incoming signed document. The recipient's system attempts to verify the sender's digital signature but throws an error stating that the computed hash does not match the decrypted signature hash. What does this indicate?",
      "ch": "3",
      "id": "m713",
      "exp": "When verifying a signature, the receiver decrypts the attached hash using the sender's public key and compares it to a locally computed hash of the document. If they don't match, the document was modified in transit (integrity loss) or signed by a different key.",
      "opts": [
        "The document was encrypted using an asymmetric algorithm instead of a symmetric one.",
        "The sender's public key has expired on the Certificate Authority (CA) directory.",
        "The sender used the recipient's private key to sign the message digest.",
        "The integrity of the document has been compromised, or the wrong public key was used."
      ],
      "topic": "Cryptography & PKI",
      "correct": 3,
      "acronyms": [
        "CA"
      ],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "Digital signatures must use asymmetric cryptography (public/private keys) to function. If a symmetric algorithm were used, anyone with the shared key could forge the signature, defeating the entire purpose of non-repudiation. Furthermore, this choice completely misses why a hash comparison would fail",
        "1": "An expired certificate will trigger a different type of error in the system (such as \"Certificate Expired\" or \"Untrusted Certificate\"). The math behind decrypting the signature and comparing the hashes still works perfectly even if a certificate is past its expiration date; the system just rejects it on a policy level.",
        "2": "This is a fundamental misunderstanding of key ownership. The sender does not have access to the recipient's private key (only the recipient holds their own private key). Senders always sign a message digest using their own sender's private key.",
        "3": ""
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-07T08:36:48.836+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m714",
    "action": "upsert",
    "payload": {
      "q": "A security analyst is investigating a compromised server where an advanced persistent threat (APT) has successfully installed a boot-level rootkit. The rootkit has subverted the local operating system kernel, making the malware invisible to standard endpoint detection agents. Why is remote attestation uniquely suited to detecting this type of breach?",
      "ch": "4",
      "id": "m714",
      "exp": "This is exactly how it works. Because the **Trusted Platform Module (TPM) is a separate hardware chip**, it captures cryptographic hashes of the system components before the operating system or any rootkit can even execute. A kernel-level rootkit cannot alter these hardware logs or forge the TPM's private signature.",
      "opts": [
        "It uses a hardware-based TPM to sign integrity measurements before the OS boots, preventing a compromised kernel from faking a clean report",
        "It automatically patches the vulnerable kernel files and removes the rootkit code during the attestation handshake.",
        "It enforces symmetric encryption on all running processes, forcing the rootkit to reveal its encryption keys.",
        "\"It relies on high-privilege operating system API hooks to monitor kernel space changes in real time"
      ],
      "topic": "Security Controls",
      "correct": 0,
      "acronyms": [
        "API",
        "APT",
        "EDR",
        "TPM"
      ],
      "difficulty": "hard",
      "wrongFeedback": {
        "0": "",
        "1": "Remote attestation is strictly a diagnostic, reporting, and verification protocol. It only checks and flags that an unauthorized change has occurred; it has no built-in capability to remediate, modify, or patch system files.",
        "2": "Remote attestation uses asymmetric cryptography (public/private hardware-bound keys) to sign and verify system state logs. It does not monitor, encrypt, or manage active application processes or keys running in memory.",
        "3": "This is the primary flaw of traditional, software-based endpoint security tools (like classic antivirus or basic EDR agents). If a rootkit successfully subverts the operating system kernel, it completely controls those API hooks and can lie to the monitoring software. Remote attestation specifically bypasses the local OS entirely by using out-of-band hardware measurement"
      },
      "beyondTextbook": true
    },
    "status": "active",
    "updated_at": "2026-07-07T14:05:46.509+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m715",
    "action": "upsert",
    "payload": {
      "q": "An administrator needs to configure a solution that secures all network traffic leaving a remote employee's laptop, regardless of the application generating the data. Which solution should the administrator deploy?",
      "ch": "3",
      "id": "m715",
      "exp": "A VPN operates at the **network layer (Layer 3)** by creating a virtual network interface at the operating system level. Because it hooks directly into the OS routing table, it captures, encapsulates, and encrypts all outbound packets generated by any application or background system service seamlessly.",
      "opts": [
        "HTTP Proxy Server",
        "Reverse Proxy",
        "Virtual Private Network (VPN)",
        "Host-based Intrusion Detection System (HIDS)"
      ],
      "topic": "Network Architecture",
      "correct": 2,
      "acronyms": [
        "HIDS",
        "VPN"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "An HTTP forward proxy operates at the **application layer (Layer 7) **and is designed strictly to handle web traffic. It must be manually configured on a **per-application basis**, meaning background services, email clients, or non-web applications will completely bypass it and send data in the clear.",
        "1": "A reverse proxy is a server-side architectural component deployed in front of web servers to handle inbound traffic, distribute loads, or cache content. It is entirely incapable of serving as an outbound client utility to protect an endpoint's general internet traffic.",
        "2": "",
        "3": "A HIDS is a security application installed on an endpoint to monitor local system logs, file integrity, and process behavior for signs of malicious activity or policy violations. While it is excellent for threat detection, it does not encrypt, route, or secure outbound network traffic."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-09T14:54:17.301+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m716",
    "action": "upsert",
    "payload": {
      "q": "When analyzing performance overhead, why does a proxy generally achieve faster data throughput than a standard VPN connection?",
      "ch": "3",
      "id": "m716",
      "exp": "A standard VPN wraps all outbound traffic in an encrypted tunnel using complex cryptographic algorithms (like AES-256 or ChaCha20). This means the CPU on your device must encrypt every single packet before sending it, and the VPN server must decrypt it before forwarding it to the internet. This constant mathematical processing introduces significant computational latency. A standard proxy, by contrast, is a simple relay—it strips your IP address and forwards the packet data as-is without modifying or encrypting the payload, eliminating that heavy processing overhead.",
      "opts": [
        "Proxies use hardware acceleration on client machines by default",
        "Proxies completely eliminate the network handshaking process",
        "Proxies compress all payload data using proprietary lossless algorithm",
        "Proxies do not subject data packets to heavy encryption and decryption algorithms"
      ],
      "topic": "Application Architecture",
      "correct": 3,
      "acronyms": [
        "AES",
        "IPsec",
        "VPN"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Proxies are purely software configurations or application extensions. They do not hook into or leverage specialized hardware acceleration components on your computer. If anything, it is actually VPN protocols (like IPsec) that frequently utilize specialized CPU instructions (such as Intel AES-NI) to speed up hardware-level encryption, but even with this acceleration, the cryptographic process is still heavier than a proxy's simple forwarding mechanism.",
        "1": "Network handshakes are a fundamental requirement of the TCP protocol to establish a reliable connection. When you use a proxy, your device must still perform a TCP handshake with the proxy server, and the proxy server must perform another TCP handshake with the destination website. Proxies do not eliminate handshakes; they merely handle the application routing.",
        "2": "Standard proxies do not compress or alter the data payloads of your traffic; they pass them through exactly as received. While some highly specialized \"optimizing web proxies\" can compress basic text assets (like HTML or CSS), they do not use proprietary algorithms to compress all payload data by default. The speed advantage of a generic proxy comes from skipping encryption, not from data compression.",
        "3": ""
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-09T15:09:12.547+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m717",
    "action": "upsert",
    "payload": {
      "q": "Which cryptographic concept ensures that the compromise of a long-term private key does not allow an attacker to decrypt past session traffic?",
      "ch": "1",
      "id": "m717",
      "exp": "PFS uses unique, ephemeral session keys that are discarded after use, isolating each session's security.",
      "opts": [
        "Perfect Forward Secrecy",
        "Non-repudiation",
        "Key stretching",
        "Certificate pinning"
      ],
      "topic": "Cryptography Basics",
      "correct": 0,
      "acronyms": [
        "CA",
        "MITM",
        "PFS"
      ],
      "difficulty": "easy",
      "wrongFeedback": {
        "0": "",
        "1": "This is a property provided by digital signatures (using a private key to \"sign\" a message), which proves the origin of the message. It is entirely unrelated to the secrecy or future-decryption risks of encrypted network traffic.",
        "2": "Key stretching is focused purely on password hashing and protecting user credentials at rest. It has nothing to do with preventing the decryption of past network session traffic if a server's private key is compromised.",
        "3": "Certificate pinning is designed to prevent Man-in-the-Middle (MitM) attacks by ensuring an attacker cannot intercept traffic using a fraudulent certificate issued by a compromised CA. It does not protect historical traffic; if an attacker steals the actual server private key, certificate pinning will not stop them from decrypting past data they already recorded off the wire."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-11T15:40:03.382+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m718",
    "action": "upsert",
    "payload": {
      "q": "A security analyst reviews a network log and observes a host broadcasting a request to dynamically lease an IP address, subnet mask, and default gateway. Which of the following protocols is generating this traffic?",
      "ch": "3",
      "id": "m718",
      "exp": "Correct. DHCP automatically assigns IP addresses, subnet masks, default gateways, and DNS server addresses to hosts on a network using a four-step process known as DORA (Discover, Offer, Request, Acknowledge). Security+ objectives highlight that standard DHCP is unencrypted and vulnerable to attacks like DHCP snooping or starvation.",
      "opts": [
        "DHCP",
        "DNS",
        "LDAP",
        "SNMP"
      ],
      "topic": "Network Infrastructure",
      "correct": 0,
      "acronyms": [
        "DHCP",
        "LDAP",
        "UDP"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "",
        "1": "Incorrect. DNS resolves human-readable domain names (like example.com) into machine-readable IP addresses. It operates using a query/response model (typically over UDP port 53) rather than leasing local network configurations like IP addresses or gateways.",
        "2": "Incorrect. LDAP is used to query and manage directory services data, such as user accounts, credentials, and permissions within a domain (like Active Directory). It does not handle IP address assignment.",
        "3": "Incorrect. SNMP is used for monitoring and managing network devices (like routers and switches) by collecting status metrics and sending alerts (traps). It is not involved in dynamically provisioning host IP configurations."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-12T14:57:22.962+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m719",
    "action": "upsert",
    "payload": {
      "q": "Which component of the FIDO2 project serves as the standard web API that allows browsers to communicate with a Relying Party (RP) for public-key authentication?",
      "ch": "4",
      "id": "m719",
      "exp": "This is the W3C standard JavaScript API built directly into modern browsers. It allows web applications (the Relying Parties) to leverage public-key cryptography for secure, passwordless authentication.",
      "opts": [
        "CTAP2",
        "SAML",
        "OAuth",
        "WebAuthn"
      ],
      "topic": "Security Controls",
      "correct": 3,
      "acronyms": [
        "API",
        "IdP",
        "OAuth",
        "SAML",
        "SSO"
      ],
      "difficulty": "hard",
      "wrongFeedback": {
        "0": "This is the other half of FIDO2, but its job is different. It is the protocol that allows an external hardware authenticator (like a YubiKey or a smartphone over Bluetooth/NFC) to talk to your local device or browser. It doesn't talk directly to the cloud web server (Relying Party).",
        "1": "This is an older, XML-based standard used for federated identity and Single Sign-On (SSO) across different corporate domains. It passes authentication tokens between an Identity Provider (IdP) and a Service Provider (SP), rather than handling local public-key browser authentication.",
        "2": "This is an authorization framework rather than an authentication protocol. It uses tokens to grant a third-party application limited access to a user's resources (e.g., \"Sign in with Google\" giving an app access to your calendar) without exposing user credentials.",
        "3": ""
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-13T09:32:05.295+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m720",
    "action": "upsert",
    "payload": {
      "q": "An administrator is deploying FIDO2-compliant external USB security keys for passwordless authentication to an enterprise web portal.\n\nWhich of the following correctly pairs the protocol used for the browser-to-server communication with the protocol used for the USB key-to-device communication respectively?",
      "ch": "3",
      "id": "m720",
      "exp": "Under the FIDO2 architecture, WebAuthn is the W3C standard API built into the browser that allows web applications (the Relying Party server) to request cryptographic credentials from the client device. Meanwhile, CTAP2 (Client-to-Authenticator Protocol 2) is the specific protocol that enables an external roaming authenticator (like a USB security key) to communicate locally with the client OS/browser.",
      "opts": [
        "WebAuthn ; CTAP2",
        "CTAP2; WebAuthn",
        "SAML, OAuth",
        "OAuth, SAML"
      ],
      "topic": "Security Architecture",
      "correct": 0,
      "acronyms": [
        "API",
        "OAuth",
        "SAML",
        "SSO"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "",
        "1": "Incorrect because it flips the roles of the two protocols. CTAP2 cannot communicate over the internet directly with a web server; it is strictly a local protocol. WebAuthn operates at the application/browser layer, not the hardware layer.",
        "2": "incorrect because SAML and OAuth are federated identity and authorization frameworks. While SAML allows Single Sign-On (SSO) across enterprise domains and OAuth handles token-based access delegation, neither handles the local public-key or hardware-level authentication native to FIDO2 passwordless setups.",
        "3": "Incorrect because SAML and OAuth are federated identity and authorization frameworks. While SAML allows Single Sign-On (SSO) across enterprise domains and OAuth handles token-based access delegation, neither handles the local public-key or hardware-level authentication native to FIDO2 passwordless setups."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-14T04:34:35.704+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m721",
    "action": "upsert",
    "payload": {
      "q": "An enterprise suffers a high-volume man-in-the-middle (MitM) reverse-proxy phishing attack. Users were tricked into visiting a malicious look-alike domain that successfully harvested session cookies from users authenticating with traditional SMS MFA. However, users authenticating via FIDO2 passkeys were completely unaffected.\n\nWhich mechanism inherent to FIDO2 structurally prevented this credential theft?",
      "ch": "3",
      "id": "m721",
      "exp": "This targets the concept of Origin Binding. When a FIDO2 credential is created, the private key is tied strictly to the specific domain name (it-secure.com). During a proxy attack, the user's browser sees that the current address bar says 1f-secure.com. Because the domain doesn't match the origin bound to the key, the browser's WebAuthn API refuses to pass the authentication challenge to the authenticator. The user cannot accidentally hand over a signed response to the fake proxy site.",
      "opts": [
        "Asymmetric public keys cannot be reverse-engineered by a proxy.",
        "CTAP2 drops the connection when a non-standard network gateway is detected",
        "Cryptographic assertions are tied mathematically to the browser’s origin URL.",
        "WebAuthn encrypts the session token locally using a hardware security chip."
      ],
      "topic": "Security Architecture",
      "correct": 2,
      "acronyms": [
        "API",
        "MFA",
        "MITM"
      ],
      "difficulty": "hard",
      "wrongFeedback": {
        "0": "While asymmetric cryptography protects against database breaches, it alone doesn't prevent a proxy attack. If a user could be tricked into signing a challenge for the wrong site, the proxy could just forward that valid signature to the real site to log in. Origin binding is what stops the signing from happening.",
        "1": "CTAP2 operates entirely locally between your security device and your computer (via USB/NFC/Bluetooth). It has no awareness of network layers, routing protocols, or remote gateways.",
        "2": "",
        "3": "WebAuthn handles the authentication request, but it does not encrypt or protect session tokens. Session cookies/tokens are still generated by the web server after FIDO2 completes its verification process."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-14T04:50:42.698+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m722",
    "action": "upsert",
    "payload": {
      "q": "An administrator wants to configure an automated threat intelligence system where a security appliance can natively download and parse structured descriptions of threat actor motivations and malware behaviors directly from an external vendor.\n\nWhich of the following standards should the administrator ensure the data format uses, and which protocol will transport it over HTTPS?",
      "ch": "4",
      "id": "m722",
      "exp": "STIX defines the data schema (the structured JSON/XML vocabulary representing threat actors, TTPs, and targets). TAXII is the application-layer transport mechanism that establishes the HTTPS secure exchange sessions to move that STIX data from machine to machine.",
      "opts": [
        "TAXII formats the data, and STIX transports it.",
        "OpenIOC formats the data, and SCAP transports it.",
        "STIX formats the data, and TAXII transports it.",
        "SCAP formats the data, and OpenIOC transports it."
      ],
      "topic": "Security Monitoring",
      "correct": 2,
      "acronyms": [
        "STIX",
        "TAXII"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "This option completely flips the definitions. TAXII cannot format raw threat descriptions; it is strictly a network transport protocol. STIX is a language schema; it possesses no built-in network routing or session transport capabilities.",
        "1": "OpenIOC is a format for recording technical host artifacts (like hashes or registry keys), but SCAP is entirely the wrong transport mechanism. SCAP is a protocol used internally to audit local system configurations against compliance benchmarks (like CIS standards), not to route intelligence feeds over the interne",
        "2": "",
        "3": "While SCAP is technically a data formatting standard, it formats system configurations and local vulnerabilities (like checking if your password policy requires 14 characters). It does not format threat intelligence data like actor motivations, campaign histories, or TTPs. OpenIOC (Open Indicators of Compromise) is an XML-based data format used to write down specific file hashes or registry paths. It is a static file structure, not a network transport protocol, so it cannot move data across the network over HTTPS."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-14T08:07:47.53+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m723",
    "action": "upsert",
    "payload": {
      "q": "An analyst is reviewing a web-based attack vector where a user is tricked into executing unwanted actions on a web application in which they are currently authenticated. How does the malicious external site successfully carry out this attack?",
      "ch": "2",
      "id": "m723",
      "exp": "Correct: Cross-Site Request Forgery (CSRF) relies on the browser's core behavior of automatically attaching stored session cookies, credentials, or session states to any request directed toward a specific domain, allowing the attacker to forge unauthorized commands on behalf of the victim",
      "opts": [
        "By directly stealing and reading the target user's session cookies or authentication tokens using malicious JavaScript hosted on the attacker's domain.",
        "By exploiting the browser's automatic inclusion of credentials (such as cookies or HTTP authentication) in cross-origin requests sent to the vulnerable target application.",
        "By intercepting network traffic via an on-path position to read and modify the legitimate request headers between the victim's browser and the web server.",
        "By injecting a malicious Structured Query Language (SQL) statement into the web application's input fields to force backend database administrative execution."
      ],
      "topic": "Application Vulnerabilities",
      "correct": 1,
      "acronyms": [
        "CSRF",
        "SQLi",
        "XSS"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Incorrect: Stealing session tokens directly via JavaScript is the primary mechanism of Cross-Site Scripting (XSS), not Cross-Site Request Forgery (CSRF). CSRF exploits the application's trust in the user, not by reading secrets, but by forcing the browser to issue authenticated requests.",
        "1": "",
        "2": "Incorrect: Intercepting and reading traffic mid-stream describes an on-path (adversary-in-the-middle) attack. CSRF does not require the attacker to intercept live network traffic; instead, it tricks the victim's browser into launching the requests willingly.",
        "3": "Incorrect: Injecting database commands refers to SQL Injection (SQLi), which targets database logic vulnerabilities rather than exploiting a web application's trust in a user's active session state."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T03:50:40.959+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m724",
    "action": "upsert",
    "payload": {
      "q": "During a corporate lawsuit involving intellectual property theft, a court orders an enterprise to preserve and produce specific electronically stored information (ESI). The legal and IT teams work together to systematically locate, collect, preserve, and review the required data while maintaining its legal admissibility. Which of the following processes or concepts is being executed?",
      "ch": "4",
      "id": "m724",
      "exp": "Correct: E-discovery (Electronic Discovery) refers to the process of identifying, collecting, preserving, and producing electronically stored information (ESI) in response to a legal request, litigation, or investigation.",
      "opts": [
        "Chain of custody",
        "Legal hold",
        "Forensic imaging",
        "E-discovery"
      ],
      "topic": "Digital Forensics",
      "correct": 3,
      "acronyms": [],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Incorrect: Chain of custody refers strictly to the chronological documentation and paper trail showing the seizure, custody, control, transfer, analysis, and disposition of physical or electronic evidence to ensure it has not been tampered with. While related, it is not the overall process of locating and producing data for legal disclosure.",
        "1": "Incorrect: A legal hold is a directive sent by an organization's legal counsel to preserve relevant data and suspend normal document retention/destruction policies. It is a component or prerequisite of e-discovery, but it does not represent the broader overall discovery and production process itself.",
        "2": "Incorrect: Forensic imaging is the act of creating a bit-stream, sector-by-sector copy of a digital storage medium for deep technical examination, which is a specialized data acquisition technique rather than the end-to-end legal discovery workflow.",
        "3": ""
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T04:03:18.737+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m725",
    "action": "upsert",
    "payload": {
      "q": "A security manager is briefing the executive board on broad, macro-level global cyber trends and geopolitical threat actor motivations, while the Security Operations Center (SOC) team focuses on parsing immediate Indicators of Compromise (IoCs) like specific file hashes and IP addresses. Which of the following categorizes the type of threat intelligence the security manager is presenting to the board?",
      "ch": "3",
      "id": "m725",
      "exp": "Correct: Strategic threat intelligence is high-level information tailored for executive leadership and board members. It covers macro-level trends, long-term industry risks, threat actor motivations, and geopolitical context to help guide high-level security investments and policies.",
      "opts": [
        "Tactical threat intelligence",
        "Operational threat intelligence",
        "Behavioral threat intelligence",
        "Strategic threat intelligence"
      ],
      "topic": "Security Operations",
      "correct": 3,
      "acronyms": [
        "SOC"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Incorrect: Tactical threat intelligence focuses on the immediate, technical details of an attack (such as specific IoCs, malware signatures, or tools currently being used), which is what the SOC team uses for day-to-day triage",
        "1": "Incorrect: Operational threat intelligence focuses on specific upcoming or ongoing campaigns, attacker TTPs (Tactics, Techniques, and Procedures), and the intent behind specific attacks, usually aimed at incident responders and managers.",
        "2": "Incorrect: Behavioral threat intelligence is a distractor term and is not recognized as one of the core foundational tiers (strategic, operational, tactical) defined in standard security frameworks like CompTIA.",
        "3": ""
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T04:07:18.785+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m726",
    "action": "upsert",
    "payload": {
      "q": "A company implements cross-domain Single Sign-On (SSO) allowing employees to access a partner's cloud portal using corporate credentials. During authentication, the Identity Provider (IdP) issues a digitally signed XML document containing user authorization claims to the Service Provider (SP). Which protocol is being utilized?",
      "ch": "4",
      "id": "m726",
      "exp": "Correct: SAML (Security Assertion Markup Language) is an XML-based open standard specifically designed for exchanging authentication and authorization data across security domains, commonly used for web-based federated SSO.",
      "opts": [
        "SAML",
        "RADIUS",
        "LDAP",
        "Kerberos"
      ],
      "topic": "Identity Management",
      "correct": 0,
      "acronyms": [
        "AAA",
        "IdP",
        "KDC",
        "LDAP",
        "SAML",
        "SSO"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "",
        "1": "Incorrect: RADIUS is a networking protocol used for centralized Authentication, Authorization, and Accounting (AAA), typically applied to network access (like VPNs, Wi-Fi, or switch management), not web-based federated SSO applications.",
        "2": "Incorrect: LDAP is a directory access protocol used to query and manage hierarchical user data (like Microsoft Active Directory) within an internal directory structure, not a token-based federation protocol.",
        "3": "Incorrect: Kerberos is a ticket-based authentication protocol designed for trusted local network environments (intranets), relying on a Key Distribution Center (KDC) rather than cross-domain browser-based XML assertions."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T04:23:41.674+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m727",
    "action": "upsert",
    "payload": {
      "q": "A mid-sized enterprise is hardening its corporate wireless network. The security architect rejects using a Pre-Shared Key (PSK) in favor of an authentication framework that requires individual user credentials, integrates with the corporate Active Directory, and dynamically generates unique session encryption keys for each connected client. Which of the following technologies has the architect implemented?",
      "ch": "3",
      "id": "m727",
      "exp": "Correct: IEEE 802.1X (often paired with EAP and a backend RADIUS/AAA server) provides enterprise-grade wireless security. It authenticates individual users against a central directory and uses the 4-way handshake to derive unique, dynamic encryption keys per session.",
      "opts": [
        "WPA3-Personal with SAE (Simultaneous Authentication of Equals)",
        "Captive portal with MAC address filtering and a shared guest voucher",
        "IEEE 802.1X leveraging an external RADIUS server",
        "WPA2-Enterprise configured with a static group master key (GMK)"
      ],
      "topic": "Network Architecture",
      "correct": 2,
      "acronyms": [
        "AAA",
        "EAP",
        "MAC"
      ],
      "difficulty": "hard",
      "wrongFeedback": {
        "0": "Incorrect: WPA3-Personal still relies on a shared secret (the PSK/passphrase) configured across clients, which lacks individual user accountability and centralized directory integration.",
        "1": "Incorrect: Captive portals and MAC filtering offer weak, superficial access control rather than robust cryptographic authentication and dynamic key generation.",
        "2": "",
        "3": "Incorrect: While WPA2-Enterprise uses 802.1X, a static Group Master Key (GMK) is used to encrypt broadcast/multicast traffic for all users on a network, not the unique unicast session keys generated for individual clients."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T04:32:22.757+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m728",
    "action": "upsert",
    "payload": {
      "q": "An enterprise is designing a high-security application that needs to securely generate, store, and manage cryptographic keys on a dedicated physical hardware appliance separate from the main server operating system. Which of the following hardware solutions should the security architect deploy?",
      "ch": "3",
      "id": "m728",
      "exp": "Correct: A Hardware Security Module (HSM) is a dedicated physical computing device designed specifically for the management, processing, and secure storage of digital keys and cryptographic operations.",
      "opts": [
        "Secure enclave",
        "Network Intrusion Prevention System (NIPS)",
        "Hardware Security Module (HSM)",
        "Software-defined perimeter (SDP) gateway"
      ],
      "topic": "Cryptography & PKI",
      "correct": 2,
      "acronyms": [
        "HSM",
        "NIPS"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Incorrect: A secure enclave (or Trusted Execution Environment) is an isolated area within a main processor or system-on-chip used to protect code and data for a specific device or application, rather than being a dedicated physical standalone cryptographic hardware appliance.",
        "1": "Incorrect: A NIPS is a security control used to inspect and block network traffic anomalies, not a device for storing cryptographic keys.",
        "2": "",
        "3": "Incorrect: An SDP gateway is an access control architecture used to hide infrastructure and enforce zero-trust network boundaries, not a key management appliance."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T04:35:58.448+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m729",
    "action": "upsert",
    "payload": {
      "q": "A systems administrator needs to perform remote maintenance and configuration updates on high-value backend servers residing in an isolated, highly secure internal zone. Direct administrative access from the corporate network is blocked. Which of the following architectural components should be utilized to securely manage these systems?",
      "ch": "3",
      "id": "m729",
      "exp": "Correct: A jump server (or bastion host) is a hardened, tightly controlled intermediate system used to access and manage devices in a separate security zone, providing centralized logging, auditing, and authentication for administrative tasks.",
      "opts": [
        "Forward proxy",
        "Reverse proxy",
        "Jump server",
        "Content filter"
      ],
      "topic": "Network Architecture",
      "correct": 2,
      "acronyms": [
        "TLS"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Incorrect: A forward proxy sits between internal clients and external destinations (the internet) to control outbound web traffic or cache content, not to manage internal administrative access.",
        "1": "Incorrect: A reverse proxy sits in front of web servers to handle incoming client traffic, offload SSL/TLS, and provide load balancing, rather than facilitating administrative sessions.",
        "2": "",
        "3": "Incorrect: A content filter inspects web traffic and restricts access to specific URLs or file types, which is unrelated to administrative server access."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T04:37:56.622+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m730",
    "action": "upsert",
    "payload": {
      "q": "An IT administrator suggests configuring wireless access points to permit connections only from a pre-approved list of device physical addresses, arguing it provides strong security. Why is this security measure considered extremely weak and ineffective when used alone?",
      "ch": "2",
      "id": "m730",
      "exp": "Correct: MAC filtering is fundamentally flawed because physical hardware addresses are broadcast in plaintext during standard wireless management frames. An attacker can easily sniff a legitimate client's MAC address and alter their own network card to mimic (spoof) it, effortlessly bypassing the restriction.",
      "opts": [
        "MAC addresses are transmitted in plaintext over the air and can be easily observed and spoofed by an attacker.",
        "MAC addresses are encrypted using weak algorithms that can be easily cracked via rainbow tables.",
        "MAC filtering introduces massive latency issues that degrade wireless bandwidth performance.",
        "MAC filtering causes frequent cryptographic hash collisions among modern enterprise clients.MAC filtering causes frequent cryptographic hash collisions among modern enterprise clients."
      ],
      "topic": "Network Security",
      "correct": 0,
      "acronyms": [
        "MAC"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "",
        "1": "Incorrect: MAC addresses are identifiers, not encrypted keys or hashes, so they are not cracked via rainbow tables.",
        "2": "Incorrect: Checking a static list introduces negligible performance overhead; the failure of MAC filtering is due to lack of confidentiality and ease of impersonation, not network latency.",
        "3": "Incorrect: MAC addresses do not experience cryptographic hash collisions in this context."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T04:42:06.463+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m731",
    "action": "upsert",
    "payload": {
      "q": "A security policy mandates that all enterprise workstations must be encrypted using AES-256. However, an essential research system requires a specialized legacy operating system that breaks compatibility with the standard full-disk encryption tool, and an immediate fix is unavailable. Under which condition should the organization formally engage in a risk exception process?",
      "ch": "5",
      "id": "m731",
      "exp": "Correct: A risk exception (or variance/waiver) is formally requested when operational constraints prevent strict adherence to a security baseline. It requires evaluating the risk, implementing compensating controls, and setting a strict expiration date to re-evaluate compliance.",
      "opts": [
        "When the risk level is deemed low enough to completely ignore the policy without documentation.",
        "When business operational needs temporarily prevent compliance, requiring a formal authorization process",
        "When the cost of implementing the encryption tool exceeds the total enterprise operating budget for the fiscal year.",
        "When management decides to permanently transfer the operational liability to an external hardware vendor."
      ],
      "topic": "Risk Management",
      "correct": 1,
      "acronyms": [
        "AES"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Incorrect: Ignoring compliance without formal authorization bypasses governance oversight and introduces unaccounted vulnerabilities.",
        "1": "",
        "2": "Incorrect: Budget constraints alone across the entire enterprise reflect a broader resource allocation decision rather than an isolated, targeted operational risk exception workflow.",
        "3": "Incorrect: Operational compliance failures cannot be \"transferred\" to a hardware vendor simply through a waiver."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T04:52:20.776+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m732",
    "action": "upsert",
    "payload": {
      "q": "A Threat Intelligence Analyst is looking for a machine-readable, XML-based framework created by Mandiant to describe technical characteristics—such as file attributes, registry keys, and network artifacts—used to identify known threats.",
      "ch": "4",
      "id": "m732",
      "exp": "Correct: OpenIOC is an open-source framework created by Mandiant that uses an XML schema to define technical Indicators of Compromise (IoCs) for machine-based detection and incident response sharing.",
      "opts": [
        "STIX",
        "CVSS",
        "CVE",
        "OpenIOC"
      ],
      "topic": "Security Operations",
      "correct": 3,
      "acronyms": [
        "CVE",
        "CVSS",
        "STIX"
      ],
      "difficulty": "hard",
      "wrongFeedback": {
        "0": "Incorrect: STIX is a structured XML/JSON language designed for describing cyber threat information (actor profiles, campaigns, TTPs) more broadly than just host-based technical indicators.",
        "1": "Incorrect: CVSS is a numerical scoring system used to assess and rate the severity of computer system security vulnerabilities.",
        "2": "Incorrect: CVE is a dictionary/database that provides standardized naming conventions for publicly known cybersecurity vulnerabilities.",
        "3": ""
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T04:55:03.279+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m733",
    "action": "upsert",
    "payload": {
      "q": "During an annual enterprise risk assessment, management evaluates a newly identified low-impact vulnerability. The cost and operational disruption of fixing the issue significantly outweigh any potential financial or operational loss it could cause. Based on risk management principles, which action is most appropriate?",
      "ch": "5",
      "id": "m733",
      "exp": "Correct: Risk acceptance is chosen when the cost of implementing a control or remediation exceeds the potential impact of the risk, or when the residual risk falls well within the organization's established risk appetite and tolerance thresholds.",
      "opts": [
        "Shutting down the entire corporate network.",
        "Applying emergency patches despite operational downtime.",
        "Maintain status quo",
        "Purchasing a high-deductible insurance policy specifically for this minor vulnerability."
      ],
      "topic": "Risk Management",
      "correct": 2,
      "acronyms": [],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Incorrect: Shutting down the network is an extreme and disproportionate reaction (avoidance) for a minor, low-impact vulnerability.",
        "1": "Incorrect: Mitigating a low-risk issue when remediation costs outweigh potential losses wastes limited security resources.",
        "2": "",
        "3": "Incorrect: Insurance policies are generally not cost-effective or practical for minor, low-impact internal vulnerabilities."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T04:58:05.443+00:00"
  },
  {
    "question_kind": "mcq",
    "question_id": "m734",
    "action": "upsert",
    "payload": {
      "q": "A security engineer is optimizing a public key infrastructure (PKI) validation workflow. The engineer wants to replace the current system with a protocol that queries a real-time status directly from the Certificate Authority (CA) for a specific certificate on demand. Which technology should the engineer implement?",
      "ch": "1",
      "id": "m734",
      "exp": "Correct: OCSP (Online Certificate Status Protocol) allows clients to query the revocation status of a specific digital certificate in real time via an HTTP request, eliminating the need to download large static revocation lists.",
      "opts": [
        "Certificate Revocation List (CRL)",
        "Simple Certificate Enrollment Protocol (SCEP)",
        "Automated Certificate Management Environment (ACME)",
        "Online Certificate Status Protocol (OCSP)"
      ],
      "topic": "PKI & Certificates",
      "correct": 3,
      "acronyms": [
        "CA",
        "CRL",
        "OCSP",
        "PKI"
      ],
      "difficulty": "medium",
      "wrongFeedback": {
        "0": "Incorrect: A CRL is a digitally signed file containing a comprehensive, periodically updated list of all revoked certificates issued by a CA, which suffers from bandwidth bloat and latency as the list grows.",
        "1": "Incorrect: SCEP is a protocol used to facilitate the secure enrollment and issuance of digital certificates to network d",
        "2": "Incorrect: ACME is an automated protocol (commonly used by Let's Encrypt) for automating certificate issuance, validation, and renewal.",
        "3": ""
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-26T05:01:02.964+00:00"
  },
  {
    "question_kind": "pbq",
    "question_id": "p030",
    "action": "upsert",
    "payload": {
      "ch": "4",
      "id": "p030",
      "cat": "Digital Forensics",
      "type": "HOTSPOT",
      "title": "Identify the chain of custody violation",
      "choices": [
        "Step 1 — photographs should be taken before touching anything",
        "Step 2 — the write blocker hash should use MD5, not SHA-256",
        "Step 3 — transferring evidence without obtaining Smith's signature and documenting the handover breaks chain of custody",
        "Step 4 — the analysis should be performed on the original, not the copy"
      ],
      "correct": 2,
      "diagram": "EVIDENCE HANDLING LOG — Case #2024-001\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nStep 1: [A] Analyst Jones photographs the scene and seizes the laptop.\n        Seal: Evidence bag #EV-001. Signed: Jones. Time: 14:30.\n\nStep 2: [B] Analyst Jones creates a forensic image using write blocker.\n        Hash (SHA-256) computed and documented. Signed: Jones. Time: 15:45.\n\nStep 3: [C] Image transferred to supervisor Smith for analysis review.\n        No signature obtained from Smith at handover. Not documented.\n\nStep 4: [D] Analyst Jones runs analysis on the forensic image copy.\n        Findings documented. Time: 17:00.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "acronyms": [
        "MD5"
      ],
      "question": "Which step contains a chain of custody violation?",
      "scenario": "Review this forensic evidence handling log and identify the step that violates chain of custody.",
      "difficulty": "easy",
      "explanation": "Chain of custody requires that EVERY transfer of evidence is documented with: who transferred it, who received it, the time and date, and both parties' signatures. Step 3 transfers the image to Smith with no signature or documentation — this creates a gap. If the evidence reaches court, the defence can argue the image could have been altered between Step 2 and Step 4 without anyone knowing.",
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-05T04:43:14.605+00:00"
  },
  {
    "question_kind": "pbq",
    "question_id": "p223",
    "action": "upsert",
    "payload": {
      "ch": "2",
      "id": "p223",
      "cat": "Network Attacks",
      "type": "DRAG & DROP",
      "items": [
        {
          "id": "i0",
          "label": "DNS Cache Poisoning",
          "explanation": "Correct because the scenario explicitly notes that the local DNS server's cache has been tampered with to map a legitimate domain to a fraudulent IP address."
        },
        {
          "id": "i1",
          "label": "MAC Flooding",
          "explanation": "Correct because flooding a switch with fake MAC addresses exhausts its CAM table memory, forcing the switch into \"fail-open\" mode where it acts like a dumb hub and broadcasts all traffic."
        },
        {
          "id": "i2",
          "label": "Replay Attack",
          "explanation": "A replay attack occurs when an attacker eavesdrops on a valid data transmission, captures it, and later re-sends (replays) it to gain unauthorized access. The key indicator here is that the attacker didn't crack the encryption or steal the password—they simply reused a valid, recorded transaction"
        },
        {
          "id": "i3",
          "label": "DNS Tunnelling",
          "explanation": "Correct because the infected server is abusing the DNS protocol to encode and exfiltrate (send out) sensitive data using subdomains to a hacker's domain."
        }
      ],
      "title": "Network Attacks",
      "targets": [
        {
          "id": "t0",
          "label": "Users typing legitbank.com are being redirected to a malicious IP address. The local DNS server's cache contains an unauthorized pointer record."
        },
        {
          "id": "t1",
          "label": "Security logs show an infected internal server sending hundreds of outbound DNS queries to x92f1a.attacker.com containing encoded strings of sensitive customer data."
        },
        {
          "id": "t2",
          "label": "An unauthorized device has flooded a Layer 2 switch with thousands of fake MAC addresses, causing the switch to broadcast all network traffic out of every single port."
        },
        {
          "id": "t3",
          "label": "A hacker uses a wireless packet sniffer to capture an employee's encrypted badge signal transmission. Later that evening, the hacker plays back that exact signal capture to the reader to unlock the corporate server room door."
        }
      ],
      "acronyms": [],
      "question": "",
      "scenario": "Identify the correct **network attack** for each scenario",
      "difficulty": "easy",
      "explanation": "Solutions are stated above for every option",
      "beyondTextbook": false,
      "correctMapping": {
        "i0": "t0",
        "i1": "t2",
        "i2": "t3",
        "i3": "t1"
      }
    },
    "status": "active",
    "updated_at": "2026-07-05T08:22:59.74+00:00"
  },
  {
    "question_kind": "pbq",
    "question_id": "p224",
    "action": "upsert",
    "payload": {
      "ch": "1",
      "id": "p224",
      "cat": "Cryptography Basics",
      "type": "SCENARIO",
      "title": "Cryptographic Concepts",
      "choices": [
        "Implement Key Stretching by deploying PBKDF2",
        "Implement Certificate Pinning by hardcoding the server's public key hash in the client application.",
        "Implement Perfect Forward Secrecy (PFS) by configuring ECDHE.",
        "Implement Data Integrity by switching the hashing algorithm to SHA-3."
      ],
      "correct": 2,
      "acronyms": [
        "PFS",
        "RSA",
        "TLS"
      ],
      "question": "Which of the following cryptographic concepts or techniques should the engineer implement to meet the policy requirement, and which algorithm variant would achieve it?",
      "scenario": "A security engineer is auditing the Transport Layer Security (TLS) configuration of a critical financial web application. The company’s risk management policy states that the compromise of a long-term master private key must not allow an attacker to decrypt historical network traffic that was captured and archived in the past.\nDuring the assessment, the engineer observes that the web server is currently configured to use standard RSA key exchange, where the server’s static private key is used to encrypt and transport the symmetric session keys.\n\n**\n\n\n\n\n\n**",
      "difficulty": "medium",
      "explanation": "Perfect Forward Secrecy (PFS) is the exact cryptographic concept required here. PFS ensures that a compromise of the server's long-term private key does not compromise past session keys. By switching from standard RSA key exchange to ECDHE (Elliptic Curve Diffie-Hellman Ephemeral), the server and client will generate temporary, unique keys for every single session. Once the session ends, those ephemeral keys are destroyed. An attacker who steals the master private key in the future will have no way to decrypt past traffic because they lack the unique, discarded session keys.",
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-11T15:43:51.216+00:00"
  },
  {
    "question_kind": "pbq",
    "question_id": "p225",
    "action": "upsert",
    "payload": {
      "ch": "4",
      "id": "p225",
      "cat": "Identity Management",
      "type": "SCENARIO",
      "title": "Identity and Access Management",
      "choices": [
        "1. SAML, 2. OAuth",
        "1. OIDC, 2. SAML",
        "1. LDAP, 2. Kerberos",
        "1. OAuth, 2. WenAuthn"
      ],
      "correct": 0,
      "acronyms": [
        "API",
        "LDAP",
        "OAuth",
        "OIDC",
        "SaaS",
        "SAML",
        "SSO"
      ],
      "question": "Which of the following combinations of standards should the security architect select to meet these requirements?",
      "scenario": "A security architect is designing an identity and access management solution for a multinational corporation. The project has two core requirements:\n\n**1.** Enable corporate employees to use their existing Microsoft Entra ID (Active Directory) credentials to log directly into a third-party, enterprise-hosted HR SaaS application.\n**2**. Allow a newly developed corporate mobile application to securely access a user's calendar data hosted on a separate internal company API without requiring the user to share their password with the mobile app.",
      "difficulty": "medium",
      "explanation": "**Requirement 1** is a classic enterprise Single Sign-On (SSO) and federation scenario. It connects corporate identity directory infrastructure to a third-party enterprise SaaS platform. SAML (Security Assertion Markup Language) is the industry-standard federation protocol designed exactly for this enterprise-to-SaaS browser-based SSO.\n**Requirement 2** is a classic API delegation and mobile app authorization scenario. The mobile application needs limited permission to read calendar API data on behalf of the user, but it must not handle or store the user's password. OAuth (specifically OAuth 2.0) is the standard framework designed specifically to issue scoped access tokens for API and mobile access.",
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-14T07:04:59.816+00:00"
  },
  {
    "question_kind": "pbq",
    "question_id": "p226",
    "action": "upsert",
    "payload": {
      "ch": "4",
      "id": "p226",
      "cat": "Security Operations",
      "type": "SCENARIO",
      "title": "Automated Interoperability and Security Content Standardization",
      "choices": [
        "**STIX/TAXII** (Structured Threat Intelligence Expression / Trusted Automated Exchange of Intelligence information)",
        "**SOAR **(Security Orchestration, Automation and Response)",
        "**OCSF** (Open Cybersecurity Scheme Framework)",
        "**SCAP** (Security Content Automation Protocol)"
      ],
      "correct": 3,
      "acronyms": [
        "CVE",
        "CVSS",
        "SIEM",
        "SOAR",
        "STIX",
        "TAXII"
      ],
      "question": "Which of the following should the security architect require all three tools to support to enable this automated, standardized format for vulnerability and configuration data?",
      "scenario": "A security architect at an enterprise software firm is building an automated compliance pipeline. The team needs to connect three separate systems: an external threat intelligence aggregator, an internal vulnerability scanner, and a configuration compliance engine that audits systems against CIS Benchmarks.\n\n\nTo automate remediation, the team wants these systems to natively interoperate without writing custom parsers. When a new system vulnerability or a misconfiguration is discovered, the systems must automatically agree on the exact software product affected, the specific registry or configuration setting at fault, and the standard severity score of the risk.",
      "difficulty": "medium",
      "explanation": "SCAP is specifically designed to standardize how we represent system configurations (CCE), software vulnerabilities (CVE), product names (CPE), and severity scoring (CVSS). This \"common language\" is what allows a scanner, an asset database, and a compliance engine to instantly agree on the state of a system's security.",
      "wrongFeedback": {
        "0": "STIX/TAXII is a highly tested standard on the Security+ exam for sharing data, but it is used exclusively for Threat Intelligence (such as sharing Indicators of Compromise, threat actor profiles, and IP reputations). It does not contain the configuration baselines (like CIS Benchmarks) or OS-level software checks needed for configuration auditing.",
        "1": "SOAR is the correct category of technology used to execute automated remediation playbooks. However, SOAR is the orchestration engine that runs the scripts; it is not a standardized data representation protocol or schema. The question asks for the standard format the tools must support to understand each other's data natively.",
        "2": "OCSF is a real, modern open-source schema designed to standardize security data. However, OCSF focuses strictly on log and event normalization (making sure firewalls, EDRs, and cloud logs look the same in a SIEM). It does not standardise vulnerability assessment checks or system hardening configurations."
      },
      "beyondTextbook": false
    },
    "status": "active",
    "updated_at": "2026-07-14T07:51:16.584+00:00"
  }
];

export const EDITORIAL_CUTOFF = "2026-09-05T13:32:13Z";
export function isSnapshotDisabled(id, kind) {
  return PUBLISHED_CONTENT_SNAPSHOT.some(row => row.question_id === id && row.question_kind === kind && row.action === "disable");
}
export function isCapturedOverride(row) {
  return PUBLISHED_CONTENT_SNAPSHOT.some(saved => saved.question_id === row.question_id
    && saved.question_kind === row.question_kind && saved.action === row.action && saved.updated_at === row.updated_at);
}
export function preferReviewedPbq(local, remote) {
  // Preserve entitlement metadata, but do not let older database copies undo
  // this complete content revision. Later admin publications remain editable.
  if (!remote) return local;
  if (local.editorialReviewed && (!remote.remoteUpdatedAt || Date.parse(remote.remoteUpdatedAt) <= Date.parse(EDITORIAL_CUTOFF))) {
    return {...local, is_pro: remote.is_pro ?? local.is_pro};
  }
  return remote;
}
export function mergePublishedSnapshot(authored, kind, {includeDisabled = false} = {}) {
  const byId = new Map(authored.map(question => [question.id, question]));
  for (const row of PUBLISHED_CONTENT_SNAPSHOT.filter(row => row.question_kind === kind)) {
    if (row.action === "disable") { if (!includeDisabled) byId.delete(row.question_id); }
    else byId.set(row.question_id, {...byId.get(row.question_id), ...row.payload, id:row.question_id});
  }
  return [...byId.values()];
}
