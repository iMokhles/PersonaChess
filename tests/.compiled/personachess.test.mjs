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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2VuZ2luZS9hbmFseXNpc1NhZmV0eS50cyIsICIuLi8uLi9zcmMvZW5naW5lL2FuYWx5c2lzQ2FjaGUudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9yYW5kb20udHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lU2Vzc2lvbi50cyIsICIuLi8uLi9zcmMvZW5naW5lL2JyaWxsaWFudFRyYWNraW5nLnRzIiwgIi4uLy4uL3NyYy9zaGFyZWQvZGVidWcudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZS50cyIsICIuLi8uLi9zcmMvZW5naW5lL2VuZ2luZUNvb3JkaW5hdG9yLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvdHlwZXMudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9tb3ZlQ2xhc3NpZmllci50cyIsICIuLi8uLi9zcmMvZW5naW5lL21vdmVQaWNrZXIudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9mZWF0dXJlT3B0aW9ucy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvZW5naW5lL2JyaWxsaWFudE1vdmUudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lUGhhc2UudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9wb3NpdGlvbkNvbXBsZXhpdHkudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9wZXJzb25hQmlhcy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9FbmdpbmVWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvQ29uZmlnVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL1VpU3RhdGVWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvQm9hcmRWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lQW5hbHl0aWNzLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL0dhbWVBbmFseXRpY3NWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9vcGVuaW5ncy50cyIsICIuLi8uLi9zcmMvZW5naW5lL2dhbWVTZXR1cFByZXNldHMudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvR2FtZVNldHVwVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL0RlYnVnVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvcGVyc29uYVByb2ZpbGVzLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL1BlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9pbmRleC50cyIsICIuLi9wZXJzb25hY2hlc3MudGVzdC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGludGVyZmFjZSBBbmFseXNpc1NuYXBzaG90PFRNb3Zlcz4ge1xuICByZXF1ZXN0SWQ6IG51bWJlcjtcbiAgYW5hbHl6ZWRGZW46IHN0cmluZztcbiAgbW92ZXM6IFRNb3Zlcztcbn1cblxuZXhwb3J0IHR5cGUgQW5hbHlzaXNQdXJwb3NlID0gJ2VuZ2luZU1vdmUnIHwgJ2JhY2tncm91bmQnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNTdGFsZUFuYWx5c2lzUmVxdWVzdChcbiAgcmVxdWVzdElkOiBudW1iZXIsXG4gIGxhdGVzdFJlcXVlc3RJZDogbnVtYmVyLFxuKTogYm9vbGVhbiB7XG4gIHJldHVybiByZXF1ZXN0SWQgIT09IGxhdGVzdFJlcXVlc3RJZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbkFwcGx5QW5hbHl6ZWRNb3ZlKFxuICBjdXJyZW50RmVuOiBzdHJpbmcsXG4gIGFuYWx5emVkRmVuOiBzdHJpbmcsXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGN1cnJlbnRGZW4gPT09IGFuYWx5emVkRmVuO1xufVxuIiwgImltcG9ydCB7IEFuYWx5emVkTW92ZSwgQ2xhc3NpZmllZE1vdmUgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBBbmFseXNpc0NhY2hlRW50cnkge1xuICBrZXk6IHN0cmluZztcbiAgbW92ZXM6IEFuYWx5emVkTW92ZVtdO1xuICBjbGFzc2lmaWVkTW92ZXM/OiBDbGFzc2lmaWVkTW92ZVtdO1xuICB0aW1lc3RhbXA6IG51bWJlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQW5hbHlzaXNDYWNoZUtleShcbiAgZmVuOiBzdHJpbmcsXG4gIGRlcHRoOiBudW1iZXIsXG4gIG11bHRpUFY6IG51bWJlcixcbik6IHN0cmluZyB7XG4gIHJldHVybiBgJHtmZW59fGRlcHRoOiR7ZGVwdGh9fG11bHRpcHY6JHttdWx0aVBWfWA7XG59XG5cbmV4cG9ydCBjbGFzcyBBbmFseXNpc0NhY2hlIHtcbiAgcHJpdmF0ZSBlbnRyaWVzID0gbmV3IE1hcDxzdHJpbmcsIEFuYWx5c2lzQ2FjaGVFbnRyeT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1heFNpemU6IG51bWJlciA9IDIwMCkge31cblxuICBjb25maWd1cmUobWF4U2l6ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5tYXhTaXplID0gTWF0aC5tYXgoMSwgbWF4U2l6ZSk7XG4gICAgdGhpcy50cmltKCk7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBBbmFseXNpc0NhY2hlRW50cnkgfCBudWxsIHtcbiAgICBjb25zdCBlbnRyeSA9IHRoaXMuZW50cmllcy5nZXQoa2V5KTtcblxuICAgIGlmICghZW50cnkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuZW50cmllcy5kZWxldGUoa2V5KTtcbiAgICB0aGlzLmVudHJpZXMuc2V0KGtleSwgZW50cnkpO1xuICAgIHJldHVybiBlbnRyeTtcbiAgfVxuXG4gIHNldChlbnRyeTogQW5hbHlzaXNDYWNoZUVudHJ5KTogdm9pZCB7XG4gICAgdGhpcy5lbnRyaWVzLnNldChlbnRyeS5rZXksIGVudHJ5KTtcbiAgICB0aGlzLnRyaW0oKTtcbiAgfVxuXG4gIGludmFsaWRhdGUoa2V5Pzogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKGtleSkge1xuICAgICAgdGhpcy5lbnRyaWVzLmRlbGV0ZShrZXkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZW50cmllcy5jbGVhcigpO1xuICB9XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzLnNpemU7XG4gIH1cblxuICBwcml2YXRlIHRyaW0oKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMuZW50cmllcy5zaXplID4gdGhpcy5tYXhTaXplKSB7XG4gICAgICBjb25zdCBvbGRlc3RLZXkgPSB0aGlzLmVudHJpZXMua2V5cygpLm5leHQoKS52YWx1ZTtcblxuICAgICAgaWYgKCFvbGRlc3RLZXkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW50cmllcy5kZWxldGUob2xkZXN0S2V5KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGFuYWx5c2lzQ2FjaGUgPSBuZXcgQW5hbHlzaXNDYWNoZSgpO1xuIiwgImltcG9ydCB7IFBlcnNvbmFJZCB9IGZyb20gJy4vZmVhdHVyZU9wdGlvbnMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJhbmRvbVNvdXJjZSB7XG4gIG5leHQoKTogbnVtYmVyO1xufVxuXG5mdW5jdGlvbiBoYXNoU3RyaW5nKGlucHV0OiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgaGFzaCA9IDIxNjYxMzYyNjE7XG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGlucHV0Lmxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGhhc2ggXj0gaW5wdXQuY2hhckNvZGVBdChpbmRleCk7XG4gICAgaGFzaCA9IE1hdGguaW11bChoYXNoLCAxNjc3NzYxOSk7XG4gIH1cblxuICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cblxuZnVuY3Rpb24gbXVsYmVycnkzMihzZWVkOiBudW1iZXIpOiAoKSA9PiBudW1iZXIge1xuICBsZXQgdmFsdWUgPSBzZWVkID4+PiAwO1xuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgdmFsdWUgKz0gMHg2ZDJiNzlmNTtcbiAgICBsZXQgcmVzdWx0ID0gTWF0aC5pbXVsKHZhbHVlIF4gKHZhbHVlID4+PiAxNSksIHZhbHVlIHwgMSk7XG4gICAgcmVzdWx0IF49IHJlc3VsdCArIE1hdGguaW11bChyZXN1bHQgXiAocmVzdWx0ID4+PiA3KSwgcmVzdWx0IHwgNjEpO1xuICAgIHJldHVybiAoKHJlc3VsdCBeIChyZXN1bHQgPj4+IDE0KSkgPj4+IDApIC8gNDI5NDk2NzI5NjtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxlZ2FjeVJhbmRvbVNvdXJjZSgpOiBSYW5kb21Tb3VyY2Uge1xuICByZXR1cm4ge1xuICAgIG5leHQ6ICgpID0+IE1hdGgucmFuZG9tKCksXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2Uoc2VlZDogc3RyaW5nKTogUmFuZG9tU291cmNlIHtcbiAgY29uc3QgZ2VuZXJhdG9yID0gbXVsYmVycnkzMihoYXNoU3RyaW5nKHNlZWQpKTtcblxuICByZXR1cm4ge1xuICAgIG5leHQ6ICgpID0+IGdlbmVyYXRvcigpLFxuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERldGVybWluaXN0aWNTZWVkQ29udGV4dCB7XG4gIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICBjdXJyZW50RmVuOiBzdHJpbmc7XG4gIG1vdmVDb3VudDogbnVtYmVyO1xuICBzaWRlVG9Nb3ZlOiAndycgfCAnYic7XG4gIHBlcnNvbmE6IFBlcnNvbmFJZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQoe1xuICBnYW1lU3RhcnRGZW4sXG4gIGN1cnJlbnRGZW4sXG4gIG1vdmVDb3VudCxcbiAgc2lkZVRvTW92ZSxcbiAgcGVyc29uYSxcbn06IERldGVybWluaXN0aWNTZWVkQ29udGV4dCk6IHN0cmluZyB7XG4gIHJldHVybiBbZ2FtZVN0YXJ0RmVuLCBjdXJyZW50RmVuLCBTdHJpbmcobW92ZUNvdW50KSwgc2lkZVRvTW92ZSwgcGVyc29uYV0uam9pbignfCcpO1xufVxuIiwgImltcG9ydCB7IE1vdmVBbm5vdGF0aW9uIH0gZnJvbSAnLi9icmlsbGlhbnRUcmFja2luZyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc2lzdGVkQm9hcmRTdGF0ZSB7XG4gIGN1cnJlbnRGZW46IHN0cmluZztcbiAgZmVuSGlzdG9yeTogc3RyaW5nW107XG4gIGdhbWVTZXNzaW9uSWQ6IHN0cmluZztcbiAgZ2FtZVN0YXJ0RmVuOiBzdHJpbmc7XG4gIGN1cnJlbnRTZXR1cE5hbWU/OiBzdHJpbmc7XG4gIGN1cnJlbnRTZXR1cENhdGVnb3J5Pzogc3RyaW5nO1xuICBoaXN0b3J5QW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW107XG4gIHJlZG9Bbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdhbWVTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBzZXNzaW9uXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgMTApfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUGduU3RhcnRGZW4oXG4gIGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bGw+LFxuICBmYWxsYmFja0Zlbjogc3RyaW5nLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGhlYWRlcnMuU2V0VXAgPT09ICcxJyAmJiB0eXBlb2YgaGVhZGVycy5GRU4gPT09ICdzdHJpbmcnXG4gICAgPyBoZWFkZXJzLkZFTlxuICAgIDogZmFsbGJhY2tGZW47XG59XG4iLCAiZXhwb3J0IGludGVyZmFjZSBNb3ZlQW5ub3RhdGlvbiB7XG4gIGJlZm9yZUZlbjogc3RyaW5nO1xuICBhZnRlckZlbjogc3RyaW5nO1xuICB1Y2k6IHN0cmluZztcbiAgbW92ZU51bWJlcjogbnVtYmVyO1xuICBjb25zdW1lZEJyaWxsaWFudDogYm9vbGVhbjtcbiAgYWN0b3I/OiAncGxheWVyJyB8ICdlbmdpbmUnIHwgJ3JlZG8nO1xuICBzYW4/OiBzdHJpbmc7XG4gIGJ1Y2tldD86IHN0cmluZyB8IG51bGw7XG4gIGV2YWxMb3NzPzogbnVtYmVyIHwgbnVsbDtcbiAgZXZhbHVhdGlvbj86IG51bWJlciB8IG51bGw7XG4gIGNvbXBsZXhpdHlMZXZlbD86ICdsb3cnIHwgJ21lZGl1bScgfCAnaGlnaCcgfCBudWxsO1xuICBjb21wbGV4aXR5U2NvcmU/OiBudW1iZXIgfCBudWxsO1xuICB0aW1lc3RhbXA/OiBudW1iZXI7XG4gIGRlbGF5TXNTaW5jZVByZXZpb3VzPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWxsaWFudFVzYWdlIHtcbiAgYnJpbGxpYW50VXNlZENvdW50OiBudW1iZXI7XG4gIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBudW1iZXJbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlcml2ZUJyaWxsaWFudFVzYWdlKFxuICBhbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSxcbik6IEJyaWxsaWFudFVzYWdlIHtcbiAgY29uc3QgYnJpbGxpYW50TW92ZU51bWJlcnMgPSBhbm5vdGF0aW9uc1xuICAgIC5maWx0ZXIoKGFubm90YXRpb24pID0+IGFubm90YXRpb24uY29uc3VtZWRCcmlsbGlhbnQpXG4gICAgLm1hcCgoYW5ub3RhdGlvbikgPT4gYW5ub3RhdGlvbi5tb3ZlTnVtYmVyKTtcblxuICByZXR1cm4ge1xuICAgIGJyaWxsaWFudFVzZWRDb3VudDogYnJpbGxpYW50TW92ZU51bWJlcnMubGVuZ3RoLFxuICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzLFxuICB9O1xufVxuIiwgImNvbnN0IERFQlVHX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19kZWJ1Z19sb2dnaW5nJztcblxuZnVuY3Rpb24gcmVhZEJyb3dzZXJEZWJ1Z0ZsYWcoKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2luZG93LmxvY2FsU3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oREVCVUdfU1RPUkFHRV9LRVkpID09PSAnMSc7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkUHJvY2Vzc0RlYnVnRmxhZygpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBwcm9jZXNzLmVudi5QRVJTT05BQ0hFU1NfREVCVUcgPT09ICcxJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGVidWdMb2dnaW5nRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHJlYWRCcm93c2VyRGVidWdGbGFnKCkgfHwgcmVhZFByb2Nlc3NEZWJ1Z0ZsYWcoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdpbmRvdy5sb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKERFQlVHX1NUT1JBR0VfS0VZLCAnMScpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oREVCVUdfU1RPUkFHRV9LRVkpO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLy8gSWdub3JlIGxvY2FsU3RvcmFnZSBmYWlsdXJlcyBhbmQga2VlcCB0aGUgYXBwIHJ1bm5pbmcuXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlYnVnTG9nZ2VyKHNjb3BlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHtcbiAgICBkZWJ1ZzogKC4uLmFyZ3M6IHVua25vd25bXSkgPT4ge1xuICAgICAgaWYgKGlzRGVidWdMb2dnaW5nRW5hYmxlZCgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbJHtzY29wZX1dYCwgLi4uYXJncyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlcnJvcjogKC4uLmFyZ3M6IHVua25vd25bXSkgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcihgWyR7c2NvcGV9XWAsIC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgd2FybjogKC4uLmFyZ3M6IHVua25vd25bXSkgPT4ge1xuICAgICAgY29uc29sZS53YXJuKGBbJHtzY29wZX1dYCwgLi4uYXJncyk7XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGV2ZWxvcG1lbnRCdWlsZCgpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBNQUlOX1dJTkRPV19WSVRFX0RFVl9TRVJWRVJfVVJMICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBCb29sZWFuKE1BSU5fV0lORE9XX1ZJVEVfREVWX1NFUlZFUl9VUkwpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gQm9vbGVhbihpbXBvcnQubWV0YS5lbnY/LkRFVik7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4iLCAiLyoqXG4gKiBTdG9ja2Zpc2ggVUNJIEVuZ2luZSBTZXJ2aWNlXG4gKiBNb2RlbCBsYXllciAtIFB1cmUgVHlwZVNjcmlwdCwgbm8gUmVhY3QsIG5vIE1vYlhcbiAqIFxuICogSGFuZGxlcyBjb21tdW5pY2F0aW9uIHdpdGggU3RvY2tmaXNoIFdBU00gZW5naW5lIHZpYSBXZWIgV29ya2VyXG4gKi9cblxuaW1wb3J0IHsgQW5hbHl6ZWRNb3ZlLCBTdG9ja2Zpc2hJbmZvIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBjcmVhdGVEZWJ1Z0xvZ2dlciB9IGZyb20gJy4uL3NoYXJlZC9kZWJ1Zyc7XG5cbnR5cGUgTWVzc2FnZUhhbmRsZXIgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkO1xuXG5leHBvcnQgY2xhc3MgU3RvY2tmaXNoU2VydmljZSB7XG4gIHByaXZhdGUgd29ya2VyOiBXb3JrZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBtZXNzYWdlSGFuZGxlcnM6IFNldDxNZXNzYWdlSGFuZGxlcj4gPSBuZXcgU2V0KCk7XG4gIHByaXZhdGUgaXNSZWFkeSA9IGZhbHNlO1xuICBwcml2YXRlIHJlYWR5UmVzb2x2ZXJzOiBBcnJheTwoKSA9PiB2b2lkPiA9IFtdO1xuICBwcml2YXRlIG11bHRpUFYgPSAxMjtcbiAgcHJpdmF0ZSBkZXB0aCA9IDIwO1xuICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHNlcnZpY2VOYW1lID0gJ1N0b2NrZmlzaFNlcnZpY2UnKSB7XG4gICAgdGhpcy5sb2dnZXIgPSBjcmVhdGVEZWJ1Z0xvZ2dlcihzZXJ2aWNlTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBTdG9ja2Zpc2ggV0FTTSBlbmdpbmVcbiAgICovXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMud29ya2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIENyZWF0ZSB3b3JrZXIgdXNpbmcgc3RvY2tmaXNoLmpzXG4gICAgICAgIC8vIEluIFZpdGUsIHdlIG5lZWQgdG8gdXNlID93b3JrZXIgc3VmZml4IG9yIGNyZWF0ZSBpbmxpbmUgd29ya2VyXG4gICAgICAgIGNvbnN0IHdvcmtlckNvZGUgPSBgXG4gICAgICAgICAgaW1wb3J0U2NyaXB0cygnJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufS9zdG9ja2Zpc2guanMnKTtcbiAgICAgICAgYDtcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt3b3JrZXJDb2RlXSwgeyB0eXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcgfSk7XG4gICAgICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcihVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcblxuICAgICAgICB0aGlzLndvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0eXBlb2YgZXZlbnQuZGF0YSA9PT0gJ3N0cmluZycgPyBldmVudC5kYXRhIDogU3RyaW5nKGV2ZW50LmRhdGEpO1xuICAgICAgICAgIHRoaXMuaGFuZGxlTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLndvcmtlci5vbmVycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ1dvcmtlciBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXYWl0IGZvciBVQ0kgaW5pdGlhbGl6YXRpb25cbiAgICAgICAgY29uc3QgcmVhZHlIYW5kbGVyID0gKG1zZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKG1zZyA9PT0gJ3VjaW9rJykge1xuICAgICAgICAgICAgdGhpcy5pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcbiAgICAgICAgICAgIHRoaXMucmVhZHlSZXNvbHZlcnMuZm9yRWFjaChyID0+IHIoKSk7XG4gICAgICAgICAgICB0aGlzLnJlYWR5UmVzb2x2ZXJzID0gW107XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWRkTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSB3b3JrZXIgaXMgcmVhZHlcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZCgndWNpJyk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIGVuZ2luZSBpbnN0YW5jZVxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53b3JrZXIpIHtcbiAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgdGhpcy53b3JrZXIgPSBudWxsO1xuICAgICAgdGhpcy5pc1JlYWR5ID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBVQ0kgY29tbWFuZCB0byBlbmdpbmVcbiAgICovXG4gIHByaXZhdGUgc2VuZENvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLndvcmtlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdG9ja2Zpc2ggbm90IGluaXRpYWxpemVkJyk7XG4gICAgfVxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKGNvbW1hbmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBpbmNvbWluZyBtZXNzYWdlIGZyb20gZW5naW5lXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKG1lc3NhZ2UgJiYgKG1lc3NhZ2Uuc3RhcnRzV2l0aCgnYmVzdG1vdmUnKSB8fCBtZXNzYWdlID09PSAncmVhZHlvaycgfHwgbWVzc2FnZSA9PT0gJ3VjaW9rJykpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdNZXNzYWdlOicsIG1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlcihtZXNzYWdlKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbWVzc2FnZSBoYW5kbGVyXG4gICAqL1xuICBhZGRNZXNzYWdlSGFuZGxlcihoYW5kbGVyOiBNZXNzYWdlSGFuZGxlcik6IHZvaWQge1xuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzLmFkZChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBtZXNzYWdlIGhhbmRsZXJcbiAgICovXG4gIHJlbW92ZU1lc3NhZ2VIYW5kbGVyKGhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyKTogdm9pZCB7XG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlcnMuZGVsZXRlKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIGVuZ2luZSB0byBiZSByZWFkeVxuICAgKi9cbiAgYXN5bmMgd2FpdEZvclJlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHJldHVybjtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnJlYWR5UmVzb2x2ZXJzLnB1c2gocmVzb2x2ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IE11bHRpUFYgb3B0aW9uXG4gICAqL1xuICBzZXRNdWx0aVBWKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLm11bHRpUFYgPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICB0aGlzLnNlbmRDb21tYW5kKGBzZXRvcHRpb24gbmFtZSBNdWx0aVBWIHZhbHVlICR7dmFsdWV9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBzZWFyY2ggZGVwdGhcbiAgICovXG4gIHNldERlcHRoKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmRlcHRoID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlIGVuZ2luZSBvcHRpb25zXG4gICAqL1xuICBjb25maWd1cmUob3B0aW9uczogeyBtdWx0aVBWPzogbnVtYmVyOyBkZXB0aD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgaWYgKG9wdGlvbnMubXVsdGlQViAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNldE11bHRpUFYob3B0aW9ucy5tdWx0aVBWKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGVwdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXREZXB0aChvcHRpb25zLmRlcHRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSBhIHBvc2l0aW9uIGFuZCByZXR1cm4gYWxsIGNhbmRpZGF0ZSBtb3Zlc1xuICAgKi9cbiAgYXN5bmMgYW5hbHl6ZVBvc2l0aW9uKGZlbjogc3RyaW5nKTogUHJvbWlzZTxBbmFseXplZE1vdmVbXT4ge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvclJlYWR5KCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IG1vdmVzOiBNYXA8bnVtYmVyLCBTdG9ja2Zpc2hJbmZvPiA9IG5ldyBNYXAoKTtcbiAgICAgIGxldCBiZXN0U2NvcmUgPSAwO1xuICAgICAgbGV0IGhhc1JlY2VpdmVkQmVzdE1vdmUgPSBmYWxzZTtcbiAgICAgIGxldCBtYXhEZXB0aFJlYWNoZWQgPSAwO1xuXG4gICAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29tcGxldGUgYW5hbHlzaXMgd2l0aCBjb2xsZWN0ZWQgbW92ZXNcbiAgICAgIGNvbnN0IGNvbXBsZXRlQW5hbHlzaXMgPSAoKSA9PiB7XG4gICAgICAgIGlmIChoYXNSZWNlaXZlZEJlc3RNb3ZlKSByZXR1cm47XG4gICAgICAgIGhhc1JlY2VpdmVkQmVzdE1vdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG5cbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0NvbXBsZXRpbmcgYW5hbHlzaXMsIGNvbGxlY3RlZCcsIG1vdmVzLnNpemUsICdtb3ZlcycpO1xuXG4gICAgICAgIC8vIENvbnZlcnQgdG8gQW5hbHl6ZWRNb3ZlIGFycmF5XG4gICAgICAgIGNvbnN0IGFuYWx5emVkTW92ZXM6IEFuYWx5emVkTW92ZVtdID0gW107XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0aGlzLm11bHRpUFY7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGluZm8gPSBtb3Zlcy5nZXQoaSk7XG4gICAgICAgICAgaWYgKGluZm8gJiYgaW5mby5wdi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBldmFsTG9zcyA9IE1hdGguYWJzKGJlc3RTY29yZSAtIGluZm8uc2NvcmUpO1xuICAgICAgICAgICAgYW5hbHl6ZWRNb3Zlcy5wdXNoKHtcbiAgICAgICAgICAgICAgbW92ZTogaW5mby5wdlswXSxcbiAgICAgICAgICAgICAgZXZhbHVhdGlvbjogaW5mby5zY29yZSxcbiAgICAgICAgICAgICAgZXZhbExvc3MsXG4gICAgICAgICAgICAgIHB2OiBpbmZvLnB2LFxuICAgICAgICAgICAgICBtdWx0aXB2OiBpbmZvLm11bHRpcHYsXG4gICAgICAgICAgICAgIGRlcHRoOiBpbmZvLmRlcHRoLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFuYWx5emVkTW92ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdSZXR1cm5pbmcnLCBhbmFseXplZE1vdmVzLmxlbmd0aCwgJ2FuYWx5emVkIG1vdmVzJyk7XG4gICAgICAgICAgcmVzb2x2ZShhbmFseXplZE1vdmVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgZ2FtZSBvdmVyIHBvc2l0aW9uIChjaGVja21hdGUvc3RhbGVtYXRlKVxuICAgICAgICAgIC8vIElmIHdlIHJlY2VpdmVkIG1hdGUgc2NvcmVzIGJ1dCBubyBtb3ZlcywgaXQncyBnYW1lIG92ZXJcbiAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnTm8gbW92ZXMgY29sbGVjdGVkIC0gbGlrZWx5IGdhbWUgb3ZlciBwb3NpdGlvbicpO1xuICAgICAgICAgIHJlc29sdmUoW10pOyAvLyBSZXR1cm4gZW1wdHkgYXJyYXkgaW5zdGVhZCBvZiByZWplY3RpbmcgZm9yIGdhbWUgb3ZlciBwb3NpdGlvbnNcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gQWRkIHRpbWVvdXQgdG8gZm9yY2Ugc3RvcCBhZnRlciByZWFzb25hYmxlIHRpbWVcbiAgICAgIGNvbnN0IGZvcmNlU3RvcFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKCFoYXNSZWNlaXZlZEJlc3RNb3ZlKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIud2FybignRm9yY2luZyBzdG9wIGFmdGVyIDEwIHNlY29uZHMgdG8gZ2V0IGJlc3Rtb3ZlJyk7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZCgnc3RvcCcpO1xuICAgICAgICAgIC8vIEdpdmUgaXQgYSBtb21lbnQgdG8gcmVzcG9uZCB3aXRoIGJlc3Rtb3ZlXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWhhc1JlY2VpdmVkQmVzdE1vdmUpIHtcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXIud2FybignTm8gYmVzdG1vdmUgYWZ0ZXIgc3RvcCwgdXNpbmcgY29sbGVjdGVkIG1vdmVzJyk7XG4gICAgICAgICAgICAgIGNvbXBsZXRlQW5hbHlzaXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTAwMDApOyAvLyAxMCBzZWNvbmQgdGltZW91dCB0byBmb3JjZSBzdG9wXG5cbiAgICAgIC8vIEFkZCBhYnNvbHV0ZSB0aW1lb3V0IHRvIHByZXZlbnQgaGFuZ2luZ1xuICAgICAgY29uc3QgYWJzb2x1dGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghaGFzUmVjZWl2ZWRCZXN0TW92ZSkge1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdBbmFseXNpcyB0aW1lb3V0IGFmdGVyIDMwIHNlY29uZHMnKTtcbiAgICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGZvcmNlU3RvcFRpbWVvdXQpO1xuICAgICAgICAgIGNvbXBsZXRlQW5hbHlzaXMoKTsgLy8gVHJ5IHRvIHVzZSB3aGF0IHdlIGhhdmVcbiAgICAgICAgfVxuICAgICAgfSwgMzAwMDApOyAvLyAzMCBzZWNvbmQgYWJzb2x1dGUgdGltZW91dFxuXG4gICAgICBjb25zdCBhbmFseXNpc0hhbmRsZXIgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIENoZWNrIGZvciBtYXRlIHNjb3JlcyAoZ2FtZSBvdmVyIHBvc2l0aW9ucylcbiAgICAgICAgaWYgKG1lc3NhZ2UuaW5jbHVkZXMoJ3Njb3JlIG1hdGUnKSkge1xuICAgICAgICAgIC8vIEV4dHJhY3QgbWF0ZSBzY29yZSB0byBkZXRlY3QgY2hlY2ttYXRlL3N0YWxlbWF0ZVxuICAgICAgICAgIGNvbnN0IG1hdGVNYXRjaCA9IG1lc3NhZ2UubWF0Y2goL3Njb3JlIG1hdGUgKC0/XFxkKykvKTtcbiAgICAgICAgICBpZiAobWF0ZU1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRlSW4gPSBwYXJzZUludChtYXRlTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdEZXRlY3RlZCBtYXRlIHNjb3JlOicsIG1hdGVJbik7XG4gICAgICAgICAgICAvLyBJZiBtYXRlIGlzIDAgb3IgbmVnYXRpdmUsIGl0J3MgY2hlY2ttYXRlL3N0YWxlbWF0ZSAobm8gbW92ZXMgYXZhaWxhYmxlKVxuICAgICAgICAgICAgaWYgKG1hdGVJbiA8PSAwKSB7XG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdHYW1lIG92ZXIgcG9zaXRpb24gZGV0ZWN0ZWQgKGNoZWNrbWF0ZS9zdGFsZW1hdGUpJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBQYXJzZSBpbmZvIGxpbmVzXG4gICAgICAgIGlmIChtZXNzYWdlLnN0YXJ0c1dpdGgoJ2luZm8nKSAmJiBtZXNzYWdlLmluY2x1ZGVzKCdtdWx0aXB2JykpIHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gdGhpcy5wYXJzZUluZm9MaW5lKG1lc3NhZ2UpO1xuICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICBtb3Zlcy5zZXQoaW5mby5tdWx0aXB2LCBpbmZvKTtcbiAgICAgICAgICAgIGlmIChpbmZvLm11bHRpcHYgPT09IDEpIHtcbiAgICAgICAgICAgICAgYmVzdFNjb3JlID0gaW5mby5zY29yZTtcbiAgICAgICAgICAgICAgbWF4RGVwdGhSZWFjaGVkID0gTWF0aC5tYXgobWF4RGVwdGhSZWFjaGVkLCBpbmZvLmRlcHRoKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIElmIHdlJ3ZlIHJlYWNoZWQgdGhlIHRhcmdldCBkZXB0aCBhbmQgaGF2ZSBlbm91Z2ggbW92ZXMsIHdlIGNhbiBzdG9wIGVhcmx5XG4gICAgICAgICAgICAgIGlmIChpbmZvLmRlcHRoID49IHRoaXMuZGVwdGggJiYgbW92ZXMuc2l6ZSA+PSBNYXRoLm1pbigzLCB0aGlzLm11bHRpUFYpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1JlYWNoZWQgdGFyZ2V0IGRlcHRoLCBzdG9wcGluZyBlYXJseScpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZENvbW1hbmQoJ3N0b3AnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuYWx5c2lzIGNvbXBsZXRlXG4gICAgICAgIGlmIChtZXNzYWdlLnN0YXJ0c1dpdGgoJ2Jlc3Rtb3ZlJykpIHtcbiAgICAgICAgICBoYXNSZWNlaXZlZEJlc3RNb3ZlID0gdHJ1ZTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZm9yY2VTdG9wVGltZW91dCk7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGFic29sdXRlVGltZW91dCk7XG4gICAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihhbmFseXNpc0hhbmRsZXIpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgYmVzdG1vdmUgaXMgXCJub25lXCIgKG5vIGxlZ2FsIG1vdmVzIC0gY2hlY2ttYXRlL3N0YWxlbWF0ZSlcbiAgICAgICAgICBjb25zdCBiZXN0bW92ZU1hdGNoID0gbWVzc2FnZS5tYXRjaCgvYmVzdG1vdmVcXHMrKFxcUyspLyk7XG4gICAgICAgICAgaWYgKGJlc3Rtb3ZlTWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnN0IGJlc3Rtb3ZlID0gYmVzdG1vdmVNYXRjaFsxXTtcbiAgICAgICAgICAgIGlmIChiZXN0bW92ZSA9PT0gJyhub25lKScgfHwgYmVzdG1vdmUgPT09ICdub25lJyB8fCBiZXN0bW92ZSA9PT0gJzAwMDAnKSB7XG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdObyBsZWdhbCBtb3ZlcyAoY2hlY2ttYXRlL3N0YWxlbWF0ZSknKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShbXSk7IC8vIFJldHVybiBlbXB0eSBhcnJheSBmb3IgZ2FtZSBvdmVyIHBvc2l0aW9uc1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1JlY2VpdmVkIGJlc3Rtb3ZlLCBjb2xsZWN0ZWQnLCBtb3Zlcy5zaXplLCAnbW92ZXMnKTtcblxuICAgICAgICAgIC8vIENvbnZlcnQgdG8gQW5hbHl6ZWRNb3ZlIGFycmF5XG4gICAgICAgICAgY29uc3QgYW5hbHl6ZWRNb3ZlczogQW5hbHl6ZWRNb3ZlW10gPSBbXTtcbiAgICAgICAgICBcbiAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0aGlzLm11bHRpUFY7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IG1vdmVzLmdldChpKTtcbiAgICAgICAgICAgIGlmIChpbmZvICYmIGluZm8ucHYubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBjb25zdCBldmFsTG9zcyA9IE1hdGguYWJzKGJlc3RTY29yZSAtIGluZm8uc2NvcmUpO1xuICAgICAgICAgICAgICBhbmFseXplZE1vdmVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG1vdmU6IGluZm8ucHZbMF0sXG4gICAgICAgICAgICAgICAgZXZhbHVhdGlvbjogaW5mby5zY29yZSxcbiAgICAgICAgICAgICAgICBldmFsTG9zcyxcbiAgICAgICAgICAgICAgICBwdjogaW5mby5wdixcbiAgICAgICAgICAgICAgICBtdWx0aXB2OiBpbmZvLm11bHRpcHYsXG4gICAgICAgICAgICAgICAgZGVwdGg6IGluZm8uZGVwdGgsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHdlIGhhdmUgbm8gbW92ZXMgYnV0IGdvdCBhIGJlc3Rtb3ZlLCBpdCBtaWdodCBzdGlsbCBiZSBnYW1lIG92ZXJcbiAgICAgICAgICBpZiAoYW5hbHl6ZWRNb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdObyBtb3ZlcyBpbiBiZXN0bW92ZSByZXNwb25zZSAtIGdhbWUgb3ZlciBwb3NpdGlvbicpO1xuICAgICAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdSZXR1cm5pbmcnLCBhbmFseXplZE1vdmVzLmxlbmd0aCwgJ2FuYWx5emVkIG1vdmVzJyk7XG4gICAgICAgICAgICByZXNvbHZlKGFuYWx5emVkTW92ZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5hZGRNZXNzYWdlSGFuZGxlcihhbmFseXNpc0hhbmRsZXIpO1xuXG4gICAgICAvLyBXYWl0IGZvciByZWFkeW9rIGJlZm9yZSBzZW5kaW5nIHBvc2l0aW9uXG4gICAgICBjb25zdCByZWFkeUhhbmRsZXIgPSAobXNnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKG1zZyA9PT0gJ3JlYWR5b2snKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihyZWFkeUhhbmRsZXIpO1xuICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdFbmdpbmUgcmVhZHksIHNlbmRpbmcgcG9zaXRpb24gYW5kIHN0YXJ0aW5nIGFuYWx5c2lzJyk7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZChgcG9zaXRpb24gZmVuICR7ZmVufWApO1xuICAgICAgICAgIHRoaXMuc2VuZENvbW1hbmQoYGdvIGRlcHRoICR7dGhpcy5kZXB0aH1gKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRoaXMuYWRkTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcblxuICAgICAgLy8gU2VuZCBwb3NpdGlvbiBhbmQgc3RhcnQgYW5hbHlzaXNcbiAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdTdGFydGluZyBhbmFseXNpcyBmb3IgRkVOOicsIGZlbiwgJ011bHRpUFY9JywgdGhpcy5tdWx0aVBWLCAnRGVwdGg9JywgdGhpcy5kZXB0aCk7XG4gICAgICBcbiAgICAgIHRoaXMuc2VuZENvbW1hbmQoYHNldG9wdGlvbiBuYW1lIE11bHRpUFYgdmFsdWUgJHt0aGlzLm11bHRpUFZ9YCk7XG4gICAgICB0aGlzLnNlbmRDb21tYW5kKCdpc3JlYWR5Jyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgVUNJIGluZm8gbGluZSBpbnRvIHN0cnVjdHVyZWQgZGF0YVxuICAgKi9cbiAgcHJpdmF0ZSBwYXJzZUluZm9MaW5lKGxpbmU6IHN0cmluZyk6IFN0b2NrZmlzaEluZm8gfCBudWxsIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFydHMgPSBsaW5lLnNwbGl0KCcgJyk7XG4gICAgICBcbiAgICAgIGNvbnN0IGdldFZhbHVlQWZ0ZXIgPSAoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgICAgICAgY29uc3QgaWR4ID0gcGFydHMuaW5kZXhPZihrZXkpO1xuICAgICAgICByZXR1cm4gaWR4ID49IDAgJiYgaWR4IDwgcGFydHMubGVuZ3RoIC0gMSA/IHBhcnRzW2lkeCArIDFdIDogbnVsbDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG11bHRpcHZTdHIgPSBnZXRWYWx1ZUFmdGVyKCdtdWx0aXB2Jyk7XG4gICAgICBjb25zdCBkZXB0aFN0ciA9IGdldFZhbHVlQWZ0ZXIoJ2RlcHRoJyk7XG4gICAgICBcbiAgICAgIGlmICghbXVsdGlwdlN0ciB8fCAhZGVwdGhTdHIpIHJldHVybiBudWxsO1xuXG4gICAgICBjb25zdCBtdWx0aXB2ID0gcGFyc2VJbnQobXVsdGlwdlN0ciwgMTApO1xuICAgICAgY29uc3QgZGVwdGggPSBwYXJzZUludChkZXB0aFN0ciwgMTApO1xuXG4gICAgICAvLyBHZXQgc2NvcmUgdmFsdWVcbiAgICAgIGxldCBzY29yZSA9IDA7XG4gICAgICBsZXQgbWF0ZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgY29uc3Qgc2NvcmVJZHggPSBwYXJ0cy5pbmRleE9mKCdzY29yZScpO1xuICAgICAgXG4gICAgICBpZiAoc2NvcmVJZHggPj0gMCAmJiBwYXJ0c1tzY29yZUlkeCArIDFdID09PSAnY3AnKSB7XG4gICAgICAgIHNjb3JlID0gcGFyc2VJbnQocGFydHNbc2NvcmVJZHggKyAyXSwgMTApO1xuICAgICAgfSBlbHNlIGlmIChzY29yZUlkeCA+PSAwICYmIHBhcnRzW3Njb3JlSWR4ICsgMV0gPT09ICdtYXRlJykge1xuICAgICAgICBtYXRlID0gcGFyc2VJbnQocGFydHNbc2NvcmVJZHggKyAyXSwgMTApO1xuICAgICAgICAvLyBDb252ZXJ0IG1hdGUgdG8gYSBsYXJnZSBjZW50aXBhd24gdmFsdWVcbiAgICAgICAgc2NvcmUgPSBtYXRlID4gMCA/IDEwMDAwIC0gbWF0ZSAqIDEwMCA6IC0xMDAwMCAtIG1hdGUgKiAxMDA7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCBQViAocHJpbmNpcGFsIHZhcmlhdGlvbilcbiAgICAgIGNvbnN0IHB2SWR4ID0gcGFydHMuaW5kZXhPZigncHYnKTtcbiAgICAgIGNvbnN0IHB2ID0gcHZJZHggPj0gMCA/IHBhcnRzLnNsaWNlKHB2SWR4ICsgMSkgOiBbXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbXVsdGlwdixcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIHNjb3JlLFxuICAgICAgICBtYXRlLFxuICAgICAgICBwdixcbiAgICAgIH07XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBjdXJyZW50IGFuYWx5c2lzXG4gICAqL1xuICBzdG9wKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgdGhpcy5zZW5kQ29tbWFuZCgnc3RvcCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIG5ldyBnYW1lXG4gICAqL1xuICBuZXdHYW1lKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgdGhpcy5zZW5kQ29tbWFuZCgndWNpbmV3Z2FtZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBlbmdpbmUgaXMgaW5pdGlhbGl6ZWRcbiAgICovXG4gIGdldCBpbml0aWFsaXplZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc1JlYWR5O1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IG1vdmVTdG9ja2Zpc2hTZXJ2aWNlID0gbmV3IFN0b2NrZmlzaFNlcnZpY2UoJ01vdmVTdG9ja2Zpc2hTZXJ2aWNlJyk7XG5leHBvcnQgY29uc3QgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlID0gbmV3IFN0b2NrZmlzaFNlcnZpY2UoJ0FuYWx5c2lzU3RvY2tmaXNoU2VydmljZScpO1xuZXhwb3J0IGNvbnN0IHN0b2NrZmlzaFNlcnZpY2UgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2U7XG4iLCAiaW1wb3J0IHsgQW5hbHl6ZWRNb3ZlIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UsXG4gIG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLFxuICBTdG9ja2Zpc2hTZXJ2aWNlLFxufSBmcm9tICcuL3N0b2NrZmlzaC5zZXJ2aWNlJztcblxuZXhwb3J0IHR5cGUgRW5naW5lTGFuZSA9ICdtb3ZlJyB8ICdhbmFseXNpcyc7XG5cbmludGVyZmFjZSBFbmdpbmVDb29yZGluYXRvckRlcGVuZGVuY2llcyB7XG4gIG1vdmVTZXJ2aWNlPzogU3RvY2tmaXNoU2VydmljZTtcbiAgYW5hbHlzaXNTZXJ2aWNlPzogU3RvY2tmaXNoU2VydmljZTtcbn1cblxuZXhwb3J0IGNsYXNzIEVuZ2luZUNvb3JkaW5hdG9yIHtcbiAgcHJpdmF0ZSByZWFkb25seSBtb3ZlU2VydmljZTogU3RvY2tmaXNoU2VydmljZTtcbiAgcHJpdmF0ZSByZWFkb25seSBhbmFseXNpc1NlcnZpY2U6IFN0b2NrZmlzaFNlcnZpY2U7XG5cbiAgY29uc3RydWN0b3IoZGVwZW5kZW5jaWVzOiBFbmdpbmVDb29yZGluYXRvckRlcGVuZGVuY2llcyA9IHt9KSB7XG4gICAgdGhpcy5tb3ZlU2VydmljZSA9IGRlcGVuZGVuY2llcy5tb3ZlU2VydmljZSA/PyBtb3ZlU3RvY2tmaXNoU2VydmljZTtcbiAgICB0aGlzLmFuYWx5c2lzU2VydmljZSA9IGRlcGVuZGVuY2llcy5hbmFseXNpc1NlcnZpY2UgPz8gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlO1xuICB9XG5cbiAgYXN5bmMgaW5pdGlhbGl6ZShsYW5lPzogRW5naW5lTGFuZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChsYW5lID09PSAnbW92ZScpIHtcbiAgICAgIGF3YWl0IHRoaXMubW92ZVNlcnZpY2UuaW5pdGlhbGl6ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChsYW5lID09PSAnYW5hbHlzaXMnKSB7XG4gICAgICBhd2FpdCB0aGlzLmFuYWx5c2lzU2VydmljZS5pbml0aWFsaXplKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5tb3ZlU2VydmljZS5pbml0aWFsaXplKCksXG4gICAgICB0aGlzLmFuYWx5c2lzU2VydmljZS5pbml0aWFsaXplKCksXG4gICAgXSk7XG4gIH1cblxuICBjb25maWd1cmUobGFuZTogRW5naW5lTGFuZSwgb3B0aW9uczogeyBtdWx0aVBWPzogbnVtYmVyOyBkZXB0aD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgdGhpcy5nZXRTZXJ2aWNlKGxhbmUpLmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIGFuYWx5emVQb3NpdGlvbihsYW5lOiBFbmdpbmVMYW5lLCBmZW46IHN0cmluZyk6IFByb21pc2U8QW5hbHl6ZWRNb3ZlW10+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRTZXJ2aWNlKGxhbmUpLmFuYWx5emVQb3NpdGlvbihmZW4pO1xuICB9XG5cbiAgc3RvcChsYW5lPzogRW5naW5lTGFuZSk6IHZvaWQge1xuICAgIGlmICghbGFuZSkge1xuICAgICAgdGhpcy5tb3ZlU2VydmljZS5zdG9wKCk7XG4gICAgICB0aGlzLmFuYWx5c2lzU2VydmljZS5zdG9wKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5nZXRTZXJ2aWNlKGxhbmUpLnN0b3AoKTtcbiAgfVxuXG4gIG5ld0dhbWUoKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlU2VydmljZS5uZXdHYW1lKCk7XG4gICAgdGhpcy5hbmFseXNpc1NlcnZpY2UubmV3R2FtZSgpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZXJ2aWNlLmRlc3Ryb3koKTtcbiAgICB0aGlzLmFuYWx5c2lzU2VydmljZS5kZXN0cm95KCk7XG4gIH1cblxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgIHRoaXMuZGVzdHJveSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRTZXJ2aWNlKGxhbmU6IEVuZ2luZUxhbmUpOiBTdG9ja2Zpc2hTZXJ2aWNlIHtcbiAgICByZXR1cm4gbGFuZSA9PT0gJ21vdmUnID8gdGhpcy5tb3ZlU2VydmljZSA6IHRoaXMuYW5hbHlzaXNTZXJ2aWNlO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBlbmdpbmVDb29yZGluYXRvciA9IG5ldyBFbmdpbmVDb29yZGluYXRvcigpO1xuIiwgIi8qKlxuICogVHlwZXMgZm9yIHRoZSBjaGVzcyBlbmdpbmUgbW9kZWwgbGF5ZXJcbiAqIFB1cmUgVHlwZVNjcmlwdCAtIG5vIFJlYWN0LCBubyBNb2JYXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBbmFseXplZE1vdmUge1xuICBtb3ZlOiBzdHJpbmc7ICAgICAgICAvLyBVQ0kgZm9ybWF0IChlLmcuLCBcImUyZTRcIilcbiAgZXZhbHVhdGlvbjogbnVtYmVyOyAgLy8gQ2VudGlwYXduIGV2YWx1YXRpb25cbiAgZXZhbExvc3M6IG51bWJlcjsgICAgLy8gTG9zcyBjb21wYXJlZCB0byBiZXN0IG1vdmVcbiAgcHY6IHN0cmluZ1tdOyAgICAgICAgLy8gUHJpbmNpcGFsIHZhcmlhdGlvblxuICBtdWx0aXB2OiBudW1iZXI7ICAgICAvLyBNdWx0aVBWIHJhbmsgKDEgPSBiZXN0KVxuICBkZXB0aDogbnVtYmVyOyAgICAgICAvLyBTZWFyY2ggZGVwdGhcbn1cblxuZXhwb3J0IHR5cGUgTW92ZUJ1Y2tldCA9IFxuICB8ICdiZXN0J1xuICB8ICdncmVhdCdcbiAgfCAnZXhjZWxsZW50J1xuICB8ICdnb29kJ1xuICB8ICdpbmFjY3VyYWN5J1xuICB8ICdtaXN0YWtlJ1xuICB8ICdibHVuZGVyJztcblxuZXhwb3J0IHR5cGUgRGlzcGxheU1vdmVCdWNrZXQgPSBNb3ZlQnVja2V0IHwgJ2ZhbGxiYWNrJztcblxuZXhwb3J0IGludGVyZmFjZSBDbGFzc2lmaWVkTW92ZSBleHRlbmRzIEFuYWx5emVkTW92ZSB7XG4gIGJ1Y2tldDogTW92ZUJ1Y2tldDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdWNrZXRDb25maWcge1xuICBiZXN0OiBudW1iZXI7XG4gIGdyZWF0OiBudW1iZXI7XG4gIGV4Y2VsbGVudDogbnVtYmVyO1xuICBnb29kOiBudW1iZXI7XG4gIGluYWNjdXJhY3k6IG51bWJlcjtcbiAgbWlzdGFrZTogbnVtYmVyO1xuICBibHVuZGVyOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RvY2tmaXNoSW5mbyB7XG4gIG11bHRpcHY6IG51bWJlcjtcbiAgZGVwdGg6IG51bWJlcjtcbiAgc2NvcmU6IG51bWJlcjtcbiAgbWF0ZT86IG51bWJlcjtcbiAgcHY6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBpY2tlZE1vdmVSZXN1bHQge1xuICBtb3ZlOiBDbGFzc2lmaWVkTW92ZTtcbiAgYnVja2V0OiBNb3ZlQnVja2V0O1xuICBpc0JyaWxsaWFudD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0JVQ0tFVF9DT05GSUc6IEJ1Y2tldENvbmZpZyA9IHtcbiAgYmVzdDogNDAsXG4gIGdyZWF0OiAyNSxcbiAgZXhjZWxsZW50OiAyMCxcbiAgZ29vZDogMTAsXG4gIGluYWNjdXJhY3k6IDQsXG4gIG1pc3Rha2U6IDEsXG4gIGJsdW5kZXI6IDAsXG59O1xuXG4vKiogUHJlc2V0IGlkIGZvciBtb3ZlIHF1YWxpdHkgZGlzdHJpYnV0aW9uICovXG5leHBvcnQgdHlwZSBNb3ZlUXVhbGl0eVByZXNldElkID0gJ2xvdycgfCAnbWVkaXVtJyB8ICdoYXJkJyB8ICdzdXBlcl9oYXJkJyB8ICdhZ2dyZXNzaXZlJztcblxuZXhwb3J0IGludGVyZmFjZSBNb3ZlUXVhbGl0eVByZXNldCB7XG4gIGlkOiBNb3ZlUXVhbGl0eVByZXNldElkO1xuICBsYWJlbDogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBjb25maWc6IEJ1Y2tldENvbmZpZztcbn1cblxuLyoqIFByZWRlZmluZWQgbW92ZSBxdWFsaXR5IGRpc3RyaWJ1dGlvbnMgKHBlcmNlbnRhZ2VzIHN1bSB0byAxMDApICovXG5leHBvcnQgY29uc3QgTU9WRV9RVUFMSVRZX1BSRVNFVFM6IE1vdmVRdWFsaXR5UHJlc2V0W10gPSBbXG4gIHtcbiAgICBpZDogJ2xvdycsXG4gICAgbGFiZWw6ICdMb3cnLFxuICAgIGRlc2NyaXB0aW9uOiAnRWFzaWVyIFx1MjAxNCBtb3JlIGdvb2QvaW5hY2N1cmFjeS9taXN0YWtlIG1vdmVzJyxcbiAgICBjb25maWc6IHtcbiAgICAgIGJlc3Q6IDE1LFxuICAgICAgZ3JlYXQ6IDE1LFxuICAgICAgZXhjZWxsZW50OiAyMCxcbiAgICAgIGdvb2Q6IDI1LFxuICAgICAgaW5hY2N1cmFjeTogMTUsXG4gICAgICBtaXN0YWtlOiA3LFxuICAgICAgYmx1bmRlcjogMyxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaWQ6ICdtZWRpdW0nLFxuICAgIGxhYmVsOiAnTWVkaXVtJyxcbiAgICBkZXNjcmlwdGlvbjogJ0JhbGFuY2VkIG1peCBvZiBxdWFsaXRpZXMnLFxuICAgIGNvbmZpZzoge1xuICAgICAgYmVzdDogNDAsXG4gICAgICBncmVhdDogMjUsXG4gICAgICBleGNlbGxlbnQ6IDIwLFxuICAgICAgZ29vZDogMTAsXG4gICAgICBpbmFjY3VyYWN5OiA0LFxuICAgICAgbWlzdGFrZTogMSxcbiAgICAgIGJsdW5kZXI6IDAsXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGFyZCcsXG4gICAgbGFiZWw6ICdIYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Zhdm9ycyBiZXN0IGFuZCBncmVhdCBtb3ZlcycsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiA1NSxcbiAgICAgIGdyZWF0OiAyNSxcbiAgICAgIGV4Y2VsbGVudDogMTUsXG4gICAgICBnb29kOiA1LFxuICAgICAgaW5hY2N1cmFjeTogMCxcbiAgICAgIG1pc3Rha2U6IDAsXG4gICAgICBibHVuZGVyOiAwLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ3N1cGVyX2hhcmQnLFxuICAgIGxhYmVsOiAnU3VwZXIgSGFyZCcsXG4gICAgZGVzY3JpcHRpb246ICdBbG1vc3Qgb25seSBiZXN0IGFuZCBncmVhdCcsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiA3MCxcbiAgICAgIGdyZWF0OiAyNSxcbiAgICAgIGV4Y2VsbGVudDogNSxcbiAgICAgIGdvb2Q6IDAsXG4gICAgICBpbmFjY3VyYWN5OiAwLFxuICAgICAgbWlzdGFrZTogMCxcbiAgICAgIGJsdW5kZXI6IDAsXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAnYWdncmVzc2l2ZScsXG4gICAgbGFiZWw6ICdBZ2dyZXNzaXZlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1Jpc2t5IFx1MjAxNCBtb3JlIGluYWNjdXJhY2llcyBhbmQgbWlzdGFrZXMnLFxuICAgIGNvbmZpZzoge1xuICAgICAgYmVzdDogMjAsXG4gICAgICBncmVhdDogMjAsXG4gICAgICBleGNlbGxlbnQ6IDE1LFxuICAgICAgZ29vZDogMTUsXG4gICAgICBpbmFjY3VyYWN5OiAxNSxcbiAgICAgIG1pc3Rha2U6IDEwLFxuICAgICAgYmx1bmRlcjogNSxcbiAgICB9LFxuICB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IEJVQ0tFVF9FVkFMX1JBTkdFUzogUmVjb3JkPE1vdmVCdWNrZXQsIFtudW1iZXIsIG51bWJlcl0+ID0ge1xuICBiZXN0OiBbMCwgMTBdLFxuICBncmVhdDogWzEwLCAzMF0sXG4gIGV4Y2VsbGVudDogWzMwLCA3MF0sXG4gIGdvb2Q6IFs3MCwgMTUwXSxcbiAgaW5hY2N1cmFjeTogWzE1MCwgMzAwXSxcbiAgbWlzdGFrZTogWzMwMCwgNjAwXSxcbiAgYmx1bmRlcjogWzYwMCwgSW5maW5pdHldLFxufTtcblxuZXhwb3J0IGNvbnN0IEJVQ0tFVF9MQUJFTFM6IFJlY29yZDxNb3ZlQnVja2V0LCBzdHJpbmc+ID0ge1xuICBiZXN0OiAnQmVzdCcsXG4gIGdyZWF0OiAnR3JlYXQnLFxuICBleGNlbGxlbnQ6ICdFeGNlbGxlbnQnLFxuICBnb29kOiAnR29vZCcsXG4gIGluYWNjdXJhY3k6ICdJbmFjY3VyYWN5JyxcbiAgbWlzdGFrZTogJ01pc3Rha2UnLFxuICBibHVuZGVyOiAnQmx1bmRlcicsXG59O1xuXG5leHBvcnQgY29uc3QgRElTUExBWV9CVUNLRVRfTEFCRUxTOiBSZWNvcmQ8RGlzcGxheU1vdmVCdWNrZXQsIHN0cmluZz4gPSB7XG4gIC4uLkJVQ0tFVF9MQUJFTFMsXG4gIGZhbGxiYWNrOiAnRmFsbGJhY2sgbW92ZScsXG59O1xuXG5leHBvcnQgY29uc3QgQlVDS0VUX0NPTE9SUzogUmVjb3JkPE1vdmVCdWNrZXQsIHN0cmluZz4gPSB7XG4gIGJlc3Q6ICcjMjZhNjQxJyxcbiAgZ3JlYXQ6ICcjMmVhMDQzJyxcbiAgZXhjZWxsZW50OiAnIzU3YWI1YScsXG4gIGdvb2Q6ICcjOGI5NDllJyxcbiAgaW5hY2N1cmFjeTogJyNkMjk5MjInLFxuICBtaXN0YWtlOiAnI2Y4NTE0OScsXG4gIGJsdW5kZXI6ICcjZGEzNjMzJyxcbn07XG5cbmV4cG9ydCBjb25zdCBESVNQTEFZX0JVQ0tFVF9DT0xPUlM6IFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgc3RyaW5nPiA9IHtcbiAgLi4uQlVDS0VUX0NPTE9SUyxcbiAgZmFsbGJhY2s6ICcjNmU3NjgxJyxcbn07XG4iLCAiLyoqXG4gKiBNb3ZlIENsYXNzaWZpZXJcbiAqIE1vZGVsIGxheWVyIC0gUHVyZSBUeXBlU2NyaXB0LCBubyBSZWFjdCwgbm8gTW9iWFxuICogXG4gKiBDbGFzc2lmaWVzIGNoZXNzIG1vdmVzIGludG8gcXVhbGl0eSBidWNrZXRzIGJhc2VkIG9uIGV2YWx1YXRpb24gbG9zc1xuICovXG5cbmltcG9ydCB7IFxuICBBbmFseXplZE1vdmUsIFxuICBDbGFzc2lmaWVkTW92ZSwgXG4gIERpc3BsYXlNb3ZlQnVja2V0LFxuICBNb3ZlQnVja2V0LCBcbiAgQlVDS0VUX0VWQUxfUkFOR0VTIFxufSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBDbGFzc2lmeSBhIHNpbmdsZSBtb3ZlIGludG8gYSBxdWFsaXR5IGJ1Y2tldCBiYXNlZCBvbiBldmFsIGxvc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzaWZ5TW92ZShtb3ZlOiBBbmFseXplZE1vdmUpOiBDbGFzc2lmaWVkTW92ZSB7XG4gIGNvbnN0IGJ1Y2tldCA9IGdldEJ1Y2tldEZvckV2YWxMb3NzKG1vdmUuZXZhbExvc3MpO1xuICByZXR1cm4ge1xuICAgIC4uLm1vdmUsXG4gICAgYnVja2V0LFxuICB9O1xufVxuXG4vKipcbiAqIENsYXNzaWZ5IGFsbCBhbmFseXplZCBtb3Zlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlNb3Zlcyhtb3ZlczogQW5hbHl6ZWRNb3ZlW10pOiBDbGFzc2lmaWVkTW92ZVtdIHtcbiAgcmV0dXJuIG1vdmVzLm1hcChjbGFzc2lmeU1vdmUpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgYnVja2V0IGZvciBhIGdpdmVuIGV2YWwgbG9zc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnVja2V0Rm9yRXZhbExvc3MoZXZhbExvc3M6IG51bWJlcik6IE1vdmVCdWNrZXQge1xuICBjb25zdCBhYnNMb3NzID0gTWF0aC5hYnMoZXZhbExvc3MpO1xuICBcbiAgZm9yIChjb25zdCBbYnVja2V0LCBbbWluLCBtYXhdXSBvZiBPYmplY3QuZW50cmllcyhCVUNLRVRfRVZBTF9SQU5HRVMpKSB7XG4gICAgaWYgKGFic0xvc3MgPj0gbWluICYmIGFic0xvc3MgPCBtYXgpIHtcbiAgICAgIHJldHVybiBidWNrZXQgYXMgTW92ZUJ1Y2tldDtcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiAnYmx1bmRlcic7XG59XG5cbi8qKlxuICogR3JvdXAgY2xhc3NpZmllZCBtb3ZlcyBieSB0aGVpciBidWNrZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwTW92ZXNCeUJ1Y2tldChtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSk6IE1hcDxNb3ZlQnVja2V0LCBDbGFzc2lmaWVkTW92ZVtdPiB7XG4gIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8TW92ZUJ1Y2tldCwgQ2xhc3NpZmllZE1vdmVbXT4oKTtcbiAgXG4gIC8vIEluaXRpYWxpemUgYWxsIGJ1Y2tldHMgd2l0aCBlbXB0eSBhcnJheXNcbiAgY29uc3QgYnVja2V0czogTW92ZUJ1Y2tldFtdID0gWydiZXN0JywgJ2dyZWF0JywgJ2V4Y2VsbGVudCcsICdnb29kJywgJ2luYWNjdXJhY3knLCAnbWlzdGFrZScsICdibHVuZGVyJ107XG4gIGJ1Y2tldHMuZm9yRWFjaChidWNrZXQgPT4gZ3JvdXBzLnNldChidWNrZXQsIFtdKSk7XG4gIFxuICAvLyBHcm91cCBtb3Zlc1xuICBtb3Zlcy5mb3JFYWNoKG1vdmUgPT4ge1xuICAgIGNvbnN0IGJ1Y2tldE1vdmVzID0gZ3JvdXBzLmdldChtb3ZlLmJ1Y2tldCkgfHwgW107XG4gICAgYnVja2V0TW92ZXMucHVzaChtb3ZlKTtcbiAgICBncm91cHMuc2V0KG1vdmUuYnVja2V0LCBidWNrZXRNb3Zlcyk7XG4gIH0pO1xuICBcbiAgcmV0dXJuIGdyb3Vwcztcbn1cblxuLyoqXG4gKiBHZXQgc3RhdGlzdGljcyBhYm91dCB0aGUgbW92ZSBkaXN0cmlidXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1vdmVTdGF0cyhtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSk6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+IHtcbiAgY29uc3Qgc3RhdHM6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+ID0ge1xuICAgIGJlc3Q6IDAsXG4gICAgZ3JlYXQ6IDAsXG4gICAgZXhjZWxsZW50OiAwLFxuICAgIGdvb2Q6IDAsXG4gICAgaW5hY2N1cmFjeTogMCxcbiAgICBtaXN0YWtlOiAwLFxuICAgIGJsdW5kZXI6IDAsXG4gIH07XG4gIFxuICBtb3Zlcy5mb3JFYWNoKG1vdmUgPT4ge1xuICAgIHN0YXRzW21vdmUuYnVja2V0XSsrO1xuICB9KTtcbiAgXG4gIHJldHVybiBzdGF0cztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGVyZSBhcmUgYW55IG1vdmVzIGluIGEgZ2l2ZW4gYnVja2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNNb3ZlSW5CdWNrZXQobW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sIGJ1Y2tldDogTW92ZUJ1Y2tldCk6IGJvb2xlYW4ge1xuICByZXR1cm4gbW92ZXMuc29tZShtb3ZlID0+IG1vdmUuYnVja2V0ID09PSBidWNrZXQpO1xufVxuXG4vKipcbiAqIEdldCBhbGwgbW92ZXMgZnJvbSBhIHNwZWNpZmljIGJ1Y2tldFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TW92ZXNGcm9tQnVja2V0KG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLCBidWNrZXQ6IE1vdmVCdWNrZXQpOiBDbGFzc2lmaWVkTW92ZVtdIHtcbiAgcmV0dXJuIG1vdmVzLmZpbHRlcihtb3ZlID0+IG1vdmUuYnVja2V0ID09PSBidWNrZXQpO1xufVxuXG5jb25zdCBCVUNLRVRfT1JERVI6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnLCAnZ29vZCcsICdpbmFjY3VyYWN5JywgJ21pc3Rha2UnLCAnYmx1bmRlciddO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlVbmFuYWx5emVkTW92ZSgpOiBEaXNwbGF5TW92ZUJ1Y2tldCB7XG4gIHJldHVybiAnZmFsbGJhY2snO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwTGVnYWxNb3Zlc1RvQnVja2V0cyhcbiAgbGVnYWxNb3Zlczogc3RyaW5nW10sXG4gIGFuYWx5emVkTW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIHVzZUltcHJvdmVkRmFsbGJhY2s6IGJvb2xlYW4sXG4pOiBSZWNvcmQ8c3RyaW5nLCBEaXNwbGF5TW92ZUJ1Y2tldD4ge1xuICBjb25zdCBtb3ZlTWFwOiBSZWNvcmQ8c3RyaW5nLCBEaXNwbGF5TW92ZUJ1Y2tldD4gPSB7fTtcblxuICBmb3IgKGNvbnN0IGFuYWx5emVkTW92ZSBvZiBhbmFseXplZE1vdmVzKSB7XG4gICAgbW92ZU1hcFthbmFseXplZE1vdmUubW92ZV0gPSBhbmFseXplZE1vdmUuYnVja2V0O1xuICB9XG5cbiAgZm9yIChjb25zdCBtb3ZlIG9mIGxlZ2FsTW92ZXMpIHtcbiAgICBpZiAoIW1vdmVNYXBbbW92ZV0pIHtcbiAgICAgIG1vdmVNYXBbbW92ZV0gPSB1c2VJbXByb3ZlZEZhbGxiYWNrID8gY2xhc3NpZnlVbmFuYWx5emVkTW92ZSgpIDogJ2dvb2QnO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtb3ZlTWFwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZENsb3Nlc3RBdmFpbGFibGVCdWNrZXQoXG4gIHRhcmdldEJ1Y2tldDogTW92ZUJ1Y2tldCxcbiAgYXZhaWxhYmxlQnVja2V0czogTW92ZUJ1Y2tldFtdLFxuKTogTW92ZUJ1Y2tldCB8IG51bGwge1xuICBpZiAoYXZhaWxhYmxlQnVja2V0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldEluZGV4ID0gQlVDS0VUX09SREVSLmluZGV4T2YodGFyZ2V0QnVja2V0KTtcbiAgaWYgKHRhcmdldEluZGV4ID09PSAtMSkge1xuICAgIHJldHVybiBhdmFpbGFibGVCdWNrZXRzWzBdO1xuICB9XG5cbiAgZm9yIChsZXQgb2Zmc2V0ID0gMTsgb2Zmc2V0IDwgQlVDS0VUX09SREVSLmxlbmd0aDsgb2Zmc2V0ICs9IDEpIHtcbiAgICBjb25zdCBiZXR0ZXJJbmRleCA9IHRhcmdldEluZGV4IC0gb2Zmc2V0O1xuICAgIGlmIChiZXR0ZXJJbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBiZXR0ZXJCdWNrZXQgPSBCVUNLRVRfT1JERVJbYmV0dGVySW5kZXhdO1xuICAgICAgaWYgKGF2YWlsYWJsZUJ1Y2tldHMuaW5jbHVkZXMoYmV0dGVyQnVja2V0KSkge1xuICAgICAgICByZXR1cm4gYmV0dGVyQnVja2V0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHdvcnNlSW5kZXggPSB0YXJnZXRJbmRleCArIG9mZnNldDtcbiAgICBpZiAod29yc2VJbmRleCA8IEJVQ0tFVF9PUkRFUi5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHdvcnNlQnVja2V0ID0gQlVDS0VUX09SREVSW3dvcnNlSW5kZXhdO1xuICAgICAgaWYgKGF2YWlsYWJsZUJ1Y2tldHMuaW5jbHVkZXMod29yc2VCdWNrZXQpKSB7XG4gICAgICAgIHJldHVybiB3b3JzZUJ1Y2tldDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXZhaWxhYmxlQnVja2V0c1swXTtcbn1cbiIsICIvKipcbiAqIE1vdmUgUGlja2VyXG4gKiBNb2RlbCBsYXllciAtIFB1cmUgVHlwZVNjcmlwdCwgbm8gUmVhY3QsIG5vIE1vYlhcbiAqIFxuICogUGlja3MgYSBtb3ZlIGJhc2VkIG9uIHdlaWdodGVkIHByb2JhYmlsaXR5IGZyb20gcXVhbGl0eSBidWNrZXRzXG4gKi9cblxuaW1wb3J0IHsgXG4gIENsYXNzaWZpZWRNb3ZlLCBcbiAgTW92ZUJ1Y2tldCwgXG4gIEJ1Y2tldENvbmZpZywgXG4gIFBpY2tlZE1vdmVSZXN1bHQsXG4gIERFRkFVTFRfQlVDS0VUX0NPTkZJRyBcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBmaW5kQ2xvc2VzdEF2YWlsYWJsZUJ1Y2tldCwgZ3JvdXBNb3Zlc0J5QnVja2V0IH0gZnJvbSAnLi9tb3ZlQ2xhc3NpZmllcic7XG5cbmV4cG9ydCB0eXBlIFJhbmRvbU51bWJlckdlbmVyYXRvciA9ICgpID0+IG51bWJlcjtcblxuaW50ZXJmYWNlIEJ1Y2tldFNlbGVjdGlvbiB7XG4gIGJ1Y2tldDogTW92ZUJ1Y2tldDtcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW107XG59XG5cbmZ1bmN0aW9uIGdldEJ1Y2tldE9yZGVyKCk6IE1vdmVCdWNrZXRbXSB7XG4gIHJldHVybiBbJ2Jlc3QnLCAnZ3JlYXQnLCAnZXhjZWxsZW50JywgJ2dvb2QnLCAnaW5hY2N1cmFjeScsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcbn1cblxuZnVuY3Rpb24gZ2V0QXZhaWxhYmxlQnVja2V0cyhcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnLFxuKTogQnVja2V0U2VsZWN0aW9uW10ge1xuICBjb25zdCBncm91cGVkID0gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzKTtcbiAgY29uc3QgYXZhaWxhYmxlQnVja2V0czogQnVja2V0U2VsZWN0aW9uW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBnZXRCdWNrZXRPcmRlcigpKSB7XG4gICAgY29uc3QgYnVja2V0TW92ZXMgPSBncm91cGVkLmdldChidWNrZXQpIHx8IFtdO1xuICAgIGlmIChidWNrZXRNb3Zlcy5sZW5ndGggPiAwICYmIGNvbmZpZ1tidWNrZXRdID4gMCkge1xuICAgICAgYXZhaWxhYmxlQnVja2V0cy5wdXNoKHsgYnVja2V0LCBtb3ZlczogYnVja2V0TW92ZXMgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGF2YWlsYWJsZUJ1Y2tldHM7XG59XG5cbmZ1bmN0aW9uIHBpY2tXZWlnaHRlZEJ1Y2tldChcbiAgd2VpZ2h0ZWRCdWNrZXRzOiBBcnJheTx7IGJ1Y2tldDogTW92ZUJ1Y2tldDsgd2VpZ2h0OiBudW1iZXIgfT4sXG4gIHJhbmRvbTogUmFuZG9tTnVtYmVyR2VuZXJhdG9yLFxuKTogTW92ZUJ1Y2tldCB8IG51bGwge1xuICBjb25zdCB0b3RhbFdlaWdodCA9IHdlaWdodGVkQnVja2V0cy5yZWR1Y2UoKHN1bSwgZW50cnkpID0+IHN1bSArIGVudHJ5LndlaWdodCwgMCk7XG5cbiAgaWYgKHRvdGFsV2VpZ2h0IDw9IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBzZWxlY3Rpb24gPSByYW5kb20oKSAqIHRvdGFsV2VpZ2h0O1xuXG4gIGZvciAoY29uc3QgZW50cnkgb2Ygd2VpZ2h0ZWRCdWNrZXRzKSB7XG4gICAgc2VsZWN0aW9uIC09IGVudHJ5LndlaWdodDtcbiAgICBpZiAoc2VsZWN0aW9uIDw9IDApIHtcbiAgICAgIHJldHVybiBlbnRyeS5idWNrZXQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHdlaWdodGVkQnVja2V0c1t3ZWlnaHRlZEJ1Y2tldHMubGVuZ3RoIC0gMV0/LmJ1Y2tldCA/PyBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja0J1Y2tldExlZ2FjeShcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnID0gREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICByYW5kb206IFJhbmRvbU51bWJlckdlbmVyYXRvciA9IE1hdGgucmFuZG9tLFxuKTogQnVja2V0U2VsZWN0aW9uIHwgbnVsbCB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IGF2YWlsYWJsZUJ1Y2tldHMgPSBnZXRBdmFpbGFibGVCdWNrZXRzKG1vdmVzLCBjb25maWcpO1xuICBpZiAoYXZhaWxhYmxlQnVja2V0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgYnVja2V0OiBtb3Zlc1swXS5idWNrZXQsXG4gICAgICBtb3ZlczogW21vdmVzWzBdXSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3Qgd2VpZ2h0ZWRCdWNrZXRzID0gYXZhaWxhYmxlQnVja2V0cy5tYXAoKGVudHJ5KSA9PiAoe1xuICAgIGJ1Y2tldDogZW50cnkuYnVja2V0LFxuICAgIHdlaWdodDogY29uZmlnW2VudHJ5LmJ1Y2tldF0sXG4gIH0pKTtcbiAgY29uc3Qgc2VsZWN0ZWRCdWNrZXQgPSBwaWNrV2VpZ2h0ZWRCdWNrZXQod2VpZ2h0ZWRCdWNrZXRzLCByYW5kb20pO1xuXG4gIGlmICghc2VsZWN0ZWRCdWNrZXQpIHtcbiAgICByZXR1cm4gYXZhaWxhYmxlQnVja2V0c1swXTtcbiAgfVxuXG4gIHJldHVybiBhdmFpbGFibGVCdWNrZXRzLmZpbmQoKGVudHJ5KSA9PiBlbnRyeS5idWNrZXQgPT09IHNlbGVjdGVkQnVja2V0KSA/PyBhdmFpbGFibGVCdWNrZXRzWzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja0J1Y2tldFdpdGhDbG9zZXN0RmFsbGJhY2soXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICBjb25maWc6IEJ1Y2tldENvbmZpZyA9IERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IgPSBNYXRoLnJhbmRvbSxcbik6IEJ1Y2tldFNlbGVjdGlvbiB8IG51bGwge1xuICBpZiAobW92ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBncm91cGVkID0gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzKTtcbiAgY29uc3Qgd2VpZ2h0ZWRCdWNrZXRzID0gZ2V0QnVja2V0T3JkZXIoKVxuICAgIC5maWx0ZXIoKGJ1Y2tldCkgPT4gY29uZmlnW2J1Y2tldF0gPiAwKVxuICAgIC5tYXAoKGJ1Y2tldCkgPT4gKHsgYnVja2V0LCB3ZWlnaHQ6IGNvbmZpZ1tidWNrZXRdIH0pKTtcbiAgY29uc3Qgc2VsZWN0ZWRCdWNrZXQgPSBwaWNrV2VpZ2h0ZWRCdWNrZXQod2VpZ2h0ZWRCdWNrZXRzLCByYW5kb20pO1xuXG4gIGlmICghc2VsZWN0ZWRCdWNrZXQpIHtcbiAgICByZXR1cm4gcGlja0J1Y2tldExlZ2FjeShtb3ZlcywgY29uZmlnLCByYW5kb20pO1xuICB9XG5cbiAgY29uc3Qgc2VsZWN0ZWRNb3ZlcyA9IGdyb3VwZWQuZ2V0KHNlbGVjdGVkQnVja2V0KSB8fCBbXTtcbiAgaWYgKHNlbGVjdGVkTW92ZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBidWNrZXQ6IHNlbGVjdGVkQnVja2V0LFxuICAgICAgbW92ZXM6IHNlbGVjdGVkTW92ZXMsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGF2YWlsYWJsZUJ1Y2tldHMgPSBnZXRCdWNrZXRPcmRlcigpLmZpbHRlcigoYnVja2V0KSA9PiAoZ3JvdXBlZC5nZXQoYnVja2V0KSB8fCBbXSkubGVuZ3RoID4gMCk7XG4gIGNvbnN0IGZhbGxiYWNrQnVja2V0ID0gZmluZENsb3Nlc3RBdmFpbGFibGVCdWNrZXQoc2VsZWN0ZWRCdWNrZXQsIGF2YWlsYWJsZUJ1Y2tldHMpO1xuICBpZiAoIWZhbGxiYWNrQnVja2V0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJ1Y2tldDogZmFsbGJhY2tCdWNrZXQsXG4gICAgbW92ZXM6IGdyb3VwZWQuZ2V0KGZhbGxiYWNrQnVja2V0KSB8fCBbXSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tSYW5kb21Nb3ZlRnJvbUJ1Y2tldChcbiAgYnVja2V0U2VsZWN0aW9uOiBCdWNrZXRTZWxlY3Rpb24sXG4gIHJhbmRvbTogUmFuZG9tTnVtYmVyR2VuZXJhdG9yID0gTWF0aC5yYW5kb20sXG4pOiBDbGFzc2lmaWVkTW92ZSB7XG4gIGNvbnN0IHJhbmRvbU1vdmVJbmRleCA9IE1hdGguZmxvb3IocmFuZG9tKCkgKiBidWNrZXRTZWxlY3Rpb24ubW92ZXMubGVuZ3RoKTtcbiAgcmV0dXJuIGJ1Y2tldFNlbGVjdGlvbi5tb3Zlc1tyYW5kb21Nb3ZlSW5kZXhdO1xufVxuXG4vKipcbiAqIFBpY2sgYSBtb3ZlIGJhc2VkIG9uIGJ1Y2tldCBjb25maWd1cmF0aW9uICh3ZWlnaHRlZCByYW5kb20pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaWNrTW92ZShcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sIFxuICBjb25maWc6IEJ1Y2tldENvbmZpZyA9IERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IgPSBNYXRoLnJhbmRvbSxcbik6IFBpY2tlZE1vdmVSZXN1bHQgfCBudWxsIHtcbiAgY29uc3Qgc2VsZWN0ZWRCdWNrZXQgPSBwaWNrQnVja2V0TGVnYWN5KG1vdmVzLCBjb25maWcsIHJhbmRvbSk7XG4gIGlmICghc2VsZWN0ZWRCdWNrZXQpIHJldHVybiBudWxsO1xuICBjb25zdCBzZWxlY3RlZE1vdmUgPSBwaWNrUmFuZG9tTW92ZUZyb21CdWNrZXQoc2VsZWN0ZWRCdWNrZXQsIHJhbmRvbSk7XG5cbiAgcmV0dXJuIHtcbiAgICBtb3ZlOiBzZWxlY3RlZE1vdmUsXG4gICAgYnVja2V0OiBzZWxlY3RlZEJ1Y2tldC5idWNrZXQsXG4gIH07XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGJ1Y2tldCBjb25maWcgc28gcGVyY2VudGFnZXMgc3VtIHRvIDEwMFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQnVja2V0Q29uZmlnKGNvbmZpZzogQnVja2V0Q29uZmlnKTogQnVja2V0Q29uZmlnIHtcbiAgY29uc3QgdG90YWwgPSBPYmplY3QudmFsdWVzKGNvbmZpZykucmVkdWNlKChzdW0sIHZhbCkgPT4gc3VtICsgdmFsLCAwKTtcbiAgXG4gIGlmICh0b3RhbCA9PT0gMCB8fCB0b3RhbCA9PT0gMTAwKSB7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuICBcbiAgY29uc3QgZmFjdG9yID0gMTAwIC8gdG90YWw7XG4gIFxuICByZXR1cm4ge1xuICAgIGJlc3Q6IE1hdGgucm91bmQoY29uZmlnLmJlc3QgKiBmYWN0b3IpLFxuICAgIGdyZWF0OiBNYXRoLnJvdW5kKGNvbmZpZy5ncmVhdCAqIGZhY3RvciksXG4gICAgZXhjZWxsZW50OiBNYXRoLnJvdW5kKGNvbmZpZy5leGNlbGxlbnQgKiBmYWN0b3IpLFxuICAgIGdvb2Q6IE1hdGgucm91bmQoY29uZmlnLmdvb2QgKiBmYWN0b3IpLFxuICAgIGluYWNjdXJhY3k6IE1hdGgucm91bmQoY29uZmlnLmluYWNjdXJhY3kgKiBmYWN0b3IpLFxuICAgIG1pc3Rha2U6IE1hdGgucm91bmQoY29uZmlnLm1pc3Rha2UgKiBmYWN0b3IpLFxuICAgIGJsdW5kZXI6IE1hdGgucm91bmQoY29uZmlnLmJsdW5kZXIgKiBmYWN0b3IpLFxuICB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlIGJ1Y2tldCBjb25maWdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQnVja2V0Q29uZmlnKGNvbmZpZzogQnVja2V0Q29uZmlnKTogeyB2YWxpZDogYm9vbGVhbjsgdG90YWw6IG51bWJlciB9IHtcbiAgY29uc3QgdG90YWwgPSBPYmplY3QudmFsdWVzKGNvbmZpZykucmVkdWNlKChzdW0sIHZhbCkgPT4gc3VtICsgdmFsLCAwKTtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdG90YWwgPT09IDEwMCxcbiAgICB0b3RhbCxcbiAgfTtcbn1cblxuLyoqXG4gKiBHZXQgcHJvYmFiaWxpdHkgb2YgcGlja2luZyBmcm9tIGVhY2ggYnVja2V0IGdpdmVuIGN1cnJlbnQgY29uZmlnIGFuZCBhdmFpbGFibGUgbW92ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVmZmVjdGl2ZVByb2JhYmlsaXRpZXMoXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICBjb25maWc6IEJ1Y2tldENvbmZpZ1xuKTogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICBjb25zdCBncm91cGVkID0gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzKTtcbiAgXG4gIGNvbnN0IHByb2JhYmlsaXRpZXM6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+ID0ge1xuICAgIGJlc3Q6IDAsXG4gICAgZ3JlYXQ6IDAsXG4gICAgZXhjZWxsZW50OiAwLFxuICAgIGdvb2Q6IDAsXG4gICAgaW5hY2N1cmFjeTogMCxcbiAgICBtaXN0YWtlOiAwLFxuICAgIGJsdW5kZXI6IDAsXG4gIH07XG4gIFxuICAvLyBDYWxjdWxhdGUgZWZmZWN0aXZlIHdlaWdodHMgKG9ubHkgYnVja2V0cyB3aXRoIG1vdmVzKVxuICBsZXQgdG90YWxFZmZlY3RpdmVXZWlnaHQgPSAwO1xuICBjb25zdCBidWNrZXRzOiBNb3ZlQnVja2V0W10gPSBbJ2Jlc3QnLCAnZ3JlYXQnLCAnZXhjZWxsZW50JywgJ2dvb2QnLCAnaW5hY2N1cmFjeScsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcbiAgXG4gIGZvciAoY29uc3QgYnVja2V0IG9mIGJ1Y2tldHMpIHtcbiAgICBjb25zdCBidWNrZXRNb3ZlcyA9IGdyb3VwZWQuZ2V0KGJ1Y2tldCkgfHwgW107XG4gICAgaWYgKGJ1Y2tldE1vdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRvdGFsRWZmZWN0aXZlV2VpZ2h0ICs9IGNvbmZpZ1tidWNrZXRdO1xuICAgIH1cbiAgfVxuICBcbiAgaWYgKHRvdGFsRWZmZWN0aXZlV2VpZ2h0ID09PSAwKSB7XG4gICAgcmV0dXJuIHByb2JhYmlsaXRpZXM7XG4gIH1cbiAgXG4gIC8vIENhbGN1bGF0ZSBub3JtYWxpemVkIHByb2JhYmlsaXRpZXNcbiAgZm9yIChjb25zdCBidWNrZXQgb2YgYnVja2V0cykge1xuICAgIGNvbnN0IGJ1Y2tldE1vdmVzID0gZ3JvdXBlZC5nZXQoYnVja2V0KSB8fCBbXTtcbiAgICBpZiAoYnVja2V0TW92ZXMubGVuZ3RoID4gMCkge1xuICAgICAgcHJvYmFiaWxpdGllc1tidWNrZXRdID0gKGNvbmZpZ1tidWNrZXRdIC8gdG90YWxFZmZlY3RpdmVXZWlnaHQpICogMTAwO1xuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIHByb2JhYmlsaXRpZXM7XG59XG4iLCAiaW1wb3J0IHsgTW92ZVF1YWxpdHlQcmVzZXRJZCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZlYXR1cmVPcHRpb25zIHtcbiAgc2VjdXJpdHlEZXZUb29sc09ubHk6IGJvb2xlYW47XG4gIHBlcnNpc3RFbmdpbmVDb25maWc6IGJvb2xlYW47XG4gIHVzZURldGVybWluaXN0aWNSbmc6IGJvb2xlYW47XG4gIHVzZU1vdmVBbmFseXNpc0NhY2hlOiBib29sZWFuO1xuICB1c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbjogYm9vbGVhbjtcbiAgdXNlUG9zaXRpb25Db21wbGV4aXR5OiBib29sZWFuO1xuICB1c2VQZXJzb25hQmVoYXZpb3JCaWFzOiBib29sZWFuO1xuICB1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbjogYm9vbGVhbjtcbiAgdXNlQnJpbGxpYW50TW92ZUJ1ZGdldDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgRmVhdHVyZU9wdGlvbktleSA9IGtleW9mIEZlYXR1cmVPcHRpb25zO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZlYXR1cmVPcHRpb25EZXNjcmlwdG9yIHtcbiAga2V5OiBGZWF0dXJlT3B0aW9uS2V5O1xuICBsYWJlbDogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBQZXJzb25hSWQgPSBNb3ZlUXVhbGl0eVByZXNldElkIHwgJ2N1c3RvbSc7XG5leHBvcnQgdHlwZSBCcmlsbGlhbnRNb3Zlc1BlckdhbWUgPSAwIHwgMSB8IDIgfCAzIHwgNDtcbmV4cG9ydCB0eXBlIEJyaWxsaWFudEFsbG93ZWRQaGFzZSA9ICdvcGVuaW5nJyB8ICdtaWRkbGVnYW1lJyB8ICdlbmRnYW1lJyB8ICdhbnknO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcge1xuICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IEJyaWxsaWFudE1vdmVzUGVyR2FtZTtcbiAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiBCcmlsbGlhbnRBbGxvd2VkUGhhc2U7XG4gIGJyaWxsaWFudFVzZWRDb3VudDogbnVtYmVyO1xuICBicmlsbGlhbnRNb3ZlTnVtYmVyczogbnVtYmVyW107XG4gIGdhbWVTZXNzaW9uSWQ6IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUzogRmVhdHVyZU9wdGlvbnMgPSB7XG4gIHNlY3VyaXR5RGV2VG9vbHNPbmx5OiB0cnVlLFxuICBwZXJzaXN0RW5naW5lQ29uZmlnOiB0cnVlLFxuICB1c2VEZXRlcm1pbmlzdGljUm5nOiBmYWxzZSxcbiAgdXNlTW92ZUFuYWx5c2lzQ2FjaGU6IHRydWUsXG4gIHVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uOiB0cnVlLFxuICB1c2VQb3NpdGlvbkNvbXBsZXhpdHk6IGZhbHNlLFxuICB1c2VQZXJzb25hQmVoYXZpb3JCaWFzOiBmYWxzZSxcbiAgdXNlSHVtYW5EZWxheVNpbXVsYXRpb246IGZhbHNlLFxuICB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0OiBmYWxzZSxcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUc6IEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcgPSB7XG4gIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMCxcbiAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnYW55JyxcbiAgYnJpbGxpYW50VXNlZENvdW50OiAwLFxuICBicmlsbGlhbnRNb3ZlTnVtYmVyczogW10sXG4gIGdhbWVTZXNzaW9uSWQ6IG51bGwsXG59O1xuXG5leHBvcnQgY29uc3QgRkVBVFVSRV9PUFRJT05fREVTQ1JJUFRPUlM6IEZlYXR1cmVPcHRpb25EZXNjcmlwdG9yW10gPSBbXG4gIHtcbiAgICBrZXk6ICdzZWN1cml0eURldlRvb2xzT25seScsXG4gICAgbGFiZWw6ICdEZXZUb29scyBPbmx5IEluIERldmVsb3BtZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ09wZW4gQ2hyb21pdW0gRGV2VG9vbHMgb25seSBpbiBkZXZlbG9wbWVudCBtb2RlLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICdwZXJzaXN0RW5naW5lQ29uZmlnJyxcbiAgICBsYWJlbDogJ1BlcnNpc3QgRW5naW5lIENvbmZpZ3VyYXRpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBkZXB0aCwgTXVsdGlQViwgcHJlc2V0cywgYnVja2V0IHdlaWdodHMsIGFuZCBhZHZhbmNlZCBmZWF0dXJlIG9wdGlvbnMuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZURldGVybWluaXN0aWNSbmcnLFxuICAgIGxhYmVsOiAnRGV0ZXJtaW5pc3RpYyBSTkcnLFxuICAgIGRlc2NyaXB0aW9uOiAnVXNlIGEgc2VlZGVkIHJhbmRvbSBzb3VyY2Ugc28gbW92ZSBzZWxlY3Rpb24gaXMgcmVwcm9kdWNpYmxlLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VNb3ZlQW5hbHlzaXNDYWNoZScsXG4gICAgbGFiZWw6ICdBbmFseXNpcyBDYWNoZScsXG4gICAgZGVzY3JpcHRpb246ICdSZXVzZSBTdG9ja2Zpc2ggYW5hbHlzaXMgZm9yIHRoZSBzYW1lIEZFTiwgZGVwdGgsIGFuZCBNdWx0aVBWIHNldHRpbmdzLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbicsXG4gICAgbGFiZWw6ICdJbXByb3ZlZCBNb3ZlIENsYXNzaWZpY2F0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ0tlZXAgdW5rbm93biBtb3ZlcyBzZXBhcmF0ZSBhbmQgdXNlIHNtYXJ0ZXIgYnVja2V0IGZhbGxiYWNrIHNlbGVjdGlvbi4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlUG9zaXRpb25Db21wbGV4aXR5JyxcbiAgICBsYWJlbDogJ1Bvc2l0aW9uIENvbXBsZXhpdHknLFxuICAgIGRlc2NyaXB0aW9uOiAnQWRqdXN0IG1vdmUgcXVhbGl0eSB3ZWlnaHRzIGJhc2VkIG9uIGhvdyBzaGFycCB0aGUgY3VycmVudCBwb3NpdGlvbiBpcy4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlUGVyc29uYUJlaGF2aW9yQmlhcycsXG4gICAgbGFiZWw6ICdQZXJzb25hIEJlaGF2aW9yIEJpYXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGF5ZXIgc2ltcGxlIGFnZ3Jlc3NpdmUgb3Igc2FmZSBtb3ZlIHByZWZlcmVuY2VzIG9uIHRvcCBvZiBidWNrZXQgc2VsZWN0aW9uLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbicsXG4gICAgbGFiZWw6ICdIdW1hbiBEZWxheSBTaW11bGF0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGF5IGF1dG8tcGxheSBtb3ZlcyBiYXNlZCBvbiBjb21wbGV4aXR5LCBwZXJzb25hLCBhbmQgY2hvc2VuIG1vdmUgcXVhbGl0eS4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsXG4gICAgbGFiZWw6ICdCcmlsbGlhbnQgTW92ZSBCdWRnZXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVzZXJ2ZSBhIGZpeGVkIG51bWJlciBvZiB0YWN0aWNhbCBicmlsbGlhbnQgbW92ZXMgZm9yIGVhY2ggZ2FtZS4nLFxuICB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfZmVhdHVyZV9vcHRpb25zJztcbmV4cG9ydCBjb25zdCBFTkdJTkVfQ09ORklHX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19lbmdpbmVfY29uZmlnJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlRmVhdHVyZU9wdGlvbnMoXG4gIHBhcnRpYWw/OiBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPiB8IG51bGwsXG4pOiBGZWF0dXJlT3B0aW9ucyB7XG4gIHJldHVybiB7XG4gICAgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gICAgLi4uKHBhcnRpYWwgPz8ge30pLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnKFxuICBwYXJ0aWFsPzogUGFydGlhbDxCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnPiB8IG51bGwsXG4pOiBCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5ERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcsXG4gICAgLi4uKHBhcnRpYWwgPz8ge30pLFxuICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBwYXJ0aWFsPy5icmlsbGlhbnRNb3ZlTnVtYmVycyA/PyBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcuYnJpbGxpYW50TW92ZU51bWJlcnMsXG4gICAgZ2FtZVNlc3Npb25JZDogcGFydGlhbD8uZ2FtZVNlc3Npb25JZCA/PyBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcuZ2FtZVNlc3Npb25JZCxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSwgcmVhY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIEJyaWxsaWFudEFsbG93ZWRQaGFzZSxcbiAgQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyxcbiAgQnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcsXG4gIERFRkFVTFRfRkVBVFVSRV9PUFRJT05TLFxuICBGRUFUVVJFX09QVElPTlNfU1RPUkFHRV9LRVksXG4gIEZlYXR1cmVPcHRpb25LZXksXG4gIEZlYXR1cmVPcHRpb25zLFxuICBtZXJnZUJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcsXG4gIG1lcmdlRmVhdHVyZU9wdGlvbnMsXG59IGZyb20gJy4uL2VuZ2luZS9mZWF0dXJlT3B0aW9ucyc7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgcGVyc29uYUNoZXNzQnJpZGdlPzoge1xuICAgICAgc3luY0ZlYXR1cmVPcHRpb25zOiAob3B0aW9uczogRmVhdHVyZU9wdGlvbnMpID0+IHZvaWQ7XG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwge1xuICBvcHRpb25zOiBGZWF0dXJlT3B0aW9ucyA9IHsgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfTtcbiAgYnJpbGxpYW50Q29uZmlnOiBCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcgfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0T3B0aW9uOiBhY3Rpb24sXG4gICAgICBzZXRPcHRpb25zOiBhY3Rpb24sXG4gICAgICBhcHBseVByb2ZpbGVTZXR0aW5nczogYWN0aW9uLFxuICAgICAgc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lOiBhY3Rpb24sXG4gICAgICBzZXRCcmlsbGlhbnRBbGxvd2VkUGhhc2U6IGFjdGlvbixcbiAgICAgIHJlY29uY2lsZUJyaWxsaWFudFRyYWNraW5nOiBhY3Rpb24sXG4gICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nOiBhY3Rpb24sXG4gICAgICByZXNldFRvRGVmYXVsdHM6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG5cbiAgICByZWFjdGlvbihcbiAgICAgICgpID0+ICh7XG4gICAgICAgIG9wdGlvbnM6IHsgLi4udGhpcy5vcHRpb25zIH0sXG4gICAgICAgIGJyaWxsaWFudENvbmZpZzoge1xuICAgICAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBbLi4udGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZU51bWJlcnNdLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICAoc25hcHNob3QpID0+IHtcbiAgICAgICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgICAgIHRoaXMuc3luY1RvTWFpblByb2Nlc3Moc25hcHNob3Qub3B0aW9ucyk7XG4gICAgICB9LFxuICAgICAgeyBmaXJlSW1tZWRpYXRlbHk6IHRydWUgfSxcbiAgICApO1xuICB9XG5cbiAgc2V0T3B0aW9uPEtleSBleHRlbmRzIEZlYXR1cmVPcHRpb25LZXk+KGtleTogS2V5LCB2YWx1ZTogRmVhdHVyZU9wdGlvbnNbS2V5XSk6IHZvaWQge1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgIFtrZXldOiB2YWx1ZSxcbiAgICB9O1xuXG4gICAgaWYgKGtleSA9PT0gJ3BlcnNpc3RFbmdpbmVDb25maWcnICYmIHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZFN0b3JhZ2UoKTtcbiAgICB9XG4gIH1cblxuICBzZXRPcHRpb25zKG9wdGlvbnM6IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+KTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyh7XG4gICAgICAuLi50aGlzLm9wdGlvbnMsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgYXBwbHlQcm9maWxlU2V0dGluZ3MoXG4gICAgb3B0aW9uczogUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4sXG4gICAgYnJpbGxpYW50U2V0dGluZ3M6IFBhcnRpYWw8UGljazxCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnLCAnYnJpbGxpYW50TW92ZXNQZXJHYW1lJyB8ICdicmlsbGlhbnRBbGxvd2VkUGhhc2UnPj4sXG4gICk6IHZvaWQge1xuICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlRmVhdHVyZU9wdGlvbnMoe1xuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiBicmlsbGlhbnRTZXR0aW5ncy5icmlsbGlhbnRNb3Zlc1BlckdhbWUgPz8gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiBicmlsbGlhbnRTZXR0aW5ncy5icmlsbGlhbnRBbGxvd2VkUGhhc2UgPz8gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50QWxsb3dlZFBoYXNlLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50ID4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lKSB7XG4gICAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICAgIGJyaWxsaWFudFVzZWRDb3VudDogdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICAgICAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZU51bWJlcnMuc2xpY2UoMCwgdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lKSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lKHZhbHVlOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWUpOiB2b2lkIHtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiB2YWx1ZSxcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudFVzZWRDb3VudCA+IHZhbHVlKSB7XG4gICAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICAgIGJyaWxsaWFudFVzZWRDb3VudDogdmFsdWUsXG4gICAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3ZlTnVtYmVycy5zbGljZSgwLCB2YWx1ZSksXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHNldEJyaWxsaWFudEFsbG93ZWRQaGFzZSh2YWx1ZTogQnJpbGxpYW50QWxsb3dlZFBoYXNlKTogdm9pZCB7XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogdmFsdWUsXG4gICAgfTtcbiAgfVxuXG4gIHJlY29uY2lsZUJyaWxsaWFudFRyYWNraW5nKFxuICAgIGdhbWVTZXNzaW9uSWQ6IHN0cmluZyxcbiAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogbnVtYmVyW10sXG4gICk6IHZvaWQge1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBnYW1lU2Vzc2lvbklkLFxuICAgICAgYnJpbGxpYW50VXNlZENvdW50OiBicmlsbGlhbnRNb3ZlTnVtYmVycy5sZW5ndGgsXG4gICAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogWy4uLmJyaWxsaWFudE1vdmVOdW1iZXJzXSxcbiAgICB9O1xuICB9XG5cbiAgcmVzZXRCcmlsbGlhbnRUcmFja2luZyhnYW1lU2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBnYW1lU2Vzc2lvbklkLFxuICAgICAgYnJpbGxpYW50VXNlZENvdW50OiAwLFxuICAgICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IFtdLFxuICAgIH07XG4gIH1cblxuICByZXNldFRvRGVmYXVsdHMoKTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zID0geyAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyB9O1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0geyAuLi5ERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcgfTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZCkgYXNcbiAgICAgICAgfCBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPlxuICAgICAgICB8IHsgb3B0aW9ucz86IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+OyBicmlsbGlhbnRDb25maWc/OiBQYXJ0aWFsPEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWc+IH07XG5cbiAgICAgIGlmICgnb3B0aW9ucycgaW4gcGFyc2VkIHx8ICdicmlsbGlhbnRDb25maWcnIGluIHBhcnNlZCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZUZlYXR1cmVPcHRpb25zKHBhcnNlZC5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSBtZXJnZUJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcocGFyc2VkLmJyaWxsaWFudENvbmZpZyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyhwYXJzZWQgYXMgUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWxdIEZhaWxlZCB0byByZXN0b3JlIGZlYXR1cmUgb3B0aW9uczonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0VG9TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5wZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgIEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICBicmlsbGlhbnRDb25maWc6IHRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHBlcnNpc3QgZmVhdHVyZSBvcHRpb25zOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0ZlYXR1cmVPcHRpb25zVmlld01vZGVsXSBGYWlsZWQgdG8gY2xlYXIgZmVhdHVyZSBvcHRpb25zIHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3luY1RvTWFpblByb2Nlc3Mob3B0aW9uczogRmVhdHVyZU9wdGlvbnMpOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJpYWxpemFibGVPcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyh7XG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuXG4gICAgd2luZG93LnBlcnNvbmFDaGVzc0JyaWRnZT8uc3luY0ZlYXR1cmVPcHRpb25zKHNlcmlhbGl6YWJsZU9wdGlvbnMpO1xuICB9XG5cbiAgZ2V0IHNlY3VyaXR5RGV2VG9vbHNPbmx5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuc2VjdXJpdHlEZXZUb29sc09ubHk7XG4gIH1cblxuICBnZXQgcGVyc2lzdEVuZ2luZUNvbmZpZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnBlcnNpc3RFbmdpbmVDb25maWc7XG4gIH1cblxuICBnZXQgdXNlRGV0ZXJtaW5pc3RpY1JuZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZURldGVybWluaXN0aWNSbmc7XG4gIH1cblxuICBnZXQgdXNlTW92ZUFuYWx5c2lzQ2FjaGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VNb3ZlQW5hbHlzaXNDYWNoZTtcbiAgfVxuXG4gIGdldCB1c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uO1xuICB9XG5cbiAgZ2V0IHVzZVBvc2l0aW9uQ29tcGxleGl0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZVBvc2l0aW9uQ29tcGxleGl0eTtcbiAgfVxuXG4gIGdldCB1c2VQZXJzb25hQmVoYXZpb3JCaWFzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlUGVyc29uYUJlaGF2aW9yQmlhcztcbiAgfVxuXG4gIGdldCB1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZUh1bWFuRGVsYXlTaW11bGF0aW9uO1xuICB9XG5cbiAgZ2V0IHVzZUJyaWxsaWFudE1vdmVCdWRnZXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0O1xuICB9XG5cbiAgZ2V0IGJyaWxsaWFudE1vdmVzUGVyR2FtZSgpOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWUge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWU7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50QWxsb3dlZFBoYXNlKCk6IEJyaWxsaWFudEFsbG93ZWRQaGFzZSB7XG4gICAgcmV0dXJuIHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudEFsbG93ZWRQaGFzZTtcbiAgfVxuXG4gIGdldCBicmlsbGlhbnRVc2VkQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50O1xuICB9XG5cbiAgZ2V0IGJyaWxsaWFudE1vdmVOdW1iZXJzKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZU51bWJlcnM7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50R2FtZVNlc3Npb25JZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuZ2FtZVNlc3Npb25JZDtcbiAgfVxuXG4gIGdldCBoYXNSZW1haW5pbmdCcmlsbGlhbnRNb3ZlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50IDwgdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCA9IG5ldyBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCgpO1xuIiwgImltcG9ydCB7IENoZXNzLCBQaWVjZVN5bWJvbCB9IGZyb20gJ2NoZXNzLmpzJztcbmltcG9ydCB7IENsYXNzaWZpZWRNb3ZlLCBNb3ZlQnVja2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSYW5kb21Tb3VyY2UgfSBmcm9tICcuL3JhbmRvbSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnJpbGxpYW50TW92ZUNhbmRpZGF0ZSB7XG4gIG1vdmU6IENsYXNzaWZpZWRNb3ZlO1xuICB0YWN0aWNhbFNjb3JlOiBudW1iZXI7XG59XG5cbmNvbnN0IFBJRUNFX1ZBTFVFUzogUmVjb3JkPFBpZWNlU3ltYm9sLCBudW1iZXI+ID0ge1xuICBwOiAxLFxuICBuOiAzLFxuICBiOiAzLFxuICByOiA1LFxuICBxOiA5LFxuICBrOiAwLFxufTtcblxuY29uc3QgQlJJTExJQU5UX0JVQ0tFVFM6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCddO1xuXG5mdW5jdGlvbiBnZXRQaWVjZVZhbHVlKHR5cGU/OiBQaWVjZVN5bWJvbCk6IG51bWJlciB7XG4gIHJldHVybiB0eXBlID8gUElFQ0VfVkFMVUVTW3R5cGVdIDogMDtcbn1cblxuZnVuY3Rpb24gZ2V0VGFjdGljYWxTY29yZShmZW46IHN0cmluZywgbW92ZTogQ2xhc3NpZmllZE1vdmUsIGJlc3RFdmFsdWF0aW9uOiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICBjb25zdCBmcm9tID0gbW92ZS5tb3ZlLnNsaWNlKDAsIDIpO1xuICBjb25zdCB0byA9IG1vdmUubW92ZS5zbGljZSgyLCA0KTtcbiAgY29uc3QgbW92aW5nUGllY2UgPSBjaGVzcy5nZXQoZnJvbSk7XG4gIGNvbnN0IHRhcmdldFBpZWNlID0gY2hlc3MuZ2V0KHRvKTtcbiAgY29uc3QgcGxheWVkTW92ZSA9IGNoZXNzLm1vdmUoe1xuICAgIGZyb20sXG4gICAgdG8sXG4gICAgcHJvbW90aW9uOiBtb3ZlLm1vdmVbNF0gYXMgJ3EnIHwgJ3InIHwgJ2InIHwgJ24nIHwgdW5kZWZpbmVkLFxuICB9KTtcblxuICBpZiAoIXBsYXllZE1vdmUpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGNvbnN0IGlzQ2FwdHVyZSA9IHBsYXllZE1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2MnKSB8fCBwbGF5ZWRNb3ZlLmZsYWdzLmluY2x1ZGVzKCdlJyk7XG4gIGNvbnN0IGlzUHJvbW90aW9uID0gQm9vbGVhbihwbGF5ZWRNb3ZlLnByb21vdGlvbik7XG4gIGNvbnN0IGlzQ2hlY2sgPSBjaGVzcy5pc0NoZWNrKCk7XG4gIGNvbnN0IGV2YWxHYWluID0gTWF0aC5tYXgoMCwgYmVzdEV2YWx1YXRpb24gLSBtb3ZlLmV2YWx1YXRpb24pO1xuICBjb25zdCBtYXRlcmlhbFN3aW5nID0gZ2V0UGllY2VWYWx1ZSh0YXJnZXRQaWVjZT8udHlwZSkgLSBnZXRQaWVjZVZhbHVlKG1vdmluZ1BpZWNlPy50eXBlKTtcbiAgY29uc3QgaXNTYWNyaWZpY2UgPSBpc0NhcHR1cmUgJiYgbWF0ZXJpYWxTd2luZyA8IDA7XG5cbiAgbGV0IHRhY3RpY2FsU2NvcmUgPSAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGlzQ2hlY2sgPyAyIDogMDtcbiAgdGFjdGljYWxTY29yZSArPSBpc0NhcHR1cmUgPyAxLjUgOiAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGlzUHJvbW90aW9uID8gMi41IDogMDtcbiAgdGFjdGljYWxTY29yZSArPSBpc1NhY3JpZmljZSA/IDEuNzUgOiAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGV2YWxHYWluID49IDgwID8gMS41IDogZXZhbEdhaW4gPj0gNDAgPyAwLjc1IDogMDtcblxuICByZXR1cm4gdGFjdGljYWxTY29yZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJyaWxsaWFudE1vdmVDYW5kaWRhdGVzKFxuICBmZW46IHN0cmluZyxcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4pOiBCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlW10ge1xuICBpZiAobW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3QgYmVzdEV2YWx1YXRpb24gPSBtb3Zlc1swXS5ldmFsdWF0aW9uO1xuXG4gIHJldHVybiBtb3Zlc1xuICAgIC5maWx0ZXIobW92ZSA9PiBCUklMTElBTlRfQlVDS0VUUy5pbmNsdWRlcyhtb3ZlLmJ1Y2tldCkpXG4gICAgLm1hcChtb3ZlID0+ICh7XG4gICAgICBtb3ZlLFxuICAgICAgdGFjdGljYWxTY29yZTogZ2V0VGFjdGljYWxTY29yZShmZW4sIG1vdmUsIGJlc3RFdmFsdWF0aW9uKSxcbiAgICB9KSlcbiAgICAuZmlsdGVyKGNhbmRpZGF0ZSA9PiBjYW5kaWRhdGUudGFjdGljYWxTY29yZSA+IDApXG4gICAgLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PiByaWdodC50YWN0aWNhbFNjb3JlIC0gbGVmdC50YWN0aWNhbFNjb3JlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tCcmlsbGlhbnRNb3ZlKFxuICBjYW5kaWRhdGVzOiBCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlW10sXG4gIHJhbmRvbVNvdXJjZTogUmFuZG9tU291cmNlLFxuKTogQ2xhc3NpZmllZE1vdmUgfCBudWxsIHtcbiAgaWYgKGNhbmRpZGF0ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB0b3RhbFdlaWdodCA9IGNhbmRpZGF0ZXMucmVkdWNlKChzdW0sIGNhbmRpZGF0ZSkgPT4gc3VtICsgY2FuZGlkYXRlLnRhY3RpY2FsU2NvcmUsIDApO1xuICBsZXQgc2VsZWN0aW9uID0gcmFuZG9tU291cmNlLm5leHQoKSAqIHRvdGFsV2VpZ2h0O1xuXG4gIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBzZWxlY3Rpb24gLT0gY2FuZGlkYXRlLnRhY3RpY2FsU2NvcmU7XG4gICAgaWYgKHNlbGVjdGlvbiA8PSAwKSB7XG4gICAgICByZXR1cm4gY2FuZGlkYXRlLm1vdmU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNhbmRpZGF0ZXNbY2FuZGlkYXRlcy5sZW5ndGggLSAxXS5tb3ZlO1xufVxuIiwgImltcG9ydCB7IENoZXNzLCBQaWVjZVN5bWJvbCB9IGZyb20gJ2NoZXNzLmpzJztcblxuZXhwb3J0IHR5cGUgR2FtZVBoYXNlID0gJ29wZW5pbmcnIHwgJ21pZGRsZWdhbWUnIHwgJ2VuZGdhbWUnO1xuXG5jb25zdCBQSUVDRV9WQUxVRVM6IFJlY29yZDxQaWVjZVN5bWJvbCwgbnVtYmVyPiA9IHtcbiAgcDogMSxcbiAgbjogMyxcbiAgYjogMyxcbiAgcjogNSxcbiAgcTogOSxcbiAgazogMCxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2FtZVBoYXNlUmVzdWx0IHtcbiAgcGhhc2U6IEdhbWVQaGFzZTtcbiAgdG90YWxNYXRlcmlhbDogbnVtYmVyO1xuICBxdWVlbnNUcmFkZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb3RhbE1hdGVyaWFsKGZlbjogc3RyaW5nKTogbnVtYmVyIHtcbiAgY29uc3QgY2hlc3MgPSBuZXcgQ2hlc3MoZmVuKTtcbiAgcmV0dXJuIGNoZXNzXG4gICAgLmJvYXJkKClcbiAgICAuZmxhdCgpXG4gICAgLnJlZHVjZSgodG90YWwsIHBpZWNlKSA9PiB0b3RhbCArIChwaWVjZSA/IFBJRUNFX1ZBTFVFU1twaWVjZS50eXBlXSA6IDApLCAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFyZVF1ZWVuc1RyYWRlZChmZW46IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICBjb25zdCBxdWVlbnMgPSBjaGVzc1xuICAgIC5ib2FyZCgpXG4gICAgLmZsYXQoKVxuICAgIC5maWx0ZXIocGllY2UgPT4gcGllY2U/LnR5cGUgPT09ICdxJykubGVuZ3RoO1xuXG4gIHJldHVybiBxdWVlbnMgPCAyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0R2FtZVBoYXNlKGZlbjogc3RyaW5nLCBtb3ZlTnVtYmVyOiBudW1iZXIpOiBHYW1lUGhhc2VSZXN1bHQge1xuICBjb25zdCB0b3RhbE1hdGVyaWFsID0gZ2V0VG90YWxNYXRlcmlhbChmZW4pO1xuICBjb25zdCBxdWVlbnNUcmFkZWQgPSBhcmVRdWVlbnNUcmFkZWQoZmVuKTtcblxuICBpZiAobW92ZU51bWJlciA8PSAxMCkge1xuICAgIHJldHVybiB7XG4gICAgICBwaGFzZTogJ29wZW5pbmcnLFxuICAgICAgdG90YWxNYXRlcmlhbCxcbiAgICAgIHF1ZWVuc1RyYWRlZCxcbiAgICB9O1xuICB9XG5cbiAgaWYgKHF1ZWVuc1RyYWRlZCB8fCB0b3RhbE1hdGVyaWFsIDw9IDI0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBoYXNlOiAnZW5kZ2FtZScsXG4gICAgICB0b3RhbE1hdGVyaWFsLFxuICAgICAgcXVlZW5zVHJhZGVkLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBoYXNlOiAnbWlkZGxlZ2FtZScsXG4gICAgdG90YWxNYXRlcmlhbCxcbiAgICBxdWVlbnNUcmFkZWQsXG4gIH07XG59XG4iLCAiaW1wb3J0IHsgQnVja2V0Q29uZmlnLCBNb3ZlQnVja2V0LCBBbmFseXplZE1vdmUgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQge1xuICBsZXZlbDogJ2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJztcbiAgc2NvcmU6IG51bWJlcjtcbiAgc3ByZWFkOiBudW1iZXI7XG4gIGNsb3NlQ2FuZGlkYXRlczogbnVtYmVyO1xuICB2b2xhdGlsaXR5OiBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlOiBudW1iZXIsIG1pbiA9IDAsIG1heCA9IDEpOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5taW4obWF4LCBNYXRoLm1heChtaW4sIHZhbHVlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVQb3NpdGlvbkNvbXBsZXhpdHkoXG4gIG1vdmVzOiBBbmFseXplZE1vdmVbXSxcbik6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPD0gMSkge1xuICAgIHJldHVybiB7XG4gICAgICBsZXZlbDogJ2xvdycsXG4gICAgICBzY29yZTogMCxcbiAgICAgIHNwcmVhZDogMCxcbiAgICAgIGNsb3NlQ2FuZGlkYXRlczogbW92ZXMubGVuZ3RoLFxuICAgICAgdm9sYXRpbGl0eTogMCxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgZXZhbHVhdGlvbnMgPSBtb3Zlcy5tYXAoKG1vdmUpID0+IG1vdmUuZXZhbHVhdGlvbikuc29ydCgoYSwgYikgPT4gYiAtIGEpO1xuICBjb25zdCBiZXN0ID0gZXZhbHVhdGlvbnNbMF07XG4gIGNvbnN0IHNwcmVhZCA9IE1hdGguYWJzKGJlc3QgLSBldmFsdWF0aW9uc1tldmFsdWF0aW9ucy5sZW5ndGggLSAxXSk7XG4gIGNvbnN0IGNsb3NlQ2FuZGlkYXRlcyA9IG1vdmVzLmZpbHRlcigobW92ZSkgPT4gTWF0aC5hYnMoYmVzdCAtIG1vdmUuZXZhbHVhdGlvbikgPD0gMzUpLmxlbmd0aDtcbiAgY29uc3Qgdm9sYXRpbGl0eSA9IG1vdmVzLmxlbmd0aCA+IDFcbiAgICA/IE1hdGguYWJzKGJlc3QgLSBldmFsdWF0aW9uc1tNYXRoLm1pbigyLCBldmFsdWF0aW9ucy5sZW5ndGggLSAxKV0pXG4gICAgOiAwO1xuXG4gIGNvbnN0IHNwcmVhZEZhY3RvciA9IDEgLSBjbGFtcChzcHJlYWQgLyAyNTApO1xuICBjb25zdCBjbG9zZUZhY3RvciA9IGNsYW1wKChjbG9zZUNhbmRpZGF0ZXMgLSAxKSAvIDUpO1xuICBjb25zdCB2b2xhdGlsaXR5RmFjdG9yID0gY2xhbXAodm9sYXRpbGl0eSAvIDE1MCk7XG4gIGNvbnN0IHNjb3JlID0gY2xhbXAoc3ByZWFkRmFjdG9yICogMC40NSArIGNsb3NlRmFjdG9yICogMC4zNSArIHZvbGF0aWxpdHlGYWN0b3IgKiAwLjIpO1xuXG4gIGxldCBsZXZlbDogUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0WydsZXZlbCddID0gJ21lZGl1bSc7XG4gIGlmIChzY29yZSA8IDAuMzMpIGxldmVsID0gJ2xvdyc7XG4gIGlmIChzY29yZSA+IDAuNjYpIGxldmVsID0gJ2hpZ2gnO1xuXG4gIHJldHVybiB7XG4gICAgbGV2ZWwsXG4gICAgc2NvcmUsXG4gICAgc3ByZWFkLFxuICAgIGNsb3NlQ2FuZGlkYXRlcyxcbiAgICB2b2xhdGlsaXR5LFxuICB9O1xufVxuXG5jb25zdCBCVUNLRVRfT1JERVI6IE1vdmVCdWNrZXRbXSA9IFtcbiAgJ2Jlc3QnLFxuICAnZ3JlYXQnLFxuICAnZXhjZWxsZW50JyxcbiAgJ2dvb2QnLFxuICAnaW5hY2N1cmFjeScsXG4gICdtaXN0YWtlJyxcbiAgJ2JsdW5kZXInLFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFkanVzdEJ1Y2tldENvbmZpZ0ZvckNvbXBsZXhpdHkoXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnLFxuICBjb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQsXG4pOiBCdWNrZXRDb25maWcge1xuICBjb25zdCBhZGp1c3RlZCA9IHsgLi4uY29uZmlnIH07XG4gIGNvbnN0IGludGVuc2l0eSA9IGNvbXBsZXhpdHkuc2NvcmU7XG5cbiAgaWYgKGNvbXBsZXhpdHkubGV2ZWwgPT09ICdoaWdoJykge1xuICAgIGFkanVzdGVkLmJlc3QgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5iZXN0IC0gTWF0aC5yb3VuZCg2ICogaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQuZ3JlYXQgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5ncmVhdCAtIE1hdGgucm91bmQoMyAqIGludGVuc2l0eSkpO1xuICAgIGFkanVzdGVkLmluYWNjdXJhY3kgKz0gTWF0aC5yb3VuZCg0ICogaW50ZW5zaXR5KTtcbiAgICBhZGp1c3RlZC5taXN0YWtlICs9IE1hdGgucm91bmQoMyAqIGludGVuc2l0eSk7XG4gICAgYWRqdXN0ZWQuYmx1bmRlciArPSBNYXRoLnJvdW5kKDIgKiBpbnRlbnNpdHkpO1xuICB9IGVsc2UgaWYgKGNvbXBsZXhpdHkubGV2ZWwgPT09ICdsb3cnKSB7XG4gICAgYWRqdXN0ZWQuYmVzdCArPSBNYXRoLnJvdW5kKDUgKiAoMSAtIGludGVuc2l0eSkpO1xuICAgIGFkanVzdGVkLmdyZWF0ICs9IE1hdGgucm91bmQoMyAqICgxIC0gaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQuZXhjZWxsZW50ICs9IE1hdGgucm91bmQoMiAqICgxIC0gaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQubWlzdGFrZSA9IE1hdGgubWF4KDAsIGFkanVzdGVkLm1pc3Rha2UgLSAyKTtcbiAgICBhZGp1c3RlZC5ibHVuZGVyID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuYmx1bmRlciAtIDEpO1xuICB9XG5cbiAgY29uc3QgdG90YWwgPSBCVUNLRVRfT1JERVIucmVkdWNlKChzdW0sIGJ1Y2tldCkgPT4gc3VtICsgYWRqdXN0ZWRbYnVja2V0XSwgMCk7XG4gIGlmICh0b3RhbCA8PSAwKSB7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBCVUNLRVRfT1JERVIucmVkdWNlKChyZXN1bHQsIGJ1Y2tldCkgPT4ge1xuICAgIHJlc3VsdFtidWNrZXRdID0gTWF0aC5yb3VuZCgoYWRqdXN0ZWRbYnVja2V0XSAvIHRvdGFsKSAqIDEwMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSwge30gYXMgQnVja2V0Q29uZmlnKTtcblxuICBjb25zdCBub3JtYWxpemVkVG90YWwgPSBCVUNLRVRfT1JERVIucmVkdWNlKChzdW0sIGJ1Y2tldCkgPT4gc3VtICsgbm9ybWFsaXplZFtidWNrZXRdLCAwKTtcbiAgY29uc3QgZGlmZiA9IDEwMCAtIG5vcm1hbGl6ZWRUb3RhbDtcbiAgbm9ybWFsaXplZC5iZXN0ICs9IGRpZmY7XG5cbiAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG59XG4iLCAiaW1wb3J0IHsgQ2hlc3MgfSBmcm9tICdjaGVzcy5qcyc7XG5pbXBvcnQgeyBQZXJzb25hSWQgfSBmcm9tICcuL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7IENsYXNzaWZpZWRNb3ZlLCBNb3ZlQnVja2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSYW5kb21Tb3VyY2UgfSBmcm9tICcuL3JhbmRvbSc7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQgfSBmcm9tICcuL3Bvc2l0aW9uQ29tcGxleGl0eSc7XG5cbmV4cG9ydCB0eXBlIFBlcnNvbmFCZWhhdmlvck1vZGUgPSAnYWdncmVzc2l2ZScgfCAnc2FmZScgfCAnYmFsYW5jZWQnO1xuXG5jb25zdCBTQUZFX0JVQ0tFVFM6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYTogUGVyc29uYUlkKTogUGVyc29uYUJlaGF2aW9yTW9kZSB7XG4gIGlmIChwZXJzb25hID09PSAnYWdncmVzc2l2ZScpIHtcbiAgICByZXR1cm4gJ2FnZ3Jlc3NpdmUnO1xuICB9XG5cbiAgaWYgKHBlcnNvbmEgPT09ICdoYXJkJyB8fCBwZXJzb25hID09PSAnc3VwZXJfaGFyZCcpIHtcbiAgICByZXR1cm4gJ3NhZmUnO1xuICB9XG5cbiAgcmV0dXJuICdiYWxhbmNlZCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVBlcnNvbmFCdWNrZXRCaWFzKFxuICBjb25maWc6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+LFxuICBwZXJzb25hOiBQZXJzb25hSWQsXG4pOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gIGNvbnN0IG1vZGUgPSBnZXRQZXJzb25hQmVoYXZpb3JNb2RlKHBlcnNvbmEpO1xuICBjb25zdCBhZGp1c3RlZCA9IHsgLi4uY29uZmlnIH07XG5cbiAgaWYgKG1vZGUgPT09ICdhZ2dyZXNzaXZlJykge1xuICAgIGFkanVzdGVkLmdvb2QgKz0gMztcbiAgICBhZGp1c3RlZC5pbmFjY3VyYWN5ICs9IDI7XG4gICAgYWRqdXN0ZWQuYmVzdCA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmJlc3QgLSAzKTtcbiAgICBhZGp1c3RlZC5ncmVhdCA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmdyZWF0IC0gMik7XG4gIH0gZWxzZSBpZiAobW9kZSA9PT0gJ3NhZmUnKSB7XG4gICAgZm9yIChjb25zdCBidWNrZXQgb2YgU0FGRV9CVUNLRVRTKSB7XG4gICAgICBhZGp1c3RlZFtidWNrZXRdICs9IDI7XG4gICAgfVxuICAgIGFkanVzdGVkLm1pc3Rha2UgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5taXN0YWtlIC0gMik7XG4gICAgYWRqdXN0ZWQuYmx1bmRlciA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmJsdW5kZXIgLSAyKTtcbiAgfVxuXG4gIHJldHVybiBhZGp1c3RlZDtcbn1cblxuZnVuY3Rpb24gZ2V0TW92ZVRyYWl0U2NvcmUoZmVuOiBzdHJpbmcsIG1vdmVVY2k6IHN0cmluZywgcGVyc29uYTogUGVyc29uYUlkKTogbnVtYmVyIHtcbiAgY29uc3QgbW9kZSA9IGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYSk7XG4gIGlmIChtb2RlID09PSAnYmFsYW5jZWQnKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICBjb25zdCBtb3ZlID0gY2hlc3MubW92ZSh7XG4gICAgZnJvbTogbW92ZVVjaS5zbGljZSgwLCAyKSxcbiAgICB0bzogbW92ZVVjaS5zbGljZSgyLCA0KSxcbiAgICBwcm9tb3Rpb246IG1vdmVVY2lbNF0gYXMgJ3EnIHwgJ3InIHwgJ2InIHwgJ24nIHwgdW5kZWZpbmVkLFxuICB9KTtcblxuICBpZiAoIW1vdmUpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IGlzQ2FwdHVyZSA9IG1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2MnKSB8fCBtb3ZlLmZsYWdzLmluY2x1ZGVzKCdlJyk7XG4gIGNvbnN0IGlzUHJvbW90aW9uID0gQm9vbGVhbihtb3ZlLnByb21vdGlvbik7XG4gIGNvbnN0IGlzQ2FzdGxlID0gbW92ZS5mbGFncy5pbmNsdWRlcygnaycpIHx8IG1vdmUuZmxhZ3MuaW5jbHVkZXMoJ3EnKTtcbiAgY29uc3QgaXNDaGVjayA9IGNoZXNzLmlzQ2hlY2soKTtcblxuICBpZiAobW9kZSA9PT0gJ2FnZ3Jlc3NpdmUnKSB7XG4gICAgcmV0dXJuIDFcbiAgICAgICsgKGlzQ2FwdHVyZSA/IDAuMzUgOiAwKVxuICAgICAgKyAoaXNDaGVjayA/IDAuMzUgOiAwKVxuICAgICAgKyAoaXNQcm9tb3Rpb24gPyAwLjQ1IDogMClcbiAgICAgICsgKGlzQ2FzdGxlID8gMC4wNSA6IDApO1xuICB9XG5cbiAgcmV0dXJuIDFcbiAgICArIChpc0Nhc3RsZSA/IDAuMiA6IDApXG4gICAgKyAoIWlzQ2FwdHVyZSA/IDAuMSA6IDApXG4gICAgLSAoaXNQcm9tb3Rpb24gPyAwLjA1IDogMCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWNrUGVyc29uYUJpYXNlZE1vdmUoXG4gIGZlbjogc3RyaW5nLFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgcGVyc29uYTogUGVyc29uYUlkLFxuICByYW5kb21Tb3VyY2U6IFJhbmRvbVNvdXJjZSxcbik6IENsYXNzaWZpZWRNb3ZlIHtcbiAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBtb3Zlc1swXTtcbiAgfVxuXG4gIGNvbnN0IHdlaWdodGVkTW92ZXMgPSBtb3Zlcy5tYXAoKG1vdmUpID0+ICh7XG4gICAgbW92ZSxcbiAgICB3ZWlnaHQ6IE1hdGgubWF4KDAuMSwgZ2V0TW92ZVRyYWl0U2NvcmUoZmVuLCBtb3ZlLm1vdmUsIHBlcnNvbmEpKSxcbiAgfSkpO1xuICBjb25zdCB0b3RhbFdlaWdodCA9IHdlaWdodGVkTW92ZXMucmVkdWNlKChzdW0sIGVudHJ5KSA9PiBzdW0gKyBlbnRyeS53ZWlnaHQsIDApO1xuICBsZXQgc2VsZWN0aW9uID0gcmFuZG9tU291cmNlLm5leHQoKSAqIHRvdGFsV2VpZ2h0O1xuXG4gIGZvciAoY29uc3QgZW50cnkgb2Ygd2VpZ2h0ZWRNb3Zlcykge1xuICAgIHNlbGVjdGlvbiAtPSBlbnRyeS53ZWlnaHQ7XG4gICAgaWYgKHNlbGVjdGlvbiA8PSAwKSB7XG4gICAgICByZXR1cm4gZW50cnkubW92ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gd2VpZ2h0ZWRNb3Zlc1t3ZWlnaHRlZE1vdmVzLmxlbmd0aCAtIDFdLm1vdmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVIdW1hbkRlbGF5TXMob3B0aW9uczoge1xuICBjb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQgfCBudWxsO1xuICBwZXJzb25hOiBQZXJzb25hSWQ7XG4gIGJ1Y2tldDogTW92ZUJ1Y2tldDtcbn0pOiBudW1iZXIge1xuICBjb25zdCB7IGNvbXBsZXhpdHksIHBlcnNvbmEsIGJ1Y2tldCB9ID0gb3B0aW9ucztcbiAgY29uc3QgbW9kZSA9IGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYSk7XG4gIGNvbnN0IGJhc2UgPSAzNTA7XG4gIGNvbnN0IGNvbXBsZXhpdHlEZWxheSA9IGNvbXBsZXhpdHkgPyBNYXRoLnJvdW5kKDkwMCAqIGNvbXBsZXhpdHkuc2NvcmUpIDogMDtcbiAgY29uc3QgcGVyc29uYURlbGF5ID0gbW9kZSA9PT0gJ3NhZmUnID8gMjIwIDogbW9kZSA9PT0gJ2FnZ3Jlc3NpdmUnID8gODAgOiAxNDA7XG4gIGNvbnN0IGJ1Y2tldERlbGF5ID1cbiAgICBidWNrZXQgPT09ICdiZXN0JyB8fCBidWNrZXQgPT09ICdncmVhdCdcbiAgICAgID8gMTIwXG4gICAgICA6IGJ1Y2tldCA9PT0gJ21pc3Rha2UnIHx8IGJ1Y2tldCA9PT0gJ2JsdW5kZXInXG4gICAgICAgID8gNDBcbiAgICAgICAgOiA4MDtcblxuICByZXR1cm4gYmFzZSArIGNvbXBsZXhpdHlEZWxheSArIHBlcnNvbmFEZWxheSArIGJ1Y2tldERlbGF5O1xufVxuIiwgIi8qKlxuICogRW5naW5lIFZpZXdNb2RlbFxuICogVmlld01vZGVsIGxheWVyIC0gTW9iWCBzdG9yZSBmb3IgU3RvY2tmaXNoIGVuZ2luZSBzdGF0ZVxuICovXG5cbmltcG9ydCB7IG1ha2VBdXRvT2JzZXJ2YWJsZSwgYWN0aW9uLCBydW5JbkFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgQW5hbHlzaXNQdXJwb3NlLFxuICBBbmFseXNpc1NuYXBzaG90LFxuICBpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0LFxufSBmcm9tICcuLi9lbmdpbmUvYW5hbHlzaXNTYWZldHknO1xuaW1wb3J0IHsgRW5naW5lQ29vcmRpbmF0b3IsIGVuZ2luZUNvb3JkaW5hdG9yLCBFbmdpbmVMYW5lIH0gZnJvbSAnLi4vZW5naW5lL2VuZ2luZUNvb3JkaW5hdG9yJztcbmltcG9ydCB7IGNsYXNzaWZ5TW92ZXMsIGdldE1vdmVTdGF0cywgZ3JvdXBNb3Zlc0J5QnVja2V0IH0gZnJvbSAnLi4vZW5naW5lL21vdmVDbGFzc2lmaWVyJztcbmltcG9ydCB7XG4gIHBpY2tCdWNrZXRMZWdhY3ksXG4gIHBpY2tCdWNrZXRXaXRoQ2xvc2VzdEZhbGxiYWNrLFxuICBwaWNrUmFuZG9tTW92ZUZyb21CdWNrZXQsXG59IGZyb20gJy4uL2VuZ2luZS9tb3ZlUGlja2VyJztcbmltcG9ydCB7IFxuICBBbmFseXplZE1vdmUsXG4gIENsYXNzaWZpZWRNb3ZlLCBcbiAgUGlja2VkTW92ZVJlc3VsdCwgXG4gIE1vdmVCdWNrZXQsXG4gIEJ1Y2tldENvbmZpZyxcbn0gZnJvbSAnLi4vZW5naW5lL3R5cGVzJztcbmltcG9ydCB7IGFuYWx5c2lzQ2FjaGUsIGJ1aWxkQW5hbHlzaXNDYWNoZUtleSB9IGZyb20gJy4uL2VuZ2luZS9hbmFseXNpc0NhY2hlJztcbmltcG9ydCB7IGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gZnJvbSAnLi9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCc7XG5pbXBvcnQgeyBnZXRCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlcywgcGlja0JyaWxsaWFudE1vdmUgfSBmcm9tICcuLi9lbmdpbmUvYnJpbGxpYW50TW92ZSc7XG5pbXBvcnQgeyBkZXRlY3RHYW1lUGhhc2UgfSBmcm9tICcuLi9lbmdpbmUvZ2FtZVBoYXNlJztcbmltcG9ydCB7XG4gIGFkanVzdEJ1Y2tldENvbmZpZ0ZvckNvbXBsZXhpdHksXG4gIGNhbGN1bGF0ZVBvc2l0aW9uQ29tcGxleGl0eSxcbiAgUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0LFxufSBmcm9tICcuLi9lbmdpbmUvcG9zaXRpb25Db21wbGV4aXR5JztcbmltcG9ydCB7XG4gIGFwcGx5UGVyc29uYUJ1Y2tldEJpYXMsXG4gIHBpY2tQZXJzb25hQmlhc2VkTW92ZSxcbn0gZnJvbSAnLi4vZW5naW5lL3BlcnNvbmFCaWFzJztcbmltcG9ydCB7XG4gIGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQsXG4gIGNyZWF0ZUxlZ2FjeVJhbmRvbVNvdXJjZSxcbiAgY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlLFxufSBmcm9tICcuLi9lbmdpbmUvcmFuZG9tJztcbmltcG9ydCB7IFBlcnNvbmFJZCB9IGZyb20gJy4uL2VuZ2luZS9mZWF0dXJlT3B0aW9ucyc7XG5pbXBvcnQgeyBjcmVhdGVEZWJ1Z0xvZ2dlciB9IGZyb20gJy4uL3NoYXJlZC9kZWJ1Zyc7XG5cbmludGVyZmFjZSBNb3ZlU2VsZWN0aW9uQ29udGV4dCB7XG4gIGZlbjogc3RyaW5nO1xuICBnYW1lU3RhcnRGZW46IHN0cmluZztcbiAgbW92ZUNvdW50OiBudW1iZXI7XG4gIHNpZGVUb01vdmU6ICd3JyB8ICdiJztcbiAgcGVyc29uYTogUGVyc29uYUlkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBvc2l0aW9uQW5hbHlzaXNSZXN1bHQgZXh0ZW5kcyBBbmFseXNpc1NuYXBzaG90PENsYXNzaWZpZWRNb3ZlW10+IHtcbiAgY29tcGxleGl0eTogUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0O1xuICBpZ25vcmVkOiBib29sZWFuO1xuICBmcm9tQ2FjaGU6IGJvb2xlYW47XG4gIHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZTtcbn1cblxuaW50ZXJmYWNlIEFjdGl2ZUFuYWx5c2lzUnVuIHtcbiAgY2FjaGVLZXk6IHN0cmluZztcbiAgZmVuOiBzdHJpbmc7XG4gIHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZTtcbiAgcHJvbWlzZTogUHJvbWlzZTxQb3NpdGlvbkFuYWx5c2lzUmVzdWx0Pjtcbn1cblxuaW50ZXJmYWNlIEVuZ2luZVZpZXdNb2RlbERlcGVuZGVuY2llcyB7XG4gIGNvb3JkaW5hdG9yPzogRW5naW5lQ29vcmRpbmF0b3I7XG59XG5cbmNvbnN0IGxvZ2dlciA9IGNyZWF0ZURlYnVnTG9nZ2VyKCdFbmdpbmVWaWV3TW9kZWwnKTtcblxuZnVuY3Rpb24gY2FuVXNlQnJpbGxpYW50TW92ZUJ1ZGdldChtb3ZlQ291bnQ6IG51bWJlciwgZmVuOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5oYXNSZW1haW5pbmdCcmlsbGlhbnRNb3Zlcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3Zlc1BlckdhbWUgPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBwaGFzZSA9IGRldGVjdEdhbWVQaGFzZShmZW4sIG1vdmVDb3VudCkucGhhc2U7XG4gIHJldHVybiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRBbGxvd2VkUGhhc2UgPT09ICdhbnknXG4gICAgfHwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50QWxsb3dlZFBoYXNlID09PSBwaGFzZTtcbn1cblxuZXhwb3J0IGNsYXNzIEVuZ2luZVZpZXdNb2RlbCB7XG4gIGlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgaXNJbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgYW5hbHl6ZWRNb3ZlczogQ2xhc3NpZmllZE1vdmVbXSA9IFtdO1xuICBsYXN0UGlja2VkTW92ZTogUGlja2VkTW92ZVJlc3VsdCB8IG51bGwgPSBudWxsO1xuICBlcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGxhc3RDb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQgfCBudWxsID0gbnVsbDtcbiAgbGFzdEFuYWx5c2lzRnJvbUNhY2hlID0gZmFsc2U7XG4gIGxhc3RBbmFseXNpc1B1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSB8IG51bGwgPSBudWxsO1xuICBpc01vdmVMYW5lQW5hbHl6aW5nID0gZmFsc2U7XG4gIGlzQmFja2dyb3VuZEFuYWx5emluZyA9IGZhbHNlO1xuICBwcml2YXRlIG5leHRSZXF1ZXN0SWRzOiBSZWNvcmQ8QW5hbHlzaXNQdXJwb3NlLCBudW1iZXI+ID0ge1xuICAgIGVuZ2luZU1vdmU6IDAsXG4gICAgYmFja2dyb3VuZDogMCxcbiAgfTtcbiAgcHJpdmF0ZSBsYXRlc3RSZXF1ZXN0SWRzOiBSZWNvcmQ8QW5hbHlzaXNQdXJwb3NlLCBudW1iZXI+ID0ge1xuICAgIGVuZ2luZU1vdmU6IDAsXG4gICAgYmFja2dyb3VuZDogMCxcbiAgfTtcbiAgcHJpdmF0ZSBhY3RpdmVBbmFseXNpc1J1bnM6IFJlY29yZDxBbmFseXNpc1B1cnBvc2UsIEFjdGl2ZUFuYWx5c2lzUnVuIHwgbnVsbD4gPSB7XG4gICAgZW5naW5lTW92ZTogbnVsbCxcbiAgICBiYWNrZ3JvdW5kOiBudWxsLFxuICB9O1xuICBwcml2YXRlIHJlYWRvbmx5IGNvb3JkaW5hdG9yOiBFbmdpbmVDb29yZGluYXRvcjtcblxuICBjb25zdHJ1Y3RvcihkZXBlbmRlbmNpZXM6IEVuZ2luZVZpZXdNb2RlbERlcGVuZGVuY2llcyA9IHt9KSB7XG4gICAgdGhpcy5jb29yZGluYXRvciA9IGRlcGVuZGVuY2llcy5jb29yZGluYXRvciA/PyBlbmdpbmVDb29yZGluYXRvcjtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgaW5pdGlhbGl6ZTogYWN0aW9uLFxuICAgICAgYW5hbHl6ZVBvc2l0aW9uOiBhY3Rpb24sXG4gICAgICBwaWNrTW92ZUZyb21BbmFseXNpczogYWN0aW9uLFxuICAgICAgcmVzZXQ6IGFjdGlvbixcbiAgICAgIHJlc3RhcnQ6IGFjdGlvbixcbiAgICAgIHNldEVycm9yOiBhY3Rpb24sXG4gICAgfSk7XG4gICAgXG4gICAgbG9nZ2VyLmRlYnVnKCdJbml0aWFsaXplZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgdGhlIFN0b2NrZmlzaCBlbmdpbmVcbiAgICovXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuaXNJbml0aWFsaXplZCkge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdBbHJlYWR5IGluaXRpYWxpemVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXppbmcgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgICBhd2FpdCB0aGlzLmNvb3JkaW5hdG9yLmluaXRpYWxpemUoKTtcbiAgICAgIFxuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzSW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnSW5pdGlhbGl6YXRpb24gY29tcGxldGUnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignSW5pdGlhbGl6YXRpb24gZXJyb3I6JywgZXJyKTtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGBGYWlsZWQgdG8gaW5pdGlhbGl6ZSBlbmdpbmU6ICR7ZXJyfWA7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgZW5naW5lIHNldHRpbmdzXG4gICAqL1xuICBjb25maWd1cmUob3B0aW9uczogeyBtdWx0aVBWPzogbnVtYmVyOyBkZXB0aD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdDb25maWd1cmluZzonLCBvcHRpb25zKTtcbiAgICB0aGlzLmNvb3JkaW5hdG9yLmNvbmZpZ3VyZSgnbW92ZScsIG9wdGlvbnMpO1xuICAgIHRoaXMuY29vcmRpbmF0b3IuY29uZmlndXJlKCdhbmFseXNpcycsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuYWx5emUgYSBwb3NpdGlvbiBhbmQgY2xhc3NpZnkgbW92ZXNcbiAgICovXG4gIGFzeW5jIGFuYWx5emVQb3NpdGlvbihcbiAgICBmZW46IHN0cmluZyxcbiAgICBkZXB0aCA9IDIwLFxuICAgIG11bHRpUFYgPSAxMixcbiAgICBwdXJwb3NlOiBBbmFseXNpc1B1cnBvc2UgPSAnYmFja2dyb3VuZCcsXG4gICk6IFByb21pc2U8UG9zaXRpb25BbmFseXNpc1Jlc3VsdD4ge1xuICAgIGxvZ2dlci5kZWJ1ZygnYW5hbHl6ZVBvc2l0aW9uIGNhbGxlZCcsIHsgZmVuLCBkZXB0aCwgbXVsdGlQViwgcHVycG9zZSB9KTtcbiAgICBjb25zdCBsYW5lID0gdGhpcy5nZXRMYW5lRm9yUHVycG9zZShwdXJwb3NlKTtcblxuICAgIGlmICghdGhpcy5pc0luaXRpYWxpemVkKSB7XG4gICAgICBhd2FpdCB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgY2FjaGVLZXkgPSBidWlsZEFuYWx5c2lzQ2FjaGVLZXkoZmVuLCBkZXB0aCwgbXVsdGlQVik7XG4gICAgICBjb25zdCByZXF1ZXN0SWQgPSArK3RoaXMubmV4dFJlcXVlc3RJZHNbcHVycG9zZV07XG4gICAgICB0aGlzLmxhdGVzdFJlcXVlc3RJZHNbcHVycG9zZV0gPSByZXF1ZXN0SWQ7XG5cbiAgICAgIGNvbnN0IGFjdGl2ZVJ1biA9IHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zW3B1cnBvc2VdO1xuICAgICAgaWYgKGFjdGl2ZVJ1bikge1xuICAgICAgICBpZiAoYWN0aXZlUnVuLmNhY2hlS2V5ID09PSBjYWNoZUtleSkge1xuICAgICAgICAgIGNvbnN0IHNoYXJlZFJlc3VsdCA9IGF3YWl0IGFjdGl2ZVJ1bi5wcm9taXNlO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5zaGFyZWRSZXN1bHQsXG4gICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICBwdXJwb3NlLFxuICAgICAgICAgICAgaWdub3JlZDogaXNTdGFsZUFuYWx5c2lzUmVxdWVzdChyZXF1ZXN0SWQsIHRoaXMubGF0ZXN0UmVxdWVzdElkc1twdXJwb3NlXSkgfHwgc2hhcmVkUmVzdWx0Lmlnbm9yZWQsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwdXJwb3NlID09PSAnZW5naW5lTW92ZScpIHtcbiAgICAgICAgICB0aGlzLmludmFsaWRhdGVQdXJwb3NlUmVxdWVzdChwdXJwb3NlKTtcbiAgICAgICAgICB0aGlzLmNvb3JkaW5hdG9yLnN0b3AobGFuZSk7XG4gICAgICAgICAgYXdhaXQgYWN0aXZlUnVuLnByb21pc2UuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwdXJwb3NlID09PSAnYmFja2dyb3VuZCcpIHtcbiAgICAgICAgICBhd2FpdCBhY3RpdmVSdW4ucHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRMYW5lQW5hbHl6aW5nKHB1cnBvc2UsIHRydWUpO1xuICAgICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICAgICAgaWYgKHB1cnBvc2UgPT09ICdlbmdpbmVNb3ZlJykge1xuICAgICAgICAgIHRoaXMuYW5hbHl6ZWRNb3ZlcyA9IFtdO1xuICAgICAgICAgIHRoaXMubGFzdFBpY2tlZE1vdmUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcnVuUHJvbWlzZSA9IHRoaXMucGVyZm9ybVBvc2l0aW9uQW5hbHlzaXMoe1xuICAgICAgICBmZW4sXG4gICAgICAgIGRlcHRoLFxuICAgICAgICBtdWx0aVBWLFxuICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICBwdXJwb3NlLFxuICAgICAgICBsYW5lLFxuICAgICAgfSk7XG4gICAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuc1twdXJwb3NlXSA9IHtcbiAgICAgICAgY2FjaGVLZXksXG4gICAgICAgIGZlbixcbiAgICAgICAgcHVycG9zZSxcbiAgICAgICAgcHJvbWlzZTogcnVuUHJvbWlzZSxcbiAgICAgIH07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBydW5Qcm9taXNlO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zW3B1cnBvc2VdPy5wcm9taXNlID09PSBydW5Qcm9taXNlKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVBbmFseXNpc1J1bnNbcHVycG9zZV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0FuYWx5c2lzIGVycm9yOicsIGVycik7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBgQW5hbHlzaXMgZmFpbGVkOiAke2Vycn1gO1xuICAgICAgICB0aGlzLnNldExhbmVBbmFseXppbmcocHVycG9zZSwgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBpY2sgYSBtb3ZlIGZyb20gdGhlIGFuYWx5emVkIG1vdmVzIHVzaW5nIGJ1Y2tldCBjb25maWd1cmF0aW9uXG4gICAqL1xuICBwaWNrTW92ZUZyb21BbmFseXNpcyhcbiAgICBhbmFseXNpczogUG9zaXRpb25BbmFseXNpc1Jlc3VsdCxcbiAgICBjb25maWc6IEJ1Y2tldENvbmZpZyxcbiAgICBjb250ZXh0OiBNb3ZlU2VsZWN0aW9uQ29udGV4dCxcbiAgKTogUGlja2VkTW92ZVJlc3VsdCB8IG51bGwge1xuICAgIGxvZ2dlci5kZWJ1ZygncGlja01vdmVGcm9tQW5hbHlzaXMgY2FsbGVkJywge1xuICAgICAgYW5hbHl6ZWRNb3Zlc0NvdW50OiBhbmFseXNpcy5tb3Zlcy5sZW5ndGgsXG4gICAgICBjb25maWcgXG4gICAgfSk7XG4gICAgXG4gICAgaWYgKGFuYWx5c2lzLmlnbm9yZWQgfHwgYW5hbHlzaXMubW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBsb2dnZXIuZGVidWcoJ05vIGFuYWx5emVkIG1vdmVzIGF2YWlsYWJsZScpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcmFuZG9tU291cmNlID0gZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlRGV0ZXJtaW5pc3RpY1JuZ1xuICAgICAgPyBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2UoXG4gICAgICAgICAgYnVpbGREZXRlcm1pbmlzdGljU2VlZCh7XG4gICAgICAgICAgICBnYW1lU3RhcnRGZW46IGNvbnRleHQuZ2FtZVN0YXJ0RmVuLFxuICAgICAgICAgICAgY3VycmVudEZlbjogY29udGV4dC5mZW4sXG4gICAgICAgICAgICBtb3ZlQ291bnQ6IGNvbnRleHQubW92ZUNvdW50LFxuICAgICAgICAgICAgc2lkZVRvTW92ZTogY29udGV4dC5zaWRlVG9Nb3ZlLFxuICAgICAgICAgICAgcGVyc29uYTogY29udGV4dC5wZXJzb25hLFxuICAgICAgICAgIH0pLFxuICAgICAgICApXG4gICAgICA6IGNyZWF0ZUxlZ2FjeVJhbmRvbVNvdXJjZSgpO1xuXG4gICAgbGV0IGVmZmVjdGl2ZUNvbmZpZzogQnVja2V0Q29uZmlnID0geyAuLi5jb25maWcgfTtcblxuICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VQb3NpdGlvbkNvbXBsZXhpdHkpIHtcbiAgICAgIGVmZmVjdGl2ZUNvbmZpZyA9IGFkanVzdEJ1Y2tldENvbmZpZ0ZvckNvbXBsZXhpdHkoZWZmZWN0aXZlQ29uZmlnLCBhbmFseXNpcy5jb21wbGV4aXR5KTtcbiAgICB9XG5cbiAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlUGVyc29uYUJlaGF2aW9yQmlhcykge1xuICAgICAgZWZmZWN0aXZlQ29uZmlnID0gYXBwbHlQZXJzb25hQnVja2V0QmlhcyhlZmZlY3RpdmVDb25maWcsIGNvbnRleHQucGVyc29uYSkgYXMgQnVja2V0Q29uZmlnO1xuICAgIH1cblxuICAgIGlmIChjYW5Vc2VCcmlsbGlhbnRNb3ZlQnVkZ2V0KGNvbnRleHQubW92ZUNvdW50LCBjb250ZXh0LmZlbikpIHtcbiAgICAgIGNvbnN0IGJyaWxsaWFudENhbmRpZGF0ZXMgPSBnZXRCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlcyhjb250ZXh0LmZlbiwgYW5hbHlzaXMubW92ZXMpO1xuICAgICAgY29uc3Qgc2hvdWxkUGlja0JyaWxsaWFudCA9IGJyaWxsaWFudENhbmRpZGF0ZXMubGVuZ3RoID4gMCAmJiByYW5kb21Tb3VyY2UubmV4dCgpIDwgMC4zNTtcblxuICAgICAgaWYgKHNob3VsZFBpY2tCcmlsbGlhbnQpIHtcbiAgICAgICAgY29uc3QgYnJpbGxpYW50TW92ZSA9IHBpY2tCcmlsbGlhbnRNb3ZlKGJyaWxsaWFudENhbmRpZGF0ZXMsIHJhbmRvbVNvdXJjZSk7XG5cbiAgICAgICAgaWYgKGJyaWxsaWFudE1vdmUpIHtcbiAgICAgICAgICBjb25zdCBicmlsbGlhbnRSZXN1bHQgPSB7XG4gICAgICAgICAgICBtb3ZlOiBicmlsbGlhbnRNb3ZlLFxuICAgICAgICAgICAgYnVja2V0OiBicmlsbGlhbnRNb3ZlLmJ1Y2tldCxcbiAgICAgICAgICAgIGlzQnJpbGxpYW50OiB0cnVlLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RQaWNrZWRNb3ZlID0gYnJpbGxpYW50UmVzdWx0O1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIGJyaWxsaWFudFJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGJ1Y2tldFNlbGVjdGlvbiA9IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uXG4gICAgICA/IHBpY2tCdWNrZXRXaXRoQ2xvc2VzdEZhbGxiYWNrKGFuYWx5c2lzLm1vdmVzLCBlZmZlY3RpdmVDb25maWcsICgpID0+IHJhbmRvbVNvdXJjZS5uZXh0KCkpXG4gICAgICA6IHBpY2tCdWNrZXRMZWdhY3koYW5hbHlzaXMubW92ZXMsIGVmZmVjdGl2ZUNvbmZpZywgKCkgPT4gcmFuZG9tU291cmNlLm5leHQoKSk7XG5cbiAgICBpZiAoIWJ1Y2tldFNlbGVjdGlvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZWN0ZWRNb3ZlID0gZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlUGVyc29uYUJlaGF2aW9yQmlhc1xuICAgICAgPyBwaWNrUGVyc29uYUJpYXNlZE1vdmUoY29udGV4dC5mZW4sIGJ1Y2tldFNlbGVjdGlvbi5tb3ZlcywgY29udGV4dC5wZXJzb25hLCByYW5kb21Tb3VyY2UpXG4gICAgICA6IHBpY2tSYW5kb21Nb3ZlRnJvbUJ1Y2tldChidWNrZXRTZWxlY3Rpb24sICgpID0+IHJhbmRvbVNvdXJjZS5uZXh0KCkpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgbW92ZTogc2VsZWN0ZWRNb3ZlLFxuICAgICAgYnVja2V0OiBidWNrZXRTZWxlY3Rpb24uYnVja2V0LFxuICAgICAgaXNCcmlsbGlhbnQ6IGZhbHNlLFxuICAgIH07XG4gICAgbG9nZ2VyLmRlYnVnKCdQaWNrZWQgbW92ZTonLCByZXN1bHQpO1xuICAgIFxuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMubGFzdFBpY2tlZE1vdmUgPSByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgY3VycmVudCBhbmFseXNpc1xuICAgKi9cbiAgc3RvcEFuYWx5c2lzKCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1Zygnc3RvcEFuYWx5c2lzIGNhbGxlZCcpO1xuICAgIHRoaXMuY29vcmRpbmF0b3Iuc3RvcCgpO1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMuaXNNb3ZlTGFuZUFuYWx5emluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5pc0JhY2tncm91bmRBbmFseXppbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgICB0aGlzLmludmFsaWRhdGVQZW5kaW5nUmVxdWVzdHMoKTtcbiAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVucy5lbmdpbmVNb3ZlID0gbnVsbDtcbiAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVucy5iYWNrZ3JvdW5kID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIG5ldyBnYW1lXG4gICAqL1xuICBuZXdHYW1lKCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZygnbmV3R2FtZSBjYWxsZWQnKTtcbiAgICB0aGlzLmNvb3JkaW5hdG9yLm5ld0dhbWUoKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZygncmVzdGFydCBjYWxsZWQnKTtcbiAgICB0aGlzLmNvb3JkaW5hdG9yLnJlc3RhcnQoKTtcbiAgICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgc3RhdGVcbiAgICovXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZygncmVzZXQgY2FsbGVkJyk7XG4gICAgdGhpcy5jb29yZGluYXRvci5zdG9wKCk7XG4gICAgdGhpcy5pbnZhbGlkYXRlUGVuZGluZ1JlcXVlc3RzKCk7XG4gICAgdGhpcy5hY3RpdmVBbmFseXNpc1J1bnMuZW5naW5lTW92ZSA9IG51bGw7XG4gICAgdGhpcy5hY3RpdmVBbmFseXNpc1J1bnMuYmFja2dyb3VuZCA9IG51bGw7XG4gICAgdGhpcy5hbmFseXplZE1vdmVzID0gW107XG4gICAgdGhpcy5sYXN0UGlja2VkTW92ZSA9IG51bGw7XG4gICAgdGhpcy5sYXN0Q29tcGxleGl0eSA9IG51bGw7XG4gICAgdGhpcy5sYXN0QW5hbHlzaXNGcm9tQ2FjaGUgPSBmYWxzZTtcbiAgICB0aGlzLmxhc3RBbmFseXNpc1B1cnBvc2UgPSBudWxsO1xuICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgIHRoaXMuaXNNb3ZlTGFuZUFuYWx5emluZyA9IGZhbHNlO1xuICAgIHRoaXMuaXNCYWNrZ3JvdW5kQW5hbHl6aW5nID0gZmFsc2U7XG4gICAgdGhpcy5pc0luaXRpYWxpemluZyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBlcnJvciBtZXNzYWdlXG4gICAqL1xuICBzZXRFcnJvcihtZXNzYWdlOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5lcnJvciA9IG1lc3NhZ2U7XG4gIH1cblxuICAvKipcbiAgICogR2V0IG1vdmUgc3RhdGlzdGljcyBieSBidWNrZXRcbiAgICovXG4gIGdldCBtb3ZlU3RhdHMoKTogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICAgIHJldHVybiBnZXRNb3ZlU3RhdHModGhpcy5hbmFseXplZE1vdmVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbW92ZXMgZ3JvdXBlZCBieSBidWNrZXRcbiAgICovXG4gIGdldCBtb3Zlc0J5QnVja2V0KCk6IE1hcDxNb3ZlQnVja2V0LCBDbGFzc2lmaWVkTW92ZVtdPiB7XG4gICAgcmV0dXJuIGdyb3VwTW92ZXNCeUJ1Y2tldCh0aGlzLmFuYWx5emVkTW92ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYmVzdCBtb3ZlIChpZiBhdmFpbGFibGUpXG4gICAqL1xuICBnZXQgYmVzdE1vdmUoKTogQ2xhc3NpZmllZE1vdmUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5hbmFseXplZE1vdmVzLmxlbmd0aCA+IDAgPyB0aGlzLmFuYWx5emVkTW92ZXNbMF0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZXJlIGFyZSBhbmFseXplZCBtb3Zlc1xuICAgKi9cbiAgZ2V0IGhhc0FuYWx5emVkTW92ZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYW5hbHl6ZWRNb3Zlcy5sZW5ndGggPiAwO1xuICB9XG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBlbmdpbmVcbiAgICovXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdkZXN0cm95IGNhbGxlZCcpO1xuICAgIHRoaXMuY29vcmRpbmF0b3IuZGVzdHJveSgpO1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwZXJmb3JtUG9zaXRpb25BbmFseXNpcyhvcHRpb25zOiB7XG4gICAgZmVuOiBzdHJpbmc7XG4gICAgZGVwdGg6IG51bWJlcjtcbiAgICBtdWx0aVBWOiBudW1iZXI7XG4gICAgY2FjaGVLZXk6IHN0cmluZztcbiAgICByZXF1ZXN0SWQ6IG51bWJlcjtcbiAgICBwdXJwb3NlOiBBbmFseXNpc1B1cnBvc2U7XG4gICAgbGFuZTogRW5naW5lTGFuZTtcbiAgfSk6IFByb21pc2U8UG9zaXRpb25BbmFseXNpc1Jlc3VsdD4ge1xuICAgIGNvbnN0IHsgZmVuLCBkZXB0aCwgbXVsdGlQViwgY2FjaGVLZXksIHJlcXVlc3RJZCwgcHVycG9zZSwgbGFuZSB9ID0gb3B0aW9ucztcbiAgICBsZXQgY2FjaGVkQ2xhc3NpZmllZE1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdIHwgdW5kZWZpbmVkO1xuICAgIGxldCBmcm9tQ2FjaGUgPSBmYWxzZTtcbiAgICBsZXQgbW92ZXM6IEFuYWx5emVkTW92ZVtdID0gW107XG5cbiAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlTW92ZUFuYWx5c2lzQ2FjaGUpIHtcbiAgICAgIGNvbnN0IGNhY2hlZCA9IGFuYWx5c2lzQ2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICAgIGlmIChjYWNoZWQpIHtcbiAgICAgICAgbW92ZXMgPSBjYWNoZWQubW92ZXM7XG4gICAgICAgIGNhY2hlZENsYXNzaWZpZWRNb3ZlcyA9IGNhY2hlZC5jbGFzc2lmaWVkTW92ZXM7XG4gICAgICAgIGZyb21DYWNoZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5jb29yZGluYXRvci5jb25maWd1cmUobGFuZSwgeyBkZXB0aCwgbXVsdGlQViB9KTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnU3RhcnRpbmcgYW5hbHlzaXMuLi4nKTtcbiAgICAgIG1vdmVzID0gYXdhaXQgdGhpcy5jb29yZGluYXRvci5hbmFseXplUG9zaXRpb24obGFuZSwgZmVuKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnQW5hbHlzaXMgY29tcGxldGUsIGdvdCcsIG1vdmVzLmxlbmd0aCwgJ21vdmVzJyk7XG5cbiAgICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VNb3ZlQW5hbHlzaXNDYWNoZSkge1xuICAgICAgICBhbmFseXNpc0NhY2hlLnNldCh7XG4gICAgICAgICAga2V5OiBjYWNoZUtleSxcbiAgICAgICAgICBtb3ZlcyxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIuZGVidWcoJ1VzaW5nIGNhY2hlZCBhbmFseXNpcyBmb3IgY3VycmVudCBwb3NpdGlvbicpO1xuICAgIH1cblxuICAgIGNvbnN0IGNsYXNzaWZpZWQgPSBjYWNoZWRDbGFzc2lmaWVkTW92ZXMgPz8gY2xhc3NpZnlNb3Zlcyhtb3Zlcyk7XG4gICAgY29uc3QgY29tcGxleGl0eSA9IGNhbGN1bGF0ZVBvc2l0aW9uQ29tcGxleGl0eShtb3Zlcyk7XG4gICAgY29uc3QgaWdub3JlZCA9IGlzU3RhbGVBbmFseXNpc1JlcXVlc3QocmVxdWVzdElkLCB0aGlzLmxhdGVzdFJlcXVlc3RJZHNbcHVycG9zZV0pO1xuXG4gICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZU1vdmVBbmFseXNpc0NhY2hlICYmIG1vdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGFuYWx5c2lzQ2FjaGUuc2V0KHtcbiAgICAgICAga2V5OiBjYWNoZUtleSxcbiAgICAgICAgbW92ZXMsXG4gICAgICAgIGNsYXNzaWZpZWRNb3ZlczogY2xhc3NpZmllZCxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFpZ25vcmVkKSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMubGFzdEFuYWx5c2lzRnJvbUNhY2hlID0gZnJvbUNhY2hlO1xuICAgICAgICB0aGlzLmxhc3RBbmFseXNpc1B1cnBvc2UgPSBwdXJwb3NlO1xuICAgICAgICBpZiAocHVycG9zZSA9PT0gJ2VuZ2luZU1vdmUnKSB7XG4gICAgICAgICAgdGhpcy5hbmFseXplZE1vdmVzID0gY2xhc3NpZmllZDtcbiAgICAgICAgICB0aGlzLmxhc3RDb21wbGV4aXR5ID0gY29tcGxleGl0eTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldExhbmVBbmFseXppbmcocHVycG9zZSwgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuc1twdXJwb3NlXT8ucHVycG9zZSA9PT0gcHVycG9zZSkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLnNldExhbmVBbmFseXppbmcocHVycG9zZSwgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlcXVlc3RJZCxcbiAgICAgIGFuYWx5emVkRmVuOiBmZW4sXG4gICAgICBtb3ZlczogY2xhc3NpZmllZCxcbiAgICAgIGNvbXBsZXhpdHksXG4gICAgICBpZ25vcmVkLFxuICAgICAgZnJvbUNhY2hlLFxuICAgICAgcHVycG9zZSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0IGFuYWx5c2lzU3RhdHVzTGFiZWwoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5lcnJvcikge1xuICAgICAgcmV0dXJuICdFbmdpbmUgZXJyb3InO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzSW5pdGlhbGl6aW5nKSB7XG4gICAgICByZXR1cm4gJ1N0YXJ0aW5nIGVuZ2luZSc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNNb3ZlTGFuZUFuYWx5emluZykge1xuICAgICAgcmV0dXJuICdBbmFseXppbmcgcG9zaXRpb24nO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQmFja2dyb3VuZEFuYWx5emluZykge1xuICAgICAgcmV0dXJuICdSdW5uaW5nIGJhY2tncm91bmQgYW5hbHlzaXMnO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc0luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm4gJ05vdCBpbml0aWFsaXplZCc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubGFzdEFuYWx5c2lzUHVycG9zZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICdSZWFkeSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGFzdEFuYWx5c2lzRnJvbUNhY2hlID8gJ1JlYWR5IChjYWNoZSB3YXJtKScgOiAnUmVhZHknO1xuICB9XG5cbiAgZ2V0IGlzQW5hbHl6aW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzTW92ZUxhbmVBbmFseXppbmcgfHwgdGhpcy5pc0JhY2tncm91bmRBbmFseXppbmc7XG4gIH1cblxuICBnZXQgaXNNb3ZlTGFuZUJ1c3koKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNJbml0aWFsaXppbmcgfHwgdGhpcy5pc01vdmVMYW5lQW5hbHl6aW5nO1xuICB9XG5cbiAgZ2V0IGlzQmFja2dyb3VuZExhbmVCdXN5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzQmFja2dyb3VuZEFuYWx5emluZztcbiAgfVxuXG4gIHByaXZhdGUgaW52YWxpZGF0ZVBlbmRpbmdSZXF1ZXN0cygpOiB2b2lkIHtcbiAgICB0aGlzLmxhdGVzdFJlcXVlc3RJZHMuZW5naW5lTW92ZSA9ICsrdGhpcy5uZXh0UmVxdWVzdElkcy5lbmdpbmVNb3ZlO1xuICAgIHRoaXMubGF0ZXN0UmVxdWVzdElkcy5iYWNrZ3JvdW5kID0gKyt0aGlzLm5leHRSZXF1ZXN0SWRzLmJhY2tncm91bmQ7XG4gIH1cblxuICBwcml2YXRlIGludmFsaWRhdGVQdXJwb3NlUmVxdWVzdChwdXJwb3NlOiBBbmFseXNpc1B1cnBvc2UpOiB2b2lkIHtcbiAgICB0aGlzLmxhdGVzdFJlcXVlc3RJZHNbcHVycG9zZV0gPSArK3RoaXMubmV4dFJlcXVlc3RJZHNbcHVycG9zZV07XG4gIH1cblxuICBwcml2YXRlIGdldExhbmVGb3JQdXJwb3NlKHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSk6IEVuZ2luZUxhbmUge1xuICAgIHJldHVybiBwdXJwb3NlID09PSAnZW5naW5lTW92ZScgPyAnbW92ZScgOiAnYW5hbHlzaXMnO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRMYW5lQW5hbHl6aW5nKHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSwgYW5hbHl6aW5nOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHB1cnBvc2UgPT09ICdlbmdpbmVNb3ZlJykge1xuICAgICAgdGhpcy5pc01vdmVMYW5lQW5hbHl6aW5nID0gYW5hbHl6aW5nO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuaXNCYWNrZ3JvdW5kQW5hbHl6aW5nID0gYW5hbHl6aW5nO1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGVuZ2luZVZpZXdNb2RlbCA9IG5ldyBFbmdpbmVWaWV3TW9kZWwoKTtcbiIsICIvKipcbiAqIENvbmZpZyBWaWV3TW9kZWxcbiAqIFZpZXdNb2RlbCBsYXllciAtIE1vYlggc3RvcmUgZm9yIGJ1Y2tldCBjb25maWd1cmF0aW9uXG4gKi9cblxuaW1wb3J0IHsgbWFrZUF1dG9PYnNlcnZhYmxlLCBhY3Rpb24sIHJlYWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBCdWNrZXRDb25maWcsIE1vdmVCdWNrZXQsIERFRkFVTFRfQlVDS0VUX0NPTkZJRywgTW92ZVF1YWxpdHlQcmVzZXRJZCwgTU9WRV9RVUFMSVRZX1BSRVNFVFMgfSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuaW1wb3J0IHsgRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSB9IGZyb20gJy4uL2VuZ2luZS9mZWF0dXJlT3B0aW9ucyc7XG5pbXBvcnQgeyBub3JtYWxpemVCdWNrZXRDb25maWcsIHZhbGlkYXRlQnVja2V0Q29uZmlnIH0gZnJvbSAnLi4vZW5naW5lL21vdmVQaWNrZXInO1xuaW1wb3J0IHsgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcblxuaW50ZXJmYWNlIFBlcnNpc3RlZEVuZ2luZUNvbmZpZyB7XG4gIGJ1Y2tldENvbmZpZzogQnVja2V0Q29uZmlnO1xuICBjdXJyZW50UHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsO1xuICBkZXB0aDogbnVtYmVyO1xuICBtdWx0aVBWOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBDb25maWdWaWV3TW9kZWwge1xuICBidWNrZXRDb25maWc6IEJ1Y2tldENvbmZpZyA9IHsgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHIH07XG4gIC8qKiBJZCBvZiB0aGUgYWN0aXZlIHByZXNldCwgb3IgbnVsbCBpZiB1c2luZyBjdXN0b20gZGlzdHJpYnV0aW9uICovXG4gIGN1cnJlbnRQcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGwgPSAnbWVkaXVtJztcbiAgZGVwdGggPSA4O1xuICBtdWx0aVBWID0gMTI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldEJ1Y2tldFZhbHVlOiBhY3Rpb24sXG4gICAgICBzZXRCdWNrZXRDb25maWc6IGFjdGlvbixcbiAgICAgIGFwcGx5UHJvZmlsZVNuYXBzaG90OiBhY3Rpb24sXG4gICAgICBhcHBseVByZXNldDogYWN0aW9uLFxuICAgICAgcmVzZXRUb0RlZmF1bHRzOiBhY3Rpb24sXG4gICAgICBub3JtYWxpemVDb25maWc6IGFjdGlvbixcbiAgICAgIHNldERlcHRoOiBhY3Rpb24sXG4gICAgICBzZXRNdWx0aVBWOiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc3RvcmVGcm9tU3RvcmFnZSgpO1xuXG4gICAgcmVhY3Rpb24oXG4gICAgICAoKSA9PiAoe1xuICAgICAgICBidWNrZXRDb25maWc6IHRoaXMuYnVja2V0Q29uZmlnLFxuICAgICAgICBjdXJyZW50UHJlc2V0SWQ6IHRoaXMuY3VycmVudFByZXNldElkLFxuICAgICAgICBkZXB0aDogdGhpcy5kZXB0aCxcbiAgICAgICAgbXVsdGlQVjogdGhpcy5tdWx0aVBWLFxuICAgICAgICBwZXJzaXN0RW5naW5lQ29uZmlnOiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5wZXJzaXN0RW5naW5lQ29uZmlnLFxuICAgICAgfSksXG4gICAgICAoeyBwZXJzaXN0RW5naW5lQ29uZmlnIH0pID0+IHtcbiAgICAgICAgaWYgKCFwZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZFN0b3JhZ2UoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICAgIH0sXG4gICAgICB7IGZpcmVJbW1lZGlhdGVseTogdHJ1ZSB9LFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBwZXJjZW50YWdlIHZhbHVlIGZvciBhIHNwZWNpZmljIGJ1Y2tldFxuICAgKi9cbiAgc2V0QnVja2V0VmFsdWUoYnVja2V0OiBNb3ZlQnVja2V0LCB2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY2xhbXBlZFZhbHVlID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCB2YWx1ZSkpO1xuICAgIHRoaXMuY3VycmVudFByZXNldElkID0gbnVsbDsgLy8gc3dpdGNoaW5nIHRvIGN1c3RvbVxuICAgIHRoaXMuYnVja2V0Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5idWNrZXRDb25maWcsXG4gICAgICBbYnVja2V0XTogY2xhbXBlZFZhbHVlLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBmdWxsIGJ1Y2tldCBjb25maWcgKGUuZy4gd2hlbiBhcHBseWluZyBhIHByZXNldClcbiAgICovXG4gIHNldEJ1Y2tldENvbmZpZyhjb25maWc6IEJ1Y2tldENvbmZpZyk6IHZvaWQge1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5jb25maWcgfTtcbiAgfVxuXG4gIGFwcGx5UHJvZmlsZVNuYXBzaG90KHNuYXBzaG90OiB7XG4gICAgYnVja2V0Q29uZmlnOiBCdWNrZXRDb25maWc7XG4gICAgY3VycmVudFByZXNldElkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbDtcbiAgICBkZXB0aDogbnVtYmVyO1xuICAgIG11bHRpUFY6IG51bWJlcjtcbiAgfSk6IHZvaWQge1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5zbmFwc2hvdC5idWNrZXRDb25maWcgfTtcbiAgICB0aGlzLmN1cnJlbnRQcmVzZXRJZCA9IHNuYXBzaG90LmN1cnJlbnRQcmVzZXRJZDtcbiAgICB0aGlzLmRlcHRoID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMzAsIHNuYXBzaG90LmRlcHRoKSk7XG4gICAgdGhpcy5tdWx0aVBWID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMjAsIHNuYXBzaG90Lm11bHRpUFYpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBhIHByZWRlZmluZWQgbW92ZSBxdWFsaXR5IHByZXNldCBieSBpZFxuICAgKi9cbiAgYXBwbHlQcmVzZXQocHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQpOiB2b2lkIHtcbiAgICBjb25zdCBwcmVzZXQgPSBNT1ZFX1FVQUxJVFlfUFJFU0VUUy5maW5kKHAgPT4gcC5pZCA9PT0gcHJlc2V0SWQpO1xuICAgIGlmIChwcmVzZXQpIHtcbiAgICAgIHRoaXMuY3VycmVudFByZXNldElkID0gcHJlc2V0SWQ7XG4gICAgICB0aGlzLmJ1Y2tldENvbmZpZyA9IHsgLi4ucHJlc2V0LmNvbmZpZyB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBidWNrZXQgY29uZmlndXJhdGlvbiB0byBkZWZhdWx0cyAobWVkaXVtIHByZXNldClcbiAgICovXG4gIHJlc2V0VG9EZWZhdWx0cygpOiB2b2lkIHtcbiAgICB0aGlzLmN1cnJlbnRQcmVzZXRJZCA9ICdtZWRpdW0nO1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemUgdGhlIGNvbmZpZ3VyYXRpb24gc28gcGVyY2VudGFnZXMgc3VtIHRvIDEwMFxuICAgKi9cbiAgbm9ybWFsaXplQ29uZmlnKCk6IHZvaWQge1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0gbm9ybWFsaXplQnVja2V0Q29uZmlnKHRoaXMuYnVja2V0Q29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYW5hbHlzaXMgZGVwdGhcbiAgICovXG4gIHNldERlcHRoKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmRlcHRoID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMzAsIHZhbHVlKSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IE11bHRpUFYgdmFsdWVcbiAgICovXG4gIHNldE11bHRpUFYodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMubXVsdGlQViA9IE1hdGgubWF4KDEsIE1hdGgubWluKDIwLCB2YWx1ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0b3RhbCBwZXJjZW50YWdlIHN1bVxuICAgKi9cbiAgZ2V0IHRvdGFsUGVyY2VudGFnZSgpOiBudW1iZXIge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuYnVja2V0Q29uZmlnKS5yZWR1Y2UoKHN1bSwgdmFsKSA9PiBzdW0gKyB2YWwsIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNvbmZpZ3VyYXRpb24gaXMgdmFsaWQgKHN1bXMgdG8gMTAwKVxuICAgKi9cbiAgZ2V0IGlzVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyB2YWxpZCB9ID0gdmFsaWRhdGVCdWNrZXRDb25maWcodGhpcy5idWNrZXRDb25maWcpO1xuICAgIHJldHVybiB2YWxpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHZhbGlkYXRpb24gc3RhdGVcbiAgICovXG4gIGdldCB2YWxpZGF0aW9uU3RhdGUoKTogeyB2YWxpZDogYm9vbGVhbjsgdG90YWw6IG51bWJlciB9IHtcbiAgICByZXR1cm4gdmFsaWRhdGVCdWNrZXRDb25maWcodGhpcy5idWNrZXRDb25maWcpO1xuICB9XG5cbiAgZ2V0IGFjdGl2ZVBlcnNvbmFJZCgpOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFByZXNldElkO1xuICB9XG5cbiAgZ2V0IGFjdGl2ZVBlcnNvbmFMYWJlbCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmN1cnJlbnRQcmVzZXRJZCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICdDdXN0b20nO1xuICAgIH1cblxuICAgIHJldHVybiBNT1ZFX1FVQUxJVFlfUFJFU0VUUy5maW5kKChwcmVzZXQpID0+IHByZXNldC5pZCA9PT0gdGhpcy5jdXJyZW50UHJlc2V0SWQpPy5sYWJlbCA/PyAnQ3VzdG9tJztcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKEVOR0lORV9DT05GSUdfU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKCFzYXZlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzIFBhcnRpYWw8UGVyc2lzdGVkRW5naW5lQ29uZmlnPjtcbiAgICAgIGlmIChwYXJzZWQuYnVja2V0Q29uZmlnKSB7XG4gICAgICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcsIC4uLnBhcnNlZC5idWNrZXRDb25maWcgfTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJzZWQuY3VycmVudFByZXNldElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UHJlc2V0SWQgPSBwYXJzZWQuY3VycmVudFByZXNldElkO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXJzZWQuZGVwdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHRoaXMuZGVwdGggPSBNYXRoLm1heCgxLCBNYXRoLm1pbigzMCwgcGFyc2VkLmRlcHRoKSk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhcnNlZC5tdWx0aVBWID09PSAnbnVtYmVyJykge1xuICAgICAgICB0aGlzLm11bHRpUFYgPSBNYXRoLm1heCgxLCBNYXRoLm1pbigyMCwgcGFyc2VkLm11bHRpUFYpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0NvbmZpZ1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHJlc3RvcmUgZW5naW5lIGNvbmZpZzonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0VG9TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzbmFwc2hvdDogUGVyc2lzdGVkRW5naW5lQ29uZmlnID0ge1xuICAgICAgICBidWNrZXRDb25maWc6IHRoaXMuYnVja2V0Q29uZmlnLFxuICAgICAgICBjdXJyZW50UHJlc2V0SWQ6IHRoaXMuY3VycmVudFByZXNldElkLFxuICAgICAgICBkZXB0aDogdGhpcy5kZXB0aCxcbiAgICAgICAgbXVsdGlQVjogdGhpcy5tdWx0aVBWLFxuICAgICAgfTtcblxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSwgSlNPTi5zdHJpbmdpZnkoc25hcHNob3QpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0NvbmZpZ1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHBlcnNpc3QgZW5naW5lIGNvbmZpZzonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclBlcnNpc3RlZFN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKEVOR0lORV9DT05GSUdfU1RPUkFHRV9LRVkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQ29uZmlnVmlld01vZGVsXSBGYWlsZWQgdG8gY2xlYXIgZW5naW5lIGNvbmZpZyBzdG9yYWdlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgY29uZmlnVmlld01vZGVsID0gbmV3IENvbmZpZ1ZpZXdNb2RlbCgpO1xuIiwgImltcG9ydCB7IGFjdGlvbiwgbWFrZUF1dG9PYnNlcnZhYmxlIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBNb3ZlUXVhbGl0eVByZXNldElkIH0gZnJvbSAnLi4vZW5naW5lL3R5cGVzJztcblxudHlwZSBTZXR0aW5nc1RhYklkID1cbiAgfCAnZ2VuZXJhbCdcbiAgfCAnZW5naW5lJ1xuICB8ICdwZXJzb25hbGl0eSdcbiAgfCAnYnJpbGxpYW50J1xuICB8ICdhZHZhbmNlZCdcbiAgfCAnZGVidWcnXG4gIHwgJ2Fib3V0JztcblxudHlwZSBBbmltYXRpb25TcGVlZCA9ICdzbG93JyB8ICdub3JtYWwnIHwgJ2Zhc3QnO1xudHlwZSBUaGVtZU1vZGUgPSAnZGFyaycgfCAnbGlnaHQnIHwgJ21pbmltYWwnIHwgJ3BlcnNvbmEnO1xudHlwZSBCb2FyZFNpemVQcmVzZXQgPSAnc21hbGwnIHwgJ21lZGl1bScgfCAnbGFyZ2UnIHwgJ3hsYXJnZSc7XG50eXBlIEF1dG9QbGF5U3BlZWQgPSAnc2xvdycgfCAnbm9ybWFsJyB8ICdmYXN0JztcblxuY29uc3QgQk9BUkRfU0laRV9QUkVTRVRfUElYRUxTOiBSZWNvcmQ8Qm9hcmRTaXplUHJlc2V0LCBudW1iZXI+ID0ge1xuICBzbWFsbDogNDgwLFxuICBtZWRpdW06IDY0MCxcbiAgbGFyZ2U6IDgwMCxcbiAgeGxhcmdlOiA5NjAsXG59O1xuXG5pbnRlcmZhY2UgUGVyc2lzdGVkVWlQcmVmZXJlbmNlcyB7XG4gIGJhc2ljTW9kZTogYm9vbGVhbjtcbiAgYW5pbWF0aW9uU3BlZWQ6IEFuaW1hdGlvblNwZWVkO1xuICBzb3VuZEVuYWJsZWQ6IGJvb2xlYW47XG4gIHNvdW5kTXV0ZWQ6IGJvb2xlYW47XG4gIHNvdW5kVm9sdW1lOiBudW1iZXI7XG4gIGF1dG9QbGF5U3BlZWQ6IEF1dG9QbGF5U3BlZWQ7XG4gIHRoZW1lTW9kZTogVGhlbWVNb2RlO1xuICBib2FyZFNpemVQcmVzZXQ6IEJvYXJkU2l6ZVByZXNldDtcbiAgc2VsZWN0ZWRTZXR0aW5nc1RhYjogU2V0dGluZ3NUYWJJZDtcbn1cblxuY29uc3QgVUlfUFJFRkVSRU5DRVNfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX3VpX3ByZWZlcmVuY2VzJztcblxuY29uc3QgREVGQVVMVF9VSV9QUkVGRVJFTkNFUzogUGVyc2lzdGVkVWlQcmVmZXJlbmNlcyA9IHtcbiAgYmFzaWNNb2RlOiB0cnVlLFxuICBhbmltYXRpb25TcGVlZDogJ25vcm1hbCcsXG4gIHNvdW5kRW5hYmxlZDogdHJ1ZSxcbiAgc291bmRNdXRlZDogZmFsc2UsXG4gIHNvdW5kVm9sdW1lOiA3MCxcbiAgYXV0b1BsYXlTcGVlZDogJ25vcm1hbCcsXG4gIHRoZW1lTW9kZTogJ2RhcmsnLFxuICBib2FyZFNpemVQcmVzZXQ6ICdtZWRpdW0nLFxuICBzZWxlY3RlZFNldHRpbmdzVGFiOiAnZ2VuZXJhbCcsXG59O1xuXG5jb25zdCBBVVRPX1BMQVlfU1BFRURfREVMQVlTOiBSZWNvcmQ8QXV0b1BsYXlTcGVlZCwgbnVtYmVyPiA9IHtcbiAgc2xvdzogMTIwMCxcbiAgbm9ybWFsOiA3MDAsXG4gIGZhc3Q6IDM1MCxcbn07XG5cbmV4cG9ydCBjbGFzcyBVaVN0YXRlVmlld01vZGVsIHtcbiAgc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gIGJhc2ljTW9kZSA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYmFzaWNNb2RlO1xuICBhbmltYXRpb25TcGVlZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYW5pbWF0aW9uU3BlZWQ7XG4gIHNvdW5kRW5hYmxlZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc291bmRFbmFibGVkO1xuICBzb3VuZE11dGVkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZE11dGVkO1xuICBzb3VuZFZvbHVtZSA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc291bmRWb2x1bWU7XG4gIGF1dG9QbGF5U3BlZWQgPSBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmF1dG9QbGF5U3BlZWQ7XG4gIHRoZW1lTW9kZSA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMudGhlbWVNb2RlO1xuICBib2FyZFNpemVQcmVzZXQgPSBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmJvYXJkU2l6ZVByZXNldDtcbiAgc2VsZWN0ZWRTZXR0aW5nc1RhYjogU2V0dGluZ3NUYWJJZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc2VsZWN0ZWRTZXR0aW5nc1RhYjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0U2V0dGluZ3NPcGVuOiBhY3Rpb24sXG4gICAgICBhcHBseVByb2ZpbGVQcmVmZXJlbmNlczogYWN0aW9uLFxuICAgICAgc2V0QmFzaWNNb2RlOiBhY3Rpb24sXG4gICAgICBzZXRBbmltYXRpb25TcGVlZDogYWN0aW9uLFxuICAgICAgc2V0U291bmRFbmFibGVkOiBhY3Rpb24sXG4gICAgICBzZXRTb3VuZE11dGVkOiBhY3Rpb24sXG4gICAgICBzZXRTb3VuZFZvbHVtZTogYWN0aW9uLFxuICAgICAgc2V0QXV0b1BsYXlTcGVlZDogYWN0aW9uLFxuICAgICAgc2V0VGhlbWVNb2RlOiBhY3Rpb24sXG4gICAgICBzZXRCb2FyZFNpemVQcmVzZXQ6IGFjdGlvbixcbiAgICAgIHNldFNlbGVjdGVkU2V0dGluZ3NUYWI6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTZXR0aW5nc09wZW4ob3BlbjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuc2V0dGluZ3NPcGVuID0gb3BlbjtcbiAgfVxuXG4gIGFwcGx5UHJvZmlsZVByZWZlcmVuY2VzKHByZWZlcmVuY2VzOiBQYXJ0aWFsPFBpY2s8UGVyc2lzdGVkVWlQcmVmZXJlbmNlcywgJ2Jhc2ljTW9kZScgfCAndGhlbWVNb2RlJz4+KTogdm9pZCB7XG4gICAgdGhpcy5iYXNpY01vZGUgPSBwcmVmZXJlbmNlcy5iYXNpY01vZGUgPz8gdGhpcy5iYXNpY01vZGU7XG4gICAgdGhpcy50aGVtZU1vZGUgPSBwcmVmZXJlbmNlcy50aGVtZU1vZGUgPz8gdGhpcy50aGVtZU1vZGU7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRCYXNpY01vZGUoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuYmFzaWNNb2RlID0gZW5hYmxlZDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldEFuaW1hdGlvblNwZWVkKHNwZWVkOiBBbmltYXRpb25TcGVlZCk6IHZvaWQge1xuICAgIHRoaXMuYW5pbWF0aW9uU3BlZWQgPSBzcGVlZDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNvdW5kRW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zb3VuZEVuYWJsZWQgPSBlbmFibGVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U291bmRNdXRlZChtdXRlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuc291bmRNdXRlZCA9IG11dGVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U291bmRWb2x1bWUodm9sdW1lOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnNvdW5kVm9sdW1lID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCBNYXRoLnJvdW5kKHZvbHVtZSkpKTtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldEF1dG9QbGF5U3BlZWQoc3BlZWQ6IEF1dG9QbGF5U3BlZWQpOiB2b2lkIHtcbiAgICB0aGlzLmF1dG9QbGF5U3BlZWQgPSBzcGVlZDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFRoZW1lTW9kZSh0aGVtZU1vZGU6IFRoZW1lTW9kZSk6IHZvaWQge1xuICAgIHRoaXMudGhlbWVNb2RlID0gdGhlbWVNb2RlO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0Qm9hcmRTaXplUHJlc2V0KGJvYXJkU2l6ZVByZXNldDogQm9hcmRTaXplUHJlc2V0KTogdm9pZCB7XG4gICAgdGhpcy5ib2FyZFNpemVQcmVzZXQgPSBib2FyZFNpemVQcmVzZXQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTZWxlY3RlZFNldHRpbmdzVGFiKHRhYjogU2V0dGluZ3NUYWJJZCk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRTZXR0aW5nc1RhYiA9IHRhYjtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFVJX1BSRUZFUkVOQ0VTX1NUT1JBR0VfS0VZKTtcbiAgICAgIGlmICghc2F2ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHNhdmVkKSBhcyBQYXJ0aWFsPFBlcnNpc3RlZFVpUHJlZmVyZW5jZXM+O1xuICAgICAgdGhpcy5iYXNpY01vZGUgPSBwYXJzZWQuYmFzaWNNb2RlID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYmFzaWNNb2RlO1xuICAgICAgdGhpcy5hbmltYXRpb25TcGVlZCA9IHBhcnNlZC5hbmltYXRpb25TcGVlZCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmFuaW1hdGlvblNwZWVkO1xuICAgICAgdGhpcy5zb3VuZEVuYWJsZWQgPSBwYXJzZWQuc291bmRFbmFibGVkID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc291bmRFbmFibGVkO1xuICAgICAgdGhpcy5zb3VuZE11dGVkID0gcGFyc2VkLnNvdW5kTXV0ZWQgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZE11dGVkO1xuICAgICAgdGhpcy5zb3VuZFZvbHVtZSA9IHR5cGVvZiBwYXJzZWQuc291bmRWb2x1bWUgPT09ICdudW1iZXInXG4gICAgICAgID8gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCBNYXRoLnJvdW5kKHBhcnNlZC5zb3VuZFZvbHVtZSkpKVxuICAgICAgICA6IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc291bmRWb2x1bWU7XG4gICAgICB0aGlzLmF1dG9QbGF5U3BlZWQgPSBwYXJzZWQuYXV0b1BsYXlTcGVlZCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmF1dG9QbGF5U3BlZWQ7XG4gICAgICB0aGlzLnRoZW1lTW9kZSA9IHBhcnNlZC50aGVtZU1vZGUgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy50aGVtZU1vZGU7XG4gICAgICB0aGlzLmJvYXJkU2l6ZVByZXNldCA9IHBhcnNlZC5ib2FyZFNpemVQcmVzZXQgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5ib2FyZFNpemVQcmVzZXQ7XG4gICAgICB0aGlzLnNlbGVjdGVkU2V0dGluZ3NUYWIgPSBwYXJzZWQuc2VsZWN0ZWRTZXR0aW5nc1RhYiA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnNlbGVjdGVkU2V0dGluZ3NUYWI7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgaW52YWxpZCBVSSBwcmVmZXJlbmNlIHNuYXBzaG90cy5cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICBVSV9QUkVGRVJFTkNFU19TVE9SQUdFX0tFWSxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIGJhc2ljTW9kZTogdGhpcy5iYXNpY01vZGUsXG4gICAgICAgICAgYW5pbWF0aW9uU3BlZWQ6IHRoaXMuYW5pbWF0aW9uU3BlZWQsXG4gICAgICAgICAgc291bmRFbmFibGVkOiB0aGlzLnNvdW5kRW5hYmxlZCxcbiAgICAgICAgICBzb3VuZE11dGVkOiB0aGlzLnNvdW5kTXV0ZWQsXG4gICAgICAgICAgc291bmRWb2x1bWU6IHRoaXMuc291bmRWb2x1bWUsXG4gICAgICAgICAgYXV0b1BsYXlTcGVlZDogdGhpcy5hdXRvUGxheVNwZWVkLFxuICAgICAgICAgIHRoZW1lTW9kZTogdGhpcy50aGVtZU1vZGUsXG4gICAgICAgICAgYm9hcmRTaXplUHJlc2V0OiB0aGlzLmJvYXJkU2l6ZVByZXNldCxcbiAgICAgICAgICBzZWxlY3RlZFNldHRpbmdzVGFiOiB0aGlzLnNlbGVjdGVkU2V0dGluZ3NUYWIsXG4gICAgICAgIH0gYXMgUGVyc2lzdGVkVWlQcmVmZXJlbmNlcyksXG4gICAgICApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGxvY2FsU3RvcmFnZSBpc3N1ZXMgYW5kIGtlZXAgVUkgcmVzcG9uc2l2ZS5cbiAgICB9XG4gIH1cblxuICBnZXQgYm9hcmRTaXplUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gQk9BUkRfU0laRV9QUkVTRVRfUElYRUxTW3RoaXMuYm9hcmRTaXplUHJlc2V0XTtcbiAgfVxuXG4gIGdldCBhdXRvUGxheURlbGF5TXMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gQVVUT19QTEFZX1NQRUVEX0RFTEFZU1t0aGlzLmF1dG9QbGF5U3BlZWRdO1xuICB9XG5cbiAgZ2V0IGVmZmVjdGl2ZVNvdW5kVm9sdW1lKCk6IG51bWJlciB7XG4gICAgaWYgKCF0aGlzLnNvdW5kRW5hYmxlZCB8fCB0aGlzLnNvdW5kTXV0ZWQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNvdW5kVm9sdW1lIC8gMTAwO1xuICB9XG5cbiAgZ2V0UGVyc29uYUFjY2VudFRvbmUocGVyc29uYUlkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbCk6ICdyZWQnIHwgJ2dvbGQnIHwgJ2JsdWUnIHwgJ2dyZWVuJyB7XG4gICAgc3dpdGNoIChwZXJzb25hSWQpIHtcbiAgICAgIGNhc2UgJ2FnZ3Jlc3NpdmUnOlxuICAgICAgICByZXR1cm4gJ3JlZCc7XG4gICAgICBjYXNlICdoYXJkJzpcbiAgICAgIGNhc2UgJ3N1cGVyX2hhcmQnOlxuICAgICAgICByZXR1cm4gJ2dvbGQnO1xuICAgICAgY2FzZSAnbG93JzpcbiAgICAgICAgcmV0dXJuICdncmVlbic7XG4gICAgICBjYXNlICdtZWRpdW0nOlxuICAgICAgY2FzZSBudWxsOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdibHVlJztcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHVpU3RhdGVWaWV3TW9kZWwgPSBuZXcgVWlTdGF0ZVZpZXdNb2RlbCgpO1xuXG5leHBvcnQgeyBCT0FSRF9TSVpFX1BSRVNFVF9QSVhFTFMgfTtcbmV4cG9ydCB0eXBlIHsgQW5pbWF0aW9uU3BlZWQsIEF1dG9QbGF5U3BlZWQsIEJvYXJkU2l6ZVByZXNldCwgU2V0dGluZ3NUYWJJZCwgVGhlbWVNb2RlIH07XG4iLCAiLyoqXG4gKiBCb2FyZCBWaWV3TW9kZWxcbiAqIFZpZXdNb2RlbCBsYXllciAtIE1vYlggc3RvcmUgZm9yIGNoZXNzIGJvYXJkIHN0YXRlXG4gKi9cblxuaW1wb3J0IHsgbWFrZUF1dG9PYnNlcnZhYmxlLCBhY3Rpb24sIHJlYWN0aW9uLCBydW5JbkFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHsgQ2hlc3MsIE1vdmUsIFNxdWFyZSB9IGZyb20gJ2NoZXNzLmpzJztcbmltcG9ydCB7IGNhbkFwcGx5QW5hbHl6ZWRNb3ZlIH0gZnJvbSAnLi4vZW5naW5lL2FuYWx5c2lzU2FmZXR5JztcbmltcG9ydCB7IGRlcml2ZUJyaWxsaWFudFVzYWdlLCBNb3ZlQW5ub3RhdGlvbiB9IGZyb20gJy4uL2VuZ2luZS9icmlsbGlhbnRUcmFja2luZyc7XG5pbXBvcnQgeyBQZXJzaXN0ZWRCb2FyZFN0YXRlLCBjcmVhdGVHYW1lU2Vzc2lvbklkLCByZXNvbHZlUGduU3RhcnRGZW4gfSBmcm9tICcuLi9lbmdpbmUvZ2FtZVNlc3Npb24nO1xuaW1wb3J0IHsgR2FtZVNldHVwUHJlc2V0IH0gZnJvbSAnLi4vZW5naW5lL2dhbWVTZXR1cFByZXNldHMnO1xuaW1wb3J0IHsgZW5naW5lVmlld01vZGVsIH0gZnJvbSAnLi9FbmdpbmVWaWV3TW9kZWwnO1xuaW1wb3J0IHsgY29uZmlnVmlld01vZGVsIH0gZnJvbSAnLi9Db25maWdWaWV3TW9kZWwnO1xuaW1wb3J0IHsgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcbmltcG9ydCB7IGNyZWF0ZURlYnVnTG9nZ2VyIH0gZnJvbSAnLi4vc2hhcmVkL2RlYnVnJztcbmltcG9ydCB7XG4gIFBpY2tlZE1vdmVSZXN1bHQsXG4gIE1vdmVCdWNrZXQsXG4gIERpc3BsYXlNb3ZlQnVja2V0LFxuICBESVNQTEFZX0JVQ0tFVF9MQUJFTFMsXG4gIEJVQ0tFVF9MQUJFTFMsXG4gIEJVQ0tFVF9DT0xPUlMsXG4gIERJU1BMQVlfQlVDS0VUX0NPTE9SUyxcbn0gZnJvbSAnLi4vZW5naW5lL3R5cGVzJztcbmltcG9ydCB7IGNhbGN1bGF0ZUh1bWFuRGVsYXlNcyB9IGZyb20gJy4uL2VuZ2luZS9wZXJzb25hQmlhcyc7XG5pbXBvcnQgeyBtYXBMZWdhbE1vdmVzVG9CdWNrZXRzIH0gZnJvbSAnLi4vZW5naW5lL21vdmVDbGFzc2lmaWVyJztcbmltcG9ydCB7IHVpU3RhdGVWaWV3TW9kZWwgfSBmcm9tICcuL1VpU3RhdGVWaWV3TW9kZWwnO1xuXG5jb25zdCBsb2dnZXIgPSBjcmVhdGVEZWJ1Z0xvZ2dlcignQm9hcmRWaWV3TW9kZWwnKTtcblxuZXhwb3J0IGludGVyZmFjZSBSZWNlbnRNb3ZlRmVlZGJhY2sge1xuICBpZDogc3RyaW5nO1xuICBhY3RvcjogJ3BsYXllcicgfCAnZW5naW5lJyB8ICdyZWRvJztcbiAgc2FuOiBzdHJpbmc7XG4gIHF1YWxpdHlMYWJlbD86IHN0cmluZyB8IG51bGw7XG4gIGJ1Y2tldD86IERpc3BsYXlNb3ZlQnVja2V0IHwgTW92ZUJ1Y2tldCB8IG51bGw7XG4gIGlzQnJpbGxpYW50OiBib29sZWFuO1xuICBpc0NhcHR1cmU6IGJvb2xlYW47XG4gIGlzQ2hlY2s6IGJvb2xlYW47XG4gIGlzR2FtZUVuZDogYm9vbGVhbjtcbiAgc2lsZW50OiBib29sZWFuO1xuICBjcmVhdGVkQXQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJvYXJkVmlld01vZGVsIHtcbiAgcHJpdmF0ZSBjaGVzczogQ2hlc3MgPSBuZXcgQ2hlc3MoKTtcbiAgZmVuID0gdGhpcy5jaGVzcy5mZW4oKTtcbiAgZ2FtZVN0YXJ0RmVuID0gdGhpcy5jaGVzcy5mZW4oKTtcbiAgZ2FtZVNlc3Npb25JZCA9IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKTtcbiAgc2Vzc2lvblN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XG4gIGhpc3Rvcnk6IE1vdmVbXSA9IFtdO1xuICBsYXN0TW92ZTogeyBmcm9tOiBTcXVhcmU7IHRvOiBTcXVhcmUgfSB8IG51bGwgPSBudWxsO1xuICBsYXN0UGxheWVkQnVja2V0OiBNb3ZlQnVja2V0IHwgbnVsbCA9IG51bGw7XG4gIHN0YXR1c01lc3NhZ2UgPSAnUmVhZHknO1xuICBsYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgaXNUaGlua2luZyA9IGZhbHNlO1xuICBhdXRvUGxheUVuYWJsZWQgPSB0cnVlOyAvLyBBdXRvLXBsYXkgZW5naW5lIG1vdmVzIGFmdGVyIGh1bWFuIG1vdmVzXG4gIGVuZ2luZVBsYXlzRm9yOiAndycgfCAnYicgPSAnYic7IC8vIFdoaWNoIHNpZGUgdGhlIGVuZ2luZSBwbGF5cyBmb3IgKGRlZmF1bHQ6IGJsYWNrKVxuICBib2FyZEZsaXBwZWQgPSBmYWxzZTsgLy8gQm9hcmQgb3JpZW50YXRpb24gKGZhbHNlID0gd2hpdGUgb24gYm90dG9tLCB0cnVlID0gYmxhY2sgb24gYm90dG9tKVxuICBzaG93TW92ZUFycm93cyA9IGZhbHNlOyAvLyBTaG93IGFycm93cyBmb3IgYWxsIHBvc3NpYmxlIG1vdmVzXG4gIHNob3dBcnJvd3NGb3JTaWRlOiAnY3VycmVudCcgfCAncGxheWVyJyB8ICdlbmdpbmUnID0gJ2N1cnJlbnQnOyAvLyBXaGljaCBzaWRlJ3MgbW92ZXMgdG8gc2hvdyBhcnJvd3MgZm9yXG4gIGxhc3RQbGF5ZXJNb3ZlUXVhbGl0eTogRGlzcGxheU1vdmVCdWNrZXQgfCBudWxsID0gbnVsbDsgLy8gUXVhbGl0eSBvZiB0aGUgbGFzdCBwbGF5ZXIgbW92ZVxuICBpc0FuYWx5emluZ01vdmVzID0gZmFsc2U7IC8vIFdoZXRoZXIgd2UncmUgY3VycmVudGx5IGFuYWx5emluZyBtb3Zlc1xuICBhdXRvUGxheVBhdXNlZCA9IGZhbHNlO1xuICBhdXRvUGxheVNjaGVkdWxlZEZvciA9IDA7XG4gIGN1cnJlbnRTZXR1cE5hbWUgPSAnTmV3IEdhbWUnO1xuICBjdXJyZW50U2V0dXBDYXRlZ29yeSA9ICdjdXN0b20nO1xuICByZWNlbnRNb3ZlRmVlZGJhY2s6IFJlY2VudE1vdmVGZWVkYmFjayB8IG51bGwgPSBudWxsO1xuICBhdXRvUGxheUFjY3VtdWxhdGVkTXMgPSAwO1xuICBhdXRvUGxheUxhc3RSZXN1bWVkQXQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICBcbiAgLy8gU3RvcmUgYW5hbHl6ZWQgbW92ZXMgYXMgYW4gb2JqZWN0IGZvciBNb2JYIG9ic2VydmFiaWxpdHlcbiAgcHJpdmF0ZSBfYW5hbHl6ZWRMZWdhbE1vdmVzOiBSZWNvcmQ8c3RyaW5nLCBEaXNwbGF5TW92ZUJ1Y2tldD4gPSB7fTtcbiAgcHJpdmF0ZSByZWRvU3RhY2s6IE1vdmVbXSA9IFtdOyAvLyBTdGFjayBvZiBtb3ZlcyB0aGF0IHdlcmUgdW5kb25lIGZvciByZWRvIGZ1bmN0aW9uYWxpdHlcbiAgcHJpdmF0ZSBoaXN0b3J5QW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSByZWRvQW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBhbmFseXplZExlZ2FsTW92ZXNGZW46IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9hbmFseXNpc1RpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7IC8vIFRpbWVvdXQgZm9yIGRlYm91bmNpbmcgbW92ZSBhbmFseXNpc1xuICBwcml2YXRlIF9hdXRvUGxheVRpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3BsYXllck1vdmVBbmFseXNpc1RpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgRkVOX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19jdXJyZW50X2Zlbic7XG4gIHByaXZhdGUgcmVhZG9ubHkgRkVOX0hJU1RPUllfS0VZID0gJ3BlcnNvbmFjaGVzc19mZW5faGlzdG9yeSc7XG4gIHByaXZhdGUgcmVhZG9ubHkgQk9BUkRfU1RBVEVfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX2JvYXJkX3N0YXRlJztcbiAgcHJpdmF0ZSByZWFkb25seSBNQVhfSElTVE9SWSA9IDUwOyAvLyBNYXhpbXVtIG51bWJlciBvZiBGRU4gcG9zaXRpb25zIHRvIHN0b3JlXG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIGxvYWRGZW46IGFjdGlvbixcbiAgICAgIGxvYWRQZ246IGFjdGlvbixcbiAgICAgIGxvYWRHYW1lU2V0dXBQcmVzZXQ6IGFjdGlvbixcbiAgICAgIG1ha2VNb3ZlOiBhY3Rpb24sXG4gICAgICBzb2x2ZU5leHRNb3ZlOiBhY3Rpb24sXG4gICAgICByZXNldDogYWN0aW9uLFxuICAgICAgdW5kbzogYWN0aW9uLFxuICAgICAgdW5kb1NpbmdsZTogYWN0aW9uLFxuICAgICAgcmVkb1NpbmdsZTogYWN0aW9uLFxuICAgICAgc2V0QXV0b1BsYXk6IGFjdGlvbixcbiAgICAgIHNldEF1dG9QbGF5UGF1c2VkOiBhY3Rpb24sXG4gICAgICBzdGFydEF1dG9QbGF5VHVybjogYWN0aW9uLFxuICAgICAgdG9nZ2xlQXV0b1BsYXlQYXVzZTogYWN0aW9uLFxuICAgICAgc2V0RW5naW5lUGxheXNGb3I6IGFjdGlvbixcbiAgICAgIGZsaXBCb2FyZDogYWN0aW9uLFxuICAgICAgc2V0Qm9hcmRGbGlwcGVkOiBhY3Rpb24sXG4gICAgICBzYXZlRmVuVG9IaXN0b3J5OiBhY3Rpb24sXG4gICAgICBsb2FkRmVuRnJvbUhpc3Rvcnk6IGFjdGlvbixcbiAgICAgIHRvZ2dsZU1vdmVBcnJvd3M6IGFjdGlvbixcbiAgICAgIHNldFNob3dNb3ZlQXJyb3dzRW5hYmxlZDogYWN0aW9uLFxuICAgICAgc2V0U2hvd0Fycm93c0ZvclNpZGU6IGFjdGlvbixcbiAgICAgIGFuYWx5emVBbGxNb3ZlczogYWN0aW9uLFxuICAgICAgYW5hbHl6ZVBsYXllck1vdmU6IGFjdGlvbixcbiAgICB9KTtcbiAgICBcbiAgICAvLyBUcnkgdG8gcmVzdG9yZSBGRU4gZnJvbSBsb2NhbFN0b3JhZ2Ugb24gaW5pdGlhbGl6YXRpb25cbiAgICB0aGlzLnJlc3RvcmVGZW5Gcm9tU3RvcmFnZSgpO1xuXG4gICAgcmVhY3Rpb24oXG4gICAgICAoKSA9PiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5wZXJzaXN0RW5naW5lQ29uZmlnLFxuICAgICAgKHBlcnNpc3RFbmdpbmVDb25maWcpID0+IHtcbiAgICAgICAgaWYgKCFwZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZEJvYXJkU3RhdGUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNhdmVGZW5Ub0hpc3RvcnkoKTtcbiAgICAgIH0sXG4gICAgICB7IGZpcmVJbW1lZGlhdGVseTogdHJ1ZSB9LFxuICAgICk7XG4gICAgXG4gICAgbG9nZ2VyLmRlYnVnKCdJbml0aWFsaXplZCB3aXRoIEZFTjonLCB0aGlzLmZlbik7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGF1dG8tcGxheSBtb2RlXG4gICAqL1xuICBzZXRBdXRvUGxheShlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXlFbmFibGVkICYmICFlbmFibGVkKSB7XG4gICAgICB0aGlzLnN0b3BBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTtcbiAgICB9XG5cbiAgICB0aGlzLmF1dG9QbGF5RW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICB0aGlzLmF1dG9QbGF5UGF1c2VkID0gZmFsc2U7XG4gICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0QXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zeW5jQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIGxvZ2dlci5kZWJ1ZygnQXV0by1wbGF5IHNldCB0bzonLCBlbmFibGVkKTtcbiAgfVxuXG4gIHNldEF1dG9QbGF5UGF1c2VkKHBhdXNlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChwYXVzZWQpIHtcbiAgICAgIHRoaXMuc3RvcEF1dG9QbGF5RHVyYXRpb25UcmFja2luZygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0QXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgfVxuXG4gICAgdGhpcy5hdXRvUGxheVBhdXNlZCA9IHBhdXNlZDtcbiAgICBpZiAocGF1c2VkKSB7XG4gICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN5bmNBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc3RhcnRBdXRvUGxheVR1cm4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmNhblN0YXJ0QXV0b1BsYXlUdXJuKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICBhd2FpdCB0aGlzLnNvbHZlTmV4dE1vdmUodHJ1ZSk7XG4gIH1cblxuICB0b2dnbGVBdXRvUGxheVBhdXNlKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0QXV0b1BsYXlQYXVzZWQoIXRoaXMuYXV0b1BsYXlQYXVzZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB3aGljaCBzaWRlIHRoZSBlbmdpbmUgcGxheXMgZm9yXG4gICAqL1xuICBzZXRFbmdpbmVQbGF5c0ZvcihzaWRlOiAndycgfCAnYicpOiB2b2lkIHtcbiAgICB0aGlzLmVuZ2luZVBsYXlzRm9yID0gc2lkZTtcbiAgICB0aGlzLnN5bmNBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgbG9nZ2VyLmRlYnVnKCdFbmdpbmUgcGxheXMgZm9yOicsIHNpZGUgPT09ICd3JyA/ICdXaGl0ZScgOiAnQmxhY2snKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIGEgcG9zaXRpb24gZnJvbSBGRU4gc3RyaW5nXG4gICAqL1xuICBsb2FkRmVuKFxuICAgIGZlbjogc3RyaW5nLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc/OiBib29sZWFuO1xuICAgICAgc2Vzc2lvbklkPzogc3RyaW5nO1xuICAgICAgZ2FtZVN0YXJ0RmVuPzogc3RyaW5nO1xuICAgICAgaGlzdG9yeUFubm90YXRpb25zPzogTW92ZUFubm90YXRpb25bXTtcbiAgICAgIHJlZG9Bbm5vdGF0aW9ucz86IE1vdmVBbm5vdGF0aW9uW107XG4gICAgICBzZXR1cE5hbWU/OiBzdHJpbmc7XG4gICAgICBzZXR1cENhdGVnb3J5Pzogc3RyaW5nO1xuICAgIH0gPSB7fSxcbiAgKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZyA9IHRydWUsXG4gICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgZ2FtZVN0YXJ0RmVuLFxuICAgICAgICBoaXN0b3J5QW5ub3RhdGlvbnMsXG4gICAgICAgIHJlZG9Bbm5vdGF0aW9ucyxcbiAgICAgICAgc2V0dXBOYW1lLFxuICAgICAgICBzZXR1cENhdGVnb3J5LFxuICAgICAgfSA9IG9wdGlvbnM7XG4gICAgICBsb2dnZXIuZGVidWcoJ2xvYWRGZW4gY2FsbGVkOicsIGZlbik7XG4gICAgICBjb25zdCBuZXdDaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICAgICAgdGhpcy5jaGVzcyA9IG5ld0NoZXNzO1xuICAgICAgdGhpcy5iZWdpblNlc3Npb25TdGF0ZSh7XG4gICAgICAgIGdhbWVTZXNzaW9uSWQ6IHNlc3Npb25JZCA/PyBjcmVhdGVHYW1lU2Vzc2lvbklkKCksXG4gICAgICAgIGdhbWVTdGFydEZlbjogZ2FtZVN0YXJ0RmVuID8/IGZlbixcbiAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZyxcbiAgICAgICAgaGlzdG9yeUFubm90YXRpb25zLFxuICAgICAgICByZWRvQW5ub3RhdGlvbnMsXG4gICAgICAgIHNldHVwTmFtZSxcbiAgICAgICAgc2V0dXBDYXRlZ29yeSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZXNldFRyYW5zaWVudEJvYXJkU3RhdGUoKTtcbiAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdQb3NpdGlvbiBsb2FkZWQnO1xuICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcbiAgICAgIHRoaXMucmVjZW50TW92ZUZlZWRiYWNrID0gbnVsbDtcbiAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXN0YXJ0KCk7XG4gICAgICBsb2dnZXIuZGVidWcoJ0ZFTiBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignbG9hZEZlbiBlcnJvcjonLCBlcnIpO1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYEludmFsaWQgRkVOOiAke2Vycn1gO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIGEgZ2FtZSBmcm9tIFBHTiBzdHJpbmdcbiAgICovXG4gIGxvYWRQZ24oXG4gICAgcGduOiBzdHJpbmcsXG4gICAgb3B0aW9uczoge1xuICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZz86IGJvb2xlYW47XG4gICAgICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG4gICAgICBzZXR1cE5hbWU/OiBzdHJpbmc7XG4gICAgICBzZXR1cENhdGVnb3J5Pzogc3RyaW5nO1xuICAgIH0gPSB7fSxcbiAgKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZyA9IHRydWUsXG4gICAgICAgIHNlc3Npb25JZCxcbiAgICAgICAgc2V0dXBOYW1lLFxuICAgICAgICBzZXR1cENhdGVnb3J5LFxuICAgICAgfSA9IG9wdGlvbnM7XG4gICAgICBsb2dnZXIuZGVidWcoJ2xvYWRQZ24gY2FsbGVkJyk7XG4gICAgICBjb25zdCBuZXdDaGVzcyA9IG5ldyBDaGVzcygpO1xuICAgICAgbmV3Q2hlc3MubG9hZFBnbihwZ24pO1xuICAgICAgY29uc3QgZ2FtZVN0YXJ0RmVuID0gcmVzb2x2ZVBnblN0YXJ0RmVuKG5ld0NoZXNzLmhlYWRlcigpLCBuZXcgQ2hlc3MoKS5mZW4oKSk7XG4gICAgICB0aGlzLmNoZXNzID0gbmV3Q2hlc3M7XG4gICAgICB0aGlzLmJlZ2luU2Vzc2lvblN0YXRlKHtcbiAgICAgICAgZ2FtZVNlc3Npb25JZDogc2Vzc2lvbklkID8/IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKSxcbiAgICAgICAgZ2FtZVN0YXJ0RmVuLFxuICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nLFxuICAgICAgICBzZXR1cE5hbWUsXG4gICAgICAgIHNldHVwQ2F0ZWdvcnksXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVzZXRUcmFuc2llbnRCb2FyZFN0YXRlKCk7XG4gICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnUEdOIGxvYWRlZCc7XG4gICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgICAgdGhpcy5yZWNlbnRNb3ZlRmVlZGJhY2sgPSBudWxsO1xuICAgICAgZW5naW5lVmlld01vZGVsLnJlc3RhcnQoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdsb2FkUGduIGVycm9yOicsIGVycik7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgSW52YWxpZCBQR046ICR7ZXJyfWA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgbG9hZEdhbWVTZXR1cFByZXNldChwcmVzZXQ6IEdhbWVTZXR1cFByZXNldCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHNpZGVMYWJlbCA9IHByZXNldC5zaWRlID09PSAnd2hpdGUnID8gJ1doaXRlJyA6ICdCbGFjayc7XG4gICAgY29uc3QgbG9hZGVkID0gcHJlc2V0LnNvdXJjZVR5cGUgPT09ICdmZW4nXG4gICAgICA/IHRoaXMubG9hZEZlbihwcmVzZXQuc291cmNlLCB7XG4gICAgICAgICAgc2V0dXBOYW1lOiBwcmVzZXQubmFtZSxcbiAgICAgICAgICBzZXR1cENhdGVnb3J5OiBwcmVzZXQuY2F0ZWdvcnksXG4gICAgICAgIH0pXG4gICAgICA6IHRoaXMubG9hZFBnbihwcmVzZXQuc291cmNlLCB7XG4gICAgICAgICAgc2V0dXBOYW1lOiBwcmVzZXQubmFtZSxcbiAgICAgICAgICBzZXR1cENhdGVnb3J5OiBwcmVzZXQuY2F0ZWdvcnksXG4gICAgICAgIH0pO1xuXG4gICAgaWYgKGxvYWRlZCkge1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYCR7cHJlc2V0Lm5hbWV9IGxvYWRlZCAoJHtzaWRlTGFiZWx9KWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvYWRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGEgbW92ZSBvbiB0aGUgYm9hcmQgKHNpbWlsYXIgdG8gdGhlIGV4YW1wbGUgcGF0dGVybilcbiAgICogVGhpcyBpcyBzeW5jaHJvbm91cyBmb3IgaW1tZWRpYXRlIFVJIGZlZWRiYWNrLCBqdXN0IGxpa2UgdGhlIGV4YW1wbGVcbiAgICovXG4gIG1ha2VNb3ZlKGZyb206IFNxdWFyZSwgdG86IFNxdWFyZSwgcHJvbW90aW9uID0gJ3EnKTogYm9vbGVhbiB7XG4gICAgbG9nZ2VyLmRlYnVnKCdtYWtlTW92ZSBjYWxsZWQnLCB7IGZyb20sIHRvLCBwcm9tb3Rpb24sIGN1cnJlbnRGZW46IHRoaXMuZmVuLCBjdXJyZW50VHVybjogdGhpcy5jaGVzcy50dXJuKCkgfSk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIC8vIFRyeSB0byBtYWtlIHRoZSBtb3ZlIGFjY29yZGluZyB0byBjaGVzcy5qcyBsb2dpYyAoZXhhY3RseSBsaWtlIHRoZSBleGFtcGxlKVxuICAgICAgLy8gY2hlc3MuanMgd2lsbCB2YWxpZGF0ZSB0aGUgbW92ZSBhdXRvbWF0aWNhbGx5XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgZnJvbSxcbiAgICAgICAgdG8sXG4gICAgICAgIHByb21vdGlvbjogcHJvbW90aW9uIGFzICdxJyB8ICdyJyB8ICdiJyB8ICduJyB8IHVuZGVmaW5lZCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobW92ZSkge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ01vdmUgc3VjY2Vzc2Z1bDonLCBtb3ZlLnNhbik7XG4gICAgICAgIC8vIENsZWFyIHJlZG8gc3RhY2sgd2hlbiBhIG5ldyBtb3ZlIGlzIG1hZGVcbiAgICAgICAgdGhpcy5jbGVhclJlZG9TdGF0ZSgpO1xuICAgICAgICB0aGlzLnJlY29yZE1vdmVBbm5vdGF0aW9uKG1vdmUsIGZhbHNlLCAncGxheWVyJyk7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gc3RhdGUgdG8gdHJpZ2dlciBhIHJlLXJlbmRlciAodmlhIE1vYlggb2JzZXJ2YWJsZSlcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0geyBmcm9tLCB0byB9O1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn1gO1xuICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgICBtb3ZlLFxuICAgICAgICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IHNob3VsZEF1dG9QbGF5Tm93ID1cbiAgICAgICAgICB0aGlzLmF1dG9QbGF5RW5hYmxlZFxuICAgICAgICAgICYmICF0aGlzLmlzR2FtZU92ZXJcbiAgICAgICAgICAmJiB0aGlzLmNoZXNzLnR1cm4oKSA9PT0gdGhpcy5lbmdpbmVQbGF5c0ZvcjtcblxuICAgICAgICAvLyBNYWtlIGVuZ2luZSBtb3ZlIGFmdGVyIGEgc2hvcnQgZGVsYXkgaWY6XG4gICAgICAgIC8vIDEuIEF1dG8tcGxheSBpcyBlbmFibGVkXG4gICAgICAgIC8vIDIuIEdhbWUgaXMgbm90IG92ZXJcbiAgICAgICAgLy8gMy4gSXQncyBub3cgdGhlIGVuZ2luZSdzIHR1cm4gKHRoZSB0dXJuIGNoYW5nZWQgYWZ0ZXIgdGhlIGh1bWFuIG1vdmUpXG4gICAgICAgIGlmIChzaG91bGRBdXRvUGxheU5vdykge1xuICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnU2NoZWR1bGluZyBhdXRvLXBsYXkgZm9yIGVuZ2luZSBzaWRlOicsIHRoaXMuZW5naW5lUGxheXNGb3IpO1xuICAgICAgICAgIHRoaXMuc2NoZWR1bGVBdXRvUGxheU1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlZmVyIHBsYXllci1tb3ZlIGdyYWRpbmcgd2hpbGUgYW4gZW5naW5lIGF1dG8tcGxheSByZXBseSBpcyBwZW5kaW5nIHNvXG4gICAgICAgIC8vIHRoZSBzaGFyZWQgU3RvY2tmaXNoIHdvcmtlciBjYW4gcHJpb3JpdGl6ZSB0aGUgYWN0dWFsIG1vdmUgcmVzcG9uc2UuXG4gICAgICAgIHRoaXMuc2NoZWR1bGVQbGF5ZXJNb3ZlQW5hbHlzaXMobW92ZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBhcyB0aGUgbW92ZSB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnTW92ZSBmYWlsZWQgLSBjaGVzcy5qcyByZXR1cm5lZCBudWxsJyk7XG4gICAgICAgIC8vIFJldHVybiBmYWxzZSBhcyB0aGUgbW92ZSB3YXMgbm90IHN1Y2Nlc3NmdWxcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdNb3ZlIGV4Y2VwdGlvbjonLCBlcnIpO1xuICAgICAgLy8gUmV0dXJuIGZhbHNlIGFzIHRoZSBtb3ZlIHdhcyBub3Qgc3VjY2Vzc2Z1bFxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGEgbW92ZSBmcm9tIFVDSSBub3RhdGlvbiAoZS5nLiwgXCJlMmU0XCIpXG4gICAqIFVzZWQgYnkgdGhlIGVuZ2luZVxuICAgKi9cbiAgYXN5bmMgbWFrZU1vdmVVQ0koXG4gICAgdWNpOiBzdHJpbmcsXG4gICAgb3B0aW9uczogeyBjb25zdW1lZEJyaWxsaWFudD86IGJvb2xlYW4gfSA9IHt9LFxuICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodWNpLmxlbmd0aCA8IDQpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICBjb25zdCBmcm9tID0gdWNpLnNsaWNlKDAsIDIpIGFzIFNxdWFyZTtcbiAgICBjb25zdCB0byA9IHVjaS5zbGljZSgyLCA0KSBhcyBTcXVhcmU7XG4gICAgY29uc3QgcHJvbW90aW9uID0gdWNpLmxlbmd0aCA+IDQgPyB1Y2lbNF0gOiB1bmRlZmluZWQ7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLm1vdmUoe1xuICAgICAgICBmcm9tLFxuICAgICAgICB0byxcbiAgICAgICAgcHJvbW90aW9uOiBwcm9tb3Rpb24gYXMgJ3EnIHwgJ3InIHwgJ2InIHwgJ24nIHwgdW5kZWZpbmVkLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChtb3ZlKSB7XG4gICAgICAgIC8vIENsZWFyIHJlZG8gc3RhY2sgd2hlbiBhIG5ldyBtb3ZlIGlzIG1hZGVcbiAgICAgICAgdGhpcy5jbGVhclJlZG9TdGF0ZSgpO1xuICAgICAgICB0aGlzLnJlY29yZE1vdmVBbm5vdGF0aW9uKG1vdmUsIG9wdGlvbnMuY29uc3VtZWRCcmlsbGlhbnQgPz8gZmFsc2UsICdlbmdpbmUnKTtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0geyBmcm9tLCB0byB9O1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgRW5naW5lIHBsYXllZDogJHttb3ZlLnNhbn1gO1xuICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgIGFjdG9yOiAnZW5naW5lJyxcbiAgICAgICAgICBtb3ZlLFxuICAgICAgICAgIGlzQnJpbGxpYW50OiBvcHRpb25zLmNvbnN1bWVkQnJpbGxpYW50ID8/IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTb2x2ZSBhbmQgcGxheSB0aGUgbmV4dCBtb3ZlIHVzaW5nIHRoZSBlbmdpbmUgYW5kIGJ1Y2tldCBjb25maWd1cmF0aW9uXG4gICAqL1xuICBhc3luYyBzb2x2ZU5leHRNb3ZlKGF1dG9UcmlnZ2VyZWQgPSBmYWxzZSk6IFByb21pc2U8UGlja2VkTW92ZVJlc3VsdCB8IG51bGw+IHtcbiAgICBpZiAodGhpcy5pc0dhbWVPdmVyKSB7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnR2FtZSBpcyBvdmVyJztcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNUaGlua2luZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdFbmdpbmUgdGhpbmtpbmcuLi4nO1xuICAgICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgZW5naW5lIGlmIG5lZWRlZFxuICAgICAgaWYgKCFlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCkge1xuICAgICAgICBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBBbmFseXplIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgIGNvbnN0IGFuYWx5c2lzID0gYXdhaXQgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbihcbiAgICAgICAgdGhpcy5mZW4sXG4gICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCxcbiAgICAgICAgY29uZmlnVmlld01vZGVsLm11bHRpUFYsXG4gICAgICAgICdlbmdpbmVNb3ZlJyxcbiAgICAgICk7XG5cbiAgICAgIC8vIENoZWNrIGlmIGFuYWx5c2lzIHJldHVybmVkIG5vIG1vdmVzIChnYW1lIG92ZXIgcG9zaXRpb24pXG4gICAgICBpZiAoYW5hbHlzaXMuaWdub3JlZCB8fCBhbmFseXNpcy5tb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgIGlmIChhbmFseXNpcy5pZ25vcmVkKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnRW5naW5lIGFuYWx5c2lzIGV4cGlyZWQnO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0NoZWNrbWF0ZSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ0NoZWNrbWF0ZSEgR2FtZSBvdmVyLic7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzU3RhbGVtYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnU3RhbGVtYXRlISBHYW1lIG92ZXIuJztcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNEcmF3KSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnRHJhdyEgR2FtZSBvdmVyLic7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdObyBsZWdhbCBtb3ZlcyBhdmFpbGFibGUnO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBhbmFseXNpcy5pZ25vcmVkID8gJ0EgbmV3ZXIgZW5naW5lIGFuYWx5c2lzIHJlcGxhY2VkIHRoaXMgbW92ZSByZXF1ZXN0LicgOiBudWxsO1xuICAgICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFBpY2sgYSBtb3ZlIGJhc2VkIG9uIGJ1Y2tldCBjb25maWd1cmF0aW9uXG4gICAgICBjb25zdCBwZXJzb25hID0gY29uZmlnVmlld01vZGVsLmN1cnJlbnRQcmVzZXRJZCA/PyAnY3VzdG9tJztcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcyhhbmFseXNpcywgY29uZmlnVmlld01vZGVsLmJ1Y2tldENvbmZpZywge1xuICAgICAgICBmZW46IHRoaXMuZmVuLFxuICAgICAgICBnYW1lU3RhcnRGZW46IHRoaXMuZ2FtZVN0YXJ0RmVuLFxuICAgICAgICBtb3ZlQ291bnQ6IHRoaXMubW92ZUNvdW50LFxuICAgICAgICBzaWRlVG9Nb3ZlOiB0aGlzLnR1cm4sXG4gICAgICAgIHBlcnNvbmEsXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBpZiAoYXV0b1RyaWdnZXJlZCAmJiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VIdW1hbkRlbGF5U2ltdWxhdGlvbikge1xuICAgICAgICAgIGNvbnN0IGRlbGF5TXMgPSBjYWxjdWxhdGVIdW1hbkRlbGF5TXMoe1xuICAgICAgICAgICAgY29tcGxleGl0eTogYW5hbHlzaXMuY29tcGxleGl0eSxcbiAgICAgICAgICAgIHBlcnNvbmEsXG4gICAgICAgICAgICBidWNrZXQ6IHJlc3VsdC5idWNrZXQsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYXdhaXQgdGhpcy53YWl0KGRlbGF5TXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjYW5BcHBseUFuYWx5emVkTW92ZSh0aGlzLmZlbiwgYW5hbHlzaXMuYW5hbHl6ZWRGZW4pKSB7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ1Bvc2l0aW9uIGNoYW5nZWQsIHN0YWxlIGVuZ2luZSBtb3ZlIGRpc2NhcmRlZCc7XG4gICAgICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSAnU2tpcHBlZCBlbmdpbmUgbW92ZSBiZWNhdXNlIHRoZSBib2FyZCBjaGFuZ2VkIGJlZm9yZSBpdCBjb3VsZCBiZSBwbGF5ZWQuJztcbiAgICAgICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXBwbHkgdGhlIHBpY2tlZCBtb3ZlXG4gICAgICAgIGNvbnN0IG1vdmVTdWNjZXNzID0gYXdhaXQgdGhpcy5tYWtlTW92ZVVDSShyZXN1bHQubW92ZS5tb3ZlLCB7XG4gICAgICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IHJlc3VsdC5pc0JyaWxsaWFudCA/PyBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAobW92ZVN1Y2Nlc3MpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUxhc3RBbm5vdGF0aW9uKHtcbiAgICAgICAgICAgIGJ1Y2tldDogcmVzdWx0LmJ1Y2tldCxcbiAgICAgICAgICAgIGV2YWxMb3NzOiByZXN1bHQubW92ZS5ldmFsTG9zcyxcbiAgICAgICAgICAgIGV2YWx1YXRpb246IHJlc3VsdC5tb3ZlLmV2YWx1YXRpb24sXG4gICAgICAgICAgICBjb21wbGV4aXR5TGV2ZWw6IGFuYWx5c2lzLmNvbXBsZXhpdHkubGV2ZWwsXG4gICAgICAgICAgICBjb21wbGV4aXR5U2NvcmU6IGFuYWx5c2lzLmNvbXBsZXhpdHkuc2NvcmUsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gcmVzdWx0LmJ1Y2tldDtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IHJlc3VsdC5pc0JyaWxsaWFudFxuICAgICAgICAgICAgICA/ICdFbmdpbmUgcGxheWVkOiBCcmlsbGlhbnQgbW92ZSdcbiAgICAgICAgICAgICAgOiBgRW5naW5lIHBsYXllZDogJHtCVUNLRVRfTEFCRUxTW3Jlc3VsdC5idWNrZXRdfSBtb3ZlYDtcbiAgICAgICAgICAgIHRoaXMubGFzdFNraXBwZWRFbmdpbmVNb3ZlTWVzc2FnZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnRW5naW5lIG1vdmUgZmFpbGVkJztcbiAgICAgICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnTm8gbW92ZXMgYXZhaWxhYmxlJztcbiAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdzb2x2ZU5leHRNb3ZlIGVycm9yOicsIGVycik7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBFcnJvcjogJHtlcnJ9YDtcbiAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgYm9hcmQgdG8gc3RhcnRpbmcgcG9zaXRpb25cbiAgICovXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZygncmVzZXQgY2FsbGVkJyk7XG4gICAgdGhpcy5jaGVzcyA9IG5ldyBDaGVzcygpO1xuICAgIHRoaXMuYmVnaW5TZXNzaW9uU3RhdGUoe1xuICAgICAgZ2FtZVNlc3Npb25JZDogY3JlYXRlR2FtZVNlc3Npb25JZCgpLFxuICAgICAgZ2FtZVN0YXJ0RmVuOiB0aGlzLmNoZXNzLmZlbigpLFxuICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZzogdHJ1ZSxcbiAgICAgIHNldHVwTmFtZTogJ05ldyBHYW1lJyxcbiAgICAgIHNldHVwQ2F0ZWdvcnk6ICdjdXN0b20nLFxuICAgIH0pO1xuICAgIHRoaXMucmVzZXRUcmFuc2llbnRCb2FyZFN0YXRlKCk7XG4gICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ0JvYXJkIHJlc2V0JztcbiAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgIHRoaXMucmVjZW50TW92ZUZlZWRiYWNrID0gbnVsbDtcbiAgICBlbmdpbmVWaWV3TW9kZWwucmVzdGFydCgpO1xuICAgIGxvZ2dlci5kZWJ1ZygnQm9hcmQgcmVzZXQsIG5ldyBGRU46JywgdGhpcy5mZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuZG8gdGhlIGxhc3QgbW92ZSAob3IgbGFzdCB0d28gbW92ZXMgaWYgYXV0by1wbGF5IGlzIG9uIGFuZCBlbmdpbmUganVzdCBtb3ZlZClcbiAgICovXG4gIHVuZG8oKTogYm9vbGVhbiB7XG4gICAgbG9nZ2VyLmRlYnVnKCd1bmRvIGNhbGxlZCwgaGlzdG9yeSBsZW5ndGg6JywgdGhpcy5oaXN0b3J5Lmxlbmd0aCk7XG4gICAgXG4gICAgLy8gSWYgYXV0by1wbGF5IGlzIGVuYWJsZWQgYW5kIHRoZSBsYXN0IG1vdmUgd2FzIGJ5IHRoZSBlbmdpbmUsIHVuZG8gYm90aCBtb3Zlc1xuICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiB0aGlzLmhpc3RvcnkubGVuZ3RoID49IDIpIHtcbiAgICAgIC8vIENoZWNrIGlmIHRoZSBsYXN0IG1vdmUgd2FzIGJ5IHRoZSBlbmdpbmVcbiAgICAgIGNvbnN0IGxhc3RNb3ZlID0gdGhpcy5oaXN0b3J5W3RoaXMuaGlzdG9yeS5sZW5ndGggLSAxXTtcbiAgICAgIGNvbnN0IGxhc3RNb3ZlQ29sb3IgPSBsYXN0TW92ZS5jb2xvcjtcbiAgICAgIFxuICAgICAgLy8gSWYgbGFzdCBtb3ZlIHdhcyBieSBlbmdpbmUsIHVuZG8gYm90aCAoZW5naW5lIG1vdmUgKyBodW1hbiBtb3ZlKVxuICAgICAgaWYgKGxhc3RNb3ZlQ29sb3IgPT09IHRoaXMuZW5naW5lUGxheXNGb3IpIHtcbiAgICAgICAgaWYgKHRoaXMudW5kb01vdmVzKDIpKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ1VuZGlkIGxhc3QgMiBtb3ZlcyAoaHVtYW4gKyBlbmdpbmUpJztcbiAgICAgICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG4gICAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdVbmRpZCAyIG1vdmVzJyk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIExhc3QgbW92ZSB3YXMgYnkgaHVtYW4sIGp1c3QgdW5kbyBvbmVcbiAgICAgICAgaWYgKHRoaXMudW5kb01vdmVzKDEpKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ01vdmUgdW5kb25lJztcbiAgICAgICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG4gICAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdVbmRpZCAxIG1vdmUnKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdXRvLXBsYXkgZGlzYWJsZWQgb3Igbm90IGVub3VnaCBtb3ZlcywgdW5kbyBqdXN0IG9uZSBtb3ZlXG4gICAgICBpZiAodGhpcy51bmRvTW92ZXMoMSkpIHtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ01vdmUgdW5kb25lJztcbiAgICAgICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICAgICAgdGhpcy5jbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTtcbiAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnVW5kaWQgMSBtb3ZlJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsb2dnZXIuZGVidWcoJ1VuZG8gZmFpbGVkIC0gbm8gbW92ZXMgdG8gdW5kbycpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgaW50ZXJuYWwgc3RhdGUgZnJvbSBjaGVzcyBpbnN0YW5jZVxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVTdGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmZlbiA9IHRoaXMuY2hlc3MuZmVuKCk7XG4gICAgdGhpcy5oaXN0b3J5ID0gdGhpcy5jaGVzcy5oaXN0b3J5KHsgdmVyYm9zZTogdHJ1ZSB9KTtcbiAgICB0aGlzLmFuYWx5emVkTGVnYWxNb3Zlc0ZlbiA9IG51bGw7XG4gICAgLy8gU2F2ZSBGRU4gdG8gbG9jYWxTdG9yYWdlIHdoZW5ldmVyIGl0IGNoYW5nZXNcbiAgICB0aGlzLnNhdmVGZW5Ub0hpc3RvcnkoKTtcbiAgICBsb2dnZXIuZGVidWcoJ3VwZGF0ZVN0YXRlIC0gRkVOOicsIHRoaXMuZmVuLCAnSGlzdG9yeSBsZW5ndGg6JywgdGhpcy5oaXN0b3J5Lmxlbmd0aCk7XG4gICAgXG4gICAgLy8gQXV0b21hdGljYWxseSByZS1hbmFseXplIG1vdmVzIGlmIGFycm93cyBhcmUgZW5hYmxlZCAoZGVib3VuY2VkIHRvIHByZXZlbnQgZXhjZXNzaXZlIGNhbGxzKVxuICAgIGlmICh0aGlzLnNob3dNb3ZlQXJyb3dzICYmICF0aGlzLmlzR2FtZU92ZXIgJiYgIXRoaXMuaXNBbmFseXppbmdNb3Zlcykge1xuICAgICAgLy8gQ2xlYXIgcHJldmlvdXMgYW5hbHlzaXMgYW5kIHRyaWdnZXIgbmV3IGFuYWx5c2lzIGFzeW5jaHJvbm91c2x5XG4gICAgICAvLyBVc2Ugc2V0VGltZW91dCB0byBkZWJvdW5jZSBhbmQgcHJldmVudCByZS1yZW5kZXIgbG9vcHNcbiAgICAgIHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcyA9IHt9O1xuICAgICAgLy8gQ2xlYXIgYW55IHBlbmRpbmcgYW5hbHlzaXMgdGltZW91dFxuICAgICAgaWYgKHRoaXMuX2FuYWx5c2lzVGltZW91dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fYW5hbHlzaXNUaW1lb3V0KTtcbiAgICAgIH1cbiAgICAgIC8vIERlYm91bmNlIGFuYWx5c2lzIHRvIHByZXZlbnQgZXhjZXNzaXZlIGNhbGxzXG4gICAgICB0aGlzLl9hbmFseXNpc1RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5hbmFseXplQWxsTW92ZXMoKS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIGFuYWx5emUgbW92ZXM6JywgZXJyKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCAzMDApOyAvLyAzMDBtcyBkZWJvdW5jZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGbGlwIHRoZSBib2FyZCBvcmllbnRhdGlvbiBhbmQgZW5naW5lIHBsYXlpbmcgY29sb3JcbiAgICovXG4gIGZsaXBCb2FyZCgpOiB2b2lkIHtcbiAgICB0aGlzLmJvYXJkRmxpcHBlZCA9ICF0aGlzLmJvYXJkRmxpcHBlZDtcbiAgICAvLyBGbGlwIHRoZSBlbmdpbmUncyBwbGF5aW5nIGNvbG9yIHdoZW4gYm9hcmQgaXMgZmxpcHBlZFxuICAgIHRoaXMuZW5naW5lUGxheXNGb3IgPSB0aGlzLmVuZ2luZVBsYXlzRm9yID09PSAndycgPyAnYicgOiAndyc7XG4gICAgbG9nZ2VyLmRlYnVnKCdCb2FyZCBmbGlwcGVkLCBvcmllbnRhdGlvbjonLCB0aGlzLmJvYXJkRmxpcHBlZCA/ICdibGFjaycgOiAnd2hpdGUnLCAnRW5naW5lIG5vdyBwbGF5cyBmb3I6JywgdGhpcy5lbmdpbmVQbGF5c0ZvciA9PT0gJ3cnID8gJ1doaXRlJyA6ICdCbGFjaycpO1xuICB9XG5cbiAgc2V0Qm9hcmRGbGlwcGVkKGZsaXBwZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5ib2FyZEZsaXBwZWQgIT09IGZsaXBwZWQpIHtcbiAgICAgIHRoaXMuZmxpcEJvYXJkKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgY3VycmVudCBGRU4gdG8gbG9jYWxTdG9yYWdlIGhpc3RvcnlcbiAgICovXG4gIHNhdmVGZW5Ub0hpc3RvcnkoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRGZW4gPSB0aGlzLmZlbjtcbiAgICAgIFxuICAgICAgLy8gU2F2ZSBjdXJyZW50IEZFTlxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5GRU5fU1RPUkFHRV9LRVksIGN1cnJlbnRGZW4pO1xuICAgICAgXG4gICAgICAvLyBHZXQgZXhpc3RpbmcgaGlzdG9yeVxuICAgICAgY29uc3QgaGlzdG9yeUpzb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkZFTl9ISVNUT1JZX0tFWSk7XG4gICAgICBsZXQgaGlzdG9yeTogc3RyaW5nW10gPSBoaXN0b3J5SnNvbiA/IEpTT04ucGFyc2UoaGlzdG9yeUpzb24pIDogW107XG4gICAgICBcbiAgICAgIGlmIChoaXN0b3J5Lmxlbmd0aCA9PT0gMCB8fCBoaXN0b3J5W2hpc3RvcnkubGVuZ3RoIC0gMV0gIT09IGN1cnJlbnRGZW4pIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoKGN1cnJlbnRGZW4pO1xuXG4gICAgICAgIGlmIChoaXN0b3J5Lmxlbmd0aCA+IHRoaXMuTUFYX0hJU1RPUlkpIHtcbiAgICAgICAgICBoaXN0b3J5ID0gaGlzdG9yeS5zbGljZSgtdGhpcy5NQVhfSElTVE9SWSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLkZFTl9ISVNUT1JZX0tFWSwgSlNPTi5zdHJpbmdpZnkoaGlzdG9yeSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucGVyc2lzdEVuZ2luZUNvbmZpZykge1xuICAgICAgICBjb25zdCBib2FyZFN0YXRlOiBQZXJzaXN0ZWRCb2FyZFN0YXRlID0ge1xuICAgICAgICAgIGN1cnJlbnRGZW4sXG4gICAgICAgICAgZmVuSGlzdG9yeTogaGlzdG9yeSxcbiAgICAgICAgICBnYW1lU2Vzc2lvbklkOiB0aGlzLmdhbWVTZXNzaW9uSWQsXG4gICAgICAgICAgZ2FtZVN0YXJ0RmVuOiB0aGlzLmdhbWVTdGFydEZlbixcbiAgICAgICAgICBjdXJyZW50U2V0dXBOYW1lOiB0aGlzLmN1cnJlbnRTZXR1cE5hbWUsXG4gICAgICAgICAgY3VycmVudFNldHVwQ2F0ZWdvcnk6IHRoaXMuY3VycmVudFNldHVwQ2F0ZWdvcnksXG4gICAgICAgICAgaGlzdG9yeUFubm90YXRpb25zOiB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucyxcbiAgICAgICAgICByZWRvQW5ub3RhdGlvbnM6IHRoaXMucmVkb0Fubm90YXRpb25zLFxuICAgICAgICB9O1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLkJPQVJEX1NUQVRFX1NUT1JBR0VfS0VZLCBKU09OLnN0cmluZ2lmeShib2FyZFN0YXRlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsZWFyUGVyc2lzdGVkQm9hcmRTdGF0ZSgpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBsb2dnZXIuZGVidWcoJ1NhdmVkIEZFTiB0byBoaXN0b3J5LCB0b3RhbCBlbnRyaWVzOicsIGhpc3RvcnkubGVuZ3RoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHNhdmUgRkVOIHRvIGhpc3Rvcnk6JywgZXJyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZSBGRU4gZnJvbSBsb2NhbFN0b3JhZ2Ugb24gYXBwIHN0YXJ0dXBcbiAgICovXG4gIHByaXZhdGUgcmVzdG9yZUZlbkZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZEZlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX1NUT1JBR0VfS0VZKTtcbiAgICAgIGlmIChzYXZlZEZlbikge1xuICAgICAgICAvLyBWYWxpZGF0ZSBGRU4gYmVmb3JlIGxvYWRpbmdcbiAgICAgICAgY29uc3QgdGVzdENoZXNzID0gbmV3IENoZXNzKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGVzdENoZXNzLmxvYWQoc2F2ZWRGZW4pO1xuICAgICAgICAgIC8vIEZFTiBpcyB2YWxpZCwgbG9hZCBpdFxuICAgICAgICAgIGNvbnN0IHJlc3RvcmVkQm9hcmRTdGF0ZSA9IHRoaXMucmVhZFBlcnNpc3RlZEJvYXJkU3RhdGUoKTtcbiAgICAgICAgICBpZiAocmVzdG9yZWRCb2FyZFN0YXRlPy5jdXJyZW50RmVuID09PSBzYXZlZEZlbikge1xuICAgICAgICAgICAgdGhpcy5sb2FkRmVuKHNhdmVkRmVuLCB7XG4gICAgICAgICAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICBzZXNzaW9uSWQ6IHJlc3RvcmVkQm9hcmRTdGF0ZS5nYW1lU2Vzc2lvbklkLFxuICAgICAgICAgICAgICBnYW1lU3RhcnRGZW46IHJlc3RvcmVkQm9hcmRTdGF0ZS5nYW1lU3RhcnRGZW4sXG4gICAgICAgICAgICAgIGhpc3RvcnlBbm5vdGF0aW9uczogcmVzdG9yZWRCb2FyZFN0YXRlLmhpc3RvcnlBbm5vdGF0aW9ucyxcbiAgICAgICAgICAgICAgcmVkb0Fubm90YXRpb25zOiByZXN0b3JlZEJvYXJkU3RhdGUucmVkb0Fubm90YXRpb25zLFxuICAgICAgICAgICAgICBzZXR1cE5hbWU6IHJlc3RvcmVkQm9hcmRTdGF0ZS5jdXJyZW50U2V0dXBOYW1lLFxuICAgICAgICAgICAgICBzZXR1cENhdGVnb3J5OiByZXN0b3JlZEJvYXJkU3RhdGUuY3VycmVudFNldHVwQ2F0ZWdvcnksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2FkRmVuKHNhdmVkRmVuLCB7XG4gICAgICAgICAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudEdhbWVTZXNzaW9uSWQgIT09IHRoaXMuZ2FtZVNlc3Npb25JZCkge1xuICAgICAgICAgICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRCcmlsbGlhbnRUcmFja2luZyh0aGlzLmdhbWVTZXNzaW9uSWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnUmVzdG9yZWQgcG9zaXRpb24gZnJvbSBwcmV2aW91cyBzZXNzaW9uJztcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ1Jlc3RvcmVkIEZFTiBmcm9tIHN0b3JhZ2U6Jywgc2F2ZWRGZW4pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBsb2dnZXIud2FybignU2F2ZWQgRkVOIGlzIGludmFsaWQsIHVzaW5nIGRlZmF1bHQ6JywgZXJyKTtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLkZFTl9TVE9SQUdFX0tFWSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHJlc3RvcmUgRkVOIGZyb20gc3RvcmFnZTonLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIEZFTiBmcm9tIGhpc3RvcnkgYnkgaW5kZXhcbiAgICovXG4gIGxvYWRGZW5Gcm9tSGlzdG9yeShpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhpc3RvcnlKc29uID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5GRU5fSElTVE9SWV9LRVkpO1xuICAgICAgaWYgKCFoaXN0b3J5SnNvbikgcmV0dXJuIGZhbHNlO1xuICAgICAgXG4gICAgICBjb25zdCBoaXN0b3J5OiBzdHJpbmdbXSA9IEpTT04ucGFyc2UoaGlzdG9yeUpzb24pO1xuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBoaXN0b3J5Lmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgXG4gICAgICBjb25zdCBmZW4gPSBoaXN0b3J5W2luZGV4XTtcbiAgICAgIHJldHVybiB0aGlzLmxvYWRGZW4oZmVuKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIGxvYWQgRkVOIGZyb20gaGlzdG9yeTonLCBlcnIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgRkVOIGhpc3RvcnlcbiAgICovXG4gIGdldCBmZW5IaXN0b3J5KCk6IHN0cmluZ1tdIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgaGlzdG9yeUpzb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkZFTl9ISVNUT1JZX0tFWSk7XG4gICAgICByZXR1cm4gaGlzdG9yeUpzb24gPyBKU09OLnBhcnNlKGhpc3RvcnlKc29uKSA6IFtdO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGxhc3Qgc2F2ZWQgRkVOXG4gICAqL1xuICBnZXQgbGFzdFNhdmVkRmVuKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5GRU5fU1RPUkFHRV9LRVkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZSBzaG93aW5nIG1vdmUgYXJyb3dzXG4gICAqL1xuICB0b2dnbGVNb3ZlQXJyb3dzKCk6IHZvaWQge1xuICAgIC8vIENsZWFyIGFueSBwZW5kaW5nIGFuYWx5c2lzIHRpbWVvdXRcbiAgICBpZiAodGhpcy5fYW5hbHlzaXNUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fYW5hbHlzaXNUaW1lb3V0KTtcbiAgICAgIHRoaXMuX2FuYWx5c2lzVGltZW91dCA9IG51bGw7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuc2hvd01vdmVBcnJvd3MgPSAhdGhpcy5zaG93TW92ZUFycm93cztcbiAgICBpZiAodGhpcy5zaG93TW92ZUFycm93cyAmJiBPYmplY3Qua2V5cyh0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMpLmxlbmd0aCA9PT0gMCAmJiAhdGhpcy5pc0FuYWx5emluZ01vdmVzKSB7XG4gICAgICAvLyBBdXRvLWFuYWx5emUgaWYgYXJyb3dzIGFyZSBlbmFibGVkIGFuZCB3ZSBkb24ndCBoYXZlIGFuYWx5c2lzIHlldFxuICAgICAgdGhpcy5hbmFseXplQWxsTW92ZXMoKS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbQm9hcmRWaWV3TW9kZWxdIEZhaWxlZCB0byBhbmFseXplIG1vdmVzOicsIGVycik7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLnNob3dNb3ZlQXJyb3dzKSB7XG4gICAgICAvLyBDbGVhciBhbmFseXNpcyB3aGVuIGFycm93cyBhcmUgZGlzYWJsZWQgdG8gZnJlZSBtZW1vcnlcbiAgICAgIHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcyA9IHt9O1xuICAgICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHNldFNob3dNb3ZlQXJyb3dzRW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2hvd01vdmVBcnJvd3MgIT09IGVuYWJsZWQpIHtcbiAgICAgIHRoaXMudG9nZ2xlTW92ZUFycm93cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hpY2ggc2lkZSdzIG1vdmVzIHRvIHNob3cgYXJyb3dzIGZvclxuICAgKi9cbiAgc2V0U2hvd0Fycm93c0ZvclNpZGUoc2lkZTogJ2N1cnJlbnQnIHwgJ3BsYXllcicgfCAnZW5naW5lJyk6IHZvaWQge1xuICAgIHRoaXMuc2hvd0Fycm93c0ZvclNpZGUgPSBzaWRlO1xuICAgIGxvZ2dlci5kZWJ1ZygnU2hvdyBhcnJvd3MgZm9yIHNpZGU6Jywgc2lkZSk7XG4gICAgLy8gUmUtYW5hbHl6ZSBpZiBhcnJvd3MgYXJlIGVuYWJsZWRcbiAgICBpZiAodGhpcy5zaG93TW92ZUFycm93cykge1xuICAgICAgdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzID0ge307XG4gICAgICB0aGlzLmFuYWx5emVkTGVnYWxNb3Zlc0ZlbiA9IG51bGw7XG4gICAgICB0aGlzLmFuYWx5emVBbGxNb3ZlcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbmFseXplIGFsbCBsZWdhbCBtb3ZlcyBmb3IgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICovXG4gIGFzeW5jIGFuYWx5emVBbGxNb3ZlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5pc0dhbWVPdmVyIHx8IHRoaXMuaXNBbmFseXppbmdNb3Zlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFuYWx5emVkTGVnYWxNb3Zlc0ZlbiA9PT0gdGhpcy5mZW4gJiYgT2JqZWN0LmtleXModGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzKS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzID0ge307IC8vIENsZWFyXG4gICAgICB9KTtcblxuICAgICAgLy8gR2V0IGFsbCBsZWdhbCBtb3Zlc1xuICAgICAgY29uc3QgbGVnYWxNb3ZlcyA9IHRoaXMuYWxsTGVnYWxNb3ZlcztcbiAgICAgIGlmIChsZWdhbE1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIEluaXRpYWxpemUgZW5naW5lIGlmIG5lZWRlZFxuICAgICAgaWYgKCFlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCkge1xuICAgICAgICBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBBbmFseXplIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgIGNvbnN0IGFuYWx5c2lzID0gYXdhaXQgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbihcbiAgICAgICAgdGhpcy5mZW4sXG4gICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCxcbiAgICAgICAgY29uZmlnVmlld01vZGVsLm11bHRpUFYsXG4gICAgICAgICdiYWNrZ3JvdW5kJyxcbiAgICAgICk7XG5cbiAgICAgIGlmIChhbmFseXNpcy5pZ25vcmVkIHx8ICFjYW5BcHBseUFuYWx5emVkTW92ZSh0aGlzLmZlbiwgYW5hbHlzaXMuYW5hbHl6ZWRGZW4pKSB7XG4gICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIGEgbWFwIG9mIFVDSSBtb3ZlcyB0byB0aGVpciBxdWFsaXR5IGJ1Y2tldHNcbiAgICAgIGNvbnN0IG1vdmVNYXAgPSBtYXBMZWdhbE1vdmVzVG9CdWNrZXRzKFxuICAgICAgICBsZWdhbE1vdmVzLm1hcChtb3ZlID0+IGAke21vdmUuZnJvbX0ke21vdmUudG99JHttb3ZlLnByb21vdGlvbiB8fCAnJ31gKSxcbiAgICAgICAgYW5hbHlzaXMubW92ZXMsXG4gICAgICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uLFxuICAgICAgKTtcblxuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSBtb3ZlTWFwO1xuICAgICAgICB0aGlzLmlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmFuYWx5emVkTGVnYWxNb3Zlc0ZlbiA9IHRoaXMuZmVuO1xuICAgICAgbG9nZ2VyLmRlYnVnKCdBbmFseXplZCcsIE9iamVjdC5rZXlzKG1vdmVNYXApLmxlbmd0aCwgJ2xlZ2FsIG1vdmVzJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBhbmFseXplIG1vdmVzOicsIGVycik7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNBbmFseXppbmdNb3ZlcyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFuYWx5emUgdGhlIHF1YWxpdHkgb2YgYSBwbGF5ZXIncyBtb3ZlXG4gICAqIFRoaXMgc2hvdWxkIGJlIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBpcyBtYWRlLCBhbmFseXppbmcgdGhlIHBvc2l0aW9uIGJlZm9yZSB0aGUgbW92ZVxuICAgKi9cbiAgYXN5bmMgYW5hbHl6ZVBsYXllck1vdmUobW92ZTogTW92ZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFJ1biBhc3luY2hyb25vdXNseSBzbyBpdCBkb2Vzbid0IGJsb2NrIHRoZSBVSVxuICAgIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXhwZWN0ZWRBZnRlckZlbiA9IG1vdmUuYWZ0ZXI7XG4gICAgICAgIC8vIEluaXRpYWxpemUgZW5naW5lIGlmIG5lZWRlZFxuICAgICAgICBpZiAoIWVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgYXdhaXQgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCB0aGUgcG9zaXRpb24gYmVmb3JlIHRoZSBtb3ZlIChmcm9tIGhpc3RvcnkpXG4gICAgICAgIGNvbnN0IGhpc3RvcnkgPSB0aGlzLmNoZXNzLmhpc3RvcnkoeyB2ZXJib3NlOiB0cnVlIH0pO1xuICAgICAgICBpZiAoaGlzdG9yeS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm47IC8vIE5vIGhpc3RvcnksIGNhbid0IGFuYWx5emVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBtb3ZlIHdlIGp1c3QgbWFkZSBpcyB0aGUgbGFzdCBvbmUgaW4gaGlzdG9yeVxuICAgICAgICAvLyBXZSBuZWVkIHRvIGFuYWx5emUgdGhlIHBvc2l0aW9uIGJlZm9yZSBpdFxuICAgICAgICAvLyBjaGVzcy5qcyBoaXN0b3J5IHZlcmJvc2UgaW5jbHVkZXMgJ2JlZm9yZScgYW5kICdhZnRlcicgRkVOXG4gICAgICAgIGNvbnN0IGxhc3RNb3ZlSW5IaXN0b3J5ID0gaGlzdG9yeVtoaXN0b3J5Lmxlbmd0aCAtIDFdIGFzIE1vdmUgJiB7IGJlZm9yZT86IHN0cmluZyB9O1xuICAgICAgICBjb25zdCBiZWZvcmVGZW4gPSBsYXN0TW92ZUluSGlzdG9yeS5iZWZvcmUgfHwgdGhpcy5mZW47XG5cbiAgICAgICAgLy8gQW5hbHl6ZSB0aGUgcG9zaXRpb24gYmVmb3JlIHRoZSBtb3ZlXG4gICAgICAgIGNvbnN0IGFuYWx5c2lzID0gYXdhaXQgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbihcbiAgICAgICAgICBiZWZvcmVGZW4sXG4gICAgICAgICAgTWF0aC5taW4oY29uZmlnVmlld01vZGVsLmRlcHRoLCAxNSksIC8vIFVzZSBzbWFsbGVyIGRlcHRoIGZvciBmYXN0ZXIgYW5hbHlzaXNcbiAgICAgICAgICBjb25maWdWaWV3TW9kZWwubXVsdGlQVixcbiAgICAgICAgICAnYmFja2dyb3VuZCcsXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGFuYWx5c2lzLmlnbm9yZWRcbiAgICAgICAgICB8fCAhY2FuQXBwbHlBbmFseXplZE1vdmUoYmVmb3JlRmVuLCBhbmFseXNpcy5hbmFseXplZEZlbilcbiAgICAgICAgICB8fCB0aGlzLmZlbiAhPT0gZXhwZWN0ZWRBZnRlckZlblxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5kIHRoZSBtb3ZlIGluIHRoZSBhbmFseXplZCBtb3Zlc1xuICAgICAgICBjb25zdCBtb3ZlVUNJID0gYCR7bW92ZS5mcm9tfSR7bW92ZS50b30ke21vdmUucHJvbW90aW9uIHx8ICcnfWA7XG4gICAgICAgIGNvbnN0IGFuYWx5emVkTW92ZSA9IGFuYWx5c2lzLm1vdmVzLmZpbmQobSA9PiBtLm1vdmUgPT09IG1vdmVVQ0kpO1xuICAgICAgICBpZiAoYW5hbHl6ZWRNb3ZlKSB7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPSBhbmFseXplZE1vdmUuYnVja2V0O1xuICAgICAgICAgICAgY29uc3QgcXVhbGl0eUxhYmVsID0gQlVDS0VUX0xBQkVMU1thbmFseXplZE1vdmUuYnVja2V0XTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBZb3UgcGxheWVkOiAke21vdmUuc2FufSAoJHtxdWFsaXR5TGFiZWx9KWA7XG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgICAgICBhY3RvcjogJ3BsYXllcicsXG4gICAgICAgICAgICAgIG1vdmUsXG4gICAgICAgICAgICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgICAgICAgcXVhbGl0eUxhYmVsLFxuICAgICAgICAgICAgICBidWNrZXQ6IGFuYWx5emVkTW92ZS5idWNrZXQsXG4gICAgICAgICAgICAgIHNpbGVudDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnUGxheWVyIG1vdmUgcXVhbGl0eTonLCBhbmFseXplZE1vdmUuYnVja2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb24pIHtcbiAgICAgICAgICAgICAgdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPSAnZmFsbGJhY2snO1xuICAgICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn0gKEZhbGxiYWNrIG1vdmUpYDtcbiAgICAgICAgICAgICAgdGhpcy5wdWJsaXNoTW92ZUZlZWRiYWNrKHtcbiAgICAgICAgICAgICAgICBhY3RvcjogJ3BsYXllcicsXG4gICAgICAgICAgICAgICAgbW92ZSxcbiAgICAgICAgICAgICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgICAgICAgICAgICAgcXVhbGl0eUxhYmVsOiAnRmFsbGJhY2sgbW92ZScsXG4gICAgICAgICAgICAgICAgYnVja2V0OiAnZmFsbGJhY2snLFxuICAgICAgICAgICAgICAgIHNpbGVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eSA9ICdnb29kJztcbiAgICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYFlvdSBwbGF5ZWQ6ICR7bW92ZS5zYW59IChHb29kKWA7XG4gICAgICAgICAgICAgIHRoaXMucHVibGlzaE1vdmVGZWVkYmFjayh7XG4gICAgICAgICAgICAgICAgYWN0b3I6ICdwbGF5ZXInLFxuICAgICAgICAgICAgICAgIG1vdmUsXG4gICAgICAgICAgICAgICAgaXNCcmlsbGlhbnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHF1YWxpdHlMYWJlbDogJ0dvb2QnLFxuICAgICAgICAgICAgICAgIGJ1Y2tldDogJ2dvb2QnLFxuICAgICAgICAgICAgICAgIHNpbGVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBhbmFseXplIHBsYXllciBtb3ZlOicsIGVycik7XG4gICAgICAgIC8vIERvbid0IHVwZGF0ZSBzdGF0dXMgb24gZXJyb3IsIGtlZXAgdGhlIG9yaWdpbmFsIG1lc3NhZ2VcbiAgICAgIH1cbiAgICB9LCAxMDApO1xuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZVBsYXllck1vdmVBbmFseXNpcyhtb3ZlOiBNb3ZlKTogdm9pZCB7XG4gICAgdGhpcy5jbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTtcblxuICAgIGNvbnN0IGF0dGVtcHRBbmFseXNpcyA9ICgpOiB2b2lkID0+IHtcbiAgICAgIHRoaXMuX3BsYXllck1vdmVBbmFseXNpc1RpbWVvdXQgPSBudWxsO1xuXG4gICAgICBjb25zdCBhdXRvUGxheVBlbmRpbmcgPVxuICAgICAgICB0aGlzLmF1dG9QbGF5RW5hYmxlZFxuICAgICAgICAmJiAhdGhpcy5hdXRvUGxheVBhdXNlZFxuICAgICAgICAmJiAhdGhpcy5pc0dhbWVPdmVyXG4gICAgICAgICYmICh0aGlzLmlzVGhpbmtpbmcgfHwgdGhpcy5pc0F1dG9QbGF5Q291bnRpbmdEb3duIHx8IHRoaXMudHVybiA9PT0gdGhpcy5lbmdpbmVQbGF5c0Zvcik7XG5cbiAgICAgIGlmIChhdXRvUGxheVBlbmRpbmcpIHtcbiAgICAgICAgdGhpcy5fcGxheWVyTW92ZUFuYWx5c2lzVGltZW91dCA9IHNldFRpbWVvdXQoYXR0ZW1wdEFuYWx5c2lzLCAxNTApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZvaWQgdGhpcy5hbmFseXplUGxheWVyTW92ZShtb3ZlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fcGxheWVyTW92ZUFuYWx5c2lzVGltZW91dCA9IHNldFRpbWVvdXQoYXR0ZW1wdEFuYWx5c2lzLCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYXJyb3dzIGRhdGEgZm9yIHJlYWN0LWNoZXNzYm9hcmRcbiAgICogUmV0dXJucyBhcnJheSBvZiBBcnJvdyBvYmplY3RzIHdpdGggc3RhcnRTcXVhcmUsIGVuZFNxdWFyZSwgYW5kIGNvbG9yIHByb3BlcnRpZXNcbiAgICogT25seSBzaG93cyBhcnJvd3MgZm9yIEV4Y2VsbGVudCwgR29vZCwgTWlzdGFrZSwgYW5kIEJsdW5kZXIgbW92ZXNcbiAgICogTGltaXRlZCB0byBtYXhpbXVtIDMgYXJyb3dzIHBlciBxdWFsaXR5IGJ1Y2tldFxuICAgKi9cbiAgZ2V0IG1vdmVBcnJvd3MoKTogQXJyYXk8eyBzdGFydFNxdWFyZTogc3RyaW5nOyBlbmRTcXVhcmU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9PiB7XG4gICAgaWYgKCF0aGlzLnNob3dNb3ZlQXJyb3dzIHx8IE9iamVjdC5rZXlzKHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcykubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gT25seSBzaG93IGFycm93cyBmb3IgdGhlc2Ugc3BlY2lmaWMgbW92ZSBxdWFsaXRpZXNcbiAgICBjb25zdCBhbGxvd2VkQnVja2V0czogTW92ZUJ1Y2tldFtdID0gWydleGNlbGxlbnQnLCAnZ29vZCcsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcbiAgICBjb25zdCBtYXhBcnJvd3NQZXJCdWNrZXQgPSAzO1xuXG4gICAgbGV0IGxlZ2FsTW92ZXMgPSB0aGlzLmFsbExlZ2FsTW92ZXM7XG5cbiAgICAvLyBGaWx0ZXIgbW92ZXMgYnkgc2lkZSBpZiBuZWVkZWRcbiAgICBpZiAodGhpcy5zaG93QXJyb3dzRm9yU2lkZSA9PT0gJ3BsYXllcicpIHtcbiAgICAgIC8vIFNob3cgbW92ZXMgZm9yIHRoZSBzaWRlIHRoYXQgdGhlIGVuZ2luZSBpcyBOT1QgcGxheWluZyBmb3JcbiAgICAgIGNvbnN0IHBsYXllclNpZGUgPSB0aGlzLmVuZ2luZVBsYXlzRm9yID09PSAndycgPyAnYicgOiAndyc7XG4gICAgICBsZWdhbE1vdmVzID0gbGVnYWxNb3Zlcy5maWx0ZXIobW92ZSA9PiB7XG4gICAgICAgIGNvbnN0IHBpZWNlID0gdGhpcy5nZXRQaWVjZUF0KG1vdmUuZnJvbSk7XG4gICAgICAgIHJldHVybiBwaWVjZSAmJiBwaWVjZS5jb2xvciA9PT0gcGxheWVyU2lkZTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zaG93QXJyb3dzRm9yU2lkZSA9PT0gJ2VuZ2luZScpIHtcbiAgICAgIC8vIFNob3cgbW92ZXMgZm9yIHRoZSBzaWRlIHRoYXQgdGhlIGVuZ2luZSBJUyBwbGF5aW5nIGZvclxuICAgICAgbGVnYWxNb3ZlcyA9IGxlZ2FsTW92ZXMuZmlsdGVyKG1vdmUgPT4ge1xuICAgICAgICBjb25zdCBwaWVjZSA9IHRoaXMuZ2V0UGllY2VBdChtb3ZlLmZyb20pO1xuICAgICAgICByZXR1cm4gcGllY2UgJiYgcGllY2UuY29sb3IgPT09IHRoaXMuZW5naW5lUGxheXNGb3I7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gSWYgJ2N1cnJlbnQnLCBzaG93IGFsbCBsZWdhbCBtb3ZlcyAoYWxyZWFkeSBmaWx0ZXJlZCBieSBjaGVzcy5qcyB0byBjdXJyZW50IHR1cm4pXG5cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gdmFsaWRhdGUgc3F1YXJlIGZvcm1hdCAoYS1oLCAxLTgpXG4gICAgY29uc3QgaXNWYWxpZFNxdWFyZSA9IChzcXVhcmU6IHVua25vd24pOiBzcXVhcmUgaXMgU3F1YXJlID0+IHtcbiAgICAgIGlmICghc3F1YXJlIHx8IHR5cGVvZiBzcXVhcmUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gL15bYS1oXVsxLThdJC8udGVzdChzcXVhcmUpO1xuICAgIH07XG5cbiAgICAvLyBHcm91cCBtb3ZlcyBieSBidWNrZXRcbiAgICBjb25zdCBtb3Zlc0J5QnVja2V0OiBSZWNvcmQ8TW92ZUJ1Y2tldCwgQXJyYXk8eyBzdGFydFNxdWFyZTogc3RyaW5nOyBlbmRTcXVhcmU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9Pj4gPSB7XG4gICAgICBleGNlbGxlbnQ6IFtdLFxuICAgICAgZ29vZDogW10sXG4gICAgICBtaXN0YWtlOiBbXSxcbiAgICAgIGJsdW5kZXI6IFtdLFxuICAgICAgYmVzdDogW10sIC8vIE5vdCB1c2VkIGJ1dCBuZWVkZWQgZm9yIHR5cGVcbiAgICAgIGdyZWF0OiBbXSwgLy8gTm90IHVzZWQgYnV0IG5lZWRlZCBmb3IgdHlwZVxuICAgICAgaW5hY2N1cmFjeTogW10sIC8vIE5vdCB1c2VkIGJ1dCBuZWVkZWQgZm9yIHR5cGVcbiAgICB9O1xuXG4gICAgLy8gQ29sbGVjdCBhbGwgdmFsaWQgbW92ZXMgZ3JvdXBlZCBieSBidWNrZXRcbiAgICBmb3IgKGNvbnN0IG1vdmUgb2YgbGVnYWxNb3Zlcykge1xuICAgICAgLy8gVmFsaWRhdGUgdGhhdCBtb3ZlIGhhcyB2YWxpZCBmcm9tIGFuZCB0byBzcXVhcmVzXG4gICAgICBpZiAoIWlzVmFsaWRTcXVhcmUobW92ZS5mcm9tKSB8fCAhaXNWYWxpZFNxdWFyZShtb3ZlLnRvKSkge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ1NraXBwaW5nIGludmFsaWQgbW92ZTonLCBtb3ZlKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVjaSA9IGAke21vdmUuZnJvbX0ke21vdmUudG99JHttb3ZlLnByb21vdGlvbiB8fCAnJ31gO1xuICAgICAgY29uc3QgYnVja2V0ID0gdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzW3VjaV07XG4gICAgICBcbiAgICAgIC8vIE9ubHkgaW5jbHVkZSBtb3ZlcyBmcm9tIGFsbG93ZWQgYnVja2V0c1xuICAgICAgaWYgKGJ1Y2tldCAmJiBidWNrZXQgIT09ICdmYWxsYmFjaycgJiYgYWxsb3dlZEJ1Y2tldHMuaW5jbHVkZXMoYnVja2V0KSAmJiBpc1ZhbGlkU3F1YXJlKG1vdmUuZnJvbSkgJiYgaXNWYWxpZFNxdWFyZShtb3ZlLnRvKSkge1xuICAgICAgICBtb3Zlc0J5QnVja2V0W2J1Y2tldF0ucHVzaCh7XG4gICAgICAgICAgc3RhcnRTcXVhcmU6IG1vdmUuZnJvbSxcbiAgICAgICAgICBlbmRTcXVhcmU6IG1vdmUudG8sXG4gICAgICAgICAgY29sb3I6IEJVQ0tFVF9DT0xPUlNbYnVja2V0XSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGltaXQgdG8gbWF4IDMgYXJyb3dzIHBlciBidWNrZXQgYW5kIGNvbWJpbmVcbiAgICBjb25zdCBhcnJvd3M6IEFycmF5PHsgc3RhcnRTcXVhcmU6IHN0cmluZzsgZW5kU3F1YXJlOiBzdHJpbmc7IGNvbG9yOiBzdHJpbmcgfT4gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBhbGxvd2VkQnVja2V0cykge1xuICAgICAgY29uc3QgYnVja2V0QXJyb3dzID0gbW92ZXNCeUJ1Y2tldFtidWNrZXRdLnNsaWNlKDAsIG1heEFycm93c1BlckJ1Y2tldCk7XG4gICAgICBhcnJvd3MucHVzaCguLi5idWNrZXRBcnJvd3MpO1xuICAgICAgbG9nZ2VyLmRlYnVnKGBBZGRlZCAke2J1Y2tldEFycm93cy5sZW5ndGh9ICR7YnVja2V0fSBhcnJvd3MgKGZvdW5kICR7bW92ZXNCeUJ1Y2tldFtidWNrZXRdLmxlbmd0aH0gdG90YWwpYCk7XG4gICAgfVxuXG4gICAgbG9nZ2VyLmRlYnVnKCdHZW5lcmF0ZWQnLCBhcnJvd3MubGVuZ3RoLCAndG90YWwgYXJyb3dzJyk7XG4gICAgcmV0dXJuIGFycm93cztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW5hbHl6ZWQgbGVnYWwgbW92ZXMgY291bnQgKGZvciBVSSBkaXNwbGF5KVxuICAgKi9cbiAgZ2V0IGFuYWx5emVkTGVnYWxNb3Zlc0NvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcykubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IHR1cm4gKHdoaXRlL2JsYWNrKVxuICAgKi9cbiAgZ2V0IHR1cm4oKTogJ3cnIHwgJ2InIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy50dXJuKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHR1cm4gYXMgc3RyaW5nXG4gICAqL1xuICBnZXQgdHVyblN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnR1cm4gPT09ICd3JyA/ICdXaGl0ZScgOiAnQmxhY2snO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGdhbWUgaXMgb3ZlclxuICAgKi9cbiAgZ2V0IGlzR2FtZU92ZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaXNHYW1lT3ZlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGl0J3MgY2hlY2ttYXRlXG4gICAqL1xuICBnZXQgaXNDaGVja21hdGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaXNDaGVja21hdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBpdCdzIHN0YWxlbWF0ZVxuICAgKi9cbiAgZ2V0IGlzU3RhbGVtYXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmlzU3RhbGVtYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgaXQncyBhIGRyYXdcbiAgICovXG4gIGdldCBpc0RyYXcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaXNEcmF3KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYga2luZyBpcyBpbiBjaGVja1xuICAgKi9cbiAgZ2V0IGlzQ2hlY2soKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaXNDaGVjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYW1lIHN0YXR1cyB0ZXh0XG4gICAqL1xuICBnZXQgZ2FtZVN0YXR1cygpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmlzQ2hlY2ttYXRlKSB7XG4gICAgICByZXR1cm4gYENoZWNrbWF0ZSEgJHt0aGlzLnR1cm4gPT09ICd3JyA/ICdCbGFjaycgOiAnV2hpdGUnfSB3aW5zYDtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTdGFsZW1hdGUpIHtcbiAgICAgIHJldHVybiAnU3RhbGVtYXRlISc7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRHJhdykge1xuICAgICAgcmV0dXJuICdEcmF3ISc7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzQ2hlY2spIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLnR1cm5TdHJpbmd9IGlzIGluIGNoZWNrYDtcbiAgICB9XG4gICAgcmV0dXJuIGAke3RoaXMudHVyblN0cmluZ30gdG8gbW92ZWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGxlZ2FsIG1vdmVzIGZvciBhIHNxdWFyZVxuICAgKi9cbiAgZ2V0TGVnYWxNb3ZlcyhzcXVhcmU6IFNxdWFyZSk6IE1vdmVbXSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MubW92ZXMoeyBzcXVhcmUsIHZlcmJvc2U6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBpZWNlIGF0IHNxdWFyZSAoZm9yIFVJIHZpc3VhbCBpbmRpY2F0b3JzKVxuICAgKi9cbiAgZ2V0UGllY2VBdChzcXVhcmU6IFNxdWFyZSkge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmdldChzcXVhcmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgbGVnYWwgbW92ZXNcbiAgICovXG4gIGdldCBhbGxMZWdhbE1vdmVzKCk6IE1vdmVbXSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MubW92ZXMoeyB2ZXJib3NlOiB0cnVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBtb3ZlIGNvdW50XG4gICAqL1xuICBnZXQgbW92ZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MubW92ZU51bWJlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuZG8gYSBzaW5nbGUgbW92ZSAoZm9yIHRoZSBuZXcgdW5kbyBidXR0b24pXG4gICAqL1xuICB1bmRvU2luZ2xlKCk6IGJvb2xlYW4ge1xuICAgIGxvZ2dlci5kZWJ1ZygndW5kb1NpbmdsZSBjYWxsZWQsIGhpc3RvcnkgbGVuZ3RoOicsIHRoaXMuaGlzdG9yeS5sZW5ndGgpO1xuICAgIFxuICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLnVuZG8oKTtcbiAgICBpZiAobW92ZSkge1xuICAgICAgLy8gQWRkIHRvIHJlZG8gc3RhY2tcbiAgICAgIHRoaXMucmVkb1N0YWNrLnB1c2gobW92ZSk7XG4gICAgICBjb25zdCBhbm5vdGF0aW9uID0gdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMucG9wKCk7XG4gICAgICBpZiAoYW5ub3RhdGlvbikge1xuICAgICAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucy5wdXNoKGFubm90YXRpb24pO1xuICAgICAgfVxuICAgICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgIFxuICAgICAgLy8gVXBkYXRlIGxhc3RNb3ZlIGlmIHRoZXJlIGFyZSBzdGlsbCBtb3ZlcyBpbiBoaXN0b3J5XG4gICAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbGFzdE1vdmVJbkhpc3RvcnkgPSB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5Lmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0geyBmcm9tOiBsYXN0TW92ZUluSGlzdG9yeS5mcm9tIGFzIFNxdWFyZSwgdG86IGxhc3RNb3ZlSW5IaXN0b3J5LnRvIGFzIFNxdWFyZSB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IG51bGw7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnVW5kaWQgMSBtb3ZlJztcbiAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICB0aGlzLmNsZWFyUGVuZGluZ1BsYXllck1vdmVBbmFseXNpcygpO1xuICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICBsb2dnZXIuZGVidWcoJ1VuZGlkIDEgbW92ZSwgcmVkbyBzdGFjayBzaXplOicsIHRoaXMucmVkb1N0YWNrLmxlbmd0aCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZG8gYSBzaW5nbGUgbW92ZVxuICAgKi9cbiAgcmVkb1NpbmdsZSgpOiBib29sZWFuIHtcbiAgICBsb2dnZXIuZGVidWcoJ3JlZG9TaW5nbGUgY2FsbGVkLCByZWRvIHN0YWNrIHNpemU6JywgdGhpcy5yZWRvU3RhY2subGVuZ3RoKTtcbiAgICBcbiAgICBpZiAodGhpcy5yZWRvU3RhY2subGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IG1vdmVUb1JlZG8gPSB0aGlzLnJlZG9TdGFjay5wb3AoKTtcbiAgICBpZiAoIW1vdmVUb1JlZG8pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgYW5ub3RhdGlvblRvUmVkbyA9IHRoaXMucmVkb0Fubm90YXRpb25zLnBvcCgpO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgZnJvbTogbW92ZVRvUmVkby5mcm9tIGFzIFNxdWFyZSxcbiAgICAgICAgdG86IG1vdmVUb1JlZG8udG8gYXMgU3F1YXJlLFxuICAgICAgICBwcm9tb3Rpb246IG1vdmVUb1JlZG8ucHJvbW90aW9uLFxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIGlmIChtb3ZlKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeUFubm90YXRpb25zLnB1c2goXG4gICAgICAgICAgYW5ub3RhdGlvblRvUmVkbyA/PyB0aGlzLmNyZWF0ZU1vdmVBbm5vdGF0aW9uKG1vdmUsIGZhbHNlLCAncmVkbycpLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLnN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSB7IGZyb206IG1vdmUuZnJvbSBhcyBTcXVhcmUsIHRvOiBtb3ZlLnRvIGFzIFNxdWFyZSB9O1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgUmVkaWQ6ICR7bW92ZS5zYW59YDtcbiAgICAgICAgdGhpcy5wdWJsaXNoTW92ZUZlZWRiYWNrKHtcbiAgICAgICAgICBhY3RvcjogJ3JlZG8nLFxuICAgICAgICAgIG1vdmUsXG4gICAgICAgICAgaXNCcmlsbGlhbnQ6IGFubm90YXRpb25Ub1JlZG8/LmNvbnN1bWVkQnJpbGxpYW50ID8/IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTtcbiAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnUmVkaWQgMSBtb3ZlJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBJZiBhdXRvLXBsYXkgaXMgZW5hYmxlZCBhbmQgaXQncyBub3cgdGhlIGVuZ2luZSdzIHR1cm4sIHRyaWdnZXIgYXV0by1wbGF5XG4gICAgICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiAhdGhpcy5pc0dhbWVPdmVyICYmIHRoaXMuY2hlc3MudHVybigpID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yKSB7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdTY2hlZHVsaW5nIGF1dG8tcGxheSBhZnRlciByZWRvJyk7XG4gICAgICAgICAgdGhpcy5zY2hlZHVsZUF1dG9QbGF5TW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignUmVkbyBmYWlsZWQ6JywgZXJyKTtcbiAgICAgIC8vIFB1dCB0aGUgbW92ZSBiYWNrIG9uIHRoZSBzdGFjayBpZiBpdCBmYWlsZWRcbiAgICAgIHRoaXMucmVkb1N0YWNrLnB1c2gobW92ZVRvUmVkbyk7XG4gICAgICBpZiAoYW5ub3RhdGlvblRvUmVkbykge1xuICAgICAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucy5wdXNoKGFubm90YXRpb25Ub1JlZG8pO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdW5kbyBpcyBhdmFpbGFibGVcbiAgICovXG4gIGdldCBjYW5VbmRvKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmhpc3RvcnkubGVuZ3RoID4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiByZWRvIGlzIGF2YWlsYWJsZVxuICAgKi9cbiAgZ2V0IGNhblJlZG8oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucmVkb1N0YWNrLmxlbmd0aCA+IDA7XG4gIH1cblxuICBnZXQgYXV0b1BsYXlDdXJyZW50U2lkZUxhYmVsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZW5naW5lUGxheXNGb3IgPT09ICd3JyA/ICdXaGl0ZScgOiAnQmxhY2snO1xuICB9XG5cbiAgZ2V0IGNhblN0YXJ0QXV0b1BsYXlUdXJuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmF1dG9QbGF5RW5hYmxlZFxuICAgICAgJiYgIXRoaXMuYXV0b1BsYXlQYXVzZWRcbiAgICAgICYmICF0aGlzLmlzVGhpbmtpbmdcbiAgICAgICYmICF0aGlzLmlzR2FtZU92ZXJcbiAgICAgICYmIHRoaXMudHVybiA9PT0gdGhpcy5lbmdpbmVQbGF5c0ZvcjtcbiAgfVxuXG4gIGdldCBpc0F1dG9QbGF5Q291bnRpbmdEb3duKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmF1dG9QbGF5U2NoZWR1bGVkRm9yID4gRGF0ZS5ub3coKTtcbiAgfVxuXG4gIGdldCBhdXRvUGxheUNvdW50ZG93bk1zUmVtYWluaW5nKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaXNBdXRvUGxheUNvdW50aW5nRG93blxuICAgICAgPyBNYXRoLm1heCgwLCB0aGlzLmF1dG9QbGF5U2NoZWR1bGVkRm9yIC0gRGF0ZS5ub3coKSlcbiAgICAgIDogMDtcbiAgfVxuXG4gIGdldCBtb3ZlSGlzdG9yeVJvd3MoKTogQXJyYXk8eyBtb3ZlTnVtYmVyOiBudW1iZXI7IHdoaXRlOiBNb3ZlIHwgbnVsbDsgYmxhY2s6IE1vdmUgfCBudWxsIH0+IHtcbiAgICBjb25zdCByb3dzOiBBcnJheTx7IG1vdmVOdW1iZXI6IG51bWJlcjsgd2hpdGU6IE1vdmUgfCBudWxsOyBibGFjazogTW92ZSB8IG51bGwgfT4gPSBbXTtcblxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLmhpc3RvcnkubGVuZ3RoOyBpbmRleCArPSAyKSB7XG4gICAgICBjb25zdCB3aGl0ZU1vdmUgPSB0aGlzLmhpc3RvcnlbaW5kZXhdID8/IG51bGw7XG4gICAgICBjb25zdCBibGFja01vdmUgPSB0aGlzLmhpc3RvcnlbaW5kZXggKyAxXSA/PyBudWxsO1xuICAgICAgY29uc3QgbW92ZU51bWJlciA9IHdoaXRlTW92ZT8ubW92ZU51bWJlciA/PyBibGFja01vdmU/Lm1vdmVOdW1iZXIgPz8gcm93cy5sZW5ndGggKyAxO1xuICAgICAgcm93cy5wdXNoKHtcbiAgICAgICAgbW92ZU51bWJlcixcbiAgICAgICAgd2hpdGU6IHdoaXRlTW92ZSxcbiAgICAgICAgYmxhY2s6IGJsYWNrTW92ZSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZ2V0IGRlYnVnU2Vzc2lvbklkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZ2FtZVNlc3Npb25JZDtcbiAgfVxuXG4gIGdldCBtb3ZlQW5ub3RhdGlvbnMoKTogTW92ZUFubm90YXRpb25bXSB7XG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeUFubm90YXRpb25zLm1hcCgoYW5ub3RhdGlvbikgPT4gKHsgLi4uYW5ub3RhdGlvbiB9KSk7XG4gIH1cblxuICBnZXQgYXV0b1BsYXlBY3RpdmVEdXJhdGlvbk1zKCk6IG51bWJlciB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXlFbmFibGVkICYmICF0aGlzLmF1dG9QbGF5UGF1c2VkICYmIHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0ICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5hdXRvUGxheUFjY3VtdWxhdGVkTXMgKyAoRGF0ZS5ub3coKSAtIHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5hdXRvUGxheUFjY3VtdWxhdGVkTXM7XG4gIH1cblxuICBnZXQgaGFzU2tpcHBlZEVuZ2luZU1vdmVOb3RpY2UoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubGFzdFNraXBwZWRFbmdpbmVNb3ZlTWVzc2FnZSAhPT0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvcnQgY3VycmVudCBnYW1lIGFzIFBHTlxuICAgKi9cbiAgZ2V0IHBnbigpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLnBnbigpO1xuICB9XG5cbiAgZ2V0IGxhc3RQbGF5ZXJNb3ZlUXVhbGl0eUxhYmVsKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eSA/IERJU1BMQVlfQlVDS0VUX0xBQkVMU1t0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eV0gOiBudWxsO1xuICB9XG5cbiAgZ2V0IGxhc3RQbGF5ZXJNb3ZlUXVhbGl0eUNvbG9yKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eSA/IERJU1BMQVlfQlVDS0VUX0NPTE9SU1t0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eV0gOiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSB3YWl0KGRlbGF5TXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXlNcyk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGdldCBjYW5TY2hlZHVsZUF1dG9QbGF5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmF1dG9QbGF5RW5hYmxlZFxuICAgICAgJiYgIXRoaXMuYXV0b1BsYXlQYXVzZWRcbiAgICAgICYmICF0aGlzLmlzVGhpbmtpbmdcbiAgICAgICYmICF0aGlzLmlzR2FtZU92ZXJcbiAgICAgICYmIHRoaXMudHVybiA9PT0gdGhpcy5lbmdpbmVQbGF5c0ZvcjtcbiAgfVxuXG4gIHByaXZhdGUgYmVnaW5TZXNzaW9uU3RhdGUob3B0aW9uczoge1xuICAgIGdhbWVTZXNzaW9uSWQ6IHN0cmluZztcbiAgICBnYW1lU3RhcnRGZW46IHN0cmluZztcbiAgICByZXNldEJyaWxsaWFudFRyYWNraW5nOiBib29sZWFuO1xuICAgIGhpc3RvcnlBbm5vdGF0aW9ucz86IE1vdmVBbm5vdGF0aW9uW107XG4gICAgcmVkb0Fubm90YXRpb25zPzogTW92ZUFubm90YXRpb25bXTtcbiAgICBzZXR1cE5hbWU/OiBzdHJpbmc7XG4gICAgc2V0dXBDYXRlZ29yeT86IHN0cmluZztcbiAgfSk6IHZvaWQge1xuICAgIHRoaXMuc3RvcEF1dG9QbGF5RHVyYXRpb25UcmFja2luZygpO1xuICAgIHRoaXMuZ2FtZVNlc3Npb25JZCA9IG9wdGlvbnMuZ2FtZVNlc3Npb25JZDtcbiAgICB0aGlzLmdhbWVTdGFydEZlbiA9IG9wdGlvbnMuZ2FtZVN0YXJ0RmVuO1xuICAgIHRoaXMuc2Vzc2lvblN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgdGhpcy5jdXJyZW50U2V0dXBOYW1lID0gb3B0aW9ucy5zZXR1cE5hbWUgPz8gJ0N1c3RvbSBQb3NpdGlvbic7XG4gICAgdGhpcy5jdXJyZW50U2V0dXBDYXRlZ29yeSA9IG9wdGlvbnMuc2V0dXBDYXRlZ29yeSA/PyAnY3VzdG9tJztcbiAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucyA9IFsuLi4ob3B0aW9ucy5oaXN0b3J5QW5ub3RhdGlvbnMgPz8gW10pXTtcbiAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucyA9IFsuLi4ob3B0aW9ucy5yZWRvQW5ub3RhdGlvbnMgPz8gW10pXTtcbiAgICB0aGlzLnJlZG9TdGFjayA9IHRoaXMuY3JlYXRlUmVkb1N0YWNrRnJvbUFubm90YXRpb25zKHRoaXMucmVkb0Fubm90YXRpb25zKTtcbiAgICB0aGlzLmF1dG9QbGF5QWNjdW11bGF0ZWRNcyA9IDA7XG4gICAgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgPSB0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiAhdGhpcy5hdXRvUGxheVBhdXNlZCA/IERhdGUubm93KCkgOiBudWxsO1xuICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgaWYgKG9wdGlvbnMucmVzZXRCcmlsbGlhbnRUcmFja2luZykge1xuICAgICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRCcmlsbGlhbnRUcmFja2luZyh0aGlzLmdhbWVTZXNzaW9uSWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJSZWRvU3RhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5yZWRvU3RhY2sgPSBbXTtcbiAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucyA9IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVNb3ZlQW5ub3RhdGlvbihcbiAgICBtb3ZlOiBNb3ZlICYgeyBiZWZvcmU/OiBzdHJpbmc7IGFmdGVyPzogc3RyaW5nIH0sXG4gICAgY29uc3VtZWRCcmlsbGlhbnQ6IGJvb2xlYW4sXG4gICAgYWN0b3I6ICdwbGF5ZXInIHwgJ2VuZ2luZScgfCAncmVkbycsXG4gICk6IE1vdmVBbm5vdGF0aW9uIHtcbiAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IHByZXZpb3VzVGltZXN0YW1wID0gdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnNbdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMubGVuZ3RoIC0gMV0/LnRpbWVzdGFtcCA/PyB0aGlzLnNlc3Npb25TdGFydGVkQXQ7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJlZm9yZUZlbjogbW92ZS5iZWZvcmUgPz8gdGhpcy5mZW4sXG4gICAgICBhZnRlckZlbjogbW92ZS5hZnRlciA/PyB0aGlzLmNoZXNzLmZlbigpLFxuICAgICAgdWNpOiBgJHttb3ZlLmZyb219JHttb3ZlLnRvfSR7bW92ZS5wcm9tb3Rpb24gfHwgJyd9YCxcbiAgICAgIG1vdmVOdW1iZXI6IHRoaXMuY2hlc3MubW92ZU51bWJlcigpLFxuICAgICAgY29uc3VtZWRCcmlsbGlhbnQsXG4gICAgICBhY3RvcixcbiAgICAgIHNhbjogbW92ZS5zYW4sXG4gICAgICB0aW1lc3RhbXAsXG4gICAgICBkZWxheU1zU2luY2VQcmV2aW91czogTWF0aC5tYXgoMCwgdGltZXN0YW1wIC0gcHJldmlvdXNUaW1lc3RhbXApLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHJlY29yZE1vdmVBbm5vdGF0aW9uKFxuICAgIG1vdmU6IE1vdmUgJiB7IGJlZm9yZT86IHN0cmluZzsgYWZ0ZXI/OiBzdHJpbmcgfSxcbiAgICBjb25zdW1lZEJyaWxsaWFudDogYm9vbGVhbixcbiAgICBhY3RvcjogJ3BsYXllcicgfCAnZW5naW5lJyB8ICdyZWRvJyxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMucHVzaCh0aGlzLmNyZWF0ZU1vdmVBbm5vdGF0aW9uKG1vdmUsIGNvbnN1bWVkQnJpbGxpYW50LCBhY3RvcikpO1xuICAgIHRoaXMuc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk7XG4gIH1cblxuICBwcml2YXRlIHN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpOiB2b2lkIHtcbiAgICBjb25zdCB1c2FnZSA9IGRlcml2ZUJyaWxsaWFudFVzYWdlKHRoaXMuaGlzdG9yeUFubm90YXRpb25zKTtcbiAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZWNvbmNpbGVCcmlsbGlhbnRUcmFja2luZyhcbiAgICAgIHRoaXMuZ2FtZVNlc3Npb25JZCxcbiAgICAgIHVzYWdlLmJyaWxsaWFudE1vdmVOdW1iZXJzLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHNjaGVkdWxlQXV0b1BsYXlNb3ZlKGRlbGF5TXMgPSB1aVN0YXRlVmlld01vZGVsLmF1dG9QbGF5RGVsYXlNcyk6IHZvaWQge1xuICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG5cbiAgICBpZiAoIXRoaXMuY2FuU2NoZWR1bGVBdXRvUGxheSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgPSBEYXRlLm5vdygpICsgZGVsYXlNcztcbiAgICB0aGlzLl9hdXRvUGxheVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5hdXRvUGxheVNjaGVkdWxlZEZvciA9IDA7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuc29sdmVOZXh0TW92ZSh0cnVlKS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ0F1dG8tcGxheSBlcnJvcjonLCBlcnIpO1xuICAgICAgfSk7XG4gICAgfSwgZGVsYXlNcyk7XG4gIH1cblxuICBwcml2YXRlIGNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYXV0b1BsYXlUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fYXV0b1BsYXlUaW1lb3V0KTtcbiAgICAgIHRoaXMuX2F1dG9QbGF5VGltZW91dCA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgPSAwO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BsYXllck1vdmVBbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wbGF5ZXJNb3ZlQW5hbHlzaXNUaW1lb3V0KTtcbiAgICAgIHRoaXMuX3BsYXllck1vdmVBbmFseXNpc1RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVzZXRUcmFuc2llbnRCb2FyZFN0YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9hbmFseXNpc1RpbWVvdXQpO1xuICAgICAgdGhpcy5fYW5hbHlzaXNUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG4gICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgdGhpcy5hdXRvUGxheVBhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgPSAwO1xuICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gbnVsbDtcbiAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICB0aGlzLmFuYWx5emVkTGVnYWxNb3Zlc0ZlbiA9IG51bGw7XG4gIH1cblxuICBwcml2YXRlIHN5bmNBdXRvUGxheVNjaGVkdWxlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNhblNjaGVkdWxlQXV0b1BsYXkpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVBdXRvUGxheU1vdmUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdG9wQXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5hdXRvUGxheUFjY3VtdWxhdGVkTXMgKz0gRGF0ZS5ub3coKSAtIHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0O1xuICAgICAgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3RhcnRBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXlFbmFibGVkICYmICF0aGlzLmF1dG9QbGF5UGF1c2VkICYmIHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0ID09PSBudWxsKSB7XG4gICAgICB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCA9IERhdGUubm93KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVMYXN0QW5ub3RhdGlvbihwYXJ0aWFsOiBQYXJ0aWFsPE1vdmVBbm5vdGF0aW9uPik6IHZvaWQge1xuICAgIGlmICh0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5sZW5ndGggLSAxO1xuICAgIHRoaXMuaGlzdG9yeUFubm90YXRpb25zW2xhc3RJbmRleF0gPSB7XG4gICAgICAuLi50aGlzLmhpc3RvcnlBbm5vdGF0aW9uc1tsYXN0SW5kZXhdLFxuICAgICAgLi4ucGFydGlhbCxcbiAgICB9O1xuICAgIHRoaXMuc2F2ZUZlblRvSGlzdG9yeSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBwdWJsaXNoTW92ZUZlZWRiYWNrKG9wdGlvbnM6IHtcbiAgICBhY3RvcjogJ3BsYXllcicgfCAnZW5naW5lJyB8ICdyZWRvJztcbiAgICBtb3ZlOiBNb3ZlO1xuICAgIGlzQnJpbGxpYW50OiBib29sZWFuO1xuICAgIHF1YWxpdHlMYWJlbD86IHN0cmluZyB8IG51bGw7XG4gICAgYnVja2V0PzogRGlzcGxheU1vdmVCdWNrZXQgfCBNb3ZlQnVja2V0IHwgbnVsbDtcbiAgICBzaWxlbnQ/OiBib29sZWFuO1xuICB9KTogdm9pZCB7XG4gICAgdGhpcy5yZWNlbnRNb3ZlRmVlZGJhY2sgPSB7XG4gICAgICBpZDogYCR7RGF0ZS5ub3coKX1fJHtvcHRpb25zLm1vdmUuc2FufV8ke29wdGlvbnMuYWN0b3J9YCxcbiAgICAgIGFjdG9yOiBvcHRpb25zLmFjdG9yLFxuICAgICAgc2FuOiBvcHRpb25zLm1vdmUuc2FuLFxuICAgICAgcXVhbGl0eUxhYmVsOiBvcHRpb25zLnF1YWxpdHlMYWJlbCA/PyBudWxsLFxuICAgICAgYnVja2V0OiBvcHRpb25zLmJ1Y2tldCA/PyBudWxsLFxuICAgICAgaXNCcmlsbGlhbnQ6IG9wdGlvbnMuaXNCcmlsbGlhbnQsXG4gICAgICBpc0NhcHR1cmU6IG9wdGlvbnMubW92ZS5pc0NhcHR1cmUoKSxcbiAgICAgIGlzQ2hlY2s6IG9wdGlvbnMubW92ZS5zYW4uaW5jbHVkZXMoJysnKSB8fCBvcHRpb25zLm1vdmUuc2FuLmluY2x1ZGVzKCcjJyksXG4gICAgICBpc0dhbWVFbmQ6IHRoaXMuaXNHYW1lT3ZlcixcbiAgICAgIHNpbGVudDogb3B0aW9ucy5zaWxlbnQgPz8gZmFsc2UsXG4gICAgICBjcmVhdGVkQXQ6IERhdGUubm93KCksXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgdW5kb01vdmVzKGNvdW50OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBjb25zdCB1bmRvbmVNb3ZlczogTW92ZVtdID0gW107XG4gICAgY29uc3QgdW5kb25lQW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW10gPSBbXTtcblxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjb3VudDsgaW5kZXggKz0gMSkge1xuICAgICAgY29uc3QgbW92ZSA9IHRoaXMuY2hlc3MudW5kbygpO1xuICAgICAgaWYgKCFtb3ZlKSB7XG4gICAgICAgIGZvciAobGV0IHJlc3RvcmVJbmRleCA9IHVuZG9uZU1vdmVzLmxlbmd0aCAtIDE7IHJlc3RvcmVJbmRleCA+PSAwOyByZXN0b3JlSW5kZXggLT0gMSkge1xuICAgICAgICAgIGNvbnN0IHJlc3RvcmVNb3ZlID0gdW5kb25lTW92ZXNbcmVzdG9yZUluZGV4XTtcbiAgICAgICAgICB0aGlzLmNoZXNzLm1vdmUoe1xuICAgICAgICAgICAgZnJvbTogcmVzdG9yZU1vdmUuZnJvbSBhcyBTcXVhcmUsXG4gICAgICAgICAgICB0bzogcmVzdG9yZU1vdmUudG8gYXMgU3F1YXJlLFxuICAgICAgICAgICAgcHJvbW90aW9uOiByZXN0b3JlTW92ZS5wcm9tb3Rpb24sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB1bmRvbmVNb3Zlcy5wdXNoKG1vdmUpO1xuICAgICAgY29uc3QgYW5ub3RhdGlvbiA9IHRoaXMuaGlzdG9yeUFubm90YXRpb25zLnBvcCgpO1xuICAgICAgaWYgKGFubm90YXRpb24pIHtcbiAgICAgICAgdW5kb25lQW5ub3RhdGlvbnMucHVzaChhbm5vdGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlZG9TdGFjay5wdXNoKC4uLnVuZG9uZU1vdmVzKTtcbiAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucy5wdXNoKC4uLnVuZG9uZUFubm90YXRpb25zKTtcbiAgICB0aGlzLnN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkUGVyc2lzdGVkQm9hcmRTdGF0ZSgpOiBQZXJzaXN0ZWRCb2FyZFN0YXRlIHwgbnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucGVyc2lzdEVuZ2luZUNvbmZpZykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkJPQVJEX1NUQVRFX1NUT1JBR0VfS0VZKTtcbiAgICAgIGlmICghc2F2ZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzIFBhcnRpYWw8UGVyc2lzdGVkQm9hcmRTdGF0ZT47XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50RmVuOiBwYXJzZWQuY3VycmVudEZlbiA/PyAnJyxcbiAgICAgICAgZmVuSGlzdG9yeTogQXJyYXkuaXNBcnJheShwYXJzZWQuZmVuSGlzdG9yeSkgPyBwYXJzZWQuZmVuSGlzdG9yeSA6IFtdLFxuICAgICAgICBnYW1lU2Vzc2lvbklkOiBwYXJzZWQuZ2FtZVNlc3Npb25JZCA/PyBjcmVhdGVHYW1lU2Vzc2lvbklkKCksXG4gICAgICAgIGdhbWVTdGFydEZlbjogcGFyc2VkLmdhbWVTdGFydEZlbiA/PyBwYXJzZWQuY3VycmVudEZlbiA/PyBuZXcgQ2hlc3MoKS5mZW4oKSxcbiAgICAgICAgaGlzdG9yeUFubm90YXRpb25zOiBBcnJheS5pc0FycmF5KHBhcnNlZC5oaXN0b3J5QW5ub3RhdGlvbnMpID8gcGFyc2VkLmhpc3RvcnlBbm5vdGF0aW9ucyA6IFtdLFxuICAgICAgICByZWRvQW5ub3RhdGlvbnM6IEFycmF5LmlzQXJyYXkocGFyc2VkLnJlZG9Bbm5vdGF0aW9ucykgPyBwYXJzZWQucmVkb0Fubm90YXRpb25zIDogW10sXG4gICAgICB9O1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclBlcnNpc3RlZEJvYXJkU3RhdGUoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuQk9BUkRfU1RBVEVfU1RPUkFHRV9LRVkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBjbGVhciBib2FyZCBzdGF0ZSBzdG9yYWdlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVJlZG9TdGFja0Zyb21Bbm5vdGF0aW9ucyhhbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSk6IE1vdmVbXSB7XG4gICAgcmV0dXJuIGFubm90YXRpb25zLm1hcCgoYW5ub3RhdGlvbikgPT4gKHtcbiAgICAgIGZyb206IGFubm90YXRpb24udWNpLnNsaWNlKDAsIDIpLFxuICAgICAgdG86IGFubm90YXRpb24udWNpLnNsaWNlKDIsIDQpLFxuICAgICAgcHJvbW90aW9uOiBhbm5vdGF0aW9uLnVjaS5sZW5ndGggPiA0ID8gYW5ub3RhdGlvbi51Y2lbNF0gOiB1bmRlZmluZWQsXG4gICAgfSkpIGFzIE1vdmVbXTtcbiAgfVxufVxuXG4vLyBTaW5nbGV0b24gaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBib2FyZFZpZXdNb2RlbCA9IG5ldyBCb2FyZFZpZXdNb2RlbCgpO1xuIiwgImltcG9ydCB7IE1vdmVBbm5vdGF0aW9uIH0gZnJvbSAnLi9icmlsbGlhbnRUcmFja2luZyc7XG5pbXBvcnQgeyBEaXNwbGF5TW92ZUJ1Y2tldCwgTW92ZVF1YWxpdHlQcmVzZXRJZCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdhbWVBbmFseXRpY3NTdW1tYXJ5IHtcbiAgc2Vzc2lvbklkOiBzdHJpbmc7XG4gIGNyZWF0ZWRBdDogc3RyaW5nO1xuICBmaW5pc2hlZEF0OiBzdHJpbmc7XG4gIHJlc3VsdDogc3RyaW5nO1xuICBnYW1lU3RhdHVzOiBzdHJpbmc7XG4gIHBlcnNvbmFJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8ICdjdXN0b20nO1xuICBwZXJzb25hTGFiZWw6IHN0cmluZztcbiAgc2V0dXBOYW1lOiBzdHJpbmc7XG4gIHNldHVwQ2F0ZWdvcnk6IHN0cmluZztcbiAgbW92ZUNvdW50OiBudW1iZXI7XG4gIGJyaWxsaWFudE1vdmVzOiBudW1iZXI7XG4gIGluYWNjdXJhY2llczogbnVtYmVyO1xuICBtaXN0YWtlczogbnVtYmVyO1xuICBibHVuZGVyczogbnVtYmVyO1xuICBhdmVyYWdlRXZhbExvc3M6IG51bWJlcjtcbiAgYXZlcmFnZU1vdmVEZWxheU1zOiBudW1iZXI7XG4gIGF1dG9wbGF5RHVyYXRpb25NczogbnVtYmVyO1xuICBxdWFsaXR5Q291bnRzOiBSZWNvcmQ8RGlzcGxheU1vdmVCdWNrZXQsIG51bWJlcj47XG4gIGNvbXBsZXhpdHlEaXN0cmlidXRpb246IFJlY29yZDwnbG93JyB8ICdtZWRpdW0nIHwgJ2hpZ2gnLCBudW1iZXI+O1xuICBtb3ZlVGltZWxpbmU6IEFycmF5PHtcbiAgICBwbHk6IG51bWJlcjtcbiAgICBhY3RvcjogJ3BsYXllcicgfCAnZW5naW5lJyB8ICdyZWRvJztcbiAgICBzYW46IHN0cmluZztcbiAgICBidWNrZXQ6IHN0cmluZyB8IG51bGw7XG4gICAgZXZhbExvc3M6IG51bWJlciB8IG51bGw7XG4gICAgZXZhbHVhdGlvbjogbnVtYmVyIHwgbnVsbDtcbiAgICBjb21wbGV4aXR5TGV2ZWw6ICdsb3cnIHwgJ21lZGl1bScgfCAnaGlnaCcgfCBudWxsO1xuICAgIGNvbXBsZXhpdHlTY29yZTogbnVtYmVyIHwgbnVsbDtcbiAgICBkZWxheU1zU2luY2VQcmV2aW91czogbnVtYmVyO1xuICAgIGNvbnN1bWVkQnJpbGxpYW50OiBib29sZWFuO1xuICB9PjtcbiAgaGlnaGxpZ2h0ZWRCcmlsbGlhbnRNb3ZlczogQXJyYXk8eyBwbHk6IG51bWJlcjsgc2FuOiBzdHJpbmcgfT47XG4gIG1ham9yTWlzdGFrZXM6IEFycmF5PHsgcGx5OiBudW1iZXI7IHNhbjogc3RyaW5nOyBidWNrZXQ6IHN0cmluZyB8IG51bGw7IGV2YWxMb3NzOiBudW1iZXIgfCBudWxsIH0+O1xuICBldmFsVHJlbmQ6IEFycmF5PHsgcGx5OiBudW1iZXI7IGV2YWx1YXRpb246IG51bWJlciB9PjtcbiAgY29tcGxleGl0eVRyZW5kOiBBcnJheTx7IHBseTogbnVtYmVyOyBzY29yZTogbnVtYmVyIH0+O1xuICBwZ246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZWNlbnRHYW1lRW50cnkge1xuICBzZXNzaW9uSWQ6IHN0cmluZztcbiAgZmluaXNoZWRBdDogc3RyaW5nO1xuICByZXN1bHQ6IHN0cmluZztcbiAgcGVyc29uYUxhYmVsOiBzdHJpbmc7XG4gIHBlcnNvbmFJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8ICdjdXN0b20nO1xuICBzZXR1cE5hbWU6IHN0cmluZztcbiAgZHVyYXRpb25NczogbnVtYmVyO1xuICBtb3ZlQ291bnQ6IG51bWJlcjtcbiAgYnJpbGxpYW50TW92ZXM6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdWlsZEdhbWVBbmFseXRpY3NPcHRpb25zIHtcbiAgc2Vzc2lvbklkOiBzdHJpbmc7XG4gIGNyZWF0ZWRBdE1zOiBudW1iZXI7XG4gIGZpbmlzaGVkQXRNczogbnVtYmVyO1xuICBnYW1lU3RhdHVzOiBzdHJpbmc7XG4gIHBlcnNvbmFJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGw7XG4gIHBlcnNvbmFMYWJlbDogc3RyaW5nO1xuICBzZXR1cE5hbWU/OiBzdHJpbmcgfCBudWxsO1xuICBzZXR1cENhdGVnb3J5Pzogc3RyaW5nIHwgbnVsbDtcbiAgYXV0b3BsYXlEdXJhdGlvbk1zOiBudW1iZXI7XG4gIG1vdmVBbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXTtcbiAgcGduOiBzdHJpbmc7XG59XG5cbmNvbnN0IEFMTF9CVUNLRVRTOiBEaXNwbGF5TW92ZUJ1Y2tldFtdID0gW1xuICAnYmVzdCcsXG4gICdncmVhdCcsXG4gICdleGNlbGxlbnQnLFxuICAnZ29vZCcsXG4gICdpbmFjY3VyYWN5JyxcbiAgJ21pc3Rha2UnLFxuICAnYmx1bmRlcicsXG4gICdmYWxsYmFjaycsXG5dO1xuXG5mdW5jdGlvbiBjcmVhdGVFbXB0eVF1YWxpdHlDb3VudHMoKTogUmVjb3JkPERpc3BsYXlNb3ZlQnVja2V0LCBudW1iZXI+IHtcbiAgcmV0dXJuIEFMTF9CVUNLRVRTLnJlZHVjZSgoY291bnRzLCBidWNrZXQpID0+IHtcbiAgICBjb3VudHNbYnVja2V0XSA9IDA7XG4gICAgcmV0dXJuIGNvdW50cztcbiAgfSwge30gYXMgUmVjb3JkPERpc3BsYXlNb3ZlQnVja2V0LCBudW1iZXI+KTtcbn1cblxuZnVuY3Rpb24gY2xhc3NpZnlSZXN1bHQoZ2FtZVN0YXR1czogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9jaGVja21hdGUvaS50ZXN0KGdhbWVTdGF0dXMpKSB7XG4gICAgY29uc3Qgd2lubmVyID0gZ2FtZVN0YXR1cy5pbmNsdWRlcygnV2hpdGUgd2lucycpID8gJ1doaXRlJyA6IGdhbWVTdGF0dXMuaW5jbHVkZXMoJ0JsYWNrIHdpbnMnKSA/ICdCbGFjaycgOiAnRGVjaXNpdmUnO1xuICAgIHJldHVybiBgJHt3aW5uZXJ9IHdvbmA7XG4gIH1cblxuICBpZiAoL3N0YWxlbWF0ZXxkcmF3L2kudGVzdChnYW1lU3RhdHVzKSkge1xuICAgIHJldHVybiAnRHJhdyc7XG4gIH1cblxuICBpZiAoL2NoZWNrL2kudGVzdChnYW1lU3RhdHVzKSkge1xuICAgIHJldHVybiAnSW4gcHJvZ3Jlc3MnO1xuICB9XG5cbiAgcmV0dXJuICdJbiBwcm9ncmVzcyc7XG59XG5cbmZ1bmN0aW9uIHJvdW5kVG9PbmVEZWNpbWFsKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSAqIDEwKSAvIDEwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeShvcHRpb25zOiBCdWlsZEdhbWVBbmFseXRpY3NPcHRpb25zKTogR2FtZUFuYWx5dGljc1N1bW1hcnkge1xuICBjb25zdCBxdWFsaXR5Q291bnRzID0gY3JlYXRlRW1wdHlRdWFsaXR5Q291bnRzKCk7XG4gIGNvbnN0IGNvbXBsZXhpdHlEaXN0cmlidXRpb246IFJlY29yZDwnbG93JyB8ICdtZWRpdW0nIHwgJ2hpZ2gnLCBudW1iZXI+ID0ge1xuICAgIGxvdzogMCxcbiAgICBtZWRpdW06IDAsXG4gICAgaGlnaDogMCxcbiAgfTtcblxuICBsZXQgZXZhbExvc3NUb3RhbCA9IDA7XG4gIGxldCBldmFsTG9zc0NvdW50ID0gMDtcbiAgbGV0IGRlbGF5VG90YWwgPSAwO1xuICBsZXQgZGVsYXlDb3VudCA9IDA7XG4gIGxldCBicmlsbGlhbnRNb3ZlcyA9IDA7XG5cbiAgY29uc3QgbW92ZVRpbWVsaW5lID0gb3B0aW9ucy5tb3ZlQW5ub3RhdGlvbnMubWFwKChhbm5vdGF0aW9uLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGJ1Y2tldCA9IChhbm5vdGF0aW9uLmJ1Y2tldCA/PyBudWxsKSBhcyBzdHJpbmcgfCBudWxsO1xuICAgIGNvbnN0IHR5cGVkQnVja2V0ID0gQUxMX0JVQ0tFVFMuaW5jbHVkZXMoYnVja2V0IGFzIERpc3BsYXlNb3ZlQnVja2V0KVxuICAgICAgPyAoYnVja2V0IGFzIERpc3BsYXlNb3ZlQnVja2V0KVxuICAgICAgOiBudWxsO1xuXG4gICAgaWYgKHR5cGVkQnVja2V0KSB7XG4gICAgICBxdWFsaXR5Q291bnRzW3R5cGVkQnVja2V0XSArPSAxO1xuICAgIH1cblxuICAgIGlmIChhbm5vdGF0aW9uLmNvbnN1bWVkQnJpbGxpYW50KSB7XG4gICAgICBicmlsbGlhbnRNb3ZlcyArPSAxO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYW5ub3RhdGlvbi5ldmFsTG9zcyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGV2YWxMb3NzVG90YWwgKz0gYW5ub3RhdGlvbi5ldmFsTG9zcztcbiAgICAgIGV2YWxMb3NzQ291bnQgKz0gMTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFubm90YXRpb24uZGVsYXlNc1NpbmNlUHJldmlvdXMgPT09ICdudW1iZXInKSB7XG4gICAgICBkZWxheVRvdGFsICs9IGFubm90YXRpb24uZGVsYXlNc1NpbmNlUHJldmlvdXM7XG4gICAgICBkZWxheUNvdW50ICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKGFubm90YXRpb24uY29tcGxleGl0eUxldmVsKSB7XG4gICAgICBjb21wbGV4aXR5RGlzdHJpYnV0aW9uW2Fubm90YXRpb24uY29tcGxleGl0eUxldmVsXSArPSAxO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwbHk6IGluZGV4ICsgMSxcbiAgICAgIGFjdG9yOiBhbm5vdGF0aW9uLmFjdG9yID8/ICdwbGF5ZXInLFxuICAgICAgc2FuOiBhbm5vdGF0aW9uLnNhbiA/PyBhbm5vdGF0aW9uLnVjaSxcbiAgICAgIGJ1Y2tldCxcbiAgICAgIGV2YWxMb3NzOiBhbm5vdGF0aW9uLmV2YWxMb3NzID8/IG51bGwsXG4gICAgICBldmFsdWF0aW9uOiBhbm5vdGF0aW9uLmV2YWx1YXRpb24gPz8gbnVsbCxcbiAgICAgIGNvbXBsZXhpdHlMZXZlbDogYW5ub3RhdGlvbi5jb21wbGV4aXR5TGV2ZWwgPz8gbnVsbCxcbiAgICAgIGNvbXBsZXhpdHlTY29yZTogYW5ub3RhdGlvbi5jb21wbGV4aXR5U2NvcmUgPz8gbnVsbCxcbiAgICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiBhbm5vdGF0aW9uLmRlbGF5TXNTaW5jZVByZXZpb3VzID8/IDAsXG4gICAgICBjb25zdW1lZEJyaWxsaWFudDogYW5ub3RhdGlvbi5jb25zdW1lZEJyaWxsaWFudCxcbiAgICB9O1xuICB9KTtcblxuICBjb25zdCBoaWdobGlnaHRlZEJyaWxsaWFudE1vdmVzID0gbW92ZVRpbWVsaW5lXG4gICAgLmZpbHRlcigoZW50cnkpID0+IGVudHJ5LmNvbnN1bWVkQnJpbGxpYW50KVxuICAgIC5tYXAoKGVudHJ5KSA9PiAoeyBwbHk6IGVudHJ5LnBseSwgc2FuOiBlbnRyeS5zYW4gfSkpO1xuICBjb25zdCBtYWpvck1pc3Rha2VzID0gbW92ZVRpbWVsaW5lXG4gICAgLmZpbHRlcigoZW50cnkpID0+IGVudHJ5LmJ1Y2tldCA9PT0gJ21pc3Rha2UnIHx8IGVudHJ5LmJ1Y2tldCA9PT0gJ2JsdW5kZXInKVxuICAgIC5tYXAoKGVudHJ5KSA9PiAoe1xuICAgICAgcGx5OiBlbnRyeS5wbHksXG4gICAgICBzYW46IGVudHJ5LnNhbixcbiAgICAgIGJ1Y2tldDogZW50cnkuYnVja2V0LFxuICAgICAgZXZhbExvc3M6IGVudHJ5LmV2YWxMb3NzLFxuICAgIH0pKTtcbiAgY29uc3QgZXZhbFRyZW5kID0gbW92ZVRpbWVsaW5lXG4gICAgLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyB0eXBlb2YgZW50cnkgJiB7IGV2YWx1YXRpb246IG51bWJlciB9ID0+IHR5cGVvZiBlbnRyeS5ldmFsdWF0aW9uID09PSAnbnVtYmVyJylcbiAgICAubWFwKChlbnRyeSkgPT4gKHsgcGx5OiBlbnRyeS5wbHksIGV2YWx1YXRpb246IGVudHJ5LmV2YWx1YXRpb24gfSkpO1xuICBjb25zdCBjb21wbGV4aXR5VHJlbmQgPSBtb3ZlVGltZWxpbmVcbiAgICAuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIHR5cGVvZiBlbnRyeSAmIHsgY29tcGxleGl0eVNjb3JlOiBudW1iZXIgfSA9PiB0eXBlb2YgZW50cnkuY29tcGxleGl0eVNjb3JlID09PSAnbnVtYmVyJylcbiAgICAubWFwKChlbnRyeSkgPT4gKHsgcGx5OiBlbnRyeS5wbHksIHNjb3JlOiBlbnRyeS5jb21wbGV4aXR5U2NvcmUgfSkpO1xuXG4gIHJldHVybiB7XG4gICAgc2Vzc2lvbklkOiBvcHRpb25zLnNlc3Npb25JZCxcbiAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKG9wdGlvbnMuY3JlYXRlZEF0TXMpLnRvSVNPU3RyaW5nKCksXG4gICAgZmluaXNoZWRBdDogbmV3IERhdGUob3B0aW9ucy5maW5pc2hlZEF0TXMpLnRvSVNPU3RyaW5nKCksXG4gICAgcmVzdWx0OiBjbGFzc2lmeVJlc3VsdChvcHRpb25zLmdhbWVTdGF0dXMpLFxuICAgIGdhbWVTdGF0dXM6IG9wdGlvbnMuZ2FtZVN0YXR1cyxcbiAgICBwZXJzb25hSWQ6IG9wdGlvbnMucGVyc29uYUlkID8/ICdjdXN0b20nLFxuICAgIHBlcnNvbmFMYWJlbDogb3B0aW9ucy5wZXJzb25hTGFiZWwsXG4gICAgc2V0dXBOYW1lOiBvcHRpb25zLnNldHVwTmFtZSA/PyAnTmV3IEdhbWUnLFxuICAgIHNldHVwQ2F0ZWdvcnk6IG9wdGlvbnMuc2V0dXBDYXRlZ29yeSA/PyAnY3VzdG9tJyxcbiAgICBtb3ZlQ291bnQ6IG1vdmVUaW1lbGluZS5sZW5ndGgsXG4gICAgYnJpbGxpYW50TW92ZXMsXG4gICAgaW5hY2N1cmFjaWVzOiBxdWFsaXR5Q291bnRzLmluYWNjdXJhY3ksXG4gICAgbWlzdGFrZXM6IHF1YWxpdHlDb3VudHMubWlzdGFrZSxcbiAgICBibHVuZGVyczogcXVhbGl0eUNvdW50cy5ibHVuZGVyLFxuICAgIGF2ZXJhZ2VFdmFsTG9zczogZXZhbExvc3NDb3VudCA+IDAgPyByb3VuZFRvT25lRGVjaW1hbChldmFsTG9zc1RvdGFsIC8gZXZhbExvc3NDb3VudCkgOiAwLFxuICAgIGF2ZXJhZ2VNb3ZlRGVsYXlNczogZGVsYXlDb3VudCA+IDAgPyBNYXRoLnJvdW5kKGRlbGF5VG90YWwgLyBkZWxheUNvdW50KSA6IDAsXG4gICAgYXV0b3BsYXlEdXJhdGlvbk1zOiBNYXRoLm1heCgwLCBvcHRpb25zLmF1dG9wbGF5RHVyYXRpb25NcyksXG4gICAgcXVhbGl0eUNvdW50cyxcbiAgICBjb21wbGV4aXR5RGlzdHJpYnV0aW9uLFxuICAgIG1vdmVUaW1lbGluZSxcbiAgICBoaWdobGlnaHRlZEJyaWxsaWFudE1vdmVzLFxuICAgIG1ham9yTWlzdGFrZXMsXG4gICAgZXZhbFRyZW5kLFxuICAgIGNvbXBsZXhpdHlUcmVuZCxcbiAgICBwZ246IG9wdGlvbnMucGduLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWNlbnRHYW1lRW50cnkoc3VtbWFyeTogR2FtZUFuYWx5dGljc1N1bW1hcnkpOiBSZWNlbnRHYW1lRW50cnkge1xuICByZXR1cm4ge1xuICAgIHNlc3Npb25JZDogc3VtbWFyeS5zZXNzaW9uSWQsXG4gICAgZmluaXNoZWRBdDogc3VtbWFyeS5maW5pc2hlZEF0LFxuICAgIHJlc3VsdDogc3VtbWFyeS5yZXN1bHQsXG4gICAgcGVyc29uYUxhYmVsOiBzdW1tYXJ5LnBlcnNvbmFMYWJlbCxcbiAgICBwZXJzb25hSWQ6IHN1bW1hcnkucGVyc29uYUlkLFxuICAgIHNldHVwTmFtZTogc3VtbWFyeS5zZXR1cE5hbWUsXG4gICAgZHVyYXRpb25NczogTWF0aC5tYXgoMCwgbmV3IERhdGUoc3VtbWFyeS5maW5pc2hlZEF0KS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShzdW1tYXJ5LmNyZWF0ZWRBdCkuZ2V0VGltZSgpKSxcbiAgICBtb3ZlQ291bnQ6IHN1bW1hcnkubW92ZUNvdW50LFxuICAgIGJyaWxsaWFudE1vdmVzOiBzdW1tYXJ5LmJyaWxsaWFudE1vdmVzLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplR2FtZUFuYWx5dGljc1N1bW1hcnkoc3VtbWFyeTogR2FtZUFuYWx5dGljc1N1bW1hcnkpOiBzdHJpbmcge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc3VtbWFyeSwgbnVsbCwgMik7XG59XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUsIHJlYWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQge1xuICBidWlsZEdhbWVBbmFseXRpY3NTdW1tYXJ5LFxuICBidWlsZFJlY2VudEdhbWVFbnRyeSxcbiAgR2FtZUFuYWx5dGljc1N1bW1hcnksXG4gIFJlY2VudEdhbWVFbnRyeSxcbiAgc2VyaWFsaXplR2FtZUFuYWx5dGljc1N1bW1hcnksXG59IGZyb20gJy4uL2VuZ2luZS9nYW1lQW5hbHl0aWNzJztcbmltcG9ydCB7IGJvYXJkVmlld01vZGVsLCBCb2FyZFZpZXdNb2RlbCB9IGZyb20gJy4vQm9hcmRWaWV3TW9kZWwnO1xuaW1wb3J0IHsgY29uZmlnVmlld01vZGVsLCBDb25maWdWaWV3TW9kZWwgfSBmcm9tICcuL0NvbmZpZ1ZpZXdNb2RlbCc7XG5cbmNvbnN0IFJFQ0VOVF9HQU1FU19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfcmVjZW50X2dhbWVzJztcbmNvbnN0IE1BWF9SRUNFTlRfR0FNRVMgPSAyMDtcblxuaW50ZXJmYWNlIFBlcnNpc3RlZEFuYWx5dGljc1NuYXBzaG90IHtcbiAgcmVjZW50R2FtZXM6IEdhbWVBbmFseXRpY3NTdW1tYXJ5W107XG59XG5cbmludGVyZmFjZSBHYW1lQW5hbHl0aWNzRGVwZW5kZW5jaWVzIHtcbiAgYm9hcmRWaWV3TW9kZWw6IFBpY2s8XG4gICAgQm9hcmRWaWV3TW9kZWwsXG4gICAgfCAnZGVidWdTZXNzaW9uSWQnXG4gICAgfCAnbW92ZUFubm90YXRpb25zJ1xuICAgIHwgJ3Nlc3Npb25TdGFydGVkQXQnXG4gICAgfCAnZ2FtZVN0YXR1cydcbiAgICB8ICdwZ24nXG4gICAgfCAnY3VycmVudFNldHVwTmFtZSdcbiAgICB8ICdjdXJyZW50U2V0dXBDYXRlZ29yeSdcbiAgICB8ICdhdXRvUGxheUFjdGl2ZUR1cmF0aW9uTXMnXG4gICAgfCAnaXNHYW1lT3ZlcidcbiAgPjtcbiAgY29uZmlnVmlld01vZGVsOiBQaWNrPENvbmZpZ1ZpZXdNb2RlbCwgJ2FjdGl2ZVBlcnNvbmFJZCcgfCAnYWN0aXZlUGVyc29uYUxhYmVsJz47XG59XG5cbmZ1bmN0aW9uIGRvd25sb2FkVGV4dEZpbGUoZmlsZU5hbWU6IHN0cmluZywgY29udGVudHM6IHN0cmluZywgbWltZVR5cGU6IHN0cmluZyk6IHZvaWQge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY29udGVudHNdLCB7IHR5cGU6IG1pbWVUeXBlIH0pO1xuICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICBjb25zdCBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIGFuY2hvci5ocmVmID0gdXJsO1xuICBhbmNob3IuZG93bmxvYWQgPSBmaWxlTmFtZTtcbiAgYW5jaG9yLmNsaWNrKCk7XG4gIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbn1cblxuZnVuY3Rpb24gc2FmZVBhcnNlUmVjZW50R2FtZXMoc2F2ZWQ6IHN0cmluZyB8IG51bGwpOiBHYW1lQW5hbHl0aWNzU3VtbWFyeVtdIHtcbiAgaWYgKCFzYXZlZCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZCkgYXMgUGVyc2lzdGVkQW5hbHl0aWNzU25hcHNob3QgfCBHYW1lQW5hbHl0aWNzU3VtbWFyeVtdO1xuICAgIGNvbnN0IHJlY2VudEdhbWVzID0gQXJyYXkuaXNBcnJheShwYXJzZWQpXG4gICAgICA/IHBhcnNlZFxuICAgICAgOiBBcnJheS5pc0FycmF5KHBhcnNlZC5yZWNlbnRHYW1lcylcbiAgICAgICAgPyBwYXJzZWQucmVjZW50R2FtZXNcbiAgICAgICAgOiBbXTtcblxuICAgIHJldHVybiByZWNlbnRHYW1lcy5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgR2FtZUFuYWx5dGljc1N1bW1hcnkgPT4gKFxuICAgICAgdHlwZW9mIGVudHJ5Py5zZXNzaW9uSWQgPT09ICdzdHJpbmcnXG4gICAgICAmJiB0eXBlb2YgZW50cnk/LmZpbmlzaGVkQXQgPT09ICdzdHJpbmcnXG4gICAgICAmJiB0eXBlb2YgZW50cnk/LnBlcnNvbmFMYWJlbCA9PT0gJ3N0cmluZydcbiAgICAgICYmIHR5cGVvZiBlbnRyeT8uc2V0dXBOYW1lID09PSAnc3RyaW5nJ1xuICAgICkpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhbWVBbmFseXRpY3NWaWV3TW9kZWwge1xuICBzdW1tYXJ5T3BlbiA9IGZhbHNlO1xuICByZWNlbnRHYW1lczogR2FtZUFuYWx5dGljc1N1bW1hcnlbXSA9IFtdO1xuICBzZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBsYXN0Q2FwdHVyZWRTZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVwczogR2FtZUFuYWx5dGljc0RlcGVuZGVuY2llcztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZXBzOiBHYW1lQW5hbHl0aWNzRGVwZW5kZW5jaWVzID0ge1xuICAgICAgYm9hcmRWaWV3TW9kZWwsXG4gICAgICBjb25maWdWaWV3TW9kZWwsXG4gICAgfSxcbiAgKSB7XG4gICAgdGhpcy5kZXBzID0gZGVwcztcblxuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXRTdW1tYXJ5T3BlbjogYWN0aW9uLFxuICAgICAgc2V0U2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkOiBhY3Rpb24sXG4gICAgICBjYXB0dXJlQ29tcGxldGVkR2FtZTogYWN0aW9uLFxuICAgICAgY2xlYXJSZWNlbnRHYW1lczogYWN0aW9uLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZXN0b3JlRnJvbVN0b3JhZ2UoKTtcblxuICAgIHJlYWN0aW9uKFxuICAgICAgKCkgPT4gKHtcbiAgICAgICAgc2Vzc2lvbklkOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuZGVidWdTZXNzaW9uSWQsXG4gICAgICAgIGlzR2FtZU92ZXI6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5pc0dhbWVPdmVyLFxuICAgICAgICBtb3ZlQ291bnQ6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5tb3ZlQW5ub3RhdGlvbnMubGVuZ3RoLFxuICAgICAgfSksXG4gICAgICAoeyBzZXNzaW9uSWQsIGlzR2FtZU92ZXIsIG1vdmVDb3VudCB9KSA9PiB7XG4gICAgICAgIGlmIChpc0dhbWVPdmVyICYmIG1vdmVDb3VudCA+IDAgJiYgdGhpcy5sYXN0Q2FwdHVyZWRTZXNzaW9uSWQgIT09IHNlc3Npb25JZCkge1xuICAgICAgICAgIHRoaXMuY2FwdHVyZUNvbXBsZXRlZEdhbWUoKTtcbiAgICAgICAgICB0aGlzLnN1bW1hcnlPcGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICApO1xuICB9XG5cbiAgc2V0U3VtbWFyeU9wZW4ob3BlbjogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChvcGVuKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuc3VtbWFyeU9wZW4gPSBvcGVuO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkKHNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkID0gc2Vzc2lvbklkO1xuICB9XG5cbiAgY2FwdHVyZUNvbXBsZXRlZEdhbWUoKTogdm9pZCB7XG4gICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuY3VycmVudFN1bW1hcnk7XG4gICAgaWYgKCFzdW1tYXJ5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlZCA9IFtzdW1tYXJ5LCAuLi50aGlzLnJlY2VudEdhbWVzLmZpbHRlcigoZW50cnkpID0+IGVudHJ5LnNlc3Npb25JZCAhPT0gc3VtbWFyeS5zZXNzaW9uSWQpXVxuICAgICAgLnNsaWNlKDAsIE1BWF9SRUNFTlRfR0FNRVMpO1xuICAgIHRoaXMucmVjZW50R2FtZXMgPSB1cGRhdGVkO1xuICAgIHRoaXMuc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkID0gc3VtbWFyeS5zZXNzaW9uSWQ7XG4gICAgdGhpcy5sYXN0Q2FwdHVyZWRTZXNzaW9uSWQgPSBzdW1tYXJ5LnNlc3Npb25JZDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIGNsZWFyUmVjZW50R2FtZXMoKTogdm9pZCB7XG4gICAgdGhpcy5yZWNlbnRHYW1lcyA9IFtdO1xuICAgIHRoaXMuc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkID0gbnVsbDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIGV4cG9ydEN1cnJlbnRTdW1tYXJ5KCk6IHZvaWQge1xuICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLmN1cnJlbnRTdW1tYXJ5O1xuICAgIGlmICghc3VtbWFyeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRvd25sb2FkVGV4dEZpbGUoYHBlcnNvbmFjaGVzcy1zdW1tYXJ5LSR7c3VtbWFyeS5zZXNzaW9uSWR9Lmpzb25gLCBzZXJpYWxpemVHYW1lQW5hbHl0aWNzU3VtbWFyeShzdW1tYXJ5KSwgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgfVxuXG4gIGV4cG9ydEN1cnJlbnRQZ24oKTogdm9pZCB7XG4gICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMuY3VycmVudFN1bW1hcnk7XG4gICAgaWYgKCFzdW1tYXJ5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZG93bmxvYWRUZXh0RmlsZShgcGVyc29uYWNoZXNzLWdhbWUtJHtzdW1tYXJ5LnNlc3Npb25JZH0ucGduYCwgc3VtbWFyeS5wZ24sICdhcHBsaWNhdGlvbi94LWNoZXNzLXBnbicpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRTdW1tYXJ5KCk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5IHwgbnVsbCB7XG4gICAgY29uc3QgYW5ub3RhdGlvbnMgPSB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwubW92ZUFubm90YXRpb25zO1xuICAgIGlmIChhbm5vdGF0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBidWlsZEdhbWVBbmFseXRpY3NTdW1tYXJ5KHtcbiAgICAgIHNlc3Npb25JZDogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmRlYnVnU2Vzc2lvbklkLFxuICAgICAgY3JlYXRlZEF0TXM6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5zZXNzaW9uU3RhcnRlZEF0LFxuICAgICAgZmluaXNoZWRBdE1zOiBEYXRlLm5vdygpLFxuICAgICAgZ2FtZVN0YXR1czogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmdhbWVTdGF0dXMsXG4gICAgICBwZXJzb25hSWQ6IHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuYWN0aXZlUGVyc29uYUlkLFxuICAgICAgcGVyc29uYUxhYmVsOiB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmFjdGl2ZVBlcnNvbmFMYWJlbCxcbiAgICAgIHNldHVwTmFtZTogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmN1cnJlbnRTZXR1cE5hbWUsXG4gICAgICBzZXR1cENhdGVnb3J5OiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuY3VycmVudFNldHVwQ2F0ZWdvcnksXG4gICAgICBhdXRvcGxheUR1cmF0aW9uTXM6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5hdXRvUGxheUFjdGl2ZUR1cmF0aW9uTXMsXG4gICAgICBtb3ZlQW5ub3RhdGlvbnM6IGFubm90YXRpb25zLFxuICAgICAgcGduOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwucGduLFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IHNlbGVjdGVkUmVjZW50R2FtZSgpOiBHYW1lQW5hbHl0aWNzU3VtbWFyeSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnJlY2VudEdhbWVzLmZpbmQoKGVudHJ5KSA9PiBlbnRyeS5zZXNzaW9uSWQgPT09IHRoaXMuc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkKSA/PyBudWxsO1xuICB9XG5cbiAgZ2V0IHJlY2VudEdhbWVFbnRyaWVzKCk6IFJlY2VudEdhbWVFbnRyeVtdIHtcbiAgICByZXR1cm4gdGhpcy5yZWNlbnRHYW1lcy5tYXAoKHN1bW1hcnkpID0+IGJ1aWxkUmVjZW50R2FtZUVudHJ5KHN1bW1hcnkpKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnJlY2VudEdhbWVzID0gc2FmZVBhcnNlUmVjZW50R2FtZXMobG9jYWxTdG9yYWdlLmdldEl0ZW0oUkVDRU5UX0dBTUVTX1NUT1JBR0VfS0VZKSk7XG4gICAgICB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCA9IHRoaXMucmVjZW50R2FtZXNbMF0/LnNlc3Npb25JZCA/PyBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdGhpcy5yZWNlbnRHYW1lcyA9IFtdO1xuICAgICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGVyc2lzdFRvU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc25hcHNob3Q6IFBlcnNpc3RlZEFuYWx5dGljc1NuYXBzaG90ID0ge1xuICAgICAgICByZWNlbnRHYW1lczogdGhpcy5yZWNlbnRHYW1lcyxcbiAgICAgIH07XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShSRUNFTlRfR0FNRVNfU1RPUkFHRV9LRVksIEpTT04uc3RyaW5naWZ5KHNuYXBzaG90KSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgbG9jYWxTdG9yYWdlIGZhaWx1cmVzIGFuZCBrZWVwIGFuYWx5dGljcyBhdmFpbGFibGUgZm9yIHRoZSBjdXJyZW50IHNlc3Npb24uXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBnYW1lQW5hbHl0aWNzVmlld01vZGVsID0gbmV3IEdhbWVBbmFseXRpY3NWaWV3TW9kZWwoKTtcbiIsICIvKipcbiAqIFByZWRlZmluZWQgY2hlc3Mgb3BlbmluZ3MgKFBHTiBtb3ZlIHNlcXVlbmNlcylcbiAqIFVzZWQgdG8gbG9hZCBhIHBvc2l0aW9uIGFmdGVyIHRoZSBnaXZlbiBtb3ZlcyBmcm9tIHRoZSBpbml0aWFsIHBvc2l0aW9uLlxuICovXG5cbmV4cG9ydCB0eXBlIE9wZW5pbmdTaWRlID0gJ3doaXRlJyB8ICdibGFjayc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3BlbmluZyB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIFdoaWNoIHNpZGUgcGxheXMgdGhpcyBvcGVuaW5nICh0aGUgb3BlbmluZyBpcyBuYW1lZCBmcm9tIHRoaXMgc2lkZSdzIHBlcnNwZWN0aXZlKSAqL1xuICBzaWRlOiBPcGVuaW5nU2lkZTtcbiAgLyoqIFNob3J0IGRlc2NyaXB0aW9uIG9yIEVDTy1zdHlsZSB0YWcgKi9cbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIC8qKiBQR04gbW92ZSBzZXF1ZW5jZSBmcm9tIHRoZSBzdGFydGluZyBwb3NpdGlvbiAoZS5nLiBcIjEuIGU0IGU1IDIuIFFoNVwiKSAqL1xuICBwZ246IHN0cmluZztcbn1cblxuLyoqIEJ1aWxkIG1pbmltYWwgUEdOIGZvciBjaGVzcy5qcyAoaGVhZGVycyArIGJsYW5rIGxpbmUgKyBtb3ZlcyArIHJlc3VsdCkgKi9cbmZ1bmN0aW9uIHBnbihtb3Zlczogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbW92ZVRleHQgPSBtb3Zlcy50cmltKCkuZW5kc1dpdGgoJyonKSA/IG1vdmVzLnRyaW0oKSA6IGAke21vdmVzLnRyaW0oKX0gKmA7XG4gIHJldHVybiBgW0V2ZW50IFwiP1wiXVxcbltTaXRlIFwiP1wiXVxcbltEYXRlIFwiPz8/Py4/Py4/P1wiXVxcbltXaGl0ZSBcIj9cIl1cXG5bQmxhY2sgXCI/XCJdXFxuW1Jlc3VsdCBcIipcIl1cXG5cXG4ke21vdmVUZXh0fWA7XG59XG5cbmV4cG9ydCBjb25zdCBQUkVERUZJTkVEX09QRU5JTkdTOiBPcGVuaW5nW10gPSBbXG4gIHtcbiAgICBpZDogJ25hcG9sZW9uJyxcbiAgICBuYW1lOiBcIktpbmcncyBQYXduOiBOYXBvbGVvbiBBdHRhY2tcIixcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgZTUgMi4gUWg1JyxcbiAgICBwZ246IHBnbignMS4gZTQgZTUgMi4gUWg1JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ2l0YWxpYW4nLFxuICAgIG5hbWU6IFwiSXRhbGlhbiBHYW1lXCIsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmM0JyxcbiAgICBwZ246IHBnbignMS4gZTQgZTUgMi4gTmYzIE5jNiAzLiBCYzQnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAncnV5X2xvcGV6JyxcbiAgICBuYW1lOiAnUnV5IExvcGV6JyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgZTUgMi4gTmYzIE5jNiAzLiBCYjUnLFxuICAgIHBnbjogcGduKCcxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJiNScpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdzaWNpbGlhbicsXG4gICAgbmFtZTogJ1NpY2lsaWFuIERlZmVuc2UnLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBjNScsXG4gICAgcGduOiBwZ24oJzEuIGU0IGM1JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ2ZyZW5jaCcsXG4gICAgbmFtZTogJ0ZyZW5jaCBEZWZlbnNlJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgZTYnLFxuICAgIHBnbjogcGduKCcxLiBlNCBlNicpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdjYXJvX2thbm4nLFxuICAgIG5hbWU6ICdDYXJvLUthbm4nLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBjNicsXG4gICAgcGduOiBwZ24oJzEuIGU0IGM2JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ3F1ZWVuc19nYW1iaXQnLFxuICAgIG5hbWU6IFwiUXVlZW4ncyBHYW1iaXRcIixcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZDQgZDUgMi4gYzQnLFxuICAgIHBnbjogcGduKCcxLiBkNCBkNSAyLiBjNCcpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdsb25kb24nLFxuICAgIG5hbWU6ICdMb25kb24gU3lzdGVtJyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZDQgZDUgMi4gQmY0JyxcbiAgICBwZ246IHBnbignMS4gZDQgZDUgMi4gQmY0JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ2tpbmdzX2luZGlhbicsXG4gICAgbmFtZTogXCJLaW5nJ3MgSW5kaWFuIERlZmVuc2VcIixcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZDQgTmY2IDIuIGM0IGc2JyxcbiAgICBwZ246IHBnbignMS4gZDQgTmY2IDIuIGM0IGc2JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ3BpcmMnLFxuICAgIG5hbWU6ICdQaXJjIERlZmVuc2UnLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBkNiAyLiBkNCBOZjYnLFxuICAgIHBnbjogcGduKCcxLiBlNCBkNiAyLiBkNCBOZjYnKSxcbiAgfSxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcGVuaW5nQnlJZChpZDogc3RyaW5nKTogT3BlbmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBQUkVERUZJTkVEX09QRU5JTkdTLmZpbmQobyA9PiBvLmlkID09PSBpZCk7XG59XG4iLCAiaW1wb3J0IHsgZ2V0T3BlbmluZ0J5SWQsIE9wZW5pbmdTaWRlLCBQUkVERUZJTkVEX09QRU5JTkdTIH0gZnJvbSAnLi9vcGVuaW5ncyc7XG5cbmV4cG9ydCB0eXBlIEdhbWVTZXR1cENhdGVnb3J5ID0gJ29wZW5pbmdzJyB8ICd0YWN0aWNhbCcgfCAnZW5kZ2FtZXMnIHwgJ2N1c3RvbS1mZW4nIHwgJ2N1c3RvbS1wZ24nO1xuZXhwb3J0IHR5cGUgR2FtZVNldHVwRGlmZmljdWx0eSA9ICdlYXN5JyB8ICdtZWRpdW0nIHwgJ2hhcmQnO1xuZXhwb3J0IHR5cGUgR2FtZVNldHVwU291cmNlVHlwZSA9ICdmZW4nIHwgJ3Bnbic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2FtZVNldHVwUHJlc2V0IHtcbiAgaWQ6IHN0cmluZztcbiAgY2F0ZWdvcnk6IEV4Y2x1ZGU8R2FtZVNldHVwQ2F0ZWdvcnksICdjdXN0b20tZmVuJyB8ICdjdXN0b20tcGduJz47XG4gIG5hbWU6IHN0cmluZztcbiAgc2lkZTogT3BlbmluZ1NpZGU7XG4gIGRpZmZpY3VsdHk6IEdhbWVTZXR1cERpZmZpY3VsdHk7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIHRhZ3M6IHN0cmluZ1tdO1xuICBzb3VyY2VUeXBlOiBHYW1lU2V0dXBTb3VyY2VUeXBlO1xuICBzb3VyY2U6IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IEdBTUVfU0VUVVBfQ0FURUdPUllfT1BUSU9OUzogQXJyYXk8eyB2YWx1ZTogR2FtZVNldHVwQ2F0ZWdvcnk7IGxhYmVsOiBzdHJpbmcgfT4gPSBbXG4gIHsgdmFsdWU6ICdvcGVuaW5ncycsIGxhYmVsOiAnT3BlbmluZ3MnIH0sXG4gIHsgdmFsdWU6ICd0YWN0aWNhbCcsIGxhYmVsOiAnVGFjdGljYWwgcG9zaXRpb25zJyB9LFxuICB7IHZhbHVlOiAnZW5kZ2FtZXMnLCBsYWJlbDogJ0VuZGdhbWVzJyB9LFxuICB7IHZhbHVlOiAnY3VzdG9tLWZlbicsIGxhYmVsOiAnQ3VzdG9tIEZFTicgfSxcbiAgeyB2YWx1ZTogJ2N1c3RvbS1wZ24nLCBsYWJlbDogJ0N1c3RvbSBQR04nIH0sXG5dO1xuXG5mdW5jdGlvbiBvcGVuaW5nRGlmZmljdWx0eVRhZyhuYW1lOiBzdHJpbmcpOiBHYW1lU2V0dXBEaWZmaWN1bHR5IHtcbiAgaWYgKC9uYXBvbGVvbi9pLnRlc3QobmFtZSkpIHtcbiAgICByZXR1cm4gJ2Vhc3knO1xuICB9XG5cbiAgaWYgKC9pdGFsaWFufGxvbmRvbnxxdWVlbi9pLnRlc3QobmFtZSkpIHtcbiAgICByZXR1cm4gJ21lZGl1bSc7XG4gIH1cblxuICByZXR1cm4gJ2hhcmQnO1xufVxuXG5jb25zdCBPUEVOSU5HX1BSRVNFVFM6IEdhbWVTZXR1cFByZXNldFtdID0gUFJFREVGSU5FRF9PUEVOSU5HUy5tYXAoKG9wZW5pbmcpID0+ICh7XG4gIGlkOiBvcGVuaW5nLmlkLFxuICBjYXRlZ29yeTogJ29wZW5pbmdzJyxcbiAgbmFtZTogb3BlbmluZy5uYW1lLFxuICBzaWRlOiBvcGVuaW5nLnNpZGUsXG4gIGRpZmZpY3VsdHk6IG9wZW5pbmdEaWZmaWN1bHR5VGFnKG9wZW5pbmcubmFtZSksXG4gIGRlc2NyaXB0aW9uOiBvcGVuaW5nLmRlc2NyaXB0aW9uID8/IGAke29wZW5pbmcubmFtZX0gc2V0dXBgLFxuICB0YWdzOiBbJ29wZW5pbmcnLCBvcGVuaW5nLnNpZGUsIG9wZW5pbmcubmFtZS50b0xvd2VyQ2FzZSgpXSxcbiAgc291cmNlVHlwZTogJ3BnbicsXG4gIHNvdXJjZTogb3BlbmluZy5wZ24sXG59KSk7XG5cbmNvbnN0IFRBQ1RJQ0FMX1BSRVNFVFM6IEdhbWVTZXR1cFByZXNldFtdID0gW1xuICB7XG4gICAgaWQ6ICd0YWN0aWMtYmFjay1yYW5rLW5ldCcsXG4gICAgY2F0ZWdvcnk6ICd0YWN0aWNhbCcsXG4gICAgbmFtZTogJ0JhY2sgUmFuayBOZXQnLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGlmZmljdWx0eTogJ21lZGl1bScsXG4gICAgZGVzY3JpcHRpb246ICdXaGl0ZSB0byBtb3ZlIHdpdGggYSBkaXJlY3QgYXR0YWNraW5nIGlkZWEgYWdhaW5zdCBhbiBleHBvc2VkIGJhY2sgcmFuay4nLFxuICAgIHRhZ3M6IFsndGFjdGljYWwnLCAnbWF0ZS10aHJlYXQnLCAnYXR0YWNrJywgJ3doaXRlLXRvLW1vdmUnXSxcbiAgICBzb3VyY2VUeXBlOiAnZmVuJyxcbiAgICBzb3VyY2U6ICc2azEvNXBwcC8zUTQvOC84LzgvNVBQUC82SzEgdyAtIC0gMCAxJyxcbiAgfSxcbiAge1xuICAgIGlkOiAndGFjdGljLWtuaWdodC1mb3JrJyxcbiAgICBjYXRlZ29yeTogJ3RhY3RpY2FsJyxcbiAgICBuYW1lOiAnS25pZ2h0IEZvcmsgT3Bwb3J0dW5pdHknLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGlmZmljdWx0eTogJ2Vhc3knLFxuICAgIGRlc2NyaXB0aW9uOiAnQSB0cmFpbmluZyBwb3NpdGlvbiBidWlsdCBhcm91bmQgc3BvdHRpbmcgYSBzaW1wbGUgZm9yayBtb3RpZi4nLFxuICAgIHRhZ3M6IFsndGFjdGljYWwnLCAnZm9yaycsICd3aGl0ZS10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAncjNrMnIvcHBwcTFwcHAvMm5wYm4yLzNOcDMvMkIxUDMvMk41L1BQUDJQUFAvUjFCUTFSSzEgdyBrcSAtIDAgMScsXG4gIH0sXG4gIHtcbiAgICBpZDogJ3RhY3RpYy1kZWZsZWN0aW9uJyxcbiAgICBjYXRlZ29yeTogJ3RhY3RpY2FsJyxcbiAgICBuYW1lOiAnRGVmbGVjdGlvbiBTdHJpa2UnLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGlmZmljdWx0eTogJ2hhcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQmxhY2sgdG8gbW92ZSBpbiBhIHNoYXJwIG1pZGRsZWdhbWUgd2hlcmUgY2FsY3VsYXRpb24gbWF0dGVycyBtb3JlIHRoYW4gbWVtb3JpemF0aW9uLicsXG4gICAgdGFnczogWyd0YWN0aWNhbCcsICdkZWZsZWN0aW9uJywgJ2NhbGN1bGF0aW9uJywgJ2JsYWNrLXRvLW1vdmUnXSxcbiAgICBzb3VyY2VUeXBlOiAnZmVuJyxcbiAgICBzb3VyY2U6ICdyMnExcmsxL3BwMWIxcHBwLzJuMXBuMi8yYnA0LzJQNS8yTlAxTlAxL1BQMlBQQlAvUjFCUTFSSzEgYiAtIC0gNCA5JyxcbiAgfSxcbl07XG5cbmNvbnN0IEVOREdBTUVfUFJFU0VUUzogR2FtZVNldHVwUHJlc2V0W10gPSBbXG4gIHtcbiAgICBpZDogJ2VuZGdhbWUtbHVjZW5hLWJyaWRnZScsXG4gICAgY2F0ZWdvcnk6ICdlbmRnYW1lcycsXG4gICAgbmFtZTogJ0x1Y2VuYSBCcmlkZ2UgU2V0dXAnLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGlmZmljdWx0eTogJ2hhcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2xhc3NpYyByb29rIGVuZGdhbWUgY29udmVyc2lvbiBwcmFjdGljZSB3aXRoIFdoaXRlIHByZXNzaW5nIGZvciB0aGUgd2luLicsXG4gICAgdGFnczogWydlbmRnYW1lJywgJ3Jvb2snLCAnbHVjZW5hJywgJ3doaXRlLXRvLW1vdmUnXSxcbiAgICBzb3VyY2VUeXBlOiAnZmVuJyxcbiAgICBzb3VyY2U6ICc4LzJrNS8yUDUvMktSNC84LzgvOC84IHcgLSAtIDAgMScsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2VuZGdhbWUtb3Bwb3NpdGlvbicsXG4gICAgY2F0ZWdvcnk6ICdlbmRnYW1lcycsXG4gICAgbmFtZTogJ0tpbmcgT3Bwb3NpdGlvbicsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkaWZmaWN1bHR5OiAnZWFzeScsXG4gICAgZGVzY3JpcHRpb246ICdBIHB1cmUga2luZy1hbmQtcGF3biBlbmRpbmcgZm9jdXNlZCBvbiBnYWluaW5nIG9wcG9zaXRpb24gY2xlYW5seS4nLFxuICAgIHRhZ3M6IFsnZW5kZ2FtZScsICdraW5nLWFuZC1wYXduJywgJ29wcG9zaXRpb24nLCAnd2hpdGUtdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJzgvOC84LzNrNC8zUDQvNEszLzgvOCB3IC0gLSAwIDEnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdlbmRnYW1lLXF1ZWVuLXZzLXBhd24nLFxuICAgIGNhdGVnb3J5OiAnZW5kZ2FtZXMnLFxuICAgIG5hbWU6ICdRdWVlbiB2cyBQYXNzZWQgUGF3bicsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkaWZmaWN1bHR5OiAnbWVkaXVtJyxcbiAgICBkZXNjcmlwdGlvbjogJ0JsYWNrIGRlZmVuZHMgYWdhaW5zdCBwcm9tb3Rpb24gdGhyZWF0cyBpbiBhIHByZWNpc2UgcXVlZW4gZW5kaW5nLicsXG4gICAgdGFnczogWydlbmRnYW1lJywgJ3F1ZWVuJywgJ3Bhc3NlZC1wYXduJywgJ2JsYWNrLXRvLW1vdmUnXSxcbiAgICBzb3VyY2VUeXBlOiAnZmVuJyxcbiAgICBzb3VyY2U6ICc2azEvNXBwMS84LzgvOC82UTEvNVAyLzZLMSBiIC0gLSAwIDEnLFxuICB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IEdBTUVfU0VUVVBfUFJFU0VUUzogR2FtZVNldHVwUHJlc2V0W10gPSBbXG4gIC4uLk9QRU5JTkdfUFJFU0VUUyxcbiAgLi4uVEFDVElDQUxfUFJFU0VUUyxcbiAgLi4uRU5ER0FNRV9QUkVTRVRTLFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEdhbWVTZXR1cFByZXNldEJ5SWQoaWQ6IHN0cmluZyk6IEdhbWVTZXR1cFByZXNldCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBHQU1FX1NFVFVQX1BSRVNFVFMuZmluZCgocHJlc2V0KSA9PiBwcmVzZXQuaWQgPT09IGlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9wZW5pbmdQcmVzZXRCeUlkKGlkOiBzdHJpbmcpOiBHYW1lU2V0dXBQcmVzZXQgfCB1bmRlZmluZWQge1xuICByZXR1cm4gT1BFTklOR19QUkVTRVRTLmZpbmQoKHByZXNldCkgPT4gcHJlc2V0LmlkID09PSBpZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJHYW1lU2V0dXBQcmVzZXRzKFxuICBwcmVzZXRzOiBHYW1lU2V0dXBQcmVzZXRbXSxcbiAgY2F0ZWdvcnk6IEdhbWVTZXR1cENhdGVnb3J5LFxuICBxdWVyeTogc3RyaW5nLFxuKTogR2FtZVNldHVwUHJlc2V0W10ge1xuICBpZiAoY2F0ZWdvcnkgPT09ICdjdXN0b20tZmVuJyB8fCBjYXRlZ29yeSA9PT0gJ2N1c3RvbS1wZ24nKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3Qgbm9ybWFsaXplZFF1ZXJ5ID0gcXVlcnkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgcmV0dXJuIHByZXNldHMuZmlsdGVyKChwcmVzZXQpID0+IHtcbiAgICBpZiAocHJlc2V0LmNhdGVnb3J5ICE9PSBjYXRlZ29yeSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbm9ybWFsaXplZFF1ZXJ5KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXlzdGFjayA9IFtcbiAgICAgIHByZXNldC5uYW1lLFxuICAgICAgcHJlc2V0LmRlc2NyaXB0aW9uLFxuICAgICAgcHJlc2V0LnNpZGUsXG4gICAgICBwcmVzZXQuZGlmZmljdWx0eSxcbiAgICAgIC4uLnByZXNldC50YWdzLFxuICAgIF0uam9pbignICcpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICByZXR1cm4gaGF5c3RhY2suaW5jbHVkZXMobm9ybWFsaXplZFF1ZXJ5KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXNjcmliZUdhbWVTZXR1cFByZXNldChwcmVzZXQ6IEdhbWVTZXR1cFByZXNldCk6IHN0cmluZyB7XG4gIGNvbnN0IHNpZGVMYWJlbCA9IHByZXNldC5zaWRlID09PSAnd2hpdGUnID8gJ1doaXRlJyA6ICdCbGFjayc7XG4gIHJldHVybiBgJHtwcmVzZXQubmFtZX0gXHUyMDIyICR7c2lkZUxhYmVsfSBcdTIwMjIgJHtwcmVzZXQuZGlmZmljdWx0eX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9Db21wYXRpYmxlT3BlbmluZ1ByZXNldChpZDogc3RyaW5nKTogR2FtZVNldHVwUHJlc2V0IHwgdW5kZWZpbmVkIHtcbiAgY29uc3Qgb3BlbmluZyA9IGdldE9wZW5pbmdCeUlkKGlkKTtcbiAgaWYgKCFvcGVuaW5nKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBPUEVOSU5HX1BSRVNFVFMuZmluZCgocHJlc2V0KSA9PiBwcmVzZXQuaWQgPT09IG9wZW5pbmcuaWQpO1xufVxuIiwgImltcG9ydCB7IGFjdGlvbiwgbWFrZUF1dG9PYnNlcnZhYmxlIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQge1xuICBmaWx0ZXJHYW1lU2V0dXBQcmVzZXRzLFxuICBHQU1FX1NFVFVQX1BSRVNFVFMsXG4gIEdhbWVTZXR1cENhdGVnb3J5LFxuICBHQU1FX1NFVFVQX0NBVEVHT1JZX09QVElPTlMsXG4gIEdhbWVTZXR1cFByZXNldCxcbiAgZ2V0R2FtZVNldHVwUHJlc2V0QnlJZCxcbn0gZnJvbSAnLi4vZW5naW5lL2dhbWVTZXR1cFByZXNldHMnO1xuaW1wb3J0IHsgYm9hcmRWaWV3TW9kZWwsIEJvYXJkVmlld01vZGVsIH0gZnJvbSAnLi9Cb2FyZFZpZXdNb2RlbCc7XG5cbmludGVyZmFjZSBHYW1lU2V0dXBWaWV3TW9kZWxEZXBlbmRlbmNpZXMge1xuICBib2FyZFZpZXdNb2RlbDogUGljazxCb2FyZFZpZXdNb2RlbCwgJ2xvYWRGZW4nIHwgJ2xvYWRQZ24nIHwgJ2xvYWRHYW1lU2V0dXBQcmVzZXQnIHwgJ3N0YXR1c01lc3NhZ2UnPjtcbn1cblxuZXhwb3J0IGNsYXNzIEdhbWVTZXR1cFZpZXdNb2RlbCB7XG4gIG9wZW4gPSBmYWxzZTtcbiAgc2VsZWN0ZWRDYXRlZ29yeTogR2FtZVNldHVwQ2F0ZWdvcnkgPSAnb3BlbmluZ3MnO1xuICBzZWFyY2hRdWVyeSA9ICcnO1xuICBzZWxlY3RlZFByZXNldElkOiBzdHJpbmcgfCBudWxsID0gR0FNRV9TRVRVUF9QUkVTRVRTWzBdPy5pZCA/PyBudWxsO1xuICBjdXN0b21GZW5JbnB1dCA9ICcnO1xuICBjdXN0b21QZ25JbnB1dCA9ICcnO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVwczogR2FtZVNldHVwVmlld01vZGVsRGVwZW5kZW5jaWVzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRlcHM6IEdhbWVTZXR1cFZpZXdNb2RlbERlcGVuZGVuY2llcyA9IHtcbiAgICAgIGJvYXJkVmlld01vZGVsLFxuICAgIH0sXG4gICkge1xuICAgIHRoaXMuZGVwcyA9IGRlcHM7XG5cbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0T3BlbjogYWN0aW9uLFxuICAgICAgb3BlbkF0Q2F0ZWdvcnk6IGFjdGlvbixcbiAgICAgIHNldFNlbGVjdGVkQ2F0ZWdvcnk6IGFjdGlvbixcbiAgICAgIHNldFNlYXJjaFF1ZXJ5OiBhY3Rpb24sXG4gICAgICBzZXRTZWxlY3RlZFByZXNldElkOiBhY3Rpb24sXG4gICAgICBzZXRDdXN0b21GZW5JbnB1dDogYWN0aW9uLFxuICAgICAgc2V0Q3VzdG9tUGduSW5wdXQ6IGFjdGlvbixcbiAgICAgIGxvYWRTZWxlY3RlZFByZXNldDogYWN0aW9uLFxuICAgICAgbG9hZEN1c3RvbUZlbjogYWN0aW9uLFxuICAgICAgbG9hZEN1c3RvbVBnbjogYWN0aW9uLFxuICAgICAgc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeTogYWN0aW9uLFxuICAgIH0pO1xuXG4gICAgdGhpcy5zeW5jU2VsZWN0aW9uRnJvbUNhdGVnb3J5KCk7XG4gIH1cblxuICBzZXRPcGVuKG9wZW46IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLm9wZW4gPSBvcGVuO1xuICB9XG5cbiAgb3BlbkF0Q2F0ZWdvcnkoY2F0ZWdvcnk6IEdhbWVTZXR1cENhdGVnb3J5KTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZENhdGVnb3J5ID0gY2F0ZWdvcnk7XG4gICAgdGhpcy5zZWFyY2hRdWVyeSA9ICcnO1xuICAgIHRoaXMub3BlbiA9IHRydWU7XG4gICAgdGhpcy5zeW5jU2VsZWN0aW9uRnJvbUNhdGVnb3J5KCk7XG4gIH1cblxuICBzZXRTZWxlY3RlZENhdGVnb3J5KGNhdGVnb3J5OiBHYW1lU2V0dXBDYXRlZ29yeSk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRDYXRlZ29yeSA9IGNhdGVnb3J5O1xuICAgIHRoaXMuc2VhcmNoUXVlcnkgPSAnJztcbiAgICB0aGlzLnN5bmNTZWxlY3Rpb25Gcm9tQ2F0ZWdvcnkoKTtcbiAgfVxuXG4gIHNldFNlYXJjaFF1ZXJ5KHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnNlYXJjaFF1ZXJ5ID0gdmFsdWU7XG4gICAgdGhpcy5zeW5jU2VsZWN0aW9uRnJvbUNhdGVnb3J5KCk7XG4gIH1cblxuICBzZXRTZWxlY3RlZFByZXNldElkKGlkOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZFByZXNldElkID0gaWQ7XG4gIH1cblxuICBzZXRDdXN0b21GZW5JbnB1dCh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jdXN0b21GZW5JbnB1dCA9IHZhbHVlO1xuICB9XG5cbiAgc2V0Q3VzdG9tUGduSW5wdXQodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY3VzdG9tUGduSW5wdXQgPSB2YWx1ZTtcbiAgfVxuXG4gIGxvYWRTZWxlY3RlZFByZXNldCgpOiBib29sZWFuIHtcbiAgICBjb25zdCBwcmVzZXQgPSB0aGlzLnNlbGVjdGVkUHJlc2V0O1xuICAgIGlmICghcHJlc2V0KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbG9hZGVkID0gdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmxvYWRHYW1lU2V0dXBQcmVzZXQocHJlc2V0KTtcbiAgICBpZiAobG9hZGVkKSB7XG4gICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGxvYWRlZDtcbiAgfVxuXG4gIGxvYWRDdXN0b21GZW4oKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmN1c3RvbUZlbklucHV0LnRyaW0oKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGxvYWRlZCA9IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5sb2FkRmVuKHRoaXMuY3VzdG9tRmVuSW5wdXQudHJpbSgpKTtcbiAgICBpZiAobG9hZGVkKSB7XG4gICAgICB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuc3RhdHVzTWVzc2FnZSA9ICdDdXN0b20gRkVOIGxvYWRlZCc7XG4gICAgICB0aGlzLmN1c3RvbUZlbklucHV0ID0gJyc7XG4gICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGxvYWRlZDtcbiAgfVxuXG4gIGxvYWRDdXN0b21QZ24oKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmN1c3RvbVBnbklucHV0LnRyaW0oKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGxvYWRlZCA9IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5sb2FkUGduKHRoaXMuY3VzdG9tUGduSW5wdXQudHJpbSgpKTtcbiAgICBpZiAobG9hZGVkKSB7XG4gICAgICB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuc3RhdHVzTWVzc2FnZSA9ICdDdXN0b20gUEdOIGxvYWRlZCc7XG4gICAgICB0aGlzLmN1c3RvbVBnbklucHV0ID0gJyc7XG4gICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGxvYWRlZDtcbiAgfVxuXG4gIHN5bmNTZWxlY3Rpb25Gcm9tQ2F0ZWdvcnkoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRDYXRlZ29yeSA9PT0gJ2N1c3RvbS1mZW4nIHx8IHRoaXMuc2VsZWN0ZWRDYXRlZ29yeSA9PT0gJ2N1c3RvbS1wZ24nKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkUHJlc2V0SWQgPSBudWxsO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHZpc2libGVQcmVzZXRJZHMgPSB0aGlzLmZpbHRlcmVkUHJlc2V0cy5tYXAoKHByZXNldCkgPT4gcHJlc2V0LmlkKTtcbiAgICBpZiAodGhpcy5zZWxlY3RlZFByZXNldElkICYmIHZpc2libGVQcmVzZXRJZHMuaW5jbHVkZXModGhpcy5zZWxlY3RlZFByZXNldElkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCA9IHZpc2libGVQcmVzZXRJZHNbMF0gPz8gbnVsbDtcbiAgfVxuXG4gIGdldCBjYXRlZ29yaWVzKCkge1xuICAgIHJldHVybiBHQU1FX1NFVFVQX0NBVEVHT1JZX09QVElPTlM7XG4gIH1cblxuICBnZXQgZmlsdGVyZWRQcmVzZXRzKCk6IEdhbWVTZXR1cFByZXNldFtdIHtcbiAgICByZXR1cm4gZmlsdGVyR2FtZVNldHVwUHJlc2V0cyhHQU1FX1NFVFVQX1BSRVNFVFMsIHRoaXMuc2VsZWN0ZWRDYXRlZ29yeSwgdGhpcy5zZWFyY2hRdWVyeSk7XG4gIH1cblxuICBnZXQgc2VsZWN0ZWRQcmVzZXQoKTogR2FtZVNldHVwUHJlc2V0IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCA/IGdldEdhbWVTZXR1cFByZXNldEJ5SWQodGhpcy5zZWxlY3RlZFByZXNldElkKSA/PyBudWxsIDogbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZ2FtZVNldHVwVmlld01vZGVsID0gbmV3IEdhbWVTZXR1cFZpZXdNb2RlbCgpO1xuIiwgImltcG9ydCB7IGFjdGlvbiwgbWFrZUF1dG9PYnNlcnZhYmxlIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQge1xuICBpc0RlYnVnTG9nZ2luZ0VuYWJsZWQsXG4gIGlzRGV2ZWxvcG1lbnRCdWlsZCxcbiAgc2V0RGVidWdMb2dnaW5nRW5hYmxlZCxcbn0gZnJvbSAnLi4vc2hhcmVkL2RlYnVnJztcblxuZXhwb3J0IGNsYXNzIERlYnVnVmlld01vZGVsIHtcbiAgZGVidWdMb2dnaW5nRW5hYmxlZCA9IGlzRGVidWdMb2dnaW5nRW5hYmxlZCgpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXREZWJ1Z0xvZ2dpbmdFbmFibGVkOiBhY3Rpb24sXG4gICAgICB0b2dnbGVEZWJ1Z0xvZ2dpbmc6IGFjdGlvbixcbiAgICB9KTtcbiAgfVxuXG4gIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuZGVidWdMb2dnaW5nRW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgc2V0RGVidWdMb2dnaW5nRW5hYmxlZChlbmFibGVkKTtcbiAgfVxuXG4gIHRvZ2dsZURlYnVnTG9nZ2luZygpOiB2b2lkIHtcbiAgICB0aGlzLnNldERlYnVnTG9nZ2luZ0VuYWJsZWQoIXRoaXMuZGVidWdMb2dnaW5nRW5hYmxlZCk7XG4gIH1cblxuICBnZXQgaXNEZXZlbG9wbWVudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNEZXZlbG9wbWVudEJ1aWxkKCk7XG4gIH1cblxuICBnZXQgc2hvd0RlYnVnQ29udHJvbHMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNEZXZlbG9wbWVudDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZGVidWdWaWV3TW9kZWwgPSBuZXcgRGVidWdWaWV3TW9kZWwoKTtcblxuIiwgImltcG9ydCB7XG4gIEJyaWxsaWFudEFsbG93ZWRQaGFzZSxcbiAgQnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICBGZWF0dXJlT3B0aW9ucyxcbiAgbWVyZ2VGZWF0dXJlT3B0aW9ucyxcbn0gZnJvbSAnLi9mZWF0dXJlT3B0aW9ucyc7XG5pbXBvcnQge1xuICBCdWNrZXRDb25maWcsXG4gIERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgTW92ZVF1YWxpdHlQcmVzZXRJZCxcbiAgTU9WRV9RVUFMSVRZX1BSRVNFVFMsXG59IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgdHlwZSBQZXJzb25hUHJvZmlsZVRoZW1lTW9kZSA9ICdkYXJrJyB8ICdsaWdodCcgfCAnbWluaW1hbCcgfCAncGVyc29uYSc7XG5cbmV4cG9ydCBjb25zdCBQRVJTT05BX1BST0ZJTEVfS0lORCA9ICdwZXJzb25hY2hlc3MucGVyc29uYS1wcm9maWxlJztcbmV4cG9ydCBjb25zdCBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTiA9IDE7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90IHtcbiAgYnVja2V0Q29uZmlnOiBCdWNrZXRDb25maWc7XG4gIGN1cnJlbnRQcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGw7XG4gIGRlcHRoOiBudW1iZXI7XG4gIG11bHRpUFY6IG51bWJlcjtcbiAgZmVhdHVyZU9wdGlvbnM6IEZlYXR1cmVPcHRpb25zO1xuICBicmlsbGlhbnQ6IHtcbiAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IEJyaWxsaWFudE1vdmVzUGVyR2FtZTtcbiAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IEJyaWxsaWFudEFsbG93ZWRQaGFzZTtcbiAgfTtcbiAgdWk6IHtcbiAgICB0aGVtZU1vZGU6IFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlO1xuICAgIGJhc2ljTW9kZTogYm9vbGVhbjtcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQZXJzb25hUHJvZmlsZUV4cG9ydCB7XG4gIGtpbmQ6IHR5cGVvZiBQRVJTT05BX1BST0ZJTEVfS0lORDtcbiAgdmVyc2lvbjogdHlwZW9mIFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OO1xuICBuYW1lOiBzdHJpbmc7XG4gIHNldHRpbmdzOiBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3Q7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2F2ZWRQZXJzb25hUHJvZmlsZSBleHRlbmRzIFBlcnNvbmFQcm9maWxlRXhwb3J0IHtcbiAgaWQ6IHN0cmluZztcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XG4gIHVwZGF0ZWRBdDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBlcnNvbmFQcm9maWxlU3RvcmVTbmFwc2hvdCB7XG4gIHByb2ZpbGVzOiBTYXZlZFBlcnNvbmFQcm9maWxlW107XG4gIHNlbGVjdGVkUHJvZmlsZUlkOiBzdHJpbmcgfCBudWxsO1xufVxuXG5jb25zdCBWQUxJRF9QUkVTRVRfSURTID0gbmV3IFNldDxNb3ZlUXVhbGl0eVByZXNldElkPihNT1ZFX1FVQUxJVFlfUFJFU0VUUy5tYXAoKHByZXNldCkgPT4gcHJlc2V0LmlkKSk7XG5jb25zdCBWQUxJRF9USEVNRV9NT0RFUyA9IG5ldyBTZXQ8UGVyc29uYVByb2ZpbGVUaGVtZU1vZGU+KFsnZGFyaycsICdsaWdodCcsICdtaW5pbWFsJywgJ3BlcnNvbmEnXSk7XG5jb25zdCBWQUxJRF9CUklMTElBTlRfUEhBU0VTID0gbmV3IFNldDxCcmlsbGlhbnRBbGxvd2VkUGhhc2U+KFsnb3BlbmluZycsICdtaWRkbGVnYW1lJywgJ2VuZGdhbWUnLCAnYW55J10pO1xuY29uc3QgVkFMSURfQlJJTExJQU5UX0JVREdFVFMgPSBuZXcgU2V0PEJyaWxsaWFudE1vdmVzUGVyR2FtZT4oWzAsIDEsIDIsIDMsIDRdKTtcblxuZnVuY3Rpb24gaXNSZWNvcmQodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBjbGFtcEludGVnZXIodmFsdWU6IHVua25vd24sIG1pbmltdW06IG51bWJlciwgbWF4aW11bTogbnVtYmVyLCBmYWxsYmFjazogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsbGJhY2s7XG4gIH1cblxuICByZXR1cm4gTWF0aC5tYXgobWluaW11bSwgTWF0aC5taW4obWF4aW11bSwgTWF0aC5yb3VuZCh2YWx1ZSkpKTtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVCdWNrZXRDb25maWcodmFsdWU6IHVua25vd24pOiBCdWNrZXRDb25maWcge1xuICBpZiAoIWlzUmVjb3JkKHZhbHVlKSkge1xuICAgIHJldHVybiB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiZXN0OiBjbGFtcEludGVnZXIodmFsdWUuYmVzdCwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuYmVzdCksXG4gICAgZ3JlYXQ6IGNsYW1wSW50ZWdlcih2YWx1ZS5ncmVhdCwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuZ3JlYXQpLFxuICAgIGV4Y2VsbGVudDogY2xhbXBJbnRlZ2VyKHZhbHVlLmV4Y2VsbGVudCwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuZXhjZWxsZW50KSxcbiAgICBnb29kOiBjbGFtcEludGVnZXIodmFsdWUuZ29vZCwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuZ29vZCksXG4gICAgaW5hY2N1cmFjeTogY2xhbXBJbnRlZ2VyKHZhbHVlLmluYWNjdXJhY3ksIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmluYWNjdXJhY3kpLFxuICAgIG1pc3Rha2U6IGNsYW1wSW50ZWdlcih2YWx1ZS5taXN0YWtlLCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5taXN0YWtlKSxcbiAgICBibHVuZGVyOiBjbGFtcEludGVnZXIodmFsdWUuYmx1bmRlciwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuYmx1bmRlciksXG4gIH07XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplUHJlc2V0SWQodmFsdWU6IHVua25vd24pOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbCB7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgVkFMSURfUFJFU0VUX0lEUy5oYXModmFsdWUgYXMgTW92ZVF1YWxpdHlQcmVzZXRJZClcbiAgICA/ICh2YWx1ZSBhcyBNb3ZlUXVhbGl0eVByZXNldElkKVxuICAgIDogJ21lZGl1bSc7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplVGhlbWVNb2RlKHZhbHVlOiB1bmtub3duKTogUGVyc29uYVByb2ZpbGVUaGVtZU1vZGUge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBWQUxJRF9USEVNRV9NT0RFUy5oYXModmFsdWUgYXMgUGVyc29uYVByb2ZpbGVUaGVtZU1vZGUpXG4gICAgPyAodmFsdWUgYXMgUGVyc29uYVByb2ZpbGVUaGVtZU1vZGUpXG4gICAgOiAnZGFyayc7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplQnJpbGxpYW50TW92ZXNQZXJHYW1lKHZhbHVlOiB1bmtub3duKTogQnJpbGxpYW50TW92ZXNQZXJHYW1lIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgVkFMSURfQlJJTExJQU5UX0JVREdFVFMuaGFzKHZhbHVlIGFzIEJyaWxsaWFudE1vdmVzUGVyR2FtZSlcbiAgICA/ICh2YWx1ZSBhcyBCcmlsbGlhbnRNb3Zlc1BlckdhbWUpXG4gICAgOiAwO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZUJyaWxsaWFudEFsbG93ZWRQaGFzZSh2YWx1ZTogdW5rbm93bik6IEJyaWxsaWFudEFsbG93ZWRQaGFzZSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIFZBTElEX0JSSUxMSUFOVF9QSEFTRVMuaGFzKHZhbHVlIGFzIEJyaWxsaWFudEFsbG93ZWRQaGFzZSlcbiAgICA/ICh2YWx1ZSBhcyBCcmlsbGlhbnRBbGxvd2VkUGhhc2UpXG4gICAgOiAnYW55Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90KHZhbHVlOiB1bmtub3duKTogUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90IHtcbiAgY29uc3QgcmVjb3JkID0gaXNSZWNvcmQodmFsdWUpID8gdmFsdWUgOiB7fTtcbiAgY29uc3QgYnJpbGxpYW50ID0gaXNSZWNvcmQocmVjb3JkLmJyaWxsaWFudCkgPyByZWNvcmQuYnJpbGxpYW50IDoge307XG4gIGNvbnN0IHVpID0gaXNSZWNvcmQocmVjb3JkLnVpKSA/IHJlY29yZC51aSA6IHt9O1xuXG4gIHJldHVybiB7XG4gICAgYnVja2V0Q29uZmlnOiBzYW5pdGl6ZUJ1Y2tldENvbmZpZyhyZWNvcmQuYnVja2V0Q29uZmlnKSxcbiAgICBjdXJyZW50UHJlc2V0SWQ6IHNhbml0aXplUHJlc2V0SWQocmVjb3JkLmN1cnJlbnRQcmVzZXRJZCksXG4gICAgZGVwdGg6IGNsYW1wSW50ZWdlcihyZWNvcmQuZGVwdGgsIDEsIDMwLCA4KSxcbiAgICBtdWx0aVBWOiBjbGFtcEludGVnZXIocmVjb3JkLm11bHRpUFYsIDEsIDIwLCAxMiksXG4gICAgZmVhdHVyZU9wdGlvbnM6IG1lcmdlRmVhdHVyZU9wdGlvbnMoaXNSZWNvcmQocmVjb3JkLmZlYXR1cmVPcHRpb25zKSA/IChyZWNvcmQuZmVhdHVyZU9wdGlvbnMgYXMgUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4pIDogdW5kZWZpbmVkKSxcbiAgICBicmlsbGlhbnQ6IHtcbiAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogc2FuaXRpemVCcmlsbGlhbnRNb3Zlc1BlckdhbWUoYnJpbGxpYW50LmJyaWxsaWFudE1vdmVzUGVyR2FtZSksXG4gICAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IHNhbml0aXplQnJpbGxpYW50QWxsb3dlZFBoYXNlKGJyaWxsaWFudC5icmlsbGlhbnRBbGxvd2VkUGhhc2UpLFxuICAgIH0sXG4gICAgdWk6IHtcbiAgICAgIHRoZW1lTW9kZTogc2FuaXRpemVUaGVtZU1vZGUodWkudGhlbWVNb2RlKSxcbiAgICAgIGJhc2ljTW9kZTogdHlwZW9mIHVpLmJhc2ljTW9kZSA9PT0gJ2Jvb2xlYW4nID8gdWkuYmFzaWNNb2RlIDogdHJ1ZSxcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVQZXJzb25hUHJvZmlsZUV4cG9ydChcbiAgdmFsdWU6IHVua25vd24sXG4gIGZhbGxiYWNrTmFtZSA9ICdJbXBvcnRlZCBQcm9maWxlJyxcbik6IFBlcnNvbmFQcm9maWxlRXhwb3J0IHwgbnVsbCB7XG4gIGlmICghaXNSZWNvcmQodmFsdWUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAodmFsdWUua2luZCAhPT0gUEVSU09OQV9QUk9GSUxFX0tJTkQgfHwgdmFsdWUudmVyc2lvbiAhPT0gUEVSU09OQV9QUk9GSUxFX1ZFUlNJT04pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IG5hbWUgPSB0eXBlb2YgdmFsdWUubmFtZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUubmFtZS50cmltKCkgPyB2YWx1ZS5uYW1lLnRyaW0oKSA6IGZhbGxiYWNrTmFtZTtcblxuICByZXR1cm4ge1xuICAgIGtpbmQ6IFBFUlNPTkFfUFJPRklMRV9LSU5ELFxuICAgIHZlcnNpb246IFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OLFxuICAgIG5hbWUsXG4gICAgc2V0dGluZ3M6IHNhbml0aXplUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90KHZhbHVlLnNldHRpbmdzKSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGVyc29uYVByb2ZpbGVJbXBvcnQoXG4gIGpzb246IHN0cmluZyxcbik6IHsgb2s6IHRydWU7IHByb2ZpbGU6IFBlcnNvbmFQcm9maWxlRXhwb3J0IH0gfCB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgaWYgKCFqc29uLnRyaW0oKSkge1xuICAgIHJldHVybiB7XG4gICAgICBvazogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ltcG9ydCBKU09OIGlzIGVtcHR5LicsXG4gICAgfTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShqc29uKSBhcyB1bmtub3duO1xuICAgIGNvbnN0IHByb2ZpbGUgPSBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlRXhwb3J0KHBhcnNlZCk7XG5cbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdJbXBvcnRlZCBKU09OIGRvZXMgbm90IG1hdGNoIHRoZSBQZXJzb25hQ2hlc3MgcHJvZmlsZSBzY2hlbWEuJyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgb2s6IHRydWUsIHByb2ZpbGUgfTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnSW1wb3J0ZWQgSlNPTiBjb3VsZCBub3QgYmUgcGFyc2VkLicsXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUocHJvZmlsZTogUGVyc29uYVByb2ZpbGVFeHBvcnQpOiBzdHJpbmcge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJvZmlsZSwgbnVsbCwgMik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTYXZlZFBlcnNvbmFQcm9maWxlKFxuICBwcm9maWxlOiBQZXJzb25hUHJvZmlsZUV4cG9ydCxcbiAgaWQ6IHN0cmluZyxcbiAgbm93SXNvOiBzdHJpbmcsXG4pOiBTYXZlZFBlcnNvbmFQcm9maWxlIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5wcm9maWxlLFxuICAgIGlkLFxuICAgIGNyZWF0ZWRBdDogbm93SXNvLFxuICAgIHVwZGF0ZWRBdDogbm93SXNvLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2F2ZWRQZXJzb25hUHJvZmlsZShcbiAgcHJvZmlsZTogU2F2ZWRQZXJzb25hUHJvZmlsZSxcbiAgbmV4dDogUGVyc29uYVByb2ZpbGVFeHBvcnQsXG4gIG5vd0lzbzogc3RyaW5nLFxuKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB7XG4gIHJldHVybiB7XG4gICAgLi4ucHJvZmlsZSxcbiAgICAuLi5uZXh0LFxuICAgIGlkOiBwcm9maWxlLmlkLFxuICAgIGNyZWF0ZWRBdDogcHJvZmlsZS5jcmVhdGVkQXQsXG4gICAgdXBkYXRlZEF0OiBub3dJc28sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkdXBsaWNhdGVQZXJzb25hUHJvZmlsZShcbiAgcHJvZmlsZTogU2F2ZWRQZXJzb25hUHJvZmlsZSxcbiAgaWQ6IHN0cmluZyxcbiAgbmFtZTogc3RyaW5nLFxuICBub3dJc286IHN0cmluZyxcbik6IFNhdmVkUGVyc29uYVByb2ZpbGUge1xuICByZXR1cm4ge1xuICAgIC4uLnByb2ZpbGUsXG4gICAgaWQsXG4gICAgbmFtZSxcbiAgICBjcmVhdGVkQXQ6IG5vd0lzbyxcbiAgICB1cGRhdGVkQXQ6IG5vd0lzbyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplU2F2ZWRQZXJzb25hUHJvZmlsZSh2YWx1ZTogdW5rbm93bik6IFNhdmVkUGVyc29uYVByb2ZpbGUgfCBudWxsIHtcbiAgaWYgKCFpc1JlY29yZCh2YWx1ZSkgfHwgdHlwZW9mIHZhbHVlLmlkICE9PSAnc3RyaW5nJyB8fCAhdmFsdWUuaWQudHJpbSgpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBleHBvcnRlZCA9IHNhbml0aXplUGVyc29uYVByb2ZpbGVFeHBvcnQodmFsdWUpO1xuICBpZiAoIWV4cG9ydGVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBjcmVhdGVkQXQgPSB0eXBlb2YgdmFsdWUuY3JlYXRlZEF0ID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5jcmVhdGVkQXQudHJpbSgpXG4gICAgPyB2YWx1ZS5jcmVhdGVkQXRcbiAgICA6IG5ldyBEYXRlKDApLnRvSVNPU3RyaW5nKCk7XG4gIGNvbnN0IHVwZGF0ZWRBdCA9IHR5cGVvZiB2YWx1ZS51cGRhdGVkQXQgPT09ICdzdHJpbmcnICYmIHZhbHVlLnVwZGF0ZWRBdC50cmltKClcbiAgICA/IHZhbHVlLnVwZGF0ZWRBdFxuICAgIDogY3JlYXRlZEF0O1xuXG4gIHJldHVybiB7XG4gICAgLi4uZXhwb3J0ZWQsXG4gICAgaWQ6IHZhbHVlLmlkLFxuICAgIGNyZWF0ZWRBdCxcbiAgICB1cGRhdGVkQXQsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlU3RvcmVTbmFwc2hvdCh2YWx1ZTogdW5rbm93bik6IFBlcnNvbmFQcm9maWxlU3RvcmVTbmFwc2hvdCB7XG4gIGlmICghaXNSZWNvcmQodmFsdWUpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb2ZpbGVzOiBbXSxcbiAgICAgIHNlbGVjdGVkUHJvZmlsZUlkOiBudWxsLFxuICAgIH07XG4gIH1cblxuICBjb25zdCBwcm9maWxlcyA9IEFycmF5LmlzQXJyYXkodmFsdWUucHJvZmlsZXMpXG4gICAgPyB2YWx1ZS5wcm9maWxlc1xuICAgICAgLm1hcCgoZW50cnkpID0+IHNhbml0aXplU2F2ZWRQZXJzb25hUHJvZmlsZShlbnRyeSkpXG4gICAgICAuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIFNhdmVkUGVyc29uYVByb2ZpbGUgPT4gZW50cnkgIT09IG51bGwpXG4gICAgOiBbXTtcbiAgY29uc3Qgc2VsZWN0ZWRQcm9maWxlSWQgPSB0eXBlb2YgdmFsdWUuc2VsZWN0ZWRQcm9maWxlSWQgPT09ICdzdHJpbmcnID8gdmFsdWUuc2VsZWN0ZWRQcm9maWxlSWQgOiBudWxsO1xuXG4gIHJldHVybiB7XG4gICAgcHJvZmlsZXMsXG4gICAgc2VsZWN0ZWRQcm9maWxlSWQ6IHByb2ZpbGVzLnNvbWUoKHByb2ZpbGUpID0+IHByb2ZpbGUuaWQgPT09IHNlbGVjdGVkUHJvZmlsZUlkKSA/IHNlbGVjdGVkUHJvZmlsZUlkIDogbnVsbCxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUGVyc29uYVByb2ZpbGVFeHBvcnRGaWxlbmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBzbHVnID0gbmFtZVxuICAgIC50cmltKClcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi0rfC0rJC9nLCAnJykgfHwgJ3BlcnNvbmEtcHJvZmlsZSc7XG5cbiAgcmV0dXJuIGBwZXJzb25hY2hlc3MtJHtzbHVnfS5qc29uYDtcbn1cbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgYnVpbGRQZXJzb25hUHJvZmlsZUV4cG9ydEZpbGVuYW1lLFxuICBjcmVhdGVTYXZlZFBlcnNvbmFQcm9maWxlLFxuICBkdXBsaWNhdGVQZXJzb25hUHJvZmlsZSxcbiAgcGFyc2VQZXJzb25hUHJvZmlsZUltcG9ydCxcbiAgUEVSU09OQV9QUk9GSUxFX0tJTkQsXG4gIFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OLFxuICBQZXJzb25hUHJvZmlsZUV4cG9ydCxcbiAgUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90LFxuICBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlU3RvcmVTbmFwc2hvdCxcbiAgU2F2ZWRQZXJzb25hUHJvZmlsZSxcbiAgc2VyaWFsaXplUGVyc29uYVByb2ZpbGUsXG4gIHVwZGF0ZVNhdmVkUGVyc29uYVByb2ZpbGUsXG59IGZyb20gJy4uL2VuZ2luZS9wZXJzb25hUHJvZmlsZXMnO1xuaW1wb3J0IHsgY29uZmlnVmlld01vZGVsLCBDb25maWdWaWV3TW9kZWwgfSBmcm9tICcuL0NvbmZpZ1ZpZXdNb2RlbCc7XG5pbXBvcnQgeyBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCwgRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcbmltcG9ydCB7IHVpU3RhdGVWaWV3TW9kZWwsIFVpU3RhdGVWaWV3TW9kZWwgfSBmcm9tICcuL1VpU3RhdGVWaWV3TW9kZWwnO1xuXG5jb25zdCBQRVJTT05BX1BST0ZJTEVTX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19wZXJzb25hX3Byb2ZpbGVzJztcblxuaW50ZXJmYWNlIFBlcnNvbmFQcm9maWxlc0RlcGVuZGVuY2llcyB7XG4gIGNvbmZpZ1ZpZXdNb2RlbDogUGljazxDb25maWdWaWV3TW9kZWwsICdidWNrZXRDb25maWcnIHwgJ2N1cnJlbnRQcmVzZXRJZCcgfCAnZGVwdGgnIHwgJ211bHRpUFYnIHwgJ2FwcGx5UHJvZmlsZVNuYXBzaG90Jz47XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsOiBQaWNrPFxuICAgIEZlYXR1cmVPcHRpb25zVmlld01vZGVsLFxuICAgIHwgJ29wdGlvbnMnXG4gICAgfCAnYnJpbGxpYW50TW92ZXNQZXJHYW1lJ1xuICAgIHwgJ2JyaWxsaWFudEFsbG93ZWRQaGFzZSdcbiAgICB8ICdhcHBseVByb2ZpbGVTZXR0aW5ncydcbiAgPjtcbiAgdWlTdGF0ZVZpZXdNb2RlbDogUGljazxcbiAgICBVaVN0YXRlVmlld01vZGVsLFxuICAgIHwgJ3RoZW1lTW9kZSdcbiAgICB8ICdiYXNpY01vZGUnXG4gICAgfCAnYXBwbHlQcm9maWxlUHJlZmVyZW5jZXMnXG4gID47XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByb2ZpbGVJZCgpOiBzdHJpbmcge1xuICByZXR1cm4gYHByb2ZpbGVfJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCA4KX1gO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUaW1lc3RhbXAoKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbn1cblxuZXhwb3J0IGNsYXNzIFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCB7XG4gIHByb2ZpbGVzOiBTYXZlZFBlcnNvbmFQcm9maWxlW10gPSBbXTtcbiAgc2VsZWN0ZWRQcm9maWxlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBwcm9maWxlTmFtZURyYWZ0ID0gJyc7XG4gIGV4Y2hhbmdlSnNvbiA9ICcnO1xuICBsYXN0QWN0aW9uTWVzc2FnZSA9ICcnO1xuICBpbXBvcnRFcnJvciA9ICcnO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVwczogUGVyc29uYVByb2ZpbGVzRGVwZW5kZW5jaWVzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRlcHM6IFBlcnNvbmFQcm9maWxlc0RlcGVuZGVuY2llcyA9IHtcbiAgICAgIGNvbmZpZ1ZpZXdNb2RlbCxcbiAgICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLFxuICAgICAgdWlTdGF0ZVZpZXdNb2RlbCxcbiAgICB9LFxuICApIHtcbiAgICB0aGlzLmRlcHMgPSBkZXBzO1xuXG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldFNlbGVjdGVkUHJvZmlsZUlkOiBhY3Rpb24sXG4gICAgICBzZXRQcm9maWxlTmFtZURyYWZ0OiBhY3Rpb24sXG4gICAgICBzZXRFeGNoYW5nZUpzb246IGFjdGlvbixcbiAgICAgIGNsZWFyRXhjaGFuZ2VTdGF0ZTogYWN0aW9uLFxuICAgICAgc2F2ZUN1cnJlbnRQcm9maWxlOiBhY3Rpb24sXG4gICAgICBsb2FkU2VsZWN0ZWRQcm9maWxlOiBhY3Rpb24sXG4gICAgICBkdXBsaWNhdGVTZWxlY3RlZFByb2ZpbGU6IGFjdGlvbixcbiAgICAgIHJlbmFtZVNlbGVjdGVkUHJvZmlsZTogYWN0aW9uLFxuICAgICAgZGVsZXRlU2VsZWN0ZWRQcm9maWxlOiBhY3Rpb24sXG4gICAgICBpbXBvcnRQcm9maWxlRnJvbUpzb246IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTZWxlY3RlZFByb2ZpbGVJZChpZDogc3RyaW5nIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBpZDtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZT8ubmFtZSA/PyAnJztcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gJyc7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICB9XG5cbiAgc2V0UHJvZmlsZU5hbWVEcmFmdCh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gdmFsdWU7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9ICcnO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgfVxuXG4gIHNldEV4Y2hhbmdlSnNvbih2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSB2YWx1ZTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gJyc7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICB9XG5cbiAgY2xlYXJFeGNoYW5nZVN0YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gJyc7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9ICcnO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgfVxuXG4gIHNhdmVDdXJyZW50UHJvZmlsZShuYW1lID0gdGhpcy5wcm9maWxlTmFtZURyYWZ0KTogYm9vbGVhbiB7XG4gICAgY29uc3QgdHJpbW1lZE5hbWUgPSBuYW1lLnRyaW0oKTtcbiAgICBpZiAoIXRyaW1tZWROYW1lKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ0VudGVyIGEgcHJvZmlsZSBuYW1lIGJlZm9yZSBzYXZpbmcuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBzbmFwc2hvdCA9IHRoaXMuYnVpbGRDdXJyZW50U25hcHNob3QoKTtcbiAgICBjb25zdCBleHBvcnRlZCA9IHRoaXMuY3JlYXRlRXhwb3J0KHRyaW1tZWROYW1lLCBzbmFwc2hvdCk7XG4gICAgY29uc3Qgbm93SXNvID0gY3JlYXRlVGltZXN0YW1wKCk7XG4gICAgY29uc3QgZXhpc3RpbmdCeVNlbGVjdGVkID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgY29uc3QgZXhpc3RpbmdCeU5hbWUgPSB0aGlzLmZpbmRCeU5hbWUodHJpbW1lZE5hbWUpO1xuXG4gICAgaWYgKGV4aXN0aW5nQnlTZWxlY3RlZCAmJiBleGlzdGluZ0J5U2VsZWN0ZWQubmFtZSA9PT0gdHJpbW1lZE5hbWUpIHtcbiAgICAgIHRoaXMucHJvZmlsZXMgPSB0aGlzLnByb2ZpbGVzLm1hcCgocHJvZmlsZSkgPT4gKFxuICAgICAgICBwcm9maWxlLmlkID09PSBleGlzdGluZ0J5U2VsZWN0ZWQuaWRcbiAgICAgICAgICA/IHVwZGF0ZVNhdmVkUGVyc29uYVByb2ZpbGUocHJvZmlsZSwgZXhwb3J0ZWQsIG5vd0lzbylcbiAgICAgICAgICA6IHByb2ZpbGVcbiAgICAgICkpO1xuICAgICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBVcGRhdGVkIHByb2ZpbGUgXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQuYDtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQpO1xuICAgICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoZXhpc3RpbmdCeU5hbWUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSBgQSBwcm9maWxlIG5hbWVkIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFEIGFscmVhZHkgZXhpc3RzLmA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgc2F2ZWQgPSBjcmVhdGVTYXZlZFBlcnNvbmFQcm9maWxlKGV4cG9ydGVkLCBjcmVhdGVQcm9maWxlSWQoKSwgbm93SXNvKTtcbiAgICB0aGlzLnByb2ZpbGVzID0gW3NhdmVkLCAuLi50aGlzLnByb2ZpbGVzXTtcbiAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gc2F2ZWQuaWQ7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gc2F2ZWQubmFtZTtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKGV4cG9ydGVkKTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYFNhdmVkIHByb2ZpbGUgXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBsb2FkU2VsZWN0ZWRQcm9maWxlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnU2VsZWN0IGEgc2F2ZWQgcHJvZmlsZSB0byBsb2FkLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5hcHBseVNuYXBzaG90KHByb2ZpbGUuc2V0dGluZ3MpO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHByb2ZpbGUubmFtZTtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKHRoaXMudG9FeHBvcnQocHJvZmlsZSkpO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgTG9hZGVkIHByb2ZpbGUgXHUyMDFDJHtwcm9maWxlLm5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZHVwbGljYXRlU2VsZWN0ZWRQcm9maWxlKG5hbWUgPSB0aGlzLnByb2ZpbGVOYW1lRHJhZnQpOiBib29sZWFuIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ1NlbGVjdCBhIHNhdmVkIHByb2ZpbGUgdG8gZHVwbGljYXRlLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgdHJpbW1lZE5hbWUgPSBuYW1lLnRyaW0oKSB8fCBgJHtwcm9maWxlLm5hbWV9IENvcHlgO1xuICAgIGlmICh0aGlzLmZpbmRCeU5hbWUodHJpbW1lZE5hbWUpKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gYEEgcHJvZmlsZSBuYW1lZCBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRCBhbHJlYWR5IGV4aXN0cy5gO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IG5vd0lzbyA9IGNyZWF0ZVRpbWVzdGFtcCgpO1xuICAgIGNvbnN0IGR1cGxpY2F0ZSA9IGR1cGxpY2F0ZVBlcnNvbmFQcm9maWxlKHByb2ZpbGUsIGNyZWF0ZVByb2ZpbGVJZCgpLCB0cmltbWVkTmFtZSwgbm93SXNvKTtcbiAgICB0aGlzLnByb2ZpbGVzID0gW2R1cGxpY2F0ZSwgLi4udGhpcy5wcm9maWxlc107XG4gICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IGR1cGxpY2F0ZS5pZDtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSBkdXBsaWNhdGUubmFtZTtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKHRoaXMudG9FeHBvcnQoZHVwbGljYXRlKSk7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBEdXBsaWNhdGVkIHByb2ZpbGUgYXMgXHUyMDFDJHtkdXBsaWNhdGUubmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZW5hbWVTZWxlY3RlZFByb2ZpbGUobmFtZSA9IHRoaXMucHJvZmlsZU5hbWVEcmFmdCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnU2VsZWN0IGEgc2F2ZWQgcHJvZmlsZSB0byByZW5hbWUuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB0cmltbWVkTmFtZSA9IG5hbWUudHJpbSgpO1xuICAgIGlmICghdHJpbW1lZE5hbWUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnRW50ZXIgYSBwcm9maWxlIG5hbWUgYmVmb3JlIHJlbmFtaW5nLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHByb2ZpbGUubmFtZSA9PT0gdHJpbW1lZE5hbWUpIHtcbiAgICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSAnUHJvZmlsZSBuYW1lIGlzIGFscmVhZHkgdXAgdG8gZGF0ZS4nO1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RpbmdCeU5hbWUgPSB0aGlzLmZpbmRCeU5hbWUodHJpbW1lZE5hbWUpO1xuICAgIGlmIChleGlzdGluZ0J5TmFtZSAmJiBleGlzdGluZ0J5TmFtZS5pZCAhPT0gcHJvZmlsZS5pZCkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9IGBBIHByb2ZpbGUgbmFtZWQgXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQgYWxyZWFkeSBleGlzdHMuYDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBub3dJc28gPSBjcmVhdGVUaW1lc3RhbXAoKTtcbiAgICB0aGlzLnByb2ZpbGVzID0gdGhpcy5wcm9maWxlcy5tYXAoKGVudHJ5KSA9PiAoXG4gICAgICBlbnRyeS5pZCA9PT0gcHJvZmlsZS5pZFxuICAgICAgICA/IHsgLi4uZW50cnksIG5hbWU6IHRyaW1tZWROYW1lLCB1cGRhdGVkQXQ6IG5vd0lzbyB9XG4gICAgICAgIDogZW50cnlcbiAgICApKTtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSB0cmltbWVkTmFtZTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYFJlbmFtZWQgcHJvZmlsZSB0byBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRlbGV0ZVNlbGVjdGVkUHJvZmlsZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ1NlbGVjdCBhIHNhdmVkIHByb2ZpbGUgdG8gZGVsZXRlLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9maWxlcyA9IHRoaXMucHJvZmlsZXMuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkuaWQgIT09IHByb2ZpbGUuaWQpO1xuICAgIGNvbnN0IG5leHRTZWxlY3RlZElkID0gdGhpcy5wcm9maWxlc1swXT8uaWQgPz8gbnVsbDtcbiAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gbmV4dFNlbGVjdGVkSWQ7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU/Lm5hbWUgPz8gJyc7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSAnJztcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYERlbGV0ZWQgcHJvZmlsZSBcdTIwMUMke3Byb2ZpbGUubmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBleHBvcnRTZWxlY3RlZFByb2ZpbGUoKTogeyBmaWxlTmFtZTogc3RyaW5nOyBqc29uOiBzdHJpbmcgfSB8IG51bGwge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnU2VsZWN0IGEgc2F2ZWQgcHJvZmlsZSB0byBleHBvcnQuJztcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGV4cG9ydGVkID0gdGhpcy50b0V4cG9ydChwcm9maWxlKTtcbiAgICBjb25zdCBqc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQpO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0ganNvbjtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYEV4cG9ydGVkIHByb2ZpbGUgXHUyMDFDJHtwcm9maWxlLm5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGVOYW1lOiBidWlsZFBlcnNvbmFQcm9maWxlRXhwb3J0RmlsZW5hbWUocHJvZmlsZS5uYW1lKSxcbiAgICAgIGpzb24sXG4gICAgfTtcbiAgfVxuXG4gIGltcG9ydFByb2ZpbGVGcm9tSnNvbihqc29uID0gdGhpcy5leGNoYW5nZUpzb24pOiBib29sZWFuIHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZVBlcnNvbmFQcm9maWxlSW1wb3J0KGpzb24pO1xuICAgIGlmICghcGFyc2VkLm9rKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gcGFyc2VkLmVycm9yO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGluY29taW5nTmFtZSA9IHBhcnNlZC5wcm9maWxlLm5hbWUudHJpbSgpO1xuICAgIGNvbnN0IGZpbmFsTmFtZSA9IHRoaXMuZW5zdXJlVW5pcXVlTmFtZShpbmNvbWluZ05hbWUpO1xuICAgIGNvbnN0IGV4cG9ydGVkID0ge1xuICAgICAgLi4ucGFyc2VkLnByb2ZpbGUsXG4gICAgICBuYW1lOiBmaW5hbE5hbWUsXG4gICAgfTtcbiAgICBjb25zdCBub3dJc28gPSBjcmVhdGVUaW1lc3RhbXAoKTtcbiAgICBjb25zdCBzYXZlZCA9IGNyZWF0ZVNhdmVkUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQsIGNyZWF0ZVByb2ZpbGVJZCgpLCBub3dJc28pO1xuXG4gICAgdGhpcy5wcm9maWxlcyA9IFtzYXZlZCwgLi4udGhpcy5wcm9maWxlc107XG4gICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IHNhdmVkLmlkO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHNhdmVkLm5hbWU7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZShleHBvcnRlZCk7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGZpbmFsTmFtZSA9PT0gaW5jb21pbmdOYW1lXG4gICAgICA/IGBJbXBvcnRlZCBwcm9maWxlIFx1MjAxQyR7ZmluYWxOYW1lfVx1MjAxRC5gXG4gICAgICA6IGBJbXBvcnRlZCBwcm9maWxlIGFzIFx1MjAxQyR7ZmluYWxOYW1lfVx1MjAxRCB0byBhdm9pZCBhIGR1cGxpY2F0ZSBuYW1lLmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZ2V0IHNlbGVjdGVkUHJvZmlsZSgpOiBTYXZlZFBlcnNvbmFQcm9maWxlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucHJvZmlsZXMuZmluZCgocHJvZmlsZSkgPT4gcHJvZmlsZS5pZCA9PT0gdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCkgPz8gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgYnVpbGRDdXJyZW50U25hcHNob3QoKTogUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90IHtcbiAgICByZXR1cm4ge1xuICAgICAgYnVja2V0Q29uZmlnOiB7IC4uLnRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuYnVja2V0Q29uZmlnIH0sXG4gICAgICBjdXJyZW50UHJlc2V0SWQ6IHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuY3VycmVudFByZXNldElkLFxuICAgICAgZGVwdGg6IHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuZGVwdGgsXG4gICAgICBtdWx0aVBWOiB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLm11bHRpUFYsXG4gICAgICBmZWF0dXJlT3B0aW9uczogeyAuLi50aGlzLmRlcHMuZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwub3B0aW9ucyB9LFxuICAgICAgYnJpbGxpYW50OiB7XG4gICAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogdGhpcy5kZXBzLmZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVzUGVyR2FtZSxcbiAgICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiB0aGlzLmRlcHMuZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50QWxsb3dlZFBoYXNlLFxuICAgICAgfSxcbiAgICAgIHVpOiB7XG4gICAgICAgIHRoZW1lTW9kZTogdGhpcy5kZXBzLnVpU3RhdGVWaWV3TW9kZWwudGhlbWVNb2RlLFxuICAgICAgICBiYXNpY01vZGU6IHRoaXMuZGVwcy51aVN0YXRlVmlld01vZGVsLmJhc2ljTW9kZSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlTbmFwc2hvdChzbmFwc2hvdDogUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90KTogdm9pZCB7XG4gICAgdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5hcHBseVByb2ZpbGVTbmFwc2hvdCh7XG4gICAgICBidWNrZXRDb25maWc6IHNuYXBzaG90LmJ1Y2tldENvbmZpZyxcbiAgICAgIGN1cnJlbnRQcmVzZXRJZDogc25hcHNob3QuY3VycmVudFByZXNldElkLFxuICAgICAgZGVwdGg6IHNuYXBzaG90LmRlcHRoLFxuICAgICAgbXVsdGlQVjogc25hcHNob3QubXVsdGlQVixcbiAgICB9KTtcbiAgICB0aGlzLmRlcHMuZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYXBwbHlQcm9maWxlU2V0dGluZ3Moc25hcHNob3QuZmVhdHVyZU9wdGlvbnMsIHNuYXBzaG90LmJyaWxsaWFudCk7XG4gICAgdGhpcy5kZXBzLnVpU3RhdGVWaWV3TW9kZWwuYXBwbHlQcm9maWxlUHJlZmVyZW5jZXMoc25hcHNob3QudWkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVFeHBvcnQobmFtZTogc3RyaW5nLCBzZXR0aW5nczogUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90KTogUGVyc29uYVByb2ZpbGVFeHBvcnQge1xuICAgIHJldHVybiB7XG4gICAgICBraW5kOiBQRVJTT05BX1BST0ZJTEVfS0lORCxcbiAgICAgIHZlcnNpb246IFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OLFxuICAgICAgbmFtZSxcbiAgICAgIHNldHRpbmdzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHRvRXhwb3J0KHByb2ZpbGU6IFNhdmVkUGVyc29uYVByb2ZpbGUpOiBQZXJzb25hUHJvZmlsZUV4cG9ydCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6IHByb2ZpbGUua2luZCxcbiAgICAgIHZlcnNpb246IHByb2ZpbGUudmVyc2lvbixcbiAgICAgIG5hbWU6IHByb2ZpbGUubmFtZSxcbiAgICAgIHNldHRpbmdzOiBwcm9maWxlLnNldHRpbmdzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGZpbmRCeU5hbWUobmFtZTogc3RyaW5nKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB8IG51bGwge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWROYW1lID0gbmFtZS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gdGhpcy5wcm9maWxlcy5maW5kKChwcm9maWxlKSA9PiBwcm9maWxlLm5hbWUudHJpbSgpLnRvTG93ZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lKSA/PyBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVVbmlxdWVOYW1lKGJhc2VOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHRyaW1tZWRCYXNlTmFtZSA9IGJhc2VOYW1lLnRyaW0oKSB8fCAnSW1wb3J0ZWQgUHJvZmlsZSc7XG4gICAgaWYgKCF0aGlzLmZpbmRCeU5hbWUodHJpbW1lZEJhc2VOYW1lKSkge1xuICAgICAgcmV0dXJuIHRyaW1tZWRCYXNlTmFtZTtcbiAgICB9XG5cbiAgICBsZXQgaW5kZXggPSAyO1xuICAgIGxldCBjYW5kaWRhdGUgPSBgJHt0cmltbWVkQmFzZU5hbWV9ICR7aW5kZXh9YDtcbiAgICB3aGlsZSAodGhpcy5maW5kQnlOYW1lKGNhbmRpZGF0ZSkpIHtcbiAgICAgIGluZGV4ICs9IDE7XG4gICAgICBjYW5kaWRhdGUgPSBgJHt0cmltbWVkQmFzZU5hbWV9ICR7aW5kZXh9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FuZGlkYXRlO1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oUEVSU09OQV9QUk9GSUxFU19TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc25hcHNob3QgPSBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlU3RvcmVTbmFwc2hvdChKU09OLnBhcnNlKHNhdmVkKSBhcyB1bmtub3duKTtcbiAgICAgIHRoaXMucHJvZmlsZXMgPSBzbmFwc2hvdC5wcm9maWxlcztcbiAgICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBzbmFwc2hvdC5zZWxlY3RlZFByb2ZpbGVJZCA/PyBzbmFwc2hvdC5wcm9maWxlc1swXT8uaWQgPz8gbnVsbDtcbiAgICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlPy5uYW1lID8/ICcnO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGludmFsaWQgc2F2ZWQgcGVyc29uYSBwcm9maWxlcyBhbmQgY29udGludWUgd2l0aCBhbiBlbXB0eSBsaXN0LlxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGVyc2lzdFRvU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgIFBFUlNPTkFfUFJPRklMRVNfU1RPUkFHRV9LRVksXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBwcm9maWxlczogdGhpcy5wcm9maWxlcyxcbiAgICAgICAgICBzZWxlY3RlZFByb2ZpbGVJZDogdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGxvY2FsU3RvcmFnZSBmYWlsdXJlcyB0byBrZWVwIHNldHRpbmdzIHVzYWJsZS5cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCA9IG5ldyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwoKTtcblxuZXhwb3J0IHsgUEVSU09OQV9QUk9GSUxFU19TVE9SQUdFX0tFWSB9O1xuIiwgIi8qKlxuICogVmlld01vZGVscyBNb2R1bGVcbiAqIFJlLWV4cG9ydHMgYWxsIFZpZXdNb2RlbCBpbnN0YW5jZXNcbiAqL1xuXG5leHBvcnQgeyBCb2FyZFZpZXdNb2RlbCwgYm9hcmRWaWV3TW9kZWwgfSBmcm9tICcuL0JvYXJkVmlld01vZGVsJztcbmV4cG9ydCB7IEVuZ2luZVZpZXdNb2RlbCwgZW5naW5lVmlld01vZGVsIH0gZnJvbSAnLi9FbmdpbmVWaWV3TW9kZWwnO1xuZXhwb3J0IHsgQ29uZmlnVmlld01vZGVsLCBjb25maWdWaWV3TW9kZWwgfSBmcm9tICcuL0NvbmZpZ1ZpZXdNb2RlbCc7XG5leHBvcnQgeyBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcbmV4cG9ydCB7IEdhbWVBbmFseXRpY3NWaWV3TW9kZWwsIGdhbWVBbmFseXRpY3NWaWV3TW9kZWwgfSBmcm9tICcuL0dhbWVBbmFseXRpY3NWaWV3TW9kZWwnO1xuZXhwb3J0IHsgR2FtZVNldHVwVmlld01vZGVsLCBnYW1lU2V0dXBWaWV3TW9kZWwgfSBmcm9tICcuL0dhbWVTZXR1cFZpZXdNb2RlbCc7XG5leHBvcnQgeyBEZWJ1Z1ZpZXdNb2RlbCwgZGVidWdWaWV3TW9kZWwgfSBmcm9tICcuL0RlYnVnVmlld01vZGVsJztcbmV4cG9ydCB7IFVpU3RhdGVWaWV3TW9kZWwsIHVpU3RhdGVWaWV3TW9kZWwgfSBmcm9tICcuL1VpU3RhdGVWaWV3TW9kZWwnO1xuZXhwb3J0IHsgUGVyc29uYVByb2ZpbGVzVmlld01vZGVsLCBwZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwgfSBmcm9tICcuL1BlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCc7XG4iLCAiaW1wb3J0IGFzc2VydCBmcm9tICdub2RlOmFzc2VydC9zdHJpY3QnO1xuaW1wb3J0IHRlc3QgZnJvbSAnbm9kZTp0ZXN0JztcblxuY2xhc3MgTWVtb3J5U3RvcmFnZSB7XG4gIHByaXZhdGUgc3RvcmUgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gIGdldEl0ZW0oa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5oYXMoa2V5KSA/ICh0aGlzLnN0b3JlLmdldChrZXkpID8/IG51bGwpIDogbnVsbDtcbiAgfVxuXG4gIHNldEl0ZW0oa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlLnNldChrZXksIHZhbHVlKTtcbiAgfVxuXG4gIHJlbW92ZUl0ZW0oa2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlLmRlbGV0ZShrZXkpO1xuICB9XG5cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZS5jbGVhcigpO1xuICB9XG59XG5cbmNvbnN0IGxvY2FsU3RvcmFnZU1vY2sgPSBuZXcgTWVtb3J5U3RvcmFnZSgpO1xuKGdsb2JhbFRoaXMgYXMgdW5rbm93biBhcyB7IGxvY2FsU3RvcmFnZTogTWVtb3J5U3RvcmFnZSB9KS5sb2NhbFN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2VNb2NrO1xuXG50ZXN0KCdhbmFseXNpcyBzYWZldHkgaWdub3JlcyBzdGFsZSByZXF1ZXN0cyBhbmQgc3RhbGUgZGVsYXllZCBtb3ZlcycsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBjYW5BcHBseUFuYWx5emVkTW92ZSwgaXNTdGFsZUFuYWx5c2lzUmVxdWVzdCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2FuYWx5c2lzU2FmZXR5Jyk7XG5cbiAgYXNzZXJ0LmVxdWFsKGlzU3RhbGVBbmFseXNpc1JlcXVlc3QoMSwgMiksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoaXNTdGFsZUFuYWx5c2lzUmVxdWVzdCg0LCA0KSwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoY2FuQXBwbHlBbmFseXplZE1vdmUoJ2Zlbi1hJywgJ2Zlbi1iJyksIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGNhbkFwcGx5QW5hbHl6ZWRNb3ZlKCdmZW4tYScsICdmZW4tYScpLCB0cnVlKTtcbn0pO1xuXG50ZXN0KCdhbmFseXNpcyBjYWNoZSBrZXksIHRyaW1taW5nLCBhbmQgaW52YWxpZGF0aW9uIGJlaGF2ZSBjb3JyZWN0bHknLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgQW5hbHlzaXNDYWNoZSwgYnVpbGRBbmFseXNpc0NhY2hlS2V5IH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvYW5hbHlzaXNDYWNoZScpO1xuXG4gIGFzc2VydC5lcXVhbChcbiAgICBidWlsZEFuYWx5c2lzQ2FjaGVLZXkoJ2ZlbicsIDgsIDEyKSxcbiAgICAnZmVufGRlcHRoOjh8bXVsdGlwdjoxMicsXG4gICk7XG5cbiAgY29uc3QgY2FjaGUgPSBuZXcgQW5hbHlzaXNDYWNoZSgyKTtcbiAgY2FjaGUuc2V0KHsga2V5OiAnYScsIG1vdmVzOiBbXSwgdGltZXN0YW1wOiAxIH0pO1xuICBjYWNoZS5zZXQoeyBrZXk6ICdiJywgbW92ZXM6IFtdLCB0aW1lc3RhbXA6IDIgfSk7XG4gIGNhY2hlLnNldCh7IGtleTogJ2MnLCBtb3ZlczogW10sIHRpbWVzdGFtcDogMyB9KTtcblxuICBhc3NlcnQuZXF1YWwoY2FjaGUuc2l6ZSwgMik7XG4gIGFzc2VydC5lcXVhbChjYWNoZS5nZXQoJ2EnKSwgbnVsbCk7XG4gIGFzc2VydC5ub3RFcXVhbChjYWNoZS5nZXQoJ2InKSwgbnVsbCk7XG4gIGFzc2VydC5ub3RFcXVhbChjYWNoZS5nZXQoJ2MnKSwgbnVsbCk7XG5cbiAgY2FjaGUuaW52YWxpZGF0ZSgnYicpO1xuICBhc3NlcnQuZXF1YWwoY2FjaGUuZ2V0KCdiJyksIG51bGwpO1xuXG4gIGNhY2hlLmludmFsaWRhdGUoKTtcbiAgYXNzZXJ0LmVxdWFsKGNhY2hlLnNpemUsIDApO1xufSk7XG5cbnRlc3QoJ2RldGVybWluaXN0aWMgUk5HIGNoYW5nZXMgc3RyZWFtIHdoZW4gRkVOIGNoYW5nZXMgYXQgdGhlIHNhbWUgbW92ZSBudW1iZXInLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgYnVpbGREZXRlcm1pbmlzdGljU2VlZCwgY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvcmFuZG9tJyk7XG5cbiAgY29uc3Qgc2VlZEEgPSBidWlsZERldGVybWluaXN0aWNTZWVkKHtcbiAgICBnYW1lU3RhcnRGZW46ICdzdGFydC1mZW4nLFxuICAgIGN1cnJlbnRGZW46ICdmZW4tYScsXG4gICAgbW92ZUNvdW50OiAxMixcbiAgICBzaWRlVG9Nb3ZlOiAndycsXG4gICAgcGVyc29uYTogJ21lZGl1bScsXG4gIH0pO1xuICBjb25zdCBzZWVkQiA9IGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQoe1xuICAgIGdhbWVTdGFydEZlbjogJ3N0YXJ0LWZlbicsXG4gICAgY3VycmVudEZlbjogJ2Zlbi1iJyxcbiAgICBtb3ZlQ291bnQ6IDEyLFxuICAgIHNpZGVUb01vdmU6ICd3JyxcbiAgICBwZXJzb25hOiAnbWVkaXVtJyxcbiAgfSk7XG5cbiAgY29uc3Qgcm5nQSA9IGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZShzZWVkQSk7XG4gIGNvbnN0IHJuZ0IgPSBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2Uoc2VlZEIpO1xuXG4gIGFzc2VydC5ub3RFcXVhbChybmdBLm5leHQoKSwgcm5nQi5uZXh0KCkpO1xufSk7XG5cbnRlc3QoJ1BHTiBjdXN0b20gc3RhcnQgRkVOIGlzIHJlc3BlY3RlZCcsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyByZXNvbHZlUGduU3RhcnRGZW4gfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9nYW1lU2Vzc2lvbicpO1xuXG4gIGNvbnN0IGZlbiA9IHJlc29sdmVQZ25TdGFydEZlbihcbiAgICB7XG4gICAgICBTZXRVcDogJzEnLFxuICAgICAgRkVOOiAnOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyxcbiAgICB9LFxuICAgICdmYWxsYmFjaycsXG4gICk7XG5cbiAgYXNzZXJ0LmVxdWFsKGZlbiwgJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScpO1xufSk7XG5cbnRlc3QoJ2JyaWxsaWFudCB1c2FnZSBkZXJpdmVzIGZyb20gbW92ZSBoaXN0b3J5IG1ldGFkYXRhJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IGRlcml2ZUJyaWxsaWFudFVzYWdlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvYnJpbGxpYW50VHJhY2tpbmcnKTtcblxuICBjb25zdCB1c2FnZSA9IGRlcml2ZUJyaWxsaWFudFVzYWdlKFtcbiAgICB7XG4gICAgICBiZWZvcmVGZW46ICdhJyxcbiAgICAgIGFmdGVyRmVuOiAnYicsXG4gICAgICB1Y2k6ICdlMmU0JyxcbiAgICAgIG1vdmVOdW1iZXI6IDEsXG4gICAgICBjb25zdW1lZEJyaWxsaWFudDogZmFsc2UsXG4gICAgfSxcbiAgICB7XG4gICAgICBiZWZvcmVGZW46ICdiJyxcbiAgICAgIGFmdGVyRmVuOiAnYycsXG4gICAgICB1Y2k6ICdlN2U1JyxcbiAgICAgIG1vdmVOdW1iZXI6IDEsXG4gICAgICBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSxcbiAgICB9LFxuICBdKTtcblxuICBhc3NlcnQuZGVlcEVxdWFsKHVzYWdlLCB7XG4gICAgYnJpbGxpYW50VXNlZENvdW50OiAxLFxuICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBbMV0sXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2JyaWxsaWFudCBidWRnZXQgaXMgY29uc3VtZWQgb25seSBhZnRlciBhIHN1Y2Nlc3NmdWwgZW5naW5lIG1vdmUgYW5kIHJvbGxzIGJhY2sgb24gdW5kby9yZWRvJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0JywgdHJ1ZSk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldEJyaWxsaWFudE1vdmVzUGVyR2FtZSgyKTtcblxuICBjb25zdCBpbnZhbGlkTW92ZSA9IGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdhMWExJywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKGludmFsaWRNb3ZlLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuXG4gIGNvbnN0IHN1Y2Nlc3NmdWxNb3ZlID0gYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2UyZTQnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoc3VjY2Vzc2Z1bE1vdmUsIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3ZlTnVtYmVycywgWzFdKTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwudW5kb1NpbmdsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG4gIGFzc2VydC5kZWVwRXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZU51bWJlcnMsIFtdKTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwucmVkb1NpbmdsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZU51bWJlcnMsIFsxXSk7XG59KTtcblxudGVzdCgnbmV3IEZFTiwgUEdOLCBhbmQgb3BlbmluZyBsb2FkcyByZXNldCBicmlsbGlhbnQgc3RhdGUgYW5kIFBHTiBzdGFydCBGRU4gdXBkYXRlcyBnYW1lIHN0YXJ0JywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBQUkVERUZJTkVEX09QRU5JTkdTIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvb3BlbmluZ3MnKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0JywgdHJ1ZSk7XG4gIGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdlMmU0JywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG5cbiAgYm9hcmRWaWV3TW9kZWwubG9hZEZlbignOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuXG4gIGJvYXJkVmlld01vZGVsLmxvYWRQZ24oJ1tTZXRVcCBcIjFcIl1cXG5bRkVOIFwiOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxXCJdXFxuXFxuMS4gS2EyIConKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmdhbWVTdGFydEZlbiwgJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcblxuICBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnaDFoMicsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuXG4gIGJvYXJkVmlld01vZGVsLmxvYWRQZ24oUFJFREVGSU5FRF9PUEVOSU5HU1swXS5wZ24pO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcbn0pO1xuXG50ZXN0KCdzb2x2ZU5leHRNb3ZlIGRyb3BzIHN0YWxlIGRlbGF5ZWQgYXV0b3BsYXkgbW92ZXMgc2FmZWx5JywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCwgZW5naW5lVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCwgY29uZmlnVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlSHVtYW5EZWxheVNpbXVsYXRpb24nLCB0cnVlKTtcbiAgY29uZmlnVmlld01vZGVsLmFwcGx5UHJlc2V0KCdtZWRpdW0nKTtcblxuICBjb25zdCBvcmlnaW5hbEluaXRpYWxpemUgPSBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZS5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHl6ZVBvc2l0aW9uID0gZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbi5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG4gIGNvbnN0IG9yaWdpbmFsUGlja01vdmUgPSBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMuYmluZChlbmdpbmVWaWV3TW9kZWwpO1xuXG4gIGxldCByZWxlYXNlRGVsYXk6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuXG4gIGVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUgPSBhc3luYyAoKSA9PiB1bmRlZmluZWQ7XG4gIGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoZmVuOiBzdHJpbmcpID0+ICh7XG4gICAgcmVxdWVzdElkOiAxLFxuICAgIGFuYWx5emVkRmVuOiBmZW4sXG4gICAgbW92ZXM6IFtcbiAgICAgIHtcbiAgICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgICBldmFsdWF0aW9uOiAzMCxcbiAgICAgICAgZXZhbExvc3M6IDAsXG4gICAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgICAgbXVsdGlwdjogMSxcbiAgICAgICAgZGVwdGg6IDgsXG4gICAgICAgIGJ1Y2tldDogJ2Jlc3QnLFxuICAgICAgfSxcbiAgICBdLFxuICAgIGNvbXBsZXhpdHk6IHtcbiAgICAgIGxldmVsOiAnbWVkaXVtJyxcbiAgICAgIHNjb3JlOiAwLjUsXG4gICAgICBzcHJlYWQ6IDMwLFxuICAgICAgY2xvc2VDYW5kaWRhdGVzOiAyLFxuICAgICAgdm9sYXRpbGl0eTogMjAsXG4gICAgfSxcbiAgICBpZ25vcmVkOiBmYWxzZSxcbiAgICBmcm9tQ2FjaGU6IGZhbHNlLFxuICAgIHB1cnBvc2U6ICdlbmdpbmVNb3ZlJyxcbiAgfSk7XG4gIGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcyA9ICgpID0+ICh7XG4gICAgbW92ZToge1xuICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgZXZhbHVhdGlvbjogMzAsXG4gICAgICBldmFsTG9zczogMCxcbiAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgIG11bHRpcHY6IDEsXG4gICAgICBkZXB0aDogOCxcbiAgICAgIGJ1Y2tldDogJ2Jlc3QnLFxuICAgIH0sXG4gICAgYnVja2V0OiAnYmVzdCcsXG4gICAgaXNCcmlsbGlhbnQ6IGZhbHNlLFxuICB9KTtcblxuICAoYm9hcmRWaWV3TW9kZWwgYXMgdW5rbm93biBhcyB7IHdhaXQ6IChkZWxheU1zOiBudW1iZXIpID0+IFByb21pc2U8dm9pZD4gfSkud2FpdCA9ICgpID0+XG4gICAgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIHJlbGVhc2VEZWxheSA9IHJlc29sdmU7XG4gICAgfSk7XG5cbiAgY29uc3QgcGVuZGluZ01vdmUgPSBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlKHRydWUpO1xuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgMCk7XG4gIH0pO1xuICBib2FyZFZpZXdNb2RlbC5sb2FkRmVuKCc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnKTtcbiAgcmVsZWFzZURlbGF5Py4oKTtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGVuZGluZ01vdmU7XG5cbiAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgbnVsbCk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5mZW4sICc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnKTtcblxuICBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSA9IG9yaWdpbmFsSW5pdGlhbGl6ZTtcbiAgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbiA9IG9yaWdpbmFsQW5hbHl6ZVBvc2l0aW9uO1xuICBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMgPSBvcmlnaW5hbFBpY2tNb3ZlO1xufSk7XG5cbnRlc3QoJ2JhY2tncm91bmQgYW5hbHlzaXMgZG9lcyBub3QgY2FuY2VsIGEgdmFsaWQgcGVuZGluZyBlbmdpbmUgbW92ZSByZXF1ZXN0JywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBFbmdpbmVWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBtb3ZlU3RvY2tmaXNoU2VydmljZSwgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvc3RvY2tmaXNoLnNlcnZpY2UnKTtcbiAgY29uc3QgZW5naW5lID0gbmV3IEVuZ2luZVZpZXdNb2RlbCgpO1xuXG4gIGNvbnN0IG9yaWdpbmFsSW5pdGlhbGl6ZSA9IGVuZ2luZS5pbml0aWFsaXplLmJpbmQoZW5naW5lKTtcbiAgY29uc3Qgb3JpZ2luYWxNb3ZlQW5hbHl6ZSA9IG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbi5iaW5kKG1vdmVTdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxNb3ZlQ29uZmlndXJlID0gbW92ZVN0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlLmJpbmQobW92ZVN0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbE1vdmVTdG9wID0gbW92ZVN0b2NrZmlzaFNlcnZpY2Uuc3RvcC5iaW5kKG1vdmVTdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxBbmFseXNpc0FuYWx5emUgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uLmJpbmQoYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxBbmFseXNpc0NvbmZpZ3VyZSA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUuYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5c2lzU3RvcCA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5zdG9wLmJpbmQoYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlKTtcblxuICBsZXQgcmVsZWFzZU1vdmVBbmFseXNpczogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIGxldCBtb3ZlQW5hbHl6ZUNhbGxzID0gMDtcbiAgbGV0IGJhY2tncm91bmRBbmFseXplQ2FsbHMgPSAwO1xuXG4gIGVuZ2luZS5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgZW5naW5lLmluaXRpYWxpemUgPSBhc3luYyAoKSA9PiB1bmRlZmluZWQ7XG4gIG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9ICgpID0+IHVuZGVmaW5lZDtcbiAgbW92ZVN0b2NrZmlzaFNlcnZpY2Uuc3RvcCA9ICgpID0+IHVuZGVmaW5lZDtcbiAgbW92ZVN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gYXN5bmMgKCkgPT4ge1xuICAgIG1vdmVBbmFseXplQ2FsbHMgKz0gMTtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgcmVsZWFzZU1vdmVBbmFseXNpcyA9IHJlc29sdmU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBtb3ZlOiAnZTJlNCcsXG4gICAgICAgIGV2YWx1YXRpb246IDQyLFxuICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgcHY6IFsnZTJlNCddLFxuICAgICAgICBtdWx0aXB2OiAxLFxuICAgICAgICBkZXB0aDogMTAsXG4gICAgICB9LFxuICAgIF07XG4gIH07XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5zdG9wID0gKCkgPT4gdW5kZWZpbmVkO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gYXN5bmMgKCkgPT4ge1xuICAgIGJhY2tncm91bmRBbmFseXplQ2FsbHMgKz0gMTtcbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBtb3ZlOiAnZTJlNCcsXG4gICAgICAgIGV2YWx1YXRpb246IDQyLFxuICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgcHY6IFsnZTJlNCddLFxuICAgICAgICBtdWx0aXB2OiAxLFxuICAgICAgICBkZXB0aDogMTAsXG4gICAgICB9LFxuICAgIF07XG4gIH07XG5cbiAgY29uc3QgZW5naW5lTW92ZVByb21pc2UgPSBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tc2hhcmVkJywgMTAsIDIsICdlbmdpbmVNb3ZlJyk7XG4gIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDApKTtcbiAgY29uc3QgYmFja2dyb3VuZFByb21pc2UgPSBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tc2hhcmVkJywgMTAsIDIsICdiYWNrZ3JvdW5kJyk7XG5cbiAgcmVsZWFzZU1vdmVBbmFseXNpcz8uKCk7XG5cbiAgY29uc3QgW2VuZ2luZU1vdmVSZXN1bHQsIGJhY2tncm91bmRSZXN1bHRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW2VuZ2luZU1vdmVQcm9taXNlLCBiYWNrZ3JvdW5kUHJvbWlzZV0pO1xuXG4gIGFzc2VydC5lcXVhbChtb3ZlQW5hbHl6ZUNhbGxzLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKGJhY2tncm91bmRBbmFseXplQ2FsbHMsIDEpO1xuICBhc3NlcnQuZXF1YWwoZW5naW5lTW92ZVJlc3VsdC5pZ25vcmVkLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChiYWNrZ3JvdW5kUmVzdWx0Lmlnbm9yZWQsIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGJhY2tncm91bmRSZXN1bHQuYW5hbHl6ZWRGZW4sICdmZW4tc2hhcmVkJyk7XG5cbiAgZW5naW5lLmluaXRpYWxpemUgPSBvcmlnaW5hbEluaXRpYWxpemU7XG4gIG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IG9yaWdpbmFsTW92ZUFuYWx5emU7XG4gIG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9IG9yaWdpbmFsTW92ZUNvbmZpZ3VyZTtcbiAgbW92ZVN0b2NrZmlzaFNlcnZpY2Uuc3RvcCA9IG9yaWdpbmFsTW92ZVN0b3A7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBvcmlnaW5hbEFuYWx5c2lzQW5hbHl6ZTtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9IG9yaWdpbmFsQW5hbHlzaXNDb25maWd1cmU7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5zdG9wID0gb3JpZ2luYWxBbmFseXNpc1N0b3A7XG59KTtcblxudGVzdCgnZW5naW5lIHJlc2V0IGNsZWFycyBpbi1mbGlnaHQgYW5hbHlzaXMgc3RhdGUgc28gbmV3IHJlcXVlc3RzIGFyZSBub3QgYmxvY2tlZCcsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgRW5naW5lVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG4gIGNvbnN0IHsgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvc3RvY2tmaXNoLnNlcnZpY2UnKTtcbiAgY29uc3QgZW5naW5lID0gbmV3IEVuZ2luZVZpZXdNb2RlbCgpO1xuXG4gIGNvbnN0IG9yaWdpbmFsSW5pdGlhbGl6ZSA9IGVuZ2luZS5pbml0aWFsaXplLmJpbmQoZW5naW5lKTtcbiAgY29uc3Qgb3JpZ2luYWxBbmFseXplID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbi5iaW5kKGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsQ29uZmlndXJlID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZS5iaW5kKGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsU3RvcCA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5zdG9wLmJpbmQoYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlKTtcblxuICBsZXQgcmVzb2x2ZUZpcnN0QW5hbHlzaXM6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBsZXQgYW5hbHl6ZUNhbGxDb3VudCA9IDA7XG5cbiAgZW5naW5lLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IGFzeW5jICgpID0+IHVuZGVmaW5lZDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9ICgpID0+IHVuZGVmaW5lZDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgYW5hbHl6ZUNhbGxDb3VudCArPSAxO1xuXG4gICAgaWYgKGFuYWx5emVDYWxsQ291bnQgPT09IDEpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICByZXNvbHZlRmlyc3RBbmFseXNpcyA9ICgpID0+IHtcbiAgICAgICAgICByZXNvbHZlKFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgICAgICAgICBldmFsdWF0aW9uOiAxMixcbiAgICAgICAgICAgICAgZXZhbExvc3M6IDAsXG4gICAgICAgICAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgICAgICAgICAgbXVsdGlwdjogMSxcbiAgICAgICAgICAgICAgZGVwdGg6IDgsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0pO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbW92ZTogJ2QyZDQnLFxuICAgICAgICBldmFsdWF0aW9uOiAxOCxcbiAgICAgICAgZXZhbExvc3M6IDAsXG4gICAgICAgIHB2OiBbJ2QyZDQnXSxcbiAgICAgICAgbXVsdGlwdjogMSxcbiAgICAgICAgZGVwdGg6IDgsXG4gICAgICB9LFxuICAgIF07XG4gIH07XG5cbiAgY29uc3Qgc3RhbGVBbmFseXNpc1Byb21pc2UgPSBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tb2xkJywgOCwgMiwgJ2JhY2tncm91bmQnKTtcbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMCkpO1xuXG4gIGVuZ2luZS5yZXNldCgpO1xuICBhc3NlcnQuZXF1YWwoZW5naW5lLmlzQW5hbHl6aW5nLCBmYWxzZSk7XG5cbiAgY29uc3QgZnJlc2hBbmFseXNpc1Byb21pc2UgPSBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tbmV3JywgOCwgMiwgJ2JhY2tncm91bmQnKTtcbiAgcmVzb2x2ZUZpcnN0QW5hbHlzaXM/LigpO1xuXG4gIGNvbnN0IGZyZXNoUmVzdWx0ID0gYXdhaXQgZnJlc2hBbmFseXNpc1Byb21pc2U7XG4gIGNvbnN0IHN0YWxlUmVzdWx0ID0gYXdhaXQgc3RhbGVBbmFseXNpc1Byb21pc2U7XG5cbiAgYXNzZXJ0LmVxdWFsKGFuYWx5emVDYWxsQ291bnQsIDIpO1xuICBhc3NlcnQuZXF1YWwoZnJlc2hSZXN1bHQuYW5hbHl6ZWRGZW4sICdmZW4tbmV3Jyk7XG4gIGFzc2VydC5lcXVhbChzdGFsZVJlc3VsdC5pZ25vcmVkLCB0cnVlKTtcblxuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IG9yaWdpbmFsSW5pdGlhbGl6ZTtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IG9yaWdpbmFsQW5hbHl6ZTtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9IG9yaWdpbmFsQ29uZmlndXJlO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2Uuc3RvcCA9IG9yaWdpbmFsU3RvcDtcbn0pO1xuXG50ZXN0KCdyZXN0b3JlZCBtb3ZlIGFubm90YXRpb25zIHByZXNlcnZlIGJyaWxsaWFudCB1bmRvL3JlZG8gdHJhY2tpbmcgYWZ0ZXIgcmVzdGFydCcsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgQm9hcmRWaWV3TW9kZWwsIGJvYXJkVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3BlcnNpc3RFbmdpbmVDb25maWcnLCB0cnVlKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0JywgdHJ1ZSk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldEJyaWxsaWFudE1vdmVzUGVyR2FtZSgyKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBjb25zdCBtb3ZlQXBwbGllZCA9IGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdlMmU0JywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKG1vdmVBcHBsaWVkLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLnVuZG9TaW5nbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuY2FuUmVkbywgdHJ1ZSk7XG5cbiAgY29uc3QgcmVzdG9yZWRCb2FyZCA9IG5ldyBCb2FyZFZpZXdNb2RlbCgpO1xuICBhc3NlcnQuZXF1YWwocmVzdG9yZWRCb2FyZC5jYW5SZWRvLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG5cbiAgYXNzZXJ0LmVxdWFsKHJlc3RvcmVkQm9hcmQucmVkb1NpbmdsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZU51bWJlcnMsIFsxXSk7XG5cbiAgYXNzZXJ0LmVxdWFsKHJlc3RvcmVkQm9hcmQudW5kb1NpbmdsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG59KTtcblxudGVzdCgnbmV3IGdhbWUgY2xlYXJzIHN0YWxlIGJvYXJkIHRyYW5zaWVudCBzdGF0ZSBhbmQgYWxsb3dzIGJsYWNrIGF1dG9wbGF5IHR1cm4gZmxvdyBhZ2FpbicsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBib2FyZFZpZXdNb2RlbC5pc1RoaW5raW5nID0gdHJ1ZTtcbiAgYm9hcmRWaWV3TW9kZWwuaXNBbmFseXppbmdNb3ZlcyA9IHRydWU7XG4gIGJvYXJkVmlld01vZGVsLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eSA9ICdnb29kJztcbiAgYm9hcmRWaWV3TW9kZWwuc2V0QXV0b1BsYXkodHJ1ZSk7XG4gIGJvYXJkVmlld01vZGVsLnNldEVuZ2luZVBsYXlzRm9yKCdiJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuaXNUaGlua2luZywgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuaXNBbmFseXppbmdNb3ZlcywgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwubGFzdFBsYXllck1vdmVRdWFsaXR5LCBudWxsKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmNhblN0YXJ0QXV0b1BsYXlUdXJuLCBmYWxzZSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlKCdlMicsICdlNCcpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmNhblN0YXJ0QXV0b1BsYXlUdXJuLCB0cnVlKTtcbn0pO1xuXG50ZXN0KCdjYWNoZS1oaXQgaW5kaWNhdG9yIHJlZmxlY3RzIHdoZXRoZXIgYW5hbHlzaXMgY2FtZSBmcm9tIGNhY2hlJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBFbmdpbmVWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG4gIGNvbnN0IHsgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvc3RvY2tmaXNoLnNlcnZpY2UnKTtcbiAgY29uc3QgeyBhbmFseXNpc0NhY2hlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvYW5hbHlzaXNDYWNoZScpO1xuICBjb25zdCBlbmdpbmUgPSBuZXcgRW5naW5lVmlld01vZGVsKCk7XG5cbiAgY29uc3Qgb3JpZ2luYWxJbml0aWFsaXplID0gZW5naW5lLmluaXRpYWxpemUuYmluZChlbmdpbmUpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5emUgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uLmJpbmQoYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxDb25maWd1cmUgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlLmJpbmQoYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlKTtcblxuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VNb3ZlQW5hbHlzaXNDYWNoZScsIHRydWUpO1xuICBhbmFseXNpc0NhY2hlLmludmFsaWRhdGUoKTtcblxuICBlbmdpbmUuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gIGVuZ2luZS5pbml0aWFsaXplID0gYXN5bmMgKCkgPT4gdW5kZWZpbmVkO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gKCkgPT4gdW5kZWZpbmVkO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gYXN5bmMgKCkgPT4gW1xuICAgIHtcbiAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgIGV2YWx1YXRpb246IDM1LFxuICAgICAgZXZhbExvc3M6IDAsXG4gICAgICBwdjogWydlMmU0J10sXG4gICAgICBtdWx0aXB2OiAxLFxuICAgICAgZGVwdGg6IDEyLFxuICAgIH0sXG4gIF07XG5cbiAgY29uc3QgZmlyc3QgPSBhd2FpdCBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tY2FjaGUnLCAxMiwgMiwgJ2JhY2tncm91bmQnKTtcbiAgY29uc3Qgc2Vjb25kID0gYXdhaXQgZW5naW5lLmFuYWx5emVQb3NpdGlvbignZmVuLWNhY2hlJywgMTIsIDIsICdiYWNrZ3JvdW5kJyk7XG5cbiAgYXNzZXJ0LmVxdWFsKGZpcnN0LmZyb21DYWNoZSwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoc2Vjb25kLmZyb21DYWNoZSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChlbmdpbmUubGFzdEFuYWx5c2lzRnJvbUNhY2hlLCB0cnVlKTtcblxuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IG9yaWdpbmFsSW5pdGlhbGl6ZTtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IG9yaWdpbmFsQW5hbHl6ZTtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9IG9yaWdpbmFsQ29uZmlndXJlO1xufSk7XG5cbnRlc3QoJ3BlcnNvbmEgcHJvZmlsZXMgc2F2ZSBhbmQgbG9hZCB0aGUgY3VycmVudCBjb25maWd1cmF0aW9uIHNuYXBzaG90JywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBERUZBVUxUX0JVQ0tFVF9DT05GSUcgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS90eXBlcycpO1xuICBjb25zdCB7IERFRkFVTFRfRkVBVFVSRV9PUFRJT05TIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvZmVhdHVyZU9wdGlvbnMnKTtcblxuICBsZXQgYXBwbGllZENvbmZpZzogdW5rbm93biA9IG51bGw7XG4gIGxldCBhcHBsaWVkRmVhdHVyZU9wdGlvbnM6IHVua25vd24gPSBudWxsO1xuICBsZXQgYXBwbGllZEJyaWxsaWFudFNldHRpbmdzOiB1bmtub3duID0gbnVsbDtcbiAgbGV0IGFwcGxpZWRVaTogdW5rbm93biA9IG51bGw7XG5cbiAgY29uc3QgcHJvZmlsZXMgPSBuZXcgUGVyc29uYVByb2ZpbGVzVmlld01vZGVsKHtcbiAgICBjb25maWdWaWV3TW9kZWw6IHtcbiAgICAgIGJ1Y2tldENvbmZpZzoge1xuICAgICAgICAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gICAgICAgIGJlc3Q6IDI4LFxuICAgICAgICBncmVhdDogMjIsXG4gICAgICB9LFxuICAgICAgY3VycmVudFByZXNldElkOiAnYWdncmVzc2l2ZScsXG4gICAgICBkZXB0aDogMTMsXG4gICAgICBtdWx0aVBWOiA3LFxuICAgICAgYXBwbHlQcm9maWxlU25hcHNob3Q6IChzbmFwc2hvdCkgPT4ge1xuICAgICAgICBhcHBsaWVkQ29uZmlnID0gc25hcHNob3Q7XG4gICAgICB9LFxuICAgIH0sXG4gICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWw6IHtcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gICAgICAgIHVzZURldGVybWluaXN0aWNSbmc6IHRydWUsXG4gICAgICAgIHVzZU1vdmVBbmFseXNpc0NhY2hlOiBmYWxzZSxcbiAgICAgICAgdXNlQnJpbGxpYW50TW92ZUJ1ZGdldDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IDMsXG4gICAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6ICdtaWRkbGVnYW1lJyxcbiAgICAgIGFwcGx5UHJvZmlsZVNldHRpbmdzOiAob3B0aW9ucywgYnJpbGxpYW50KSA9PiB7XG4gICAgICAgIGFwcGxpZWRGZWF0dXJlT3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIGFwcGxpZWRCcmlsbGlhbnRTZXR0aW5ncyA9IGJyaWxsaWFudDtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB1aVN0YXRlVmlld01vZGVsOiB7XG4gICAgICB0aGVtZU1vZGU6ICdwZXJzb25hJyxcbiAgICAgIGJhc2ljTW9kZTogZmFsc2UsXG4gICAgICBhcHBseVByb2ZpbGVQcmVmZXJlbmNlczogKHByZWZlcmVuY2VzKSA9PiB7XG4gICAgICAgIGFwcGxpZWRVaSA9IHByZWZlcmVuY2VzO1xuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICBwcm9maWxlcy5zZXRQcm9maWxlTmFtZURyYWZ0KCdTaGFycCBUYWN0aWNpYW4nKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnNhdmVDdXJyZW50UHJvZmlsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzLmxlbmd0aCwgMSk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8ubmFtZSwgJ1NoYXJwIFRhY3RpY2lhbicpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLmRlcHRoLCAxMyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8uc2V0dGluZ3MuZmVhdHVyZU9wdGlvbnMudXNlRGV0ZXJtaW5pc3RpY1JuZywgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8uc2V0dGluZ3MuYnJpbGxpYW50LmJyaWxsaWFudE1vdmVzUGVyR2FtZSwgMyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8uc2V0dGluZ3MudWkudGhlbWVNb2RlLCAncGVyc29uYScpO1xuXG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5sb2FkU2VsZWN0ZWRQcm9maWxlKCksIHRydWUpO1xuICBhc3NlcnQuZGVlcEVxdWFsKGFwcGxpZWRDb25maWcsIHtcbiAgICBidWNrZXRDb25maWc6IHtcbiAgICAgIC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgICAgIGJlc3Q6IDI4LFxuICAgICAgZ3JlYXQ6IDIyLFxuICAgIH0sXG4gICAgY3VycmVudFByZXNldElkOiAnYWdncmVzc2l2ZScsXG4gICAgZGVwdGg6IDEzLFxuICAgIG11bHRpUFY6IDcsXG4gIH0pO1xuICBhc3NlcnQuZGVlcEVxdWFsKGFwcGxpZWRGZWF0dXJlT3B0aW9ucywge1xuICAgIC4uLkRFRkFVTFRfRkVBVFVSRV9PUFRJT05TLFxuICAgIHVzZURldGVybWluaXN0aWNSbmc6IHRydWUsXG4gICAgdXNlTW92ZUFuYWx5c2lzQ2FjaGU6IGZhbHNlLFxuICAgIHVzZUJyaWxsaWFudE1vdmVCdWRnZXQ6IHRydWUsXG4gIH0pO1xuICBhc3NlcnQuZGVlcEVxdWFsKGFwcGxpZWRCcmlsbGlhbnRTZXR0aW5ncywge1xuICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMyxcbiAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6ICdtaWRkbGVnYW1lJyxcbiAgfSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoYXBwbGllZFVpLCB7XG4gICAgdGhlbWVNb2RlOiAncGVyc29uYScsXG4gICAgYmFzaWNNb2RlOiBmYWxzZSxcbiAgfSk7XG59KTtcblxudGVzdCgncGVyc29uYSBwcm9maWxlIGltcG9ydCB2YWxpZGF0ZXMgSlNPTiBzYWZlbHkgYW5kIGRlZHVwbGljYXRlcyBuYW1lcycsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgUGVyc29uYVByb2ZpbGVzVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG4gIGNvbnN0IHsgREVGQVVMVF9CVUNLRVRfQ09ORklHIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvdHlwZXMnKTtcbiAgY29uc3QgeyBERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2ZlYXR1cmVPcHRpb25zJyk7XG5cbiAgY29uc3QgcHJvZmlsZXMgPSBuZXcgUGVyc29uYVByb2ZpbGVzVmlld01vZGVsKHtcbiAgICBjb25maWdWaWV3TW9kZWw6IHtcbiAgICAgIGJ1Y2tldENvbmZpZzogeyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcgfSxcbiAgICAgIGN1cnJlbnRQcmVzZXRJZDogJ21lZGl1bScsXG4gICAgICBkZXB0aDogOCxcbiAgICAgIG11bHRpUFY6IDEyLFxuICAgICAgYXBwbHlQcm9maWxlU25hcHNob3Q6ICgpID0+IHVuZGVmaW5lZCxcbiAgICB9LFxuICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsOiB7XG4gICAgICBvcHRpb25zOiB7IC4uLkRFRkFVTFRfRkVBVFVSRV9PUFRJT05TIH0sXG4gICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IDAsXG4gICAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6ICdhbnknLFxuICAgICAgYXBwbHlQcm9maWxlU2V0dGluZ3M6ICgpID0+IHVuZGVmaW5lZCxcbiAgICB9LFxuICAgIHVpU3RhdGVWaWV3TW9kZWw6IHtcbiAgICAgIHRoZW1lTW9kZTogJ2RhcmsnLFxuICAgICAgYmFzaWNNb2RlOiB0cnVlLFxuICAgICAgYXBwbHlQcm9maWxlUHJlZmVyZW5jZXM6ICgpID0+IHVuZGVmaW5lZCxcbiAgICB9LFxuICB9KTtcblxuICBwcm9maWxlcy5zZXRQcm9maWxlTmFtZURyYWZ0KCdCYWxhbmNlZCcpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMuc2F2ZUN1cnJlbnRQcm9maWxlKCksIHRydWUpO1xuXG4gIHByb2ZpbGVzLnNldEV4Y2hhbmdlSnNvbigne2JhZCBqc29uJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5pbXBvcnRQcm9maWxlRnJvbUpzb24oKSwgZmFsc2UpO1xuICBhc3NlcnQubWF0Y2gocHJvZmlsZXMuaW1wb3J0RXJyb3IsIC9jb3VsZCBub3QgYmUgcGFyc2VkL2kpO1xuXG4gIHByb2ZpbGVzLnNldEV4Y2hhbmdlSnNvbihcbiAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBraW5kOiAncGVyc29uYWNoZXNzLnBlcnNvbmEtcHJvZmlsZScsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAgbmFtZTogJ0JhbGFuY2VkJyxcbiAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgIGJ1Y2tldENvbmZpZzogREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICAgICAgICBjdXJyZW50UHJlc2V0SWQ6ICdoYXJkJyxcbiAgICAgICAgZGVwdGg6IDE1LFxuICAgICAgICBtdWx0aVBWOiA0LFxuICAgICAgICBmZWF0dXJlT3B0aW9uczoge1xuICAgICAgICAgIC4uLkRFRkFVTFRfRkVBVFVSRV9PUFRJT05TLFxuICAgICAgICAgIHVzZURldGVybWluaXN0aWNSbmc6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGJyaWxsaWFudDoge1xuICAgICAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMixcbiAgICAgICAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6ICdlbmRnYW1lJyxcbiAgICAgICAgfSxcbiAgICAgICAgdWk6IHtcbiAgICAgICAgICB0aGVtZU1vZGU6ICdsaWdodCcsXG4gICAgICAgICAgYmFzaWNNb2RlOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSksXG4gICk7XG5cbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLmltcG9ydFByb2ZpbGVGcm9tSnNvbigpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzLmxlbmd0aCwgMik7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8ubmFtZSwgJ0JhbGFuY2VkIDInKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy5jdXJyZW50UHJlc2V0SWQsICdoYXJkJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8uc2V0dGluZ3MudWkudGhlbWVNb2RlLCAnbGlnaHQnKTtcbn0pO1xuXG50ZXN0KCdnYW1lIHNldHVwIHByZXNldHMgcmVtYWluIHNlYXJjaGFibGUgYW5kIGNvbXBhdGlibGUgd2l0aCB0aGUgZXhpc3Rpbmcgb3BlbmluZyBsaWJyYXJ5JywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IFBSRURFRklORURfT1BFTklOR1MgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9vcGVuaW5ncycpO1xuICBjb25zdCB7XG4gICAgR0FNRV9TRVRVUF9QUkVTRVRTLFxuICAgIGZpbHRlckdhbWVTZXR1cFByZXNldHMsXG4gICAgdG9Db21wYXRpYmxlT3BlbmluZ1ByZXNldCxcbiAgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9nYW1lU2V0dXBQcmVzZXRzJyk7XG5cbiAgYXNzZXJ0Lm9rKEdBTUVfU0VUVVBfUFJFU0VUUy5sZW5ndGggPj0gUFJFREVGSU5FRF9PUEVOSU5HUy5sZW5ndGgpO1xuXG4gIGNvbnN0IGZpbHRlcmVkID0gZmlsdGVyR2FtZVNldHVwUHJlc2V0cyhHQU1FX1NFVFVQX1BSRVNFVFMsICdvcGVuaW5ncycsICdzaWNpbGlhbicpO1xuICBhc3NlcnQuZXF1YWwoZmlsdGVyZWQubGVuZ3RoLCAxKTtcbiAgYXNzZXJ0Lm1hdGNoKGZpbHRlcmVkWzBdPy5uYW1lID8/ICcnLCAvc2ljaWxpYW4vaSk7XG5cbiAgY29uc3Qgb3BlbmluZ1ByZXNldCA9IHRvQ29tcGF0aWJsZU9wZW5pbmdQcmVzZXQoUFJFREVGSU5FRF9PUEVOSU5HU1swXT8uaWQgPz8gJycpO1xuICBhc3NlcnQuZXF1YWwob3BlbmluZ1ByZXNldD8uc291cmNlVHlwZSwgJ3BnbicpO1xuICBhc3NlcnQuZXF1YWwob3BlbmluZ1ByZXNldD8uc291cmNlLCBQUkVERUZJTkVEX09QRU5JTkdTWzBdPy5wZ24pO1xufSk7XG5cbnRlc3QoJ2xvYWRpbmcgYSBnYW1lIHNldHVwIHByZXNldCByZXNldHMgc2Vzc2lvbiBzdGF0ZSBhbmQgYnJpbGxpYW50IHRyYWNraW5nJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBnZXRHYW1lU2V0dXBQcmVzZXRCeUlkIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvZ2FtZVNldHVwUHJlc2V0cycpO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZUJyaWxsaWFudE1vdmVCdWRnZXQnLCB0cnVlKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lKDIpO1xuXG4gIGNvbnN0IGJhc2VsaW5lU2Vzc2lvbklkID0gYm9hcmRWaWV3TW9kZWwuZGVidWdTZXNzaW9uSWQ7XG4gIGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdlMmU0JywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG5cbiAgY29uc3QgcHJlc2V0ID0gZ2V0R2FtZVNldHVwUHJlc2V0QnlJZCgnaXRhbGlhbicpO1xuICBhc3NlcnQub2socHJlc2V0KTtcbiAgaWYgKCFwcmVzZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGl0YWxpYW4gcHJlc2V0IHRvIGV4aXN0Jyk7XG4gIH1cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmxvYWRHYW1lU2V0dXBQcmVzZXQocHJlc2V0KSwgdHJ1ZSk7XG4gIGFzc2VydC5ub3RFcXVhbChib2FyZFZpZXdNb2RlbC5kZWJ1Z1Nlc3Npb25JZCwgYmFzZWxpbmVTZXNzaW9uSWQpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcbiAgYXNzZXJ0Lm1hdGNoKGJvYXJkVmlld01vZGVsLnN0YXR1c01lc3NhZ2UsIC9pdGFsaWFuL2kpO1xufSk7XG5cbnRlc3QoJ2dhbWUgYW5hbHl0aWNzIHN1bW1hcnkgYWdncmVnYXRlcyBxdWFsaXR5LCB0aW1pbmcsIGNvbXBsZXhpdHksIGFuZCBoaWdobGlnaHRzJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IGJ1aWxkR2FtZUFuYWx5dGljc1N1bW1hcnkgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9nYW1lQW5hbHl0aWNzJyk7XG5cbiAgY29uc3Qgc3VtbWFyeSA9IGJ1aWxkR2FtZUFuYWx5dGljc1N1bW1hcnkoe1xuICAgIHNlc3Npb25JZDogJ3Nlc3Npb25fdGVzdCcsXG4gICAgY3JlYXRlZEF0TXM6IDEwMDAsXG4gICAgZmluaXNoZWRBdE1zOiA5MDAwLFxuICAgIGdhbWVTdGF0dXM6ICdDaGVja21hdGUhIFdoaXRlIHdpbnMnLFxuICAgIHBlcnNvbmFJZDogJ2FnZ3Jlc3NpdmUnLFxuICAgIHBlcnNvbmFMYWJlbDogJ0FnZ3Jlc3NpdmUnLFxuICAgIHNldHVwTmFtZTogJ0l0YWxpYW4gR2FtZScsXG4gICAgc2V0dXBDYXRlZ29yeTogJ29wZW5pbmdzJyxcbiAgICBhdXRvcGxheUR1cmF0aW9uTXM6IDI2MDAsXG4gICAgcGduOiAnMS4gZTQgZTUgKicsXG4gICAgbW92ZUFubm90YXRpb25zOiBbXG4gICAgICB7XG4gICAgICAgIGJlZm9yZUZlbjogJ2EnLFxuICAgICAgICBhZnRlckZlbjogJ2InLFxuICAgICAgICB1Y2k6ICdlMmU0JyxcbiAgICAgICAgbW92ZU51bWJlcjogMSxcbiAgICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IGZhbHNlLFxuICAgICAgICBhY3RvcjogJ3BsYXllcicsXG4gICAgICAgIHNhbjogJ2U0JyxcbiAgICAgICAgYnVja2V0OiAnZ29vZCcsXG4gICAgICAgIGV2YWxMb3NzOiA0MixcbiAgICAgICAgZXZhbHVhdGlvbjogMTgsXG4gICAgICAgIGNvbXBsZXhpdHlMZXZlbDogJ21lZGl1bScsXG4gICAgICAgIGNvbXBsZXhpdHlTY29yZTogMC41LFxuICAgICAgICB0aW1lc3RhbXA6IDIwMDAsXG4gICAgICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiA3MDAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBiZWZvcmVGZW46ICdiJyxcbiAgICAgICAgYWZ0ZXJGZW46ICdjJyxcbiAgICAgICAgdWNpOiAnZTdlNScsXG4gICAgICAgIG1vdmVOdW1iZXI6IDEsXG4gICAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlLFxuICAgICAgICBhY3RvcjogJ2VuZ2luZScsXG4gICAgICAgIHNhbjogJ2U1KycsXG4gICAgICAgIGJ1Y2tldDogJ2Jlc3QnLFxuICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgZXZhbHVhdGlvbjogMzIsXG4gICAgICAgIGNvbXBsZXhpdHlMZXZlbDogJ2hpZ2gnLFxuICAgICAgICBjb21wbGV4aXR5U2NvcmU6IDAuOCxcbiAgICAgICAgdGltZXN0YW1wOiAyODAwLFxuICAgICAgICBkZWxheU1zU2luY2VQcmV2aW91czogODAwLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVmb3JlRmVuOiAnYycsXG4gICAgICAgIGFmdGVyRmVuOiAnZCcsXG4gICAgICAgIHVjaTogJ2cxZjMnLFxuICAgICAgICBtb3ZlTnVtYmVyOiAyLFxuICAgICAgICBjb25zdW1lZEJyaWxsaWFudDogZmFsc2UsXG4gICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgc2FuOiAnTmYzJyxcbiAgICAgICAgYnVja2V0OiAnbWlzdGFrZScsXG4gICAgICAgIGV2YWxMb3NzOiAzMTAsXG4gICAgICAgIGV2YWx1YXRpb246IC05MCxcbiAgICAgICAgY29tcGxleGl0eUxldmVsOiAnbG93JyxcbiAgICAgICAgY29tcGxleGl0eVNjb3JlOiAwLjIsXG4gICAgICAgIHRpbWVzdGFtcDogNDMwMCxcbiAgICAgICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IDE1MDAsXG4gICAgICB9LFxuICAgIF0sXG4gIH0pO1xuXG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LnJlc3VsdCwgJ1doaXRlIHdvbicpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5icmlsbGlhbnRNb3ZlcywgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5Lm1vdmVDb3VudCwgMyk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LnF1YWxpdHlDb3VudHMuYmVzdCwgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LnF1YWxpdHlDb3VudHMuZ29vZCwgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LnF1YWxpdHlDb3VudHMubWlzdGFrZSwgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmF2ZXJhZ2VFdmFsTG9zcywgMTE3LjMpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5hdmVyYWdlTW92ZURlbGF5TXMsIDEwMDApO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5jb21wbGV4aXR5RGlzdHJpYnV0aW9uLmxvdywgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmNvbXBsZXhpdHlEaXN0cmlidXRpb24ubWVkaXVtLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuY29tcGxleGl0eURpc3RyaWJ1dGlvbi5oaWdoLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuaGlnaGxpZ2h0ZWRCcmlsbGlhbnRNb3Zlcy5sZW5ndGgsIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5tYWpvck1pc3Rha2VzLmxlbmd0aCwgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmV2YWxUcmVuZC5sZW5ndGgsIDMpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5jb21wbGV4aXR5VHJlbmQubGVuZ3RoLCAzKTtcbn0pO1xuXG50ZXN0KCdnYW1lIGFuYWx5dGljcyB2aWV3bW9kZWwgc3RvcmVzIGNvbXBsZXRlZCBzZXNzaW9ucyBpbiByZWNlbnQgZ2FtZXMnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IEdhbWVBbmFseXRpY3NWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBjb25zdCBhbmFseXRpY3MgPSBuZXcgR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCh7XG4gICAgYm9hcmRWaWV3TW9kZWw6IHtcbiAgICAgIGRlYnVnU2Vzc2lvbklkOiAnc2Vzc2lvbl9jYXB0dXJlJyxcbiAgICAgIG1vdmVBbm5vdGF0aW9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgYmVmb3JlRmVuOiAnYScsXG4gICAgICAgICAgYWZ0ZXJGZW46ICdiJyxcbiAgICAgICAgICB1Y2k6ICdlMmU0JyxcbiAgICAgICAgICBtb3ZlTnVtYmVyOiAxLFxuICAgICAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgICBhY3RvcjogJ3BsYXllcicsXG4gICAgICAgICAgc2FuOiAnZTQnLFxuICAgICAgICAgIGJ1Y2tldDogJ2dvb2QnLFxuICAgICAgICAgIGV2YWxMb3NzOiA0MCxcbiAgICAgICAgICBldmFsdWF0aW9uOiAxNSxcbiAgICAgICAgICBjb21wbGV4aXR5TGV2ZWw6ICdtZWRpdW0nLFxuICAgICAgICAgIGNvbXBsZXhpdHlTY29yZTogMC40NSxcbiAgICAgICAgICB0aW1lc3RhbXA6IDEwMDAsXG4gICAgICAgICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IDYwMCxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBzZXNzaW9uU3RhcnRlZEF0OiAwLFxuICAgICAgZ2FtZVN0YXR1czogJ0RyYXchJyxcbiAgICAgIHBnbjogJzEuIGU0IConLFxuICAgICAgY3VycmVudFNldHVwTmFtZTogJ0N1c3RvbSBQb3NpdGlvbicsXG4gICAgICBjdXJyZW50U2V0dXBDYXRlZ29yeTogJ2N1c3RvbScsXG4gICAgICBhdXRvUGxheUFjdGl2ZUR1cmF0aW9uTXM6IDkwMCxcbiAgICAgIGlzR2FtZU92ZXI6IHRydWUsXG4gICAgfSxcbiAgICBjb25maWdWaWV3TW9kZWw6IHtcbiAgICAgIGFjdGl2ZVBlcnNvbmFJZDogJ21lZGl1bScsXG4gICAgICBhY3RpdmVQZXJzb25hTGFiZWw6ICdNZWRpdW0nLFxuICAgIH0sXG4gIH0pO1xuXG4gIGFuYWx5dGljcy5jYXB0dXJlQ29tcGxldGVkR2FtZSgpO1xuXG4gIGFzc2VydC5lcXVhbChhbmFseXRpY3MucmVjZW50R2FtZXMubGVuZ3RoLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKGFuYWx5dGljcy5yZWNlbnRHYW1lc1swXT8uc2Vzc2lvbklkLCAnc2Vzc2lvbl9jYXB0dXJlJyk7XG4gIGFzc2VydC5lcXVhbChhbmFseXRpY3MucmVjZW50R2FtZUVudHJpZXNbMF0/LnBlcnNvbmFMYWJlbCwgJ01lZGl1bScpO1xufSk7XG5cbnRlc3QoJ2F1dG9wbGF5IHNjaGVkdWxlcyBjb3JyZWN0bHkgZm9yIGEgYmxhY2sgZW5naW5lIGFmdGVyIGEgd2hpdGUgcGxheWVyIG1vdmUnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBlbmdpbmVWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBjb25zdCBvcmlnaW5hbFNvbHZlTmV4dE1vdmUgPSBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlLmJpbmQoYm9hcmRWaWV3TW9kZWwpO1xuICBsZXQgc29sdmVDYWxscyA9IDA7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0QXV0b1BsYXkodHJ1ZSk7XG4gIGJvYXJkVmlld01vZGVsLnNldEVuZ2luZVBsYXlzRm9yKCdiJyk7XG4gIGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUgPSBhc3luYyAoKSA9PiB7XG4gICAgc29sdmVDYWxscyArPSAxO1xuICAgIHJldHVybiBudWxsO1xuICB9O1xuICBlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCA9IHRydWU7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlKCdlMicsICdlNCcpLCB0cnVlKTtcbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzZXRUaW1lb3V0KHJlc29sdmUsIDkwMCk7XG4gIH0pO1xuXG4gIGFzc2VydC5lcXVhbChzb2x2ZUNhbGxzLCAxKTtcblxuICBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlID0gb3JpZ2luYWxTb2x2ZU5leHRNb3ZlO1xufSk7XG5cbnRlc3QoJ2F1dG9wbGF5IHN0aWxsIHBsYXlzIGJsYWNrIHdoZW4gcGxheWVyLW1vdmUgYmFja2dyb3VuZCBhbmFseXNpcyBpcyBwZW5kaW5nJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCwgZW5naW5lVmlld01vZGVsLCB1aVN0YXRlVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgY29uc3Qgb3JpZ2luYWxJbml0aWFsaXplID0gZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUuYmluZChlbmdpbmVWaWV3TW9kZWwpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5emVQb3NpdGlvbiA9IGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24uYmluZChlbmdpbmVWaWV3TW9kZWwpO1xuICBjb25zdCBvcmlnaW5hbFBpY2tNb3ZlID0gZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzLmJpbmQoZW5naW5lVmlld01vZGVsKTtcbiAgY29uc3Qgb3JpZ2luYWxBdXRvUGxheVNwZWVkID0gdWlTdGF0ZVZpZXdNb2RlbC5hdXRvUGxheVNwZWVkO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGJvYXJkVmlld01vZGVsLnNldEF1dG9QbGF5KHRydWUpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRFbmdpbmVQbGF5c0ZvcignYicpO1xuICB1aVN0YXRlVmlld01vZGVsLnNldEF1dG9QbGF5U3BlZWQoJ2Zhc3QnKTtcblxuICBlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gIGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplID0gYXN5bmMgKCkgPT4gdW5kZWZpbmVkO1xuICBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uID0gYXN5bmMgKGZlbjogc3RyaW5nLCBfZGVwdGg/OiBudW1iZXIsIF9tdWx0aVBWPzogbnVtYmVyLCBwdXJwb3NlID0gJ2JhY2tncm91bmQnKSA9PiB7XG4gICAgaWYgKHB1cnBvc2UgPT09ICdiYWNrZ3JvdW5kJykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCgpID0+IHVuZGVmaW5lZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlcXVlc3RJZDogMSxcbiAgICAgIGFuYWx5emVkRmVuOiBmZW4sXG4gICAgICBtb3ZlczogW1xuICAgICAgICB7XG4gICAgICAgICAgbW92ZTogJ2U3ZTUnLFxuICAgICAgICAgIGV2YWx1YXRpb246IDIwLFxuICAgICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICAgIHB2OiBbJ2U3ZTUnXSxcbiAgICAgICAgICBtdWx0aXB2OiAxLFxuICAgICAgICAgIGRlcHRoOiA4LFxuICAgICAgICAgIGJ1Y2tldDogJ2Jlc3QnLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGNvbXBsZXhpdHk6IHtcbiAgICAgICAgbGV2ZWw6ICdsb3cnLFxuICAgICAgICBzY29yZTogMC4yLFxuICAgICAgICBzcHJlYWQ6IDEyLFxuICAgICAgICBjbG9zZUNhbmRpZGF0ZXM6IDEsXG4gICAgICAgIHZvbGF0aWxpdHk6IDgsXG4gICAgICB9LFxuICAgICAgaWdub3JlZDogZmFsc2UsXG4gICAgICBmcm9tQ2FjaGU6IGZhbHNlLFxuICAgICAgcHVycG9zZTogJ2VuZ2luZU1vdmUnLFxuICAgIH07XG4gIH07XG4gIGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcyA9ICgpID0+ICh7XG4gICAgbW92ZToge1xuICAgICAgbW92ZTogJ2U3ZTUnLFxuICAgICAgZXZhbHVhdGlvbjogMjAsXG4gICAgICBldmFsTG9zczogMCxcbiAgICAgIHB2OiBbJ2U3ZTUnXSxcbiAgICAgIG11bHRpcHY6IDEsXG4gICAgICBkZXB0aDogOCxcbiAgICAgIGJ1Y2tldDogJ2Jlc3QnLFxuICAgIH0sXG4gICAgYnVja2V0OiAnYmVzdCcsXG4gICAgaXNCcmlsbGlhbnQ6IGZhbHNlLFxuICB9KTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwubWFrZU1vdmUoJ2UyJywgJ2U0JyksIHRydWUpO1xuXG4gIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgc2V0VGltZW91dChyZXNvbHZlLCA1MDApO1xuICB9KTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuaGlzdG9yeS5sZW5ndGgsIDIpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuaGlzdG9yeVsxXT8uc2FuLCAnZTUnKTtcblxuICBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSA9IG9yaWdpbmFsSW5pdGlhbGl6ZTtcbiAgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbiA9IG9yaWdpbmFsQW5hbHl6ZVBvc2l0aW9uO1xuICBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMgPSBvcmlnaW5hbFBpY2tNb3ZlO1xuICB1aVN0YXRlVmlld01vZGVsLnNldEF1dG9QbGF5U3BlZWQob3JpZ2luYWxBdXRvUGxheVNwZWVkKTtcbn0pO1xuXG50ZXN0KCdzdGFydEF1dG9QbGF5VHVybiBsZXRzIHRoZSB3aGl0ZSBlbmdpbmUgYmVnaW4gdGhlIGdhbWUgbWFudWFsbHknLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgY29uc3Qgb3JpZ2luYWxTb2x2ZU5leHRNb3ZlID0gYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZS5iaW5kKGJvYXJkVmlld01vZGVsKTtcbiAgbGV0IGF1dG9UcmlnZ2VyZWRBcmd1bWVudDogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGJvYXJkVmlld01vZGVsLnNldEF1dG9QbGF5KHRydWUpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRFbmdpbmVQbGF5c0ZvcigndycpO1xuICBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlID0gYXN5bmMgKGF1dG9UcmlnZ2VyZWQgPSBmYWxzZSkgPT4ge1xuICAgIGF1dG9UcmlnZ2VyZWRBcmd1bWVudCA9IGF1dG9UcmlnZ2VyZWQ7XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmNhblN0YXJ0QXV0b1BsYXlUdXJuLCB0cnVlKTtcbiAgYXdhaXQgYm9hcmRWaWV3TW9kZWwuc3RhcnRBdXRvUGxheVR1cm4oKTtcbiAgYXNzZXJ0LmVxdWFsKGF1dG9UcmlnZ2VyZWRBcmd1bWVudCwgdHJ1ZSk7XG5cbiAgYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSA9IG9yaWdpbmFsU29sdmVOZXh0TW92ZTtcbn0pO1xuXG50ZXN0KCdzdGFydEF1dG9QbGF5VHVybiBpcyBhdmFpbGFibGUgZm9yIGEgYmxhY2sgZW5naW5lIGFmdGVyIHRoZSBwbGF5ZXIgbW92ZScsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBjb25zdCBvcmlnaW5hbFNvbHZlTmV4dE1vdmUgPSBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlLmJpbmQoYm9hcmRWaWV3TW9kZWwpO1xuICBsZXQgYXV0b1RyaWdnZXJlZEFyZ3VtZW50OiBib29sZWFuIHwgbnVsbCA9IG51bGw7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0QXV0b1BsYXkodHJ1ZSk7XG4gIGJvYXJkVmlld01vZGVsLnNldEVuZ2luZVBsYXlzRm9yKCdiJyk7XG4gIGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUgPSBhc3luYyAoYXV0b1RyaWdnZXJlZCA9IGZhbHNlKSA9PiB7XG4gICAgYXV0b1RyaWdnZXJlZEFyZ3VtZW50ID0gYXV0b1RyaWdnZXJlZDtcbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwubWFrZU1vdmUoJ2UyJywgJ2U0JyksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuY2FuU3RhcnRBdXRvUGxheVR1cm4sIHRydWUpO1xuXG4gIGF3YWl0IGJvYXJkVmlld01vZGVsLnN0YXJ0QXV0b1BsYXlUdXJuKCk7XG4gIGFzc2VydC5lcXVhbChhdXRvVHJpZ2dlcmVkQXJndW1lbnQsIHRydWUpO1xuXG4gIGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUgPSBvcmlnaW5hbFNvbHZlTmV4dE1vdmU7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVFPLFNBQVMsdUJBQ2QsV0FDQSxpQkFDUztBQUNULFNBQU8sY0FBYztBQUN2QjtBQUVPLFNBQVMscUJBQ2QsWUFDQSxhQUNTO0FBQ1QsU0FBTyxlQUFlO0FB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QUV2QixRQUFNLEVBQUUsZ0JBQUFBLGdCQUFlLElBQUksTUFBTTtBQUVqQyxRQUFNLHdCQUF3QkEsZ0JBQWUsY0FBYyxLQUFLQSxlQUFjO0FBQzlFLE1BQUksd0JBQXdDO0FBRTVDLEVBQUFBLGdCQUFlLE1BQU07QUFDckIsRUFBQUEsZ0JBQWUsWUFBWSxJQUFJO0FBQy9CLEVBQUFBLGdCQUFlLGtCQUFrQixHQUFHO0FBQ3BDLEVBQUFBLGdCQUFlLGdCQUFnQixPQUFPLGdCQUFnQixVQUFVO0FBQzlELDRCQUF3QjtBQUN4QixXQUFPO0FBQUEsRUFDVDtBQUVBLFNBQU8sTUFBTUEsZ0JBQWUsU0FBUyxNQUFNLElBQUksR0FBRyxJQUFJO0FBQ3RELFNBQU8sTUFBTUEsZ0JBQWUsc0JBQXNCLElBQUk7QUFFdEQsUUFBTUEsZ0JBQWUsa0JBQWtCO0FBQ3ZDLFNBQU8sTUFBTSx1QkFBdUIsSUFBSTtBQUV4QyxFQUFBQSxnQkFBZSxnQkFBZ0I7QUFDakMsQ0FBQzsiLAogICJuYW1lcyI6IFsiQ2hlc3MiLCAiUElFQ0VfVkFMVUVTIiwgIkJVQ0tFVF9PUkRFUiIsICJDaGVzcyIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJhY3Rpb24iLCAicmVhY3Rpb24iLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgInJlYWN0aW9uIiwgInJ1bkluQWN0aW9uIiwgIkNoZXNzIiwgImxvZ2dlciIsICJwZ24iLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJyZWFjdGlvbiIsICJhY3Rpb24iLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJjYW5BcHBseUFuYWx5emVkTW92ZSIsICJpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0IiwgIkFuYWx5c2lzQ2FjaGUiLCAiYnVpbGRBbmFseXNpc0NhY2hlS2V5IiwgImJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQiLCAiY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlIiwgInJlc29sdmVQZ25TdGFydEZlbiIsICJkZXJpdmVCcmlsbGlhbnRVc2FnZSIsICJib2FyZFZpZXdNb2RlbCIsICJmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCIsICJQUkVERUZJTkVEX09QRU5JTkdTIiwgImVuZ2luZVZpZXdNb2RlbCIsICJjb25maWdWaWV3TW9kZWwiLCAiRW5naW5lVmlld01vZGVsIiwgIm1vdmVTdG9ja2Zpc2hTZXJ2aWNlIiwgImFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSIsICJCb2FyZFZpZXdNb2RlbCIsICJhbmFseXNpc0NhY2hlIiwgIlBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCIsICJERUZBVUxUX0JVQ0tFVF9DT05GSUciLCAiREVGQVVMVF9GRUFUVVJFX09QVElPTlMiLCAiR0FNRV9TRVRVUF9QUkVTRVRTIiwgImZpbHRlckdhbWVTZXR1cFByZXNldHMiLCAidG9Db21wYXRpYmxlT3BlbmluZ1ByZXNldCIsICJnZXRHYW1lU2V0dXBQcmVzZXRCeUlkIiwgImJ1aWxkR2FtZUFuYWx5dGljc1N1bW1hcnkiLCAiR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCIsICJ1aVN0YXRlVmlld01vZGVsIl0KfQo=
