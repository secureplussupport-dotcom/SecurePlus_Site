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
  const matches = CONCEPT_TAGS.filter(tag => tag.acronym.toLowerCase() === acronym.toLowerCase());
  if (matches.length !== 1) throw new Error(`Ambiguous or missing concept: ${acronym}`);
  return matches[0].id;
};

// Only explicit links are review neighbors; sharing a flashcard set creates no edge.
const additionalPairs = [
  ['BIA', 'BCP'], ['BCP', 'DRP'],
  ['PKI', 'CA'], ['CA', 'RA'], ['CRL', 'OCSP'],
  ['SSO', 'SAML'], ['SSO', 'OIDC'],
  ['SIEM', 'SOAR'], ['CVE', 'CVSS'], ['PAM', 'JIT'],
  ['Phishing', 'Spear Phishing'], ['Spear Phishing', 'Whaling'], ['Vishing', 'Smishing'],
  ['Injection Attack', 'SQLi'], ['Injection Attack', 'Command Injection'],
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
