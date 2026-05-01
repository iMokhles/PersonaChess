/**
 * Board ViewModel
 * ViewModel layer - MobX store for chess board state
 */

import { makeAutoObservable, action, reaction, runInAction } from 'mobx';
import { Chess, Move, Square } from 'chess.js';
import { canApplyAnalyzedMove } from '../engine/analysisSafety';
import { deriveBrilliantUsage, MoveAnnotation } from '../engine/brilliantTracking';
import { PersistedBoardState, createGameSessionId, resolvePgnStartFen } from '../engine/gameSession';
import { engineViewModel } from './EngineViewModel';
import { configViewModel } from './ConfigViewModel';
import { featureOptionsViewModel } from './FeatureOptionsViewModel';
import { createDebugLogger } from '../shared/debug';
import {
  PickedMoveResult,
  MoveBucket,
  DisplayMoveBucket,
  DISPLAY_BUCKET_LABELS,
  BUCKET_LABELS,
  BUCKET_COLORS,
  DISPLAY_BUCKET_COLORS,
} from '../engine/types';
import { calculateHumanDelayMs } from '../engine/personaBias';
import { mapLegalMovesToBuckets } from '../engine/moveClassifier';

const logger = createDebugLogger('BoardViewModel');

export class BoardViewModel {
  private chess: Chess = new Chess();
  fen = this.chess.fen();
  gameStartFen = this.chess.fen();
  gameSessionId = createGameSessionId();
  history: Move[] = [];
  lastMove: { from: Square; to: Square } | null = null;
  lastPlayedBucket: MoveBucket | null = null;
  statusMessage = 'Ready';
  lastSkippedEngineMoveMessage: string | null = null;
  isThinking = false;
  autoPlayEnabled = true; // Auto-play engine moves after human moves
  enginePlaysFor: 'w' | 'b' = 'b'; // Which side the engine plays for (default: black)
  boardFlipped = false; // Board orientation (false = white on bottom, true = black on bottom)
  showMoveArrows = false; // Show arrows for all possible moves
  showArrowsForSide: 'current' | 'player' | 'engine' = 'current'; // Which side's moves to show arrows for
  lastPlayerMoveQuality: DisplayMoveBucket | null = null; // Quality of the last player move
  isAnalyzingMoves = false; // Whether we're currently analyzing moves
  
  // Store analyzed moves as an object for MobX observability
  private _analyzedLegalMoves: Record<string, DisplayMoveBucket> = {};
  private redoStack: Move[] = []; // Stack of moves that were undone for redo functionality
  private historyAnnotations: MoveAnnotation[] = [];
  private redoAnnotations: MoveAnnotation[] = [];
  private analyzedLegalMovesFen: string | null = null;
  private _analysisTimeout: NodeJS.Timeout | null = null; // Timeout for debouncing move analysis
  private readonly FEN_STORAGE_KEY = 'personachess_current_fen';
  private readonly FEN_HISTORY_KEY = 'personachess_fen_history';
  private readonly BOARD_STATE_STORAGE_KEY = 'personachess_board_state';
  private readonly MAX_HISTORY = 50; // Maximum number of FEN positions to store

  constructor() {
    makeAutoObservable(this, {
      loadFen: action,
      loadPgn: action,
      makeMove: action,
      solveNextMove: action,
      reset: action,
      undo: action,
      undoSingle: action,
      redoSingle: action,
      setAutoPlay: action,
      setEnginePlaysFor: action,
      flipBoard: action,
      setBoardFlipped: action,
      saveFenToHistory: action,
      loadFenFromHistory: action,
      toggleMoveArrows: action,
      setShowMoveArrowsEnabled: action,
      setShowArrowsForSide: action,
      analyzeAllMoves: action,
      analyzePlayerMove: action,
    });
    
    // Try to restore FEN from localStorage on initialization
    this.restoreFenFromStorage();

    reaction(
      () => featureOptionsViewModel.persistEngineConfig,
      (persistEngineConfig) => {
        if (!persistEngineConfig) {
          this.clearPersistedBoardState();
          return;
        }

        this.saveFenToHistory();
      },
      { fireImmediately: true },
    );
    
    logger.debug('Initialized with FEN:', this.fen);
  }

  /**
   * Set auto-play mode
   */
  setAutoPlay(enabled: boolean): void {
    this.autoPlayEnabled = enabled;
    logger.debug('Auto-play set to:', enabled);
  }

  /**
   * Set which side the engine plays for
   */
  setEnginePlaysFor(side: 'w' | 'b'): void {
    this.enginePlaysFor = side;
    logger.debug('Engine plays for:', side === 'w' ? 'White' : 'Black');
  }

