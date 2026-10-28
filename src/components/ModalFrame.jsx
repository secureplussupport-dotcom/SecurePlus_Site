import {rememberModalOpener} from "../lib/modalFocus.js";
import {useEffect,useRef} from 'react';
import './Readability.css';

// Native dialogs keep background controls out of keyboard and screen-reader navigation.
export function ModalFrame({onClose,className='',children,...props}){
 const ref=useRef(null);
 useEffect(()=>{
  const node=ref.current,trigger=rememberModalOpener(node,document.activeElement),overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  node.showModal();
  return()=>{
   node.close();
   document.body.style.overflow=overflow;
   requestAnimationFrame(()=>{
    if(!document.querySelector('dialog[open]')&&trigger?.isConnected)trigger.focus({preventScroll:true});
   });
  };
 },[]);
 return <dialog {...props} ref={ref} className={`study-modal-frame ${className}`} onCancel={event=>{event.preventDefault();onClose?.();}} onKeyDown={event=>{
  if(event.key!=='Tab')return;
  const controls=[...ref.current.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')].filter(node=>!node.disabled&&node.tabIndex>=0&&node.getClientRects().length>0);
  const first=controls[0],last=controls.at(-1);
  if(!first){event.preventDefault();ref.current.focus();return;}
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }}>{children}</dialog>;
}
