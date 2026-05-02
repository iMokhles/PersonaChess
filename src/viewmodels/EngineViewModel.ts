/**
 * Engine ViewModel
 * ViewModel layer - MobX store for Stockfish engine state
 */

import { makeAutoObservable, action, runInAction } from 'mobx';
import {
  AnalysisPurpose,
  AnalysisSnapshot,
  isStaleAnalysisRequest,
} from '../engine/analysisSafety';
import { stockfishService } from '../engine/stockfish.service';
import { classifyMoves, getMoveStats, groupMovesByBucket } from '../engine/moveClassifier';
import {
  pickBucketLegacy,
  pickBucketWithClosestFallback,
  pickRandomMoveFromBucket,
} from '../engine/movePicker';
import { 
  AnalyzedMove,
  ClassifiedMove, 
  PickedMoveResult, 
  MoveBucket,
  BucketConfig,
} from '../engine/types';
import { analysisCache, buildAnalysisCacheKey } from '../engine/analysisCache';
import { featureOptionsViewModel } from './FeatureOptionsViewModel';
import { getBrilliantMoveCandidates, pickBrilliantMove } from '../engine/brilliantMove';
import { detectGamePhase } from '../engine/gamePhase';
import {
  adjustBucketConfigForComplexity,
  calculatePositionComplexity,
  PositionComplexityResult,
} from '../engine/positionComplexity';
import {
  applyPersonaBucketBias,
  pickPersonaBiasedMove,
} from '../engine/personaBias';
import {
  buildDeterministicSeed,
  createLegacyRandomSource,
  createSeededRandomSource,
} from '../engine/random';
import { PersonaId } from '../engine/featureOptions';
import { createDebugLogger } from '../shared/debug';

interface MoveSelectionContext {
  fen: string;
  gameStartFen: string;
  moveCount: number;
  sideToMove: 'w' | 'b';
  persona: PersonaId;
}

export interface PositionAnalysisResult extends AnalysisSnapshot<ClassifiedMove[]> {
  complexity: PositionComplexityResult;
  ignored: boolean;
  fromCache: boolean;
  purpose: AnalysisPurpose;
}

interface ActiveAnalysisRun {
  cacheKey: string;
  fen: string;
  purpose: AnalysisPurpose;
  promise: Promise<PositionAnalysisResult>;
}

const logger = createDebugLogger('EngineViewModel');

function canUseBrilliantMoveBudget(moveCount: number, fen: string): boolean {
  if (!featureOptionsViewModel.useBrilliantMoveBudget) {
    return false;
  }

  if (!featureOptionsViewModel.hasRemainingBrilliantMoves) {
    return false;
  }

  if (featureOptionsViewModel.brilliantMovesPerGame === 0) {
    return false;
  }

  const phase = detectGamePhase(fen, moveCount).phase;
  return featureOptionsViewModel.brilliantAllowedPhase === 'any'
    || featureOptionsViewModel.brilliantAllowedPhase === phase;
}

export class EngineViewModel {
  isInitialized = false;
  isInitializing = false;
  isAnalyzing = false;
  analyzedMoves: ClassifiedMove[] = [];
  lastPickedMove: PickedMoveResult | null = null;
  error: string | null = null;
  lastComplexity: PositionComplexityResult | null = null;
  lastAnalysisFromCache = false;
  lastAnalysisPurpose: AnalysisPurpose | null = null;
  private nextRequestIds: Record<AnalysisPurpose, number> = {
    engineMove: 0,
    background: 0,
  };
  private latestRequestIds: Record<AnalysisPurpose, number> = {
    engineMove: 0,
    background: 0,
  };
  private activeAnalysisRun: ActiveAnalysisRun | null = null;

  constructor() {
    makeAutoObservable(this, {
      initialize: action,
      analyzePosition: action,
      pickMoveFromAnalysis: action,
      reset: action,
      setError: action,
    });
    
    logger.debug('Initialized');
  }

  /**
   * Initialize the Stockfish engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.debug('Already initialized');
      return;
    }

    try {
      runInAction(() => {
        this.error = null;
        this.isInitializing = true;
      });
      await stockfishService.initialize();
      
      runInAction(() => {
        this.isInitialized = true;
        this.isInitializing = false;
      });
      logger.debug('Initialization complete');
    } catch (err) {
      logger.error('Initialization error:', err);
      runInAction(() => {
        this.error = `Failed to initialize engine: ${err}`;
        this.isInitializing = false;
      });
      throw err;
    }
  }

  /**
   * Configure engine settings
   */
  configure(options: { multiPV?: number; depth?: number }): void {
    logger.debug('Configuring:', options);
    stockfishService.configure(options);
  }