  /**
   * Load a position from FEN string
   */
  loadFen(
    fen: string,
    options: {
      resetBrilliantTracking?: boolean;
      sessionId?: string;
      gameStartFen?: string;
      historyAnnotations?: MoveAnnotation[];
      redoAnnotations?: MoveAnnotation[];
    } = {},
  ): boolean {
    try {
      const {
        resetBrilliantTracking = true,
        sessionId,
        gameStartFen,
        historyAnnotations,
        redoAnnotations,
      } = options;
      logger.debug('loadFen called:', fen);
      const newChess = new Chess(fen);
      this.chess = newChess;
      this.beginSessionState({
        gameSessionId: sessionId ?? createGameSessionId(),
        gameStartFen: gameStartFen ?? fen,
        resetBrilliantTracking,
        historyAnnotations,
        redoAnnotations,
      });
      this.updateState();
      this.statusMessage = 'Position loaded';
      this.lastSkippedEngineMoveMessage = null;
      engineViewModel.reset();
      logger.debug('FEN loaded successfully');
      return true;
    } catch (err) {
      logger.error('loadFen error:', err);
      this.statusMessage = `Invalid FEN: ${err}`;
      return false;
    }
  }

  /**
   * Load a game from PGN string
   */
  loadPgn(
    pgn: string,
    options: { resetBrilliantTracking?: boolean; sessionId?: string } = {},
  ): boolean {
    try {
      const { resetBrilliantTracking = true, sessionId } = options;
      logger.debug('loadPgn called');
      const newChess = new Chess();
      newChess.loadPgn(pgn);
      const gameStartFen = resolvePgnStartFen(newChess.header(), new Chess().fen());
      this.chess = newChess;
      this.beginSessionState({
        gameSessionId: sessionId ?? createGameSessionId(),
        gameStartFen,
        resetBrilliantTracking,
      });
      this.updateState();
      this.statusMessage = 'PGN loaded';
      this.lastSkippedEngineMoveMessage = null;
      engineViewModel.reset();
      return true;
    } catch (err) {
      logger.error('loadPgn error:', err);
      this.statusMessage = `Invalid PGN: ${err}`;
      return false;
    }
  }

  /**
   * Make a move on the board (similar to the example pattern)
   * This is synchronous for immediate UI feedback, just like the example
   */
  makeMove(from: Square, to: Square, promotion = 'q'): boolean {
    logger.debug('makeMove called', { from, to, promotion, currentFen: this.fen, currentTurn: this.chess.turn() });
    
    try {
      // Try to make the move according to chess.js logic (exactly like the example)
      // chess.js will validate the move automatically
      const move = this.chess.move({
        from,
        to,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });

      if (move) {
        logger.debug('Move successful:', move.san);
        // Clear redo stack when a new move is made
        this.clearRedoState();
        this.recordMoveAnnotation(move, false);
        // Update the position state to trigger a re-render (via MobX observable)
        this.updateState();
        this.lastMove = { from, to };
        this.lastPlayedBucket = null;
        this.statusMessage = `You played: ${move.san}`;
        engineViewModel.reset();
        this.lastSkippedEngineMoveMessage = null;
        
        // Analyze the player's move quality
        this.analyzePlayerMove(move);
        
        // Make engine move after a short delay if:
        // 1. Auto-play is enabled
        // 2. Game is not over
        // 3. It's now the engine's turn (the turn changed after the human move)
        if (this.autoPlayEnabled && !this.isGameOver && this.chess.turn() === this.enginePlaysFor) {
          logger.debug('Scheduling auto-play for engine side:', this.enginePlaysFor);
          setTimeout(() => {
            this.solveNextMove(true).catch(err => {
              logger.error('Auto-play error:', err);
            });
          }, 500); // Similar delay to the example
        }
        
        // Return true as the move was successful
        return true;
      } else {
        logger.debug('Move failed - chess.js returned null');
        // Return false as the move was not successful
        return false;
      }
    } catch (err) {
      logger.debug('Move exception:', err);
      // Return false as the move was not successful
      return false;
    }
  }

