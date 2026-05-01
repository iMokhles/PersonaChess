import assert from 'node:assert/strict';
import test from 'node:test';

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const localStorageMock = new MemoryStorage();
(globalThis as unknown as { localStorage: MemoryStorage }).localStorage = localStorageMock;

test('analysis safety ignores stale requests and stale delayed moves', async () => {
  const { canApplyAnalyzedMove, isStaleAnalysisRequest } = await import('../src/engine/analysisSafety');

  assert.equal(isStaleAnalysisRequest(1, 2), true);
  assert.equal(isStaleAnalysisRequest(4, 4), false);
  assert.equal(canApplyAnalyzedMove('fen-a', 'fen-b'), false);
  assert.equal(canApplyAnalyzedMove('fen-a', 'fen-a'), true);
});

test('analysis cache key, trimming, and invalidation behave correctly', async () => {
  const { AnalysisCache, buildAnalysisCacheKey } = await import('../src/engine/analysisCache');

  assert.equal(
    buildAnalysisCacheKey('fen', 8, 12),
    'fen|depth:8|multipv:12',
  );

  const cache = new AnalysisCache(2);
  cache.set({ key: 'a', moves: [], timestamp: 1 });
  cache.set({ key: 'b', moves: [], timestamp: 2 });
  cache.set({ key: 'c', moves: [], timestamp: 3 });

  assert.equal(cache.size, 2);
  assert.equal(cache.get('a'), null);
  assert.notEqual(cache.get('b'), null);
  assert.notEqual(cache.get('c'), null);

  cache.invalidate('b');
  assert.equal(cache.get('b'), null);

  cache.invalidate();
  assert.equal(cache.size, 0);
});

test('deterministic RNG changes stream when FEN changes at the same move number', async () => {
  const { buildDeterministicSeed, createSeededRandomSource } = await import('../src/engine/random');

  const seedA = buildDeterministicSeed({
    gameStartFen: 'start-fen',
    currentFen: 'fen-a',
    moveCount: 12,
    sideToMove: 'w',
    persona: 'medium',
  });
  const seedB = buildDeterministicSeed({
    gameStartFen: 'start-fen',
    currentFen: 'fen-b',
    moveCount: 12,
    sideToMove: 'w',
    persona: 'medium',
  });

  const rngA = createSeededRandomSource(seedA);
  const rngB = createSeededRandomSource(seedB);

  assert.notEqual(rngA.next(), rngB.next());
});

test('PGN custom start FEN is respected', async () => {
  const { resolvePgnStartFen } = await import('../src/engine/gameSession');

  const fen = resolvePgnStartFen(
    {
      SetUp: '1',
      FEN: '8/8/8/8/8/8/8/K6k w - - 0 1',
    },
    'fallback',
  );

  assert.equal(fen, '8/8/8/8/8/8/8/K6k w - - 0 1');
});

test('brilliant usage derives from move history metadata', async () => {
  const { deriveBrilliantUsage } = await import('../src/engine/brilliantTracking');

  const usage = deriveBrilliantUsage([
    {
      beforeFen: 'a',
      afterFen: 'b',
      uci: 'e2e4',
      moveNumber: 1,
      consumedBrilliant: false,
    },
    {
      beforeFen: 'b',
      afterFen: 'c',
      uci: 'e7e5',
      moveNumber: 1,
      consumedBrilliant: true,
    },
  ]);

  assert.deepEqual(usage, {
    brilliantUsedCount: 1,
    brilliantMoveNumbers: [1],
  });
});

test('brilliant budget is consumed only after a successful engine move and rolls back on undo/redo', async () => {
  localStorageMock.clear();

  const { boardViewModel, featureOptionsViewModel } = await import('../src/viewmodels');

  boardViewModel.reset();
  featureOptionsViewModel.resetToDefaults();
  featureOptionsViewModel.setOption('useBrilliantMoveBudget', true);
  featureOptionsViewModel.setBrilliantMovesPerGame(2);

  const invalidMove = await boardViewModel.makeMoveUCI('a1a1', { consumedBrilliant: true });
  assert.equal(invalidMove, false);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 0);

  const successfulMove = await boardViewModel.makeMoveUCI('e2e4', { consumedBrilliant: true });
  assert.equal(successfulMove, true);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 1);
  assert.deepEqual(featureOptionsViewModel.brilliantMoveNumbers, [1]);

  assert.equal(boardViewModel.undoSingle(), true);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 0);
  assert.deepEqual(featureOptionsViewModel.brilliantMoveNumbers, []);

  assert.equal(boardViewModel.redoSingle(), true);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 1);
  assert.deepEqual(featureOptionsViewModel.brilliantMoveNumbers, [1]);
});

