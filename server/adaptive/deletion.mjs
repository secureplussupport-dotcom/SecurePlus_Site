import { createHash } from 'node:crypto';
import { adaptiveDatabaseAllowed } from './database.mjs';
import { createOperationalEvents } from './operations.mjs';

// Capability probe for a FUTURE dispatcher. Existing live route stays untouched.
export async function adaptiveDeletionInstalled(sql) {
  const [row] = await sql`select to_regprocedure('adaptive_private.begin_erasure(uuid,text,uuid)') is not null as installed`;
  return row.installed;
}

// Internal only. Caller supplies a verified identity/session, never a body owner.
export async function beginConfirmedAccountErasure(sql, user, deletionToken) {
  if (!user?.id || !user?.sessionId || !/^[A-Za-z0-9_-]{32,256}$/.test(deletionToken)) throw new Error('Invalid confirmation');
  const digest = createHash('sha256').update(deletionToken).digest('hex');
  const [row] = await sql`select adaptive_private.confirm_account_erasure(${user.id},${user.sessionId},${digest}) as id`;
  return row.id;
}

// All external methods must be idempotent. A crash repeats the uncheckpointed
// step; it never clears the durable block. No bearer token is persisted.
export async function resumeAdaptiveErasure(sql, operationId, { queue, cancelSubscription, deleteAuthUser, log } = {}) {
  const emit = createOperationalEvents(log);
  try {
    for (let step = 0; step < 8; step++) {
      const [op] = await sql`select * from adaptive_private.erasure_operations where operation_id=${operationId}`;
      if (!op) throw new Error('Unknown deletion');
      if (op.stage === 'completed') return { status: 'completed', receiptId: operationId };
      if (!queue?.cancelOwner || !queue?.remainingOwner) throw new Error('Queue cancellation capability required');
      if (op.stage === 'writes_blocked') {
        await queue.cancelOwner(op.owner_id);
        if (await queue.remainingOwner(op.owner_id) !== 0) throw new Error('Owned jobs remain');
        await sql`select adaptive_private.advance_erasure(${operationId},'jobs_cancelled')`;
      } else if (op.stage === 'jobs_cancelled') {
        await sql`select adaptive_private.erase_operation(${operationId})`;
      } else if (op.stage === 'graph_erased' && op.reason === 'account') {
        if (!cancelSubscription || !deleteAuthUser) throw new Error('Account cleanup capabilities required');
        await cancelSubscription(op.owner_id, operationId);
        await sql`select adaptive_private.revoke_erasure_sessions(${operationId})`;
        await sql`select adaptive_private.advance_erasure(${operationId},'external_done')`;
      } else if (op.stage === 'external_done') {
        await deleteAuthUser(op.owner_id, operationId);
        await sql`select adaptive_private.advance_erasure(${operationId},'auth_deleted')`;
      } else if (op.stage === 'auth_deleted' || (op.stage === 'graph_erased' && op.reason !== 'account')) {
        if (await queue.remainingOwner(op.owner_id) !== 0) throw new Error('Owned jobs remain');
        await sql`select adaptive_private.advance_erasure(${operationId},'completed')`;
        emit('deletion_complete');
      } else throw new Error('Invalid deletion stage');
    }
    throw new Error('Deletion step bound exceeded');
  } catch {
    await sql`select adaptive_private.fail_erasure(${operationId})`.catch(() => {});
    return { status: 'retryable', receiptId: operationId, incidentId: emit('deletion_failure', 'unavailable') };
  }
}

