import { SY0701_ACRONYM_CARDS } from './sy0701AcronymFlashcards.js';
import { CONCEPT_RELATIONSHIPS, LEARNING_CONCEPTS } from './learningConcepts.js';

const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const label = value => `#${String(value).trim().replace(/\s*\/\s*/g, '-').replace(/\s+/g, '-')}`;
const pilotByAcronym = new Map(LEARNING_CONCEPTS.flatMap(concept => concept.aliases.map(alias => [alias.toLowerCase(), concept])));
const disambiguation = new Map([
  ['mac:mandatory access control', ['mac-access-control', '#MAC-Access']],
  ['mac:media access control address', ['mac-address', '#MAC-Address']],
  ['rbac:role-based access control', ['rbac-role', '#RBAC-Role']],
  ['rbac:rule-based access control', ['rbac-rule', '#RBAC-Rule']],
  ['soc:security operations center', ['soc-operations', '#SOC-Operations']],
  ['soc:system on chip', ['soc-chip', '#SoC-Chip']],
]);

export const CONCEPT_TAGS = Object.freeze([
  ...SY0701_ACRONYM_CARDS.filter(card => card.setType === 'acronym').map(card => {
    const pilot = pilotByAcronym.get(card.acronym.toLowerCase());
    const [code, tag] = disambiguation.get(`${card.acronym.toLowerCase()}:${card.expansion.toLowerCase()}`) || [slug(card.acronym), label(card.acronym)];
    return Object.freeze({ id: pilot?.id || `acronym.${code}`, tag, name: card.expansion,
      acronym: card.acronym, sourceCardId: card.id, chapterId: card.chapterId });
  }),
  ...LEARNING_CONCEPTS.filter(concept => !SY0701_ACRONYM_CARDS.some(card => card.setType === 'acronym' && concept.aliases.some(alias => alias.toLowerCase() === card.acronym.toLowerCase())))
    .map(concept => Object.freeze({ id: concept.id, tag: label(concept.aliases[0]), name: concept.name,
      acronym: concept.aliases[0], sourceCardId: null, chapterId: null })),
]);

const byAcronym = acronym => {
  if (acronym === 'SOC') return 'acronym.soc-operations';
  const matches = CONCEPT_TAGS.filter(tag => tag.acronym.toLowerCase() === acronym.toLowerCase());
  if (matches.length !== 1) throw new Error(`Ambiguous or missing concept: ${acronym}`);
  return matches[0].id;
};

