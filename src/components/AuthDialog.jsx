import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './AuthDialog.css';

export function AuthDialog({ t, onClose, returnFocus, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const trigger = returnFocus || document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => {
      dialog.current?.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <dialog ref={dialog} className="auth-dialog" aria-label="SecurePlus account" onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
      style={{ '--auth-bg': t.surface, '--auth-text': t.text, '--auth-muted': t.textSec, '--auth-line': t.border, '--auth-green': t.green, '--auth-blue': t.blue || 'color-mix(in srgb,#729bf5 75%,var(--auth-text))' }}>
      <button type="button" className="auth-dialog-close" aria-label="Close account popup" onClick={onClose}><X size={20}/></button>
      {children}
    </dialog>, document.body
  );
}
