import {textSegments} from '../lib/flashcardSearch.js';
const Highlight=({text,query})=>textSegments(text,query).map((part,i)=>part.match?<mark key={i}>{part.text}</mark>:part.text);
import { ArrowUpRight, Brain, Bug, ClipboardCheck, ClipboardList, Cloud, CodeXml,
  FileKey2, Fingerprint, Gauge, KeyRound, Layers3, LockKeyhole, MailWarning,
  MonitorCog, Network, Radar, RadioTower, Scale, ShieldCheck, ShieldAlert, ScrollText } from 'lucide-react';

const covers = {
  '1.1A':Scale, '1.1B':ShieldCheck, '1.2A':KeyRound, '1.2B':Fingerprint,
  '1.3A':FileKey2, '1.3B':LockKeyhole, '1.4A':Layers3,
  '2.1A':Radar, '2.1B':Network, '2.1C':MailWarning, '2.2A':CodeXml,
  '2.2B':KeyRound, '2.3A':RadioTower, '2.3B':Bug, '2.3C':ShieldAlert,
  '3.1A':Network, '3.1B':Layers3, '3.2A':RadioTower, '3.2B':LockKeyhole,
  '3.3A':Cloud, '3.3B':MonitorCog, '3.3C':CodeXml, '3.4A':FileKey2, '3.4B':Layers3,
  '4.1A':ShieldCheck, '4.1B':Fingerprint, '4.2A':RadioTower, '4.2B':Radar,
  '4.3A':Gauge, '4.3B':ClipboardCheck,
  '5.1A':ScrollText, '5.1B':ShieldCheck, '5.2A':Scale, '5.2B':Brain, '5.2C':ClipboardList,
};
const colors = ['#82afff','#74d6cb','#c1a0f1','#f0bd80','#ed9ab7','#88c6ed','#c9cc84','#a8b4f5','#eead93'];

export function FlashcardDeck({set, remembered, index, onOpen,query="",match=null}) {
  const Icon = covers[set.code] || Layers3;
  return <button className={`fc-deck fc-deck-cover-${index % 4}`} style={{'--deck-color':colors[index % colors.length]}}
    onClick={onOpen} aria-label={`Open ${set.title}: ${set.cards.length} cards`}>
    <span className="fc-deck-cover" aria-hidden="true">
      <span className="fc-cover-orbit"/><span className="fc-cover-orbit fc-cover-orbit-two"/>
      <span className="fc-cover-card fc-cover-card-back"/><span className="fc-cover-card"><Icon size={37} strokeWidth={1.6}/></span>
      <span className="fc-cover-code">{set.code}</span><span className="fc-cover-count">{set.cards.length} cards</span>
    </span>
    <span className="fc-deck-body"><strong><Highlight text={set.title} query={query}/></strong>{match&&<span className="fc-search-reason">{match.reason}: <Highlight text={match.text} query={query}/></span>}
      <span className="fc-deck-terms">{set.cards.slice(0,3).map(card=><span key={card.id}><Highlight text={card.acronym||card.term} query={query}/></span>)}</span>
      <span className="fc-deck-bottom">{remembered>0&&<span><span className="fc-mini-track"><i style={{width:`${remembered/set.cards.length*100}%`}}/></span><small>{remembered} remembered</small></span>}<span className="fc-deck-open" aria-hidden="true"><ArrowUpRight size={20}/></span></span>
    </span>
  </button>;
}
