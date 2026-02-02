/**
 * ControlPanel Component
 * View layer - React component for game controls
 * Observes BoardViewModel and EngineViewModel
 */

import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { boardViewModel, engineViewModel } from '../../viewmodels';
import { BUCKET_LABELS, BUCKET_COLORS } from '../../engine/types';
import './ControlPanel.css';

export const ControlPanel: React.FC = observer(() => {
  const [fenInput, setFenInput] = useState('');
  const [pgnInput, setPgnInput] = useState('');
  const [showFenModal, setShowFenModal] = useState(false);
  const [showPgnModal, setShowPgnModal] = useState(false);

  const handleSolveNextMove = useCallback(async () => {
    await boardViewModel.solveNextMove();
  }, []);

  const handleLoadFen = useCallback(() => {
    if (fenInput.trim()) {
      const success = boardViewModel.loadFen(fenInput.trim());
      if (success) {
        setFenInput('');
        setShowFenModal(false);
      }
    }
  }, [fenInput]);

  const handleLoadPgn = useCallback(() => {
    if (pgnInput.trim()) {
      const success = boardViewModel.loadPgn(pgnInput.trim());
      if (success) {
        setPgnInput('');
        setShowPgnModal(false);
      }
    }
  }, [pgnInput]);

  const handleReset = useCallback(() => {
    boardViewModel.reset();
  }, []);

  const handleUndo = useCallback(() => {
    boardViewModel.undo();
  }, []);

  const handleUndoSingle = useCallback(() => {
    boardViewModel.undoSingle();
  }, []);

  const handleRedoSingle = useCallback(() => {
    boardViewModel.redoSingle();
  }, []);

  const handleToggleAutoPlay = useCallback(() => {
    boardViewModel.setAutoPlay(!boardViewModel.autoPlayEnabled);
  }, []);

  const handleSetEnginePlaysFor = useCallback((side: 'w' | 'b') => {
    boardViewModel.setEnginePlaysFor(side);
  }, []);

  const isThinking = boardViewModel.isThinking;
  const lastBucket = boardViewModel.lastPlayedBucket;
  const statusMessage = boardViewModel.statusMessage;
  const canUndo = boardViewModel.canUndo;
  const canRedo = boardViewModel.canRedo;
  const autoPlayEnabled = boardViewModel.autoPlayEnabled;
  const enginePlaysFor = boardViewModel.enginePlaysFor;

  return (
    <div className="control-panel">
      {/* Status Display */}
      <div className="status-section">
        <div className="status-message">
          {isThinking ? (
            <div className="thinking-indicator">
              <span className="spinner"></span>
              <span>{statusMessage}</span>
            </div>
          ) : (
            <span>{statusMessage}</span>
          )}
        </div>
        
        {lastBucket && (
          <div 
            className="last-move-badge"
            style={{ 
              backgroundColor: BUCKET_COLORS[lastBucket],
              boxShadow: `0 0 12px ${BUCKET_COLORS[lastBucket]}40`
            }}
          >
            {BUCKET_LABELS[lastBucket]} Move
          </div>
        )}
      </div>

      {/* Auto-Play Toggle */}
      <div className="auto-play-section">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={autoPlayEnabled}
            onChange={handleToggleAutoPlay}
            className="toggle-input"
          />
          <span className="toggle-text">Auto-play Engine</span>
        </label>
        <span className="toggle-hint">
          {autoPlayEnabled 
            ? `Engine will play automatically for ${enginePlaysFor === 'w' ? 'White' : 'Black'}` 
            : 'Click "Solve Next Move" to play engine manually'}
        </span>
        
        {/* Engine Side Selection */}
        {autoPlayEnabled && (
          <div className="engine-side-selection">
            <label className="side-select-label">Engine plays for:</label>
            <div className="side-buttons">
              <button
                className={`side-btn ${enginePlaysFor === 'w' ? 'active' : ''}`}
                onClick={() => handleSetEnginePlaysFor('w')}
                disabled={isThinking}
              >
                White
              </button>
              <button
                className={`side-btn ${enginePlaysFor === 'b' ? 'active' : ''}`}
                onClick={() => handleSetEnginePlaysFor('b')}
                disabled={isThinking}
              >
                Black
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Engine Status */}
      <div className="engine-status">
        <div className="status-row">
          <span className="status-label">Engine</span>
          <span className={`status-value ${engineViewModel.isInitialized ? 'ready' : ''}`}>
            {engineViewModel.isInitialized ? 'Ready' : 'Not initialized'}
          </span>
        </div>
        
        {engineViewModel.hasAnalyzedMoves && (
          <div className="status-row">
            <span className="status-label">Analyzed moves</span>
            <span className="status-value">{engineViewModel.analyzedMoves.length}</span>
          </div>
        )}
        
        {engineViewModel.error && (
          <div className="error-message">
            {engineViewModel.error}
          </div>
        )}
      </div>

      {/* Main Actions */}
      <div className="main-actions">
        <button
          className="btn btn-primary btn-large"
          onClick={handleSolveNextMove}
          disabled={isThinking || boardViewModel.isGameOver || autoPlayEnabled}
          title={autoPlayEnabled ? 'Disabled when auto-play is enabled' : 'Manually trigger engine move'}
        >
          {isThinking ? 'Analyzing...' : 'Solve Next Move'}
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="secondary-actions">
        <button 
          className="btn btn-secondary btn-undo"
          onClick={handleUndoSingle}
          disabled={!canUndo || isThinking}
          title="Undo last move"
        >
          ↶ Undo
        </button>
        <button 
          className="btn btn-secondary btn-redo"
          onClick={handleRedoSingle}
          disabled={!canRedo || isThinking}
          title="Redo last undone move"
        >
          ↷ Redo
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={isThinking}
        >
          Reset Board
        </button>
      </div>

      {/* Legacy Undo Button (Disabled) */}
      <div className="legacy-actions">
        <button 
          className="btn btn-secondary btn-undo-legacy"
          onClick={handleUndo}
          disabled={true}
          title="Disabled - Use Undo/Redo buttons above"
        >
          ↶ Undo (Legacy - Disabled) {
            autoPlayEnabled && boardViewModel.history.length >= 2 && 
            boardViewModel.history[boardViewModel.history.length - 1]?.color === enginePlaysFor
              ? '(2 moves)' 
              : ''
          }
        </button>
      </div>

      {/* Load Actions */}
      <div className="load-actions">
        <button 
          className="btn btn-outline"
          onClick={() => setShowFenModal(true)}
        >
          Load FEN
        </button>
        <button 
          className="btn btn-outline"
          onClick={() => setShowPgnModal(true)}
        >
          Load PGN
        </button>
      </div>

      {/* Current FEN */}
      <div className="current-fen">
        <label>Current FEN</label>
        <div className="fen-display">
          <code>{boardViewModel.fen}</code>
        </div>
      </div>

      {/* FEN Modal */}
      {showFenModal && (
        <div className="modal-overlay" onClick={() => setShowFenModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Load FEN</h3>
            <textarea
              value={fenInput}
              onChange={e => setFenInput(e.target.value)}
              placeholder="Paste FEN string here..."
              rows={3}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowFenModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleLoadFen}>
                Load
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PGN Modal */}
      {showPgnModal && (
        <div className="modal-overlay" onClick={() => setShowPgnModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Load PGN</h3>
            <textarea
              value={pgnInput}
              onChange={e => setPgnInput(e.target.value)}
              placeholder="Paste PGN here..."
              rows={8}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowPgnModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleLoadPgn}>
                Load
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ControlPanel.displayName = 'ControlPanel';
