var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/engine/analysisSafety.ts
var analysisSafety_exports = {};
__export(analysisSafety_exports, {
  canApplyAnalyzedMove: () => canApplyAnalyzedMove,
  isStaleAnalysisRequest: () => isStaleAnalysisRequest
});
function isStaleAnalysisRequest(requestId, latestRequestId) {
  return requestId !== latestRequestId;
}
function canApplyAnalyzedMove(currentFen, analyzedFen) {
  return currentFen === analyzedFen;
}
var init_analysisSafety = __esm({
  "src/engine/analysisSafety.ts"() {
    "use strict";
  }
});

// src/engine/analysisCache.ts
var analysisCache_exports = {};
__export(analysisCache_exports, {
  AnalysisCache: () => AnalysisCache,
  analysisCache: () => analysisCache,
  buildAnalysisCacheKey: () => buildAnalysisCacheKey
});
function buildAnalysisCacheKey(fen, depth, multiPV) {
  return `${fen}|depth:${depth}|multipv:${multiPV}`;
}
var AnalysisCache, analysisCache;
var init_analysisCache = __esm({
  "src/engine/analysisCache.ts"() {
    "use strict";
    AnalysisCache = class {
      constructor(maxSize = 200) {
        this.maxSize = maxSize;
      }
      entries = /* @__PURE__ */ new Map();
      configure(maxSize) {
        this.maxSize = Math.max(1, maxSize);
        this.trim();
      }
      get(key) {
        const entry = this.entries.get(key);
        if (!entry) {
          return null;
        }
        this.entries.delete(key);
        this.entries.set(key, entry);
        return entry;
      }
      set(entry) {
        this.entries.set(entry.key, entry);
        this.trim();
      }
      invalidate(key) {
        if (key) {
          this.entries.delete(key);
          return;
        }
        this.entries.clear();
      }
      get size() {
        return this.entries.size;
      }
      trim() {
        while (this.entries.size > this.maxSize) {
          const oldestKey = this.entries.keys().next().value;
          if (!oldestKey) {
            break;
          }
          this.entries.delete(oldestKey);
        }
      }
    };
    analysisCache = new AnalysisCache();
  }
});

// src/engine/random.ts
var random_exports = {};
__export(random_exports, {
  buildDeterministicSeed: () => buildDeterministicSeed,
  createLegacyRandomSource: () => createLegacyRandomSource,
  createSeededRandomSource: () => createSeededRandomSource
});
function hashString(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 1831565813;
    let result = Math.imul(value ^ value >>> 15, value | 1);
    result ^= result + Math.imul(result ^ result >>> 7, result | 61);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}
function createLegacyRandomSource() {
  return {
    next: () => Math.random()
  };
}
function createSeededRandomSource(seed) {
  const generator = mulberry32(hashString(seed));
  return {
    next: () => generator()
  };
}
function buildDeterministicSeed({
  gameStartFen,
  currentFen,
  moveCount,
  sideToMove,
  persona
}) {
  return [gameStartFen, currentFen, String(moveCount), sideToMove, persona].join("|");
}
var init_random = __esm({
  "src/engine/random.ts"() {
    "use strict";
  }
});

// src/engine/gameSession.ts
var gameSession_exports = {};
__export(gameSession_exports, {
  createGameSessionId: () => createGameSessionId,
  resolvePgnStartFen: () => resolvePgnStartFen
});
function createGameSessionId() {
  return `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
function resolvePgnStartFen(headers, fallbackFen) {
  return headers.SetUp === "1" && typeof headers.FEN === "string" ? headers.FEN : fallbackFen;
}
var init_gameSession = __esm({
  "src/engine/gameSession.ts"() {
    "use strict";
  }
});

// src/engine/brilliantTracking.ts
var brilliantTracking_exports = {};
__export(brilliantTracking_exports, {
  deriveBrilliantUsage: () => deriveBrilliantUsage
});
function deriveBrilliantUsage(annotations) {
  const brilliantMoveNumbers = annotations.filter((annotation) => annotation.consumedBrilliant).map((annotation) => annotation.moveNumber);
  return {
    brilliantUsedCount: brilliantMoveNumbers.length,
    brilliantMoveNumbers
  };
}
var init_brilliantTracking = __esm({
  "src/engine/brilliantTracking.ts"() {
    "use strict";
  }
});

// src/shared/debug.ts
function readBrowserDebugFlag() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(DEBUG_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
function readProcessDebugFlag() {
  if (typeof process === "undefined") {
    return false;
  }
  return process.env.PERSONACHESS_DEBUG === "1";
}
function isDebugLoggingEnabled() {
  return readBrowserDebugFlag() || readProcessDebugFlag();
}
function setDebugLoggingEnabled(enabled) {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return;
  }
  try {
    if (enabled) {
      window.localStorage.setItem(DEBUG_STORAGE_KEY, "1");
    } else {
      window.localStorage.removeItem(DEBUG_STORAGE_KEY);
    }
  } catch {
  }
}
function createDebugLogger(scope) {
  return {
    debug: (...args) => {
      if (isDebugLoggingEnabled()) {
        console.log(`[${scope}]`, ...args);
      }
    },
    error: (...args) => {
      console.error(`[${scope}]`, ...args);
    },
    warn: (...args) => {
      console.warn(`[${scope}]`, ...args);
    }
  };
}
function isDevelopmentBuild() {
  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== "undefined") {
    return Boolean(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  }
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
}
var DEBUG_STORAGE_KEY;
var init_debug = __esm({
  "src/shared/debug.ts"() {
    "use strict";
    DEBUG_STORAGE_KEY = "personachess_debug_logging";
  }
});

// src/engine/stockfish.service.ts
var stockfish_service_exports = {};
__export(stockfish_service_exports, {
  StockfishService: () => StockfishService,
  analysisStockfishService: () => analysisStockfishService,
  moveStockfishService: () => moveStockfishService,
  stockfishService: () => stockfishService
});
var StockfishService, moveStockfishService, analysisStockfishService, stockfishService;
var init_stockfish_service = __esm({
  "src/engine/stockfish.service.ts"() {
    "use strict";
    init_debug();
    StockfishService = class {
      constructor(serviceName = "StockfishService") {
        this.serviceName = serviceName;
        this.logger = createDebugLogger(serviceName);
      }
      worker = null;
      messageHandlers = /* @__PURE__ */ new Set();
      isReady = false;
      readyResolvers = [];
      multiPV = 12;
      depth = 20;
      logger;
      /**
       * Initialize Stockfish WASM engine
       */
      async initialize() {
        if (this.worker) {
          return;
        }
        return new Promise((resolve, reject) => {
          try {
            const workerCode = `
          importScripts('${window.location.origin}/stockfish.js');
        `;
            const blob = new Blob([workerCode], { type: "application/javascript" });
            this.worker = new Worker(URL.createObjectURL(blob));
            this.worker.onmessage = (event) => {
              const message = typeof event.data === "string" ? event.data : String(event.data);
              this.handleMessage(message);
            };
            this.worker.onerror = (error) => {
              this.logger.error("Worker error:", error);
              reject(error);
            };
            const readyHandler = (msg) => {
              if (msg === "uciok") {
                this.isReady = true;
                this.removeMessageHandler(readyHandler);
                this.readyResolvers.forEach((r) => r());
                this.readyResolvers = [];
                resolve();
              }
            };
            this.addMessageHandler(readyHandler);
            setTimeout(() => {
              this.sendCommand("uci");
            }, 100);
          } catch (error) {
            reject(error);
          }
        });
      }
      /**
       * Destroy the engine instance
       */
      destroy() {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
          this.isReady = false;
        }
        this.messageHandlers.clear();
      }
      /**
       * Send UCI command to engine
       */
      sendCommand(command) {
        if (!this.worker) {
          throw new Error("Stockfish not initialized");
        }
        this.worker.postMessage(command);
      }
      /**
       * Handle incoming message from engine
       */
      handleMessage(message) {
        if (message && (message.startsWith("bestmove") || message === "readyok" || message === "uciok")) {
          this.logger.debug("Message:", message);
        }
        this.messageHandlers.forEach((handler) => handler(message));
      }
      /**
       * Add a message handler
       */
      addMessageHandler(handler) {
        this.messageHandlers.add(handler);
      }
      /**
       * Remove a message handler
       */
      removeMessageHandler(handler) {
        this.messageHandlers.delete(handler);
      }
      /**
       * Wait for engine to be ready
       */
      async waitForReady() {
        if (this.isReady) return;
        return new Promise((resolve) => {
          this.readyResolvers.push(resolve);
        });
      }
      /**
       * Set MultiPV option
       */
      setMultiPV(value) {
        this.multiPV = value;
        if (this.isReady) {
          this.sendCommand(`setoption name MultiPV value ${value}`);
        }
      }
      /**
       * Set search depth
       */
      setDepth(value) {
        this.depth = value;
      }
      /**
       * Configure engine options
       */
      configure(options) {
        if (options.multiPV !== void 0) {
          this.setMultiPV(options.multiPV);
        }
        if (options.depth !== void 0) {
          this.setDepth(options.depth);
        }
      }
      /**
       * Analyze a position and return all candidate moves
       */
      async analyzePosition(fen) {
        await this.waitForReady();
        return new Promise((resolve) => {
          const moves = /* @__PURE__ */ new Map();
          let bestScore = 0;
          let hasReceivedBestMove = false;
          let maxDepthReached = 0;
          const completeAnalysis = () => {
            if (hasReceivedBestMove) return;
            hasReceivedBestMove = true;
            this.removeMessageHandler(analysisHandler);
            this.logger.debug("Completing analysis, collected", moves.size, "moves");
            const analyzedMoves = [];
            for (let i = 1; i <= this.multiPV; i++) {
              const info = moves.get(i);
              if (info && info.pv.length > 0) {
                const evalLoss = Math.abs(bestScore - info.score);
                analyzedMoves.push({
                  move: info.pv[0],
                  evaluation: info.score,
                  evalLoss,
                  pv: info.pv,
                  multipv: info.multipv,
                  depth: info.depth
                });
              }
            }
            if (analyzedMoves.length > 0) {
              this.logger.debug("Returning", analyzedMoves.length, "analyzed moves");
              resolve(analyzedMoves);
            } else {
              this.logger.debug("No moves collected - likely game over position");
              resolve([]);
            }
          };
          const forceStopTimeout = setTimeout(() => {
            if (!hasReceivedBestMove) {
              this.logger.warn("Forcing stop after 10 seconds to get bestmove");
              this.sendCommand("stop");
              setTimeout(() => {
                if (!hasReceivedBestMove) {
                  this.logger.warn("No bestmove after stop, using collected moves");
                  completeAnalysis();
                }
              }, 1e3);
            }
          }, 1e4);
          const absoluteTimeout = setTimeout(() => {
            if (!hasReceivedBestMove) {
              this.logger.error("Analysis timeout after 30 seconds");
              this.removeMessageHandler(analysisHandler);
              clearTimeout(forceStopTimeout);
              completeAnalysis();
            }
          }, 3e4);
          const analysisHandler = (message) => {
            if (message.includes("score mate")) {
              const mateMatch = message.match(/score mate (-?\d+)/);
              if (mateMatch) {
                const mateIn = parseInt(mateMatch[1], 10);
                this.logger.debug("Detected mate score:", mateIn);
                if (mateIn <= 0) {
                  this.logger.debug("Game over position detected (checkmate/stalemate)");
                }
              }
            }
            if (message.startsWith("info") && message.includes("multipv")) {
              const info = this.parseInfoLine(message);
              if (info) {
                moves.set(info.multipv, info);
                if (info.multipv === 1) {
                  bestScore = info.score;
                  maxDepthReached = Math.max(maxDepthReached, info.depth);
                  if (info.depth >= this.depth && moves.size >= Math.min(3, this.multiPV)) {
                    this.logger.debug("Reached target depth, stopping early");
                    this.sendCommand("stop");
                  }
                }
              }
            }
            if (message.startsWith("bestmove")) {
              hasReceivedBestMove = true;
              clearTimeout(forceStopTimeout);
              clearTimeout(absoluteTimeout);
              this.removeMessageHandler(analysisHandler);
              const bestmoveMatch = message.match(/bestmove\s+(\S+)/);
              if (bestmoveMatch) {
                const bestmove = bestmoveMatch[1];
                if (bestmove === "(none)" || bestmove === "none" || bestmove === "0000") {
                  this.logger.debug("No legal moves (checkmate/stalemate)");
                  resolve([]);
                  return;
                }
              }
              this.logger.debug("Received bestmove, collected", moves.size, "moves");
              const analyzedMoves = [];
              for (let i = 1; i <= this.multiPV; i++) {
                const info = moves.get(i);
                if (info && info.pv.length > 0) {
                  const evalLoss = Math.abs(bestScore - info.score);
                  analyzedMoves.push({
                    move: info.pv[0],
                    evaluation: info.score,
                    evalLoss,
                    pv: info.pv,
                    multipv: info.multipv,
                    depth: info.depth
                  });
                }
              }
              if (analyzedMoves.length === 0) {
                this.logger.debug("No moves in bestmove response - game over position");
                resolve([]);
              } else {
                this.logger.debug("Returning", analyzedMoves.length, "analyzed moves");
                resolve(analyzedMoves);
              }
            }
          };
          this.addMessageHandler(analysisHandler);
          const readyHandler = (msg) => {
            if (msg === "readyok") {
              this.removeMessageHandler(readyHandler);
              this.logger.debug("Engine ready, sending position and starting analysis");
              this.sendCommand(`position fen ${fen}`);
              this.sendCommand(`go depth ${this.depth}`);
            }
          };
          this.addMessageHandler(readyHandler);
          this.logger.debug("Starting analysis for FEN:", fen, "MultiPV=", this.multiPV, "Depth=", this.depth);
          this.sendCommand(`setoption name MultiPV value ${this.multiPV}`);
          this.sendCommand("isready");
        });
      }
      /**
       * Parse UCI info line into structured data
       */
      parseInfoLine(line) {
        try {
          const parts = line.split(" ");
          const getValueAfter = (key) => {
            const idx = parts.indexOf(key);
            return idx >= 0 && idx < parts.length - 1 ? parts[idx + 1] : null;
          };
          const multipvStr = getValueAfter("multipv");
          const depthStr = getValueAfter("depth");
          if (!multipvStr || !depthStr) return null;
          const multipv = parseInt(multipvStr, 10);
          const depth = parseInt(depthStr, 10);
          let score = 0;
          let mate;
          const scoreIdx = parts.indexOf("score");
          if (scoreIdx >= 0 && parts[scoreIdx + 1] === "cp") {
            score = parseInt(parts[scoreIdx + 2], 10);
          } else if (scoreIdx >= 0 && parts[scoreIdx + 1] === "mate") {
            mate = parseInt(parts[scoreIdx + 2], 10);
            score = mate > 0 ? 1e4 - mate * 100 : -1e4 - mate * 100;
          }
          const pvIdx = parts.indexOf("pv");
          const pv = pvIdx >= 0 ? parts.slice(pvIdx + 1) : [];
          return {
            multipv,
            depth,
            score,
            mate,
            pv
          };
        } catch {
          return null;
        }
      }
      /**
       * Stop current analysis
       */
      stop() {
        if (this.worker) {
          this.sendCommand("stop");
        }
      }
      /**
       * Start a new game
       */
      newGame() {
        if (this.worker) {
          this.sendCommand("ucinewgame");
        }
      }
      /**
       * Check if engine is initialized
       */
      get initialized() {
        return this.isReady;
      }
    };
    moveStockfishService = new StockfishService("MoveStockfishService");
    analysisStockfishService = new StockfishService("AnalysisStockfishService");
    stockfishService = analysisStockfishService;
  }
});

// src/engine/engineCoordinator.ts
var EngineCoordinator, engineCoordinator;
var init_engineCoordinator = __esm({
  "src/engine/engineCoordinator.ts"() {
    "use strict";
    init_stockfish_service();
    EngineCoordinator = class {
      moveService;
      analysisService;
      constructor(dependencies = {}) {
        this.moveService = dependencies.moveService ?? moveStockfishService;
        this.analysisService = dependencies.analysisService ?? analysisStockfishService;
      }
      async initialize(lane) {
        if (lane === "move") {
          await this.moveService.initialize();
          return;
        }
        if (lane === "analysis") {
          await this.analysisService.initialize();
          return;
        }
        await Promise.all([
          this.moveService.initialize(),
          this.analysisService.initialize()
        ]);
      }
      configure(lane, options) {
        this.getService(lane).configure(options);
      }
      async analyzePosition(lane, fen) {
        return this.getService(lane).analyzePosition(fen);
      }
      stop(lane) {
        if (!lane) {
          this.moveService.stop();
          this.analysisService.stop();
          return;
        }
        this.getService(lane).stop();
      }
      newGame() {
        this.moveService.newGame();
        this.analysisService.newGame();
      }
      destroy() {
        this.moveService.destroy();
        this.analysisService.destroy();
      }
      getService(lane) {
        return lane === "move" ? this.moveService : this.analysisService;
      }
    };
    engineCoordinator = new EngineCoordinator();
  }
});

// src/engine/types.ts
var types_exports = {};
__export(types_exports, {
  BUCKET_COLORS: () => BUCKET_COLORS,
  BUCKET_EVAL_RANGES: () => BUCKET_EVAL_RANGES,
  BUCKET_LABELS: () => BUCKET_LABELS,
  DEFAULT_BUCKET_CONFIG: () => DEFAULT_BUCKET_CONFIG,
  DISPLAY_BUCKET_COLORS: () => DISPLAY_BUCKET_COLORS,
  DISPLAY_BUCKET_LABELS: () => DISPLAY_BUCKET_LABELS,
  MOVE_QUALITY_PRESETS: () => MOVE_QUALITY_PRESETS
});
var DEFAULT_BUCKET_CONFIG, MOVE_QUALITY_PRESETS, BUCKET_EVAL_RANGES, BUCKET_LABELS, DISPLAY_BUCKET_LABELS, BUCKET_COLORS, DISPLAY_BUCKET_COLORS;
var init_types = __esm({
  "src/engine/types.ts"() {
    "use strict";
    DEFAULT_BUCKET_CONFIG = {
      best: 40,
      great: 25,
      excellent: 20,
      good: 10,
      inaccuracy: 4,
      mistake: 1,
      blunder: 0
    };
    MOVE_QUALITY_PRESETS = [
      {
        id: "low",
        label: "Low",
        description: "Easier \u2014 more good/inaccuracy/mistake moves",
        config: {
          best: 15,
          great: 15,
          excellent: 20,
          good: 25,
          inaccuracy: 15,
          mistake: 7,
          blunder: 3
        }
      },
      {
        id: "medium",
        label: "Medium",
        description: "Balanced mix of qualities",
        config: {
          best: 40,
          great: 25,
          excellent: 20,
          good: 10,
          inaccuracy: 4,
          mistake: 1,
          blunder: 0
        }
      },
      {
        id: "hard",
        label: "Hard",
        description: "Favors best and great moves",
        config: {
          best: 55,
          great: 25,
          excellent: 15,
          good: 5,
          inaccuracy: 0,
          mistake: 0,
          blunder: 0
        }
      },
      {
        id: "super_hard",
        label: "Super Hard",
        description: "Almost only best and great",
        config: {
          best: 70,
          great: 25,
          excellent: 5,
          good: 0,
          inaccuracy: 0,
          mistake: 0,
          blunder: 0
        }
      },
      {
        id: "aggressive",
        label: "Aggressive",
        description: "Risky \u2014 more inaccuracies and mistakes",
        config: {
          best: 20,
          great: 20,
          excellent: 15,
          good: 15,
          inaccuracy: 15,
          mistake: 10,
          blunder: 5
        }
      }
    ];
    BUCKET_EVAL_RANGES = {
      best: [0, 10],
      great: [10, 30],
      excellent: [30, 70],
      good: [70, 150],
      inaccuracy: [150, 300],
      mistake: [300, 600],
      blunder: [600, Infinity]
    };
    BUCKET_LABELS = {
      best: "Best",
      great: "Great",
      excellent: "Excellent",
      good: "Good",
      inaccuracy: "Inaccuracy",
      mistake: "Mistake",
      blunder: "Blunder"
    };
    DISPLAY_BUCKET_LABELS = {
      ...BUCKET_LABELS,
      fallback: "Fallback move"
    };
    BUCKET_COLORS = {
      best: "#26a641",
      great: "#2ea043",
      excellent: "#57ab5a",
      good: "#8b949e",
      inaccuracy: "#d29922",
      mistake: "#f85149",
      blunder: "#da3633"
    };
    DISPLAY_BUCKET_COLORS = {
      ...BUCKET_COLORS,
      fallback: "#6e7681"
    };
  }
});

// src/engine/moveClassifier.ts
function classifyMove(move) {
  const bucket = getBucketForEvalLoss(move.evalLoss);
  return {
    ...move,
    bucket
  };
}
function classifyMoves(moves) {
  return moves.map(classifyMove);
}
function getBucketForEvalLoss(evalLoss) {
  const absLoss = Math.abs(evalLoss);
  for (const [bucket, [min, max]] of Object.entries(BUCKET_EVAL_RANGES)) {
    if (absLoss >= min && absLoss < max) {
      return bucket;
    }
  }
  return "blunder";
}
function groupMovesByBucket(moves) {
  const groups = /* @__PURE__ */ new Map();
  const buckets = ["best", "great", "excellent", "good", "inaccuracy", "mistake", "blunder"];
  buckets.forEach((bucket) => groups.set(bucket, []));
  moves.forEach((move) => {
    const bucketMoves = groups.get(move.bucket) || [];
    bucketMoves.push(move);
    groups.set(move.bucket, bucketMoves);
  });
  return groups;
}
function getMoveStats(moves) {
  const stats = {
    best: 0,
    great: 0,
    excellent: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0
  };
  moves.forEach((move) => {
    stats[move.bucket]++;
  });
  return stats;
}
function classifyUnanalyzedMove() {
  return "fallback";
}
function mapLegalMovesToBuckets(legalMoves, analyzedMoves, useImprovedFallback) {
  const moveMap = {};
  for (const analyzedMove of analyzedMoves) {
    moveMap[analyzedMove.move] = analyzedMove.bucket;
  }
  for (const move of legalMoves) {
    if (!moveMap[move]) {
      moveMap[move] = useImprovedFallback ? classifyUnanalyzedMove() : "good";
    }
  }
  return moveMap;
}
function findClosestAvailableBucket(targetBucket, availableBuckets) {
  if (availableBuckets.length === 0) {
    return null;
  }
  const targetIndex = BUCKET_ORDER.indexOf(targetBucket);
  if (targetIndex === -1) {
    return availableBuckets[0];
  }
  for (let offset = 1; offset < BUCKET_ORDER.length; offset += 1) {
    const betterIndex = targetIndex - offset;
    if (betterIndex >= 0) {
      const betterBucket = BUCKET_ORDER[betterIndex];
      if (availableBuckets.includes(betterBucket)) {
        return betterBucket;
      }
    }
    const worseIndex = targetIndex + offset;
    if (worseIndex < BUCKET_ORDER.length) {
      const worseBucket = BUCKET_ORDER[worseIndex];
      if (availableBuckets.includes(worseBucket)) {
        return worseBucket;
      }
    }
  }
  return availableBuckets[0];
}
var BUCKET_ORDER;
var init_moveClassifier = __esm({
  "src/engine/moveClassifier.ts"() {
    "use strict";
    init_types();
    BUCKET_ORDER = ["best", "great", "excellent", "good", "inaccuracy", "mistake", "blunder"];
  }
});

// src/engine/movePicker.ts
function getBucketOrder() {
  return ["best", "great", "excellent", "good", "inaccuracy", "mistake", "blunder"];
}
function getAvailableBuckets(moves, config) {
  const grouped = groupMovesByBucket(moves);
  const availableBuckets = [];
  for (const bucket of getBucketOrder()) {
    const bucketMoves = grouped.get(bucket) || [];
    if (bucketMoves.length > 0 && config[bucket] > 0) {
      availableBuckets.push({ bucket, moves: bucketMoves });
    }
  }
  return availableBuckets;
}
function pickWeightedBucket(weightedBuckets, random) {
  const totalWeight = weightedBuckets.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }
  let selection = random() * totalWeight;
  for (const entry of weightedBuckets) {
    selection -= entry.weight;
    if (selection <= 0) {
      return entry.bucket;
    }
  }
  return weightedBuckets[weightedBuckets.length - 1]?.bucket ?? null;
}
function pickBucketLegacy(moves, config = DEFAULT_BUCKET_CONFIG, random = Math.random) {
  if (moves.length === 0) return null;
  const availableBuckets = getAvailableBuckets(moves, config);
  if (availableBuckets.length === 0) {
    return {
      bucket: moves[0].bucket,
      moves: [moves[0]]
    };
  }
  const weightedBuckets = availableBuckets.map((entry) => ({
    bucket: entry.bucket,
    weight: config[entry.bucket]
  }));
  const selectedBucket = pickWeightedBucket(weightedBuckets, random);
  if (!selectedBucket) {
    return availableBuckets[0];
  }
  return availableBuckets.find((entry) => entry.bucket === selectedBucket) ?? availableBuckets[0];
}
function pickBucketWithClosestFallback(moves, config = DEFAULT_BUCKET_CONFIG, random = Math.random) {
  if (moves.length === 0) return null;
  const grouped = groupMovesByBucket(moves);
  const weightedBuckets = getBucketOrder().filter((bucket) => config[bucket] > 0).map((bucket) => ({ bucket, weight: config[bucket] }));
  const selectedBucket = pickWeightedBucket(weightedBuckets, random);
  if (!selectedBucket) {
    return pickBucketLegacy(moves, config, random);
  }
  const selectedMoves = grouped.get(selectedBucket) || [];
  if (selectedMoves.length > 0) {
    return {
      bucket: selectedBucket,
      moves: selectedMoves
    };
  }
  const availableBuckets = getBucketOrder().filter((bucket) => (grouped.get(bucket) || []).length > 0);
  const fallbackBucket = findClosestAvailableBucket(selectedBucket, availableBuckets);
  if (!fallbackBucket) {
    return null;
  }
  return {
    bucket: fallbackBucket,
    moves: grouped.get(fallbackBucket) || []
  };
}
function pickRandomMoveFromBucket(bucketSelection, random = Math.random) {
  const randomMoveIndex = Math.floor(random() * bucketSelection.moves.length);
  return bucketSelection.moves[randomMoveIndex];
}
function normalizeBucketConfig(config) {
  const total = Object.values(config).reduce((sum, val) => sum + val, 0);
  if (total === 0 || total === 100) {
    return config;
  }
  const factor = 100 / total;
  return {
    best: Math.round(config.best * factor),
    great: Math.round(config.great * factor),
    excellent: Math.round(config.excellent * factor),
    good: Math.round(config.good * factor),
    inaccuracy: Math.round(config.inaccuracy * factor),
    mistake: Math.round(config.mistake * factor),
    blunder: Math.round(config.blunder * factor)
  };
}
function validateBucketConfig(config) {
  const total = Object.values(config).reduce((sum, val) => sum + val, 0);
  return {
    valid: total === 100,
    total
  };
}
var init_movePicker = __esm({
  "src/engine/movePicker.ts"() {
    "use strict";
    init_types();
    init_moveClassifier();
  }
});

// src/engine/featureOptions.ts
var featureOptions_exports = {};
__export(featureOptions_exports, {
  DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG: () => DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG,
  DEFAULT_FEATURE_OPTIONS: () => DEFAULT_FEATURE_OPTIONS,
  ENGINE_CONFIG_STORAGE_KEY: () => ENGINE_CONFIG_STORAGE_KEY,
  FEATURE_OPTIONS_STORAGE_KEY: () => FEATURE_OPTIONS_STORAGE_KEY,
  FEATURE_OPTION_DESCRIPTORS: () => FEATURE_OPTION_DESCRIPTORS,
  mergeBrilliantMoveBudgetConfig: () => mergeBrilliantMoveBudgetConfig,
  mergeFeatureOptions: () => mergeFeatureOptions
});
function mergeFeatureOptions(partial) {
  return {
    ...DEFAULT_FEATURE_OPTIONS,
    ...partial ?? {}
  };
}
function mergeBrilliantMoveBudgetConfig(partial) {
  return {
    ...DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG,
    ...partial ?? {},
    brilliantMoveNumbers: partial?.brilliantMoveNumbers ?? DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG.brilliantMoveNumbers,
    gameSessionId: partial?.gameSessionId ?? DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG.gameSessionId
  };
}
var DEFAULT_FEATURE_OPTIONS, DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG, FEATURE_OPTION_DESCRIPTORS, FEATURE_OPTIONS_STORAGE_KEY, ENGINE_CONFIG_STORAGE_KEY;
var init_featureOptions = __esm({
  "src/engine/featureOptions.ts"() {
    "use strict";
    DEFAULT_FEATURE_OPTIONS = {
      securityDevToolsOnly: true,
      persistEngineConfig: true,
      useDeterministicRng: false,
      useMoveAnalysisCache: true,
      useImprovedMoveClassification: true,
      usePositionComplexity: false,
      usePersonaBehaviorBias: false,
      useHumanDelaySimulation: false,
      useBrilliantMoveBudget: false
    };
    DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG = {
      brilliantMovesPerGame: 0,
      brilliantAllowedPhase: "any",
      brilliantUsedCount: 0,
      brilliantMoveNumbers: [],
      gameSessionId: null
    };
    FEATURE_OPTION_DESCRIPTORS = [
      {
        key: "securityDevToolsOnly",
        label: "DevTools Only In Development",
        description: "Open Chromium DevTools only in development mode."
      },
      {
        key: "persistEngineConfig",
        label: "Persist Engine Configuration",
        description: "Save depth, MultiPV, presets, bucket weights, and advanced feature options."
      },
      {
        key: "useDeterministicRng",
        label: "Deterministic RNG",
        description: "Use a seeded random source so move selection is reproducible."
      },
      {
        key: "useMoveAnalysisCache",
        label: "Analysis Cache",
        description: "Reuse Stockfish analysis for the same FEN, depth, and MultiPV settings."
      },
      {
        key: "useImprovedMoveClassification",
        label: "Improved Move Classification",
        description: "Keep unknown moves separate and use smarter bucket fallback selection."
      },
      {
        key: "usePositionComplexity",
        label: "Position Complexity",
        description: "Adjust move quality weights based on how sharp the current position is."
      },
      {
        key: "usePersonaBehaviorBias",
        label: "Persona Behavior Bias",
        description: "Layer simple aggressive or safe move preferences on top of bucket selection."
      },
      {
        key: "useHumanDelaySimulation",
        label: "Human Delay Simulation",
        description: "Delay auto-play moves based on complexity, persona, and chosen move quality."
      },
      {
        key: "useBrilliantMoveBudget",
        label: "Brilliant Move Budget",
        description: "Reserve a fixed number of tactical brilliant moves for each game."
      }
    ];
    FEATURE_OPTIONS_STORAGE_KEY = "personachess_feature_options";
    ENGINE_CONFIG_STORAGE_KEY = "personachess_engine_config";
  }
});

// src/viewmodels/FeatureOptionsViewModel.ts
import { action, makeAutoObservable, reaction } from "mobx";
var FeatureOptionsViewModel, featureOptionsViewModel;
var init_FeatureOptionsViewModel = __esm({
  "src/viewmodels/FeatureOptionsViewModel.ts"() {
    "use strict";
    init_featureOptions();
    FeatureOptionsViewModel = class {
      options = { ...DEFAULT_FEATURE_OPTIONS };
      brilliantConfig = { ...DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG };
      constructor() {
        makeAutoObservable(this, {
          setOption: action,
          setOptions: action,
          applyProfileSettings: action,
          setBrilliantMovesPerGame: action,
          setBrilliantAllowedPhase: action,
          reconcileBrilliantTracking: action,
          resetBrilliantTracking: action,
          resetToDefaults: action
        });
        this.restoreFromStorage();
        reaction(
          () => ({
            options: { ...this.options },
            brilliantConfig: {
              ...this.brilliantConfig,
              brilliantMoveNumbers: [...this.brilliantConfig.brilliantMoveNumbers]
            }
          }),
          (snapshot) => {
            this.persistToStorage();
            this.syncToMainProcess(snapshot.options);
          },
          { fireImmediately: true }
        );
      }
      setOption(key, value) {
        this.options = {
          ...this.options,
          [key]: value
        };
        if (key === "persistEngineConfig" && value === false) {
          this.clearPersistedStorage();
        }
      }
      setOptions(options) {
        this.options = mergeFeatureOptions({
          ...this.options,
          ...options
        });
      }
      applyProfileSettings(options, brilliantSettings) {
        this.options = mergeFeatureOptions({
          ...this.options,
          ...options
        });
        this.brilliantConfig = {
          ...this.brilliantConfig,
          brilliantMovesPerGame: brilliantSettings.brilliantMovesPerGame ?? this.brilliantConfig.brilliantMovesPerGame,
          brilliantAllowedPhase: brilliantSettings.brilliantAllowedPhase ?? this.brilliantConfig.brilliantAllowedPhase
        };
        if (this.brilliantConfig.brilliantUsedCount > this.brilliantConfig.brilliantMovesPerGame) {
          this.brilliantConfig = {
            ...this.brilliantConfig,
            brilliantUsedCount: this.brilliantConfig.brilliantMovesPerGame,
            brilliantMoveNumbers: this.brilliantConfig.brilliantMoveNumbers.slice(0, this.brilliantConfig.brilliantMovesPerGame)
          };
        }
      }
      setBrilliantMovesPerGame(value) {
        this.brilliantConfig = {
          ...this.brilliantConfig,
          brilliantMovesPerGame: value
        };
        if (this.brilliantConfig.brilliantUsedCount > value) {
          this.brilliantConfig = {
            ...this.brilliantConfig,
            brilliantUsedCount: value,
            brilliantMoveNumbers: this.brilliantConfig.brilliantMoveNumbers.slice(0, value)
          };
        }
      }
      setBrilliantAllowedPhase(value) {
        this.brilliantConfig = {
          ...this.brilliantConfig,
          brilliantAllowedPhase: value
        };
      }
      reconcileBrilliantTracking(gameSessionId, brilliantMoveNumbers) {
        this.brilliantConfig = {
          ...this.brilliantConfig,
          gameSessionId,
          brilliantUsedCount: brilliantMoveNumbers.length,
          brilliantMoveNumbers: [...brilliantMoveNumbers]
        };
      }
      resetBrilliantTracking(gameSessionId = null) {
        this.brilliantConfig = {
          ...this.brilliantConfig,
          gameSessionId,
          brilliantUsedCount: 0,
          brilliantMoveNumbers: []
        };
      }
      resetToDefaults() {
        this.options = { ...DEFAULT_FEATURE_OPTIONS };
        this.brilliantConfig = { ...DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG };
      }
      restoreFromStorage() {
        try {
          const saved = localStorage.getItem(FEATURE_OPTIONS_STORAGE_KEY);
          if (!saved) {
            return;
          }
          const parsed = JSON.parse(saved);
          if ("options" in parsed || "brilliantConfig" in parsed) {
            this.options = mergeFeatureOptions(parsed.options);
            this.brilliantConfig = mergeBrilliantMoveBudgetConfig(parsed.brilliantConfig);
            return;
          }
          this.options = mergeFeatureOptions(parsed);
        } catch (error) {
          console.error("[FeatureOptionsViewModel] Failed to restore feature options:", error);
        }
      }
      persistToStorage() {
        try {
          if (!this.options.persistEngineConfig) {
            localStorage.removeItem(FEATURE_OPTIONS_STORAGE_KEY);
            return;
          }
          localStorage.setItem(
            FEATURE_OPTIONS_STORAGE_KEY,
            JSON.stringify({
              options: this.options,
              brilliantConfig: this.brilliantConfig
            })
          );
        } catch (error) {
          console.error("[FeatureOptionsViewModel] Failed to persist feature options:", error);
        }
      }
      clearPersistedStorage() {
        try {
          localStorage.removeItem(FEATURE_OPTIONS_STORAGE_KEY);
        } catch (error) {
          console.error("[FeatureOptionsViewModel] Failed to clear feature options storage:", error);
        }
      }
      syncToMainProcess(options) {
        if (typeof window === "undefined") {
          return;
        }
        const serializableOptions = mergeFeatureOptions({
          ...options
        });
        window.personaChessBridge?.syncFeatureOptions(serializableOptions);
      }
      get securityDevToolsOnly() {
        return this.options.securityDevToolsOnly;
      }
      get persistEngineConfig() {
        return this.options.persistEngineConfig;
      }
      get useDeterministicRng() {
        return this.options.useDeterministicRng;
      }
      get useMoveAnalysisCache() {
        return this.options.useMoveAnalysisCache;
      }
      get useImprovedMoveClassification() {
        return this.options.useImprovedMoveClassification;
      }
      get usePositionComplexity() {
        return this.options.usePositionComplexity;
      }
      get usePersonaBehaviorBias() {
        return this.options.usePersonaBehaviorBias;
      }
      get useHumanDelaySimulation() {
        return this.options.useHumanDelaySimulation;
      }
      get useBrilliantMoveBudget() {
        return this.options.useBrilliantMoveBudget;
      }
      get brilliantMovesPerGame() {
        return this.brilliantConfig.brilliantMovesPerGame;
      }
      get brilliantAllowedPhase() {
        return this.brilliantConfig.brilliantAllowedPhase;
      }
      get brilliantUsedCount() {
        return this.brilliantConfig.brilliantUsedCount;
      }
      get brilliantMoveNumbers() {
        return this.brilliantConfig.brilliantMoveNumbers;
      }
      get brilliantGameSessionId() {
        return this.brilliantConfig.gameSessionId;
      }
      get hasRemainingBrilliantMoves() {
        return this.brilliantConfig.brilliantUsedCount < this.brilliantConfig.brilliantMovesPerGame;
      }
    };
    featureOptionsViewModel = new FeatureOptionsViewModel();
  }
});

// src/engine/brilliantMove.ts
import { Chess } from "chess.js";
function getPieceValue(type) {
  return type ? PIECE_VALUES[type] : 0;
}
function getTacticalScore(fen, move, bestEvaluation) {
  const chess = new Chess(fen);
  const from = move.move.slice(0, 2);
  const to = move.move.slice(2, 4);
  const movingPiece = chess.get(from);
  const targetPiece = chess.get(to);
  const playedMove = chess.move({
    from,
    to,
    promotion: move.move[4]
  });
  if (!playedMove) {
    return 0;
  }
  const isCapture = playedMove.flags.includes("c") || playedMove.flags.includes("e");
  const isPromotion = Boolean(playedMove.promotion);
  const isCheck = chess.isCheck();
  const evalGain = Math.max(0, bestEvaluation - move.evaluation);
  const materialSwing = getPieceValue(targetPiece?.type) - getPieceValue(movingPiece?.type);
  const isSacrifice = isCapture && materialSwing < 0;
  let tacticalScore = 0;
  tacticalScore += isCheck ? 2 : 0;
  tacticalScore += isCapture ? 1.5 : 0;
  tacticalScore += isPromotion ? 2.5 : 0;
  tacticalScore += isSacrifice ? 1.75 : 0;
  tacticalScore += evalGain >= 80 ? 1.5 : evalGain >= 40 ? 0.75 : 0;
  return tacticalScore;
}
function getBrilliantMoveCandidates(fen, moves) {
  if (moves.length === 0) {
    return [];
  }
  const bestEvaluation = moves[0].evaluation;
  return moves.filter((move) => BRILLIANT_BUCKETS.includes(move.bucket)).map((move) => ({
    move,
    tacticalScore: getTacticalScore(fen, move, bestEvaluation)
  })).filter((candidate) => candidate.tacticalScore > 0).sort((left, right) => right.tacticalScore - left.tacticalScore);
}
function pickBrilliantMove(candidates, randomSource) {
  if (candidates.length === 0) {
    return null;
  }
  const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.tacticalScore, 0);
  let selection = randomSource.next() * totalWeight;
  for (const candidate of candidates) {
    selection -= candidate.tacticalScore;
    if (selection <= 0) {
      return candidate.move;
    }
  }
  return candidates[candidates.length - 1].move;
}
var PIECE_VALUES, BRILLIANT_BUCKETS;
var init_brilliantMove = __esm({
  "src/engine/brilliantMove.ts"() {
    "use strict";
    PIECE_VALUES = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0
    };
    BRILLIANT_BUCKETS = ["best", "great"];
  }
});

// src/engine/gamePhase.ts
import { Chess as Chess2 } from "chess.js";
function getTotalMaterial(fen) {
  const chess = new Chess2(fen);
  return chess.board().flat().reduce((total, piece) => total + (piece ? PIECE_VALUES2[piece.type] : 0), 0);
}
function areQueensTraded(fen) {
  const chess = new Chess2(fen);
  const queens = chess.board().flat().filter((piece) => piece?.type === "q").length;
  return queens < 2;
}
function detectGamePhase(fen, moveNumber) {
  const totalMaterial = getTotalMaterial(fen);
  const queensTraded = areQueensTraded(fen);
  if (moveNumber <= 10) {
    return {
      phase: "opening",
      totalMaterial,
      queensTraded
    };
  }
  if (queensTraded || totalMaterial <= 24) {
    return {
      phase: "endgame",
      totalMaterial,
      queensTraded
    };
  }
  return {
    phase: "middlegame",
    totalMaterial,
    queensTraded
  };
}
var PIECE_VALUES2;
var init_gamePhase = __esm({
  "src/engine/gamePhase.ts"() {
    "use strict";
    PIECE_VALUES2 = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0
    };
  }
});

// src/engine/positionComplexity.ts
function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}
function calculatePositionComplexity(moves) {
  if (moves.length <= 1) {
    return {
      level: "low",
      score: 0,
      spread: 0,
      closeCandidates: moves.length,
      volatility: 0
    };
  }
  const evaluations = moves.map((move) => move.evaluation).sort((a, b) => b - a);
  const best = evaluations[0];
  const spread = Math.abs(best - evaluations[evaluations.length - 1]);
  const closeCandidates = moves.filter((move) => Math.abs(best - move.evaluation) <= 35).length;
  const volatility = moves.length > 1 ? Math.abs(best - evaluations[Math.min(2, evaluations.length - 1)]) : 0;
  const spreadFactor = 1 - clamp(spread / 250);
  const closeFactor = clamp((closeCandidates - 1) / 5);
  const volatilityFactor = clamp(volatility / 150);
  const score = clamp(spreadFactor * 0.45 + closeFactor * 0.35 + volatilityFactor * 0.2);
  let level = "medium";
  if (score < 0.33) level = "low";
  if (score > 0.66) level = "high";
  return {
    level,
    score,
    spread,
    closeCandidates,
    volatility
  };
}
function adjustBucketConfigForComplexity(config, complexity) {
  const adjusted = { ...config };
  const intensity = complexity.score;
  if (complexity.level === "high") {
    adjusted.best = Math.max(0, adjusted.best - Math.round(6 * intensity));
    adjusted.great = Math.max(0, adjusted.great - Math.round(3 * intensity));
    adjusted.inaccuracy += Math.round(4 * intensity);
    adjusted.mistake += Math.round(3 * intensity);
    adjusted.blunder += Math.round(2 * intensity);
  } else if (complexity.level === "low") {
    adjusted.best += Math.round(5 * (1 - intensity));
    adjusted.great += Math.round(3 * (1 - intensity));
    adjusted.excellent += Math.round(2 * (1 - intensity));
    adjusted.mistake = Math.max(0, adjusted.mistake - 2);
    adjusted.blunder = Math.max(0, adjusted.blunder - 1);
  }
  const total = BUCKET_ORDER2.reduce((sum, bucket) => sum + adjusted[bucket], 0);
  if (total <= 0) {
    return config;
  }
  const normalized = BUCKET_ORDER2.reduce((result, bucket) => {
    result[bucket] = Math.round(adjusted[bucket] / total * 100);
    return result;
  }, {});
  const normalizedTotal = BUCKET_ORDER2.reduce((sum, bucket) => sum + normalized[bucket], 0);
  const diff = 100 - normalizedTotal;
  normalized.best += diff;
  return normalized;
}
var BUCKET_ORDER2;
var init_positionComplexity = __esm({
  "src/engine/positionComplexity.ts"() {
    "use strict";
    BUCKET_ORDER2 = [
      "best",
      "great",
      "excellent",
      "good",
      "inaccuracy",
      "mistake",
      "blunder"
    ];
  }
});

// src/engine/personaBias.ts
import { Chess as Chess3 } from "chess.js";
function getPersonaBehaviorMode(persona) {
  if (persona === "aggressive") {
    return "aggressive";
  }
  if (persona === "hard" || persona === "super_hard") {
    return "safe";
  }
  return "balanced";
}
function applyPersonaBucketBias(config, persona) {
  const mode = getPersonaBehaviorMode(persona);
  const adjusted = { ...config };
  if (mode === "aggressive") {
    adjusted.good += 3;
    adjusted.inaccuracy += 2;
    adjusted.best = Math.max(0, adjusted.best - 3);
    adjusted.great = Math.max(0, adjusted.great - 2);
  } else if (mode === "safe") {
    for (const bucket of SAFE_BUCKETS) {
      adjusted[bucket] += 2;
    }
    adjusted.mistake = Math.max(0, adjusted.mistake - 2);
    adjusted.blunder = Math.max(0, adjusted.blunder - 2);
  }
  return adjusted;
}
function getMoveTraitScore(fen, moveUci, persona) {
  const mode = getPersonaBehaviorMode(persona);
  if (mode === "balanced") {
    return 1;
  }
  const chess = new Chess3(fen);
  const move = chess.move({
    from: moveUci.slice(0, 2),
    to: moveUci.slice(2, 4),
    promotion: moveUci[4]
  });
  if (!move) {
    return 1;
  }
  const isCapture = move.flags.includes("c") || move.flags.includes("e");
  const isPromotion = Boolean(move.promotion);
  const isCastle = move.flags.includes("k") || move.flags.includes("q");
  const isCheck = chess.isCheck();
  if (mode === "aggressive") {
    return 1 + (isCapture ? 0.35 : 0) + (isCheck ? 0.35 : 0) + (isPromotion ? 0.45 : 0) + (isCastle ? 0.05 : 0);
  }
  return 1 + (isCastle ? 0.2 : 0) + (!isCapture ? 0.1 : 0) - (isPromotion ? 0.05 : 0);
}
function pickPersonaBiasedMove(fen, moves, persona, randomSource) {
  if (moves.length === 1) {
    return moves[0];
  }
  const weightedMoves = moves.map((move) => ({
    move,
    weight: Math.max(0.1, getMoveTraitScore(fen, move.move, persona))
  }));
  const totalWeight = weightedMoves.reduce((sum, entry) => sum + entry.weight, 0);
  let selection = randomSource.next() * totalWeight;
  for (const entry of weightedMoves) {
    selection -= entry.weight;
    if (selection <= 0) {
      return entry.move;
    }
  }
  return weightedMoves[weightedMoves.length - 1].move;
}
function calculateHumanDelayMs(options) {
  const { complexity, persona, bucket } = options;
  const mode = getPersonaBehaviorMode(persona);
  const base = 350;
  const complexityDelay = complexity ? Math.round(900 * complexity.score) : 0;
  const personaDelay = mode === "safe" ? 220 : mode === "aggressive" ? 80 : 140;
  const bucketDelay = bucket === "best" || bucket === "great" ? 120 : bucket === "mistake" || bucket === "blunder" ? 40 : 80;
  return base + complexityDelay + personaDelay + bucketDelay;
}
var SAFE_BUCKETS;
var init_personaBias = __esm({
  "src/engine/personaBias.ts"() {
    "use strict";
    SAFE_BUCKETS = ["best", "great", "excellent"];
  }
});

// src/viewmodels/EngineViewModel.ts
import { makeAutoObservable as makeAutoObservable2, action as action2, runInAction } from "mobx";
function canUseBrilliantMoveBudget(moveCount, fen) {
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
  return featureOptionsViewModel.brilliantAllowedPhase === "any" || featureOptionsViewModel.brilliantAllowedPhase === phase;
}
var logger, EngineViewModel, engineViewModel;
var init_EngineViewModel = __esm({
  "src/viewmodels/EngineViewModel.ts"() {
    "use strict";
    init_analysisSafety();
    init_engineCoordinator();
    init_moveClassifier();
    init_movePicker();
    init_analysisCache();
    init_FeatureOptionsViewModel();
    init_brilliantMove();
    init_gamePhase();
    init_positionComplexity();
    init_personaBias();
    init_random();
    init_debug();
    logger = createDebugLogger("EngineViewModel");
    EngineViewModel = class {
      isInitialized = false;
      isInitializing = false;
      analyzedMoves = [];
      lastPickedMove = null;
      error = null;
      lastComplexity = null;
      lastAnalysisFromCache = false;
      lastAnalysisPurpose = null;
      isMoveLaneAnalyzing = false;
      isBackgroundAnalyzing = false;
      nextRequestIds = {
        engineMove: 0,
        background: 0
      };
      latestRequestIds = {
        engineMove: 0,
        background: 0
      };
      activeAnalysisRuns = {
        engineMove: null,
        background: null
      };
      coordinator;
      constructor(dependencies = {}) {
        this.coordinator = dependencies.coordinator ?? engineCoordinator;
        makeAutoObservable2(this, {
          initialize: action2,
          analyzePosition: action2,
          pickMoveFromAnalysis: action2,
          reset: action2,
          setError: action2
        });
        logger.debug("Initialized");
      }
      /**
       * Initialize the Stockfish engine
       */
      async initialize() {
        if (this.isInitialized) {
          logger.debug("Already initialized");
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
          logger.debug("Initialization complete");
        } catch (err) {
          logger.error("Initialization error:", err);
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
      configure(options) {
        logger.debug("Configuring:", options);
        this.coordinator.configure("move", options);
        this.coordinator.configure("analysis", options);
      }
      /**
       * Analyze a position and classify moves
       */
      async analyzePosition(fen, depth = 20, multiPV = 12, purpose = "background") {
        logger.debug("analyzePosition called", { fen, depth, multiPV, purpose });
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
                ignored: isStaleAnalysisRequest(requestId, this.latestRequestIds[purpose]) || sharedResult.ignored
              };
            }
            if (purpose === "engineMove") {
              this.invalidatePurposeRequest(purpose);
              this.coordinator.stop(lane);
              await activeRun.promise.catch(() => void 0);
            }
            if (purpose === "background") {
              await activeRun.promise.catch(() => void 0);
            }
          }
          runInAction(() => {
            this.setLaneAnalyzing(purpose, true);
            this.error = null;
            if (purpose === "engineMove") {
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
            lane
          });
          this.activeAnalysisRuns[purpose] = {
            cacheKey,
            fen,
            purpose,
            promise: runPromise
          };
          try {
            return await runPromise;
          } finally {
            if (this.activeAnalysisRuns[purpose]?.promise === runPromise) {
              this.activeAnalysisRuns[purpose] = null;
            }
          }
        } catch (err) {
          logger.error("Analysis error:", err);
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
      pickMoveFromAnalysis(analysis, config, context) {
        logger.debug("pickMoveFromAnalysis called", {
          analyzedMovesCount: analysis.moves.length,
          config
        });
        if (analysis.ignored || analysis.moves.length === 0) {
          logger.debug("No analyzed moves available");
          return null;
        }
        const randomSource = featureOptionsViewModel.useDeterministicRng ? createSeededRandomSource(
          buildDeterministicSeed({
            gameStartFen: context.gameStartFen,
            currentFen: context.fen,
            moveCount: context.moveCount,
            sideToMove: context.sideToMove,
            persona: context.persona
          })
        ) : createLegacyRandomSource();
        let effectiveConfig = { ...config };
        if (featureOptionsViewModel.usePositionComplexity) {
          effectiveConfig = adjustBucketConfigForComplexity(effectiveConfig, analysis.complexity);
        }
        if (featureOptionsViewModel.usePersonaBehaviorBias) {
          effectiveConfig = applyPersonaBucketBias(effectiveConfig, context.persona);
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
                isBrilliant: true
              };
              runInAction(() => {
                this.lastPickedMove = brilliantResult;
              });
              return brilliantResult;
            }
          }
        }
        const bucketSelection = featureOptionsViewModel.useImprovedMoveClassification ? pickBucketWithClosestFallback(analysis.moves, effectiveConfig, () => randomSource.next()) : pickBucketLegacy(analysis.moves, effectiveConfig, () => randomSource.next());
        if (!bucketSelection) {
          return null;
        }
        const selectedMove = featureOptionsViewModel.usePersonaBehaviorBias ? pickPersonaBiasedMove(context.fen, bucketSelection.moves, context.persona, randomSource) : pickRandomMoveFromBucket(bucketSelection, () => randomSource.next());
        const result = {
          move: selectedMove,
          bucket: bucketSelection.bucket,
          isBrilliant: false
        };
        logger.debug("Picked move:", result);
        runInAction(() => {
          this.lastPickedMove = result;
        });
        return result;
      }
      /**
       * Stop current analysis
       */
      stopAnalysis() {
        logger.debug("stopAnalysis called");
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
      newGame() {
        logger.debug("newGame called");
        this.coordinator.newGame();
        this.reset();
      }
      /**
       * Reset state
       */
      reset() {
        logger.debug("reset called");
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
      setError(message) {
        this.error = message;
      }
      /**
       * Get move statistics by bucket
       */
      get moveStats() {
        return getMoveStats(this.analyzedMoves);
      }
      /**
       * Get moves grouped by bucket
       */
      get movesByBucket() {
        return groupMovesByBucket(this.analyzedMoves);
      }
      /**
       * Get the best move (if available)
       */
      get bestMove() {
        return this.analyzedMoves.length > 0 ? this.analyzedMoves[0] : null;
      }
      /**
       * Check if there are analyzed moves
       */
      get hasAnalyzedMoves() {
        return this.analyzedMoves.length > 0;
      }
      /**
       * Destroy the engine
       */
      destroy() {
        logger.debug("destroy called");
        this.coordinator.destroy();
        runInAction(() => {
          this.isInitialized = false;
        });
      }
      async performPositionAnalysis(options) {
        const { fen, depth, multiPV, cacheKey, requestId, purpose, lane } = options;
        let cachedClassifiedMoves;
        let fromCache = false;
        let moves = [];
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
          logger.debug("Starting analysis...");
          moves = await this.coordinator.analyzePosition(lane, fen);
          logger.debug("Analysis complete, got", moves.length, "moves");
          if (featureOptionsViewModel.useMoveAnalysisCache) {
            analysisCache.set({
              key: cacheKey,
              moves,
              timestamp: Date.now()
            });
          }
        } else {
          logger.debug("Using cached analysis for current position");
        }
        const classified = cachedClassifiedMoves ?? classifyMoves(moves);
        const complexity = calculatePositionComplexity(moves);
        const ignored = isStaleAnalysisRequest(requestId, this.latestRequestIds[purpose]);
        if (featureOptionsViewModel.useMoveAnalysisCache && moves.length > 0) {
          analysisCache.set({
            key: cacheKey,
            moves,
            classifiedMoves: classified,
            timestamp: Date.now()
          });
        }
        if (!ignored) {
          runInAction(() => {
            this.lastAnalysisFromCache = fromCache;
            this.lastAnalysisPurpose = purpose;
            if (purpose === "engineMove") {
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
          purpose
        };
      }
      get analysisStatusLabel() {
        if (this.error) {
          return "Engine error";
        }
        if (this.isInitializing) {
          return "Starting engine";
        }
        if (this.isMoveLaneAnalyzing) {
          return "Analyzing position";
        }
        if (this.isBackgroundAnalyzing) {
          return "Running background analysis";
        }
        if (!this.isInitialized) {
          return "Not initialized";
        }
        if (this.lastAnalysisPurpose === null) {
          return "Ready";
        }
        return this.lastAnalysisFromCache ? "Ready (cache warm)" : "Ready";
      }
      get isAnalyzing() {
        return this.isMoveLaneAnalyzing || this.isBackgroundAnalyzing;
      }
      get isMoveLaneBusy() {
        return this.isInitializing || this.isMoveLaneAnalyzing;
      }
      get isBackgroundLaneBusy() {
        return this.isBackgroundAnalyzing;
      }
      invalidatePendingRequests() {
        this.latestRequestIds.engineMove = ++this.nextRequestIds.engineMove;
        this.latestRequestIds.background = ++this.nextRequestIds.background;
      }
      invalidatePurposeRequest(purpose) {
        this.latestRequestIds[purpose] = ++this.nextRequestIds[purpose];
      }
      getLaneForPurpose(purpose) {
        return purpose === "engineMove" ? "move" : "analysis";
      }
      setLaneAnalyzing(purpose, analyzing) {
        if (purpose === "engineMove") {
          this.isMoveLaneAnalyzing = analyzing;
          return;
        }
        this.isBackgroundAnalyzing = analyzing;
      }
    };
    engineViewModel = new EngineViewModel();
  }
});

// src/viewmodels/ConfigViewModel.ts
import { makeAutoObservable as makeAutoObservable3, action as action3, reaction as reaction2 } from "mobx";
var ConfigViewModel, configViewModel;
var init_ConfigViewModel = __esm({
  "src/viewmodels/ConfigViewModel.ts"() {
    "use strict";
    init_types();
    init_featureOptions();
    init_movePicker();
    init_FeatureOptionsViewModel();
    ConfigViewModel = class {
      bucketConfig = { ...DEFAULT_BUCKET_CONFIG };
      /** Id of the active preset, or null if using custom distribution */
      currentPresetId = "medium";
      depth = 8;
      multiPV = 12;
      constructor() {
        makeAutoObservable3(this, {
          setBucketValue: action3,
          setBucketConfig: action3,
          applyProfileSnapshot: action3,
          applyPreset: action3,
          resetToDefaults: action3,
          normalizeConfig: action3,
          setDepth: action3,
          setMultiPV: action3
        });
        this.restoreFromStorage();
        reaction2(
          () => ({
            bucketConfig: this.bucketConfig,
            currentPresetId: this.currentPresetId,
            depth: this.depth,
            multiPV: this.multiPV,
            persistEngineConfig: featureOptionsViewModel.persistEngineConfig
          }),
          ({ persistEngineConfig }) => {
            if (!persistEngineConfig) {
              this.clearPersistedStorage();
              return;
            }
            this.persistToStorage();
          },
          { fireImmediately: true }
        );
      }
      /**
       * Set the percentage value for a specific bucket
       */
      setBucketValue(bucket, value) {
        const clampedValue = Math.max(0, Math.min(100, value));
        this.currentPresetId = null;
        this.bucketConfig = {
          ...this.bucketConfig,
          [bucket]: clampedValue
        };
      }
      /**
       * Set the full bucket config (e.g. when applying a preset)
       */
      setBucketConfig(config) {
        this.bucketConfig = { ...config };
      }
      applyProfileSnapshot(snapshot) {
        this.bucketConfig = { ...snapshot.bucketConfig };
        this.currentPresetId = snapshot.currentPresetId;
        this.depth = Math.max(1, Math.min(30, snapshot.depth));
        this.multiPV = Math.max(1, Math.min(20, snapshot.multiPV));
      }
      /**
       * Apply a predefined move quality preset by id
       */
      applyPreset(presetId) {
        const preset = MOVE_QUALITY_PRESETS.find((p) => p.id === presetId);
        if (preset) {
          this.currentPresetId = presetId;
          this.bucketConfig = { ...preset.config };
        }
      }
      /**
       * Reset bucket configuration to defaults (medium preset)
       */
      resetToDefaults() {
        this.currentPresetId = "medium";
        this.bucketConfig = { ...DEFAULT_BUCKET_CONFIG };
      }
      /**
       * Normalize the configuration so percentages sum to 100
       */
      normalizeConfig() {
        this.bucketConfig = normalizeBucketConfig(this.bucketConfig);
      }
      /**
       * Set analysis depth
       */
      setDepth(value) {
        this.depth = Math.max(1, Math.min(30, value));
      }
      /**
       * Set MultiPV value
       */
      setMultiPV(value) {
        this.multiPV = Math.max(1, Math.min(20, value));
      }
      /**
       * Get total percentage sum
       */
      get totalPercentage() {
        return Object.values(this.bucketConfig).reduce((sum, val) => sum + val, 0);
      }
      /**
       * Check if configuration is valid (sums to 100)
       */
      get isValid() {
        const { valid } = validateBucketConfig(this.bucketConfig);
        return valid;
      }
      /**
       * Get the validation state
       */
      get validationState() {
        return validateBucketConfig(this.bucketConfig);
      }
      get activePersonaId() {
        return this.currentPresetId;
      }
      get activePersonaLabel() {
        if (this.currentPresetId === null) {
          return "Custom";
        }
        return MOVE_QUALITY_PRESETS.find((preset) => preset.id === this.currentPresetId)?.label ?? "Custom";
      }
      restoreFromStorage() {
        try {
          const saved = localStorage.getItem(ENGINE_CONFIG_STORAGE_KEY);
          if (!saved) {
            return;
          }
          const parsed = JSON.parse(saved);
          if (parsed.bucketConfig) {
            this.bucketConfig = { ...DEFAULT_BUCKET_CONFIG, ...parsed.bucketConfig };
          }
          if (parsed.currentPresetId !== void 0) {
            this.currentPresetId = parsed.currentPresetId;
          }
          if (typeof parsed.depth === "number") {
            this.depth = Math.max(1, Math.min(30, parsed.depth));
          }
          if (typeof parsed.multiPV === "number") {
            this.multiPV = Math.max(1, Math.min(20, parsed.multiPV));
          }
        } catch (error) {
          console.error("[ConfigViewModel] Failed to restore engine config:", error);
        }
      }
      persistToStorage() {
        try {
          const snapshot = {
            bucketConfig: this.bucketConfig,
            currentPresetId: this.currentPresetId,
            depth: this.depth,
            multiPV: this.multiPV
          };
          localStorage.setItem(ENGINE_CONFIG_STORAGE_KEY, JSON.stringify(snapshot));
        } catch (error) {
          console.error("[ConfigViewModel] Failed to persist engine config:", error);
        }
      }
      clearPersistedStorage() {
        try {
          localStorage.removeItem(ENGINE_CONFIG_STORAGE_KEY);
        } catch (error) {
          console.error("[ConfigViewModel] Failed to clear engine config storage:", error);
        }
      }
    };
    configViewModel = new ConfigViewModel();
  }
});

// src/viewmodels/UiStateViewModel.ts
import { action as action4, makeAutoObservable as makeAutoObservable4 } from "mobx";
var BOARD_SIZE_PRESET_PIXELS, UI_PREFERENCES_STORAGE_KEY, DEFAULT_UI_PREFERENCES, AUTO_PLAY_SPEED_DELAYS, UiStateViewModel, uiStateViewModel;
var init_UiStateViewModel = __esm({
  "src/viewmodels/UiStateViewModel.ts"() {
    "use strict";
    BOARD_SIZE_PRESET_PIXELS = {
      small: 480,
      medium: 640,
      large: 800,
      xlarge: 960
    };
    UI_PREFERENCES_STORAGE_KEY = "personachess_ui_preferences";
    DEFAULT_UI_PREFERENCES = {
      basicMode: true,
      animationSpeed: "normal",
      soundEnabled: true,
      soundMuted: false,
      soundVolume: 70,
      autoPlaySpeed: "normal",
      themeMode: "dark",
      boardSizePreset: "medium",
      selectedSettingsTab: "general"
    };
    AUTO_PLAY_SPEED_DELAYS = {
      slow: 1200,
      normal: 700,
      fast: 350
    };
    UiStateViewModel = class {
      settingsOpen = false;
      basicMode = DEFAULT_UI_PREFERENCES.basicMode;
      animationSpeed = DEFAULT_UI_PREFERENCES.animationSpeed;
      soundEnabled = DEFAULT_UI_PREFERENCES.soundEnabled;
      soundMuted = DEFAULT_UI_PREFERENCES.soundMuted;
      soundVolume = DEFAULT_UI_PREFERENCES.soundVolume;
      autoPlaySpeed = DEFAULT_UI_PREFERENCES.autoPlaySpeed;
      themeMode = DEFAULT_UI_PREFERENCES.themeMode;
      boardSizePreset = DEFAULT_UI_PREFERENCES.boardSizePreset;
      selectedSettingsTab = DEFAULT_UI_PREFERENCES.selectedSettingsTab;
      constructor() {
        makeAutoObservable4(this, {
          setSettingsOpen: action4,
          applyProfilePreferences: action4,
          setBasicMode: action4,
          setAnimationSpeed: action4,
          setSoundEnabled: action4,
          setSoundMuted: action4,
          setSoundVolume: action4,
          setAutoPlaySpeed: action4,
          setThemeMode: action4,
          setBoardSizePreset: action4,
          setSelectedSettingsTab: action4
        });
        this.restoreFromStorage();
      }
      setSettingsOpen(open) {
        this.settingsOpen = open;
      }
      applyProfilePreferences(preferences) {
        this.basicMode = preferences.basicMode ?? this.basicMode;
        this.themeMode = preferences.themeMode ?? this.themeMode;
        this.persistToStorage();
      }
      setBasicMode(enabled) {
        this.basicMode = enabled;
        this.persistToStorage();
      }
      setAnimationSpeed(speed) {
        this.animationSpeed = speed;
        this.persistToStorage();
      }
      setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        this.persistToStorage();
      }
      setSoundMuted(muted) {
        this.soundMuted = muted;
        this.persistToStorage();
      }
      setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(100, Math.round(volume)));
        this.persistToStorage();
      }
      setAutoPlaySpeed(speed) {
        this.autoPlaySpeed = speed;
        this.persistToStorage();
      }
      setThemeMode(themeMode) {
        this.themeMode = themeMode;
        this.persistToStorage();
      }
      setBoardSizePreset(boardSizePreset) {
        this.boardSizePreset = boardSizePreset;
        this.persistToStorage();
      }
      setSelectedSettingsTab(tab) {
        this.selectedSettingsTab = tab;
        this.persistToStorage();
      }
      restoreFromStorage() {
        try {
          const saved = localStorage.getItem(UI_PREFERENCES_STORAGE_KEY);
          if (!saved) {
            return;
          }
          const parsed = JSON.parse(saved);
          this.basicMode = parsed.basicMode ?? DEFAULT_UI_PREFERENCES.basicMode;
          this.animationSpeed = parsed.animationSpeed ?? DEFAULT_UI_PREFERENCES.animationSpeed;
          this.soundEnabled = parsed.soundEnabled ?? DEFAULT_UI_PREFERENCES.soundEnabled;
          this.soundMuted = parsed.soundMuted ?? DEFAULT_UI_PREFERENCES.soundMuted;
          this.soundVolume = typeof parsed.soundVolume === "number" ? Math.max(0, Math.min(100, Math.round(parsed.soundVolume))) : DEFAULT_UI_PREFERENCES.soundVolume;
          this.autoPlaySpeed = parsed.autoPlaySpeed ?? DEFAULT_UI_PREFERENCES.autoPlaySpeed;
          this.themeMode = parsed.themeMode ?? DEFAULT_UI_PREFERENCES.themeMode;
          this.boardSizePreset = parsed.boardSizePreset ?? DEFAULT_UI_PREFERENCES.boardSizePreset;
          this.selectedSettingsTab = parsed.selectedSettingsTab ?? DEFAULT_UI_PREFERENCES.selectedSettingsTab;
        } catch {
        }
      }
      persistToStorage() {
        try {
          localStorage.setItem(
            UI_PREFERENCES_STORAGE_KEY,
            JSON.stringify({
              basicMode: this.basicMode,
              animationSpeed: this.animationSpeed,
              soundEnabled: this.soundEnabled,
              soundMuted: this.soundMuted,
              soundVolume: this.soundVolume,
              autoPlaySpeed: this.autoPlaySpeed,
              themeMode: this.themeMode,
              boardSizePreset: this.boardSizePreset,
              selectedSettingsTab: this.selectedSettingsTab
            })
          );
        } catch {
        }
      }
      get boardSizePx() {
        return BOARD_SIZE_PRESET_PIXELS[this.boardSizePreset];
      }
      get autoPlayDelayMs() {
        return AUTO_PLAY_SPEED_DELAYS[this.autoPlaySpeed];
      }
      get effectiveSoundVolume() {
        if (!this.soundEnabled || this.soundMuted) {
          return 0;
        }
        return this.soundVolume / 100;
      }
      getPersonaAccentTone(personaId) {
        switch (personaId) {
          case "aggressive":
            return "red";
          case "hard":
          case "super_hard":
            return "gold";
          case "low":
            return "green";
          case "medium":
          case null:
          default:
            return "blue";
        }
      }
    };
    uiStateViewModel = new UiStateViewModel();
  }
});

// src/viewmodels/BoardViewModel.ts
import { makeAutoObservable as makeAutoObservable5, action as action5, reaction as reaction3, runInAction as runInAction2 } from "mobx";
import { Chess as Chess4 } from "chess.js";
var logger2, BoardViewModel, boardViewModel;
var init_BoardViewModel = __esm({
  "src/viewmodels/BoardViewModel.ts"() {
    "use strict";
    init_analysisSafety();
    init_brilliantTracking();
    init_gameSession();
    init_EngineViewModel();
    init_ConfigViewModel();
    init_FeatureOptionsViewModel();
    init_debug();
    init_types();
    init_personaBias();
    init_moveClassifier();
    init_UiStateViewModel();
    logger2 = createDebugLogger("BoardViewModel");
    BoardViewModel = class {
      chess = new Chess4();
      fen = this.chess.fen();
      gameStartFen = this.chess.fen();
      gameSessionId = createGameSessionId();
      sessionStartedAt = Date.now();
      history = [];
      lastMove = null;
      lastPlayedBucket = null;
      statusMessage = "Ready";
      lastSkippedEngineMoveMessage = null;
      isThinking = false;
      autoPlayEnabled = true;
      // Auto-play engine moves after human moves
      enginePlaysFor = "b";
      // Which side the engine plays for (default: black)
      boardFlipped = false;
      // Board orientation (false = white on bottom, true = black on bottom)
      showMoveArrows = false;
      // Show arrows for all possible moves
      showArrowsForSide = "current";
      // Which side's moves to show arrows for
      lastPlayerMoveQuality = null;
      // Quality of the last player move
      isAnalyzingMoves = false;
      // Whether we're currently analyzing moves
      autoPlayPaused = false;
      autoPlayScheduledFor = 0;
      currentSetupName = "New Game";
      currentSetupCategory = "custom";
      recentMoveFeedback = null;
      autoPlayAccumulatedMs = 0;
      autoPlayLastResumedAt = null;
      // Store analyzed moves as an object for MobX observability
      _analyzedLegalMoves = {};
      redoStack = [];
      // Stack of moves that were undone for redo functionality
      historyAnnotations = [];
      redoAnnotations = [];
      analyzedLegalMovesFen = null;
      _analysisTimeout = null;
      // Timeout for debouncing move analysis
      _autoPlayTimeout = null;
      _playerMoveAnalysisTimeout = null;
      FEN_STORAGE_KEY = "personachess_current_fen";
      FEN_HISTORY_KEY = "personachess_fen_history";
      BOARD_STATE_STORAGE_KEY = "personachess_board_state";
      MAX_HISTORY = 50;
      // Maximum number of FEN positions to store
      constructor() {
        makeAutoObservable5(this, {
          loadFen: action5,
          loadPgn: action5,
          loadGameSetupPreset: action5,
          makeMove: action5,
          solveNextMove: action5,
          reset: action5,
          undo: action5,
          undoSingle: action5,
          redoSingle: action5,
          setAutoPlay: action5,
          setAutoPlayPaused: action5,
          startAutoPlayTurn: action5,
          toggleAutoPlayPause: action5,
          setEnginePlaysFor: action5,
          flipBoard: action5,
          setBoardFlipped: action5,
          saveFenToHistory: action5,
          loadFenFromHistory: action5,
          toggleMoveArrows: action5,
          setShowMoveArrowsEnabled: action5,
          setShowArrowsForSide: action5,
          analyzeAllMoves: action5,
          analyzePlayerMove: action5
        });
        this.restoreFenFromStorage();
        reaction3(
          () => featureOptionsViewModel.persistEngineConfig,
          (persistEngineConfig) => {
            if (!persistEngineConfig) {
              this.clearPersistedBoardState();
              return;
            }
            this.saveFenToHistory();
          },
          { fireImmediately: true }
        );
        logger2.debug("Initialized with FEN:", this.fen);
      }
      /**
       * Set auto-play mode
       */
      setAutoPlay(enabled) {
        if (this.autoPlayEnabled && !enabled) {
          this.stopAutoPlayDurationTracking();
        }
        this.autoPlayEnabled = enabled;
        if (!enabled) {
          this.autoPlayPaused = false;
          this.clearAutoPlaySchedule();
        } else {
          this.startAutoPlayDurationTracking();
        }
        this.syncAutoPlaySchedule();
        logger2.debug("Auto-play set to:", enabled);
      }
      setAutoPlayPaused(paused) {
        if (paused) {
          this.stopAutoPlayDurationTracking();
        } else {
          this.startAutoPlayDurationTracking();
        }
        this.autoPlayPaused = paused;
        if (paused) {
          this.clearAutoPlaySchedule();
        } else {
          this.syncAutoPlaySchedule();
        }
      }
      async startAutoPlayTurn() {
        if (!this.canStartAutoPlayTurn) {
          return;
        }
        this.clearAutoPlaySchedule();
        await this.solveNextMove(true);
      }
      toggleAutoPlayPause() {
        this.setAutoPlayPaused(!this.autoPlayPaused);
      }
      /**
       * Set which side the engine plays for
       */
      setEnginePlaysFor(side) {
        this.enginePlaysFor = side;
        this.syncAutoPlaySchedule();
        logger2.debug("Engine plays for:", side === "w" ? "White" : "Black");
      }
      /**
       * Load a position from FEN string
       */
      loadFen(fen, options = {}) {
        try {
          const {
            resetBrilliantTracking = true,
            sessionId,
            gameStartFen,
            historyAnnotations,
            redoAnnotations,
            setupName,
            setupCategory
          } = options;
          logger2.debug("loadFen called:", fen);
          const newChess = new Chess4(fen);
          this.chess = newChess;
          this.beginSessionState({
            gameSessionId: sessionId ?? createGameSessionId(),
            gameStartFen: gameStartFen ?? fen,
            resetBrilliantTracking,
            historyAnnotations,
            redoAnnotations,
            setupName,
            setupCategory
          });
          this.resetTransientBoardState();
          this.updateState();
          this.statusMessage = "Position loaded";
          this.lastSkippedEngineMoveMessage = null;
          this.recentMoveFeedback = null;
          engineViewModel.reset();
          logger2.debug("FEN loaded successfully");
          return true;
        } catch (err) {
          logger2.error("loadFen error:", err);
          this.statusMessage = `Invalid FEN: ${err}`;
          return false;
        }
      }
      /**
       * Load a game from PGN string
       */
      loadPgn(pgn2, options = {}) {
        try {
          const {
            resetBrilliantTracking = true,
            sessionId,
            setupName,
            setupCategory
          } = options;
          logger2.debug("loadPgn called");
          const newChess = new Chess4();
          newChess.loadPgn(pgn2);
          const gameStartFen = resolvePgnStartFen(newChess.header(), new Chess4().fen());
          this.chess = newChess;
          this.beginSessionState({
            gameSessionId: sessionId ?? createGameSessionId(),
            gameStartFen,
            resetBrilliantTracking,
            setupName,
            setupCategory
          });
          this.resetTransientBoardState();
          this.updateState();
          this.statusMessage = "PGN loaded";
          this.lastSkippedEngineMoveMessage = null;
          this.recentMoveFeedback = null;
          engineViewModel.reset();
          return true;
        } catch (err) {
          logger2.error("loadPgn error:", err);
          this.statusMessage = `Invalid PGN: ${err}`;
          return false;
        }
      }
      loadGameSetupPreset(preset) {
        const sideLabel = preset.side === "white" ? "White" : "Black";
        const loaded = preset.sourceType === "fen" ? this.loadFen(preset.source, {
          setupName: preset.name,
          setupCategory: preset.category
        }) : this.loadPgn(preset.source, {
          setupName: preset.name,
          setupCategory: preset.category
        });
        if (loaded) {
          this.statusMessage = `${preset.name} loaded (${sideLabel})`;
        }
        return loaded;
      }
      /**
       * Make a move on the board (similar to the example pattern)
       * This is synchronous for immediate UI feedback, just like the example
       */
      makeMove(from, to, promotion = "q") {
        logger2.debug("makeMove called", { from, to, promotion, currentFen: this.fen, currentTurn: this.chess.turn() });
        try {
          const move = this.chess.move({
            from,
            to,
            promotion
          });
          if (move) {
            logger2.debug("Move successful:", move.san);
            this.clearRedoState();
            this.recordMoveAnnotation(move, false, "player");
            this.updateState();
            this.lastMove = { from, to };
            this.lastPlayedBucket = null;
            this.statusMessage = `You played: ${move.san}`;
            this.publishMoveFeedback({
              actor: "player",
              move,
              isBrilliant: false
            });
            engineViewModel.reset();
            this.lastSkippedEngineMoveMessage = null;
            const shouldAutoPlayNow = this.autoPlayEnabled && !this.isGameOver && this.chess.turn() === this.enginePlaysFor;
            if (shouldAutoPlayNow) {
              logger2.debug("Scheduling auto-play for engine side:", this.enginePlaysFor);
              this.scheduleAutoPlayMove();
            }
            this.schedulePlayerMoveAnalysis(move);
            return true;
          } else {
            logger2.debug("Move failed - chess.js returned null");
            return false;
          }
        } catch (err) {
          logger2.debug("Move exception:", err);
          return false;
        }
      }
      /**
       * Make a move from UCI notation (e.g., "e2e4")
       * Used by the engine
       */
      async makeMoveUCI(uci, options = {}) {
        if (uci.length < 4) return false;
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const promotion = uci.length > 4 ? uci[4] : void 0;
        try {
          const move = this.chess.move({
            from,
            to,
            promotion
          });
          if (move) {
            this.clearRedoState();
            this.recordMoveAnnotation(move, options.consumedBrilliant ?? false, "engine");
            this.updateState();
            this.lastMove = { from, to };
            this.lastPlayedBucket = null;
            this.statusMessage = `Engine played: ${move.san}`;
            this.publishMoveFeedback({
              actor: "engine",
              move,
              isBrilliant: options.consumedBrilliant ?? false
            });
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
      async solveNextMove(autoTriggered = false) {
        if (this.isGameOver) {
          this.statusMessage = "Game is over";
          return null;
        }
        try {
          runInAction2(() => {
            this.isThinking = true;
            this.statusMessage = "Engine thinking...";
            this.clearAutoPlaySchedule();
          });
          if (!engineViewModel.isInitialized) {
            await engineViewModel.initialize();
          }
          const analysis = await engineViewModel.analyzePosition(
            this.fen,
            configViewModel.depth,
            configViewModel.multiPV,
            "engineMove"
          );
          if (analysis.ignored || analysis.moves.length === 0) {
            runInAction2(() => {
              if (analysis.ignored) {
                this.statusMessage = "Engine analysis expired";
              } else if (this.isCheckmate) {
                this.statusMessage = "Checkmate! Game over.";
              } else if (this.isStalemate) {
                this.statusMessage = "Stalemate! Game over.";
              } else if (this.isDraw) {
                this.statusMessage = "Draw! Game over.";
              } else {
                this.statusMessage = "No legal moves available";
              }
              this.lastSkippedEngineMoveMessage = analysis.ignored ? "A newer engine analysis replaced this move request." : null;
              this.isThinking = false;
            });
            return null;
          }
          const persona = configViewModel.currentPresetId ?? "custom";
          const result = engineViewModel.pickMoveFromAnalysis(analysis, configViewModel.bucketConfig, {
            fen: this.fen,
            gameStartFen: this.gameStartFen,
            moveCount: this.moveCount,
            sideToMove: this.turn,
            persona
          });
          if (result) {
            if (autoTriggered && featureOptionsViewModel.useHumanDelaySimulation) {
              const delayMs = calculateHumanDelayMs({
                complexity: analysis.complexity,
                persona,
                bucket: result.bucket
              });
              await this.wait(delayMs);
            }
            if (!canApplyAnalyzedMove(this.fen, analysis.analyzedFen)) {
              runInAction2(() => {
                this.statusMessage = "Position changed, stale engine move discarded";
                this.lastSkippedEngineMoveMessage = "Skipped engine move because the board changed before it could be played.";
                this.isThinking = false;
              });
              return null;
            }
            const moveSuccess = await this.makeMoveUCI(result.move.move, {
              consumedBrilliant: result.isBrilliant ?? false
            });
            if (moveSuccess) {
              this.updateLastAnnotation({
                bucket: result.bucket,
                evalLoss: result.move.evalLoss,
                evaluation: result.move.evaluation,
                complexityLevel: analysis.complexity.level,
                complexityScore: analysis.complexity.score
              });
              runInAction2(() => {
                this.lastPlayedBucket = result.bucket;
                this.statusMessage = result.isBrilliant ? "Engine played: Brilliant move" : `Engine played: ${BUCKET_LABELS[result.bucket]} move`;
                this.lastSkippedEngineMoveMessage = null;
                this.isThinking = false;
              });
            } else {
              runInAction2(() => {
                this.statusMessage = "Engine move failed";
                this.isThinking = false;
              });
            }
            return result;
          } else {
            runInAction2(() => {
              this.statusMessage = "No moves available";
              this.isThinking = false;
            });
            return null;
          }
        } catch (err) {
          logger2.error("solveNextMove error:", err);
          runInAction2(() => {
            this.statusMessage = `Error: ${err}`;
            this.isThinking = false;
          });
          return null;
        }
      }
      /**
       * Reset the board to starting position
       */
      reset() {
        logger2.debug("reset called");
        this.chess = new Chess4();
        this.beginSessionState({
          gameSessionId: createGameSessionId(),
          gameStartFen: this.chess.fen(),
          resetBrilliantTracking: true,
          setupName: "New Game",
          setupCategory: "custom"
        });
        this.resetTransientBoardState();
        this.updateState();
        this.lastMove = null;
        this.lastPlayedBucket = null;
        this.statusMessage = "Board reset";
        this.lastSkippedEngineMoveMessage = null;
        this.recentMoveFeedback = null;
        engineViewModel.reset();
        logger2.debug("Board reset, new FEN:", this.fen);
      }
      /**
       * Undo the last move (or last two moves if auto-play is on and engine just moved)
       */
      undo() {
        logger2.debug("undo called, history length:", this.history.length);
        if (this.autoPlayEnabled && this.history.length >= 2) {
          const lastMove = this.history[this.history.length - 1];
          const lastMoveColor = lastMove.color;
          if (lastMoveColor === this.enginePlaysFor) {
            if (this.undoMoves(2)) {
              this.updateState();
              this.lastMove = null;
              this.lastPlayedBucket = null;
              this.statusMessage = "Undid last 2 moves (human + engine)";
              this.clearAutoPlaySchedule();
              this.clearPendingPlayerMoveAnalysis();
              engineViewModel.reset();
              logger2.debug("Undid 2 moves");
              return true;
            }
          } else {
            if (this.undoMoves(1)) {
              this.updateState();
              this.lastMove = null;
              this.lastPlayedBucket = null;
              this.statusMessage = "Move undone";
              this.clearAutoPlaySchedule();
              this.clearPendingPlayerMoveAnalysis();
              engineViewModel.reset();
              logger2.debug("Undid 1 move");
              return true;
            }
          }
        } else {
          if (this.undoMoves(1)) {
            this.updateState();
            this.lastMove = null;
            this.lastPlayedBucket = null;
            this.statusMessage = "Move undone";
            this.clearAutoPlaySchedule();
            this.clearPendingPlayerMoveAnalysis();
            engineViewModel.reset();
            logger2.debug("Undid 1 move");
            return true;
          }
        }
        logger2.debug("Undo failed - no moves to undo");
        return false;
      }
      /**
       * Update internal state from chess instance
       */
      updateState() {
        this.fen = this.chess.fen();
        this.history = this.chess.history({ verbose: true });
        this.analyzedLegalMovesFen = null;
        this.saveFenToHistory();
        logger2.debug("updateState - FEN:", this.fen, "History length:", this.history.length);
        if (this.showMoveArrows && !this.isGameOver && !this.isAnalyzingMoves) {
          this._analyzedLegalMoves = {};
          if (this._analysisTimeout) {
            clearTimeout(this._analysisTimeout);
          }
          this._analysisTimeout = setTimeout(() => {
            this.analyzeAllMoves().catch((err) => {
              logger2.error("Failed to analyze moves:", err);
            });
          }, 300);
        }
      }
      /**
       * Flip the board orientation and engine playing color
       */
      flipBoard() {
        this.boardFlipped = !this.boardFlipped;
        this.enginePlaysFor = this.enginePlaysFor === "w" ? "b" : "w";
        logger2.debug("Board flipped, orientation:", this.boardFlipped ? "black" : "white", "Engine now plays for:", this.enginePlaysFor === "w" ? "White" : "Black");
      }
      setBoardFlipped(flipped) {
        if (this.boardFlipped !== flipped) {
          this.flipBoard();
        }
      }
      /**
       * Save current FEN to localStorage history
       */
      saveFenToHistory() {
        try {
          const currentFen = this.fen;
          localStorage.setItem(this.FEN_STORAGE_KEY, currentFen);
          const historyJson = localStorage.getItem(this.FEN_HISTORY_KEY);
          let history = historyJson ? JSON.parse(historyJson) : [];
          if (history.length === 0 || history[history.length - 1] !== currentFen) {
            history.push(currentFen);
            if (history.length > this.MAX_HISTORY) {
              history = history.slice(-this.MAX_HISTORY);
            }
            localStorage.setItem(this.FEN_HISTORY_KEY, JSON.stringify(history));
          }
          if (featureOptionsViewModel.persistEngineConfig) {
            const boardState = {
              currentFen,
              fenHistory: history,
              gameSessionId: this.gameSessionId,
              gameStartFen: this.gameStartFen,
              currentSetupName: this.currentSetupName,
              currentSetupCategory: this.currentSetupCategory,
              historyAnnotations: this.historyAnnotations,
              redoAnnotations: this.redoAnnotations
            };
            localStorage.setItem(this.BOARD_STATE_STORAGE_KEY, JSON.stringify(boardState));
          } else {
            this.clearPersistedBoardState();
          }
          logger2.debug("Saved FEN to history, total entries:", history.length);
        } catch (err) {
          logger2.error("Failed to save FEN to history:", err);
        }
      }
      /**
       * Restore FEN from localStorage on app startup
       */
      restoreFenFromStorage() {
        try {
          const savedFen = localStorage.getItem(this.FEN_STORAGE_KEY);
          if (savedFen) {
            const testChess = new Chess4();
            try {
              testChess.load(savedFen);
              const restoredBoardState = this.readPersistedBoardState();
              if (restoredBoardState?.currentFen === savedFen) {
                this.loadFen(savedFen, {
                  resetBrilliantTracking: false,
                  sessionId: restoredBoardState.gameSessionId,
                  gameStartFen: restoredBoardState.gameStartFen,
                  historyAnnotations: restoredBoardState.historyAnnotations,
                  redoAnnotations: restoredBoardState.redoAnnotations,
                  setupName: restoredBoardState.currentSetupName,
                  setupCategory: restoredBoardState.currentSetupCategory
                });
              } else {
                this.loadFen(savedFen, {
                  resetBrilliantTracking: false
                });
              }
              if (featureOptionsViewModel.brilliantGameSessionId !== this.gameSessionId) {
                featureOptionsViewModel.resetBrilliantTracking(this.gameSessionId);
              }
              this.statusMessage = "Restored position from previous session";
              logger2.debug("Restored FEN from storage:", savedFen);
            } catch (err) {
              logger2.warn("Saved FEN is invalid, using default:", err);
              localStorage.removeItem(this.FEN_STORAGE_KEY);
            }
          }
        } catch (err) {
          logger2.error("Failed to restore FEN from storage:", err);
        }
      }
      /**
       * Load FEN from history by index
       */
      loadFenFromHistory(index) {
        try {
          const historyJson = localStorage.getItem(this.FEN_HISTORY_KEY);
          if (!historyJson) return false;
          const history = JSON.parse(historyJson);
          if (index < 0 || index >= history.length) return false;
          const fen = history[index];
          return this.loadFen(fen);
        } catch (err) {
          logger2.error("Failed to load FEN from history:", err);
          return false;
        }
      }
      /**
       * Get FEN history
       */
      get fenHistory() {
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
      get lastSavedFen() {
        try {
          return localStorage.getItem(this.FEN_STORAGE_KEY);
        } catch {
          return null;
        }
      }
      /**
       * Toggle showing move arrows
       */
      toggleMoveArrows() {
        if (this._analysisTimeout) {
          clearTimeout(this._analysisTimeout);
          this._analysisTimeout = null;
        }
        this.showMoveArrows = !this.showMoveArrows;
        if (this.showMoveArrows && Object.keys(this._analyzedLegalMoves).length === 0 && !this.isAnalyzingMoves) {
          this.analyzeAllMoves().catch((err) => {
            console.error("[BoardViewModel] Failed to analyze moves:", err);
          });
        } else if (!this.showMoveArrows) {
          this._analyzedLegalMoves = {};
          this.analyzedLegalMovesFen = null;
        }
      }
      setShowMoveArrowsEnabled(enabled) {
        if (this.showMoveArrows !== enabled) {
          this.toggleMoveArrows();
        }
      }
      /**
       * Set which side's moves to show arrows for
       */
      setShowArrowsForSide(side) {
        this.showArrowsForSide = side;
        logger2.debug("Show arrows for side:", side);
        if (this.showMoveArrows) {
          this._analyzedLegalMoves = {};
          this.analyzedLegalMovesFen = null;
          this.analyzeAllMoves();
        }
      }
      /**
       * Analyze all legal moves for the current position
       */
      async analyzeAllMoves() {
        if (this.isGameOver || this.isAnalyzingMoves) {
          return;
        }
        if (this.analyzedLegalMovesFen === this.fen && Object.keys(this._analyzedLegalMoves).length > 0) {
          return;
        }
        try {
          runInAction2(() => {
            this.isAnalyzingMoves = true;
            this._analyzedLegalMoves = {};
          });
          const legalMoves = this.allLegalMoves;
          if (legalMoves.length === 0) {
            runInAction2(() => {
              this.isAnalyzingMoves = false;
            });
            return;
          }
          if (!engineViewModel.isInitialized) {
            await engineViewModel.initialize();
          }
          const analysis = await engineViewModel.analyzePosition(
            this.fen,
            configViewModel.depth,
            configViewModel.multiPV,
            "background"
          );
          if (analysis.ignored || !canApplyAnalyzedMove(this.fen, analysis.analyzedFen)) {
            runInAction2(() => {
              this.isAnalyzingMoves = false;
            });
            return;
          }
          const moveMap = mapLegalMovesToBuckets(
            legalMoves.map((move) => `${move.from}${move.to}${move.promotion || ""}`),
            analysis.moves,
            featureOptionsViewModel.useImprovedMoveClassification
          );
          runInAction2(() => {
            this._analyzedLegalMoves = moveMap;
            this.isAnalyzingMoves = false;
          });
          this.analyzedLegalMovesFen = this.fen;
          logger2.debug("Analyzed", Object.keys(moveMap).length, "legal moves");
        } catch (err) {
          logger2.error("Failed to analyze moves:", err);
          runInAction2(() => {
            this.isAnalyzingMoves = false;
          });
        }
      }
      /**
       * Analyze the quality of a player's move
       * This should be called after the move is made, analyzing the position before the move
       */
      async analyzePlayerMove(move) {
        setTimeout(async () => {
          try {
            const expectedAfterFen = move.after;
            if (!engineViewModel.isInitialized) {
              await engineViewModel.initialize();
            }
            const history = this.chess.history({ verbose: true });
            if (history.length === 0) {
              return;
            }
            const lastMoveInHistory = history[history.length - 1];
            const beforeFen = lastMoveInHistory.before || this.fen;
            const analysis = await engineViewModel.analyzePosition(
              beforeFen,
              Math.min(configViewModel.depth, 15),
              // Use smaller depth for faster analysis
              configViewModel.multiPV,
              "background"
            );
            if (analysis.ignored || !canApplyAnalyzedMove(beforeFen, analysis.analyzedFen) || this.fen !== expectedAfterFen) {
              return;
            }
            const moveUCI = `${move.from}${move.to}${move.promotion || ""}`;
            const analyzedMove = analysis.moves.find((m) => m.move === moveUCI);
            if (analyzedMove) {
              runInAction2(() => {
                this.lastPlayerMoveQuality = analyzedMove.bucket;
                const qualityLabel = BUCKET_LABELS[analyzedMove.bucket];
                this.statusMessage = `You played: ${move.san} (${qualityLabel})`;
                this.publishMoveFeedback({
                  actor: "player",
                  move,
                  isBrilliant: false,
                  qualityLabel,
                  bucket: analyzedMove.bucket,
                  silent: true
                });
              });
              logger2.debug("Player move quality:", analyzedMove.bucket);
            } else {
              runInAction2(() => {
                if (featureOptionsViewModel.useImprovedMoveClassification) {
                  this.lastPlayerMoveQuality = "fallback";
                  this.statusMessage = `You played: ${move.san} (Fallback move)`;
                  this.publishMoveFeedback({
                    actor: "player",
                    move,
                    isBrilliant: false,
                    qualityLabel: "Fallback move",
                    bucket: "fallback",
                    silent: true
                  });
                } else {
                  this.lastPlayerMoveQuality = "good";
                  this.statusMessage = `You played: ${move.san} (Good)`;
                  this.publishMoveFeedback({
                    actor: "player",
                    move,
                    isBrilliant: false,
                    qualityLabel: "Good",
                    bucket: "good",
                    silent: true
                  });
                }
              });
            }
          } catch (err) {
            logger2.error("Failed to analyze player move:", err);
          }
        }, 100);
      }
      schedulePlayerMoveAnalysis(move) {
        this.clearPendingPlayerMoveAnalysis();
        const attemptAnalysis = () => {
          this._playerMoveAnalysisTimeout = null;
          const autoPlayPending = this.autoPlayEnabled && !this.autoPlayPaused && !this.isGameOver && (this.isThinking || this.isAutoPlayCountingDown || this.turn === this.enginePlaysFor);
          if (autoPlayPending) {
            this._playerMoveAnalysisTimeout = setTimeout(attemptAnalysis, 150);
            return;
          }
          void this.analyzePlayerMove(move);
        };
        this._playerMoveAnalysisTimeout = setTimeout(attemptAnalysis, 0);
      }
      /**
       * Get arrows data for react-chessboard
       * Returns array of Arrow objects with startSquare, endSquare, and color properties
       * Only shows arrows for Excellent, Good, Mistake, and Blunder moves
       * Limited to maximum 3 arrows per quality bucket
       */
      get moveArrows() {
        if (!this.showMoveArrows || Object.keys(this._analyzedLegalMoves).length === 0) {
          return [];
        }
        const allowedBuckets = ["excellent", "good", "mistake", "blunder"];
        const maxArrowsPerBucket = 3;
        let legalMoves = this.allLegalMoves;
        if (this.showArrowsForSide === "player") {
          const playerSide = this.enginePlaysFor === "w" ? "b" : "w";
          legalMoves = legalMoves.filter((move) => {
            const piece = this.getPieceAt(move.from);
            return piece && piece.color === playerSide;
          });
        } else if (this.showArrowsForSide === "engine") {
          legalMoves = legalMoves.filter((move) => {
            const piece = this.getPieceAt(move.from);
            return piece && piece.color === this.enginePlaysFor;
          });
        }
        const isValidSquare = (square) => {
          if (!square || typeof square !== "string") return false;
          return /^[a-h][1-8]$/.test(square);
        };
        const movesByBucket = {
          excellent: [],
          good: [],
          mistake: [],
          blunder: [],
          best: [],
          // Not used but needed for type
          great: [],
          // Not used but needed for type
          inaccuracy: []
          // Not used but needed for type
        };
        for (const move of legalMoves) {
          if (!isValidSquare(move.from) || !isValidSquare(move.to)) {
            logger2.debug("Skipping invalid move:", move);
            continue;
          }
          const uci = `${move.from}${move.to}${move.promotion || ""}`;
          const bucket = this._analyzedLegalMoves[uci];
          if (bucket && bucket !== "fallback" && allowedBuckets.includes(bucket) && isValidSquare(move.from) && isValidSquare(move.to)) {
            movesByBucket[bucket].push({
              startSquare: move.from,
              endSquare: move.to,
              color: BUCKET_COLORS[bucket]
            });
          }
        }
        const arrows = [];
        for (const bucket of allowedBuckets) {
          const bucketArrows = movesByBucket[bucket].slice(0, maxArrowsPerBucket);
          arrows.push(...bucketArrows);
          logger2.debug(`Added ${bucketArrows.length} ${bucket} arrows (found ${movesByBucket[bucket].length} total)`);
        }
        logger2.debug("Generated", arrows.length, "total arrows");
        return arrows;
      }
      /**
       * Get analyzed legal moves count (for UI display)
       */
      get analyzedLegalMovesCount() {
        return Object.keys(this._analyzedLegalMoves).length;
      }
      /**
       * Get current turn (white/black)
       */
      get turn() {
        return this.chess.turn();
      }
      /**
       * Get turn as string
       */
      get turnString() {
        return this.turn === "w" ? "White" : "Black";
      }
      /**
       * Check if game is over
       */
      get isGameOver() {
        return this.chess.isGameOver();
      }
      /**
       * Check if it's checkmate
       */
      get isCheckmate() {
        return this.chess.isCheckmate();
      }
      /**
       * Check if it's stalemate
       */
      get isStalemate() {
        return this.chess.isStalemate();
      }
      /**
       * Check if it's a draw
       */
      get isDraw() {
        return this.chess.isDraw();
      }
      /**
       * Check if king is in check
       */
      get isCheck() {
        return this.chess.isCheck();
      }
      /**
       * Get game status text
       */
      get gameStatus() {
        if (this.isCheckmate) {
          return `Checkmate! ${this.turn === "w" ? "Black" : "White"} wins`;
        }
        if (this.isStalemate) {
          return "Stalemate!";
        }
        if (this.isDraw) {
          return "Draw!";
        }
        if (this.isCheck) {
          return `${this.turnString} is in check`;
        }
        return `${this.turnString} to move`;
      }
      /**
       * Get legal moves for a square
       */
      getLegalMoves(square) {
        return this.chess.moves({ square, verbose: true });
      }
      /**
       * Get piece at square (for UI visual indicators)
       */
      getPieceAt(square) {
        return this.chess.get(square);
      }
      /**
       * Get all legal moves
       */
      get allLegalMoves() {
        return this.chess.moves({ verbose: true });
      }
      /**
       * Get move count
       */
      get moveCount() {
        return this.chess.moveNumber();
      }
      /**
       * Undo a single move (for the new undo button)
       */
      undoSingle() {
        logger2.debug("undoSingle called, history length:", this.history.length);
        if (this.history.length === 0) {
          return false;
        }
        const move = this.chess.undo();
        if (move) {
          this.redoStack.push(move);
          const annotation = this.historyAnnotations.pop();
          if (annotation) {
            this.redoAnnotations.push(annotation);
          }
          this.syncBrilliantTrackingFromAnnotations();
          this.updateState();
          if (this.history.length > 0) {
            const lastMoveInHistory = this.history[this.history.length - 1];
            this.lastMove = { from: lastMoveInHistory.from, to: lastMoveInHistory.to };
          } else {
            this.lastMove = null;
          }
          this.lastPlayedBucket = null;
          this.statusMessage = "Undid 1 move";
          this.clearAutoPlaySchedule();
          this.clearPendingPlayerMoveAnalysis();
          engineViewModel.reset();
          logger2.debug("Undid 1 move, redo stack size:", this.redoStack.length);
          return true;
        }
        return false;
      }
      /**
       * Redo a single move
       */
      redoSingle() {
        logger2.debug("redoSingle called, redo stack size:", this.redoStack.length);
        if (this.redoStack.length === 0) {
          return false;
        }
        const moveToRedo = this.redoStack.pop();
        if (!moveToRedo) {
          return false;
        }
        const annotationToRedo = this.redoAnnotations.pop();
        try {
          const move = this.chess.move({
            from: moveToRedo.from,
            to: moveToRedo.to,
            promotion: moveToRedo.promotion
          });
          if (move) {
            this.historyAnnotations.push(
              annotationToRedo ?? this.createMoveAnnotation(move, false, "redo")
            );
            this.syncBrilliantTrackingFromAnnotations();
            this.updateState();
            this.lastMove = { from: move.from, to: move.to };
            this.lastPlayedBucket = null;
            this.statusMessage = `Redid: ${move.san}`;
            this.publishMoveFeedback({
              actor: "redo",
              move,
              isBrilliant: annotationToRedo?.consumedBrilliant ?? false
            });
            this.clearPendingPlayerMoveAnalysis();
            engineViewModel.reset();
            logger2.debug("Redid 1 move");
            if (this.autoPlayEnabled && !this.isGameOver && this.chess.turn() === this.enginePlaysFor) {
              logger2.debug("Scheduling auto-play after redo");
              this.scheduleAutoPlayMove();
            }
            return true;
          }
        } catch (err) {
          logger2.error("Redo failed:", err);
          this.redoStack.push(moveToRedo);
          if (annotationToRedo) {
            this.redoAnnotations.push(annotationToRedo);
          }
        }
        return false;
      }
      /**
       * Check if undo is available
       */
      get canUndo() {
        return this.history.length > 0;
      }
      /**
       * Check if redo is available
       */
      get canRedo() {
        return this.redoStack.length > 0;
      }
      get autoPlayCurrentSideLabel() {
        return this.enginePlaysFor === "w" ? "White" : "Black";
      }
      get canStartAutoPlayTurn() {
        return this.autoPlayEnabled && !this.autoPlayPaused && !this.isThinking && !this.isGameOver && this.turn === this.enginePlaysFor;
      }
      get isAutoPlayCountingDown() {
        return this.autoPlayScheduledFor > Date.now();
      }
      get autoPlayCountdownMsRemaining() {
        return this.isAutoPlayCountingDown ? Math.max(0, this.autoPlayScheduledFor - Date.now()) : 0;
      }
      get moveHistoryRows() {
        const rows = [];
        for (let index = 0; index < this.history.length; index += 2) {
          const whiteMove = this.history[index] ?? null;
          const blackMove = this.history[index + 1] ?? null;
          const moveNumber = whiteMove?.moveNumber ?? blackMove?.moveNumber ?? rows.length + 1;
          rows.push({
            moveNumber,
            white: whiteMove,
            black: blackMove
          });
        }
        return rows;
      }
      get debugSessionId() {
        return this.gameSessionId;
      }
      get moveAnnotations() {
        return this.historyAnnotations.map((annotation) => ({ ...annotation }));
      }
      get autoPlayActiveDurationMs() {
        if (this.autoPlayEnabled && !this.autoPlayPaused && this.autoPlayLastResumedAt !== null) {
          return this.autoPlayAccumulatedMs + (Date.now() - this.autoPlayLastResumedAt);
        }
        return this.autoPlayAccumulatedMs;
      }
      get hasSkippedEngineMoveNotice() {
        return this.lastSkippedEngineMoveMessage !== null;
      }
      /**
       * Export current game as PGN
       */
      get pgn() {
        return this.chess.pgn();
      }
      get lastPlayerMoveQualityLabel() {
        return this.lastPlayerMoveQuality ? DISPLAY_BUCKET_LABELS[this.lastPlayerMoveQuality] : null;
      }
      get lastPlayerMoveQualityColor() {
        return this.lastPlayerMoveQuality ? DISPLAY_BUCKET_COLORS[this.lastPlayerMoveQuality] : null;
      }
      wait(delayMs) {
        return new Promise((resolve) => {
          setTimeout(resolve, delayMs);
        });
      }
      get canScheduleAutoPlay() {
        return this.autoPlayEnabled && !this.autoPlayPaused && !this.isThinking && !this.isGameOver && this.turn === this.enginePlaysFor;
      }
      beginSessionState(options) {
        this.stopAutoPlayDurationTracking();
        this.gameSessionId = options.gameSessionId;
        this.gameStartFen = options.gameStartFen;
        this.sessionStartedAt = Date.now();
        this.currentSetupName = options.setupName ?? "Custom Position";
        this.currentSetupCategory = options.setupCategory ?? "custom";
        this.historyAnnotations = [...options.historyAnnotations ?? []];
        this.redoAnnotations = [...options.redoAnnotations ?? []];
        this.redoStack = this.createRedoStackFromAnnotations(this.redoAnnotations);
        this.autoPlayAccumulatedMs = 0;
        this.autoPlayLastResumedAt = this.autoPlayEnabled && !this.autoPlayPaused ? Date.now() : null;
        this.clearAutoPlaySchedule();
        if (options.resetBrilliantTracking) {
          featureOptionsViewModel.resetBrilliantTracking(this.gameSessionId);
        } else {
          this.syncBrilliantTrackingFromAnnotations();
        }
      }
      clearRedoState() {
        this.redoStack = [];
        this.redoAnnotations = [];
      }
      createMoveAnnotation(move, consumedBrilliant, actor) {
        const timestamp = Date.now();
        const previousTimestamp = this.historyAnnotations[this.historyAnnotations.length - 1]?.timestamp ?? this.sessionStartedAt;
        return {
          beforeFen: move.before ?? this.fen,
          afterFen: move.after ?? this.chess.fen(),
          uci: `${move.from}${move.to}${move.promotion || ""}`,
          moveNumber: this.chess.moveNumber(),
          consumedBrilliant,
          actor,
          san: move.san,
          timestamp,
          delayMsSincePrevious: Math.max(0, timestamp - previousTimestamp)
        };
      }
      recordMoveAnnotation(move, consumedBrilliant, actor) {
        this.historyAnnotations.push(this.createMoveAnnotation(move, consumedBrilliant, actor));
        this.syncBrilliantTrackingFromAnnotations();
      }
      syncBrilliantTrackingFromAnnotations() {
        const usage = deriveBrilliantUsage(this.historyAnnotations);
        featureOptionsViewModel.reconcileBrilliantTracking(
          this.gameSessionId,
          usage.brilliantMoveNumbers
        );
      }
      scheduleAutoPlayMove(delayMs = uiStateViewModel.autoPlayDelayMs) {
        this.clearAutoPlaySchedule();
        if (!this.canScheduleAutoPlay) {
          return;
        }
        this.autoPlayScheduledFor = Date.now() + delayMs;
        this._autoPlayTimeout = setTimeout(() => {
          runInAction2(() => {
            this.autoPlayScheduledFor = 0;
          });
          this.solveNextMove(true).catch((err) => {
            logger2.error("Auto-play error:", err);
          });
        }, delayMs);
      }
      clearAutoPlaySchedule() {
        if (this._autoPlayTimeout) {
          clearTimeout(this._autoPlayTimeout);
          this._autoPlayTimeout = null;
        }
        this.autoPlayScheduledFor = 0;
      }
      clearPendingPlayerMoveAnalysis() {
        if (this._playerMoveAnalysisTimeout) {
          clearTimeout(this._playerMoveAnalysisTimeout);
          this._playerMoveAnalysisTimeout = null;
        }
      }
      resetTransientBoardState() {
        if (this._analysisTimeout) {
          clearTimeout(this._analysisTimeout);
          this._analysisTimeout = null;
        }
        this.clearAutoPlaySchedule();
        this.clearPendingPlayerMoveAnalysis();
        this.isThinking = false;
        this.isAnalyzingMoves = false;
        this.autoPlayPaused = false;
        this.autoPlayScheduledFor = 0;
        this.lastPlayerMoveQuality = null;
        this._analyzedLegalMoves = {};
        this.analyzedLegalMovesFen = null;
      }
      syncAutoPlaySchedule() {
        if (this.canScheduleAutoPlay) {
          this.scheduleAutoPlayMove();
          return;
        }
        this.clearAutoPlaySchedule();
      }
      stopAutoPlayDurationTracking() {
        if (this.autoPlayLastResumedAt !== null) {
          this.autoPlayAccumulatedMs += Date.now() - this.autoPlayLastResumedAt;
          this.autoPlayLastResumedAt = null;
        }
      }
      startAutoPlayDurationTracking() {
        if (this.autoPlayEnabled && !this.autoPlayPaused && this.autoPlayLastResumedAt === null) {
          this.autoPlayLastResumedAt = Date.now();
        }
      }
      updateLastAnnotation(partial) {
        if (this.historyAnnotations.length === 0) {
          return;
        }
        const lastIndex = this.historyAnnotations.length - 1;
        this.historyAnnotations[lastIndex] = {
          ...this.historyAnnotations[lastIndex],
          ...partial
        };
        this.saveFenToHistory();
      }
      publishMoveFeedback(options) {
        this.recentMoveFeedback = {
          id: `${Date.now()}_${options.move.san}_${options.actor}`,
          actor: options.actor,
          san: options.move.san,
          qualityLabel: options.qualityLabel ?? null,
          bucket: options.bucket ?? null,
          isBrilliant: options.isBrilliant,
          isCapture: options.move.isCapture(),
          isCheck: options.move.san.includes("+") || options.move.san.includes("#"),
          isGameEnd: this.isGameOver,
          silent: options.silent ?? false,
          createdAt: Date.now()
        };
      }
      undoMoves(count) {
        const undoneMoves = [];
        const undoneAnnotations = [];
        for (let index = 0; index < count; index += 1) {
          const move = this.chess.undo();
          if (!move) {
            for (let restoreIndex = undoneMoves.length - 1; restoreIndex >= 0; restoreIndex -= 1) {
              const restoreMove = undoneMoves[restoreIndex];
              this.chess.move({
                from: restoreMove.from,
                to: restoreMove.to,
                promotion: restoreMove.promotion
              });
            }
            return false;
          }
          undoneMoves.push(move);
          const annotation = this.historyAnnotations.pop();
          if (annotation) {
            undoneAnnotations.push(annotation);
          }
        }
        this.redoStack.push(...undoneMoves);
        this.redoAnnotations.push(...undoneAnnotations);
        this.syncBrilliantTrackingFromAnnotations();
        return true;
      }
      readPersistedBoardState() {
        try {
          if (!featureOptionsViewModel.persistEngineConfig) {
            return null;
          }
          const saved = localStorage.getItem(this.BOARD_STATE_STORAGE_KEY);
          if (!saved) {
            return null;
          }
          const parsed = JSON.parse(saved);
          return {
            currentFen: parsed.currentFen ?? "",
            fenHistory: Array.isArray(parsed.fenHistory) ? parsed.fenHistory : [],
            gameSessionId: parsed.gameSessionId ?? createGameSessionId(),
            gameStartFen: parsed.gameStartFen ?? parsed.currentFen ?? new Chess4().fen(),
            historyAnnotations: Array.isArray(parsed.historyAnnotations) ? parsed.historyAnnotations : [],
            redoAnnotations: Array.isArray(parsed.redoAnnotations) ? parsed.redoAnnotations : []
          };
        } catch {
          return null;
        }
      }
      clearPersistedBoardState() {
        try {
          localStorage.removeItem(this.BOARD_STATE_STORAGE_KEY);
        } catch (error) {
          logger2.error("Failed to clear board state storage:", error);
        }
      }
      createRedoStackFromAnnotations(annotations) {
        return annotations.map((annotation) => ({
          from: annotation.uci.slice(0, 2),
          to: annotation.uci.slice(2, 4),
          promotion: annotation.uci.length > 4 ? annotation.uci[4] : void 0
        }));
      }
    };
    boardViewModel = new BoardViewModel();
  }
});

// src/engine/gameAnalytics.ts
var gameAnalytics_exports = {};
__export(gameAnalytics_exports, {
  buildGameAnalyticsSummary: () => buildGameAnalyticsSummary,
  buildRecentGameEntry: () => buildRecentGameEntry,
  serializeGameAnalyticsSummary: () => serializeGameAnalyticsSummary
});
function createEmptyQualityCounts() {
  return ALL_BUCKETS.reduce((counts, bucket) => {
    counts[bucket] = 0;
    return counts;
  }, {});
}
function classifyResult(gameStatus) {
  if (/checkmate/i.test(gameStatus)) {
    const winner = gameStatus.includes("White wins") ? "White" : gameStatus.includes("Black wins") ? "Black" : "Decisive";
    return `${winner} won`;
  }
  if (/stalemate|draw/i.test(gameStatus)) {
    return "Draw";
  }
  if (/check/i.test(gameStatus)) {
    return "In progress";
  }
  return "In progress";
}
function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}
function buildGameAnalyticsSummary(options) {
  const qualityCounts = createEmptyQualityCounts();
  const complexityDistribution = {
    low: 0,
    medium: 0,
    high: 0
  };
  let evalLossTotal = 0;
  let evalLossCount = 0;
  let delayTotal = 0;
  let delayCount = 0;
  let brilliantMoves = 0;
  const moveTimeline = options.moveAnnotations.map((annotation, index) => {
    const bucket = annotation.bucket ?? null;
    const typedBucket = ALL_BUCKETS.includes(bucket) ? bucket : null;
    if (typedBucket) {
      qualityCounts[typedBucket] += 1;
    }
    if (annotation.consumedBrilliant) {
      brilliantMoves += 1;
    }
    if (typeof annotation.evalLoss === "number") {
      evalLossTotal += annotation.evalLoss;
      evalLossCount += 1;
    }
    if (typeof annotation.delayMsSincePrevious === "number") {
      delayTotal += annotation.delayMsSincePrevious;
      delayCount += 1;
    }
    if (annotation.complexityLevel) {
      complexityDistribution[annotation.complexityLevel] += 1;
    }
    return {
      ply: index + 1,
      actor: annotation.actor ?? "player",
      san: annotation.san ?? annotation.uci,
      bucket,
      evalLoss: annotation.evalLoss ?? null,
      evaluation: annotation.evaluation ?? null,
      complexityLevel: annotation.complexityLevel ?? null,
      complexityScore: annotation.complexityScore ?? null,
      delayMsSincePrevious: annotation.delayMsSincePrevious ?? 0,
      consumedBrilliant: annotation.consumedBrilliant
    };
  });
  const highlightedBrilliantMoves = moveTimeline.filter((entry) => entry.consumedBrilliant).map((entry) => ({ ply: entry.ply, san: entry.san }));
  const majorMistakes = moveTimeline.filter((entry) => entry.bucket === "mistake" || entry.bucket === "blunder").map((entry) => ({
    ply: entry.ply,
    san: entry.san,
    bucket: entry.bucket,
    evalLoss: entry.evalLoss
  }));
  const evalTrend = moveTimeline.filter((entry) => typeof entry.evaluation === "number").map((entry) => ({ ply: entry.ply, evaluation: entry.evaluation }));
  const complexityTrend = moveTimeline.filter((entry) => typeof entry.complexityScore === "number").map((entry) => ({ ply: entry.ply, score: entry.complexityScore }));
  return {
    sessionId: options.sessionId,
    createdAt: new Date(options.createdAtMs).toISOString(),
    finishedAt: new Date(options.finishedAtMs).toISOString(),
    result: classifyResult(options.gameStatus),
    gameStatus: options.gameStatus,
    personaId: options.personaId ?? "custom",
    personaLabel: options.personaLabel,
    setupName: options.setupName ?? "New Game",
    setupCategory: options.setupCategory ?? "custom",
    moveCount: moveTimeline.length,
    brilliantMoves,
    inaccuracies: qualityCounts.inaccuracy,
    mistakes: qualityCounts.mistake,
    blunders: qualityCounts.blunder,
    averageEvalLoss: evalLossCount > 0 ? roundToOneDecimal(evalLossTotal / evalLossCount) : 0,
    averageMoveDelayMs: delayCount > 0 ? Math.round(delayTotal / delayCount) : 0,
    autoplayDurationMs: Math.max(0, options.autoplayDurationMs),
    qualityCounts,
    complexityDistribution,
    moveTimeline,
    highlightedBrilliantMoves,
    majorMistakes,
    evalTrend,
    complexityTrend,
    pgn: options.pgn
  };
}
function buildRecentGameEntry(summary) {
  return {
    sessionId: summary.sessionId,
    finishedAt: summary.finishedAt,
    result: summary.result,
    personaLabel: summary.personaLabel,
    personaId: summary.personaId,
    setupName: summary.setupName,
    durationMs: Math.max(0, new Date(summary.finishedAt).getTime() - new Date(summary.createdAt).getTime()),
    moveCount: summary.moveCount,
    brilliantMoves: summary.brilliantMoves
  };
}
function serializeGameAnalyticsSummary(summary) {
  return JSON.stringify(summary, null, 2);
}
var ALL_BUCKETS;
var init_gameAnalytics = __esm({
  "src/engine/gameAnalytics.ts"() {
    "use strict";
    ALL_BUCKETS = [
      "best",
      "great",
      "excellent",
      "good",
      "inaccuracy",
      "mistake",
      "blunder",
      "fallback"
    ];
  }
});

// src/viewmodels/GameAnalyticsViewModel.ts
import { action as action6, makeAutoObservable as makeAutoObservable6, reaction as reaction4 } from "mobx";
function downloadTextFile(fileName, contents, mimeType) {
  if (typeof document === "undefined") {
    return;
  }
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
function safeParseRecentGames(saved) {
  if (!saved) {
    return [];
  }
  try {
    const parsed = JSON.parse(saved);
    const recentGames = Array.isArray(parsed) ? parsed : Array.isArray(parsed.recentGames) ? parsed.recentGames : [];
    return recentGames.filter((entry) => typeof entry?.sessionId === "string" && typeof entry?.finishedAt === "string" && typeof entry?.personaLabel === "string" && typeof entry?.setupName === "string");
  } catch {
    return [];
  }
}
var RECENT_GAMES_STORAGE_KEY, MAX_RECENT_GAMES, GameAnalyticsViewModel, gameAnalyticsViewModel;
var init_GameAnalyticsViewModel = __esm({
  "src/viewmodels/GameAnalyticsViewModel.ts"() {
    "use strict";
    init_gameAnalytics();
    init_BoardViewModel();
    init_ConfigViewModel();
    RECENT_GAMES_STORAGE_KEY = "personachess_recent_games";
    MAX_RECENT_GAMES = 20;
    GameAnalyticsViewModel = class {
      summaryOpen = false;
      recentGames = [];
      selectedRecentGameSessionId = null;
      lastCapturedSessionId = null;
      deps;
      constructor(deps = {
        boardViewModel,
        configViewModel
      }) {
        this.deps = deps;
        makeAutoObservable6(this, {
          setSummaryOpen: action6,
          setSelectedRecentGameSessionId: action6,
          captureCompletedGame: action6,
          clearRecentGames: action6
        });
        this.restoreFromStorage();
        reaction4(
          () => ({
            sessionId: this.deps.boardViewModel.debugSessionId,
            isGameOver: this.deps.boardViewModel.isGameOver,
            moveCount: this.deps.boardViewModel.moveAnnotations.length
          }),
          ({ sessionId, isGameOver, moveCount }) => {
            if (isGameOver && moveCount > 0 && this.lastCapturedSessionId !== sessionId) {
              this.captureCompletedGame();
              this.summaryOpen = true;
            }
          }
        );
      }
      setSummaryOpen(open) {
        if (open) {
          this.selectedRecentGameSessionId = null;
        }
        this.summaryOpen = open;
      }
      setSelectedRecentGameSessionId(sessionId) {
        this.selectedRecentGameSessionId = sessionId;
      }
      captureCompletedGame() {
        const summary = this.currentSummary;
        if (!summary) {
          return;
        }
        const updated = [summary, ...this.recentGames.filter((entry) => entry.sessionId !== summary.sessionId)].slice(0, MAX_RECENT_GAMES);
        this.recentGames = updated;
        this.selectedRecentGameSessionId = summary.sessionId;
        this.lastCapturedSessionId = summary.sessionId;
        this.persistToStorage();
      }
      clearRecentGames() {
        this.recentGames = [];
        this.selectedRecentGameSessionId = null;
        this.persistToStorage();
      }
      exportCurrentSummary() {
        const summary = this.currentSummary;
        if (!summary) {
          return;
        }
        downloadTextFile(`personachess-summary-${summary.sessionId}.json`, serializeGameAnalyticsSummary(summary), "application/json");
      }
      exportCurrentPgn() {
        const summary = this.currentSummary;
        if (!summary) {
          return;
        }
        downloadTextFile(`personachess-game-${summary.sessionId}.pgn`, summary.pgn, "application/x-chess-pgn");
      }
      get currentSummary() {
        const annotations = this.deps.boardViewModel.moveAnnotations;
        if (annotations.length === 0) {
          return null;
        }
        return buildGameAnalyticsSummary({
          sessionId: this.deps.boardViewModel.debugSessionId,
          createdAtMs: this.deps.boardViewModel.sessionStartedAt,
          finishedAtMs: Date.now(),
          gameStatus: this.deps.boardViewModel.gameStatus,
          personaId: this.deps.configViewModel.activePersonaId,
          personaLabel: this.deps.configViewModel.activePersonaLabel,
          setupName: this.deps.boardViewModel.currentSetupName,
          setupCategory: this.deps.boardViewModel.currentSetupCategory,
          autoplayDurationMs: this.deps.boardViewModel.autoPlayActiveDurationMs,
          moveAnnotations: annotations,
          pgn: this.deps.boardViewModel.pgn
        });
      }
      get selectedRecentGame() {
        return this.recentGames.find((entry) => entry.sessionId === this.selectedRecentGameSessionId) ?? null;
      }
      get recentGameEntries() {
        return this.recentGames.map((summary) => buildRecentGameEntry(summary));
      }
      restoreFromStorage() {
        try {
          this.recentGames = safeParseRecentGames(localStorage.getItem(RECENT_GAMES_STORAGE_KEY));
          this.selectedRecentGameSessionId = this.recentGames[0]?.sessionId ?? null;
        } catch {
          this.recentGames = [];
          this.selectedRecentGameSessionId = null;
        }
      }
      persistToStorage() {
        try {
          const snapshot = {
            recentGames: this.recentGames
          };
          localStorage.setItem(RECENT_GAMES_STORAGE_KEY, JSON.stringify(snapshot));
        } catch {
        }
      }
    };
    gameAnalyticsViewModel = new GameAnalyticsViewModel();
  }
});

// src/engine/openings.ts
var openings_exports = {};
__export(openings_exports, {
  PREDEFINED_OPENINGS: () => PREDEFINED_OPENINGS,
  getOpeningById: () => getOpeningById
});
function pgn(moves) {
  const moveText = moves.trim().endsWith("*") ? moves.trim() : `${moves.trim()} *`;
  return `[Event "?"]
[Site "?"]
[Date "????.??.??"]
[White "?"]
[Black "?"]
[Result "*"]

${moveText}`;
}
function getOpeningById(id) {
  return PREDEFINED_OPENINGS.find((o) => o.id === id);
}
var PREDEFINED_OPENINGS;
var init_openings = __esm({
  "src/engine/openings.ts"() {
    "use strict";
    PREDEFINED_OPENINGS = [
      {
        id: "napoleon",
        name: "King's Pawn: Napoleon Attack",
        side: "white",
        description: "1. e4 e5 2. Qh5",
        pgn: pgn("1. e4 e5 2. Qh5")
      },
      {
        id: "italian",
        name: "Italian Game",
        side: "white",
        description: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
        pgn: pgn("1. e4 e5 2. Nf3 Nc6 3. Bc4")
      },
      {
        id: "ruy_lopez",
        name: "Ruy Lopez",
        side: "white",
        description: "1. e4 e5 2. Nf3 Nc6 3. Bb5",
        pgn: pgn("1. e4 e5 2. Nf3 Nc6 3. Bb5")
      },
      {
        id: "sicilian",
        name: "Sicilian Defense",
        side: "black",
        description: "1. e4 c5",
        pgn: pgn("1. e4 c5")
      },
      {
        id: "french",
        name: "French Defense",
        side: "black",
        description: "1. e4 e6",
        pgn: pgn("1. e4 e6")
      },
      {
        id: "caro_kann",
        name: "Caro-Kann",
        side: "black",
        description: "1. e4 c6",
        pgn: pgn("1. e4 c6")
      },
      {
        id: "queens_gambit",
        name: "Queen's Gambit",
        side: "white",
        description: "1. d4 d5 2. c4",
        pgn: pgn("1. d4 d5 2. c4")
      },
      {
        id: "london",
        name: "London System",
        side: "white",
        description: "1. d4 d5 2. Bf4",
        pgn: pgn("1. d4 d5 2. Bf4")
      },
      {
        id: "kings_indian",
        name: "King's Indian Defense",
        side: "black",
        description: "1. d4 Nf6 2. c4 g6",
        pgn: pgn("1. d4 Nf6 2. c4 g6")
      },
      {
        id: "pirc",
        name: "Pirc Defense",
        side: "black",
        description: "1. e4 d6 2. d4 Nf6",
        pgn: pgn("1. e4 d6 2. d4 Nf6")
      }
    ];
  }
});

// src/engine/gameSetupPresets.ts
var gameSetupPresets_exports = {};
__export(gameSetupPresets_exports, {
  GAME_SETUP_CATEGORY_OPTIONS: () => GAME_SETUP_CATEGORY_OPTIONS,
  GAME_SETUP_PRESETS: () => GAME_SETUP_PRESETS,
  describeGameSetupPreset: () => describeGameSetupPreset,
  filterGameSetupPresets: () => filterGameSetupPresets,
  getGameSetupPresetById: () => getGameSetupPresetById,
  getOpeningPresetById: () => getOpeningPresetById,
  toCompatibleOpeningPreset: () => toCompatibleOpeningPreset
});
function openingDifficultyTag(name) {
  if (/napoleon/i.test(name)) {
    return "easy";
  }
  if (/italian|london|queen/i.test(name)) {
    return "medium";
  }
  return "hard";
}
function getGameSetupPresetById(id) {
  return GAME_SETUP_PRESETS.find((preset) => preset.id === id);
}
function getOpeningPresetById(id) {
  return OPENING_PRESETS.find((preset) => preset.id === id);
}
function filterGameSetupPresets(presets, category, query) {
  if (category === "custom-fen" || category === "custom-pgn") {
    return [];
  }
  const normalizedQuery = query.trim().toLowerCase();
  return presets.filter((preset) => {
    if (preset.category !== category) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    const haystack = [
      preset.name,
      preset.description,
      preset.side,
      preset.difficulty,
      ...preset.tags
    ].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
function describeGameSetupPreset(preset) {
  const sideLabel = preset.side === "white" ? "White" : "Black";
  return `${preset.name} \u2022 ${sideLabel} \u2022 ${preset.difficulty}`;
}
function toCompatibleOpeningPreset(id) {
  const opening = getOpeningById(id);
  if (!opening) {
    return void 0;
  }
  return OPENING_PRESETS.find((preset) => preset.id === opening.id);
}
var GAME_SETUP_CATEGORY_OPTIONS, OPENING_PRESETS, TACTICAL_PRESETS, ENDGAME_PRESETS, GAME_SETUP_PRESETS;
var init_gameSetupPresets = __esm({
  "src/engine/gameSetupPresets.ts"() {
    "use strict";
    init_openings();
    GAME_SETUP_CATEGORY_OPTIONS = [
      { value: "openings", label: "Openings" },
      { value: "tactical", label: "Tactical positions" },
      { value: "endgames", label: "Endgames" },
      { value: "custom-fen", label: "Custom FEN" },
      { value: "custom-pgn", label: "Custom PGN" }
    ];
    OPENING_PRESETS = PREDEFINED_OPENINGS.map((opening) => ({
      id: opening.id,
      category: "openings",
      name: opening.name,
      side: opening.side,
      difficulty: openingDifficultyTag(opening.name),
      description: opening.description ?? `${opening.name} setup`,
      tags: ["opening", opening.side, opening.name.toLowerCase()],
      sourceType: "pgn",
      source: opening.pgn
    }));
    TACTICAL_PRESETS = [
      {
        id: "tactic-back-rank-net",
        category: "tactical",
        name: "Back Rank Net",
        side: "white",
        difficulty: "medium",
        description: "White to move with a direct attacking idea against an exposed back rank.",
        tags: ["tactical", "mate-threat", "attack", "white-to-move"],
        sourceType: "fen",
        source: "6k1/5ppp/3Q4/8/8/8/5PPP/6K1 w - - 0 1"
      },
      {
        id: "tactic-knight-fork",
        category: "tactical",
        name: "Knight Fork Opportunity",
        side: "white",
        difficulty: "easy",
        description: "A training position built around spotting a simple fork motif.",
        tags: ["tactical", "fork", "white-to-move"],
        sourceType: "fen",
        source: "r3k2r/pppq1ppp/2npbn2/3Np3/2B1P3/2N5/PPP2PPP/R1BQ1RK1 w kq - 0 1"
      },
      {
        id: "tactic-deflection",
        category: "tactical",
        name: "Deflection Strike",
        side: "black",
        difficulty: "hard",
        description: "Black to move in a sharp middlegame where calculation matters more than memorization.",
        tags: ["tactical", "deflection", "calculation", "black-to-move"],
        sourceType: "fen",
        source: "r2q1rk1/pp1b1ppp/2n1pn2/2bp4/2P5/2NP1NP1/PP2PPBP/R1BQ1RK1 b - - 4 9"
      }
    ];
    ENDGAME_PRESETS = [
      {
        id: "endgame-lucena-bridge",
        category: "endgames",
        name: "Lucena Bridge Setup",
        side: "white",
        difficulty: "hard",
        description: "Classic rook endgame conversion practice with White pressing for the win.",
        tags: ["endgame", "rook", "lucena", "white-to-move"],
        sourceType: "fen",
        source: "8/2k5/2P5/2KR4/8/8/8/8 w - - 0 1"
      },
      {
        id: "endgame-opposition",
        category: "endgames",
        name: "King Opposition",
        side: "white",
        difficulty: "easy",
        description: "A pure king-and-pawn ending focused on gaining opposition cleanly.",
        tags: ["endgame", "king-and-pawn", "opposition", "white-to-move"],
        sourceType: "fen",
        source: "8/8/8/3k4/3P4/4K3/8/8 w - - 0 1"
      },
      {
        id: "endgame-queen-vs-pawn",
        category: "endgames",
        name: "Queen vs Passed Pawn",
        side: "black",
        difficulty: "medium",
        description: "Black defends against promotion threats in a precise queen ending.",
        tags: ["endgame", "queen", "passed-pawn", "black-to-move"],
        sourceType: "fen",
        source: "6k1/5pp1/8/8/8/6Q1/5P2/6K1 b - - 0 1"
      }
    ];
    GAME_SETUP_PRESETS = [
      ...OPENING_PRESETS,
      ...TACTICAL_PRESETS,
      ...ENDGAME_PRESETS
    ];
  }
});

// src/viewmodels/GameSetupViewModel.ts
import { action as action7, makeAutoObservable as makeAutoObservable7 } from "mobx";
var GameSetupViewModel, gameSetupViewModel;
var init_GameSetupViewModel = __esm({
  "src/viewmodels/GameSetupViewModel.ts"() {
    "use strict";
    init_gameSetupPresets();
    init_BoardViewModel();
    GameSetupViewModel = class {
      open = false;
      selectedCategory = "openings";
      searchQuery = "";
      selectedPresetId = GAME_SETUP_PRESETS[0]?.id ?? null;
      customFenInput = "";
      customPgnInput = "";
      deps;
      constructor(deps = {
        boardViewModel
      }) {
        this.deps = deps;
        makeAutoObservable7(this, {
          setOpen: action7,
          openAtCategory: action7,
          setSelectedCategory: action7,
          setSearchQuery: action7,
          setSelectedPresetId: action7,
          setCustomFenInput: action7,
          setCustomPgnInput: action7,
          loadSelectedPreset: action7,
          loadCustomFen: action7,
          loadCustomPgn: action7,
          syncSelectionFromCategory: action7
        });
        this.syncSelectionFromCategory();
      }
      setOpen(open) {
        this.open = open;
      }
      openAtCategory(category) {
        this.selectedCategory = category;
        this.searchQuery = "";
        this.open = true;
        this.syncSelectionFromCategory();
      }
      setSelectedCategory(category) {
        this.selectedCategory = category;
        this.searchQuery = "";
        this.syncSelectionFromCategory();
      }
      setSearchQuery(value) {
        this.searchQuery = value;
        this.syncSelectionFromCategory();
      }
      setSelectedPresetId(id) {
        this.selectedPresetId = id;
      }
      setCustomFenInput(value) {
        this.customFenInput = value;
      }
      setCustomPgnInput(value) {
        this.customPgnInput = value;
      }
      loadSelectedPreset() {
        const preset = this.selectedPreset;
        if (!preset) {
          return false;
        }
        const loaded = this.deps.boardViewModel.loadGameSetupPreset(preset);
        if (loaded) {
          this.open = false;
        }
        return loaded;
      }
      loadCustomFen() {
        if (!this.customFenInput.trim()) {
          return false;
        }
        const loaded = this.deps.boardViewModel.loadFen(this.customFenInput.trim());
        if (loaded) {
          this.deps.boardViewModel.statusMessage = "Custom FEN loaded";
          this.customFenInput = "";
          this.open = false;
        }
        return loaded;
      }
      loadCustomPgn() {
        if (!this.customPgnInput.trim()) {
          return false;
        }
        const loaded = this.deps.boardViewModel.loadPgn(this.customPgnInput.trim());
        if (loaded) {
          this.deps.boardViewModel.statusMessage = "Custom PGN loaded";
          this.customPgnInput = "";
          this.open = false;
        }
        return loaded;
      }
      syncSelectionFromCategory() {
        if (this.selectedCategory === "custom-fen" || this.selectedCategory === "custom-pgn") {
          this.selectedPresetId = null;
          return;
        }
        const visiblePresetIds = this.filteredPresets.map((preset) => preset.id);
        if (this.selectedPresetId && visiblePresetIds.includes(this.selectedPresetId)) {
          return;
        }
        this.selectedPresetId = visiblePresetIds[0] ?? null;
      }
      get categories() {
        return GAME_SETUP_CATEGORY_OPTIONS;
      }
      get filteredPresets() {
        return filterGameSetupPresets(GAME_SETUP_PRESETS, this.selectedCategory, this.searchQuery);
      }
      get selectedPreset() {
        return this.selectedPresetId ? getGameSetupPresetById(this.selectedPresetId) ?? null : null;
      }
    };
    gameSetupViewModel = new GameSetupViewModel();
  }
});

// src/viewmodels/DebugViewModel.ts
import { action as action8, makeAutoObservable as makeAutoObservable8 } from "mobx";
var DebugViewModel, debugViewModel;
var init_DebugViewModel = __esm({
  "src/viewmodels/DebugViewModel.ts"() {
    "use strict";
    init_debug();
    DebugViewModel = class {
      debugLoggingEnabled = isDebugLoggingEnabled();
      constructor() {
        makeAutoObservable8(this, {
          setDebugLoggingEnabled: action8,
          toggleDebugLogging: action8
        });
      }
      setDebugLoggingEnabled(enabled) {
        this.debugLoggingEnabled = enabled;
        setDebugLoggingEnabled(enabled);
      }
      toggleDebugLogging() {
        this.setDebugLoggingEnabled(!this.debugLoggingEnabled);
      }
      get isDevelopment() {
        return isDevelopmentBuild();
      }
      get showDebugControls() {
        return this.isDevelopment;
      }
    };
    debugViewModel = new DebugViewModel();
  }
});

// src/engine/personaProfiles.ts
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function clampInteger(value, minimum, maximum, fallback) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}
function sanitizeBucketConfig(value) {
  if (!isRecord(value)) {
    return { ...DEFAULT_BUCKET_CONFIG };
  }
  return {
    best: clampInteger(value.best, 0, 100, DEFAULT_BUCKET_CONFIG.best),
    great: clampInteger(value.great, 0, 100, DEFAULT_BUCKET_CONFIG.great),
    excellent: clampInteger(value.excellent, 0, 100, DEFAULT_BUCKET_CONFIG.excellent),
    good: clampInteger(value.good, 0, 100, DEFAULT_BUCKET_CONFIG.good),
    inaccuracy: clampInteger(value.inaccuracy, 0, 100, DEFAULT_BUCKET_CONFIG.inaccuracy),
    mistake: clampInteger(value.mistake, 0, 100, DEFAULT_BUCKET_CONFIG.mistake),
    blunder: clampInteger(value.blunder, 0, 100, DEFAULT_BUCKET_CONFIG.blunder)
  };
}
function sanitizePresetId(value) {
  if (value === null) {
    return null;
  }
  return typeof value === "string" && VALID_PRESET_IDS.has(value) ? value : "medium";
}
function sanitizeThemeMode(value) {
  return typeof value === "string" && VALID_THEME_MODES.has(value) ? value : "dark";
}
function sanitizeBrilliantMovesPerGame(value) {
  return typeof value === "number" && VALID_BRILLIANT_BUDGETS.has(value) ? value : 0;
}
function sanitizeBrilliantAllowedPhase(value) {
  return typeof value === "string" && VALID_BRILLIANT_PHASES.has(value) ? value : "any";
}
function sanitizePersonaProfileSettingsSnapshot(value) {
  const record = isRecord(value) ? value : {};
  const brilliant = isRecord(record.brilliant) ? record.brilliant : {};
  const ui = isRecord(record.ui) ? record.ui : {};
  return {
    bucketConfig: sanitizeBucketConfig(record.bucketConfig),
    currentPresetId: sanitizePresetId(record.currentPresetId),
    depth: clampInteger(record.depth, 1, 30, 8),
    multiPV: clampInteger(record.multiPV, 1, 20, 12),
    featureOptions: mergeFeatureOptions(isRecord(record.featureOptions) ? record.featureOptions : void 0),
    brilliant: {
      brilliantMovesPerGame: sanitizeBrilliantMovesPerGame(brilliant.brilliantMovesPerGame),
      brilliantAllowedPhase: sanitizeBrilliantAllowedPhase(brilliant.brilliantAllowedPhase)
    },
    ui: {
      themeMode: sanitizeThemeMode(ui.themeMode),
      basicMode: typeof ui.basicMode === "boolean" ? ui.basicMode : true
    }
  };
}
function sanitizePersonaProfileExport(value, fallbackName = "Imported Profile") {
  if (!isRecord(value)) {
    return null;
  }
  if (value.kind !== PERSONA_PROFILE_KIND || value.version !== PERSONA_PROFILE_VERSION) {
    return null;
  }
  const name = typeof value.name === "string" && value.name.trim() ? value.name.trim() : fallbackName;
  return {
    kind: PERSONA_PROFILE_KIND,
    version: PERSONA_PROFILE_VERSION,
    name,
    settings: sanitizePersonaProfileSettingsSnapshot(value.settings)
  };
}
function parsePersonaProfileImport(json) {
  if (!json.trim()) {
    return {
      ok: false,
      error: "Import JSON is empty."
    };
  }
  try {
    const parsed = JSON.parse(json);
    const profile = sanitizePersonaProfileExport(parsed);
    if (!profile) {
      return {
        ok: false,
        error: "Imported JSON does not match the PersonaChess profile schema."
      };
    }
    return { ok: true, profile };
  } catch {
    return {
      ok: false,
      error: "Imported JSON could not be parsed."
    };
  }
}
function serializePersonaProfile(profile) {
  return JSON.stringify(profile, null, 2);
}
function createSavedPersonaProfile(profile, id, nowIso) {
  return {
    ...profile,
    id,
    createdAt: nowIso,
    updatedAt: nowIso
  };
}
function updateSavedPersonaProfile(profile, next, nowIso) {
  return {
    ...profile,
    ...next,
    id: profile.id,
    createdAt: profile.createdAt,
    updatedAt: nowIso
  };
}
function duplicatePersonaProfile(profile, id, name, nowIso) {
  return {
    ...profile,
    id,
    name,
    createdAt: nowIso,
    updatedAt: nowIso
  };
}
function sanitizeSavedPersonaProfile(value) {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id.trim()) {
    return null;
  }
  const exported = sanitizePersonaProfileExport(value);
  if (!exported) {
    return null;
  }
  const createdAt = typeof value.createdAt === "string" && value.createdAt.trim() ? value.createdAt : (/* @__PURE__ */ new Date(0)).toISOString();
  const updatedAt = typeof value.updatedAt === "string" && value.updatedAt.trim() ? value.updatedAt : createdAt;
  return {
    ...exported,
    id: value.id,
    createdAt,
    updatedAt
  };
}
function sanitizePersonaProfileStoreSnapshot(value) {
  if (!isRecord(value)) {
    return {
      profiles: [],
      selectedProfileId: null
    };
  }
  const profiles = Array.isArray(value.profiles) ? value.profiles.map((entry) => sanitizeSavedPersonaProfile(entry)).filter((entry) => entry !== null) : [];
  const selectedProfileId = typeof value.selectedProfileId === "string" ? value.selectedProfileId : null;
  return {
    profiles,
    selectedProfileId: profiles.some((profile) => profile.id === selectedProfileId) ? selectedProfileId : null
  };
}
function buildPersonaProfileExportFilename(name) {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "persona-profile";
  return `personachess-${slug}.json`;
}
var PERSONA_PROFILE_KIND, PERSONA_PROFILE_VERSION, VALID_PRESET_IDS, VALID_THEME_MODES, VALID_BRILLIANT_PHASES, VALID_BRILLIANT_BUDGETS;
var init_personaProfiles = __esm({
  "src/engine/personaProfiles.ts"() {
    "use strict";
    init_featureOptions();
    init_types();
    PERSONA_PROFILE_KIND = "personachess.persona-profile";
    PERSONA_PROFILE_VERSION = 1;
    VALID_PRESET_IDS = new Set(MOVE_QUALITY_PRESETS.map((preset) => preset.id));
    VALID_THEME_MODES = /* @__PURE__ */ new Set(["dark", "light", "minimal", "persona"]);
    VALID_BRILLIANT_PHASES = /* @__PURE__ */ new Set(["opening", "middlegame", "endgame", "any"]);
    VALID_BRILLIANT_BUDGETS = /* @__PURE__ */ new Set([0, 1, 2, 3, 4]);
  }
});

// src/viewmodels/PersonaProfilesViewModel.ts
import { action as action9, makeAutoObservable as makeAutoObservable9 } from "mobx";
function createProfileId() {
  return `profile_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
function createTimestamp() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
var PERSONA_PROFILES_STORAGE_KEY, PersonaProfilesViewModel, personaProfilesViewModel;
var init_PersonaProfilesViewModel = __esm({
  "src/viewmodels/PersonaProfilesViewModel.ts"() {
    "use strict";
    init_personaProfiles();
    init_ConfigViewModel();
    init_FeatureOptionsViewModel();
    init_UiStateViewModel();
    PERSONA_PROFILES_STORAGE_KEY = "personachess_persona_profiles";
    PersonaProfilesViewModel = class {
      profiles = [];
      selectedProfileId = null;
      profileNameDraft = "";
      exchangeJson = "";
      lastActionMessage = "";
      importError = "";
      deps;
      constructor(deps = {
        configViewModel,
        featureOptionsViewModel,
        uiStateViewModel
      }) {
        this.deps = deps;
        makeAutoObservable9(this, {
          setSelectedProfileId: action9,
          setProfileNameDraft: action9,
          setExchangeJson: action9,
          clearExchangeState: action9,
          saveCurrentProfile: action9,
          loadSelectedProfile: action9,
          duplicateSelectedProfile: action9,
          renameSelectedProfile: action9,
          deleteSelectedProfile: action9,
          importProfileFromJson: action9
        });
        this.restoreFromStorage();
      }
      setSelectedProfileId(id) {
        this.selectedProfileId = id;
        this.profileNameDraft = this.selectedProfile?.name ?? "";
        this.lastActionMessage = "";
        this.importError = "";
      }
      setProfileNameDraft(value) {
        this.profileNameDraft = value;
        this.lastActionMessage = "";
        this.importError = "";
      }
      setExchangeJson(value) {
        this.exchangeJson = value;
        this.lastActionMessage = "";
        this.importError = "";
      }
      clearExchangeState() {
        this.exchangeJson = "";
        this.lastActionMessage = "";
        this.importError = "";
      }
      saveCurrentProfile(name = this.profileNameDraft) {
        const trimmedName = name.trim();
        if (!trimmedName) {
          this.importError = "Enter a profile name before saving.";
          return false;
        }
        const snapshot = this.buildCurrentSnapshot();
        const exported = this.createExport(trimmedName, snapshot);
        const nowIso = createTimestamp();
        const existingBySelected = this.selectedProfile;
        const existingByName = this.findByName(trimmedName);
        if (existingBySelected && existingBySelected.name === trimmedName) {
          this.profiles = this.profiles.map((profile) => profile.id === existingBySelected.id ? updateSavedPersonaProfile(profile, exported, nowIso) : profile);
          this.lastActionMessage = `Updated profile \u201C${trimmedName}\u201D.`;
          this.importError = "";
          this.exchangeJson = serializePersonaProfile(exported);
          this.persistToStorage();
          return true;
        }
        if (existingByName) {
          this.importError = `A profile named \u201C${trimmedName}\u201D already exists.`;
          return false;
        }
        const saved = createSavedPersonaProfile(exported, createProfileId(), nowIso);
        this.profiles = [saved, ...this.profiles];
        this.selectedProfileId = saved.id;
        this.profileNameDraft = saved.name;
        this.exchangeJson = serializePersonaProfile(exported);
        this.lastActionMessage = `Saved profile \u201C${trimmedName}\u201D.`;
        this.importError = "";
        this.persistToStorage();
        return true;
      }
      loadSelectedProfile() {
        const profile = this.selectedProfile;
        if (!profile) {
          this.importError = "Select a saved profile to load.";
          return false;
        }
        this.applySnapshot(profile.settings);
        this.profileNameDraft = profile.name;
        this.exchangeJson = serializePersonaProfile(this.toExport(profile));
        this.lastActionMessage = `Loaded profile \u201C${profile.name}\u201D.`;
        this.importError = "";
        return true;
      }
      duplicateSelectedProfile(name = this.profileNameDraft) {
        const profile = this.selectedProfile;
        if (!profile) {
          this.importError = "Select a saved profile to duplicate.";
          return false;
        }
        const trimmedName = name.trim() || `${profile.name} Copy`;
        if (this.findByName(trimmedName)) {
          this.importError = `A profile named \u201C${trimmedName}\u201D already exists.`;
          return false;
        }
        const nowIso = createTimestamp();
        const duplicate = duplicatePersonaProfile(profile, createProfileId(), trimmedName, nowIso);
        this.profiles = [duplicate, ...this.profiles];
        this.selectedProfileId = duplicate.id;
        this.profileNameDraft = duplicate.name;
        this.exchangeJson = serializePersonaProfile(this.toExport(duplicate));
        this.lastActionMessage = `Duplicated profile as \u201C${duplicate.name}\u201D.`;
        this.importError = "";
        this.persistToStorage();
        return true;
      }
      renameSelectedProfile(name = this.profileNameDraft) {
        const profile = this.selectedProfile;
        if (!profile) {
          this.importError = "Select a saved profile to rename.";
          return false;
        }
        const trimmedName = name.trim();
        if (!trimmedName) {
          this.importError = "Enter a profile name before renaming.";
          return false;
        }
        if (profile.name === trimmedName) {
          this.lastActionMessage = "Profile name is already up to date.";
          this.importError = "";
          return true;
        }
        const existingByName = this.findByName(trimmedName);
        if (existingByName && existingByName.id !== profile.id) {
          this.importError = `A profile named \u201C${trimmedName}\u201D already exists.`;
          return false;
        }
        const nowIso = createTimestamp();
        this.profiles = this.profiles.map((entry) => entry.id === profile.id ? { ...entry, name: trimmedName, updatedAt: nowIso } : entry);
        this.profileNameDraft = trimmedName;
        this.lastActionMessage = `Renamed profile to \u201C${trimmedName}\u201D.`;
        this.importError = "";
        this.persistToStorage();
        return true;
      }
      deleteSelectedProfile() {
        const profile = this.selectedProfile;
        if (!profile) {
          this.importError = "Select a saved profile to delete.";
          return false;
        }
        this.profiles = this.profiles.filter((entry) => entry.id !== profile.id);
        const nextSelectedId = this.profiles[0]?.id ?? null;
        this.selectedProfileId = nextSelectedId;
        this.profileNameDraft = this.selectedProfile?.name ?? "";
        this.exchangeJson = "";
        this.lastActionMessage = `Deleted profile \u201C${profile.name}\u201D.`;
        this.importError = "";
        this.persistToStorage();
        return true;
      }
      exportSelectedProfile() {
        const profile = this.selectedProfile;
        if (!profile) {
          this.importError = "Select a saved profile to export.";
          return null;
        }
        const exported = this.toExport(profile);
        const json = serializePersonaProfile(exported);
        this.exchangeJson = json;
        this.lastActionMessage = `Exported profile \u201C${profile.name}\u201D.`;
        this.importError = "";
        return {
          fileName: buildPersonaProfileExportFilename(profile.name),
          json
        };
      }
      importProfileFromJson(json = this.exchangeJson) {
        const parsed = parsePersonaProfileImport(json);
        if (!parsed.ok) {
          this.importError = parsed.error;
          return false;
        }
        const incomingName = parsed.profile.name.trim();
        const finalName = this.ensureUniqueName(incomingName);
        const exported = {
          ...parsed.profile,
          name: finalName
        };
        const nowIso = createTimestamp();
        const saved = createSavedPersonaProfile(exported, createProfileId(), nowIso);
        this.profiles = [saved, ...this.profiles];
        this.selectedProfileId = saved.id;
        this.profileNameDraft = saved.name;
        this.exchangeJson = serializePersonaProfile(exported);
        this.lastActionMessage = finalName === incomingName ? `Imported profile \u201C${finalName}\u201D.` : `Imported profile as \u201C${finalName}\u201D to avoid a duplicate name.`;
        this.importError = "";
        this.persistToStorage();
        return true;
      }
      get selectedProfile() {
        return this.profiles.find((profile) => profile.id === this.selectedProfileId) ?? null;
      }
      buildCurrentSnapshot() {
        return {
          bucketConfig: { ...this.deps.configViewModel.bucketConfig },
          currentPresetId: this.deps.configViewModel.currentPresetId,
          depth: this.deps.configViewModel.depth,
          multiPV: this.deps.configViewModel.multiPV,
          featureOptions: { ...this.deps.featureOptionsViewModel.options },
          brilliant: {
            brilliantMovesPerGame: this.deps.featureOptionsViewModel.brilliantMovesPerGame,
            brilliantAllowedPhase: this.deps.featureOptionsViewModel.brilliantAllowedPhase
          },
          ui: {
            themeMode: this.deps.uiStateViewModel.themeMode,
            basicMode: this.deps.uiStateViewModel.basicMode
          }
        };
      }
      applySnapshot(snapshot) {
        this.deps.configViewModel.applyProfileSnapshot({
          bucketConfig: snapshot.bucketConfig,
          currentPresetId: snapshot.currentPresetId,
          depth: snapshot.depth,
          multiPV: snapshot.multiPV
        });
        this.deps.featureOptionsViewModel.applyProfileSettings(snapshot.featureOptions, snapshot.brilliant);
        this.deps.uiStateViewModel.applyProfilePreferences(snapshot.ui);
      }
      createExport(name, settings) {
        return {
          kind: PERSONA_PROFILE_KIND,
          version: PERSONA_PROFILE_VERSION,
          name,
          settings
        };
      }
      toExport(profile) {
        return {
          kind: profile.kind,
          version: profile.version,
          name: profile.name,
          settings: profile.settings
        };
      }
      findByName(name) {
        const normalizedName = name.trim().toLowerCase();
        return this.profiles.find((profile) => profile.name.trim().toLowerCase() === normalizedName) ?? null;
      }
      ensureUniqueName(baseName) {
        const trimmedBaseName = baseName.trim() || "Imported Profile";
        if (!this.findByName(trimmedBaseName)) {
          return trimmedBaseName;
        }
        let index = 2;
        let candidate = `${trimmedBaseName} ${index}`;
        while (this.findByName(candidate)) {
          index += 1;
          candidate = `${trimmedBaseName} ${index}`;
        }
        return candidate;
      }
      restoreFromStorage() {
        try {
          const saved = localStorage.getItem(PERSONA_PROFILES_STORAGE_KEY);
          if (!saved) {
            return;
          }
          const snapshot = sanitizePersonaProfileStoreSnapshot(JSON.parse(saved));
          this.profiles = snapshot.profiles;
          this.selectedProfileId = snapshot.selectedProfileId ?? snapshot.profiles[0]?.id ?? null;
          this.profileNameDraft = this.selectedProfile?.name ?? "";
        } catch {
        }
      }
      persistToStorage() {
        try {
          localStorage.setItem(
            PERSONA_PROFILES_STORAGE_KEY,
            JSON.stringify({
              profiles: this.profiles,
              selectedProfileId: this.selectedProfileId
            })
          );
        } catch {
        }
      }
    };
    personaProfilesViewModel = new PersonaProfilesViewModel();
  }
});

// src/viewmodels/index.ts
var viewmodels_exports = {};
__export(viewmodels_exports, {
  BoardViewModel: () => BoardViewModel,
  ConfigViewModel: () => ConfigViewModel,
  DebugViewModel: () => DebugViewModel,
  EngineViewModel: () => EngineViewModel,
  FeatureOptionsViewModel: () => FeatureOptionsViewModel,
  GameAnalyticsViewModel: () => GameAnalyticsViewModel,
  GameSetupViewModel: () => GameSetupViewModel,
  PersonaProfilesViewModel: () => PersonaProfilesViewModel,
  UiStateViewModel: () => UiStateViewModel,
  boardViewModel: () => boardViewModel,
  configViewModel: () => configViewModel,
  debugViewModel: () => debugViewModel,
  engineViewModel: () => engineViewModel,
  featureOptionsViewModel: () => featureOptionsViewModel,
  gameAnalyticsViewModel: () => gameAnalyticsViewModel,
  gameSetupViewModel: () => gameSetupViewModel,
  personaProfilesViewModel: () => personaProfilesViewModel,
  uiStateViewModel: () => uiStateViewModel
});
var init_viewmodels = __esm({
  "src/viewmodels/index.ts"() {
    "use strict";
    init_BoardViewModel();
    init_EngineViewModel();
    init_ConfigViewModel();
    init_FeatureOptionsViewModel();
    init_GameAnalyticsViewModel();
    init_GameSetupViewModel();
    init_DebugViewModel();
    init_UiStateViewModel();
    init_PersonaProfilesViewModel();
  }
});

// tests/personachess.test.ts
import assert from "node:assert/strict";
import test from "node:test";
var MemoryStorage = class {
  store = /* @__PURE__ */ new Map();
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) ?? null : null;
  }
  setItem(key, value) {
    this.store.set(key, value);
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
};
var localStorageMock = new MemoryStorage();
globalThis.localStorage = localStorageMock;
test("analysis safety ignores stale requests and stale delayed moves", async () => {
  const { canApplyAnalyzedMove: canApplyAnalyzedMove2, isStaleAnalysisRequest: isStaleAnalysisRequest2 } = await Promise.resolve().then(() => (init_analysisSafety(), analysisSafety_exports));
  assert.equal(isStaleAnalysisRequest2(1, 2), true);
  assert.equal(isStaleAnalysisRequest2(4, 4), false);
  assert.equal(canApplyAnalyzedMove2("fen-a", "fen-b"), false);
  assert.equal(canApplyAnalyzedMove2("fen-a", "fen-a"), true);
});
test("analysis cache key, trimming, and invalidation behave correctly", async () => {
  const { AnalysisCache: AnalysisCache2, buildAnalysisCacheKey: buildAnalysisCacheKey2 } = await Promise.resolve().then(() => (init_analysisCache(), analysisCache_exports));
  assert.equal(
    buildAnalysisCacheKey2("fen", 8, 12),
    "fen|depth:8|multipv:12"
  );
  const cache = new AnalysisCache2(2);
  cache.set({ key: "a", moves: [], timestamp: 1 });
  cache.set({ key: "b", moves: [], timestamp: 2 });
  cache.set({ key: "c", moves: [], timestamp: 3 });
  assert.equal(cache.size, 2);
  assert.equal(cache.get("a"), null);
  assert.notEqual(cache.get("b"), null);
  assert.notEqual(cache.get("c"), null);
  cache.invalidate("b");
  assert.equal(cache.get("b"), null);
  cache.invalidate();
  assert.equal(cache.size, 0);
});
test("deterministic RNG changes stream when FEN changes at the same move number", async () => {
  const { buildDeterministicSeed: buildDeterministicSeed2, createSeededRandomSource: createSeededRandomSource2 } = await Promise.resolve().then(() => (init_random(), random_exports));
  const seedA = buildDeterministicSeed2({
    gameStartFen: "start-fen",
    currentFen: "fen-a",
    moveCount: 12,
    sideToMove: "w",
    persona: "medium"
  });
  const seedB = buildDeterministicSeed2({
    gameStartFen: "start-fen",
    currentFen: "fen-b",
    moveCount: 12,
    sideToMove: "w",
    persona: "medium"
  });
  const rngA = createSeededRandomSource2(seedA);
  const rngB = createSeededRandomSource2(seedB);
  assert.notEqual(rngA.next(), rngB.next());
});
test("PGN custom start FEN is respected", async () => {
  const { resolvePgnStartFen: resolvePgnStartFen2 } = await Promise.resolve().then(() => (init_gameSession(), gameSession_exports));
  const fen = resolvePgnStartFen2(
    {
      SetUp: "1",
      FEN: "8/8/8/8/8/8/8/K6k w - - 0 1"
    },
    "fallback"
  );
  assert.equal(fen, "8/8/8/8/8/8/8/K6k w - - 0 1");
});
test("brilliant usage derives from move history metadata", async () => {
  const { deriveBrilliantUsage: deriveBrilliantUsage2 } = await Promise.resolve().then(() => (init_brilliantTracking(), brilliantTracking_exports));
  const usage = deriveBrilliantUsage2([
    {
      beforeFen: "a",
      afterFen: "b",
      uci: "e2e4",
      moveNumber: 1,
      consumedBrilliant: false
    },
    {
      beforeFen: "b",
      afterFen: "c",
      uci: "e7e5",
      moveNumber: 1,
      consumedBrilliant: true
    }
  ]);
  assert.deepEqual(usage, {
    brilliantUsedCount: 1,
    brilliantMoveNumbers: [1]
  });
});
test("brilliant budget is consumed only after a successful engine move and rolls back on undo/redo", async () => {
  localStorageMock.clear();
  const { boardViewModel: boardViewModel2, featureOptionsViewModel: featureOptionsViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  boardViewModel2.reset();
  featureOptionsViewModel2.resetToDefaults();
  featureOptionsViewModel2.setOption("useBrilliantMoveBudget", true);
  featureOptionsViewModel2.setBrilliantMovesPerGame(2);
  const invalidMove = await boardViewModel2.makeMoveUCI("a1a1", { consumedBrilliant: true });
  assert.equal(invalidMove, false);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 0);
  const successfulMove = await boardViewModel2.makeMoveUCI("e2e4", { consumedBrilliant: true });
  assert.equal(successfulMove, true);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 1);
  assert.deepEqual(featureOptionsViewModel2.brilliantMoveNumbers, [1]);
  assert.equal(boardViewModel2.undoSingle(), true);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 0);
  assert.deepEqual(featureOptionsViewModel2.brilliantMoveNumbers, []);
  assert.equal(boardViewModel2.redoSingle(), true);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 1);
  assert.deepEqual(featureOptionsViewModel2.brilliantMoveNumbers, [1]);
});
test("new FEN, PGN, and opening loads reset brilliant state and PGN start FEN updates game start", async () => {
  localStorageMock.clear();
  const { boardViewModel: boardViewModel2, featureOptionsViewModel: featureOptionsViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const { PREDEFINED_OPENINGS: PREDEFINED_OPENINGS2 } = await Promise.resolve().then(() => (init_openings(), openings_exports));
  boardViewModel2.reset();
  featureOptionsViewModel2.resetToDefaults();
  featureOptionsViewModel2.setOption("useBrilliantMoveBudget", true);
  await boardViewModel2.makeMoveUCI("e2e4", { consumedBrilliant: true });
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 1);
  boardViewModel2.loadFen("8/8/8/8/8/8/8/K6k w - - 0 1");
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 0);
  boardViewModel2.loadPgn('[SetUp "1"]\n[FEN "8/8/8/8/8/8/8/K6k w - - 0 1"]\n\n1. Ka2 *');
  assert.equal(boardViewModel2.gameStartFen, "8/8/8/8/8/8/8/K6k w - - 0 1");
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 0);
  await boardViewModel2.makeMoveUCI("h1h2", { consumedBrilliant: true });
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 1);
  boardViewModel2.loadPgn(PREDEFINED_OPENINGS2[0].pgn);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 0);
});
test("solveNextMove drops stale delayed autoplay moves safely", async () => {
  localStorageMock.clear();
  const { boardViewModel: boardViewModel2, engineViewModel: engineViewModel2, featureOptionsViewModel: featureOptionsViewModel2, configViewModel: configViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  boardViewModel2.reset();
  featureOptionsViewModel2.resetToDefaults();
  featureOptionsViewModel2.setOption("useHumanDelaySimulation", true);
  configViewModel2.applyPreset("medium");
  const originalInitialize = engineViewModel2.initialize.bind(engineViewModel2);
  const originalAnalyzePosition = engineViewModel2.analyzePosition.bind(engineViewModel2);
  const originalPickMove = engineViewModel2.pickMoveFromAnalysis.bind(engineViewModel2);
  let releaseDelay = null;
  engineViewModel2.isInitialized = true;
  engineViewModel2.initialize = async () => void 0;
  engineViewModel2.analyzePosition = async (fen) => ({
    requestId: 1,
    analyzedFen: fen,
    moves: [
      {
        move: "e2e4",
        evaluation: 30,
        evalLoss: 0,
        pv: ["e2e4"],
        multipv: 1,
        depth: 8,
        bucket: "best"
      }
    ],
    complexity: {
      level: "medium",
      score: 0.5,
      spread: 30,
      closeCandidates: 2,
      volatility: 20
    },
    ignored: false,
    fromCache: false,
    purpose: "engineMove"
  });
  engineViewModel2.pickMoveFromAnalysis = () => ({
    move: {
      move: "e2e4",
      evaluation: 30,
      evalLoss: 0,
      pv: ["e2e4"],
      multipv: 1,
      depth: 8,
      bucket: "best"
    },
    bucket: "best",
    isBrilliant: false
  });
  boardViewModel2.wait = () => new Promise((resolve) => {
    releaseDelay = resolve;
  });
  const pendingMove = boardViewModel2.solveNextMove(true);
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  boardViewModel2.loadFen("8/8/8/8/8/8/8/K6k w - - 0 1");
  releaseDelay?.();
  const result = await pendingMove;
  assert.equal(result, null);
  assert.equal(boardViewModel2.fen, "8/8/8/8/8/8/8/K6k w - - 0 1");
  engineViewModel2.initialize = originalInitialize;
  engineViewModel2.analyzePosition = originalAnalyzePosition;
  engineViewModel2.pickMoveFromAnalysis = originalPickMove;
});
test("background analysis does not cancel a valid pending engine move request", async () => {
  localStorageMock.clear();
  const { EngineViewModel: EngineViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const { moveStockfishService: moveStockfishService2, analysisStockfishService: analysisStockfishService2 } = await Promise.resolve().then(() => (init_stockfish_service(), stockfish_service_exports));
  const engine = new EngineViewModel2();
  const originalInitialize = engine.initialize.bind(engine);
  const originalMoveAnalyze = moveStockfishService2.analyzePosition.bind(moveStockfishService2);
  const originalMoveConfigure = moveStockfishService2.configure.bind(moveStockfishService2);
  const originalMoveStop = moveStockfishService2.stop.bind(moveStockfishService2);
  const originalAnalysisAnalyze = analysisStockfishService2.analyzePosition.bind(analysisStockfishService2);
  const originalAnalysisConfigure = analysisStockfishService2.configure.bind(analysisStockfishService2);
  const originalAnalysisStop = analysisStockfishService2.stop.bind(analysisStockfishService2);
  let releaseMoveAnalysis = null;
  let moveAnalyzeCalls = 0;
  let backgroundAnalyzeCalls = 0;
  engine.isInitialized = true;
  engine.initialize = async () => void 0;
  moveStockfishService2.configure = () => void 0;
  moveStockfishService2.stop = () => void 0;
  moveStockfishService2.analyzePosition = async () => {
    moveAnalyzeCalls += 1;
    await new Promise((resolve) => {
      releaseMoveAnalysis = resolve;
    });
    return [
      {
        move: "e2e4",
        evaluation: 42,
        evalLoss: 0,
        pv: ["e2e4"],
        multipv: 1,
        depth: 10
      }
    ];
  };
  analysisStockfishService2.configure = () => void 0;
  analysisStockfishService2.stop = () => void 0;
  analysisStockfishService2.analyzePosition = async () => {
    backgroundAnalyzeCalls += 1;
    return [
      {
        move: "e2e4",
        evaluation: 42,
        evalLoss: 0,
        pv: ["e2e4"],
        multipv: 1,
        depth: 10
      }
    ];
  };
  const engineMovePromise = engine.analyzePosition("fen-shared", 10, 2, "engineMove");
  await new Promise((resolve) => setTimeout(resolve, 0));
  const backgroundPromise = engine.analyzePosition("fen-shared", 10, 2, "background");
  releaseMoveAnalysis?.();
  const [engineMoveResult, backgroundResult] = await Promise.all([engineMovePromise, backgroundPromise]);
  assert.equal(moveAnalyzeCalls, 1);
  assert.equal(backgroundAnalyzeCalls, 1);
  assert.equal(engineMoveResult.ignored, false);
  assert.equal(backgroundResult.ignored, false);
  assert.equal(backgroundResult.analyzedFen, "fen-shared");
  engine.initialize = originalInitialize;
  moveStockfishService2.analyzePosition = originalMoveAnalyze;
  moveStockfishService2.configure = originalMoveConfigure;
  moveStockfishService2.stop = originalMoveStop;
  analysisStockfishService2.analyzePosition = originalAnalysisAnalyze;
  analysisStockfishService2.configure = originalAnalysisConfigure;
  analysisStockfishService2.stop = originalAnalysisStop;
});
test("engine reset clears in-flight analysis state so new requests are not blocked", async () => {
  localStorageMock.clear();
  const { EngineViewModel: EngineViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const { analysisStockfishService: analysisStockfishService2 } = await Promise.resolve().then(() => (init_stockfish_service(), stockfish_service_exports));
  const engine = new EngineViewModel2();
  const originalInitialize = engine.initialize.bind(engine);
  const originalAnalyze = analysisStockfishService2.analyzePosition.bind(analysisStockfishService2);
  const originalConfigure = analysisStockfishService2.configure.bind(analysisStockfishService2);
  const originalStop = analysisStockfishService2.stop.bind(analysisStockfishService2);
  let resolveFirstAnalysis = null;
  let analyzeCallCount = 0;
  engine.isInitialized = true;
  engine.initialize = async () => void 0;
  analysisStockfishService2.configure = () => void 0;
  analysisStockfishService2.stop = () => void 0;
  analysisStockfishService2.analyzePosition = async () => {
    analyzeCallCount += 1;
    if (analyzeCallCount === 1) {
      return new Promise((resolve) => {
        resolveFirstAnalysis = () => {
          resolve([
            {
              move: "e2e4",
              evaluation: 12,
              evalLoss: 0,
              pv: ["e2e4"],
              multipv: 1,
              depth: 8
            }
          ]);
        };
      });
    }
    return [
      {
        move: "d2d4",
        evaluation: 18,
        evalLoss: 0,
        pv: ["d2d4"],
        multipv: 1,
        depth: 8
      }
    ];
  };
  const staleAnalysisPromise = engine.analyzePosition("fen-old", 8, 2, "background");
  await new Promise((resolve) => setTimeout(resolve, 0));
  engine.reset();
  assert.equal(engine.isAnalyzing, false);
  const freshAnalysisPromise = engine.analyzePosition("fen-new", 8, 2, "background");
  resolveFirstAnalysis?.();
  const freshResult = await freshAnalysisPromise;
  const staleResult = await staleAnalysisPromise;
  assert.equal(analyzeCallCount, 2);
  assert.equal(freshResult.analyzedFen, "fen-new");
  assert.equal(staleResult.ignored, true);
  engine.initialize = originalInitialize;
  analysisStockfishService2.analyzePosition = originalAnalyze;
  analysisStockfishService2.configure = originalConfigure;
  analysisStockfishService2.stop = originalStop;
});
test("restored move annotations preserve brilliant undo/redo tracking after restart", async () => {
  localStorageMock.clear();
  const { BoardViewModel: BoardViewModel4, boardViewModel: boardViewModel2, featureOptionsViewModel: featureOptionsViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  featureOptionsViewModel2.resetToDefaults();
  featureOptionsViewModel2.setOption("persistEngineConfig", true);
  featureOptionsViewModel2.setOption("useBrilliantMoveBudget", true);
  featureOptionsViewModel2.setBrilliantMovesPerGame(2);
  boardViewModel2.reset();
  const moveApplied = await boardViewModel2.makeMoveUCI("e2e4", { consumedBrilliant: true });
  assert.equal(moveApplied, true);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 1);
  assert.equal(boardViewModel2.undoSingle(), true);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 0);
  assert.equal(boardViewModel2.canRedo, true);
  const restoredBoard = new BoardViewModel4();
  assert.equal(restoredBoard.canRedo, true);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 0);
  assert.equal(restoredBoard.redoSingle(), true);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 1);
  assert.deepEqual(featureOptionsViewModel2.brilliantMoveNumbers, [1]);
  assert.equal(restoredBoard.undoSingle(), true);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 0);
});
test("new game clears stale board transient state and allows black autoplay turn flow again", async () => {
  localStorageMock.clear();
  const { boardViewModel: boardViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  boardViewModel2.isThinking = true;
  boardViewModel2.isAnalyzingMoves = true;
  boardViewModel2.lastPlayerMoveQuality = "good";
  boardViewModel2.setAutoPlay(true);
  boardViewModel2.setEnginePlaysFor("b");
  boardViewModel2.reset();
  assert.equal(boardViewModel2.isThinking, false);
  assert.equal(boardViewModel2.isAnalyzingMoves, false);
  assert.equal(boardViewModel2.lastPlayerMoveQuality, null);
  assert.equal(boardViewModel2.canStartAutoPlayTurn, false);
  assert.equal(boardViewModel2.makeMove("e2", "e4"), true);
  assert.equal(boardViewModel2.canStartAutoPlayTurn, true);
});
test("cache-hit indicator reflects whether analysis came from cache", async () => {
  localStorageMock.clear();
  const { EngineViewModel: EngineViewModel2, featureOptionsViewModel: featureOptionsViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const { analysisStockfishService: analysisStockfishService2 } = await Promise.resolve().then(() => (init_stockfish_service(), stockfish_service_exports));
  const { analysisCache: analysisCache2 } = await Promise.resolve().then(() => (init_analysisCache(), analysisCache_exports));
  const engine = new EngineViewModel2();
  const originalInitialize = engine.initialize.bind(engine);
  const originalAnalyze = analysisStockfishService2.analyzePosition.bind(analysisStockfishService2);
  const originalConfigure = analysisStockfishService2.configure.bind(analysisStockfishService2);
  featureOptionsViewModel2.resetToDefaults();
  featureOptionsViewModel2.setOption("useMoveAnalysisCache", true);
  analysisCache2.invalidate();
  engine.isInitialized = true;
  engine.initialize = async () => void 0;
  analysisStockfishService2.configure = () => void 0;
  analysisStockfishService2.analyzePosition = async () => [
    {
      move: "e2e4",
      evaluation: 35,
      evalLoss: 0,
      pv: ["e2e4"],
      multipv: 1,
      depth: 12
    }
  ];
  const first = await engine.analyzePosition("fen-cache", 12, 2, "background");
  const second = await engine.analyzePosition("fen-cache", 12, 2, "background");
  assert.equal(first.fromCache, false);
  assert.equal(second.fromCache, true);
  assert.equal(engine.lastAnalysisFromCache, true);
  engine.initialize = originalInitialize;
  analysisStockfishService2.analyzePosition = originalAnalyze;
  analysisStockfishService2.configure = originalConfigure;
});
test("persona profiles save and load the current configuration snapshot", async () => {
  localStorageMock.clear();
  const { PersonaProfilesViewModel: PersonaProfilesViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const { DEFAULT_BUCKET_CONFIG: DEFAULT_BUCKET_CONFIG2 } = await Promise.resolve().then(() => (init_types(), types_exports));
  const { DEFAULT_FEATURE_OPTIONS: DEFAULT_FEATURE_OPTIONS2 } = await Promise.resolve().then(() => (init_featureOptions(), featureOptions_exports));
  let appliedConfig = null;
  let appliedFeatureOptions = null;
  let appliedBrilliantSettings = null;
  let appliedUi = null;
  const profiles = new PersonaProfilesViewModel2({
    configViewModel: {
      bucketConfig: {
        ...DEFAULT_BUCKET_CONFIG2,
        best: 28,
        great: 22
      },
      currentPresetId: "aggressive",
      depth: 13,
      multiPV: 7,
      applyProfileSnapshot: (snapshot) => {
        appliedConfig = snapshot;
      }
    },
    featureOptionsViewModel: {
      options: {
        ...DEFAULT_FEATURE_OPTIONS2,
        useDeterministicRng: true,
        useMoveAnalysisCache: false,
        useBrilliantMoveBudget: true
      },
      brilliantMovesPerGame: 3,
      brilliantAllowedPhase: "middlegame",
      applyProfileSettings: (options, brilliant) => {
        appliedFeatureOptions = options;
        appliedBrilliantSettings = brilliant;
      }
    },
    uiStateViewModel: {
      themeMode: "persona",
      basicMode: false,
      applyProfilePreferences: (preferences) => {
        appliedUi = preferences;
      }
    }
  });
  profiles.setProfileNameDraft("Sharp Tactician");
  assert.equal(profiles.saveCurrentProfile(), true);
  assert.equal(profiles.profiles.length, 1);
  assert.equal(profiles.profiles[0]?.name, "Sharp Tactician");
  assert.equal(profiles.profiles[0]?.settings.depth, 13);
  assert.equal(profiles.profiles[0]?.settings.featureOptions.useDeterministicRng, true);
  assert.equal(profiles.profiles[0]?.settings.brilliant.brilliantMovesPerGame, 3);
  assert.equal(profiles.profiles[0]?.settings.ui.themeMode, "persona");
  assert.equal(profiles.loadSelectedProfile(), true);
  assert.deepEqual(appliedConfig, {
    bucketConfig: {
      ...DEFAULT_BUCKET_CONFIG2,
      best: 28,
      great: 22
    },
    currentPresetId: "aggressive",
    depth: 13,
    multiPV: 7
  });
  assert.deepEqual(appliedFeatureOptions, {
    ...DEFAULT_FEATURE_OPTIONS2,
    useDeterministicRng: true,
    useMoveAnalysisCache: false,
    useBrilliantMoveBudget: true
  });
  assert.deepEqual(appliedBrilliantSettings, {
    brilliantMovesPerGame: 3,
    brilliantAllowedPhase: "middlegame"
  });
  assert.deepEqual(appliedUi, {
    themeMode: "persona",
    basicMode: false
  });
});
test("persona profile import validates JSON safely and deduplicates names", async () => {
  localStorageMock.clear();
  const { PersonaProfilesViewModel: PersonaProfilesViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const { DEFAULT_BUCKET_CONFIG: DEFAULT_BUCKET_CONFIG2 } = await Promise.resolve().then(() => (init_types(), types_exports));
  const { DEFAULT_FEATURE_OPTIONS: DEFAULT_FEATURE_OPTIONS2 } = await Promise.resolve().then(() => (init_featureOptions(), featureOptions_exports));
  const profiles = new PersonaProfilesViewModel2({
    configViewModel: {
      bucketConfig: { ...DEFAULT_BUCKET_CONFIG2 },
      currentPresetId: "medium",
      depth: 8,
      multiPV: 12,
      applyProfileSnapshot: () => void 0
    },
    featureOptionsViewModel: {
      options: { ...DEFAULT_FEATURE_OPTIONS2 },
      brilliantMovesPerGame: 0,
      brilliantAllowedPhase: "any",
      applyProfileSettings: () => void 0
    },
    uiStateViewModel: {
      themeMode: "dark",
      basicMode: true,
      applyProfilePreferences: () => void 0
    }
  });
  profiles.setProfileNameDraft("Balanced");
  assert.equal(profiles.saveCurrentProfile(), true);
  profiles.setExchangeJson("{bad json");
  assert.equal(profiles.importProfileFromJson(), false);
  assert.match(profiles.importError, /could not be parsed/i);
  profiles.setExchangeJson(
    JSON.stringify({
      kind: "personachess.persona-profile",
      version: 1,
      name: "Balanced",
      settings: {
        bucketConfig: DEFAULT_BUCKET_CONFIG2,
        currentPresetId: "hard",
        depth: 15,
        multiPV: 4,
        featureOptions: {
          ...DEFAULT_FEATURE_OPTIONS2,
          useDeterministicRng: true
        },
        brilliant: {
          brilliantMovesPerGame: 2,
          brilliantAllowedPhase: "endgame"
        },
        ui: {
          themeMode: "light",
          basicMode: false
        }
      }
    })
  );
  assert.equal(profiles.importProfileFromJson(), true);
  assert.equal(profiles.profiles.length, 2);
  assert.equal(profiles.profiles[0]?.name, "Balanced 2");
  assert.equal(profiles.profiles[0]?.settings.currentPresetId, "hard");
  assert.equal(profiles.profiles[0]?.settings.ui.themeMode, "light");
});
test("game setup presets remain searchable and compatible with the existing opening library", async () => {
  const { PREDEFINED_OPENINGS: PREDEFINED_OPENINGS2 } = await Promise.resolve().then(() => (init_openings(), openings_exports));
  const {
    GAME_SETUP_PRESETS: GAME_SETUP_PRESETS2,
    filterGameSetupPresets: filterGameSetupPresets2,
    toCompatibleOpeningPreset: toCompatibleOpeningPreset2
  } = await Promise.resolve().then(() => (init_gameSetupPresets(), gameSetupPresets_exports));
  assert.ok(GAME_SETUP_PRESETS2.length >= PREDEFINED_OPENINGS2.length);
  const filtered = filterGameSetupPresets2(GAME_SETUP_PRESETS2, "openings", "sicilian");
  assert.equal(filtered.length, 1);
  assert.match(filtered[0]?.name ?? "", /sicilian/i);
  const openingPreset = toCompatibleOpeningPreset2(PREDEFINED_OPENINGS2[0]?.id ?? "");
  assert.equal(openingPreset?.sourceType, "pgn");
  assert.equal(openingPreset?.source, PREDEFINED_OPENINGS2[0]?.pgn);
});
test("loading a game setup preset resets session state and brilliant tracking", async () => {
  localStorageMock.clear();
  const { boardViewModel: boardViewModel2, featureOptionsViewModel: featureOptionsViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const { getGameSetupPresetById: getGameSetupPresetById2 } = await Promise.resolve().then(() => (init_gameSetupPresets(), gameSetupPresets_exports));
  boardViewModel2.reset();
  featureOptionsViewModel2.resetToDefaults();
  featureOptionsViewModel2.setOption("useBrilliantMoveBudget", true);
  featureOptionsViewModel2.setBrilliantMovesPerGame(2);
  const baselineSessionId = boardViewModel2.debugSessionId;
  await boardViewModel2.makeMoveUCI("e2e4", { consumedBrilliant: true });
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 1);
  const preset = getGameSetupPresetById2("italian");
  assert.ok(preset);
  if (!preset) {
    throw new Error("Expected italian preset to exist");
  }
  assert.equal(boardViewModel2.loadGameSetupPreset(preset), true);
  assert.notEqual(boardViewModel2.debugSessionId, baselineSessionId);
  assert.equal(featureOptionsViewModel2.brilliantUsedCount, 0);
  assert.match(boardViewModel2.statusMessage, /italian/i);
});
test("game analytics summary aggregates quality, timing, complexity, and highlights", async () => {
  const { buildGameAnalyticsSummary: buildGameAnalyticsSummary2 } = await Promise.resolve().then(() => (init_gameAnalytics(), gameAnalytics_exports));
  const summary = buildGameAnalyticsSummary2({
    sessionId: "session_test",
    createdAtMs: 1e3,
    finishedAtMs: 9e3,
    gameStatus: "Checkmate! White wins",
    personaId: "aggressive",
    personaLabel: "Aggressive",
    setupName: "Italian Game",
    setupCategory: "openings",
    autoplayDurationMs: 2600,
    pgn: "1. e4 e5 *",
    moveAnnotations: [
      {
        beforeFen: "a",
        afterFen: "b",
        uci: "e2e4",
        moveNumber: 1,
        consumedBrilliant: false,
        actor: "player",
        san: "e4",
        bucket: "good",
        evalLoss: 42,
        evaluation: 18,
        complexityLevel: "medium",
        complexityScore: 0.5,
        timestamp: 2e3,
        delayMsSincePrevious: 700
      },
      {
        beforeFen: "b",
        afterFen: "c",
        uci: "e7e5",
        moveNumber: 1,
        consumedBrilliant: true,
        actor: "engine",
        san: "e5+",
        bucket: "best",
        evalLoss: 0,
        evaluation: 32,
        complexityLevel: "high",
        complexityScore: 0.8,
        timestamp: 2800,
        delayMsSincePrevious: 800
      },
      {
        beforeFen: "c",
        afterFen: "d",
        uci: "g1f3",
        moveNumber: 2,
        consumedBrilliant: false,
        actor: "player",
        san: "Nf3",
        bucket: "mistake",
        evalLoss: 310,
        evaluation: -90,
        complexityLevel: "low",
        complexityScore: 0.2,
        timestamp: 4300,
        delayMsSincePrevious: 1500
      }
    ]
  });
  assert.equal(summary.result, "White won");
  assert.equal(summary.brilliantMoves, 1);
  assert.equal(summary.moveCount, 3);
  assert.equal(summary.qualityCounts.best, 1);
  assert.equal(summary.qualityCounts.good, 1);
  assert.equal(summary.qualityCounts.mistake, 1);
  assert.equal(summary.averageEvalLoss, 117.3);
  assert.equal(summary.averageMoveDelayMs, 1e3);
  assert.equal(summary.complexityDistribution.low, 1);
  assert.equal(summary.complexityDistribution.medium, 1);
  assert.equal(summary.complexityDistribution.high, 1);
  assert.equal(summary.highlightedBrilliantMoves.length, 1);
  assert.equal(summary.majorMistakes.length, 1);
  assert.equal(summary.evalTrend.length, 3);
  assert.equal(summary.complexityTrend.length, 3);
});
test("game analytics viewmodel stores completed sessions in recent games", async () => {
  localStorageMock.clear();
  const { GameAnalyticsViewModel: GameAnalyticsViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const analytics = new GameAnalyticsViewModel2({
    boardViewModel: {
      debugSessionId: "session_capture",
      moveAnnotations: [
        {
          beforeFen: "a",
          afterFen: "b",
          uci: "e2e4",
          moveNumber: 1,
          consumedBrilliant: false,
          actor: "player",
          san: "e4",
          bucket: "good",
          evalLoss: 40,
          evaluation: 15,
          complexityLevel: "medium",
          complexityScore: 0.45,
          timestamp: 1e3,
          delayMsSincePrevious: 600
        }
      ],
      sessionStartedAt: 0,
      gameStatus: "Draw!",
      pgn: "1. e4 *",
      currentSetupName: "Custom Position",
      currentSetupCategory: "custom",
      autoPlayActiveDurationMs: 900,
      isGameOver: true
    },
    configViewModel: {
      activePersonaId: "medium",
      activePersonaLabel: "Medium"
    }
  });
  analytics.captureCompletedGame();
  assert.equal(analytics.recentGames.length, 1);
  assert.equal(analytics.recentGames[0]?.sessionId, "session_capture");
  assert.equal(analytics.recentGameEntries[0]?.personaLabel, "Medium");
});
test("autoplay schedules correctly for a black engine after a white player move", async () => {
  localStorageMock.clear();
  const { boardViewModel: boardViewModel2, engineViewModel: engineViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const originalSolveNextMove = boardViewModel2.solveNextMove.bind(boardViewModel2);
  let solveCalls = 0;
  boardViewModel2.reset();
  boardViewModel2.setAutoPlay(true);
  boardViewModel2.setEnginePlaysFor("b");
  boardViewModel2.solveNextMove = async () => {
    solveCalls += 1;
    return null;
  };
  engineViewModel2.isInitialized = true;
  assert.equal(boardViewModel2.makeMove("e2", "e4"), true);
  await new Promise((resolve) => {
    setTimeout(resolve, 900);
  });
  assert.equal(solveCalls, 1);
  boardViewModel2.solveNextMove = originalSolveNextMove;
});
test("autoplay still plays black when player-move background analysis is pending", async () => {
  localStorageMock.clear();
  const { boardViewModel: boardViewModel2, engineViewModel: engineViewModel2, uiStateViewModel: uiStateViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const originalInitialize = engineViewModel2.initialize.bind(engineViewModel2);
  const originalAnalyzePosition = engineViewModel2.analyzePosition.bind(engineViewModel2);
  const originalPickMove = engineViewModel2.pickMoveFromAnalysis.bind(engineViewModel2);
  const originalAutoPlaySpeed = uiStateViewModel2.autoPlaySpeed;
  boardViewModel2.reset();
  boardViewModel2.setAutoPlay(true);
  boardViewModel2.setEnginePlaysFor("b");
  uiStateViewModel2.setAutoPlaySpeed("fast");
  engineViewModel2.isInitialized = true;
  engineViewModel2.initialize = async () => void 0;
  engineViewModel2.analyzePosition = async (fen, _depth, _multiPV, purpose = "background") => {
    if (purpose === "background") {
      return new Promise(() => void 0);
    }
    return {
      requestId: 1,
      analyzedFen: fen,
      moves: [
        {
          move: "e7e5",
          evaluation: 20,
          evalLoss: 0,
          pv: ["e7e5"],
          multipv: 1,
          depth: 8,
          bucket: "best"
        }
      ],
      complexity: {
        level: "low",
        score: 0.2,
        spread: 12,
        closeCandidates: 1,
        volatility: 8
      },
      ignored: false,
      fromCache: false,
      purpose: "engineMove"
    };
  };
  engineViewModel2.pickMoveFromAnalysis = () => ({
    move: {
      move: "e7e5",
      evaluation: 20,
      evalLoss: 0,
      pv: ["e7e5"],
      multipv: 1,
      depth: 8,
      bucket: "best"
    },
    bucket: "best",
    isBrilliant: false
  });
  assert.equal(boardViewModel2.makeMove("e2", "e4"), true);
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
  assert.equal(boardViewModel2.history.length, 2);
  assert.equal(boardViewModel2.history[1]?.san, "e5");
  engineViewModel2.initialize = originalInitialize;
  engineViewModel2.analyzePosition = originalAnalyzePosition;
  engineViewModel2.pickMoveFromAnalysis = originalPickMove;
  uiStateViewModel2.setAutoPlaySpeed(originalAutoPlaySpeed);
});
test("startAutoPlayTurn lets the white engine begin the game manually", async () => {
  localStorageMock.clear();
  const { boardViewModel: boardViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const originalSolveNextMove = boardViewModel2.solveNextMove.bind(boardViewModel2);
  let autoTriggeredArgument = null;
  boardViewModel2.reset();
  boardViewModel2.setAutoPlay(true);
  boardViewModel2.setEnginePlaysFor("w");
  boardViewModel2.solveNextMove = async (autoTriggered = false) => {
    autoTriggeredArgument = autoTriggered;
    return null;
  };
  assert.equal(boardViewModel2.canStartAutoPlayTurn, true);
  await boardViewModel2.startAutoPlayTurn();
  assert.equal(autoTriggeredArgument, true);
  boardViewModel2.solveNextMove = originalSolveNextMove;
});
test("startAutoPlayTurn is available for a black engine after the player move", async () => {
  localStorageMock.clear();
  const { boardViewModel: boardViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const originalSolveNextMove = boardViewModel2.solveNextMove.bind(boardViewModel2);
  let autoTriggeredArgument = null;
  boardViewModel2.reset();
  boardViewModel2.setAutoPlay(true);
  boardViewModel2.setEnginePlaysFor("b");
  boardViewModel2.solveNextMove = async (autoTriggered = false) => {
    autoTriggeredArgument = autoTriggered;
    return null;
  };
  assert.equal(boardViewModel2.makeMove("e2", "e4"), true);
  assert.equal(boardViewModel2.canStartAutoPlayTurn, true);
  await boardViewModel2.startAutoPlayTurn();
  assert.equal(autoTriggeredArgument, true);
  boardViewModel2.solveNextMove = originalSolveNextMove;
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2VuZ2luZS9hbmFseXNpc1NhZmV0eS50cyIsICIuLi8uLi9zcmMvZW5naW5lL2FuYWx5c2lzQ2FjaGUudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9yYW5kb20udHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lU2Vzc2lvbi50cyIsICIuLi8uLi9zcmMvZW5naW5lL2JyaWxsaWFudFRyYWNraW5nLnRzIiwgIi4uLy4uL3NyYy9zaGFyZWQvZGVidWcudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZS50cyIsICIuLi8uLi9zcmMvZW5naW5lL2VuZ2luZUNvb3JkaW5hdG9yLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvdHlwZXMudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9tb3ZlQ2xhc3NpZmllci50cyIsICIuLi8uLi9zcmMvZW5naW5lL21vdmVQaWNrZXIudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9mZWF0dXJlT3B0aW9ucy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvZW5naW5lL2JyaWxsaWFudE1vdmUudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lUGhhc2UudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9wb3NpdGlvbkNvbXBsZXhpdHkudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9wZXJzb25hQmlhcy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9FbmdpbmVWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvQ29uZmlnVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL1VpU3RhdGVWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvQm9hcmRWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lQW5hbHl0aWNzLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL0dhbWVBbmFseXRpY3NWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9vcGVuaW5ncy50cyIsICIuLi8uLi9zcmMvZW5naW5lL2dhbWVTZXR1cFByZXNldHMudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvR2FtZVNldHVwVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL0RlYnVnVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvcGVyc29uYVByb2ZpbGVzLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL1BlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9pbmRleC50cyIsICIuLi9wZXJzb25hY2hlc3MudGVzdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGludGVyZmFjZSBBbmFseXNpc1NuYXBzaG90PFRNb3Zlcz4ge1xuICByZXF1ZXN0SWQ6IG51bWJlcjtcbiAgYW5hbHl6ZWRGZW46IHN0cmluZztcbiAgbW92ZXM6IFRNb3Zlcztcbn1cblxuZXhwb3J0IHR5cGUgQW5hbHlzaXNQdXJwb3NlID0gJ2VuZ2luZU1vdmUnIHwgJ2JhY2tncm91bmQnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNTdGFsZUFuYWx5c2lzUmVxdWVzdChcbiAgcmVxdWVzdElkOiBudW1iZXIsXG4gIGxhdGVzdFJlcXVlc3RJZDogbnVtYmVyLFxuKTogYm9vbGVhbiB7XG4gIHJldHVybiByZXF1ZXN0SWQgIT09IGxhdGVzdFJlcXVlc3RJZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbkFwcGx5QW5hbHl6ZWRNb3ZlKFxuICBjdXJyZW50RmVuOiBzdHJpbmcsXG4gIGFuYWx5emVkRmVuOiBzdHJpbmcsXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGN1cnJlbnRGZW4gPT09IGFuYWx5emVkRmVuO1xufVxuIiwgImltcG9ydCB7IEFuYWx5emVkTW92ZSwgQ2xhc3NpZmllZE1vdmUgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBBbmFseXNpc0NhY2hlRW50cnkge1xuICBrZXk6IHN0cmluZztcbiAgbW92ZXM6IEFuYWx5emVkTW92ZVtdO1xuICBjbGFzc2lmaWVkTW92ZXM/OiBDbGFzc2lmaWVkTW92ZVtdO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQW5hbHlzaXNDYWNoZUtleShcbiAgZmVuOiBzdHJpbmcsXG4gIGRlcHRoOiBudW1iZXIsXG4gIG11bHRpUFY6IG51bWJlcixcbik6IHN0cmluZyB7XG4gIHJldHVybiBgJHtmZW59fGRlcHRoOiR7ZGVwdGh9fG11bHRpcHY6JHttdWx0aVBWfWA7XG59XG5cbmV4cG9ydCBjbGFzcyBBbmFseXNpc0NhY2hlIHtcbiAgcHJpdmF0ZSBlbnRyaWVzID0gbmV3IE1hcDxzdHJpbmcsIEFuYWx5c2lzQ2FjaGVFbnRyeT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1heFNpemU6IG51bWJlciA9IDIwMCkge31cblxuICBjb25maWd1cmUobWF4U2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5tYXhTaXplID0gTWF0aC5tYXgoMSwgbWF4U2l6ZSk7XG4gICAgdGhpcy50cmltKCk7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBBbmFseXNpc0NhY2hlRW50cnkgfCBudWxsIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllcy5nZXQoa2V5KTtcblxuICAgIGlmICghZW50cnkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuZW50cmllcy5kZWxldGUoa2V5KTtcbiAgICB0aGlzLmVudHJpZXMuc2V0KGtleSwgZW50cnkpO1xuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIHNldChlbnRyeTogQW5hbHlzaXNDYWNoZUVudHJ5KTogdm9pZCB7XG4gICAgdGhpcy5lbnRyaWVzLnNldChlbnRyeS5rZXksIGVudHJ5KTtcbiAgICB0aGlzLnRyaW0oKTtcbiAgfVxuXG4gIGludmFsaWRhdGUoa2V5Pzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKGtleSkge1xuICAgICAgdGhpcy5lbnRyaWVzLmRlbGV0ZShrZXkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZW50cmllcy5jbGVhcigpO1xuICB9XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzLnNpemU7XG4gIH1cblxuICBwcml2YXRlIHRyaW0oKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMuZW50cmllcy5zaXplID4gdGhpcy5tYXhTaXplKSB7XG4gICAgICBjb25zdCBvbGRlc3RLZXkgPSB0aGlzLmVudHJpZXMua2V5cygpLm5leHQoKS52YWx1ZTtcblxuICAgICAgaWYgKCFvbGRlc3RLZXkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW50cmllcy5kZWxldGUob2xkZXN0S2V5KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGFuYWx5c2lzQ2FjaGUgPSBuZXcgQW5hbHlzaXNDYWNoZSgpO1xuIiwgImltcG9ydCB7IFBlcnNvbmFJZCB9IGZyb20gJy4vZmVhdHVyZU9wdGlvbnMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJhbmRvbVNvdXJjZSB7XG4gIG5leHQoKTogbnVtYmVyO1xufVxuXG5mdW5jdGlvbiBoYXNoU3RyaW5nKGlucHV0OiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgaGFzaCA9IDIxNjYxMzYyNjE7XG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGlucHV0Lmxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGhhc2ggXj0gaW5wdXQuY2hhckNvZGVBdChpbmRleCk7XG4gICAgaGFzaCA9IE1hdGguaW11bChoYXNoLCAxNjc3NzYxOSk7XG4gIH1cblxuICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cblxuZnVuY3Rpb24gbXVsYmVycnkzMihzZWVkOiBudW1iZXIpOiAoKSA9PiBudW1iZXIge1xuICBsZXQgdmFsdWUgPSBzZWVkID4+PiAwO1xuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgdmFsdWUgKz0gMHg2ZDJiNzlmNTtcbiAgICBsZXQgcmVzdWx0ID0gTWF0aC5pbXVsKHZhbHVlIF4gKHZhbHVlID4+PiAxNSksIHZhbHVlIHwgMSk7XG4gICAgcmVzdWx0IF49IHJlc3VsdCArIE1hdGguaW11bChyZXN1bHQgXiAocmVzdWx0ID4+PiA3KSwgcmVzdWx0IHwgNjEpO1xuICAgIHJldHVybiAoKHJlc3VsdCBeIChyZXN1bHQgPj4+IDE0KSkgPj4+IDApIC8gNDI5NDk2NzI5NjtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxlZ2FjeVJhbmRvbVNvdXJjZSgpOiBSYW5kb21Tb3VyY2Uge1xuICByZXR1cm4ge1xuICAgIG5leHQ6ICgpID0+IE1hdGgucmFuZG9tKCksXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2Uoc2VlZDogc3RyaW5nKTogUmFuZG9tU291cmNlIHtcbiAgY29uc3QgZ2VuZXJhdG9yID0gbXVsYmVycnkzMihoYXNoU3RyaW5nKHNlZWQpKTtcblxuICByZXR1cm4ge1xuICAgIG5leHQ6ICgpID0+IGdlbmVyYXRvcigpLFxuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERldGVybWluaXN0aWNTZWVkQ29udGV4dCB7XG4gIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICBjdXJyZW50RmVuOiBzdHJpbmc7XG4gIG1vdmVDb3VudDogbnVtYmVyO1xuICBzaWRlVG9Nb3ZlOiAndycgfCAnYic7XG4gIHBlcnNvbmE6IFBlcnNvbmFJZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQoe1xuICBnYW1lU3RhcnRGZW4sXG4gIGN1cnJlbnRGZW4sXG4gIG1vdmVDb3VudCxcbiAgc2lkZVRvTW92ZSxcbiAgcGVyc29uYSxcbn06IERldGVybWluaXN0aWNTZWVkQ29udGV4dCk6IHN0cmluZyB7XG4gIHJldHVybiBbZ2FtZVN0YXJ0RmVuLCBjdXJyZW50RmVuLCBTdHJpbmcobW92ZUNvdW50KSwgc2lkZVRvTW92ZSwgcGVyc29uYV0uam9pbignfCcpO1xufVxuIiwgImltcG9ydCB7IE1vdmVBbm5vdGF0aW9uIH0gZnJvbSAnLi9icmlsbGlhbnRUcmFja2luZyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc2lzdGVkQm9hcmRTdGF0ZSB7XG4gIGN1cnJlbnRGZW46IHN0cmluZztcbiAgZmVuSGlzdG9yeTogc3RyaW5nW107XG4gIGdhbWVTZXNzaW9uSWQ6IHN0cmluZztcbiAgZ2FtZVN0YXJ0RmVuOiBzdHJpbmc7XG4gIGN1cnJlbnRTZXR1cE5hbWU/OiBzdHJpbmc7XG4gIGN1cnJlbnRTZXR1cENhdGVnb3J5Pzogc3RyaW5nO1xuICBoaXN0b3J5QW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW107XG4gIHJlZG9Bbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdhbWVTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBzZXNzaW9uXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTApfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUGduU3RhcnRGZW4oXG4gIGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bGw+LFxuICBmYWxsYmFja0Zlbjogc3RyaW5nLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGhlYWRlcnMuU2V0VXAgPT09ICcxJyAmJiB0eXBlb2YgaGVhZGVycy5GRU4gPT09ICdzdHJpbmcnXG4gICAgPyBoZWFkZXJzLkZFTlxuICAgIDogZmFsbGJhY2tGZW47XG59XG4iLCAiZXhwb3J0IGludGVyZmFjZSBNb3ZlQW5ub3RhdGlvbiB7XG4gIGJlZm9yZUZlbjogc3RyaW5nO1xuICBhZnRlckZlbjogc3RyaW5nO1xuICB1Y2k6IHN0cmluZztcbiAgbW92ZU51bWJlcjogbnVtYmVyO1xuICBjb25zdW1lZEJyaWxsaWFudDogYm9vbGVhbjtcbiAgYWN0b3I/OiAncGxheWVyJyB8ICdlbmdpbmUnIHwgJ3JlZG8nO1xuICBzYW4/OiBzdHJpbmc7XG4gIGJ1Y2tldD86IHN0cmluZyB8IG51bGw7XG4gIGV2YWxMb3NzPzogbnVtYmVyIHwgbnVsbDtcbiAgZXZhbHVhdGlvbj86IG51bWJlciB8IG51bGw7XG4gIGNvbXBsZXhpdHlMZXZlbD86ICdsb3cnIHwgJ21lZGl1bScgfCAnaGlnaCcgfCBudWxsO1xuICBjb21wbGV4aXR5U2NvcmU/OiBudW1iZXIgfCBudWxsO1xuICB0aW1lc3RhbXA/OiBudW1iZXI7XG4gIGRlbGF5TXNTaW5jZVByZXZpb3VzPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWxsaWFudFVzYWdlIHtcbiAgYnJpbGxpYW50VXNlZENvdW50OiBudW1iZXI7XG4gIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBudW1iZXJbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlcml2ZUJyaWxsaWFudFVzYWdlKFxuICBhbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSxcbik6IEJyaWxsaWFudFVzYWdlIHtcbiAgY29uc3QgYnJpbGxpYW50TW92ZU51bWJlcnMgPSBhbm5vdGF0aW9uc1xuICAgIC5maWx0ZXIoKGFubm90YXRpb24pID0+IGFubm90YXRpb24uY29uc3VtZWRCcmlsbGlhbnQpXG4gICAgLm1hcCgoYW5ub3RhdGlvbikgPT4gYW5ub3RhdGlvbi5tb3ZlTnVtYmVyKTtcblxuICByZXR1cm4ge1xuICAgIGJyaWxsaWFudFVzZWRDb3VudDogYnJpbGxpYW50TW92ZU51bWJlcnMubGVuZ3RoLFxuICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzLFxuICB9O1xufVxuIiwgImNvbnN0IERFQlVHX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19kZWJ1Z19sb2dnaW5nJztcblxuZnVuY3Rpb24gcmVhZEJyb3dzZXJEZWJ1Z0ZsYWcoKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2luZG93LmxvY2FsU3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oREVCVUdfU1RPUkFHRV9LRVkpID09PSAnMSc7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkUHJvY2Vzc0RlYnVnRmxhZygpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBwcm9jZXNzLmVudi5QRVJTT05BQ0hFU1NfREVCVUcgPT09ICcxJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGVidWdMb2dnaW5nRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHJlYWRCcm93c2VyRGVidWdGbGFnKCkgfHwgcmVhZFByb2Nlc3NEZWJ1Z0ZsYWcoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdpbmRvdy5sb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKERFQlVHX1NUT1JBR0VfS0VZLCAnMScpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oREVCVUdfU1RPUkFHRV9LRVkpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLy8gSWdub3JlIGxvY2FsU3RvcmFnZSBmYWlsdXJlcyBhbmQga2VlcCB0aGUgYXBwIHJ1bm5pbmcuXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlYnVnTG9nZ2VyKHNjb3BlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHtcbiAgICBkZWJ1ZzogKC4uLmFyZ3M6IHVua25vd25bXSkgPT4ge1xuICAgICAgaWYgKGlzRGVidWdMb2dnaW5nRW5hYmxlZCgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbJHtzY29wZX1dYCwgLi4uYXJncyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlcnJvcjogKC4uLmFyZ3M6IHVua25vd25bXSkgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcihgWyR7c2NvcGV9XWAsIC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgd2FybjogKC4uLmFyZ3M6IHVua25vd25bXSkgPT4ge1xuICAgICAgY29uc29sZS53YXJuKGBbJHtzY29wZX1dYCwgLi4uYXJncyk7XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGV2ZWxvcG1lbnRCdWlsZCgpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBNQUlOX1dJTkRPV19WSVRFX0RFVl9TRVJWRVJfVVJMICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBCb29sZWFuKE1BSU5fV0lORE9XX1ZJVEVfREVWX1NFUlZFUl9VUkwpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gQm9vbGVhbihpbXBvcnQubWV0YS5lbnY/LkRFVik7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4iLCAiLyoqXG4gKiBTdG9ja2Zpc2ggVUNJIEVuZ2luZSBTZXJ2aWNlXG4gKiBNb2RlbCBsYXllciAtIFB1cmUgVHlwZVNjcmlwdCwgbm8gUmVhY3QsIG5vIE1vYlhcbiAqIFxuICogSGFuZGxlcyBjb21tdW5pY2F0aW9uIHdpdGggU3RvY2tmaXNoIFdBU00gZW5naW5lIHZpYSBXZWIgV29ya2VyXG4gKi9cblxuaW1wb3J0IHsgQW5hbHl6ZWRNb3ZlLCBTdG9ja2Zpc2hJbmZvIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBjcmVhdGVEZWJ1Z0xvZ2dlciB9IGZyb20gJy4uL3NoYXJlZC9kZWJ1Zyc7XG5cbnR5cGUgTWVzc2FnZUhhbmRsZXIgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkO1xuXG5leHBvcnQgY2xhc3MgU3RvY2tmaXNoU2VydmljZSB7XG4gIHByaXZhdGUgd29ya2VyOiBXb3JrZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBtZXNzYWdlSGFuZGxlcnM6IFNldDxNZXNzYWdlSGFuZGxlcj4gPSBuZXcgU2V0KCk7XG4gIHByaXZhdGUgaXNSZWFkeSA9IGZhbHNlO1xuICBwcml2YXRlIHJlYWR5UmVzb2x2ZXJzOiBBcnJheTwoKSA9PiB2b2lkPiA9IFtdO1xuICBwcml2YXRlIG11bHRpUFYgPSAxMjtcbiAgcHJpdmF0ZSBkZXB0aCA9IDIwO1xuICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHNlcnZpY2VOYW1lID0gJ1N0b2NrZmlzaFNlcnZpY2UnKSB7XG4gICAgdGhpcy5sb2dnZXIgPSBjcmVhdGVEZWJ1Z0xvZ2dlcihzZXJ2aWNlTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBTdG9ja2Zpc2ggV0FTTSBlbmdpbmVcbiAgICovXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMud29ya2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIENyZWF0ZSB3b3JrZXIgdXNpbmcgc3RvY2tmaXNoLmpzXG4gICAgICAgIC8vIEluIFZpdGUsIHdlIG5lZWQgdG8gdXNlID93b3JrZXIgc3VmZml4IG9yIGNyZWF0ZSBpbmxpbmUgd29ya2VyXG4gICAgICAgIGNvbnN0IHdvcmtlckNvZGUgPSBgXG4gICAgICAgICAgaW1wb3J0U2NyaXB0cygnJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9zdG9ja2Zpc2guanMnKTtcbiAgICAgICAgYDtcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt3b3JrZXJDb2RlXSwgeyB0eXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcgfSk7XG4gICAgICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcihVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcblxuICAgICAgICB0aGlzLndvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0eXBlb2YgZXZlbnQuZGF0YSA9PT0gJ3N0cmluZycgPyBldmVudC5kYXRhIDogU3RyaW5nKGV2ZW50LmRhdGEpO1xuICAgICAgICAgIHRoaXMuaGFuZGxlTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLndvcmtlci5vbmVycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ1dvcmtlciBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXYWl0IGZvciBVQ0kgaW5pdGlhbGl6YXRpb25cbiAgICAgICAgY29uc3QgcmVhZHlIYW5kbGVyID0gKG1zZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKG1zZyA9PT0gJ3VjaW9rJykge1xuICAgICAgICAgICAgdGhpcy5pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcbiAgICAgICAgICAgIHRoaXMucmVhZHlSZXNvbHZlcnMuZm9yRWFjaChyID0+IHIoKSk7XG4gICAgICAgICAgICB0aGlzLnJlYWR5UmVzb2x2ZXJzID0gW107XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWRkTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSB3b3JrZXIgaXMgcmVhZHlcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZCgndWNpJyk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIGVuZ2luZSBpbnN0YW5jZVxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53b3JrZXIpIHtcbiAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgdGhpcy53b3JrZXIgPSBudWxsO1xuICAgICAgdGhpcy5pc1JlYWR5ID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBVQ0kgY29tbWFuZCB0byBlbmdpbmVcbiAgICovXG4gIHByaXZhdGUgc2VuZENvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLndvcmtlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdG9ja2Zpc2ggbm90IGluaXRpYWxpemVkJyk7XG4gICAgfVxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKGNvbW1hbmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBpbmNvbWluZyBtZXNzYWdlIGZyb20gZW5naW5lXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKG1lc3NhZ2UgJiYgKG1lc3NhZ2Uuc3RhcnRzV2l0aCgnYmVzdG1vdmUnKSB8fCBtZXNzYWdlID09PSAncmVhZHlvaycgfHwgbWVzc2FnZSA9PT0gJ3VjaW9rJykpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdNZXNzYWdlOicsIG1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlcihtZXNzYWdlKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbWVzc2FnZSBoYW5kbGVyXG4gICAqL1xuICBhZGRNZXNzYWdlSGFuZGxlcihoYW5kbGVyOiBNZXNzYWdlSGFuZGxlcik6IHZvaWQge1xuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzLmFkZChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBtZXNzYWdlIGhhbmRsZXJcbiAgICovXG4gIHJlbW92ZU1lc3NhZ2VIYW5kbGVyKGhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyKTogdm9pZCB7XG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlcnMuZGVsZXRlKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIGVuZ2luZSB0byBiZSByZWFkeVxuICAgKi9cbiAgYXN5bmMgd2FpdEZvclJlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHJldHVybjtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnJlYWR5UmVzb2x2ZXJzLnB1c2gocmVzb2x2ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IE11bHRpUFYgb3B0aW9uXG4gICAqL1xuICBzZXRNdWx0aVBWKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLm11bHRpUFYgPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICB0aGlzLnNlbmRDb21tYW5kKGBzZXRvcHRpb24gbmFtZSBNdWx0aVBWIHZhbHVlICR7dmFsdWV9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBzZWFyY2ggZGVwdGhcbiAgICovXG4gIHNldERlcHRoKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmRlcHRoID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlIGVuZ2luZSBvcHRpb25zXG4gICAqL1xuICBjb25maWd1cmUob3B0aW9uczogeyBtdWx0aVBWPzogbnVtYmVyOyBkZXB0aD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgaWYgKG9wdGlvbnMubXVsdGlQViAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNldE11bHRpUFYob3B0aW9ucy5tdWx0aVBWKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGVwdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXREZXB0aChvcHRpb25zLmRlcHRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSBhIHBvc2l0aW9uIGFuZCByZXR1cm4gYWxsIGNhbmRpZGF0ZSBtb3Zlc1xuICAgKi9cbiAgYXN5bmMgYW5hbHl6ZVBvc2l0aW9uKGZlbjogc3RyaW5nKTogUHJvbWlzZTxBbmFseXplZE1vdmVbXT4ge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvclJlYWR5KCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IG1vdmVzOiBNYXA8bnVtYmVyLCBTdG9ja2Zpc2hJbmZvPiA9IG5ldyBNYXAoKTtcbiAgICAgIGxldCBiZXN0U2NvcmUgPSAwO1xuICAgICAgbGV0IGhhc1JlY2VpdmVkQmVzdE1vdmUgPSBmYWxzZTtcbiAgICAgIGxldCBtYXhEZXB0aFJlYWNoZWQgPSAwO1xuXG4gICAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29tcGxldGUgYW5hbHlzaXMgd2l0aCBjb2xsZWN0ZWQgbW92ZXNcbiAgICAgIGNvbnN0IGNvbXBsZXRlQW5hbHlzaXMgPSAoKSA9PiB7XG4gICAgICAgIGlmIChoYXNSZWNlaXZlZEJlc3RNb3ZlKSByZXR1cm47XG4gICAgICAgIGhhc1JlY2VpdmVkQmVzdE1vdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG5cbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0NvbXBsZXRpbmcgYW5hbHlzaXMsIGNvbGxlY3RlZCcsIG1vdmVzLnNpemUsICdtb3ZlcycpO1xuXG4gICAgICAgIC8vIENvbnZlcnQgdG8gQW5hbHl6ZWRNb3ZlIGFycmF5XG4gICAgICAgIGNvbnN0IGFuYWx5emVkTW92ZXM6IEFuYWx5emVkTW92ZVtdID0gW107XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0aGlzLm11bHRpUFY7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGluZm8gPSBtb3Zlcy5nZXQoaSk7XG4gICAgICAgICAgaWYgKGluZm8gJiYgaW5mby5wdi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBldmFsTG9zcyA9IE1hdGguYWJzKGJlc3RTY29yZSAtIGluZm8uc2NvcmUpO1xuICAgICAgICAgICAgYW5hbHl6ZWRNb3Zlcy5wdXNoKHtcbiAgICAgICAgICAgICAgbW92ZTogaW5mby5wdlswXSxcbiAgICAgICAgICAgICAgZXZhbHVhdGlvbjogaW5mby5zY29yZSxcbiAgICAgICAgICAgICAgZXZhbExvc3MsXG4gICAgICAgICAgICAgIHB2OiBpbmZvLnB2LFxuICAgICAgICAgICAgICBtdWx0aXB2OiBpbmZvLm11bHRpcHYsXG4gICAgICAgICAgICAgIGRlcHRoOiBpbmZvLmRlcHRoLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFuYWx5emVkTW92ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdSZXR1cm5pbmcnLCBhbmFseXplZE1vdmVzLmxlbmd0aCwgJ2FuYWx5emVkIG1vdmVzJyk7XG4gICAgICAgICAgcmVzb2x2ZShhbmFseXplZE1vdmVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgZ2FtZSBvdmVyIHBvc2l0aW9uIChjaGVja21hdGUvc3RhbGVtYXRlKVxuICAgICAgICAgIC8vIElmIHdlIHJlY2VpdmVkIG1hdGUgc2NvcmVzIGJ1dCBubyBtb3ZlcywgaXQncyBnYW1lIG92ZXJcbiAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTm8gbW92ZXMgY29sbGVjdGVkIC0gbGlrZWx5IGdhbWUgb3ZlciBwb3NpdGlvbicpO1xuICAgICAgICAgIHJlc29sdmUoW10pOyAvLyBSZXR1cm4gZW1wdHkgYXJyYXkgaW5zdGVhZCBvZiByZWplY3RpbmcgZm9yIGdhbWUgb3ZlciBwb3NpdGlvbnNcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gQWRkIHRpbWVvdXQgdG8gZm9yY2Ugc3RvcCBhZnRlciByZWFzb25hYmxlIHRpbWVcbiAgICAgIGNvbnN0IGZvcmNlU3RvcFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKCFoYXNSZWNlaXZlZEJlc3RNb3ZlKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIud2FybignRm9yY2luZyBzdG9wIGFmdGVyIDEwIHNlY29uZHMgdG8gZ2V0IGJlc3Rtb3ZlJyk7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZCgnc3RvcCcpO1xuICAgICAgICAgIC8vIEdpdmUgaXQgYSBtb21lbnQgdG8gcmVzcG9uZCB3aXRoIGJlc3Rtb3ZlXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWhhc1JlY2VpdmVkQmVzdE1vdmUpIHtcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXIud2FybignTm8gYmVzdG1vdmUgYWZ0ZXIgc3RvcCwgdXNpbmcgY29sbGVjdGVkIG1vdmVzJyk7XG4gICAgICAgICAgICAgIGNvbXBsZXRlQW5hbHlzaXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTAwMDApOyAvLyAxMCBzZWNvbmQgdGltZW91dCB0byBmb3JjZSBzdG9wXG5cbiAgICAgIC8vIEFkZCBhYnNvbHV0ZSB0aW1lb3V0IHRvIHByZXZlbnQgaGFuZ2luZ1xuICAgICAgY29uc3QgYWJzb2x1dGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghaGFzUmVjZWl2ZWRCZXN0TW92ZSkge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdBbmFseXNpcyB0aW1lb3V0IGFmdGVyIDMwIHNlY29uZHMnKTtcbiAgICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGZvcmNlU3RvcFRpbWVvdXQpO1xuICAgICAgICAgIGNvbXBsZXRlQW5hbHlzaXMoKTsgLy8gVHJ5IHRvIHVzZSB3aGF0IHdlIGhhdmVcbiAgICAgICAgfVxuICAgICAgfSwgMzAwMDApOyAvLyAzMCBzZWNvbmQgYWJzb2x1dGUgdGltZW91dFxuXG4gICAgICBjb25zdCBhbmFseXNpc0hhbmRsZXIgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIENoZWNrIGZvciBtYXRlIHNjb3JlcyAoZ2FtZSBvdmVyIHBvc2l0aW9ucylcbiAgICAgICAgaWYgKG1lc3NhZ2UuaW5jbHVkZXMoJ3Njb3JlIG1hdGUnKSkge1xuICAgICAgICAgIC8vIEV4dHJhY3QgbWF0ZSBzY29yZSB0byBkZXRlY3QgY2hlY2ttYXRlL3N0YWxlbWF0ZVxuICAgICAgICAgIGNvbnN0IG1hdGVNYXRjaCA9IG1lc3NhZ2UubWF0Y2goL3Njb3JlIG1hdGUgKC0/XFxkKykvKTtcbiAgICAgICAgICBpZiAobWF0ZU1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRlSW4gPSBwYXJzZUludChtYXRlTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdEZXRlY3RlZCBtYXRlIHNjb3JlOicsIG1hdGVJbik7XG4gICAgICAgICAgICAvLyBJZiBtYXRlIGlzIDAgb3IgbmVnYXRpdmUsIGl0J3MgY2hlY2ttYXRlL3N0YWxlbWF0ZSAobm8gbW92ZXMgYXZhaWxhYmxlKVxuICAgICAgICAgICAgaWYgKG1hdGVJbiA8PSAwKSB7XG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdHYW1lIG92ZXIgcG9zaXRpb24gZGV0ZWN0ZWQgKGNoZWNrbWF0ZS9zdGFsZW1hdGUpJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBQYXJzZSBpbmZvIGxpbmVzXG4gICAgICAgIGlmIChtZXNzYWdlLnN0YXJ0c1dpdGgoJ2luZm8nKSAmJiBtZXNzYWdlLmluY2x1ZGVzKCdtdWx0aXB2JykpIHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gdGhpcy5wYXJzZUluZm9MaW5lKG1lc3NhZ2UpO1xuICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICBtb3Zlcy5zZXQoaW5mby5tdWx0aXB2LCBpbmZvKTtcbiAgICAgICAgICAgIGlmIChpbmZvLm11bHRpcHYgPT09IDEpIHtcbiAgICAgICAgICAgICAgYmVzdFNjb3JlID0gaW5mby5zY29yZTtcbiAgICAgICAgICAgICAgbWF4RGVwdGhSZWFjaGVkID0gTWF0aC5tYXgobWF4RGVwdGhSZWFjaGVkLCBpbmZvLmRlcHRoKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIElmIHdlJ3ZlIHJlYWNoZWQgdGhlIHRhcmdldCBkZXB0aCBhbmQgaGF2ZSBlbm91Z2ggbW92ZXMsIHdlIGNhbiBzdG9wIGVhcmx5XG4gICAgICAgICAgICAgIGlmIChpbmZvLmRlcHRoID49IHRoaXMuZGVwdGggJiYgbW92ZXMuc2l6ZSA+PSBNYXRoLm1pbigzLCB0aGlzLm11bHRpUFYpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1JlYWNoZWQgdGFyZ2V0IGRlcHRoLCBzdG9wcGluZyBlYXJseScpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZENvbW1hbmQoJ3N0b3AnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuYWx5c2lzIGNvbXBsZXRlXG4gICAgICAgIGlmIChtZXNzYWdlLnN0YXJ0c1dpdGgoJ2Jlc3Rtb3ZlJykpIHtcbiAgICAgICAgICBoYXNSZWNlaXZlZEJlc3RNb3ZlID0gdHJ1ZTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZm9yY2VTdG9wVGltZW91dCk7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGFic29sdXRlVGltZW91dCk7XG4gICAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihhbmFseXNpc0hhbmRsZXIpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgYmVzdG1vdmUgaXMgXCJub25lXCIgKG5vIGxlZ2FsIG1vdmVzIC0gY2hlY2ttYXRlL3N0YWxlbWF0ZSlcbiAgICAgICAgICBjb25zdCBiZXN0bW92ZU1hdGNoID0gbWVzc2FnZS5tYXRjaCgvYmVzdG1vdmVcXHMrKFxcUyspLyk7XG4gICAgICAgICAgaWYgKGJlc3Rtb3ZlTWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnN0IGJlc3Rtb3ZlID0gYmVzdG1vdmVNYXRjaFsxXTtcbiAgICAgICAgICAgIGlmIChiZXN0bW92ZSA9PT0gJyhub25lKScgfHwgYmVzdG1vdmUgPT09ICdub25lJyB8fCBiZXN0bW92ZSA9PT0gJzAwMDAnKSB7XG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdObyBsZWdhbCBtb3ZlcyAoY2hlY2ttYXRlL3N0YWxlbWF0ZSknKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShbXSk7IC8vIFJldHVybiBlbXB0eSBhcnJheSBmb3IgZ2FtZSBvdmVyIHBvc2l0aW9uc1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1JlY2VpdmVkIGJlc3Rtb3ZlLCBjb2xsZWN0ZWQnLCBtb3Zlcy5zaXplLCAnbW92ZXMnKTtcblxuICAgICAgICAgIC8vIENvbnZlcnQgdG8gQW5hbHl6ZWRNb3ZlIGFycmF5XG4gICAgICAgICAgY29uc3QgYW5hbHl6ZWRNb3ZlczogQW5hbHl6ZWRNb3ZlW10gPSBbXTtcbiAgICAgICAgICBcbiAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0aGlzLm11bHRpUFY7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IG1vdmVzLmdldChpKTtcbiAgICAgICAgICAgIGlmIChpbmZvICYmIGluZm8ucHYubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBjb25zdCBldmFsTG9zcyA9IE1hdGguYWJzKGJlc3RTY29yZSAtIGluZm8uc2NvcmUpO1xuICAgICAgICAgICAgICBhbmFseXplZE1vdmVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG1vdmU6IGluZm8ucHZbMF0sXG4gICAgICAgICAgICAgICAgZXZhbHVhdGlvbjogaW5mby5zY29yZSxcbiAgICAgICAgICAgICAgICBldmFsTG9zcyxcbiAgICAgICAgICAgICAgICBwdjogaW5mby5wdixcbiAgICAgICAgICAgICAgICBtdWx0aXB2OiBpbmZvLm11bHRpcHYsXG4gICAgICAgICAgICAgICAgZGVwdGg6IGluZm8uZGVwdGgsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHdlIGhhdmUgbm8gbW92ZXMgYnV0IGdvdCBhIGJlc3Rtb3ZlLCBpdCBtaWdodCBzdGlsbCBiZSBnYW1lIG92ZXJcbiAgICAgICAgICBpZiAoYW5hbHl6ZWRNb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdObyBtb3ZlcyBpbiBiZXN0bW92ZSByZXNwb25zZSAtIGdhbWUgb3ZlciBwb3NpdGlvbicpO1xuICAgICAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdSZXR1cm5pbmcnLCBhbmFseXplZE1vdmVzLmxlbmd0aCwgJ2FuYWx5emVkIG1vdmVzJyk7XG4gICAgICAgICAgICByZXNvbHZlKGFuYWx5emVkTW92ZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5hZGRNZXNzYWdlSGFuZGxlcihhbmFseXNpc0hhbmRsZXIpO1xuXG4gICAgICAvLyBXYWl0IGZvciByZWFkeW9rIGJlZm9yZSBzZW5kaW5nIHBvc2l0aW9uXG4gICAgICBjb25zdCByZWFkeUhhbmRsZXIgPSAobXNnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKG1zZyA9PT0gJ3JlYWR5b2snKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihyZWFkeUhhbmRsZXIpO1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbmdpbmUgcmVhZHksIHNlbmRpbmcgcG9zaXRpb24gYW5kIHN0YXJ0aW5nIGFuYWx5c2lzJyk7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZChgcG9zaXRpb24gZmVuICR7ZmVufWApO1xuICAgICAgICAgIHRoaXMuc2VuZENvbW1hbmQoYGdvIGRlcHRoICR7dGhpcy5kZXB0aH1gKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRoaXMuYWRkTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcblxuICAgICAgLy8gU2VuZCBwb3NpdGlvbiBhbmQgc3RhcnQgYW5hbHlzaXNcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTdGFydGluZyBhbmFseXNpcyBmb3IgRkVOOicsIGZlbiwgJ011bHRpUFY9JywgdGhpcy5tdWx0aVBWLCAnRGVwdGg9JywgdGhpcy5kZXB0aCk7XG4gICAgICBcbiAgICAgIHRoaXMuc2VuZENvbW1hbmQoYHNldG9wdGlvbiBuYW1lIE11bHRpUFYgdmFsdWUgJHt0aGlzLm11bHRpUFZ9YCk7XG4gICAgICB0aGlzLnNlbmRDb21tYW5kKCdpc3JlYWR5Jyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgVUNJIGluZm8gbGluZSBpbnRvIHN0cnVjdHVyZWQgZGF0YVxuICAgKi9cbiAgcHJpdmF0ZSBwYXJzZUluZm9MaW5lKGxpbmU6IHN0cmluZyk6IFN0b2NrZmlzaEluZm8gfCBudWxsIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFydHMgPSBsaW5lLnNwbGl0KCcgJyk7XG4gICAgICBcbiAgICAgIGNvbnN0IGdldFZhbHVlQWZ0ZXIgPSAoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgICAgICAgY29uc3QgaWR4ID0gcGFydHMuaW5kZXhPZihrZXkpO1xuICAgICAgICByZXR1cm4gaWR4ID49IDAgJiYgaWR4IDwgcGFydHMubGVuZ3RoIC0gMSA/IHBhcnRzW2lkeCArIDFdIDogbnVsbDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG11bHRpcHZTdHIgPSBnZXRWYWx1ZUFmdGVyKCdtdWx0aXB2Jyk7XG4gICAgICBjb25zdCBkZXB0aFN0ciA9IGdldFZhbHVlQWZ0ZXIoJ2RlcHRoJyk7XG4gICAgICBcbiAgICAgIGlmICghbXVsdGlwdlN0ciB8fCAhZGVwdGhTdHIpIHJldHVybiBudWxsO1xuXG4gICAgICBjb25zdCBtdWx0aXB2ID0gcGFyc2VJbnQobXVsdGlwdlN0ciwgMTApO1xuICAgICAgY29uc3QgZGVwdGggPSBwYXJzZUludChkZXB0aFN0ciwgMTApO1xuXG4gICAgICAvLyBHZXQgc2NvcmUgdmFsdWVcbiAgICAgIGxldCBzY29yZSA9IDA7XG4gICAgICBsZXQgbWF0ZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgY29uc3Qgc2NvcmVJZHggPSBwYXJ0cy5pbmRleE9mKCdzY29yZScpO1xuICAgICAgXG4gICAgICBpZiAoc2NvcmVJZHggPj0gMCAmJiBwYXJ0c1tzY29yZUlkeCArIDFdID09PSAnY3AnKSB7XG4gICAgICAgIHNjb3JlID0gcGFyc2VJbnQocGFydHNbc2NvcmVJZHggKyAyXSwgMTApO1xuICAgICAgfSBlbHNlIGlmIChzY29yZUlkeCA+PSAwICYmIHBhcnRzW3Njb3JlSWR4ICsgMV0gPT09ICdtYXRlJykge1xuICAgICAgICBtYXRlID0gcGFyc2VJbnQocGFydHNbc2NvcmVJZHggKyAyXSwgMTApO1xuICAgICAgICAvLyBDb252ZXJ0IG1hdGUgdG8gYSBsYXJnZSBjZW50aXBhd24gdmFsdWVcbiAgICAgICAgc2NvcmUgPSBtYXRlID4gMCA/IDEwMDAwIC0gbWF0ZSAqIDEwMCA6IC0xMDAwMCAtIG1hdGUgKiAxMDA7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCBQViAocHJpbmNpcGFsIHZhcmlhdGlvbilcbiAgICAgIGNvbnN0IHB2SWR4ID0gcGFydHMuaW5kZXhPZigncHYnKTtcbiAgICAgIGNvbnN0IHB2ID0gcHZJZHggPj0gMCA/IHBhcnRzLnNsaWNlKHB2SWR4ICsgMSkgOiBbXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbXVsdGlwdixcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIHNjb3JlLFxuICAgICAgICBtYXRlLFxuICAgICAgICBwdixcbiAgICAgIH07XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBjdXJyZW50IGFuYWx5c2lzXG4gICAqL1xuICBzdG9wKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgdGhpcy5zZW5kQ29tbWFuZCgnc3RvcCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIG5ldyBnYW1lXG4gICAqL1xuICBuZXdHYW1lKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgdGhpcy5zZW5kQ29tbWFuZCgndWNpbmV3Z2FtZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBlbmdpbmUgaXMgaW5pdGlhbGl6ZWRcbiAgICovXG4gIGdldCBpbml0aWFsaXplZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc1JlYWR5O1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IG1vdmVTdG9ja2Zpc2hTZXJ2aWNlID0gbmV3IFN0b2NrZmlzaFNlcnZpY2UoJ01vdmVTdG9ja2Zpc2hTZXJ2aWNlJyk7XG5leHBvcnQgY29uc3QgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlID0gbmV3IFN0b2NrZmlzaFNlcnZpY2UoJ0FuYWx5c2lzU3RvY2tmaXNoU2VydmljZScpO1xuZXhwb3J0IGNvbnN0IHN0b2NrZmlzaFNlcnZpY2UgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2U7XG4iLCAiaW1wb3J0IHsgQW5hbHl6ZWRNb3ZlIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UsXG4gIG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLFxuICBTdG9ja2Zpc2hTZXJ2aWNlLFxufSBmcm9tICcuL3N0b2NrZmlzaC5zZXJ2aWNlJztcblxuZXhwb3J0IHR5cGUgRW5naW5lTGFuZSA9ICdtb3ZlJyB8ICdhbmFseXNpcyc7XG5cbmludGVyZmFjZSBFbmdpbmVDb29yZGluYXRvckRlcGVuZGVuY2llcyB7XG4gIG1vdmVTZXJ2aWNlPzogU3RvY2tmaXNoU2VydmljZTtcbiAgYW5hbHlzaXNTZXJ2aWNlPzogU3RvY2tmaXNoU2VydmljZTtcbn1cblxuZXhwb3J0IGNsYXNzIEVuZ2luZUNvb3JkaW5hdG9yIHtcbiAgcHJpdmF0ZSByZWFkb25seSBtb3ZlU2VydmljZTogU3RvY2tmaXNoU2VydmljZTtcbiAgcHJpdmF0ZSByZWFkb25seSBhbmFseXNpc1NlcnZpY2U6IFN0b2NrZmlzaFNlcnZpY2U7XG5cbiAgY29uc3RydWN0b3IoZGVwZW5kZW5jaWVzOiBFbmdpbmVDb29yZGluYXRvckRlcGVuZGVuY2llcyA9IHt9KSB7XG4gICAgdGhpcy5tb3ZlU2VydmljZSA9IGRlcGVuZGVuY2llcy5tb3ZlU2VydmljZSA/PyBtb3ZlU3RvY2tmaXNoU2VydmljZTtcbiAgICB0aGlzLmFuYWx5c2lzU2VydmljZSA9IGRlcGVuZGVuY2llcy5hbmFseXNpc1NlcnZpY2UgPz8gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZShsYW5lPzogRW5naW5lTGFuZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChsYW5lID09PSAnbW92ZScpIHtcbiAgICAgIGF3YWl0IHRoaXMubW92ZVNlcnZpY2UuaW5pdGlhbGl6ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChsYW5lID09PSAnYW5hbHlzaXMnKSB7XG4gICAgICBhd2FpdCB0aGlzLmFuYWx5c2lzU2VydmljZS5pbml0aWFsaXplKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5tb3ZlU2VydmljZS5pbml0aWFsaXplKCksXG4gICAgICB0aGlzLmFuYWx5c2lzU2VydmljZS5pbml0aWFsaXplKCksXG4gICAgXSk7XG4gIH1cblxuICBjb25maWd1cmUobGFuZTogRW5naW5lTGFuZSwgb3B0aW9uczogeyBtdWx0aVBWPzogbnVtYmVyOyBkZXB0aD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgdGhpcy5nZXRTZXJ2aWNlKGxhbmUpLmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIGFuYWx5emVQb3NpdGlvbihsYW5lOiBFbmdpbmVMYW5lLCBmZW46IHN0cmluZyk6IFByb21pc2U8QW5hbHl6ZWRNb3ZlW10+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRTZXJ2aWNlKGxhbmUpLmFuYWx5emVQb3NpdGlvbihmZW4pO1xuICB9XG5cbiAgc3RvcChsYW5lPzogRW5naW5lTGFuZSk6IHZvaWQge1xuICAgIGlmICghbGFuZSkge1xuICAgICAgdGhpcy5tb3ZlU2VydmljZS5zdG9wKCk7XG4gICAgICB0aGlzLmFuYWx5c2lzU2VydmljZS5zdG9wKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5nZXRTZXJ2aWNlKGxhbmUpLnN0b3AoKTtcbiAgfVxuXG4gIG5ld0dhbWUoKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlU2VydmljZS5uZXdHYW1lKCk7XG4gICAgdGhpcy5hbmFseXNpc1NlcnZpY2UubmV3R2FtZSgpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZXJ2aWNlLmRlc3Ryb3koKTtcbiAgICB0aGlzLmFuYWx5c2lzU2VydmljZS5kZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIGdldFNlcnZpY2UobGFuZTogRW5naW5lTGFuZSk6IFN0b2NrZmlzaFNlcnZpY2Uge1xuICAgIHJldHVybiBsYW5lID09PSAnbW92ZScgPyB0aGlzLm1vdmVTZXJ2aWNlIDogdGhpcy5hbmFseXNpc1NlcnZpY2U7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGVuZ2luZUNvb3JkaW5hdG9yID0gbmV3IEVuZ2luZUNvb3JkaW5hdG9yKCk7XG4iLCAiLyoqXG4gKiBUeXBlcyBmb3IgdGhlIGNoZXNzIGVuZ2luZSBtb2RlbCBsYXllclxuICogUHVyZSBUeXBlU2NyaXB0IC0gbm8gUmVhY3QsIG5vIE1vYlhcbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuYWx5emVkTW92ZSB7XG4gIG1vdmU6IHN0cmluZzsgICAgICAgIC8vIFVDSSBmb3JtYXQgKGUuZy4sIFwiZTJlNFwiKVxuICBldmFsdWF0aW9uOiBudW1iZXI7ICAvLyBDZW50aXBhd24gZXZhbHVhdGlvblxuICBldmFsTG9zczogbnVtYmVyOyAgICAvLyBMb3NzIGNvbXBhcmVkIHRvIGJlc3QgbW92ZVxuICBwdjogc3RyaW5nW107ICAgICAgICAvLyBQcmluY2lwYWwgdmFyaWF0aW9uXG4gIG11bHRpcHY6IG51bWJlcjsgICAgIC8vIE11bHRpUFYgcmFuayAoMSA9IGJlc3QpXG4gIGRlcHRoOiBudW1iZXI7ICAgICAgIC8vIFNlYXJjaCBkZXB0aFxufVxuXG5leHBvcnQgdHlwZSBNb3ZlQnVja2V0ID0gXG4gIHwgJ2Jlc3QnXG4gIHwgJ2dyZWF0J1xuICB8ICdleGNlbGxlbnQnXG4gIHwgJ2dvb2QnXG4gIHwgJ2luYWNjdXJhY3knXG4gIHwgJ21pc3Rha2UnXG4gIHwgJ2JsdW5kZXInO1xuXG5leHBvcnQgdHlwZSBEaXNwbGF5TW92ZUJ1Y2tldCA9IE1vdmVCdWNrZXQgfCAnZmFsbGJhY2snO1xuXG5leHBvcnQgaW50ZXJmYWNlIENsYXNzaWZpZWRNb3ZlIGV4dGVuZHMgQW5hbHl6ZWRNb3ZlIHtcbiAgYnVja2V0OiBNb3ZlQnVja2V0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1Y2tldENvbmZpZyB7XG4gIGJlc3Q6IG51bWJlcjtcbiAgZ3JlYXQ6IG51bWJlcjtcbiAgZXhjZWxsZW50OiBudW1iZXI7XG4gIGdvb2Q6IG51bWJlcjtcbiAgaW5hY2N1cmFjeTogbnVtYmVyO1xuICBtaXN0YWtlOiBudW1iZXI7XG4gIGJsdW5kZXI6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdG9ja2Zpc2hJbmZvIHtcbiAgbXVsdGlwdjogbnVtYmVyO1xuICBkZXB0aDogbnVtYmVyO1xuICBzY29yZTogbnVtYmVyO1xuICBtYXRlPzogbnVtYmVyO1xuICBwdjogc3RyaW5nW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGlja2VkTW92ZVJlc3VsdCB7XG4gIG1vdmU6IENsYXNzaWZpZWRNb3ZlO1xuICBidWNrZXQ6IE1vdmVCdWNrZXQ7XG4gIGlzQnJpbGxpYW50PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQlVDS0VUX0NPTkZJRzogQnVja2V0Q29uZmlnID0ge1xuICBiZXN0OiA0MCxcbiAgZ3JlYXQ6IDI1LFxuICBleGNlbGxlbnQ6IDIwLFxuICBnb29kOiAxMCxcbiAgaW5hY2N1cmFjeTogNCxcbiAgbWlzdGFrZTogMSxcbiAgYmx1bmRlcjogMCxcbn07XG5cbi8qKiBQcmVzZXQgaWQgZm9yIG1vdmUgcXVhbGl0eSBkaXN0cmlidXRpb24gKi9cbmV4cG9ydCB0eXBlIE1vdmVRdWFsaXR5UHJlc2V0SWQgPSAnbG93JyB8ICdtZWRpdW0nIHwgJ2hhcmQnIHwgJ3N1cGVyX2hhcmQnIHwgJ2FnZ3Jlc3NpdmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1vdmVRdWFsaXR5UHJlc2V0IHtcbiAgaWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQ7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGNvbmZpZzogQnVja2V0Q29uZmlnO1xufVxuXG4vKiogUHJlZGVmaW5lZCBtb3ZlIHF1YWxpdHkgZGlzdHJpYnV0aW9ucyAocGVyY2VudGFnZXMgc3VtIHRvIDEwMCkgKi9cbmV4cG9ydCBjb25zdCBNT1ZFX1FVQUxJVFlfUFJFU0VUUzogTW92ZVF1YWxpdHlQcmVzZXRbXSA9IFtcbiAge1xuICAgIGlkOiAnbG93JyxcbiAgICBsYWJlbDogJ0xvdycsXG4gICAgZGVzY3JpcHRpb246ICdFYXNpZXIgXHUyMDE0IG1vcmUgZ29vZC9pbmFjY3VyYWN5L21pc3Rha2UgbW92ZXMnLFxuICAgIGNvbmZpZzoge1xuICAgICAgYmVzdDogMTUsXG4gICAgICBncmVhdDogMTUsXG4gICAgICBleGNlbGxlbnQ6IDIwLFxuICAgICAgZ29vZDogMjUsXG4gICAgICBpbmFjY3VyYWN5OiAxNSxcbiAgICAgIG1pc3Rha2U6IDcsXG4gICAgICBibHVuZGVyOiAzLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ21lZGl1bScsXG4gICAgbGFiZWw6ICdNZWRpdW0nLFxuICAgIGRlc2NyaXB0aW9uOiAnQmFsYW5jZWQgbWl4IG9mIHF1YWxpdGllcycsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiA0MCxcbiAgICAgIGdyZWF0OiAyNSxcbiAgICAgIGV4Y2VsbGVudDogMjAsXG4gICAgICBnb29kOiAxMCxcbiAgICAgIGluYWNjdXJhY3k6IDQsXG4gICAgICBtaXN0YWtlOiAxLFxuICAgICAgYmx1bmRlcjogMCxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaWQ6ICdoYXJkJyxcbiAgICBsYWJlbDogJ0hhcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmF2b3JzIGJlc3QgYW5kIGdyZWF0IG1vdmVzJyxcbiAgICBjb25maWc6IHtcbiAgICAgIGJlc3Q6IDU1LFxuICAgICAgZ3JlYXQ6IDI1LFxuICAgICAgZXhjZWxsZW50OiAxNSxcbiAgICAgIGdvb2Q6IDUsXG4gICAgICBpbmFjY3VyYWN5OiAwLFxuICAgICAgbWlzdGFrZTogMCxcbiAgICAgIGJsdW5kZXI6IDAsXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAnc3VwZXJfaGFyZCcsXG4gICAgbGFiZWw6ICdTdXBlciBIYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0FsbW9zdCBvbmx5IGJlc3QgYW5kIGdyZWF0JyxcbiAgICBjb25maWc6IHtcbiAgICAgIGJlc3Q6IDcwLFxuICAgICAgZ3JlYXQ6IDI1LFxuICAgICAgZXhjZWxsZW50OiA1LFxuICAgICAgZ29vZDogMCxcbiAgICAgIGluYWNjdXJhY3k6IDAsXG4gICAgICBtaXN0YWtlOiAwLFxuICAgICAgYmx1bmRlcjogMCxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaWQ6ICdhZ2dyZXNzaXZlJyxcbiAgICBsYWJlbDogJ0FnZ3Jlc3NpdmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmlza3kgXHUyMDE0IG1vcmUgaW5hY2N1cmFjaWVzIGFuZCBtaXN0YWtlcycsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiAyMCxcbiAgICAgIGdyZWF0OiAyMCxcbiAgICAgIGV4Y2VsbGVudDogMTUsXG4gICAgICBnb29kOiAxNSxcbiAgICAgIGluYWNjdXJhY3k6IDE1LFxuICAgICAgbWlzdGFrZTogMTAsXG4gICAgICBibHVuZGVyOiA1LFxuICAgIH0sXG4gIH0sXG5dO1xuXG5leHBvcnQgY29uc3QgQlVDS0VUX0VWQUxfUkFOR0VTOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgW251bWJlciwgbnVtYmVyXT4gPSB7XG4gIGJlc3Q6IFswLCAxMF0sXG4gIGdyZWF0OiBbMTAsIDMwXSxcbiAgZXhjZWxsZW50OiBbMzAsIDcwXSxcbiAgZ29vZDogWzcwLCAxNTBdLFxuICBpbmFjY3VyYWN5OiBbMTUwLCAzMDBdLFxuICBtaXN0YWtlOiBbMzAwLCA2MDBdLFxuICBibHVuZGVyOiBbNjAwLCBJbmZpbml0eV0sXG59O1xuXG5leHBvcnQgY29uc3QgQlVDS0VUX0xBQkVMUzogUmVjb3JkPE1vdmVCdWNrZXQsIHN0cmluZz4gPSB7XG4gIGJlc3Q6ICdCZXN0JyxcbiAgZ3JlYXQ6ICdHcmVhdCcsXG4gIGV4Y2VsbGVudDogJ0V4Y2VsbGVudCcsXG4gIGdvb2Q6ICdHb29kJyxcbiAgaW5hY2N1cmFjeTogJ0luYWNjdXJhY3knLFxuICBtaXN0YWtlOiAnTWlzdGFrZScsXG4gIGJsdW5kZXI6ICdCbHVuZGVyJyxcbn07XG5cbmV4cG9ydCBjb25zdCBESVNQTEFZX0JVQ0tFVF9MQUJFTFM6IFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgc3RyaW5nPiA9IHtcbiAgLi4uQlVDS0VUX0xBQkVMUyxcbiAgZmFsbGJhY2s6ICdGYWxsYmFjayBtb3ZlJyxcbn07XG5cbmV4cG9ydCBjb25zdCBCVUNLRVRfQ09MT1JTOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgc3RyaW5nPiA9IHtcbiAgYmVzdDogJyMyNmE2NDEnLFxuICBncmVhdDogJyMyZWEwNDMnLFxuICBleGNlbGxlbnQ6ICcjNTdhYjVhJyxcbiAgZ29vZDogJyM4Yjk0OWUnLFxuICBpbmFjY3VyYWN5OiAnI2QyOTkyMicsXG4gIG1pc3Rha2U6ICcjZjg1MTQ5JyxcbiAgYmx1bmRlcjogJyNkYTM2MzMnLFxufTtcblxuZXhwb3J0IGNvbnN0IERJU1BMQVlfQlVDS0VUX0NPTE9SUzogUmVjb3JkPERpc3BsYXlNb3ZlQnVja2V0LCBzdHJpbmc+ID0ge1xuICAuLi5CVUNLRVRfQ09MT1JTLFxuICBmYWxsYmFjazogJyM2ZTc2ODEnLFxufTtcbiIsICIvKipcbiAqIE1vdmUgQ2xhc3NpZmllclxuICogTW9kZWwgbGF5ZXIgLSBQdXJlIFR5cGVTY3JpcHQsIG5vIFJlYWN0LCBubyBNb2JYXG4gKiBcbiAqIENsYXNzaWZpZXMgY2hlc3MgbW92ZXMgaW50byBxdWFsaXR5IGJ1Y2tldHMgYmFzZWQgb24gZXZhbHVhdGlvbiBsb3NzXG4gKi9cblxuaW1wb3J0IHsgXG4gIEFuYWx5emVkTW92ZSwgXG4gIENsYXNzaWZpZWRNb3ZlLCBcbiAgRGlzcGxheU1vdmVCdWNrZXQsXG4gIE1vdmVCdWNrZXQsIFxuICBCVUNLRVRfRVZBTF9SQU5HRVMgXG59IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIENsYXNzaWZ5IGEgc2luZ2xlIG1vdmUgaW50byBhIHF1YWxpdHkgYnVja2V0IGJhc2VkIG9uIGV2YWwgbG9zc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlNb3ZlKG1vdmU6IEFuYWx5emVkTW92ZSk6IENsYXNzaWZpZWRNb3ZlIHtcbiAgY29uc3QgYnVja2V0ID0gZ2V0QnVja2V0Rm9yRXZhbExvc3MobW92ZS5ldmFsTG9zcyk7XG4gIHJldHVybiB7XG4gICAgLi4ubW92ZSxcbiAgICBidWNrZXQsXG4gIH07XG59XG5cbi8qKlxuICogQ2xhc3NpZnkgYWxsIGFuYWx5emVkIG1vdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc2lmeU1vdmVzKG1vdmVzOiBBbmFseXplZE1vdmVbXSk6IENsYXNzaWZpZWRNb3ZlW10ge1xuICByZXR1cm4gbW92ZXMubWFwKGNsYXNzaWZ5TW92ZSk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBidWNrZXQgZm9yIGEgZ2l2ZW4gZXZhbCBsb3NzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCdWNrZXRGb3JFdmFsTG9zcyhldmFsTG9zczogbnVtYmVyKTogTW92ZUJ1Y2tldCB7XG4gIGNvbnN0IGFic0xvc3MgPSBNYXRoLmFicyhldmFsTG9zcyk7XG4gIFxuICBmb3IgKGNvbnN0IFtidWNrZXQsIFttaW4sIG1heF1dIG9mIE9iamVjdC5lbnRyaWVzKEJVQ0tFVF9FVkFMX1JBTkdFUykpIHtcbiAgICBpZiAoYWJzTG9zcyA+PSBtaW4gJiYgYWJzTG9zcyA8IG1heCkge1xuICAgICAgcmV0dXJuIGJ1Y2tldCBhcyBNb3ZlQnVja2V0O1xuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuICdibHVuZGVyJztcbn1cblxuLyoqXG4gKiBHcm91cCBjbGFzc2lmaWVkIG1vdmVzIGJ5IHRoZWlyIGJ1Y2tldFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdKTogTWFwPE1vdmVCdWNrZXQsIENsYXNzaWZpZWRNb3ZlW10+IHtcbiAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcDxNb3ZlQnVja2V0LCBDbGFzc2lmaWVkTW92ZVtdPigpO1xuICBcbiAgLy8gSW5pdGlhbGl6ZSBhbGwgYnVja2V0cyB3aXRoIGVtcHR5IGFycmF5c1xuICBjb25zdCBidWNrZXRzOiBNb3ZlQnVja2V0W10gPSBbJ2Jlc3QnLCAnZ3JlYXQnLCAnZXhjZWxsZW50JywgJ2dvb2QnLCAnaW5hY2N1cmFjeScsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcbiAgYnVja2V0cy5mb3JFYWNoKGJ1Y2tldCA9PiBncm91cHMuc2V0KGJ1Y2tldCwgW10pKTtcbiAgXG4gIC8vIEdyb3VwIG1vdmVzXG4gIG1vdmVzLmZvckVhY2gobW92ZSA9PiB7XG4gICAgY29uc3QgYnVja2V0TW92ZXMgPSBncm91cHMuZ2V0KG1vdmUuYnVja2V0KSB8fCBbXTtcbiAgICBidWNrZXRNb3Zlcy5wdXNoKG1vdmUpO1xuICAgIGdyb3Vwcy5zZXQobW92ZS5idWNrZXQsIGJ1Y2tldE1vdmVzKTtcbiAgfSk7XG4gIFxuICByZXR1cm4gZ3JvdXBzO1xufVxuXG4vKipcbiAqIEdldCBzdGF0aXN0aWNzIGFib3V0IHRoZSBtb3ZlIGRpc3RyaWJ1dGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TW92ZVN0YXRzKG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdKTogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICBjb25zdCBzdGF0czogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4gPSB7XG4gICAgYmVzdDogMCxcbiAgICBncmVhdDogMCxcbiAgICBleGNlbGxlbnQ6IDAsXG4gICAgZ29vZDogMCxcbiAgICBpbmFjY3VyYWN5OiAwLFxuICAgIG1pc3Rha2U6IDAsXG4gICAgYmx1bmRlcjogMCxcbiAgfTtcbiAgXG4gIG1vdmVzLmZvckVhY2gobW92ZSA9PiB7XG4gICAgc3RhdHNbbW92ZS5idWNrZXRdKys7XG4gIH0pO1xuICBcbiAgcmV0dXJuIHN0YXRzO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZXJlIGFyZSBhbnkgbW92ZXMgaW4gYSBnaXZlbiBidWNrZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc01vdmVJbkJ1Y2tldChtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSwgYnVja2V0OiBNb3ZlQnVja2V0KTogYm9vbGVhbiB7XG4gIHJldHVybiBtb3Zlcy5zb21lKG1vdmUgPT4gbW92ZS5idWNrZXQgPT09IGJ1Y2tldCk7XG59XG5cbi8qKlxuICogR2V0IGFsbCBtb3ZlcyBmcm9tIGEgc3BlY2lmaWMgYnVja2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNb3Zlc0Zyb21CdWNrZXQobW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sIGJ1Y2tldDogTW92ZUJ1Y2tldCk6IENsYXNzaWZpZWRNb3ZlW10ge1xuICByZXR1cm4gbW92ZXMuZmlsdGVyKG1vdmUgPT4gbW92ZS5idWNrZXQgPT09IGJ1Y2tldCk7XG59XG5cbmNvbnN0IEJVQ0tFVF9PUkRFUjogTW92ZUJ1Y2tldFtdID0gWydiZXN0JywgJ2dyZWF0JywgJ2V4Y2VsbGVudCcsICdnb29kJywgJ2luYWNjdXJhY3knLCAnbWlzdGFrZScsICdibHVuZGVyJ107XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc2lmeVVuYW5hbHl6ZWRNb3ZlKCk6IERpc3BsYXlNb3ZlQnVja2V0IHtcbiAgcmV0dXJuICdmYWxsYmFjayc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXBMZWdhbE1vdmVzVG9CdWNrZXRzKFxuICBsZWdhbE1vdmVzOiBzdHJpbmdbXSxcbiAgYW5hbHl6ZWRNb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgdXNlSW1wcm92ZWRGYWxsYmFjazogYm9vbGVhbixcbik6IFJlY29yZDxzdHJpbmcsIERpc3BsYXlNb3ZlQnVja2V0PiB7XG4gIGNvbnN0IG1vdmVNYXA6IFJlY29yZDxzdHJpbmcsIERpc3BsYXlNb3ZlQnVja2V0PiA9IHt9O1xuXG4gIGZvciAoY29uc3QgYW5hbHl6ZWRNb3ZlIG9mIGFuYWx5emVkTW92ZXMpIHtcbiAgICBtb3ZlTWFwW2FuYWx5emVkTW92ZS5tb3ZlXSA9IGFuYWx5emVkTW92ZS5idWNrZXQ7XG4gIH1cblxuICBmb3IgKGNvbnN0IG1vdmUgb2YgbGVnYWxNb3Zlcykge1xuICAgIGlmICghbW92ZU1hcFttb3ZlXSkge1xuICAgICAgbW92ZU1hcFttb3ZlXSA9IHVzZUltcHJvdmVkRmFsbGJhY2sgPyBjbGFzc2lmeVVuYW5hbHl6ZWRNb3ZlKCkgOiAnZ29vZCc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1vdmVNYXA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQ2xvc2VzdEF2YWlsYWJsZUJ1Y2tldChcbiAgdGFyZ2V0QnVja2V0OiBNb3ZlQnVja2V0LFxuICBhdmFpbGFibGVCdWNrZXRzOiBNb3ZlQnVja2V0W10sXG4pOiBNb3ZlQnVja2V0IHwgbnVsbCB7XG4gIGlmIChhdmFpbGFibGVCdWNrZXRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgdGFyZ2V0SW5kZXggPSBCVUNLRVRfT1JERVIuaW5kZXhPZih0YXJnZXRCdWNrZXQpO1xuICBpZiAodGFyZ2V0SW5kZXggPT09IC0xKSB7XG4gICAgcmV0dXJuIGF2YWlsYWJsZUJ1Y2tldHNbMF07XG4gIH1cblxuICBmb3IgKGxldCBvZmZzZXQgPSAxOyBvZmZzZXQgPCBCVUNLRVRfT1JERVIubGVuZ3RoOyBvZmZzZXQgKz0gMSkge1xuICAgIGNvbnN0IGJldHRlckluZGV4ID0gdGFyZ2V0SW5kZXggLSBvZmZzZXQ7XG4gICAgaWYgKGJldHRlckluZGV4ID49IDApIHtcbiAgICAgIGNvbnN0IGJldHRlckJ1Y2tldCA9IEJVQ0tFVF9PUkRFUltiZXR0ZXJJbmRleF07XG4gICAgICBpZiAoYXZhaWxhYmxlQnVja2V0cy5pbmNsdWRlcyhiZXR0ZXJCdWNrZXQpKSB7XG4gICAgICAgIHJldHVybiBiZXR0ZXJCdWNrZXQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgd29yc2VJbmRleCA9IHRhcmdldEluZGV4ICsgb2Zmc2V0O1xuICAgIGlmICh3b3JzZUluZGV4IDwgQlVDS0VUX09SREVSLmxlbmd0aCkge1xuICAgICAgY29uc3Qgd29yc2VCdWNrZXQgPSBCVUNLRVRfT1JERVJbd29yc2VJbmRleF07XG4gICAgICBpZiAoYXZhaWxhYmxlQnVja2V0cy5pbmNsdWRlcyh3b3JzZUJ1Y2tldCkpIHtcbiAgICAgICAgcmV0dXJuIHdvcnNlQnVja2V0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdmFpbGFibGVCdWNrZXRzWzBdO1xufVxuIiwgIi8qKlxuICogTW92ZSBQaWNrZXJcbiAqIE1vZGVsIGxheWVyIC0gUHVyZSBUeXBlU2NyaXB0LCBubyBSZWFjdCwgbm8gTW9iWFxuICogXG4gKiBQaWNrcyBhIG1vdmUgYmFzZWQgb24gd2VpZ2h0ZWQgcHJvYmFiaWxpdHkgZnJvbSBxdWFsaXR5IGJ1Y2tldHNcbiAqL1xuXG5pbXBvcnQgeyBcbiAgQ2xhc3NpZmllZE1vdmUsIFxuICBNb3ZlQnVja2V0LCBcbiAgQnVja2V0Q29uZmlnLCBcbiAgUGlja2VkTW92ZVJlc3VsdCxcbiAgREVGQVVMVF9CVUNLRVRfQ09ORklHIFxufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGZpbmRDbG9zZXN0QXZhaWxhYmxlQnVja2V0LCBncm91cE1vdmVzQnlCdWNrZXQgfSBmcm9tICcuL21vdmVDbGFzc2lmaWVyJztcblxuZXhwb3J0IHR5cGUgUmFuZG9tTnVtYmVyR2VuZXJhdG9yID0gKCkgPT4gbnVtYmVyO1xuXG5pbnRlcmZhY2UgQnVja2V0U2VsZWN0aW9uIHtcbiAgYnVja2V0OiBNb3ZlQnVja2V0O1xuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXTtcbn1cblxuZnVuY3Rpb24gZ2V0QnVja2V0T3JkZXIoKTogTW92ZUJ1Y2tldFtdIHtcbiAgcmV0dXJuIFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnLCAnZ29vZCcsICdpbmFjY3VyYWN5JywgJ21pc3Rha2UnLCAnYmx1bmRlciddO1xufVxuXG5mdW5jdGlvbiBnZXRBdmFpbGFibGVCdWNrZXRzKFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgY29uZmlnOiBCdWNrZXRDb25maWcsXG4pOiBCdWNrZXRTZWxlY3Rpb25bXSB7XG4gIGNvbnN0IGdyb3VwZWQgPSBncm91cE1vdmVzQnlCdWNrZXQobW92ZXMpO1xuICBjb25zdCBhdmFpbGFibGVCdWNrZXRzOiBCdWNrZXRTZWxlY3Rpb25bXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgYnVja2V0IG9mIGdldEJ1Y2tldE9yZGVyKCkpIHtcbiAgICBjb25zdCBidWNrZXRNb3ZlcyA9IGdyb3VwZWQuZ2V0KGJ1Y2tldCkgfHwgW107XG4gICAgaWYgKGJ1Y2tldE1vdmVzLmxlbmd0aCA+IDAgJiYgY29uZmlnW2J1Y2tldF0gPiAwKSB7XG4gICAgICBhdmFpbGFibGVCdWNrZXRzLnB1c2goeyBidWNrZXQsIG1vdmVzOiBidWNrZXRNb3ZlcyB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXZhaWxhYmxlQnVja2V0cztcbn1cblxuZnVuY3Rpb24gcGlja1dlaWdodGVkQnVja2V0KFxuICB3ZWlnaHRlZEJ1Y2tldHM6IEFycmF5PHsgYnVja2V0OiBNb3ZlQnVja2V0OyB3ZWlnaHQ6IG51bWJlciB9PixcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IsXG4pOiBNb3ZlQnVja2V0IHwgbnVsbCB7XG4gIGNvbnN0IHRvdGFsV2VpZ2h0ID0gd2VpZ2h0ZWRCdWNrZXRzLnJlZHVjZSgoc3VtLCBlbnRyeSkgPT4gc3VtICsgZW50cnkud2VpZ2h0LCAwKTtcblxuICBpZiAodG90YWxXZWlnaHQgPD0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbGV0IHNlbGVjdGlvbiA9IHJhbmRvbSgpICogdG90YWxXZWlnaHQ7XG5cbiAgZm9yIChjb25zdCBlbnRyeSBvZiB3ZWlnaHRlZEJ1Y2tldHMpIHtcbiAgICBzZWxlY3Rpb24gLT0gZW50cnkud2VpZ2h0O1xuICAgIGlmIChzZWxlY3Rpb24gPD0gMCkge1xuICAgICAgcmV0dXJuIGVudHJ5LmJ1Y2tldDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gd2VpZ2h0ZWRCdWNrZXRzW3dlaWdodGVkQnVja2V0cy5sZW5ndGggLSAxXT8uYnVja2V0ID8/IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWNrQnVja2V0TGVnYWN5KFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgY29uZmlnOiBCdWNrZXRDb25maWcgPSBERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gIHJhbmRvbTogUmFuZG9tTnVtYmVyR2VuZXJhdG9yID0gTWF0aC5yYW5kb20sXG4pOiBCdWNrZXRTZWxlY3Rpb24gfCBudWxsIHtcbiAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgYXZhaWxhYmxlQnVja2V0cyA9IGdldEF2YWlsYWJsZUJ1Y2tldHMobW92ZXMsIGNvbmZpZyk7XG4gIGlmIChhdmFpbGFibGVCdWNrZXRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBidWNrZXQ6IG1vdmVzWzBdLmJ1Y2tldCxcbiAgICAgIG1vdmVzOiBbbW92ZXNbMF1dLFxuICAgIH07XG4gIH1cblxuICBjb25zdCB3ZWlnaHRlZEJ1Y2tldHMgPSBhdmFpbGFibGVCdWNrZXRzLm1hcCgoZW50cnkpID0+ICh7XG4gICAgYnVja2V0OiBlbnRyeS5idWNrZXQsXG4gICAgd2VpZ2h0OiBjb25maWdbZW50cnkuYnVja2V0XSxcbiAgfSkpO1xuICBjb25zdCBzZWxlY3RlZEJ1Y2tldCA9IHBpY2tXZWlnaHRlZEJ1Y2tldCh3ZWlnaHRlZEJ1Y2tldHMsIHJhbmRvbSk7XG5cbiAgaWYgKCFzZWxlY3RlZEJ1Y2tldCkge1xuICAgIHJldHVybiBhdmFpbGFibGVCdWNrZXRzWzBdO1xuICB9XG5cbiAgcmV0dXJuIGF2YWlsYWJsZUJ1Y2tldHMuZmluZCgoZW50cnkpID0+IGVudHJ5LmJ1Y2tldCA9PT0gc2VsZWN0ZWRCdWNrZXQpID8/IGF2YWlsYWJsZUJ1Y2tldHNbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWNrQnVja2V0V2l0aENsb3Nlc3RGYWxsYmFjayhcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnID0gREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICByYW5kb206IFJhbmRvbU51bWJlckdlbmVyYXRvciA9IE1hdGgucmFuZG9tLFxuKTogQnVja2V0U2VsZWN0aW9uIHwgbnVsbCB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IGdyb3VwZWQgPSBncm91cE1vdmVzQnlCdWNrZXQobW92ZXMpO1xuICBjb25zdCB3ZWlnaHRlZEJ1Y2tldHMgPSBnZXRCdWNrZXRPcmRlcigpXG4gICAgLmZpbHRlcigoYnVja2V0KSA9PiBjb25maWdbYnVja2V0XSA+IDApXG4gICAgLm1hcCgoYnVja2V0KSA9PiAoeyBidWNrZXQsIHdlaWdodDogY29uZmlnW2J1Y2tldF0gfSkpO1xuICBjb25zdCBzZWxlY3RlZEJ1Y2tldCA9IHBpY2tXZWlnaHRlZEJ1Y2tldCh3ZWlnaHRlZEJ1Y2tldHMsIHJhbmRvbSk7XG5cbiAgaWYgKCFzZWxlY3RlZEJ1Y2tldCkge1xuICAgIHJldHVybiBwaWNrQnVja2V0TGVnYWN5KG1vdmVzLCBjb25maWcsIHJhbmRvbSk7XG4gIH1cblxuICBjb25zdCBzZWxlY3RlZE1vdmVzID0gZ3JvdXBlZC5nZXQoc2VsZWN0ZWRCdWNrZXQpIHx8IFtdO1xuICBpZiAoc2VsZWN0ZWRNb3Zlcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJ1Y2tldDogc2VsZWN0ZWRCdWNrZXQsXG4gICAgICBtb3Zlczogc2VsZWN0ZWRNb3ZlcyxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgYXZhaWxhYmxlQnVja2V0cyA9IGdldEJ1Y2tldE9yZGVyKCkuZmlsdGVyKChidWNrZXQpID0+IChncm91cGVkLmdldChidWNrZXQpIHx8IFtdKS5sZW5ndGggPiAwKTtcbiAgY29uc3QgZmFsbGJhY2tCdWNrZXQgPSBmaW5kQ2xvc2VzdEF2YWlsYWJsZUJ1Y2tldChzZWxlY3RlZEJ1Y2tldCwgYXZhaWxhYmxlQnVja2V0cyk7XG4gIGlmICghZmFsbGJhY2tCdWNrZXQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYnVja2V0OiBmYWxsYmFja0J1Y2tldCxcbiAgICBtb3ZlczogZ3JvdXBlZC5nZXQoZmFsbGJhY2tCdWNrZXQpIHx8IFtdLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja1JhbmRvbU1vdmVGcm9tQnVja2V0KFxuICBidWNrZXRTZWxlY3Rpb246IEJ1Y2tldFNlbGVjdGlvbixcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IgPSBNYXRoLnJhbmRvbSxcbik6IENsYXNzaWZpZWRNb3ZlIHtcbiAgY29uc3QgcmFuZG9tTW92ZUluZGV4ID0gTWF0aC5mbG9vcihyYW5kb20oKSAqIGJ1Y2tldFNlbGVjdGlvbi5tb3Zlcy5sZW5ndGgpO1xuICByZXR1cm4gYnVja2V0U2VsZWN0aW9uLm1vdmVzW3JhbmRvbU1vdmVJbmRleF07XG59XG5cbi8qKlxuICogUGljayBhIG1vdmUgYmFzZWQgb24gYnVja2V0IGNvbmZpZ3VyYXRpb24gKHdlaWdodGVkIHJhbmRvbSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpY2tNb3ZlKFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSwgXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnID0gREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICByYW5kb206IFJhbmRvbU51bWJlckdlbmVyYXRvciA9IE1hdGgucmFuZG9tLFxuKTogUGlja2VkTW92ZVJlc3VsdCB8IG51bGwge1xuICBjb25zdCBzZWxlY3RlZEJ1Y2tldCA9IHBpY2tCdWNrZXRMZWdhY3kobW92ZXMsIGNvbmZpZywgcmFuZG9tKTtcbiAgaWYgKCFzZWxlY3RlZEJ1Y2tldCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IHNlbGVjdGVkTW92ZSA9IHBpY2tSYW5kb21Nb3ZlRnJvbUJ1Y2tldChzZWxlY3RlZEJ1Y2tldCwgcmFuZG9tKTtcblxuICByZXR1cm4ge1xuICAgIG1vdmU6IHNlbGVjdGVkTW92ZSxcbiAgICBidWNrZXQ6IHNlbGVjdGVkQnVja2V0LmJ1Y2tldCxcbiAgfTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYnVja2V0IGNvbmZpZyBzbyBwZXJjZW50YWdlcyBzdW0gdG8gMTAwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVCdWNrZXRDb25maWcoY29uZmlnOiBCdWNrZXRDb25maWcpOiBCdWNrZXRDb25maWcge1xuICBjb25zdCB0b3RhbCA9IE9iamVjdC52YWx1ZXMoY29uZmlnKS5yZWR1Y2UoKHN1bSwgdmFsKSA9PiBzdW0gKyB2YWwsIDApO1xuICBcbiAgaWYgKHRvdGFsID09PSAwIHx8IHRvdGFsID09PSAxMDApIHtcbiAgICByZXR1cm4gY29uZmlnO1xuICB9XG4gIFxuICBjb25zdCBmYWN0b3IgPSAxMDAgLyB0b3RhbDtcbiAgXG4gIHJldHVybiB7XG4gICAgYmVzdDogTWF0aC5yb3VuZChjb25maWcuYmVzdCAqIGZhY3RvciksXG4gICAgZ3JlYXQ6IE1hdGgucm91bmQoY29uZmlnLmdyZWF0ICogZmFjdG9yKSxcbiAgICBleGNlbGxlbnQ6IE1hdGgucm91bmQoY29uZmlnLmV4Y2VsbGVudCAqIGZhY3RvciksXG4gICAgZ29vZDogTWF0aC5yb3VuZChjb25maWcuZ29vZCAqIGZhY3RvciksXG4gICAgaW5hY2N1cmFjeTogTWF0aC5yb3VuZChjb25maWcuaW5hY2N1cmFjeSAqIGZhY3RvciksXG4gICAgbWlzdGFrZTogTWF0aC5yb3VuZChjb25maWcubWlzdGFrZSAqIGZhY3RvciksXG4gICAgYmx1bmRlcjogTWF0aC5yb3VuZChjb25maWcuYmx1bmRlciAqIGZhY3RvciksXG4gIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGUgYnVja2V0IGNvbmZpZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVCdWNrZXRDb25maWcoY29uZmlnOiBCdWNrZXRDb25maWcpOiB7IHZhbGlkOiBib29sZWFuOyB0b3RhbDogbnVtYmVyIH0ge1xuICBjb25zdCB0b3RhbCA9IE9iamVjdC52YWx1ZXMoY29uZmlnKS5yZWR1Y2UoKHN1bSwgdmFsKSA9PiBzdW0gKyB2YWwsIDApO1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiB0b3RhbCA9PT0gMTAwLFxuICAgIHRvdGFsLFxuICB9O1xufVxuXG4vKipcbiAqIEdldCBwcm9iYWJpbGl0eSBvZiBwaWNraW5nIGZyb20gZWFjaCBidWNrZXQgZ2l2ZW4gY3VycmVudCBjb25maWcgYW5kIGF2YWlsYWJsZSBtb3Zlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWZmZWN0aXZlUHJvYmFiaWxpdGllcyhcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnXG4pOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gIGNvbnN0IGdyb3VwZWQgPSBncm91cE1vdmVzQnlCdWNrZXQobW92ZXMpO1xuICBcbiAgY29uc3QgcHJvYmFiaWxpdGllczogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4gPSB7XG4gICAgYmVzdDogMCxcbiAgICBncmVhdDogMCxcbiAgICBleGNlbGxlbnQ6IDAsXG4gICAgZ29vZDogMCxcbiAgICBpbmFjY3VyYWN5OiAwLFxuICAgIG1pc3Rha2U6IDAsXG4gICAgYmx1bmRlcjogMCxcbiAgfTtcbiAgXG4gIC8vIENhbGN1bGF0ZSBlZmZlY3RpdmUgd2VpZ2h0cyAob25seSBidWNrZXRzIHdpdGggbW92ZXMpXG4gIGxldCB0b3RhbEVmZmVjdGl2ZVdlaWdodCA9IDA7XG4gIGNvbnN0IGJ1Y2tldHM6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnLCAnZ29vZCcsICdpbmFjY3VyYWN5JywgJ21pc3Rha2UnLCAnYmx1bmRlciddO1xuICBcbiAgZm9yIChjb25zdCBidWNrZXQgb2YgYnVja2V0cykge1xuICAgIGNvbnN0IGJ1Y2tldE1vdmVzID0gZ3JvdXBlZC5nZXQoYnVja2V0KSB8fCBbXTtcbiAgICBpZiAoYnVja2V0TW92ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdG90YWxFZmZlY3RpdmVXZWlnaHQgKz0gY29uZmlnW2J1Y2tldF07XG4gICAgfVxuICB9XG4gIFxuICBpZiAodG90YWxFZmZlY3RpdmVXZWlnaHQgPT09IDApIHtcbiAgICByZXR1cm4gcHJvYmFiaWxpdGllcztcbiAgfVxuICBcbiAgLy8gQ2FsY3VsYXRlIG5vcm1hbGl6ZWQgcHJvYmFiaWxpdGllc1xuICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBidWNrZXRzKSB7XG4gICAgY29uc3QgYnVja2V0TW92ZXMgPSBncm91cGVkLmdldChidWNrZXQpIHx8IFtdO1xuICAgIGlmIChidWNrZXRNb3Zlcy5sZW5ndGggPiAwKSB7XG4gICAgICBwcm9iYWJpbGl0aWVzW2J1Y2tldF0gPSAoY29uZmlnW2J1Y2tldF0gLyB0b3RhbEVmZmVjdGl2ZVdlaWdodCkgKiAxMDA7XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gcHJvYmFiaWxpdGllcztcbn1cbiIsICJpbXBvcnQgeyBNb3ZlUXVhbGl0eVByZXNldElkIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmVhdHVyZU9wdGlvbnMge1xuICBzZWN1cml0eURldlRvb2xzT25seTogYm9vbGVhbjtcbiAgcGVyc2lzdEVuZ2luZUNvbmZpZzogYm9vbGVhbjtcbiAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogYm9vbGVhbjtcbiAgdXNlTW92ZUFuYWx5c2lzQ2FjaGU6IGJvb2xlYW47XG4gIHVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uOiBib29sZWFuO1xuICB1c2VQb3NpdGlvbkNvbXBsZXhpdHk6IGJvb2xlYW47XG4gIHVzZVBlcnNvbmFCZWhhdmlvckJpYXM6IGJvb2xlYW47XG4gIHVzZUh1bWFuRGVsYXlTaW11bGF0aW9uOiBib29sZWFuO1xuICB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0OiBib29sZWFuO1xufVxuXG5leHBvcnQgdHlwZSBGZWF0dXJlT3B0aW9uS2V5ID0ga2V5b2YgRmVhdHVyZU9wdGlvbnM7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmVhdHVyZU9wdGlvbkRlc2NyaXB0b3Ige1xuICBrZXk6IEZlYXR1cmVPcHRpb25LZXk7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFBlcnNvbmFJZCA9IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCAnY3VzdG9tJztcbmV4cG9ydCB0eXBlIEJyaWxsaWFudE1vdmVzUGVyR2FtZSA9IDAgfCAxIHwgMiB8IDMgfCA0O1xuZXhwb3J0IHR5cGUgQnJpbGxpYW50QWxsb3dlZFBoYXNlID0gJ29wZW5pbmcnIHwgJ21pZGRsZWdhbWUnIHwgJ2VuZGdhbWUnIHwgJ2FueSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyB7XG4gIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogQnJpbGxpYW50TW92ZXNQZXJHYW1lO1xuICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IEJyaWxsaWFudEFsbG93ZWRQaGFzZTtcbiAgYnJpbGxpYW50VXNlZENvdW50OiBudW1iZXI7XG4gIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBudW1iZXJbXTtcbiAgZ2FtZVNlc3Npb25JZDogc3RyaW5nIHwgbnVsbDtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfRkVBVFVSRV9PUFRJT05TOiBGZWF0dXJlT3B0aW9ucyA9IHtcbiAgc2VjdXJpdHlEZXZUb29sc09ubHk6IHRydWUsXG4gIHBlcnNpc3RFbmdpbmVDb25maWc6IHRydWUsXG4gIHVzZURldGVybWluaXN0aWNSbmc6IGZhbHNlLFxuICB1c2VNb3ZlQW5hbHlzaXNDYWNoZTogdHJ1ZSxcbiAgdXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb246IHRydWUsXG4gIHVzZVBvc2l0aW9uQ29tcGxleGl0eTogZmFsc2UsXG4gIHVzZVBlcnNvbmFCZWhhdmlvckJpYXM6IGZhbHNlLFxuICB1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbjogZmFsc2UsXG4gIHVzZUJyaWxsaWFudE1vdmVCdWRnZXQ6IGZhbHNlLFxufTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRzogQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyA9IHtcbiAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAwLFxuICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6ICdhbnknLFxuICBicmlsbGlhbnRVc2VkQ291bnQ6IDAsXG4gIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBbXSxcbiAgZ2FtZVNlc3Npb25JZDogbnVsbCxcbn07XG5cbmV4cG9ydCBjb25zdCBGRUFUVVJFX09QVElPTl9ERVNDUklQVE9SUzogRmVhdHVyZU9wdGlvbkRlc2NyaXB0b3JbXSA9IFtcbiAge1xuICAgIGtleTogJ3NlY3VyaXR5RGV2VG9vbHNPbmx5JyxcbiAgICBsYWJlbDogJ0RldlRvb2xzIE9ubHkgSW4gRGV2ZWxvcG1lbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnT3BlbiBDaHJvbWl1bSBEZXZUb29scyBvbmx5IGluIGRldmVsb3BtZW50IG1vZGUuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3BlcnNpc3RFbmdpbmVDb25maWcnLFxuICAgIGxhYmVsOiAnUGVyc2lzdCBFbmdpbmUgQ29uZmlndXJhdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdTYXZlIGRlcHRoLCBNdWx0aVBWLCBwcmVzZXRzLCBidWNrZXQgd2VpZ2h0cywgYW5kIGFkdmFuY2VkIGZlYXR1cmUgb3B0aW9ucy4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlRGV0ZXJtaW5pc3RpY1JuZycsXG4gICAgbGFiZWw6ICdEZXRlcm1pbmlzdGljIFJORycsXG4gICAgZGVzY3JpcHRpb246ICdVc2UgYSBzZWVkZWQgcmFuZG9tIHNvdXJjZSBzbyBtb3ZlIHNlbGVjdGlvbiBpcyByZXByb2R1Y2libGUuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZU1vdmVBbmFseXNpc0NhY2hlJyxcbiAgICBsYWJlbDogJ0FuYWx5c2lzIENhY2hlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JldXNlIFN0b2NrZmlzaCBhbmFseXNpcyBmb3IgdGhlIHNhbWUgRkVOLCBkZXB0aCwgYW5kIE11bHRpUFYgc2V0dGluZ3MuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uJyxcbiAgICBsYWJlbDogJ0ltcHJvdmVkIE1vdmUgQ2xhc3NpZmljYXRpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnS2VlcCB1bmtub3duIG1vdmVzIHNlcGFyYXRlIGFuZCB1c2Ugc21hcnRlciBidWNrZXQgZmFsbGJhY2sgc2VsZWN0aW9uLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VQb3NpdGlvbkNvbXBsZXhpdHknLFxuICAgIGxhYmVsOiAnUG9zaXRpb24gQ29tcGxleGl0eScsXG4gICAgZGVzY3JpcHRpb246ICdBZGp1c3QgbW92ZSBxdWFsaXR5IHdlaWdodHMgYmFzZWQgb24gaG93IHNoYXJwIHRoZSBjdXJyZW50IHBvc2l0aW9uIGlzLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VQZXJzb25hQmVoYXZpb3JCaWFzJyxcbiAgICBsYWJlbDogJ1BlcnNvbmEgQmVoYXZpb3IgQmlhcycsXG4gICAgZGVzY3JpcHRpb246ICdMYXllciBzaW1wbGUgYWdncmVzc2l2ZSBvciBzYWZlIG1vdmUgcHJlZmVyZW5jZXMgb24gdG9wIG9mIGJ1Y2tldCBzZWxlY3Rpb24uJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZUh1bWFuRGVsYXlTaW11bGF0aW9uJyxcbiAgICBsYWJlbDogJ0h1bWFuIERlbGF5IFNpbXVsYXRpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsYXkgYXV0by1wbGF5IG1vdmVzIGJhc2VkIG9uIGNvbXBsZXhpdHksIHBlcnNvbmEsIGFuZCBjaG9zZW4gbW92ZSBxdWFsaXR5LicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0JyxcbiAgICBsYWJlbDogJ0JyaWxsaWFudCBNb3ZlIEJ1ZGdldCcsXG4gICAgZGVzY3JpcHRpb246ICdSZXNlcnZlIGEgZml4ZWQgbnVtYmVyIG9mIHRhY3RpY2FsIGJyaWxsaWFudCBtb3ZlcyBmb3IgZWFjaCBnYW1lLicsXG4gIH0sXG5dO1xuXG5leHBvcnQgY29uc3QgRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19mZWF0dXJlX29wdGlvbnMnO1xuZXhwb3J0IGNvbnN0IEVOR0lORV9DT05GSUdfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX2VuZ2luZV9jb25maWcnO1xuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VGZWF0dXJlT3B0aW9ucyhcbiAgcGFydGlhbD86IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+IHwgbnVsbCxcbik6IEZlYXR1cmVPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyxcbiAgICAuLi4ocGFydGlhbCA/PyB7fSksXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcoXG4gIHBhcnRpYWw/OiBQYXJ0aWFsPEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWc+IHwgbnVsbCxcbik6IEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcge1xuICByZXR1cm4ge1xuICAgIC4uLkRFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRyxcbiAgICAuLi4ocGFydGlhbCA/PyB7fSksXG4gICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IHBhcnRpYWw/LmJyaWxsaWFudE1vdmVOdW1iZXJzID8/IERFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRy5icmlsbGlhbnRNb3ZlTnVtYmVycyxcbiAgICBnYW1lU2Vzc2lvbklkOiBwYXJ0aWFsPy5nYW1lU2Vzc2lvbklkID8/IERFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRy5nYW1lU2Vzc2lvbklkLFxuICB9O1xufVxuIiwgImltcG9ydCB7IGFjdGlvbiwgbWFrZUF1dG9PYnNlcnZhYmxlLCByZWFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgQnJpbGxpYW50QWxsb3dlZFBoYXNlLFxuICBCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnLFxuICBCcmlsbGlhbnRNb3Zlc1BlckdhbWUsXG4gIERFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRyxcbiAgREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gIEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSxcbiAgRmVhdHVyZU9wdGlvbktleSxcbiAgRmVhdHVyZU9wdGlvbnMsXG4gIG1lcmdlQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyxcbiAgbWVyZ2VGZWF0dXJlT3B0aW9ucyxcbn0gZnJvbSAnLi4vZW5naW5lL2ZlYXR1cmVPcHRpb25zJztcblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICBwZXJzb25hQ2hlc3NCcmlkZ2U/OiB7XG4gICAgICBzeW5jRmVhdHVyZU9wdGlvbnM6IChvcHRpb25zOiBGZWF0dXJlT3B0aW9ucykgPT4gdm9pZDtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB7XG4gIG9wdGlvbnM6IEZlYXR1cmVPcHRpb25zID0geyAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyB9O1xuICBicmlsbGlhbnRDb25maWc6IEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcgPSB7IC4uLkRFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRyB9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXRPcHRpb246IGFjdGlvbixcbiAgICAgIHNldE9wdGlvbnM6IGFjdGlvbixcbiAgICAgIGFwcGx5UHJvZmlsZVNldHRpbmdzOiBhY3Rpb24sXG4gICAgICBzZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWU6IGFjdGlvbixcbiAgICAgIHNldEJyaWxsaWFudEFsbG93ZWRQaGFzZTogYWN0aW9uLFxuICAgICAgcmVjb25jaWxlQnJpbGxpYW50VHJhY2tpbmc6IGFjdGlvbixcbiAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IGFjdGlvbixcbiAgICAgIHJlc2V0VG9EZWZhdWx0czogYWN0aW9uLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZXN0b3JlRnJvbVN0b3JhZ2UoKTtcblxuICAgIHJlYWN0aW9uKFxuICAgICAgKCkgPT4gKHtcbiAgICAgICAgb3B0aW9uczogeyAuLi50aGlzLm9wdGlvbnMgfSxcbiAgICAgICAgYnJpbGxpYW50Q29uZmlnOiB7XG4gICAgICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICAgICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IFsuLi50aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3ZlTnVtYmVyc10sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIChzbmFwc2hvdCkgPT4ge1xuICAgICAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICAgICAgdGhpcy5zeW5jVG9NYWluUHJvY2VzcyhzbmFwc2hvdC5vcHRpb25zKTtcbiAgICAgIH0sXG4gICAgICB7IGZpcmVJbW1lZGlhdGVseTogdHJ1ZSB9LFxuICAgICk7XG4gIH1cblxuICBzZXRPcHRpb248S2V5IGV4dGVuZHMgRmVhdHVyZU9wdGlvbktleT4oa2V5OiBLZXksIHZhbHVlOiBGZWF0dXJlT3B0aW9uc1tLZXldKTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgW2tleV06IHZhbHVlLFxuICAgIH07XG5cbiAgICBpZiAoa2V5ID09PSAncGVyc2lzdEVuZ2luZUNvbmZpZycgJiYgdmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpO1xuICAgIH1cbiAgfVxuXG4gIHNldE9wdGlvbnMob3B0aW9uczogUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4pOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZUZlYXR1cmVPcHRpb25zKHtcbiAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSk7XG4gIH1cblxuICBhcHBseVByb2ZpbGVTZXR0aW5ncyhcbiAgICBvcHRpb25zOiBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPixcbiAgICBicmlsbGlhbnRTZXR0aW5nczogUGFydGlhbDxQaWNrPEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcsICdicmlsbGlhbnRNb3Zlc1BlckdhbWUnIHwgJ2JyaWxsaWFudEFsbG93ZWRQaGFzZSc+PixcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyh7XG4gICAgICAuLi50aGlzLm9wdGlvbnMsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IGJyaWxsaWFudFNldHRpbmdzLmJyaWxsaWFudE1vdmVzUGVyR2FtZSA/PyB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWUsXG4gICAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IGJyaWxsaWFudFNldHRpbmdzLmJyaWxsaWFudEFsbG93ZWRQaGFzZSA/PyB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRBbGxvd2VkUGhhc2UsXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRVc2VkQ291bnQgPiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWUpIHtcbiAgICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgICAgYnJpbGxpYW50VXNlZENvdW50OiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWUsXG4gICAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3ZlTnVtYmVycy5zbGljZSgwLCB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWUpLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBzZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWUodmFsdWU6IEJyaWxsaWFudE1vdmVzUGVyR2FtZSk6IHZvaWQge1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IHZhbHVlLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50ID4gdmFsdWUpIHtcbiAgICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgICAgYnJpbGxpYW50VXNlZENvdW50OiB2YWx1ZSxcbiAgICAgICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVOdW1iZXJzLnNsaWNlKDAsIHZhbHVlKSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgc2V0QnJpbGxpYW50QWxsb3dlZFBoYXNlKHZhbHVlOiBCcmlsbGlhbnRBbGxvd2VkUGhhc2UpOiB2b2lkIHtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiB2YWx1ZSxcbiAgICB9O1xuICB9XG5cbiAgcmVjb25jaWxlQnJpbGxpYW50VHJhY2tpbmcoXG4gICAgZ2FtZVNlc3Npb25JZDogc3RyaW5nLFxuICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBudW1iZXJbXSxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgIGdhbWVTZXNzaW9uSWQsXG4gICAgICBicmlsbGlhbnRVc2VkQ291bnQ6IGJyaWxsaWFudE1vdmVOdW1iZXJzLmxlbmd0aCxcbiAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBbLi4uYnJpbGxpYW50TW92ZU51bWJlcnNdLFxuICAgIH07XG4gIH1cblxuICByZXNldEJyaWxsaWFudFRyYWNraW5nKGdhbWVTZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgIGdhbWVTZXNzaW9uSWQsXG4gICAgICBicmlsbGlhbnRVc2VkQ291bnQ6IDAsXG4gICAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogW10sXG4gICAgfTtcbiAgfVxuXG4gIHJlc2V0VG9EZWZhdWx0cygpOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB7IC4uLkRFRkFVTFRfRkVBVFVSRV9PUFRJT05TIH07XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7IC4uLkRFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRyB9O1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZKTtcbiAgICAgIGlmICghc2F2ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHNhdmVkKSBhc1xuICAgICAgICB8IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+XG4gICAgICAgIHwgeyBvcHRpb25zPzogUGFydGlhbDxGZWF0dXJlT3B0aW9ucz47IGJyaWxsaWFudENvbmZpZz86IFBhcnRpYWw8QnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZz4gfTtcblxuICAgICAgaWYgKCdvcHRpb25zJyBpbiBwYXJzZWQgfHwgJ2JyaWxsaWFudENvbmZpZycgaW4gcGFyc2VkKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlRmVhdHVyZU9wdGlvbnMocGFyc2VkLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IG1lcmdlQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyhwYXJzZWQuYnJpbGxpYW50Q29uZmlnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZUZlYXR1cmVPcHRpb25zKHBhcnNlZCBhcyBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHJlc3RvcmUgZmVhdHVyZSBvcHRpb25zOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLnBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIGJyaWxsaWFudENvbmZpZzogdGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0ZlYXR1cmVPcHRpb25zVmlld01vZGVsXSBGYWlsZWQgdG8gcGVyc2lzdCBmZWF0dXJlIG9wdGlvbnM6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJQZXJzaXN0ZWRTdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShGRUFUVVJFX09QVElPTlNfU1RPUkFHRV9LRVkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWxdIEZhaWxlZCB0byBjbGVhciBmZWF0dXJlIG9wdGlvbnMgc3RvcmFnZTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzeW5jVG9NYWluUHJvY2VzcyhvcHRpb25zOiBGZWF0dXJlT3B0aW9ucyk6IHZvaWQge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcmlhbGl6YWJsZU9wdGlvbnMgPSBtZXJnZUZlYXR1cmVPcHRpb25zKHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSk7XG5cbiAgICB3aW5kb3cucGVyc29uYUNoZXNzQnJpZGdlPy5zeW5jRmVhdHVyZU9wdGlvbnMoc2VyaWFsaXphYmxlT3B0aW9ucyk7XG4gIH1cblxuICBnZXQgc2VjdXJpdHlEZXZUb29sc09ubHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5zZWN1cml0eURldlRvb2xzT25seTtcbiAgfVxuXG4gIGdldCBwZXJzaXN0RW5naW5lQ29uZmlnKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMucGVyc2lzdEVuZ2luZUNvbmZpZztcbiAgfVxuXG4gIGdldCB1c2VEZXRlcm1pbmlzdGljUm5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlRGV0ZXJtaW5pc3RpY1JuZztcbiAgfVxuXG4gIGdldCB1c2VNb3ZlQW5hbHlzaXNDYWNoZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZU1vdmVBbmFseXNpc0NhY2hlO1xuICB9XG5cbiAgZ2V0IHVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb247XG4gIH1cblxuICBnZXQgdXNlUG9zaXRpb25Db21wbGV4aXR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlUG9zaXRpb25Db21wbGV4aXR5O1xuICB9XG5cbiAgZ2V0IHVzZVBlcnNvbmFCZWhhdmlvckJpYXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VQZXJzb25hQmVoYXZpb3JCaWFzO1xuICB9XG5cbiAgZ2V0IHVzZUh1bWFuRGVsYXlTaW11bGF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlSHVtYW5EZWxheVNpbXVsYXRpb247XG4gIH1cblxuICBnZXQgdXNlQnJpbGxpYW50TW92ZUJ1ZGdldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZUJyaWxsaWFudE1vdmVCdWRnZXQ7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50TW92ZXNQZXJHYW1lKCk6IEJyaWxsaWFudE1vdmVzUGVyR2FtZSB7XG4gICAgcmV0dXJuIHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVzUGVyR2FtZTtcbiAgfVxuXG4gIGdldCBicmlsbGlhbnRBbGxvd2VkUGhhc2UoKTogQnJpbGxpYW50QWxsb3dlZFBoYXNlIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50QWxsb3dlZFBoYXNlO1xuICB9XG5cbiAgZ2V0IGJyaWxsaWFudFVzZWRDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRVc2VkQ291bnQ7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50TW92ZU51bWJlcnMoKTogbnVtYmVyW10ge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3ZlTnVtYmVycztcbiAgfVxuXG4gIGdldCBicmlsbGlhbnRHYW1lU2Vzc2lvbklkKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5nYW1lU2Vzc2lvbklkO1xuICB9XG5cbiAgZ2V0IGhhc1JlbWFpbmluZ0JyaWxsaWFudE1vdmVzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRVc2VkQ291bnQgPCB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGZlYXR1cmVPcHRpb25zVmlld01vZGVsID0gbmV3IEZlYXR1cmVPcHRpb25zVmlld01vZGVsKCk7XG4iLCAiaW1wb3J0IHsgQ2hlc3MsIFBpZWNlU3ltYm9sIH0gZnJvbSAnY2hlc3MuanMnO1xuaW1wb3J0IHsgQ2xhc3NpZmllZE1vdmUsIE1vdmVCdWNrZXQgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFJhbmRvbVNvdXJjZSB9IGZyb20gJy4vcmFuZG9tJztcblxuZXhwb3J0IGludGVyZmFjZSBCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlIHtcbiAgbW92ZTogQ2xhc3NpZmllZE1vdmU7XG4gIHRhY3RpY2FsU2NvcmU6IG51bWJlcjtcbn1cblxuY29uc3QgUElFQ0VfVkFMVUVTOiBSZWNvcmQ8UGllY2VTeW1ib2wsIG51bWJlcj4gPSB7XG4gIHA6IDEsXG4gIG46IDMsXG4gIGI6IDMsXG4gIHI6IDUsXG4gIHE6IDksXG4gIGs6IDAsXG59O1xuXG5jb25zdCBCUklMTElBTlRfQlVDS0VUUzogTW92ZUJ1Y2tldFtdID0gWydiZXN0JywgJ2dyZWF0J107XG5cbmZ1bmN0aW9uIGdldFBpZWNlVmFsdWUodHlwZT86IFBpZWNlU3ltYm9sKTogbnVtYmVyIHtcbiAgcmV0dXJuIHR5cGUgPyBQSUVDRV9WQUxVRVNbdHlwZV0gOiAwO1xufVxuXG5mdW5jdGlvbiBnZXRUYWN0aWNhbFNjb3JlKGZlbjogc3RyaW5nLCBtb3ZlOiBDbGFzc2lmaWVkTW92ZSwgYmVzdEV2YWx1YXRpb246IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGNoZXNzID0gbmV3IENoZXNzKGZlbik7XG4gIGNvbnN0IGZyb20gPSBtb3ZlLm1vdmUuc2xpY2UoMCwgMik7XG4gIGNvbnN0IHRvID0gbW92ZS5tb3ZlLnNsaWNlKDIsIDQpO1xuICBjb25zdCBtb3ZpbmdQaWVjZSA9IGNoZXNzLmdldChmcm9tKTtcbiAgY29uc3QgdGFyZ2V0UGllY2UgPSBjaGVzcy5nZXQodG8pO1xuICBjb25zdCBwbGF5ZWRNb3ZlID0gY2hlc3MubW92ZSh7XG4gICAgZnJvbSxcbiAgICB0byxcbiAgICBwcm9tb3Rpb246IG1vdmUubW92ZVs0XSBhcyAncScgfCAncicgfCAnYicgfCAnbicgfCB1bmRlZmluZWQsXG4gIH0pO1xuXG4gIGlmICghcGxheWVkTW92ZSkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgY29uc3QgaXNDYXB0dXJlID0gcGxheWVkTW92ZS5mbGFncy5pbmNsdWRlcygnYycpIHx8IHBsYXllZE1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2UnKTtcbiAgY29uc3QgaXNQcm9tb3Rpb24gPSBCb29sZWFuKHBsYXllZE1vdmUucHJvbW90aW9uKTtcbiAgY29uc3QgaXNDaGVjayA9IGNoZXNzLmlzQ2hlY2soKTtcbiAgY29uc3QgZXZhbEdhaW4gPSBNYXRoLm1heCgwLCBiZXN0RXZhbHVhdGlvbiAtIG1vdmUuZXZhbHVhdGlvbik7XG4gIGNvbnN0IG1hdGVyaWFsU3dpbmcgPSBnZXRQaWVjZVZhbHVlKHRhcmdldFBpZWNlPy50eXBlKSAtIGdldFBpZWNlVmFsdWUobW92aW5nUGllY2U/LnR5cGUpO1xuICBjb25zdCBpc1NhY3JpZmljZSA9IGlzQ2FwdHVyZSAmJiBtYXRlcmlhbFN3aW5nIDwgMDtcblxuICBsZXQgdGFjdGljYWxTY29yZSA9IDA7XG4gIHRhY3RpY2FsU2NvcmUgKz0gaXNDaGVjayA/IDIgOiAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGlzQ2FwdHVyZSA/IDEuNSA6IDA7XG4gIHRhY3RpY2FsU2NvcmUgKz0gaXNQcm9tb3Rpb24gPyAyLjUgOiAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGlzU2FjcmlmaWNlID8gMS43NSA6IDA7XG4gIHRhY3RpY2FsU2NvcmUgKz0gZXZhbEdhaW4gPj0gODAgPyAxLjUgOiBldmFsR2FpbiA+PSA0MCA/IDAuNzUgOiAwO1xuXG4gIHJldHVybiB0YWN0aWNhbFNjb3JlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnJpbGxpYW50TW92ZUNhbmRpZGF0ZXMoXG4gIGZlbjogc3RyaW5nLFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbik6IEJyaWxsaWFudE1vdmVDYW5kaWRhdGVbXSB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBiZXN0RXZhbHVhdGlvbiA9IG1vdmVzWzBdLmV2YWx1YXRpb247XG5cbiAgcmV0dXJuIG1vdmVzXG4gICAgLmZpbHRlcihtb3ZlID0+IEJSSUxMSUFOVF9CVUNLRVRTLmluY2x1ZGVzKG1vdmUuYnVja2V0KSlcbiAgICAubWFwKG1vdmUgPT4gKHtcbiAgICAgIG1vdmUsXG4gICAgICB0YWN0aWNhbFNjb3JlOiBnZXRUYWN0aWNhbFNjb3JlKGZlbiwgbW92ZSwgYmVzdEV2YWx1YXRpb24pLFxuICAgIH0pKVxuICAgIC5maWx0ZXIoY2FuZGlkYXRlID0+IGNhbmRpZGF0ZS50YWN0aWNhbFNjb3JlID4gMClcbiAgICAuc29ydCgobGVmdCwgcmlnaHQpID0+IHJpZ2h0LnRhY3RpY2FsU2NvcmUgLSBsZWZ0LnRhY3RpY2FsU2NvcmUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja0JyaWxsaWFudE1vdmUoXG4gIGNhbmRpZGF0ZXM6IEJyaWxsaWFudE1vdmVDYW5kaWRhdGVbXSxcbiAgcmFuZG9tU291cmNlOiBSYW5kb21Tb3VyY2UsXG4pOiBDbGFzc2lmaWVkTW92ZSB8IG51bGwge1xuICBpZiAoY2FuZGlkYXRlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHRvdGFsV2VpZ2h0ID0gY2FuZGlkYXRlcy5yZWR1Y2UoKHN1bSwgY2FuZGlkYXRlKSA9PiBzdW0gKyBjYW5kaWRhdGUudGFjdGljYWxTY29yZSwgMCk7XG4gIGxldCBzZWxlY3Rpb24gPSByYW5kb21Tb3VyY2UubmV4dCgpICogdG90YWxXZWlnaHQ7XG5cbiAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlcykge1xuICAgIHNlbGVjdGlvbiAtPSBjYW5kaWRhdGUudGFjdGljYWxTY29yZTtcbiAgICBpZiAoc2VsZWN0aW9uIDw9IDApIHtcbiAgICAgIHJldHVybiBjYW5kaWRhdGUubW92ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY2FuZGlkYXRlc1tjYW5kaWRhdGVzLmxlbmd0aCAtIDFdLm1vdmU7XG59XG4iLCAiaW1wb3J0IHsgQ2hlc3MsIFBpZWNlU3ltYm9sIH0gZnJvbSAnY2hlc3MuanMnO1xuXG5leHBvcnQgdHlwZSBHYW1lUGhhc2UgPSAnb3BlbmluZycgfCAnbWlkZGxlZ2FtZScgfCAnZW5kZ2FtZSc7XG5cbmNvbnN0IFBJRUNFX1ZBTFVFUzogUmVjb3JkPFBpZWNlU3ltYm9sLCBudW1iZXI+ID0ge1xuICBwOiAxLFxuICBuOiAzLFxuICBiOiAzLFxuICByOiA1LFxuICBxOiA5LFxuICBrOiAwLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBHYW1lUGhhc2VSZXN1bHQge1xuICBwaGFzZTogR2FtZVBoYXNlO1xuICB0b3RhbE1hdGVyaWFsOiBudW1iZXI7XG4gIHF1ZWVuc1RyYWRlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRvdGFsTWF0ZXJpYWwoZmVuOiBzdHJpbmcpOiBudW1iZXIge1xuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICByZXR1cm4gY2hlc3NcbiAgICAuYm9hcmQoKVxuICAgIC5mbGF0KClcbiAgICAucmVkdWNlKCh0b3RhbCwgcGllY2UpID0+IHRvdGFsICsgKHBpZWNlID8gUElFQ0VfVkFMVUVTW3BpZWNlLnR5cGVdIDogMCksIDApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJlUXVlZW5zVHJhZGVkKGZlbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNoZXNzID0gbmV3IENoZXNzKGZlbik7XG4gIGNvbnN0IHF1ZWVucyA9IGNoZXNzXG4gICAgLmJvYXJkKClcbiAgICAuZmxhdCgpXG4gICAgLmZpbHRlcihwaWVjZSA9PiBwaWVjZT8udHlwZSA9PT0gJ3EnKS5sZW5ndGg7XG5cbiAgcmV0dXJuIHF1ZWVucyA8IDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RHYW1lUGhhc2UoZmVuOiBzdHJpbmcsIG1vdmVOdW1iZXI6IG51bWJlcik6IEdhbWVQaGFzZVJlc3VsdCB7XG4gIGNvbnN0IHRvdGFsTWF0ZXJpYWwgPSBnZXRUb3RhbE1hdGVyaWFsKGZlbik7XG4gIGNvbnN0IHF1ZWVuc1RyYWRlZCA9IGFyZVF1ZWVuc1RyYWRlZChmZW4pO1xuXG4gIGlmIChtb3ZlTnVtYmVyIDw9IDEwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBoYXNlOiAnb3BlbmluZycsXG4gICAgICB0b3RhbE1hdGVyaWFsLFxuICAgICAgcXVlZW5zVHJhZGVkLFxuICAgIH07XG4gIH1cblxuICBpZiAocXVlZW5zVHJhZGVkIHx8IHRvdGFsTWF0ZXJpYWwgPD0gMjQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGhhc2U6ICdlbmRnYW1lJyxcbiAgICAgIHRvdGFsTWF0ZXJpYWwsXG4gICAgICBxdWVlbnNUcmFkZWQsXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGhhc2U6ICdtaWRkbGVnYW1lJyxcbiAgICB0b3RhbE1hdGVyaWFsLFxuICAgIHF1ZWVuc1RyYWRlZCxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBCdWNrZXRDb25maWcsIE1vdmVCdWNrZXQsIEFuYWx5emVkTW92ZSB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB7XG4gIGxldmVsOiAnbG93JyB8ICdtZWRpdW0nIHwgJ2hpZ2gnO1xuICBzY29yZTogbnVtYmVyO1xuICBzcHJlYWQ6IG51bWJlcjtcbiAgY2xvc2VDYW5kaWRhdGVzOiBudW1iZXI7XG4gIHZvbGF0aWxpdHk6IG51bWJlcjtcbn1cblxuZnVuY3Rpb24gY2xhbXAodmFsdWU6IG51bWJlciwgbWluID0gMCwgbWF4ID0gMSk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLm1pbihtYXgsIE1hdGgubWF4KG1pbiwgdmFsdWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uQ29tcGxleGl0eShcbiAgbW92ZXM6IEFuYWx5emVkTW92ZVtdLFxuKTogUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0IHtcbiAgaWYgKG1vdmVzLmxlbmd0aCA8PSAxKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxldmVsOiAnbG93JyxcbiAgICAgIHNjb3JlOiAwLFxuICAgICAgc3ByZWFkOiAwLFxuICAgICAgY2xvc2VDYW5kaWRhdGVzOiBtb3Zlcy5sZW5ndGgsXG4gICAgICB2b2xhdGlsaXR5OiAwLFxuICAgIH07XG4gIH1cblxuICBjb25zdCBldmFsdWF0aW9ucyA9IG1vdmVzLm1hcCgobW92ZSkgPT4gbW92ZS5ldmFsdWF0aW9uKS5zb3J0KChhLCBiKSA9PiBiIC0gYSk7XG4gIGNvbnN0IGJlc3QgPSBldmFsdWF0aW9uc1swXTtcbiAgY29uc3Qgc3ByZWFkID0gTWF0aC5hYnMoYmVzdCAtIGV2YWx1YXRpb25zW2V2YWx1YXRpb25zLmxlbmd0aCAtIDFdKTtcbiAgY29uc3QgY2xvc2VDYW5kaWRhdGVzID0gbW92ZXMuZmlsdGVyKChtb3ZlKSA9PiBNYXRoLmFicyhiZXN0IC0gbW92ZS5ldmFsdWF0aW9uKSA8PSAzNSkubGVuZ3RoO1xuICBjb25zdCB2b2xhdGlsaXR5ID0gbW92ZXMubGVuZ3RoID4gMVxuICAgID8gTWF0aC5hYnMoYmVzdCAtIGV2YWx1YXRpb25zW01hdGgubWluKDIsIGV2YWx1YXRpb25zLmxlbmd0aCAtIDEpXSlcbiAgICA6IDA7XG5cbiAgY29uc3Qgc3ByZWFkRmFjdG9yID0gMSAtIGNsYW1wKHNwcmVhZCAvIDI1MCk7XG4gIGNvbnN0IGNsb3NlRmFjdG9yID0gY2xhbXAoKGNsb3NlQ2FuZGlkYXRlcyAtIDEpIC8gNSk7XG4gIGNvbnN0IHZvbGF0aWxpdHlGYWN0b3IgPSBjbGFtcCh2b2xhdGlsaXR5IC8gMTUwKTtcbiAgY29uc3Qgc2NvcmUgPSBjbGFtcChzcHJlYWRGYWN0b3IgKiAwLjQ1ICsgY2xvc2VGYWN0b3IgKiAwLjM1ICsgdm9sYXRpbGl0eUZhY3RvciAqIDAuMik7XG5cbiAgbGV0IGxldmVsOiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHRbJ2xldmVsJ10gPSAnbWVkaXVtJztcbiAgaWYgKHNjb3JlIDwgMC4zMykgbGV2ZWwgPSAnbG93JztcbiAgaWYgKHNjb3JlID4gMC42NikgbGV2ZWwgPSAnaGlnaCc7XG5cbiAgcmV0dXJuIHtcbiAgICBsZXZlbCxcbiAgICBzY29yZSxcbiAgICBzcHJlYWQsXG4gICAgY2xvc2VDYW5kaWRhdGVzLFxuICAgIHZvbGF0aWxpdHksXG4gIH07XG59XG5cbmNvbnN0IEJVQ0tFVF9PUkRFUjogTW92ZUJ1Y2tldFtdID0gW1xuICAnYmVzdCcsXG4gICdncmVhdCcsXG4gICdleGNlbGxlbnQnLFxuICAnZ29vZCcsXG4gICdpbmFjY3VyYWN5JyxcbiAgJ21pc3Rha2UnLFxuICAnYmx1bmRlcicsXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gYWRqdXN0QnVja2V0Q29uZmlnRm9yQ29tcGxleGl0eShcbiAgY29uZmlnOiBCdWNrZXRDb25maWcsXG4gIGNvbXBsZXhpdHk6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCxcbik6IEJ1Y2tldENvbmZpZyB7XG4gIGNvbnN0IGFkanVzdGVkID0geyAuLi5jb25maWcgfTtcbiAgY29uc3QgaW50ZW5zaXR5ID0gY29tcGxleGl0eS5zY29yZTtcblxuICBpZiAoY29tcGxleGl0eS5sZXZlbCA9PT0gJ2hpZ2gnKSB7XG4gICAgYWRqdXN0ZWQuYmVzdCA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmJlc3QgLSBNYXRoLnJvdW5kKDYgKiBpbnRlbnNpdHkpKTtcbiAgICBhZGp1c3RlZC5ncmVhdCA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmdyZWF0IC0gTWF0aC5yb3VuZCgzICogaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQuaW5hY2N1cmFjeSArPSBNYXRoLnJvdW5kKDQgKiBpbnRlbnNpdHkpO1xuICAgIGFkanVzdGVkLm1pc3Rha2UgKz0gTWF0aC5yb3VuZCgzICogaW50ZW5zaXR5KTtcbiAgICBhZGp1c3RlZC5ibHVuZGVyICs9IE1hdGgucm91bmQoMiAqIGludGVuc2l0eSk7XG4gIH0gZWxzZSBpZiAoY29tcGxleGl0eS5sZXZlbCA9PT0gJ2xvdycpIHtcbiAgICBhZGp1c3RlZC5iZXN0ICs9IE1hdGgucm91bmQoNSAqICgxIC0gaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQuZ3JlYXQgKz0gTWF0aC5yb3VuZCgzICogKDEgLSBpbnRlbnNpdHkpKTtcbiAgICBhZGp1c3RlZC5leGNlbGxlbnQgKz0gTWF0aC5yb3VuZCgyICogKDEgLSBpbnRlbnNpdHkpKTtcbiAgICBhZGp1c3RlZC5taXN0YWtlID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQubWlzdGFrZSAtIDIpO1xuICAgIGFkanVzdGVkLmJsdW5kZXIgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5ibHVuZGVyIC0gMSk7XG4gIH1cblxuICBjb25zdCB0b3RhbCA9IEJVQ0tFVF9PUkRFUi5yZWR1Y2UoKHN1bSwgYnVja2V0KSA9PiBzdW0gKyBhZGp1c3RlZFtidWNrZXRdLCAwKTtcbiAgaWYgKHRvdGFsIDw9IDApIHtcbiAgICByZXR1cm4gY29uZmlnO1xuICB9XG5cbiAgY29uc3Qgbm9ybWFsaXplZCA9IEJVQ0tFVF9PUkRFUi5yZWR1Y2UoKHJlc3VsdCwgYnVja2V0KSA9PiB7XG4gICAgcmVzdWx0W2J1Y2tldF0gPSBNYXRoLnJvdW5kKChhZGp1c3RlZFtidWNrZXRdIC8gdG90YWwpICogMTAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LCB7fSBhcyBCdWNrZXRDb25maWcpO1xuXG4gIGNvbnN0IG5vcm1hbGl6ZWRUb3RhbCA9IEJVQ0tFVF9PUkRFUi5yZWR1Y2UoKHN1bSwgYnVja2V0KSA9PiBzdW0gKyBub3JtYWxpemVkW2J1Y2tldF0sIDApO1xuICBjb25zdCBkaWZmID0gMTAwIC0gbm9ybWFsaXplZFRvdGFsO1xuICBub3JtYWxpemVkLmJlc3QgKz0gZGlmZjtcblxuICByZXR1cm4gbm9ybWFsaXplZDtcbn1cbiIsICJpbXBvcnQgeyBDaGVzcyB9IGZyb20gJ2NoZXNzLmpzJztcbmltcG9ydCB7IFBlcnNvbmFJZCB9IGZyb20gJy4vZmVhdHVyZU9wdGlvbnMnO1xuaW1wb3J0IHsgQ2xhc3NpZmllZE1vdmUsIE1vdmVCdWNrZXQgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFJhbmRvbVNvdXJjZSB9IGZyb20gJy4vcmFuZG9tJztcbmltcG9ydCB7IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB9IGZyb20gJy4vcG9zaXRpb25Db21wbGV4aXR5JztcblxuZXhwb3J0IHR5cGUgUGVyc29uYUJlaGF2aW9yTW9kZSA9ICdhZ2dyZXNzaXZlJyB8ICdzYWZlJyB8ICdiYWxhbmNlZCc7XG5cbmNvbnN0IFNBRkVfQlVDS0VUUzogTW92ZUJ1Y2tldFtdID0gWydiZXN0JywgJ2dyZWF0JywgJ2V4Y2VsbGVudCddO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVyc29uYUJlaGF2aW9yTW9kZShwZXJzb25hOiBQZXJzb25hSWQpOiBQZXJzb25hQmVoYXZpb3JNb2RlIHtcbiAgaWYgKHBlcnNvbmEgPT09ICdhZ2dyZXNzaXZlJykge1xuICAgIHJldHVybiAnYWdncmVzc2l2ZSc7XG4gIH1cblxuICBpZiAocGVyc29uYSA9PT0gJ2hhcmQnIHx8IHBlcnNvbmEgPT09ICdzdXBlcl9oYXJkJykge1xuICAgIHJldHVybiAnc2FmZSc7XG4gIH1cblxuICByZXR1cm4gJ2JhbGFuY2VkJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UGVyc29uYUJ1Y2tldEJpYXMoXG4gIGNvbmZpZzogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4sXG4gIHBlcnNvbmE6IFBlcnNvbmFJZCxcbik6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+IHtcbiAgY29uc3QgbW9kZSA9IGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYSk7XG4gIGNvbnN0IGFkanVzdGVkID0geyAuLi5jb25maWcgfTtcblxuICBpZiAobW9kZSA9PT0gJ2FnZ3Jlc3NpdmUnKSB7XG4gICAgYWRqdXN0ZWQuZ29vZCArPSAzO1xuICAgIGFkanVzdGVkLmluYWNjdXJhY3kgKz0gMjtcbiAgICBhZGp1c3RlZC5iZXN0ID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuYmVzdCAtIDMpO1xuICAgIGFkanVzdGVkLmdyZWF0ID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuZ3JlYXQgLSAyKTtcbiAgfSBlbHNlIGlmIChtb2RlID09PSAnc2FmZScpIHtcbiAgICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBTQUZFX0JVQ0tFVFMpIHtcbiAgICAgIGFkanVzdGVkW2J1Y2tldF0gKz0gMjtcbiAgICB9XG4gICAgYWRqdXN0ZWQubWlzdGFrZSA9IE1hdGgubWF4KDAsIGFkanVzdGVkLm1pc3Rha2UgLSAyKTtcbiAgICBhZGp1c3RlZC5ibHVuZGVyID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuYmx1bmRlciAtIDIpO1xuICB9XG5cbiAgcmV0dXJuIGFkanVzdGVkO1xufVxuXG5mdW5jdGlvbiBnZXRNb3ZlVHJhaXRTY29yZShmZW46IHN0cmluZywgbW92ZVVjaTogc3RyaW5nLCBwZXJzb25hOiBQZXJzb25hSWQpOiBudW1iZXIge1xuICBjb25zdCBtb2RlID0gZ2V0UGVyc29uYUJlaGF2aW9yTW9kZShwZXJzb25hKTtcbiAgaWYgKG1vZGUgPT09ICdiYWxhbmNlZCcpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IGNoZXNzID0gbmV3IENoZXNzKGZlbik7XG4gIGNvbnN0IG1vdmUgPSBjaGVzcy5tb3ZlKHtcbiAgICBmcm9tOiBtb3ZlVWNpLnNsaWNlKDAsIDIpLFxuICAgIHRvOiBtb3ZlVWNpLnNsaWNlKDIsIDQpLFxuICAgIHByb21vdGlvbjogbW92ZVVjaVs0XSBhcyAncScgfCAncicgfCAnYicgfCAnbicgfCB1bmRlZmluZWQsXG4gIH0pO1xuXG4gIGlmICghbW92ZSkge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgY29uc3QgaXNDYXB0dXJlID0gbW92ZS5mbGFncy5pbmNsdWRlcygnYycpIHx8IG1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2UnKTtcbiAgY29uc3QgaXNQcm9tb3Rpb24gPSBCb29sZWFuKG1vdmUucHJvbW90aW9uKTtcbiAgY29uc3QgaXNDYXN0bGUgPSBtb3ZlLmZsYWdzLmluY2x1ZGVzKCdrJykgfHwgbW92ZS5mbGFncy5pbmNsdWRlcygncScpO1xuICBjb25zdCBpc0NoZWNrID0gY2hlc3MuaXNDaGVjaygpO1xuXG4gIGlmIChtb2RlID09PSAnYWdncmVzc2l2ZScpIHtcbiAgICByZXR1cm4gMVxuICAgICAgKyAoaXNDYXB0dXJlID8gMC4zNSA6IDApXG4gICAgICArIChpc0NoZWNrID8gMC4zNSA6IDApXG4gICAgICArIChpc1Byb21vdGlvbiA/IDAuNDUgOiAwKVxuICAgICAgKyAoaXNDYXN0bGUgPyAwLjA1IDogMCk7XG4gIH1cblxuICByZXR1cm4gMVxuICAgICsgKGlzQ2FzdGxlID8gMC4yIDogMClcbiAgICArICghaXNDYXB0dXJlID8gMC4xIDogMClcbiAgICAtIChpc1Byb21vdGlvbiA/IDAuMDUgOiAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tQZXJzb25hQmlhc2VkTW92ZShcbiAgZmVuOiBzdHJpbmcsXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICBwZXJzb25hOiBQZXJzb25hSWQsXG4gIHJhbmRvbVNvdXJjZTogUmFuZG9tU291cmNlLFxuKTogQ2xhc3NpZmllZE1vdmUge1xuICBpZiAobW92ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIG1vdmVzWzBdO1xuICB9XG5cbiAgY29uc3Qgd2VpZ2h0ZWRNb3ZlcyA9IG1vdmVzLm1hcCgobW92ZSkgPT4gKHtcbiAgICBtb3ZlLFxuICAgIHdlaWdodDogTWF0aC5tYXgoMC4xLCBnZXRNb3ZlVHJhaXRTY29yZShmZW4sIG1vdmUubW92ZSwgcGVyc29uYSkpLFxuICB9KSk7XG4gIGNvbnN0IHRvdGFsV2VpZ2h0ID0gd2VpZ2h0ZWRNb3Zlcy5yZWR1Y2UoKHN1bSwgZW50cnkpID0+IHN1bSArIGVudHJ5LndlaWdodCwgMCk7XG4gIGxldCBzZWxlY3Rpb24gPSByYW5kb21Tb3VyY2UubmV4dCgpICogdG90YWxXZWlnaHQ7XG5cbiAgZm9yIChjb25zdCBlbnRyeSBvZiB3ZWlnaHRlZE1vdmVzKSB7XG4gICAgc2VsZWN0aW9uIC09IGVudHJ5LndlaWdodDtcbiAgICBpZiAoc2VsZWN0aW9uIDw9IDApIHtcbiAgICAgIHJldHVybiBlbnRyeS5tb3ZlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB3ZWlnaHRlZE1vdmVzW3dlaWdodGVkTW92ZXMubGVuZ3RoIC0gMV0ubW92ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUh1bWFuRGVsYXlNcyhvcHRpb25zOiB7XG4gIGNvbXBsZXhpdHk6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB8IG51bGw7XG4gIHBlcnNvbmE6IFBlcnNvbmFJZDtcbiAgYnVja2V0OiBNb3ZlQnVja2V0O1xufSk6IG51bWJlciB7XG4gIGNvbnN0IHsgY29tcGxleGl0eSwgcGVyc29uYSwgYnVja2V0IH0gPSBvcHRpb25zO1xuICBjb25zdCBtb2RlID0gZ2V0UGVyc29uYUJlaGF2aW9yTW9kZShwZXJzb25hKTtcbiAgY29uc3QgYmFzZSA9IDM1MDtcbiAgY29uc3QgY29tcGxleGl0eURlbGF5ID0gY29tcGxleGl0eSA/IE1hdGgucm91bmQoOTAwICogY29tcGxleGl0eS5zY29yZSkgOiAwO1xuICBjb25zdCBwZXJzb25hRGVsYXkgPSBtb2RlID09PSAnc2FmZScgPyAyMjAgOiBtb2RlID09PSAnYWdncmVzc2l2ZScgPyA4MCA6IDE0MDtcbiAgY29uc3QgYnVja2V0RGVsYXkgPVxuICAgIGJ1Y2tldCA9PT0gJ2Jlc3QnIHx8IGJ1Y2tldCA9PT0gJ2dyZWF0J1xuICAgICAgPyAxMjBcbiAgICAgIDogYnVja2V0ID09PSAnbWlzdGFrZScgfHwgYnVja2V0ID09PSAnYmx1bmRlcidcbiAgICAgICAgPyA0MFxuICAgICAgICA6IDgwO1xuXG4gIHJldHVybiBiYXNlICsgY29tcGxleGl0eURlbGF5ICsgcGVyc29uYURlbGF5ICsgYnVja2V0RGVsYXk7XG59XG4iLCAiLyoqXG4gKiBFbmdpbmUgVmlld01vZGVsXG4gKiBWaWV3TW9kZWwgbGF5ZXIgLSBNb2JYIHN0b3JlIGZvciBTdG9ja2Zpc2ggZW5naW5lIHN0YXRlXG4gKi9cblxuaW1wb3J0IHsgbWFrZUF1dG9PYnNlcnZhYmxlLCBhY3Rpb24sIHJ1bkluQWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQge1xuICBBbmFseXNpc1B1cnBvc2UsXG4gIEFuYWx5c2lzU25hcHNob3QsXG4gIGlzU3RhbGVBbmFseXNpc1JlcXVlc3QsXG59IGZyb20gJy4uL2VuZ2luZS9hbmFseXNpc1NhZmV0eSc7XG5pbXBvcnQgeyBFbmdpbmVDb29yZGluYXRvciwgZW5naW5lQ29vcmRpbmF0b3IsIEVuZ2luZUxhbmUgfSBmcm9tICcuLi9lbmdpbmUvZW5naW5lQ29vcmRpbmF0b3InO1xuaW1wb3J0IHsgY2xhc3NpZnlNb3ZlcywgZ2V0TW92ZVN0YXRzLCBncm91cE1vdmVzQnlCdWNrZXQgfSBmcm9tICcuLi9lbmdpbmUvbW92ZUNsYXNzaWZpZXInO1xuaW1wb3J0IHtcbiAgcGlja0J1Y2tldExlZ2FjeSxcbiAgcGlja0J1Y2tldFdpdGhDbG9zZXN0RmFsbGJhY2ssXG4gIHBpY2tSYW5kb21Nb3ZlRnJvbUJ1Y2tldCxcbn0gZnJvbSAnLi4vZW5naW5lL21vdmVQaWNrZXInO1xuaW1wb3J0IHsgXG4gIEFuYWx5emVkTW92ZSxcbiAgQ2xhc3NpZmllZE1vdmUsIFxuICBQaWNrZWRNb3ZlUmVzdWx0LCBcbiAgTW92ZUJ1Y2tldCxcbiAgQnVja2V0Q29uZmlnLFxufSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuaW1wb3J0IHsgYW5hbHlzaXNDYWNoZSwgYnVpbGRBbmFseXNpc0NhY2hlS2V5IH0gZnJvbSAnLi4vZW5naW5lL2FuYWx5c2lzQ2FjaGUnO1xuaW1wb3J0IHsgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcbmltcG9ydCB7IGdldEJyaWxsaWFudE1vdmVDYW5kaWRhdGVzLCBwaWNrQnJpbGxpYW50TW92ZSB9IGZyb20gJy4uL2VuZ2luZS9icmlsbGlhbnRNb3ZlJztcbmltcG9ydCB7IGRldGVjdEdhbWVQaGFzZSB9IGZyb20gJy4uL2VuZ2luZS9nYW1lUGhhc2UnO1xuaW1wb3J0IHtcbiAgYWRqdXN0QnVja2V0Q29uZmlnRm9yQ29tcGxleGl0eSxcbiAgY2FsY3VsYXRlUG9zaXRpb25Db21wbGV4aXR5LFxuICBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQsXG59IGZyb20gJy4uL2VuZ2luZS9wb3NpdGlvbkNvbXBsZXhpdHknO1xuaW1wb3J0IHtcbiAgYXBwbHlQZXJzb25hQnVja2V0QmlhcyxcbiAgcGlja1BlcnNvbmFCaWFzZWRNb3ZlLFxufSBmcm9tICcuLi9lbmdpbmUvcGVyc29uYUJpYXMnO1xuaW1wb3J0IHtcbiAgYnVpbGREZXRlcm1pbmlzdGljU2VlZCxcbiAgY3JlYXRlTGVnYWN5UmFuZG9tU291cmNlLFxuICBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2UsXG59IGZyb20gJy4uL2VuZ2luZS9yYW5kb20nO1xuaW1wb3J0IHsgUGVyc29uYUlkIH0gZnJvbSAnLi4vZW5naW5lL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7IGNyZWF0ZURlYnVnTG9nZ2VyIH0gZnJvbSAnLi4vc2hhcmVkL2RlYnVnJztcblxuaW50ZXJmYWNlIE1vdmVTZWxlY3Rpb25Db250ZXh0IHtcbiAgZmVuOiBzdHJpbmc7XG4gIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICBtb3ZlQ291bnQ6IG51bWJlcjtcbiAgc2lkZVRvTW92ZTogJ3cnIHwgJ2InO1xuICBwZXJzb25hOiBQZXJzb25hSWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9zaXRpb25BbmFseXNpc1Jlc3VsdCBleHRlbmRzIEFuYWx5c2lzU25hcHNob3Q8Q2xhc3NpZmllZE1vdmVbXT4ge1xuICBjb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQ7XG4gIGlnbm9yZWQ6IGJvb2xlYW47XG4gIGZyb21DYWNoZTogYm9vbGVhbjtcbiAgcHVycG9zZTogQW5hbHlzaXNQdXJwb3NlO1xufVxuXG5pbnRlcmZhY2UgQWN0aXZlQW5hbHlzaXNSdW4ge1xuICBjYWNoZUtleTogc3RyaW5nO1xuICBmZW46IHN0cmluZztcbiAgcHVycG9zZTogQW5hbHlzaXNQdXJwb3NlO1xuICBwcm9taXNlOiBQcm9taXNlPFBvc2l0aW9uQW5hbHlzaXNSZXN1bHQ+O1xufVxuXG5pbnRlcmZhY2UgRW5naW5lVmlld01vZGVsRGVwZW5kZW5jaWVzIHtcbiAgY29vcmRpbmF0b3I/OiBFbmdpbmVDb29yZGluYXRvcjtcbn1cblxuY29uc3QgbG9nZ2VyID0gY3JlYXRlRGVidWdMb2dnZXIoJ0VuZ2luZVZpZXdNb2RlbCcpO1xuXG5mdW5jdGlvbiBjYW5Vc2VCcmlsbGlhbnRNb3ZlQnVkZ2V0KG1vdmVDb3VudDogbnVtYmVyLCBmZW46IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIWZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZUJyaWxsaWFudE1vdmVCdWRnZXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIWZlYXR1cmVPcHRpb25zVmlld01vZGVsLmhhc1JlbWFpbmluZ0JyaWxsaWFudE1vdmVzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVzUGVyR2FtZSA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHBoYXNlID0gZGV0ZWN0R2FtZVBoYXNlKGZlbiwgbW92ZUNvdW50KS5waGFzZTtcbiAgcmV0dXJuIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudEFsbG93ZWRQaGFzZSA9PT0gJ2FueSdcbiAgICB8fCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRBbGxvd2VkUGhhc2UgPT09IHBoYXNlO1xufVxuXG5leHBvcnQgY2xhc3MgRW5naW5lVmlld01vZGVsIHtcbiAgaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICBpc0luaXRpYWxpemluZyA9IGZhbHNlO1xuICBhbmFseXplZE1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdID0gW107XG4gIGxhc3RQaWNrZWRNb3ZlOiBQaWNrZWRNb3ZlUmVzdWx0IHwgbnVsbCA9IG51bGw7XG4gIGVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgbGFzdENvbXBsZXhpdHk6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB8IG51bGwgPSBudWxsO1xuICBsYXN0QW5hbHlzaXNGcm9tQ2FjaGUgPSBmYWxzZTtcbiAgbGFzdEFuYWx5c2lzUHVycG9zZTogQW5hbHlzaXNQdXJwb3NlIHwgbnVsbCA9IG51bGw7XG4gIGlzTW92ZUxhbmVBbmFseXppbmcgPSBmYWxzZTtcbiAgaXNCYWNrZ3JvdW5kQW5hbHl6aW5nID0gZmFsc2U7XG4gIHByaXZhdGUgbmV4dFJlcXVlc3RJZHM6IFJlY29yZDxBbmFseXNpc1B1cnBvc2UsIG51bWJlcj4gPSB7XG4gICAgZW5naW5lTW92ZTogMCxcbiAgICBiYWNrZ3JvdW5kOiAwLFxuICB9O1xuICBwcml2YXRlIGxhdGVzdFJlcXVlc3RJZHM6IFJlY29yZDxBbmFseXNpc1B1cnBvc2UsIG51bWJlcj4gPSB7XG4gICAgZW5naW5lTW92ZTogMCxcbiAgICBiYWNrZ3JvdW5kOiAwLFxuICB9O1xuICBwcml2YXRlIGFjdGl2ZUFuYWx5c2lzUnVuczogUmVjb3JkPEFuYWx5c2lzUHVycG9zZSwgQWN0aXZlQW5hbHlzaXNSdW4gfCBudWxsPiA9IHtcbiAgICBlbmdpbmVNb3ZlOiBudWxsLFxuICAgIGJhY2tncm91bmQ6IG51bGwsXG4gIH07XG4gIHByaXZhdGUgcmVhZG9ubHkgY29vcmRpbmF0b3I6IEVuZ2luZUNvb3JkaW5hdG9yO1xuXG4gIGNvbnN0cnVjdG9yKGRlcGVuZGVuY2llczogRW5naW5lVmlld01vZGVsRGVwZW5kZW5jaWVzID0ge30pIHtcbiAgICB0aGlzLmNvb3JkaW5hdG9yID0gZGVwZW5kZW5jaWVzLmNvb3JkaW5hdG9yID8/IGVuZ2luZUNvb3JkaW5hdG9yO1xuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBpbml0aWFsaXplOiBhY3Rpb24sXG4gICAgICBhbmFseXplUG9zaXRpb246IGFjdGlvbixcbiAgICAgIHBpY2tNb3ZlRnJvbUFuYWx5c2lzOiBhY3Rpb24sXG4gICAgICByZXNldDogYWN0aW9uLFxuICAgICAgc2V0RXJyb3I6IGFjdGlvbixcbiAgICB9KTtcbiAgICBcbiAgICBsb2dnZXIuZGVidWcoJ0luaXRpYWxpemVkJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSB0aGUgU3RvY2tmaXNoIGVuZ2luZVxuICAgKi9cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5pc0luaXRpYWxpemVkKSB7XG4gICAgICBsb2dnZXIuZGVidWcoJ0FscmVhZHkgaW5pdGlhbGl6ZWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICAgICAgdGhpcy5pc0luaXRpYWxpemluZyA9IHRydWU7XG4gICAgICB9KTtcbiAgICAgIGF3YWl0IHRoaXMuY29vcmRpbmF0b3IuaW5pdGlhbGl6ZSgpO1xuICAgICAgXG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgbG9nZ2VyLmRlYnVnKCdJbml0aWFsaXphdGlvbiBjb21wbGV0ZScpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdJbml0aWFsaXphdGlvbiBlcnJvcjonLCBlcnIpO1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmVycm9yID0gYEZhaWxlZCB0byBpbml0aWFsaXplIGVuZ2luZTogJHtlcnJ9YDtcbiAgICAgICAgdGhpcy5pc0luaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZSBlbmdpbmUgc2V0dGluZ3NcbiAgICovXG4gIGNvbmZpZ3VyZShvcHRpb25zOiB7IG11bHRpUFY/OiBudW1iZXI7IGRlcHRoPzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ0NvbmZpZ3VyaW5nOicsIG9wdGlvbnMpO1xuICAgIHRoaXMuY29vcmRpbmF0b3IuY29uZmlndXJlKCdtb3ZlJywgb3B0aW9ucyk7XG4gICAgdGhpcy5jb29yZGluYXRvci5jb25maWd1cmUoJ2FuYWx5c2lzJywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSBhIHBvc2l0aW9uIGFuZCBjbGFzc2lmeSBtb3Zlc1xuICAgKi9cbiAgYXN5bmMgYW5hbHl6ZVBvc2l0aW9uKFxuICAgIGZlbjogc3RyaW5nLFxuICAgIGRlcHRoID0gMjAsXG4gICAgbXVsdGlQViA9IDEyLFxuICAgIHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSA9ICdiYWNrZ3JvdW5kJyxcbiAgKTogUHJvbWlzZTxQb3NpdGlvbkFuYWx5c2lzUmVzdWx0PiB7XG4gICAgbG9nZ2VyLmRlYnVnKCdhbmFseXplUG9zaXRpb24gY2FsbGVkJywgeyBmZW4sIGRlcHRoLCBtdWx0aVBWLCBwdXJwb3NlIH0pO1xuICAgIGNvbnN0IGxhbmUgPSB0aGlzLmdldExhbmVGb3JQdXJwb3NlKHB1cnBvc2UpO1xuXG4gICAgaWYgKCF0aGlzLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjYWNoZUtleSA9IGJ1aWxkQW5hbHlzaXNDYWNoZUtleShmZW4sIGRlcHRoLCBtdWx0aVBWKTtcbiAgICAgIGNvbnN0IHJlcXVlc3RJZCA9ICsrdGhpcy5uZXh0UmVxdWVzdElkc1twdXJwb3NlXTtcbiAgICAgIHRoaXMubGF0ZXN0UmVxdWVzdElkc1twdXJwb3NlXSA9IHJlcXVlc3RJZDtcblxuICAgICAgY29uc3QgYWN0aXZlUnVuID0gdGhpcy5hY3RpdmVBbmFseXNpc1J1bnNbcHVycG9zZV07XG4gICAgICBpZiAoYWN0aXZlUnVuKSB7XG4gICAgICAgIGlmIChhY3RpdmVSdW4uY2FjaGVLZXkgPT09IGNhY2hlS2V5KSB7XG4gICAgICAgICAgY29uc3Qgc2hhcmVkUmVzdWx0ID0gYXdhaXQgYWN0aXZlUnVuLnByb21pc2U7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLnNoYXJlZFJlc3VsdCxcbiAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgIHB1cnBvc2UsXG4gICAgICAgICAgICBpZ25vcmVkOiBpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0KHJlcXVlc3RJZCwgdGhpcy5sYXRlc3RSZXF1ZXN0SWRzW3B1cnBvc2VdKSB8fCBzaGFyZWRSZXN1bHQuaWdub3JlZCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHB1cnBvc2UgPT09ICdlbmdpbmVNb3ZlJykge1xuICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZVB1cnBvc2VSZXF1ZXN0KHB1cnBvc2UpO1xuICAgICAgICAgIHRoaXMuY29vcmRpbmF0b3Iuc3RvcChsYW5lKTtcbiAgICAgICAgICBhd2FpdCBhY3RpdmVSdW4ucHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHB1cnBvc2UgPT09ICdiYWNrZ3JvdW5kJykge1xuICAgICAgICAgIGF3YWl0IGFjdGl2ZVJ1bi5wcm9taXNlLmNhdGNoKCgpID0+IHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLnNldExhbmVBbmFseXppbmcocHVycG9zZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgICAgICBpZiAocHVycG9zZSA9PT0gJ2VuZ2luZU1vdmUnKSB7XG4gICAgICAgICAgdGhpcy5hbmFseXplZE1vdmVzID0gW107XG4gICAgICAgICAgdGhpcy5sYXN0UGlja2VkTW92ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBydW5Qcm9taXNlID0gdGhpcy5wZXJmb3JtUG9zaXRpb25BbmFseXNpcyh7XG4gICAgICAgIGZlbixcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIG11bHRpUFYsXG4gICAgICAgIGNhY2hlS2V5LFxuICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgIHB1cnBvc2UsXG4gICAgICAgIGxhbmUsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zW3B1cnBvc2VdID0ge1xuICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgZmVuLFxuICAgICAgICBwdXJwb3NlLFxuICAgICAgICBwcm9taXNlOiBydW5Qcm9taXNlLFxuICAgICAgfTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJ1blByb21pc2U7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmVBbmFseXNpc1J1bnNbcHVycG9zZV0/LnByb21pc2UgPT09IHJ1blByb21pc2UpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuc1twdXJwb3NlXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignQW5hbHlzaXMgZXJyb3I6JywgZXJyKTtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGBBbmFseXNpcyBmYWlsZWQ6ICR7ZXJyfWA7XG4gICAgICAgIHRoaXMuc2V0TGFuZUFuYWx5emluZyhwdXJwb3NlLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGljayBhIG1vdmUgZnJvbSB0aGUgYW5hbHl6ZWQgbW92ZXMgdXNpbmcgYnVja2V0IGNvbmZpZ3VyYXRpb25cbiAgICovXG4gIHBpY2tNb3ZlRnJvbUFuYWx5c2lzKFxuICAgIGFuYWx5c2lzOiBQb3NpdGlvbkFuYWx5c2lzUmVzdWx0LFxuICAgIGNvbmZpZzogQnVja2V0Q29uZmlnLFxuICAgIGNvbnRleHQ6IE1vdmVTZWxlY3Rpb25Db250ZXh0LFxuICApOiBQaWNrZWRNb3ZlUmVzdWx0IHwgbnVsbCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdwaWNrTW92ZUZyb21BbmFseXNpcyBjYWxsZWQnLCB7XG4gICAgICBhbmFseXplZE1vdmVzQ291bnQ6IGFuYWx5c2lzLm1vdmVzLmxlbmd0aCxcbiAgICAgIGNvbmZpZyBcbiAgICB9KTtcbiAgICBcbiAgICBpZiAoYW5hbHlzaXMuaWdub3JlZCB8fCBhbmFseXNpcy5tb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnTm8gYW5hbHl6ZWQgbW92ZXMgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByYW5kb21Tb3VyY2UgPSBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VEZXRlcm1pbmlzdGljUm5nXG4gICAgICA/IGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZShcbiAgICAgICAgICBidWlsZERldGVybWluaXN0aWNTZWVkKHtcbiAgICAgICAgICAgIGdhbWVTdGFydEZlbjogY29udGV4dC5nYW1lU3RhcnRGZW4sXG4gICAgICAgICAgICBjdXJyZW50RmVuOiBjb250ZXh0LmZlbixcbiAgICAgICAgICAgIG1vdmVDb3VudDogY29udGV4dC5tb3ZlQ291bnQsXG4gICAgICAgICAgICBzaWRlVG9Nb3ZlOiBjb250ZXh0LnNpZGVUb01vdmUsXG4gICAgICAgICAgICBwZXJzb25hOiBjb250ZXh0LnBlcnNvbmEsXG4gICAgICAgICAgfSksXG4gICAgICAgIClcbiAgICAgIDogY3JlYXRlTGVnYWN5UmFuZG9tU291cmNlKCk7XG5cbiAgICBsZXQgZWZmZWN0aXZlQ29uZmlnOiBCdWNrZXRDb25maWcgPSB7IC4uLmNvbmZpZyB9O1xuXG4gICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZVBvc2l0aW9uQ29tcGxleGl0eSkge1xuICAgICAgZWZmZWN0aXZlQ29uZmlnID0gYWRqdXN0QnVja2V0Q29uZmlnRm9yQ29tcGxleGl0eShlZmZlY3RpdmVDb25maWcsIGFuYWx5c2lzLmNvbXBsZXhpdHkpO1xuICAgIH1cblxuICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VQZXJzb25hQmVoYXZpb3JCaWFzKSB7XG4gICAgICBlZmZlY3RpdmVDb25maWcgPSBhcHBseVBlcnNvbmFCdWNrZXRCaWFzKGVmZmVjdGl2ZUNvbmZpZywgY29udGV4dC5wZXJzb25hKSBhcyBCdWNrZXRDb25maWc7XG4gICAgfVxuXG4gICAgaWYgKGNhblVzZUJyaWxsaWFudE1vdmVCdWRnZXQoY29udGV4dC5tb3ZlQ291bnQsIGNvbnRleHQuZmVuKSkge1xuICAgICAgY29uc3QgYnJpbGxpYW50Q2FuZGlkYXRlcyA9IGdldEJyaWxsaWFudE1vdmVDYW5kaWRhdGVzKGNvbnRleHQuZmVuLCBhbmFseXNpcy5tb3Zlcyk7XG4gICAgICBjb25zdCBzaG91bGRQaWNrQnJpbGxpYW50ID0gYnJpbGxpYW50Q2FuZGlkYXRlcy5sZW5ndGggPiAwICYmIHJhbmRvbVNvdXJjZS5uZXh0KCkgPCAwLjM1O1xuXG4gICAgICBpZiAoc2hvdWxkUGlja0JyaWxsaWFudCkge1xuICAgICAgICBjb25zdCBicmlsbGlhbnRNb3ZlID0gcGlja0JyaWxsaWFudE1vdmUoYnJpbGxpYW50Q2FuZGlkYXRlcywgcmFuZG9tU291cmNlKTtcblxuICAgICAgICBpZiAoYnJpbGxpYW50TW92ZSkge1xuICAgICAgICAgIGNvbnN0IGJyaWxsaWFudFJlc3VsdCA9IHtcbiAgICAgICAgICAgIG1vdmU6IGJyaWxsaWFudE1vdmUsXG4gICAgICAgICAgICBidWNrZXQ6IGJyaWxsaWFudE1vdmUuYnVja2V0LFxuICAgICAgICAgICAgaXNCcmlsbGlhbnQ6IHRydWUsXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFBpY2tlZE1vdmUgPSBicmlsbGlhbnRSZXN1bHQ7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gYnJpbGxpYW50UmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVja2V0U2VsZWN0aW9uID0gZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb25cbiAgICAgID8gcGlja0J1Y2tldFdpdGhDbG9zZXN0RmFsbGJhY2soYW5hbHlzaXMubW92ZXMsIGVmZmVjdGl2ZUNvbmZpZywgKCkgPT4gcmFuZG9tU291cmNlLm5leHQoKSlcbiAgICAgIDogcGlja0J1Y2tldExlZ2FjeShhbmFseXNpcy5tb3ZlcywgZWZmZWN0aXZlQ29uZmlnLCAoKSA9PiByYW5kb21Tb3VyY2UubmV4dCgpKTtcblxuICAgIGlmICghYnVja2V0U2VsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3RlZE1vdmUgPSBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VQZXJzb25hQmVoYXZpb3JCaWFzXG4gICAgICA/IHBpY2tQZXJzb25hQmlhc2VkTW92ZShjb250ZXh0LmZlbiwgYnVja2V0U2VsZWN0aW9uLm1vdmVzLCBjb250ZXh0LnBlcnNvbmEsIHJhbmRvbVNvdXJjZSlcbiAgICAgIDogcGlja1JhbmRvbU1vdmVGcm9tQnVja2V0KGJ1Y2tldFNlbGVjdGlvbiwgKCkgPT4gcmFuZG9tU291cmNlLm5leHQoKSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICBtb3ZlOiBzZWxlY3RlZE1vdmUsXG4gICAgICBidWNrZXQ6IGJ1Y2tldFNlbGVjdGlvbi5idWNrZXQsXG4gICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgfTtcbiAgICBsb2dnZXIuZGVidWcoJ1BpY2tlZCBtb3ZlOicsIHJlc3VsdCk7XG4gICAgXG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5sYXN0UGlja2VkTW92ZSA9IHJlc3VsdDtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBjdXJyZW50IGFuYWx5c2lzXG4gICAqL1xuICBzdG9wQW5hbHlzaXMoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdzdG9wQW5hbHlzaXMgY2FsbGVkJyk7XG4gICAgdGhpcy5jb29yZGluYXRvci5zdG9wKCk7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5pc01vdmVMYW5lQW5hbHl6aW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmlzQmFja2dyb3VuZEFuYWx5emluZyA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHRoaXMuaW52YWxpZGF0ZVBlbmRpbmdSZXF1ZXN0cygpO1xuICAgIHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zLmVuZ2luZU1vdmUgPSBudWxsO1xuICAgIHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zLmJhY2tncm91bmQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGEgbmV3IGdhbWVcbiAgICovXG4gIG5ld0dhbWUoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCduZXdHYW1lIGNhbGxlZCcpO1xuICAgIHRoaXMuY29vcmRpbmF0b3IubmV3R2FtZSgpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBzdGF0ZVxuICAgKi9cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdyZXNldCBjYWxsZWQnKTtcbiAgICB0aGlzLmNvb3JkaW5hdG9yLnN0b3AoKTtcbiAgICB0aGlzLmludmFsaWRhdGVQZW5kaW5nUmVxdWVzdHMoKTtcbiAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVucy5lbmdpbmVNb3ZlID0gbnVsbDtcbiAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVucy5iYWNrZ3JvdW5kID0gbnVsbDtcbiAgICB0aGlzLmFuYWx5emVkTW92ZXMgPSBbXTtcbiAgICB0aGlzLmxhc3RQaWNrZWRNb3ZlID0gbnVsbDtcbiAgICB0aGlzLmxhc3RDb21wbGV4aXR5ID0gbnVsbDtcbiAgICB0aGlzLmxhc3RBbmFseXNpc0Zyb21DYWNoZSA9IGZhbHNlO1xuICAgIHRoaXMubGFzdEFuYWx5c2lzUHVycG9zZSA9IG51bGw7XG4gICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgdGhpcy5pc01vdmVMYW5lQW5hbHl6aW5nID0gZmFsc2U7XG4gICAgdGhpcy5pc0JhY2tncm91bmRBbmFseXppbmcgPSBmYWxzZTtcbiAgICB0aGlzLmlzSW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGVycm9yIG1lc3NhZ2VcbiAgICovXG4gIHNldEVycm9yKG1lc3NhZ2U6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLmVycm9yID0gbWVzc2FnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbW92ZSBzdGF0aXN0aWNzIGJ5IGJ1Y2tldFxuICAgKi9cbiAgZ2V0IG1vdmVTdGF0cygpOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gICAgcmV0dXJuIGdldE1vdmVTdGF0cyh0aGlzLmFuYWx5emVkTW92ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBtb3ZlcyBncm91cGVkIGJ5IGJ1Y2tldFxuICAgKi9cbiAgZ2V0IG1vdmVzQnlCdWNrZXQoKTogTWFwPE1vdmVCdWNrZXQsIENsYXNzaWZpZWRNb3ZlW10+IHtcbiAgICByZXR1cm4gZ3JvdXBNb3Zlc0J5QnVja2V0KHRoaXMuYW5hbHl6ZWRNb3Zlcyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBiZXN0IG1vdmUgKGlmIGF2YWlsYWJsZSlcbiAgICovXG4gIGdldCBiZXN0TW92ZSgpOiBDbGFzc2lmaWVkTW92ZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmFuYWx5emVkTW92ZXMubGVuZ3RoID4gMCA/IHRoaXMuYW5hbHl6ZWRNb3Zlc1swXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlcmUgYXJlIGFuYWx5emVkIG1vdmVzXG4gICAqL1xuICBnZXQgaGFzQW5hbHl6ZWRNb3ZlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hbmFseXplZE1vdmVzLmxlbmd0aCA+IDA7XG4gIH1cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIGVuZ2luZVxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ2Rlc3Ryb3kgY2FsbGVkJyk7XG4gICAgdGhpcy5jb29yZGluYXRvci5kZXN0cm95KCk7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5pc0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHBlcmZvcm1Qb3NpdGlvbkFuYWx5c2lzKG9wdGlvbnM6IHtcbiAgICBmZW46IHN0cmluZztcbiAgICBkZXB0aDogbnVtYmVyO1xuICAgIG11bHRpUFY6IG51bWJlcjtcbiAgICBjYWNoZUtleTogc3RyaW5nO1xuICAgIHJlcXVlc3RJZDogbnVtYmVyO1xuICAgIHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZTtcbiAgICBsYW5lOiBFbmdpbmVMYW5lO1xuICB9KTogUHJvbWlzZTxQb3NpdGlvbkFuYWx5c2lzUmVzdWx0PiB7XG4gICAgY29uc3QgeyBmZW4sIGRlcHRoLCBtdWx0aVBWLCBjYWNoZUtleSwgcmVxdWVzdElkLCBwdXJwb3NlLCBsYW5lIH0gPSBvcHRpb25zO1xuICAgIGxldCBjYWNoZWRDbGFzc2lmaWVkTW92ZXM6IENsYXNzaWZpZWRNb3ZlW10gfCB1bmRlZmluZWQ7XG4gICAgbGV0IGZyb21DYWNoZSA9IGZhbHNlO1xuICAgIGxldCBtb3ZlczogQW5hbHl6ZWRNb3ZlW10gPSBbXTtcblxuICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VNb3ZlQW5hbHlzaXNDYWNoZSkge1xuICAgICAgY29uc3QgY2FjaGVkID0gYW5hbHlzaXNDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICBtb3ZlcyA9IGNhY2hlZC5tb3ZlcztcbiAgICAgICAgY2FjaGVkQ2xhc3NpZmllZE1vdmVzID0gY2FjaGVkLmNsYXNzaWZpZWRNb3ZlcztcbiAgICAgICAgZnJvbUNhY2hlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmNvb3JkaW5hdG9yLmNvbmZpZ3VyZShsYW5lLCB7IGRlcHRoLCBtdWx0aVBWIH0pO1xuICAgICAgbG9nZ2VyLmRlYnVnKCdTdGFydGluZyBhbmFseXNpcy4uLicpO1xuICAgICAgbW92ZXMgPSBhd2FpdCB0aGlzLmNvb3JkaW5hdG9yLmFuYWx5emVQb3NpdGlvbihsYW5lLCBmZW4pO1xuICAgICAgbG9nZ2VyLmRlYnVnKCdBbmFseXNpcyBjb21wbGV0ZSwgZ290JywgbW92ZXMubGVuZ3RoLCAnbW92ZXMnKTtcblxuICAgICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZU1vdmVBbmFseXNpc0NhY2hlKSB7XG4gICAgICAgIGFuYWx5c2lzQ2FjaGUuc2V0KHtcbiAgICAgICAgICBrZXk6IGNhY2hlS2V5LFxuICAgICAgICAgIG1vdmVzLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnVXNpbmcgY2FjaGVkIGFuYWx5c2lzIGZvciBjdXJyZW50IHBvc2l0aW9uJyk7XG4gICAgfVxuXG4gICAgY29uc3QgY2xhc3NpZmllZCA9IGNhY2hlZENsYXNzaWZpZWRNb3ZlcyA/PyBjbGFzc2lmeU1vdmVzKG1vdmVzKTtcbiAgICBjb25zdCBjb21wbGV4aXR5ID0gY2FsY3VsYXRlUG9zaXRpb25Db21wbGV4aXR5KG1vdmVzKTtcbiAgICBjb25zdCBpZ25vcmVkID0gaXNTdGFsZUFuYWx5c2lzUmVxdWVzdChyZXF1ZXN0SWQsIHRoaXMubGF0ZXN0UmVxdWVzdElkc1twdXJwb3NlXSk7XG5cbiAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlTW92ZUFuYWx5c2lzQ2FjaGUgJiYgbW92ZXMubGVuZ3RoID4gMCkge1xuICAgICAgYW5hbHlzaXNDYWNoZS5zZXQoe1xuICAgICAgICBrZXk6IGNhY2hlS2V5LFxuICAgICAgICBtb3ZlcyxcbiAgICAgICAgY2xhc3NpZmllZE1vdmVzOiBjbGFzc2lmaWVkLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWlnbm9yZWQpIHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5sYXN0QW5hbHlzaXNGcm9tQ2FjaGUgPSBmcm9tQ2FjaGU7XG4gICAgICAgIHRoaXMubGFzdEFuYWx5c2lzUHVycG9zZSA9IHB1cnBvc2U7XG4gICAgICAgIGlmIChwdXJwb3NlID09PSAnZW5naW5lTW92ZScpIHtcbiAgICAgICAgICB0aGlzLmFuYWx5emVkTW92ZXMgPSBjbGFzc2lmaWVkO1xuICAgICAgICAgIHRoaXMubGFzdENvbXBsZXhpdHkgPSBjb21wbGV4aXR5O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0TGFuZUFuYWx5emluZyhwdXJwb3NlLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zW3B1cnBvc2VdPy5wdXJwb3NlID09PSBwdXJwb3NlKSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0TGFuZUFuYWx5emluZyhwdXJwb3NlLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVxdWVzdElkLFxuICAgICAgYW5hbHl6ZWRGZW46IGZlbixcbiAgICAgIG1vdmVzOiBjbGFzc2lmaWVkLFxuICAgICAgY29tcGxleGl0eSxcbiAgICAgIGlnbm9yZWQsXG4gICAgICBmcm9tQ2FjaGUsXG4gICAgICBwdXJwb3NlLFxuICAgIH07XG4gIH1cblxuICBnZXQgYW5hbHlzaXNTdGF0dXNMYWJlbCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmVycm9yKSB7XG4gICAgICByZXR1cm4gJ0VuZ2luZSBlcnJvcic7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNJbml0aWFsaXppbmcpIHtcbiAgICAgIHJldHVybiAnU3RhcnRpbmcgZW5naW5lJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc01vdmVMYW5lQW5hbHl6aW5nKSB7XG4gICAgICByZXR1cm4gJ0FuYWx5emluZyBwb3NpdGlvbic7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNCYWNrZ3JvdW5kQW5hbHl6aW5nKSB7XG4gICAgICByZXR1cm4gJ1J1bm5pbmcgYmFja2dyb3VuZCBhbmFseXNpcyc7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybiAnTm90IGluaXRpYWxpemVkJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5sYXN0QW5hbHlzaXNQdXJwb3NlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJ1JlYWR5JztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5sYXN0QW5hbHlzaXNGcm9tQ2FjaGUgPyAnUmVhZHkgKGNhY2hlIHdhcm0pJyA6ICdSZWFkeSc7XG4gIH1cblxuICBnZXQgaXNBbmFseXppbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNNb3ZlTGFuZUFuYWx5emluZyB8fCB0aGlzLmlzQmFja2dyb3VuZEFuYWx5emluZztcbiAgfVxuXG4gIGdldCBpc01vdmVMYW5lQnVzeSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0luaXRpYWxpemluZyB8fCB0aGlzLmlzTW92ZUxhbmVBbmFseXppbmc7XG4gIH1cblxuICBnZXQgaXNCYWNrZ3JvdW5kTGFuZUJ1c3koKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNCYWNrZ3JvdW5kQW5hbHl6aW5nO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZhbGlkYXRlUGVuZGluZ1JlcXVlc3RzKCk6IHZvaWQge1xuICAgIHRoaXMubGF0ZXN0UmVxdWVzdElkcy5lbmdpbmVNb3ZlID0gKyt0aGlzLm5leHRSZXF1ZXN0SWRzLmVuZ2luZU1vdmU7XG4gICAgdGhpcy5sYXRlc3RSZXF1ZXN0SWRzLmJhY2tncm91bmQgPSArK3RoaXMubmV4dFJlcXVlc3RJZHMuYmFja2dyb3VuZDtcbiAgfVxuXG4gIHByaXZhdGUgaW52YWxpZGF0ZVB1cnBvc2VSZXF1ZXN0KHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSk6IHZvaWQge1xuICAgIHRoaXMubGF0ZXN0UmVxdWVzdElkc1twdXJwb3NlXSA9ICsrdGhpcy5uZXh0UmVxdWVzdElkc1twdXJwb3NlXTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TGFuZUZvclB1cnBvc2UocHVycG9zZTogQW5hbHlzaXNQdXJwb3NlKTogRW5naW5lTGFuZSB7XG4gICAgcmV0dXJuIHB1cnBvc2UgPT09ICdlbmdpbmVNb3ZlJyA/ICdtb3ZlJyA6ICdhbmFseXNpcyc7XG4gIH1cblxuICBwcml2YXRlIHNldExhbmVBbmFseXppbmcocHVycG9zZTogQW5hbHlzaXNQdXJwb3NlLCBhbmFseXppbmc6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAocHVycG9zZSA9PT0gJ2VuZ2luZU1vdmUnKSB7XG4gICAgICB0aGlzLmlzTW92ZUxhbmVBbmFseXppbmcgPSBhbmFseXppbmc7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5pc0JhY2tncm91bmRBbmFseXppbmcgPSBhbmFseXppbmc7XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgZW5naW5lVmlld01vZGVsID0gbmV3IEVuZ2luZVZpZXdNb2RlbCgpO1xuIiwgIi8qKlxuICogQ29uZmlnIFZpZXdNb2RlbFxuICogVmlld01vZGVsIGxheWVyIC0gTW9iWCBzdG9yZSBmb3IgYnVja2V0IGNvbmZpZ3VyYXRpb25cbiAqL1xuXG5pbXBvcnQgeyBtYWtlQXV0b09ic2VydmFibGUsIGFjdGlvbiwgcmVhY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IEJ1Y2tldENvbmZpZywgTW92ZUJ1Y2tldCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLCBNb3ZlUXVhbGl0eVByZXNldElkLCBNT1ZFX1FVQUxJVFlfUFJFU0VUUyB9IGZyb20gJy4uL2VuZ2luZS90eXBlcyc7XG5pbXBvcnQgeyBFTkdJTkVfQ09ORklHX1NUT1JBR0VfS0VZIH0gZnJvbSAnLi4vZW5naW5lL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7IG5vcm1hbGl6ZUJ1Y2tldENvbmZpZywgdmFsaWRhdGVCdWNrZXRDb25maWcgfSBmcm9tICcuLi9lbmdpbmUvbW92ZVBpY2tlcic7XG5pbXBvcnQgeyBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gJy4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwnO1xuXG5pbnRlcmZhY2UgUGVyc2lzdGVkRW5naW5lQ29uZmlnIHtcbiAgYnVja2V0Q29uZmlnOiBCdWNrZXRDb25maWc7XG4gIGN1cnJlbnRQcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGw7XG4gIGRlcHRoOiBudW1iZXI7XG4gIG11bHRpUFY6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIENvbmZpZ1ZpZXdNb2RlbCB7XG4gIGJ1Y2tldENvbmZpZzogQnVja2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcgfTtcbiAgLyoqIElkIG9mIHRoZSBhY3RpdmUgcHJlc2V0LCBvciBudWxsIGlmIHVzaW5nIGN1c3RvbSBkaXN0cmlidXRpb24gKi9cbiAgY3VycmVudFByZXNldElkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbCA9ICdtZWRpdW0nO1xuICBkZXB0aCA9IDg7XG4gIG11bHRpUFYgPSAxMjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0QnVja2V0VmFsdWU6IGFjdGlvbixcbiAgICAgIHNldEJ1Y2tldENvbmZpZzogYWN0aW9uLFxuICAgICAgYXBwbHlQcm9maWxlU25hcHNob3Q6IGFjdGlvbixcbiAgICAgIGFwcGx5UHJlc2V0OiBhY3Rpb24sXG4gICAgICByZXNldFRvRGVmYXVsdHM6IGFjdGlvbixcbiAgICAgIG5vcm1hbGl6ZUNvbmZpZzogYWN0aW9uLFxuICAgICAgc2V0RGVwdGg6IGFjdGlvbixcbiAgICAgIHNldE11bHRpUFY6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG5cbiAgICByZWFjdGlvbihcbiAgICAgICgpID0+ICh7XG4gICAgICAgIGJ1Y2tldENvbmZpZzogdGhpcy5idWNrZXRDb25maWcsXG4gICAgICAgIGN1cnJlbnRQcmVzZXRJZDogdGhpcy5jdXJyZW50UHJlc2V0SWQsXG4gICAgICAgIGRlcHRoOiB0aGlzLmRlcHRoLFxuICAgICAgICBtdWx0aVBWOiB0aGlzLm11bHRpUFYsXG4gICAgICAgIHBlcnNpc3RFbmdpbmVDb25maWc6IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnBlcnNpc3RFbmdpbmVDb25maWcsXG4gICAgICB9KSxcbiAgICAgICh7IHBlcnNpc3RFbmdpbmVDb25maWcgfSkgPT4ge1xuICAgICAgICBpZiAoIXBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgICB0aGlzLmNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgICAgfSxcbiAgICAgIHsgZmlyZUltbWVkaWF0ZWx5OiB0cnVlIH0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHBlcmNlbnRhZ2UgdmFsdWUgZm9yIGEgc3BlY2lmaWMgYnVja2V0XG4gICAqL1xuICBzZXRCdWNrZXRWYWx1ZShidWNrZXQ6IE1vdmVCdWNrZXQsIHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjbGFtcGVkVmFsdWUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIHZhbHVlKSk7XG4gICAgdGhpcy5jdXJyZW50UHJlc2V0SWQgPSBudWxsOyAvLyBzd2l0Y2hpbmcgdG8gY3VzdG9tXG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJ1Y2tldENvbmZpZyxcbiAgICAgIFtidWNrZXRdOiBjbGFtcGVkVmFsdWUsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGZ1bGwgYnVja2V0IGNvbmZpZyAoZS5nLiB3aGVuIGFwcGx5aW5nIGEgcHJlc2V0KVxuICAgKi9cbiAgc2V0QnVja2V0Q29uZmlnKGNvbmZpZzogQnVja2V0Q29uZmlnKTogdm9pZCB7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLmNvbmZpZyB9O1xuICB9XG5cbiAgYXBwbHlQcm9maWxlU25hcHNob3Qoc25hcHNob3Q6IHtcbiAgICBidWNrZXRDb25maWc6IEJ1Y2tldENvbmZpZztcbiAgICBjdXJyZW50UHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsO1xuICAgIGRlcHRoOiBudW1iZXI7XG4gICAgbXVsdGlQVjogbnVtYmVyO1xuICB9KTogdm9pZCB7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLnNuYXBzaG90LmJ1Y2tldENvbmZpZyB9O1xuICAgIHRoaXMuY3VycmVudFByZXNldElkID0gc25hcHNob3QuY3VycmVudFByZXNldElkO1xuICAgIHRoaXMuZGVwdGggPSBNYXRoLm1heCgxLCBNYXRoLm1pbigzMCwgc25hcHNob3QuZGVwdGgpKTtcbiAgICB0aGlzLm11bHRpUFYgPSBNYXRoLm1heCgxLCBNYXRoLm1pbigyMCwgc25hcHNob3QubXVsdGlQVikpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IGEgcHJlZGVmaW5lZCBtb3ZlIHF1YWxpdHkgcHJlc2V0IGJ5IGlkXG4gICAqL1xuICBhcHBseVByZXNldChwcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCk6IHZvaWQge1xuICAgIGNvbnN0IHByZXNldCA9IE1PVkVfUVVBTElUWV9QUkVTRVRTLmZpbmQocCA9PiBwLmlkID09PSBwcmVzZXRJZCk7XG4gICAgaWYgKHByZXNldCkge1xuICAgICAgdGhpcy5jdXJyZW50UHJlc2V0SWQgPSBwcmVzZXRJZDtcbiAgICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5wcmVzZXQuY29uZmlnIH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IGJ1Y2tldCBjb25maWd1cmF0aW9uIHRvIGRlZmF1bHRzIChtZWRpdW0gcHJlc2V0KVxuICAgKi9cbiAgcmVzZXRUb0RlZmF1bHRzKCk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudFByZXNldElkID0gJ21lZGl1bSc7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZSB0aGUgY29uZmlndXJhdGlvbiBzbyBwZXJjZW50YWdlcyBzdW0gdG8gMTAwXG4gICAqL1xuICBub3JtYWxpemVDb25maWcoKTogdm9pZCB7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSBub3JtYWxpemVCdWNrZXRDb25maWcodGhpcy5idWNrZXRDb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbmFseXNpcyBkZXB0aFxuICAgKi9cbiAgc2V0RGVwdGgodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuZGVwdGggPSBNYXRoLm1heCgxLCBNYXRoLm1pbigzMCwgdmFsdWUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgTXVsdGlQViB2YWx1ZVxuICAgKi9cbiAgc2V0TXVsdGlQVih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5tdWx0aVBWID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMjAsIHZhbHVlKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRvdGFsIHBlcmNlbnRhZ2Ugc3VtXG4gICAqL1xuICBnZXQgdG90YWxQZXJjZW50YWdlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5idWNrZXRDb25maWcpLnJlZHVjZSgoc3VtLCB2YWwpID0+IHN1bSArIHZhbCwgMCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgY29uZmlndXJhdGlvbiBpcyB2YWxpZCAoc3VtcyB0byAxMDApXG4gICAqL1xuICBnZXQgaXNWYWxpZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHZhbGlkIH0gPSB2YWxpZGF0ZUJ1Y2tldENvbmZpZyh0aGlzLmJ1Y2tldENvbmZpZyk7XG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdmFsaWRhdGlvbiBzdGF0ZVxuICAgKi9cbiAgZ2V0IHZhbGlkYXRpb25TdGF0ZSgpOiB7IHZhbGlkOiBib29sZWFuOyB0b3RhbDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB2YWxpZGF0ZUJ1Y2tldENvbmZpZyh0aGlzLmJ1Y2tldENvbmZpZyk7XG4gIH1cblxuICBnZXQgYWN0aXZlUGVyc29uYUlkKCk6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UHJlc2V0SWQ7XG4gIH1cblxuICBnZXQgYWN0aXZlUGVyc29uYUxhYmVsKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuY3VycmVudFByZXNldElkID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJ0N1c3RvbSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1PVkVfUVVBTElUWV9QUkVTRVRTLmZpbmQoKHByZXNldCkgPT4gcHJlc2V0LmlkID09PSB0aGlzLmN1cnJlbnRQcmVzZXRJZCk/LmxhYmVsID8/ICdDdXN0b20nO1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZCkgYXMgUGFydGlhbDxQZXJzaXN0ZWRFbmdpbmVDb25maWc+O1xuICAgICAgaWYgKHBhcnNlZC5idWNrZXRDb25maWcpIHtcbiAgICAgICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRywgLi4ucGFyc2VkLmJ1Y2tldENvbmZpZyB9O1xuICAgICAgfVxuICAgICAgaWYgKHBhcnNlZC5jdXJyZW50UHJlc2V0SWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRQcmVzZXRJZCA9IHBhcnNlZC5jdXJyZW50UHJlc2V0SWQ7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhcnNlZC5kZXB0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgdGhpcy5kZXB0aCA9IE1hdGgubWF4KDEsIE1hdGgubWluKDMwLCBwYXJzZWQuZGVwdGgpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGFyc2VkLm11bHRpUFYgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHRoaXMubXVsdGlQViA9IE1hdGgubWF4KDEsIE1hdGgubWluKDIwLCBwYXJzZWQubXVsdGlQVikpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQ29uZmlnVmlld01vZGVsXSBGYWlsZWQgdG8gcmVzdG9yZSBlbmdpbmUgY29uZmlnOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNuYXBzaG90OiBQZXJzaXN0ZWRFbmdpbmVDb25maWcgPSB7XG4gICAgICAgIGJ1Y2tldENvbmZpZzogdGhpcy5idWNrZXRDb25maWcsXG4gICAgICAgIGN1cnJlbnRQcmVzZXRJZDogdGhpcy5jdXJyZW50UHJlc2V0SWQsXG4gICAgICAgIGRlcHRoOiB0aGlzLmRlcHRoLFxuICAgICAgICBtdWx0aVBWOiB0aGlzLm11bHRpUFYsXG4gICAgICB9O1xuXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShFTkdJTkVfQ09ORklHX1NUT1JBR0VfS0VZLCBKU09OLnN0cmluZ2lmeShzbmFwc2hvdCkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQ29uZmlnVmlld01vZGVsXSBGYWlsZWQgdG8gcGVyc2lzdCBlbmdpbmUgY29uZmlnOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDb25maWdWaWV3TW9kZWxdIEZhaWxlZCB0byBjbGVhciBlbmdpbmUgY29uZmlnIHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBTaW5nbGV0b24gaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBjb25maWdWaWV3TW9kZWwgPSBuZXcgQ29uZmlnVmlld01vZGVsKCk7XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IE1vdmVRdWFsaXR5UHJlc2V0SWQgfSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuXG50eXBlIFNldHRpbmdzVGFiSWQgPVxuICB8ICdnZW5lcmFsJ1xuICB8ICdlbmdpbmUnXG4gIHwgJ3BlcnNvbmFsaXR5J1xuICB8ICdicmlsbGlhbnQnXG4gIHwgJ2FkdmFuY2VkJ1xuICB8ICdkZWJ1ZydcbiAgfCAnYWJvdXQnO1xuXG50eXBlIEFuaW1hdGlvblNwZWVkID0gJ3Nsb3cnIHwgJ25vcm1hbCcgfCAnZmFzdCc7XG50eXBlIFRoZW1lTW9kZSA9ICdkYXJrJyB8ICdsaWdodCcgfCAnbWluaW1hbCcgfCAncGVyc29uYSc7XG50eXBlIEJvYXJkU2l6ZVByZXNldCA9ICdzbWFsbCcgfCAnbWVkaXVtJyB8ICdsYXJnZScgfCAneGxhcmdlJztcbnR5cGUgQXV0b1BsYXlTcGVlZCA9ICdzbG93JyB8ICdub3JtYWwnIHwgJ2Zhc3QnO1xuXG5jb25zdCBCT0FSRF9TSVpFX1BSRVNFVF9QSVhFTFM6IFJlY29yZDxCb2FyZFNpemVQcmVzZXQsIG51bWJlcj4gPSB7XG4gIHNtYWxsOiA0ODAsXG4gIG1lZGl1bTogNjQwLFxuICBsYXJnZTogODAwLFxuICB4bGFyZ2U6IDk2MCxcbn07XG5cbmludGVyZmFjZSBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzIHtcbiAgYmFzaWNNb2RlOiBib29sZWFuO1xuICBhbmltYXRpb25TcGVlZDogQW5pbWF0aW9uU3BlZWQ7XG4gIHNvdW5kRW5hYmxlZDogYm9vbGVhbjtcbiAgc291bmRNdXRlZDogYm9vbGVhbjtcbiAgc291bmRWb2x1bWU6IG51bWJlcjtcbiAgYXV0b1BsYXlTcGVlZDogQXV0b1BsYXlTcGVlZDtcbiAgdGhlbWVNb2RlOiBUaGVtZU1vZGU7XG4gIGJvYXJkU2l6ZVByZXNldDogQm9hcmRTaXplUHJlc2V0O1xuICBzZWxlY3RlZFNldHRpbmdzVGFiOiBTZXR0aW5nc1RhYklkO1xufVxuXG5jb25zdCBVSV9QUkVGRVJFTkNFU19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfdWlfcHJlZmVyZW5jZXMnO1xuXG5jb25zdCBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTOiBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzID0ge1xuICBiYXNpY01vZGU6IHRydWUsXG4gIGFuaW1hdGlvblNwZWVkOiAnbm9ybWFsJyxcbiAgc291bmRFbmFibGVkOiB0cnVlLFxuICBzb3VuZE11dGVkOiBmYWxzZSxcbiAgc291bmRWb2x1bWU6IDcwLFxuICBhdXRvUGxheVNwZWVkOiAnbm9ybWFsJyxcbiAgdGhlbWVNb2RlOiAnZGFyaycsXG4gIGJvYXJkU2l6ZVByZXNldDogJ21lZGl1bScsXG4gIHNlbGVjdGVkU2V0dGluZ3NUYWI6ICdnZW5lcmFsJyxcbn07XG5cbmNvbnN0IEFVVE9fUExBWV9TUEVFRF9ERUxBWVM6IFJlY29yZDxBdXRvUGxheVNwZWVkLCBudW1iZXI+ID0ge1xuICBzbG93OiAxMjAwLFxuICBub3JtYWw6IDcwMCxcbiAgZmFzdDogMzUwLFxufTtcblxuZXhwb3J0IGNsYXNzIFVpU3RhdGVWaWV3TW9kZWwge1xuICBzZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgYmFzaWNNb2RlID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5iYXNpY01vZGU7XG4gIGFuaW1hdGlvblNwZWVkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5hbmltYXRpb25TcGVlZDtcbiAgc291bmRFbmFibGVkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZEVuYWJsZWQ7XG4gIHNvdW5kTXV0ZWQgPSBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnNvdW5kTXV0ZWQ7XG4gIHNvdW5kVm9sdW1lID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZFZvbHVtZTtcbiAgYXV0b1BsYXlTcGVlZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYXV0b1BsYXlTcGVlZDtcbiAgdGhlbWVNb2RlID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy50aGVtZU1vZGU7XG4gIGJvYXJkU2l6ZVByZXNldCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYm9hcmRTaXplUHJlc2V0O1xuICBzZWxlY3RlZFNldHRpbmdzVGFiOiBTZXR0aW5nc1RhYklkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zZWxlY3RlZFNldHRpbmdzVGFiO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXRTZXR0aW5nc09wZW46IGFjdGlvbixcbiAgICAgIGFwcGx5UHJvZmlsZVByZWZlcmVuY2VzOiBhY3Rpb24sXG4gICAgICBzZXRCYXNpY01vZGU6IGFjdGlvbixcbiAgICAgIHNldEFuaW1hdGlvblNwZWVkOiBhY3Rpb24sXG4gICAgICBzZXRTb3VuZEVuYWJsZWQ6IGFjdGlvbixcbiAgICAgIHNldFNvdW5kTXV0ZWQ6IGFjdGlvbixcbiAgICAgIHNldFNvdW5kVm9sdW1lOiBhY3Rpb24sXG4gICAgICBzZXRBdXRvUGxheVNwZWVkOiBhY3Rpb24sXG4gICAgICBzZXRUaGVtZU1vZGU6IGFjdGlvbixcbiAgICAgIHNldEJvYXJkU2l6ZVByZXNldDogYWN0aW9uLFxuICAgICAgc2V0U2VsZWN0ZWRTZXR0aW5nc1RhYjogYWN0aW9uLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZXN0b3JlRnJvbVN0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNldHRpbmdzT3BlbihvcGVuOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBvcGVuO1xuICB9XG5cbiAgYXBwbHlQcm9maWxlUHJlZmVyZW5jZXMocHJlZmVyZW5jZXM6IFBhcnRpYWw8UGljazxQZXJzaXN0ZWRVaVByZWZlcmVuY2VzLCAnYmFzaWNNb2RlJyB8ICd0aGVtZU1vZGUnPj4pOiB2b2lkIHtcbiAgICB0aGlzLmJhc2ljTW9kZSA9IHByZWZlcmVuY2VzLmJhc2ljTW9kZSA/PyB0aGlzLmJhc2ljTW9kZTtcbiAgICB0aGlzLnRoZW1lTW9kZSA9IHByZWZlcmVuY2VzLnRoZW1lTW9kZSA/PyB0aGlzLnRoZW1lTW9kZTtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldEJhc2ljTW9kZShlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5iYXNpY01vZGUgPSBlbmFibGVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0QW5pbWF0aW9uU3BlZWQoc3BlZWQ6IEFuaW1hdGlvblNwZWVkKTogdm9pZCB7XG4gICAgdGhpcy5hbmltYXRpb25TcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U291bmRFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNvdW5kRW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTb3VuZE11dGVkKG11dGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zb3VuZE11dGVkID0gbXV0ZWQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTb3VuZFZvbHVtZSh2b2x1bWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc291bmRWb2x1bWUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIE1hdGgucm91bmQodm9sdW1lKSkpO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0QXV0b1BsYXlTcGVlZChzcGVlZDogQXV0b1BsYXlTcGVlZCk6IHZvaWQge1xuICAgIHRoaXMuYXV0b1BsYXlTcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0VGhlbWVNb2RlKHRoZW1lTW9kZTogVGhlbWVNb2RlKTogdm9pZCB7XG4gICAgdGhpcy50aGVtZU1vZGUgPSB0aGVtZU1vZGU7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRCb2FyZFNpemVQcmVzZXQoYm9hcmRTaXplUHJlc2V0OiBCb2FyZFNpemVQcmVzZXQpOiB2b2lkIHtcbiAgICB0aGlzLmJvYXJkU2l6ZVByZXNldCA9IGJvYXJkU2l6ZVByZXNldDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkU2V0dGluZ3NUYWIodGFiOiBTZXR0aW5nc1RhYklkKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZFNldHRpbmdzVGFiID0gdGFiO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oVUlfUFJFRkVSRU5DRVNfU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKCFzYXZlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzIFBhcnRpYWw8UGVyc2lzdGVkVWlQcmVmZXJlbmNlcz47XG4gICAgICB0aGlzLmJhc2ljTW9kZSA9IHBhcnNlZC5iYXNpY01vZGUgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5iYXNpY01vZGU7XG4gICAgICB0aGlzLmFuaW1hdGlvblNwZWVkID0gcGFyc2VkLmFuaW1hdGlvblNwZWVkID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYW5pbWF0aW9uU3BlZWQ7XG4gICAgICB0aGlzLnNvdW5kRW5hYmxlZCA9IHBhcnNlZC5zb3VuZEVuYWJsZWQgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZEVuYWJsZWQ7XG4gICAgICB0aGlzLnNvdW5kTXV0ZWQgPSBwYXJzZWQuc291bmRNdXRlZCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnNvdW5kTXV0ZWQ7XG4gICAgICB0aGlzLnNvdW5kVm9sdW1lID0gdHlwZW9mIHBhcnNlZC5zb3VuZFZvbHVtZSA9PT0gJ251bWJlcidcbiAgICAgICAgPyBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIE1hdGgucm91bmQocGFyc2VkLnNvdW5kVm9sdW1lKSkpXG4gICAgICAgIDogREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZFZvbHVtZTtcbiAgICAgIHRoaXMuYXV0b1BsYXlTcGVlZCA9IHBhcnNlZC5hdXRvUGxheVNwZWVkID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYXV0b1BsYXlTcGVlZDtcbiAgICAgIHRoaXMudGhlbWVNb2RlID0gcGFyc2VkLnRoZW1lTW9kZSA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnRoZW1lTW9kZTtcbiAgICAgIHRoaXMuYm9hcmRTaXplUHJlc2V0ID0gcGFyc2VkLmJvYXJkU2l6ZVByZXNldCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmJvYXJkU2l6ZVByZXNldDtcbiAgICAgIHRoaXMuc2VsZWN0ZWRTZXR0aW5nc1RhYiA9IHBhcnNlZC5zZWxlY3RlZFNldHRpbmdzVGFiID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc2VsZWN0ZWRTZXR0aW5nc1RhYjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBpbnZhbGlkIFVJIHByZWZlcmVuY2Ugc25hcHNob3RzLlxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGVyc2lzdFRvU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgIFVJX1BSRUZFUkVOQ0VTX1NUT1JBR0VfS0VZLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgYmFzaWNNb2RlOiB0aGlzLmJhc2ljTW9kZSxcbiAgICAgICAgICBhbmltYXRpb25TcGVlZDogdGhpcy5hbmltYXRpb25TcGVlZCxcbiAgICAgICAgICBzb3VuZEVuYWJsZWQ6IHRoaXMuc291bmRFbmFibGVkLFxuICAgICAgICAgIHNvdW5kTXV0ZWQ6IHRoaXMuc291bmRNdXRlZCxcbiAgICAgICAgICBzb3VuZFZvbHVtZTogdGhpcy5zb3VuZFZvbHVtZSxcbiAgICAgICAgICBhdXRvUGxheVNwZWVkOiB0aGlzLmF1dG9QbGF5U3BlZWQsXG4gICAgICAgICAgdGhlbWVNb2RlOiB0aGlzLnRoZW1lTW9kZSxcbiAgICAgICAgICBib2FyZFNpemVQcmVzZXQ6IHRoaXMuYm9hcmRTaXplUHJlc2V0LFxuICAgICAgICAgIHNlbGVjdGVkU2V0dGluZ3NUYWI6IHRoaXMuc2VsZWN0ZWRTZXR0aW5nc1RhYixcbiAgICAgICAgfSBhcyBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzKSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgbG9jYWxTdG9yYWdlIGlzc3VlcyBhbmQga2VlcCBVSSByZXNwb25zaXZlLlxuICAgIH1cbiAgfVxuXG4gIGdldCBib2FyZFNpemVQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiBCT0FSRF9TSVpFX1BSRVNFVF9QSVhFTFNbdGhpcy5ib2FyZFNpemVQcmVzZXRdO1xuICB9XG5cbiAgZ2V0IGF1dG9QbGF5RGVsYXlNcygpOiBudW1iZXIge1xuICAgIHJldHVybiBBVVRPX1BMQVlfU1BFRURfREVMQVlTW3RoaXMuYXV0b1BsYXlTcGVlZF07XG4gIH1cblxuICBnZXQgZWZmZWN0aXZlU291bmRWb2x1bWUoKTogbnVtYmVyIHtcbiAgICBpZiAoIXRoaXMuc291bmRFbmFibGVkIHx8IHRoaXMuc291bmRNdXRlZCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc291bmRWb2x1bWUgLyAxMDA7XG4gIH1cblxuICBnZXRQZXJzb25hQWNjZW50VG9uZShwZXJzb25hSWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsKTogJ3JlZCcgfCAnZ29sZCcgfCAnYmx1ZScgfCAnZ3JlZW4nIHtcbiAgICBzd2l0Y2ggKHBlcnNvbmFJZCkge1xuICAgICAgY2FzZSAnYWdncmVzc2l2ZSc6XG4gICAgICAgIHJldHVybiAncmVkJztcbiAgICAgIGNhc2UgJ2hhcmQnOlxuICAgICAgY2FzZSAnc3VwZXJfaGFyZCc6XG4gICAgICAgIHJldHVybiAnZ29sZCc7XG4gICAgICBjYXNlICdsb3cnOlxuICAgICAgICByZXR1cm4gJ2dyZWVuJztcbiAgICAgIGNhc2UgJ21lZGl1bSc6XG4gICAgICBjYXNlIG51bGw6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ2JsdWUnO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgdWlTdGF0ZVZpZXdNb2RlbCA9IG5ldyBVaVN0YXRlVmlld01vZGVsKCk7XG5cbmV4cG9ydCB7IEJPQVJEX1NJWkVfUFJFU0VUX1BJWEVMUyB9O1xuZXhwb3J0IHR5cGUgeyBBbmltYXRpb25TcGVlZCwgQXV0b1BsYXlTcGVlZCwgQm9hcmRTaXplUHJlc2V0LCBTZXR0aW5nc1RhYklkLCBUaGVtZU1vZGUgfTtcbiIsICIvKipcbiAqIEJvYXJkIFZpZXdNb2RlbFxuICogVmlld01vZGVsIGxheWVyIC0gTW9iWCBzdG9yZSBmb3IgY2hlc3MgYm9hcmQgc3RhdGVcbiAqL1xuXG5pbXBvcnQgeyBtYWtlQXV0b09ic2VydmFibGUsIGFjdGlvbiwgcmVhY3Rpb24sIHJ1bkluQWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBDaGVzcywgTW92ZSwgU3F1YXJlIH0gZnJvbSAnY2hlc3MuanMnO1xuaW1wb3J0IHsgY2FuQXBwbHlBbmFseXplZE1vdmUgfSBmcm9tICcuLi9lbmdpbmUvYW5hbHlzaXNTYWZldHknO1xuaW1wb3J0IHsgZGVyaXZlQnJpbGxpYW50VXNhZ2UsIE1vdmVBbm5vdGF0aW9uIH0gZnJvbSAnLi4vZW5naW5lL2JyaWxsaWFudFRyYWNraW5nJztcbmltcG9ydCB7IFBlcnNpc3RlZEJvYXJkU3RhdGUsIGNyZWF0ZUdhbWVTZXNzaW9uSWQsIHJlc29sdmVQZ25TdGFydEZlbiB9IGZyb20gJy4uL2VuZ2luZS9nYW1lU2Vzc2lvbic7XG5pbXBvcnQgeyBHYW1lU2V0dXBQcmVzZXQgfSBmcm9tICcuLi9lbmdpbmUvZ2FtZVNldHVwUHJlc2V0cyc7XG5pbXBvcnQgeyBlbmdpbmVWaWV3TW9kZWwgfSBmcm9tICcuL0VuZ2luZVZpZXdNb2RlbCc7XG5pbXBvcnQgeyBjb25maWdWaWV3TW9kZWwgfSBmcm9tICcuL0NvbmZpZ1ZpZXdNb2RlbCc7XG5pbXBvcnQgeyBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gJy4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwnO1xuaW1wb3J0IHsgY3JlYXRlRGVidWdMb2dnZXIgfSBmcm9tICcuLi9zaGFyZWQvZGVidWcnO1xuaW1wb3J0IHtcbiAgUGlja2VkTW92ZVJlc3VsdCxcbiAgTW92ZUJ1Y2tldCxcbiAgRGlzcGxheU1vdmVCdWNrZXQsXG4gIERJU1BMQVlfQlVDS0VUX0xBQkVMUyxcbiAgQlVDS0VUX0xBQkVMUyxcbiAgQlVDS0VUX0NPTE9SUyxcbiAgRElTUExBWV9CVUNLRVRfQ09MT1JTLFxufSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuaW1wb3J0IHsgY2FsY3VsYXRlSHVtYW5EZWxheU1zIH0gZnJvbSAnLi4vZW5naW5lL3BlcnNvbmFCaWFzJztcbmltcG9ydCB7IG1hcExlZ2FsTW92ZXNUb0J1Y2tldHMgfSBmcm9tICcuLi9lbmdpbmUvbW92ZUNsYXNzaWZpZXInO1xuaW1wb3J0IHsgdWlTdGF0ZVZpZXdNb2RlbCB9IGZyb20gJy4vVWlTdGF0ZVZpZXdNb2RlbCc7XG5cbmNvbnN0IGxvZ2dlciA9IGNyZWF0ZURlYnVnTG9nZ2VyKCdCb2FyZFZpZXdNb2RlbCcpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlY2VudE1vdmVGZWVkYmFjayB7XG4gIGlkOiBzdHJpbmc7XG4gIGFjdG9yOiAncGxheWVyJyB8ICdlbmdpbmUnIHwgJ3JlZG8nO1xuICBzYW46IHN0cmluZztcbiAgcXVhbGl0eUxhYmVsPzogc3RyaW5nIHwgbnVsbDtcbiAgYnVja2V0PzogRGlzcGxheU1vdmVCdWNrZXQgfCBNb3ZlQnVja2V0IHwgbnVsbDtcbiAgaXNCcmlsbGlhbnQ6IGJvb2xlYW47XG4gIGlzQ2FwdHVyZTogYm9vbGVhbjtcbiAgaXNDaGVjazogYm9vbGVhbjtcbiAgaXNHYW1lRW5kOiBib29sZWFuO1xuICBzaWxlbnQ6IGJvb2xlYW47XG4gIGNyZWF0ZWRBdDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQm9hcmRWaWV3TW9kZWwge1xuICBwcml2YXRlIGNoZXNzOiBDaGVzcyA9IG5ldyBDaGVzcygpO1xuICBmZW4gPSB0aGlzLmNoZXNzLmZlbigpO1xuICBnYW1lU3RhcnRGZW4gPSB0aGlzLmNoZXNzLmZlbigpO1xuICBnYW1lU2Vzc2lvbklkID0gY3JlYXRlR2FtZVNlc3Npb25JZCgpO1xuICBzZXNzaW9uU3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgaGlzdG9yeTogTW92ZVtdID0gW107XG4gIGxhc3RNb3ZlOiB7IGZyb206IFNxdWFyZTsgdG86IFNxdWFyZSB9IHwgbnVsbCA9IG51bGw7XG4gIGxhc3RQbGF5ZWRCdWNrZXQ6IE1vdmVCdWNrZXQgfCBudWxsID0gbnVsbDtcbiAgc3RhdHVzTWVzc2FnZSA9ICdSZWFkeSc7XG4gIGxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2U6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBpc1RoaW5raW5nID0gZmFsc2U7XG4gIGF1dG9QbGF5RW5hYmxlZCA9IHRydWU7IC8vIEF1dG8tcGxheSBlbmdpbmUgbW92ZXMgYWZ0ZXIgaHVtYW4gbW92ZXNcbiAgZW5naW5lUGxheXNGb3I6ICd3JyB8ICdiJyA9ICdiJzsgLy8gV2hpY2ggc2lkZSB0aGUgZW5naW5lIHBsYXlzIGZvciAoZGVmYXVsdDogYmxhY2spXG4gIGJvYXJkRmxpcHBlZCA9IGZhbHNlOyAvLyBCb2FyZCBvcmllbnRhdGlvbiAoZmFsc2UgPSB3aGl0ZSBvbiBib3R0b20sIHRydWUgPSBibGFjayBvbiBib3R0b20pXG4gIHNob3dNb3ZlQXJyb3dzID0gZmFsc2U7IC8vIFNob3cgYXJyb3dzIGZvciBhbGwgcG9zc2libGUgbW92ZXNcbiAgc2hvd0Fycm93c0ZvclNpZGU6ICdjdXJyZW50JyB8ICdwbGF5ZXInIHwgJ2VuZ2luZScgPSAnY3VycmVudCc7IC8vIFdoaWNoIHNpZGUncyBtb3ZlcyB0byBzaG93IGFycm93cyBmb3JcbiAgbGFzdFBsYXllck1vdmVRdWFsaXR5OiBEaXNwbGF5TW92ZUJ1Y2tldCB8IG51bGwgPSBudWxsOyAvLyBRdWFsaXR5IG9mIHRoZSBsYXN0IHBsYXllciBtb3ZlXG4gIGlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTsgLy8gV2hldGhlciB3ZSdyZSBjdXJyZW50bHkgYW5hbHl6aW5nIG1vdmVzXG4gIGF1dG9QbGF5UGF1c2VkID0gZmFsc2U7XG4gIGF1dG9QbGF5U2NoZWR1bGVkRm9yID0gMDtcbiAgY3VycmVudFNldHVwTmFtZSA9ICdOZXcgR2FtZSc7XG4gIGN1cnJlbnRTZXR1cENhdGVnb3J5ID0gJ2N1c3RvbSc7XG4gIHJlY2VudE1vdmVGZWVkYmFjazogUmVjZW50TW92ZUZlZWRiYWNrIHwgbnVsbCA9IG51bGw7XG4gIGF1dG9QbGF5QWNjdW11bGF0ZWRNcyA9IDA7XG4gIGF1dG9QbGF5TGFzdFJlc3VtZWRBdDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIFxuICAvLyBTdG9yZSBhbmFseXplZCBtb3ZlcyBhcyBhbiBvYmplY3QgZm9yIE1vYlggb2JzZXJ2YWJpbGl0eVxuICBwcml2YXRlIF9hbmFseXplZExlZ2FsTW92ZXM6IFJlY29yZDxzdHJpbmcsIERpc3BsYXlNb3ZlQnVja2V0PiA9IHt9O1xuICBwcml2YXRlIHJlZG9TdGFjazogTW92ZVtdID0gW107IC8vIFN0YWNrIG9mIG1vdmVzIHRoYXQgd2VyZSB1bmRvbmUgZm9yIHJlZG8gZnVuY3Rpb25hbGl0eVxuICBwcml2YXRlIGhpc3RvcnlBbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSA9IFtdO1xuICBwcml2YXRlIHJlZG9Bbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSA9IFtdO1xuICBwcml2YXRlIGFuYWx5emVkTGVnYWxNb3Zlc0Zlbjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2FuYWx5c2lzVGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDsgLy8gVGltZW91dCBmb3IgZGVib3VuY2luZyBtb3ZlIGFuYWx5c2lzXG4gIHByaXZhdGUgX2F1dG9QbGF5VGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfcGxheWVyTW92ZUFuYWx5c2lzVGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBGRU5fU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX2N1cnJlbnRfZmVuJztcbiAgcHJpdmF0ZSByZWFkb25seSBGRU5fSElTVE9SWV9LRVkgPSAncGVyc29uYWNoZXNzX2Zlbl9oaXN0b3J5JztcbiAgcHJpdmF0ZSByZWFkb25seSBCT0FSRF9TVEFURV9TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfYm9hcmRfc3RhdGUnO1xuICBwcml2YXRlIHJlYWRvbmx5IE1BWF9ISVNUT1JZID0gNTA7IC8vIE1heGltdW0gbnVtYmVyIG9mIEZFTiBwb3NpdGlvbnMgdG8gc3RvcmVcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgbG9hZEZlbjogYWN0aW9uLFxuICAgICAgbG9hZFBnbjogYWN0aW9uLFxuICAgICAgbG9hZEdhbWVTZXR1cFByZXNldDogYWN0aW9uLFxuICAgICAgbWFrZU1vdmU6IGFjdGlvbixcbiAgICAgIHNvbHZlTmV4dE1vdmU6IGFjdGlvbixcbiAgICAgIHJlc2V0OiBhY3Rpb24sXG4gICAgICB1bmRvOiBhY3Rpb24sXG4gICAgICB1bmRvU2luZ2xlOiBhY3Rpb24sXG4gICAgICByZWRvU2luZ2xlOiBhY3Rpb24sXG4gICAgICBzZXRBdXRvUGxheTogYWN0aW9uLFxuICAgICAgc2V0QXV0b1BsYXlQYXVzZWQ6IGFjdGlvbixcbiAgICAgIHN0YXJ0QXV0b1BsYXlUdXJuOiBhY3Rpb24sXG4gICAgICB0b2dnbGVBdXRvUGxheVBhdXNlOiBhY3Rpb24sXG4gICAgICBzZXRFbmdpbmVQbGF5c0ZvcjogYWN0aW9uLFxuICAgICAgZmxpcEJvYXJkOiBhY3Rpb24sXG4gICAgICBzZXRCb2FyZEZsaXBwZWQ6IGFjdGlvbixcbiAgICAgIHNhdmVGZW5Ub0hpc3Rvcnk6IGFjdGlvbixcbiAgICAgIGxvYWRGZW5Gcm9tSGlzdG9yeTogYWN0aW9uLFxuICAgICAgdG9nZ2xlTW92ZUFycm93czogYWN0aW9uLFxuICAgICAgc2V0U2hvd01vdmVBcnJvd3NFbmFibGVkOiBhY3Rpb24sXG4gICAgICBzZXRTaG93QXJyb3dzRm9yU2lkZTogYWN0aW9uLFxuICAgICAgYW5hbHl6ZUFsbE1vdmVzOiBhY3Rpb24sXG4gICAgICBhbmFseXplUGxheWVyTW92ZTogYWN0aW9uLFxuICAgIH0pO1xuICAgIFxuICAgIC8vIFRyeSB0byByZXN0b3JlIEZFTiBmcm9tIGxvY2FsU3RvcmFnZSBvbiBpbml0aWFsaXphdGlvblxuICAgIHRoaXMucmVzdG9yZUZlbkZyb21TdG9yYWdlKCk7XG5cbiAgICByZWFjdGlvbihcbiAgICAgICgpID0+IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnBlcnNpc3RFbmdpbmVDb25maWcsXG4gICAgICAocGVyc2lzdEVuZ2luZUNvbmZpZykgPT4ge1xuICAgICAgICBpZiAoIXBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgICB0aGlzLmNsZWFyUGVyc2lzdGVkQm9hcmRTdGF0ZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2F2ZUZlblRvSGlzdG9yeSgpO1xuICAgICAgfSxcbiAgICAgIHsgZmlyZUltbWVkaWF0ZWx5OiB0cnVlIH0sXG4gICAgKTtcbiAgICBcbiAgICBsb2dnZXIuZGVidWcoJ0luaXRpYWxpemVkIHdpdGggRkVOOicsIHRoaXMuZmVuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYXV0by1wbGF5IG1vZGVcbiAgICovXG4gIHNldEF1dG9QbGF5KGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheUVuYWJsZWQgJiYgIWVuYWJsZWQpIHtcbiAgICAgIHRoaXMuc3RvcEF1dG9QbGF5RHVyYXRpb25UcmFja2luZygpO1xuICAgIH1cblxuICAgIHRoaXMuYXV0b1BsYXlFbmFibGVkID0gZW5hYmxlZDtcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgIHRoaXMuYXV0b1BsYXlQYXVzZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhcnRBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTtcbiAgICB9XG5cbiAgICB0aGlzLnN5bmNBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgbG9nZ2VyLmRlYnVnKCdBdXRvLXBsYXkgc2V0IHRvOicsIGVuYWJsZWQpO1xuICB9XG5cbiAgc2V0QXV0b1BsYXlQYXVzZWQocGF1c2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHBhdXNlZCkge1xuICAgICAgdGhpcy5zdG9wQXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhcnRBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTtcbiAgICB9XG5cbiAgICB0aGlzLmF1dG9QbGF5UGF1c2VkID0gcGF1c2VkO1xuICAgIGlmIChwYXVzZWQpIHtcbiAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3luY0F1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdGFydEF1dG9QbGF5VHVybigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuY2FuU3RhcnRBdXRvUGxheVR1cm4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIGF3YWl0IHRoaXMuc29sdmVOZXh0TW92ZSh0cnVlKTtcbiAgfVxuXG4gIHRvZ2dsZUF1dG9QbGF5UGF1c2UoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRBdXRvUGxheVBhdXNlZCghdGhpcy5hdXRvUGxheVBhdXNlZCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoaWNoIHNpZGUgdGhlIGVuZ2luZSBwbGF5cyBmb3JcbiAgICovXG4gIHNldEVuZ2luZVBsYXlzRm9yKHNpZGU6ICd3JyB8ICdiJyk6IHZvaWQge1xuICAgIHRoaXMuZW5naW5lUGxheXNGb3IgPSBzaWRlO1xuICAgIHRoaXMuc3luY0F1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICBsb2dnZXIuZGVidWcoJ0VuZ2luZSBwbGF5cyBmb3I6Jywgc2lkZSA9PT0gJ3cnID8gJ1doaXRlJyA6ICdCbGFjaycpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgYSBwb3NpdGlvbiBmcm9tIEZFTiBzdHJpbmdcbiAgICovXG4gIGxvYWRGZW4oXG4gICAgZmVuOiBzdHJpbmcsXG4gICAgb3B0aW9uczoge1xuICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZz86IGJvb2xlYW47XG4gICAgICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG4gICAgICBnYW1lU3RhcnRGZW4/OiBzdHJpbmc7XG4gICAgICBoaXN0b3J5QW5ub3RhdGlvbnM/OiBNb3ZlQW5ub3RhdGlvbltdO1xuICAgICAgcmVkb0Fubm90YXRpb25zPzogTW92ZUFubm90YXRpb25bXTtcbiAgICAgIHNldHVwTmFtZT86IHN0cmluZztcbiAgICAgIHNldHVwQ2F0ZWdvcnk/OiBzdHJpbmc7XG4gICAgfSA9IHt9LFxuICApOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qge1xuICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nID0gdHJ1ZSxcbiAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICBnYW1lU3RhcnRGZW4sXG4gICAgICAgIGhpc3RvcnlBbm5vdGF0aW9ucyxcbiAgICAgICAgcmVkb0Fubm90YXRpb25zLFxuICAgICAgICBzZXR1cE5hbWUsXG4gICAgICAgIHNldHVwQ2F0ZWdvcnksXG4gICAgICB9ID0gb3B0aW9ucztcbiAgICAgIGxvZ2dlci5kZWJ1ZygnbG9hZEZlbiBjYWxsZWQ6JywgZmVuKTtcbiAgICAgIGNvbnN0IG5ld0NoZXNzID0gbmV3IENoZXNzKGZlbik7XG4gICAgICB0aGlzLmNoZXNzID0gbmV3Q2hlc3M7XG4gICAgICB0aGlzLmJlZ2luU2Vzc2lvblN0YXRlKHtcbiAgICAgICAgZ2FtZVNlc3Npb25JZDogc2Vzc2lvbklkID8/IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKSxcbiAgICAgICAgZ2FtZVN0YXJ0RmVuOiBnYW1lU3RhcnRGZW4gPz8gZmVuLFxuICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nLFxuICAgICAgICBoaXN0b3J5QW5ub3RhdGlvbnMsXG4gICAgICAgIHJlZG9Bbm5vdGF0aW9ucyxcbiAgICAgICAgc2V0dXBOYW1lLFxuICAgICAgICBzZXR1cENhdGVnb3J5LFxuICAgICAgfSk7XG4gICAgICB0aGlzLnJlc2V0VHJhbnNpZW50Qm9hcmRTdGF0ZSgpO1xuICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ1Bvc2l0aW9uIGxvYWRlZCc7XG4gICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgICAgdGhpcy5yZWNlbnRNb3ZlRmVlZGJhY2sgPSBudWxsO1xuICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICBsb2dnZXIuZGVidWcoJ0ZFTiBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignbG9hZEZlbiBlcnJvcjonLCBlcnIpO1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYEludmFsaWQgRkVOOiAke2Vycn1gO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIGEgZ2FtZSBmcm9tIFBHTiBzdHJpbmdcbiAgICovXG4gIGxvYWRQZ24oXG4gICAgcGduOiBzdHJpbmcsXG4gICAgb3B0aW9uczoge1xuICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZz86IGJvb2xlYW47XG4gICAgICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG4gICAgICBzZXR1cE5hbWU/OiBzdHJpbmc7XG4gICAgICBzZXR1cENhdGVnb3J5Pzogc3RyaW5nO1xuICAgIH0gPSB7fSxcbiAgKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZyA9IHRydWUsXG4gICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgc2V0dXBOYW1lLFxuICAgICAgICBzZXR1cENhdGVnb3J5LFxuICAgICAgfSA9IG9wdGlvbnM7XG4gICAgICBsb2dnZXIuZGVidWcoJ2xvYWRQZ24gY2FsbGVkJyk7XG4gICAgICBjb25zdCBuZXdDaGVzcyA9IG5ldyBDaGVzcygpO1xuICAgICAgbmV3Q2hlc3MubG9hZFBnbihwZ24pO1xuICAgICAgY29uc3QgZ2FtZVN0YXJ0RmVuID0gcmVzb2x2ZVBnblN0YXJ0RmVuKG5ld0NoZXNzLmhlYWRlcigpLCBuZXcgQ2hlc3MoKS5mZW4oKSk7XG4gICAgICB0aGlzLmNoZXNzID0gbmV3Q2hlc3M7XG4gICAgICB0aGlzLmJlZ2luU2Vzc2lvblN0YXRlKHtcbiAgICAgICAgZ2FtZVNlc3Npb25JZDogc2Vzc2lvbklkID8/IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKSxcbiAgICAgICAgZ2FtZVN0YXJ0RmVuLFxuICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nLFxuICAgICAgICBzZXR1cE5hbWUsXG4gICAgICAgIHNldHVwQ2F0ZWdvcnksXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVzZXRUcmFuc2llbnRCb2FyZFN0YXRlKCk7XG4gICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnUEdOIGxvYWRlZCc7XG4gICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgICAgdGhpcy5yZWNlbnRNb3ZlRmVlZGJhY2sgPSBudWxsO1xuICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignbG9hZFBnbiBlcnJvcjonLCBlcnIpO1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYEludmFsaWQgUEdOOiAke2Vycn1gO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGxvYWRHYW1lU2V0dXBQcmVzZXQocHJlc2V0OiBHYW1lU2V0dXBQcmVzZXQpOiBib29sZWFuIHtcbiAgICBjb25zdCBzaWRlTGFiZWwgPSBwcmVzZXQuc2lkZSA9PT0gJ3doaXRlJyA/ICdXaGl0ZScgOiAnQmxhY2snO1xuICAgIGNvbnN0IGxvYWRlZCA9IHByZXNldC5zb3VyY2VUeXBlID09PSAnZmVuJ1xuICAgICAgPyB0aGlzLmxvYWRGZW4ocHJlc2V0LnNvdXJjZSwge1xuICAgICAgICAgIHNldHVwTmFtZTogcHJlc2V0Lm5hbWUsXG4gICAgICAgICAgc2V0dXBDYXRlZ29yeTogcHJlc2V0LmNhdGVnb3J5LFxuICAgICAgICB9KVxuICAgICAgOiB0aGlzLmxvYWRQZ24ocHJlc2V0LnNvdXJjZSwge1xuICAgICAgICAgIHNldHVwTmFtZTogcHJlc2V0Lm5hbWUsXG4gICAgICAgICAgc2V0dXBDYXRlZ29yeTogcHJlc2V0LmNhdGVnb3J5LFxuICAgICAgICB9KTtcblxuICAgIGlmIChsb2FkZWQpIHtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGAke3ByZXNldC5uYW1lfSBsb2FkZWQgKCR7c2lkZUxhYmVsfSlgO1xuICAgIH1cblxuICAgIHJldHVybiBsb2FkZWQ7XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBhIG1vdmUgb24gdGhlIGJvYXJkIChzaW1pbGFyIHRvIHRoZSBleGFtcGxlIHBhdHRlcm4pXG4gICAqIFRoaXMgaXMgc3luY2hyb25vdXMgZm9yIGltbWVkaWF0ZSBVSSBmZWVkYmFjaywganVzdCBsaWtlIHRoZSBleGFtcGxlXG4gICAqL1xuICBtYWtlTW92ZShmcm9tOiBTcXVhcmUsIHRvOiBTcXVhcmUsIHByb21vdGlvbiA9ICdxJyk6IGJvb2xlYW4ge1xuICAgIGxvZ2dlci5kZWJ1ZygnbWFrZU1vdmUgY2FsbGVkJywgeyBmcm9tLCB0bywgcHJvbW90aW9uLCBjdXJyZW50RmVuOiB0aGlzLmZlbiwgY3VycmVudFR1cm46IHRoaXMuY2hlc3MudHVybigpIH0pO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAvLyBUcnkgdG8gbWFrZSB0aGUgbW92ZSBhY2NvcmRpbmcgdG8gY2hlc3MuanMgbG9naWMgKGV4YWN0bHkgbGlrZSB0aGUgZXhhbXBsZSlcbiAgICAgIC8vIGNoZXNzLmpzIHdpbGwgdmFsaWRhdGUgdGhlIG1vdmUgYXV0b21hdGljYWxseVxuICAgICAgY29uc3QgbW92ZSA9IHRoaXMuY2hlc3MubW92ZSh7XG4gICAgICAgIGZyb20sXG4gICAgICAgIHRvLFxuICAgICAgICBwcm9tb3Rpb246IHByb21vdGlvbiBhcyAncScgfCAncicgfCAnYicgfCAnbicgfCB1bmRlZmluZWQsXG4gICAgICB9KTtcblxuICAgICAgaWYgKG1vdmUpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdNb3ZlIHN1Y2Nlc3NmdWw6JywgbW92ZS5zYW4pO1xuICAgICAgICAvLyBDbGVhciByZWRvIHN0YWNrIHdoZW4gYSBuZXcgbW92ZSBpcyBtYWRlXG4gICAgICAgIHRoaXMuY2xlYXJSZWRvU3RhdGUoKTtcbiAgICAgICAgdGhpcy5yZWNvcmRNb3ZlQW5ub3RhdGlvbihtb3ZlLCBmYWxzZSwgJ3BsYXllcicpO1xuICAgICAgICAvLyBVcGRhdGUgdGhlIHBvc2l0aW9uIHN0YXRlIHRvIHRyaWdnZXIgYSByZS1yZW5kZXIgKHZpYSBNb2JYIG9ic2VydmFibGUpXG4gICAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IHsgZnJvbSwgdG8gfTtcbiAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYFlvdSBwbGF5ZWQ6ICR7bW92ZS5zYW59YDtcbiAgICAgICAgdGhpcy5wdWJsaXNoTW92ZUZlZWRiYWNrKHtcbiAgICAgICAgICBhY3RvcjogJ3BsYXllcicsXG4gICAgICAgICAgbW92ZSxcbiAgICAgICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcblxuICAgICAgICBjb25zdCBzaG91bGRBdXRvUGxheU5vdyA9XG4gICAgICAgICAgdGhpcy5hdXRvUGxheUVuYWJsZWRcbiAgICAgICAgICAmJiAhdGhpcy5pc0dhbWVPdmVyXG4gICAgICAgICAgJiYgdGhpcy5jaGVzcy50dXJuKCkgPT09IHRoaXMuZW5naW5lUGxheXNGb3I7XG5cbiAgICAgICAgLy8gTWFrZSBlbmdpbmUgbW92ZSBhZnRlciBhIHNob3J0IGRlbGF5IGlmOlxuICAgICAgICAvLyAxLiBBdXRvLXBsYXkgaXMgZW5hYmxlZFxuICAgICAgICAvLyAyLiBHYW1lIGlzIG5vdCBvdmVyXG4gICAgICAgIC8vIDMuIEl0J3Mgbm93IHRoZSBlbmdpbmUncyB0dXJuICh0aGUgdHVybiBjaGFuZ2VkIGFmdGVyIHRoZSBodW1hbiBtb3ZlKVxuICAgICAgICBpZiAoc2hvdWxkQXV0b1BsYXlOb3cpIHtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ1NjaGVkdWxpbmcgYXV0by1wbGF5IGZvciBlbmdpbmUgc2lkZTonLCB0aGlzLmVuZ2luZVBsYXlzRm9yKTtcbiAgICAgICAgICB0aGlzLnNjaGVkdWxlQXV0b1BsYXlNb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWZlciBwbGF5ZXItbW92ZSBncmFkaW5nIHdoaWxlIGFuIGVuZ2luZSBhdXRvLXBsYXkgcmVwbHkgaXMgcGVuZGluZyBzb1xuICAgICAgICAvLyB0aGUgc2hhcmVkIFN0b2NrZmlzaCB3b3JrZXIgY2FuIHByaW9yaXRpemUgdGhlIGFjdHVhbCBtb3ZlIHJlc3BvbnNlLlxuICAgICAgICB0aGlzLnNjaGVkdWxlUGxheWVyTW92ZUFuYWx5c2lzKG1vdmUpO1xuICAgICAgICBcbiAgICAgICAgLy8gUmV0dXJuIHRydWUgYXMgdGhlIG1vdmUgd2FzIHN1Y2Nlc3NmdWxcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ01vdmUgZmFpbGVkIC0gY2hlc3MuanMgcmV0dXJuZWQgbnVsbCcpO1xuICAgICAgICAvLyBSZXR1cm4gZmFsc2UgYXMgdGhlIG1vdmUgd2FzIG5vdCBzdWNjZXNzZnVsXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnTW92ZSBleGNlcHRpb246JywgZXJyKTtcbiAgICAgIC8vIFJldHVybiBmYWxzZSBhcyB0aGUgbW92ZSB3YXMgbm90IHN1Y2Nlc3NmdWxcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBhIG1vdmUgZnJvbSBVQ0kgbm90YXRpb24gKGUuZy4sIFwiZTJlNFwiKVxuICAgKiBVc2VkIGJ5IHRoZSBlbmdpbmVcbiAgICovXG4gIGFzeW5jIG1ha2VNb3ZlVUNJKFxuICAgIHVjaTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IHsgY29uc3VtZWRCcmlsbGlhbnQ/OiBib29sZWFuIH0gPSB7fSxcbiAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHVjaS5sZW5ndGggPCA0KSByZXR1cm4gZmFsc2U7XG4gICAgXG4gICAgY29uc3QgZnJvbSA9IHVjaS5zbGljZSgwLCAyKSBhcyBTcXVhcmU7XG4gICAgY29uc3QgdG8gPSB1Y2kuc2xpY2UoMiwgNCkgYXMgU3F1YXJlO1xuICAgIGNvbnN0IHByb21vdGlvbiA9IHVjaS5sZW5ndGggPiA0ID8gdWNpWzRdIDogdW5kZWZpbmVkO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgZnJvbSxcbiAgICAgICAgdG8sXG4gICAgICAgIHByb21vdGlvbjogcHJvbW90aW9uIGFzICdxJyB8ICdyJyB8ICdiJyB8ICduJyB8IHVuZGVmaW5lZCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobW92ZSkge1xuICAgICAgICAvLyBDbGVhciByZWRvIHN0YWNrIHdoZW4gYSBuZXcgbW92ZSBpcyBtYWRlXG4gICAgICAgIHRoaXMuY2xlYXJSZWRvU3RhdGUoKTtcbiAgICAgICAgdGhpcy5yZWNvcmRNb3ZlQW5ub3RhdGlvbihtb3ZlLCBvcHRpb25zLmNvbnN1bWVkQnJpbGxpYW50ID8/IGZhbHNlLCAnZW5naW5lJyk7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IHsgZnJvbSwgdG8gfTtcbiAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYEVuZ2luZSBwbGF5ZWQ6ICR7bW92ZS5zYW59YDtcbiAgICAgICAgdGhpcy5wdWJsaXNoTW92ZUZlZWRiYWNrKHtcbiAgICAgICAgICBhY3RvcjogJ2VuZ2luZScsXG4gICAgICAgICAgbW92ZSxcbiAgICAgICAgICBpc0JyaWxsaWFudDogb3B0aW9ucy5jb25zdW1lZEJyaWxsaWFudCA/PyBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU29sdmUgYW5kIHBsYXkgdGhlIG5leHQgbW92ZSB1c2luZyB0aGUgZW5naW5lIGFuZCBidWNrZXQgY29uZmlndXJhdGlvblxuICAgKi9cbiAgYXN5bmMgc29sdmVOZXh0TW92ZShhdXRvVHJpZ2dlcmVkID0gZmFsc2UpOiBQcm9taXNlPFBpY2tlZE1vdmVSZXN1bHQgfCBudWxsPiB7XG4gICAgaWYgKHRoaXMuaXNHYW1lT3Zlcikge1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ0dhbWUgaXMgb3Zlcic7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnRW5naW5lIHRoaW5raW5nLi4uJztcbiAgICAgICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBJbml0aWFsaXplIGVuZ2luZSBpZiBuZWVkZWRcbiAgICAgIGlmICghZW5naW5lVmlld01vZGVsLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgYXdhaXQgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gQW5hbHl6ZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICBjb25zdCBhbmFseXNpcyA9IGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24oXG4gICAgICAgIHRoaXMuZmVuLFxuICAgICAgICBjb25maWdWaWV3TW9kZWwuZGVwdGgsXG4gICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5tdWx0aVBWLFxuICAgICAgICAnZW5naW5lTW92ZScsXG4gICAgICApO1xuXG4gICAgICAvLyBDaGVjayBpZiBhbmFseXNpcyByZXR1cm5lZCBubyBtb3ZlcyAoZ2FtZSBvdmVyIHBvc2l0aW9uKVxuICAgICAgaWYgKGFuYWx5c2lzLmlnbm9yZWQgfHwgYW5hbHlzaXMubW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICBpZiAoYW5hbHlzaXMuaWdub3JlZCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ0VuZ2luZSBhbmFseXNpcyBleHBpcmVkJztcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNDaGVja21hdGUpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdDaGVja21hdGUhIEdhbWUgb3Zlci4nO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1N0YWxlbWF0ZSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ1N0YWxlbWF0ZSEgR2FtZSBvdmVyLic7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRHJhdykge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ0RyYXchIEdhbWUgb3Zlci4nO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnTm8gbGVnYWwgbW92ZXMgYXZhaWxhYmxlJztcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gYW5hbHlzaXMuaWdub3JlZCA/ICdBIG5ld2VyIGVuZ2luZSBhbmFseXNpcyByZXBsYWNlZCB0aGlzIG1vdmUgcmVxdWVzdC4nIDogbnVsbDtcbiAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBQaWNrIGEgbW92ZSBiYXNlZCBvbiBidWNrZXQgY29uZmlndXJhdGlvblxuICAgICAgY29uc3QgcGVyc29uYSA9IGNvbmZpZ1ZpZXdNb2RlbC5jdXJyZW50UHJlc2V0SWQgPz8gJ2N1c3RvbSc7XG4gICAgICBjb25zdCByZXN1bHQgPSBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMoYW5hbHlzaXMsIGNvbmZpZ1ZpZXdNb2RlbC5idWNrZXRDb25maWcsIHtcbiAgICAgICAgZmVuOiB0aGlzLmZlbixcbiAgICAgICAgZ2FtZVN0YXJ0RmVuOiB0aGlzLmdhbWVTdGFydEZlbixcbiAgICAgICAgbW92ZUNvdW50OiB0aGlzLm1vdmVDb3VudCxcbiAgICAgICAgc2lkZVRvTW92ZTogdGhpcy50dXJuLFxuICAgICAgICBwZXJzb25hLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgaWYgKGF1dG9UcmlnZ2VyZWQgJiYgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlSHVtYW5EZWxheVNpbXVsYXRpb24pIHtcbiAgICAgICAgICBjb25zdCBkZWxheU1zID0gY2FsY3VsYXRlSHVtYW5EZWxheU1zKHtcbiAgICAgICAgICAgIGNvbXBsZXhpdHk6IGFuYWx5c2lzLmNvbXBsZXhpdHksXG4gICAgICAgICAgICBwZXJzb25hLFxuICAgICAgICAgICAgYnVja2V0OiByZXN1bHQuYnVja2V0LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGF3YWl0IHRoaXMud2FpdChkZWxheU1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY2FuQXBwbHlBbmFseXplZE1vdmUodGhpcy5mZW4sIGFuYWx5c2lzLmFuYWx5emVkRmVuKSkge1xuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdQb3NpdGlvbiBjaGFuZ2VkLCBzdGFsZSBlbmdpbmUgbW92ZSBkaXNjYXJkZWQnO1xuICAgICAgICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gJ1NraXBwZWQgZW5naW5lIG1vdmUgYmVjYXVzZSB0aGUgYm9hcmQgY2hhbmdlZCBiZWZvcmUgaXQgY291bGQgYmUgcGxheWVkLic7XG4gICAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFwcGx5IHRoZSBwaWNrZWQgbW92ZVxuICAgICAgICBjb25zdCBtb3ZlU3VjY2VzcyA9IGF3YWl0IHRoaXMubWFrZU1vdmVVQ0kocmVzdWx0Lm1vdmUubW92ZSwge1xuICAgICAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiByZXN1bHQuaXNCcmlsbGlhbnQgPz8gZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgaWYgKG1vdmVTdWNjZXNzKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVMYXN0QW5ub3RhdGlvbih7XG4gICAgICAgICAgICBidWNrZXQ6IHJlc3VsdC5idWNrZXQsXG4gICAgICAgICAgICBldmFsTG9zczogcmVzdWx0Lm1vdmUuZXZhbExvc3MsXG4gICAgICAgICAgICBldmFsdWF0aW9uOiByZXN1bHQubW92ZS5ldmFsdWF0aW9uLFxuICAgICAgICAgICAgY29tcGxleGl0eUxldmVsOiBhbmFseXNpcy5jb21wbGV4aXR5LmxldmVsLFxuICAgICAgICAgICAgY29tcGxleGl0eVNjb3JlOiBhbmFseXNpcy5jb21wbGV4aXR5LnNjb3JlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IHJlc3VsdC5idWNrZXQ7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSByZXN1bHQuaXNCcmlsbGlhbnRcbiAgICAgICAgICAgICAgPyAnRW5naW5lIHBsYXllZDogQnJpbGxpYW50IG1vdmUnXG4gICAgICAgICAgICAgIDogYEVuZ2luZSBwbGF5ZWQ6ICR7QlVDS0VUX0xBQkVMU1tyZXN1bHQuYnVja2V0XX0gbW92ZWA7XG4gICAgICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ0VuZ2luZSBtb3ZlIGZhaWxlZCc7XG4gICAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ05vIG1vdmVzIGF2YWlsYWJsZSc7XG4gICAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignc29sdmVOZXh0TW92ZSBlcnJvcjonLCBlcnIpO1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgRXJyb3I6ICR7ZXJyfWA7XG4gICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIGJvYXJkIHRvIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAqL1xuICByZXNldCgpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ3Jlc2V0IGNhbGxlZCcpO1xuICAgIHRoaXMuY2hlc3MgPSBuZXcgQ2hlc3MoKTtcbiAgICB0aGlzLmJlZ2luU2Vzc2lvblN0YXRlKHtcbiAgICAgIGdhbWVTZXNzaW9uSWQ6IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKSxcbiAgICAgIGdhbWVTdGFydEZlbjogdGhpcy5jaGVzcy5mZW4oKSxcbiAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IHRydWUsXG4gICAgICBzZXR1cE5hbWU6ICdOZXcgR2FtZScsXG4gICAgICBzZXR1cENhdGVnb3J5OiAnY3VzdG9tJyxcbiAgICB9KTtcbiAgICB0aGlzLnJlc2V0VHJhbnNpZW50Qm9hcmRTdGF0ZSgpO1xuICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICB0aGlzLmxhc3RNb3ZlID0gbnVsbDtcbiAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdCb2FyZCByZXNldCc7XG4gICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcbiAgICB0aGlzLnJlY2VudE1vdmVGZWVkYmFjayA9IG51bGw7XG4gICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgbG9nZ2VyLmRlYnVnKCdCb2FyZCByZXNldCwgbmV3IEZFTjonLCB0aGlzLmZlbik7XG4gIH1cblxuICAvKipcbiAgICogVW5kbyB0aGUgbGFzdCBtb3ZlIChvciBsYXN0IHR3byBtb3ZlcyBpZiBhdXRvLXBsYXkgaXMgb24gYW5kIGVuZ2luZSBqdXN0IG1vdmVkKVxuICAgKi9cbiAgdW5kbygpOiBib29sZWFuIHtcbiAgICBsb2dnZXIuZGVidWcoJ3VuZG8gY2FsbGVkLCBoaXN0b3J5IGxlbmd0aDonLCB0aGlzLmhpc3RvcnkubGVuZ3RoKTtcbiAgICBcbiAgICAvLyBJZiBhdXRvLXBsYXkgaXMgZW5hYmxlZCBhbmQgdGhlIGxhc3QgbW92ZSB3YXMgYnkgdGhlIGVuZ2luZSwgdW5kbyBib3RoIG1vdmVzXG4gICAgaWYgKHRoaXMuYXV0b1BsYXlFbmFibGVkICYmIHRoaXMuaGlzdG9yeS5sZW5ndGggPj0gMikge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGxhc3QgbW92ZSB3YXMgYnkgdGhlIGVuZ2luZVxuICAgICAgY29uc3QgbGFzdE1vdmUgPSB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5Lmxlbmd0aCAtIDFdO1xuICAgICAgY29uc3QgbGFzdE1vdmVDb2xvciA9IGxhc3RNb3ZlLmNvbG9yO1xuICAgICAgXG4gICAgICAvLyBJZiBsYXN0IG1vdmUgd2FzIGJ5IGVuZ2luZSwgdW5kbyBib3RoIChlbmdpbmUgbW92ZSArIGh1bWFuIG1vdmUpXG4gICAgICBpZiAobGFzdE1vdmVDb2xvciA9PT0gdGhpcy5lbmdpbmVQbGF5c0Zvcikge1xuICAgICAgICBpZiAodGhpcy51bmRvTW92ZXMoMikpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgICAgdGhpcy5sYXN0TW92ZSA9IG51bGw7XG4gICAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnVW5kaWQgbGFzdCAyIG1vdmVzIChodW1hbiArIGVuZ2luZSknO1xuICAgICAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICAgICAgdGhpcy5jbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTtcbiAgICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ1VuZGlkIDIgbW92ZXMnKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTGFzdCBtb3ZlIHdhcyBieSBodW1hbiwganVzdCB1bmRvIG9uZVxuICAgICAgICBpZiAodGhpcy51bmRvTW92ZXMoMSkpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgICAgdGhpcy5sYXN0TW92ZSA9IG51bGw7XG4gICAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnTW92ZSB1bmRvbmUnO1xuICAgICAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICAgICAgdGhpcy5jbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTtcbiAgICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ1VuZGlkIDEgbW92ZScpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF1dG8tcGxheSBkaXNhYmxlZCBvciBub3QgZW5vdWdoIG1vdmVzLCB1bmRvIGp1c3Qgb25lIG1vdmVcbiAgICAgIGlmICh0aGlzLnVuZG9Nb3ZlcygxKSkge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnTW92ZSB1bmRvbmUnO1xuICAgICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgICB0aGlzLmNsZWFyUGVuZGluZ1BsYXllck1vdmVBbmFseXNpcygpO1xuICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdVbmRpZCAxIG1vdmUnKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIGxvZ2dlci5kZWJ1ZygnVW5kbyBmYWlsZWQgLSBubyBtb3ZlcyB0byB1bmRvJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBpbnRlcm5hbCBzdGF0ZSBmcm9tIGNoZXNzIGluc3RhbmNlXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZVN0YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuZmVuID0gdGhpcy5jaGVzcy5mZW4oKTtcbiAgICB0aGlzLmhpc3RvcnkgPSB0aGlzLmNoZXNzLmhpc3RvcnkoeyB2ZXJib3NlOiB0cnVlIH0pO1xuICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID0gbnVsbDtcbiAgICAvLyBTYXZlIEZFTiB0byBsb2NhbFN0b3JhZ2Ugd2hlbmV2ZXIgaXQgY2hhbmdlc1xuICAgIHRoaXMuc2F2ZUZlblRvSGlzdG9yeSgpO1xuICAgIGxvZ2dlci5kZWJ1ZygndXBkYXRlU3RhdGUgLSBGRU46JywgdGhpcy5mZW4sICdIaXN0b3J5IGxlbmd0aDonLCB0aGlzLmhpc3RvcnkubGVuZ3RoKTtcbiAgICBcbiAgICAvLyBBdXRvbWF0aWNhbGx5IHJlLWFuYWx5emUgbW92ZXMgaWYgYXJyb3dzIGFyZSBlbmFibGVkIChkZWJvdW5jZWQgdG8gcHJldmVudCBleGNlc3NpdmUgY2FsbHMpXG4gICAgaWYgKHRoaXMuc2hvd01vdmVBcnJvd3MgJiYgIXRoaXMuaXNHYW1lT3ZlciAmJiAhdGhpcy5pc0FuYWx5emluZ01vdmVzKSB7XG4gICAgICAvLyBDbGVhciBwcmV2aW91cyBhbmFseXNpcyBhbmQgdHJpZ2dlciBuZXcgYW5hbHlzaXMgYXN5bmNocm9ub3VzbHlcbiAgICAgIC8vIFVzZSBzZXRUaW1lb3V0IHRvIGRlYm91bmNlIGFuZCBwcmV2ZW50IHJlLXJlbmRlciBsb29wc1xuICAgICAgdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzID0ge307XG4gICAgICAvLyBDbGVhciBhbnkgcGVuZGluZyBhbmFseXNpcyB0aW1lb3V0XG4gICAgICBpZiAodGhpcy5fYW5hbHlzaXNUaW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9hbmFseXNpc1RpbWVvdXQpO1xuICAgICAgfVxuICAgICAgLy8gRGVib3VuY2UgYW5hbHlzaXMgdG8gcHJldmVudCBleGNlc3NpdmUgY2FsbHNcbiAgICAgIHRoaXMuX2FuYWx5c2lzVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmFuYWx5emVBbGxNb3ZlcygpLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gYW5hbHl6ZSBtb3ZlczonLCBlcnIpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDMwMCk7IC8vIDMwMG1zIGRlYm91bmNlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZsaXAgdGhlIGJvYXJkIG9yaWVudGF0aW9uIGFuZCBlbmdpbmUgcGxheWluZyBjb2xvclxuICAgKi9cbiAgZmxpcEJvYXJkKCk6IHZvaWQge1xuICAgIHRoaXMuYm9hcmRGbGlwcGVkID0gIXRoaXMuYm9hcmRGbGlwcGVkO1xuICAgIC8vIEZsaXAgdGhlIGVuZ2luZSdzIHBsYXlpbmcgY29sb3Igd2hlbiBib2FyZCBpcyBmbGlwcGVkXG4gICAgdGhpcy5lbmdpbmVQbGF5c0ZvciA9IHRoaXMuZW5naW5lUGxheXNGb3IgPT09ICd3JyA/ICdiJyA6ICd3JztcbiAgICBsb2dnZXIuZGVidWcoJ0JvYXJkIGZsaXBwZWQsIG9yaWVudGF0aW9uOicsIHRoaXMuYm9hcmRGbGlwcGVkID8gJ2JsYWNrJyA6ICd3aGl0ZScsICdFbmdpbmUgbm93IHBsYXlzIGZvcjonLCB0aGlzLmVuZ2luZVBsYXlzRm9yID09PSAndycgPyAnV2hpdGUnIDogJ0JsYWNrJyk7XG4gIH1cblxuICBzZXRCb2FyZEZsaXBwZWQoZmxpcHBlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLmJvYXJkRmxpcHBlZCAhPT0gZmxpcHBlZCkge1xuICAgICAgdGhpcy5mbGlwQm9hcmQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBjdXJyZW50IEZFTiB0byBsb2NhbFN0b3JhZ2UgaGlzdG9yeVxuICAgKi9cbiAgc2F2ZUZlblRvSGlzdG9yeSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY3VycmVudEZlbiA9IHRoaXMuZmVuO1xuICAgICAgXG4gICAgICAvLyBTYXZlIGN1cnJlbnQgRkVOXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLkZFTl9TVE9SQUdFX0tFWSwgY3VycmVudEZlbik7XG4gICAgICBcbiAgICAgIC8vIEdldCBleGlzdGluZyBoaXN0b3J5XG4gICAgICBjb25zdCBoaXN0b3J5SnNvbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX0hJU1RPUllfS0VZKTtcbiAgICAgIGxldCBoaXN0b3J5OiBzdHJpbmdbXSA9IGhpc3RvcnlKc29uID8gSlNPTi5wYXJzZShoaXN0b3J5SnNvbikgOiBbXTtcbiAgICAgIFxuICAgICAgaWYgKGhpc3RvcnkubGVuZ3RoID09PSAwIHx8IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSAxXSAhPT0gY3VycmVudEZlbikge1xuICAgICAgICBoaXN0b3J5LnB1c2goY3VycmVudEZlbik7XG5cbiAgICAgICAgaWYgKGhpc3RvcnkubGVuZ3RoID4gdGhpcy5NQVhfSElTVE9SWSkge1xuICAgICAgICAgIGhpc3RvcnkgPSBoaXN0b3J5LnNsaWNlKC10aGlzLk1BWF9ISVNUT1JZKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuRkVOX0hJU1RPUllfS0VZLCBKU09OLnN0cmluZ2lmeShoaXN0b3J5KSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5wZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGJvYXJkU3RhdGU6IFBlcnNpc3RlZEJvYXJkU3RhdGUgPSB7XG4gICAgICAgICAgY3VycmVudEZlbixcbiAgICAgICAgICBmZW5IaXN0b3J5OiBoaXN0b3J5LFxuICAgICAgICAgIGdhbWVTZXNzaW9uSWQ6IHRoaXMuZ2FtZVNlc3Npb25JZCxcbiAgICAgICAgICBnYW1lU3RhcnRGZW46IHRoaXMuZ2FtZVN0YXJ0RmVuLFxuICAgICAgICAgIGN1cnJlbnRTZXR1cE5hbWU6IHRoaXMuY3VycmVudFNldHVwTmFtZSxcbiAgICAgICAgICBjdXJyZW50U2V0dXBDYXRlZ29yeTogdGhpcy5jdXJyZW50U2V0dXBDYXRlZ29yeSxcbiAgICAgICAgICBoaXN0b3J5QW5ub3RhdGlvbnM6IHRoaXMuaGlzdG9yeUFubm90YXRpb25zLFxuICAgICAgICAgIHJlZG9Bbm5vdGF0aW9uczogdGhpcy5yZWRvQW5ub3RhdGlvbnMsXG4gICAgICAgIH07XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuQk9BUkRfU1RBVEVfU1RPUkFHRV9LRVksIEpTT04uc3RyaW5naWZ5KGJvYXJkU3RhdGUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2xlYXJQZXJzaXN0ZWRCb2FyZFN0YXRlKCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGxvZ2dlci5kZWJ1ZygnU2F2ZWQgRkVOIHRvIGhpc3RvcnksIHRvdGFsIGVudHJpZXM6JywgaGlzdG9yeS5sZW5ndGgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBGRU4gdG8gaGlzdG9yeTonLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0b3JlIEZFTiBmcm9tIGxvY2FsU3RvcmFnZSBvbiBhcHAgc3RhcnR1cFxuICAgKi9cbiAgcHJpdmF0ZSByZXN0b3JlRmVuRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkRmVuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5GRU5fU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKHNhdmVkRmVuKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIEZFTiBiZWZvcmUgbG9hZGluZ1xuICAgICAgICBjb25zdCB0ZXN0Q2hlc3MgPSBuZXcgQ2hlc3MoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0ZXN0Q2hlc3MubG9hZChzYXZlZEZlbik7XG4gICAgICAgICAgLy8gRkVOIGlzIHZhbGlkLCBsb2FkIGl0XG4gICAgICAgICAgY29uc3QgcmVzdG9yZWRCb2FyZFN0YXRlID0gdGhpcy5yZWFkUGVyc2lzdGVkQm9hcmRTdGF0ZSgpO1xuICAgICAgICAgIGlmIChyZXN0b3JlZEJvYXJkU3RhdGU/LmN1cnJlbnRGZW4gPT09IHNhdmVkRmVuKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRGZW4oc2F2ZWRGZW4sIHtcbiAgICAgICAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZzogZmFsc2UsXG4gICAgICAgICAgICAgIHNlc3Npb25JZDogcmVzdG9yZWRCb2FyZFN0YXRlLmdhbWVTZXNzaW9uSWQsXG4gICAgICAgICAgICAgIGdhbWVTdGFydEZlbjogcmVzdG9yZWRCb2FyZFN0YXRlLmdhbWVTdGFydEZlbixcbiAgICAgICAgICAgICAgaGlzdG9yeUFubm90YXRpb25zOiByZXN0b3JlZEJvYXJkU3RhdGUuaGlzdG9yeUFubm90YXRpb25zLFxuICAgICAgICAgICAgICByZWRvQW5ub3RhdGlvbnM6IHJlc3RvcmVkQm9hcmRTdGF0ZS5yZWRvQW5ub3RhdGlvbnMsXG4gICAgICAgICAgICAgIHNldHVwTmFtZTogcmVzdG9yZWRCb2FyZFN0YXRlLmN1cnJlbnRTZXR1cE5hbWUsXG4gICAgICAgICAgICAgIHNldHVwQ2F0ZWdvcnk6IHJlc3RvcmVkQm9hcmRTdGF0ZS5jdXJyZW50U2V0dXBDYXRlZ29yeSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRGZW4oc2F2ZWRGZW4sIHtcbiAgICAgICAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZzogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50R2FtZVNlc3Npb25JZCAhPT0gdGhpcy5nYW1lU2Vzc2lvbklkKSB7XG4gICAgICAgICAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldEJyaWxsaWFudFRyYWNraW5nKHRoaXMuZ2FtZVNlc3Npb25JZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdSZXN0b3JlZCBwb3NpdGlvbiBmcm9tIHByZXZpb3VzIHNlc3Npb24nO1xuICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnUmVzdG9yZWQgRkVOIGZyb20gc3RvcmFnZTonLCBzYXZlZEZlbik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGxvZ2dlci53YXJuKCdTYXZlZCBGRU4gaXMgaW52YWxpZCwgdXNpbmcgZGVmYXVsdDonLCBlcnIpO1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuRkVOX1NUT1JBR0VfS0VZKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gcmVzdG9yZSBGRU4gZnJvbSBzdG9yYWdlOicsIGVycik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgRkVOIGZyb20gaGlzdG9yeSBieSBpbmRleFxuICAgKi9cbiAgbG9hZEZlbkZyb21IaXN0b3J5KGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgaGlzdG9yeUpzb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkZFTl9ISVNUT1JZX0tFWSk7XG4gICAgICBpZiAoIWhpc3RvcnlKc29uKSByZXR1cm4gZmFsc2U7XG4gICAgICBcbiAgICAgIGNvbnN0IGhpc3Rvcnk6IHN0cmluZ1tdID0gSlNPTi5wYXJzZShoaXN0b3J5SnNvbik7XG4gICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IGhpc3RvcnkubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICBcbiAgICAgIGNvbnN0IGZlbiA9IGhpc3RvcnlbaW5kZXhdO1xuICAgICAgcmV0dXJuIHRoaXMubG9hZEZlbihmZW4pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBGRU4gZnJvbSBoaXN0b3J5OicsIGVycik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBGRU4gaGlzdG9yeVxuICAgKi9cbiAgZ2V0IGZlbkhpc3RvcnkoKTogc3RyaW5nW10ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBoaXN0b3J5SnNvbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX0hJU1RPUllfS0VZKTtcbiAgICAgIHJldHVybiBoaXN0b3J5SnNvbiA/IEpTT04ucGFyc2UoaGlzdG9yeUpzb24pIDogW107XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbGFzdCBzYXZlZCBGRU5cbiAgICovXG4gIGdldCBsYXN0U2F2ZWRGZW4oKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkZFTl9TVE9SQUdFX0tFWSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlIHNob3dpbmcgbW92ZSBhcnJvd3NcbiAgICovXG4gIHRvZ2dsZU1vdmVBcnJvd3MoKTogdm9pZCB7XG4gICAgLy8gQ2xlYXIgYW55IHBlbmRpbmcgYW5hbHlzaXMgdGltZW91dFxuICAgIGlmICh0aGlzLl9hbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9hbmFseXNpc1RpbWVvdXQpO1xuICAgICAgdGhpcy5fYW5hbHlzaXNUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zaG93TW92ZUFycm93cyA9ICF0aGlzLnNob3dNb3ZlQXJyb3dzO1xuICAgIGlmICh0aGlzLnNob3dNb3ZlQXJyb3dzICYmIE9iamVjdC5rZXlzKHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcykubGVuZ3RoID09PSAwICYmICF0aGlzLmlzQW5hbHl6aW5nTW92ZXMpIHtcbiAgICAgIC8vIEF1dG8tYW5hbHl6ZSBpZiBhcnJvd3MgYXJlIGVuYWJsZWQgYW5kIHdlIGRvbid0IGhhdmUgYW5hbHlzaXMgeWV0XG4gICAgICB0aGlzLmFuYWx5emVBbGxNb3ZlcygpLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tCb2FyZFZpZXdNb2RlbF0gRmFpbGVkIHRvIGFuYWx5emUgbW92ZXM6JywgZXJyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuc2hvd01vdmVBcnJvd3MpIHtcbiAgICAgIC8vIENsZWFyIGFuYWx5c2lzIHdoZW4gYXJyb3dzIGFyZSBkaXNhYmxlZCB0byBmcmVlIG1lbW9yeVxuICAgICAgdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzID0ge307XG4gICAgICB0aGlzLmFuYWx5emVkTGVnYWxNb3Zlc0ZlbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgc2V0U2hvd01vdmVBcnJvd3NFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zaG93TW92ZUFycm93cyAhPT0gZW5hYmxlZCkge1xuICAgICAgdGhpcy50b2dnbGVNb3ZlQXJyb3dzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB3aGljaCBzaWRlJ3MgbW92ZXMgdG8gc2hvdyBhcnJvd3MgZm9yXG4gICAqL1xuICBzZXRTaG93QXJyb3dzRm9yU2lkZShzaWRlOiAnY3VycmVudCcgfCAncGxheWVyJyB8ICdlbmdpbmUnKTogdm9pZCB7XG4gICAgdGhpcy5zaG93QXJyb3dzRm9yU2lkZSA9IHNpZGU7XG4gICAgbG9nZ2VyLmRlYnVnKCdTaG93IGFycm93cyBmb3Igc2lkZTonLCBzaWRlKTtcbiAgICAvLyBSZS1hbmFseXplIGlmIGFycm93cyBhcmUgZW5hYmxlZFxuICAgIGlmICh0aGlzLnNob3dNb3ZlQXJyb3dzKSB7XG4gICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID0gbnVsbDtcbiAgICAgIHRoaXMuYW5hbHl6ZUFsbE1vdmVzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFuYWx5emUgYWxsIGxlZ2FsIG1vdmVzIGZvciB0aGUgY3VycmVudCBwb3NpdGlvblxuICAgKi9cbiAgYXN5bmMgYW5hbHl6ZUFsbE1vdmVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmlzR2FtZU92ZXIgfHwgdGhpcy5pc0FuYWx5emluZ01vdmVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID09PSB0aGlzLmZlbiAmJiBPYmplY3Qua2V5cyh0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzQW5hbHl6aW5nTW92ZXMgPSB0cnVlO1xuICAgICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTsgLy8gQ2xlYXJcbiAgICAgIH0pO1xuXG4gICAgICAvLyBHZXQgYWxsIGxlZ2FsIG1vdmVzXG4gICAgICBjb25zdCBsZWdhbE1vdmVzID0gdGhpcy5hbGxMZWdhbE1vdmVzO1xuICAgICAgaWYgKGxlZ2FsTW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gSW5pdGlhbGl6ZSBlbmdpbmUgaWYgbmVlZGVkXG4gICAgICBpZiAoIWVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkKSB7XG4gICAgICAgIGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFuYWx5emUgY3VycmVudCBwb3NpdGlvblxuICAgICAgY29uc3QgYW5hbHlzaXMgPSBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uKFxuICAgICAgICB0aGlzLmZlbixcbiAgICAgICAgY29uZmlnVmlld01vZGVsLmRlcHRoLFxuICAgICAgICBjb25maWdWaWV3TW9kZWwubXVsdGlQVixcbiAgICAgICAgJ2JhY2tncm91bmQnLFxuICAgICAgKTtcblxuICAgICAgaWYgKGFuYWx5c2lzLmlnbm9yZWQgfHwgIWNhbkFwcGx5QW5hbHl6ZWRNb3ZlKHRoaXMuZmVuLCBhbmFseXNpcy5hbmFseXplZEZlbikpIHtcbiAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaXNBbmFseXppbmdNb3ZlcyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYSBtYXAgb2YgVUNJIG1vdmVzIHRvIHRoZWlyIHF1YWxpdHkgYnVja2V0c1xuICAgICAgY29uc3QgbW92ZU1hcCA9IG1hcExlZ2FsTW92ZXNUb0J1Y2tldHMoXG4gICAgICAgIGxlZ2FsTW92ZXMubWFwKG1vdmUgPT4gYCR7bW92ZS5mcm9tfSR7bW92ZS50b30ke21vdmUucHJvbW90aW9uIHx8ICcnfWApLFxuICAgICAgICBhbmFseXNpcy5tb3ZlcyxcbiAgICAgICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb24sXG4gICAgICApO1xuXG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcyA9IG1vdmVNYXA7XG4gICAgICAgIHRoaXMuaXNBbmFseXppbmdNb3ZlcyA9IGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID0gdGhpcy5mZW47XG4gICAgICBsb2dnZXIuZGVidWcoJ0FuYWx5emVkJywgT2JqZWN0LmtleXMobW92ZU1hcCkubGVuZ3RoLCAnbGVnYWwgbW92ZXMnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIGFuYWx5emUgbW92ZXM6JywgZXJyKTtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSB0aGUgcXVhbGl0eSBvZiBhIHBsYXllcidzIG1vdmVcbiAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGlzIG1hZGUsIGFuYWx5emluZyB0aGUgcG9zaXRpb24gYmVmb3JlIHRoZSBtb3ZlXG4gICAqL1xuICBhc3luYyBhbmFseXplUGxheWVyTW92ZShtb3ZlOiBNb3ZlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUnVuIGFzeW5jaHJvbm91c2x5IHNvIGl0IGRvZXNuJ3QgYmxvY2sgdGhlIFVJXG4gICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBleHBlY3RlZEFmdGVyRmVuID0gbW92ZS5hZnRlcjtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBlbmdpbmUgaWYgbmVlZGVkXG4gICAgICAgIGlmICghZW5naW5lVmlld01vZGVsLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IHRoZSBwb3NpdGlvbiBiZWZvcmUgdGhlIG1vdmUgKGZyb20gaGlzdG9yeSlcbiAgICAgICAgY29uc3QgaGlzdG9yeSA9IHRoaXMuY2hlc3MuaGlzdG9yeSh7IHZlcmJvc2U6IHRydWUgfSk7XG4gICAgICAgIGlmIChoaXN0b3J5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjsgLy8gTm8gaGlzdG9yeSwgY2FuJ3QgYW5hbHl6ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIG1vdmUgd2UganVzdCBtYWRlIGlzIHRoZSBsYXN0IG9uZSBpbiBoaXN0b3J5XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gYW5hbHl6ZSB0aGUgcG9zaXRpb24gYmVmb3JlIGl0XG4gICAgICAgIC8vIGNoZXNzLmpzIGhpc3RvcnkgdmVyYm9zZSBpbmNsdWRlcyAnYmVmb3JlJyBhbmQgJ2FmdGVyJyBGRU5cbiAgICAgICAgY29uc3QgbGFzdE1vdmVJbkhpc3RvcnkgPSBoaXN0b3J5W2hpc3RvcnkubGVuZ3RoIC0gMV0gYXMgTW92ZSAmIHsgYmVmb3JlPzogc3RyaW5nIH07XG4gICAgICAgIGNvbnN0IGJlZm9yZUZlbiA9IGxhc3RNb3ZlSW5IaXN0b3J5LmJlZm9yZSB8fCB0aGlzLmZlbjtcblxuICAgICAgICAvLyBBbmFseXplIHRoZSBwb3NpdGlvbiBiZWZvcmUgdGhlIG1vdmVcbiAgICAgICAgY29uc3QgYW5hbHlzaXMgPSBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uKFxuICAgICAgICAgIGJlZm9yZUZlbixcbiAgICAgICAgICBNYXRoLm1pbihjb25maWdWaWV3TW9kZWwuZGVwdGgsIDE1KSwgLy8gVXNlIHNtYWxsZXIgZGVwdGggZm9yIGZhc3RlciBhbmFseXNpc1xuICAgICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5tdWx0aVBWLFxuICAgICAgICAgICdiYWNrZ3JvdW5kJyxcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgYW5hbHlzaXMuaWdub3JlZFxuICAgICAgICAgIHx8ICFjYW5BcHBseUFuYWx5emVkTW92ZShiZWZvcmVGZW4sIGFuYWx5c2lzLmFuYWx5emVkRmVuKVxuICAgICAgICAgIHx8IHRoaXMuZmVuICE9PSBleHBlY3RlZEFmdGVyRmVuXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmQgdGhlIG1vdmUgaW4gdGhlIGFuYWx5emVkIG1vdmVzXG4gICAgICAgIGNvbnN0IG1vdmVVQ0kgPSBgJHttb3ZlLmZyb219JHttb3ZlLnRvfSR7bW92ZS5wcm9tb3Rpb24gfHwgJyd9YDtcbiAgICAgICAgY29uc3QgYW5hbHl6ZWRNb3ZlID0gYW5hbHlzaXMubW92ZXMuZmluZChtID0+IG0ubW92ZSA9PT0gbW92ZVVDSSk7XG4gICAgICAgIGlmIChhbmFseXplZE1vdmUpIHtcbiAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eSA9IGFuYWx5emVkTW92ZS5idWNrZXQ7XG4gICAgICAgICAgICBjb25zdCBxdWFsaXR5TGFiZWwgPSBCVUNLRVRfTEFCRUxTW2FuYWx5emVkTW92ZS5idWNrZXRdO1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYFlvdSBwbGF5ZWQ6ICR7bW92ZS5zYW59ICgke3F1YWxpdHlMYWJlbH0pYDtcbiAgICAgICAgICAgIHRoaXMucHVibGlzaE1vdmVGZWVkYmFjayh7XG4gICAgICAgICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgICAgICAgbW92ZSxcbiAgICAgICAgICAgICAgaXNCcmlsbGlhbnQ6IGZhbHNlLFxuICAgICAgICAgICAgICBxdWFsaXR5TGFiZWwsXG4gICAgICAgICAgICAgIGJ1Y2tldDogYW5hbHl6ZWRNb3ZlLmJ1Y2tldCxcbiAgICAgICAgICAgICAgc2lsZW50OiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdQbGF5ZXIgbW92ZSBxdWFsaXR5OicsIGFuYWx5emVkTW92ZS5idWNrZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbikge1xuICAgICAgICAgICAgICB0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eSA9ICdmYWxsYmFjayc7XG4gICAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBZb3UgcGxheWVkOiAke21vdmUuc2FufSAoRmFsbGJhY2sgbW92ZSlgO1xuICAgICAgICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgICAgICAgICBtb3ZlLFxuICAgICAgICAgICAgICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBxdWFsaXR5TGFiZWw6ICdGYWxsYmFjayBtb3ZlJyxcbiAgICAgICAgICAgICAgICBidWNrZXQ6ICdmYWxsYmFjaycsXG4gICAgICAgICAgICAgICAgc2lsZW50OiB0cnVlLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gJ2dvb2QnO1xuICAgICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn0gKEdvb2QpYDtcbiAgICAgICAgICAgICAgdGhpcy5wdWJsaXNoTW92ZUZlZWRiYWNrKHtcbiAgICAgICAgICAgICAgICBhY3RvcjogJ3BsYXllcicsXG4gICAgICAgICAgICAgICAgbW92ZSxcbiAgICAgICAgICAgICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgICAgICAgICAgICAgcXVhbGl0eUxhYmVsOiAnR29vZCcsXG4gICAgICAgICAgICAgICAgYnVja2V0OiAnZ29vZCcsXG4gICAgICAgICAgICAgICAgc2lsZW50OiB0cnVlLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIGFuYWx5emUgcGxheWVyIG1vdmU6JywgZXJyKTtcbiAgICAgICAgLy8gRG9uJ3QgdXBkYXRlIHN0YXR1cyBvbiBlcnJvciwga2VlcCB0aGUgb3JpZ2luYWwgbWVzc2FnZVxuICAgICAgfVxuICAgIH0sIDEwMCk7XG4gIH1cblxuICBwcml2YXRlIHNjaGVkdWxlUGxheWVyTW92ZUFuYWx5c2lzKG1vdmU6IE1vdmUpOiB2b2lkIHtcbiAgICB0aGlzLmNsZWFyUGVuZGluZ1BsYXllck1vdmVBbmFseXNpcygpO1xuXG4gICAgY29uc3QgYXR0ZW1wdEFuYWx5c2lzID0gKCk6IHZvaWQgPT4ge1xuICAgICAgdGhpcy5fcGxheWVyTW92ZUFuYWx5c2lzVGltZW91dCA9IG51bGw7XG5cbiAgICAgIGNvbnN0IGF1dG9QbGF5UGVuZGluZyA9XG4gICAgICAgIHRoaXMuYXV0b1BsYXlFbmFibGVkXG4gICAgICAgICYmICF0aGlzLmF1dG9QbGF5UGF1c2VkXG4gICAgICAgICYmICF0aGlzLmlzR2FtZU92ZXJcbiAgICAgICAgJiYgKHRoaXMuaXNUaGlua2luZyB8fCB0aGlzLmlzQXV0b1BsYXlDb3VudGluZ0Rvd24gfHwgdGhpcy50dXJuID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yKTtcblxuICAgICAgaWYgKGF1dG9QbGF5UGVuZGluZykge1xuICAgICAgICB0aGlzLl9wbGF5ZXJNb3ZlQW5hbHlzaXNUaW1lb3V0ID0gc2V0VGltZW91dChhdHRlbXB0QW5hbHlzaXMsIDE1MCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdm9pZCB0aGlzLmFuYWx5emVQbGF5ZXJNb3ZlKG1vdmUpO1xuICAgIH07XG5cbiAgICB0aGlzLl9wbGF5ZXJNb3ZlQW5hbHlzaXNUaW1lb3V0ID0gc2V0VGltZW91dChhdHRlbXB0QW5hbHlzaXMsIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhcnJvd3MgZGF0YSBmb3IgcmVhY3QtY2hlc3Nib2FyZFxuICAgKiBSZXR1cm5zIGFycmF5IG9mIEFycm93IG9iamVjdHMgd2l0aCBzdGFydFNxdWFyZSwgZW5kU3F1YXJlLCBhbmQgY29sb3IgcHJvcGVydGllc1xuICAgKiBPbmx5IHNob3dzIGFycm93cyBmb3IgRXhjZWxsZW50LCBHb29kLCBNaXN0YWtlLCBhbmQgQmx1bmRlciBtb3Zlc1xuICAgKiBMaW1pdGVkIHRvIG1heGltdW0gMyBhcnJvd3MgcGVyIHF1YWxpdHkgYnVja2V0XG4gICAqL1xuICBnZXQgbW92ZUFycm93cygpOiBBcnJheTx7IHN0YXJ0U3F1YXJlOiBzdHJpbmc7IGVuZFNxdWFyZTogc3RyaW5nOyBjb2xvcjogc3RyaW5nIH0+IHtcbiAgICBpZiAoIXRoaXMuc2hvd01vdmVBcnJvd3MgfHwgT2JqZWN0LmtleXModGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvLyBPbmx5IHNob3cgYXJyb3dzIGZvciB0aGVzZSBzcGVjaWZpYyBtb3ZlIHF1YWxpdGllc1xuICAgIGNvbnN0IGFsbG93ZWRCdWNrZXRzOiBNb3ZlQnVja2V0W10gPSBbJ2V4Y2VsbGVudCcsICdnb29kJywgJ21pc3Rha2UnLCAnYmx1bmRlciddO1xuICAgIGNvbnN0IG1heEFycm93c1BlckJ1Y2tldCA9IDM7XG5cbiAgICBsZXQgbGVnYWxNb3ZlcyA9IHRoaXMuYWxsTGVnYWxNb3ZlcztcblxuICAgIC8vIEZpbHRlciBtb3ZlcyBieSBzaWRlIGlmIG5lZWRlZFxuICAgIGlmICh0aGlzLnNob3dBcnJvd3NGb3JTaWRlID09PSAncGxheWVyJykge1xuICAgICAgLy8gU2hvdyBtb3ZlcyBmb3IgdGhlIHNpZGUgdGhhdCB0aGUgZW5naW5lIGlzIE5PVCBwbGF5aW5nIGZvclxuICAgICAgY29uc3QgcGxheWVyU2lkZSA9IHRoaXMuZW5naW5lUGxheXNGb3IgPT09ICd3JyA/ICdiJyA6ICd3JztcbiAgICAgIGxlZ2FsTW92ZXMgPSBsZWdhbE1vdmVzLmZpbHRlcihtb3ZlID0+IHtcbiAgICAgICAgY29uc3QgcGllY2UgPSB0aGlzLmdldFBpZWNlQXQobW92ZS5mcm9tKTtcbiAgICAgICAgcmV0dXJuIHBpZWNlICYmIHBpZWNlLmNvbG9yID09PSBwbGF5ZXJTaWRlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNob3dBcnJvd3NGb3JTaWRlID09PSAnZW5naW5lJykge1xuICAgICAgLy8gU2hvdyBtb3ZlcyBmb3IgdGhlIHNpZGUgdGhhdCB0aGUgZW5naW5lIElTIHBsYXlpbmcgZm9yXG4gICAgICBsZWdhbE1vdmVzID0gbGVnYWxNb3Zlcy5maWx0ZXIobW92ZSA9PiB7XG4gICAgICAgIGNvbnN0IHBpZWNlID0gdGhpcy5nZXRQaWVjZUF0KG1vdmUuZnJvbSk7XG4gICAgICAgIHJldHVybiBwaWVjZSAmJiBwaWVjZS5jb2xvciA9PT0gdGhpcy5lbmdpbmVQbGF5c0ZvcjtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBJZiAnY3VycmVudCcsIHNob3cgYWxsIGxlZ2FsIG1vdmVzIChhbHJlYWR5IGZpbHRlcmVkIGJ5IGNoZXNzLmpzIHRvIGN1cnJlbnQgdHVybilcblxuICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byB2YWxpZGF0ZSBzcXVhcmUgZm9ybWF0IChhLWgsIDEtOClcbiAgICBjb25zdCBpc1ZhbGlkU3F1YXJlID0gKHNxdWFyZTogdW5rbm93bik6IHNxdWFyZSBpcyBTcXVhcmUgPT4ge1xuICAgICAgaWYgKCFzcXVhcmUgfHwgdHlwZW9mIHNxdWFyZSAhPT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiAvXlthLWhdWzEtOF0kLy50ZXN0KHNxdWFyZSk7XG4gICAgfTtcblxuICAgIC8vIEdyb3VwIG1vdmVzIGJ5IGJ1Y2tldFxuICAgIGNvbnN0IG1vdmVzQnlCdWNrZXQ6IFJlY29yZDxNb3ZlQnVja2V0LCBBcnJheTx7IHN0YXJ0U3F1YXJlOiBzdHJpbmc7IGVuZFNxdWFyZTogc3RyaW5nOyBjb2xvcjogc3RyaW5nIH0+PiA9IHtcbiAgICAgIGV4Y2VsbGVudDogW10sXG4gICAgICBnb29kOiBbXSxcbiAgICAgIG1pc3Rha2U6IFtdLFxuICAgICAgYmx1bmRlcjogW10sXG4gICAgICBiZXN0OiBbXSwgLy8gTm90IHVzZWQgYnV0IG5lZWRlZCBmb3IgdHlwZVxuICAgICAgZ3JlYXQ6IFtdLCAvLyBOb3QgdXNlZCBidXQgbmVlZGVkIGZvciB0eXBlXG4gICAgICBpbmFjY3VyYWN5OiBbXSwgLy8gTm90IHVzZWQgYnV0IG5lZWRlZCBmb3IgdHlwZVxuICAgIH07XG5cbiAgICAvLyBDb2xsZWN0IGFsbCB2YWxpZCBtb3ZlcyBncm91cGVkIGJ5IGJ1Y2tldFxuICAgIGZvciAoY29uc3QgbW92ZSBvZiBsZWdhbE1vdmVzKSB7XG4gICAgICAvLyBWYWxpZGF0ZSB0aGF0IG1vdmUgaGFzIHZhbGlkIGZyb20gYW5kIHRvIHNxdWFyZXNcbiAgICAgIGlmICghaXNWYWxpZFNxdWFyZShtb3ZlLmZyb20pIHx8ICFpc1ZhbGlkU3F1YXJlKG1vdmUudG8pKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnU2tpcHBpbmcgaW52YWxpZCBtb3ZlOicsIG1vdmUpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdWNpID0gYCR7bW92ZS5mcm9tfSR7bW92ZS50b30ke21vdmUucHJvbW90aW9uIHx8ICcnfWA7XG4gICAgICBjb25zdCBidWNrZXQgPSB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXNbdWNpXTtcbiAgICAgIFxuICAgICAgLy8gT25seSBpbmNsdWRlIG1vdmVzIGZyb20gYWxsb3dlZCBidWNrZXRzXG4gICAgICBpZiAoYnVja2V0ICYmIGJ1Y2tldCAhPT0gJ2ZhbGxiYWNrJyAmJiBhbGxvd2VkQnVja2V0cy5pbmNsdWRlcyhidWNrZXQpICYmIGlzVmFsaWRTcXVhcmUobW92ZS5mcm9tKSAmJiBpc1ZhbGlkU3F1YXJlKG1vdmUudG8pKSB7XG4gICAgICAgIG1vdmVzQnlCdWNrZXRbYnVja2V0XS5wdXNoKHtcbiAgICAgICAgICBzdGFydFNxdWFyZTogbW92ZS5mcm9tLFxuICAgICAgICAgIGVuZFNxdWFyZTogbW92ZS50byxcbiAgICAgICAgICBjb2xvcjogQlVDS0VUX0NPTE9SU1tidWNrZXRdLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMaW1pdCB0byBtYXggMyBhcnJvd3MgcGVyIGJ1Y2tldCBhbmQgY29tYmluZVxuICAgIGNvbnN0IGFycm93czogQXJyYXk8eyBzdGFydFNxdWFyZTogc3RyaW5nOyBlbmRTcXVhcmU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9PiA9IFtdO1xuICAgIGZvciAoY29uc3QgYnVja2V0IG9mIGFsbG93ZWRCdWNrZXRzKSB7XG4gICAgICBjb25zdCBidWNrZXRBcnJvd3MgPSBtb3Zlc0J5QnVja2V0W2J1Y2tldF0uc2xpY2UoMCwgbWF4QXJyb3dzUGVyQnVja2V0KTtcbiAgICAgIGFycm93cy5wdXNoKC4uLmJ1Y2tldEFycm93cyk7XG4gICAgICBsb2dnZXIuZGVidWcoYEFkZGVkICR7YnVja2V0QXJyb3dzLmxlbmd0aH0gJHtidWNrZXR9IGFycm93cyAoZm91bmQgJHttb3Zlc0J5QnVja2V0W2J1Y2tldF0ubGVuZ3RofSB0b3RhbClgKTtcbiAgICB9XG5cbiAgICBsb2dnZXIuZGVidWcoJ0dlbmVyYXRlZCcsIGFycm93cy5sZW5ndGgsICd0b3RhbCBhcnJvd3MnKTtcbiAgICByZXR1cm4gYXJyb3dzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbmFseXplZCBsZWdhbCBtb3ZlcyBjb3VudCAoZm9yIFVJIGRpc3BsYXkpXG4gICAqL1xuICBnZXQgYW5hbHl6ZWRMZWdhbE1vdmVzQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgdHVybiAod2hpdGUvYmxhY2spXG4gICAqL1xuICBnZXQgdHVybigpOiAndycgfCAnYicge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLnR1cm4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdHVybiBhcyBzdHJpbmdcbiAgICovXG4gIGdldCB0dXJuU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudHVybiA9PT0gJ3cnID8gJ1doaXRlJyA6ICdCbGFjayc7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgZ2FtZSBpcyBvdmVyXG4gICAqL1xuICBnZXQgaXNHYW1lT3ZlcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5pc0dhbWVPdmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgaXQncyBjaGVja21hdGVcbiAgICovXG4gIGdldCBpc0NoZWNrbWF0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5pc0NoZWNrbWF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGl0J3Mgc3RhbGVtYXRlXG4gICAqL1xuICBnZXQgaXNTdGFsZW1hdGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaXNTdGFsZW1hdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBpdCdzIGEgZHJhd1xuICAgKi9cbiAgZ2V0IGlzRHJhdygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5pc0RyYXcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBraW5nIGlzIGluIGNoZWNrXG4gICAqL1xuICBnZXQgaXNDaGVjaygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5pc0NoZWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdhbWUgc3RhdHVzIHRleHRcbiAgICovXG4gIGdldCBnYW1lU3RhdHVzKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuaXNDaGVja21hdGUpIHtcbiAgICAgIHJldHVybiBgQ2hlY2ttYXRlISAke3RoaXMudHVybiA9PT0gJ3cnID8gJ0JsYWNrJyA6ICdXaGl0ZSd9IHdpbnNgO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1N0YWxlbWF0ZSkge1xuICAgICAgcmV0dXJuICdTdGFsZW1hdGUhJztcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNEcmF3KSB7XG4gICAgICByZXR1cm4gJ0RyYXchJztcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNDaGVjaykge1xuICAgICAgcmV0dXJuIGAke3RoaXMudHVyblN0cmluZ30gaXMgaW4gY2hlY2tgO1xuICAgIH1cbiAgICByZXR1cm4gYCR7dGhpcy50dXJuU3RyaW5nfSB0byBtb3ZlYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbGVnYWwgbW92ZXMgZm9yIGEgc3F1YXJlXG4gICAqL1xuICBnZXRMZWdhbE1vdmVzKHNxdWFyZTogU3F1YXJlKTogTW92ZVtdIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5tb3Zlcyh7IHNxdWFyZSwgdmVyYm9zZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGllY2UgYXQgc3F1YXJlIChmb3IgVUkgdmlzdWFsIGluZGljYXRvcnMpXG4gICAqL1xuICBnZXRQaWVjZUF0KHNxdWFyZTogU3F1YXJlKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuZ2V0KHNxdWFyZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBsZWdhbCBtb3Zlc1xuICAgKi9cbiAgZ2V0IGFsbExlZ2FsTW92ZXMoKTogTW92ZVtdIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5tb3Zlcyh7IHZlcmJvc2U6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IG1vdmUgY291bnRcbiAgICovXG4gIGdldCBtb3ZlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5tb3ZlTnVtYmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogVW5kbyBhIHNpbmdsZSBtb3ZlIChmb3IgdGhlIG5ldyB1bmRvIGJ1dHRvbilcbiAgICovXG4gIHVuZG9TaW5nbGUoKTogYm9vbGVhbiB7XG4gICAgbG9nZ2VyLmRlYnVnKCd1bmRvU2luZ2xlIGNhbGxlZCwgaGlzdG9yeSBsZW5ndGg6JywgdGhpcy5oaXN0b3J5Lmxlbmd0aCk7XG4gICAgXG4gICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgbW92ZSA9IHRoaXMuY2hlc3MudW5kbygpO1xuICAgIGlmIChtb3ZlKSB7XG4gICAgICAvLyBBZGQgdG8gcmVkbyBzdGFja1xuICAgICAgdGhpcy5yZWRvU3RhY2sucHVzaChtb3ZlKTtcbiAgICAgIGNvbnN0IGFubm90YXRpb24gPSB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5wb3AoKTtcbiAgICAgIGlmIChhbm5vdGF0aW9uKSB7XG4gICAgICAgIHRoaXMucmVkb0Fubm90YXRpb25zLnB1c2goYW5ub3RhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpO1xuICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgXG4gICAgICAvLyBVcGRhdGUgbGFzdE1vdmUgaWYgdGhlcmUgYXJlIHN0aWxsIG1vdmVzIGluIGhpc3RvcnlcbiAgICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBsYXN0TW92ZUluSGlzdG9yeSA9IHRoaXMuaGlzdG9yeVt0aGlzLmhpc3RvcnkubGVuZ3RoIC0gMV07XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSB7IGZyb206IGxhc3RNb3ZlSW5IaXN0b3J5LmZyb20gYXMgU3F1YXJlLCB0bzogbGFzdE1vdmVJbkhpc3RvcnkudG8gYXMgU3F1YXJlIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdVbmRpZCAxIG1vdmUnO1xuICAgICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG4gICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnVW5kaWQgMSBtb3ZlLCByZWRvIHN0YWNrIHNpemU6JywgdGhpcy5yZWRvU3RhY2subGVuZ3RoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVkbyBhIHNpbmdsZSBtb3ZlXG4gICAqL1xuICByZWRvU2luZ2xlKCk6IGJvb2xlYW4ge1xuICAgIGxvZ2dlci5kZWJ1ZygncmVkb1NpbmdsZSBjYWxsZWQsIHJlZG8gc3RhY2sgc2l6ZTonLCB0aGlzLnJlZG9TdGFjay5sZW5ndGgpO1xuICAgIFxuICAgIGlmICh0aGlzLnJlZG9TdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgbW92ZVRvUmVkbyA9IHRoaXMucmVkb1N0YWNrLnBvcCgpO1xuICAgIGlmICghbW92ZVRvUmVkbykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBhbm5vdGF0aW9uVG9SZWRvID0gdGhpcy5yZWRvQW5ub3RhdGlvbnMucG9wKCk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLm1vdmUoe1xuICAgICAgICBmcm9tOiBtb3ZlVG9SZWRvLmZyb20gYXMgU3F1YXJlLFxuICAgICAgICB0bzogbW92ZVRvUmVkby50byBhcyBTcXVhcmUsXG4gICAgICAgIHByb21vdGlvbjogbW92ZVRvUmVkby5wcm9tb3Rpb24sXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgaWYgKG1vdmUpIHtcbiAgICAgICAgdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMucHVzaChcbiAgICAgICAgICBhbm5vdGF0aW9uVG9SZWRvID8/IHRoaXMuY3JlYXRlTW92ZUFubm90YXRpb24obW92ZSwgZmFsc2UsICdyZWRvJyksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IHsgZnJvbTogbW92ZS5mcm9tIGFzIFNxdWFyZSwgdG86IG1vdmUudG8gYXMgU3F1YXJlIH07XG4gICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBSZWRpZDogJHttb3ZlLnNhbn1gO1xuICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgIGFjdG9yOiAncmVkbycsXG4gICAgICAgICAgbW92ZSxcbiAgICAgICAgICBpc0JyaWxsaWFudDogYW5ub3RhdGlvblRvUmVkbz8uY29uc3VtZWRCcmlsbGlhbnQgPz8gZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsZWFyUGVuZGluZ1BsYXllck1vdmVBbmFseXNpcygpO1xuICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdSZWRpZCAxIG1vdmUnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIGF1dG8tcGxheSBpcyBlbmFibGVkIGFuZCBpdCdzIG5vdyB0aGUgZW5naW5lJ3MgdHVybiwgdHJpZ2dlciBhdXRvLXBsYXlcbiAgICAgICAgaWYgKHRoaXMuYXV0b1BsYXlFbmFibGVkICYmICF0aGlzLmlzR2FtZU92ZXIgJiYgdGhpcy5jaGVzcy50dXJuKCkgPT09IHRoaXMuZW5naW5lUGxheXNGb3IpIHtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ1NjaGVkdWxpbmcgYXV0by1wbGF5IGFmdGVyIHJlZG8nKTtcbiAgICAgICAgICB0aGlzLnNjaGVkdWxlQXV0b1BsYXlNb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdSZWRvIGZhaWxlZDonLCBlcnIpO1xuICAgICAgLy8gUHV0IHRoZSBtb3ZlIGJhY2sgb24gdGhlIHN0YWNrIGlmIGl0IGZhaWxlZFxuICAgICAgdGhpcy5yZWRvU3RhY2sucHVzaChtb3ZlVG9SZWRvKTtcbiAgICAgIGlmIChhbm5vdGF0aW9uVG9SZWRvKSB7XG4gICAgICAgIHRoaXMucmVkb0Fubm90YXRpb25zLnB1c2goYW5ub3RhdGlvblRvUmVkbyk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB1bmRvIGlzIGF2YWlsYWJsZVxuICAgKi9cbiAgZ2V0IGNhblVuZG8oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeS5sZW5ndGggPiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHJlZG8gaXMgYXZhaWxhYmxlXG4gICAqL1xuICBnZXQgY2FuUmVkbygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5yZWRvU3RhY2subGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldCBhdXRvUGxheUN1cnJlbnRTaWRlTGFiZWwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5lbmdpbmVQbGF5c0ZvciA9PT0gJ3cnID8gJ1doaXRlJyA6ICdCbGFjayc7XG4gIH1cblxuICBnZXQgY2FuU3RhcnRBdXRvUGxheVR1cm4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYXV0b1BsYXlFbmFibGVkXG4gICAgICAmJiAhdGhpcy5hdXRvUGxheVBhdXNlZFxuICAgICAgJiYgIXRoaXMuaXNUaGlua2luZ1xuICAgICAgJiYgIXRoaXMuaXNHYW1lT3ZlclxuICAgICAgJiYgdGhpcy50dXJuID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yO1xuICB9XG5cbiAgZ2V0IGlzQXV0b1BsYXlDb3VudGluZ0Rvd24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgPiBEYXRlLm5vdygpO1xuICB9XG5cbiAgZ2V0IGF1dG9QbGF5Q291bnRkb3duTXNSZW1haW5pbmcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pc0F1dG9QbGF5Q291bnRpbmdEb3duXG4gICAgICA/IE1hdGgubWF4KDAsIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgLSBEYXRlLm5vdygpKVxuICAgICAgOiAwO1xuICB9XG5cbiAgZ2V0IG1vdmVIaXN0b3J5Um93cygpOiBBcnJheTx7IG1vdmVOdW1iZXI6IG51bWJlcjsgd2hpdGU6IE1vdmUgfCBudWxsOyBibGFjazogTW92ZSB8IG51bGwgfT4ge1xuICAgIGNvbnN0IHJvd3M6IEFycmF5PHsgbW92ZU51bWJlcjogbnVtYmVyOyB3aGl0ZTogTW92ZSB8IG51bGw7IGJsYWNrOiBNb3ZlIHwgbnVsbCB9PiA9IFtdO1xuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuaGlzdG9yeS5sZW5ndGg7IGluZGV4ICs9IDIpIHtcbiAgICAgIGNvbnN0IHdoaXRlTW92ZSA9IHRoaXMuaGlzdG9yeVtpbmRleF0gPz8gbnVsbDtcbiAgICAgIGNvbnN0IGJsYWNrTW92ZSA9IHRoaXMuaGlzdG9yeVtpbmRleCArIDFdID8/IG51bGw7XG4gICAgICBjb25zdCBtb3ZlTnVtYmVyID0gd2hpdGVNb3ZlPy5tb3ZlTnVtYmVyID8/IGJsYWNrTW92ZT8ubW92ZU51bWJlciA/PyByb3dzLmxlbmd0aCArIDE7XG4gICAgICByb3dzLnB1c2goe1xuICAgICAgICBtb3ZlTnVtYmVyLFxuICAgICAgICB3aGl0ZTogd2hpdGVNb3ZlLFxuICAgICAgICBibGFjazogYmxhY2tNb3ZlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3M7XG4gIH1cblxuICBnZXQgZGVidWdTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nYW1lU2Vzc2lvbklkO1xuICB9XG5cbiAgZ2V0IG1vdmVBbm5vdGF0aW9ucygpOiBNb3ZlQW5ub3RhdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMubWFwKChhbm5vdGF0aW9uKSA9PiAoeyAuLi5hbm5vdGF0aW9uIH0pKTtcbiAgfVxuXG4gIGdldCBhdXRvUGxheUFjdGl2ZUR1cmF0aW9uTXMoKTogbnVtYmVyIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheUVuYWJsZWQgJiYgIXRoaXMuYXV0b1BsYXlQYXVzZWQgJiYgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmF1dG9QbGF5QWNjdW11bGF0ZWRNcyArIChEYXRlLm5vdygpIC0gdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmF1dG9QbGF5QWNjdW11bGF0ZWRNcztcbiAgfVxuXG4gIGdldCBoYXNTa2lwcGVkRW5naW5lTW92ZU5vdGljZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlICE9PSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9ydCBjdXJyZW50IGdhbWUgYXMgUEdOXG4gICAqL1xuICBnZXQgcGduKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MucGduKCk7XG4gIH1cblxuICBnZXQgbGFzdFBsYXllck1vdmVRdWFsaXR5TGFiZWwoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID8gRElTUExBWV9CVUNLRVRfTEFCRUxTW3RoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5XSA6IG51bGw7XG4gIH1cblxuICBnZXQgbGFzdFBsYXllck1vdmVRdWFsaXR5Q29sb3IoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID8gRElTUExBWV9CVUNLRVRfQ09MT1JTW3RoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5XSA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIHdhaXQoZGVsYXlNczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgc2V0VGltZW91dChyZXNvbHZlLCBkZWxheU1zKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGNhblNjaGVkdWxlQXV0b1BsYXkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYXV0b1BsYXlFbmFibGVkXG4gICAgICAmJiAhdGhpcy5hdXRvUGxheVBhdXNlZFxuICAgICAgJiYgIXRoaXMuaXNUaGlua2luZ1xuICAgICAgJiYgIXRoaXMuaXNHYW1lT3ZlclxuICAgICAgJiYgdGhpcy50dXJuID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yO1xuICB9XG5cbiAgcHJpdmF0ZSBiZWdpblNlc3Npb25TdGF0ZShvcHRpb25zOiB7XG4gICAgZ2FtZVNlc3Npb25JZDogc3RyaW5nO1xuICAgIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IGJvb2xlYW47XG4gICAgaGlzdG9yeUFubm90YXRpb25zPzogTW92ZUFubm90YXRpb25bXTtcbiAgICByZWRvQW5ub3RhdGlvbnM/OiBNb3ZlQW5ub3RhdGlvbltdO1xuICAgIHNldHVwTmFtZT86IHN0cmluZztcbiAgICBzZXR1cENhdGVnb3J5Pzogc3RyaW5nO1xuICB9KTogdm9pZCB7XG4gICAgdGhpcy5zdG9wQXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgdGhpcy5nYW1lU2Vzc2lvbklkID0gb3B0aW9ucy5nYW1lU2Vzc2lvbklkO1xuICAgIHRoaXMuZ2FtZVN0YXJ0RmVuID0gb3B0aW9ucy5nYW1lU3RhcnRGZW47XG4gICAgdGhpcy5zZXNzaW9uU3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLmN1cnJlbnRTZXR1cE5hbWUgPSBvcHRpb25zLnNldHVwTmFtZSA/PyAnQ3VzdG9tIFBvc2l0aW9uJztcbiAgICB0aGlzLmN1cnJlbnRTZXR1cENhdGVnb3J5ID0gb3B0aW9ucy5zZXR1cENhdGVnb3J5ID8/ICdjdXN0b20nO1xuICAgIHRoaXMuaGlzdG9yeUFubm90YXRpb25zID0gWy4uLihvcHRpb25zLmhpc3RvcnlBbm5vdGF0aW9ucyA/PyBbXSldO1xuICAgIHRoaXMucmVkb0Fubm90YXRpb25zID0gWy4uLihvcHRpb25zLnJlZG9Bbm5vdGF0aW9ucyA/PyBbXSldO1xuICAgIHRoaXMucmVkb1N0YWNrID0gdGhpcy5jcmVhdGVSZWRvU3RhY2tGcm9tQW5ub3RhdGlvbnModGhpcy5yZWRvQW5ub3RhdGlvbnMpO1xuICAgIHRoaXMuYXV0b1BsYXlBY2N1bXVsYXRlZE1zID0gMDtcbiAgICB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCA9IHRoaXMuYXV0b1BsYXlFbmFibGVkICYmICF0aGlzLmF1dG9QbGF5UGF1c2VkID8gRGF0ZS5ub3coKSA6IG51bGw7XG4gICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICBpZiAob3B0aW9ucy5yZXNldEJyaWxsaWFudFRyYWNraW5nKSB7XG4gICAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldEJyaWxsaWFudFRyYWNraW5nKHRoaXMuZ2FtZVNlc3Npb25JZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclJlZG9TdGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLnJlZG9TdGFjayA9IFtdO1xuICAgIHRoaXMucmVkb0Fubm90YXRpb25zID0gW107XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZU1vdmVBbm5vdGF0aW9uKFxuICAgIG1vdmU6IE1vdmUgJiB7IGJlZm9yZT86IHN0cmluZzsgYWZ0ZXI/OiBzdHJpbmcgfSxcbiAgICBjb25zdW1lZEJyaWxsaWFudDogYm9vbGVhbixcbiAgICBhY3RvcjogJ3BsYXllcicgfCAnZW5naW5lJyB8ICdyZWRvJyxcbiAgKTogTW92ZUFubm90YXRpb24ge1xuICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCk7XG4gICAgY29uc3QgcHJldmlvdXNUaW1lc3RhbXAgPSB0aGlzLmhpc3RvcnlBbm5vdGF0aW9uc1t0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5sZW5ndGggLSAxXT8udGltZXN0YW1wID8/IHRoaXMuc2Vzc2lvblN0YXJ0ZWRBdDtcbiAgICByZXR1cm4ge1xuICAgICAgYmVmb3JlRmVuOiBtb3ZlLmJlZm9yZSA/PyB0aGlzLmZlbixcbiAgICAgIGFmdGVyRmVuOiBtb3ZlLmFmdGVyID8/IHRoaXMuY2hlc3MuZmVuKCksXG4gICAgICB1Y2k6IGAke21vdmUuZnJvbX0ke21vdmUudG99JHttb3ZlLnByb21vdGlvbiB8fCAnJ31gLFxuICAgICAgbW92ZU51bWJlcjogdGhpcy5jaGVzcy5tb3ZlTnVtYmVyKCksXG4gICAgICBjb25zdW1lZEJyaWxsaWFudCxcbiAgICAgIGFjdG9yLFxuICAgICAgc2FuOiBtb3ZlLnNhbixcbiAgICAgIHRpbWVzdGFtcCxcbiAgICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiBNYXRoLm1heCgwLCB0aW1lc3RhbXAgLSBwcmV2aW91c1RpbWVzdGFtcCksXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgcmVjb3JkTW92ZUFubm90YXRpb24oXG4gICAgbW92ZTogTW92ZSAmIHsgYmVmb3JlPzogc3RyaW5nOyBhZnRlcj86IHN0cmluZyB9LFxuICAgIGNvbnN1bWVkQnJpbGxpYW50OiBib29sZWFuLFxuICAgIGFjdG9yOiAncGxheWVyJyB8ICdlbmdpbmUnIHwgJ3JlZG8nLFxuICApOiB2b2lkIHtcbiAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5wdXNoKHRoaXMuY3JlYXRlTW92ZUFubm90YXRpb24obW92ZSwgY29uc3VtZWRCcmlsbGlhbnQsIGFjdG9yKSk7XG4gICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk6IHZvaWQge1xuICAgIGNvbnN0IHVzYWdlID0gZGVyaXZlQnJpbGxpYW50VXNhZ2UodGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMpO1xuICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlY29uY2lsZUJyaWxsaWFudFRyYWNraW5nKFxuICAgICAgdGhpcy5nYW1lU2Vzc2lvbklkLFxuICAgICAgdXNhZ2UuYnJpbGxpYW50TW92ZU51bWJlcnMsXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVBdXRvUGxheU1vdmUoZGVsYXlNcyA9IHVpU3RhdGVWaWV3TW9kZWwuYXV0b1BsYXlEZWxheU1zKTogdm9pZCB7XG4gICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcblxuICAgIGlmICghdGhpcy5jYW5TY2hlZHVsZUF1dG9QbGF5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5hdXRvUGxheVNjaGVkdWxlZEZvciA9IERhdGUubm93KCkgKyBkZWxheU1zO1xuICAgIHRoaXMuX2F1dG9QbGF5VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmF1dG9QbGF5U2NoZWR1bGVkRm9yID0gMDtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zb2x2ZU5leHRNb3ZlKHRydWUpLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignQXV0by1wbGF5IGVycm9yOicsIGVycik7XG4gICAgICB9KTtcbiAgICB9LCBkZWxheU1zKTtcbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hdXRvUGxheVRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9hdXRvUGxheVRpbWVvdXQpO1xuICAgICAgdGhpcy5fYXV0b1BsYXlUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5hdXRvUGxheVNjaGVkdWxlZEZvciA9IDA7XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUGVuZGluZ1BsYXllck1vdmVBbmFseXNpcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGxheWVyTW92ZUFuYWx5c2lzVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3BsYXllck1vdmVBbmFseXNpc1RpbWVvdXQpO1xuICAgICAgdGhpcy5fcGxheWVyTW92ZUFuYWx5c2lzVGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZXNldFRyYW5zaWVudEJvYXJkU3RhdGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FuYWx5c2lzVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2FuYWx5c2lzVGltZW91dCk7XG4gICAgICB0aGlzLl9hbmFseXNpc1RpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgdGhpcy5jbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTtcbiAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTtcbiAgICB0aGlzLmF1dG9QbGF5UGF1c2VkID0gZmFsc2U7XG4gICAgdGhpcy5hdXRvUGxheVNjaGVkdWxlZEZvciA9IDA7XG4gICAgdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPSBudWxsO1xuICAgIHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcyA9IHt9O1xuICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID0gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgc3luY0F1dG9QbGF5U2NoZWR1bGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2FuU2NoZWR1bGVBdXRvUGxheSkge1xuICAgICAgdGhpcy5zY2hlZHVsZUF1dG9QbGF5TW92ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gIH1cblxuICBwcml2YXRlIHN0b3BBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0ICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmF1dG9QbGF5QWNjdW11bGF0ZWRNcyArPSBEYXRlLm5vdygpIC0gdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQ7XG4gICAgICB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdGFydEF1dG9QbGF5RHVyYXRpb25UcmFja2luZygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheUVuYWJsZWQgJiYgIXRoaXMuYXV0b1BsYXlQYXVzZWQgJiYgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUxhc3RBbm5vdGF0aW9uKHBhcnRpYWw6IFBhcnRpYWw8TW92ZUFubm90YXRpb24+KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGlzdG9yeUFubm90YXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RJbmRleCA9IHRoaXMuaGlzdG9yeUFubm90YXRpb25zLmxlbmd0aCAtIDE7XG4gICAgdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnNbbGFzdEluZGV4XSA9IHtcbiAgICAgIC4uLnRoaXMuaGlzdG9yeUFubm90YXRpb25zW2xhc3RJbmRleF0sXG4gICAgICAuLi5wYXJ0aWFsLFxuICAgIH07XG4gICAgdGhpcy5zYXZlRmVuVG9IaXN0b3J5KCk7XG4gIH1cblxuICBwcml2YXRlIHB1Ymxpc2hNb3ZlRmVlZGJhY2sob3B0aW9uczoge1xuICAgIGFjdG9yOiAncGxheWVyJyB8ICdlbmdpbmUnIHwgJ3JlZG8nO1xuICAgIG1vdmU6IE1vdmU7XG4gICAgaXNCcmlsbGlhbnQ6IGJvb2xlYW47XG4gICAgcXVhbGl0eUxhYmVsPzogc3RyaW5nIHwgbnVsbDtcbiAgICBidWNrZXQ/OiBEaXNwbGF5TW92ZUJ1Y2tldCB8IE1vdmVCdWNrZXQgfCBudWxsO1xuICAgIHNpbGVudD86IGJvb2xlYW47XG4gIH0pOiB2b2lkIHtcbiAgICB0aGlzLnJlY2VudE1vdmVGZWVkYmFjayA9IHtcbiAgICAgIGlkOiBgJHtEYXRlLm5vdygpfV8ke29wdGlvbnMubW92ZS5zYW59XyR7b3B0aW9ucy5hY3Rvcn1gLFxuICAgICAgYWN0b3I6IG9wdGlvbnMuYWN0b3IsXG4gICAgICBzYW46IG9wdGlvbnMubW92ZS5zYW4sXG4gICAgICBxdWFsaXR5TGFiZWw6IG9wdGlvbnMucXVhbGl0eUxhYmVsID8/IG51bGwsXG4gICAgICBidWNrZXQ6IG9wdGlvbnMuYnVja2V0ID8/IG51bGwsXG4gICAgICBpc0JyaWxsaWFudDogb3B0aW9ucy5pc0JyaWxsaWFudCxcbiAgICAgIGlzQ2FwdHVyZTogb3B0aW9ucy5tb3ZlLmlzQ2FwdHVyZSgpLFxuICAgICAgaXNDaGVjazogb3B0aW9ucy5tb3ZlLnNhbi5pbmNsdWRlcygnKycpIHx8IG9wdGlvbnMubW92ZS5zYW4uaW5jbHVkZXMoJyMnKSxcbiAgICAgIGlzR2FtZUVuZDogdGhpcy5pc0dhbWVPdmVyLFxuICAgICAgc2lsZW50OiBvcHRpb25zLnNpbGVudCA/PyBmYWxzZSxcbiAgICAgIGNyZWF0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSB1bmRvTW92ZXMoY291bnQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHVuZG9uZU1vdmVzOiBNb3ZlW10gPSBbXTtcbiAgICBjb25zdCB1bmRvbmVBbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGNvdW50OyBpbmRleCArPSAxKSB7XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy51bmRvKCk7XG4gICAgICBpZiAoIW1vdmUpIHtcbiAgICAgICAgZm9yIChsZXQgcmVzdG9yZUluZGV4ID0gdW5kb25lTW92ZXMubGVuZ3RoIC0gMTsgcmVzdG9yZUluZGV4ID49IDA7IHJlc3RvcmVJbmRleCAtPSAxKSB7XG4gICAgICAgICAgY29uc3QgcmVzdG9yZU1vdmUgPSB1bmRvbmVNb3Zlc1tyZXN0b3JlSW5kZXhdO1xuICAgICAgICAgIHRoaXMuY2hlc3MubW92ZSh7XG4gICAgICAgICAgICBmcm9tOiByZXN0b3JlTW92ZS5mcm9tIGFzIFNxdWFyZSxcbiAgICAgICAgICAgIHRvOiByZXN0b3JlTW92ZS50byBhcyBTcXVhcmUsXG4gICAgICAgICAgICBwcm9tb3Rpb246IHJlc3RvcmVNb3ZlLnByb21vdGlvbixcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHVuZG9uZU1vdmVzLnB1c2gobW92ZSk7XG4gICAgICBjb25zdCBhbm5vdGF0aW9uID0gdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMucG9wKCk7XG4gICAgICBpZiAoYW5ub3RhdGlvbikge1xuICAgICAgICB1bmRvbmVBbm5vdGF0aW9ucy5wdXNoKGFubm90YXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmVkb1N0YWNrLnB1c2goLi4udW5kb25lTW92ZXMpO1xuICAgIHRoaXMucmVkb0Fubm90YXRpb25zLnB1c2goLi4udW5kb25lQW5ub3RhdGlvbnMpO1xuICAgIHRoaXMuc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwcml2YXRlIHJlYWRQZXJzaXN0ZWRCb2FyZFN0YXRlKCk6IFBlcnNpc3RlZEJvYXJkU3RhdGUgfCBudWxsIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5wZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuQk9BUkRfU1RBVEVfU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKCFzYXZlZCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZCkgYXMgUGFydGlhbDxQZXJzaXN0ZWRCb2FyZFN0YXRlPjtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGN1cnJlbnRGZW46IHBhcnNlZC5jdXJyZW50RmVuID8/ICcnLFxuICAgICAgICBmZW5IaXN0b3J5OiBBcnJheS5pc0FycmF5KHBhcnNlZC5mZW5IaXN0b3J5KSA/IHBhcnNlZC5mZW5IaXN0b3J5IDogW10sXG4gICAgICAgIGdhbWVTZXNzaW9uSWQ6IHBhcnNlZC5nYW1lU2Vzc2lvbklkID8/IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKSxcbiAgICAgICAgZ2FtZVN0YXJ0RmVuOiBwYXJzZWQuZ2FtZVN0YXJ0RmVuID8/IHBhcnNlZC5jdXJyZW50RmVuID8/IG5ldyBDaGVzcygpLmZlbigpLFxuICAgICAgICBoaXN0b3J5QW5ub3RhdGlvbnM6IEFycmF5LmlzQXJyYXkocGFyc2VkLmhpc3RvcnlBbm5vdGF0aW9ucykgPyBwYXJzZWQuaGlzdG9yeUFubm90YXRpb25zIDogW10sXG4gICAgICAgIHJlZG9Bbm5vdGF0aW9uczogQXJyYXkuaXNBcnJheShwYXJzZWQucmVkb0Fubm90YXRpb25zKSA/IHBhcnNlZC5yZWRvQW5ub3RhdGlvbnMgOiBbXSxcbiAgICAgIH07XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUGVyc2lzdGVkQm9hcmRTdGF0ZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5CT0FSRF9TVEFURV9TVE9SQUdFX0tFWSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIGNsZWFyIGJvYXJkIHN0YXRlIHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUmVkb1N0YWNrRnJvbUFubm90YXRpb25zKGFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdKTogTW92ZVtdIHtcbiAgICByZXR1cm4gYW5ub3RhdGlvbnMubWFwKChhbm5vdGF0aW9uKSA9PiAoe1xuICAgICAgZnJvbTogYW5ub3RhdGlvbi51Y2kuc2xpY2UoMCwgMiksXG4gICAgICB0bzogYW5ub3RhdGlvbi51Y2kuc2xpY2UoMiwgNCksXG4gICAgICBwcm9tb3Rpb246IGFubm90YXRpb24udWNpLmxlbmd0aCA+IDQgPyBhbm5vdGF0aW9uLnVjaVs0XSA6IHVuZGVmaW5lZCxcbiAgICB9KSkgYXMgTW92ZVtdO1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGJvYXJkVmlld01vZGVsID0gbmV3IEJvYXJkVmlld01vZGVsKCk7XG4iLCAiaW1wb3J0IHsgTW92ZUFubm90YXRpb24gfSBmcm9tICcuL2JyaWxsaWFudFRyYWNraW5nJztcbmltcG9ydCB7IERpc3BsYXlNb3ZlQnVja2V0LCBNb3ZlUXVhbGl0eVByZXNldElkIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2FtZUFuYWx5dGljc1N1bW1hcnkge1xuICBzZXNzaW9uSWQ6IHN0cmluZztcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XG4gIGZpbmlzaGVkQXQ6IHN0cmluZztcbiAgcmVzdWx0OiBzdHJpbmc7XG4gIGdhbWVTdGF0dXM6IHN0cmluZztcbiAgcGVyc29uYUlkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgJ2N1c3RvbSc7XG4gIHBlcnNvbmFMYWJlbDogc3RyaW5nO1xuICBzZXR1cE5hbWU6IHN0cmluZztcbiAgc2V0dXBDYXRlZ29yeTogc3RyaW5nO1xuICBtb3ZlQ291bnQ6IG51bWJlcjtcbiAgYnJpbGxpYW50TW92ZXM6IG51bWJlcjtcbiAgaW5hY2N1cmFjaWVzOiBudW1iZXI7XG4gIG1pc3Rha2VzOiBudW1iZXI7XG4gIGJsdW5kZXJzOiBudW1iZXI7XG4gIGF2ZXJhZ2VFdmFsTG9zczogbnVtYmVyO1xuICBhdmVyYWdlTW92ZURlbGF5TXM6IG51bWJlcjtcbiAgYXV0b3BsYXlEdXJhdGlvbk1zOiBudW1iZXI7XG4gIHF1YWxpdHlDb3VudHM6IFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgbnVtYmVyPjtcbiAgY29tcGxleGl0eURpc3RyaWJ1dGlvbjogUmVjb3JkPCdsb3cnIHwgJ21lZGl1bScgfCAnaGlnaCcsIG51bWJlcj47XG4gIG1vdmVUaW1lbGluZTogQXJyYXk8e1xuICAgIHBseTogbnVtYmVyO1xuICAgIGFjdG9yOiAncGxheWVyJyB8ICdlbmdpbmUnIHwgJ3JlZG8nO1xuICAgIHNhbjogc3RyaW5nO1xuICAgIGJ1Y2tldDogc3RyaW5nIHwgbnVsbDtcbiAgICBldmFsTG9zczogbnVtYmVyIHwgbnVsbDtcbiAgICBldmFsdWF0aW9uOiBudW1iZXIgfCBudWxsO1xuICAgIGNvbXBsZXhpdHlMZXZlbDogJ2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJyB8IG51bGw7XG4gICAgY29tcGxleGl0eVNjb3JlOiBudW1iZXIgfCBudWxsO1xuICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiBudW1iZXI7XG4gICAgY29uc3VtZWRCcmlsbGlhbnQ6IGJvb2xlYW47XG4gIH0+O1xuICBoaWdobGlnaHRlZEJyaWxsaWFudE1vdmVzOiBBcnJheTx7IHBseTogbnVtYmVyOyBzYW46IHN0cmluZyB9PjtcbiAgbWFqb3JNaXN0YWtlczogQXJyYXk8eyBwbHk6IG51bWJlcjsgc2FuOiBzdHJpbmc7IGJ1Y2tldDogc3RyaW5nIHwgbnVsbDsgZXZhbExvc3M6IG51bWJlciB8IG51bGwgfT47XG4gIGV2YWxUcmVuZDogQXJyYXk8eyBwbHk6IG51bWJlcjsgZXZhbHVhdGlvbjogbnVtYmVyIH0+O1xuICBjb21wbGV4aXR5VHJlbmQ6IEFycmF5PHsgcGx5OiBudW1iZXI7IHNjb3JlOiBudW1iZXIgfT47XG4gIHBnbjogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlY2VudEdhbWVFbnRyeSB7XG4gIHNlc3Npb25JZDogc3RyaW5nO1xuICBmaW5pc2hlZEF0OiBzdHJpbmc7XG4gIHJlc3VsdDogc3RyaW5nO1xuICBwZXJzb25hTGFiZWw6IHN0cmluZztcbiAgcGVyc29uYUlkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgJ2N1c3RvbSc7XG4gIHNldHVwTmFtZTogc3RyaW5nO1xuICBkdXJhdGlvbk1zOiBudW1iZXI7XG4gIG1vdmVDb3VudDogbnVtYmVyO1xuICBicmlsbGlhbnRNb3ZlczogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkR2FtZUFuYWx5dGljc09wdGlvbnMge1xuICBzZXNzaW9uSWQ6IHN0cmluZztcbiAgY3JlYXRlZEF0TXM6IG51bWJlcjtcbiAgZmluaXNoZWRBdE1zOiBudW1iZXI7XG4gIGdhbWVTdGF0dXM6IHN0cmluZztcbiAgcGVyc29uYUlkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbDtcbiAgcGVyc29uYUxhYmVsOiBzdHJpbmc7XG4gIHNldHVwTmFtZT86IHN0cmluZyB8IG51bGw7XG4gIHNldHVwQ2F0ZWdvcnk/OiBzdHJpbmcgfCBudWxsO1xuICBhdXRvcGxheUR1cmF0aW9uTXM6IG51bWJlcjtcbiAgbW92ZUFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdO1xuICBwZ246IHN0cmluZztcbn1cblxuY29uc3QgQUxMX0JVQ0tFVFM6IERpc3BsYXlNb3ZlQnVja2V0W10gPSBbXG4gICdiZXN0JyxcbiAgJ2dyZWF0JyxcbiAgJ2V4Y2VsbGVudCcsXG4gICdnb29kJyxcbiAgJ2luYWNjdXJhY3knLFxuICAnbWlzdGFrZScsXG4gICdibHVuZGVyJyxcbiAgJ2ZhbGxiYWNrJyxcbl07XG5cbmZ1bmN0aW9uIGNyZWF0ZUVtcHR5UXVhbGl0eUNvdW50cygpOiBSZWNvcmQ8RGlzcGxheU1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICByZXR1cm4gQUxMX0JVQ0tFVFMucmVkdWNlKChjb3VudHMsIGJ1Y2tldCkgPT4ge1xuICAgIGNvdW50c1tidWNrZXRdID0gMDtcbiAgICByZXR1cm4gY291bnRzO1xuICB9LCB7fSBhcyBSZWNvcmQ8RGlzcGxheU1vdmVCdWNrZXQsIG51bWJlcj4pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2lmeVJlc3VsdChnYW1lU3RhdHVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoL2NoZWNrbWF0ZS9pLnRlc3QoZ2FtZVN0YXR1cykpIHtcbiAgICBjb25zdCB3aW5uZXIgPSBnYW1lU3RhdHVzLmluY2x1ZGVzKCdXaGl0ZSB3aW5zJykgPyAnV2hpdGUnIDogZ2FtZVN0YXR1cy5pbmNsdWRlcygnQmxhY2sgd2lucycpID8gJ0JsYWNrJyA6ICdEZWNpc2l2ZSc7XG4gICAgcmV0dXJuIGAke3dpbm5lcn0gd29uYDtcbiAgfVxuXG4gIGlmICgvc3RhbGVtYXRlfGRyYXcvaS50ZXN0KGdhbWVTdGF0dXMpKSB7XG4gICAgcmV0dXJuICdEcmF3JztcbiAgfVxuXG4gIGlmICgvY2hlY2svaS50ZXN0KGdhbWVTdGF0dXMpKSB7XG4gICAgcmV0dXJuICdJbiBwcm9ncmVzcyc7XG4gIH1cblxuICByZXR1cm4gJ0luIHByb2dyZXNzJztcbn1cblxuZnVuY3Rpb24gcm91bmRUb09uZURlY2ltYWwodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlICogMTApIC8gMTA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEdhbWVBbmFseXRpY3NTdW1tYXJ5KG9wdGlvbnM6IEJ1aWxkR2FtZUFuYWx5dGljc09wdGlvbnMpOiBHYW1lQW5hbHl0aWNzU3VtbWFyeSB7XG4gIGNvbnN0IHF1YWxpdHlDb3VudHMgPSBjcmVhdGVFbXB0eVF1YWxpdHlDb3VudHMoKTtcbiAgY29uc3QgY29tcGxleGl0eURpc3RyaWJ1dGlvbjogUmVjb3JkPCdsb3cnIHwgJ21lZGl1bScgfCAnaGlnaCcsIG51bWJlcj4gPSB7XG4gICAgbG93OiAwLFxuICAgIG1lZGl1bTogMCxcbiAgICBoaWdoOiAwLFxuICB9O1xuXG4gIGxldCBldmFsTG9zc1RvdGFsID0gMDtcbiAgbGV0IGV2YWxMb3NzQ291bnQgPSAwO1xuICBsZXQgZGVsYXlUb3RhbCA9IDA7XG4gIGxldCBkZWxheUNvdW50ID0gMDtcbiAgbGV0IGJyaWxsaWFudE1vdmVzID0gMDtcblxuICBjb25zdCBtb3ZlVGltZWxpbmUgPSBvcHRpb25zLm1vdmVBbm5vdGF0aW9ucy5tYXAoKGFubm90YXRpb24sIGluZGV4KSA9PiB7XG4gICAgY29uc3QgYnVja2V0ID0gKGFubm90YXRpb24uYnVja2V0ID8/IG51bGwpIGFzIHN0cmluZyB8IG51bGw7XG4gICAgY29uc3QgdHlwZWRCdWNrZXQgPSBBTExfQlVDS0VUUy5pbmNsdWRlcyhidWNrZXQgYXMgRGlzcGxheU1vdmVCdWNrZXQpXG4gICAgICA/IChidWNrZXQgYXMgRGlzcGxheU1vdmVCdWNrZXQpXG4gICAgICA6IG51bGw7XG5cbiAgICBpZiAodHlwZWRCdWNrZXQpIHtcbiAgICAgIHF1YWxpdHlDb3VudHNbdHlwZWRCdWNrZXRdICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKGFubm90YXRpb24uY29uc3VtZWRCcmlsbGlhbnQpIHtcbiAgICAgIGJyaWxsaWFudE1vdmVzICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhbm5vdGF0aW9uLmV2YWxMb3NzID09PSAnbnVtYmVyJykge1xuICAgICAgZXZhbExvc3NUb3RhbCArPSBhbm5vdGF0aW9uLmV2YWxMb3NzO1xuICAgICAgZXZhbExvc3NDb3VudCArPSAxO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYW5ub3RhdGlvbi5kZWxheU1zU2luY2VQcmV2aW91cyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRlbGF5VG90YWwgKz0gYW5ub3RhdGlvbi5kZWxheU1zU2luY2VQcmV2aW91cztcbiAgICAgIGRlbGF5Q291bnQgKz0gMTtcbiAgICB9XG5cbiAgICBpZiAoYW5ub3RhdGlvbi5jb21wbGV4aXR5TGV2ZWwpIHtcbiAgICAgIGNvbXBsZXhpdHlEaXN0cmlidXRpb25bYW5ub3RhdGlvbi5jb21wbGV4aXR5TGV2ZWxdICs9IDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBseTogaW5kZXggKyAxLFxuICAgICAgYWN0b3I6IGFubm90YXRpb24uYWN0b3IgPz8gJ3BsYXllcicsXG4gICAgICBzYW46IGFubm90YXRpb24uc2FuID8/IGFubm90YXRpb24udWNpLFxuICAgICAgYnVja2V0LFxuICAgICAgZXZhbExvc3M6IGFubm90YXRpb24uZXZhbExvc3MgPz8gbnVsbCxcbiAgICAgIGV2YWx1YXRpb246IGFubm90YXRpb24uZXZhbHVhdGlvbiA/PyBudWxsLFxuICAgICAgY29tcGxleGl0eUxldmVsOiBhbm5vdGF0aW9uLmNvbXBsZXhpdHlMZXZlbCA/PyBudWxsLFxuICAgICAgY29tcGxleGl0eVNjb3JlOiBhbm5vdGF0aW9uLmNvbXBsZXhpdHlTY29yZSA/PyBudWxsLFxuICAgICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IGFubm90YXRpb24uZGVsYXlNc1NpbmNlUHJldmlvdXMgPz8gMCxcbiAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiBhbm5vdGF0aW9uLmNvbnN1bWVkQnJpbGxpYW50LFxuICAgIH07XG4gIH0pO1xuXG4gIGNvbnN0IGhpZ2hsaWdodGVkQnJpbGxpYW50TW92ZXMgPSBtb3ZlVGltZWxpbmVcbiAgICAuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkuY29uc3VtZWRCcmlsbGlhbnQpXG4gICAgLm1hcCgoZW50cnkpID0+ICh7IHBseTogZW50cnkucGx5LCBzYW46IGVudHJ5LnNhbiB9KSk7XG4gIGNvbnN0IG1ham9yTWlzdGFrZXMgPSBtb3ZlVGltZWxpbmVcbiAgICAuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkuYnVja2V0ID09PSAnbWlzdGFrZScgfHwgZW50cnkuYnVja2V0ID09PSAnYmx1bmRlcicpXG4gICAgLm1hcCgoZW50cnkpID0+ICh7XG4gICAgICBwbHk6IGVudHJ5LnBseSxcbiAgICAgIHNhbjogZW50cnkuc2FuLFxuICAgICAgYnVja2V0OiBlbnRyeS5idWNrZXQsXG4gICAgICBldmFsTG9zczogZW50cnkuZXZhbExvc3MsXG4gICAgfSkpO1xuICBjb25zdCBldmFsVHJlbmQgPSBtb3ZlVGltZWxpbmVcbiAgICAuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIHR5cGVvZiBlbnRyeSAmIHsgZXZhbHVhdGlvbjogbnVtYmVyIH0gPT4gdHlwZW9mIGVudHJ5LmV2YWx1YXRpb24gPT09ICdudW1iZXInKVxuICAgIC5tYXAoKGVudHJ5KSA9PiAoeyBwbHk6IGVudHJ5LnBseSwgZXZhbHVhdGlvbjogZW50cnkuZXZhbHVhdGlvbiB9KSk7XG4gIGNvbnN0IGNvbXBsZXhpdHlUcmVuZCA9IG1vdmVUaW1lbGluZVxuICAgIC5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgdHlwZW9mIGVudHJ5ICYgeyBjb21wbGV4aXR5U2NvcmU6IG51bWJlciB9ID0+IHR5cGVvZiBlbnRyeS5jb21wbGV4aXR5U2NvcmUgPT09ICdudW1iZXInKVxuICAgIC5tYXAoKGVudHJ5KSA9PiAoeyBwbHk6IGVudHJ5LnBseSwgc2NvcmU6IGVudHJ5LmNvbXBsZXhpdHlTY29yZSB9KSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzZXNzaW9uSWQ6IG9wdGlvbnMuc2Vzc2lvbklkLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUob3B0aW9ucy5jcmVhdGVkQXRNcykudG9JU09TdHJpbmcoKSxcbiAgICBmaW5pc2hlZEF0OiBuZXcgRGF0ZShvcHRpb25zLmZpbmlzaGVkQXRNcykudG9JU09TdHJpbmcoKSxcbiAgICByZXN1bHQ6IGNsYXNzaWZ5UmVzdWx0KG9wdGlvbnMuZ2FtZVN0YXR1cyksXG4gICAgZ2FtZVN0YXR1czogb3B0aW9ucy5nYW1lU3RhdHVzLFxuICAgIHBlcnNvbmFJZDogb3B0aW9ucy5wZXJzb25hSWQgPz8gJ2N1c3RvbScsXG4gICAgcGVyc29uYUxhYmVsOiBvcHRpb25zLnBlcnNvbmFMYWJlbCxcbiAgICBzZXR1cE5hbWU6IG9wdGlvbnMuc2V0dXBOYW1lID8/ICdOZXcgR2FtZScsXG4gICAgc2V0dXBDYXRlZ29yeTogb3B0aW9ucy5zZXR1cENhdGVnb3J5ID8/ICdjdXN0b20nLFxuICAgIG1vdmVDb3VudDogbW92ZVRpbWVsaW5lLmxlbmd0aCxcbiAgICBicmlsbGlhbnRNb3ZlcyxcbiAgICBpbmFjY3VyYWNpZXM6IHF1YWxpdHlDb3VudHMuaW5hY2N1cmFjeSxcbiAgICBtaXN0YWtlczogcXVhbGl0eUNvdW50cy5taXN0YWtlLFxuICAgIGJsdW5kZXJzOiBxdWFsaXR5Q291bnRzLmJsdW5kZXIsXG4gICAgYXZlcmFnZUV2YWxMb3NzOiBldmFsTG9zc0NvdW50ID4gMCA/IHJvdW5kVG9PbmVEZWNpbWFsKGV2YWxMb3NzVG90YWwgLyBldmFsTG9zc0NvdW50KSA6IDAsXG4gICAgYXZlcmFnZU1vdmVEZWxheU1zOiBkZWxheUNvdW50ID4gMCA/IE1hdGgucm91bmQoZGVsYXlUb3RhbCAvIGRlbGF5Q291bnQpIDogMCxcbiAgICBhdXRvcGxheUR1cmF0aW9uTXM6IE1hdGgubWF4KDAsIG9wdGlvbnMuYXV0b3BsYXlEdXJhdGlvbk1zKSxcbiAgICBxdWFsaXR5Q291bnRzLFxuICAgIGNvbXBsZXhpdHlEaXN0cmlidXRpb24sXG4gICAgbW92ZVRpbWVsaW5lLFxuICAgIGhpZ2hsaWdodGVkQnJpbGxpYW50TW92ZXMsXG4gICAgbWFqb3JNaXN0YWtlcyxcbiAgICBldmFsVHJlbmQsXG4gICAgY29tcGxleGl0eVRyZW5kLFxuICAgIHBnbjogb3B0aW9ucy5wZ24sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlY2VudEdhbWVFbnRyeShzdW1tYXJ5OiBHYW1lQW5hbHl0aWNzU3VtbWFyeSk6IFJlY2VudEdhbWVFbnRyeSB7XG4gIHJldHVybiB7XG4gICAgc2Vzc2lvbklkOiBzdW1tYXJ5LnNlc3Npb25JZCxcbiAgICBmaW5pc2hlZEF0OiBzdW1tYXJ5LmZpbmlzaGVkQXQsXG4gICAgcmVzdWx0OiBzdW1tYXJ5LnJlc3VsdCxcbiAgICBwZXJzb25hTGFiZWw6IHN1bW1hcnkucGVyc29uYUxhYmVsLFxuICAgIHBlcnNvbmFJZDogc3VtbWFyeS5wZXJzb25hSWQsXG4gICAgc2V0dXBOYW1lOiBzdW1tYXJ5LnNldHVwTmFtZSxcbiAgICBkdXJhdGlvbk1zOiBNYXRoLm1heCgwLCBuZXcgRGF0ZShzdW1tYXJ5LmZpbmlzaGVkQXQpLmdldFRpbWUoKSAtIG5ldyBEYXRlKHN1bW1hcnkuY3JlYXRlZEF0KS5nZXRUaW1lKCkpLFxuICAgIG1vdmVDb3VudDogc3VtbWFyeS5tb3ZlQ291bnQsXG4gICAgYnJpbGxpYW50TW92ZXM6IHN1bW1hcnkuYnJpbGxpYW50TW92ZXMsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVHYW1lQW5hbHl0aWNzU3VtbWFyeShzdW1tYXJ5OiBHYW1lQW5hbHl0aWNzU3VtbWFyeSk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShzdW1tYXJ5LCBudWxsLCAyKTtcbn1cbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSwgcmVhY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIGJ1aWxkR2FtZUFuYWx5dGljc1N1bW1hcnksXG4gIGJ1aWxkUmVjZW50R2FtZUVudHJ5LFxuICBHYW1lQW5hbHl0aWNzU3VtbWFyeSxcbiAgUmVjZW50R2FtZUVudHJ5LFxuICBzZXJpYWxpemVHYW1lQW5hbHl0aWNzU3VtbWFyeSxcbn0gZnJvbSAnLi4vZW5naW5lL2dhbWVBbmFseXRpY3MnO1xuaW1wb3J0IHsgYm9hcmRWaWV3TW9kZWwsIEJvYXJkVmlld01vZGVsIH0gZnJvbSAnLi9Cb2FyZFZpZXdNb2RlbCc7XG5pbXBvcnQgeyBjb25maWdWaWV3TW9kZWwsIENvbmZpZ1ZpZXdNb2RlbCB9IGZyb20gJy4vQ29uZmlnVmlld01vZGVsJztcblxuY29uc3QgUkVDRU5UX0dBTUVTX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19yZWNlbnRfZ2FtZXMnO1xuY29uc3QgTUFYX1JFQ0VOVF9HQU1FUyA9IDIwO1xuXG5pbnRlcmZhY2UgUGVyc2lzdGVkQW5hbHl0aWNzU25hcHNob3Qge1xuICByZWNlbnRHYW1lczogR2FtZUFuYWx5dGljc1N1bW1hcnlbXTtcbn1cblxuaW50ZXJmYWNlIEdhbWVBbmFseXRpY3NEZXBlbmRlbmNpZXMge1xuICBib2FyZFZpZXdNb2RlbDogUGljazxcbiAgICBCb2FyZFZpZXdNb2RlbCxcbiAgICB8ICdkZWJ1Z1Nlc3Npb25JZCdcbiAgICB8ICdtb3ZlQW5ub3RhdGlvbnMnXG4gICAgfCAnc2Vzc2lvblN0YXJ0ZWRBdCdcbiAgICB8ICdnYW1lU3RhdHVzJ1xuICAgIHwgJ3BnbidcbiAgICB8ICdjdXJyZW50U2V0dXBOYW1lJ1xuICAgIHwgJ2N1cnJlbnRTZXR1cENhdGVnb3J5J1xuICAgIHwgJ2F1dG9QbGF5QWN0aXZlRHVyYXRpb25NcydcbiAgICB8ICdpc0dhbWVPdmVyJ1xuICA+O1xuICBjb25maWdWaWV3TW9kZWw6IFBpY2s8Q29uZmlnVmlld01vZGVsLCAnYWN0aXZlUGVyc29uYUlkJyB8ICdhY3RpdmVQZXJzb25hTGFiZWwnPjtcbn1cblxuZnVuY3Rpb24gZG93bmxvYWRUZXh0RmlsZShmaWxlTmFtZTogc3RyaW5nLCBjb250ZW50czogc3RyaW5nLCBtaW1lVHlwZTogc3RyaW5nKTogdm9pZCB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjb250ZW50c10sIHsgdHlwZTogbWltZVR5cGUgfSk7XG4gIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gIGNvbnN0IGFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgYW5jaG9yLmhyZWYgPSB1cmw7XG4gIGFuY2hvci5kb3dubG9hZCA9IGZpbGVOYW1lO1xuICBhbmNob3IuY2xpY2soKTtcbiAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xufVxuXG5mdW5jdGlvbiBzYWZlUGFyc2VSZWNlbnRHYW1lcyhzYXZlZDogc3RyaW5nIHwgbnVsbCk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5W10ge1xuICBpZiAoIXNhdmVkKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHNhdmVkKSBhcyBQZXJzaXN0ZWRBbmFseXRpY3NTbmFwc2hvdCB8IEdhbWVBbmFseXRpY3NTdW1tYXJ5W107XG4gICAgY29uc3QgcmVjZW50R2FtZXMgPSBBcnJheS5pc0FycmF5KHBhcnNlZClcbiAgICAgID8gcGFyc2VkXG4gICAgICA6IEFycmF5LmlzQXJyYXkocGFyc2VkLnJlY2VudEdhbWVzKVxuICAgICAgICA/IHBhcnNlZC5yZWNlbnRHYW1lc1xuICAgICAgICA6IFtdO1xuXG4gICAgcmV0dXJuIHJlY2VudEdhbWVzLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyBHYW1lQW5hbHl0aWNzU3VtbWFyeSA9PiAoXG4gICAgICB0eXBlb2YgZW50cnk/LnNlc3Npb25JZCA9PT0gJ3N0cmluZydcbiAgICAgICYmIHR5cGVvZiBlbnRyeT8uZmluaXNoZWRBdCA9PT0gJ3N0cmluZydcbiAgICAgICYmIHR5cGVvZiBlbnRyeT8ucGVyc29uYUxhYmVsID09PSAnc3RyaW5nJ1xuICAgICAgJiYgdHlwZW9mIGVudHJ5Py5zZXR1cE5hbWUgPT09ICdzdHJpbmcnXG4gICAgKSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCB7XG4gIHN1bW1hcnlPcGVuID0gZmFsc2U7XG4gIHJlY2VudEdhbWVzOiBHYW1lQW5hbHl0aWNzU3VtbWFyeVtdID0gW107XG4gIHNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGxhc3RDYXB0dXJlZFNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkZXBzOiBHYW1lQW5hbHl0aWNzRGVwZW5kZW5jaWVzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRlcHM6IEdhbWVBbmFseXRpY3NEZXBlbmRlbmNpZXMgPSB7XG4gICAgICBib2FyZFZpZXdNb2RlbCxcbiAgICAgIGNvbmZpZ1ZpZXdNb2RlbCxcbiAgICB9LFxuICApIHtcbiAgICB0aGlzLmRlcHMgPSBkZXBzO1xuXG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldFN1bW1hcnlPcGVuOiBhY3Rpb24sXG4gICAgICBzZXRTZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQ6IGFjdGlvbixcbiAgICAgIGNhcHR1cmVDb21wbGV0ZWRHYW1lOiBhY3Rpb24sXG4gICAgICBjbGVhclJlY2VudEdhbWVzOiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc3RvcmVGcm9tU3RvcmFnZSgpO1xuXG4gICAgcmVhY3Rpb24oXG4gICAgICAoKSA9PiAoe1xuICAgICAgICBzZXNzaW9uSWQ6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5kZWJ1Z1Nlc3Npb25JZCxcbiAgICAgICAgaXNHYW1lT3ZlcjogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmlzR2FtZU92ZXIsXG4gICAgICAgIG1vdmVDb3VudDogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLm1vdmVBbm5vdGF0aW9ucy5sZW5ndGgsXG4gICAgICB9KSxcbiAgICAgICh7IHNlc3Npb25JZCwgaXNHYW1lT3ZlciwgbW92ZUNvdW50IH0pID0+IHtcbiAgICAgICAgaWYgKGlzR2FtZU92ZXIgJiYgbW92ZUNvdW50ID4gMCAmJiB0aGlzLmxhc3RDYXB0dXJlZFNlc3Npb25JZCAhPT0gc2Vzc2lvbklkKSB7XG4gICAgICAgICAgdGhpcy5jYXB0dXJlQ29tcGxldGVkR2FtZSgpO1xuICAgICAgICAgIHRoaXMuc3VtbWFyeU9wZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICBzZXRTdW1tYXJ5T3BlbihvcGVuOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKG9wZW4pIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5zdW1tYXJ5T3BlbiA9IG9wZW47XG4gIH1cblxuICBzZXRTZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQoc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSBzZXNzaW9uSWQ7XG4gIH1cblxuICBjYXB0dXJlQ29tcGxldGVkR2FtZSgpOiB2b2lkIHtcbiAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5jdXJyZW50U3VtbWFyeTtcbiAgICBpZiAoIXN1bW1hcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGVkID0gW3N1bW1hcnksIC4uLnRoaXMucmVjZW50R2FtZXMuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkuc2Vzc2lvbklkICE9PSBzdW1tYXJ5LnNlc3Npb25JZCldXG4gICAgICAuc2xpY2UoMCwgTUFYX1JFQ0VOVF9HQU1FUyk7XG4gICAgdGhpcy5yZWNlbnRHYW1lcyA9IHVwZGF0ZWQ7XG4gICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSBzdW1tYXJ5LnNlc3Npb25JZDtcbiAgICB0aGlzLmxhc3RDYXB0dXJlZFNlc3Npb25JZCA9IHN1bW1hcnkuc2Vzc2lvbklkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgY2xlYXJSZWNlbnRHYW1lcygpOiB2b2lkIHtcbiAgICB0aGlzLnJlY2VudEdhbWVzID0gW107XG4gICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSBudWxsO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgZXhwb3J0Q3VycmVudFN1bW1hcnkoKTogdm9pZCB7XG4gICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuY3VycmVudFN1bW1hcnk7XG4gICAgaWYgKCFzdW1tYXJ5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZG93bmxvYWRUZXh0RmlsZShgcGVyc29uYWNoZXNzLXN1bW1hcnktJHtzdW1tYXJ5LnNlc3Npb25JZH0uanNvbmAsIHNlcmlhbGl6ZUdhbWVBbmFseXRpY3NTdW1tYXJ5KHN1bW1hcnkpLCAnYXBwbGljYXRpb24vanNvbicpO1xuICB9XG5cbiAgZXhwb3J0Q3VycmVudFBnbigpOiB2b2lkIHtcbiAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5jdXJyZW50U3VtbWFyeTtcbiAgICBpZiAoIXN1bW1hcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkb3dubG9hZFRleHRGaWxlKGBwZXJzb25hY2hlc3MtZ2FtZS0ke3N1bW1hcnkuc2Vzc2lvbklkfS5wZ25gLCBzdW1tYXJ5LnBnbiwgJ2FwcGxpY2F0aW9uL3gtY2hlc3MtcGduJyk7XG4gIH1cblxuICBnZXQgY3VycmVudFN1bW1hcnkoKTogR2FtZUFuYWx5dGljc1N1bW1hcnkgfCBudWxsIHtcbiAgICBjb25zdCBhbm5vdGF0aW9ucyA9IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5tb3ZlQW5ub3RhdGlvbnM7XG4gICAgaWYgKGFubm90YXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWxkR2FtZUFuYWx5dGljc1N1bW1hcnkoe1xuICAgICAgc2Vzc2lvbklkOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuZGVidWdTZXNzaW9uSWQsXG4gICAgICBjcmVhdGVkQXRNczogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLnNlc3Npb25TdGFydGVkQXQsXG4gICAgICBmaW5pc2hlZEF0TXM6IERhdGUubm93KCksXG4gICAgICBnYW1lU3RhdHVzOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuZ2FtZVN0YXR1cyxcbiAgICAgIHBlcnNvbmFJZDogdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5hY3RpdmVQZXJzb25hSWQsXG4gICAgICBwZXJzb25hTGFiZWw6IHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuYWN0aXZlUGVyc29uYUxhYmVsLFxuICAgICAgc2V0dXBOYW1lOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuY3VycmVudFNldHVwTmFtZSxcbiAgICAgIHNldHVwQ2F0ZWdvcnk6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5jdXJyZW50U2V0dXBDYXRlZ29yeSxcbiAgICAgIGF1dG9wbGF5RHVyYXRpb25NczogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmF1dG9QbGF5QWN0aXZlRHVyYXRpb25NcyxcbiAgICAgIG1vdmVBbm5vdGF0aW9uczogYW5ub3RhdGlvbnMsXG4gICAgICBwZ246IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5wZ24sXG4gICAgfSk7XG4gIH1cblxuICBnZXQgc2VsZWN0ZWRSZWNlbnRHYW1lKCk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucmVjZW50R2FtZXMuZmluZCgoZW50cnkpID0+IGVudHJ5LnNlc3Npb25JZCA9PT0gdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQpID8/IG51bGw7XG4gIH1cblxuICBnZXQgcmVjZW50R2FtZUVudHJpZXMoKTogUmVjZW50R2FtZUVudHJ5W10ge1xuICAgIHJldHVybiB0aGlzLnJlY2VudEdhbWVzLm1hcCgoc3VtbWFyeSkgPT4gYnVpbGRSZWNlbnRHYW1lRW50cnkoc3VtbWFyeSkpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMucmVjZW50R2FtZXMgPSBzYWZlUGFyc2VSZWNlbnRHYW1lcyhsb2NhbFN0b3JhZ2UuZ2V0SXRlbShSRUNFTlRfR0FNRVNfU1RPUkFHRV9LRVkpKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkID0gdGhpcy5yZWNlbnRHYW1lc1swXT8uc2Vzc2lvbklkID8/IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aGlzLnJlY2VudEdhbWVzID0gW107XG4gICAgICB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0VG9TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzbmFwc2hvdDogUGVyc2lzdGVkQW5hbHl0aWNzU25hcHNob3QgPSB7XG4gICAgICAgIHJlY2VudEdhbWVzOiB0aGlzLnJlY2VudEdhbWVzLFxuICAgICAgfTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFJFQ0VOVF9HQU1FU19TVE9SQUdFX0tFWSwgSlNPTi5zdHJpbmdpZnkoc25hcHNob3QpKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBsb2NhbFN0b3JhZ2UgZmFpbHVyZXMgYW5kIGtlZXAgYW5hbHl0aWNzIGF2YWlsYWJsZSBmb3IgdGhlIGN1cnJlbnQgc2Vzc2lvbi5cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGdhbWVBbmFseXRpY3NWaWV3TW9kZWwgPSBuZXcgR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCgpO1xuIiwgIi8qKlxuICogUHJlZGVmaW5lZCBjaGVzcyBvcGVuaW5ncyAoUEdOIG1vdmUgc2VxdWVuY2VzKVxuICogVXNlZCB0byBsb2FkIGEgcG9zaXRpb24gYWZ0ZXIgdGhlIGdpdmVuIG1vdmVzIGZyb20gdGhlIGluaXRpYWwgcG9zaXRpb24uXG4gKi9cblxuZXhwb3J0IHR5cGUgT3BlbmluZ1NpZGUgPSAnd2hpdGUnIHwgJ2JsYWNrJztcblxuZXhwb3J0IGludGVyZmFjZSBPcGVuaW5nIHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICAvKiogV2hpY2ggc2lkZSBwbGF5cyB0aGlzIG9wZW5pbmcgKHRoZSBvcGVuaW5nIGlzIG5hbWVkIGZyb20gdGhpcyBzaWRlJ3MgcGVyc3BlY3RpdmUpICovXG4gIHNpZGU6IE9wZW5pbmdTaWRlO1xuICAvKiogU2hvcnQgZGVzY3JpcHRpb24gb3IgRUNPLXN0eWxlIHRhZyAqL1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgLyoqIFBHTiBtb3ZlIHNlcXVlbmNlIGZyb20gdGhlIHN0YXJ0aW5nIHBvc2l0aW9uIChlLmcuIFwiMS4gZTQgZTUgMi4gUWg1XCIpICovXG4gIHBnbjogc3RyaW5nO1xufVxuXG4vKiogQnVpbGQgbWluaW1hbCBQR04gZm9yIGNoZXNzLmpzIChoZWFkZXJzICsgYmxhbmsgbGluZSArIG1vdmVzICsgcmVzdWx0KSAqL1xuZnVuY3Rpb24gcGduKG1vdmVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtb3ZlVGV4dCA9IG1vdmVzLnRyaW0oKS5lbmRzV2l0aCgnKicpID8gbW92ZXMudHJpbSgpIDogYCR7bW92ZXMudHJpbSgpfSAqYDtcbiAgcmV0dXJuIGBbRXZlbnQgXCI/XCJdXFxuW1NpdGUgXCI/XCJdXFxuW0RhdGUgXCI/Pz8/Lj8/Lj8/XCJdXFxuW1doaXRlIFwiP1wiXVxcbltCbGFjayBcIj9cIl1cXG5bUmVzdWx0IFwiKlwiXVxcblxcbiR7bW92ZVRleHR9YDtcbn1cblxuZXhwb3J0IGNvbnN0IFBSRURFRklORURfT1BFTklOR1M6IE9wZW5pbmdbXSA9IFtcbiAge1xuICAgIGlkOiAnbmFwb2xlb24nLFxuICAgIG5hbWU6IFwiS2luZydzIFBhd246IE5hcG9sZW9uIEF0dGFja1wiLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBlNSAyLiBRaDUnLFxuICAgIHBnbjogcGduKCcxLiBlNCBlNSAyLiBRaDUnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAnaXRhbGlhbicsXG4gICAgbmFtZTogXCJJdGFsaWFuIEdhbWVcIixcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgZTUgMi4gTmYzIE5jNiAzLiBCYzQnLFxuICAgIHBnbjogcGduKCcxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJjNCcpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdydXlfbG9wZXonLFxuICAgIG5hbWU6ICdSdXkgTG9wZXonLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJiNScsXG4gICAgcGduOiBwZ24oJzEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmI1JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ3NpY2lsaWFuJyxcbiAgICBuYW1lOiAnU2ljaWxpYW4gRGVmZW5zZScsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGM1JyxcbiAgICBwZ246IHBnbignMS4gZTQgYzUnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAnZnJlbmNoJyxcbiAgICBuYW1lOiAnRnJlbmNoIERlZmVuc2UnLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBlNicsXG4gICAgcGduOiBwZ24oJzEuIGU0IGU2JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ2Nhcm9fa2FubicsXG4gICAgbmFtZTogJ0Nhcm8tS2FubicsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGM2JyxcbiAgICBwZ246IHBnbignMS4gZTQgYzYnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAncXVlZW5zX2dhbWJpdCcsXG4gICAgbmFtZTogXCJRdWVlbidzIEdhbWJpdFwiLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGVzY3JpcHRpb246ICcxLiBkNCBkNSAyLiBjNCcsXG4gICAgcGduOiBwZ24oJzEuIGQ0IGQ1IDIuIGM0JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ2xvbmRvbicsXG4gICAgbmFtZTogJ0xvbmRvbiBTeXN0ZW0nLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGVzY3JpcHRpb246ICcxLiBkNCBkNSAyLiBCZjQnLFxuICAgIHBnbjogcGduKCcxLiBkNCBkNSAyLiBCZjQnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAna2luZ3NfaW5kaWFuJyxcbiAgICBuYW1lOiBcIktpbmcncyBJbmRpYW4gRGVmZW5zZVwiLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGVzY3JpcHRpb246ICcxLiBkNCBOZjYgMi4gYzQgZzYnLFxuICAgIHBnbjogcGduKCcxLiBkNCBOZjYgMi4gYzQgZzYnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAncGlyYycsXG4gICAgbmFtZTogJ1BpcmMgRGVmZW5zZScsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGQ2IDIuIGQ0IE5mNicsXG4gICAgcGduOiBwZ24oJzEuIGU0IGQ2IDIuIGQ0IE5mNicpLFxuICB9LFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9wZW5pbmdCeUlkKGlkOiBzdHJpbmcpOiBPcGVuaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIFBSRURFRklORURfT1BFTklOR1MuZmluZChvID0+IG8uaWQgPT09IGlkKTtcbn1cbiIsICJpbXBvcnQgeyBnZXRPcGVuaW5nQnlJZCwgT3BlbmluZ1NpZGUsIFBSRURFRklORURfT1BFTklOR1MgfSBmcm9tICcuL29wZW5pbmdzJztcblxuZXhwb3J0IHR5cGUgR2FtZVNldHVwQ2F0ZWdvcnkgPSAnb3BlbmluZ3MnIHwgJ3RhY3RpY2FsJyB8ICdlbmRnYW1lcycgfCAnY3VzdG9tLWZlbicgfCAnY3VzdG9tLXBnbic7XG5leHBvcnQgdHlwZSBHYW1lU2V0dXBEaWZmaWN1bHR5ID0gJ2Vhc3knIHwgJ21lZGl1bScgfCAnaGFyZCc7XG5leHBvcnQgdHlwZSBHYW1lU2V0dXBTb3VyY2VUeXBlID0gJ2ZlbicgfCAncGduJztcblxuZXhwb3J0IGludGVyZmFjZSBHYW1lU2V0dXBQcmVzZXQge1xuICBpZDogc3RyaW5nO1xuICBjYXRlZ29yeTogRXhjbHVkZTxHYW1lU2V0dXBDYXRlZ29yeSwgJ2N1c3RvbS1mZW4nIHwgJ2N1c3RvbS1wZ24nPjtcbiAgbmFtZTogc3RyaW5nO1xuICBzaWRlOiBPcGVuaW5nU2lkZTtcbiAgZGlmZmljdWx0eTogR2FtZVNldHVwRGlmZmljdWx0eTtcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgdGFnczogc3RyaW5nW107XG4gIHNvdXJjZVR5cGU6IEdhbWVTZXR1cFNvdXJjZVR5cGU7XG4gIHNvdXJjZTogc3RyaW5nO1xufVxuXG5leHBvcnQgY29uc3QgR0FNRV9TRVRVUF9DQVRFR09SWV9PUFRJT05TOiBBcnJheTx7IHZhbHVlOiBHYW1lU2V0dXBDYXRlZ29yeTsgbGFiZWw6IHN0cmluZyB9PiA9IFtcbiAgeyB2YWx1ZTogJ29wZW5pbmdzJywgbGFiZWw6ICdPcGVuaW5ncycgfSxcbiAgeyB2YWx1ZTogJ3RhY3RpY2FsJywgbGFiZWw6ICdUYWN0aWNhbCBwb3NpdGlvbnMnIH0sXG4gIHsgdmFsdWU6ICdlbmRnYW1lcycsIGxhYmVsOiAnRW5kZ2FtZXMnIH0sXG4gIHsgdmFsdWU6ICdjdXN0b20tZmVuJywgbGFiZWw6ICdDdXN0b20gRkVOJyB9LFxuICB7IHZhbHVlOiAnY3VzdG9tLXBnbicsIGxhYmVsOiAnQ3VzdG9tIFBHTicgfSxcbl07XG5cbmZ1bmN0aW9uIG9wZW5pbmdEaWZmaWN1bHR5VGFnKG5hbWU6IHN0cmluZyk6IEdhbWVTZXR1cERpZmZpY3VsdHkge1xuICBpZiAoL25hcG9sZW9uL2kudGVzdChuYW1lKSkge1xuICAgIHJldHVybiAnZWFzeSc7XG4gIH1cblxuICBpZiAoL2l0YWxpYW58bG9uZG9ufHF1ZWVuL2kudGVzdChuYW1lKSkge1xuICAgIHJldHVybiAnbWVkaXVtJztcbiAgfVxuXG4gIHJldHVybiAnaGFyZCc7XG59XG5cbmNvbnN0IE9QRU5JTkdfUFJFU0VUUzogR2FtZVNldHVwUHJlc2V0W10gPSBQUkVERUZJTkVEX09QRU5JTkdTLm1hcCgob3BlbmluZykgPT4gKHtcbiAgaWQ6IG9wZW5pbmcuaWQsXG4gIGNhdGVnb3J5OiAnb3BlbmluZ3MnLFxuICBuYW1lOiBvcGVuaW5nLm5hbWUsXG4gIHNpZGU6IG9wZW5pbmcuc2lkZSxcbiAgZGlmZmljdWx0eTogb3BlbmluZ0RpZmZpY3VsdHlUYWcob3BlbmluZy5uYW1lKSxcbiAgZGVzY3JpcHRpb246IG9wZW5pbmcuZGVzY3JpcHRpb24gPz8gYCR7b3BlbmluZy5uYW1lfSBzZXR1cGAsXG4gIHRhZ3M6IFsnb3BlbmluZycsIG9wZW5pbmcuc2lkZSwgb3BlbmluZy5uYW1lLnRvTG93ZXJDYXNlKCldLFxuICBzb3VyY2VUeXBlOiAncGduJyxcbiAgc291cmNlOiBvcGVuaW5nLnBnbixcbn0pKTtcblxuY29uc3QgVEFDVElDQUxfUFJFU0VUUzogR2FtZVNldHVwUHJlc2V0W10gPSBbXG4gIHtcbiAgICBpZDogJ3RhY3RpYy1iYWNrLXJhbmstbmV0JyxcbiAgICBjYXRlZ29yeTogJ3RhY3RpY2FsJyxcbiAgICBuYW1lOiAnQmFjayBSYW5rIE5ldCcsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkaWZmaWN1bHR5OiAnbWVkaXVtJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doaXRlIHRvIG1vdmUgd2l0aCBhIGRpcmVjdCBhdHRhY2tpbmcgaWRlYSBhZ2FpbnN0IGFuIGV4cG9zZWQgYmFjayByYW5rLicsXG4gICAgdGFnczogWyd0YWN0aWNhbCcsICdtYXRlLXRocmVhdCcsICdhdHRhY2snLCAnd2hpdGUtdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJzZrMS81cHBwLzNRNC84LzgvOC81UFBQLzZLMSB3IC0gLSAwIDEnLFxuICB9LFxuICB7XG4gICAgaWQ6ICd0YWN0aWMta25pZ2h0LWZvcmsnLFxuICAgIGNhdGVnb3J5OiAndGFjdGljYWwnLFxuICAgIG5hbWU6ICdLbmlnaHQgRm9yayBPcHBvcnR1bml0eScsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkaWZmaWN1bHR5OiAnZWFzeScsXG4gICAgZGVzY3JpcHRpb246ICdBIHRyYWluaW5nIHBvc2l0aW9uIGJ1aWx0IGFyb3VuZCBzcG90dGluZyBhIHNpbXBsZSBmb3JrIG1vdGlmLicsXG4gICAgdGFnczogWyd0YWN0aWNhbCcsICdmb3JrJywgJ3doaXRlLXRvLW1vdmUnXSxcbiAgICBzb3VyY2VUeXBlOiAnZmVuJyxcbiAgICBzb3VyY2U6ICdyM2syci9wcHBxMXBwcC8ybnBibjIvM05wMy8yQjFQMy8yTjUvUFBQMlBQUC9SMUJRMVJLMSB3IGtxIC0gMCAxJyxcbiAgfSxcbiAge1xuICAgIGlkOiAndGFjdGljLWRlZmxlY3Rpb24nLFxuICAgIGNhdGVnb3J5OiAndGFjdGljYWwnLFxuICAgIG5hbWU6ICdEZWZsZWN0aW9uIFN0cmlrZScsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkaWZmaWN1bHR5OiAnaGFyZCcsXG4gICAgZGVzY3JpcHRpb246ICdCbGFjayB0byBtb3ZlIGluIGEgc2hhcnAgbWlkZGxlZ2FtZSB3aGVyZSBjYWxjdWxhdGlvbiBtYXR0ZXJzIG1vcmUgdGhhbiBtZW1vcml6YXRpb24uJyxcbiAgICB0YWdzOiBbJ3RhY3RpY2FsJywgJ2RlZmxlY3Rpb24nLCAnY2FsY3VsYXRpb24nLCAnYmxhY2stdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJ3IycTFyazEvcHAxYjFwcHAvMm4xcG4yLzJicDQvMlA1LzJOUDFOUDEvUFAyUFBCUC9SMUJRMVJLMSBiIC0gLSA0IDknLFxuICB9LFxuXTtcblxuY29uc3QgRU5ER0FNRV9QUkVTRVRTOiBHYW1lU2V0dXBQcmVzZXRbXSA9IFtcbiAge1xuICAgIGlkOiAnZW5kZ2FtZS1sdWNlbmEtYnJpZGdlJyxcbiAgICBjYXRlZ29yeTogJ2VuZGdhbWVzJyxcbiAgICBuYW1lOiAnTHVjZW5hIEJyaWRnZSBTZXR1cCcsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkaWZmaWN1bHR5OiAnaGFyZCcsXG4gICAgZGVzY3JpcHRpb246ICdDbGFzc2ljIHJvb2sgZW5kZ2FtZSBjb252ZXJzaW9uIHByYWN0aWNlIHdpdGggV2hpdGUgcHJlc3NpbmcgZm9yIHRoZSB3aW4uJyxcbiAgICB0YWdzOiBbJ2VuZGdhbWUnLCAncm9vaycsICdsdWNlbmEnLCAnd2hpdGUtdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJzgvMms1LzJQNS8yS1I0LzgvOC84LzggdyAtIC0gMCAxJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnZW5kZ2FtZS1vcHBvc2l0aW9uJyxcbiAgICBjYXRlZ29yeTogJ2VuZGdhbWVzJyxcbiAgICBuYW1lOiAnS2luZyBPcHBvc2l0aW9uJyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRpZmZpY3VsdHk6ICdlYXN5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0EgcHVyZSBraW5nLWFuZC1wYXduIGVuZGluZyBmb2N1c2VkIG9uIGdhaW5pbmcgb3Bwb3NpdGlvbiBjbGVhbmx5LicsXG4gICAgdGFnczogWydlbmRnYW1lJywgJ2tpbmctYW5kLXBhd24nLCAnb3Bwb3NpdGlvbicsICd3aGl0ZS10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAnOC84LzgvM2s0LzNQNC80SzMvOC84IHcgLSAtIDAgMScsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2VuZGdhbWUtcXVlZW4tdnMtcGF3bicsXG4gICAgY2F0ZWdvcnk6ICdlbmRnYW1lcycsXG4gICAgbmFtZTogJ1F1ZWVuIHZzIFBhc3NlZCBQYXduJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRpZmZpY3VsdHk6ICdtZWRpdW0nLFxuICAgIGRlc2NyaXB0aW9uOiAnQmxhY2sgZGVmZW5kcyBhZ2FpbnN0IHByb21vdGlvbiB0aHJlYXRzIGluIGEgcHJlY2lzZSBxdWVlbiBlbmRpbmcuJyxcbiAgICB0YWdzOiBbJ2VuZGdhbWUnLCAncXVlZW4nLCAncGFzc2VkLXBhd24nLCAnYmxhY2stdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJzZrMS81cHAxLzgvOC84LzZRMS81UDIvNksxIGIgLSAtIDAgMScsXG4gIH0sXG5dO1xuXG5leHBvcnQgY29uc3QgR0FNRV9TRVRVUF9QUkVTRVRTOiBHYW1lU2V0dXBQcmVzZXRbXSA9IFtcbiAgLi4uT1BFTklOR19QUkVTRVRTLFxuICAuLi5UQUNUSUNBTF9QUkVTRVRTLFxuICAuLi5FTkRHQU1FX1BSRVNFVFMsXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0R2FtZVNldHVwUHJlc2V0QnlJZChpZDogc3RyaW5nKTogR2FtZVNldHVwUHJlc2V0IHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEdBTUVfU0VUVVBfUFJFU0VUUy5maW5kKChwcmVzZXQpID0+IHByZXNldC5pZCA9PT0gaWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3BlbmluZ1ByZXNldEJ5SWQoaWQ6IHN0cmluZyk6IEdhbWVTZXR1cFByZXNldCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBPUEVOSU5HX1BSRVNFVFMuZmluZCgocHJlc2V0KSA9PiBwcmVzZXQuaWQgPT09IGlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckdhbWVTZXR1cFByZXNldHMoXG4gIHByZXNldHM6IEdhbWVTZXR1cFByZXNldFtdLFxuICBjYXRlZ29yeTogR2FtZVNldHVwQ2F0ZWdvcnksXG4gIHF1ZXJ5OiBzdHJpbmcsXG4pOiBHYW1lU2V0dXBQcmVzZXRbXSB7XG4gIGlmIChjYXRlZ29yeSA9PT0gJ2N1c3RvbS1mZW4nIHx8IGNhdGVnb3J5ID09PSAnY3VzdG9tLXBnbicpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBub3JtYWxpemVkUXVlcnkgPSBxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKTtcblxuICByZXR1cm4gcHJlc2V0cy5maWx0ZXIoKHByZXNldCkgPT4ge1xuICAgIGlmIChwcmVzZXQuY2F0ZWdvcnkgIT09IGNhdGVnb3J5KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFub3JtYWxpemVkUXVlcnkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGhheXN0YWNrID0gW1xuICAgICAgcHJlc2V0Lm5hbWUsXG4gICAgICBwcmVzZXQuZGVzY3JpcHRpb24sXG4gICAgICBwcmVzZXQuc2lkZSxcbiAgICAgIHByZXNldC5kaWZmaWN1bHR5LFxuICAgICAgLi4ucHJlc2V0LnRhZ3MsXG4gICAgXS5qb2luKCcgJykudG9Mb3dlckNhc2UoKTtcblxuICAgIHJldHVybiBoYXlzdGFjay5pbmNsdWRlcyhub3JtYWxpemVkUXVlcnkpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlR2FtZVNldHVwUHJlc2V0KHByZXNldDogR2FtZVNldHVwUHJlc2V0KTogc3RyaW5nIHtcbiAgY29uc3Qgc2lkZUxhYmVsID0gcHJlc2V0LnNpZGUgPT09ICd3aGl0ZScgPyAnV2hpdGUnIDogJ0JsYWNrJztcbiAgcmV0dXJuIGAke3ByZXNldC5uYW1lfSBcdTIwMjIgJHtzaWRlTGFiZWx9IFx1MjAyMiAke3ByZXNldC5kaWZmaWN1bHR5fWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0NvbXBhdGlibGVPcGVuaW5nUHJlc2V0KGlkOiBzdHJpbmcpOiBHYW1lU2V0dXBQcmVzZXQgfCB1bmRlZmluZWQge1xuICBjb25zdCBvcGVuaW5nID0gZ2V0T3BlbmluZ0J5SWQoaWQpO1xuICBpZiAoIW9wZW5pbmcpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIE9QRU5JTkdfUFJFU0VUUy5maW5kKChwcmVzZXQpID0+IHByZXNldC5pZCA9PT0gb3BlbmluZy5pZCk7XG59XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIGZpbHRlckdhbWVTZXR1cFByZXNldHMsXG4gIEdBTUVfU0VUVVBfUFJFU0VUUyxcbiAgR2FtZVNldHVwQ2F0ZWdvcnksXG4gIEdBTUVfU0VUVVBfQ0FURUdPUllfT1BUSU9OUyxcbiAgR2FtZVNldHVwUHJlc2V0LFxuICBnZXRHYW1lU2V0dXBQcmVzZXRCeUlkLFxufSBmcm9tICcuLi9lbmdpbmUvZ2FtZVNldHVwUHJlc2V0cyc7XG5pbXBvcnQgeyBib2FyZFZpZXdNb2RlbCwgQm9hcmRWaWV3TW9kZWwgfSBmcm9tICcuL0JvYXJkVmlld01vZGVsJztcblxuaW50ZXJmYWNlIEdhbWVTZXR1cFZpZXdNb2RlbERlcGVuZGVuY2llcyB7XG4gIGJvYXJkVmlld01vZGVsOiBQaWNrPEJvYXJkVmlld01vZGVsLCAnbG9hZEZlbicgfCAnbG9hZFBnbicgfCAnbG9hZEdhbWVTZXR1cFByZXNldCcgfCAnc3RhdHVzTWVzc2FnZSc+O1xufVxuXG5leHBvcnQgY2xhc3MgR2FtZVNldHVwVmlld01vZGVsIHtcbiAgb3BlbiA9IGZhbHNlO1xuICBzZWxlY3RlZENhdGVnb3J5OiBHYW1lU2V0dXBDYXRlZ29yeSA9ICdvcGVuaW5ncyc7XG4gIHNlYXJjaFF1ZXJ5ID0gJyc7XG4gIHNlbGVjdGVkUHJlc2V0SWQ6IHN0cmluZyB8IG51bGwgPSBHQU1FX1NFVFVQX1BSRVNFVFNbMF0/LmlkID8/IG51bGw7XG4gIGN1c3RvbUZlbklucHV0ID0gJyc7XG4gIGN1c3RvbVBnbklucHV0ID0gJyc7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkZXBzOiBHYW1lU2V0dXBWaWV3TW9kZWxEZXBlbmRlbmNpZXM7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZGVwczogR2FtZVNldHVwVmlld01vZGVsRGVwZW5kZW5jaWVzID0ge1xuICAgICAgYm9hcmRWaWV3TW9kZWwsXG4gICAgfSxcbiAgKSB7XG4gICAgdGhpcy5kZXBzID0gZGVwcztcblxuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXRPcGVuOiBhY3Rpb24sXG4gICAgICBvcGVuQXRDYXRlZ29yeTogYWN0aW9uLFxuICAgICAgc2V0U2VsZWN0ZWRDYXRlZ29yeTogYWN0aW9uLFxuICAgICAgc2V0U2VhcmNoUXVlcnk6IGFjdGlvbixcbiAgICAgIHNldFNlbGVjdGVkUHJlc2V0SWQ6IGFjdGlvbixcbiAgICAgIHNldEN1c3RvbUZlbklucHV0OiBhY3Rpb24sXG4gICAgICBzZXRDdXN0b21QZ25JbnB1dDogYWN0aW9uLFxuICAgICAgbG9hZFNlbGVjdGVkUHJlc2V0OiBhY3Rpb24sXG4gICAgICBsb2FkQ3VzdG9tRmVuOiBhY3Rpb24sXG4gICAgICBsb2FkQ3VzdG9tUGduOiBhY3Rpb24sXG4gICAgICBzeW5jU2VsZWN0aW9uRnJvbUNhdGVnb3J5OiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLnN5bmNTZWxlY3Rpb25Gcm9tQ2F0ZWdvcnkoKTtcbiAgfVxuXG4gIHNldE9wZW4ob3BlbjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMub3BlbiA9IG9wZW47XG4gIH1cblxuICBvcGVuQXRDYXRlZ29yeShjYXRlZ29yeTogR2FtZVNldHVwQ2F0ZWdvcnkpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkQ2F0ZWdvcnkgPSBjYXRlZ29yeTtcbiAgICB0aGlzLnNlYXJjaFF1ZXJ5ID0gJyc7XG4gICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgICB0aGlzLnN5bmNTZWxlY3Rpb25Gcm9tQ2F0ZWdvcnkoKTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkQ2F0ZWdvcnkoY2F0ZWdvcnk6IEdhbWVTZXR1cENhdGVnb3J5KTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZENhdGVnb3J5ID0gY2F0ZWdvcnk7XG4gICAgdGhpcy5zZWFyY2hRdWVyeSA9ICcnO1xuICAgIHRoaXMuc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeSgpO1xuICB9XG5cbiAgc2V0U2VhcmNoUXVlcnkodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc2VhcmNoUXVlcnkgPSB2YWx1ZTtcbiAgICB0aGlzLnN5bmNTZWxlY3Rpb25Gcm9tQ2F0ZWdvcnkoKTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkUHJlc2V0SWQoaWQ6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkUHJlc2V0SWQgPSBpZDtcbiAgfVxuXG4gIHNldEN1c3RvbUZlbklucHV0KHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbUZlbklucHV0ID0gdmFsdWU7XG4gIH1cblxuICBzZXRDdXN0b21QZ25JbnB1dCh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jdXN0b21QZ25JbnB1dCA9IHZhbHVlO1xuICB9XG5cbiAgbG9hZFNlbGVjdGVkUHJlc2V0KCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByZXNldCA9IHRoaXMuc2VsZWN0ZWRQcmVzZXQ7XG4gICAgaWYgKCFwcmVzZXQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2FkZWQgPSB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwubG9hZEdhbWVTZXR1cFByZXNldChwcmVzZXQpO1xuICAgIGlmIChsb2FkZWQpIHtcbiAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbG9hZGVkO1xuICB9XG5cbiAgbG9hZEN1c3RvbUZlbigpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuY3VzdG9tRmVuSW5wdXQudHJpbSgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbG9hZGVkID0gdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmxvYWRGZW4odGhpcy5jdXN0b21GZW5JbnB1dC50cmltKCkpO1xuICAgIGlmIChsb2FkZWQpIHtcbiAgICAgIHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5zdGF0dXNNZXNzYWdlID0gJ0N1c3RvbSBGRU4gbG9hZGVkJztcbiAgICAgIHRoaXMuY3VzdG9tRmVuSW5wdXQgPSAnJztcbiAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbG9hZGVkO1xuICB9XG5cbiAgbG9hZEN1c3RvbVBnbigpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuY3VzdG9tUGduSW5wdXQudHJpbSgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbG9hZGVkID0gdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmxvYWRQZ24odGhpcy5jdXN0b21QZ25JbnB1dC50cmltKCkpO1xuICAgIGlmIChsb2FkZWQpIHtcbiAgICAgIHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5zdGF0dXNNZXNzYWdlID0gJ0N1c3RvbSBQR04gbG9hZGVkJztcbiAgICAgIHRoaXMuY3VzdG9tUGduSW5wdXQgPSAnJztcbiAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbG9hZGVkO1xuICB9XG5cbiAgc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zZWxlY3RlZENhdGVnb3J5ID09PSAnY3VzdG9tLWZlbicgfHwgdGhpcy5zZWxlY3RlZENhdGVnb3J5ID09PSAnY3VzdG9tLXBnbicpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdmlzaWJsZVByZXNldElkcyA9IHRoaXMuZmlsdGVyZWRQcmVzZXRzLm1hcCgocHJlc2V0KSA9PiBwcmVzZXQuaWQpO1xuICAgIGlmICh0aGlzLnNlbGVjdGVkUHJlc2V0SWQgJiYgdmlzaWJsZVByZXNldElkcy5pbmNsdWRlcyh0aGlzLnNlbGVjdGVkUHJlc2V0SWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZWxlY3RlZFByZXNldElkID0gdmlzaWJsZVByZXNldElkc1swXSA/PyBudWxsO1xuICB9XG5cbiAgZ2V0IGNhdGVnb3JpZXMoKSB7XG4gICAgcmV0dXJuIEdBTUVfU0VUVVBfQ0FURUdPUllfT1BUSU9OUztcbiAgfVxuXG4gIGdldCBmaWx0ZXJlZFByZXNldHMoKTogR2FtZVNldHVwUHJlc2V0W10ge1xuICAgIHJldHVybiBmaWx0ZXJHYW1lU2V0dXBQcmVzZXRzKEdBTUVfU0VUVVBfUFJFU0VUUywgdGhpcy5zZWxlY3RlZENhdGVnb3J5LCB0aGlzLnNlYXJjaFF1ZXJ5KTtcbiAgfVxuXG4gIGdldCBzZWxlY3RlZFByZXNldCgpOiBHYW1lU2V0dXBQcmVzZXQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFByZXNldElkID8gZ2V0R2FtZVNldHVwUHJlc2V0QnlJZCh0aGlzLnNlbGVjdGVkUHJlc2V0SWQpID8/IG51bGwgOiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBnYW1lU2V0dXBWaWV3TW9kZWwgPSBuZXcgR2FtZVNldHVwVmlld01vZGVsKCk7XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIGlzRGVidWdMb2dnaW5nRW5hYmxlZCxcbiAgaXNEZXZlbG9wbWVudEJ1aWxkLFxuICBzZXREZWJ1Z0xvZ2dpbmdFbmFibGVkLFxufSBmcm9tICcuLi9zaGFyZWQvZGVidWcnO1xuXG5leHBvcnQgY2xhc3MgRGVidWdWaWV3TW9kZWwge1xuICBkZWJ1Z0xvZ2dpbmdFbmFibGVkID0gaXNEZWJ1Z0xvZ2dpbmdFbmFibGVkKCk7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQ6IGFjdGlvbixcbiAgICAgIHRvZ2dsZURlYnVnTG9nZ2luZzogYWN0aW9uLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0RGVidWdMb2dnaW5nRW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kZWJ1Z0xvZ2dpbmdFbmFibGVkID0gZW5hYmxlZDtcbiAgICBzZXREZWJ1Z0xvZ2dpbmdFbmFibGVkKGVuYWJsZWQpO1xuICB9XG5cbiAgdG9nZ2xlRGVidWdMb2dnaW5nKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0RGVidWdMb2dnaW5nRW5hYmxlZCghdGhpcy5kZWJ1Z0xvZ2dpbmdFbmFibGVkKTtcbiAgfVxuXG4gIGdldCBpc0RldmVsb3BtZW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc0RldmVsb3BtZW50QnVpbGQoKTtcbiAgfVxuXG4gIGdldCBzaG93RGVidWdDb250cm9scygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0RldmVsb3BtZW50O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBkZWJ1Z1ZpZXdNb2RlbCA9IG5ldyBEZWJ1Z1ZpZXdNb2RlbCgpO1xuXG4iLCAiaW1wb3J0IHtcbiAgQnJpbGxpYW50QWxsb3dlZFBoYXNlLFxuICBCcmlsbGlhbnRNb3Zlc1BlckdhbWUsXG4gIEZlYXR1cmVPcHRpb25zLFxuICBtZXJnZUZlYXR1cmVPcHRpb25zLFxufSBmcm9tICcuL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7XG4gIEJ1Y2tldENvbmZpZyxcbiAgREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICBNb3ZlUXVhbGl0eVByZXNldElkLFxuICBNT1ZFX1FVQUxJVFlfUFJFU0VUUyxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCB0eXBlIFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlID0gJ2RhcmsnIHwgJ2xpZ2h0JyB8ICdtaW5pbWFsJyB8ICdwZXJzb25hJztcblxuZXhwb3J0IGNvbnN0IFBFUlNPTkFfUFJPRklMRV9LSU5EID0gJ3BlcnNvbmFjaGVzcy5wZXJzb25hLXByb2ZpbGUnO1xuZXhwb3J0IGNvbnN0IFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OID0gMTtcblxuZXhwb3J0IGludGVyZmFjZSBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3Qge1xuICBidWNrZXRDb25maWc6IEJ1Y2tldENvbmZpZztcbiAgY3VycmVudFByZXNldElkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbDtcbiAgZGVwdGg6IG51bWJlcjtcbiAgbXVsdGlQVjogbnVtYmVyO1xuICBmZWF0dXJlT3B0aW9uczogRmVhdHVyZU9wdGlvbnM7XG4gIGJyaWxsaWFudDoge1xuICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogQnJpbGxpYW50TW92ZXNQZXJHYW1lO1xuICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogQnJpbGxpYW50QWxsb3dlZFBoYXNlO1xuICB9O1xuICB1aToge1xuICAgIHRoZW1lTW9kZTogUGVyc29uYVByb2ZpbGVUaGVtZU1vZGU7XG4gICAgYmFzaWNNb2RlOiBib29sZWFuO1xuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBlcnNvbmFQcm9maWxlRXhwb3J0IHtcbiAga2luZDogdHlwZW9mIFBFUlNPTkFfUFJPRklMRV9LSU5EO1xuICB2ZXJzaW9uOiB0eXBlb2YgUEVSU09OQV9QUk9GSUxFX1ZFUlNJT047XG4gIG5hbWU6IHN0cmluZztcbiAgc2V0dGluZ3M6IFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTYXZlZFBlcnNvbmFQcm9maWxlIGV4dGVuZHMgUGVyc29uYVByb2ZpbGVFeHBvcnQge1xuICBpZDogc3RyaW5nO1xuICBjcmVhdGVkQXQ6IHN0cmluZztcbiAgdXBkYXRlZEF0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc29uYVByb2ZpbGVTdG9yZVNuYXBzaG90IHtcbiAgcHJvZmlsZXM6IFNhdmVkUGVyc29uYVByb2ZpbGVbXTtcbiAgc2VsZWN0ZWRQcm9maWxlSWQ6IHN0cmluZyB8IG51bGw7XG59XG5cbmNvbnN0IFZBTElEX1BSRVNFVF9JRFMgPSBuZXcgU2V0PE1vdmVRdWFsaXR5UHJlc2V0SWQ+KE1PVkVfUVVBTElUWV9QUkVTRVRTLm1hcCgocHJlc2V0KSA9PiBwcmVzZXQuaWQpKTtcbmNvbnN0IFZBTElEX1RIRU1FX01PREVTID0gbmV3IFNldDxQZXJzb25hUHJvZmlsZVRoZW1lTW9kZT4oWydkYXJrJywgJ2xpZ2h0JywgJ21pbmltYWwnLCAncGVyc29uYSddKTtcbmNvbnN0IFZBTElEX0JSSUxMSUFOVF9QSEFTRVMgPSBuZXcgU2V0PEJyaWxsaWFudEFsbG93ZWRQaGFzZT4oWydvcGVuaW5nJywgJ21pZGRsZWdhbWUnLCAnZW5kZ2FtZScsICdhbnknXSk7XG5jb25zdCBWQUxJRF9CUklMTElBTlRfQlVER0VUUyA9IG5ldyBTZXQ8QnJpbGxpYW50TW92ZXNQZXJHYW1lPihbMCwgMSwgMiwgMywgNF0pO1xuXG5mdW5jdGlvbiBpc1JlY29yZCh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGNsYW1wSW50ZWdlcih2YWx1ZTogdW5rbm93biwgbWluaW11bTogbnVtYmVyLCBtYXhpbXVtOiBudW1iZXIsIGZhbGxiYWNrOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxsYmFjaztcbiAgfVxuXG4gIHJldHVybiBNYXRoLm1heChtaW5pbXVtLCBNYXRoLm1pbihtYXhpbXVtLCBNYXRoLnJvdW5kKHZhbHVlKSkpO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZUJ1Y2tldENvbmZpZyh2YWx1ZTogdW5rbm93bik6IEJ1Y2tldENvbmZpZyB7XG4gIGlmICghaXNSZWNvcmQodmFsdWUpKSB7XG4gICAgcmV0dXJuIHsgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJlc3Q6IGNsYW1wSW50ZWdlcih2YWx1ZS5iZXN0LCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5iZXN0KSxcbiAgICBncmVhdDogY2xhbXBJbnRlZ2VyKHZhbHVlLmdyZWF0LCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5ncmVhdCksXG4gICAgZXhjZWxsZW50OiBjbGFtcEludGVnZXIodmFsdWUuZXhjZWxsZW50LCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5leGNlbGxlbnQpLFxuICAgIGdvb2Q6IGNsYW1wSW50ZWdlcih2YWx1ZS5nb29kLCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5nb29kKSxcbiAgICBpbmFjY3VyYWN5OiBjbGFtcEludGVnZXIodmFsdWUuaW5hY2N1cmFjeSwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuaW5hY2N1cmFjeSksXG4gICAgbWlzdGFrZTogY2xhbXBJbnRlZ2VyKHZhbHVlLm1pc3Rha2UsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLm1pc3Rha2UpLFxuICAgIGJsdW5kZXI6IGNsYW1wSW50ZWdlcih2YWx1ZS5ibHVuZGVyLCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5ibHVuZGVyKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVQcmVzZXRJZCh2YWx1ZTogdW5rbm93bik6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsIHtcbiAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBWQUxJRF9QUkVTRVRfSURTLmhhcyh2YWx1ZSBhcyBNb3ZlUXVhbGl0eVByZXNldElkKVxuICAgID8gKHZhbHVlIGFzIE1vdmVRdWFsaXR5UHJlc2V0SWQpXG4gICAgOiAnbWVkaXVtJztcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVUaGVtZU1vZGUodmFsdWU6IHVua25vd24pOiBQZXJzb25hUHJvZmlsZVRoZW1lTW9kZSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIFZBTElEX1RIRU1FX01PREVTLmhhcyh2YWx1ZSBhcyBQZXJzb25hUHJvZmlsZVRoZW1lTW9kZSlcbiAgICA/ICh2YWx1ZSBhcyBQZXJzb25hUHJvZmlsZVRoZW1lTW9kZSlcbiAgICA6ICdkYXJrJztcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVCcmlsbGlhbnRNb3Zlc1BlckdhbWUodmFsdWU6IHVua25vd24pOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWUge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBWQUxJRF9CUklMTElBTlRfQlVER0VUUy5oYXModmFsdWUgYXMgQnJpbGxpYW50TW92ZXNQZXJHYW1lKVxuICAgID8gKHZhbHVlIGFzIEJyaWxsaWFudE1vdmVzUGVyR2FtZSlcbiAgICA6IDA7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplQnJpbGxpYW50QWxsb3dlZFBoYXNlKHZhbHVlOiB1bmtub3duKTogQnJpbGxpYW50QWxsb3dlZFBoYXNlIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgVkFMSURfQlJJTExJQU5UX1BIQVNFUy5oYXModmFsdWUgYXMgQnJpbGxpYW50QWxsb3dlZFBoYXNlKVxuICAgID8gKHZhbHVlIGFzIEJyaWxsaWFudEFsbG93ZWRQaGFzZSlcbiAgICA6ICdhbnknO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3QodmFsdWU6IHVua25vd24pOiBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3Qge1xuICBjb25zdCByZWNvcmQgPSBpc1JlY29yZCh2YWx1ZSkgPyB2YWx1ZSA6IHt9O1xuICBjb25zdCBicmlsbGlhbnQgPSBpc1JlY29yZChyZWNvcmQuYnJpbGxpYW50KSA/IHJlY29yZC5icmlsbGlhbnQgOiB7fTtcbiAgY29uc3QgdWkgPSBpc1JlY29yZChyZWNvcmQudWkpID8gcmVjb3JkLnVpIDoge307XG5cbiAgcmV0dXJuIHtcbiAgICBidWNrZXRDb25maWc6IHNhbml0aXplQnVja2V0Q29uZmlnKHJlY29yZC5idWNrZXRDb25maWcpLFxuICAgIGN1cnJlbnRQcmVzZXRJZDogc2FuaXRpemVQcmVzZXRJZChyZWNvcmQuY3VycmVudFByZXNldElkKSxcbiAgICBkZXB0aDogY2xhbXBJbnRlZ2VyKHJlY29yZC5kZXB0aCwgMSwgMzAsIDgpLFxuICAgIG11bHRpUFY6IGNsYW1wSW50ZWdlcihyZWNvcmQubXVsdGlQViwgMSwgMjAsIDEyKSxcbiAgICBmZWF0dXJlT3B0aW9uczogbWVyZ2VGZWF0dXJlT3B0aW9ucyhpc1JlY29yZChyZWNvcmQuZmVhdHVyZU9wdGlvbnMpID8gKHJlY29yZC5mZWF0dXJlT3B0aW9ucyBhcyBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPikgOiB1bmRlZmluZWQpLFxuICAgIGJyaWxsaWFudDoge1xuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiBzYW5pdGl6ZUJyaWxsaWFudE1vdmVzUGVyR2FtZShicmlsbGlhbnQuYnJpbGxpYW50TW92ZXNQZXJHYW1lKSxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogc2FuaXRpemVCcmlsbGlhbnRBbGxvd2VkUGhhc2UoYnJpbGxpYW50LmJyaWxsaWFudEFsbG93ZWRQaGFzZSksXG4gICAgfSxcbiAgICB1aToge1xuICAgICAgdGhlbWVNb2RlOiBzYW5pdGl6ZVRoZW1lTW9kZSh1aS50aGVtZU1vZGUpLFxuICAgICAgYmFzaWNNb2RlOiB0eXBlb2YgdWkuYmFzaWNNb2RlID09PSAnYm9vbGVhbicgPyB1aS5iYXNpY01vZGUgOiB0cnVlLFxuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlRXhwb3J0KFxuICB2YWx1ZTogdW5rbm93bixcbiAgZmFsbGJhY2tOYW1lID0gJ0ltcG9ydGVkIFByb2ZpbGUnLFxuKTogUGVyc29uYVByb2ZpbGVFeHBvcnQgfCBudWxsIHtcbiAgaWYgKCFpc1JlY29yZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmICh2YWx1ZS5raW5kICE9PSBQRVJTT05BX1BST0ZJTEVfS0lORCB8fCB2YWx1ZS52ZXJzaW9uICE9PSBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgbmFtZSA9IHR5cGVvZiB2YWx1ZS5uYW1lID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5uYW1lLnRyaW0oKSA/IHZhbHVlLm5hbWUudHJpbSgpIDogZmFsbGJhY2tOYW1lO1xuXG4gIHJldHVybiB7XG4gICAga2luZDogUEVSU09OQV9QUk9GSUxFX0tJTkQsXG4gICAgdmVyc2lvbjogUEVSU09OQV9QUk9GSUxFX1ZFUlNJT04sXG4gICAgbmFtZSxcbiAgICBzZXR0aW5nczogc2FuaXRpemVQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3QodmFsdWUuc2V0dGluZ3MpLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQZXJzb25hUHJvZmlsZUltcG9ydChcbiAganNvbjogc3RyaW5nLFxuKTogeyBvazogdHJ1ZTsgcHJvZmlsZTogUGVyc29uYVByb2ZpbGVFeHBvcnQgfSB8IHsgb2s6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBpZiAoIWpzb24udHJpbSgpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnSW1wb3J0IEpTT04gaXMgZW1wdHkuJyxcbiAgICB9O1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb24pIGFzIHVua25vd247XG4gICAgY29uc3QgcHJvZmlsZSA9IHNhbml0aXplUGVyc29uYVByb2ZpbGVFeHBvcnQocGFyc2VkKTtcblxuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2s6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ltcG9ydGVkIEpTT04gZG9lcyBub3QgbWF0Y2ggdGhlIFBlcnNvbmFDaGVzcyBwcm9maWxlIHNjaGVtYS4nLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBvazogdHJ1ZSwgcHJvZmlsZSB9O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdJbXBvcnRlZCBKU09OIGNvdWxkIG5vdCBiZSBwYXJzZWQuJyxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVQZXJzb25hUHJvZmlsZShwcm9maWxlOiBQZXJzb25hUHJvZmlsZUV4cG9ydCk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShwcm9maWxlLCBudWxsLCAyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNhdmVkUGVyc29uYVByb2ZpbGUoXG4gIHByb2ZpbGU6IFBlcnNvbmFQcm9maWxlRXhwb3J0LFxuICBpZDogc3RyaW5nLFxuICBub3dJc286IHN0cmluZyxcbik6IFNhdmVkUGVyc29uYVByb2ZpbGUge1xuICByZXR1cm4ge1xuICAgIC4uLnByb2ZpbGUsXG4gICAgaWQsXG4gICAgY3JlYXRlZEF0OiBub3dJc28sXG4gICAgdXBkYXRlZEF0OiBub3dJc28sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTYXZlZFBlcnNvbmFQcm9maWxlKFxuICBwcm9maWxlOiBTYXZlZFBlcnNvbmFQcm9maWxlLFxuICBuZXh0OiBQZXJzb25hUHJvZmlsZUV4cG9ydCxcbiAgbm93SXNvOiBzdHJpbmcsXG4pOiBTYXZlZFBlcnNvbmFQcm9maWxlIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5wcm9maWxlLFxuICAgIC4uLm5leHQsXG4gICAgaWQ6IHByb2ZpbGUuaWQsXG4gICAgY3JlYXRlZEF0OiBwcm9maWxlLmNyZWF0ZWRBdCxcbiAgICB1cGRhdGVkQXQ6IG5vd0lzbyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGR1cGxpY2F0ZVBlcnNvbmFQcm9maWxlKFxuICBwcm9maWxlOiBTYXZlZFBlcnNvbmFQcm9maWxlLFxuICBpZDogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIG5vd0lzbzogc3RyaW5nLFxuKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB7XG4gIHJldHVybiB7XG4gICAgLi4ucHJvZmlsZSxcbiAgICBpZCxcbiAgICBuYW1lLFxuICAgIGNyZWF0ZWRBdDogbm93SXNvLFxuICAgIHVwZGF0ZWRBdDogbm93SXNvLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVTYXZlZFBlcnNvbmFQcm9maWxlKHZhbHVlOiB1bmtub3duKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB8IG51bGwge1xuICBpZiAoIWlzUmVjb3JkKHZhbHVlKSB8fCB0eXBlb2YgdmFsdWUuaWQgIT09ICdzdHJpbmcnIHx8ICF2YWx1ZS5pZC50cmltKCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGV4cG9ydGVkID0gc2FuaXRpemVQZXJzb25hUHJvZmlsZUV4cG9ydCh2YWx1ZSk7XG4gIGlmICghZXhwb3J0ZWQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZWRBdCA9IHR5cGVvZiB2YWx1ZS5jcmVhdGVkQXQgPT09ICdzdHJpbmcnICYmIHZhbHVlLmNyZWF0ZWRBdC50cmltKClcbiAgICA/IHZhbHVlLmNyZWF0ZWRBdFxuICAgIDogbmV3IERhdGUoMCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgdXBkYXRlZEF0ID0gdHlwZW9mIHZhbHVlLnVwZGF0ZWRBdCA9PT0gJ3N0cmluZycgJiYgdmFsdWUudXBkYXRlZEF0LnRyaW0oKVxuICAgID8gdmFsdWUudXBkYXRlZEF0XG4gICAgOiBjcmVhdGVkQXQ7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5leHBvcnRlZCxcbiAgICBpZDogdmFsdWUuaWQsXG4gICAgY3JlYXRlZEF0LFxuICAgIHVwZGF0ZWRBdCxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplUGVyc29uYVByb2ZpbGVTdG9yZVNuYXBzaG90KHZhbHVlOiB1bmtub3duKTogUGVyc29uYVByb2ZpbGVTdG9yZVNuYXBzaG90IHtcbiAgaWYgKCFpc1JlY29yZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvZmlsZXM6IFtdLFxuICAgICAgc2VsZWN0ZWRQcm9maWxlSWQ6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHByb2ZpbGVzID0gQXJyYXkuaXNBcnJheSh2YWx1ZS5wcm9maWxlcylcbiAgICA/IHZhbHVlLnByb2ZpbGVzXG4gICAgICAubWFwKChlbnRyeSkgPT4gc2FuaXRpemVTYXZlZFBlcnNvbmFQcm9maWxlKGVudHJ5KSlcbiAgICAgIC5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgU2F2ZWRQZXJzb25hUHJvZmlsZSA9PiBlbnRyeSAhPT0gbnVsbClcbiAgICA6IFtdO1xuICBjb25zdCBzZWxlY3RlZFByb2ZpbGVJZCA9IHR5cGVvZiB2YWx1ZS5zZWxlY3RlZFByb2ZpbGVJZCA9PT0gJ3N0cmluZycgPyB2YWx1ZS5zZWxlY3RlZFByb2ZpbGVJZCA6IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBwcm9maWxlcyxcbiAgICBzZWxlY3RlZFByb2ZpbGVJZDogcHJvZmlsZXMuc29tZSgocHJvZmlsZSkgPT4gcHJvZmlsZS5pZCA9PT0gc2VsZWN0ZWRQcm9maWxlSWQpID8gc2VsZWN0ZWRQcm9maWxlSWQgOiBudWxsLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQZXJzb25hUHJvZmlsZUV4cG9ydEZpbGVuYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHNsdWcgPSBuYW1lXG4gICAgLnRyaW0oKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxuICAgIC5yZXBsYWNlKC9eLSt8LSskL2csICcnKSB8fCAncGVyc29uYS1wcm9maWxlJztcblxuICByZXR1cm4gYHBlcnNvbmFjaGVzcy0ke3NsdWd9Lmpzb25gO1xufVxuIiwgImltcG9ydCB7IGFjdGlvbiwgbWFrZUF1dG9PYnNlcnZhYmxlIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQge1xuICBidWlsZFBlcnNvbmFQcm9maWxlRXhwb3J0RmlsZW5hbWUsXG4gIGNyZWF0ZVNhdmVkUGVyc29uYVByb2ZpbGUsXG4gIGR1cGxpY2F0ZVBlcnNvbmFQcm9maWxlLFxuICBwYXJzZVBlcnNvbmFQcm9maWxlSW1wb3J0LFxuICBQRVJTT05BX1BST0ZJTEVfS0lORCxcbiAgUEVSU09OQV9QUk9GSUxFX1ZFUlNJT04sXG4gIFBlcnNvbmFQcm9maWxlRXhwb3J0LFxuICBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3QsXG4gIHNhbml0aXplUGVyc29uYVByb2ZpbGVTdG9yZVNuYXBzaG90LFxuICBTYXZlZFBlcnNvbmFQcm9maWxlLFxuICBzZXJpYWxpemVQZXJzb25hUHJvZmlsZSxcbiAgdXBkYXRlU2F2ZWRQZXJzb25hUHJvZmlsZSxcbn0gZnJvbSAnLi4vZW5naW5lL3BlcnNvbmFQcm9maWxlcyc7XG5pbXBvcnQgeyBjb25maWdWaWV3TW9kZWwsIENvbmZpZ1ZpZXdNb2RlbCB9IGZyb20gJy4vQ29uZmlnVmlld01vZGVsJztcbmltcG9ydCB7IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLCBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gJy4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwnO1xuaW1wb3J0IHsgdWlTdGF0ZVZpZXdNb2RlbCwgVWlTdGF0ZVZpZXdNb2RlbCB9IGZyb20gJy4vVWlTdGF0ZVZpZXdNb2RlbCc7XG5cbmNvbnN0IFBFUlNPTkFfUFJPRklMRVNfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX3BlcnNvbmFfcHJvZmlsZXMnO1xuXG5pbnRlcmZhY2UgUGVyc29uYVByb2ZpbGVzRGVwZW5kZW5jaWVzIHtcbiAgY29uZmlnVmlld01vZGVsOiBQaWNrPENvbmZpZ1ZpZXdNb2RlbCwgJ2J1Y2tldENvbmZpZycgfCAnY3VycmVudFByZXNldElkJyB8ICdkZXB0aCcgfCAnbXVsdGlQVicgfCAnYXBwbHlQcm9maWxlU25hcHNob3QnPjtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWw6IFBpY2s8XG4gICAgRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwsXG4gICAgfCAnb3B0aW9ucydcbiAgICB8ICdicmlsbGlhbnRNb3Zlc1BlckdhbWUnXG4gICAgfCAnYnJpbGxpYW50QWxsb3dlZFBoYXNlJ1xuICAgIHwgJ2FwcGx5UHJvZmlsZVNldHRpbmdzJ1xuICA+O1xuICB1aVN0YXRlVmlld01vZGVsOiBQaWNrPFxuICAgIFVpU3RhdGVWaWV3TW9kZWwsXG4gICAgfCAndGhlbWVNb2RlJ1xuICAgIHwgJ2Jhc2ljTW9kZSdcbiAgICB8ICdhcHBseVByb2ZpbGVQcmVmZXJlbmNlcydcbiAgPjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJvZmlsZUlkKCk6IHN0cmluZyB7XG4gIHJldHVybiBgcHJvZmlsZV8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDgpfWA7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRpbWVzdGFtcCgpOiBzdHJpbmcge1xuICByZXR1cm4gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xufVxuXG5leHBvcnQgY2xhc3MgUGVyc29uYVByb2ZpbGVzVmlld01vZGVsIHtcbiAgcHJvZmlsZXM6IFNhdmVkUGVyc29uYVByb2ZpbGVbXSA9IFtdO1xuICBzZWxlY3RlZFByb2ZpbGVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIHByb2ZpbGVOYW1lRHJhZnQgPSAnJztcbiAgZXhjaGFuZ2VKc29uID0gJyc7XG4gIGxhc3RBY3Rpb25NZXNzYWdlID0gJyc7XG4gIGltcG9ydEVycm9yID0gJyc7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkZXBzOiBQZXJzb25hUHJvZmlsZXNEZXBlbmRlbmNpZXM7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZGVwczogUGVyc29uYVByb2ZpbGVzRGVwZW5kZW5jaWVzID0ge1xuICAgICAgY29uZmlnVmlld01vZGVsLFxuICAgICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwsXG4gICAgICB1aVN0YXRlVmlld01vZGVsLFxuICAgIH0sXG4gICkge1xuICAgIHRoaXMuZGVwcyA9IGRlcHM7XG5cbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0U2VsZWN0ZWRQcm9maWxlSWQ6IGFjdGlvbixcbiAgICAgIHNldFByb2ZpbGVOYW1lRHJhZnQ6IGFjdGlvbixcbiAgICAgIHNldEV4Y2hhbmdlSnNvbjogYWN0aW9uLFxuICAgICAgY2xlYXJFeGNoYW5nZVN0YXRlOiBhY3Rpb24sXG4gICAgICBzYXZlQ3VycmVudFByb2ZpbGU6IGFjdGlvbixcbiAgICAgIGxvYWRTZWxlY3RlZFByb2ZpbGU6IGFjdGlvbixcbiAgICAgIGR1cGxpY2F0ZVNlbGVjdGVkUHJvZmlsZTogYWN0aW9uLFxuICAgICAgcmVuYW1lU2VsZWN0ZWRQcm9maWxlOiBhY3Rpb24sXG4gICAgICBkZWxldGVTZWxlY3RlZFByb2ZpbGU6IGFjdGlvbixcbiAgICAgIGltcG9ydFByb2ZpbGVGcm9tSnNvbjogYWN0aW9uLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZXN0b3JlRnJvbVN0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkUHJvZmlsZUlkKGlkOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IGlkO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlPy5uYW1lID8/ICcnO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSAnJztcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gIH1cblxuICBzZXRQcm9maWxlTmFtZURyYWZ0KHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSB2YWx1ZTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gJyc7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICB9XG5cbiAgc2V0RXhjaGFuZ2VKc29uKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHZhbHVlO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSAnJztcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gIH1cblxuICBjbGVhckV4Y2hhbmdlU3RhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSAnJztcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gJyc7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICB9XG5cbiAgc2F2ZUN1cnJlbnRQcm9maWxlKG5hbWUgPSB0aGlzLnByb2ZpbGVOYW1lRHJhZnQpOiBib29sZWFuIHtcbiAgICBjb25zdCB0cmltbWVkTmFtZSA9IG5hbWUudHJpbSgpO1xuICAgIGlmICghdHJpbW1lZE5hbWUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnRW50ZXIgYSBwcm9maWxlIG5hbWUgYmVmb3JlIHNhdmluZy4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHNuYXBzaG90ID0gdGhpcy5idWlsZEN1cnJlbnRTbmFwc2hvdCgpO1xuICAgIGNvbnN0IGV4cG9ydGVkID0gdGhpcy5jcmVhdGVFeHBvcnQodHJpbW1lZE5hbWUsIHNuYXBzaG90KTtcbiAgICBjb25zdCBub3dJc28gPSBjcmVhdGVUaW1lc3RhbXAoKTtcbiAgICBjb25zdCBleGlzdGluZ0J5U2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBjb25zdCBleGlzdGluZ0J5TmFtZSA9IHRoaXMuZmluZEJ5TmFtZSh0cmltbWVkTmFtZSk7XG5cbiAgICBpZiAoZXhpc3RpbmdCeVNlbGVjdGVkICYmIGV4aXN0aW5nQnlTZWxlY3RlZC5uYW1lID09PSB0cmltbWVkTmFtZSkge1xuICAgICAgdGhpcy5wcm9maWxlcyA9IHRoaXMucHJvZmlsZXMubWFwKChwcm9maWxlKSA9PiAoXG4gICAgICAgIHByb2ZpbGUuaWQgPT09IGV4aXN0aW5nQnlTZWxlY3RlZC5pZFxuICAgICAgICAgID8gdXBkYXRlU2F2ZWRQZXJzb25hUHJvZmlsZShwcm9maWxlLCBleHBvcnRlZCwgbm93SXNvKVxuICAgICAgICAgIDogcHJvZmlsZVxuICAgICAgKSk7XG4gICAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYFVwZGF0ZWQgcHJvZmlsZSBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRC5gO1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgICAgdGhpcy5leGNoYW5nZUpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZShleHBvcnRlZCk7XG4gICAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChleGlzdGluZ0J5TmFtZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9IGBBIHByb2ZpbGUgbmFtZWQgXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQgYWxyZWFkeSBleGlzdHMuYDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBzYXZlZCA9IGNyZWF0ZVNhdmVkUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQsIGNyZWF0ZVByb2ZpbGVJZCgpLCBub3dJc28pO1xuICAgIHRoaXMucHJvZmlsZXMgPSBbc2F2ZWQsIC4uLnRoaXMucHJvZmlsZXNdO1xuICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBzYXZlZC5pZDtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSBzYXZlZC5uYW1lO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQpO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgU2F2ZWQgcHJvZmlsZSBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGxvYWRTZWxlY3RlZFByb2ZpbGUoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdTZWxlY3QgYSBzYXZlZCBwcm9maWxlIHRvIGxvYWQuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmFwcGx5U25hcHNob3QocHJvZmlsZS5zZXR0aW5ncyk7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gcHJvZmlsZS5uYW1lO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUodGhpcy50b0V4cG9ydChwcm9maWxlKSk7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBMb2FkZWQgcHJvZmlsZSBcdTIwMUMke3Byb2ZpbGUubmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBkdXBsaWNhdGVTZWxlY3RlZFByb2ZpbGUobmFtZSA9IHRoaXMucHJvZmlsZU5hbWVEcmFmdCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnU2VsZWN0IGEgc2F2ZWQgcHJvZmlsZSB0byBkdXBsaWNhdGUuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB0cmltbWVkTmFtZSA9IG5hbWUudHJpbSgpIHx8IGAke3Byb2ZpbGUubmFtZX0gQ29weWA7XG4gICAgaWYgKHRoaXMuZmluZEJ5TmFtZSh0cmltbWVkTmFtZSkpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSBgQSBwcm9maWxlIG5hbWVkIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFEIGFscmVhZHkgZXhpc3RzLmA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgbm93SXNvID0gY3JlYXRlVGltZXN0YW1wKCk7XG4gICAgY29uc3QgZHVwbGljYXRlID0gZHVwbGljYXRlUGVyc29uYVByb2ZpbGUocHJvZmlsZSwgY3JlYXRlUHJvZmlsZUlkKCksIHRyaW1tZWROYW1lLCBub3dJc28pO1xuICAgIHRoaXMucHJvZmlsZXMgPSBbZHVwbGljYXRlLCAuLi50aGlzLnByb2ZpbGVzXTtcbiAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gZHVwbGljYXRlLmlkO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IGR1cGxpY2F0ZS5uYW1lO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUodGhpcy50b0V4cG9ydChkdXBsaWNhdGUpKTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYER1cGxpY2F0ZWQgcHJvZmlsZSBhcyBcdTIwMUMke2R1cGxpY2F0ZS5uYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJlbmFtZVNlbGVjdGVkUHJvZmlsZShuYW1lID0gdGhpcy5wcm9maWxlTmFtZURyYWZ0KTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdTZWxlY3QgYSBzYXZlZCBwcm9maWxlIHRvIHJlbmFtZS4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHRyaW1tZWROYW1lID0gbmFtZS50cmltKCk7XG4gICAgaWYgKCF0cmltbWVkTmFtZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdFbnRlciBhIHByb2ZpbGUgbmFtZSBiZWZvcmUgcmVuYW1pbmcuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAocHJvZmlsZS5uYW1lID09PSB0cmltbWVkTmFtZSkge1xuICAgICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9ICdQcm9maWxlIG5hbWUgaXMgYWxyZWFkeSB1cCB0byBkYXRlLic7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBleGlzdGluZ0J5TmFtZSA9IHRoaXMuZmluZEJ5TmFtZSh0cmltbWVkTmFtZSk7XG4gICAgaWYgKGV4aXN0aW5nQnlOYW1lICYmIGV4aXN0aW5nQnlOYW1lLmlkICE9PSBwcm9maWxlLmlkKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gYEEgcHJvZmlsZSBuYW1lZCBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRCBhbHJlYWR5IGV4aXN0cy5gO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IG5vd0lzbyA9IGNyZWF0ZVRpbWVzdGFtcCgpO1xuICAgIHRoaXMucHJvZmlsZXMgPSB0aGlzLnByb2ZpbGVzLm1hcCgoZW50cnkpID0+IChcbiAgICAgIGVudHJ5LmlkID09PSBwcm9maWxlLmlkXG4gICAgICAgID8geyAuLi5lbnRyeSwgbmFtZTogdHJpbW1lZE5hbWUsIHVwZGF0ZWRBdDogbm93SXNvIH1cbiAgICAgICAgOiBlbnRyeVxuICAgICkpO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHRyaW1tZWROYW1lO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgUmVuYW1lZCBwcm9maWxlIHRvIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGVsZXRlU2VsZWN0ZWRQcm9maWxlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnU2VsZWN0IGEgc2F2ZWQgcHJvZmlsZSB0byBkZWxldGUuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnByb2ZpbGVzID0gdGhpcy5wcm9maWxlcy5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS5pZCAhPT0gcHJvZmlsZS5pZCk7XG4gICAgY29uc3QgbmV4dFNlbGVjdGVkSWQgPSB0aGlzLnByb2ZpbGVzWzBdPy5pZCA/PyBudWxsO1xuICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBuZXh0U2VsZWN0ZWRJZDtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZT8ubmFtZSA/PyAnJztcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9ICcnO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgRGVsZXRlZCBwcm9maWxlIFx1MjAxQyR7cHJvZmlsZS5uYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGV4cG9ydFNlbGVjdGVkUHJvZmlsZSgpOiB7IGZpbGVOYW1lOiBzdHJpbmc7IGpzb246IHN0cmluZyB9IHwgbnVsbCB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdTZWxlY3QgYSBzYXZlZCBwcm9maWxlIHRvIGV4cG9ydC4nO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZXhwb3J0ZWQgPSB0aGlzLnRvRXhwb3J0KHByb2ZpbGUpO1xuICAgIGNvbnN0IGpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZShleHBvcnRlZCk7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSBqc29uO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgRXhwb3J0ZWQgcHJvZmlsZSBcdTIwMUMke3Byb2ZpbGUubmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZmlsZU5hbWU6IGJ1aWxkUGVyc29uYVByb2ZpbGVFeHBvcnRGaWxlbmFtZShwcm9maWxlLm5hbWUpLFxuICAgICAganNvbixcbiAgICB9O1xuICB9XG5cbiAgaW1wb3J0UHJvZmlsZUZyb21Kc29uKGpzb24gPSB0aGlzLmV4Y2hhbmdlSnNvbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlUGVyc29uYVByb2ZpbGVJbXBvcnQoanNvbik7XG4gICAgaWYgKCFwYXJzZWQub2spIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSBwYXJzZWQuZXJyb3I7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgaW5jb21pbmdOYW1lID0gcGFyc2VkLnByb2ZpbGUubmFtZS50cmltKCk7XG4gICAgY29uc3QgZmluYWxOYW1lID0gdGhpcy5lbnN1cmVVbmlxdWVOYW1lKGluY29taW5nTmFtZSk7XG4gICAgY29uc3QgZXhwb3J0ZWQgPSB7XG4gICAgICAuLi5wYXJzZWQucHJvZmlsZSxcbiAgICAgIG5hbWU6IGZpbmFsTmFtZSxcbiAgICB9O1xuICAgIGNvbnN0IG5vd0lzbyA9IGNyZWF0ZVRpbWVzdGFtcCgpO1xuICAgIGNvbnN0IHNhdmVkID0gY3JlYXRlU2F2ZWRQZXJzb25hUHJvZmlsZShleHBvcnRlZCwgY3JlYXRlUHJvZmlsZUlkKCksIG5vd0lzbyk7XG5cbiAgICB0aGlzLnByb2ZpbGVzID0gW3NhdmVkLCAuLi50aGlzLnByb2ZpbGVzXTtcbiAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gc2F2ZWQuaWQ7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gc2F2ZWQubmFtZTtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKGV4cG9ydGVkKTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gZmluYWxOYW1lID09PSBpbmNvbWluZ05hbWVcbiAgICAgID8gYEltcG9ydGVkIHByb2ZpbGUgXHUyMDFDJHtmaW5hbE5hbWV9XHUyMDFELmBcbiAgICAgIDogYEltcG9ydGVkIHByb2ZpbGUgYXMgXHUyMDFDJHtmaW5hbE5hbWV9XHUyMDFEIHRvIGF2b2lkIGEgZHVwbGljYXRlIG5hbWUuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBnZXQgc2VsZWN0ZWRQcm9maWxlKCk6IFNhdmVkUGVyc29uYVByb2ZpbGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5wcm9maWxlcy5maW5kKChwcm9maWxlKSA9PiBwcm9maWxlLmlkID09PSB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkKSA/PyBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZEN1cnJlbnRTbmFwc2hvdCgpOiBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3Qge1xuICAgIHJldHVybiB7XG4gICAgICBidWNrZXRDb25maWc6IHsgLi4udGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5idWNrZXRDb25maWcgfSxcbiAgICAgIGN1cnJlbnRQcmVzZXRJZDogdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5jdXJyZW50UHJlc2V0SWQsXG4gICAgICBkZXB0aDogdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCxcbiAgICAgIG11bHRpUFY6IHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwubXVsdGlQVixcbiAgICAgIGZlYXR1cmVPcHRpb25zOiB7IC4uLnRoaXMuZGVwcy5mZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5vcHRpb25zIH0sXG4gICAgICBicmlsbGlhbnQ6IHtcbiAgICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiB0aGlzLmRlcHMuZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICAgICAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IHRoaXMuZGVwcy5mZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRBbGxvd2VkUGhhc2UsXG4gICAgICB9LFxuICAgICAgdWk6IHtcbiAgICAgICAgdGhlbWVNb2RlOiB0aGlzLmRlcHMudWlTdGF0ZVZpZXdNb2RlbC50aGVtZU1vZGUsXG4gICAgICAgIGJhc2ljTW9kZTogdGhpcy5kZXBzLnVpU3RhdGVWaWV3TW9kZWwuYmFzaWNNb2RlLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBhcHBseVNuYXBzaG90KHNuYXBzaG90OiBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3QpOiB2b2lkIHtcbiAgICB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmFwcGx5UHJvZmlsZVNuYXBzaG90KHtcbiAgICAgIGJ1Y2tldENvbmZpZzogc25hcHNob3QuYnVja2V0Q29uZmlnLFxuICAgICAgY3VycmVudFByZXNldElkOiBzbmFwc2hvdC5jdXJyZW50UHJlc2V0SWQsXG4gICAgICBkZXB0aDogc25hcHNob3QuZGVwdGgsXG4gICAgICBtdWx0aVBWOiBzbmFwc2hvdC5tdWx0aVBWLFxuICAgIH0pO1xuICAgIHRoaXMuZGVwcy5mZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5hcHBseVByb2ZpbGVTZXR0aW5ncyhzbmFwc2hvdC5mZWF0dXJlT3B0aW9ucywgc25hcHNob3QuYnJpbGxpYW50KTtcbiAgICB0aGlzLmRlcHMudWlTdGF0ZVZpZXdNb2RlbC5hcHBseVByb2ZpbGVQcmVmZXJlbmNlcyhzbmFwc2hvdC51aSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUV4cG9ydChuYW1lOiBzdHJpbmcsIHNldHRpbmdzOiBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3QpOiBQZXJzb25hUHJvZmlsZUV4cG9ydCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6IFBFUlNPTkFfUFJPRklMRV9LSU5ELFxuICAgICAgdmVyc2lvbjogUEVSU09OQV9QUk9GSUxFX1ZFUlNJT04sXG4gICAgICBuYW1lLFxuICAgICAgc2V0dGluZ3MsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgdG9FeHBvcnQocHJvZmlsZTogU2F2ZWRQZXJzb25hUHJvZmlsZSk6IFBlcnNvbmFQcm9maWxlRXhwb3J0IHtcbiAgICByZXR1cm4ge1xuICAgICAga2luZDogcHJvZmlsZS5raW5kLFxuICAgICAgdmVyc2lvbjogcHJvZmlsZS52ZXJzaW9uLFxuICAgICAgbmFtZTogcHJvZmlsZS5uYW1lLFxuICAgICAgc2V0dGluZ3M6IHByb2ZpbGUuc2V0dGluZ3MsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgZmluZEJ5TmFtZShuYW1lOiBzdHJpbmcpOiBTYXZlZFBlcnNvbmFQcm9maWxlIHwgbnVsbCB7XG4gICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiB0aGlzLnByb2ZpbGVzLmZpbmQoKHByb2ZpbGUpID0+IHByb2ZpbGUubmFtZS50cmltKCkudG9Mb3dlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUpID8/IG51bGw7XG4gIH1cblxuICBwcml2YXRlIGVuc3VyZVVuaXF1ZU5hbWUoYmFzZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdHJpbW1lZEJhc2VOYW1lID0gYmFzZU5hbWUudHJpbSgpIHx8ICdJbXBvcnRlZCBQcm9maWxlJztcbiAgICBpZiAoIXRoaXMuZmluZEJ5TmFtZSh0cmltbWVkQmFzZU5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJpbW1lZEJhc2VOYW1lO1xuICAgIH1cblxuICAgIGxldCBpbmRleCA9IDI7XG4gICAgbGV0IGNhbmRpZGF0ZSA9IGAke3RyaW1tZWRCYXNlTmFtZX0gJHtpbmRleH1gO1xuICAgIHdoaWxlICh0aGlzLmZpbmRCeU5hbWUoY2FuZGlkYXRlKSkge1xuICAgICAgaW5kZXggKz0gMTtcbiAgICAgIGNhbmRpZGF0ZSA9IGAke3RyaW1tZWRCYXNlTmFtZX0gJHtpbmRleH1gO1xuICAgIH1cblxuICAgIHJldHVybiBjYW5kaWRhdGU7XG4gIH1cblxuICBwcml2YXRlIHJlc3RvcmVGcm9tU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShQRVJTT05BX1BST0ZJTEVTX1NUT1JBR0VfS0VZKTtcbiAgICAgIGlmICghc2F2ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzbmFwc2hvdCA9IHNhbml0aXplUGVyc29uYVByb2ZpbGVTdG9yZVNuYXBzaG90KEpTT04ucGFyc2Uoc2F2ZWQpIGFzIHVua25vd24pO1xuICAgICAgdGhpcy5wcm9maWxlcyA9IHNuYXBzaG90LnByb2ZpbGVzO1xuICAgICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IHNuYXBzaG90LnNlbGVjdGVkUHJvZmlsZUlkID8/IHNuYXBzaG90LnByb2ZpbGVzWzBdPy5pZCA/PyBudWxsO1xuICAgICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU/Lm5hbWUgPz8gJyc7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgaW52YWxpZCBzYXZlZCBwZXJzb25hIHByb2ZpbGVzIGFuZCBjb250aW51ZSB3aXRoIGFuIGVtcHR5IGxpc3QuXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0VG9TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgUEVSU09OQV9QUk9GSUxFU19TVE9SQUdFX0tFWSxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHByb2ZpbGVzOiB0aGlzLnByb2ZpbGVzLFxuICAgICAgICAgIHNlbGVjdGVkUHJvZmlsZUlkOiB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgbG9jYWxTdG9yYWdlIGZhaWx1cmVzIHRvIGtlZXAgc2V0dGluZ3MgdXNhYmxlLlxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgcGVyc29uYVByb2ZpbGVzVmlld01vZGVsID0gbmV3IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCgpO1xuXG5leHBvcnQgeyBQRVJTT05BX1BST0ZJTEVTX1NUT1JBR0VfS0VZIH07XG4iLCAiLyoqXG4gKiBWaWV3TW9kZWxzIE1vZHVsZVxuICogUmUtZXhwb3J0cyBhbGwgVmlld01vZGVsIGluc3RhbmNlc1xuICovXG5cbmV4cG9ydCB7IEJvYXJkVmlld01vZGVsLCBib2FyZFZpZXdNb2RlbCB9IGZyb20gJy4vQm9hcmRWaWV3TW9kZWwnO1xuZXhwb3J0IHsgRW5naW5lVmlld01vZGVsLCBlbmdpbmVWaWV3TW9kZWwgfSBmcm9tICcuL0VuZ2luZVZpZXdNb2RlbCc7XG5leHBvcnQgeyBDb25maWdWaWV3TW9kZWwsIGNvbmZpZ1ZpZXdNb2RlbCB9IGZyb20gJy4vQ29uZmlnVmlld01vZGVsJztcbmV4cG9ydCB7IEZlYXR1cmVPcHRpb25zVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gJy4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwnO1xuZXhwb3J0IHsgR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCwgZ2FtZUFuYWx5dGljc1ZpZXdNb2RlbCB9IGZyb20gJy4vR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCc7XG5leHBvcnQgeyBHYW1lU2V0dXBWaWV3TW9kZWwsIGdhbWVTZXR1cFZpZXdNb2RlbCB9IGZyb20gJy4vR2FtZVNldHVwVmlld01vZGVsJztcbmV4cG9ydCB7IERlYnVnVmlld01vZGVsLCBkZWJ1Z1ZpZXdNb2RlbCB9IGZyb20gJy4vRGVidWdWaWV3TW9kZWwnO1xuZXhwb3J0IHsgVWlTdGF0ZVZpZXdNb2RlbCwgdWlTdGF0ZVZpZXdNb2RlbCB9IGZyb20gJy4vVWlTdGF0ZVZpZXdNb2RlbCc7XG5leHBvcnQgeyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwsIHBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCB9IGZyb20gJy4vUGVyc29uYVByb2ZpbGVzVmlld01vZGVsJztcbiIsICJpbXBvcnQgYXNzZXJ0IGZyb20gJ25vZGU6YXNzZXJ0L3N0cmljdCc7XG5pbXBvcnQgdGVzdCBmcm9tICdub2RlOnRlc3QnO1xuXG5jbGFzcyBNZW1vcnlTdG9yYWdlIHtcbiAgcHJpdmF0ZSBzdG9yZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgZ2V0SXRlbShrZXk6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmhhcyhrZXkpID8gKHRoaXMuc3RvcmUuZ2V0KGtleSkgPz8gbnVsbCkgOiBudWxsO1xuICB9XG5cbiAgc2V0SXRlbShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUuc2V0KGtleSwgdmFsdWUpO1xuICB9XG5cbiAgcmVtb3ZlSXRlbShrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUuZGVsZXRlKGtleSk7XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlLmNsZWFyKCk7XG4gIH1cbn1cblxuY29uc3QgbG9jYWxTdG9yYWdlTW9jayA9IG5ldyBNZW1vcnlTdG9yYWdlKCk7XG4oZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHsgbG9jYWxTdG9yYWdlOiBNZW1vcnlTdG9yYWdlIH0pLmxvY2FsU3RvcmFnZSA9IGxvY2FsU3RvcmFnZU1vY2s7XG5cbnRlc3QoJ2FuYWx5c2lzIHNhZmV0eSBpZ25vcmVzIHN0YWxlIHJlcXVlc3RzIGFuZCBzdGFsZSBkZWxheWVkIG1vdmVzJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IGNhbkFwcGx5QW5hbHl6ZWRNb3ZlLCBpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0IH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvYW5hbHlzaXNTYWZldHknKTtcblxuICBhc3NlcnQuZXF1YWwoaXNTdGFsZUFuYWx5c2lzUmVxdWVzdCgxLCAyKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0KDQsIDQpLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChjYW5BcHBseUFuYWx5emVkTW92ZSgnZmVuLWEnLCAnZmVuLWInKSwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoY2FuQXBwbHlBbmFseXplZE1vdmUoJ2Zlbi1hJywgJ2Zlbi1hJyksIHRydWUpO1xufSk7XG5cbnRlc3QoJ2FuYWx5c2lzIGNhY2hlIGtleSwgdHJpbW1pbmcsIGFuZCBpbnZhbGlkYXRpb24gYmVoYXZlIGNvcnJlY3RseScsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBBbmFseXNpc0NhY2hlLCBidWlsZEFuYWx5c2lzQ2FjaGVLZXkgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9hbmFseXNpc0NhY2hlJyk7XG5cbiAgYXNzZXJ0LmVxdWFsKFxuICAgIGJ1aWxkQW5hbHlzaXNDYWNoZUtleSgnZmVuJywgOCwgMTIpLFxuICAgICdmZW58ZGVwdGg6OHxtdWx0aXB2OjEyJyxcbiAgKTtcblxuICBjb25zdCBjYWNoZSA9IG5ldyBBbmFseXNpc0NhY2hlKDIpO1xuICBjYWNoZS5zZXQoeyBrZXk6ICdhJywgbW92ZXM6IFtdLCB0aW1lc3RhbXA6IDEgfSk7XG4gIGNhY2hlLnNldCh7IGtleTogJ2InLCBtb3ZlczogW10sIHRpbWVzdGFtcDogMiB9KTtcbiAgY2FjaGUuc2V0KHsga2V5OiAnYycsIG1vdmVzOiBbXSwgdGltZXN0YW1wOiAzIH0pO1xuXG4gIGFzc2VydC5lcXVhbChjYWNoZS5zaXplLCAyKTtcbiAgYXNzZXJ0LmVxdWFsKGNhY2hlLmdldCgnYScpLCBudWxsKTtcbiAgYXNzZXJ0Lm5vdEVxdWFsKGNhY2hlLmdldCgnYicpLCBudWxsKTtcbiAgYXNzZXJ0Lm5vdEVxdWFsKGNhY2hlLmdldCgnYycpLCBudWxsKTtcblxuICBjYWNoZS5pbnZhbGlkYXRlKCdiJyk7XG4gIGFzc2VydC5lcXVhbChjYWNoZS5nZXQoJ2InKSwgbnVsbCk7XG5cbiAgY2FjaGUuaW52YWxpZGF0ZSgpO1xuICBhc3NlcnQuZXF1YWwoY2FjaGUuc2l6ZSwgMCk7XG59KTtcblxudGVzdCgnZGV0ZXJtaW5pc3RpYyBSTkcgY2hhbmdlcyBzdHJlYW0gd2hlbiBGRU4gY2hhbmdlcyBhdCB0aGUgc2FtZSBtb3ZlIG51bWJlcicsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBidWlsZERldGVybWluaXN0aWNTZWVkLCBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9yYW5kb20nKTtcblxuICBjb25zdCBzZWVkQSA9IGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQoe1xuICAgIGdhbWVTdGFydEZlbjogJ3N0YXJ0LWZlbicsXG4gICAgY3VycmVudEZlbjogJ2Zlbi1hJyxcbiAgICBtb3ZlQ291bnQ6IDEyLFxuICAgIHNpZGVUb01vdmU6ICd3JyxcbiAgICBwZXJzb25hOiAnbWVkaXVtJyxcbiAgfSk7XG4gIGNvbnN0IHNlZWRCID0gYnVpbGREZXRlcm1pbmlzdGljU2VlZCh7XG4gICAgZ2FtZVN0YXJ0RmVuOiAnc3RhcnQtZmVuJyxcbiAgICBjdXJyZW50RmVuOiAnZmVuLWInLFxuICAgIG1vdmVDb3VudDogMTIsXG4gICAgc2lkZVRvTW92ZTogJ3cnLFxuICAgIHBlcnNvbmE6ICdtZWRpdW0nLFxuICB9KTtcblxuICBjb25zdCBybmdBID0gY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlKHNlZWRBKTtcbiAgY29uc3Qgcm5nQiA9IGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZShzZWVkQik7XG5cbiAgYXNzZXJ0Lm5vdEVxdWFsKHJuZ0EubmV4dCgpLCBybmdCLm5leHQoKSk7XG59KTtcblxudGVzdCgnUEdOIGN1c3RvbSBzdGFydCBGRU4gaXMgcmVzcGVjdGVkJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IHJlc29sdmVQZ25TdGFydEZlbiB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2dhbWVTZXNzaW9uJyk7XG5cbiAgY29uc3QgZmVuID0gcmVzb2x2ZVBnblN0YXJ0RmVuKFxuICAgIHtcbiAgICAgIFNldFVwOiAnMScsXG4gICAgICBGRU46ICc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnLFxuICAgIH0sXG4gICAgJ2ZhbGxiYWNrJyxcbiAgKTtcblxuICBhc3NlcnQuZXF1YWwoZmVuLCAnOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyk7XG59KTtcblxudGVzdCgnYnJpbGxpYW50IHVzYWdlIGRlcml2ZXMgZnJvbSBtb3ZlIGhpc3RvcnkgbWV0YWRhdGEnLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgZGVyaXZlQnJpbGxpYW50VXNhZ2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9icmlsbGlhbnRUcmFja2luZycpO1xuXG4gIGNvbnN0IHVzYWdlID0gZGVyaXZlQnJpbGxpYW50VXNhZ2UoW1xuICAgIHtcbiAgICAgIGJlZm9yZUZlbjogJ2EnLFxuICAgICAgYWZ0ZXJGZW46ICdiJyxcbiAgICAgIHVjaTogJ2UyZTQnLFxuICAgICAgbW92ZU51bWJlcjogMSxcbiAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiBmYWxzZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGJlZm9yZUZlbjogJ2InLFxuICAgICAgYWZ0ZXJGZW46ICdjJyxcbiAgICAgIHVjaTogJ2U3ZTUnLFxuICAgICAgbW92ZU51bWJlcjogMSxcbiAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlLFxuICAgIH0sXG4gIF0pO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwodXNhZ2UsIHtcbiAgICBicmlsbGlhbnRVc2VkQ291bnQ6IDEsXG4gICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IFsxXSxcbiAgfSk7XG59KTtcblxudGVzdCgnYnJpbGxpYW50IGJ1ZGdldCBpcyBjb25zdW1lZCBvbmx5IGFmdGVyIGEgc3VjY2Vzc2Z1bCBlbmdpbmUgbW92ZSBhbmQgcm9sbHMgYmFjayBvbiB1bmRvL3JlZG8nLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZUJyaWxsaWFudE1vdmVCdWRnZXQnLCB0cnVlKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lKDIpO1xuXG4gIGNvbnN0IGludmFsaWRNb3ZlID0gYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2ExYTEnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoaW52YWxpZE1vdmUsIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG5cbiAgY29uc3Qgc3VjY2Vzc2Z1bE1vdmUgPSBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnZTJlNCcsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChzdWNjZXNzZnVsTW92ZSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuICBhc3NlcnQuZGVlcEVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVOdW1iZXJzLCBbMV0pO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC51bmRvU2luZ2xlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3ZlTnVtYmVycywgW10pO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5yZWRvU2luZ2xlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3ZlTnVtYmVycywgWzFdKTtcbn0pO1xuXG50ZXN0KCduZXcgRkVOLCBQR04sIGFuZCBvcGVuaW5nIGxvYWRzIHJlc2V0IGJyaWxsaWFudCBzdGF0ZSBhbmQgUEdOIHN0YXJ0IEZFTiB1cGRhdGVzIGdhbWUgc3RhcnQnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IFBSRURFRklORURfT1BFTklOR1MgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9vcGVuaW5ncycpO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZUJyaWxsaWFudE1vdmVCdWRnZXQnLCB0cnVlKTtcbiAgYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2UyZTQnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcblxuICBib2FyZFZpZXdNb2RlbC5sb2FkRmVuKCc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG5cbiAgYm9hcmRWaWV3TW9kZWwubG9hZFBnbignW1NldFVwIFwiMVwiXVxcbltGRU4gXCI4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDFcIl1cXG5cXG4xLiBLYTIgKicpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuZ2FtZVN0YXJ0RmVuLCAnOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuXG4gIGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdoMWgyJywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG5cbiAgYm9hcmRWaWV3TW9kZWwubG9hZFBnbihQUkVERUZJTkVEX09QRU5JTkdTWzBdLnBnbik7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xufSk7XG5cbnRlc3QoJ3NvbHZlTmV4dE1vdmUgZHJvcHMgc3RhbGUgZGVsYXllZCBhdXRvcGxheSBtb3ZlcyBzYWZlbHknLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBlbmdpbmVWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLCBjb25maWdWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbicsIHRydWUpO1xuICBjb25maWdWaWV3TW9kZWwuYXBwbHlQcmVzZXQoJ21lZGl1bScpO1xuXG4gIGNvbnN0IG9yaWdpbmFsSW5pdGlhbGl6ZSA9IGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplLmJpbmQoZW5naW5lVmlld01vZGVsKTtcbiAgY29uc3Qgb3JpZ2luYWxBbmFseXplUG9zaXRpb24gPSBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uLmJpbmQoZW5naW5lVmlld01vZGVsKTtcbiAgY29uc3Qgb3JpZ2luYWxQaWNrTW92ZSA9IGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcy5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG5cbiAgbGV0IHJlbGVhc2VEZWxheTogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG5cbiAgZW5naW5lVmlld01vZGVsLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSA9IGFzeW5jICgpID0+IHVuZGVmaW5lZDtcbiAgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbiA9IGFzeW5jIChmZW46IHN0cmluZykgPT4gKHtcbiAgICByZXF1ZXN0SWQ6IDEsXG4gICAgYW5hbHl6ZWRGZW46IGZlbixcbiAgICBtb3ZlczogW1xuICAgICAge1xuICAgICAgICBtb3ZlOiAnZTJlNCcsXG4gICAgICAgIGV2YWx1YXRpb246IDMwLFxuICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgcHY6IFsnZTJlNCddLFxuICAgICAgICBtdWx0aXB2OiAxLFxuICAgICAgICBkZXB0aDogOCxcbiAgICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgICB9LFxuICAgIF0sXG4gICAgY29tcGxleGl0eToge1xuICAgICAgbGV2ZWw6ICdtZWRpdW0nLFxuICAgICAgc2NvcmU6IDAuNSxcbiAgICAgIHNwcmVhZDogMzAsXG4gICAgICBjbG9zZUNhbmRpZGF0ZXM6IDIsXG4gICAgICB2b2xhdGlsaXR5OiAyMCxcbiAgICB9LFxuICAgIGlnbm9yZWQ6IGZhbHNlLFxuICAgIGZyb21DYWNoZTogZmFsc2UsXG4gICAgcHVycG9zZTogJ2VuZ2luZU1vdmUnLFxuICB9KTtcbiAgZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzID0gKCkgPT4gKHtcbiAgICBtb3ZlOiB7XG4gICAgICBtb3ZlOiAnZTJlNCcsXG4gICAgICBldmFsdWF0aW9uOiAzMCxcbiAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgcHY6IFsnZTJlNCddLFxuICAgICAgbXVsdGlwdjogMSxcbiAgICAgIGRlcHRoOiA4LFxuICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgfSxcbiAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gIH0pO1xuXG4gIChib2FyZFZpZXdNb2RlbCBhcyB1bmtub3duIGFzIHsgd2FpdDogKGRlbGF5TXM6IG51bWJlcikgPT4gUHJvbWlzZTx2b2lkPiB9KS53YWl0ID0gKCkgPT5cbiAgICBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgcmVsZWFzZURlbGF5ID0gcmVzb2x2ZTtcbiAgICB9KTtcblxuICBjb25zdCBwZW5kaW5nTW92ZSA9IGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUodHJ1ZSk7XG4gIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgc2V0VGltZW91dChyZXNvbHZlLCAwKTtcbiAgfSk7XG4gIGJvYXJkVmlld01vZGVsLmxvYWRGZW4oJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScpO1xuICByZWxlYXNlRGVsYXk/LigpO1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBwZW5kaW5nTW92ZTtcblxuICBhc3NlcnQuZXF1YWwocmVzdWx0LCBudWxsKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmZlbiwgJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScpO1xuXG4gIGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplID0gb3JpZ2luYWxJbml0aWFsaXplO1xuICBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxBbmFseXplUG9zaXRpb247XG4gIGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcyA9IG9yaWdpbmFsUGlja01vdmU7XG59KTtcblxudGVzdCgnYmFja2dyb3VuZCBhbmFseXNpcyBkb2VzIG5vdCBjYW5jZWwgYSB2YWxpZCBwZW5kaW5nIGVuZ2luZSBtb3ZlIHJlcXVlc3QnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IEVuZ2luZVZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLCBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZScpO1xuICBjb25zdCBlbmdpbmUgPSBuZXcgRW5naW5lVmlld01vZGVsKCk7XG5cbiAgY29uc3Qgb3JpZ2luYWxJbml0aWFsaXplID0gZW5naW5lLmluaXRpYWxpemUuYmluZChlbmdpbmUpO1xuICBjb25zdCBvcmlnaW5hbE1vdmVBbmFseXplID0gbW92ZVN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uLmJpbmQobW92ZVN0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbE1vdmVDb25maWd1cmUgPSBtb3ZlU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUuYmluZChtb3ZlU3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsTW92ZVN0b3AgPSBtb3ZlU3RvY2tmaXNoU2VydmljZS5zdG9wLmJpbmQobW92ZVN0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5c2lzQW5hbHl6ZSA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24uYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5c2lzQ29uZmlndXJlID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZS5iaW5kKGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHlzaXNTdG9wID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AuYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuXG4gIGxldCByZWxlYXNlTW92ZUFuYWx5c2lzOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgbGV0IG1vdmVBbmFseXplQ2FsbHMgPSAwO1xuICBsZXQgYmFja2dyb3VuZEFuYWx5emVDYWxscyA9IDA7XG5cbiAgZW5naW5lLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IGFzeW5jICgpID0+IHVuZGVmaW5lZDtcbiAgbW92ZVN0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gKCkgPT4gdW5kZWZpbmVkO1xuICBtb3ZlU3RvY2tmaXNoU2VydmljZS5zdG9wID0gKCkgPT4gdW5kZWZpbmVkO1xuICBtb3ZlU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgbW92ZUFuYWx5emVDYWxscyArPSAxO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICByZWxlYXNlTW92ZUFuYWx5c2lzID0gcmVzb2x2ZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgICAgZXZhbHVhdGlvbjogNDIsXG4gICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICBwdjogWydlMmU0J10sXG4gICAgICAgIG11bHRpcHY6IDEsXG4gICAgICAgIGRlcHRoOiAxMCxcbiAgICAgIH0sXG4gICAgXTtcbiAgfTtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9ICgpID0+IHVuZGVmaW5lZDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgYmFja2dyb3VuZEFuYWx5emVDYWxscyArPSAxO1xuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgICAgZXZhbHVhdGlvbjogNDIsXG4gICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICBwdjogWydlMmU0J10sXG4gICAgICAgIG11bHRpcHY6IDEsXG4gICAgICAgIGRlcHRoOiAxMCxcbiAgICAgIH0sXG4gICAgXTtcbiAgfTtcblxuICBjb25zdCBlbmdpbmVNb3ZlUHJvbWlzZSA9IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1zaGFyZWQnLCAxMCwgMiwgJ2VuZ2luZU1vdmUnKTtcbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMCkpO1xuICBjb25zdCBiYWNrZ3JvdW5kUHJvbWlzZSA9IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1zaGFyZWQnLCAxMCwgMiwgJ2JhY2tncm91bmQnKTtcblxuICByZWxlYXNlTW92ZUFuYWx5c2lzPy4oKTtcblxuICBjb25zdCBbZW5naW5lTW92ZVJlc3VsdCwgYmFja2dyb3VuZFJlc3VsdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbZW5naW5lTW92ZVByb21pc2UsIGJhY2tncm91bmRQcm9taXNlXSk7XG5cbiAgYXNzZXJ0LmVxdWFsKG1vdmVBbmFseXplQ2FsbHMsIDEpO1xuICBhc3NlcnQuZXF1YWwoYmFja2dyb3VuZEFuYWx5emVDYWxscywgMSk7XG4gIGFzc2VydC5lcXVhbChlbmdpbmVNb3ZlUmVzdWx0Lmlnbm9yZWQsIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGJhY2tncm91bmRSZXN1bHQuaWdub3JlZCwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoYmFja2dyb3VuZFJlc3VsdC5hbmFseXplZEZlbiwgJ2Zlbi1zaGFyZWQnKTtcblxuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IG9yaWdpbmFsSW5pdGlhbGl6ZTtcbiAgbW92ZVN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxNb3ZlQW5hbHl6ZTtcbiAgbW92ZVN0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gb3JpZ2luYWxNb3ZlQ29uZmlndXJlO1xuICBtb3ZlU3RvY2tmaXNoU2VydmljZS5zdG9wID0gb3JpZ2luYWxNb3ZlU3RvcDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IG9yaWdpbmFsQW5hbHlzaXNBbmFseXplO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gb3JpZ2luYWxBbmFseXNpc0NvbmZpZ3VyZTtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AgPSBvcmlnaW5hbEFuYWx5c2lzU3RvcDtcbn0pO1xuXG50ZXN0KCdlbmdpbmUgcmVzZXQgY2xlYXJzIGluLWZsaWdodCBhbmFseXNpcyBzdGF0ZSBzbyBuZXcgcmVxdWVzdHMgYXJlIG5vdCBibG9ja2VkJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBFbmdpbmVWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZScpO1xuICBjb25zdCBlbmdpbmUgPSBuZXcgRW5naW5lVmlld01vZGVsKCk7XG5cbiAgY29uc3Qgb3JpZ2luYWxJbml0aWFsaXplID0gZW5naW5lLmluaXRpYWxpemUuYmluZChlbmdpbmUpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5emUgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uLmJpbmQoYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxDb25maWd1cmUgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlLmJpbmQoYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxTdG9wID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AuYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuXG4gIGxldCByZXNvbHZlRmlyc3RBbmFseXNpczogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIGxldCBhbmFseXplQ2FsbENvdW50ID0gMDtcblxuICBlbmdpbmUuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gIGVuZ2luZS5pbml0aWFsaXplID0gYXN5bmMgKCkgPT4gdW5kZWZpbmVkO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gKCkgPT4gdW5kZWZpbmVkO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2Uuc3RvcCA9ICgpID0+IHVuZGVmaW5lZDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IGFzeW5jICgpID0+IHtcbiAgICBhbmFseXplQ2FsbENvdW50ICs9IDE7XG5cbiAgICBpZiAoYW5hbHl6ZUNhbGxDb3VudCA9PT0gMSkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHJlc29sdmVGaXJzdEFuYWx5c2lzID0gKCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBtb3ZlOiAnZTJlNCcsXG4gICAgICAgICAgICAgIGV2YWx1YXRpb246IDEyLFxuICAgICAgICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgICAgICAgcHY6IFsnZTJlNCddLFxuICAgICAgICAgICAgICBtdWx0aXB2OiAxLFxuICAgICAgICAgICAgICBkZXB0aDogOCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSk7XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBtb3ZlOiAnZDJkNCcsXG4gICAgICAgIGV2YWx1YXRpb246IDE4LFxuICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgcHY6IFsnZDJkNCddLFxuICAgICAgICBtdWx0aXB2OiAxLFxuICAgICAgICBkZXB0aDogOCxcbiAgICAgIH0sXG4gICAgXTtcbiAgfTtcblxuICBjb25zdCBzdGFsZUFuYWx5c2lzUHJvbWlzZSA9IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1vbGQnLCA4LCAyLCAnYmFja2dyb3VuZCcpO1xuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCAwKSk7XG5cbiAgZW5naW5lLnJlc2V0KCk7XG4gIGFzc2VydC5lcXVhbChlbmdpbmUuaXNBbmFseXppbmcsIGZhbHNlKTtcblxuICBjb25zdCBmcmVzaEFuYWx5c2lzUHJvbWlzZSA9IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1uZXcnLCA4LCAyLCAnYmFja2dyb3VuZCcpO1xuICByZXNvbHZlRmlyc3RBbmFseXNpcz8uKCk7XG5cbiAgY29uc3QgZnJlc2hSZXN1bHQgPSBhd2FpdCBmcmVzaEFuYWx5c2lzUHJvbWlzZTtcbiAgY29uc3Qgc3RhbGVSZXN1bHQgPSBhd2FpdCBzdGFsZUFuYWx5c2lzUHJvbWlzZTtcblxuICBhc3NlcnQuZXF1YWwoYW5hbHl6ZUNhbGxDb3VudCwgMik7XG4gIGFzc2VydC5lcXVhbChmcmVzaFJlc3VsdC5hbmFseXplZEZlbiwgJ2Zlbi1uZXcnKTtcbiAgYXNzZXJ0LmVxdWFsKHN0YWxlUmVzdWx0Lmlnbm9yZWQsIHRydWUpO1xuXG4gIGVuZ2luZS5pbml0aWFsaXplID0gb3JpZ2luYWxJbml0aWFsaXplO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxBbmFseXplO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gb3JpZ2luYWxDb25maWd1cmU7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5zdG9wID0gb3JpZ2luYWxTdG9wO1xufSk7XG5cbnRlc3QoJ3Jlc3RvcmVkIG1vdmUgYW5ub3RhdGlvbnMgcHJlc2VydmUgYnJpbGxpYW50IHVuZG8vcmVkbyB0cmFja2luZyBhZnRlciByZXN0YXJ0JywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBCb2FyZFZpZXdNb2RlbCwgYm9hcmRWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigncGVyc2lzdEVuZ2luZUNvbmZpZycsIHRydWUpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZUJyaWxsaWFudE1vdmVCdWRnZXQnLCB0cnVlKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lKDIpO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGNvbnN0IG1vdmVBcHBsaWVkID0gYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2UyZTQnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwobW92ZUFwcGxpZWQsIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwudW5kb1NpbmdsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5jYW5SZWRvLCB0cnVlKTtcblxuICBjb25zdCByZXN0b3JlZEJvYXJkID0gbmV3IEJvYXJkVmlld01vZGVsKCk7XG4gIGFzc2VydC5lcXVhbChyZXN0b3JlZEJvYXJkLmNhblJlZG8sIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcblxuICBhc3NlcnQuZXF1YWwocmVzdG9yZWRCb2FyZC5yZWRvU2luZ2xlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3ZlTnVtYmVycywgWzFdKTtcblxuICBhc3NlcnQuZXF1YWwocmVzdG9yZWRCb2FyZC51bmRvU2luZ2xlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcbn0pO1xuXG50ZXN0KCduZXcgZ2FtZSBjbGVhcnMgc3RhbGUgYm9hcmQgdHJhbnNpZW50IHN0YXRlIGFuZCBhbGxvd3MgYmxhY2sgYXV0b3BsYXkgdHVybiBmbG93IGFnYWluJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGJvYXJkVmlld01vZGVsLmlzVGhpbmtpbmcgPSB0cnVlO1xuICBib2FyZFZpZXdNb2RlbC5pc0FuYWx5emluZ01vdmVzID0gdHJ1ZTtcbiAgYm9hcmRWaWV3TW9kZWwubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gJ2dvb2QnO1xuICBib2FyZFZpZXdNb2RlbC5zZXRBdXRvUGxheSh0cnVlKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0RW5naW5lUGxheXNGb3IoJ2InKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5pc1RoaW5raW5nLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5pc0FuYWx5emluZ01vdmVzLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5sYXN0UGxheWVyTW92ZVF1YWxpdHksIG51bGwpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuY2FuU3RhcnRBdXRvUGxheVR1cm4sIGZhbHNlKTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwubWFrZU1vdmUoJ2UyJywgJ2U0JyksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuY2FuU3RhcnRBdXRvUGxheVR1cm4sIHRydWUpO1xufSk7XG5cbnRlc3QoJ2NhY2hlLWhpdCBpbmRpY2F0b3IgcmVmbGVjdHMgd2hldGhlciBhbmFseXNpcyBjYW1lIGZyb20gY2FjaGUnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IEVuZ2luZVZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZScpO1xuICBjb25zdCB7IGFuYWx5c2lzQ2FjaGUgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9hbmFseXNpc0NhY2hlJyk7XG4gIGNvbnN0IGVuZ2luZSA9IG5ldyBFbmdpbmVWaWV3TW9kZWwoKTtcblxuICBjb25zdCBvcmlnaW5hbEluaXRpYWxpemUgPSBlbmdpbmUuaW5pdGlhbGl6ZS5iaW5kKGVuZ2luZSk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHl6ZSA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24uYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbENvbmZpZ3VyZSA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUuYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuXG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZU1vdmVBbmFseXNpc0NhY2hlJywgdHJ1ZSk7XG4gIGFuYWx5c2lzQ2FjaGUuaW52YWxpZGF0ZSgpO1xuXG4gIGVuZ2luZS5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgZW5naW5lLmluaXRpYWxpemUgPSBhc3luYyAoKSA9PiB1bmRlZmluZWQ7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoKSA9PiBbXG4gICAge1xuICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgZXZhbHVhdGlvbjogMzUsXG4gICAgICBldmFsTG9zczogMCxcbiAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgIG11bHRpcHY6IDEsXG4gICAgICBkZXB0aDogMTIsXG4gICAgfSxcbiAgXTtcblxuICBjb25zdCBmaXJzdCA9IGF3YWl0IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1jYWNoZScsIDEyLCAyLCAnYmFja2dyb3VuZCcpO1xuICBjb25zdCBzZWNvbmQgPSBhd2FpdCBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tY2FjaGUnLCAxMiwgMiwgJ2JhY2tncm91bmQnKTtcblxuICBhc3NlcnQuZXF1YWwoZmlyc3QuZnJvbUNhY2hlLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChzZWNvbmQuZnJvbUNhY2hlLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGVuZ2luZS5sYXN0QW5hbHlzaXNGcm9tQ2FjaGUsIHRydWUpO1xuXG4gIGVuZ2luZS5pbml0aWFsaXplID0gb3JpZ2luYWxJbml0aWFsaXplO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxBbmFseXplO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gb3JpZ2luYWxDb25maWd1cmU7XG59KTtcblxudGVzdCgncGVyc29uYSBwcm9maWxlcyBzYXZlIGFuZCBsb2FkIHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24gc25hcHNob3QnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IERFRkFVTFRfQlVDS0VUX0NPTkZJRyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3R5cGVzJyk7XG4gIGNvbnN0IHsgREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9mZWF0dXJlT3B0aW9ucycpO1xuXG4gIGxldCBhcHBsaWVkQ29uZmlnOiB1bmtub3duID0gbnVsbDtcbiAgbGV0IGFwcGxpZWRGZWF0dXJlT3B0aW9uczogdW5rbm93biA9IG51bGw7XG4gIGxldCBhcHBsaWVkQnJpbGxpYW50U2V0dGluZ3M6IHVua25vd24gPSBudWxsO1xuICBsZXQgYXBwbGllZFVpOiB1bmtub3duID0gbnVsbDtcblxuICBjb25zdCBwcm9maWxlcyA9IG5ldyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwoe1xuICAgIGNvbmZpZ1ZpZXdNb2RlbDoge1xuICAgICAgYnVja2V0Q29uZmlnOiB7XG4gICAgICAgIC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgICAgICAgYmVzdDogMjgsXG4gICAgICAgIGdyZWF0OiAyMixcbiAgICAgIH0sXG4gICAgICBjdXJyZW50UHJlc2V0SWQ6ICdhZ2dyZXNzaXZlJyxcbiAgICAgIGRlcHRoOiAxMyxcbiAgICAgIG11bHRpUFY6IDcsXG4gICAgICBhcHBseVByb2ZpbGVTbmFwc2hvdDogKHNuYXBzaG90KSA9PiB7XG4gICAgICAgIGFwcGxpZWRDb25maWcgPSBzbmFwc2hvdDtcbiAgICAgIH0sXG4gICAgfSxcbiAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbDoge1xuICAgICAgb3B0aW9uczoge1xuICAgICAgICAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyxcbiAgICAgICAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogdHJ1ZSxcbiAgICAgICAgdXNlTW92ZUFuYWx5c2lzQ2FjaGU6IGZhbHNlLFxuICAgICAgICB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0OiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMyxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ21pZGRsZWdhbWUnLFxuICAgICAgYXBwbHlQcm9maWxlU2V0dGluZ3M6IChvcHRpb25zLCBicmlsbGlhbnQpID0+IHtcbiAgICAgICAgYXBwbGllZEZlYXR1cmVPcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgYXBwbGllZEJyaWxsaWFudFNldHRpbmdzID0gYnJpbGxpYW50O1xuICAgICAgfSxcbiAgICB9LFxuICAgIHVpU3RhdGVWaWV3TW9kZWw6IHtcbiAgICAgIHRoZW1lTW9kZTogJ3BlcnNvbmEnLFxuICAgICAgYmFzaWNNb2RlOiBmYWxzZSxcbiAgICAgIGFwcGx5UHJvZmlsZVByZWZlcmVuY2VzOiAocHJlZmVyZW5jZXMpID0+IHtcbiAgICAgICAgYXBwbGllZFVpID0gcHJlZmVyZW5jZXM7XG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIHByb2ZpbGVzLnNldFByb2ZpbGVOYW1lRHJhZnQoJ1NoYXJwIFRhY3RpY2lhbicpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMuc2F2ZUN1cnJlbnRQcm9maWxlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXMubGVuZ3RoLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5uYW1lLCAnU2hhcnAgVGFjdGljaWFuJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8uc2V0dGluZ3MuZGVwdGgsIDEzKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy5mZWF0dXJlT3B0aW9ucy51c2VEZXRlcm1pbmlzdGljUm5nLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy5icmlsbGlhbnQuYnJpbGxpYW50TW92ZXNQZXJHYW1lLCAzKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy51aS50aGVtZU1vZGUsICdwZXJzb25hJyk7XG5cbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLmxvYWRTZWxlY3RlZFByb2ZpbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoYXBwbGllZENvbmZpZywge1xuICAgIGJ1Y2tldENvbmZpZzoge1xuICAgICAgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICAgICAgYmVzdDogMjgsXG4gICAgICBncmVhdDogMjIsXG4gICAgfSxcbiAgICBjdXJyZW50UHJlc2V0SWQ6ICdhZ2dyZXNzaXZlJyxcbiAgICBkZXB0aDogMTMsXG4gICAgbXVsdGlQVjogNyxcbiAgfSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoYXBwbGllZEZlYXR1cmVPcHRpb25zLCB7XG4gICAgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gICAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogdHJ1ZSxcbiAgICB1c2VNb3ZlQW5hbHlzaXNDYWNoZTogZmFsc2UsXG4gICAgdXNlQnJpbGxpYW50TW92ZUJ1ZGdldDogdHJ1ZSxcbiAgfSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoYXBwbGllZEJyaWxsaWFudFNldHRpbmdzLCB7XG4gICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAzLFxuICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ21pZGRsZWdhbWUnLFxuICB9KTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChhcHBsaWVkVWksIHtcbiAgICB0aGVtZU1vZGU6ICdwZXJzb25hJyxcbiAgICBiYXNpY01vZGU6IGZhbHNlLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdwZXJzb25hIHByb2ZpbGUgaW1wb3J0IHZhbGlkYXRlcyBKU09OIHNhZmVseSBhbmQgZGVkdXBsaWNhdGVzIG5hbWVzJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBERUZBVUxUX0JVQ0tFVF9DT05GSUcgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS90eXBlcycpO1xuICBjb25zdCB7IERFRkFVTFRfRkVBVFVSRV9PUFRJT05TIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvZmVhdHVyZU9wdGlvbnMnKTtcblxuICBjb25zdCBwcm9maWxlcyA9IG5ldyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwoe1xuICAgIGNvbmZpZ1ZpZXdNb2RlbDoge1xuICAgICAgYnVja2V0Q29uZmlnOiB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyB9LFxuICAgICAgY3VycmVudFByZXNldElkOiAnbWVkaXVtJyxcbiAgICAgIGRlcHRoOiA4LFxuICAgICAgbXVsdGlQVjogMTIsXG4gICAgICBhcHBseVByb2ZpbGVTbmFwc2hvdDogKCkgPT4gdW5kZWZpbmVkLFxuICAgIH0sXG4gICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWw6IHtcbiAgICAgIG9wdGlvbnM6IHsgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfSxcbiAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMCxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ2FueScsXG4gICAgICBhcHBseVByb2ZpbGVTZXR0aW5nczogKCkgPT4gdW5kZWZpbmVkLFxuICAgIH0sXG4gICAgdWlTdGF0ZVZpZXdNb2RlbDoge1xuICAgICAgdGhlbWVNb2RlOiAnZGFyaycsXG4gICAgICBiYXNpY01vZGU6IHRydWUsXG4gICAgICBhcHBseVByb2ZpbGVQcmVmZXJlbmNlczogKCkgPT4gdW5kZWZpbmVkLFxuICAgIH0sXG4gIH0pO1xuXG4gIHByb2ZpbGVzLnNldFByb2ZpbGVOYW1lRHJhZnQoJ0JhbGFuY2VkJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5zYXZlQ3VycmVudFByb2ZpbGUoKSwgdHJ1ZSk7XG5cbiAgcHJvZmlsZXMuc2V0RXhjaGFuZ2VKc29uKCd7YmFkIGpzb24nKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLmltcG9ydFByb2ZpbGVGcm9tSnNvbigpLCBmYWxzZSk7XG4gIGFzc2VydC5tYXRjaChwcm9maWxlcy5pbXBvcnRFcnJvciwgL2NvdWxkIG5vdCBiZSBwYXJzZWQvaSk7XG5cbiAgcHJvZmlsZXMuc2V0RXhjaGFuZ2VKc29uKFxuICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGtpbmQ6ICdwZXJzb25hY2hlc3MucGVyc29uYS1wcm9maWxlJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBuYW1lOiAnQmFsYW5jZWQnLFxuICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgYnVja2V0Q29uZmlnOiBERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gICAgICAgIGN1cnJlbnRQcmVzZXRJZDogJ2hhcmQnLFxuICAgICAgICBkZXB0aDogMTUsXG4gICAgICAgIG11bHRpUFY6IDQsXG4gICAgICAgIGZlYXR1cmVPcHRpb25zOiB7XG4gICAgICAgICAgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gICAgICAgICAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgYnJpbGxpYW50OiB7XG4gICAgICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAyLFxuICAgICAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ2VuZGdhbWUnLFxuICAgICAgICB9LFxuICAgICAgICB1aToge1xuICAgICAgICAgIHRoZW1lTW9kZTogJ2xpZ2h0JyxcbiAgICAgICAgICBiYXNpY01vZGU6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcbiAgKTtcblxuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMuaW1wb3J0UHJvZmlsZUZyb21Kc29uKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXMubGVuZ3RoLCAyKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5uYW1lLCAnQmFsYW5jZWQgMicpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLmN1cnJlbnRQcmVzZXRJZCwgJ2hhcmQnKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy51aS50aGVtZU1vZGUsICdsaWdodCcpO1xufSk7XG5cbnRlc3QoJ2dhbWUgc2V0dXAgcHJlc2V0cyByZW1haW4gc2VhcmNoYWJsZSBhbmQgY29tcGF0aWJsZSB3aXRoIHRoZSBleGlzdGluZyBvcGVuaW5nIGxpYnJhcnknLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgUFJFREVGSU5FRF9PUEVOSU5HUyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL29wZW5pbmdzJyk7XG4gIGNvbnN0IHtcbiAgICBHQU1FX1NFVFVQX1BSRVNFVFMsXG4gICAgZmlsdGVyR2FtZVNldHVwUHJlc2V0cyxcbiAgICB0b0NvbXBhdGlibGVPcGVuaW5nUHJlc2V0LFxuICB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2dhbWVTZXR1cFByZXNldHMnKTtcblxuICBhc3NlcnQub2soR0FNRV9TRVRVUF9QUkVTRVRTLmxlbmd0aCA+PSBQUkVERUZJTkVEX09QRU5JTkdTLmxlbmd0aCk7XG5cbiAgY29uc3QgZmlsdGVyZWQgPSBmaWx0ZXJHYW1lU2V0dXBQcmVzZXRzKEdBTUVfU0VUVVBfUFJFU0VUUywgJ29wZW5pbmdzJywgJ3NpY2lsaWFuJyk7XG4gIGFzc2VydC5lcXVhbChmaWx0ZXJlZC5sZW5ndGgsIDEpO1xuICBhc3NlcnQubWF0Y2goZmlsdGVyZWRbMF0/Lm5hbWUgPz8gJycsIC9zaWNpbGlhbi9pKTtcblxuICBjb25zdCBvcGVuaW5nUHJlc2V0ID0gdG9Db21wYXRpYmxlT3BlbmluZ1ByZXNldChQUkVERUZJTkVEX09QRU5JTkdTWzBdPy5pZCA/PyAnJyk7XG4gIGFzc2VydC5lcXVhbChvcGVuaW5nUHJlc2V0Py5zb3VyY2VUeXBlLCAncGduJyk7XG4gIGFzc2VydC5lcXVhbChvcGVuaW5nUHJlc2V0Py5zb3VyY2UsIFBSRURFRklORURfT1BFTklOR1NbMF0/LnBnbik7XG59KTtcblxudGVzdCgnbG9hZGluZyBhIGdhbWUgc2V0dXAgcHJlc2V0IHJlc2V0cyBzZXNzaW9uIHN0YXRlIGFuZCBicmlsbGlhbnQgdHJhY2tpbmcnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IGdldEdhbWVTZXR1cFByZXNldEJ5SWQgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9nYW1lU2V0dXBQcmVzZXRzJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsIHRydWUpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWUoMik7XG5cbiAgY29uc3QgYmFzZWxpbmVTZXNzaW9uSWQgPSBib2FyZFZpZXdNb2RlbC5kZWJ1Z1Nlc3Npb25JZDtcbiAgYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2UyZTQnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcblxuICBjb25zdCBwcmVzZXQgPSBnZXRHYW1lU2V0dXBQcmVzZXRCeUlkKCdpdGFsaWFuJyk7XG4gIGFzc2VydC5vayhwcmVzZXQpO1xuICBpZiAoIXByZXNldCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgaXRhbGlhbiBwcmVzZXQgdG8gZXhpc3QnKTtcbiAgfVxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwubG9hZEdhbWVTZXR1cFByZXNldChwcmVzZXQpLCB0cnVlKTtcbiAgYXNzZXJ0Lm5vdEVxdWFsKGJvYXJkVmlld01vZGVsLmRlYnVnU2Vzc2lvbklkLCBiYXNlbGluZVNlc3Npb25JZCk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuICBhc3NlcnQubWF0Y2goYm9hcmRWaWV3TW9kZWwuc3RhdHVzTWVzc2FnZSwgL2l0YWxpYW4vaSk7XG59KTtcblxudGVzdCgnZ2FtZSBhbmFseXRpY3Mgc3VtbWFyeSBhZ2dyZWdhdGVzIHF1YWxpdHksIHRpbWluZywgY29tcGxleGl0eSwgYW5kIGhpZ2hsaWdodHMnLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2dhbWVBbmFseXRpY3MnKTtcblxuICBjb25zdCBzdW1tYXJ5ID0gYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSh7XG4gICAgc2Vzc2lvbklkOiAnc2Vzc2lvbl90ZXN0JyxcbiAgICBjcmVhdGVkQXRNczogMTAwMCxcbiAgICBmaW5pc2hlZEF0TXM6IDkwMDAsXG4gICAgZ2FtZVN0YXR1czogJ0NoZWNrbWF0ZSEgV2hpdGUgd2lucycsXG4gICAgcGVyc29uYUlkOiAnYWdncmVzc2l2ZScsXG4gICAgcGVyc29uYUxhYmVsOiAnQWdncmVzc2l2ZScsXG4gICAgc2V0dXBOYW1lOiAnSXRhbGlhbiBHYW1lJyxcbiAgICBzZXR1cENhdGVnb3J5OiAnb3BlbmluZ3MnLFxuICAgIGF1dG9wbGF5RHVyYXRpb25NczogMjYwMCxcbiAgICBwZ246ICcxLiBlNCBlNSAqJyxcbiAgICBtb3ZlQW5ub3RhdGlvbnM6IFtcbiAgICAgIHtcbiAgICAgICAgYmVmb3JlRmVuOiAnYScsXG4gICAgICAgIGFmdGVyRmVuOiAnYicsXG4gICAgICAgIHVjaTogJ2UyZTQnLFxuICAgICAgICBtb3ZlTnVtYmVyOiAxLFxuICAgICAgICBjb25zdW1lZEJyaWxsaWFudDogZmFsc2UsXG4gICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgc2FuOiAnZTQnLFxuICAgICAgICBidWNrZXQ6ICdnb29kJyxcbiAgICAgICAgZXZhbExvc3M6IDQyLFxuICAgICAgICBldmFsdWF0aW9uOiAxOCxcbiAgICAgICAgY29tcGxleGl0eUxldmVsOiAnbWVkaXVtJyxcbiAgICAgICAgY29tcGxleGl0eVNjb3JlOiAwLjUsXG4gICAgICAgIHRpbWVzdGFtcDogMjAwMCxcbiAgICAgICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IDcwMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZm9yZUZlbjogJ2InLFxuICAgICAgICBhZnRlckZlbjogJ2MnLFxuICAgICAgICB1Y2k6ICdlN2U1JyxcbiAgICAgICAgbW92ZU51bWJlcjogMSxcbiAgICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUsXG4gICAgICAgIGFjdG9yOiAnZW5naW5lJyxcbiAgICAgICAgc2FuOiAnZTUrJyxcbiAgICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICBldmFsdWF0aW9uOiAzMixcbiAgICAgICAgY29tcGxleGl0eUxldmVsOiAnaGlnaCcsXG4gICAgICAgIGNvbXBsZXhpdHlTY29yZTogMC44LFxuICAgICAgICB0aW1lc3RhbXA6IDI4MDAsXG4gICAgICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiA4MDAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBiZWZvcmVGZW46ICdjJyxcbiAgICAgICAgYWZ0ZXJGZW46ICdkJyxcbiAgICAgICAgdWNpOiAnZzFmMycsXG4gICAgICAgIG1vdmVOdW1iZXI6IDIsXG4gICAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgYWN0b3I6ICdwbGF5ZXInLFxuICAgICAgICBzYW46ICdOZjMnLFxuICAgICAgICBidWNrZXQ6ICdtaXN0YWtlJyxcbiAgICAgICAgZXZhbExvc3M6IDMxMCxcbiAgICAgICAgZXZhbHVhdGlvbjogLTkwLFxuICAgICAgICBjb21wbGV4aXR5TGV2ZWw6ICdsb3cnLFxuICAgICAgICBjb21wbGV4aXR5U2NvcmU6IDAuMixcbiAgICAgICAgdGltZXN0YW1wOiA0MzAwLFxuICAgICAgICBkZWxheU1zU2luY2VQcmV2aW91czogMTUwMCxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSk7XG5cbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucmVzdWx0LCAnV2hpdGUgd29uJyk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmJyaWxsaWFudE1vdmVzLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkubW92ZUNvdW50LCAzKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucXVhbGl0eUNvdW50cy5iZXN0LCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucXVhbGl0eUNvdW50cy5nb29kLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucXVhbGl0eUNvdW50cy5taXN0YWtlLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuYXZlcmFnZUV2YWxMb3NzLCAxMTcuMyk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmF2ZXJhZ2VNb3ZlRGVsYXlNcywgMTAwMCk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmNvbXBsZXhpdHlEaXN0cmlidXRpb24ubG93LCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuY29tcGxleGl0eURpc3RyaWJ1dGlvbi5tZWRpdW0sIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5jb21wbGV4aXR5RGlzdHJpYnV0aW9uLmhpZ2gsIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5oaWdobGlnaHRlZEJyaWxsaWFudE1vdmVzLmxlbmd0aCwgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5Lm1ham9yTWlzdGFrZXMubGVuZ3RoLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuZXZhbFRyZW5kLmxlbmd0aCwgMyk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmNvbXBsZXhpdHlUcmVuZC5sZW5ndGgsIDMpO1xufSk7XG5cbnRlc3QoJ2dhbWUgYW5hbHl0aWNzIHZpZXdtb2RlbCBzdG9yZXMgY29tcGxldGVkIHNlc3Npb25zIGluIHJlY2VudCBnYW1lcycsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGNvbnN0IGFuYWx5dGljcyA9IG5ldyBHYW1lQW5hbHl0aWNzVmlld01vZGVsKHtcbiAgICBib2FyZFZpZXdNb2RlbDoge1xuICAgICAgZGVidWdTZXNzaW9uSWQ6ICdzZXNzaW9uX2NhcHR1cmUnLFxuICAgICAgbW92ZUFubm90YXRpb25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBiZWZvcmVGZW46ICdhJyxcbiAgICAgICAgICBhZnRlckZlbjogJ2InLFxuICAgICAgICAgIHVjaTogJ2UyZTQnLFxuICAgICAgICAgIG1vdmVOdW1iZXI6IDEsXG4gICAgICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IGZhbHNlLFxuICAgICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgICBzYW46ICdlNCcsXG4gICAgICAgICAgYnVja2V0OiAnZ29vZCcsXG4gICAgICAgICAgZXZhbExvc3M6IDQwLFxuICAgICAgICAgIGV2YWx1YXRpb246IDE1LFxuICAgICAgICAgIGNvbXBsZXhpdHlMZXZlbDogJ21lZGl1bScsXG4gICAgICAgICAgY29tcGxleGl0eVNjb3JlOiAwLjQ1LFxuICAgICAgICAgIHRpbWVzdGFtcDogMTAwMCxcbiAgICAgICAgICBkZWxheU1zU2luY2VQcmV2aW91czogNjAwLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHNlc3Npb25TdGFydGVkQXQ6IDAsXG4gICAgICBnYW1lU3RhdHVzOiAnRHJhdyEnLFxuICAgICAgcGduOiAnMS4gZTQgKicsXG4gICAgICBjdXJyZW50U2V0dXBOYW1lOiAnQ3VzdG9tIFBvc2l0aW9uJyxcbiAgICAgIGN1cnJlbnRTZXR1cENhdGVnb3J5OiAnY3VzdG9tJyxcbiAgICAgIGF1dG9QbGF5QWN0aXZlRHVyYXRpb25NczogOTAwLFxuICAgICAgaXNHYW1lT3ZlcjogdHJ1ZSxcbiAgICB9LFxuICAgIGNvbmZpZ1ZpZXdNb2RlbDoge1xuICAgICAgYWN0aXZlUGVyc29uYUlkOiAnbWVkaXVtJyxcbiAgICAgIGFjdGl2ZVBlcnNvbmFMYWJlbDogJ01lZGl1bScsXG4gICAgfSxcbiAgfSk7XG5cbiAgYW5hbHl0aWNzLmNhcHR1cmVDb21wbGV0ZWRHYW1lKCk7XG5cbiAgYXNzZXJ0LmVxdWFsKGFuYWx5dGljcy5yZWNlbnRHYW1lcy5sZW5ndGgsIDEpO1xuICBhc3NlcnQuZXF1YWwoYW5hbHl0aWNzLnJlY2VudEdhbWVzWzBdPy5zZXNzaW9uSWQsICdzZXNzaW9uX2NhcHR1cmUnKTtcbiAgYXNzZXJ0LmVxdWFsKGFuYWx5dGljcy5yZWNlbnRHYW1lRW50cmllc1swXT8ucGVyc29uYUxhYmVsLCAnTWVkaXVtJyk7XG59KTtcblxudGVzdCgnYXV0b3BsYXkgc2NoZWR1bGVzIGNvcnJlY3RseSBmb3IgYSBibGFjayBlbmdpbmUgYWZ0ZXIgYSB3aGl0ZSBwbGF5ZXIgbW92ZScsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwsIGVuZ2luZVZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGNvbnN0IG9yaWdpbmFsU29sdmVOZXh0TW92ZSA9IGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUuYmluZChib2FyZFZpZXdNb2RlbCk7XG4gIGxldCBzb2x2ZUNhbGxzID0gMDtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRBdXRvUGxheSh0cnVlKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0RW5naW5lUGxheXNGb3IoJ2InKTtcbiAgYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSA9IGFzeW5jICgpID0+IHtcbiAgICBzb2x2ZUNhbGxzICs9IDE7XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIGVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkID0gdHJ1ZTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwubWFrZU1vdmUoJ2UyJywgJ2U0JyksIHRydWUpO1xuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgOTAwKTtcbiAgfSk7XG5cbiAgYXNzZXJ0LmVxdWFsKHNvbHZlQ2FsbHMsIDEpO1xuXG4gIGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUgPSBvcmlnaW5hbFNvbHZlTmV4dE1vdmU7XG59KTtcblxudGVzdCgnYXV0b3BsYXkgc3RpbGwgcGxheXMgYmxhY2sgd2hlbiBwbGF5ZXItbW92ZSBiYWNrZ3JvdW5kIGFuYWx5c2lzIGlzIHBlbmRpbmcnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBlbmdpbmVWaWV3TW9kZWwsIHVpU3RhdGVWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBjb25zdCBvcmlnaW5hbEluaXRpYWxpemUgPSBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZS5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHl6ZVBvc2l0aW9uID0gZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbi5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG4gIGNvbnN0IG9yaWdpbmFsUGlja01vdmUgPSBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMuYmluZChlbmdpbmVWaWV3TW9kZWwpO1xuICBjb25zdCBvcmlnaW5hbEF1dG9QbGF5U3BlZWQgPSB1aVN0YXRlVmlld01vZGVsLmF1dG9QbGF5U3BlZWQ7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0QXV0b1BsYXkodHJ1ZSk7XG4gIGJvYXJkVmlld01vZGVsLnNldEVuZ2luZVBsYXlzRm9yKCdiJyk7XG4gIHVpU3RhdGVWaWV3TW9kZWwuc2V0QXV0b1BsYXlTcGVlZCgnZmFzdCcpO1xuXG4gIGVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUgPSBhc3luYyAoKSA9PiB1bmRlZmluZWQ7XG4gIGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoZmVuOiBzdHJpbmcsIF9kZXB0aD86IG51bWJlciwgX211bHRpUFY/OiBudW1iZXIsIHB1cnBvc2UgPSAnYmFja2dyb3VuZCcpID0+IHtcbiAgICBpZiAocHVycG9zZSA9PT0gJ2JhY2tncm91bmQnKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4gdW5kZWZpbmVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVxdWVzdElkOiAxLFxuICAgICAgYW5hbHl6ZWRGZW46IGZlbixcbiAgICAgIG1vdmVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBtb3ZlOiAnZTdlNScsXG4gICAgICAgICAgZXZhbHVhdGlvbjogMjAsXG4gICAgICAgICAgZXZhbExvc3M6IDAsXG4gICAgICAgICAgcHY6IFsnZTdlNSddLFxuICAgICAgICAgIG11bHRpcHY6IDEsXG4gICAgICAgICAgZGVwdGg6IDgsXG4gICAgICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgY29tcGxleGl0eToge1xuICAgICAgICBsZXZlbDogJ2xvdycsXG4gICAgICAgIHNjb3JlOiAwLjIsXG4gICAgICAgIHNwcmVhZDogMTIsXG4gICAgICAgIGNsb3NlQ2FuZGlkYXRlczogMSxcbiAgICAgICAgdm9sYXRpbGl0eTogOCxcbiAgICAgIH0sXG4gICAgICBpZ25vcmVkOiBmYWxzZSxcbiAgICAgIGZyb21DYWNoZTogZmFsc2UsXG4gICAgICBwdXJwb3NlOiAnZW5naW5lTW92ZScsXG4gICAgfTtcbiAgfTtcbiAgZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzID0gKCkgPT4gKHtcbiAgICBtb3ZlOiB7XG4gICAgICBtb3ZlOiAnZTdlNScsXG4gICAgICBldmFsdWF0aW9uOiAyMCxcbiAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgcHY6IFsnZTdlNSddLFxuICAgICAgbXVsdGlwdjogMSxcbiAgICAgIGRlcHRoOiA4LFxuICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgfSxcbiAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gIH0pO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5tYWtlTW92ZSgnZTInLCAnZTQnKSwgdHJ1ZSk7XG5cbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzZXRUaW1lb3V0KHJlc29sdmUsIDUwMCk7XG4gIH0pO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5oaXN0b3J5Lmxlbmd0aCwgMik7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5oaXN0b3J5WzFdPy5zYW4sICdlNScpO1xuXG4gIGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplID0gb3JpZ2luYWxJbml0aWFsaXplO1xuICBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxBbmFseXplUG9zaXRpb247XG4gIGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcyA9IG9yaWdpbmFsUGlja01vdmU7XG4gIHVpU3RhdGVWaWV3TW9kZWwuc2V0QXV0b1BsYXlTcGVlZChvcmlnaW5hbEF1dG9QbGF5U3BlZWQpO1xufSk7XG5cbnRlc3QoJ3N0YXJ0QXV0b1BsYXlUdXJuIGxldHMgdGhlIHdoaXRlIGVuZ2luZSBiZWdpbiB0aGUgZ2FtZSBtYW51YWxseScsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBjb25zdCBvcmlnaW5hbFNvbHZlTmV4dE1vdmUgPSBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlLmJpbmQoYm9hcmRWaWV3TW9kZWwpO1xuICBsZXQgYXV0b1RyaWdnZXJlZEFyZ3VtZW50OiBib29sZWFuIHwgbnVsbCA9IG51bGw7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0QXV0b1BsYXkodHJ1ZSk7XG4gIGJvYXJkVmlld01vZGVsLnNldEVuZ2luZVBsYXlzRm9yKCd3Jyk7XG4gIGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUgPSBhc3luYyAoYXV0b1RyaWdnZXJlZCA9IGZhbHNlKSA9PiB7XG4gICAgYXV0b1RyaWdnZXJlZEFyZ3VtZW50ID0gYXV0b1RyaWdnZXJlZDtcbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuY2FuU3RhcnRBdXRvUGxheVR1cm4sIHRydWUpO1xuICBhd2FpdCBib2FyZFZpZXdNb2RlbC5zdGFydEF1dG9QbGF5VHVybigpO1xuICBhc3NlcnQuZXF1YWwoYXV0b1RyaWdnZXJlZEFyZ3VtZW50LCB0cnVlKTtcblxuICBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlID0gb3JpZ2luYWxTb2x2ZU5leHRNb3ZlO1xufSk7XG5cbnRlc3QoJ3N0YXJ0QXV0b1BsYXlUdXJuIGlzIGF2YWlsYWJsZSBmb3IgYSBibGFjayBlbmdpbmUgYWZ0ZXIgdGhlIHBsYXllciBtb3ZlJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGNvbnN0IG9yaWdpbmFsU29sdmVOZXh0TW92ZSA9IGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUuYmluZChib2FyZFZpZXdNb2RlbCk7XG4gIGxldCBhdXRvVHJpZ2dlcmVkQXJndW1lbnQ6IGJvb2xlYW4gfCBudWxsID0gbnVsbDtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRBdXRvUGxheSh0cnVlKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0RW5naW5lUGxheXNGb3IoJ2InKTtcbiAgYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSA9IGFzeW5jIChhdXRvVHJpZ2dlcmVkID0gZmFsc2UpID0+IHtcbiAgICBhdXRvVHJpZ2dlcmVkQXJndW1lbnQgPSBhdXRvVHJpZ2dlcmVkO1xuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5tYWtlTW92ZSgnZTInLCAnZTQnKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5jYW5TdGFydEF1dG9QbGF5VHVybiwgdHJ1ZSk7XG5cbiAgYXdhaXQgYm9hcmRWaWV3TW9kZWwuc3RhcnRBdXRvUGxheVR1cm4oKTtcbiAgYXNzZXJ0LmVxdWFsKGF1dG9UcmlnZ2VyZWRBcmd1bWVudCwgdHJ1ZSk7XG5cbiAgYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSA9IG9yaWdpbmFsU29sdmVOZXh0TW92ZTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBUU8sU0FBUyx1QkFDZCxXQUNBLGlCQUNTO0FBQ1QsU0FBTyxjQUFjO0FBQ3ZCO0FBRU8sU0FBUyxxQkFDZCxZQUNBLGFBQ1M7QUFDVCxTQUFPLGVBQWU7QUFDeEI7QUFwQkE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBU08sU0FBUyxzQkFDZCxLQUNBLE9BQ0EsU0FDUTtBQUNSLFNBQU8sR0FBRyxHQUFHLFVBQVUsS0FBSyxZQUFZLE9BQU87QUFDakQ7QUFmQSxJQWlCYSxlQXFEQTtBQXRFYjtBQUFBO0FBQUE7QUFpQk8sSUFBTSxnQkFBTixNQUFvQjtBQUFBLE1BR3pCLFlBQW9CLFVBQWtCLEtBQUs7QUFBdkI7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QUFFeEMsRUFBQUEsZ0JBQWUsZ0JBQWdCO0FBQ2pDLENBQUM7IiwKICAibmFtZXMiOiBbIkNoZXNzIiwgIlBJRUNFX1ZBTFVFUyIsICJCVUNLRVRfT1JERVIiLCAiQ2hlc3MiLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgInJlYWN0aW9uIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJyZWFjdGlvbiIsICJydW5JbkFjdGlvbiIsICJDaGVzcyIsICJsb2dnZXIiLCAicGduIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAicmVhY3Rpb24iLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJhY3Rpb24iLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiY2FuQXBwbHlBbmFseXplZE1vdmUiLCAiaXNTdGFsZUFuYWx5c2lzUmVxdWVzdCIsICJBbmFseXNpc0NhY2hlIiwgImJ1aWxkQW5hbHlzaXNDYWNoZUtleSIsICJidWlsZERldGVybWluaXN0aWNTZWVkIiwgImNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZSIsICJyZXNvbHZlUGduU3RhcnRGZW4iLCAiZGVyaXZlQnJpbGxpYW50VXNhZ2UiLCAiYm9hcmRWaWV3TW9kZWwiLCAiZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwiLCAiUFJFREVGSU5FRF9PUEVOSU5HUyIsICJlbmdpbmVWaWV3TW9kZWwiLCAiY29uZmlnVmlld01vZGVsIiwgIkVuZ2luZVZpZXdNb2RlbCIsICJtb3ZlU3RvY2tmaXNoU2VydmljZSIsICJhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UiLCAiQm9hcmRWaWV3TW9kZWwiLCAiYW5hbHlzaXNDYWNoZSIsICJQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwiLCAiREVGQVVMVF9CVUNLRVRfQ09ORklHIiwgIkRFRkFVTFRfRkVBVFVSRV9PUFRJT05TIiwgIkdBTUVfU0VUVVBfUFJFU0VUUyIsICJmaWx0ZXJHYW1lU2V0dXBQcmVzZXRzIiwgInRvQ29tcGF0aWJsZU9wZW5pbmdQcmVzZXQiLCAiZ2V0R2FtZVNldHVwUHJlc2V0QnlJZCIsICJidWlsZEdhbWVBbmFseXRpY3NTdW1tYXJ5IiwgIkdhbWVBbmFseXRpY3NWaWV3TW9kZWwiLCAidWlTdGF0ZVZpZXdNb2RlbCJdCn0K
