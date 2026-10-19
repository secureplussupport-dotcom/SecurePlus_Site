import { conceptRepairAnchors } from './lib/mcqConceptReview.js';

const ranked = [
  { question: { id: 'example-rto-2', conceptTagIds: ['recovery.rto'], text: 'A service must recover within two hours. Which metric captures that target?' } },
  { question: { id: 'example-rpo-1', conceptTagIds: ['recovery.rpo'], text: 'How much data loss can the business tolerate after recovery?' } },
  { question: { id: 'example-other', conceptTagIds: ['DNS'], text: 'Which service resolves names to IP addresses?' } },
  { question: { id: 'example-rto-1', conceptTagIds: ['recovery.rto'], text: 'Which metric sets the target time to restore a service after an outage?' } },
];
const result = document.querySelector('#result');
document.querySelector('#miss').addEventListener('click', () => {
  const latestAttempts = new Map([['example-rto-1', { correct: false, pbq: false }]]);
  const picks = conceptRepairAnchors(ranked, latestAttempts, 3);
  const labels = ['Another question on the missed concept', 'Original question returns until answered correctly', 'Related concept'];
  result.innerHTML = `<ol>${picks.map(({ question }, index) => `<li><span class="tag">#${question.conceptTagIds[0].split('.').at(-1).toUpperCase()}</span> ${labels[index]}: ${question.text}</li>`).join('')}</ol>`;
});
document.querySelector('#reset').addEventListener('click', () => {
  result.innerHTML = '<p>Mark the example wrong to see the next three questions.</p>';
});
