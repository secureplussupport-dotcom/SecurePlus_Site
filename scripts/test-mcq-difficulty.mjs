import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeMcqDifficulty } from '../src/lib/mcqDifficulty.js';
import { effectiveCatalogue, optionId } from '../server/mcq-engine/catalogue.mjs';
import { learnerQuestion } from '../server/mcq-engine/engine.mjs';
import { createMcqHandler } from '../server/mcq-engine/http.mjs';
import base from '../server/mcq-engine/base-catalogue.json' with {type:'json'};
import groups from '../src/data/mcqConceptTagGroups.json' with {type:'json'};

test('two MCQ levels retain source questions, answer IDs, and pending benchmarks',()=>{
  assert.deepEqual(['easy','medium','hard','core','applied'].map(normalizeMcqDifficulty),['core','applied','applied','core','applied']);
  const bank=effectiveCatalogue();assert.equal(bank.length,base.length);
  for(const q of base){
    const normalized=bank.find(row=>row.id===q.id);
    assert.equal(normalized.difficulty,q.difficulty==='easy'?'core':'applied');
    assert.deepEqual(normalized.options.map(o=>o.id),q.opts.map((_,i)=>optionId(q,i)));
    assert.equal(learnerQuestion({...normalized,difficulty:q.difficulty}).difficulty,normalized.difficulty);
  }
  const edit={question_id:'m001',question_kind:'mcq',status:'active',action:'upsert',updated_at:'2099-01-01',payload:{difficulty:'applied'}};
  assert.equal(effectiveCatalogue([edit]).find(q=>q.id==='m001').difficulty,'applied');
  assert(Object.values(groups).every(g=>g.minimumQuestionsByDifficulty===null));
});

test('Core and Applied filters include their legacy levels; invalid filters fail',async()=>{
  const client={auth:{getUser:async()=>({data:{user:{id:'test-owner'}}})},rpc:async name=>({data:name==='mcq_engine_state'?{version:0,mastery:[],failed:[],history:[]}:true})};
  const handler=createMcqHandler({admin:()=>client,enabled:()=>true,catalogue:async()=>effectiveCatalogue()});
  for(const [filter,expected] of [['core','core'],['applied','applied'],['easy','core'],['medium','applied'],['hard','applied'],['expert',null]]){
    let body;const response={setHeader(){},end(value){body=JSON.parse(value);}};
    await handler({method:'POST',headers:{authorization:'Bearer test','content-type':'application/json'},query:{operation:'generate'},body:{set_size:10,filters:{difficulty:filter}}},response);
    assert.equal(response.statusCode,expected?200:400,filter);
    if(expected)assert(body.questions.every(q=>q.difficulty===expected));
  }
});

test('MCQ screens and manager use two levels while PBQ controls retain three',()=>{
  const app=readFileSync('src/App.jsx','utf8');
  assert(app.includes('<DiffBadge d={q.difficulty} t={t} mcq={current.kind==="mcq"}/>'));
  assert(app.includes('<option value="core">Core</option>'));
  assert(app.includes('<option value="applied">Applied</option>'));
  assert(app.includes('kind==="mcq"?["core","applied"]:["easy","medium","hard"]'));
});
