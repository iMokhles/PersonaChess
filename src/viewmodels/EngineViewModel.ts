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
import { EngineCoordinator, engineCoordinator, EngineLane } from '../engine/engineCoordinator';
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

interface EngineViewModelDependencies {
  coordinator?: EngineCoordinator;
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
  analyzedMoves: ClassifiedMove[] = [];
  lastPickedMove: PickedMoveResult | null = null;
  error: string | null = null;
  lastComplexity: PositionComplexityResult | null = null;
  lastAnalysisFromCache = false;
  lastAnalysisPurpose: AnalysisPurpose | null = null;
  isMoveLaneAnalyzing = false;
  isBackgroundAnalyzing = false;
  private nextRequestIds: Record<AnalysisPurpose, number> = {
    engineMove: 0,
    background: 0,
  };
  private latestRequestIds: Record<AnalysisPurpose, number> = {
    engineMove: 0,
    background: 0,
  };
  private activeAnalysisRuns: Record<AnalysisPurpose, ActiveAnalysisRun | null> = {
    engineMove: null,
    background: null,
  };
  private readonly coordinator: EngineCoordinator;

  constructor(dependencies: EngineViewModelDependencies = {}) {
    this.coordinator = dependencies.coordinator ?? engineCoordinator;
    makeAutoObservable(this, {
      initialize: action,
      analyzePosition: action,
      pickMoveFromAnalysis: action,
      reset: action,
      restart: action,
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
      await this.coordinator.initialize();
      
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
    this.coordinator.configure('move', options);
    this.coordinator.configure('analysis', options);
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
    const lane = this.getLaneForPurpose(purpose);

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const cacheKey = buildAnalysisCacheKey(fen, depth, multiPV);
      const requestId = ++this.nextRequestIds[purpose];
      this.latestRequestIds[purpose] = requestId;

      const activeRun = this.activeAnalysisRuns[purpose];
      if (activeRun) {
        if (activeRun.cacheKey === cacheKey) {
          const sharedResult = await activeRun.promise;
          return {
            ...sharedResult,
            requestId,
            purpose,
            ignored: isStaleAnalysisRequest(requestId, this.latestRequestIds[purpose]) || sharedResult.ignored,
          };
        }

        if (purpose === 'engineMove') {
          this.invalidatePurposeRequest(purpose);
          this.coordinator.stop(lane);
          await activeRun.promise.catch(() => undefined);
        }

        if (purpose === 'background') {
          await activeRun.promise.catch(() => undefined);
        }
      }

      runInAction(() => {
        this.setLaneAnalyzing(purpose, true);
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
        lane,
      });
      this.activeAnalysisRuns[purpose] = {
        cacheKey,
        fen,
        purpose,
        promise: runPromise,
      };

      try {
        return await runPromise;
      } finally {
        if (this.activeAnalysisRuns[purpose]?.promise === runPromise) {
          this.activeAnalysisRuns[purpose] = null;
        }
      }
    } catch (err) {
      logger.error('Analysis error:', err);
      runInAction(() => {
        this.error = `Analysis failed: ${err}`;
        this.setLaneAnalyzing(purpose, false);
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
    this.coordinator.stop();
    runInAction(() => {
      this.isMoveLaneAnalyzing = false;
      this.isBackgroundAnalyzing = false;
    });
    this.invalidatePendingRequests();
    this.activeAnalysisRuns.engineMove = null;
    this.activeAnalysisRuns.background = null;
  }

  /**
   * Start a new game
   */
  newGame(): void {
    logger.debug('newGame called');
    this.coordinator.newGame();
    this.reset();
  }

  restart(): void {
    logger.debug('restart called');
    this.coordinator.restart();
    this.isInitialized = false;
    this.reset();
  }

  /**
   * Reset state
   */
  reset(): void {
    logger.debug('reset called');
    this.coordinator.stop();
    this.invalidatePendingRequests();
    this.activeAnalysisRuns.engineMove = null;
    this.activeAnalysisRuns.background = null;
    this.analyzedMoves = [];
    this.lastPickedMove = null;
    this.lastComplexity = null;
    this.lastAnalysisFromCache = false;
    this.lastAnalysisPurpose = null;
    this.error = null;
    this.isMoveLaneAnalyzing = false;
    this.isBackgroundAnalyzing = false;
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
    this.coordinator.destroy();
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
    lane: EngineLane;
  }): Promise<PositionAnalysisResult> {
    const { fen, depth, multiPV, cacheKey, requestId, purpose, lane } = options;
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
      this.coordinator.configure(lane, { depth, multiPV });
      logger.debug('Starting analysis...');
      moves = await this.coordinator.analyzePosition(lane, fen);
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
        this.setLaneAnalyzing(purpose, false);
      });
    } else if (this.activeAnalysisRuns[purpose]?.purpose === purpose) {
      runInAction(() => {
        this.setLaneAnalyzing(purpose, false);
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

    if (this.isMoveLaneAnalyzing) {
      return 'Analyzing position';
    }

    if (this.isBackgroundAnalyzing) {
      return 'Running background analysis';
    }

    if (!this.isInitialized) {
      return 'Not initialized';
    }

    if (this.lastAnalysisPurpose === null) {
      return 'Ready';
    }

    return this.lastAnalysisFromCache ? 'Ready (cache warm)' : 'Ready';
  }

  get isAnalyzing(): boolean {
    return this.isMoveLaneAnalyzing || this.isBackgroundAnalyzing;
  }

  get isMoveLaneBusy(): boolean {
    return this.isInitializing || this.isMoveLaneAnalyzing;
  }

  get isBackgroundLaneBusy(): boolean {
    return this.isBackgroundAnalyzing;
  }

  private invalidatePendingRequests(): void {
    this.latestRequestIds.engineMove = ++this.nextRequestIds.engineMove;
    this.latestRequestIds.background = ++this.nextRequestIds.background;
  }

  private invalidatePurposeRequest(purpose: AnalysisPurpose): void {
    this.latestRequestIds[purpose] = ++this.nextRequestIds[purpose];
  }

  private getLaneForPurpose(purpose: AnalysisPurpose): EngineLane {
    return purpose === 'engineMove' ? 'move' : 'analysis';
  }

  private setLaneAnalyzing(purpose: AnalysisPurpose, analyzing: boolean): void {
    if (purpose === 'engineMove') {
      this.isMoveLaneAnalyzing = analyzing;
      return;
    }

    this.isBackgroundAnalyzing = analyzing;
  }
}

// Singleton instance
export const engineViewModel = new EngineViewModel();
