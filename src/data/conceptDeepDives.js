export const CONCEPT_DEEP_DIVES = [
  {
    id: "ipsec-secure-media",
    chapter: 3,
    category: "Network Security",
    title: "IPsec, VPNs, and Secure Real-Time Media",
    subtitle: "Choose ESP, AH, tunnel mode, and SRTP for the protection the scenario actually needs.",
    summary: "IPsec protects IP traffic at the network layer, while SRTP protects real-time audio and video at the application layer. The exam usually tests what each protocol protects, whether confidentiality is present, and why an otherwise valid protocol may be a poor operational choice.",
    minutes: 9,
    difficulty: "Core",
    aliases: ["IPsec", "ESP", "AH", "SRTP", "site-to-site VPN", "tunnel mode", "transport mode"],
    objectives: [
      "Separate confidentiality, integrity, authentication, and anti-replay properties.",
      "Explain when tunnel mode and transport mode are used.",
      "Recognise why AH is uncommon on modern NAT-heavy networks.",
    ],
    sections: [
      {
        title: "Start with the security property",
        body: [
          "Encapsulating Security Payload (ESP) can provide confidentiality, integrity, data-origin authentication, and anti-replay protection. Encryption is optional in the standard, so an integrity-only ESP configuration is possible, although encryption plus integrity is the common expectation.",
          "Authentication Header (AH) provides integrity, data-origin authentication, and anti-replay protection but not confidentiality. Because AH authenticates parts of the IP header that Network Address Translation changes, it is difficult to use through NAT and is uncommon compared with ESP.",
        ],
        table: {
          columns: ["Protocol", "Primary job", "Confidentiality?", "Exam clue"],
          rows: [
            ["ESP", "Protect IP payloads", "Yes, when encryption is enabled", "A VPN needs privacy and integrity"],
            ["AH", "Authenticate IP traffic and detect changes", "No", "Integrity without hiding the payload"],
            ["SRTP", "Protect RTP voice/video media", "Yes", "Secure a live call or media stream"],
          ],
        },
      },
      {
        title: "Modes and practical deployment",
        body: [
          "Transport mode normally protects the upper-layer payload while retaining the original IP header. Tunnel mode encapsulates the original packet inside a new IP packet and is common for gateway-to-gateway site-to-site VPNs. A site-to-site VPN is often long-lived or automatically re-established, but it is not inherently permanent.",
          "SRTP is not a replacement for IPsec. It is designed specifically for RTP media and protects the media even when the network path changes. Signalling, identity, and key management still need their own protection.",
        ],
      },
    ],
    traps: [
      "AH does not encrypt data.",
      "ESP is not limited to encryption; it can also provide integrity and authentication.",
      "A site-to-site VPN describes the endpoints and scope, not a guarantee that the tunnel never drops.",
    ],
    check: {
      question: "A company needs a gateway-to-gateway VPN through NAT that hides and authenticates internal traffic. Which broad choice fits best?",
      answer: "IPsec ESP in tunnel mode. ESP supplies confidentiality and integrity, tunnel mode encapsulates the original packet, and ESP is much more NAT-compatible than AH when NAT traversal is used.",
    },
    sources: [
      { label: "IETF RFC 4303 — ESP", url: "https://www.rfc-editor.org/info/rfc4303" },
      { label: "IETF RFC 4302 — AH", url: "https://www.rfc-editor.org/info/rfc4302/" },
      { label: "IETF RFC 3711 — SRTP", url: "https://www.rfc-editor.org/info/rfc3711" },
    ],
  },
  {
    id: "wifi-access-defense",
    chapter: 3,
    category: "Network Security",
    title: "Wi-Fi Security: CCMP, WPA3, 802.1X, and Wireless Attacks",
    subtitle: "Connect encryption, authentication, and radio-layer attacks without mixing their jobs.",
    summary: "Wireless questions become easier when you separate three layers: how a user or device authenticates, how frames are encrypted, and how an attacker abuses the radio or management plane. PSK and 802.1X are access models; CCMP and TKIP are protection suites.",
    minutes: 11,
    difficulty: "Core",
    aliases: ["CCMP", "TKIP", "PSK", "802.1X", "WPA3", "SAE", "EAP", "RADIUS", "jamming", "deauthentication", "disassociation", "MAC spoofing", "SSID"],
    objectives: [
      "Distinguish personal and enterprise authentication models.",
      "Explain why CCMP replaced TKIP.",
      "Classify jamming, deauthentication, disassociation, MAC spoofing, and SSID discovery.",
    ],
    sections: [
      {
        title: "Authentication is not encryption",
        body: [
          "A pre-shared key (PSK) gives authorised users or devices a shared secret. It is simple, but one leaked secret can affect every device using it. Enterprise Wi-Fi commonly uses 802.1X: the supplicant requests access, the access point or switch acts as the authenticator, and an authentication server such as RADIUS evaluates an EAP method.",
          "802.1X controls access to a network port; it is not itself a data-encryption algorithm. WPA3-Personal uses Simultaneous Authentication of Equals (SAE). WPA3-Enterprise uses enterprise authentication such as 802.1X/EAP. Therefore, saying all WPA3 uses 802.1X is incorrect.",
        ],
      },
      {
        title: "Frame protection and attack patterns",
        table: {
          columns: ["Concept", "What it means", "Security judgement"],
          rows: [
            ["TKIP", "Legacy per-packet key mixing designed as a transition from WEP", "Deprecated; do not select for a new secure design"],
            ["CCMP", "AES-based authenticated confidentiality for 802.11 frames", "Stronger modern baseline than TKIP"],
            ["Jamming", "Radio interference that prevents communication", "Availability attack; changing channel or locating the source may help"],
            ["Deauthentication / disassociation", "Forged or abused management frames disconnect clients", "Can create denial of service or support an evil-twin workflow"],
            ["MAC spoofing", "Imitating another interface address", "Defeats weak allowlists; does not defeat strong authentication by itself"],
            ["SSID", "The network name", "Not a password; hiding it is not a meaningful primary control"],
          ],
        },
      },
    ],
    traps: [
      "PSK versus 802.1X describes an access model; TKIP versus CCMP describes frame protection.",
      "WPA3-Personal uses SAE, while WPA3-Enterprise uses enterprise authentication.",
      "A hidden SSID and a MAC allowlist may reduce casual visibility but are not strong authentication controls.",
    ],
    check: {
      question: "A university wants individual student credentials and immediate revocation without changing a shared Wi-Fi password. What architecture fits?",
      answer: "WPA-Enterprise with 802.1X/EAP and a RADIUS-backed identity service. Individual identities improve accountability and allow targeted revocation.",
    },
    sources: [
      { label: "NIST SP 800-153 — Securing Wireless LANs", url: "https://csrc.nist.gov/pubs/sp/800/153/final" },
      { label: "IETF RFC 9190 — EAP-TLS 1.3", url: "https://www.rfc-editor.org/info/rfc9190/" },
      { label: "NIST SP 800-97 — IEEE 802.11i Wireless Security", url: "https://csrc.nist.gov/pubs/sp/800/97/final" },
    ],
  },
  {
    id: "keys-passwords-encryption",
    chapter: 1,
    category: "Cryptography",
    title: "Keys, Password Hashing, and Encryption Scope",
    subtitle: "Know what should be hashed, encrypted, wrapped, or protected by hardware.",
    summary: "Cryptography questions are rarely solved by choosing the strongest-sounding term. Start with the asset and operation: passwords are verified with slow salted hashes, data is encrypted with keys, and high-value keys may be wrapped or isolated in trusted hardware.",
    minutes: 12,
    difficulty: "Applied",
    aliases: ["bcrypt", "Argon2", "Argon2id", "scrypt", "salt", "pepper", "KEK", "HSM", "Secure Enclave", "BitLocker", "full disk encryption", "file encryption", "database encryption", "blockchain", "distributed ledger"],
    objectives: [
      "Choose a password-hashing design rather than reversible encryption.",
      "Explain salts, peppers, work factors, and memory hardness.",
      "Compare encryption scopes and key-protection hardware.",
    ],
    sections: [
      {
        title: "Password storage is deliberately expensive",
        body: [
          "A password verifier should store the output of a password-hashing or password-based key-derivation function, not plaintext and not a reversibly encrypted password. A unique random salt prevents identical passwords from producing identical stored values and frustrates precomputed tables. A tunable cost slows guessing; memory-hard designs also make large-scale parallel cracking more expensive.",
          "Argon2id is a modern memory-hard choice described by RFC 9106. scrypt is also memory-hard, and bcrypt remains widely deployed but has older design constraints. A pepper is an optional application-wide secret kept separately from the password database. Losing a pepper can make verification impossible, so it requires lifecycle planning.",
        ],
      },
      {
        title: "Protect the correct scope",
        table: {
          columns: ["Control", "Protects", "Main limitation"],
          rows: [
            ["Full-volume encryption / BitLocker", "A volume when the device is powered off or locked", "An authorised, running session can access decrypted data"],
            ["File or folder encryption", "Selected objects", "Metadata and temporary copies may need separate protection"],
            ["Database encryption", "Database files, fields, or tables depending on design", "Applications and key access still matter"],
            ["Transport encryption", "Data moving between endpoints", "Does not protect plaintext at either endpoint"],
            ["KEK", "Wraps or encrypts other keys", "The KEK becomes a high-value asset"],
          ],
        },
      },
      {
        title: "HSM and Secure Enclave are related, not interchangeable",
        body: [
          "A hardware security module (HSM) is a purpose-built cryptographic boundary that can generate, store, and use keys while enforcing policy. It may be network-attached, a card, or a cloud-managed service. A Secure Enclave is a device-integrated isolated subsystem used for local secrets and sensitive operations.",
          "Both reduce direct key exposure, but neither justifies an absolute claim that compromise is impossible. Security depends on hardware, firmware, configuration, access policy, recovery design, and the calling application.",
        ],
      },
      {
        title: "A blockchain is not automatically confidential or truthful",
        body: [
          "A blockchain is a form of distributed ledger that links records cryptographically and uses a consensus design to agree on state. It can make unauthorised historical changes evident or difficult, depending on the network and threat model. Digital signatures can show which key authorised a transaction.",
          "The ledger does not automatically encrypt its contents, prove that real-world input was true, prevent stolen-key transactions, or remove the need for governance. Avoid storing sensitive plaintext merely because the storage is called a blockchain; replication can make later deletion especially difficult.",
        ],
      },
    ],
    traps: [
      "Encryption is reversible with a key; password hashing is designed for verification without recovery.",
      "A salt is public and unique per credential. A pepper is secret and stored separately.",
      "Full-disk encryption mainly protects data at rest; it does not stop an attacker already operating inside an unlocked session.",
    ],
    check: {
      question: "An attacker steals only a user database containing password verifiers. Which design most directly raises the cost of offline guessing?",
      answer: "Unique salts plus a correctly tuned memory-hard password hash such as Argon2id. A separately protected pepper can add another barrier, but it does not replace salts or an appropriate work factor.",
    },
    sources: [
      { label: "IETF RFC 9106 — Argon2", url: "https://www.rfc-editor.org/info/rfc9106/" },
      { label: "IETF RFC 7914 — scrypt", url: "https://www.rfc-editor.org/info/rfc7914/" },
      { label: "Microsoft — BitLocker planning", url: "https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/planning-guide" },
      { label: "NIST FIPS 140-3 — Cryptographic modules", url: "https://csrc.nist.gov/pubs/fips/140-3/final" },
      { label: "NISTIR 8202 — Blockchain Technology Overview", url: "https://csrc.nist.gov/pubs/ir/8202/final" },
    ],
  },
  {
    id: "pki-email-trust",
    chapter: 1,
    category: "Cryptography",
    title: "PKI, Certificate Status, and Email Trust",
    subtitle: "Follow trust from certificate issuance to revocation and authenticated email.",
    summary: "PKI and email questions often combine several independent controls. Certificate revocation, CA authorisation, transport encryption, message encryption, and domain authentication solve different problems and should be evaluated separately.",
    minutes: 12,
    difficulty: "Applied",
    aliases: ["CRL", "OCSP", "OCSP stapling", "CAA", "SMTP", "POP3S", "S/MIME", "SPF", "DKIM", "DMARC", "DNS TXT"],
    objectives: [
      "Compare CRLs, OCSP, stapling, and CAA.",
      "Separate mailbox transport security from end-to-end message protection.",
      "Explain how SPF, DKIM, and DMARC work together.",
    ],
    sections: [
      {
        title: "Certificate status and issuance control",
        table: {
          columns: ["Mechanism", "Question it answers", "Important limit"],
          rows: [
            ["CRL", "Has this certificate been revoked according to a published list?", "Lists can become stale between publications"],
            ["OCSP", "What is the current status of this specific certificate?", "Adds responder availability and privacy considerations"],
            ["OCSP stapling", "Can the server provide a signed status response during the handshake?", "The response still has a validity period"],
            ["DNS CAA", "Which certificate authorities may issue for this domain?", "It constrains compliant CAs; it does not make mis-issuance impossible"],
          ],
        },
      },
      {
        title: "Email protection is layered",
        body: [
          "SMTP transfers mail. POP3S usually means POP3 protected by TLS. Transport TLS protects a connection between systems, but each receiving hop or endpoint can see plaintext. S/MIME can encrypt message content for recipients and digitally sign it for origin and integrity; it does not hide all metadata and cannot protect a compromised endpoint.",
          "SPF authorises sending infrastructure for a domain. DKIM attaches a cryptographic signature that a receiver verifies with a DNS-published public key. DMARC adds alignment and domain policy, then enables aggregate or failure reporting. These records are commonly published as DNS TXT records at different names; the obsolete dedicated SPF DNS record type should not be treated as the modern answer.",
        ],
      },
    ],
    traps: [
      "S/MIME can protect message content end-to-end, but headers, endpoints, and key handling remain in scope.",
      "SPF, DKIM, and DMARC complement one another; none alone proves that a human sender is trustworthy.",
      "CAA is checked by participating CAs before issuance; it is not a browser-side revocation mechanism.",
    ],
    check: {
      question: "A receiver must verify that a message body was not changed and that an authorised domain signed it. Which control is most direct?",
      answer: "DKIM. SPF focuses on sending infrastructure, while DMARC evaluates alignment and policy using SPF and/or DKIM results.",
    },
    sources: [
      { label: "IETF RFC 5280 — PKI and CRLs", url: "https://www.rfc-editor.org/info/rfc5280" },
      { label: "IETF RFC 6960 — OCSP", url: "https://www.rfc-editor.org/info/rfc6960" },
      { label: "IETF RFC 8659 — DNS CAA", url: "https://www.rfc-editor.org/info/rfc8659" },
      { label: "IETF RFC 9989 — DMARC", url: "https://www.rfc-editor.org/info/rfc9989" },
      { label: "IETF RFC 8551 — S/MIME 4.0", url: "https://www.rfc-editor.org/info/rfc8551" },
    ],
  },
  {
    id: "identity-zero-trust",
    chapter: 4,
    category: "Identity & Access",
    title: "Identity Lifecycle, Zero Trust, and Service Accounts",
    subtitle: "Treat identity as a lifecycle and keep policy decisions separate from enforcement.",
    summary: "Good identity security continues after onboarding. Accounts, entitlements, and credentials must be reviewed, changed, and removed. Zero Trust adds continuous, context-aware decisions; managed service identities reduce the long-lived password problem for workloads.",
    minutes: 10,
    difficulty: "Applied",
    aliases: ["provisioning", "onboarding", "offboarding", "PDP", "PEP", "zero trust", "Active Directory", "AD DS", "legacy AD", "NTLM", "LDAP", "gMSA", "service account"],
    objectives: [
      "Map joiner, mover, and leaver events to access changes.",
      "Differentiate a policy decision point from a policy enforcement point.",
      "Use gMSAs to reduce service-account password handling in supported AD environments.",
    ],
    sections: [
      {
        title: "Provisioning is a lifecycle, not a one-time ticket",
        body: [
          "Onboarding creates identities and grants the minimum necessary access. A mover event changes access when a role changes. Periodic review catches accumulated privilege, and offboarding disables access, revokes sessions and tokens, recovers assets, and transfers ownership where appropriate.",
          "Automation improves speed and consistency, but the source of truth, approval rules, exception handling, and deprovisioning path still need governance. An automated mistake can scale faster than a manual one.",
        ],
      },
      {
        title: "Decision and enforcement in Zero Trust",
        body: [
          "The policy decision point (PDP) evaluates identity, device posture, resource sensitivity, threat signals, and policy to decide whether access should be allowed. The policy enforcement point (PEP) sits in the access path and carries out that decision. The PEP does not invent policy; the PDP does not directly forward every packet.",
        ],
      },
      {
        title: "Modernise Active Directory without calling AD DS obsolete",
        body: [
          "Active Directory Domain Services remains widely used. The legacy risks usually come from old protocols and configurations—such as excessive NTLM reliance, simple LDAP without protection, weak delegation, stale accounts, or manually managed service passwords—not from the mere existence of AD DS.",
          "A group Managed Service Account (gMSA) lets AD DS manage a service account password and can support a service running across multiple authorised hosts. It is appropriate only for supported Windows workloads and still requires correct host permissions and service configuration.",
        ],
      },
    ],
    traps: [
      "Zero Trust means verify explicitly and minimise access; it does not mean trust nobody forever or remove usability controls.",
      "A PDP decides and a PEP enforces.",
      "A gMSA reduces manual password handling; it does not automatically fix over-privileged services.",
    ],
    check: {
      question: "A user changes from finance to engineering. Which identity event should drive removal of finance access and approval of engineering access?",
      answer: "A mover event in the identity lifecycle. Treating it only as new provisioning often leaves the old finance privileges behind.",
    },
    sources: [
      { label: "NIST SP 800-207 — Zero Trust Architecture", url: "https://csrc.nist.gov/pubs/sp/800/207/final" },
      { label: "Microsoft — Manage gMSAs", url: "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-managed-service-accounts/group-managed-service-accounts/manage-group-managed-service-accounts" },
      { label: "Microsoft — On-premises service accounts", url: "https://learn.microsoft.com/en-us/entra/architecture/service-accounts-on-premises" },
    ],
  },
  {
    id: "federation-modern-auth",
    chapter: 4,
    category: "Identity & Access",
    title: "SSO, Federation, OAuth, OIDC, SAML, and Passkeys",
    subtitle: "Stop using authentication and authorisation as interchangeable words.",
    summary: "Single sign-on is a user experience outcome, federation is a trust relationship across security domains, OAuth delegates authorisation, and OpenID Connect adds an identity layer. Passkeys use public-key credentials and can be phishing-resistant, but their assurance depends on verification and deployment policy.",
    minutes: 11,
    difficulty: "Applied",
    aliases: ["SSO", "federation", "SAML", "OAuth", "OIDC", "OpenID Connect", "passkey", "FIDO2", "WebAuthn", "MFA"],
    objectives: [
      "Choose SAML or OIDC for the right application context.",
      "Explain why OAuth alone is not a login protocol.",
      "Describe passkeys without assuming every ceremony provides the same assurance.",
    ],
    sections: [
      {
        title: "Map each term to its job",
        table: {
          columns: ["Term", "Primary job", "Typical evidence"],
          rows: [
            ["SSO", "Use one authenticated session across multiple applications", "A user signs in once"],
            ["Federation", "Establish trust between identity and service domains", "An external identity provider is accepted"],
            ["SAML", "Exchange XML assertions, commonly for enterprise browser SSO", "Signed assertion"],
            ["OAuth 2.0", "Delegate limited access to a protected resource", "Access token and scopes"],
            ["OpenID Connect", "Add authentication and identity claims on top of OAuth 2.0", "ID token plus standard flows"],
          ],
        },
      },
      {
        title: "Passkeys and phishing resistance",
        body: [
          "A passkey is a FIDO credential: the relying party stores a public key while the authenticator protects the private key. The credential is bound to the relying-party identifier, which makes a well-implemented flow resistant to ordinary phishing and credential replay.",
          "Do not automatically label every passkey event as multi-factor authentication. Assurance depends on whether user verification—such as a biometric or device PIN—is required, how the credential is synced or backed up, account recovery, and organisational policy. A security key or passkey can satisfy strong MFA goals when the complete ceremony meets the requirement.",
        ],
      },
    ],
    traps: [
      "OAuth delegates access; OIDC supplies an authentication layer.",
      "SSO does not necessarily cross organisational boundaries, while federation does.",
      "Phishing-resistant does not mean invulnerable to malware, weak recovery, or a compromised endpoint.",
    ],
    check: {
      question: "A mobile app needs a standard way to sign a user in and receive identity claims from an external provider. OAuth tokens alone are not enough. What fits?",
      answer: "OpenID Connect, which defines an identity layer and ID token on top of OAuth 2.0.",
    },
    sources: [
      { label: "OpenID Connect Core 1.0", url: "https://openid.net/specs/openid-connect-core-1_0-final.html" },
      { label: "IETF RFC 6749 — OAuth 2.0", url: "https://www.rfc-editor.org/info/rfc6749" },
      { label: "OASIS — SAML 2.0", url: "https://www.oasis-open.org/standard/saml/" },
      { label: "FIDO Alliance — Passkeys", url: "https://fidoalliance.org/passkeys-2/" },
    ],
  },
  {
    id: "network-protocols-ports",
    chapter: 3,
    category: "Network Security",
    title: "Network Protocols, Ports, and the TLS Flow",
    subtitle: "Use the transport behaviour and service purpose—not memorised slogans—to choose an answer.",
    summary: "Ports are useful identifiers, not proof of application identity. TCP and UDP provide different transport properties, common services use registered defaults, and modern TLS establishes authenticated shared keys before protecting application data.",
    minutes: 13,
    difficulty: "Core",
    aliases: ["TCP", "UDP", "ports", "DHCP", "DNS", "FTP", "FTPS", "SFTP", "HTTPS", "RDP", "3389", "389", "LDAP", "TLS handshake", "SMTP", "POP3S"],
    objectives: [
      "Choose TCP or UDP based on delivery needs and application design.",
      "Recall high-value registered ports with their protocol caveats.",
      "Describe TLS 1.3 without using an obsolete RSA key-transport story.",
    ],
    sections: [
      {
        title: "Transport first",
        body: [
          "TCP provides a connection-oriented, ordered byte stream with retransmission and congestion control. UDP provides independent datagrams with low transport overhead and no built-in delivery or ordering guarantee. Applications can add reliability over UDP, so ‘UDP is always unreliable’ is too simplistic.",
          "A port number is a convention used for demultiplexing. Traffic on TCP 443 is not automatically benign HTTPS, and a service can listen on a non-default port. Validate the actual protocol and context.",
        ],
        table: {
          columns: ["Service", "Common port/transport", "Remember"],
          rows: [
            ["DNS", "53 UDP and TCP", "UDP is common for queries; TCP is also used, including for larger responses and zone transfers"],
            ["DHCPv4", "67/UDP server, 68/UDP client", "Uses broadcasts during initial address acquisition"],
            ["LDAP", "389 TCP and UDP registered", "Protect directory authentication traffic; LDAPS commonly uses TCP 636"],
            ["HTTPS", "443/TCP; HTTP/3 uses QUIC over UDP 443", "TLS is the security layer; inspect the negotiated protocol"],
            ["RDP", "3389 TCP and UDP registered", "Modern RDP can use both transports"],
            ["SMTP", "25/TCP relay; 587/TCP submission", "Submission and relay are different roles"],
            ["POP3S", "995/TCP", "POP3 protected by TLS"],
          ],
        },
      },
      {
        title: "FTP families and TLS 1.3",
        body: [
          "Traditional FTP uses separate control and data connections. FTPS is FTP protected with TLS. SFTP is a different file-transfer protocol carried over SSH, commonly on TCP 22. Choosing ‘SFTP’ is not the same as enabling TLS on an FTP server.",
          "In a common certificate-based TLS 1.3 flow, ClientHello and ServerHello negotiate parameters and establish shared keying material, usually through ephemeral Diffie-Hellman. The server proves control of its certificate key with a signature; Finished messages confirm the handshake. Symmetric traffic keys then protect application data. TLS 1.3 does not generally encrypt a random session key directly with the server's RSA public key.",
        ],
      },
      {
        title: "DHCP helps manage conflicts; it cannot promise uniqueness everywhere",
        body: [
          "DHCP centrally leases addresses and substantially reduces accidental conflicts inside its managed pool. Exclusions, reservations, lease tracking, and address detection improve control. A manually configured static address, rogue DHCP server, or overlapping scope can still create a duplicate, so ‘DHCP prevents all IP conflicts’ is too absolute.",
        ],
      },
    ],
    traps: [
      "RDP is registered for both TCP and UDP 3389.",
      "FTPS and SFTP are different protocols.",
      "Use TLS, not obsolete SSL, as the modern answer unless the question is explicitly historical.",
    ],
    check: {
      question: "A log shows outbound UDP 443. Can an analyst conclude it is not web traffic because HTTPS uses TCP?",
      answer: "No. HTTP/3 uses QUIC over UDP 443. The analyst should identify the application protocol rather than infer it from transport alone.",
    },
    sources: [
      { label: "IANA — Service Name and Port Registry", url: "https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml" },
      { label: "IETF RFC 8446 — TLS 1.3", url: "https://www.rfc-editor.org/info/rfc8446/" },
      { label: "IETF RFC 2131 — DHCP", url: "https://www.rfc-editor.org/info/rfc2131" },
      { label: "IETF RFC 9114 — HTTP/3", url: "https://www.rfc-editor.org/info/rfc9114" },
    ],
  },
  {
    id: "network-defense-architecture",
    chapter: 3,
    category: "Network Security",
    title: "Firewalls, Detection, DDoS, and Secure Access Paths",
    subtitle: "Place each control where it can actually observe or enforce the traffic.",
    summary: "Network tools overlap, but their position and operating mode matter. A stateful firewall understands flows, an IDS observes, an inline IPS can block, a WAF specialises in web traffic, and proxies or jump hosts create controlled access paths.",
    minutes: 13,
    difficulty: "Applied",
    aliases: ["stateful firewall", "IDS", "IPS", "NGFW", "UTM", "WAF", "DoS", "DDoS", "jump server", "proxy", "site-to-site VPN", "TLS inspection"],
    objectives: [
      "Differentiate detection from inline prevention.",
      "Classify volumetric, protocol, and application-layer denial-of-service attacks.",
      "Explain the trade-offs of consolidated appliances and TLS inspection.",
    ],
    sections: [
      {
        title: "What each control sees and does",
        table: {
          columns: ["Control", "Strength", "Key trade-off"],
          rows: [
            ["Stateful firewall", "Tracks connection or flow state and applies policy in context", "Encrypted application content may remain opaque"],
            ["IDS", "Detects and alerts from observed traffic or host activity", "Out-of-band detection does not inherently stop the event"],
            ["IPS", "Detects and can block inline", "False positives and throughput matter because it sits in the path"],
            ["NGFW", "Adds application/user awareness and deeper inspection", "Capability depends on visibility, licensing, and configuration"],
            ["UTM", "Combines multiple security functions in one platform", "Convenience can create capacity and concentration-of-failure concerns"],
            ["WAF", "Filters HTTP application requests", "Cannot replace secure coding or endpoint controls"],
          ],
        },
      },
      {
        title: "DoS and DDoS are broader than bandwidth",
        body: [
          "A denial-of-service attack harms availability. A distributed attack uses many sources, but the mechanism may be volumetric, protocol/state exhaustion, or application-layer resource exhaustion. Rate limiting, caching, upstream scrubbing, autoscaling, resilient architecture, and application-specific controls address different classes.",
          "An IDS may notice the pattern and alert. An inline IPS may block some patterns. Neither statement guarantees the attack is stopped, especially when a link is already saturated upstream.",
        ],
      },
      {
        title: "Controlled paths and encrypted visibility",
        body: [
          "A jump host is a hardened administrative entry point into a protected zone. A forward proxy acts for clients; a reverse proxy acts for servers. A site-to-site VPN protects traffic between networks, while remote-access VPNs serve individual endpoints.",
          "TLS inspection decrypts and re-encrypts selected traffic so controls can inspect content. It adds privacy, certificate-trust, key-protection, performance, legal, and application-compatibility concerns. Certificate pinning and mutually authenticated applications may require explicit exceptions.",
        ],
      },
    ],
    traps: [
      "IDS means detection; prevention requires an enforcement path.",
      "DDoS is not limited to flooding bandwidth.",
      "A WAF may reduce some malicious requests, but application anti-CSRF tokens and same-site protections remain the primary CSRF design.",
    ],
    check: {
      question: "A web service is overwhelmed by expensive search requests from many legitimate-looking clients. Why might a bandwidth-only control fail?",
      answer: "This is application-layer resource exhaustion. The response may need request-aware rate limits, caching, query-cost controls, authentication, or WAF/application rules rather than only volumetric scrubbing.",
    },
    sources: [
      { label: "NIST SP 800-41 Rev. 1 — Firewalls", url: "https://csrc.nist.gov/pubs/sp/800/41/r1/final" },
      { label: "NIST SP 800-94 — IDPS", url: "https://csrc.nist.gov/pubs/sp/800/94/final" },
      { label: "CISA — Understanding DoS attacks", url: "https://www.cisa.gov/news-events/news/understanding-denial-service-attacks" },
      { label: "OWASP — CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  {
    id: "risk-resilience-governance",
    chapter: 5,
    category: "Governance & Risk",
    title: "Risk Decisions, Resilience, and Assurance",
    subtitle: "Turn likelihood and impact into a defensible action—not a magic formula.",
    summary: "Risk work connects uncertainty to business decisions. Matrices and scores support comparison, but labels and thresholds belong to the organisation. Controls change likelihood or impact; transfer changes who bears specified consequences but leaves residual risk.",
    minutes: 12,
    difficulty: "Applied",
    aliases: ["risk transfer", "risk matrix", "likelihood", "impact", "residual risk", "fault tolerance", "high availability", "redundancy", "mandatory vacation", "due diligence", "audit", "penetration test", "vulnerability prioritisation"],
    objectives: [
      "Explain risk acceptance, avoidance, mitigation, and transfer.",
      "Differentiate fault tolerance, high availability, and redundancy.",
      "Prioritise vulnerabilities with technical and business context.",
    ],
    sections: [
      {
        title: "Use the matrix, but respect its limits",
        body: [
          "A qualitative matrix combines likelihood and impact into a relative risk level. Some organisations multiply numbered values; others use a lookup table. A 3×3 score of 9 is ‘critical’ only if the approved method defines it that way. Precision-looking numbers do not remove uncertainty in the inputs.",
          "Risk transfer—such as insurance or a contract—moves specified financial or operational consequences. It does not eliminate the event, reputational harm, compliance duty, deductibles, exclusions, or residual risk retained by the organisation.",
        ],
      },
      {
        title: "Resilience terms answer different questions",
        table: {
          columns: ["Term", "Core idea", "Example"],
          rows: [
            ["Redundancy", "Duplicate a component or path", "Two power supplies"],
            ["Fault tolerance", "Continue operating through a component failure, often transparently", "Mirrored storage continues after one disk fails"],
            ["High availability", "Minimise service downtime through design and recovery", "Cluster failover within an agreed objective"],
          ],
        },
      },
      {
        title: "Governance and prioritisation",
        body: [
          "Mandatory vacation is an administrative control that can expose fraud or hidden dependencies when another person performs the absent employee's duties. Due diligence is the ongoing investigation and care used to understand and manage risk; due care is the reasonable action taken in response.",
          "An audit evaluates evidence against defined criteria and independence requirements. A penetration test actively attempts exploitation within an authorised scope. Vulnerability priority should combine severity, known or likely exploitation, exposure, asset and mission impact, reachability, and compensating controls. No universal multiplication formula replaces judgement.",
        ],
      },
    ],
    traps: [
      "Transferred risk still leaves residual and non-transferable consequences.",
      "A redundant component is not automatically fault tolerant if failover is manual or untested.",
      "CVSS severity alone is not the same as organisational risk or remediation priority.",
    ],
    check: {
      question: "Two vulnerabilities have the same CVSS score. One is internet-facing and listed as actively exploited; the other is isolated behind compensating controls. Which normally comes first?",
      answer: "The exposed, actively exploited vulnerability, subject to confirming asset and mission impact. Exploit activity and reachability add decision context that the base severity score does not capture alone.",
    },
    sources: [
      { label: "NIST SP 800-30 Rev. 1 — Risk Assessments", url: "https://csrc.nist.gov/pubs/sp/800/30/r1/final" },
      { label: "NIST SP 800-53 Rev. 5 — Security Controls", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" },
      { label: "CISA — Known Exploited Vulnerabilities", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
    ],
  },
  {
    id: "data-legal-responsibility",
    chapter: 5,
    category: "Governance & Risk",
    title: "Data Roles, GDPR Breach Notice, and Legal Preservation",
    subtitle: "Know who decides, who implements, and what must be preserved.",
    summary: "Data governance terms are accountability labels, not job titles carved in stone. Owners decide classification and acceptable handling, custodians implement safeguards, and privacy law distinguishes the controller's purposes from the processor's work on its behalf.",
    minutes: 10,
    difficulty: "Applied",
    aliases: ["data owner", "data custodian", "controller", "processor", "GDPR", "72 hours", "eDiscovery", "legal hold", "retention"],
    objectives: [
      "Separate owner accountability from custodian implementation.",
      "State the GDPR Article 33 timing rule with its risk exception.",
      "Connect legal hold, eDiscovery, retention, and chain of custody.",
    ],
    sections: [
      {
        title: "Governance roles",
        body: [
          "A data owner is generally accountable for classification, acceptable use, access requirements, and risk decisions. A custodian or steward implements storage, backup, access, retention, and technical handling under policy. Exact titles vary, so answer from the responsibility described in the scenario.",
          "Under GDPR, a controller determines the purposes and means of processing personal data. A processor handles data on the controller's behalf. The same organisation can be a controller for one activity and a processor for another.",
        ],
      },
      {
        title: "The 72-hour rule has important wording",
        body: [
          "GDPR Article 33 says a controller must notify the competent supervisory authority without undue delay and, where feasible, within 72 hours after becoming aware of a personal-data breach—unless the breach is unlikely to result in risk to people's rights and freedoms. If notification is late, reasons for the delay accompany it. A processor notifies the controller without undue delay.",
          "This is not a universal rule to notify every affected person within 72 hours. Communication to data subjects is governed separately and depends on high risk and available exceptions.",
        ],
      },
      {
        title: "Preserve information when litigation is reasonably anticipated",
        body: [
          "A legal hold suspends normal destruction for relevant information. eDiscovery identifies, preserves, collects, processes, reviews, and produces electronically stored information. Scope, defensibility, access logging, authenticity, and chain of custody matter; ordinary retention schedules should not destroy held material.",
        ],
      },
    ],
    traps: [
      "A custodian implements controls; the owner remains accountable for the business decision.",
      "The GDPR supervisory-authority notification rule includes both ‘without undue delay’ and a risk-based exception.",
      "A legal hold overrides routine deletion for in-scope data; it is not the same as keeping everything forever.",
    ],
    check: {
      question: "A cloud payroll provider processes employee data only under a customer's documented instructions. What is its likely GDPR role for that activity?",
      answer: "Processor, while the customer is likely the controller. The actual contract and decision-making authority still determine the roles.",
    },
    sources: [
      { label: "EU — General Data Protection Regulation", url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj" },
      { label: "EDPB — Controller and processor guidance", url: "https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-072020-concepts-controller-and-processor-gdpr_en" },
      { label: "NIST SP 800-86 — Forensics in Incident Response", url: "https://csrc.nist.gov/pubs/sp/800/86/final" },
    ],
  },
  {
    id: "security-operations-automation",
    chapter: 4,
    category: "Security Operations",
    title: "Vulnerability Scanning, SCAP, Orchestration, and Threat Intelligence",
    subtitle: "Automate repeatable work while keeping evidence, context, and human decisions visible.",
    summary: "Operations tools produce signals, not automatic truth. Scanners combine version, configuration, authenticated, and behavioural checks; SCAP standardises machine-readable security content; orchestration coordinates workflows; threat intelligence adds context at different decision levels.",
    minutes: 11,
    difficulty: "Applied",
    aliases: ["vulnerability scanner", "CVE", "SCAP", "orchestration", "automation", "posture assessment", "configuration enforcement", "threat intelligence", "strategic", "operational", "tactical", "technical"],
    objectives: [
      "Explain authenticated and unauthenticated scanning evidence.",
      "Use SCAP and orchestration without overstating automation.",
      "Match intelligence detail to strategic, operational, tactical, or technical consumers.",
    ],
    sections: [
      {
        title: "A scanner does more than exact CVE matching",
        body: [
          "A scanner may identify versions, query package and patch state with credentials, check exposed services, evaluate configuration, or safely test behaviour. Findings can be false positives, false negatives, or affected by backported vendor patches, so validation and asset context remain necessary.",
          "Posture assessment measures whether a device meets requirements. Configuration enforcement changes or blocks non-compliant state. Observation and enforcement are separate capabilities, even when one platform provides both.",
        ],
      },
      {
        title: "Standardise content, then orchestrate response",
        body: [
          "Security Content Automation Protocol (SCAP) is a family of specifications for expressing and exchanging machine-readable security configuration and vulnerability information. It supports consistent assessment; it is not a complete vulnerability-management programme by itself.",
          "Orchestration connects tools and sequences actions. Automation executes defined tasks. A playbook might enrich an alert, check asset criticality, open a case, and request approval before isolation. High-impact actions need safeguards, rollback plans, and evidence capture.",
        ],
      },
      {
        title: "Threat intelligence levels are a useful model, not a universal law",
        table: {
          columns: ["Level", "Typical consumer", "Example"],
          rows: [
            ["Strategic", "Executives and risk leaders", "Long-term sector or geopolitical trend"],
            ["Operational", "Campaign and incident planners", "Adversary campaign objectives and timing"],
            ["Tactical", "Defenders and architects", "Techniques and procedures used by an adversary"],
            ["Technical", "Security tools and analysts", "Short-lived indicators such as domains or hashes"],
          ],
        },
      },
    ],
    traps: [
      "An authenticated scan can see missing patches and configuration that a network-only scan may miss.",
      "Orchestration coordinates; automation performs a task. Products often combine both.",
      "Threat-intelligence taxonomies vary, so infer the answer from audience, time horizon, and detail.",
    ],
    check: {
      question: "A scan flags a Linux package version as vulnerable, but the vendor backported the patch without changing the upstream version string. What should happen next?",
      answer: "Validate against vendor package and patch evidence, preferably with authenticated data. Do not treat a banner-only match as final proof.",
    },
    sources: [
      { label: "NIST — SCAP Releases", url: "https://csrc.nist.gov/Projects/Security-Content-Automation-Protocol/SCAP-Releases" },
      { label: "NIST SP 800-40 Rev. 4 — Enterprise Patch Management", url: "https://csrc.nist.gov/pubs/sp/800/40/r4/final" },
      { label: "CISA — Known Exploited Vulnerabilities", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
    ],
  },
  {
    id: "platform-cloud-hardening",
    chapter: 2,
    category: "Threats & Hardening",
    title: "Platform, Endpoint, and Cloud Hardening",
    subtitle: "Build trust from firmware to workloads and avoid category mistakes in cloud scenarios.",
    summary: "Platform security starts before the operating system and continues through process behaviour, application installation, virtualisation, and cloud responsibility. Most controls reduce an attack path; very few make compromise impossible.",
    minutes: 13,
    difficulty: "Applied",
    aliases: ["BIOS", "UEFI", "Secure Boot", "RTOS", "embedded system", "sideloading", "hybrid cloud", "multi-cloud", "virtual machine", "hypervisor", "shared responsibility", "wireless router", "svchost", "misconfiguration", "improper error handling"],
    objectives: [
      "Explain the UEFI Secure Boot trust chain without using absolutes.",
      "Distinguish hybrid cloud, multi-cloud, guests, hosts, and provider responsibilities.",
      "Evaluate process and configuration evidence as signals requiring context.",
    ],
    sections: [
      {
        title: "Firmware, embedded systems, and application sources",
        body: [
          "Modern systems usually use UEFI rather than legacy BIOS. Secure Boot checks signatures on approved pre-operating-system components to resist unauthorised boot code. It is one layer: firmware updates, key management, measured boot, disk encryption, operating-system hardening, and physical security still matter.",
          "A real-time operating system (RTOS) prioritises predictable timing for time-sensitive workloads. Embedded devices often have constrained resources, long support lives, specialised interfaces, and physical exposure. Sideloading installs software outside the normal curated channel; it can be legitimate, but expands trust and provenance decisions.",
        ],
      },
      {
        title: "Cloud and virtualisation terms",
        table: {
          columns: ["Term", "Accurate meaning", "Common mistake"],
          rows: [
            ["Hybrid cloud", "Distinct cloud infrastructures—such as private and public—bound to enable portability or coordinated use", "Calling any two providers ‘hybrid’"],
            ["Multi-cloud", "Use of services from more than one cloud provider", "Assuming it always includes a private cloud"],
            ["Guest VM", "Workload operating inside a virtualised environment", "Assuming the guest controls the host hypervisor"],
            ["Shared responsibility", "Provider and customer duties vary by service model", "Assuming cloud use transfers every security duty"],
          ],
        },
      },
      {
        title: "Configuration and process signals need corroboration",
        body: [
          "Security misconfiguration includes unsafe defaults, excessive permissions, exposed management interfaces, missing hardening, weak cloud policies, and verbose production errors. Improper error handling may leak stack traces, data, or control-flow information, but the fix should preserve useful secure logging for defenders.",
          "Windows Service Host (svchost.exe) hosts Windows services. An unusual parent, path, signature, command line, child process, or service mapping can be suspicious, but no single process-tree rule proves injection. Compare the complete telemetry with the system baseline.",
          "A consumer wireless router commonly combines routing, switching, firewall, and Wi-Fi access-point functions. It still usually needs an upstream modem, optical network terminal, or other WAN service; it is not automatically the entire internet connection.",
        ],
      },
    ],
    traps: [
      "Hybrid cloud and multi-cloud are not synonyms.",
      "Secure Boot validates an authorised boot chain; it does not make the running operating system invulnerable.",
      "A suspicious svchost relationship is evidence to investigate, not standalone proof of process injection.",
    ],
    check: {
      question: "A company uses AWS and Azure but no connected private-cloud environment. Which term is most precise?",
      answer: "Multi-cloud. It becomes hybrid when distinct cloud infrastructures such as private and public environments are connected for coordinated use or portability.",
    },
    sources: [
      { label: "Microsoft — Secure Boot and Trusted Boot", url: "https://learn.microsoft.com/en-us/windows/security/operating-system-security/system-security/trusted-boot" },
      { label: "NIST — Hybrid cloud definition", url: "https://csrc.nist.gov/glossary/term/Hybrid_cloud" },
      { label: "NIST SP 800-125 — Virtualisation Security", url: "https://csrc.nist.gov/pubs/sp/800/125/final" },
      { label: "Microsoft — Service Host refactoring", url: "https://learn.microsoft.com/en-us/windows/application-management/svchost-service-refactoring" },
    ],
  },
  {
    id: "forensics-recovery",
    chapter: 4,
    category: "Security Operations",
    title: "Forensics, Metadata, Volatility, and Recoverable Backups",
    subtitle: "Preserve the most fragile evidence while keeping recovery independent and testable.",
    summary: "Incident response must balance evidence preservation, business impact, and legal authority. Volatile evidence disappears quickly; metadata needs context; and recovery depends on independent, maintained, tested backups—not merely a journal or snapshot.",
    minutes: 11,
    difficulty: "Applied",
    aliases: ["forensics", "metadata", "RAM", "volatile evidence", "order of volatility", "chain of custody", "photographs", "journaling", "backup", "snapshot", "recovery"],
    objectives: [
      "Apply order of volatility under an authorised response plan.",
      "Use metadata as contextual evidence rather than automatic proof.",
      "Differentiate journals, snapshots, replicas, and backups.",
    ],
    sections: [
      {
        title: "Preserve what will disappear first",
        body: [
          "RAM can contain running processes, network connections, encryption keys, injected code, and unsaved data, but it is volatile. An authorised responder follows the incident and legal playbook, records actions, minimises alteration, and captures higher-volatility evidence before lower-volatility evidence when feasible.",
          "Photographs and notes document the scene, cable state, screens, and device condition. They are important, but a simplistic ‘always photograph everything before any technical action’ rule can lose rapidly changing evidence. Safety, legal authority, encryption risk, and the approved procedure determine the sequence.",
        ],
      },
      {
        title: "Metadata and chain of custody",
        body: [
          "Metadata can show timestamps, file paths, ownership, application history, EXIF fields, message routing, or document authorship. It can be changed, copied, affected by clock error, or stripped, so correlate it with logs, hashes, filesystem behaviour, and other evidence.",
          "Chain of custody records who collected, handled, transferred, stored, and analysed evidence, when and why. Hashes support integrity checking, but documentation and controlled handling establish the wider evidentiary story.",
        ],
      },
      {
        title: "Recovery copies are not all equal",
        table: {
          columns: ["Mechanism", "Purpose", "Why it may be insufficient alone"],
          rows: [
            ["Journal", "Record pending or recent filesystem/database changes", "Corruption or deletion can propagate; retention is limited"],
            ["Snapshot", "Point-in-time state, often on the same platform", "May share credentials, storage, or failure domain"],
            ["Replica", "Maintain another current copy for availability", "Ransomware and logical corruption may replicate"],
            ["Backup", "Independent recoverable copy with retention", "Only useful when protected, maintained, and restore-tested"],
          ],
        },
      },
    ],
    traps: [
      "Shutting down can destroy volatile evidence; keeping a system running can also change evidence. Follow the authorised playbook.",
      "A snapshot is valuable but is not automatically an independent backup.",
      "Metadata supports a conclusion; it rarely proves attribution by itself.",
    ],
    check: {
      question: "A ransomware victim has hourly snapshots under the same administrator account and storage platform as production. Is recovery assured?",
      answer: "No. The snapshots may share the compromised credentials and failure domain. Use protected, independent backups with suitable retention and tested restore procedures.",
    },
    sources: [
      { label: "IETF RFC 3227 — Evidence Collection", url: "https://www.rfc-editor.org/info/rfc3227/" },
      { label: "NIST SP 800-86 — Forensics in Incident Response", url: "https://csrc.nist.gov/pubs/sp/800/86/final" },
      { label: "NIST — Protecting Data from Ransomware and Data Loss", url: "https://csrc.nist.gov/pubs/other/2020/04/24/protecting-data-from-ransomware-and-other-data-los/final" },
    ],
  },
  {
    id: "web-social-dns-attacks",
    chapter: 2,
    category: "Threats & Hardening",
    title: "Web, Social Engineering, and DNS Attacks",
    subtitle: "Identify the trust boundary the attacker is abusing before choosing a defence.",
    summary: "Pretexting abuses human trust, XSS abuses a browser's trust in application content, domain hijacking abuses registrar control, and DNS spoofing abuses name resolution. Similar outcomes can originate at very different layers.",
    minutes: 12,
    difficulty: "Applied",
    aliases: ["pretexting", "XSS", "stored XSS", "reflected XSS", "DOM XSS", "domain hijacking", "DNS spoofing", "DNS poisoning", "CSRF", "error handling"],
    objectives: [
      "Classify reflected, stored, and DOM-based XSS.",
      "Use context-aware output handling and safe browser APIs as primary XSS controls.",
      "Distinguish registrar account takeover from false DNS answers and social pretexts.",
    ],
    sections: [
      {
        title: "XSS is untrusted data becoming executable browser content",
        body: [
          "Stored XSS persists in server-side storage and is later delivered to victims. Reflected XSS returns attacker-controlled input in an immediate response. DOM-based XSS occurs when client-side code moves attacker-controlled data into a dangerous browser sink.",
          "For illustration, an unsafe payload may look like <img src=\"missing.jpg\" onerror=\"alert(1)\">. Displaying it here as text is safe because React escapes text content. A real defence uses context-aware output encoding, safe DOM APIs or framework bindings, input validation where appropriate, and a restrictive Content Security Policy as defence in depth. Never paste test payloads into systems without explicit authorisation.",
        ],
      },
      {
        title: "Human and name-resolution trust",
        table: {
          columns: ["Attack", "What is compromised", "Useful controls"],
          rows: [
            ["Pretexting", "A person's trust through a fabricated role or story", "Verification procedures, minimal disclosure, reporting culture"],
            ["Domain hijacking", "Registrar or domain-account control", "Strong MFA, registry lock, protected recovery, change alerts"],
            ["DNS spoofing / poisoning", "The integrity of DNS answers or caches", "DNSSEC validation where deployed, secure resolvers, monitoring"],
            ["CSRF", "A user's authenticated browser is induced to send an unwanted request", "Anti-CSRF tokens, SameSite cookies, origin checks, reauthentication for sensitive actions"],
          ],
        },
      },
      {
        title: "Errors should help defenders, not attackers",
        body: [
          "Production responses should not expose stack traces, internal paths, secrets, database queries, or detailed authentication differences. Return a safe user-facing message and correlation identifier while recording structured diagnostic detail in protected logs. A generic message without useful internal logging merely makes both attackers and defenders less informed.",
        ],
      },
    ],
    traps: [
      "A WAF and CSP are defence in depth; safe output handling and safe sinks remain central XSS controls.",
      "Domain hijacking changes control of registration or delegation; DNS spoofing supplies a false resolution response.",
      "CSRF and XSS are different: XSS executes attacker-controlled script, while CSRF abuses an authenticated request context.",
    ],
    check: {
      question: "A comment is saved in a database and executes in every moderator's browser. What XSS class is this?",
      answer: "Stored XSS, because the malicious content persists and is served to later viewers.",
    },
    sources: [
      { label: "OWASP — Cross Site Scripting", url: "https://owasp.org/www-community/attacks/xss/" },
      { label: "OWASP — DOM XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html" },
      { label: "OWASP — Error Handling", url: "https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html" },
      { label: "ICANN — Information for Domain Registrants", url: "https://www.icann.org/registrants" },
    ],
  },
];

export const CONCEPT_DEEP_DIVE_CATEGORIES = [
  "All topics",
  ...Array.from(new Set(CONCEPT_DEEP_DIVES.map(dive => dive.category))),
];

export const CONCEPT_DEEP_DIVE_TOPIC_COUNT = new Set(
  CONCEPT_DEEP_DIVES.flatMap(dive => dive.aliases),
).size;
