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
    quota.remaining<0 || quota.remaining>quota.limit || !Number.isFinite(Date.parse(quota.resetAt)))return null;
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
