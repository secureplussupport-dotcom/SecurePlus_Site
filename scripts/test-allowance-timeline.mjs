import test from 'node:test';
import assert from 'node:assert/strict';
import {allowanceTimeline} from '../src/lib/dashboardMetrics.js';
const now=Date.parse('2026-10-29T00:02:00Z');
const at=minutes=>new Date(now+minutes*60000).toISOString();
const snapshot=(counts,remaining=50-counts.reduce((n,r)=>n+r[1],0))=>({limit:50,remaining,used:counts.reduce((n,r)=>n+r[1],0),asOf:new Date(now).toISOString(),resetAt:counts.length?at(Math.min(...counts.map(row=>row[0]))):null,windowHours:12,releases:counts.map(([minutes,questions])=>({at:at(minutes),questions}))});
test('after one 10-question set, 40 are available now; all three milestones return in 11h58m',()=>{
 const r=allowanceTimeline(snapshot([[718,10]]),now);
 assert.equal(r.remaining,40);assert.equal(r.canPracticeNow,true);
 assert.equal(r.nextOneAt,at(718));assert.equal(r.nextTenAt,at(718));assert.equal(r.fullAt,at(718));
});
test('at the cap, staggered batches restore capacity on their own timestamps',()=>{
 const r=allowanceTimeline(snapshot([[2,1],[10,8],[20,11],[60,30]]),now);
 assert.equal(r.remaining,0);assert.equal(r.canPracticeNow,false);assert.equal(r.nextOneAt,at(2));assert.equal(r.nextTenAt,at(20));assert.equal(r.fullAt,at(60));
});
test('a partially available bank distinguishes the next 10 returns from a playable 10-question set',()=>{
 const r=allowanceTimeline(snapshot([[2,9],[60,40]]),now);
 assert.equal(r.remaining,1);assert.equal(r.nextTenAt,at(60));assert.equal(r.nextSetAt,at(2));
});
test('fewer than ten pending and a fully available bank never invent future refills',()=>{
 const r=allowanceTimeline(snapshot([[5,5]]),now);assert.equal(r.nextTenAt,null);assert.equal(r.pending,5);assert.equal(r.nextSetAt,null);
 const full=allowanceTimeline(snapshot([]),now);assert.equal(full.remaining,50);assert.equal(full.pending,0);assert.equal(full.fullAt,null);assert.equal(full.canPracticeNow,true);
});
test('expired, missing or inconsistent schedules request fresh evidence instead of guessing',()=>{
 assert.equal(allowanceTimeline(snapshot([[-1,10]]),now).status,'refreshing');
 assert.equal(allowanceTimeline({limit:50,remaining:40,resetAt:at(3)},now).status,'unavailable');
 assert.equal(allowanceTimeline({...snapshot([[3,10]]),used:20},now).status,'unavailable');
 assert.equal(allowanceTimeline({...snapshot([[3,10]]),releases:[{at:'invalid',questions:10}]},now).status,'unavailable');
 assert.equal(allowanceTimeline({...snapshot([[3,10]]),releases:[{at:at(3),questions:-10}]},now).status,'unavailable');
});
test('a former Pro user with over-cap usage sees when capacity actually returns',()=>{
 const r=allowanceTimeline(snapshot([[1,30],[5,21],[20,49]],0),now);
 assert.equal(r.nextOneAt,at(5));assert.equal(r.nextTenAt,at(20));assert.equal(r.fullAt,at(20));
});
test('same-time releases combine and sorting never mutates server evidence',()=>{
 const q=snapshot([[20,20],[5,5],[5,5],[30,20]],0),before=structuredClone(q);const r=allowanceTimeline(q,now);
 assert.equal(r.nextTenAt,at(5));assert.equal(r.fullAt,at(30));assert.deepEqual(q,before);
});
