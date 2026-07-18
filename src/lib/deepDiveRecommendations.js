import { CONCEPT_DEEP_DIVES } from "../data/conceptDeepDives.js";
import {
  getSy0701DeepDiveProfile,
  sortDeepDivesBySy0701,
} from "../data/sy0701DeepDiveMap.js";

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "best", "by", "for", "from", "has", "have", "in", "is", "it", "most", "of", "on", "or", "should", "that", "the", "their", "this", "to", "use", "used", "using", "what", "when", "which", "with",
]);

// Broad MCQ topic labels need a small amount of editorial guidance. Question words
// and exact exam terms still decide the final ranking within these candidate lessons.
const TOPIC_LESSON_HINTS = [
  { pattern:/security controls?|control (?:types?|categories)|cia triad|security principles?|security concepts?/i, ids:["security-foundations-controls"] },
  { pattern:/zero trust/i, ids:["security-foundations-controls", "identity-zero-trust"] },
  { pattern:/pki|certificat/i, ids:["pki-email-trust", "keys-passwords-encryption"] },
  { pattern:/cryptograph|encryption|hash/i, ids:["keys-passwords-encryption", "crypto-modes-pqc-transition", "pki-email-trust"] },
  { pattern:/authentication|authori[sz]ation|access control/i, ids:["access-control-pam", "federation-modern-auth", "kerberos-aaa-enterprise-auth"] },
  { pattern:/threat actors?|insider threats?|common threats?|motivations?/i, ids:["threat-actors-surfaces"] },
  { pattern:/social engineering|security awareness/i, ids:["threat-actors-surfaces", "web-social-dns-attacks"] },
  { pattern:/malware|indicators? of compromise/i, ids:["malware-indicators-attacks", "incident-response-monitoring"] },
  { pattern:/application (?:security|vulnerabilities)|vulnerability types?|software/i, ids:["secure-software-applications", "software-memory-concurrency", "api-session-browser-security"] },
  { pattern:/network attacks?/i, ids:["web-social-dns-attacks", "network-defense-architecture"] },
  { pattern:/mitigation/i, ids:["platform-cloud-hardening", "network-defense-architecture"] },
  { pattern:/cloud|virtuali[sz]ation|containers?|infrastructure as code/i, ids:["cloud-containers-automation"] },
  { pattern:/scada|ics|embedded|industrial/i, ids:["ot-iot-cyber-physical"] },
  { pattern:/wireless|wi-?fi|802\.1x|wpa/i, ids:["wifi-access-defense"] },
  { pattern:/secure protocols?|ports?|tls|ipsec|vpn/i, ids:["network-protocols-ports", "ipsec-secure-media"] },
  { pattern:/network (?:architecture|infrastructure)|infrastructure security|segmentation|secure design|security architecture/i, ids:["enterprise-network-segmentation", "network-defense-architecture"] },
  { pattern:/data (?:protection|security|classification)/i, ids:["data-classification-lifecycle"] },
  { pattern:/endpoint hardening|configuration management/i, ids:["endpoint-mobile-hardening", "platform-cloud-hardening"] },
  { pattern:/vulnerability (?:management|scanning)/i, ids:["security-operations-automation"] },
  { pattern:/monitoring|siem|threat hunting|security operations/i, ids:["incident-response-monitoring", "security-operations-automation"] },
  { pattern:/incident response/i, ids:["incident-response-monitoring", "forensics-recovery"] },
  { pattern:/digital forensics/i, ids:["forensics-recovery"] },
  { pattern:/identity|authentication methods?/i, ids:["identity-zero-trust", "access-control-pam", "federation-modern-auth"] },
  { pattern:/automation|orchestration/i, ids:["security-operations-automation"] },
  { pattern:/business continuity|resilience|recovery/i, ids:["resilience-assets-physical", "risk-resilience-governance"] },
  { pattern:/risk management|security metrics/i, ids:["risk-resilience-governance"] },
  { pattern:/privacy|compliance|data legal/i, ids:["data-legal-responsibility", "data-classification-lifecycle"] },
  { pattern:/governance|polic(?:y|ies)|frameworks?|third-party|change/i, ids:["governance-change-vendors"] },
];

const normalize = value => String(value || "")
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9.]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const tokens = value => new Set(normalize(value).split(" ").filter(token => token.length > 2 && !STOP_WORDS.has(token)));

const questionText = question => [
  question?.topic,
  question?.q,
  question?.title,
  question?.exp,
  question?.explanation,
  ...(Array.isArray(question?.opts) ? question.opts : []),
].filter(Boolean).join(" ");

