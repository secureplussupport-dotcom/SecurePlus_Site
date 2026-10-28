import {summarizeSmartReview} from './smartReviewSummary.js';
export function smartReviewPreview(state){
 if(!state)return{due:null,next:null,weakest:null};
 const summary=summarizeSmartReview({engineState:{...state,mastery:(state.mastery||[]).filter(c=>Number.isFinite(c.score))}});
 return{due:summary.due,next:summary.due?0:summary.nextRetestIn,weakest:summary.weakest&&summary.weakest.score<80?{concept_tag:summary.weakest.tag,score:summary.weakest.score}:null};
}
