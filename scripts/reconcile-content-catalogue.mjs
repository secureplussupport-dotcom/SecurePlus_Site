// Optional fingerprint refresh against a disposable local PostgreSQL instance.
// Production SELECT evidence must be captured separately through an authorized
// read-only connector. This program never connects to a production hostname.
import fs from 'node:fs';
import postgres from 'postgres';
import {readLearningPilotBank} from './lib/read-learning-pilot-bank.mjs';
import {readPbqDatabaseAdapters} from './lib/read-authored-bank.mjs';
import {PUBLISHED_CONTENT_SNAPSHOT as snapshots} from '../src/data/sy0701PublishedSnapshot.js';
const raw=process.env.ADAPTIVE_DATABASE_URL;
if(!raw)throw new Error('Set ADAPTIVE_DATABASE_URL to a disposable local database');
const url=new URL(raw);
if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname))throw new Error('Only disposable loopback PostgreSQL allowed');
const sql=postgres(raw,{max:1,prepare:false,onnotice:()=>{},connect_timeout:3});
const folder='docs/evidence/phase-2b5';
const proof=JSON.parse(fs.readFileSync(`${folder}/private-catalogue-read.json`));
try{
 const result=await sql.begin('read only',async tx=>{
  // sql.json is essential: a string bound as jsonb would be double-encoded.
  const hash=async value=>(await tx`select encode(sha256(convert_to(${tx.json(value)}::jsonb::text,'UTF8')),'hex') as hash`)[0].hash;
  const overrides=[];
  for(const row of proof.overrides){const local=snapshots.find(x=>x.question_id===row.question_id&&x.question_kind===row.question_kind);overrides.push({id:row.question_id,kind:row.question_kind,capturedSignatureMatches:!!local&&local.updated_at===row.updated_at&&local.action===row.action,payloadMatches:!!local&&await hash(local.payload)===row.payload_sha256});}
  const bank=readLearningPilotBank(),adapter=readPbqDatabaseAdapters(),pbqs=[];
  for(const row of proof.pbqs){const q=bank.pbqs.find(q=>q.id===row.id);if(!q){pbqs.push({id:row.id,localAppQuestionHash:null,appQuestionMatches:false,payloadMatches:false});continue;}const payload=adapter.serialize({...q,is_pro:row.is_pro}).payload;pbqs.push({id:row.id,localAppQuestionHash:await hash(q),appQuestionMatches:await hash(q)===row.app_question_sha256,payloadMatches:await hash(payload)===row.payload_sha256});}
  return {method:'Production fingerprints compared with local JSON objects via disposable PostgreSQL jsonb::text SHA-256; no private payload export',overrides,pbqs};
 });
 fs.writeFileSync(`${folder}/private-reconciliation.json`,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({overrides:result.overrides.length,matched:result.overrides.filter(x=>x.payloadMatches&&x.capturedSignatureMatches).length,privatePbqMatches:result.pbqs.filter(x=>x.payloadMatches).length}));
}finally{await sql.end();}
