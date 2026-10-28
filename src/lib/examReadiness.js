import {practiceActivity} from './dashboardMetrics.js';
import {READINESS_CONCEPT_CATALOGUE} from '../data/readinessConceptCatalogue.js';
import {SY0701_DOMAINS} from '../data/sy0701Domains.js';
export const READINESS_CATALOGUE=Object.entries(READINESS_CONCEPT_CATALOGUE).flatMap(([chapter,tags])=>tags.map(tag=>({tag,chapter})));
const day=86400000;
const eligible=event=>!event.pbq&&!event.skipped&&event.selected!==null&&event.selected_option_id!==null&&typeof event.correct==='boolean'&&Boolean(event.conceptTag)&&['mcq-set','exam'].includes(event.readinessSource||(event.exam?'exam':''));
export function localReadinessEvidence(attempts=[]){
 const concepts=new Map(),chapters={},ids=new Set(),days=new Set(),dates=[];
 let total=0,correct=0;
 for(const event of [...attempts].sort((a,b)=>Date.parse(a.createdAt||0)-Date.parse(b.createdAt||0))){
  if(!eligible(event))continue;
  const previous=concepts.get(event.conceptTag);
  concepts.set(event.conceptTag,{tag:event.conceptTag,score:Math.max(0,Math.min(100,(previous?.score??50)+(event.correct?20:-35))),chapter:String(event.ch||'')});
  const stats=chapters[event.ch]||={correct:0,total:0};stats.total++;if(event.correct)stats.correct++;
  total++;if(event.correct)correct++;
  if(event.qid)ids.add(event.qid);
  const date=Date.parse(event.createdAt);if(Number.isFinite(date)){dates.push(date);days.add(new Date(date).toISOString().slice(0,10));}
 }
 return{concepts:[...concepts.values()],chapters,total,correct,unclassified:0,activity:practiceActivity(attempts),metrics:{distinctQuestions:ids.size,distinctConcepts:concepts.size,domainsAttempted:Object.keys(chapters).filter(id=>/^[1-5]$/.test(id)),practiceDays:days.size,firstAttemptAt:dates.length?new Date(Math.min(...dates)).toISOString():null,lastPracticeAt:dates.length?new Date(Math.max(...dates)).toISOString():null}};
}

// Accuracy is a separate diagnostic. No accuracy, lesson or card activity enters mastery.
export function summarizeReadiness(evidence={},catalogue=READINESS_CATALOGUE,now=Date.now()){
 const scores=new Map((evidence.concepts||[]).filter(c=>c.tag&&Number.isFinite(c.score)&&c.score>=0&&c.score<=100).map(c=>[c.tag,c.score]));
 const unique=new Map(catalogue.filter(c=>c.tag&&/^[1-5]$/.test(String(c.chapter))).map(c=>[c.tag,{...c,chapter:String(c.chapter)}]));
 const metrics=evidence.metrics||{},distinctQuestions=Number(metrics.distinctQuestions)||0;
 const total=Number(evidence.total)||0;
 const first=Date.parse(metrics.firstAttemptAt),last=Date.parse(metrics.lastPracticeAt);
 const domainsAttempted=[...new Set((metrics.domainsAttempted||[]).map(String).filter(x=>/^[1-5]$/.test(x)))].length;
 const practiceDays=Number(metrics.practiceDays)||0;
 // Time alone cannot promote confidence. Evaluate history age at the last actual practice.
 const age=Number.isFinite(first)&&Number.isFinite(last)?Math.max(0,(last-first)/day):0;
 const confidence=distinctQuestions>=150&&domainsAttempted===5&&age>=7&&practiceDays>=3?'High':distinctQuestions>=50&&domainsAttempted===5&&practiceDays>=2?'Medium':'Low';
 const domains=SY0701_DOMAINS.map(domain=>{
  const concepts=[...unique.values()].filter(c=>c.chapter===String(domain.id)).map(c=>({...c,score:scores.get(c.tag)??50,attempted:scores.has(c.tag)}));
  const mean=concepts.length?concepts.reduce((sum,c)=>sum+c.score,0)/concepts.length:50;
  const stats=evidence.chapters?.[domain.id];
  return{...domain,mean,mastery:Math.round(mean),attempted:concepts.filter(c=>c.attempted).length,total:concepts.length,accuracy:stats?.total?Math.round(stats.correct/stats.total*100):null,weakest:[...concepts].sort((a,b)=>a.score-b.score||a.tag.localeCompare(b.tag)).slice(0,2),contribution:mean*domain.weight/100};
 });
 const mean=domains.reduce((sum,d)=>sum+d.contribution,0),hasEvidence=total>0&&distinctQuestions>0;
 const score=hasEvidence?Math.round(mean):null;
 const performanceLevel=mean<50?'Building foundations':mean<70?'Growing confidence':mean<80?'Nearly ready':'Exam ready';
 const level=!hasEvidence?'No estimate yet':confidence==='Low'?(mean>=80?'Above 80 on early evidence — keep covering the exam':'Early estimate'):performanceLevel;
 const stale=hasEvidence&&Number.isFinite(last)&&now-last>14*day;
 const concepts=[...unique.values()].map(c=>({...c,score:scores.get(c.tag)??50,attempted:scores.has(c.tag)}));
 const mastered=concepts.filter(c=>c.score>=80).length,unmastered=concepts.filter(c=>c.score<80),byChapter={};
 for(const c of unmastered)byChapter[c.chapter]=(byChapter[c.chapter]||0)+1;
 const correct=Number.isFinite(evidence.correct)?evidence.correct:Object.values(evidence.chapters||{}).reduce((sum,s)=>sum+(s.correct||0),0);
 return{score,mean:hasEvidence?mean:null,level,performanceLevel,confidence,distinctQuestions,domainsAttempted,practiceDays,firstAttemptAt:metrics.firstAttemptAt||null,lastPracticeAt:metrics.lastPracticeAt||null,stale,staleNotice:stale?'Stale — complete a new set to refresh your estimate':'',explanation:!hasEvidence?'Answer an MCQ set or exam to get your first estimate.':`Based on ${distinctQuestions} questions, readiness is exam-weighted mastery across all concepts, with unattempted concepts starting at 50.`,accuracy:total?Math.round(correct/total*100):null,domains,concepts,attempted:concepts.filter(c=>c.attempted).length,totalConcepts:concepts.length,mastered,unmastered:unmastered.length,byChapter,chapters:evidence.chapters||{},activity:evidence.activity||null,unclassified:evidence.unclassified||0,metrics};
}
