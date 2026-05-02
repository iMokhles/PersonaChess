import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { boardViewModel } from '../../viewmodels';
import './MoveFeedbackToast.css';

export const MoveFeedbackToast: React.FC = observer(() => {
  const feedback = boardViewModel.recentMoveFeedback;
  const [visibleFeedbackId, setVisibleFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    setVisibleFeedbackId(feedback.id);
    const timeout = setTimeout(() => {
      setVisibleFeedbackId((current) => (current === feedback.id ? null : current));
    }, 2600);

    return () => {
      clearTimeout(timeout);
    };
  }, [feedback]);

  if (!feedback || visibleFeedbackId !== feedback.id) {
    return null;
  }

  const toneClass = feedback.isBrilliant
    ? 'brilliant'
    : feedback.actor === 'engine'
      ? 'engine'
      : 'player';
  const title = feedback.isBrilliant
    ? 'Brilliant move'
    : feedback.qualityLabel
      ? feedback.qualityLabel
      : feedback.actor === 'engine'
        ? 'Engine move'
        : 'Move played';
  const detail = [
    feedback.actor === 'engine' ? 'Engine' : feedback.actor === 'redo' ? 'Redo' : 'You',
    feedback.san,
    feedback.isCheck ? 'check' : null,
    feedback.isCapture ? 'capture' : null,
    feedback.isGameEnd ? 'game end' : null,
  ].filter(Boolean).join(' • ');

  return (
    <div className={`move-feedback-toast ${toneClass}`} role="status" aria-live="polite">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
});

MoveFeedbackToast.displayName = 'MoveFeedbackToast';
