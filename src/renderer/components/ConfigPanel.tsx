/**
 * ConfigPanel Component
 * View layer - React component for bucket configuration sliders
 * Observes ConfigViewModel
 */

import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { configViewModel, engineViewModel } from '../../viewmodels';
import { MoveBucket, BUCKET_LABELS, BUCKET_COLORS, BUCKET_EVAL_RANGES, MOVE_QUALITY_PRESETS, MoveQualityPresetId } from '../../engine/types';
import './ConfigPanel.css';

const BUCKETS: MoveBucket[] = ['best', 'great', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'];

interface BucketSliderProps {
  bucket: MoveBucket;
  value: number;
  onChange: (value: number) => void;
  moveCount: number;
  disabled: boolean;
}

const BucketSlider: React.FC<BucketSliderProps> = ({ bucket, value, onChange, moveCount, disabled }) => {
  const [min, max] = BUCKET_EVAL_RANGES[bucket];
  const rangeText = max === Infinity ? `>${min}` : `${min}-${max}`;
  
  return (
    <div className="bucket-slider">
      <div className="bucket-header">
        <div className="bucket-label">
          <span 
            className="bucket-color" 
            style={{ backgroundColor: BUCKET_COLORS[bucket] }}
          />
          <span className="bucket-name">{BUCKET_LABELS[bucket]}</span>
          <span className="bucket-range">({rangeText} cp)</span>
        </div>
        <div className="bucket-stats">
          {moveCount > 0 && (
            <span className="move-count-badge">{moveCount}</span>
          )}
          <span className="bucket-value">{value}%</span>
        </div>
      </div>
      
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className="slider"
        style={{
          '--slider-color': BUCKET_COLORS[bucket],
        } as React.CSSProperties}
      />
    </div>
  );
};

export const ConfigPanel: React.FC = observer(() => {
  const engineBusy = engineViewModel.isMoveLaneBusy;

  const handleBucketChange = useCallback((bucket: MoveBucket) => (value: number) => {
    configViewModel.setBucketValue(bucket, value);
  }, []);

  const handleNormalize = useCallback(() => {
    configViewModel.normalizeConfig();
  }, []);

  const handleReset = useCallback(() => {
    configViewModel.resetToDefaults();
  }, []);

  const handlePresetSelect = useCallback((presetId: MoveQualityPresetId) => {
    configViewModel.applyPreset(presetId);
  }, []);

  const { totalPercentage, isValid, currentPresetId } = configViewModel;
  const moveStats = engineViewModel.moveStats;

  return (
    <div className="config-panel">
      <div className="panel-header">
        <h3>Move Quality Distribution</h3>
        <p className="panel-description">
          Choose a preset or set the probability of playing moves from each quality bucket
        </p>
      </div>

      <div className="presets-section">
        <label className="presets-label">Preset</label>
        <div className="presets-buttons" role="group" aria-label="Move quality preset">
          {MOVE_QUALITY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-btn ${currentPresetId === preset.id ? 'active' : ''}`}
              onClick={() => handlePresetSelect(preset.id)}
              disabled={engineBusy}
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}
          {currentPresetId === null && (
            <span className="preset-custom-badge">Custom</span>
          )}
        </div>
        {currentPresetId !== null && (
          <p className="preset-description">
            {MOVE_QUALITY_PRESETS.find(p => p.id === currentPresetId)?.description}
          </p>
        )}
      </div>

      <div className="sliders-container">
        {BUCKETS.map(bucket => (
          <BucketSlider
            key={bucket}
            bucket={bucket}
            value={configViewModel.bucketConfig[bucket]}
            onChange={handleBucketChange(bucket)}
            moveCount={moveStats[bucket]}
            disabled={engineBusy}
          />
        ))}
      </div>

      <div className={`total-indicator ${isValid ? 'valid' : 'invalid'}`}>
        <span className="total-label">Total:</span>
        <span className="total-value">{totalPercentage}%</span>
        {!isValid && (
          <span className="total-hint">
            {totalPercentage < 100 ? `Need ${100 - totalPercentage}% more` : `${totalPercentage - 100}% over`}
          </span>
        )}
      </div>

      <div className="panel-actions">
        <button 
          className="btn btn-secondary"
          onClick={handleNormalize}
          disabled={isValid || engineBusy}
        >
          Normalize to 100%
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={engineBusy}
        >
          Reset Defaults
        </button>
      </div>

      <div className="engine-settings">
        <h4>Engine Settings</h4>
        
        <div className="setting-row">
          <label>Analysis Depth</label>
          <div className="setting-input">
            <input
              type="number"
              min="1"
              max="30"
              value={configViewModel.depth}
              onChange={(e) => configViewModel.setDepth(parseInt(e.target.value, 10))}
              disabled={engineBusy}
            />
          </div>
        </div>

        <div className="setting-row">
          <label>MultiPV (candidates)</label>
          <div className="setting-input">
            <input
              type="number"
              min="1"
              max="20"
              value={configViewModel.multiPV}
              onChange={(e) => configViewModel.setMultiPV(parseInt(e.target.value, 10))}
              disabled={engineBusy}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

ConfigPanel.displayName = 'ConfigPanel';
