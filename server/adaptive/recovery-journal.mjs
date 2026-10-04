import {createHmac,timingSafeEqual} from 'node:crypto';
import {openSync,readFileSync,writeSync,fsyncSync,closeSync,fstatSync,unlinkSync,constants} from 'node:fs';
import {withdrawShadow,resumePendingErasures} from './deletion.mjs';
import {createDurableQueue} from './durable-queue.mjs';
const validId=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(x);
const mac=(key,value)=>createHmac('sha256',key).update(JSON.stringify(value)).digest('hex');
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===64&&b.length===64&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
// Restricted operations journal, not telemetry. Keep key + newest checkpoint
// outside the backed-up database. Production custody/retention is a release gate.
export function readErasureJournal(path,key,expectedHead) {
 if(!Buffer.isBuffer(key)||key.length<32||!expectedHead)throw new Error('Journal authority required');
 const fd=openSync(path,constants.O_RDONLY|constants.O_NOFOLLOW);
 let text;try{if(fstatSync(fd).size>8*1024*1024)throw new Error('Journal limit');text=readFileSync(fd,'utf8');}finally{closeSync(fd);}
 if(Buffer.byteLength(text)>8*1024*1024)throw new Error('Journal limit');
 const rows=text.trim()?text.trim().split('\n').map(x=>JSON.parse(x)):[];let previous='0'.repeat(64);
 if(rows.length>10000)throw new Error('Journal limit');
 for(const [index,row] of rows.entries()){const body={sequence:row.sequence,ownerId:row.ownerId,enrollmentId:row.enrollmentId,previous:row.previous};
  if(Object.keys(row).sort().join(',')!=='enrollmentId,mac,ownerId,previous,sequence'||body.sequence!==index+1||!validId(body.ownerId)||!validId(body.enrollmentId)||body.previous!==previous||!equal(row.mac,mac(key,body)))throw new Error('Journal invalid');previous=row.mac;
 }
 if(!equal(previous,expectedHead))throw new Error('Journal checkpoint mismatch');return rows;
}
export function appendErasureIntent(path,key,{ownerId,enrollmentId},expectedHead='0'.repeat(64)) {
 if(!Buffer.isBuffer(key)||key.length<32||!validId(ownerId)||!validId(enrollmentId))throw new Error('Journal authority required');
 const lock=openSync(path+'.lock',constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);
 try {
 let rows=[];try{rows=readErasureJournal(path,key,expectedHead);}catch(e){if(e.code!=='ENOENT')throw e;if(expectedHead!=='0'.repeat(64))throw new Error('Journal missing');}
 const body={sequence:rows.length+1,ownerId,enrollmentId,previous:expectedHead},entry={...body,mac:mac(key,body)};
 const fd=openSync(path,constants.O_WRONLY|constants.O_CREAT|constants.O_APPEND|constants.O_NOFOLLOW,0o600);
 try{writeSync(fd,JSON.stringify(entry)+'\n');fsyncSync(fd);}finally{closeSync(fd);}return entry.mac;
 } finally {closeSync(lock);unlinkSync(path+'.lock');}
}
export async function reconcileErasureJournal(sql,{path,key,expectedHead}) {
 const [control]=await sql`select adaptive_private.read_runtime_control() as c`;
 if(control.c?.enabled!==false)throw new Error('Restore must be isolated and disabled');
 const rows=readErasureJournal(path,key,expectedHead),cleanup={queue:createDurableQueue(sql)};
 let reconciled=0;
 for(const row of rows){
  const [enrollment]=await sql`select enrollment_id from adaptive_private.shadow_enrollments where owner_id=${row.ownerId}`;
  if(enrollment&&enrollment.enrollment_id!==row.enrollmentId)throw new Error('Enrollment reconciliation requires review');
  const result=await withdrawShadow(sql,row.ownerId,cleanup);
  if(result.status!=='completed')throw new Error('Erasure incomplete');
  const tables=await sql`select table_schema,table_name from information_schema.columns where column_name='owner_id' and (table_schema='adaptive_private' or (table_schema='public' and table_name like 'adaptive_%'))`;
  for(const t of tables){const [r]=await sql`select count(*)::int n from ${sql(t.table_schema+'.'+t.table_name)} where owner_id=${row.ownerId}`;if(r.n)throw new Error('Restored owner graph remains');}
  reconciled++;
 }
 const pending=await resumePendingErasures(sql,cleanup);
 if(pending.retryable)throw new Error('Pending erasure incomplete');
 return {reconciled,pendingCompleted:pending.completed};
}
