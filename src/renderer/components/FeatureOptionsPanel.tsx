import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
  BrilliantAllowedPhase,
  BrilliantMovesPerGame,
  FEATURE_OPTION_DESCRIPTORS,
  FeatureOptionKey,
} from '../../engine/featureOptions';
import { featureOptionsViewModel } from '../../viewmodels';
import './FeatureOptionsPanel.css';

const BRILLIANT_MOVE_OPTIONS: BrilliantMovesPerGame[] = [0, 1, 2, 3, 4];
const BRILLIANT_PHASE_OPTIONS: BrilliantAllowedPhase[] = ['opening', 'middlegame', 'endgame', 'any'];

export const FeatureOptionsPanel: React.FC = observer(() => {
  const handleToggle = useCallback((key: FeatureOptionKey) => {
    featureOptionsViewModel.setOption(key, !featureOptionsViewModel.options[key]);
  }, []);

  const handleBrilliantMovesPerGameChange = useCallback((value: string) => {
    featureOptionsViewModel.setBrilliantMovesPerGame(parseInt(value, 10) as BrilliantMovesPerGame);
  }, []);

  const handleBrilliantAllowedPhaseChange = useCallback((value: string) => {
    featureOptionsViewModel.setBrilliantAllowedPhase(value as BrilliantAllowedPhase);
  }, []);

  return (
    <section className="feature-options-panel">
      <div className="panel-header">
        <h3>Advanced Engine Options</h3>
        <p className="panel-description">
          Enable each upgrade independently so legacy and advanced behavior can be mixed safely.
        </p>
      </div>

      <div className="feature-options-list">
        {FEATURE_OPTION_DESCRIPTORS.map((feature) => (
          <div key={feature.key} className="feature-option-block">
            <label className="feature-option-item">
              <div className="feature-option-copy">
                <span className="feature-option-label">{feature.label}</span>
                <span className="feature-option-description">{feature.description}</span>
              </div>
              <input
                type="checkbox"
                checked={featureOptionsViewModel.options[feature.key]}
                onChange={() => handleToggle(feature.key)}
                className="feature-option-toggle"
              />
            </label>

            {feature.key === 'useBrilliantMoveBudget' && (
              <div className={`feature-option-detail ${featureOptionsViewModel.useBrilliantMoveBudget ? 'enabled' : 'disabled'}`}>
                <div className="feature-option-field">
                  <label className="feature-option-field-label">Brilliant moves per game</label>
                  <select
                    value={featureOptionsViewModel.brilliantMovesPerGame}
                    onChange={(event) => handleBrilliantMovesPerGameChange(event.target.value)}
                    disabled={!featureOptionsViewModel.useBrilliantMoveBudget}
                    className="feature-option-select"
                  >
                    {BRILLIANT_MOVE_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="feature-option-field">
                  <label className="feature-option-field-label">Allowed phase</label>
                  <select
                    value={featureOptionsViewModel.brilliantAllowedPhase}
                    onChange={(event) => handleBrilliantAllowedPhaseChange(event.target.value)}
                    disabled={!featureOptionsViewModel.useBrilliantMoveBudget}
                    className="feature-option-select"
                  >
                    {BRILLIANT_PHASE_OPTIONS.map((phase) => (
                      <option key={phase} value={phase}>
                        {phase}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="feature-option-usage">
                  Brilliant used: {featureOptionsViewModel.brilliantUsedCount} / {featureOptionsViewModel.brilliantMovesPerGame}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
});

FeatureOptionsPanel.displayName = 'FeatureOptionsPanel';
