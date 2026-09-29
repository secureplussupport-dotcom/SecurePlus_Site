// Second editorial pass, 2026-09-29. Apply after captured publication corrections.
// Stable IDs and answer positions preserve existing attempt history.
export const SECOND_PASS_MCQ_REVIEW = {
  "m035": {
    "exp": "AES-256 has a larger key space than AES-128, providing additional margin against future exhaustive-search capabilities. This does not imply a practical break of correctly implemented AES-128. The key length does not change the AES block size or provide message authentication by itself.",
    "wrongFeedback": {
      "0": "AES-256 uses more encryption rounds than AES-128. Performance depends on the implementation and hardware; higher speed is not the security justification.",
      "2": "The scenario provides no evidence of a practical plaintext-recovery weakness in properly implemented AES-128.",
      "3": "Both AES-128 and AES-256 use a 128-bit block size. AES is a block cipher, not an authentication scheme."
    }
  },
  "m044": {
    "exp": "Separation of duties divides sensitive responsibilities so one person cannot complete a high-risk transaction alone. This reduces unilateral abuse and some errors, but collusion, weak approvals and bypasses can still defeat the control."
  },
  "m201": {
    "exp": "Dual control requires two authorised people to participate in the sensitive operation. It reduces unilateral abuse; it does not eliminate collusion or mistakes. Split knowledge is related but specifically divides secret information so no one custodian knows the whole secret."
  },
  "m211": {
    "exp": "A distinct random salt is included as an input to each stored password derivation. It prevents useful reuse of the same precomputed table across different salts and makes identical passwords produce different stored values in practice. Salts are not secret and do not stop guessing; an appropriate password-hashing scheme and work factor raise the cost of each guess."
  },
  "m158": {
    "exp": "Zero Trust does not grant implicit trust solely because a user or device is inside the network or owned by the organisation. Access decisions use identity, device and resource context, least privilege and reassessment under policy. Perimeter controls can remain useful as part of this architecture; internal location alone is insufficient authorisation."
  },
  "m226": {
    "exp": "Zero Trust does not grant implicit trust solely because a user or device is inside the network or owned by the organisation. Access decisions use identity, device and resource context, least privilege and reassessment under policy. Perimeter controls can remain useful as part of this architecture; internal location alone is insufficient authorisation."
  },
  "m003": {
    "exp": "A compensating control is an alternative used when the preferred control (MFA) cannot be implemented. It addresses the same risk through a different mechanism. The proposed alternatives must be evaluated against the original control objective and residual risk; labelling a control compensating does not establish that it is adequate."
  },
  "m043": {
    "exp": "The browser likely cannot build a path to an accepted trust anchor because the private root is absent from its trust configuration. Public-facing services for unmanaged browsers normally use a widely trusted public CA; managed clients can use a deliberately distributed private root. Hostname, validity, chain and applicable status checks still apply."
  },
  "m405": {
    "opts": [
      "Static RSA key transport",
      "Forward secrecy from ephemeral key agreement",
      "Certificate pinning with an unchanged key-establishment method",
      "Frequent renewal of the certificate using the same long-term key"
    ],
    "wrongFeedback": {
      "0": "Static RSA key transport does not provide this protection against later theft of the transport private key.",
      "2": "Pinning limits accepted peer credentials but does not itself protect old session secrets after key theft.",
      "3": "Certificate renewal with the same key does not provide the ephemeral key-establishment property needed to protect recorded sessions."
    }
  },
  "m406": {
    "opts": [
      "Select the smallest key length without comparing algorithm security strength",
      "Use desktop benchmark rankings to choose the embedded implementation",
      "Compare required security strength and benchmark supported implementations on the target device",
      "Replace the signature with a published unkeyed hash of the update"
    ],
    "wrongFeedback": {
      "0": "Equal or smaller key lengths across different algorithm families do not establish equivalent security or device cost.",
      "1": "Desktop rankings may not hold on the device, whose hardware acceleration, memory limits and libraries differ.",
      "3": "An unkeyed hash alone cannot authenticate the update source if an attacker can replace both the update and its hash."
    },
    "q": "An IoT device must verify update signatures under tight CPU and memory limits. How should an architect choose between approved signature implementations?"
  },
  "m410": {
    "difficulty": "medium",
    "opts": [
      "Renew the leaf certificate through the same private issuer",
      "Distribute the verified root through the approved managed trust configuration",
      "Add the root certificate to the chain served by the website",
      "Reissue the leaf certificate with another permitted signature algorithm"
    ],
    "wrongFeedback": {
      "0": "Renewal changes validity dates but does not add the private root to the client trust configuration.",
      "2": "Receiving a root from the server does not make it trusted. Trust anchors must be accepted through a trusted configuration path.",
      "3": "The scenario already specifies a sound chain. Changing its signature algorithm does not establish client trust in its issuer."
    }
  },
  "m127": {
    "exp": "A supply-chain attack abuses a trusted supplier, component or delivery channel to reach downstream customers. Here the vendor update channel distributes malicious code. No particular software vulnerability is required, so the evidence does not establish a zero-day exploit. A known vulnerability remaining unpatched is not automatically a zero-day."
  },
  "m050": {
    "opts": [
      "DNS amplification — DDoS attacks against the DNS server",
      "DNS cache poisoning — forged name-to-address records are stored in the resolver cache",
      "ARP spoofing — interception of Layer 2 frames",
      "BGP hijacking — rerouting internet traffic at the routing level"
    ],
    "exp": "DNS cache poisoning inserts false answers into a resolver cache. It can redirect subsequent name lookups and does not require the attacker to occupy an on-path position. DNSSEC validation can detect forged data for signed zones through a valid trust chain; it does not encrypt queries, establish that a destination is harmless or guarantee availability."
  },
  "m052": {
    "exp": "An insecure direct object reference arises when the server accepts a client-selected object without verifying the caller is authorised for that object and action. Enforce server-side object-level authorisation on every request. Access may legitimately be delegated, so ownership is not the only valid policy. Unpredictable identifiers reduce guessing but do not replace permission checks."
  },
  "m053": {
    "wrongFeedback": {
      "0": "SQL injection inserts malicious SQL syntax into database queries — it is a query manipulation issue, not a memory management issue.",
      "1": "XSS injects JavaScript into web pages — it operates at the web application layer, not at the memory level.",
      "3": "A race condition depends on the timing or ordering of operations. A change between a security check and the subsequent use is one form, called TOCTOU; it is not the definition of every race."
    }
  },
  "m051": {
    "wrongFeedback": {
      "0": "Stored XSS retains malicious content for later rendering. It can affect users who encounter the relevant content, rather than necessarily every visitor.",
      "2": "DOM-based XSS concerns unsafe client-side processing. It can overlap with stored or reflected delivery; this question identifies reflection in the immediate server response.",
      "3": "SQL injection targets database queries — it does not execute JavaScript in victims' browsers."
    }
  },
  "m251": {
    "q": "An attacker compromises a legitimate website frequented by executives in one industry. Its malicious content is served selectively when the web server observes a client source address in the target organisation's range. Which attack is this?"
  },
  "m214": {
    "exp": "A downgrade attack forces weaker protocol or cipher choices than the communicating systems could otherwise use. Disable obsolete options and use protocols that authenticate negotiation. This is distinct from hash collisions, credential guessing or reuse of a captured valid exchange."
  },
  "m646": {
    "q": "A security awareness campaign creates training modules specifically teaching senior executives how to spot highly targeted emails engineered to steal high-level corporate credentials. What attack type is this?"
  },
  "m707": {
    "opts": [
      "Use fresh challenges and reject repeated or expired authentication messages",
      "Encrypt stored passwords without changing the authentication exchange",
      "Shorten session timeouts without tracking previously accepted messages",
      "Digitally sign each message but accept the same signed message repeatedly"
    ],
    "wrongFeedback": {
      "1": "Protecting stored passwords does not provide freshness for an already captured valid exchange.",
      "2": "A shorter timeout limits exposure but can still permit reuse within that window if the protocol accepts repetitions.",
      "3": "A signature can authenticate a message that was captured earlier; replay protection also needs a freshness or uniqueness check."
    }
  },
  "m442": {
    "opts": [
      "Credential dumping from LSASS",
      "Document-initiated script execution",
      "Pass-the-hash authentication",
      "Registry Run-key persistence"
    ]
  },
  "m608": {
    "exp": "A deceptive email impersonating a trusted sender to solicit credentials is phishing. Phishing need not target a large audience; more specific labels depend on evidence of targeting or another delivery channel. Verify requests through a trusted independent route and report suspicious messages."
  },
  "m019": {
    "wrongFeedback": {
      "0": "Encryption transforms data using an algorithm and key — the ciphertext still has a mathematical relationship to the plaintext. Encryption is reversible with the key.",
      "1": "A one-way digest does not provide the vault-backed recovery of the original value described here.",
      "3": "Masking obscures values for display or processing and can be used in production or test systems. The defining clue here is replacement with a token linked to a protected vault."
    }
  },
  "m021": {
    "wrongFeedback": {
      "0": "Public cloud is provisioned for open use by the general public. Dedicated hardware options can exist within a public-cloud service; exclusivity to one organisation defines private cloud.",
      "1": "A community cloud is shared among organizations with similar needs (e.g. government agencies or healthcare orgs).",
      "2": "Hybrid cloud combines distinct cloud infrastructures bound for portability or coordinated use. The scenario describes exclusive organisational use rather than such a combination."
    }
  },
  "m060": {
    "q": "A PaaS agreement assigns maintenance of the managed runtime and its orchestration layer to the provider. An application is compromised through a flaw in that layer. Who owns remediation of that platform flaw under the agreement?",
    "opts": [
      "The customer application development team",
      "The cloud provider operating the managed platform",
      "The customer tenant-identity administrators",
      "The customer data-governance team"
    ],
    "exp": "The provider owns remediation of the specified managed-platform flaw under this agreement. Customers still coordinate incident response and address their application, identity, data and configuration duties. Service contracts determine the allocation; this is not a complete legal-liability finding.",
    "wrongFeedback": {
      "0": "Application developers own their code and dependencies under the service terms, but the stated flaw is in the provider-managed platform.",
      "2": "Tenant-identity administration is a customer duty but does not confer control of the provider-managed orchestration layer.",
      "3": "Data governance remains important after a breach, but it is not ownership of this platform patch."
    }
  },
  "m058": {
    "exp": "With SaaS, the provider operates the application and underlying service stack. Customers typically retain duties for their identities, access policies, tenant settings, data handling, integrations and endpoints. Exact responsibility boundaries depend on the service and contract; using SaaS does not transfer every security obligation."
  },
  "m147": {
    "exp": "Segmentation with tested firewall rules can deny guest-to-corporate traffic while permitting the required internet path. Validate routing and all permitted paths. A VLAN name alone does not establish isolation, and wireless encryption does not define routed access permissions.",
    "q": "An organisation requires its guest Wi-Fi clients to have internet access but no permitted path to internal corporate services. Which control most directly enforces that boundary?"
  },
  "m161": {
    "q": "Which deployment model connects an organisation's on-premises private cloud with a public cloud using technology that supports coordinated workload movement?",
    "exp": "Hybrid cloud combines distinct cloud infrastructures that remain separate entities but are bound for portability or coordinated use. This private/public combination is one example. Merely owning an on-premises server or using two unrelated providers does not establish hybrid integration. Data-location and legal requirements must be evaluated separately."
  },
  "m065": {
    "q": "A private cloud serves one organisation's finance and development teams. Which control most directly limits a compromised development workload from accessing finance data?",
    "opts": [
      "Enforce workload segmentation and narrowly scoped service identities",
      "Filter internet ingress at the perimeter while leaving internal workloads mutually reachable",
      "Set CPU and memory quotas for development workloads",
      "Use private IP addresses for both teams without changing internal access rules"
    ],
    "exp": "Private cloud means exclusive organisational use, not automatic trust among internal workloads. Segmentation and narrowly scoped workload identities directly limit cross-team access. Verify the effective network and application permissions.",
    "wrongFeedback": {
      "1": "Perimeter filtering controls external entry but leaves the specified internal path open.",
      "2": "Resource quotas address capacity consumption rather than authorisation to finance data.",
      "3": "Private addressing is not an authorisation mechanism; internal routes and permissions can still permit access."
    }
  },
  "m417": {
    "opts": [
      "During production configuration-drift monitoring",
      "During requirements review before templates are written",
      "In the pipeline before provisioning",
      "During periodic independent compliance assessment"
    ],
    "wrongFeedback": {
      "0": "Drift monitoring is valuable after deployment but cannot gate creation of the new environment.",
      "1": "Requirements review can prevent design mistakes, but the template must exist for the specified template scan.",
      "3": "Periodic assessment provides assurance but does not check and gate each proposed provisioning change."
    }
  },
  "m451": {
    "q": "All application pods can use the same Kubernetes service-account token with cluster-admin privileges. What is the most direct security consequence if one workload is compromised?",
    "opts": [
      "The shared identity forces the pods to share a single memory address space",
      "The usable token can authorise powerful API actions beyond the compromised workload",
      "The shared identity removes resource quotas from every namespace",
      "The shared identity disables image-signature checks at the registry"
    ],
    "wrongFeedback": {
      "0": "Service-account identity controls API authorisation, not the process memory isolation mechanism.",
      "2": "Quotas are separately configured. An overprivileged credential may allow changing controls, but identity sharing does not automatically remove them.",
      "3": "Registry and image-admission controls are separate settings; sharing an API identity does not itself disable verification."
    }
  },
  "m218": {
    "exp": "A retinal scan measures an inherent biological characteristic, so it belongs to something you are. The core factor categories are knowledge, possession and inherence. Geolocation can inform a contextual access decision but does not by itself count as an independent MFA factor.",
    "wrongFeedback": {
      "0": "A retinal pattern is measured from the person, not recalled from memory.",
      "1": "Possession factors are items such as tokens. A retina is an inherent biological characteristic.",
      "3": "Location is a contextual risk signal rather than the inherence characteristic measured by the retinal scan; it is not a substitute for an MFA factor."
    }
  },
  "m216": {
    "opts": [
      "TOTP-based MFA",
      "Certificate-based smart card authentication",
      "FIDO2 / WebAuthn public-key authentication",
      "RADIUS challenge-response authentication"
    ]
  },
  "m067": {
    "exp": "COPE means corporate-owned, personally enabled: the organisation owns the device and permits personal use under its policy. BYOD is user-owned; CYOD means selecting from an approved device list, with ownership and management depending on the programme. An ownership label alone does not guarantee a particular level of technical control.",
    "q": "An organisation owns employees' phones and explicitly permits limited personal use under its management policy. Which deployment-model name most specifically describes this arrangement?",
    "wrongFeedback": {
      "0": "BYOD describes user-owned devices, whereas the organisation owns these phones.",
      "1": "CYOD describes selection from an approved list. It does not by itself specify this ownership and personal-use arrangement.",
      "3": "COBO limits corporate-owned devices to business use, whereas personal use is explicitly allowed here."
    },
    "difficulty": "easy"
  },
  "m068": {
    "wrongFeedback": {
      "0": "A penetration test involves actively attempting to compromise systems.",
      "1": "A red team exercise is an active adversarial simulation — much more intensive than a tabletop discussion.",
      "3": "Chaos engineering uses controlled failure experiments to learn about resilience. These can occur in test or production environments with safeguards; this scenario instead describes a discussion-based exercise."
    }
  },
  "m071": {
    "exp": "Validate that remediation actually removed the applicable vulnerable condition and preserved service health. A suitable rescan, version/configuration checks and required reboot or functional tests can provide evidence. A patch-success message alone is insufficient, and a clean scan does not prove the absence of every vulnerability.",
    "wrongFeedback": {
      "0": "Closure should be supported by evidence of effective remediation, not just an installation or ticket status.",
      "2": "Notifying all users is rarely appropriate for routine patching and may cause unnecessary alarm.",
      "3": "Archiving patches is good housekeeping but is not the immediate next step."
    }
  },
  "m072": {
    "wrongFeedback": {
      "0": "Privilege escalation is gaining permissions beyond those intended, through flaws, misconfiguration or credential misuse. The scenario instead concerns access accumulating through legitimate role assignments that were not removed.",
      "1": "Account lockout is triggered by failed authentication attempts — unrelated to permission accumulation.",
      "3": "Separation of duties prevents one person from completing a sensitive process end-to-end — this scenario is about accumulated permissions."
    }
  },
  "m078": {
    "exp": "A packet capture records packets visible at its collection point, subject to filters, capture length and packet loss. It can retain payload bytes when configured to capture them, though encryption may keep the contents unreadable. Ordinary flow records summarise connections, addresses, ports and volume rather than retaining full payloads."
  },
  "m160": {
    "exp": "Assess whether the dependency version and vulnerable feature are present and reachable, then test and deploy the appropriate fixed version or replacement. Verify the effective dependency and application behaviour afterward. Network restrictions or a WAF can reduce interim exposure, but do not repair the library flaw or guarantee coverage of all attack paths."
  },
  "m169": {
    "exp": "Use the authorised response plan to promptly contain the confirmed destructive activity and limit spread. Network isolation can reduce lateral movement but may not stop encryption already executing locally. Coordinate endpoint action, feasible evidence preservation, safety and recovery; response activities can overlap.",
    "q": "Responders confirm that ransomware is actively spreading between workstations. The response plan authorises immediate network isolation, and no safety-critical process depends on their connectivity. Which action should they prioritise?"
  },
  "m179": {
    "exp": "Anomaly detection compares activity with an established baseline and flags deviations for investigation. Heuristics apply rules or behavioural indicators of suspicious activity, including network or endpoint patterns. These approaches can overlap; neither an anomaly nor a heuristic match alone proves maliciousness, and false-positive rates depend on implementation and tuning."
  },
  "m184": {
    "exp": "NAC can use a posture assessment to decide whether a device meets admission policy. Depending on the policy and deployment, a noncompliant device may be denied, quarantined or directed to remediation. Assessment does not guarantee that every weakness was detected or fixed."
  },
  "m244": {
    "q": "Two otherwise comparable servers have the same network-exploitable vulnerability and business impact. One has tested access restrictions that allow connections only from a small set of managed application hosts. Which factor can justify a lower remediation priority for that server?",
    "opts": [
      "The greater age of the vulnerability",
      "The verified reduction in reachable attack paths",
      "The higher labour cost of installing its patch",
      "The longer time since its last routine scan"
    ],
    "wrongFeedback": {
      "0": "Older vulnerabilities may still be widely exploited; age alone does not reduce urgency.",
      "2": "Labour cost affects treatment planning, but does not itself reduce exploitability or impact.",
      "3": "An older scan does not reduce risk and can leave uncertainty about the current state."
    }
  },
  "m270": {
    "q": "After a penetration test, a finding recommends \"implementing secure headers.\" Which HTTP security header instructs the browser to only connect to the site over HTTPS and to remember this policy for a specified duration, preventing SSL stripping attacks? Assume the browser has already learned the HSTS policy over a valid HTTPS connection."
  },
  "m408": {
    "opts": [
      "Requiring physical touch to establish user presence",
      "Requiring PIN or biometric verification before authorising a signature",
      "Using a different public-key credential for each relying party",
      "Storing only the credential public key at the portal"
    ],
    "wrongFeedback": {
      "0": "A person who finds the key can touch it. Presence alone does not establish the required user verification.",
      "2": "Relying-party scoping limits credential use across sites but does not identify the person currently holding the lost key.",
      "3": "Server-side public-key storage protects against disclosure of a shared login secret; it does not by itself verify the holder of a stolen authenticator."
    }
  },
  "m425": {
    "opts": [
      "The units use different formatting for the same scanner report",
      "Local exposure, impact and controls differ",
      "The same advisory was published on different local report dates",
      "The units assign different ticket numbers to the finding"
    ],
    "wrongFeedback": {
      "0": "Report formatting does not change exposure or business consequences.",
      "2": "A report date may affect workflow, but a date difference alone does not explain the underlying risk priority.",
      "3": "Tracking identifiers organise work; they do not establish the likelihood or impact of exploitation."
    }
  },
  "m426": {
    "opts": [
      "It relies on remotely advertised service banners instead of host state",
      "It can inspect installed packages, patch state and configuration through authorised host access",
      "It demonstrates impact by exploiting every detected flaw on the host",
      "It assesses powered-off hosts using the same network connection"
    ],
    "wrongFeedback": {
      "0": "Banner inspection is possible without host credentials and can miss local patch or configuration evidence.",
      "2": "Authenticated scanning is not equivalent to authorised exploitation of every finding; scan permissions and safe checks still matter.",
      "3": "Credentials do not make an offline host reachable. Offline assessment needs a different supported data source or method."
    }
  },
  "m730": {
    "opts": [
      "An address is observable and can be impersonated; it is not cryptographic proof of device identity",
      "It checks the device manufacturer rather than the configured address entries",
      "It loses every allowed entry whenever the access point reboots",
      "It requires a separate address for every application on the device"
    ],
    "wrongFeedback": {
      "1": "An allowlist compares configured address entries; manufacturer prefixes do not provide device authentication.",
      "2": "Persistence depends on configuration and storage. The fundamental weakness is address impersonation, not an inevitable reboot reset.",
      "3": "A MAC address identifies an interface at the link layer, not each application. Application-specific addresses are not required."
    }
  },
  "m175": {
    "exp": "For a role change, review existing permissions against the new duties, revoke access no longer required and approve needed new access. Validate any justified transition period rather than allowing old entitlements to accumulate. Verify the resulting access across connected systems."
  },
  "m724": {
    "wrongFeedback": {
      "0": "Chain of custody documents possession, handling and transfers. Integrity checks and controlled preservation are also needed; a custody log alone cannot guarantee that evidence was unaltered.",
      "1": "Incorrect: A legal hold is a directive sent by an organization's legal counsel to preserve relevant data and suspend normal document retention/destruction policies. It is a component or prerequisite of e-discovery, but it does not represent the broader overall discovery and production process itself.",
      "2": "Incorrect: Forensic imaging is the act of creating a bit-stream, sector-by-sector copy of a digital storage medium for deep technical examination, which is a specialized data acquisition technique rather than the end-to-end legal discovery workflow.",
      "3": ""
    }
  },
  "m029": {
    "q": "An organisation values a server at $500,000. A flood would destroy 60% of that value, and the estimated annualised rate of occurrence is 0.10 events per year. What is the annualised loss expectancy (ALE)?"
  },
  "m030": {
    "q": "An EU-established controller no longer needs a customer's personal data for its original purpose. The customer makes a valid request for deletion, with no applicable retention exception. Which GDPR right is being exercised?",
    "exp": "GDPR Article 17 establishes a right to erasure under specified grounds, subject to exceptions such as legal retention duties and certain public-interest needs. The question states that the request qualifies; erasure is not an unconditional duty to delete every record on demand.",
    "opts": [
      "Right of access",
      "Right to rectification",
      "Right to erasure",
      "Right to restriction of processing"
    ],
    "wrongFeedback": {
      "0": "Access concerns obtaining information about processing and a copy of personal data, rather than deletion.",
      "1": "Rectification corrects inaccurate or incomplete personal data rather than deleting data that qualifies for erasure.",
      "3": "Restriction limits processing under its conditions; it does not mean the data must be erased."
    },
    "difficulty": "easy"
  },
  "m082": {
    "wrongFeedback": {
      "0": "GDPR governs personal-data processing within its territorial scope, including specified EU establishment, offering and monitoring circumstances. It is not the US covered-healthcare regime asked about here.",
      "1": "PCI DSS applies to payment card data — it does not govern medical records.",
      "3": "SOX applies to financial reporting by publicly traded companies — it does not specifically address healthcare data security."
    },
    "q": "A US hospital is a HIPAA-covered entity and electronically transmits patient records to a health insurer. Which regulation primarily governs protection of that health information?",
    "exp": "HIPAA applies to covered entities and relevant business associates handling protected health information. Its Security Rule addresses electronic PHI. Health-related data is not automatically HIPAA-regulated in every organisation; the question explicitly supplies covered-entity scope."
  },
  "m087": {
    "exp": "Risk avoidance ends or declines the defined activity that creates the exposure. This avoids that activity's future risk while other risks, retained information and outstanding obligations may remain. Mitigation reduces likelihood or impact; transfer allocates specified consequences; acceptance is an authorised decision to retain risk and monitor it."
  },
  "m032": {
    "opts": [
      "The system must back up data every 4 hours",
      "The target is to restore an acceptable payment service within four hours after disruption",
      "The system can afford to lose 4 hours of data",
      "The average repair duration across past incidents is four hours"
    ],
    "exp": "RTO is a target duration for restoring an acceptable service level following disruption. It should fit within the business's overall tolerable interruption and does not guarantee successful recovery. RPO concerns data loss; average repair time is a different measure.",
    "wrongFeedback": {
      "0": "Backup frequency is related to RPO (Recovery Point Objective), not RTO.",
      "2": "The amount of acceptable data loss is the RPO (Recovery Point Objective). RTO concerns restoration TIME.",
      "3": "Average repair duration is MTTR, whereas the RTO is the planned restoration target for this service."
    }
  },
  "m093": {
    "exp": "An audit evaluates evidence against specified criteria and reports conformity or gaps within its scope. A penetration test attempts authorised attacks to demonstrate impact. An audit may include technical testing or use penetration-test results; the purposes differ even when activities overlap. Threat intelligence can use both internal and external evidence."
  },
  "m100": {
    "exp": "A right-to-audit clause gives the customer defined contractual rights to obtain evidence or examine relevant supplier controls, subject to agreed scope and procedures. It supports ongoing assurance but does not guarantee unrestricted access. Independent assurance reports, other contractual evidence and applicable regulatory rights can also inform oversight."
  },
  "m155": {
    "exp": "Threat modelling during design identifies assets, trust boundaries, abuse cases and controls while changes are still easier to make. This can reduce later rework and security defects. Continue validation throughout development and operation; no phase guarantees a universal cost saving.",
    "q": "Which security activity identifies assets, trust boundaries, potential threats and security requirements during system design, before code is written?"
  },
  "m188": {
    "q": "An authorised risk owner decides to retain a vulnerability after comparing treatment costs, expected loss and risk tolerance. No mandatory remediation duty applies. The decision, monitoring and review date are documented. Which risk response is this?",
    "exp": "Informed acceptance can be appropriate when the authorised owner judges the residual exposure within tolerance after considering cost, impact, alternatives and mandatory duties. Record ownership, the rationale, monitoring and a review trigger. A control costing more than expected loss does not by itself override legal or contractual obligations."
  },
  "m195": {
    "q": "An accredited certification body completes its ISO/IEC 27001 assessment and makes a successful certification decision for the defined ISMS scope. Which result is issued?",
    "exp": "A successful ISO/IEC 27001 certification process results in a certificate for the assessed ISMS scope. An ordinary external audit does not automatically issue certification. Certification is assurance within its scope, not proof of zero vulnerabilities. SOC 2 is a different assurance report; NIST CSF Profiles and Tiers support risk management rather than issuing this certificate."
  },
  "m502": {
    "q": "Which metric most directly tracks employee security behaviour, rather than the volume of security-awareness programme activity?"
  },
  "m054": {
    "exp": "A worm is defined by self-propagation. The scenario describes automatic network spread by exploiting vulnerabilities. Other malware labels describe different dimensions and can overlap: a worm can carry ransomware or a disguised payload.",
    "wrongFeedback": {
      "0": "A virus replicates through a host file or other host content. The scenario instead describes autonomous network propagation.",
      "2": "Trojan describes deception through apparently legitimate software, not the self-propagation mechanism shown here.",
      "3": "Ransomware describes extortion through denied access or related malicious activity, not the propagation mechanism. A worm can carry a ransomware payload."
    }
  },
  "m183": {
    "opts": [
      "Retaining and searching centralised event records",
      "Coordinating response actions through playbooks",
      "Correlating events against detection rules",
      "Displaying event trends and investigation dashboards"
    ],
    "wrongFeedback": {
      "0": "Central log retention and search are established SIEM capabilities rather than the distinguishing response orchestration function.",
      "2": "Detection-rule correlation is a core SIEM capability. The distinction asked about is coordinating response actions.",
      "3": "SIEMs commonly provide dashboards and investigation views; visualisation alone is not response orchestration."
    }
  },
  "m185": {
    "opts": [
      "STIX for exchange and TAXII for formatting",
      "STIX for formatting and TAXII for exchange",
      "CVSS for threat-indicator formatting and SCAP for indicator exchange",
      "Syslog for threat-object relationships and TLS for indicator definitions"
    ],
    "wrongFeedback": {
      "0": "This reverses the roles: STIX models the information and TAXII exchanges it.",
      "2": "CVSS expresses vulnerability severity and SCAP standardises assessment content; this is not the threat-information model and exchange pair.",
      "3": "Syslog transports event messages and TLS protects transport. Neither supplies the structured threat-object model specified here."
    }
  },
  "m217": {
    "exp": "In this federation flow, the identity provider authenticates the user or relies on a valid authenticated session, then issues a signed SAML assertion. The service provider validates the expected issuer, signature, audience, timing and protocol protections before applying its own authorisation policy. Trusting an IdP does not automatically grant every asserted user unrestricted access."
  },
  "m714": {
    "opts": [
      "Verify a fresh TPM-backed attestation quote and the measured-boot evidence against the baseline",
      "Accept an unsigned list of startup files from the OS",
      "Enable full-disk encryption without measuring startup components",
      "Compare the current report with a previously captured signed attestation without checking freshness"
    ],
    "wrongFeedback": {
      "1": "A compromised OS can falsify an unprotected local report.",
      "2": "Disk encryption protects stored data but is not itself evidence that measured startup state matches an approved baseline.",
      "3": "A previously valid attestation can be replayed. The verifier needs fresh evidence bound to this assessment as well as a trusted baseline."
    }
  },
  "m091": {
    "wrongFeedback": {
      "0": "An MOU usually describes shared intentions or cooperation. Its legal effect depends on wording and jurisdiction; measurable service commitments are the SLA function asked about here.",
      "2": "An NDA protects confidential information from disclosure — it does not define service performance standards.",
      "3": "An MSA establishes the general terms of an ongoing business relationship — specific performance targets are defined in subsequent SLAs or SOWs."
    }
  },
  "m099": {
    "exp": "PCI DSS defines security requirements for payment-card account data and relevant environments. Scope includes entities that store, process or transmit such data and systems or services that can affect its security. It is an industry standard, and applicable requirements depend on the assessed role and environment."
  },
  "m084": {
    "exp": "A guideline provides recommended practices where flexibility is allowed. In this scenario, compliance is encouraged rather than mandatory. It does not override binding policies, standards or other obligations."
  },
  "m028": {
    "exp": "A standard sets specific measurable requirements (e.g. minimum password length of 12). Standards are mandatory and derived from policies. A policy states the 'what' (must use strong passwords); a standard states the 'how much' (at least 12 characters). The number is an example organisational requirement, not a claim that 12 characters is a universal current password minimum."
  },
  "m031": {
    "wrongFeedback": {
      "0": "Avoidance stops or declines the defined activity that creates exposure. Buying insurance retains the activity while transferring specified financial consequences.",
      "1": "Risk mitigation implements controls to reduce the likelihood or impact of the risk (e.g. deploying MFA or encryption).",
      "2": "",
      "3": "Acceptance is an authorised decision to retain risk, normally with documentation and monitoring. Insurance instead transfers covered financial consequences."
    }
  },
  "m172": {
    "exp": "A credentialed scan uses approved host access to inspect supported software, patch and configuration evidence. It can reveal details not visible through unauthenticated network probing, but accuracy and coverage still depend on permissions, scanner support and validation. Passive monitoring observes traffic rather than logging into the host."
  },
  "m389": {
    "q": "A development team needs realistic customer-like test data but does not need actual customer identities or production records. Which approach most directly avoids exposing real personal data?"
  }
};

