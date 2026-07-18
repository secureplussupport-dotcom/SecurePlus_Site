// Original lessons created after reviewing the supplied printer-friendly guide
// for curriculum gaps. The guide is not reproduced; claims below were rewritten
// and checked against current standards and primary technical references.

export const PRINTER_GUIDE_DEEP_DIVES = [
  {
    id: "crypto-modes-pqc-transition",
    chapter: 1,
    category: "Cryptography",
    title: "Cipher Modes, Hybrid Encryption, and Post-Quantum Transition",
    subtitle: "Choose the construction that provides the required property, then plan for algorithms and data that will outlive today's keys.",
    summary: "Modern cryptography combines specialized primitives. Symmetric encryption protects bulk data, public-key mechanisms establish keys or signatures, hashes support integrity constructions, and secure protocols define how every piece is used together.",
    minutes: 15,
    difficulty: "Applied",
    aliases: ["symmetric encryption", "asymmetric encryption", "public key cryptography", "hybrid encryption", "stream cipher", "block cipher", "mode of operation", "ECB", "CBC", "CTR", "GCM", "GMAC", "AEAD", "nonce", "initialization vector", "IV", "digital signature", "key agreement", "forward secrecy", "crypto agility", "post-quantum cryptography", "PQC", "ML-KEM", "ML-DSA", "SLH-DSA", "harvest now decrypt later"],
    objectives: [
      "Separate encryption, key establishment, hashing, and digital signatures.",
      "Explain why a secure block cipher still needs a correctly used mode and nonce strategy.",
      "Build a practical post-quantum transition around inventory, crypto agility, and data lifetime.",
    ],
    sections: [
      {
        title: "Hybrid systems use each primitive for its strength",
        table: {
          columns: ["Primitive", "Primary job", "Important boundary"],
          rows: [
            ["Symmetric encryption", "Efficiently protect bulk data with a shared secret", "Key distribution and nonce handling remain critical"],
            ["Key agreement or KEM", "Establish a shared secret across an untrusted channel", "Authentication is separate unless the protocol binds identities"],
            ["Digital signature", "Authenticate a signer and detect modification", "Verification does not make the signed statement truthful"],
            ["Cryptographic hash", "Produce a fixed-length digest", "An unkeyed hash alone does not authenticate a sender"],
          ],
        },
      },
      {
        title: "The mode determines what a block cipher delivers",
        body: [
          "AES is a block cipher, not a complete message-protection design. ECB independently encrypts equal blocks and can reveal repeated patterns, so it is unsuitable for ordinary structured data. CBC can provide confidentiality with a correctly generated IV, padding, and a separate integrity construction, but combining these pieces safely is protocol work rather than an improvised application feature.",
          "GCM is an authenticated-encryption mode that can protect confidentiality and integrity while authenticating selected associated data. Reusing a nonce with the same key can catastrophically weaken GCM. CTR mode and stream ciphers have a similar reuse danger because repeating a keystream exposes relationships between plaintexts. Nonces need not always be secret, but their uniqueness or unpredictability requirements must follow the chosen construction.",
        ],
      },
      {
        title: "Signatures are not simply private-key encryption",
        body: [
          "A useful exam shortcut says the private key signs and the public key verifies. Describing every signature as ‘encrypting with the private key’ is misleading: signature schemes define their own generation and verification operations, often over a digest and encoded structure. Confidentiality still uses an approved encryption or key-establishment design.",
          "Ephemeral key agreement can provide forward secrecy: later compromise of a long-term authentication key should not reveal previously established session secrets when the protocol, implementation, and ephemeral-key disposal are sound. A certificate authenticates a public key and identity binding; it does not create forward secrecy by itself.",
        ],
      },
      {
        title: "Post-quantum migration begins before a cryptographically relevant quantum computer",
        body: [
          "NIST standardized ML-KEM for key establishment, ML-DSA for digital signatures, and SLH-DSA as a stateless hash-based signature standard. These are different jobs: ML-KEM is not a signature algorithm, and ML-DSA is not bulk encryption.",
          "Start with a cryptographic inventory: algorithms, libraries, certificates, protocols, keys, owners, data lifetimes, and dependencies. prioritize information that must remain confidential for many years because attackers can capture ciphertext now and attempt decryption later. Crypto agility means algorithms and parameters can be replaced through tested, governed interfaces—not that systems automatically become quantum-safe.",
        ],
      },
    ],
    traps: [
      "AES without a secure mode, nonce strategy, key lifecycle, and authentication design is not a complete solution.",
      "Digital signatures prove control of a signing key and message integrity; they do not prove the signed content is factually correct.",
      "Post-quantum key establishment and post-quantum signatures are separate capabilities.",
    ],
    check: {
      question: "Two AES-GCM messages reuse the same nonce under the same key. Why is this serious?",
      answer: "GCM requires nonce uniqueness for a key. Reuse can expose relationships between plaintexts and undermine authentication, so affected keys and data must be assessed and the nonce-generation design fixed.",
    },
    sources: [
      { label: "NIST FIPS 197 — Advanced Encryption Standard", url: "https://csrc.nist.gov/pubs/fips/197/final" },
      { label: "NIST SP 800-38D — GCM and GMAC", url: "https://csrc.nist.gov/pubs/sp/800/38/d/final" },
      { label: "NIST FIPS 203 — ML-KEM", url: "https://csrc.nist.gov/pubs/fips/203/final" },
      { label: "NIST FIPS 204 — ML-DSA", url: "https://csrc.nist.gov/pubs/fips/204/final" },
      { label: "NIST FIPS 205 — SLH-DSA", url: "https://csrc.nist.gov/pubs/fips/205/final" },
    ],
  },
  {
    id: "kerberos-aaa-enterprise-auth",
    chapter: 4,
    category: "Identity & Access",
    title: "Kerberos, RADIUS, TACACS+, and Enterprise AAA",
    subtitle: "Trace credentials and tickets through the system that authenticates a user, admits a device, or controls an administrator session.",
    summary: "Enterprise authentication protocols solve related but different problems. Kerberos issues service tickets for network authentication, RADIUS commonly supports network access, and TACACS+ commonly controls administrative access to network devices.",
    minutes: 14,
    difficulty: "Applied",
    aliases: ["Kerberos", "KDC", "authentication service", "AS", "ticket-granting service", "TGS", "ticket-granting ticket", "TGT", "service ticket", "principal", "authenticator", "pass the ticket", "RADIUS", "TACACS+", "AAA", "network access server", "NAS", "LDAP bind", "SASL", "LDAPS"],
    objectives: [
      "Follow the Kerberos ticket flow without sending a reusable password to each service.",
      "Distinguish Kerberos authentication from the application's authorization decision.",
      "Choose RADIUS or TACACS+ from the access scenario rather than a memorized slogan.",
    ],
    sections: [
      {
        title: "Kerberos uses a trusted ticket service",
        body: [
          "A principal first authenticates to the Key Distribution Center's Authentication Service and receives a ticket-granting ticket. The client presents the TGT to the Ticket-Granting Service to request a service ticket for a particular service principal. The client then presents the service ticket and a fresh authenticator to that service.",
          "The KDC logically includes the Authentication Service and Ticket-Granting Service. The application server is separate. Kerberos supports single sign-on because the client can obtain additional service tickets while its TGT is valid; the user's password is not sent to every service.",
        ],
      },
      {
        title: "Tickets authenticate; applications still authorize",
        body: [
          "Kerberos primarily establishes authenticated identities and session keys. The target operating system or application still decides what the principal may do using groups, roles, ACLs, claims, or application policy. Microsoft environments may carry authorization-related information with tickets, but the final access decision remains a policy-enforcement responsibility.",
          "Kerberos depends on protected KDCs, correct service-principal configuration, reasonable clock synchronization, secure endpoints, and well-managed keys. Stolen tickets can support pass-the-ticket activity until they expire or are otherwise contained. MFA at initial sign-in does not make a stolen bearer ticket harmless.",
        ],
      },
      {
        title: "AAA protocols fit different access paths",
        table: {
          columns: ["Protocol", "Common use", "Design caution"],
          rows: [
            ["RADIUS", "Wi-Fi, VPN, and network-access authentication and policy", "Classic RADIUS does not protect the whole packet; use trusted paths or an approved protected transport"],
            ["TACACS+", "Administrative access and command authorization on network devices", "Protect the shared secret, servers, clients, and packet path; the header remains visible"],
            ["LDAP with TLS / SASL", "Directory queries and binds", "Simple binds must not expose credentials over unprotected transport"],
          ],
        },
      },
    ],
    traps: [
      "The KDC contains the AS and TGS; the application server is the ticket's destination, not a third KDC component.",
      "Kerberos authentication does not automatically grant access to every service resource.",
      "RADIUS and TACACS+ are not interchangeable solely because both can participate in AAA.",
    ],
    check: {
      question: "A user already has a TGT and wants to access a file service. What does the client request next?",
      answer: "A service ticket from the Ticket-Granting Service for the file service's principal.",
    },
    sources: [
      { label: "IETF RFC 4120 — Kerberos V5", url: "https://www.rfc-editor.org/info/rfc4120" },
      { label: "IETF RFC 2865 — RADIUS", url: "https://www.rfc-editor.org/info/rfc2865/" },
      { label: "IETF RFC 8907 — TACACS+", url: "https://www.rfc-editor.org/info/rfc8907" },
      { label: "IETF RFC 4513 — LDAP Authentication and Security", url: "https://www.rfc-editor.org/info/rfc4513" },
    ],
  },
  {
    id: "ot-iot-cyber-physical",
    chapter: 3,
    category: "Cloud & Architecture",
    title: "Operational Technology, ICS, SCADA, and IoT",
    subtitle: "Protect the physical process without applying ordinary IT changes in ways that create safety or availability failures.",
    summary: "Operational technology interacts with the physical environment. Its security programme must protect people, equipment, product quality, and reliable operation while still managing identity, segmentation, vulnerabilities, monitoring, and recovery.",
    minutes: 15,
    difficulty: "Applied",
    aliases: ["operational technology", "OT", "industrial control system", "ICS", "SCADA", "distributed control system", "DCS", "programmable logic controller", "PLC", "human-machine interface", "HMI", "safety instrumented system", "SIS", "historian", "cyber-physical system", "Internet of Things", "IoT", "embedded device", "sensor", "actuator", "industrial protocol"],
    objectives: [
      "Distinguish OT, ICS, SCADA, DCS, PLC, and IoT roles.",
      "Adapt segmentation, access, monitoring, and change control to safety and process constraints.",
      "Manage connected devices across acquisition, operation, vulnerability response, and disposal.",
    ],
    sections: [
      {
        title: "The names describe scope and function",
        table: {
          columns: ["Term", "Practical meaning", "Example"],
          rows: [
            ["OT", "Programmable systems that monitor or change the physical environment", "Building automation, manufacturing, transport, or physical access control"],
            ["ICS", "Industrial control systems within the broader OT family", "A plant process-control environment"],
            ["SCADA", "Supervisory monitoring and control across distributed sites", "A utility monitoring remote stations"],
            ["DCS", "Control distributed across a local industrial process", "Controllers coordinating production units in a plant"],
            ["PLC", "Rugged controller that executes logic for sensors and actuators", "Opening a valve when process conditions are met"],
            ["IoT", "Connected devices combining sensing, processing, and communications", "A managed environmental sensor fleet"],
          ],
        },
      },
      {
        title: "Safety and deterministic operation change the playbook",
        body: [
          "OT may have strict timing, high availability, long equipment lifecycles, vendor dependencies, fragile legacy protocols, and physical consequences. A reboot, aggressive scan, or untested patch that is routine in IT can interrupt a process or create unsafe behavior. Confidentiality still matters, but integrity, availability, safety, and control-system correctness may dominate a particular decision.",
          "Use approved maintenance windows, representative testing, vendor coordination, engineering ownership, rollback criteria, and process-safety review. When patching cannot occur promptly, reduce exposure with segmentation, allowlisting, access restrictions, monitoring, jump hosts, and documented time-limited risk treatment.",
        ],
      },
      {
        title: "Build zones, conduits, and observable remote access",
        body: [
          "Separate enterprise IT, industrial DMZ services, control operations, safety systems, and field devices according to risk. Permit only required conduits and protocols. Broker remote administration through strongly authenticated, approved, logged access paths; remove vendor access when it is not needed and avoid direct internet exposure.",
          "Prefer passive discovery and protocol-aware monitoring where active probes could disrupt equipment. Establish normal process and network behavior, protect engineering workstations and configuration backups, synchronize time where safe, and rehearse manual or fail-safe operations. A network alert should be evaluated with process state because cyber and physical evidence inform each other.",
        ],
      },
      {
        title: "IoT security begins in procurement",
        body: [
          "Require unique device identities or credentials, secure default configuration, protected updates, vulnerability disclosure and support commitments, data protection, event logging, and a documented end-of-support path. Inventory device model, firmware, owner, network location, dependencies, collected data, and update status.",
          "Constrained devices may not support full endpoint agents, so compensate with gateway enforcement, network segmentation, behavioural monitoring, restricted egress, and protected management services. At disposal, remove credentials and sensitive data, revoke trust, update inventory, and verify sanitization or destruction according to the media and risk.",
        ],
      },
    ],
    traps: [
      "SCADA is a type of control architecture, not a synonym for every OT device.",
      "Immediate active scanning or patching can create operational risk and needs engineering coordination.",
      "An air-gapped label does not prove isolation if maintenance media, radios, modems, or vendor paths bridge the boundary.",
    ],
    check: {
      question: "A fragile controller cannot be patched during production. What is the best immediate direction?",
      answer: "Document the risk and apply tested compensating controls such as segmentation, strict allowlisting, monitored access, and reduced exposure while engineering and the vendor plan a safe maintenance window.",
    },
    sources: [
      { label: "NIST SP 800-82 Rev. 3 — Operational Technology Security", url: "https://csrc.nist.gov/pubs/sp/800/82/r3/final" },
      { label: "NISTIR 8259A — IoT Device Cybersecurity Capability Core Baseline", url: "https://csrc.nist.gov/pubs/ir/8259/a/final" },
      { label: "CISA — Internet Exposure Reduction Guidance", url: "https://www.cisa.gov/resources-tools/resources/exposure-reduction" },
    ],
  },
  {
    id: "software-memory-concurrency",
    chapter: 2,
    category: "Secure Software",
    title: "Memory Safety, Race Conditions, and Resource Exhaustion",
    subtitle: "Distinguish corrupted memory, unsafe arithmetic, timing-dependent state, and uncontrolled consumption before choosing a control.",
    summary: "Low-level software weaknesses can look similar when a system crashes, but their root causes differ. Accurate classification connects the failure to safer languages, bounds and arithmetic checks, synchronization, resource budgets, or runtime hardening.",
    minutes: 14,
    difficulty: "Applied",
    aliases: ["buffer overflow", "out-of-bounds write", "stack overflow", "heap overflow", "integer overflow", "integer wraparound", "null pointer dereference", "race condition", "TOCTOU", "time of check time of use", "memory leak", "resource exhaustion", "uncontrolled resource consumption", "ASLR", "DEP", "NX", "stack canary", "memory-safe language", "fuzzing", "sanitizer"],
    objectives: [
      "Separate memory-boundary, arithmetic, pointer, concurrency, and resource-lifecycle failures.",
      "Explain why a race condition is not a subtype of null-pointer dereference.",
      "Layer prevention, testing, and exploit mitigations without calling defense in depth a complete fix.",
    ],
    sections: [
      {
        title: "Start with the violated assumption",
        table: {
          columns: ["Weakness", "Broken assumption", "Possible result"],
          rows: [
            ["Out-of-bounds write", "A write stays inside the intended buffer", "Memory corruption, crash, or code execution"],
            ["Integer overflow or wraparound", "Arithmetic remains within the data type's valid range", "Incorrect length, allocation, price, or access calculation"],
            ["Null-pointer dereference", "A pointer refers to a valid object", "Usually a crash; impact depends on context"],
            ["Race condition", "Shared state changes in the expected order under concurrency", "Inconsistent state, duplicated action, bypass, corruption, or crash"],
            ["Memory leak", "Allocated memory is released after use", "Gradual loss of capacity and eventual instability"],
            ["Resource exhaustion", "Requests consume bounded CPU, memory, storage, handles, or bandwidth", "Degraded service or denial of service"],
          ],
        },
      },
      {
        title: "Race describes timing, not one specific crash",
        body: [
          "A race condition exists when concurrent execution over shared state lacks correct synchronization and the result depends on timing or ordering. A time-of-check-to-time-of-use weakness occurs when a condition is checked and the relevant resource changes before use. A race may cause many effects, including privilege or state errors; a null dereference is only one possible failure and is not the definition.",
          "Design atomic operations and transactions where possible, minimize mutable shared state, use correct locks or concurrency primitives, revalidate security-sensitive state at use, and test under realistic parallel load. Adding a delay may hide the symptom without removing the race.",
        ],
      },
      {
        title: "Prevent the bug, then harden exploitation paths",
        body: [
          "Prefer memory-safe languages or safe abstractions for new components where feasible. Validate sizes and arithmetic before allocation or copying, use checked integer operations and bounded libraries, handle allocation and parser failures, free resources deterministically, and impose per-user and system-wide quotas, timeouts, queue limits, and backpressure.",
          "Code review, static analysis, sanitizers, fuzzing, concurrency testing, and fault injection find different classes of failure. ASLR, non-executable memory, stack canaries, control-flow protections, least privilege, and sandboxing reduce exploit reliability or impact, but do not repair the underlying out-of-bounds access or race.",
        ],
      },
    ],
    traps: [
      "A race condition is a timing and synchronization weakness, not simply a technique for causing a null pointer.",
      "An integer overflow can contribute to a buffer overflow, but the two weaknesses are not synonyms.",
      "ASLR and DEP are exploit mitigations; bounds-safe code and correct memory handling address root causes.",
    ],
    check: {
      question: "An application checks that a temporary file is owned by the user, but an attacker swaps the path before the application opens it. What class fits?",
      answer: "A time-of-check-to-time-of-use race condition. The security decision and the resource use were not atomic.",
    },
    sources: [
      { label: "MITRE CWE-787 — Out-of-bounds Write", url: "https://cwe.mitre.org/data/definitions/787.html" },
      { label: "MITRE CWE-190 — Integer Overflow or Wraparound", url: "https://cwe.mitre.org/data/definitions/190.html" },
      { label: "MITRE CWE-362 — Race Condition", url: "https://cwe.mitre.org/data/definitions/362.html" },
      { label: "MITRE CWE-400 — Uncontrolled Resource Consumption", url: "https://cwe.mitre.org/data/definitions/400.html" },
      { label: "NIST SP 800-218 — Secure Software Development Framework", url: "https://csrc.nist.gov/pubs/sp/800/218/final" },
    ],
  },
  {
    id: "api-session-browser-security",
    chapter: 2,
    category: "Secure Software",
    title: "API Authorization, Sessions, Replay, and Browser Defences",
    subtitle: "Recheck permission on every object and function, then protect the session and browser context that carries the request.",
    summary: "An authenticated API call can still be unauthorized. Secure APIs enforce object, property, and function permissions server-side, constrain resource use and business flows, protect tokens, and handle browser-specific attacks separately.",
    minutes: 15,
    difficulty: "Applied",
    aliases: ["API security", "BOLA", "broken object level authorization", "BOPLA", "broken object property level authorization", "BFLA", "broken function level authorization", "mass assignment", "excessive data exposure", "rate limiting", "business flow abuse", "API inventory", "session token", "session fixation", "replay attack", "cookie", "Secure flag", "HttpOnly", "SameSite", "CSRF", "clickjacking", "frame-ancestors", "X-Frame-Options", "SSL stripping", "TLS stripping", "HSTS"],
    objectives: [
      "Enforce API access at object, property, and function levels.",
      "Protect sessions against theft, fixation, replay, and uncontrolled lifetime.",
      "Distinguish CSRF, clickjacking, and HTTPS downgrade defences.",
    ],
    sections: [
      {
        title: "Authentication is not object authorization",
        table: {
          columns: ["Failure", "What the server forgets to check", "Example"],
          rows: [
            ["BOLA", "May this identity act on this specific object?", "Changing /invoices/41 to /invoices/42 reveals another customer's invoice"],
            ["BOPLA", "May this identity read or change this property?", "A normal user sets an internal approved=true field"],
            ["BFLA", "May this identity call this function?", "A user invokes an administrative export endpoint"],
            ["Unrestricted resource use", "Is the request cost bounded per identity and system?", "A cheap request triggers expensive image processing repeatedly"],
          ],
        },
      },
      {
        title: "Make the server enforce the business rule",
        body: [
          "Check authorization on every endpoint and every object selected from client input. Random identifiers make guessing harder but do not replace permission checks. Select explicit response fields, allow changes only to approved properties, validate schemas, deny administrative functions by default, inventory every deployed API version, and test negative access cases.",
          "Rate limits help protect capacity but may not stop low-volume abuse of a sensitive business flow such as voucher redemption, reservation, referral, or password reset. Add per-user and per-object state rules, idempotency where appropriate, anti-automation controls, fraud monitoring, and safe rollback or dispute processes.",
        ],
      },
      {
        title: "Treat session tokens like temporary credentials",
        body: [
          "Generate unpredictable tokens, transmit them only over protected channels, rotate after authentication and privilege changes, limit lifetime and scope, support revocation, and avoid placing secrets in URLs or logs. Cookies carrying sessions should normally use Secure and HttpOnly, with a SameSite value selected for the application's cross-site needs. These flags complement rather than replace server-side authorization.",
          "Replay resubmits captured valid material. TLS reduces capture on the network, while nonces, timestamps, sequence numbers, one-time challenges, short-lived tokens, proof-of-possession, and idempotency controls address different replay scenarios. A token can be cryptographically valid and still need rejection because it was revoked, used outside context, or already consumed.",
        ],
      },
      {
        title: "Browser attacks need browser-aware controls",
        body: [
          "CSRF causes a victim's browser to send an unwanted authenticated request; use anti-CSRF tokens, appropriate SameSite cookies, origin checks, and reauthentication for sensitive actions. Clickjacking overlays or frames a trusted interface to misdirect a click; CSP frame-ancestors is the modern framing policy, with X-Frame-Options retained for compatible defense in depth.",
          "HTTPS stripping keeps a victim on HTTP when an upgrade path can be intercepted. Redirect to HTTPS, avoid insecure links and mixed content, and use HTTP Strict Transport Security so a browser that has learned the policy refuses HTTP for the host. HSTS preload can protect an eligible first visit, but deployment and subdomain impact require care.",
        ],
      },
    ],
    traps: [
      "A UUID makes an object difficult to guess but does not prove the caller is authorized to access it.",
      "TLS protects transport; it does not enforce API object or function permissions.",
      "CSP frame-ancestors addresses framing, while script-src governs script sources; one directive does not replace the other.",
    ],
    check: {
      question: "A signed-in learner changes a PBQ ID in an API request and receives another learner's private attempt. What control failed?",
      answer: "Object-level authorization. The server authenticated the learner but failed to verify permission for the requested attempt object.",
    },
    sources: [
      { label: "OWASP — API Security Top 10:2023", url: "https://owasp.org/API-Security/" },
      { label: "OWASP — Session Management Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
      { label: "OWASP — Clickjacking Defense Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html" },
      { label: "IETF RFC 6797 — HTTP Strict Transport Security", url: "https://www.rfc-editor.org/info/rfc6797" },
    ],
  },
  {
    id: "dns-time-management-security",
    chapter: 3,
    category: "Network Security",
    title: "Secure DNS, Network Time, and Management Protocols",
    subtitle: "Protect the infrastructure services that tell systems where to connect, what time it is, and how devices are configured.",
    summary: "DNS, time synchronization, and device management are control-plane dependencies. Their security requires trusted roles, authenticated data or sessions, restricted administration, resilient architecture, and monitoring that can detect misuse.",
    minutes: 14,
    difficulty: "Applied",
    aliases: ["authoritative DNS", "recursive resolver", "DNSSEC", "validating resolver", "trust anchor", "encrypted DNS", "DoT", "DoH", "protective DNS", "split DNS", "zone transfer", "NTP", "Network Time Security", "NTS", "SNMP", "SNMPv3", "USM", "MIB", "community string", "trap", "inform", "management plane"],
    objectives: [
      "Distinguish authoritative, recursive, validating, encrypted, and protective DNS roles.",
      "Explain what DNSSEC authenticates and what it does not encrypt.",
      "Harden time and network-management services as privileged infrastructure.",
    ],
    sections: [
      {
        title: "DNS has distinct roles and trust boundaries",
        body: [
          "An authoritative server publishes data for zones it serves. A recursive resolver follows referrals and caches answers for clients. Restrict recursion to approved clients, control and authenticate administrative changes, limit zone transfers to authorized secondaries, protect registrar and DNS-provider accounts, separate roles where appropriate, log useful activity, and design resilient service paths.",
          "Protective DNS applies policy or threat intelligence to block or redirect known harmful destinations and records useful signals. It is defense in depth: newly created infrastructure, direct IP connections, alternate resolvers, encrypted channels, compromised trusted domains, and false positives require complementary controls and governance.",
        ],
      },
      {
        title: "DNSSEC and encrypted DNS solve different problems",
        table: {
          columns: ["Control", "Protects", "Does not automatically provide"],
          rows: [
            ["DNSSEC validation", "Origin authentication and integrity of signed DNS data through a trust chain", "Query confidentiality, safe content, or availability"],
            ["DoT / DoH", "Confidentiality and integrity for the client-to-resolver transport", "DNSSEC validation or end-to-end secrecy from the chosen resolver"],
            ["Protective DNS", "Policy enforcement and detection using DNS activity", "Complete visibility into every connection or proof that a domain is malicious"],
          ],
        },
      },
      {
        title: "Time is a security dependency",
        body: [
          "Authentication windows, certificate validation, distributed transactions, alert correlation, logs, and forensics depend on credible time. Use approved time sources, multiple monitored peers where appropriate, restricted control access, drift and offset alerts, and an architecture that prevents ordinary clients from changing trusted time.",
          "Network Time Security adds cryptographic protection for NTP client-server time synchronization. It helps authenticate the time source and protect exchange integrity, but does not correct a compromised endpoint clock, poor source selection, or every availability attack.",
        ],
      },
      {
        title: "Treat SNMP as privileged management traffic",
        body: [
          "SNMP managers query or configure agents using objects described by management information bases; agents can send traps or informs about events. Older community-string designs should not be treated as secure authentication. SNMPv3's User-based Security Model supports authentication and privacy, but only when strong credentials, approved algorithms, and suitable security levels are configured.",
          "Place management interfaces on restricted networks, allow only authorized managers, prefer read-only access unless change is required, disable unused versions and default communities, rotate credentials, protect configuration backups, log administrative actions, and filter management traffic. Encryption does not make excessive write permission safe.",
        ],
      },
    ],
    traps: [
      "DNSSEC authenticates signed DNS data; it does not encrypt the query or guarantee the destination is benign.",
      "DoH can protect a query from local observation while also bypassing an organization's approved resolver if unmanaged.",
      "SNMPv3 is not automatically secure when deployed without authentication, privacy, access restriction, and credential management.",
    ],
    check: {
      question: "A company wants clients to detect forged DNS answers and also hide queries from the local access network. Why are two controls needed?",
      answer: "DNSSEC validation protects signed-answer authenticity and integrity, while encrypted DNS such as DoT or DoH protects the transport to the chosen resolver. Neither control fully replaces the other.",
    },
    sources: [
      { label: "NIST SP 800-81 Rev. 3 — Secure DNS Deployment", url: "https://csrc.nist.gov/pubs/sp/800/81/r3/final" },
      { label: "IETF RFC 3414 — SNMPv3 User-based Security Model", url: "https://www.rfc-editor.org/info/rfc3414" },
      { label: "IETF RFC 8915 — Network Time Security for NTP", url: "https://www.rfc-editor.org/info/rfc8915" },
    ],
  },
];
