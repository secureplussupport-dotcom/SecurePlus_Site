// Readiness uses the same mastery rule, replayed over MCQ sets and Exams only.
export function localReadinessEvidence(attempts = []) {
  const concepts = new Map(), chapters = {};
  let total = 0;
  for (const event of [...attempts].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))) {
    if ((Object.hasOwn(event,'selected') && event.selected == null) || event.pbq || !['mcq-set','exam'].includes(event.readinessSource || (event.exam ? 'exam' : '')) || typeof event.correct !== 'boolean' || !event.conceptTag) continue;
    const previous = concepts.get(event.conceptTag);
    concepts.set(event.conceptTag, {tag:event.conceptTag, score:Math.max(0,Math.min(100,(previous?.score ?? 50)+(event.correct?20:-35))), chapter:String(event.ch || '')});
    if (/^[1-5]$/.test(String(event.ch))) {
      const stats = chapters[event.ch] ||= {correct:0,total:0};
      stats.total++; if(event.correct) stats.correct++;
    }
    total++;
  }
  return {concepts:[...concepts.values()],chapters,total,unclassified:0};
}

export function summarizeReadiness(evidence = {}) {
  const concepts = (evidence.concepts || []).filter(c=>c.tag && Number.isFinite(c.score) && c.score>=0 && c.score<=100);
  const mean = concepts.length ? concepts.reduce((sum,c)=>sum+c.score,0)/concepts.length : null;
  // Keep one decimal without rounding a score below 80 up to the readiness milestone.
  const score = mean == null ? null : Math.floor(mean*10)/10;
  const mastered = concepts.filter(c=>c.score>=80).length;
  const unmastered = concepts.filter(c=>c.score<80);
  const byChapter = {};
  for(const c of unmastered) {const key=/^[1-5]$/.test(c.chapter)?c.chapter:'unknown';byChapter[key]=(byChapter[key]||0)+1;}
  return {score,mean,attempted:concepts.length,mastered,unmastered:unmastered.length,byChapter,
    chapters:evidence.chapters || {},unclassified:evidence.unclassified || 0,
    level:mean>=80?'Exam ready':mean>=60?'Growing confidence':mean>=30?'Building momentum':'Just starting'};
}