  /**
   * Analyze a position and classify moves
   */
  async analyzePosition(
    fen: string,
    depth = 20,
    multiPV = 12,
    purpose: AnalysisPurpose = 'background',
  ): Promise<PositionAnalysisResult> {
    logger.debug('analyzePosition called', { fen, depth, multiPV, purpose });
    
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const cacheKey = buildAnalysisCacheKey(fen, depth, multiPV);
      const requestId = ++this.nextRequestIds[purpose];
      this.latestRequestIds[purpose] = requestId;

      if (this.activeAnalysisRun) {
        if (this.activeAnalysisRun.cacheKey === cacheKey) {
          const sharedResult = await this.activeAnalysisRun.promise;
          return {
            ...sharedResult,
            requestId,
            purpose,
            ignored: isStaleAnalysisRequest(requestId, this.latestRequestIds[purpose]) || sharedResult.ignored,
          };
        }

        if (purpose === 'engineMove') {
          this.latestRequestIds[this.activeAnalysisRun.purpose] += 1;
          stockfishService.stop();
          await this.activeAnalysisRun.promise.catch(() => undefined);
        }

        if (purpose === 'background') {
          await this.activeAnalysisRun.promise.catch(() => undefined);
        }
      }

      runInAction(() => {
        this.isAnalyzing = true;
        this.error = null;
        if (purpose === 'engineMove') {
          this.analyzedMoves = [];
          this.lastPickedMove = null;
        }
      });

      const runPromise = this.performPositionAnalysis({
        fen,
        depth,
        multiPV,
        cacheKey,
        requestId,
        purpose,
      });
      this.activeAnalysisRun = {
        cacheKey,
        fen,
        purpose,
        promise: runPromise,
      };

      try {
        return await runPromise;
      } finally {
        if (this.activeAnalysisRun?.promise === runPromise) {
          this.activeAnalysisRun = null;
        }
      }
    } catch (err) {
      logger.error('Analysis error:', err);
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
  pickMoveFromAnalysis(
    analysis: PositionAnalysisResult,
    config: BucketConfig,
    context: MoveSelectionContext,
  ): PickedMoveResult | null {
    logger.debug('pickMoveFromAnalysis called', {
      analyzedMovesCount: analysis.moves.length,
      config 
    });
    
    if (analysis.ignored || analysis.moves.length === 0) {
      logger.debug('No analyzed moves available');
      return null;
    }

    const randomSource = featureOptionsViewModel.useDeterministicRng
      ? createSeededRandomSource(
          buildDeterministicSeed({
            gameStartFen: context.gameStartFen,
            currentFen: context.fen,
            moveCount: context.moveCount,
            sideToMove: context.sideToMove,
            persona: context.persona,
          }),
        )
      : createLegacyRandomSource();

    let effectiveConfig: BucketConfig = { ...config };

    if (featureOptionsViewModel.usePositionComplexity) {
      effectiveConfig = adjustBucketConfigForComplexity(effectiveConfig, analysis.complexity);
    }

    if (featureOptionsViewModel.usePersonaBehaviorBias) {
      effectiveConfig = applyPersonaBucketBias(effectiveConfig, context.persona) as BucketConfig;
    }

    if (canUseBrilliantMoveBudget(context.moveCount, context.fen)) {
      const brilliantCandidates = getBrilliantMoveCandidates(context.fen, analysis.moves);
      const shouldPickBrilliant = brilliantCandidates.length > 0 && randomSource.next() < 0.35;

      if (shouldPickBrilliant) {
        const brilliantMove = pickBrilliantMove(brilliantCandidates, randomSource);

        if (brilliantMove) {
          const brilliantResult = {
            move: brilliantMove,
            bucket: brilliantMove.bucket,
            isBrilliant: true,
          };

          runInAction(() => {
            this.lastPickedMove = brilliantResult;
          });

          return brilliantResult;
        }
      }
    }

    const bucketSelection = featureOptionsViewModel.useImprovedMoveClassification
      ? pickBucketWithClosestFallback(analysis.moves, effectiveConfig, () => randomSource.next())
      : pickBucketLegacy(analysis.moves, effectiveConfig, () => randomSource.next());

    if (!bucketSelection) {
      return null;
    }

    const selectedMove = featureOptionsViewModel.usePersonaBehaviorBias
      ? pickPersonaBiasedMove(context.fen, bucketSelection.moves, context.persona, randomSource)
      : pickRandomMoveFromBucket(bucketSelection, () => randomSource.next());

    const result = {
      move: selectedMove,
      bucket: bucketSelection.bucket,
      isBrilliant: false,
    };
    logger.debug('Picked move:', result);
    
    runInAction(() => {
      this.lastPickedMove = result;
    });

    return result;
  }

  /**
   * Stop current analysis
   */
  stopAnalysis(): void {
    logger.debug('stopAnalysis called');
    stockfishService.stop();
    runInAction(() => {
      this.isAnalyzing = false;
    });
    this.invalidatePendingRequests();
    this.activeAnalysisRun = null;
  }

  /**
   * Start a new game
   */
  newGame(): void {
    logger.debug('newGame called');
    stockfishService.newGame();
    this.reset();
  }

  /**
   * Reset state
   */
  reset(): void {
    logger.debug('reset called');
    stockfishService.stop();
    this.invalidatePendingRequests();
    this.activeAnalysisRun = null;
    this.analyzedMoves = [];
    this.lastPickedMove = null;
    this.lastComplexity = null;
    this.lastAnalysisFromCache = false;
    this.lastAnalysisPurpose = null;
    this.error = null;
    this.isAnalyzing = false;
    this.isInitializing = false;
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
    logger.debug('destroy called');
    stockfishService.destroy();
    runInAction(() => {
      this.isInitialized = false;
    });
  }

  private async performPositionAnalysis(options: {
    fen: string;
    depth: number;
    multiPV: number;
    cacheKey: string;
    requestId: number;
    purpose: AnalysisPurpose;
  }): Promise<PositionAnalysisResult> {
    const { fen, depth, multiPV, cacheKey, requestId, purpose } = options;
    let cachedClassifiedMoves: ClassifiedMove[] | undefined;
    let fromCache = false;
    let moves: AnalyzedMove[] = [];

    if (featureOptionsViewModel.useMoveAnalysisCache) {
      const cached = analysisCache.get(cacheKey);
      if (cached) {
        moves = cached.moves;
        cachedClassifiedMoves = cached.classifiedMoves;
        fromCache = true;
      }
    }

    if (moves.length === 0) {
      stockfishService.configure({ depth, multiPV });
      logger.debug('Starting analysis...');
      moves = await stockfishService.analyzePosition(fen);
      logger.debug('Analysis complete, got', moves.length, 'moves');

      if (featureOptionsViewModel.useMoveAnalysisCache) {
        analysisCache.set({
          key: cacheKey,
          moves,
          timestamp: Date.now(),
        });
      }
    } else {
      logger.debug('Using cached analysis for current position');
    }

    const classified = cachedClassifiedMoves ?? classifyMoves(moves);
    const complexity = calculatePositionComplexity(moves);
    const ignored = isStaleAnalysisRequest(requestId, this.latestRequestIds[purpose]);

    if (featureOptionsViewModel.useMoveAnalysisCache && moves.length > 0) {
      analysisCache.set({
        key: cacheKey,
        moves,
        classifiedMoves: classified,
        timestamp: Date.now(),
      });
    }

    if (!ignored) {
      runInAction(() => {
        this.lastAnalysisFromCache = fromCache;
        this.lastAnalysisPurpose = purpose;
        if (purpose === 'engineMove') {
          this.analyzedMoves = classified;
          this.lastComplexity = complexity;
        }
        this.isAnalyzing = false;
      });
    } else if (this.activeAnalysisRun?.purpose === purpose) {
      runInAction(() => {
        this.isAnalyzing = false;
      });
    }

    return {
      requestId,
      analyzedFen: fen,
      moves: classified,
      complexity,
      ignored,
      fromCache,
      purpose,
    };
  }

  get analysisStatusLabel(): string {
    if (this.error) {
      return 'Engine error';
    }

    if (this.isInitializing) {
      return 'Starting engine';
    }

    if (this.isAnalyzing) {
      return this.lastAnalysisPurpose === 'background'
        ? 'Running background analysis'
        : 'Analyzing position';
    }

    if (!this.isInitialized) {
      return 'Not initialized';
    }

    if (this.lastAnalysisPurpose === null) {
      return 'Ready';
    }

    return this.lastAnalysisFromCache ? 'Ready (cache warm)' : 'Ready';
  }

  private invalidatePendingRequests(): void {
    this.latestRequestIds.engineMove = ++this.nextRequestIds.engineMove;
    this.latestRequestIds.background = ++this.nextRequestIds.background;
  }
}

// Singleton instance
export const engineViewModel = new EngineViewModel();
