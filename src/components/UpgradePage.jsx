import {ArrowRight, ArrowUpRight, Bookmark, Check, Crosshair, Infinity as InfinityIcon, Layers3, RefreshCw, ShieldCheck, Sparkles, Timer, Zap} from 'lucide-react';
import {FREE_GENERATION_LIMIT, FREE_STAR_LIMIT, PASS_PLANS, PRO_MAX_SET_SIZE} from '../lib/accessModel.js';
import './UpgradePage.css';

const benefits = [
  {icon:InfinityIcon,title:'Practise without the pause.',detail:'Unlimited MCQ generation.',tone:'mint'},
  {icon:Crosshair,title:'Go straight to the gap.',detail:'Filter by chapter, topic and difficulty.',tone:'blue'},
  {icon:Bookmark,title:'Build your own library.',detail:'Unlimited question bookmarks.',tone:'gold'},
];
const comprehensiveMonthly = PASS_PLANS.comprehensive.amount / (PASS_PLANS.comprehensive.days / 30);
const monthlySaving = PASS_PLANS.sprint.amount - comprehensiveMonthly;
const comparison = [
  ['MCQ generation',`${FREE_GENERATION_LIMIT} / 12 hours`,'Unlimited'],
  ['Questions per set','Up to 30',`Up to ${PRO_MAX_SET_SIZE}`],
  ['Question library & Exam Mode','Full access','Full access'],
  ['Daily Challenge','Included','Included'],
  ['Flashcards','Full access','Full access'],
  ['Chapter, topic & difficulty filters','—','Included'],
  ['Question bookmarks',`${FREE_STAR_LIMIT} active slots`,'Unlimited + organisation'],
  ['Identical exam retakes','No quota use','Unlimited'],
];

