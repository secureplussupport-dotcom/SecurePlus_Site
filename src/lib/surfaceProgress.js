// Navigation position is not evidence of an attempt, a view, or recall.
export function diagnosticProgress(draft){
 const questions=draft?.questions||[];
 const attempted=questions.filter((_,i)=>draft.checked?.[i]===true&&draft.skipped?.[i]!==true&&Number.isInteger(draft.answers?.[i])).length;
 const skipped=questions.filter((_,i)=>draft.checked?.[i]===true&&draft.skipped?.[i]===true).length;
 return {attempted,skipped,total:questions.length};
}
export const lessonSectionIds=dive=>dive?['keywords',...dive.sections.map((section,index)=>`section:${index}:${section.title}`),'traps','check']:[];
export function viewedSections(dive,views){
 const ids=lessonSectionIds(dive),seen=new Set(Array.isArray(views)?views:[]);
 return {viewed:ids.filter(id=>seen.has(id)).length,total:ids.length};
}
export function answeredLabQuestions(questions,results){
 const answered=new Set((Array.isArray(results)?results:[]).filter(row=>typeof row?.choice==='string'&&row.choice.length>0).map(row=>row.id));
 return questions.filter(question=>answered.has(question.id)).length;
}
export function flashcardProgress(cards,rememberedIds,savedKeys){
 const terms=cards.filter(card=>card.cardType!=='divider');
 const remembered=new Set(rememberedIds),saved=new Set(savedKeys);
 return {total:terms.length,remembered:terms.filter(card=>remembered.has(card.id)).length,saved:terms.filter(card=>saved.has(`flashcard:${card.id}`)).length};
}

export function confirmLessonCompletion(progress,confirm){
 const unseen=Math.max(0,progress.total-progress.viewed);
 return unseen===0||confirm(`${unseen} sections have not been viewed. Mark this lesson complete anyway?`);
}
