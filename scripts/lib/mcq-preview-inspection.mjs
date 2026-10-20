import assignments from '../../src/data/mcqConceptTagAssignments.json' with { type: 'json' };

const assigned = new Map(assignments.assignments.map(row => [row.questionId, row]));
const deckLabels = { 1: 'Retest', 2: 'Remediation', 3: 'Discovery' };

// Local preview metadata only. Explicit fields keep grading keys out of inspection.
export function previewInspection(state, plan) {
  const inspection = {
    mastery: state.mastery,
    failed: state.failed,
    answeredQuestions: state.history.length,
  };
  if (plan) inspection.questions = plan.questions.map(q => ({
    id: q.id,
    deck: deckLabels[q.deck] || 'Unclassified',
    primaryTag: q.concept_tag,
    secondaryTags: assigned.get(q.id)?.secondaryTagIds || [],
    distractorTags: assigned.get(q.id)?.distractorTagIds || [],
  }));
  return inspection;
}
