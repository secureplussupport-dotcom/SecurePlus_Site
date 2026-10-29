import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewLaunchGate} from '../src/lib/reviewLaunch.js';

test('one dashboard click cannot regenerate after loading or callback changes', () => {
  const claim = createReviewLaunchGate();
  const request = {chapterId:'2',count:10,nonce:1};
  let generations = 0;
  // Effect re-runs before loading, while loading and after success or failure.
  for (const busy of [false,true,false,false,true,false]) {
    if (claim({...request},busy)) generations++;
  }
  assert.equal(generations,1);
});

test('a new click waits for the current generation, then launches once', () => {
  const claim = createReviewLaunchGate();
  const first = {chapterId:'2',nonce:1};
  const next = {chapterId:'4',nonce:2};
  assert.equal(claim(first,false),true);
  assert.equal(claim(next,true),false);
  assert.equal(claim(next,false),true);
  assert.equal(claim(next,false),false);
});

test('invalid requests do not consume a launch, and gates are instance-local', () => {
  const claim = createReviewLaunchGate();
  for (const request of [null,{}, {chapterId:'2'},{nonce:1}]) assert.equal(claim(request,false),false);
  const valid = {chapterId:'2',nonce:1};
  assert.equal(claim(valid,false),true);
  assert.equal(createReviewLaunchGate()(valid,false),true);
});
