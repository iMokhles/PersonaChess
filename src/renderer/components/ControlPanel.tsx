/**
 * ControlPanel Component
 * View layer - React component for game controls
 * Observes BoardViewModel and EngineViewModel
 */

import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { boardViewModel, debugViewModel, engineViewModel } from '../../viewmodels';
import { BUCKET_LABELS, BUCKET_COLORS } from '../../engine/types';
import { PREDEFINED_OPENINGS, getOpeningById } from '../../engine/openings';
import './ControlPanel.css';

export const ControlPanel: React.FC = observer(() => {
  const [fenInput, setFenInput] = useState('');
  const [pgnInput, setPgnInput] = useState('');
  const [showFenModal, setShowFenModal] = useState(false);
  const [showPgnModal, setShowPgnModal] = useState(false);
  const [selectedOpeningId, setSelectedOpeningId] = useState<string>('');

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

  const handleLoadOpening = useCallback(() => {
    if (!selectedOpeningId) return;
    const opening = getOpeningById(selectedOpeningId);
    if (opening && boardViewModel.loadPgn(opening.pgn)) {
      const sideLabel = opening.side === 'white' ? 'White' : 'Black';
      boardViewModel.statusMessage = `Opening: ${opening.name} (${sideLabel})`;
    }
  }, [selectedOpeningId]);

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

  const handleFlipBoard = useCallback(() => {
    boardViewModel.flipBoard();
  }, []);

  const handleRestoreFen = useCallback(() => {
    const lastFen = boardViewModel.lastSavedFen;
    if (lastFen) {
      boardViewModel.loadFen(lastFen);
    }
  }, []);

  const handleToggleMoveArrows = useCallback(() => {
    boardViewModel.toggleMoveArrows();
  }, []);

  const handleAnalyzeMoves = useCallback(async () => {
    await boardViewModel.analyzeAllMoves();
  }, []);

  const isThinking = boardViewModel.isThinking;
  const lastBucket = boardViewModel.lastPlayedBucket;
  const statusMessage = boardViewModel.statusMessage;
  const canUndo = boardViewModel.canUndo;
  const canRedo = boardViewModel.canRedo;
  const autoPlayEnabled = boardViewModel.autoPlayEnabled;
  const enginePlaysFor = boardViewModel.enginePlaysFor;
  const lastPlayerMoveQuality = boardViewModel.lastPlayerMoveQuality;
  const lastPlayerMoveQualityLabel = boardViewModel.lastPlayerMoveQualityLabel;
  const lastPlayerMoveQualityColor = boardViewModel.lastPlayerMoveQualityColor;
  const analysisSource = engineViewModel.lastAnalysisPurpose
    ? (engineViewModel.lastAnalysisFromCache ? 'Cache' : 'Live engine')
    : 'None yet';
  const engineBusy = isThinking || engineViewModel.isAnalyzing || engineViewModel.isInitializing || boardViewModel.isAnalyzingMoves;
  const engineStatusLabel = engineViewModel.analysisStatusLabel;
  const analysisDetail = boardViewModel.isAnalyzingMoves
    ? 'Evaluating legal moves for arrows'
    : engineViewModel.isAnalyzing
      ? 'Stockfish is working on the current position'
      : engineViewModel.error
        ? 'Review the error below or reset the board to retry'
        : 'Ready for the next move';
  
  // Find the last user move (move not made by the engine)
  const lastUserMove = (() => {
    if (boardViewModel.history.length === 0) return null;
    for (let i = boardViewModel.history.length - 1; i >= 0; i--) {
      if (boardViewModel.history[i].color !== enginePlaysFor) {
        return boardViewModel.history[i];
      }
    }
    return null;
  })();

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
          <span>{statusMessage || 'Ready for a new game'}</span>
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

        {boardViewModel.hasSkippedEngineMoveNotice && (
          <div className="status-note warning-note">
            {boardViewModel.lastSkippedEngineMoveMessage}
          </div>
        )}
      </div>

      {/* User Move Status */}
      <div className="status-section user-move-section">
        <div className="status-message">
          {lastUserMove ? (
            <span>Your last move: {lastUserMove.san}</span>
          ) : (
            <span>No user move yet</span>
          )}
        </div>
        
        {lastPlayerMoveQuality && (
          <div 
            className="last-move-badge"
            style={{ 
              backgroundColor: lastPlayerMoveQualityColor ?? 'rgba(255, 255, 255, 0.2)',
              boxShadow: `0 0 12px ${(lastPlayerMoveQualityColor ?? '#6e7681')}40`
            }}
          >
            {lastPlayerMoveQualityLabel}
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
            {engineStatusLabel}
          </span>
        </div>

        <div className="status-subtle">
          {analysisDetail}
        </div>
        
        {engineViewModel.hasAnalyzedMoves && (
          <div className="status-row">
            <span className="status-label">Analyzed moves</span>
            <span className="status-value">{engineViewModel.analyzedMoves.length}</span>
          </div>
        )}

        <div className="status-row">
          <span className="status-label">Analysis source</span>
          <span className="status-value">{analysisSource}</span>
        </div>

        {debugViewModel.showDebugControls && (
          <div className="status-row">
            <span className="status-label">Session</span>
            <span className="status-value debug-value">{boardViewModel.debugSessionId}</span>
          </div>
        )}

        {debugViewModel.showDebugControls && (
          <button
            type="button"
            className={`btn btn-debug-toggle ${debugViewModel.debugLoggingEnabled ? 'active' : ''}`}
            onClick={() => debugViewModel.toggleDebugLogging()}
          >
            Debug logs: {debugViewModel.debugLoggingEnabled ? 'On' : 'Off'}
          </button>
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
          disabled={engineBusy || boardViewModel.isGameOver || autoPlayEnabled}
          title={autoPlayEnabled ? 'Disabled when auto-play is enabled' : 'Manually trigger engine move'}
        >
          {engineViewModel.isInitializing ? 'Starting Engine...' : isThinking ? 'Analyzing...' : 'Solve Next Move'}
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="secondary-actions">
        <button 
          className="btn btn-secondary btn-undo"
          onClick={handleUndoSingle}
          disabled={!canUndo || engineBusy}
          title="Undo last move"
        >
          ↶ Undo
        </button>
        <button 
          className="btn btn-secondary btn-redo"
          onClick={handleRedoSingle}
          disabled={!canRedo || engineBusy}
          title="Redo last undone move"
        >
          ↷ Redo
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={engineBusy}
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
          disabled={engineBusy}
        >
          Load FEN
        </button>
        <button 
          className="btn btn-outline"
          onClick={() => setShowPgnModal(true)}
          disabled={engineBusy}
        >
          Load PGN
        </button>
      </div>

      {/* Predefined Openings */}
      <div className="openings-section">
        <label className="openings-label">Load opening</label>
        <div className="openings-row">
          <select
            className="openings-select"
            value={selectedOpeningId}
            onChange={(e) => setSelectedOpeningId(e.target.value)}
            aria-label="Select a predefined opening"
          >
            <option value="">— Select opening —</option>
            {PREDEFINED_OPENINGS.map((op) => (
              <option key={op.id} value={op.id} title={op.description}>
                {op.name} ({op.side === 'white' ? 'White' : 'Black'})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleLoadOpening}
            disabled={!selectedOpeningId || boardViewModel.isThinking}
            
            title={selectedOpeningId ? `Load ${getOpeningById(selectedOpeningId)?.name ?? ''}` : 'Select an opening first'}
          >
            Load Opening
          </button>
        </div>
      </div>

      {/* Board Controls */}
      <div className="board-controls">
        <button 
          className="btn btn-secondary"
          onClick={handleFlipBoard}
          disabled={engineBusy}
          title="Flip board orientation"
        >
          🔄 Flip Board
        </button>
        <button 
          className={`btn btn-secondary ${boardViewModel.showMoveArrows ? 'active' : ''}`}
          onClick={handleToggleMoveArrows}
          title="Show/hide move quality arrows"
          disabled={engineBusy}
        >
          {boardViewModel.showMoveArrows ? '✓' : ''} Show Move Arrows
        </button>
        {boardViewModel.showMoveArrows && (
          <button 
            className="btn btn-secondary"
            onClick={handleAnalyzeMoves}
            title="Analyze all legal moves"
            disabled={engineBusy || boardViewModel.isGameOver}
          >
            {boardViewModel.isAnalyzingMoves ? 'Analyzing...' : 'Analyze Moves'}
          </button>
        )}
      </div>

      {/* Current FEN */}
      <div className="current-fen">
        <div className="fen-header">
          <label>Current FEN</label>
          <button 
            className="btn-restore-fen"
            onClick={handleRestoreFen}
            title="Restore last saved FEN"
            disabled={!boardViewModel.lastSavedFen || engineBusy}
          >
            ↻ Restore
          </button>
        </div>
        <div className="fen-display">
          <code>{boardViewModel.fen}</code>
        </div>
        <div className="fen-info">
          <span className={`fen-saved-indicator ${boardViewModel.lastSavedFen === boardViewModel.fen ? 'saved' : ''}`}>
            {boardViewModel.lastSavedFen === boardViewModel.fen ? '✓ Saved' : 'Not saved'}
          </span>
          <span className="fen-history-count">
            History: {boardViewModel.fenHistory.length} positions
          </span>
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
              <button className="btn btn-secondary" onClick={() => setShowFenModal(false)} disabled={engineBusy}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleLoadFen} disabled={engineBusy || !fenInput.trim()}>
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
              <button className="btn btn-secondary" onClick={() => setShowPgnModal(false)} disabled={engineBusy}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleLoadPgn} disabled={engineBusy || !pgnInput.trim()}>
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