test('new FEN, PGN, and opening loads reset brilliant state and PGN start FEN updates game start', async () => {
  localStorageMock.clear();

  const { boardViewModel, featureOptionsViewModel } = await import('../src/viewmodels');
  const { PREDEFINED_OPENINGS } = await import('../src/engine/openings');

  boardViewModel.reset();
  featureOptionsViewModel.resetToDefaults();
  featureOptionsViewModel.setOption('useBrilliantMoveBudget', true);
  await boardViewModel.makeMoveUCI('e2e4', { consumedBrilliant: true });
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 1);

  boardViewModel.loadFen('8/8/8/8/8/8/8/K6k w - - 0 1');
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 0);

  boardViewModel.loadPgn('[SetUp "1"]\n[FEN "8/8/8/8/8/8/8/K6k w - - 0 1"]\n\n1. Ka2 *');
  assert.equal(boardViewModel.gameStartFen, '8/8/8/8/8/8/8/K6k w - - 0 1');
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 0);

  await boardViewModel.makeMoveUCI('h1h2', { consumedBrilliant: true });
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 1);

  boardViewModel.loadPgn(PREDEFINED_OPENINGS[0].pgn);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 0);
});

test('solveNextMove drops stale delayed autoplay moves safely', async () => {
  localStorageMock.clear();

  const { boardViewModel, engineViewModel, featureOptionsViewModel, configViewModel } = await import('../src/viewmodels');

  boardViewModel.reset();
  featureOptionsViewModel.resetToDefaults();
  featureOptionsViewModel.setOption('useHumanDelaySimulation', true);
  configViewModel.applyPreset('medium');

  const originalInitialize = engineViewModel.initialize.bind(engineViewModel);
  const originalAnalyzePosition = engineViewModel.analyzePosition.bind(engineViewModel);
  const originalPickMove = engineViewModel.pickMoveFromAnalysis.bind(engineViewModel);

  let releaseDelay: (() => void) | null = null;

  engineViewModel.isInitialized = true;
  engineViewModel.initialize = async () => undefined;
  engineViewModel.analyzePosition = async (fen: string) => ({
    requestId: 1,
    analyzedFen: fen,
    moves: [
      {
        move: 'e2e4',
        evaluation: 30,
        evalLoss: 0,
        pv: ['e2e4'],
        multipv: 1,
        depth: 8,
        bucket: 'best',
      },
    ],
    complexity: {
      level: 'medium',
      score: 0.5,
      spread: 30,
      closeCandidates: 2,
      volatility: 20,
    },
    ignored: false,
    fromCache: false,
    purpose: 'engineMove',
  });
  engineViewModel.pickMoveFromAnalysis = () => ({
    move: {
      move: 'e2e4',
      evaluation: 30,
      evalLoss: 0,
      pv: ['e2e4'],
      multipv: 1,
      depth: 8,
      bucket: 'best',
    },
    bucket: 'best',
    isBrilliant: false,
  });

  (boardViewModel as unknown as { wait: (delayMs: number) => Promise<void> }).wait = () =>
    new Promise<void>((resolve) => {
      releaseDelay = resolve;
    });

  const pendingMove = boardViewModel.solveNextMove(true);
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  boardViewModel.loadFen('8/8/8/8/8/8/8/K6k w - - 0 1');
  releaseDelay?.();
  const result = await pendingMove;

  assert.equal(result, null);
  assert.equal(boardViewModel.fen, '8/8/8/8/8/8/8/K6k w - - 0 1');

  engineViewModel.initialize = originalInitialize;
  engineViewModel.analyzePosition = originalAnalyzePosition;
  engineViewModel.pickMoveFromAnalysis = originalPickMove;
});

