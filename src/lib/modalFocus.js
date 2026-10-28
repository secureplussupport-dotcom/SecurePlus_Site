// A signup opened from a study dialog should return to the original study control.
const openers=new WeakMap();
export function modalReturnTarget(element){
 const visited=new Set();
 let target=element;
 while(target){
  const dialog=target.closest?.('dialog');
  if(!dialog||!openers.has(dialog)||visited.has(dialog))break;
  visited.add(dialog);
  target=openers.get(dialog);
 }
 return target;
}
export function rememberModalOpener(dialog,element){
 const target=modalReturnTarget(element);
 if(dialog)openers.set(dialog,target);
 return target;
}
