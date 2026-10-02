import postgres from 'postgres';

const localHosts = new Set(['127.0.0.1', 'localhost', '::1']);

export function adaptiveDatabaseAllowed(env = process.env) {
  return env.ADAPTIVE_RUNTIME_ENVIRONMENT === 'disposable_local' &&
    env.NODE_ENV !== 'production' && !env.VERCEL_ENV;
}

export function createAdaptiveDatabase({ connectionString = process.env.ADAPTIVE_DATABASE_URL, env = process.env, max = 4 } = {}) {
  if (!adaptiveDatabaseAllowed(env)) throw new Error('Adaptive database runtime is disabled outside disposable local validation');
  if (typeof connectionString !== 'string' || connectionString.length === 0) throw new Error('Missing adaptive database URL');
  const parsed = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !localHosts.has(parsed.hostname)) {
    throw new Error('Phase 2B-2 permits only a loopback disposable database');
  }
  if (!Number.isSafeInteger(max) || max < 1 || max > 16) throw new Error('Invalid adaptive database pool size');
  return postgres(connectionString, {
    max,
    prepare: false,
    idle_timeout: 10,
    connect_timeout: 10,
    onnotice: () => {},
  });
}

export async function closeAdaptiveDatabase(sql) {
  if (sql && typeof sql.end === 'function') await sql.end({ timeout: 5 });
}
