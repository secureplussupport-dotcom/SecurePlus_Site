import groups from '../data/mcqConceptTagGroups.json' with { type: 'json' };

export const EXAM_SECONDS_PER_QUESTION = 72;
export const EXAM_GROUP_WEIGHTS = { 'Heavy weight': 3, Standard: 2, Niche: 1 };
const groupByTag = new Map(Object.entries(groups).flatMap(([group, value]) => value.tagIds.map(tag => [tag, group])));
export const examConceptTag = question => question.conceptTagIds?.[0] || question.topic || question.id;

export function buildMcqExam(bank, count, pro = false, random = Math.random) {
  if (!Number.isInteger(count) || count < 10 || count > (pro ? 50 : 30) || (!pro && ![10,20,30].includes(count))) {
    throw new Error(pro ? 'Choose 10–50 questions.' : 'Choose 10, 20 or 30 questions.');
  }
  const seen = new Set();
  const buckets = new Map();
  for (const question of bank) {
    if (!/^m[a-z0-9_-]+$/i.test(question.id) || question.pbq || question.beyondTextbook || !Array.isArray(question.opts) || seen.has(question.id)) continue;
    seen.add(question.id);
    const tag = examConceptTag(question);
    if (!buckets.has(tag)) buckets.set(tag, { tag, group: groupByTag.get(tag) || 'Standard', used: 0, questions: [] });
    // Untiered tags have a neutral Standard sampling weight; their stored groups are unchanged.
    buckets.get(tag).questions.push(question);
  }
  const cap = Math.ceil(count / 10);
  const capacity = [...buckets.values()].reduce((sum, bucket) => sum + Math.min(cap, bucket.questions.length), 0);
  if (capacity < count) throw new Error('Not enough distinct concepts for this exam. Choose a smaller set.');
  const picked = [];
  while (picked.length < count) {
    const available = [...buckets.values()].filter(bucket => bucket.used < cap && bucket.questions.length);
    const eligibleGroups = Object.entries(EXAM_GROUP_WEIGHTS).filter(([group]) => available.some(bucket => bucket.group === group));
    let draw = random() * eligibleGroups.reduce((sum, [,weight]) => sum + weight, 0);
    const group = eligibleGroups.find(([, weight]) => (draw -= weight) < 0)?.[0] || eligibleGroups.at(-1)[0];
    const concepts = available.filter(bucket => bucket.group === group);
    const bucket = concepts[Math.floor(random() * concepts.length)];
    picked.push(bucket.questions.splice(Math.floor(random() * bucket.questions.length), 1)[0]);
    bucket.used += 1;
  }
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked;
}

export function examTiming(startedAt, finishedAt, count, now = Date.now()) {
  const elapsed = Math.max(0, Math.floor(((finishedAt ?? now) - startedAt) / 1000));
  const permitted = count * EXAM_SECONDS_PER_QUESTION;
  return { elapsed, permitted, remaining: permitted - elapsed, overtime: elapsed > permitted };
}

export function formatExamTime(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(value / 3600);
  return `${hours ? `${hours}:` : ''}${String(Math.floor(value / 60) % 60).padStart(2,'0')}:${String(value % 60).padStart(2,'0')}`;
}
