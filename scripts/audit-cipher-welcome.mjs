import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CIPHER_COINS_ACTIVE, MASCOT_MANAGER_ACTIVE, isArchivedView } from '../src/lib/archivedFeatures.js';
import { ensureCipherWelcomeGrant } from '../server/economy/welcome-grant.js';
import coinAction from '../server/economy/coins-action.js';
import referralClaim from '../server/economy/referral-claim.js';
import referralProfile from '../server/economy/referral-me.js';
import economy from '../api/economy.js';
assert.equal(CIPHER_COINS_ACTIVE,false);
assert.equal(MASCOT_MANAGER_ACTIVE,false);
for(const view of ['coins','referrals','mascot-admin'])assert.equal(isArchivedView(view),true);
for(const view of ['mcq','pbq','dashboard','question-admin'])assert.equal(isArchivedView(view),false);
let calls=0;
const result=await ensureCipherWelcomeGrant({rpc:()=>{calls++;throw Error('Archived system must not write');}},{id:'new-user',created_at:'2026-10-22'});
assert.equal(calls,0);assert.equal(result.awarded,false);assert.equal(result.reason,'archived');
for(const handler of [coinAction,referralClaim,referralProfile]){
 const res={setHeader(){},status(n){this.statusCode=n;return this;},end(body){this.body=JSON.parse(body);return this;}};
 await handler({method:'POST'},res);
 assert.equal(res.statusCode,410);assert.equal(res.body.archived,true);
}
for(const operation of ['coins-action','referrals-claim','referrals-me']){
 const res={setHeader(){},status(n){this.statusCode=n;return this;},end(body){this.body=JSON.parse(body);return this;}};
 await economy({method:'POST',query:{operation}},res);assert.equal(res.statusCode,410);
}
const app=readFileSync('src/App.jsx','utf8');
assert(app.includes('if(!MASCOT_MANAGER_ACTIVE||!isSupabaseConfigured)return;'));
assert(app.includes('if(!CIPHER_COINS_ACTIVE)return {ok:false,archived:true};'));
assert(app.includes('isArchivedView(view)'));
assert(!app.includes('navItems.push({id:"mascot-admin"'));
assert(!app.includes('{id:"coins",icon:"coins",label:"Cipher Coins",mobileLabel:"Coins"}'));
assert(readFileSync('server/attempts/submit.js','utf8').includes('if (CIPHER_COINS_ACTIVE && sessionType'));
const migration=readFileSync('supabase/migrations/20261022120000_archive_coin_and_mascot_systems.sql','utf8');
assert(migration.includes('FROM PUBLIC, anon, authenticated, service_role'));
assert(!/DROP TABLE|DELETE FROM|TRUNCATE/i.test(migration));
console.log('Archived systems audit passed: disabled routes, rejected actions/referrals, zero welcome writes, retained data and entitlements.');
