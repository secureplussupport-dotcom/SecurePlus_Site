# Proposed Concept Deep Dives arrangement

Status: Reference draft only. The owner requested that this be recorded without replacing the current arrangement.

Received: 26 October 2026.

Scope: 12 modules, 47 lessons and 179 distinct concept tags.

Preserve the supplied module names, lesson IDs, titles, tag mappings and pedagogical focus below as the proposed arrangement. No lesson content, runtime mappings, navigation or production arrangement is changed by this document.

## Supplied proposal (verbatim)

```text
Module	Lesson ID & Title	Tag Mappings	Core Pedagogical Focus
Foundational Security Principles & Controls	SEC-01: Core Security Triad & Principles	sec.cia-triad
sec.non-repudiation
sec.defense-in-depth	Balancing confidentiality, integrity, and availability; audit trails and layered defenses.
Foundational Security Principles & Controls	SEC-02: Security Control Categories & Types	sec.ctrl-admin
sec.ctrl-ops
sec.ctrl-tech
sec.ctrl-phys
sec.ctrl-prevent
sec.ctrl-detect
sec.ctrl-correct
sec.ctrl-deter
sec.ctrl-compensate	The complete 2D matrix of control functions (preventive, detective, corrective) vs. implementations (technical, administrative, physical).
Foundational Security Principles & Controls	SEC-03: Access Governance & Operations	sec.least-privilege
sec.sep-of-duties
sec.change-mgmt	Operational controls that restrict privilege creep, mandate dual custody, and govern system changes.
Foundational Security Principles & Controls	SEC-04: Active Defense & Deception	sec.honeypot
sec.zero-trust	Shifting from perimeter defenses to perimeter-less Zero Trust Architecture (ZTA) and honeypot traps.
Threat Actors & Social Engineering	ATT-01: Threat Actor Profiles & Motives	att.actor-apt
att.actor-crime
att.actor-hacktivist
att.actor-insider
att.actor-scriptkiddie
att.actor-shadow-it	Threat actor taxonomy: resources, sophistication, intent, insider threats, and unmanaged IT sprawl.
Threat Actors & Social Engineering	ATT-02: Psychological Influence & Pretexting	att.social-principles
att.pretexting
att.deepfake	Robert Cialdini’s principles of persuasion, pretext scenarios, and generative AI synthetic media.
Threat Actors & Social Engineering	ATT-03: Phishing Vectors & Impersonation	att.phishing
att.spear-phishing
att.whaling
att.vishing-smishing
att.quishing	Email deception vectors, targeted executive spear-phishing, voice/SMS traps, and QR-code fraud.
Threat Actors & Social Engineering	ATT-04: Physical & Environmental Exploitation	att.tailgating
att.shoulder-surfing
att.dumpster-diving
att.watering-hole	Physical ingress bypasses, opportunistic observation, trash scrounging, and third-party site poisoning.
Threat Intelligence, Frameworks & Attacks	ATT-05: Threat Intelligence & Attack Modeling	att.mitre-attack
att.kill-chain
att.diamond-model
att.threat-feeds
att.iocs	Mapping adversary behavior across Cyber Kill Chain stages, MITRE ATT&CK tactics, and Diamond Model vertices.
Threat Intelligence, Frameworks & Attacks	ATT-06: Malware Typology & Execution	att.mal-ransomware
att.mal-trojan
att.mal-rootkit	High-impact payload mechanisms: kernel rootkits, disguised trojan delivery, and modern double-extortion ransomware.
Threat Intelligence, Frameworks & Attacks	ATT-07: Credential & Password Attacks	att.pwd-bruteforce
att.pwd-spraying
att.pwd-stuffing
att.pwd-rainbow	Password guessing attacks, low-and-slow spraying, breach replay credential stuffing, and precomputed hash tables.
Threat Intelligence, Frameworks & Attacks	ATT-08: Network Layer Tampering & Interception	att.arp-poisoning
att.dns-poisoning
att.on-path-mitm
att.dos-ddos	Layer 2/3 traffic interception, spoofed name resolution, on-path eavesdropping, and volumetric/state exhaustion DoS.
Threat Intelligence, Frameworks & Attacks	ATT-09: Wireless Exploits & Rogue Ingress	att.evil-twin
att.deauth
att.kerberoasting
att.pass-the-hash	802.11 deauthentication, captive rogue APs, and Active Directory ticket extraction/replay vectors.
Application Security & Software Vulnerabilities	APP-01: Client-Side Web Attacks	att.app-xss
att.app-csrf	Stored/Reflected/DOM cross-site scripting vs. unauthorized ambient credential execution (CSRF).
Application Security & Software Vulnerabilities	APP-02: Server-Side Web Exploits	att.app-sqli
att.app-ssrf
att.app-xxe
att.app-dir-traversal	Database query injection, blind SSRF cloud metadata access, malicious XML external entities, and path navigation.
Application Security & Software Vulnerabilities	VUL-01: Memory & Concurrency Flaws	vul.mem-overflow
vul.race-condition
vul.resource-exhaustion	Buffer/stack overruns, TOCTOU race conditions, and uncontrolled memory/CPU resource exhaustion.
Application Security & Software Vulnerabilities	VUL-02: Vulnerability Scoring & Zero-Days	vul.cvss-cve
vul.zero-day
vul.input-validation
vul.unquoted-path	Calculating CVSS v3.1 base metrics, CVE indexing, zero-day handling, input sanitization, and Windows path misconfigurations.
Architecture, Cloud & Infrastructure	ARC-01: Cloud Service & Deployment Models	arch.cloud-models
arch.cloud-deploy
arch.shared-resp	IaaS/PaaS/SaaS architectures, Public/Private/Hybrid models, and Cloud Service Provider vs. Customer responsibility boundaries.
Architecture, Cloud & Infrastructure	ARC-02: Virtualization & Modern Workloads	arch.virtualization
arch.containers
arch.serverless	Type 1/2 hypervisors, container daemon isolation, and event-driven ephemeral functions.
Architecture, Cloud & Infrastructure	ARC-03: Network Isolation & Microsegmentation	arch.segmentation
arch.microsegmentation
arch.dmz
arch.air-gap	Physical/logical network partitioning, east-west internal traffic boundaries, perimeter DMZs, and physical air-gapping.
Architecture, Cloud & Infrastructure	ARC-04: Modern Edge & Remote Connectivity	arch.vpn
arch.ztna
arch.sase-edge
arch.sdn
arch.api-security	Legacy remote-access VPNs vs. cloud-native ZTNA, Secure Access Service Edge (SASE), programmable SDNs, and API protection.
Network Security & Protocols	NET-01: Network Security Appliances	net.app-ngfw
net.app-ids-ips
net.app-waf
net.app-proxy
net.app-load-balancer	Stateful inspection vs. NGFW application awareness, signature/anomaly IDS/IPS, WAF, forward/reverse proxies, and HA balancing.
Network Security & Protocols	NET-02: Secure Management & Transfer Protocols	net.proto-ssh
net.proto-sftp
net.proto-snmpv3
net.proto-ipsec	Encrypted remote terminal access, SFTP vs. FTPS, SNMPv3 auth/privacy traps, and IPsec AH/ESP tunnel modes.
Network Security & Protocols	NET-03: Secure Web, Naming & Mail Services	net.proto-tls
net.proto-dnssec
net.proto-email	TLS 1.3 handshake mechanics, DNSSEC cryptographic trust chains, and email security trio (SPF, DKIM, DMARC).
Network Security & Protocols	NET-04: Wireless Security Standards	net.wifi-wpa2
net.wifi-wpa3
net.wifi-802-1x	WPA2 4-way handshake vulnerabilities, WPA3 Simultaneous Authentication of Equals (SAE), and 802.1X EAP Enterprise authentication.
Identity, Authentication & Access Control	IAM-01: Authentication Fundamentals & MFA	iam.auth-factors
iam.mfa
iam.fido2-passwordless	Multi-factor attributes (something you know, have, are, somewhere/something you do) and FIDO2 WebAuthn cryptographic keys.
Identity, Authentication & Access Control	IAM-02: Centralized & Network AAA	iam.radius-tacacs
iam.kerberos
iam.pam	RADIUS vs. TACACS+ protocol differences, Kerberos tickets (TGT/TGS), and Privileged Access Management vaults.
Identity, Authentication & Access Control	IAM-03: Access Control Models	iam.rbac
iam.abac
iam.dac-mac
iam.provisioning	Discretionary vs. Mandatory controls, Role-Based Access Control, dynamic policy-based ABAC, and SCIM automated deprovisioning.
Identity, Authentication & Access Control	IAM-04: Federation, SSO & Token Standards	iam.saml
iam.oauth-oidc
iam.sso-federation	Identity Federation across enterprises: XML-based SAML assertions vs. RESTful OAuth 2.0 authorization grants and OIDC ID tokens.
Cryptography & Public Key Infrastructure	CRY-01: Symmetric Ciphers & Modes	cry.sym-aes
cry.sym-chacha20
cry.sym-legacy
cry.cipher-modes	AES block sizes, ChaCha20 stream performance, legacy DES/3DES obsolescence, and block modes (CBC, ECB, GCM).
Cryptography & Public Key Infrastructure	CRY-02: Asymmetric Encryption & Key Exchange	cry.asym-rsa
cry.asym-ecc
cry.diffie-hellman	RSA mathematical factoring, Elliptic Curve Cryptography (ECC) key size efficiency, and ephemeral Diffie-Hellman PFS.
Cryptography & Public Key Infrastructure	CRY-03: Integrity, Hashing & Data Concealment	cry.hash-sha
cry.hash-md5
cry.hmac
cry.steganography	One-way hashing resistance (preimage/collision), SHA vs. MD5 deprecation, HMAC data authentication, and payload steganography.
Cryptography & Public Key Infrastructure	CRY-04: Hardware Security & Obfuscation	cry.hsm-tpm
cry.key-mgmt
cry.masking-salting
cry.tokenization	Hardware Security Modules vs. motherboard TPMs, key lifecycle rotation, password salting/masking, and non-sensitive tokenization.
Cryptography & Public Key Infrastructure	CRY-05: PKI Lifecycle & Certificate Management	cry.pki-ca
cry.pki-certs
cry.pki-csr
cry.pki-revocation	Root/Intermediate CAs, X.509 v3 structures, CSR generation, and CRL vs. OCSP stapling revocation checks.
Security Operations, Monitoring & Hardening	OPS-01: Asset Hardening & Host Defense	ops.os-baseline
ops.port-hardening
ops.patch-mgmt
ops.fim
ops.app-control	Center for Internet Security (CIS) baselines, disabling unneeded services/ports, patch cadences, file integrity monitoring, and allowlisting.
Security Operations, Monitoring & Hardening	OPS-02: Endpoint Mobility & Device Security	ops.mdm-mam
ops.byod	Enterprise endpoint control: MDM profiles, Mobile Application Management containerization, and BYOD acceptable usage risks.
Security Operations, Monitoring & Hardening	OPS-03: Vulnerability Scanning & Reconnaissance	ops.scan-credentialed
ops.scan-discovery	Network discovery vs. credentialed in-depth compliance scans and false positive/negative tuning.
Security Operations, Monitoring & Hardening	OPS-04: Telemetry, Logging & SOC Analytics	ops.logs-syslog
ops.netflow-pcap
ops.siem
ops.soar
ops.edr-xdr
ops.ueba	Centralized Syslog ingestion, NetFlow vs. full packet capture, SIEM correlation rules, SOAR automated playbooks, and UEBA behavioral baselines.
Incident Response & Digital Forensics	IR-01: Incident Response Preparation & Execution	ir.lifecycle-nist
ir.tabletop-drills	NIST SP 800-61 r2 incident response lifecycle (Preparation, Detection & Analysis, Containment/Eradication, Recovery, Post-Incident) and tabletop war-gaming.
Incident Response & Digital Forensics	IR-02: Forensics Acquisition & Evidentiary Integrity	ir.volatility-order
ir.forensic-imaging
ir.forensic-hash
ir.chain-of-custody	Order of volatility (CPU registers/cache down to optical/backups), bit-stream disk imaging, write-blockers, hash verification, and legal chain of custody logs.
Data Security & Business Continuity	DAT-01: Data States, Classification & Sanitization	data.states
data.classification
data.sanitization
data.reg-pii-phi	Data in transit/at rest/in use, sensitivity tiers (Public to Top Secret), data sanitization (clearing, purging, destroying), and regulatory definitions of PII/PHI.
Data Security & Business Continuity	DAT-02: Data Loss Prevention & Availability	data.dlp
data.backups
data.immutable-321
data.ha-clustering	Endpoint/network DLP filters, high availability clustering, 3-2-1 backup topology, and WORM immutable backup vaults.
Risk Governance, Compliance & Frameworks	RSK-01: Risk Identification & Assessment	risk.inherent-residual
risk.appetite-tolerance
risk.qual-matrix
risk.bia-rto-rpo	Inherent vs. residual risk, organizational risk tolerance, qualitative probability-impact matrices, and Business Impact Analysis metrics (MTTD, MTTR, RTO, RPO).
Risk Governance, Compliance & Frameworks	RSK-02: Quantitative Risk Calculations	risk.quant-sle-ef
risk.quant-ale-aro	Exact math for Single Loss Expectancy (SLE = AV \times EF) and Annualized Loss Expectancy (ALE = SLE \times ARO).
Risk Governance, Compliance & Frameworks	RSK-03: Third-Party & Supply Chain Risk	risk.treatment
risk.agreements
risk.vendor-audit
risk.sbom	Risk response strategies (Accept, Mitigate, Transfer, Avoid), SLA/MOU/ISA contracts, vendor audits, and Software Bill of Materials (SBOM).
Risk Governance, Compliance & Frameworks	GOV-01: Standards & Industry Frameworks	gov.nist-csf
gov.nist-sp800
gov.iso-27001
gov.cis-controls
gov.soc2	NIST CSF functions (Identify, Protect, Detect, Respond, Recover), NIST SP 800-53 catalog, ISO/IEC 27001 ISMS certification, CIS Critical Controls, and SOC 2 Type II attestation.
Risk Governance, Compliance & Frameworks	GOV-02: Privacy Regulations & Organizational Policy	gov.gdpr-hipaa-pci
gov.policy-aup
gov.policy-retention
gov.training-roles
gov.training-phish	Compliance mandates (GDPR, HIPAA, PCI-DSS), Acceptable Use Policies (AUP), document retention schedules, role-tailored security awareness training, and simulated phishing.
```
