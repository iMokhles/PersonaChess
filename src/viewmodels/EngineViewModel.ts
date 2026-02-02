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
    
    console.log('[EngineViewModel] Initialized');
  }

  /**
   * Initialize the Stockfish engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[EngineViewModel] Already initialized');
      return;
    }

    console.log('[EngineViewModel] Starting initialization...');
    
    try {
      this.error = null;
      console.log('[EngineViewModel] Calling stockfishService.initialize()...');
      await stockfishService.initialize();
      console.log('[EngineViewModel] Stockfish service initialized');
      
      runInAction(() => {
        this.isInitialized = true;
      });
      
      console.log('[EngineViewModel] Initialization complete');
    } catch (err) {
      console.error('[EngineViewModel] Initialization error:', err);
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
    console.log('[EngineViewModel] Configuring:', options);
    stockfishService.configure(options);
  }

  /**
   * Analyze a position and classify moves
   */
  async analyzePosition(fen: string, depth: number = 20, multiPV: number = 12): Promise<ClassifiedMove[]> {
    console.log('[EngineViewModel] analyzePosition called', { fen, depth, multiPV });
    
    if (!this.isInitialized) {
      console.log('[EngineViewModel] Not initialized, initializing now...');
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
      console.log('[EngineViewModel] Starting analysis...');
      const moves = await stockfishService.analyzePosition(fen);
      console.log('[EngineViewModel] Analysis complete, got', moves.length, 'moves');
      
      // Classify moves
      const classified = classifyMoves(moves);
      console.log('[EngineViewModel] Classified', classified.length, 'moves');

      runInAction(() => {
        this.analyzedMoves = classified;
        this.isAnalyzing = false;
      });

      return classified;
    } catch (err) {
      console.error('[EngineViewModel] Analysis error:', err);
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
    console.log('[EngineViewModel] pickMoveFromBuckets called', { 
      analyzedMovesCount: this.analyzedMoves.length,
      config 
    });
    
    if (this.analyzedMoves.length === 0) {
      console.log('[EngineViewModel] No analyzed moves available');
      return null;
    }

    const result = pickMove(this.analyzedMoves, config);
    console.log('[EngineViewModel] Picked move:', result);
    
    runInAction(() => {
      this.lastPickedMove = result;
    });

    return result;
  }

  /**
   * Stop current analysis
   */
  stopAnalysis(): void {
    console.log('[EngineViewModel] stopAnalysis called');
    stockfishService.stop();
    runInAction(() => {
      this.isAnalyzing = false;
    });
  }

  /**
   * Start a new game
   */
  newGame(): void {
    console.log('[EngineViewModel] newGame called');
    stockfishService.newGame();
    this.reset();
  }

  /**
   * Reset state
   */
  reset(): void {
    console.log('[EngineViewModel] reset called');
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
    console.log('[EngineViewModel] destroy called');
    stockfishService.destroy();
    runInAction(() => {
      this.isInitialized = false;
    });
  }
}

// Singleton instance
export const engineViewModel = new EngineViewModel();