const lessonSearchText = (dive, profile) => [
  profile?.title,
  profile?.plainSummary,
  ...(profile?.examKeywords || []),
  ...(profile?.objectiveLabels || []).map(item => item.title),
  dive.title,
  dive.subtitle,
  dive.summary,
  ...(dive.aliases || []),
].filter(Boolean).join(" ");

const matchingTerms = (question, dive, profile) => {
  const haystack = normalize(questionText(question));
  const phrases = [
    ...(profile?.examKeywords || []),
    ...(dive.aliases || []),
  ]
    .map(term => ({ display:String(term), normalized:normalize(term) }))
    .filter(term => term.normalized.length >= 3 && haystack.includes(term.normalized));
  const seen = new Set();
  return phrases.filter(term => {
    if (seen.has(term.normalized)) return false;
    seen.add(term.normalized);
    return true;
  }).map(term => term.display).slice(0, 4);
};

/**
 * Turns missed MCQs into a ranked, explainable Concept Deep Dive path.
 * Exact objective codes and named exam terms outweigh broad chapter matches.
 */
export function getDeepDiveRecommendations(questions = [], options = {}) {
  const limit = Math.max(1, Math.min(4, Number(options.limit) || 2));
  const misses = questions.filter(Boolean);
  if (!misses.length) return [];

  const ranked = sortDeepDivesBySy0701(CONCEPT_DEEP_DIVES).map(dive => {
    const profile = getSy0701DeepDiveProfile(dive);
    const lessonTokens = tokens(lessonSearchText(dive, profile));
    let score = 0;
    const evidenceQuestionIds = new Set();
    const evidenceTopics = new Set();
    const terms = new Set();

    misses.forEach((question, questionIndex) => {
      const topic = String(question.topic || "").trim();
      const text = questionText(question);
      const normalizedText = normalize(text);
      const questionTokens = tokens(text);
      const objective = String(question.objective || question.objectiveCode || "").trim();
      let questionScore = 0;

      if (objective && profile?.objectiveCodes?.includes(objective)) questionScore += 90;
      TOPIC_LESSON_HINTS.forEach(hint => {
        if (hint.pattern.test(topic)) {
          const position = hint.ids.indexOf(dive.id);
          if (position >= 0) questionScore += Math.max(18, 54 - position * 14);
        }
      });
      if (String(profile?.domainId) === String(question.ch)) questionScore += 12;

      const exactTerms = matchingTerms(question, dive, profile);
      exactTerms.forEach((term, index) => {
        questionScore += index === 0 ? 24 : 10;
        terms.add(term);
      });

      let overlap = 0;
      questionTokens.forEach(token => { if (lessonTokens.has(token)) overlap += 1; });
      questionScore += Math.min(20, overlap * 2.5);

      const normalizedTitle = normalize(profile?.title);
      if (normalizedTitle && normalizedText.includes(normalizedTitle)) questionScore += 30;

      if (questionScore > 15) {
        evidenceQuestionIds.add(String(question.id || question.qid || `question-${questionIndex}`));
        if (topic) evidenceTopics.add(topic);
      }
      score += questionScore;
    });

    return {
      id: dive.id,
      title: profile?.title || dive.title,
      summary: profile?.plainSummary || dive.summary,
      domainId: profile?.domainId || dive.chapter,
      domainName: profile?.domain?.name || dive.category,
      objectiveCodes: profile?.objectiveCodes || [],
      minutes: dive.minutes,
      examKeywords: profile?.examKeywords || [],
      matchedTerms: [...terms].slice(0, 3),
      matchedTopics: [...evidenceTopics].slice(0, 3),
      evidenceCount: evidenceQuestionIds.size,
      score,
      studyOrder: profile?.studyOrder || 999,
    };
  });

  const useful = ranked
    .filter(item => item.evidenceCount > 0 && item.score >= 28)
    .sort((left, right) => right.score - left.score || right.evidenceCount - left.evidenceCount || left.studyOrder - right.studyOrder);

  // A chapter-level fallback ensures every real weak area gets a valid lesson.
  const fallbackDomain = String(misses[0]?.ch || "");
  const fallback = ranked
    .filter(item => String(item.domainId) === fallbackDomain)
    .sort((left, right) => left.studyOrder - right.studyOrder);

  const combined = useful.length ? useful : fallback;
  const seen = new Set();
  return combined.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, limit);
}

export function describeDeepDiveMatch(recommendation) {
  const concepts = recommendation?.matchedTerms?.length
    ? recommendation.matchedTerms
    : recommendation?.matchedTopics || [];
  if (concepts.length) return `Matches ${concepts.slice(0, 2).join(" and ")} from your missed questions.`;
  return `Builds the Domain ${recommendation?.domainId} foundation behind this weak area.`;
}
