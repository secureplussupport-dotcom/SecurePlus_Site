import {diagnosticRows} from './guestDiagnosticProgress.js';

export const GUEST_DIAGNOSTIC_KEY='secureplus-guest-diagnostic-v2';
export const DIAGNOSTIC_IMPORT_WINDOW=7*24*60*60*1000;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Browser drafts are untrusted. The server still verifies ownership and grades imports.
export function validDiagnosticDraft(draft){
 if(!draft||!uuid.test(draft.request_id)||!Number.isFinite(draft.startedAt)||draft.startedAt<=0||draft.startedAt>Date.now()+60000||!Number.isInteger(draft.index)||draft.index<0||draft.index>10||!Array.isArray(draft.questions)||draft.questions.length!==10)return false;
 if(!draft.questions.every(q=>q&&/^[a-zA-Z0-9_-]{1,100}$/.test(q.id)&&typeof q.prompt==='string'&&q.prompt.length<=2000&&typeof q.topic==='string'&&q.topic.length<=300&&typeof q.concept_tag==='string'&&q.concept_tag.length<=150&&typeof q.explanation==='string'&&q.explanation.length<=10000&&Number.isInteger(Number(q.chapter))&&Number(q.chapter)>=1&&Number(q.chapter)<=5&&Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=6&&q.options.every(o=>o&&uuid.test(o.id)&&typeof o.text==='string'&&o.text.length<=2000)&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length))return false;
 if(new Set(draft.questions.map(q=>q.id)).size!==10||draft.questions.some(q=>new Set(q.options.map(o=>o.id)).size!==q.options.length))return false;
 for(const field of ['answers','checked','skipped']){
  if(!draft[field]||typeof draft[field]!=='object'||Array.isArray(draft[field]))return false;
  for(const [key,value]of Object.entries(draft[field])){
   if(!/^[0-9]$/.test(key))return false;
   if(field==='answers'?(value!==null&&(!Number.isInteger(value)||value<0||value>=draft.questions[Number(key)].options.length)):typeof value!=='boolean')return false;
  }
 }
 for(let i=0;i<10;i++)if(draft.checked[i]&&!(draft.skipped[i]===true||Number.isInteger(draft.answers[i])))return false;
 return draft.index!==10||draft.questions.every((_,i)=>draft.checked[i]===true);
}
export function readGuestDiagnostic(storage){
 try{const text=(storage||globalThis.localStorage)?.getItem(GUEST_DIAGNOSTIC_KEY);if(!text||text.length>150000)return null;const saved=JSON.parse(text);return saved.version===2&&validDiagnosticDraft(saved.draft)?saved.draft:null;}catch{return null;}
}
export function writeGuestDiagnostic(draft,storage){
 try{const target=storage||globalThis.localStorage;if(!target)return false;if(!draft){target.removeItem(GUEST_DIAGNOSTIC_KEY);return true;}if(!validDiagnosticDraft(draft))return false;const serialized=JSON.stringify({version:2,draft});if(serialized.length>150000)return false;target.setItem(GUEST_DIAGNOSTIC_KEY,serialized);return true;}catch{return false;}
}
export const diagnosticImportable=(draft,now=Date.now())=>Boolean(draft&&now-draft.startedAt<DIAGNOSTIC_IMPORT_WINDOW);
let current=readGuestDiagnostic();
let browserSaved=Boolean(current);
const listeners=new Set();
export const subscribeGuestDiagnostic=fn=>{listeners.add(fn);return()=>listeners.delete(fn);};
export const guestDiagnosticSnapshot=()=>current;
export const isDiagnosticBrowserSaved=()=>browserSaved;
export function publishGuestDiagnostic(draft){
 current=draft;
 // The request-only placeholder isn't a resumable diagnostic yet.
 browserSaved=draft?.questions?.length||!draft?writeGuestDiagnostic(draft):false;
 listeners.forEach(fn=>fn());
}
export const diagnosticComplete=draft=>Boolean(draft?.questions?.length===10&&draft.questions.every((_,i)=>draft.checked?.[i]===true));
export const markGuestDiagnosticAuthOpened=()=>{if(diagnosticComplete(current))publishGuestDiagnostic({...current,savePromptOpened:true});};
export const completedGuestDiagnosticRows=()=>diagnosticComplete(current)&&diagnosticImportable(current)?diagnosticRows(current):[];
if(typeof window!=='undefined')window.addEventListener('storage',event=>{
 if(event.key===GUEST_DIAGNOSTIC_KEY||event.key===null){current=readGuestDiagnostic();browserSaved=Boolean(current);listeners.forEach(fn=>fn());}
});
