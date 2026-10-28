import {SY0701_DOMAINS}from'../data/sy0701Domains.js';
export const dateKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export const addDays=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
export function monthTarget(month){
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month||''))throw Error('Choose a valid target month.');
 const [year,m]=month.split('-').map(Number);return new Date(Date.UTC(year,m,0,12)).toISOString().slice(0,10);
}
export function studyPreferences(input={},today=dateKey()){
 const minutes=Number(input.dailyMinutes??20);
 if(!Number.isInteger(minutes)||minutes<1||minutes>1440)throw Error('Choose 1–1440 minutes per day.');
 const kind=['booked','target-month','target-date'].includes(input.targetKind)?input.targetKind:'target-date';
 const target=kind==='target-month'&&input.targetMonth?monthTarget(input.targetMonth):input.targetDate;
 if(target&&!validDate(target))throw Error('Choose a valid target date.');
 return{targetDate:target||addDays(today,42),targetKind:kind,targetMonth:kind==='target-month'?(input.targetMonth||String(target).slice(0,7)):null,dailyMinutes:minutes};
}
const normalMastery=mastery=>[...new Map((mastery||[]).map(c=>[c.tag||c.concept_tag,{tag:c.tag||c.concept_tag,chapter:String(c.chapter||c.domainId||''),score:Math.max(0,Math.min(100,(Number.isFinite(Number(c.score))?Number(c.score):50))),attempted:c.attempted!==false}])).values()].filter(c=>c.tag).sort((a,b)=>a.tag.localeCompare(b.tag));
export function planSignature(preferences,mastery){return JSON.stringify([2,preferences.targetDate,preferences.targetKind,preferences.dailyMinutes,normalMastery(mastery)]);}
export function buildStudyPlan({preferences={},mastery=[],completedLessons=[],lessons=[],decks=[],today=dateKey(),previous=null}){
 const prefs=studyPreferences(preferences,today),signature=planSignature(prefs,mastery);
 if(previous?.signature===signature)return previous;
 const frozen=(previous?.version===2?previous.weeks:[]).filter(w=>w.start<=today);
 const start=frozen.at(-1)?.end||today;
 const days=Math.max(0,Math.ceil((Date.parse(prefs.targetDate)-Date.parse(start))/86400000));
 const horizon=Math.min(days,364),count=Math.ceil(horizon/7);
 const known=normalMastery(mastery).filter(c=>c.attempted),completed=new Set(completedLessons),used=new Set(frozen.flatMap(w=>w.lessons.map(l=>l.id)));
 const assigned=Object.fromEntries(SY0701_DOMAINS.map(d=>[d.id,frozen.filter(w=>w.primary===d.id).length]));
 const weights=SY0701_DOMAINS.map(d=>{const rows=known.filter(c=>c.chapter===String(d.id));return{...d,need:d.weight*(rows.length?1+(100-rows.reduce((s,c)=>s+c.score,0)/rows.length)/100:1.5)};});
 const future=Array.from({length:count},(_,i)=>{
  const ranked=[...weights].sort((a,b)=>b.need/(1+assigned[b.id])-a.need/(1+assigned[a.id])||a.id-b.id);
  const primary=ranked[0].id,secondary=ranked[1].id;assigned[primary]++;
  const weekDays=Math.min(7,horizon-i*7),budgetMinutes=prefs.dailyMinutes*weekDays,lessonCount=Math.max(0,Math.min(3,Math.floor(budgetMinutes*.25/10)));
  let lessonMinutes=0;
  const selected=[];
  for(const domain of [primary,secondary])for(const lesson of lessons.filter(l=>Number(l.domainId)===domain)){
   if(selected.length>=lessonCount)break;
   const duration=Math.max(1,Number(lesson.minutes)||10);
   if(!completed.has(lesson.id)&&!used.has(lesson.id)&&lessonMinutes+duration<=budgetMinutes*.4){selected.push(lesson);used.add(lesson.id);lessonMinutes+=duration;}
  }
  const deck=decks.find(d=>Number(d.chapterId??d.domain_id)===primary)||null;
  const flashcardMinutes=deck?Math.min(10,Math.floor(budgetMinutes*.15)):0;
  return{budgetMinutes,lessonMinutes,flashcardMinutes,index:frozen.length+i+1,start:addDays(start,i*7),end:addDays(start,i*7+weekDays),primary,secondary,lessons:selected.sort((a,b)=>lessons.indexOf(a)-lessons.indexOf(b)),mcqTarget:Math.min(weekDays*90,Math.max(0,Math.floor((budgetMinutes-lessonMinutes-flashcardMinutes)/2))),deck:deck?{id:deck.id,title:deck.title}:null};
 });
 const weeks=[...frozen,...future];
 return{version:2,signature,preferences:prefs,weeks,generatedOn:today,overdue:prefs.targetDate<=today,compressed:days>0&&days<14,rollingHorizon:days>364,remainingLessons:lessons.filter(l=>!completed.has(l.id)&&!used.has(l.id)).length};
}
export function focusOfDay({retests=[],mastery=[],lessons=[],completedLessons=[],catalogue=[],primary=4}){
 const due=[...retests].filter(q=>Number(q.cooldown_counter)<=0).sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||''))||String(a.question_id).localeCompare(String(b.question_id)))[0];
 if(due)return{kind:'retest',title:'Your due retest',concept:due.concept_tag||null,questionId:due.question_id,view:'mcq'};
 const weak=normalMastery(mastery).filter(c=>c.attempted&&c.score<80).sort((a,b)=>a.score-b.score||a.tag.localeCompare(b.tag))[0];
 if(weak)return{kind:'weak-concept',title:'Strengthen your weakest concept',concept:weak.tag,score:weak.score,view:'mcq'};
 const next=lessons.find(l=>Number(l.domainId)===Number(primary)&&!completedLessons.includes(l.id));
 if(next)return{kind:'lesson',title:next.title,lessonId:next.id,view:'deep-dives'};
 const attempted=new Set(normalMastery(mastery).filter(c=>c.attempted).map(c=>c.tag));
 const fresh=catalogue.find(c=>!attempted.has(c.tag));
 return fresh?{kind:'coverage',title:'Explore a new topic',concept:fresh.tag,view:'mcq'}:{kind:'complete',title:'No pending focus. Keep practising.',view:'mcq'};
}
