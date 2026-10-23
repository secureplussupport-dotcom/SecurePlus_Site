import {MascotAnimation} from '../lib/MascotAnimation.jsx';
import './CipherLoader.css';

export function CipherLoader({t={},label='Loading…',detail='',compact=false,overlay=false}) {
  return <div className={`cipher-load ${compact?'is-compact':''} ${overlay?'is-overlay':''}`} role="status" aria-live="polite" style={{'--load-bg':t.bg || 'transparent','--load-panel':t.surface || 'transparent','--load-text':t.text || 'inherit','--load-muted':t.textSec || 'inherit','--load-accent':t.accent || '#6b9dff','--load-border':t.border || 'color-mix(in srgb,currentColor 10%,transparent)'}}>
    <div className="cipher-load-art" aria-hidden="true"><span className="cipher-load-orbit"/><MascotAnimation animation="thinking" size={compact?54:104} label="Cipher is working"/></div>
    <div className="cipher-load-copy"><strong>{label}</strong>{detail&&<small>{detail}</small>}<span className="cipher-load-track" aria-hidden="true"><i/></span></div>
  </div>;
}
