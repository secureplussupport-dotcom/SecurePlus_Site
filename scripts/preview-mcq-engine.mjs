// Local-only preview: actual MCQ screen/API/SQL, disposable test identity and data.
import { createServer } from 'vite';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { createMcqHandler } from '../server/mcq-engine/http.mjs';
import { effectiveCatalogue } from '../server/mcq-engine/catalogue.mjs';
import { previewInspection } from './lib/mcq-preview-inspection.mjs';

const userId = '00000000-0000-4000-8000-000000000001';
const db = new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
  create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${userId}');`);
await db.exec(readFileSync('supabase/migrations/20261019163949_mcq_three_deck_engine.sql', 'utf8'));
const allowed = new Set(['mcq_engine_state', 'mcq_engine_create_session', 'mcq_engine_answer', 'mcq_engine_session']);
const client = { auth: { getUser: async token => ({ data: { user: token === 'disposable-local-preview' ? { id: userId } : null } }) },
  rpc: async (name, args) => {
    if (!allowed.has(name)) throw new Error('Unknown local RPC');
    const values = Object.values(args).map(value => value && typeof value === 'object' ? JSON.stringify(value) : value);
    try { const result = await db.query(`select public.${name}(${values.map((_, i) => `$${i + 1}`).join(',')}) as value`, values); return { data: result.rows[0].value }; }
    catch (error) { return { error }; }
  } };
const handler = createMcqHandler({ enabled: () => true, admin: () => client, catalogue: async () => effectiveCatalogue() });
mkdirSync('output', { recursive: true });
const directory = mkdtempSync(resolve('output/mcq-engine-preview-'));
writeFileSync(`${directory}/index.html`, '<div id="root"></div><script type="module" src="./preview.jsx"></script>');
writeFileSync(`${directory}/preview.jsx`, `import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{MCQPractice,THEMES,makeCSS}from'/src/App.jsx';
import{McqEngineInspector}from'/scripts/preview/McqEngineInspector.jsx';
function Preview(){const[attempts,setAttempts]=useState([]);return <><style>{makeCSS(THEMES.dark)}</style><style>{'.mcq-preview-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;align-items:start;max-width:1500px;margin:auto}.mcq-preview-inspector{position:sticky;top:12px;padding:18px;margin:12px 12px 12px 0;background:#172235;border:1px solid #334155;border-radius:12px;color:#f1f5f9}@media(max-width:850px){.mcq-preview-layout{display:flex;flex-direction:column-reverse}.mcq-preview-inspector{position:static;margin:12px;align-self:stretch}.mcq-preview-main{width:100%}}'}</style><p style={{padding:12,color:'#fff',background:'#194'}} role="status">Local test preview · disposable data · no live account</p><div className="mcq-preview-layout"><main className="mcq-preview-main"><MCQPractice user={{id:'${userId}',email:'preview@localhost',tier:'pro',authProvider:'supabase'}} attempts={attempts} onSave={r=>setAttempts(a=>[r,...a])} onUpgrade={()=>{}} t={THEMES.dark}/></main><McqEngineInspector/></div></>};createRoot(document.getElementById('root')).render(<Preview/>);`);
const port = Number(process.env.MCQ_PREVIEW_PORT || 5198);
const server = await createServer({ server: { host: '127.0.0.1', port, strictPort: true },
  define: { 'import.meta.env.VITE_MCQ_ENGINE_ENABLED': '"true"' },
  plugins: [{ name: 'disposable-mcq-preview', enforce: 'pre', transform(code, id) {
    const path = id.split('?')[0];
    if (path.endsWith('/src/App.jsx')) {
      const start = code.indexOf('function MCQPractice('), end = code.indexOf('function UpgradeModal(', start);
      let screen = code.slice(start, end);
      screen = screen.replace('  const current=questions[qi];', `  const current=questions[qi];
        useEffect(()=>{window.dispatchEvent(new CustomEvent('mcq-preview-question',{detail:{id:current?.id||null}}));},[current?.id]);
        useEffect(()=>{const next=()=>startEngineQuiz({},quizCount);window.addEventListener('mcq-preview-new-set',next);return()=>window.removeEventListener('mcq-preview-new-set',next);},[quizCount,engineBusy]);`);
      return `${code.slice(0, start)}${screen}${code.slice(end)}\nexport { MCQPractice, THEMES, makeCSS };`;
    }
    if (path.endsWith('/src/lib/mcqEngineClient.js')) return code.replace('      return result;', `      if(result.preview_inspection)window.dispatchEvent(new CustomEvent('mcq-preview-inspection',{detail:{operation,inspection:result.preview_inspection}}));\n      return result;`);
    if (path.endsWith('/src/lib/supabaseClient.js')) return `export const supabase=null;export const isSupabaseConfigured=false;export const getSupabaseAccessToken=async()=>'disposable-local-preview';`;
  }, configureServer(server) { server.middlewares.use((req, res, next) => {
    const operation = /^\/api\/sessions\/(generate|answer|state|resume)$/.exec(new URL(req.url, 'http://localhost').pathname)?.[1];
    if (!operation) return next();
    req.query = { operation };
    (async () => {
      let payload;
      const capture = { statusCode: 200, setHeader: (...args) => res.setHeader(...args), end: raw => { payload = JSON.parse(raw); } };
      await handler(req, capture);
      if (capture.statusCode === 200) {
        const state = operation === 'state' ? payload : (await client.rpc('mcq_engine_state', { p_user_id: userId })).data;
        const plan = payload.session_id ? (await client.rpc('mcq_engine_session', { p_user_id: userId, p_session_id: payload.session_id })).data : null;
        payload.preview_inspection = previewInspection(state, plan);
      }
      res.statusCode = capture.statusCode; res.end(JSON.stringify(payload));
    })().catch(() => { res.statusCode = 500; res.end('{}'); });
  }); } }] });
await server.listen();
console.log(`Local MCQ preview: http://127.0.0.1:${port}/${relative(process.cwd(), directory)}/index.html`);
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await server.close(); await db.close(); rmSync(directory, { recursive: true }); process.exit(0); });