test('background analysis does not cancel a valid pending engine move request', async () => {
  localStorageMock.clear();

  const { EngineViewModel } = await import('../src/viewmodels');
  const { stockfishService } = await import('../src/engine/stockfish.service');
  const engine = new EngineViewModel();

  const originalInitialize = engine.initialize.bind(engine);
  const originalAnalyze = stockfishService.analyzePosition.bind(stockfishService);
  const originalConfigure = stockfishService.configure.bind(stockfishService);
  const originalStop = stockfishService.stop.bind(stockfishService);

  let releaseAnalysis: (() => void) | null = null;
  let analyzeCalls = 0;

  engine.isInitialized = true;
  engine.initialize = async () => undefined;
  stockfishService.configure = () => undefined;
  stockfishService.stop = () => undefined;
  stockfishService.analyzePosition = async () => {
    analyzeCalls += 1;
    await new Promise<void>((resolve) => {
      releaseAnalysis = resolve;
    });

    return [
      {
        move: 'e2e4',
        evaluation: 42,
        evalLoss: 0,
        pv: ['e2e4'],
        multipv: 1,
        depth: 10,
      },
    ];
  };

  const engineMovePromise = engine.analyzePosition('fen-shared', 10, 2, 'engineMove');
  await new Promise((resolve) => setTimeout(resolve, 0));
  const backgroundPromise = engine.analyzePosition('fen-shared', 10, 2, 'background');

  releaseAnalysis?.();

  const [engineMoveResult, backgroundResult] = await Promise.all([engineMovePromise, backgroundPromise]);

  assert.equal(analyzeCalls, 1);
  assert.equal(engineMoveResult.ignored, false);
  assert.equal(backgroundResult.ignored, false);
  assert.equal(backgroundResult.analyzedFen, 'fen-shared');

  engine.initialize = originalInitialize;
  stockfishService.analyzePosition = originalAnalyze;
  stockfishService.configure = originalConfigure;
  stockfishService.stop = originalStop;
});

test('restored move annotations preserve brilliant undo/redo tracking after restart', async () => {
  localStorageMock.clear();

  const { BoardViewModel, boardViewModel, featureOptionsViewModel } = await import('../src/viewmodels');

  featureOptionsViewModel.resetToDefaults();
  featureOptionsViewModel.setOption('persistEngineConfig', true);
  featureOptionsViewModel.setOption('useBrilliantMoveBudget', true);
  featureOptionsViewModel.setBrilliantMovesPerGame(2);

  boardViewModel.reset();
  const moveApplied = await boardViewModel.makeMoveUCI('e2e4', { consumedBrilliant: true });
  assert.equal(moveApplied, true);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 1);

  assert.equal(boardViewModel.undoSingle(), true);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 0);
  assert.equal(boardViewModel.canRedo, true);

  const restoredBoard = new BoardViewModel();
  assert.equal(restoredBoard.canRedo, true);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 0);

  assert.equal(restoredBoard.redoSingle(), true);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 1);
  assert.deepEqual(featureOptionsViewModel.brilliantMoveNumbers, [1]);

  assert.equal(restoredBoard.undoSingle(), true);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 0);
});

test('cache-hit indicator reflects whether analysis came from cache', async () => {
  localStorageMock.clear();

  const { EngineViewModel, featureOptionsViewModel } = await import('../src/viewmodels');
  const { stockfishService } = await import('../src/engine/stockfish.service');
  const { analysisCache } = await import('../src/engine/analysisCache');
  const engine = new EngineViewModel();

  const originalInitialize = engine.initialize.bind(engine);
  const originalAnalyze = stockfishService.analyzePosition.bind(stockfishService);
  const originalConfigure = stockfishService.configure.bind(stockfishService);

  featureOptionsViewModel.resetToDefaults();
  featureOptionsViewModel.setOption('useMoveAnalysisCache', true);
  analysisCache.invalidate();

  engine.isInitialized = true;
  engine.initialize = async () => undefined;
  stockfishService.configure = () => undefined;
  stockfishService.analyzePosition = async () => [
    {
      move: 'e2e4',
      evaluation: 35,
      evalLoss: 0,
      pv: ['e2e4'],
      multipv: 1,
      depth: 12,
    },
  ];

  const first = await engine.analyzePosition('fen-cache', 12, 2, 'background');
  const second = await engine.analyzePosition('fen-cache', 12, 2, 'background');

  assert.equal(first.fromCache, false);
  assert.equal(second.fromCache, true);
  assert.equal(engine.lastAnalysisFromCache, true);

  engine.initialize = originalInitialize;
  stockfishService.analyzePosition = originalAnalyze;
  stockfishService.configure = originalConfigure;
});
