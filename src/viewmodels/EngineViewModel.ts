/**
 * Engine ViewModel
 * ViewModel layer - MobX store for Stockfish engine state
 */

import { makeAutoObservable, action, runInAction } from 'mobx';
import { stockfishService } from '../engine/stockfish.service';
import { classifyMoves } from '../engine/moveClassifier';
import { pickMove } from '../engine/movePicker';
import { 
  ClassifiedMove, 
  PickedMoveResult, 
  MoveBucket,
  BucketConfig 
} from '../engine/types';
import { getMoveStats, groupMovesByBucket } from '../engine/moveClassifier';

export class EngineViewModel {
  isInitialized: boolean = false;
  isAnalyzing: boolean = false;
  analyzedMoves: ClassifiedMove[] = [];
  lastPickedMove: PickedMoveResult | null = null;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      initialize: action,
      analyzePosition: action,
      pickMoveFromBuckets: action,
      reset: action,
      setError: action,
    });
  }

  /**
   * Initialize the Stockfish engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.error = null;
      await stockfishService.initialize();
      runInAction(() => {
        this.isInitialized = true;
      });
    } catch (err) {
      runInAction(() => {
        this.error = `Failed to initialize engine: ${err}`;
      });
      throw err;
    }
  }

  /**
   * Configure engine settings
   */
  configure(options: { multiPV?: number; depth?: number }): void {
    stockfishService.configure(options);
  }

  /**
   * Analyze a position and classify moves
   */
  async analyzePosition(fen: string, depth: number = 20, multiPV: number = 12): Promise<ClassifiedMove[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      runInAction(() => {
        this.isAnalyzing = true;
        this.error = null;
        this.analyzedMoves = [];
        this.lastPickedMove = null;
      });

      // Configure engine
      stockfishService.configure({ depth, multiPV });

      // Analyze position
      const moves = await stockfishService.analyzePosition(fen);
      
      // Classify moves
      const classified = classifyMoves(moves);

      runInAction(() => {
        this.analyzedMoves = classified;
        this.isAnalyzing = false;
      });

      return classified;
    } catch (err) {
      runInAction(() => {
        this.error = `Analysis failed: ${err}`;
        this.isAnalyzing = false;
      });
      throw err;
    }
  }

  /**
   * Pick a move from the analyzed moves using bucket configuration
   */
  pickMoveFromBuckets(config: BucketConfig): PickedMoveResult | null {
    if (this.analyzedMoves.length === 0) return null;

    const result = pickMove(this.analyzedMoves, config);
    
    runInAction(() => {
      this.lastPickedMove = result;
    });

    return result;
  }

  /**
   * Stop current analysis
   */
  stopAnalysis(): void {
    stockfishService.stop();
    runInAction(() => {
      this.isAnalyzing = false;
    });
  }

  /**
   * Start a new game
   */
  newGame(): void {
    stockfishService.newGame();
    this.reset();
  }

  /**
   * Reset state
   */
  reset(): void {
    this.analyzedMoves = [];
    this.lastPickedMove = null;
    this.error = null;
  }

  /**
   * Set error message
   */
  setError(message: string | null): void {
    this.error = message;
  }

  /**
   * Get move statistics by bucket
   */
  get moveStats(): Record<MoveBucket, number> {
    return getMoveStats(this.analyzedMoves);
  }

  /**
   * Get moves grouped by bucket
   */
  get movesByBucket(): Map<MoveBucket, ClassifiedMove[]> {
    return groupMovesByBucket(this.analyzedMoves);
  }

  /**
   * Get the best move (if available)
   */
  get bestMove(): ClassifiedMove | null {
    return this.analyzedMoves.length > 0 ? this.analyzedMoves[0] : null;
  }

  /**
   * Check if there are analyzed moves
   */
  get hasAnalyzedMoves(): boolean {
    return this.analyzedMoves.length > 0;
  }

  /**
   * Destroy the engine
   */
  destroy(): void {
    stockfishService.destroy();
    runInAction(() => {
      this.isInitialized = false;
    });
  }
}

// Singleton instance
export const engineViewModel = new EngineViewModel();
