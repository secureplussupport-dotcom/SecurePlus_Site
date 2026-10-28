import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnosticProgress,lessonSectionIds,viewedSections,answeredLabQuestions,flashcardProgress} from '../src/lib/surfaceProgress.js';

test('diagnostic attempts require a checked answer; skips and cursor are separate',()=>{
 const draft={questions:[{},{},{},{}],index:3,answers:{0:1,1:null,2:0},checked:{0:true,1:true},skipped:{1:true}};
 assert.deepEqual(diagnosticProgress(draft),{attempted:1,skipped:1,total:4});
 draft.checked[2]=true;assert.equal(diagnosticProgress(draft).attempted,2);
 draft.skipped[1]=false;draft.answers[1]=2;assert.deepEqual(diagnosticProgress(draft),{attempted:3,skipped:0,total:4});
});
test('opening the last lesson section cannot credit the sections in between',()=>{
 const lesson={sections:[{title:'First idea'},{title:'Second idea'}]},ids=lessonSectionIds(lesson);
 assert.deepEqual(viewedSections(lesson,[ids[0],ids.at(-1),ids.at(-1),'obsolete']),{viewed:2,total:5});
 assert.deepEqual(viewedSections(lesson,ids),{viewed:5,total:5});
 assert.deepEqual(viewedSections(lesson,null),{viewed:0,total:5});
});
test('lab progress counts submitted questions once, including the current question immediately',()=>{
 const questions=[{id:'a'},{id:'b'},{id:'c'}];
 assert.equal(answeredLabQuestions(questions,[]),0);
 assert.equal(answeredLabQuestions(questions,[{id:'a',choice:'yes',correct:false}]),1);
 assert.equal(answeredLabQuestions(questions,[{id:'a',choice:'yes'},{id:'a',choice:'no'},{id:'old',choice:'yes'},{id:'b',choice:''}]),1);
 assert.equal(answeredLabQuestions(questions,questions.map(q=>({...q,choice:'yes'}))),3);
});
test('bookmarks and remembered cards are independent; divider cards never count',()=>{
 const cards=[{id:'a'},{id:'b'},{id:'divider',cardType:'divider'}];
 assert.deepEqual(flashcardProgress(cards,[],[]),{total:2,remembered:0,saved:0});
 assert.deepEqual(flashcardProgress(cards,['a','a','divider'],['flashcard:b','flashcard:divider']),{total:2,remembered:1,saved:1});
 assert.equal(flashcardProgress(cards,['a'],[]).remembered,1,'unsaving must not alter recall');
});
