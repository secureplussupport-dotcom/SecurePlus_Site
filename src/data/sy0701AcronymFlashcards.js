const slug = value => String(value || "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const makeCard = (setId, acronym, expansion, meaning) => ({
  id: `sy0701-acronym-${setId}-${slug(acronym)}`,
  acronym,
  expansion,
  meaning,
});

const makeSet = (id, title, description, objectiveCodes, color, entries) => ({
  id,
  title,
  description,
  objectiveCodes,
  color,
  cards: entries.map(entry => makeCard(id, ...entry)),
});

export const SY0701_ACRONYM_SOURCE = Object.freeze({
  suppliedGuide: "SY0-701 CompTIA Security+ High-Yield Acronym Reference.pdf",
  officialBlueprint: "CompTIA Security+ SY0-701 V7 Exam Objectives, document version 7.0",
  officialUrl: "https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be",
  reviewedAt: "2026-07-27",
  reviewNote: "High-yield acronyms came from the supplied SY0-701 acronym PDF. Definitions were normalized into beginner-friendly Security+ exam wording and checked for syllabus fit.",
});

export const SY0701_ACRONYM_SETS = [
  makeSet(
    "crypto-identity",
    "Crypto and identity",
    "Certificates, keys, authentication, and identity federation.",
    ["1.4", "2.4", "3.1"],
    "#d59632",
    [
      ["AES", "Advanced Encryption Standard", "Symmetric encryption used for data at rest and other confidentiality needs."],
      ["CA", "Certificate Authority", "Trusted service that issues, signs, manages, and revokes digital certificates."],
      ["HSM", "Hardware Security Module", "Dedicated hardware that protects cryptographic keys and performs sensitive cryptographic operations."],
      ["MFA", "Multi-Factor Authentication", "Uses two or more factor types to verify a user's identity."],
      ["OAuth", "Open Authorization", "Delegated authorization that lets apps access limited resources without receiving the password."],
      ["OIDC", "OpenID Connect", "Authentication layer on OAuth 2.0 that provides identity claims about the user."],
      ["PKI", "Public Key Infrastructure", "Framework of certificates, keys, authorities, policies, and revocation processes."],
      ["SAML", "Security Assertion Markup Language", "XML-based standard for exchanging authentication and authorization data for SSO."],
      ["SSO", "Single Sign-On", "Lets a user authenticate once and access multiple trusted applications."],
      ["TLS", "Transport Layer Security", "Protocol that protects data in transit with encryption, integrity, and authentication."],
      ["TPM", "Trusted Platform Module", "Security chip that stores keys and supports hardware-based integrity checks."],
    ],
  ),
  makeSet(
    "risk-governance",
    "Risk and governance",
    "Business impact, agreements, compliance, and recovery targets.",
    ["1.3", "5.1", "5.2", "5.3"],
    "#c38d2d",
    [
      ["BAA", "Business Associate Agreement", "HIPAA-related contract used when a vendor handles protected health information."],
      ["BIA", "Business Impact Analysis", "Identifies critical processes and the impact of disruption on the business."],
      ["COOP", "Continuity of Operations Plan", "Plan for keeping essential functions running during major disruption."],
      ["ISO", "International Organization for Standardization", "Standards body associated with security management standards such as ISO 27001."],
      ["MOU / MOA", "Memorandum of Understanding / Memorandum of Agreement", "Formal document that records shared responsibilities between cooperating parties."],
      ["NDA", "Non-Disclosure Agreement", "Legal agreement used to protect confidential or sensitive information."],
      ["NIST", "National Institute of Standards and Technology", "U.S. organization that publishes widely used cybersecurity frameworks and guidance."],
      ["PCI DSS", "Payment Card Industry Data Security Standard", "Security standard for organizations that handle payment-card data."],
      ["RPO", "Recovery Point Objective", "Maximum acceptable data loss measured backward in time."],
      ["RTO", "Recovery Time Objective", "Target time for restoring a service after disruption."],
      ["SLA", "Service Level Agreement", "Contract that defines measurable service expectations such as uptime or response time."],
    ],
  ),
  makeSet(
    "threat-appsec",
    "Threats and apps",
    "Vulnerabilities, attacks, email protection, and application risk.",
    ["2.1", "2.2", "2.3", "4.2"],
    "#e56f65",
    [
      ["CSRF", "Cross-Site Request Forgery", "Web attack that tricks an authenticated user into submitting an unwanted action."],
      ["CVE", "Common Vulnerabilities and Exposures", "Standard identifier for a publicly known cybersecurity vulnerability."],
      ["CVSS", "Common Vulnerability Scoring System", "Scoring method used to describe the technical severity of a vulnerability."],
      ["DDoS", "Distributed Denial of Service", "Attack using many systems to overwhelm a target and reduce availability."],
      ["DKIM", "DomainKeys Identified Mail", "Email authentication method that uses a digital signature to verify domain integrity."],
      ["OSINT", "Open-Source Intelligence", "Information collected from public sources for security research or threat hunting."],
      ["PII", "Personally Identifiable Information", "Data that can identify or trace a specific person."],
      ["WAF", "Web Application Firewall", "Control that filters web traffic to help block application attacks."],
      ["XSS", "Cross-Site Scripting", "Web flaw where malicious scripts run in another user's browser."],
    ],
  ),
  makeSet(
    "network-access",
    "Networks and access",
    "Segmentation, remote access, wireless, and network authentication.",
    ["3.2", "3.3", "3.4", "4.1"],
    "#288c8a",
    [
      ["DMZ", "Demilitarized Zone", "Perimeter network segment for public-facing services separated from internal systems."],
      ["DNSSEC", "Domain Name System Security Extensions", "Adds authentication to DNS responses to reduce spoofing and cache poisoning."],
      ["LDAP", "Lightweight Directory Access Protocol", "Protocol used to query and update directory services for users and groups."],
      ["NAC", "Network Access Control", "Checks device or user compliance before granting network access."],
      ["RADIUS", "Remote Authentication Dial-In User Service", "Centralized AAA protocol often used for network access authentication."],
      ["SCADA", "Supervisory Control and Data Acquisition", "Industrial control architecture used to monitor and control physical processes."],
      ["TACACS+", "Terminal Access Controller Access-Control System Plus", "AAA protocol often used for administrative access to network devices."],
      ["VLAN", "Virtual Local Area Network", "Logical network segment used to separate traffic inside a switched network."],
      ["VPN", "Virtual Private Network", "Encrypted tunnel that protects traffic across an untrusted network."],
      ["WPA3", "Wi-Fi Protected Access 3", "Current Wi-Fi security standard with stronger authentication and encryption protections."],
    ],
  ),
  makeSet(
    "operations-response",
    "Operations and response",
    "Monitoring, detection, response teams, and automated remediation.",
    ["4.4", "4.5", "4.8", "4.9"],
    "#397fba",
    [
      ["CIRT / CSIRT", "Cyber / Computer Security Incident Response Team", "Specialist team responsible for managing and reducing security incidents."],
      ["DLP", "Data Loss Prevention", "Control that detects or blocks unsafe movement of sensitive data."],
      ["EDR", "Endpoint Detection and Response", "Endpoint tool for monitoring behavior, investigation, containment, and response."],
      ["FIM", "File Integrity Monitoring", "Detects unexpected changes to important files or configurations."],
      ["IDS / IPS", "Intrusion Detection System / Intrusion Prevention System", "IDS alerts on suspicious activity; IPS can actively block it."],
      ["IR", "Incident Response", "Structured process for handling incidents from preparation through lessons learned."],
      ["MSSP", "Managed Security Service Provider", "Third party that provides outsourced monitoring or security operations services."],
      ["SIEM", "Security Information and Event Management", "Platform that collects and correlates logs for alerting and investigation."],
      ["SOAR", "Security Orchestration, Automation, and Response", "Automates repeatable security workflows through playbooks and connected tools."],
      ["XDR", "Extended Detection and Response", "Correlates detection and response data across multiple security layers."],
    ],
  ),
  makeSet(
    "cloud-endpoint",
    "Cloud and endpoint",
    "Cloud controls, service models, mobile devices, and uptime support.",
    ["2.2", "3.1", "3.3", "3.4"],
    "#7766c6",
    [
      ["BYOD", "Bring Your Own Device", "Mobile model where personal devices create ownership, privacy, and management concerns."],
      ["CASB", "Cloud Access Security Broker", "Policy enforcement point between users and cloud services."],
      ["IAM", "Identity and Access Management", "Processes and tools that manage identities and control access to resources."],
      ["OT", "Operational Technology", "Hardware and software that monitor or control physical devices and industrial processes."],
      ["SaaS / IaaS / PaaS", "Software as a Service / Infrastructure as a Service / Platform as a Service", "Cloud service models with different customer and provider responsibilities."],
      ["UEM", "Unified Endpoint Management", "Central management for mobile devices, laptops, and other endpoints."],
      ["UPS", "Uninterruptible Power Supply", "Backup power source that prevents sudden shutdowns during power loss."],
      ["UTM", "Unified Threat Management", "Gateway or platform combining multiple security functions in one place."],
    ],
  ),
];

export const SY0701_ACRONYM_CARDS = SY0701_ACRONYM_SETS.flatMap(set =>
  set.cards.map(card => ({ ...card, setId: set.id, setTitle: set.title, objectiveCodes: set.objectiveCodes })),
);

export const getSy0701AcronymSet = id => SY0701_ACRONYM_SETS.find(set => set.id === id) || null;
