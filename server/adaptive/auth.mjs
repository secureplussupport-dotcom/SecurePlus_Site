import { createClient } from '@supabase/supabase-js';

// This only verifies users; a publishable/anon key is sufficient. Database and
// service credentials are never used to authenticate browser-submitted identity.
export function createAdaptiveAuthenticator({ url, publishableKey, fetchImpl = fetch }) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(parsed.hostname))) throw new Error('Invalid authentication origin');
  const auth = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetchImpl(input, { ...init, signal: AbortSignal.timeout(3000) }) },
  });
  return async token => {
    const { data, error } = await auth.auth.getUser(token);
    if (error || !data?.user || data.user.is_anonymous === true) return null;
    // Never pass metadata or email into authorization or operational logging.
    return { id: data.user.id };
  };
}

// Decode session_id only AFTER remote verification of this exact token.
export function createAdaptiveDeletionAuthenticator(options) {
  const verify=createAdaptiveAuthenticator(options);
  return async token => {
    const user=await verify(token);
    if (!user) return null;
    try {
      const {session_id:sessionId,sub}=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString('utf8'));
      if(sub!==user.id || !/^[0-9a-f-]{36}$/i.test(sessionId)) return null;
      return {id:user.id,sessionId};
    } catch { return null; }
  };
}
