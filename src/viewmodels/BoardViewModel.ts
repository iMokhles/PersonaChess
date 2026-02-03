/**
 * Board ViewModel
 * ViewModel layer - MobX store for chess board state
 */

import { makeAutoObservable, action, runInAction } from 'mobx';
import { Chess, Move, Square } from 'chess.js';
import { engineViewModel } from './EngineViewModel';
import { configViewModel } from './ConfigViewModel';
import { PickedMoveResult, MoveBucket, BUCKET_LABELS, BUCKET_COLORS } from '../engine/types';

// Set to true for debugging, false for production
const DEBUG = false;

const log = (...args: any[]) => {
  if (DEBUG) console.log(...args);
};

export class BoardViewModel {
  private chess: Chess = new Chess();
  fen: string = this.chess.fen();
  history: Move[] = [];
  lastMove: { from: Square; to: Square } | null = null;
  lastPlayedBucket: MoveBucket | null = null;
  statusMessage: string = 'Ready';
  isThinking: boolean = false;
  autoPlayEnabled: boolean = true; // Auto-play engine moves after human moves
  enginePlaysFor: 'w' | 'b' = 'b'; // Which side the engine plays for (default: black)
  boardFlipped: boolean = false; // Board orientation (false = white on bottom, true = black on bottom)
  showMoveArrows: boolean = false; // Show arrows for all possible moves
  showArrowsForSide: 'current' | 'player' | 'engine' = 'current'; // Which side's moves to show arrows for
  lastPlayerMoveQuality: MoveBucket | null = null; // Quality of the last player move
  isAnalyzingMoves: boolean = false; // Whether we're currently analyzing moves
  
