import { freeze } from '../lib/learningConfig.js';

export const MAPPING_VERSION = 'sy0701-concepts-v1';
// Reviewed against effective local content by the implementation agent.
// Human editorial approval is still required before learner-facing use.
export const EDITORIAL_STATUS = 'agent_reviewed_pending_human';
const concept = (id, name, description, aliases, objectiveCodes = ['5.2']) => ({
  id, name, description, objectiveCodes,
  domainId: 'sy0701.domain-5', chapterId: 'sy0701.objective-5.2',
  topicId: 'business-continuity-metrics', editorialStatus: EDITORIAL_STATUS,
  mappingVersion: MAPPING_VERSION, aliases,
});
export const LEARNING_CONCEPTS = freeze([
  concept('recovery.rto', 'Recovery Time Objective', 'The target time to restore an acceptable service level after disruption.', ['RTO'], ['5.2', '3.4']),
  concept('recovery.rpo', 'Recovery Point Objective', 'The maximum acceptable loss of data measured backward in time.', ['RPO'], ['5.2', '3.4']),
  concept('recovery.mtd', 'Maximum Tolerable Downtime', 'The outer interruption limit before a business function suffers unacceptable harm.', ['MTD']),
  concept('recovery.mttr', 'Mean Time to Repair / Recover', 'Average time needed to repair a failure or restore service, rather than a recovery deadline.', ['MTTR']),
  concept('continuity.bia', 'Business Impact Analysis', 'Identifies critical business functions and disruption impacts to inform recovery planning.', ['BIA']),
]);
