import { useEffect, useRef, useState } from 'react';
import { mcqEngineRequest } from '../lib/mcqEngineClient.js';
const KEY='secureplus-guest-diagnostic-v1';
const restore=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch{return null;}};
export function GuestDiagnostic({t,onSignup,onSave}){
 const [draft,setDraft]=useState(restore),[access,setAccess]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const inFlight=useRef(false);
 const refresh=()=>mcqEngineRequest('access').then(setAccess).catch(e=>setError(e.message));
 useEffect(()=>{refresh();},[]);
 useEffect(()=>{if(draft)localStorage.setItem(KEY,JSON.stringify(draft));},[draft]);
 const start=async()=>{
  if(inFlight.current||draft?.questions)return;
  inFlight.current=true;setBusy(true);setError('');
  try{
    const request=draft?.request_id||crypto.randomUUID();setDraft({request_id:request});localStorage.setItem(KEY,JSON.stringify({request_id:request}));
    const plan=await mcqEngineRequest('generate',{mode:'diagnostic',set_size:10,request_id:request});
    setDraft({request_id:request,questions:plan.questions,answers:{},index:0,startedAt:Date.now()});setAccess(plan.access);
  }catch(e){setError(e.message);refresh();}finally{inFlight.current=false;setBusy(false);}
 };
 const questions=draft?.questions||[],answers=draft?.answers||{},done=questions.length&&draft.index>=questions.length;
 const rows=questions.map((q,i)=>({qid:q.id,selected:answers[i],correct:answers[i]===q.correct,ch:q.chapter,topic:q.topic,title:q.prompt,conceptTag:q.concept_tag,mcq:true,readinessSource:'diagnostic',createdAt:new Date((draft.startedAt||Date.now())+i).toISOString()}));
 const save=async()=>{await onSave?.(rows);onSignup();};
 return <section id="guest-diagnostic" className="card" style={{padding:22,color:t.text,maxWidth:760,margin:'auto',scrollMarginTop:24}} aria-label="Free 10-question diagnostic">
 {!questions.length?<><h2>Start with a clear baseline.</h2><p>10 questions across all five SY0-701 domains. No account needed. All flashcard decks are also free to browse.</p>{error&&<p role="alert">{error}</p>}{access?.remaining===0&&!draft?.request_id?<button className="btn btn-primary" onClick={onSignup}>Create free account to continue</button>:<button className="btn btn-primary" disabled={busy||!access} onClick={start}>{busy?'Preparing your diagnostic…':'Start my 10-question diagnostic'}</button>}</>:done?<><h2>Your baseline: {rows.filter(r=>r.correct).length*10}%</h2><p>A starting point—not a pass or fail.</p><div style={{display:'grid',gap:12}}>{[1,2,3,4,5].map(ch=>{const results=rows.filter(r=>Number(r.ch)===ch),value=Math.round(results.filter(r=>r.correct).length/results.length*100);return <div key={ch}><span>Domain {ch} · {value}%</span><div style={{height:8,background:t.border,borderRadius:8}}><div style={{width:`${value}%`,height:'100%',background:[t.accent,t.green,t.purple,t.amber,t.accent][ch-1],borderRadius:8}}/></div></div>;})}</div><p>Create a free account to save this baseline and practise 50 new questions every rolling 12 hours.</p><button className="btn btn-primary" onClick={save}>Save my progress · create free account</button></>:<><small>Diagnostic · Question {draft.index+1} of 10</small><h3 style={{margin:'16px 0',lineHeight:1.6}}>{questions[draft.index].prompt}</h3><div style={{display:'grid',gap:10}}>{questions[draft.index].options.map((option,i)=><button className={`btn ${answers[draft.index]===i?'btn-primary':'btn-outline'}`} key={option.id} style={{whiteSpace:'normal',textAlign:'left',justifyContent:'flex-start'}} aria-pressed={answers[draft.index]===i} onClick={()=>setDraft({...draft,answers:{...answers,[draft.index]:i}})}>{String.fromCharCode(65+i)}. {option.text}</button>)}</div><div style={{display:'flex',gap:10,justifyContent:'space-between',marginTop:18}}><button className="btn btn-ghost" disabled={!draft.index} onClick={()=>setDraft({...draft,index:draft.index-1})}>Previous</button><button className="btn btn-primary" disabled={answers[draft.index]==null} onClick={()=>setDraft({...draft,index:draft.index+1})}>{draft.index===9?'Show my baseline':'Next'}</button></div></>}
 </section>;
}
