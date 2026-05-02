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
  const { moveStockfishService, analysisStockfishService } = await import('../src/engine/stockfish.service');
  const engine = new EngineViewModel();

  const originalInitialize = engine.initialize.bind(engine);
  const originalMoveAnalyze = moveStockfishService.analyzePosition.bind(moveStockfishService);
  const originalMoveConfigure = moveStockfishService.configure.bind(moveStockfishService);
  const originalMoveStop = moveStockfishService.stop.bind(moveStockfishService);
  const originalAnalysisAnalyze = analysisStockfishService.analyzePosition.bind(analysisStockfishService);
  const originalAnalysisConfigure = analysisStockfishService.configure.bind(analysisStockfishService);
  const originalAnalysisStop = analysisStockfishService.stop.bind(analysisStockfishService);

  let releaseMoveAnalysis: (() => void) | null = null;
  let moveAnalyzeCalls = 0;
  let backgroundAnalyzeCalls = 0;

  engine.isInitialized = true;
  engine.initialize = async () => undefined;
  moveStockfishService.configure = () => undefined;
  moveStockfishService.stop = () => undefined;
  moveStockfishService.analyzePosition = async () => {
    moveAnalyzeCalls += 1;
    await new Promise<void>((resolve) => {
      releaseMoveAnalysis = resolve;
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
  analysisStockfishService.configure = () => undefined;
  analysisStockfishService.stop = () => undefined;
  analysisStockfishService.analyzePosition = async () => {
    backgroundAnalyzeCalls += 1;
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

  releaseMoveAnalysis?.();

  const [engineMoveResult, backgroundResult] = await Promise.all([engineMovePromise, backgroundPromise]);

  assert.equal(moveAnalyzeCalls, 1);
  assert.equal(backgroundAnalyzeCalls, 1);
  assert.equal(engineMoveResult.ignored, false);
  assert.equal(backgroundResult.ignored, false);
  assert.equal(backgroundResult.analyzedFen, 'fen-shared');

  engine.initialize = originalInitialize;
  moveStockfishService.analyzePosition = originalMoveAnalyze;
  moveStockfishService.configure = originalMoveConfigure;
  moveStockfishService.stop = originalMoveStop;
  analysisStockfishService.analyzePosition = originalAnalysisAnalyze;
  analysisStockfishService.configure = originalAnalysisConfigure;
  analysisStockfishService.stop = originalAnalysisStop;
});

test('engine reset clears in-flight analysis state so new requests are not blocked', async () => {
  localStorageMock.clear();

  const { EngineViewModel } = await import('../src/viewmodels');
  const { analysisStockfishService } = await import('../src/engine/stockfish.service');
  const engine = new EngineViewModel();

  const originalInitialize = engine.initialize.bind(engine);
  const originalAnalyze = analysisStockfishService.analyzePosition.bind(analysisStockfishService);
  const originalConfigure = analysisStockfishService.configure.bind(analysisStockfishService);
  const originalStop = analysisStockfishService.stop.bind(analysisStockfishService);

  let resolveFirstAnalysis: (() => void) | null = null;
  let analyzeCallCount = 0;

  engine.isInitialized = true;
  engine.initialize = async () => undefined;
  analysisStockfishService.configure = () => undefined;
  analysisStockfishService.stop = () => undefined;
  analysisStockfishService.analyzePosition = async () => {
    analyzeCallCount += 1;

    if (analyzeCallCount === 1) {
      return new Promise((resolve) => {
        resolveFirstAnalysis = () => {
          resolve([
            {
              move: 'e2e4',
              evaluation: 12,
              evalLoss: 0,
              pv: ['e2e4'],
              multipv: 1,
              depth: 8,
            },
          ]);
        };
      });
    }

    return [
      {
        move: 'd2d4',
        evaluation: 18,
        evalLoss: 0,
        pv: ['d2d4'],
        multipv: 1,
        depth: 8,
      },
    ];
  };

  const staleAnalysisPromise = engine.analyzePosition('fen-old', 8, 2, 'background');
  await new Promise((resolve) => setTimeout(resolve, 0));

  engine.reset();
  assert.equal(engine.isAnalyzing, false);

  const freshAnalysisPromise = engine.analyzePosition('fen-new', 8, 2, 'background');
  resolveFirstAnalysis?.();

  const freshResult = await freshAnalysisPromise;
  const staleResult = await staleAnalysisPromise;

  assert.equal(analyzeCallCount, 2);
  assert.equal(freshResult.analyzedFen, 'fen-new');
  assert.equal(staleResult.ignored, true);

  engine.initialize = originalInitialize;
  analysisStockfishService.analyzePosition = originalAnalyze;
  analysisStockfishService.configure = originalConfigure;
  analysisStockfishService.stop = originalStop;
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

test('new game clears stale board transient state and allows black autoplay turn flow again', async () => {
  localStorageMock.clear();

  const { boardViewModel } = await import('../src/viewmodels');

  boardViewModel.isThinking = true;
  boardViewModel.isAnalyzingMoves = true;
  boardViewModel.lastPlayerMoveQuality = 'good';
  boardViewModel.setAutoPlay(true);
  boardViewModel.setEnginePlaysFor('b');

  boardViewModel.reset();

  assert.equal(boardViewModel.isThinking, false);
  assert.equal(boardViewModel.isAnalyzingMoves, false);
  assert.equal(boardViewModel.lastPlayerMoveQuality, null);
  assert.equal(boardViewModel.canStartAutoPlayTurn, false);

  assert.equal(boardViewModel.makeMove('e2', 'e4'), true);
  assert.equal(boardViewModel.canStartAutoPlayTurn, true);
});

test('cache-hit indicator reflects whether analysis came from cache', async () => {
  localStorageMock.clear();

  const { EngineViewModel, featureOptionsViewModel } = await import('../src/viewmodels');
  const { analysisStockfishService } = await import('../src/engine/stockfish.service');
  const { analysisCache } = await import('../src/engine/analysisCache');
  const engine = new EngineViewModel();

  const originalInitialize = engine.initialize.bind(engine);
  const originalAnalyze = analysisStockfishService.analyzePosition.bind(analysisStockfishService);
  const originalConfigure = analysisStockfishService.configure.bind(analysisStockfishService);

  featureOptionsViewModel.resetToDefaults();
  featureOptionsViewModel.setOption('useMoveAnalysisCache', true);
  analysisCache.invalidate();

  engine.isInitialized = true;
  engine.initialize = async () => undefined;
  analysisStockfishService.configure = () => undefined;
  analysisStockfishService.analyzePosition = async () => [
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
  analysisStockfishService.analyzePosition = originalAnalyze;
  analysisStockfishService.configure = originalConfigure;
});

test('persona profiles save and load the current configuration snapshot', async () => {
  localStorageMock.clear();

  const { PersonaProfilesViewModel } = await import('../src/viewmodels');
  const { DEFAULT_BUCKET_CONFIG } = await import('../src/engine/types');
  const { DEFAULT_FEATURE_OPTIONS } = await import('../src/engine/featureOptions');

  let appliedConfig: unknown = null;
  let appliedFeatureOptions: unknown = null;
  let appliedBrilliantSettings: unknown = null;
  let appliedUi: unknown = null;

  const profiles = new PersonaProfilesViewModel({
    configViewModel: {
      bucketConfig: {
        ...DEFAULT_BUCKET_CONFIG,
        best: 28,
        great: 22,
      },
      currentPresetId: 'aggressive',
      depth: 13,
      multiPV: 7,
      applyProfileSnapshot: (snapshot) => {
        appliedConfig = snapshot;
      },
    },
    featureOptionsViewModel: {
      options: {
        ...DEFAULT_FEATURE_OPTIONS,
        useDeterministicRng: true,
        useMoveAnalysisCache: false,
        useBrilliantMoveBudget: true,
      },
      brilliantMovesPerGame: 3,
      brilliantAllowedPhase: 'middlegame',
      applyProfileSettings: (options, brilliant) => {
        appliedFeatureOptions = options;
        appliedBrilliantSettings = brilliant;
      },
    },
    uiStateViewModel: {
      themeMode: 'persona',
      basicMode: false,
      applyProfilePreferences: (preferences) => {
        appliedUi = preferences;
      },
    },
  });

  profiles.setProfileNameDraft('Sharp Tactician');
  assert.equal(profiles.saveCurrentProfile(), true);
  assert.equal(profiles.profiles.length, 1);
  assert.equal(profiles.profiles[0]?.name, 'Sharp Tactician');
  assert.equal(profiles.profiles[0]?.settings.depth, 13);
  assert.equal(profiles.profiles[0]?.settings.featureOptions.useDeterministicRng, true);
  assert.equal(profiles.profiles[0]?.settings.brilliant.brilliantMovesPerGame, 3);
  assert.equal(profiles.profiles[0]?.settings.ui.themeMode, 'persona');

  assert.equal(profiles.loadSelectedProfile(), true);
  assert.deepEqual(appliedConfig, {
    bucketConfig: {
      ...DEFAULT_BUCKET_CONFIG,
      best: 28,
      great: 22,
    },
    currentPresetId: 'aggressive',
    depth: 13,
    multiPV: 7,
  });
  assert.deepEqual(appliedFeatureOptions, {
    ...DEFAULT_FEATURE_OPTIONS,
    useDeterministicRng: true,
    useMoveAnalysisCache: false,
    useBrilliantMoveBudget: true,
  });
  assert.deepEqual(appliedBrilliantSettings, {
    brilliantMovesPerGame: 3,
    brilliantAllowedPhase: 'middlegame',
  });
  assert.deepEqual(appliedUi, {
    themeMode: 'persona',
    basicMode: false,
  });
});

test('persona profile import validates JSON safely and deduplicates names', async () => {
  localStorageMock.clear();

  const { PersonaProfilesViewModel } = await import('../src/viewmodels');
  const { DEFAULT_BUCKET_CONFIG } = await import('../src/engine/types');
  const { DEFAULT_FEATURE_OPTIONS } = await import('../src/engine/featureOptions');

  const profiles = new PersonaProfilesViewModel({
    configViewModel: {
      bucketConfig: { ...DEFAULT_BUCKET_CONFIG },
      currentPresetId: 'medium',
      depth: 8,
      multiPV: 12,
      applyProfileSnapshot: () => undefined,
    },
    featureOptionsViewModel: {
      options: { ...DEFAULT_FEATURE_OPTIONS },
      brilliantMovesPerGame: 0,
      brilliantAllowedPhase: 'any',
      applyProfileSettings: () => undefined,
    },
    uiStateViewModel: {
      themeMode: 'dark',
      basicMode: true,
      applyProfilePreferences: () => undefined,
    },
  });

  profiles.setProfileNameDraft('Balanced');
  assert.equal(profiles.saveCurrentProfile(), true);

  profiles.setExchangeJson('{bad json');
  assert.equal(profiles.importProfileFromJson(), false);
  assert.match(profiles.importError, /could not be parsed/i);

  profiles.setExchangeJson(
    JSON.stringify({
      kind: 'personachess.persona-profile',
      version: 1,
      name: 'Balanced',
      settings: {
        bucketConfig: DEFAULT_BUCKET_CONFIG,
        currentPresetId: 'hard',
        depth: 15,
        multiPV: 4,
        featureOptions: {
          ...DEFAULT_FEATURE_OPTIONS,
          useDeterministicRng: true,
        },
        brilliant: {
          brilliantMovesPerGame: 2,
          brilliantAllowedPhase: 'endgame',
        },
        ui: {
          themeMode: 'light',
          basicMode: false,
        },
      },
    }),
  );

  assert.equal(profiles.importProfileFromJson(), true);
  assert.equal(profiles.profiles.length, 2);
  assert.equal(profiles.profiles[0]?.name, 'Balanced 2');
  assert.equal(profiles.profiles[0]?.settings.currentPresetId, 'hard');
  assert.equal(profiles.profiles[0]?.settings.ui.themeMode, 'light');
});

test('game setup presets remain searchable and compatible with the existing opening library', async () => {
  const { PREDEFINED_OPENINGS } = await import('../src/engine/openings');
  const {
    GAME_SETUP_PRESETS,
    filterGameSetupPresets,
    toCompatibleOpeningPreset,
  } = await import('../src/engine/gameSetupPresets');

  assert.ok(GAME_SETUP_PRESETS.length >= PREDEFINED_OPENINGS.length);

  const filtered = filterGameSetupPresets(GAME_SETUP_PRESETS, 'openings', 'sicilian');
  assert.equal(filtered.length, 1);
  assert.match(filtered[0]?.name ?? '', /sicilian/i);

  const openingPreset = toCompatibleOpeningPreset(PREDEFINED_OPENINGS[0]?.id ?? '');
  assert.equal(openingPreset?.sourceType, 'pgn');
  assert.equal(openingPreset?.source, PREDEFINED_OPENINGS[0]?.pgn);
});

test('loading a game setup preset resets session state and brilliant tracking', async () => {
  localStorageMock.clear();

  const { boardViewModel, featureOptionsViewModel } = await import('../src/viewmodels');
  const { getGameSetupPresetById } = await import('../src/engine/gameSetupPresets');

  boardViewModel.reset();
  featureOptionsViewModel.resetToDefaults();
  featureOptionsViewModel.setOption('useBrilliantMoveBudget', true);
  featureOptionsViewModel.setBrilliantMovesPerGame(2);

  const baselineSessionId = boardViewModel.debugSessionId;
  await boardViewModel.makeMoveUCI('e2e4', { consumedBrilliant: true });
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 1);

  const preset = getGameSetupPresetById('italian');
  assert.ok(preset);
  if (!preset) {
    throw new Error('Expected italian preset to exist');
  }
  assert.equal(boardViewModel.loadGameSetupPreset(preset), true);
  assert.notEqual(boardViewModel.debugSessionId, baselineSessionId);
  assert.equal(featureOptionsViewModel.brilliantUsedCount, 0);
  assert.match(boardViewModel.statusMessage, /italian/i);
});

test('game analytics summary aggregates quality, timing, complexity, and highlights', async () => {
  const { buildGameAnalyticsSummary } = await import('../src/engine/gameAnalytics');

  const summary = buildGameAnalyticsSummary({
    sessionId: 'session_test',
    createdAtMs: 1000,
    finishedAtMs: 9000,
    gameStatus: 'Checkmate! White wins',
    personaId: 'aggressive',
    personaLabel: 'Aggressive',
    setupName: 'Italian Game',
    setupCategory: 'openings',
    autoplayDurationMs: 2600,
    pgn: '1. e4 e5 *',
    moveAnnotations: [
      {
        beforeFen: 'a',
        afterFen: 'b',
        uci: 'e2e4',
        moveNumber: 1,
        consumedBrilliant: false,
        actor: 'player',
        san: 'e4',
        bucket: 'good',
        evalLoss: 42,
        evaluation: 18,
        complexityLevel: 'medium',
        complexityScore: 0.5,
        timestamp: 2000,
        delayMsSincePrevious: 700,
      },
      {
        beforeFen: 'b',
        afterFen: 'c',
        uci: 'e7e5',
        moveNumber: 1,
        consumedBrilliant: true,
        actor: 'engine',
        san: 'e5+',
        bucket: 'best',
        evalLoss: 0,
        evaluation: 32,
        complexityLevel: 'high',
        complexityScore: 0.8,
        timestamp: 2800,
        delayMsSincePrevious: 800,
      },
      {
        beforeFen: 'c',
        afterFen: 'd',
        uci: 'g1f3',
        moveNumber: 2,
        consumedBrilliant: false,
        actor: 'player',
        san: 'Nf3',
        bucket: 'mistake',
        evalLoss: 310,
        evaluation: -90,
        complexityLevel: 'low',
        complexityScore: 0.2,
        timestamp: 4300,
        delayMsSincePrevious: 1500,
      },
    ],
  });

  assert.equal(summary.result, 'White won');
  assert.equal(summary.brilliantMoves, 1);
  assert.equal(summary.moveCount, 3);
  assert.equal(summary.qualityCounts.best, 1);
  assert.equal(summary.qualityCounts.good, 1);
  assert.equal(summary.qualityCounts.mistake, 1);
  assert.equal(summary.averageEvalLoss, 117.3);
  assert.equal(summary.averageMoveDelayMs, 1000);
  assert.equal(summary.complexityDistribution.low, 1);
  assert.equal(summary.complexityDistribution.medium, 1);
  assert.equal(summary.complexityDistribution.high, 1);
  assert.equal(summary.highlightedBrilliantMoves.length, 1);
  assert.equal(summary.majorMistakes.length, 1);
  assert.equal(summary.evalTrend.length, 3);
  assert.equal(summary.complexityTrend.length, 3);
});

test('game analytics viewmodel stores completed sessions in recent games', async () => {
  localStorageMock.clear();

  const { GameAnalyticsViewModel } = await import('../src/viewmodels');

  const analytics = new GameAnalyticsViewModel({
    boardViewModel: {
      debugSessionId: 'session_capture',
      moveAnnotations: [
        {
          beforeFen: 'a',
          afterFen: 'b',
          uci: 'e2e4',
          moveNumber: 1,
          consumedBrilliant: false,
          actor: 'player',
          san: 'e4',
          bucket: 'good',
          evalLoss: 40,
          evaluation: 15,
          complexityLevel: 'medium',
          complexityScore: 0.45,
          timestamp: 1000,
          delayMsSincePrevious: 600,
        },
      ],
      sessionStartedAt: 0,
      gameStatus: 'Draw!',
      pgn: '1. e4 *',
      currentSetupName: 'Custom Position',
      currentSetupCategory: 'custom',
      autoPlayActiveDurationMs: 900,
      isGameOver: true,
    },
    configViewModel: {
      activePersonaId: 'medium',
      activePersonaLabel: 'Medium',
    },
  });

  analytics.captureCompletedGame();

  assert.equal(analytics.recentGames.length, 1);
  assert.equal(analytics.recentGames[0]?.sessionId, 'session_capture');
  assert.equal(analytics.recentGameEntries[0]?.personaLabel, 'Medium');
});

test('autoplay schedules correctly for a black engine after a white player move', async () => {
  localStorageMock.clear();

  const { boardViewModel, engineViewModel } = await import('../src/viewmodels');

  const originalSolveNextMove = boardViewModel.solveNextMove.bind(boardViewModel);
  let solveCalls = 0;

  boardViewModel.reset();
  boardViewModel.setAutoPlay(true);
  boardViewModel.setEnginePlaysFor('b');
  boardViewModel.solveNextMove = async () => {
    solveCalls += 1;
    return null;
  };
  engineViewModel.isInitialized = true;

  assert.equal(boardViewModel.makeMove('e2', 'e4'), true);
  await new Promise((resolve) => {
    setTimeout(resolve, 900);
  });

  assert.equal(solveCalls, 1);

  boardViewModel.solveNextMove = originalSolveNextMove;
});

test('autoplay still plays black when player-move background analysis is pending', async () => {
  localStorageMock.clear();

  const { boardViewModel, engineViewModel, uiStateViewModel } = await import('../src/viewmodels');

  const originalInitialize = engineViewModel.initialize.bind(engineViewModel);
  const originalAnalyzePosition = engineViewModel.analyzePosition.bind(engineViewModel);
  const originalPickMove = engineViewModel.pickMoveFromAnalysis.bind(engineViewModel);
  const originalAutoPlaySpeed = uiStateViewModel.autoPlaySpeed;

  boardViewModel.reset();
  boardViewModel.setAutoPlay(true);
  boardViewModel.setEnginePlaysFor('b');
  uiStateViewModel.setAutoPlaySpeed('fast');

  engineViewModel.isInitialized = true;
  engineViewModel.initialize = async () => undefined;
  engineViewModel.analyzePosition = async (fen: string, _depth?: number, _multiPV?: number, purpose = 'background') => {
    if (purpose === 'background') {
      return new Promise(() => undefined);
    }

    return {
      requestId: 1,
      analyzedFen: fen,
      moves: [
        {
          move: 'e7e5',
          evaluation: 20,
          evalLoss: 0,
          pv: ['e7e5'],
          multipv: 1,
          depth: 8,
          bucket: 'best',
        },
      ],
      complexity: {
        level: 'low',
        score: 0.2,
        spread: 12,
        closeCandidates: 1,
        volatility: 8,
      },
      ignored: false,
      fromCache: false,
      purpose: 'engineMove',
    };
  };
  engineViewModel.pickMoveFromAnalysis = () => ({
    move: {
      move: 'e7e5',
      evaluation: 20,
      evalLoss: 0,
      pv: ['e7e5'],
      multipv: 1,
      depth: 8,
      bucket: 'best',
    },
    bucket: 'best',
    isBrilliant: false,
  });

  assert.equal(boardViewModel.makeMove('e2', 'e4'), true);

  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  assert.equal(boardViewModel.history.length, 2);
  assert.equal(boardViewModel.history[1]?.san, 'e5');

  engineViewModel.initialize = originalInitialize;
  engineViewModel.analyzePosition = originalAnalyzePosition;
  engineViewModel.pickMoveFromAnalysis = originalPickMove;
  uiStateViewModel.setAutoPlaySpeed(originalAutoPlaySpeed);
});

test('startAutoPlayTurn lets the white engine begin the game manually', async () => {
  localStorageMock.clear();

  const { boardViewModel } = await import('../src/viewmodels');

  const originalSolveNextMove = boardViewModel.solveNextMove.bind(boardViewModel);
  let autoTriggeredArgument: boolean | null = null;

  boardViewModel.reset();
  boardViewModel.setAutoPlay(true);
  boardViewModel.setEnginePlaysFor('w');
  boardViewModel.solveNextMove = async (autoTriggered = false) => {
    autoTriggeredArgument = autoTriggered;
    return null;
  };

  assert.equal(boardViewModel.canStartAutoPlayTurn, true);
  await boardViewModel.startAutoPlayTurn();
  assert.equal(autoTriggeredArgument, true);

  boardViewModel.solveNextMove = originalSolveNextMove;
});

test('startAutoPlayTurn is available for a black engine after the player move', async () => {
  localStorageMock.clear();

  const { boardViewModel } = await import('../src/viewmodels');

  const originalSolveNextMove = boardViewModel.solveNextMove.bind(boardViewModel);
  let autoTriggeredArgument: boolean | null = null;

  boardViewModel.reset();
  boardViewModel.setAutoPlay(true);
  boardViewModel.setEnginePlaysFor('b');
  boardViewModel.solveNextMove = async (autoTriggered = false) => {
    autoTriggeredArgument = autoTriggered;
    return null;
  };

  assert.equal(boardViewModel.makeMove('e2', 'e4'), true);
  assert.equal(boardViewModel.canStartAutoPlayTurn, true);

  await boardViewModel.startAutoPlayTurn();
  assert.equal(autoTriggeredArgument, true);

  boardViewModel.solveNextMove = originalSolveNextMove;
});
