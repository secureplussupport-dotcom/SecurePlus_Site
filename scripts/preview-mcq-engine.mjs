// Local-only preview: actual MCQ screen/API/SQL, disposable test identity and data.
import { createServer } from 'vite';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { createMcqHandler } from '../server/mcq-engine/http.mjs';
import { effectiveCatalogue } from '../server/mcq-engine/catalogue.mjs';

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
function Preview(){const[attempts,setAttempts]=useState([]);return <><style>{makeCSS(THEMES.dark)}</style><p style={{padding:12,color:'#fff',background:'#194'}} role="status">Local test preview · disposable data · no live account</p><MCQPractice user={{id:'${userId}',email:'preview@localhost',tier:'pro',authProvider:'supabase'}} attempts={attempts} onSave={r=>setAttempts(a=>[r,...a])} onUpgrade={()=>{}} t={THEMES.dark}/></>};createRoot(document.getElementById('root')).render(<Preview/>);`);
const server = await createServer({ server: { host: '127.0.0.1', port: 5198, strictPort: true },
  define: { 'import.meta.env.VITE_MCQ_ENGINE_ENABLED': '"true"' },
  plugins: [{ name: 'disposable-mcq-preview', enforce: 'pre', transform(code, id) {
    const path = id.split('?')[0];
    if (path.endsWith('/src/App.jsx')) return `${code}\nexport { MCQPractice, THEMES, makeCSS };`;
    if (path.endsWith('/src/lib/supabaseClient.js')) return `export const supabase=null;export const isSupabaseConfigured=false;export const getSupabaseAccessToken=async()=>'disposable-local-preview';`;
  }, configureServer(server) { server.middlewares.use((req, res, next) => {
    const operation = /^\/api\/sessions\/(generate|answer|state|resume)$/.exec(new URL(req.url, 'http://localhost').pathname)?.[1];
    if (!operation) return next();
    req.query = { operation }; handler(req, res).catch(() => { res.statusCode = 500; res.end('{}'); });
  }); } }] });
await server.listen();
console.log(`Local MCQ preview: http://127.0.0.1:5198/${relative(process.cwd(), directory)}/index.html`);
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await server.close(); await db.close(); rmSync(directory, { recursive: true }); process.exit(0); });
