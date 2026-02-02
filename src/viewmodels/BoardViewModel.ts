/**
 * Board ViewModel
 * ViewModel layer - MobX store for chess board state
 */

import { makeAutoObservable, action, runInAction } from 'mobx';
import { Chess, Move, Square } from 'chess.js';
import { engineViewModel } from './EngineViewModel';
import { configViewModel } from './ConfigViewModel';
import { PickedMoveResult, MoveBucket, BUCKET_LABELS } from '../engine/types';

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
  private redoStack: Move[] = []; // Stack of moves that were undone for redo functionality

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
    });
    
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
      await engineViewModel.analyzePosition(
        this.fen,
        configViewModel.depth,
        configViewModel.multiPV
      );

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
    log('[BoardViewModel] updateState - FEN:', this.fen, 'History length:', this.history.length);
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
