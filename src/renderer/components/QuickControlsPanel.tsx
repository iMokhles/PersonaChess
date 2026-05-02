import React from 'react';
import { observer } from 'mobx-react-lite';
import { MOVE_QUALITY_PRESETS } from '../../engine/types';
import { boardViewModel, configViewModel, engineViewModel } from '../../viewmodels';
import './QuickControlsPanel.css';

export const QuickControlsPanel: React.FC = observer(() => {
  const busy = boardViewModel.isThinking
    || boardViewModel.isAnalyzingMoves
    || engineViewModel.isAnalyzing
    || engineViewModel.isInitializing;

  return (
    <section className="quick-controls-panel">
      <div className="quick-controls-header">
        <div>
          <h2>Quick Controls</h2>
          <p>Switch engine side and persona without opening settings.</p>
        </div>
      </div>

      <div className="quick-controls-section">
        <div className="quick-controls-label-row">
          <span className="quick-controls-label">Engine Side</span>
          <strong>{boardViewModel.autoPlayCurrentSideLabel}</strong>
        </div>
        <div className="quick-controls-toggle-group">
          <button
            type="button"
            className={`quick-controls-toggle ${boardViewModel.enginePlaysFor === 'w' ? 'active' : ''}`}
            disabled={busy}
            onClick={() => boardViewModel.setEnginePlaysFor('w')}
          >
            White
          </button>
          <button
            type="button"
            className={`quick-controls-toggle ${boardViewModel.enginePlaysFor === 'b' ? 'active' : ''}`}
            disabled={busy}
            onClick={() => boardViewModel.setEnginePlaysFor('b')}
          >
            Black
          </button>
        </div>
      </div>

      <div className="quick-controls-section">
        <div className="quick-controls-label-row">
          <span className="quick-controls-label">Personality</span>
          <strong>{configViewModel.activePersonaLabel}</strong>
        </div>
        <div className="quick-controls-preset-grid">
          {MOVE_QUALITY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`quick-controls-preset ${configViewModel.currentPresetId === preset.id ? 'active' : ''}`}
              disabled={busy}
              onClick={() => configViewModel.applyPreset(preset.id)}
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});

QuickControlsPanel.displayName = 'QuickControlsPanel';
