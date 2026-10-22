import test from 'node:test';
import assert from 'node:assert/strict';
import {practiceActivity,activityAccuracy,quotaDisplay,streakWeek} from '../src/lib/dashboardMetrics.js';
test('practice metrics include repeated MCQ, Exam and Daily answers; exclude PBQs and unanswered questions',()=>{
  const totals=practiceActivity([{mcq:true,qid:'m1',correct:true},{mcq:true,qid:'m1',correct:false},
    {mcq:true,exam:true,correct:true},{mcq:true,readinessSource:'daily-challenge',correct:true},
    {pbq:true,correct:true},{mcq:true,correct:false,selected:null},{mcq:true,correct:null}]);
  assert.deepEqual(totals,{total:4,correct:3});assert.equal(activityAccuracy(totals),75);
  assert.equal(activityAccuracy(practiceActivity([])),null);
});
test('quota never invents limits, distinguishes expired data and formats a real reset time',()=>{
  const now=Date.parse('2026-10-22T00:00:00Z');
  assert.equal(quotaDisplay(null,now),null);
  assert.equal(quotaDisplay({limit:30,remaining:31,resetAt:'2026-10-22T12:00:00Z'},now),null);
  const live=quotaDisplay({limit:30,remaining:12,resetAt:'2026-10-22T03:04:01Z'},now);
  assert.equal(live.fill,.4);assert.equal(live.timer,'3h 05m');assert.equal(live.refreshing,false);
  const expired=quotaDisplay({limit:30,remaining:0,resetAt:'2026-10-21T23:00:00Z'},now);
  assert.equal(expired.refreshing,true);assert.equal(expired.timer,'Refreshing allowance…');
});

test('streak ribbon reflects today versus yesterday without inventing activity',()=>{
  const now=new Date('2026-10-22T12:00:00');
  assert.equal(streakWeek(3,true,now).filter(d=>d.active).length,3);
  assert.equal(streakWeek(3,false,now).filter(d=>d.active).length,3);
  assert.equal(streakWeek(3,false,now).at(-1).active,false);
  assert.equal(streakWeek(0,false,now).some(d=>d.active),false);
});
