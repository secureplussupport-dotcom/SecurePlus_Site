import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {isArchivedView,STUDY_PLAN_ACTIVE,DAILY_CHALLENGE_ACTIVE,PBQ_PRACTICE_ACTIVE,ARCHIVED_PUBLIC_PATHS} from '../src/lib/archivedFeatures.js';

test('Study Plan, Daily Challenge and learner PBQs are archived',()=>{
 assert.equal(STUDY_PLAN_ACTIVE,false);assert.equal(DAILY_CHALLENGE_ACTIVE,false);assert.equal(PBQ_PRACTICE_ACTIVE,false);
 for(const view of ['study-plan','daily','pbq','coins','referrals','mascot-admin'])assert.equal(isArchivedView(view),true,view);
});
test('remaining study tools and Question Manager remain available',()=>{
 for(const view of ['dashboard','mcq','exam','flashcards','deep-dives','question-admin','pricing','account','auth'])assert.equal(isArchivedView(view),false,view);
 const links=['dashboard','study-plan','mcq','pbq','daily','deep-dives','flashcards'];
 assert.deepEqual(links.filter(view=>!isArchivedView(view)),['dashboard','mcq','deep-dives','flashcards']);
});
test('archived public URLs use temporary homepage redirects and leave the sitemap',()=>{
 const config=JSON.parse(fs.readFileSync('vercel.json','utf8')),sitemap=fs.readFileSync('public/sitemap.xml','utf8');
 assert.equal(ARCHIVED_PUBLIC_PATHS.length,3);
 for(const path of ARCHIVED_PUBLIC_PATHS){
  assert.deepEqual(config.redirects.find(route=>route.source===`${path}:path*`),{source:`${path}:path*`,destination:'/',permanent:false});
  assert.deepEqual(config.redirects.find(route=>route.source===path),{source:path,destination:"/",permanent:false});
  assert(!sitemap.includes(`https://www.secureplusprep.com${path}`));
  assert(fs.existsSync(`public${path}index.html`),'preserve the archived page for restoration');
 }
});