// Unwired local Fetch boundary. Strictly no owner/operation ID from the browser.
// Auth verifier must verify the JWT with Auth, then return its session_id too.
export function createAdaptiveDeletionHandler({ authenticate, getDatabase, cleanup, readEnvironment = () => process.env, log }) {
  const emit = createOperationalEvents(log);
  return async request => {
    if (!adaptiveDatabaseAllowed(readEnvironment())) return Response.json({ status: 'disabled' }, { status: 503 });
    try {
      if (request.method !== 'POST') return Response.json({ status: 'rejected' }, { status: 405 });
      const bearer = request.headers.get('authorization')?.match(/^Bearer (\S{1,8192})$/i)?.[1];
      const user = bearer && await authenticate(bearer);
      if (!user) return Response.json({ status: 'rejected' }, { status: 401 });
      const reader=request.body?.getReader();
      if(!reader) throw new Error('Missing confirmation');
      const chunks=[];let bytes=0;
      try { for(;;){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>2048)throw new Error('Oversized confirmation');chunks.push(Buffer.from(value));} }
      catch(error){await reader.cancel().catch(()=>{});throw error;} finally{reader.releaseLock();}
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!body || Object.keys(body).length!==1 || typeof body.deletionToken!=='string') throw new Error('Invalid confirmation');
      const sql = await getDatabase();
      if (!await adaptiveDeletionInstalled(sql)) return Response.json({ status: 'unavailable' }, { status: 503 });
      const operationId = await beginConfirmedAccountErasure(sql, user, body.deletionToken);
      const result = await resumeAdaptiveErasure(sql, operationId, { ...cleanup, log });
      return Response.json(result, { status: result.status==='completed'?200:503, headers: { 'cache-control':'no-store' } });
    } catch { return Response.json({ status: 'rejected', incidentId: emit('deletion_failure','unavailable') }, { status: 400 }); }
  };
}

// Internal expiry scanner: only DB-expired enrollments, bounded work, no client owner.
export async function eraseExpiredEnrollments(sql, cleanup, limit = 20) {
  if (!Number.isSafeInteger(limit) || limit<1 || limit>100) throw new Error('Invalid cleanup limit');
  const rows = await sql`select owner_id from adaptive_private.shadow_enrollments where expires_at<=clock_timestamp() order by expires_at limit ${limit}`;
  const results = [];
  for (const row of rows) {
    const id = await beginRetentionErasure(sql, row.owner_id, 'expiry');
    if (id) results.push(await resumeAdaptiveErasure(sql,id,cleanup));
  }
  return { completed:results.filter(r=>r.status==='completed').length, retryable:results.filter(r=>r.status==='retryable').length };
}

// Checking absence and beginning erasure share the lock, so concurrent scanners
// or repeated withdrawal calls can observe completion without a check/use race.
async function beginRetentionErasure(sql, ownerId, reason) {
  return sql.begin(async tx => {
    await tx`select pg_advisory_xact_lock(hashtextextended(${ownerId}::uuid::text,7919))`;
    const [state] = await tx`select
      exists(select 1 from adaptive_private.shadow_enrollments where owner_id=${ownerId}
        and (${reason}='withdrawal' or expires_at<=clock_timestamp()))
      or exists(select 1 from adaptive_private.erasure_operations where owner_id=${ownerId}) as present`;
    if (!state.present) return null;
    const [op] = await tx`select adaptive_private.begin_erasure(${ownerId},${reason}) as id`;
    return op.id;
  });
}

export async function withdrawShadow(sql, verifiedOwnerId, cleanup) {
  const id = await beginRetentionErasure(sql, verifiedOwnerId, 'withdrawal');
  return id ? resumeAdaptiveErasure(sql,id,cleanup) : { status:'completed' };
}

// Retry work survives enrollment removal, sign-out and Auth deletion.
export async function resumePendingErasures(sql, cleanup, limit=20) {
  if (!Number.isSafeInteger(limit) || limit<1 || limit>100) throw new Error('Invalid cleanup limit');
  const rows=await sql`select operation_id from adaptive_private.erasure_operations where stage<>'completed' order by created_at limit ${limit}`;
  const results=[];
  for(const row of rows) results.push(await resumeAdaptiveErasure(sql,row.operation_id,cleanup));
  return { completed:results.filter(r=>r.status==='completed').length,retryable:results.filter(r=>r.status==='retryable').length };
}
