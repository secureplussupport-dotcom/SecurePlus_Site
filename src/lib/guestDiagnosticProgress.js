// Preview choices stay separate from graded practice; skipping never invents an answer.
export function diagnosticRows(draft) {
  return (draft?.questions || []).flatMap((q,i)=>{
    if(!draft.checked?.[i])return [];
    const skipped=draft.skipped?.[i]===true;
    const selected=skipped?null:draft.answers?.[i];
    return [{qid:q.id,selected,skipped,correct:skipped?null:selected===q.correct,ch:q.chapter,topic:q.topic,title:q.prompt,
      conceptTag:q.concept_tag,mcq:true,diagnosticOnly:q.diagnostic_only===true,readinessSource:'diagnostic',
      diagnosticSessionId:draft.request_id,selectedOptionId:skipped?null:q.options[selected]?.id,
      createdAt:new Date(draft.startedAt+i).toISOString()}];
  });
}