export function UpgradePage({user,onUpgrade,onSyncBilling,onCancelMembership,billingLoading=false,passEnds,mascot,t}) {
  const isPro=user?.tier==='pro';
  const legacy=['active','trialing'].includes(user?.subscriptionStatus||'');
  const palette={'--up-text':t.text,'--up-muted':t.textSec,'--up-panel':t.surface,'--up-soft':t.panel,'--up-line':t.border,'--up-accent':t.green,'--up-blue':t.accent,'--up-gold':t.amber};
  return <div className="up-page" style={palette}>
    <header className="up-hero">
      <div className="up-hero-copy"><span className="up-eyebrow"><Sparkles size={15}/> SECUREPLUS PRO</span><h1>Keep your<br/><span>momentum.</span></h1><p>Your study tools. More room to use them.</p><div className="up-promise"><ShieldCheck size={17}/><span>One payment. No automatic renewal.</span></div></div>
      <div className="up-hero-art" aria-hidden="true"><div className="up-art-sheet up-art-sheet-back"/><div className="up-art-sheet up-art-sheet-mid"/><div className="up-art-sheet up-art-sheet-front"><div className="up-art-top"><span>YOUR NEXT CHAPTER</span><span>PRO ↗</span></div><div className="up-art-middle"><div><InfinityIcon size={69} strokeWidth={1.3}/><strong>Room to grow.</strong></div>{mascot}</div><div className="up-art-bottom"><span><Crosshair size={15}/> Focus</span><span><Layers3 size={15}/> Practise</span><span><Check size={15}/> Progress</span></div></div></div>
    </header>

    {isPro&&<div className="up-active" role="status"><ShieldCheck size={23}/><div><strong>You’re already Pro.</strong><span>{passEnds?`Access until ${passEnds}.`:legacy?'Your existing subscription stays unchanged.':'Your Pro access is active.'}</span></div><a href="#up-account">Manage access <ArrowUpRight size={15}/></a></div>}

    <section aria-labelledby="up-passes-title" className="up-passes">
      <div className="up-section-heading"><div><span className="up-eyebrow">CHOOSE YOUR RUNWAY</span><h2 id="up-passes-title">Same Pro. Your timeline.</h2></div><span className="up-shared-note">Both passes include every Pro feature.</span></div>
      <div className="up-pass-grid">{Object.entries(PASS_PLANS).map(([id,plan])=>{const recommended=id==='comprehensive';return <article className={`up-pass ${recommended?'up-pass-featured':''}`} key={id} aria-labelledby={`up-${id}-title`}>
        <div className="up-pass-header"><span className="up-eyebrow">{recommended?<Sparkles size={15}/>:<Zap size={15}/>} {recommended?'MORE TIME TO BUILD':'THE FINAL STRETCH'}</span>{recommended&&<span className="up-value">Recommended</span>}</div>
        <div className="up-pass-main"><div><h3 id={`up-${id}-title`}>{plan.name}</h3><p>{recommended?'Find your rhythm. Build your confidence.':'Make your final month count.'}</p></div><div className="up-duration"><strong>{plan.days}</strong><span>DAYS OF PRO</span></div></div>
        {recommended&&<div className="up-monthly-saving"><strong>Save ${(monthlySaving/100).toFixed(2)}<small> / month</small></strong><span>${(comprehensiveMonthly/100).toFixed(2)} per 30 days vs ${ (PASS_PLANS.sprint.amount/100).toFixed(2)} with Sprint.<br/>${(plan.amount/100).toFixed(2)} paid once for 90 days.</span></div>}
        <div className="up-ticket-seam" aria-hidden="true"><i/><span/><i/></div>
        <div className="up-pass-purchase"><div className="up-price"><strong><span>$</span>{(plan.amount/100).toFixed(2)}</strong><span>USD · one payment</span></div><button className="up-buy" type="button" disabled={billingLoading||isPro} onClick={()=>onUpgrade(id)}>{isPro?'Pro is active':billingLoading?'Opening checkout…':`Choose ${plan.name}`}<ArrowRight size={18}/></button></div>
        <div className="up-pass-fine"><Timer size={13}/><span>{plan.days} days of access. Ends automatically.</span></div>
      </article>;})}</div>
    </section>

    <section className="up-benefits" aria-label="Included with both Pro passes">{benefits.map(({icon:Icon,title,detail,tone})=><article className={`up-benefit up-tone-${tone}`} key={title}><span className="up-benefit-icon"><Icon size={22}/></span><h3>{title}</h3><p>{detail}</p></article>)}</section>

    <section className="up-free" aria-labelledby="up-free-title"><div><span className="up-eyebrow">A REAL FREE START</span><h2 id="up-free-title">Free is still a good place to be.</h2><p>Pro adds flexibility. Your free account keeps its study tools.</p></div><div className="up-compare"><h3 className="up-comparison-title">A little more room. Side by side.</h3><div className="up-table-wrap"><table><caption className="up-sr-only">Free account and Pro pass features</caption><thead><tr><th scope="col">Your study toolkit</th><th scope="col">Free<span>Your starting point</span></th><th scope="col">Pro<span>More flexibility</span></th></tr></thead><tbody>{comparison.map(([feature,free,pro])=><tr key={feature}><th scope="row">{feature}</th><td>{free}</td><td>{pro}</td></tr>)}</tbody></table></div></div></section>

    <footer className="up-account" id="up-account"><div className="up-account-heading"><ShieldCheck size={22}/><div><h2>Your access, on your terms.</h2><p>{passEnds?`Your pass ends ${passEnds}. It does not renew.`:'New passes expire automatically. Your progress stays with your account.'}</p></div></div>{legacy&&<div className="up-legacy"><p>{user.subscriptionCancelAtPeriodEnd?'Renewal is cancelled. Access continues until your paid period ends.':'Your existing recurring subscription is unchanged.'}</p><button type="button" className="up-link-button" disabled={billingLoading||user.subscriptionCancelAtPeriodEnd} onClick={onCancelMembership}>{user.subscriptionCancelAtPeriodEnd?'Renewal cancelled':'Cancel existing subscription renewal'}</button></div>}<button type="button" className="up-sync" disabled={billingLoading} onClick={onSyncBilling}><RefreshCw size={15} className={billingLoading?'up-spinning':''}/>{billingLoading?'Refreshing access…':'Already paid? Refresh Pro status'}</button></footer>
  </div>;
}
