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
      restart() {
        this.destroy();
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
          restart: action2,
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
      restart() {
        logger.debug("restart called");
        this.coordinator.restart();
        this.isInitialized = false;
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
          engineViewModel.restart();
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
          const gameStartFen = resolvePgnStartFen(
            newChess.header(),
            new Chess4().fen()
          );
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
          engineViewModel.restart();
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
        logger2.debug("makeMove called", {
          from,
          to,
          promotion,
          currentFen: this.fen,
          currentTurn: this.chess.turn()
        });
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
              logger2.debug(
                "Scheduling auto-play for engine side:",
                this.enginePlaysFor
              );
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
            this.recordMoveAnnotation(
              move,
              options.consumedBrilliant ?? false,
              "engine"
            );
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
          const result = engineViewModel.pickMoveFromAnalysis(
            analysis,
            configViewModel.bucketConfig,
            {
              fen: this.fen,
              gameStartFen: this.gameStartFen,
              moveCount: this.moveCount,
              sideToMove: this.turn,
              persona
            }
          );
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
        engineViewModel.restart();
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
        logger2.debug(
          "updateState - FEN:",
          this.fen,
          "History length:",
          this.history.length
        );
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
        logger2.debug(
          "Board flipped, orientation:",
          this.boardFlipped ? "black" : "white",
          "Engine now plays for:",
          this.enginePlaysFor === "w" ? "White" : "Black"
        );
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
            localStorage.setItem(
              this.BOARD_STATE_STORAGE_KEY,
              JSON.stringify(boardState)
            );
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
            legalMoves.map(
              (move) => `${move.from}${move.to}${move.promotion || ""}`
            ),
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
        const allowedBuckets = [
          "excellent",
          "good",
          "mistake",
          "blunder"
        ];
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
          logger2.debug(
            `Added ${bucketArrows.length} ${bucket} arrows (found ${movesByBucket[bucket].length} total)`
          );
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
       * Reads `fen` so MobX recomputes when the board updates (chess.js mutates in place).
       */
      get turn() {
        void this.fen;
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
            this.lastMove = {
              from: lastMoveInHistory.from,
              to: lastMoveInHistory.to
            };
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
        this.historyAnnotations.push(
          this.createMoveAnnotation(move, consumedBrilliant, actor)
        );
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
        logger2.debug("scheduleAutoPlayMove called", { delayMs });
        this.clearAutoPlaySchedule();
        if (!this.canScheduleAutoPlay) {
          logger2.debug("scheduleAutoPlayMove not scheduling, not in a valid state");
          logger2.debug("canScheduleAutoPlay:", this.canScheduleAutoPlay);
          logger2.debug("autoPlayEnabled:", this.autoPlayEnabled);
          logger2.debug("autoPlayPaused:", this.autoPlayPaused);
          logger2.debug("isThinking:", this.isThinking);
          logger2.debug("isGameOver:", this.isGameOver);
          logger2.debug("turn:", this.turn);
          logger2.debug("enginePlaysFor:", this.enginePlaysFor);
          return;
        }
        logger2.debug("scheduleAutoPlayMove scheduling, in a valid state");
        this.autoPlayScheduledFor = Date.now() + delayMs;
        this._autoPlayTimeout = setTimeout(() => {
          runInAction2(() => {
            logger2.debug("scheduleAutoPlayMove timeout action");
            this.autoPlayScheduledFor = 0;
          });
          this.solveNextMove(true).catch((err) => {
            logger2.debug("scheduleAutoPlayMove timeout error", err);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2VuZ2luZS9hbmFseXNpc1NhZmV0eS50cyIsICIuLi8uLi9zcmMvZW5naW5lL2FuYWx5c2lzQ2FjaGUudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9yYW5kb20udHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lU2Vzc2lvbi50cyIsICIuLi8uLi9zcmMvZW5naW5lL2JyaWxsaWFudFRyYWNraW5nLnRzIiwgIi4uLy4uL3NyYy9zaGFyZWQvZGVidWcudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZS50cyIsICIuLi8uLi9zcmMvZW5naW5lL2VuZ2luZUNvb3JkaW5hdG9yLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvdHlwZXMudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9tb3ZlQ2xhc3NpZmllci50cyIsICIuLi8uLi9zcmMvZW5naW5lL21vdmVQaWNrZXIudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9mZWF0dXJlT3B0aW9ucy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvZW5naW5lL2JyaWxsaWFudE1vdmUudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lUGhhc2UudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9wb3NpdGlvbkNvbXBsZXhpdHkudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9wZXJzb25hQmlhcy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9FbmdpbmVWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvQ29uZmlnVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL1VpU3RhdGVWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvQm9hcmRWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lQW5hbHl0aWNzLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL0dhbWVBbmFseXRpY3NWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9vcGVuaW5ncy50cyIsICIuLi8uLi9zcmMvZW5naW5lL2dhbWVTZXR1cFByZXNldHMudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvR2FtZVNldHVwVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL0RlYnVnVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvcGVyc29uYVByb2ZpbGVzLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL1BlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9pbmRleC50cyIsICIuLi9wZXJzb25hY2hlc3MudGVzdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGludGVyZmFjZSBBbmFseXNpc1NuYXBzaG90PFRNb3Zlcz4ge1xuICByZXF1ZXN0SWQ6IG51bWJlcjtcbiAgYW5hbHl6ZWRGZW46IHN0cmluZztcbiAgbW92ZXM6IFRNb3Zlcztcbn1cblxuZXhwb3J0IHR5cGUgQW5hbHlzaXNQdXJwb3NlID0gJ2VuZ2luZU1vdmUnIHwgJ2JhY2tncm91bmQnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNTdGFsZUFuYWx5c2lzUmVxdWVzdChcbiAgcmVxdWVzdElkOiBudW1iZXIsXG4gIGxhdGVzdFJlcXVlc3RJZDogbnVtYmVyLFxuKTogYm9vbGVhbiB7XG4gIHJldHVybiByZXF1ZXN0SWQgIT09IGxhdGVzdFJlcXVlc3RJZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbkFwcGx5QW5hbHl6ZWRNb3ZlKFxuICBjdXJyZW50RmVuOiBzdHJpbmcsXG4gIGFuYWx5emVkRmVuOiBzdHJpbmcsXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGN1cnJlbnRGZW4gPT09IGFuYWx5emVkRmVuO1xufVxuIiwgImltcG9ydCB7IEFuYWx5emVkTW92ZSwgQ2xhc3NpZmllZE1vdmUgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBBbmFseXNpc0NhY2hlRW50cnkge1xuICBrZXk6IHN0cmluZztcbiAgbW92ZXM6IEFuYWx5emVkTW92ZVtdO1xuICBjbGFzc2lmaWVkTW92ZXM/OiBDbGFzc2lmaWVkTW92ZVtdO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQW5hbHlzaXNDYWNoZUtleShcbiAgZmVuOiBzdHJpbmcsXG4gIGRlcHRoOiBudW1iZXIsXG4gIG11bHRpUFY6IG51bWJlcixcbik6IHN0cmluZyB7XG4gIHJldHVybiBgJHtmZW59fGRlcHRoOiR7ZGVwdGh9fG11bHRpcHY6JHttdWx0aVBWfWA7XG59XG5cbmV4cG9ydCBjbGFzcyBBbmFseXNpc0NhY2hlIHtcbiAgcHJpdmF0ZSBlbnRyaWVzID0gbmV3IE1hcDxzdHJpbmcsIEFuYWx5c2lzQ2FjaGVFbnRyeT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1heFNpemU6IG51bWJlciA9IDIwMCkge31cblxuICBjb25maWd1cmUobWF4U2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5tYXhTaXplID0gTWF0aC5tYXgoMSwgbWF4U2l6ZSk7XG4gICAgdGhpcy50cmltKCk7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBBbmFseXNpc0NhY2hlRW50cnkgfCBudWxsIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllcy5nZXQoa2V5KTtcblxuICAgIGlmICghZW50cnkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuZW50cmllcy5kZWxldGUoa2V5KTtcbiAgICB0aGlzLmVudHJpZXMuc2V0KGtleSwgZW50cnkpO1xuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIHNldChlbnRyeTogQW5hbHlzaXNDYWNoZUVudHJ5KTogdm9pZCB7XG4gICAgdGhpcy5lbnRyaWVzLnNldChlbnRyeS5rZXksIGVudHJ5KTtcbiAgICB0aGlzLnRyaW0oKTtcbiAgfVxuXG4gIGludmFsaWRhdGUoa2V5Pzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKGtleSkge1xuICAgICAgdGhpcy5lbnRyaWVzLmRlbGV0ZShrZXkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZW50cmllcy5jbGVhcigpO1xuICB9XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzLnNpemU7XG4gIH1cblxuICBwcml2YXRlIHRyaW0oKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMuZW50cmllcy5zaXplID4gdGhpcy5tYXhTaXplKSB7XG4gICAgICBjb25zdCBvbGRlc3RLZXkgPSB0aGlzLmVudHJpZXMua2V5cygpLm5leHQoKS52YWx1ZTtcblxuICAgICAgaWYgKCFvbGRlc3RLZXkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW50cmllcy5kZWxldGUob2xkZXN0S2V5KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGFuYWx5c2lzQ2FjaGUgPSBuZXcgQW5hbHlzaXNDYWNoZSgpO1xuIiwgImltcG9ydCB7IFBlcnNvbmFJZCB9IGZyb20gJy4vZmVhdHVyZU9wdGlvbnMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJhbmRvbVNvdXJjZSB7XG4gIG5leHQoKTogbnVtYmVyO1xufVxuXG5mdW5jdGlvbiBoYXNoU3RyaW5nKGlucHV0OiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgaGFzaCA9IDIxNjYxMzYyNjE7XG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGlucHV0Lmxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGhhc2ggXj0gaW5wdXQuY2hhckNvZGVBdChpbmRleCk7XG4gICAgaGFzaCA9IE1hdGguaW11bChoYXNoLCAxNjc3NzYxOSk7XG4gIH1cblxuICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cblxuZnVuY3Rpb24gbXVsYmVycnkzMihzZWVkOiBudW1iZXIpOiAoKSA9PiBudW1iZXIge1xuICBsZXQgdmFsdWUgPSBzZWVkID4+PiAwO1xuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgdmFsdWUgKz0gMHg2ZDJiNzlmNTtcbiAgICBsZXQgcmVzdWx0ID0gTWF0aC5pbXVsKHZhbHVlIF4gKHZhbHVlID4+PiAxNSksIHZhbHVlIHwgMSk7XG4gICAgcmVzdWx0IF49IHJlc3VsdCArIE1hdGguaW11bChyZXN1bHQgXiAocmVzdWx0ID4+PiA3KSwgcmVzdWx0IHwgNjEpO1xuICAgIHJldHVybiAoKHJlc3VsdCBeIChyZXN1bHQgPj4+IDE0KSkgPj4+IDApIC8gNDI5NDk2NzI5NjtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxlZ2FjeVJhbmRvbVNvdXJjZSgpOiBSYW5kb21Tb3VyY2Uge1xuICByZXR1cm4ge1xuICAgIG5leHQ6ICgpID0+IE1hdGgucmFuZG9tKCksXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2Uoc2VlZDogc3RyaW5nKTogUmFuZG9tU291cmNlIHtcbiAgY29uc3QgZ2VuZXJhdG9yID0gbXVsYmVycnkzMihoYXNoU3RyaW5nKHNlZWQpKTtcblxuICByZXR1cm4ge1xuICAgIG5leHQ6ICgpID0+IGdlbmVyYXRvcigpLFxuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERldGVybWluaXN0aWNTZWVkQ29udGV4dCB7XG4gIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICBjdXJyZW50RmVuOiBzdHJpbmc7XG4gIG1vdmVDb3VudDogbnVtYmVyO1xuICBzaWRlVG9Nb3ZlOiAndycgfCAnYic7XG4gIHBlcnNvbmE6IFBlcnNvbmFJZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQoe1xuICBnYW1lU3RhcnRGZW4sXG4gIGN1cnJlbnRGZW4sXG4gIG1vdmVDb3VudCxcbiAgc2lkZVRvTW92ZSxcbiAgcGVyc29uYSxcbn06IERldGVybWluaXN0aWNTZWVkQ29udGV4dCk6IHN0cmluZyB7XG4gIHJldHVybiBbZ2FtZVN0YXJ0RmVuLCBjdXJyZW50RmVuLCBTdHJpbmcobW92ZUNvdW50KSwgc2lkZVRvTW92ZSwgcGVyc29uYV0uam9pbignfCcpO1xufVxuIiwgImltcG9ydCB7IE1vdmVBbm5vdGF0aW9uIH0gZnJvbSAnLi9icmlsbGlhbnRUcmFja2luZyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc2lzdGVkQm9hcmRTdGF0ZSB7XG4gIGN1cnJlbnRGZW46IHN0cmluZztcbiAgZmVuSGlzdG9yeTogc3RyaW5nW107XG4gIGdhbWVTZXNzaW9uSWQ6IHN0cmluZztcbiAgZ2FtZVN0YXJ0RmVuOiBzdHJpbmc7XG4gIGN1cnJlbnRTZXR1cE5hbWU/OiBzdHJpbmc7XG4gIGN1cnJlbnRTZXR1cENhdGVnb3J5Pzogc3RyaW5nO1xuICBoaXN0b3J5QW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW107XG4gIHJlZG9Bbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdhbWVTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBzZXNzaW9uXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTApfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUGduU3RhcnRGZW4oXG4gIGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bGw+LFxuICBmYWxsYmFja0Zlbjogc3RyaW5nLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGhlYWRlcnMuU2V0VXAgPT09ICcxJyAmJiB0eXBlb2YgaGVhZGVycy5GRU4gPT09ICdzdHJpbmcnXG4gICAgPyBoZWFkZXJzLkZFTlxuICAgIDogZmFsbGJhY2tGZW47XG59XG4iLCAiZXhwb3J0IGludGVyZmFjZSBNb3ZlQW5ub3RhdGlvbiB7XG4gIGJlZm9yZUZlbjogc3RyaW5nO1xuICBhZnRlckZlbjogc3RyaW5nO1xuICB1Y2k6IHN0cmluZztcbiAgbW92ZU51bWJlcjogbnVtYmVyO1xuICBjb25zdW1lZEJyaWxsaWFudDogYm9vbGVhbjtcbiAgYWN0b3I/OiAncGxheWVyJyB8ICdlbmdpbmUnIHwgJ3JlZG8nO1xuICBzYW4/OiBzdHJpbmc7XG4gIGJ1Y2tldD86IHN0cmluZyB8IG51bGw7XG4gIGV2YWxMb3NzPzogbnVtYmVyIHwgbnVsbDtcbiAgZXZhbHVhdGlvbj86IG51bWJlciB8IG51bGw7XG4gIGNvbXBsZXhpdHlMZXZlbD86ICdsb3cnIHwgJ21lZGl1bScgfCAnaGlnaCcgfCBudWxsO1xuICBjb21wbGV4aXR5U2NvcmU/OiBudW1iZXIgfCBudWxsO1xuICB0aW1lc3RhbXA/OiBudW1iZXI7XG4gIGRlbGF5TXNTaW5jZVByZXZpb3VzPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWxsaWFudFVzYWdlIHtcbiAgYnJpbGxpYW50VXNlZENvdW50OiBudW1iZXI7XG4gIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBudW1iZXJbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlcml2ZUJyaWxsaWFudFVzYWdlKFxuICBhbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSxcbik6IEJyaWxsaWFudFVzYWdlIHtcbiAgY29uc3QgYnJpbGxpYW50TW92ZU51bWJlcnMgPSBhbm5vdGF0aW9uc1xuICAgIC5maWx0ZXIoKGFubm90YXRpb24pID0+IGFubm90YXRpb24uY29uc3VtZWRCcmlsbGlhbnQpXG4gICAgLm1hcCgoYW5ub3RhdGlvbikgPT4gYW5ub3RhdGlvbi5tb3ZlTnVtYmVyKTtcblxuICByZXR1cm4ge1xuICAgIGJyaWxsaWFudFVzZWRDb3VudDogYnJpbGxpYW50TW92ZU51bWJlcnMubGVuZ3RoLFxuICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzLFxuICB9O1xufVxuIiwgImNvbnN0IERFQlVHX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19kZWJ1Z19sb2dnaW5nJztcblxuZnVuY3Rpb24gcmVhZEJyb3dzZXJEZWJ1Z0ZsYWcoKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2luZG93LmxvY2FsU3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oREVCVUdfU1RPUkFHRV9LRVkpID09PSAnMSc7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkUHJvY2Vzc0RlYnVnRmxhZygpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBwcm9jZXNzLmVudi5QRVJTT05BQ0hFU1NfREVCVUcgPT09ICcxJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGVidWdMb2dnaW5nRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHJlYWRCcm93c2VyRGVidWdGbGFnKCkgfHwgcmVhZFByb2Nlc3NEZWJ1Z0ZsYWcoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdpbmRvdy5sb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKERFQlVHX1NUT1JBR0VfS0VZLCAnMScpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oREVCVUdfU1RPUkFHRV9LRVkpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLy8gSWdub3JlIGxvY2FsU3RvcmFnZSBmYWlsdXJlcyBhbmQga2VlcCB0aGUgYXBwIHJ1bm5pbmcuXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlYnVnTG9nZ2VyKHNjb3BlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHtcbiAgICBkZWJ1ZzogKC4uLmFyZ3M6IHVua25vd25bXSkgPT4ge1xuICAgICAgaWYgKGlzRGVidWdMb2dnaW5nRW5hYmxlZCgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbJHtzY29wZX1dYCwgLi4uYXJncyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlcnJvcjogKC4uLmFyZ3M6IHVua25vd25bXSkgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcihgWyR7c2NvcGV9XWAsIC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgd2FybjogKC4uLmFyZ3M6IHVua25vd25bXSkgPT4ge1xuICAgICAgY29uc29sZS53YXJuKGBbJHtzY29wZX1dYCwgLi4uYXJncyk7XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGV2ZWxvcG1lbnRCdWlsZCgpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBNQUlOX1dJTkRPV19WSVRFX0RFVl9TRVJWRVJfVVJMICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBCb29sZWFuKE1BSU5fV0lORE9XX1ZJVEVfREVWX1NFUlZFUl9VUkwpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gQm9vbGVhbihpbXBvcnQubWV0YS5lbnY/LkRFVik7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4iLCAiLyoqXG4gKiBTdG9ja2Zpc2ggVUNJIEVuZ2luZSBTZXJ2aWNlXG4gKiBNb2RlbCBsYXllciAtIFB1cmUgVHlwZVNjcmlwdCwgbm8gUmVhY3QsIG5vIE1vYlhcbiAqIFxuICogSGFuZGxlcyBjb21tdW5pY2F0aW9uIHdpdGggU3RvY2tmaXNoIFdBU00gZW5naW5lIHZpYSBXZWIgV29ya2VyXG4gKi9cblxuaW1wb3J0IHsgQW5hbHl6ZWRNb3ZlLCBTdG9ja2Zpc2hJbmZvIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBjcmVhdGVEZWJ1Z0xvZ2dlciB9IGZyb20gJy4uL3NoYXJlZC9kZWJ1Zyc7XG5cbnR5cGUgTWVzc2FnZUhhbmRsZXIgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkO1xuXG5leHBvcnQgY2xhc3MgU3RvY2tmaXNoU2VydmljZSB7XG4gIHByaXZhdGUgd29ya2VyOiBXb3JrZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBtZXNzYWdlSGFuZGxlcnM6IFNldDxNZXNzYWdlSGFuZGxlcj4gPSBuZXcgU2V0KCk7XG4gIHByaXZhdGUgaXNSZWFkeSA9IGZhbHNlO1xuICBwcml2YXRlIHJlYWR5UmVzb2x2ZXJzOiBBcnJheTwoKSA9PiB2b2lkPiA9IFtdO1xuICBwcml2YXRlIG11bHRpUFYgPSAxMjtcbiAgcHJpdmF0ZSBkZXB0aCA9IDIwO1xuICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHNlcnZpY2VOYW1lID0gJ1N0b2NrZmlzaFNlcnZpY2UnKSB7XG4gICAgdGhpcy5sb2dnZXIgPSBjcmVhdGVEZWJ1Z0xvZ2dlcihzZXJ2aWNlTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBTdG9ja2Zpc2ggV0FTTSBlbmdpbmVcbiAgICovXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMud29ya2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIENyZWF0ZSB3b3JrZXIgdXNpbmcgc3RvY2tmaXNoLmpzXG4gICAgICAgIC8vIEluIFZpdGUsIHdlIG5lZWQgdG8gdXNlID93b3JrZXIgc3VmZml4IG9yIGNyZWF0ZSBpbmxpbmUgd29ya2VyXG4gICAgICAgIGNvbnN0IHdvcmtlckNvZGUgPSBgXG4gICAgICAgICAgaW1wb3J0U2NyaXB0cygnJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9zdG9ja2Zpc2guanMnKTtcbiAgICAgICAgYDtcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt3b3JrZXJDb2RlXSwgeyB0eXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcgfSk7XG4gICAgICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcihVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcblxuICAgICAgICB0aGlzLndvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0eXBlb2YgZXZlbnQuZGF0YSA9PT0gJ3N0cmluZycgPyBldmVudC5kYXRhIDogU3RyaW5nKGV2ZW50LmRhdGEpO1xuICAgICAgICAgIHRoaXMuaGFuZGxlTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLndvcmtlci5vbmVycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ1dvcmtlciBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXYWl0IGZvciBVQ0kgaW5pdGlhbGl6YXRpb25cbiAgICAgICAgY29uc3QgcmVhZHlIYW5kbGVyID0gKG1zZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKG1zZyA9PT0gJ3VjaW9rJykge1xuICAgICAgICAgICAgdGhpcy5pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcbiAgICAgICAgICAgIHRoaXMucmVhZHlSZXNvbHZlcnMuZm9yRWFjaChyID0+IHIoKSk7XG4gICAgICAgICAgICB0aGlzLnJlYWR5UmVzb2x2ZXJzID0gW107XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWRkTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSB3b3JrZXIgaXMgcmVhZHlcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZCgndWNpJyk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIGVuZ2luZSBpbnN0YW5jZVxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53b3JrZXIpIHtcbiAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgdGhpcy53b3JrZXIgPSBudWxsO1xuICAgICAgdGhpcy5pc1JlYWR5ID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBVQ0kgY29tbWFuZCB0byBlbmdpbmVcbiAgICovXG4gIHByaXZhdGUgc2VuZENvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLndvcmtlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdG9ja2Zpc2ggbm90IGluaXRpYWxpemVkJyk7XG4gICAgfVxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKGNvbW1hbmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBpbmNvbWluZyBtZXNzYWdlIGZyb20gZW5naW5lXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKG1lc3NhZ2UgJiYgKG1lc3NhZ2Uuc3RhcnRzV2l0aCgnYmVzdG1vdmUnKSB8fCBtZXNzYWdlID09PSAncmVhZHlvaycgfHwgbWVzc2FnZSA9PT0gJ3VjaW9rJykpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdNZXNzYWdlOicsIG1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlcihtZXNzYWdlKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbWVzc2FnZSBoYW5kbGVyXG4gICAqL1xuICBhZGRNZXNzYWdlSGFuZGxlcihoYW5kbGVyOiBNZXNzYWdlSGFuZGxlcik6IHZvaWQge1xuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzLmFkZChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBtZXNzYWdlIGhhbmRsZXJcbiAgICovXG4gIHJlbW92ZU1lc3NhZ2VIYW5kbGVyKGhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyKTogdm9pZCB7XG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlcnMuZGVsZXRlKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIGVuZ2luZSB0byBiZSByZWFkeVxuICAgKi9cbiAgYXN5bmMgd2FpdEZvclJlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHJldHVybjtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnJlYWR5UmVzb2x2ZXJzLnB1c2gocmVzb2x2ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IE11bHRpUFYgb3B0aW9uXG4gICAqL1xuICBzZXRNdWx0aVBWKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLm11bHRpUFYgPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICB0aGlzLnNlbmRDb21tYW5kKGBzZXRvcHRpb24gbmFtZSBNdWx0aVBWIHZhbHVlICR7dmFsdWV9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBzZWFyY2ggZGVwdGhcbiAgICovXG4gIHNldERlcHRoKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmRlcHRoID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlIGVuZ2luZSBvcHRpb25zXG4gICAqL1xuICBjb25maWd1cmUob3B0aW9uczogeyBtdWx0aVBWPzogbnVtYmVyOyBkZXB0aD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgaWYgKG9wdGlvbnMubXVsdGlQViAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNldE11bHRpUFYob3B0aW9ucy5tdWx0aVBWKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGVwdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXREZXB0aChvcHRpb25zLmRlcHRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSBhIHBvc2l0aW9uIGFuZCByZXR1cm4gYWxsIGNhbmRpZGF0ZSBtb3Zlc1xuICAgKi9cbiAgYXN5bmMgYW5hbHl6ZVBvc2l0aW9uKGZlbjogc3RyaW5nKTogUHJvbWlzZTxBbmFseXplZE1vdmVbXT4ge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvclJlYWR5KCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IG1vdmVzOiBNYXA8bnVtYmVyLCBTdG9ja2Zpc2hJbmZvPiA9IG5ldyBNYXAoKTtcbiAgICAgIGxldCBiZXN0U2NvcmUgPSAwO1xuICAgICAgbGV0IGhhc1JlY2VpdmVkQmVzdE1vdmUgPSBmYWxzZTtcbiAgICAgIGxldCBtYXhEZXB0aFJlYWNoZWQgPSAwO1xuXG4gICAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29tcGxldGUgYW5hbHlzaXMgd2l0aCBjb2xsZWN0ZWQgbW92ZXNcbiAgICAgIGNvbnN0IGNvbXBsZXRlQW5hbHlzaXMgPSAoKSA9PiB7XG4gICAgICAgIGlmIChoYXNSZWNlaXZlZEJlc3RNb3ZlKSByZXR1cm47XG4gICAgICAgIGhhc1JlY2VpdmVkQmVzdE1vdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG5cbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0NvbXBsZXRpbmcgYW5hbHlzaXMsIGNvbGxlY3RlZCcsIG1vdmVzLnNpemUsICdtb3ZlcycpO1xuXG4gICAgICAgIC8vIENvbnZlcnQgdG8gQW5hbHl6ZWRNb3ZlIGFycmF5XG4gICAgICAgIGNvbnN0IGFuYWx5emVkTW92ZXM6IEFuYWx5emVkTW92ZVtdID0gW107XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0aGlzLm11bHRpUFY7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGluZm8gPSBtb3Zlcy5nZXQoaSk7XG4gICAgICAgICAgaWYgKGluZm8gJiYgaW5mby5wdi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBldmFsTG9zcyA9IE1hdGguYWJzKGJlc3RTY29yZSAtIGluZm8uc2NvcmUpO1xuICAgICAgICAgICAgYW5hbHl6ZWRNb3Zlcy5wdXNoKHtcbiAgICAgICAgICAgICAgbW92ZTogaW5mby5wdlswXSxcbiAgICAgICAgICAgICAgZXZhbHVhdGlvbjogaW5mby5zY29yZSxcbiAgICAgICAgICAgICAgZXZhbExvc3MsXG4gICAgICAgICAgICAgIHB2OiBpbmZvLnB2LFxuICAgICAgICAgICAgICBtdWx0aXB2OiBpbmZvLm11bHRpcHYsXG4gICAgICAgICAgICAgIGRlcHRoOiBpbmZvLmRlcHRoLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFuYWx5emVkTW92ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdSZXR1cm5pbmcnLCBhbmFseXplZE1vdmVzLmxlbmd0aCwgJ2FuYWx5emVkIG1vdmVzJyk7XG4gICAgICAgICAgcmVzb2x2ZShhbmFseXplZE1vdmVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgZ2FtZSBvdmVyIHBvc2l0aW9uIChjaGVja21hdGUvc3RhbGVtYXRlKVxuICAgICAgICAgIC8vIElmIHdlIHJlY2VpdmVkIG1hdGUgc2NvcmVzIGJ1dCBubyBtb3ZlcywgaXQncyBnYW1lIG92ZXJcbiAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTm8gbW92ZXMgY29sbGVjdGVkIC0gbGlrZWx5IGdhbWUgb3ZlciBwb3NpdGlvbicpO1xuICAgICAgICAgIHJlc29sdmUoW10pOyAvLyBSZXR1cm4gZW1wdHkgYXJyYXkgaW5zdGVhZCBvZiByZWplY3RpbmcgZm9yIGdhbWUgb3ZlciBwb3NpdGlvbnNcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gQWRkIHRpbWVvdXQgdG8gZm9yY2Ugc3RvcCBhZnRlciByZWFzb25hYmxlIHRpbWVcbiAgICAgIGNvbnN0IGZvcmNlU3RvcFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKCFoYXNSZWNlaXZlZEJlc3RNb3ZlKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIud2FybignRm9yY2luZyBzdG9wIGFmdGVyIDEwIHNlY29uZHMgdG8gZ2V0IGJlc3Rtb3ZlJyk7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZCgnc3RvcCcpO1xuICAgICAgICAgIC8vIEdpdmUgaXQgYSBtb21lbnQgdG8gcmVzcG9uZCB3aXRoIGJlc3Rtb3ZlXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWhhc1JlY2VpdmVkQmVzdE1vdmUpIHtcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXIud2FybignTm8gYmVzdG1vdmUgYWZ0ZXIgc3RvcCwgdXNpbmcgY29sbGVjdGVkIG1vdmVzJyk7XG4gICAgICAgICAgICAgIGNvbXBsZXRlQW5hbHlzaXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTAwMDApOyAvLyAxMCBzZWNvbmQgdGltZW91dCB0byBmb3JjZSBzdG9wXG5cbiAgICAgIC8vIEFkZCBhYnNvbHV0ZSB0aW1lb3V0IHRvIHByZXZlbnQgaGFuZ2luZ1xuICAgICAgY29uc3QgYWJzb2x1dGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghaGFzUmVjZWl2ZWRCZXN0TW92ZSkge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdBbmFseXNpcyB0aW1lb3V0IGFmdGVyIDMwIHNlY29uZHMnKTtcbiAgICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGZvcmNlU3RvcFRpbWVvdXQpO1xuICAgICAgICAgIGNvbXBsZXRlQW5hbHlzaXMoKTsgLy8gVHJ5IHRvIHVzZSB3aGF0IHdlIGhhdmVcbiAgICAgICAgfVxuICAgICAgfSwgMzAwMDApOyAvLyAzMCBzZWNvbmQgYWJzb2x1dGUgdGltZW91dFxuXG4gICAgICBjb25zdCBhbmFseXNpc0hhbmRsZXIgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIENoZWNrIGZvciBtYXRlIHNjb3JlcyAoZ2FtZSBvdmVyIHBvc2l0aW9ucylcbiAgICAgICAgaWYgKG1lc3NhZ2UuaW5jbHVkZXMoJ3Njb3JlIG1hdGUnKSkge1xuICAgICAgICAgIC8vIEV4dHJhY3QgbWF0ZSBzY29yZSB0byBkZXRlY3QgY2hlY2ttYXRlL3N0YWxlbWF0ZVxuICAgICAgICAgIGNvbnN0IG1hdGVNYXRjaCA9IG1lc3NhZ2UubWF0Y2goL3Njb3JlIG1hdGUgKC0/XFxkKykvKTtcbiAgICAgICAgICBpZiAobWF0ZU1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRlSW4gPSBwYXJzZUludChtYXRlTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdEZXRlY3RlZCBtYXRlIHNjb3JlOicsIG1hdGVJbik7XG4gICAgICAgICAgICAvLyBJZiBtYXRlIGlzIDAgb3IgbmVnYXRpdmUsIGl0J3MgY2hlY2ttYXRlL3N0YWxlbWF0ZSAobm8gbW92ZXMgYXZhaWxhYmxlKVxuICAgICAgICAgICAgaWYgKG1hdGVJbiA8PSAwKSB7XG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdHYW1lIG92ZXIgcG9zaXRpb24gZGV0ZWN0ZWQgKGNoZWNrbWF0ZS9zdGFsZW1hdGUpJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBQYXJzZSBpbmZvIGxpbmVzXG4gICAgICAgIGlmIChtZXNzYWdlLnN0YXJ0c1dpdGgoJ2luZm8nKSAmJiBtZXNzYWdlLmluY2x1ZGVzKCdtdWx0aXB2JykpIHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gdGhpcy5wYXJzZUluZm9MaW5lKG1lc3NhZ2UpO1xuICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICBtb3Zlcy5zZXQoaW5mby5tdWx0aXB2LCBpbmZvKTtcbiAgICAgICAgICAgIGlmIChpbmZvLm11bHRpcHYgPT09IDEpIHtcbiAgICAgICAgICAgICAgYmVzdFNjb3JlID0gaW5mby5zY29yZTtcbiAgICAgICAgICAgICAgbWF4RGVwdGhSZWFjaGVkID0gTWF0aC5tYXgobWF4RGVwdGhSZWFjaGVkLCBpbmZvLmRlcHRoKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIElmIHdlJ3ZlIHJlYWNoZWQgdGhlIHRhcmdldCBkZXB0aCBhbmQgaGF2ZSBlbm91Z2ggbW92ZXMsIHdlIGNhbiBzdG9wIGVhcmx5XG4gICAgICAgICAgICAgIGlmIChpbmZvLmRlcHRoID49IHRoaXMuZGVwdGggJiYgbW92ZXMuc2l6ZSA+PSBNYXRoLm1pbigzLCB0aGlzLm11bHRpUFYpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1JlYWNoZWQgdGFyZ2V0IGRlcHRoLCBzdG9wcGluZyBlYXJseScpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZENvbW1hbmQoJ3N0b3AnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuYWx5c2lzIGNvbXBsZXRlXG4gICAgICAgIGlmIChtZXNzYWdlLnN0YXJ0c1dpdGgoJ2Jlc3Rtb3ZlJykpIHtcbiAgICAgICAgICBoYXNSZWNlaXZlZEJlc3RNb3ZlID0gdHJ1ZTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZm9yY2VTdG9wVGltZW91dCk7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGFic29sdXRlVGltZW91dCk7XG4gICAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihhbmFseXNpc0hhbmRsZXIpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgYmVzdG1vdmUgaXMgXCJub25lXCIgKG5vIGxlZ2FsIG1vdmVzIC0gY2hlY2ttYXRlL3N0YWxlbWF0ZSlcbiAgICAgICAgICBjb25zdCBiZXN0bW92ZU1hdGNoID0gbWVzc2FnZS5tYXRjaCgvYmVzdG1vdmVcXHMrKFxcUyspLyk7XG4gICAgICAgICAgaWYgKGJlc3Rtb3ZlTWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnN0IGJlc3Rtb3ZlID0gYmVzdG1vdmVNYXRjaFsxXTtcbiAgICAgICAgICAgIGlmIChiZXN0bW92ZSA9PT0gJyhub25lKScgfHwgYmVzdG1vdmUgPT09ICdub25lJyB8fCBiZXN0bW92ZSA9PT0gJzAwMDAnKSB7XG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdObyBsZWdhbCBtb3ZlcyAoY2hlY2ttYXRlL3N0YWxlbWF0ZSknKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShbXSk7IC8vIFJldHVybiBlbXB0eSBhcnJheSBmb3IgZ2FtZSBvdmVyIHBvc2l0aW9uc1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1JlY2VpdmVkIGJlc3Rtb3ZlLCBjb2xsZWN0ZWQnLCBtb3Zlcy5zaXplLCAnbW92ZXMnKTtcblxuICAgICAgICAgIC8vIENvbnZlcnQgdG8gQW5hbHl6ZWRNb3ZlIGFycmF5XG4gICAgICAgICAgY29uc3QgYW5hbHl6ZWRNb3ZlczogQW5hbHl6ZWRNb3ZlW10gPSBbXTtcbiAgICAgICAgICBcbiAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0aGlzLm11bHRpUFY7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IG1vdmVzLmdldChpKTtcbiAgICAgICAgICAgIGlmIChpbmZvICYmIGluZm8ucHYubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBjb25zdCBldmFsTG9zcyA9IE1hdGguYWJzKGJlc3RTY29yZSAtIGluZm8uc2NvcmUpO1xuICAgICAgICAgICAgICBhbmFseXplZE1vdmVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG1vdmU6IGluZm8ucHZbMF0sXG4gICAgICAgICAgICAgICAgZXZhbHVhdGlvbjogaW5mby5zY29yZSxcbiAgICAgICAgICAgICAgICBldmFsTG9zcyxcbiAgICAgICAgICAgICAgICBwdjogaW5mby5wdixcbiAgICAgICAgICAgICAgICBtdWx0aXB2OiBpbmZvLm11bHRpcHYsXG4gICAgICAgICAgICAgICAgZGVwdGg6IGluZm8uZGVwdGgsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHdlIGhhdmUgbm8gbW92ZXMgYnV0IGdvdCBhIGJlc3Rtb3ZlLCBpdCBtaWdodCBzdGlsbCBiZSBnYW1lIG92ZXJcbiAgICAgICAgICBpZiAoYW5hbHl6ZWRNb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdObyBtb3ZlcyBpbiBiZXN0bW92ZSByZXNwb25zZSAtIGdhbWUgb3ZlciBwb3NpdGlvbicpO1xuICAgICAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdSZXR1cm5pbmcnLCBhbmFseXplZE1vdmVzLmxlbmd0aCwgJ2FuYWx5emVkIG1vdmVzJyk7XG4gICAgICAgICAgICByZXNvbHZlKGFuYWx5emVkTW92ZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5hZGRNZXNzYWdlSGFuZGxlcihhbmFseXNpc0hhbmRsZXIpO1xuXG4gICAgICAvLyBXYWl0IGZvciByZWFkeW9rIGJlZm9yZSBzZW5kaW5nIHBvc2l0aW9uXG4gICAgICBjb25zdCByZWFkeUhhbmRsZXIgPSAobXNnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKG1zZyA9PT0gJ3JlYWR5b2snKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihyZWFkeUhhbmRsZXIpO1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbmdpbmUgcmVhZHksIHNlbmRpbmcgcG9zaXRpb24gYW5kIHN0YXJ0aW5nIGFuYWx5c2lzJyk7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZChgcG9zaXRpb24gZmVuICR7ZmVufWApO1xuICAgICAgICAgIHRoaXMuc2VuZENvbW1hbmQoYGdvIGRlcHRoICR7dGhpcy5kZXB0aH1gKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRoaXMuYWRkTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcblxuICAgICAgLy8gU2VuZCBwb3NpdGlvbiBhbmQgc3RhcnQgYW5hbHlzaXNcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTdGFydGluZyBhbmFseXNpcyBmb3IgRkVOOicsIGZlbiwgJ011bHRpUFY9JywgdGhpcy5tdWx0aVBWLCAnRGVwdGg9JywgdGhpcy5kZXB0aCk7XG4gICAgICBcbiAgICAgIHRoaXMuc2VuZENvbW1hbmQoYHNldG9wdGlvbiBuYW1lIE11bHRpUFYgdmFsdWUgJHt0aGlzLm11bHRpUFZ9YCk7XG4gICAgICB0aGlzLnNlbmRDb21tYW5kKCdpc3JlYWR5Jyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgVUNJIGluZm8gbGluZSBpbnRvIHN0cnVjdHVyZWQgZGF0YVxuICAgKi9cbiAgcHJpdmF0ZSBwYXJzZUluZm9MaW5lKGxpbmU6IHN0cmluZyk6IFN0b2NrZmlzaEluZm8gfCBudWxsIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFydHMgPSBsaW5lLnNwbGl0KCcgJyk7XG4gICAgICBcbiAgICAgIGNvbnN0IGdldFZhbHVlQWZ0ZXIgPSAoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgICAgICAgY29uc3QgaWR4ID0gcGFydHMuaW5kZXhPZihrZXkpO1xuICAgICAgICByZXR1cm4gaWR4ID49IDAgJiYgaWR4IDwgcGFydHMubGVuZ3RoIC0gMSA/IHBhcnRzW2lkeCArIDFdIDogbnVsbDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG11bHRpcHZTdHIgPSBnZXRWYWx1ZUFmdGVyKCdtdWx0aXB2Jyk7XG4gICAgICBjb25zdCBkZXB0aFN0ciA9IGdldFZhbHVlQWZ0ZXIoJ2RlcHRoJyk7XG4gICAgICBcbiAgICAgIGlmICghbXVsdGlwdlN0ciB8fCAhZGVwdGhTdHIpIHJldHVybiBudWxsO1xuXG4gICAgICBjb25zdCBtdWx0aXB2ID0gcGFyc2VJbnQobXVsdGlwdlN0ciwgMTApO1xuICAgICAgY29uc3QgZGVwdGggPSBwYXJzZUludChkZXB0aFN0ciwgMTApO1xuXG4gICAgICAvLyBHZXQgc2NvcmUgdmFsdWVcbiAgICAgIGxldCBzY29yZSA9IDA7XG4gICAgICBsZXQgbWF0ZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgY29uc3Qgc2NvcmVJZHggPSBwYXJ0cy5pbmRleE9mKCdzY29yZScpO1xuICAgICAgXG4gICAgICBpZiAoc2NvcmVJZHggPj0gMCAmJiBwYXJ0c1tzY29yZUlkeCArIDFdID09PSAnY3AnKSB7XG4gICAgICAgIHNjb3JlID0gcGFyc2VJbnQocGFydHNbc2NvcmVJZHggKyAyXSwgMTApO1xuICAgICAgfSBlbHNlIGlmIChzY29yZUlkeCA+PSAwICYmIHBhcnRzW3Njb3JlSWR4ICsgMV0gPT09ICdtYXRlJykge1xuICAgICAgICBtYXRlID0gcGFyc2VJbnQocGFydHNbc2NvcmVJZHggKyAyXSwgMTApO1xuICAgICAgICAvLyBDb252ZXJ0IG1hdGUgdG8gYSBsYXJnZSBjZW50aXBhd24gdmFsdWVcbiAgICAgICAgc2NvcmUgPSBtYXRlID4gMCA/IDEwMDAwIC0gbWF0ZSAqIDEwMCA6IC0xMDAwMCAtIG1hdGUgKiAxMDA7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCBQViAocHJpbmNpcGFsIHZhcmlhdGlvbilcbiAgICAgIGNvbnN0IHB2SWR4ID0gcGFydHMuaW5kZXhPZigncHYnKTtcbiAgICAgIGNvbnN0IHB2ID0gcHZJZHggPj0gMCA/IHBhcnRzLnNsaWNlKHB2SWR4ICsgMSkgOiBbXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbXVsdGlwdixcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIHNjb3JlLFxuICAgICAgICBtYXRlLFxuICAgICAgICBwdixcbiAgICAgIH07XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBjdXJyZW50IGFuYWx5c2lzXG4gICAqL1xuICBzdG9wKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgdGhpcy5zZW5kQ29tbWFuZCgnc3RvcCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIG5ldyBnYW1lXG4gICAqL1xuICBuZXdHYW1lKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgdGhpcy5zZW5kQ29tbWFuZCgndWNpbmV3Z2FtZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBlbmdpbmUgaXMgaW5pdGlhbGl6ZWRcbiAgICovXG4gIGdldCBpbml0aWFsaXplZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc1JlYWR5O1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IG1vdmVTdG9ja2Zpc2hTZXJ2aWNlID0gbmV3IFN0b2NrZmlzaFNlcnZpY2UoJ01vdmVTdG9ja2Zpc2hTZXJ2aWNlJyk7XG5leHBvcnQgY29uc3QgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlID0gbmV3IFN0b2NrZmlzaFNlcnZpY2UoJ0FuYWx5c2lzU3RvY2tmaXNoU2VydmljZScpO1xuZXhwb3J0IGNvbnN0IHN0b2NrZmlzaFNlcnZpY2UgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2U7XG4iLCAiaW1wb3J0IHsgQW5hbHl6ZWRNb3ZlIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UsXG4gIG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLFxuICBTdG9ja2Zpc2hTZXJ2aWNlLFxufSBmcm9tICcuL3N0b2NrZmlzaC5zZXJ2aWNlJztcblxuZXhwb3J0IHR5cGUgRW5naW5lTGFuZSA9ICdtb3ZlJyB8ICdhbmFseXNpcyc7XG5cbmludGVyZmFjZSBFbmdpbmVDb29yZGluYXRvckRlcGVuZGVuY2llcyB7XG4gIG1vdmVTZXJ2aWNlPzogU3RvY2tmaXNoU2VydmljZTtcbiAgYW5hbHlzaXNTZXJ2aWNlPzogU3RvY2tmaXNoU2VydmljZTtcbn1cblxuZXhwb3J0IGNsYXNzIEVuZ2luZUNvb3JkaW5hdG9yIHtcbiAgcHJpdmF0ZSByZWFkb25seSBtb3ZlU2VydmljZTogU3RvY2tmaXNoU2VydmljZTtcbiAgcHJpdmF0ZSByZWFkb25seSBhbmFseXNpc1NlcnZpY2U6IFN0b2NrZmlzaFNlcnZpY2U7XG5cbiAgY29uc3RydWN0b3IoZGVwZW5kZW5jaWVzOiBFbmdpbmVDb29yZGluYXRvckRlcGVuZGVuY2llcyA9IHt9KSB7XG4gICAgdGhpcy5tb3ZlU2VydmljZSA9IGRlcGVuZGVuY2llcy5tb3ZlU2VydmljZSA/PyBtb3ZlU3RvY2tmaXNoU2VydmljZTtcbiAgICB0aGlzLmFuYWx5c2lzU2VydmljZSA9IGRlcGVuZGVuY2llcy5hbmFseXNpc1NlcnZpY2UgPz8gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZShsYW5lPzogRW5naW5lTGFuZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChsYW5lID09PSAnbW92ZScpIHtcbiAgICAgIGF3YWl0IHRoaXMubW92ZVNlcnZpY2UuaW5pdGlhbGl6ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChsYW5lID09PSAnYW5hbHlzaXMnKSB7XG4gICAgICBhd2FpdCB0aGlzLmFuYWx5c2lzU2VydmljZS5pbml0aWFsaXplKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5tb3ZlU2VydmljZS5pbml0aWFsaXplKCksXG4gICAgICB0aGlzLmFuYWx5c2lzU2VydmljZS5pbml0aWFsaXplKCksXG4gICAgXSk7XG4gIH1cblxuICBjb25maWd1cmUobGFuZTogRW5naW5lTGFuZSwgb3B0aW9uczogeyBtdWx0aVBWPzogbnVtYmVyOyBkZXB0aD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgdGhpcy5nZXRTZXJ2aWNlKGxhbmUpLmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIGFuYWx5emVQb3NpdGlvbihsYW5lOiBFbmdpbmVMYW5lLCBmZW46IHN0cmluZyk6IFByb21pc2U8QW5hbHl6ZWRNb3ZlW10+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRTZXJ2aWNlKGxhbmUpLmFuYWx5emVQb3NpdGlvbihmZW4pO1xuICB9XG5cbiAgc3RvcChsYW5lPzogRW5naW5lTGFuZSk6IHZvaWQge1xuICAgIGlmICghbGFuZSkge1xuICAgICAgdGhpcy5tb3ZlU2VydmljZS5zdG9wKCk7XG4gICAgICB0aGlzLmFuYWx5c2lzU2VydmljZS5zdG9wKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5nZXRTZXJ2aWNlKGxhbmUpLnN0b3AoKTtcbiAgfVxuXG4gIG5ld0dhbWUoKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlU2VydmljZS5uZXdHYW1lKCk7XG4gICAgdGhpcy5hbmFseXNpc1NlcnZpY2UubmV3R2FtZSgpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZXJ2aWNlLmRlc3Ryb3koKTtcbiAgICB0aGlzLmFuYWx5c2lzU2VydmljZS5kZXN0cm95KCk7XG4gIH1cblxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRTZXJ2aWNlKGxhbmU6IEVuZ2luZUxhbmUpOiBTdG9ja2Zpc2hTZXJ2aWNlIHtcbiAgICByZXR1cm4gbGFuZSA9PT0gJ21vdmUnID8gdGhpcy5tb3ZlU2VydmljZSA6IHRoaXMuYW5hbHlzaXNTZXJ2aWNlO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBlbmdpbmVDb29yZGluYXRvciA9IG5ldyBFbmdpbmVDb29yZGluYXRvcigpO1xuIiwgIi8qKlxuICogVHlwZXMgZm9yIHRoZSBjaGVzcyBlbmdpbmUgbW9kZWwgbGF5ZXJcbiAqIFB1cmUgVHlwZVNjcmlwdCAtIG5vIFJlYWN0LCBubyBNb2JYXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBbmFseXplZE1vdmUge1xuICBtb3ZlOiBzdHJpbmc7ICAgICAgICAvLyBVQ0kgZm9ybWF0IChlLmcuLCBcImUyZTRcIilcbiAgZXZhbHVhdGlvbjogbnVtYmVyOyAgLy8gQ2VudGlwYXduIGV2YWx1YXRpb25cbiAgZXZhbExvc3M6IG51bWJlcjsgICAgLy8gTG9zcyBjb21wYXJlZCB0byBiZXN0IG1vdmVcbiAgcHY6IHN0cmluZ1tdOyAgICAgICAgLy8gUHJpbmNpcGFsIHZhcmlhdGlvblxuICBtdWx0aXB2OiBudW1iZXI7ICAgICAvLyBNdWx0aVBWIHJhbmsgKDEgPSBiZXN0KVxuICBkZXB0aDogbnVtYmVyOyAgICAgICAvLyBTZWFyY2ggZGVwdGhcbn1cblxuZXhwb3J0IHR5cGUgTW92ZUJ1Y2tldCA9IFxuICB8ICdiZXN0J1xuICB8ICdncmVhdCdcbiAgfCAnZXhjZWxsZW50J1xuICB8ICdnb29kJ1xuICB8ICdpbmFjY3VyYWN5J1xuICB8ICdtaXN0YWtlJ1xuICB8ICdibHVuZGVyJztcblxuZXhwb3J0IHR5cGUgRGlzcGxheU1vdmVCdWNrZXQgPSBNb3ZlQnVja2V0IHwgJ2ZhbGxiYWNrJztcblxuZXhwb3J0IGludGVyZmFjZSBDbGFzc2lmaWVkTW92ZSBleHRlbmRzIEFuYWx5emVkTW92ZSB7XG4gIGJ1Y2tldDogTW92ZUJ1Y2tldDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdWNrZXRDb25maWcge1xuICBiZXN0OiBudW1iZXI7XG4gIGdyZWF0OiBudW1iZXI7XG4gIGV4Y2VsbGVudDogbnVtYmVyO1xuICBnb29kOiBudW1iZXI7XG4gIGluYWNjdXJhY3k6IG51bWJlcjtcbiAgbWlzdGFrZTogbnVtYmVyO1xuICBibHVuZGVyOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RvY2tmaXNoSW5mbyB7XG4gIG11bHRpcHY6IG51bWJlcjtcbiAgZGVwdGg6IG51bWJlcjtcbiAgc2NvcmU6IG51bWJlcjtcbiAgbWF0ZT86IG51bWJlcjtcbiAgcHY6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBpY2tlZE1vdmVSZXN1bHQge1xuICBtb3ZlOiBDbGFzc2lmaWVkTW92ZTtcbiAgYnVja2V0OiBNb3ZlQnVja2V0O1xuICBpc0JyaWxsaWFudD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0JVQ0tFVF9DT05GSUc6IEJ1Y2tldENvbmZpZyA9IHtcbiAgYmVzdDogNDAsXG4gIGdyZWF0OiAyNSxcbiAgZXhjZWxsZW50OiAyMCxcbiAgZ29vZDogMTAsXG4gIGluYWNjdXJhY3k6IDQsXG4gIG1pc3Rha2U6IDEsXG4gIGJsdW5kZXI6IDAsXG59O1xuXG4vKiogUHJlc2V0IGlkIGZvciBtb3ZlIHF1YWxpdHkgZGlzdHJpYnV0aW9uICovXG5leHBvcnQgdHlwZSBNb3ZlUXVhbGl0eVByZXNldElkID0gJ2xvdycgfCAnbWVkaXVtJyB8ICdoYXJkJyB8ICdzdXBlcl9oYXJkJyB8ICdhZ2dyZXNzaXZlJztcblxuZXhwb3J0IGludGVyZmFjZSBNb3ZlUXVhbGl0eVByZXNldCB7XG4gIGlkOiBNb3ZlUXVhbGl0eVByZXNldElkO1xuICBsYWJlbDogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBjb25maWc6IEJ1Y2tldENvbmZpZztcbn1cblxuLyoqIFByZWRlZmluZWQgbW92ZSBxdWFsaXR5IGRpc3RyaWJ1dGlvbnMgKHBlcmNlbnRhZ2VzIHN1bSB0byAxMDApICovXG5leHBvcnQgY29uc3QgTU9WRV9RVUFMSVRZX1BSRVNFVFM6IE1vdmVRdWFsaXR5UHJlc2V0W10gPSBbXG4gIHtcbiAgICBpZDogJ2xvdycsXG4gICAgbGFiZWw6ICdMb3cnLFxuICAgIGRlc2NyaXB0aW9uOiAnRWFzaWVyIFx1MjAxNCBtb3JlIGdvb2QvaW5hY2N1cmFjeS9taXN0YWtlIG1vdmVzJyxcbiAgICBjb25maWc6IHtcbiAgICAgIGJlc3Q6IDE1LFxuICAgICAgZ3JlYXQ6IDE1LFxuICAgICAgZXhjZWxsZW50OiAyMCxcbiAgICAgIGdvb2Q6IDI1LFxuICAgICAgaW5hY2N1cmFjeTogMTUsXG4gICAgICBtaXN0YWtlOiA3LFxuICAgICAgYmx1bmRlcjogMyxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaWQ6ICdtZWRpdW0nLFxuICAgIGxhYmVsOiAnTWVkaXVtJyxcbiAgICBkZXNjcmlwdGlvbjogJ0JhbGFuY2VkIG1peCBvZiBxdWFsaXRpZXMnLFxuICAgIGNvbmZpZzoge1xuICAgICAgYmVzdDogNDAsXG4gICAgICBncmVhdDogMjUsXG4gICAgICBleGNlbGxlbnQ6IDIwLFxuICAgICAgZ29vZDogMTAsXG4gICAgICBpbmFjY3VyYWN5OiA0LFxuICAgICAgbWlzdGFrZTogMSxcbiAgICAgIGJsdW5kZXI6IDAsXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGFyZCcsXG4gICAgbGFiZWw6ICdIYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Zhdm9ycyBiZXN0IGFuZCBncmVhdCBtb3ZlcycsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiA1NSxcbiAgICAgIGdyZWF0OiAyNSxcbiAgICAgIGV4Y2VsbGVudDogMTUsXG4gICAgICBnb29kOiA1LFxuICAgICAgaW5hY2N1cmFjeTogMCxcbiAgICAgIG1pc3Rha2U6IDAsXG4gICAgICBibHVuZGVyOiAwLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ3N1cGVyX2hhcmQnLFxuICAgIGxhYmVsOiAnU3VwZXIgSGFyZCcsXG4gICAgZGVzY3JpcHRpb246ICdBbG1vc3Qgb25seSBiZXN0IGFuZCBncmVhdCcsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiA3MCxcbiAgICAgIGdyZWF0OiAyNSxcbiAgICAgIGV4Y2VsbGVudDogNSxcbiAgICAgIGdvb2Q6IDAsXG4gICAgICBpbmFjY3VyYWN5OiAwLFxuICAgICAgbWlzdGFrZTogMCxcbiAgICAgIGJsdW5kZXI6IDAsXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAnYWdncmVzc2l2ZScsXG4gICAgbGFiZWw6ICdBZ2dyZXNzaXZlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1Jpc2t5IFx1MjAxNCBtb3JlIGluYWNjdXJhY2llcyBhbmQgbWlzdGFrZXMnLFxuICAgIGNvbmZpZzoge1xuICAgICAgYmVzdDogMjAsXG4gICAgICBncmVhdDogMjAsXG4gICAgICBleGNlbGxlbnQ6IDE1LFxuICAgICAgZ29vZDogMTUsXG4gICAgICBpbmFjY3VyYWN5OiAxNSxcbiAgICAgIG1pc3Rha2U6IDEwLFxuICAgICAgYmx1bmRlcjogNSxcbiAgICB9LFxuICB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IEJVQ0tFVF9FVkFMX1JBTkdFUzogUmVjb3JkPE1vdmVCdWNrZXQsIFtudW1iZXIsIG51bWJlcl0+ID0ge1xuICBiZXN0OiBbMCwgMTBdLFxuICBncmVhdDogWzEwLCAzMF0sXG4gIGV4Y2VsbGVudDogWzMwLCA3MF0sXG4gIGdvb2Q6IFs3MCwgMTUwXSxcbiAgaW5hY2N1cmFjeTogWzE1MCwgMzAwXSxcbiAgbWlzdGFrZTogWzMwMCwgNjAwXSxcbiAgYmx1bmRlcjogWzYwMCwgSW5maW5pdHldLFxufTtcblxuZXhwb3J0IGNvbnN0IEJVQ0tFVF9MQUJFTFM6IFJlY29yZDxNb3ZlQnVja2V0LCBzdHJpbmc+ID0ge1xuICBiZXN0OiAnQmVzdCcsXG4gIGdyZWF0OiAnR3JlYXQnLFxuICBleGNlbGxlbnQ6ICdFeGNlbGxlbnQnLFxuICBnb29kOiAnR29vZCcsXG4gIGluYWNjdXJhY3k6ICdJbmFjY3VyYWN5JyxcbiAgbWlzdGFrZTogJ01pc3Rha2UnLFxuICBibHVuZGVyOiAnQmx1bmRlcicsXG59O1xuXG5leHBvcnQgY29uc3QgRElTUExBWV9CVUNLRVRfTEFCRUxTOiBSZWNvcmQ8RGlzcGxheU1vdmVCdWNrZXQsIHN0cmluZz4gPSB7XG4gIC4uLkJVQ0tFVF9MQUJFTFMsXG4gIGZhbGxiYWNrOiAnRmFsbGJhY2sgbW92ZScsXG59O1xuXG5leHBvcnQgY29uc3QgQlVDS0VUX0NPTE9SUzogUmVjb3JkPE1vdmVCdWNrZXQsIHN0cmluZz4gPSB7XG4gIGJlc3Q6ICcjMjZhNjQxJyxcbiAgZ3JlYXQ6ICcjMmVhMDQzJyxcbiAgZXhjZWxsZW50OiAnIzU3YWI1YScsXG4gIGdvb2Q6ICcjOGI5NDllJyxcbiAgaW5hY2N1cmFjeTogJyNkMjk5MjInLFxuICBtaXN0YWtlOiAnI2Y4NTE0OScsXG4gIGJsdW5kZXI6ICcjZGEzNjMzJyxcbn07XG5cbmV4cG9ydCBjb25zdCBESVNQTEFZX0JVQ0tFVF9DT0xPUlM6IFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgc3RyaW5nPiA9IHtcbiAgLi4uQlVDS0VUX0NPTE9SUyxcbiAgZmFsbGJhY2s6ICcjNmU3NjgxJyxcbn07XG4iLCAiLyoqXG4gKiBNb3ZlIENsYXNzaWZpZXJcbiAqIE1vZGVsIGxheWVyIC0gUHVyZSBUeXBlU2NyaXB0LCBubyBSZWFjdCwgbm8gTW9iWFxuICogXG4gKiBDbGFzc2lmaWVzIGNoZXNzIG1vdmVzIGludG8gcXVhbGl0eSBidWNrZXRzIGJhc2VkIG9uIGV2YWx1YXRpb24gbG9zc1xuICovXG5cbmltcG9ydCB7IFxuICBBbmFseXplZE1vdmUsIFxuICBDbGFzc2lmaWVkTW92ZSwgXG4gIERpc3BsYXlNb3ZlQnVja2V0LFxuICBNb3ZlQnVja2V0LCBcbiAgQlVDS0VUX0VWQUxfUkFOR0VTIFxufSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBDbGFzc2lmeSBhIHNpbmdsZSBtb3ZlIGludG8gYSBxdWFsaXR5IGJ1Y2tldCBiYXNlZCBvbiBldmFsIGxvc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzaWZ5TW92ZShtb3ZlOiBBbmFseXplZE1vdmUpOiBDbGFzc2lmaWVkTW92ZSB7XG4gIGNvbnN0IGJ1Y2tldCA9IGdldEJ1Y2tldEZvckV2YWxMb3NzKG1vdmUuZXZhbExvc3MpO1xuICByZXR1cm4ge1xuICAgIC4uLm1vdmUsXG4gICAgYnVja2V0LFxuICB9O1xufVxuXG4vKipcbiAqIENsYXNzaWZ5IGFsbCBhbmFseXplZCBtb3Zlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlNb3Zlcyhtb3ZlczogQW5hbHl6ZWRNb3ZlW10pOiBDbGFzc2lmaWVkTW92ZVtdIHtcbiAgcmV0dXJuIG1vdmVzLm1hcChjbGFzc2lmeU1vdmUpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgYnVja2V0IGZvciBhIGdpdmVuIGV2YWwgbG9zc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnVja2V0Rm9yRXZhbExvc3MoZXZhbExvc3M6IG51bWJlcik6IE1vdmVCdWNrZXQge1xuICBjb25zdCBhYnNMb3NzID0gTWF0aC5hYnMoZXZhbExvc3MpO1xuICBcbiAgZm9yIChjb25zdCBbYnVja2V0LCBbbWluLCBtYXhdXSBvZiBPYmplY3QuZW50cmllcyhCVUNLRVRfRVZBTF9SQU5HRVMpKSB7XG4gICAgaWYgKGFic0xvc3MgPj0gbWluICYmIGFic0xvc3MgPCBtYXgpIHtcbiAgICAgIHJldHVybiBidWNrZXQgYXMgTW92ZUJ1Y2tldDtcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiAnYmx1bmRlcic7XG59XG5cbi8qKlxuICogR3JvdXAgY2xhc3NpZmllZCBtb3ZlcyBieSB0aGVpciBidWNrZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwTW92ZXNCeUJ1Y2tldChtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSk6IE1hcDxNb3ZlQnVja2V0LCBDbGFzc2lmaWVkTW92ZVtdPiB7XG4gIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8TW92ZUJ1Y2tldCwgQ2xhc3NpZmllZE1vdmVbXT4oKTtcbiAgXG4gIC8vIEluaXRpYWxpemUgYWxsIGJ1Y2tldHMgd2l0aCBlbXB0eSBhcnJheXNcbiAgY29uc3QgYnVja2V0czogTW92ZUJ1Y2tldFtdID0gWydiZXN0JywgJ2dyZWF0JywgJ2V4Y2VsbGVudCcsICdnb29kJywgJ2luYWNjdXJhY3knLCAnbWlzdGFrZScsICdibHVuZGVyJ107XG4gIGJ1Y2tldHMuZm9yRWFjaChidWNrZXQgPT4gZ3JvdXBzLnNldChidWNrZXQsIFtdKSk7XG4gIFxuICAvLyBHcm91cCBtb3Zlc1xuICBtb3Zlcy5mb3JFYWNoKG1vdmUgPT4ge1xuICAgIGNvbnN0IGJ1Y2tldE1vdmVzID0gZ3JvdXBzLmdldChtb3ZlLmJ1Y2tldCkgfHwgW107XG4gICAgYnVja2V0TW92ZXMucHVzaChtb3ZlKTtcbiAgICBncm91cHMuc2V0KG1vdmUuYnVja2V0LCBidWNrZXRNb3Zlcyk7XG4gIH0pO1xuICBcbiAgcmV0dXJuIGdyb3Vwcztcbn1cblxuLyoqXG4gKiBHZXQgc3RhdGlzdGljcyBhYm91dCB0aGUgbW92ZSBkaXN0cmlidXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1vdmVTdGF0cyhtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSk6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+IHtcbiAgY29uc3Qgc3RhdHM6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+ID0ge1xuICAgIGJlc3Q6IDAsXG4gICAgZ3JlYXQ6IDAsXG4gICAgZXhjZWxsZW50OiAwLFxuICAgIGdvb2Q6IDAsXG4gICAgaW5hY2N1cmFjeTogMCxcbiAgICBtaXN0YWtlOiAwLFxuICAgIGJsdW5kZXI6IDAsXG4gIH07XG4gIFxuICBtb3Zlcy5mb3JFYWNoKG1vdmUgPT4ge1xuICAgIHN0YXRzW21vdmUuYnVja2V0XSsrO1xuICB9KTtcbiAgXG4gIHJldHVybiBzdGF0cztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGVyZSBhcmUgYW55IG1vdmVzIGluIGEgZ2l2ZW4gYnVja2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNNb3ZlSW5CdWNrZXQobW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sIGJ1Y2tldDogTW92ZUJ1Y2tldCk6IGJvb2xlYW4ge1xuICByZXR1cm4gbW92ZXMuc29tZShtb3ZlID0+IG1vdmUuYnVja2V0ID09PSBidWNrZXQpO1xufVxuXG4vKipcbiAqIEdldCBhbGwgbW92ZXMgZnJvbSBhIHNwZWNpZmljIGJ1Y2tldFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TW92ZXNGcm9tQnVja2V0KG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLCBidWNrZXQ6IE1vdmVCdWNrZXQpOiBDbGFzc2lmaWVkTW92ZVtdIHtcbiAgcmV0dXJuIG1vdmVzLmZpbHRlcihtb3ZlID0+IG1vdmUuYnVja2V0ID09PSBidWNrZXQpO1xufVxuXG5jb25zdCBCVUNLRVRfT1JERVI6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnLCAnZ29vZCcsICdpbmFjY3VyYWN5JywgJ21pc3Rha2UnLCAnYmx1bmRlciddO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlVbmFuYWx5emVkTW92ZSgpOiBEaXNwbGF5TW92ZUJ1Y2tldCB7XG4gIHJldHVybiAnZmFsbGJhY2snO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwTGVnYWxNb3Zlc1RvQnVja2V0cyhcbiAgbGVnYWxNb3Zlczogc3RyaW5nW10sXG4gIGFuYWx5emVkTW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIHVzZUltcHJvdmVkRmFsbGJhY2s6IGJvb2xlYW4sXG4pOiBSZWNvcmQ8c3RyaW5nLCBEaXNwbGF5TW92ZUJ1Y2tldD4ge1xuICBjb25zdCBtb3ZlTWFwOiBSZWNvcmQ8c3RyaW5nLCBEaXNwbGF5TW92ZUJ1Y2tldD4gPSB7fTtcblxuICBmb3IgKGNvbnN0IGFuYWx5emVkTW92ZSBvZiBhbmFseXplZE1vdmVzKSB7XG4gICAgbW92ZU1hcFthbmFseXplZE1vdmUubW92ZV0gPSBhbmFseXplZE1vdmUuYnVja2V0O1xuICB9XG5cbiAgZm9yIChjb25zdCBtb3ZlIG9mIGxlZ2FsTW92ZXMpIHtcbiAgICBpZiAoIW1vdmVNYXBbbW92ZV0pIHtcbiAgICAgIG1vdmVNYXBbbW92ZV0gPSB1c2VJbXByb3ZlZEZhbGxiYWNrID8gY2xhc3NpZnlVbmFuYWx5emVkTW92ZSgpIDogJ2dvb2QnO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtb3ZlTWFwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZENsb3Nlc3RBdmFpbGFibGVCdWNrZXQoXG4gIHRhcmdldEJ1Y2tldDogTW92ZUJ1Y2tldCxcbiAgYXZhaWxhYmxlQnVja2V0czogTW92ZUJ1Y2tldFtdLFxuKTogTW92ZUJ1Y2tldCB8IG51bGwge1xuICBpZiAoYXZhaWxhYmxlQnVja2V0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldEluZGV4ID0gQlVDS0VUX09SREVSLmluZGV4T2YodGFyZ2V0QnVja2V0KTtcbiAgaWYgKHRhcmdldEluZGV4ID09PSAtMSkge1xuICAgIHJldHVybiBhdmFpbGFibGVCdWNrZXRzWzBdO1xuICB9XG5cbiAgZm9yIChsZXQgb2Zmc2V0ID0gMTsgb2Zmc2V0IDwgQlVDS0VUX09SREVSLmxlbmd0aDsgb2Zmc2V0ICs9IDEpIHtcbiAgICBjb25zdCBiZXR0ZXJJbmRleCA9IHRhcmdldEluZGV4IC0gb2Zmc2V0O1xuICAgIGlmIChiZXR0ZXJJbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBiZXR0ZXJCdWNrZXQgPSBCVUNLRVRfT1JERVJbYmV0dGVySW5kZXhdO1xuICAgICAgaWYgKGF2YWlsYWJsZUJ1Y2tldHMuaW5jbHVkZXMoYmV0dGVyQnVja2V0KSkge1xuICAgICAgICByZXR1cm4gYmV0dGVyQnVja2V0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHdvcnNlSW5kZXggPSB0YXJnZXRJbmRleCArIG9mZnNldDtcbiAgICBpZiAod29yc2VJbmRleCA8IEJVQ0tFVF9PUkRFUi5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHdvcnNlQnVja2V0ID0gQlVDS0VUX09SREVSW3dvcnNlSW5kZXhdO1xuICAgICAgaWYgKGF2YWlsYWJsZUJ1Y2tldHMuaW5jbHVkZXMod29yc2VCdWNrZXQpKSB7XG4gICAgICAgIHJldHVybiB3b3JzZUJ1Y2tldDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXZhaWxhYmxlQnVja2V0c1swXTtcbn1cbiIsICIvKipcbiAqIE1vdmUgUGlja2VyXG4gKiBNb2RlbCBsYXllciAtIFB1cmUgVHlwZVNjcmlwdCwgbm8gUmVhY3QsIG5vIE1vYlhcbiAqIFxuICogUGlja3MgYSBtb3ZlIGJhc2VkIG9uIHdlaWdodGVkIHByb2JhYmlsaXR5IGZyb20gcXVhbGl0eSBidWNrZXRzXG4gKi9cblxuaW1wb3J0IHsgXG4gIENsYXNzaWZpZWRNb3ZlLCBcbiAgTW92ZUJ1Y2tldCwgXG4gIEJ1Y2tldENvbmZpZywgXG4gIFBpY2tlZE1vdmVSZXN1bHQsXG4gIERFRkFVTFRfQlVDS0VUX0NPTkZJRyBcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBmaW5kQ2xvc2VzdEF2YWlsYWJsZUJ1Y2tldCwgZ3JvdXBNb3Zlc0J5QnVja2V0IH0gZnJvbSAnLi9tb3ZlQ2xhc3NpZmllcic7XG5cbmV4cG9ydCB0eXBlIFJhbmRvbU51bWJlckdlbmVyYXRvciA9ICgpID0+IG51bWJlcjtcblxuaW50ZXJmYWNlIEJ1Y2tldFNlbGVjdGlvbiB7XG4gIGJ1Y2tldDogTW92ZUJ1Y2tldDtcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW107XG59XG5cbmZ1bmN0aW9uIGdldEJ1Y2tldE9yZGVyKCk6IE1vdmVCdWNrZXRbXSB7XG4gIHJldHVybiBbJ2Jlc3QnLCAnZ3JlYXQnLCAnZXhjZWxsZW50JywgJ2dvb2QnLCAnaW5hY2N1cmFjeScsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcbn1cblxuZnVuY3Rpb24gZ2V0QXZhaWxhYmxlQnVja2V0cyhcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnLFxuKTogQnVja2V0U2VsZWN0aW9uW10ge1xuICBjb25zdCBncm91cGVkID0gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzKTtcbiAgY29uc3QgYXZhaWxhYmxlQnVja2V0czogQnVja2V0U2VsZWN0aW9uW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBnZXRCdWNrZXRPcmRlcigpKSB7XG4gICAgY29uc3QgYnVja2V0TW92ZXMgPSBncm91cGVkLmdldChidWNrZXQpIHx8IFtdO1xuICAgIGlmIChidWNrZXRNb3Zlcy5sZW5ndGggPiAwICYmIGNvbmZpZ1tidWNrZXRdID4gMCkge1xuICAgICAgYXZhaWxhYmxlQnVja2V0cy5wdXNoKHsgYnVja2V0LCBtb3ZlczogYnVja2V0TW92ZXMgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGF2YWlsYWJsZUJ1Y2tldHM7XG59XG5cbmZ1bmN0aW9uIHBpY2tXZWlnaHRlZEJ1Y2tldChcbiAgd2VpZ2h0ZWRCdWNrZXRzOiBBcnJheTx7IGJ1Y2tldDogTW92ZUJ1Y2tldDsgd2VpZ2h0OiBudW1iZXIgfT4sXG4gIHJhbmRvbTogUmFuZG9tTnVtYmVyR2VuZXJhdG9yLFxuKTogTW92ZUJ1Y2tldCB8IG51bGwge1xuICBjb25zdCB0b3RhbFdlaWdodCA9IHdlaWdodGVkQnVja2V0cy5yZWR1Y2UoKHN1bSwgZW50cnkpID0+IHN1bSArIGVudHJ5LndlaWdodCwgMCk7XG5cbiAgaWYgKHRvdGFsV2VpZ2h0IDw9IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBzZWxlY3Rpb24gPSByYW5kb20oKSAqIHRvdGFsV2VpZ2h0O1xuXG4gIGZvciAoY29uc3QgZW50cnkgb2Ygd2VpZ2h0ZWRCdWNrZXRzKSB7XG4gICAgc2VsZWN0aW9uIC09IGVudHJ5LndlaWdodDtcbiAgICBpZiAoc2VsZWN0aW9uIDw9IDApIHtcbiAgICAgIHJldHVybiBlbnRyeS5idWNrZXQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHdlaWdodGVkQnVja2V0c1t3ZWlnaHRlZEJ1Y2tldHMubGVuZ3RoIC0gMV0/LmJ1Y2tldCA/PyBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja0J1Y2tldExlZ2FjeShcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnID0gREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICByYW5kb206IFJhbmRvbU51bWJlckdlbmVyYXRvciA9IE1hdGgucmFuZG9tLFxuKTogQnVja2V0U2VsZWN0aW9uIHwgbnVsbCB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IGF2YWlsYWJsZUJ1Y2tldHMgPSBnZXRBdmFpbGFibGVCdWNrZXRzKG1vdmVzLCBjb25maWcpO1xuICBpZiAoYXZhaWxhYmxlQnVja2V0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgYnVja2V0OiBtb3Zlc1swXS5idWNrZXQsXG4gICAgICBtb3ZlczogW21vdmVzWzBdXSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3Qgd2VpZ2h0ZWRCdWNrZXRzID0gYXZhaWxhYmxlQnVja2V0cy5tYXAoKGVudHJ5KSA9PiAoe1xuICAgIGJ1Y2tldDogZW50cnkuYnVja2V0LFxuICAgIHdlaWdodDogY29uZmlnW2VudHJ5LmJ1Y2tldF0sXG4gIH0pKTtcbiAgY29uc3Qgc2VsZWN0ZWRCdWNrZXQgPSBwaWNrV2VpZ2h0ZWRCdWNrZXQod2VpZ2h0ZWRCdWNrZXRzLCByYW5kb20pO1xuXG4gIGlmICghc2VsZWN0ZWRCdWNrZXQpIHtcbiAgICByZXR1cm4gYXZhaWxhYmxlQnVja2V0c1swXTtcbiAgfVxuXG4gIHJldHVybiBhdmFpbGFibGVCdWNrZXRzLmZpbmQoKGVudHJ5KSA9PiBlbnRyeS5idWNrZXQgPT09IHNlbGVjdGVkQnVja2V0KSA/PyBhdmFpbGFibGVCdWNrZXRzWzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja0J1Y2tldFdpdGhDbG9zZXN0RmFsbGJhY2soXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICBjb25maWc6IEJ1Y2tldENvbmZpZyA9IERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IgPSBNYXRoLnJhbmRvbSxcbik6IEJ1Y2tldFNlbGVjdGlvbiB8IG51bGwge1xuICBpZiAobW92ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBncm91cGVkID0gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzKTtcbiAgY29uc3Qgd2VpZ2h0ZWRCdWNrZXRzID0gZ2V0QnVja2V0T3JkZXIoKVxuICAgIC5maWx0ZXIoKGJ1Y2tldCkgPT4gY29uZmlnW2J1Y2tldF0gPiAwKVxuICAgIC5tYXAoKGJ1Y2tldCkgPT4gKHsgYnVja2V0LCB3ZWlnaHQ6IGNvbmZpZ1tidWNrZXRdIH0pKTtcbiAgY29uc3Qgc2VsZWN0ZWRCdWNrZXQgPSBwaWNrV2VpZ2h0ZWRCdWNrZXQod2VpZ2h0ZWRCdWNrZXRzLCByYW5kb20pO1xuXG4gIGlmICghc2VsZWN0ZWRCdWNrZXQpIHtcbiAgICByZXR1cm4gcGlja0J1Y2tldExlZ2FjeShtb3ZlcywgY29uZmlnLCByYW5kb20pO1xuICB9XG5cbiAgY29uc3Qgc2VsZWN0ZWRNb3ZlcyA9IGdyb3VwZWQuZ2V0KHNlbGVjdGVkQnVja2V0KSB8fCBbXTtcbiAgaWYgKHNlbGVjdGVkTW92ZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBidWNrZXQ6IHNlbGVjdGVkQnVja2V0LFxuICAgICAgbW92ZXM6IHNlbGVjdGVkTW92ZXMsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGF2YWlsYWJsZUJ1Y2tldHMgPSBnZXRCdWNrZXRPcmRlcigpLmZpbHRlcigoYnVja2V0KSA9PiAoZ3JvdXBlZC5nZXQoYnVja2V0KSB8fCBbXSkubGVuZ3RoID4gMCk7XG4gIGNvbnN0IGZhbGxiYWNrQnVja2V0ID0gZmluZENsb3Nlc3RBdmFpbGFibGVCdWNrZXQoc2VsZWN0ZWRCdWNrZXQsIGF2YWlsYWJsZUJ1Y2tldHMpO1xuICBpZiAoIWZhbGxiYWNrQnVja2V0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJ1Y2tldDogZmFsbGJhY2tCdWNrZXQsXG4gICAgbW92ZXM6IGdyb3VwZWQuZ2V0KGZhbGxiYWNrQnVja2V0KSB8fCBbXSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tSYW5kb21Nb3ZlRnJvbUJ1Y2tldChcbiAgYnVja2V0U2VsZWN0aW9uOiBCdWNrZXRTZWxlY3Rpb24sXG4gIHJhbmRvbTogUmFuZG9tTnVtYmVyR2VuZXJhdG9yID0gTWF0aC5yYW5kb20sXG4pOiBDbGFzc2lmaWVkTW92ZSB7XG4gIGNvbnN0IHJhbmRvbU1vdmVJbmRleCA9IE1hdGguZmxvb3IocmFuZG9tKCkgKiBidWNrZXRTZWxlY3Rpb24ubW92ZXMubGVuZ3RoKTtcbiAgcmV0dXJuIGJ1Y2tldFNlbGVjdGlvbi5tb3Zlc1tyYW5kb21Nb3ZlSW5kZXhdO1xufVxuXG4vKipcbiAqIFBpY2sgYSBtb3ZlIGJhc2VkIG9uIGJ1Y2tldCBjb25maWd1cmF0aW9uICh3ZWlnaHRlZCByYW5kb20pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaWNrTW92ZShcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sIFxuICBjb25maWc6IEJ1Y2tldENvbmZpZyA9IERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IgPSBNYXRoLnJhbmRvbSxcbik6IFBpY2tlZE1vdmVSZXN1bHQgfCBudWxsIHtcbiAgY29uc3Qgc2VsZWN0ZWRCdWNrZXQgPSBwaWNrQnVja2V0TGVnYWN5KG1vdmVzLCBjb25maWcsIHJhbmRvbSk7XG4gIGlmICghc2VsZWN0ZWRCdWNrZXQpIHJldHVybiBudWxsO1xuICBjb25zdCBzZWxlY3RlZE1vdmUgPSBwaWNrUmFuZG9tTW92ZUZyb21CdWNrZXQoc2VsZWN0ZWRCdWNrZXQsIHJhbmRvbSk7XG5cbiAgcmV0dXJuIHtcbiAgICBtb3ZlOiBzZWxlY3RlZE1vdmUsXG4gICAgYnVja2V0OiBzZWxlY3RlZEJ1Y2tldC5idWNrZXQsXG4gIH07XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGJ1Y2tldCBjb25maWcgc28gcGVyY2VudGFnZXMgc3VtIHRvIDEwMFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQnVja2V0Q29uZmlnKGNvbmZpZzogQnVja2V0Q29uZmlnKTogQnVja2V0Q29uZmlnIHtcbiAgY29uc3QgdG90YWwgPSBPYmplY3QudmFsdWVzKGNvbmZpZykucmVkdWNlKChzdW0sIHZhbCkgPT4gc3VtICsgdmFsLCAwKTtcbiAgXG4gIGlmICh0b3RhbCA9PT0gMCB8fCB0b3RhbCA9PT0gMTAwKSB7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuICBcbiAgY29uc3QgZmFjdG9yID0gMTAwIC8gdG90YWw7XG4gIFxuICByZXR1cm4ge1xuICAgIGJlc3Q6IE1hdGgucm91bmQoY29uZmlnLmJlc3QgKiBmYWN0b3IpLFxuICAgIGdyZWF0OiBNYXRoLnJvdW5kKGNvbmZpZy5ncmVhdCAqIGZhY3RvciksXG4gICAgZXhjZWxsZW50OiBNYXRoLnJvdW5kKGNvbmZpZy5leGNlbGxlbnQgKiBmYWN0b3IpLFxuICAgIGdvb2Q6IE1hdGgucm91bmQoY29uZmlnLmdvb2QgKiBmYWN0b3IpLFxuICAgIGluYWNjdXJhY3k6IE1hdGgucm91bmQoY29uZmlnLmluYWNjdXJhY3kgKiBmYWN0b3IpLFxuICAgIG1pc3Rha2U6IE1hdGgucm91bmQoY29uZmlnLm1pc3Rha2UgKiBmYWN0b3IpLFxuICAgIGJsdW5kZXI6IE1hdGgucm91bmQoY29uZmlnLmJsdW5kZXIgKiBmYWN0b3IpLFxuICB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlIGJ1Y2tldCBjb25maWdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQnVja2V0Q29uZmlnKGNvbmZpZzogQnVja2V0Q29uZmlnKTogeyB2YWxpZDogYm9vbGVhbjsgdG90YWw6IG51bWJlciB9IHtcbiAgY29uc3QgdG90YWwgPSBPYmplY3QudmFsdWVzKGNvbmZpZykucmVkdWNlKChzdW0sIHZhbCkgPT4gc3VtICsgdmFsLCAwKTtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdG90YWwgPT09IDEwMCxcbiAgICB0b3RhbCxcbiAgfTtcbn1cblxuLyoqXG4gKiBHZXQgcHJvYmFiaWxpdHkgb2YgcGlja2luZyBmcm9tIGVhY2ggYnVja2V0IGdpdmVuIGN1cnJlbnQgY29uZmlnIGFuZCBhdmFpbGFibGUgbW92ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVmZmVjdGl2ZVByb2JhYmlsaXRpZXMoXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICBjb25maWc6IEJ1Y2tldENvbmZpZ1xuKTogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICBjb25zdCBncm91cGVkID0gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzKTtcbiAgXG4gIGNvbnN0IHByb2JhYmlsaXRpZXM6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+ID0ge1xuICAgIGJlc3Q6IDAsXG4gICAgZ3JlYXQ6IDAsXG4gICAgZXhjZWxsZW50OiAwLFxuICAgIGdvb2Q6IDAsXG4gICAgaW5hY2N1cmFjeTogMCxcbiAgICBtaXN0YWtlOiAwLFxuICAgIGJsdW5kZXI6IDAsXG4gIH07XG4gIFxuICAvLyBDYWxjdWxhdGUgZWZmZWN0aXZlIHdlaWdodHMgKG9ubHkgYnVja2V0cyB3aXRoIG1vdmVzKVxuICBsZXQgdG90YWxFZmZlY3RpdmVXZWlnaHQgPSAwO1xuICBjb25zdCBidWNrZXRzOiBNb3ZlQnVja2V0W10gPSBbJ2Jlc3QnLCAnZ3JlYXQnLCAnZXhjZWxsZW50JywgJ2dvb2QnLCAnaW5hY2N1cmFjeScsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcbiAgXG4gIGZvciAoY29uc3QgYnVja2V0IG9mIGJ1Y2tldHMpIHtcbiAgICBjb25zdCBidWNrZXRNb3ZlcyA9IGdyb3VwZWQuZ2V0KGJ1Y2tldCkgfHwgW107XG4gICAgaWYgKGJ1Y2tldE1vdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRvdGFsRWZmZWN0aXZlV2VpZ2h0ICs9IGNvbmZpZ1tidWNrZXRdO1xuICAgIH1cbiAgfVxuICBcbiAgaWYgKHRvdGFsRWZmZWN0aXZlV2VpZ2h0ID09PSAwKSB7XG4gICAgcmV0dXJuIHByb2JhYmlsaXRpZXM7XG4gIH1cbiAgXG4gIC8vIENhbGN1bGF0ZSBub3JtYWxpemVkIHByb2JhYmlsaXRpZXNcbiAgZm9yIChjb25zdCBidWNrZXQgb2YgYnVja2V0cykge1xuICAgIGNvbnN0IGJ1Y2tldE1vdmVzID0gZ3JvdXBlZC5nZXQoYnVja2V0KSB8fCBbXTtcbiAgICBpZiAoYnVja2V0TW92ZXMubGVuZ3RoID4gMCkge1xuICAgICAgcHJvYmFiaWxpdGllc1tidWNrZXRdID0gKGNvbmZpZ1tidWNrZXRdIC8gdG90YWxFZmZlY3RpdmVXZWlnaHQpICogMTAwO1xuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIHByb2JhYmlsaXRpZXM7XG59XG4iLCAiaW1wb3J0IHsgTW92ZVF1YWxpdHlQcmVzZXRJZCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZlYXR1cmVPcHRpb25zIHtcbiAgc2VjdXJpdHlEZXZUb29sc09ubHk6IGJvb2xlYW47XG4gIHBlcnNpc3RFbmdpbmVDb25maWc6IGJvb2xlYW47XG4gIHVzZURldGVybWluaXN0aWNSbmc6IGJvb2xlYW47XG4gIHVzZU1vdmVBbmFseXNpc0NhY2hlOiBib29sZWFuO1xuICB1c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbjogYm9vbGVhbjtcbiAgdXNlUG9zaXRpb25Db21wbGV4aXR5OiBib29sZWFuO1xuICB1c2VQZXJzb25hQmVoYXZpb3JCaWFzOiBib29sZWFuO1xuICB1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbjogYm9vbGVhbjtcbiAgdXNlQnJpbGxpYW50TW92ZUJ1ZGdldDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgRmVhdHVyZU9wdGlvbktleSA9IGtleW9mIEZlYXR1cmVPcHRpb25zO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZlYXR1cmVPcHRpb25EZXNjcmlwdG9yIHtcbiAga2V5OiBGZWF0dXJlT3B0aW9uS2V5O1xuICBsYWJlbDogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBQZXJzb25hSWQgPSBNb3ZlUXVhbGl0eVByZXNldElkIHwgJ2N1c3RvbSc7XG5leHBvcnQgdHlwZSBCcmlsbGlhbnRNb3Zlc1BlckdhbWUgPSAwIHwgMSB8IDIgfCAzIHwgNDtcbmV4cG9ydCB0eXBlIEJyaWxsaWFudEFsbG93ZWRQaGFzZSA9ICdvcGVuaW5nJyB8ICdtaWRkbGVnYW1lJyB8ICdlbmRnYW1lJyB8ICdhbnknO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcge1xuICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IEJyaWxsaWFudE1vdmVzUGVyR2FtZTtcbiAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiBCcmlsbGlhbnRBbGxvd2VkUGhhc2U7XG4gIGJyaWxsaWFudFVzZWRDb3VudDogbnVtYmVyO1xuICBicmlsbGlhbnRNb3ZlTnVtYmVyczogbnVtYmVyW107XG4gIGdhbWVTZXNzaW9uSWQ6IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUzogRmVhdHVyZU9wdGlvbnMgPSB7XG4gIHNlY3VyaXR5RGV2VG9vbHNPbmx5OiB0cnVlLFxuICBwZXJzaXN0RW5naW5lQ29uZmlnOiB0cnVlLFxuICB1c2VEZXRlcm1pbmlzdGljUm5nOiBmYWxzZSxcbiAgdXNlTW92ZUFuYWx5c2lzQ2FjaGU6IHRydWUsXG4gIHVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uOiB0cnVlLFxuICB1c2VQb3NpdGlvbkNvbXBsZXhpdHk6IGZhbHNlLFxuICB1c2VQZXJzb25hQmVoYXZpb3JCaWFzOiBmYWxzZSxcbiAgdXNlSHVtYW5EZWxheVNpbXVsYXRpb246IGZhbHNlLFxuICB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0OiBmYWxzZSxcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUc6IEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcgPSB7XG4gIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMCxcbiAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnYW55JyxcbiAgYnJpbGxpYW50VXNlZENvdW50OiAwLFxuICBicmlsbGlhbnRNb3ZlTnVtYmVyczogW10sXG4gIGdhbWVTZXNzaW9uSWQ6IG51bGwsXG59O1xuXG5leHBvcnQgY29uc3QgRkVBVFVSRV9PUFRJT05fREVTQ1JJUFRPUlM6IEZlYXR1cmVPcHRpb25EZXNjcmlwdG9yW10gPSBbXG4gIHtcbiAgICBrZXk6ICdzZWN1cml0eURldlRvb2xzT25seScsXG4gICAgbGFiZWw6ICdEZXZUb29scyBPbmx5IEluIERldmVsb3BtZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ09wZW4gQ2hyb21pdW0gRGV2VG9vbHMgb25seSBpbiBkZXZlbG9wbWVudCBtb2RlLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICdwZXJzaXN0RW5naW5lQ29uZmlnJyxcbiAgICBsYWJlbDogJ1BlcnNpc3QgRW5naW5lIENvbmZpZ3VyYXRpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBkZXB0aCwgTXVsdGlQViwgcHJlc2V0cywgYnVja2V0IHdlaWdodHMsIGFuZCBhZHZhbmNlZCBmZWF0dXJlIG9wdGlvbnMuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZURldGVybWluaXN0aWNSbmcnLFxuICAgIGxhYmVsOiAnRGV0ZXJtaW5pc3RpYyBSTkcnLFxuICAgIGRlc2NyaXB0aW9uOiAnVXNlIGEgc2VlZGVkIHJhbmRvbSBzb3VyY2Ugc28gbW92ZSBzZWxlY3Rpb24gaXMgcmVwcm9kdWNpYmxlLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VNb3ZlQW5hbHlzaXNDYWNoZScsXG4gICAgbGFiZWw6ICdBbmFseXNpcyBDYWNoZScsXG4gICAgZGVzY3JpcHRpb246ICdSZXVzZSBTdG9ja2Zpc2ggYW5hbHlzaXMgZm9yIHRoZSBzYW1lIEZFTiwgZGVwdGgsIGFuZCBNdWx0aVBWIHNldHRpbmdzLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbicsXG4gICAgbGFiZWw6ICdJbXByb3ZlZCBNb3ZlIENsYXNzaWZpY2F0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ0tlZXAgdW5rbm93biBtb3ZlcyBzZXBhcmF0ZSBhbmQgdXNlIHNtYXJ0ZXIgYnVja2V0IGZhbGxiYWNrIHNlbGVjdGlvbi4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlUG9zaXRpb25Db21wbGV4aXR5JyxcbiAgICBsYWJlbDogJ1Bvc2l0aW9uIENvbXBsZXhpdHknLFxuICAgIGRlc2NyaXB0aW9uOiAnQWRqdXN0IG1vdmUgcXVhbGl0eSB3ZWlnaHRzIGJhc2VkIG9uIGhvdyBzaGFycCB0aGUgY3VycmVudCBwb3NpdGlvbiBpcy4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlUGVyc29uYUJlaGF2aW9yQmlhcycsXG4gICAgbGFiZWw6ICdQZXJzb25hIEJlaGF2aW9yIEJpYXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGF5ZXIgc2ltcGxlIGFnZ3Jlc3NpdmUgb3Igc2FmZSBtb3ZlIHByZWZlcmVuY2VzIG9uIHRvcCBvZiBidWNrZXQgc2VsZWN0aW9uLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbicsXG4gICAgbGFiZWw6ICdIdW1hbiBEZWxheSBTaW11bGF0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGF5IGF1dG8tcGxheSBtb3ZlcyBiYXNlZCBvbiBjb21wbGV4aXR5LCBwZXJzb25hLCBhbmQgY2hvc2VuIG1vdmUgcXVhbGl0eS4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsXG4gICAgbGFiZWw6ICdCcmlsbGlhbnQgTW92ZSBCdWRnZXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVzZXJ2ZSBhIGZpeGVkIG51bWJlciBvZiB0YWN0aWNhbCBicmlsbGlhbnQgbW92ZXMgZm9yIGVhY2ggZ2FtZS4nLFxuICB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfZmVhdHVyZV9vcHRpb25zJztcbmV4cG9ydCBjb25zdCBFTkdJTkVfQ09ORklHX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19lbmdpbmVfY29uZmlnJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlRmVhdHVyZU9wdGlvbnMoXG4gIHBhcnRpYWw/OiBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPiB8IG51bGwsXG4pOiBGZWF0dXJlT3B0aW9ucyB7XG4gIHJldHVybiB7XG4gICAgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gICAgLi4uKHBhcnRpYWwgPz8ge30pLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnKFxuICBwYXJ0aWFsPzogUGFydGlhbDxCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnPiB8IG51bGwsXG4pOiBCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5ERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcsXG4gICAgLi4uKHBhcnRpYWwgPz8ge30pLFxuICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBwYXJ0aWFsPy5icmlsbGlhbnRNb3ZlTnVtYmVycyA/PyBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcuYnJpbGxpYW50TW92ZU51bWJlcnMsXG4gICAgZ2FtZVNlc3Npb25JZDogcGFydGlhbD8uZ2FtZVNlc3Npb25JZCA/PyBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcuZ2FtZVNlc3Npb25JZCxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSwgcmVhY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIEJyaWxsaWFudEFsbG93ZWRQaGFzZSxcbiAgQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyxcbiAgQnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcsXG4gIERFRkFVTFRfRkVBVFVSRV9PUFRJT05TLFxuICBGRUFUVVJFX09QVElPTlNfU1RPUkFHRV9LRVksXG4gIEZlYXR1cmVPcHRpb25LZXksXG4gIEZlYXR1cmVPcHRpb25zLFxuICBtZXJnZUJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcsXG4gIG1lcmdlRmVhdHVyZU9wdGlvbnMsXG59IGZyb20gJy4uL2VuZ2luZS9mZWF0dXJlT3B0aW9ucyc7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgcGVyc29uYUNoZXNzQnJpZGdlPzoge1xuICAgICAgc3luY0ZlYXR1cmVPcHRpb25zOiAob3B0aW9uczogRmVhdHVyZU9wdGlvbnMpID0+IHZvaWQ7XG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwge1xuICBvcHRpb25zOiBGZWF0dXJlT3B0aW9ucyA9IHsgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfTtcbiAgYnJpbGxpYW50Q29uZmlnOiBCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcgfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0T3B0aW9uOiBhY3Rpb24sXG4gICAgICBzZXRPcHRpb25zOiBhY3Rpb24sXG4gICAgICBhcHBseVByb2ZpbGVTZXR0aW5nczogYWN0aW9uLFxuICAgICAgc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lOiBhY3Rpb24sXG4gICAgICBzZXRCcmlsbGlhbnRBbGxvd2VkUGhhc2U6IGFjdGlvbixcbiAgICAgIHJlY29uY2lsZUJyaWxsaWFudFRyYWNraW5nOiBhY3Rpb24sXG4gICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nOiBhY3Rpb24sXG4gICAgICByZXNldFRvRGVmYXVsdHM6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG5cbiAgICByZWFjdGlvbihcbiAgICAgICgpID0+ICh7XG4gICAgICAgIG9wdGlvbnM6IHsgLi4udGhpcy5vcHRpb25zIH0sXG4gICAgICAgIGJyaWxsaWFudENvbmZpZzoge1xuICAgICAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBbLi4udGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZU51bWJlcnNdLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICAoc25hcHNob3QpID0+IHtcbiAgICAgICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgICAgIHRoaXMuc3luY1RvTWFpblByb2Nlc3Moc25hcHNob3Qub3B0aW9ucyk7XG4gICAgICB9LFxuICAgICAgeyBmaXJlSW1tZWRpYXRlbHk6IHRydWUgfSxcbiAgICApO1xuICB9XG5cbiAgc2V0T3B0aW9uPEtleSBleHRlbmRzIEZlYXR1cmVPcHRpb25LZXk+KGtleTogS2V5LCB2YWx1ZTogRmVhdHVyZU9wdGlvbnNbS2V5XSk6IHZvaWQge1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgIFtrZXldOiB2YWx1ZSxcbiAgICB9O1xuXG4gICAgaWYgKGtleSA9PT0gJ3BlcnNpc3RFbmdpbmVDb25maWcnICYmIHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZFN0b3JhZ2UoKTtcbiAgICB9XG4gIH1cblxuICBzZXRPcHRpb25zKG9wdGlvbnM6IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+KTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyh7XG4gICAgICAuLi50aGlzLm9wdGlvbnMsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgYXBwbHlQcm9maWxlU2V0dGluZ3MoXG4gICAgb3B0aW9uczogUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4sXG4gICAgYnJpbGxpYW50U2V0dGluZ3M6IFBhcnRpYWw8UGljazxCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnLCAnYnJpbGxpYW50TW92ZXNQZXJHYW1lJyB8ICdicmlsbGlhbnRBbGxvd2VkUGhhc2UnPj4sXG4gICk6IHZvaWQge1xuICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlRmVhdHVyZU9wdGlvbnMoe1xuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiBicmlsbGlhbnRTZXR0aW5ncy5icmlsbGlhbnRNb3Zlc1BlckdhbWUgPz8gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiBicmlsbGlhbnRTZXR0aW5ncy5icmlsbGlhbnRBbGxvd2VkUGhhc2UgPz8gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50QWxsb3dlZFBoYXNlLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50ID4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lKSB7XG4gICAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICAgIGJyaWxsaWFudFVzZWRDb3VudDogdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICAgICAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZU51bWJlcnMuc2xpY2UoMCwgdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lKSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lKHZhbHVlOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWUpOiB2b2lkIHtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiB2YWx1ZSxcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudFVzZWRDb3VudCA+IHZhbHVlKSB7XG4gICAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICAgIGJyaWxsaWFudFVzZWRDb3VudDogdmFsdWUsXG4gICAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3ZlTnVtYmVycy5zbGljZSgwLCB2YWx1ZSksXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHNldEJyaWxsaWFudEFsbG93ZWRQaGFzZSh2YWx1ZTogQnJpbGxpYW50QWxsb3dlZFBoYXNlKTogdm9pZCB7XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogdmFsdWUsXG4gICAgfTtcbiAgfVxuXG4gIHJlY29uY2lsZUJyaWxsaWFudFRyYWNraW5nKFxuICAgIGdhbWVTZXNzaW9uSWQ6IHN0cmluZyxcbiAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogbnVtYmVyW10sXG4gICk6IHZvaWQge1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBnYW1lU2Vzc2lvbklkLFxuICAgICAgYnJpbGxpYW50VXNlZENvdW50OiBicmlsbGlhbnRNb3ZlTnVtYmVycy5sZW5ndGgsXG4gICAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogWy4uLmJyaWxsaWFudE1vdmVOdW1iZXJzXSxcbiAgICB9O1xuICB9XG5cbiAgcmVzZXRCcmlsbGlhbnRUcmFja2luZyhnYW1lU2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBnYW1lU2Vzc2lvbklkLFxuICAgICAgYnJpbGxpYW50VXNlZENvdW50OiAwLFxuICAgICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IFtdLFxuICAgIH07XG4gIH1cblxuICByZXNldFRvRGVmYXVsdHMoKTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zID0geyAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyB9O1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0geyAuLi5ERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcgfTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZCkgYXNcbiAgICAgICAgfCBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPlxuICAgICAgICB8IHsgb3B0aW9ucz86IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+OyBicmlsbGlhbnRDb25maWc/OiBQYXJ0aWFsPEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWc+IH07XG5cbiAgICAgIGlmICgnb3B0aW9ucycgaW4gcGFyc2VkIHx8ICdicmlsbGlhbnRDb25maWcnIGluIHBhcnNlZCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZUZlYXR1cmVPcHRpb25zKHBhcnNlZC5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSBtZXJnZUJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcocGFyc2VkLmJyaWxsaWFudENvbmZpZyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyhwYXJzZWQgYXMgUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWxdIEZhaWxlZCB0byByZXN0b3JlIGZlYXR1cmUgb3B0aW9uczonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0VG9TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5wZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgIEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICBicmlsbGlhbnRDb25maWc6IHRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHBlcnNpc3QgZmVhdHVyZSBvcHRpb25zOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0ZlYXR1cmVPcHRpb25zVmlld01vZGVsXSBGYWlsZWQgdG8gY2xlYXIgZmVhdHVyZSBvcHRpb25zIHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3luY1RvTWFpblByb2Nlc3Mob3B0aW9uczogRmVhdHVyZU9wdGlvbnMpOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJpYWxpemFibGVPcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyh7XG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuXG4gICAgd2luZG93LnBlcnNvbmFDaGVzc0JyaWRnZT8uc3luY0ZlYXR1cmVPcHRpb25zKHNlcmlhbGl6YWJsZU9wdGlvbnMpO1xuICB9XG5cbiAgZ2V0IHNlY3VyaXR5RGV2VG9vbHNPbmx5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuc2VjdXJpdHlEZXZUb29sc09ubHk7XG4gIH1cblxuICBnZXQgcGVyc2lzdEVuZ2luZUNvbmZpZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnBlcnNpc3RFbmdpbmVDb25maWc7XG4gIH1cblxuICBnZXQgdXNlRGV0ZXJtaW5pc3RpY1JuZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZURldGVybWluaXN0aWNSbmc7XG4gIH1cblxuICBnZXQgdXNlTW92ZUFuYWx5c2lzQ2FjaGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VNb3ZlQW5hbHlzaXNDYWNoZTtcbiAgfVxuXG4gIGdldCB1c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uO1xuICB9XG5cbiAgZ2V0IHVzZVBvc2l0aW9uQ29tcGxleGl0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZVBvc2l0aW9uQ29tcGxleGl0eTtcbiAgfVxuXG4gIGdldCB1c2VQZXJzb25hQmVoYXZpb3JCaWFzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlUGVyc29uYUJlaGF2aW9yQmlhcztcbiAgfVxuXG4gIGdldCB1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZUh1bWFuRGVsYXlTaW11bGF0aW9uO1xuICB9XG5cbiAgZ2V0IHVzZUJyaWxsaWFudE1vdmVCdWRnZXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0O1xuICB9XG5cbiAgZ2V0IGJyaWxsaWFudE1vdmVzUGVyR2FtZSgpOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWUge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWU7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50QWxsb3dlZFBoYXNlKCk6IEJyaWxsaWFudEFsbG93ZWRQaGFzZSB7XG4gICAgcmV0dXJuIHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudEFsbG93ZWRQaGFzZTtcbiAgfVxuXG4gIGdldCBicmlsbGlhbnRVc2VkQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50O1xuICB9XG5cbiAgZ2V0IGJyaWxsaWFudE1vdmVOdW1iZXJzKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZU51bWJlcnM7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50R2FtZVNlc3Npb25JZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuZ2FtZVNlc3Npb25JZDtcbiAgfVxuXG4gIGdldCBoYXNSZW1haW5pbmdCcmlsbGlhbnRNb3ZlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50IDwgdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCA9IG5ldyBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCgpO1xuIiwgImltcG9ydCB7IENoZXNzLCBQaWVjZVN5bWJvbCB9IGZyb20gJ2NoZXNzLmpzJztcbmltcG9ydCB7IENsYXNzaWZpZWRNb3ZlLCBNb3ZlQnVja2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSYW5kb21Tb3VyY2UgfSBmcm9tICcuL3JhbmRvbSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnJpbGxpYW50TW92ZUNhbmRpZGF0ZSB7XG4gIG1vdmU6IENsYXNzaWZpZWRNb3ZlO1xuICB0YWN0aWNhbFNjb3JlOiBudW1iZXI7XG59XG5cbmNvbnN0IFBJRUNFX1ZBTFVFUzogUmVjb3JkPFBpZWNlU3ltYm9sLCBudW1iZXI+ID0ge1xuICBwOiAxLFxuICBuOiAzLFxuICBiOiAzLFxuICByOiA1LFxuICBxOiA5LFxuICBrOiAwLFxufTtcblxuY29uc3QgQlJJTExJQU5UX0JVQ0tFVFM6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCddO1xuXG5mdW5jdGlvbiBnZXRQaWVjZVZhbHVlKHR5cGU/OiBQaWVjZVN5bWJvbCk6IG51bWJlciB7XG4gIHJldHVybiB0eXBlID8gUElFQ0VfVkFMVUVTW3R5cGVdIDogMDtcbn1cblxuZnVuY3Rpb24gZ2V0VGFjdGljYWxTY29yZShmZW46IHN0cmluZywgbW92ZTogQ2xhc3NpZmllZE1vdmUsIGJlc3RFdmFsdWF0aW9uOiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICBjb25zdCBmcm9tID0gbW92ZS5tb3ZlLnNsaWNlKDAsIDIpO1xuICBjb25zdCB0byA9IG1vdmUubW92ZS5zbGljZSgyLCA0KTtcbiAgY29uc3QgbW92aW5nUGllY2UgPSBjaGVzcy5nZXQoZnJvbSk7XG4gIGNvbnN0IHRhcmdldFBpZWNlID0gY2hlc3MuZ2V0KHRvKTtcbiAgY29uc3QgcGxheWVkTW92ZSA9IGNoZXNzLm1vdmUoe1xuICAgIGZyb20sXG4gICAgdG8sXG4gICAgcHJvbW90aW9uOiBtb3ZlLm1vdmVbNF0gYXMgJ3EnIHwgJ3InIHwgJ2InIHwgJ24nIHwgdW5kZWZpbmVkLFxuICB9KTtcblxuICBpZiAoIXBsYXllZE1vdmUpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGNvbnN0IGlzQ2FwdHVyZSA9IHBsYXllZE1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2MnKSB8fCBwbGF5ZWRNb3ZlLmZsYWdzLmluY2x1ZGVzKCdlJyk7XG4gIGNvbnN0IGlzUHJvbW90aW9uID0gQm9vbGVhbihwbGF5ZWRNb3ZlLnByb21vdGlvbik7XG4gIGNvbnN0IGlzQ2hlY2sgPSBjaGVzcy5pc0NoZWNrKCk7XG4gIGNvbnN0IGV2YWxHYWluID0gTWF0aC5tYXgoMCwgYmVzdEV2YWx1YXRpb24gLSBtb3ZlLmV2YWx1YXRpb24pO1xuICBjb25zdCBtYXRlcmlhbFN3aW5nID0gZ2V0UGllY2VWYWx1ZSh0YXJnZXRQaWVjZT8udHlwZSkgLSBnZXRQaWVjZVZhbHVlKG1vdmluZ1BpZWNlPy50eXBlKTtcbiAgY29uc3QgaXNTYWNyaWZpY2UgPSBpc0NhcHR1cmUgJiYgbWF0ZXJpYWxTd2luZyA8IDA7XG5cbiAgbGV0IHRhY3RpY2FsU2NvcmUgPSAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGlzQ2hlY2sgPyAyIDogMDtcbiAgdGFjdGljYWxTY29yZSArPSBpc0NhcHR1cmUgPyAxLjUgOiAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGlzUHJvbW90aW9uID8gMi41IDogMDtcbiAgdGFjdGljYWxTY29yZSArPSBpc1NhY3JpZmljZSA/IDEuNzUgOiAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGV2YWxHYWluID49IDgwID8gMS41IDogZXZhbEdhaW4gPj0gNDAgPyAwLjc1IDogMDtcblxuICByZXR1cm4gdGFjdGljYWxTY29yZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJyaWxsaWFudE1vdmVDYW5kaWRhdGVzKFxuICBmZW46IHN0cmluZyxcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4pOiBCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlW10ge1xuICBpZiAobW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3QgYmVzdEV2YWx1YXRpb24gPSBtb3Zlc1swXS5ldmFsdWF0aW9uO1xuXG4gIHJldHVybiBtb3Zlc1xuICAgIC5maWx0ZXIobW92ZSA9PiBCUklMTElBTlRfQlVDS0VUUy5pbmNsdWRlcyhtb3ZlLmJ1Y2tldCkpXG4gICAgLm1hcChtb3ZlID0+ICh7XG4gICAgICBtb3ZlLFxuICAgICAgdGFjdGljYWxTY29yZTogZ2V0VGFjdGljYWxTY29yZShmZW4sIG1vdmUsIGJlc3RFdmFsdWF0aW9uKSxcbiAgICB9KSlcbiAgICAuZmlsdGVyKGNhbmRpZGF0ZSA9PiBjYW5kaWRhdGUudGFjdGljYWxTY29yZSA+IDApXG4gICAgLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PiByaWdodC50YWN0aWNhbFNjb3JlIC0gbGVmdC50YWN0aWNhbFNjb3JlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tCcmlsbGlhbnRNb3ZlKFxuICBjYW5kaWRhdGVzOiBCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlW10sXG4gIHJhbmRvbVNvdXJjZTogUmFuZG9tU291cmNlLFxuKTogQ2xhc3NpZmllZE1vdmUgfCBudWxsIHtcbiAgaWYgKGNhbmRpZGF0ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB0b3RhbFdlaWdodCA9IGNhbmRpZGF0ZXMucmVkdWNlKChzdW0sIGNhbmRpZGF0ZSkgPT4gc3VtICsgY2FuZGlkYXRlLnRhY3RpY2FsU2NvcmUsIDApO1xuICBsZXQgc2VsZWN0aW9uID0gcmFuZG9tU291cmNlLm5leHQoKSAqIHRvdGFsV2VpZ2h0O1xuXG4gIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBzZWxlY3Rpb24gLT0gY2FuZGlkYXRlLnRhY3RpY2FsU2NvcmU7XG4gICAgaWYgKHNlbGVjdGlvbiA8PSAwKSB7XG4gICAgICByZXR1cm4gY2FuZGlkYXRlLm1vdmU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNhbmRpZGF0ZXNbY2FuZGlkYXRlcy5sZW5ndGggLSAxXS5tb3ZlO1xufVxuIiwgImltcG9ydCB7IENoZXNzLCBQaWVjZVN5bWJvbCB9IGZyb20gJ2NoZXNzLmpzJztcblxuZXhwb3J0IHR5cGUgR2FtZVBoYXNlID0gJ29wZW5pbmcnIHwgJ21pZGRsZWdhbWUnIHwgJ2VuZGdhbWUnO1xuXG5jb25zdCBQSUVDRV9WQUxVRVM6IFJlY29yZDxQaWVjZVN5bWJvbCwgbnVtYmVyPiA9IHtcbiAgcDogMSxcbiAgbjogMyxcbiAgYjogMyxcbiAgcjogNSxcbiAgcTogOSxcbiAgazogMCxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2FtZVBoYXNlUmVzdWx0IHtcbiAgcGhhc2U6IEdhbWVQaGFzZTtcbiAgdG90YWxNYXRlcmlhbDogbnVtYmVyO1xuICBxdWVlbnNUcmFkZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb3RhbE1hdGVyaWFsKGZlbjogc3RyaW5nKTogbnVtYmVyIHtcbiAgY29uc3QgY2hlc3MgPSBuZXcgQ2hlc3MoZmVuKTtcbiAgcmV0dXJuIGNoZXNzXG4gICAgLmJvYXJkKClcbiAgICAuZmxhdCgpXG4gICAgLnJlZHVjZSgodG90YWwsIHBpZWNlKSA9PiB0b3RhbCArIChwaWVjZSA/IFBJRUNFX1ZBTFVFU1twaWVjZS50eXBlXSA6IDApLCAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFyZVF1ZWVuc1RyYWRlZChmZW46IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICBjb25zdCBxdWVlbnMgPSBjaGVzc1xuICAgIC5ib2FyZCgpXG4gICAgLmZsYXQoKVxuICAgIC5maWx0ZXIocGllY2UgPT4gcGllY2U/LnR5cGUgPT09ICdxJykubGVuZ3RoO1xuXG4gIHJldHVybiBxdWVlbnMgPCAyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0R2FtZVBoYXNlKGZlbjogc3RyaW5nLCBtb3ZlTnVtYmVyOiBudW1iZXIpOiBHYW1lUGhhc2VSZXN1bHQge1xuICBjb25zdCB0b3RhbE1hdGVyaWFsID0gZ2V0VG90YWxNYXRlcmlhbChmZW4pO1xuICBjb25zdCBxdWVlbnNUcmFkZWQgPSBhcmVRdWVlbnNUcmFkZWQoZmVuKTtcblxuICBpZiAobW92ZU51bWJlciA8PSAxMCkge1xuICAgIHJldHVybiB7XG4gICAgICBwaGFzZTogJ29wZW5pbmcnLFxuICAgICAgdG90YWxNYXRlcmlhbCxcbiAgICAgIHF1ZWVuc1RyYWRlZCxcbiAgICB9O1xuICB9XG5cbiAgaWYgKHF1ZWVuc1RyYWRlZCB8fCB0b3RhbE1hdGVyaWFsIDw9IDI0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBoYXNlOiAnZW5kZ2FtZScsXG4gICAgICB0b3RhbE1hdGVyaWFsLFxuICAgICAgcXVlZW5zVHJhZGVkLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBoYXNlOiAnbWlkZGxlZ2FtZScsXG4gICAgdG90YWxNYXRlcmlhbCxcbiAgICBxdWVlbnNUcmFkZWQsXG4gIH07XG59XG4iLCAiaW1wb3J0IHsgQnVja2V0Q29uZmlnLCBNb3ZlQnVja2V0LCBBbmFseXplZE1vdmUgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQge1xuICBsZXZlbDogJ2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJztcbiAgc2NvcmU6IG51bWJlcjtcbiAgc3ByZWFkOiBudW1iZXI7XG4gIGNsb3NlQ2FuZGlkYXRlczogbnVtYmVyO1xuICB2b2xhdGlsaXR5OiBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlOiBudW1iZXIsIG1pbiA9IDAsIG1heCA9IDEpOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5taW4obWF4LCBNYXRoLm1heChtaW4sIHZhbHVlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVQb3NpdGlvbkNvbXBsZXhpdHkoXG4gIG1vdmVzOiBBbmFseXplZE1vdmVbXSxcbik6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPD0gMSkge1xuICAgIHJldHVybiB7XG4gICAgICBsZXZlbDogJ2xvdycsXG4gICAgICBzY29yZTogMCxcbiAgICAgIHNwcmVhZDogMCxcbiAgICAgIGNsb3NlQ2FuZGlkYXRlczogbW92ZXMubGVuZ3RoLFxuICAgICAgdm9sYXRpbGl0eTogMCxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgZXZhbHVhdGlvbnMgPSBtb3Zlcy5tYXAoKG1vdmUpID0+IG1vdmUuZXZhbHVhdGlvbikuc29ydCgoYSwgYikgPT4gYiAtIGEpO1xuICBjb25zdCBiZXN0ID0gZXZhbHVhdGlvbnNbMF07XG4gIGNvbnN0IHNwcmVhZCA9IE1hdGguYWJzKGJlc3QgLSBldmFsdWF0aW9uc1tldmFsdWF0aW9ucy5sZW5ndGggLSAxXSk7XG4gIGNvbnN0IGNsb3NlQ2FuZGlkYXRlcyA9IG1vdmVzLmZpbHRlcigobW92ZSkgPT4gTWF0aC5hYnMoYmVzdCAtIG1vdmUuZXZhbHVhdGlvbikgPD0gMzUpLmxlbmd0aDtcbiAgY29uc3Qgdm9sYXRpbGl0eSA9IG1vdmVzLmxlbmd0aCA+IDFcbiAgICA/IE1hdGguYWJzKGJlc3QgLSBldmFsdWF0aW9uc1tNYXRoLm1pbigyLCBldmFsdWF0aW9ucy5sZW5ndGggLSAxKV0pXG4gICAgOiAwO1xuXG4gIGNvbnN0IHNwcmVhZEZhY3RvciA9IDEgLSBjbGFtcChzcHJlYWQgLyAyNTApO1xuICBjb25zdCBjbG9zZUZhY3RvciA9IGNsYW1wKChjbG9zZUNhbmRpZGF0ZXMgLSAxKSAvIDUpO1xuICBjb25zdCB2b2xhdGlsaXR5RmFjdG9yID0gY2xhbXAodm9sYXRpbGl0eSAvIDE1MCk7XG4gIGNvbnN0IHNjb3JlID0gY2xhbXAoc3ByZWFkRmFjdG9yICogMC40NSArIGNsb3NlRmFjdG9yICogMC4zNSArIHZvbGF0aWxpdHlGYWN0b3IgKiAwLjIpO1xuXG4gIGxldCBsZXZlbDogUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0WydsZXZlbCddID0gJ21lZGl1bSc7XG4gIGlmIChzY29yZSA8IDAuMzMpIGxldmVsID0gJ2xvdyc7XG4gIGlmIChzY29yZSA+IDAuNjYpIGxldmVsID0gJ2hpZ2gnO1xuXG4gIHJldHVybiB7XG4gICAgbGV2ZWwsXG4gICAgc2NvcmUsXG4gICAgc3ByZWFkLFxuICAgIGNsb3NlQ2FuZGlkYXRlcyxcbiAgICB2b2xhdGlsaXR5LFxuICB9O1xufVxuXG5jb25zdCBCVUNLRVRfT1JERVI6IE1vdmVCdWNrZXRbXSA9IFtcbiAgJ2Jlc3QnLFxuICAnZ3JlYXQnLFxuICAnZXhjZWxsZW50JyxcbiAgJ2dvb2QnLFxuICAnaW5hY2N1cmFjeScsXG4gICdtaXN0YWtlJyxcbiAgJ2JsdW5kZXInLFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFkanVzdEJ1Y2tldENvbmZpZ0ZvckNvbXBsZXhpdHkoXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnLFxuICBjb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQsXG4pOiBCdWNrZXRDb25maWcge1xuICBjb25zdCBhZGp1c3RlZCA9IHsgLi4uY29uZmlnIH07XG4gIGNvbnN0IGludGVuc2l0eSA9IGNvbXBsZXhpdHkuc2NvcmU7XG5cbiAgaWYgKGNvbXBsZXhpdHkubGV2ZWwgPT09ICdoaWdoJykge1xuICAgIGFkanVzdGVkLmJlc3QgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5iZXN0IC0gTWF0aC5yb3VuZCg2ICogaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQuZ3JlYXQgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5ncmVhdCAtIE1hdGgucm91bmQoMyAqIGludGVuc2l0eSkpO1xuICAgIGFkanVzdGVkLmluYWNjdXJhY3kgKz0gTWF0aC5yb3VuZCg0ICogaW50ZW5zaXR5KTtcbiAgICBhZGp1c3RlZC5taXN0YWtlICs9IE1hdGgucm91bmQoMyAqIGludGVuc2l0eSk7XG4gICAgYWRqdXN0ZWQuYmx1bmRlciArPSBNYXRoLnJvdW5kKDIgKiBpbnRlbnNpdHkpO1xuICB9IGVsc2UgaWYgKGNvbXBsZXhpdHkubGV2ZWwgPT09ICdsb3cnKSB7XG4gICAgYWRqdXN0ZWQuYmVzdCArPSBNYXRoLnJvdW5kKDUgKiAoMSAtIGludGVuc2l0eSkpO1xuICAgIGFkanVzdGVkLmdyZWF0ICs9IE1hdGgucm91bmQoMyAqICgxIC0gaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQuZXhjZWxsZW50ICs9IE1hdGgucm91bmQoMiAqICgxIC0gaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQubWlzdGFrZSA9IE1hdGgubWF4KDAsIGFkanVzdGVkLm1pc3Rha2UgLSAyKTtcbiAgICBhZGp1c3RlZC5ibHVuZGVyID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuYmx1bmRlciAtIDEpO1xuICB9XG5cbiAgY29uc3QgdG90YWwgPSBCVUNLRVRfT1JERVIucmVkdWNlKChzdW0sIGJ1Y2tldCkgPT4gc3VtICsgYWRqdXN0ZWRbYnVja2V0XSwgMCk7XG4gIGlmICh0b3RhbCA8PSAwKSB7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBCVUNLRVRfT1JERVIucmVkdWNlKChyZXN1bHQsIGJ1Y2tldCkgPT4ge1xuICAgIHJlc3VsdFtidWNrZXRdID0gTWF0aC5yb3VuZCgoYWRqdXN0ZWRbYnVja2V0XSAvIHRvdGFsKSAqIDEwMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSwge30gYXMgQnVja2V0Q29uZmlnKTtcblxuICBjb25zdCBub3JtYWxpemVkVG90YWwgPSBCVUNLRVRfT1JERVIucmVkdWNlKChzdW0sIGJ1Y2tldCkgPT4gc3VtICsgbm9ybWFsaXplZFtidWNrZXRdLCAwKTtcbiAgY29uc3QgZGlmZiA9IDEwMCAtIG5vcm1hbGl6ZWRUb3RhbDtcbiAgbm9ybWFsaXplZC5iZXN0ICs9IGRpZmY7XG5cbiAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG59XG4iLCAiaW1wb3J0IHsgQ2hlc3MgfSBmcm9tICdjaGVzcy5qcyc7XG5pbXBvcnQgeyBQZXJzb25hSWQgfSBmcm9tICcuL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7IENsYXNzaWZpZWRNb3ZlLCBNb3ZlQnVja2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSYW5kb21Tb3VyY2UgfSBmcm9tICcuL3JhbmRvbSc7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQgfSBmcm9tICcuL3Bvc2l0aW9uQ29tcGxleGl0eSc7XG5cbmV4cG9ydCB0eXBlIFBlcnNvbmFCZWhhdmlvck1vZGUgPSAnYWdncmVzc2l2ZScgfCAnc2FmZScgfCAnYmFsYW5jZWQnO1xuXG5jb25zdCBTQUZFX0JVQ0tFVFM6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYTogUGVyc29uYUlkKTogUGVyc29uYUJlaGF2aW9yTW9kZSB7XG4gIGlmIChwZXJzb25hID09PSAnYWdncmVzc2l2ZScpIHtcbiAgICByZXR1cm4gJ2FnZ3Jlc3NpdmUnO1xuICB9XG5cbiAgaWYgKHBlcnNvbmEgPT09ICdoYXJkJyB8fCBwZXJzb25hID09PSAnc3VwZXJfaGFyZCcpIHtcbiAgICByZXR1cm4gJ3NhZmUnO1xuICB9XG5cbiAgcmV0dXJuICdiYWxhbmNlZCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVBlcnNvbmFCdWNrZXRCaWFzKFxuICBjb25maWc6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+LFxuICBwZXJzb25hOiBQZXJzb25hSWQsXG4pOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gIGNvbnN0IG1vZGUgPSBnZXRQZXJzb25hQmVoYXZpb3JNb2RlKHBlcnNvbmEpO1xuICBjb25zdCBhZGp1c3RlZCA9IHsgLi4uY29uZmlnIH07XG5cbiAgaWYgKG1vZGUgPT09ICdhZ2dyZXNzaXZlJykge1xuICAgIGFkanVzdGVkLmdvb2QgKz0gMztcbiAgICBhZGp1c3RlZC5pbmFjY3VyYWN5ICs9IDI7XG4gICAgYWRqdXN0ZWQuYmVzdCA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmJlc3QgLSAzKTtcbiAgICBhZGp1c3RlZC5ncmVhdCA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmdyZWF0IC0gMik7XG4gIH0gZWxzZSBpZiAobW9kZSA9PT0gJ3NhZmUnKSB7XG4gICAgZm9yIChjb25zdCBidWNrZXQgb2YgU0FGRV9CVUNLRVRTKSB7XG4gICAgICBhZGp1c3RlZFtidWNrZXRdICs9IDI7XG4gICAgfVxuICAgIGFkanVzdGVkLm1pc3Rha2UgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5taXN0YWtlIC0gMik7XG4gICAgYWRqdXN0ZWQuYmx1bmRlciA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmJsdW5kZXIgLSAyKTtcbiAgfVxuXG4gIHJldHVybiBhZGp1c3RlZDtcbn1cblxuZnVuY3Rpb24gZ2V0TW92ZVRyYWl0U2NvcmUoZmVuOiBzdHJpbmcsIG1vdmVVY2k6IHN0cmluZywgcGVyc29uYTogUGVyc29uYUlkKTogbnVtYmVyIHtcbiAgY29uc3QgbW9kZSA9IGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYSk7XG4gIGlmIChtb2RlID09PSAnYmFsYW5jZWQnKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICBjb25zdCBtb3ZlID0gY2hlc3MubW92ZSh7XG4gICAgZnJvbTogbW92ZVVjaS5zbGljZSgwLCAyKSxcbiAgICB0bzogbW92ZVVjaS5zbGljZSgyLCA0KSxcbiAgICBwcm9tb3Rpb246IG1vdmVVY2lbNF0gYXMgJ3EnIHwgJ3InIHwgJ2InIHwgJ24nIHwgdW5kZWZpbmVkLFxuICB9KTtcblxuICBpZiAoIW1vdmUpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IGlzQ2FwdHVyZSA9IG1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2MnKSB8fCBtb3ZlLmZsYWdzLmluY2x1ZGVzKCdlJyk7XG4gIGNvbnN0IGlzUHJvbW90aW9uID0gQm9vbGVhbihtb3ZlLnByb21vdGlvbik7XG4gIGNvbnN0IGlzQ2FzdGxlID0gbW92ZS5mbGFncy5pbmNsdWRlcygnaycpIHx8IG1vdmUuZmxhZ3MuaW5jbHVkZXMoJ3EnKTtcbiAgY29uc3QgaXNDaGVjayA9IGNoZXNzLmlzQ2hlY2soKTtcblxuICBpZiAobW9kZSA9PT0gJ2FnZ3Jlc3NpdmUnKSB7XG4gICAgcmV0dXJuIDFcbiAgICAgICsgKGlzQ2FwdHVyZSA/IDAuMzUgOiAwKVxuICAgICAgKyAoaXNDaGVjayA/IDAuMzUgOiAwKVxuICAgICAgKyAoaXNQcm9tb3Rpb24gPyAwLjQ1IDogMClcbiAgICAgICsgKGlzQ2FzdGxlID8gMC4wNSA6IDApO1xuICB9XG5cbiAgcmV0dXJuIDFcbiAgICArIChpc0Nhc3RsZSA/IDAuMiA6IDApXG4gICAgKyAoIWlzQ2FwdHVyZSA/IDAuMSA6IDApXG4gICAgLSAoaXNQcm9tb3Rpb24gPyAwLjA1IDogMCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWNrUGVyc29uYUJpYXNlZE1vdmUoXG4gIGZlbjogc3RyaW5nLFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgcGVyc29uYTogUGVyc29uYUlkLFxuICByYW5kb21Tb3VyY2U6IFJhbmRvbVNvdXJjZSxcbik6IENsYXNzaWZpZWRNb3ZlIHtcbiAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBtb3Zlc1swXTtcbiAgfVxuXG4gIGNvbnN0IHdlaWdodGVkTW92ZXMgPSBtb3Zlcy5tYXAoKG1vdmUpID0+ICh7XG4gICAgbW92ZSxcbiAgICB3ZWlnaHQ6IE1hdGgubWF4KDAuMSwgZ2V0TW92ZVRyYWl0U2NvcmUoZmVuLCBtb3ZlLm1vdmUsIHBlcnNvbmEpKSxcbiAgfSkpO1xuICBjb25zdCB0b3RhbFdlaWdodCA9IHdlaWdodGVkTW92ZXMucmVkdWNlKChzdW0sIGVudHJ5KSA9PiBzdW0gKyBlbnRyeS53ZWlnaHQsIDApO1xuICBsZXQgc2VsZWN0aW9uID0gcmFuZG9tU291cmNlLm5leHQoKSAqIHRvdGFsV2VpZ2h0O1xuXG4gIGZvciAoY29uc3QgZW50cnkgb2Ygd2VpZ2h0ZWRNb3Zlcykge1xuICAgIHNlbGVjdGlvbiAtPSBlbnRyeS53ZWlnaHQ7XG4gICAgaWYgKHNlbGVjdGlvbiA8PSAwKSB7XG4gICAgICByZXR1cm4gZW50cnkubW92ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gd2VpZ2h0ZWRNb3Zlc1t3ZWlnaHRlZE1vdmVzLmxlbmd0aCAtIDFdLm1vdmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVIdW1hbkRlbGF5TXMob3B0aW9uczoge1xuICBjb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQgfCBudWxsO1xuICBwZXJzb25hOiBQZXJzb25hSWQ7XG4gIGJ1Y2tldDogTW92ZUJ1Y2tldDtcbn0pOiBudW1iZXIge1xuICBjb25zdCB7IGNvbXBsZXhpdHksIHBlcnNvbmEsIGJ1Y2tldCB9ID0gb3B0aW9ucztcbiAgY29uc3QgbW9kZSA9IGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYSk7XG4gIGNvbnN0IGJhc2UgPSAzNTA7XG4gIGNvbnN0IGNvbXBsZXhpdHlEZWxheSA9IGNvbXBsZXhpdHkgPyBNYXRoLnJvdW5kKDkwMCAqIGNvbXBsZXhpdHkuc2NvcmUpIDogMDtcbiAgY29uc3QgcGVyc29uYURlbGF5ID0gbW9kZSA9PT0gJ3NhZmUnID8gMjIwIDogbW9kZSA9PT0gJ2FnZ3Jlc3NpdmUnID8gODAgOiAxNDA7XG4gIGNvbnN0IGJ1Y2tldERlbGF5ID1cbiAgICBidWNrZXQgPT09ICdiZXN0JyB8fCBidWNrZXQgPT09ICdncmVhdCdcbiAgICAgID8gMTIwXG4gICAgICA6IGJ1Y2tldCA9PT0gJ21pc3Rha2UnIHx8IGJ1Y2tldCA9PT0gJ2JsdW5kZXInXG4gICAgICAgID8gNDBcbiAgICAgICAgOiA4MDtcblxuICByZXR1cm4gYmFzZSArIGNvbXBsZXhpdHlEZWxheSArIHBlcnNvbmFEZWxheSArIGJ1Y2tldERlbGF5O1xufVxuIiwgIi8qKlxuICogRW5naW5lIFZpZXdNb2RlbFxuICogVmlld01vZGVsIGxheWVyIC0gTW9iWCBzdG9yZSBmb3IgU3RvY2tmaXNoIGVuZ2luZSBzdGF0ZVxuICovXG5cbmltcG9ydCB7IG1ha2VBdXRvT2JzZXJ2YWJsZSwgYWN0aW9uLCBydW5JbkFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgQW5hbHlzaXNQdXJwb3NlLFxuICBBbmFseXNpc1NuYXBzaG90LFxuICBpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0LFxufSBmcm9tICcuLi9lbmdpbmUvYW5hbHlzaXNTYWZldHknO1xuaW1wb3J0IHsgRW5naW5lQ29vcmRpbmF0b3IsIGVuZ2luZUNvb3JkaW5hdG9yLCBFbmdpbmVMYW5lIH0gZnJvbSAnLi4vZW5naW5lL2VuZ2luZUNvb3JkaW5hdG9yJztcbmltcG9ydCB7IGNsYXNzaWZ5TW92ZXMsIGdldE1vdmVTdGF0cywgZ3JvdXBNb3Zlc0J5QnVja2V0IH0gZnJvbSAnLi4vZW5naW5lL21vdmVDbGFzc2lmaWVyJztcbmltcG9ydCB7XG4gIHBpY2tCdWNrZXRMZWdhY3ksXG4gIHBpY2tCdWNrZXRXaXRoQ2xvc2VzdEZhbGxiYWNrLFxuICBwaWNrUmFuZG9tTW92ZUZyb21CdWNrZXQsXG59IGZyb20gJy4uL2VuZ2luZS9tb3ZlUGlja2VyJztcbmltcG9ydCB7IFxuICBBbmFseXplZE1vdmUsXG4gIENsYXNzaWZpZWRNb3ZlLCBcbiAgUGlja2VkTW92ZVJlc3VsdCwgXG4gIE1vdmVCdWNrZXQsXG4gIEJ1Y2tldENvbmZpZyxcbn0gZnJvbSAnLi4vZW5naW5lL3R5cGVzJztcbmltcG9ydCB7IGFuYWx5c2lzQ2FjaGUsIGJ1aWxkQW5hbHlzaXNDYWNoZUtleSB9IGZyb20gJy4uL2VuZ2luZS9hbmFseXNpc0NhY2hlJztcbmltcG9ydCB7IGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gZnJvbSAnLi9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCc7XG5pbXBvcnQgeyBnZXRCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlcywgcGlja0JyaWxsaWFudE1vdmUgfSBmcm9tICcuLi9lbmdpbmUvYnJpbGxpYW50TW92ZSc7XG5pbXBvcnQgeyBkZXRlY3RHYW1lUGhhc2UgfSBmcm9tICcuLi9lbmdpbmUvZ2FtZVBoYXNlJztcbmltcG9ydCB7XG4gIGFkanVzdEJ1Y2tldENvbmZpZ0ZvckNvbXBsZXhpdHksXG4gIGNhbGN1bGF0ZVBvc2l0aW9uQ29tcGxleGl0eSxcbiAgUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0LFxufSBmcm9tICcuLi9lbmdpbmUvcG9zaXRpb25Db21wbGV4aXR5JztcbmltcG9ydCB7XG4gIGFwcGx5UGVyc29uYUJ1Y2tldEJpYXMsXG4gIHBpY2tQZXJzb25hQmlhc2VkTW92ZSxcbn0gZnJvbSAnLi4vZW5naW5lL3BlcnNvbmFCaWFzJztcbmltcG9ydCB7XG4gIGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQsXG4gIGNyZWF0ZUxlZ2FjeVJhbmRvbVNvdXJjZSxcbiAgY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlLFxufSBmcm9tICcuLi9lbmdpbmUvcmFuZG9tJztcbmltcG9ydCB7IFBlcnNvbmFJZCB9IGZyb20gJy4uL2VuZ2luZS9mZWF0dXJlT3B0aW9ucyc7XG5pbXBvcnQgeyBjcmVhdGVEZWJ1Z0xvZ2dlciB9IGZyb20gJy4uL3NoYXJlZC9kZWJ1Zyc7XG5cbmludGVyZmFjZSBNb3ZlU2VsZWN0aW9uQ29udGV4dCB7XG4gIGZlbjogc3RyaW5nO1xuICBnYW1lU3RhcnRGZW46IHN0cmluZztcbiAgbW92ZUNvdW50OiBudW1iZXI7XG4gIHNpZGVUb01vdmU6ICd3JyB8ICdiJztcbiAgcGVyc29uYTogUGVyc29uYUlkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBvc2l0aW9uQW5hbHlzaXNSZXN1bHQgZXh0ZW5kcyBBbmFseXNpc1NuYXBzaG90PENsYXNzaWZpZWRNb3ZlW10+IHtcbiAgY29tcGxleGl0eTogUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0O1xuICBpZ25vcmVkOiBib29sZWFuO1xuICBmcm9tQ2FjaGU6IGJvb2xlYW47XG4gIHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZTtcbn1cblxuaW50ZXJmYWNlIEFjdGl2ZUFuYWx5c2lzUnVuIHtcbiAgY2FjaGVLZXk6IHN0cmluZztcbiAgZmVuOiBzdHJpbmc7XG4gIHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZTtcbiAgcHJvbWlzZTogUHJvbWlzZTxQb3NpdGlvbkFuYWx5c2lzUmVzdWx0Pjtcbn1cblxuaW50ZXJmYWNlIEVuZ2luZVZpZXdNb2RlbERlcGVuZGVuY2llcyB7XG4gIGNvb3JkaW5hdG9yPzogRW5naW5lQ29vcmRpbmF0b3I7XG59XG5cbmNvbnN0IGxvZ2dlciA9IGNyZWF0ZURlYnVnTG9nZ2VyKCdFbmdpbmVWaWV3TW9kZWwnKTtcblxuZnVuY3Rpb24gY2FuVXNlQnJpbGxpYW50TW92ZUJ1ZGdldChtb3ZlQ291bnQ6IG51bWJlciwgZmVuOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5oYXNSZW1haW5pbmdCcmlsbGlhbnRNb3Zlcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3Zlc1BlckdhbWUgPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBwaGFzZSA9IGRldGVjdEdhbWVQaGFzZShmZW4sIG1vdmVDb3VudCkucGhhc2U7XG4gIHJldHVybiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRBbGxvd2VkUGhhc2UgPT09ICdhbnknXG4gICAgfHwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50QWxsb3dlZFBoYXNlID09PSBwaGFzZTtcbn1cblxuZXhwb3J0IGNsYXNzIEVuZ2luZVZpZXdNb2RlbCB7XG4gIGlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgaXNJbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgYW5hbHl6ZWRNb3ZlczogQ2xhc3NpZmllZE1vdmVbXSA9IFtdO1xuICBsYXN0UGlja2VkTW92ZTogUGlja2VkTW92ZVJlc3VsdCB8IG51bGwgPSBudWxsO1xuICBlcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGxhc3RDb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQgfCBudWxsID0gbnVsbDtcbiAgbGFzdEFuYWx5c2lzRnJvbUNhY2hlID0gZmFsc2U7XG4gIGxhc3RBbmFseXNpc1B1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSB8IG51bGwgPSBudWxsO1xuICBpc01vdmVMYW5lQW5hbHl6aW5nID0gZmFsc2U7XG4gIGlzQmFja2dyb3VuZEFuYWx5emluZyA9IGZhbHNlO1xuICBwcml2YXRlIG5leHRSZXF1ZXN0SWRzOiBSZWNvcmQ8QW5hbHlzaXNQdXJwb3NlLCBudW1iZXI+ID0ge1xuICAgIGVuZ2luZU1vdmU6IDAsXG4gICAgYmFja2dyb3VuZDogMCxcbiAgfTtcbiAgcHJpdmF0ZSBsYXRlc3RSZXF1ZXN0SWRzOiBSZWNvcmQ8QW5hbHlzaXNQdXJwb3NlLCBudW1iZXI+ID0ge1xuICAgIGVuZ2luZU1vdmU6IDAsXG4gICAgYmFja2dyb3VuZDogMCxcbiAgfTtcbiAgcHJpdmF0ZSBhY3RpdmVBbmFseXNpc1J1bnM6IFJlY29yZDxBbmFseXNpc1B1cnBvc2UsIEFjdGl2ZUFuYWx5c2lzUnVuIHwgbnVsbD4gPSB7XG4gICAgZW5naW5lTW92ZTogbnVsbCxcbiAgICBiYWNrZ3JvdW5kOiBudWxsLFxuICB9O1xuICBwcml2YXRlIHJlYWRvbmx5IGNvb3JkaW5hdG9yOiBFbmdpbmVDb29yZGluYXRvcjtcblxuICBjb25zdHJ1Y3RvcihkZXBlbmRlbmNpZXM6IEVuZ2luZVZpZXdNb2RlbERlcGVuZGVuY2llcyA9IHt9KSB7XG4gICAgdGhpcy5jb29yZGluYXRvciA9IGRlcGVuZGVuY2llcy5jb29yZGluYXRvciA/PyBlbmdpbmVDb29yZGluYXRvcjtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgaW5pdGlhbGl6ZTogYWN0aW9uLFxuICAgICAgYW5hbHl6ZVBvc2l0aW9uOiBhY3Rpb24sXG4gICAgICBwaWNrTW92ZUZyb21BbmFseXNpczogYWN0aW9uLFxuICAgICAgcmVzZXQ6IGFjdGlvbixcbiAgICAgIHJlc3RhcnQ6IGFjdGlvbixcbiAgICAgIHNldEVycm9yOiBhY3Rpb24sXG4gICAgfSk7XG4gICAgXG4gICAgbG9nZ2VyLmRlYnVnKCdJbml0aWFsaXplZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgdGhlIFN0b2NrZmlzaCBlbmdpbmVcbiAgICovXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuaXNJbml0aWFsaXplZCkge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdBbHJlYWR5IGluaXRpYWxpemVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXppbmcgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgICBhd2FpdCB0aGlzLmNvb3JkaW5hdG9yLmluaXRpYWxpemUoKTtcbiAgICAgIFxuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzSW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnSW5pdGlhbGl6YXRpb24gY29tcGxldGUnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignSW5pdGlhbGl6YXRpb24gZXJyb3I6JywgZXJyKTtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGBGYWlsZWQgdG8gaW5pdGlhbGl6ZSBlbmdpbmU6ICR7ZXJyfWA7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgZW5naW5lIHNldHRpbmdzXG4gICAqL1xuICBjb25maWd1cmUob3B0aW9uczogeyBtdWx0aVBWPzogbnVtYmVyOyBkZXB0aD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdDb25maWd1cmluZzonLCBvcHRpb25zKTtcbiAgICB0aGlzLmNvb3JkaW5hdG9yLmNvbmZpZ3VyZSgnbW92ZScsIG9wdGlvbnMpO1xuICAgIHRoaXMuY29vcmRpbmF0b3IuY29uZmlndXJlKCdhbmFseXNpcycsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuYWx5emUgYSBwb3NpdGlvbiBhbmQgY2xhc3NpZnkgbW92ZXNcbiAgICovXG4gIGFzeW5jIGFuYWx5emVQb3NpdGlvbihcbiAgICBmZW46IHN0cmluZyxcbiAgICBkZXB0aCA9IDIwLFxuICAgIG11bHRpUFYgPSAxMixcbiAgICBwdXJwb3NlOiBBbmFseXNpc1B1cnBvc2UgPSAnYmFja2dyb3VuZCcsXG4gICk6IFByb21pc2U8UG9zaXRpb25BbmFseXNpc1Jlc3VsdD4ge1xuICAgIGxvZ2dlci5kZWJ1ZygnYW5hbHl6ZVBvc2l0aW9uIGNhbGxlZCcsIHsgZmVuLCBkZXB0aCwgbXVsdGlQViwgcHVycG9zZSB9KTtcbiAgICBjb25zdCBsYW5lID0gdGhpcy5nZXRMYW5lRm9yUHVycG9zZShwdXJwb3NlKTtcblxuICAgIGlmICghdGhpcy5pc0luaXRpYWxpemVkKSB7XG4gICAgICBhd2FpdCB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgY2FjaGVLZXkgPSBidWlsZEFuYWx5c2lzQ2FjaGVLZXkoZmVuLCBkZXB0aCwgbXVsdGlQVik7XG4gICAgICBjb25zdCByZXF1ZXN0SWQgPSArK3RoaXMubmV4dFJlcXVlc3RJZHNbcHVycG9zZV07XG4gICAgICB0aGlzLmxhdGVzdFJlcXVlc3RJZHNbcHVycG9zZV0gPSByZXF1ZXN0SWQ7XG5cbiAgICAgIGNvbnN0IGFjdGl2ZVJ1biA9IHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zW3B1cnBvc2VdO1xuICAgICAgaWYgKGFjdGl2ZVJ1bikge1xuICAgICAgICBpZiAoYWN0aXZlUnVuLmNhY2hlS2V5ID09PSBjYWNoZUtleSkge1xuICAgICAgICAgIGNvbnN0IHNoYXJlZFJlc3VsdCA9IGF3YWl0IGFjdGl2ZVJ1bi5wcm9taXNlO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5zaGFyZWRSZXN1bHQsXG4gICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICBwdXJwb3NlLFxuICAgICAgICAgICAgaWdub3JlZDogaXNTdGFsZUFuYWx5c2lzUmVxdWVzdChyZXF1ZXN0SWQsIHRoaXMubGF0ZXN0UmVxdWVzdElkc1twdXJwb3NlXSkgfHwgc2hhcmVkUmVzdWx0Lmlnbm9yZWQsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwdXJwb3NlID09PSAnZW5naW5lTW92ZScpIHtcbiAgICAgICAgICB0aGlzLmludmFsaWRhdGVQdXJwb3NlUmVxdWVzdChwdXJwb3NlKTtcbiAgICAgICAgICB0aGlzLmNvb3JkaW5hdG9yLnN0b3AobGFuZSk7XG4gICAgICAgICAgYXdhaXQgYWN0aXZlUnVuLnByb21pc2UuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwdXJwb3NlID09PSAnYmFja2dyb3VuZCcpIHtcbiAgICAgICAgICBhd2FpdCBhY3RpdmVSdW4ucHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRMYW5lQW5hbHl6aW5nKHB1cnBvc2UsIHRydWUpO1xuICAgICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICAgICAgaWYgKHB1cnBvc2UgPT09ICdlbmdpbmVNb3ZlJykge1xuICAgICAgICAgIHRoaXMuYW5hbHl6ZWRNb3ZlcyA9IFtdO1xuICAgICAgICAgIHRoaXMubGFzdFBpY2tlZE1vdmUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcnVuUHJvbWlzZSA9IHRoaXMucGVyZm9ybVBvc2l0aW9uQW5hbHlzaXMoe1xuICAgICAgICBmZW4sXG4gICAgICAgIGRlcHRoLFxuICAgICAgICBtdWx0aVBWLFxuICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICBwdXJwb3NlLFxuICAgICAgICBsYW5lLFxuICAgICAgfSk7XG4gICAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuc1twdXJwb3NlXSA9IHtcbiAgICAgICAgY2FjaGVLZXksXG4gICAgICAgIGZlbixcbiAgICAgICAgcHVycG9zZSxcbiAgICAgICAgcHJvbWlzZTogcnVuUHJvbWlzZSxcbiAgICAgIH07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBydW5Qcm9taXNlO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zW3B1cnBvc2VdPy5wcm9taXNlID09PSBydW5Qcm9taXNlKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVBbmFseXNpc1J1bnNbcHVycG9zZV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0FuYWx5c2lzIGVycm9yOicsIGVycik7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBgQW5hbHlzaXMgZmFpbGVkOiAke2Vycn1gO1xuICAgICAgICB0aGlzLnNldExhbmVBbmFseXppbmcocHVycG9zZSwgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBpY2sgYSBtb3ZlIGZyb20gdGhlIGFuYWx5emVkIG1vdmVzIHVzaW5nIGJ1Y2tldCBjb25maWd1cmF0aW9uXG4gICAqL1xuICBwaWNrTW92ZUZyb21BbmFseXNpcyhcbiAgICBhbmFseXNpczogUG9zaXRpb25BbmFseXNpc1Jlc3VsdCxcbiAgICBjb25maWc6IEJ1Y2tldENvbmZpZyxcbiAgICBjb250ZXh0OiBNb3ZlU2VsZWN0aW9uQ29udGV4dCxcbiAgKTogUGlja2VkTW92ZVJlc3VsdCB8IG51bGwge1xuICAgIGxvZ2dlci5kZWJ1ZygncGlja01vdmVGcm9tQW5hbHlzaXMgY2FsbGVkJywge1xuICAgICAgYW5hbHl6ZWRNb3Zlc0NvdW50OiBhbmFseXNpcy5tb3Zlcy5sZW5ndGgsXG4gICAgICBjb25maWcgXG4gICAgfSk7XG4gICAgXG4gICAgaWYgKGFuYWx5c2lzLmlnbm9yZWQgfHwgYW5hbHlzaXMubW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBsb2dnZXIuZGVidWcoJ05vIGFuYWx5emVkIG1vdmVzIGF2YWlsYWJsZScpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcmFuZG9tU291cmNlID0gZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlRGV0ZXJtaW5pc3RpY1JuZ1xuICAgICAgPyBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2UoXG4gICAgICAgICAgYnVpbGREZXRlcm1pbmlzdGljU2VlZCh7XG4gICAgICAgICAgICBnYW1lU3RhcnRGZW46IGNvbnRleHQuZ2FtZVN0YXJ0RmVuLFxuICAgICAgICAgICAgY3VycmVudEZlbjogY29udGV4dC5mZW4sXG4gICAgICAgICAgICBtb3ZlQ291bnQ6IGNvbnRleHQubW92ZUNvdW50LFxuICAgICAgICAgICAgc2lkZVRvTW92ZTogY29udGV4dC5zaWRlVG9Nb3ZlLFxuICAgICAgICAgICAgcGVyc29uYTogY29udGV4dC5wZXJzb25hLFxuICAgICAgICAgIH0pLFxuICAgICAgICApXG4gICAgICA6IGNyZWF0ZUxlZ2FjeVJhbmRvbVNvdXJjZSgpO1xuXG4gICAgbGV0IGVmZmVjdGl2ZUNvbmZpZzogQnVja2V0Q29uZmlnID0geyAuLi5jb25maWcgfTtcblxuICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VQb3NpdGlvbkNvbXBsZXhpdHkpIHtcbiAgICAgIGVmZmVjdGl2ZUNvbmZpZyA9IGFkanVzdEJ1Y2tldENvbmZpZ0ZvckNvbXBsZXhpdHkoZWZmZWN0aXZlQ29uZmlnLCBhbmFseXNpcy5jb21wbGV4aXR5KTtcbiAgICB9XG5cbiAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlUGVyc29uYUJlaGF2aW9yQmlhcykge1xuICAgICAgZWZmZWN0aXZlQ29uZmlnID0gYXBwbHlQZXJzb25hQnVja2V0QmlhcyhlZmZlY3RpdmVDb25maWcsIGNvbnRleHQucGVyc29uYSkgYXMgQnVja2V0Q29uZmlnO1xuICAgIH1cblxuICAgIGlmIChjYW5Vc2VCcmlsbGlhbnRNb3ZlQnVkZ2V0KGNvbnRleHQubW92ZUNvdW50LCBjb250ZXh0LmZlbikpIHtcbiAgICAgIGNvbnN0IGJyaWxsaWFudENhbmRpZGF0ZXMgPSBnZXRCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlcyhjb250ZXh0LmZlbiwgYW5hbHlzaXMubW92ZXMpO1xuICAgICAgY29uc3Qgc2hvdWxkUGlja0JyaWxsaWFudCA9IGJyaWxsaWFudENhbmRpZGF0ZXMubGVuZ3RoID4gMCAmJiByYW5kb21Tb3VyY2UubmV4dCgpIDwgMC4zNTtcblxuICAgICAgaWYgKHNob3VsZFBpY2tCcmlsbGlhbnQpIHtcbiAgICAgICAgY29uc3QgYnJpbGxpYW50TW92ZSA9IHBpY2tCcmlsbGlhbnRNb3ZlKGJyaWxsaWFudENhbmRpZGF0ZXMsIHJhbmRvbVNvdXJjZSk7XG5cbiAgICAgICAgaWYgKGJyaWxsaWFudE1vdmUpIHtcbiAgICAgICAgICBjb25zdCBicmlsbGlhbnRSZXN1bHQgPSB7XG4gICAgICAgICAgICBtb3ZlOiBicmlsbGlhbnRNb3ZlLFxuICAgICAgICAgICAgYnVja2V0OiBicmlsbGlhbnRNb3ZlLmJ1Y2tldCxcbiAgICAgICAgICAgIGlzQnJpbGxpYW50OiB0cnVlLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RQaWNrZWRNb3ZlID0gYnJpbGxpYW50UmVzdWx0O1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIGJyaWxsaWFudFJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGJ1Y2tldFNlbGVjdGlvbiA9IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uXG4gICAgICA/IHBpY2tCdWNrZXRXaXRoQ2xvc2VzdEZhbGxiYWNrKGFuYWx5c2lzLm1vdmVzLCBlZmZlY3RpdmVDb25maWcsICgpID0+IHJhbmRvbVNvdXJjZS5uZXh0KCkpXG4gICAgICA6IHBpY2tCdWNrZXRMZWdhY3koYW5hbHlzaXMubW92ZXMsIGVmZmVjdGl2ZUNvbmZpZywgKCkgPT4gcmFuZG9tU291cmNlLm5leHQoKSk7XG5cbiAgICBpZiAoIWJ1Y2tldFNlbGVjdGlvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0ZWRNb3ZlID0gZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlUGVyc29uYUJlaGF2aW9yQmlhc1xuICAgICAgPyBwaWNrUGVyc29uYUJpYXNlZE1vdmUoY29udGV4dC5mZW4sIGJ1Y2tldFNlbGVjdGlvbi5tb3ZlcywgY29udGV4dC5wZXJzb25hLCByYW5kb21Tb3VyY2UpXG4gICAgICA6IHBpY2tSYW5kb21Nb3ZlRnJvbUJ1Y2tldChidWNrZXRTZWxlY3Rpb24sICgpID0+IHJhbmRvbVNvdXJjZS5uZXh0KCkpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgbW92ZTogc2VsZWN0ZWRNb3ZlLFxuICAgICAgYnVja2V0OiBidWNrZXRTZWxlY3Rpb24uYnVja2V0LFxuICAgICAgaXNCcmlsbGlhbnQ6IGZhbHNlLFxuICAgIH07XG4gICAgbG9nZ2VyLmRlYnVnKCdQaWNrZWQgbW92ZTonLCByZXN1bHQpO1xuICAgIFxuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMubGFzdFBpY2tlZE1vdmUgPSByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgY3VycmVudCBhbmFseXNpc1xuICAgKi9cbiAgc3RvcEFuYWx5c2lzKCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1Zygnc3RvcEFuYWx5c2lzIGNhbGxlZCcpO1xuICAgIHRoaXMuY29vcmRpbmF0b3Iuc3RvcCgpO1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMuaXNNb3ZlTGFuZUFuYWx5emluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5pc0JhY2tncm91bmRBbmFseXppbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgICB0aGlzLmludmFsaWRhdGVQZW5kaW5nUmVxdWVzdHMoKTtcbiAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVucy5lbmdpbmVNb3ZlID0gbnVsbDtcbiAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVucy5iYWNrZ3JvdW5kID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIG5ldyBnYW1lXG4gICAqL1xuICBuZXdHYW1lKCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZygnbmV3R2FtZSBjYWxsZWQnKTtcbiAgICB0aGlzLmNvb3JkaW5hdG9yLm5ld0dhbWUoKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZygncmVzdGFydCBjYWxsZWQnKTtcbiAgICB0aGlzLmNvb3JkaW5hdG9yLnJlc3RhcnQoKTtcbiAgICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgc3RhdGVcbiAgICovXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZygncmVzZXQgY2FsbGVkJyk7XG4gICAgdGhpcy5jb29yZGluYXRvci5zdG9wKCk7XG4gICAgdGhpcy5pbnZhbGlkYXRlUGVuZGluZ1JlcXVlc3RzKCk7XG4gICAgdGhpcy5hY3RpdmVBbmFseXNpc1J1bnMuZW5naW5lTW92ZSA9IG51bGw7XG4gICAgdGhpcy5hY3RpdmVBbmFseXNpc1J1bnMuYmFja2dyb3VuZCA9IG51bGw7XG4gICAgdGhpcy5hbmFseXplZE1vdmVzID0gW107XG4gICAgdGhpcy5sYXN0UGlja2VkTW92ZSA9IG51bGw7XG4gICAgdGhpcy5sYXN0Q29tcGxleGl0eSA9IG51bGw7XG4gICAgdGhpcy5sYXN0QW5hbHlzaXNGcm9tQ2FjaGUgPSBmYWxzZTtcbiAgICB0aGlzLmxhc3RBbmFseXNpc1B1cnBvc2UgPSBudWxsO1xuICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgIHRoaXMuaXNNb3ZlTGFuZUFuYWx5emluZyA9IGZhbHNlO1xuICAgIHRoaXMuaXNCYWNrZ3JvdW5kQW5hbHl6aW5nID0gZmFsc2U7XG4gICAgdGhpcy5pc0luaXRpYWxpemluZyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBlcnJvciBtZXNzYWdlXG4gICAqL1xuICBzZXRFcnJvcihtZXNzYWdlOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5lcnJvciA9IG1lc3NhZ2U7XG4gIH1cblxuICAvKipcbiAgICogR2V0IG1vdmUgc3RhdGlzdGljcyBieSBidWNrZXRcbiAgICovXG4gIGdldCBtb3ZlU3RhdHMoKTogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICAgIHJldHVybiBnZXRNb3ZlU3RhdHModGhpcy5hbmFseXplZE1vdmVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbW92ZXMgZ3JvdXBlZCBieSBidWNrZXRcbiAgICovXG4gIGdldCBtb3Zlc0J5QnVja2V0KCk6IE1hcDxNb3ZlQnVja2V0LCBDbGFzc2lmaWVkTW92ZVtdPiB7XG4gICAgcmV0dXJuIGdyb3VwTW92ZXNCeUJ1Y2tldCh0aGlzLmFuYWx5emVkTW92ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYmVzdCBtb3ZlIChpZiBhdmFpbGFibGUpXG4gICAqL1xuICBnZXQgYmVzdE1vdmUoKTogQ2xhc3NpZmllZE1vdmUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5hbmFseXplZE1vdmVzLmxlbmd0aCA+IDAgPyB0aGlzLmFuYWx5emVkTW92ZXNbMF0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZXJlIGFyZSBhbmFseXplZCBtb3Zlc1xuICAgKi9cbiAgZ2V0IGhhc0FuYWx5emVkTW92ZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYW5hbHl6ZWRNb3Zlcy5sZW5ndGggPiAwO1xuICB9XG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBlbmdpbmVcbiAgICovXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdkZXN0cm95IGNhbGxlZCcpO1xuICAgIHRoaXMuY29vcmRpbmF0b3IuZGVzdHJveSgpO1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwZXJmb3JtUG9zaXRpb25BbmFseXNpcyhvcHRpb25zOiB7XG4gICAgZmVuOiBzdHJpbmc7XG4gICAgZGVwdGg6IG51bWJlcjtcbiAgICBtdWx0aVBWOiBudW1iZXI7XG4gICAgY2FjaGVLZXk6IHN0cmluZztcbiAgICByZXF1ZXN0SWQ6IG51bWJlcjtcbiAgICBwdXJwb3NlOiBBbmFseXNpc1B1cnBvc2U7XG4gICAgbGFuZTogRW5naW5lTGFuZTtcbiAgfSk6IFByb21pc2U8UG9zaXRpb25BbmFseXNpc1Jlc3VsdD4ge1xuICAgIGNvbnN0IHsgZmVuLCBkZXB0aCwgbXVsdGlQViwgY2FjaGVLZXksIHJlcXVlc3RJZCwgcHVycG9zZSwgbGFuZSB9ID0gb3B0aW9ucztcbiAgICBsZXQgY2FjaGVkQ2xhc3NpZmllZE1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdIHwgdW5kZWZpbmVkO1xuICAgIGxldCBmcm9tQ2FjaGUgPSBmYWxzZTtcbiAgICBsZXQgbW92ZXM6IEFuYWx5emVkTW92ZVtdID0gW107XG5cbiAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlTW92ZUFuYWx5c2lzQ2FjaGUpIHtcbiAgICAgIGNvbnN0IGNhY2hlZCA9IGFuYWx5c2lzQ2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICAgIGlmIChjYWNoZWQpIHtcbiAgICAgICAgbW92ZXMgPSBjYWNoZWQubW92ZXM7XG4gICAgICAgIGNhY2hlZENsYXNzaWZpZWRNb3ZlcyA9IGNhY2hlZC5jbGFzc2lmaWVkTW92ZXM7XG4gICAgICAgIGZyb21DYWNoZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5jb29yZGluYXRvci5jb25maWd1cmUobGFuZSwgeyBkZXB0aCwgbXVsdGlQViB9KTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnU3RhcnRpbmcgYW5hbHlzaXMuLi4nKTtcbiAgICAgIG1vdmVzID0gYXdhaXQgdGhpcy5jb29yZGluYXRvci5hbmFseXplUG9zaXRpb24obGFuZSwgZmVuKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnQW5hbHlzaXMgY29tcGxldGUsIGdvdCcsIG1vdmVzLmxlbmd0aCwgJ21vdmVzJyk7XG5cbiAgICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VNb3ZlQW5hbHlzaXNDYWNoZSkge1xuICAgICAgICBhbmFseXNpc0NhY2hlLnNldCh7XG4gICAgICAgICAga2V5OiBjYWNoZUtleSxcbiAgICAgICAgICBtb3ZlcyxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIuZGVidWcoJ1VzaW5nIGNhY2hlZCBhbmFseXNpcyBmb3IgY3VycmVudCBwb3NpdGlvbicpO1xuICAgIH1cblxuICAgIGNvbnN0IGNsYXNzaWZpZWQgPSBjYWNoZWRDbGFzc2lmaWVkTW92ZXMgPz8gY2xhc3NpZnlNb3Zlcyhtb3Zlcyk7XG4gICAgY29uc3QgY29tcGxleGl0eSA9IGNhbGN1bGF0ZVBvc2l0aW9uQ29tcGxleGl0eShtb3Zlcyk7XG4gICAgY29uc3QgaWdub3JlZCA9IGlzU3RhbGVBbmFseXNpc1JlcXVlc3QocmVxdWVzdElkLCB0aGlzLmxhdGVzdFJlcXVlc3RJZHNbcHVycG9zZV0pO1xuXG4gICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZU1vdmVBbmFseXNpc0NhY2hlICYmIG1vdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGFuYWx5c2lzQ2FjaGUuc2V0KHtcbiAgICAgICAga2V5OiBjYWNoZUtleSxcbiAgICAgICAgbW92ZXMsXG4gICAgICAgIGNsYXNzaWZpZWRNb3ZlczogY2xhc3NpZmllZCxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFpZ25vcmVkKSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMubGFzdEFuYWx5c2lzRnJvbUNhY2hlID0gZnJvbUNhY2hlO1xuICAgICAgICB0aGlzLmxhc3RBbmFseXNpc1B1cnBvc2UgPSBwdXJwb3NlO1xuICAgICAgICBpZiAocHVycG9zZSA9PT0gJ2VuZ2luZU1vdmUnKSB7XG4gICAgICAgICAgdGhpcy5hbmFseXplZE1vdmVzID0gY2xhc3NpZmllZDtcbiAgICAgICAgICB0aGlzLmxhc3RDb21wbGV4aXR5ID0gY29tcGxleGl0eTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldExhbmVBbmFseXppbmcocHVycG9zZSwgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuc1twdXJwb3NlXT8ucHVycG9zZSA9PT0gcHVycG9zZSkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLnNldExhbmVBbmFseXppbmcocHVycG9zZSwgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlcXVlc3RJZCxcbiAgICAgIGFuYWx5emVkRmVuOiBmZW4sXG4gICAgICBtb3ZlczogY2xhc3NpZmllZCxcbiAgICAgIGNvbXBsZXhpdHksXG4gICAgICBpZ25vcmVkLFxuICAgICAgZnJvbUNhY2hlLFxuICAgICAgcHVycG9zZSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0IGFuYWx5c2lzU3RhdHVzTGFiZWwoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5lcnJvcikge1xuICAgICAgcmV0dXJuICdFbmdpbmUgZXJyb3InO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzSW5pdGlhbGl6aW5nKSB7XG4gICAgICByZXR1cm4gJ1N0YXJ0aW5nIGVuZ2luZSc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNNb3ZlTGFuZUFuYWx5emluZykge1xuICAgICAgcmV0dXJuICdBbmFseXppbmcgcG9zaXRpb24nO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQmFja2dyb3VuZEFuYWx5emluZykge1xuICAgICAgcmV0dXJuICdSdW5uaW5nIGJhY2tncm91bmQgYW5hbHlzaXMnO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc0luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm4gJ05vdCBpbml0aWFsaXplZCc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubGFzdEFuYWx5c2lzUHVycG9zZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICdSZWFkeSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGFzdEFuYWx5c2lzRnJvbUNhY2hlID8gJ1JlYWR5IChjYWNoZSB3YXJtKScgOiAnUmVhZHknO1xuICB9XG5cbiAgZ2V0IGlzQW5hbHl6aW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzTW92ZUxhbmVBbmFseXppbmcgfHwgdGhpcy5pc0JhY2tncm91bmRBbmFseXppbmc7XG4gIH1cblxuICBnZXQgaXNNb3ZlTGFuZUJ1c3koKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNJbml0aWFsaXppbmcgfHwgdGhpcy5pc01vdmVMYW5lQW5hbHl6aW5nO1xuICB9XG5cbiAgZ2V0IGlzQmFja2dyb3VuZExhbmVCdXN5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzQmFja2dyb3VuZEFuYWx5emluZztcbiAgfVxuXG4gIHByaXZhdGUgaW52YWxpZGF0ZVBlbmRpbmdSZXF1ZXN0cygpOiB2b2lkIHtcbiAgICB0aGlzLmxhdGVzdFJlcXVlc3RJZHMuZW5naW5lTW92ZSA9ICsrdGhpcy5uZXh0UmVxdWVzdElkcy5lbmdpbmVNb3ZlO1xuICAgIHRoaXMubGF0ZXN0UmVxdWVzdElkcy5iYWNrZ3JvdW5kID0gKyt0aGlzLm5leHRSZXF1ZXN0SWRzLmJhY2tncm91bmQ7XG4gIH1cblxuICBwcml2YXRlIGludmFsaWRhdGVQdXJwb3NlUmVxdWVzdChwdXJwb3NlOiBBbmFseXNpc1B1cnBvc2UpOiB2b2lkIHtcbiAgICB0aGlzLmxhdGVzdFJlcXVlc3RJZHNbcHVycG9zZV0gPSArK3RoaXMubmV4dFJlcXVlc3RJZHNbcHVycG9zZV07XG4gIH1cblxuICBwcml2YXRlIGdldExhbmVGb3JQdXJwb3NlKHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSk6IEVuZ2luZUxhbmUge1xuICAgIHJldHVybiBwdXJwb3NlID09PSAnZW5naW5lTW92ZScgPyAnbW92ZScgOiAnYW5hbHlzaXMnO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRMYW5lQW5hbHl6aW5nKHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSwgYW5hbHl6aW5nOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHB1cnBvc2UgPT09ICdlbmdpbmVNb3ZlJykge1xuICAgICAgdGhpcy5pc01vdmVMYW5lQW5hbHl6aW5nID0gYW5hbHl6aW5nO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuaXNCYWNrZ3JvdW5kQW5hbHl6aW5nID0gYW5hbHl6aW5nO1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGVuZ2luZVZpZXdNb2RlbCA9IG5ldyBFbmdpbmVWaWV3TW9kZWwoKTtcbiIsICIvKipcbiAqIENvbmZpZyBWaWV3TW9kZWxcbiAqIFZpZXdNb2RlbCBsYXllciAtIE1vYlggc3RvcmUgZm9yIGJ1Y2tldCBjb25maWd1cmF0aW9uXG4gKi9cblxuaW1wb3J0IHsgbWFrZUF1dG9PYnNlcnZhYmxlLCBhY3Rpb24sIHJlYWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBCdWNrZXRDb25maWcsIE1vdmVCdWNrZXQsIERFRkFVTFRfQlVDS0VUX0NPTkZJRywgTW92ZVF1YWxpdHlQcmVzZXRJZCwgTU9WRV9RVUFMSVRZX1BSRVNFVFMgfSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuaW1wb3J0IHsgRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSB9IGZyb20gJy4uL2VuZ2luZS9mZWF0dXJlT3B0aW9ucyc7XG5pbXBvcnQgeyBub3JtYWxpemVCdWNrZXRDb25maWcsIHZhbGlkYXRlQnVja2V0Q29uZmlnIH0gZnJvbSAnLi4vZW5naW5lL21vdmVQaWNrZXInO1xuaW1wb3J0IHsgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcblxuaW50ZXJmYWNlIFBlcnNpc3RlZEVuZ2luZUNvbmZpZyB7XG4gIGJ1Y2tldENvbmZpZzogQnVja2V0Q29uZmlnO1xuICBjdXJyZW50UHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsO1xuICBkZXB0aDogbnVtYmVyO1xuICBtdWx0aVBWOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBDb25maWdWaWV3TW9kZWwge1xuICBidWNrZXRDb25maWc6IEJ1Y2tldENvbmZpZyA9IHsgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHIH07XG4gIC8qKiBJZCBvZiB0aGUgYWN0aXZlIHByZXNldCwgb3IgbnVsbCBpZiB1c2luZyBjdXN0b20gZGlzdHJpYnV0aW9uICovXG4gIGN1cnJlbnRQcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGwgPSAnbWVkaXVtJztcbiAgZGVwdGggPSA4O1xuICBtdWx0aVBWID0gMTI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldEJ1Y2tldFZhbHVlOiBhY3Rpb24sXG4gICAgICBzZXRCdWNrZXRDb25maWc6IGFjdGlvbixcbiAgICAgIGFwcGx5UHJvZmlsZVNuYXBzaG90OiBhY3Rpb24sXG4gICAgICBhcHBseVByZXNldDogYWN0aW9uLFxuICAgICAgcmVzZXRUb0RlZmF1bHRzOiBhY3Rpb24sXG4gICAgICBub3JtYWxpemVDb25maWc6IGFjdGlvbixcbiAgICAgIHNldERlcHRoOiBhY3Rpb24sXG4gICAgICBzZXRNdWx0aVBWOiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc3RvcmVGcm9tU3RvcmFnZSgpO1xuXG4gICAgcmVhY3Rpb24oXG4gICAgICAoKSA9PiAoe1xuICAgICAgICBidWNrZXRDb25maWc6IHRoaXMuYnVja2V0Q29uZmlnLFxuICAgICAgICBjdXJyZW50UHJlc2V0SWQ6IHRoaXMuY3VycmVudFByZXNldElkLFxuICAgICAgICBkZXB0aDogdGhpcy5kZXB0aCxcbiAgICAgICAgbXVsdGlQVjogdGhpcy5tdWx0aVBWLFxuICAgICAgICBwZXJzaXN0RW5naW5lQ29uZmlnOiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5wZXJzaXN0RW5naW5lQ29uZmlnLFxuICAgICAgfSksXG4gICAgICAoeyBwZXJzaXN0RW5naW5lQ29uZmlnIH0pID0+IHtcbiAgICAgICAgaWYgKCFwZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZFN0b3JhZ2UoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICAgIH0sXG4gICAgICB7IGZpcmVJbW1lZGlhdGVseTogdHJ1ZSB9LFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBwZXJjZW50YWdlIHZhbHVlIGZvciBhIHNwZWNpZmljIGJ1Y2tldFxuICAgKi9cbiAgc2V0QnVja2V0VmFsdWUoYnVja2V0OiBNb3ZlQnVja2V0LCB2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY2xhbXBlZFZhbHVlID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCB2YWx1ZSkpO1xuICAgIHRoaXMuY3VycmVudFByZXNldElkID0gbnVsbDsgLy8gc3dpdGNoaW5nIHRvIGN1c3RvbVxuICAgIHRoaXMuYnVja2V0Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5idWNrZXRDb25maWcsXG4gICAgICBbYnVja2V0XTogY2xhbXBlZFZhbHVlLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBmdWxsIGJ1Y2tldCBjb25maWcgKGUuZy4gd2hlbiBhcHBseWluZyBhIHByZXNldClcbiAgICovXG4gIHNldEJ1Y2tldENvbmZpZyhjb25maWc6IEJ1Y2tldENvbmZpZyk6IHZvaWQge1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5jb25maWcgfTtcbiAgfVxuXG4gIGFwcGx5UHJvZmlsZVNuYXBzaG90KHNuYXBzaG90OiB7XG4gICAgYnVja2V0Q29uZmlnOiBCdWNrZXRDb25maWc7XG4gICAgY3VycmVudFByZXNldElkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbDtcbiAgICBkZXB0aDogbnVtYmVyO1xuICAgIG11bHRpUFY6IG51bWJlcjtcbiAgfSk6IHZvaWQge1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5zbmFwc2hvdC5idWNrZXRDb25maWcgfTtcbiAgICB0aGlzLmN1cnJlbnRQcmVzZXRJZCA9IHNuYXBzaG90LmN1cnJlbnRQcmVzZXRJZDtcbiAgICB0aGlzLmRlcHRoID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMzAsIHNuYXBzaG90LmRlcHRoKSk7XG4gICAgdGhpcy5tdWx0aVBWID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMjAsIHNuYXBzaG90Lm11bHRpUFYpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBhIHByZWRlZmluZWQgbW92ZSBxdWFsaXR5IHByZXNldCBieSBpZFxuICAgKi9cbiAgYXBwbHlQcmVzZXQocHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQpOiB2b2lkIHtcbiAgICBjb25zdCBwcmVzZXQgPSBNT1ZFX1FVQUxJVFlfUFJFU0VUUy5maW5kKHAgPT4gcC5pZCA9PT0gcHJlc2V0SWQpO1xuICAgIGlmIChwcmVzZXQpIHtcbiAgICAgIHRoaXMuY3VycmVudFByZXNldElkID0gcHJlc2V0SWQ7XG4gICAgICB0aGlzLmJ1Y2tldENvbmZpZyA9IHsgLi4ucHJlc2V0LmNvbmZpZyB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBidWNrZXQgY29uZmlndXJhdGlvbiB0byBkZWZhdWx0cyAobWVkaXVtIHByZXNldClcbiAgICovXG4gIHJlc2V0VG9EZWZhdWx0cygpOiB2b2lkIHtcbiAgICB0aGlzLmN1cnJlbnRQcmVzZXRJZCA9ICdtZWRpdW0nO1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemUgdGhlIGNvbmZpZ3VyYXRpb24gc28gcGVyY2VudGFnZXMgc3VtIHRvIDEwMFxuICAgKi9cbiAgbm9ybWFsaXplQ29uZmlnKCk6IHZvaWQge1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0gbm9ybWFsaXplQnVja2V0Q29uZmlnKHRoaXMuYnVja2V0Q29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYW5hbHlzaXMgZGVwdGhcbiAgICovXG4gIHNldERlcHRoKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmRlcHRoID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMzAsIHZhbHVlKSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IE11bHRpUFYgdmFsdWVcbiAgICovXG4gIHNldE11bHRpUFYodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMubXVsdGlQViA9IE1hdGgubWF4KDEsIE1hdGgubWluKDIwLCB2YWx1ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0b3RhbCBwZXJjZW50YWdlIHN1bVxuICAgKi9cbiAgZ2V0IHRvdGFsUGVyY2VudGFnZSgpOiBudW1iZXIge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuYnVja2V0Q29uZmlnKS5yZWR1Y2UoKHN1bSwgdmFsKSA9PiBzdW0gKyB2YWwsIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNvbmZpZ3VyYXRpb24gaXMgdmFsaWQgKHN1bXMgdG8gMTAwKVxuICAgKi9cbiAgZ2V0IGlzVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyB2YWxpZCB9ID0gdmFsaWRhdGVCdWNrZXRDb25maWcodGhpcy5idWNrZXRDb25maWcpO1xuICAgIHJldHVybiB2YWxpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHZhbGlkYXRpb24gc3RhdGVcbiAgICovXG4gIGdldCB2YWxpZGF0aW9uU3RhdGUoKTogeyB2YWxpZDogYm9vbGVhbjsgdG90YWw6IG51bWJlciB9IHtcbiAgICByZXR1cm4gdmFsaWRhdGVCdWNrZXRDb25maWcodGhpcy5idWNrZXRDb25maWcpO1xuICB9XG5cbiAgZ2V0IGFjdGl2ZVBlcnNvbmFJZCgpOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFByZXNldElkO1xuICB9XG5cbiAgZ2V0IGFjdGl2ZVBlcnNvbmFMYWJlbCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmN1cnJlbnRQcmVzZXRJZCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICdDdXN0b20nO1xuICAgIH1cblxuICAgIHJldHVybiBNT1ZFX1FVQUxJVFlfUFJFU0VUUy5maW5kKChwcmVzZXQpID0+IHByZXNldC5pZCA9PT0gdGhpcy5jdXJyZW50UHJlc2V0SWQpPy5sYWJlbCA/PyAnQ3VzdG9tJztcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKEVOR0lORV9DT05GSUdfU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKCFzYXZlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzIFBhcnRpYWw8UGVyc2lzdGVkRW5naW5lQ29uZmlnPjtcbiAgICAgIGlmIChwYXJzZWQuYnVja2V0Q29uZmlnKSB7XG4gICAgICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcsIC4uLnBhcnNlZC5idWNrZXRDb25maWcgfTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJzZWQuY3VycmVudFByZXNldElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UHJlc2V0SWQgPSBwYXJzZWQuY3VycmVudFByZXNldElkO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXJzZWQuZGVwdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHRoaXMuZGVwdGggPSBNYXRoLm1heCgxLCBNYXRoLm1pbigzMCwgcGFyc2VkLmRlcHRoKSk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhcnNlZC5tdWx0aVBWID09PSAnbnVtYmVyJykge1xuICAgICAgICB0aGlzLm11bHRpUFYgPSBNYXRoLm1heCgxLCBNYXRoLm1pbigyMCwgcGFyc2VkLm11bHRpUFYpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0NvbmZpZ1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHJlc3RvcmUgZW5naW5lIGNvbmZpZzonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0VG9TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzbmFwc2hvdDogUGVyc2lzdGVkRW5naW5lQ29uZmlnID0ge1xuICAgICAgICBidWNrZXRDb25maWc6IHRoaXMuYnVja2V0Q29uZmlnLFxuICAgICAgICBjdXJyZW50UHJlc2V0SWQ6IHRoaXMuY3VycmVudFByZXNldElkLFxuICAgICAgICBkZXB0aDogdGhpcy5kZXB0aCxcbiAgICAgICAgbXVsdGlQVjogdGhpcy5tdWx0aVBWLFxuICAgICAgfTtcblxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSwgSlNPTi5zdHJpbmdpZnkoc25hcHNob3QpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0NvbmZpZ1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHBlcnNpc3QgZW5naW5lIGNvbmZpZzonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclBlcnNpc3RlZFN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKEVOR0lORV9DT05GSUdfU1RPUkFHRV9LRVkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQ29uZmlnVmlld01vZGVsXSBGYWlsZWQgdG8gY2xlYXIgZW5naW5lIGNvbmZpZyBzdG9yYWdlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgY29uZmlnVmlld01vZGVsID0gbmV3IENvbmZpZ1ZpZXdNb2RlbCgpO1xuIiwgImltcG9ydCB7IGFjdGlvbiwgbWFrZUF1dG9PYnNlcnZhYmxlIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBNb3ZlUXVhbGl0eVByZXNldElkIH0gZnJvbSAnLi4vZW5naW5lL3R5cGVzJztcblxudHlwZSBTZXR0aW5nc1RhYklkID1cbiAgfCAnZ2VuZXJhbCdcbiAgfCAnZW5naW5lJ1xuICB8ICdwZXJzb25hbGl0eSdcbiAgfCAnYnJpbGxpYW50J1xuICB8ICdhZHZhbmNlZCdcbiAgfCAnZGVidWcnXG4gIHwgJ2Fib3V0JztcblxudHlwZSBBbmltYXRpb25TcGVlZCA9ICdzbG93JyB8ICdub3JtYWwnIHwgJ2Zhc3QnO1xudHlwZSBUaGVtZU1vZGUgPSAnZGFyaycgfCAnbGlnaHQnIHwgJ21pbmltYWwnIHwgJ3BlcnNvbmEnO1xudHlwZSBCb2FyZFNpemVQcmVzZXQgPSAnc21hbGwnIHwgJ21lZGl1bScgfCAnbGFyZ2UnIHwgJ3hsYXJnZSc7XG50eXBlIEF1dG9QbGF5U3BlZWQgPSAnc2xvdycgfCAnbm9ybWFsJyB8ICdmYXN0JztcblxuY29uc3QgQk9BUkRfU0laRV9QUkVTRVRfUElYRUxTOiBSZWNvcmQ8Qm9hcmRTaXplUHJlc2V0LCBudW1iZXI+ID0ge1xuICBzbWFsbDogNDgwLFxuICBtZWRpdW06IDY0MCxcbiAgbGFyZ2U6IDgwMCxcbiAgeGxhcmdlOiA5NjAsXG59O1xuXG5pbnRlcmZhY2UgUGVyc2lzdGVkVWlQcmVmZXJlbmNlcyB7XG4gIGJhc2ljTW9kZTogYm9vbGVhbjtcbiAgYW5pbWF0aW9uU3BlZWQ6IEFuaW1hdGlvblNwZWVkO1xuICBzb3VuZEVuYWJsZWQ6IGJvb2xlYW47XG4gIHNvdW5kTXV0ZWQ6IGJvb2xlYW47XG4gIHNvdW5kVm9sdW1lOiBudW1iZXI7XG4gIGF1dG9QbGF5U3BlZWQ6IEF1dG9QbGF5U3BlZWQ7XG4gIHRoZW1lTW9kZTogVGhlbWVNb2RlO1xuICBib2FyZFNpemVQcmVzZXQ6IEJvYXJkU2l6ZVByZXNldDtcbiAgc2VsZWN0ZWRTZXR0aW5nc1RhYjogU2V0dGluZ3NUYWJJZDtcbn1cblxuY29uc3QgVUlfUFJFRkVSRU5DRVNfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX3VpX3ByZWZlcmVuY2VzJztcblxuY29uc3QgREVGQVVMVF9VSV9QUkVGRVJFTkNFUzogUGVyc2lzdGVkVWlQcmVmZXJlbmNlcyA9IHtcbiAgYmFzaWNNb2RlOiB0cnVlLFxuICBhbmltYXRpb25TcGVlZDogJ25vcm1hbCcsXG4gIHNvdW5kRW5hYmxlZDogdHJ1ZSxcbiAgc291bmRNdXRlZDogZmFsc2UsXG4gIHNvdW5kVm9sdW1lOiA3MCxcbiAgYXV0b1BsYXlTcGVlZDogJ25vcm1hbCcsXG4gIHRoZW1lTW9kZTogJ2RhcmsnLFxuICBib2FyZFNpemVQcmVzZXQ6ICdtZWRpdW0nLFxuICBzZWxlY3RlZFNldHRpbmdzVGFiOiAnZ2VuZXJhbCcsXG59O1xuXG5jb25zdCBBVVRPX1BMQVlfU1BFRURfREVMQVlTOiBSZWNvcmQ8QXV0b1BsYXlTcGVlZCwgbnVtYmVyPiA9IHtcbiAgc2xvdzogMTIwMCxcbiAgbm9ybWFsOiA3MDAsXG4gIGZhc3Q6IDM1MCxcbn07XG5cbmV4cG9ydCBjbGFzcyBVaVN0YXRlVmlld01vZGVsIHtcbiAgc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gIGJhc2ljTW9kZSA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYmFzaWNNb2RlO1xuICBhbmltYXRpb25TcGVlZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYW5pbWF0aW9uU3BlZWQ7XG4gIHNvdW5kRW5hYmxlZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc291bmRFbmFibGVkO1xuICBzb3VuZE11dGVkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZE11dGVkO1xuICBzb3VuZFZvbHVtZSA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc291bmRWb2x1bWU7XG4gIGF1dG9QbGF5U3BlZWQgPSBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmF1dG9QbGF5U3BlZWQ7XG4gIHRoZW1lTW9kZSA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMudGhlbWVNb2RlO1xuICBib2FyZFNpemVQcmVzZXQgPSBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmJvYXJkU2l6ZVByZXNldDtcbiAgc2VsZWN0ZWRTZXR0aW5nc1RhYjogU2V0dGluZ3NUYWJJZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc2VsZWN0ZWRTZXR0aW5nc1RhYjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0U2V0dGluZ3NPcGVuOiBhY3Rpb24sXG4gICAgICBhcHBseVByb2ZpbGVQcmVmZXJlbmNlczogYWN0aW9uLFxuICAgICAgc2V0QmFzaWNNb2RlOiBhY3Rpb24sXG4gICAgICBzZXRBbmltYXRpb25TcGVlZDogYWN0aW9uLFxuICAgICAgc2V0U291bmRFbmFibGVkOiBhY3Rpb24sXG4gICAgICBzZXRTb3VuZE11dGVkOiBhY3Rpb24sXG4gICAgICBzZXRTb3VuZFZvbHVtZTogYWN0aW9uLFxuICAgICAgc2V0QXV0b1BsYXlTcGVlZDogYWN0aW9uLFxuICAgICAgc2V0VGhlbWVNb2RlOiBhY3Rpb24sXG4gICAgICBzZXRCb2FyZFNpemVQcmVzZXQ6IGFjdGlvbixcbiAgICAgIHNldFNlbGVjdGVkU2V0dGluZ3NUYWI6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTZXR0aW5nc09wZW4ob3BlbjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gb3BlbjtcbiAgfVxuXG4gIGFwcGx5UHJvZmlsZVByZWZlcmVuY2VzKHByZWZlcmVuY2VzOiBQYXJ0aWFsPFBpY2s8UGVyc2lzdGVkVWlQcmVmZXJlbmNlcywgJ2Jhc2ljTW9kZScgfCAndGhlbWVNb2RlJz4+KTogdm9pZCB7XG4gICAgdGhpcy5iYXNpY01vZGUgPSBwcmVmZXJlbmNlcy5iYXNpY01vZGUgPz8gdGhpcy5iYXNpY01vZGU7XG4gICAgdGhpcy50aGVtZU1vZGUgPSBwcmVmZXJlbmNlcy50aGVtZU1vZGUgPz8gdGhpcy50aGVtZU1vZGU7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRCYXNpY01vZGUoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuYmFzaWNNb2RlID0gZW5hYmxlZDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldEFuaW1hdGlvblNwZWVkKHNwZWVkOiBBbmltYXRpb25TcGVlZCk6IHZvaWQge1xuICAgIHRoaXMuYW5pbWF0aW9uU3BlZWQgPSBzcGVlZDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNvdW5kRW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zb3VuZEVuYWJsZWQgPSBlbmFibGVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U291bmRNdXRlZChtdXRlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuc291bmRNdXRlZCA9IG11dGVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U291bmRWb2x1bWUodm9sdW1lOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNvdW5kVm9sdW1lID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCBNYXRoLnJvdW5kKHZvbHVtZSkpKTtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldEF1dG9QbGF5U3BlZWQoc3BlZWQ6IEF1dG9QbGF5U3BlZWQpOiB2b2lkIHtcbiAgICB0aGlzLmF1dG9QbGF5U3BlZWQgPSBzcGVlZDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFRoZW1lTW9kZSh0aGVtZU1vZGU6IFRoZW1lTW9kZSk6IHZvaWQge1xuICAgIHRoaXMudGhlbWVNb2RlID0gdGhlbWVNb2RlO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0Qm9hcmRTaXplUHJlc2V0KGJvYXJkU2l6ZVByZXNldDogQm9hcmRTaXplUHJlc2V0KTogdm9pZCB7XG4gICAgdGhpcy5ib2FyZFNpemVQcmVzZXQgPSBib2FyZFNpemVQcmVzZXQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTZWxlY3RlZFNldHRpbmdzVGFiKHRhYjogU2V0dGluZ3NUYWJJZCk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRTZXR0aW5nc1RhYiA9IHRhYjtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFVJX1BSRUZFUkVOQ0VTX1NUT1JBR0VfS0VZKTtcbiAgICAgIGlmICghc2F2ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHNhdmVkKSBhcyBQYXJ0aWFsPFBlcnNpc3RlZFVpUHJlZmVyZW5jZXM+O1xuICAgICAgdGhpcy5iYXNpY01vZGUgPSBwYXJzZWQuYmFzaWNNb2RlID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYmFzaWNNb2RlO1xuICAgICAgdGhpcy5hbmltYXRpb25TcGVlZCA9IHBhcnNlZC5hbmltYXRpb25TcGVlZCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmFuaW1hdGlvblNwZWVkO1xuICAgICAgdGhpcy5zb3VuZEVuYWJsZWQgPSBwYXJzZWQuc291bmRFbmFibGVkID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc291bmRFbmFibGVkO1xuICAgICAgdGhpcy5zb3VuZE11dGVkID0gcGFyc2VkLnNvdW5kTXV0ZWQgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZE11dGVkO1xuICAgICAgdGhpcy5zb3VuZFZvbHVtZSA9IHR5cGVvZiBwYXJzZWQuc291bmRWb2x1bWUgPT09ICdudW1iZXInXG4gICAgICAgID8gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCBNYXRoLnJvdW5kKHBhcnNlZC5zb3VuZFZvbHVtZSkpKVxuICAgICAgICA6IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc291bmRWb2x1bWU7XG4gICAgICB0aGlzLmF1dG9QbGF5U3BlZWQgPSBwYXJzZWQuYXV0b1BsYXlTcGVlZCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmF1dG9QbGF5U3BlZWQ7XG4gICAgICB0aGlzLnRoZW1lTW9kZSA9IHBhcnNlZC50aGVtZU1vZGUgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy50aGVtZU1vZGU7XG4gICAgICB0aGlzLmJvYXJkU2l6ZVByZXNldCA9IHBhcnNlZC5ib2FyZFNpemVQcmVzZXQgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5ib2FyZFNpemVQcmVzZXQ7XG4gICAgICB0aGlzLnNlbGVjdGVkU2V0dGluZ3NUYWIgPSBwYXJzZWQuc2VsZWN0ZWRTZXR0aW5nc1RhYiA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnNlbGVjdGVkU2V0dGluZ3NUYWI7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgaW52YWxpZCBVSSBwcmVmZXJlbmNlIHNuYXBzaG90cy5cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICBVSV9QUkVGRVJFTkNFU19TVE9SQUdFX0tFWSxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIGJhc2ljTW9kZTogdGhpcy5iYXNpY01vZGUsXG4gICAgICAgICAgYW5pbWF0aW9uU3BlZWQ6IHRoaXMuYW5pbWF0aW9uU3BlZWQsXG4gICAgICAgICAgc291bmRFbmFibGVkOiB0aGlzLnNvdW5kRW5hYmxlZCxcbiAgICAgICAgICBzb3VuZE11dGVkOiB0aGlzLnNvdW5kTXV0ZWQsXG4gICAgICAgICAgc291bmRWb2x1bWU6IHRoaXMuc291bmRWb2x1bWUsXG4gICAgICAgICAgYXV0b1BsYXlTcGVlZDogdGhpcy5hdXRvUGxheVNwZWVkLFxuICAgICAgICAgIHRoZW1lTW9kZTogdGhpcy50aGVtZU1vZGUsXG4gICAgICAgICAgYm9hcmRTaXplUHJlc2V0OiB0aGlzLmJvYXJkU2l6ZVByZXNldCxcbiAgICAgICAgICBzZWxlY3RlZFNldHRpbmdzVGFiOiB0aGlzLnNlbGVjdGVkU2V0dGluZ3NUYWIsXG4gICAgICAgIH0gYXMgUGVyc2lzdGVkVWlQcmVmZXJlbmNlcyksXG4gICAgICApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGxvY2FsU3RvcmFnZSBpc3N1ZXMgYW5kIGtlZXAgVUkgcmVzcG9uc2l2ZS5cbiAgICB9XG4gIH1cblxuICBnZXQgYm9hcmRTaXplUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gQk9BUkRfU0laRV9QUkVTRVRfUElYRUxTW3RoaXMuYm9hcmRTaXplUHJlc2V0XTtcbiAgfVxuXG4gIGdldCBhdXRvUGxheURlbGF5TXMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gQVVUT19QTEFZX1NQRUVEX0RFTEFZU1t0aGlzLmF1dG9QbGF5U3BlZWRdO1xuICB9XG5cbiAgZ2V0IGVmZmVjdGl2ZVNvdW5kVm9sdW1lKCk6IG51bWJlciB7XG4gICAgaWYgKCF0aGlzLnNvdW5kRW5hYmxlZCB8fCB0aGlzLnNvdW5kTXV0ZWQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNvdW5kVm9sdW1lIC8gMTAwO1xuICB9XG5cbiAgZ2V0UGVyc29uYUFjY2VudFRvbmUocGVyc29uYUlkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbCk6ICdyZWQnIHwgJ2dvbGQnIHwgJ2JsdWUnIHwgJ2dyZWVuJyB7XG4gICAgc3dpdGNoIChwZXJzb25hSWQpIHtcbiAgICAgIGNhc2UgJ2FnZ3Jlc3NpdmUnOlxuICAgICAgICByZXR1cm4gJ3JlZCc7XG4gICAgICBjYXNlICdoYXJkJzpcbiAgICAgIGNhc2UgJ3N1cGVyX2hhcmQnOlxuICAgICAgICByZXR1cm4gJ2dvbGQnO1xuICAgICAgY2FzZSAnbG93JzpcbiAgICAgICAgcmV0dXJuICdncmVlbic7XG4gICAgICBjYXNlICdtZWRpdW0nOlxuICAgICAgY2FzZSBudWxsOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdibHVlJztcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHVpU3RhdGVWaWV3TW9kZWwgPSBuZXcgVWlTdGF0ZVZpZXdNb2RlbCgpO1xuXG5leHBvcnQgeyBCT0FSRF9TSVpFX1BSRVNFVF9QSVhFTFMgfTtcbmV4cG9ydCB0eXBlIHsgQW5pbWF0aW9uU3BlZWQsIEF1dG9QbGF5U3BlZWQsIEJvYXJkU2l6ZVByZXNldCwgU2V0dGluZ3NUYWJJZCwgVGhlbWVNb2RlIH07XG4iLCAiLyoqXG4gKiBCb2FyZCBWaWV3TW9kZWxcbiAqIFZpZXdNb2RlbCBsYXllciAtIE1vYlggc3RvcmUgZm9yIGNoZXNzIGJvYXJkIHN0YXRlXG4gKi9cblxuaW1wb3J0IHsgbWFrZUF1dG9PYnNlcnZhYmxlLCBhY3Rpb24sIHJlYWN0aW9uLCBydW5JbkFjdGlvbiB9IGZyb20gXCJtb2J4XCI7XG5pbXBvcnQgeyBDaGVzcywgTW92ZSwgU3F1YXJlIH0gZnJvbSBcImNoZXNzLmpzXCI7XG5pbXBvcnQgeyBjYW5BcHBseUFuYWx5emVkTW92ZSB9IGZyb20gXCIuLi9lbmdpbmUvYW5hbHlzaXNTYWZldHlcIjtcbmltcG9ydCB7XG4gIGRlcml2ZUJyaWxsaWFudFVzYWdlLFxuICBNb3ZlQW5ub3RhdGlvbixcbn0gZnJvbSBcIi4uL2VuZ2luZS9icmlsbGlhbnRUcmFja2luZ1wiO1xuaW1wb3J0IHtcbiAgUGVyc2lzdGVkQm9hcmRTdGF0ZSxcbiAgY3JlYXRlR2FtZVNlc3Npb25JZCxcbiAgcmVzb2x2ZVBnblN0YXJ0RmVuLFxufSBmcm9tIFwiLi4vZW5naW5lL2dhbWVTZXNzaW9uXCI7XG5pbXBvcnQgeyBHYW1lU2V0dXBQcmVzZXQgfSBmcm9tIFwiLi4vZW5naW5lL2dhbWVTZXR1cFByZXNldHNcIjtcbmltcG9ydCB7IGVuZ2luZVZpZXdNb2RlbCB9IGZyb20gXCIuL0VuZ2luZVZpZXdNb2RlbFwiO1xuaW1wb3J0IHsgY29uZmlnVmlld01vZGVsIH0gZnJvbSBcIi4vQ29uZmlnVmlld01vZGVsXCI7XG5pbXBvcnQgeyBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gXCIuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsXCI7XG5pbXBvcnQgeyBjcmVhdGVEZWJ1Z0xvZ2dlciB9IGZyb20gXCIuLi9zaGFyZWQvZGVidWdcIjtcbmltcG9ydCB7XG4gIFBpY2tlZE1vdmVSZXN1bHQsXG4gIE1vdmVCdWNrZXQsXG4gIERpc3BsYXlNb3ZlQnVja2V0LFxuICBESVNQTEFZX0JVQ0tFVF9MQUJFTFMsXG4gIEJVQ0tFVF9MQUJFTFMsXG4gIEJVQ0tFVF9DT0xPUlMsXG4gIERJU1BMQVlfQlVDS0VUX0NPTE9SUyxcbn0gZnJvbSBcIi4uL2VuZ2luZS90eXBlc1wiO1xuaW1wb3J0IHsgY2FsY3VsYXRlSHVtYW5EZWxheU1zIH0gZnJvbSBcIi4uL2VuZ2luZS9wZXJzb25hQmlhc1wiO1xuaW1wb3J0IHsgbWFwTGVnYWxNb3Zlc1RvQnVja2V0cyB9IGZyb20gXCIuLi9lbmdpbmUvbW92ZUNsYXNzaWZpZXJcIjtcbmltcG9ydCB7IHVpU3RhdGVWaWV3TW9kZWwgfSBmcm9tIFwiLi9VaVN0YXRlVmlld01vZGVsXCI7XG5cbmNvbnN0IGxvZ2dlciA9IGNyZWF0ZURlYnVnTG9nZ2VyKFwiQm9hcmRWaWV3TW9kZWxcIik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjZW50TW92ZUZlZWRiYWNrIHtcbiAgaWQ6IHN0cmluZztcbiAgYWN0b3I6IFwicGxheWVyXCIgfCBcImVuZ2luZVwiIHwgXCJyZWRvXCI7XG4gIHNhbjogc3RyaW5nO1xuICBxdWFsaXR5TGFiZWw/OiBzdHJpbmcgfCBudWxsO1xuICBidWNrZXQ/OiBEaXNwbGF5TW92ZUJ1Y2tldCB8IE1vdmVCdWNrZXQgfCBudWxsO1xuICBpc0JyaWxsaWFudDogYm9vbGVhbjtcbiAgaXNDYXB0dXJlOiBib29sZWFuO1xuICBpc0NoZWNrOiBib29sZWFuO1xuICBpc0dhbWVFbmQ6IGJvb2xlYW47XG4gIHNpbGVudDogYm9vbGVhbjtcbiAgY3JlYXRlZEF0OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBCb2FyZFZpZXdNb2RlbCB7XG4gIHByaXZhdGUgY2hlc3M6IENoZXNzID0gbmV3IENoZXNzKCk7XG4gIGZlbiA9IHRoaXMuY2hlc3MuZmVuKCk7XG4gIGdhbWVTdGFydEZlbiA9IHRoaXMuY2hlc3MuZmVuKCk7XG4gIGdhbWVTZXNzaW9uSWQgPSBjcmVhdGVHYW1lU2Vzc2lvbklkKCk7XG4gIHNlc3Npb25TdGFydGVkQXQgPSBEYXRlLm5vdygpO1xuICBoaXN0b3J5OiBNb3ZlW10gPSBbXTtcbiAgbGFzdE1vdmU6IHsgZnJvbTogU3F1YXJlOyB0bzogU3F1YXJlIH0gfCBudWxsID0gbnVsbDtcbiAgbGFzdFBsYXllZEJ1Y2tldDogTW92ZUJ1Y2tldCB8IG51bGwgPSBudWxsO1xuICBzdGF0dXNNZXNzYWdlID0gXCJSZWFkeVwiO1xuICBsYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgaXNUaGlua2luZyA9IGZhbHNlO1xuICBhdXRvUGxheUVuYWJsZWQgPSB0cnVlOyAvLyBBdXRvLXBsYXkgZW5naW5lIG1vdmVzIGFmdGVyIGh1bWFuIG1vdmVzXG4gIGVuZ2luZVBsYXlzRm9yOiBcIndcIiB8IFwiYlwiID0gXCJiXCI7IC8vIFdoaWNoIHNpZGUgdGhlIGVuZ2luZSBwbGF5cyBmb3IgKGRlZmF1bHQ6IGJsYWNrKVxuICBib2FyZEZsaXBwZWQgPSBmYWxzZTsgLy8gQm9hcmQgb3JpZW50YXRpb24gKGZhbHNlID0gd2hpdGUgb24gYm90dG9tLCB0cnVlID0gYmxhY2sgb24gYm90dG9tKVxuICBzaG93TW92ZUFycm93cyA9IGZhbHNlOyAvLyBTaG93IGFycm93cyBmb3IgYWxsIHBvc3NpYmxlIG1vdmVzXG4gIHNob3dBcnJvd3NGb3JTaWRlOiBcImN1cnJlbnRcIiB8IFwicGxheWVyXCIgfCBcImVuZ2luZVwiID0gXCJjdXJyZW50XCI7IC8vIFdoaWNoIHNpZGUncyBtb3ZlcyB0byBzaG93IGFycm93cyBmb3JcbiAgbGFzdFBsYXllck1vdmVRdWFsaXR5OiBEaXNwbGF5TW92ZUJ1Y2tldCB8IG51bGwgPSBudWxsOyAvLyBRdWFsaXR5IG9mIHRoZSBsYXN0IHBsYXllciBtb3ZlXG4gIGlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTsgLy8gV2hldGhlciB3ZSdyZSBjdXJyZW50bHkgYW5hbHl6aW5nIG1vdmVzXG4gIGF1dG9QbGF5UGF1c2VkID0gZmFsc2U7XG4gIGF1dG9QbGF5U2NoZWR1bGVkRm9yID0gMDtcbiAgY3VycmVudFNldHVwTmFtZSA9IFwiTmV3IEdhbWVcIjtcbiAgY3VycmVudFNldHVwQ2F0ZWdvcnkgPSBcImN1c3RvbVwiO1xuICByZWNlbnRNb3ZlRmVlZGJhY2s6IFJlY2VudE1vdmVGZWVkYmFjayB8IG51bGwgPSBudWxsO1xuICBhdXRvUGxheUFjY3VtdWxhdGVkTXMgPSAwO1xuICBhdXRvUGxheUxhc3RSZXN1bWVkQXQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8vIFN0b3JlIGFuYWx5emVkIG1vdmVzIGFzIGFuIG9iamVjdCBmb3IgTW9iWCBvYnNlcnZhYmlsaXR5XG4gIHByaXZhdGUgX2FuYWx5emVkTGVnYWxNb3ZlczogUmVjb3JkPHN0cmluZywgRGlzcGxheU1vdmVCdWNrZXQ+ID0ge307XG4gIHByaXZhdGUgcmVkb1N0YWNrOiBNb3ZlW10gPSBbXTsgLy8gU3RhY2sgb2YgbW92ZXMgdGhhdCB3ZXJlIHVuZG9uZSBmb3IgcmVkbyBmdW5jdGlvbmFsaXR5XG4gIHByaXZhdGUgaGlzdG9yeUFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdID0gW107XG4gIHByaXZhdGUgcmVkb0Fubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdID0gW107XG4gIHByaXZhdGUgYW5hbHl6ZWRMZWdhbE1vdmVzRmVuOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfYW5hbHlzaXNUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsOyAvLyBUaW1lb3V0IGZvciBkZWJvdW5jaW5nIG1vdmUgYW5hbHlzaXNcbiAgcHJpdmF0ZSBfYXV0b1BsYXlUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9wbGF5ZXJNb3ZlQW5hbHlzaXNUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IEZFTl9TVE9SQUdFX0tFWSA9IFwicGVyc29uYWNoZXNzX2N1cnJlbnRfZmVuXCI7XG4gIHByaXZhdGUgcmVhZG9ubHkgRkVOX0hJU1RPUllfS0VZID0gXCJwZXJzb25hY2hlc3NfZmVuX2hpc3RvcnlcIjtcbiAgcHJpdmF0ZSByZWFkb25seSBCT0FSRF9TVEFURV9TVE9SQUdFX0tFWSA9IFwicGVyc29uYWNoZXNzX2JvYXJkX3N0YXRlXCI7XG4gIHByaXZhdGUgcmVhZG9ubHkgTUFYX0hJU1RPUlkgPSA1MDsgLy8gTWF4aW11bSBudW1iZXIgb2YgRkVOIHBvc2l0aW9ucyB0byBzdG9yZVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBsb2FkRmVuOiBhY3Rpb24sXG4gICAgICBsb2FkUGduOiBhY3Rpb24sXG4gICAgICBsb2FkR2FtZVNldHVwUHJlc2V0OiBhY3Rpb24sXG4gICAgICBtYWtlTW92ZTogYWN0aW9uLFxuICAgICAgc29sdmVOZXh0TW92ZTogYWN0aW9uLFxuICAgICAgcmVzZXQ6IGFjdGlvbixcbiAgICAgIHVuZG86IGFjdGlvbixcbiAgICAgIHVuZG9TaW5nbGU6IGFjdGlvbixcbiAgICAgIHJlZG9TaW5nbGU6IGFjdGlvbixcbiAgICAgIHNldEF1dG9QbGF5OiBhY3Rpb24sXG4gICAgICBzZXRBdXRvUGxheVBhdXNlZDogYWN0aW9uLFxuICAgICAgc3RhcnRBdXRvUGxheVR1cm46IGFjdGlvbixcbiAgICAgIHRvZ2dsZUF1dG9QbGF5UGF1c2U6IGFjdGlvbixcbiAgICAgIHNldEVuZ2luZVBsYXlzRm9yOiBhY3Rpb24sXG4gICAgICBmbGlwQm9hcmQ6IGFjdGlvbixcbiAgICAgIHNldEJvYXJkRmxpcHBlZDogYWN0aW9uLFxuICAgICAgc2F2ZUZlblRvSGlzdG9yeTogYWN0aW9uLFxuICAgICAgbG9hZEZlbkZyb21IaXN0b3J5OiBhY3Rpb24sXG4gICAgICB0b2dnbGVNb3ZlQXJyb3dzOiBhY3Rpb24sXG4gICAgICBzZXRTaG93TW92ZUFycm93c0VuYWJsZWQ6IGFjdGlvbixcbiAgICAgIHNldFNob3dBcnJvd3NGb3JTaWRlOiBhY3Rpb24sXG4gICAgICBhbmFseXplQWxsTW92ZXM6IGFjdGlvbixcbiAgICAgIGFuYWx5emVQbGF5ZXJNb3ZlOiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICAvLyBUcnkgdG8gcmVzdG9yZSBGRU4gZnJvbSBsb2NhbFN0b3JhZ2Ugb24gaW5pdGlhbGl6YXRpb25cbiAgICB0aGlzLnJlc3RvcmVGZW5Gcm9tU3RvcmFnZSgpO1xuXG4gICAgcmVhY3Rpb24oXG4gICAgICAoKSA9PiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5wZXJzaXN0RW5naW5lQ29uZmlnLFxuICAgICAgKHBlcnNpc3RFbmdpbmVDb25maWcpID0+IHtcbiAgICAgICAgaWYgKCFwZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZEJvYXJkU3RhdGUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNhdmVGZW5Ub0hpc3RvcnkoKTtcbiAgICAgIH0sXG4gICAgICB7IGZpcmVJbW1lZGlhdGVseTogdHJ1ZSB9LFxuICAgICk7XG5cbiAgICBsb2dnZXIuZGVidWcoXCJJbml0aWFsaXplZCB3aXRoIEZFTjpcIiwgdGhpcy5mZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhdXRvLXBsYXkgbW9kZVxuICAgKi9cbiAgc2V0QXV0b1BsYXkoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiAhZW5hYmxlZCkge1xuICAgICAgdGhpcy5zdG9wQXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgfVxuXG4gICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgPSBlbmFibGVkO1xuICAgIGlmICghZW5hYmxlZCkge1xuICAgICAgdGhpcy5hdXRvUGxheVBhdXNlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFydEF1dG9QbGF5RHVyYXRpb25UcmFja2luZygpO1xuICAgIH1cblxuICAgIHRoaXMuc3luY0F1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICBsb2dnZXIuZGVidWcoXCJBdXRvLXBsYXkgc2V0IHRvOlwiLCBlbmFibGVkKTtcbiAgfVxuXG4gIHNldEF1dG9QbGF5UGF1c2VkKHBhdXNlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChwYXVzZWQpIHtcbiAgICAgIHRoaXMuc3RvcEF1dG9QbGF5RHVyYXRpb25UcmFja2luZygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0QXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgfVxuXG4gICAgdGhpcy5hdXRvUGxheVBhdXNlZCA9IHBhdXNlZDtcbiAgICBpZiAocGF1c2VkKSB7XG4gICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN5bmNBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc3RhcnRBdXRvUGxheVR1cm4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmNhblN0YXJ0QXV0b1BsYXlUdXJuKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICBhd2FpdCB0aGlzLnNvbHZlTmV4dE1vdmUodHJ1ZSk7XG4gIH1cblxuICB0b2dnbGVBdXRvUGxheVBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0QXV0b1BsYXlQYXVzZWQoIXRoaXMuYXV0b1BsYXlQYXVzZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB3aGljaCBzaWRlIHRoZSBlbmdpbmUgcGxheXMgZm9yXG4gICAqL1xuICBzZXRFbmdpbmVQbGF5c0ZvcihzaWRlOiBcIndcIiB8IFwiYlwiKTogdm9pZCB7XG4gICAgdGhpcy5lbmdpbmVQbGF5c0ZvciA9IHNpZGU7XG4gICAgdGhpcy5zeW5jQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIGxvZ2dlci5kZWJ1ZyhcIkVuZ2luZSBwbGF5cyBmb3I6XCIsIHNpZGUgPT09IFwid1wiID8gXCJXaGl0ZVwiIDogXCJCbGFja1wiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIGEgcG9zaXRpb24gZnJvbSBGRU4gc3RyaW5nXG4gICAqL1xuICBsb2FkRmVuKFxuICAgIGZlbjogc3RyaW5nLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc/OiBib29sZWFuO1xuICAgICAgc2Vzc2lvbklkPzogc3RyaW5nO1xuICAgICAgZ2FtZVN0YXJ0RmVuPzogc3RyaW5nO1xuICAgICAgaGlzdG9yeUFubm90YXRpb25zPzogTW92ZUFubm90YXRpb25bXTtcbiAgICAgIHJlZG9Bbm5vdGF0aW9ucz86IE1vdmVBbm5vdGF0aW9uW107XG4gICAgICBzZXR1cE5hbWU/OiBzdHJpbmc7XG4gICAgICBzZXR1cENhdGVnb3J5Pzogc3RyaW5nO1xuICAgIH0gPSB7fSxcbiAgKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZyA9IHRydWUsXG4gICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgZ2FtZVN0YXJ0RmVuLFxuICAgICAgICBoaXN0b3J5QW5ub3RhdGlvbnMsXG4gICAgICAgIHJlZG9Bbm5vdGF0aW9ucyxcbiAgICAgICAgc2V0dXBOYW1lLFxuICAgICAgICBzZXR1cENhdGVnb3J5LFxuICAgICAgfSA9IG9wdGlvbnM7XG4gICAgICBsb2dnZXIuZGVidWcoXCJsb2FkRmVuIGNhbGxlZDpcIiwgZmVuKTtcbiAgICAgIGNvbnN0IG5ld0NoZXNzID0gbmV3IENoZXNzKGZlbik7XG4gICAgICB0aGlzLmNoZXNzID0gbmV3Q2hlc3M7XG4gICAgICB0aGlzLmJlZ2luU2Vzc2lvblN0YXRlKHtcbiAgICAgICAgZ2FtZVNlc3Npb25JZDogc2Vzc2lvbklkID8/IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKSxcbiAgICAgICAgZ2FtZVN0YXJ0RmVuOiBnYW1lU3RhcnRGZW4gPz8gZmVuLFxuICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nLFxuICAgICAgICBoaXN0b3J5QW5ub3RhdGlvbnMsXG4gICAgICAgIHJlZG9Bbm5vdGF0aW9ucyxcbiAgICAgICAgc2V0dXBOYW1lLFxuICAgICAgICBzZXR1cENhdGVnb3J5LFxuICAgICAgfSk7XG4gICAgICB0aGlzLnJlc2V0VHJhbnNpZW50Qm9hcmRTdGF0ZSgpO1xuICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJQb3NpdGlvbiBsb2FkZWRcIjtcbiAgICAgIHRoaXMubGFzdFNraXBwZWRFbmdpbmVNb3ZlTWVzc2FnZSA9IG51bGw7XG4gICAgICB0aGlzLnJlY2VudE1vdmVGZWVkYmFjayA9IG51bGw7XG4gICAgICBlbmdpbmVWaWV3TW9kZWwucmVzdGFydCgpO1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiRkVOIGxvYWRlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihcImxvYWRGZW4gZXJyb3I6XCIsIGVycik7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgSW52YWxpZCBGRU46ICR7ZXJyfWA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgYSBnYW1lIGZyb20gUEdOIHN0cmluZ1xuICAgKi9cbiAgbG9hZFBnbihcbiAgICBwZ246IHN0cmluZyxcbiAgICBvcHRpb25zOiB7XG4gICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nPzogYm9vbGVhbjtcbiAgICAgIHNlc3Npb25JZD86IHN0cmluZztcbiAgICAgIHNldHVwTmFtZT86IHN0cmluZztcbiAgICAgIHNldHVwQ2F0ZWdvcnk/OiBzdHJpbmc7XG4gICAgfSA9IHt9LFxuICApOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qge1xuICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nID0gdHJ1ZSxcbiAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICBzZXR1cE5hbWUsXG4gICAgICAgIHNldHVwQ2F0ZWdvcnksXG4gICAgICB9ID0gb3B0aW9ucztcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcImxvYWRQZ24gY2FsbGVkXCIpO1xuICAgICAgY29uc3QgbmV3Q2hlc3MgPSBuZXcgQ2hlc3MoKTtcbiAgICAgIG5ld0NoZXNzLmxvYWRQZ24ocGduKTtcbiAgICAgIGNvbnN0IGdhbWVTdGFydEZlbiA9IHJlc29sdmVQZ25TdGFydEZlbihcbiAgICAgICAgbmV3Q2hlc3MuaGVhZGVyKCksXG4gICAgICAgIG5ldyBDaGVzcygpLmZlbigpLFxuICAgICAgKTtcbiAgICAgIHRoaXMuY2hlc3MgPSBuZXdDaGVzcztcbiAgICAgIHRoaXMuYmVnaW5TZXNzaW9uU3RhdGUoe1xuICAgICAgICBnYW1lU2Vzc2lvbklkOiBzZXNzaW9uSWQgPz8gY3JlYXRlR2FtZVNlc3Npb25JZCgpLFxuICAgICAgICBnYW1lU3RhcnRGZW4sXG4gICAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmcsXG4gICAgICAgIHNldHVwTmFtZSxcbiAgICAgICAgc2V0dXBDYXRlZ29yeSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXNldFRyYW5zaWVudEJvYXJkU3RhdGUoKTtcbiAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiUEdOIGxvYWRlZFwiO1xuICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcbiAgICAgIHRoaXMucmVjZW50TW92ZUZlZWRiYWNrID0gbnVsbDtcbiAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXN0YXJ0KCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihcImxvYWRQZ24gZXJyb3I6XCIsIGVycik7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgSW52YWxpZCBQR046ICR7ZXJyfWA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgbG9hZEdhbWVTZXR1cFByZXNldChwcmVzZXQ6IEdhbWVTZXR1cFByZXNldCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHNpZGVMYWJlbCA9IHByZXNldC5zaWRlID09PSBcIndoaXRlXCIgPyBcIldoaXRlXCIgOiBcIkJsYWNrXCI7XG4gICAgY29uc3QgbG9hZGVkID1cbiAgICAgIHByZXNldC5zb3VyY2VUeXBlID09PSBcImZlblwiXG4gICAgICAgID8gdGhpcy5sb2FkRmVuKHByZXNldC5zb3VyY2UsIHtcbiAgICAgICAgICAgIHNldHVwTmFtZTogcHJlc2V0Lm5hbWUsXG4gICAgICAgICAgICBzZXR1cENhdGVnb3J5OiBwcmVzZXQuY2F0ZWdvcnksXG4gICAgICAgICAgfSlcbiAgICAgICAgOiB0aGlzLmxvYWRQZ24ocHJlc2V0LnNvdXJjZSwge1xuICAgICAgICAgICAgc2V0dXBOYW1lOiBwcmVzZXQubmFtZSxcbiAgICAgICAgICAgIHNldHVwQ2F0ZWdvcnk6IHByZXNldC5jYXRlZ29yeSxcbiAgICAgICAgICB9KTtcblxuICAgIGlmIChsb2FkZWQpIHtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGAke3ByZXNldC5uYW1lfSBsb2FkZWQgKCR7c2lkZUxhYmVsfSlgO1xuICAgIH1cblxuICAgIHJldHVybiBsb2FkZWQ7XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBhIG1vdmUgb24gdGhlIGJvYXJkIChzaW1pbGFyIHRvIHRoZSBleGFtcGxlIHBhdHRlcm4pXG4gICAqIFRoaXMgaXMgc3luY2hyb25vdXMgZm9yIGltbWVkaWF0ZSBVSSBmZWVkYmFjaywganVzdCBsaWtlIHRoZSBleGFtcGxlXG4gICAqL1xuICBtYWtlTW92ZShmcm9tOiBTcXVhcmUsIHRvOiBTcXVhcmUsIHByb21vdGlvbiA9IFwicVwiKTogYm9vbGVhbiB7XG4gICAgbG9nZ2VyLmRlYnVnKFwibWFrZU1vdmUgY2FsbGVkXCIsIHtcbiAgICAgIGZyb20sXG4gICAgICB0byxcbiAgICAgIHByb21vdGlvbixcbiAgICAgIGN1cnJlbnRGZW46IHRoaXMuZmVuLFxuICAgICAgY3VycmVudFR1cm46IHRoaXMuY2hlc3MudHVybigpLFxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFRyeSB0byBtYWtlIHRoZSBtb3ZlIGFjY29yZGluZyB0byBjaGVzcy5qcyBsb2dpYyAoZXhhY3RseSBsaWtlIHRoZSBleGFtcGxlKVxuICAgICAgLy8gY2hlc3MuanMgd2lsbCB2YWxpZGF0ZSB0aGUgbW92ZSBhdXRvbWF0aWNhbGx5XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgZnJvbSxcbiAgICAgICAgdG8sXG4gICAgICAgIHByb21vdGlvbjogcHJvbW90aW9uIGFzIFwicVwiIHwgXCJyXCIgfCBcImJcIiB8IFwiblwiIHwgdW5kZWZpbmVkLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChtb3ZlKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcIk1vdmUgc3VjY2Vzc2Z1bDpcIiwgbW92ZS5zYW4pO1xuICAgICAgICAvLyBDbGVhciByZWRvIHN0YWNrIHdoZW4gYSBuZXcgbW92ZSBpcyBtYWRlXG4gICAgICAgIHRoaXMuY2xlYXJSZWRvU3RhdGUoKTtcbiAgICAgICAgdGhpcy5yZWNvcmRNb3ZlQW5ub3RhdGlvbihtb3ZlLCBmYWxzZSwgXCJwbGF5ZXJcIik7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gc3RhdGUgdG8gdHJpZ2dlciBhIHJlLXJlbmRlciAodmlhIE1vYlggb2JzZXJ2YWJsZSlcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0geyBmcm9tLCB0byB9O1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn1gO1xuICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgIGFjdG9yOiBcInBsYXllclwiLFxuICAgICAgICAgIG1vdmUsXG4gICAgICAgICAgaXNCcmlsbGlhbnQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgIHRoaXMubGFzdFNraXBwZWRFbmdpbmVNb3ZlTWVzc2FnZSA9IG51bGw7XG5cbiAgICAgICAgY29uc3Qgc2hvdWxkQXV0b1BsYXlOb3cgPVxuICAgICAgICAgIHRoaXMuYXV0b1BsYXlFbmFibGVkICYmXG4gICAgICAgICAgIXRoaXMuaXNHYW1lT3ZlciAmJlxuICAgICAgICAgIHRoaXMuY2hlc3MudHVybigpID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yO1xuXG4gICAgICAgIC8vIE1ha2UgZW5naW5lIG1vdmUgYWZ0ZXIgYSBzaG9ydCBkZWxheSBpZjpcbiAgICAgICAgLy8gMS4gQXV0by1wbGF5IGlzIGVuYWJsZWRcbiAgICAgICAgLy8gMi4gR2FtZSBpcyBub3Qgb3ZlclxuICAgICAgICAvLyAzLiBJdCdzIG5vdyB0aGUgZW5naW5lJ3MgdHVybiAodGhlIHR1cm4gY2hhbmdlZCBhZnRlciB0aGUgaHVtYW4gbW92ZSlcbiAgICAgICAgaWYgKHNob3VsZEF1dG9QbGF5Tm93KSB7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgICAgICAgXCJTY2hlZHVsaW5nIGF1dG8tcGxheSBmb3IgZW5naW5lIHNpZGU6XCIsXG4gICAgICAgICAgICB0aGlzLmVuZ2luZVBsYXlzRm9yLFxuICAgICAgICAgICk7XG4gICAgICAgICAgdGhpcy5zY2hlZHVsZUF1dG9QbGF5TW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVmZXIgcGxheWVyLW1vdmUgZ3JhZGluZyB3aGlsZSBhbiBlbmdpbmUgYXV0by1wbGF5IHJlcGx5IGlzIHBlbmRpbmcgc29cbiAgICAgICAgLy8gdGhlIHNoYXJlZCBTdG9ja2Zpc2ggd29ya2VyIGNhbiBwcmlvcml0aXplIHRoZSBhY3R1YWwgbW92ZSByZXNwb25zZS5cbiAgICAgICAgdGhpcy5zY2hlZHVsZVBsYXllck1vdmVBbmFseXNpcyhtb3ZlKTtcblxuICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBhcyB0aGUgbW92ZSB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcIk1vdmUgZmFpbGVkIC0gY2hlc3MuanMgcmV0dXJuZWQgbnVsbFwiKTtcbiAgICAgICAgLy8gUmV0dXJuIGZhbHNlIGFzIHRoZSBtb3ZlIHdhcyBub3Qgc3VjY2Vzc2Z1bFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZGVidWcoXCJNb3ZlIGV4Y2VwdGlvbjpcIiwgZXJyKTtcbiAgICAgIC8vIFJldHVybiBmYWxzZSBhcyB0aGUgbW92ZSB3YXMgbm90IHN1Y2Nlc3NmdWxcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBhIG1vdmUgZnJvbSBVQ0kgbm90YXRpb24gKGUuZy4sIFwiZTJlNFwiKVxuICAgKiBVc2VkIGJ5IHRoZSBlbmdpbmVcbiAgICovXG4gIGFzeW5jIG1ha2VNb3ZlVUNJKFxuICAgIHVjaTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IHsgY29uc3VtZWRCcmlsbGlhbnQ/OiBib29sZWFuIH0gPSB7fSxcbiAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHVjaS5sZW5ndGggPCA0KSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBmcm9tID0gdWNpLnNsaWNlKDAsIDIpIGFzIFNxdWFyZTtcbiAgICBjb25zdCB0byA9IHVjaS5zbGljZSgyLCA0KSBhcyBTcXVhcmU7XG4gICAgY29uc3QgcHJvbW90aW9uID0gdWNpLmxlbmd0aCA+IDQgPyB1Y2lbNF0gOiB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbW92ZSA9IHRoaXMuY2hlc3MubW92ZSh7XG4gICAgICAgIGZyb20sXG4gICAgICAgIHRvLFxuICAgICAgICBwcm9tb3Rpb246IHByb21vdGlvbiBhcyBcInFcIiB8IFwiclwiIHwgXCJiXCIgfCBcIm5cIiB8IHVuZGVmaW5lZCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobW92ZSkge1xuICAgICAgICAvLyBDbGVhciByZWRvIHN0YWNrIHdoZW4gYSBuZXcgbW92ZSBpcyBtYWRlXG4gICAgICAgIHRoaXMuY2xlYXJSZWRvU3RhdGUoKTtcbiAgICAgICAgdGhpcy5yZWNvcmRNb3ZlQW5ub3RhdGlvbihcbiAgICAgICAgICBtb3ZlLFxuICAgICAgICAgIG9wdGlvbnMuY29uc3VtZWRCcmlsbGlhbnQgPz8gZmFsc2UsXG4gICAgICAgICAgXCJlbmdpbmVcIixcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0geyBmcm9tLCB0byB9O1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgRW5naW5lIHBsYXllZDogJHttb3ZlLnNhbn1gO1xuICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgIGFjdG9yOiBcImVuZ2luZVwiLFxuICAgICAgICAgIG1vdmUsXG4gICAgICAgICAgaXNCcmlsbGlhbnQ6IG9wdGlvbnMuY29uc3VtZWRCcmlsbGlhbnQgPz8gZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNvbHZlIGFuZCBwbGF5IHRoZSBuZXh0IG1vdmUgdXNpbmcgdGhlIGVuZ2luZSBhbmQgYnVja2V0IGNvbmZpZ3VyYXRpb25cbiAgICovXG4gIGFzeW5jIHNvbHZlTmV4dE1vdmUoYXV0b1RyaWdnZXJlZCA9IGZhbHNlKTogUHJvbWlzZTxQaWNrZWRNb3ZlUmVzdWx0IHwgbnVsbD4ge1xuICAgIGlmICh0aGlzLmlzR2FtZU92ZXIpIHtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiR2FtZSBpcyBvdmVyXCI7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBcIkVuZ2luZSB0aGlua2luZy4uLlwiO1xuICAgICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgZW5naW5lIGlmIG5lZWRlZFxuICAgICAgaWYgKCFlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCkge1xuICAgICAgICBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBBbmFseXplIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgIGNvbnN0IGFuYWx5c2lzID0gYXdhaXQgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbihcbiAgICAgICAgdGhpcy5mZW4sXG4gICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCxcbiAgICAgICAgY29uZmlnVmlld01vZGVsLm11bHRpUFYsXG4gICAgICAgIFwiZW5naW5lTW92ZVwiLFxuICAgICAgKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgYW5hbHlzaXMgcmV0dXJuZWQgbm8gbW92ZXMgKGdhbWUgb3ZlciBwb3NpdGlvbilcbiAgICAgIGlmIChhbmFseXNpcy5pZ25vcmVkIHx8IGFuYWx5c2lzLm1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgaWYgKGFuYWx5c2lzLmlnbm9yZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiRW5naW5lIGFuYWx5c2lzIGV4cGlyZWRcIjtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNDaGVja21hdGUpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiQ2hlY2ttYXRlISBHYW1lIG92ZXIuXCI7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzU3RhbGVtYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBcIlN0YWxlbWF0ZSEgR2FtZSBvdmVyLlwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0RyYXcpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiRHJhdyEgR2FtZSBvdmVyLlwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBcIk5vIGxlZ2FsIG1vdmVzIGF2YWlsYWJsZVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBhbmFseXNpcy5pZ25vcmVkXG4gICAgICAgICAgICA/IFwiQSBuZXdlciBlbmdpbmUgYW5hbHlzaXMgcmVwbGFjZWQgdGhpcyBtb3ZlIHJlcXVlc3QuXCJcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBQaWNrIGEgbW92ZSBiYXNlZCBvbiBidWNrZXQgY29uZmlndXJhdGlvblxuICAgICAgY29uc3QgcGVyc29uYSA9IGNvbmZpZ1ZpZXdNb2RlbC5jdXJyZW50UHJlc2V0SWQgPz8gXCJjdXN0b21cIjtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcyhcbiAgICAgICAgYW5hbHlzaXMsXG4gICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5idWNrZXRDb25maWcsXG4gICAgICAgIHtcbiAgICAgICAgICBmZW46IHRoaXMuZmVuLFxuICAgICAgICAgIGdhbWVTdGFydEZlbjogdGhpcy5nYW1lU3RhcnRGZW4sXG4gICAgICAgICAgbW92ZUNvdW50OiB0aGlzLm1vdmVDb3VudCxcbiAgICAgICAgICBzaWRlVG9Nb3ZlOiB0aGlzLnR1cm4sXG4gICAgICAgICAgcGVyc29uYSxcbiAgICAgICAgfSxcbiAgICAgICk7XG5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgaWYgKGF1dG9UcmlnZ2VyZWQgJiYgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlSHVtYW5EZWxheVNpbXVsYXRpb24pIHtcbiAgICAgICAgICBjb25zdCBkZWxheU1zID0gY2FsY3VsYXRlSHVtYW5EZWxheU1zKHtcbiAgICAgICAgICAgIGNvbXBsZXhpdHk6IGFuYWx5c2lzLmNvbXBsZXhpdHksXG4gICAgICAgICAgICBwZXJzb25hLFxuICAgICAgICAgICAgYnVja2V0OiByZXN1bHQuYnVja2V0LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGF3YWl0IHRoaXMud2FpdChkZWxheU1zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY2FuQXBwbHlBbmFseXplZE1vdmUodGhpcy5mZW4sIGFuYWx5c2lzLmFuYWx5emVkRmVuKSkge1xuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9XG4gICAgICAgICAgICAgIFwiUG9zaXRpb24gY2hhbmdlZCwgc3RhbGUgZW5naW5lIG1vdmUgZGlzY2FyZGVkXCI7XG4gICAgICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPVxuICAgICAgICAgICAgICBcIlNraXBwZWQgZW5naW5lIG1vdmUgYmVjYXVzZSB0aGUgYm9hcmQgY2hhbmdlZCBiZWZvcmUgaXQgY291bGQgYmUgcGxheWVkLlwiO1xuICAgICAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBcHBseSB0aGUgcGlja2VkIG1vdmVcbiAgICAgICAgY29uc3QgbW92ZVN1Y2Nlc3MgPSBhd2FpdCB0aGlzLm1ha2VNb3ZlVUNJKHJlc3VsdC5tb3ZlLm1vdmUsIHtcbiAgICAgICAgICBjb25zdW1lZEJyaWxsaWFudDogcmVzdWx0LmlzQnJpbGxpYW50ID8/IGZhbHNlLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAobW92ZVN1Y2Nlc3MpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUxhc3RBbm5vdGF0aW9uKHtcbiAgICAgICAgICAgIGJ1Y2tldDogcmVzdWx0LmJ1Y2tldCxcbiAgICAgICAgICAgIGV2YWxMb3NzOiByZXN1bHQubW92ZS5ldmFsTG9zcyxcbiAgICAgICAgICAgIGV2YWx1YXRpb246IHJlc3VsdC5tb3ZlLmV2YWx1YXRpb24sXG4gICAgICAgICAgICBjb21wbGV4aXR5TGV2ZWw6IGFuYWx5c2lzLmNvbXBsZXhpdHkubGV2ZWwsXG4gICAgICAgICAgICBjb21wbGV4aXR5U2NvcmU6IGFuYWx5c2lzLmNvbXBsZXhpdHkuc2NvcmUsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gcmVzdWx0LmJ1Y2tldDtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IHJlc3VsdC5pc0JyaWxsaWFudFxuICAgICAgICAgICAgICA/IFwiRW5naW5lIHBsYXllZDogQnJpbGxpYW50IG1vdmVcIlxuICAgICAgICAgICAgICA6IGBFbmdpbmUgcGxheWVkOiAke0JVQ0tFVF9MQUJFTFNbcmVzdWx0LmJ1Y2tldF19IG1vdmVgO1xuICAgICAgICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiRW5naW5lIG1vdmUgZmFpbGVkXCI7XG4gICAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJObyBtb3ZlcyBhdmFpbGFibGVcIjtcbiAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKFwic29sdmVOZXh0TW92ZSBlcnJvcjpcIiwgZXJyKTtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYEVycm9yOiAke2Vycn1gO1xuICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHRoZSBib2FyZCB0byBzdGFydGluZyBwb3NpdGlvblxuICAgKi9cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKFwicmVzZXQgY2FsbGVkXCIpO1xuICAgIHRoaXMuY2hlc3MgPSBuZXcgQ2hlc3MoKTtcbiAgICB0aGlzLmJlZ2luU2Vzc2lvblN0YXRlKHtcbiAgICAgIGdhbWVTZXNzaW9uSWQ6IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKSxcbiAgICAgIGdhbWVTdGFydEZlbjogdGhpcy5jaGVzcy5mZW4oKSxcbiAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IHRydWUsXG4gICAgICBzZXR1cE5hbWU6IFwiTmV3IEdhbWVcIixcbiAgICAgIHNldHVwQ2F0ZWdvcnk6IFwiY3VzdG9tXCIsXG4gICAgfSk7XG4gICAgdGhpcy5yZXNldFRyYW5zaWVudEJvYXJkU3RhdGUoKTtcbiAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgdGhpcy5sYXN0TW92ZSA9IG51bGw7XG4gICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBcIkJvYXJkIHJlc2V0XCI7XG4gICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcbiAgICB0aGlzLnJlY2VudE1vdmVGZWVkYmFjayA9IG51bGw7XG4gICAgZW5naW5lVmlld01vZGVsLnJlc3RhcnQoKTtcbiAgICBsb2dnZXIuZGVidWcoXCJCb2FyZCByZXNldCwgbmV3IEZFTjpcIiwgdGhpcy5mZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuZG8gdGhlIGxhc3QgbW92ZSAob3IgbGFzdCB0d28gbW92ZXMgaWYgYXV0by1wbGF5IGlzIG9uIGFuZCBlbmdpbmUganVzdCBtb3ZlZClcbiAgICovXG4gIHVuZG8oKTogYm9vbGVhbiB7XG4gICAgbG9nZ2VyLmRlYnVnKFwidW5kbyBjYWxsZWQsIGhpc3RvcnkgbGVuZ3RoOlwiLCB0aGlzLmhpc3RvcnkubGVuZ3RoKTtcblxuICAgIC8vIElmIGF1dG8tcGxheSBpcyBlbmFibGVkIGFuZCB0aGUgbGFzdCBtb3ZlIHdhcyBieSB0aGUgZW5naW5lLCB1bmRvIGJvdGggbW92ZXNcbiAgICBpZiAodGhpcy5hdXRvUGxheUVuYWJsZWQgJiYgdGhpcy5oaXN0b3J5Lmxlbmd0aCA+PSAyKSB7XG4gICAgICAvLyBDaGVjayBpZiB0aGUgbGFzdCBtb3ZlIHdhcyBieSB0aGUgZW5naW5lXG4gICAgICBjb25zdCBsYXN0TW92ZSA9IHRoaXMuaGlzdG9yeVt0aGlzLmhpc3RvcnkubGVuZ3RoIC0gMV07XG4gICAgICBjb25zdCBsYXN0TW92ZUNvbG9yID0gbGFzdE1vdmUuY29sb3I7XG5cbiAgICAgIC8vIElmIGxhc3QgbW92ZSB3YXMgYnkgZW5naW5lLCB1bmRvIGJvdGggKGVuZ2luZSBtb3ZlICsgaHVtYW4gbW92ZSlcbiAgICAgIGlmIChsYXN0TW92ZUNvbG9yID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yKSB7XG4gICAgICAgIGlmICh0aGlzLnVuZG9Nb3ZlcygyKSkge1xuICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgICAgICB0aGlzLmxhc3RNb3ZlID0gbnVsbDtcbiAgICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiVW5kaWQgbGFzdCAyIG1vdmVzIChodW1hbiArIGVuZ2luZSlcIjtcbiAgICAgICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG4gICAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKFwiVW5kaWQgMiBtb3Zlc1wiKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTGFzdCBtb3ZlIHdhcyBieSBodW1hbiwganVzdCB1bmRvIG9uZVxuICAgICAgICBpZiAodGhpcy51bmRvTW92ZXMoMSkpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgICAgdGhpcy5sYXN0TW92ZSA9IG51bGw7XG4gICAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBcIk1vdmUgdW5kb25lXCI7XG4gICAgICAgICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICAgICAgICB0aGlzLmNsZWFyUGVuZGluZ1BsYXllck1vdmVBbmFseXNpcygpO1xuICAgICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcIlVuZGlkIDEgbW92ZVwiKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdXRvLXBsYXkgZGlzYWJsZWQgb3Igbm90IGVub3VnaCBtb3ZlcywgdW5kbyBqdXN0IG9uZSBtb3ZlXG4gICAgICBpZiAodGhpcy51bmRvTW92ZXMoMSkpIHtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJNb3ZlIHVuZG9uZVwiO1xuICAgICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgICB0aGlzLmNsZWFyUGVuZGluZ1BsYXllck1vdmVBbmFseXNpcygpO1xuICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiVW5kaWQgMSBtb3ZlXCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsb2dnZXIuZGVidWcoXCJVbmRvIGZhaWxlZCAtIG5vIG1vdmVzIHRvIHVuZG9cIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBpbnRlcm5hbCBzdGF0ZSBmcm9tIGNoZXNzIGluc3RhbmNlXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZVN0YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuZmVuID0gdGhpcy5jaGVzcy5mZW4oKTtcbiAgICB0aGlzLmhpc3RvcnkgPSB0aGlzLmNoZXNzLmhpc3RvcnkoeyB2ZXJib3NlOiB0cnVlIH0pO1xuICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID0gbnVsbDtcbiAgICAvLyBTYXZlIEZFTiB0byBsb2NhbFN0b3JhZ2Ugd2hlbmV2ZXIgaXQgY2hhbmdlc1xuICAgIHRoaXMuc2F2ZUZlblRvSGlzdG9yeSgpO1xuICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgIFwidXBkYXRlU3RhdGUgLSBGRU46XCIsXG4gICAgICB0aGlzLmZlbixcbiAgICAgIFwiSGlzdG9yeSBsZW5ndGg6XCIsXG4gICAgICB0aGlzLmhpc3RvcnkubGVuZ3RoLFxuICAgICk7XG5cbiAgICAvLyBBdXRvbWF0aWNhbGx5IHJlLWFuYWx5emUgbW92ZXMgaWYgYXJyb3dzIGFyZSBlbmFibGVkIChkZWJvdW5jZWQgdG8gcHJldmVudCBleGNlc3NpdmUgY2FsbHMpXG4gICAgaWYgKHRoaXMuc2hvd01vdmVBcnJvd3MgJiYgIXRoaXMuaXNHYW1lT3ZlciAmJiAhdGhpcy5pc0FuYWx5emluZ01vdmVzKSB7XG4gICAgICAvLyBDbGVhciBwcmV2aW91cyBhbmFseXNpcyBhbmQgdHJpZ2dlciBuZXcgYW5hbHlzaXMgYXN5bmNocm9ub3VzbHlcbiAgICAgIC8vIFVzZSBzZXRUaW1lb3V0IHRvIGRlYm91bmNlIGFuZCBwcmV2ZW50IHJlLXJlbmRlciBsb29wc1xuICAgICAgdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzID0ge307XG4gICAgICAvLyBDbGVhciBhbnkgcGVuZGluZyBhbmFseXNpcyB0aW1lb3V0XG4gICAgICBpZiAodGhpcy5fYW5hbHlzaXNUaW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9hbmFseXNpc1RpbWVvdXQpO1xuICAgICAgfVxuICAgICAgLy8gRGVib3VuY2UgYW5hbHlzaXMgdG8gcHJldmVudCBleGNlc3NpdmUgY2FsbHNcbiAgICAgIHRoaXMuX2FuYWx5c2lzVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmFuYWx5emVBbGxNb3ZlcygpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gYW5hbHl6ZSBtb3ZlczpcIiwgZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCAzMDApOyAvLyAzMDBtcyBkZWJvdW5jZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGbGlwIHRoZSBib2FyZCBvcmllbnRhdGlvbiBhbmQgZW5naW5lIHBsYXlpbmcgY29sb3JcbiAgICovXG4gIGZsaXBCb2FyZCgpOiB2b2lkIHtcbiAgICB0aGlzLmJvYXJkRmxpcHBlZCA9ICF0aGlzLmJvYXJkRmxpcHBlZDtcbiAgICAvLyBGbGlwIHRoZSBlbmdpbmUncyBwbGF5aW5nIGNvbG9yIHdoZW4gYm9hcmQgaXMgZmxpcHBlZFxuICAgIHRoaXMuZW5naW5lUGxheXNGb3IgPSB0aGlzLmVuZ2luZVBsYXlzRm9yID09PSBcIndcIiA/IFwiYlwiIDogXCJ3XCI7XG4gICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgXCJCb2FyZCBmbGlwcGVkLCBvcmllbnRhdGlvbjpcIixcbiAgICAgIHRoaXMuYm9hcmRGbGlwcGVkID8gXCJibGFja1wiIDogXCJ3aGl0ZVwiLFxuICAgICAgXCJFbmdpbmUgbm93IHBsYXlzIGZvcjpcIixcbiAgICAgIHRoaXMuZW5naW5lUGxheXNGb3IgPT09IFwid1wiID8gXCJXaGl0ZVwiIDogXCJCbGFja1wiLFxuICAgICk7XG4gIH1cblxuICBzZXRCb2FyZEZsaXBwZWQoZmxpcHBlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLmJvYXJkRmxpcHBlZCAhPT0gZmxpcHBlZCkge1xuICAgICAgdGhpcy5mbGlwQm9hcmQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBjdXJyZW50IEZFTiB0byBsb2NhbFN0b3JhZ2UgaGlzdG9yeVxuICAgKi9cbiAgc2F2ZUZlblRvSGlzdG9yeSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY3VycmVudEZlbiA9IHRoaXMuZmVuO1xuXG4gICAgICAvLyBTYXZlIGN1cnJlbnQgRkVOXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLkZFTl9TVE9SQUdFX0tFWSwgY3VycmVudEZlbik7XG5cbiAgICAgIC8vIEdldCBleGlzdGluZyBoaXN0b3J5XG4gICAgICBjb25zdCBoaXN0b3J5SnNvbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX0hJU1RPUllfS0VZKTtcbiAgICAgIGxldCBoaXN0b3J5OiBzdHJpbmdbXSA9IGhpc3RvcnlKc29uID8gSlNPTi5wYXJzZShoaXN0b3J5SnNvbikgOiBbXTtcblxuICAgICAgaWYgKGhpc3RvcnkubGVuZ3RoID09PSAwIHx8IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSAxXSAhPT0gY3VycmVudEZlbikge1xuICAgICAgICBoaXN0b3J5LnB1c2goY3VycmVudEZlbik7XG5cbiAgICAgICAgaWYgKGhpc3RvcnkubGVuZ3RoID4gdGhpcy5NQVhfSElTVE9SWSkge1xuICAgICAgICAgIGhpc3RvcnkgPSBoaXN0b3J5LnNsaWNlKC10aGlzLk1BWF9ISVNUT1JZKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuRkVOX0hJU1RPUllfS0VZLCBKU09OLnN0cmluZ2lmeShoaXN0b3J5KSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5wZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgIGNvbnN0IGJvYXJkU3RhdGU6IFBlcnNpc3RlZEJvYXJkU3RhdGUgPSB7XG4gICAgICAgICAgY3VycmVudEZlbixcbiAgICAgICAgICBmZW5IaXN0b3J5OiBoaXN0b3J5LFxuICAgICAgICAgIGdhbWVTZXNzaW9uSWQ6IHRoaXMuZ2FtZVNlc3Npb25JZCxcbiAgICAgICAgICBnYW1lU3RhcnRGZW46IHRoaXMuZ2FtZVN0YXJ0RmVuLFxuICAgICAgICAgIGN1cnJlbnRTZXR1cE5hbWU6IHRoaXMuY3VycmVudFNldHVwTmFtZSxcbiAgICAgICAgICBjdXJyZW50U2V0dXBDYXRlZ29yeTogdGhpcy5jdXJyZW50U2V0dXBDYXRlZ29yeSxcbiAgICAgICAgICBoaXN0b3J5QW5ub3RhdGlvbnM6IHRoaXMuaGlzdG9yeUFubm90YXRpb25zLFxuICAgICAgICAgIHJlZG9Bbm5vdGF0aW9uczogdGhpcy5yZWRvQW5ub3RhdGlvbnMsXG4gICAgICAgIH07XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICAgIHRoaXMuQk9BUkRfU1RBVEVfU1RPUkFHRV9LRVksXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkoYm9hcmRTdGF0ZSksXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsZWFyUGVyc2lzdGVkQm9hcmRTdGF0ZSgpO1xuICAgICAgfVxuXG4gICAgICBsb2dnZXIuZGVidWcoXCJTYXZlZCBGRU4gdG8gaGlzdG9yeSwgdG90YWwgZW50cmllczpcIiwgaGlzdG9yeS5sZW5ndGgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIHNhdmUgRkVOIHRvIGhpc3Rvcnk6XCIsIGVycik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmUgRkVOIGZyb20gbG9jYWxTdG9yYWdlIG9uIGFwcCBzdGFydHVwXG4gICAqL1xuICBwcml2YXRlIHJlc3RvcmVGZW5Gcm9tU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2F2ZWRGZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkZFTl9TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoc2F2ZWRGZW4pIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgRkVOIGJlZm9yZSBsb2FkaW5nXG4gICAgICAgIGNvbnN0IHRlc3RDaGVzcyA9IG5ldyBDaGVzcygpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRlc3RDaGVzcy5sb2FkKHNhdmVkRmVuKTtcbiAgICAgICAgICAvLyBGRU4gaXMgdmFsaWQsIGxvYWQgaXRcbiAgICAgICAgICBjb25zdCByZXN0b3JlZEJvYXJkU3RhdGUgPSB0aGlzLnJlYWRQZXJzaXN0ZWRCb2FyZFN0YXRlKCk7XG4gICAgICAgICAgaWYgKHJlc3RvcmVkQm9hcmRTdGF0ZT8uY3VycmVudEZlbiA9PT0gc2F2ZWRGZW4pIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEZlbihzYXZlZEZlbiwge1xuICAgICAgICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgc2Vzc2lvbklkOiByZXN0b3JlZEJvYXJkU3RhdGUuZ2FtZVNlc3Npb25JZCxcbiAgICAgICAgICAgICAgZ2FtZVN0YXJ0RmVuOiByZXN0b3JlZEJvYXJkU3RhdGUuZ2FtZVN0YXJ0RmVuLFxuICAgICAgICAgICAgICBoaXN0b3J5QW5ub3RhdGlvbnM6IHJlc3RvcmVkQm9hcmRTdGF0ZS5oaXN0b3J5QW5ub3RhdGlvbnMsXG4gICAgICAgICAgICAgIHJlZG9Bbm5vdGF0aW9uczogcmVzdG9yZWRCb2FyZFN0YXRlLnJlZG9Bbm5vdGF0aW9ucyxcbiAgICAgICAgICAgICAgc2V0dXBOYW1lOiByZXN0b3JlZEJvYXJkU3RhdGUuY3VycmVudFNldHVwTmFtZSxcbiAgICAgICAgICAgICAgc2V0dXBDYXRlZ29yeTogcmVzdG9yZWRCb2FyZFN0YXRlLmN1cnJlbnRTZXR1cENhdGVnb3J5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEZlbihzYXZlZEZlbiwge1xuICAgICAgICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudEdhbWVTZXNzaW9uSWQgIT09XG4gICAgICAgICAgICB0aGlzLmdhbWVTZXNzaW9uSWRcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0QnJpbGxpYW50VHJhY2tpbmcodGhpcy5nYW1lU2Vzc2lvbklkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJSZXN0b3JlZCBwb3NpdGlvbiBmcm9tIHByZXZpb3VzIHNlc3Npb25cIjtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoXCJSZXN0b3JlZCBGRU4gZnJvbSBzdG9yYWdlOlwiLCBzYXZlZEZlbik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGxvZ2dlci53YXJuKFwiU2F2ZWQgRkVOIGlzIGludmFsaWQsIHVzaW5nIGRlZmF1bHQ6XCIsIGVycik7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5GRU5fU1RPUkFHRV9LRVkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gcmVzdG9yZSBGRU4gZnJvbSBzdG9yYWdlOlwiLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIEZFTiBmcm9tIGhpc3RvcnkgYnkgaW5kZXhcbiAgICovXG4gIGxvYWRGZW5Gcm9tSGlzdG9yeShpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhpc3RvcnlKc29uID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5GRU5fSElTVE9SWV9LRVkpO1xuICAgICAgaWYgKCFoaXN0b3J5SnNvbikgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBjb25zdCBoaXN0b3J5OiBzdHJpbmdbXSA9IEpTT04ucGFyc2UoaGlzdG9yeUpzb24pO1xuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBoaXN0b3J5Lmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBjb25zdCBmZW4gPSBoaXN0b3J5W2luZGV4XTtcbiAgICAgIHJldHVybiB0aGlzLmxvYWRGZW4oZmVuKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBsb2FkIEZFTiBmcm9tIGhpc3Rvcnk6XCIsIGVycik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBGRU4gaGlzdG9yeVxuICAgKi9cbiAgZ2V0IGZlbkhpc3RvcnkoKTogc3RyaW5nW10ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBoaXN0b3J5SnNvbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX0hJU1RPUllfS0VZKTtcbiAgICAgIHJldHVybiBoaXN0b3J5SnNvbiA/IEpTT04ucGFyc2UoaGlzdG9yeUpzb24pIDogW107XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbGFzdCBzYXZlZCBGRU5cbiAgICovXG4gIGdldCBsYXN0U2F2ZWRGZW4oKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkZFTl9TVE9SQUdFX0tFWSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlIHNob3dpbmcgbW92ZSBhcnJvd3NcbiAgICovXG4gIHRvZ2dsZU1vdmVBcnJvd3MoKTogdm9pZCB7XG4gICAgLy8gQ2xlYXIgYW55IHBlbmRpbmcgYW5hbHlzaXMgdGltZW91dFxuICAgIGlmICh0aGlzLl9hbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9hbmFseXNpc1RpbWVvdXQpO1xuICAgICAgdGhpcy5fYW5hbHlzaXNUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLnNob3dNb3ZlQXJyb3dzID0gIXRoaXMuc2hvd01vdmVBcnJvd3M7XG4gICAgaWYgKFxuICAgICAgdGhpcy5zaG93TW92ZUFycm93cyAmJlxuICAgICAgT2JqZWN0LmtleXModGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzKS5sZW5ndGggPT09IDAgJiZcbiAgICAgICF0aGlzLmlzQW5hbHl6aW5nTW92ZXNcbiAgICApIHtcbiAgICAgIC8vIEF1dG8tYW5hbHl6ZSBpZiBhcnJvd3MgYXJlIGVuYWJsZWQgYW5kIHdlIGRvbid0IGhhdmUgYW5hbHlzaXMgeWV0XG4gICAgICB0aGlzLmFuYWx5emVBbGxNb3ZlcygpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIltCb2FyZFZpZXdNb2RlbF0gRmFpbGVkIHRvIGFuYWx5emUgbW92ZXM6XCIsIGVycik7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLnNob3dNb3ZlQXJyb3dzKSB7XG4gICAgICAvLyBDbGVhciBhbmFseXNpcyB3aGVuIGFycm93cyBhcmUgZGlzYWJsZWQgdG8gZnJlZSBtZW1vcnlcbiAgICAgIHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcyA9IHt9O1xuICAgICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHNldFNob3dNb3ZlQXJyb3dzRW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2hvd01vdmVBcnJvd3MgIT09IGVuYWJsZWQpIHtcbiAgICAgIHRoaXMudG9nZ2xlTW92ZUFycm93cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hpY2ggc2lkZSdzIG1vdmVzIHRvIHNob3cgYXJyb3dzIGZvclxuICAgKi9cbiAgc2V0U2hvd0Fycm93c0ZvclNpZGUoc2lkZTogXCJjdXJyZW50XCIgfCBcInBsYXllclwiIHwgXCJlbmdpbmVcIik6IHZvaWQge1xuICAgIHRoaXMuc2hvd0Fycm93c0ZvclNpZGUgPSBzaWRlO1xuICAgIGxvZ2dlci5kZWJ1ZyhcIlNob3cgYXJyb3dzIGZvciBzaWRlOlwiLCBzaWRlKTtcbiAgICAvLyBSZS1hbmFseXplIGlmIGFycm93cyBhcmUgZW5hYmxlZFxuICAgIGlmICh0aGlzLnNob3dNb3ZlQXJyb3dzKSB7XG4gICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID0gbnVsbDtcbiAgICAgIHRoaXMuYW5hbHl6ZUFsbE1vdmVzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFuYWx5emUgYWxsIGxlZ2FsIG1vdmVzIGZvciB0aGUgY3VycmVudCBwb3NpdGlvblxuICAgKi9cbiAgYXN5bmMgYW5hbHl6ZUFsbE1vdmVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmlzR2FtZU92ZXIgfHwgdGhpcy5pc0FuYWx5emluZ01vdmVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPT09IHRoaXMuZmVuICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMpLmxlbmd0aCA+IDBcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzQW5hbHl6aW5nTW92ZXMgPSB0cnVlO1xuICAgICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTsgLy8gQ2xlYXJcbiAgICAgIH0pO1xuXG4gICAgICAvLyBHZXQgYWxsIGxlZ2FsIG1vdmVzXG4gICAgICBjb25zdCBsZWdhbE1vdmVzID0gdGhpcy5hbGxMZWdhbE1vdmVzO1xuICAgICAgaWYgKGxlZ2FsTW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gSW5pdGlhbGl6ZSBlbmdpbmUgaWYgbmVlZGVkXG4gICAgICBpZiAoIWVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkKSB7XG4gICAgICAgIGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFuYWx5emUgY3VycmVudCBwb3NpdGlvblxuICAgICAgY29uc3QgYW5hbHlzaXMgPSBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uKFxuICAgICAgICB0aGlzLmZlbixcbiAgICAgICAgY29uZmlnVmlld01vZGVsLmRlcHRoLFxuICAgICAgICBjb25maWdWaWV3TW9kZWwubXVsdGlQVixcbiAgICAgICAgXCJiYWNrZ3JvdW5kXCIsXG4gICAgICApO1xuXG4gICAgICBpZiAoXG4gICAgICAgIGFuYWx5c2lzLmlnbm9yZWQgfHxcbiAgICAgICAgIWNhbkFwcGx5QW5hbHl6ZWRNb3ZlKHRoaXMuZmVuLCBhbmFseXNpcy5hbmFseXplZEZlbilcbiAgICAgICkge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBhIG1hcCBvZiBVQ0kgbW92ZXMgdG8gdGhlaXIgcXVhbGl0eSBidWNrZXRzXG4gICAgICBjb25zdCBtb3ZlTWFwID0gbWFwTGVnYWxNb3Zlc1RvQnVja2V0cyhcbiAgICAgICAgbGVnYWxNb3Zlcy5tYXAoXG4gICAgICAgICAgKG1vdmUpID0+IGAke21vdmUuZnJvbX0ke21vdmUudG99JHttb3ZlLnByb21vdGlvbiB8fCBcIlwifWAsXG4gICAgICAgICksXG4gICAgICAgIGFuYWx5c2lzLm1vdmVzLFxuICAgICAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbixcbiAgICAgICk7XG5cbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzID0gbW92ZU1hcDtcbiAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPSB0aGlzLmZlbjtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcIkFuYWx5emVkXCIsIE9iamVjdC5rZXlzKG1vdmVNYXApLmxlbmd0aCwgXCJsZWdhbCBtb3Zlc1wiKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBhbmFseXplIG1vdmVzOlwiLCBlcnIpO1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbmFseXplIHRoZSBxdWFsaXR5IG9mIGEgcGxheWVyJ3MgbW92ZVxuICAgKiBUaGlzIHNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaXMgbWFkZSwgYW5hbHl6aW5nIHRoZSBwb3NpdGlvbiBiZWZvcmUgdGhlIG1vdmVcbiAgICovXG4gIGFzeW5jIGFuYWx5emVQbGF5ZXJNb3ZlKG1vdmU6IE1vdmUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBSdW4gYXN5bmNocm9ub3VzbHkgc28gaXQgZG9lc24ndCBibG9jayB0aGUgVUlcbiAgICBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGV4cGVjdGVkQWZ0ZXJGZW4gPSBtb3ZlLmFmdGVyO1xuICAgICAgICAvLyBJbml0aWFsaXplIGVuZ2luZSBpZiBuZWVkZWRcbiAgICAgICAgaWYgKCFlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgdGhlIHBvc2l0aW9uIGJlZm9yZSB0aGUgbW92ZSAoZnJvbSBoaXN0b3J5KVxuICAgICAgICBjb25zdCBoaXN0b3J5ID0gdGhpcy5jaGVzcy5oaXN0b3J5KHsgdmVyYm9zZTogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKGhpc3RvcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBObyBoaXN0b3J5LCBjYW4ndCBhbmFseXplXG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbW92ZSB3ZSBqdXN0IG1hZGUgaXMgdGhlIGxhc3Qgb25lIGluIGhpc3RvcnlcbiAgICAgICAgLy8gV2UgbmVlZCB0byBhbmFseXplIHRoZSBwb3NpdGlvbiBiZWZvcmUgaXRcbiAgICAgICAgLy8gY2hlc3MuanMgaGlzdG9yeSB2ZXJib3NlIGluY2x1ZGVzICdiZWZvcmUnIGFuZCAnYWZ0ZXInIEZFTlxuICAgICAgICBjb25zdCBsYXN0TW92ZUluSGlzdG9yeSA9IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSAxXSBhcyBNb3ZlICYge1xuICAgICAgICAgIGJlZm9yZT86IHN0cmluZztcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYmVmb3JlRmVuID0gbGFzdE1vdmVJbkhpc3RvcnkuYmVmb3JlIHx8IHRoaXMuZmVuO1xuXG4gICAgICAgIC8vIEFuYWx5emUgdGhlIHBvc2l0aW9uIGJlZm9yZSB0aGUgbW92ZVxuICAgICAgICBjb25zdCBhbmFseXNpcyA9IGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24oXG4gICAgICAgICAgYmVmb3JlRmVuLFxuICAgICAgICAgIE1hdGgubWluKGNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCwgMTUpLCAvLyBVc2Ugc21hbGxlciBkZXB0aCBmb3IgZmFzdGVyIGFuYWx5c2lzXG4gICAgICAgICAgY29uZmlnVmlld01vZGVsLm11bHRpUFYsXG4gICAgICAgICAgXCJiYWNrZ3JvdW5kXCIsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGFuYWx5c2lzLmlnbm9yZWQgfHxcbiAgICAgICAgICAhY2FuQXBwbHlBbmFseXplZE1vdmUoYmVmb3JlRmVuLCBhbmFseXNpcy5hbmFseXplZEZlbikgfHxcbiAgICAgICAgICB0aGlzLmZlbiAhPT0gZXhwZWN0ZWRBZnRlckZlblxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5kIHRoZSBtb3ZlIGluIHRoZSBhbmFseXplZCBtb3Zlc1xuICAgICAgICBjb25zdCBtb3ZlVUNJID0gYCR7bW92ZS5mcm9tfSR7bW92ZS50b30ke21vdmUucHJvbW90aW9uIHx8IFwiXCJ9YDtcbiAgICAgICAgY29uc3QgYW5hbHl6ZWRNb3ZlID0gYW5hbHlzaXMubW92ZXMuZmluZCgobSkgPT4gbS5tb3ZlID09PSBtb3ZlVUNJKTtcbiAgICAgICAgaWYgKGFuYWx5emVkTW92ZSkge1xuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gYW5hbHl6ZWRNb3ZlLmJ1Y2tldDtcbiAgICAgICAgICAgIGNvbnN0IHF1YWxpdHlMYWJlbCA9IEJVQ0tFVF9MQUJFTFNbYW5hbHl6ZWRNb3ZlLmJ1Y2tldF07XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn0gKCR7cXVhbGl0eUxhYmVsfSlgO1xuICAgICAgICAgICAgdGhpcy5wdWJsaXNoTW92ZUZlZWRiYWNrKHtcbiAgICAgICAgICAgICAgYWN0b3I6IFwicGxheWVyXCIsXG4gICAgICAgICAgICAgIG1vdmUsXG4gICAgICAgICAgICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgICAgICAgcXVhbGl0eUxhYmVsLFxuICAgICAgICAgICAgICBidWNrZXQ6IGFuYWx5emVkTW92ZS5idWNrZXQsXG4gICAgICAgICAgICAgIHNpbGVudDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcIlBsYXllciBtb3ZlIHF1YWxpdHk6XCIsIGFuYWx5emVkTW92ZS5idWNrZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbikge1xuICAgICAgICAgICAgICB0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eSA9IFwiZmFsbGJhY2tcIjtcbiAgICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYFlvdSBwbGF5ZWQ6ICR7bW92ZS5zYW59IChGYWxsYmFjayBtb3ZlKWA7XG4gICAgICAgICAgICAgIHRoaXMucHVibGlzaE1vdmVGZWVkYmFjayh7XG4gICAgICAgICAgICAgICAgYWN0b3I6IFwicGxheWVyXCIsXG4gICAgICAgICAgICAgICAgbW92ZSxcbiAgICAgICAgICAgICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgICAgICAgICAgICAgcXVhbGl0eUxhYmVsOiBcIkZhbGxiYWNrIG1vdmVcIixcbiAgICAgICAgICAgICAgICBidWNrZXQ6IFwiZmFsbGJhY2tcIixcbiAgICAgICAgICAgICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPSBcImdvb2RcIjtcbiAgICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYFlvdSBwbGF5ZWQ6ICR7bW92ZS5zYW59IChHb29kKWA7XG4gICAgICAgICAgICAgIHRoaXMucHVibGlzaE1vdmVGZWVkYmFjayh7XG4gICAgICAgICAgICAgICAgYWN0b3I6IFwicGxheWVyXCIsXG4gICAgICAgICAgICAgICAgbW92ZSxcbiAgICAgICAgICAgICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgICAgICAgICAgICAgcXVhbGl0eUxhYmVsOiBcIkdvb2RcIixcbiAgICAgICAgICAgICAgICBidWNrZXQ6IFwiZ29vZFwiLFxuICAgICAgICAgICAgICAgIHNpbGVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gYW5hbHl6ZSBwbGF5ZXIgbW92ZTpcIiwgZXJyKTtcbiAgICAgICAgLy8gRG9uJ3QgdXBkYXRlIHN0YXR1cyBvbiBlcnJvciwga2VlcCB0aGUgb3JpZ2luYWwgbWVzc2FnZVxuICAgICAgfVxuICAgIH0sIDEwMCk7XG4gIH1cblxuICBwcml2YXRlIHNjaGVkdWxlUGxheWVyTW92ZUFuYWx5c2lzKG1vdmU6IE1vdmUpOiB2b2lkIHtcbiAgICB0aGlzLmNsZWFyUGVuZGluZ1BsYXllck1vdmVBbmFseXNpcygpO1xuXG4gICAgY29uc3QgYXR0ZW1wdEFuYWx5c2lzID0gKCk6IHZvaWQgPT4ge1xuICAgICAgdGhpcy5fcGxheWVyTW92ZUFuYWx5c2lzVGltZW91dCA9IG51bGw7XG5cbiAgICAgIGNvbnN0IGF1dG9QbGF5UGVuZGluZyA9XG4gICAgICAgIHRoaXMuYXV0b1BsYXlFbmFibGVkICYmXG4gICAgICAgICF0aGlzLmF1dG9QbGF5UGF1c2VkICYmXG4gICAgICAgICF0aGlzLmlzR2FtZU92ZXIgJiZcbiAgICAgICAgKHRoaXMuaXNUaGlua2luZyB8fFxuICAgICAgICAgIHRoaXMuaXNBdXRvUGxheUNvdW50aW5nRG93biB8fFxuICAgICAgICAgIHRoaXMudHVybiA9PT0gdGhpcy5lbmdpbmVQbGF5c0Zvcik7XG5cbiAgICAgIGlmIChhdXRvUGxheVBlbmRpbmcpIHtcbiAgICAgICAgdGhpcy5fcGxheWVyTW92ZUFuYWx5c2lzVGltZW91dCA9IHNldFRpbWVvdXQoYXR0ZW1wdEFuYWx5c2lzLCAxNTApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZvaWQgdGhpcy5hbmFseXplUGxheWVyTW92ZShtb3ZlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fcGxheWVyTW92ZUFuYWx5c2lzVGltZW91dCA9IHNldFRpbWVvdXQoYXR0ZW1wdEFuYWx5c2lzLCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYXJyb3dzIGRhdGEgZm9yIHJlYWN0LWNoZXNzYm9hcmRcbiAgICogUmV0dXJucyBhcnJheSBvZiBBcnJvdyBvYmplY3RzIHdpdGggc3RhcnRTcXVhcmUsIGVuZFNxdWFyZSwgYW5kIGNvbG9yIHByb3BlcnRpZXNcbiAgICogT25seSBzaG93cyBhcnJvd3MgZm9yIEV4Y2VsbGVudCwgR29vZCwgTWlzdGFrZSwgYW5kIEJsdW5kZXIgbW92ZXNcbiAgICogTGltaXRlZCB0byBtYXhpbXVtIDMgYXJyb3dzIHBlciBxdWFsaXR5IGJ1Y2tldFxuICAgKi9cbiAgZ2V0IG1vdmVBcnJvd3MoKTogQXJyYXk8e1xuICAgIHN0YXJ0U3F1YXJlOiBzdHJpbmc7XG4gICAgZW5kU3F1YXJlOiBzdHJpbmc7XG4gICAgY29sb3I6IHN0cmluZztcbiAgfT4ge1xuICAgIGlmIChcbiAgICAgICF0aGlzLnNob3dNb3ZlQXJyb3dzIHx8XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMpLmxlbmd0aCA9PT0gMFxuICAgICkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIE9ubHkgc2hvdyBhcnJvd3MgZm9yIHRoZXNlIHNwZWNpZmljIG1vdmUgcXVhbGl0aWVzXG4gICAgY29uc3QgYWxsb3dlZEJ1Y2tldHM6IE1vdmVCdWNrZXRbXSA9IFtcbiAgICAgIFwiZXhjZWxsZW50XCIsXG4gICAgICBcImdvb2RcIixcbiAgICAgIFwibWlzdGFrZVwiLFxuICAgICAgXCJibHVuZGVyXCIsXG4gICAgXTtcbiAgICBjb25zdCBtYXhBcnJvd3NQZXJCdWNrZXQgPSAzO1xuXG4gICAgbGV0IGxlZ2FsTW92ZXMgPSB0aGlzLmFsbExlZ2FsTW92ZXM7XG5cbiAgICAvLyBGaWx0ZXIgbW92ZXMgYnkgc2lkZSBpZiBuZWVkZWRcbiAgICBpZiAodGhpcy5zaG93QXJyb3dzRm9yU2lkZSA9PT0gXCJwbGF5ZXJcIikge1xuICAgICAgLy8gU2hvdyBtb3ZlcyBmb3IgdGhlIHNpZGUgdGhhdCB0aGUgZW5naW5lIGlzIE5PVCBwbGF5aW5nIGZvclxuICAgICAgY29uc3QgcGxheWVyU2lkZSA9IHRoaXMuZW5naW5lUGxheXNGb3IgPT09IFwid1wiID8gXCJiXCIgOiBcIndcIjtcbiAgICAgIGxlZ2FsTW92ZXMgPSBsZWdhbE1vdmVzLmZpbHRlcigobW92ZSkgPT4ge1xuICAgICAgICBjb25zdCBwaWVjZSA9IHRoaXMuZ2V0UGllY2VBdChtb3ZlLmZyb20pO1xuICAgICAgICByZXR1cm4gcGllY2UgJiYgcGllY2UuY29sb3IgPT09IHBsYXllclNpZGU7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hvd0Fycm93c0ZvclNpZGUgPT09IFwiZW5naW5lXCIpIHtcbiAgICAgIC8vIFNob3cgbW92ZXMgZm9yIHRoZSBzaWRlIHRoYXQgdGhlIGVuZ2luZSBJUyBwbGF5aW5nIGZvclxuICAgICAgbGVnYWxNb3ZlcyA9IGxlZ2FsTW92ZXMuZmlsdGVyKChtb3ZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpZWNlID0gdGhpcy5nZXRQaWVjZUF0KG1vdmUuZnJvbSk7XG4gICAgICAgIHJldHVybiBwaWVjZSAmJiBwaWVjZS5jb2xvciA9PT0gdGhpcy5lbmdpbmVQbGF5c0ZvcjtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBJZiAnY3VycmVudCcsIHNob3cgYWxsIGxlZ2FsIG1vdmVzIChhbHJlYWR5IGZpbHRlcmVkIGJ5IGNoZXNzLmpzIHRvIGN1cnJlbnQgdHVybilcblxuICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byB2YWxpZGF0ZSBzcXVhcmUgZm9ybWF0IChhLWgsIDEtOClcbiAgICBjb25zdCBpc1ZhbGlkU3F1YXJlID0gKHNxdWFyZTogdW5rbm93bik6IHNxdWFyZSBpcyBTcXVhcmUgPT4ge1xuICAgICAgaWYgKCFzcXVhcmUgfHwgdHlwZW9mIHNxdWFyZSAhPT0gXCJzdHJpbmdcIikgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuIC9eW2EtaF1bMS04XSQvLnRlc3Qoc3F1YXJlKTtcbiAgICB9O1xuXG4gICAgLy8gR3JvdXAgbW92ZXMgYnkgYnVja2V0XG4gICAgY29uc3QgbW92ZXNCeUJ1Y2tldDogUmVjb3JkPFxuICAgICAgTW92ZUJ1Y2tldCxcbiAgICAgIEFycmF5PHsgc3RhcnRTcXVhcmU6IHN0cmluZzsgZW5kU3F1YXJlOiBzdHJpbmc7IGNvbG9yOiBzdHJpbmcgfT5cbiAgICA+ID0ge1xuICAgICAgZXhjZWxsZW50OiBbXSxcbiAgICAgIGdvb2Q6IFtdLFxuICAgICAgbWlzdGFrZTogW10sXG4gICAgICBibHVuZGVyOiBbXSxcbiAgICAgIGJlc3Q6IFtdLCAvLyBOb3QgdXNlZCBidXQgbmVlZGVkIGZvciB0eXBlXG4gICAgICBncmVhdDogW10sIC8vIE5vdCB1c2VkIGJ1dCBuZWVkZWQgZm9yIHR5cGVcbiAgICAgIGluYWNjdXJhY3k6IFtdLCAvLyBOb3QgdXNlZCBidXQgbmVlZGVkIGZvciB0eXBlXG4gICAgfTtcblxuICAgIC8vIENvbGxlY3QgYWxsIHZhbGlkIG1vdmVzIGdyb3VwZWQgYnkgYnVja2V0XG4gICAgZm9yIChjb25zdCBtb3ZlIG9mIGxlZ2FsTW92ZXMpIHtcbiAgICAgIC8vIFZhbGlkYXRlIHRoYXQgbW92ZSBoYXMgdmFsaWQgZnJvbSBhbmQgdG8gc3F1YXJlc1xuICAgICAgaWYgKCFpc1ZhbGlkU3F1YXJlKG1vdmUuZnJvbSkgfHwgIWlzVmFsaWRTcXVhcmUobW92ZS50bykpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiU2tpcHBpbmcgaW52YWxpZCBtb3ZlOlwiLCBtb3ZlKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVjaSA9IGAke21vdmUuZnJvbX0ke21vdmUudG99JHttb3ZlLnByb21vdGlvbiB8fCBcIlwifWA7XG4gICAgICBjb25zdCBidWNrZXQgPSB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXNbdWNpXTtcblxuICAgICAgLy8gT25seSBpbmNsdWRlIG1vdmVzIGZyb20gYWxsb3dlZCBidWNrZXRzXG4gICAgICBpZiAoXG4gICAgICAgIGJ1Y2tldCAmJlxuICAgICAgICBidWNrZXQgIT09IFwiZmFsbGJhY2tcIiAmJlxuICAgICAgICBhbGxvd2VkQnVja2V0cy5pbmNsdWRlcyhidWNrZXQpICYmXG4gICAgICAgIGlzVmFsaWRTcXVhcmUobW92ZS5mcm9tKSAmJlxuICAgICAgICBpc1ZhbGlkU3F1YXJlKG1vdmUudG8pXG4gICAgICApIHtcbiAgICAgICAgbW92ZXNCeUJ1Y2tldFtidWNrZXRdLnB1c2goe1xuICAgICAgICAgIHN0YXJ0U3F1YXJlOiBtb3ZlLmZyb20sXG4gICAgICAgICAgZW5kU3F1YXJlOiBtb3ZlLnRvLFxuICAgICAgICAgIGNvbG9yOiBCVUNLRVRfQ09MT1JTW2J1Y2tldF0sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExpbWl0IHRvIG1heCAzIGFycm93cyBwZXIgYnVja2V0IGFuZCBjb21iaW5lXG4gICAgY29uc3QgYXJyb3dzOiBBcnJheTx7XG4gICAgICBzdGFydFNxdWFyZTogc3RyaW5nO1xuICAgICAgZW5kU3F1YXJlOiBzdHJpbmc7XG4gICAgICBjb2xvcjogc3RyaW5nO1xuICAgIH0+ID0gW107XG4gICAgZm9yIChjb25zdCBidWNrZXQgb2YgYWxsb3dlZEJ1Y2tldHMpIHtcbiAgICAgIGNvbnN0IGJ1Y2tldEFycm93cyA9IG1vdmVzQnlCdWNrZXRbYnVja2V0XS5zbGljZSgwLCBtYXhBcnJvd3NQZXJCdWNrZXQpO1xuICAgICAgYXJyb3dzLnB1c2goLi4uYnVja2V0QXJyb3dzKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgYEFkZGVkICR7YnVja2V0QXJyb3dzLmxlbmd0aH0gJHtidWNrZXR9IGFycm93cyAoZm91bmQgJHttb3Zlc0J5QnVja2V0W2J1Y2tldF0ubGVuZ3RofSB0b3RhbClgLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsb2dnZXIuZGVidWcoXCJHZW5lcmF0ZWRcIiwgYXJyb3dzLmxlbmd0aCwgXCJ0b3RhbCBhcnJvd3NcIik7XG4gICAgcmV0dXJuIGFycm93cztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW5hbHl6ZWQgbGVnYWwgbW92ZXMgY291bnQgKGZvciBVSSBkaXNwbGF5KVxuICAgKi9cbiAgZ2V0IGFuYWx5emVkTGVnYWxNb3Zlc0NvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcykubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IHR1cm4gKHdoaXRlL2JsYWNrKVxuICAgKiBSZWFkcyBgZmVuYCBzbyBNb2JYIHJlY29tcHV0ZXMgd2hlbiB0aGUgYm9hcmQgdXBkYXRlcyAoY2hlc3MuanMgbXV0YXRlcyBpbiBwbGFjZSkuXG4gICAqL1xuICBnZXQgdHVybigpOiBcIndcIiB8IFwiYlwiIHtcbiAgICB2b2lkIHRoaXMuZmVuO1xuICAgIHJldHVybiB0aGlzLmNoZXNzLnR1cm4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdHVybiBhcyBzdHJpbmdcbiAgICovXG4gIGdldCB0dXJuU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudHVybiA9PT0gXCJ3XCIgPyBcIldoaXRlXCIgOiBcIkJsYWNrXCI7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgZ2FtZSBpcyBvdmVyXG4gICAqL1xuICBnZXQgaXNHYW1lT3ZlcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5pc0dhbWVPdmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgaXQncyBjaGVja21hdGVcbiAgICovXG4gIGdldCBpc0NoZWNrbWF0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5pc0NoZWNrbWF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGl0J3Mgc3RhbGVtYXRlXG4gICAqL1xuICBnZXQgaXNTdGFsZW1hdGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaXNTdGFsZW1hdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBpdCdzIGEgZHJhd1xuICAgKi9cbiAgZ2V0IGlzRHJhdygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5pc0RyYXcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBraW5nIGlzIGluIGNoZWNrXG4gICAqL1xuICBnZXQgaXNDaGVjaygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5pc0NoZWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdhbWUgc3RhdHVzIHRleHRcbiAgICovXG4gIGdldCBnYW1lU3RhdHVzKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuaXNDaGVja21hdGUpIHtcbiAgICAgIHJldHVybiBgQ2hlY2ttYXRlISAke3RoaXMudHVybiA9PT0gXCJ3XCIgPyBcIkJsYWNrXCIgOiBcIldoaXRlXCJ9IHdpbnNgO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc1N0YWxlbWF0ZSkge1xuICAgICAgcmV0dXJuIFwiU3RhbGVtYXRlIVwiO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0RyYXcpIHtcbiAgICAgIHJldHVybiBcIkRyYXchXCI7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzQ2hlY2spIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLnR1cm5TdHJpbmd9IGlzIGluIGNoZWNrYDtcbiAgICB9XG4gICAgcmV0dXJuIGAke3RoaXMudHVyblN0cmluZ30gdG8gbW92ZWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGxlZ2FsIG1vdmVzIGZvciBhIHNxdWFyZVxuICAgKi9cbiAgZ2V0TGVnYWxNb3ZlcyhzcXVhcmU6IFNxdWFyZSk6IE1vdmVbXSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MubW92ZXMoeyBzcXVhcmUsIHZlcmJvc2U6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBpZWNlIGF0IHNxdWFyZSAoZm9yIFVJIHZpc3VhbCBpbmRpY2F0b3JzKVxuICAgKi9cbiAgZ2V0UGllY2VBdChzcXVhcmU6IFNxdWFyZSkge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmdldChzcXVhcmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgbGVnYWwgbW92ZXNcbiAgICovXG4gIGdldCBhbGxMZWdhbE1vdmVzKCk6IE1vdmVbXSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MubW92ZXMoeyB2ZXJib3NlOiB0cnVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBtb3ZlIGNvdW50XG4gICAqL1xuICBnZXQgbW92ZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MubW92ZU51bWJlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuZG8gYSBzaW5nbGUgbW92ZSAoZm9yIHRoZSBuZXcgdW5kbyBidXR0b24pXG4gICAqL1xuICB1bmRvU2luZ2xlKCk6IGJvb2xlYW4ge1xuICAgIGxvZ2dlci5kZWJ1ZyhcInVuZG9TaW5nbGUgY2FsbGVkLCBoaXN0b3J5IGxlbmd0aDpcIiwgdGhpcy5oaXN0b3J5Lmxlbmd0aCk7XG5cbiAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLnVuZG8oKTtcbiAgICBpZiAobW92ZSkge1xuICAgICAgLy8gQWRkIHRvIHJlZG8gc3RhY2tcbiAgICAgIHRoaXMucmVkb1N0YWNrLnB1c2gobW92ZSk7XG4gICAgICBjb25zdCBhbm5vdGF0aW9uID0gdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMucG9wKCk7XG4gICAgICBpZiAoYW5ub3RhdGlvbikge1xuICAgICAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucy5wdXNoKGFubm90YXRpb24pO1xuICAgICAgfVxuICAgICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcblxuICAgICAgLy8gVXBkYXRlIGxhc3RNb3ZlIGlmIHRoZXJlIGFyZSBzdGlsbCBtb3ZlcyBpbiBoaXN0b3J5XG4gICAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbGFzdE1vdmVJbkhpc3RvcnkgPSB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5Lmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0ge1xuICAgICAgICAgIGZyb206IGxhc3RNb3ZlSW5IaXN0b3J5LmZyb20gYXMgU3F1YXJlLFxuICAgICAgICAgIHRvOiBsYXN0TW92ZUluSGlzdG9yeS50byBhcyBTcXVhcmUsXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiVW5kaWQgMSBtb3ZlXCI7XG4gICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgdGhpcy5jbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTtcbiAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiVW5kaWQgMSBtb3ZlLCByZWRvIHN0YWNrIHNpemU6XCIsIHRoaXMucmVkb1N0YWNrLmxlbmd0aCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVkbyBhIHNpbmdsZSBtb3ZlXG4gICAqL1xuICByZWRvU2luZ2xlKCk6IGJvb2xlYW4ge1xuICAgIGxvZ2dlci5kZWJ1ZyhcInJlZG9TaW5nbGUgY2FsbGVkLCByZWRvIHN0YWNrIHNpemU6XCIsIHRoaXMucmVkb1N0YWNrLmxlbmd0aCk7XG5cbiAgICBpZiAodGhpcy5yZWRvU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbW92ZVRvUmVkbyA9IHRoaXMucmVkb1N0YWNrLnBvcCgpO1xuICAgIGlmICghbW92ZVRvUmVkbykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBhbm5vdGF0aW9uVG9SZWRvID0gdGhpcy5yZWRvQW5ub3RhdGlvbnMucG9wKCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbW92ZSA9IHRoaXMuY2hlc3MubW92ZSh7XG4gICAgICAgIGZyb206IG1vdmVUb1JlZG8uZnJvbSBhcyBTcXVhcmUsXG4gICAgICAgIHRvOiBtb3ZlVG9SZWRvLnRvIGFzIFNxdWFyZSxcbiAgICAgICAgcHJvbW90aW9uOiBtb3ZlVG9SZWRvLnByb21vdGlvbixcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobW92ZSkge1xuICAgICAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5wdXNoKFxuICAgICAgICAgIGFubm90YXRpb25Ub1JlZG8gPz8gdGhpcy5jcmVhdGVNb3ZlQW5ub3RhdGlvbihtb3ZlLCBmYWxzZSwgXCJyZWRvXCIpLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLnN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSB7IGZyb206IG1vdmUuZnJvbSBhcyBTcXVhcmUsIHRvOiBtb3ZlLnRvIGFzIFNxdWFyZSB9O1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgUmVkaWQ6ICR7bW92ZS5zYW59YDtcbiAgICAgICAgdGhpcy5wdWJsaXNoTW92ZUZlZWRiYWNrKHtcbiAgICAgICAgICBhY3RvcjogXCJyZWRvXCIsXG4gICAgICAgICAgbW92ZSxcbiAgICAgICAgICBpc0JyaWxsaWFudDogYW5ub3RhdGlvblRvUmVkbz8uY29uc3VtZWRCcmlsbGlhbnQgPz8gZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsZWFyUGVuZGluZ1BsYXllck1vdmVBbmFseXNpcygpO1xuICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiUmVkaWQgMSBtb3ZlXCIpO1xuXG4gICAgICAgIC8vIElmIGF1dG8tcGxheSBpcyBlbmFibGVkIGFuZCBpdCdzIG5vdyB0aGUgZW5naW5lJ3MgdHVybiwgdHJpZ2dlciBhdXRvLXBsYXlcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHRoaXMuYXV0b1BsYXlFbmFibGVkICYmXG4gICAgICAgICAgIXRoaXMuaXNHYW1lT3ZlciAmJlxuICAgICAgICAgIHRoaXMuY2hlc3MudHVybigpID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yXG4gICAgICAgICkge1xuICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcIlNjaGVkdWxpbmcgYXV0by1wbGF5IGFmdGVyIHJlZG9cIik7XG4gICAgICAgICAgdGhpcy5zY2hlZHVsZUF1dG9QbGF5TW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoXCJSZWRvIGZhaWxlZDpcIiwgZXJyKTtcbiAgICAgIC8vIFB1dCB0aGUgbW92ZSBiYWNrIG9uIHRoZSBzdGFjayBpZiBpdCBmYWlsZWRcbiAgICAgIHRoaXMucmVkb1N0YWNrLnB1c2gobW92ZVRvUmVkbyk7XG4gICAgICBpZiAoYW5ub3RhdGlvblRvUmVkbykge1xuICAgICAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucy5wdXNoKGFubm90YXRpb25Ub1JlZG8pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB1bmRvIGlzIGF2YWlsYWJsZVxuICAgKi9cbiAgZ2V0IGNhblVuZG8oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeS5sZW5ndGggPiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHJlZG8gaXMgYXZhaWxhYmxlXG4gICAqL1xuICBnZXQgY2FuUmVkbygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5yZWRvU3RhY2subGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldCBhdXRvUGxheUN1cnJlbnRTaWRlTGFiZWwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5lbmdpbmVQbGF5c0ZvciA9PT0gXCJ3XCIgPyBcIldoaXRlXCIgOiBcIkJsYWNrXCI7XG4gIH1cblxuICBnZXQgY2FuU3RhcnRBdXRvUGxheVR1cm4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuYXV0b1BsYXlFbmFibGVkICYmXG4gICAgICAhdGhpcy5hdXRvUGxheVBhdXNlZCAmJlxuICAgICAgIXRoaXMuaXNUaGlua2luZyAmJlxuICAgICAgIXRoaXMuaXNHYW1lT3ZlciAmJlxuICAgICAgdGhpcy50dXJuID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yXG4gICAgKTtcbiAgfVxuXG4gIGdldCBpc0F1dG9QbGF5Q291bnRpbmdEb3duKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmF1dG9QbGF5U2NoZWR1bGVkRm9yID4gRGF0ZS5ub3coKTtcbiAgfVxuXG4gIGdldCBhdXRvUGxheUNvdW50ZG93bk1zUmVtYWluaW5nKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaXNBdXRvUGxheUNvdW50aW5nRG93blxuICAgICAgPyBNYXRoLm1heCgwLCB0aGlzLmF1dG9QbGF5U2NoZWR1bGVkRm9yIC0gRGF0ZS5ub3coKSlcbiAgICAgIDogMDtcbiAgfVxuXG4gIGdldCBtb3ZlSGlzdG9yeVJvd3MoKTogQXJyYXk8e1xuICAgIG1vdmVOdW1iZXI6IG51bWJlcjtcbiAgICB3aGl0ZTogTW92ZSB8IG51bGw7XG4gICAgYmxhY2s6IE1vdmUgfCBudWxsO1xuICB9PiB7XG4gICAgY29uc3Qgcm93czogQXJyYXk8e1xuICAgICAgbW92ZU51bWJlcjogbnVtYmVyO1xuICAgICAgd2hpdGU6IE1vdmUgfCBudWxsO1xuICAgICAgYmxhY2s6IE1vdmUgfCBudWxsO1xuICAgIH0+ID0gW107XG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5oaXN0b3J5Lmxlbmd0aDsgaW5kZXggKz0gMikge1xuICAgICAgY29uc3Qgd2hpdGVNb3ZlID0gdGhpcy5oaXN0b3J5W2luZGV4XSA/PyBudWxsO1xuICAgICAgY29uc3QgYmxhY2tNb3ZlID0gdGhpcy5oaXN0b3J5W2luZGV4ICsgMV0gPz8gbnVsbDtcbiAgICAgIGNvbnN0IG1vdmVOdW1iZXIgPVxuICAgICAgICB3aGl0ZU1vdmU/Lm1vdmVOdW1iZXIgPz8gYmxhY2tNb3ZlPy5tb3ZlTnVtYmVyID8/IHJvd3MubGVuZ3RoICsgMTtcbiAgICAgIHJvd3MucHVzaCh7XG4gICAgICAgIG1vdmVOdW1iZXIsXG4gICAgICAgIHdoaXRlOiB3aGl0ZU1vdmUsXG4gICAgICAgIGJsYWNrOiBibGFja01vdmUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGdldCBkZWJ1Z1Nlc3Npb25JZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdhbWVTZXNzaW9uSWQ7XG4gIH1cblxuICBnZXQgbW92ZUFubm90YXRpb25zKCk6IE1vdmVBbm5vdGF0aW9uW10ge1xuICAgIHJldHVybiB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5tYXAoKGFubm90YXRpb24pID0+ICh7IC4uLmFubm90YXRpb24gfSkpO1xuICB9XG5cbiAgZ2V0IGF1dG9QbGF5QWN0aXZlRHVyYXRpb25NcygpOiBudW1iZXIge1xuICAgIGlmIChcbiAgICAgIHRoaXMuYXV0b1BsYXlFbmFibGVkICYmXG4gICAgICAhdGhpcy5hdXRvUGxheVBhdXNlZCAmJlxuICAgICAgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgIT09IG51bGxcbiAgICApIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuYXV0b1BsYXlBY2N1bXVsYXRlZE1zICsgKERhdGUubm93KCkgLSB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYXV0b1BsYXlBY2N1bXVsYXRlZE1zO1xuICB9XG5cbiAgZ2V0IGhhc1NraXBwZWRFbmdpbmVNb3ZlTm90aWNlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgIT09IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3J0IGN1cnJlbnQgZ2FtZSBhcyBQR05cbiAgICovXG4gIGdldCBwZ24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5wZ24oKTtcbiAgfVxuXG4gIGdldCBsYXN0UGxheWVyTW92ZVF1YWxpdHlMYWJlbCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHlcbiAgICAgID8gRElTUExBWV9CVUNLRVRfTEFCRUxTW3RoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5XVxuICAgICAgOiBudWxsO1xuICB9XG5cbiAgZ2V0IGxhc3RQbGF5ZXJNb3ZlUXVhbGl0eUNvbG9yKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eVxuICAgICAgPyBESVNQTEFZX0JVQ0tFVF9DT0xPUlNbdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHldXG4gICAgICA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIHdhaXQoZGVsYXlNczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5TXMpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgY2FuU2NoZWR1bGVBdXRvUGxheSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgJiZcbiAgICAgICF0aGlzLmF1dG9QbGF5UGF1c2VkICYmXG4gICAgICAhdGhpcy5pc1RoaW5raW5nICYmXG4gICAgICAhdGhpcy5pc0dhbWVPdmVyICYmXG4gICAgICB0aGlzLnR1cm4gPT09IHRoaXMuZW5naW5lUGxheXNGb3JcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBiZWdpblNlc3Npb25TdGF0ZShvcHRpb25zOiB7XG4gICAgZ2FtZVNlc3Npb25JZDogc3RyaW5nO1xuICAgIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IGJvb2xlYW47XG4gICAgaGlzdG9yeUFubm90YXRpb25zPzogTW92ZUFubm90YXRpb25bXTtcbiAgICByZWRvQW5ub3RhdGlvbnM/OiBNb3ZlQW5ub3RhdGlvbltdO1xuICAgIHNldHVwTmFtZT86IHN0cmluZztcbiAgICBzZXR1cENhdGVnb3J5Pzogc3RyaW5nO1xuICB9KTogdm9pZCB7XG4gICAgdGhpcy5zdG9wQXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgdGhpcy5nYW1lU2Vzc2lvbklkID0gb3B0aW9ucy5nYW1lU2Vzc2lvbklkO1xuICAgIHRoaXMuZ2FtZVN0YXJ0RmVuID0gb3B0aW9ucy5nYW1lU3RhcnRGZW47XG4gICAgdGhpcy5zZXNzaW9uU3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLmN1cnJlbnRTZXR1cE5hbWUgPSBvcHRpb25zLnNldHVwTmFtZSA/PyBcIkN1c3RvbSBQb3NpdGlvblwiO1xuICAgIHRoaXMuY3VycmVudFNldHVwQ2F0ZWdvcnkgPSBvcHRpb25zLnNldHVwQ2F0ZWdvcnkgPz8gXCJjdXN0b21cIjtcbiAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucyA9IFsuLi4ob3B0aW9ucy5oaXN0b3J5QW5ub3RhdGlvbnMgPz8gW10pXTtcbiAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucyA9IFsuLi4ob3B0aW9ucy5yZWRvQW5ub3RhdGlvbnMgPz8gW10pXTtcbiAgICB0aGlzLnJlZG9TdGFjayA9IHRoaXMuY3JlYXRlUmVkb1N0YWNrRnJvbUFubm90YXRpb25zKHRoaXMucmVkb0Fubm90YXRpb25zKTtcbiAgICB0aGlzLmF1dG9QbGF5QWNjdW11bGF0ZWRNcyA9IDA7XG4gICAgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgPVxuICAgICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgJiYgIXRoaXMuYXV0b1BsYXlQYXVzZWQgPyBEYXRlLm5vdygpIDogbnVsbDtcbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIGlmIChvcHRpb25zLnJlc2V0QnJpbGxpYW50VHJhY2tpbmcpIHtcbiAgICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0QnJpbGxpYW50VHJhY2tpbmcodGhpcy5nYW1lU2Vzc2lvbklkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUmVkb1N0YXRlKCk6IHZvaWQge1xuICAgIHRoaXMucmVkb1N0YWNrID0gW107XG4gICAgdGhpcy5yZWRvQW5ub3RhdGlvbnMgPSBbXTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlTW92ZUFubm90YXRpb24oXG4gICAgbW92ZTogTW92ZSAmIHsgYmVmb3JlPzogc3RyaW5nOyBhZnRlcj86IHN0cmluZyB9LFxuICAgIGNvbnN1bWVkQnJpbGxpYW50OiBib29sZWFuLFxuICAgIGFjdG9yOiBcInBsYXllclwiIHwgXCJlbmdpbmVcIiB8IFwicmVkb1wiLFxuICApOiBNb3ZlQW5ub3RhdGlvbiB7XG4gICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBwcmV2aW91c1RpbWVzdGFtcCA9XG4gICAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9uc1t0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5sZW5ndGggLSAxXT8udGltZXN0YW1wID8/XG4gICAgICB0aGlzLnNlc3Npb25TdGFydGVkQXQ7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJlZm9yZUZlbjogbW92ZS5iZWZvcmUgPz8gdGhpcy5mZW4sXG4gICAgICBhZnRlckZlbjogbW92ZS5hZnRlciA/PyB0aGlzLmNoZXNzLmZlbigpLFxuICAgICAgdWNpOiBgJHttb3ZlLmZyb219JHttb3ZlLnRvfSR7bW92ZS5wcm9tb3Rpb24gfHwgXCJcIn1gLFxuICAgICAgbW92ZU51bWJlcjogdGhpcy5jaGVzcy5tb3ZlTnVtYmVyKCksXG4gICAgICBjb25zdW1lZEJyaWxsaWFudCxcbiAgICAgIGFjdG9yLFxuICAgICAgc2FuOiBtb3ZlLnNhbixcbiAgICAgIHRpbWVzdGFtcCxcbiAgICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiBNYXRoLm1heCgwLCB0aW1lc3RhbXAgLSBwcmV2aW91c1RpbWVzdGFtcCksXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgcmVjb3JkTW92ZUFubm90YXRpb24oXG4gICAgbW92ZTogTW92ZSAmIHsgYmVmb3JlPzogc3RyaW5nOyBhZnRlcj86IHN0cmluZyB9LFxuICAgIGNvbnN1bWVkQnJpbGxpYW50OiBib29sZWFuLFxuICAgIGFjdG9yOiBcInBsYXllclwiIHwgXCJlbmdpbmVcIiB8IFwicmVkb1wiLFxuICApOiB2b2lkIHtcbiAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5wdXNoKFxuICAgICAgdGhpcy5jcmVhdGVNb3ZlQW5ub3RhdGlvbihtb3ZlLCBjb25zdW1lZEJyaWxsaWFudCwgYWN0b3IpLFxuICAgICk7XG4gICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk6IHZvaWQge1xuICAgIGNvbnN0IHVzYWdlID0gZGVyaXZlQnJpbGxpYW50VXNhZ2UodGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMpO1xuICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlY29uY2lsZUJyaWxsaWFudFRyYWNraW5nKFxuICAgICAgdGhpcy5nYW1lU2Vzc2lvbklkLFxuICAgICAgdXNhZ2UuYnJpbGxpYW50TW92ZU51bWJlcnMsXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVBdXRvUGxheU1vdmUoXG4gICAgZGVsYXlNcyA9IHVpU3RhdGVWaWV3TW9kZWwuYXV0b1BsYXlEZWxheU1zLFxuICApOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoXCJzY2hlZHVsZUF1dG9QbGF5TW92ZSBjYWxsZWRcIiwgeyBkZWxheU1zIH0pO1xuICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG5cbiAgICBpZiAoIXRoaXMuY2FuU2NoZWR1bGVBdXRvUGxheSkge1xuICAgICAgbG9nZ2VyLmRlYnVnKFwic2NoZWR1bGVBdXRvUGxheU1vdmUgbm90IHNjaGVkdWxpbmcsIG5vdCBpbiBhIHZhbGlkIHN0YXRlXCIpO1xuICAgICAgLyoqXG4gICAgICAgKiBcbiAgICAgICAqIHRoaXMuYXV0b1BsYXlFbmFibGVkICYmXG4gICAgICAhdGhpcy5hdXRvUGxheVBhdXNlZCAmJlxuICAgICAgIXRoaXMuaXNUaGlua2luZyAmJlxuICAgICAgIXRoaXMuaXNHYW1lT3ZlciAmJlxuICAgICAgdGhpcy50dXJuID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yXG4gICAgICBcbiAgICAgICAqL1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiY2FuU2NoZWR1bGVBdXRvUGxheTpcIiwgdGhpcy5jYW5TY2hlZHVsZUF1dG9QbGF5KTtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcImF1dG9QbGF5RW5hYmxlZDpcIiwgdGhpcy5hdXRvUGxheUVuYWJsZWQpO1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiYXV0b1BsYXlQYXVzZWQ6XCIsIHRoaXMuYXV0b1BsYXlQYXVzZWQpO1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiaXNUaGlua2luZzpcIiwgdGhpcy5pc1RoaW5raW5nKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcImlzR2FtZU92ZXI6XCIsIHRoaXMuaXNHYW1lT3Zlcik7XG4gICAgICBsb2dnZXIuZGVidWcoXCJ0dXJuOlwiLCB0aGlzLnR1cm4pO1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiZW5naW5lUGxheXNGb3I6XCIsIHRoaXMuZW5naW5lUGxheXNGb3IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxvZ2dlci5kZWJ1ZyhcInNjaGVkdWxlQXV0b1BsYXlNb3ZlIHNjaGVkdWxpbmcsIGluIGEgdmFsaWQgc3RhdGVcIik7XG4gICAgdGhpcy5hdXRvUGxheVNjaGVkdWxlZEZvciA9IERhdGUubm93KCkgKyBkZWxheU1zO1xuICAgIHRoaXMuX2F1dG9QbGF5VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICBsb2dnZXIuZGVidWcoXCJzY2hlZHVsZUF1dG9QbGF5TW92ZSB0aW1lb3V0IGFjdGlvblwiKTtcbiAgICAgICAgdGhpcy5hdXRvUGxheVNjaGVkdWxlZEZvciA9IDA7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuc29sdmVOZXh0TW92ZSh0cnVlKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcInNjaGVkdWxlQXV0b1BsYXlNb3ZlIHRpbWVvdXQgZXJyb3JcIiwgZXJyKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFwiQXV0by1wbGF5IGVycm9yOlwiLCBlcnIpO1xuICAgICAgfSk7XG4gICAgfSwgZGVsYXlNcyk7XG4gIH1cblxuICBwcml2YXRlIGNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYXV0b1BsYXlUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fYXV0b1BsYXlUaW1lb3V0KTtcbiAgICAgIHRoaXMuX2F1dG9QbGF5VGltZW91dCA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgPSAwO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BsYXllck1vdmVBbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wbGF5ZXJNb3ZlQW5hbHlzaXNUaW1lb3V0KTtcbiAgICAgIHRoaXMuX3BsYXllck1vdmVBbmFseXNpc1RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVzZXRUcmFuc2llbnRCb2FyZFN0YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9hbmFseXNpc1RpbWVvdXQpO1xuICAgICAgdGhpcy5fYW5hbHlzaXNUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG4gICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgdGhpcy5hdXRvUGxheVBhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgPSAwO1xuICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gbnVsbDtcbiAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICB0aGlzLmFuYWx5emVkTGVnYWxNb3Zlc0ZlbiA9IG51bGw7XG4gIH1cblxuICBwcml2YXRlIHN5bmNBdXRvUGxheVNjaGVkdWxlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNhblNjaGVkdWxlQXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVBdXRvUGxheU1vdmUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdG9wQXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5hdXRvUGxheUFjY3VtdWxhdGVkTXMgKz0gRGF0ZS5ub3coKSAtIHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0O1xuICAgICAgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3RhcnRBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTogdm9pZCB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgJiZcbiAgICAgICF0aGlzLmF1dG9QbGF5UGF1c2VkICYmXG4gICAgICB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCA9PT0gbnVsbFxuICAgICkge1xuICAgICAgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgPSBEYXRlLm5vdygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlTGFzdEFubm90YXRpb24ocGFydGlhbDogUGFydGlhbDxNb3ZlQW5ub3RhdGlvbj4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdEluZGV4ID0gdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMubGVuZ3RoIC0gMTtcbiAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9uc1tsYXN0SW5kZXhdID0ge1xuICAgICAgLi4udGhpcy5oaXN0b3J5QW5ub3RhdGlvbnNbbGFzdEluZGV4XSxcbiAgICAgIC4uLnBhcnRpYWwsXG4gICAgfTtcbiAgICB0aGlzLnNhdmVGZW5Ub0hpc3RvcnkoKTtcbiAgfVxuXG4gIHByaXZhdGUgcHVibGlzaE1vdmVGZWVkYmFjayhvcHRpb25zOiB7XG4gICAgYWN0b3I6IFwicGxheWVyXCIgfCBcImVuZ2luZVwiIHwgXCJyZWRvXCI7XG4gICAgbW92ZTogTW92ZTtcbiAgICBpc0JyaWxsaWFudDogYm9vbGVhbjtcbiAgICBxdWFsaXR5TGFiZWw/OiBzdHJpbmcgfCBudWxsO1xuICAgIGJ1Y2tldD86IERpc3BsYXlNb3ZlQnVja2V0IHwgTW92ZUJ1Y2tldCB8IG51bGw7XG4gICAgc2lsZW50PzogYm9vbGVhbjtcbiAgfSk6IHZvaWQge1xuICAgIHRoaXMucmVjZW50TW92ZUZlZWRiYWNrID0ge1xuICAgICAgaWQ6IGAke0RhdGUubm93KCl9XyR7b3B0aW9ucy5tb3ZlLnNhbn1fJHtvcHRpb25zLmFjdG9yfWAsXG4gICAgICBhY3Rvcjogb3B0aW9ucy5hY3RvcixcbiAgICAgIHNhbjogb3B0aW9ucy5tb3ZlLnNhbixcbiAgICAgIHF1YWxpdHlMYWJlbDogb3B0aW9ucy5xdWFsaXR5TGFiZWwgPz8gbnVsbCxcbiAgICAgIGJ1Y2tldDogb3B0aW9ucy5idWNrZXQgPz8gbnVsbCxcbiAgICAgIGlzQnJpbGxpYW50OiBvcHRpb25zLmlzQnJpbGxpYW50LFxuICAgICAgaXNDYXB0dXJlOiBvcHRpb25zLm1vdmUuaXNDYXB0dXJlKCksXG4gICAgICBpc0NoZWNrOiBvcHRpb25zLm1vdmUuc2FuLmluY2x1ZGVzKFwiK1wiKSB8fCBvcHRpb25zLm1vdmUuc2FuLmluY2x1ZGVzKFwiI1wiKSxcbiAgICAgIGlzR2FtZUVuZDogdGhpcy5pc0dhbWVPdmVyLFxuICAgICAgc2lsZW50OiBvcHRpb25zLnNpbGVudCA/PyBmYWxzZSxcbiAgICAgIGNyZWF0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSB1bmRvTW92ZXMoY291bnQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHVuZG9uZU1vdmVzOiBNb3ZlW10gPSBbXTtcbiAgICBjb25zdCB1bmRvbmVBbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGNvdW50OyBpbmRleCArPSAxKSB7XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy51bmRvKCk7XG4gICAgICBpZiAoIW1vdmUpIHtcbiAgICAgICAgZm9yIChcbiAgICAgICAgICBsZXQgcmVzdG9yZUluZGV4ID0gdW5kb25lTW92ZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICByZXN0b3JlSW5kZXggPj0gMDtcbiAgICAgICAgICByZXN0b3JlSW5kZXggLT0gMVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCByZXN0b3JlTW92ZSA9IHVuZG9uZU1vdmVzW3Jlc3RvcmVJbmRleF07XG4gICAgICAgICAgdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgICAgIGZyb206IHJlc3RvcmVNb3ZlLmZyb20gYXMgU3F1YXJlLFxuICAgICAgICAgICAgdG86IHJlc3RvcmVNb3ZlLnRvIGFzIFNxdWFyZSxcbiAgICAgICAgICAgIHByb21vdGlvbjogcmVzdG9yZU1vdmUucHJvbW90aW9uLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdW5kb25lTW92ZXMucHVzaChtb3ZlKTtcbiAgICAgIGNvbnN0IGFubm90YXRpb24gPSB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5wb3AoKTtcbiAgICAgIGlmIChhbm5vdGF0aW9uKSB7XG4gICAgICAgIHVuZG9uZUFubm90YXRpb25zLnB1c2goYW5ub3RhdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZWRvU3RhY2sucHVzaCguLi51bmRvbmVNb3Zlcyk7XG4gICAgdGhpcy5yZWRvQW5ub3RhdGlvbnMucHVzaCguLi51bmRvbmVBbm5vdGF0aW9ucyk7XG4gICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZFBlcnNpc3RlZEJvYXJkU3RhdGUoKTogUGVyc2lzdGVkQm9hcmRTdGF0ZSB8IG51bGwge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWZlYXR1cmVPcHRpb25zVmlld01vZGVsLnBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5CT0FSRF9TVEFURV9TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHNhdmVkKSBhcyBQYXJ0aWFsPFBlcnNpc3RlZEJvYXJkU3RhdGU+O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVudEZlbjogcGFyc2VkLmN1cnJlbnRGZW4gPz8gXCJcIixcbiAgICAgICAgZmVuSGlzdG9yeTogQXJyYXkuaXNBcnJheShwYXJzZWQuZmVuSGlzdG9yeSkgPyBwYXJzZWQuZmVuSGlzdG9yeSA6IFtdLFxuICAgICAgICBnYW1lU2Vzc2lvbklkOiBwYXJzZWQuZ2FtZVNlc3Npb25JZCA/PyBjcmVhdGVHYW1lU2Vzc2lvbklkKCksXG4gICAgICAgIGdhbWVTdGFydEZlbjpcbiAgICAgICAgICBwYXJzZWQuZ2FtZVN0YXJ0RmVuID8/IHBhcnNlZC5jdXJyZW50RmVuID8/IG5ldyBDaGVzcygpLmZlbigpLFxuICAgICAgICBoaXN0b3J5QW5ub3RhdGlvbnM6IEFycmF5LmlzQXJyYXkocGFyc2VkLmhpc3RvcnlBbm5vdGF0aW9ucylcbiAgICAgICAgICA/IHBhcnNlZC5oaXN0b3J5QW5ub3RhdGlvbnNcbiAgICAgICAgICA6IFtdLFxuICAgICAgICByZWRvQW5ub3RhdGlvbnM6IEFycmF5LmlzQXJyYXkocGFyc2VkLnJlZG9Bbm5vdGF0aW9ucylcbiAgICAgICAgICA/IHBhcnNlZC5yZWRvQW5ub3RhdGlvbnNcbiAgICAgICAgICA6IFtdLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJQZXJzaXN0ZWRCb2FyZFN0YXRlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLkJPQVJEX1NUQVRFX1NUT1JBR0VfS0VZKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIGNsZWFyIGJvYXJkIHN0YXRlIHN0b3JhZ2U6XCIsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVJlZG9TdGFja0Zyb21Bbm5vdGF0aW9ucyhcbiAgICBhbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSxcbiAgKTogTW92ZVtdIHtcbiAgICByZXR1cm4gYW5ub3RhdGlvbnMubWFwKChhbm5vdGF0aW9uKSA9PiAoe1xuICAgICAgZnJvbTogYW5ub3RhdGlvbi51Y2kuc2xpY2UoMCwgMiksXG4gICAgICB0bzogYW5ub3RhdGlvbi51Y2kuc2xpY2UoMiwgNCksXG4gICAgICBwcm9tb3Rpb246IGFubm90YXRpb24udWNpLmxlbmd0aCA+IDQgPyBhbm5vdGF0aW9uLnVjaVs0XSA6IHVuZGVmaW5lZCxcbiAgICB9KSkgYXMgTW92ZVtdO1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGJvYXJkVmlld01vZGVsID0gbmV3IEJvYXJkVmlld01vZGVsKCk7XG4iLCAiaW1wb3J0IHsgTW92ZUFubm90YXRpb24gfSBmcm9tICcuL2JyaWxsaWFudFRyYWNraW5nJztcbmltcG9ydCB7IERpc3BsYXlNb3ZlQnVja2V0LCBNb3ZlUXVhbGl0eVByZXNldElkIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2FtZUFuYWx5dGljc1N1bW1hcnkge1xuICBzZXNzaW9uSWQ6IHN0cmluZztcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XG4gIGZpbmlzaGVkQXQ6IHN0cmluZztcbiAgcmVzdWx0OiBzdHJpbmc7XG4gIGdhbWVTdGF0dXM6IHN0cmluZztcbiAgcGVyc29uYUlkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgJ2N1c3RvbSc7XG4gIHBlcnNvbmFMYWJlbDogc3RyaW5nO1xuICBzZXR1cE5hbWU6IHN0cmluZztcbiAgc2V0dXBDYXRlZ29yeTogc3RyaW5nO1xuICBtb3ZlQ291bnQ6IG51bWJlcjtcbiAgYnJpbGxpYW50TW92ZXM6IG51bWJlcjtcbiAgaW5hY2N1cmFjaWVzOiBudW1iZXI7XG4gIG1pc3Rha2VzOiBudW1iZXI7XG4gIGJsdW5kZXJzOiBudW1iZXI7XG4gIGF2ZXJhZ2VFdmFsTG9zczogbnVtYmVyO1xuICBhdmVyYWdlTW92ZURlbGF5TXM6IG51bWJlcjtcbiAgYXV0b3BsYXlEdXJhdGlvbk1zOiBudW1iZXI7XG4gIHF1YWxpdHlDb3VudHM6IFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgbnVtYmVyPjtcbiAgY29tcGxleGl0eURpc3RyaWJ1dGlvbjogUmVjb3JkPCdsb3cnIHwgJ21lZGl1bScgfCAnaGlnaCcsIG51bWJlcj47XG4gIG1vdmVUaW1lbGluZTogQXJyYXk8e1xuICAgIHBseTogbnVtYmVyO1xuICAgIGFjdG9yOiAncGxheWVyJyB8ICdlbmdpbmUnIHwgJ3JlZG8nO1xuICAgIHNhbjogc3RyaW5nO1xuICAgIGJ1Y2tldDogc3RyaW5nIHwgbnVsbDtcbiAgICBldmFsTG9zczogbnVtYmVyIHwgbnVsbDtcbiAgICBldmFsdWF0aW9uOiBudW1iZXIgfCBudWxsO1xuICAgIGNvbXBsZXhpdHlMZXZlbDogJ2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJyB8IG51bGw7XG4gICAgY29tcGxleGl0eVNjb3JlOiBudW1iZXIgfCBudWxsO1xuICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiBudW1iZXI7XG4gICAgY29uc3VtZWRCcmlsbGlhbnQ6IGJvb2xlYW47XG4gIH0+O1xuICBoaWdobGlnaHRlZEJyaWxsaWFudE1vdmVzOiBBcnJheTx7IHBseTogbnVtYmVyOyBzYW46IHN0cmluZyB9PjtcbiAgbWFqb3JNaXN0YWtlczogQXJyYXk8eyBwbHk6IG51bWJlcjsgc2FuOiBzdHJpbmc7IGJ1Y2tldDogc3RyaW5nIHwgbnVsbDsgZXZhbExvc3M6IG51bWJlciB8IG51bGwgfT47XG4gIGV2YWxUcmVuZDogQXJyYXk8eyBwbHk6IG51bWJlcjsgZXZhbHVhdGlvbjogbnVtYmVyIH0+O1xuICBjb21wbGV4aXR5VHJlbmQ6IEFycmF5PHsgcGx5OiBudW1iZXI7IHNjb3JlOiBudW1iZXIgfT47XG4gIHBnbjogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlY2VudEdhbWVFbnRyeSB7XG4gIHNlc3Npb25JZDogc3RyaW5nO1xuICBmaW5pc2hlZEF0OiBzdHJpbmc7XG4gIHJlc3VsdDogc3RyaW5nO1xuICBwZXJzb25hTGFiZWw6IHN0cmluZztcbiAgcGVyc29uYUlkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgJ2N1c3RvbSc7XG4gIHNldHVwTmFtZTogc3RyaW5nO1xuICBkdXJhdGlvbk1zOiBudW1iZXI7XG4gIG1vdmVDb3VudDogbnVtYmVyO1xuICBicmlsbGlhbnRNb3ZlczogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkR2FtZUFuYWx5dGljc09wdGlvbnMge1xuICBzZXNzaW9uSWQ6IHN0cmluZztcbiAgY3JlYXRlZEF0TXM6IG51bWJlcjtcbiAgZmluaXNoZWRBdE1zOiBudW1iZXI7XG4gIGdhbWVTdGF0dXM6IHN0cmluZztcbiAgcGVyc29uYUlkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbDtcbiAgcGVyc29uYUxhYmVsOiBzdHJpbmc7XG4gIHNldHVwTmFtZT86IHN0cmluZyB8IG51bGw7XG4gIHNldHVwQ2F0ZWdvcnk/OiBzdHJpbmcgfCBudWxsO1xuICBhdXRvcGxheUR1cmF0aW9uTXM6IG51bWJlcjtcbiAgbW92ZUFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdO1xuICBwZ246IHN0cmluZztcbn1cblxuY29uc3QgQUxMX0JVQ0tFVFM6IERpc3BsYXlNb3ZlQnVja2V0W10gPSBbXG4gICdiZXN0JyxcbiAgJ2dyZWF0JyxcbiAgJ2V4Y2VsbGVudCcsXG4gICdnb29kJyxcbiAgJ2luYWNjdXJhY3knLFxuICAnbWlzdGFrZScsXG4gICdibHVuZGVyJyxcbiAgJ2ZhbGxiYWNrJyxcbl07XG5cbmZ1bmN0aW9uIGNyZWF0ZUVtcHR5UXVhbGl0eUNvdW50cygpOiBSZWNvcmQ8RGlzcGxheU1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICByZXR1cm4gQUxMX0JVQ0tFVFMucmVkdWNlKChjb3VudHMsIGJ1Y2tldCkgPT4ge1xuICAgIGNvdW50c1tidWNrZXRdID0gMDtcbiAgICByZXR1cm4gY291bnRzO1xuICB9LCB7fSBhcyBSZWNvcmQ8RGlzcGxheU1vdmVCdWNrZXQsIG51bWJlcj4pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2lmeVJlc3VsdChnYW1lU3RhdHVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoL2NoZWNrbWF0ZS9pLnRlc3QoZ2FtZVN0YXR1cykpIHtcbiAgICBjb25zdCB3aW5uZXIgPSBnYW1lU3RhdHVzLmluY2x1ZGVzKCdXaGl0ZSB3aW5zJykgPyAnV2hpdGUnIDogZ2FtZVN0YXR1cy5pbmNsdWRlcygnQmxhY2sgd2lucycpID8gJ0JsYWNrJyA6ICdEZWNpc2l2ZSc7XG4gICAgcmV0dXJuIGAke3dpbm5lcn0gd29uYDtcbiAgfVxuXG4gIGlmICgvc3RhbGVtYXRlfGRyYXcvaS50ZXN0KGdhbWVTdGF0dXMpKSB7XG4gICAgcmV0dXJuICdEcmF3JztcbiAgfVxuXG4gIGlmICgvY2hlY2svaS50ZXN0KGdhbWVTdGF0dXMpKSB7XG4gICAgcmV0dXJuICdJbiBwcm9ncmVzcyc7XG4gIH1cblxuICByZXR1cm4gJ0luIHByb2dyZXNzJztcbn1cblxuZnVuY3Rpb24gcm91bmRUb09uZURlY2ltYWwodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLnJvdW5kKHZhbHVlICogMTApIC8gMTA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEdhbWVBbmFseXRpY3NTdW1tYXJ5KG9wdGlvbnM6IEJ1aWxkR2FtZUFuYWx5dGljc09wdGlvbnMpOiBHYW1lQW5hbHl0aWNzU3VtbWFyeSB7XG4gIGNvbnN0IHF1YWxpdHlDb3VudHMgPSBjcmVhdGVFbXB0eVF1YWxpdHlDb3VudHMoKTtcbiAgY29uc3QgY29tcGxleGl0eURpc3RyaWJ1dGlvbjogUmVjb3JkPCdsb3cnIHwgJ21lZGl1bScgfCAnaGlnaCcsIG51bWJlcj4gPSB7XG4gICAgbG93OiAwLFxuICAgIG1lZGl1bTogMCxcbiAgICBoaWdoOiAwLFxuICB9O1xuXG4gIGxldCBldmFsTG9zc1RvdGFsID0gMDtcbiAgbGV0IGV2YWxMb3NzQ291bnQgPSAwO1xuICBsZXQgZGVsYXlUb3RhbCA9IDA7XG4gIGxldCBkZWxheUNvdW50ID0gMDtcbiAgbGV0IGJyaWxsaWFudE1vdmVzID0gMDtcblxuICBjb25zdCBtb3ZlVGltZWxpbmUgPSBvcHRpb25zLm1vdmVBbm5vdGF0aW9ucy5tYXAoKGFubm90YXRpb24sIGluZGV4KSA9PiB7XG4gICAgY29uc3QgYnVja2V0ID0gKGFubm90YXRpb24uYnVja2V0ID8/IG51bGwpIGFzIHN0cmluZyB8IG51bGw7XG4gICAgY29uc3QgdHlwZWRCdWNrZXQgPSBBTExfQlVDS0VUUy5pbmNsdWRlcyhidWNrZXQgYXMgRGlzcGxheU1vdmVCdWNrZXQpXG4gICAgICA/IChidWNrZXQgYXMgRGlzcGxheU1vdmVCdWNrZXQpXG4gICAgICA6IG51bGw7XG5cbiAgICBpZiAodHlwZWRCdWNrZXQpIHtcbiAgICAgIHF1YWxpdHlDb3VudHNbdHlwZWRCdWNrZXRdICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKGFubm90YXRpb24uY29uc3VtZWRCcmlsbGlhbnQpIHtcbiAgICAgIGJyaWxsaWFudE1vdmVzICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhbm5vdGF0aW9uLmV2YWxMb3NzID09PSAnbnVtYmVyJykge1xuICAgICAgZXZhbExvc3NUb3RhbCArPSBhbm5vdGF0aW9uLmV2YWxMb3NzO1xuICAgICAgZXZhbExvc3NDb3VudCArPSAxO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYW5ub3RhdGlvbi5kZWxheU1zU2luY2VQcmV2aW91cyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRlbGF5VG90YWwgKz0gYW5ub3RhdGlvbi5kZWxheU1zU2luY2VQcmV2aW91cztcbiAgICAgIGRlbGF5Q291bnQgKz0gMTtcbiAgICB9XG5cbiAgICBpZiAoYW5ub3RhdGlvbi5jb21wbGV4aXR5TGV2ZWwpIHtcbiAgICAgIGNvbXBsZXhpdHlEaXN0cmlidXRpb25bYW5ub3RhdGlvbi5jb21wbGV4aXR5TGV2ZWxdICs9IDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBseTogaW5kZXggKyAxLFxuICAgICAgYWN0b3I6IGFubm90YXRpb24uYWN0b3IgPz8gJ3BsYXllcicsXG4gICAgICBzYW46IGFubm90YXRpb24uc2FuID8/IGFubm90YXRpb24udWNpLFxuICAgICAgYnVja2V0LFxuICAgICAgZXZhbExvc3M6IGFubm90YXRpb24uZXZhbExvc3MgPz8gbnVsbCxcbiAgICAgIGV2YWx1YXRpb246IGFubm90YXRpb24uZXZhbHVhdGlvbiA/PyBudWxsLFxuICAgICAgY29tcGxleGl0eUxldmVsOiBhbm5vdGF0aW9uLmNvbXBsZXhpdHlMZXZlbCA/PyBudWxsLFxuICAgICAgY29tcGxleGl0eVNjb3JlOiBhbm5vdGF0aW9uLmNvbXBsZXhpdHlTY29yZSA/PyBudWxsLFxuICAgICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IGFubm90YXRpb24uZGVsYXlNc1NpbmNlUHJldmlvdXMgPz8gMCxcbiAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiBhbm5vdGF0aW9uLmNvbnN1bWVkQnJpbGxpYW50LFxuICAgIH07XG4gIH0pO1xuXG4gIGNvbnN0IGhpZ2hsaWdodGVkQnJpbGxpYW50TW92ZXMgPSBtb3ZlVGltZWxpbmVcbiAgICAuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkuY29uc3VtZWRCcmlsbGlhbnQpXG4gICAgLm1hcCgoZW50cnkpID0+ICh7IHBseTogZW50cnkucGx5LCBzYW46IGVudHJ5LnNhbiB9KSk7XG4gIGNvbnN0IG1ham9yTWlzdGFrZXMgPSBtb3ZlVGltZWxpbmVcbiAgICAuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkuYnVja2V0ID09PSAnbWlzdGFrZScgfHwgZW50cnkuYnVja2V0ID09PSAnYmx1bmRlcicpXG4gICAgLm1hcCgoZW50cnkpID0+ICh7XG4gICAgICBwbHk6IGVudHJ5LnBseSxcbiAgICAgIHNhbjogZW50cnkuc2FuLFxuICAgICAgYnVja2V0OiBlbnRyeS5idWNrZXQsXG4gICAgICBldmFsTG9zczogZW50cnkuZXZhbExvc3MsXG4gICAgfSkpO1xuICBjb25zdCBldmFsVHJlbmQgPSBtb3ZlVGltZWxpbmVcbiAgICAuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIHR5cGVvZiBlbnRyeSAmIHsgZXZhbHVhdGlvbjogbnVtYmVyIH0gPT4gdHlwZW9mIGVudHJ5LmV2YWx1YXRpb24gPT09ICdudW1iZXInKVxuICAgIC5tYXAoKGVudHJ5KSA9PiAoeyBwbHk6IGVudHJ5LnBseSwgZXZhbHVhdGlvbjogZW50cnkuZXZhbHVhdGlvbiB9KSk7XG4gIGNvbnN0IGNvbXBsZXhpdHlUcmVuZCA9IG1vdmVUaW1lbGluZVxuICAgIC5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgdHlwZW9mIGVudHJ5ICYgeyBjb21wbGV4aXR5U2NvcmU6IG51bWJlciB9ID0+IHR5cGVvZiBlbnRyeS5jb21wbGV4aXR5U2NvcmUgPT09ICdudW1iZXInKVxuICAgIC5tYXAoKGVudHJ5KSA9PiAoeyBwbHk6IGVudHJ5LnBseSwgc2NvcmU6IGVudHJ5LmNvbXBsZXhpdHlTY29yZSB9KSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzZXNzaW9uSWQ6IG9wdGlvbnMuc2Vzc2lvbklkLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUob3B0aW9ucy5jcmVhdGVkQXRNcykudG9JU09TdHJpbmcoKSxcbiAgICBmaW5pc2hlZEF0OiBuZXcgRGF0ZShvcHRpb25zLmZpbmlzaGVkQXRNcykudG9JU09TdHJpbmcoKSxcbiAgICByZXN1bHQ6IGNsYXNzaWZ5UmVzdWx0KG9wdGlvbnMuZ2FtZVN0YXR1cyksXG4gICAgZ2FtZVN0YXR1czogb3B0aW9ucy5nYW1lU3RhdHVzLFxuICAgIHBlcnNvbmFJZDogb3B0aW9ucy5wZXJzb25hSWQgPz8gJ2N1c3RvbScsXG4gICAgcGVyc29uYUxhYmVsOiBvcHRpb25zLnBlcnNvbmFMYWJlbCxcbiAgICBzZXR1cE5hbWU6IG9wdGlvbnMuc2V0dXBOYW1lID8/ICdOZXcgR2FtZScsXG4gICAgc2V0dXBDYXRlZ29yeTogb3B0aW9ucy5zZXR1cENhdGVnb3J5ID8/ICdjdXN0b20nLFxuICAgIG1vdmVDb3VudDogbW92ZVRpbWVsaW5lLmxlbmd0aCxcbiAgICBicmlsbGlhbnRNb3ZlcyxcbiAgICBpbmFjY3VyYWNpZXM6IHF1YWxpdHlDb3VudHMuaW5hY2N1cmFjeSxcbiAgICBtaXN0YWtlczogcXVhbGl0eUNvdW50cy5taXN0YWtlLFxuICAgIGJsdW5kZXJzOiBxdWFsaXR5Q291bnRzLmJsdW5kZXIsXG4gICAgYXZlcmFnZUV2YWxMb3NzOiBldmFsTG9zc0NvdW50ID4gMCA/IHJvdW5kVG9PbmVEZWNpbWFsKGV2YWxMb3NzVG90YWwgLyBldmFsTG9zc0NvdW50KSA6IDAsXG4gICAgYXZlcmFnZU1vdmVEZWxheU1zOiBkZWxheUNvdW50ID4gMCA/IE1hdGgucm91bmQoZGVsYXlUb3RhbCAvIGRlbGF5Q291bnQpIDogMCxcbiAgICBhdXRvcGxheUR1cmF0aW9uTXM6IE1hdGgubWF4KDAsIG9wdGlvbnMuYXV0b3BsYXlEdXJhdGlvbk1zKSxcbiAgICBxdWFsaXR5Q291bnRzLFxuICAgIGNvbXBsZXhpdHlEaXN0cmlidXRpb24sXG4gICAgbW92ZVRpbWVsaW5lLFxuICAgIGhpZ2hsaWdodGVkQnJpbGxpYW50TW92ZXMsXG4gICAgbWFqb3JNaXN0YWtlcyxcbiAgICBldmFsVHJlbmQsXG4gICAgY29tcGxleGl0eVRyZW5kLFxuICAgIHBnbjogb3B0aW9ucy5wZ24sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJlY2VudEdhbWVFbnRyeShzdW1tYXJ5OiBHYW1lQW5hbHl0aWNzU3VtbWFyeSk6IFJlY2VudEdhbWVFbnRyeSB7XG4gIHJldHVybiB7XG4gICAgc2Vzc2lvbklkOiBzdW1tYXJ5LnNlc3Npb25JZCxcbiAgICBmaW5pc2hlZEF0OiBzdW1tYXJ5LmZpbmlzaGVkQXQsXG4gICAgcmVzdWx0OiBzdW1tYXJ5LnJlc3VsdCxcbiAgICBwZXJzb25hTGFiZWw6IHN1bW1hcnkucGVyc29uYUxhYmVsLFxuICAgIHBlcnNvbmFJZDogc3VtbWFyeS5wZXJzb25hSWQsXG4gICAgc2V0dXBOYW1lOiBzdW1tYXJ5LnNldHVwTmFtZSxcbiAgICBkdXJhdGlvbk1zOiBNYXRoLm1heCgwLCBuZXcgRGF0ZShzdW1tYXJ5LmZpbmlzaGVkQXQpLmdldFRpbWUoKSAtIG5ldyBEYXRlKHN1bW1hcnkuY3JlYXRlZEF0KS5nZXRUaW1lKCkpLFxuICAgIG1vdmVDb3VudDogc3VtbWFyeS5tb3ZlQ291bnQsXG4gICAgYnJpbGxpYW50TW92ZXM6IHN1bW1hcnkuYnJpbGxpYW50TW92ZXMsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVHYW1lQW5hbHl0aWNzU3VtbWFyeShzdW1tYXJ5OiBHYW1lQW5hbHl0aWNzU3VtbWFyeSk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShzdW1tYXJ5LCBudWxsLCAyKTtcbn1cbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSwgcmVhY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIGJ1aWxkR2FtZUFuYWx5dGljc1N1bW1hcnksXG4gIGJ1aWxkUmVjZW50R2FtZUVudHJ5LFxuICBHYW1lQW5hbHl0aWNzU3VtbWFyeSxcbiAgUmVjZW50R2FtZUVudHJ5LFxuICBzZXJpYWxpemVHYW1lQW5hbHl0aWNzU3VtbWFyeSxcbn0gZnJvbSAnLi4vZW5naW5lL2dhbWVBbmFseXRpY3MnO1xuaW1wb3J0IHsgYm9hcmRWaWV3TW9kZWwsIEJvYXJkVmlld01vZGVsIH0gZnJvbSAnLi9Cb2FyZFZpZXdNb2RlbCc7XG5pbXBvcnQgeyBjb25maWdWaWV3TW9kZWwsIENvbmZpZ1ZpZXdNb2RlbCB9IGZyb20gJy4vQ29uZmlnVmlld01vZGVsJztcblxuY29uc3QgUkVDRU5UX0dBTUVTX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19yZWNlbnRfZ2FtZXMnO1xuY29uc3QgTUFYX1JFQ0VOVF9HQU1FUyA9IDIwO1xuXG5pbnRlcmZhY2UgUGVyc2lzdGVkQW5hbHl0aWNzU25hcHNob3Qge1xuICByZWNlbnRHYW1lczogR2FtZUFuYWx5dGljc1N1bW1hcnlbXTtcbn1cblxuaW50ZXJmYWNlIEdhbWVBbmFseXRpY3NEZXBlbmRlbmNpZXMge1xuICBib2FyZFZpZXdNb2RlbDogUGljazxcbiAgICBCb2FyZFZpZXdNb2RlbCxcbiAgICB8ICdkZWJ1Z1Nlc3Npb25JZCdcbiAgICB8ICdtb3ZlQW5ub3RhdGlvbnMnXG4gICAgfCAnc2Vzc2lvblN0YXJ0ZWRBdCdcbiAgICB8ICdnYW1lU3RhdHVzJ1xuICAgIHwgJ3BnbidcbiAgICB8ICdjdXJyZW50U2V0dXBOYW1lJ1xuICAgIHwgJ2N1cnJlbnRTZXR1cENhdGVnb3J5J1xuICAgIHwgJ2F1dG9QbGF5QWN0aXZlRHVyYXRpb25NcydcbiAgICB8ICdpc0dhbWVPdmVyJ1xuICA+O1xuICBjb25maWdWaWV3TW9kZWw6IFBpY2s8Q29uZmlnVmlld01vZGVsLCAnYWN0aXZlUGVyc29uYUlkJyB8ICdhY3RpdmVQZXJzb25hTGFiZWwnPjtcbn1cblxuZnVuY3Rpb24gZG93bmxvYWRUZXh0RmlsZShmaWxlTmFtZTogc3RyaW5nLCBjb250ZW50czogc3RyaW5nLCBtaW1lVHlwZTogc3RyaW5nKTogdm9pZCB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjb250ZW50c10sIHsgdHlwZTogbWltZVR5cGUgfSk7XG4gIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gIGNvbnN0IGFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgYW5jaG9yLmhyZWYgPSB1cmw7XG4gIGFuY2hvci5kb3dubG9hZCA9IGZpbGVOYW1lO1xuICBhbmNob3IuY2xpY2soKTtcbiAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xufVxuXG5mdW5jdGlvbiBzYWZlUGFyc2VSZWNlbnRHYW1lcyhzYXZlZDogc3RyaW5nIHwgbnVsbCk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5W10ge1xuICBpZiAoIXNhdmVkKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHNhdmVkKSBhcyBQZXJzaXN0ZWRBbmFseXRpY3NTbmFwc2hvdCB8IEdhbWVBbmFseXRpY3NTdW1tYXJ5W107XG4gICAgY29uc3QgcmVjZW50R2FtZXMgPSBBcnJheS5pc0FycmF5KHBhcnNlZClcbiAgICAgID8gcGFyc2VkXG4gICAgICA6IEFycmF5LmlzQXJyYXkocGFyc2VkLnJlY2VudEdhbWVzKVxuICAgICAgICA/IHBhcnNlZC5yZWNlbnRHYW1lc1xuICAgICAgICA6IFtdO1xuXG4gICAgcmV0dXJuIHJlY2VudEdhbWVzLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyBHYW1lQW5hbHl0aWNzU3VtbWFyeSA9PiAoXG4gICAgICB0eXBlb2YgZW50cnk/LnNlc3Npb25JZCA9PT0gJ3N0cmluZydcbiAgICAgICYmIHR5cGVvZiBlbnRyeT8uZmluaXNoZWRBdCA9PT0gJ3N0cmluZydcbiAgICAgICYmIHR5cGVvZiBlbnRyeT8ucGVyc29uYUxhYmVsID09PSAnc3RyaW5nJ1xuICAgICAgJiYgdHlwZW9mIGVudHJ5Py5zZXR1cE5hbWUgPT09ICdzdHJpbmcnXG4gICAgKSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCB7XG4gIHN1bW1hcnlPcGVuID0gZmFsc2U7XG4gIHJlY2VudEdhbWVzOiBHYW1lQW5hbHl0aWNzU3VtbWFyeVtdID0gW107XG4gIHNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGxhc3RDYXB0dXJlZFNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkZXBzOiBHYW1lQW5hbHl0aWNzRGVwZW5kZW5jaWVzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRlcHM6IEdhbWVBbmFseXRpY3NEZXBlbmRlbmNpZXMgPSB7XG4gICAgICBib2FyZFZpZXdNb2RlbCxcbiAgICAgIGNvbmZpZ1ZpZXdNb2RlbCxcbiAgICB9LFxuICApIHtcbiAgICB0aGlzLmRlcHMgPSBkZXBzO1xuXG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldFN1bW1hcnlPcGVuOiBhY3Rpb24sXG4gICAgICBzZXRTZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQ6IGFjdGlvbixcbiAgICAgIGNhcHR1cmVDb21wbGV0ZWRHYW1lOiBhY3Rpb24sXG4gICAgICBjbGVhclJlY2VudEdhbWVzOiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc3RvcmVGcm9tU3RvcmFnZSgpO1xuXG4gICAgcmVhY3Rpb24oXG4gICAgICAoKSA9PiAoe1xuICAgICAgICBzZXNzaW9uSWQ6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5kZWJ1Z1Nlc3Npb25JZCxcbiAgICAgICAgaXNHYW1lT3ZlcjogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmlzR2FtZU92ZXIsXG4gICAgICAgIG1vdmVDb3VudDogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLm1vdmVBbm5vdGF0aW9ucy5sZW5ndGgsXG4gICAgICB9KSxcbiAgICAgICh7IHNlc3Npb25JZCwgaXNHYW1lT3ZlciwgbW92ZUNvdW50IH0pID0+IHtcbiAgICAgICAgaWYgKGlzR2FtZU92ZXIgJiYgbW92ZUNvdW50ID4gMCAmJiB0aGlzLmxhc3RDYXB0dXJlZFNlc3Npb25JZCAhPT0gc2Vzc2lvbklkKSB7XG4gICAgICAgICAgdGhpcy5jYXB0dXJlQ29tcGxldGVkR2FtZSgpO1xuICAgICAgICAgIHRoaXMuc3VtbWFyeU9wZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICBzZXRTdW1tYXJ5T3BlbihvcGVuOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKG9wZW4pIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5zdW1tYXJ5T3BlbiA9IG9wZW47XG4gIH1cblxuICBzZXRTZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQoc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSBzZXNzaW9uSWQ7XG4gIH1cblxuICBjYXB0dXJlQ29tcGxldGVkR2FtZSgpOiB2b2lkIHtcbiAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5jdXJyZW50U3VtbWFyeTtcbiAgICBpZiAoIXN1bW1hcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB1cGRhdGVkID0gW3N1bW1hcnksIC4uLnRoaXMucmVjZW50R2FtZXMuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkuc2Vzc2lvbklkICE9PSBzdW1tYXJ5LnNlc3Npb25JZCldXG4gICAgICAuc2xpY2UoMCwgTUFYX1JFQ0VOVF9HQU1FUyk7XG4gICAgdGhpcy5yZWNlbnRHYW1lcyA9IHVwZGF0ZWQ7XG4gICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSBzdW1tYXJ5LnNlc3Npb25JZDtcbiAgICB0aGlzLmxhc3RDYXB0dXJlZFNlc3Npb25JZCA9IHN1bW1hcnkuc2Vzc2lvbklkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgY2xlYXJSZWNlbnRHYW1lcygpOiB2b2lkIHtcbiAgICB0aGlzLnJlY2VudEdhbWVzID0gW107XG4gICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSBudWxsO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgZXhwb3J0Q3VycmVudFN1bW1hcnkoKTogdm9pZCB7XG4gICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuY3VycmVudFN1bW1hcnk7XG4gICAgaWYgKCFzdW1tYXJ5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZG93bmxvYWRUZXh0RmlsZShgcGVyc29uYWNoZXNzLXN1bW1hcnktJHtzdW1tYXJ5LnNlc3Npb25JZH0uanNvbmAsIHNlcmlhbGl6ZUdhbWVBbmFseXRpY3NTdW1tYXJ5KHN1bW1hcnkpLCAnYXBwbGljYXRpb24vanNvbicpO1xuICB9XG5cbiAgZXhwb3J0Q3VycmVudFBnbigpOiB2b2lkIHtcbiAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5jdXJyZW50U3VtbWFyeTtcbiAgICBpZiAoIXN1bW1hcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkb3dubG9hZFRleHRGaWxlKGBwZXJzb25hY2hlc3MtZ2FtZS0ke3N1bW1hcnkuc2Vzc2lvbklkfS5wZ25gLCBzdW1tYXJ5LnBnbiwgJ2FwcGxpY2F0aW9uL3gtY2hlc3MtcGduJyk7XG4gIH1cblxuICBnZXQgY3VycmVudFN1bW1hcnkoKTogR2FtZUFuYWx5dGljc1N1bW1hcnkgfCBudWxsIHtcbiAgICBjb25zdCBhbm5vdGF0aW9ucyA9IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5tb3ZlQW5ub3RhdGlvbnM7XG4gICAgaWYgKGFubm90YXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWxkR2FtZUFuYWx5dGljc1N1bW1hcnkoe1xuICAgICAgc2Vzc2lvbklkOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuZGVidWdTZXNzaW9uSWQsXG4gICAgICBjcmVhdGVkQXRNczogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLnNlc3Npb25TdGFydGVkQXQsXG4gICAgICBmaW5pc2hlZEF0TXM6IERhdGUubm93KCksXG4gICAgICBnYW1lU3RhdHVzOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuZ2FtZVN0YXR1cyxcbiAgICAgIHBlcnNvbmFJZDogdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5hY3RpdmVQZXJzb25hSWQsXG4gICAgICBwZXJzb25hTGFiZWw6IHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuYWN0aXZlUGVyc29uYUxhYmVsLFxuICAgICAgc2V0dXBOYW1lOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuY3VycmVudFNldHVwTmFtZSxcbiAgICAgIHNldHVwQ2F0ZWdvcnk6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5jdXJyZW50U2V0dXBDYXRlZ29yeSxcbiAgICAgIGF1dG9wbGF5RHVyYXRpb25NczogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmF1dG9QbGF5QWN0aXZlRHVyYXRpb25NcyxcbiAgICAgIG1vdmVBbm5vdGF0aW9uczogYW5ub3RhdGlvbnMsXG4gICAgICBwZ246IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5wZ24sXG4gICAgfSk7XG4gIH1cblxuICBnZXQgc2VsZWN0ZWRSZWNlbnRHYW1lKCk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucmVjZW50R2FtZXMuZmluZCgoZW50cnkpID0+IGVudHJ5LnNlc3Npb25JZCA9PT0gdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQpID8/IG51bGw7XG4gIH1cblxuICBnZXQgcmVjZW50R2FtZUVudHJpZXMoKTogUmVjZW50R2FtZUVudHJ5W10ge1xuICAgIHJldHVybiB0aGlzLnJlY2VudEdhbWVzLm1hcCgoc3VtbWFyeSkgPT4gYnVpbGRSZWNlbnRHYW1lRW50cnkoc3VtbWFyeSkpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMucmVjZW50R2FtZXMgPSBzYWZlUGFyc2VSZWNlbnRHYW1lcyhsb2NhbFN0b3JhZ2UuZ2V0SXRlbShSRUNFTlRfR0FNRVNfU1RPUkFHRV9LRVkpKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkID0gdGhpcy5yZWNlbnRHYW1lc1swXT8uc2Vzc2lvbklkID8/IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICB0aGlzLnJlY2VudEdhbWVzID0gW107XG4gICAgICB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0VG9TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzbmFwc2hvdDogUGVyc2lzdGVkQW5hbHl0aWNzU25hcHNob3QgPSB7XG4gICAgICAgIHJlY2VudEdhbWVzOiB0aGlzLnJlY2VudEdhbWVzLFxuICAgICAgfTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFJFQ0VOVF9HQU1FU19TVE9SQUdFX0tFWSwgSlNPTi5zdHJpbmdpZnkoc25hcHNob3QpKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBsb2NhbFN0b3JhZ2UgZmFpbHVyZXMgYW5kIGtlZXAgYW5hbHl0aWNzIGF2YWlsYWJsZSBmb3IgdGhlIGN1cnJlbnQgc2Vzc2lvbi5cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGdhbWVBbmFseXRpY3NWaWV3TW9kZWwgPSBuZXcgR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCgpO1xuIiwgIi8qKlxuICogUHJlZGVmaW5lZCBjaGVzcyBvcGVuaW5ncyAoUEdOIG1vdmUgc2VxdWVuY2VzKVxuICogVXNlZCB0byBsb2FkIGEgcG9zaXRpb24gYWZ0ZXIgdGhlIGdpdmVuIG1vdmVzIGZyb20gdGhlIGluaXRpYWwgcG9zaXRpb24uXG4gKi9cblxuZXhwb3J0IHR5cGUgT3BlbmluZ1NpZGUgPSAnd2hpdGUnIHwgJ2JsYWNrJztcblxuZXhwb3J0IGludGVyZmFjZSBPcGVuaW5nIHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICAvKiogV2hpY2ggc2lkZSBwbGF5cyB0aGlzIG9wZW5pbmcgKHRoZSBvcGVuaW5nIGlzIG5hbWVkIGZyb20gdGhpcyBzaWRlJ3MgcGVyc3BlY3RpdmUpICovXG4gIHNpZGU6IE9wZW5pbmdTaWRlO1xuICAvKiogU2hvcnQgZGVzY3JpcHRpb24gb3IgRUNPLXN0eWxlIHRhZyAqL1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgLyoqIFBHTiBtb3ZlIHNlcXVlbmNlIGZyb20gdGhlIHN0YXJ0aW5nIHBvc2l0aW9uIChlLmcuIFwiMS4gZTQgZTUgMi4gUWg1XCIpICovXG4gIHBnbjogc3RyaW5nO1xufVxuXG4vKiogQnVpbGQgbWluaW1hbCBQR04gZm9yIGNoZXNzLmpzIChoZWFkZXJzICsgYmxhbmsgbGluZSArIG1vdmVzICsgcmVzdWx0KSAqL1xuZnVuY3Rpb24gcGduKG1vdmVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtb3ZlVGV4dCA9IG1vdmVzLnRyaW0oKS5lbmRzV2l0aCgnKicpID8gbW92ZXMudHJpbSgpIDogYCR7bW92ZXMudHJpbSgpfSAqYDtcbiAgcmV0dXJuIGBbRXZlbnQgXCI/XCJdXFxuW1NpdGUgXCI/XCJdXFxuW0RhdGUgXCI/Pz8/Lj8/Lj8/XCJdXFxuW1doaXRlIFwiP1wiXVxcbltCbGFjayBcIj9cIl1cXG5bUmVzdWx0IFwiKlwiXVxcblxcbiR7bW92ZVRleHR9YDtcbn1cblxuZXhwb3J0IGNvbnN0IFBSRURFRklORURfT1BFTklOR1M6IE9wZW5pbmdbXSA9IFtcbiAge1xuICAgIGlkOiAnbmFwb2xlb24nLFxuICAgIG5hbWU6IFwiS2luZydzIFBhd246IE5hcG9sZW9uIEF0dGFja1wiLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBlNSAyLiBRaDUnLFxuICAgIHBnbjogcGduKCcxLiBlNCBlNSAyLiBRaDUnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAnaXRhbGlhbicsXG4gICAgbmFtZTogXCJJdGFsaWFuIEdhbWVcIixcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgZTUgMi4gTmYzIE5jNiAzLiBCYzQnLFxuICAgIHBnbjogcGduKCcxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJjNCcpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdydXlfbG9wZXonLFxuICAgIG5hbWU6ICdSdXkgTG9wZXonLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJiNScsXG4gICAgcGduOiBwZ24oJzEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmI1JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ3NpY2lsaWFuJyxcbiAgICBuYW1lOiAnU2ljaWxpYW4gRGVmZW5zZScsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGM1JyxcbiAgICBwZ246IHBnbignMS4gZTQgYzUnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAnZnJlbmNoJyxcbiAgICBuYW1lOiAnRnJlbmNoIERlZmVuc2UnLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBlNicsXG4gICAgcGduOiBwZ24oJzEuIGU0IGU2JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ2Nhcm9fa2FubicsXG4gICAgbmFtZTogJ0Nhcm8tS2FubicsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGM2JyxcbiAgICBwZ246IHBnbignMS4gZTQgYzYnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAncXVlZW5zX2dhbWJpdCcsXG4gICAgbmFtZTogXCJRdWVlbidzIEdhbWJpdFwiLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGVzY3JpcHRpb246ICcxLiBkNCBkNSAyLiBjNCcsXG4gICAgcGduOiBwZ24oJzEuIGQ0IGQ1IDIuIGM0JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ2xvbmRvbicsXG4gICAgbmFtZTogJ0xvbmRvbiBTeXN0ZW0nLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGVzY3JpcHRpb246ICcxLiBkNCBkNSAyLiBCZjQnLFxuICAgIHBnbjogcGduKCcxLiBkNCBkNSAyLiBCZjQnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAna2luZ3NfaW5kaWFuJyxcbiAgICBuYW1lOiBcIktpbmcncyBJbmRpYW4gRGVmZW5zZVwiLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGVzY3JpcHRpb246ICcxLiBkNCBOZjYgMi4gYzQgZzYnLFxuICAgIHBnbjogcGduKCcxLiBkNCBOZjYgMi4gYzQgZzYnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAncGlyYycsXG4gICAgbmFtZTogJ1BpcmMgRGVmZW5zZScsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGQ2IDIuIGQ0IE5mNicsXG4gICAgcGduOiBwZ24oJzEuIGU0IGQ2IDIuIGQ0IE5mNicpLFxuICB9LFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9wZW5pbmdCeUlkKGlkOiBzdHJpbmcpOiBPcGVuaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIFBSRURFRklORURfT1BFTklOR1MuZmluZChvID0+IG8uaWQgPT09IGlkKTtcbn1cbiIsICJpbXBvcnQgeyBnZXRPcGVuaW5nQnlJZCwgT3BlbmluZ1NpZGUsIFBSRURFRklORURfT1BFTklOR1MgfSBmcm9tICcuL29wZW5pbmdzJztcblxuZXhwb3J0IHR5cGUgR2FtZVNldHVwQ2F0ZWdvcnkgPSAnb3BlbmluZ3MnIHwgJ3RhY3RpY2FsJyB8ICdlbmRnYW1lcycgfCAnY3VzdG9tLWZlbicgfCAnY3VzdG9tLXBnbic7XG5leHBvcnQgdHlwZSBHYW1lU2V0dXBEaWZmaWN1bHR5ID0gJ2Vhc3knIHwgJ21lZGl1bScgfCAnaGFyZCc7XG5leHBvcnQgdHlwZSBHYW1lU2V0dXBTb3VyY2VUeXBlID0gJ2ZlbicgfCAncGduJztcblxuZXhwb3J0IGludGVyZmFjZSBHYW1lU2V0dXBQcmVzZXQge1xuICBpZDogc3RyaW5nO1xuICBjYXRlZ29yeTogRXhjbHVkZTxHYW1lU2V0dXBDYXRlZ29yeSwgJ2N1c3RvbS1mZW4nIHwgJ2N1c3RvbS1wZ24nPjtcbiAgbmFtZTogc3RyaW5nO1xuICBzaWRlOiBPcGVuaW5nU2lkZTtcbiAgZGlmZmljdWx0eTogR2FtZVNldHVwRGlmZmljdWx0eTtcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgdGFnczogc3RyaW5nW107XG4gIHNvdXJjZVR5cGU6IEdhbWVTZXR1cFNvdXJjZVR5cGU7XG4gIHNvdXJjZTogc3RyaW5nO1xufVxuXG5leHBvcnQgY29uc3QgR0FNRV9TRVRVUF9DQVRFR09SWV9PUFRJT05TOiBBcnJheTx7IHZhbHVlOiBHYW1lU2V0dXBDYXRlZ29yeTsgbGFiZWw6IHN0cmluZyB9PiA9IFtcbiAgeyB2YWx1ZTogJ29wZW5pbmdzJywgbGFiZWw6ICdPcGVuaW5ncycgfSxcbiAgeyB2YWx1ZTogJ3RhY3RpY2FsJywgbGFiZWw6ICdUYWN0aWNhbCBwb3NpdGlvbnMnIH0sXG4gIHsgdmFsdWU6ICdlbmRnYW1lcycsIGxhYmVsOiAnRW5kZ2FtZXMnIH0sXG4gIHsgdmFsdWU6ICdjdXN0b20tZmVuJywgbGFiZWw6ICdDdXN0b20gRkVOJyB9LFxuICB7IHZhbHVlOiAnY3VzdG9tLXBnbicsIGxhYmVsOiAnQ3VzdG9tIFBHTicgfSxcbl07XG5cbmZ1bmN0aW9uIG9wZW5pbmdEaWZmaWN1bHR5VGFnKG5hbWU6IHN0cmluZyk6IEdhbWVTZXR1cERpZmZpY3VsdHkge1xuICBpZiAoL25hcG9sZW9uL2kudGVzdChuYW1lKSkge1xuICAgIHJldHVybiAnZWFzeSc7XG4gIH1cblxuICBpZiAoL2l0YWxpYW58bG9uZG9ufHF1ZWVuL2kudGVzdChuYW1lKSkge1xuICAgIHJldHVybiAnbWVkaXVtJztcbiAgfVxuXG4gIHJldHVybiAnaGFyZCc7XG59XG5cbmNvbnN0IE9QRU5JTkdfUFJFU0VUUzogR2FtZVNldHVwUHJlc2V0W10gPSBQUkVERUZJTkVEX09QRU5JTkdTLm1hcCgob3BlbmluZykgPT4gKHtcbiAgaWQ6IG9wZW5pbmcuaWQsXG4gIGNhdGVnb3J5OiAnb3BlbmluZ3MnLFxuICBuYW1lOiBvcGVuaW5nLm5hbWUsXG4gIHNpZGU6IG9wZW5pbmcuc2lkZSxcbiAgZGlmZmljdWx0eTogb3BlbmluZ0RpZmZpY3VsdHlUYWcob3BlbmluZy5uYW1lKSxcbiAgZGVzY3JpcHRpb246IG9wZW5pbmcuZGVzY3JpcHRpb24gPz8gYCR7b3BlbmluZy5uYW1lfSBzZXR1cGAsXG4gIHRhZ3M6IFsnb3BlbmluZycsIG9wZW5pbmcuc2lkZSwgb3BlbmluZy5uYW1lLnRvTG93ZXJDYXNlKCldLFxuICBzb3VyY2VUeXBlOiAncGduJyxcbiAgc291cmNlOiBvcGVuaW5nLnBnbixcbn0pKTtcblxuY29uc3QgVEFDVElDQUxfUFJFU0VUUzogR2FtZVNldHVwUHJlc2V0W10gPSBbXG4gIHtcbiAgICBpZDogJ3RhY3RpYy1iYWNrLXJhbmstbmV0JyxcbiAgICBjYXRlZ29yeTogJ3RhY3RpY2FsJyxcbiAgICBuYW1lOiAnQmFjayBSYW5rIE5ldCcsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkaWZmaWN1bHR5OiAnbWVkaXVtJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doaXRlIHRvIG1vdmUgd2l0aCBhIGRpcmVjdCBhdHRhY2tpbmcgaWRlYSBhZ2FpbnN0IGFuIGV4cG9zZWQgYmFjayByYW5rLicsXG4gICAgdGFnczogWyd0YWN0aWNhbCcsICdtYXRlLXRocmVhdCcsICdhdHRhY2snLCAnd2hpdGUtdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJzZrMS81cHBwLzNRNC84LzgvOC81UFBQLzZLMSB3IC0gLSAwIDEnLFxuICB9LFxuICB7XG4gICAgaWQ6ICd0YWN0aWMta25pZ2h0LWZvcmsnLFxuICAgIGNhdGVnb3J5OiAndGFjdGljYWwnLFxuICAgIG5hbWU6ICdLbmlnaHQgRm9yayBPcHBvcnR1bml0eScsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkaWZmaWN1bHR5OiAnZWFzeScsXG4gICAgZGVzY3JpcHRpb246ICdBIHRyYWluaW5nIHBvc2l0aW9uIGJ1aWx0IGFyb3VuZCBzcG90dGluZyBhIHNpbXBsZSBmb3JrIG1vdGlmLicsXG4gICAgdGFnczogWyd0YWN0aWNhbCcsICdmb3JrJywgJ3doaXRlLXRvLW1vdmUnXSxcbiAgICBzb3VyY2VUeXBlOiAnZmVuJyxcbiAgICBzb3VyY2U6ICdyM2syci9wcHBxMXBwcC8ybnBibjIvM05wMy8yQjFQMy8yTjUvUFBQMlBQUC9SMUJRMVJLMSB3IGtxIC0gMCAxJyxcbiAgfSxcbiAge1xuICAgIGlkOiAndGFjdGljLWRlZmxlY3Rpb24nLFxuICAgIGNhdGVnb3J5OiAndGFjdGljYWwnLFxuICAgIG5hbWU6ICdEZWZsZWN0aW9uIFN0cmlrZScsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkaWZmaWN1bHR5OiAnaGFyZCcsXG4gICAgZGVzY3JpcHRpb246ICdCbGFjayB0byBtb3ZlIGluIGEgc2hhcnAgbWlkZGxlZ2FtZSB3aGVyZSBjYWxjdWxhdGlvbiBtYXR0ZXJzIG1vcmUgdGhhbiBtZW1vcml6YXRpb24uJyxcbiAgICB0YWdzOiBbJ3RhY3RpY2FsJywgJ2RlZmxlY3Rpb24nLCAnY2FsY3VsYXRpb24nLCAnYmxhY2stdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJ3IycTFyazEvcHAxYjFwcHAvMm4xcG4yLzJicDQvMlA1LzJOUDFOUDEvUFAyUFBCUC9SMUJRMVJLMSBiIC0gLSA0IDknLFxuICB9LFxuXTtcblxuY29uc3QgRU5ER0FNRV9QUkVTRVRTOiBHYW1lU2V0dXBQcmVzZXRbXSA9IFtcbiAge1xuICAgIGlkOiAnZW5kZ2FtZS1sdWNlbmEtYnJpZGdlJyxcbiAgICBjYXRlZ29yeTogJ2VuZGdhbWVzJyxcbiAgICBuYW1lOiAnTHVjZW5hIEJyaWRnZSBTZXR1cCcsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkaWZmaWN1bHR5OiAnaGFyZCcsXG4gICAgZGVzY3JpcHRpb246ICdDbGFzc2ljIHJvb2sgZW5kZ2FtZSBjb252ZXJzaW9uIHByYWN0aWNlIHdpdGggV2hpdGUgcHJlc3NpbmcgZm9yIHRoZSB3aW4uJyxcbiAgICB0YWdzOiBbJ2VuZGdhbWUnLCAncm9vaycsICdsdWNlbmEnLCAnd2hpdGUtdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJzgvMms1LzJQNS8yS1I0LzgvOC84LzggdyAtIC0gMCAxJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnZW5kZ2FtZS1vcHBvc2l0aW9uJyxcbiAgICBjYXRlZ29yeTogJ2VuZGdhbWVzJyxcbiAgICBuYW1lOiAnS2luZyBPcHBvc2l0aW9uJyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRpZmZpY3VsdHk6ICdlYXN5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0EgcHVyZSBraW5nLWFuZC1wYXduIGVuZGluZyBmb2N1c2VkIG9uIGdhaW5pbmcgb3Bwb3NpdGlvbiBjbGVhbmx5LicsXG4gICAgdGFnczogWydlbmRnYW1lJywgJ2tpbmctYW5kLXBhd24nLCAnb3Bwb3NpdGlvbicsICd3aGl0ZS10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAnOC84LzgvM2s0LzNQNC80SzMvOC84IHcgLSAtIDAgMScsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2VuZGdhbWUtcXVlZW4tdnMtcGF3bicsXG4gICAgY2F0ZWdvcnk6ICdlbmRnYW1lcycsXG4gICAgbmFtZTogJ1F1ZWVuIHZzIFBhc3NlZCBQYXduJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRpZmZpY3VsdHk6ICdtZWRpdW0nLFxuICAgIGRlc2NyaXB0aW9uOiAnQmxhY2sgZGVmZW5kcyBhZ2FpbnN0IHByb21vdGlvbiB0aHJlYXRzIGluIGEgcHJlY2lzZSBxdWVlbiBlbmRpbmcuJyxcbiAgICB0YWdzOiBbJ2VuZGdhbWUnLCAncXVlZW4nLCAncGFzc2VkLXBhd24nLCAnYmxhY2stdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJzZrMS81cHAxLzgvOC84LzZRMS81UDIvNksxIGIgLSAtIDAgMScsXG4gIH0sXG5dO1xuXG5leHBvcnQgY29uc3QgR0FNRV9TRVRVUF9QUkVTRVRTOiBHYW1lU2V0dXBQcmVzZXRbXSA9IFtcbiAgLi4uT1BFTklOR19QUkVTRVRTLFxuICAuLi5UQUNUSUNBTF9QUkVTRVRTLFxuICAuLi5FTkRHQU1FX1BSRVNFVFMsXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0R2FtZVNldHVwUHJlc2V0QnlJZChpZDogc3RyaW5nKTogR2FtZVNldHVwUHJlc2V0IHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIEdBTUVfU0VUVVBfUFJFU0VUUy5maW5kKChwcmVzZXQpID0+IHByZXNldC5pZCA9PT0gaWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3BlbmluZ1ByZXNldEJ5SWQoaWQ6IHN0cmluZyk6IEdhbWVTZXR1cFByZXNldCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBPUEVOSU5HX1BSRVNFVFMuZmluZCgocHJlc2V0KSA9PiBwcmVzZXQuaWQgPT09IGlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckdhbWVTZXR1cFByZXNldHMoXG4gIHByZXNldHM6IEdhbWVTZXR1cFByZXNldFtdLFxuICBjYXRlZ29yeTogR2FtZVNldHVwQ2F0ZWdvcnksXG4gIHF1ZXJ5OiBzdHJpbmcsXG4pOiBHYW1lU2V0dXBQcmVzZXRbXSB7XG4gIGlmIChjYXRlZ29yeSA9PT0gJ2N1c3RvbS1mZW4nIHx8IGNhdGVnb3J5ID09PSAnY3VzdG9tLXBnbicpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBub3JtYWxpemVkUXVlcnkgPSBxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKTtcblxuICByZXR1cm4gcHJlc2V0cy5maWx0ZXIoKHByZXNldCkgPT4ge1xuICAgIGlmIChwcmVzZXQuY2F0ZWdvcnkgIT09IGNhdGVnb3J5KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFub3JtYWxpemVkUXVlcnkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGhheXN0YWNrID0gW1xuICAgICAgcHJlc2V0Lm5hbWUsXG4gICAgICBwcmVzZXQuZGVzY3JpcHRpb24sXG4gICAgICBwcmVzZXQuc2lkZSxcbiAgICAgIHByZXNldC5kaWZmaWN1bHR5LFxuICAgICAgLi4ucHJlc2V0LnRhZ3MsXG4gICAgXS5qb2luKCcgJykudG9Mb3dlckNhc2UoKTtcblxuICAgIHJldHVybiBoYXlzdGFjay5pbmNsdWRlcyhub3JtYWxpemVkUXVlcnkpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlR2FtZVNldHVwUHJlc2V0KHByZXNldDogR2FtZVNldHVwUHJlc2V0KTogc3RyaW5nIHtcbiAgY29uc3Qgc2lkZUxhYmVsID0gcHJlc2V0LnNpZGUgPT09ICd3aGl0ZScgPyAnV2hpdGUnIDogJ0JsYWNrJztcbiAgcmV0dXJuIGAke3ByZXNldC5uYW1lfSBcdTIwMjIgJHtzaWRlTGFiZWx9IFx1MjAyMiAke3ByZXNldC5kaWZmaWN1bHR5fWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0NvbXBhdGlibGVPcGVuaW5nUHJlc2V0KGlkOiBzdHJpbmcpOiBHYW1lU2V0dXBQcmVzZXQgfCB1bmRlZmluZWQge1xuICBjb25zdCBvcGVuaW5nID0gZ2V0T3BlbmluZ0J5SWQoaWQpO1xuICBpZiAoIW9wZW5pbmcpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIE9QRU5JTkdfUFJFU0VUUy5maW5kKChwcmVzZXQpID0+IHByZXNldC5pZCA9PT0gb3BlbmluZy5pZCk7XG59XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIGZpbHRlckdhbWVTZXR1cFByZXNldHMsXG4gIEdBTUVfU0VUVVBfUFJFU0VUUyxcbiAgR2FtZVNldHVwQ2F0ZWdvcnksXG4gIEdBTUVfU0VUVVBfQ0FURUdPUllfT1BUSU9OUyxcbiAgR2FtZVNldHVwUHJlc2V0LFxuICBnZXRHYW1lU2V0dXBQcmVzZXRCeUlkLFxufSBmcm9tICcuLi9lbmdpbmUvZ2FtZVNldHVwUHJlc2V0cyc7XG5pbXBvcnQgeyBib2FyZFZpZXdNb2RlbCwgQm9hcmRWaWV3TW9kZWwgfSBmcm9tICcuL0JvYXJkVmlld01vZGVsJztcblxuaW50ZXJmYWNlIEdhbWVTZXR1cFZpZXdNb2RlbERlcGVuZGVuY2llcyB7XG4gIGJvYXJkVmlld01vZGVsOiBQaWNrPEJvYXJkVmlld01vZGVsLCAnbG9hZEZlbicgfCAnbG9hZFBnbicgfCAnbG9hZEdhbWVTZXR1cFByZXNldCcgfCAnc3RhdHVzTWVzc2FnZSc+O1xufVxuXG5leHBvcnQgY2xhc3MgR2FtZVNldHVwVmlld01vZGVsIHtcbiAgb3BlbiA9IGZhbHNlO1xuICBzZWxlY3RlZENhdGVnb3J5OiBHYW1lU2V0dXBDYXRlZ29yeSA9ICdvcGVuaW5ncyc7XG4gIHNlYXJjaFF1ZXJ5ID0gJyc7XG4gIHNlbGVjdGVkUHJlc2V0SWQ6IHN0cmluZyB8IG51bGwgPSBHQU1FX1NFVFVQX1BSRVNFVFNbMF0/LmlkID8/IG51bGw7XG4gIGN1c3RvbUZlbklucHV0ID0gJyc7XG4gIGN1c3RvbVBnbklucHV0ID0gJyc7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkZXBzOiBHYW1lU2V0dXBWaWV3TW9kZWxEZXBlbmRlbmNpZXM7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZGVwczogR2FtZVNldHVwVmlld01vZGVsRGVwZW5kZW5jaWVzID0ge1xuICAgICAgYm9hcmRWaWV3TW9kZWwsXG4gICAgfSxcbiAgKSB7XG4gICAgdGhpcy5kZXBzID0gZGVwcztcblxuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXRPcGVuOiBhY3Rpb24sXG4gICAgICBvcGVuQXRDYXRlZ29yeTogYWN0aW9uLFxuICAgICAgc2V0U2VsZWN0ZWRDYXRlZ29yeTogYWN0aW9uLFxuICAgICAgc2V0U2VhcmNoUXVlcnk6IGFjdGlvbixcbiAgICAgIHNldFNlbGVjdGVkUHJlc2V0SWQ6IGFjdGlvbixcbiAgICAgIHNldEN1c3RvbUZlbklucHV0OiBhY3Rpb24sXG4gICAgICBzZXRDdXN0b21QZ25JbnB1dDogYWN0aW9uLFxuICAgICAgbG9hZFNlbGVjdGVkUHJlc2V0OiBhY3Rpb24sXG4gICAgICBsb2FkQ3VzdG9tRmVuOiBhY3Rpb24sXG4gICAgICBsb2FkQ3VzdG9tUGduOiBhY3Rpb24sXG4gICAgICBzeW5jU2VsZWN0aW9uRnJvbUNhdGVnb3J5OiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLnN5bmNTZWxlY3Rpb25Gcm9tQ2F0ZWdvcnkoKTtcbiAgfVxuXG4gIHNldE9wZW4ob3BlbjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMub3BlbiA9IG9wZW47XG4gIH1cblxuICBvcGVuQXRDYXRlZ29yeShjYXRlZ29yeTogR2FtZVNldHVwQ2F0ZWdvcnkpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkQ2F0ZWdvcnkgPSBjYXRlZ29yeTtcbiAgICB0aGlzLnNlYXJjaFF1ZXJ5ID0gJyc7XG4gICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgICB0aGlzLnN5bmNTZWxlY3Rpb25Gcm9tQ2F0ZWdvcnkoKTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkQ2F0ZWdvcnkoY2F0ZWdvcnk6IEdhbWVTZXR1cENhdGVnb3J5KTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZENhdGVnb3J5ID0gY2F0ZWdvcnk7XG4gICAgdGhpcy5zZWFyY2hRdWVyeSA9ICcnO1xuICAgIHRoaXMuc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeSgpO1xuICB9XG5cbiAgc2V0U2VhcmNoUXVlcnkodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc2VhcmNoUXVlcnkgPSB2YWx1ZTtcbiAgICB0aGlzLnN5bmNTZWxlY3Rpb25Gcm9tQ2F0ZWdvcnkoKTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkUHJlc2V0SWQoaWQ6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkUHJlc2V0SWQgPSBpZDtcbiAgfVxuXG4gIHNldEN1c3RvbUZlbklucHV0KHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbUZlbklucHV0ID0gdmFsdWU7XG4gIH1cblxuICBzZXRDdXN0b21QZ25JbnB1dCh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jdXN0b21QZ25JbnB1dCA9IHZhbHVlO1xuICB9XG5cbiAgbG9hZFNlbGVjdGVkUHJlc2V0KCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByZXNldCA9IHRoaXMuc2VsZWN0ZWRQcmVzZXQ7XG4gICAgaWYgKCFwcmVzZXQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2FkZWQgPSB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwubG9hZEdhbWVTZXR1cFByZXNldChwcmVzZXQpO1xuICAgIGlmIChsb2FkZWQpIHtcbiAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbG9hZGVkO1xuICB9XG5cbiAgbG9hZEN1c3RvbUZlbigpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuY3VzdG9tRmVuSW5wdXQudHJpbSgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbG9hZGVkID0gdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmxvYWRGZW4odGhpcy5jdXN0b21GZW5JbnB1dC50cmltKCkpO1xuICAgIGlmIChsb2FkZWQpIHtcbiAgICAgIHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5zdGF0dXNNZXNzYWdlID0gJ0N1c3RvbSBGRU4gbG9hZGVkJztcbiAgICAgIHRoaXMuY3VzdG9tRmVuSW5wdXQgPSAnJztcbiAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbG9hZGVkO1xuICB9XG5cbiAgbG9hZEN1c3RvbVBnbigpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuY3VzdG9tUGduSW5wdXQudHJpbSgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbG9hZGVkID0gdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmxvYWRQZ24odGhpcy5jdXN0b21QZ25JbnB1dC50cmltKCkpO1xuICAgIGlmIChsb2FkZWQpIHtcbiAgICAgIHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5zdGF0dXNNZXNzYWdlID0gJ0N1c3RvbSBQR04gbG9hZGVkJztcbiAgICAgIHRoaXMuY3VzdG9tUGduSW5wdXQgPSAnJztcbiAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbG9hZGVkO1xuICB9XG5cbiAgc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zZWxlY3RlZENhdGVnb3J5ID09PSAnY3VzdG9tLWZlbicgfHwgdGhpcy5zZWxlY3RlZENhdGVnb3J5ID09PSAnY3VzdG9tLXBnbicpIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCA9IG51bGw7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdmlzaWJsZVByZXNldElkcyA9IHRoaXMuZmlsdGVyZWRQcmVzZXRzLm1hcCgocHJlc2V0KSA9PiBwcmVzZXQuaWQpO1xuICAgIGlmICh0aGlzLnNlbGVjdGVkUHJlc2V0SWQgJiYgdmlzaWJsZVByZXNldElkcy5pbmNsdWRlcyh0aGlzLnNlbGVjdGVkUHJlc2V0SWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZWxlY3RlZFByZXNldElkID0gdmlzaWJsZVByZXNldElkc1swXSA/PyBudWxsO1xuICB9XG5cbiAgZ2V0IGNhdGVnb3JpZXMoKSB7XG4gICAgcmV0dXJuIEdBTUVfU0VUVVBfQ0FURUdPUllfT1BUSU9OUztcbiAgfVxuXG4gIGdldCBmaWx0ZXJlZFByZXNldHMoKTogR2FtZVNldHVwUHJlc2V0W10ge1xuICAgIHJldHVybiBmaWx0ZXJHYW1lU2V0dXBQcmVzZXRzKEdBTUVfU0VUVVBfUFJFU0VUUywgdGhpcy5zZWxlY3RlZENhdGVnb3J5LCB0aGlzLnNlYXJjaFF1ZXJ5KTtcbiAgfVxuXG4gIGdldCBzZWxlY3RlZFByZXNldCgpOiBHYW1lU2V0dXBQcmVzZXQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFByZXNldElkID8gZ2V0R2FtZVNldHVwUHJlc2V0QnlJZCh0aGlzLnNlbGVjdGVkUHJlc2V0SWQpID8/IG51bGwgOiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBnYW1lU2V0dXBWaWV3TW9kZWwgPSBuZXcgR2FtZVNldHVwVmlld01vZGVsKCk7XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIGlzRGVidWdMb2dnaW5nRW5hYmxlZCxcbiAgaXNEZXZlbG9wbWVudEJ1aWxkLFxuICBzZXREZWJ1Z0xvZ2dpbmdFbmFibGVkLFxufSBmcm9tICcuLi9zaGFyZWQvZGVidWcnO1xuXG5leHBvcnQgY2xhc3MgRGVidWdWaWV3TW9kZWwge1xuICBkZWJ1Z0xvZ2dpbmdFbmFibGVkID0gaXNEZWJ1Z0xvZ2dpbmdFbmFibGVkKCk7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQ6IGFjdGlvbixcbiAgICAgIHRvZ2dsZURlYnVnTG9nZ2luZzogYWN0aW9uLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0RGVidWdMb2dnaW5nRW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kZWJ1Z0xvZ2dpbmdFbmFibGVkID0gZW5hYmxlZDtcbiAgICBzZXREZWJ1Z0xvZ2dpbmdFbmFibGVkKGVuYWJsZWQpO1xuICB9XG5cbiAgdG9nZ2xlRGVidWdMb2dnaW5nKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0RGVidWdMb2dnaW5nRW5hYmxlZCghdGhpcy5kZWJ1Z0xvZ2dpbmdFbmFibGVkKTtcbiAgfVxuXG4gIGdldCBpc0RldmVsb3BtZW50KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc0RldmVsb3BtZW50QnVpbGQoKTtcbiAgfVxuXG4gIGdldCBzaG93RGVidWdDb250cm9scygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0RldmVsb3BtZW50O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBkZWJ1Z1ZpZXdNb2RlbCA9IG5ldyBEZWJ1Z1ZpZXdNb2RlbCgpO1xuXG4iLCAiaW1wb3J0IHtcbiAgQnJpbGxpYW50QWxsb3dlZFBoYXNlLFxuICBCcmlsbGlhbnRNb3Zlc1BlckdhbWUsXG4gIEZlYXR1cmVPcHRpb25zLFxuICBtZXJnZUZlYXR1cmVPcHRpb25zLFxufSBmcm9tICcuL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7XG4gIEJ1Y2tldENvbmZpZyxcbiAgREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICBNb3ZlUXVhbGl0eVByZXNldElkLFxuICBNT1ZFX1FVQUxJVFlfUFJFU0VUUyxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCB0eXBlIFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlID0gJ2RhcmsnIHwgJ2xpZ2h0JyB8ICdtaW5pbWFsJyB8ICdwZXJzb25hJztcblxuZXhwb3J0IGNvbnN0IFBFUlNPTkFfUFJPRklMRV9LSU5EID0gJ3BlcnNvbmFjaGVzcy5wZXJzb25hLXByb2ZpbGUnO1xuZXhwb3J0IGNvbnN0IFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OID0gMTtcblxuZXhwb3J0IGludGVyZmFjZSBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3Qge1xuICBidWNrZXRDb25maWc6IEJ1Y2tldENvbmZpZztcbiAgY3VycmVudFByZXNldElkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbDtcbiAgZGVwdGg6IG51bWJlcjtcbiAgbXVsdGlQVjogbnVtYmVyO1xuICBmZWF0dXJlT3B0aW9uczogRmVhdHVyZU9wdGlvbnM7XG4gIGJyaWxsaWFudDoge1xuICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogQnJpbGxpYW50TW92ZXNQZXJHYW1lO1xuICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogQnJpbGxpYW50QWxsb3dlZFBoYXNlO1xuICB9O1xuICB1aToge1xuICAgIHRoZW1lTW9kZTogUGVyc29uYVByb2ZpbGVUaGVtZU1vZGU7XG4gICAgYmFzaWNNb2RlOiBib29sZWFuO1xuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBlcnNvbmFQcm9maWxlRXhwb3J0IHtcbiAga2luZDogdHlwZW9mIFBFUlNPTkFfUFJPRklMRV9LSU5EO1xuICB2ZXJzaW9uOiB0eXBlb2YgUEVSU09OQV9QUk9GSUxFX1ZFUlNJT047XG4gIG5hbWU6IHN0cmluZztcbiAgc2V0dGluZ3M6IFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTYXZlZFBlcnNvbmFQcm9maWxlIGV4dGVuZHMgUGVyc29uYVByb2ZpbGVFeHBvcnQge1xuICBpZDogc3RyaW5nO1xuICBjcmVhdGVkQXQ6IHN0cmluZztcbiAgdXBkYXRlZEF0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc29uYVByb2ZpbGVTdG9yZVNuYXBzaG90IHtcbiAgcHJvZmlsZXM6IFNhdmVkUGVyc29uYVByb2ZpbGVbXTtcbiAgc2VsZWN0ZWRQcm9maWxlSWQ6IHN0cmluZyB8IG51bGw7XG59XG5cbmNvbnN0IFZBTElEX1BSRVNFVF9JRFMgPSBuZXcgU2V0PE1vdmVRdWFsaXR5UHJlc2V0SWQ+KE1PVkVfUVVBTElUWV9QUkVTRVRTLm1hcCgocHJlc2V0KSA9PiBwcmVzZXQuaWQpKTtcbmNvbnN0IFZBTElEX1RIRU1FX01PREVTID0gbmV3IFNldDxQZXJzb25hUHJvZmlsZVRoZW1lTW9kZT4oWydkYXJrJywgJ2xpZ2h0JywgJ21pbmltYWwnLCAncGVyc29uYSddKTtcbmNvbnN0IFZBTElEX0JSSUxMSUFOVF9QSEFTRVMgPSBuZXcgU2V0PEJyaWxsaWFudEFsbG93ZWRQaGFzZT4oWydvcGVuaW5nJywgJ21pZGRsZWdhbWUnLCAnZW5kZ2FtZScsICdhbnknXSk7XG5jb25zdCBWQUxJRF9CUklMTElBTlRfQlVER0VUUyA9IG5ldyBTZXQ8QnJpbGxpYW50TW92ZXNQZXJHYW1lPihbMCwgMSwgMiwgMywgNF0pO1xuXG5mdW5jdGlvbiBpc1JlY29yZCh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGNsYW1wSW50ZWdlcih2YWx1ZTogdW5rbm93biwgbWluaW11bTogbnVtYmVyLCBtYXhpbXVtOiBudW1iZXIsIGZhbGxiYWNrOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxsYmFjaztcbiAgfVxuXG4gIHJldHVybiBNYXRoLm1heChtaW5pbXVtLCBNYXRoLm1pbihtYXhpbXVtLCBNYXRoLnJvdW5kKHZhbHVlKSkpO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZUJ1Y2tldENvbmZpZyh2YWx1ZTogdW5rbm93bik6IEJ1Y2tldENvbmZpZyB7XG4gIGlmICghaXNSZWNvcmQodmFsdWUpKSB7XG4gICAgcmV0dXJuIHsgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJlc3Q6IGNsYW1wSW50ZWdlcih2YWx1ZS5iZXN0LCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5iZXN0KSxcbiAgICBncmVhdDogY2xhbXBJbnRlZ2VyKHZhbHVlLmdyZWF0LCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5ncmVhdCksXG4gICAgZXhjZWxsZW50OiBjbGFtcEludGVnZXIodmFsdWUuZXhjZWxsZW50LCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5leGNlbGxlbnQpLFxuICAgIGdvb2Q6IGNsYW1wSW50ZWdlcih2YWx1ZS5nb29kLCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5nb29kKSxcbiAgICBpbmFjY3VyYWN5OiBjbGFtcEludGVnZXIodmFsdWUuaW5hY2N1cmFjeSwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuaW5hY2N1cmFjeSksXG4gICAgbWlzdGFrZTogY2xhbXBJbnRlZ2VyKHZhbHVlLm1pc3Rha2UsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLm1pc3Rha2UpLFxuICAgIGJsdW5kZXI6IGNsYW1wSW50ZWdlcih2YWx1ZS5ibHVuZGVyLCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5ibHVuZGVyKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVQcmVzZXRJZCh2YWx1ZTogdW5rbm93bik6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsIHtcbiAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBWQUxJRF9QUkVTRVRfSURTLmhhcyh2YWx1ZSBhcyBNb3ZlUXVhbGl0eVByZXNldElkKVxuICAgID8gKHZhbHVlIGFzIE1vdmVRdWFsaXR5UHJlc2V0SWQpXG4gICAgOiAnbWVkaXVtJztcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVUaGVtZU1vZGUodmFsdWU6IHVua25vd24pOiBQZXJzb25hUHJvZmlsZVRoZW1lTW9kZSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIFZBTElEX1RIRU1FX01PREVTLmhhcyh2YWx1ZSBhcyBQZXJzb25hUHJvZmlsZVRoZW1lTW9kZSlcbiAgICA/ICh2YWx1ZSBhcyBQZXJzb25hUHJvZmlsZVRoZW1lTW9kZSlcbiAgICA6ICdkYXJrJztcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVCcmlsbGlhbnRNb3Zlc1BlckdhbWUodmFsdWU6IHVua25vd24pOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWUge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBWQUxJRF9CUklMTElBTlRfQlVER0VUUy5oYXModmFsdWUgYXMgQnJpbGxpYW50TW92ZXNQZXJHYW1lKVxuICAgID8gKHZhbHVlIGFzIEJyaWxsaWFudE1vdmVzUGVyR2FtZSlcbiAgICA6IDA7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplQnJpbGxpYW50QWxsb3dlZFBoYXNlKHZhbHVlOiB1bmtub3duKTogQnJpbGxpYW50QWxsb3dlZFBoYXNlIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgVkFMSURfQlJJTExJQU5UX1BIQVNFUy5oYXModmFsdWUgYXMgQnJpbGxpYW50QWxsb3dlZFBoYXNlKVxuICAgID8gKHZhbHVlIGFzIEJyaWxsaWFudEFsbG93ZWRQaGFzZSlcbiAgICA6ICdhbnknO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3QodmFsdWU6IHVua25vd24pOiBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3Qge1xuICBjb25zdCByZWNvcmQgPSBpc1JlY29yZCh2YWx1ZSkgPyB2YWx1ZSA6IHt9O1xuICBjb25zdCBicmlsbGlhbnQgPSBpc1JlY29yZChyZWNvcmQuYnJpbGxpYW50KSA/IHJlY29yZC5icmlsbGlhbnQgOiB7fTtcbiAgY29uc3QgdWkgPSBpc1JlY29yZChyZWNvcmQudWkpID8gcmVjb3JkLnVpIDoge307XG5cbiAgcmV0dXJuIHtcbiAgICBidWNrZXRDb25maWc6IHNhbml0aXplQnVja2V0Q29uZmlnKHJlY29yZC5idWNrZXRDb25maWcpLFxuICAgIGN1cnJlbnRQcmVzZXRJZDogc2FuaXRpemVQcmVzZXRJZChyZWNvcmQuY3VycmVudFByZXNldElkKSxcbiAgICBkZXB0aDogY2xhbXBJbnRlZ2VyKHJlY29yZC5kZXB0aCwgMSwgMzAsIDgpLFxuICAgIG11bHRpUFY6IGNsYW1wSW50ZWdlcihyZWNvcmQubXVsdGlQViwgMSwgMjAsIDEyKSxcbiAgICBmZWF0dXJlT3B0aW9uczogbWVyZ2VGZWF0dXJlT3B0aW9ucyhpc1JlY29yZChyZWNvcmQuZmVhdHVyZU9wdGlvbnMpID8gKHJlY29yZC5mZWF0dXJlT3B0aW9ucyBhcyBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPikgOiB1bmRlZmluZWQpLFxuICAgIGJyaWxsaWFudDoge1xuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiBzYW5pdGl6ZUJyaWxsaWFudE1vdmVzUGVyR2FtZShicmlsbGlhbnQuYnJpbGxpYW50TW92ZXNQZXJHYW1lKSxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogc2FuaXRpemVCcmlsbGlhbnRBbGxvd2VkUGhhc2UoYnJpbGxpYW50LmJyaWxsaWFudEFsbG93ZWRQaGFzZSksXG4gICAgfSxcbiAgICB1aToge1xuICAgICAgdGhlbWVNb2RlOiBzYW5pdGl6ZVRoZW1lTW9kZSh1aS50aGVtZU1vZGUpLFxuICAgICAgYmFzaWNNb2RlOiB0eXBlb2YgdWkuYmFzaWNNb2RlID09PSAnYm9vbGVhbicgPyB1aS5iYXNpY01vZGUgOiB0cnVlLFxuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlRXhwb3J0KFxuICB2YWx1ZTogdW5rbm93bixcbiAgZmFsbGJhY2tOYW1lID0gJ0ltcG9ydGVkIFByb2ZpbGUnLFxuKTogUGVyc29uYVByb2ZpbGVFeHBvcnQgfCBudWxsIHtcbiAgaWYgKCFpc1JlY29yZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmICh2YWx1ZS5raW5kICE9PSBQRVJTT05BX1BST0ZJTEVfS0lORCB8fCB2YWx1ZS52ZXJzaW9uICE9PSBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgbmFtZSA9IHR5cGVvZiB2YWx1ZS5uYW1lID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5uYW1lLnRyaW0oKSA/IHZhbHVlLm5hbWUudHJpbSgpIDogZmFsbGJhY2tOYW1lO1xuXG4gIHJldHVybiB7XG4gICAga2luZDogUEVSU09OQV9QUk9GSUxFX0tJTkQsXG4gICAgdmVyc2lvbjogUEVSU09OQV9QUk9GSUxFX1ZFUlNJT04sXG4gICAgbmFtZSxcbiAgICBzZXR0aW5nczogc2FuaXRpemVQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3QodmFsdWUuc2V0dGluZ3MpLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQZXJzb25hUHJvZmlsZUltcG9ydChcbiAganNvbjogc3RyaW5nLFxuKTogeyBvazogdHJ1ZTsgcHJvZmlsZTogUGVyc29uYVByb2ZpbGVFeHBvcnQgfSB8IHsgb2s6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0ge1xuICBpZiAoIWpzb24udHJpbSgpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnSW1wb3J0IEpTT04gaXMgZW1wdHkuJyxcbiAgICB9O1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb24pIGFzIHVua25vd247XG4gICAgY29uc3QgcHJvZmlsZSA9IHNhbml0aXplUGVyc29uYVByb2ZpbGVFeHBvcnQocGFyc2VkKTtcblxuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2s6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ0ltcG9ydGVkIEpTT04gZG9lcyBub3QgbWF0Y2ggdGhlIFBlcnNvbmFDaGVzcyBwcm9maWxlIHNjaGVtYS4nLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBvazogdHJ1ZSwgcHJvZmlsZSB9O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdJbXBvcnRlZCBKU09OIGNvdWxkIG5vdCBiZSBwYXJzZWQuJyxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVQZXJzb25hUHJvZmlsZShwcm9maWxlOiBQZXJzb25hUHJvZmlsZUV4cG9ydCk6IHN0cmluZyB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShwcm9maWxlLCBudWxsLCAyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNhdmVkUGVyc29uYVByb2ZpbGUoXG4gIHByb2ZpbGU6IFBlcnNvbmFQcm9maWxlRXhwb3J0LFxuICBpZDogc3RyaW5nLFxuICBub3dJc286IHN0cmluZyxcbik6IFNhdmVkUGVyc29uYVByb2ZpbGUge1xuICByZXR1cm4ge1xuICAgIC4uLnByb2ZpbGUsXG4gICAgaWQsXG4gICAgY3JlYXRlZEF0OiBub3dJc28sXG4gICAgdXBkYXRlZEF0OiBub3dJc28sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVTYXZlZFBlcnNvbmFQcm9maWxlKFxuICBwcm9maWxlOiBTYXZlZFBlcnNvbmFQcm9maWxlLFxuICBuZXh0OiBQZXJzb25hUHJvZmlsZUV4cG9ydCxcbiAgbm93SXNvOiBzdHJpbmcsXG4pOiBTYXZlZFBlcnNvbmFQcm9maWxlIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5wcm9maWxlLFxuICAgIC4uLm5leHQsXG4gICAgaWQ6IHByb2ZpbGUuaWQsXG4gICAgY3JlYXRlZEF0OiBwcm9maWxlLmNyZWF0ZWRBdCxcbiAgICB1cGRhdGVkQXQ6IG5vd0lzbyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGR1cGxpY2F0ZVBlcnNvbmFQcm9maWxlKFxuICBwcm9maWxlOiBTYXZlZFBlcnNvbmFQcm9maWxlLFxuICBpZDogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIG5vd0lzbzogc3RyaW5nLFxuKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB7XG4gIHJldHVybiB7XG4gICAgLi4ucHJvZmlsZSxcbiAgICBpZCxcbiAgICBuYW1lLFxuICAgIGNyZWF0ZWRBdDogbm93SXNvLFxuICAgIHVwZGF0ZWRBdDogbm93SXNvLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVTYXZlZFBlcnNvbmFQcm9maWxlKHZhbHVlOiB1bmtub3duKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB8IG51bGwge1xuICBpZiAoIWlzUmVjb3JkKHZhbHVlKSB8fCB0eXBlb2YgdmFsdWUuaWQgIT09ICdzdHJpbmcnIHx8ICF2YWx1ZS5pZC50cmltKCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGV4cG9ydGVkID0gc2FuaXRpemVQZXJzb25hUHJvZmlsZUV4cG9ydCh2YWx1ZSk7XG4gIGlmICghZXhwb3J0ZWQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZWRBdCA9IHR5cGVvZiB2YWx1ZS5jcmVhdGVkQXQgPT09ICdzdHJpbmcnICYmIHZhbHVlLmNyZWF0ZWRBdC50cmltKClcbiAgICA/IHZhbHVlLmNyZWF0ZWRBdFxuICAgIDogbmV3IERhdGUoMCkudG9JU09TdHJpbmcoKTtcbiAgY29uc3QgdXBkYXRlZEF0ID0gdHlwZW9mIHZhbHVlLnVwZGF0ZWRBdCA9PT0gJ3N0cmluZycgJiYgdmFsdWUudXBkYXRlZEF0LnRyaW0oKVxuICAgID8gdmFsdWUudXBkYXRlZEF0XG4gICAgOiBjcmVhdGVkQXQ7XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5leHBvcnRlZCxcbiAgICBpZDogdmFsdWUuaWQsXG4gICAgY3JlYXRlZEF0LFxuICAgIHVwZGF0ZWRBdCxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplUGVyc29uYVByb2ZpbGVTdG9yZVNuYXBzaG90KHZhbHVlOiB1bmtub3duKTogUGVyc29uYVByb2ZpbGVTdG9yZVNuYXBzaG90IHtcbiAgaWYgKCFpc1JlY29yZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvZmlsZXM6IFtdLFxuICAgICAgc2VsZWN0ZWRQcm9maWxlSWQ6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHByb2ZpbGVzID0gQXJyYXkuaXNBcnJheSh2YWx1ZS5wcm9maWxlcylcbiAgICA/IHZhbHVlLnByb2ZpbGVzXG4gICAgICAubWFwKChlbnRyeSkgPT4gc2FuaXRpemVTYXZlZFBlcnNvbmFQcm9maWxlKGVudHJ5KSlcbiAgICAgIC5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgU2F2ZWRQZXJzb25hUHJvZmlsZSA9PiBlbnRyeSAhPT0gbnVsbClcbiAgICA6IFtdO1xuICBjb25zdCBzZWxlY3RlZFByb2ZpbGVJZCA9IHR5cGVvZiB2YWx1ZS5zZWxlY3RlZFByb2ZpbGVJZCA9PT0gJ3N0cmluZycgPyB2YWx1ZS5zZWxlY3RlZFByb2ZpbGVJZCA6IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBwcm9maWxlcyxcbiAgICBzZWxlY3RlZFByb2ZpbGVJZDogcHJvZmlsZXMuc29tZSgocHJvZmlsZSkgPT4gcHJvZmlsZS5pZCA9PT0gc2VsZWN0ZWRQcm9maWxlSWQpID8gc2VsZWN0ZWRQcm9maWxlSWQgOiBudWxsLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQZXJzb25hUHJvZmlsZUV4cG9ydEZpbGVuYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHNsdWcgPSBuYW1lXG4gICAgLnRyaW0oKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxuICAgIC5yZXBsYWNlKC9eLSt8LSskL2csICcnKSB8fCAncGVyc29uYS1wcm9maWxlJztcblxuICByZXR1cm4gYHBlcnNvbmFjaGVzcy0ke3NsdWd9Lmpzb25gO1xufVxuIiwgImltcG9ydCB7IGFjdGlvbiwgbWFrZUF1dG9PYnNlcnZhYmxlIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQge1xuICBidWlsZFBlcnNvbmFQcm9maWxlRXhwb3J0RmlsZW5hbWUsXG4gIGNyZWF0ZVNhdmVkUGVyc29uYVByb2ZpbGUsXG4gIGR1cGxpY2F0ZVBlcnNvbmFQcm9maWxlLFxuICBwYXJzZVBlcnNvbmFQcm9maWxlSW1wb3J0LFxuICBQRVJTT05BX1BST0ZJTEVfS0lORCxcbiAgUEVSU09OQV9QUk9GSUxFX1ZFUlNJT04sXG4gIFBlcnNvbmFQcm9maWxlRXhwb3J0LFxuICBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3QsXG4gIHNhbml0aXplUGVyc29uYVByb2ZpbGVTdG9yZVNuYXBzaG90LFxuICBTYXZlZFBlcnNvbmFQcm9maWxlLFxuICBzZXJpYWxpemVQZXJzb25hUHJvZmlsZSxcbiAgdXBkYXRlU2F2ZWRQZXJzb25hUHJvZmlsZSxcbn0gZnJvbSAnLi4vZW5naW5lL3BlcnNvbmFQcm9maWxlcyc7XG5pbXBvcnQgeyBjb25maWdWaWV3TW9kZWwsIENvbmZpZ1ZpZXdNb2RlbCB9IGZyb20gJy4vQ29uZmlnVmlld01vZGVsJztcbmltcG9ydCB7IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLCBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gJy4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwnO1xuaW1wb3J0IHsgdWlTdGF0ZVZpZXdNb2RlbCwgVWlTdGF0ZVZpZXdNb2RlbCB9IGZyb20gJy4vVWlTdGF0ZVZpZXdNb2RlbCc7XG5cbmNvbnN0IFBFUlNPTkFfUFJPRklMRVNfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX3BlcnNvbmFfcHJvZmlsZXMnO1xuXG5pbnRlcmZhY2UgUGVyc29uYVByb2ZpbGVzRGVwZW5kZW5jaWVzIHtcbiAgY29uZmlnVmlld01vZGVsOiBQaWNrPENvbmZpZ1ZpZXdNb2RlbCwgJ2J1Y2tldENvbmZpZycgfCAnY3VycmVudFByZXNldElkJyB8ICdkZXB0aCcgfCAnbXVsdGlQVicgfCAnYXBwbHlQcm9maWxlU25hcHNob3QnPjtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWw6IFBpY2s8XG4gICAgRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwsXG4gICAgfCAnb3B0aW9ucydcbiAgICB8ICdicmlsbGlhbnRNb3Zlc1BlckdhbWUnXG4gICAgfCAnYnJpbGxpYW50QWxsb3dlZFBoYXNlJ1xuICAgIHwgJ2FwcGx5UHJvZmlsZVNldHRpbmdzJ1xuICA+O1xuICB1aVN0YXRlVmlld01vZGVsOiBQaWNrPFxuICAgIFVpU3RhdGVWaWV3TW9kZWwsXG4gICAgfCAndGhlbWVNb2RlJ1xuICAgIHwgJ2Jhc2ljTW9kZSdcbiAgICB8ICdhcHBseVByb2ZpbGVQcmVmZXJlbmNlcydcbiAgPjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUHJvZmlsZUlkKCk6IHN0cmluZyB7XG4gIHJldHVybiBgcHJvZmlsZV8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDgpfWA7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRpbWVzdGFtcCgpOiBzdHJpbmcge1xuICByZXR1cm4gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xufVxuXG5leHBvcnQgY2xhc3MgUGVyc29uYVByb2ZpbGVzVmlld01vZGVsIHtcbiAgcHJvZmlsZXM6IFNhdmVkUGVyc29uYVByb2ZpbGVbXSA9IFtdO1xuICBzZWxlY3RlZFByb2ZpbGVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIHByb2ZpbGVOYW1lRHJhZnQgPSAnJztcbiAgZXhjaGFuZ2VKc29uID0gJyc7XG4gIGxhc3RBY3Rpb25NZXNzYWdlID0gJyc7XG4gIGltcG9ydEVycm9yID0gJyc7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkZXBzOiBQZXJzb25hUHJvZmlsZXNEZXBlbmRlbmNpZXM7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZGVwczogUGVyc29uYVByb2ZpbGVzRGVwZW5kZW5jaWVzID0ge1xuICAgICAgY29uZmlnVmlld01vZGVsLFxuICAgICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwsXG4gICAgICB1aVN0YXRlVmlld01vZGVsLFxuICAgIH0sXG4gICkge1xuICAgIHRoaXMuZGVwcyA9IGRlcHM7XG5cbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0U2VsZWN0ZWRQcm9maWxlSWQ6IGFjdGlvbixcbiAgICAgIHNldFByb2ZpbGVOYW1lRHJhZnQ6IGFjdGlvbixcbiAgICAgIHNldEV4Y2hhbmdlSnNvbjogYWN0aW9uLFxuICAgICAgY2xlYXJFeGNoYW5nZVN0YXRlOiBhY3Rpb24sXG4gICAgICBzYXZlQ3VycmVudFByb2ZpbGU6IGFjdGlvbixcbiAgICAgIGxvYWRTZWxlY3RlZFByb2ZpbGU6IGFjdGlvbixcbiAgICAgIGR1cGxpY2F0ZVNlbGVjdGVkUHJvZmlsZTogYWN0aW9uLFxuICAgICAgcmVuYW1lU2VsZWN0ZWRQcm9maWxlOiBhY3Rpb24sXG4gICAgICBkZWxldGVTZWxlY3RlZFByb2ZpbGU6IGFjdGlvbixcbiAgICAgIGltcG9ydFByb2ZpbGVGcm9tSnNvbjogYWN0aW9uLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZXN0b3JlRnJvbVN0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkUHJvZmlsZUlkKGlkOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IGlkO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlPy5uYW1lID8/ICcnO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSAnJztcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gIH1cblxuICBzZXRQcm9maWxlTmFtZURyYWZ0KHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSB2YWx1ZTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gJyc7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICB9XG5cbiAgc2V0RXhjaGFuZ2VKc29uKHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHZhbHVlO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSAnJztcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gIH1cblxuICBjbGVhckV4Y2hhbmdlU3RhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSAnJztcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gJyc7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICB9XG5cbiAgc2F2ZUN1cnJlbnRQcm9maWxlKG5hbWUgPSB0aGlzLnByb2ZpbGVOYW1lRHJhZnQpOiBib29sZWFuIHtcbiAgICBjb25zdCB0cmltbWVkTmFtZSA9IG5hbWUudHJpbSgpO1xuICAgIGlmICghdHJpbW1lZE5hbWUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnRW50ZXIgYSBwcm9maWxlIG5hbWUgYmVmb3JlIHNhdmluZy4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHNuYXBzaG90ID0gdGhpcy5idWlsZEN1cnJlbnRTbmFwc2hvdCgpO1xuICAgIGNvbnN0IGV4cG9ydGVkID0gdGhpcy5jcmVhdGVFeHBvcnQodHJpbW1lZE5hbWUsIHNuYXBzaG90KTtcbiAgICBjb25zdCBub3dJc28gPSBjcmVhdGVUaW1lc3RhbXAoKTtcbiAgICBjb25zdCBleGlzdGluZ0J5U2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBjb25zdCBleGlzdGluZ0J5TmFtZSA9IHRoaXMuZmluZEJ5TmFtZSh0cmltbWVkTmFtZSk7XG5cbiAgICBpZiAoZXhpc3RpbmdCeVNlbGVjdGVkICYmIGV4aXN0aW5nQnlTZWxlY3RlZC5uYW1lID09PSB0cmltbWVkTmFtZSkge1xuICAgICAgdGhpcy5wcm9maWxlcyA9IHRoaXMucHJvZmlsZXMubWFwKChwcm9maWxlKSA9PiAoXG4gICAgICAgIHByb2ZpbGUuaWQgPT09IGV4aXN0aW5nQnlTZWxlY3RlZC5pZFxuICAgICAgICAgID8gdXBkYXRlU2F2ZWRQZXJzb25hUHJvZmlsZShwcm9maWxlLCBleHBvcnRlZCwgbm93SXNvKVxuICAgICAgICAgIDogcHJvZmlsZVxuICAgICAgKSk7XG4gICAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYFVwZGF0ZWQgcHJvZmlsZSBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRC5gO1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgICAgdGhpcy5leGNoYW5nZUpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZShleHBvcnRlZCk7XG4gICAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChleGlzdGluZ0J5TmFtZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9IGBBIHByb2ZpbGUgbmFtZWQgXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQgYWxyZWFkeSBleGlzdHMuYDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBzYXZlZCA9IGNyZWF0ZVNhdmVkUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQsIGNyZWF0ZVByb2ZpbGVJZCgpLCBub3dJc28pO1xuICAgIHRoaXMucHJvZmlsZXMgPSBbc2F2ZWQsIC4uLnRoaXMucHJvZmlsZXNdO1xuICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBzYXZlZC5pZDtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSBzYXZlZC5uYW1lO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQpO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgU2F2ZWQgcHJvZmlsZSBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGxvYWRTZWxlY3RlZFByb2ZpbGUoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdTZWxlY3QgYSBzYXZlZCBwcm9maWxlIHRvIGxvYWQuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmFwcGx5U25hcHNob3QocHJvZmlsZS5zZXR0aW5ncyk7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gcHJvZmlsZS5uYW1lO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUodGhpcy50b0V4cG9ydChwcm9maWxlKSk7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBMb2FkZWQgcHJvZmlsZSBcdTIwMUMke3Byb2ZpbGUubmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBkdXBsaWNhdGVTZWxlY3RlZFByb2ZpbGUobmFtZSA9IHRoaXMucHJvZmlsZU5hbWVEcmFmdCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnU2VsZWN0IGEgc2F2ZWQgcHJvZmlsZSB0byBkdXBsaWNhdGUuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB0cmltbWVkTmFtZSA9IG5hbWUudHJpbSgpIHx8IGAke3Byb2ZpbGUubmFtZX0gQ29weWA7XG4gICAgaWYgKHRoaXMuZmluZEJ5TmFtZSh0cmltbWVkTmFtZSkpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSBgQSBwcm9maWxlIG5hbWVkIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFEIGFscmVhZHkgZXhpc3RzLmA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgbm93SXNvID0gY3JlYXRlVGltZXN0YW1wKCk7XG4gICAgY29uc3QgZHVwbGljYXRlID0gZHVwbGljYXRlUGVyc29uYVByb2ZpbGUocHJvZmlsZSwgY3JlYXRlUHJvZmlsZUlkKCksIHRyaW1tZWROYW1lLCBub3dJc28pO1xuICAgIHRoaXMucHJvZmlsZXMgPSBbZHVwbGljYXRlLCAuLi50aGlzLnByb2ZpbGVzXTtcbiAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gZHVwbGljYXRlLmlkO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IGR1cGxpY2F0ZS5uYW1lO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUodGhpcy50b0V4cG9ydChkdXBsaWNhdGUpKTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYER1cGxpY2F0ZWQgcHJvZmlsZSBhcyBcdTIwMUMke2R1cGxpY2F0ZS5uYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJlbmFtZVNlbGVjdGVkUHJvZmlsZShuYW1lID0gdGhpcy5wcm9maWxlTmFtZURyYWZ0KTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdTZWxlY3QgYSBzYXZlZCBwcm9maWxlIHRvIHJlbmFtZS4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHRyaW1tZWROYW1lID0gbmFtZS50cmltKCk7XG4gICAgaWYgKCF0cmltbWVkTmFtZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdFbnRlciBhIHByb2ZpbGUgbmFtZSBiZWZvcmUgcmVuYW1pbmcuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAocHJvZmlsZS5uYW1lID09PSB0cmltbWVkTmFtZSkge1xuICAgICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9ICdQcm9maWxlIG5hbWUgaXMgYWxyZWFkeSB1cCB0byBkYXRlLic7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBleGlzdGluZ0J5TmFtZSA9IHRoaXMuZmluZEJ5TmFtZSh0cmltbWVkTmFtZSk7XG4gICAgaWYgKGV4aXN0aW5nQnlOYW1lICYmIGV4aXN0aW5nQnlOYW1lLmlkICE9PSBwcm9maWxlLmlkKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gYEEgcHJvZmlsZSBuYW1lZCBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRCBhbHJlYWR5IGV4aXN0cy5gO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IG5vd0lzbyA9IGNyZWF0ZVRpbWVzdGFtcCgpO1xuICAgIHRoaXMucHJvZmlsZXMgPSB0aGlzLnByb2ZpbGVzLm1hcCgoZW50cnkpID0+IChcbiAgICAgIGVudHJ5LmlkID09PSBwcm9maWxlLmlkXG4gICAgICAgID8geyAuLi5lbnRyeSwgbmFtZTogdHJpbW1lZE5hbWUsIHVwZGF0ZWRBdDogbm93SXNvIH1cbiAgICAgICAgOiBlbnRyeVxuICAgICkpO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHRyaW1tZWROYW1lO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgUmVuYW1lZCBwcm9maWxlIHRvIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGVsZXRlU2VsZWN0ZWRQcm9maWxlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnU2VsZWN0IGEgc2F2ZWQgcHJvZmlsZSB0byBkZWxldGUuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnByb2ZpbGVzID0gdGhpcy5wcm9maWxlcy5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS5pZCAhPT0gcHJvZmlsZS5pZCk7XG4gICAgY29uc3QgbmV4dFNlbGVjdGVkSWQgPSB0aGlzLnByb2ZpbGVzWzBdPy5pZCA/PyBudWxsO1xuICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBuZXh0U2VsZWN0ZWRJZDtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZT8ubmFtZSA/PyAnJztcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9ICcnO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgRGVsZXRlZCBwcm9maWxlIFx1MjAxQyR7cHJvZmlsZS5uYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGV4cG9ydFNlbGVjdGVkUHJvZmlsZSgpOiB7IGZpbGVOYW1lOiBzdHJpbmc7IGpzb246IHN0cmluZyB9IHwgbnVsbCB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdTZWxlY3QgYSBzYXZlZCBwcm9maWxlIHRvIGV4cG9ydC4nO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZXhwb3J0ZWQgPSB0aGlzLnRvRXhwb3J0KHByb2ZpbGUpO1xuICAgIGNvbnN0IGpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZShleHBvcnRlZCk7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSBqc29uO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgRXhwb3J0ZWQgcHJvZmlsZSBcdTIwMUMke3Byb2ZpbGUubmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZmlsZU5hbWU6IGJ1aWxkUGVyc29uYVByb2ZpbGVFeHBvcnRGaWxlbmFtZShwcm9maWxlLm5hbWUpLFxuICAgICAganNvbixcbiAgICB9O1xuICB9XG5cbiAgaW1wb3J0UHJvZmlsZUZyb21Kc29uKGpzb24gPSB0aGlzLmV4Y2hhbmdlSnNvbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlUGVyc29uYVByb2ZpbGVJbXBvcnQoanNvbik7XG4gICAgaWYgKCFwYXJzZWQub2spIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSBwYXJzZWQuZXJyb3I7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgaW5jb21pbmdOYW1lID0gcGFyc2VkLnByb2ZpbGUubmFtZS50cmltKCk7XG4gICAgY29uc3QgZmluYWxOYW1lID0gdGhpcy5lbnN1cmVVbmlxdWVOYW1lKGluY29taW5nTmFtZSk7XG4gICAgY29uc3QgZXhwb3J0ZWQgPSB7XG4gICAgICAuLi5wYXJzZWQucHJvZmlsZSxcbiAgICAgIG5hbWU6IGZpbmFsTmFtZSxcbiAgICB9O1xuICAgIGNvbnN0IG5vd0lzbyA9IGNyZWF0ZVRpbWVzdGFtcCgpO1xuICAgIGNvbnN0IHNhdmVkID0gY3JlYXRlU2F2ZWRQZXJzb25hUHJvZmlsZShleHBvcnRlZCwgY3JlYXRlUHJvZmlsZUlkKCksIG5vd0lzbyk7XG5cbiAgICB0aGlzLnByb2ZpbGVzID0gW3NhdmVkLCAuLi50aGlzLnByb2ZpbGVzXTtcbiAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gc2F2ZWQuaWQ7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gc2F2ZWQubmFtZTtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKGV4cG9ydGVkKTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gZmluYWxOYW1lID09PSBpbmNvbWluZ05hbWVcbiAgICAgID8gYEltcG9ydGVkIHByb2ZpbGUgXHUyMDFDJHtmaW5hbE5hbWV9XHUyMDFELmBcbiAgICAgIDogYEltcG9ydGVkIHByb2ZpbGUgYXMgXHUyMDFDJHtmaW5hbE5hbWV9XHUyMDFEIHRvIGF2b2lkIGEgZHVwbGljYXRlIG5hbWUuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBnZXQgc2VsZWN0ZWRQcm9maWxlKCk6IFNhdmVkUGVyc29uYVByb2ZpbGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5wcm9maWxlcy5maW5kKChwcm9maWxlKSA9PiBwcm9maWxlLmlkID09PSB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkKSA/PyBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZEN1cnJlbnRTbmFwc2hvdCgpOiBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3Qge1xuICAgIHJldHVybiB7XG4gICAgICBidWNrZXRDb25maWc6IHsgLi4udGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5idWNrZXRDb25maWcgfSxcbiAgICAgIGN1cnJlbnRQcmVzZXRJZDogdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5jdXJyZW50UHJlc2V0SWQsXG4gICAgICBkZXB0aDogdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCxcbiAgICAgIG11bHRpUFY6IHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwubXVsdGlQVixcbiAgICAgIGZlYXR1cmVPcHRpb25zOiB7IC4uLnRoaXMuZGVwcy5mZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5vcHRpb25zIH0sXG4gICAgICBicmlsbGlhbnQ6IHtcbiAgICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiB0aGlzLmRlcHMuZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICAgICAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IHRoaXMuZGVwcy5mZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRBbGxvd2VkUGhhc2UsXG4gICAgICB9LFxuICAgICAgdWk6IHtcbiAgICAgICAgdGhlbWVNb2RlOiB0aGlzLmRlcHMudWlTdGF0ZVZpZXdNb2RlbC50aGVtZU1vZGUsXG4gICAgICAgIGJhc2ljTW9kZTogdGhpcy5kZXBzLnVpU3RhdGVWaWV3TW9kZWwuYmFzaWNNb2RlLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBhcHBseVNuYXBzaG90KHNuYXBzaG90OiBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3QpOiB2b2lkIHtcbiAgICB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmFwcGx5UHJvZmlsZVNuYXBzaG90KHtcbiAgICAgIGJ1Y2tldENvbmZpZzogc25hcHNob3QuYnVja2V0Q29uZmlnLFxuICAgICAgY3VycmVudFByZXNldElkOiBzbmFwc2hvdC5jdXJyZW50UHJlc2V0SWQsXG4gICAgICBkZXB0aDogc25hcHNob3QuZGVwdGgsXG4gICAgICBtdWx0aVBWOiBzbmFwc2hvdC5tdWx0aVBWLFxuICAgIH0pO1xuICAgIHRoaXMuZGVwcy5mZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5hcHBseVByb2ZpbGVTZXR0aW5ncyhzbmFwc2hvdC5mZWF0dXJlT3B0aW9ucywgc25hcHNob3QuYnJpbGxpYW50KTtcbiAgICB0aGlzLmRlcHMudWlTdGF0ZVZpZXdNb2RlbC5hcHBseVByb2ZpbGVQcmVmZXJlbmNlcyhzbmFwc2hvdC51aSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUV4cG9ydChuYW1lOiBzdHJpbmcsIHNldHRpbmdzOiBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3QpOiBQZXJzb25hUHJvZmlsZUV4cG9ydCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6IFBFUlNPTkFfUFJPRklMRV9LSU5ELFxuICAgICAgdmVyc2lvbjogUEVSU09OQV9QUk9GSUxFX1ZFUlNJT04sXG4gICAgICBuYW1lLFxuICAgICAgc2V0dGluZ3MsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgdG9FeHBvcnQocHJvZmlsZTogU2F2ZWRQZXJzb25hUHJvZmlsZSk6IFBlcnNvbmFQcm9maWxlRXhwb3J0IHtcbiAgICByZXR1cm4ge1xuICAgICAga2luZDogcHJvZmlsZS5raW5kLFxuICAgICAgdmVyc2lvbjogcHJvZmlsZS52ZXJzaW9uLFxuICAgICAgbmFtZTogcHJvZmlsZS5uYW1lLFxuICAgICAgc2V0dGluZ3M6IHByb2ZpbGUuc2V0dGluZ3MsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgZmluZEJ5TmFtZShuYW1lOiBzdHJpbmcpOiBTYXZlZFBlcnNvbmFQcm9maWxlIHwgbnVsbCB7XG4gICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiB0aGlzLnByb2ZpbGVzLmZpbmQoKHByb2ZpbGUpID0+IHByb2ZpbGUubmFtZS50cmltKCkudG9Mb3dlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUpID8/IG51bGw7XG4gIH1cblxuICBwcml2YXRlIGVuc3VyZVVuaXF1ZU5hbWUoYmFzZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdHJpbW1lZEJhc2VOYW1lID0gYmFzZU5hbWUudHJpbSgpIHx8ICdJbXBvcnRlZCBQcm9maWxlJztcbiAgICBpZiAoIXRoaXMuZmluZEJ5TmFtZSh0cmltbWVkQmFzZU5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJpbW1lZEJhc2VOYW1lO1xuICAgIH1cblxuICAgIGxldCBpbmRleCA9IDI7XG4gICAgbGV0IGNhbmRpZGF0ZSA9IGAke3RyaW1tZWRCYXNlTmFtZX0gJHtpbmRleH1gO1xuICAgIHdoaWxlICh0aGlzLmZpbmRCeU5hbWUoY2FuZGlkYXRlKSkge1xuICAgICAgaW5kZXggKz0gMTtcbiAgICAgIGNhbmRpZGF0ZSA9IGAke3RyaW1tZWRCYXNlTmFtZX0gJHtpbmRleH1gO1xuICAgIH1cblxuICAgIHJldHVybiBjYW5kaWRhdGU7XG4gIH1cblxuICBwcml2YXRlIHJlc3RvcmVGcm9tU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShQRVJTT05BX1BST0ZJTEVTX1NUT1JBR0VfS0VZKTtcbiAgICAgIGlmICghc2F2ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzbmFwc2hvdCA9IHNhbml0aXplUGVyc29uYVByb2ZpbGVTdG9yZVNuYXBzaG90KEpTT04ucGFyc2Uoc2F2ZWQpIGFzIHVua25vd24pO1xuICAgICAgdGhpcy5wcm9maWxlcyA9IHNuYXBzaG90LnByb2ZpbGVzO1xuICAgICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IHNuYXBzaG90LnNlbGVjdGVkUHJvZmlsZUlkID8/IHNuYXBzaG90LnByb2ZpbGVzWzBdPy5pZCA/PyBudWxsO1xuICAgICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU/Lm5hbWUgPz8gJyc7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgaW52YWxpZCBzYXZlZCBwZXJzb25hIHByb2ZpbGVzIGFuZCBjb250aW51ZSB3aXRoIGFuIGVtcHR5IGxpc3QuXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0VG9TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgUEVSU09OQV9QUk9GSUxFU19TVE9SQUdFX0tFWSxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHByb2ZpbGVzOiB0aGlzLnByb2ZpbGVzLFxuICAgICAgICAgIHNlbGVjdGVkUHJvZmlsZUlkOiB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgbG9jYWxTdG9yYWdlIGZhaWx1cmVzIHRvIGtlZXAgc2V0dGluZ3MgdXNhYmxlLlxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgcGVyc29uYVByb2ZpbGVzVmlld01vZGVsID0gbmV3IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCgpO1xuXG5leHBvcnQgeyBQRVJTT05BX1BST0ZJTEVTX1NUT1JBR0VfS0VZIH07XG4iLCAiLyoqXG4gKiBWaWV3TW9kZWxzIE1vZHVsZVxuICogUmUtZXhwb3J0cyBhbGwgVmlld01vZGVsIGluc3RhbmNlc1xuICovXG5cbmV4cG9ydCB7IEJvYXJkVmlld01vZGVsLCBib2FyZFZpZXdNb2RlbCB9IGZyb20gJy4vQm9hcmRWaWV3TW9kZWwnO1xuZXhwb3J0IHsgRW5naW5lVmlld01vZGVsLCBlbmdpbmVWaWV3TW9kZWwgfSBmcm9tICcuL0VuZ2luZVZpZXdNb2RlbCc7XG5leHBvcnQgeyBDb25maWdWaWV3TW9kZWwsIGNvbmZpZ1ZpZXdNb2RlbCB9IGZyb20gJy4vQ29uZmlnVmlld01vZGVsJztcbmV4cG9ydCB7IEZlYXR1cmVPcHRpb25zVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gJy4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwnO1xuZXhwb3J0IHsgR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCwgZ2FtZUFuYWx5dGljc1ZpZXdNb2RlbCB9IGZyb20gJy4vR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCc7XG5leHBvcnQgeyBHYW1lU2V0dXBWaWV3TW9kZWwsIGdhbWVTZXR1cFZpZXdNb2RlbCB9IGZyb20gJy4vR2FtZVNldHVwVmlld01vZGVsJztcbmV4cG9ydCB7IERlYnVnVmlld01vZGVsLCBkZWJ1Z1ZpZXdNb2RlbCB9IGZyb20gJy4vRGVidWdWaWV3TW9kZWwnO1xuZXhwb3J0IHsgVWlTdGF0ZVZpZXdNb2RlbCwgdWlTdGF0ZVZpZXdNb2RlbCB9IGZyb20gJy4vVWlTdGF0ZVZpZXdNb2RlbCc7XG5leHBvcnQgeyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwsIHBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCB9IGZyb20gJy4vUGVyc29uYVByb2ZpbGVzVmlld01vZGVsJztcbiIsICJpbXBvcnQgYXNzZXJ0IGZyb20gJ25vZGU6YXNzZXJ0L3N0cmljdCc7XG5pbXBvcnQgdGVzdCBmcm9tICdub2RlOnRlc3QnO1xuXG5jbGFzcyBNZW1vcnlTdG9yYWdlIHtcbiAgcHJpdmF0ZSBzdG9yZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgZ2V0SXRlbShrZXk6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmhhcyhrZXkpID8gKHRoaXMuc3RvcmUuZ2V0KGtleSkgPz8gbnVsbCkgOiBudWxsO1xuICB9XG5cbiAgc2V0SXRlbShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUuc2V0KGtleSwgdmFsdWUpO1xuICB9XG5cbiAgcmVtb3ZlSXRlbShrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUuZGVsZXRlKGtleSk7XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlLmNsZWFyKCk7XG4gIH1cbn1cblxuY29uc3QgbG9jYWxTdG9yYWdlTW9jayA9IG5ldyBNZW1vcnlTdG9yYWdlKCk7XG4oZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHsgbG9jYWxTdG9yYWdlOiBNZW1vcnlTdG9yYWdlIH0pLmxvY2FsU3RvcmFnZSA9IGxvY2FsU3RvcmFnZU1vY2s7XG5cbnRlc3QoJ2FuYWx5c2lzIHNhZmV0eSBpZ25vcmVzIHN0YWxlIHJlcXVlc3RzIGFuZCBzdGFsZSBkZWxheWVkIG1vdmVzJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IGNhbkFwcGx5QW5hbHl6ZWRNb3ZlLCBpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0IH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvYW5hbHlzaXNTYWZldHknKTtcblxuICBhc3NlcnQuZXF1YWwoaXNTdGFsZUFuYWx5c2lzUmVxdWVzdCgxLCAyKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0KDQsIDQpLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChjYW5BcHBseUFuYWx5emVkTW92ZSgnZmVuLWEnLCAnZmVuLWInKSwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoY2FuQXBwbHlBbmFseXplZE1vdmUoJ2Zlbi1hJywgJ2Zlbi1hJyksIHRydWUpO1xufSk7XG5cbnRlc3QoJ2FuYWx5c2lzIGNhY2hlIGtleSwgdHJpbW1pbmcsIGFuZCBpbnZhbGlkYXRpb24gYmVoYXZlIGNvcnJlY3RseScsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBBbmFseXNpc0NhY2hlLCBidWlsZEFuYWx5c2lzQ2FjaGVLZXkgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9hbmFseXNpc0NhY2hlJyk7XG5cbiAgYXNzZXJ0LmVxdWFsKFxuICAgIGJ1aWxkQW5hbHlzaXNDYWNoZUtleSgnZmVuJywgOCwgMTIpLFxuICAgICdmZW58ZGVwdGg6OHxtdWx0aXB2OjEyJyxcbiAgKTtcblxuICBjb25zdCBjYWNoZSA9IG5ldyBBbmFseXNpc0NhY2hlKDIpO1xuICBjYWNoZS5zZXQoeyBrZXk6ICdhJywgbW92ZXM6IFtdLCB0aW1lc3RhbXA6IDEgfSk7XG4gIGNhY2hlLnNldCh7IGtleTogJ2InLCBtb3ZlczogW10sIHRpbWVzdGFtcDogMiB9KTtcbiAgY2FjaGUuc2V0KHsga2V5OiAnYycsIG1vdmVzOiBbXSwgdGltZXN0YW1wOiAzIH0pO1xuXG4gIGFzc2VydC5lcXVhbChjYWNoZS5zaXplLCAyKTtcbiAgYXNzZXJ0LmVxdWFsKGNhY2hlLmdldCgnYScpLCBudWxsKTtcbiAgYXNzZXJ0Lm5vdEVxdWFsKGNhY2hlLmdldCgnYicpLCBudWxsKTtcbiAgYXNzZXJ0Lm5vdEVxdWFsKGNhY2hlLmdldCgnYycpLCBudWxsKTtcblxuICBjYWNoZS5pbnZhbGlkYXRlKCdiJyk7XG4gIGFzc2VydC5lcXVhbChjYWNoZS5nZXQoJ2InKSwgbnVsbCk7XG5cbiAgY2FjaGUuaW52YWxpZGF0ZSgpO1xuICBhc3NlcnQuZXF1YWwoY2FjaGUuc2l6ZSwgMCk7XG59KTtcblxudGVzdCgnZGV0ZXJtaW5pc3RpYyBSTkcgY2hhbmdlcyBzdHJlYW0gd2hlbiBGRU4gY2hhbmdlcyBhdCB0aGUgc2FtZSBtb3ZlIG51bWJlcicsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBidWlsZERldGVybWluaXN0aWNTZWVkLCBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9yYW5kb20nKTtcblxuICBjb25zdCBzZWVkQSA9IGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQoe1xuICAgIGdhbWVTdGFydEZlbjogJ3N0YXJ0LWZlbicsXG4gICAgY3VycmVudEZlbjogJ2Zlbi1hJyxcbiAgICBtb3ZlQ291bnQ6IDEyLFxuICAgIHNpZGVUb01vdmU6ICd3JyxcbiAgICBwZXJzb25hOiAnbWVkaXVtJyxcbiAgfSk7XG4gIGNvbnN0IHNlZWRCID0gYnVpbGREZXRlcm1pbmlzdGljU2VlZCh7XG4gICAgZ2FtZVN0YXJ0RmVuOiAnc3RhcnQtZmVuJyxcbiAgICBjdXJyZW50RmVuOiAnZmVuLWInLFxuICAgIG1vdmVDb3VudDogMTIsXG4gICAgc2lkZVRvTW92ZTogJ3cnLFxuICAgIHBlcnNvbmE6ICdtZWRpdW0nLFxuICB9KTtcblxuICBjb25zdCBybmdBID0gY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlKHNlZWRBKTtcbiAgY29uc3Qgcm5nQiA9IGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZShzZWVkQik7XG5cbiAgYXNzZXJ0Lm5vdEVxdWFsKHJuZ0EubmV4dCgpLCBybmdCLm5leHQoKSk7XG59KTtcblxudGVzdCgnUEdOIGN1c3RvbSBzdGFydCBGRU4gaXMgcmVzcGVjdGVkJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IHJlc29sdmVQZ25TdGFydEZlbiB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2dhbWVTZXNzaW9uJyk7XG5cbiAgY29uc3QgZmVuID0gcmVzb2x2ZVBnblN0YXJ0RmVuKFxuICAgIHtcbiAgICAgIFNldFVwOiAnMScsXG4gICAgICBGRU46ICc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnLFxuICAgIH0sXG4gICAgJ2ZhbGxiYWNrJyxcbiAgKTtcblxuICBhc3NlcnQuZXF1YWwoZmVuLCAnOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyk7XG59KTtcblxudGVzdCgnYnJpbGxpYW50IHVzYWdlIGRlcml2ZXMgZnJvbSBtb3ZlIGhpc3RvcnkgbWV0YWRhdGEnLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgZGVyaXZlQnJpbGxpYW50VXNhZ2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9icmlsbGlhbnRUcmFja2luZycpO1xuXG4gIGNvbnN0IHVzYWdlID0gZGVyaXZlQnJpbGxpYW50VXNhZ2UoW1xuICAgIHtcbiAgICAgIGJlZm9yZUZlbjogJ2EnLFxuICAgICAgYWZ0ZXJGZW46ICdiJyxcbiAgICAgIHVjaTogJ2UyZTQnLFxuICAgICAgbW92ZU51bWJlcjogMSxcbiAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiBmYWxzZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGJlZm9yZUZlbjogJ2InLFxuICAgICAgYWZ0ZXJGZW46ICdjJyxcbiAgICAgIHVjaTogJ2U3ZTUnLFxuICAgICAgbW92ZU51bWJlcjogMSxcbiAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlLFxuICAgIH0sXG4gIF0pO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwodXNhZ2UsIHtcbiAgICBicmlsbGlhbnRVc2VkQ291bnQ6IDEsXG4gICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IFsxXSxcbiAgfSk7XG59KTtcblxudGVzdCgnYnJpbGxpYW50IGJ1ZGdldCBpcyBjb25zdW1lZCBvbmx5IGFmdGVyIGEgc3VjY2Vzc2Z1bCBlbmdpbmUgbW92ZSBhbmQgcm9sbHMgYmFjayBvbiB1bmRvL3JlZG8nLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZUJyaWxsaWFudE1vdmVCdWRnZXQnLCB0cnVlKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lKDIpO1xuXG4gIGNvbnN0IGludmFsaWRNb3ZlID0gYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2ExYTEnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoaW52YWxpZE1vdmUsIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG5cbiAgY29uc3Qgc3VjY2Vzc2Z1bE1vdmUgPSBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnZTJlNCcsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChzdWNjZXNzZnVsTW92ZSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuICBhc3NlcnQuZGVlcEVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVOdW1iZXJzLCBbMV0pO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC51bmRvU2luZ2xlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3ZlTnVtYmVycywgW10pO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5yZWRvU2luZ2xlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3ZlTnVtYmVycywgWzFdKTtcbn0pO1xuXG50ZXN0KCduZXcgRkVOLCBQR04sIGFuZCBvcGVuaW5nIGxvYWRzIHJlc2V0IGJyaWxsaWFudCBzdGF0ZSBhbmQgUEdOIHN0YXJ0IEZFTiB1cGRhdGVzIGdhbWUgc3RhcnQnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IFBSRURFRklORURfT1BFTklOR1MgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9vcGVuaW5ncycpO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZUJyaWxsaWFudE1vdmVCdWRnZXQnLCB0cnVlKTtcbiAgYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2UyZTQnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcblxuICBib2FyZFZpZXdNb2RlbC5sb2FkRmVuKCc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG5cbiAgYm9hcmRWaWV3TW9kZWwubG9hZFBnbignW1NldFVwIFwiMVwiXVxcbltGRU4gXCI4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDFcIl1cXG5cXG4xLiBLYTIgKicpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuZ2FtZVN0YXJ0RmVuLCAnOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuXG4gIGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdoMWgyJywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG5cbiAgYm9hcmRWaWV3TW9kZWwubG9hZFBnbihQUkVERUZJTkVEX09QRU5JTkdTWzBdLnBnbik7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xufSk7XG5cbnRlc3QoJ3NvbHZlTmV4dE1vdmUgZHJvcHMgc3RhbGUgZGVsYXllZCBhdXRvcGxheSBtb3ZlcyBzYWZlbHknLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBlbmdpbmVWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLCBjb25maWdWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbicsIHRydWUpO1xuICBjb25maWdWaWV3TW9kZWwuYXBwbHlQcmVzZXQoJ21lZGl1bScpO1xuXG4gIGNvbnN0IG9yaWdpbmFsSW5pdGlhbGl6ZSA9IGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplLmJpbmQoZW5naW5lVmlld01vZGVsKTtcbiAgY29uc3Qgb3JpZ2luYWxBbmFseXplUG9zaXRpb24gPSBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uLmJpbmQoZW5naW5lVmlld01vZGVsKTtcbiAgY29uc3Qgb3JpZ2luYWxQaWNrTW92ZSA9IGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcy5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG5cbiAgbGV0IHJlbGVhc2VEZWxheTogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG5cbiAgZW5naW5lVmlld01vZGVsLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSA9IGFzeW5jICgpID0+IHVuZGVmaW5lZDtcbiAgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbiA9IGFzeW5jIChmZW46IHN0cmluZykgPT4gKHtcbiAgICByZXF1ZXN0SWQ6IDEsXG4gICAgYW5hbHl6ZWRGZW46IGZlbixcbiAgICBtb3ZlczogW1xuICAgICAge1xuICAgICAgICBtb3ZlOiAnZTJlNCcsXG4gICAgICAgIGV2YWx1YXRpb246IDMwLFxuICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgcHY6IFsnZTJlNCddLFxuICAgICAgICBtdWx0aXB2OiAxLFxuICAgICAgICBkZXB0aDogOCxcbiAgICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgICB9LFxuICAgIF0sXG4gICAgY29tcGxleGl0eToge1xuICAgICAgbGV2ZWw6ICdtZWRpdW0nLFxuICAgICAgc2NvcmU6IDAuNSxcbiAgICAgIHNwcmVhZDogMzAsXG4gICAgICBjbG9zZUNhbmRpZGF0ZXM6IDIsXG4gICAgICB2b2xhdGlsaXR5OiAyMCxcbiAgICB9LFxuICAgIGlnbm9yZWQ6IGZhbHNlLFxuICAgIGZyb21DYWNoZTogZmFsc2UsXG4gICAgcHVycG9zZTogJ2VuZ2luZU1vdmUnLFxuICB9KTtcbiAgZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzID0gKCkgPT4gKHtcbiAgICBtb3ZlOiB7XG4gICAgICBtb3ZlOiAnZTJlNCcsXG4gICAgICBldmFsdWF0aW9uOiAzMCxcbiAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgcHY6IFsnZTJlNCddLFxuICAgICAgbXVsdGlwdjogMSxcbiAgICAgIGRlcHRoOiA4LFxuICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgfSxcbiAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gIH0pO1xuXG4gIChib2FyZFZpZXdNb2RlbCBhcyB1bmtub3duIGFzIHsgd2FpdDogKGRlbGF5TXM6IG51bWJlcikgPT4gUHJvbWlzZTx2b2lkPiB9KS53YWl0ID0gKCkgPT5cbiAgICBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgcmVsZWFzZURlbGF5ID0gcmVzb2x2ZTtcbiAgICB9KTtcblxuICBjb25zdCBwZW5kaW5nTW92ZSA9IGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUodHJ1ZSk7XG4gIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgc2V0VGltZW91dChyZXNvbHZlLCAwKTtcbiAgfSk7XG4gIGJvYXJkVmlld01vZGVsLmxvYWRGZW4oJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScpO1xuICByZWxlYXNlRGVsYXk/LigpO1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBwZW5kaW5nTW92ZTtcblxuICBhc3NlcnQuZXF1YWwocmVzdWx0LCBudWxsKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmZlbiwgJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScpO1xuXG4gIGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplID0gb3JpZ2luYWxJbml0aWFsaXplO1xuICBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxBbmFseXplUG9zaXRpb247XG4gIGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcyA9IG9yaWdpbmFsUGlja01vdmU7XG59KTtcblxudGVzdCgnYmFja2dyb3VuZCBhbmFseXNpcyBkb2VzIG5vdCBjYW5jZWwgYSB2YWxpZCBwZW5kaW5nIGVuZ2luZSBtb3ZlIHJlcXVlc3QnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IEVuZ2luZVZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLCBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZScpO1xuICBjb25zdCBlbmdpbmUgPSBuZXcgRW5naW5lVmlld01vZGVsKCk7XG5cbiAgY29uc3Qgb3JpZ2luYWxJbml0aWFsaXplID0gZW5naW5lLmluaXRpYWxpemUuYmluZChlbmdpbmUpO1xuICBjb25zdCBvcmlnaW5hbE1vdmVBbmFseXplID0gbW92ZVN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uLmJpbmQobW92ZVN0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbE1vdmVDb25maWd1cmUgPSBtb3ZlU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUuYmluZChtb3ZlU3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsTW92ZVN0b3AgPSBtb3ZlU3RvY2tmaXNoU2VydmljZS5zdG9wLmJpbmQobW92ZVN0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5c2lzQW5hbHl6ZSA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24uYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5c2lzQ29uZmlndXJlID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZS5iaW5kKGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHlzaXNTdG9wID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AuYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuXG4gIGxldCByZWxlYXNlTW92ZUFuYWx5c2lzOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgbGV0IG1vdmVBbmFseXplQ2FsbHMgPSAwO1xuICBsZXQgYmFja2dyb3VuZEFuYWx5emVDYWxscyA9IDA7XG5cbiAgZW5naW5lLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IGFzeW5jICgpID0+IHVuZGVmaW5lZDtcbiAgbW92ZVN0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gKCkgPT4gdW5kZWZpbmVkO1xuICBtb3ZlU3RvY2tmaXNoU2VydmljZS5zdG9wID0gKCkgPT4gdW5kZWZpbmVkO1xuICBtb3ZlU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgbW92ZUFuYWx5emVDYWxscyArPSAxO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICByZWxlYXNlTW92ZUFuYWx5c2lzID0gcmVzb2x2ZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgICAgZXZhbHVhdGlvbjogNDIsXG4gICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICBwdjogWydlMmU0J10sXG4gICAgICAgIG11bHRpcHY6IDEsXG4gICAgICAgIGRlcHRoOiAxMCxcbiAgICAgIH0sXG4gICAgXTtcbiAgfTtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9ICgpID0+IHVuZGVmaW5lZDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgYmFja2dyb3VuZEFuYWx5emVDYWxscyArPSAxO1xuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgICAgZXZhbHVhdGlvbjogNDIsXG4gICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICBwdjogWydlMmU0J10sXG4gICAgICAgIG11bHRpcHY6IDEsXG4gICAgICAgIGRlcHRoOiAxMCxcbiAgICAgIH0sXG4gICAgXTtcbiAgfTtcblxuICBjb25zdCBlbmdpbmVNb3ZlUHJvbWlzZSA9IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1zaGFyZWQnLCAxMCwgMiwgJ2VuZ2luZU1vdmUnKTtcbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMCkpO1xuICBjb25zdCBiYWNrZ3JvdW5kUHJvbWlzZSA9IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1zaGFyZWQnLCAxMCwgMiwgJ2JhY2tncm91bmQnKTtcblxuICByZWxlYXNlTW92ZUFuYWx5c2lzPy4oKTtcblxuICBjb25zdCBbZW5naW5lTW92ZVJlc3VsdCwgYmFja2dyb3VuZFJlc3VsdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbZW5naW5lTW92ZVByb21pc2UsIGJhY2tncm91bmRQcm9taXNlXSk7XG5cbiAgYXNzZXJ0LmVxdWFsKG1vdmVBbmFseXplQ2FsbHMsIDEpO1xuICBhc3NlcnQuZXF1YWwoYmFja2dyb3VuZEFuYWx5emVDYWxscywgMSk7XG4gIGFzc2VydC5lcXVhbChlbmdpbmVNb3ZlUmVzdWx0Lmlnbm9yZWQsIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGJhY2tncm91bmRSZXN1bHQuaWdub3JlZCwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoYmFja2dyb3VuZFJlc3VsdC5hbmFseXplZEZlbiwgJ2Zlbi1zaGFyZWQnKTtcblxuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IG9yaWdpbmFsSW5pdGlhbGl6ZTtcbiAgbW92ZVN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxNb3ZlQW5hbHl6ZTtcbiAgbW92ZVN0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gb3JpZ2luYWxNb3ZlQ29uZmlndXJlO1xuICBtb3ZlU3RvY2tmaXNoU2VydmljZS5zdG9wID0gb3JpZ2luYWxNb3ZlU3RvcDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IG9yaWdpbmFsQW5hbHlzaXNBbmFseXplO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gb3JpZ2luYWxBbmFseXNpc0NvbmZpZ3VyZTtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AgPSBvcmlnaW5hbEFuYWx5c2lzU3RvcDtcbn0pO1xuXG50ZXN0KCdlbmdpbmUgcmVzZXQgY2xlYXJzIGluLWZsaWdodCBhbmFseXNpcyBzdGF0ZSBzbyBuZXcgcmVxdWVzdHMgYXJlIG5vdCBibG9ja2VkJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBFbmdpbmVWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZScpO1xuICBjb25zdCBlbmdpbmUgPSBuZXcgRW5naW5lVmlld01vZGVsKCk7XG5cbiAgY29uc3Qgb3JpZ2luYWxJbml0aWFsaXplID0gZW5naW5lLmluaXRpYWxpemUuYmluZChlbmdpbmUpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5emUgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uLmJpbmQoYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxDb25maWd1cmUgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlLmJpbmQoYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxTdG9wID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AuYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuXG4gIGxldCByZXNvbHZlRmlyc3RBbmFseXNpczogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIGxldCBhbmFseXplQ2FsbENvdW50ID0gMDtcblxuICBlbmdpbmUuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gIGVuZ2luZS5pbml0aWFsaXplID0gYXN5bmMgKCkgPT4gdW5kZWZpbmVkO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gKCkgPT4gdW5kZWZpbmVkO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2Uuc3RvcCA9ICgpID0+IHVuZGVmaW5lZDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IGFzeW5jICgpID0+IHtcbiAgICBhbmFseXplQ2FsbENvdW50ICs9IDE7XG5cbiAgICBpZiAoYW5hbHl6ZUNhbGxDb3VudCA9PT0gMSkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHJlc29sdmVGaXJzdEFuYWx5c2lzID0gKCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBtb3ZlOiAnZTJlNCcsXG4gICAgICAgICAgICAgIGV2YWx1YXRpb246IDEyLFxuICAgICAgICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgICAgICAgcHY6IFsnZTJlNCddLFxuICAgICAgICAgICAgICBtdWx0aXB2OiAxLFxuICAgICAgICAgICAgICBkZXB0aDogOCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSk7XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBtb3ZlOiAnZDJkNCcsXG4gICAgICAgIGV2YWx1YXRpb246IDE4LFxuICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgcHY6IFsnZDJkNCddLFxuICAgICAgICBtdWx0aXB2OiAxLFxuICAgICAgICBkZXB0aDogOCxcbiAgICAgIH0sXG4gICAgXTtcbiAgfTtcblxuICBjb25zdCBzdGFsZUFuYWx5c2lzUHJvbWlzZSA9IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1vbGQnLCA4LCAyLCAnYmFja2dyb3VuZCcpO1xuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCAwKSk7XG5cbiAgZW5naW5lLnJlc2V0KCk7XG4gIGFzc2VydC5lcXVhbChlbmdpbmUuaXNBbmFseXppbmcsIGZhbHNlKTtcblxuICBjb25zdCBmcmVzaEFuYWx5c2lzUHJvbWlzZSA9IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1uZXcnLCA4LCAyLCAnYmFja2dyb3VuZCcpO1xuICByZXNvbHZlRmlyc3RBbmFseXNpcz8uKCk7XG5cbiAgY29uc3QgZnJlc2hSZXN1bHQgPSBhd2FpdCBmcmVzaEFuYWx5c2lzUHJvbWlzZTtcbiAgY29uc3Qgc3RhbGVSZXN1bHQgPSBhd2FpdCBzdGFsZUFuYWx5c2lzUHJvbWlzZTtcblxuICBhc3NlcnQuZXF1YWwoYW5hbHl6ZUNhbGxDb3VudCwgMik7XG4gIGFzc2VydC5lcXVhbChmcmVzaFJlc3VsdC5hbmFseXplZEZlbiwgJ2Zlbi1uZXcnKTtcbiAgYXNzZXJ0LmVxdWFsKHN0YWxlUmVzdWx0Lmlnbm9yZWQsIHRydWUpO1xuXG4gIGVuZ2luZS5pbml0aWFsaXplID0gb3JpZ2luYWxJbml0aWFsaXplO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxBbmFseXplO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gb3JpZ2luYWxDb25maWd1cmU7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5zdG9wID0gb3JpZ2luYWxTdG9wO1xufSk7XG5cbnRlc3QoJ3Jlc3RvcmVkIG1vdmUgYW5ub3RhdGlvbnMgcHJlc2VydmUgYnJpbGxpYW50IHVuZG8vcmVkbyB0cmFja2luZyBhZnRlciByZXN0YXJ0JywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBCb2FyZFZpZXdNb2RlbCwgYm9hcmRWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigncGVyc2lzdEVuZ2luZUNvbmZpZycsIHRydWUpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZUJyaWxsaWFudE1vdmVCdWRnZXQnLCB0cnVlKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lKDIpO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGNvbnN0IG1vdmVBcHBsaWVkID0gYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2UyZTQnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwobW92ZUFwcGxpZWQsIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwudW5kb1NpbmdsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5jYW5SZWRvLCB0cnVlKTtcblxuICBjb25zdCByZXN0b3JlZEJvYXJkID0gbmV3IEJvYXJkVmlld01vZGVsKCk7XG4gIGFzc2VydC5lcXVhbChyZXN0b3JlZEJvYXJkLmNhblJlZG8sIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcblxuICBhc3NlcnQuZXF1YWwocmVzdG9yZWRCb2FyZC5yZWRvU2luZ2xlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3ZlTnVtYmVycywgWzFdKTtcblxuICBhc3NlcnQuZXF1YWwocmVzdG9yZWRCb2FyZC51bmRvU2luZ2xlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcbn0pO1xuXG50ZXN0KCduZXcgZ2FtZSBjbGVhcnMgc3RhbGUgYm9hcmQgdHJhbnNpZW50IHN0YXRlIGFuZCBhbGxvd3MgYmxhY2sgYXV0b3BsYXkgdHVybiBmbG93IGFnYWluJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGJvYXJkVmlld01vZGVsLmlzVGhpbmtpbmcgPSB0cnVlO1xuICBib2FyZFZpZXdNb2RlbC5pc0FuYWx5emluZ01vdmVzID0gdHJ1ZTtcbiAgYm9hcmRWaWV3TW9kZWwubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gJ2dvb2QnO1xuICBib2FyZFZpZXdNb2RlbC5zZXRBdXRvUGxheSh0cnVlKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0RW5naW5lUGxheXNGb3IoJ2InKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5pc1RoaW5raW5nLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5pc0FuYWx5emluZ01vdmVzLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5sYXN0UGxheWVyTW92ZVF1YWxpdHksIG51bGwpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuY2FuU3RhcnRBdXRvUGxheVR1cm4sIGZhbHNlKTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwubWFrZU1vdmUoJ2UyJywgJ2U0JyksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuY2FuU3RhcnRBdXRvUGxheVR1cm4sIHRydWUpO1xufSk7XG5cbnRlc3QoJ2NhY2hlLWhpdCBpbmRpY2F0b3IgcmVmbGVjdHMgd2hldGhlciBhbmFseXNpcyBjYW1lIGZyb20gY2FjaGUnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IEVuZ2luZVZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZScpO1xuICBjb25zdCB7IGFuYWx5c2lzQ2FjaGUgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9hbmFseXNpc0NhY2hlJyk7XG4gIGNvbnN0IGVuZ2luZSA9IG5ldyBFbmdpbmVWaWV3TW9kZWwoKTtcblxuICBjb25zdCBvcmlnaW5hbEluaXRpYWxpemUgPSBlbmdpbmUuaW5pdGlhbGl6ZS5iaW5kKGVuZ2luZSk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHl6ZSA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24uYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbENvbmZpZ3VyZSA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUuYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuXG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZU1vdmVBbmFseXNpc0NhY2hlJywgdHJ1ZSk7XG4gIGFuYWx5c2lzQ2FjaGUuaW52YWxpZGF0ZSgpO1xuXG4gIGVuZ2luZS5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgZW5naW5lLmluaXRpYWxpemUgPSBhc3luYyAoKSA9PiB1bmRlZmluZWQ7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoKSA9PiBbXG4gICAge1xuICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgZXZhbHVhdGlvbjogMzUsXG4gICAgICBldmFsTG9zczogMCxcbiAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgIG11bHRpcHY6IDEsXG4gICAgICBkZXB0aDogMTIsXG4gICAgfSxcbiAgXTtcblxuICBjb25zdCBmaXJzdCA9IGF3YWl0IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1jYWNoZScsIDEyLCAyLCAnYmFja2dyb3VuZCcpO1xuICBjb25zdCBzZWNvbmQgPSBhd2FpdCBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tY2FjaGUnLCAxMiwgMiwgJ2JhY2tncm91bmQnKTtcblxuICBhc3NlcnQuZXF1YWwoZmlyc3QuZnJvbUNhY2hlLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChzZWNvbmQuZnJvbUNhY2hlLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGVuZ2luZS5sYXN0QW5hbHlzaXNGcm9tQ2FjaGUsIHRydWUpO1xuXG4gIGVuZ2luZS5pbml0aWFsaXplID0gb3JpZ2luYWxJbml0aWFsaXplO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxBbmFseXplO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gb3JpZ2luYWxDb25maWd1cmU7XG59KTtcblxudGVzdCgncGVyc29uYSBwcm9maWxlcyBzYXZlIGFuZCBsb2FkIHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24gc25hcHNob3QnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IERFRkFVTFRfQlVDS0VUX0NPTkZJRyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3R5cGVzJyk7XG4gIGNvbnN0IHsgREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9mZWF0dXJlT3B0aW9ucycpO1xuXG4gIGxldCBhcHBsaWVkQ29uZmlnOiB1bmtub3duID0gbnVsbDtcbiAgbGV0IGFwcGxpZWRGZWF0dXJlT3B0aW9uczogdW5rbm93biA9IG51bGw7XG4gIGxldCBhcHBsaWVkQnJpbGxpYW50U2V0dGluZ3M6IHVua25vd24gPSBudWxsO1xuICBsZXQgYXBwbGllZFVpOiB1bmtub3duID0gbnVsbDtcblxuICBjb25zdCBwcm9maWxlcyA9IG5ldyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwoe1xuICAgIGNvbmZpZ1ZpZXdNb2RlbDoge1xuICAgICAgYnVja2V0Q29uZmlnOiB7XG4gICAgICAgIC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgICAgICAgYmVzdDogMjgsXG4gICAgICAgIGdyZWF0OiAyMixcbiAgICAgIH0sXG4gICAgICBjdXJyZW50UHJlc2V0SWQ6ICdhZ2dyZXNzaXZlJyxcbiAgICAgIGRlcHRoOiAxMyxcbiAgICAgIG11bHRpUFY6IDcsXG4gICAgICBhcHBseVByb2ZpbGVTbmFwc2hvdDogKHNuYXBzaG90KSA9PiB7XG4gICAgICAgIGFwcGxpZWRDb25maWcgPSBzbmFwc2hvdDtcbiAgICAgIH0sXG4gICAgfSxcbiAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbDoge1xuICAgICAgb3B0aW9uczoge1xuICAgICAgICAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyxcbiAgICAgICAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogdHJ1ZSxcbiAgICAgICAgdXNlTW92ZUFuYWx5c2lzQ2FjaGU6IGZhbHNlLFxuICAgICAgICB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0OiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMyxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ21pZGRsZWdhbWUnLFxuICAgICAgYXBwbHlQcm9maWxlU2V0dGluZ3M6IChvcHRpb25zLCBicmlsbGlhbnQpID0+IHtcbiAgICAgICAgYXBwbGllZEZlYXR1cmVPcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgYXBwbGllZEJyaWxsaWFudFNldHRpbmdzID0gYnJpbGxpYW50O1xuICAgICAgfSxcbiAgICB9LFxuICAgIHVpU3RhdGVWaWV3TW9kZWw6IHtcbiAgICAgIHRoZW1lTW9kZTogJ3BlcnNvbmEnLFxuICAgICAgYmFzaWNNb2RlOiBmYWxzZSxcbiAgICAgIGFwcGx5UHJvZmlsZVByZWZlcmVuY2VzOiAocHJlZmVyZW5jZXMpID0+IHtcbiAgICAgICAgYXBwbGllZFVpID0gcHJlZmVyZW5jZXM7XG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIHByb2ZpbGVzLnNldFByb2ZpbGVOYW1lRHJhZnQoJ1NoYXJwIFRhY3RpY2lhbicpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMuc2F2ZUN1cnJlbnRQcm9maWxlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXMubGVuZ3RoLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5uYW1lLCAnU2hhcnAgVGFjdGljaWFuJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8uc2V0dGluZ3MuZGVwdGgsIDEzKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy5mZWF0dXJlT3B0aW9ucy51c2VEZXRlcm1pbmlzdGljUm5nLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy5icmlsbGlhbnQuYnJpbGxpYW50TW92ZXNQZXJHYW1lLCAzKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy51aS50aGVtZU1vZGUsICdwZXJzb25hJyk7XG5cbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLmxvYWRTZWxlY3RlZFByb2ZpbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoYXBwbGllZENvbmZpZywge1xuICAgIGJ1Y2tldENvbmZpZzoge1xuICAgICAgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICAgICAgYmVzdDogMjgsXG4gICAgICBncmVhdDogMjIsXG4gICAgfSxcbiAgICBjdXJyZW50UHJlc2V0SWQ6ICdhZ2dyZXNzaXZlJyxcbiAgICBkZXB0aDogMTMsXG4gICAgbXVsdGlQVjogNyxcbiAgfSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoYXBwbGllZEZlYXR1cmVPcHRpb25zLCB7XG4gICAgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gICAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogdHJ1ZSxcbiAgICB1c2VNb3ZlQW5hbHlzaXNDYWNoZTogZmFsc2UsXG4gICAgdXNlQnJpbGxpYW50TW92ZUJ1ZGdldDogdHJ1ZSxcbiAgfSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoYXBwbGllZEJyaWxsaWFudFNldHRpbmdzLCB7XG4gICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAzLFxuICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ21pZGRsZWdhbWUnLFxuICB9KTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChhcHBsaWVkVWksIHtcbiAgICB0aGVtZU1vZGU6ICdwZXJzb25hJyxcbiAgICBiYXNpY01vZGU6IGZhbHNlLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdwZXJzb25hIHByb2ZpbGUgaW1wb3J0IHZhbGlkYXRlcyBKU09OIHNhZmVseSBhbmQgZGVkdXBsaWNhdGVzIG5hbWVzJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBERUZBVUxUX0JVQ0tFVF9DT05GSUcgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS90eXBlcycpO1xuICBjb25zdCB7IERFRkFVTFRfRkVBVFVSRV9PUFRJT05TIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvZmVhdHVyZU9wdGlvbnMnKTtcblxuICBjb25zdCBwcm9maWxlcyA9IG5ldyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwoe1xuICAgIGNvbmZpZ1ZpZXdNb2RlbDoge1xuICAgICAgYnVja2V0Q29uZmlnOiB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyB9LFxuICAgICAgY3VycmVudFByZXNldElkOiAnbWVkaXVtJyxcbiAgICAgIGRlcHRoOiA4LFxuICAgICAgbXVsdGlQVjogMTIsXG4gICAgICBhcHBseVByb2ZpbGVTbmFwc2hvdDogKCkgPT4gdW5kZWZpbmVkLFxuICAgIH0sXG4gICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWw6IHtcbiAgICAgIG9wdGlvbnM6IHsgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfSxcbiAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMCxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ2FueScsXG4gICAgICBhcHBseVByb2ZpbGVTZXR0aW5nczogKCkgPT4gdW5kZWZpbmVkLFxuICAgIH0sXG4gICAgdWlTdGF0ZVZpZXdNb2RlbDoge1xuICAgICAgdGhlbWVNb2RlOiAnZGFyaycsXG4gICAgICBiYXNpY01vZGU6IHRydWUsXG4gICAgICBhcHBseVByb2ZpbGVQcmVmZXJlbmNlczogKCkgPT4gdW5kZWZpbmVkLFxuICAgIH0sXG4gIH0pO1xuXG4gIHByb2ZpbGVzLnNldFByb2ZpbGVOYW1lRHJhZnQoJ0JhbGFuY2VkJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5zYXZlQ3VycmVudFByb2ZpbGUoKSwgdHJ1ZSk7XG5cbiAgcHJvZmlsZXMuc2V0RXhjaGFuZ2VKc29uKCd7YmFkIGpzb24nKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLmltcG9ydFByb2ZpbGVGcm9tSnNvbigpLCBmYWxzZSk7XG4gIGFzc2VydC5tYXRjaChwcm9maWxlcy5pbXBvcnRFcnJvciwgL2NvdWxkIG5vdCBiZSBwYXJzZWQvaSk7XG5cbiAgcHJvZmlsZXMuc2V0RXhjaGFuZ2VKc29uKFxuICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGtpbmQ6ICdwZXJzb25hY2hlc3MucGVyc29uYS1wcm9maWxlJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBuYW1lOiAnQmFsYW5jZWQnLFxuICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgYnVja2V0Q29uZmlnOiBERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gICAgICAgIGN1cnJlbnRQcmVzZXRJZDogJ2hhcmQnLFxuICAgICAgICBkZXB0aDogMTUsXG4gICAgICAgIG11bHRpUFY6IDQsXG4gICAgICAgIGZlYXR1cmVPcHRpb25zOiB7XG4gICAgICAgICAgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gICAgICAgICAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgYnJpbGxpYW50OiB7XG4gICAgICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAyLFxuICAgICAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ2VuZGdhbWUnLFxuICAgICAgICB9LFxuICAgICAgICB1aToge1xuICAgICAgICAgIHRoZW1lTW9kZTogJ2xpZ2h0JyxcbiAgICAgICAgICBiYXNpY01vZGU6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcbiAgKTtcblxuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMuaW1wb3J0UHJvZmlsZUZyb21Kc29uKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXMubGVuZ3RoLCAyKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5uYW1lLCAnQmFsYW5jZWQgMicpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLmN1cnJlbnRQcmVzZXRJZCwgJ2hhcmQnKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy51aS50aGVtZU1vZGUsICdsaWdodCcpO1xufSk7XG5cbnRlc3QoJ2dhbWUgc2V0dXAgcHJlc2V0cyByZW1haW4gc2VhcmNoYWJsZSBhbmQgY29tcGF0aWJsZSB3aXRoIHRoZSBleGlzdGluZyBvcGVuaW5nIGxpYnJhcnknLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgUFJFREVGSU5FRF9PUEVOSU5HUyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL29wZW5pbmdzJyk7XG4gIGNvbnN0IHtcbiAgICBHQU1FX1NFVFVQX1BSRVNFVFMsXG4gICAgZmlsdGVyR2FtZVNldHVwUHJlc2V0cyxcbiAgICB0b0NvbXBhdGlibGVPcGVuaW5nUHJlc2V0LFxuICB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2dhbWVTZXR1cFByZXNldHMnKTtcblxuICBhc3NlcnQub2soR0FNRV9TRVRVUF9QUkVTRVRTLmxlbmd0aCA+PSBQUkVERUZJTkVEX09QRU5JTkdTLmxlbmd0aCk7XG5cbiAgY29uc3QgZmlsdGVyZWQgPSBmaWx0ZXJHYW1lU2V0dXBQcmVzZXRzKEdBTUVfU0VUVVBfUFJFU0VUUywgJ29wZW5pbmdzJywgJ3NpY2lsaWFuJyk7XG4gIGFzc2VydC5lcXVhbChmaWx0ZXJlZC5sZW5ndGgsIDEpO1xuICBhc3NlcnQubWF0Y2goZmlsdGVyZWRbMF0/Lm5hbWUgPz8gJycsIC9zaWNpbGlhbi9pKTtcblxuICBjb25zdCBvcGVuaW5nUHJlc2V0ID0gdG9Db21wYXRpYmxlT3BlbmluZ1ByZXNldChQUkVERUZJTkVEX09QRU5JTkdTWzBdPy5pZCA/PyAnJyk7XG4gIGFzc2VydC5lcXVhbChvcGVuaW5nUHJlc2V0Py5zb3VyY2VUeXBlLCAncGduJyk7XG4gIGFzc2VydC5lcXVhbChvcGVuaW5nUHJlc2V0Py5zb3VyY2UsIFBSRURFRklORURfT1BFTklOR1NbMF0/LnBnbik7XG59KTtcblxudGVzdCgnbG9hZGluZyBhIGdhbWUgc2V0dXAgcHJlc2V0IHJlc2V0cyBzZXNzaW9uIHN0YXRlIGFuZCBicmlsbGlhbnQgdHJhY2tpbmcnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IGdldEdhbWVTZXR1cFByZXNldEJ5SWQgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9nYW1lU2V0dXBQcmVzZXRzJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsIHRydWUpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWUoMik7XG5cbiAgY29uc3QgYmFzZWxpbmVTZXNzaW9uSWQgPSBib2FyZFZpZXdNb2RlbC5kZWJ1Z1Nlc3Npb25JZDtcbiAgYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2UyZTQnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcblxuICBjb25zdCBwcmVzZXQgPSBnZXRHYW1lU2V0dXBQcmVzZXRCeUlkKCdpdGFsaWFuJyk7XG4gIGFzc2VydC5vayhwcmVzZXQpO1xuICBpZiAoIXByZXNldCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgaXRhbGlhbiBwcmVzZXQgdG8gZXhpc3QnKTtcbiAgfVxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwubG9hZEdhbWVTZXR1cFByZXNldChwcmVzZXQpLCB0cnVlKTtcbiAgYXNzZXJ0Lm5vdEVxdWFsKGJvYXJkVmlld01vZGVsLmRlYnVnU2Vzc2lvbklkLCBiYXNlbGluZVNlc3Npb25JZCk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuICBhc3NlcnQubWF0Y2goYm9hcmRWaWV3TW9kZWwuc3RhdHVzTWVzc2FnZSwgL2l0YWxpYW4vaSk7XG59KTtcblxudGVzdCgnZ2FtZSBhbmFseXRpY3Mgc3VtbWFyeSBhZ2dyZWdhdGVzIHF1YWxpdHksIHRpbWluZywgY29tcGxleGl0eSwgYW5kIGhpZ2hsaWdodHMnLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2dhbWVBbmFseXRpY3MnKTtcblxuICBjb25zdCBzdW1tYXJ5ID0gYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSh7XG4gICAgc2Vzc2lvbklkOiAnc2Vzc2lvbl90ZXN0JyxcbiAgICBjcmVhdGVkQXRNczogMTAwMCxcbiAgICBmaW5pc2hlZEF0TXM6IDkwMDAsXG4gICAgZ2FtZVN0YXR1czogJ0NoZWNrbWF0ZSEgV2hpdGUgd2lucycsXG4gICAgcGVyc29uYUlkOiAnYWdncmVzc2l2ZScsXG4gICAgcGVyc29uYUxhYmVsOiAnQWdncmVzc2l2ZScsXG4gICAgc2V0dXBOYW1lOiAnSXRhbGlhbiBHYW1lJyxcbiAgICBzZXR1cENhdGVnb3J5OiAnb3BlbmluZ3MnLFxuICAgIGF1dG9wbGF5RHVyYXRpb25NczogMjYwMCxcbiAgICBwZ246ICcxLiBlNCBlNSAqJyxcbiAgICBtb3ZlQW5ub3RhdGlvbnM6IFtcbiAgICAgIHtcbiAgICAgICAgYmVmb3JlRmVuOiAnYScsXG4gICAgICAgIGFmdGVyRmVuOiAnYicsXG4gICAgICAgIHVjaTogJ2UyZTQnLFxuICAgICAgICBtb3ZlTnVtYmVyOiAxLFxuICAgICAgICBjb25zdW1lZEJyaWxsaWFudDogZmFsc2UsXG4gICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgc2FuOiAnZTQnLFxuICAgICAgICBidWNrZXQ6ICdnb29kJyxcbiAgICAgICAgZXZhbExvc3M6IDQyLFxuICAgICAgICBldmFsdWF0aW9uOiAxOCxcbiAgICAgICAgY29tcGxleGl0eUxldmVsOiAnbWVkaXVtJyxcbiAgICAgICAgY29tcGxleGl0eVNjb3JlOiAwLjUsXG4gICAgICAgIHRpbWVzdGFtcDogMjAwMCxcbiAgICAgICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IDcwMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZm9yZUZlbjogJ2InLFxuICAgICAgICBhZnRlckZlbjogJ2MnLFxuICAgICAgICB1Y2k6ICdlN2U1JyxcbiAgICAgICAgbW92ZU51bWJlcjogMSxcbiAgICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUsXG4gICAgICAgIGFjdG9yOiAnZW5naW5lJyxcbiAgICAgICAgc2FuOiAnZTUrJyxcbiAgICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICBldmFsdWF0aW9uOiAzMixcbiAgICAgICAgY29tcGxleGl0eUxldmVsOiAnaGlnaCcsXG4gICAgICAgIGNvbXBsZXhpdHlTY29yZTogMC44LFxuICAgICAgICB0aW1lc3RhbXA6IDI4MDAsXG4gICAgICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiA4MDAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBiZWZvcmVGZW46ICdjJyxcbiAgICAgICAgYWZ0ZXJGZW46ICdkJyxcbiAgICAgICAgdWNpOiAnZzFmMycsXG4gICAgICAgIG1vdmVOdW1iZXI6IDIsXG4gICAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgYWN0b3I6ICdwbGF5ZXInLFxuICAgICAgICBzYW46ICdOZjMnLFxuICAgICAgICBidWNrZXQ6ICdtaXN0YWtlJyxcbiAgICAgICAgZXZhbExvc3M6IDMxMCxcbiAgICAgICAgZXZhbHVhdGlvbjogLTkwLFxuICAgICAgICBjb21wbGV4aXR5TGV2ZWw6ICdsb3cnLFxuICAgICAgICBjb21wbGV4aXR5U2NvcmU6IDAuMixcbiAgICAgICAgdGltZXN0YW1wOiA0MzAwLFxuICAgICAgICBkZWxheU1zU2luY2VQcmV2aW91czogMTUwMCxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSk7XG5cbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucmVzdWx0LCAnV2hpdGUgd29uJyk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmJyaWxsaWFudE1vdmVzLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkubW92ZUNvdW50LCAzKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucXVhbGl0eUNvdW50cy5iZXN0LCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucXVhbGl0eUNvdW50cy5nb29kLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucXVhbGl0eUNvdW50cy5taXN0YWtlLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuYXZlcmFnZUV2YWxMb3NzLCAxMTcuMyk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmF2ZXJhZ2VNb3ZlRGVsYXlNcywgMTAwMCk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmNvbXBsZXhpdHlEaXN0cmlidXRpb24ubG93LCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuY29tcGxleGl0eURpc3RyaWJ1dGlvbi5tZWRpdW0sIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5jb21wbGV4aXR5RGlzdHJpYnV0aW9uLmhpZ2gsIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5oaWdobGlnaHRlZEJyaWxsaWFudE1vdmVzLmxlbmd0aCwgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5Lm1ham9yTWlzdGFrZXMubGVuZ3RoLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuZXZhbFRyZW5kLmxlbmd0aCwgMyk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmNvbXBsZXhpdHlUcmVuZC5sZW5ndGgsIDMpO1xufSk7XG5cbnRlc3QoJ2dhbWUgYW5hbHl0aWNzIHZpZXdtb2RlbCBzdG9yZXMgY29tcGxldGVkIHNlc3Npb25zIGluIHJlY2VudCBnYW1lcycsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGNvbnN0IGFuYWx5dGljcyA9IG5ldyBHYW1lQW5hbHl0aWNzVmlld01vZGVsKHtcbiAgICBib2FyZFZpZXdNb2RlbDoge1xuICAgICAgZGVidWdTZXNzaW9uSWQ6ICdzZXNzaW9uX2NhcHR1cmUnLFxuICAgICAgbW92ZUFubm90YXRpb25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBiZWZvcmVGZW46ICdhJyxcbiAgICAgICAgICBhZnRlckZlbjogJ2InLFxuICAgICAgICAgIHVjaTogJ2UyZTQnLFxuICAgICAgICAgIG1vdmVOdW1iZXI6IDEsXG4gICAgICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IGZhbHNlLFxuICAgICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgICBzYW46ICdlNCcsXG4gICAgICAgICAgYnVja2V0OiAnZ29vZCcsXG4gICAgICAgICAgZXZhbExvc3M6IDQwLFxuICAgICAgICAgIGV2YWx1YXRpb246IDE1LFxuICAgICAgICAgIGNvbXBsZXhpdHlMZXZlbDogJ21lZGl1bScsXG4gICAgICAgICAgY29tcGxleGl0eVNjb3JlOiAwLjQ1LFxuICAgICAgICAgIHRpbWVzdGFtcDogMTAwMCxcbiAgICAgICAgICBkZWxheU1zU2luY2VQcmV2aW91czogNjAwLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHNlc3Npb25TdGFydGVkQXQ6IDAsXG4gICAgICBnYW1lU3RhdHVzOiAnRHJhdyEnLFxuICAgICAgcGduOiAnMS4gZTQgKicsXG4gICAgICBjdXJyZW50U2V0dXBOYW1lOiAnQ3VzdG9tIFBvc2l0aW9uJyxcbiAgICAgIGN1cnJlbnRTZXR1cENhdGVnb3J5OiAnY3VzdG9tJyxcbiAgICAgIGF1dG9QbGF5QWN0aXZlRHVyYXRpb25NczogOTAwLFxuICAgICAgaXNHYW1lT3ZlcjogdHJ1ZSxcbiAgICB9LFxuICAgIGNvbmZpZ1ZpZXdNb2RlbDoge1xuICAgICAgYWN0aXZlUGVyc29uYUlkOiAnbWVkaXVtJyxcbiAgICAgIGFjdGl2ZVBlcnNvbmFMYWJlbDogJ01lZGl1bScsXG4gICAgfSxcbiAgfSk7XG5cbiAgYW5hbHl0aWNzLmNhcHR1cmVDb21wbGV0ZWRHYW1lKCk7XG5cbiAgYXNzZXJ0LmVxdWFsKGFuYWx5dGljcy5yZWNlbnRHYW1lcy5sZW5ndGgsIDEpO1xuICBhc3NlcnQuZXF1YWwoYW5hbHl0aWNzLnJlY2VudEdhbWVzWzBdPy5zZXNzaW9uSWQsICdzZXNzaW9uX2NhcHR1cmUnKTtcbiAgYXNzZXJ0LmVxdWFsKGFuYWx5dGljcy5yZWNlbnRHYW1lRW50cmllc1swXT8ucGVyc29uYUxhYmVsLCAnTWVkaXVtJyk7XG59KTtcblxudGVzdCgnYXV0b3BsYXkgc2NoZWR1bGVzIGNvcnJlY3RseSBmb3IgYSBibGFjayBlbmdpbmUgYWZ0ZXIgYSB3aGl0ZSBwbGF5ZXIgbW92ZScsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwsIGVuZ2luZVZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGNvbnN0IG9yaWdpbmFsU29sdmVOZXh0TW92ZSA9IGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUuYmluZChib2FyZFZpZXdNb2RlbCk7XG4gIGxldCBzb2x2ZUNhbGxzID0gMDtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRBdXRvUGxheSh0cnVlKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0RW5naW5lUGxheXNGb3IoJ2InKTtcbiAgYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSA9IGFzeW5jICgpID0+IHtcbiAgICBzb2x2ZUNhbGxzICs9IDE7XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIGVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkID0gdHJ1ZTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwubWFrZU1vdmUoJ2UyJywgJ2U0JyksIHRydWUpO1xuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgOTAwKTtcbiAgfSk7XG5cbiAgYXNzZXJ0LmVxdWFsKHNvbHZlQ2FsbHMsIDEpO1xuXG4gIGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUgPSBvcmlnaW5hbFNvbHZlTmV4dE1vdmU7XG59KTtcblxudGVzdCgnYXV0b3BsYXkgc3RpbGwgcGxheXMgYmxhY2sgd2hlbiBwbGF5ZXItbW92ZSBiYWNrZ3JvdW5kIGFuYWx5c2lzIGlzIHBlbmRpbmcnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBlbmdpbmVWaWV3TW9kZWwsIHVpU3RhdGVWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBjb25zdCBvcmlnaW5hbEluaXRpYWxpemUgPSBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZS5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHl6ZVBvc2l0aW9uID0gZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbi5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG4gIGNvbnN0IG9yaWdpbmFsUGlja01vdmUgPSBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMuYmluZChlbmdpbmVWaWV3TW9kZWwpO1xuICBjb25zdCBvcmlnaW5hbEF1dG9QbGF5U3BlZWQgPSB1aVN0YXRlVmlld01vZGVsLmF1dG9QbGF5U3BlZWQ7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0QXV0b1BsYXkodHJ1ZSk7XG4gIGJvYXJkVmlld01vZGVsLnNldEVuZ2luZVBsYXlzRm9yKCdiJyk7XG4gIHVpU3RhdGVWaWV3TW9kZWwuc2V0QXV0b1BsYXlTcGVlZCgnZmFzdCcpO1xuXG4gIGVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUgPSBhc3luYyAoKSA9PiB1bmRlZmluZWQ7XG4gIGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoZmVuOiBzdHJpbmcsIF9kZXB0aD86IG51bWJlciwgX211bHRpUFY/OiBudW1iZXIsIHB1cnBvc2UgPSAnYmFja2dyb3VuZCcpID0+IHtcbiAgICBpZiAocHVycG9zZSA9PT0gJ2JhY2tncm91bmQnKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4gdW5kZWZpbmVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVxdWVzdElkOiAxLFxuICAgICAgYW5hbHl6ZWRGZW46IGZlbixcbiAgICAgIG1vdmVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBtb3ZlOiAnZTdlNScsXG4gICAgICAgICAgZXZhbHVhdGlvbjogMjAsXG4gICAgICAgICAgZXZhbExvc3M6IDAsXG4gICAgICAgICAgcHY6IFsnZTdlNSddLFxuICAgICAgICAgIG11bHRpcHY6IDEsXG4gICAgICAgICAgZGVwdGg6IDgsXG4gICAgICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgY29tcGxleGl0eToge1xuICAgICAgICBsZXZlbDogJ2xvdycsXG4gICAgICAgIHNjb3JlOiAwLjIsXG4gICAgICAgIHNwcmVhZDogMTIsXG4gICAgICAgIGNsb3NlQ2FuZGlkYXRlczogMSxcbiAgICAgICAgdm9sYXRpbGl0eTogOCxcbiAgICAgIH0sXG4gICAgICBpZ25vcmVkOiBmYWxzZSxcbiAgICAgIGZyb21DYWNoZTogZmFsc2UsXG4gICAgICBwdXJwb3NlOiAnZW5naW5lTW92ZScsXG4gICAgfTtcbiAgfTtcbiAgZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzID0gKCkgPT4gKHtcbiAgICBtb3ZlOiB7XG4gICAgICBtb3ZlOiAnZTdlNScsXG4gICAgICBldmFsdWF0aW9uOiAyMCxcbiAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgcHY6IFsnZTdlNSddLFxuICAgICAgbXVsdGlwdjogMSxcbiAgICAgIGRlcHRoOiA4LFxuICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgfSxcbiAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gIH0pO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5tYWtlTW92ZSgnZTInLCAnZTQnKSwgdHJ1ZSk7XG5cbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzZXRUaW1lb3V0KHJlc29sdmUsIDUwMCk7XG4gIH0pO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5oaXN0b3J5Lmxlbmd0aCwgMik7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5oaXN0b3J5WzFdPy5zYW4sICdlNScpO1xuXG4gIGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplID0gb3JpZ2luYWxJbml0aWFsaXplO1xuICBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxBbmFseXplUG9zaXRpb247XG4gIGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcyA9IG9yaWdpbmFsUGlja01vdmU7XG4gIHVpU3RhdGVWaWV3TW9kZWwuc2V0QXV0b1BsYXlTcGVlZChvcmlnaW5hbEF1dG9QbGF5U3BlZWQpO1xufSk7XG5cbnRlc3QoJ3N0YXJ0QXV0b1BsYXlUdXJuIGxldHMgdGhlIHdoaXRlIGVuZ2luZSBiZWdpbiB0aGUgZ2FtZSBtYW51YWxseScsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBjb25zdCBvcmlnaW5hbFNvbHZlTmV4dE1vdmUgPSBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlLmJpbmQoYm9hcmRWaWV3TW9kZWwpO1xuICBsZXQgYXV0b1RyaWdnZXJlZEFyZ3VtZW50OiBib29sZWFuIHwgbnVsbCA9IG51bGw7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0QXV0b1BsYXkodHJ1ZSk7XG4gIGJvYXJkVmlld01vZGVsLnNldEVuZ2luZVBsYXlzRm9yKCd3Jyk7XG4gIGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUgPSBhc3luYyAoYXV0b1RyaWdnZXJlZCA9IGZhbHNlKSA9PiB7XG4gICAgYXV0b1RyaWdnZXJlZEFyZ3VtZW50ID0gYXV0b1RyaWdnZXJlZDtcbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuY2FuU3RhcnRBdXRvUGxheVR1cm4sIHRydWUpO1xuICBhd2FpdCBib2FyZFZpZXdNb2RlbC5zdGFydEF1dG9QbGF5VHVybigpO1xuICBhc3NlcnQuZXF1YWwoYXV0b1RyaWdnZXJlZEFyZ3VtZW50LCB0cnVlKTtcblxuICBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlID0gb3JpZ2luYWxTb2x2ZU5leHRNb3ZlO1xufSk7XG5cbnRlc3QoJ3N0YXJ0QXV0b1BsYXlUdXJuIGlzIGF2YWlsYWJsZSBmb3IgYSBibGFjayBlbmdpbmUgYWZ0ZXIgdGhlIHBsYXllciBtb3ZlJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGNvbnN0IG9yaWdpbmFsU29sdmVOZXh0TW92ZSA9IGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUuYmluZChib2FyZFZpZXdNb2RlbCk7XG4gIGxldCBhdXRvVHJpZ2dlcmVkQXJndW1lbnQ6IGJvb2xlYW4gfCBudWxsID0gbnVsbDtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRBdXRvUGxheSh0cnVlKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0RW5naW5lUGxheXNGb3IoJ2InKTtcbiAgYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSA9IGFzeW5jIChhdXRvVHJpZ2dlcmVkID0gZmFsc2UpID0+IHtcbiAgICBhdXRvVHJpZ2dlcmVkQXJndW1lbnQgPSBhdXRvVHJpZ2dlcmVkO1xuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5tYWtlTW92ZSgnZTInLCAnZTQnKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5jYW5TdGFydEF1dG9QbGF5VHVybiwgdHJ1ZSk7XG5cbiAgYXdhaXQgYm9hcmRWaWV3TW9kZWwuc3RhcnRBdXRvUGxheVR1cm4oKTtcbiAgYXNzZXJ0LmVxdWFsKGF1dG9UcmlnZ2VyZWRBcmd1bWVudCwgdHJ1ZSk7XG5cbiAgYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSA9IG9yaWdpbmFsU29sdmVOZXh0TW92ZTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBUU8sU0FBUyx1QkFDZCxXQUNBLGlCQUNTO0FBQ1QsU0FBTyxjQUFjO0FBQ3ZCO0FBRU8sU0FBUyxxQkFDZCxZQUNBLGFBQ1M7QUFDVCxTQUFPLGVBQWU7QUFDeEI7QUFwQkE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBU08sU0FBUyxzQkFDZCxLQUNBLE9BQ0EsU0FDUTtBQUNSLFNBQU8sR0FBRyxHQUFHLFVBQVUsS0FBSyxZQUFZLE9BQU87QUFDakQ7QUFmQSxJQWlCYSxlQXFEQTtBQXRFYjtBQUFBO0FB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SUFBSTtBQUV4QyxFQUFBQSxnQkFBZSxnQkFBZ0I7QUFDakMsQ0FBQzsiLAogICJuYW1lcyI6IFsiQ2hlc3MiLCAiUElFQ0VfVkFMVUVTIiwgIkJVQ0tFVF9PUkRFUiIsICJDaGVzcyIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJhY3Rpb24iLCAicmVhY3Rpb24iLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgInJlYWN0aW9uIiwgInJ1bkluQWN0aW9uIiwgIkNoZXNzIiwgImxvZ2dlciIsICJwZ24iLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJyZWFjdGlvbiIsICJhY3Rpb24iLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJjYW5BcHBseUFuYWx5emVkTW92ZSIsICJpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0IiwgIkFuYWx5c2lzQ2FjaGUiLCAiYnVpbGRBbmFseXNpc0NhY2hlS2V5IiwgImJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQiLCAiY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlIiwgInJlc29sdmVQZ25TdGFydEZlbiIsICJkZXJpdmVCcmlsbGlhbnRVc2FnZSIsICJib2FyZFZpZXdNb2RlbCIsICJmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCIsICJQUkVERUZJTkVEX09QRU5JTkdTIiwgImVuZ2luZVZpZXdNb2RlbCIsICJjb25maWdWaWV3TW9kZWwiLCAiRW5naW5lVmlld01vZGVsIiwgIm1vdmVTdG9ja2Zpc2hTZXJ2aWNlIiwgImFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSIsICJCb2FyZFZpZXdNb2RlbCIsICJhbmFseXNpc0NhY2hlIiwgIlBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCIsICJERUZBVUxUX0JVQ0tFVF9DT05GSUciLCAiREVGQVVMVF9GRUFUVVJFX09QVElPTlMiLCAiR0FNRV9TRVRVUF9QUkVTRVRTIiwgImZpbHRlckdhbWVTZXR1cFByZXNldHMiLCAidG9Db21wYXRpYmxlT3BlbmluZ1ByZXNldCIsICJnZXRHYW1lU2V0dXBQcmVzZXRCeUlkIiwgImJ1aWxkR2FtZUFuYWx5dGljc1N1bW1hcnkiLCAiR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCIsICJ1aVN0YXRlVmlld01vZGVsIl0KfQo=
