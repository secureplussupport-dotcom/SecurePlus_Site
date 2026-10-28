export function flashcardMatch(set,query){
 const term=query.trim().replace(/^#/,'').toLocaleLowerCase();if(!term)return null;
 const fields=[['Deck',set.title],['Topic',set.sectionTitle],...set.cards.flatMap(card=>[['Term',card.term],['Acronym',card.acronym],['Full form',card.full_form],...(card.keywords||[]).map(k=>['Keyword',k]),...(card.concept_tags||[]).map(tag=>['Concept tag',tag])])];
 const found=fields.find(([,text])=>String(text||'').toLocaleLowerCase().includes(term));
 return found?{reason:found[0],text:found[1],term}:null;
}
export function textSegments(value,query){
 const text=String(value||''),term=query.trim().replace(/^#/,'').toLocaleLowerCase();if(!term)return[{text,match:false}];
 const lower=text.toLocaleLowerCase(),segments=[];let at=0,index;
 while((index=lower.indexOf(term,at))>=0){if(index>at)segments.push({text:text.slice(at,index),match:false});segments.push({text:text.slice(index,index+term.length),match:true});at=index+term.length;}
 if(at<text.length)segments.push({text:text.slice(at),match:false});return segments;
}
