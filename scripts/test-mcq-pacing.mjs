import test from 'node:test';
import assert from 'node:assert/strict';
import {createQuestionPacing,pacingSummary,formatQuestionPace} from '../src/lib/mcqPacing.js';

test('question viewing time accumulates on revisits and pauses for feedback/hidden pages',()=>{
  let now=0;const clock=createQuestionPacing({},()=>now);
  clock.switchTo('m1');now=4000;clock.switchTo('m2');now=6000;clock.switchTo(null);
  now=36000;clock.switchTo('m1');now=39000;
  assert.deepEqual(clock.snapshot(),{m1:7000,m2:2000});
  now=40000;assert.equal(clock.snapshot().m1,8000);
  clock.switchTo(null);now=99999;assert.equal(clock.snapshot().m1,8000);
});
test('resume preserves measured time; a fresh retake starts empty',()=>{
  let now=100;const clock=createQuestionPacing({m1:2500},()=>now);clock.switchTo('m1');now=1100;
  assert.equal(clock.snapshot().m1,3500);assert.deepEqual(createQuestionPacing({},()=>0).snapshot(),{});
});
test('reports exclude missing historical timings from averages and preserve question order',()=>{
  const report=pacingSummary([{id:'m1'},{id:'m2'},{id:'m3'}],[{elapsedMs:60000},{},{elapsedMs:30000}]);
  assert.equal(report.averageMs,45000);assert.equal(report.measured,2);assert.equal(report.rows[1].elapsedMs,null);
  assert.equal(pacingSummary([],[]).averageMs,null);
  assert.equal(formatQuestionPace(null),'Not recorded');assert.equal(formatQuestionPace(0),'<1s');assert.equal(formatQuestionPace(72000),'1m 12s');
});
