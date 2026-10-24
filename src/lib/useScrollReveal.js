import { useEffect, useRef } from 'react';

// Marketing sections reveal once. Functional content stays visible without JS.
export function useScrollReveal() {
  const root=useRef(null);
  useEffect(()=>{
    if(!root.current || !('IntersectionObserver' in window))return;
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}
    }),{threshold:.08});
    root.current.querySelectorAll('[data-reveal]').forEach(node=>{
      if(node.getBoundingClientRect().top<window.innerHeight)node.classList.add('is-revealed');
      else{node.classList.add('reveal-ready');observer.observe(node);}
    });
    return()=>observer.disconnect();
  },[]);
  return root;
}
