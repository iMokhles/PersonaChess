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

  const isThinking = boardViewModel.isThinking;
  const lastBucket = boardViewModel.lastPlayedBucket;
  const statusMessage = boardViewModel.statusMessage;

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
          disabled={isThinking || boardViewModel.isGameOver}
        >
          {isThinking ? 'Analyzing...' : 'Solve Next Move'}
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="secondary-actions">
        <button 
          className="btn btn-secondary"
          onClick={handleUndo}
          disabled={boardViewModel.history.length === 0}
        >
          Undo
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleReset}
        >
          Reset Board
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
