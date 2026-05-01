import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  boardViewModel,
  configViewModel,
  engineViewModel,
  featureOptionsViewModel,
} from '../../viewmodels';
import './StatusStrip.css';

export const StatusStrip: React.FC = observer(() => {
  const analysisSource = engineViewModel.lastAnalysisPurpose
    ? (engineViewModel.lastAnalysisFromCache ? 'Cache' : 'Live')
    : 'Idle';
  const autoplayState = boardViewModel.autoPlayEnabled ? 'Running' : 'Stopped';
  const brilliantState = featureOptionsViewModel.useBrilliantMoveBudget
    ? featureOptionsViewModel.hasRemainingBrilliantMoves
      ? `${featureOptionsViewModel.brilliantUsedCount}/${featureOptionsViewModel.brilliantMovesPerGame}`
      : 'Exhausted'
    : 'Off';
  const statusMessage = boardViewModel.isThinking
    ? 'Analyzing current position...'
    : boardViewModel.statusMessage || 'Ready for a new game';

  return (
    <div className="status-strip">
      <div className="status-strip-primary">
        <span className="status-strip-title">{boardViewModel.gameStatus}</span>
        <span className="status-strip-message">{statusMessage}</span>
      </div>

      <div className="status-strip-metrics">
        <div className="status-pill persona-pill">
          <span className="status-pill-label">Persona</span>
          <strong>{configViewModel.activePersonaLabel}</strong>
        </div>
        <div className="status-pill">
          <span className="status-pill-label">Engine</span>
          <strong>{engineViewModel.analysisStatusLabel}</strong>
        </div>
        <div className="status-pill secondary">
          <span className="status-pill-label">Source</span>
          <strong>{analysisSource}</strong>
        </div>
        <div className="status-pill secondary">
          <span className="status-pill-label">Auto Play</span>
          <strong>{autoplayState}</strong>
        </div>
        <div className="status-pill secondary">
          <span className="status-pill-label">Moves</span>
          <strong>{boardViewModel.history.length}</strong>
        </div>
        {boardViewModel.lastPlayerMoveQualityLabel && (
          <div className="status-pill quality-pill">
            <span className="status-pill-label">Last quality</span>
            <strong>{boardViewModel.lastPlayerMoveQualityLabel}</strong>
          </div>
        )}
        <div className={`status-pill secondary ${brilliantState === 'Exhausted' ? 'warning' : ''}`}>
          <span className="status-pill-label">Brilliant</span>
          <strong>{brilliantState}</strong>
        </div>
      </div>
    </div>
  );
});

StatusStrip.displayName = 'StatusStrip';
