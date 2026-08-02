// Original editorial lessons informed by a curriculum-gap review of the supplied
// study guide. The guide is not reproduced here; every lesson is newly written
// and linked to current primary or standards-based references.

export const STUDY_GUIDE_DEEP_DIVES = [
  {
    id: "security-foundations-controls",
    chapter: 1,
    category: "Security Foundations",
    title: "Security Foundations, Controls, and Gap Analysis",
    subtitle: "Translate broad security goals into controls, evidence, and a defensible target state.",
    summary: "Security terminology becomes practical when each term answers a different question: what property must be protected, who is acting, what control is being applied, and how the organization knows the control closes a real gap.",
    minutes: 13,
    difficulty: "Core",
    aliases: ["CIA triad", "confidentiality", "integrity", "availability", "non-repudiation", "AAA", "control types", "control categories", "gap analysis", "NIST CSF 2.0", "Govern", "zero trust"],
    objectives: [
      "Separate security properties, identity decisions, and control classifications.",
      "Classify controls by both category and function without treating labels as mutually exclusive.",
      "Use the six NIST CSF 2.0 Functions to describe a current-to-target improvement path.",
    ],
    sections: [
      {
        title: "Start with the property that can fail",
        table: {
          columns: ["Property", "Question to ask", "Example failure"],
          rows: [
            ["Confidentiality", "Did an unauthorized party learn the information?", "Payroll data is exposed in a public bucket"],
            ["Integrity", "Was information or a process changed without authorization?", "A payment destination is altered"],
            ["Availability", "Can authorized users obtain the service when needed?", "A denial-of-service attack exhausts capacity"],
            ["Authenticity", "Is the identity or origin genuine?", "A forged update pretends to be vendor-signed"],
            ["Non-repudiation", "Is there strong evidence linking an action to an actor?", "A valid digital signature supports transaction evidence"],
          ],
        },
      },
      {
        title: "Category and function describe different dimensions",
        body: [
          "CompTIA groups controls into technical, managerial, operational, and physical categories. Functional labels include preventive, deterrent, detective, corrective, compensating, and directive. One control can fit more than one functional label depending on its purpose: a visible guard can deter, prevent, and detect.",
          "AAA is another separate lens. Authentication establishes confidence in an identity, authorization decides what that identity may do, and accounting records activity. Identification is the claim that comes before authentication; a username alone does not prove who supplied it.",
        ],
      },
      {
        title: "Beginner memory map",
        table: {
          columns: ["Exam phrase", "Plain meaning", "Quick example"],
          rows: [
            ["Confidentiality", "Stop unauthorized disclosure", "Encrypt customer records and limit access"],
            ["Integrity", "Stop or detect unauthorized change", "Hash a downloaded file and compare the digest"],
            ["Availability", "Keep systems usable when needed", "Redundant links and tested backups"],
            ["Non-repudiation", "Create strong evidence that an actor performed an action", "Digital signatures, audit logs, and timestamps"],
            ["Accounting", "Record what authenticated users did", "SIEM logs, audit trails, and monitoring"],
          ],
        },
      },
      {
        title: "CSF 2.0 is a six-function improvement model",
        body: [
          "The current NIST Cybersecurity Framework uses Govern, Identify, Protect, Detect, Respond, and Recover. Govern was added in CSF 2.0, so a five-function answer describes the older version. The Functions operate together and are not a mandatory six-step incident workflow.",
          "A gap analysis compares a documented current state with a chosen target state. Useful output identifies the gap, affected assets and outcomes, accountable owner, priority, planned treatment, due date, and evidence that will show the gap is closed. A maturity label without evidence or an improvement decision is not the result.",
        ],
      },
    ],
    traps: [
      "NIST CSF 2.0 has six Functions, including Govern.",
      "A technical control can be preventive, detective, or both; category and function are different axes.",
      "Zero trust removes implicit trust based on network location or ownership; it does not mean every request uses the same authentication method.",
    ],
    check: {
      question: "A company compares its current identity controls with a target profile and assigns owners to close the differences. What activity is this?",
      answer: "Gap analysis. It identifies the differences between current and target states and turns them into accountable improvement work.",
    },
    sources: [
      { label: "NIST — Cybersecurity Framework 2.0", url: "https://www.nist.gov/cyberframework" },
      { label: "NIST SP 800-53 Rev. 5 — Security and Privacy Controls", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
      { label: "NIST SP 800-207 — Zero Trust Architecture", url: "https://csrc.nist.gov/pubs/sp/800/207/final" },
    ],
  },
  {
    id: "threat-actors-surfaces",
    chapter: 2,
    category: "Threats & Hardening",
    title: "Threat Actors, Attack Surfaces, and Social Engineering",
    subtitle: "Reason from capability, opportunity, and behavior instead of memorizing villain labels.",
    summary: "Threat-actor labels are starting hypotheses. Defenders make better decisions by examining access, resources, capability, persistence, intent, exposed attack surfaces, and the evidence supporting attribution.",
    minutes: 12,
    difficulty: "Core",
    aliases: ["threat actor", "nation-state", "insider threat", "hacktivist", "script kiddie", "shadow IT", "attack surface", "attack vector", "phishing", "smishing", "vishing", "business email compromise", "pretexting", "watering hole", "typosquatting", "misinformation", "disinformation", "supply chain"],
    objectives: [
      "Describe actors using attributes that matter to defense.",
      "Distinguish an attack surface from the vector used to reach it.",
      "Recognize social-engineering patterns without assuming malware must be present.",
    ],
    sections: [
      {
        title: "Actor labels do not replace evidence",
        body: [
          "A nation-state may have deep resources and long time horizons; organized crime often pursues money; hacktivists seek visibility or political effect; inexperienced actors may rely heavily on existing tools. These are tendencies, not proof. Motivation, infrastructure, language, working hours, and techniques can all be imitated.",
          "An insider is someone with legitimate access or knowledge and may be malicious, negligent, or compromised. A third party can become an indirect actor when its software, credentials, or service relationship is abused. Defenses should focus on least privilege, separation of duties, monitoring, and safe reporting rather than stereotypes.",
        ],
      },
      {
        title: "Surface is where; vector is how",
        body: [
          "The attack surface is the total set of reachable people, processes, devices, applications, identities, interfaces, and suppliers. An attack vector is the path or method used, such as a phishing message, an exposed remote service, a stolen token, or a poisoned dependency. Inventory and architecture reduce unknown surface; validation and controls reduce usable vectors.",
          "Supply-chain risk exists across design, development, procurement, delivery, deployment, maintenance, and disposal. A signed update improves provenance and integrity, but a compromised vendor build system may still sign harmful software. Supplier assessment, secure development, dependency visibility, isolation, and incident clauses work together.",
        ],
      },
      {
        title: "Social-engineering patterns",
        table: {
          columns: ["Pattern", "Primary channel or tactic", "Useful clue"],
          rows: [
            ["Phishing / smishing / vishing", "Email / text / voice", "Urgency, unusual request, or identity mismatch"],
            ["Business email compromise", "Trusted business identity and payment workflow", "Changed bank details or secrecy request; malware is not required"],
            ["Pretexting", "A fabricated role or story", "The requester discourages normal verification"],
            ["Watering hole", "A site frequented by the target group", "A trusted destination becomes the delivery point"],
            ["Typosquatting", "A look-alike registered name", "Small spelling or Unicode difference; not the same as DNS poisoning"],
            ["Misinformation / disinformation", "False content", "Disinformation is deliberately deceptive; misinformation may be shared without that intent"],
          ],
        },
      },
      {
        title: "Common delivery paths",
        table: {
          columns: ["Vector", "Likely clue", "First defensive thought"],
          rows: [
            ["Email", "Phishing, malicious attachment, or business email compromise", "Verify sender, filter content, and require strong payment-change procedures"],
            ["Web", "Drive-by download, watering hole, malicious ad, or browser exploit", "Patch browsers, filter risky destinations, and isolate high-risk browsing"],
            ["Network", "On-path attack, DNS poisoning, ARP spoofing, or DDoS", "Authenticate endpoints, segment networks, monitor traffic, and protect availability"],
            ["Physical", "USB drop, tailgating, dumpster diving, or shoulder surfing", "Use badges, clean desk habits, visitor control, and awareness training"],
            ["Supply chain", "Trusted update, vendor, or dependency becomes the path", "Assess suppliers, verify releases, monitor dependencies, and define contract controls"],
          ],
        },
      },
    ],
    traps: [
      "Business email compromise can rely entirely on persuasion and a legitimate-looking mailbox.",
      "Typosquatting registers a confusingly similar name; DNS poisoning corrupts resolution answers.",
      "A likely motivation is not reliable attribution by itself.",
    ],
    check: {
      question: "An attacker registers payr0ll-example.com and sends an urgent invoice request. Which naming attack is present?",
      answer: "Typosquatting. The attacker registered a visually similar domain; no poisoned DNS response is required.",
    },
    sources: [
      { label: "CISA — Recognize and Report Phishing", url: "https://www.cisa.gov/secure-our-world/recognize-and-report-phishing" },
      { label: "NIST SP 800-161 Rev. 1 — Cybersecurity Supply Chain Risk Management", url: "https://csrc.nist.gov/pubs/sp/800/161/r1/upd1/final" },
      { label: "MITRE ATT&CK — Enterprise tactics and techniques", url: "https://attack.mitre.org/" },
    ],
  },
  {
    id: "access-control-pam",
    chapter: 4,
    category: "Identity & Access",
    title: "Authentication, Access Models, and Privileged Access",
    subtitle: "Follow an identity from its claim to a least-privilege decision and an auditable session.",
    summary: "Strong identity architecture combines trustworthy authentication, an access model suited to the resource, tightly controlled privileged paths, lifecycle governance, and logs that can reconstruct important decisions.",
    minutes: 13,
    difficulty: "Applied",
    aliases: ["authentication factors", "MFA", "biometrics", "FAR", "FRR", "CER", "DAC", "MAC", "RBAC", "ABAC", "rule-based access", "PAM", "JIT", "JEA", "credential vault", "break glass", "session recording"],
    objectives: [
      "Build MFA from independent factor types rather than two versions of one factor.",
      "Choose among DAC, MAC, RBAC, ABAC, and rule-based decisions.",
      "Explain how privileged-access controls reduce standing access and improve accountability.",
    ],
    sections: [
      {
        title: "Two checks are not always two factors",
        body: [
          "Common factor types are something you know, have, are, do, or somewhere you are. A password plus two security questions remains knowledge-based. A password plus a hardware authenticator combines independent factor types and is MFA. Risk signals such as device health or location can influence a decision without automatically becoming a separate authentication factor.",
          "Biometrics are measured, not secret. False acceptance rate describes impostors accepted; false rejection rate describes genuine users rejected. The crossover or equal error rate is a comparison point where the rates meet under a test configuration. Liveness detection and a protected fallback path matter because a biometric usually cannot be replaced like a password.",
        ],
      },
      {
        title: "Access models answer different policy questions",
        table: {
          columns: ["Model", "Decision basis", "Good scenario clue"],
          rows: [
            ["DAC", "The object owner delegates access", "A file owner shares a document"],
            ["MAC", "Centrally enforced labels and clearances", "Classified data and mandatory policy"],
            ["RBAC", "Job or organizational role", "Nurses receive the permissions needed for their duties"],
            ["ABAC", "Attributes of subject, object, action, and environment", "Allow only managed devices during approved hours"],
            ["Rule-based", "A system rule evaluates conditions", "A firewall rule permits a protocol from a network"],
          ],
        },
      },
      {
        title: "Privileged access should be temporary and observable",
        body: [
          "Privileged Access Management can vault and rotate credentials, require approval, broker sessions, record high-risk activity, and remove direct knowledge of shared secrets. Just-in-time access limits when privilege exists; just-enough administration limits what the session can do. Neither control eliminates the need to secure the requesting identity and the PAM platform itself.",
          "Break-glass access is an emergency path, not a convenient bypass. It should be strongly protected, tested, limited, alerted, and reviewed after use. Session recording adds evidence but can capture sensitive data, so retention, access, privacy, and tamper protection need policy.",
        ],
      },
    ],
    traps: [
      "Password plus PIN is usually still one knowledge factor, not MFA.",
      "RBAC uses roles; ABAC evaluates a richer set of attributes and context.",
      "A shared administrator password in a vault improves storage but does not by itself create individual accountability.",
    ],
    check: {
      question: "An engineer receives database-admin rights for one approved hour and only for backup commands. Which two ideas are combined?",
      answer: "Just-in-time access limits the time window, and just-enough administration limits the permitted actions.",
    },
    sources: [
      { label: "NIST SP 800-63B-4 — Authentication and Authenticator Management", url: "https://csrc.nist.gov/pubs/sp/800/63/b/4/final" },
      { label: "NIST SP 800-162 — Attribute Based Access Control", url: "https://csrc.nist.gov/pubs/sp/800/162/upd2/final" },
      { label: "NIST SP 800-53 Rev. 5 — Access Control family", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
    ],
  },
  {
    id: "enterprise-network-segmentation",
    chapter: 3,
    category: "Network Security",
    title: "Enterprise Networks, Segmentation, and ACL Reasoning",
    subtitle: "Trace the packet, the trust boundary, and the exact rule that allows or denies it.",
    summary: "Network architecture questions become manageable when you separate forwarding, segmentation, access enforcement, authentication, and availability. A diagram is useful only when you can explain the path a packet takes.",
    minutes: 13,
    difficulty: "Applied",
    aliases: ["VLAN", "subnet", "DMZ", "ACL", "implicit deny", "first match", "stateful firewall", "stateless firewall", "port security", "802.1X", "NAC", "air gap", "load balancer", "TLS termination", "east-west traffic", "north-south traffic"],
    objectives: [
      "Distinguish logical segmentation, IP segmentation, and physical isolation.",
      "Evaluate ACL order, direction, protocol, endpoints, ports, and implicit deny.",
      "Place NAC, load balancing, and firewall functions correctly in an architecture.",
    ],
    sections: [
      {
        title: "Segmentation creates boundaries; policy makes them useful",
        body: [
          "A VLAN separates layer-2 broadcast domains; a subnet defines an IP address range and routing boundary. They are often aligned but are not the same concept. Traffic crossing a routed boundary can be filtered by routers, firewalls, cloud policy, or host controls. A DMZ is a controlled zone for services that need different exposure, not a guarantee of safety.",
          "North-south traffic crosses the environment boundary; east-west traffic moves between internal systems or workloads. Internal segmentation reduces lateral movement only when routes and enforcement rules actually restrict the path. Physical isolation and air gaps reduce connectivity further, but media, maintenance paths, wireless radios, and people can bridge them.",
        ],
      },
      {
        title: "Read an ACL in execution order",
        body: [
          "For each rule, identify direction, source, destination, protocol, port, state, and action. Many ACLs use first-match processing, so a broad earlier permit can shadow a later deny. An implicit deny drops unmatched traffic only if the platform and policy implement it; exam scenarios often expect this, but production engineers should confirm the device behavior.",
          "A stateless filter evaluates individual packets. A stateful firewall tracks connection state and can permit return traffic for an allowed session. State does not make a rule least-privileged: a broad outbound permit can still enable unwanted sessions.",
        ],
      },
      {
        title: "Admission, delivery, and inspection are separate jobs",
        table: {
          columns: ["Control", "Primary job", "Important limit"],
          rows: [
            ["802.1X / NAC", "Authenticate and assess a device or user before or during network access", "Posture checks can be incomplete and need remediation paths"],
            ["Switch port security", "Restrict learned or allowed layer-2 addresses on a port", "MAC addresses can be imitated; it is not strong identity"],
            ["Load balancer", "Distribute connections and check backend health", "It is not automatically a firewall"],
            ["TLS termination", "Decrypt a protected connection at an approved boundary", "Traffic after termination needs its own protection and trust decision"],
          ],
        },
      },
    ],
    traps: [
      "A VLAN is not an access-control policy; routing and filtering decide what crosses it.",
      "ACL order matters when processing is first-match.",
      "A load balancer can improve availability and terminate TLS without providing full security inspection.",
    ],
    check: {
      question: "A specific deny rule never activates because an earlier rule permits the entire source subnet. What is the likely cause?",
      answer: "Rule shadowing in a first-match ACL. Reorder or narrow the rules so the specific decision is evaluated before the broad permit.",
    },
    sources: [
      { label: "NIST SP 800-215 — Secure Enterprise Network Landscape", url: "https://csrc.nist.gov/pubs/sp/800/215/final" },
      { label: "NIST SP 800-41 Rev. 1 — Firewalls and Firewall Policy", url: "https://csrc.nist.gov/pubs/sp/800/41/r1/final" },
      { label: "NIST SP 800-207 — Zero Trust Architecture", url: "https://csrc.nist.gov/pubs/sp/800/207/final" },
    ],
  },
  {
    id: "cloud-containers-automation",
    chapter: 3,
    category: "Cloud & Architecture",
    title: "Cloud Models, Containers, and Infrastructure as Code",
    subtitle: "Know which layer you control, which boundary you share, and how automation multiplies both consistency and mistakes.",
    summary: "Cloud security is not a single responsibility chart. The service model, provider contract, workload architecture, identity design, data location, and automation pipeline determine who can control each risk.",
    minutes: 17,
    difficulty: "Applied",
    aliases: ["IaaS", "PaaS", "SaaS", "public cloud", "private cloud", "community cloud", "hybrid cloud", "shared responsibility", "container", "virtual machine", "orchestrator", "registry", "serverless", "function as a service", "FaaS", "microservices", "service-oriented architecture", "SOA", "SDN", "control plane", "data plane", "infrastructure as code", "IaC", "immutable infrastructure", "configuration drift", "guardrails"],
    objectives: [
      "Reason about responsibility from the actual service layer and contract.",
      "Compare VM and container isolation without treating either as absolute.",
      "Secure infrastructure-as-code from authoring through deployment and drift detection.",
    ],
    sections: [
      {
        title: "Service models shift control, not accountability",
        table: {
          columns: ["Model", "Customer commonly controls", "Provider commonly controls"],
          rows: [
            ["IaaS", "Guest OS, identities, applications, data, and virtual network policy", "Facilities, physical hardware, and core virtualization"],
            ["PaaS", "Application code, identities, data, and service configuration", "Managed runtime and underlying platform"],
            ["SaaS", "Users, access policy, data handling, integrations, and tenant settings", "Application operation and underlying stack"],
          ],
        },
      },
      {
        title: "Deployment models answer where the cloud lives",
        table: {
          columns: ["Model", "Exam meaning", "Do not confuse it with"],
          rows: [
            ["Public cloud", "Services offered over shared provider infrastructure", "A private cloud just because access uses the internet"],
            ["Private cloud", "Cloud infrastructure used by one organization", "A single ordinary server"],
            ["Community cloud", "Shared by organizations with a common mission or compliance need", "A general public-cloud account"],
            ["Hybrid cloud", "Distinct environments, such as private and public, connected for coordinated use", "Using two public providers only"],
            ["Multi-cloud", "Using services from more than one cloud provider", "Always having a private-cloud component"],
          ],
        },
      },
      {
        title: "Containers share more than virtual machines",
        body: [
          "A virtual machine usually includes a guest operating system above a hypervisor. Containers commonly share the host kernel while isolating processes and resources through operating-system mechanisms. Containers can start quickly and support consistent packaging, but a kernel flaw, excessive privilege, exposed orchestrator, or compromised image can cross important boundaries.",
          "Secure the full container chain: minimal trusted images, dependency and secret scanning, signed provenance where supported, protected registries, least-privileged runtime settings, network policy, orchestrator access control, host hardening, logging, and timely rebuilds. A clean image scan does not prove the running workload remains safe.",
        ],
      },
      {
        title: "Automation makes policy repeatable—and scalable",
        body: [
          "Software-defined networking separates programmable control decisions from packet forwarding, although implementations vary. Protect the control plane as a high-value management surface and validate the data-plane rules it creates.",
          "Infrastructure as code makes intended state reviewable and repeatable. It can also deploy one mistake everywhere. Use protected repositories, peer review, automated policy checks, separate environments, short-lived deployment credentials, secret managers, staged rollouts, rollback plans, and drift detection. Immutability means replacing rather than manually repairing instances; stateful data and incident evidence still need deliberate handling.",
        ],
      },
      {
        title: "Serverless removes server administration, not customer security work",
        body: [
          "Serverless or Function as a Service means the provider operates and scales the underlying server platform. The customer still secures application code, dependencies, identities, triggers, secrets, data, network paths, logging, runtime selection, and service configuration. Providers patch their platform; customers must still update vulnerable libraries and supported runtimes. ‘No servers to manage’ never means ‘no patching or monitoring.’",
          "Service-oriented architecture is a broad approach to composing services. Microservices usually emphasize small, independently deployable service boundaries. Neither style is inherently secure: more services can increase identity, API, dependency, observability, and failure-management complexity. Define ownership and trust boundaries before selecting the label.",
        ],
      },
    ],
    traps: [
      "The provider secures the cloud, but the exact customer duties vary by service and contract.",
      "A container is not simply a smaller VM and does not normally include its own kernel.",
      "Serverless shifts infrastructure operations to the provider; customers still secure code, dependencies, identities, data, and configuration.",
      "Infrastructure as code reduces manual inconsistency but can reproduce insecure configuration at high speed.",
    ],
    check: {
      question: "A reviewed template opens a database port to the internet and deploys it identically to 80 accounts. What property made the impact larger?",
      answer: "Automated, repeatable infrastructure deployment scaled the configuration error. Policy checks, staged rollout, and least-privileged templates should catch it before broad deployment.",
    },
    sources: [
      { label: "NIST SP 800-145 — Definition of Cloud Computing", url: "https://csrc.nist.gov/pubs/sp/800/145/final" },
      { label: "NIST SP 800-190 — Application Container Security", url: "https://csrc.nist.gov/pubs/sp/800/190/final" },
      { label: "NIST SP 800-207A — Zero Trust for Cloud-Native Applications", url: "https://csrc.nist.gov/pubs/sp/800/207/a/final" },
    ],
  },
  {
    id: "resilience-assets-physical",
    chapter: 3,
    category: "Cloud & Architecture",
    title: "Resilience, Asset Lifecycles, and Physical Security",
    subtitle: "Connect business recovery targets to maintained assets, tested recovery paths, and layered physical controls.",
    summary: "Resilience is an engineered and tested capability. It depends on knowing what exists, how failure affects the business, which recovery targets matter, and whether digital and physical dependencies can meet them.",
    minutes: 15,
    difficulty: "Applied",
    aliases: ["asset inventory", "asset owner", "EOL", "EOSL", "BIA", "RTO", "RPO", "MTTR", "MTBF", "high availability", "fault tolerance", "redundancy", "cluster", "load balancing", "hot site", "warm site", "cold site", "honeypot", "honeynet", "honeyfile", "bollard", "mantrap", "media sanitization"],
    objectives: [
      "Relate asset ownership and lifecycle decisions to resilience.",
      "Distinguish RTO, RPO, MTTR, and MTBF without treating targets as guarantees.",
      "Layer physical, recovery, deception, and sanitization controls around business needs.",
    ],
    sections: [
      {
        title: "Assets need owners from acquisition to disposal",
        body: [
          "An inventory should identify the asset, owner, purpose, location, dependencies, classification, support state, and approved configuration. End of life means a product is retired by its maker; end of support means fixes or assistance end under a defined policy. Unsupported assets require replacement, isolation, compensating controls, or documented risk treatment—not silent acceptance.",
          "Disposal must address the media and its data, not only the device label. Current NIST guidance organizes sanitization around clear, purge, and destroy decisions selected for the media, confidentiality needs, future reuse, verification, and organizational policy. Ordinary file deletion is not sanitization.",
        ],
      },
      {
        title: "Recovery metrics answer different questions",
        table: {
          columns: ["Metric", "Decision it supports", "Do not confuse it with"],
          rows: [
            ["RTO", "Target time to restore an acceptable service level", "A guarantee that recovery will finish on time"],
            ["RPO", "Maximum targeted period of data loss measured backward from disruption", "How long the outage may last"],
            ["MTTR", "Average time to repair or restore", "A per-incident deadline"],
            ["MTBF", "Average operating time between repairable failures", "The lifetime of a non-repairable item"],
          ],
        },
      },
      {
        title: "Layer continuity, physical protection, and deception",
        body: [
          "Redundancy duplicates components; high availability combines design and operations to reduce interruption; fault tolerance aims to continue despite a component failure. Clusters and load balancers can help, but shared dependencies, bad changes, regional failures, and data corruption still require independent recovery design and testing.",
          "Fences, bollards, lighting, locks, guards, cameras, alarms, and access vestibules can deter, delay, prevent, and detect. Choose them from the threat and site layout. Honeypots, honeynets, honeyfiles, and honeytokens create monitored deception signals; isolate them carefully so they do not become a trusted production path or an uncontrolled attack platform.",
        ],
      },
    ],
    traps: [
      "RPO measures tolerated data loss in time; RTO measures targeted restoration time.",
      "High availability reduces downtime but does not replace tested, independent backups.",
      "A honeypot is a monitored deception resource, not a storage location for real secrets.",
    ],
    check: {
      question: "A service must return within four hours and may lose at most fifteen minutes of data. Which values are these?",
      answer: "The four-hour target is the RTO; the fifteen-minute data-loss window is the RPO.",
    },
    sources: [
      { label: "NIST SP 800-34 Rev. 1 — Contingency Planning", url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final" },
      { label: "NIST SP 800-88 Rev. 2 — Media Sanitization", url: "https://csrc.nist.gov/pubs/sp/800/88/r2/final" },
      { label: "NIST SP 800-53 Rev. 5 — Physical and Environmental Protection", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
    ],
  },
  {
    id: "endpoint-mobile-hardening",
    chapter: 4,
    category: "Security Operations",
    title: "Endpoint, Mobile, EDR, and Device Ownership",
    subtitle: "Harden the device, govern its lifecycle, and treat every radio and management channel as part of the attack surface.",
    summary: "Endpoint security is a layered operational discipline: secure baselines, timely maintenance, least privilege, application control, encryption, telemetry, response, device management, and clear ownership rules reinforce one another.",
    minutes: 13,
    difficulty: "Applied",
    aliases: ["hardening", "secure baseline", "application allowlisting", "EPP", "EDR", "XDR", "MDM", "UEM", "BYOD", "CYOD", "COPE", "COBO", "rooting", "jailbreaking", "sideloading", "Bluetooth", "NFC", "tethering", "GPS"],
    objectives: [
      "Build a layered endpoint baseline and distinguish prevention from detection and response.",
      "Match BYOD, CYOD, COPE, and COBO to ownership and use expectations.",
      "Evaluate mobile radios and modified devices without assuming short range means low risk.",
    ],
    sections: [
      {
        title: "A baseline is maintained, not installed once",
        body: [
          "A secure endpoint baseline removes unnecessary services, configures least privilege, patches supported software, enables host firewalling and storage encryption, restricts application execution, protects credentials, collects useful telemetry, and defines recovery. Exceptions need owners, expiry dates, and compensating controls.",
          "Traditional endpoint protection emphasizes prevention and known malicious patterns. EDR records endpoint behavior and supports investigation and response. XDR correlates telemetry across multiple security domains, but product scope varies. A broad product label does not guarantee high-quality telemetry, tuning, or response authority.",
        ],
      },
      {
        title: "Ownership models change control and privacy",
        table: {
          columns: ["Model", "Who owns the device?", "Typical use"],
          rows: [
            ["BYOD", "User", "Personal device approved for work under policy"],
            ["CYOD", "Organization or user, depending on programme", "User selects from an approved device list"],
            ["COPE", "Organization", "Corporate device permits managed personal use"],
            ["COBO", "Organization", "Corporate device restricted to business use"],
          ],
        },
      },
      {
        title: "Mobile convenience creates multiple paths",
        body: [
          "MDM or UEM can enforce configuration, inventory devices, manage certificates and applications, separate work data, and trigger lock or wipe actions. Controls depend on enrolment state, platform support, connectivity, and legal policy; a wipe command is not proof that inaccessible offline data was erased.",
          "Bluetooth, NFC, Wi-Fi, cellular, tethering, and location services each expose different interfaces and metadata. Short range reduces some opportunities but is not an authentication or encryption guarantee. Rooting, jailbreaking, and unapproved sideloading weaken platform assumptions and should trigger an explicit access and remediation decision.",
        ],
      },
    ],
    traps: [
      "EDR visibility does not guarantee prevention; it supports detection, investigation, and response.",
      "NFC being short-range does not make every transaction trustworthy.",
      "Remote wipe may be pending or incomplete when a device is offline or management has been removed.",
    ],
    check: {
      question: "A company owns a phone, allows limited personal use, and manages work data. Which ownership model best fits?",
      answer: "COPE: corporate-owned, personally enabled.",
    },
    sources: [
      { label: "NIST SP 800-124 Rev. 2 — Mobile Device Security", url: "https://csrc.nist.gov/pubs/sp/800/124/r2/final" },
      { label: "NIST SP 800-53 Rev. 5 — Configuration and System Integrity controls", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
      { label: "MITRE ATT&CK — Mobile", url: "https://attack.mitre.org/matrices/mobile/" },
    ],
  },
  {
    id: "incident-response-monitoring",
    chapter: 4,
    category: "Security Operations",
    title: "Incident Response, SIEM, and Threat Hunting",
    subtitle: "Turn noisy telemetry into evidence, controlled response, and measurable improvement.",
    summary: "Modern incident response is an organization-wide capability. Preparation and improvement span governance, protection, detection, response, and recovery; analysts still need a practical, iterative sequence for each event.",
    minutes: 14,
    difficulty: "Applied",
    aliases: ["incident response", "NIST SP 800-61 Rev 3", "SIEM", "SOAR", "log management", "time synchronization", "true positive", "true negative", "false positive", "false negative", "confusion matrix", "alert tuning", "threat hunting", "hypothesis", "containment", "eradication", "recovery", "lessons learned"],
    objectives: [
      "Use the current NIST incident-response model without forcing every incident into a rigid sequence.",
      "Choose logs that can reconstruct identity, endpoint, network, cloud, and application activity.",
      "Tune and hunt from risk hypotheses while preserving evidence and response safeguards.",
    ],
    sections: [
      {
        title: "Response is integrated across CSF 2.0",
        body: [
          "NIST SP 800-61 Rev. 3 supersedes Rev. 2 and integrates incident-response recommendations with all six CSF 2.0 Functions. Govern, Identify, and Protect help prepare and reduce impact; Detect, Respond, and Recover handle possible and confirmed incidents; lessons feed improvement across the programme.",
          "For an active case, a practical flow remains useful: detect and validate, triage and scope, analyze, contain, eradicate, recover, and improve. These activities overlap and repeat. Immediate isolation may be correct for destructive malware, while covert monitoring may be authorized for a carefully controlled investigation. Business, safety, legal, and evidence needs shape the decision.",
        ],
      },
      {
        title: "A SIEM is only as trustworthy as its evidence pipeline",
        table: {
          columns: ["Evidence", "What it can answer", "Common blind spot"],
          rows: [
            ["Identity and authentication", "Who signed in, from where, and with what result?", "Shared accounts and missing application identity"],
            ["Endpoint", "Which process, file, user, or device action occurred?", "Offline or unmanaged systems"],
            ["DNS, firewall, flow, packet", "Where did traffic go and how was it handled?", "Encryption, asymmetric paths, and short retention"],
            ["Cloud control plane", "Who changed a resource or policy?", "Uncollected regions, projects, or data-plane actions"],
            ["Application", "What business action occurred?", "Inconsistent identifiers and unsafe sensitive-data logging"],
          ],
        },
      },
      {
        title: "Tune for decision quality, not quiet dashboards",
        body: [
          "A false positive alerts on benign activity; a false negative misses malicious activity. Suppression, deduplication, baselines, asset criticality, identity risk, and confidence can improve prioritization. Tuning solely to reduce alert volume can hide failure, so changes need testing, ownership, expiry where appropriate, and measures of missed as well as noisy detection.",
          "Threat hunting begins with a testable hypothesis, gathers relevant evidence, follows leads, records results, and converts durable findings into improved detection or controls. ATT&CK provides a shared language for behaviors. A hunt result is not automatically an incident, and absence of a hit is not proof the environment is clean.",
        ],
      },
      {
        title: "Classify alerts against reality",
        table: {
          columns: ["Reality", "Detection result", "Classification"],
          rows: [
            ["Malicious activity occurred", "Alert fired", "True positive"],
            ["Benign activity occurred", "Alert fired", "False positive"],
            ["Benign activity occurred", "No alert", "True negative"],
            ["Malicious activity occurred", "No alert", "False negative"],
          ],
        },
      },
      {
        title: "Classic exam flow for active incidents",
        table: {
          columns: ["Phase", "What the learner should do first", "Common trap"],
          rows: [
            ["Preparation", "Have roles, tools, communications, and evidence handling ready", "Trying to invent the process during the incident"],
            ["Detection and analysis", "Confirm what happened, scope impact, and document evidence", "Treating the first alert as complete truth"],
            ["Containment", "Limit spread or damage before cleanup", "Erasing malware before stopping active movement"],
            ["Eradication", "Remove the cause, persistence, and exploited weakness", "Restoring systems while the attacker still has access"],
            ["Recovery", "Return clean systems to service and monitor closely", "Skipping validation because a backup restored"],
            ["Lessons learned", "Improve controls, playbooks, and training", "Closing the case without fixing the process"],
          ],
        },
      },
    ],
    traps: [
      "The current NIST guide is SP 800-61 Rev. 3; the older four-phase model is no longer the whole framework.",
      "A SIEM correlates and presents evidence but does not make every alert true.",
      "Threat hunting is hypothesis-driven investigation, not indiscriminate searching for any anomaly.",
    ],
    check: {
      question: "A team suppresses every alert from a noisy service account and the alert count falls. Why is that not enough evidence of improvement?",
      answer: "The tuning may have created false negatives. The team must validate the account behavior, narrow the rule, test known malicious patterns, and measure what is missed as well as what is reduced.",
    },
    sources: [
      { label: "NIST SP 800-61 Rev. 3 — Incident Response", url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final" },
      { label: "NIST SP 800-92 — Computer Security Log Management", url: "https://csrc.nist.gov/pubs/sp/800/92/final" },
      { label: "MITRE ATT&CK — Enterprise", url: "https://attack.mitre.org/matrices/enterprise/" },
    ],
  },
  {
    id: "malware-indicators-attacks",
    chapter: 2,
    category: "Threats & Hardening",
    title: "Malware, Indicators, and Adversary Behavior",
    subtitle: "Classify the mechanism, assess the evidence, and respond without treating one signal as proof.",
    summary: "Malware names describe behavior or delivery, while indicators describe observations and ATT&CK techniques describe how adversaries operate. Strong analysis connects multiple evidence sources over time.",
    minutes: 13,
    difficulty: "Applied",
    aliases: ["virus", "worm", "trojan", "RAT", "rootkit", "keylogger", "ransomware", "logic bomb", "fileless malware", "IoC", "TTP", "credential stuffing", "password spraying", "replay attack", "on-path attack", "resource consumption", "impossible travel", "missing logs"],
    objectives: [
      "Distinguish malware behaviors without assuming one sample fits only one label.",
      "Separate short-lived indicators from durable tactics, techniques, and procedures.",
      "Correlate identity, process, network, and log signals before declaring compromise.",
    ],
    sections: [
      {
        title: "Malware labels describe different dimensions",
        table: {
          columns: ["Label", "Defining behavior", "Do not assume"],
          rows: [
            ["Virus", "Replicates by attaching to a host file or content", "It spreads without user or host execution"],
            ["Worm", "Self-propagates across systems or networks", "It cannot also carry ransomware or a backdoor"],
            ["Trojan", "Pretends to be legitimate or useful", "It self-replicates"],
            ["Ransomware", "Encrypts, locks, or steals data to pressure payment", "Payment guarantees recovery or deletion"],
            ["Spyware", "Monitors activity or collects information quietly", "It must always display pop-ups"],
            ["Rootkit", "Hides or maintains privileged presence", "One product alert proves kernel compromise"],
            ["Keylogger", "Records keystrokes or input to capture secrets", "It is always a separate physical device"],
            ["Logic bomb", "Triggers malicious action when a condition is met", "It runs immediately after installation"],
            ["RAT", "Provides remote administrative control to an unauthorized operator", "Every legitimate remote tool is malicious"],
            ["Fileless malware", "Relies heavily on memory, interpreters, or trusted tools", "It leaves no files or persistent evidence at all"],
          ],
        },
      },
      {
        title: "Indicators are clues with different lifetimes",
        body: [
          "A file hash, domain, IP address, mutex, certificate, command line, or registry path can be an indicator of compromise. Many are easy to change or may also appear in benign activity. Tactics, techniques, and procedures describe behavioral patterns and can remain useful after infrastructure changes, but they still require evidence and context.",
          "High CPU or network use, impossible travel, repeated lockouts, blocked content, missing logs, unexpected child processes, and new persistence are investigation signals—not verdicts. Correlate time, identity, device, parent process, network destination, asset role, change records, and baseline behavior.",
        ],
      },
      {
        title: "Credential and network attacks are not interchangeable",
        body: [
          "Credential stuffing reuses username-password pairs stolen elsewhere. Password spraying tries a small number of common passwords across many accounts. Replay resends captured valid material; robust nonces, timestamps, sequence controls, and short-lived tokens can help. An on-path attacker positions between communicating parties to observe or alter traffic; authenticated encryption and trustworthy endpoint identity reduce the opportunity.",
          "For ransomware, preserve needed evidence, contain affected identities and systems, determine scope and entry path, eradicate persistence, rotate exposed secrets, and recover from tested clean sources. Payment does not guarantee decryption, deletion, or an end to extortion; follow organizational, legal, insurance, and law-enforcement procedures.",
        ],
      },
    ],
    traps: [
      "A worm describes propagation; ransomware describes impact. One specimen can be both.",
      "Impossible travel can result from VPNs, mobile networks, or shared services and needs corroboration.",
      "Paying a ransom does not prove the attacker deleted stolen data or supplied a working decryptor.",
    ],
    check: {
      question: "One common password is tried against 5,000 employee accounts. Which attack is this?",
      answer: "Password spraying. Credential stuffing would reuse previously stolen account-password pairs.",
    },
    sources: [
      { label: "MITRE ATT&CK — Enterprise", url: "https://attack.mitre.org/matrices/enterprise/" },
      { label: "CISA — StopRansomware", url: "https://www.cisa.gov/stopransomware" },
      { label: "NIST SP 800-83 Rev. 1 — Malware Incident Prevention and Handling", url: "https://csrc.nist.gov/pubs/sp/800/83/r1/final" },
    ],
  },
  {
    id: "secure-software-applications",
    chapter: 2,
    category: "Secure Software",
    title: "Injection, Application Attacks, and Secure Development",
    subtitle: "Follow untrusted data to the interpreter, browser, file path, or service it can influence.",
    summary: "Application attacks become easier to distinguish when you identify the confused component and the trust boundary crossed. Secure development reduces these paths before deployment and adds layered controls for what remains.",
    minutes: 15,
    difficulty: "Applied",
    aliases: ["SQL injection", "command injection", "OS injection", "LDAP injection", "XSS", "path traversal", "directory traversal", "SSRF", "CSRF", "parameterized query", "output encoding", "canonicalization", "SAST", "DAST", "SCA", "threat modeling", "sandbox", "SSDF", "software supply chain"],
    objectives: [
      "Distinguish injection, traversal, request forgery, and browser attacks by the component being influenced.",
      "Choose primary controls such as safe APIs, contextual encoding, canonical paths, and least privilege.",
      "Place threat modeling, code review, SAST, DAST, and dependency analysis in a secure development lifecycle.",
    ],
    sections: [
      {
        title: "Name the interpreter or trust boundary",
        table: {
          columns: ["Attack", "What attacker input influences", "Primary control direction"],
          rows: [
            ["SQL / command / LDAP injection", "A database, shell, or directory query interpreter", "Parameterized or safe APIs, strict construction, least privilege"],
            ["XSS", "A victim browser interprets untrusted content as active code", "Context-aware output handling and safe DOM APIs"],
            ["Path traversal", "A file path escapes the intended directory", "Server-selected identifiers, canonical paths, allowlists, filesystem isolation"],
            ["Buffer overflow", "A program writes outside the memory it was given", "Bounds checking, safer libraries, memory-safe languages, ASLR and DEP"],
            ["XML injection", "Untrusted XML changes parser or data behavior", "Disable unsafe features, validate structure, and parse with safe libraries"],
            ["SSRF", "The server makes an attacker-influenced request", "Destination allowlists, network egress controls, parser-safe validation"],
            ["CSRF", "A browser sends an unwanted authenticated request", "Anti-CSRF tokens, SameSite cookies, origin checks, reauthentication"],
          ],
        },
      },
      {
        title: "Validation helps, but context decides the encoding",
        body: [
          "Allowlist validation can reject structurally invalid input, but it does not replace safe query APIs or output handling. Encode for the exact output context: HTML text, attribute, URL, JavaScript, and CSS contexts have different rules. Canonicalize and constrain paths before access, but prefer mapping an opaque server-controlled identifier to an approved file rather than accepting a path from the user.",
          "A web application firewall, content security policy, sandbox, and runtime monitoring provide defense in depth. They reduce likelihood or impact but should not be used to justify leaving a known injection path in application code.",
        ],
      },
      {
        title: "Secure development creates evidence before release",
        body: [
          "Threat modeling identifies assets, trust boundaries, abuse cases, and mitigations while design is still changeable. Peer review examines intent and implementation. SAST analyzes code or compiled artifacts without running the application; DAST probes a running system; software composition analysis inventories dependencies and known risks. No single technique sees the whole system.",
          "Protect repositories, branches, build workers, secrets, signing keys, package sources, and release provenance. Pinning a dependency improves repeatability, but the pinned version still needs maintenance. A signed artifact supports origin and integrity only to the extent that the signer and build process are trustworthy.",
        ],
      },
    ],
    traps: [
      "Input validation alone does not replace parameterized queries or contextual output encoding.",
      "Path traversal targets file location; command injection reaches an executable interpreter.",
      "A sandbox limits capability but is not proof that untrusted code cannot escape or abuse allowed access.",
    ],
    check: {
      question: "A product ID is concatenated into a database query. Which fix most directly removes the SQL/code boundary confusion?",
      answer: "Use a parameterized query or prepared statement so the product ID remains data rather than becoming query syntax.",
    },
    sources: [
      { label: "OWASP Top 10:2025", url: "https://owasp.org/www-project-top-ten/" },
      { label: "OWASP — Injection Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html" },
      { label: "NIST SP 800-218 — Secure Software Development Framework", url: "https://csrc.nist.gov/pubs/sp/800/218/final" },
    ],
  },
  {
    id: "governance-change-vendors",
    chapter: 5,
    category: "Governance & Risk",
    title: "Governance, Change Control, and Third-Party Risk",
    subtitle: "Make expectations actionable, changes reversible, and supplier responsibilities testable.",
    summary: "Governance is credible when policy connects to enforceable standards, usable procedures, accountable decisions, evidence, and improvement. Suppliers and emergency changes remain inside that system rather than becoming exceptions to it.",
    minutes: 14,
    difficulty: "Applied",
    aliases: ["policy", "standard", "procedure", "guideline", "change management", "change control", "emergency change", "backout plan", "maintenance window", "SLA", "SOW", "NDA", "MOU", "MOA", "right to audit", "vendor assessment", "security awareness", "phishing simulation"],
    objectives: [
      "Separate policies, standards, procedures, and guidelines by purpose.",
      "Design normal and emergency changes with testing, rollback, evidence, and review.",
      "Manage supplier risk from due diligence through exit and data return or destruction.",
    ],
    sections: [
      {
        title: "Governance documents form a usable hierarchy",
        table: {
          columns: ["Document", "Primary role", "Example"],
          rows: [
            ["Policy", "States management intent and mandatory direction", "Sensitive data must be protected according to classification"],
            ["Standard", "Defines mandatory, measurable requirements", "Approved encryption configurations and key lengths"],
            ["Procedure", "Gives repeatable steps for a task", "How to rotate a compromised application secret"],
            ["Guideline", "Offers recommended judgement where flexibility is allowed", "Suggested secure meeting practices while traveling"],
          ],
        },
      },
      {
        title: "A safe change is understood and recoverable",
        body: [
          "A change record should identify the owner, purpose, affected assets, dependencies, security and business impact, testing, approvals, implementation window, communications, monitoring, rollback criteria, backout steps, and resulting configuration evidence. Version control preserves intent and review history, but it does not prove the deployed state matches the repository.",
          "Emergency changes may use faster approval because delay is riskier, but they should still be logged, access-controlled, tested as far as circumstances allow, monitored, and reviewed afterward. Calling work an emergency must not become a permanent route around governance.",
        ],
      },
      {
        title: "Third-party risk continues after the contract is signed",
        body: [
          "Due diligence examines capability, architecture, financial and concentration risk, personnel controls, prior incidents, assurance reports, subcontractors, and data handling. Contract terms can define service levels, security requirements, breach notification, audit rights, location, retention, business continuity, liability, and exit assistance. An SLA measures service commitments; an SOW defines work and deliverables; an NDA limits disclosure. The labels do not substitute for precise clauses.",
          "Awareness programmes should be role-based, accessible, repeated, and measured by safer behavior—not only course completion. Supportive phishing simulations can test reporting and reinforce skills. Public shaming discourages reporting and can make the programme less accurate.",
        ],
      },
    ],
    traps: [
      "A guideline is normally advisory; a standard is normally mandatory and measurable.",
      "Emergency changes still need evidence and post-implementation review.",
      "A vendor certification is one assurance input, not proof that every contracted service and control is effective.",
    ],
    check: {
      question: "A document specifies the exact approved TLS configurations every public service must use. What is it most likely to be?",
      answer: "A standard, because it turns policy intent into mandatory, measurable technical requirements.",
    },
    sources: [
      { label: "NIST — Cybersecurity Framework 2.0", url: "https://www.nist.gov/cyberframework" },
      { label: "NIST SP 800-161 Rev. 1 — Supply Chain Risk Management", url: "https://csrc.nist.gov/pubs/sp/800/161/r1/upd1/final" },
      { label: "NIST SP 800-50 Rev. 1 — Cybersecurity and Privacy Learning Program", url: "https://csrc.nist.gov/pubs/sp/800/50/r1/final" },
    ],
  },
  {
    id: "data-classification-lifecycle",
    chapter: 5,
    category: "Data Protection",
    title: "Data Classification, DLP, Retention, and Sanitization",
    subtitle: "Protect information according to its impact, state, location, lifecycle, and legal obligations.",
    summary: "Data protection works when an organization knows what information it has, why it needs it, where it may go, who may use it, how long it must remain, and how to verify that disposal meets the risk.",
    minutes: 14,
    difficulty: "Applied",
    aliases: ["data classification", "PII", "PHI", "intellectual property", "data sovereignty", "data residency", "data localization", "data at rest", "data in transit", "data in use", "DLP", "retention", "data minimization", "legal hold", "clear", "purge", "destroy", "tokenization", "masking"],
    objectives: [
      "Classify data from business, legal, privacy, and safety impact rather than its file extension.",
      "Distinguish sovereignty, residency, localization, and the three data states.",
      "Connect DLP, minimization, retention, legal hold, and sanitization across the lifecycle.",
    ],
    sections: [
      {
        title: "Classification drives handling",
        body: [
          "Classification labels vary by organization, but the decision should consider harm from disclosure, alteration, loss, or unavailable access; contractual and legal duties; business value; safety; and aggregation. PII can identify or be linked to a person. Health, financial, authentication, legal, and intellectual-property data may need specialized handling. A CSV file can be highly restricted while an encrypted database backup can still be sensitive.",
          "Data owners define or approve classification and handling requirements; custodians and systems implement them. Labelling helps discovery and automation, but labels can be missing or wrong. Access policy, encryption, monitoring, training, and periodic review must reinforce them.",
        ],
      },
      {
        title: "Location and state create separate requirements",
        table: {
          columns: ["Concept", "Meaning", "Design question"],
          rows: [
            ["Sovereignty", "Data is subject to relevant jurisdictions and legal authority", "Which laws and government powers apply?"],
            ["Residency", "The geographic location where data is stored or processed", "Where are primary copies, backups, logs, and support access?"],
            ["Localization", "A rule requires certain data or processing to remain in a location", "Does the exact law or contract require local storage, processing, or copies?"],
            ["At rest / in transit / in use", "Stored / moving / actively processed", "Which control protects this state and where are keys or plaintext exposed?"],
          ],
        },
      },
      {
        title: "Control the whole lifecycle",
        body: [
          "Data Loss Prevention can inspect endpoint, network, email, storage, and cloud activity using labels, patterns, exact data matches, destinations, user context, and behavior. Encryption and uncommon formats can reduce inspection visibility; broad patterns can create false positives. Start with monitored policy, validate workflows, add user coaching, and escalate or block according to risk.",
          "Collect and retain only what has a defined purpose. Retention rules balance operational, legal, regulatory, historical, and privacy needs. A legal hold suspends normal destruction for in-scope material. At disposal, select clear, purge, or destroy according to current sanitization policy, media technology, confidentiality, reuse, and verification needs. File deletion, factory reset, and cryptographic erase are not interchangeable claims without evidence.",
        ],
      },
    ],
    traps: [
      "Data residency states where data is located; sovereignty concerns applicable jurisdiction and authority.",
      "DLP can detect and enforce policy but cannot reliably inspect every encrypted or novel data path.",
      "Legal hold overrides routine destruction for the relevant scope; it does not require keeping all data forever.",
    ],
    check: {
      question: "A retention schedule says delete after two years, but the records are relevant to active litigation. What takes precedence?",
      answer: "The legal hold for the relevant records. Routine destruction resumes only after the hold is released under the approved process.",
    },
    sources: [
      { label: "NIST SP 800-122 — Protecting Personally Identifiable Information", url: "https://csrc.nist.gov/pubs/sp/800/122/final" },
      { label: "NIST — Privacy Framework", url: "https://www.nist.gov/privacy-framework/privacy-framework" },
      { label: "NIST SP 800-88 Rev. 2 — Media Sanitization", url: "https://csrc.nist.gov/pubs/sp/800/88/r2/final" },
    ],
  },
];
