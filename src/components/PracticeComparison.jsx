import { ArrowDown, ArrowRight, BookOpenCheck, Fingerprint, Layers3, Network, Shuffle, Target } from 'lucide-react';
import './PracticeComparison.css';

export function PracticeComparison() {
  return <section className="practice-demo" aria-labelledby="practice-demo-title">
    <header><span>HOW SECUREPLUS HELPS</span><h3 id="practice-demo-title">Miss a question.<br/>Know what’s next.</h3></header>
    <ol className="practice-demo-path">
      <li className="practice-demo-miss"><span className="practice-demo-number">01</span><Fingerprint size={29} aria-hidden="true"/><div><span>You miss a concept</span><strong>MFA</strong></div><span className="practice-demo-tag">Needs work</span></li>
      <li className="practice-demo-support"><ArrowDown className="practice-demo-connector" size={18} aria-hidden="true"/><span className="practice-demo-number">02</span><div><span>Get help with that concept</span><div className="practice-demo-resources"><div><BookOpenCheck size={24} aria-hidden="true"/><strong>MFA lesson</strong></div><div><Layers3 size={24} aria-hidden="true"/><strong>MFA flashcards</strong></div></div></div></li>
      <li className="practice-demo-retest"><ArrowDown className="practice-demo-connector" size={18} aria-hidden="true"/><span className="practice-demo-number">03</span><Target size={29} aria-hidden="true"/><div><span>Practise the same concept</span><strong>More MFA questions</strong></div></li>
    </ol>
    <div className="practice-demo-contrast"><Shuffle size={17} aria-hidden="true"/><span>Random practice might move on to…</span><ArrowRight size={16} aria-hidden="true"/><span><Network size={18} aria-hidden="true"/>Network ports</span></div>
    <footer>Example: MFA = multi-factor authentication.</footer>
  </section>;
}