// Only explicit links are review neighbors; sharing a flashcard set creates no edge.
const additionalPairs = [
  // Continuity, recovery, and risk measures.
  ['BIA', 'BCP'], ['BCP', 'DRP'], ['BCP', 'COOP'], ['BIA', 'COOP'],
  ['DRP', 'RTO'], ['DRP', 'RPO'], ['HA', 'RTO'], ['HA', 'RAID'], ['HA', 'PDU / UPS'],
  ['MTBF', 'MTTF'], ['MTBF', 'MTTR'], ['ALE', 'ARO'], ['ALE', 'SLE'], ['SLE', 'EF'], ['SLA', 'RTO'],
  // Cryptography and certificate trust.
  ['PKI', 'CA'], ['PKI', 'PKCS'], ['CA', 'RA'], ['CA', 'CSR'], ['CA', 'SCEP'],
  ['CRL', 'OCSP'], ['RSA', 'ECC'], ['ECC', 'ECDSA'], ['AES / AES-256', 'DES'], ['DES', 'RC4'],
  ['DHE', 'ECDHE'], ['DHE', 'PFS'], ['ECDHE', 'PFS'], ['HMAC', 'SHA'], ['HSM', 'TPM'], ['AH', 'IPsec'],
  // Identity and access.
  ['SSO', 'SAML'], ['SSO', 'OIDC'], ['SSO', 'IdP'], ['OIDC', 'OAuth'], ['IdP', 'LDAP'],
  ['AAA', 'RADIUS'], ['AAA', 'TACACS+'], ['RADIUS', 'TACACS+'], ['EAP', 'LEAP'], ['PAP', 'LEAP'],
  ['MFA', 'PIV'], ['PAM', 'JIT'], ['PAM', 'AAA'], ['ACL', 'FACL'],
  // Attack variations and the specific controls that address them.
  ['DoS', 'DDoS'], ['DDoS', 'Reflected Network Attack'], ['Reflected Network Attack', 'Amplified Attack'],
  ['Rogue AP', 'Evil Twin'], ['Wireless Jamming', 'Deauthentication'],
  ['Injection Attack', 'SQLi'], ['Injection Attack', 'Command Injection'], ['Injection Attack', 'XSS'],
  ['XSS', 'CSRF / XSRF'], ['API Attack', 'SSRF'], ['Buffer Overflow', 'Memory Injection'],
  ['Brute Force', 'Dictionary Attack'], ['Brute Force', 'Password Spraying'], ['Dictionary Attack', 'Rainbow Table'],
  ['Phishing', 'Spear Phishing'], ['Spear Phishing', 'Whaling'], ['Phishing', 'Vishing'],
  ['Phishing', 'Smishing'], ['Vishing', 'Smishing'], ['Phishing', 'Typosquatting'],
  ['BEC', 'Impersonation'], ['Impersonation', 'Pretexting'],
  ['Trojan', 'RAT'], ['Virus', 'Worm'], ['Ransomware', 'Trojan'],
  ['Collision Attack', 'Birthday Attack'], ['Firmware Attack', 'BIOS'],
  ['Supply Chain Attack', 'Malicious Update'], ['Side-Loading', 'Jailbreaking / Rooting'], ['VM Escape', 'VM'],
  // Detection, response, and vulnerability management.
  ['SIEM', 'SOAR'], ['SIEM', 'UEBA'], ['SIEM', 'SOC'], ['SOAR', 'SOC'],
  ['EDR', 'XDR'], ['EDR', 'AV'], ['HIDS / NIDS', 'HIPS / NIPS'], ['HIDS / NIDS', 'FIM'],
  ['WIDS / WIPS', 'Rogue AP'], ['WIDS / WIPS', 'AP / WAP'], ['WAF', 'SQLi'], ['WAF', 'XSS'],
  ['DMARC', 'DKIM'], ['STIX', 'TAXII'], ['SCAP', 'CVE'], ['CVE', 'CVSS'],
  ['IRP', 'PICERL'], ['IRP', 'CIRT / CERT'], ['CIRT / CERT', 'SOC'], ['SOC', 'MSSP'],
  // Networks, cloud, devices, and data protection.
  ['ARP', 'ARP Poisoning'], ['VLAN', 'VLAN Hopping'], ['DNS', 'DNS Attack'],
  ['VPN', 'IPsec'], ['VPN', 'SSL / TLS'], ['FTPS / SFTP', 'SSH'], ['FTPS / SFTP', 'SSL / TLS'],
  ['LAN', 'VLAN'], ['SDN', 'SD-WAN'], ['SASE', 'CASB'], ['SASE', 'ZTA'],
  ['MDM', 'UEM'], ['MDM', 'BYOD / COPE / CYOD'], ['OT / ICS', 'SCADA'], ['IoT', 'OT / ICS'],
  ['IaaS / PaaS / SaaS', 'FaaS'], ['IaaS / PaaS / SaaS', 'CASB'],
  ['EFS / FDE', 'SED'], ['TPM', 'SED'], ['RAID', 'HDD / SSD'], ['AP / WAP', 'WPA / WEP'],
  // Security governance and protected data.
  ['GDPR', 'PII'], ['HIPAA', 'PHI'], ['PCI DSS', 'PII'],
  ['NIST', 'CSF'], ['ISO', 'ISMS'], ['CAR', 'PICERL'], ['MOA / MOU', 'MSA'], ['MSA', 'SOW'],
];
const pairs = [
  ...CONCEPT_RELATIONSHIPS.filter(edge => CONCEPT_TAGS.some(tag => tag.id === edge.sourceConceptId) && CONCEPT_TAGS.some(tag => tag.id === edge.targetConceptId))
    .map(edge => [edge.sourceConceptId, edge.targetConceptId]),
  ...additionalPairs.map(([left, right]) => [byAcronym(left), byAcronym(right)]),
];
export const CONCEPT_WEB_EDGES = Object.freeze(pairs.map(([left, right]) => Object.freeze({ left, right })));

export function relatedConceptTagIds(id) {
  return CONCEPT_WEB_EDGES.flatMap(edge => edge.left === id ? [edge.right] : edge.right === id ? [edge.left] : []);
}
