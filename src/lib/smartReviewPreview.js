export function smartReviewPreview(state){
 if(!state)return{due:null,next:null,weakest:null};
 const failed=state.failed||[],waiting=failed.map(q=>Number(q.cooldown_counter)).filter(n=>Number.isFinite(n)&&n>0);
 const weakest=[...(state.mastery||[])].filter(c=>Number.isFinite(c.score)&&c.score<80).sort((a,b)=>a.score-b.score||a.concept_tag.localeCompare(b.concept_tag))[0]||null;
 return{due:failed.filter(q=>Number(q.cooldown_counter)<=0).length,next:waiting.length?Math.min(...waiting):null,weakest};
}