export const SECOND_PASS_PBQ_REVIEW = {
  "p015": {
    "title": "Assess suspicious authentication activity",
    "choices": [
      "Escalate as credential stuffing based on the use of several source addresses",
      "Investigate the later successful session and correlate it with the preceding attempts",
      "Escalate as password spraying based on the number of usernames shown",
      "Escalate as token replay based on the later successful authentication"
    ]
  },
  "p016": {
    "choices": [
      "Provider infrastructure operations, because it operates the physical hosts",
      "Customer operations, because the agreement assigns guest patching and database configuration to it",
      "Provider facilities management, because both failures affected a hosted system",
      "The operating-system vendor, because publishing the update transfers installation duties to it"
    ],
    "wrongFeedback": {
      "0": "Operating the physical host does not make the provider responsible for the explicitly customer-managed guest tasks.",
      "2": "Facilities controls do not own guest operating-system and database settings under the supplied agreement.",
      "3": "A vendor may publish fixes, but the stated customer duty includes applying applicable guest updates."
    }
  },
  "p022": {
    "choices": [
      "Virtualisation layer — the managed hypervisor",
      "Guest operating-system layer — the VM kernel",
      "Runtime layer — the application middleware",
      "Application layer — the customer code"
    ]
  },
  "p025": {
    "choices": [
      "Roll back the newly installed service before activating the incident plan",
      "Invoke the ransomware response plan and promptly contain the affected host",
      "Restore finance files on the still-connected host before investigating the active process",
      "Begin external attribution from the proxy destination before limiting encryption"
    ],
    "wrongFeedback": {
      "0": "A service rollback alone may miss active encryption or other persistence; coordinate containment under the response plan.",
      "2": "Restoring files while destructive execution continues can lead to immediate re-encryption and evidence loss.",
      "3": "Attribution work should not delay proportionate action against confirmed ongoing destructive activity."
    }
  },
  "p034": {
    "choices": [
      "Require a password reset at the next sign-in while leaving existing sessions active",
      "Temporarily restrict the account, revoke sessions and verify through a trusted independent channel",
      "Monitor until the sensitive export finishes before deciding whether to intervene",
      "Block the second source address while leaving the account and active tokens usable"
    ],
    "wrongFeedback": {
      "0": "A later reset can leave the suspicious current session able to continue its sensitive action.",
      "2": "The authorised plan permits proportionate containment of this combined pattern; waiting for completion risks avoidable disclosure.",
      "3": "A source-only block can be bypassed through another address or an existing token; the account and sessions require attention."
    }
  },
  "p040": {
    "choices": [
      "Prioritise investigation of plaintext password recovery from the named tool alone",
      "Investigate possible credential access and lateral movement using the correlated process and remote-logon sequence",
      "Classify the privileged logon event alone as an exploit-driven privilege escalation",
      "Classify the explicit-credential event alone as pass-the-hash authentication"
    ]
  },
  "p051": {
    "choices": [
      "The interpreter is PowerShell rather than the organisation's usual command shell",
      "The command uses encoded content, runs hidden, and retrieves a remote script from an unfamiliar host",
      "The connection uses TCP 443 rather than the endpoint's usual HTTP port",
      "The script runs under the signed-in user rather than the local system account"
    ],
    "wrongFeedback": {
      "0": "An interpreter change may deserve context, but PowerShell is a legitimate tool; the combined execution and retrieval behaviour is more specific.",
      "2": "Port choice alone does not determine legitimacy or prove encryption. The process and retrieval context is more informative.",
      "3": "Malicious code can run with ordinary user permissions. The user context alone is less specific than the correlated behaviour."
    }
  },
  "p057": {
    "choices": [
      "Verify the detached signature against the package using the trusted vendor public key",
      "Compare a locally computed digest with an unsigned checksum from the same unverified download mirror",
      "Check that the signature file has the expected name and size",
      "Validate the TLS certificate of the download site without checking the package signature"
    ],
    "wrongFeedback": {
      "1": "An unsigned checksum from an untrusted source can be replaced with the package; it does not verify the vendor signature.",
      "2": "A filename and size do not establish that the signature cryptographically matches the package.",
      "3": "Transport validation protects a connection but does not perform the requested detached vendor-signature verification."
    }
  },
  "p058": {
    "difficulty": "easy",
    "question": "Which change directly checks proposed passwords against values already known to be compromised?",
    "choices": [
      "Increase the minimum password length",
      "Screen proposed passwords against a compromised-password blocklist",
      "Extend password history to the last 24 values",
      "Require two different character classes in each password"
    ],
    "wrongFeedback": {
      "0": "Longer passwords can improve resistance to guessing, but a known compromised value can still meet the length requirement.",
      "2": "History prevents reuse of that account's previous values; it does not screen a wider breached-password corpus.",
      "3": "A compromised password can satisfy composition rules, so those rules do not perform the required check."
    }
  },
  "p094": {
    "choices": [
      "Apply a documented, time-limited exception matching the approved test conditions and validate retained detection",
      "Suppress authentication alerts for every account used by the test until the next quarterly review",
      "Exclude the test source from authentication alerts for the remainder of the month",
      "Double the failure threshold globally and retain the same time window"
    ],
    "wrongFeedback": {
      "1": "An account-wide exception extending beyond the approved window can hide unrelated attacks against those identities.",
      "2": "A month-long source exception outlives the two-hour authorisation and can hide later activity.",
      "3": "A global threshold change affects every user and source rather than isolating the verified test noise."
    }
  },
  "p024": {
    "targets": [
      {
        "id": "1",
        "label": "Aggregate and correlate logs from multiple sources for investigation and alerting"
      },
      {
        "id": "2",
        "label": "Observe suspicious traffic and alert from an out-of-band sensor"
      },
      {
        "id": "3",
        "label": "Inspect traffic inline and block according to prevention rules"
      },
      {
        "id": "4",
        "label": "Detect or restrict sensitive-data use and movement under policy"
      },
      {
        "id": "5",
        "label": "Apply HTTP-aware filtering to web application requests"
      }
    ],
    "difficulty": "easy"
  },
  "p079": {
    "targets": [
      {
        "id": "t0",
        "label": "Reduce stored-data disclosure after device theft when decryption keys remain protected"
      },
      {
        "id": "t1",
        "label": "Collect endpoint behaviour and support detection, investigation and response"
      },
      {
        "id": "t2",
        "label": "Restrict execution according to an approved application policy"
      },
      {
        "id": "t3",
        "label": "Filter host network connections according to source, destination and service rules"
      },
      {
        "id": "t4",
        "label": "Remediate addressed software vulnerabilities through tested updates"
      }
    ],
    "difficulty": "easy"
  },
  "p096": {
    "items": [
      {
        "id": "o0",
        "label": "Continuously monitor risks, control effectiveness, and changes in the threat landscape",
        "explanation": "Monitoring checks treatment effectiveness and new conditions, feeding the next assessment."
      },
      {
        "id": "o1",
        "label": "Implement the approved risk-treatment decision",
        "explanation": "Implement the approved treatment and assign ownership; acceptance and transfer need not mean deploying a technical control."
      },
      {
        "id": "o2",
        "label": "Identify assets, threats to those assets, and existing vulnerabilities",
        "explanation": "Identify assets, threats and vulnerabilities before analysing the stated risks."
      },
      {
        "id": "o3",
        "label": "Select the appropriate risk treatment strategy (mitigate, accept, transfer, avoid)",
        "explanation": "Choose treatment in light of assessed exposure, tolerance, feasibility and authority."
      },
      {
        "id": "o4",
        "label": "Analyse likelihood and impact using the approved assessment method",
        "explanation": "Analyse likelihood and impact using an appropriate method and explicit assumptions."
      }
    ],
    "scenario": "Arrange the activities in a risk-treatment cycle, starting from identifying the exposure and ending with ongoing review of treatment effectiveness. Select and approve a response before implementing it; feed new information into subsequent assessments."
  },
  "p004": {
    "scenario": "Arrange the activities for a ransomware incident using the classic Security+ response flow. Plans and tools exist before the event; restore service after addressing the malicious cause and conclude with a retrospective. Real incidents can revisit or overlap activities."
  },
  "p026": {
    "scenario": "A data centre is damaged. Emergency responders have confirmed personnel are safe, and a prepared recovery site is available. Arrange the recovery tasks so the activation decision is authorised, restored service is validated before user cutover, and the experience informs future planning."
  },
  "p038": {
    "scenario": "Arrange these work packages for an authorised penetration test. Written scope and passive reconnaissance precede active probing; assess permitted impact after successful exploitation. The engagement requires verified cleanup before delivery of its final report. Safety and urgent findings are communicated throughout."
  },
  "p064": {
    "scenario": "An organisation is establishing a vulnerability programme with no reliable asset inventory. Arrange the work so scanning has an authorised scope, treatment decisions use validated findings, and closure is supported by evidence that the changes worked."
  },
  "p075": {
    "scenario": "Arrange these activities in this team's release workflow. Design security requirements precede implementation. Static checks run during coding; peer review gates merge. Dynamic checks run against the merged staging build, followed by a final authorised penetration test before release."
  },
  "p035": {
    "blanks": [
      {
        "id": "a",
        "sentence": "A ___ is an intermediary server that sits between clients and the internet, forwarding requests on behalf of clients and optionally caching responses.",
        "answer": "Proxy server",
        "hint": "Forwards requests on behalf of clients",
        "explanation": "A forward proxy makes or forwards requests on clients' behalf and can apply policy."
      },
      {
        "id": "b",
        "sentence": "A ___ provides a monitored administrative entry path into a protected network.",
        "answer": "Jump server",
        "hint": "Controlled administrative entry point",
        "explanation": "A jump server provides the specified controlled administration path into a protected zone."
      },
      {
        "id": "c",
        "sentence": "A ___ (DMZ) is a network segment between the internal network and the internet, hosting public-facing services like web servers.",
        "answer": "Demilitarised Zone",
        "hint": "Between internal and external networks",
        "explanation": "A DMZ is a screened network zone for services with different exposure requirements."
      },
      {
        "id": "d",
        "sentence": "___ inspection tracks the state of active TCP connections and allows return traffic for established sessions while blocking unsolicited inbound packets.",
        "answer": "Stateful",
        "hint": "Tracks connection ___",
        "explanation": "Stateful inspection uses tracked connection state rather than only independent packet fields."
      },
      {
        "id": "e",
        "sentence": "An ___ detects suspicious traffic and alerts — it does NOT actively block. An IPS sits inline and DOES block suspicious traffic.",
        "answer": "IDS",
        "hint": "Intrusion Detection System",
        "explanation": "The passive IDS alerts; inline prevention is the IPS role described."
      }
    ],
    "difficulty": "easy"
  },
  "p005": {
    "difficulty": "easy"
  },
  "p011": {
    "difficulty": "easy"
  },
  "p029": {
    "difficulty": "easy"
  },
  "p031": {
    "difficulty": "easy"
  },
  "p041": {
    "difficulty": "easy"
  },
  "p046": {
    "difficulty": "easy"
  },
  "p050": {
    "difficulty": "easy"
  },
  "p052": {
    "difficulty": "easy"
  },
  "p054": {
    "difficulty": "easy"
  },
  "p056": {
    "difficulty": "easy"
  },
  "p062": {
    "difficulty": "easy"
  },
  "p013": {
    "difficulty": "medium"
  }
};