  /**
   * Make a move from UCI notation (e.g., "e2e4")
   * Used by the engine
   */
  async makeMoveUCI(
    uci: string,
    options: { consumedBrilliant?: boolean } = {},
  ): Promise<boolean> {
    if (uci.length < 4) return false;
    
    const from = uci.slice(0, 2) as Square;
    const to = uci.slice(2, 4) as Square;
    const promotion = uci.length > 4 ? uci[4] : undefined;
    
    try {
      const move = this.chess.move({
        from,
        to,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });

      if (move) {
        // Clear redo stack when a new move is made
        this.clearRedoState();
        this.recordMoveAnnotation(move, options.consumedBrilliant ?? false);
        this.updateState();
        this.lastMove = { from, to };
        this.lastPlayedBucket = null;
        this.statusMessage = `Engine played: ${move.san}`;
        engineViewModel.reset();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Solve and play the next move using the engine and bucket configuration
   */
  async solveNextMove(autoTriggered = false): Promise<PickedMoveResult | null> {
    if (this.isGameOver) {
      this.statusMessage = 'Game is over';
      return null;
    }

    try {
      runInAction(() => {
        this.isThinking = true;
        this.statusMessage = 'Engine thinking...';
      });

      // Initialize engine if needed
      if (!engineViewModel.isInitialized) {
        await engineViewModel.initialize();
      }

      // Analyze current position
      const analysis = await engineViewModel.analyzePosition(
        this.fen,
        configViewModel.depth,
        configViewModel.multiPV,
        'engineMove',
      );

      // Check if analysis returned no moves (game over position)
      if (analysis.ignored || analysis.moves.length === 0) {
        runInAction(() => {
          if (analysis.ignored) {
            this.statusMessage = 'Engine analysis expired';
          } else if (this.isCheckmate) {
            this.statusMessage = 'Checkmate! Game over.';
          } else if (this.isStalemate) {
            this.statusMessage = 'Stalemate! Game over.';
          } else if (this.isDraw) {
            this.statusMessage = 'Draw! Game over.';
          } else {
            this.statusMessage = 'No legal moves available';
          }
          this.lastSkippedEngineMoveMessage = analysis.ignored ? 'A newer engine analysis replaced this move request.' : null;
          this.isThinking = false;
        });
        return null;
      }

      // Pick a move based on bucket configuration
      const persona = configViewModel.currentPresetId ?? 'custom';
      const result = engineViewModel.pickMoveFromAnalysis(analysis, configViewModel.bucketConfig, {
        fen: this.fen,
        gameStartFen: this.gameStartFen,
        moveCount: this.moveCount,
        sideToMove: this.turn,
        persona,
      });

      if (result) {
        if (autoTriggered && featureOptionsViewModel.useHumanDelaySimulation) {
          const delayMs = calculateHumanDelayMs({
            complexity: analysis.complexity,
            persona,
            bucket: result.bucket,
          });
          await this.wait(delayMs);
        }

        if (!canApplyAnalyzedMove(this.fen, analysis.analyzedFen)) {
          runInAction(() => {
            this.statusMessage = 'Position changed, stale engine move discarded';
            this.lastSkippedEngineMoveMessage = 'Skipped engine move because the board changed before it could be played.';
            this.isThinking = false;
          });
          return null;
        }

        // Apply the picked move
        const moveSuccess = await this.makeMoveUCI(result.move.move, {
          consumedBrilliant: result.isBrilliant ?? false,
        });
        
        if (moveSuccess) {
          runInAction(() => {
            this.lastPlayedBucket = result.bucket;
            this.statusMessage = result.isBrilliant
              ? 'Engine played: Brilliant move'
              : `Engine played: ${BUCKET_LABELS[result.bucket]} move`;
            this.lastSkippedEngineMoveMessage = null;
            this.isThinking = false;
          });
        } else {
          runInAction(() => {
            this.statusMessage = 'Engine move failed';
            this.isThinking = false;
          });
        }

        return result;
      } else {
        runInAction(() => {
          this.statusMessage = 'No moves available';
          this.isThinking = false;
        });
        return null;
      }
    } catch (err) {
      logger.error('solveNextMove error:', err);
      runInAction(() => {
        this.statusMessage = `Error: ${err}`;
        this.isThinking = false;
      });
      return null;
    }
  }

  /**
   * Reset the board to starting position
   */
  reset(): void {
    logger.debug('reset called');
    this.chess = new Chess();
    this.beginSessionState({
      gameSessionId: createGameSessionId(),
      gameStartFen: this.chess.fen(),
      resetBrilliantTracking: true,
    });
    this.updateState();
    this.lastMove = null;
    this.lastPlayedBucket = null;
    this.statusMessage = 'Board reset';
    this.lastSkippedEngineMoveMessage = null;
    engineViewModel.reset();
    logger.debug('Board reset, new FEN:', this.fen);
  }

  /**
   * Undo the last move (or last two moves if auto-play is on and engine just moved)
   */
  undo(): boolean {
    logger.debug('undo called, history length:', this.history.length);
    
    // If auto-play is enabled and the last move was by the engine, undo both moves
    if (this.autoPlayEnabled && this.history.length >= 2) {
      // Check if the last move was by the engine
      const lastMove = this.history[this.history.length - 1];
      const lastMoveColor = lastMove.color;
      
      // If last move was by engine, undo both (engine move + human move)
      if (lastMoveColor === this.enginePlaysFor) {
        if (this.undoMoves(2)) {
          this.updateState();
          this.lastMove = null;
          this.lastPlayedBucket = null;
          this.statusMessage = 'Undid last 2 moves (human + engine)';
          engineViewModel.reset();
          logger.debug('Undid 2 moves');
          return true;
        }
      } else {
        // Last move was by human, just undo one
        if (this.undoMoves(1)) {
          this.updateState();
          this.lastMove = null;
          this.lastPlayedBucket = null;
          this.statusMessage = 'Move undone';
          engineViewModel.reset();
          logger.debug('Undid 1 move');
          return true;
        }
      }
    } else {
      // Auto-play disabled or not enough moves, undo just one move
      if (this.undoMoves(1)) {
        this.updateState();
        this.lastMove = null;
        this.lastPlayedBucket = null;
        this.statusMessage = 'Move undone';
        engineViewModel.reset();
        logger.debug('Undid 1 move');
        return true;
      }
    }
    
    logger.debug('Undo failed - no moves to undo');
    return false;
  }

  /**
   * Update internal state from chess instance
   */
  private updateState(): void {
    this.fen = this.chess.fen();
    this.history = this.chess.history({ verbose: true });
    this.analyzedLegalMovesFen = null;
    // Save FEN to localStorage whenever it changes
    this.saveFenToHistory();
    logger.debug('updateState - FEN:', this.fen, 'History length:', this.history.length);
    
    // Automatically re-analyze moves if arrows are enabled (debounced to prevent excessive calls)
    if (this.showMoveArrows && !this.isGameOver && !this.isAnalyzingMoves) {
      // Clear previous analysis and trigger new analysis asynchronously
      // Use setTimeout to debounce and prevent re-render loops
      this._analyzedLegalMoves = {};
      // Clear any pending analysis timeout
      if (this._analysisTimeout) {
        clearTimeout(this._analysisTimeout);
      }
      // Debounce analysis to prevent excessive calls
      this._analysisTimeout = setTimeout(() => {
        this.analyzeAllMoves().catch(err => {
          logger.error('Failed to analyze moves:', err);
        });
      }, 300); // 300ms debounce
    }
  }

  /**
   * Flip the board orientation and engine playing color
   */
  flipBoard(): void {
    this.boardFlipped = !this.boardFlipped;
    // Flip the engine's playing color when board is flipped
    this.enginePlaysFor = this.enginePlaysFor === 'w' ? 'b' : 'w';
    logger.debug('Board flipped, orientation:', this.boardFlipped ? 'black' : 'white', 'Engine now plays for:', this.enginePlaysFor === 'w' ? 'White' : 'Black');
  }

  setBoardFlipped(flipped: boolean): void {
    if (this.boardFlipped !== flipped) {
      this.flipBoard();
    }
  }

  /**
   * Save current FEN to localStorage history
   */
  saveFenToHistory(): void {
    try {
      const currentFen = this.fen;
      
      // Save current FEN
      localStorage.setItem(this.FEN_STORAGE_KEY, currentFen);
      
      // Get existing history
      const historyJson = localStorage.getItem(this.FEN_HISTORY_KEY);
      let history: string[] = historyJson ? JSON.parse(historyJson) : [];
      
      if (history.length === 0 || history[history.length - 1] !== currentFen) {
        history.push(currentFen);

        if (history.length > this.MAX_HISTORY) {
          history = history.slice(-this.MAX_HISTORY);
        }

        localStorage.setItem(this.FEN_HISTORY_KEY, JSON.stringify(history));
      }

      if (featureOptionsViewModel.persistEngineConfig) {
        const boardState: PersistedBoardState = {
          currentFen,
          fenHistory: history,
          gameSessionId: this.gameSessionId,
          gameStartFen: this.gameStartFen,
          historyAnnotations: this.historyAnnotations,
          redoAnnotations: this.redoAnnotations,
        };
        localStorage.setItem(this.BOARD_STATE_STORAGE_KEY, JSON.stringify(boardState));
      } else {
        this.clearPersistedBoardState();
      }
      
      logger.debug('Saved FEN to history, total entries:', history.length);
    } catch (err) {
      logger.error('Failed to save FEN to history:', err);
    }
  }

  /**
   * Restore FEN from localStorage on app startup
   */
  private restoreFenFromStorage(): void {
    try {
      const savedFen = localStorage.getItem(this.FEN_STORAGE_KEY);
      if (savedFen) {
        // Validate FEN before loading
        const testChess = new Chess();
        try {
          testChess.load(savedFen);
          // FEN is valid, load it
          const restoredBoardState = this.readPersistedBoardState();
          if (restoredBoardState?.currentFen === savedFen) {
            this.loadFen(savedFen, {
              resetBrilliantTracking: false,
              sessionId: restoredBoardState.gameSessionId,
              gameStartFen: restoredBoardState.gameStartFen,
              historyAnnotations: restoredBoardState.historyAnnotations,
              redoAnnotations: restoredBoardState.redoAnnotations,
            });
          } else {
            this.loadFen(savedFen, {
              resetBrilliantTracking: false,
            });
          }

          if (featureOptionsViewModel.brilliantGameSessionId !== this.gameSessionId) {
            featureOptionsViewModel.resetBrilliantTracking(this.gameSessionId);
          }
          this.statusMessage = 'Restored position from previous session';
          logger.debug('Restored FEN from storage:', savedFen);
        } catch (err) {
          logger.warn('Saved FEN is invalid, using default:', err);
          localStorage.removeItem(this.FEN_STORAGE_KEY);
        }
      }
    } catch (err) {
      logger.error('Failed to restore FEN from storage:', err);
    }
  }

  /**
   * Load FEN from history by index
   */
  loadFenFromHistory(index: number): boolean {
    try {
      const historyJson = localStorage.getItem(this.FEN_HISTORY_KEY);
      if (!historyJson) return false;
      
      const history: string[] = JSON.parse(historyJson);
      if (index < 0 || index >= history.length) return false;
      
      const fen = history[index];
      return this.loadFen(fen);
    } catch (err) {
      logger.error('Failed to load FEN from history:', err);
      return false;
    }
  }

  /**
   * Get FEN history
   */
  get fenHistory(): string[] {
    try {
      const historyJson = localStorage.getItem(this.FEN_HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get the last saved FEN
   */
  get lastSavedFen(): string | null {
    try {
      return localStorage.getItem(this.FEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Toggle showing move arrows
   */
  toggleMoveArrows(): void {
    // Clear any pending analysis timeout
    if (this._analysisTimeout) {
      clearTimeout(this._analysisTimeout);
      this._analysisTimeout = null;
    }
    
    this.showMoveArrows = !this.showMoveArrows;
    if (this.showMoveArrows && Object.keys(this._analyzedLegalMoves).length === 0 && !this.isAnalyzingMoves) {
      // Auto-analyze if arrows are enabled and we don't have analysis yet
      this.analyzeAllMoves().catch(err => {
        console.error('[BoardViewModel] Failed to analyze moves:', err);
      });
    } else if (!this.showMoveArrows) {
      // Clear analysis when arrows are disabled to free memory
      this._analyzedLegalMoves = {};
      this.analyzedLegalMovesFen = null;
    }
  }

  setShowMoveArrowsEnabled(enabled: boolean): void {
    if (this.showMoveArrows !== enabled) {
      this.toggleMoveArrows();
    }
  }

  /**
   * Set which side's moves to show arrows for
   */
  setShowArrowsForSide(side: 'current' | 'player' | 'engine'): void {
    this.showArrowsForSide = side;
    logger.debug('Show arrows for side:', side);
    // Re-analyze if arrows are enabled
    if (this.showMoveArrows) {
      this._analyzedLegalMoves = {};
      this.analyzedLegalMovesFen = null;
      this.analyzeAllMoves();
    }
  }

  /**
   * Analyze all legal moves for the current position
   */
  async analyzeAllMoves(): Promise<void> {
    if (this.isGameOver || this.isAnalyzingMoves) {
      return;
    }

    if (this.analyzedLegalMovesFen === this.fen && Object.keys(this._analyzedLegalMoves).length > 0) {
      return;
    }

    try {
      runInAction(() => {
        this.isAnalyzingMoves = true;
        this._analyzedLegalMoves = {}; // Clear
      });

      // Get all legal moves
      const legalMoves = this.allLegalMoves;
      if (legalMoves.length === 0) {
        runInAction(() => {
          this.isAnalyzingMoves = false;
        });
        return;
      }

      // Initialize engine if needed
      if (!engineViewModel.isInitialized) {
        await engineViewModel.initialize();
      }

      // Analyze current position
      const analysis = await engineViewModel.analyzePosition(
        this.fen,
        configViewModel.depth,
        configViewModel.multiPV,
        'background',
      );

      if (analysis.ignored || !canApplyAnalyzedMove(this.fen, analysis.analyzedFen)) {
        runInAction(() => {
          this.isAnalyzingMoves = false;
        });
        return;
      }

      // Create a map of UCI moves to their quality buckets
      const moveMap = mapLegalMovesToBuckets(
        legalMoves.map(move => `${move.from}${move.to}${move.promotion || ''}`),
        analysis.moves,
        featureOptionsViewModel.useImprovedMoveClassification,
      );

      runInAction(() => {
        this._analyzedLegalMoves = moveMap;
        this.isAnalyzingMoves = false;
      });

      this.analyzedLegalMovesFen = this.fen;
      logger.debug('Analyzed', Object.keys(moveMap).length, 'legal moves');
    } catch (err) {
      logger.error('Failed to analyze moves:', err);
      runInAction(() => {
        this.isAnalyzingMoves = false;
      });
    }
  }

  /**
   * Analyze the quality of a player's move
   * This should be called after the move is made, analyzing the position before the move
   */
  async analyzePlayerMove(move: Move): Promise<void> {
    // Run asynchronously so it doesn't block the UI
    setTimeout(async () => {
      try {
        const expectedAfterFen = move.after;
        // Initialize engine if needed
        if (!engineViewModel.isInitialized) {
          await engineViewModel.initialize();
        }

        // Get the position before the move (from history)
        const history = this.chess.history({ verbose: true });
        if (history.length === 0) {
          return; // No history, can't analyze
        }

        // The move we just made is the last one in history
        // We need to analyze the position before it
        // chess.js history verbose includes 'before' and 'after' FEN
        const lastMoveInHistory = history[history.length - 1] as Move & { before?: string };
        const beforeFen = lastMoveInHistory.before || this.fen;

        // Analyze the position before the move
        const analysis = await engineViewModel.analyzePosition(
          beforeFen,
          Math.min(configViewModel.depth, 15), // Use smaller depth for faster analysis
          configViewModel.multiPV,
          'background',
        );

        if (
          analysis.ignored
          || !canApplyAnalyzedMove(beforeFen, analysis.analyzedFen)
          || this.fen !== expectedAfterFen
        ) {
          return;
        }

        // Find the move in the analyzed moves
        const moveUCI = `${move.from}${move.to}${move.promotion || ''}`;
        const analyzedMove = analysis.moves.find(m => m.move === moveUCI);
        if (analyzedMove) {
          runInAction(() => {
            this.lastPlayerMoveQuality = analyzedMove.bucket;
            const qualityLabel = BUCKET_LABELS[analyzedMove.bucket];
            this.statusMessage = `You played: ${move.san} (${qualityLabel})`;
          });
          logger.debug('Player move quality:', analyzedMove.bucket);
        } else {
          runInAction(() => {
            if (featureOptionsViewModel.useImprovedMoveClassification) {
              this.lastPlayerMoveQuality = 'fallback';
              this.statusMessage = `You played: ${move.san} (Fallback move)`;
            } else {
              this.lastPlayerMoveQuality = 'good';
              this.statusMessage = `You played: ${move.san} (Good)`;
            }
          });
        }
      } catch (err) {
        logger.error('Failed to analyze player move:', err);
        // Don't update status on error, keep the original message
      }
    }, 100);
  }

  /**
   * Get arrows data for react-chessboard
   * Returns array of Arrow objects with startSquare, endSquare, and color properties
   * Only shows arrows for Excellent, Good, Mistake, and Blunder moves
   * Limited to maximum 3 arrows per quality bucket
   */
  get moveArrows(): Array<{ startSquare: string; endSquare: string; color: string }> {
    if (!this.showMoveArrows || Object.keys(this._analyzedLegalMoves).length === 0) {
      return [];
    }

    // Only show arrows for these specific move qualities
    const allowedBuckets: MoveBucket[] = ['excellent', 'good', 'mistake', 'blunder'];
    const maxArrowsPerBucket = 3;

    let legalMoves = this.allLegalMoves;

    // Filter moves by side if needed
    if (this.showArrowsForSide === 'player') {
      // Show moves for the side that the engine is NOT playing for
      const playerSide = this.enginePlaysFor === 'w' ? 'b' : 'w';
      legalMoves = legalMoves.filter(move => {
        const piece = this.getPieceAt(move.from);
        return piece && piece.color === playerSide;
      });
    } else if (this.showArrowsForSide === 'engine') {
      // Show moves for the side that the engine IS playing for
      legalMoves = legalMoves.filter(move => {
        const piece = this.getPieceAt(move.from);
        return piece && piece.color === this.enginePlaysFor;
      });
    }
    // If 'current', show all legal moves (already filtered by chess.js to current turn)

    // Helper function to validate square format (a-h, 1-8)
    const isValidSquare = (square: unknown): square is Square => {
      if (!square || typeof square !== 'string') return false;
      return /^[a-h][1-8]$/.test(square);
    };

    // Group moves by bucket
    const movesByBucket: Record<MoveBucket, Array<{ startSquare: string; endSquare: string; color: string }>> = {
      excellent: [],
      good: [],
      mistake: [],
      blunder: [],
      best: [], // Not used but needed for type
      great: [], // Not used but needed for type
      inaccuracy: [], // Not used but needed for type
    };

    // Collect all valid moves grouped by bucket
    for (const move of legalMoves) {
      // Validate that move has valid from and to squares
      if (!isValidSquare(move.from) || !isValidSquare(move.to)) {
        logger.debug('Skipping invalid move:', move);
        continue;
      }

      const uci = `${move.from}${move.to}${move.promotion || ''}`;
      const bucket = this._analyzedLegalMoves[uci];
      
      // Only include moves from allowed buckets
      if (bucket && bucket !== 'fallback' && allowedBuckets.includes(bucket) && isValidSquare(move.from) && isValidSquare(move.to)) {
        movesByBucket[bucket].push({
          startSquare: move.from,
          endSquare: move.to,
          color: BUCKET_COLORS[bucket],
        });
      }
    }

    // Limit to max 3 arrows per bucket and combine
    const arrows: Array<{ startSquare: string; endSquare: string; color: string }> = [];
    for (const bucket of allowedBuckets) {
      const bucketArrows = movesByBucket[bucket].slice(0, maxArrowsPerBucket);
      arrows.push(...bucketArrows);
      logger.debug(`Added ${bucketArrows.length} ${bucket} arrows (found ${movesByBucket[bucket].length} total)`);
    }

    logger.debug('Generated', arrows.length, 'total arrows');
    return arrows;
  }

  /**
   * Get analyzed legal moves count (for UI display)
   */
  get analyzedLegalMovesCount(): number {
    return Object.keys(this._analyzedLegalMoves).length;
  }

  /**
   * Get current turn (white/black)
   */
  get turn(): 'w' | 'b' {
    return this.chess.turn();
  }

  /**
   * Get turn as string
   */
  get turnString(): string {
    return this.turn === 'w' ? 'White' : 'Black';
  }

  /**
   * Check if game is over
   */
  get isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  /**
   * Check if it's checkmate
   */
  get isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  /**
   * Check if it's stalemate
   */
  get isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  /**
   * Check if it's a draw
   */
  get isDraw(): boolean {
    return this.chess.isDraw();
  }

  /**
   * Check if king is in check
   */
  get isCheck(): boolean {
    return this.chess.isCheck();
  }

  /**
   * Get game status text
   */
  get gameStatus(): string {
    if (this.isCheckmate) {
      return `Checkmate! ${this.turn === 'w' ? 'Black' : 'White'} wins`;
    }
    if (this.isStalemate) {
      return 'Stalemate!';
    }
    if (this.isDraw) {
      return 'Draw!';
    }
    if (this.isCheck) {
      return `${this.turnString} is in check`;
    }
    return `${this.turnString} to move`;
  }

  /**
   * Get legal moves for a square
   */
  getLegalMoves(square: Square): Move[] {
    return this.chess.moves({ square, verbose: true });
  }

  /**
   * Get piece at square (for UI visual indicators)
   */
  getPieceAt(square: Square) {
    return this.chess.get(square);
  }

  /**
   * Get all legal moves
   */
  get allLegalMoves(): Move[] {
    return this.chess.moves({ verbose: true });
  }

  /**
   * Get move count
   */
  get moveCount(): number {
    return this.chess.moveNumber();
  }

  /**
   * Undo a single move (for the new undo button)
   */
  undoSingle(): boolean {
    logger.debug('undoSingle called, history length:', this.history.length);
    
    if (this.history.length === 0) {
      return false;
    }
    
    const move = this.chess.undo();
    if (move) {
      // Add to redo stack
      this.redoStack.push(move);
      const annotation = this.historyAnnotations.pop();
      if (annotation) {
        this.redoAnnotations.push(annotation);
      }
      this.syncBrilliantTrackingFromAnnotations();
      this.updateState();
      
      // Update lastMove if there are still moves in history
      if (this.history.length > 0) {
        const lastMoveInHistory = this.history[this.history.length - 1];
        this.lastMove = { from: lastMoveInHistory.from as Square, to: lastMoveInHistory.to as Square };
      } else {
        this.lastMove = null;
      }
      
      this.lastPlayedBucket = null;
      this.statusMessage = 'Undid 1 move';
      engineViewModel.reset();
      logger.debug('Undid 1 move, redo stack size:', this.redoStack.length);
      return true;
    }
    
    return false;
  }

  /**
   * Redo a single move
   */
  redoSingle(): boolean {
    logger.debug('redoSingle called, redo stack size:', this.redoStack.length);
    
    if (this.redoStack.length === 0) {
      return false;
    }
    
    const moveToRedo = this.redoStack.pop();
    if (!moveToRedo) {
      return false;
    }
    const annotationToRedo = this.redoAnnotations.pop();
    
    try {
      const move = this.chess.move({
        from: moveToRedo.from as Square,
        to: moveToRedo.to as Square,
        promotion: moveToRedo.promotion,
      });
      
      if (move) {
        this.historyAnnotations.push(
          annotationToRedo ?? this.createMoveAnnotation(move, false),
        );
        this.syncBrilliantTrackingFromAnnotations();
        this.updateState();
        this.lastMove = { from: move.from as Square, to: move.to as Square };
        this.lastPlayedBucket = null;
        this.statusMessage = `Redid: ${move.san}`;
        engineViewModel.reset();
        logger.debug('Redid 1 move');
        
        // If auto-play is enabled and it's now the engine's turn, trigger auto-play
        if (this.autoPlayEnabled && !this.isGameOver && this.chess.turn() === this.enginePlaysFor) {
          logger.debug('Scheduling auto-play after redo');
          setTimeout(() => {
            this.solveNextMove(true).catch(err => {
              logger.error('Auto-play error after redo:', err);
            });
          }, 500);
        }
        
        return true;
      }
    } catch (err) {
      logger.error('Redo failed:', err);
      // Put the move back on the stack if it failed
      this.redoStack.push(moveToRedo);
      if (annotationToRedo) {
        this.redoAnnotations.push(annotationToRedo);
      }
    }
    
    return false;
  }

  /**
   * Check if undo is available
   */
  get canUndo(): boolean {
    return this.history.length > 0;
  }

  /**
   * Check if redo is available
   */
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  get moveHistoryRows(): Array<{ moveNumber: number; white: Move | null; black: Move | null }> {
    const rows: Array<{ moveNumber: number; white: Move | null; black: Move | null }> = [];

    for (let index = 0; index < this.history.length; index += 2) {
      const whiteMove = this.history[index] ?? null;
      const blackMove = this.history[index + 1] ?? null;
      const moveNumber = whiteMove?.moveNumber ?? blackMove?.moveNumber ?? rows.length + 1;
      rows.push({
        moveNumber,
        white: whiteMove,
        black: blackMove,
      });
    }

    return rows;
  }

  get debugSessionId(): string {
    return this.gameSessionId;
  }

  get hasSkippedEngineMoveNotice(): boolean {
    return this.lastSkippedEngineMoveMessage !== null;
  }

  /**
   * Export current game as PGN
   */
  get pgn(): string {
    return this.chess.pgn();
  }

  get lastPlayerMoveQualityLabel(): string | null {
    return this.lastPlayerMoveQuality ? DISPLAY_BUCKET_LABELS[this.lastPlayerMoveQuality] : null;
  }

  get lastPlayerMoveQualityColor(): string | null {
    return this.lastPlayerMoveQuality ? DISPLAY_BUCKET_COLORS[this.lastPlayerMoveQuality] : null;
  }

  private wait(delayMs: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, delayMs);
    });
  }

  private beginSessionState(options: {
    gameSessionId: string;
    gameStartFen: string;
    resetBrilliantTracking: boolean;
    historyAnnotations?: MoveAnnotation[];
    redoAnnotations?: MoveAnnotation[];
  }): void {
    this.gameSessionId = options.gameSessionId;
    this.gameStartFen = options.gameStartFen;
    this.historyAnnotations = [...(options.historyAnnotations ?? [])];
    this.redoAnnotations = [...(options.redoAnnotations ?? [])];
    this.redoStack = this.createRedoStackFromAnnotations(this.redoAnnotations);
    if (options.resetBrilliantTracking) {
      featureOptionsViewModel.resetBrilliantTracking(this.gameSessionId);
    } else {
      this.syncBrilliantTrackingFromAnnotations();
    }
  }

  private clearRedoState(): void {
    this.redoStack = [];
    this.redoAnnotations = [];
  }

  private createMoveAnnotation(
    move: Move & { before?: string; after?: string },
    consumedBrilliant: boolean,
  ): MoveAnnotation {
    return {
      beforeFen: move.before ?? this.fen,
      afterFen: move.after ?? this.chess.fen(),
      uci: `${move.from}${move.to}${move.promotion || ''}`,
      moveNumber: this.chess.moveNumber(),
      consumedBrilliant,
    };
  }

  private recordMoveAnnotation(
    move: Move & { before?: string; after?: string },
    consumedBrilliant: boolean,
  ): void {
    this.historyAnnotations.push(this.createMoveAnnotation(move, consumedBrilliant));
    this.syncBrilliantTrackingFromAnnotations();
  }

  private syncBrilliantTrackingFromAnnotations(): void {
    const usage = deriveBrilliantUsage(this.historyAnnotations);
    featureOptionsViewModel.reconcileBrilliantTracking(
      this.gameSessionId,
      usage.brilliantMoveNumbers,
    );
  }

  private undoMoves(count: number): boolean {
    const undoneMoves: Move[] = [];
    const undoneAnnotations: MoveAnnotation[] = [];

    for (let index = 0; index < count; index += 1) {
      const move = this.chess.undo();
      if (!move) {
        for (let restoreIndex = undoneMoves.length - 1; restoreIndex >= 0; restoreIndex -= 1) {
          const restoreMove = undoneMoves[restoreIndex];
          this.chess.move({
            from: restoreMove.from as Square,
            to: restoreMove.to as Square,
            promotion: restoreMove.promotion,
          });
        }
        return false;
      }

      undoneMoves.push(move);
      const annotation = this.historyAnnotations.pop();
      if (annotation) {
        undoneAnnotations.push(annotation);
      }
    }

    this.redoStack.push(...undoneMoves);
    this.redoAnnotations.push(...undoneAnnotations);
    this.syncBrilliantTrackingFromAnnotations();
    return true;
  }

  private readPersistedBoardState(): PersistedBoardState | null {
    try {
      if (!featureOptionsViewModel.persistEngineConfig) {
        return null;
      }

      const saved = localStorage.getItem(this.BOARD_STATE_STORAGE_KEY);
      if (!saved) {
        return null;
      }

      const parsed = JSON.parse(saved) as Partial<PersistedBoardState>;
      return {
        currentFen: parsed.currentFen ?? '',
        fenHistory: Array.isArray(parsed.fenHistory) ? parsed.fenHistory : [],
        gameSessionId: parsed.gameSessionId ?? createGameSessionId(),
        gameStartFen: parsed.gameStartFen ?? parsed.currentFen ?? new Chess().fen(),
        historyAnnotations: Array.isArray(parsed.historyAnnotations) ? parsed.historyAnnotations : [],
        redoAnnotations: Array.isArray(parsed.redoAnnotations) ? parsed.redoAnnotations : [],
      };
    } catch {
      return null;
    }
  }

  private clearPersistedBoardState(): void {
    try {
      localStorage.removeItem(this.BOARD_STATE_STORAGE_KEY);
    } catch (error) {
      logger.error('Failed to clear board state storage:', error);
    }
  }

  private createRedoStackFromAnnotations(annotations: MoveAnnotation[]): Move[] {
    return annotations.map((annotation) => ({
      from: annotation.uci.slice(0, 2),
      to: annotation.uci.slice(2, 4),
      promotion: annotation.uci.length > 4 ? annotation.uci[4] : undefined,
    })) as Move[];
  }
}

// Singleton instance
export const boardViewModel = new BoardViewModel();
