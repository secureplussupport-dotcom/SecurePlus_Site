import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sendEmailAccessLink} from '../src/lib/emailAccess.js';

test('email-only signup sends a verification link without a password or study profile',async()=>{
 let request;const auth={signInWithOtp:async input=>{request=input;return {data:{user:null,session:null},error:null};}};
 await sendEmailAccessLink(auth,{email:' Person@Example.test ',origin:'https://www.secureplusprep.com/?view=auth',referralCode:'CODE'});
 assert.deepEqual(request,{email:'person@example.test',options:{emailRedirectTo:'https://www.secureplusprep.com',shouldCreateUser:true,data:{name:'person',avatar_id:'default-cipher',pending_referral_code:'CODE'}}});
 assert(!('password' in request));assert(!('study_profile' in request.options.data));
});
test('email-link login cannot create a new account; invalid email and provider errors propagate',async()=>{
 let request,calls=0;const auth={signInWithOtp:async input=>{calls++;request=input;return {error:null};}};
 await sendEmailAccessLink(auth,{email:'person@example.test',origin:'https://www.secureplusprep.com',createUser:false});
 assert.equal(request.options.shouldCreateUser,false);assert(!('data' in request.options));
 await assert.rejects(sendEmailAccessLink(auth,{email:'invalid',origin:'https://www.secureplusprep.com'}),/valid email/);assert.equal(calls,1);
 const error=new Error('Email rate limit exceeded');await assert.rejects(sendEmailAccessLink({signInWithOtp:async()=>({error})},{email:'person@example.test',origin:'https://www.secureplusprep.com'}),error);
});
test('every signup alias opens the direct form and OAuth no longer forces a profile wizard',()=>{
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 const active=app.slice(app.indexOf('function AuthView('),app.indexOf('  /*\n   * Archived 2026-09-02',app.indexOf('function AuthView(')));
 assert(active.includes('["signup-entry","review-signup"].includes(initialMode)?"signup":initialMode'));
 assert(!active.includes('AthenaSignupJourney'));assert(!active.includes('showSignupJourney'));assert(!active.includes('study_profile'));assert(!active.includes('auth-name'));assert(!active.includes('auth-confirm-password'));
 assert(active.indexOf('className="btn btn-outline auth-google"')<active.indexOf('<form className="auth-only-form"'));
 assert(!app.includes('shouldForceCipherOnboardingAfterLoginOAuth'));
 assert(active.includes('completedGuestDiagnosticRows()'));assert(active.includes('saveFlashcardReviewAuthIntent'));
});
