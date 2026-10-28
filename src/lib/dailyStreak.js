const localDay=value=>{const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export function getActiveDailyStreak(data, today, yesterday) {
  const source = data && typeof data === "object" ? data : {};
  const lastCompletedDate = String(source.lastCompletedDate || "");
  const savedStreak = Math.max(0, Number(source.streak) || 0);
  const streakIsActive = lastCompletedDate === today || lastCompletedDate === yesterday;

  return {
    streak: streakIsActive ? savedStreak : 0,
    best: Math.max(0, Number(source.best) || 0),
    lastCompletedDate,
    completedToday: lastCompletedDate === today,
    expired: Boolean(savedStreak && !streakIsActive),
  };
}

// Only dated evidence earns a day. Never expand an old numeric streak into history.
export function meaningfulDailyStreak({attempts=[],days={},today=localDay(Date.now())}={}){
 const evidence={};
 for(const [date,value]of Object.entries(days)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date>today)continue;
  evidence[date]={mcqs:0,mcqsBaseline:Math.max(0,Number(value?.mcqsBaseline)||0),sections:new Set(Array.isArray(value?.sections)?value.sections:[]).size,cards:new Set(Array.isArray(value?.cards)?value.cards:[]).size+Math.max(0,Number(value?.cardsBaseline)||0),challenge:value?.challenge===true};
 }
 const questionEvents=new Set();
 for(const row of attempts){
  if(row.pbq||!row.mcq||row.skipped||row.selected===null||typeof row.correct!=='boolean')continue;
  const timestamp=row.createdAt||row.created_at;if(!timestamp||!Number.isFinite(Date.parse(timestamp)))continue;
  const date=localDay(timestamp);if(date>today)continue;
  const key=`${row.qid}:${timestamp}`;if(questionEvents.has(key))continue;questionEvents.add(key);
  (evidence[date]||={mcqs:0,sections:0,cards:0,challenge:false}).mcqs++;
 }
 for(const entry of Object.values(evidence))entry.mcqs=Math.max(entry.mcqs,entry.mcqsBaseline||0);
 const counted=value=>value.mcqs>=10||value.sections>=1||value.cards>=10||value.challenge;
 const dates=Object.keys(evidence).filter(d=>counted(evidence[d])).sort();
 const shift=(key,n)=>new Date(Date.parse(key+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
 const completedToday=dates.includes(today),last=dates.at(-1)||'';
 let streak=0,cursor=completedToday?today:shift(today,-1);
 while(dates.includes(cursor)){streak++;cursor=shift(cursor,-1);}
 let best=0,run=0,previous='';for(const date of dates){run=previous&&shift(previous,1)===date?run+1:1;best=Math.max(best,run);previous=date;}
 const activity=evidence[today]||{mcqs:0,sections:0,cards:0,challenge:false};
 const reasons=[activity.mcqs>=10?`${activity.mcqs} MCQs answered`:null,activity.sections>=1?`${activity.sections} lesson section${activity.sections===1?'':'s'} completed`:null,activity.cards>=10?`${activity.cards} cards rated`:null,activity.challenge?'Daily Challenge completed':null].filter(Boolean);
 return{streak,best,lastCompletedDate:last,completedToday,expired:Boolean(last&&last<shift(today,-1)),dates,activity,reasons};
}
