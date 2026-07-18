import assert from "node:assert/strict";
import {
  CIPHER_WELCOME_GRANT,
  ensureCipherWelcomeGrant,
  isCipherWelcomeEligible,
} from "../server/economy/welcome-grant.js";

const legacyUser={id:"00000000-0000-0000-0000-000000000001",created_at:"2026-07-16T23:59:59.000Z"};
const newUser={id:"00000000-0000-0000-0000-000000000002",created_at:"2026-07-18T00:00:00.000Z"};

assert.equal(isCipherWelcomeEligible(legacyUser),false,"accounts predating the welcome economy must not receive a surprise grant");
assert.equal(isCipherWelcomeEligible(newUser),true,"new accounts must be eligible for the welcome grant");
assert.equal(isCipherWelcomeEligible({id:newUser.id,created_at:"invalid"}),false,"invalid creation dates must fail closed");

let legacyRpcCalls=0;
const legacyResult=await ensureCipherWelcomeGrant({rpc:async()=>{legacyRpcCalls+=1;}},legacyUser);
assert.equal(legacyRpcCalls,0,"ineligible accounts must not call the privileged reward RPC");
assert.equal(legacyResult.eligible,false);

const rpcCalls=[];
const ledgerReferences=new Set();
let persistedBalance=0;
const supabase={
  rpc:async(name,parameters)=>{
    rpcCalls.push({name,parameters});
    const alreadyAwarded=ledgerReferences.has(parameters.reward_reference_key);
    if(!alreadyAwarded){
      ledgerReferences.add(parameters.reward_reference_key);
      persistedBalance+=parameters.reward_amount;
    }
    return {data:{ok:true,awarded:!alreadyAwarded,amount:alreadyAwarded?0:parameters.reward_amount,balance:persistedBalance},error:null};
  },
};

const first=await ensureCipherWelcomeGrant(supabase,newUser);
persistedBalance-=50; // The learner unlocks one PBQ after receiving the gift.
const retry=await ensureCipherWelcomeGrant(supabase,newUser);
assert.equal(first.awarded,true,"the first eligible wallet check must persist 150 coins");
assert.equal(retry.awarded,false,"a later wallet check must not duplicate the grant");
assert.equal(retry.balance,100,"the saved balance must remain 100 after a later wallet check instead of losing or re-adding the grant");
assert.equal(rpcCalls.length,2);
for(const call of rpcCalls){
  assert.equal(call.name,"award_cipher_coins");
  assert.equal(call.parameters.reward_amount,CIPHER_WELCOME_GRANT);
  assert.equal(call.parameters.reward_event_type,"onboarding_welcome");
  assert.equal(call.parameters.reward_reference_key,`onboarding_welcome:${newUser.id}`);
}

console.log("Cipher welcome grant audit passed.");
