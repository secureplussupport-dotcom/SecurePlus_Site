import {SY0701_DOMAINS} from '../data/sy0701Domains.js';

export const AREA_NAMES=Object.freeze({dashboard:'Dashboard','study-plan':'Study Plan',mcq:'MCQ Practice',pbq:'PBQ Simulations',daily:'Daily Challenge','deep-dives':'Concept Deep Dives',flashcards:'Flashcards',pricing:'Upgrade',objectives:'Security+ Objectives',about:'Why we’re different',account:'Account & Support',privacy:'Privacy Policy',terms:'Terms & Conditions',feedback:'Internal Feedback','question-admin':'Question Manager',achievements:'Achievements'});
export const canonicalArea=view=>view==='why-different'?'about':view;
export function areaName(view,guest=false){
 const area=canonicalArea(view);
 return guest&&area==='dashboard'?'Home':guest&&area==='mcq'?'10Q Diagnostic':AREA_NAMES[area]||'SecurePlus';
}
export const domainName=id=>SY0701_DOMAINS.find(domain=>String(domain.id)===String(id))?.name||'Domain unavailable';
export const domainLabel=id=>`Domain ${id}: ${domainName(id)}`;
