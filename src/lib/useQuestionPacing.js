import { useEffect, useRef } from 'react';
import { createQuestionPacing } from './mcqPacing.js';

export function useQuestionPacing(questionId, enabled, initial = {}) {
  const clock = useRef(null);
  if (!clock.current) clock.current = createQuestionPacing(initial);
  useEffect(() => {
    const sync = () => clock.current.switchTo(enabled && !document.hidden ? questionId : null);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { clock.current.switchTo(null); document.removeEventListener('visibilitychange', sync); };
  }, [questionId, enabled]);
  return {
    snapshot: () => clock.current.snapshot(),
    reset: values => { clock.current.switchTo(null); clock.current = createQuestionPacing(values); },
  };
}
