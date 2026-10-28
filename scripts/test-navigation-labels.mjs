import {modalReturnTarget,rememberModalOpener} from '../src/lib/modalFocus.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {AREA_NAMES,areaName,canonicalArea,domainName,domainLabel} from '../src/lib/navigationLabels.js';
import {SY0701_DOMAINS as official} from '../src/data/sy0701DeepDiveMap.js';
import {SY0701_ACRONYM_SETS} from '../src/data/sy0701AcronymFlashcards.js';

test('areas have a canonical name; legacy About links and guest diagnostic keep their meaning',()=>{
 assert.equal(canonicalArea('why-different'),'about');
 assert.equal(areaName('why-different'),areaName('about'));
 assert.equal(areaName('pbq'),'PBQ Simulations');
 assert.equal(areaName('mcq'),'MCQ Practice');assert.equal(areaName('mcq',true),'10Q Diagnostic');
 assert.equal(areaName('dashboard',true),'Home');
 for(const [id,name]of Object.entries(AREA_NAMES))assert.equal(areaName(id),name);
});
test('official exam domains are shared by lesson, flashcard and navigation labels without alternate chapter names',()=>{
 assert.equal(official.length,5);
 for(const domain of official){
  assert.equal(domainName(String(domain.id)),domain.name);
  assert.equal(domainLabel(domain.id),`Domain ${domain.id}: ${domain.name}`);
  for(const set of SY0701_ACRONYM_SETS.filter(set=>set.chapterId===domain.id))assert.equal(set.chapterTitle,domain.name);
 }
 assert.equal(domainName('5'),'Security Program Management and Oversight');
 assert.equal(domainName('unknown'),'Domain unavailable');
});

test('nested study and signup dialogs return to the original control',()=>{
 const original={closest:()=>null},studyDialog={},signupDialog={};
 assert.equal(rememberModalOpener(studyDialog,original),original);
 const studyButton={closest:()=>studyDialog};
 assert.equal(modalReturnTarget(studyButton),original);
 rememberModalOpener(signupDialog,studyButton);
 assert.equal(modalReturnTarget({closest:()=>signupDialog}),original);
 assert.equal(modalReturnTarget(original),original);
 assert.equal(modalReturnTarget(null),null);
});