  // Store analyzed moves as an object for MobX observability
  private _analyzedLegalMoves: Record<string, MoveBucket> = {};
  private redoStack: Move[] = []; // Stack of moves that were undone for redo functionality
  private readonly FEN_STORAGE_KEY = 'personachess_current_fen';
  private readonly FEN_HISTORY_KEY = 'personachess_fen_history';
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
      saveFenToHistory: action,
      loadFenFromHistory: action,
      toggleMoveArrows: action,
      setShowArrowsForSide: action,
      analyzeAllMoves: action,
      analyzePlayerMove: action,
    });
    
    // Try to restore FEN from localStorage on initialization
    this.restoreFenFromStorage();
    
    log('[BoardViewModel] Initialized with FEN:', this.fen);
  }

  /**
   * Set auto-play mode
   */
  setAutoPlay(enabled: boolean): void {
    this.autoPlayEnabled = enabled;
    log('[BoardViewModel] Auto-play set to:', enabled);
  }

  /**
   * Set which side the engine plays for
   */
  setEnginePlaysFor(side: 'w' | 'b'): void {
    this.enginePlaysFor = side;
    log('[BoardViewModel] Engine plays for:', side === 'w' ? 'White' : 'Black');
  }

  /**
   * Load a position from FEN string
   */
  loadFen(fen: string): boolean {
    try {
      log('[BoardViewModel] loadFen called:', fen);
      const newChess = new Chess(fen);
      this.chess = newChess;
      this.redoStack = []; // Clear redo stack
      this.updateState();
      this.statusMessage = 'Position loaded';
      engineViewModel.reset();
      log('[BoardViewModel] FEN loaded successfully');
      return true;
    } catch (err) {
      console.error('[BoardViewModel] loadFen error:', err);
      this.statusMessage = `Invalid FEN: ${err}`;
      return false;
    }
  }

  /**
   * Load a game from PGN string
   */
  loadPgn(pgn: string): boolean {
    try {
      log('[BoardViewModel] loadPgn called');
      const newChess = new Chess();
      newChess.loadPgn(pgn);
      this.chess = newChess;
      this.redoStack = []; // Clear redo stack
      this.updateState();
      this.statusMessage = 'PGN loaded';
      engineViewModel.reset();
      return true;
    } catch (err) {
      console.error('[BoardViewModel] loadPgn error:', err);
      this.statusMessage = `Invalid PGN: ${err}`;
      return false;
    }
  }

  /**
   * Make a move on the board (similar to the example pattern)
   * This is synchronous for immediate UI feedback, just like the example
   */
  makeMove(from: Square, to: Square, promotion: string = 'q'): boolean {
    log('[BoardViewModel] makeMove called', { from, to, promotion, currentFen: this.fen, currentTurn: this.chess.turn() });
    
    try {
      // Try to make the move according to chess.js logic (exactly like the example)
      // chess.js will validate the move automatically
      const move = this.chess.move({
        from,
        to,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });

      if (move) {
        log('[BoardViewModel] Move successful:', move.san);
        // Clear redo stack when a new move is made
        this.redoStack = [];
        // Update the position state to trigger a re-render (via MobX observable)
        this.updateState();
        this.lastMove = { from, to };
        this.lastPlayedBucket = null;
        this.statusMessage = `You played: ${move.san}`;
        engineViewModel.reset();
        
        // Analyze the player's move quality
        this.analyzePlayerMove(move);
        
        // Make engine move after a short delay if:
        // 1. Auto-play is enabled
        // 2. Game is not over
        // 3. It's now the engine's turn (the turn changed after the human move)
        if (this.autoPlayEnabled && !this.isGameOver && this.chess.turn() === this.enginePlaysFor) {
          log('[BoardViewModel] Scheduling auto-play for engine side:', this.enginePlaysFor);
          setTimeout(() => {
            this.solveNextMove().catch(err => {
              console.error('[BoardViewModel] Auto-play error:', err);
            });
          }, 500); // Similar delay to the example
        }
        
        // Return true as the move was successful
        return true;
      } else {
        log('[BoardViewModel] Move failed - chess.js returned null');
        // Return false as the move was not successful
        return false;
      }
    } catch (err) {
      log('[BoardViewModel] Move exception:', err);
      // Return false as the move was not successful
      return false;
    }
  }

  /**
   * Make a move from UCI notation (e.g., "e2e4")
   * Used by the engine
   */
  async makeMoveUCI(uci: string): Promise<boolean> {
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
        this.redoStack = [];
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
  async solveNextMove(): Promise<PickedMoveResult | null> {
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
      const analyzedMoves = await engineViewModel.analyzePosition(
        this.fen,
        configViewModel.depth,
        configViewModel.multiPV
      );

      // Check if analysis returned no moves (game over position)
      if (analyzedMoves.length === 0) {
        runInAction(() => {
          if (this.isCheckmate) {
            this.statusMessage = 'Checkmate! Game over.';
          } else if (this.isStalemate) {
            this.statusMessage = 'Stalemate! Game over.';
          } else if (this.isDraw) {
            this.statusMessage = 'Draw! Game over.';
          } else {
            this.statusMessage = 'No legal moves available';
          }
          this.isThinking = false;
        });
        return null;
      }

      // Pick a move based on bucket configuration
      const result = engineViewModel.pickMoveFromBuckets(configViewModel.bucketConfig);

      if (result) {
        // Apply the picked move
        const moveSuccess = await this.makeMoveUCI(result.move.move);
        
        if (moveSuccess) {
          runInAction(() => {
            this.lastPlayedBucket = result.bucket;
            this.statusMessage = `Engine played: ${BUCKET_LABELS[result.bucket]} move`;
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
      console.error('[BoardViewModel] solveNextMove error:', err);
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
    log('[BoardViewModel] reset called');
    this.chess = new Chess();
    this.redoStack = []; // Clear redo stack
    this.updateState();
    this.lastMove = null;
    this.lastPlayedBucket = null;
    this.statusMessage = 'Board reset';
    engineViewModel.reset();
    log('[BoardViewModel] Board reset, new FEN:', this.fen);
  }

  /**
   * Undo the last move (or last two moves if auto-play is on and engine just moved)
   */
  undo(): boolean {
    log('[BoardViewModel] undo called, history length:', this.history.length);
    
    // If auto-play is enabled and the last move was by the engine, undo both moves
    if (this.autoPlayEnabled && this.history.length >= 2) {
      // Check if the last move was by the engine
      const lastMove = this.history[this.history.length - 1];
      const lastMoveColor = lastMove.color;
      
      // If last move was by engine, undo both (engine move + human move)
      if (lastMoveColor === this.enginePlaysFor) {
        const move1 = this.chess.undo();
        const move2 = this.chess.undo();
        
        if (move1 && move2) {
          this.updateState();
          this.lastMove = null;
          this.lastPlayedBucket = null;
          this.statusMessage = 'Undid last 2 moves (human + engine)';
          engineViewModel.reset();
          log('[BoardViewModel] Undid 2 moves');
          return true;
        }
      } else {
        // Last move was by human, just undo one
        const move = this.chess.undo();
        if (move) {
          this.updateState();
          this.lastMove = null;
          this.lastPlayedBucket = null;
          this.statusMessage = 'Move undone';
          engineViewModel.reset();
          log('[BoardViewModel] Undid 1 move');
          return true;
        }
      }
    } else {
      // Auto-play disabled or not enough moves, undo just one move
      const move = this.chess.undo();
      if (move) {
        this.updateState();
        this.lastMove = null;
        this.lastPlayedBucket = null;
        this.statusMessage = 'Move undone';
        engineViewModel.reset();
        log('[BoardViewModel] Undid 1 move');
        return true;
      }
    }
    
    log('[BoardViewModel] Undo failed - no moves to undo');
    return false;
  }

  /**
   * Update internal state from chess instance
   */
  private updateState(): void {
    this.fen = this.chess.fen();
    this.history = this.chess.history({ verbose: true });
    // Save FEN to localStorage whenever it changes
    this.saveFenToHistory();
    log('[BoardViewModel] updateState - FEN:', this.fen, 'History length:', this.history.length);
    
    // Automatically re-analyze moves if arrows are enabled
    if (this.showMoveArrows && !this.isGameOver) {
      // Clear previous analysis and trigger new analysis
      this._analyzedLegalMoves = {};
      this.analyzeAllMoves();
    }
  }

  /**
   * Flip the board orientation
   */
  flipBoard(): void {
    this.boardFlipped = !this.boardFlipped;
    log('[BoardViewModel] Board flipped, orientation:', this.boardFlipped ? 'black' : 'white');
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
      
      // Remove duplicate if it's the same as the last one
      if (history.length > 0 && history[history.length - 1] === currentFen) {
        return; // Don't add duplicate consecutive FENs
      }
      
      // Add current FEN to history
      history.push(currentFen);
      
      // Limit history size
      if (history.length > this.MAX_HISTORY) {
        history = history.slice(-this.MAX_HISTORY);
      }
      
      // Save back to localStorage
      localStorage.setItem(this.FEN_HISTORY_KEY, JSON.stringify(history));
      
      log('[BoardViewModel] Saved FEN to history, total entries:', history.length);
    } catch (err) {
      console.error('[BoardViewModel] Failed to save FEN to history:', err);
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
          this.loadFen(savedFen);
          this.statusMessage = 'Restored position from previous session';
          log('[BoardViewModel] Restored FEN from storage:', savedFen);
        } catch (err) {
          console.warn('[BoardViewModel] Saved FEN is invalid, using default:', err);
          localStorage.removeItem(this.FEN_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('[BoardViewModel] Failed to restore FEN from storage:', err);
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
      console.error('[BoardViewModel] Failed to load FEN from history:', err);
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
    this.showMoveArrows = !this.showMoveArrows;
    if (this.showMoveArrows && Object.keys(this._analyzedLegalMoves).length === 0) {
      // Auto-analyze if arrows are enabled and we don't have analysis yet
      this.analyzeAllMoves();
    }
  }

  /**
   * Set which side's moves to show arrows for
   */
  setShowArrowsForSide(side: 'current' | 'player' | 'engine'): void {
    this.showArrowsForSide = side;
    log('[BoardViewModel] Show arrows for side:', side);
    // Re-analyze if arrows are enabled
    if (this.showMoveArrows) {
      this._analyzedLegalMoves = {};
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
      const analyzedMoves = await engineViewModel.analyzePosition(
        this.fen,
        configViewModel.depth,
        configViewModel.multiPV
      );

      // Create a map of UCI moves to their quality buckets
      const moveMap: Record<string, MoveBucket> = {};
      for (const analyzedMove of analyzedMoves) {
        moveMap[analyzedMove.move] = analyzedMove.bucket;
      }

      // For moves that weren't analyzed (not in top MultiPV), classify as lower quality
      for (const move of legalMoves) {
        const uci = `${move.from}${move.to}${move.promotion || ''}`;
        if (!moveMap[uci]) {
          // Not in top moves, assume it's at least "good" or worse
          moveMap[uci] = 'good';
        }
      }

      runInAction(() => {
        this._analyzedLegalMoves = moveMap;
        this.isAnalyzingMoves = false;
      });

      log('[BoardViewModel] Analyzed', Object.keys(moveMap).length, 'legal moves');
    } catch (err) {
      console.error('[BoardViewModel] Failed to analyze moves:', err);
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
        const lastMoveInHistory = history[history.length - 1];
        const beforeFen = (lastMoveInHistory as any).before || this.fen;

        // Analyze the position before the move
        const analyzedMoves = await engineViewModel.analyzePosition(
          beforeFen,
          Math.min(configViewModel.depth, 15), // Use smaller depth for faster analysis
          configViewModel.multiPV
        );

        // Find the move in the analyzed moves
        const moveUCI = `${move.from}${move.to}${move.promotion || ''}`;
        const analyzedMove = analyzedMoves.find(m => m.move === moveUCI);
        if (analyzedMove) {
          runInAction(() => {
            this.lastPlayerMoveQuality = analyzedMove.bucket;
            const qualityLabel = BUCKET_LABELS[analyzedMove.bucket];
            this.statusMessage = `You played: ${move.san} (${qualityLabel})`;
          });
          log('[BoardViewModel] Player move quality:', analyzedMove.bucket);
        } else {
          // Move not in top moves, assume it's at least "good" or worse
          runInAction(() => {
            this.lastPlayerMoveQuality = 'good';
            this.statusMessage = `You played: ${move.san} (Good)`;
          });
        }
      } catch (err) {
        console.error('[BoardViewModel] Failed to analyze player move:', err);
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
    const isValidSquare = (square: any): square is Square => {
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
        log('[BoardViewModel] Skipping invalid move:', move);
        continue;
      }

      const uci = `${move.from}${move.to}${move.promotion || ''}`;
      const bucket = this._analyzedLegalMoves[uci];
      
      // Only include moves from allowed buckets
      if (bucket && allowedBuckets.includes(bucket) && isValidSquare(move.from) && isValidSquare(move.to)) {
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
      log(`[BoardViewModel] Added ${bucketArrows.length} ${bucket} arrows (found ${movesByBucket[bucket].length} total)`);
    }

    log('[BoardViewModel] Generated', arrows.length, 'total arrows');
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
    log('[BoardViewModel] undoSingle called, history length:', this.history.length);
    
    if (this.history.length === 0) {
      return false;
    }
    
    const move = this.chess.undo();
    if (move) {
      // Add to redo stack
      this.redoStack.push(move);
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
      log('[BoardViewModel] Undid 1 move, redo stack size:', this.redoStack.length);
      return true;
    }
    
    return false;
  }

  /**
   * Redo a single move
   */
  redoSingle(): boolean {
    log('[BoardViewModel] redoSingle called, redo stack size:', this.redoStack.length);
    
    if (this.redoStack.length === 0) {
      return false;
    }
    
    const moveToRedo = this.redoStack.pop()!;
    
    try {
      const move = this.chess.move({
        from: moveToRedo.from as Square,
        to: moveToRedo.to as Square,
        promotion: moveToRedo.promotion,
      });
      
      if (move) {
        this.updateState();
        this.lastMove = { from: move.from as Square, to: move.to as Square };
        this.lastPlayedBucket = null;
        this.statusMessage = `Redid: ${move.san}`;
        engineViewModel.reset();
        log('[BoardViewModel] Redid 1 move');
        
        // If auto-play is enabled and it's now the engine's turn, trigger auto-play
        if (this.autoPlayEnabled && !this.isGameOver && this.chess.turn() === this.enginePlaysFor) {
          log('[BoardViewModel] Scheduling auto-play after redo');
          setTimeout(() => {
            this.solveNextMove().catch(err => {
              console.error('[BoardViewModel] Auto-play error after redo:', err);
            });
          }, 500);
        }
        
        return true;
      }
    } catch (err) {
      console.error('[BoardViewModel] Redo failed:', err);
      // Put the move back on the stack if it failed
      this.redoStack.push(moveToRedo);
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

  /**
   * Export current game as PGN
   */
  get pgn(): string {
    return this.chess.pgn();
  }
}

// Singleton instance
export const boardViewModel = new BoardViewModel();
