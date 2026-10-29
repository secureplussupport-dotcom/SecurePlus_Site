// Practice totals count completed MCQ answers, including repeat attempts.
export function practiceActivity(attempts = []) {
  const completed=attempts.filter(a=>!a.pbq && a.mcq && typeof a.correct==='boolean' &&
    !(Object.hasOwn(a,'selected') && a.selected==null));
  return {total:completed.length,correct:completed.filter(a=>a.correct).length};
}

export function activityAccuracy(activity) {
  return activity?.total>0?Math.round(activity.correct/activity.total*100):null;
}

export function quotaDisplay(quota, now = Date.now()) {
  if(!quota || !Number.isInteger(quota.limit) || quota.limit<=0 || !Number.isInteger(quota.remaining) ||
    quota.remaining<0 || quota.remaining>quota.limit || (quota.resetAt!==null&&!Number.isFinite(Date.parse(quota.resetAt))))return null;
  if(quota.resetAt===null&&quota.remaining===quota.limit)return {...quota,refreshing:false,fill:1,timer:'All questions available',idle:true};
  const milliseconds=Date.parse(quota.resetAt)-now;
  if(milliseconds<=0)return {...quota,refreshing:true,fill:0,timer:'Refreshing allowance…'};
  const minutes=Math.ceil(milliseconds/60000);
  return {...quota,refreshing:false,fill:quota.remaining/quota.limit,timer:`${Math.floor(minutes/60)}h ${String(minutes%60).padStart(2,'0')}m`};
}

export function streakWeek(streak, completedToday, now = new Date()) {
  return Array.from({length:7},(_,index)=>{
    const offset=6-index,date=new Date(now);date.setDate(date.getDate()-offset);
    return {label:date.toLocaleDateString('en',{weekday:'narrow'}),today:offset===0,
      active:completedToday?offset<streak:offset>=1 && offset<=streak};
  });
}

// Milestones are additional returning slots, not a new fixed-window reset.
// Never credit elapsed releases locally: refresh the server snapshot first.
export function allowanceTimeline(quota, now = Date.now()) {
  const unavailable = {status:'unavailable'};
  const display = quotaDisplay(quota,now);
  if (!display) return unavailable;
  if (display.refreshing) return {status:'refreshing'};
  if (!Number.isInteger(quota.used) || quota.used<0 || !Array.isArray(quota.releases) ||
      !Number.isFinite(Date.parse(quota.asOf)) || quota.remaining!==Math.max(0,quota.limit-quota.used)) return unavailable;
  const releases=quota.releases.map(row=>({at:row.at,time:Date.parse(row.at),questions:row.questions}));
  if (releases.some(row=>!Number.isFinite(row.time)||!Number.isInteger(row.questions)||row.questions<=0) ||
      releases.reduce((sum,row)=>sum+row.questions,0)!==quota.used) return unavailable;
  releases.sort((a,b)=>a.time-b.time);
  if (releases.some(row=>row.time<=now)) return {status:'refreshing'};
  if ((releases[0]?.time??null)!==(quota.resetAt===null?null:Date.parse(quota.resetAt))) return unavailable;
  const pending=quota.limit-quota.remaining;
  const excess=Math.max(0,quota.used-quota.limit);
  const returnsAt=additional=>{
    if(additional<=0)return null;
    let returned=0;
    return releases.find(row=>(returned+=row.questions)>=excess+additional)?.at??null;
  };
  return {status:'ready',remaining:quota.remaining,limit:quota.limit,pending,canPracticeNow:quota.remaining>0,
    nextOneAt:returnsAt(1),nextTenAt:returnsAt(10),fullAt:returnsAt(pending),
    nextSetAt:returnsAt(Math.max(0,10-quota.remaining))};
}
