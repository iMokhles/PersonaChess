/**
 * Board ViewModel
 * ViewModel layer - MobX store for chess board state
 */

import { makeAutoObservable, action, runInAction } from 'mobx';
import { Chess, Move, Square } from 'chess.js';
import { engineViewModel } from './EngineViewModel';
import { configViewModel } from './ConfigViewModel';
import { PickedMoveResult, MoveBucket, BUCKET_LABELS } from '../engine/types';

export class BoardViewModel {
  private chess: Chess = new Chess();
  fen: string = this.chess.fen();
  history: Move[] = [];
  lastMove: { from: Square; to: Square } | null = null;
  lastPlayedBucket: MoveBucket | null = null;
  statusMessage: string = 'Ready';
  isThinking: boolean = false;

  constructor() {
    makeAutoObservable(this, {
      loadFen: action,
      loadPgn: action,
      makeMove: action,
      solveNextMove: action,
      reset: action,
      undo: action,
    });
    
    console.log('[BoardViewModel] Initialized with FEN:', this.fen);
  }

  /**
   * Load a position from FEN string
   */
  loadFen(fen: string): boolean {
    try {
      console.log('[BoardViewModel] loadFen called:', fen);
      const newChess = new Chess(fen);
      this.chess = newChess;
      this.updateState();
      this.statusMessage = 'Position loaded';
      engineViewModel.reset();
      console.log('[BoardViewModel] FEN loaded successfully');
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
      console.log('[BoardViewModel] loadPgn called');
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
   * Make a move on the board
   */
  makeMove(from: Square, to: Square, promotion?: string): boolean {
    console.log('[BoardViewModel] makeMove called', { from, to, promotion, currentTurn: this.chess.turn() });
    
    try {
      // Check if it's the correct turn
      const piece = this.chess.get(from);
      if (!piece) {
        console.log('[BoardViewModel] No piece at source square');
        return false;
      }
      
      const isWhitePiece = piece.color === 'w';
      const isWhiteTurn = this.chess.turn() === 'w';
      
      if (isWhitePiece !== isWhiteTurn) {
        console.log('[BoardViewModel] Wrong turn - piece color:', piece.color, 'current turn:', this.chess.turn());
        return false;
      }
      
      // Get legal moves for debugging
      const legalMoves = this.chess.moves({ square: from, verbose: true });
      console.log('[BoardViewModel] Legal moves from', from, ':', legalMoves.map(m => m.to));
      
      const move = this.chess.move({
        from,
        to,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });

      if (move) {
        console.log('[BoardViewModel] Move successful:', move.san, move);
        this.updateState();
        this.lastMove = { from, to };
        this.lastPlayedBucket = null;
        this.statusMessage = `Played: ${move.san}`;
        engineViewModel.reset();
        console.log('[BoardViewModel] State updated, new FEN:', this.fen);
        return true;
      } else {
        console.log('[BoardViewModel] Move failed - chess.js returned null');
        return false;
      }
    } catch (err) {
      console.error('[BoardViewModel] makeMove exception:', err);
      return false;
    }
  }

  /**
   * Make a move from UCI notation (e.g., "e2e4")
   */
  makeMoveUCI(uci: string): boolean {
    if (uci.length < 4) return false;
    
    const from = uci.slice(0, 2) as Square;
    const to = uci.slice(2, 4) as Square;
    const promotion = uci.length > 4 ? uci[4] : undefined;
    
    return this.makeMove(from, to, promotion);
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
        this.statusMessage = 'Analyzing position...';
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
        this.makeMoveUCI(result.move.move);
        
        runInAction(() => {
          this.lastPlayedBucket = result.bucket;
          this.statusMessage = `Played: ${BUCKET_LABELS[result.bucket]} move`;
        });

        return result;
      } else {
        runInAction(() => {
          this.statusMessage = 'No moves available';
        });
        return null;
      }
    } catch (err) {
      runInAction(() => {
        this.statusMessage = `Error: ${err}`;
      });
      return null;
    } finally {
      runInAction(() => {
        this.isThinking = false;
      });
    }
  }

  /**
   * Reset the board to starting position
   */
  reset(): void {
    console.log('[BoardViewModel] reset called');
    this.chess = new Chess();
    this.updateState();
    this.lastMove = null;
    this.lastPlayedBucket = null;
    this.statusMessage = 'Board reset';
    engineViewModel.reset();
    console.log('[BoardViewModel] Board reset, new FEN:', this.fen);
  }

  /**
   * Undo the last move
   */
  undo(): boolean {
    const move = this.chess.undo();
    if (move) {
      this.updateState();
      this.lastMove = null;
      this.lastPlayedBucket = null;
      this.statusMessage = 'Move undone';
      engineViewModel.reset();
      return true;
    }
    return false;
  }

  /**
   * Update internal state from chess instance
   */
  private updateState(): void {
    this.fen = this.chess.fen();
    this.history = this.chess.history({ verbose: true });
    console.log('[BoardViewModel] updateState - FEN:', this.fen, 'History length:', this.history.length);
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
   * Export current game as PGN
   */
  get pgn(): string {
    return this.chess.pgn();
  }
}

// Singleton instance
export const boardViewModel = new BoardViewModel();
