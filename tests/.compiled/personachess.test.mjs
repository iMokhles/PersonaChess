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

// src/engine/winProbability.ts
function evalFromSideToMoveToWhitePositive(evalCpSideToMove, sideToMove) {
  return sideToMove === "w" ? evalCpSideToMove : -evalCpSideToMove;
}
function whitePositiveEvalToWinChances(whitePositiveCp) {
  const clamped = Math.max(-8e3, Math.min(8e3, whitePositiveCp));
  const pWhite = 1 / (1 + Math.pow(10, -clamped / 400));
  const white = Math.round(pWhite * 100);
  return { white, black: 100 - white };
}
var init_winProbability = __esm({
  "src/engine/winProbability.ts"() {
    "use strict";
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
    init_winProbability();
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
      /** Approximate win share from engine eval (0–100); updates after each position change. */
      winChanceWhitePercent = 50;
      winChanceBlackPercent = 50;
      winChancesLoading = false;
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
      _winChanceTimeout = null;
      _winChanceRequestSeq = 0;
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
        this.scheduleWinChancesRefresh();
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
                this.updateLastAnnotation({
                  bucket: analyzedMove.bucket,
                  evalLoss: analyzedMove.evalLoss,
                  evaluation: analyzedMove.evaluation
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
                  this.updateLastAnnotation({ bucket: "fallback" });
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
                  this.updateLastAnnotation({ bucket: "good" });
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
          const moveNumber = (index >> 1) + 1;
          rows.push({
            moveNumber,
            white: whiteMove,
            black: blackMove,
            whiteQualityLabel: this.qualityLabelForPly(index),
            blackQualityLabel: this.qualityLabelForPly(index + 1),
            whiteQualityBucket: this.qualityBucketForPly(index),
            blackQualityBucket: this.qualityBucketForPly(index + 1)
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
        this.clearWinChancesSchedule();
        this._winChanceRequestSeq += 1;
        this.winChanceWhitePercent = 50;
        this.winChanceBlackPercent = 50;
        this.winChancesLoading = false;
      }
      qualityLabelForPly(plyIndex) {
        const annotation = this.historyAnnotations[plyIndex];
        if (!annotation) {
          return null;
        }
        if (annotation.consumedBrilliant) {
          return "Brilliant";
        }
        if (annotation.bucket) {
          if (Object.prototype.hasOwnProperty.call(DISPLAY_BUCKET_LABELS, annotation.bucket)) {
            return DISPLAY_BUCKET_LABELS[annotation.bucket];
          }
          return annotation.bucket;
        }
        return null;
      }
      qualityBucketForPly(plyIndex) {
        const annotation = this.historyAnnotations[plyIndex];
        if (!annotation?.bucket) {
          return null;
        }
        if (Object.prototype.hasOwnProperty.call(DISPLAY_BUCKET_LABELS, annotation.bucket)) {
          return annotation.bucket;
        }
        return null;
      }
      clearWinChancesSchedule() {
        if (this._winChanceTimeout) {
          clearTimeout(this._winChanceTimeout);
          this._winChanceTimeout = null;
        }
      }
      scheduleWinChancesRefresh() {
        this.clearWinChancesSchedule();
        this._winChanceTimeout = setTimeout(() => {
          this._winChanceTimeout = null;
          void this.refreshWinChancesFromEngine();
        }, 380);
      }
      async refreshWinChancesFromEngine() {
        const requestId = ++this._winChanceRequestSeq;
        const fenSnapshot = this.fen;
        const turnSnapshot = this.chess.turn();
        runInAction2(() => {
          this.winChancesLoading = true;
        });
        try {
          if (this.isCheckmate) {
            const whiteWins = turnSnapshot === "b";
            runInAction2(() => {
              if (requestId !== this._winChanceRequestSeq) {
                return;
              }
              this.winChanceWhitePercent = whiteWins ? 100 : 0;
              this.winChanceBlackPercent = whiteWins ? 0 : 100;
              this.winChancesLoading = false;
            });
            return;
          }
          if (this.isGameOver) {
            runInAction2(() => {
              if (requestId !== this._winChanceRequestSeq) {
                return;
              }
              this.winChanceWhitePercent = 50;
              this.winChanceBlackPercent = 50;
              this.winChancesLoading = false;
            });
            return;
          }
          if (!engineViewModel.isInitialized) {
            runInAction2(() => {
              if (requestId !== this._winChanceRequestSeq) {
                return;
              }
              this.winChanceWhitePercent = 50;
              this.winChanceBlackPercent = 50;
              this.winChancesLoading = false;
            });
            return;
          }
          const depth = Math.min(14, Math.max(8, configViewModel.depth));
          const analysis = await engineViewModel.analyzePosition(
            fenSnapshot,
            depth,
            1,
            "background"
          );
          if (requestId !== this._winChanceRequestSeq) {
            return;
          }
          if (analysis.ignored || !canApplyAnalyzedMove(this.fen, analysis.analyzedFen) || analysis.moves.length === 0) {
            runInAction2(() => {
              this.winChancesLoading = false;
            });
            return;
          }
          const best = analysis.moves[0];
          const whitePositive = evalFromSideToMoveToWhitePositive(
            best.evaluation,
            turnSnapshot
          );
          const { white, black } = whitePositiveEvalToWinChances(whitePositive);
          runInAction2(() => {
            this.winChanceWhitePercent = white;
            this.winChanceBlackPercent = black;
            this.winChancesLoading = false;
          });
        } catch {
          runInAction2(() => {
            if (requestId !== this._winChanceRequestSeq) {
              return;
            }
            this.winChancesLoading = false;
          });
        }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2VuZ2luZS9hbmFseXNpc1NhZmV0eS50cyIsICIuLi8uLi9zcmMvZW5naW5lL2FuYWx5c2lzQ2FjaGUudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9yYW5kb20udHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lU2Vzc2lvbi50cyIsICIuLi8uLi9zcmMvZW5naW5lL2JyaWxsaWFudFRyYWNraW5nLnRzIiwgIi4uLy4uL3NyYy9zaGFyZWQvZGVidWcudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZS50cyIsICIuLi8uLi9zcmMvZW5naW5lL2VuZ2luZUNvb3JkaW5hdG9yLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvdHlwZXMudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9tb3ZlQ2xhc3NpZmllci50cyIsICIuLi8uLi9zcmMvZW5naW5lL21vdmVQaWNrZXIudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9mZWF0dXJlT3B0aW9ucy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvZW5naW5lL2JyaWxsaWFudE1vdmUudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lUGhhc2UudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9wb3NpdGlvbkNvbXBsZXhpdHkudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9wZXJzb25hQmlhcy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9FbmdpbmVWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvQ29uZmlnVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvd2luUHJvYmFiaWxpdHkudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvVWlTdGF0ZVZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9Cb2FyZFZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvZW5naW5lL2dhbWVBbmFseXRpY3MudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvR2FtZUFuYWx5dGljc1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvZW5naW5lL29wZW5pbmdzLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvZ2FtZVNldHVwUHJlc2V0cy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9HYW1lU2V0dXBWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvRGVidWdWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9wZXJzb25hUHJvZmlsZXMudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvUGVyc29uYVByb2ZpbGVzVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL2luZGV4LnRzIiwgIi4uL3BlcnNvbmFjaGVzcy50ZXN0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgaW50ZXJmYWNlIEFuYWx5c2lzU25hcHNob3Q8VE1vdmVzPiB7XG4gIHJlcXVlc3RJZDogbnVtYmVyO1xuICBhbmFseXplZEZlbjogc3RyaW5nO1xuICBtb3ZlczogVE1vdmVzO1xufVxuXG5leHBvcnQgdHlwZSBBbmFseXNpc1B1cnBvc2UgPSAnZW5naW5lTW92ZScgfCAnYmFja2dyb3VuZCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0KFxuICByZXF1ZXN0SWQ6IG51bWJlcixcbiAgbGF0ZXN0UmVxdWVzdElkOiBudW1iZXIsXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIHJlcXVlc3RJZCAhPT0gbGF0ZXN0UmVxdWVzdElkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuQXBwbHlBbmFseXplZE1vdmUoXG4gIGN1cnJlbnRGZW46IHN0cmluZyxcbiAgYW5hbHl6ZWRGZW46IHN0cmluZyxcbik6IGJvb2xlYW4ge1xuICByZXR1cm4gY3VycmVudEZlbiA9PT0gYW5hbHl6ZWRGZW47XG59XG4iLCAiaW1wb3J0IHsgQW5hbHl6ZWRNb3ZlLCBDbGFzc2lmaWVkTW92ZSB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuYWx5c2lzQ2FjaGVFbnRyeSB7XG4gIGtleTogc3RyaW5nO1xuICBtb3ZlczogQW5hbHl6ZWRNb3ZlW107XG4gIGNsYXNzaWZpZWRNb3Zlcz86IENsYXNzaWZpZWRNb3ZlW107XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRBbmFseXNpc0NhY2hlS2V5KFxuICBmZW46IHN0cmluZyxcbiAgZGVwdGg6IG51bWJlcixcbiAgbXVsdGlQVjogbnVtYmVyLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke2Zlbn18ZGVwdGg6JHtkZXB0aH18bXVsdGlwdjoke211bHRpUFZ9YDtcbn1cblxuZXhwb3J0IGNsYXNzIEFuYWx5c2lzQ2FjaGUge1xuICBwcml2YXRlIGVudHJpZXMgPSBuZXcgTWFwPHN0cmluZywgQW5hbHlzaXNDYWNoZUVudHJ5PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWF4U2l6ZTogbnVtYmVyID0gMjAwKSB7fVxuXG4gIGNvbmZpZ3VyZShtYXhTaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLm1heFNpemUgPSBNYXRoLm1heCgxLCBtYXhTaXplKTtcbiAgICB0aGlzLnRyaW0oKTtcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IEFuYWx5c2lzQ2FjaGVFbnRyeSB8IG51bGwge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5lbnRyaWVzLmdldChrZXkpO1xuXG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5lbnRyaWVzLmRlbGV0ZShrZXkpO1xuICAgIHRoaXMuZW50cmllcy5zZXQoa2V5LCBlbnRyeSk7XG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgc2V0KGVudHJ5OiBBbmFseXNpc0NhY2hlRW50cnkpOiB2b2lkIHtcbiAgICB0aGlzLmVudHJpZXMuc2V0KGVudHJ5LmtleSwgZW50cnkpO1xuICAgIHRoaXMudHJpbSgpO1xuICB9XG5cbiAgaW52YWxpZGF0ZShrZXk/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoa2V5KSB7XG4gICAgICB0aGlzLmVudHJpZXMuZGVsZXRlKGtleSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5lbnRyaWVzLmNsZWFyKCk7XG4gIH1cblxuICBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXMuc2l6ZTtcbiAgfVxuXG4gIHByaXZhdGUgdHJpbSgpOiB2b2lkIHtcbiAgICB3aGlsZSAodGhpcy5lbnRyaWVzLnNpemUgPiB0aGlzLm1heFNpemUpIHtcbiAgICAgIGNvbnN0IG9sZGVzdEtleSA9IHRoaXMuZW50cmllcy5rZXlzKCkubmV4dCgpLnZhbHVlO1xuXG4gICAgICBpZiAoIW9sZGVzdEtleSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbnRyaWVzLmRlbGV0ZShvbGRlc3RLZXkpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgYW5hbHlzaXNDYWNoZSA9IG5ldyBBbmFseXNpc0NhY2hlKCk7XG4iLCAiaW1wb3J0IHsgUGVyc29uYUlkIH0gZnJvbSAnLi9mZWF0dXJlT3B0aW9ucyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmFuZG9tU291cmNlIHtcbiAgbmV4dCgpOiBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIGhhc2hTdHJpbmcoaW5wdXQ6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBoYXNoID0gMjE2NjEzNjI2MTtcblxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgaW5wdXQubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgaGFzaCBePSBpbnB1dC5jaGFyQ29kZUF0KGluZGV4KTtcbiAgICBoYXNoID0gTWF0aC5pbXVsKGhhc2gsIDE2Nzc3NjE5KTtcbiAgfVxuXG4gIHJldHVybiBoYXNoID4+PiAwO1xufVxuXG5mdW5jdGlvbiBtdWxiZXJyeTMyKHNlZWQ6IG51bWJlcik6ICgpID0+IG51bWJlciB7XG4gIGxldCB2YWx1ZSA9IHNlZWQgPj4+IDA7XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICB2YWx1ZSArPSAweDZkMmI3OWY1O1xuICAgIGxldCByZXN1bHQgPSBNYXRoLmltdWwodmFsdWUgXiAodmFsdWUgPj4+IDE1KSwgdmFsdWUgfCAxKTtcbiAgICByZXN1bHQgXj0gcmVzdWx0ICsgTWF0aC5pbXVsKHJlc3VsdCBeIChyZXN1bHQgPj4+IDcpLCByZXN1bHQgfCA2MSk7XG4gICAgcmV0dXJuICgocmVzdWx0IF4gKHJlc3VsdCA+Pj4gMTQpKSA+Pj4gMCkgLyA0Mjk0OTY3Mjk2O1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTGVnYWN5UmFuZG9tU291cmNlKCk6IFJhbmRvbVNvdXJjZSB7XG4gIHJldHVybiB7XG4gICAgbmV4dDogKCkgPT4gTWF0aC5yYW5kb20oKSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZShzZWVkOiBzdHJpbmcpOiBSYW5kb21Tb3VyY2Uge1xuICBjb25zdCBnZW5lcmF0b3IgPSBtdWxiZXJyeTMyKGhhc2hTdHJpbmcoc2VlZCkpO1xuXG4gIHJldHVybiB7XG4gICAgbmV4dDogKCkgPT4gZ2VuZXJhdG9yKCksXG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGV0ZXJtaW5pc3RpY1NlZWRDb250ZXh0IHtcbiAgZ2FtZVN0YXJ0RmVuOiBzdHJpbmc7XG4gIGN1cnJlbnRGZW46IHN0cmluZztcbiAgbW92ZUNvdW50OiBudW1iZXI7XG4gIHNpZGVUb01vdmU6ICd3JyB8ICdiJztcbiAgcGVyc29uYTogUGVyc29uYUlkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREZXRlcm1pbmlzdGljU2VlZCh7XG4gIGdhbWVTdGFydEZlbixcbiAgY3VycmVudEZlbixcbiAgbW92ZUNvdW50LFxuICBzaWRlVG9Nb3ZlLFxuICBwZXJzb25hLFxufTogRGV0ZXJtaW5pc3RpY1NlZWRDb250ZXh0KTogc3RyaW5nIHtcbiAgcmV0dXJuIFtnYW1lU3RhcnRGZW4sIGN1cnJlbnRGZW4sIFN0cmluZyhtb3ZlQ291bnQpLCBzaWRlVG9Nb3ZlLCBwZXJzb25hXS5qb2luKCd8Jyk7XG59XG4iLCAiaW1wb3J0IHsgTW92ZUFubm90YXRpb24gfSBmcm9tICcuL2JyaWxsaWFudFRyYWNraW5nJztcblxuZXhwb3J0IGludGVyZmFjZSBQZXJzaXN0ZWRCb2FyZFN0YXRlIHtcbiAgY3VycmVudEZlbjogc3RyaW5nO1xuICBmZW5IaXN0b3J5OiBzdHJpbmdbXTtcbiAgZ2FtZVNlc3Npb25JZDogc3RyaW5nO1xuICBnYW1lU3RhcnRGZW46IHN0cmluZztcbiAgY3VycmVudFNldHVwTmFtZT86IHN0cmluZztcbiAgY3VycmVudFNldHVwQ2F0ZWdvcnk/OiBzdHJpbmc7XG4gIGhpc3RvcnlBbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXTtcbiAgcmVkb0Fubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2FtZVNlc3Npb25JZCgpOiBzdHJpbmcge1xuICByZXR1cm4gYHNlc3Npb25fJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxMCl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQZ25TdGFydEZlbihcbiAgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgbnVsbD4sXG4gIGZhbGxiYWNrRmVuOiBzdHJpbmcsXG4pOiBzdHJpbmcge1xuICByZXR1cm4gaGVhZGVycy5TZXRVcCA9PT0gJzEnICYmIHR5cGVvZiBoZWFkZXJzLkZFTiA9PT0gJ3N0cmluZydcbiAgICA/IGhlYWRlcnMuRkVOXG4gICAgOiBmYWxsYmFja0Zlbjtcbn1cbiIsICJleHBvcnQgaW50ZXJmYWNlIE1vdmVBbm5vdGF0aW9uIHtcbiAgYmVmb3JlRmVuOiBzdHJpbmc7XG4gIGFmdGVyRmVuOiBzdHJpbmc7XG4gIHVjaTogc3RyaW5nO1xuICBtb3ZlTnVtYmVyOiBudW1iZXI7XG4gIGNvbnN1bWVkQnJpbGxpYW50OiBib29sZWFuO1xuICBhY3Rvcj86ICdwbGF5ZXInIHwgJ2VuZ2luZScgfCAncmVkbyc7XG4gIHNhbj86IHN0cmluZztcbiAgYnVja2V0Pzogc3RyaW5nIHwgbnVsbDtcbiAgZXZhbExvc3M/OiBudW1iZXIgfCBudWxsO1xuICBldmFsdWF0aW9uPzogbnVtYmVyIHwgbnVsbDtcbiAgY29tcGxleGl0eUxldmVsPzogJ2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJyB8IG51bGw7XG4gIGNvbXBsZXhpdHlTY29yZT86IG51bWJlciB8IG51bGw7XG4gIHRpbWVzdGFtcD86IG51bWJlcjtcbiAgZGVsYXlNc1NpbmNlUHJldmlvdXM/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnJpbGxpYW50VXNhZ2Uge1xuICBicmlsbGlhbnRVc2VkQ291bnQ6IG51bWJlcjtcbiAgYnJpbGxpYW50TW92ZU51bWJlcnM6IG51bWJlcltdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVyaXZlQnJpbGxpYW50VXNhZ2UoXG4gIGFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdLFxuKTogQnJpbGxpYW50VXNhZ2Uge1xuICBjb25zdCBicmlsbGlhbnRNb3ZlTnVtYmVycyA9IGFubm90YXRpb25zXG4gICAgLmZpbHRlcigoYW5ub3RhdGlvbikgPT4gYW5ub3RhdGlvbi5jb25zdW1lZEJyaWxsaWFudClcbiAgICAubWFwKChhbm5vdGF0aW9uKSA9PiBhbm5vdGF0aW9uLm1vdmVOdW1iZXIpO1xuXG4gIHJldHVybiB7XG4gICAgYnJpbGxpYW50VXNlZENvdW50OiBicmlsbGlhbnRNb3ZlTnVtYmVycy5sZW5ndGgsXG4gICAgYnJpbGxpYW50TW92ZU51bWJlcnMsXG4gIH07XG59XG4iLCAiY29uc3QgREVCVUdfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX2RlYnVnX2xvZ2dpbmcnO1xuXG5mdW5jdGlvbiByZWFkQnJvd3NlckRlYnVnRmxhZygpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3aW5kb3cubG9jYWxTdG9yYWdlID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShERUJVR19TVE9SQUdFX0tFWSkgPT09ICcxJztcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRQcm9jZXNzRGVidWdGbGFnKCk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHByb2Nlc3MuZW52LlBFUlNPTkFDSEVTU19ERUJVRyA9PT0gJzEnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZWJ1Z0xvZ2dpbmdFbmFibGVkKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gcmVhZEJyb3dzZXJEZWJ1Z0ZsYWcoKSB8fCByZWFkUHJvY2Vzc0RlYnVnRmxhZygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RGVidWdMb2dnaW5nRW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2luZG93LmxvY2FsU3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIGlmIChlbmFibGVkKSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oREVCVUdfU1RPUkFHRV9LRVksICcxJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShERUJVR19TVE9SQUdFX0tFWSk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBJZ25vcmUgbG9jYWxTdG9yYWdlIGZhaWx1cmVzIGFuZCBrZWVwIHRoZSBhcHAgcnVubmluZy5cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVidWdMb2dnZXIoc2NvcGU6IHN0cmluZykge1xuICByZXR1cm4ge1xuICAgIGRlYnVnOiAoLi4uYXJnczogdW5rbm93bltdKSA9PiB7XG4gICAgICBpZiAoaXNEZWJ1Z0xvZ2dpbmdFbmFibGVkKCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFske3Njb3BlfV1gLCAuLi5hcmdzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVycm9yOiAoLi4uYXJnczogdW5rbm93bltdKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKGBbJHtzY29wZX1dYCwgLi4uYXJncyk7XG4gICAgfSxcbiAgICB3YXJuOiAoLi4uYXJnczogdW5rbm93bltdKSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oYFske3Njb3BlfV1gLCAuLi5hcmdzKTtcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZXZlbG9wbWVudEJ1aWxkKCk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIE1BSU5fV0lORE9XX1ZJVEVfREVWX1NFUlZFUl9VUkwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oTUFJTl9XSU5ET1dfVklURV9ERVZfU0VSVkVSX1VSTCk7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBCb29sZWFuKGltcG9ydC5tZXRhLmVudj8uREVWKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbiIsICIvKipcbiAqIFN0b2NrZmlzaCBVQ0kgRW5naW5lIFNlcnZpY2VcbiAqIE1vZGVsIGxheWVyIC0gUHVyZSBUeXBlU2NyaXB0LCBubyBSZWFjdCwgbm8gTW9iWFxuICogXG4gKiBIYW5kbGVzIGNvbW11bmljYXRpb24gd2l0aCBTdG9ja2Zpc2ggV0FTTSBlbmdpbmUgdmlhIFdlYiBXb3JrZXJcbiAqL1xuXG5pbXBvcnQgeyBBbmFseXplZE1vdmUsIFN0b2NrZmlzaEluZm8gfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGNyZWF0ZURlYnVnTG9nZ2VyIH0gZnJvbSAnLi4vc2hhcmVkL2RlYnVnJztcblxudHlwZSBNZXNzYWdlSGFuZGxlciA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQ7XG5cbmV4cG9ydCBjbGFzcyBTdG9ja2Zpc2hTZXJ2aWNlIHtcbiAgcHJpdmF0ZSB3b3JrZXI6IFdvcmtlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG1lc3NhZ2VIYW5kbGVyczogU2V0PE1lc3NhZ2VIYW5kbGVyPiA9IG5ldyBTZXQoKTtcbiAgcHJpdmF0ZSBpc1JlYWR5ID0gZmFsc2U7XG4gIHByaXZhdGUgcmVhZHlSZXNvbHZlcnM6IEFycmF5PCgpID0+IHZvaWQ+ID0gW107XG4gIHByaXZhdGUgbXVsdGlQViA9IDEyO1xuICBwcml2YXRlIGRlcHRoID0gMjA7XG4gIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgc2VydmljZU5hbWUgPSAnU3RvY2tmaXNoU2VydmljZScpIHtcbiAgICB0aGlzLmxvZ2dlciA9IGNyZWF0ZURlYnVnTG9nZ2VyKHNlcnZpY2VOYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIFN0b2NrZmlzaCBXQVNNIGVuZ2luZVxuICAgKi9cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy53b3JrZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQ3JlYXRlIHdvcmtlciB1c2luZyBzdG9ja2Zpc2guanNcbiAgICAgICAgLy8gSW4gVml0ZSwgd2UgbmVlZCB0byB1c2UgP3dvcmtlciBzdWZmaXggb3IgY3JlYXRlIGlubGluZSB3b3JrZXJcbiAgICAgICAgY29uc3Qgd29ya2VyQ29kZSA9IGBcbiAgICAgICAgICBpbXBvcnRTY3JpcHRzKCcke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59L3N0b2NrZmlzaC5qcycpO1xuICAgICAgICBgO1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3dvcmtlckNvZGVdLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JyB9KTtcbiAgICAgICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuXG4gICAgICAgIHRoaXMud29ya2VyLm9ubWVzc2FnZSA9IChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHR5cGVvZiBldmVudC5kYXRhID09PSAnc3RyaW5nJyA/IGV2ZW50LmRhdGEgOiBTdHJpbmcoZXZlbnQuZGF0YSk7XG4gICAgICAgICAgdGhpcy5oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMud29ya2VyLm9uZXJyb3IgPSAoZXJyb3IpID0+IHtcbiAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignV29ya2VyIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFdhaXQgZm9yIFVDSSBpbml0aWFsaXphdGlvblxuICAgICAgICBjb25zdCByZWFkeUhhbmRsZXIgPSAobXNnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBpZiAobXNnID09PSAndWNpb2snKSB7XG4gICAgICAgICAgICB0aGlzLmlzUmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihyZWFkeUhhbmRsZXIpO1xuICAgICAgICAgICAgdGhpcy5yZWFkeVJlc29sdmVycy5mb3JFYWNoKHIgPT4gcigpKTtcbiAgICAgICAgICAgIHRoaXMucmVhZHlSZXNvbHZlcnMgPSBbXTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5hZGRNZXNzYWdlSGFuZGxlcihyZWFkeUhhbmRsZXIpO1xuICAgICAgICBcbiAgICAgICAgLy8gU21hbGwgZGVsYXkgdG8gZW5zdXJlIHdvcmtlciBpcyByZWFkeVxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLnNlbmRDb21tYW5kKCd1Y2knKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgZW5naW5lIGluc3RhbmNlXG4gICAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgdGhpcy53b3JrZXIudGVybWluYXRlKCk7XG4gICAgICB0aGlzLndvcmtlciA9IG51bGw7XG4gICAgICB0aGlzLmlzUmVhZHkgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlcnMuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIFVDSSBjb21tYW5kIHRvIGVuZ2luZVxuICAgKi9cbiAgcHJpdmF0ZSBzZW5kQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMud29ya2VyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0b2NrZmlzaCBub3QgaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoY29tbWFuZCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGluY29taW5nIG1lc3NhZ2UgZnJvbSBlbmdpbmVcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAobWVzc2FnZSAmJiAobWVzc2FnZS5zdGFydHNXaXRoKCdiZXN0bW92ZScpIHx8IG1lc3NhZ2UgPT09ICdyZWFkeW9rJyB8fCBtZXNzYWdlID09PSAndWNpb2snKSkge1xuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ01lc3NhZ2U6JywgbWVzc2FnZSk7XG4gICAgfVxuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzLmZvckVhY2goaGFuZGxlciA9PiBoYW5kbGVyKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBtZXNzYWdlIGhhbmRsZXJcbiAgICovXG4gIGFkZE1lc3NhZ2VIYW5kbGVyKGhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyKTogdm9pZCB7XG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlcnMuYWRkKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIG1lc3NhZ2UgaGFuZGxlclxuICAgKi9cbiAgcmVtb3ZlTWVzc2FnZUhhbmRsZXIoaGFuZGxlcjogTWVzc2FnZUhhbmRsZXIpOiB2b2lkIHtcbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVycy5kZWxldGUoaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogV2FpdCBmb3IgZW5naW5lIHRvIGJlIHJlYWR5XG4gICAqL1xuICBhc3luYyB3YWl0Rm9yUmVhZHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkgcmV0dXJuO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHRoaXMucmVhZHlSZXNvbHZlcnMucHVzaChyZXNvbHZlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgTXVsdGlQViBvcHRpb25cbiAgICovXG4gIHNldE11bHRpUFYodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMubXVsdGlQViA9IHZhbHVlO1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHtcbiAgICAgIHRoaXMuc2VuZENvbW1hbmQoYHNldG9wdGlvbiBuYW1lIE11bHRpUFYgdmFsdWUgJHt2YWx1ZX1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHNlYXJjaCBkZXB0aFxuICAgKi9cbiAgc2V0RGVwdGgodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuZGVwdGggPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgZW5naW5lIG9wdGlvbnNcbiAgICovXG4gIGNvbmZpZ3VyZShvcHRpb25zOiB7IG11bHRpUFY/OiBudW1iZXI7IGRlcHRoPzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBpZiAob3B0aW9ucy5tdWx0aVBWICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2V0TXVsdGlQVihvcHRpb25zLm11bHRpUFYpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5kZXB0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNldERlcHRoKG9wdGlvbnMuZGVwdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbmFseXplIGEgcG9zaXRpb24gYW5kIHJldHVybiBhbGwgY2FuZGlkYXRlIG1vdmVzXG4gICAqL1xuICBhc3luYyBhbmFseXplUG9zaXRpb24oZmVuOiBzdHJpbmcpOiBQcm9taXNlPEFuYWx5emVkTW92ZVtdPiB7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUmVhZHkoKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgbW92ZXM6IE1hcDxudW1iZXIsIFN0b2NrZmlzaEluZm8+ID0gbmV3IE1hcCgpO1xuICAgICAgbGV0IGJlc3RTY29yZSA9IDA7XG4gICAgICBsZXQgaGFzUmVjZWl2ZWRCZXN0TW92ZSA9IGZhbHNlO1xuICAgICAgbGV0IG1heERlcHRoUmVhY2hlZCA9IDA7XG5cbiAgICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb21wbGV0ZSBhbmFseXNpcyB3aXRoIGNvbGxlY3RlZCBtb3Zlc1xuICAgICAgY29uc3QgY29tcGxldGVBbmFseXNpcyA9ICgpID0+IHtcbiAgICAgICAgaWYgKGhhc1JlY2VpdmVkQmVzdE1vdmUpIHJldHVybjtcbiAgICAgICAgaGFzUmVjZWl2ZWRCZXN0TW92ZSA9IHRydWU7XG4gICAgICAgIHRoaXMucmVtb3ZlTWVzc2FnZUhhbmRsZXIoYW5hbHlzaXNIYW5kbGVyKTtcblxuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29tcGxldGluZyBhbmFseXNpcywgY29sbGVjdGVkJywgbW92ZXMuc2l6ZSwgJ21vdmVzJyk7XG5cbiAgICAgICAgLy8gQ29udmVydCB0byBBbmFseXplZE1vdmUgYXJyYXlcbiAgICAgICAgY29uc3QgYW5hbHl6ZWRNb3ZlczogQW5hbHl6ZWRNb3ZlW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHRoaXMubXVsdGlQVjsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaW5mbyA9IG1vdmVzLmdldChpKTtcbiAgICAgICAgICBpZiAoaW5mbyAmJiBpbmZvLnB2Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGV2YWxMb3NzID0gTWF0aC5hYnMoYmVzdFNjb3JlIC0gaW5mby5zY29yZSk7XG4gICAgICAgICAgICBhbmFseXplZE1vdmVzLnB1c2goe1xuICAgICAgICAgICAgICBtb3ZlOiBpbmZvLnB2WzBdLFxuICAgICAgICAgICAgICBldmFsdWF0aW9uOiBpbmZvLnNjb3JlLFxuICAgICAgICAgICAgICBldmFsTG9zcyxcbiAgICAgICAgICAgICAgcHY6IGluZm8ucHYsXG4gICAgICAgICAgICAgIG11bHRpcHY6IGluZm8ubXVsdGlwdixcbiAgICAgICAgICAgICAgZGVwdGg6IGluZm8uZGVwdGgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYW5hbHl6ZWRNb3Zlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1JldHVybmluZycsIGFuYWx5emVkTW92ZXMubGVuZ3RoLCAnYW5hbHl6ZWQgbW92ZXMnKTtcbiAgICAgICAgICByZXNvbHZlKGFuYWx5emVkTW92ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSBnYW1lIG92ZXIgcG9zaXRpb24gKGNoZWNrbWF0ZS9zdGFsZW1hdGUpXG4gICAgICAgICAgLy8gSWYgd2UgcmVjZWl2ZWQgbWF0ZSBzY29yZXMgYnV0IG5vIG1vdmVzLCBpdCdzIGdhbWUgb3ZlclxuICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdObyBtb3ZlcyBjb2xsZWN0ZWQgLSBsaWtlbHkgZ2FtZSBvdmVyIHBvc2l0aW9uJyk7XG4gICAgICAgICAgcmVzb2x2ZShbXSk7IC8vIFJldHVybiBlbXB0eSBhcnJheSBpbnN0ZWFkIG9mIHJlamVjdGluZyBmb3IgZ2FtZSBvdmVyIHBvc2l0aW9uc1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBBZGQgdGltZW91dCB0byBmb3JjZSBzdG9wIGFmdGVyIHJlYXNvbmFibGUgdGltZVxuICAgICAgY29uc3QgZm9yY2VTdG9wVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoIWhhc1JlY2VpdmVkQmVzdE1vdmUpIHtcbiAgICAgICAgICB0aGlzLmxvZ2dlci53YXJuKCdGb3JjaW5nIHN0b3AgYWZ0ZXIgMTAgc2Vjb25kcyB0byBnZXQgYmVzdG1vdmUnKTtcbiAgICAgICAgICB0aGlzLnNlbmRDb21tYW5kKCdzdG9wJyk7XG4gICAgICAgICAgLy8gR2l2ZSBpdCBhIG1vbWVudCB0byByZXNwb25kIHdpdGggYmVzdG1vdmVcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmICghaGFzUmVjZWl2ZWRCZXN0TW92ZSkge1xuICAgICAgICAgICAgICB0aGlzLmxvZ2dlci53YXJuKCdObyBiZXN0bW92ZSBhZnRlciBzdG9wLCB1c2luZyBjb2xsZWN0ZWQgbW92ZXMnKTtcbiAgICAgICAgICAgICAgY29tcGxldGVBbmFseXNpcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9XG4gICAgICB9LCAxMDAwMCk7IC8vIDEwIHNlY29uZCB0aW1lb3V0IHRvIGZvcmNlIHN0b3BcblxuICAgICAgLy8gQWRkIGFic29sdXRlIHRpbWVvdXQgdG8gcHJldmVudCBoYW5naW5nXG4gICAgICBjb25zdCBhYnNvbHV0ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKCFoYXNSZWNlaXZlZEJlc3RNb3ZlKSB7XG4gICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0FuYWx5c2lzIHRpbWVvdXQgYWZ0ZXIgMzAgc2Vjb25kcycpO1xuICAgICAgICAgIHRoaXMucmVtb3ZlTWVzc2FnZUhhbmRsZXIoYW5hbHlzaXNIYW5kbGVyKTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZm9yY2VTdG9wVGltZW91dCk7XG4gICAgICAgICAgY29tcGxldGVBbmFseXNpcygpOyAvLyBUcnkgdG8gdXNlIHdoYXQgd2UgaGF2ZVxuICAgICAgICB9XG4gICAgICB9LCAzMDAwMCk7IC8vIDMwIHNlY29uZCBhYnNvbHV0ZSB0aW1lb3V0XG5cbiAgICAgIGNvbnN0IGFuYWx5c2lzSGFuZGxlciA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIG1hdGUgc2NvcmVzIChnYW1lIG92ZXIgcG9zaXRpb25zKVxuICAgICAgICBpZiAobWVzc2FnZS5pbmNsdWRlcygnc2NvcmUgbWF0ZScpKSB7XG4gICAgICAgICAgLy8gRXh0cmFjdCBtYXRlIHNjb3JlIHRvIGRldGVjdCBjaGVja21hdGUvc3RhbGVtYXRlXG4gICAgICAgICAgY29uc3QgbWF0ZU1hdGNoID0gbWVzc2FnZS5tYXRjaCgvc2NvcmUgbWF0ZSAoLT9cXGQrKS8pO1xuICAgICAgICAgIGlmIChtYXRlTWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGVJbiA9IHBhcnNlSW50KG1hdGVNYXRjaFsxXSwgMTApO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0RldGVjdGVkIG1hdGUgc2NvcmU6JywgbWF0ZUluKTtcbiAgICAgICAgICAgIC8vIElmIG1hdGUgaXMgMCBvciBuZWdhdGl2ZSwgaXQncyBjaGVja21hdGUvc3RhbGVtYXRlIChubyBtb3ZlcyBhdmFpbGFibGUpXG4gICAgICAgICAgICBpZiAobWF0ZUluIDw9IDApIHtcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0dhbWUgb3ZlciBwb3NpdGlvbiBkZXRlY3RlZCAoY2hlY2ttYXRlL3N0YWxlbWF0ZSknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFBhcnNlIGluZm8gbGluZXNcbiAgICAgICAgaWYgKG1lc3NhZ2Uuc3RhcnRzV2l0aCgnaW5mbycpICYmIG1lc3NhZ2UuaW5jbHVkZXMoJ211bHRpcHYnKSkge1xuICAgICAgICAgIGNvbnN0IGluZm8gPSB0aGlzLnBhcnNlSW5mb0xpbmUobWVzc2FnZSk7XG4gICAgICAgICAgaWYgKGluZm8pIHtcbiAgICAgICAgICAgIG1vdmVzLnNldChpbmZvLm11bHRpcHYsIGluZm8pO1xuICAgICAgICAgICAgaWYgKGluZm8ubXVsdGlwdiA9PT0gMSkge1xuICAgICAgICAgICAgICBiZXN0U2NvcmUgPSBpbmZvLnNjb3JlO1xuICAgICAgICAgICAgICBtYXhEZXB0aFJlYWNoZWQgPSBNYXRoLm1heChtYXhEZXB0aFJlYWNoZWQsIGluZm8uZGVwdGgpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gSWYgd2UndmUgcmVhY2hlZCB0aGUgdGFyZ2V0IGRlcHRoIGFuZCBoYXZlIGVub3VnaCBtb3Zlcywgd2UgY2FuIHN0b3AgZWFybHlcbiAgICAgICAgICAgICAgaWYgKGluZm8uZGVwdGggPj0gdGhpcy5kZXB0aCAmJiBtb3Zlcy5zaXplID49IE1hdGgubWluKDMsIHRoaXMubXVsdGlQVikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnUmVhY2hlZCB0YXJnZXQgZGVwdGgsIHN0b3BwaW5nIGVhcmx5Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZCgnc3RvcCcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQW5hbHlzaXMgY29tcGxldGVcbiAgICAgICAgaWYgKG1lc3NhZ2Uuc3RhcnRzV2l0aCgnYmVzdG1vdmUnKSkge1xuICAgICAgICAgIGhhc1JlY2VpdmVkQmVzdE1vdmUgPSB0cnVlO1xuICAgICAgICAgIGNsZWFyVGltZW91dChmb3JjZVN0b3BUaW1lb3V0KTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoYWJzb2x1dGVUaW1lb3V0KTtcbiAgICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBiZXN0bW92ZSBpcyBcIm5vbmVcIiAobm8gbGVnYWwgbW92ZXMgLSBjaGVja21hdGUvc3RhbGVtYXRlKVxuICAgICAgICAgIGNvbnN0IGJlc3Rtb3ZlTWF0Y2ggPSBtZXNzYWdlLm1hdGNoKC9iZXN0bW92ZVxccysoXFxTKykvKTtcbiAgICAgICAgICBpZiAoYmVzdG1vdmVNYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgYmVzdG1vdmUgPSBiZXN0bW92ZU1hdGNoWzFdO1xuICAgICAgICAgICAgaWYgKGJlc3Rtb3ZlID09PSAnKG5vbmUpJyB8fCBiZXN0bW92ZSA9PT0gJ25vbmUnIHx8IGJlc3Rtb3ZlID09PSAnMDAwMCcpIHtcbiAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ05vIGxlZ2FsIG1vdmVzIChjaGVja21hdGUvc3RhbGVtYXRlKScpO1xuICAgICAgICAgICAgICByZXNvbHZlKFtdKTsgLy8gUmV0dXJuIGVtcHR5IGFycmF5IGZvciBnYW1lIG92ZXIgcG9zaXRpb25zXG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnUmVjZWl2ZWQgYmVzdG1vdmUsIGNvbGxlY3RlZCcsIG1vdmVzLnNpemUsICdtb3ZlcycpO1xuXG4gICAgICAgICAgLy8gQ29udmVydCB0byBBbmFseXplZE1vdmUgYXJyYXlcbiAgICAgICAgICBjb25zdCBhbmFseXplZE1vdmVzOiBBbmFseXplZE1vdmVbXSA9IFtdO1xuICAgICAgICAgIFxuICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHRoaXMubXVsdGlQVjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpbmZvID0gbW92ZXMuZ2V0KGkpO1xuICAgICAgICAgICAgaWYgKGluZm8gJiYgaW5mby5wdi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2YWxMb3NzID0gTWF0aC5hYnMoYmVzdFNjb3JlIC0gaW5mby5zY29yZSk7XG4gICAgICAgICAgICAgIGFuYWx5emVkTW92ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgbW92ZTogaW5mby5wdlswXSxcbiAgICAgICAgICAgICAgICBldmFsdWF0aW9uOiBpbmZvLnNjb3JlLFxuICAgICAgICAgICAgICAgIGV2YWxMb3NzLFxuICAgICAgICAgICAgICAgIHB2OiBpbmZvLnB2LFxuICAgICAgICAgICAgICAgIG11bHRpcHY6IGluZm8ubXVsdGlwdixcbiAgICAgICAgICAgICAgICBkZXB0aDogaW5mby5kZXB0aCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZSBubyBtb3ZlcyBidXQgZ290IGEgYmVzdG1vdmUsIGl0IG1pZ2h0IHN0aWxsIGJlIGdhbWUgb3ZlclxuICAgICAgICAgIGlmIChhbmFseXplZE1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ05vIG1vdmVzIGluIGJlc3Rtb3ZlIHJlc3BvbnNlIC0gZ2FtZSBvdmVyIHBvc2l0aW9uJyk7XG4gICAgICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1JldHVybmluZycsIGFuYWx5emVkTW92ZXMubGVuZ3RoLCAnYW5hbHl6ZWQgbW92ZXMnKTtcbiAgICAgICAgICAgIHJlc29sdmUoYW5hbHl6ZWRNb3Zlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmFkZE1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG5cbiAgICAgIC8vIFdhaXQgZm9yIHJlYWR5b2sgYmVmb3JlIHNlbmRpbmcgcG9zaXRpb25cbiAgICAgIGNvbnN0IHJlYWR5SGFuZGxlciA9IChtc2c6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAobXNnID09PSAncmVhZHlvaycpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKHJlYWR5SGFuZGxlcik7XG4gICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ0VuZ2luZSByZWFkeSwgc2VuZGluZyBwb3NpdGlvbiBhbmQgc3RhcnRpbmcgYW5hbHlzaXMnKTtcbiAgICAgICAgICB0aGlzLnNlbmRDb21tYW5kKGBwb3NpdGlvbiBmZW4gJHtmZW59YCk7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZChgZ28gZGVwdGggJHt0aGlzLmRlcHRofWApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGhpcy5hZGRNZXNzYWdlSGFuZGxlcihyZWFkeUhhbmRsZXIpO1xuXG4gICAgICAvLyBTZW5kIHBvc2l0aW9uIGFuZCBzdGFydCBhbmFseXNpc1xuICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1N0YXJ0aW5nIGFuYWx5c2lzIGZvciBGRU46JywgZmVuLCAnTXVsdGlQVj0nLCB0aGlzLm11bHRpUFYsICdEZXB0aD0nLCB0aGlzLmRlcHRoKTtcbiAgICAgIFxuICAgICAgdGhpcy5zZW5kQ29tbWFuZChgc2V0b3B0aW9uIG5hbWUgTXVsdGlQViB2YWx1ZSAke3RoaXMubXVsdGlQVn1gKTtcbiAgICAgIHRoaXMuc2VuZENvbW1hbmQoJ2lzcmVhZHknKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBVQ0kgaW5mbyBsaW5lIGludG8gc3RydWN0dXJlZCBkYXRhXG4gICAqL1xuICBwcml2YXRlIHBhcnNlSW5mb0xpbmUobGluZTogc3RyaW5nKTogU3RvY2tmaXNoSW5mbyB8IG51bGwge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IGxpbmUuc3BsaXQoJyAnKTtcbiAgICAgIFxuICAgICAgY29uc3QgZ2V0VmFsdWVBZnRlciA9IChrZXk6IHN0cmluZyk6IHN0cmluZyB8IG51bGwgPT4ge1xuICAgICAgICBjb25zdCBpZHggPSBwYXJ0cy5pbmRleE9mKGtleSk7XG4gICAgICAgIHJldHVybiBpZHggPj0gMCAmJiBpZHggPCBwYXJ0cy5sZW5ndGggLSAxID8gcGFydHNbaWR4ICsgMV0gOiBudWxsO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgbXVsdGlwdlN0ciA9IGdldFZhbHVlQWZ0ZXIoJ211bHRpcHYnKTtcbiAgICAgIGNvbnN0IGRlcHRoU3RyID0gZ2V0VmFsdWVBZnRlcignZGVwdGgnKTtcbiAgICAgIFxuICAgICAgaWYgKCFtdWx0aXB2U3RyIHx8ICFkZXB0aFN0cikgcmV0dXJuIG51bGw7XG5cbiAgICAgIGNvbnN0IG11bHRpcHYgPSBwYXJzZUludChtdWx0aXB2U3RyLCAxMCk7XG4gICAgICBjb25zdCBkZXB0aCA9IHBhcnNlSW50KGRlcHRoU3RyLCAxMCk7XG5cbiAgICAgIC8vIEdldCBzY29yZSB2YWx1ZVxuICAgICAgbGV0IHNjb3JlID0gMDtcbiAgICAgIGxldCBtYXRlOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICBjb25zdCBzY29yZUlkeCA9IHBhcnRzLmluZGV4T2YoJ3Njb3JlJyk7XG4gICAgICBcbiAgICAgIGlmIChzY29yZUlkeCA+PSAwICYmIHBhcnRzW3Njb3JlSWR4ICsgMV0gPT09ICdjcCcpIHtcbiAgICAgICAgc2NvcmUgPSBwYXJzZUludChwYXJ0c1tzY29yZUlkeCArIDJdLCAxMCk7XG4gICAgICB9IGVsc2UgaWYgKHNjb3JlSWR4ID49IDAgJiYgcGFydHNbc2NvcmVJZHggKyAxXSA9PT0gJ21hdGUnKSB7XG4gICAgICAgIG1hdGUgPSBwYXJzZUludChwYXJ0c1tzY29yZUlkeCArIDJdLCAxMCk7XG4gICAgICAgIC8vIENvbnZlcnQgbWF0ZSB0byBhIGxhcmdlIGNlbnRpcGF3biB2YWx1ZVxuICAgICAgICBzY29yZSA9IG1hdGUgPiAwID8gMTAwMDAgLSBtYXRlICogMTAwIDogLTEwMDAwIC0gbWF0ZSAqIDEwMDtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IFBWIChwcmluY2lwYWwgdmFyaWF0aW9uKVxuICAgICAgY29uc3QgcHZJZHggPSBwYXJ0cy5pbmRleE9mKCdwdicpO1xuICAgICAgY29uc3QgcHYgPSBwdklkeCA+PSAwID8gcGFydHMuc2xpY2UocHZJZHggKyAxKSA6IFtdO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBtdWx0aXB2LFxuICAgICAgICBkZXB0aCxcbiAgICAgICAgc2NvcmUsXG4gICAgICAgIG1hdGUsXG4gICAgICAgIHB2LFxuICAgICAgfTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIGN1cnJlbnQgYW5hbHlzaXNcbiAgICovXG4gIHN0b3AoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMud29ya2VyKSB7XG4gICAgICB0aGlzLnNlbmRDb21tYW5kKCdzdG9wJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGEgbmV3IGdhbWVcbiAgICovXG4gIG5ld0dhbWUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMud29ya2VyKSB7XG4gICAgICB0aGlzLnNlbmRDb21tYW5kKCd1Y2luZXdnYW1lJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGVuZ2luZSBpcyBpbml0aWFsaXplZFxuICAgKi9cbiAgZ2V0IGluaXRpYWxpemVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzUmVhZHk7XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgbW92ZVN0b2NrZmlzaFNlcnZpY2UgPSBuZXcgU3RvY2tmaXNoU2VydmljZSgnTW92ZVN0b2NrZmlzaFNlcnZpY2UnKTtcbmV4cG9ydCBjb25zdCBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UgPSBuZXcgU3RvY2tmaXNoU2VydmljZSgnQW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlJyk7XG5leHBvcnQgY29uc3Qgc3RvY2tmaXNoU2VydmljZSA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZTtcbiIsICJpbXBvcnQgeyBBbmFseXplZE1vdmUgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSxcbiAgbW92ZVN0b2NrZmlzaFNlcnZpY2UsXG4gIFN0b2NrZmlzaFNlcnZpY2UsXG59IGZyb20gJy4vc3RvY2tmaXNoLnNlcnZpY2UnO1xuXG5leHBvcnQgdHlwZSBFbmdpbmVMYW5lID0gJ21vdmUnIHwgJ2FuYWx5c2lzJztcblxuaW50ZXJmYWNlIEVuZ2luZUNvb3JkaW5hdG9yRGVwZW5kZW5jaWVzIHtcbiAgbW92ZVNlcnZpY2U/OiBTdG9ja2Zpc2hTZXJ2aWNlO1xuICBhbmFseXNpc1NlcnZpY2U/OiBTdG9ja2Zpc2hTZXJ2aWNlO1xufVxuXG5leHBvcnQgY2xhc3MgRW5naW5lQ29vcmRpbmF0b3Ige1xuICBwcml2YXRlIHJlYWRvbmx5IG1vdmVTZXJ2aWNlOiBTdG9ja2Zpc2hTZXJ2aWNlO1xuICBwcml2YXRlIHJlYWRvbmx5IGFuYWx5c2lzU2VydmljZTogU3RvY2tmaXNoU2VydmljZTtcblxuICBjb25zdHJ1Y3RvcihkZXBlbmRlbmNpZXM6IEVuZ2luZUNvb3JkaW5hdG9yRGVwZW5kZW5jaWVzID0ge30pIHtcbiAgICB0aGlzLm1vdmVTZXJ2aWNlID0gZGVwZW5kZW5jaWVzLm1vdmVTZXJ2aWNlID8/IG1vdmVTdG9ja2Zpc2hTZXJ2aWNlO1xuICAgIHRoaXMuYW5hbHlzaXNTZXJ2aWNlID0gZGVwZW5kZW5jaWVzLmFuYWx5c2lzU2VydmljZSA/PyBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2U7XG4gIH1cblxuICBhc3luYyBpbml0aWFsaXplKGxhbmU/OiBFbmdpbmVMYW5lKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGxhbmUgPT09ICdtb3ZlJykge1xuICAgICAgYXdhaXQgdGhpcy5tb3ZlU2VydmljZS5pbml0aWFsaXplKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGxhbmUgPT09ICdhbmFseXNpcycpIHtcbiAgICAgIGF3YWl0IHRoaXMuYW5hbHlzaXNTZXJ2aWNlLmluaXRpYWxpemUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLm1vdmVTZXJ2aWNlLmluaXRpYWxpemUoKSxcbiAgICAgIHRoaXMuYW5hbHlzaXNTZXJ2aWNlLmluaXRpYWxpemUoKSxcbiAgICBdKTtcbiAgfVxuXG4gIGNvbmZpZ3VyZShsYW5lOiBFbmdpbmVMYW5lLCBvcHRpb25zOiB7IG11bHRpUFY/OiBudW1iZXI7IGRlcHRoPzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICB0aGlzLmdldFNlcnZpY2UobGFuZSkuY29uZmlndXJlKG9wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgYW5hbHl6ZVBvc2l0aW9uKGxhbmU6IEVuZ2luZUxhbmUsIGZlbjogc3RyaW5nKTogUHJvbWlzZTxBbmFseXplZE1vdmVbXT4ge1xuICAgIHJldHVybiB0aGlzLmdldFNlcnZpY2UobGFuZSkuYW5hbHl6ZVBvc2l0aW9uKGZlbik7XG4gIH1cblxuICBzdG9wKGxhbmU/OiBFbmdpbmVMYW5lKTogdm9pZCB7XG4gICAgaWYgKCFsYW5lKSB7XG4gICAgICB0aGlzLm1vdmVTZXJ2aWNlLnN0b3AoKTtcbiAgICAgIHRoaXMuYW5hbHlzaXNTZXJ2aWNlLnN0b3AoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmdldFNlcnZpY2UobGFuZSkuc3RvcCgpO1xuICB9XG5cbiAgbmV3R2FtZSgpOiB2b2lkIHtcbiAgICB0aGlzLm1vdmVTZXJ2aWNlLm5ld0dhbWUoKTtcbiAgICB0aGlzLmFuYWx5c2lzU2VydmljZS5uZXdHYW1lKCk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMubW92ZVNlcnZpY2UuZGVzdHJveSgpO1xuICAgIHRoaXMuYW5hbHlzaXNTZXJ2aWNlLmRlc3Ryb3koKTtcbiAgfVxuXG4gIHJlc3RhcnQoKTogdm9pZCB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIGdldFNlcnZpY2UobGFuZTogRW5naW5lTGFuZSk6IFN0b2NrZmlzaFNlcnZpY2Uge1xuICAgIHJldHVybiBsYW5lID09PSAnbW92ZScgPyB0aGlzLm1vdmVTZXJ2aWNlIDogdGhpcy5hbmFseXNpc1NlcnZpY2U7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGVuZ2luZUNvb3JkaW5hdG9yID0gbmV3IEVuZ2luZUNvb3JkaW5hdG9yKCk7XG4iLCAiLyoqXG4gKiBUeXBlcyBmb3IgdGhlIGNoZXNzIGVuZ2luZSBtb2RlbCBsYXllclxuICogUHVyZSBUeXBlU2NyaXB0IC0gbm8gUmVhY3QsIG5vIE1vYlhcbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuYWx5emVkTW92ZSB7XG4gIG1vdmU6IHN0cmluZzsgICAgICAgIC8vIFVDSSBmb3JtYXQgKGUuZy4sIFwiZTJlNFwiKVxuICBldmFsdWF0aW9uOiBudW1iZXI7ICAvLyBDZW50aXBhd24gZXZhbHVhdGlvblxuICBldmFsTG9zczogbnVtYmVyOyAgICAvLyBMb3NzIGNvbXBhcmVkIHRvIGJlc3QgbW92ZVxuICBwdjogc3RyaW5nW107ICAgICAgICAvLyBQcmluY2lwYWwgdmFyaWF0aW9uXG4gIG11bHRpcHY6IG51bWJlcjsgICAgIC8vIE11bHRpUFYgcmFuayAoMSA9IGJlc3QpXG4gIGRlcHRoOiBudW1iZXI7ICAgICAgIC8vIFNlYXJjaCBkZXB0aFxufVxuXG5leHBvcnQgdHlwZSBNb3ZlQnVja2V0ID0gXG4gIHwgJ2Jlc3QnXG4gIHwgJ2dyZWF0J1xuICB8ICdleGNlbGxlbnQnXG4gIHwgJ2dvb2QnXG4gIHwgJ2luYWNjdXJhY3knXG4gIHwgJ21pc3Rha2UnXG4gIHwgJ2JsdW5kZXInO1xuXG5leHBvcnQgdHlwZSBEaXNwbGF5TW92ZUJ1Y2tldCA9IE1vdmVCdWNrZXQgfCAnZmFsbGJhY2snO1xuXG5leHBvcnQgaW50ZXJmYWNlIENsYXNzaWZpZWRNb3ZlIGV4dGVuZHMgQW5hbHl6ZWRNb3ZlIHtcbiAgYnVja2V0OiBNb3ZlQnVja2V0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1Y2tldENvbmZpZyB7XG4gIGJlc3Q6IG51bWJlcjtcbiAgZ3JlYXQ6IG51bWJlcjtcbiAgZXhjZWxsZW50OiBudW1iZXI7XG4gIGdvb2Q6IG51bWJlcjtcbiAgaW5hY2N1cmFjeTogbnVtYmVyO1xuICBtaXN0YWtlOiBudW1iZXI7XG4gIGJsdW5kZXI6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdG9ja2Zpc2hJbmZvIHtcbiAgbXVsdGlwdjogbnVtYmVyO1xuICBkZXB0aDogbnVtYmVyO1xuICBzY29yZTogbnVtYmVyO1xuICBtYXRlPzogbnVtYmVyO1xuICBwdjogc3RyaW5nW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGlja2VkTW92ZVJlc3VsdCB7XG4gIG1vdmU6IENsYXNzaWZpZWRNb3ZlO1xuICBidWNrZXQ6IE1vdmVCdWNrZXQ7XG4gIGlzQnJpbGxpYW50PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQlVDS0VUX0NPTkZJRzogQnVja2V0Q29uZmlnID0ge1xuICBiZXN0OiA0MCxcbiAgZ3JlYXQ6IDI1LFxuICBleGNlbGxlbnQ6IDIwLFxuICBnb29kOiAxMCxcbiAgaW5hY2N1cmFjeTogNCxcbiAgbWlzdGFrZTogMSxcbiAgYmx1bmRlcjogMCxcbn07XG5cbi8qKiBQcmVzZXQgaWQgZm9yIG1vdmUgcXVhbGl0eSBkaXN0cmlidXRpb24gKi9cbmV4cG9ydCB0eXBlIE1vdmVRdWFsaXR5UHJlc2V0SWQgPSAnbG93JyB8ICdtZWRpdW0nIHwgJ2hhcmQnIHwgJ3N1cGVyX2hhcmQnIHwgJ2FnZ3Jlc3NpdmUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1vdmVRdWFsaXR5UHJlc2V0IHtcbiAgaWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQ7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGNvbmZpZzogQnVja2V0Q29uZmlnO1xufVxuXG4vKiogUHJlZGVmaW5lZCBtb3ZlIHF1YWxpdHkgZGlzdHJpYnV0aW9ucyAocGVyY2VudGFnZXMgc3VtIHRvIDEwMCkgKi9cbmV4cG9ydCBjb25zdCBNT1ZFX1FVQUxJVFlfUFJFU0VUUzogTW92ZVF1YWxpdHlQcmVzZXRbXSA9IFtcbiAge1xuICAgIGlkOiAnbG93JyxcbiAgICBsYWJlbDogJ0xvdycsXG4gICAgZGVzY3JpcHRpb246ICdFYXNpZXIgXHUyMDE0IG1vcmUgZ29vZC9pbmFjY3VyYWN5L21pc3Rha2UgbW92ZXMnLFxuICAgIGNvbmZpZzoge1xuICAgICAgYmVzdDogMTUsXG4gICAgICBncmVhdDogMTUsXG4gICAgICBleGNlbGxlbnQ6IDIwLFxuICAgICAgZ29vZDogMjUsXG4gICAgICBpbmFjY3VyYWN5OiAxNSxcbiAgICAgIG1pc3Rha2U6IDcsXG4gICAgICBibHVuZGVyOiAzLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ21lZGl1bScsXG4gICAgbGFiZWw6ICdNZWRpdW0nLFxuICAgIGRlc2NyaXB0aW9uOiAnQmFsYW5jZWQgbWl4IG9mIHF1YWxpdGllcycsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiA0MCxcbiAgICAgIGdyZWF0OiAyNSxcbiAgICAgIGV4Y2VsbGVudDogMjAsXG4gICAgICBnb29kOiAxMCxcbiAgICAgIGluYWNjdXJhY3k6IDQsXG4gICAgICBtaXN0YWtlOiAxLFxuICAgICAgYmx1bmRlcjogMCxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaWQ6ICdoYXJkJyxcbiAgICBsYWJlbDogJ0hhcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnRmF2b3JzIGJlc3QgYW5kIGdyZWF0IG1vdmVzJyxcbiAgICBjb25maWc6IHtcbiAgICAgIGJlc3Q6IDU1LFxuICAgICAgZ3JlYXQ6IDI1LFxuICAgICAgZXhjZWxsZW50OiAxNSxcbiAgICAgIGdvb2Q6IDUsXG4gICAgICBpbmFjY3VyYWN5OiAwLFxuICAgICAgbWlzdGFrZTogMCxcbiAgICAgIGJsdW5kZXI6IDAsXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAnc3VwZXJfaGFyZCcsXG4gICAgbGFiZWw6ICdTdXBlciBIYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0FsbW9zdCBvbmx5IGJlc3QgYW5kIGdyZWF0JyxcbiAgICBjb25maWc6IHtcbiAgICAgIGJlc3Q6IDcwLFxuICAgICAgZ3JlYXQ6IDI1LFxuICAgICAgZXhjZWxsZW50OiA1LFxuICAgICAgZ29vZDogMCxcbiAgICAgIGluYWNjdXJhY3k6IDAsXG4gICAgICBtaXN0YWtlOiAwLFxuICAgICAgYmx1bmRlcjogMCxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaWQ6ICdhZ2dyZXNzaXZlJyxcbiAgICBsYWJlbDogJ0FnZ3Jlc3NpdmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmlza3kgXHUyMDE0IG1vcmUgaW5hY2N1cmFjaWVzIGFuZCBtaXN0YWtlcycsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiAyMCxcbiAgICAgIGdyZWF0OiAyMCxcbiAgICAgIGV4Y2VsbGVudDogMTUsXG4gICAgICBnb29kOiAxNSxcbiAgICAgIGluYWNjdXJhY3k6IDE1LFxuICAgICAgbWlzdGFrZTogMTAsXG4gICAgICBibHVuZGVyOiA1LFxuICAgIH0sXG4gIH0sXG5dO1xuXG5leHBvcnQgY29uc3QgQlVDS0VUX0VWQUxfUkFOR0VTOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgW251bWJlciwgbnVtYmVyXT4gPSB7XG4gIGJlc3Q6IFswLCAxMF0sXG4gIGdyZWF0OiBbMTAsIDMwXSxcbiAgZXhjZWxsZW50OiBbMzAsIDcwXSxcbiAgZ29vZDogWzcwLCAxNTBdLFxuICBpbmFjY3VyYWN5OiBbMTUwLCAzMDBdLFxuICBtaXN0YWtlOiBbMzAwLCA2MDBdLFxuICBibHVuZGVyOiBbNjAwLCBJbmZpbml0eV0sXG59O1xuXG5leHBvcnQgY29uc3QgQlVDS0VUX0xBQkVMUzogUmVjb3JkPE1vdmVCdWNrZXQsIHN0cmluZz4gPSB7XG4gIGJlc3Q6ICdCZXN0JyxcbiAgZ3JlYXQ6ICdHcmVhdCcsXG4gIGV4Y2VsbGVudDogJ0V4Y2VsbGVudCcsXG4gIGdvb2Q6ICdHb29kJyxcbiAgaW5hY2N1cmFjeTogJ0luYWNjdXJhY3knLFxuICBtaXN0YWtlOiAnTWlzdGFrZScsXG4gIGJsdW5kZXI6ICdCbHVuZGVyJyxcbn07XG5cbmV4cG9ydCBjb25zdCBESVNQTEFZX0JVQ0tFVF9MQUJFTFM6IFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgc3RyaW5nPiA9IHtcbiAgLi4uQlVDS0VUX0xBQkVMUyxcbiAgZmFsbGJhY2s6ICdGYWxsYmFjayBtb3ZlJyxcbn07XG5cbmV4cG9ydCBjb25zdCBCVUNLRVRfQ09MT1JTOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgc3RyaW5nPiA9IHtcbiAgYmVzdDogJyMyNmE2NDEnLFxuICBncmVhdDogJyMyZWEwNDMnLFxuICBleGNlbGxlbnQ6ICcjNTdhYjVhJyxcbiAgZ29vZDogJyM4Yjk0OWUnLFxuICBpbmFjY3VyYWN5OiAnI2QyOTkyMicsXG4gIG1pc3Rha2U6ICcjZjg1MTQ5JyxcbiAgYmx1bmRlcjogJyNkYTM2MzMnLFxufTtcblxuZXhwb3J0IGNvbnN0IERJU1BMQVlfQlVDS0VUX0NPTE9SUzogUmVjb3JkPERpc3BsYXlNb3ZlQnVja2V0LCBzdHJpbmc+ID0ge1xuICAuLi5CVUNLRVRfQ09MT1JTLFxuICBmYWxsYmFjazogJyM2ZTc2ODEnLFxufTtcbiIsICIvKipcbiAqIE1vdmUgQ2xhc3NpZmllclxuICogTW9kZWwgbGF5ZXIgLSBQdXJlIFR5cGVTY3JpcHQsIG5vIFJlYWN0LCBubyBNb2JYXG4gKiBcbiAqIENsYXNzaWZpZXMgY2hlc3MgbW92ZXMgaW50byBxdWFsaXR5IGJ1Y2tldHMgYmFzZWQgb24gZXZhbHVhdGlvbiBsb3NzXG4gKi9cblxuaW1wb3J0IHsgXG4gIEFuYWx5emVkTW92ZSwgXG4gIENsYXNzaWZpZWRNb3ZlLCBcbiAgRGlzcGxheU1vdmVCdWNrZXQsXG4gIE1vdmVCdWNrZXQsIFxuICBCVUNLRVRfRVZBTF9SQU5HRVMgXG59IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIENsYXNzaWZ5IGEgc2luZ2xlIG1vdmUgaW50byBhIHF1YWxpdHkgYnVja2V0IGJhc2VkIG9uIGV2YWwgbG9zc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlNb3ZlKG1vdmU6IEFuYWx5emVkTW92ZSk6IENsYXNzaWZpZWRNb3ZlIHtcbiAgY29uc3QgYnVja2V0ID0gZ2V0QnVja2V0Rm9yRXZhbExvc3MobW92ZS5ldmFsTG9zcyk7XG4gIHJldHVybiB7XG4gICAgLi4ubW92ZSxcbiAgICBidWNrZXQsXG4gIH07XG59XG5cbi8qKlxuICogQ2xhc3NpZnkgYWxsIGFuYWx5emVkIG1vdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc2lmeU1vdmVzKG1vdmVzOiBBbmFseXplZE1vdmVbXSk6IENsYXNzaWZpZWRNb3ZlW10ge1xuICByZXR1cm4gbW92ZXMubWFwKGNsYXNzaWZ5TW92ZSk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBidWNrZXQgZm9yIGEgZ2l2ZW4gZXZhbCBsb3NzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCdWNrZXRGb3JFdmFsTG9zcyhldmFsTG9zczogbnVtYmVyKTogTW92ZUJ1Y2tldCB7XG4gIGNvbnN0IGFic0xvc3MgPSBNYXRoLmFicyhldmFsTG9zcyk7XG4gIFxuICBmb3IgKGNvbnN0IFtidWNrZXQsIFttaW4sIG1heF1dIG9mIE9iamVjdC5lbnRyaWVzKEJVQ0tFVF9FVkFMX1JBTkdFUykpIHtcbiAgICBpZiAoYWJzTG9zcyA+PSBtaW4gJiYgYWJzTG9zcyA8IG1heCkge1xuICAgICAgcmV0dXJuIGJ1Y2tldCBhcyBNb3ZlQnVja2V0O1xuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuICdibHVuZGVyJztcbn1cblxuLyoqXG4gKiBHcm91cCBjbGFzc2lmaWVkIG1vdmVzIGJ5IHRoZWlyIGJ1Y2tldFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdKTogTWFwPE1vdmVCdWNrZXQsIENsYXNzaWZpZWRNb3ZlW10+IHtcbiAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcDxNb3ZlQnVja2V0LCBDbGFzc2lmaWVkTW92ZVtdPigpO1xuICBcbiAgLy8gSW5pdGlhbGl6ZSBhbGwgYnVja2V0cyB3aXRoIGVtcHR5IGFycmF5c1xuICBjb25zdCBidWNrZXRzOiBNb3ZlQnVja2V0W10gPSBbJ2Jlc3QnLCAnZ3JlYXQnLCAnZXhjZWxsZW50JywgJ2dvb2QnLCAnaW5hY2N1cmFjeScsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcbiAgYnVja2V0cy5mb3JFYWNoKGJ1Y2tldCA9PiBncm91cHMuc2V0KGJ1Y2tldCwgW10pKTtcbiAgXG4gIC8vIEdyb3VwIG1vdmVzXG4gIG1vdmVzLmZvckVhY2gobW92ZSA9PiB7XG4gICAgY29uc3QgYnVja2V0TW92ZXMgPSBncm91cHMuZ2V0KG1vdmUuYnVja2V0KSB8fCBbXTtcbiAgICBidWNrZXRNb3Zlcy5wdXNoKG1vdmUpO1xuICAgIGdyb3Vwcy5zZXQobW92ZS5idWNrZXQsIGJ1Y2tldE1vdmVzKTtcbiAgfSk7XG4gIFxuICByZXR1cm4gZ3JvdXBzO1xufVxuXG4vKipcbiAqIEdldCBzdGF0aXN0aWNzIGFib3V0IHRoZSBtb3ZlIGRpc3RyaWJ1dGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TW92ZVN0YXRzKG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdKTogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICBjb25zdCBzdGF0czogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4gPSB7XG4gICAgYmVzdDogMCxcbiAgICBncmVhdDogMCxcbiAgICBleGNlbGxlbnQ6IDAsXG4gICAgZ29vZDogMCxcbiAgICBpbmFjY3VyYWN5OiAwLFxuICAgIG1pc3Rha2U6IDAsXG4gICAgYmx1bmRlcjogMCxcbiAgfTtcbiAgXG4gIG1vdmVzLmZvckVhY2gobW92ZSA9PiB7XG4gICAgc3RhdHNbbW92ZS5idWNrZXRdKys7XG4gIH0pO1xuICBcbiAgcmV0dXJuIHN0YXRzO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZXJlIGFyZSBhbnkgbW92ZXMgaW4gYSBnaXZlbiBidWNrZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc01vdmVJbkJ1Y2tldChtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSwgYnVja2V0OiBNb3ZlQnVja2V0KTogYm9vbGVhbiB7XG4gIHJldHVybiBtb3Zlcy5zb21lKG1vdmUgPT4gbW92ZS5idWNrZXQgPT09IGJ1Y2tldCk7XG59XG5cbi8qKlxuICogR2V0IGFsbCBtb3ZlcyBmcm9tIGEgc3BlY2lmaWMgYnVja2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNb3Zlc0Zyb21CdWNrZXQobW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sIGJ1Y2tldDogTW92ZUJ1Y2tldCk6IENsYXNzaWZpZWRNb3ZlW10ge1xuICByZXR1cm4gbW92ZXMuZmlsdGVyKG1vdmUgPT4gbW92ZS5idWNrZXQgPT09IGJ1Y2tldCk7XG59XG5cbmNvbnN0IEJVQ0tFVF9PUkRFUjogTW92ZUJ1Y2tldFtdID0gWydiZXN0JywgJ2dyZWF0JywgJ2V4Y2VsbGVudCcsICdnb29kJywgJ2luYWNjdXJhY3knLCAnbWlzdGFrZScsICdibHVuZGVyJ107XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc2lmeVVuYW5hbHl6ZWRNb3ZlKCk6IERpc3BsYXlNb3ZlQnVja2V0IHtcbiAgcmV0dXJuICdmYWxsYmFjayc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXBMZWdhbE1vdmVzVG9CdWNrZXRzKFxuICBsZWdhbE1vdmVzOiBzdHJpbmdbXSxcbiAgYW5hbHl6ZWRNb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgdXNlSW1wcm92ZWRGYWxsYmFjazogYm9vbGVhbixcbik6IFJlY29yZDxzdHJpbmcsIERpc3BsYXlNb3ZlQnVja2V0PiB7XG4gIGNvbnN0IG1vdmVNYXA6IFJlY29yZDxzdHJpbmcsIERpc3BsYXlNb3ZlQnVja2V0PiA9IHt9O1xuXG4gIGZvciAoY29uc3QgYW5hbHl6ZWRNb3ZlIG9mIGFuYWx5emVkTW92ZXMpIHtcbiAgICBtb3ZlTWFwW2FuYWx5emVkTW92ZS5tb3ZlXSA9IGFuYWx5emVkTW92ZS5idWNrZXQ7XG4gIH1cblxuICBmb3IgKGNvbnN0IG1vdmUgb2YgbGVnYWxNb3Zlcykge1xuICAgIGlmICghbW92ZU1hcFttb3ZlXSkge1xuICAgICAgbW92ZU1hcFttb3ZlXSA9IHVzZUltcHJvdmVkRmFsbGJhY2sgPyBjbGFzc2lmeVVuYW5hbHl6ZWRNb3ZlKCkgOiAnZ29vZCc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1vdmVNYXA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQ2xvc2VzdEF2YWlsYWJsZUJ1Y2tldChcbiAgdGFyZ2V0QnVja2V0OiBNb3ZlQnVja2V0LFxuICBhdmFpbGFibGVCdWNrZXRzOiBNb3ZlQnVja2V0W10sXG4pOiBNb3ZlQnVja2V0IHwgbnVsbCB7XG4gIGlmIChhdmFpbGFibGVCdWNrZXRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgdGFyZ2V0SW5kZXggPSBCVUNLRVRfT1JERVIuaW5kZXhPZih0YXJnZXRCdWNrZXQpO1xuICBpZiAodGFyZ2V0SW5kZXggPT09IC0xKSB7XG4gICAgcmV0dXJuIGF2YWlsYWJsZUJ1Y2tldHNbMF07XG4gIH1cblxuICBmb3IgKGxldCBvZmZzZXQgPSAxOyBvZmZzZXQgPCBCVUNLRVRfT1JERVIubGVuZ3RoOyBvZmZzZXQgKz0gMSkge1xuICAgIGNvbnN0IGJldHRlckluZGV4ID0gdGFyZ2V0SW5kZXggLSBvZmZzZXQ7XG4gICAgaWYgKGJldHRlckluZGV4ID49IDApIHtcbiAgICAgIGNvbnN0IGJldHRlckJ1Y2tldCA9IEJVQ0tFVF9PUkRFUltiZXR0ZXJJbmRleF07XG4gICAgICBpZiAoYXZhaWxhYmxlQnVja2V0cy5pbmNsdWRlcyhiZXR0ZXJCdWNrZXQpKSB7XG4gICAgICAgIHJldHVybiBiZXR0ZXJCdWNrZXQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgd29yc2VJbmRleCA9IHRhcmdldEluZGV4ICsgb2Zmc2V0O1xuICAgIGlmICh3b3JzZUluZGV4IDwgQlVDS0VUX09SREVSLmxlbmd0aCkge1xuICAgICAgY29uc3Qgd29yc2VCdWNrZXQgPSBCVUNLRVRfT1JERVJbd29yc2VJbmRleF07XG4gICAgICBpZiAoYXZhaWxhYmxlQnVja2V0cy5pbmNsdWRlcyh3b3JzZUJ1Y2tldCkpIHtcbiAgICAgICAgcmV0dXJuIHdvcnNlQnVja2V0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdmFpbGFibGVCdWNrZXRzWzBdO1xufVxuIiwgIi8qKlxuICogTW92ZSBQaWNrZXJcbiAqIE1vZGVsIGxheWVyIC0gUHVyZSBUeXBlU2NyaXB0LCBubyBSZWFjdCwgbm8gTW9iWFxuICogXG4gKiBQaWNrcyBhIG1vdmUgYmFzZWQgb24gd2VpZ2h0ZWQgcHJvYmFiaWxpdHkgZnJvbSBxdWFsaXR5IGJ1Y2tldHNcbiAqL1xuXG5pbXBvcnQgeyBcbiAgQ2xhc3NpZmllZE1vdmUsIFxuICBNb3ZlQnVja2V0LCBcbiAgQnVja2V0Q29uZmlnLCBcbiAgUGlja2VkTW92ZVJlc3VsdCxcbiAgREVGQVVMVF9CVUNLRVRfQ09ORklHIFxufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGZpbmRDbG9zZXN0QXZhaWxhYmxlQnVja2V0LCBncm91cE1vdmVzQnlCdWNrZXQgfSBmcm9tICcuL21vdmVDbGFzc2lmaWVyJztcblxuZXhwb3J0IHR5cGUgUmFuZG9tTnVtYmVyR2VuZXJhdG9yID0gKCkgPT4gbnVtYmVyO1xuXG5pbnRlcmZhY2UgQnVja2V0U2VsZWN0aW9uIHtcbiAgYnVja2V0OiBNb3ZlQnVja2V0O1xuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXTtcbn1cblxuZnVuY3Rpb24gZ2V0QnVja2V0T3JkZXIoKTogTW92ZUJ1Y2tldFtdIHtcbiAgcmV0dXJuIFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnLCAnZ29vZCcsICdpbmFjY3VyYWN5JywgJ21pc3Rha2UnLCAnYmx1bmRlciddO1xufVxuXG5mdW5jdGlvbiBnZXRBdmFpbGFibGVCdWNrZXRzKFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgY29uZmlnOiBCdWNrZXRDb25maWcsXG4pOiBCdWNrZXRTZWxlY3Rpb25bXSB7XG4gIGNvbnN0IGdyb3VwZWQgPSBncm91cE1vdmVzQnlCdWNrZXQobW92ZXMpO1xuICBjb25zdCBhdmFpbGFibGVCdWNrZXRzOiBCdWNrZXRTZWxlY3Rpb25bXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgYnVja2V0IG9mIGdldEJ1Y2tldE9yZGVyKCkpIHtcbiAgICBjb25zdCBidWNrZXRNb3ZlcyA9IGdyb3VwZWQuZ2V0KGJ1Y2tldCkgfHwgW107XG4gICAgaWYgKGJ1Y2tldE1vdmVzLmxlbmd0aCA+IDAgJiYgY29uZmlnW2J1Y2tldF0gPiAwKSB7XG4gICAgICBhdmFpbGFibGVCdWNrZXRzLnB1c2goeyBidWNrZXQsIG1vdmVzOiBidWNrZXRNb3ZlcyB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXZhaWxhYmxlQnVja2V0cztcbn1cblxuZnVuY3Rpb24gcGlja1dlaWdodGVkQnVja2V0KFxuICB3ZWlnaHRlZEJ1Y2tldHM6IEFycmF5PHsgYnVja2V0OiBNb3ZlQnVja2V0OyB3ZWlnaHQ6IG51bWJlciB9PixcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IsXG4pOiBNb3ZlQnVja2V0IHwgbnVsbCB7XG4gIGNvbnN0IHRvdGFsV2VpZ2h0ID0gd2VpZ2h0ZWRCdWNrZXRzLnJlZHVjZSgoc3VtLCBlbnRyeSkgPT4gc3VtICsgZW50cnkud2VpZ2h0LCAwKTtcblxuICBpZiAodG90YWxXZWlnaHQgPD0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbGV0IHNlbGVjdGlvbiA9IHJhbmRvbSgpICogdG90YWxXZWlnaHQ7XG5cbiAgZm9yIChjb25zdCBlbnRyeSBvZiB3ZWlnaHRlZEJ1Y2tldHMpIHtcbiAgICBzZWxlY3Rpb24gLT0gZW50cnkud2VpZ2h0O1xuICAgIGlmIChzZWxlY3Rpb24gPD0gMCkge1xuICAgICAgcmV0dXJuIGVudHJ5LmJ1Y2tldDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gd2VpZ2h0ZWRCdWNrZXRzW3dlaWdodGVkQnVja2V0cy5sZW5ndGggLSAxXT8uYnVja2V0ID8/IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWNrQnVja2V0TGVnYWN5KFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgY29uZmlnOiBCdWNrZXRDb25maWcgPSBERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gIHJhbmRvbTogUmFuZG9tTnVtYmVyR2VuZXJhdG9yID0gTWF0aC5yYW5kb20sXG4pOiBCdWNrZXRTZWxlY3Rpb24gfCBudWxsIHtcbiAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgYXZhaWxhYmxlQnVja2V0cyA9IGdldEF2YWlsYWJsZUJ1Y2tldHMobW92ZXMsIGNvbmZpZyk7XG4gIGlmIChhdmFpbGFibGVCdWNrZXRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBidWNrZXQ6IG1vdmVzWzBdLmJ1Y2tldCxcbiAgICAgIG1vdmVzOiBbbW92ZXNbMF1dLFxuICAgIH07XG4gIH1cblxuICBjb25zdCB3ZWlnaHRlZEJ1Y2tldHMgPSBhdmFpbGFibGVCdWNrZXRzLm1hcCgoZW50cnkpID0+ICh7XG4gICAgYnVja2V0OiBlbnRyeS5idWNrZXQsXG4gICAgd2VpZ2h0OiBjb25maWdbZW50cnkuYnVja2V0XSxcbiAgfSkpO1xuICBjb25zdCBzZWxlY3RlZEJ1Y2tldCA9IHBpY2tXZWlnaHRlZEJ1Y2tldCh3ZWlnaHRlZEJ1Y2tldHMsIHJhbmRvbSk7XG5cbiAgaWYgKCFzZWxlY3RlZEJ1Y2tldCkge1xuICAgIHJldHVybiBhdmFpbGFibGVCdWNrZXRzWzBdO1xuICB9XG5cbiAgcmV0dXJuIGF2YWlsYWJsZUJ1Y2tldHMuZmluZCgoZW50cnkpID0+IGVudHJ5LmJ1Y2tldCA9PT0gc2VsZWN0ZWRCdWNrZXQpID8/IGF2YWlsYWJsZUJ1Y2tldHNbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWNrQnVja2V0V2l0aENsb3Nlc3RGYWxsYmFjayhcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnID0gREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICByYW5kb206IFJhbmRvbU51bWJlckdlbmVyYXRvciA9IE1hdGgucmFuZG9tLFxuKTogQnVja2V0U2VsZWN0aW9uIHwgbnVsbCB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IGdyb3VwZWQgPSBncm91cE1vdmVzQnlCdWNrZXQobW92ZXMpO1xuICBjb25zdCB3ZWlnaHRlZEJ1Y2tldHMgPSBnZXRCdWNrZXRPcmRlcigpXG4gICAgLmZpbHRlcigoYnVja2V0KSA9PiBjb25maWdbYnVja2V0XSA+IDApXG4gICAgLm1hcCgoYnVja2V0KSA9PiAoeyBidWNrZXQsIHdlaWdodDogY29uZmlnW2J1Y2tldF0gfSkpO1xuICBjb25zdCBzZWxlY3RlZEJ1Y2tldCA9IHBpY2tXZWlnaHRlZEJ1Y2tldCh3ZWlnaHRlZEJ1Y2tldHMsIHJhbmRvbSk7XG5cbiAgaWYgKCFzZWxlY3RlZEJ1Y2tldCkge1xuICAgIHJldHVybiBwaWNrQnVja2V0TGVnYWN5KG1vdmVzLCBjb25maWcsIHJhbmRvbSk7XG4gIH1cblxuICBjb25zdCBzZWxlY3RlZE1vdmVzID0gZ3JvdXBlZC5nZXQoc2VsZWN0ZWRCdWNrZXQpIHx8IFtdO1xuICBpZiAoc2VsZWN0ZWRNb3Zlcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJ1Y2tldDogc2VsZWN0ZWRCdWNrZXQsXG4gICAgICBtb3Zlczogc2VsZWN0ZWRNb3ZlcyxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgYXZhaWxhYmxlQnVja2V0cyA9IGdldEJ1Y2tldE9yZGVyKCkuZmlsdGVyKChidWNrZXQpID0+IChncm91cGVkLmdldChidWNrZXQpIHx8IFtdKS5sZW5ndGggPiAwKTtcbiAgY29uc3QgZmFsbGJhY2tCdWNrZXQgPSBmaW5kQ2xvc2VzdEF2YWlsYWJsZUJ1Y2tldChzZWxlY3RlZEJ1Y2tldCwgYXZhaWxhYmxlQnVja2V0cyk7XG4gIGlmICghZmFsbGJhY2tCdWNrZXQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYnVja2V0OiBmYWxsYmFja0J1Y2tldCxcbiAgICBtb3ZlczogZ3JvdXBlZC5nZXQoZmFsbGJhY2tCdWNrZXQpIHx8IFtdLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja1JhbmRvbU1vdmVGcm9tQnVja2V0KFxuICBidWNrZXRTZWxlY3Rpb246IEJ1Y2tldFNlbGVjdGlvbixcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IgPSBNYXRoLnJhbmRvbSxcbik6IENsYXNzaWZpZWRNb3ZlIHtcbiAgY29uc3QgcmFuZG9tTW92ZUluZGV4ID0gTWF0aC5mbG9vcihyYW5kb20oKSAqIGJ1Y2tldFNlbGVjdGlvbi5tb3Zlcy5sZW5ndGgpO1xuICByZXR1cm4gYnVja2V0U2VsZWN0aW9uLm1vdmVzW3JhbmRvbU1vdmVJbmRleF07XG59XG5cbi8qKlxuICogUGljayBhIG1vdmUgYmFzZWQgb24gYnVja2V0IGNvbmZpZ3VyYXRpb24gKHdlaWdodGVkIHJhbmRvbSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBpY2tNb3ZlKFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSwgXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnID0gREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICByYW5kb206IFJhbmRvbU51bWJlckdlbmVyYXRvciA9IE1hdGgucmFuZG9tLFxuKTogUGlja2VkTW92ZVJlc3VsdCB8IG51bGwge1xuICBjb25zdCBzZWxlY3RlZEJ1Y2tldCA9IHBpY2tCdWNrZXRMZWdhY3kobW92ZXMsIGNvbmZpZywgcmFuZG9tKTtcbiAgaWYgKCFzZWxlY3RlZEJ1Y2tldCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IHNlbGVjdGVkTW92ZSA9IHBpY2tSYW5kb21Nb3ZlRnJvbUJ1Y2tldChzZWxlY3RlZEJ1Y2tldCwgcmFuZG9tKTtcblxuICByZXR1cm4ge1xuICAgIG1vdmU6IHNlbGVjdGVkTW92ZSxcbiAgICBidWNrZXQ6IHNlbGVjdGVkQnVja2V0LmJ1Y2tldCxcbiAgfTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYnVja2V0IGNvbmZpZyBzbyBwZXJjZW50YWdlcyBzdW0gdG8gMTAwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVCdWNrZXRDb25maWcoY29uZmlnOiBCdWNrZXRDb25maWcpOiBCdWNrZXRDb25maWcge1xuICBjb25zdCB0b3RhbCA9IE9iamVjdC52YWx1ZXMoY29uZmlnKS5yZWR1Y2UoKHN1bSwgdmFsKSA9PiBzdW0gKyB2YWwsIDApO1xuICBcbiAgaWYgKHRvdGFsID09PSAwIHx8IHRvdGFsID09PSAxMDApIHtcbiAgICByZXR1cm4gY29uZmlnO1xuICB9XG4gIFxuICBjb25zdCBmYWN0b3IgPSAxMDAgLyB0b3RhbDtcbiAgXG4gIHJldHVybiB7XG4gICAgYmVzdDogTWF0aC5yb3VuZChjb25maWcuYmVzdCAqIGZhY3RvciksXG4gICAgZ3JlYXQ6IE1hdGgucm91bmQoY29uZmlnLmdyZWF0ICogZmFjdG9yKSxcbiAgICBleGNlbGxlbnQ6IE1hdGgucm91bmQoY29uZmlnLmV4Y2VsbGVudCAqIGZhY3RvciksXG4gICAgZ29vZDogTWF0aC5yb3VuZChjb25maWcuZ29vZCAqIGZhY3RvciksXG4gICAgaW5hY2N1cmFjeTogTWF0aC5yb3VuZChjb25maWcuaW5hY2N1cmFjeSAqIGZhY3RvciksXG4gICAgbWlzdGFrZTogTWF0aC5yb3VuZChjb25maWcubWlzdGFrZSAqIGZhY3RvciksXG4gICAgYmx1bmRlcjogTWF0aC5yb3VuZChjb25maWcuYmx1bmRlciAqIGZhY3RvciksXG4gIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGUgYnVja2V0IGNvbmZpZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVCdWNrZXRDb25maWcoY29uZmlnOiBCdWNrZXRDb25maWcpOiB7IHZhbGlkOiBib29sZWFuOyB0b3RhbDogbnVtYmVyIH0ge1xuICBjb25zdCB0b3RhbCA9IE9iamVjdC52YWx1ZXMoY29uZmlnKS5yZWR1Y2UoKHN1bSwgdmFsKSA9PiBzdW0gKyB2YWwsIDApO1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiB0b3RhbCA9PT0gMTAwLFxuICAgIHRvdGFsLFxuICB9O1xufVxuXG4vKipcbiAqIEdldCBwcm9iYWJpbGl0eSBvZiBwaWNraW5nIGZyb20gZWFjaCBidWNrZXQgZ2l2ZW4gY3VycmVudCBjb25maWcgYW5kIGF2YWlsYWJsZSBtb3Zlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWZmZWN0aXZlUHJvYmFiaWxpdGllcyhcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnXG4pOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gIGNvbnN0IGdyb3VwZWQgPSBncm91cE1vdmVzQnlCdWNrZXQobW92ZXMpO1xuICBcbiAgY29uc3QgcHJvYmFiaWxpdGllczogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4gPSB7XG4gICAgYmVzdDogMCxcbiAgICBncmVhdDogMCxcbiAgICBleGNlbGxlbnQ6IDAsXG4gICAgZ29vZDogMCxcbiAgICBpbmFjY3VyYWN5OiAwLFxuICAgIG1pc3Rha2U6IDAsXG4gICAgYmx1bmRlcjogMCxcbiAgfTtcbiAgXG4gIC8vIENhbGN1bGF0ZSBlZmZlY3RpdmUgd2VpZ2h0cyAob25seSBidWNrZXRzIHdpdGggbW92ZXMpXG4gIGxldCB0b3RhbEVmZmVjdGl2ZVdlaWdodCA9IDA7XG4gIGNvbnN0IGJ1Y2tldHM6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnLCAnZ29vZCcsICdpbmFjY3VyYWN5JywgJ21pc3Rha2UnLCAnYmx1bmRlciddO1xuICBcbiAgZm9yIChjb25zdCBidWNrZXQgb2YgYnVja2V0cykge1xuICAgIGNvbnN0IGJ1Y2tldE1vdmVzID0gZ3JvdXBlZC5nZXQoYnVja2V0KSB8fCBbXTtcbiAgICBpZiAoYnVja2V0TW92ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdG90YWxFZmZlY3RpdmVXZWlnaHQgKz0gY29uZmlnW2J1Y2tldF07XG4gICAgfVxuICB9XG4gIFxuICBpZiAodG90YWxFZmZlY3RpdmVXZWlnaHQgPT09IDApIHtcbiAgICByZXR1cm4gcHJvYmFiaWxpdGllcztcbiAgfVxuICBcbiAgLy8gQ2FsY3VsYXRlIG5vcm1hbGl6ZWQgcHJvYmFiaWxpdGllc1xuICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBidWNrZXRzKSB7XG4gICAgY29uc3QgYnVja2V0TW92ZXMgPSBncm91cGVkLmdldChidWNrZXQpIHx8IFtdO1xuICAgIGlmIChidWNrZXRNb3Zlcy5sZW5ndGggPiAwKSB7XG4gICAgICBwcm9iYWJpbGl0aWVzW2J1Y2tldF0gPSAoY29uZmlnW2J1Y2tldF0gLyB0b3RhbEVmZmVjdGl2ZVdlaWdodCkgKiAxMDA7XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gcHJvYmFiaWxpdGllcztcbn1cbiIsICJpbXBvcnQgeyBNb3ZlUXVhbGl0eVByZXNldElkIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmVhdHVyZU9wdGlvbnMge1xuICBzZWN1cml0eURldlRvb2xzT25seTogYm9vbGVhbjtcbiAgcGVyc2lzdEVuZ2luZUNvbmZpZzogYm9vbGVhbjtcbiAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogYm9vbGVhbjtcbiAgdXNlTW92ZUFuYWx5c2lzQ2FjaGU6IGJvb2xlYW47XG4gIHVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uOiBib29sZWFuO1xuICB1c2VQb3NpdGlvbkNvbXBsZXhpdHk6IGJvb2xlYW47XG4gIHVzZVBlcnNvbmFCZWhhdmlvckJpYXM6IGJvb2xlYW47XG4gIHVzZUh1bWFuRGVsYXlTaW11bGF0aW9uOiBib29sZWFuO1xuICB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0OiBib29sZWFuO1xufVxuXG5leHBvcnQgdHlwZSBGZWF0dXJlT3B0aW9uS2V5ID0ga2V5b2YgRmVhdHVyZU9wdGlvbnM7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmVhdHVyZU9wdGlvbkRlc2NyaXB0b3Ige1xuICBrZXk6IEZlYXR1cmVPcHRpb25LZXk7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFBlcnNvbmFJZCA9IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCAnY3VzdG9tJztcbmV4cG9ydCB0eXBlIEJyaWxsaWFudE1vdmVzUGVyR2FtZSA9IDAgfCAxIHwgMiB8IDMgfCA0O1xuZXhwb3J0IHR5cGUgQnJpbGxpYW50QWxsb3dlZFBoYXNlID0gJ29wZW5pbmcnIHwgJ21pZGRsZWdhbWUnIHwgJ2VuZGdhbWUnIHwgJ2FueSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyB7XG4gIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogQnJpbGxpYW50TW92ZXNQZXJHYW1lO1xuICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IEJyaWxsaWFudEFsbG93ZWRQaGFzZTtcbiAgYnJpbGxpYW50VXNlZENvdW50OiBudW1iZXI7XG4gIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBudW1iZXJbXTtcbiAgZ2FtZVNlc3Npb25JZDogc3RyaW5nIHwgbnVsbDtcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfRkVBVFVSRV9PUFRJT05TOiBGZWF0dXJlT3B0aW9ucyA9IHtcbiAgc2VjdXJpdHlEZXZUb29sc09ubHk6IHRydWUsXG4gIHBlcnNpc3RFbmdpbmVDb25maWc6IHRydWUsXG4gIHVzZURldGVybWluaXN0aWNSbmc6IGZhbHNlLFxuICB1c2VNb3ZlQW5hbHlzaXNDYWNoZTogdHJ1ZSxcbiAgdXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb246IHRydWUsXG4gIHVzZVBvc2l0aW9uQ29tcGxleGl0eTogZmFsc2UsXG4gIHVzZVBlcnNvbmFCZWhhdmlvckJpYXM6IGZhbHNlLFxuICB1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbjogZmFsc2UsXG4gIHVzZUJyaWxsaWFudE1vdmVCdWRnZXQ6IGZhbHNlLFxufTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRzogQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyA9IHtcbiAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAwLFxuICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6ICdhbnknLFxuICBicmlsbGlhbnRVc2VkQ291bnQ6IDAsXG4gIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBbXSxcbiAgZ2FtZVNlc3Npb25JZDogbnVsbCxcbn07XG5cbmV4cG9ydCBjb25zdCBGRUFUVVJFX09QVElPTl9ERVNDUklQVE9SUzogRmVhdHVyZU9wdGlvbkRlc2NyaXB0b3JbXSA9IFtcbiAge1xuICAgIGtleTogJ3NlY3VyaXR5RGV2VG9vbHNPbmx5JyxcbiAgICBsYWJlbDogJ0RldlRvb2xzIE9ubHkgSW4gRGV2ZWxvcG1lbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnT3BlbiBDaHJvbWl1bSBEZXZUb29scyBvbmx5IGluIGRldmVsb3BtZW50IG1vZGUuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3BlcnNpc3RFbmdpbmVDb25maWcnLFxuICAgIGxhYmVsOiAnUGVyc2lzdCBFbmdpbmUgQ29uZmlndXJhdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdTYXZlIGRlcHRoLCBNdWx0aVBWLCBwcmVzZXRzLCBidWNrZXQgd2VpZ2h0cywgYW5kIGFkdmFuY2VkIGZlYXR1cmUgb3B0aW9ucy4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlRGV0ZXJtaW5pc3RpY1JuZycsXG4gICAgbGFiZWw6ICdEZXRlcm1pbmlzdGljIFJORycsXG4gICAgZGVzY3JpcHRpb246ICdVc2UgYSBzZWVkZWQgcmFuZG9tIHNvdXJjZSBzbyBtb3ZlIHNlbGVjdGlvbiBpcyByZXByb2R1Y2libGUuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZU1vdmVBbmFseXNpc0NhY2hlJyxcbiAgICBsYWJlbDogJ0FuYWx5c2lzIENhY2hlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1JldXNlIFN0b2NrZmlzaCBhbmFseXNpcyBmb3IgdGhlIHNhbWUgRkVOLCBkZXB0aCwgYW5kIE11bHRpUFYgc2V0dGluZ3MuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uJyxcbiAgICBsYWJlbDogJ0ltcHJvdmVkIE1vdmUgQ2xhc3NpZmljYXRpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnS2VlcCB1bmtub3duIG1vdmVzIHNlcGFyYXRlIGFuZCB1c2Ugc21hcnRlciBidWNrZXQgZmFsbGJhY2sgc2VsZWN0aW9uLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VQb3NpdGlvbkNvbXBsZXhpdHknLFxuICAgIGxhYmVsOiAnUG9zaXRpb24gQ29tcGxleGl0eScsXG4gICAgZGVzY3JpcHRpb246ICdBZGp1c3QgbW92ZSBxdWFsaXR5IHdlaWdodHMgYmFzZWQgb24gaG93IHNoYXJwIHRoZSBjdXJyZW50IHBvc2l0aW9uIGlzLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VQZXJzb25hQmVoYXZpb3JCaWFzJyxcbiAgICBsYWJlbDogJ1BlcnNvbmEgQmVoYXZpb3IgQmlhcycsXG4gICAgZGVzY3JpcHRpb246ICdMYXllciBzaW1wbGUgYWdncmVzc2l2ZSBvciBzYWZlIG1vdmUgcHJlZmVyZW5jZXMgb24gdG9wIG9mIGJ1Y2tldCBzZWxlY3Rpb24uJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZUh1bWFuRGVsYXlTaW11bGF0aW9uJyxcbiAgICBsYWJlbDogJ0h1bWFuIERlbGF5IFNpbXVsYXRpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVsYXkgYXV0by1wbGF5IG1vdmVzIGJhc2VkIG9uIGNvbXBsZXhpdHksIHBlcnNvbmEsIGFuZCBjaG9zZW4gbW92ZSBxdWFsaXR5LicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0JyxcbiAgICBsYWJlbDogJ0JyaWxsaWFudCBNb3ZlIEJ1ZGdldCcsXG4gICAgZGVzY3JpcHRpb246ICdSZXNlcnZlIGEgZml4ZWQgbnVtYmVyIG9mIHRhY3RpY2FsIGJyaWxsaWFudCBtb3ZlcyBmb3IgZWFjaCBnYW1lLicsXG4gIH0sXG5dO1xuXG5leHBvcnQgY29uc3QgRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19mZWF0dXJlX29wdGlvbnMnO1xuZXhwb3J0IGNvbnN0IEVOR0lORV9DT05GSUdfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX2VuZ2luZV9jb25maWcnO1xuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VGZWF0dXJlT3B0aW9ucyhcbiAgcGFydGlhbD86IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+IHwgbnVsbCxcbik6IEZlYXR1cmVPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyxcbiAgICAuLi4ocGFydGlhbCA/PyB7fSksXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcoXG4gIHBhcnRpYWw/OiBQYXJ0aWFsPEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWc+IHwgbnVsbCxcbik6IEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcge1xuICByZXR1cm4ge1xuICAgIC4uLkRFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRyxcbiAgICAuLi4ocGFydGlhbCA/PyB7fSksXG4gICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IHBhcnRpYWw/LmJyaWxsaWFudE1vdmVOdW1iZXJzID8/IERFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRy5icmlsbGlhbnRNb3ZlTnVtYmVycyxcbiAgICBnYW1lU2Vzc2lvbklkOiBwYXJ0aWFsPy5nYW1lU2Vzc2lvbklkID8/IERFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRy5nYW1lU2Vzc2lvbklkLFxuICB9O1xufVxuIiwgImltcG9ydCB7IGFjdGlvbiwgbWFrZUF1dG9PYnNlcnZhYmxlLCByZWFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgQnJpbGxpYW50QWxsb3dlZFBoYXNlLFxuICBCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnLFxuICBCcmlsbGlhbnRNb3Zlc1BlckdhbWUsXG4gIERFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRyxcbiAgREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gIEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSxcbiAgRmVhdHVyZU9wdGlvbktleSxcbiAgRmVhdHVyZU9wdGlvbnMsXG4gIG1lcmdlQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyxcbiAgbWVyZ2VGZWF0dXJlT3B0aW9ucyxcbn0gZnJvbSAnLi4vZW5naW5lL2ZlYXR1cmVPcHRpb25zJztcblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgV2luZG93IHtcbiAgICBwZXJzb25hQ2hlc3NCcmlkZ2U/OiB7XG4gICAgICBzeW5jRmVhdHVyZU9wdGlvbnM6IChvcHRpb25zOiBGZWF0dXJlT3B0aW9ucykgPT4gdm9pZDtcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB7XG4gIG9wdGlvbnM6IEZlYXR1cmVPcHRpb25zID0geyAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyB9O1xuICBicmlsbGlhbnRDb25maWc6IEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcgPSB7IC4uLkRFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRyB9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXRPcHRpb246IGFjdGlvbixcbiAgICAgIHNldE9wdGlvbnM6IGFjdGlvbixcbiAgICAgIGFwcGx5UHJvZmlsZVNldHRpbmdzOiBhY3Rpb24sXG4gICAgICBzZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWU6IGFjdGlvbixcbiAgICAgIHNldEJyaWxsaWFudEFsbG93ZWRQaGFzZTogYWN0aW9uLFxuICAgICAgcmVjb25jaWxlQnJpbGxpYW50VHJhY2tpbmc6IGFjdGlvbixcbiAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IGFjdGlvbixcbiAgICAgIHJlc2V0VG9EZWZhdWx0czogYWN0aW9uLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZXN0b3JlRnJvbVN0b3JhZ2UoKTtcblxuICAgIHJlYWN0aW9uKFxuICAgICAgKCkgPT4gKHtcbiAgICAgICAgb3B0aW9uczogeyAuLi50aGlzLm9wdGlvbnMgfSxcbiAgICAgICAgYnJpbGxpYW50Q29uZmlnOiB7XG4gICAgICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICAgICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IFsuLi50aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3ZlTnVtYmVyc10sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIChzbmFwc2hvdCkgPT4ge1xuICAgICAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICAgICAgdGhpcy5zeW5jVG9NYWluUHJvY2VzcyhzbmFwc2hvdC5vcHRpb25zKTtcbiAgICAgIH0sXG4gICAgICB7IGZpcmVJbW1lZGlhdGVseTogdHJ1ZSB9LFxuICAgICk7XG4gIH1cblxuICBzZXRPcHRpb248S2V5IGV4dGVuZHMgRmVhdHVyZU9wdGlvbktleT4oa2V5OiBLZXksIHZhbHVlOiBGZWF0dXJlT3B0aW9uc1tLZXldKTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgW2tleV06IHZhbHVlLFxuICAgIH07XG5cbiAgICBpZiAoa2V5ID09PSAncGVyc2lzdEVuZ2luZUNvbmZpZycgJiYgdmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpO1xuICAgIH1cbiAgfVxuXG4gIHNldE9wdGlvbnMob3B0aW9uczogUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4pOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZUZlYXR1cmVPcHRpb25zKHtcbiAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSk7XG4gIH1cblxuICBhcHBseVByb2ZpbGVTZXR0aW5ncyhcbiAgICBvcHRpb25zOiBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPixcbiAgICBicmlsbGlhbnRTZXR0aW5nczogUGFydGlhbDxQaWNrPEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcsICdicmlsbGlhbnRNb3Zlc1BlckdhbWUnIHwgJ2JyaWxsaWFudEFsbG93ZWRQaGFzZSc+PixcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyh7XG4gICAgICAuLi50aGlzLm9wdGlvbnMsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IGJyaWxsaWFudFNldHRpbmdzLmJyaWxsaWFudE1vdmVzUGVyR2FtZSA/PyB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWUsXG4gICAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IGJyaWxsaWFudFNldHRpbmdzLmJyaWxsaWFudEFsbG93ZWRQaGFzZSA/PyB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRBbGxvd2VkUGhhc2UsXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRVc2VkQ291bnQgPiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWUpIHtcbiAgICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgICAgYnJpbGxpYW50VXNlZENvdW50OiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWUsXG4gICAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3ZlTnVtYmVycy5zbGljZSgwLCB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWUpLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBzZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWUodmFsdWU6IEJyaWxsaWFudE1vdmVzUGVyR2FtZSk6IHZvaWQge1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IHZhbHVlLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50ID4gdmFsdWUpIHtcbiAgICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgICAgYnJpbGxpYW50VXNlZENvdW50OiB2YWx1ZSxcbiAgICAgICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVOdW1iZXJzLnNsaWNlKDAsIHZhbHVlKSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgc2V0QnJpbGxpYW50QWxsb3dlZFBoYXNlKHZhbHVlOiBCcmlsbGlhbnRBbGxvd2VkUGhhc2UpOiB2b2lkIHtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiB2YWx1ZSxcbiAgICB9O1xuICB9XG5cbiAgcmVjb25jaWxlQnJpbGxpYW50VHJhY2tpbmcoXG4gICAgZ2FtZVNlc3Npb25JZDogc3RyaW5nLFxuICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBudW1iZXJbXSxcbiAgKTogdm9pZCB7XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgIGdhbWVTZXNzaW9uSWQsXG4gICAgICBicmlsbGlhbnRVc2VkQ291bnQ6IGJyaWxsaWFudE1vdmVOdW1iZXJzLmxlbmd0aCxcbiAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBbLi4uYnJpbGxpYW50TW92ZU51bWJlcnNdLFxuICAgIH07XG4gIH1cblxuICByZXNldEJyaWxsaWFudFRyYWNraW5nKGdhbWVTZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgIGdhbWVTZXNzaW9uSWQsXG4gICAgICBicmlsbGlhbnRVc2VkQ291bnQ6IDAsXG4gICAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogW10sXG4gICAgfTtcbiAgfVxuXG4gIHJlc2V0VG9EZWZhdWx0cygpOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB7IC4uLkRFRkFVTFRfRkVBVFVSRV9PUFRJT05TIH07XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7IC4uLkRFRkFVTFRfQlJJTExJQU5UX01PVkVfQlVER0VUX0NPTkZJRyB9O1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZKTtcbiAgICAgIGlmICghc2F2ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHNhdmVkKSBhc1xuICAgICAgICB8IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+XG4gICAgICAgIHwgeyBvcHRpb25zPzogUGFydGlhbDxGZWF0dXJlT3B0aW9ucz47IGJyaWxsaWFudENvbmZpZz86IFBhcnRpYWw8QnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZz4gfTtcblxuICAgICAgaWYgKCdvcHRpb25zJyBpbiBwYXJzZWQgfHwgJ2JyaWxsaWFudENvbmZpZycgaW4gcGFyc2VkKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlRmVhdHVyZU9wdGlvbnMocGFyc2VkLm9wdGlvbnMpO1xuICAgICAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IG1lcmdlQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyhwYXJzZWQuYnJpbGxpYW50Q29uZmlnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZUZlYXR1cmVPcHRpb25zKHBhcnNlZCBhcyBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHJlc3RvcmUgZmVhdHVyZSBvcHRpb25zOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLnBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIGJyaWxsaWFudENvbmZpZzogdGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0ZlYXR1cmVPcHRpb25zVmlld01vZGVsXSBGYWlsZWQgdG8gcGVyc2lzdCBmZWF0dXJlIG9wdGlvbnM6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJQZXJzaXN0ZWRTdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShGRUFUVVJFX09QVElPTlNfU1RPUkFHRV9LRVkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWxdIEZhaWxlZCB0byBjbGVhciBmZWF0dXJlIG9wdGlvbnMgc3RvcmFnZTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzeW5jVG9NYWluUHJvY2VzcyhvcHRpb25zOiBGZWF0dXJlT3B0aW9ucyk6IHZvaWQge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcmlhbGl6YWJsZU9wdGlvbnMgPSBtZXJnZUZlYXR1cmVPcHRpb25zKHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSk7XG5cbiAgICB3aW5kb3cucGVyc29uYUNoZXNzQnJpZGdlPy5zeW5jRmVhdHVyZU9wdGlvbnMoc2VyaWFsaXphYmxlT3B0aW9ucyk7XG4gIH1cblxuICBnZXQgc2VjdXJpdHlEZXZUb29sc09ubHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5zZWN1cml0eURldlRvb2xzT25seTtcbiAgfVxuXG4gIGdldCBwZXJzaXN0RW5naW5lQ29uZmlnKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMucGVyc2lzdEVuZ2luZUNvbmZpZztcbiAgfVxuXG4gIGdldCB1c2VEZXRlcm1pbmlzdGljUm5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlRGV0ZXJtaW5pc3RpY1JuZztcbiAgfVxuXG4gIGdldCB1c2VNb3ZlQW5hbHlzaXNDYWNoZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZU1vdmVBbmFseXNpc0NhY2hlO1xuICB9XG5cbiAgZ2V0IHVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb247XG4gIH1cblxuICBnZXQgdXNlUG9zaXRpb25Db21wbGV4aXR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlUG9zaXRpb25Db21wbGV4aXR5O1xuICB9XG5cbiAgZ2V0IHVzZVBlcnNvbmFCZWhhdmlvckJpYXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VQZXJzb25hQmVoYXZpb3JCaWFzO1xuICB9XG5cbiAgZ2V0IHVzZUh1bWFuRGVsYXlTaW11bGF0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlSHVtYW5EZWxheVNpbXVsYXRpb247XG4gIH1cblxuICBnZXQgdXNlQnJpbGxpYW50TW92ZUJ1ZGdldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZUJyaWxsaWFudE1vdmVCdWRnZXQ7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50TW92ZXNQZXJHYW1lKCk6IEJyaWxsaWFudE1vdmVzUGVyR2FtZSB7XG4gICAgcmV0dXJuIHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVzUGVyR2FtZTtcbiAgfVxuXG4gIGdldCBicmlsbGlhbnRBbGxvd2VkUGhhc2UoKTogQnJpbGxpYW50QWxsb3dlZFBoYXNlIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50QWxsb3dlZFBoYXNlO1xuICB9XG5cbiAgZ2V0IGJyaWxsaWFudFVzZWRDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRVc2VkQ291bnQ7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50TW92ZU51bWJlcnMoKTogbnVtYmVyW10ge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3ZlTnVtYmVycztcbiAgfVxuXG4gIGdldCBicmlsbGlhbnRHYW1lU2Vzc2lvbklkKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5nYW1lU2Vzc2lvbklkO1xuICB9XG5cbiAgZ2V0IGhhc1JlbWFpbmluZ0JyaWxsaWFudE1vdmVzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRVc2VkQ291bnQgPCB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGZlYXR1cmVPcHRpb25zVmlld01vZGVsID0gbmV3IEZlYXR1cmVPcHRpb25zVmlld01vZGVsKCk7XG4iLCAiaW1wb3J0IHsgQ2hlc3MsIFBpZWNlU3ltYm9sIH0gZnJvbSAnY2hlc3MuanMnO1xuaW1wb3J0IHsgQ2xhc3NpZmllZE1vdmUsIE1vdmVCdWNrZXQgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFJhbmRvbVNvdXJjZSB9IGZyb20gJy4vcmFuZG9tJztcblxuZXhwb3J0IGludGVyZmFjZSBCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlIHtcbiAgbW92ZTogQ2xhc3NpZmllZE1vdmU7XG4gIHRhY3RpY2FsU2NvcmU6IG51bWJlcjtcbn1cblxuY29uc3QgUElFQ0VfVkFMVUVTOiBSZWNvcmQ8UGllY2VTeW1ib2wsIG51bWJlcj4gPSB7XG4gIHA6IDEsXG4gIG46IDMsXG4gIGI6IDMsXG4gIHI6IDUsXG4gIHE6IDksXG4gIGs6IDAsXG59O1xuXG5jb25zdCBCUklMTElBTlRfQlVDS0VUUzogTW92ZUJ1Y2tldFtdID0gWydiZXN0JywgJ2dyZWF0J107XG5cbmZ1bmN0aW9uIGdldFBpZWNlVmFsdWUodHlwZT86IFBpZWNlU3ltYm9sKTogbnVtYmVyIHtcbiAgcmV0dXJuIHR5cGUgPyBQSUVDRV9WQUxVRVNbdHlwZV0gOiAwO1xufVxuXG5mdW5jdGlvbiBnZXRUYWN0aWNhbFNjb3JlKGZlbjogc3RyaW5nLCBtb3ZlOiBDbGFzc2lmaWVkTW92ZSwgYmVzdEV2YWx1YXRpb246IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGNoZXNzID0gbmV3IENoZXNzKGZlbik7XG4gIGNvbnN0IGZyb20gPSBtb3ZlLm1vdmUuc2xpY2UoMCwgMik7XG4gIGNvbnN0IHRvID0gbW92ZS5tb3ZlLnNsaWNlKDIsIDQpO1xuICBjb25zdCBtb3ZpbmdQaWVjZSA9IGNoZXNzLmdldChmcm9tKTtcbiAgY29uc3QgdGFyZ2V0UGllY2UgPSBjaGVzcy5nZXQodG8pO1xuICBjb25zdCBwbGF5ZWRNb3ZlID0gY2hlc3MubW92ZSh7XG4gICAgZnJvbSxcbiAgICB0byxcbiAgICBwcm9tb3Rpb246IG1vdmUubW92ZVs0XSBhcyAncScgfCAncicgfCAnYicgfCAnbicgfCB1bmRlZmluZWQsXG4gIH0pO1xuXG4gIGlmICghcGxheWVkTW92ZSkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgY29uc3QgaXNDYXB0dXJlID0gcGxheWVkTW92ZS5mbGFncy5pbmNsdWRlcygnYycpIHx8IHBsYXllZE1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2UnKTtcbiAgY29uc3QgaXNQcm9tb3Rpb24gPSBCb29sZWFuKHBsYXllZE1vdmUucHJvbW90aW9uKTtcbiAgY29uc3QgaXNDaGVjayA9IGNoZXNzLmlzQ2hlY2soKTtcbiAgY29uc3QgZXZhbEdhaW4gPSBNYXRoLm1heCgwLCBiZXN0RXZhbHVhdGlvbiAtIG1vdmUuZXZhbHVhdGlvbik7XG4gIGNvbnN0IG1hdGVyaWFsU3dpbmcgPSBnZXRQaWVjZVZhbHVlKHRhcmdldFBpZWNlPy50eXBlKSAtIGdldFBpZWNlVmFsdWUobW92aW5nUGllY2U/LnR5cGUpO1xuICBjb25zdCBpc1NhY3JpZmljZSA9IGlzQ2FwdHVyZSAmJiBtYXRlcmlhbFN3aW5nIDwgMDtcblxuICBsZXQgdGFjdGljYWxTY29yZSA9IDA7XG4gIHRhY3RpY2FsU2NvcmUgKz0gaXNDaGVjayA/IDIgOiAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGlzQ2FwdHVyZSA/IDEuNSA6IDA7XG4gIHRhY3RpY2FsU2NvcmUgKz0gaXNQcm9tb3Rpb24gPyAyLjUgOiAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGlzU2FjcmlmaWNlID8gMS43NSA6IDA7XG4gIHRhY3RpY2FsU2NvcmUgKz0gZXZhbEdhaW4gPj0gODAgPyAxLjUgOiBldmFsR2FpbiA+PSA0MCA/IDAuNzUgOiAwO1xuXG4gIHJldHVybiB0YWN0aWNhbFNjb3JlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnJpbGxpYW50TW92ZUNhbmRpZGF0ZXMoXG4gIGZlbjogc3RyaW5nLFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbik6IEJyaWxsaWFudE1vdmVDYW5kaWRhdGVbXSB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBiZXN0RXZhbHVhdGlvbiA9IG1vdmVzWzBdLmV2YWx1YXRpb247XG5cbiAgcmV0dXJuIG1vdmVzXG4gICAgLmZpbHRlcihtb3ZlID0+IEJSSUxMSUFOVF9CVUNLRVRTLmluY2x1ZGVzKG1vdmUuYnVja2V0KSlcbiAgICAubWFwKG1vdmUgPT4gKHtcbiAgICAgIG1vdmUsXG4gICAgICB0YWN0aWNhbFNjb3JlOiBnZXRUYWN0aWNhbFNjb3JlKGZlbiwgbW92ZSwgYmVzdEV2YWx1YXRpb24pLFxuICAgIH0pKVxuICAgIC5maWx0ZXIoY2FuZGlkYXRlID0+IGNhbmRpZGF0ZS50YWN0aWNhbFNjb3JlID4gMClcbiAgICAuc29ydCgobGVmdCwgcmlnaHQpID0+IHJpZ2h0LnRhY3RpY2FsU2NvcmUgLSBsZWZ0LnRhY3RpY2FsU2NvcmUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja0JyaWxsaWFudE1vdmUoXG4gIGNhbmRpZGF0ZXM6IEJyaWxsaWFudE1vdmVDYW5kaWRhdGVbXSxcbiAgcmFuZG9tU291cmNlOiBSYW5kb21Tb3VyY2UsXG4pOiBDbGFzc2lmaWVkTW92ZSB8IG51bGwge1xuICBpZiAoY2FuZGlkYXRlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHRvdGFsV2VpZ2h0ID0gY2FuZGlkYXRlcy5yZWR1Y2UoKHN1bSwgY2FuZGlkYXRlKSA9PiBzdW0gKyBjYW5kaWRhdGUudGFjdGljYWxTY29yZSwgMCk7XG4gIGxldCBzZWxlY3Rpb24gPSByYW5kb21Tb3VyY2UubmV4dCgpICogdG90YWxXZWlnaHQ7XG5cbiAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlcykge1xuICAgIHNlbGVjdGlvbiAtPSBjYW5kaWRhdGUudGFjdGljYWxTY29yZTtcbiAgICBpZiAoc2VsZWN0aW9uIDw9IDApIHtcbiAgICAgIHJldHVybiBjYW5kaWRhdGUubW92ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY2FuZGlkYXRlc1tjYW5kaWRhdGVzLmxlbmd0aCAtIDFdLm1vdmU7XG59XG4iLCAiaW1wb3J0IHsgQ2hlc3MsIFBpZWNlU3ltYm9sIH0gZnJvbSAnY2hlc3MuanMnO1xuXG5leHBvcnQgdHlwZSBHYW1lUGhhc2UgPSAnb3BlbmluZycgfCAnbWlkZGxlZ2FtZScgfCAnZW5kZ2FtZSc7XG5cbmNvbnN0IFBJRUNFX1ZBTFVFUzogUmVjb3JkPFBpZWNlU3ltYm9sLCBudW1iZXI+ID0ge1xuICBwOiAxLFxuICBuOiAzLFxuICBiOiAzLFxuICByOiA1LFxuICBxOiA5LFxuICBrOiAwLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBHYW1lUGhhc2VSZXN1bHQge1xuICBwaGFzZTogR2FtZVBoYXNlO1xuICB0b3RhbE1hdGVyaWFsOiBudW1iZXI7XG4gIHF1ZWVuc1RyYWRlZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRvdGFsTWF0ZXJpYWwoZmVuOiBzdHJpbmcpOiBudW1iZXIge1xuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICByZXR1cm4gY2hlc3NcbiAgICAuYm9hcmQoKVxuICAgIC5mbGF0KClcbiAgICAucmVkdWNlKCh0b3RhbCwgcGllY2UpID0+IHRvdGFsICsgKHBpZWNlID8gUElFQ0VfVkFMVUVTW3BpZWNlLnR5cGVdIDogMCksIDApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJlUXVlZW5zVHJhZGVkKGZlbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNoZXNzID0gbmV3IENoZXNzKGZlbik7XG4gIGNvbnN0IHF1ZWVucyA9IGNoZXNzXG4gICAgLmJvYXJkKClcbiAgICAuZmxhdCgpXG4gICAgLmZpbHRlcihwaWVjZSA9PiBwaWVjZT8udHlwZSA9PT0gJ3EnKS5sZW5ndGg7XG5cbiAgcmV0dXJuIHF1ZWVucyA8IDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RHYW1lUGhhc2UoZmVuOiBzdHJpbmcsIG1vdmVOdW1iZXI6IG51bWJlcik6IEdhbWVQaGFzZVJlc3VsdCB7XG4gIGNvbnN0IHRvdGFsTWF0ZXJpYWwgPSBnZXRUb3RhbE1hdGVyaWFsKGZlbik7XG4gIGNvbnN0IHF1ZWVuc1RyYWRlZCA9IGFyZVF1ZWVuc1RyYWRlZChmZW4pO1xuXG4gIGlmIChtb3ZlTnVtYmVyIDw9IDEwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBoYXNlOiAnb3BlbmluZycsXG4gICAgICB0b3RhbE1hdGVyaWFsLFxuICAgICAgcXVlZW5zVHJhZGVkLFxuICAgIH07XG4gIH1cblxuICBpZiAocXVlZW5zVHJhZGVkIHx8IHRvdGFsTWF0ZXJpYWwgPD0gMjQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGhhc2U6ICdlbmRnYW1lJyxcbiAgICAgIHRvdGFsTWF0ZXJpYWwsXG4gICAgICBxdWVlbnNUcmFkZWQsXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGhhc2U6ICdtaWRkbGVnYW1lJyxcbiAgICB0b3RhbE1hdGVyaWFsLFxuICAgIHF1ZWVuc1RyYWRlZCxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBCdWNrZXRDb25maWcsIE1vdmVCdWNrZXQsIEFuYWx5emVkTW92ZSB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB7XG4gIGxldmVsOiAnbG93JyB8ICdtZWRpdW0nIHwgJ2hpZ2gnO1xuICBzY29yZTogbnVtYmVyO1xuICBzcHJlYWQ6IG51bWJlcjtcbiAgY2xvc2VDYW5kaWRhdGVzOiBudW1iZXI7XG4gIHZvbGF0aWxpdHk6IG51bWJlcjtcbn1cblxuZnVuY3Rpb24gY2xhbXAodmFsdWU6IG51bWJlciwgbWluID0gMCwgbWF4ID0gMSk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLm1pbihtYXgsIE1hdGgubWF4KG1pbiwgdmFsdWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZVBvc2l0aW9uQ29tcGxleGl0eShcbiAgbW92ZXM6IEFuYWx5emVkTW92ZVtdLFxuKTogUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0IHtcbiAgaWYgKG1vdmVzLmxlbmd0aCA8PSAxKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxldmVsOiAnbG93JyxcbiAgICAgIHNjb3JlOiAwLFxuICAgICAgc3ByZWFkOiAwLFxuICAgICAgY2xvc2VDYW5kaWRhdGVzOiBtb3Zlcy5sZW5ndGgsXG4gICAgICB2b2xhdGlsaXR5OiAwLFxuICAgIH07XG4gIH1cblxuICBjb25zdCBldmFsdWF0aW9ucyA9IG1vdmVzLm1hcCgobW92ZSkgPT4gbW92ZS5ldmFsdWF0aW9uKS5zb3J0KChhLCBiKSA9PiBiIC0gYSk7XG4gIGNvbnN0IGJlc3QgPSBldmFsdWF0aW9uc1swXTtcbiAgY29uc3Qgc3ByZWFkID0gTWF0aC5hYnMoYmVzdCAtIGV2YWx1YXRpb25zW2V2YWx1YXRpb25zLmxlbmd0aCAtIDFdKTtcbiAgY29uc3QgY2xvc2VDYW5kaWRhdGVzID0gbW92ZXMuZmlsdGVyKChtb3ZlKSA9PiBNYXRoLmFicyhiZXN0IC0gbW92ZS5ldmFsdWF0aW9uKSA8PSAzNSkubGVuZ3RoO1xuICBjb25zdCB2b2xhdGlsaXR5ID0gbW92ZXMubGVuZ3RoID4gMVxuICAgID8gTWF0aC5hYnMoYmVzdCAtIGV2YWx1YXRpb25zW01hdGgubWluKDIsIGV2YWx1YXRpb25zLmxlbmd0aCAtIDEpXSlcbiAgICA6IDA7XG5cbiAgY29uc3Qgc3ByZWFkRmFjdG9yID0gMSAtIGNsYW1wKHNwcmVhZCAvIDI1MCk7XG4gIGNvbnN0IGNsb3NlRmFjdG9yID0gY2xhbXAoKGNsb3NlQ2FuZGlkYXRlcyAtIDEpIC8gNSk7XG4gIGNvbnN0IHZvbGF0aWxpdHlGYWN0b3IgPSBjbGFtcCh2b2xhdGlsaXR5IC8gMTUwKTtcbiAgY29uc3Qgc2NvcmUgPSBjbGFtcChzcHJlYWRGYWN0b3IgKiAwLjQ1ICsgY2xvc2VGYWN0b3IgKiAwLjM1ICsgdm9sYXRpbGl0eUZhY3RvciAqIDAuMik7XG5cbiAgbGV0IGxldmVsOiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHRbJ2xldmVsJ10gPSAnbWVkaXVtJztcbiAgaWYgKHNjb3JlIDwgMC4zMykgbGV2ZWwgPSAnbG93JztcbiAgaWYgKHNjb3JlID4gMC42NikgbGV2ZWwgPSAnaGlnaCc7XG5cbiAgcmV0dXJuIHtcbiAgICBsZXZlbCxcbiAgICBzY29yZSxcbiAgICBzcHJlYWQsXG4gICAgY2xvc2VDYW5kaWRhdGVzLFxuICAgIHZvbGF0aWxpdHksXG4gIH07XG59XG5cbmNvbnN0IEJVQ0tFVF9PUkRFUjogTW92ZUJ1Y2tldFtdID0gW1xuICAnYmVzdCcsXG4gICdncmVhdCcsXG4gICdleGNlbGxlbnQnLFxuICAnZ29vZCcsXG4gICdpbmFjY3VyYWN5JyxcbiAgJ21pc3Rha2UnLFxuICAnYmx1bmRlcicsXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gYWRqdXN0QnVja2V0Q29uZmlnRm9yQ29tcGxleGl0eShcbiAgY29uZmlnOiBCdWNrZXRDb25maWcsXG4gIGNvbXBsZXhpdHk6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCxcbik6IEJ1Y2tldENvbmZpZyB7XG4gIGNvbnN0IGFkanVzdGVkID0geyAuLi5jb25maWcgfTtcbiAgY29uc3QgaW50ZW5zaXR5ID0gY29tcGxleGl0eS5zY29yZTtcblxuICBpZiAoY29tcGxleGl0eS5sZXZlbCA9PT0gJ2hpZ2gnKSB7XG4gICAgYWRqdXN0ZWQuYmVzdCA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmJlc3QgLSBNYXRoLnJvdW5kKDYgKiBpbnRlbnNpdHkpKTtcbiAgICBhZGp1c3RlZC5ncmVhdCA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmdyZWF0IC0gTWF0aC5yb3VuZCgzICogaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQuaW5hY2N1cmFjeSArPSBNYXRoLnJvdW5kKDQgKiBpbnRlbnNpdHkpO1xuICAgIGFkanVzdGVkLm1pc3Rha2UgKz0gTWF0aC5yb3VuZCgzICogaW50ZW5zaXR5KTtcbiAgICBhZGp1c3RlZC5ibHVuZGVyICs9IE1hdGgucm91bmQoMiAqIGludGVuc2l0eSk7XG4gIH0gZWxzZSBpZiAoY29tcGxleGl0eS5sZXZlbCA9PT0gJ2xvdycpIHtcbiAgICBhZGp1c3RlZC5iZXN0ICs9IE1hdGgucm91bmQoNSAqICgxIC0gaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQuZ3JlYXQgKz0gTWF0aC5yb3VuZCgzICogKDEgLSBpbnRlbnNpdHkpKTtcbiAgICBhZGp1c3RlZC5leGNlbGxlbnQgKz0gTWF0aC5yb3VuZCgyICogKDEgLSBpbnRlbnNpdHkpKTtcbiAgICBhZGp1c3RlZC5taXN0YWtlID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQubWlzdGFrZSAtIDIpO1xuICAgIGFkanVzdGVkLmJsdW5kZXIgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5ibHVuZGVyIC0gMSk7XG4gIH1cblxuICBjb25zdCB0b3RhbCA9IEJVQ0tFVF9PUkRFUi5yZWR1Y2UoKHN1bSwgYnVja2V0KSA9PiBzdW0gKyBhZGp1c3RlZFtidWNrZXRdLCAwKTtcbiAgaWYgKHRvdGFsIDw9IDApIHtcbiAgICByZXR1cm4gY29uZmlnO1xuICB9XG5cbiAgY29uc3Qgbm9ybWFsaXplZCA9IEJVQ0tFVF9PUkRFUi5yZWR1Y2UoKHJlc3VsdCwgYnVja2V0KSA9PiB7XG4gICAgcmVzdWx0W2J1Y2tldF0gPSBNYXRoLnJvdW5kKChhZGp1c3RlZFtidWNrZXRdIC8gdG90YWwpICogMTAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LCB7fSBhcyBCdWNrZXRDb25maWcpO1xuXG4gIGNvbnN0IG5vcm1hbGl6ZWRUb3RhbCA9IEJVQ0tFVF9PUkRFUi5yZWR1Y2UoKHN1bSwgYnVja2V0KSA9PiBzdW0gKyBub3JtYWxpemVkW2J1Y2tldF0sIDApO1xuICBjb25zdCBkaWZmID0gMTAwIC0gbm9ybWFsaXplZFRvdGFsO1xuICBub3JtYWxpemVkLmJlc3QgKz0gZGlmZjtcblxuICByZXR1cm4gbm9ybWFsaXplZDtcbn1cbiIsICJpbXBvcnQgeyBDaGVzcyB9IGZyb20gJ2NoZXNzLmpzJztcbmltcG9ydCB7IFBlcnNvbmFJZCB9IGZyb20gJy4vZmVhdHVyZU9wdGlvbnMnO1xuaW1wb3J0IHsgQ2xhc3NpZmllZE1vdmUsIE1vdmVCdWNrZXQgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFJhbmRvbVNvdXJjZSB9IGZyb20gJy4vcmFuZG9tJztcbmltcG9ydCB7IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB9IGZyb20gJy4vcG9zaXRpb25Db21wbGV4aXR5JztcblxuZXhwb3J0IHR5cGUgUGVyc29uYUJlaGF2aW9yTW9kZSA9ICdhZ2dyZXNzaXZlJyB8ICdzYWZlJyB8ICdiYWxhbmNlZCc7XG5cbmNvbnN0IFNBRkVfQlVDS0VUUzogTW92ZUJ1Y2tldFtdID0gWydiZXN0JywgJ2dyZWF0JywgJ2V4Y2VsbGVudCddO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVyc29uYUJlaGF2aW9yTW9kZShwZXJzb25hOiBQZXJzb25hSWQpOiBQZXJzb25hQmVoYXZpb3JNb2RlIHtcbiAgaWYgKHBlcnNvbmEgPT09ICdhZ2dyZXNzaXZlJykge1xuICAgIHJldHVybiAnYWdncmVzc2l2ZSc7XG4gIH1cblxuICBpZiAocGVyc29uYSA9PT0gJ2hhcmQnIHx8IHBlcnNvbmEgPT09ICdzdXBlcl9oYXJkJykge1xuICAgIHJldHVybiAnc2FmZSc7XG4gIH1cblxuICByZXR1cm4gJ2JhbGFuY2VkJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5UGVyc29uYUJ1Y2tldEJpYXMoXG4gIGNvbmZpZzogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4sXG4gIHBlcnNvbmE6IFBlcnNvbmFJZCxcbik6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+IHtcbiAgY29uc3QgbW9kZSA9IGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYSk7XG4gIGNvbnN0IGFkanVzdGVkID0geyAuLi5jb25maWcgfTtcblxuICBpZiAobW9kZSA9PT0gJ2FnZ3Jlc3NpdmUnKSB7XG4gICAgYWRqdXN0ZWQuZ29vZCArPSAzO1xuICAgIGFkanVzdGVkLmluYWNjdXJhY3kgKz0gMjtcbiAgICBhZGp1c3RlZC5iZXN0ID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuYmVzdCAtIDMpO1xuICAgIGFkanVzdGVkLmdyZWF0ID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuZ3JlYXQgLSAyKTtcbiAgfSBlbHNlIGlmIChtb2RlID09PSAnc2FmZScpIHtcbiAgICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBTQUZFX0JVQ0tFVFMpIHtcbiAgICAgIGFkanVzdGVkW2J1Y2tldF0gKz0gMjtcbiAgICB9XG4gICAgYWRqdXN0ZWQubWlzdGFrZSA9IE1hdGgubWF4KDAsIGFkanVzdGVkLm1pc3Rha2UgLSAyKTtcbiAgICBhZGp1c3RlZC5ibHVuZGVyID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuYmx1bmRlciAtIDIpO1xuICB9XG5cbiAgcmV0dXJuIGFkanVzdGVkO1xufVxuXG5mdW5jdGlvbiBnZXRNb3ZlVHJhaXRTY29yZShmZW46IHN0cmluZywgbW92ZVVjaTogc3RyaW5nLCBwZXJzb25hOiBQZXJzb25hSWQpOiBudW1iZXIge1xuICBjb25zdCBtb2RlID0gZ2V0UGVyc29uYUJlaGF2aW9yTW9kZShwZXJzb25hKTtcbiAgaWYgKG1vZGUgPT09ICdiYWxhbmNlZCcpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IGNoZXNzID0gbmV3IENoZXNzKGZlbik7XG4gIGNvbnN0IG1vdmUgPSBjaGVzcy5tb3ZlKHtcbiAgICBmcm9tOiBtb3ZlVWNpLnNsaWNlKDAsIDIpLFxuICAgIHRvOiBtb3ZlVWNpLnNsaWNlKDIsIDQpLFxuICAgIHByb21vdGlvbjogbW92ZVVjaVs0XSBhcyAncScgfCAncicgfCAnYicgfCAnbicgfCB1bmRlZmluZWQsXG4gIH0pO1xuXG4gIGlmICghbW92ZSkge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgY29uc3QgaXNDYXB0dXJlID0gbW92ZS5mbGFncy5pbmNsdWRlcygnYycpIHx8IG1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2UnKTtcbiAgY29uc3QgaXNQcm9tb3Rpb24gPSBCb29sZWFuKG1vdmUucHJvbW90aW9uKTtcbiAgY29uc3QgaXNDYXN0bGUgPSBtb3ZlLmZsYWdzLmluY2x1ZGVzKCdrJykgfHwgbW92ZS5mbGFncy5pbmNsdWRlcygncScpO1xuICBjb25zdCBpc0NoZWNrID0gY2hlc3MuaXNDaGVjaygpO1xuXG4gIGlmIChtb2RlID09PSAnYWdncmVzc2l2ZScpIHtcbiAgICByZXR1cm4gMVxuICAgICAgKyAoaXNDYXB0dXJlID8gMC4zNSA6IDApXG4gICAgICArIChpc0NoZWNrID8gMC4zNSA6IDApXG4gICAgICArIChpc1Byb21vdGlvbiA/IDAuNDUgOiAwKVxuICAgICAgKyAoaXNDYXN0bGUgPyAwLjA1IDogMCk7XG4gIH1cblxuICByZXR1cm4gMVxuICAgICsgKGlzQ2FzdGxlID8gMC4yIDogMClcbiAgICArICghaXNDYXB0dXJlID8gMC4xIDogMClcbiAgICAtIChpc1Byb21vdGlvbiA/IDAuMDUgOiAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tQZXJzb25hQmlhc2VkTW92ZShcbiAgZmVuOiBzdHJpbmcsXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICBwZXJzb25hOiBQZXJzb25hSWQsXG4gIHJhbmRvbVNvdXJjZTogUmFuZG9tU291cmNlLFxuKTogQ2xhc3NpZmllZE1vdmUge1xuICBpZiAobW92ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIG1vdmVzWzBdO1xuICB9XG5cbiAgY29uc3Qgd2VpZ2h0ZWRNb3ZlcyA9IG1vdmVzLm1hcCgobW92ZSkgPT4gKHtcbiAgICBtb3ZlLFxuICAgIHdlaWdodDogTWF0aC5tYXgoMC4xLCBnZXRNb3ZlVHJhaXRTY29yZShmZW4sIG1vdmUubW92ZSwgcGVyc29uYSkpLFxuICB9KSk7XG4gIGNvbnN0IHRvdGFsV2VpZ2h0ID0gd2VpZ2h0ZWRNb3Zlcy5yZWR1Y2UoKHN1bSwgZW50cnkpID0+IHN1bSArIGVudHJ5LndlaWdodCwgMCk7XG4gIGxldCBzZWxlY3Rpb24gPSByYW5kb21Tb3VyY2UubmV4dCgpICogdG90YWxXZWlnaHQ7XG5cbiAgZm9yIChjb25zdCBlbnRyeSBvZiB3ZWlnaHRlZE1vdmVzKSB7XG4gICAgc2VsZWN0aW9uIC09IGVudHJ5LndlaWdodDtcbiAgICBpZiAoc2VsZWN0aW9uIDw9IDApIHtcbiAgICAgIHJldHVybiBlbnRyeS5tb3ZlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB3ZWlnaHRlZE1vdmVzW3dlaWdodGVkTW92ZXMubGVuZ3RoIC0gMV0ubW92ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUh1bWFuRGVsYXlNcyhvcHRpb25zOiB7XG4gIGNvbXBsZXhpdHk6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB8IG51bGw7XG4gIHBlcnNvbmE6IFBlcnNvbmFJZDtcbiAgYnVja2V0OiBNb3ZlQnVja2V0O1xufSk6IG51bWJlciB7XG4gIGNvbnN0IHsgY29tcGxleGl0eSwgcGVyc29uYSwgYnVja2V0IH0gPSBvcHRpb25zO1xuICBjb25zdCBtb2RlID0gZ2V0UGVyc29uYUJlaGF2aW9yTW9kZShwZXJzb25hKTtcbiAgY29uc3QgYmFzZSA9IDM1MDtcbiAgY29uc3QgY29tcGxleGl0eURlbGF5ID0gY29tcGxleGl0eSA/IE1hdGgucm91bmQoOTAwICogY29tcGxleGl0eS5zY29yZSkgOiAwO1xuICBjb25zdCBwZXJzb25hRGVsYXkgPSBtb2RlID09PSAnc2FmZScgPyAyMjAgOiBtb2RlID09PSAnYWdncmVzc2l2ZScgPyA4MCA6IDE0MDtcbiAgY29uc3QgYnVja2V0RGVsYXkgPVxuICAgIGJ1Y2tldCA9PT0gJ2Jlc3QnIHx8IGJ1Y2tldCA9PT0gJ2dyZWF0J1xuICAgICAgPyAxMjBcbiAgICAgIDogYnVja2V0ID09PSAnbWlzdGFrZScgfHwgYnVja2V0ID09PSAnYmx1bmRlcidcbiAgICAgICAgPyA0MFxuICAgICAgICA6IDgwO1xuXG4gIHJldHVybiBiYXNlICsgY29tcGxleGl0eURlbGF5ICsgcGVyc29uYURlbGF5ICsgYnVja2V0RGVsYXk7XG59XG4iLCAiLyoqXG4gKiBFbmdpbmUgVmlld01vZGVsXG4gKiBWaWV3TW9kZWwgbGF5ZXIgLSBNb2JYIHN0b3JlIGZvciBTdG9ja2Zpc2ggZW5naW5lIHN0YXRlXG4gKi9cblxuaW1wb3J0IHsgbWFrZUF1dG9PYnNlcnZhYmxlLCBhY3Rpb24sIHJ1bkluQWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQge1xuICBBbmFseXNpc1B1cnBvc2UsXG4gIEFuYWx5c2lzU25hcHNob3QsXG4gIGlzU3RhbGVBbmFseXNpc1JlcXVlc3QsXG59IGZyb20gJy4uL2VuZ2luZS9hbmFseXNpc1NhZmV0eSc7XG5pbXBvcnQgeyBFbmdpbmVDb29yZGluYXRvciwgZW5naW5lQ29vcmRpbmF0b3IsIEVuZ2luZUxhbmUgfSBmcm9tICcuLi9lbmdpbmUvZW5naW5lQ29vcmRpbmF0b3InO1xuaW1wb3J0IHsgY2xhc3NpZnlNb3ZlcywgZ2V0TW92ZVN0YXRzLCBncm91cE1vdmVzQnlCdWNrZXQgfSBmcm9tICcuLi9lbmdpbmUvbW92ZUNsYXNzaWZpZXInO1xuaW1wb3J0IHtcbiAgcGlja0J1Y2tldExlZ2FjeSxcbiAgcGlja0J1Y2tldFdpdGhDbG9zZXN0RmFsbGJhY2ssXG4gIHBpY2tSYW5kb21Nb3ZlRnJvbUJ1Y2tldCxcbn0gZnJvbSAnLi4vZW5naW5lL21vdmVQaWNrZXInO1xuaW1wb3J0IHsgXG4gIEFuYWx5emVkTW92ZSxcbiAgQ2xhc3NpZmllZE1vdmUsIFxuICBQaWNrZWRNb3ZlUmVzdWx0LCBcbiAgTW92ZUJ1Y2tldCxcbiAgQnVja2V0Q29uZmlnLFxufSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuaW1wb3J0IHsgYW5hbHlzaXNDYWNoZSwgYnVpbGRBbmFseXNpc0NhY2hlS2V5IH0gZnJvbSAnLi4vZW5naW5lL2FuYWx5c2lzQ2FjaGUnO1xuaW1wb3J0IHsgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcbmltcG9ydCB7IGdldEJyaWxsaWFudE1vdmVDYW5kaWRhdGVzLCBwaWNrQnJpbGxpYW50TW92ZSB9IGZyb20gJy4uL2VuZ2luZS9icmlsbGlhbnRNb3ZlJztcbmltcG9ydCB7IGRldGVjdEdhbWVQaGFzZSB9IGZyb20gJy4uL2VuZ2luZS9nYW1lUGhhc2UnO1xuaW1wb3J0IHtcbiAgYWRqdXN0QnVja2V0Q29uZmlnRm9yQ29tcGxleGl0eSxcbiAgY2FsY3VsYXRlUG9zaXRpb25Db21wbGV4aXR5LFxuICBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQsXG59IGZyb20gJy4uL2VuZ2luZS9wb3NpdGlvbkNvbXBsZXhpdHknO1xuaW1wb3J0IHtcbiAgYXBwbHlQZXJzb25hQnVja2V0QmlhcyxcbiAgcGlja1BlcnNvbmFCaWFzZWRNb3ZlLFxufSBmcm9tICcuLi9lbmdpbmUvcGVyc29uYUJpYXMnO1xuaW1wb3J0IHtcbiAgYnVpbGREZXRlcm1pbmlzdGljU2VlZCxcbiAgY3JlYXRlTGVnYWN5UmFuZG9tU291cmNlLFxuICBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2UsXG59IGZyb20gJy4uL2VuZ2luZS9yYW5kb20nO1xuaW1wb3J0IHsgUGVyc29uYUlkIH0gZnJvbSAnLi4vZW5naW5lL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7IGNyZWF0ZURlYnVnTG9nZ2VyIH0gZnJvbSAnLi4vc2hhcmVkL2RlYnVnJztcblxuaW50ZXJmYWNlIE1vdmVTZWxlY3Rpb25Db250ZXh0IHtcbiAgZmVuOiBzdHJpbmc7XG4gIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICBtb3ZlQ291bnQ6IG51bWJlcjtcbiAgc2lkZVRvTW92ZTogJ3cnIHwgJ2InO1xuICBwZXJzb25hOiBQZXJzb25hSWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9zaXRpb25BbmFseXNpc1Jlc3VsdCBleHRlbmRzIEFuYWx5c2lzU25hcHNob3Q8Q2xhc3NpZmllZE1vdmVbXT4ge1xuICBjb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQ7XG4gIGlnbm9yZWQ6IGJvb2xlYW47XG4gIGZyb21DYWNoZTogYm9vbGVhbjtcbiAgcHVycG9zZTogQW5hbHlzaXNQdXJwb3NlO1xufVxuXG5pbnRlcmZhY2UgQWN0aXZlQW5hbHlzaXNSdW4ge1xuICBjYWNoZUtleTogc3RyaW5nO1xuICBmZW46IHN0cmluZztcbiAgcHVycG9zZTogQW5hbHlzaXNQdXJwb3NlO1xuICBwcm9taXNlOiBQcm9taXNlPFBvc2l0aW9uQW5hbHlzaXNSZXN1bHQ+O1xufVxuXG5pbnRlcmZhY2UgRW5naW5lVmlld01vZGVsRGVwZW5kZW5jaWVzIHtcbiAgY29vcmRpbmF0b3I/OiBFbmdpbmVDb29yZGluYXRvcjtcbn1cblxuY29uc3QgbG9nZ2VyID0gY3JlYXRlRGVidWdMb2dnZXIoJ0VuZ2luZVZpZXdNb2RlbCcpO1xuXG5mdW5jdGlvbiBjYW5Vc2VCcmlsbGlhbnRNb3ZlQnVkZ2V0KG1vdmVDb3VudDogbnVtYmVyLCBmZW46IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIWZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZUJyaWxsaWFudE1vdmVCdWRnZXQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIWZlYXR1cmVPcHRpb25zVmlld01vZGVsLmhhc1JlbWFpbmluZ0JyaWxsaWFudE1vdmVzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVzUGVyR2FtZSA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHBoYXNlID0gZGV0ZWN0R2FtZVBoYXNlKGZlbiwgbW92ZUNvdW50KS5waGFzZTtcbiAgcmV0dXJuIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudEFsbG93ZWRQaGFzZSA9PT0gJ2FueSdcbiAgICB8fCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRBbGxvd2VkUGhhc2UgPT09IHBoYXNlO1xufVxuXG5leHBvcnQgY2xhc3MgRW5naW5lVmlld01vZGVsIHtcbiAgaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICBpc0luaXRpYWxpemluZyA9IGZhbHNlO1xuICBhbmFseXplZE1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdID0gW107XG4gIGxhc3RQaWNrZWRNb3ZlOiBQaWNrZWRNb3ZlUmVzdWx0IHwgbnVsbCA9IG51bGw7XG4gIGVycm9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgbGFzdENvbXBsZXhpdHk6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB8IG51bGwgPSBudWxsO1xuICBsYXN0QW5hbHlzaXNGcm9tQ2FjaGUgPSBmYWxzZTtcbiAgbGFzdEFuYWx5c2lzUHVycG9zZTogQW5hbHlzaXNQdXJwb3NlIHwgbnVsbCA9IG51bGw7XG4gIGlzTW92ZUxhbmVBbmFseXppbmcgPSBmYWxzZTtcbiAgaXNCYWNrZ3JvdW5kQW5hbHl6aW5nID0gZmFsc2U7XG4gIHByaXZhdGUgbmV4dFJlcXVlc3RJZHM6IFJlY29yZDxBbmFseXNpc1B1cnBvc2UsIG51bWJlcj4gPSB7XG4gICAgZW5naW5lTW92ZTogMCxcbiAgICBiYWNrZ3JvdW5kOiAwLFxuICB9O1xuICBwcml2YXRlIGxhdGVzdFJlcXVlc3RJZHM6IFJlY29yZDxBbmFseXNpc1B1cnBvc2UsIG51bWJlcj4gPSB7XG4gICAgZW5naW5lTW92ZTogMCxcbiAgICBiYWNrZ3JvdW5kOiAwLFxuICB9O1xuICBwcml2YXRlIGFjdGl2ZUFuYWx5c2lzUnVuczogUmVjb3JkPEFuYWx5c2lzUHVycG9zZSwgQWN0aXZlQW5hbHlzaXNSdW4gfCBudWxsPiA9IHtcbiAgICBlbmdpbmVNb3ZlOiBudWxsLFxuICAgIGJhY2tncm91bmQ6IG51bGwsXG4gIH07XG4gIHByaXZhdGUgcmVhZG9ubHkgY29vcmRpbmF0b3I6IEVuZ2luZUNvb3JkaW5hdG9yO1xuXG4gIGNvbnN0cnVjdG9yKGRlcGVuZGVuY2llczogRW5naW5lVmlld01vZGVsRGVwZW5kZW5jaWVzID0ge30pIHtcbiAgICB0aGlzLmNvb3JkaW5hdG9yID0gZGVwZW5kZW5jaWVzLmNvb3JkaW5hdG9yID8/IGVuZ2luZUNvb3JkaW5hdG9yO1xuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBpbml0aWFsaXplOiBhY3Rpb24sXG4gICAgICBhbmFseXplUG9zaXRpb246IGFjdGlvbixcbiAgICAgIHBpY2tNb3ZlRnJvbUFuYWx5c2lzOiBhY3Rpb24sXG4gICAgICByZXNldDogYWN0aW9uLFxuICAgICAgcmVzdGFydDogYWN0aW9uLFxuICAgICAgc2V0RXJyb3I6IGFjdGlvbixcbiAgICB9KTtcbiAgICBcbiAgICBsb2dnZXIuZGVidWcoJ0luaXRpYWxpemVkJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSB0aGUgU3RvY2tmaXNoIGVuZ2luZVxuICAgKi9cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5pc0luaXRpYWxpemVkKSB7XG4gICAgICBsb2dnZXIuZGVidWcoJ0FscmVhZHkgaW5pdGlhbGl6ZWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICAgICAgdGhpcy5pc0luaXRpYWxpemluZyA9IHRydWU7XG4gICAgICB9KTtcbiAgICAgIGF3YWl0IHRoaXMuY29vcmRpbmF0b3IuaW5pdGlhbGl6ZSgpO1xuICAgICAgXG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgbG9nZ2VyLmRlYnVnKCdJbml0aWFsaXphdGlvbiBjb21wbGV0ZScpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdJbml0aWFsaXphdGlvbiBlcnJvcjonLCBlcnIpO1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmVycm9yID0gYEZhaWxlZCB0byBpbml0aWFsaXplIGVuZ2luZTogJHtlcnJ9YDtcbiAgICAgICAgdGhpcy5pc0luaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZSBlbmdpbmUgc2V0dGluZ3NcbiAgICovXG4gIGNvbmZpZ3VyZShvcHRpb25zOiB7IG11bHRpUFY/OiBudW1iZXI7IGRlcHRoPzogbnVtYmVyIH0pOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ0NvbmZpZ3VyaW5nOicsIG9wdGlvbnMpO1xuICAgIHRoaXMuY29vcmRpbmF0b3IuY29uZmlndXJlKCdtb3ZlJywgb3B0aW9ucyk7XG4gICAgdGhpcy5jb29yZGluYXRvci5jb25maWd1cmUoJ2FuYWx5c2lzJywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSBhIHBvc2l0aW9uIGFuZCBjbGFzc2lmeSBtb3Zlc1xuICAgKi9cbiAgYXN5bmMgYW5hbHl6ZVBvc2l0aW9uKFxuICAgIGZlbjogc3RyaW5nLFxuICAgIGRlcHRoID0gMjAsXG4gICAgbXVsdGlQViA9IDEyLFxuICAgIHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSA9ICdiYWNrZ3JvdW5kJyxcbiAgKTogUHJvbWlzZTxQb3NpdGlvbkFuYWx5c2lzUmVzdWx0PiB7XG4gICAgbG9nZ2VyLmRlYnVnKCdhbmFseXplUG9zaXRpb24gY2FsbGVkJywgeyBmZW4sIGRlcHRoLCBtdWx0aVBWLCBwdXJwb3NlIH0pO1xuICAgIGNvbnN0IGxhbmUgPSB0aGlzLmdldExhbmVGb3JQdXJwb3NlKHB1cnBvc2UpO1xuXG4gICAgaWYgKCF0aGlzLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjYWNoZUtleSA9IGJ1aWxkQW5hbHlzaXNDYWNoZUtleShmZW4sIGRlcHRoLCBtdWx0aVBWKTtcbiAgICAgIGNvbnN0IHJlcXVlc3RJZCA9ICsrdGhpcy5uZXh0UmVxdWVzdElkc1twdXJwb3NlXTtcbiAgICAgIHRoaXMubGF0ZXN0UmVxdWVzdElkc1twdXJwb3NlXSA9IHJlcXVlc3RJZDtcblxuICAgICAgY29uc3QgYWN0aXZlUnVuID0gdGhpcy5hY3RpdmVBbmFseXNpc1J1bnNbcHVycG9zZV07XG4gICAgICBpZiAoYWN0aXZlUnVuKSB7XG4gICAgICAgIGlmIChhY3RpdmVSdW4uY2FjaGVLZXkgPT09IGNhY2hlS2V5KSB7XG4gICAgICAgICAgY29uc3Qgc2hhcmVkUmVzdWx0ID0gYXdhaXQgYWN0aXZlUnVuLnByb21pc2U7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLnNoYXJlZFJlc3VsdCxcbiAgICAgICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgICAgIHB1cnBvc2UsXG4gICAgICAgICAgICBpZ25vcmVkOiBpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0KHJlcXVlc3RJZCwgdGhpcy5sYXRlc3RSZXF1ZXN0SWRzW3B1cnBvc2VdKSB8fCBzaGFyZWRSZXN1bHQuaWdub3JlZCxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHB1cnBvc2UgPT09ICdlbmdpbmVNb3ZlJykge1xuICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZVB1cnBvc2VSZXF1ZXN0KHB1cnBvc2UpO1xuICAgICAgICAgIHRoaXMuY29vcmRpbmF0b3Iuc3RvcChsYW5lKTtcbiAgICAgICAgICBhd2FpdCBhY3RpdmVSdW4ucHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHB1cnBvc2UgPT09ICdiYWNrZ3JvdW5kJykge1xuICAgICAgICAgIGF3YWl0IGFjdGl2ZVJ1bi5wcm9taXNlLmNhdGNoKCgpID0+IHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLnNldExhbmVBbmFseXppbmcocHVycG9zZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgICAgICBpZiAocHVycG9zZSA9PT0gJ2VuZ2luZU1vdmUnKSB7XG4gICAgICAgICAgdGhpcy5hbmFseXplZE1vdmVzID0gW107XG4gICAgICAgICAgdGhpcy5sYXN0UGlja2VkTW92ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBydW5Qcm9taXNlID0gdGhpcy5wZXJmb3JtUG9zaXRpb25BbmFseXNpcyh7XG4gICAgICAgIGZlbixcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIG11bHRpUFYsXG4gICAgICAgIGNhY2hlS2V5LFxuICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgIHB1cnBvc2UsXG4gICAgICAgIGxhbmUsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zW3B1cnBvc2VdID0ge1xuICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgZmVuLFxuICAgICAgICBwdXJwb3NlLFxuICAgICAgICBwcm9taXNlOiBydW5Qcm9taXNlLFxuICAgICAgfTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJ1blByb21pc2U7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmVBbmFseXNpc1J1bnNbcHVycG9zZV0/LnByb21pc2UgPT09IHJ1blByb21pc2UpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuc1twdXJwb3NlXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignQW5hbHlzaXMgZXJyb3I6JywgZXJyKTtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGBBbmFseXNpcyBmYWlsZWQ6ICR7ZXJyfWA7XG4gICAgICAgIHRoaXMuc2V0TGFuZUFuYWx5emluZyhwdXJwb3NlLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGljayBhIG1vdmUgZnJvbSB0aGUgYW5hbHl6ZWQgbW92ZXMgdXNpbmcgYnVja2V0IGNvbmZpZ3VyYXRpb25cbiAgICovXG4gIHBpY2tNb3ZlRnJvbUFuYWx5c2lzKFxuICAgIGFuYWx5c2lzOiBQb3NpdGlvbkFuYWx5c2lzUmVzdWx0LFxuICAgIGNvbmZpZzogQnVja2V0Q29uZmlnLFxuICAgIGNvbnRleHQ6IE1vdmVTZWxlY3Rpb25Db250ZXh0LFxuICApOiBQaWNrZWRNb3ZlUmVzdWx0IHwgbnVsbCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdwaWNrTW92ZUZyb21BbmFseXNpcyBjYWxsZWQnLCB7XG4gICAgICBhbmFseXplZE1vdmVzQ291bnQ6IGFuYWx5c2lzLm1vdmVzLmxlbmd0aCxcbiAgICAgIGNvbmZpZyBcbiAgICB9KTtcbiAgICBcbiAgICBpZiAoYW5hbHlzaXMuaWdub3JlZCB8fCBhbmFseXNpcy5tb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnTm8gYW5hbHl6ZWQgbW92ZXMgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByYW5kb21Tb3VyY2UgPSBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VEZXRlcm1pbmlzdGljUm5nXG4gICAgICA/IGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZShcbiAgICAgICAgICBidWlsZERldGVybWluaXN0aWNTZWVkKHtcbiAgICAgICAgICAgIGdhbWVTdGFydEZlbjogY29udGV4dC5nYW1lU3RhcnRGZW4sXG4gICAgICAgICAgICBjdXJyZW50RmVuOiBjb250ZXh0LmZlbixcbiAgICAgICAgICAgIG1vdmVDb3VudDogY29udGV4dC5tb3ZlQ291bnQsXG4gICAgICAgICAgICBzaWRlVG9Nb3ZlOiBjb250ZXh0LnNpZGVUb01vdmUsXG4gICAgICAgICAgICBwZXJzb25hOiBjb250ZXh0LnBlcnNvbmEsXG4gICAgICAgICAgfSksXG4gICAgICAgIClcbiAgICAgIDogY3JlYXRlTGVnYWN5UmFuZG9tU291cmNlKCk7XG5cbiAgICBsZXQgZWZmZWN0aXZlQ29uZmlnOiBCdWNrZXRDb25maWcgPSB7IC4uLmNvbmZpZyB9O1xuXG4gICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZVBvc2l0aW9uQ29tcGxleGl0eSkge1xuICAgICAgZWZmZWN0aXZlQ29uZmlnID0gYWRqdXN0QnVja2V0Q29uZmlnRm9yQ29tcGxleGl0eShlZmZlY3RpdmVDb25maWcsIGFuYWx5c2lzLmNvbXBsZXhpdHkpO1xuICAgIH1cblxuICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VQZXJzb25hQmVoYXZpb3JCaWFzKSB7XG4gICAgICBlZmZlY3RpdmVDb25maWcgPSBhcHBseVBlcnNvbmFCdWNrZXRCaWFzKGVmZmVjdGl2ZUNvbmZpZywgY29udGV4dC5wZXJzb25hKSBhcyBCdWNrZXRDb25maWc7XG4gICAgfVxuXG4gICAgaWYgKGNhblVzZUJyaWxsaWFudE1vdmVCdWRnZXQoY29udGV4dC5tb3ZlQ291bnQsIGNvbnRleHQuZmVuKSkge1xuICAgICAgY29uc3QgYnJpbGxpYW50Q2FuZGlkYXRlcyA9IGdldEJyaWxsaWFudE1vdmVDYW5kaWRhdGVzKGNvbnRleHQuZmVuLCBhbmFseXNpcy5tb3Zlcyk7XG4gICAgICBjb25zdCBzaG91bGRQaWNrQnJpbGxpYW50ID0gYnJpbGxpYW50Q2FuZGlkYXRlcy5sZW5ndGggPiAwICYmIHJhbmRvbVNvdXJjZS5uZXh0KCkgPCAwLjM1O1xuXG4gICAgICBpZiAoc2hvdWxkUGlja0JyaWxsaWFudCkge1xuICAgICAgICBjb25zdCBicmlsbGlhbnRNb3ZlID0gcGlja0JyaWxsaWFudE1vdmUoYnJpbGxpYW50Q2FuZGlkYXRlcywgcmFuZG9tU291cmNlKTtcblxuICAgICAgICBpZiAoYnJpbGxpYW50TW92ZSkge1xuICAgICAgICAgIGNvbnN0IGJyaWxsaWFudFJlc3VsdCA9IHtcbiAgICAgICAgICAgIG1vdmU6IGJyaWxsaWFudE1vdmUsXG4gICAgICAgICAgICBidWNrZXQ6IGJyaWxsaWFudE1vdmUuYnVja2V0LFxuICAgICAgICAgICAgaXNCcmlsbGlhbnQ6IHRydWUsXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFBpY2tlZE1vdmUgPSBicmlsbGlhbnRSZXN1bHQ7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gYnJpbGxpYW50UmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVja2V0U2VsZWN0aW9uID0gZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb25cbiAgICAgID8gcGlja0J1Y2tldFdpdGhDbG9zZXN0RmFsbGJhY2soYW5hbHlzaXMubW92ZXMsIGVmZmVjdGl2ZUNvbmZpZywgKCkgPT4gcmFuZG9tU291cmNlLm5leHQoKSlcbiAgICAgIDogcGlja0J1Y2tldExlZ2FjeShhbmFseXNpcy5tb3ZlcywgZWZmZWN0aXZlQ29uZmlnLCAoKSA9PiByYW5kb21Tb3VyY2UubmV4dCgpKTtcblxuICAgIGlmICghYnVja2V0U2VsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3RlZE1vdmUgPSBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VQZXJzb25hQmVoYXZpb3JCaWFzXG4gICAgICA/IHBpY2tQZXJzb25hQmlhc2VkTW92ZShjb250ZXh0LmZlbiwgYnVja2V0U2VsZWN0aW9uLm1vdmVzLCBjb250ZXh0LnBlcnNvbmEsIHJhbmRvbVNvdXJjZSlcbiAgICAgIDogcGlja1JhbmRvbU1vdmVGcm9tQnVja2V0KGJ1Y2tldFNlbGVjdGlvbiwgKCkgPT4gcmFuZG9tU291cmNlLm5leHQoKSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICBtb3ZlOiBzZWxlY3RlZE1vdmUsXG4gICAgICBidWNrZXQ6IGJ1Y2tldFNlbGVjdGlvbi5idWNrZXQsXG4gICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgfTtcbiAgICBsb2dnZXIuZGVidWcoJ1BpY2tlZCBtb3ZlOicsIHJlc3VsdCk7XG4gICAgXG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5sYXN0UGlja2VkTW92ZSA9IHJlc3VsdDtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBjdXJyZW50IGFuYWx5c2lzXG4gICAqL1xuICBzdG9wQW5hbHlzaXMoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdzdG9wQW5hbHlzaXMgY2FsbGVkJyk7XG4gICAgdGhpcy5jb29yZGluYXRvci5zdG9wKCk7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5pc01vdmVMYW5lQW5hbHl6aW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmlzQmFja2dyb3VuZEFuYWx5emluZyA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHRoaXMuaW52YWxpZGF0ZVBlbmRpbmdSZXF1ZXN0cygpO1xuICAgIHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zLmVuZ2luZU1vdmUgPSBudWxsO1xuICAgIHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zLmJhY2tncm91bmQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGEgbmV3IGdhbWVcbiAgICovXG4gIG5ld0dhbWUoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCduZXdHYW1lIGNhbGxlZCcpO1xuICAgIHRoaXMuY29vcmRpbmF0b3IubmV3R2FtZSgpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIHJlc3RhcnQoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdyZXN0YXJ0IGNhbGxlZCcpO1xuICAgIHRoaXMuY29vcmRpbmF0b3IucmVzdGFydCgpO1xuICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBzdGF0ZVxuICAgKi9cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdyZXNldCBjYWxsZWQnKTtcbiAgICB0aGlzLmNvb3JkaW5hdG9yLnN0b3AoKTtcbiAgICB0aGlzLmludmFsaWRhdGVQZW5kaW5nUmVxdWVzdHMoKTtcbiAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVucy5lbmdpbmVNb3ZlID0gbnVsbDtcbiAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVucy5iYWNrZ3JvdW5kID0gbnVsbDtcbiAgICB0aGlzLmFuYWx5emVkTW92ZXMgPSBbXTtcbiAgICB0aGlzLmxhc3RQaWNrZWRNb3ZlID0gbnVsbDtcbiAgICB0aGlzLmxhc3RDb21wbGV4aXR5ID0gbnVsbDtcbiAgICB0aGlzLmxhc3RBbmFseXNpc0Zyb21DYWNoZSA9IGZhbHNlO1xuICAgIHRoaXMubGFzdEFuYWx5c2lzUHVycG9zZSA9IG51bGw7XG4gICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgdGhpcy5pc01vdmVMYW5lQW5hbHl6aW5nID0gZmFsc2U7XG4gICAgdGhpcy5pc0JhY2tncm91bmRBbmFseXppbmcgPSBmYWxzZTtcbiAgICB0aGlzLmlzSW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGVycm9yIG1lc3NhZ2VcbiAgICovXG4gIHNldEVycm9yKG1lc3NhZ2U6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLmVycm9yID0gbWVzc2FnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbW92ZSBzdGF0aXN0aWNzIGJ5IGJ1Y2tldFxuICAgKi9cbiAgZ2V0IG1vdmVTdGF0cygpOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gICAgcmV0dXJuIGdldE1vdmVTdGF0cyh0aGlzLmFuYWx5emVkTW92ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBtb3ZlcyBncm91cGVkIGJ5IGJ1Y2tldFxuICAgKi9cbiAgZ2V0IG1vdmVzQnlCdWNrZXQoKTogTWFwPE1vdmVCdWNrZXQsIENsYXNzaWZpZWRNb3ZlW10+IHtcbiAgICByZXR1cm4gZ3JvdXBNb3Zlc0J5QnVja2V0KHRoaXMuYW5hbHl6ZWRNb3Zlcyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBiZXN0IG1vdmUgKGlmIGF2YWlsYWJsZSlcbiAgICovXG4gIGdldCBiZXN0TW92ZSgpOiBDbGFzc2lmaWVkTW92ZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmFuYWx5emVkTW92ZXMubGVuZ3RoID4gMCA/IHRoaXMuYW5hbHl6ZWRNb3Zlc1swXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlcmUgYXJlIGFuYWx5emVkIG1vdmVzXG4gICAqL1xuICBnZXQgaGFzQW5hbHl6ZWRNb3ZlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hbmFseXplZE1vdmVzLmxlbmd0aCA+IDA7XG4gIH1cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIGVuZ2luZVxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ2Rlc3Ryb3kgY2FsbGVkJyk7XG4gICAgdGhpcy5jb29yZGluYXRvci5kZXN0cm95KCk7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5pc0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHBlcmZvcm1Qb3NpdGlvbkFuYWx5c2lzKG9wdGlvbnM6IHtcbiAgICBmZW46IHN0cmluZztcbiAgICBkZXB0aDogbnVtYmVyO1xuICAgIG11bHRpUFY6IG51bWJlcjtcbiAgICBjYWNoZUtleTogc3RyaW5nO1xuICAgIHJlcXVlc3RJZDogbnVtYmVyO1xuICAgIHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZTtcbiAgICBsYW5lOiBFbmdpbmVMYW5lO1xuICB9KTogUHJvbWlzZTxQb3NpdGlvbkFuYWx5c2lzUmVzdWx0PiB7XG4gICAgY29uc3QgeyBmZW4sIGRlcHRoLCBtdWx0aVBWLCBjYWNoZUtleSwgcmVxdWVzdElkLCBwdXJwb3NlLCBsYW5lIH0gPSBvcHRpb25zO1xuICAgIGxldCBjYWNoZWRDbGFzc2lmaWVkTW92ZXM6IENsYXNzaWZpZWRNb3ZlW10gfCB1bmRlZmluZWQ7XG4gICAgbGV0IGZyb21DYWNoZSA9IGZhbHNlO1xuICAgIGxldCBtb3ZlczogQW5hbHl6ZWRNb3ZlW10gPSBbXTtcblxuICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VNb3ZlQW5hbHlzaXNDYWNoZSkge1xuICAgICAgY29uc3QgY2FjaGVkID0gYW5hbHlzaXNDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICBtb3ZlcyA9IGNhY2hlZC5tb3ZlcztcbiAgICAgICAgY2FjaGVkQ2xhc3NpZmllZE1vdmVzID0gY2FjaGVkLmNsYXNzaWZpZWRNb3ZlcztcbiAgICAgICAgZnJvbUNhY2hlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmNvb3JkaW5hdG9yLmNvbmZpZ3VyZShsYW5lLCB7IGRlcHRoLCBtdWx0aVBWIH0pO1xuICAgICAgbG9nZ2VyLmRlYnVnKCdTdGFydGluZyBhbmFseXNpcy4uLicpO1xuICAgICAgbW92ZXMgPSBhd2FpdCB0aGlzLmNvb3JkaW5hdG9yLmFuYWx5emVQb3NpdGlvbihsYW5lLCBmZW4pO1xuICAgICAgbG9nZ2VyLmRlYnVnKCdBbmFseXNpcyBjb21wbGV0ZSwgZ290JywgbW92ZXMubGVuZ3RoLCAnbW92ZXMnKTtcblxuICAgICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZU1vdmVBbmFseXNpc0NhY2hlKSB7XG4gICAgICAgIGFuYWx5c2lzQ2FjaGUuc2V0KHtcbiAgICAgICAgICBrZXk6IGNhY2hlS2V5LFxuICAgICAgICAgIG1vdmVzLFxuICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnVXNpbmcgY2FjaGVkIGFuYWx5c2lzIGZvciBjdXJyZW50IHBvc2l0aW9uJyk7XG4gICAgfVxuXG4gICAgY29uc3QgY2xhc3NpZmllZCA9IGNhY2hlZENsYXNzaWZpZWRNb3ZlcyA/PyBjbGFzc2lmeU1vdmVzKG1vdmVzKTtcbiAgICBjb25zdCBjb21wbGV4aXR5ID0gY2FsY3VsYXRlUG9zaXRpb25Db21wbGV4aXR5KG1vdmVzKTtcbiAgICBjb25zdCBpZ25vcmVkID0gaXNTdGFsZUFuYWx5c2lzUmVxdWVzdChyZXF1ZXN0SWQsIHRoaXMubGF0ZXN0UmVxdWVzdElkc1twdXJwb3NlXSk7XG5cbiAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlTW92ZUFuYWx5c2lzQ2FjaGUgJiYgbW92ZXMubGVuZ3RoID4gMCkge1xuICAgICAgYW5hbHlzaXNDYWNoZS5zZXQoe1xuICAgICAgICBrZXk6IGNhY2hlS2V5LFxuICAgICAgICBtb3ZlcyxcbiAgICAgICAgY2xhc3NpZmllZE1vdmVzOiBjbGFzc2lmaWVkLFxuICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWlnbm9yZWQpIHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5sYXN0QW5hbHlzaXNGcm9tQ2FjaGUgPSBmcm9tQ2FjaGU7XG4gICAgICAgIHRoaXMubGFzdEFuYWx5c2lzUHVycG9zZSA9IHB1cnBvc2U7XG4gICAgICAgIGlmIChwdXJwb3NlID09PSAnZW5naW5lTW92ZScpIHtcbiAgICAgICAgICB0aGlzLmFuYWx5emVkTW92ZXMgPSBjbGFzc2lmaWVkO1xuICAgICAgICAgIHRoaXMubGFzdENvbXBsZXhpdHkgPSBjb21wbGV4aXR5O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0TGFuZUFuYWx5emluZyhwdXJwb3NlLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aXZlQW5hbHlzaXNSdW5zW3B1cnBvc2VdPy5wdXJwb3NlID09PSBwdXJwb3NlKSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0TGFuZUFuYWx5emluZyhwdXJwb3NlLCBmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVxdWVzdElkLFxuICAgICAgYW5hbHl6ZWRGZW46IGZlbixcbiAgICAgIG1vdmVzOiBjbGFzc2lmaWVkLFxuICAgICAgY29tcGxleGl0eSxcbiAgICAgIGlnbm9yZWQsXG4gICAgICBmcm9tQ2FjaGUsXG4gICAgICBwdXJwb3NlLFxuICAgIH07XG4gIH1cblxuICBnZXQgYW5hbHlzaXNTdGF0dXNMYWJlbCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmVycm9yKSB7XG4gICAgICByZXR1cm4gJ0VuZ2luZSBlcnJvcic7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNJbml0aWFsaXppbmcpIHtcbiAgICAgIHJldHVybiAnU3RhcnRpbmcgZW5naW5lJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc01vdmVMYW5lQW5hbHl6aW5nKSB7XG4gICAgICByZXR1cm4gJ0FuYWx5emluZyBwb3NpdGlvbic7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNCYWNrZ3JvdW5kQW5hbHl6aW5nKSB7XG4gICAgICByZXR1cm4gJ1J1bm5pbmcgYmFja2dyb3VuZCBhbmFseXNpcyc7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybiAnTm90IGluaXRpYWxpemVkJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5sYXN0QW5hbHlzaXNQdXJwb3NlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJ1JlYWR5JztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5sYXN0QW5hbHlzaXNGcm9tQ2FjaGUgPyAnUmVhZHkgKGNhY2hlIHdhcm0pJyA6ICdSZWFkeSc7XG4gIH1cblxuICBnZXQgaXNBbmFseXppbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNNb3ZlTGFuZUFuYWx5emluZyB8fCB0aGlzLmlzQmFja2dyb3VuZEFuYWx5emluZztcbiAgfVxuXG4gIGdldCBpc01vdmVMYW5lQnVzeSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0luaXRpYWxpemluZyB8fCB0aGlzLmlzTW92ZUxhbmVBbmFseXppbmc7XG4gIH1cblxuICBnZXQgaXNCYWNrZ3JvdW5kTGFuZUJ1c3koKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNCYWNrZ3JvdW5kQW5hbHl6aW5nO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZhbGlkYXRlUGVuZGluZ1JlcXVlc3RzKCk6IHZvaWQge1xuICAgIHRoaXMubGF0ZXN0UmVxdWVzdElkcy5lbmdpbmVNb3ZlID0gKyt0aGlzLm5leHRSZXF1ZXN0SWRzLmVuZ2luZU1vdmU7XG4gICAgdGhpcy5sYXRlc3RSZXF1ZXN0SWRzLmJhY2tncm91bmQgPSArK3RoaXMubmV4dFJlcXVlc3RJZHMuYmFja2dyb3VuZDtcbiAgfVxuXG4gIHByaXZhdGUgaW52YWxpZGF0ZVB1cnBvc2VSZXF1ZXN0KHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSk6IHZvaWQge1xuICAgIHRoaXMubGF0ZXN0UmVxdWVzdElkc1twdXJwb3NlXSA9ICsrdGhpcy5uZXh0UmVxdWVzdElkc1twdXJwb3NlXTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TGFuZUZvclB1cnBvc2UocHVycG9zZTogQW5hbHlzaXNQdXJwb3NlKTogRW5naW5lTGFuZSB7XG4gICAgcmV0dXJuIHB1cnBvc2UgPT09ICdlbmdpbmVNb3ZlJyA/ICdtb3ZlJyA6ICdhbmFseXNpcyc7XG4gIH1cblxuICBwcml2YXRlIHNldExhbmVBbmFseXppbmcocHVycG9zZTogQW5hbHlzaXNQdXJwb3NlLCBhbmFseXppbmc6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAocHVycG9zZSA9PT0gJ2VuZ2luZU1vdmUnKSB7XG4gICAgICB0aGlzLmlzTW92ZUxhbmVBbmFseXppbmcgPSBhbmFseXppbmc7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5pc0JhY2tncm91bmRBbmFseXppbmcgPSBhbmFseXppbmc7XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgZW5naW5lVmlld01vZGVsID0gbmV3IEVuZ2luZVZpZXdNb2RlbCgpO1xuIiwgIi8qKlxuICogQ29uZmlnIFZpZXdNb2RlbFxuICogVmlld01vZGVsIGxheWVyIC0gTW9iWCBzdG9yZSBmb3IgYnVja2V0IGNvbmZpZ3VyYXRpb25cbiAqL1xuXG5pbXBvcnQgeyBtYWtlQXV0b09ic2VydmFibGUsIGFjdGlvbiwgcmVhY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IEJ1Y2tldENvbmZpZywgTW92ZUJ1Y2tldCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLCBNb3ZlUXVhbGl0eVByZXNldElkLCBNT1ZFX1FVQUxJVFlfUFJFU0VUUyB9IGZyb20gJy4uL2VuZ2luZS90eXBlcyc7XG5pbXBvcnQgeyBFTkdJTkVfQ09ORklHX1NUT1JBR0VfS0VZIH0gZnJvbSAnLi4vZW5naW5lL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7IG5vcm1hbGl6ZUJ1Y2tldENvbmZpZywgdmFsaWRhdGVCdWNrZXRDb25maWcgfSBmcm9tICcuLi9lbmdpbmUvbW92ZVBpY2tlcic7XG5pbXBvcnQgeyBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gJy4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwnO1xuXG5pbnRlcmZhY2UgUGVyc2lzdGVkRW5naW5lQ29uZmlnIHtcbiAgYnVja2V0Q29uZmlnOiBCdWNrZXRDb25maWc7XG4gIGN1cnJlbnRQcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGw7XG4gIGRlcHRoOiBudW1iZXI7XG4gIG11bHRpUFY6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIENvbmZpZ1ZpZXdNb2RlbCB7XG4gIGJ1Y2tldENvbmZpZzogQnVja2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcgfTtcbiAgLyoqIElkIG9mIHRoZSBhY3RpdmUgcHJlc2V0LCBvciBudWxsIGlmIHVzaW5nIGN1c3RvbSBkaXN0cmlidXRpb24gKi9cbiAgY3VycmVudFByZXNldElkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbCA9ICdtZWRpdW0nO1xuICBkZXB0aCA9IDg7XG4gIG11bHRpUFYgPSAxMjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0QnVja2V0VmFsdWU6IGFjdGlvbixcbiAgICAgIHNldEJ1Y2tldENvbmZpZzogYWN0aW9uLFxuICAgICAgYXBwbHlQcm9maWxlU25hcHNob3Q6IGFjdGlvbixcbiAgICAgIGFwcGx5UHJlc2V0OiBhY3Rpb24sXG4gICAgICByZXNldFRvRGVmYXVsdHM6IGFjdGlvbixcbiAgICAgIG5vcm1hbGl6ZUNvbmZpZzogYWN0aW9uLFxuICAgICAgc2V0RGVwdGg6IGFjdGlvbixcbiAgICAgIHNldE11bHRpUFY6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG5cbiAgICByZWFjdGlvbihcbiAgICAgICgpID0+ICh7XG4gICAgICAgIGJ1Y2tldENvbmZpZzogdGhpcy5idWNrZXRDb25maWcsXG4gICAgICAgIGN1cnJlbnRQcmVzZXRJZDogdGhpcy5jdXJyZW50UHJlc2V0SWQsXG4gICAgICAgIGRlcHRoOiB0aGlzLmRlcHRoLFxuICAgICAgICBtdWx0aVBWOiB0aGlzLm11bHRpUFYsXG4gICAgICAgIHBlcnNpc3RFbmdpbmVDb25maWc6IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnBlcnNpc3RFbmdpbmVDb25maWcsXG4gICAgICB9KSxcbiAgICAgICh7IHBlcnNpc3RFbmdpbmVDb25maWcgfSkgPT4ge1xuICAgICAgICBpZiAoIXBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgICB0aGlzLmNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgICAgfSxcbiAgICAgIHsgZmlyZUltbWVkaWF0ZWx5OiB0cnVlIH0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHBlcmNlbnRhZ2UgdmFsdWUgZm9yIGEgc3BlY2lmaWMgYnVja2V0XG4gICAqL1xuICBzZXRCdWNrZXRWYWx1ZShidWNrZXQ6IE1vdmVCdWNrZXQsIHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjbGFtcGVkVmFsdWUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIHZhbHVlKSk7XG4gICAgdGhpcy5jdXJyZW50UHJlc2V0SWQgPSBudWxsOyAvLyBzd2l0Y2hpbmcgdG8gY3VzdG9tXG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJ1Y2tldENvbmZpZyxcbiAgICAgIFtidWNrZXRdOiBjbGFtcGVkVmFsdWUsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGZ1bGwgYnVja2V0IGNvbmZpZyAoZS5nLiB3aGVuIGFwcGx5aW5nIGEgcHJlc2V0KVxuICAgKi9cbiAgc2V0QnVja2V0Q29uZmlnKGNvbmZpZzogQnVja2V0Q29uZmlnKTogdm9pZCB7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLmNvbmZpZyB9O1xuICB9XG5cbiAgYXBwbHlQcm9maWxlU25hcHNob3Qoc25hcHNob3Q6IHtcbiAgICBidWNrZXRDb25maWc6IEJ1Y2tldENvbmZpZztcbiAgICBjdXJyZW50UHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsO1xuICAgIGRlcHRoOiBudW1iZXI7XG4gICAgbXVsdGlQVjogbnVtYmVyO1xuICB9KTogdm9pZCB7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLnNuYXBzaG90LmJ1Y2tldENvbmZpZyB9O1xuICAgIHRoaXMuY3VycmVudFByZXNldElkID0gc25hcHNob3QuY3VycmVudFByZXNldElkO1xuICAgIHRoaXMuZGVwdGggPSBNYXRoLm1heCgxLCBNYXRoLm1pbigzMCwgc25hcHNob3QuZGVwdGgpKTtcbiAgICB0aGlzLm11bHRpUFYgPSBNYXRoLm1heCgxLCBNYXRoLm1pbigyMCwgc25hcHNob3QubXVsdGlQVikpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IGEgcHJlZGVmaW5lZCBtb3ZlIHF1YWxpdHkgcHJlc2V0IGJ5IGlkXG4gICAqL1xuICBhcHBseVByZXNldChwcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCk6IHZvaWQge1xuICAgIGNvbnN0IHByZXNldCA9IE1PVkVfUVVBTElUWV9QUkVTRVRTLmZpbmQocCA9PiBwLmlkID09PSBwcmVzZXRJZCk7XG4gICAgaWYgKHByZXNldCkge1xuICAgICAgdGhpcy5jdXJyZW50UHJlc2V0SWQgPSBwcmVzZXRJZDtcbiAgICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5wcmVzZXQuY29uZmlnIH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IGJ1Y2tldCBjb25maWd1cmF0aW9uIHRvIGRlZmF1bHRzIChtZWRpdW0gcHJlc2V0KVxuICAgKi9cbiAgcmVzZXRUb0RlZmF1bHRzKCk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudFByZXNldElkID0gJ21lZGl1bSc7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZSB0aGUgY29uZmlndXJhdGlvbiBzbyBwZXJjZW50YWdlcyBzdW0gdG8gMTAwXG4gICAqL1xuICBub3JtYWxpemVDb25maWcoKTogdm9pZCB7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSBub3JtYWxpemVCdWNrZXRDb25maWcodGhpcy5idWNrZXRDb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbmFseXNpcyBkZXB0aFxuICAgKi9cbiAgc2V0RGVwdGgodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuZGVwdGggPSBNYXRoLm1heCgxLCBNYXRoLm1pbigzMCwgdmFsdWUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgTXVsdGlQViB2YWx1ZVxuICAgKi9cbiAgc2V0TXVsdGlQVih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5tdWx0aVBWID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMjAsIHZhbHVlKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRvdGFsIHBlcmNlbnRhZ2Ugc3VtXG4gICAqL1xuICBnZXQgdG90YWxQZXJjZW50YWdlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5idWNrZXRDb25maWcpLnJlZHVjZSgoc3VtLCB2YWwpID0+IHN1bSArIHZhbCwgMCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgY29uZmlndXJhdGlvbiBpcyB2YWxpZCAoc3VtcyB0byAxMDApXG4gICAqL1xuICBnZXQgaXNWYWxpZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHZhbGlkIH0gPSB2YWxpZGF0ZUJ1Y2tldENvbmZpZyh0aGlzLmJ1Y2tldENvbmZpZyk7XG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdmFsaWRhdGlvbiBzdGF0ZVxuICAgKi9cbiAgZ2V0IHZhbGlkYXRpb25TdGF0ZSgpOiB7IHZhbGlkOiBib29sZWFuOyB0b3RhbDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB2YWxpZGF0ZUJ1Y2tldENvbmZpZyh0aGlzLmJ1Y2tldENvbmZpZyk7XG4gIH1cblxuICBnZXQgYWN0aXZlUGVyc29uYUlkKCk6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UHJlc2V0SWQ7XG4gIH1cblxuICBnZXQgYWN0aXZlUGVyc29uYUxhYmVsKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuY3VycmVudFByZXNldElkID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJ0N1c3RvbSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1PVkVfUVVBTElUWV9QUkVTRVRTLmZpbmQoKHByZXNldCkgPT4gcHJlc2V0LmlkID09PSB0aGlzLmN1cnJlbnRQcmVzZXRJZCk/LmxhYmVsID8/ICdDdXN0b20nO1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZCkgYXMgUGFydGlhbDxQZXJzaXN0ZWRFbmdpbmVDb25maWc+O1xuICAgICAgaWYgKHBhcnNlZC5idWNrZXRDb25maWcpIHtcbiAgICAgICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRywgLi4ucGFyc2VkLmJ1Y2tldENvbmZpZyB9O1xuICAgICAgfVxuICAgICAgaWYgKHBhcnNlZC5jdXJyZW50UHJlc2V0SWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRQcmVzZXRJZCA9IHBhcnNlZC5jdXJyZW50UHJlc2V0SWQ7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhcnNlZC5kZXB0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgdGhpcy5kZXB0aCA9IE1hdGgubWF4KDEsIE1hdGgubWluKDMwLCBwYXJzZWQuZGVwdGgpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGFyc2VkLm11bHRpUFYgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHRoaXMubXVsdGlQViA9IE1hdGgubWF4KDEsIE1hdGgubWluKDIwLCBwYXJzZWQubXVsdGlQVikpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQ29uZmlnVmlld01vZGVsXSBGYWlsZWQgdG8gcmVzdG9yZSBlbmdpbmUgY29uZmlnOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNuYXBzaG90OiBQZXJzaXN0ZWRFbmdpbmVDb25maWcgPSB7XG4gICAgICAgIGJ1Y2tldENvbmZpZzogdGhpcy5idWNrZXRDb25maWcsXG4gICAgICAgIGN1cnJlbnRQcmVzZXRJZDogdGhpcy5jdXJyZW50UHJlc2V0SWQsXG4gICAgICAgIGRlcHRoOiB0aGlzLmRlcHRoLFxuICAgICAgICBtdWx0aVBWOiB0aGlzLm11bHRpUFYsXG4gICAgICB9O1xuXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShFTkdJTkVfQ09ORklHX1NUT1JBR0VfS0VZLCBKU09OLnN0cmluZ2lmeShzbmFwc2hvdCkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQ29uZmlnVmlld01vZGVsXSBGYWlsZWQgdG8gcGVyc2lzdCBlbmdpbmUgY29uZmlnOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDb25maWdWaWV3TW9kZWxdIEZhaWxlZCB0byBjbGVhciBlbmdpbmUgY29uZmlnIHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBTaW5nbGV0b24gaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBjb25maWdWaWV3TW9kZWwgPSBuZXcgQ29uZmlnVmlld01vZGVsKCk7XG4iLCAiLyoqXG4gKiBDb252ZXJ0IGVuZ2luZSBldmFsdWF0aW9uIChjZW50aXBhd25zIGZyb20gc2lkZS10by1tb3ZlIHBlcnNwZWN0aXZlKSBpbnRvXG4gKiBhcHByb3hpbWF0ZSBXaGl0ZSB2cyBCbGFjayB3aW4gc2hhcmVzIGZvciBVSSAoMFx1MjAxMzEwMCBlYWNoLCBzdW0gMTAwKS5cbiAqIFVzZXMgYSBsb2dpc3RpYyBjdXJ2ZTsgbm90IHRydWUgV0RMIFx1MjAxNCBnb29kIGZvciBsaXZlIGJhciBmZWVkYmFjay5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXZhbEZyb21TaWRlVG9Nb3ZlVG9XaGl0ZVBvc2l0aXZlKFxuICBldmFsQ3BTaWRlVG9Nb3ZlOiBudW1iZXIsXG4gIHNpZGVUb01vdmU6IFwid1wiIHwgXCJiXCIsXG4pOiBudW1iZXIge1xuICByZXR1cm4gc2lkZVRvTW92ZSA9PT0gXCJ3XCIgPyBldmFsQ3BTaWRlVG9Nb3ZlIDogLWV2YWxDcFNpZGVUb01vdmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3aGl0ZVBvc2l0aXZlRXZhbFRvV2luQ2hhbmNlcyh3aGl0ZVBvc2l0aXZlQ3A6IG51bWJlcik6IHtcbiAgd2hpdGU6IG51bWJlcjtcbiAgYmxhY2s6IG51bWJlcjtcbn0ge1xuICBjb25zdCBjbGFtcGVkID0gTWF0aC5tYXgoLTgwMDAsIE1hdGgubWluKDgwMDAsIHdoaXRlUG9zaXRpdmVDcCkpO1xuICBjb25zdCBwV2hpdGUgPSAxIC8gKDEgKyBNYXRoLnBvdygxMCwgLWNsYW1wZWQgLyA0MDApKTtcbiAgY29uc3Qgd2hpdGUgPSBNYXRoLnJvdW5kKHBXaGl0ZSAqIDEwMCk7XG4gIHJldHVybiB7IHdoaXRlOiB3aGl0ZSwgYmxhY2s6IDEwMCAtIHdoaXRlIH07XG59XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IE1vdmVRdWFsaXR5UHJlc2V0SWQgfSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuXG50eXBlIFNldHRpbmdzVGFiSWQgPVxuICB8ICdnZW5lcmFsJ1xuICB8ICdlbmdpbmUnXG4gIHwgJ3BlcnNvbmFsaXR5J1xuICB8ICdicmlsbGlhbnQnXG4gIHwgJ2FkdmFuY2VkJ1xuICB8ICdkZWJ1ZydcbiAgfCAnYWJvdXQnO1xuXG50eXBlIEFuaW1hdGlvblNwZWVkID0gJ3Nsb3cnIHwgJ25vcm1hbCcgfCAnZmFzdCc7XG50eXBlIFRoZW1lTW9kZSA9ICdkYXJrJyB8ICdsaWdodCcgfCAnbWluaW1hbCcgfCAncGVyc29uYSc7XG50eXBlIEJvYXJkU2l6ZVByZXNldCA9ICdzbWFsbCcgfCAnbWVkaXVtJyB8ICdsYXJnZScgfCAneGxhcmdlJztcbnR5cGUgQXV0b1BsYXlTcGVlZCA9ICdzbG93JyB8ICdub3JtYWwnIHwgJ2Zhc3QnO1xuXG5jb25zdCBCT0FSRF9TSVpFX1BSRVNFVF9QSVhFTFM6IFJlY29yZDxCb2FyZFNpemVQcmVzZXQsIG51bWJlcj4gPSB7XG4gIHNtYWxsOiA0ODAsXG4gIG1lZGl1bTogNjQwLFxuICBsYXJnZTogODAwLFxuICB4bGFyZ2U6IDk2MCxcbn07XG5cbmludGVyZmFjZSBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzIHtcbiAgYmFzaWNNb2RlOiBib29sZWFuO1xuICBhbmltYXRpb25TcGVlZDogQW5pbWF0aW9uU3BlZWQ7XG4gIHNvdW5kRW5hYmxlZDogYm9vbGVhbjtcbiAgc291bmRNdXRlZDogYm9vbGVhbjtcbiAgc291bmRWb2x1bWU6IG51bWJlcjtcbiAgYXV0b1BsYXlTcGVlZDogQXV0b1BsYXlTcGVlZDtcbiAgdGhlbWVNb2RlOiBUaGVtZU1vZGU7XG4gIGJvYXJkU2l6ZVByZXNldDogQm9hcmRTaXplUHJlc2V0O1xuICBzZWxlY3RlZFNldHRpbmdzVGFiOiBTZXR0aW5nc1RhYklkO1xufVxuXG5jb25zdCBVSV9QUkVGRVJFTkNFU19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfdWlfcHJlZmVyZW5jZXMnO1xuXG5jb25zdCBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTOiBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzID0ge1xuICBiYXNpY01vZGU6IHRydWUsXG4gIGFuaW1hdGlvblNwZWVkOiAnbm9ybWFsJyxcbiAgc291bmRFbmFibGVkOiB0cnVlLFxuICBzb3VuZE11dGVkOiBmYWxzZSxcbiAgc291bmRWb2x1bWU6IDcwLFxuICBhdXRvUGxheVNwZWVkOiAnbm9ybWFsJyxcbiAgdGhlbWVNb2RlOiAnZGFyaycsXG4gIGJvYXJkU2l6ZVByZXNldDogJ21lZGl1bScsXG4gIHNlbGVjdGVkU2V0dGluZ3NUYWI6ICdnZW5lcmFsJyxcbn07XG5cbmNvbnN0IEFVVE9fUExBWV9TUEVFRF9ERUxBWVM6IFJlY29yZDxBdXRvUGxheVNwZWVkLCBudW1iZXI+ID0ge1xuICBzbG93OiAxMjAwLFxuICBub3JtYWw6IDcwMCxcbiAgZmFzdDogMzUwLFxufTtcblxuZXhwb3J0IGNsYXNzIFVpU3RhdGVWaWV3TW9kZWwge1xuICBzZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgYmFzaWNNb2RlID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5iYXNpY01vZGU7XG4gIGFuaW1hdGlvblNwZWVkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5hbmltYXRpb25TcGVlZDtcbiAgc291bmRFbmFibGVkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZEVuYWJsZWQ7XG4gIHNvdW5kTXV0ZWQgPSBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnNvdW5kTXV0ZWQ7XG4gIHNvdW5kVm9sdW1lID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZFZvbHVtZTtcbiAgYXV0b1BsYXlTcGVlZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYXV0b1BsYXlTcGVlZDtcbiAgdGhlbWVNb2RlID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy50aGVtZU1vZGU7XG4gIGJvYXJkU2l6ZVByZXNldCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYm9hcmRTaXplUHJlc2V0O1xuICBzZWxlY3RlZFNldHRpbmdzVGFiOiBTZXR0aW5nc1RhYklkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zZWxlY3RlZFNldHRpbmdzVGFiO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXRTZXR0aW5nc09wZW46IGFjdGlvbixcbiAgICAgIGFwcGx5UHJvZmlsZVByZWZlcmVuY2VzOiBhY3Rpb24sXG4gICAgICBzZXRCYXNpY01vZGU6IGFjdGlvbixcbiAgICAgIHNldEFuaW1hdGlvblNwZWVkOiBhY3Rpb24sXG4gICAgICBzZXRTb3VuZEVuYWJsZWQ6IGFjdGlvbixcbiAgICAgIHNldFNvdW5kTXV0ZWQ6IGFjdGlvbixcbiAgICAgIHNldFNvdW5kVm9sdW1lOiBhY3Rpb24sXG4gICAgICBzZXRBdXRvUGxheVNwZWVkOiBhY3Rpb24sXG4gICAgICBzZXRUaGVtZU1vZGU6IGFjdGlvbixcbiAgICAgIHNldEJvYXJkU2l6ZVByZXNldDogYWN0aW9uLFxuICAgICAgc2V0U2VsZWN0ZWRTZXR0aW5nc1RhYjogYWN0aW9uLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZXN0b3JlRnJvbVN0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNldHRpbmdzT3BlbihvcGVuOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBvcGVuO1xuICB9XG5cbiAgYXBwbHlQcm9maWxlUHJlZmVyZW5jZXMocHJlZmVyZW5jZXM6IFBhcnRpYWw8UGljazxQZXJzaXN0ZWRVaVByZWZlcmVuY2VzLCAnYmFzaWNNb2RlJyB8ICd0aGVtZU1vZGUnPj4pOiB2b2lkIHtcbiAgICB0aGlzLmJhc2ljTW9kZSA9IHByZWZlcmVuY2VzLmJhc2ljTW9kZSA/PyB0aGlzLmJhc2ljTW9kZTtcbiAgICB0aGlzLnRoZW1lTW9kZSA9IHByZWZlcmVuY2VzLnRoZW1lTW9kZSA/PyB0aGlzLnRoZW1lTW9kZTtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldEJhc2ljTW9kZShlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5iYXNpY01vZGUgPSBlbmFibGVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0QW5pbWF0aW9uU3BlZWQoc3BlZWQ6IEFuaW1hdGlvblNwZWVkKTogdm9pZCB7XG4gICAgdGhpcy5hbmltYXRpb25TcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U291bmRFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNvdW5kRW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTb3VuZE11dGVkKG11dGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zb3VuZE11dGVkID0gbXV0ZWQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTb3VuZFZvbHVtZSh2b2x1bWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc291bmRWb2x1bWUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIE1hdGgucm91bmQodm9sdW1lKSkpO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0QXV0b1BsYXlTcGVlZChzcGVlZDogQXV0b1BsYXlTcGVlZCk6IHZvaWQge1xuICAgIHRoaXMuYXV0b1BsYXlTcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0VGhlbWVNb2RlKHRoZW1lTW9kZTogVGhlbWVNb2RlKTogdm9pZCB7XG4gICAgdGhpcy50aGVtZU1vZGUgPSB0aGVtZU1vZGU7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRCb2FyZFNpemVQcmVzZXQoYm9hcmRTaXplUHJlc2V0OiBCb2FyZFNpemVQcmVzZXQpOiB2b2lkIHtcbiAgICB0aGlzLmJvYXJkU2l6ZVByZXNldCA9IGJvYXJkU2l6ZVByZXNldDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkU2V0dGluZ3NUYWIodGFiOiBTZXR0aW5nc1RhYklkKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZFNldHRpbmdzVGFiID0gdGFiO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oVUlfUFJFRkVSRU5DRVNfU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKCFzYXZlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzIFBhcnRpYWw8UGVyc2lzdGVkVWlQcmVmZXJlbmNlcz47XG4gICAgICB0aGlzLmJhc2ljTW9kZSA9IHBhcnNlZC5iYXNpY01vZGUgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5iYXNpY01vZGU7XG4gICAgICB0aGlzLmFuaW1hdGlvblNwZWVkID0gcGFyc2VkLmFuaW1hdGlvblNwZWVkID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYW5pbWF0aW9uU3BlZWQ7XG4gICAgICB0aGlzLnNvdW5kRW5hYmxlZCA9IHBhcnNlZC5zb3VuZEVuYWJsZWQgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZEVuYWJsZWQ7XG4gICAgICB0aGlzLnNvdW5kTXV0ZWQgPSBwYXJzZWQuc291bmRNdXRlZCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnNvdW5kTXV0ZWQ7XG4gICAgICB0aGlzLnNvdW5kVm9sdW1lID0gdHlwZW9mIHBhcnNlZC5zb3VuZFZvbHVtZSA9PT0gJ251bWJlcidcbiAgICAgICAgPyBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIE1hdGgucm91bmQocGFyc2VkLnNvdW5kVm9sdW1lKSkpXG4gICAgICAgIDogREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZFZvbHVtZTtcbiAgICAgIHRoaXMuYXV0b1BsYXlTcGVlZCA9IHBhcnNlZC5hdXRvUGxheVNwZWVkID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYXV0b1BsYXlTcGVlZDtcbiAgICAgIHRoaXMudGhlbWVNb2RlID0gcGFyc2VkLnRoZW1lTW9kZSA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnRoZW1lTW9kZTtcbiAgICAgIHRoaXMuYm9hcmRTaXplUHJlc2V0ID0gcGFyc2VkLmJvYXJkU2l6ZVByZXNldCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmJvYXJkU2l6ZVByZXNldDtcbiAgICAgIHRoaXMuc2VsZWN0ZWRTZXR0aW5nc1RhYiA9IHBhcnNlZC5zZWxlY3RlZFNldHRpbmdzVGFiID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc2VsZWN0ZWRTZXR0aW5nc1RhYjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBpbnZhbGlkIFVJIHByZWZlcmVuY2Ugc25hcHNob3RzLlxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGVyc2lzdFRvU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgIFVJX1BSRUZFUkVOQ0VTX1NUT1JBR0VfS0VZLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgYmFzaWNNb2RlOiB0aGlzLmJhc2ljTW9kZSxcbiAgICAgICAgICBhbmltYXRpb25TcGVlZDogdGhpcy5hbmltYXRpb25TcGVlZCxcbiAgICAgICAgICBzb3VuZEVuYWJsZWQ6IHRoaXMuc291bmRFbmFibGVkLFxuICAgICAgICAgIHNvdW5kTXV0ZWQ6IHRoaXMuc291bmRNdXRlZCxcbiAgICAgICAgICBzb3VuZFZvbHVtZTogdGhpcy5zb3VuZFZvbHVtZSxcbiAgICAgICAgICBhdXRvUGxheVNwZWVkOiB0aGlzLmF1dG9QbGF5U3BlZWQsXG4gICAgICAgICAgdGhlbWVNb2RlOiB0aGlzLnRoZW1lTW9kZSxcbiAgICAgICAgICBib2FyZFNpemVQcmVzZXQ6IHRoaXMuYm9hcmRTaXplUHJlc2V0LFxuICAgICAgICAgIHNlbGVjdGVkU2V0dGluZ3NUYWI6IHRoaXMuc2VsZWN0ZWRTZXR0aW5nc1RhYixcbiAgICAgICAgfSBhcyBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzKSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgbG9jYWxTdG9yYWdlIGlzc3VlcyBhbmQga2VlcCBVSSByZXNwb25zaXZlLlxuICAgIH1cbiAgfVxuXG4gIGdldCBib2FyZFNpemVQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiBCT0FSRF9TSVpFX1BSRVNFVF9QSVhFTFNbdGhpcy5ib2FyZFNpemVQcmVzZXRdO1xuICB9XG5cbiAgZ2V0IGF1dG9QbGF5RGVsYXlNcygpOiBudW1iZXIge1xuICAgIHJldHVybiBBVVRPX1BMQVlfU1BFRURfREVMQVlTW3RoaXMuYXV0b1BsYXlTcGVlZF07XG4gIH1cblxuICBnZXQgZWZmZWN0aXZlU291bmRWb2x1bWUoKTogbnVtYmVyIHtcbiAgICBpZiAoIXRoaXMuc291bmRFbmFibGVkIHx8IHRoaXMuc291bmRNdXRlZCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc291bmRWb2x1bWUgLyAxMDA7XG4gIH1cblxuICBnZXRQZXJzb25hQWNjZW50VG9uZShwZXJzb25hSWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsKTogJ3JlZCcgfCAnZ29sZCcgfCAnYmx1ZScgfCAnZ3JlZW4nIHtcbiAgICBzd2l0Y2ggKHBlcnNvbmFJZCkge1xuICAgICAgY2FzZSAnYWdncmVzc2l2ZSc6XG4gICAgICAgIHJldHVybiAncmVkJztcbiAgICAgIGNhc2UgJ2hhcmQnOlxuICAgICAgY2FzZSAnc3VwZXJfaGFyZCc6XG4gICAgICAgIHJldHVybiAnZ29sZCc7XG4gICAgICBjYXNlICdsb3cnOlxuICAgICAgICByZXR1cm4gJ2dyZWVuJztcbiAgICAgIGNhc2UgJ21lZGl1bSc6XG4gICAgICBjYXNlIG51bGw6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ2JsdWUnO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgdWlTdGF0ZVZpZXdNb2RlbCA9IG5ldyBVaVN0YXRlVmlld01vZGVsKCk7XG5cbmV4cG9ydCB7IEJPQVJEX1NJWkVfUFJFU0VUX1BJWEVMUyB9O1xuZXhwb3J0IHR5cGUgeyBBbmltYXRpb25TcGVlZCwgQXV0b1BsYXlTcGVlZCwgQm9hcmRTaXplUHJlc2V0LCBTZXR0aW5nc1RhYklkLCBUaGVtZU1vZGUgfTtcbiIsICIvKipcbiAqIEJvYXJkIFZpZXdNb2RlbFxuICogVmlld01vZGVsIGxheWVyIC0gTW9iWCBzdG9yZSBmb3IgY2hlc3MgYm9hcmQgc3RhdGVcbiAqL1xuXG5pbXBvcnQgeyBtYWtlQXV0b09ic2VydmFibGUsIGFjdGlvbiwgcmVhY3Rpb24sIHJ1bkluQWN0aW9uIH0gZnJvbSBcIm1vYnhcIjtcbmltcG9ydCB7IENoZXNzLCBNb3ZlLCBTcXVhcmUgfSBmcm9tIFwiY2hlc3MuanNcIjtcbmltcG9ydCB7IGNhbkFwcGx5QW5hbHl6ZWRNb3ZlIH0gZnJvbSBcIi4uL2VuZ2luZS9hbmFseXNpc1NhZmV0eVwiO1xuaW1wb3J0IHtcbiAgZGVyaXZlQnJpbGxpYW50VXNhZ2UsXG4gIE1vdmVBbm5vdGF0aW9uLFxufSBmcm9tIFwiLi4vZW5naW5lL2JyaWxsaWFudFRyYWNraW5nXCI7XG5pbXBvcnQge1xuICBQZXJzaXN0ZWRCb2FyZFN0YXRlLFxuICBjcmVhdGVHYW1lU2Vzc2lvbklkLFxuICByZXNvbHZlUGduU3RhcnRGZW4sXG59IGZyb20gXCIuLi9lbmdpbmUvZ2FtZVNlc3Npb25cIjtcbmltcG9ydCB7IEdhbWVTZXR1cFByZXNldCB9IGZyb20gXCIuLi9lbmdpbmUvZ2FtZVNldHVwUHJlc2V0c1wiO1xuaW1wb3J0IHsgZW5naW5lVmlld01vZGVsIH0gZnJvbSBcIi4vRW5naW5lVmlld01vZGVsXCI7XG5pbXBvcnQgeyBjb25maWdWaWV3TW9kZWwgfSBmcm9tIFwiLi9Db25maWdWaWV3TW9kZWxcIjtcbmltcG9ydCB7IGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gZnJvbSBcIi4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWxcIjtcbmltcG9ydCB7IGNyZWF0ZURlYnVnTG9nZ2VyIH0gZnJvbSBcIi4uL3NoYXJlZC9kZWJ1Z1wiO1xuaW1wb3J0IHtcbiAgUGlja2VkTW92ZVJlc3VsdCxcbiAgTW92ZUJ1Y2tldCxcbiAgRGlzcGxheU1vdmVCdWNrZXQsXG4gIERJU1BMQVlfQlVDS0VUX0xBQkVMUyxcbiAgQlVDS0VUX0xBQkVMUyxcbiAgQlVDS0VUX0NPTE9SUyxcbiAgRElTUExBWV9CVUNLRVRfQ09MT1JTLFxufSBmcm9tIFwiLi4vZW5naW5lL3R5cGVzXCI7XG5pbXBvcnQgeyBjYWxjdWxhdGVIdW1hbkRlbGF5TXMgfSBmcm9tIFwiLi4vZW5naW5lL3BlcnNvbmFCaWFzXCI7XG5pbXBvcnQgeyBtYXBMZWdhbE1vdmVzVG9CdWNrZXRzIH0gZnJvbSBcIi4uL2VuZ2luZS9tb3ZlQ2xhc3NpZmllclwiO1xuaW1wb3J0IHtcbiAgZXZhbEZyb21TaWRlVG9Nb3ZlVG9XaGl0ZVBvc2l0aXZlLFxuICB3aGl0ZVBvc2l0aXZlRXZhbFRvV2luQ2hhbmNlcyxcbn0gZnJvbSBcIi4uL2VuZ2luZS93aW5Qcm9iYWJpbGl0eVwiO1xuaW1wb3J0IHsgdWlTdGF0ZVZpZXdNb2RlbCB9IGZyb20gXCIuL1VpU3RhdGVWaWV3TW9kZWxcIjtcblxuY29uc3QgbG9nZ2VyID0gY3JlYXRlRGVidWdMb2dnZXIoXCJCb2FyZFZpZXdNb2RlbFwiKTtcblxuZXhwb3J0IGludGVyZmFjZSBSZWNlbnRNb3ZlRmVlZGJhY2sge1xuICBpZDogc3RyaW5nO1xuICBhY3RvcjogXCJwbGF5ZXJcIiB8IFwiZW5naW5lXCIgfCBcInJlZG9cIjtcbiAgc2FuOiBzdHJpbmc7XG4gIHF1YWxpdHlMYWJlbD86IHN0cmluZyB8IG51bGw7XG4gIGJ1Y2tldD86IERpc3BsYXlNb3ZlQnVja2V0IHwgTW92ZUJ1Y2tldCB8IG51bGw7XG4gIGlzQnJpbGxpYW50OiBib29sZWFuO1xuICBpc0NhcHR1cmU6IGJvb2xlYW47XG4gIGlzQ2hlY2s6IGJvb2xlYW47XG4gIGlzR2FtZUVuZDogYm9vbGVhbjtcbiAgc2lsZW50OiBib29sZWFuO1xuICBjcmVhdGVkQXQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJvYXJkVmlld01vZGVsIHtcbiAgcHJpdmF0ZSBjaGVzczogQ2hlc3MgPSBuZXcgQ2hlc3MoKTtcbiAgZmVuID0gdGhpcy5jaGVzcy5mZW4oKTtcbiAgZ2FtZVN0YXJ0RmVuID0gdGhpcy5jaGVzcy5mZW4oKTtcbiAgZ2FtZVNlc3Npb25JZCA9IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKTtcbiAgc2Vzc2lvblN0YXJ0ZWRBdCA9IERhdGUubm93KCk7XG4gIGhpc3Rvcnk6IE1vdmVbXSA9IFtdO1xuICBsYXN0TW92ZTogeyBmcm9tOiBTcXVhcmU7IHRvOiBTcXVhcmUgfSB8IG51bGwgPSBudWxsO1xuICBsYXN0UGxheWVkQnVja2V0OiBNb3ZlQnVja2V0IHwgbnVsbCA9IG51bGw7XG4gIHN0YXR1c01lc3NhZ2UgPSBcIlJlYWR5XCI7XG4gIGxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2U6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBpc1RoaW5raW5nID0gZmFsc2U7XG4gIGF1dG9QbGF5RW5hYmxlZCA9IHRydWU7IC8vIEF1dG8tcGxheSBlbmdpbmUgbW92ZXMgYWZ0ZXIgaHVtYW4gbW92ZXNcbiAgZW5naW5lUGxheXNGb3I6IFwid1wiIHwgXCJiXCIgPSBcImJcIjsgLy8gV2hpY2ggc2lkZSB0aGUgZW5naW5lIHBsYXlzIGZvciAoZGVmYXVsdDogYmxhY2spXG4gIGJvYXJkRmxpcHBlZCA9IGZhbHNlOyAvLyBCb2FyZCBvcmllbnRhdGlvbiAoZmFsc2UgPSB3aGl0ZSBvbiBib3R0b20sIHRydWUgPSBibGFjayBvbiBib3R0b20pXG4gIHNob3dNb3ZlQXJyb3dzID0gZmFsc2U7IC8vIFNob3cgYXJyb3dzIGZvciBhbGwgcG9zc2libGUgbW92ZXNcbiAgc2hvd0Fycm93c0ZvclNpZGU6IFwiY3VycmVudFwiIHwgXCJwbGF5ZXJcIiB8IFwiZW5naW5lXCIgPSBcImN1cnJlbnRcIjsgLy8gV2hpY2ggc2lkZSdzIG1vdmVzIHRvIHNob3cgYXJyb3dzIGZvclxuICBsYXN0UGxheWVyTW92ZVF1YWxpdHk6IERpc3BsYXlNb3ZlQnVja2V0IHwgbnVsbCA9IG51bGw7IC8vIFF1YWxpdHkgb2YgdGhlIGxhc3QgcGxheWVyIG1vdmVcbiAgaXNBbmFseXppbmdNb3ZlcyA9IGZhbHNlOyAvLyBXaGV0aGVyIHdlJ3JlIGN1cnJlbnRseSBhbmFseXppbmcgbW92ZXNcbiAgYXV0b1BsYXlQYXVzZWQgPSBmYWxzZTtcbiAgYXV0b1BsYXlTY2hlZHVsZWRGb3IgPSAwO1xuICBjdXJyZW50U2V0dXBOYW1lID0gXCJOZXcgR2FtZVwiO1xuICBjdXJyZW50U2V0dXBDYXRlZ29yeSA9IFwiY3VzdG9tXCI7XG4gIHJlY2VudE1vdmVGZWVkYmFjazogUmVjZW50TW92ZUZlZWRiYWNrIHwgbnVsbCA9IG51bGw7XG4gIGF1dG9QbGF5QWNjdW11bGF0ZWRNcyA9IDA7XG4gIGF1dG9QbGF5TGFzdFJlc3VtZWRBdDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIC8qKiBBcHByb3hpbWF0ZSB3aW4gc2hhcmUgZnJvbSBlbmdpbmUgZXZhbCAoMFx1MjAxMzEwMCk7IHVwZGF0ZXMgYWZ0ZXIgZWFjaCBwb3NpdGlvbiBjaGFuZ2UuICovXG4gIHdpbkNoYW5jZVdoaXRlUGVyY2VudCA9IDUwO1xuICB3aW5DaGFuY2VCbGFja1BlcmNlbnQgPSA1MDtcbiAgd2luQ2hhbmNlc0xvYWRpbmcgPSBmYWxzZTtcblxuICAvLyBTdG9yZSBhbmFseXplZCBtb3ZlcyBhcyBhbiBvYmplY3QgZm9yIE1vYlggb2JzZXJ2YWJpbGl0eVxuICBwcml2YXRlIF9hbmFseXplZExlZ2FsTW92ZXM6IFJlY29yZDxzdHJpbmcsIERpc3BsYXlNb3ZlQnVja2V0PiA9IHt9O1xuICBwcml2YXRlIHJlZG9TdGFjazogTW92ZVtdID0gW107IC8vIFN0YWNrIG9mIG1vdmVzIHRoYXQgd2VyZSB1bmRvbmUgZm9yIHJlZG8gZnVuY3Rpb25hbGl0eVxuICBwcml2YXRlIGhpc3RvcnlBbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSA9IFtdO1xuICBwcml2YXRlIHJlZG9Bbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSA9IFtdO1xuICBwcml2YXRlIGFuYWx5emVkTGVnYWxNb3Zlc0Zlbjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2FuYWx5c2lzVGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDsgLy8gVGltZW91dCBmb3IgZGVib3VuY2luZyBtb3ZlIGFuYWx5c2lzXG4gIHByaXZhdGUgX2F1dG9QbGF5VGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfcGxheWVyTW92ZUFuYWx5c2lzVGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfd2luQ2hhbmNlVGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfd2luQ2hhbmNlUmVxdWVzdFNlcSA9IDA7XG4gIHByaXZhdGUgcmVhZG9ubHkgRkVOX1NUT1JBR0VfS0VZID0gXCJwZXJzb25hY2hlc3NfY3VycmVudF9mZW5cIjtcbiAgcHJpdmF0ZSByZWFkb25seSBGRU5fSElTVE9SWV9LRVkgPSBcInBlcnNvbmFjaGVzc19mZW5faGlzdG9yeVwiO1xuICBwcml2YXRlIHJlYWRvbmx5IEJPQVJEX1NUQVRFX1NUT1JBR0VfS0VZID0gXCJwZXJzb25hY2hlc3NfYm9hcmRfc3RhdGVcIjtcbiAgcHJpdmF0ZSByZWFkb25seSBNQVhfSElTVE9SWSA9IDUwOyAvLyBNYXhpbXVtIG51bWJlciBvZiBGRU4gcG9zaXRpb25zIHRvIHN0b3JlXG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIGxvYWRGZW46IGFjdGlvbixcbiAgICAgIGxvYWRQZ246IGFjdGlvbixcbiAgICAgIGxvYWRHYW1lU2V0dXBQcmVzZXQ6IGFjdGlvbixcbiAgICAgIG1ha2VNb3ZlOiBhY3Rpb24sXG4gICAgICBzb2x2ZU5leHRNb3ZlOiBhY3Rpb24sXG4gICAgICByZXNldDogYWN0aW9uLFxuICAgICAgdW5kbzogYWN0aW9uLFxuICAgICAgdW5kb1NpbmdsZTogYWN0aW9uLFxuICAgICAgcmVkb1NpbmdsZTogYWN0aW9uLFxuICAgICAgc2V0QXV0b1BsYXk6IGFjdGlvbixcbiAgICAgIHNldEF1dG9QbGF5UGF1c2VkOiBhY3Rpb24sXG4gICAgICBzdGFydEF1dG9QbGF5VHVybjogYWN0aW9uLFxuICAgICAgdG9nZ2xlQXV0b1BsYXlQYXVzZTogYWN0aW9uLFxuICAgICAgc2V0RW5naW5lUGxheXNGb3I6IGFjdGlvbixcbiAgICAgIGZsaXBCb2FyZDogYWN0aW9uLFxuICAgICAgc2V0Qm9hcmRGbGlwcGVkOiBhY3Rpb24sXG4gICAgICBzYXZlRmVuVG9IaXN0b3J5OiBhY3Rpb24sXG4gICAgICBsb2FkRmVuRnJvbUhpc3Rvcnk6IGFjdGlvbixcbiAgICAgIHRvZ2dsZU1vdmVBcnJvd3M6IGFjdGlvbixcbiAgICAgIHNldFNob3dNb3ZlQXJyb3dzRW5hYmxlZDogYWN0aW9uLFxuICAgICAgc2V0U2hvd0Fycm93c0ZvclNpZGU6IGFjdGlvbixcbiAgICAgIGFuYWx5emVBbGxNb3ZlczogYWN0aW9uLFxuICAgICAgYW5hbHl6ZVBsYXllck1vdmU6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIC8vIFRyeSB0byByZXN0b3JlIEZFTiBmcm9tIGxvY2FsU3RvcmFnZSBvbiBpbml0aWFsaXphdGlvblxuICAgIHRoaXMucmVzdG9yZUZlbkZyb21TdG9yYWdlKCk7XG5cbiAgICByZWFjdGlvbihcbiAgICAgICgpID0+IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnBlcnNpc3RFbmdpbmVDb25maWcsXG4gICAgICAocGVyc2lzdEVuZ2luZUNvbmZpZykgPT4ge1xuICAgICAgICBpZiAoIXBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgICB0aGlzLmNsZWFyUGVyc2lzdGVkQm9hcmRTdGF0ZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2F2ZUZlblRvSGlzdG9yeSgpO1xuICAgICAgfSxcbiAgICAgIHsgZmlyZUltbWVkaWF0ZWx5OiB0cnVlIH0sXG4gICAgKTtcblxuICAgIGxvZ2dlci5kZWJ1ZyhcIkluaXRpYWxpemVkIHdpdGggRkVOOlwiLCB0aGlzLmZlbik7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGF1dG8tcGxheSBtb2RlXG4gICAqL1xuICBzZXRBdXRvUGxheShlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXlFbmFibGVkICYmICFlbmFibGVkKSB7XG4gICAgICB0aGlzLnN0b3BBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTtcbiAgICB9XG5cbiAgICB0aGlzLmF1dG9QbGF5RW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgaWYgKCFlbmFibGVkKSB7XG4gICAgICB0aGlzLmF1dG9QbGF5UGF1c2VkID0gZmFsc2U7XG4gICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0QXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zeW5jQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIGxvZ2dlci5kZWJ1ZyhcIkF1dG8tcGxheSBzZXQgdG86XCIsIGVuYWJsZWQpO1xuICB9XG5cbiAgc2V0QXV0b1BsYXlQYXVzZWQocGF1c2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHBhdXNlZCkge1xuICAgICAgdGhpcy5zdG9wQXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhcnRBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTtcbiAgICB9XG5cbiAgICB0aGlzLmF1dG9QbGF5UGF1c2VkID0gcGF1c2VkO1xuICAgIGlmIChwYXVzZWQpIHtcbiAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3luY0F1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdGFydEF1dG9QbGF5VHVybigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuY2FuU3RhcnRBdXRvUGxheVR1cm4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIGF3YWl0IHRoaXMuc29sdmVOZXh0TW92ZSh0cnVlKTtcbiAgfVxuXG4gIHRvZ2dsZUF1dG9QbGF5UGF1c2UoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRBdXRvUGxheVBhdXNlZCghdGhpcy5hdXRvUGxheVBhdXNlZCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoaWNoIHNpZGUgdGhlIGVuZ2luZSBwbGF5cyBmb3JcbiAgICovXG4gIHNldEVuZ2luZVBsYXlzRm9yKHNpZGU6IFwid1wiIHwgXCJiXCIpOiB2b2lkIHtcbiAgICB0aGlzLmVuZ2luZVBsYXlzRm9yID0gc2lkZTtcbiAgICB0aGlzLnN5bmNBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgbG9nZ2VyLmRlYnVnKFwiRW5naW5lIHBsYXlzIGZvcjpcIiwgc2lkZSA9PT0gXCJ3XCIgPyBcIldoaXRlXCIgOiBcIkJsYWNrXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgYSBwb3NpdGlvbiBmcm9tIEZFTiBzdHJpbmdcbiAgICovXG4gIGxvYWRGZW4oXG4gICAgZmVuOiBzdHJpbmcsXG4gICAgb3B0aW9uczoge1xuICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZz86IGJvb2xlYW47XG4gICAgICBzZXNzaW9uSWQ/OiBzdHJpbmc7XG4gICAgICBnYW1lU3RhcnRGZW4/OiBzdHJpbmc7XG4gICAgICBoaXN0b3J5QW5ub3RhdGlvbnM/OiBNb3ZlQW5ub3RhdGlvbltdO1xuICAgICAgcmVkb0Fubm90YXRpb25zPzogTW92ZUFubm90YXRpb25bXTtcbiAgICAgIHNldHVwTmFtZT86IHN0cmluZztcbiAgICAgIHNldHVwQ2F0ZWdvcnk/OiBzdHJpbmc7XG4gICAgfSA9IHt9LFxuICApOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qge1xuICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nID0gdHJ1ZSxcbiAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICBnYW1lU3RhcnRGZW4sXG4gICAgICAgIGhpc3RvcnlBbm5vdGF0aW9ucyxcbiAgICAgICAgcmVkb0Fubm90YXRpb25zLFxuICAgICAgICBzZXR1cE5hbWUsXG4gICAgICAgIHNldHVwQ2F0ZWdvcnksXG4gICAgICB9ID0gb3B0aW9ucztcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcImxvYWRGZW4gY2FsbGVkOlwiLCBmZW4pO1xuICAgICAgY29uc3QgbmV3Q2hlc3MgPSBuZXcgQ2hlc3MoZmVuKTtcbiAgICAgIHRoaXMuY2hlc3MgPSBuZXdDaGVzcztcbiAgICAgIHRoaXMuYmVnaW5TZXNzaW9uU3RhdGUoe1xuICAgICAgICBnYW1lU2Vzc2lvbklkOiBzZXNzaW9uSWQgPz8gY3JlYXRlR2FtZVNlc3Npb25JZCgpLFxuICAgICAgICBnYW1lU3RhcnRGZW46IGdhbWVTdGFydEZlbiA/PyBmZW4sXG4gICAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmcsXG4gICAgICAgIGhpc3RvcnlBbm5vdGF0aW9ucyxcbiAgICAgICAgcmVkb0Fubm90YXRpb25zLFxuICAgICAgICBzZXR1cE5hbWUsXG4gICAgICAgIHNldHVwQ2F0ZWdvcnksXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVzZXRUcmFuc2llbnRCb2FyZFN0YXRlKCk7XG4gICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBcIlBvc2l0aW9uIGxvYWRlZFwiO1xuICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcbiAgICAgIHRoaXMucmVjZW50TW92ZUZlZWRiYWNrID0gbnVsbDtcbiAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXN0YXJ0KCk7XG4gICAgICBsb2dnZXIuZGVidWcoXCJGRU4gbG9hZGVkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKFwibG9hZEZlbiBlcnJvcjpcIiwgZXJyKTtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBJbnZhbGlkIEZFTjogJHtlcnJ9YDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBhIGdhbWUgZnJvbSBQR04gc3RyaW5nXG4gICAqL1xuICBsb2FkUGduKFxuICAgIHBnbjogc3RyaW5nLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc/OiBib29sZWFuO1xuICAgICAgc2Vzc2lvbklkPzogc3RyaW5nO1xuICAgICAgc2V0dXBOYW1lPzogc3RyaW5nO1xuICAgICAgc2V0dXBDYXRlZ29yeT86IHN0cmluZztcbiAgICB9ID0ge30sXG4gICk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmcgPSB0cnVlLFxuICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgIHNldHVwTmFtZSxcbiAgICAgICAgc2V0dXBDYXRlZ29yeSxcbiAgICAgIH0gPSBvcHRpb25zO1xuICAgICAgbG9nZ2VyLmRlYnVnKFwibG9hZFBnbiBjYWxsZWRcIik7XG4gICAgICBjb25zdCBuZXdDaGVzcyA9IG5ldyBDaGVzcygpO1xuICAgICAgbmV3Q2hlc3MubG9hZFBnbihwZ24pO1xuICAgICAgY29uc3QgZ2FtZVN0YXJ0RmVuID0gcmVzb2x2ZVBnblN0YXJ0RmVuKFxuICAgICAgICBuZXdDaGVzcy5oZWFkZXIoKSxcbiAgICAgICAgbmV3IENoZXNzKCkuZmVuKCksXG4gICAgICApO1xuICAgICAgdGhpcy5jaGVzcyA9IG5ld0NoZXNzO1xuICAgICAgdGhpcy5iZWdpblNlc3Npb25TdGF0ZSh7XG4gICAgICAgIGdhbWVTZXNzaW9uSWQ6IHNlc3Npb25JZCA/PyBjcmVhdGVHYW1lU2Vzc2lvbklkKCksXG4gICAgICAgIGdhbWVTdGFydEZlbixcbiAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZyxcbiAgICAgICAgc2V0dXBOYW1lLFxuICAgICAgICBzZXR1cENhdGVnb3J5LFxuICAgICAgfSk7XG4gICAgICB0aGlzLnJlc2V0VHJhbnNpZW50Qm9hcmRTdGF0ZSgpO1xuICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJQR04gbG9hZGVkXCI7XG4gICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgICAgdGhpcy5yZWNlbnRNb3ZlRmVlZGJhY2sgPSBudWxsO1xuICAgICAgZW5naW5lVmlld01vZGVsLnJlc3RhcnQoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKFwibG9hZFBnbiBlcnJvcjpcIiwgZXJyKTtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBJbnZhbGlkIFBHTjogJHtlcnJ9YDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBsb2FkR2FtZVNldHVwUHJlc2V0KHByZXNldDogR2FtZVNldHVwUHJlc2V0KTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc2lkZUxhYmVsID0gcHJlc2V0LnNpZGUgPT09IFwid2hpdGVcIiA/IFwiV2hpdGVcIiA6IFwiQmxhY2tcIjtcbiAgICBjb25zdCBsb2FkZWQgPVxuICAgICAgcHJlc2V0LnNvdXJjZVR5cGUgPT09IFwiZmVuXCJcbiAgICAgICAgPyB0aGlzLmxvYWRGZW4ocHJlc2V0LnNvdXJjZSwge1xuICAgICAgICAgICAgc2V0dXBOYW1lOiBwcmVzZXQubmFtZSxcbiAgICAgICAgICAgIHNldHVwQ2F0ZWdvcnk6IHByZXNldC5jYXRlZ29yeSxcbiAgICAgICAgICB9KVxuICAgICAgICA6IHRoaXMubG9hZFBnbihwcmVzZXQuc291cmNlLCB7XG4gICAgICAgICAgICBzZXR1cE5hbWU6IHByZXNldC5uYW1lLFxuICAgICAgICAgICAgc2V0dXBDYXRlZ29yeTogcHJlc2V0LmNhdGVnb3J5LFxuICAgICAgICAgIH0pO1xuXG4gICAgaWYgKGxvYWRlZCkge1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYCR7cHJlc2V0Lm5hbWV9IGxvYWRlZCAoJHtzaWRlTGFiZWx9KWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvYWRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGEgbW92ZSBvbiB0aGUgYm9hcmQgKHNpbWlsYXIgdG8gdGhlIGV4YW1wbGUgcGF0dGVybilcbiAgICogVGhpcyBpcyBzeW5jaHJvbm91cyBmb3IgaW1tZWRpYXRlIFVJIGZlZWRiYWNrLCBqdXN0IGxpa2UgdGhlIGV4YW1wbGVcbiAgICovXG4gIG1ha2VNb3ZlKGZyb206IFNxdWFyZSwgdG86IFNxdWFyZSwgcHJvbW90aW9uID0gXCJxXCIpOiBib29sZWFuIHtcbiAgICBsb2dnZXIuZGVidWcoXCJtYWtlTW92ZSBjYWxsZWRcIiwge1xuICAgICAgZnJvbSxcbiAgICAgIHRvLFxuICAgICAgcHJvbW90aW9uLFxuICAgICAgY3VycmVudEZlbjogdGhpcy5mZW4sXG4gICAgICBjdXJyZW50VHVybjogdGhpcy5jaGVzcy50dXJuKCksXG4gICAgfSk7XG5cbiAgICB0cnkge1xuICAgICAgLy8gVHJ5IHRvIG1ha2UgdGhlIG1vdmUgYWNjb3JkaW5nIHRvIGNoZXNzLmpzIGxvZ2ljIChleGFjdGx5IGxpa2UgdGhlIGV4YW1wbGUpXG4gICAgICAvLyBjaGVzcy5qcyB3aWxsIHZhbGlkYXRlIHRoZSBtb3ZlIGF1dG9tYXRpY2FsbHlcbiAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLm1vdmUoe1xuICAgICAgICBmcm9tLFxuICAgICAgICB0byxcbiAgICAgICAgcHJvbW90aW9uOiBwcm9tb3Rpb24gYXMgXCJxXCIgfCBcInJcIiB8IFwiYlwiIHwgXCJuXCIgfCB1bmRlZmluZWQsXG4gICAgICB9KTtcblxuICAgICAgaWYgKG1vdmUpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiTW92ZSBzdWNjZXNzZnVsOlwiLCBtb3ZlLnNhbik7XG4gICAgICAgIC8vIENsZWFyIHJlZG8gc3RhY2sgd2hlbiBhIG5ldyBtb3ZlIGlzIG1hZGVcbiAgICAgICAgdGhpcy5jbGVhclJlZG9TdGF0ZSgpO1xuICAgICAgICB0aGlzLnJlY29yZE1vdmVBbm5vdGF0aW9uKG1vdmUsIGZhbHNlLCBcInBsYXllclwiKTtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBwb3NpdGlvbiBzdGF0ZSB0byB0cmlnZ2VyIGEgcmUtcmVuZGVyICh2aWEgTW9iWCBvYnNlcnZhYmxlKVxuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSB7IGZyb20sIHRvIH07XG4gICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBZb3UgcGxheWVkOiAke21vdmUuc2FufWA7XG4gICAgICAgIHRoaXMucHVibGlzaE1vdmVGZWVkYmFjayh7XG4gICAgICAgICAgYWN0b3I6IFwicGxheWVyXCIsXG4gICAgICAgICAgbW92ZSxcbiAgICAgICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcblxuICAgICAgICBjb25zdCBzaG91bGRBdXRvUGxheU5vdyA9XG4gICAgICAgICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgJiZcbiAgICAgICAgICAhdGhpcy5pc0dhbWVPdmVyICYmXG4gICAgICAgICAgdGhpcy5jaGVzcy50dXJuKCkgPT09IHRoaXMuZW5naW5lUGxheXNGb3I7XG5cbiAgICAgICAgLy8gTWFrZSBlbmdpbmUgbW92ZSBhZnRlciBhIHNob3J0IGRlbGF5IGlmOlxuICAgICAgICAvLyAxLiBBdXRvLXBsYXkgaXMgZW5hYmxlZFxuICAgICAgICAvLyAyLiBHYW1lIGlzIG5vdCBvdmVyXG4gICAgICAgIC8vIDMuIEl0J3Mgbm93IHRoZSBlbmdpbmUncyB0dXJuICh0aGUgdHVybiBjaGFuZ2VkIGFmdGVyIHRoZSBodW1hbiBtb3ZlKVxuICAgICAgICBpZiAoc2hvdWxkQXV0b1BsYXlOb3cpIHtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoXG4gICAgICAgICAgICBcIlNjaGVkdWxpbmcgYXV0by1wbGF5IGZvciBlbmdpbmUgc2lkZTpcIixcbiAgICAgICAgICAgIHRoaXMuZW5naW5lUGxheXNGb3IsXG4gICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLnNjaGVkdWxlQXV0b1BsYXlNb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWZlciBwbGF5ZXItbW92ZSBncmFkaW5nIHdoaWxlIGFuIGVuZ2luZSBhdXRvLXBsYXkgcmVwbHkgaXMgcGVuZGluZyBzb1xuICAgICAgICAvLyB0aGUgc2hhcmVkIFN0b2NrZmlzaCB3b3JrZXIgY2FuIHByaW9yaXRpemUgdGhlIGFjdHVhbCBtb3ZlIHJlc3BvbnNlLlxuICAgICAgICB0aGlzLnNjaGVkdWxlUGxheWVyTW92ZUFuYWx5c2lzKG1vdmUpO1xuXG4gICAgICAgIC8vIFJldHVybiB0cnVlIGFzIHRoZSBtb3ZlIHdhcyBzdWNjZXNzZnVsXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiTW92ZSBmYWlsZWQgLSBjaGVzcy5qcyByZXR1cm5lZCBudWxsXCIpO1xuICAgICAgICAvLyBSZXR1cm4gZmFsc2UgYXMgdGhlIG1vdmUgd2FzIG5vdCBzdWNjZXNzZnVsXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcIk1vdmUgZXhjZXB0aW9uOlwiLCBlcnIpO1xuICAgICAgLy8gUmV0dXJuIGZhbHNlIGFzIHRoZSBtb3ZlIHdhcyBub3Qgc3VjY2Vzc2Z1bFxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGEgbW92ZSBmcm9tIFVDSSBub3RhdGlvbiAoZS5nLiwgXCJlMmU0XCIpXG4gICAqIFVzZWQgYnkgdGhlIGVuZ2luZVxuICAgKi9cbiAgYXN5bmMgbWFrZU1vdmVVQ0koXG4gICAgdWNpOiBzdHJpbmcsXG4gICAgb3B0aW9uczogeyBjb25zdW1lZEJyaWxsaWFudD86IGJvb2xlYW4gfSA9IHt9LFxuICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodWNpLmxlbmd0aCA8IDQpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGZyb20gPSB1Y2kuc2xpY2UoMCwgMikgYXMgU3F1YXJlO1xuICAgIGNvbnN0IHRvID0gdWNpLnNsaWNlKDIsIDQpIGFzIFNxdWFyZTtcbiAgICBjb25zdCBwcm9tb3Rpb24gPSB1Y2kubGVuZ3RoID4gNCA/IHVjaVs0XSA6IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgZnJvbSxcbiAgICAgICAgdG8sXG4gICAgICAgIHByb21vdGlvbjogcHJvbW90aW9uIGFzIFwicVwiIHwgXCJyXCIgfCBcImJcIiB8IFwiblwiIHwgdW5kZWZpbmVkLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChtb3ZlKSB7XG4gICAgICAgIC8vIENsZWFyIHJlZG8gc3RhY2sgd2hlbiBhIG5ldyBtb3ZlIGlzIG1hZGVcbiAgICAgICAgdGhpcy5jbGVhclJlZG9TdGF0ZSgpO1xuICAgICAgICB0aGlzLnJlY29yZE1vdmVBbm5vdGF0aW9uKFxuICAgICAgICAgIG1vdmUsXG4gICAgICAgICAgb3B0aW9ucy5jb25zdW1lZEJyaWxsaWFudCA/PyBmYWxzZSxcbiAgICAgICAgICBcImVuZ2luZVwiLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSB7IGZyb20sIHRvIH07XG4gICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBFbmdpbmUgcGxheWVkOiAke21vdmUuc2FufWA7XG4gICAgICAgIHRoaXMucHVibGlzaE1vdmVGZWVkYmFjayh7XG4gICAgICAgICAgYWN0b3I6IFwiZW5naW5lXCIsXG4gICAgICAgICAgbW92ZSxcbiAgICAgICAgICBpc0JyaWxsaWFudDogb3B0aW9ucy5jb25zdW1lZEJyaWxsaWFudCA/PyBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU29sdmUgYW5kIHBsYXkgdGhlIG5leHQgbW92ZSB1c2luZyB0aGUgZW5naW5lIGFuZCBidWNrZXQgY29uZmlndXJhdGlvblxuICAgKi9cbiAgYXN5bmMgc29sdmVOZXh0TW92ZShhdXRvVHJpZ2dlcmVkID0gZmFsc2UpOiBQcm9taXNlPFBpY2tlZE1vdmVSZXN1bHQgfCBudWxsPiB7XG4gICAgaWYgKHRoaXMuaXNHYW1lT3Zlcikge1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJHYW1lIGlzIG92ZXJcIjtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNUaGlua2luZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiRW5naW5lIHRoaW5raW5nLi4uXCI7XG4gICAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBlbmdpbmUgaWYgbmVlZGVkXG4gICAgICBpZiAoIWVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkKSB7XG4gICAgICAgIGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFuYWx5emUgY3VycmVudCBwb3NpdGlvblxuICAgICAgY29uc3QgYW5hbHlzaXMgPSBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uKFxuICAgICAgICB0aGlzLmZlbixcbiAgICAgICAgY29uZmlnVmlld01vZGVsLmRlcHRoLFxuICAgICAgICBjb25maWdWaWV3TW9kZWwubXVsdGlQVixcbiAgICAgICAgXCJlbmdpbmVNb3ZlXCIsXG4gICAgICApO1xuXG4gICAgICAvLyBDaGVjayBpZiBhbmFseXNpcyByZXR1cm5lZCBubyBtb3ZlcyAoZ2FtZSBvdmVyIHBvc2l0aW9uKVxuICAgICAgaWYgKGFuYWx5c2lzLmlnbm9yZWQgfHwgYW5hbHlzaXMubW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICBpZiAoYW5hbHlzaXMuaWdub3JlZCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJFbmdpbmUgYW5hbHlzaXMgZXhwaXJlZFwiO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0NoZWNrbWF0ZSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJDaGVja21hdGUhIEdhbWUgb3Zlci5cIjtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNTdGFsZW1hdGUpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiU3RhbGVtYXRlISBHYW1lIG92ZXIuXCI7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzRHJhdykge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJEcmF3ISBHYW1lIG92ZXIuXCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiTm8gbGVnYWwgbW92ZXMgYXZhaWxhYmxlXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGFzdFNraXBwZWRFbmdpbmVNb3ZlTWVzc2FnZSA9IGFuYWx5c2lzLmlnbm9yZWRcbiAgICAgICAgICAgID8gXCJBIG5ld2VyIGVuZ2luZSBhbmFseXNpcyByZXBsYWNlZCB0aGlzIG1vdmUgcmVxdWVzdC5cIlxuICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFBpY2sgYSBtb3ZlIGJhc2VkIG9uIGJ1Y2tldCBjb25maWd1cmF0aW9uXG4gICAgICBjb25zdCBwZXJzb25hID0gY29uZmlnVmlld01vZGVsLmN1cnJlbnRQcmVzZXRJZCA/PyBcImN1c3RvbVwiO1xuICAgICAgY29uc3QgcmVzdWx0ID0gZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzKFxuICAgICAgICBhbmFseXNpcyxcbiAgICAgICAgY29uZmlnVmlld01vZGVsLmJ1Y2tldENvbmZpZyxcbiAgICAgICAge1xuICAgICAgICAgIGZlbjogdGhpcy5mZW4sXG4gICAgICAgICAgZ2FtZVN0YXJ0RmVuOiB0aGlzLmdhbWVTdGFydEZlbixcbiAgICAgICAgICBtb3ZlQ291bnQ6IHRoaXMubW92ZUNvdW50LFxuICAgICAgICAgIHNpZGVUb01vdmU6IHRoaXMudHVybixcbiAgICAgICAgICBwZXJzb25hLFxuICAgICAgICB9LFxuICAgICAgKTtcblxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBpZiAoYXV0b1RyaWdnZXJlZCAmJiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VIdW1hbkRlbGF5U2ltdWxhdGlvbikge1xuICAgICAgICAgIGNvbnN0IGRlbGF5TXMgPSBjYWxjdWxhdGVIdW1hbkRlbGF5TXMoe1xuICAgICAgICAgICAgY29tcGxleGl0eTogYW5hbHlzaXMuY29tcGxleGl0eSxcbiAgICAgICAgICAgIHBlcnNvbmEsXG4gICAgICAgICAgICBidWNrZXQ6IHJlc3VsdC5idWNrZXQsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYXdhaXQgdGhpcy53YWl0KGRlbGF5TXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjYW5BcHBseUFuYWx5emVkTW92ZSh0aGlzLmZlbiwgYW5hbHlzaXMuYW5hbHl6ZWRGZW4pKSB7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID1cbiAgICAgICAgICAgICAgXCJQb3NpdGlvbiBjaGFuZ2VkLCBzdGFsZSBlbmdpbmUgbW92ZSBkaXNjYXJkZWRcIjtcbiAgICAgICAgICAgIHRoaXMubGFzdFNraXBwZWRFbmdpbmVNb3ZlTWVzc2FnZSA9XG4gICAgICAgICAgICAgIFwiU2tpcHBlZCBlbmdpbmUgbW92ZSBiZWNhdXNlIHRoZSBib2FyZCBjaGFuZ2VkIGJlZm9yZSBpdCBjb3VsZCBiZSBwbGF5ZWQuXCI7XG4gICAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFwcGx5IHRoZSBwaWNrZWQgbW92ZVxuICAgICAgICBjb25zdCBtb3ZlU3VjY2VzcyA9IGF3YWl0IHRoaXMubWFrZU1vdmVVQ0kocmVzdWx0Lm1vdmUubW92ZSwge1xuICAgICAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiByZXN1bHQuaXNCcmlsbGlhbnQgPz8gZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChtb3ZlU3VjY2Vzcykge1xuICAgICAgICAgIHRoaXMudXBkYXRlTGFzdEFubm90YXRpb24oe1xuICAgICAgICAgICAgYnVja2V0OiByZXN1bHQuYnVja2V0LFxuICAgICAgICAgICAgZXZhbExvc3M6IHJlc3VsdC5tb3ZlLmV2YWxMb3NzLFxuICAgICAgICAgICAgZXZhbHVhdGlvbjogcmVzdWx0Lm1vdmUuZXZhbHVhdGlvbixcbiAgICAgICAgICAgIGNvbXBsZXhpdHlMZXZlbDogYW5hbHlzaXMuY29tcGxleGl0eS5sZXZlbCxcbiAgICAgICAgICAgIGNvbXBsZXhpdHlTY29yZTogYW5hbHlzaXMuY29tcGxleGl0eS5zY29yZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSByZXN1bHQuYnVja2V0O1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gcmVzdWx0LmlzQnJpbGxpYW50XG4gICAgICAgICAgICAgID8gXCJFbmdpbmUgcGxheWVkOiBCcmlsbGlhbnQgbW92ZVwiXG4gICAgICAgICAgICAgIDogYEVuZ2luZSBwbGF5ZWQ6ICR7QlVDS0VUX0xBQkVMU1tyZXN1bHQuYnVja2V0XX0gbW92ZWA7XG4gICAgICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJFbmdpbmUgbW92ZSBmYWlsZWRcIjtcbiAgICAgICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBcIk5vIG1vdmVzIGF2YWlsYWJsZVwiO1xuICAgICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoXCJzb2x2ZU5leHRNb3ZlIGVycm9yOlwiLCBlcnIpO1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgRXJyb3I6ICR7ZXJyfWA7XG4gICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIGJvYXJkIHRvIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAqL1xuICByZXNldCgpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoXCJyZXNldCBjYWxsZWRcIik7XG4gICAgdGhpcy5jaGVzcyA9IG5ldyBDaGVzcygpO1xuICAgIHRoaXMuYmVnaW5TZXNzaW9uU3RhdGUoe1xuICAgICAgZ2FtZVNlc3Npb25JZDogY3JlYXRlR2FtZVNlc3Npb25JZCgpLFxuICAgICAgZ2FtZVN0YXJ0RmVuOiB0aGlzLmNoZXNzLmZlbigpLFxuICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZzogdHJ1ZSxcbiAgICAgIHNldHVwTmFtZTogXCJOZXcgR2FtZVwiLFxuICAgICAgc2V0dXBDYXRlZ29yeTogXCJjdXN0b21cIixcbiAgICB9KTtcbiAgICB0aGlzLnJlc2V0VHJhbnNpZW50Qm9hcmRTdGF0ZSgpO1xuICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICB0aGlzLmxhc3RNb3ZlID0gbnVsbDtcbiAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiQm9hcmQgcmVzZXRcIjtcbiAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgIHRoaXMucmVjZW50TW92ZUZlZWRiYWNrID0gbnVsbDtcbiAgICBlbmdpbmVWaWV3TW9kZWwucmVzdGFydCgpO1xuICAgIGxvZ2dlci5kZWJ1ZyhcIkJvYXJkIHJlc2V0LCBuZXcgRkVOOlwiLCB0aGlzLmZlbik7XG4gIH1cblxuICAvKipcbiAgICogVW5kbyB0aGUgbGFzdCBtb3ZlIChvciBsYXN0IHR3byBtb3ZlcyBpZiBhdXRvLXBsYXkgaXMgb24gYW5kIGVuZ2luZSBqdXN0IG1vdmVkKVxuICAgKi9cbiAgdW5kbygpOiBib29sZWFuIHtcbiAgICBsb2dnZXIuZGVidWcoXCJ1bmRvIGNhbGxlZCwgaGlzdG9yeSBsZW5ndGg6XCIsIHRoaXMuaGlzdG9yeS5sZW5ndGgpO1xuXG4gICAgLy8gSWYgYXV0by1wbGF5IGlzIGVuYWJsZWQgYW5kIHRoZSBsYXN0IG1vdmUgd2FzIGJ5IHRoZSBlbmdpbmUsIHVuZG8gYm90aCBtb3Zlc1xuICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiB0aGlzLmhpc3RvcnkubGVuZ3RoID49IDIpIHtcbiAgICAgIC8vIENoZWNrIGlmIHRoZSBsYXN0IG1vdmUgd2FzIGJ5IHRoZSBlbmdpbmVcbiAgICAgIGNvbnN0IGxhc3RNb3ZlID0gdGhpcy5oaXN0b3J5W3RoaXMuaGlzdG9yeS5sZW5ndGggLSAxXTtcbiAgICAgIGNvbnN0IGxhc3RNb3ZlQ29sb3IgPSBsYXN0TW92ZS5jb2xvcjtcblxuICAgICAgLy8gSWYgbGFzdCBtb3ZlIHdhcyBieSBlbmdpbmUsIHVuZG8gYm90aCAoZW5naW5lIG1vdmUgKyBodW1hbiBtb3ZlKVxuICAgICAgaWYgKGxhc3RNb3ZlQ29sb3IgPT09IHRoaXMuZW5naW5lUGxheXNGb3IpIHtcbiAgICAgICAgaWYgKHRoaXMudW5kb01vdmVzKDIpKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJVbmRpZCBsYXN0IDIgbW92ZXMgKGh1bWFuICsgZW5naW5lKVwiO1xuICAgICAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICAgICAgdGhpcy5jbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTtcbiAgICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoXCJVbmRpZCAyIG1vdmVzXCIpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBMYXN0IG1vdmUgd2FzIGJ5IGh1bWFuLCBqdXN0IHVuZG8gb25lXG4gICAgICAgIGlmICh0aGlzLnVuZG9Nb3ZlcygxKSkge1xuICAgICAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgICAgICB0aGlzLmxhc3RNb3ZlID0gbnVsbDtcbiAgICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiTW92ZSB1bmRvbmVcIjtcbiAgICAgICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG4gICAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKFwiVW5kaWQgMSBtb3ZlXCIpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF1dG8tcGxheSBkaXNhYmxlZCBvciBub3QgZW5vdWdoIG1vdmVzLCB1bmRvIGp1c3Qgb25lIG1vdmVcbiAgICAgIGlmICh0aGlzLnVuZG9Nb3ZlcygxKSkge1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBcIk1vdmUgdW5kb25lXCI7XG4gICAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG4gICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICBsb2dnZXIuZGVidWcoXCJVbmRpZCAxIG1vdmVcIik7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxvZ2dlci5kZWJ1ZyhcIlVuZG8gZmFpbGVkIC0gbm8gbW92ZXMgdG8gdW5kb1wiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGludGVybmFsIHN0YXRlIGZyb20gY2hlc3MgaW5zdGFuY2VcbiAgICovXG4gIHByaXZhdGUgdXBkYXRlU3RhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5mZW4gPSB0aGlzLmNoZXNzLmZlbigpO1xuICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuY2hlc3MuaGlzdG9yeSh7IHZlcmJvc2U6IHRydWUgfSk7XG4gICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPSBudWxsO1xuICAgIC8vIFNhdmUgRkVOIHRvIGxvY2FsU3RvcmFnZSB3aGVuZXZlciBpdCBjaGFuZ2VzXG4gICAgdGhpcy5zYXZlRmVuVG9IaXN0b3J5KCk7XG4gICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgXCJ1cGRhdGVTdGF0ZSAtIEZFTjpcIixcbiAgICAgIHRoaXMuZmVuLFxuICAgICAgXCJIaXN0b3J5IGxlbmd0aDpcIixcbiAgICAgIHRoaXMuaGlzdG9yeS5sZW5ndGgsXG4gICAgKTtcblxuICAgIC8vIEF1dG9tYXRpY2FsbHkgcmUtYW5hbHl6ZSBtb3ZlcyBpZiBhcnJvd3MgYXJlIGVuYWJsZWQgKGRlYm91bmNlZCB0byBwcmV2ZW50IGV4Y2Vzc2l2ZSBjYWxscylcbiAgICBpZiAodGhpcy5zaG93TW92ZUFycm93cyAmJiAhdGhpcy5pc0dhbWVPdmVyICYmICF0aGlzLmlzQW5hbHl6aW5nTW92ZXMpIHtcbiAgICAgIC8vIENsZWFyIHByZXZpb3VzIGFuYWx5c2lzIGFuZCB0cmlnZ2VyIG5ldyBhbmFseXNpcyBhc3luY2hyb25vdXNseVxuICAgICAgLy8gVXNlIHNldFRpbWVvdXQgdG8gZGVib3VuY2UgYW5kIHByZXZlbnQgcmUtcmVuZGVyIGxvb3BzXG4gICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICAgIC8vIENsZWFyIGFueSBwZW5kaW5nIGFuYWx5c2lzIHRpbWVvdXRcbiAgICAgIGlmICh0aGlzLl9hbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2FuYWx5c2lzVGltZW91dCk7XG4gICAgICB9XG4gICAgICAvLyBEZWJvdW5jZSBhbmFseXNpcyB0byBwcmV2ZW50IGV4Y2Vzc2l2ZSBjYWxsc1xuICAgICAgdGhpcy5fYW5hbHlzaXNUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYW5hbHl6ZUFsbE1vdmVzKCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBhbmFseXplIG1vdmVzOlwiLCBlcnIpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDMwMCk7IC8vIDMwMG1zIGRlYm91bmNlXG4gICAgfVxuXG4gICAgdGhpcy5zY2hlZHVsZVdpbkNoYW5jZXNSZWZyZXNoKCk7XG4gIH1cblxuICAvKipcbiAgICogRmxpcCB0aGUgYm9hcmQgb3JpZW50YXRpb24gYW5kIGVuZ2luZSBwbGF5aW5nIGNvbG9yXG4gICAqL1xuICBmbGlwQm9hcmQoKTogdm9pZCB7XG4gICAgdGhpcy5ib2FyZEZsaXBwZWQgPSAhdGhpcy5ib2FyZEZsaXBwZWQ7XG4gICAgLy8gRmxpcCB0aGUgZW5naW5lJ3MgcGxheWluZyBjb2xvciB3aGVuIGJvYXJkIGlzIGZsaXBwZWRcbiAgICB0aGlzLmVuZ2luZVBsYXlzRm9yID0gdGhpcy5lbmdpbmVQbGF5c0ZvciA9PT0gXCJ3XCIgPyBcImJcIiA6IFwid1wiO1xuICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgIFwiQm9hcmQgZmxpcHBlZCwgb3JpZW50YXRpb246XCIsXG4gICAgICB0aGlzLmJvYXJkRmxpcHBlZCA/IFwiYmxhY2tcIiA6IFwid2hpdGVcIixcbiAgICAgIFwiRW5naW5lIG5vdyBwbGF5cyBmb3I6XCIsXG4gICAgICB0aGlzLmVuZ2luZVBsYXlzRm9yID09PSBcIndcIiA/IFwiV2hpdGVcIiA6IFwiQmxhY2tcIixcbiAgICApO1xuICB9XG5cbiAgc2V0Qm9hcmRGbGlwcGVkKGZsaXBwZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5ib2FyZEZsaXBwZWQgIT09IGZsaXBwZWQpIHtcbiAgICAgIHRoaXMuZmxpcEJvYXJkKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgY3VycmVudCBGRU4gdG8gbG9jYWxTdG9yYWdlIGhpc3RvcnlcbiAgICovXG4gIHNhdmVGZW5Ub0hpc3RvcnkoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRGZW4gPSB0aGlzLmZlbjtcblxuICAgICAgLy8gU2F2ZSBjdXJyZW50IEZFTlxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5GRU5fU1RPUkFHRV9LRVksIGN1cnJlbnRGZW4pO1xuXG4gICAgICAvLyBHZXQgZXhpc3RpbmcgaGlzdG9yeVxuICAgICAgY29uc3QgaGlzdG9yeUpzb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkZFTl9ISVNUT1JZX0tFWSk7XG4gICAgICBsZXQgaGlzdG9yeTogc3RyaW5nW10gPSBoaXN0b3J5SnNvbiA/IEpTT04ucGFyc2UoaGlzdG9yeUpzb24pIDogW107XG5cbiAgICAgIGlmIChoaXN0b3J5Lmxlbmd0aCA9PT0gMCB8fCBoaXN0b3J5W2hpc3RvcnkubGVuZ3RoIC0gMV0gIT09IGN1cnJlbnRGZW4pIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoKGN1cnJlbnRGZW4pO1xuXG4gICAgICAgIGlmIChoaXN0b3J5Lmxlbmd0aCA+IHRoaXMuTUFYX0hJU1RPUlkpIHtcbiAgICAgICAgICBoaXN0b3J5ID0gaGlzdG9yeS5zbGljZSgtdGhpcy5NQVhfSElTVE9SWSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLkZFTl9ISVNUT1JZX0tFWSwgSlNPTi5zdHJpbmdpZnkoaGlzdG9yeSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucGVyc2lzdEVuZ2luZUNvbmZpZykge1xuICAgICAgICBjb25zdCBib2FyZFN0YXRlOiBQZXJzaXN0ZWRCb2FyZFN0YXRlID0ge1xuICAgICAgICAgIGN1cnJlbnRGZW4sXG4gICAgICAgICAgZmVuSGlzdG9yeTogaGlzdG9yeSxcbiAgICAgICAgICBnYW1lU2Vzc2lvbklkOiB0aGlzLmdhbWVTZXNzaW9uSWQsXG4gICAgICAgICAgZ2FtZVN0YXJ0RmVuOiB0aGlzLmdhbWVTdGFydEZlbixcbiAgICAgICAgICBjdXJyZW50U2V0dXBOYW1lOiB0aGlzLmN1cnJlbnRTZXR1cE5hbWUsXG4gICAgICAgICAgY3VycmVudFNldHVwQ2F0ZWdvcnk6IHRoaXMuY3VycmVudFNldHVwQ2F0ZWdvcnksXG4gICAgICAgICAgaGlzdG9yeUFubm90YXRpb25zOiB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucyxcbiAgICAgICAgICByZWRvQW5ub3RhdGlvbnM6IHRoaXMucmVkb0Fubm90YXRpb25zLFxuICAgICAgICB9O1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgICB0aGlzLkJPQVJEX1NUQVRFX1NUT1JBR0VfS0VZLFxuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGJvYXJkU3RhdGUpLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZEJvYXJkU3RhdGUoKTtcbiAgICAgIH1cblxuICAgICAgbG9nZ2VyLmRlYnVnKFwiU2F2ZWQgRkVOIHRvIGhpc3RvcnksIHRvdGFsIGVudHJpZXM6XCIsIGhpc3RvcnkubGVuZ3RoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBzYXZlIEZFTiB0byBoaXN0b3J5OlwiLCBlcnIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0b3JlIEZFTiBmcm9tIGxvY2FsU3RvcmFnZSBvbiBhcHAgc3RhcnR1cFxuICAgKi9cbiAgcHJpdmF0ZSByZXN0b3JlRmVuRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkRmVuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5GRU5fU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKHNhdmVkRmVuKSB7XG4gICAgICAgIC8vIFZhbGlkYXRlIEZFTiBiZWZvcmUgbG9hZGluZ1xuICAgICAgICBjb25zdCB0ZXN0Q2hlc3MgPSBuZXcgQ2hlc3MoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0ZXN0Q2hlc3MubG9hZChzYXZlZEZlbik7XG4gICAgICAgICAgLy8gRkVOIGlzIHZhbGlkLCBsb2FkIGl0XG4gICAgICAgICAgY29uc3QgcmVzdG9yZWRCb2FyZFN0YXRlID0gdGhpcy5yZWFkUGVyc2lzdGVkQm9hcmRTdGF0ZSgpO1xuICAgICAgICAgIGlmIChyZXN0b3JlZEJvYXJkU3RhdGU/LmN1cnJlbnRGZW4gPT09IHNhdmVkRmVuKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRGZW4oc2F2ZWRGZW4sIHtcbiAgICAgICAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZzogZmFsc2UsXG4gICAgICAgICAgICAgIHNlc3Npb25JZDogcmVzdG9yZWRCb2FyZFN0YXRlLmdhbWVTZXNzaW9uSWQsXG4gICAgICAgICAgICAgIGdhbWVTdGFydEZlbjogcmVzdG9yZWRCb2FyZFN0YXRlLmdhbWVTdGFydEZlbixcbiAgICAgICAgICAgICAgaGlzdG9yeUFubm90YXRpb25zOiByZXN0b3JlZEJvYXJkU3RhdGUuaGlzdG9yeUFubm90YXRpb25zLFxuICAgICAgICAgICAgICByZWRvQW5ub3RhdGlvbnM6IHJlc3RvcmVkQm9hcmRTdGF0ZS5yZWRvQW5ub3RhdGlvbnMsXG4gICAgICAgICAgICAgIHNldHVwTmFtZTogcmVzdG9yZWRCb2FyZFN0YXRlLmN1cnJlbnRTZXR1cE5hbWUsXG4gICAgICAgICAgICAgIHNldHVwQ2F0ZWdvcnk6IHJlc3RvcmVkQm9hcmRTdGF0ZS5jdXJyZW50U2V0dXBDYXRlZ29yeSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRGZW4oc2F2ZWRGZW4sIHtcbiAgICAgICAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZzogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRHYW1lU2Vzc2lvbklkICE9PVxuICAgICAgICAgICAgdGhpcy5nYW1lU2Vzc2lvbklkXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldEJyaWxsaWFudFRyYWNraW5nKHRoaXMuZ2FtZVNlc3Npb25JZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IFwiUmVzdG9yZWQgcG9zaXRpb24gZnJvbSBwcmV2aW91cyBzZXNzaW9uXCI7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKFwiUmVzdG9yZWQgRkVOIGZyb20gc3RvcmFnZTpcIiwgc2F2ZWRGZW4pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBsb2dnZXIud2FybihcIlNhdmVkIEZFTiBpcyBpbnZhbGlkLCB1c2luZyBkZWZhdWx0OlwiLCBlcnIpO1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuRkVOX1NUT1JBR0VfS0VZKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIHJlc3RvcmUgRkVOIGZyb20gc3RvcmFnZTpcIiwgZXJyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBGRU4gZnJvbSBoaXN0b3J5IGJ5IGluZGV4XG4gICAqL1xuICBsb2FkRmVuRnJvbUhpc3RvcnkoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBoaXN0b3J5SnNvbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX0hJU1RPUllfS0VZKTtcbiAgICAgIGlmICghaGlzdG9yeUpzb24pIHJldHVybiBmYWxzZTtcblxuICAgICAgY29uc3QgaGlzdG9yeTogc3RyaW5nW10gPSBKU09OLnBhcnNlKGhpc3RvcnlKc29uKTtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gaGlzdG9yeS5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAgICAgY29uc3QgZmVuID0gaGlzdG9yeVtpbmRleF07XG4gICAgICByZXR1cm4gdGhpcy5sb2FkRmVuKGZlbik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBGRU4gZnJvbSBoaXN0b3J5OlwiLCBlcnIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgRkVOIGhpc3RvcnlcbiAgICovXG4gIGdldCBmZW5IaXN0b3J5KCk6IHN0cmluZ1tdIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgaGlzdG9yeUpzb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkZFTl9ISVNUT1JZX0tFWSk7XG4gICAgICByZXR1cm4gaGlzdG9yeUpzb24gPyBKU09OLnBhcnNlKGhpc3RvcnlKc29uKSA6IFtdO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGxhc3Qgc2F2ZWQgRkVOXG4gICAqL1xuICBnZXQgbGFzdFNhdmVkRmVuKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5GRU5fU1RPUkFHRV9LRVkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZSBzaG93aW5nIG1vdmUgYXJyb3dzXG4gICAqL1xuICB0b2dnbGVNb3ZlQXJyb3dzKCk6IHZvaWQge1xuICAgIC8vIENsZWFyIGFueSBwZW5kaW5nIGFuYWx5c2lzIHRpbWVvdXRcbiAgICBpZiAodGhpcy5fYW5hbHlzaXNUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fYW5hbHlzaXNUaW1lb3V0KTtcbiAgICAgIHRoaXMuX2FuYWx5c2lzVGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5zaG93TW92ZUFycm93cyA9ICF0aGlzLnNob3dNb3ZlQXJyb3dzO1xuICAgIGlmIChcbiAgICAgIHRoaXMuc2hvd01vdmVBcnJvd3MgJiZcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcykubGVuZ3RoID09PSAwICYmXG4gICAgICAhdGhpcy5pc0FuYWx5emluZ01vdmVzXG4gICAgKSB7XG4gICAgICAvLyBBdXRvLWFuYWx5emUgaWYgYXJyb3dzIGFyZSBlbmFibGVkIGFuZCB3ZSBkb24ndCBoYXZlIGFuYWx5c2lzIHlldFxuICAgICAgdGhpcy5hbmFseXplQWxsTW92ZXMoKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbQm9hcmRWaWV3TW9kZWxdIEZhaWxlZCB0byBhbmFseXplIG1vdmVzOlwiLCBlcnIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5zaG93TW92ZUFycm93cykge1xuICAgICAgLy8gQ2xlYXIgYW5hbHlzaXMgd2hlbiBhcnJvd3MgYXJlIGRpc2FibGVkIHRvIGZyZWUgbWVtb3J5XG4gICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBzZXRTaG93TW92ZUFycm93c0VuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLnNob3dNb3ZlQXJyb3dzICE9PSBlbmFibGVkKSB7XG4gICAgICB0aGlzLnRvZ2dsZU1vdmVBcnJvd3MoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoaWNoIHNpZGUncyBtb3ZlcyB0byBzaG93IGFycm93cyBmb3JcbiAgICovXG4gIHNldFNob3dBcnJvd3NGb3JTaWRlKHNpZGU6IFwiY3VycmVudFwiIHwgXCJwbGF5ZXJcIiB8IFwiZW5naW5lXCIpOiB2b2lkIHtcbiAgICB0aGlzLnNob3dBcnJvd3NGb3JTaWRlID0gc2lkZTtcbiAgICBsb2dnZXIuZGVidWcoXCJTaG93IGFycm93cyBmb3Igc2lkZTpcIiwgc2lkZSk7XG4gICAgLy8gUmUtYW5hbHl6ZSBpZiBhcnJvd3MgYXJlIGVuYWJsZWRcbiAgICBpZiAodGhpcy5zaG93TW92ZUFycm93cykge1xuICAgICAgdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzID0ge307XG4gICAgICB0aGlzLmFuYWx5emVkTGVnYWxNb3Zlc0ZlbiA9IG51bGw7XG4gICAgICB0aGlzLmFuYWx5emVBbGxNb3ZlcygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbmFseXplIGFsbCBsZWdhbCBtb3ZlcyBmb3IgdGhlIGN1cnJlbnQgcG9zaXRpb25cbiAgICovXG4gIGFzeW5jIGFuYWx5emVBbGxNb3ZlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5pc0dhbWVPdmVyIHx8IHRoaXMuaXNBbmFseXppbmdNb3Zlcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID09PSB0aGlzLmZlbiAmJlxuICAgICAgT2JqZWN0LmtleXModGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzKS5sZW5ndGggPiAwXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzID0ge307IC8vIENsZWFyXG4gICAgICB9KTtcblxuICAgICAgLy8gR2V0IGFsbCBsZWdhbCBtb3Zlc1xuICAgICAgY29uc3QgbGVnYWxNb3ZlcyA9IHRoaXMuYWxsTGVnYWxNb3ZlcztcbiAgICAgIGlmIChsZWdhbE1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIEluaXRpYWxpemUgZW5naW5lIGlmIG5lZWRlZFxuICAgICAgaWYgKCFlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCkge1xuICAgICAgICBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBBbmFseXplIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgIGNvbnN0IGFuYWx5c2lzID0gYXdhaXQgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbihcbiAgICAgICAgdGhpcy5mZW4sXG4gICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCxcbiAgICAgICAgY29uZmlnVmlld01vZGVsLm11bHRpUFYsXG4gICAgICAgIFwiYmFja2dyb3VuZFwiLFxuICAgICAgKTtcblxuICAgICAgaWYgKFxuICAgICAgICBhbmFseXNpcy5pZ25vcmVkIHx8XG4gICAgICAgICFjYW5BcHBseUFuYWx5emVkTW92ZSh0aGlzLmZlbiwgYW5hbHlzaXMuYW5hbHl6ZWRGZW4pXG4gICAgICApIHtcbiAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaXNBbmFseXppbmdNb3ZlcyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYSBtYXAgb2YgVUNJIG1vdmVzIHRvIHRoZWlyIHF1YWxpdHkgYnVja2V0c1xuICAgICAgY29uc3QgbW92ZU1hcCA9IG1hcExlZ2FsTW92ZXNUb0J1Y2tldHMoXG4gICAgICAgIGxlZ2FsTW92ZXMubWFwKFxuICAgICAgICAgIChtb3ZlKSA9PiBgJHttb3ZlLmZyb219JHttb3ZlLnRvfSR7bW92ZS5wcm9tb3Rpb24gfHwgXCJcIn1gLFxuICAgICAgICApLFxuICAgICAgICBhbmFseXNpcy5tb3ZlcyxcbiAgICAgICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb24sXG4gICAgICApO1xuXG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcyA9IG1vdmVNYXA7XG4gICAgICAgIHRoaXMuaXNBbmFseXppbmdNb3ZlcyA9IGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID0gdGhpcy5mZW47XG4gICAgICBsb2dnZXIuZGVidWcoXCJBbmFseXplZFwiLCBPYmplY3Qua2V5cyhtb3ZlTWFwKS5sZW5ndGgsIFwibGVnYWwgbW92ZXNcIik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gYW5hbHl6ZSBtb3ZlczpcIiwgZXJyKTtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSB0aGUgcXVhbGl0eSBvZiBhIHBsYXllcidzIG1vdmVcbiAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGlzIG1hZGUsIGFuYWx5emluZyB0aGUgcG9zaXRpb24gYmVmb3JlIHRoZSBtb3ZlXG4gICAqL1xuICBhc3luYyBhbmFseXplUGxheWVyTW92ZShtb3ZlOiBNb3ZlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUnVuIGFzeW5jaHJvbm91c2x5IHNvIGl0IGRvZXNuJ3QgYmxvY2sgdGhlIFVJXG4gICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBleHBlY3RlZEFmdGVyRmVuID0gbW92ZS5hZnRlcjtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBlbmdpbmUgaWYgbmVlZGVkXG4gICAgICAgIGlmICghZW5naW5lVmlld01vZGVsLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IHRoZSBwb3NpdGlvbiBiZWZvcmUgdGhlIG1vdmUgKGZyb20gaGlzdG9yeSlcbiAgICAgICAgY29uc3QgaGlzdG9yeSA9IHRoaXMuY2hlc3MuaGlzdG9yeSh7IHZlcmJvc2U6IHRydWUgfSk7XG4gICAgICAgIGlmIChoaXN0b3J5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjsgLy8gTm8gaGlzdG9yeSwgY2FuJ3QgYW5hbHl6ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIG1vdmUgd2UganVzdCBtYWRlIGlzIHRoZSBsYXN0IG9uZSBpbiBoaXN0b3J5XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gYW5hbHl6ZSB0aGUgcG9zaXRpb24gYmVmb3JlIGl0XG4gICAgICAgIC8vIGNoZXNzLmpzIGhpc3RvcnkgdmVyYm9zZSBpbmNsdWRlcyAnYmVmb3JlJyBhbmQgJ2FmdGVyJyBGRU5cbiAgICAgICAgY29uc3QgbGFzdE1vdmVJbkhpc3RvcnkgPSBoaXN0b3J5W2hpc3RvcnkubGVuZ3RoIC0gMV0gYXMgTW92ZSAmIHtcbiAgICAgICAgICBiZWZvcmU/OiBzdHJpbmc7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGJlZm9yZUZlbiA9IGxhc3RNb3ZlSW5IaXN0b3J5LmJlZm9yZSB8fCB0aGlzLmZlbjtcblxuICAgICAgICAvLyBBbmFseXplIHRoZSBwb3NpdGlvbiBiZWZvcmUgdGhlIG1vdmVcbiAgICAgICAgY29uc3QgYW5hbHlzaXMgPSBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uKFxuICAgICAgICAgIGJlZm9yZUZlbixcbiAgICAgICAgICBNYXRoLm1pbihjb25maWdWaWV3TW9kZWwuZGVwdGgsIDE1KSwgLy8gVXNlIHNtYWxsZXIgZGVwdGggZm9yIGZhc3RlciBhbmFseXNpc1xuICAgICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5tdWx0aVBWLFxuICAgICAgICAgIFwiYmFja2dyb3VuZFwiLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBhbmFseXNpcy5pZ25vcmVkIHx8XG4gICAgICAgICAgIWNhbkFwcGx5QW5hbHl6ZWRNb3ZlKGJlZm9yZUZlbiwgYW5hbHlzaXMuYW5hbHl6ZWRGZW4pIHx8XG4gICAgICAgICAgdGhpcy5mZW4gIT09IGV4cGVjdGVkQWZ0ZXJGZW5cbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluZCB0aGUgbW92ZSBpbiB0aGUgYW5hbHl6ZWQgbW92ZXNcbiAgICAgICAgY29uc3QgbW92ZVVDSSA9IGAke21vdmUuZnJvbX0ke21vdmUudG99JHttb3ZlLnByb21vdGlvbiB8fCBcIlwifWA7XG4gICAgICAgIGNvbnN0IGFuYWx5emVkTW92ZSA9IGFuYWx5c2lzLm1vdmVzLmZpbmQoKG0pID0+IG0ubW92ZSA9PT0gbW92ZVVDSSk7XG4gICAgICAgIGlmIChhbmFseXplZE1vdmUpIHtcbiAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eSA9IGFuYWx5emVkTW92ZS5idWNrZXQ7XG4gICAgICAgICAgICBjb25zdCBxdWFsaXR5TGFiZWwgPSBCVUNLRVRfTEFCRUxTW2FuYWx5emVkTW92ZS5idWNrZXRdO1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYFlvdSBwbGF5ZWQ6ICR7bW92ZS5zYW59ICgke3F1YWxpdHlMYWJlbH0pYDtcbiAgICAgICAgICAgIHRoaXMucHVibGlzaE1vdmVGZWVkYmFjayh7XG4gICAgICAgICAgICAgIGFjdG9yOiBcInBsYXllclwiLFxuICAgICAgICAgICAgICBtb3ZlLFxuICAgICAgICAgICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgICAgICAgICAgIHF1YWxpdHlMYWJlbCxcbiAgICAgICAgICAgICAgYnVja2V0OiBhbmFseXplZE1vdmUuYnVja2V0LFxuICAgICAgICAgICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGFzdEFubm90YXRpb24oe1xuICAgICAgICAgICAgICBidWNrZXQ6IGFuYWx5emVkTW92ZS5idWNrZXQsXG4gICAgICAgICAgICAgIGV2YWxMb3NzOiBhbmFseXplZE1vdmUuZXZhbExvc3MsXG4gICAgICAgICAgICAgIGV2YWx1YXRpb246IGFuYWx5emVkTW92ZS5ldmFsdWF0aW9uLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKFwiUGxheWVyIG1vdmUgcXVhbGl0eTpcIiwgYW5hbHl6ZWRNb3ZlLmJ1Y2tldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uKSB7XG4gICAgICAgICAgICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gXCJmYWxsYmFja1wiO1xuICAgICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn0gKEZhbGxiYWNrIG1vdmUpYDtcbiAgICAgICAgICAgICAgdGhpcy5wdWJsaXNoTW92ZUZlZWRiYWNrKHtcbiAgICAgICAgICAgICAgICBhY3RvcjogXCJwbGF5ZXJcIixcbiAgICAgICAgICAgICAgICBtb3ZlLFxuICAgICAgICAgICAgICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBxdWFsaXR5TGFiZWw6IFwiRmFsbGJhY2sgbW92ZVwiLFxuICAgICAgICAgICAgICAgIGJ1Y2tldDogXCJmYWxsYmFja1wiLFxuICAgICAgICAgICAgICAgIHNpbGVudDogdHJ1ZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlTGFzdEFubm90YXRpb24oeyBidWNrZXQ6IFwiZmFsbGJhY2tcIiB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gXCJnb29kXCI7XG4gICAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBZb3UgcGxheWVkOiAke21vdmUuc2FufSAoR29vZClgO1xuICAgICAgICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgICAgICAgIGFjdG9yOiBcInBsYXllclwiLFxuICAgICAgICAgICAgICAgIG1vdmUsXG4gICAgICAgICAgICAgICAgaXNCcmlsbGlhbnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHF1YWxpdHlMYWJlbDogXCJHb29kXCIsXG4gICAgICAgICAgICAgICAgYnVja2V0OiBcImdvb2RcIixcbiAgICAgICAgICAgICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUxhc3RBbm5vdGF0aW9uKHsgYnVja2V0OiBcImdvb2RcIiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBhbmFseXplIHBsYXllciBtb3ZlOlwiLCBlcnIpO1xuICAgICAgICAvLyBEb24ndCB1cGRhdGUgc3RhdHVzIG9uIGVycm9yLCBrZWVwIHRoZSBvcmlnaW5hbCBtZXNzYWdlXG4gICAgICB9XG4gICAgfSwgMTAwKTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVQbGF5ZXJNb3ZlQW5hbHlzaXMobW92ZTogTW92ZSk6IHZvaWQge1xuICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG5cbiAgICBjb25zdCBhdHRlbXB0QW5hbHlzaXMgPSAoKTogdm9pZCA9PiB7XG4gICAgICB0aGlzLl9wbGF5ZXJNb3ZlQW5hbHlzaXNUaW1lb3V0ID0gbnVsbDtcblxuICAgICAgY29uc3QgYXV0b1BsYXlQZW5kaW5nID1cbiAgICAgICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgJiZcbiAgICAgICAgIXRoaXMuYXV0b1BsYXlQYXVzZWQgJiZcbiAgICAgICAgIXRoaXMuaXNHYW1lT3ZlciAmJlxuICAgICAgICAodGhpcy5pc1RoaW5raW5nIHx8XG4gICAgICAgICAgdGhpcy5pc0F1dG9QbGF5Q291bnRpbmdEb3duIHx8XG4gICAgICAgICAgdGhpcy50dXJuID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yKTtcblxuICAgICAgaWYgKGF1dG9QbGF5UGVuZGluZykge1xuICAgICAgICB0aGlzLl9wbGF5ZXJNb3ZlQW5hbHlzaXNUaW1lb3V0ID0gc2V0VGltZW91dChhdHRlbXB0QW5hbHlzaXMsIDE1MCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdm9pZCB0aGlzLmFuYWx5emVQbGF5ZXJNb3ZlKG1vdmUpO1xuICAgIH07XG5cbiAgICB0aGlzLl9wbGF5ZXJNb3ZlQW5hbHlzaXNUaW1lb3V0ID0gc2V0VGltZW91dChhdHRlbXB0QW5hbHlzaXMsIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhcnJvd3MgZGF0YSBmb3IgcmVhY3QtY2hlc3Nib2FyZFxuICAgKiBSZXR1cm5zIGFycmF5IG9mIEFycm93IG9iamVjdHMgd2l0aCBzdGFydFNxdWFyZSwgZW5kU3F1YXJlLCBhbmQgY29sb3IgcHJvcGVydGllc1xuICAgKiBPbmx5IHNob3dzIGFycm93cyBmb3IgRXhjZWxsZW50LCBHb29kLCBNaXN0YWtlLCBhbmQgQmx1bmRlciBtb3Zlc1xuICAgKiBMaW1pdGVkIHRvIG1heGltdW0gMyBhcnJvd3MgcGVyIHF1YWxpdHkgYnVja2V0XG4gICAqL1xuICBnZXQgbW92ZUFycm93cygpOiBBcnJheTx7XG4gICAgc3RhcnRTcXVhcmU6IHN0cmluZztcbiAgICBlbmRTcXVhcmU6IHN0cmluZztcbiAgICBjb2xvcjogc3RyaW5nO1xuICB9PiB7XG4gICAgaWYgKFxuICAgICAgIXRoaXMuc2hvd01vdmVBcnJvd3MgfHxcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcykubGVuZ3RoID09PSAwXG4gICAgKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gT25seSBzaG93IGFycm93cyBmb3IgdGhlc2Ugc3BlY2lmaWMgbW92ZSBxdWFsaXRpZXNcbiAgICBjb25zdCBhbGxvd2VkQnVja2V0czogTW92ZUJ1Y2tldFtdID0gW1xuICAgICAgXCJleGNlbGxlbnRcIixcbiAgICAgIFwiZ29vZFwiLFxuICAgICAgXCJtaXN0YWtlXCIsXG4gICAgICBcImJsdW5kZXJcIixcbiAgICBdO1xuICAgIGNvbnN0IG1heEFycm93c1BlckJ1Y2tldCA9IDM7XG5cbiAgICBsZXQgbGVnYWxNb3ZlcyA9IHRoaXMuYWxsTGVnYWxNb3ZlcztcblxuICAgIC8vIEZpbHRlciBtb3ZlcyBieSBzaWRlIGlmIG5lZWRlZFxuICAgIGlmICh0aGlzLnNob3dBcnJvd3NGb3JTaWRlID09PSBcInBsYXllclwiKSB7XG4gICAgICAvLyBTaG93IG1vdmVzIGZvciB0aGUgc2lkZSB0aGF0IHRoZSBlbmdpbmUgaXMgTk9UIHBsYXlpbmcgZm9yXG4gICAgICBjb25zdCBwbGF5ZXJTaWRlID0gdGhpcy5lbmdpbmVQbGF5c0ZvciA9PT0gXCJ3XCIgPyBcImJcIiA6IFwid1wiO1xuICAgICAgbGVnYWxNb3ZlcyA9IGxlZ2FsTW92ZXMuZmlsdGVyKChtb3ZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHBpZWNlID0gdGhpcy5nZXRQaWVjZUF0KG1vdmUuZnJvbSk7XG4gICAgICAgIHJldHVybiBwaWVjZSAmJiBwaWVjZS5jb2xvciA9PT0gcGxheWVyU2lkZTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zaG93QXJyb3dzRm9yU2lkZSA9PT0gXCJlbmdpbmVcIikge1xuICAgICAgLy8gU2hvdyBtb3ZlcyBmb3IgdGhlIHNpZGUgdGhhdCB0aGUgZW5naW5lIElTIHBsYXlpbmcgZm9yXG4gICAgICBsZWdhbE1vdmVzID0gbGVnYWxNb3Zlcy5maWx0ZXIoKG1vdmUpID0+IHtcbiAgICAgICAgY29uc3QgcGllY2UgPSB0aGlzLmdldFBpZWNlQXQobW92ZS5mcm9tKTtcbiAgICAgICAgcmV0dXJuIHBpZWNlICYmIHBpZWNlLmNvbG9yID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIElmICdjdXJyZW50Jywgc2hvdyBhbGwgbGVnYWwgbW92ZXMgKGFscmVhZHkgZmlsdGVyZWQgYnkgY2hlc3MuanMgdG8gY3VycmVudCB0dXJuKVxuXG4gICAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIHZhbGlkYXRlIHNxdWFyZSBmb3JtYXQgKGEtaCwgMS04KVxuICAgIGNvbnN0IGlzVmFsaWRTcXVhcmUgPSAoc3F1YXJlOiB1bmtub3duKTogc3F1YXJlIGlzIFNxdWFyZSA9PiB7XG4gICAgICBpZiAoIXNxdWFyZSB8fCB0eXBlb2Ygc3F1YXJlICE9PSBcInN0cmluZ1wiKSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gL15bYS1oXVsxLThdJC8udGVzdChzcXVhcmUpO1xuICAgIH07XG5cbiAgICAvLyBHcm91cCBtb3ZlcyBieSBidWNrZXRcbiAgICBjb25zdCBtb3Zlc0J5QnVja2V0OiBSZWNvcmQ8XG4gICAgICBNb3ZlQnVja2V0LFxuICAgICAgQXJyYXk8eyBzdGFydFNxdWFyZTogc3RyaW5nOyBlbmRTcXVhcmU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9PlxuICAgID4gPSB7XG4gICAgICBleGNlbGxlbnQ6IFtdLFxuICAgICAgZ29vZDogW10sXG4gICAgICBtaXN0YWtlOiBbXSxcbiAgICAgIGJsdW5kZXI6IFtdLFxuICAgICAgYmVzdDogW10sIC8vIE5vdCB1c2VkIGJ1dCBuZWVkZWQgZm9yIHR5cGVcbiAgICAgIGdyZWF0OiBbXSwgLy8gTm90IHVzZWQgYnV0IG5lZWRlZCBmb3IgdHlwZVxuICAgICAgaW5hY2N1cmFjeTogW10sIC8vIE5vdCB1c2VkIGJ1dCBuZWVkZWQgZm9yIHR5cGVcbiAgICB9O1xuXG4gICAgLy8gQ29sbGVjdCBhbGwgdmFsaWQgbW92ZXMgZ3JvdXBlZCBieSBidWNrZXRcbiAgICBmb3IgKGNvbnN0IG1vdmUgb2YgbGVnYWxNb3Zlcykge1xuICAgICAgLy8gVmFsaWRhdGUgdGhhdCBtb3ZlIGhhcyB2YWxpZCBmcm9tIGFuZCB0byBzcXVhcmVzXG4gICAgICBpZiAoIWlzVmFsaWRTcXVhcmUobW92ZS5mcm9tKSB8fCAhaXNWYWxpZFNxdWFyZShtb3ZlLnRvKSkge1xuICAgICAgICBsb2dnZXIuZGVidWcoXCJTa2lwcGluZyBpbnZhbGlkIG1vdmU6XCIsIG1vdmUpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdWNpID0gYCR7bW92ZS5mcm9tfSR7bW92ZS50b30ke21vdmUucHJvbW90aW9uIHx8IFwiXCJ9YDtcbiAgICAgIGNvbnN0IGJ1Y2tldCA9IHRoaXMuX2FuYWx5emVkTGVnYWxNb3Zlc1t1Y2ldO1xuXG4gICAgICAvLyBPbmx5IGluY2x1ZGUgbW92ZXMgZnJvbSBhbGxvd2VkIGJ1Y2tldHNcbiAgICAgIGlmIChcbiAgICAgICAgYnVja2V0ICYmXG4gICAgICAgIGJ1Y2tldCAhPT0gXCJmYWxsYmFja1wiICYmXG4gICAgICAgIGFsbG93ZWRCdWNrZXRzLmluY2x1ZGVzKGJ1Y2tldCkgJiZcbiAgICAgICAgaXNWYWxpZFNxdWFyZShtb3ZlLmZyb20pICYmXG4gICAgICAgIGlzVmFsaWRTcXVhcmUobW92ZS50bylcbiAgICAgICkge1xuICAgICAgICBtb3Zlc0J5QnVja2V0W2J1Y2tldF0ucHVzaCh7XG4gICAgICAgICAgc3RhcnRTcXVhcmU6IG1vdmUuZnJvbSxcbiAgICAgICAgICBlbmRTcXVhcmU6IG1vdmUudG8sXG4gICAgICAgICAgY29sb3I6IEJVQ0tFVF9DT0xPUlNbYnVja2V0XSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGltaXQgdG8gbWF4IDMgYXJyb3dzIHBlciBidWNrZXQgYW5kIGNvbWJpbmVcbiAgICBjb25zdCBhcnJvd3M6IEFycmF5PHtcbiAgICAgIHN0YXJ0U3F1YXJlOiBzdHJpbmc7XG4gICAgICBlbmRTcXVhcmU6IHN0cmluZztcbiAgICAgIGNvbG9yOiBzdHJpbmc7XG4gICAgfT4gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBhbGxvd2VkQnVja2V0cykge1xuICAgICAgY29uc3QgYnVja2V0QXJyb3dzID0gbW92ZXNCeUJ1Y2tldFtidWNrZXRdLnNsaWNlKDAsIG1heEFycm93c1BlckJ1Y2tldCk7XG4gICAgICBhcnJvd3MucHVzaCguLi5idWNrZXRBcnJvd3MpO1xuICAgICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgICBgQWRkZWQgJHtidWNrZXRBcnJvd3MubGVuZ3RofSAke2J1Y2tldH0gYXJyb3dzIChmb3VuZCAke21vdmVzQnlCdWNrZXRbYnVja2V0XS5sZW5ndGh9IHRvdGFsKWAsXG4gICAgICApO1xuICAgIH1cblxuICAgIGxvZ2dlci5kZWJ1ZyhcIkdlbmVyYXRlZFwiLCBhcnJvd3MubGVuZ3RoLCBcInRvdGFsIGFycm93c1wiKTtcbiAgICByZXR1cm4gYXJyb3dzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbmFseXplZCBsZWdhbCBtb3ZlcyBjb3VudCAoZm9yIFVJIGRpc3BsYXkpXG4gICAqL1xuICBnZXQgYW5hbHl6ZWRMZWdhbE1vdmVzQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzKS5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgdHVybiAod2hpdGUvYmxhY2spXG4gICAqIFJlYWRzIGBmZW5gIHNvIE1vYlggcmVjb21wdXRlcyB3aGVuIHRoZSBib2FyZCB1cGRhdGVzIChjaGVzcy5qcyBtdXRhdGVzIGluIHBsYWNlKS5cbiAgICovXG4gIGdldCB0dXJuKCk6IFwid1wiIHwgXCJiXCIge1xuICAgIHZvaWQgdGhpcy5mZW47XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MudHVybigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0dXJuIGFzIHN0cmluZ1xuICAgKi9cbiAgZ2V0IHR1cm5TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy50dXJuID09PSBcIndcIiA/IFwiV2hpdGVcIiA6IFwiQmxhY2tcIjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBnYW1lIGlzIG92ZXJcbiAgICovXG4gIGdldCBpc0dhbWVPdmVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmlzR2FtZU92ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBpdCdzIGNoZWNrbWF0ZVxuICAgKi9cbiAgZ2V0IGlzQ2hlY2ttYXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmlzQ2hlY2ttYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgaXQncyBzdGFsZW1hdGVcbiAgICovXG4gIGdldCBpc1N0YWxlbWF0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5pc1N0YWxlbWF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGl0J3MgYSBkcmF3XG4gICAqL1xuICBnZXQgaXNEcmF3KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmlzRHJhdygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGtpbmcgaXMgaW4gY2hlY2tcbiAgICovXG4gIGdldCBpc0NoZWNrKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmlzQ2hlY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZ2FtZSBzdGF0dXMgdGV4dFxuICAgKi9cbiAgZ2V0IGdhbWVTdGF0dXMoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5pc0NoZWNrbWF0ZSkge1xuICAgICAgcmV0dXJuIGBDaGVja21hdGUhICR7dGhpcy50dXJuID09PSBcIndcIiA/IFwiQmxhY2tcIiA6IFwiV2hpdGVcIn0gd2luc2A7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzU3RhbGVtYXRlKSB7XG4gICAgICByZXR1cm4gXCJTdGFsZW1hdGUhXCI7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRHJhdykge1xuICAgICAgcmV0dXJuIFwiRHJhdyFcIjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNDaGVjaykge1xuICAgICAgcmV0dXJuIGAke3RoaXMudHVyblN0cmluZ30gaXMgaW4gY2hlY2tgO1xuICAgIH1cbiAgICByZXR1cm4gYCR7dGhpcy50dXJuU3RyaW5nfSB0byBtb3ZlYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbGVnYWwgbW92ZXMgZm9yIGEgc3F1YXJlXG4gICAqL1xuICBnZXRMZWdhbE1vdmVzKHNxdWFyZTogU3F1YXJlKTogTW92ZVtdIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5tb3Zlcyh7IHNxdWFyZSwgdmVyYm9zZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGllY2UgYXQgc3F1YXJlIChmb3IgVUkgdmlzdWFsIGluZGljYXRvcnMpXG4gICAqL1xuICBnZXRQaWVjZUF0KHNxdWFyZTogU3F1YXJlKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuZ2V0KHNxdWFyZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBsZWdhbCBtb3Zlc1xuICAgKi9cbiAgZ2V0IGFsbExlZ2FsTW92ZXMoKTogTW92ZVtdIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5tb3Zlcyh7IHZlcmJvc2U6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IG1vdmUgY291bnRcbiAgICovXG4gIGdldCBtb3ZlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5tb3ZlTnVtYmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogVW5kbyBhIHNpbmdsZSBtb3ZlIChmb3IgdGhlIG5ldyB1bmRvIGJ1dHRvbilcbiAgICovXG4gIHVuZG9TaW5nbGUoKTogYm9vbGVhbiB7XG4gICAgbG9nZ2VyLmRlYnVnKFwidW5kb1NpbmdsZSBjYWxsZWQsIGhpc3RvcnkgbGVuZ3RoOlwiLCB0aGlzLmhpc3RvcnkubGVuZ3RoKTtcblxuICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgbW92ZSA9IHRoaXMuY2hlc3MudW5kbygpO1xuICAgIGlmIChtb3ZlKSB7XG4gICAgICAvLyBBZGQgdG8gcmVkbyBzdGFja1xuICAgICAgdGhpcy5yZWRvU3RhY2sucHVzaChtb3ZlKTtcbiAgICAgIGNvbnN0IGFubm90YXRpb24gPSB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5wb3AoKTtcbiAgICAgIGlmIChhbm5vdGF0aW9uKSB7XG4gICAgICAgIHRoaXMucmVkb0Fubm90YXRpb25zLnB1c2goYW5ub3RhdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpO1xuICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuXG4gICAgICAvLyBVcGRhdGUgbGFzdE1vdmUgaWYgdGhlcmUgYXJlIHN0aWxsIG1vdmVzIGluIGhpc3RvcnlcbiAgICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBsYXN0TW92ZUluSGlzdG9yeSA9IHRoaXMuaGlzdG9yeVt0aGlzLmhpc3RvcnkubGVuZ3RoIC0gMV07XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSB7XG4gICAgICAgICAgZnJvbTogbGFzdE1vdmVJbkhpc3RvcnkuZnJvbSBhcyBTcXVhcmUsXG4gICAgICAgICAgdG86IGxhc3RNb3ZlSW5IaXN0b3J5LnRvIGFzIFNxdWFyZSxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gXCJVbmRpZCAxIG1vdmVcIjtcbiAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICB0aGlzLmNsZWFyUGVuZGluZ1BsYXllck1vdmVBbmFseXNpcygpO1xuICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICBsb2dnZXIuZGVidWcoXCJVbmRpZCAxIG1vdmUsIHJlZG8gc3RhY2sgc2l6ZTpcIiwgdGhpcy5yZWRvU3RhY2subGVuZ3RoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWRvIGEgc2luZ2xlIG1vdmVcbiAgICovXG4gIHJlZG9TaW5nbGUoKTogYm9vbGVhbiB7XG4gICAgbG9nZ2VyLmRlYnVnKFwicmVkb1NpbmdsZSBjYWxsZWQsIHJlZG8gc3RhY2sgc2l6ZTpcIiwgdGhpcy5yZWRvU3RhY2subGVuZ3RoKTtcblxuICAgIGlmICh0aGlzLnJlZG9TdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBtb3ZlVG9SZWRvID0gdGhpcy5yZWRvU3RhY2sucG9wKCk7XG4gICAgaWYgKCFtb3ZlVG9SZWRvKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGFubm90YXRpb25Ub1JlZG8gPSB0aGlzLnJlZG9Bbm5vdGF0aW9ucy5wb3AoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgZnJvbTogbW92ZVRvUmVkby5mcm9tIGFzIFNxdWFyZSxcbiAgICAgICAgdG86IG1vdmVUb1JlZG8udG8gYXMgU3F1YXJlLFxuICAgICAgICBwcm9tb3Rpb246IG1vdmVUb1JlZG8ucHJvbW90aW9uLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChtb3ZlKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeUFubm90YXRpb25zLnB1c2goXG4gICAgICAgICAgYW5ub3RhdGlvblRvUmVkbyA/PyB0aGlzLmNyZWF0ZU1vdmVBbm5vdGF0aW9uKG1vdmUsIGZhbHNlLCBcInJlZG9cIiksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IHsgZnJvbTogbW92ZS5mcm9tIGFzIFNxdWFyZSwgdG86IG1vdmUudG8gYXMgU3F1YXJlIH07XG4gICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBSZWRpZDogJHttb3ZlLnNhbn1gO1xuICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgIGFjdG9yOiBcInJlZG9cIixcbiAgICAgICAgICBtb3ZlLFxuICAgICAgICAgIGlzQnJpbGxpYW50OiBhbm5vdGF0aW9uVG9SZWRvPy5jb25zdW1lZEJyaWxsaWFudCA/PyBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG4gICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICBsb2dnZXIuZGVidWcoXCJSZWRpZCAxIG1vdmVcIik7XG5cbiAgICAgICAgLy8gSWYgYXV0by1wbGF5IGlzIGVuYWJsZWQgYW5kIGl0J3Mgbm93IHRoZSBlbmdpbmUncyB0dXJuLCB0cmlnZ2VyIGF1dG8tcGxheVxuICAgICAgICBpZiAoXG4gICAgICAgICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgJiZcbiAgICAgICAgICAhdGhpcy5pc0dhbWVPdmVyICYmXG4gICAgICAgICAgdGhpcy5jaGVzcy50dXJuKCkgPT09IHRoaXMuZW5naW5lUGxheXNGb3JcbiAgICAgICAgKSB7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKFwiU2NoZWR1bGluZyBhdXRvLXBsYXkgYWZ0ZXIgcmVkb1wiKTtcbiAgICAgICAgICB0aGlzLnNjaGVkdWxlQXV0b1BsYXlNb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihcIlJlZG8gZmFpbGVkOlwiLCBlcnIpO1xuICAgICAgLy8gUHV0IHRoZSBtb3ZlIGJhY2sgb24gdGhlIHN0YWNrIGlmIGl0IGZhaWxlZFxuICAgICAgdGhpcy5yZWRvU3RhY2sucHVzaChtb3ZlVG9SZWRvKTtcbiAgICAgIGlmIChhbm5vdGF0aW9uVG9SZWRvKSB7XG4gICAgICAgIHRoaXMucmVkb0Fubm90YXRpb25zLnB1c2goYW5ub3RhdGlvblRvUmVkbyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHVuZG8gaXMgYXZhaWxhYmxlXG4gICAqL1xuICBnZXQgY2FuVW5kbygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5Lmxlbmd0aCA+IDA7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgcmVkbyBpcyBhdmFpbGFibGVcbiAgICovXG4gIGdldCBjYW5SZWRvKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlZG9TdGFjay5sZW5ndGggPiAwO1xuICB9XG5cbiAgZ2V0IGF1dG9QbGF5Q3VycmVudFNpZGVMYWJlbCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmVuZ2luZVBsYXlzRm9yID09PSBcIndcIiA/IFwiV2hpdGVcIiA6IFwiQmxhY2tcIjtcbiAgfVxuXG4gIGdldCBjYW5TdGFydEF1dG9QbGF5VHVybigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgJiZcbiAgICAgICF0aGlzLmF1dG9QbGF5UGF1c2VkICYmXG4gICAgICAhdGhpcy5pc1RoaW5raW5nICYmXG4gICAgICAhdGhpcy5pc0dhbWVPdmVyICYmXG4gICAgICB0aGlzLnR1cm4gPT09IHRoaXMuZW5naW5lUGxheXNGb3JcbiAgICApO1xuICB9XG5cbiAgZ2V0IGlzQXV0b1BsYXlDb3VudGluZ0Rvd24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgPiBEYXRlLm5vdygpO1xuICB9XG5cbiAgZ2V0IGF1dG9QbGF5Q291bnRkb3duTXNSZW1haW5pbmcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pc0F1dG9QbGF5Q291bnRpbmdEb3duXG4gICAgICA/IE1hdGgubWF4KDAsIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgLSBEYXRlLm5vdygpKVxuICAgICAgOiAwO1xuICB9XG5cbiAgZ2V0IG1vdmVIaXN0b3J5Um93cygpOiBBcnJheTx7XG4gICAgbW92ZU51bWJlcjogbnVtYmVyO1xuICAgIHdoaXRlOiBNb3ZlIHwgbnVsbDtcbiAgICBibGFjazogTW92ZSB8IG51bGw7XG4gICAgd2hpdGVRdWFsaXR5TGFiZWw6IHN0cmluZyB8IG51bGw7XG4gICAgYmxhY2tRdWFsaXR5TGFiZWw6IHN0cmluZyB8IG51bGw7XG4gICAgd2hpdGVRdWFsaXR5QnVja2V0OiBEaXNwbGF5TW92ZUJ1Y2tldCB8IG51bGw7XG4gICAgYmxhY2tRdWFsaXR5QnVja2V0OiBEaXNwbGF5TW92ZUJ1Y2tldCB8IG51bGw7XG4gIH0+IHtcbiAgICBjb25zdCByb3dzOiBBcnJheTx7XG4gICAgICBtb3ZlTnVtYmVyOiBudW1iZXI7XG4gICAgICB3aGl0ZTogTW92ZSB8IG51bGw7XG4gICAgICBibGFjazogTW92ZSB8IG51bGw7XG4gICAgICB3aGl0ZVF1YWxpdHlMYWJlbDogc3RyaW5nIHwgbnVsbDtcbiAgICAgIGJsYWNrUXVhbGl0eUxhYmVsOiBzdHJpbmcgfCBudWxsO1xuICAgICAgd2hpdGVRdWFsaXR5QnVja2V0OiBEaXNwbGF5TW92ZUJ1Y2tldCB8IG51bGw7XG4gICAgICBibGFja1F1YWxpdHlCdWNrZXQ6IERpc3BsYXlNb3ZlQnVja2V0IHwgbnVsbDtcbiAgICB9PiA9IFtdO1xuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuaGlzdG9yeS5sZW5ndGg7IGluZGV4ICs9IDIpIHtcbiAgICAgIGNvbnN0IHdoaXRlTW92ZSA9IHRoaXMuaGlzdG9yeVtpbmRleF0gPz8gbnVsbDtcbiAgICAgIGNvbnN0IGJsYWNrTW92ZSA9IHRoaXMuaGlzdG9yeVtpbmRleCArIDFdID8/IG51bGw7XG4gICAgICBjb25zdCBtb3ZlTnVtYmVyID0gKGluZGV4ID4+IDEpICsgMTtcbiAgICAgIHJvd3MucHVzaCh7XG4gICAgICAgIG1vdmVOdW1iZXIsXG4gICAgICAgIHdoaXRlOiB3aGl0ZU1vdmUsXG4gICAgICAgIGJsYWNrOiBibGFja01vdmUsXG4gICAgICAgIHdoaXRlUXVhbGl0eUxhYmVsOiB0aGlzLnF1YWxpdHlMYWJlbEZvclBseShpbmRleCksXG4gICAgICAgIGJsYWNrUXVhbGl0eUxhYmVsOiB0aGlzLnF1YWxpdHlMYWJlbEZvclBseShpbmRleCArIDEpLFxuICAgICAgICB3aGl0ZVF1YWxpdHlCdWNrZXQ6IHRoaXMucXVhbGl0eUJ1Y2tldEZvclBseShpbmRleCksXG4gICAgICAgIGJsYWNrUXVhbGl0eUJ1Y2tldDogdGhpcy5xdWFsaXR5QnVja2V0Rm9yUGx5KGluZGV4ICsgMSksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGdldCBkZWJ1Z1Nlc3Npb25JZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdhbWVTZXNzaW9uSWQ7XG4gIH1cblxuICBnZXQgbW92ZUFubm90YXRpb25zKCk6IE1vdmVBbm5vdGF0aW9uW10ge1xuICAgIHJldHVybiB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5tYXAoKGFubm90YXRpb24pID0+ICh7IC4uLmFubm90YXRpb24gfSkpO1xuICB9XG5cbiAgZ2V0IGF1dG9QbGF5QWN0aXZlRHVyYXRpb25NcygpOiBudW1iZXIge1xuICAgIGlmIChcbiAgICAgIHRoaXMuYXV0b1BsYXlFbmFibGVkICYmXG4gICAgICAhdGhpcy5hdXRvUGxheVBhdXNlZCAmJlxuICAgICAgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgIT09IG51bGxcbiAgICApIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuYXV0b1BsYXlBY2N1bXVsYXRlZE1zICsgKERhdGUubm93KCkgLSB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYXV0b1BsYXlBY2N1bXVsYXRlZE1zO1xuICB9XG5cbiAgZ2V0IGhhc1NraXBwZWRFbmdpbmVNb3ZlTm90aWNlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgIT09IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3J0IGN1cnJlbnQgZ2FtZSBhcyBQR05cbiAgICovXG4gIGdldCBwZ24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5wZ24oKTtcbiAgfVxuXG4gIGdldCBsYXN0UGxheWVyTW92ZVF1YWxpdHlMYWJlbCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHlcbiAgICAgID8gRElTUExBWV9CVUNLRVRfTEFCRUxTW3RoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5XVxuICAgICAgOiBudWxsO1xuICB9XG5cbiAgZ2V0IGxhc3RQbGF5ZXJNb3ZlUXVhbGl0eUNvbG9yKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eVxuICAgICAgPyBESVNQTEFZX0JVQ0tFVF9DT0xPUlNbdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHldXG4gICAgICA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIHdhaXQoZGVsYXlNczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5TXMpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgY2FuU2NoZWR1bGVBdXRvUGxheSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgJiZcbiAgICAgICF0aGlzLmF1dG9QbGF5UGF1c2VkICYmXG4gICAgICAhdGhpcy5pc1RoaW5raW5nICYmXG4gICAgICAhdGhpcy5pc0dhbWVPdmVyICYmXG4gICAgICB0aGlzLnR1cm4gPT09IHRoaXMuZW5naW5lUGxheXNGb3JcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBiZWdpblNlc3Npb25TdGF0ZShvcHRpb25zOiB7XG4gICAgZ2FtZVNlc3Npb25JZDogc3RyaW5nO1xuICAgIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IGJvb2xlYW47XG4gICAgaGlzdG9yeUFubm90YXRpb25zPzogTW92ZUFubm90YXRpb25bXTtcbiAgICByZWRvQW5ub3RhdGlvbnM/OiBNb3ZlQW5ub3RhdGlvbltdO1xuICAgIHNldHVwTmFtZT86IHN0cmluZztcbiAgICBzZXR1cENhdGVnb3J5Pzogc3RyaW5nO1xuICB9KTogdm9pZCB7XG4gICAgdGhpcy5zdG9wQXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgdGhpcy5nYW1lU2Vzc2lvbklkID0gb3B0aW9ucy5nYW1lU2Vzc2lvbklkO1xuICAgIHRoaXMuZ2FtZVN0YXJ0RmVuID0gb3B0aW9ucy5nYW1lU3RhcnRGZW47XG4gICAgdGhpcy5zZXNzaW9uU3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLmN1cnJlbnRTZXR1cE5hbWUgPSBvcHRpb25zLnNldHVwTmFtZSA/PyBcIkN1c3RvbSBQb3NpdGlvblwiO1xuICAgIHRoaXMuY3VycmVudFNldHVwQ2F0ZWdvcnkgPSBvcHRpb25zLnNldHVwQ2F0ZWdvcnkgPz8gXCJjdXN0b21cIjtcbiAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucyA9IFsuLi4ob3B0aW9ucy5oaXN0b3J5QW5ub3RhdGlvbnMgPz8gW10pXTtcbiAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucyA9IFsuLi4ob3B0aW9ucy5yZWRvQW5ub3RhdGlvbnMgPz8gW10pXTtcbiAgICB0aGlzLnJlZG9TdGFjayA9IHRoaXMuY3JlYXRlUmVkb1N0YWNrRnJvbUFubm90YXRpb25zKHRoaXMucmVkb0Fubm90YXRpb25zKTtcbiAgICB0aGlzLmF1dG9QbGF5QWNjdW11bGF0ZWRNcyA9IDA7XG4gICAgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgPVxuICAgICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgJiYgIXRoaXMuYXV0b1BsYXlQYXVzZWQgPyBEYXRlLm5vdygpIDogbnVsbDtcbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIGlmIChvcHRpb25zLnJlc2V0QnJpbGxpYW50VHJhY2tpbmcpIHtcbiAgICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0QnJpbGxpYW50VHJhY2tpbmcodGhpcy5nYW1lU2Vzc2lvbklkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUmVkb1N0YXRlKCk6IHZvaWQge1xuICAgIHRoaXMucmVkb1N0YWNrID0gW107XG4gICAgdGhpcy5yZWRvQW5ub3RhdGlvbnMgPSBbXTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlTW92ZUFubm90YXRpb24oXG4gICAgbW92ZTogTW92ZSAmIHsgYmVmb3JlPzogc3RyaW5nOyBhZnRlcj86IHN0cmluZyB9LFxuICAgIGNvbnN1bWVkQnJpbGxpYW50OiBib29sZWFuLFxuICAgIGFjdG9yOiBcInBsYXllclwiIHwgXCJlbmdpbmVcIiB8IFwicmVkb1wiLFxuICApOiBNb3ZlQW5ub3RhdGlvbiB7XG4gICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBwcmV2aW91c1RpbWVzdGFtcCA9XG4gICAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9uc1t0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5sZW5ndGggLSAxXT8udGltZXN0YW1wID8/XG4gICAgICB0aGlzLnNlc3Npb25TdGFydGVkQXQ7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJlZm9yZUZlbjogbW92ZS5iZWZvcmUgPz8gdGhpcy5mZW4sXG4gICAgICBhZnRlckZlbjogbW92ZS5hZnRlciA/PyB0aGlzLmNoZXNzLmZlbigpLFxuICAgICAgdWNpOiBgJHttb3ZlLmZyb219JHttb3ZlLnRvfSR7bW92ZS5wcm9tb3Rpb24gfHwgXCJcIn1gLFxuICAgICAgbW92ZU51bWJlcjogdGhpcy5jaGVzcy5tb3ZlTnVtYmVyKCksXG4gICAgICBjb25zdW1lZEJyaWxsaWFudCxcbiAgICAgIGFjdG9yLFxuICAgICAgc2FuOiBtb3ZlLnNhbixcbiAgICAgIHRpbWVzdGFtcCxcbiAgICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiBNYXRoLm1heCgwLCB0aW1lc3RhbXAgLSBwcmV2aW91c1RpbWVzdGFtcCksXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgcmVjb3JkTW92ZUFubm90YXRpb24oXG4gICAgbW92ZTogTW92ZSAmIHsgYmVmb3JlPzogc3RyaW5nOyBhZnRlcj86IHN0cmluZyB9LFxuICAgIGNvbnN1bWVkQnJpbGxpYW50OiBib29sZWFuLFxuICAgIGFjdG9yOiBcInBsYXllclwiIHwgXCJlbmdpbmVcIiB8IFwicmVkb1wiLFxuICApOiB2b2lkIHtcbiAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5wdXNoKFxuICAgICAgdGhpcy5jcmVhdGVNb3ZlQW5ub3RhdGlvbihtb3ZlLCBjb25zdW1lZEJyaWxsaWFudCwgYWN0b3IpLFxuICAgICk7XG4gICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk6IHZvaWQge1xuICAgIGNvbnN0IHVzYWdlID0gZGVyaXZlQnJpbGxpYW50VXNhZ2UodGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMpO1xuICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlY29uY2lsZUJyaWxsaWFudFRyYWNraW5nKFxuICAgICAgdGhpcy5nYW1lU2Vzc2lvbklkLFxuICAgICAgdXNhZ2UuYnJpbGxpYW50TW92ZU51bWJlcnMsXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVBdXRvUGxheU1vdmUoXG4gICAgZGVsYXlNcyA9IHVpU3RhdGVWaWV3TW9kZWwuYXV0b1BsYXlEZWxheU1zLFxuICApOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoXCJzY2hlZHVsZUF1dG9QbGF5TW92ZSBjYWxsZWRcIiwgeyBkZWxheU1zIH0pO1xuICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG5cbiAgICBpZiAoIXRoaXMuY2FuU2NoZWR1bGVBdXRvUGxheSkge1xuICAgICAgbG9nZ2VyLmRlYnVnKFwic2NoZWR1bGVBdXRvUGxheU1vdmUgbm90IHNjaGVkdWxpbmcsIG5vdCBpbiBhIHZhbGlkIHN0YXRlXCIpO1xuICAgICAgLyoqXG4gICAgICAgKiBcbiAgICAgICAqIHRoaXMuYXV0b1BsYXlFbmFibGVkICYmXG4gICAgICAhdGhpcy5hdXRvUGxheVBhdXNlZCAmJlxuICAgICAgIXRoaXMuaXNUaGlua2luZyAmJlxuICAgICAgIXRoaXMuaXNHYW1lT3ZlciAmJlxuICAgICAgdGhpcy50dXJuID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yXG4gICAgICBcbiAgICAgICAqL1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiY2FuU2NoZWR1bGVBdXRvUGxheTpcIiwgdGhpcy5jYW5TY2hlZHVsZUF1dG9QbGF5KTtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcImF1dG9QbGF5RW5hYmxlZDpcIiwgdGhpcy5hdXRvUGxheUVuYWJsZWQpO1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiYXV0b1BsYXlQYXVzZWQ6XCIsIHRoaXMuYXV0b1BsYXlQYXVzZWQpO1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiaXNUaGlua2luZzpcIiwgdGhpcy5pc1RoaW5raW5nKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcImlzR2FtZU92ZXI6XCIsIHRoaXMuaXNHYW1lT3Zlcik7XG4gICAgICBsb2dnZXIuZGVidWcoXCJ0dXJuOlwiLCB0aGlzLnR1cm4pO1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiZW5naW5lUGxheXNGb3I6XCIsIHRoaXMuZW5naW5lUGxheXNGb3IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxvZ2dlci5kZWJ1ZyhcInNjaGVkdWxlQXV0b1BsYXlNb3ZlIHNjaGVkdWxpbmcsIGluIGEgdmFsaWQgc3RhdGVcIik7XG4gICAgdGhpcy5hdXRvUGxheVNjaGVkdWxlZEZvciA9IERhdGUubm93KCkgKyBkZWxheU1zO1xuICAgIHRoaXMuX2F1dG9QbGF5VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICBsb2dnZXIuZGVidWcoXCJzY2hlZHVsZUF1dG9QbGF5TW92ZSB0aW1lb3V0IGFjdGlvblwiKTtcbiAgICAgICAgdGhpcy5hdXRvUGxheVNjaGVkdWxlZEZvciA9IDA7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuc29sdmVOZXh0TW92ZSh0cnVlKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcInNjaGVkdWxlQXV0b1BsYXlNb3ZlIHRpbWVvdXQgZXJyb3JcIiwgZXJyKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFwiQXV0by1wbGF5IGVycm9yOlwiLCBlcnIpO1xuICAgICAgfSk7XG4gICAgfSwgZGVsYXlNcyk7XG4gIH1cblxuICBwcml2YXRlIGNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYXV0b1BsYXlUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fYXV0b1BsYXlUaW1lb3V0KTtcbiAgICAgIHRoaXMuX2F1dG9QbGF5VGltZW91dCA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgPSAwO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclBlbmRpbmdQbGF5ZXJNb3ZlQW5hbHlzaXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BsYXllck1vdmVBbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wbGF5ZXJNb3ZlQW5hbHlzaXNUaW1lb3V0KTtcbiAgICAgIHRoaXMuX3BsYXllck1vdmVBbmFseXNpc1RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVzZXRUcmFuc2llbnRCb2FyZFN0YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9hbmFseXNpc1RpbWVvdXQpO1xuICAgICAgdGhpcy5fYW5hbHlzaXNUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIHRoaXMuY2xlYXJQZW5kaW5nUGxheWVyTW92ZUFuYWx5c2lzKCk7XG4gICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgdGhpcy5hdXRvUGxheVBhdXNlZCA9IGZhbHNlO1xuICAgIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgPSAwO1xuICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gbnVsbDtcbiAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICB0aGlzLmFuYWx5emVkTGVnYWxNb3Zlc0ZlbiA9IG51bGw7XG4gICAgdGhpcy5jbGVhcldpbkNoYW5jZXNTY2hlZHVsZSgpO1xuICAgIHRoaXMuX3dpbkNoYW5jZVJlcXVlc3RTZXEgKz0gMTtcbiAgICB0aGlzLndpbkNoYW5jZVdoaXRlUGVyY2VudCA9IDUwO1xuICAgIHRoaXMud2luQ2hhbmNlQmxhY2tQZXJjZW50ID0gNTA7XG4gICAgdGhpcy53aW5DaGFuY2VzTG9hZGluZyA9IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBxdWFsaXR5TGFiZWxGb3JQbHkocGx5SW5kZXg6IG51bWJlcik6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGFubm90YXRpb24gPSB0aGlzLmhpc3RvcnlBbm5vdGF0aW9uc1twbHlJbmRleF07XG4gICAgaWYgKCFhbm5vdGF0aW9uKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGFubm90YXRpb24uY29uc3VtZWRCcmlsbGlhbnQpIHtcbiAgICAgIHJldHVybiBcIkJyaWxsaWFudFwiO1xuICAgIH1cbiAgICBpZiAoYW5ub3RhdGlvbi5idWNrZXQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoRElTUExBWV9CVUNLRVRfTEFCRUxTLCBhbm5vdGF0aW9uLmJ1Y2tldCkpIHtcbiAgICAgICAgcmV0dXJuIERJU1BMQVlfQlVDS0VUX0xBQkVMU1thbm5vdGF0aW9uLmJ1Y2tldCBhcyBEaXNwbGF5TW92ZUJ1Y2tldF07XG4gICAgICB9XG4gICAgICByZXR1cm4gYW5ub3RhdGlvbi5idWNrZXQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBxdWFsaXR5QnVja2V0Rm9yUGx5KHBseUluZGV4OiBudW1iZXIpOiBEaXNwbGF5TW92ZUJ1Y2tldCB8IG51bGwge1xuICAgIGNvbnN0IGFubm90YXRpb24gPSB0aGlzLmhpc3RvcnlBbm5vdGF0aW9uc1twbHlJbmRleF07XG4gICAgaWYgKCFhbm5vdGF0aW9uPy5idWNrZXQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKERJU1BMQVlfQlVDS0VUX0xBQkVMUywgYW5ub3RhdGlvbi5idWNrZXQpKSB7XG4gICAgICByZXR1cm4gYW5ub3RhdGlvbi5idWNrZXQgYXMgRGlzcGxheU1vdmVCdWNrZXQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhcldpbkNoYW5jZXNTY2hlZHVsZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd2luQ2hhbmNlVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3dpbkNoYW5jZVRpbWVvdXQpO1xuICAgICAgdGhpcy5fd2luQ2hhbmNlVGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZVdpbkNoYW5jZXNSZWZyZXNoKCk6IHZvaWQge1xuICAgIHRoaXMuY2xlYXJXaW5DaGFuY2VzU2NoZWR1bGUoKTtcbiAgICB0aGlzLl93aW5DaGFuY2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl93aW5DaGFuY2VUaW1lb3V0ID0gbnVsbDtcbiAgICAgIHZvaWQgdGhpcy5yZWZyZXNoV2luQ2hhbmNlc0Zyb21FbmdpbmUoKTtcbiAgICB9LCAzODApO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyByZWZyZXNoV2luQ2hhbmNlc0Zyb21FbmdpbmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVxdWVzdElkID0gKyt0aGlzLl93aW5DaGFuY2VSZXF1ZXN0U2VxO1xuICAgIGNvbnN0IGZlblNuYXBzaG90ID0gdGhpcy5mZW47XG4gICAgY29uc3QgdHVyblNuYXBzaG90ID0gdGhpcy5jaGVzcy50dXJuKCk7XG5cbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICB0aGlzLndpbkNoYW5jZXNMb2FkaW5nID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5pc0NoZWNrbWF0ZSkge1xuICAgICAgICBjb25zdCB3aGl0ZVdpbnMgPSB0dXJuU25hcHNob3QgPT09IFwiYlwiO1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgaWYgKHJlcXVlc3RJZCAhPT0gdGhpcy5fd2luQ2hhbmNlUmVxdWVzdFNlcSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLndpbkNoYW5jZVdoaXRlUGVyY2VudCA9IHdoaXRlV2lucyA/IDEwMCA6IDA7XG4gICAgICAgICAgdGhpcy53aW5DaGFuY2VCbGFja1BlcmNlbnQgPSB3aGl0ZVdpbnMgPyAwIDogMTAwO1xuICAgICAgICAgIHRoaXMud2luQ2hhbmNlc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNHYW1lT3Zlcikge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgaWYgKHJlcXVlc3RJZCAhPT0gdGhpcy5fd2luQ2hhbmNlUmVxdWVzdFNlcSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLndpbkNoYW5jZVdoaXRlUGVyY2VudCA9IDUwO1xuICAgICAgICAgIHRoaXMud2luQ2hhbmNlQmxhY2tQZXJjZW50ID0gNTA7XG4gICAgICAgICAgdGhpcy53aW5DaGFuY2VzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkKSB7XG4gICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICBpZiAocmVxdWVzdElkICE9PSB0aGlzLl93aW5DaGFuY2VSZXF1ZXN0U2VxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMud2luQ2hhbmNlV2hpdGVQZXJjZW50ID0gNTA7XG4gICAgICAgICAgdGhpcy53aW5DaGFuY2VCbGFja1BlcmNlbnQgPSA1MDtcbiAgICAgICAgICB0aGlzLndpbkNoYW5jZXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRlcHRoID0gTWF0aC5taW4oMTQsIE1hdGgubWF4KDgsIGNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCkpO1xuICAgICAgY29uc3QgYW5hbHlzaXMgPSBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uKFxuICAgICAgICBmZW5TbmFwc2hvdCxcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIDEsXG4gICAgICAgIFwiYmFja2dyb3VuZFwiLFxuICAgICAgKTtcblxuICAgICAgaWYgKHJlcXVlc3RJZCAhPT0gdGhpcy5fd2luQ2hhbmNlUmVxdWVzdFNlcSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgYW5hbHlzaXMuaWdub3JlZCB8fFxuICAgICAgICAhY2FuQXBwbHlBbmFseXplZE1vdmUodGhpcy5mZW4sIGFuYWx5c2lzLmFuYWx5emVkRmVuKSB8fFxuICAgICAgICBhbmFseXNpcy5tb3Zlcy5sZW5ndGggPT09IDBcbiAgICAgICkge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy53aW5DaGFuY2VzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZXN0ID0gYW5hbHlzaXMubW92ZXNbMF07XG4gICAgICBjb25zdCB3aGl0ZVBvc2l0aXZlID0gZXZhbEZyb21TaWRlVG9Nb3ZlVG9XaGl0ZVBvc2l0aXZlKFxuICAgICAgICBiZXN0LmV2YWx1YXRpb24sXG4gICAgICAgIHR1cm5TbmFwc2hvdCxcbiAgICAgICk7XG4gICAgICBjb25zdCB7IHdoaXRlLCBibGFjayB9ID0gd2hpdGVQb3NpdGl2ZUV2YWxUb1dpbkNoYW5jZXMod2hpdGVQb3NpdGl2ZSk7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMud2luQ2hhbmNlV2hpdGVQZXJjZW50ID0gd2hpdGU7XG4gICAgICAgIHRoaXMud2luQ2hhbmNlQmxhY2tQZXJjZW50ID0gYmxhY2s7XG4gICAgICAgIHRoaXMud2luQ2hhbmNlc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICBpZiAocmVxdWVzdElkICE9PSB0aGlzLl93aW5DaGFuY2VSZXF1ZXN0U2VxKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud2luQ2hhbmNlc0xvYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3luY0F1dG9QbGF5U2NoZWR1bGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2FuU2NoZWR1bGVBdXRvUGxheSkge1xuICAgICAgdGhpcy5zY2hlZHVsZUF1dG9QbGF5TW92ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gIH1cblxuICBwcml2YXRlIHN0b3BBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0ICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmF1dG9QbGF5QWNjdW11bGF0ZWRNcyArPSBEYXRlLm5vdygpIC0gdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQ7XG4gICAgICB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdGFydEF1dG9QbGF5RHVyYXRpb25UcmFja2luZygpOiB2b2lkIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJlxuICAgICAgIXRoaXMuYXV0b1BsYXlQYXVzZWQgJiZcbiAgICAgIHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0ID09PSBudWxsXG4gICAgKSB7XG4gICAgICB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCA9IERhdGUubm93KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVMYXN0QW5ub3RhdGlvbihwYXJ0aWFsOiBQYXJ0aWFsPE1vdmVBbm5vdGF0aW9uPik6IHZvaWQge1xuICAgIGlmICh0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5sZW5ndGggLSAxO1xuICAgIHRoaXMuaGlzdG9yeUFubm90YXRpb25zW2xhc3RJbmRleF0gPSB7XG4gICAgICAuLi50aGlzLmhpc3RvcnlBbm5vdGF0aW9uc1tsYXN0SW5kZXhdLFxuICAgICAgLi4ucGFydGlhbCxcbiAgICB9O1xuICAgIHRoaXMuc2F2ZUZlblRvSGlzdG9yeSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBwdWJsaXNoTW92ZUZlZWRiYWNrKG9wdGlvbnM6IHtcbiAgICBhY3RvcjogXCJwbGF5ZXJcIiB8IFwiZW5naW5lXCIgfCBcInJlZG9cIjtcbiAgICBtb3ZlOiBNb3ZlO1xuICAgIGlzQnJpbGxpYW50OiBib29sZWFuO1xuICAgIHF1YWxpdHlMYWJlbD86IHN0cmluZyB8IG51bGw7XG4gICAgYnVja2V0PzogRGlzcGxheU1vdmVCdWNrZXQgfCBNb3ZlQnVja2V0IHwgbnVsbDtcbiAgICBzaWxlbnQ/OiBib29sZWFuO1xuICB9KTogdm9pZCB7XG4gICAgdGhpcy5yZWNlbnRNb3ZlRmVlZGJhY2sgPSB7XG4gICAgICBpZDogYCR7RGF0ZS5ub3coKX1fJHtvcHRpb25zLm1vdmUuc2FufV8ke29wdGlvbnMuYWN0b3J9YCxcbiAgICAgIGFjdG9yOiBvcHRpb25zLmFjdG9yLFxuICAgICAgc2FuOiBvcHRpb25zLm1vdmUuc2FuLFxuICAgICAgcXVhbGl0eUxhYmVsOiBvcHRpb25zLnF1YWxpdHlMYWJlbCA/PyBudWxsLFxuICAgICAgYnVja2V0OiBvcHRpb25zLmJ1Y2tldCA/PyBudWxsLFxuICAgICAgaXNCcmlsbGlhbnQ6IG9wdGlvbnMuaXNCcmlsbGlhbnQsXG4gICAgICBpc0NhcHR1cmU6IG9wdGlvbnMubW92ZS5pc0NhcHR1cmUoKSxcbiAgICAgIGlzQ2hlY2s6IG9wdGlvbnMubW92ZS5zYW4uaW5jbHVkZXMoXCIrXCIpIHx8IG9wdGlvbnMubW92ZS5zYW4uaW5jbHVkZXMoXCIjXCIpLFxuICAgICAgaXNHYW1lRW5kOiB0aGlzLmlzR2FtZU92ZXIsXG4gICAgICBzaWxlbnQ6IG9wdGlvbnMuc2lsZW50ID8/IGZhbHNlLFxuICAgICAgY3JlYXRlZEF0OiBEYXRlLm5vdygpLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHVuZG9Nb3Zlcyhjb3VudDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdW5kb25lTW92ZXM6IE1vdmVbXSA9IFtdO1xuICAgIGNvbnN0IHVuZG9uZUFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdID0gW107XG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY291bnQ7IGluZGV4ICs9IDEpIHtcbiAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLnVuZG8oKTtcbiAgICAgIGlmICghbW92ZSkge1xuICAgICAgICBmb3IgKFxuICAgICAgICAgIGxldCByZXN0b3JlSW5kZXggPSB1bmRvbmVNb3Zlcy5sZW5ndGggLSAxO1xuICAgICAgICAgIHJlc3RvcmVJbmRleCA+PSAwO1xuICAgICAgICAgIHJlc3RvcmVJbmRleCAtPSAxXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHJlc3RvcmVNb3ZlID0gdW5kb25lTW92ZXNbcmVzdG9yZUluZGV4XTtcbiAgICAgICAgICB0aGlzLmNoZXNzLm1vdmUoe1xuICAgICAgICAgICAgZnJvbTogcmVzdG9yZU1vdmUuZnJvbSBhcyBTcXVhcmUsXG4gICAgICAgICAgICB0bzogcmVzdG9yZU1vdmUudG8gYXMgU3F1YXJlLFxuICAgICAgICAgICAgcHJvbW90aW9uOiByZXN0b3JlTW92ZS5wcm9tb3Rpb24sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB1bmRvbmVNb3Zlcy5wdXNoKG1vdmUpO1xuICAgICAgY29uc3QgYW5ub3RhdGlvbiA9IHRoaXMuaGlzdG9yeUFubm90YXRpb25zLnBvcCgpO1xuICAgICAgaWYgKGFubm90YXRpb24pIHtcbiAgICAgICAgdW5kb25lQW5ub3RhdGlvbnMucHVzaChhbm5vdGF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlZG9TdGFjay5wdXNoKC4uLnVuZG9uZU1vdmVzKTtcbiAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucy5wdXNoKC4uLnVuZG9uZUFubm90YXRpb25zKTtcbiAgICB0aGlzLnN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkUGVyc2lzdGVkQm9hcmRTdGF0ZSgpOiBQZXJzaXN0ZWRCb2FyZFN0YXRlIHwgbnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucGVyc2lzdEVuZ2luZUNvbmZpZykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkJPQVJEX1NUQVRFX1NUT1JBR0VfS0VZKTtcbiAgICAgIGlmICghc2F2ZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzIFBhcnRpYWw8UGVyc2lzdGVkQm9hcmRTdGF0ZT47XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50RmVuOiBwYXJzZWQuY3VycmVudEZlbiA/PyBcIlwiLFxuICAgICAgICBmZW5IaXN0b3J5OiBBcnJheS5pc0FycmF5KHBhcnNlZC5mZW5IaXN0b3J5KSA/IHBhcnNlZC5mZW5IaXN0b3J5IDogW10sXG4gICAgICAgIGdhbWVTZXNzaW9uSWQ6IHBhcnNlZC5nYW1lU2Vzc2lvbklkID8/IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKSxcbiAgICAgICAgZ2FtZVN0YXJ0RmVuOlxuICAgICAgICAgIHBhcnNlZC5nYW1lU3RhcnRGZW4gPz8gcGFyc2VkLmN1cnJlbnRGZW4gPz8gbmV3IENoZXNzKCkuZmVuKCksXG4gICAgICAgIGhpc3RvcnlBbm5vdGF0aW9uczogQXJyYXkuaXNBcnJheShwYXJzZWQuaGlzdG9yeUFubm90YXRpb25zKVxuICAgICAgICAgID8gcGFyc2VkLmhpc3RvcnlBbm5vdGF0aW9uc1xuICAgICAgICAgIDogW10sXG4gICAgICAgIHJlZG9Bbm5vdGF0aW9uczogQXJyYXkuaXNBcnJheShwYXJzZWQucmVkb0Fubm90YXRpb25zKVxuICAgICAgICAgID8gcGFyc2VkLnJlZG9Bbm5vdGF0aW9uc1xuICAgICAgICAgIDogW10sXG4gICAgICB9O1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclBlcnNpc3RlZEJvYXJkU3RhdGUoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuQk9BUkRfU1RBVEVfU1RPUkFHRV9LRVkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gY2xlYXIgYm9hcmQgc3RhdGUgc3RvcmFnZTpcIiwgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlUmVkb1N0YWNrRnJvbUFubm90YXRpb25zKFxuICAgIGFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdLFxuICApOiBNb3ZlW10ge1xuICAgIHJldHVybiBhbm5vdGF0aW9ucy5tYXAoKGFubm90YXRpb24pID0+ICh7XG4gICAgICBmcm9tOiBhbm5vdGF0aW9uLnVjaS5zbGljZSgwLCAyKSxcbiAgICAgIHRvOiBhbm5vdGF0aW9uLnVjaS5zbGljZSgyLCA0KSxcbiAgICAgIHByb21vdGlvbjogYW5ub3RhdGlvbi51Y2kubGVuZ3RoID4gNCA/IGFubm90YXRpb24udWNpWzRdIDogdW5kZWZpbmVkLFxuICAgIH0pKSBhcyBNb3ZlW107XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgYm9hcmRWaWV3TW9kZWwgPSBuZXcgQm9hcmRWaWV3TW9kZWwoKTtcbiIsICJpbXBvcnQgeyBNb3ZlQW5ub3RhdGlvbiB9IGZyb20gJy4vYnJpbGxpYW50VHJhY2tpbmcnO1xuaW1wb3J0IHsgRGlzcGxheU1vdmVCdWNrZXQsIE1vdmVRdWFsaXR5UHJlc2V0SWQgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBHYW1lQW5hbHl0aWNzU3VtbWFyeSB7XG4gIHNlc3Npb25JZDogc3RyaW5nO1xuICBjcmVhdGVkQXQ6IHN0cmluZztcbiAgZmluaXNoZWRBdDogc3RyaW5nO1xuICByZXN1bHQ6IHN0cmluZztcbiAgZ2FtZVN0YXR1czogc3RyaW5nO1xuICBwZXJzb25hSWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCAnY3VzdG9tJztcbiAgcGVyc29uYUxhYmVsOiBzdHJpbmc7XG4gIHNldHVwTmFtZTogc3RyaW5nO1xuICBzZXR1cENhdGVnb3J5OiBzdHJpbmc7XG4gIG1vdmVDb3VudDogbnVtYmVyO1xuICBicmlsbGlhbnRNb3ZlczogbnVtYmVyO1xuICBpbmFjY3VyYWNpZXM6IG51bWJlcjtcbiAgbWlzdGFrZXM6IG51bWJlcjtcbiAgYmx1bmRlcnM6IG51bWJlcjtcbiAgYXZlcmFnZUV2YWxMb3NzOiBudW1iZXI7XG4gIGF2ZXJhZ2VNb3ZlRGVsYXlNczogbnVtYmVyO1xuICBhdXRvcGxheUR1cmF0aW9uTXM6IG51bWJlcjtcbiAgcXVhbGl0eUNvdW50czogUmVjb3JkPERpc3BsYXlNb3ZlQnVja2V0LCBudW1iZXI+O1xuICBjb21wbGV4aXR5RGlzdHJpYnV0aW9uOiBSZWNvcmQ8J2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJywgbnVtYmVyPjtcbiAgbW92ZVRpbWVsaW5lOiBBcnJheTx7XG4gICAgcGx5OiBudW1iZXI7XG4gICAgYWN0b3I6ICdwbGF5ZXInIHwgJ2VuZ2luZScgfCAncmVkbyc7XG4gICAgc2FuOiBzdHJpbmc7XG4gICAgYnVja2V0OiBzdHJpbmcgfCBudWxsO1xuICAgIGV2YWxMb3NzOiBudW1iZXIgfCBudWxsO1xuICAgIGV2YWx1YXRpb246IG51bWJlciB8IG51bGw7XG4gICAgY29tcGxleGl0eUxldmVsOiAnbG93JyB8ICdtZWRpdW0nIHwgJ2hpZ2gnIHwgbnVsbDtcbiAgICBjb21wbGV4aXR5U2NvcmU6IG51bWJlciB8IG51bGw7XG4gICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IG51bWJlcjtcbiAgICBjb25zdW1lZEJyaWxsaWFudDogYm9vbGVhbjtcbiAgfT47XG4gIGhpZ2hsaWdodGVkQnJpbGxpYW50TW92ZXM6IEFycmF5PHsgcGx5OiBudW1iZXI7IHNhbjogc3RyaW5nIH0+O1xuICBtYWpvck1pc3Rha2VzOiBBcnJheTx7IHBseTogbnVtYmVyOyBzYW46IHN0cmluZzsgYnVja2V0OiBzdHJpbmcgfCBudWxsOyBldmFsTG9zczogbnVtYmVyIHwgbnVsbCB9PjtcbiAgZXZhbFRyZW5kOiBBcnJheTx7IHBseTogbnVtYmVyOyBldmFsdWF0aW9uOiBudW1iZXIgfT47XG4gIGNvbXBsZXhpdHlUcmVuZDogQXJyYXk8eyBwbHk6IG51bWJlcjsgc2NvcmU6IG51bWJlciB9PjtcbiAgcGduOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjZW50R2FtZUVudHJ5IHtcbiAgc2Vzc2lvbklkOiBzdHJpbmc7XG4gIGZpbmlzaGVkQXQ6IHN0cmluZztcbiAgcmVzdWx0OiBzdHJpbmc7XG4gIHBlcnNvbmFMYWJlbDogc3RyaW5nO1xuICBwZXJzb25hSWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCAnY3VzdG9tJztcbiAgc2V0dXBOYW1lOiBzdHJpbmc7XG4gIGR1cmF0aW9uTXM6IG51bWJlcjtcbiAgbW92ZUNvdW50OiBudW1iZXI7XG4gIGJyaWxsaWFudE1vdmVzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnVpbGRHYW1lQW5hbHl0aWNzT3B0aW9ucyB7XG4gIHNlc3Npb25JZDogc3RyaW5nO1xuICBjcmVhdGVkQXRNczogbnVtYmVyO1xuICBmaW5pc2hlZEF0TXM6IG51bWJlcjtcbiAgZ2FtZVN0YXR1czogc3RyaW5nO1xuICBwZXJzb25hSWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsO1xuICBwZXJzb25hTGFiZWw6IHN0cmluZztcbiAgc2V0dXBOYW1lPzogc3RyaW5nIHwgbnVsbDtcbiAgc2V0dXBDYXRlZ29yeT86IHN0cmluZyB8IG51bGw7XG4gIGF1dG9wbGF5RHVyYXRpb25NczogbnVtYmVyO1xuICBtb3ZlQW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW107XG4gIHBnbjogc3RyaW5nO1xufVxuXG5jb25zdCBBTExfQlVDS0VUUzogRGlzcGxheU1vdmVCdWNrZXRbXSA9IFtcbiAgJ2Jlc3QnLFxuICAnZ3JlYXQnLFxuICAnZXhjZWxsZW50JyxcbiAgJ2dvb2QnLFxuICAnaW5hY2N1cmFjeScsXG4gICdtaXN0YWtlJyxcbiAgJ2JsdW5kZXInLFxuICAnZmFsbGJhY2snLFxuXTtcblxuZnVuY3Rpb24gY3JlYXRlRW1wdHlRdWFsaXR5Q291bnRzKCk6IFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gIHJldHVybiBBTExfQlVDS0VUUy5yZWR1Y2UoKGNvdW50cywgYnVja2V0KSA9PiB7XG4gICAgY291bnRzW2J1Y2tldF0gPSAwO1xuICAgIHJldHVybiBjb3VudHM7XG4gIH0sIHt9IGFzIFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgbnVtYmVyPik7XG59XG5cbmZ1bmN0aW9uIGNsYXNzaWZ5UmVzdWx0KGdhbWVTdGF0dXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICgvY2hlY2ttYXRlL2kudGVzdChnYW1lU3RhdHVzKSkge1xuICAgIGNvbnN0IHdpbm5lciA9IGdhbWVTdGF0dXMuaW5jbHVkZXMoJ1doaXRlIHdpbnMnKSA/ICdXaGl0ZScgOiBnYW1lU3RhdHVzLmluY2x1ZGVzKCdCbGFjayB3aW5zJykgPyAnQmxhY2snIDogJ0RlY2lzaXZlJztcbiAgICByZXR1cm4gYCR7d2lubmVyfSB3b25gO1xuICB9XG5cbiAgaWYgKC9zdGFsZW1hdGV8ZHJhdy9pLnRlc3QoZ2FtZVN0YXR1cykpIHtcbiAgICByZXR1cm4gJ0RyYXcnO1xuICB9XG5cbiAgaWYgKC9jaGVjay9pLnRlc3QoZ2FtZVN0YXR1cykpIHtcbiAgICByZXR1cm4gJ0luIHByb2dyZXNzJztcbiAgfVxuXG4gIHJldHVybiAnSW4gcHJvZ3Jlc3MnO1xufVxuXG5mdW5jdGlvbiByb3VuZFRvT25lRGVjaW1hbCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUgKiAxMCkgLyAxMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkR2FtZUFuYWx5dGljc1N1bW1hcnkob3B0aW9uczogQnVpbGRHYW1lQW5hbHl0aWNzT3B0aW9ucyk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5IHtcbiAgY29uc3QgcXVhbGl0eUNvdW50cyA9IGNyZWF0ZUVtcHR5UXVhbGl0eUNvdW50cygpO1xuICBjb25zdCBjb21wbGV4aXR5RGlzdHJpYnV0aW9uOiBSZWNvcmQ8J2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJywgbnVtYmVyPiA9IHtcbiAgICBsb3c6IDAsXG4gICAgbWVkaXVtOiAwLFxuICAgIGhpZ2g6IDAsXG4gIH07XG5cbiAgbGV0IGV2YWxMb3NzVG90YWwgPSAwO1xuICBsZXQgZXZhbExvc3NDb3VudCA9IDA7XG4gIGxldCBkZWxheVRvdGFsID0gMDtcbiAgbGV0IGRlbGF5Q291bnQgPSAwO1xuICBsZXQgYnJpbGxpYW50TW92ZXMgPSAwO1xuXG4gIGNvbnN0IG1vdmVUaW1lbGluZSA9IG9wdGlvbnMubW92ZUFubm90YXRpb25zLm1hcCgoYW5ub3RhdGlvbiwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBidWNrZXQgPSAoYW5ub3RhdGlvbi5idWNrZXQgPz8gbnVsbCkgYXMgc3RyaW5nIHwgbnVsbDtcbiAgICBjb25zdCB0eXBlZEJ1Y2tldCA9IEFMTF9CVUNLRVRTLmluY2x1ZGVzKGJ1Y2tldCBhcyBEaXNwbGF5TW92ZUJ1Y2tldClcbiAgICAgID8gKGJ1Y2tldCBhcyBEaXNwbGF5TW92ZUJ1Y2tldClcbiAgICAgIDogbnVsbDtcblxuICAgIGlmICh0eXBlZEJ1Y2tldCkge1xuICAgICAgcXVhbGl0eUNvdW50c1t0eXBlZEJ1Y2tldF0gKz0gMTtcbiAgICB9XG5cbiAgICBpZiAoYW5ub3RhdGlvbi5jb25zdW1lZEJyaWxsaWFudCkge1xuICAgICAgYnJpbGxpYW50TW92ZXMgKz0gMTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFubm90YXRpb24uZXZhbExvc3MgPT09ICdudW1iZXInKSB7XG4gICAgICBldmFsTG9zc1RvdGFsICs9IGFubm90YXRpb24uZXZhbExvc3M7XG4gICAgICBldmFsTG9zc0NvdW50ICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhbm5vdGF0aW9uLmRlbGF5TXNTaW5jZVByZXZpb3VzID09PSAnbnVtYmVyJykge1xuICAgICAgZGVsYXlUb3RhbCArPSBhbm5vdGF0aW9uLmRlbGF5TXNTaW5jZVByZXZpb3VzO1xuICAgICAgZGVsYXlDb3VudCArPSAxO1xuICAgIH1cblxuICAgIGlmIChhbm5vdGF0aW9uLmNvbXBsZXhpdHlMZXZlbCkge1xuICAgICAgY29tcGxleGl0eURpc3RyaWJ1dGlvblthbm5vdGF0aW9uLmNvbXBsZXhpdHlMZXZlbF0gKz0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcGx5OiBpbmRleCArIDEsXG4gICAgICBhY3RvcjogYW5ub3RhdGlvbi5hY3RvciA/PyAncGxheWVyJyxcbiAgICAgIHNhbjogYW5ub3RhdGlvbi5zYW4gPz8gYW5ub3RhdGlvbi51Y2ksXG4gICAgICBidWNrZXQsXG4gICAgICBldmFsTG9zczogYW5ub3RhdGlvbi5ldmFsTG9zcyA/PyBudWxsLFxuICAgICAgZXZhbHVhdGlvbjogYW5ub3RhdGlvbi5ldmFsdWF0aW9uID8/IG51bGwsXG4gICAgICBjb21wbGV4aXR5TGV2ZWw6IGFubm90YXRpb24uY29tcGxleGl0eUxldmVsID8/IG51bGwsXG4gICAgICBjb21wbGV4aXR5U2NvcmU6IGFubm90YXRpb24uY29tcGxleGl0eVNjb3JlID8/IG51bGwsXG4gICAgICBkZWxheU1zU2luY2VQcmV2aW91czogYW5ub3RhdGlvbi5kZWxheU1zU2luY2VQcmV2aW91cyA/PyAwLFxuICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IGFubm90YXRpb24uY29uc3VtZWRCcmlsbGlhbnQsXG4gICAgfTtcbiAgfSk7XG5cbiAgY29uc3QgaGlnaGxpZ2h0ZWRCcmlsbGlhbnRNb3ZlcyA9IG1vdmVUaW1lbGluZVxuICAgIC5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS5jb25zdW1lZEJyaWxsaWFudClcbiAgICAubWFwKChlbnRyeSkgPT4gKHsgcGx5OiBlbnRyeS5wbHksIHNhbjogZW50cnkuc2FuIH0pKTtcbiAgY29uc3QgbWFqb3JNaXN0YWtlcyA9IG1vdmVUaW1lbGluZVxuICAgIC5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS5idWNrZXQgPT09ICdtaXN0YWtlJyB8fCBlbnRyeS5idWNrZXQgPT09ICdibHVuZGVyJylcbiAgICAubWFwKChlbnRyeSkgPT4gKHtcbiAgICAgIHBseTogZW50cnkucGx5LFxuICAgICAgc2FuOiBlbnRyeS5zYW4sXG4gICAgICBidWNrZXQ6IGVudHJ5LmJ1Y2tldCxcbiAgICAgIGV2YWxMb3NzOiBlbnRyeS5ldmFsTG9zcyxcbiAgICB9KSk7XG4gIGNvbnN0IGV2YWxUcmVuZCA9IG1vdmVUaW1lbGluZVxuICAgIC5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgdHlwZW9mIGVudHJ5ICYgeyBldmFsdWF0aW9uOiBudW1iZXIgfSA9PiB0eXBlb2YgZW50cnkuZXZhbHVhdGlvbiA9PT0gJ251bWJlcicpXG4gICAgLm1hcCgoZW50cnkpID0+ICh7IHBseTogZW50cnkucGx5LCBldmFsdWF0aW9uOiBlbnRyeS5ldmFsdWF0aW9uIH0pKTtcbiAgY29uc3QgY29tcGxleGl0eVRyZW5kID0gbW92ZVRpbWVsaW5lXG4gICAgLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyB0eXBlb2YgZW50cnkgJiB7IGNvbXBsZXhpdHlTY29yZTogbnVtYmVyIH0gPT4gdHlwZW9mIGVudHJ5LmNvbXBsZXhpdHlTY29yZSA9PT0gJ251bWJlcicpXG4gICAgLm1hcCgoZW50cnkpID0+ICh7IHBseTogZW50cnkucGx5LCBzY29yZTogZW50cnkuY29tcGxleGl0eVNjb3JlIH0pKTtcblxuICByZXR1cm4ge1xuICAgIHNlc3Npb25JZDogb3B0aW9ucy5zZXNzaW9uSWQsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZShvcHRpb25zLmNyZWF0ZWRBdE1zKS50b0lTT1N0cmluZygpLFxuICAgIGZpbmlzaGVkQXQ6IG5ldyBEYXRlKG9wdGlvbnMuZmluaXNoZWRBdE1zKS50b0lTT1N0cmluZygpLFxuICAgIHJlc3VsdDogY2xhc3NpZnlSZXN1bHQob3B0aW9ucy5nYW1lU3RhdHVzKSxcbiAgICBnYW1lU3RhdHVzOiBvcHRpb25zLmdhbWVTdGF0dXMsXG4gICAgcGVyc29uYUlkOiBvcHRpb25zLnBlcnNvbmFJZCA/PyAnY3VzdG9tJyxcbiAgICBwZXJzb25hTGFiZWw6IG9wdGlvbnMucGVyc29uYUxhYmVsLFxuICAgIHNldHVwTmFtZTogb3B0aW9ucy5zZXR1cE5hbWUgPz8gJ05ldyBHYW1lJyxcbiAgICBzZXR1cENhdGVnb3J5OiBvcHRpb25zLnNldHVwQ2F0ZWdvcnkgPz8gJ2N1c3RvbScsXG4gICAgbW92ZUNvdW50OiBtb3ZlVGltZWxpbmUubGVuZ3RoLFxuICAgIGJyaWxsaWFudE1vdmVzLFxuICAgIGluYWNjdXJhY2llczogcXVhbGl0eUNvdW50cy5pbmFjY3VyYWN5LFxuICAgIG1pc3Rha2VzOiBxdWFsaXR5Q291bnRzLm1pc3Rha2UsXG4gICAgYmx1bmRlcnM6IHF1YWxpdHlDb3VudHMuYmx1bmRlcixcbiAgICBhdmVyYWdlRXZhbExvc3M6IGV2YWxMb3NzQ291bnQgPiAwID8gcm91bmRUb09uZURlY2ltYWwoZXZhbExvc3NUb3RhbCAvIGV2YWxMb3NzQ291bnQpIDogMCxcbiAgICBhdmVyYWdlTW92ZURlbGF5TXM6IGRlbGF5Q291bnQgPiAwID8gTWF0aC5yb3VuZChkZWxheVRvdGFsIC8gZGVsYXlDb3VudCkgOiAwLFxuICAgIGF1dG9wbGF5RHVyYXRpb25NczogTWF0aC5tYXgoMCwgb3B0aW9ucy5hdXRvcGxheUR1cmF0aW9uTXMpLFxuICAgIHF1YWxpdHlDb3VudHMsXG4gICAgY29tcGxleGl0eURpc3RyaWJ1dGlvbixcbiAgICBtb3ZlVGltZWxpbmUsXG4gICAgaGlnaGxpZ2h0ZWRCcmlsbGlhbnRNb3ZlcyxcbiAgICBtYWpvck1pc3Rha2VzLFxuICAgIGV2YWxUcmVuZCxcbiAgICBjb21wbGV4aXR5VHJlbmQsXG4gICAgcGduOiBvcHRpb25zLnBnbixcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmVjZW50R2FtZUVudHJ5KHN1bW1hcnk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5KTogUmVjZW50R2FtZUVudHJ5IHtcbiAgcmV0dXJuIHtcbiAgICBzZXNzaW9uSWQ6IHN1bW1hcnkuc2Vzc2lvbklkLFxuICAgIGZpbmlzaGVkQXQ6IHN1bW1hcnkuZmluaXNoZWRBdCxcbiAgICByZXN1bHQ6IHN1bW1hcnkucmVzdWx0LFxuICAgIHBlcnNvbmFMYWJlbDogc3VtbWFyeS5wZXJzb25hTGFiZWwsXG4gICAgcGVyc29uYUlkOiBzdW1tYXJ5LnBlcnNvbmFJZCxcbiAgICBzZXR1cE5hbWU6IHN1bW1hcnkuc2V0dXBOYW1lLFxuICAgIGR1cmF0aW9uTXM6IE1hdGgubWF4KDAsIG5ldyBEYXRlKHN1bW1hcnkuZmluaXNoZWRBdCkuZ2V0VGltZSgpIC0gbmV3IERhdGUoc3VtbWFyeS5jcmVhdGVkQXQpLmdldFRpbWUoKSksXG4gICAgbW92ZUNvdW50OiBzdW1tYXJ5Lm1vdmVDb3VudCxcbiAgICBicmlsbGlhbnRNb3Zlczogc3VtbWFyeS5icmlsbGlhbnRNb3ZlcyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUdhbWVBbmFseXRpY3NTdW1tYXJ5KHN1bW1hcnk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5KTogc3RyaW5nIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHN1bW1hcnksIG51bGwsIDIpO1xufVxuIiwgImltcG9ydCB7IGFjdGlvbiwgbWFrZUF1dG9PYnNlcnZhYmxlLCByZWFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSxcbiAgYnVpbGRSZWNlbnRHYW1lRW50cnksXG4gIEdhbWVBbmFseXRpY3NTdW1tYXJ5LFxuICBSZWNlbnRHYW1lRW50cnksXG4gIHNlcmlhbGl6ZUdhbWVBbmFseXRpY3NTdW1tYXJ5LFxufSBmcm9tICcuLi9lbmdpbmUvZ2FtZUFuYWx5dGljcyc7XG5pbXBvcnQgeyBib2FyZFZpZXdNb2RlbCwgQm9hcmRWaWV3TW9kZWwgfSBmcm9tICcuL0JvYXJkVmlld01vZGVsJztcbmltcG9ydCB7IGNvbmZpZ1ZpZXdNb2RlbCwgQ29uZmlnVmlld01vZGVsIH0gZnJvbSAnLi9Db25maWdWaWV3TW9kZWwnO1xuXG5jb25zdCBSRUNFTlRfR0FNRVNfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX3JlY2VudF9nYW1lcyc7XG5jb25zdCBNQVhfUkVDRU5UX0dBTUVTID0gMjA7XG5cbmludGVyZmFjZSBQZXJzaXN0ZWRBbmFseXRpY3NTbmFwc2hvdCB7XG4gIHJlY2VudEdhbWVzOiBHYW1lQW5hbHl0aWNzU3VtbWFyeVtdO1xufVxuXG5pbnRlcmZhY2UgR2FtZUFuYWx5dGljc0RlcGVuZGVuY2llcyB7XG4gIGJvYXJkVmlld01vZGVsOiBQaWNrPFxuICAgIEJvYXJkVmlld01vZGVsLFxuICAgIHwgJ2RlYnVnU2Vzc2lvbklkJ1xuICAgIHwgJ21vdmVBbm5vdGF0aW9ucydcbiAgICB8ICdzZXNzaW9uU3RhcnRlZEF0J1xuICAgIHwgJ2dhbWVTdGF0dXMnXG4gICAgfCAncGduJ1xuICAgIHwgJ2N1cnJlbnRTZXR1cE5hbWUnXG4gICAgfCAnY3VycmVudFNldHVwQ2F0ZWdvcnknXG4gICAgfCAnYXV0b1BsYXlBY3RpdmVEdXJhdGlvbk1zJ1xuICAgIHwgJ2lzR2FtZU92ZXInXG4gID47XG4gIGNvbmZpZ1ZpZXdNb2RlbDogUGljazxDb25maWdWaWV3TW9kZWwsICdhY3RpdmVQZXJzb25hSWQnIHwgJ2FjdGl2ZVBlcnNvbmFMYWJlbCc+O1xufVxuXG5mdW5jdGlvbiBkb3dubG9hZFRleHRGaWxlKGZpbGVOYW1lOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcsIG1pbWVUeXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2NvbnRlbnRzXSwgeyB0eXBlOiBtaW1lVHlwZSB9KTtcbiAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgY29uc3QgYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBhbmNob3IuaHJlZiA9IHVybDtcbiAgYW5jaG9yLmRvd25sb2FkID0gZmlsZU5hbWU7XG4gIGFuY2hvci5jbGljaygpO1xuICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG59XG5cbmZ1bmN0aW9uIHNhZmVQYXJzZVJlY2VudEdhbWVzKHNhdmVkOiBzdHJpbmcgfCBudWxsKTogR2FtZUFuYWx5dGljc1N1bW1hcnlbXSB7XG4gIGlmICghc2F2ZWQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzIFBlcnNpc3RlZEFuYWx5dGljc1NuYXBzaG90IHwgR2FtZUFuYWx5dGljc1N1bW1hcnlbXTtcbiAgICBjb25zdCByZWNlbnRHYW1lcyA9IEFycmF5LmlzQXJyYXkocGFyc2VkKVxuICAgICAgPyBwYXJzZWRcbiAgICAgIDogQXJyYXkuaXNBcnJheShwYXJzZWQucmVjZW50R2FtZXMpXG4gICAgICAgID8gcGFyc2VkLnJlY2VudEdhbWVzXG4gICAgICAgIDogW107XG5cbiAgICByZXR1cm4gcmVjZW50R2FtZXMuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIEdhbWVBbmFseXRpY3NTdW1tYXJ5ID0+IChcbiAgICAgIHR5cGVvZiBlbnRyeT8uc2Vzc2lvbklkID09PSAnc3RyaW5nJ1xuICAgICAgJiYgdHlwZW9mIGVudHJ5Py5maW5pc2hlZEF0ID09PSAnc3RyaW5nJ1xuICAgICAgJiYgdHlwZW9mIGVudHJ5Py5wZXJzb25hTGFiZWwgPT09ICdzdHJpbmcnXG4gICAgICAmJiB0eXBlb2YgZW50cnk/LnNldHVwTmFtZSA9PT0gJ3N0cmluZydcbiAgICApKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lQW5hbHl0aWNzVmlld01vZGVsIHtcbiAgc3VtbWFyeU9wZW4gPSBmYWxzZTtcbiAgcmVjZW50R2FtZXM6IEdhbWVBbmFseXRpY3NTdW1tYXJ5W10gPSBbXTtcbiAgc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgbGFzdENhcHR1cmVkU2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRlcHM6IEdhbWVBbmFseXRpY3NEZXBlbmRlbmNpZXM7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZGVwczogR2FtZUFuYWx5dGljc0RlcGVuZGVuY2llcyA9IHtcbiAgICAgIGJvYXJkVmlld01vZGVsLFxuICAgICAgY29uZmlnVmlld01vZGVsLFxuICAgIH0sXG4gICkge1xuICAgIHRoaXMuZGVwcyA9IGRlcHM7XG5cbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0U3VtbWFyeU9wZW46IGFjdGlvbixcbiAgICAgIHNldFNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZDogYWN0aW9uLFxuICAgICAgY2FwdHVyZUNvbXBsZXRlZEdhbWU6IGFjdGlvbixcbiAgICAgIGNsZWFyUmVjZW50R2FtZXM6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG5cbiAgICByZWFjdGlvbihcbiAgICAgICgpID0+ICh7XG4gICAgICAgIHNlc3Npb25JZDogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmRlYnVnU2Vzc2lvbklkLFxuICAgICAgICBpc0dhbWVPdmVyOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuaXNHYW1lT3ZlcixcbiAgICAgICAgbW92ZUNvdW50OiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwubW92ZUFubm90YXRpb25zLmxlbmd0aCxcbiAgICAgIH0pLFxuICAgICAgKHsgc2Vzc2lvbklkLCBpc0dhbWVPdmVyLCBtb3ZlQ291bnQgfSkgPT4ge1xuICAgICAgICBpZiAoaXNHYW1lT3ZlciAmJiBtb3ZlQ291bnQgPiAwICYmIHRoaXMubGFzdENhcHR1cmVkU2Vzc2lvbklkICE9PSBzZXNzaW9uSWQpIHtcbiAgICAgICAgICB0aGlzLmNhcHR1cmVDb21wbGV0ZWRHYW1lKCk7XG4gICAgICAgICAgdGhpcy5zdW1tYXJ5T3BlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIHNldFN1bW1hcnlPcGVuKG9wZW46IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAob3Blbikge1xuICAgICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnN1bW1hcnlPcGVuID0gb3BlbjtcbiAgfVxuXG4gIHNldFNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZChzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCA9IHNlc3Npb25JZDtcbiAgfVxuXG4gIGNhcHR1cmVDb21wbGV0ZWRHYW1lKCk6IHZvaWQge1xuICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLmN1cnJlbnRTdW1tYXJ5O1xuICAgIGlmICghc3VtbWFyeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHVwZGF0ZWQgPSBbc3VtbWFyeSwgLi4udGhpcy5yZWNlbnRHYW1lcy5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS5zZXNzaW9uSWQgIT09IHN1bW1hcnkuc2Vzc2lvbklkKV1cbiAgICAgIC5zbGljZSgwLCBNQVhfUkVDRU5UX0dBTUVTKTtcbiAgICB0aGlzLnJlY2VudEdhbWVzID0gdXBkYXRlZDtcbiAgICB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCA9IHN1bW1hcnkuc2Vzc2lvbklkO1xuICAgIHRoaXMubGFzdENhcHR1cmVkU2Vzc2lvbklkID0gc3VtbWFyeS5zZXNzaW9uSWQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBjbGVhclJlY2VudEdhbWVzKCk6IHZvaWQge1xuICAgIHRoaXMucmVjZW50R2FtZXMgPSBbXTtcbiAgICB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCA9IG51bGw7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBleHBvcnRDdXJyZW50U3VtbWFyeSgpOiB2b2lkIHtcbiAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5jdXJyZW50U3VtbWFyeTtcbiAgICBpZiAoIXN1bW1hcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkb3dubG9hZFRleHRGaWxlKGBwZXJzb25hY2hlc3Mtc3VtbWFyeS0ke3N1bW1hcnkuc2Vzc2lvbklkfS5qc29uYCwgc2VyaWFsaXplR2FtZUFuYWx5dGljc1N1bW1hcnkoc3VtbWFyeSksICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gIH1cblxuICBleHBvcnRDdXJyZW50UGduKCk6IHZvaWQge1xuICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLmN1cnJlbnRTdW1tYXJ5O1xuICAgIGlmICghc3VtbWFyeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRvd25sb2FkVGV4dEZpbGUoYHBlcnNvbmFjaGVzcy1nYW1lLSR7c3VtbWFyeS5zZXNzaW9uSWR9LnBnbmAsIHN1bW1hcnkucGduLCAnYXBwbGljYXRpb24veC1jaGVzcy1wZ24nKTtcbiAgfVxuXG4gIGdldCBjdXJyZW50U3VtbWFyeSgpOiBHYW1lQW5hbHl0aWNzU3VtbWFyeSB8IG51bGwge1xuICAgIGNvbnN0IGFubm90YXRpb25zID0gdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLm1vdmVBbm5vdGF0aW9ucztcbiAgICBpZiAoYW5ub3RhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSh7XG4gICAgICBzZXNzaW9uSWQ6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5kZWJ1Z1Nlc3Npb25JZCxcbiAgICAgIGNyZWF0ZWRBdE1zOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuc2Vzc2lvblN0YXJ0ZWRBdCxcbiAgICAgIGZpbmlzaGVkQXRNczogRGF0ZS5ub3coKSxcbiAgICAgIGdhbWVTdGF0dXM6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5nYW1lU3RhdHVzLFxuICAgICAgcGVyc29uYUlkOiB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmFjdGl2ZVBlcnNvbmFJZCxcbiAgICAgIHBlcnNvbmFMYWJlbDogdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5hY3RpdmVQZXJzb25hTGFiZWwsXG4gICAgICBzZXR1cE5hbWU6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5jdXJyZW50U2V0dXBOYW1lLFxuICAgICAgc2V0dXBDYXRlZ29yeTogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmN1cnJlbnRTZXR1cENhdGVnb3J5LFxuICAgICAgYXV0b3BsYXlEdXJhdGlvbk1zOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuYXV0b1BsYXlBY3RpdmVEdXJhdGlvbk1zLFxuICAgICAgbW92ZUFubm90YXRpb25zOiBhbm5vdGF0aW9ucyxcbiAgICAgIHBnbjogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLnBnbixcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBzZWxlY3RlZFJlY2VudEdhbWUoKTogR2FtZUFuYWx5dGljc1N1bW1hcnkgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5yZWNlbnRHYW1lcy5maW5kKChlbnRyeSkgPT4gZW50cnkuc2Vzc2lvbklkID09PSB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCkgPz8gbnVsbDtcbiAgfVxuXG4gIGdldCByZWNlbnRHYW1lRW50cmllcygpOiBSZWNlbnRHYW1lRW50cnlbXSB7XG4gICAgcmV0dXJuIHRoaXMucmVjZW50R2FtZXMubWFwKChzdW1tYXJ5KSA9PiBidWlsZFJlY2VudEdhbWVFbnRyeShzdW1tYXJ5KSk7XG4gIH1cblxuICBwcml2YXRlIHJlc3RvcmVGcm9tU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5yZWNlbnRHYW1lcyA9IHNhZmVQYXJzZVJlY2VudEdhbWVzKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFJFQ0VOVF9HQU1FU19TVE9SQUdFX0tFWSkpO1xuICAgICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSB0aGlzLnJlY2VudEdhbWVzWzBdPy5zZXNzaW9uSWQgPz8gbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMucmVjZW50R2FtZXMgPSBbXTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNuYXBzaG90OiBQZXJzaXN0ZWRBbmFseXRpY3NTbmFwc2hvdCA9IHtcbiAgICAgICAgcmVjZW50R2FtZXM6IHRoaXMucmVjZW50R2FtZXMsXG4gICAgICB9O1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oUkVDRU5UX0dBTUVTX1NUT1JBR0VfS0VZLCBKU09OLnN0cmluZ2lmeShzbmFwc2hvdCkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGxvY2FsU3RvcmFnZSBmYWlsdXJlcyBhbmQga2VlcCBhbmFseXRpY3MgYXZhaWxhYmxlIGZvciB0aGUgY3VycmVudCBzZXNzaW9uLlxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZ2FtZUFuYWx5dGljc1ZpZXdNb2RlbCA9IG5ldyBHYW1lQW5hbHl0aWNzVmlld01vZGVsKCk7XG4iLCAiLyoqXG4gKiBQcmVkZWZpbmVkIGNoZXNzIG9wZW5pbmdzIChQR04gbW92ZSBzZXF1ZW5jZXMpXG4gKiBVc2VkIHRvIGxvYWQgYSBwb3NpdGlvbiBhZnRlciB0aGUgZ2l2ZW4gbW92ZXMgZnJvbSB0aGUgaW5pdGlhbCBwb3NpdGlvbi5cbiAqL1xuXG5leHBvcnQgdHlwZSBPcGVuaW5nU2lkZSA9ICd3aGl0ZScgfCAnYmxhY2snO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wZW5pbmcge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBXaGljaCBzaWRlIHBsYXlzIHRoaXMgb3BlbmluZyAodGhlIG9wZW5pbmcgaXMgbmFtZWQgZnJvbSB0aGlzIHNpZGUncyBwZXJzcGVjdGl2ZSkgKi9cbiAgc2lkZTogT3BlbmluZ1NpZGU7XG4gIC8qKiBTaG9ydCBkZXNjcmlwdGlvbiBvciBFQ08tc3R5bGUgdGFnICovXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICAvKiogUEdOIG1vdmUgc2VxdWVuY2UgZnJvbSB0aGUgc3RhcnRpbmcgcG9zaXRpb24gKGUuZy4gXCIxLiBlNCBlNSAyLiBRaDVcIikgKi9cbiAgcGduOiBzdHJpbmc7XG59XG5cbi8qKiBCdWlsZCBtaW5pbWFsIFBHTiBmb3IgY2hlc3MuanMgKGhlYWRlcnMgKyBibGFuayBsaW5lICsgbW92ZXMgKyByZXN1bHQpICovXG5mdW5jdGlvbiBwZ24obW92ZXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG1vdmVUZXh0ID0gbW92ZXMudHJpbSgpLmVuZHNXaXRoKCcqJykgPyBtb3Zlcy50cmltKCkgOiBgJHttb3Zlcy50cmltKCl9ICpgO1xuICByZXR1cm4gYFtFdmVudCBcIj9cIl1cXG5bU2l0ZSBcIj9cIl1cXG5bRGF0ZSBcIj8/Pz8uPz8uPz9cIl1cXG5bV2hpdGUgXCI/XCJdXFxuW0JsYWNrIFwiP1wiXVxcbltSZXN1bHQgXCIqXCJdXFxuXFxuJHttb3ZlVGV4dH1gO1xufVxuXG5leHBvcnQgY29uc3QgUFJFREVGSU5FRF9PUEVOSU5HUzogT3BlbmluZ1tdID0gW1xuICB7XG4gICAgaWQ6ICduYXBvbGVvbicsXG4gICAgbmFtZTogXCJLaW5nJ3MgUGF3bjogTmFwb2xlb24gQXR0YWNrXCIsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGU1IDIuIFFoNScsXG4gICAgcGduOiBwZ24oJzEuIGU0IGU1IDIuIFFoNScpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdpdGFsaWFuJyxcbiAgICBuYW1lOiBcIkl0YWxpYW4gR2FtZVwiLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJjNCcsXG4gICAgcGduOiBwZ24oJzEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmM0JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ3J1eV9sb3BleicsXG4gICAgbmFtZTogJ1J1eSBMb3BleicsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmI1JyxcbiAgICBwZ246IHBnbignMS4gZTQgZTUgMi4gTmYzIE5jNiAzLiBCYjUnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAnc2ljaWxpYW4nLFxuICAgIG5hbWU6ICdTaWNpbGlhbiBEZWZlbnNlJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgYzUnLFxuICAgIHBnbjogcGduKCcxLiBlNCBjNScpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdmcmVuY2gnLFxuICAgIG5hbWU6ICdGcmVuY2ggRGVmZW5zZScsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGU2JyxcbiAgICBwZ246IHBnbignMS4gZTQgZTYnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAnY2Fyb19rYW5uJyxcbiAgICBuYW1lOiAnQ2Fyby1LYW5uJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgYzYnLFxuICAgIHBnbjogcGduKCcxLiBlNCBjNicpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdxdWVlbnNfZ2FtYml0JyxcbiAgICBuYW1lOiBcIlF1ZWVuJ3MgR2FtYml0XCIsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGQ0IGQ1IDIuIGM0JyxcbiAgICBwZ246IHBnbignMS4gZDQgZDUgMi4gYzQnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAnbG9uZG9uJyxcbiAgICBuYW1lOiAnTG9uZG9uIFN5c3RlbScsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGQ0IGQ1IDIuIEJmNCcsXG4gICAgcGduOiBwZ24oJzEuIGQ0IGQ1IDIuIEJmNCcpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdraW5nc19pbmRpYW4nLFxuICAgIG5hbWU6IFwiS2luZydzIEluZGlhbiBEZWZlbnNlXCIsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGQ0IE5mNiAyLiBjNCBnNicsXG4gICAgcGduOiBwZ24oJzEuIGQ0IE5mNiAyLiBjNCBnNicpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdwaXJjJyxcbiAgICBuYW1lOiAnUGlyYyBEZWZlbnNlJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgZDYgMi4gZDQgTmY2JyxcbiAgICBwZ246IHBnbignMS4gZTQgZDYgMi4gZDQgTmY2JyksXG4gIH0sXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3BlbmluZ0J5SWQoaWQ6IHN0cmluZyk6IE9wZW5pbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gUFJFREVGSU5FRF9PUEVOSU5HUy5maW5kKG8gPT4gby5pZCA9PT0gaWQpO1xufVxuIiwgImltcG9ydCB7IGdldE9wZW5pbmdCeUlkLCBPcGVuaW5nU2lkZSwgUFJFREVGSU5FRF9PUEVOSU5HUyB9IGZyb20gJy4vb3BlbmluZ3MnO1xuXG5leHBvcnQgdHlwZSBHYW1lU2V0dXBDYXRlZ29yeSA9ICdvcGVuaW5ncycgfCAndGFjdGljYWwnIHwgJ2VuZGdhbWVzJyB8ICdjdXN0b20tZmVuJyB8ICdjdXN0b20tcGduJztcbmV4cG9ydCB0eXBlIEdhbWVTZXR1cERpZmZpY3VsdHkgPSAnZWFzeScgfCAnbWVkaXVtJyB8ICdoYXJkJztcbmV4cG9ydCB0eXBlIEdhbWVTZXR1cFNvdXJjZVR5cGUgPSAnZmVuJyB8ICdwZ24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdhbWVTZXR1cFByZXNldCB7XG4gIGlkOiBzdHJpbmc7XG4gIGNhdGVnb3J5OiBFeGNsdWRlPEdhbWVTZXR1cENhdGVnb3J5LCAnY3VzdG9tLWZlbicgfCAnY3VzdG9tLXBnbic+O1xuICBuYW1lOiBzdHJpbmc7XG4gIHNpZGU6IE9wZW5pbmdTaWRlO1xuICBkaWZmaWN1bHR5OiBHYW1lU2V0dXBEaWZmaWN1bHR5O1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICB0YWdzOiBzdHJpbmdbXTtcbiAgc291cmNlVHlwZTogR2FtZVNldHVwU291cmNlVHlwZTtcbiAgc291cmNlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBHQU1FX1NFVFVQX0NBVEVHT1JZX09QVElPTlM6IEFycmF5PHsgdmFsdWU6IEdhbWVTZXR1cENhdGVnb3J5OyBsYWJlbDogc3RyaW5nIH0+ID0gW1xuICB7IHZhbHVlOiAnb3BlbmluZ3MnLCBsYWJlbDogJ09wZW5pbmdzJyB9LFxuICB7IHZhbHVlOiAndGFjdGljYWwnLCBsYWJlbDogJ1RhY3RpY2FsIHBvc2l0aW9ucycgfSxcbiAgeyB2YWx1ZTogJ2VuZGdhbWVzJywgbGFiZWw6ICdFbmRnYW1lcycgfSxcbiAgeyB2YWx1ZTogJ2N1c3RvbS1mZW4nLCBsYWJlbDogJ0N1c3RvbSBGRU4nIH0sXG4gIHsgdmFsdWU6ICdjdXN0b20tcGduJywgbGFiZWw6ICdDdXN0b20gUEdOJyB9LFxuXTtcblxuZnVuY3Rpb24gb3BlbmluZ0RpZmZpY3VsdHlUYWcobmFtZTogc3RyaW5nKTogR2FtZVNldHVwRGlmZmljdWx0eSB7XG4gIGlmICgvbmFwb2xlb24vaS50ZXN0KG5hbWUpKSB7XG4gICAgcmV0dXJuICdlYXN5JztcbiAgfVxuXG4gIGlmICgvaXRhbGlhbnxsb25kb258cXVlZW4vaS50ZXN0KG5hbWUpKSB7XG4gICAgcmV0dXJuICdtZWRpdW0nO1xuICB9XG5cbiAgcmV0dXJuICdoYXJkJztcbn1cblxuY29uc3QgT1BFTklOR19QUkVTRVRTOiBHYW1lU2V0dXBQcmVzZXRbXSA9IFBSRURFRklORURfT1BFTklOR1MubWFwKChvcGVuaW5nKSA9PiAoe1xuICBpZDogb3BlbmluZy5pZCxcbiAgY2F0ZWdvcnk6ICdvcGVuaW5ncycsXG4gIG5hbWU6IG9wZW5pbmcubmFtZSxcbiAgc2lkZTogb3BlbmluZy5zaWRlLFxuICBkaWZmaWN1bHR5OiBvcGVuaW5nRGlmZmljdWx0eVRhZyhvcGVuaW5nLm5hbWUpLFxuICBkZXNjcmlwdGlvbjogb3BlbmluZy5kZXNjcmlwdGlvbiA/PyBgJHtvcGVuaW5nLm5hbWV9IHNldHVwYCxcbiAgdGFnczogWydvcGVuaW5nJywgb3BlbmluZy5zaWRlLCBvcGVuaW5nLm5hbWUudG9Mb3dlckNhc2UoKV0sXG4gIHNvdXJjZVR5cGU6ICdwZ24nLFxuICBzb3VyY2U6IG9wZW5pbmcucGduLFxufSkpO1xuXG5jb25zdCBUQUNUSUNBTF9QUkVTRVRTOiBHYW1lU2V0dXBQcmVzZXRbXSA9IFtcbiAge1xuICAgIGlkOiAndGFjdGljLWJhY2stcmFuay1uZXQnLFxuICAgIGNhdGVnb3J5OiAndGFjdGljYWwnLFxuICAgIG5hbWU6ICdCYWNrIFJhbmsgTmV0JyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRpZmZpY3VsdHk6ICdtZWRpdW0nLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hpdGUgdG8gbW92ZSB3aXRoIGEgZGlyZWN0IGF0dGFja2luZyBpZGVhIGFnYWluc3QgYW4gZXhwb3NlZCBiYWNrIHJhbmsuJyxcbiAgICB0YWdzOiBbJ3RhY3RpY2FsJywgJ21hdGUtdGhyZWF0JywgJ2F0dGFjaycsICd3aGl0ZS10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAnNmsxLzVwcHAvM1E0LzgvOC84LzVQUFAvNksxIHcgLSAtIDAgMScsXG4gIH0sXG4gIHtcbiAgICBpZDogJ3RhY3RpYy1rbmlnaHQtZm9yaycsXG4gICAgY2F0ZWdvcnk6ICd0YWN0aWNhbCcsXG4gICAgbmFtZTogJ0tuaWdodCBGb3JrIE9wcG9ydHVuaXR5JyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRpZmZpY3VsdHk6ICdlYXN5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0EgdHJhaW5pbmcgcG9zaXRpb24gYnVpbHQgYXJvdW5kIHNwb3R0aW5nIGEgc2ltcGxlIGZvcmsgbW90aWYuJyxcbiAgICB0YWdzOiBbJ3RhY3RpY2FsJywgJ2ZvcmsnLCAnd2hpdGUtdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJ3IzazJyL3BwcHExcHBwLzJucGJuMi8zTnAzLzJCMVAzLzJONS9QUFAyUFBQL1IxQlExUksxIHcga3EgLSAwIDEnLFxuICB9LFxuICB7XG4gICAgaWQ6ICd0YWN0aWMtZGVmbGVjdGlvbicsXG4gICAgY2F0ZWdvcnk6ICd0YWN0aWNhbCcsXG4gICAgbmFtZTogJ0RlZmxlY3Rpb24gU3RyaWtlJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRpZmZpY3VsdHk6ICdoYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0JsYWNrIHRvIG1vdmUgaW4gYSBzaGFycCBtaWRkbGVnYW1lIHdoZXJlIGNhbGN1bGF0aW9uIG1hdHRlcnMgbW9yZSB0aGFuIG1lbW9yaXphdGlvbi4nLFxuICAgIHRhZ3M6IFsndGFjdGljYWwnLCAnZGVmbGVjdGlvbicsICdjYWxjdWxhdGlvbicsICdibGFjay10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAncjJxMXJrMS9wcDFiMXBwcC8ybjFwbjIvMmJwNC8yUDUvMk5QMU5QMS9QUDJQUEJQL1IxQlExUksxIGIgLSAtIDQgOScsXG4gIH0sXG5dO1xuXG5jb25zdCBFTkRHQU1FX1BSRVNFVFM6IEdhbWVTZXR1cFByZXNldFtdID0gW1xuICB7XG4gICAgaWQ6ICdlbmRnYW1lLWx1Y2VuYS1icmlkZ2UnLFxuICAgIGNhdGVnb3J5OiAnZW5kZ2FtZXMnLFxuICAgIG5hbWU6ICdMdWNlbmEgQnJpZGdlIFNldHVwJyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRpZmZpY3VsdHk6ICdoYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NsYXNzaWMgcm9vayBlbmRnYW1lIGNvbnZlcnNpb24gcHJhY3RpY2Ugd2l0aCBXaGl0ZSBwcmVzc2luZyBmb3IgdGhlIHdpbi4nLFxuICAgIHRhZ3M6IFsnZW5kZ2FtZScsICdyb29rJywgJ2x1Y2VuYScsICd3aGl0ZS10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAnOC8yazUvMlA1LzJLUjQvOC84LzgvOCB3IC0gLSAwIDEnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdlbmRnYW1lLW9wcG9zaXRpb24nLFxuICAgIGNhdGVnb3J5OiAnZW5kZ2FtZXMnLFxuICAgIG5hbWU6ICdLaW5nIE9wcG9zaXRpb24nLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGlmZmljdWx0eTogJ2Vhc3knLFxuICAgIGRlc2NyaXB0aW9uOiAnQSBwdXJlIGtpbmctYW5kLXBhd24gZW5kaW5nIGZvY3VzZWQgb24gZ2FpbmluZyBvcHBvc2l0aW9uIGNsZWFubHkuJyxcbiAgICB0YWdzOiBbJ2VuZGdhbWUnLCAna2luZy1hbmQtcGF3bicsICdvcHBvc2l0aW9uJywgJ3doaXRlLXRvLW1vdmUnXSxcbiAgICBzb3VyY2VUeXBlOiAnZmVuJyxcbiAgICBzb3VyY2U6ICc4LzgvOC8zazQvM1A0LzRLMy84LzggdyAtIC0gMCAxJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnZW5kZ2FtZS1xdWVlbi12cy1wYXduJyxcbiAgICBjYXRlZ29yeTogJ2VuZGdhbWVzJyxcbiAgICBuYW1lOiAnUXVlZW4gdnMgUGFzc2VkIFBhd24nLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGlmZmljdWx0eTogJ21lZGl1bScsXG4gICAgZGVzY3JpcHRpb246ICdCbGFjayBkZWZlbmRzIGFnYWluc3QgcHJvbW90aW9uIHRocmVhdHMgaW4gYSBwcmVjaXNlIHF1ZWVuIGVuZGluZy4nLFxuICAgIHRhZ3M6IFsnZW5kZ2FtZScsICdxdWVlbicsICdwYXNzZWQtcGF3bicsICdibGFjay10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAnNmsxLzVwcDEvOC84LzgvNlExLzVQMi82SzEgYiAtIC0gMCAxJyxcbiAgfSxcbl07XG5cbmV4cG9ydCBjb25zdCBHQU1FX1NFVFVQX1BSRVNFVFM6IEdhbWVTZXR1cFByZXNldFtdID0gW1xuICAuLi5PUEVOSU5HX1BSRVNFVFMsXG4gIC4uLlRBQ1RJQ0FMX1BSRVNFVFMsXG4gIC4uLkVOREdBTUVfUFJFU0VUUyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRHYW1lU2V0dXBQcmVzZXRCeUlkKGlkOiBzdHJpbmcpOiBHYW1lU2V0dXBQcmVzZXQgfCB1bmRlZmluZWQge1xuICByZXR1cm4gR0FNRV9TRVRVUF9QUkVTRVRTLmZpbmQoKHByZXNldCkgPT4gcHJlc2V0LmlkID09PSBpZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcGVuaW5nUHJlc2V0QnlJZChpZDogc3RyaW5nKTogR2FtZVNldHVwUHJlc2V0IHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIE9QRU5JTkdfUFJFU0VUUy5maW5kKChwcmVzZXQpID0+IHByZXNldC5pZCA9PT0gaWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyR2FtZVNldHVwUHJlc2V0cyhcbiAgcHJlc2V0czogR2FtZVNldHVwUHJlc2V0W10sXG4gIGNhdGVnb3J5OiBHYW1lU2V0dXBDYXRlZ29yeSxcbiAgcXVlcnk6IHN0cmluZyxcbik6IEdhbWVTZXR1cFByZXNldFtdIHtcbiAgaWYgKGNhdGVnb3J5ID09PSAnY3VzdG9tLWZlbicgfHwgY2F0ZWdvcnkgPT09ICdjdXN0b20tcGduJykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0IG5vcm1hbGl6ZWRRdWVyeSA9IHF1ZXJ5LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG4gIHJldHVybiBwcmVzZXRzLmZpbHRlcigocHJlc2V0KSA9PiB7XG4gICAgaWYgKHByZXNldC5jYXRlZ29yeSAhPT0gY2F0ZWdvcnkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW5vcm1hbGl6ZWRRdWVyeSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgaGF5c3RhY2sgPSBbXG4gICAgICBwcmVzZXQubmFtZSxcbiAgICAgIHByZXNldC5kZXNjcmlwdGlvbixcbiAgICAgIHByZXNldC5zaWRlLFxuICAgICAgcHJlc2V0LmRpZmZpY3VsdHksXG4gICAgICAuLi5wcmVzZXQudGFncyxcbiAgICBdLmpvaW4oJyAnKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgcmV0dXJuIGhheXN0YWNrLmluY2x1ZGVzKG5vcm1hbGl6ZWRRdWVyeSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzY3JpYmVHYW1lU2V0dXBQcmVzZXQocHJlc2V0OiBHYW1lU2V0dXBQcmVzZXQpOiBzdHJpbmcge1xuICBjb25zdCBzaWRlTGFiZWwgPSBwcmVzZXQuc2lkZSA9PT0gJ3doaXRlJyA/ICdXaGl0ZScgOiAnQmxhY2snO1xuICByZXR1cm4gYCR7cHJlc2V0Lm5hbWV9IFx1MjAyMiAke3NpZGVMYWJlbH0gXHUyMDIyICR7cHJlc2V0LmRpZmZpY3VsdHl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvQ29tcGF0aWJsZU9wZW5pbmdQcmVzZXQoaWQ6IHN0cmluZyk6IEdhbWVTZXR1cFByZXNldCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IG9wZW5pbmcgPSBnZXRPcGVuaW5nQnlJZChpZCk7XG4gIGlmICghb3BlbmluZykge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gT1BFTklOR19QUkVTRVRTLmZpbmQoKHByZXNldCkgPT4gcHJlc2V0LmlkID09PSBvcGVuaW5nLmlkKTtcbn1cbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgZmlsdGVyR2FtZVNldHVwUHJlc2V0cyxcbiAgR0FNRV9TRVRVUF9QUkVTRVRTLFxuICBHYW1lU2V0dXBDYXRlZ29yeSxcbiAgR0FNRV9TRVRVUF9DQVRFR09SWV9PUFRJT05TLFxuICBHYW1lU2V0dXBQcmVzZXQsXG4gIGdldEdhbWVTZXR1cFByZXNldEJ5SWQsXG59IGZyb20gJy4uL2VuZ2luZS9nYW1lU2V0dXBQcmVzZXRzJztcbmltcG9ydCB7IGJvYXJkVmlld01vZGVsLCBCb2FyZFZpZXdNb2RlbCB9IGZyb20gJy4vQm9hcmRWaWV3TW9kZWwnO1xuXG5pbnRlcmZhY2UgR2FtZVNldHVwVmlld01vZGVsRGVwZW5kZW5jaWVzIHtcbiAgYm9hcmRWaWV3TW9kZWw6IFBpY2s8Qm9hcmRWaWV3TW9kZWwsICdsb2FkRmVuJyB8ICdsb2FkUGduJyB8ICdsb2FkR2FtZVNldHVwUHJlc2V0JyB8ICdzdGF0dXNNZXNzYWdlJz47XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lU2V0dXBWaWV3TW9kZWwge1xuICBvcGVuID0gZmFsc2U7XG4gIHNlbGVjdGVkQ2F0ZWdvcnk6IEdhbWVTZXR1cENhdGVnb3J5ID0gJ29wZW5pbmdzJztcbiAgc2VhcmNoUXVlcnkgPSAnJztcbiAgc2VsZWN0ZWRQcmVzZXRJZDogc3RyaW5nIHwgbnVsbCA9IEdBTUVfU0VUVVBfUFJFU0VUU1swXT8uaWQgPz8gbnVsbDtcbiAgY3VzdG9tRmVuSW5wdXQgPSAnJztcbiAgY3VzdG9tUGduSW5wdXQgPSAnJztcblxuICBwcml2YXRlIHJlYWRvbmx5IGRlcHM6IEdhbWVTZXR1cFZpZXdNb2RlbERlcGVuZGVuY2llcztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZXBzOiBHYW1lU2V0dXBWaWV3TW9kZWxEZXBlbmRlbmNpZXMgPSB7XG4gICAgICBib2FyZFZpZXdNb2RlbCxcbiAgICB9LFxuICApIHtcbiAgICB0aGlzLmRlcHMgPSBkZXBzO1xuXG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldE9wZW46IGFjdGlvbixcbiAgICAgIG9wZW5BdENhdGVnb3J5OiBhY3Rpb24sXG4gICAgICBzZXRTZWxlY3RlZENhdGVnb3J5OiBhY3Rpb24sXG4gICAgICBzZXRTZWFyY2hRdWVyeTogYWN0aW9uLFxuICAgICAgc2V0U2VsZWN0ZWRQcmVzZXRJZDogYWN0aW9uLFxuICAgICAgc2V0Q3VzdG9tRmVuSW5wdXQ6IGFjdGlvbixcbiAgICAgIHNldEN1c3RvbVBnbklucHV0OiBhY3Rpb24sXG4gICAgICBsb2FkU2VsZWN0ZWRQcmVzZXQ6IGFjdGlvbixcbiAgICAgIGxvYWRDdXN0b21GZW46IGFjdGlvbixcbiAgICAgIGxvYWRDdXN0b21QZ246IGFjdGlvbixcbiAgICAgIHN5bmNTZWxlY3Rpb25Gcm9tQ2F0ZWdvcnk6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMuc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeSgpO1xuICB9XG5cbiAgc2V0T3BlbihvcGVuOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5vcGVuID0gb3BlbjtcbiAgfVxuXG4gIG9wZW5BdENhdGVnb3J5KGNhdGVnb3J5OiBHYW1lU2V0dXBDYXRlZ29yeSk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRDYXRlZ29yeSA9IGNhdGVnb3J5O1xuICAgIHRoaXMuc2VhcmNoUXVlcnkgPSAnJztcbiAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgIHRoaXMuc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeSgpO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRDYXRlZ29yeShjYXRlZ29yeTogR2FtZVNldHVwQ2F0ZWdvcnkpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkQ2F0ZWdvcnkgPSBjYXRlZ29yeTtcbiAgICB0aGlzLnNlYXJjaFF1ZXJ5ID0gJyc7XG4gICAgdGhpcy5zeW5jU2VsZWN0aW9uRnJvbUNhdGVnb3J5KCk7XG4gIH1cblxuICBzZXRTZWFyY2hRdWVyeSh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zZWFyY2hRdWVyeSA9IHZhbHVlO1xuICAgIHRoaXMuc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeSgpO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRQcmVzZXRJZChpZDogc3RyaW5nIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCA9IGlkO1xuICB9XG5cbiAgc2V0Q3VzdG9tRmVuSW5wdXQodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY3VzdG9tRmVuSW5wdXQgPSB2YWx1ZTtcbiAgfVxuXG4gIHNldEN1c3RvbVBnbklucHV0KHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbVBnbklucHV0ID0gdmFsdWU7XG4gIH1cblxuICBsb2FkU2VsZWN0ZWRQcmVzZXQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJlc2V0ID0gdGhpcy5zZWxlY3RlZFByZXNldDtcbiAgICBpZiAoIXByZXNldCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGxvYWRlZCA9IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5sb2FkR2FtZVNldHVwUHJlc2V0KHByZXNldCk7XG4gICAgaWYgKGxvYWRlZCkge1xuICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBsb2FkZWQ7XG4gIH1cblxuICBsb2FkQ3VzdG9tRmVuKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5jdXN0b21GZW5JbnB1dC50cmltKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2FkZWQgPSB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwubG9hZEZlbih0aGlzLmN1c3RvbUZlbklucHV0LnRyaW0oKSk7XG4gICAgaWYgKGxvYWRlZCkge1xuICAgICAgdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLnN0YXR1c01lc3NhZ2UgPSAnQ3VzdG9tIEZFTiBsb2FkZWQnO1xuICAgICAgdGhpcy5jdXN0b21GZW5JbnB1dCA9ICcnO1xuICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBsb2FkZWQ7XG4gIH1cblxuICBsb2FkQ3VzdG9tUGduKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5jdXN0b21QZ25JbnB1dC50cmltKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2FkZWQgPSB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwubG9hZFBnbih0aGlzLmN1c3RvbVBnbklucHV0LnRyaW0oKSk7XG4gICAgaWYgKGxvYWRlZCkge1xuICAgICAgdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLnN0YXR1c01lc3NhZ2UgPSAnQ3VzdG9tIFBHTiBsb2FkZWQnO1xuICAgICAgdGhpcy5jdXN0b21QZ25JbnB1dCA9ICcnO1xuICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBsb2FkZWQ7XG4gIH1cblxuICBzeW5jU2VsZWN0aW9uRnJvbUNhdGVnb3J5KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNlbGVjdGVkQ2F0ZWdvcnkgPT09ICdjdXN0b20tZmVuJyB8fCB0aGlzLnNlbGVjdGVkQ2F0ZWdvcnkgPT09ICdjdXN0b20tcGduJykge1xuICAgICAgdGhpcy5zZWxlY3RlZFByZXNldElkID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB2aXNpYmxlUHJlc2V0SWRzID0gdGhpcy5maWx0ZXJlZFByZXNldHMubWFwKChwcmVzZXQpID0+IHByZXNldC5pZCk7XG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCAmJiB2aXNpYmxlUHJlc2V0SWRzLmluY2x1ZGVzKHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdGVkUHJlc2V0SWQgPSB2aXNpYmxlUHJlc2V0SWRzWzBdID8/IG51bGw7XG4gIH1cblxuICBnZXQgY2F0ZWdvcmllcygpIHtcbiAgICByZXR1cm4gR0FNRV9TRVRVUF9DQVRFR09SWV9PUFRJT05TO1xuICB9XG5cbiAgZ2V0IGZpbHRlcmVkUHJlc2V0cygpOiBHYW1lU2V0dXBQcmVzZXRbXSB7XG4gICAgcmV0dXJuIGZpbHRlckdhbWVTZXR1cFByZXNldHMoR0FNRV9TRVRVUF9QUkVTRVRTLCB0aGlzLnNlbGVjdGVkQ2F0ZWdvcnksIHRoaXMuc2VhcmNoUXVlcnkpO1xuICB9XG5cbiAgZ2V0IHNlbGVjdGVkUHJlc2V0KCk6IEdhbWVTZXR1cFByZXNldCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGVkUHJlc2V0SWQgPyBnZXRHYW1lU2V0dXBQcmVzZXRCeUlkKHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCkgPz8gbnVsbCA6IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGdhbWVTZXR1cFZpZXdNb2RlbCA9IG5ldyBHYW1lU2V0dXBWaWV3TW9kZWwoKTtcbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgaXNEZWJ1Z0xvZ2dpbmdFbmFibGVkLFxuICBpc0RldmVsb3BtZW50QnVpbGQsXG4gIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQsXG59IGZyb20gJy4uL3NoYXJlZC9kZWJ1Zyc7XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z1ZpZXdNb2RlbCB7XG4gIGRlYnVnTG9nZ2luZ0VuYWJsZWQgPSBpc0RlYnVnTG9nZ2luZ0VuYWJsZWQoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0RGVidWdMb2dnaW5nRW5hYmxlZDogYWN0aW9uLFxuICAgICAgdG9nZ2xlRGVidWdMb2dnaW5nOiBhY3Rpb24sXG4gICAgfSk7XG4gIH1cblxuICBzZXREZWJ1Z0xvZ2dpbmdFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRlYnVnTG9nZ2luZ0VuYWJsZWQgPSBlbmFibGVkO1xuICAgIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQoZW5hYmxlZCk7XG4gIH1cblxuICB0b2dnbGVEZWJ1Z0xvZ2dpbmcoKTogdm9pZCB7XG4gICAgdGhpcy5zZXREZWJ1Z0xvZ2dpbmdFbmFibGVkKCF0aGlzLmRlYnVnTG9nZ2luZ0VuYWJsZWQpO1xuICB9XG5cbiAgZ2V0IGlzRGV2ZWxvcG1lbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRGV2ZWxvcG1lbnRCdWlsZCgpO1xuICB9XG5cbiAgZ2V0IHNob3dEZWJ1Z0NvbnRyb2xzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzRGV2ZWxvcG1lbnQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGRlYnVnVmlld01vZGVsID0gbmV3IERlYnVnVmlld01vZGVsKCk7XG5cbiIsICJpbXBvcnQge1xuICBCcmlsbGlhbnRBbGxvd2VkUGhhc2UsXG4gIEJyaWxsaWFudE1vdmVzUGVyR2FtZSxcbiAgRmVhdHVyZU9wdGlvbnMsXG4gIG1lcmdlRmVhdHVyZU9wdGlvbnMsXG59IGZyb20gJy4vZmVhdHVyZU9wdGlvbnMnO1xuaW1wb3J0IHtcbiAgQnVja2V0Q29uZmlnLFxuICBERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gIE1vdmVRdWFsaXR5UHJlc2V0SWQsXG4gIE1PVkVfUVVBTElUWV9QUkVTRVRTLFxufSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IHR5cGUgUGVyc29uYVByb2ZpbGVUaGVtZU1vZGUgPSAnZGFyaycgfCAnbGlnaHQnIHwgJ21pbmltYWwnIHwgJ3BlcnNvbmEnO1xuXG5leHBvcnQgY29uc3QgUEVSU09OQV9QUk9GSUxFX0tJTkQgPSAncGVyc29uYWNoZXNzLnBlcnNvbmEtcHJvZmlsZSc7XG5leHBvcnQgY29uc3QgUEVSU09OQV9QUk9GSUxFX1ZFUlNJT04gPSAxO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCB7XG4gIGJ1Y2tldENvbmZpZzogQnVja2V0Q29uZmlnO1xuICBjdXJyZW50UHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsO1xuICBkZXB0aDogbnVtYmVyO1xuICBtdWx0aVBWOiBudW1iZXI7XG4gIGZlYXR1cmVPcHRpb25zOiBGZWF0dXJlT3B0aW9ucztcbiAgYnJpbGxpYW50OiB7XG4gICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWU7XG4gICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiBCcmlsbGlhbnRBbGxvd2VkUGhhc2U7XG4gIH07XG4gIHVpOiB7XG4gICAgdGhlbWVNb2RlOiBQZXJzb25hUHJvZmlsZVRoZW1lTW9kZTtcbiAgICBiYXNpY01vZGU6IGJvb2xlYW47XG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc29uYVByb2ZpbGVFeHBvcnQge1xuICBraW5kOiB0eXBlb2YgUEVSU09OQV9QUk9GSUxFX0tJTkQ7XG4gIHZlcnNpb246IHR5cGVvZiBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTjtcbiAgbmFtZTogc3RyaW5nO1xuICBzZXR0aW5nczogUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNhdmVkUGVyc29uYVByb2ZpbGUgZXh0ZW5kcyBQZXJzb25hUHJvZmlsZUV4cG9ydCB7XG4gIGlkOiBzdHJpbmc7XG4gIGNyZWF0ZWRBdDogc3RyaW5nO1xuICB1cGRhdGVkQXQ6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQZXJzb25hUHJvZmlsZVN0b3JlU25hcHNob3Qge1xuICBwcm9maWxlczogU2F2ZWRQZXJzb25hUHJvZmlsZVtdO1xuICBzZWxlY3RlZFByb2ZpbGVJZDogc3RyaW5nIHwgbnVsbDtcbn1cblxuY29uc3QgVkFMSURfUFJFU0VUX0lEUyA9IG5ldyBTZXQ8TW92ZVF1YWxpdHlQcmVzZXRJZD4oTU9WRV9RVUFMSVRZX1BSRVNFVFMubWFwKChwcmVzZXQpID0+IHByZXNldC5pZCkpO1xuY29uc3QgVkFMSURfVEhFTUVfTU9ERVMgPSBuZXcgU2V0PFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlPihbJ2RhcmsnLCAnbGlnaHQnLCAnbWluaW1hbCcsICdwZXJzb25hJ10pO1xuY29uc3QgVkFMSURfQlJJTExJQU5UX1BIQVNFUyA9IG5ldyBTZXQ8QnJpbGxpYW50QWxsb3dlZFBoYXNlPihbJ29wZW5pbmcnLCAnbWlkZGxlZ2FtZScsICdlbmRnYW1lJywgJ2FueSddKTtcbmNvbnN0IFZBTElEX0JSSUxMSUFOVF9CVURHRVRTID0gbmV3IFNldDxCcmlsbGlhbnRNb3Zlc1BlckdhbWU+KFswLCAxLCAyLCAzLCA0XSk7XG5cbmZ1bmN0aW9uIGlzUmVjb3JkKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gY2xhbXBJbnRlZ2VyKHZhbHVlOiB1bmtub3duLCBtaW5pbXVtOiBudW1iZXIsIG1heGltdW06IG51bWJlciwgZmFsbGJhY2s6IG51bWJlcik6IG51bWJlciB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbGxiYWNrO1xuICB9XG5cbiAgcmV0dXJuIE1hdGgubWF4KG1pbmltdW0sIE1hdGgubWluKG1heGltdW0sIE1hdGgucm91bmQodmFsdWUpKSk7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplQnVja2V0Q29uZmlnKHZhbHVlOiB1bmtub3duKTogQnVja2V0Q29uZmlnIHtcbiAgaWYgKCFpc1JlY29yZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYmVzdDogY2xhbXBJbnRlZ2VyKHZhbHVlLmJlc3QsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmJlc3QpLFxuICAgIGdyZWF0OiBjbGFtcEludGVnZXIodmFsdWUuZ3JlYXQsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmdyZWF0KSxcbiAgICBleGNlbGxlbnQ6IGNsYW1wSW50ZWdlcih2YWx1ZS5leGNlbGxlbnQsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmV4Y2VsbGVudCksXG4gICAgZ29vZDogY2xhbXBJbnRlZ2VyKHZhbHVlLmdvb2QsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmdvb2QpLFxuICAgIGluYWNjdXJhY3k6IGNsYW1wSW50ZWdlcih2YWx1ZS5pbmFjY3VyYWN5LCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5pbmFjY3VyYWN5KSxcbiAgICBtaXN0YWtlOiBjbGFtcEludGVnZXIodmFsdWUubWlzdGFrZSwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcubWlzdGFrZSksXG4gICAgYmx1bmRlcjogY2xhbXBJbnRlZ2VyKHZhbHVlLmJsdW5kZXIsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmJsdW5kZXIpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZVByZXNldElkKHZhbHVlOiB1bmtub3duKTogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGwge1xuICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIFZBTElEX1BSRVNFVF9JRFMuaGFzKHZhbHVlIGFzIE1vdmVRdWFsaXR5UHJlc2V0SWQpXG4gICAgPyAodmFsdWUgYXMgTW92ZVF1YWxpdHlQcmVzZXRJZClcbiAgICA6ICdtZWRpdW0nO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZVRoZW1lTW9kZSh2YWx1ZTogdW5rbm93bik6IFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgVkFMSURfVEhFTUVfTU9ERVMuaGFzKHZhbHVlIGFzIFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlKVxuICAgID8gKHZhbHVlIGFzIFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlKVxuICAgIDogJ2RhcmsnO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZUJyaWxsaWFudE1vdmVzUGVyR2FtZSh2YWx1ZTogdW5rbm93bik6IEJyaWxsaWFudE1vdmVzUGVyR2FtZSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIFZBTElEX0JSSUxMSUFOVF9CVURHRVRTLmhhcyh2YWx1ZSBhcyBCcmlsbGlhbnRNb3Zlc1BlckdhbWUpXG4gICAgPyAodmFsdWUgYXMgQnJpbGxpYW50TW92ZXNQZXJHYW1lKVxuICAgIDogMDtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVCcmlsbGlhbnRBbGxvd2VkUGhhc2UodmFsdWU6IHVua25vd24pOiBCcmlsbGlhbnRBbGxvd2VkUGhhc2Uge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBWQUxJRF9CUklMTElBTlRfUEhBU0VTLmhhcyh2YWx1ZSBhcyBCcmlsbGlhbnRBbGxvd2VkUGhhc2UpXG4gICAgPyAodmFsdWUgYXMgQnJpbGxpYW50QWxsb3dlZFBoYXNlKVxuICAgIDogJ2FueSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCh2YWx1ZTogdW5rbm93bik6IFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCB7XG4gIGNvbnN0IHJlY29yZCA9IGlzUmVjb3JkKHZhbHVlKSA/IHZhbHVlIDoge307XG4gIGNvbnN0IGJyaWxsaWFudCA9IGlzUmVjb3JkKHJlY29yZC5icmlsbGlhbnQpID8gcmVjb3JkLmJyaWxsaWFudCA6IHt9O1xuICBjb25zdCB1aSA9IGlzUmVjb3JkKHJlY29yZC51aSkgPyByZWNvcmQudWkgOiB7fTtcblxuICByZXR1cm4ge1xuICAgIGJ1Y2tldENvbmZpZzogc2FuaXRpemVCdWNrZXRDb25maWcocmVjb3JkLmJ1Y2tldENvbmZpZyksXG4gICAgY3VycmVudFByZXNldElkOiBzYW5pdGl6ZVByZXNldElkKHJlY29yZC5jdXJyZW50UHJlc2V0SWQpLFxuICAgIGRlcHRoOiBjbGFtcEludGVnZXIocmVjb3JkLmRlcHRoLCAxLCAzMCwgOCksXG4gICAgbXVsdGlQVjogY2xhbXBJbnRlZ2VyKHJlY29yZC5tdWx0aVBWLCAxLCAyMCwgMTIpLFxuICAgIGZlYXR1cmVPcHRpb25zOiBtZXJnZUZlYXR1cmVPcHRpb25zKGlzUmVjb3JkKHJlY29yZC5mZWF0dXJlT3B0aW9ucykgPyAocmVjb3JkLmZlYXR1cmVPcHRpb25zIGFzIFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+KSA6IHVuZGVmaW5lZCksXG4gICAgYnJpbGxpYW50OiB7XG4gICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IHNhbml0aXplQnJpbGxpYW50TW92ZXNQZXJHYW1lKGJyaWxsaWFudC5icmlsbGlhbnRNb3Zlc1BlckdhbWUpLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiBzYW5pdGl6ZUJyaWxsaWFudEFsbG93ZWRQaGFzZShicmlsbGlhbnQuYnJpbGxpYW50QWxsb3dlZFBoYXNlKSxcbiAgICB9LFxuICAgIHVpOiB7XG4gICAgICB0aGVtZU1vZGU6IHNhbml0aXplVGhlbWVNb2RlKHVpLnRoZW1lTW9kZSksXG4gICAgICBiYXNpY01vZGU6IHR5cGVvZiB1aS5iYXNpY01vZGUgPT09ICdib29sZWFuJyA/IHVpLmJhc2ljTW9kZSA6IHRydWUsXG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplUGVyc29uYVByb2ZpbGVFeHBvcnQoXG4gIHZhbHVlOiB1bmtub3duLFxuICBmYWxsYmFja05hbWUgPSAnSW1wb3J0ZWQgUHJvZmlsZScsXG4pOiBQZXJzb25hUHJvZmlsZUV4cG9ydCB8IG51bGwge1xuICBpZiAoIWlzUmVjb3JkKHZhbHVlKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKHZhbHVlLmtpbmQgIT09IFBFUlNPTkFfUFJPRklMRV9LSU5EIHx8IHZhbHVlLnZlcnNpb24gIT09IFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBuYW1lID0gdHlwZW9mIHZhbHVlLm5hbWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLm5hbWUudHJpbSgpID8gdmFsdWUubmFtZS50cmltKCkgOiBmYWxsYmFja05hbWU7XG5cbiAgcmV0dXJuIHtcbiAgICBraW5kOiBQRVJTT05BX1BST0ZJTEVfS0lORCxcbiAgICB2ZXJzaW9uOiBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTixcbiAgICBuYW1lLFxuICAgIHNldHRpbmdzOiBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCh2YWx1ZS5zZXR0aW5ncyksXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBlcnNvbmFQcm9maWxlSW1wb3J0KFxuICBqc29uOiBzdHJpbmcsXG4pOiB7IG9rOiB0cnVlOyBwcm9maWxlOiBQZXJzb25hUHJvZmlsZUV4cG9ydCB9IHwgeyBvazogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGlmICghanNvbi50cmltKCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdJbXBvcnQgSlNPTiBpcyBlbXB0eS4nLFxuICAgIH07XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvbikgYXMgdW5rbm93bjtcbiAgICBjb25zdCBwcm9maWxlID0gc2FuaXRpemVQZXJzb25hUHJvZmlsZUV4cG9ydChwYXJzZWQpO1xuXG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvazogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnSW1wb3J0ZWQgSlNPTiBkb2VzIG5vdCBtYXRjaCB0aGUgUGVyc29uYUNoZXNzIHByb2ZpbGUgc2NoZW1hLicsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBwcm9maWxlIH07XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB7XG4gICAgICBvazogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ltcG9ydGVkIEpTT04gY291bGQgbm90IGJlIHBhcnNlZC4nLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKHByb2ZpbGU6IFBlcnNvbmFQcm9maWxlRXhwb3J0KTogc3RyaW5nIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHByb2ZpbGUsIG51bGwsIDIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2F2ZWRQZXJzb25hUHJvZmlsZShcbiAgcHJvZmlsZTogUGVyc29uYVByb2ZpbGVFeHBvcnQsXG4gIGlkOiBzdHJpbmcsXG4gIG5vd0lzbzogc3RyaW5nLFxuKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB7XG4gIHJldHVybiB7XG4gICAgLi4ucHJvZmlsZSxcbiAgICBpZCxcbiAgICBjcmVhdGVkQXQ6IG5vd0lzbyxcbiAgICB1cGRhdGVkQXQ6IG5vd0lzbyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNhdmVkUGVyc29uYVByb2ZpbGUoXG4gIHByb2ZpbGU6IFNhdmVkUGVyc29uYVByb2ZpbGUsXG4gIG5leHQ6IFBlcnNvbmFQcm9maWxlRXhwb3J0LFxuICBub3dJc286IHN0cmluZyxcbik6IFNhdmVkUGVyc29uYVByb2ZpbGUge1xuICByZXR1cm4ge1xuICAgIC4uLnByb2ZpbGUsXG4gICAgLi4ubmV4dCxcbiAgICBpZDogcHJvZmlsZS5pZCxcbiAgICBjcmVhdGVkQXQ6IHByb2ZpbGUuY3JlYXRlZEF0LFxuICAgIHVwZGF0ZWRBdDogbm93SXNvLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHVwbGljYXRlUGVyc29uYVByb2ZpbGUoXG4gIHByb2ZpbGU6IFNhdmVkUGVyc29uYVByb2ZpbGUsXG4gIGlkOiBzdHJpbmcsXG4gIG5hbWU6IHN0cmluZyxcbiAgbm93SXNvOiBzdHJpbmcsXG4pOiBTYXZlZFBlcnNvbmFQcm9maWxlIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5wcm9maWxlLFxuICAgIGlkLFxuICAgIG5hbWUsXG4gICAgY3JlYXRlZEF0OiBub3dJc28sXG4gICAgdXBkYXRlZEF0OiBub3dJc28sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVNhdmVkUGVyc29uYVByb2ZpbGUodmFsdWU6IHVua25vd24pOiBTYXZlZFBlcnNvbmFQcm9maWxlIHwgbnVsbCB7XG4gIGlmICghaXNSZWNvcmQodmFsdWUpIHx8IHR5cGVvZiB2YWx1ZS5pZCAhPT0gJ3N0cmluZycgfHwgIXZhbHVlLmlkLnRyaW0oKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgZXhwb3J0ZWQgPSBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlRXhwb3J0KHZhbHVlKTtcbiAgaWYgKCFleHBvcnRlZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY3JlYXRlZEF0ID0gdHlwZW9mIHZhbHVlLmNyZWF0ZWRBdCA9PT0gJ3N0cmluZycgJiYgdmFsdWUuY3JlYXRlZEF0LnRyaW0oKVxuICAgID8gdmFsdWUuY3JlYXRlZEF0XG4gICAgOiBuZXcgRGF0ZSgwKS50b0lTT1N0cmluZygpO1xuICBjb25zdCB1cGRhdGVkQXQgPSB0eXBlb2YgdmFsdWUudXBkYXRlZEF0ID09PSAnc3RyaW5nJyAmJiB2YWx1ZS51cGRhdGVkQXQudHJpbSgpXG4gICAgPyB2YWx1ZS51cGRhdGVkQXRcbiAgICA6IGNyZWF0ZWRBdDtcblxuICByZXR1cm4ge1xuICAgIC4uLmV4cG9ydGVkLFxuICAgIGlkOiB2YWx1ZS5pZCxcbiAgICBjcmVhdGVkQXQsXG4gICAgdXBkYXRlZEF0LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVQZXJzb25hUHJvZmlsZVN0b3JlU25hcHNob3QodmFsdWU6IHVua25vd24pOiBQZXJzb25hUHJvZmlsZVN0b3JlU25hcHNob3Qge1xuICBpZiAoIWlzUmVjb3JkKHZhbHVlKSkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9maWxlczogW10sXG4gICAgICBzZWxlY3RlZFByb2ZpbGVJZDogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgcHJvZmlsZXMgPSBBcnJheS5pc0FycmF5KHZhbHVlLnByb2ZpbGVzKVxuICAgID8gdmFsdWUucHJvZmlsZXNcbiAgICAgIC5tYXAoKGVudHJ5KSA9PiBzYW5pdGl6ZVNhdmVkUGVyc29uYVByb2ZpbGUoZW50cnkpKVxuICAgICAgLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyBTYXZlZFBlcnNvbmFQcm9maWxlID0+IGVudHJ5ICE9PSBudWxsKVxuICAgIDogW107XG4gIGNvbnN0IHNlbGVjdGVkUHJvZmlsZUlkID0gdHlwZW9mIHZhbHVlLnNlbGVjdGVkUHJvZmlsZUlkID09PSAnc3RyaW5nJyA/IHZhbHVlLnNlbGVjdGVkUHJvZmlsZUlkIDogbnVsbDtcblxuICByZXR1cm4ge1xuICAgIHByb2ZpbGVzLFxuICAgIHNlbGVjdGVkUHJvZmlsZUlkOiBwcm9maWxlcy5zb21lKChwcm9maWxlKSA9PiBwcm9maWxlLmlkID09PSBzZWxlY3RlZFByb2ZpbGVJZCkgPyBzZWxlY3RlZFByb2ZpbGVJZCA6IG51bGwsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFBlcnNvbmFQcm9maWxlRXhwb3J0RmlsZW5hbWUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qgc2x1ZyA9IG5hbWVcbiAgICAudHJpbSgpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tK3wtKyQvZywgJycpIHx8ICdwZXJzb25hLXByb2ZpbGUnO1xuXG4gIHJldHVybiBgcGVyc29uYWNoZXNzLSR7c2x1Z30uanNvbmA7XG59XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIGJ1aWxkUGVyc29uYVByb2ZpbGVFeHBvcnRGaWxlbmFtZSxcbiAgY3JlYXRlU2F2ZWRQZXJzb25hUHJvZmlsZSxcbiAgZHVwbGljYXRlUGVyc29uYVByb2ZpbGUsXG4gIHBhcnNlUGVyc29uYVByb2ZpbGVJbXBvcnQsXG4gIFBFUlNPTkFfUFJPRklMRV9LSU5ELFxuICBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTixcbiAgUGVyc29uYVByb2ZpbGVFeHBvcnQsXG4gIFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCxcbiAgc2FuaXRpemVQZXJzb25hUHJvZmlsZVN0b3JlU25hcHNob3QsXG4gIFNhdmVkUGVyc29uYVByb2ZpbGUsXG4gIHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlLFxuICB1cGRhdGVTYXZlZFBlcnNvbmFQcm9maWxlLFxufSBmcm9tICcuLi9lbmdpbmUvcGVyc29uYVByb2ZpbGVzJztcbmltcG9ydCB7IGNvbmZpZ1ZpZXdNb2RlbCwgQ29uZmlnVmlld01vZGVsIH0gZnJvbSAnLi9Db25maWdWaWV3TW9kZWwnO1xuaW1wb3J0IHsgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwsIEZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gZnJvbSAnLi9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCc7XG5pbXBvcnQgeyB1aVN0YXRlVmlld01vZGVsLCBVaVN0YXRlVmlld01vZGVsIH0gZnJvbSAnLi9VaVN0YXRlVmlld01vZGVsJztcblxuY29uc3QgUEVSU09OQV9QUk9GSUxFU19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfcGVyc29uYV9wcm9maWxlcyc7XG5cbmludGVyZmFjZSBQZXJzb25hUHJvZmlsZXNEZXBlbmRlbmNpZXMge1xuICBjb25maWdWaWV3TW9kZWw6IFBpY2s8Q29uZmlnVmlld01vZGVsLCAnYnVja2V0Q29uZmlnJyB8ICdjdXJyZW50UHJlc2V0SWQnIHwgJ2RlcHRoJyB8ICdtdWx0aVBWJyB8ICdhcHBseVByb2ZpbGVTbmFwc2hvdCc+O1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbDogUGljazxcbiAgICBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCxcbiAgICB8ICdvcHRpb25zJ1xuICAgIHwgJ2JyaWxsaWFudE1vdmVzUGVyR2FtZSdcbiAgICB8ICdicmlsbGlhbnRBbGxvd2VkUGhhc2UnXG4gICAgfCAnYXBwbHlQcm9maWxlU2V0dGluZ3MnXG4gID47XG4gIHVpU3RhdGVWaWV3TW9kZWw6IFBpY2s8XG4gICAgVWlTdGF0ZVZpZXdNb2RlbCxcbiAgICB8ICd0aGVtZU1vZGUnXG4gICAgfCAnYmFzaWNNb2RlJ1xuICAgIHwgJ2FwcGx5UHJvZmlsZVByZWZlcmVuY2VzJ1xuICA+O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm9maWxlSWQoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBwcm9maWxlXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgOCl9YDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGltZXN0YW1wKCk6IHN0cmluZyB7XG4gIHJldHVybiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwge1xuICBwcm9maWxlczogU2F2ZWRQZXJzb25hUHJvZmlsZVtdID0gW107XG4gIHNlbGVjdGVkUHJvZmlsZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgcHJvZmlsZU5hbWVEcmFmdCA9ICcnO1xuICBleGNoYW5nZUpzb24gPSAnJztcbiAgbGFzdEFjdGlvbk1lc3NhZ2UgPSAnJztcbiAgaW1wb3J0RXJyb3IgPSAnJztcblxuICBwcml2YXRlIHJlYWRvbmx5IGRlcHM6IFBlcnNvbmFQcm9maWxlc0RlcGVuZGVuY2llcztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZXBzOiBQZXJzb25hUHJvZmlsZXNEZXBlbmRlbmNpZXMgPSB7XG4gICAgICBjb25maWdWaWV3TW9kZWwsXG4gICAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCxcbiAgICAgIHVpU3RhdGVWaWV3TW9kZWwsXG4gICAgfSxcbiAgKSB7XG4gICAgdGhpcy5kZXBzID0gZGVwcztcblxuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXRTZWxlY3RlZFByb2ZpbGVJZDogYWN0aW9uLFxuICAgICAgc2V0UHJvZmlsZU5hbWVEcmFmdDogYWN0aW9uLFxuICAgICAgc2V0RXhjaGFuZ2VKc29uOiBhY3Rpb24sXG4gICAgICBjbGVhckV4Y2hhbmdlU3RhdGU6IGFjdGlvbixcbiAgICAgIHNhdmVDdXJyZW50UHJvZmlsZTogYWN0aW9uLFxuICAgICAgbG9hZFNlbGVjdGVkUHJvZmlsZTogYWN0aW9uLFxuICAgICAgZHVwbGljYXRlU2VsZWN0ZWRQcm9maWxlOiBhY3Rpb24sXG4gICAgICByZW5hbWVTZWxlY3RlZFByb2ZpbGU6IGFjdGlvbixcbiAgICAgIGRlbGV0ZVNlbGVjdGVkUHJvZmlsZTogYWN0aW9uLFxuICAgICAgaW1wb3J0UHJvZmlsZUZyb21Kc29uOiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc3RvcmVGcm9tU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRQcm9maWxlSWQoaWQ6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gaWQ7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU/Lm5hbWUgPz8gJyc7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9ICcnO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgfVxuXG4gIHNldFByb2ZpbGVOYW1lRHJhZnQodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHZhbHVlO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSAnJztcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gIH1cblxuICBzZXRFeGNoYW5nZUpzb24odmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gdmFsdWU7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9ICcnO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgfVxuXG4gIGNsZWFyRXhjaGFuZ2VTdGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9ICcnO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSAnJztcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gIH1cblxuICBzYXZlQ3VycmVudFByb2ZpbGUobmFtZSA9IHRoaXMucHJvZmlsZU5hbWVEcmFmdCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHRyaW1tZWROYW1lID0gbmFtZS50cmltKCk7XG4gICAgaWYgKCF0cmltbWVkTmFtZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdFbnRlciBhIHByb2ZpbGUgbmFtZSBiZWZvcmUgc2F2aW5nLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgc25hcHNob3QgPSB0aGlzLmJ1aWxkQ3VycmVudFNuYXBzaG90KCk7XG4gICAgY29uc3QgZXhwb3J0ZWQgPSB0aGlzLmNyZWF0ZUV4cG9ydCh0cmltbWVkTmFtZSwgc25hcHNob3QpO1xuICAgIGNvbnN0IG5vd0lzbyA9IGNyZWF0ZVRpbWVzdGFtcCgpO1xuICAgIGNvbnN0IGV4aXN0aW5nQnlTZWxlY3RlZCA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGNvbnN0IGV4aXN0aW5nQnlOYW1lID0gdGhpcy5maW5kQnlOYW1lKHRyaW1tZWROYW1lKTtcblxuICAgIGlmIChleGlzdGluZ0J5U2VsZWN0ZWQgJiYgZXhpc3RpbmdCeVNlbGVjdGVkLm5hbWUgPT09IHRyaW1tZWROYW1lKSB7XG4gICAgICB0aGlzLnByb2ZpbGVzID0gdGhpcy5wcm9maWxlcy5tYXAoKHByb2ZpbGUpID0+IChcbiAgICAgICAgcHJvZmlsZS5pZCA9PT0gZXhpc3RpbmdCeVNlbGVjdGVkLmlkXG4gICAgICAgICAgPyB1cGRhdGVTYXZlZFBlcnNvbmFQcm9maWxlKHByb2ZpbGUsIGV4cG9ydGVkLCBub3dJc28pXG4gICAgICAgICAgOiBwcm9maWxlXG4gICAgICApKTtcbiAgICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgVXBkYXRlZCBwcm9maWxlIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFELmA7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKGV4cG9ydGVkKTtcbiAgICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGV4aXN0aW5nQnlOYW1lKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gYEEgcHJvZmlsZSBuYW1lZCBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRCBhbHJlYWR5IGV4aXN0cy5gO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHNhdmVkID0gY3JlYXRlU2F2ZWRQZXJzb25hUHJvZmlsZShleHBvcnRlZCwgY3JlYXRlUHJvZmlsZUlkKCksIG5vd0lzbyk7XG4gICAgdGhpcy5wcm9maWxlcyA9IFtzYXZlZCwgLi4udGhpcy5wcm9maWxlc107XG4gICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IHNhdmVkLmlkO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHNhdmVkLm5hbWU7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZShleHBvcnRlZCk7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBTYXZlZCBwcm9maWxlIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgbG9hZFNlbGVjdGVkUHJvZmlsZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ1NlbGVjdCBhIHNhdmVkIHByb2ZpbGUgdG8gbG9hZC4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuYXBwbHlTbmFwc2hvdChwcm9maWxlLnNldHRpbmdzKTtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSBwcm9maWxlLm5hbWU7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZSh0aGlzLnRvRXhwb3J0KHByb2ZpbGUpKTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYExvYWRlZCBwcm9maWxlIFx1MjAxQyR7cHJvZmlsZS5uYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGR1cGxpY2F0ZVNlbGVjdGVkUHJvZmlsZShuYW1lID0gdGhpcy5wcm9maWxlTmFtZURyYWZ0KTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdTZWxlY3QgYSBzYXZlZCBwcm9maWxlIHRvIGR1cGxpY2F0ZS4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHRyaW1tZWROYW1lID0gbmFtZS50cmltKCkgfHwgYCR7cHJvZmlsZS5uYW1lfSBDb3B5YDtcbiAgICBpZiAodGhpcy5maW5kQnlOYW1lKHRyaW1tZWROYW1lKSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9IGBBIHByb2ZpbGUgbmFtZWQgXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQgYWxyZWFkeSBleGlzdHMuYDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBub3dJc28gPSBjcmVhdGVUaW1lc3RhbXAoKTtcbiAgICBjb25zdCBkdXBsaWNhdGUgPSBkdXBsaWNhdGVQZXJzb25hUHJvZmlsZShwcm9maWxlLCBjcmVhdGVQcm9maWxlSWQoKSwgdHJpbW1lZE5hbWUsIG5vd0lzbyk7XG4gICAgdGhpcy5wcm9maWxlcyA9IFtkdXBsaWNhdGUsIC4uLnRoaXMucHJvZmlsZXNdO1xuICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBkdXBsaWNhdGUuaWQ7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gZHVwbGljYXRlLm5hbWU7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZSh0aGlzLnRvRXhwb3J0KGR1cGxpY2F0ZSkpO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgRHVwbGljYXRlZCBwcm9maWxlIGFzIFx1MjAxQyR7ZHVwbGljYXRlLm5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVuYW1lU2VsZWN0ZWRQcm9maWxlKG5hbWUgPSB0aGlzLnByb2ZpbGVOYW1lRHJhZnQpOiBib29sZWFuIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ1NlbGVjdCBhIHNhdmVkIHByb2ZpbGUgdG8gcmVuYW1lLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgdHJpbW1lZE5hbWUgPSBuYW1lLnRyaW0oKTtcbiAgICBpZiAoIXRyaW1tZWROYW1lKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ0VudGVyIGEgcHJvZmlsZSBuYW1lIGJlZm9yZSByZW5hbWluZy4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChwcm9maWxlLm5hbWUgPT09IHRyaW1tZWROYW1lKSB7XG4gICAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gJ1Byb2ZpbGUgbmFtZSBpcyBhbHJlYWR5IHVwIHRvIGRhdGUuJztcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nQnlOYW1lID0gdGhpcy5maW5kQnlOYW1lKHRyaW1tZWROYW1lKTtcbiAgICBpZiAoZXhpc3RpbmdCeU5hbWUgJiYgZXhpc3RpbmdCeU5hbWUuaWQgIT09IHByb2ZpbGUuaWQpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSBgQSBwcm9maWxlIG5hbWVkIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFEIGFscmVhZHkgZXhpc3RzLmA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgbm93SXNvID0gY3JlYXRlVGltZXN0YW1wKCk7XG4gICAgdGhpcy5wcm9maWxlcyA9IHRoaXMucHJvZmlsZXMubWFwKChlbnRyeSkgPT4gKFxuICAgICAgZW50cnkuaWQgPT09IHByb2ZpbGUuaWRcbiAgICAgICAgPyB7IC4uLmVudHJ5LCBuYW1lOiB0cmltbWVkTmFtZSwgdXBkYXRlZEF0OiBub3dJc28gfVxuICAgICAgICA6IGVudHJ5XG4gICAgKSk7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gdHJpbW1lZE5hbWU7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBSZW5hbWVkIHByb2ZpbGUgdG8gXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBkZWxldGVTZWxlY3RlZFByb2ZpbGUoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdTZWxlY3QgYSBzYXZlZCBwcm9maWxlIHRvIGRlbGV0ZS4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMucHJvZmlsZXMgPSB0aGlzLnByb2ZpbGVzLmZpbHRlcigoZW50cnkpID0+IGVudHJ5LmlkICE9PSBwcm9maWxlLmlkKTtcbiAgICBjb25zdCBuZXh0U2VsZWN0ZWRJZCA9IHRoaXMucHJvZmlsZXNbMF0/LmlkID8/IG51bGw7XG4gICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IG5leHRTZWxlY3RlZElkO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlPy5uYW1lID8/ICcnO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gJyc7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBEZWxldGVkIHByb2ZpbGUgXHUyMDFDJHtwcm9maWxlLm5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZXhwb3J0U2VsZWN0ZWRQcm9maWxlKCk6IHsgZmlsZU5hbWU6IHN0cmluZzsganNvbjogc3RyaW5nIH0gfCBudWxsIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ1NlbGVjdCBhIHNhdmVkIHByb2ZpbGUgdG8gZXhwb3J0Lic7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBleHBvcnRlZCA9IHRoaXMudG9FeHBvcnQocHJvZmlsZSk7XG4gICAgY29uc3QganNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKGV4cG9ydGVkKTtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IGpzb247XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBFeHBvcnRlZCBwcm9maWxlIFx1MjAxQyR7cHJvZmlsZS5uYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcblxuICAgIHJldHVybiB7XG4gICAgICBmaWxlTmFtZTogYnVpbGRQZXJzb25hUHJvZmlsZUV4cG9ydEZpbGVuYW1lKHByb2ZpbGUubmFtZSksXG4gICAgICBqc29uLFxuICAgIH07XG4gIH1cblxuICBpbXBvcnRQcm9maWxlRnJvbUpzb24oanNvbiA9IHRoaXMuZXhjaGFuZ2VKc29uKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VQZXJzb25hUHJvZmlsZUltcG9ydChqc29uKTtcbiAgICBpZiAoIXBhcnNlZC5vaykge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9IHBhcnNlZC5lcnJvcjtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBpbmNvbWluZ05hbWUgPSBwYXJzZWQucHJvZmlsZS5uYW1lLnRyaW0oKTtcbiAgICBjb25zdCBmaW5hbE5hbWUgPSB0aGlzLmVuc3VyZVVuaXF1ZU5hbWUoaW5jb21pbmdOYW1lKTtcbiAgICBjb25zdCBleHBvcnRlZCA9IHtcbiAgICAgIC4uLnBhcnNlZC5wcm9maWxlLFxuICAgICAgbmFtZTogZmluYWxOYW1lLFxuICAgIH07XG4gICAgY29uc3Qgbm93SXNvID0gY3JlYXRlVGltZXN0YW1wKCk7XG4gICAgY29uc3Qgc2F2ZWQgPSBjcmVhdGVTYXZlZFBlcnNvbmFQcm9maWxlKGV4cG9ydGVkLCBjcmVhdGVQcm9maWxlSWQoKSwgbm93SXNvKTtcblxuICAgIHRoaXMucHJvZmlsZXMgPSBbc2F2ZWQsIC4uLnRoaXMucHJvZmlsZXNdO1xuICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBzYXZlZC5pZDtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSBzYXZlZC5uYW1lO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQpO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBmaW5hbE5hbWUgPT09IGluY29taW5nTmFtZVxuICAgICAgPyBgSW1wb3J0ZWQgcHJvZmlsZSBcdTIwMUMke2ZpbmFsTmFtZX1cdTIwMUQuYFxuICAgICAgOiBgSW1wb3J0ZWQgcHJvZmlsZSBhcyBcdTIwMUMke2ZpbmFsTmFtZX1cdTIwMUQgdG8gYXZvaWQgYSBkdXBsaWNhdGUgbmFtZS5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGdldCBzZWxlY3RlZFByb2ZpbGUoKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnByb2ZpbGVzLmZpbmQoKHByb2ZpbGUpID0+IHByb2ZpbGUuaWQgPT09IHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQpID8/IG51bGw7XG4gIH1cblxuICBwcml2YXRlIGJ1aWxkQ3VycmVudFNuYXBzaG90KCk6IFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJ1Y2tldENvbmZpZzogeyAuLi50aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmJ1Y2tldENvbmZpZyB9LFxuICAgICAgY3VycmVudFByZXNldElkOiB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmN1cnJlbnRQcmVzZXRJZCxcbiAgICAgIGRlcHRoOiB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmRlcHRoLFxuICAgICAgbXVsdGlQVjogdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5tdWx0aVBWLFxuICAgICAgZmVhdHVyZU9wdGlvbnM6IHsgLi4udGhpcy5kZXBzLmZlYXR1cmVPcHRpb25zVmlld01vZGVsLm9wdGlvbnMgfSxcbiAgICAgIGJyaWxsaWFudDoge1xuICAgICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IHRoaXMuZGVwcy5mZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3Zlc1BlckdhbWUsXG4gICAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogdGhpcy5kZXBzLmZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudEFsbG93ZWRQaGFzZSxcbiAgICAgIH0sXG4gICAgICB1aToge1xuICAgICAgICB0aGVtZU1vZGU6IHRoaXMuZGVwcy51aVN0YXRlVmlld01vZGVsLnRoZW1lTW9kZSxcbiAgICAgICAgYmFzaWNNb2RlOiB0aGlzLmRlcHMudWlTdGF0ZVZpZXdNb2RlbC5iYXNpY01vZGUsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGFwcGx5U25hcHNob3Qoc25hcHNob3Q6IFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCk6IHZvaWQge1xuICAgIHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuYXBwbHlQcm9maWxlU25hcHNob3Qoe1xuICAgICAgYnVja2V0Q29uZmlnOiBzbmFwc2hvdC5idWNrZXRDb25maWcsXG4gICAgICBjdXJyZW50UHJlc2V0SWQ6IHNuYXBzaG90LmN1cnJlbnRQcmVzZXRJZCxcbiAgICAgIGRlcHRoOiBzbmFwc2hvdC5kZXB0aCxcbiAgICAgIG11bHRpUFY6IHNuYXBzaG90Lm11bHRpUFYsXG4gICAgfSk7XG4gICAgdGhpcy5kZXBzLmZlYXR1cmVPcHRpb25zVmlld01vZGVsLmFwcGx5UHJvZmlsZVNldHRpbmdzKHNuYXBzaG90LmZlYXR1cmVPcHRpb25zLCBzbmFwc2hvdC5icmlsbGlhbnQpO1xuICAgIHRoaXMuZGVwcy51aVN0YXRlVmlld01vZGVsLmFwcGx5UHJvZmlsZVByZWZlcmVuY2VzKHNuYXBzaG90LnVpKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlRXhwb3J0KG5hbWU6IHN0cmluZywgc2V0dGluZ3M6IFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCk6IFBlcnNvbmFQcm9maWxlRXhwb3J0IHtcbiAgICByZXR1cm4ge1xuICAgICAga2luZDogUEVSU09OQV9QUk9GSUxFX0tJTkQsXG4gICAgICB2ZXJzaW9uOiBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTixcbiAgICAgIG5hbWUsXG4gICAgICBzZXR0aW5ncyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSB0b0V4cG9ydChwcm9maWxlOiBTYXZlZFBlcnNvbmFQcm9maWxlKTogUGVyc29uYVByb2ZpbGVFeHBvcnQge1xuICAgIHJldHVybiB7XG4gICAgICBraW5kOiBwcm9maWxlLmtpbmQsXG4gICAgICB2ZXJzaW9uOiBwcm9maWxlLnZlcnNpb24sXG4gICAgICBuYW1lOiBwcm9maWxlLm5hbWUsXG4gICAgICBzZXR0aW5nczogcHJvZmlsZS5zZXR0aW5ncyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kQnlOYW1lKG5hbWU6IHN0cmluZyk6IFNhdmVkUGVyc29uYVByb2ZpbGUgfCBudWxsIHtcbiAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IG5hbWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHRoaXMucHJvZmlsZXMuZmluZCgocHJvZmlsZSkgPT4gcHJvZmlsZS5uYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZSkgPz8gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlVW5pcXVlTmFtZShiYXNlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB0cmltbWVkQmFzZU5hbWUgPSBiYXNlTmFtZS50cmltKCkgfHwgJ0ltcG9ydGVkIFByb2ZpbGUnO1xuICAgIGlmICghdGhpcy5maW5kQnlOYW1lKHRyaW1tZWRCYXNlTmFtZSkpIHtcbiAgICAgIHJldHVybiB0cmltbWVkQmFzZU5hbWU7XG4gICAgfVxuXG4gICAgbGV0IGluZGV4ID0gMjtcbiAgICBsZXQgY2FuZGlkYXRlID0gYCR7dHJpbW1lZEJhc2VOYW1lfSAke2luZGV4fWA7XG4gICAgd2hpbGUgKHRoaXMuZmluZEJ5TmFtZShjYW5kaWRhdGUpKSB7XG4gICAgICBpbmRleCArPSAxO1xuICAgICAgY2FuZGlkYXRlID0gYCR7dHJpbW1lZEJhc2VOYW1lfSAke2luZGV4fWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFBFUlNPTkFfUFJPRklMRVNfU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKCFzYXZlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNuYXBzaG90ID0gc2FuaXRpemVQZXJzb25hUHJvZmlsZVN0b3JlU25hcHNob3QoSlNPTi5wYXJzZShzYXZlZCkgYXMgdW5rbm93bik7XG4gICAgICB0aGlzLnByb2ZpbGVzID0gc25hcHNob3QucHJvZmlsZXM7XG4gICAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gc25hcHNob3Quc2VsZWN0ZWRQcm9maWxlSWQgPz8gc25hcHNob3QucHJvZmlsZXNbMF0/LmlkID8/IG51bGw7XG4gICAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZT8ubmFtZSA/PyAnJztcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBpbnZhbGlkIHNhdmVkIHBlcnNvbmEgcHJvZmlsZXMgYW5kIGNvbnRpbnVlIHdpdGggYW4gZW1wdHkgbGlzdC5cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICBQRVJTT05BX1BST0ZJTEVTX1NUT1JBR0VfS0VZLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgcHJvZmlsZXM6IHRoaXMucHJvZmlsZXMsXG4gICAgICAgICAgc2VsZWN0ZWRQcm9maWxlSWQ6IHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBsb2NhbFN0b3JhZ2UgZmFpbHVyZXMgdG8ga2VlcCBzZXR0aW5ncyB1c2FibGUuXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBwZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwgPSBuZXcgUGVyc29uYVByb2ZpbGVzVmlld01vZGVsKCk7XG5cbmV4cG9ydCB7IFBFUlNPTkFfUFJPRklMRVNfU1RPUkFHRV9LRVkgfTtcbiIsICIvKipcbiAqIFZpZXdNb2RlbHMgTW9kdWxlXG4gKiBSZS1leHBvcnRzIGFsbCBWaWV3TW9kZWwgaW5zdGFuY2VzXG4gKi9cblxuZXhwb3J0IHsgQm9hcmRWaWV3TW9kZWwsIGJvYXJkVmlld01vZGVsIH0gZnJvbSAnLi9Cb2FyZFZpZXdNb2RlbCc7XG5leHBvcnQgeyBFbmdpbmVWaWV3TW9kZWwsIGVuZ2luZVZpZXdNb2RlbCB9IGZyb20gJy4vRW5naW5lVmlld01vZGVsJztcbmV4cG9ydCB7IENvbmZpZ1ZpZXdNb2RlbCwgY29uZmlnVmlld01vZGVsIH0gZnJvbSAnLi9Db25maWdWaWV3TW9kZWwnO1xuZXhwb3J0IHsgRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gZnJvbSAnLi9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCc7XG5leHBvcnQgeyBHYW1lQW5hbHl0aWNzVmlld01vZGVsLCBnYW1lQW5hbHl0aWNzVmlld01vZGVsIH0gZnJvbSAnLi9HYW1lQW5hbHl0aWNzVmlld01vZGVsJztcbmV4cG9ydCB7IEdhbWVTZXR1cFZpZXdNb2RlbCwgZ2FtZVNldHVwVmlld01vZGVsIH0gZnJvbSAnLi9HYW1lU2V0dXBWaWV3TW9kZWwnO1xuZXhwb3J0IHsgRGVidWdWaWV3TW9kZWwsIGRlYnVnVmlld01vZGVsIH0gZnJvbSAnLi9EZWJ1Z1ZpZXdNb2RlbCc7XG5leHBvcnQgeyBVaVN0YXRlVmlld01vZGVsLCB1aVN0YXRlVmlld01vZGVsIH0gZnJvbSAnLi9VaVN0YXRlVmlld01vZGVsJztcbmV4cG9ydCB7IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCwgcGVyc29uYVByb2ZpbGVzVmlld01vZGVsIH0gZnJvbSAnLi9QZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwnO1xuIiwgImltcG9ydCBhc3NlcnQgZnJvbSAnbm9kZTphc3NlcnQvc3RyaWN0JztcbmltcG9ydCB0ZXN0IGZyb20gJ25vZGU6dGVzdCc7XG5cbmNsYXNzIE1lbW9yeVN0b3JhZ2Uge1xuICBwcml2YXRlIHN0b3JlID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICBnZXRJdGVtKGtleTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuaGFzKGtleSkgPyAodGhpcy5zdG9yZS5nZXQoa2V5KSA/PyBudWxsKSA6IG51bGw7XG4gIH1cblxuICBzZXRJdGVtKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZS5zZXQoa2V5LCB2YWx1ZSk7XG4gIH1cblxuICByZW1vdmVJdGVtKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZS5kZWxldGUoa2V5KTtcbiAgfVxuXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUuY2xlYXIoKTtcbiAgfVxufVxuXG5jb25zdCBsb2NhbFN0b3JhZ2VNb2NrID0gbmV3IE1lbW9yeVN0b3JhZ2UoKTtcbihnbG9iYWxUaGlzIGFzIHVua25vd24gYXMgeyBsb2NhbFN0b3JhZ2U6IE1lbW9yeVN0b3JhZ2UgfSkubG9jYWxTdG9yYWdlID0gbG9jYWxTdG9yYWdlTW9jaztcblxudGVzdCgnYW5hbHlzaXMgc2FmZXR5IGlnbm9yZXMgc3RhbGUgcmVxdWVzdHMgYW5kIHN0YWxlIGRlbGF5ZWQgbW92ZXMnLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgY2FuQXBwbHlBbmFseXplZE1vdmUsIGlzU3RhbGVBbmFseXNpc1JlcXVlc3QgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9hbmFseXNpc1NhZmV0eScpO1xuXG4gIGFzc2VydC5lcXVhbChpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0KDEsIDIpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGlzU3RhbGVBbmFseXNpc1JlcXVlc3QoNCwgNCksIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGNhbkFwcGx5QW5hbHl6ZWRNb3ZlKCdmZW4tYScsICdmZW4tYicpLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChjYW5BcHBseUFuYWx5emVkTW92ZSgnZmVuLWEnLCAnZmVuLWEnKSwgdHJ1ZSk7XG59KTtcblxudGVzdCgnYW5hbHlzaXMgY2FjaGUga2V5LCB0cmltbWluZywgYW5kIGludmFsaWRhdGlvbiBiZWhhdmUgY29ycmVjdGx5JywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IEFuYWx5c2lzQ2FjaGUsIGJ1aWxkQW5hbHlzaXNDYWNoZUtleSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2FuYWx5c2lzQ2FjaGUnKTtcblxuICBhc3NlcnQuZXF1YWwoXG4gICAgYnVpbGRBbmFseXNpc0NhY2hlS2V5KCdmZW4nLCA4LCAxMiksXG4gICAgJ2ZlbnxkZXB0aDo4fG11bHRpcHY6MTInLFxuICApO1xuXG4gIGNvbnN0IGNhY2hlID0gbmV3IEFuYWx5c2lzQ2FjaGUoMik7XG4gIGNhY2hlLnNldCh7IGtleTogJ2EnLCBtb3ZlczogW10sIHRpbWVzdGFtcDogMSB9KTtcbiAgY2FjaGUuc2V0KHsga2V5OiAnYicsIG1vdmVzOiBbXSwgdGltZXN0YW1wOiAyIH0pO1xuICBjYWNoZS5zZXQoeyBrZXk6ICdjJywgbW92ZXM6IFtdLCB0aW1lc3RhbXA6IDMgfSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGNhY2hlLnNpemUsIDIpO1xuICBhc3NlcnQuZXF1YWwoY2FjaGUuZ2V0KCdhJyksIG51bGwpO1xuICBhc3NlcnQubm90RXF1YWwoY2FjaGUuZ2V0KCdiJyksIG51bGwpO1xuICBhc3NlcnQubm90RXF1YWwoY2FjaGUuZ2V0KCdjJyksIG51bGwpO1xuXG4gIGNhY2hlLmludmFsaWRhdGUoJ2InKTtcbiAgYXNzZXJ0LmVxdWFsKGNhY2hlLmdldCgnYicpLCBudWxsKTtcblxuICBjYWNoZS5pbnZhbGlkYXRlKCk7XG4gIGFzc2VydC5lcXVhbChjYWNoZS5zaXplLCAwKTtcbn0pO1xuXG50ZXN0KCdkZXRlcm1pbmlzdGljIFJORyBjaGFuZ2VzIHN0cmVhbSB3aGVuIEZFTiBjaGFuZ2VzIGF0IHRoZSBzYW1lIG1vdmUgbnVtYmVyJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQsIGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3JhbmRvbScpO1xuXG4gIGNvbnN0IHNlZWRBID0gYnVpbGREZXRlcm1pbmlzdGljU2VlZCh7XG4gICAgZ2FtZVN0YXJ0RmVuOiAnc3RhcnQtZmVuJyxcbiAgICBjdXJyZW50RmVuOiAnZmVuLWEnLFxuICAgIG1vdmVDb3VudDogMTIsXG4gICAgc2lkZVRvTW92ZTogJ3cnLFxuICAgIHBlcnNvbmE6ICdtZWRpdW0nLFxuICB9KTtcbiAgY29uc3Qgc2VlZEIgPSBidWlsZERldGVybWluaXN0aWNTZWVkKHtcbiAgICBnYW1lU3RhcnRGZW46ICdzdGFydC1mZW4nLFxuICAgIGN1cnJlbnRGZW46ICdmZW4tYicsXG4gICAgbW92ZUNvdW50OiAxMixcbiAgICBzaWRlVG9Nb3ZlOiAndycsXG4gICAgcGVyc29uYTogJ21lZGl1bScsXG4gIH0pO1xuXG4gIGNvbnN0IHJuZ0EgPSBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2Uoc2VlZEEpO1xuICBjb25zdCBybmdCID0gY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlKHNlZWRCKTtcblxuICBhc3NlcnQubm90RXF1YWwocm5nQS5uZXh0KCksIHJuZ0IubmV4dCgpKTtcbn0pO1xuXG50ZXN0KCdQR04gY3VzdG9tIHN0YXJ0IEZFTiBpcyByZXNwZWN0ZWQnLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgcmVzb2x2ZVBnblN0YXJ0RmVuIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvZ2FtZVNlc3Npb24nKTtcblxuICBjb25zdCBmZW4gPSByZXNvbHZlUGduU3RhcnRGZW4oXG4gICAge1xuICAgICAgU2V0VXA6ICcxJyxcbiAgICAgIEZFTjogJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScsXG4gICAgfSxcbiAgICAnZmFsbGJhY2snLFxuICApO1xuXG4gIGFzc2VydC5lcXVhbChmZW4sICc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnKTtcbn0pO1xuXG50ZXN0KCdicmlsbGlhbnQgdXNhZ2UgZGVyaXZlcyBmcm9tIG1vdmUgaGlzdG9yeSBtZXRhZGF0YScsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBkZXJpdmVCcmlsbGlhbnRVc2FnZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2JyaWxsaWFudFRyYWNraW5nJyk7XG5cbiAgY29uc3QgdXNhZ2UgPSBkZXJpdmVCcmlsbGlhbnRVc2FnZShbXG4gICAge1xuICAgICAgYmVmb3JlRmVuOiAnYScsXG4gICAgICBhZnRlckZlbjogJ2InLFxuICAgICAgdWNpOiAnZTJlNCcsXG4gICAgICBtb3ZlTnVtYmVyOiAxLFxuICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IGZhbHNlLFxuICAgIH0sXG4gICAge1xuICAgICAgYmVmb3JlRmVuOiAnYicsXG4gICAgICBhZnRlckZlbjogJ2MnLFxuICAgICAgdWNpOiAnZTdlNScsXG4gICAgICBtb3ZlTnVtYmVyOiAxLFxuICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUsXG4gICAgfSxcbiAgXSk7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbCh1c2FnZSwge1xuICAgIGJyaWxsaWFudFVzZWRDb3VudDogMSxcbiAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogWzFdLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdicmlsbGlhbnQgYnVkZ2V0IGlzIGNvbnN1bWVkIG9ubHkgYWZ0ZXIgYSBzdWNjZXNzZnVsIGVuZ2luZSBtb3ZlIGFuZCByb2xscyBiYWNrIG9uIHVuZG8vcmVkbycsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsIHRydWUpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWUoMik7XG5cbiAgY29uc3QgaW52YWxpZE1vdmUgPSBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnYTFhMScsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChpbnZhbGlkTW92ZSwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcblxuICBjb25zdCBzdWNjZXNzZnVsTW92ZSA9IGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdlMmU0JywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKHN1Y2Nlc3NmdWxNb3ZlLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZU51bWJlcnMsIFsxXSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLnVuZG9TaW5nbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuICBhc3NlcnQuZGVlcEVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVOdW1iZXJzLCBbXSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLnJlZG9TaW5nbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuICBhc3NlcnQuZGVlcEVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVOdW1iZXJzLCBbMV0pO1xufSk7XG5cbnRlc3QoJ25ldyBGRU4sIFBHTiwgYW5kIG9wZW5pbmcgbG9hZHMgcmVzZXQgYnJpbGxpYW50IHN0YXRlIGFuZCBQR04gc3RhcnQgRkVOIHVwZGF0ZXMgZ2FtZSBzdGFydCcsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG4gIGNvbnN0IHsgUFJFREVGSU5FRF9PUEVOSU5HUyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL29wZW5pbmdzJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsIHRydWUpO1xuICBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnZTJlNCcsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuXG4gIGJvYXJkVmlld01vZGVsLmxvYWRGZW4oJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcblxuICBib2FyZFZpZXdNb2RlbC5sb2FkUGduKCdbU2V0VXAgXCIxXCJdXFxuW0ZFTiBcIjgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMVwiXVxcblxcbjEuIEthMiAqJyk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5nYW1lU3RhcnRGZW4sICc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG5cbiAgYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2gxaDInLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcblxuICBib2FyZFZpZXdNb2RlbC5sb2FkUGduKFBSRURFRklORURfT1BFTklOR1NbMF0ucGduKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG59KTtcblxudGVzdCgnc29sdmVOZXh0TW92ZSBkcm9wcyBzdGFsZSBkZWxheWVkIGF1dG9wbGF5IG1vdmVzIHNhZmVseScsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwsIGVuZ2luZVZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwsIGNvbmZpZ1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZUh1bWFuRGVsYXlTaW11bGF0aW9uJywgdHJ1ZSk7XG4gIGNvbmZpZ1ZpZXdNb2RlbC5hcHBseVByZXNldCgnbWVkaXVtJyk7XG5cbiAgY29uc3Qgb3JpZ2luYWxJbml0aWFsaXplID0gZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUuYmluZChlbmdpbmVWaWV3TW9kZWwpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5emVQb3NpdGlvbiA9IGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24uYmluZChlbmdpbmVWaWV3TW9kZWwpO1xuICBjb25zdCBvcmlnaW5hbFBpY2tNb3ZlID0gZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzLmJpbmQoZW5naW5lVmlld01vZGVsKTtcblxuICBsZXQgcmVsZWFzZURlbGF5OiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcblxuICBlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gIGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplID0gYXN5bmMgKCkgPT4gdW5kZWZpbmVkO1xuICBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uID0gYXN5bmMgKGZlbjogc3RyaW5nKSA9PiAoe1xuICAgIHJlcXVlc3RJZDogMSxcbiAgICBhbmFseXplZEZlbjogZmVuLFxuICAgIG1vdmVzOiBbXG4gICAgICB7XG4gICAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgICAgZXZhbHVhdGlvbjogMzAsXG4gICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICBwdjogWydlMmU0J10sXG4gICAgICAgIG11bHRpcHY6IDEsXG4gICAgICAgIGRlcHRoOiA4LFxuICAgICAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBjb21wbGV4aXR5OiB7XG4gICAgICBsZXZlbDogJ21lZGl1bScsXG4gICAgICBzY29yZTogMC41LFxuICAgICAgc3ByZWFkOiAzMCxcbiAgICAgIGNsb3NlQ2FuZGlkYXRlczogMixcbiAgICAgIHZvbGF0aWxpdHk6IDIwLFxuICAgIH0sXG4gICAgaWdub3JlZDogZmFsc2UsXG4gICAgZnJvbUNhY2hlOiBmYWxzZSxcbiAgICBwdXJwb3NlOiAnZW5naW5lTW92ZScsXG4gIH0pO1xuICBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMgPSAoKSA9PiAoe1xuICAgIG1vdmU6IHtcbiAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgIGV2YWx1YXRpb246IDMwLFxuICAgICAgZXZhbExvc3M6IDAsXG4gICAgICBwdjogWydlMmU0J10sXG4gICAgICBtdWx0aXB2OiAxLFxuICAgICAgZGVwdGg6IDgsXG4gICAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICB9LFxuICAgIGJ1Y2tldDogJ2Jlc3QnLFxuICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgfSk7XG5cbiAgKGJvYXJkVmlld01vZGVsIGFzIHVua25vd24gYXMgeyB3YWl0OiAoZGVsYXlNczogbnVtYmVyKSA9PiBQcm9taXNlPHZvaWQ+IH0pLndhaXQgPSAoKSA9PlxuICAgIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICByZWxlYXNlRGVsYXkgPSByZXNvbHZlO1xuICAgIH0pO1xuXG4gIGNvbnN0IHBlbmRpbmdNb3ZlID0gYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSh0cnVlKTtcbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzZXRUaW1lb3V0KHJlc29sdmUsIDApO1xuICB9KTtcbiAgYm9hcmRWaWV3TW9kZWwubG9hZEZlbignOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyk7XG4gIHJlbGVhc2VEZWxheT8uKCk7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBlbmRpbmdNb3ZlO1xuXG4gIGFzc2VydC5lcXVhbChyZXN1bHQsIG51bGwpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuZmVuLCAnOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyk7XG5cbiAgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUgPSBvcmlnaW5hbEluaXRpYWxpemU7XG4gIGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24gPSBvcmlnaW5hbEFuYWx5emVQb3NpdGlvbjtcbiAgZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzID0gb3JpZ2luYWxQaWNrTW92ZTtcbn0pO1xuXG50ZXN0KCdiYWNrZ3JvdW5kIGFuYWx5c2lzIGRvZXMgbm90IGNhbmNlbCBhIHZhbGlkIHBlbmRpbmcgZW5naW5lIG1vdmUgcmVxdWVzdCcsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgRW5naW5lVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG4gIGNvbnN0IHsgbW92ZVN0b2NrZmlzaFNlcnZpY2UsIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3N0b2NrZmlzaC5zZXJ2aWNlJyk7XG4gIGNvbnN0IGVuZ2luZSA9IG5ldyBFbmdpbmVWaWV3TW9kZWwoKTtcblxuICBjb25zdCBvcmlnaW5hbEluaXRpYWxpemUgPSBlbmdpbmUuaW5pdGlhbGl6ZS5iaW5kKGVuZ2luZSk7XG4gIGNvbnN0IG9yaWdpbmFsTW92ZUFuYWx5emUgPSBtb3ZlU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24uYmluZChtb3ZlU3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsTW92ZUNvbmZpZ3VyZSA9IG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZS5iaW5kKG1vdmVTdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxNb3ZlU3RvcCA9IG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AuYmluZChtb3ZlU3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHlzaXNBbmFseXplID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbi5iaW5kKGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHlzaXNDb25maWd1cmUgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlLmJpbmQoYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxBbmFseXNpc1N0b3AgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2Uuc3RvcC5iaW5kKGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSk7XG5cbiAgbGV0IHJlbGVhc2VNb3ZlQW5hbHlzaXM6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBsZXQgbW92ZUFuYWx5emVDYWxscyA9IDA7XG4gIGxldCBiYWNrZ3JvdW5kQW5hbHl6ZUNhbGxzID0gMDtcblxuICBlbmdpbmUuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gIGVuZ2luZS5pbml0aWFsaXplID0gYXN5bmMgKCkgPT4gdW5kZWZpbmVkO1xuICBtb3ZlU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IGFzeW5jICgpID0+IHtcbiAgICBtb3ZlQW5hbHl6ZUNhbGxzICs9IDE7XG4gICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIHJlbGVhc2VNb3ZlQW5hbHlzaXMgPSByZXNvbHZlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgICBldmFsdWF0aW9uOiA0MixcbiAgICAgICAgZXZhbExvc3M6IDAsXG4gICAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgICAgbXVsdGlwdjogMSxcbiAgICAgICAgZGVwdGg6IDEwLFxuICAgICAgfSxcbiAgICBdO1xuICB9O1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gKCkgPT4gdW5kZWZpbmVkO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2Uuc3RvcCA9ICgpID0+IHVuZGVmaW5lZDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IGFzeW5jICgpID0+IHtcbiAgICBiYWNrZ3JvdW5kQW5hbHl6ZUNhbGxzICs9IDE7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgICBldmFsdWF0aW9uOiA0MixcbiAgICAgICAgZXZhbExvc3M6IDAsXG4gICAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgICAgbXVsdGlwdjogMSxcbiAgICAgICAgZGVwdGg6IDEwLFxuICAgICAgfSxcbiAgICBdO1xuICB9O1xuXG4gIGNvbnN0IGVuZ2luZU1vdmVQcm9taXNlID0gZW5naW5lLmFuYWx5emVQb3NpdGlvbignZmVuLXNoYXJlZCcsIDEwLCAyLCAnZW5naW5lTW92ZScpO1xuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCAwKSk7XG4gIGNvbnN0IGJhY2tncm91bmRQcm9taXNlID0gZW5naW5lLmFuYWx5emVQb3NpdGlvbignZmVuLXNoYXJlZCcsIDEwLCAyLCAnYmFja2dyb3VuZCcpO1xuXG4gIHJlbGVhc2VNb3ZlQW5hbHlzaXM/LigpO1xuXG4gIGNvbnN0IFtlbmdpbmVNb3ZlUmVzdWx0LCBiYWNrZ3JvdW5kUmVzdWx0XSA9IGF3YWl0IFByb21pc2UuYWxsKFtlbmdpbmVNb3ZlUHJvbWlzZSwgYmFja2dyb3VuZFByb21pc2VdKTtcblxuICBhc3NlcnQuZXF1YWwobW92ZUFuYWx5emVDYWxscywgMSk7XG4gIGFzc2VydC5lcXVhbChiYWNrZ3JvdW5kQW5hbHl6ZUNhbGxzLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKGVuZ2luZU1vdmVSZXN1bHQuaWdub3JlZCwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoYmFja2dyb3VuZFJlc3VsdC5pZ25vcmVkLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChiYWNrZ3JvdW5kUmVzdWx0LmFuYWx5emVkRmVuLCAnZmVuLXNoYXJlZCcpO1xuXG4gIGVuZ2luZS5pbml0aWFsaXplID0gb3JpZ2luYWxJbml0aWFsaXplO1xuICBtb3ZlU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBvcmlnaW5hbE1vdmVBbmFseXplO1xuICBtb3ZlU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSBvcmlnaW5hbE1vdmVDb25maWd1cmU7XG4gIG1vdmVTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AgPSBvcmlnaW5hbE1vdmVTdG9wO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxBbmFseXNpc0FuYWx5emU7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSBvcmlnaW5hbEFuYWx5c2lzQ29uZmlndXJlO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2Uuc3RvcCA9IG9yaWdpbmFsQW5hbHlzaXNTdG9wO1xufSk7XG5cbnRlc3QoJ2VuZ2luZSByZXNldCBjbGVhcnMgaW4tZmxpZ2h0IGFuYWx5c2lzIHN0YXRlIHNvIG5ldyByZXF1ZXN0cyBhcmUgbm90IGJsb2NrZWQnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IEVuZ2luZVZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3N0b2NrZmlzaC5zZXJ2aWNlJyk7XG4gIGNvbnN0IGVuZ2luZSA9IG5ldyBFbmdpbmVWaWV3TW9kZWwoKTtcblxuICBjb25zdCBvcmlnaW5hbEluaXRpYWxpemUgPSBlbmdpbmUuaW5pdGlhbGl6ZS5iaW5kKGVuZ2luZSk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHl6ZSA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24uYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbENvbmZpZ3VyZSA9IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUuYmluZChhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbFN0b3AgPSBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2Uuc3RvcC5iaW5kKGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSk7XG5cbiAgbGV0IHJlc29sdmVGaXJzdEFuYWx5c2lzOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgbGV0IGFuYWx5emVDYWxsQ291bnQgPSAwO1xuXG4gIGVuZ2luZS5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgZW5naW5lLmluaXRpYWxpemUgPSBhc3luYyAoKSA9PiB1bmRlZmluZWQ7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5zdG9wID0gKCkgPT4gdW5kZWZpbmVkO1xuICBhbmFseXNpc1N0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gYXN5bmMgKCkgPT4ge1xuICAgIGFuYWx5emVDYWxsQ291bnQgKz0gMTtcblxuICAgIGlmIChhbmFseXplQ2FsbENvdW50ID09PSAxKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgcmVzb2x2ZUZpcnN0QW5hbHlzaXMgPSAoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZShbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgICAgICAgICAgZXZhbHVhdGlvbjogMTIsXG4gICAgICAgICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICAgICAgICBwdjogWydlMmU0J10sXG4gICAgICAgICAgICAgIG11bHRpcHY6IDEsXG4gICAgICAgICAgICAgIGRlcHRoOiA4LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdKTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIG1vdmU6ICdkMmQ0JyxcbiAgICAgICAgZXZhbHVhdGlvbjogMTgsXG4gICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICBwdjogWydkMmQ0J10sXG4gICAgICAgIG11bHRpcHY6IDEsXG4gICAgICAgIGRlcHRoOiA4LFxuICAgICAgfSxcbiAgICBdO1xuICB9O1xuXG4gIGNvbnN0IHN0YWxlQW5hbHlzaXNQcm9taXNlID0gZW5naW5lLmFuYWx5emVQb3NpdGlvbignZmVuLW9sZCcsIDgsIDIsICdiYWNrZ3JvdW5kJyk7XG4gIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDApKTtcblxuICBlbmdpbmUucmVzZXQoKTtcbiAgYXNzZXJ0LmVxdWFsKGVuZ2luZS5pc0FuYWx5emluZywgZmFsc2UpO1xuXG4gIGNvbnN0IGZyZXNoQW5hbHlzaXNQcm9taXNlID0gZW5naW5lLmFuYWx5emVQb3NpdGlvbignZmVuLW5ldycsIDgsIDIsICdiYWNrZ3JvdW5kJyk7XG4gIHJlc29sdmVGaXJzdEFuYWx5c2lzPy4oKTtcblxuICBjb25zdCBmcmVzaFJlc3VsdCA9IGF3YWl0IGZyZXNoQW5hbHlzaXNQcm9taXNlO1xuICBjb25zdCBzdGFsZVJlc3VsdCA9IGF3YWl0IHN0YWxlQW5hbHlzaXNQcm9taXNlO1xuXG4gIGFzc2VydC5lcXVhbChhbmFseXplQ2FsbENvdW50LCAyKTtcbiAgYXNzZXJ0LmVxdWFsKGZyZXNoUmVzdWx0LmFuYWx5emVkRmVuLCAnZmVuLW5ldycpO1xuICBhc3NlcnQuZXF1YWwoc3RhbGVSZXN1bHQuaWdub3JlZCwgdHJ1ZSk7XG5cbiAgZW5naW5lLmluaXRpYWxpemUgPSBvcmlnaW5hbEluaXRpYWxpemU7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBvcmlnaW5hbEFuYWx5emU7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSBvcmlnaW5hbENvbmZpZ3VyZTtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLnN0b3AgPSBvcmlnaW5hbFN0b3A7XG59KTtcblxudGVzdCgncmVzdG9yZWQgbW92ZSBhbm5vdGF0aW9ucyBwcmVzZXJ2ZSBicmlsbGlhbnQgdW5kby9yZWRvIHRyYWNraW5nIGFmdGVyIHJlc3RhcnQnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IEJvYXJkVmlld01vZGVsLCBib2FyZFZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCdwZXJzaXN0RW5naW5lQ29uZmlnJywgdHJ1ZSk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsIHRydWUpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWUoMik7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgY29uc3QgbW92ZUFwcGxpZWQgPSBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnZTJlNCcsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChtb3ZlQXBwbGllZCwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC51bmRvU2luZ2xlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmNhblJlZG8sIHRydWUpO1xuXG4gIGNvbnN0IHJlc3RvcmVkQm9hcmQgPSBuZXcgQm9hcmRWaWV3TW9kZWwoKTtcbiAgYXNzZXJ0LmVxdWFsKHJlc3RvcmVkQm9hcmQuY2FuUmVkbywgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuXG4gIGFzc2VydC5lcXVhbChyZXN0b3JlZEJvYXJkLnJlZG9TaW5nbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuICBhc3NlcnQuZGVlcEVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVOdW1iZXJzLCBbMV0pO1xuXG4gIGFzc2VydC5lcXVhbChyZXN0b3JlZEJvYXJkLnVuZG9TaW5nbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xufSk7XG5cbnRlc3QoJ25ldyBnYW1lIGNsZWFycyBzdGFsZSBib2FyZCB0cmFuc2llbnQgc3RhdGUgYW5kIGFsbG93cyBibGFjayBhdXRvcGxheSB0dXJuIGZsb3cgYWdhaW4nLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwuaXNUaGlua2luZyA9IHRydWU7XG4gIGJvYXJkVmlld01vZGVsLmlzQW5hbHl6aW5nTW92ZXMgPSB0cnVlO1xuICBib2FyZFZpZXdNb2RlbC5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPSAnZ29vZCc7XG4gIGJvYXJkVmlld01vZGVsLnNldEF1dG9QbGF5KHRydWUpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRFbmdpbmVQbGF5c0ZvcignYicpO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmlzVGhpbmtpbmcsIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmlzQW5hbHl6aW5nTW92ZXMsIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmxhc3RQbGF5ZXJNb3ZlUXVhbGl0eSwgbnVsbCk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5jYW5TdGFydEF1dG9QbGF5VHVybiwgZmFsc2UpO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5tYWtlTW92ZSgnZTInLCAnZTQnKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5jYW5TdGFydEF1dG9QbGF5VHVybiwgdHJ1ZSk7XG59KTtcblxudGVzdCgnY2FjaGUtaGl0IGluZGljYXRvciByZWZsZWN0cyB3aGV0aGVyIGFuYWx5c2lzIGNhbWUgZnJvbSBjYWNoZScsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgRW5naW5lVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3N0b2NrZmlzaC5zZXJ2aWNlJyk7XG4gIGNvbnN0IHsgYW5hbHlzaXNDYWNoZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2FuYWx5c2lzQ2FjaGUnKTtcbiAgY29uc3QgZW5naW5lID0gbmV3IEVuZ2luZVZpZXdNb2RlbCgpO1xuXG4gIGNvbnN0IG9yaWdpbmFsSW5pdGlhbGl6ZSA9IGVuZ2luZS5pbml0aWFsaXplLmJpbmQoZW5naW5lKTtcbiAgY29uc3Qgb3JpZ2luYWxBbmFseXplID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbi5iaW5kKGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsQ29uZmlndXJlID0gYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZS5iaW5kKGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZSk7XG5cbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlTW92ZUFuYWx5c2lzQ2FjaGUnLCB0cnVlKTtcbiAgYW5hbHlzaXNDYWNoZS5pbnZhbGlkYXRlKCk7XG5cbiAgZW5naW5lLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IGFzeW5jICgpID0+IHVuZGVmaW5lZDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9ICgpID0+IHVuZGVmaW5lZDtcbiAgYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IGFzeW5jICgpID0+IFtcbiAgICB7XG4gICAgICBtb3ZlOiAnZTJlNCcsXG4gICAgICBldmFsdWF0aW9uOiAzNSxcbiAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgcHY6IFsnZTJlNCddLFxuICAgICAgbXVsdGlwdjogMSxcbiAgICAgIGRlcHRoOiAxMixcbiAgICB9LFxuICBdO1xuXG4gIGNvbnN0IGZpcnN0ID0gYXdhaXQgZW5naW5lLmFuYWx5emVQb3NpdGlvbignZmVuLWNhY2hlJywgMTIsIDIsICdiYWNrZ3JvdW5kJyk7XG4gIGNvbnN0IHNlY29uZCA9IGF3YWl0IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1jYWNoZScsIDEyLCAyLCAnYmFja2dyb3VuZCcpO1xuXG4gIGFzc2VydC5lcXVhbChmaXJzdC5mcm9tQ2FjaGUsIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKHNlY29uZC5mcm9tQ2FjaGUsIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZW5naW5lLmxhc3RBbmFseXNpc0Zyb21DYWNoZSwgdHJ1ZSk7XG5cbiAgZW5naW5lLmluaXRpYWxpemUgPSBvcmlnaW5hbEluaXRpYWxpemU7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBvcmlnaW5hbEFuYWx5emU7XG4gIGFuYWx5c2lzU3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSBvcmlnaW5hbENvbmZpZ3VyZTtcbn0pO1xuXG50ZXN0KCdwZXJzb25hIHByb2ZpbGVzIHNhdmUgYW5kIGxvYWQgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBzbmFwc2hvdCcsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgUGVyc29uYVByb2ZpbGVzVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG4gIGNvbnN0IHsgREVGQVVMVF9CVUNLRVRfQ09ORklHIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvdHlwZXMnKTtcbiAgY29uc3QgeyBERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2ZlYXR1cmVPcHRpb25zJyk7XG5cbiAgbGV0IGFwcGxpZWRDb25maWc6IHVua25vd24gPSBudWxsO1xuICBsZXQgYXBwbGllZEZlYXR1cmVPcHRpb25zOiB1bmtub3duID0gbnVsbDtcbiAgbGV0IGFwcGxpZWRCcmlsbGlhbnRTZXR0aW5nczogdW5rbm93biA9IG51bGw7XG4gIGxldCBhcHBsaWVkVWk6IHVua25vd24gPSBudWxsO1xuXG4gIGNvbnN0IHByb2ZpbGVzID0gbmV3IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCh7XG4gICAgY29uZmlnVmlld01vZGVsOiB7XG4gICAgICBidWNrZXRDb25maWc6IHtcbiAgICAgICAgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICAgICAgICBiZXN0OiAyOCxcbiAgICAgICAgZ3JlYXQ6IDIyLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRQcmVzZXRJZDogJ2FnZ3Jlc3NpdmUnLFxuICAgICAgZGVwdGg6IDEzLFxuICAgICAgbXVsdGlQVjogNyxcbiAgICAgIGFwcGx5UHJvZmlsZVNuYXBzaG90OiAoc25hcHNob3QpID0+IHtcbiAgICAgICAgYXBwbGllZENvbmZpZyA9IHNuYXBzaG90O1xuICAgICAgfSxcbiAgICB9LFxuICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsOiB7XG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIC4uLkRFRkFVTFRfRkVBVFVSRV9PUFRJT05TLFxuICAgICAgICB1c2VEZXRlcm1pbmlzdGljUm5nOiB0cnVlLFxuICAgICAgICB1c2VNb3ZlQW5hbHlzaXNDYWNoZTogZmFsc2UsXG4gICAgICAgIHVzZUJyaWxsaWFudE1vdmVCdWRnZXQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAzLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnbWlkZGxlZ2FtZScsXG4gICAgICBhcHBseVByb2ZpbGVTZXR0aW5nczogKG9wdGlvbnMsIGJyaWxsaWFudCkgPT4ge1xuICAgICAgICBhcHBsaWVkRmVhdHVyZU9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICBhcHBsaWVkQnJpbGxpYW50U2V0dGluZ3MgPSBicmlsbGlhbnQ7XG4gICAgICB9LFxuICAgIH0sXG4gICAgdWlTdGF0ZVZpZXdNb2RlbDoge1xuICAgICAgdGhlbWVNb2RlOiAncGVyc29uYScsXG4gICAgICBiYXNpY01vZGU6IGZhbHNlLFxuICAgICAgYXBwbHlQcm9maWxlUHJlZmVyZW5jZXM6IChwcmVmZXJlbmNlcykgPT4ge1xuICAgICAgICBhcHBsaWVkVWkgPSBwcmVmZXJlbmNlcztcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgcHJvZmlsZXMuc2V0UHJvZmlsZU5hbWVEcmFmdCgnU2hhcnAgVGFjdGljaWFuJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5zYXZlQ3VycmVudFByb2ZpbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlcy5sZW5ndGgsIDEpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/Lm5hbWUsICdTaGFycCBUYWN0aWNpYW4nKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy5kZXB0aCwgMTMpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLmZlYXR1cmVPcHRpb25zLnVzZURldGVybWluaXN0aWNSbmcsIHRydWUpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLmJyaWxsaWFudC5icmlsbGlhbnRNb3Zlc1BlckdhbWUsIDMpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLnVpLnRoZW1lTW9kZSwgJ3BlcnNvbmEnKTtcblxuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMubG9hZFNlbGVjdGVkUHJvZmlsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChhcHBsaWVkQ29uZmlnLCB7XG4gICAgYnVja2V0Q29uZmlnOiB7XG4gICAgICAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gICAgICBiZXN0OiAyOCxcbiAgICAgIGdyZWF0OiAyMixcbiAgICB9LFxuICAgIGN1cnJlbnRQcmVzZXRJZDogJ2FnZ3Jlc3NpdmUnLFxuICAgIGRlcHRoOiAxMyxcbiAgICBtdWx0aVBWOiA3LFxuICB9KTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChhcHBsaWVkRmVhdHVyZU9wdGlvbnMsIHtcbiAgICAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyxcbiAgICB1c2VEZXRlcm1pbmlzdGljUm5nOiB0cnVlLFxuICAgIHVzZU1vdmVBbmFseXNpc0NhY2hlOiBmYWxzZSxcbiAgICB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0OiB0cnVlLFxuICB9KTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChhcHBsaWVkQnJpbGxpYW50U2V0dGluZ3MsIHtcbiAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IDMsXG4gICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnbWlkZGxlZ2FtZScsXG4gIH0pO1xuICBhc3NlcnQuZGVlcEVxdWFsKGFwcGxpZWRVaSwge1xuICAgIHRoZW1lTW9kZTogJ3BlcnNvbmEnLFxuICAgIGJhc2ljTW9kZTogZmFsc2UsXG4gIH0pO1xufSk7XG5cbnRlc3QoJ3BlcnNvbmEgcHJvZmlsZSBpbXBvcnQgdmFsaWRhdGVzIEpTT04gc2FmZWx5IGFuZCBkZWR1cGxpY2F0ZXMgbmFtZXMnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IERFRkFVTFRfQlVDS0VUX0NPTkZJRyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3R5cGVzJyk7XG4gIGNvbnN0IHsgREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9mZWF0dXJlT3B0aW9ucycpO1xuXG4gIGNvbnN0IHByb2ZpbGVzID0gbmV3IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCh7XG4gICAgY29uZmlnVmlld01vZGVsOiB7XG4gICAgICBidWNrZXRDb25maWc6IHsgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHIH0sXG4gICAgICBjdXJyZW50UHJlc2V0SWQ6ICdtZWRpdW0nLFxuICAgICAgZGVwdGg6IDgsXG4gICAgICBtdWx0aVBWOiAxMixcbiAgICAgIGFwcGx5UHJvZmlsZVNuYXBzaG90OiAoKSA9PiB1bmRlZmluZWQsXG4gICAgfSxcbiAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbDoge1xuICAgICAgb3B0aW9uczogeyAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyB9LFxuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAwLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnYW55JyxcbiAgICAgIGFwcGx5UHJvZmlsZVNldHRpbmdzOiAoKSA9PiB1bmRlZmluZWQsXG4gICAgfSxcbiAgICB1aVN0YXRlVmlld01vZGVsOiB7XG4gICAgICB0aGVtZU1vZGU6ICdkYXJrJyxcbiAgICAgIGJhc2ljTW9kZTogdHJ1ZSxcbiAgICAgIGFwcGx5UHJvZmlsZVByZWZlcmVuY2VzOiAoKSA9PiB1bmRlZmluZWQsXG4gICAgfSxcbiAgfSk7XG5cbiAgcHJvZmlsZXMuc2V0UHJvZmlsZU5hbWVEcmFmdCgnQmFsYW5jZWQnKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnNhdmVDdXJyZW50UHJvZmlsZSgpLCB0cnVlKTtcblxuICBwcm9maWxlcy5zZXRFeGNoYW5nZUpzb24oJ3tiYWQganNvbicpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMuaW1wb3J0UHJvZmlsZUZyb21Kc29uKCksIGZhbHNlKTtcbiAgYXNzZXJ0Lm1hdGNoKHByb2ZpbGVzLmltcG9ydEVycm9yLCAvY291bGQgbm90IGJlIHBhcnNlZC9pKTtcblxuICBwcm9maWxlcy5zZXRFeGNoYW5nZUpzb24oXG4gICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAga2luZDogJ3BlcnNvbmFjaGVzcy5wZXJzb25hLXByb2ZpbGUnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIG5hbWU6ICdCYWxhbmNlZCcsXG4gICAgICBzZXR0aW5nczoge1xuICAgICAgICBidWNrZXRDb25maWc6IERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgICAgICAgY3VycmVudFByZXNldElkOiAnaGFyZCcsXG4gICAgICAgIGRlcHRoOiAxNSxcbiAgICAgICAgbXVsdGlQVjogNCxcbiAgICAgICAgZmVhdHVyZU9wdGlvbnM6IHtcbiAgICAgICAgICAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyxcbiAgICAgICAgICB1c2VEZXRlcm1pbmlzdGljUm5nOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBicmlsbGlhbnQ6IHtcbiAgICAgICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IDIsXG4gICAgICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnZW5kZ2FtZScsXG4gICAgICAgIH0sXG4gICAgICAgIHVpOiB7XG4gICAgICAgICAgdGhlbWVNb2RlOiAnbGlnaHQnLFxuICAgICAgICAgIGJhc2ljTW9kZTogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pLFxuICApO1xuXG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5pbXBvcnRQcm9maWxlRnJvbUpzb24oKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlcy5sZW5ndGgsIDIpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/Lm5hbWUsICdCYWxhbmNlZCAyJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8uc2V0dGluZ3MuY3VycmVudFByZXNldElkLCAnaGFyZCcpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLnVpLnRoZW1lTW9kZSwgJ2xpZ2h0Jyk7XG59KTtcblxudGVzdCgnZ2FtZSBzZXR1cCBwcmVzZXRzIHJlbWFpbiBzZWFyY2hhYmxlIGFuZCBjb21wYXRpYmxlIHdpdGggdGhlIGV4aXN0aW5nIG9wZW5pbmcgbGlicmFyeScsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBQUkVERUZJTkVEX09QRU5JTkdTIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvb3BlbmluZ3MnKTtcbiAgY29uc3Qge1xuICAgIEdBTUVfU0VUVVBfUFJFU0VUUyxcbiAgICBmaWx0ZXJHYW1lU2V0dXBQcmVzZXRzLFxuICAgIHRvQ29tcGF0aWJsZU9wZW5pbmdQcmVzZXQsXG4gIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvZ2FtZVNldHVwUHJlc2V0cycpO1xuXG4gIGFzc2VydC5vayhHQU1FX1NFVFVQX1BSRVNFVFMubGVuZ3RoID49IFBSRURFRklORURfT1BFTklOR1MubGVuZ3RoKTtcblxuICBjb25zdCBmaWx0ZXJlZCA9IGZpbHRlckdhbWVTZXR1cFByZXNldHMoR0FNRV9TRVRVUF9QUkVTRVRTLCAnb3BlbmluZ3MnLCAnc2ljaWxpYW4nKTtcbiAgYXNzZXJ0LmVxdWFsKGZpbHRlcmVkLmxlbmd0aCwgMSk7XG4gIGFzc2VydC5tYXRjaChmaWx0ZXJlZFswXT8ubmFtZSA/PyAnJywgL3NpY2lsaWFuL2kpO1xuXG4gIGNvbnN0IG9wZW5pbmdQcmVzZXQgPSB0b0NvbXBhdGlibGVPcGVuaW5nUHJlc2V0KFBSRURFRklORURfT1BFTklOR1NbMF0/LmlkID8/ICcnKTtcbiAgYXNzZXJ0LmVxdWFsKG9wZW5pbmdQcmVzZXQ/LnNvdXJjZVR5cGUsICdwZ24nKTtcbiAgYXNzZXJ0LmVxdWFsKG9wZW5pbmdQcmVzZXQ/LnNvdXJjZSwgUFJFREVGSU5FRF9PUEVOSU5HU1swXT8ucGduKTtcbn0pO1xuXG50ZXN0KCdsb2FkaW5nIGEgZ2FtZSBzZXR1cCBwcmVzZXQgcmVzZXRzIHNlc3Npb24gc3RhdGUgYW5kIGJyaWxsaWFudCB0cmFja2luZycsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG4gIGNvbnN0IHsgZ2V0R2FtZVNldHVwUHJlc2V0QnlJZCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2dhbWVTZXR1cFByZXNldHMnKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0JywgdHJ1ZSk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldEJyaWxsaWFudE1vdmVzUGVyR2FtZSgyKTtcblxuICBjb25zdCBiYXNlbGluZVNlc3Npb25JZCA9IGJvYXJkVmlld01vZGVsLmRlYnVnU2Vzc2lvbklkO1xuICBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnZTJlNCcsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuXG4gIGNvbnN0IHByZXNldCA9IGdldEdhbWVTZXR1cFByZXNldEJ5SWQoJ2l0YWxpYW4nKTtcbiAgYXNzZXJ0Lm9rKHByZXNldCk7XG4gIGlmICghcHJlc2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBpdGFsaWFuIHByZXNldCB0byBleGlzdCcpO1xuICB9XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5sb2FkR2FtZVNldHVwUHJlc2V0KHByZXNldCksIHRydWUpO1xuICBhc3NlcnQubm90RXF1YWwoYm9hcmRWaWV3TW9kZWwuZGVidWdTZXNzaW9uSWQsIGJhc2VsaW5lU2Vzc2lvbklkKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG4gIGFzc2VydC5tYXRjaChib2FyZFZpZXdNb2RlbC5zdGF0dXNNZXNzYWdlLCAvaXRhbGlhbi9pKTtcbn0pO1xuXG50ZXN0KCdnYW1lIGFuYWx5dGljcyBzdW1tYXJ5IGFnZ3JlZ2F0ZXMgcXVhbGl0eSwgdGltaW5nLCBjb21wbGV4aXR5LCBhbmQgaGlnaGxpZ2h0cycsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBidWlsZEdhbWVBbmFseXRpY3NTdW1tYXJ5IH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvZ2FtZUFuYWx5dGljcycpO1xuXG4gIGNvbnN0IHN1bW1hcnkgPSBidWlsZEdhbWVBbmFseXRpY3NTdW1tYXJ5KHtcbiAgICBzZXNzaW9uSWQ6ICdzZXNzaW9uX3Rlc3QnLFxuICAgIGNyZWF0ZWRBdE1zOiAxMDAwLFxuICAgIGZpbmlzaGVkQXRNczogOTAwMCxcbiAgICBnYW1lU3RhdHVzOiAnQ2hlY2ttYXRlISBXaGl0ZSB3aW5zJyxcbiAgICBwZXJzb25hSWQ6ICdhZ2dyZXNzaXZlJyxcbiAgICBwZXJzb25hTGFiZWw6ICdBZ2dyZXNzaXZlJyxcbiAgICBzZXR1cE5hbWU6ICdJdGFsaWFuIEdhbWUnLFxuICAgIHNldHVwQ2F0ZWdvcnk6ICdvcGVuaW5ncycsXG4gICAgYXV0b3BsYXlEdXJhdGlvbk1zOiAyNjAwLFxuICAgIHBnbjogJzEuIGU0IGU1IConLFxuICAgIG1vdmVBbm5vdGF0aW9uczogW1xuICAgICAge1xuICAgICAgICBiZWZvcmVGZW46ICdhJyxcbiAgICAgICAgYWZ0ZXJGZW46ICdiJyxcbiAgICAgICAgdWNpOiAnZTJlNCcsXG4gICAgICAgIG1vdmVOdW1iZXI6IDEsXG4gICAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgYWN0b3I6ICdwbGF5ZXInLFxuICAgICAgICBzYW46ICdlNCcsXG4gICAgICAgIGJ1Y2tldDogJ2dvb2QnLFxuICAgICAgICBldmFsTG9zczogNDIsXG4gICAgICAgIGV2YWx1YXRpb246IDE4LFxuICAgICAgICBjb21wbGV4aXR5TGV2ZWw6ICdtZWRpdW0nLFxuICAgICAgICBjb21wbGV4aXR5U2NvcmU6IDAuNSxcbiAgICAgICAgdGltZXN0YW1wOiAyMDAwLFxuICAgICAgICBkZWxheU1zU2luY2VQcmV2aW91czogNzAwLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVmb3JlRmVuOiAnYicsXG4gICAgICAgIGFmdGVyRmVuOiAnYycsXG4gICAgICAgIHVjaTogJ2U3ZTUnLFxuICAgICAgICBtb3ZlTnVtYmVyOiAxLFxuICAgICAgICBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSxcbiAgICAgICAgYWN0b3I6ICdlbmdpbmUnLFxuICAgICAgICBzYW46ICdlNSsnLFxuICAgICAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICAgICAgZXZhbExvc3M6IDAsXG4gICAgICAgIGV2YWx1YXRpb246IDMyLFxuICAgICAgICBjb21wbGV4aXR5TGV2ZWw6ICdoaWdoJyxcbiAgICAgICAgY29tcGxleGl0eVNjb3JlOiAwLjgsXG4gICAgICAgIHRpbWVzdGFtcDogMjgwMCxcbiAgICAgICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IDgwMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZm9yZUZlbjogJ2MnLFxuICAgICAgICBhZnRlckZlbjogJ2QnLFxuICAgICAgICB1Y2k6ICdnMWYzJyxcbiAgICAgICAgbW92ZU51bWJlcjogMixcbiAgICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IGZhbHNlLFxuICAgICAgICBhY3RvcjogJ3BsYXllcicsXG4gICAgICAgIHNhbjogJ05mMycsXG4gICAgICAgIGJ1Y2tldDogJ21pc3Rha2UnLFxuICAgICAgICBldmFsTG9zczogMzEwLFxuICAgICAgICBldmFsdWF0aW9uOiAtOTAsXG4gICAgICAgIGNvbXBsZXhpdHlMZXZlbDogJ2xvdycsXG4gICAgICAgIGNvbXBsZXhpdHlTY29yZTogMC4yLFxuICAgICAgICB0aW1lc3RhbXA6IDQzMDAsXG4gICAgICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiAxNTAwLFxuICAgICAgfSxcbiAgICBdLFxuICB9KTtcblxuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5yZXN1bHQsICdXaGl0ZSB3b24nKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuYnJpbGxpYW50TW92ZXMsIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5tb3ZlQ291bnQsIDMpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5xdWFsaXR5Q291bnRzLmJlc3QsIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5xdWFsaXR5Q291bnRzLmdvb2QsIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5xdWFsaXR5Q291bnRzLm1pc3Rha2UsIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5hdmVyYWdlRXZhbExvc3MsIDExNy4zKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuYXZlcmFnZU1vdmVEZWxheU1zLCAxMDAwKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuY29tcGxleGl0eURpc3RyaWJ1dGlvbi5sb3csIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5jb21wbGV4aXR5RGlzdHJpYnV0aW9uLm1lZGl1bSwgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmNvbXBsZXhpdHlEaXN0cmlidXRpb24uaGlnaCwgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmhpZ2hsaWdodGVkQnJpbGxpYW50TW92ZXMubGVuZ3RoLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkubWFqb3JNaXN0YWtlcy5sZW5ndGgsIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5ldmFsVHJlbmQubGVuZ3RoLCAzKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuY29tcGxleGl0eVRyZW5kLmxlbmd0aCwgMyk7XG59KTtcblxudGVzdCgnZ2FtZSBhbmFseXRpY3Mgdmlld21vZGVsIHN0b3JlcyBjb21wbGV0ZWQgc2Vzc2lvbnMgaW4gcmVjZW50IGdhbWVzJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBHYW1lQW5hbHl0aWNzVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgY29uc3QgYW5hbHl0aWNzID0gbmV3IEdhbWVBbmFseXRpY3NWaWV3TW9kZWwoe1xuICAgIGJvYXJkVmlld01vZGVsOiB7XG4gICAgICBkZWJ1Z1Nlc3Npb25JZDogJ3Nlc3Npb25fY2FwdHVyZScsXG4gICAgICBtb3ZlQW5ub3RhdGlvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGJlZm9yZUZlbjogJ2EnLFxuICAgICAgICAgIGFmdGVyRmVuOiAnYicsXG4gICAgICAgICAgdWNpOiAnZTJlNCcsXG4gICAgICAgICAgbW92ZU51bWJlcjogMSxcbiAgICAgICAgICBjb25zdW1lZEJyaWxsaWFudDogZmFsc2UsXG4gICAgICAgICAgYWN0b3I6ICdwbGF5ZXInLFxuICAgICAgICAgIHNhbjogJ2U0JyxcbiAgICAgICAgICBidWNrZXQ6ICdnb29kJyxcbiAgICAgICAgICBldmFsTG9zczogNDAsXG4gICAgICAgICAgZXZhbHVhdGlvbjogMTUsXG4gICAgICAgICAgY29tcGxleGl0eUxldmVsOiAnbWVkaXVtJyxcbiAgICAgICAgICBjb21wbGV4aXR5U2NvcmU6IDAuNDUsXG4gICAgICAgICAgdGltZXN0YW1wOiAxMDAwLFxuICAgICAgICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiA2MDAsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgc2Vzc2lvblN0YXJ0ZWRBdDogMCxcbiAgICAgIGdhbWVTdGF0dXM6ICdEcmF3IScsXG4gICAgICBwZ246ICcxLiBlNCAqJyxcbiAgICAgIGN1cnJlbnRTZXR1cE5hbWU6ICdDdXN0b20gUG9zaXRpb24nLFxuICAgICAgY3VycmVudFNldHVwQ2F0ZWdvcnk6ICdjdXN0b20nLFxuICAgICAgYXV0b1BsYXlBY3RpdmVEdXJhdGlvbk1zOiA5MDAsXG4gICAgICBpc0dhbWVPdmVyOiB0cnVlLFxuICAgIH0sXG4gICAgY29uZmlnVmlld01vZGVsOiB7XG4gICAgICBhY3RpdmVQZXJzb25hSWQ6ICdtZWRpdW0nLFxuICAgICAgYWN0aXZlUGVyc29uYUxhYmVsOiAnTWVkaXVtJyxcbiAgICB9LFxuICB9KTtcblxuICBhbmFseXRpY3MuY2FwdHVyZUNvbXBsZXRlZEdhbWUoKTtcblxuICBhc3NlcnQuZXF1YWwoYW5hbHl0aWNzLnJlY2VudEdhbWVzLmxlbmd0aCwgMSk7XG4gIGFzc2VydC5lcXVhbChhbmFseXRpY3MucmVjZW50R2FtZXNbMF0/LnNlc3Npb25JZCwgJ3Nlc3Npb25fY2FwdHVyZScpO1xuICBhc3NlcnQuZXF1YWwoYW5hbHl0aWNzLnJlY2VudEdhbWVFbnRyaWVzWzBdPy5wZXJzb25hTGFiZWwsICdNZWRpdW0nKTtcbn0pO1xuXG50ZXN0KCdhdXRvcGxheSBzY2hlZHVsZXMgY29ycmVjdGx5IGZvciBhIGJsYWNrIGVuZ2luZSBhZnRlciBhIHdoaXRlIHBsYXllciBtb3ZlJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCwgZW5naW5lVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgY29uc3Qgb3JpZ2luYWxTb2x2ZU5leHRNb3ZlID0gYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZS5iaW5kKGJvYXJkVmlld01vZGVsKTtcbiAgbGV0IHNvbHZlQ2FsbHMgPSAwO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGJvYXJkVmlld01vZGVsLnNldEF1dG9QbGF5KHRydWUpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRFbmdpbmVQbGF5c0ZvcignYicpO1xuICBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlID0gYXN5bmMgKCkgPT4ge1xuICAgIHNvbHZlQ2FsbHMgKz0gMTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbiAgZW5naW5lVmlld01vZGVsLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5tYWtlTW92ZSgnZTInLCAnZTQnKSwgdHJ1ZSk7XG4gIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgc2V0VGltZW91dChyZXNvbHZlLCA5MDApO1xuICB9KTtcblxuICBhc3NlcnQuZXF1YWwoc29sdmVDYWxscywgMSk7XG5cbiAgYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSA9IG9yaWdpbmFsU29sdmVOZXh0TW92ZTtcbn0pO1xuXG50ZXN0KCdhdXRvcGxheSBzdGlsbCBwbGF5cyBibGFjayB3aGVuIHBsYXllci1tb3ZlIGJhY2tncm91bmQgYW5hbHlzaXMgaXMgcGVuZGluZycsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwsIGVuZ2luZVZpZXdNb2RlbCwgdWlTdGF0ZVZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGNvbnN0IG9yaWdpbmFsSW5pdGlhbGl6ZSA9IGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplLmJpbmQoZW5naW5lVmlld01vZGVsKTtcbiAgY29uc3Qgb3JpZ2luYWxBbmFseXplUG9zaXRpb24gPSBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uLmJpbmQoZW5naW5lVmlld01vZGVsKTtcbiAgY29uc3Qgb3JpZ2luYWxQaWNrTW92ZSA9IGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcy5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG4gIGNvbnN0IG9yaWdpbmFsQXV0b1BsYXlTcGVlZCA9IHVpU3RhdGVWaWV3TW9kZWwuYXV0b1BsYXlTcGVlZDtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRBdXRvUGxheSh0cnVlKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0RW5naW5lUGxheXNGb3IoJ2InKTtcbiAgdWlTdGF0ZVZpZXdNb2RlbC5zZXRBdXRvUGxheVNwZWVkKCdmYXN0Jyk7XG5cbiAgZW5naW5lVmlld01vZGVsLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSA9IGFzeW5jICgpID0+IHVuZGVmaW5lZDtcbiAgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbiA9IGFzeW5jIChmZW46IHN0cmluZywgX2RlcHRoPzogbnVtYmVyLCBfbXVsdGlQVj86IG51bWJlciwgcHVycG9zZSA9ICdiYWNrZ3JvdW5kJykgPT4ge1xuICAgIGlmIChwdXJwb3NlID09PSAnYmFja2dyb3VuZCcpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoKSA9PiB1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICByZXF1ZXN0SWQ6IDEsXG4gICAgICBhbmFseXplZEZlbjogZmVuLFxuICAgICAgbW92ZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1vdmU6ICdlN2U1JyxcbiAgICAgICAgICBldmFsdWF0aW9uOiAyMCxcbiAgICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgICBwdjogWydlN2U1J10sXG4gICAgICAgICAgbXVsdGlwdjogMSxcbiAgICAgICAgICBkZXB0aDogOCxcbiAgICAgICAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBjb21wbGV4aXR5OiB7XG4gICAgICAgIGxldmVsOiAnbG93JyxcbiAgICAgICAgc2NvcmU6IDAuMixcbiAgICAgICAgc3ByZWFkOiAxMixcbiAgICAgICAgY2xvc2VDYW5kaWRhdGVzOiAxLFxuICAgICAgICB2b2xhdGlsaXR5OiA4LFxuICAgICAgfSxcbiAgICAgIGlnbm9yZWQ6IGZhbHNlLFxuICAgICAgZnJvbUNhY2hlOiBmYWxzZSxcbiAgICAgIHB1cnBvc2U6ICdlbmdpbmVNb3ZlJyxcbiAgICB9O1xuICB9O1xuICBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMgPSAoKSA9PiAoe1xuICAgIG1vdmU6IHtcbiAgICAgIG1vdmU6ICdlN2U1JyxcbiAgICAgIGV2YWx1YXRpb246IDIwLFxuICAgICAgZXZhbExvc3M6IDAsXG4gICAgICBwdjogWydlN2U1J10sXG4gICAgICBtdWx0aXB2OiAxLFxuICAgICAgZGVwdGg6IDgsXG4gICAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICB9LFxuICAgIGJ1Y2tldDogJ2Jlc3QnLFxuICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgfSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlKCdlMicsICdlNCcpLCB0cnVlKTtcblxuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKTtcbiAgfSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmhpc3RvcnkubGVuZ3RoLCAyKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmhpc3RvcnlbMV0/LnNhbiwgJ2U1Jyk7XG5cbiAgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUgPSBvcmlnaW5hbEluaXRpYWxpemU7XG4gIGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24gPSBvcmlnaW5hbEFuYWx5emVQb3NpdGlvbjtcbiAgZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzID0gb3JpZ2luYWxQaWNrTW92ZTtcbiAgdWlTdGF0ZVZpZXdNb2RlbC5zZXRBdXRvUGxheVNwZWVkKG9yaWdpbmFsQXV0b1BsYXlTcGVlZCk7XG59KTtcblxudGVzdCgnc3RhcnRBdXRvUGxheVR1cm4gbGV0cyB0aGUgd2hpdGUgZW5naW5lIGJlZ2luIHRoZSBnYW1lIG1hbnVhbGx5JywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGNvbnN0IG9yaWdpbmFsU29sdmVOZXh0TW92ZSA9IGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUuYmluZChib2FyZFZpZXdNb2RlbCk7XG4gIGxldCBhdXRvVHJpZ2dlcmVkQXJndW1lbnQ6IGJvb2xlYW4gfCBudWxsID0gbnVsbDtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRBdXRvUGxheSh0cnVlKTtcbiAgYm9hcmRWaWV3TW9kZWwuc2V0RW5naW5lUGxheXNGb3IoJ3cnKTtcbiAgYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSA9IGFzeW5jIChhdXRvVHJpZ2dlcmVkID0gZmFsc2UpID0+IHtcbiAgICBhdXRvVHJpZ2dlcmVkQXJndW1lbnQgPSBhdXRvVHJpZ2dlcmVkO1xuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5jYW5TdGFydEF1dG9QbGF5VHVybiwgdHJ1ZSk7XG4gIGF3YWl0IGJvYXJkVmlld01vZGVsLnN0YXJ0QXV0b1BsYXlUdXJuKCk7XG4gIGFzc2VydC5lcXVhbChhdXRvVHJpZ2dlcmVkQXJndW1lbnQsIHRydWUpO1xuXG4gIGJvYXJkVmlld01vZGVsLnNvbHZlTmV4dE1vdmUgPSBvcmlnaW5hbFNvbHZlTmV4dE1vdmU7XG59KTtcblxudGVzdCgnc3RhcnRBdXRvUGxheVR1cm4gaXMgYXZhaWxhYmxlIGZvciBhIGJsYWNrIGVuZ2luZSBhZnRlciB0aGUgcGxheWVyIG1vdmUnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgY29uc3Qgb3JpZ2luYWxTb2x2ZU5leHRNb3ZlID0gYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZS5iaW5kKGJvYXJkVmlld01vZGVsKTtcbiAgbGV0IGF1dG9UcmlnZ2VyZWRBcmd1bWVudDogYm9vbGVhbiB8IG51bGwgPSBudWxsO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGJvYXJkVmlld01vZGVsLnNldEF1dG9QbGF5KHRydWUpO1xuICBib2FyZFZpZXdNb2RlbC5zZXRFbmdpbmVQbGF5c0ZvcignYicpO1xuICBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlID0gYXN5bmMgKGF1dG9UcmlnZ2VyZWQgPSBmYWxzZSkgPT4ge1xuICAgIGF1dG9UcmlnZ2VyZWRBcmd1bWVudCA9IGF1dG9UcmlnZ2VyZWQ7XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlKCdlMicsICdlNCcpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmNhblN0YXJ0QXV0b1BsYXlUdXJuLCB0cnVlKTtcblxuICBhd2FpdCBib2FyZFZpZXdNb2RlbC5zdGFydEF1dG9QbGF5VHVybigpO1xuICBhc3NlcnQuZXF1YWwoYXV0b1RyaWdnZXJlZEFyZ3VtZW50LCB0cnVlKTtcblxuICBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlID0gb3JpZ2luYWxTb2x2ZU5leHRNb3ZlO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFRTyxTQUFTLHVCQUNkLFdBQ0EsaUJBQ1M7QUFDVCxTQUFPLGNBQWM7QUFDdkI7QUFFTyxTQUFTLHFCQUNkLFlBQ0EsYUFDUztBQUNULFNBQU8sZUFBZTtBQUN4QjtBQXBCQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFTTyxTQUFTLHNCQUNkLEtBQ0EsT0FDQSxTQUNRO0FBQ1IsU0FBTyxHQUFHLEdBQUcsVUFBVSxLQUFLLFlBQVksT0FBTztBQUNqRDtBQWZBLElBaUJhLGVBcURBO0FBdEViO0FBQUE7QUFBQTtBQWlCTyxJQUFNLGdCQUFOLE1BQW9CO0FBQUEsTUFHekIsWUFBb0IsVUFBa0IsS0FBSztBQUF2QjtBQUFBLE1BQXdCO0FBQUEsTUFGcEMsVUFBVSxvQkFBSSxJQUFnQztBQUFB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QUEsZ0JBQWUsZ0JBQWdCLE9BQU8sZ0JBQWdCLFVBQVU7QUFDOUQsNEJBQXdCO0FBQ3hCLFdBQU87QUFBQSxFQUNUO0FBRUEsU0FBTyxNQUFNQSxnQkFBZSxTQUFTLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFDdEQsU0FBTyxNQUFNQSxnQkFBZSxzQkFBc0IsSUFBSTtBQUV0RCxRQUFNQSxnQkFBZSxrQkFBa0I7QUFDdkMsU0FBTyxNQUFNLHVCQUF1QixJQUFJO0FBRXhDLEVBQUFBLGdCQUFlLGdCQUFnQjtBQUNqQyxDQUFDOyIsCiAgIm5hbWVzIjogWyJDaGVzcyIsICJQSUVDRV9WQUxVRVMiLCAiQlVDS0VUX09SREVSIiwgIkNoZXNzIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJhY3Rpb24iLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJyZWFjdGlvbiIsICJhY3Rpb24iLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJhY3Rpb24iLCAicmVhY3Rpb24iLCAicnVuSW5BY3Rpb24iLCAiQ2hlc3MiLCAibG9nZ2VyIiwgInBnbiIsICJhY3Rpb24iLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgInJlYWN0aW9uIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJhY3Rpb24iLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImNhbkFwcGx5QW5hbHl6ZWRNb3ZlIiwgImlzU3RhbGVBbmFseXNpc1JlcXVlc3QiLCAiQW5hbHlzaXNDYWNoZSIsICJidWlsZEFuYWx5c2lzQ2FjaGVLZXkiLCAiYnVpbGREZXRlcm1pbmlzdGljU2VlZCIsICJjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2UiLCAicmVzb2x2ZVBnblN0YXJ0RmVuIiwgImRlcml2ZUJyaWxsaWFudFVzYWdlIiwgImJvYXJkVmlld01vZGVsIiwgImZlYXR1cmVPcHRpb25zVmlld01vZGVsIiwgIlBSRURFRklORURfT1BFTklOR1MiLCAiZW5naW5lVmlld01vZGVsIiwgImNvbmZpZ1ZpZXdNb2RlbCIsICJFbmdpbmVWaWV3TW9kZWwiLCAibW92ZVN0b2NrZmlzaFNlcnZpY2UiLCAiYW5hbHlzaXNTdG9ja2Zpc2hTZXJ2aWNlIiwgIkJvYXJkVmlld01vZGVsIiwgImFuYWx5c2lzQ2FjaGUiLCAiUGVyc29uYVByb2ZpbGVzVmlld01vZGVsIiwgIkRFRkFVTFRfQlVDS0VUX0NPTkZJRyIsICJERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyIsICJHQU1FX1NFVFVQX1BSRVNFVFMiLCAiZmlsdGVyR2FtZVNldHVwUHJlc2V0cyIsICJ0b0NvbXBhdGlibGVPcGVuaW5nUHJlc2V0IiwgImdldEdhbWVTZXR1cFByZXNldEJ5SWQiLCAiYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSIsICJHYW1lQW5hbHl0aWNzVmlld01vZGVsIiwgInVpU3RhdGVWaWV3TW9kZWwiXQp9Cg==
