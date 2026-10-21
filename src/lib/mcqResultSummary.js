import { CONCEPT_DEEP_DIVES } from '../data/conceptDeepDives.js';

// Existing lessons, grouped by the concept actually tested (not option keywords).
const lessonGroups = {
  'security-foundations-controls': ['sec'],
  'threat-actors-surfaces': ['att.actor', 'att.social-principles'],
  'web-social-dns-attacks': ['att.phishing','att.spear-phishing','att.whaling','att.vishing-smishing','att.quishing','att.deepfake','att.dumpster-diving','att.pretexting','att.shoulder-surfing','att.tailgating','att.watering-hole','att.dns-poisoning'],
  'secure-software-applications': ['att.app-sqli','att.app-xxe','att.app-dir-traversal','vul.input-validation','arch.api-security'],
  'api-session-browser-security': ['att.app-xss','att.app-csrf','att.app-ssrf'],
  'malware-indicators-attacks': ['att.mal','att.iocs','att.kill-chain','att.diamond-model','att.mitre-attack'],
  'keys-passwords-encryption': ['cry','att.pwd','att.pass-the-hash'],
  'pki-email-trust': ['cry.pki','net.proto-email'],
  'crypto-modes-pqc-transition': ['cry.cipher-modes','cry.sym-chacha20','cry.sym-legacy'],
  'access-control-pam': ['iam'],
  'identity-zero-trust': ['iam.provisioning','sec.zero-trust','arch.ztna'],
  'federation-modern-auth': ['iam.fido2-passwordless','iam.saml','iam.oauth-oidc','iam.sso-federation'],
  'kerberos-aaa-enterprise-auth': ['iam.kerberos','iam.radius-tacacs','att.kerberoasting'],
  'network-protocols-ports': ['net.proto'],
  'dns-time-management-security': ['net.proto-dnssec','net.proto-snmpv3'],
  'ipsec-secure-media': ['net.proto-ipsec','arch.vpn'],
  'wifi-access-defense': ['net.wifi','att.deauth','att.evil-twin'],
  'network-defense-architecture': ['net.app','arch.dmz','arch.sase-edge','att.on-path-mitm','att.arp-poisoning','att.dos-ddos'],
  'enterprise-network-segmentation': ['arch.segmentation','arch.microsegmentation','arch.air-gap','arch.sdn'],
  'cloud-containers-automation': ['arch.cloud','arch.containers','arch.serverless','arch.shared-resp','arch.virtualization'],
  'data-classification-lifecycle': ['data','gov.policy-retention'],
  'data-legal-responsibility': ['data.reg-pii-phi','gov.gdpr-hipaa-pci'],
  'resilience-assets-physical': ['data.backups','data.immutable-321','data.ha-clustering'],
  'platform-cloud-hardening': ['ops.os-baseline','ops.port-hardening','ops.patch-mgmt','ops.app-control','vul.unquoted-path'],
  'endpoint-mobile-hardening': ['ops.byod','ops.mdm-mam','ops.edr-xdr'],
  'security-operations-automation': ['ops.scan','ops.soar','vul.cvss-cve','vul.zero-day','att.threat-feeds'],
  'incident-response-monitoring': ['ops.siem','ops.logs-syslog','ops.netflow-pcap','ops.fim','ops.ueba','ir.lifecycle-nist'],
  'forensics-recovery': ['ir.chain-of-custody','ir.forensic','ir.volatility-order'],
  'risk-resilience-governance': ['risk','ir.tabletop-drills'],
  'governance-change-vendors': ['gov','sec.change-mgmt','risk.agreements','risk.sbom','risk.vendor-audit'],
  'software-memory-concurrency': ['vul.mem-overflow','vul.race-condition','vul.resource-exhaustion'],
};
const lessonRules = Object.entries(lessonGroups).flatMap(([id, tags]) => tags.map(tag => ({ tag, id })))
  .sort((a, b) => b.tag.length - a.tag.length);

export function conceptDeepDive(tag) {
  const rule = lessonRules.find(rule => tag === rule.tag || tag.startsWith(`${rule.tag}-`) || tag.startsWith(`${rule.tag}.`));
  return rule ? CONCEPT_DEEP_DIVES.find(lesson => lesson.id === rule.id) || null : null;
}

export function buildMcqResultSummary({ questions, results, chapters, engineState, progressAvailable = true }) {
  const domains = chapters.map(chapter => {
    const rows = results.filter((result, index) => result && String(questions[index]?.ch) === String(chapter.id));
    const correct = rows.filter(row => row.correct === true).length;
    return { chapter, total: rows.length, correct, percent: rows.length ? Math.round(correct / rows.length * 100) : 0 };
  }).filter(domain => domain.total > 0);
  // Compare unrounded rates; a larger sample breaks an equal-rate tie.
  const strongest = [...domains].sort((a, b) => b.correct / b.total - a.correct / a.total || b.total - a.total)[0] || null;
  const mastery = new Map((engineState?.mastery || []).map(row => [row.concept_tag, row.score]));
  const streaks = new Map((engineState?.concept_streaks || []).map(row => [row.concept_tag, row.wrong_streak]));
  const missed = new Map();
  results.forEach((result, index) => {
    if (!result || result.correct !== false) return;
    const question = questions[index];
    const tag = result.conceptTag || question?.conceptTagIds?.[0];
    if (!tag) return;
    const entry = missed.get(tag) || { tag, count: 0, lesson: conceptDeepDive(tag) };
    entry.count += 1;
    missed.set(tag, entry);
  });
  const weakPoints = [...missed.values()].map(entry => ({ ...entry,
    score: progressAvailable ? mastery.get(entry.tag) ?? null : null,
    repeated: progressAvailable && (streaks.get(entry.tag) || 0) >= 2,
  })).filter(entry => entry.score === null || entry.score <= 80)
    .sort((a, b) => Number(b.repeated) - Number(a.repeated) || b.count - a.count || a.tag.localeCompare(b.tag));
  const nextFocus = [...missed.values()].filter(entry => progressAvailable && (streaks.get(entry.tag) || 0) >= 2 && entry.lesson);
  return { domains, strongest, weakPoints, nextFocus };
}

// Guests keep report streaks only for this open practice page; no mastery is invented.
export function advanceConceptStreak(streaks, tag, correct) {
  if (!tag) return streaks;
  return { ...streaks, [tag]: correct ? 0 : Math.min(2, (streaks[tag] || 0) + 1) };
}
