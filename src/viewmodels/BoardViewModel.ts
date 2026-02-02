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

  constructor() {
    makeAutoObservable(this, {
      loadFen: action,
      loadPgn: action,
      makeMove: action,
      makeMoveSync: action,
      solveNextMove: action,
      reset: action,
      undo: action,
      setAutoPlay: action,
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
   * Load a position from FEN string
   */
  loadFen(fen: string): boolean {
    try {
      log('[BoardViewModel] loadFen called:', fen);
      const newChess = new Chess(fen);
      this.chess = newChess;
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
   * Make a move synchronously (for immediate UI update)
   * This is called from the drag handler to update the board immediately
   */
  makeMoveSync(from: Square, to: Square, promotion?: string): boolean {
    log('[BoardViewModel] makeMoveSync called', { from, to, promotion, currentTurn: this.chess.turn() });
    
    try {
      // Check if it's the correct turn
      const piece = this.chess.get(from);
      if (!piece) {
        log('[BoardViewModel] No piece at source square');
        return false;
      }
      
      const isWhitePiece = piece.color === 'w';
      const isWhiteTurn = this.chess.turn() === 'w';
      
      if (isWhitePiece !== isWhiteTurn) {
        log('[BoardViewModel] Wrong turn - piece color:', piece.color, 'current turn:', this.chess.turn());
        return false;
      }
      
      const move = this.chess.move({
        from,
        to,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });

      if (move) {
        log('[BoardViewModel] Move successful:', move.san);
        this.updateState();
        this.lastMove = { from, to };
        this.lastPlayedBucket = null;
        this.statusMessage = `You played: ${move.san}`;
        engineViewModel.reset();
        
        // Trigger auto-play asynchronously in the background
        if (this.autoPlayEnabled && !this.isGameOver) {
          log('[BoardViewModel] Scheduling auto-play...');
          // Use requestIdleCallback or setTimeout to not block
          setTimeout(() => {
            this.solveNextMove().catch(err => {
              console.error('[BoardViewModel] Auto-play error:', err);
            });
          }, 300);
        }
        
        return true;
      } else {
        log('[BoardViewModel] Move failed - chess.js returned null');
        return false;
      }
    } catch (err) {
      console.error('[BoardViewModel] makeMoveSync exception:', err);
      return false;
    }
  }

  /**
   * Make a move on the board (async version for programmatic use)
   * @param skipAutoPlay - If true, skip auto-playing engine move (used by engine itself)
   */
  async makeMove(from: Square, to: Square, promotion?: string, skipAutoPlay: boolean = false): Promise<boolean> {
    // For drag and drop, use sync version for immediate feedback
    if (!skipAutoPlay) {
      return this.makeMoveSync(from, to, promotion);
    }
    
    // For engine moves, use async version
    log('[BoardViewModel] makeMove (async) called', { from, to, promotion });
    
    try {
      const piece = this.chess.get(from);
      if (!piece) {
        return false;
      }
      
      const isWhitePiece = piece.color === 'w';
      const isWhiteTurn = this.chess.turn() === 'w';
      
      if (isWhitePiece !== isWhiteTurn) {
        return false;
      }
      
      const move = this.chess.move({
        from,
        to,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });

      if (move) {
        this.updateState();
        this.lastMove = { from, to };
        this.lastPlayedBucket = null;
        this.statusMessage = `Engine played: ${move.san}`;
        engineViewModel.reset();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[BoardViewModel] makeMove exception:', err);
      return false;
    }
  }

  /**
   * Make a move from UCI notation (e.g., "e2e4")
   * This is used by the engine, so it doesn't trigger auto-play
   */
  async makeMoveUCI(uci: string): Promise<boolean> {
    if (uci.length < 4) return false;
    
    const from = uci.slice(0, 2) as Square;
    const to = uci.slice(2, 4) as Square;
    const promotion = uci.length > 4 ? uci[4] : undefined;
    
    // Skip auto-play when engine makes a move
    return await this.makeMove(from, to, promotion, true);
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
        // Apply the picked move (without triggering auto-play)
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
    this.updateState();
    this.lastMove = null;
    this.lastPlayedBucket = null;
    this.statusMessage = 'Board reset';
    engineViewModel.reset();
    log('[BoardViewModel] Board reset, new FEN:', this.fen);
  }

  /**
   * Undo the last move (or last two moves if auto-play is on)
   */
  undo(): boolean {
    log('[BoardViewModel] undo called, history length:', this.history.length);
    
    // If auto-play is enabled, undo both the engine move and the human move
    if (this.autoPlayEnabled && this.history.length >= 2) {
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
      // Undo just one move
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
   * Check if undo is available
   */
  get canUndo(): boolean {
    return this.history.length > 0;
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
