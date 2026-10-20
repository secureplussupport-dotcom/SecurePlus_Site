import { CONCEPT_TAGS } from '../data/sy0701ConceptTags.js';

const knownTagIds = new Set(CONCEPT_TAGS.map(tag => tag.id));

export function effectiveMcqConceptTagIds(question, assignedTags = [], taggingVersion) {
  // Older Question Manager saves contain IDs from the retired catalogue.
  // A save made with this version (including an intentional empty list) wins.
  const tags = question.taggingVersion === taggingVersion && Array.isArray(question.conceptTagIds)
    ? question.conceptTagIds : assignedTags;
  return [...new Set(tags.filter(id => knownTagIds.has(id)))];
}
