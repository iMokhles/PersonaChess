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
  stockfishService: () => stockfishService
});
var logger, StockfishService, stockfishService;
var init_stockfish_service = __esm({
  "src/engine/stockfish.service.ts"() {
    "use strict";
    init_debug();
    logger = createDebugLogger("StockfishService");
    StockfishService = class {
      worker = null;
      messageHandlers = /* @__PURE__ */ new Set();
      isReady = false;
      readyResolvers = [];
      multiPV = 12;
      depth = 20;
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
              logger.error("Worker error:", error);
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
          logger.debug("Message:", message);
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
            logger.debug("Completing analysis, collected", moves.size, "moves");
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
              logger.debug("Returning", analyzedMoves.length, "analyzed moves");
              resolve(analyzedMoves);
            } else {
              logger.debug("No moves collected - likely game over position");
              resolve([]);
            }
          };
          const forceStopTimeout = setTimeout(() => {
            if (!hasReceivedBestMove) {
              logger.warn("Forcing stop after 10 seconds to get bestmove");
              this.sendCommand("stop");
              setTimeout(() => {
                if (!hasReceivedBestMove) {
                  logger.warn("No bestmove after stop, using collected moves");
                  completeAnalysis();
                }
              }, 1e3);
            }
          }, 1e4);
          const absoluteTimeout = setTimeout(() => {
            if (!hasReceivedBestMove) {
              logger.error("Analysis timeout after 30 seconds");
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
                logger.debug("Detected mate score:", mateIn);
                if (mateIn <= 0) {
                  logger.debug("Game over position detected (checkmate/stalemate)");
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
                    logger.debug("Reached target depth, stopping early");
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
                  logger.debug("No legal moves (checkmate/stalemate)");
                  resolve([]);
                  return;
                }
              }
              logger.debug("Received bestmove, collected", moves.size, "moves");
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
                logger.debug("No moves in bestmove response - game over position");
                resolve([]);
              } else {
                logger.debug("Returning", analyzedMoves.length, "analyzed moves");
                resolve(analyzedMoves);
              }
            }
          };
          this.addMessageHandler(analysisHandler);
          const readyHandler = (msg) => {
            if (msg === "readyok") {
              this.removeMessageHandler(readyHandler);
              logger.debug("Engine ready, sending position and starting analysis");
              this.sendCommand(`position fen ${fen}`);
              this.sendCommand(`go depth ${this.depth}`);
            }
          };
          this.addMessageHandler(readyHandler);
          logger.debug("Starting analysis for FEN:", fen, "MultiPV=", this.multiPV, "Depth=", this.depth);
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
    stockfishService = new StockfishService();
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
var logger2, EngineViewModel, engineViewModel;
var init_EngineViewModel = __esm({
  "src/viewmodels/EngineViewModel.ts"() {
    "use strict";
    init_analysisSafety();
    init_stockfish_service();
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
    logger2 = createDebugLogger("EngineViewModel");
    EngineViewModel = class {
      isInitialized = false;
      isInitializing = false;
      isAnalyzing = false;
      analyzedMoves = [];
      lastPickedMove = null;
      error = null;
      lastComplexity = null;
      lastAnalysisFromCache = false;
      lastAnalysisPurpose = null;
      nextRequestIds = {
        engineMove: 0,
        background: 0
      };
      latestRequestIds = {
        engineMove: 0,
        background: 0
      };
      activeAnalysisRun = null;
      constructor() {
        makeAutoObservable2(this, {
          initialize: action2,
          analyzePosition: action2,
          pickMoveFromAnalysis: action2,
          reset: action2,
          setError: action2
        });
        logger2.debug("Initialized");
      }
      /**
       * Initialize the Stockfish engine
       */
      async initialize() {
        if (this.isInitialized) {
          logger2.debug("Already initialized");
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
          logger2.debug("Initialization complete");
        } catch (err) {
          logger2.error("Initialization error:", err);
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
        logger2.debug("Configuring:", options);
        stockfishService.configure(options);
      }
      /**
       * Analyze a position and classify moves
       */
      async analyzePosition(fen, depth = 20, multiPV = 12, purpose = "background") {
        logger2.debug("analyzePosition called", { fen, depth, multiPV, purpose });
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
                ignored: isStaleAnalysisRequest(requestId, this.latestRequestIds[purpose]) || sharedResult.ignored
              };
            }
            if (purpose === "engineMove") {
              this.latestRequestIds[this.activeAnalysisRun.purpose] += 1;
              stockfishService.stop();
              await this.activeAnalysisRun.promise.catch(() => void 0);
            }
            if (purpose === "background") {
              await this.activeAnalysisRun.promise.catch(() => void 0);
            }
          }
          runInAction(() => {
            this.isAnalyzing = true;
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
            purpose
          });
          this.activeAnalysisRun = {
            cacheKey,
            fen,
            purpose,
            promise: runPromise
          };
          try {
            return await runPromise;
          } finally {
            if (this.activeAnalysisRun?.promise === runPromise) {
              this.activeAnalysisRun = null;
            }
          }
        } catch (err) {
          logger2.error("Analysis error:", err);
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
      pickMoveFromAnalysis(analysis, config, context) {
        logger2.debug("pickMoveFromAnalysis called", {
          analyzedMovesCount: analysis.moves.length,
          config
        });
        if (analysis.ignored || analysis.moves.length === 0) {
          logger2.debug("No analyzed moves available");
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
        logger2.debug("Picked move:", result);
        runInAction(() => {
          this.lastPickedMove = result;
        });
        return result;
      }
      /**
       * Stop current analysis
       */
      stopAnalysis() {
        logger2.debug("stopAnalysis called");
        stockfishService.stop();
        runInAction(() => {
          this.isAnalyzing = false;
        });
      }
      /**
       * Start a new game
       */
      newGame() {
        logger2.debug("newGame called");
        stockfishService.newGame();
        this.reset();
      }
      /**
       * Reset state
       */
      reset() {
        logger2.debug("reset called");
        this.analyzedMoves = [];
        this.lastPickedMove = null;
        this.lastComplexity = null;
        this.lastAnalysisFromCache = false;
        this.lastAnalysisPurpose = null;
        this.error = null;
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
        logger2.debug("destroy called");
        stockfishService.destroy();
        runInAction(() => {
          this.isInitialized = false;
        });
      }
      async performPositionAnalysis(options) {
        const { fen, depth, multiPV, cacheKey, requestId, purpose } = options;
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
          stockfishService.configure({ depth, multiPV });
          logger2.debug("Starting analysis...");
          moves = await stockfishService.analyzePosition(fen);
          logger2.debug("Analysis complete, got", moves.length, "moves");
          if (featureOptionsViewModel.useMoveAnalysisCache) {
            analysisCache.set({
              key: cacheKey,
              moves,
              timestamp: Date.now()
            });
          }
        } else {
          logger2.debug("Using cached analysis for current position");
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
        if (this.isAnalyzing) {
          return this.lastAnalysisPurpose === "background" ? "Running background analysis" : "Analyzing position";
        }
        if (!this.isInitialized) {
          return "Not initialized";
        }
        if (this.lastAnalysisPurpose === null) {
          return "Ready";
        }
        return this.lastAnalysisFromCache ? "Ready (cache warm)" : "Ready";
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
var logger3, BoardViewModel, boardViewModel;
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
    logger3 = createDebugLogger("BoardViewModel");
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
        logger3.debug("Initialized with FEN:", this.fen);
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
        if (enabled && this.canScheduleAutoPlay) {
          this.scheduleAutoPlayMove();
        } else if (this.canScheduleAutoPlay) {
          this.clearAutoPlaySchedule();
        }
        logger3.debug("Auto-play set to:", enabled);
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
        } else if (this.canScheduleAutoPlay) {
          this.scheduleAutoPlayMove();
        }
      }
      toggleAutoPlayPause() {
        this.setAutoPlayPaused(!this.autoPlayPaused);
      }
      /**
       * Set which side the engine plays for
       */
      setEnginePlaysFor(side) {
        this.enginePlaysFor = side;
        logger3.debug("Engine plays for:", side === "w" ? "White" : "Black");
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
          logger3.debug("loadFen called:", fen);
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
          this.updateState();
          this.statusMessage = "Position loaded";
          this.lastSkippedEngineMoveMessage = null;
          this.clearAutoPlaySchedule();
          this.autoPlayPaused = false;
          this.recentMoveFeedback = null;
          engineViewModel.reset();
          logger3.debug("FEN loaded successfully");
          return true;
        } catch (err) {
          logger3.error("loadFen error:", err);
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
          logger3.debug("loadPgn called");
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
          this.updateState();
          this.statusMessage = "PGN loaded";
          this.lastSkippedEngineMoveMessage = null;
          this.clearAutoPlaySchedule();
          this.autoPlayPaused = false;
          this.recentMoveFeedback = null;
          engineViewModel.reset();
          return true;
        } catch (err) {
          logger3.error("loadPgn error:", err);
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
        logger3.debug("makeMove called", { from, to, promotion, currentFen: this.fen, currentTurn: this.chess.turn() });
        try {
          const move = this.chess.move({
            from,
            to,
            promotion
          });
          if (move) {
            logger3.debug("Move successful:", move.san);
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
            this.analyzePlayerMove(move);
            if (this.autoPlayEnabled && !this.isGameOver && this.chess.turn() === this.enginePlaysFor) {
              logger3.debug("Scheduling auto-play for engine side:", this.enginePlaysFor);
              this.scheduleAutoPlayMove();
            }
            return true;
          } else {
            logger3.debug("Move failed - chess.js returned null");
            return false;
          }
        } catch (err) {
          logger3.debug("Move exception:", err);
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
          logger3.error("solveNextMove error:", err);
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
        logger3.debug("reset called");
        this.chess = new Chess4();
        this.beginSessionState({
          gameSessionId: createGameSessionId(),
          gameStartFen: this.chess.fen(),
          resetBrilliantTracking: true,
          setupName: "New Game",
          setupCategory: "custom"
        });
        this.updateState();
        this.lastMove = null;
        this.lastPlayedBucket = null;
        this.statusMessage = "Board reset";
        this.lastSkippedEngineMoveMessage = null;
        this.recentMoveFeedback = null;
        this.clearAutoPlaySchedule();
        this.autoPlayPaused = false;
        engineViewModel.reset();
        logger3.debug("Board reset, new FEN:", this.fen);
      }
      /**
       * Undo the last move (or last two moves if auto-play is on and engine just moved)
       */
      undo() {
        logger3.debug("undo called, history length:", this.history.length);
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
              engineViewModel.reset();
              logger3.debug("Undid 2 moves");
              return true;
            }
          } else {
            if (this.undoMoves(1)) {
              this.updateState();
              this.lastMove = null;
              this.lastPlayedBucket = null;
              this.statusMessage = "Move undone";
              this.clearAutoPlaySchedule();
              engineViewModel.reset();
              logger3.debug("Undid 1 move");
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
            engineViewModel.reset();
            logger3.debug("Undid 1 move");
            return true;
          }
        }
        logger3.debug("Undo failed - no moves to undo");
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
        logger3.debug("updateState - FEN:", this.fen, "History length:", this.history.length);
        if (this.showMoveArrows && !this.isGameOver && !this.isAnalyzingMoves) {
          this._analyzedLegalMoves = {};
          if (this._analysisTimeout) {
            clearTimeout(this._analysisTimeout);
          }
          this._analysisTimeout = setTimeout(() => {
            this.analyzeAllMoves().catch((err) => {
              logger3.error("Failed to analyze moves:", err);
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
        logger3.debug("Board flipped, orientation:", this.boardFlipped ? "black" : "white", "Engine now plays for:", this.enginePlaysFor === "w" ? "White" : "Black");
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
          logger3.debug("Saved FEN to history, total entries:", history.length);
        } catch (err) {
          logger3.error("Failed to save FEN to history:", err);
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
              logger3.debug("Restored FEN from storage:", savedFen);
            } catch (err) {
              logger3.warn("Saved FEN is invalid, using default:", err);
              localStorage.removeItem(this.FEN_STORAGE_KEY);
            }
          }
        } catch (err) {
          logger3.error("Failed to restore FEN from storage:", err);
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
          logger3.error("Failed to load FEN from history:", err);
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
        logger3.debug("Show arrows for side:", side);
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
          logger3.debug("Analyzed", Object.keys(moveMap).length, "legal moves");
        } catch (err) {
          logger3.error("Failed to analyze moves:", err);
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
              logger3.debug("Player move quality:", analyzedMove.bucket);
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
            logger3.error("Failed to analyze player move:", err);
          }
        }, 100);
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
            logger3.debug("Skipping invalid move:", move);
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
          logger3.debug(`Added ${bucketArrows.length} ${bucket} arrows (found ${movesByBucket[bucket].length} total)`);
        }
        logger3.debug("Generated", arrows.length, "total arrows");
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
        logger3.debug("undoSingle called, history length:", this.history.length);
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
          engineViewModel.reset();
          logger3.debug("Undid 1 move, redo stack size:", this.redoStack.length);
          return true;
        }
        return false;
      }
      /**
       * Redo a single move
       */
      redoSingle() {
        logger3.debug("redoSingle called, redo stack size:", this.redoStack.length);
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
            engineViewModel.reset();
            logger3.debug("Redid 1 move");
            if (this.autoPlayEnabled && !this.isGameOver && this.chess.turn() === this.enginePlaysFor) {
              logger3.debug("Scheduling auto-play after redo");
              this.scheduleAutoPlayMove();
            }
            return true;
          }
        } catch (err) {
          logger3.error("Redo failed:", err);
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
            logger3.error("Auto-play error:", err);
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
          logger3.error("Failed to clear board state storage:", error);
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
  const { stockfishService: stockfishService2 } = await Promise.resolve().then(() => (init_stockfish_service(), stockfish_service_exports));
  const engine = new EngineViewModel2();
  const originalInitialize = engine.initialize.bind(engine);
  const originalAnalyze = stockfishService2.analyzePosition.bind(stockfishService2);
  const originalConfigure = stockfishService2.configure.bind(stockfishService2);
  const originalStop = stockfishService2.stop.bind(stockfishService2);
  let releaseAnalysis = null;
  let analyzeCalls = 0;
  engine.isInitialized = true;
  engine.initialize = async () => void 0;
  stockfishService2.configure = () => void 0;
  stockfishService2.stop = () => void 0;
  stockfishService2.analyzePosition = async () => {
    analyzeCalls += 1;
    await new Promise((resolve) => {
      releaseAnalysis = resolve;
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
  const engineMovePromise = engine.analyzePosition("fen-shared", 10, 2, "engineMove");
  await new Promise((resolve) => setTimeout(resolve, 0));
  const backgroundPromise = engine.analyzePosition("fen-shared", 10, 2, "background");
  releaseAnalysis?.();
  const [engineMoveResult, backgroundResult] = await Promise.all([engineMovePromise, backgroundPromise]);
  assert.equal(analyzeCalls, 1);
  assert.equal(engineMoveResult.ignored, false);
  assert.equal(backgroundResult.ignored, false);
  assert.equal(backgroundResult.analyzedFen, "fen-shared");
  engine.initialize = originalInitialize;
  stockfishService2.analyzePosition = originalAnalyze;
  stockfishService2.configure = originalConfigure;
  stockfishService2.stop = originalStop;
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
test("cache-hit indicator reflects whether analysis came from cache", async () => {
  localStorageMock.clear();
  const { EngineViewModel: EngineViewModel2, featureOptionsViewModel: featureOptionsViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
  const { stockfishService: stockfishService2 } = await Promise.resolve().then(() => (init_stockfish_service(), stockfish_service_exports));
  const { analysisCache: analysisCache2 } = await Promise.resolve().then(() => (init_analysisCache(), analysisCache_exports));
  const engine = new EngineViewModel2();
  const originalInitialize = engine.initialize.bind(engine);
  const originalAnalyze = stockfishService2.analyzePosition.bind(stockfishService2);
  const originalConfigure = stockfishService2.configure.bind(stockfishService2);
  featureOptionsViewModel2.resetToDefaults();
  featureOptionsViewModel2.setOption("useMoveAnalysisCache", true);
  analysisCache2.invalidate();
  engine.isInitialized = true;
  engine.initialize = async () => void 0;
  stockfishService2.configure = () => void 0;
  stockfishService2.analyzePosition = async () => [
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
  stockfishService2.analyzePosition = originalAnalyze;
  stockfishService2.configure = originalConfigure;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2VuZ2luZS9hbmFseXNpc1NhZmV0eS50cyIsICIuLi8uLi9zcmMvZW5naW5lL2FuYWx5c2lzQ2FjaGUudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9yYW5kb20udHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lU2Vzc2lvbi50cyIsICIuLi8uLi9zcmMvZW5naW5lL2JyaWxsaWFudFRyYWNraW5nLnRzIiwgIi4uLy4uL3NyYy9zaGFyZWQvZGVidWcudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZS50cyIsICIuLi8uLi9zcmMvZW5naW5lL3R5cGVzLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvbW92ZUNsYXNzaWZpZXIudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9tb3ZlUGlja2VyLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvZmVhdHVyZU9wdGlvbnMudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9icmlsbGlhbnRNb3ZlLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvZ2FtZVBoYXNlLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvcG9zaXRpb25Db21wbGV4aXR5LnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvcGVyc29uYUJpYXMudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvRW5naW5lVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL0NvbmZpZ1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9VaVN0YXRlVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL0JvYXJkVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvZ2FtZUFuYWx5dGljcy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9HYW1lQW5hbHl0aWNzVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvb3BlbmluZ3MudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lU2V0dXBQcmVzZXRzLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL0dhbWVTZXR1cFZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9EZWJ1Z1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvZW5naW5lL3BlcnNvbmFQcm9maWxlcy50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9QZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvaW5kZXgudHMiLCAiLi4vcGVyc29uYWNoZXNzLnRlc3QudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBpbnRlcmZhY2UgQW5hbHlzaXNTbmFwc2hvdDxUTW92ZXM+IHtcbiAgcmVxdWVzdElkOiBudW1iZXI7XG4gIGFuYWx5emVkRmVuOiBzdHJpbmc7XG4gIG1vdmVzOiBUTW92ZXM7XG59XG5cbmV4cG9ydCB0eXBlIEFuYWx5c2lzUHVycG9zZSA9ICdlbmdpbmVNb3ZlJyB8ICdiYWNrZ3JvdW5kJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RhbGVBbmFseXNpc1JlcXVlc3QoXG4gIHJlcXVlc3RJZDogbnVtYmVyLFxuICBsYXRlc3RSZXF1ZXN0SWQ6IG51bWJlcixcbik6IGJvb2xlYW4ge1xuICByZXR1cm4gcmVxdWVzdElkICE9PSBsYXRlc3RSZXF1ZXN0SWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5BcHBseUFuYWx5emVkTW92ZShcbiAgY3VycmVudEZlbjogc3RyaW5nLFxuICBhbmFseXplZEZlbjogc3RyaW5nLFxuKTogYm9vbGVhbiB7XG4gIHJldHVybiBjdXJyZW50RmVuID09PSBhbmFseXplZEZlbjtcbn1cbiIsICJpbXBvcnQgeyBBbmFseXplZE1vdmUsIENsYXNzaWZpZWRNb3ZlIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5hbHlzaXNDYWNoZUVudHJ5IHtcbiAga2V5OiBzdHJpbmc7XG4gIG1vdmVzOiBBbmFseXplZE1vdmVbXTtcbiAgY2xhc3NpZmllZE1vdmVzPzogQ2xhc3NpZmllZE1vdmVbXTtcbiAgdGltZXN0YW1wOiBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEFuYWx5c2lzQ2FjaGVLZXkoXG4gIGZlbjogc3RyaW5nLFxuICBkZXB0aDogbnVtYmVyLFxuICBtdWx0aVBWOiBudW1iZXIsXG4pOiBzdHJpbmcge1xuICByZXR1cm4gYCR7ZmVufXxkZXB0aDoke2RlcHRofXxtdWx0aXB2OiR7bXVsdGlQVn1gO1xufVxuXG5leHBvcnQgY2xhc3MgQW5hbHlzaXNDYWNoZSB7XG4gIHByaXZhdGUgZW50cmllcyA9IG5ldyBNYXA8c3RyaW5nLCBBbmFseXNpc0NhY2hlRW50cnk+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtYXhTaXplOiBudW1iZXIgPSAyMDApIHt9XG5cbiAgY29uZmlndXJlKG1heFNpemU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMubWF4U2l6ZSA9IE1hdGgubWF4KDEsIG1heFNpemUpO1xuICAgIHRoaXMudHJpbSgpO1xuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogQW5hbHlzaXNDYWNoZUVudHJ5IHwgbnVsbCB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLmVudHJpZXMuZ2V0KGtleSk7XG5cbiAgICBpZiAoIWVudHJ5KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmVudHJpZXMuZGVsZXRlKGtleSk7XG4gICAgdGhpcy5lbnRyaWVzLnNldChrZXksIGVudHJ5KTtcbiAgICByZXR1cm4gZW50cnk7XG4gIH1cblxuICBzZXQoZW50cnk6IEFuYWx5c2lzQ2FjaGVFbnRyeSk6IHZvaWQge1xuICAgIHRoaXMuZW50cmllcy5zZXQoZW50cnkua2V5LCBlbnRyeSk7XG4gICAgdGhpcy50cmltKCk7XG4gIH1cblxuICBpbnZhbGlkYXRlKGtleT86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChrZXkpIHtcbiAgICAgIHRoaXMuZW50cmllcy5kZWxldGUoa2V5KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmVudHJpZXMuY2xlYXIoKTtcbiAgfVxuXG4gIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllcy5zaXplO1xuICB9XG5cbiAgcHJpdmF0ZSB0cmltKCk6IHZvaWQge1xuICAgIHdoaWxlICh0aGlzLmVudHJpZXMuc2l6ZSA+IHRoaXMubWF4U2l6ZSkge1xuICAgICAgY29uc3Qgb2xkZXN0S2V5ID0gdGhpcy5lbnRyaWVzLmtleXMoKS5uZXh0KCkudmFsdWU7XG5cbiAgICAgIGlmICghb2xkZXN0S2V5KSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVudHJpZXMuZGVsZXRlKG9sZGVzdEtleSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBhbmFseXNpc0NhY2hlID0gbmV3IEFuYWx5c2lzQ2FjaGUoKTtcbiIsICJpbXBvcnQgeyBQZXJzb25hSWQgfSBmcm9tICcuL2ZlYXR1cmVPcHRpb25zJztcblxuZXhwb3J0IGludGVyZmFjZSBSYW5kb21Tb3VyY2Uge1xuICBuZXh0KCk6IG51bWJlcjtcbn1cblxuZnVuY3Rpb24gaGFzaFN0cmluZyhpbnB1dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGhhc2ggPSAyMTY2MTM2MjYxO1xuXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBpbnB1dC5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBoYXNoIF49IGlucHV0LmNoYXJDb2RlQXQoaW5kZXgpO1xuICAgIGhhc2ggPSBNYXRoLmltdWwoaGFzaCwgMTY3Nzc2MTkpO1xuICB9XG5cbiAgcmV0dXJuIGhhc2ggPj4+IDA7XG59XG5cbmZ1bmN0aW9uIG11bGJlcnJ5MzIoc2VlZDogbnVtYmVyKTogKCkgPT4gbnVtYmVyIHtcbiAgbGV0IHZhbHVlID0gc2VlZCA+Pj4gMDtcblxuICByZXR1cm4gKCkgPT4ge1xuICAgIHZhbHVlICs9IDB4NmQyYjc5ZjU7XG4gICAgbGV0IHJlc3VsdCA9IE1hdGguaW11bCh2YWx1ZSBeICh2YWx1ZSA+Pj4gMTUpLCB2YWx1ZSB8IDEpO1xuICAgIHJlc3VsdCBePSByZXN1bHQgKyBNYXRoLmltdWwocmVzdWx0IF4gKHJlc3VsdCA+Pj4gNyksIHJlc3VsdCB8IDYxKTtcbiAgICByZXR1cm4gKChyZXN1bHQgXiAocmVzdWx0ID4+PiAxNCkpID4+PiAwKSAvIDQyOTQ5NjcyOTY7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMZWdhY3lSYW5kb21Tb3VyY2UoKTogUmFuZG9tU291cmNlIHtcbiAgcmV0dXJuIHtcbiAgICBuZXh0OiAoKSA9PiBNYXRoLnJhbmRvbSgpLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlKHNlZWQ6IHN0cmluZyk6IFJhbmRvbVNvdXJjZSB7XG4gIGNvbnN0IGdlbmVyYXRvciA9IG11bGJlcnJ5MzIoaGFzaFN0cmluZyhzZWVkKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBuZXh0OiAoKSA9PiBnZW5lcmF0b3IoKSxcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZXRlcm1pbmlzdGljU2VlZENvbnRleHQge1xuICBnYW1lU3RhcnRGZW46IHN0cmluZztcbiAgY3VycmVudEZlbjogc3RyaW5nO1xuICBtb3ZlQ291bnQ6IG51bWJlcjtcbiAgc2lkZVRvTW92ZTogJ3cnIHwgJ2InO1xuICBwZXJzb25hOiBQZXJzb25hSWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZERldGVybWluaXN0aWNTZWVkKHtcbiAgZ2FtZVN0YXJ0RmVuLFxuICBjdXJyZW50RmVuLFxuICBtb3ZlQ291bnQsXG4gIHNpZGVUb01vdmUsXG4gIHBlcnNvbmEsXG59OiBEZXRlcm1pbmlzdGljU2VlZENvbnRleHQpOiBzdHJpbmcge1xuICByZXR1cm4gW2dhbWVTdGFydEZlbiwgY3VycmVudEZlbiwgU3RyaW5nKG1vdmVDb3VudCksIHNpZGVUb01vdmUsIHBlcnNvbmFdLmpvaW4oJ3wnKTtcbn1cbiIsICJpbXBvcnQgeyBNb3ZlQW5ub3RhdGlvbiB9IGZyb20gJy4vYnJpbGxpYW50VHJhY2tpbmcnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBlcnNpc3RlZEJvYXJkU3RhdGUge1xuICBjdXJyZW50RmVuOiBzdHJpbmc7XG4gIGZlbkhpc3Rvcnk6IHN0cmluZ1tdO1xuICBnYW1lU2Vzc2lvbklkOiBzdHJpbmc7XG4gIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICBjdXJyZW50U2V0dXBOYW1lPzogc3RyaW5nO1xuICBjdXJyZW50U2V0dXBDYXRlZ29yeT86IHN0cmluZztcbiAgaGlzdG9yeUFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdO1xuICByZWRvQW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHYW1lU2Vzc2lvbklkKCk6IHN0cmluZyB7XG4gIHJldHVybiBgc2Vzc2lvbl8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDEwKX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBnblN0YXJ0RmVuKFxuICBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudWxsPixcbiAgZmFsbGJhY2tGZW46IHN0cmluZyxcbik6IHN0cmluZyB7XG4gIHJldHVybiBoZWFkZXJzLlNldFVwID09PSAnMScgJiYgdHlwZW9mIGhlYWRlcnMuRkVOID09PSAnc3RyaW5nJ1xuICAgID8gaGVhZGVycy5GRU5cbiAgICA6IGZhbGxiYWNrRmVuO1xufVxuIiwgImV4cG9ydCBpbnRlcmZhY2UgTW92ZUFubm90YXRpb24ge1xuICBiZWZvcmVGZW46IHN0cmluZztcbiAgYWZ0ZXJGZW46IHN0cmluZztcbiAgdWNpOiBzdHJpbmc7XG4gIG1vdmVOdW1iZXI6IG51bWJlcjtcbiAgY29uc3VtZWRCcmlsbGlhbnQ6IGJvb2xlYW47XG4gIGFjdG9yPzogJ3BsYXllcicgfCAnZW5naW5lJyB8ICdyZWRvJztcbiAgc2FuPzogc3RyaW5nO1xuICBidWNrZXQ/OiBzdHJpbmcgfCBudWxsO1xuICBldmFsTG9zcz86IG51bWJlciB8IG51bGw7XG4gIGV2YWx1YXRpb24/OiBudW1iZXIgfCBudWxsO1xuICBjb21wbGV4aXR5TGV2ZWw/OiAnbG93JyB8ICdtZWRpdW0nIHwgJ2hpZ2gnIHwgbnVsbDtcbiAgY29tcGxleGl0eVNjb3JlPzogbnVtYmVyIHwgbnVsbDtcbiAgdGltZXN0YW1wPzogbnVtYmVyO1xuICBkZWxheU1zU2luY2VQcmV2aW91cz86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCcmlsbGlhbnRVc2FnZSB7XG4gIGJyaWxsaWFudFVzZWRDb3VudDogbnVtYmVyO1xuICBicmlsbGlhbnRNb3ZlTnVtYmVyczogbnVtYmVyW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXJpdmVCcmlsbGlhbnRVc2FnZShcbiAgYW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW10sXG4pOiBCcmlsbGlhbnRVc2FnZSB7XG4gIGNvbnN0IGJyaWxsaWFudE1vdmVOdW1iZXJzID0gYW5ub3RhdGlvbnNcbiAgICAuZmlsdGVyKChhbm5vdGF0aW9uKSA9PiBhbm5vdGF0aW9uLmNvbnN1bWVkQnJpbGxpYW50KVxuICAgIC5tYXAoKGFubm90YXRpb24pID0+IGFubm90YXRpb24ubW92ZU51bWJlcik7XG5cbiAgcmV0dXJuIHtcbiAgICBicmlsbGlhbnRVc2VkQ291bnQ6IGJyaWxsaWFudE1vdmVOdW1iZXJzLmxlbmd0aCxcbiAgICBicmlsbGlhbnRNb3ZlTnVtYmVycyxcbiAgfTtcbn1cbiIsICJjb25zdCBERUJVR19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfZGVidWdfbG9nZ2luZyc7XG5cbmZ1bmN0aW9uIHJlYWRCcm93c2VyRGVidWdGbGFnKCk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdpbmRvdy5sb2NhbFN0b3JhZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKERFQlVHX1NUT1JBR0VfS0VZKSA9PT0gJzEnO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFByb2Nlc3NEZWJ1Z0ZsYWcoKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gcHJvY2Vzcy5lbnYuUEVSU09OQUNIRVNTX0RFQlVHID09PSAnMSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RlYnVnTG9nZ2luZ0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gIHJldHVybiByZWFkQnJvd3NlckRlYnVnRmxhZygpIHx8IHJlYWRQcm9jZXNzRGVidWdGbGFnKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWJ1Z0xvZ2dpbmdFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3aW5kb3cubG9jYWxTdG9yYWdlID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShERUJVR19TVE9SQUdFX0tFWSwgJzEnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKERFQlVHX1NUT1JBR0VfS0VZKTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8vIElnbm9yZSBsb2NhbFN0b3JhZ2UgZmFpbHVyZXMgYW5kIGtlZXAgdGhlIGFwcCBydW5uaW5nLlxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEZWJ1Z0xvZ2dlcihzY29wZTogc3RyaW5nKSB7XG4gIHJldHVybiB7XG4gICAgZGVidWc6ICguLi5hcmdzOiB1bmtub3duW10pID0+IHtcbiAgICAgIGlmIChpc0RlYnVnTG9nZ2luZ0VuYWJsZWQoKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhgWyR7c2NvcGV9XWAsIC4uLmFyZ3MpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZXJyb3I6ICguLi5hcmdzOiB1bmtub3duW10pID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFske3Njb3BlfV1gLCAuLi5hcmdzKTtcbiAgICB9LFxuICAgIHdhcm46ICguLi5hcmdzOiB1bmtub3duW10pID0+IHtcbiAgICAgIGNvbnNvbGUud2FybihgWyR7c2NvcGV9XWAsIC4uLmFyZ3MpO1xuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RldmVsb3BtZW50QnVpbGQoKTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgTUFJTl9XSU5ET1dfVklURV9ERVZfU0VSVkVSX1VSTCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gQm9vbGVhbihNQUlOX1dJTkRPV19WSVRFX0RFVl9TRVJWRVJfVVJMKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oaW1wb3J0Lm1ldGEuZW52Py5ERVYpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuIiwgIi8qKlxuICogU3RvY2tmaXNoIFVDSSBFbmdpbmUgU2VydmljZVxuICogTW9kZWwgbGF5ZXIgLSBQdXJlIFR5cGVTY3JpcHQsIG5vIFJlYWN0LCBubyBNb2JYXG4gKiBcbiAqIEhhbmRsZXMgY29tbXVuaWNhdGlvbiB3aXRoIFN0b2NrZmlzaCBXQVNNIGVuZ2luZSB2aWEgV2ViIFdvcmtlclxuICovXG5cbmltcG9ydCB7IEFuYWx5emVkTW92ZSwgU3RvY2tmaXNoSW5mbyB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgY3JlYXRlRGVidWdMb2dnZXIgfSBmcm9tICcuLi9zaGFyZWQvZGVidWcnO1xuXG50eXBlIE1lc3NhZ2VIYW5kbGVyID0gKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZDtcbmNvbnN0IGxvZ2dlciA9IGNyZWF0ZURlYnVnTG9nZ2VyKCdTdG9ja2Zpc2hTZXJ2aWNlJyk7XG5cbmV4cG9ydCBjbGFzcyBTdG9ja2Zpc2hTZXJ2aWNlIHtcbiAgcHJpdmF0ZSB3b3JrZXI6IFdvcmtlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG1lc3NhZ2VIYW5kbGVyczogU2V0PE1lc3NhZ2VIYW5kbGVyPiA9IG5ldyBTZXQoKTtcbiAgcHJpdmF0ZSBpc1JlYWR5ID0gZmFsc2U7XG4gIHByaXZhdGUgcmVhZHlSZXNvbHZlcnM6IEFycmF5PCgpID0+IHZvaWQ+ID0gW107XG4gIHByaXZhdGUgbXVsdGlQViA9IDEyO1xuICBwcml2YXRlIGRlcHRoID0gMjA7XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgU3RvY2tmaXNoIFdBU00gZW5naW5lXG4gICAqL1xuICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBDcmVhdGUgd29ya2VyIHVzaW5nIHN0b2NrZmlzaC5qc1xuICAgICAgICAvLyBJbiBWaXRlLCB3ZSBuZWVkIHRvIHVzZSA/d29ya2VyIHN1ZmZpeCBvciBjcmVhdGUgaW5saW5lIHdvcmtlclxuICAgICAgICBjb25zdCB3b3JrZXJDb2RlID0gYFxuICAgICAgICAgIGltcG9ydFNjcmlwdHMoJyR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0vc3RvY2tmaXNoLmpzJyk7XG4gICAgICAgIGA7XG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbd29ya2VyQ29kZV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnIH0pO1xuICAgICAgICB0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIoVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XG5cbiAgICAgICAgdGhpcy53b3JrZXIub25tZXNzYWdlID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gdHlwZW9mIGV2ZW50LmRhdGEgPT09ICdzdHJpbmcnID8gZXZlbnQuZGF0YSA6IFN0cmluZyhldmVudC5kYXRhKTtcbiAgICAgICAgICB0aGlzLmhhbmRsZU1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy53b3JrZXIub25lcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignV29ya2VyIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFdhaXQgZm9yIFVDSSBpbml0aWFsaXphdGlvblxuICAgICAgICBjb25zdCByZWFkeUhhbmRsZXIgPSAobXNnOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBpZiAobXNnID09PSAndWNpb2snKSB7XG4gICAgICAgICAgICB0aGlzLmlzUmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihyZWFkeUhhbmRsZXIpO1xuICAgICAgICAgICAgdGhpcy5yZWFkeVJlc29sdmVycy5mb3JFYWNoKHIgPT4gcigpKTtcbiAgICAgICAgICAgIHRoaXMucmVhZHlSZXNvbHZlcnMgPSBbXTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5hZGRNZXNzYWdlSGFuZGxlcihyZWFkeUhhbmRsZXIpO1xuICAgICAgICBcbiAgICAgICAgLy8gU21hbGwgZGVsYXkgdG8gZW5zdXJlIHdvcmtlciBpcyByZWFkeVxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLnNlbmRDb21tYW5kKCd1Y2knKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgZW5naW5lIGluc3RhbmNlXG4gICAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgdGhpcy53b3JrZXIudGVybWluYXRlKCk7XG4gICAgICB0aGlzLndvcmtlciA9IG51bGw7XG4gICAgICB0aGlzLmlzUmVhZHkgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlcnMuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIFVDSSBjb21tYW5kIHRvIGVuZ2luZVxuICAgKi9cbiAgcHJpdmF0ZSBzZW5kQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMud29ya2VyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0b2NrZmlzaCBub3QgaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoY29tbWFuZCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGluY29taW5nIG1lc3NhZ2UgZnJvbSBlbmdpbmVcbiAgICovXG4gIHByaXZhdGUgaGFuZGxlTWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAobWVzc2FnZSAmJiAobWVzc2FnZS5zdGFydHNXaXRoKCdiZXN0bW92ZScpIHx8IG1lc3NhZ2UgPT09ICdyZWFkeW9rJyB8fCBtZXNzYWdlID09PSAndWNpb2snKSkge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdNZXNzYWdlOicsIG1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVycy5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlcihtZXNzYWdlKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbWVzc2FnZSBoYW5kbGVyXG4gICAqL1xuICBhZGRNZXNzYWdlSGFuZGxlcihoYW5kbGVyOiBNZXNzYWdlSGFuZGxlcik6IHZvaWQge1xuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzLmFkZChoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBtZXNzYWdlIGhhbmRsZXJcbiAgICovXG4gIHJlbW92ZU1lc3NhZ2VIYW5kbGVyKGhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyKTogdm9pZCB7XG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlcnMuZGVsZXRlKGhhbmRsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIGVuZ2luZSB0byBiZSByZWFkeVxuICAgKi9cbiAgYXN5bmMgd2FpdEZvclJlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmlzUmVhZHkpIHJldHVybjtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnJlYWR5UmVzb2x2ZXJzLnB1c2gocmVzb2x2ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IE11bHRpUFYgb3B0aW9uXG4gICAqL1xuICBzZXRNdWx0aVBWKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLm11bHRpUFYgPSB2YWx1ZTtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSB7XG4gICAgICB0aGlzLnNlbmRDb21tYW5kKGBzZXRvcHRpb24gbmFtZSBNdWx0aVBWIHZhbHVlICR7dmFsdWV9YCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBzZWFyY2ggZGVwdGhcbiAgICovXG4gIHNldERlcHRoKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmRlcHRoID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlIGVuZ2luZSBvcHRpb25zXG4gICAqL1xuICBjb25maWd1cmUob3B0aW9uczogeyBtdWx0aVBWPzogbnVtYmVyOyBkZXB0aD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgaWYgKG9wdGlvbnMubXVsdGlQViAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNldE11bHRpUFYob3B0aW9ucy5tdWx0aVBWKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGVwdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXREZXB0aChvcHRpb25zLmRlcHRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSBhIHBvc2l0aW9uIGFuZCByZXR1cm4gYWxsIGNhbmRpZGF0ZSBtb3Zlc1xuICAgKi9cbiAgYXN5bmMgYW5hbHl6ZVBvc2l0aW9uKGZlbjogc3RyaW5nKTogUHJvbWlzZTxBbmFseXplZE1vdmVbXT4ge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvclJlYWR5KCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IG1vdmVzOiBNYXA8bnVtYmVyLCBTdG9ja2Zpc2hJbmZvPiA9IG5ldyBNYXAoKTtcbiAgICAgIGxldCBiZXN0U2NvcmUgPSAwO1xuICAgICAgbGV0IGhhc1JlY2VpdmVkQmVzdE1vdmUgPSBmYWxzZTtcbiAgICAgIGxldCBtYXhEZXB0aFJlYWNoZWQgPSAwO1xuXG4gICAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29tcGxldGUgYW5hbHlzaXMgd2l0aCBjb2xsZWN0ZWQgbW92ZXNcbiAgICAgIGNvbnN0IGNvbXBsZXRlQW5hbHlzaXMgPSAoKSA9PiB7XG4gICAgICAgIGlmIChoYXNSZWNlaXZlZEJlc3RNb3ZlKSByZXR1cm47XG4gICAgICAgIGhhc1JlY2VpdmVkQmVzdE1vdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG5cbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdDb21wbGV0aW5nIGFuYWx5c2lzLCBjb2xsZWN0ZWQnLCBtb3Zlcy5zaXplLCAnbW92ZXMnKTtcblxuICAgICAgICAvLyBDb252ZXJ0IHRvIEFuYWx5emVkTW92ZSBhcnJheVxuICAgICAgICBjb25zdCBhbmFseXplZE1vdmVzOiBBbmFseXplZE1vdmVbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gdGhpcy5tdWx0aVBWOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gbW92ZXMuZ2V0KGkpO1xuICAgICAgICAgIGlmIChpbmZvICYmIGluZm8ucHYubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZXZhbExvc3MgPSBNYXRoLmFicyhiZXN0U2NvcmUgLSBpbmZvLnNjb3JlKTtcbiAgICAgICAgICAgIGFuYWx5emVkTW92ZXMucHVzaCh7XG4gICAgICAgICAgICAgIG1vdmU6IGluZm8ucHZbMF0sXG4gICAgICAgICAgICAgIGV2YWx1YXRpb246IGluZm8uc2NvcmUsXG4gICAgICAgICAgICAgIGV2YWxMb3NzLFxuICAgICAgICAgICAgICBwdjogaW5mby5wdixcbiAgICAgICAgICAgICAgbXVsdGlwdjogaW5mby5tdWx0aXB2LFxuICAgICAgICAgICAgICBkZXB0aDogaW5mby5kZXB0aCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhbmFseXplZE1vdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ1JldHVybmluZycsIGFuYWx5emVkTW92ZXMubGVuZ3RoLCAnYW5hbHl6ZWQgbW92ZXMnKTtcbiAgICAgICAgICByZXNvbHZlKGFuYWx5emVkTW92ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXMgYSBnYW1lIG92ZXIgcG9zaXRpb24gKGNoZWNrbWF0ZS9zdGFsZW1hdGUpXG4gICAgICAgICAgLy8gSWYgd2UgcmVjZWl2ZWQgbWF0ZSBzY29yZXMgYnV0IG5vIG1vdmVzLCBpdCdzIGdhbWUgb3ZlclxuICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnTm8gbW92ZXMgY29sbGVjdGVkIC0gbGlrZWx5IGdhbWUgb3ZlciBwb3NpdGlvbicpO1xuICAgICAgICAgIHJlc29sdmUoW10pOyAvLyBSZXR1cm4gZW1wdHkgYXJyYXkgaW5zdGVhZCBvZiByZWplY3RpbmcgZm9yIGdhbWUgb3ZlciBwb3NpdGlvbnNcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gQWRkIHRpbWVvdXQgdG8gZm9yY2Ugc3RvcCBhZnRlciByZWFzb25hYmxlIHRpbWVcbiAgICAgIGNvbnN0IGZvcmNlU3RvcFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKCFoYXNSZWNlaXZlZEJlc3RNb3ZlKSB7XG4gICAgICAgICAgbG9nZ2VyLndhcm4oJ0ZvcmNpbmcgc3RvcCBhZnRlciAxMCBzZWNvbmRzIHRvIGdldCBiZXN0bW92ZScpO1xuICAgICAgICAgIHRoaXMuc2VuZENvbW1hbmQoJ3N0b3AnKTtcbiAgICAgICAgICAvLyBHaXZlIGl0IGEgbW9tZW50IHRvIHJlc3BvbmQgd2l0aCBiZXN0bW92ZVxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFoYXNSZWNlaXZlZEJlc3RNb3ZlKSB7XG4gICAgICAgICAgICAgIGxvZ2dlci53YXJuKCdObyBiZXN0bW92ZSBhZnRlciBzdG9wLCB1c2luZyBjb2xsZWN0ZWQgbW92ZXMnKTtcbiAgICAgICAgICAgICAgY29tcGxldGVBbmFseXNpcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9XG4gICAgICB9LCAxMDAwMCk7IC8vIDEwIHNlY29uZCB0aW1lb3V0IHRvIGZvcmNlIHN0b3BcblxuICAgICAgLy8gQWRkIGFic29sdXRlIHRpbWVvdXQgdG8gcHJldmVudCBoYW5naW5nXG4gICAgICBjb25zdCBhYnNvbHV0ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKCFoYXNSZWNlaXZlZEJlc3RNb3ZlKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdBbmFseXNpcyB0aW1lb3V0IGFmdGVyIDMwIHNlY29uZHMnKTtcbiAgICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGZvcmNlU3RvcFRpbWVvdXQpO1xuICAgICAgICAgIGNvbXBsZXRlQW5hbHlzaXMoKTsgLy8gVHJ5IHRvIHVzZSB3aGF0IHdlIGhhdmVcbiAgICAgICAgfVxuICAgICAgfSwgMzAwMDApOyAvLyAzMCBzZWNvbmQgYWJzb2x1dGUgdGltZW91dFxuXG4gICAgICBjb25zdCBhbmFseXNpc0hhbmRsZXIgPSAobWVzc2FnZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIC8vIENoZWNrIGZvciBtYXRlIHNjb3JlcyAoZ2FtZSBvdmVyIHBvc2l0aW9ucylcbiAgICAgICAgaWYgKG1lc3NhZ2UuaW5jbHVkZXMoJ3Njb3JlIG1hdGUnKSkge1xuICAgICAgICAgIC8vIEV4dHJhY3QgbWF0ZSBzY29yZSB0byBkZXRlY3QgY2hlY2ttYXRlL3N0YWxlbWF0ZVxuICAgICAgICAgIGNvbnN0IG1hdGVNYXRjaCA9IG1lc3NhZ2UubWF0Y2goL3Njb3JlIG1hdGUgKC0/XFxkKykvKTtcbiAgICAgICAgICBpZiAobWF0ZU1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRlSW4gPSBwYXJzZUludChtYXRlTWF0Y2hbMV0sIDEwKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnRGV0ZWN0ZWQgbWF0ZSBzY29yZTonLCBtYXRlSW4pO1xuICAgICAgICAgICAgLy8gSWYgbWF0ZSBpcyAwIG9yIG5lZ2F0aXZlLCBpdCdzIGNoZWNrbWF0ZS9zdGFsZW1hdGUgKG5vIG1vdmVzIGF2YWlsYWJsZSlcbiAgICAgICAgICAgIGlmIChtYXRlSW4gPD0gMCkge1xuICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0dhbWUgb3ZlciBwb3NpdGlvbiBkZXRlY3RlZCAoY2hlY2ttYXRlL3N0YWxlbWF0ZSknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFBhcnNlIGluZm8gbGluZXNcbiAgICAgICAgaWYgKG1lc3NhZ2Uuc3RhcnRzV2l0aCgnaW5mbycpICYmIG1lc3NhZ2UuaW5jbHVkZXMoJ211bHRpcHYnKSkge1xuICAgICAgICAgIGNvbnN0IGluZm8gPSB0aGlzLnBhcnNlSW5mb0xpbmUobWVzc2FnZSk7XG4gICAgICAgICAgaWYgKGluZm8pIHtcbiAgICAgICAgICAgIG1vdmVzLnNldChpbmZvLm11bHRpcHYsIGluZm8pO1xuICAgICAgICAgICAgaWYgKGluZm8ubXVsdGlwdiA9PT0gMSkge1xuICAgICAgICAgICAgICBiZXN0U2NvcmUgPSBpbmZvLnNjb3JlO1xuICAgICAgICAgICAgICBtYXhEZXB0aFJlYWNoZWQgPSBNYXRoLm1heChtYXhEZXB0aFJlYWNoZWQsIGluZm8uZGVwdGgpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gSWYgd2UndmUgcmVhY2hlZCB0aGUgdGFyZ2V0IGRlcHRoIGFuZCBoYXZlIGVub3VnaCBtb3Zlcywgd2UgY2FuIHN0b3AgZWFybHlcbiAgICAgICAgICAgICAgaWYgKGluZm8uZGVwdGggPj0gdGhpcy5kZXB0aCAmJiBtb3Zlcy5zaXplID49IE1hdGgubWluKDMsIHRoaXMubXVsdGlQVikpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ1JlYWNoZWQgdGFyZ2V0IGRlcHRoLCBzdG9wcGluZyBlYXJseScpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZENvbW1hbmQoJ3N0b3AnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuYWx5c2lzIGNvbXBsZXRlXG4gICAgICAgIGlmIChtZXNzYWdlLnN0YXJ0c1dpdGgoJ2Jlc3Rtb3ZlJykpIHtcbiAgICAgICAgICBoYXNSZWNlaXZlZEJlc3RNb3ZlID0gdHJ1ZTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoZm9yY2VTdG9wVGltZW91dCk7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGFic29sdXRlVGltZW91dCk7XG4gICAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihhbmFseXNpc0hhbmRsZXIpO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgYmVzdG1vdmUgaXMgXCJub25lXCIgKG5vIGxlZ2FsIG1vdmVzIC0gY2hlY2ttYXRlL3N0YWxlbWF0ZSlcbiAgICAgICAgICBjb25zdCBiZXN0bW92ZU1hdGNoID0gbWVzc2FnZS5tYXRjaCgvYmVzdG1vdmVcXHMrKFxcUyspLyk7XG4gICAgICAgICAgaWYgKGJlc3Rtb3ZlTWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnN0IGJlc3Rtb3ZlID0gYmVzdG1vdmVNYXRjaFsxXTtcbiAgICAgICAgICAgIGlmIChiZXN0bW92ZSA9PT0gJyhub25lKScgfHwgYmVzdG1vdmUgPT09ICdub25lJyB8fCBiZXN0bW92ZSA9PT0gJzAwMDAnKSB7XG4gICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnTm8gbGVnYWwgbW92ZXMgKGNoZWNrbWF0ZS9zdGFsZW1hdGUpJyk7XG4gICAgICAgICAgICAgIHJlc29sdmUoW10pOyAvLyBSZXR1cm4gZW1wdHkgYXJyYXkgZm9yIGdhbWUgb3ZlciBwb3NpdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnUmVjZWl2ZWQgYmVzdG1vdmUsIGNvbGxlY3RlZCcsIG1vdmVzLnNpemUsICdtb3ZlcycpO1xuXG4gICAgICAgICAgLy8gQ29udmVydCB0byBBbmFseXplZE1vdmUgYXJyYXlcbiAgICAgICAgICBjb25zdCBhbmFseXplZE1vdmVzOiBBbmFseXplZE1vdmVbXSA9IFtdO1xuICAgICAgICAgIFxuICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHRoaXMubXVsdGlQVjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBpbmZvID0gbW92ZXMuZ2V0KGkpO1xuICAgICAgICAgICAgaWYgKGluZm8gJiYgaW5mby5wdi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGV2YWxMb3NzID0gTWF0aC5hYnMoYmVzdFNjb3JlIC0gaW5mby5zY29yZSk7XG4gICAgICAgICAgICAgIGFuYWx5emVkTW92ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgbW92ZTogaW5mby5wdlswXSxcbiAgICAgICAgICAgICAgICBldmFsdWF0aW9uOiBpbmZvLnNjb3JlLFxuICAgICAgICAgICAgICAgIGV2YWxMb3NzLFxuICAgICAgICAgICAgICAgIHB2OiBpbmZvLnB2LFxuICAgICAgICAgICAgICAgIG11bHRpcHY6IGluZm8ubXVsdGlwdixcbiAgICAgICAgICAgICAgICBkZXB0aDogaW5mby5kZXB0aCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgd2UgaGF2ZSBubyBtb3ZlcyBidXQgZ290IGEgYmVzdG1vdmUsIGl0IG1pZ2h0IHN0aWxsIGJlIGdhbWUgb3ZlclxuICAgICAgICAgIGlmIChhbmFseXplZE1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdObyBtb3ZlcyBpbiBiZXN0bW92ZSByZXNwb25zZSAtIGdhbWUgb3ZlciBwb3NpdGlvbicpO1xuICAgICAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnUmV0dXJuaW5nJywgYW5hbHl6ZWRNb3Zlcy5sZW5ndGgsICdhbmFseXplZCBtb3ZlcycpO1xuICAgICAgICAgICAgcmVzb2x2ZShhbmFseXplZE1vdmVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMuYWRkTWVzc2FnZUhhbmRsZXIoYW5hbHlzaXNIYW5kbGVyKTtcblxuICAgICAgLy8gV2FpdCBmb3IgcmVhZHlvayBiZWZvcmUgc2VuZGluZyBwb3NpdGlvblxuICAgICAgY29uc3QgcmVhZHlIYW5kbGVyID0gKG1zZzogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChtc2cgPT09ICdyZWFkeW9rJykge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ0VuZ2luZSByZWFkeSwgc2VuZGluZyBwb3NpdGlvbiBhbmQgc3RhcnRpbmcgYW5hbHlzaXMnKTtcbiAgICAgICAgICB0aGlzLnNlbmRDb21tYW5kKGBwb3NpdGlvbiBmZW4gJHtmZW59YCk7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZChgZ28gZGVwdGggJHt0aGlzLmRlcHRofWApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGhpcy5hZGRNZXNzYWdlSGFuZGxlcihyZWFkeUhhbmRsZXIpO1xuXG4gICAgICAvLyBTZW5kIHBvc2l0aW9uIGFuZCBzdGFydCBhbmFseXNpc1xuICAgICAgbG9nZ2VyLmRlYnVnKCdTdGFydGluZyBhbmFseXNpcyBmb3IgRkVOOicsIGZlbiwgJ011bHRpUFY9JywgdGhpcy5tdWx0aVBWLCAnRGVwdGg9JywgdGhpcy5kZXB0aCk7XG4gICAgICBcbiAgICAgIHRoaXMuc2VuZENvbW1hbmQoYHNldG9wdGlvbiBuYW1lIE11bHRpUFYgdmFsdWUgJHt0aGlzLm11bHRpUFZ9YCk7XG4gICAgICB0aGlzLnNlbmRDb21tYW5kKCdpc3JlYWR5Jyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgVUNJIGluZm8gbGluZSBpbnRvIHN0cnVjdHVyZWQgZGF0YVxuICAgKi9cbiAgcHJpdmF0ZSBwYXJzZUluZm9MaW5lKGxpbmU6IHN0cmluZyk6IFN0b2NrZmlzaEluZm8gfCBudWxsIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFydHMgPSBsaW5lLnNwbGl0KCcgJyk7XG4gICAgICBcbiAgICAgIGNvbnN0IGdldFZhbHVlQWZ0ZXIgPSAoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgICAgICAgY29uc3QgaWR4ID0gcGFydHMuaW5kZXhPZihrZXkpO1xuICAgICAgICByZXR1cm4gaWR4ID49IDAgJiYgaWR4IDwgcGFydHMubGVuZ3RoIC0gMSA/IHBhcnRzW2lkeCArIDFdIDogbnVsbDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG11bHRpcHZTdHIgPSBnZXRWYWx1ZUFmdGVyKCdtdWx0aXB2Jyk7XG4gICAgICBjb25zdCBkZXB0aFN0ciA9IGdldFZhbHVlQWZ0ZXIoJ2RlcHRoJyk7XG4gICAgICBcbiAgICAgIGlmICghbXVsdGlwdlN0ciB8fCAhZGVwdGhTdHIpIHJldHVybiBudWxsO1xuXG4gICAgICBjb25zdCBtdWx0aXB2ID0gcGFyc2VJbnQobXVsdGlwdlN0ciwgMTApO1xuICAgICAgY29uc3QgZGVwdGggPSBwYXJzZUludChkZXB0aFN0ciwgMTApO1xuXG4gICAgICAvLyBHZXQgc2NvcmUgdmFsdWVcbiAgICAgIGxldCBzY29yZSA9IDA7XG4gICAgICBsZXQgbWF0ZTogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgICAgY29uc3Qgc2NvcmVJZHggPSBwYXJ0cy5pbmRleE9mKCdzY29yZScpO1xuICAgICAgXG4gICAgICBpZiAoc2NvcmVJZHggPj0gMCAmJiBwYXJ0c1tzY29yZUlkeCArIDFdID09PSAnY3AnKSB7XG4gICAgICAgIHNjb3JlID0gcGFyc2VJbnQocGFydHNbc2NvcmVJZHggKyAyXSwgMTApO1xuICAgICAgfSBlbHNlIGlmIChzY29yZUlkeCA+PSAwICYmIHBhcnRzW3Njb3JlSWR4ICsgMV0gPT09ICdtYXRlJykge1xuICAgICAgICBtYXRlID0gcGFyc2VJbnQocGFydHNbc2NvcmVJZHggKyAyXSwgMTApO1xuICAgICAgICAvLyBDb252ZXJ0IG1hdGUgdG8gYSBsYXJnZSBjZW50aXBhd24gdmFsdWVcbiAgICAgICAgc2NvcmUgPSBtYXRlID4gMCA/IDEwMDAwIC0gbWF0ZSAqIDEwMCA6IC0xMDAwMCAtIG1hdGUgKiAxMDA7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCBQViAocHJpbmNpcGFsIHZhcmlhdGlvbilcbiAgICAgIGNvbnN0IHB2SWR4ID0gcGFydHMuaW5kZXhPZigncHYnKTtcbiAgICAgIGNvbnN0IHB2ID0gcHZJZHggPj0gMCA/IHBhcnRzLnNsaWNlKHB2SWR4ICsgMSkgOiBbXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbXVsdGlwdixcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIHNjb3JlLFxuICAgICAgICBtYXRlLFxuICAgICAgICBwdixcbiAgICAgIH07XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBjdXJyZW50IGFuYWx5c2lzXG4gICAqL1xuICBzdG9wKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgdGhpcy5zZW5kQ29tbWFuZCgnc3RvcCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIG5ldyBnYW1lXG4gICAqL1xuICBuZXdHYW1lKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLndvcmtlcikge1xuICAgICAgdGhpcy5zZW5kQ29tbWFuZCgndWNpbmV3Z2FtZScpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBlbmdpbmUgaXMgaW5pdGlhbGl6ZWRcbiAgICovXG4gIGdldCBpbml0aWFsaXplZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc1JlYWR5O1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IHN0b2NrZmlzaFNlcnZpY2UgPSBuZXcgU3RvY2tmaXNoU2VydmljZSgpO1xuIiwgIi8qKlxuICogVHlwZXMgZm9yIHRoZSBjaGVzcyBlbmdpbmUgbW9kZWwgbGF5ZXJcbiAqIFB1cmUgVHlwZVNjcmlwdCAtIG5vIFJlYWN0LCBubyBNb2JYXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBBbmFseXplZE1vdmUge1xuICBtb3ZlOiBzdHJpbmc7ICAgICAgICAvLyBVQ0kgZm9ybWF0IChlLmcuLCBcImUyZTRcIilcbiAgZXZhbHVhdGlvbjogbnVtYmVyOyAgLy8gQ2VudGlwYXduIGV2YWx1YXRpb25cbiAgZXZhbExvc3M6IG51bWJlcjsgICAgLy8gTG9zcyBjb21wYXJlZCB0byBiZXN0IG1vdmVcbiAgcHY6IHN0cmluZ1tdOyAgICAgICAgLy8gUHJpbmNpcGFsIHZhcmlhdGlvblxuICBtdWx0aXB2OiBudW1iZXI7ICAgICAvLyBNdWx0aVBWIHJhbmsgKDEgPSBiZXN0KVxuICBkZXB0aDogbnVtYmVyOyAgICAgICAvLyBTZWFyY2ggZGVwdGhcbn1cblxuZXhwb3J0IHR5cGUgTW92ZUJ1Y2tldCA9IFxuICB8ICdiZXN0J1xuICB8ICdncmVhdCdcbiAgfCAnZXhjZWxsZW50J1xuICB8ICdnb29kJ1xuICB8ICdpbmFjY3VyYWN5J1xuICB8ICdtaXN0YWtlJ1xuICB8ICdibHVuZGVyJztcblxuZXhwb3J0IHR5cGUgRGlzcGxheU1vdmVCdWNrZXQgPSBNb3ZlQnVja2V0IHwgJ2ZhbGxiYWNrJztcblxuZXhwb3J0IGludGVyZmFjZSBDbGFzc2lmaWVkTW92ZSBleHRlbmRzIEFuYWx5emVkTW92ZSB7XG4gIGJ1Y2tldDogTW92ZUJ1Y2tldDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdWNrZXRDb25maWcge1xuICBiZXN0OiBudW1iZXI7XG4gIGdyZWF0OiBudW1iZXI7XG4gIGV4Y2VsbGVudDogbnVtYmVyO1xuICBnb29kOiBudW1iZXI7XG4gIGluYWNjdXJhY3k6IG51bWJlcjtcbiAgbWlzdGFrZTogbnVtYmVyO1xuICBibHVuZGVyOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RvY2tmaXNoSW5mbyB7XG4gIG11bHRpcHY6IG51bWJlcjtcbiAgZGVwdGg6IG51bWJlcjtcbiAgc2NvcmU6IG51bWJlcjtcbiAgbWF0ZT86IG51bWJlcjtcbiAgcHY6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBpY2tlZE1vdmVSZXN1bHQge1xuICBtb3ZlOiBDbGFzc2lmaWVkTW92ZTtcbiAgYnVja2V0OiBNb3ZlQnVja2V0O1xuICBpc0JyaWxsaWFudD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0JVQ0tFVF9DT05GSUc6IEJ1Y2tldENvbmZpZyA9IHtcbiAgYmVzdDogNDAsXG4gIGdyZWF0OiAyNSxcbiAgZXhjZWxsZW50OiAyMCxcbiAgZ29vZDogMTAsXG4gIGluYWNjdXJhY3k6IDQsXG4gIG1pc3Rha2U6IDEsXG4gIGJsdW5kZXI6IDAsXG59O1xuXG4vKiogUHJlc2V0IGlkIGZvciBtb3ZlIHF1YWxpdHkgZGlzdHJpYnV0aW9uICovXG5leHBvcnQgdHlwZSBNb3ZlUXVhbGl0eVByZXNldElkID0gJ2xvdycgfCAnbWVkaXVtJyB8ICdoYXJkJyB8ICdzdXBlcl9oYXJkJyB8ICdhZ2dyZXNzaXZlJztcblxuZXhwb3J0IGludGVyZmFjZSBNb3ZlUXVhbGl0eVByZXNldCB7XG4gIGlkOiBNb3ZlUXVhbGl0eVByZXNldElkO1xuICBsYWJlbDogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBjb25maWc6IEJ1Y2tldENvbmZpZztcbn1cblxuLyoqIFByZWRlZmluZWQgbW92ZSBxdWFsaXR5IGRpc3RyaWJ1dGlvbnMgKHBlcmNlbnRhZ2VzIHN1bSB0byAxMDApICovXG5leHBvcnQgY29uc3QgTU9WRV9RVUFMSVRZX1BSRVNFVFM6IE1vdmVRdWFsaXR5UHJlc2V0W10gPSBbXG4gIHtcbiAgICBpZDogJ2xvdycsXG4gICAgbGFiZWw6ICdMb3cnLFxuICAgIGRlc2NyaXB0aW9uOiAnRWFzaWVyIFx1MjAxNCBtb3JlIGdvb2QvaW5hY2N1cmFjeS9taXN0YWtlIG1vdmVzJyxcbiAgICBjb25maWc6IHtcbiAgICAgIGJlc3Q6IDE1LFxuICAgICAgZ3JlYXQ6IDE1LFxuICAgICAgZXhjZWxsZW50OiAyMCxcbiAgICAgIGdvb2Q6IDI1LFxuICAgICAgaW5hY2N1cmFjeTogMTUsXG4gICAgICBtaXN0YWtlOiA3LFxuICAgICAgYmx1bmRlcjogMyxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaWQ6ICdtZWRpdW0nLFxuICAgIGxhYmVsOiAnTWVkaXVtJyxcbiAgICBkZXNjcmlwdGlvbjogJ0JhbGFuY2VkIG1peCBvZiBxdWFsaXRpZXMnLFxuICAgIGNvbmZpZzoge1xuICAgICAgYmVzdDogNDAsXG4gICAgICBncmVhdDogMjUsXG4gICAgICBleGNlbGxlbnQ6IDIwLFxuICAgICAgZ29vZDogMTAsXG4gICAgICBpbmFjY3VyYWN5OiA0LFxuICAgICAgbWlzdGFrZTogMSxcbiAgICAgIGJsdW5kZXI6IDAsXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGFyZCcsXG4gICAgbGFiZWw6ICdIYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Zhdm9ycyBiZXN0IGFuZCBncmVhdCBtb3ZlcycsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiA1NSxcbiAgICAgIGdyZWF0OiAyNSxcbiAgICAgIGV4Y2VsbGVudDogMTUsXG4gICAgICBnb29kOiA1LFxuICAgICAgaW5hY2N1cmFjeTogMCxcbiAgICAgIG1pc3Rha2U6IDAsXG4gICAgICBibHVuZGVyOiAwLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ3N1cGVyX2hhcmQnLFxuICAgIGxhYmVsOiAnU3VwZXIgSGFyZCcsXG4gICAgZGVzY3JpcHRpb246ICdBbG1vc3Qgb25seSBiZXN0IGFuZCBncmVhdCcsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiA3MCxcbiAgICAgIGdyZWF0OiAyNSxcbiAgICAgIGV4Y2VsbGVudDogNSxcbiAgICAgIGdvb2Q6IDAsXG4gICAgICBpbmFjY3VyYWN5OiAwLFxuICAgICAgbWlzdGFrZTogMCxcbiAgICAgIGJsdW5kZXI6IDAsXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAnYWdncmVzc2l2ZScsXG4gICAgbGFiZWw6ICdBZ2dyZXNzaXZlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1Jpc2t5IFx1MjAxNCBtb3JlIGluYWNjdXJhY2llcyBhbmQgbWlzdGFrZXMnLFxuICAgIGNvbmZpZzoge1xuICAgICAgYmVzdDogMjAsXG4gICAgICBncmVhdDogMjAsXG4gICAgICBleGNlbGxlbnQ6IDE1LFxuICAgICAgZ29vZDogMTUsXG4gICAgICBpbmFjY3VyYWN5OiAxNSxcbiAgICAgIG1pc3Rha2U6IDEwLFxuICAgICAgYmx1bmRlcjogNSxcbiAgICB9LFxuICB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IEJVQ0tFVF9FVkFMX1JBTkdFUzogUmVjb3JkPE1vdmVCdWNrZXQsIFtudW1iZXIsIG51bWJlcl0+ID0ge1xuICBiZXN0OiBbMCwgMTBdLFxuICBncmVhdDogWzEwLCAzMF0sXG4gIGV4Y2VsbGVudDogWzMwLCA3MF0sXG4gIGdvb2Q6IFs3MCwgMTUwXSxcbiAgaW5hY2N1cmFjeTogWzE1MCwgMzAwXSxcbiAgbWlzdGFrZTogWzMwMCwgNjAwXSxcbiAgYmx1bmRlcjogWzYwMCwgSW5maW5pdHldLFxufTtcblxuZXhwb3J0IGNvbnN0IEJVQ0tFVF9MQUJFTFM6IFJlY29yZDxNb3ZlQnVja2V0LCBzdHJpbmc+ID0ge1xuICBiZXN0OiAnQmVzdCcsXG4gIGdyZWF0OiAnR3JlYXQnLFxuICBleGNlbGxlbnQ6ICdFeGNlbGxlbnQnLFxuICBnb29kOiAnR29vZCcsXG4gIGluYWNjdXJhY3k6ICdJbmFjY3VyYWN5JyxcbiAgbWlzdGFrZTogJ01pc3Rha2UnLFxuICBibHVuZGVyOiAnQmx1bmRlcicsXG59O1xuXG5leHBvcnQgY29uc3QgRElTUExBWV9CVUNLRVRfTEFCRUxTOiBSZWNvcmQ8RGlzcGxheU1vdmVCdWNrZXQsIHN0cmluZz4gPSB7XG4gIC4uLkJVQ0tFVF9MQUJFTFMsXG4gIGZhbGxiYWNrOiAnRmFsbGJhY2sgbW92ZScsXG59O1xuXG5leHBvcnQgY29uc3QgQlVDS0VUX0NPTE9SUzogUmVjb3JkPE1vdmVCdWNrZXQsIHN0cmluZz4gPSB7XG4gIGJlc3Q6ICcjMjZhNjQxJyxcbiAgZ3JlYXQ6ICcjMmVhMDQzJyxcbiAgZXhjZWxsZW50OiAnIzU3YWI1YScsXG4gIGdvb2Q6ICcjOGI5NDllJyxcbiAgaW5hY2N1cmFjeTogJyNkMjk5MjInLFxuICBtaXN0YWtlOiAnI2Y4NTE0OScsXG4gIGJsdW5kZXI6ICcjZGEzNjMzJyxcbn07XG5cbmV4cG9ydCBjb25zdCBESVNQTEFZX0JVQ0tFVF9DT0xPUlM6IFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgc3RyaW5nPiA9IHtcbiAgLi4uQlVDS0VUX0NPTE9SUyxcbiAgZmFsbGJhY2s6ICcjNmU3NjgxJyxcbn07XG4iLCAiLyoqXG4gKiBNb3ZlIENsYXNzaWZpZXJcbiAqIE1vZGVsIGxheWVyIC0gUHVyZSBUeXBlU2NyaXB0LCBubyBSZWFjdCwgbm8gTW9iWFxuICogXG4gKiBDbGFzc2lmaWVzIGNoZXNzIG1vdmVzIGludG8gcXVhbGl0eSBidWNrZXRzIGJhc2VkIG9uIGV2YWx1YXRpb24gbG9zc1xuICovXG5cbmltcG9ydCB7IFxuICBBbmFseXplZE1vdmUsIFxuICBDbGFzc2lmaWVkTW92ZSwgXG4gIERpc3BsYXlNb3ZlQnVja2V0LFxuICBNb3ZlQnVja2V0LCBcbiAgQlVDS0VUX0VWQUxfUkFOR0VTIFxufSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBDbGFzc2lmeSBhIHNpbmdsZSBtb3ZlIGludG8gYSBxdWFsaXR5IGJ1Y2tldCBiYXNlZCBvbiBldmFsIGxvc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzaWZ5TW92ZShtb3ZlOiBBbmFseXplZE1vdmUpOiBDbGFzc2lmaWVkTW92ZSB7XG4gIGNvbnN0IGJ1Y2tldCA9IGdldEJ1Y2tldEZvckV2YWxMb3NzKG1vdmUuZXZhbExvc3MpO1xuICByZXR1cm4ge1xuICAgIC4uLm1vdmUsXG4gICAgYnVja2V0LFxuICB9O1xufVxuXG4vKipcbiAqIENsYXNzaWZ5IGFsbCBhbmFseXplZCBtb3Zlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlNb3Zlcyhtb3ZlczogQW5hbHl6ZWRNb3ZlW10pOiBDbGFzc2lmaWVkTW92ZVtdIHtcbiAgcmV0dXJuIG1vdmVzLm1hcChjbGFzc2lmeU1vdmUpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgYnVja2V0IGZvciBhIGdpdmVuIGV2YWwgbG9zc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnVja2V0Rm9yRXZhbExvc3MoZXZhbExvc3M6IG51bWJlcik6IE1vdmVCdWNrZXQge1xuICBjb25zdCBhYnNMb3NzID0gTWF0aC5hYnMoZXZhbExvc3MpO1xuICBcbiAgZm9yIChjb25zdCBbYnVja2V0LCBbbWluLCBtYXhdXSBvZiBPYmplY3QuZW50cmllcyhCVUNLRVRfRVZBTF9SQU5HRVMpKSB7XG4gICAgaWYgKGFic0xvc3MgPj0gbWluICYmIGFic0xvc3MgPCBtYXgpIHtcbiAgICAgIHJldHVybiBidWNrZXQgYXMgTW92ZUJ1Y2tldDtcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiAnYmx1bmRlcic7XG59XG5cbi8qKlxuICogR3JvdXAgY2xhc3NpZmllZCBtb3ZlcyBieSB0aGVpciBidWNrZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwTW92ZXNCeUJ1Y2tldChtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSk6IE1hcDxNb3ZlQnVja2V0LCBDbGFzc2lmaWVkTW92ZVtdPiB7XG4gIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8TW92ZUJ1Y2tldCwgQ2xhc3NpZmllZE1vdmVbXT4oKTtcbiAgXG4gIC8vIEluaXRpYWxpemUgYWxsIGJ1Y2tldHMgd2l0aCBlbXB0eSBhcnJheXNcbiAgY29uc3QgYnVja2V0czogTW92ZUJ1Y2tldFtdID0gWydiZXN0JywgJ2dyZWF0JywgJ2V4Y2VsbGVudCcsICdnb29kJywgJ2luYWNjdXJhY3knLCAnbWlzdGFrZScsICdibHVuZGVyJ107XG4gIGJ1Y2tldHMuZm9yRWFjaChidWNrZXQgPT4gZ3JvdXBzLnNldChidWNrZXQsIFtdKSk7XG4gIFxuICAvLyBHcm91cCBtb3Zlc1xuICBtb3Zlcy5mb3JFYWNoKG1vdmUgPT4ge1xuICAgIGNvbnN0IGJ1Y2tldE1vdmVzID0gZ3JvdXBzLmdldChtb3ZlLmJ1Y2tldCkgfHwgW107XG4gICAgYnVja2V0TW92ZXMucHVzaChtb3ZlKTtcbiAgICBncm91cHMuc2V0KG1vdmUuYnVja2V0LCBidWNrZXRNb3Zlcyk7XG4gIH0pO1xuICBcbiAgcmV0dXJuIGdyb3Vwcztcbn1cblxuLyoqXG4gKiBHZXQgc3RhdGlzdGljcyBhYm91dCB0aGUgbW92ZSBkaXN0cmlidXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1vdmVTdGF0cyhtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSk6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+IHtcbiAgY29uc3Qgc3RhdHM6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+ID0ge1xuICAgIGJlc3Q6IDAsXG4gICAgZ3JlYXQ6IDAsXG4gICAgZXhjZWxsZW50OiAwLFxuICAgIGdvb2Q6IDAsXG4gICAgaW5hY2N1cmFjeTogMCxcbiAgICBtaXN0YWtlOiAwLFxuICAgIGJsdW5kZXI6IDAsXG4gIH07XG4gIFxuICBtb3Zlcy5mb3JFYWNoKG1vdmUgPT4ge1xuICAgIHN0YXRzW21vdmUuYnVja2V0XSsrO1xuICB9KTtcbiAgXG4gIHJldHVybiBzdGF0cztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGVyZSBhcmUgYW55IG1vdmVzIGluIGEgZ2l2ZW4gYnVja2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNNb3ZlSW5CdWNrZXQobW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sIGJ1Y2tldDogTW92ZUJ1Y2tldCk6IGJvb2xlYW4ge1xuICByZXR1cm4gbW92ZXMuc29tZShtb3ZlID0+IG1vdmUuYnVja2V0ID09PSBidWNrZXQpO1xufVxuXG4vKipcbiAqIEdldCBhbGwgbW92ZXMgZnJvbSBhIHNwZWNpZmljIGJ1Y2tldFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TW92ZXNGcm9tQnVja2V0KG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLCBidWNrZXQ6IE1vdmVCdWNrZXQpOiBDbGFzc2lmaWVkTW92ZVtdIHtcbiAgcmV0dXJuIG1vdmVzLmZpbHRlcihtb3ZlID0+IG1vdmUuYnVja2V0ID09PSBidWNrZXQpO1xufVxuXG5jb25zdCBCVUNLRVRfT1JERVI6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnLCAnZ29vZCcsICdpbmFjY3VyYWN5JywgJ21pc3Rha2UnLCAnYmx1bmRlciddO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlVbmFuYWx5emVkTW92ZSgpOiBEaXNwbGF5TW92ZUJ1Y2tldCB7XG4gIHJldHVybiAnZmFsbGJhY2snO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwTGVnYWxNb3Zlc1RvQnVja2V0cyhcbiAgbGVnYWxNb3Zlczogc3RyaW5nW10sXG4gIGFuYWx5emVkTW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIHVzZUltcHJvdmVkRmFsbGJhY2s6IGJvb2xlYW4sXG4pOiBSZWNvcmQ8c3RyaW5nLCBEaXNwbGF5TW92ZUJ1Y2tldD4ge1xuICBjb25zdCBtb3ZlTWFwOiBSZWNvcmQ8c3RyaW5nLCBEaXNwbGF5TW92ZUJ1Y2tldD4gPSB7fTtcblxuICBmb3IgKGNvbnN0IGFuYWx5emVkTW92ZSBvZiBhbmFseXplZE1vdmVzKSB7XG4gICAgbW92ZU1hcFthbmFseXplZE1vdmUubW92ZV0gPSBhbmFseXplZE1vdmUuYnVja2V0O1xuICB9XG5cbiAgZm9yIChjb25zdCBtb3ZlIG9mIGxlZ2FsTW92ZXMpIHtcbiAgICBpZiAoIW1vdmVNYXBbbW92ZV0pIHtcbiAgICAgIG1vdmVNYXBbbW92ZV0gPSB1c2VJbXByb3ZlZEZhbGxiYWNrID8gY2xhc3NpZnlVbmFuYWx5emVkTW92ZSgpIDogJ2dvb2QnO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtb3ZlTWFwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZENsb3Nlc3RBdmFpbGFibGVCdWNrZXQoXG4gIHRhcmdldEJ1Y2tldDogTW92ZUJ1Y2tldCxcbiAgYXZhaWxhYmxlQnVja2V0czogTW92ZUJ1Y2tldFtdLFxuKTogTW92ZUJ1Y2tldCB8IG51bGwge1xuICBpZiAoYXZhaWxhYmxlQnVja2V0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldEluZGV4ID0gQlVDS0VUX09SREVSLmluZGV4T2YodGFyZ2V0QnVja2V0KTtcbiAgaWYgKHRhcmdldEluZGV4ID09PSAtMSkge1xuICAgIHJldHVybiBhdmFpbGFibGVCdWNrZXRzWzBdO1xuICB9XG5cbiAgZm9yIChsZXQgb2Zmc2V0ID0gMTsgb2Zmc2V0IDwgQlVDS0VUX09SREVSLmxlbmd0aDsgb2Zmc2V0ICs9IDEpIHtcbiAgICBjb25zdCBiZXR0ZXJJbmRleCA9IHRhcmdldEluZGV4IC0gb2Zmc2V0O1xuICAgIGlmIChiZXR0ZXJJbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBiZXR0ZXJCdWNrZXQgPSBCVUNLRVRfT1JERVJbYmV0dGVySW5kZXhdO1xuICAgICAgaWYgKGF2YWlsYWJsZUJ1Y2tldHMuaW5jbHVkZXMoYmV0dGVyQnVja2V0KSkge1xuICAgICAgICByZXR1cm4gYmV0dGVyQnVja2V0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHdvcnNlSW5kZXggPSB0YXJnZXRJbmRleCArIG9mZnNldDtcbiAgICBpZiAod29yc2VJbmRleCA8IEJVQ0tFVF9PUkRFUi5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHdvcnNlQnVja2V0ID0gQlVDS0VUX09SREVSW3dvcnNlSW5kZXhdO1xuICAgICAgaWYgKGF2YWlsYWJsZUJ1Y2tldHMuaW5jbHVkZXMod29yc2VCdWNrZXQpKSB7XG4gICAgICAgIHJldHVybiB3b3JzZUJ1Y2tldDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXZhaWxhYmxlQnVja2V0c1swXTtcbn1cbiIsICIvKipcbiAqIE1vdmUgUGlja2VyXG4gKiBNb2RlbCBsYXllciAtIFB1cmUgVHlwZVNjcmlwdCwgbm8gUmVhY3QsIG5vIE1vYlhcbiAqIFxuICogUGlja3MgYSBtb3ZlIGJhc2VkIG9uIHdlaWdodGVkIHByb2JhYmlsaXR5IGZyb20gcXVhbGl0eSBidWNrZXRzXG4gKi9cblxuaW1wb3J0IHsgXG4gIENsYXNzaWZpZWRNb3ZlLCBcbiAgTW92ZUJ1Y2tldCwgXG4gIEJ1Y2tldENvbmZpZywgXG4gIFBpY2tlZE1vdmVSZXN1bHQsXG4gIERFRkFVTFRfQlVDS0VUX0NPTkZJRyBcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBmaW5kQ2xvc2VzdEF2YWlsYWJsZUJ1Y2tldCwgZ3JvdXBNb3Zlc0J5QnVja2V0IH0gZnJvbSAnLi9tb3ZlQ2xhc3NpZmllcic7XG5cbmV4cG9ydCB0eXBlIFJhbmRvbU51bWJlckdlbmVyYXRvciA9ICgpID0+IG51bWJlcjtcblxuaW50ZXJmYWNlIEJ1Y2tldFNlbGVjdGlvbiB7XG4gIGJ1Y2tldDogTW92ZUJ1Y2tldDtcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW107XG59XG5cbmZ1bmN0aW9uIGdldEJ1Y2tldE9yZGVyKCk6IE1vdmVCdWNrZXRbXSB7XG4gIHJldHVybiBbJ2Jlc3QnLCAnZ3JlYXQnLCAnZXhjZWxsZW50JywgJ2dvb2QnLCAnaW5hY2N1cmFjeScsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcbn1cblxuZnVuY3Rpb24gZ2V0QXZhaWxhYmxlQnVja2V0cyhcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnLFxuKTogQnVja2V0U2VsZWN0aW9uW10ge1xuICBjb25zdCBncm91cGVkID0gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzKTtcbiAgY29uc3QgYXZhaWxhYmxlQnVja2V0czogQnVja2V0U2VsZWN0aW9uW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBnZXRCdWNrZXRPcmRlcigpKSB7XG4gICAgY29uc3QgYnVja2V0TW92ZXMgPSBncm91cGVkLmdldChidWNrZXQpIHx8IFtdO1xuICAgIGlmIChidWNrZXRNb3Zlcy5sZW5ndGggPiAwICYmIGNvbmZpZ1tidWNrZXRdID4gMCkge1xuICAgICAgYXZhaWxhYmxlQnVja2V0cy5wdXNoKHsgYnVja2V0LCBtb3ZlczogYnVja2V0TW92ZXMgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGF2YWlsYWJsZUJ1Y2tldHM7XG59XG5cbmZ1bmN0aW9uIHBpY2tXZWlnaHRlZEJ1Y2tldChcbiAgd2VpZ2h0ZWRCdWNrZXRzOiBBcnJheTx7IGJ1Y2tldDogTW92ZUJ1Y2tldDsgd2VpZ2h0OiBudW1iZXIgfT4sXG4gIHJhbmRvbTogUmFuZG9tTnVtYmVyR2VuZXJhdG9yLFxuKTogTW92ZUJ1Y2tldCB8IG51bGwge1xuICBjb25zdCB0b3RhbFdlaWdodCA9IHdlaWdodGVkQnVja2V0cy5yZWR1Y2UoKHN1bSwgZW50cnkpID0+IHN1bSArIGVudHJ5LndlaWdodCwgMCk7XG5cbiAgaWYgKHRvdGFsV2VpZ2h0IDw9IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBzZWxlY3Rpb24gPSByYW5kb20oKSAqIHRvdGFsV2VpZ2h0O1xuXG4gIGZvciAoY29uc3QgZW50cnkgb2Ygd2VpZ2h0ZWRCdWNrZXRzKSB7XG4gICAgc2VsZWN0aW9uIC09IGVudHJ5LndlaWdodDtcbiAgICBpZiAoc2VsZWN0aW9uIDw9IDApIHtcbiAgICAgIHJldHVybiBlbnRyeS5idWNrZXQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHdlaWdodGVkQnVja2V0c1t3ZWlnaHRlZEJ1Y2tldHMubGVuZ3RoIC0gMV0/LmJ1Y2tldCA/PyBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja0J1Y2tldExlZ2FjeShcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnID0gREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICByYW5kb206IFJhbmRvbU51bWJlckdlbmVyYXRvciA9IE1hdGgucmFuZG9tLFxuKTogQnVja2V0U2VsZWN0aW9uIHwgbnVsbCB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IGF2YWlsYWJsZUJ1Y2tldHMgPSBnZXRBdmFpbGFibGVCdWNrZXRzKG1vdmVzLCBjb25maWcpO1xuICBpZiAoYXZhaWxhYmxlQnVja2V0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgYnVja2V0OiBtb3Zlc1swXS5idWNrZXQsXG4gICAgICBtb3ZlczogW21vdmVzWzBdXSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3Qgd2VpZ2h0ZWRCdWNrZXRzID0gYXZhaWxhYmxlQnVja2V0cy5tYXAoKGVudHJ5KSA9PiAoe1xuICAgIGJ1Y2tldDogZW50cnkuYnVja2V0LFxuICAgIHdlaWdodDogY29uZmlnW2VudHJ5LmJ1Y2tldF0sXG4gIH0pKTtcbiAgY29uc3Qgc2VsZWN0ZWRCdWNrZXQgPSBwaWNrV2VpZ2h0ZWRCdWNrZXQod2VpZ2h0ZWRCdWNrZXRzLCByYW5kb20pO1xuXG4gIGlmICghc2VsZWN0ZWRCdWNrZXQpIHtcbiAgICByZXR1cm4gYXZhaWxhYmxlQnVja2V0c1swXTtcbiAgfVxuXG4gIHJldHVybiBhdmFpbGFibGVCdWNrZXRzLmZpbmQoKGVudHJ5KSA9PiBlbnRyeS5idWNrZXQgPT09IHNlbGVjdGVkQnVja2V0KSA/PyBhdmFpbGFibGVCdWNrZXRzWzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja0J1Y2tldFdpdGhDbG9zZXN0RmFsbGJhY2soXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICBjb25maWc6IEJ1Y2tldENvbmZpZyA9IERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IgPSBNYXRoLnJhbmRvbSxcbik6IEJ1Y2tldFNlbGVjdGlvbiB8IG51bGwge1xuICBpZiAobW92ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBncm91cGVkID0gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzKTtcbiAgY29uc3Qgd2VpZ2h0ZWRCdWNrZXRzID0gZ2V0QnVja2V0T3JkZXIoKVxuICAgIC5maWx0ZXIoKGJ1Y2tldCkgPT4gY29uZmlnW2J1Y2tldF0gPiAwKVxuICAgIC5tYXAoKGJ1Y2tldCkgPT4gKHsgYnVja2V0LCB3ZWlnaHQ6IGNvbmZpZ1tidWNrZXRdIH0pKTtcbiAgY29uc3Qgc2VsZWN0ZWRCdWNrZXQgPSBwaWNrV2VpZ2h0ZWRCdWNrZXQod2VpZ2h0ZWRCdWNrZXRzLCByYW5kb20pO1xuXG4gIGlmICghc2VsZWN0ZWRCdWNrZXQpIHtcbiAgICByZXR1cm4gcGlja0J1Y2tldExlZ2FjeShtb3ZlcywgY29uZmlnLCByYW5kb20pO1xuICB9XG5cbiAgY29uc3Qgc2VsZWN0ZWRNb3ZlcyA9IGdyb3VwZWQuZ2V0KHNlbGVjdGVkQnVja2V0KSB8fCBbXTtcbiAgaWYgKHNlbGVjdGVkTW92ZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBidWNrZXQ6IHNlbGVjdGVkQnVja2V0LFxuICAgICAgbW92ZXM6IHNlbGVjdGVkTW92ZXMsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGF2YWlsYWJsZUJ1Y2tldHMgPSBnZXRCdWNrZXRPcmRlcigpLmZpbHRlcigoYnVja2V0KSA9PiAoZ3JvdXBlZC5nZXQoYnVja2V0KSB8fCBbXSkubGVuZ3RoID4gMCk7XG4gIGNvbnN0IGZhbGxiYWNrQnVja2V0ID0gZmluZENsb3Nlc3RBdmFpbGFibGVCdWNrZXQoc2VsZWN0ZWRCdWNrZXQsIGF2YWlsYWJsZUJ1Y2tldHMpO1xuICBpZiAoIWZhbGxiYWNrQnVja2V0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJ1Y2tldDogZmFsbGJhY2tCdWNrZXQsXG4gICAgbW92ZXM6IGdyb3VwZWQuZ2V0KGZhbGxiYWNrQnVja2V0KSB8fCBbXSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tSYW5kb21Nb3ZlRnJvbUJ1Y2tldChcbiAgYnVja2V0U2VsZWN0aW9uOiBCdWNrZXRTZWxlY3Rpb24sXG4gIHJhbmRvbTogUmFuZG9tTnVtYmVyR2VuZXJhdG9yID0gTWF0aC5yYW5kb20sXG4pOiBDbGFzc2lmaWVkTW92ZSB7XG4gIGNvbnN0IHJhbmRvbU1vdmVJbmRleCA9IE1hdGguZmxvb3IocmFuZG9tKCkgKiBidWNrZXRTZWxlY3Rpb24ubW92ZXMubGVuZ3RoKTtcbiAgcmV0dXJuIGJ1Y2tldFNlbGVjdGlvbi5tb3Zlc1tyYW5kb21Nb3ZlSW5kZXhdO1xufVxuXG4vKipcbiAqIFBpY2sgYSBtb3ZlIGJhc2VkIG9uIGJ1Y2tldCBjb25maWd1cmF0aW9uICh3ZWlnaHRlZCByYW5kb20pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaWNrTW92ZShcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sIFxuICBjb25maWc6IEJ1Y2tldENvbmZpZyA9IERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IgPSBNYXRoLnJhbmRvbSxcbik6IFBpY2tlZE1vdmVSZXN1bHQgfCBudWxsIHtcbiAgY29uc3Qgc2VsZWN0ZWRCdWNrZXQgPSBwaWNrQnVja2V0TGVnYWN5KG1vdmVzLCBjb25maWcsIHJhbmRvbSk7XG4gIGlmICghc2VsZWN0ZWRCdWNrZXQpIHJldHVybiBudWxsO1xuICBjb25zdCBzZWxlY3RlZE1vdmUgPSBwaWNrUmFuZG9tTW92ZUZyb21CdWNrZXQoc2VsZWN0ZWRCdWNrZXQsIHJhbmRvbSk7XG5cbiAgcmV0dXJuIHtcbiAgICBtb3ZlOiBzZWxlY3RlZE1vdmUsXG4gICAgYnVja2V0OiBzZWxlY3RlZEJ1Y2tldC5idWNrZXQsXG4gIH07XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGJ1Y2tldCBjb25maWcgc28gcGVyY2VudGFnZXMgc3VtIHRvIDEwMFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQnVja2V0Q29uZmlnKGNvbmZpZzogQnVja2V0Q29uZmlnKTogQnVja2V0Q29uZmlnIHtcbiAgY29uc3QgdG90YWwgPSBPYmplY3QudmFsdWVzKGNvbmZpZykucmVkdWNlKChzdW0sIHZhbCkgPT4gc3VtICsgdmFsLCAwKTtcbiAgXG4gIGlmICh0b3RhbCA9PT0gMCB8fCB0b3RhbCA9PT0gMTAwKSB7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuICBcbiAgY29uc3QgZmFjdG9yID0gMTAwIC8gdG90YWw7XG4gIFxuICByZXR1cm4ge1xuICAgIGJlc3Q6IE1hdGgucm91bmQoY29uZmlnLmJlc3QgKiBmYWN0b3IpLFxuICAgIGdyZWF0OiBNYXRoLnJvdW5kKGNvbmZpZy5ncmVhdCAqIGZhY3RvciksXG4gICAgZXhjZWxsZW50OiBNYXRoLnJvdW5kKGNvbmZpZy5leGNlbGxlbnQgKiBmYWN0b3IpLFxuICAgIGdvb2Q6IE1hdGgucm91bmQoY29uZmlnLmdvb2QgKiBmYWN0b3IpLFxuICAgIGluYWNjdXJhY3k6IE1hdGgucm91bmQoY29uZmlnLmluYWNjdXJhY3kgKiBmYWN0b3IpLFxuICAgIG1pc3Rha2U6IE1hdGgucm91bmQoY29uZmlnLm1pc3Rha2UgKiBmYWN0b3IpLFxuICAgIGJsdW5kZXI6IE1hdGgucm91bmQoY29uZmlnLmJsdW5kZXIgKiBmYWN0b3IpLFxuICB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlIGJ1Y2tldCBjb25maWdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQnVja2V0Q29uZmlnKGNvbmZpZzogQnVja2V0Q29uZmlnKTogeyB2YWxpZDogYm9vbGVhbjsgdG90YWw6IG51bWJlciB9IHtcbiAgY29uc3QgdG90YWwgPSBPYmplY3QudmFsdWVzKGNvbmZpZykucmVkdWNlKChzdW0sIHZhbCkgPT4gc3VtICsgdmFsLCAwKTtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdG90YWwgPT09IDEwMCxcbiAgICB0b3RhbCxcbiAgfTtcbn1cblxuLyoqXG4gKiBHZXQgcHJvYmFiaWxpdHkgb2YgcGlja2luZyBmcm9tIGVhY2ggYnVja2V0IGdpdmVuIGN1cnJlbnQgY29uZmlnIGFuZCBhdmFpbGFibGUgbW92ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVmZmVjdGl2ZVByb2JhYmlsaXRpZXMoXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICBjb25maWc6IEJ1Y2tldENvbmZpZ1xuKTogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICBjb25zdCBncm91cGVkID0gZ3JvdXBNb3Zlc0J5QnVja2V0KG1vdmVzKTtcbiAgXG4gIGNvbnN0IHByb2JhYmlsaXRpZXM6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+ID0ge1xuICAgIGJlc3Q6IDAsXG4gICAgZ3JlYXQ6IDAsXG4gICAgZXhjZWxsZW50OiAwLFxuICAgIGdvb2Q6IDAsXG4gICAgaW5hY2N1cmFjeTogMCxcbiAgICBtaXN0YWtlOiAwLFxuICAgIGJsdW5kZXI6IDAsXG4gIH07XG4gIFxuICAvLyBDYWxjdWxhdGUgZWZmZWN0aXZlIHdlaWdodHMgKG9ubHkgYnVja2V0cyB3aXRoIG1vdmVzKVxuICBsZXQgdG90YWxFZmZlY3RpdmVXZWlnaHQgPSAwO1xuICBjb25zdCBidWNrZXRzOiBNb3ZlQnVja2V0W10gPSBbJ2Jlc3QnLCAnZ3JlYXQnLCAnZXhjZWxsZW50JywgJ2dvb2QnLCAnaW5hY2N1cmFjeScsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcbiAgXG4gIGZvciAoY29uc3QgYnVja2V0IG9mIGJ1Y2tldHMpIHtcbiAgICBjb25zdCBidWNrZXRNb3ZlcyA9IGdyb3VwZWQuZ2V0KGJ1Y2tldCkgfHwgW107XG4gICAgaWYgKGJ1Y2tldE1vdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRvdGFsRWZmZWN0aXZlV2VpZ2h0ICs9IGNvbmZpZ1tidWNrZXRdO1xuICAgIH1cbiAgfVxuICBcbiAgaWYgKHRvdGFsRWZmZWN0aXZlV2VpZ2h0ID09PSAwKSB7XG4gICAgcmV0dXJuIHByb2JhYmlsaXRpZXM7XG4gIH1cbiAgXG4gIC8vIENhbGN1bGF0ZSBub3JtYWxpemVkIHByb2JhYmlsaXRpZXNcbiAgZm9yIChjb25zdCBidWNrZXQgb2YgYnVja2V0cykge1xuICAgIGNvbnN0IGJ1Y2tldE1vdmVzID0gZ3JvdXBlZC5nZXQoYnVja2V0KSB8fCBbXTtcbiAgICBpZiAoYnVja2V0TW92ZXMubGVuZ3RoID4gMCkge1xuICAgICAgcHJvYmFiaWxpdGllc1tidWNrZXRdID0gKGNvbmZpZ1tidWNrZXRdIC8gdG90YWxFZmZlY3RpdmVXZWlnaHQpICogMTAwO1xuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIHByb2JhYmlsaXRpZXM7XG59XG4iLCAiaW1wb3J0IHsgTW92ZVF1YWxpdHlQcmVzZXRJZCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZlYXR1cmVPcHRpb25zIHtcbiAgc2VjdXJpdHlEZXZUb29sc09ubHk6IGJvb2xlYW47XG4gIHBlcnNpc3RFbmdpbmVDb25maWc6IGJvb2xlYW47XG4gIHVzZURldGVybWluaXN0aWNSbmc6IGJvb2xlYW47XG4gIHVzZU1vdmVBbmFseXNpc0NhY2hlOiBib29sZWFuO1xuICB1c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbjogYm9vbGVhbjtcbiAgdXNlUG9zaXRpb25Db21wbGV4aXR5OiBib29sZWFuO1xuICB1c2VQZXJzb25hQmVoYXZpb3JCaWFzOiBib29sZWFuO1xuICB1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbjogYm9vbGVhbjtcbiAgdXNlQnJpbGxpYW50TW92ZUJ1ZGdldDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgRmVhdHVyZU9wdGlvbktleSA9IGtleW9mIEZlYXR1cmVPcHRpb25zO1xuXG5leHBvcnQgaW50ZXJmYWNlIEZlYXR1cmVPcHRpb25EZXNjcmlwdG9yIHtcbiAga2V5OiBGZWF0dXJlT3B0aW9uS2V5O1xuICBsYWJlbDogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBQZXJzb25hSWQgPSBNb3ZlUXVhbGl0eVByZXNldElkIHwgJ2N1c3RvbSc7XG5leHBvcnQgdHlwZSBCcmlsbGlhbnRNb3Zlc1BlckdhbWUgPSAwIHwgMSB8IDIgfCAzIHwgNDtcbmV4cG9ydCB0eXBlIEJyaWxsaWFudEFsbG93ZWRQaGFzZSA9ICdvcGVuaW5nJyB8ICdtaWRkbGVnYW1lJyB8ICdlbmRnYW1lJyB8ICdhbnknO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcge1xuICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IEJyaWxsaWFudE1vdmVzUGVyR2FtZTtcbiAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiBCcmlsbGlhbnRBbGxvd2VkUGhhc2U7XG4gIGJyaWxsaWFudFVzZWRDb3VudDogbnVtYmVyO1xuICBicmlsbGlhbnRNb3ZlTnVtYmVyczogbnVtYmVyW107XG4gIGdhbWVTZXNzaW9uSWQ6IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUzogRmVhdHVyZU9wdGlvbnMgPSB7XG4gIHNlY3VyaXR5RGV2VG9vbHNPbmx5OiB0cnVlLFxuICBwZXJzaXN0RW5naW5lQ29uZmlnOiB0cnVlLFxuICB1c2VEZXRlcm1pbmlzdGljUm5nOiBmYWxzZSxcbiAgdXNlTW92ZUFuYWx5c2lzQ2FjaGU6IHRydWUsXG4gIHVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uOiB0cnVlLFxuICB1c2VQb3NpdGlvbkNvbXBsZXhpdHk6IGZhbHNlLFxuICB1c2VQZXJzb25hQmVoYXZpb3JCaWFzOiBmYWxzZSxcbiAgdXNlSHVtYW5EZWxheVNpbXVsYXRpb246IGZhbHNlLFxuICB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0OiBmYWxzZSxcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUc6IEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcgPSB7XG4gIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMCxcbiAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnYW55JyxcbiAgYnJpbGxpYW50VXNlZENvdW50OiAwLFxuICBicmlsbGlhbnRNb3ZlTnVtYmVyczogW10sXG4gIGdhbWVTZXNzaW9uSWQ6IG51bGwsXG59O1xuXG5leHBvcnQgY29uc3QgRkVBVFVSRV9PUFRJT05fREVTQ1JJUFRPUlM6IEZlYXR1cmVPcHRpb25EZXNjcmlwdG9yW10gPSBbXG4gIHtcbiAgICBrZXk6ICdzZWN1cml0eURldlRvb2xzT25seScsXG4gICAgbGFiZWw6ICdEZXZUb29scyBPbmx5IEluIERldmVsb3BtZW50JyxcbiAgICBkZXNjcmlwdGlvbjogJ09wZW4gQ2hyb21pdW0gRGV2VG9vbHMgb25seSBpbiBkZXZlbG9wbWVudCBtb2RlLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICdwZXJzaXN0RW5naW5lQ29uZmlnJyxcbiAgICBsYWJlbDogJ1BlcnNpc3QgRW5naW5lIENvbmZpZ3VyYXRpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBkZXB0aCwgTXVsdGlQViwgcHJlc2V0cywgYnVja2V0IHdlaWdodHMsIGFuZCBhZHZhbmNlZCBmZWF0dXJlIG9wdGlvbnMuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZURldGVybWluaXN0aWNSbmcnLFxuICAgIGxhYmVsOiAnRGV0ZXJtaW5pc3RpYyBSTkcnLFxuICAgIGRlc2NyaXB0aW9uOiAnVXNlIGEgc2VlZGVkIHJhbmRvbSBzb3VyY2Ugc28gbW92ZSBzZWxlY3Rpb24gaXMgcmVwcm9kdWNpYmxlLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VNb3ZlQW5hbHlzaXNDYWNoZScsXG4gICAgbGFiZWw6ICdBbmFseXNpcyBDYWNoZScsXG4gICAgZGVzY3JpcHRpb246ICdSZXVzZSBTdG9ja2Zpc2ggYW5hbHlzaXMgZm9yIHRoZSBzYW1lIEZFTiwgZGVwdGgsIGFuZCBNdWx0aVBWIHNldHRpbmdzLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbicsXG4gICAgbGFiZWw6ICdJbXByb3ZlZCBNb3ZlIENsYXNzaWZpY2F0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ0tlZXAgdW5rbm93biBtb3ZlcyBzZXBhcmF0ZSBhbmQgdXNlIHNtYXJ0ZXIgYnVja2V0IGZhbGxiYWNrIHNlbGVjdGlvbi4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlUG9zaXRpb25Db21wbGV4aXR5JyxcbiAgICBsYWJlbDogJ1Bvc2l0aW9uIENvbXBsZXhpdHknLFxuICAgIGRlc2NyaXB0aW9uOiAnQWRqdXN0IG1vdmUgcXVhbGl0eSB3ZWlnaHRzIGJhc2VkIG9uIGhvdyBzaGFycCB0aGUgY3VycmVudCBwb3NpdGlvbiBpcy4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlUGVyc29uYUJlaGF2aW9yQmlhcycsXG4gICAgbGFiZWw6ICdQZXJzb25hIEJlaGF2aW9yIEJpYXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnTGF5ZXIgc2ltcGxlIGFnZ3Jlc3NpdmUgb3Igc2FmZSBtb3ZlIHByZWZlcmVuY2VzIG9uIHRvcCBvZiBidWNrZXQgc2VsZWN0aW9uLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbicsXG4gICAgbGFiZWw6ICdIdW1hbiBEZWxheSBTaW11bGF0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ0RlbGF5IGF1dG8tcGxheSBtb3ZlcyBiYXNlZCBvbiBjb21wbGV4aXR5LCBwZXJzb25hLCBhbmQgY2hvc2VuIG1vdmUgcXVhbGl0eS4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsXG4gICAgbGFiZWw6ICdCcmlsbGlhbnQgTW92ZSBCdWRnZXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVzZXJ2ZSBhIGZpeGVkIG51bWJlciBvZiB0YWN0aWNhbCBicmlsbGlhbnQgbW92ZXMgZm9yIGVhY2ggZ2FtZS4nLFxuICB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfZmVhdHVyZV9vcHRpb25zJztcbmV4cG9ydCBjb25zdCBFTkdJTkVfQ09ORklHX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19lbmdpbmVfY29uZmlnJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlRmVhdHVyZU9wdGlvbnMoXG4gIHBhcnRpYWw/OiBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPiB8IG51bGwsXG4pOiBGZWF0dXJlT3B0aW9ucyB7XG4gIHJldHVybiB7XG4gICAgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gICAgLi4uKHBhcnRpYWwgPz8ge30pLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnKFxuICBwYXJ0aWFsPzogUGFydGlhbDxCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnPiB8IG51bGwsXG4pOiBCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5ERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcsXG4gICAgLi4uKHBhcnRpYWwgPz8ge30pLFxuICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBwYXJ0aWFsPy5icmlsbGlhbnRNb3ZlTnVtYmVycyA/PyBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcuYnJpbGxpYW50TW92ZU51bWJlcnMsXG4gICAgZ2FtZVNlc3Npb25JZDogcGFydGlhbD8uZ2FtZVNlc3Npb25JZCA/PyBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcuZ2FtZVNlc3Npb25JZCxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSwgcmVhY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIEJyaWxsaWFudEFsbG93ZWRQaGFzZSxcbiAgQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyxcbiAgQnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICBERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcsXG4gIERFRkFVTFRfRkVBVFVSRV9PUFRJT05TLFxuICBGRUFUVVJFX09QVElPTlNfU1RPUkFHRV9LRVksXG4gIEZlYXR1cmVPcHRpb25LZXksXG4gIEZlYXR1cmVPcHRpb25zLFxuICBtZXJnZUJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcsXG4gIG1lcmdlRmVhdHVyZU9wdGlvbnMsXG59IGZyb20gJy4uL2VuZ2luZS9mZWF0dXJlT3B0aW9ucyc7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgcGVyc29uYUNoZXNzQnJpZGdlPzoge1xuICAgICAgc3luY0ZlYXR1cmVPcHRpb25zOiAob3B0aW9uczogRmVhdHVyZU9wdGlvbnMpID0+IHZvaWQ7XG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwge1xuICBvcHRpb25zOiBGZWF0dXJlT3B0aW9ucyA9IHsgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfTtcbiAgYnJpbGxpYW50Q29uZmlnOiBCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcgfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0T3B0aW9uOiBhY3Rpb24sXG4gICAgICBzZXRPcHRpb25zOiBhY3Rpb24sXG4gICAgICBhcHBseVByb2ZpbGVTZXR0aW5nczogYWN0aW9uLFxuICAgICAgc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lOiBhY3Rpb24sXG4gICAgICBzZXRCcmlsbGlhbnRBbGxvd2VkUGhhc2U6IGFjdGlvbixcbiAgICAgIHJlY29uY2lsZUJyaWxsaWFudFRyYWNraW5nOiBhY3Rpb24sXG4gICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nOiBhY3Rpb24sXG4gICAgICByZXNldFRvRGVmYXVsdHM6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG5cbiAgICByZWFjdGlvbihcbiAgICAgICgpID0+ICh7XG4gICAgICAgIG9wdGlvbnM6IHsgLi4udGhpcy5vcHRpb25zIH0sXG4gICAgICAgIGJyaWxsaWFudENvbmZpZzoge1xuICAgICAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBbLi4udGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZU51bWJlcnNdLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICAoc25hcHNob3QpID0+IHtcbiAgICAgICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgICAgIHRoaXMuc3luY1RvTWFpblByb2Nlc3Moc25hcHNob3Qub3B0aW9ucyk7XG4gICAgICB9LFxuICAgICAgeyBmaXJlSW1tZWRpYXRlbHk6IHRydWUgfSxcbiAgICApO1xuICB9XG5cbiAgc2V0T3B0aW9uPEtleSBleHRlbmRzIEZlYXR1cmVPcHRpb25LZXk+KGtleTogS2V5LCB2YWx1ZTogRmVhdHVyZU9wdGlvbnNbS2V5XSk6IHZvaWQge1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgIFtrZXldOiB2YWx1ZSxcbiAgICB9O1xuXG4gICAgaWYgKGtleSA9PT0gJ3BlcnNpc3RFbmdpbmVDb25maWcnICYmIHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZFN0b3JhZ2UoKTtcbiAgICB9XG4gIH1cblxuICBzZXRPcHRpb25zKG9wdGlvbnM6IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+KTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyh7XG4gICAgICAuLi50aGlzLm9wdGlvbnMsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgYXBwbHlQcm9maWxlU2V0dGluZ3MoXG4gICAgb3B0aW9uczogUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4sXG4gICAgYnJpbGxpYW50U2V0dGluZ3M6IFBhcnRpYWw8UGljazxCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnLCAnYnJpbGxpYW50TW92ZXNQZXJHYW1lJyB8ICdicmlsbGlhbnRBbGxvd2VkUGhhc2UnPj4sXG4gICk6IHZvaWQge1xuICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlRmVhdHVyZU9wdGlvbnMoe1xuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiBicmlsbGlhbnRTZXR0aW5ncy5icmlsbGlhbnRNb3Zlc1BlckdhbWUgPz8gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiBicmlsbGlhbnRTZXR0aW5ncy5icmlsbGlhbnRBbGxvd2VkUGhhc2UgPz8gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50QWxsb3dlZFBoYXNlLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50ID4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lKSB7XG4gICAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICAgIGJyaWxsaWFudFVzZWRDb3VudDogdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICAgICAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZU51bWJlcnMuc2xpY2UoMCwgdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lKSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgc2V0QnJpbGxpYW50TW92ZXNQZXJHYW1lKHZhbHVlOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWUpOiB2b2lkIHtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiB2YWx1ZSxcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudFVzZWRDb3VudCA+IHZhbHVlKSB7XG4gICAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICAgIGJyaWxsaWFudFVzZWRDb3VudDogdmFsdWUsXG4gICAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3ZlTnVtYmVycy5zbGljZSgwLCB2YWx1ZSksXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHNldEJyaWxsaWFudEFsbG93ZWRQaGFzZSh2YWx1ZTogQnJpbGxpYW50QWxsb3dlZFBoYXNlKTogdm9pZCB7XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogdmFsdWUsXG4gICAgfTtcbiAgfVxuXG4gIHJlY29uY2lsZUJyaWxsaWFudFRyYWNraW5nKFxuICAgIGdhbWVTZXNzaW9uSWQ6IHN0cmluZyxcbiAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogbnVtYmVyW10sXG4gICk6IHZvaWQge1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBnYW1lU2Vzc2lvbklkLFxuICAgICAgYnJpbGxpYW50VXNlZENvdW50OiBicmlsbGlhbnRNb3ZlTnVtYmVycy5sZW5ndGgsXG4gICAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogWy4uLmJyaWxsaWFudE1vdmVOdW1iZXJzXSxcbiAgICB9O1xuICB9XG5cbiAgcmVzZXRCcmlsbGlhbnRUcmFja2luZyhnYW1lU2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsID0gbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBnYW1lU2Vzc2lvbklkLFxuICAgICAgYnJpbGxpYW50VXNlZENvdW50OiAwLFxuICAgICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IFtdLFxuICAgIH07XG4gIH1cblxuICByZXNldFRvRGVmYXVsdHMoKTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zID0geyAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyB9O1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0geyAuLi5ERUZBVUxUX0JSSUxMSUFOVF9NT1ZFX0JVREdFVF9DT05GSUcgfTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZCkgYXNcbiAgICAgICAgfCBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPlxuICAgICAgICB8IHsgb3B0aW9ucz86IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+OyBicmlsbGlhbnRDb25maWc/OiBQYXJ0aWFsPEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWc+IH07XG5cbiAgICAgIGlmICgnb3B0aW9ucycgaW4gcGFyc2VkIHx8ICdicmlsbGlhbnRDb25maWcnIGluIHBhcnNlZCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZUZlYXR1cmVPcHRpb25zKHBhcnNlZC5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSBtZXJnZUJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcocGFyc2VkLmJyaWxsaWFudENvbmZpZyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyhwYXJzZWQgYXMgUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWxdIEZhaWxlZCB0byByZXN0b3JlIGZlYXR1cmUgb3B0aW9uczonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0VG9TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5wZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgIEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICBicmlsbGlhbnRDb25maWc6IHRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgICB9KSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHBlcnNpc3QgZmVhdHVyZSBvcHRpb25zOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0ZlYXR1cmVPcHRpb25zVmlld01vZGVsXSBGYWlsZWQgdG8gY2xlYXIgZmVhdHVyZSBvcHRpb25zIHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3luY1RvTWFpblByb2Nlc3Mob3B0aW9uczogRmVhdHVyZU9wdGlvbnMpOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJpYWxpemFibGVPcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyh7XG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuXG4gICAgd2luZG93LnBlcnNvbmFDaGVzc0JyaWRnZT8uc3luY0ZlYXR1cmVPcHRpb25zKHNlcmlhbGl6YWJsZU9wdGlvbnMpO1xuICB9XG5cbiAgZ2V0IHNlY3VyaXR5RGV2VG9vbHNPbmx5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuc2VjdXJpdHlEZXZUb29sc09ubHk7XG4gIH1cblxuICBnZXQgcGVyc2lzdEVuZ2luZUNvbmZpZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnBlcnNpc3RFbmdpbmVDb25maWc7XG4gIH1cblxuICBnZXQgdXNlRGV0ZXJtaW5pc3RpY1JuZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZURldGVybWluaXN0aWNSbmc7XG4gIH1cblxuICBnZXQgdXNlTW92ZUFuYWx5c2lzQ2FjaGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VNb3ZlQW5hbHlzaXNDYWNoZTtcbiAgfVxuXG4gIGdldCB1c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uO1xuICB9XG5cbiAgZ2V0IHVzZVBvc2l0aW9uQ29tcGxleGl0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZVBvc2l0aW9uQ29tcGxleGl0eTtcbiAgfVxuXG4gIGdldCB1c2VQZXJzb25hQmVoYXZpb3JCaWFzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlUGVyc29uYUJlaGF2aW9yQmlhcztcbiAgfVxuXG4gIGdldCB1c2VIdW1hbkRlbGF5U2ltdWxhdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZUh1bWFuRGVsYXlTaW11bGF0aW9uO1xuICB9XG5cbiAgZ2V0IHVzZUJyaWxsaWFudE1vdmVCdWRnZXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0O1xuICB9XG5cbiAgZ2V0IGJyaWxsaWFudE1vdmVzUGVyR2FtZSgpOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWUge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRNb3Zlc1BlckdhbWU7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50QWxsb3dlZFBoYXNlKCk6IEJyaWxsaWFudEFsbG93ZWRQaGFzZSB7XG4gICAgcmV0dXJuIHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudEFsbG93ZWRQaGFzZTtcbiAgfVxuXG4gIGdldCBicmlsbGlhbnRVc2VkQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50O1xuICB9XG5cbiAgZ2V0IGJyaWxsaWFudE1vdmVOdW1iZXJzKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZU51bWJlcnM7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50R2FtZVNlc3Npb25JZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuZ2FtZVNlc3Npb25JZDtcbiAgfVxuXG4gIGdldCBoYXNSZW1haW5pbmdCcmlsbGlhbnRNb3ZlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50VXNlZENvdW50IDwgdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCA9IG5ldyBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCgpO1xuIiwgImltcG9ydCB7IENoZXNzLCBQaWVjZVN5bWJvbCB9IGZyb20gJ2NoZXNzLmpzJztcbmltcG9ydCB7IENsYXNzaWZpZWRNb3ZlLCBNb3ZlQnVja2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSYW5kb21Tb3VyY2UgfSBmcm9tICcuL3JhbmRvbSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnJpbGxpYW50TW92ZUNhbmRpZGF0ZSB7XG4gIG1vdmU6IENsYXNzaWZpZWRNb3ZlO1xuICB0YWN0aWNhbFNjb3JlOiBudW1iZXI7XG59XG5cbmNvbnN0IFBJRUNFX1ZBTFVFUzogUmVjb3JkPFBpZWNlU3ltYm9sLCBudW1iZXI+ID0ge1xuICBwOiAxLFxuICBuOiAzLFxuICBiOiAzLFxuICByOiA1LFxuICBxOiA5LFxuICBrOiAwLFxufTtcblxuY29uc3QgQlJJTExJQU5UX0JVQ0tFVFM6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCddO1xuXG5mdW5jdGlvbiBnZXRQaWVjZVZhbHVlKHR5cGU/OiBQaWVjZVN5bWJvbCk6IG51bWJlciB7XG4gIHJldHVybiB0eXBlID8gUElFQ0VfVkFMVUVTW3R5cGVdIDogMDtcbn1cblxuZnVuY3Rpb24gZ2V0VGFjdGljYWxTY29yZShmZW46IHN0cmluZywgbW92ZTogQ2xhc3NpZmllZE1vdmUsIGJlc3RFdmFsdWF0aW9uOiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICBjb25zdCBmcm9tID0gbW92ZS5tb3ZlLnNsaWNlKDAsIDIpO1xuICBjb25zdCB0byA9IG1vdmUubW92ZS5zbGljZSgyLCA0KTtcbiAgY29uc3QgbW92aW5nUGllY2UgPSBjaGVzcy5nZXQoZnJvbSk7XG4gIGNvbnN0IHRhcmdldFBpZWNlID0gY2hlc3MuZ2V0KHRvKTtcbiAgY29uc3QgcGxheWVkTW92ZSA9IGNoZXNzLm1vdmUoe1xuICAgIGZyb20sXG4gICAgdG8sXG4gICAgcHJvbW90aW9uOiBtb3ZlLm1vdmVbNF0gYXMgJ3EnIHwgJ3InIHwgJ2InIHwgJ24nIHwgdW5kZWZpbmVkLFxuICB9KTtcblxuICBpZiAoIXBsYXllZE1vdmUpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGNvbnN0IGlzQ2FwdHVyZSA9IHBsYXllZE1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2MnKSB8fCBwbGF5ZWRNb3ZlLmZsYWdzLmluY2x1ZGVzKCdlJyk7XG4gIGNvbnN0IGlzUHJvbW90aW9uID0gQm9vbGVhbihwbGF5ZWRNb3ZlLnByb21vdGlvbik7XG4gIGNvbnN0IGlzQ2hlY2sgPSBjaGVzcy5pc0NoZWNrKCk7XG4gIGNvbnN0IGV2YWxHYWluID0gTWF0aC5tYXgoMCwgYmVzdEV2YWx1YXRpb24gLSBtb3ZlLmV2YWx1YXRpb24pO1xuICBjb25zdCBtYXRlcmlhbFN3aW5nID0gZ2V0UGllY2VWYWx1ZSh0YXJnZXRQaWVjZT8udHlwZSkgLSBnZXRQaWVjZVZhbHVlKG1vdmluZ1BpZWNlPy50eXBlKTtcbiAgY29uc3QgaXNTYWNyaWZpY2UgPSBpc0NhcHR1cmUgJiYgbWF0ZXJpYWxTd2luZyA8IDA7XG5cbiAgbGV0IHRhY3RpY2FsU2NvcmUgPSAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGlzQ2hlY2sgPyAyIDogMDtcbiAgdGFjdGljYWxTY29yZSArPSBpc0NhcHR1cmUgPyAxLjUgOiAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGlzUHJvbW90aW9uID8gMi41IDogMDtcbiAgdGFjdGljYWxTY29yZSArPSBpc1NhY3JpZmljZSA/IDEuNzUgOiAwO1xuICB0YWN0aWNhbFNjb3JlICs9IGV2YWxHYWluID49IDgwID8gMS41IDogZXZhbEdhaW4gPj0gNDAgPyAwLjc1IDogMDtcblxuICByZXR1cm4gdGFjdGljYWxTY29yZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJyaWxsaWFudE1vdmVDYW5kaWRhdGVzKFxuICBmZW46IHN0cmluZyxcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4pOiBCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlW10ge1xuICBpZiAobW92ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3QgYmVzdEV2YWx1YXRpb24gPSBtb3Zlc1swXS5ldmFsdWF0aW9uO1xuXG4gIHJldHVybiBtb3Zlc1xuICAgIC5maWx0ZXIobW92ZSA9PiBCUklMTElBTlRfQlVDS0VUUy5pbmNsdWRlcyhtb3ZlLmJ1Y2tldCkpXG4gICAgLm1hcChtb3ZlID0+ICh7XG4gICAgICBtb3ZlLFxuICAgICAgdGFjdGljYWxTY29yZTogZ2V0VGFjdGljYWxTY29yZShmZW4sIG1vdmUsIGJlc3RFdmFsdWF0aW9uKSxcbiAgICB9KSlcbiAgICAuZmlsdGVyKGNhbmRpZGF0ZSA9PiBjYW5kaWRhdGUudGFjdGljYWxTY29yZSA+IDApXG4gICAgLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PiByaWdodC50YWN0aWNhbFNjb3JlIC0gbGVmdC50YWN0aWNhbFNjb3JlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tCcmlsbGlhbnRNb3ZlKFxuICBjYW5kaWRhdGVzOiBCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlW10sXG4gIHJhbmRvbVNvdXJjZTogUmFuZG9tU291cmNlLFxuKTogQ2xhc3NpZmllZE1vdmUgfCBudWxsIHtcbiAgaWYgKGNhbmRpZGF0ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB0b3RhbFdlaWdodCA9IGNhbmRpZGF0ZXMucmVkdWNlKChzdW0sIGNhbmRpZGF0ZSkgPT4gc3VtICsgY2FuZGlkYXRlLnRhY3RpY2FsU2NvcmUsIDApO1xuICBsZXQgc2VsZWN0aW9uID0gcmFuZG9tU291cmNlLm5leHQoKSAqIHRvdGFsV2VpZ2h0O1xuXG4gIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNhbmRpZGF0ZXMpIHtcbiAgICBzZWxlY3Rpb24gLT0gY2FuZGlkYXRlLnRhY3RpY2FsU2NvcmU7XG4gICAgaWYgKHNlbGVjdGlvbiA8PSAwKSB7XG4gICAgICByZXR1cm4gY2FuZGlkYXRlLm1vdmU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNhbmRpZGF0ZXNbY2FuZGlkYXRlcy5sZW5ndGggLSAxXS5tb3ZlO1xufVxuIiwgImltcG9ydCB7IENoZXNzLCBQaWVjZVN5bWJvbCB9IGZyb20gJ2NoZXNzLmpzJztcblxuZXhwb3J0IHR5cGUgR2FtZVBoYXNlID0gJ29wZW5pbmcnIHwgJ21pZGRsZWdhbWUnIHwgJ2VuZGdhbWUnO1xuXG5jb25zdCBQSUVDRV9WQUxVRVM6IFJlY29yZDxQaWVjZVN5bWJvbCwgbnVtYmVyPiA9IHtcbiAgcDogMSxcbiAgbjogMyxcbiAgYjogMyxcbiAgcjogNSxcbiAgcTogOSxcbiAgazogMCxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2FtZVBoYXNlUmVzdWx0IHtcbiAgcGhhc2U6IEdhbWVQaGFzZTtcbiAgdG90YWxNYXRlcmlhbDogbnVtYmVyO1xuICBxdWVlbnNUcmFkZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb3RhbE1hdGVyaWFsKGZlbjogc3RyaW5nKTogbnVtYmVyIHtcbiAgY29uc3QgY2hlc3MgPSBuZXcgQ2hlc3MoZmVuKTtcbiAgcmV0dXJuIGNoZXNzXG4gICAgLmJvYXJkKClcbiAgICAuZmxhdCgpXG4gICAgLnJlZHVjZSgodG90YWwsIHBpZWNlKSA9PiB0b3RhbCArIChwaWVjZSA/IFBJRUNFX1ZBTFVFU1twaWVjZS50eXBlXSA6IDApLCAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFyZVF1ZWVuc1RyYWRlZChmZW46IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICBjb25zdCBxdWVlbnMgPSBjaGVzc1xuICAgIC5ib2FyZCgpXG4gICAgLmZsYXQoKVxuICAgIC5maWx0ZXIocGllY2UgPT4gcGllY2U/LnR5cGUgPT09ICdxJykubGVuZ3RoO1xuXG4gIHJldHVybiBxdWVlbnMgPCAyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0R2FtZVBoYXNlKGZlbjogc3RyaW5nLCBtb3ZlTnVtYmVyOiBudW1iZXIpOiBHYW1lUGhhc2VSZXN1bHQge1xuICBjb25zdCB0b3RhbE1hdGVyaWFsID0gZ2V0VG90YWxNYXRlcmlhbChmZW4pO1xuICBjb25zdCBxdWVlbnNUcmFkZWQgPSBhcmVRdWVlbnNUcmFkZWQoZmVuKTtcblxuICBpZiAobW92ZU51bWJlciA8PSAxMCkge1xuICAgIHJldHVybiB7XG4gICAgICBwaGFzZTogJ29wZW5pbmcnLFxuICAgICAgdG90YWxNYXRlcmlhbCxcbiAgICAgIHF1ZWVuc1RyYWRlZCxcbiAgICB9O1xuICB9XG5cbiAgaWYgKHF1ZWVuc1RyYWRlZCB8fCB0b3RhbE1hdGVyaWFsIDw9IDI0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBoYXNlOiAnZW5kZ2FtZScsXG4gICAgICB0b3RhbE1hdGVyaWFsLFxuICAgICAgcXVlZW5zVHJhZGVkLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBoYXNlOiAnbWlkZGxlZ2FtZScsXG4gICAgdG90YWxNYXRlcmlhbCxcbiAgICBxdWVlbnNUcmFkZWQsXG4gIH07XG59XG4iLCAiaW1wb3J0IHsgQnVja2V0Q29uZmlnLCBNb3ZlQnVja2V0LCBBbmFseXplZE1vdmUgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQge1xuICBsZXZlbDogJ2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJztcbiAgc2NvcmU6IG51bWJlcjtcbiAgc3ByZWFkOiBudW1iZXI7XG4gIGNsb3NlQ2FuZGlkYXRlczogbnVtYmVyO1xuICB2b2xhdGlsaXR5OiBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlOiBudW1iZXIsIG1pbiA9IDAsIG1heCA9IDEpOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5taW4obWF4LCBNYXRoLm1heChtaW4sIHZhbHVlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVQb3NpdGlvbkNvbXBsZXhpdHkoXG4gIG1vdmVzOiBBbmFseXplZE1vdmVbXSxcbik6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPD0gMSkge1xuICAgIHJldHVybiB7XG4gICAgICBsZXZlbDogJ2xvdycsXG4gICAgICBzY29yZTogMCxcbiAgICAgIHNwcmVhZDogMCxcbiAgICAgIGNsb3NlQ2FuZGlkYXRlczogbW92ZXMubGVuZ3RoLFxuICAgICAgdm9sYXRpbGl0eTogMCxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgZXZhbHVhdGlvbnMgPSBtb3Zlcy5tYXAoKG1vdmUpID0+IG1vdmUuZXZhbHVhdGlvbikuc29ydCgoYSwgYikgPT4gYiAtIGEpO1xuICBjb25zdCBiZXN0ID0gZXZhbHVhdGlvbnNbMF07XG4gIGNvbnN0IHNwcmVhZCA9IE1hdGguYWJzKGJlc3QgLSBldmFsdWF0aW9uc1tldmFsdWF0aW9ucy5sZW5ndGggLSAxXSk7XG4gIGNvbnN0IGNsb3NlQ2FuZGlkYXRlcyA9IG1vdmVzLmZpbHRlcigobW92ZSkgPT4gTWF0aC5hYnMoYmVzdCAtIG1vdmUuZXZhbHVhdGlvbikgPD0gMzUpLmxlbmd0aDtcbiAgY29uc3Qgdm9sYXRpbGl0eSA9IG1vdmVzLmxlbmd0aCA+IDFcbiAgICA/IE1hdGguYWJzKGJlc3QgLSBldmFsdWF0aW9uc1tNYXRoLm1pbigyLCBldmFsdWF0aW9ucy5sZW5ndGggLSAxKV0pXG4gICAgOiAwO1xuXG4gIGNvbnN0IHNwcmVhZEZhY3RvciA9IDEgLSBjbGFtcChzcHJlYWQgLyAyNTApO1xuICBjb25zdCBjbG9zZUZhY3RvciA9IGNsYW1wKChjbG9zZUNhbmRpZGF0ZXMgLSAxKSAvIDUpO1xuICBjb25zdCB2b2xhdGlsaXR5RmFjdG9yID0gY2xhbXAodm9sYXRpbGl0eSAvIDE1MCk7XG4gIGNvbnN0IHNjb3JlID0gY2xhbXAoc3ByZWFkRmFjdG9yICogMC40NSArIGNsb3NlRmFjdG9yICogMC4zNSArIHZvbGF0aWxpdHlGYWN0b3IgKiAwLjIpO1xuXG4gIGxldCBsZXZlbDogUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0WydsZXZlbCddID0gJ21lZGl1bSc7XG4gIGlmIChzY29yZSA8IDAuMzMpIGxldmVsID0gJ2xvdyc7XG4gIGlmIChzY29yZSA+IDAuNjYpIGxldmVsID0gJ2hpZ2gnO1xuXG4gIHJldHVybiB7XG4gICAgbGV2ZWwsXG4gICAgc2NvcmUsXG4gICAgc3ByZWFkLFxuICAgIGNsb3NlQ2FuZGlkYXRlcyxcbiAgICB2b2xhdGlsaXR5LFxuICB9O1xufVxuXG5jb25zdCBCVUNLRVRfT1JERVI6IE1vdmVCdWNrZXRbXSA9IFtcbiAgJ2Jlc3QnLFxuICAnZ3JlYXQnLFxuICAnZXhjZWxsZW50JyxcbiAgJ2dvb2QnLFxuICAnaW5hY2N1cmFjeScsXG4gICdtaXN0YWtlJyxcbiAgJ2JsdW5kZXInLFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFkanVzdEJ1Y2tldENvbmZpZ0ZvckNvbXBsZXhpdHkoXG4gIGNvbmZpZzogQnVja2V0Q29uZmlnLFxuICBjb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQsXG4pOiBCdWNrZXRDb25maWcge1xuICBjb25zdCBhZGp1c3RlZCA9IHsgLi4uY29uZmlnIH07XG4gIGNvbnN0IGludGVuc2l0eSA9IGNvbXBsZXhpdHkuc2NvcmU7XG5cbiAgaWYgKGNvbXBsZXhpdHkubGV2ZWwgPT09ICdoaWdoJykge1xuICAgIGFkanVzdGVkLmJlc3QgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5iZXN0IC0gTWF0aC5yb3VuZCg2ICogaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQuZ3JlYXQgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5ncmVhdCAtIE1hdGgucm91bmQoMyAqIGludGVuc2l0eSkpO1xuICAgIGFkanVzdGVkLmluYWNjdXJhY3kgKz0gTWF0aC5yb3VuZCg0ICogaW50ZW5zaXR5KTtcbiAgICBhZGp1c3RlZC5taXN0YWtlICs9IE1hdGgucm91bmQoMyAqIGludGVuc2l0eSk7XG4gICAgYWRqdXN0ZWQuYmx1bmRlciArPSBNYXRoLnJvdW5kKDIgKiBpbnRlbnNpdHkpO1xuICB9IGVsc2UgaWYgKGNvbXBsZXhpdHkubGV2ZWwgPT09ICdsb3cnKSB7XG4gICAgYWRqdXN0ZWQuYmVzdCArPSBNYXRoLnJvdW5kKDUgKiAoMSAtIGludGVuc2l0eSkpO1xuICAgIGFkanVzdGVkLmdyZWF0ICs9IE1hdGgucm91bmQoMyAqICgxIC0gaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQuZXhjZWxsZW50ICs9IE1hdGgucm91bmQoMiAqICgxIC0gaW50ZW5zaXR5KSk7XG4gICAgYWRqdXN0ZWQubWlzdGFrZSA9IE1hdGgubWF4KDAsIGFkanVzdGVkLm1pc3Rha2UgLSAyKTtcbiAgICBhZGp1c3RlZC5ibHVuZGVyID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuYmx1bmRlciAtIDEpO1xuICB9XG5cbiAgY29uc3QgdG90YWwgPSBCVUNLRVRfT1JERVIucmVkdWNlKChzdW0sIGJ1Y2tldCkgPT4gc3VtICsgYWRqdXN0ZWRbYnVja2V0XSwgMCk7XG4gIGlmICh0b3RhbCA8PSAwKSB7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBCVUNLRVRfT1JERVIucmVkdWNlKChyZXN1bHQsIGJ1Y2tldCkgPT4ge1xuICAgIHJlc3VsdFtidWNrZXRdID0gTWF0aC5yb3VuZCgoYWRqdXN0ZWRbYnVja2V0XSAvIHRvdGFsKSAqIDEwMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSwge30gYXMgQnVja2V0Q29uZmlnKTtcblxuICBjb25zdCBub3JtYWxpemVkVG90YWwgPSBCVUNLRVRfT1JERVIucmVkdWNlKChzdW0sIGJ1Y2tldCkgPT4gc3VtICsgbm9ybWFsaXplZFtidWNrZXRdLCAwKTtcbiAgY29uc3QgZGlmZiA9IDEwMCAtIG5vcm1hbGl6ZWRUb3RhbDtcbiAgbm9ybWFsaXplZC5iZXN0ICs9IGRpZmY7XG5cbiAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG59XG4iLCAiaW1wb3J0IHsgQ2hlc3MgfSBmcm9tICdjaGVzcy5qcyc7XG5pbXBvcnQgeyBQZXJzb25hSWQgfSBmcm9tICcuL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7IENsYXNzaWZpZWRNb3ZlLCBNb3ZlQnVja2V0IH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBSYW5kb21Tb3VyY2UgfSBmcm9tICcuL3JhbmRvbSc7XG5pbXBvcnQgeyBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQgfSBmcm9tICcuL3Bvc2l0aW9uQ29tcGxleGl0eSc7XG5cbmV4cG9ydCB0eXBlIFBlcnNvbmFCZWhhdmlvck1vZGUgPSAnYWdncmVzc2l2ZScgfCAnc2FmZScgfCAnYmFsYW5jZWQnO1xuXG5jb25zdCBTQUZFX0JVQ0tFVFM6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYTogUGVyc29uYUlkKTogUGVyc29uYUJlaGF2aW9yTW9kZSB7XG4gIGlmIChwZXJzb25hID09PSAnYWdncmVzc2l2ZScpIHtcbiAgICByZXR1cm4gJ2FnZ3Jlc3NpdmUnO1xuICB9XG5cbiAgaWYgKHBlcnNvbmEgPT09ICdoYXJkJyB8fCBwZXJzb25hID09PSAnc3VwZXJfaGFyZCcpIHtcbiAgICByZXR1cm4gJ3NhZmUnO1xuICB9XG5cbiAgcmV0dXJuICdiYWxhbmNlZCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVBlcnNvbmFCdWNrZXRCaWFzKFxuICBjb25maWc6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+LFxuICBwZXJzb25hOiBQZXJzb25hSWQsXG4pOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gIGNvbnN0IG1vZGUgPSBnZXRQZXJzb25hQmVoYXZpb3JNb2RlKHBlcnNvbmEpO1xuICBjb25zdCBhZGp1c3RlZCA9IHsgLi4uY29uZmlnIH07XG5cbiAgaWYgKG1vZGUgPT09ICdhZ2dyZXNzaXZlJykge1xuICAgIGFkanVzdGVkLmdvb2QgKz0gMztcbiAgICBhZGp1c3RlZC5pbmFjY3VyYWN5ICs9IDI7XG4gICAgYWRqdXN0ZWQuYmVzdCA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmJlc3QgLSAzKTtcbiAgICBhZGp1c3RlZC5ncmVhdCA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmdyZWF0IC0gMik7XG4gIH0gZWxzZSBpZiAobW9kZSA9PT0gJ3NhZmUnKSB7XG4gICAgZm9yIChjb25zdCBidWNrZXQgb2YgU0FGRV9CVUNLRVRTKSB7XG4gICAgICBhZGp1c3RlZFtidWNrZXRdICs9IDI7XG4gICAgfVxuICAgIGFkanVzdGVkLm1pc3Rha2UgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5taXN0YWtlIC0gMik7XG4gICAgYWRqdXN0ZWQuYmx1bmRlciA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmJsdW5kZXIgLSAyKTtcbiAgfVxuXG4gIHJldHVybiBhZGp1c3RlZDtcbn1cblxuZnVuY3Rpb24gZ2V0TW92ZVRyYWl0U2NvcmUoZmVuOiBzdHJpbmcsIG1vdmVVY2k6IHN0cmluZywgcGVyc29uYTogUGVyc29uYUlkKTogbnVtYmVyIHtcbiAgY29uc3QgbW9kZSA9IGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYSk7XG4gIGlmIChtb2RlID09PSAnYmFsYW5jZWQnKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBjb25zdCBjaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICBjb25zdCBtb3ZlID0gY2hlc3MubW92ZSh7XG4gICAgZnJvbTogbW92ZVVjaS5zbGljZSgwLCAyKSxcbiAgICB0bzogbW92ZVVjaS5zbGljZSgyLCA0KSxcbiAgICBwcm9tb3Rpb246IG1vdmVVY2lbNF0gYXMgJ3EnIHwgJ3InIHwgJ2InIHwgJ24nIHwgdW5kZWZpbmVkLFxuICB9KTtcblxuICBpZiAoIW1vdmUpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGNvbnN0IGlzQ2FwdHVyZSA9IG1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2MnKSB8fCBtb3ZlLmZsYWdzLmluY2x1ZGVzKCdlJyk7XG4gIGNvbnN0IGlzUHJvbW90aW9uID0gQm9vbGVhbihtb3ZlLnByb21vdGlvbik7XG4gIGNvbnN0IGlzQ2FzdGxlID0gbW92ZS5mbGFncy5pbmNsdWRlcygnaycpIHx8IG1vdmUuZmxhZ3MuaW5jbHVkZXMoJ3EnKTtcbiAgY29uc3QgaXNDaGVjayA9IGNoZXNzLmlzQ2hlY2soKTtcblxuICBpZiAobW9kZSA9PT0gJ2FnZ3Jlc3NpdmUnKSB7XG4gICAgcmV0dXJuIDFcbiAgICAgICsgKGlzQ2FwdHVyZSA/IDAuMzUgOiAwKVxuICAgICAgKyAoaXNDaGVjayA/IDAuMzUgOiAwKVxuICAgICAgKyAoaXNQcm9tb3Rpb24gPyAwLjQ1IDogMClcbiAgICAgICsgKGlzQ2FzdGxlID8gMC4wNSA6IDApO1xuICB9XG5cbiAgcmV0dXJuIDFcbiAgICArIChpc0Nhc3RsZSA/IDAuMiA6IDApXG4gICAgKyAoIWlzQ2FwdHVyZSA/IDAuMSA6IDApXG4gICAgLSAoaXNQcm9tb3Rpb24gPyAwLjA1IDogMCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWNrUGVyc29uYUJpYXNlZE1vdmUoXG4gIGZlbjogc3RyaW5nLFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgcGVyc29uYTogUGVyc29uYUlkLFxuICByYW5kb21Tb3VyY2U6IFJhbmRvbVNvdXJjZSxcbik6IENsYXNzaWZpZWRNb3ZlIHtcbiAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBtb3Zlc1swXTtcbiAgfVxuXG4gIGNvbnN0IHdlaWdodGVkTW92ZXMgPSBtb3Zlcy5tYXAoKG1vdmUpID0+ICh7XG4gICAgbW92ZSxcbiAgICB3ZWlnaHQ6IE1hdGgubWF4KDAuMSwgZ2V0TW92ZVRyYWl0U2NvcmUoZmVuLCBtb3ZlLm1vdmUsIHBlcnNvbmEpKSxcbiAgfSkpO1xuICBjb25zdCB0b3RhbFdlaWdodCA9IHdlaWdodGVkTW92ZXMucmVkdWNlKChzdW0sIGVudHJ5KSA9PiBzdW0gKyBlbnRyeS53ZWlnaHQsIDApO1xuICBsZXQgc2VsZWN0aW9uID0gcmFuZG9tU291cmNlLm5leHQoKSAqIHRvdGFsV2VpZ2h0O1xuXG4gIGZvciAoY29uc3QgZW50cnkgb2Ygd2VpZ2h0ZWRNb3Zlcykge1xuICAgIHNlbGVjdGlvbiAtPSBlbnRyeS53ZWlnaHQ7XG4gICAgaWYgKHNlbGVjdGlvbiA8PSAwKSB7XG4gICAgICByZXR1cm4gZW50cnkubW92ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gd2VpZ2h0ZWRNb3Zlc1t3ZWlnaHRlZE1vdmVzLmxlbmd0aCAtIDFdLm1vdmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVIdW1hbkRlbGF5TXMob3B0aW9uczoge1xuICBjb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQgfCBudWxsO1xuICBwZXJzb25hOiBQZXJzb25hSWQ7XG4gIGJ1Y2tldDogTW92ZUJ1Y2tldDtcbn0pOiBudW1iZXIge1xuICBjb25zdCB7IGNvbXBsZXhpdHksIHBlcnNvbmEsIGJ1Y2tldCB9ID0gb3B0aW9ucztcbiAgY29uc3QgbW9kZSA9IGdldFBlcnNvbmFCZWhhdmlvck1vZGUocGVyc29uYSk7XG4gIGNvbnN0IGJhc2UgPSAzNTA7XG4gIGNvbnN0IGNvbXBsZXhpdHlEZWxheSA9IGNvbXBsZXhpdHkgPyBNYXRoLnJvdW5kKDkwMCAqIGNvbXBsZXhpdHkuc2NvcmUpIDogMDtcbiAgY29uc3QgcGVyc29uYURlbGF5ID0gbW9kZSA9PT0gJ3NhZmUnID8gMjIwIDogbW9kZSA9PT0gJ2FnZ3Jlc3NpdmUnID8gODAgOiAxNDA7XG4gIGNvbnN0IGJ1Y2tldERlbGF5ID1cbiAgICBidWNrZXQgPT09ICdiZXN0JyB8fCBidWNrZXQgPT09ICdncmVhdCdcbiAgICAgID8gMTIwXG4gICAgICA6IGJ1Y2tldCA9PT0gJ21pc3Rha2UnIHx8IGJ1Y2tldCA9PT0gJ2JsdW5kZXInXG4gICAgICAgID8gNDBcbiAgICAgICAgOiA4MDtcblxuICByZXR1cm4gYmFzZSArIGNvbXBsZXhpdHlEZWxheSArIHBlcnNvbmFEZWxheSArIGJ1Y2tldERlbGF5O1xufVxuIiwgIi8qKlxuICogRW5naW5lIFZpZXdNb2RlbFxuICogVmlld01vZGVsIGxheWVyIC0gTW9iWCBzdG9yZSBmb3IgU3RvY2tmaXNoIGVuZ2luZSBzdGF0ZVxuICovXG5cbmltcG9ydCB7IG1ha2VBdXRvT2JzZXJ2YWJsZSwgYWN0aW9uLCBydW5JbkFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgQW5hbHlzaXNQdXJwb3NlLFxuICBBbmFseXNpc1NuYXBzaG90LFxuICBpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0LFxufSBmcm9tICcuLi9lbmdpbmUvYW5hbHlzaXNTYWZldHknO1xuaW1wb3J0IHsgc3RvY2tmaXNoU2VydmljZSB9IGZyb20gJy4uL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZSc7XG5pbXBvcnQgeyBjbGFzc2lmeU1vdmVzLCBnZXRNb3ZlU3RhdHMsIGdyb3VwTW92ZXNCeUJ1Y2tldCB9IGZyb20gJy4uL2VuZ2luZS9tb3ZlQ2xhc3NpZmllcic7XG5pbXBvcnQge1xuICBwaWNrQnVja2V0TGVnYWN5LFxuICBwaWNrQnVja2V0V2l0aENsb3Nlc3RGYWxsYmFjayxcbiAgcGlja1JhbmRvbU1vdmVGcm9tQnVja2V0LFxufSBmcm9tICcuLi9lbmdpbmUvbW92ZVBpY2tlcic7XG5pbXBvcnQgeyBcbiAgQW5hbHl6ZWRNb3ZlLFxuICBDbGFzc2lmaWVkTW92ZSwgXG4gIFBpY2tlZE1vdmVSZXN1bHQsIFxuICBNb3ZlQnVja2V0LFxuICBCdWNrZXRDb25maWcsXG59IGZyb20gJy4uL2VuZ2luZS90eXBlcyc7XG5pbXBvcnQgeyBhbmFseXNpc0NhY2hlLCBidWlsZEFuYWx5c2lzQ2FjaGVLZXkgfSBmcm9tICcuLi9lbmdpbmUvYW5hbHlzaXNDYWNoZSc7XG5pbXBvcnQgeyBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gJy4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwnO1xuaW1wb3J0IHsgZ2V0QnJpbGxpYW50TW92ZUNhbmRpZGF0ZXMsIHBpY2tCcmlsbGlhbnRNb3ZlIH0gZnJvbSAnLi4vZW5naW5lL2JyaWxsaWFudE1vdmUnO1xuaW1wb3J0IHsgZGV0ZWN0R2FtZVBoYXNlIH0gZnJvbSAnLi4vZW5naW5lL2dhbWVQaGFzZSc7XG5pbXBvcnQge1xuICBhZGp1c3RCdWNrZXRDb25maWdGb3JDb21wbGV4aXR5LFxuICBjYWxjdWxhdGVQb3NpdGlvbkNvbXBsZXhpdHksXG4gIFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdCxcbn0gZnJvbSAnLi4vZW5naW5lL3Bvc2l0aW9uQ29tcGxleGl0eSc7XG5pbXBvcnQge1xuICBhcHBseVBlcnNvbmFCdWNrZXRCaWFzLFxuICBwaWNrUGVyc29uYUJpYXNlZE1vdmUsXG59IGZyb20gJy4uL2VuZ2luZS9wZXJzb25hQmlhcyc7XG5pbXBvcnQge1xuICBidWlsZERldGVybWluaXN0aWNTZWVkLFxuICBjcmVhdGVMZWdhY3lSYW5kb21Tb3VyY2UsXG4gIGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZSxcbn0gZnJvbSAnLi4vZW5naW5lL3JhbmRvbSc7XG5pbXBvcnQgeyBQZXJzb25hSWQgfSBmcm9tICcuLi9lbmdpbmUvZmVhdHVyZU9wdGlvbnMnO1xuaW1wb3J0IHsgY3JlYXRlRGVidWdMb2dnZXIgfSBmcm9tICcuLi9zaGFyZWQvZGVidWcnO1xuXG5pbnRlcmZhY2UgTW92ZVNlbGVjdGlvbkNvbnRleHQge1xuICBmZW46IHN0cmluZztcbiAgZ2FtZVN0YXJ0RmVuOiBzdHJpbmc7XG4gIG1vdmVDb3VudDogbnVtYmVyO1xuICBzaWRlVG9Nb3ZlOiAndycgfCAnYic7XG4gIHBlcnNvbmE6IFBlcnNvbmFJZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQb3NpdGlvbkFuYWx5c2lzUmVzdWx0IGV4dGVuZHMgQW5hbHlzaXNTbmFwc2hvdDxDbGFzc2lmaWVkTW92ZVtdPiB7XG4gIGNvbXBsZXhpdHk6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdDtcbiAgaWdub3JlZDogYm9vbGVhbjtcbiAgZnJvbUNhY2hlOiBib29sZWFuO1xuICBwdXJwb3NlOiBBbmFseXNpc1B1cnBvc2U7XG59XG5cbmludGVyZmFjZSBBY3RpdmVBbmFseXNpc1J1biB7XG4gIGNhY2hlS2V5OiBzdHJpbmc7XG4gIGZlbjogc3RyaW5nO1xuICBwdXJwb3NlOiBBbmFseXNpc1B1cnBvc2U7XG4gIHByb21pc2U6IFByb21pc2U8UG9zaXRpb25BbmFseXNpc1Jlc3VsdD47XG59XG5cbmNvbnN0IGxvZ2dlciA9IGNyZWF0ZURlYnVnTG9nZ2VyKCdFbmdpbmVWaWV3TW9kZWwnKTtcblxuZnVuY3Rpb24gY2FuVXNlQnJpbGxpYW50TW92ZUJ1ZGdldChtb3ZlQ291bnQ6IG51bWJlciwgZmVuOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5oYXNSZW1haW5pbmdCcmlsbGlhbnRNb3Zlcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3Zlc1BlckdhbWUgPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBwaGFzZSA9IGRldGVjdEdhbWVQaGFzZShmZW4sIG1vdmVDb3VudCkucGhhc2U7XG4gIHJldHVybiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRBbGxvd2VkUGhhc2UgPT09ICdhbnknXG4gICAgfHwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50QWxsb3dlZFBoYXNlID09PSBwaGFzZTtcbn1cblxuZXhwb3J0IGNsYXNzIEVuZ2luZVZpZXdNb2RlbCB7XG4gIGlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgaXNJbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgaXNBbmFseXppbmcgPSBmYWxzZTtcbiAgYW5hbHl6ZWRNb3ZlczogQ2xhc3NpZmllZE1vdmVbXSA9IFtdO1xuICBsYXN0UGlja2VkTW92ZTogUGlja2VkTW92ZVJlc3VsdCB8IG51bGwgPSBudWxsO1xuICBlcnJvcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGxhc3RDb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQgfCBudWxsID0gbnVsbDtcbiAgbGFzdEFuYWx5c2lzRnJvbUNhY2hlID0gZmFsc2U7XG4gIGxhc3RBbmFseXNpc1B1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG5leHRSZXF1ZXN0SWRzOiBSZWNvcmQ8QW5hbHlzaXNQdXJwb3NlLCBudW1iZXI+ID0ge1xuICAgIGVuZ2luZU1vdmU6IDAsXG4gICAgYmFja2dyb3VuZDogMCxcbiAgfTtcbiAgcHJpdmF0ZSBsYXRlc3RSZXF1ZXN0SWRzOiBSZWNvcmQ8QW5hbHlzaXNQdXJwb3NlLCBudW1iZXI+ID0ge1xuICAgIGVuZ2luZU1vdmU6IDAsXG4gICAgYmFja2dyb3VuZDogMCxcbiAgfTtcbiAgcHJpdmF0ZSBhY3RpdmVBbmFseXNpc1J1bjogQWN0aXZlQW5hbHlzaXNSdW4gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgaW5pdGlhbGl6ZTogYWN0aW9uLFxuICAgICAgYW5hbHl6ZVBvc2l0aW9uOiBhY3Rpb24sXG4gICAgICBwaWNrTW92ZUZyb21BbmFseXNpczogYWN0aW9uLFxuICAgICAgcmVzZXQ6IGFjdGlvbixcbiAgICAgIHNldEVycm9yOiBhY3Rpb24sXG4gICAgfSk7XG4gICAgXG4gICAgbG9nZ2VyLmRlYnVnKCdJbml0aWFsaXplZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgdGhlIFN0b2NrZmlzaCBlbmdpbmVcbiAgICovXG4gIGFzeW5jIGluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuaXNJbml0aWFsaXplZCkge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdBbHJlYWR5IGluaXRpYWxpemVkJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXppbmcgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgICBhd2FpdCBzdG9ja2Zpc2hTZXJ2aWNlLmluaXRpYWxpemUoKTtcbiAgICAgIFxuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzSW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnSW5pdGlhbGl6YXRpb24gY29tcGxldGUnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignSW5pdGlhbGl6YXRpb24gZXJyb3I6JywgZXJyKTtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGBGYWlsZWQgdG8gaW5pdGlhbGl6ZSBlbmdpbmU6ICR7ZXJyfWA7XG4gICAgICAgIHRoaXMuaXNJbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmUgZW5naW5lIHNldHRpbmdzXG4gICAqL1xuICBjb25maWd1cmUob3B0aW9uczogeyBtdWx0aVBWPzogbnVtYmVyOyBkZXB0aD86IG51bWJlciB9KTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdDb25maWd1cmluZzonLCBvcHRpb25zKTtcbiAgICBzdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZShvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbmFseXplIGEgcG9zaXRpb24gYW5kIGNsYXNzaWZ5IG1vdmVzXG4gICAqL1xuICBhc3luYyBhbmFseXplUG9zaXRpb24oXG4gICAgZmVuOiBzdHJpbmcsXG4gICAgZGVwdGggPSAyMCxcbiAgICBtdWx0aVBWID0gMTIsXG4gICAgcHVycG9zZTogQW5hbHlzaXNQdXJwb3NlID0gJ2JhY2tncm91bmQnLFxuICApOiBQcm9taXNlPFBvc2l0aW9uQW5hbHlzaXNSZXN1bHQ+IHtcbiAgICBsb2dnZXIuZGVidWcoJ2FuYWx5emVQb3NpdGlvbiBjYWxsZWQnLCB7IGZlbiwgZGVwdGgsIG11bHRpUFYsIHB1cnBvc2UgfSk7XG4gICAgXG4gICAgaWYgKCF0aGlzLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBjYWNoZUtleSA9IGJ1aWxkQW5hbHlzaXNDYWNoZUtleShmZW4sIGRlcHRoLCBtdWx0aVBWKTtcbiAgICAgIGNvbnN0IHJlcXVlc3RJZCA9ICsrdGhpcy5uZXh0UmVxdWVzdElkc1twdXJwb3NlXTtcbiAgICAgIHRoaXMubGF0ZXN0UmVxdWVzdElkc1twdXJwb3NlXSA9IHJlcXVlc3RJZDtcblxuICAgICAgaWYgKHRoaXMuYWN0aXZlQW5hbHlzaXNSdW4pIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlQW5hbHlzaXNSdW4uY2FjaGVLZXkgPT09IGNhY2hlS2V5KSB7XG4gICAgICAgICAgY29uc3Qgc2hhcmVkUmVzdWx0ID0gYXdhaXQgdGhpcy5hY3RpdmVBbmFseXNpc1J1bi5wcm9taXNlO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5zaGFyZWRSZXN1bHQsXG4gICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICBwdXJwb3NlLFxuICAgICAgICAgICAgaWdub3JlZDogaXNTdGFsZUFuYWx5c2lzUmVxdWVzdChyZXF1ZXN0SWQsIHRoaXMubGF0ZXN0UmVxdWVzdElkc1twdXJwb3NlXSkgfHwgc2hhcmVkUmVzdWx0Lmlnbm9yZWQsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwdXJwb3NlID09PSAnZW5naW5lTW92ZScpIHtcbiAgICAgICAgICB0aGlzLmxhdGVzdFJlcXVlc3RJZHNbdGhpcy5hY3RpdmVBbmFseXNpc1J1bi5wdXJwb3NlXSArPSAxO1xuICAgICAgICAgIHN0b2NrZmlzaFNlcnZpY2Uuc3RvcCgpO1xuICAgICAgICAgIGF3YWl0IHRoaXMuYWN0aXZlQW5hbHlzaXNSdW4ucHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHB1cnBvc2UgPT09ICdiYWNrZ3JvdW5kJykge1xuICAgICAgICAgIGF3YWl0IHRoaXMuYWN0aXZlQW5hbHlzaXNSdW4ucHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc0FuYWx5emluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgICAgICBpZiAocHVycG9zZSA9PT0gJ2VuZ2luZU1vdmUnKSB7XG4gICAgICAgICAgdGhpcy5hbmFseXplZE1vdmVzID0gW107XG4gICAgICAgICAgdGhpcy5sYXN0UGlja2VkTW92ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBydW5Qcm9taXNlID0gdGhpcy5wZXJmb3JtUG9zaXRpb25BbmFseXNpcyh7XG4gICAgICAgIGZlbixcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIG11bHRpUFYsXG4gICAgICAgIGNhY2hlS2V5LFxuICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgIHB1cnBvc2UsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuYWN0aXZlQW5hbHlzaXNSdW4gPSB7XG4gICAgICAgIGNhY2hlS2V5LFxuICAgICAgICBmZW4sXG4gICAgICAgIHB1cnBvc2UsXG4gICAgICAgIHByb21pc2U6IHJ1blByb21pc2UsXG4gICAgICB9O1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgcnVuUHJvbWlzZTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuPy5wcm9taXNlID09PSBydW5Qcm9taXNlKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVBbmFseXNpc1J1biA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignQW5hbHlzaXMgZXJyb3I6JywgZXJyKTtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5lcnJvciA9IGBBbmFseXNpcyBmYWlsZWQ6ICR7ZXJyfWA7XG4gICAgICAgIHRoaXMuaXNBbmFseXppbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQaWNrIGEgbW92ZSBmcm9tIHRoZSBhbmFseXplZCBtb3ZlcyB1c2luZyBidWNrZXQgY29uZmlndXJhdGlvblxuICAgKi9cbiAgcGlja01vdmVGcm9tQW5hbHlzaXMoXG4gICAgYW5hbHlzaXM6IFBvc2l0aW9uQW5hbHlzaXNSZXN1bHQsXG4gICAgY29uZmlnOiBCdWNrZXRDb25maWcsXG4gICAgY29udGV4dDogTW92ZVNlbGVjdGlvbkNvbnRleHQsXG4gICk6IFBpY2tlZE1vdmVSZXN1bHQgfCBudWxsIHtcbiAgICBsb2dnZXIuZGVidWcoJ3BpY2tNb3ZlRnJvbUFuYWx5c2lzIGNhbGxlZCcsIHtcbiAgICAgIGFuYWx5emVkTW92ZXNDb3VudDogYW5hbHlzaXMubW92ZXMubGVuZ3RoLFxuICAgICAgY29uZmlnIFxuICAgIH0pO1xuICAgIFxuICAgIGlmIChhbmFseXNpcy5pZ25vcmVkIHx8IGFuYWx5c2lzLm1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdObyBhbmFseXplZCBtb3ZlcyBhdmFpbGFibGUnKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHJhbmRvbVNvdXJjZSA9IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZURldGVybWluaXN0aWNSbmdcbiAgICAgID8gY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlKFxuICAgICAgICAgIGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQoe1xuICAgICAgICAgICAgZ2FtZVN0YXJ0RmVuOiBjb250ZXh0LmdhbWVTdGFydEZlbixcbiAgICAgICAgICAgIGN1cnJlbnRGZW46IGNvbnRleHQuZmVuLFxuICAgICAgICAgICAgbW92ZUNvdW50OiBjb250ZXh0Lm1vdmVDb3VudCxcbiAgICAgICAgICAgIHNpZGVUb01vdmU6IGNvbnRleHQuc2lkZVRvTW92ZSxcbiAgICAgICAgICAgIHBlcnNvbmE6IGNvbnRleHQucGVyc29uYSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgKVxuICAgICAgOiBjcmVhdGVMZWdhY3lSYW5kb21Tb3VyY2UoKTtcblxuICAgIGxldCBlZmZlY3RpdmVDb25maWc6IEJ1Y2tldENvbmZpZyA9IHsgLi4uY29uZmlnIH07XG5cbiAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlUG9zaXRpb25Db21wbGV4aXR5KSB7XG4gICAgICBlZmZlY3RpdmVDb25maWcgPSBhZGp1c3RCdWNrZXRDb25maWdGb3JDb21wbGV4aXR5KGVmZmVjdGl2ZUNvbmZpZywgYW5hbHlzaXMuY29tcGxleGl0eSk7XG4gICAgfVxuXG4gICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZVBlcnNvbmFCZWhhdmlvckJpYXMpIHtcbiAgICAgIGVmZmVjdGl2ZUNvbmZpZyA9IGFwcGx5UGVyc29uYUJ1Y2tldEJpYXMoZWZmZWN0aXZlQ29uZmlnLCBjb250ZXh0LnBlcnNvbmEpIGFzIEJ1Y2tldENvbmZpZztcbiAgICB9XG5cbiAgICBpZiAoY2FuVXNlQnJpbGxpYW50TW92ZUJ1ZGdldChjb250ZXh0Lm1vdmVDb3VudCwgY29udGV4dC5mZW4pKSB7XG4gICAgICBjb25zdCBicmlsbGlhbnRDYW5kaWRhdGVzID0gZ2V0QnJpbGxpYW50TW92ZUNhbmRpZGF0ZXMoY29udGV4dC5mZW4sIGFuYWx5c2lzLm1vdmVzKTtcbiAgICAgIGNvbnN0IHNob3VsZFBpY2tCcmlsbGlhbnQgPSBicmlsbGlhbnRDYW5kaWRhdGVzLmxlbmd0aCA+IDAgJiYgcmFuZG9tU291cmNlLm5leHQoKSA8IDAuMzU7XG5cbiAgICAgIGlmIChzaG91bGRQaWNrQnJpbGxpYW50KSB7XG4gICAgICAgIGNvbnN0IGJyaWxsaWFudE1vdmUgPSBwaWNrQnJpbGxpYW50TW92ZShicmlsbGlhbnRDYW5kaWRhdGVzLCByYW5kb21Tb3VyY2UpO1xuXG4gICAgICAgIGlmIChicmlsbGlhbnRNb3ZlKSB7XG4gICAgICAgICAgY29uc3QgYnJpbGxpYW50UmVzdWx0ID0ge1xuICAgICAgICAgICAgbW92ZTogYnJpbGxpYW50TW92ZSxcbiAgICAgICAgICAgIGJ1Y2tldDogYnJpbGxpYW50TW92ZS5idWNrZXQsXG4gICAgICAgICAgICBpc0JyaWxsaWFudDogdHJ1ZSxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXN0UGlja2VkTW92ZSA9IGJyaWxsaWFudFJlc3VsdDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBicmlsbGlhbnRSZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBidWNrZXRTZWxlY3Rpb24gPSBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvblxuICAgICAgPyBwaWNrQnVja2V0V2l0aENsb3Nlc3RGYWxsYmFjayhhbmFseXNpcy5tb3ZlcywgZWZmZWN0aXZlQ29uZmlnLCAoKSA9PiByYW5kb21Tb3VyY2UubmV4dCgpKVxuICAgICAgOiBwaWNrQnVja2V0TGVnYWN5KGFuYWx5c2lzLm1vdmVzLCBlZmZlY3RpdmVDb25maWcsICgpID0+IHJhbmRvbVNvdXJjZS5uZXh0KCkpO1xuXG4gICAgaWYgKCFidWNrZXRTZWxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHNlbGVjdGVkTW92ZSA9IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZVBlcnNvbmFCZWhhdmlvckJpYXNcbiAgICAgID8gcGlja1BlcnNvbmFCaWFzZWRNb3ZlKGNvbnRleHQuZmVuLCBidWNrZXRTZWxlY3Rpb24ubW92ZXMsIGNvbnRleHQucGVyc29uYSwgcmFuZG9tU291cmNlKVxuICAgICAgOiBwaWNrUmFuZG9tTW92ZUZyb21CdWNrZXQoYnVja2V0U2VsZWN0aW9uLCAoKSA9PiByYW5kb21Tb3VyY2UubmV4dCgpKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgIG1vdmU6IHNlbGVjdGVkTW92ZSxcbiAgICAgIGJ1Y2tldDogYnVja2V0U2VsZWN0aW9uLmJ1Y2tldCxcbiAgICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgICB9O1xuICAgIGxvZ2dlci5kZWJ1ZygnUGlja2VkIG1vdmU6JywgcmVzdWx0KTtcbiAgICBcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICB0aGlzLmxhc3RQaWNrZWRNb3ZlID0gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIGN1cnJlbnQgYW5hbHlzaXNcbiAgICovXG4gIHN0b3BBbmFseXNpcygpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ3N0b3BBbmFseXNpcyBjYWxsZWQnKTtcbiAgICBzdG9ja2Zpc2hTZXJ2aWNlLnN0b3AoKTtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICB0aGlzLmlzQW5hbHl6aW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgYSBuZXcgZ2FtZVxuICAgKi9cbiAgbmV3R2FtZSgpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ25ld0dhbWUgY2FsbGVkJyk7XG4gICAgc3RvY2tmaXNoU2VydmljZS5uZXdHYW1lKCk7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHN0YXRlXG4gICAqL1xuICByZXNldCgpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ3Jlc2V0IGNhbGxlZCcpO1xuICAgIHRoaXMuYW5hbHl6ZWRNb3ZlcyA9IFtdO1xuICAgIHRoaXMubGFzdFBpY2tlZE1vdmUgPSBudWxsO1xuICAgIHRoaXMubGFzdENvbXBsZXhpdHkgPSBudWxsO1xuICAgIHRoaXMubGFzdEFuYWx5c2lzRnJvbUNhY2hlID0gZmFsc2U7XG4gICAgdGhpcy5sYXN0QW5hbHlzaXNQdXJwb3NlID0gbnVsbDtcbiAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICB0aGlzLmlzSW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGVycm9yIG1lc3NhZ2VcbiAgICovXG4gIHNldEVycm9yKG1lc3NhZ2U6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLmVycm9yID0gbWVzc2FnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbW92ZSBzdGF0aXN0aWNzIGJ5IGJ1Y2tldFxuICAgKi9cbiAgZ2V0IG1vdmVTdGF0cygpOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gICAgcmV0dXJuIGdldE1vdmVTdGF0cyh0aGlzLmFuYWx5emVkTW92ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBtb3ZlcyBncm91cGVkIGJ5IGJ1Y2tldFxuICAgKi9cbiAgZ2V0IG1vdmVzQnlCdWNrZXQoKTogTWFwPE1vdmVCdWNrZXQsIENsYXNzaWZpZWRNb3ZlW10+IHtcbiAgICByZXR1cm4gZ3JvdXBNb3Zlc0J5QnVja2V0KHRoaXMuYW5hbHl6ZWRNb3Zlcyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBiZXN0IG1vdmUgKGlmIGF2YWlsYWJsZSlcbiAgICovXG4gIGdldCBiZXN0TW92ZSgpOiBDbGFzc2lmaWVkTW92ZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmFuYWx5emVkTW92ZXMubGVuZ3RoID4gMCA/IHRoaXMuYW5hbHl6ZWRNb3Zlc1swXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlcmUgYXJlIGFuYWx5emVkIG1vdmVzXG4gICAqL1xuICBnZXQgaGFzQW5hbHl6ZWRNb3ZlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hbmFseXplZE1vdmVzLmxlbmd0aCA+IDA7XG4gIH1cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIGVuZ2luZVxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ2Rlc3Ryb3kgY2FsbGVkJyk7XG4gICAgc3RvY2tmaXNoU2VydmljZS5kZXN0cm95KCk7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5pc0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHBlcmZvcm1Qb3NpdGlvbkFuYWx5c2lzKG9wdGlvbnM6IHtcbiAgICBmZW46IHN0cmluZztcbiAgICBkZXB0aDogbnVtYmVyO1xuICAgIG11bHRpUFY6IG51bWJlcjtcbiAgICBjYWNoZUtleTogc3RyaW5nO1xuICAgIHJlcXVlc3RJZDogbnVtYmVyO1xuICAgIHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZTtcbiAgfSk6IFByb21pc2U8UG9zaXRpb25BbmFseXNpc1Jlc3VsdD4ge1xuICAgIGNvbnN0IHsgZmVuLCBkZXB0aCwgbXVsdGlQViwgY2FjaGVLZXksIHJlcXVlc3RJZCwgcHVycG9zZSB9ID0gb3B0aW9ucztcbiAgICBsZXQgY2FjaGVkQ2xhc3NpZmllZE1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdIHwgdW5kZWZpbmVkO1xuICAgIGxldCBmcm9tQ2FjaGUgPSBmYWxzZTtcbiAgICBsZXQgbW92ZXM6IEFuYWx5emVkTW92ZVtdID0gW107XG5cbiAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlTW92ZUFuYWx5c2lzQ2FjaGUpIHtcbiAgICAgIGNvbnN0IGNhY2hlZCA9IGFuYWx5c2lzQ2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICAgIGlmIChjYWNoZWQpIHtcbiAgICAgICAgbW92ZXMgPSBjYWNoZWQubW92ZXM7XG4gICAgICAgIGNhY2hlZENsYXNzaWZpZWRNb3ZlcyA9IGNhY2hlZC5jbGFzc2lmaWVkTW92ZXM7XG4gICAgICAgIGZyb21DYWNoZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgc3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUoeyBkZXB0aCwgbXVsdGlQViB9KTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnU3RhcnRpbmcgYW5hbHlzaXMuLi4nKTtcbiAgICAgIG1vdmVzID0gYXdhaXQgc3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24oZmVuKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnQW5hbHlzaXMgY29tcGxldGUsIGdvdCcsIG1vdmVzLmxlbmd0aCwgJ21vdmVzJyk7XG5cbiAgICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VNb3ZlQW5hbHlzaXNDYWNoZSkge1xuICAgICAgICBhbmFseXNpc0NhY2hlLnNldCh7XG4gICAgICAgICAga2V5OiBjYWNoZUtleSxcbiAgICAgICAgICBtb3ZlcyxcbiAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIuZGVidWcoJ1VzaW5nIGNhY2hlZCBhbmFseXNpcyBmb3IgY3VycmVudCBwb3NpdGlvbicpO1xuICAgIH1cblxuICAgIGNvbnN0IGNsYXNzaWZpZWQgPSBjYWNoZWRDbGFzc2lmaWVkTW92ZXMgPz8gY2xhc3NpZnlNb3Zlcyhtb3Zlcyk7XG4gICAgY29uc3QgY29tcGxleGl0eSA9IGNhbGN1bGF0ZVBvc2l0aW9uQ29tcGxleGl0eShtb3Zlcyk7XG4gICAgY29uc3QgaWdub3JlZCA9IGlzU3RhbGVBbmFseXNpc1JlcXVlc3QocmVxdWVzdElkLCB0aGlzLmxhdGVzdFJlcXVlc3RJZHNbcHVycG9zZV0pO1xuXG4gICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZU1vdmVBbmFseXNpc0NhY2hlICYmIG1vdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGFuYWx5c2lzQ2FjaGUuc2V0KHtcbiAgICAgICAga2V5OiBjYWNoZUtleSxcbiAgICAgICAgbW92ZXMsXG4gICAgICAgIGNsYXNzaWZpZWRNb3ZlczogY2xhc3NpZmllZCxcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFpZ25vcmVkKSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMubGFzdEFuYWx5c2lzRnJvbUNhY2hlID0gZnJvbUNhY2hlO1xuICAgICAgICB0aGlzLmxhc3RBbmFseXNpc1B1cnBvc2UgPSBwdXJwb3NlO1xuICAgICAgICBpZiAocHVycG9zZSA9PT0gJ2VuZ2luZU1vdmUnKSB7XG4gICAgICAgICAgdGhpcy5hbmFseXplZE1vdmVzID0gY2xhc3NpZmllZDtcbiAgICAgICAgICB0aGlzLmxhc3RDb21wbGV4aXR5ID0gY29tcGxleGl0eTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzQW5hbHl6aW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aXZlQW5hbHlzaXNSdW4/LnB1cnBvc2UgPT09IHB1cnBvc2UpIHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc0FuYWx5emluZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlcXVlc3RJZCxcbiAgICAgIGFuYWx5emVkRmVuOiBmZW4sXG4gICAgICBtb3ZlczogY2xhc3NpZmllZCxcbiAgICAgIGNvbXBsZXhpdHksXG4gICAgICBpZ25vcmVkLFxuICAgICAgZnJvbUNhY2hlLFxuICAgICAgcHVycG9zZSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0IGFuYWx5c2lzU3RhdHVzTGFiZWwoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5lcnJvcikge1xuICAgICAgcmV0dXJuICdFbmdpbmUgZXJyb3InO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzSW5pdGlhbGl6aW5nKSB7XG4gICAgICByZXR1cm4gJ1N0YXJ0aW5nIGVuZ2luZSc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNBbmFseXppbmcpIHtcbiAgICAgIHJldHVybiB0aGlzLmxhc3RBbmFseXNpc1B1cnBvc2UgPT09ICdiYWNrZ3JvdW5kJ1xuICAgICAgICA/ICdSdW5uaW5nIGJhY2tncm91bmQgYW5hbHlzaXMnXG4gICAgICAgIDogJ0FuYWx5emluZyBwb3NpdGlvbic7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybiAnTm90IGluaXRpYWxpemVkJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5sYXN0QW5hbHlzaXNQdXJwb3NlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJ1JlYWR5JztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5sYXN0QW5hbHlzaXNGcm9tQ2FjaGUgPyAnUmVhZHkgKGNhY2hlIHdhcm0pJyA6ICdSZWFkeSc7XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgZW5naW5lVmlld01vZGVsID0gbmV3IEVuZ2luZVZpZXdNb2RlbCgpO1xuIiwgIi8qKlxuICogQ29uZmlnIFZpZXdNb2RlbFxuICogVmlld01vZGVsIGxheWVyIC0gTW9iWCBzdG9yZSBmb3IgYnVja2V0IGNvbmZpZ3VyYXRpb25cbiAqL1xuXG5pbXBvcnQgeyBtYWtlQXV0b09ic2VydmFibGUsIGFjdGlvbiwgcmVhY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IEJ1Y2tldENvbmZpZywgTW92ZUJ1Y2tldCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLCBNb3ZlUXVhbGl0eVByZXNldElkLCBNT1ZFX1FVQUxJVFlfUFJFU0VUUyB9IGZyb20gJy4uL2VuZ2luZS90eXBlcyc7XG5pbXBvcnQgeyBFTkdJTkVfQ09ORklHX1NUT1JBR0VfS0VZIH0gZnJvbSAnLi4vZW5naW5lL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7IG5vcm1hbGl6ZUJ1Y2tldENvbmZpZywgdmFsaWRhdGVCdWNrZXRDb25maWcgfSBmcm9tICcuLi9lbmdpbmUvbW92ZVBpY2tlcic7XG5pbXBvcnQgeyBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gJy4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwnO1xuXG5pbnRlcmZhY2UgUGVyc2lzdGVkRW5naW5lQ29uZmlnIHtcbiAgYnVja2V0Q29uZmlnOiBCdWNrZXRDb25maWc7XG4gIGN1cnJlbnRQcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGw7XG4gIGRlcHRoOiBudW1iZXI7XG4gIG11bHRpUFY6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIENvbmZpZ1ZpZXdNb2RlbCB7XG4gIGJ1Y2tldENvbmZpZzogQnVja2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcgfTtcbiAgLyoqIElkIG9mIHRoZSBhY3RpdmUgcHJlc2V0LCBvciBudWxsIGlmIHVzaW5nIGN1c3RvbSBkaXN0cmlidXRpb24gKi9cbiAgY3VycmVudFByZXNldElkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbCA9ICdtZWRpdW0nO1xuICBkZXB0aCA9IDg7XG4gIG11bHRpUFYgPSAxMjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0QnVja2V0VmFsdWU6IGFjdGlvbixcbiAgICAgIHNldEJ1Y2tldENvbmZpZzogYWN0aW9uLFxuICAgICAgYXBwbHlQcm9maWxlU25hcHNob3Q6IGFjdGlvbixcbiAgICAgIGFwcGx5UHJlc2V0OiBhY3Rpb24sXG4gICAgICByZXNldFRvRGVmYXVsdHM6IGFjdGlvbixcbiAgICAgIG5vcm1hbGl6ZUNvbmZpZzogYWN0aW9uLFxuICAgICAgc2V0RGVwdGg6IGFjdGlvbixcbiAgICAgIHNldE11bHRpUFY6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG5cbiAgICByZWFjdGlvbihcbiAgICAgICgpID0+ICh7XG4gICAgICAgIGJ1Y2tldENvbmZpZzogdGhpcy5idWNrZXRDb25maWcsXG4gICAgICAgIGN1cnJlbnRQcmVzZXRJZDogdGhpcy5jdXJyZW50UHJlc2V0SWQsXG4gICAgICAgIGRlcHRoOiB0aGlzLmRlcHRoLFxuICAgICAgICBtdWx0aVBWOiB0aGlzLm11bHRpUFYsXG4gICAgICAgIHBlcnNpc3RFbmdpbmVDb25maWc6IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnBlcnNpc3RFbmdpbmVDb25maWcsXG4gICAgICB9KSxcbiAgICAgICh7IHBlcnNpc3RFbmdpbmVDb25maWcgfSkgPT4ge1xuICAgICAgICBpZiAoIXBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgICB0aGlzLmNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgICAgfSxcbiAgICAgIHsgZmlyZUltbWVkaWF0ZWx5OiB0cnVlIH0sXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHBlcmNlbnRhZ2UgdmFsdWUgZm9yIGEgc3BlY2lmaWMgYnVja2V0XG4gICAqL1xuICBzZXRCdWNrZXRWYWx1ZShidWNrZXQ6IE1vdmVCdWNrZXQsIHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjbGFtcGVkVmFsdWUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIHZhbHVlKSk7XG4gICAgdGhpcy5jdXJyZW50UHJlc2V0SWQgPSBudWxsOyAvLyBzd2l0Y2hpbmcgdG8gY3VzdG9tXG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJ1Y2tldENvbmZpZyxcbiAgICAgIFtidWNrZXRdOiBjbGFtcGVkVmFsdWUsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGZ1bGwgYnVja2V0IGNvbmZpZyAoZS5nLiB3aGVuIGFwcGx5aW5nIGEgcHJlc2V0KVxuICAgKi9cbiAgc2V0QnVja2V0Q29uZmlnKGNvbmZpZzogQnVja2V0Q29uZmlnKTogdm9pZCB7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLmNvbmZpZyB9O1xuICB9XG5cbiAgYXBwbHlQcm9maWxlU25hcHNob3Qoc25hcHNob3Q6IHtcbiAgICBidWNrZXRDb25maWc6IEJ1Y2tldENvbmZpZztcbiAgICBjdXJyZW50UHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsO1xuICAgIGRlcHRoOiBudW1iZXI7XG4gICAgbXVsdGlQVjogbnVtYmVyO1xuICB9KTogdm9pZCB7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLnNuYXBzaG90LmJ1Y2tldENvbmZpZyB9O1xuICAgIHRoaXMuY3VycmVudFByZXNldElkID0gc25hcHNob3QuY3VycmVudFByZXNldElkO1xuICAgIHRoaXMuZGVwdGggPSBNYXRoLm1heCgxLCBNYXRoLm1pbigzMCwgc25hcHNob3QuZGVwdGgpKTtcbiAgICB0aGlzLm11bHRpUFYgPSBNYXRoLm1heCgxLCBNYXRoLm1pbigyMCwgc25hcHNob3QubXVsdGlQVikpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IGEgcHJlZGVmaW5lZCBtb3ZlIHF1YWxpdHkgcHJlc2V0IGJ5IGlkXG4gICAqL1xuICBhcHBseVByZXNldChwcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCk6IHZvaWQge1xuICAgIGNvbnN0IHByZXNldCA9IE1PVkVfUVVBTElUWV9QUkVTRVRTLmZpbmQocCA9PiBwLmlkID09PSBwcmVzZXRJZCk7XG4gICAgaWYgKHByZXNldCkge1xuICAgICAgdGhpcy5jdXJyZW50UHJlc2V0SWQgPSBwcmVzZXRJZDtcbiAgICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5wcmVzZXQuY29uZmlnIH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IGJ1Y2tldCBjb25maWd1cmF0aW9uIHRvIGRlZmF1bHRzIChtZWRpdW0gcHJlc2V0KVxuICAgKi9cbiAgcmVzZXRUb0RlZmF1bHRzKCk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudFByZXNldElkID0gJ21lZGl1bSc7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZSB0aGUgY29uZmlndXJhdGlvbiBzbyBwZXJjZW50YWdlcyBzdW0gdG8gMTAwXG4gICAqL1xuICBub3JtYWxpemVDb25maWcoKTogdm9pZCB7XG4gICAgdGhpcy5idWNrZXRDb25maWcgPSBub3JtYWxpemVCdWNrZXRDb25maWcodGhpcy5idWNrZXRDb25maWcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbmFseXNpcyBkZXB0aFxuICAgKi9cbiAgc2V0RGVwdGgodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuZGVwdGggPSBNYXRoLm1heCgxLCBNYXRoLm1pbigzMCwgdmFsdWUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgTXVsdGlQViB2YWx1ZVxuICAgKi9cbiAgc2V0TXVsdGlQVih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5tdWx0aVBWID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMjAsIHZhbHVlKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRvdGFsIHBlcmNlbnRhZ2Ugc3VtXG4gICAqL1xuICBnZXQgdG90YWxQZXJjZW50YWdlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5idWNrZXRDb25maWcpLnJlZHVjZSgoc3VtLCB2YWwpID0+IHN1bSArIHZhbCwgMCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgY29uZmlndXJhdGlvbiBpcyB2YWxpZCAoc3VtcyB0byAxMDApXG4gICAqL1xuICBnZXQgaXNWYWxpZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHZhbGlkIH0gPSB2YWxpZGF0ZUJ1Y2tldENvbmZpZyh0aGlzLmJ1Y2tldENvbmZpZyk7XG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdmFsaWRhdGlvbiBzdGF0ZVxuICAgKi9cbiAgZ2V0IHZhbGlkYXRpb25TdGF0ZSgpOiB7IHZhbGlkOiBib29sZWFuOyB0b3RhbDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB2YWxpZGF0ZUJ1Y2tldENvbmZpZyh0aGlzLmJ1Y2tldENvbmZpZyk7XG4gIH1cblxuICBnZXQgYWN0aXZlUGVyc29uYUlkKCk6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UHJlc2V0SWQ7XG4gIH1cblxuICBnZXQgYWN0aXZlUGVyc29uYUxhYmVsKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuY3VycmVudFByZXNldElkID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gJ0N1c3RvbSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1PVkVfUVVBTElUWV9QUkVTRVRTLmZpbmQoKHByZXNldCkgPT4gcHJlc2V0LmlkID09PSB0aGlzLmN1cnJlbnRQcmVzZXRJZCk/LmxhYmVsID8/ICdDdXN0b20nO1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZCkgYXMgUGFydGlhbDxQZXJzaXN0ZWRFbmdpbmVDb25maWc+O1xuICAgICAgaWYgKHBhcnNlZC5idWNrZXRDb25maWcpIHtcbiAgICAgICAgdGhpcy5idWNrZXRDb25maWcgPSB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRywgLi4ucGFyc2VkLmJ1Y2tldENvbmZpZyB9O1xuICAgICAgfVxuICAgICAgaWYgKHBhcnNlZC5jdXJyZW50UHJlc2V0SWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmN1cnJlbnRQcmVzZXRJZCA9IHBhcnNlZC5jdXJyZW50UHJlc2V0SWQ7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhcnNlZC5kZXB0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgdGhpcy5kZXB0aCA9IE1hdGgubWF4KDEsIE1hdGgubWluKDMwLCBwYXJzZWQuZGVwdGgpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGFyc2VkLm11bHRpUFYgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHRoaXMubXVsdGlQViA9IE1hdGgubWF4KDEsIE1hdGgubWluKDIwLCBwYXJzZWQubXVsdGlQVikpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQ29uZmlnVmlld01vZGVsXSBGYWlsZWQgdG8gcmVzdG9yZSBlbmdpbmUgY29uZmlnOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNuYXBzaG90OiBQZXJzaXN0ZWRFbmdpbmVDb25maWcgPSB7XG4gICAgICAgIGJ1Y2tldENvbmZpZzogdGhpcy5idWNrZXRDb25maWcsXG4gICAgICAgIGN1cnJlbnRQcmVzZXRJZDogdGhpcy5jdXJyZW50UHJlc2V0SWQsXG4gICAgICAgIGRlcHRoOiB0aGlzLmRlcHRoLFxuICAgICAgICBtdWx0aVBWOiB0aGlzLm11bHRpUFYsXG4gICAgICB9O1xuXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShFTkdJTkVfQ09ORklHX1NUT1JBR0VfS0VZLCBKU09OLnN0cmluZ2lmeShzbmFwc2hvdCkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQ29uZmlnVmlld01vZGVsXSBGYWlsZWQgdG8gcGVyc2lzdCBlbmdpbmUgY29uZmlnOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUGVyc2lzdGVkU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDb25maWdWaWV3TW9kZWxdIEZhaWxlZCB0byBjbGVhciBlbmdpbmUgY29uZmlnIHN0b3JhZ2U6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBTaW5nbGV0b24gaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBjb25maWdWaWV3TW9kZWwgPSBuZXcgQ29uZmlnVmlld01vZGVsKCk7XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IE1vdmVRdWFsaXR5UHJlc2V0SWQgfSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuXG50eXBlIFNldHRpbmdzVGFiSWQgPVxuICB8ICdnZW5lcmFsJ1xuICB8ICdlbmdpbmUnXG4gIHwgJ3BlcnNvbmFsaXR5J1xuICB8ICdicmlsbGlhbnQnXG4gIHwgJ2FkdmFuY2VkJ1xuICB8ICdkZWJ1ZydcbiAgfCAnYWJvdXQnO1xuXG50eXBlIEFuaW1hdGlvblNwZWVkID0gJ3Nsb3cnIHwgJ25vcm1hbCcgfCAnZmFzdCc7XG50eXBlIFRoZW1lTW9kZSA9ICdkYXJrJyB8ICdsaWdodCcgfCAnbWluaW1hbCcgfCAncGVyc29uYSc7XG50eXBlIEJvYXJkU2l6ZVByZXNldCA9ICdzbWFsbCcgfCAnbWVkaXVtJyB8ICdsYXJnZScgfCAneGxhcmdlJztcbnR5cGUgQXV0b1BsYXlTcGVlZCA9ICdzbG93JyB8ICdub3JtYWwnIHwgJ2Zhc3QnO1xuXG5jb25zdCBCT0FSRF9TSVpFX1BSRVNFVF9QSVhFTFM6IFJlY29yZDxCb2FyZFNpemVQcmVzZXQsIG51bWJlcj4gPSB7XG4gIHNtYWxsOiA0ODAsXG4gIG1lZGl1bTogNjQwLFxuICBsYXJnZTogODAwLFxuICB4bGFyZ2U6IDk2MCxcbn07XG5cbmludGVyZmFjZSBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzIHtcbiAgYmFzaWNNb2RlOiBib29sZWFuO1xuICBhbmltYXRpb25TcGVlZDogQW5pbWF0aW9uU3BlZWQ7XG4gIHNvdW5kRW5hYmxlZDogYm9vbGVhbjtcbiAgc291bmRNdXRlZDogYm9vbGVhbjtcbiAgc291bmRWb2x1bWU6IG51bWJlcjtcbiAgYXV0b1BsYXlTcGVlZDogQXV0b1BsYXlTcGVlZDtcbiAgdGhlbWVNb2RlOiBUaGVtZU1vZGU7XG4gIGJvYXJkU2l6ZVByZXNldDogQm9hcmRTaXplUHJlc2V0O1xuICBzZWxlY3RlZFNldHRpbmdzVGFiOiBTZXR0aW5nc1RhYklkO1xufVxuXG5jb25zdCBVSV9QUkVGRVJFTkNFU19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfdWlfcHJlZmVyZW5jZXMnO1xuXG5jb25zdCBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTOiBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzID0ge1xuICBiYXNpY01vZGU6IHRydWUsXG4gIGFuaW1hdGlvblNwZWVkOiAnbm9ybWFsJyxcbiAgc291bmRFbmFibGVkOiB0cnVlLFxuICBzb3VuZE11dGVkOiBmYWxzZSxcbiAgc291bmRWb2x1bWU6IDcwLFxuICBhdXRvUGxheVNwZWVkOiAnbm9ybWFsJyxcbiAgdGhlbWVNb2RlOiAnZGFyaycsXG4gIGJvYXJkU2l6ZVByZXNldDogJ21lZGl1bScsXG4gIHNlbGVjdGVkU2V0dGluZ3NUYWI6ICdnZW5lcmFsJyxcbn07XG5cbmNvbnN0IEFVVE9fUExBWV9TUEVFRF9ERUxBWVM6IFJlY29yZDxBdXRvUGxheVNwZWVkLCBudW1iZXI+ID0ge1xuICBzbG93OiAxMjAwLFxuICBub3JtYWw6IDcwMCxcbiAgZmFzdDogMzUwLFxufTtcblxuZXhwb3J0IGNsYXNzIFVpU3RhdGVWaWV3TW9kZWwge1xuICBzZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgYmFzaWNNb2RlID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5iYXNpY01vZGU7XG4gIGFuaW1hdGlvblNwZWVkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5hbmltYXRpb25TcGVlZDtcbiAgc291bmRFbmFibGVkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZEVuYWJsZWQ7XG4gIHNvdW5kTXV0ZWQgPSBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnNvdW5kTXV0ZWQ7XG4gIHNvdW5kVm9sdW1lID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZFZvbHVtZTtcbiAgYXV0b1BsYXlTcGVlZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYXV0b1BsYXlTcGVlZDtcbiAgdGhlbWVNb2RlID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy50aGVtZU1vZGU7XG4gIGJvYXJkU2l6ZVByZXNldCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYm9hcmRTaXplUHJlc2V0O1xuICBzZWxlY3RlZFNldHRpbmdzVGFiOiBTZXR0aW5nc1RhYklkID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zZWxlY3RlZFNldHRpbmdzVGFiO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXRTZXR0aW5nc09wZW46IGFjdGlvbixcbiAgICAgIGFwcGx5UHJvZmlsZVByZWZlcmVuY2VzOiBhY3Rpb24sXG4gICAgICBzZXRCYXNpY01vZGU6IGFjdGlvbixcbiAgICAgIHNldEFuaW1hdGlvblNwZWVkOiBhY3Rpb24sXG4gICAgICBzZXRTb3VuZEVuYWJsZWQ6IGFjdGlvbixcbiAgICAgIHNldFNvdW5kTXV0ZWQ6IGFjdGlvbixcbiAgICAgIHNldFNvdW5kVm9sdW1lOiBhY3Rpb24sXG4gICAgICBzZXRBdXRvUGxheVNwZWVkOiBhY3Rpb24sXG4gICAgICBzZXRUaGVtZU1vZGU6IGFjdGlvbixcbiAgICAgIHNldEJvYXJkU2l6ZVByZXNldDogYWN0aW9uLFxuICAgICAgc2V0U2VsZWN0ZWRTZXR0aW5nc1RhYjogYWN0aW9uLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZXN0b3JlRnJvbVN0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNldHRpbmdzT3BlbihvcGVuOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBvcGVuO1xuICB9XG5cbiAgYXBwbHlQcm9maWxlUHJlZmVyZW5jZXMocHJlZmVyZW5jZXM6IFBhcnRpYWw8UGljazxQZXJzaXN0ZWRVaVByZWZlcmVuY2VzLCAnYmFzaWNNb2RlJyB8ICd0aGVtZU1vZGUnPj4pOiB2b2lkIHtcbiAgICB0aGlzLmJhc2ljTW9kZSA9IHByZWZlcmVuY2VzLmJhc2ljTW9kZSA/PyB0aGlzLmJhc2ljTW9kZTtcbiAgICB0aGlzLnRoZW1lTW9kZSA9IHByZWZlcmVuY2VzLnRoZW1lTW9kZSA/PyB0aGlzLnRoZW1lTW9kZTtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldEJhc2ljTW9kZShlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5iYXNpY01vZGUgPSBlbmFibGVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0QW5pbWF0aW9uU3BlZWQoc3BlZWQ6IEFuaW1hdGlvblNwZWVkKTogdm9pZCB7XG4gICAgdGhpcy5hbmltYXRpb25TcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U291bmRFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNvdW5kRW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTb3VuZE11dGVkKG11dGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zb3VuZE11dGVkID0gbXV0ZWQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTb3VuZFZvbHVtZSh2b2x1bWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuc291bmRWb2x1bWUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIE1hdGgucm91bmQodm9sdW1lKSkpO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0QXV0b1BsYXlTcGVlZChzcGVlZDogQXV0b1BsYXlTcGVlZCk6IHZvaWQge1xuICAgIHRoaXMuYXV0b1BsYXlTcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0VGhlbWVNb2RlKHRoZW1lTW9kZTogVGhlbWVNb2RlKTogdm9pZCB7XG4gICAgdGhpcy50aGVtZU1vZGUgPSB0aGVtZU1vZGU7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRCb2FyZFNpemVQcmVzZXQoYm9hcmRTaXplUHJlc2V0OiBCb2FyZFNpemVQcmVzZXQpOiB2b2lkIHtcbiAgICB0aGlzLmJvYXJkU2l6ZVByZXNldCA9IGJvYXJkU2l6ZVByZXNldDtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNlbGVjdGVkU2V0dGluZ3NUYWIodGFiOiBTZXR0aW5nc1RhYklkKTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3RlZFNldHRpbmdzVGFiID0gdGFiO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oVUlfUFJFRkVSRU5DRVNfU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKCFzYXZlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzIFBhcnRpYWw8UGVyc2lzdGVkVWlQcmVmZXJlbmNlcz47XG4gICAgICB0aGlzLmJhc2ljTW9kZSA9IHBhcnNlZC5iYXNpY01vZGUgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5iYXNpY01vZGU7XG4gICAgICB0aGlzLmFuaW1hdGlvblNwZWVkID0gcGFyc2VkLmFuaW1hdGlvblNwZWVkID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYW5pbWF0aW9uU3BlZWQ7XG4gICAgICB0aGlzLnNvdW5kRW5hYmxlZCA9IHBhcnNlZC5zb3VuZEVuYWJsZWQgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZEVuYWJsZWQ7XG4gICAgICB0aGlzLnNvdW5kTXV0ZWQgPSBwYXJzZWQuc291bmRNdXRlZCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnNvdW5kTXV0ZWQ7XG4gICAgICB0aGlzLnNvdW5kVm9sdW1lID0gdHlwZW9mIHBhcnNlZC5zb3VuZFZvbHVtZSA9PT0gJ251bWJlcidcbiAgICAgICAgPyBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIE1hdGgucm91bmQocGFyc2VkLnNvdW5kVm9sdW1lKSkpXG4gICAgICAgIDogREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5zb3VuZFZvbHVtZTtcbiAgICAgIHRoaXMuYXV0b1BsYXlTcGVlZCA9IHBhcnNlZC5hdXRvUGxheVNwZWVkID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYXV0b1BsYXlTcGVlZDtcbiAgICAgIHRoaXMudGhlbWVNb2RlID0gcGFyc2VkLnRoZW1lTW9kZSA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnRoZW1lTW9kZTtcbiAgICAgIHRoaXMuYm9hcmRTaXplUHJlc2V0ID0gcGFyc2VkLmJvYXJkU2l6ZVByZXNldCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmJvYXJkU2l6ZVByZXNldDtcbiAgICAgIHRoaXMuc2VsZWN0ZWRTZXR0aW5nc1RhYiA9IHBhcnNlZC5zZWxlY3RlZFNldHRpbmdzVGFiID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc2VsZWN0ZWRTZXR0aW5nc1RhYjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBpbnZhbGlkIFVJIHByZWZlcmVuY2Ugc25hcHNob3RzLlxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGVyc2lzdFRvU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgIFVJX1BSRUZFUkVOQ0VTX1NUT1JBR0VfS0VZLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgYmFzaWNNb2RlOiB0aGlzLmJhc2ljTW9kZSxcbiAgICAgICAgICBhbmltYXRpb25TcGVlZDogdGhpcy5hbmltYXRpb25TcGVlZCxcbiAgICAgICAgICBzb3VuZEVuYWJsZWQ6IHRoaXMuc291bmRFbmFibGVkLFxuICAgICAgICAgIHNvdW5kTXV0ZWQ6IHRoaXMuc291bmRNdXRlZCxcbiAgICAgICAgICBzb3VuZFZvbHVtZTogdGhpcy5zb3VuZFZvbHVtZSxcbiAgICAgICAgICBhdXRvUGxheVNwZWVkOiB0aGlzLmF1dG9QbGF5U3BlZWQsXG4gICAgICAgICAgdGhlbWVNb2RlOiB0aGlzLnRoZW1lTW9kZSxcbiAgICAgICAgICBib2FyZFNpemVQcmVzZXQ6IHRoaXMuYm9hcmRTaXplUHJlc2V0LFxuICAgICAgICAgIHNlbGVjdGVkU2V0dGluZ3NUYWI6IHRoaXMuc2VsZWN0ZWRTZXR0aW5nc1RhYixcbiAgICAgICAgfSBhcyBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzKSxcbiAgICAgICk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBJZ25vcmUgbG9jYWxTdG9yYWdlIGlzc3VlcyBhbmQga2VlcCBVSSByZXNwb25zaXZlLlxuICAgIH1cbiAgfVxuXG4gIGdldCBib2FyZFNpemVQeCgpOiBudW1iZXIge1xuICAgIHJldHVybiBCT0FSRF9TSVpFX1BSRVNFVF9QSVhFTFNbdGhpcy5ib2FyZFNpemVQcmVzZXRdO1xuICB9XG5cbiAgZ2V0IGF1dG9QbGF5RGVsYXlNcygpOiBudW1iZXIge1xuICAgIHJldHVybiBBVVRPX1BMQVlfU1BFRURfREVMQVlTW3RoaXMuYXV0b1BsYXlTcGVlZF07XG4gIH1cblxuICBnZXQgZWZmZWN0aXZlU291bmRWb2x1bWUoKTogbnVtYmVyIHtcbiAgICBpZiAoIXRoaXMuc291bmRFbmFibGVkIHx8IHRoaXMuc291bmRNdXRlZCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc291bmRWb2x1bWUgLyAxMDA7XG4gIH1cblxuICBnZXRQZXJzb25hQWNjZW50VG9uZShwZXJzb25hSWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsKTogJ3JlZCcgfCAnZ29sZCcgfCAnYmx1ZScgfCAnZ3JlZW4nIHtcbiAgICBzd2l0Y2ggKHBlcnNvbmFJZCkge1xuICAgICAgY2FzZSAnYWdncmVzc2l2ZSc6XG4gICAgICAgIHJldHVybiAncmVkJztcbiAgICAgIGNhc2UgJ2hhcmQnOlxuICAgICAgY2FzZSAnc3VwZXJfaGFyZCc6XG4gICAgICAgIHJldHVybiAnZ29sZCc7XG4gICAgICBjYXNlICdsb3cnOlxuICAgICAgICByZXR1cm4gJ2dyZWVuJztcbiAgICAgIGNhc2UgJ21lZGl1bSc6XG4gICAgICBjYXNlIG51bGw6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ2JsdWUnO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgdWlTdGF0ZVZpZXdNb2RlbCA9IG5ldyBVaVN0YXRlVmlld01vZGVsKCk7XG5cbmV4cG9ydCB7IEJPQVJEX1NJWkVfUFJFU0VUX1BJWEVMUyB9O1xuZXhwb3J0IHR5cGUgeyBBbmltYXRpb25TcGVlZCwgQXV0b1BsYXlTcGVlZCwgQm9hcmRTaXplUHJlc2V0LCBTZXR0aW5nc1RhYklkLCBUaGVtZU1vZGUgfTtcbiIsICIvKipcbiAqIEJvYXJkIFZpZXdNb2RlbFxuICogVmlld01vZGVsIGxheWVyIC0gTW9iWCBzdG9yZSBmb3IgY2hlc3MgYm9hcmQgc3RhdGVcbiAqL1xuXG5pbXBvcnQgeyBtYWtlQXV0b09ic2VydmFibGUsIGFjdGlvbiwgcmVhY3Rpb24sIHJ1bkluQWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBDaGVzcywgTW92ZSwgU3F1YXJlIH0gZnJvbSAnY2hlc3MuanMnO1xuaW1wb3J0IHsgY2FuQXBwbHlBbmFseXplZE1vdmUgfSBmcm9tICcuLi9lbmdpbmUvYW5hbHlzaXNTYWZldHknO1xuaW1wb3J0IHsgZGVyaXZlQnJpbGxpYW50VXNhZ2UsIE1vdmVBbm5vdGF0aW9uIH0gZnJvbSAnLi4vZW5naW5lL2JyaWxsaWFudFRyYWNraW5nJztcbmltcG9ydCB7IFBlcnNpc3RlZEJvYXJkU3RhdGUsIGNyZWF0ZUdhbWVTZXNzaW9uSWQsIHJlc29sdmVQZ25TdGFydEZlbiB9IGZyb20gJy4uL2VuZ2luZS9nYW1lU2Vzc2lvbic7XG5pbXBvcnQgeyBHYW1lU2V0dXBQcmVzZXQgfSBmcm9tICcuLi9lbmdpbmUvZ2FtZVNldHVwUHJlc2V0cyc7XG5pbXBvcnQgeyBlbmdpbmVWaWV3TW9kZWwgfSBmcm9tICcuL0VuZ2luZVZpZXdNb2RlbCc7XG5pbXBvcnQgeyBjb25maWdWaWV3TW9kZWwgfSBmcm9tICcuL0NvbmZpZ1ZpZXdNb2RlbCc7XG5pbXBvcnQgeyBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9IGZyb20gJy4vRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwnO1xuaW1wb3J0IHsgY3JlYXRlRGVidWdMb2dnZXIgfSBmcm9tICcuLi9zaGFyZWQvZGVidWcnO1xuaW1wb3J0IHtcbiAgUGlja2VkTW92ZVJlc3VsdCxcbiAgTW92ZUJ1Y2tldCxcbiAgRGlzcGxheU1vdmVCdWNrZXQsXG4gIERJU1BMQVlfQlVDS0VUX0xBQkVMUyxcbiAgQlVDS0VUX0xBQkVMUyxcbiAgQlVDS0VUX0NPTE9SUyxcbiAgRElTUExBWV9CVUNLRVRfQ09MT1JTLFxufSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuaW1wb3J0IHsgY2FsY3VsYXRlSHVtYW5EZWxheU1zIH0gZnJvbSAnLi4vZW5naW5lL3BlcnNvbmFCaWFzJztcbmltcG9ydCB7IG1hcExlZ2FsTW92ZXNUb0J1Y2tldHMgfSBmcm9tICcuLi9lbmdpbmUvbW92ZUNsYXNzaWZpZXInO1xuaW1wb3J0IHsgdWlTdGF0ZVZpZXdNb2RlbCB9IGZyb20gJy4vVWlTdGF0ZVZpZXdNb2RlbCc7XG5cbmNvbnN0IGxvZ2dlciA9IGNyZWF0ZURlYnVnTG9nZ2VyKCdCb2FyZFZpZXdNb2RlbCcpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlY2VudE1vdmVGZWVkYmFjayB7XG4gIGlkOiBzdHJpbmc7XG4gIGFjdG9yOiAncGxheWVyJyB8ICdlbmdpbmUnIHwgJ3JlZG8nO1xuICBzYW46IHN0cmluZztcbiAgcXVhbGl0eUxhYmVsPzogc3RyaW5nIHwgbnVsbDtcbiAgYnVja2V0PzogRGlzcGxheU1vdmVCdWNrZXQgfCBNb3ZlQnVja2V0IHwgbnVsbDtcbiAgaXNCcmlsbGlhbnQ6IGJvb2xlYW47XG4gIGlzQ2FwdHVyZTogYm9vbGVhbjtcbiAgaXNDaGVjazogYm9vbGVhbjtcbiAgaXNHYW1lRW5kOiBib29sZWFuO1xuICBzaWxlbnQ6IGJvb2xlYW47XG4gIGNyZWF0ZWRBdDogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQm9hcmRWaWV3TW9kZWwge1xuICBwcml2YXRlIGNoZXNzOiBDaGVzcyA9IG5ldyBDaGVzcygpO1xuICBmZW4gPSB0aGlzLmNoZXNzLmZlbigpO1xuICBnYW1lU3RhcnRGZW4gPSB0aGlzLmNoZXNzLmZlbigpO1xuICBnYW1lU2Vzc2lvbklkID0gY3JlYXRlR2FtZVNlc3Npb25JZCgpO1xuICBzZXNzaW9uU3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgaGlzdG9yeTogTW92ZVtdID0gW107XG4gIGxhc3RNb3ZlOiB7IGZyb206IFNxdWFyZTsgdG86IFNxdWFyZSB9IHwgbnVsbCA9IG51bGw7XG4gIGxhc3RQbGF5ZWRCdWNrZXQ6IE1vdmVCdWNrZXQgfCBudWxsID0gbnVsbDtcbiAgc3RhdHVzTWVzc2FnZSA9ICdSZWFkeSc7XG4gIGxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2U6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBpc1RoaW5raW5nID0gZmFsc2U7XG4gIGF1dG9QbGF5RW5hYmxlZCA9IHRydWU7IC8vIEF1dG8tcGxheSBlbmdpbmUgbW92ZXMgYWZ0ZXIgaHVtYW4gbW92ZXNcbiAgZW5naW5lUGxheXNGb3I6ICd3JyB8ICdiJyA9ICdiJzsgLy8gV2hpY2ggc2lkZSB0aGUgZW5naW5lIHBsYXlzIGZvciAoZGVmYXVsdDogYmxhY2spXG4gIGJvYXJkRmxpcHBlZCA9IGZhbHNlOyAvLyBCb2FyZCBvcmllbnRhdGlvbiAoZmFsc2UgPSB3aGl0ZSBvbiBib3R0b20sIHRydWUgPSBibGFjayBvbiBib3R0b20pXG4gIHNob3dNb3ZlQXJyb3dzID0gZmFsc2U7IC8vIFNob3cgYXJyb3dzIGZvciBhbGwgcG9zc2libGUgbW92ZXNcbiAgc2hvd0Fycm93c0ZvclNpZGU6ICdjdXJyZW50JyB8ICdwbGF5ZXInIHwgJ2VuZ2luZScgPSAnY3VycmVudCc7IC8vIFdoaWNoIHNpZGUncyBtb3ZlcyB0byBzaG93IGFycm93cyBmb3JcbiAgbGFzdFBsYXllck1vdmVRdWFsaXR5OiBEaXNwbGF5TW92ZUJ1Y2tldCB8IG51bGwgPSBudWxsOyAvLyBRdWFsaXR5IG9mIHRoZSBsYXN0IHBsYXllciBtb3ZlXG4gIGlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTsgLy8gV2hldGhlciB3ZSdyZSBjdXJyZW50bHkgYW5hbHl6aW5nIG1vdmVzXG4gIGF1dG9QbGF5UGF1c2VkID0gZmFsc2U7XG4gIGF1dG9QbGF5U2NoZWR1bGVkRm9yID0gMDtcbiAgY3VycmVudFNldHVwTmFtZSA9ICdOZXcgR2FtZSc7XG4gIGN1cnJlbnRTZXR1cENhdGVnb3J5ID0gJ2N1c3RvbSc7XG4gIHJlY2VudE1vdmVGZWVkYmFjazogUmVjZW50TW92ZUZlZWRiYWNrIHwgbnVsbCA9IG51bGw7XG4gIGF1dG9QbGF5QWNjdW11bGF0ZWRNcyA9IDA7XG4gIGF1dG9QbGF5TGFzdFJlc3VtZWRBdDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gIFxuICAvLyBTdG9yZSBhbmFseXplZCBtb3ZlcyBhcyBhbiBvYmplY3QgZm9yIE1vYlggb2JzZXJ2YWJpbGl0eVxuICBwcml2YXRlIF9hbmFseXplZExlZ2FsTW92ZXM6IFJlY29yZDxzdHJpbmcsIERpc3BsYXlNb3ZlQnVja2V0PiA9IHt9O1xuICBwcml2YXRlIHJlZG9TdGFjazogTW92ZVtdID0gW107IC8vIFN0YWNrIG9mIG1vdmVzIHRoYXQgd2VyZSB1bmRvbmUgZm9yIHJlZG8gZnVuY3Rpb25hbGl0eVxuICBwcml2YXRlIGhpc3RvcnlBbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSA9IFtdO1xuICBwcml2YXRlIHJlZG9Bbm5vdGF0aW9uczogTW92ZUFubm90YXRpb25bXSA9IFtdO1xuICBwcml2YXRlIGFuYWx5emVkTGVnYWxNb3Zlc0Zlbjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2FuYWx5c2lzVGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDsgLy8gVGltZW91dCBmb3IgZGVib3VuY2luZyBtb3ZlIGFuYWx5c2lzXG4gIHByaXZhdGUgX2F1dG9QbGF5VGltZW91dDogTm9kZUpTLlRpbWVvdXQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBGRU5fU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX2N1cnJlbnRfZmVuJztcbiAgcHJpdmF0ZSByZWFkb25seSBGRU5fSElTVE9SWV9LRVkgPSAncGVyc29uYWNoZXNzX2Zlbl9oaXN0b3J5JztcbiAgcHJpdmF0ZSByZWFkb25seSBCT0FSRF9TVEFURV9TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfYm9hcmRfc3RhdGUnO1xuICBwcml2YXRlIHJlYWRvbmx5IE1BWF9ISVNUT1JZID0gNTA7IC8vIE1heGltdW0gbnVtYmVyIG9mIEZFTiBwb3NpdGlvbnMgdG8gc3RvcmVcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgbG9hZEZlbjogYWN0aW9uLFxuICAgICAgbG9hZFBnbjogYWN0aW9uLFxuICAgICAgbG9hZEdhbWVTZXR1cFByZXNldDogYWN0aW9uLFxuICAgICAgbWFrZU1vdmU6IGFjdGlvbixcbiAgICAgIHNvbHZlTmV4dE1vdmU6IGFjdGlvbixcbiAgICAgIHJlc2V0OiBhY3Rpb24sXG4gICAgICB1bmRvOiBhY3Rpb24sXG4gICAgICB1bmRvU2luZ2xlOiBhY3Rpb24sXG4gICAgICByZWRvU2luZ2xlOiBhY3Rpb24sXG4gICAgICBzZXRBdXRvUGxheTogYWN0aW9uLFxuICAgICAgc2V0QXV0b1BsYXlQYXVzZWQ6IGFjdGlvbixcbiAgICAgIHRvZ2dsZUF1dG9QbGF5UGF1c2U6IGFjdGlvbixcbiAgICAgIHNldEVuZ2luZVBsYXlzRm9yOiBhY3Rpb24sXG4gICAgICBmbGlwQm9hcmQ6IGFjdGlvbixcbiAgICAgIHNldEJvYXJkRmxpcHBlZDogYWN0aW9uLFxuICAgICAgc2F2ZUZlblRvSGlzdG9yeTogYWN0aW9uLFxuICAgICAgbG9hZEZlbkZyb21IaXN0b3J5OiBhY3Rpb24sXG4gICAgICB0b2dnbGVNb3ZlQXJyb3dzOiBhY3Rpb24sXG4gICAgICBzZXRTaG93TW92ZUFycm93c0VuYWJsZWQ6IGFjdGlvbixcbiAgICAgIHNldFNob3dBcnJvd3NGb3JTaWRlOiBhY3Rpb24sXG4gICAgICBhbmFseXplQWxsTW92ZXM6IGFjdGlvbixcbiAgICAgIGFuYWx5emVQbGF5ZXJNb3ZlOiBhY3Rpb24sXG4gICAgfSk7XG4gICAgXG4gICAgLy8gVHJ5IHRvIHJlc3RvcmUgRkVOIGZyb20gbG9jYWxTdG9yYWdlIG9uIGluaXRpYWxpemF0aW9uXG4gICAgdGhpcy5yZXN0b3JlRmVuRnJvbVN0b3JhZ2UoKTtcblxuICAgIHJlYWN0aW9uKFxuICAgICAgKCkgPT4gZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucGVyc2lzdEVuZ2luZUNvbmZpZyxcbiAgICAgIChwZXJzaXN0RW5naW5lQ29uZmlnKSA9PiB7XG4gICAgICAgIGlmICghcGVyc2lzdEVuZ2luZUNvbmZpZykge1xuICAgICAgICAgIHRoaXMuY2xlYXJQZXJzaXN0ZWRCb2FyZFN0YXRlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zYXZlRmVuVG9IaXN0b3J5KCk7XG4gICAgICB9LFxuICAgICAgeyBmaXJlSW1tZWRpYXRlbHk6IHRydWUgfSxcbiAgICApO1xuICAgIFxuICAgIGxvZ2dlci5kZWJ1ZygnSW5pdGlhbGl6ZWQgd2l0aCBGRU46JywgdGhpcy5mZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhdXRvLXBsYXkgbW9kZVxuICAgKi9cbiAgc2V0QXV0b1BsYXkoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiAhZW5hYmxlZCkge1xuICAgICAgdGhpcy5zdG9wQXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk7XG4gICAgfVxuXG4gICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgPSBlbmFibGVkO1xuICAgIGlmICghZW5hYmxlZCkge1xuICAgICAgdGhpcy5hdXRvUGxheVBhdXNlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFydEF1dG9QbGF5RHVyYXRpb25UcmFja2luZygpO1xuICAgIH1cblxuICAgIGlmIChlbmFibGVkICYmIHRoaXMuY2FuU2NoZWR1bGVBdXRvUGxheSkge1xuICAgICAgdGhpcy5zY2hlZHVsZUF1dG9QbGF5TW92ZSgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5jYW5TY2hlZHVsZUF1dG9QbGF5KSB7XG4gICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIH1cbiAgICBsb2dnZXIuZGVidWcoJ0F1dG8tcGxheSBzZXQgdG86JywgZW5hYmxlZCk7XG4gIH1cblxuICBzZXRBdXRvUGxheVBhdXNlZChwYXVzZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAocGF1c2VkKSB7XG4gICAgICB0aGlzLnN0b3BBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFydEF1dG9QbGF5RHVyYXRpb25UcmFja2luZygpO1xuICAgIH1cblxuICAgIHRoaXMuYXV0b1BsYXlQYXVzZWQgPSBwYXVzZWQ7XG4gICAgaWYgKHBhdXNlZCkge1xuICAgICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuY2FuU2NoZWR1bGVBdXRvUGxheSkge1xuICAgICAgdGhpcy5zY2hlZHVsZUF1dG9QbGF5TW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZUF1dG9QbGF5UGF1c2UoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRBdXRvUGxheVBhdXNlZCghdGhpcy5hdXRvUGxheVBhdXNlZCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoaWNoIHNpZGUgdGhlIGVuZ2luZSBwbGF5cyBmb3JcbiAgICovXG4gIHNldEVuZ2luZVBsYXlzRm9yKHNpZGU6ICd3JyB8ICdiJyk6IHZvaWQge1xuICAgIHRoaXMuZW5naW5lUGxheXNGb3IgPSBzaWRlO1xuICAgIGxvZ2dlci5kZWJ1ZygnRW5naW5lIHBsYXlzIGZvcjonLCBzaWRlID09PSAndycgPyAnV2hpdGUnIDogJ0JsYWNrJyk7XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBhIHBvc2l0aW9uIGZyb20gRkVOIHN0cmluZ1xuICAgKi9cbiAgbG9hZEZlbihcbiAgICBmZW46IHN0cmluZyxcbiAgICBvcHRpb25zOiB7XG4gICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nPzogYm9vbGVhbjtcbiAgICAgIHNlc3Npb25JZD86IHN0cmluZztcbiAgICAgIGdhbWVTdGFydEZlbj86IHN0cmluZztcbiAgICAgIGhpc3RvcnlBbm5vdGF0aW9ucz86IE1vdmVBbm5vdGF0aW9uW107XG4gICAgICByZWRvQW5ub3RhdGlvbnM/OiBNb3ZlQW5ub3RhdGlvbltdO1xuICAgICAgc2V0dXBOYW1lPzogc3RyaW5nO1xuICAgICAgc2V0dXBDYXRlZ29yeT86IHN0cmluZztcbiAgICB9ID0ge30sXG4gICk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmcgPSB0cnVlLFxuICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgIGdhbWVTdGFydEZlbixcbiAgICAgICAgaGlzdG9yeUFubm90YXRpb25zLFxuICAgICAgICByZWRvQW5ub3RhdGlvbnMsXG4gICAgICAgIHNldHVwTmFtZSxcbiAgICAgICAgc2V0dXBDYXRlZ29yeSxcbiAgICAgIH0gPSBvcHRpb25zO1xuICAgICAgbG9nZ2VyLmRlYnVnKCdsb2FkRmVuIGNhbGxlZDonLCBmZW4pO1xuICAgICAgY29uc3QgbmV3Q2hlc3MgPSBuZXcgQ2hlc3MoZmVuKTtcbiAgICAgIHRoaXMuY2hlc3MgPSBuZXdDaGVzcztcbiAgICAgIHRoaXMuYmVnaW5TZXNzaW9uU3RhdGUoe1xuICAgICAgICBnYW1lU2Vzc2lvbklkOiBzZXNzaW9uSWQgPz8gY3JlYXRlR2FtZVNlc3Npb25JZCgpLFxuICAgICAgICBnYW1lU3RhcnRGZW46IGdhbWVTdGFydEZlbiA/PyBmZW4sXG4gICAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmcsXG4gICAgICAgIGhpc3RvcnlBbm5vdGF0aW9ucyxcbiAgICAgICAgcmVkb0Fubm90YXRpb25zLFxuICAgICAgICBzZXR1cE5hbWUsXG4gICAgICAgIHNldHVwQ2F0ZWdvcnksXG4gICAgICB9KTtcbiAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdQb3NpdGlvbiBsb2FkZWQnO1xuICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcbiAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICB0aGlzLmF1dG9QbGF5UGF1c2VkID0gZmFsc2U7XG4gICAgICB0aGlzLnJlY2VudE1vdmVGZWVkYmFjayA9IG51bGw7XG4gICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnRkVOIGxvYWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdsb2FkRmVuIGVycm9yOicsIGVycik7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgSW52YWxpZCBGRU46ICR7ZXJyfWA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgYSBnYW1lIGZyb20gUEdOIHN0cmluZ1xuICAgKi9cbiAgbG9hZFBnbihcbiAgICBwZ246IHN0cmluZyxcbiAgICBvcHRpb25zOiB7XG4gICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nPzogYm9vbGVhbjtcbiAgICAgIHNlc3Npb25JZD86IHN0cmluZztcbiAgICAgIHNldHVwTmFtZT86IHN0cmluZztcbiAgICAgIHNldHVwQ2F0ZWdvcnk/OiBzdHJpbmc7XG4gICAgfSA9IHt9LFxuICApOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qge1xuICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nID0gdHJ1ZSxcbiAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICBzZXR1cE5hbWUsXG4gICAgICAgIHNldHVwQ2F0ZWdvcnksXG4gICAgICB9ID0gb3B0aW9ucztcbiAgICAgIGxvZ2dlci5kZWJ1ZygnbG9hZFBnbiBjYWxsZWQnKTtcbiAgICAgIGNvbnN0IG5ld0NoZXNzID0gbmV3IENoZXNzKCk7XG4gICAgICBuZXdDaGVzcy5sb2FkUGduKHBnbik7XG4gICAgICBjb25zdCBnYW1lU3RhcnRGZW4gPSByZXNvbHZlUGduU3RhcnRGZW4obmV3Q2hlc3MuaGVhZGVyKCksIG5ldyBDaGVzcygpLmZlbigpKTtcbiAgICAgIHRoaXMuY2hlc3MgPSBuZXdDaGVzcztcbiAgICAgIHRoaXMuYmVnaW5TZXNzaW9uU3RhdGUoe1xuICAgICAgICBnYW1lU2Vzc2lvbklkOiBzZXNzaW9uSWQgPz8gY3JlYXRlR2FtZVNlc3Npb25JZCgpLFxuICAgICAgICBnYW1lU3RhcnRGZW4sXG4gICAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmcsXG4gICAgICAgIHNldHVwTmFtZSxcbiAgICAgICAgc2V0dXBDYXRlZ29yeSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ1BHTiBsb2FkZWQnO1xuICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcbiAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICB0aGlzLmF1dG9QbGF5UGF1c2VkID0gZmFsc2U7XG4gICAgICB0aGlzLnJlY2VudE1vdmVGZWVkYmFjayA9IG51bGw7XG4gICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdsb2FkUGduIGVycm9yOicsIGVycik7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgSW52YWxpZCBQR046ICR7ZXJyfWA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgbG9hZEdhbWVTZXR1cFByZXNldChwcmVzZXQ6IEdhbWVTZXR1cFByZXNldCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHNpZGVMYWJlbCA9IHByZXNldC5zaWRlID09PSAnd2hpdGUnID8gJ1doaXRlJyA6ICdCbGFjayc7XG4gICAgY29uc3QgbG9hZGVkID0gcHJlc2V0LnNvdXJjZVR5cGUgPT09ICdmZW4nXG4gICAgICA/IHRoaXMubG9hZEZlbihwcmVzZXQuc291cmNlLCB7XG4gICAgICAgICAgc2V0dXBOYW1lOiBwcmVzZXQubmFtZSxcbiAgICAgICAgICBzZXR1cENhdGVnb3J5OiBwcmVzZXQuY2F0ZWdvcnksXG4gICAgICAgIH0pXG4gICAgICA6IHRoaXMubG9hZFBnbihwcmVzZXQuc291cmNlLCB7XG4gICAgICAgICAgc2V0dXBOYW1lOiBwcmVzZXQubmFtZSxcbiAgICAgICAgICBzZXR1cENhdGVnb3J5OiBwcmVzZXQuY2F0ZWdvcnksXG4gICAgICAgIH0pO1xuXG4gICAgaWYgKGxvYWRlZCkge1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYCR7cHJlc2V0Lm5hbWV9IGxvYWRlZCAoJHtzaWRlTGFiZWx9KWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxvYWRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGEgbW92ZSBvbiB0aGUgYm9hcmQgKHNpbWlsYXIgdG8gdGhlIGV4YW1wbGUgcGF0dGVybilcbiAgICogVGhpcyBpcyBzeW5jaHJvbm91cyBmb3IgaW1tZWRpYXRlIFVJIGZlZWRiYWNrLCBqdXN0IGxpa2UgdGhlIGV4YW1wbGVcbiAgICovXG4gIG1ha2VNb3ZlKGZyb206IFNxdWFyZSwgdG86IFNxdWFyZSwgcHJvbW90aW9uID0gJ3EnKTogYm9vbGVhbiB7XG4gICAgbG9nZ2VyLmRlYnVnKCdtYWtlTW92ZSBjYWxsZWQnLCB7IGZyb20sIHRvLCBwcm9tb3Rpb24sIGN1cnJlbnRGZW46IHRoaXMuZmVuLCBjdXJyZW50VHVybjogdGhpcy5jaGVzcy50dXJuKCkgfSk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIC8vIFRyeSB0byBtYWtlIHRoZSBtb3ZlIGFjY29yZGluZyB0byBjaGVzcy5qcyBsb2dpYyAoZXhhY3RseSBsaWtlIHRoZSBleGFtcGxlKVxuICAgICAgLy8gY2hlc3MuanMgd2lsbCB2YWxpZGF0ZSB0aGUgbW92ZSBhdXRvbWF0aWNhbGx5XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgZnJvbSxcbiAgICAgICAgdG8sXG4gICAgICAgIHByb21vdGlvbjogcHJvbW90aW9uIGFzICdxJyB8ICdyJyB8ICdiJyB8ICduJyB8IHVuZGVmaW5lZCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobW92ZSkge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ01vdmUgc3VjY2Vzc2Z1bDonLCBtb3ZlLnNhbik7XG4gICAgICAgIC8vIENsZWFyIHJlZG8gc3RhY2sgd2hlbiBhIG5ldyBtb3ZlIGlzIG1hZGVcbiAgICAgICAgdGhpcy5jbGVhclJlZG9TdGF0ZSgpO1xuICAgICAgICB0aGlzLnJlY29yZE1vdmVBbm5vdGF0aW9uKG1vdmUsIGZhbHNlLCAncGxheWVyJyk7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gc3RhdGUgdG8gdHJpZ2dlciBhIHJlLXJlbmRlciAodmlhIE1vYlggb2JzZXJ2YWJsZSlcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0geyBmcm9tLCB0byB9O1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn1gO1xuICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgICBtb3ZlLFxuICAgICAgICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8gQW5hbHl6ZSB0aGUgcGxheWVyJ3MgbW92ZSBxdWFsaXR5XG4gICAgICAgIHRoaXMuYW5hbHl6ZVBsYXllck1vdmUobW92ZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBNYWtlIGVuZ2luZSBtb3ZlIGFmdGVyIGEgc2hvcnQgZGVsYXkgaWY6XG4gICAgICAgIC8vIDEuIEF1dG8tcGxheSBpcyBlbmFibGVkXG4gICAgICAgIC8vIDIuIEdhbWUgaXMgbm90IG92ZXJcbiAgICAgICAgLy8gMy4gSXQncyBub3cgdGhlIGVuZ2luZSdzIHR1cm4gKHRoZSB0dXJuIGNoYW5nZWQgYWZ0ZXIgdGhlIGh1bWFuIG1vdmUpXG4gICAgICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiAhdGhpcy5pc0dhbWVPdmVyICYmIHRoaXMuY2hlc3MudHVybigpID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yKSB7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdTY2hlZHVsaW5nIGF1dG8tcGxheSBmb3IgZW5naW5lIHNpZGU6JywgdGhpcy5lbmdpbmVQbGF5c0Zvcik7XG4gICAgICAgICAgdGhpcy5zY2hlZHVsZUF1dG9QbGF5TW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBhcyB0aGUgbW92ZSB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnTW92ZSBmYWlsZWQgLSBjaGVzcy5qcyByZXR1cm5lZCBudWxsJyk7XG4gICAgICAgIC8vIFJldHVybiBmYWxzZSBhcyB0aGUgbW92ZSB3YXMgbm90IHN1Y2Nlc3NmdWxcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdNb3ZlIGV4Y2VwdGlvbjonLCBlcnIpO1xuICAgICAgLy8gUmV0dXJuIGZhbHNlIGFzIHRoZSBtb3ZlIHdhcyBub3Qgc3VjY2Vzc2Z1bFxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGEgbW92ZSBmcm9tIFVDSSBub3RhdGlvbiAoZS5nLiwgXCJlMmU0XCIpXG4gICAqIFVzZWQgYnkgdGhlIGVuZ2luZVxuICAgKi9cbiAgYXN5bmMgbWFrZU1vdmVVQ0koXG4gICAgdWNpOiBzdHJpbmcsXG4gICAgb3B0aW9uczogeyBjb25zdW1lZEJyaWxsaWFudD86IGJvb2xlYW4gfSA9IHt9LFxuICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodWNpLmxlbmd0aCA8IDQpIHJldHVybiBmYWxzZTtcbiAgICBcbiAgICBjb25zdCBmcm9tID0gdWNpLnNsaWNlKDAsIDIpIGFzIFNxdWFyZTtcbiAgICBjb25zdCB0byA9IHVjaS5zbGljZSgyLCA0KSBhcyBTcXVhcmU7XG4gICAgY29uc3QgcHJvbW90aW9uID0gdWNpLmxlbmd0aCA+IDQgPyB1Y2lbNF0gOiB1bmRlZmluZWQ7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLm1vdmUoe1xuICAgICAgICBmcm9tLFxuICAgICAgICB0byxcbiAgICAgICAgcHJvbW90aW9uOiBwcm9tb3Rpb24gYXMgJ3EnIHwgJ3InIHwgJ2InIHwgJ24nIHwgdW5kZWZpbmVkLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChtb3ZlKSB7XG4gICAgICAgIC8vIENsZWFyIHJlZG8gc3RhY2sgd2hlbiBhIG5ldyBtb3ZlIGlzIG1hZGVcbiAgICAgICAgdGhpcy5jbGVhclJlZG9TdGF0ZSgpO1xuICAgICAgICB0aGlzLnJlY29yZE1vdmVBbm5vdGF0aW9uKG1vdmUsIG9wdGlvbnMuY29uc3VtZWRCcmlsbGlhbnQgPz8gZmFsc2UsICdlbmdpbmUnKTtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0geyBmcm9tLCB0byB9O1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgRW5naW5lIHBsYXllZDogJHttb3ZlLnNhbn1gO1xuICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgIGFjdG9yOiAnZW5naW5lJyxcbiAgICAgICAgICBtb3ZlLFxuICAgICAgICAgIGlzQnJpbGxpYW50OiBvcHRpb25zLmNvbnN1bWVkQnJpbGxpYW50ID8/IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTb2x2ZSBhbmQgcGxheSB0aGUgbmV4dCBtb3ZlIHVzaW5nIHRoZSBlbmdpbmUgYW5kIGJ1Y2tldCBjb25maWd1cmF0aW9uXG4gICAqL1xuICBhc3luYyBzb2x2ZU5leHRNb3ZlKGF1dG9UcmlnZ2VyZWQgPSBmYWxzZSk6IFByb21pc2U8UGlja2VkTW92ZVJlc3VsdCB8IG51bGw+IHtcbiAgICBpZiAodGhpcy5pc0dhbWVPdmVyKSB7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnR2FtZSBpcyBvdmVyJztcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNUaGlua2luZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdFbmdpbmUgdGhpbmtpbmcuLi4nO1xuICAgICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUgZW5naW5lIGlmIG5lZWRlZFxuICAgICAgaWYgKCFlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCkge1xuICAgICAgICBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBBbmFseXplIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgIGNvbnN0IGFuYWx5c2lzID0gYXdhaXQgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbihcbiAgICAgICAgdGhpcy5mZW4sXG4gICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCxcbiAgICAgICAgY29uZmlnVmlld01vZGVsLm11bHRpUFYsXG4gICAgICAgICdlbmdpbmVNb3ZlJyxcbiAgICAgICk7XG5cbiAgICAgIC8vIENoZWNrIGlmIGFuYWx5c2lzIHJldHVybmVkIG5vIG1vdmVzIChnYW1lIG92ZXIgcG9zaXRpb24pXG4gICAgICBpZiAoYW5hbHlzaXMuaWdub3JlZCB8fCBhbmFseXNpcy5tb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgIGlmIChhbmFseXNpcy5pZ25vcmVkKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnRW5naW5lIGFuYWx5c2lzIGV4cGlyZWQnO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0NoZWNrbWF0ZSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ0NoZWNrbWF0ZSEgR2FtZSBvdmVyLic7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzU3RhbGVtYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnU3RhbGVtYXRlISBHYW1lIG92ZXIuJztcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNEcmF3KSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnRHJhdyEgR2FtZSBvdmVyLic7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdObyBsZWdhbCBtb3ZlcyBhdmFpbGFibGUnO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBhbmFseXNpcy5pZ25vcmVkID8gJ0EgbmV3ZXIgZW5naW5lIGFuYWx5c2lzIHJlcGxhY2VkIHRoaXMgbW92ZSByZXF1ZXN0LicgOiBudWxsO1xuICAgICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFBpY2sgYSBtb3ZlIGJhc2VkIG9uIGJ1Y2tldCBjb25maWd1cmF0aW9uXG4gICAgICBjb25zdCBwZXJzb25hID0gY29uZmlnVmlld01vZGVsLmN1cnJlbnRQcmVzZXRJZCA/PyAnY3VzdG9tJztcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcyhhbmFseXNpcywgY29uZmlnVmlld01vZGVsLmJ1Y2tldENvbmZpZywge1xuICAgICAgICBmZW46IHRoaXMuZmVuLFxuICAgICAgICBnYW1lU3RhcnRGZW46IHRoaXMuZ2FtZVN0YXJ0RmVuLFxuICAgICAgICBtb3ZlQ291bnQ6IHRoaXMubW92ZUNvdW50LFxuICAgICAgICBzaWRlVG9Nb3ZlOiB0aGlzLnR1cm4sXG4gICAgICAgIHBlcnNvbmEsXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBpZiAoYXV0b1RyaWdnZXJlZCAmJiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VIdW1hbkRlbGF5U2ltdWxhdGlvbikge1xuICAgICAgICAgIGNvbnN0IGRlbGF5TXMgPSBjYWxjdWxhdGVIdW1hbkRlbGF5TXMoe1xuICAgICAgICAgICAgY29tcGxleGl0eTogYW5hbHlzaXMuY29tcGxleGl0eSxcbiAgICAgICAgICAgIHBlcnNvbmEsXG4gICAgICAgICAgICBidWNrZXQ6IHJlc3VsdC5idWNrZXQsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYXdhaXQgdGhpcy53YWl0KGRlbGF5TXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjYW5BcHBseUFuYWx5emVkTW92ZSh0aGlzLmZlbiwgYW5hbHlzaXMuYW5hbHl6ZWRGZW4pKSB7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ1Bvc2l0aW9uIGNoYW5nZWQsIHN0YWxlIGVuZ2luZSBtb3ZlIGRpc2NhcmRlZCc7XG4gICAgICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSAnU2tpcHBlZCBlbmdpbmUgbW92ZSBiZWNhdXNlIHRoZSBib2FyZCBjaGFuZ2VkIGJlZm9yZSBpdCBjb3VsZCBiZSBwbGF5ZWQuJztcbiAgICAgICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXBwbHkgdGhlIHBpY2tlZCBtb3ZlXG4gICAgICAgIGNvbnN0IG1vdmVTdWNjZXNzID0gYXdhaXQgdGhpcy5tYWtlTW92ZVVDSShyZXN1bHQubW92ZS5tb3ZlLCB7XG4gICAgICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IHJlc3VsdC5pc0JyaWxsaWFudCA/PyBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAobW92ZVN1Y2Nlc3MpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUxhc3RBbm5vdGF0aW9uKHtcbiAgICAgICAgICAgIGJ1Y2tldDogcmVzdWx0LmJ1Y2tldCxcbiAgICAgICAgICAgIGV2YWxMb3NzOiByZXN1bHQubW92ZS5ldmFsTG9zcyxcbiAgICAgICAgICAgIGV2YWx1YXRpb246IHJlc3VsdC5tb3ZlLmV2YWx1YXRpb24sXG4gICAgICAgICAgICBjb21wbGV4aXR5TGV2ZWw6IGFuYWx5c2lzLmNvbXBsZXhpdHkubGV2ZWwsXG4gICAgICAgICAgICBjb21wbGV4aXR5U2NvcmU6IGFuYWx5c2lzLmNvbXBsZXhpdHkuc2NvcmUsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gcmVzdWx0LmJ1Y2tldDtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IHJlc3VsdC5pc0JyaWxsaWFudFxuICAgICAgICAgICAgICA/ICdFbmdpbmUgcGxheWVkOiBCcmlsbGlhbnQgbW92ZSdcbiAgICAgICAgICAgICAgOiBgRW5naW5lIHBsYXllZDogJHtCVUNLRVRfTEFCRUxTW3Jlc3VsdC5idWNrZXRdfSBtb3ZlYDtcbiAgICAgICAgICAgIHRoaXMubGFzdFNraXBwZWRFbmdpbmVNb3ZlTWVzc2FnZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnRW5naW5lIG1vdmUgZmFpbGVkJztcbiAgICAgICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnTm8gbW92ZXMgYXZhaWxhYmxlJztcbiAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdzb2x2ZU5leHRNb3ZlIGVycm9yOicsIGVycik7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBFcnJvcjogJHtlcnJ9YDtcbiAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgYm9hcmQgdG8gc3RhcnRpbmcgcG9zaXRpb25cbiAgICovXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZygncmVzZXQgY2FsbGVkJyk7XG4gICAgdGhpcy5jaGVzcyA9IG5ldyBDaGVzcygpO1xuICAgIHRoaXMuYmVnaW5TZXNzaW9uU3RhdGUoe1xuICAgICAgZ2FtZVNlc3Npb25JZDogY3JlYXRlR2FtZVNlc3Npb25JZCgpLFxuICAgICAgZ2FtZVN0YXJ0RmVuOiB0aGlzLmNoZXNzLmZlbigpLFxuICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZzogdHJ1ZSxcbiAgICAgIHNldHVwTmFtZTogJ05ldyBHYW1lJyxcbiAgICAgIHNldHVwQ2F0ZWdvcnk6ICdjdXN0b20nLFxuICAgIH0pO1xuICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICB0aGlzLmxhc3RNb3ZlID0gbnVsbDtcbiAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdCb2FyZCByZXNldCc7XG4gICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcbiAgICB0aGlzLnJlY2VudE1vdmVGZWVkYmFjayA9IG51bGw7XG4gICAgdGhpcy5jbGVhckF1dG9QbGF5U2NoZWR1bGUoKTtcbiAgICB0aGlzLmF1dG9QbGF5UGF1c2VkID0gZmFsc2U7XG4gICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgbG9nZ2VyLmRlYnVnKCdCb2FyZCByZXNldCwgbmV3IEZFTjonLCB0aGlzLmZlbik7XG4gIH1cblxuICAvKipcbiAgICogVW5kbyB0aGUgbGFzdCBtb3ZlIChvciBsYXN0IHR3byBtb3ZlcyBpZiBhdXRvLXBsYXkgaXMgb24gYW5kIGVuZ2luZSBqdXN0IG1vdmVkKVxuICAgKi9cbiAgdW5kbygpOiBib29sZWFuIHtcbiAgICBsb2dnZXIuZGVidWcoJ3VuZG8gY2FsbGVkLCBoaXN0b3J5IGxlbmd0aDonLCB0aGlzLmhpc3RvcnkubGVuZ3RoKTtcbiAgICBcbiAgICAvLyBJZiBhdXRvLXBsYXkgaXMgZW5hYmxlZCBhbmQgdGhlIGxhc3QgbW92ZSB3YXMgYnkgdGhlIGVuZ2luZSwgdW5kbyBib3RoIG1vdmVzXG4gICAgaWYgKHRoaXMuYXV0b1BsYXlFbmFibGVkICYmIHRoaXMuaGlzdG9yeS5sZW5ndGggPj0gMikge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGxhc3QgbW92ZSB3YXMgYnkgdGhlIGVuZ2luZVxuICAgICAgY29uc3QgbGFzdE1vdmUgPSB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5Lmxlbmd0aCAtIDFdO1xuICAgICAgY29uc3QgbGFzdE1vdmVDb2xvciA9IGxhc3RNb3ZlLmNvbG9yO1xuICAgICAgXG4gICAgICAvLyBJZiBsYXN0IG1vdmUgd2FzIGJ5IGVuZ2luZSwgdW5kbyBib3RoIChlbmdpbmUgbW92ZSArIGh1bWFuIG1vdmUpXG4gICAgICBpZiAobGFzdE1vdmVDb2xvciA9PT0gdGhpcy5lbmdpbmVQbGF5c0Zvcikge1xuICAgICAgICBpZiAodGhpcy51bmRvTW92ZXMoMikpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgICAgdGhpcy5sYXN0TW92ZSA9IG51bGw7XG4gICAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnVW5kaWQgbGFzdCAyIG1vdmVzIChodW1hbiArIGVuZ2luZSknO1xuICAgICAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdVbmRpZCAyIG1vdmVzJyk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIExhc3QgbW92ZSB3YXMgYnkgaHVtYW4sIGp1c3QgdW5kbyBvbmVcbiAgICAgICAgaWYgKHRoaXMudW5kb01vdmVzKDEpKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ01vdmUgdW5kb25lJztcbiAgICAgICAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnVW5kaWQgMSBtb3ZlJyk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXV0by1wbGF5IGRpc2FibGVkIG9yIG5vdCBlbm91Z2ggbW92ZXMsIHVuZG8ganVzdCBvbmUgbW92ZVxuICAgICAgaWYgKHRoaXMudW5kb01vdmVzKDEpKSB7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdNb3ZlIHVuZG9uZSc7XG4gICAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICBsb2dnZXIuZGVidWcoJ1VuZGlkIDEgbW92ZScpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgbG9nZ2VyLmRlYnVnKCdVbmRvIGZhaWxlZCAtIG5vIG1vdmVzIHRvIHVuZG8nKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGludGVybmFsIHN0YXRlIGZyb20gY2hlc3MgaW5zdGFuY2VcbiAgICovXG4gIHByaXZhdGUgdXBkYXRlU3RhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5mZW4gPSB0aGlzLmNoZXNzLmZlbigpO1xuICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuY2hlc3MuaGlzdG9yeSh7IHZlcmJvc2U6IHRydWUgfSk7XG4gICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPSBudWxsO1xuICAgIC8vIFNhdmUgRkVOIHRvIGxvY2FsU3RvcmFnZSB3aGVuZXZlciBpdCBjaGFuZ2VzXG4gICAgdGhpcy5zYXZlRmVuVG9IaXN0b3J5KCk7XG4gICAgbG9nZ2VyLmRlYnVnKCd1cGRhdGVTdGF0ZSAtIEZFTjonLCB0aGlzLmZlbiwgJ0hpc3RvcnkgbGVuZ3RoOicsIHRoaXMuaGlzdG9yeS5sZW5ndGgpO1xuICAgIFxuICAgIC8vIEF1dG9tYXRpY2FsbHkgcmUtYW5hbHl6ZSBtb3ZlcyBpZiBhcnJvd3MgYXJlIGVuYWJsZWQgKGRlYm91bmNlZCB0byBwcmV2ZW50IGV4Y2Vzc2l2ZSBjYWxscylcbiAgICBpZiAodGhpcy5zaG93TW92ZUFycm93cyAmJiAhdGhpcy5pc0dhbWVPdmVyICYmICF0aGlzLmlzQW5hbHl6aW5nTW92ZXMpIHtcbiAgICAgIC8vIENsZWFyIHByZXZpb3VzIGFuYWx5c2lzIGFuZCB0cmlnZ2VyIG5ldyBhbmFseXNpcyBhc3luY2hyb25vdXNseVxuICAgICAgLy8gVXNlIHNldFRpbWVvdXQgdG8gZGVib3VuY2UgYW5kIHByZXZlbnQgcmUtcmVuZGVyIGxvb3BzXG4gICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICAgIC8vIENsZWFyIGFueSBwZW5kaW5nIGFuYWx5c2lzIHRpbWVvdXRcbiAgICAgIGlmICh0aGlzLl9hbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2FuYWx5c2lzVGltZW91dCk7XG4gICAgICB9XG4gICAgICAvLyBEZWJvdW5jZSBhbmFseXNpcyB0byBwcmV2ZW50IGV4Y2Vzc2l2ZSBjYWxsc1xuICAgICAgdGhpcy5fYW5hbHlzaXNUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYW5hbHl6ZUFsbE1vdmVzKCkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBhbmFseXplIG1vdmVzOicsIGVycik7XG4gICAgICAgIH0pO1xuICAgICAgfSwgMzAwKTsgLy8gMzAwbXMgZGVib3VuY2VcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmxpcCB0aGUgYm9hcmQgb3JpZW50YXRpb24gYW5kIGVuZ2luZSBwbGF5aW5nIGNvbG9yXG4gICAqL1xuICBmbGlwQm9hcmQoKTogdm9pZCB7XG4gICAgdGhpcy5ib2FyZEZsaXBwZWQgPSAhdGhpcy5ib2FyZEZsaXBwZWQ7XG4gICAgLy8gRmxpcCB0aGUgZW5naW5lJ3MgcGxheWluZyBjb2xvciB3aGVuIGJvYXJkIGlzIGZsaXBwZWRcbiAgICB0aGlzLmVuZ2luZVBsYXlzRm9yID0gdGhpcy5lbmdpbmVQbGF5c0ZvciA9PT0gJ3cnID8gJ2InIDogJ3cnO1xuICAgIGxvZ2dlci5kZWJ1ZygnQm9hcmQgZmxpcHBlZCwgb3JpZW50YXRpb246JywgdGhpcy5ib2FyZEZsaXBwZWQgPyAnYmxhY2snIDogJ3doaXRlJywgJ0VuZ2luZSBub3cgcGxheXMgZm9yOicsIHRoaXMuZW5naW5lUGxheXNGb3IgPT09ICd3JyA/ICdXaGl0ZScgOiAnQmxhY2snKTtcbiAgfVxuXG4gIHNldEJvYXJkRmxpcHBlZChmbGlwcGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYm9hcmRGbGlwcGVkICE9PSBmbGlwcGVkKSB7XG4gICAgICB0aGlzLmZsaXBCb2FyZCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIGN1cnJlbnQgRkVOIHRvIGxvY2FsU3RvcmFnZSBoaXN0b3J5XG4gICAqL1xuICBzYXZlRmVuVG9IaXN0b3J5KCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjdXJyZW50RmVuID0gdGhpcy5mZW47XG4gICAgICBcbiAgICAgIC8vIFNhdmUgY3VycmVudCBGRU5cbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuRkVOX1NUT1JBR0VfS0VZLCBjdXJyZW50RmVuKTtcbiAgICAgIFxuICAgICAgLy8gR2V0IGV4aXN0aW5nIGhpc3RvcnlcbiAgICAgIGNvbnN0IGhpc3RvcnlKc29uID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5GRU5fSElTVE9SWV9LRVkpO1xuICAgICAgbGV0IGhpc3Rvcnk6IHN0cmluZ1tdID0gaGlzdG9yeUpzb24gPyBKU09OLnBhcnNlKGhpc3RvcnlKc29uKSA6IFtdO1xuICAgICAgXG4gICAgICBpZiAoaGlzdG9yeS5sZW5ndGggPT09IDAgfHwgaGlzdG9yeVtoaXN0b3J5Lmxlbmd0aCAtIDFdICE9PSBjdXJyZW50RmVuKSB7XG4gICAgICAgIGhpc3RvcnkucHVzaChjdXJyZW50RmVuKTtcblxuICAgICAgICBpZiAoaGlzdG9yeS5sZW5ndGggPiB0aGlzLk1BWF9ISVNUT1JZKSB7XG4gICAgICAgICAgaGlzdG9yeSA9IGhpc3Rvcnkuc2xpY2UoLXRoaXMuTUFYX0hJU1RPUlkpO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5GRU5fSElTVE9SWV9LRVksIEpTT04uc3RyaW5naWZ5KGhpc3RvcnkpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgY29uc3QgYm9hcmRTdGF0ZTogUGVyc2lzdGVkQm9hcmRTdGF0ZSA9IHtcbiAgICAgICAgICBjdXJyZW50RmVuLFxuICAgICAgICAgIGZlbkhpc3Rvcnk6IGhpc3RvcnksXG4gICAgICAgICAgZ2FtZVNlc3Npb25JZDogdGhpcy5nYW1lU2Vzc2lvbklkLFxuICAgICAgICAgIGdhbWVTdGFydEZlbjogdGhpcy5nYW1lU3RhcnRGZW4sXG4gICAgICAgICAgY3VycmVudFNldHVwTmFtZTogdGhpcy5jdXJyZW50U2V0dXBOYW1lLFxuICAgICAgICAgIGN1cnJlbnRTZXR1cENhdGVnb3J5OiB0aGlzLmN1cnJlbnRTZXR1cENhdGVnb3J5LFxuICAgICAgICAgIGhpc3RvcnlBbm5vdGF0aW9uczogdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMsXG4gICAgICAgICAgcmVkb0Fubm90YXRpb25zOiB0aGlzLnJlZG9Bbm5vdGF0aW9ucyxcbiAgICAgICAgfTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5CT0FSRF9TVEFURV9TVE9SQUdFX0tFWSwgSlNPTi5zdHJpbmdpZnkoYm9hcmRTdGF0ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZEJvYXJkU3RhdGUoKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgbG9nZ2VyLmRlYnVnKCdTYXZlZCBGRU4gdG8gaGlzdG9yeSwgdG90YWwgZW50cmllczonLCBoaXN0b3J5Lmxlbmd0aCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBzYXZlIEZFTiB0byBoaXN0b3J5OicsIGVycik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmUgRkVOIGZyb20gbG9jYWxTdG9yYWdlIG9uIGFwcCBzdGFydHVwXG4gICAqL1xuICBwcml2YXRlIHJlc3RvcmVGZW5Gcm9tU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2F2ZWRGZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLkZFTl9TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoc2F2ZWRGZW4pIHtcbiAgICAgICAgLy8gVmFsaWRhdGUgRkVOIGJlZm9yZSBsb2FkaW5nXG4gICAgICAgIGNvbnN0IHRlc3RDaGVzcyA9IG5ldyBDaGVzcygpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRlc3RDaGVzcy5sb2FkKHNhdmVkRmVuKTtcbiAgICAgICAgICAvLyBGRU4gaXMgdmFsaWQsIGxvYWQgaXRcbiAgICAgICAgICBjb25zdCByZXN0b3JlZEJvYXJkU3RhdGUgPSB0aGlzLnJlYWRQZXJzaXN0ZWRCb2FyZFN0YXRlKCk7XG4gICAgICAgICAgaWYgKHJlc3RvcmVkQm9hcmRTdGF0ZT8uY3VycmVudEZlbiA9PT0gc2F2ZWRGZW4pIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEZlbihzYXZlZEZlbiwge1xuICAgICAgICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgc2Vzc2lvbklkOiByZXN0b3JlZEJvYXJkU3RhdGUuZ2FtZVNlc3Npb25JZCxcbiAgICAgICAgICAgICAgZ2FtZVN0YXJ0RmVuOiByZXN0b3JlZEJvYXJkU3RhdGUuZ2FtZVN0YXJ0RmVuLFxuICAgICAgICAgICAgICBoaXN0b3J5QW5ub3RhdGlvbnM6IHJlc3RvcmVkQm9hcmRTdGF0ZS5oaXN0b3J5QW5ub3RhdGlvbnMsXG4gICAgICAgICAgICAgIHJlZG9Bbm5vdGF0aW9uczogcmVzdG9yZWRCb2FyZFN0YXRlLnJlZG9Bbm5vdGF0aW9ucyxcbiAgICAgICAgICAgICAgc2V0dXBOYW1lOiByZXN0b3JlZEJvYXJkU3RhdGUuY3VycmVudFNldHVwTmFtZSxcbiAgICAgICAgICAgICAgc2V0dXBDYXRlZ29yeTogcmVzdG9yZWRCb2FyZFN0YXRlLmN1cnJlbnRTZXR1cENhdGVnb3J5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEZlbihzYXZlZEZlbiwge1xuICAgICAgICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRHYW1lU2Vzc2lvbklkICE9PSB0aGlzLmdhbWVTZXNzaW9uSWQpIHtcbiAgICAgICAgICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0QnJpbGxpYW50VHJhY2tpbmcodGhpcy5nYW1lU2Vzc2lvbklkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ1Jlc3RvcmVkIHBvc2l0aW9uIGZyb20gcHJldmlvdXMgc2Vzc2lvbic7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdSZXN0b3JlZCBGRU4gZnJvbSBzdG9yYWdlOicsIHNhdmVkRmVuKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbG9nZ2VyLndhcm4oJ1NhdmVkIEZFTiBpcyBpbnZhbGlkLCB1c2luZyBkZWZhdWx0OicsIGVycik7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5GRU5fU1RPUkFHRV9LRVkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byByZXN0b3JlIEZFTiBmcm9tIHN0b3JhZ2U6JywgZXJyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBGRU4gZnJvbSBoaXN0b3J5IGJ5IGluZGV4XG4gICAqL1xuICBsb2FkRmVuRnJvbUhpc3RvcnkoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBoaXN0b3J5SnNvbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX0hJU1RPUllfS0VZKTtcbiAgICAgIGlmICghaGlzdG9yeUpzb24pIHJldHVybiBmYWxzZTtcbiAgICAgIFxuICAgICAgY29uc3QgaGlzdG9yeTogc3RyaW5nW10gPSBKU09OLnBhcnNlKGhpc3RvcnlKc29uKTtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gaGlzdG9yeS5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIFxuICAgICAgY29uc3QgZmVuID0gaGlzdG9yeVtpbmRleF07XG4gICAgICByZXR1cm4gdGhpcy5sb2FkRmVuKGZlbik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIEZFTiBmcm9tIGhpc3Rvcnk6JywgZXJyKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IEZFTiBoaXN0b3J5XG4gICAqL1xuICBnZXQgZmVuSGlzdG9yeSgpOiBzdHJpbmdbXSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhpc3RvcnlKc29uID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5GRU5fSElTVE9SWV9LRVkpO1xuICAgICAgcmV0dXJuIGhpc3RvcnlKc29uID8gSlNPTi5wYXJzZShoaXN0b3J5SnNvbikgOiBbXTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBsYXN0IHNhdmVkIEZFTlxuICAgKi9cbiAgZ2V0IGxhc3RTYXZlZEZlbigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX1NUT1JBR0VfS0VZKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGUgc2hvd2luZyBtb3ZlIGFycm93c1xuICAgKi9cbiAgdG9nZ2xlTW92ZUFycm93cygpOiB2b2lkIHtcbiAgICAvLyBDbGVhciBhbnkgcGVuZGluZyBhbmFseXNpcyB0aW1lb3V0XG4gICAgaWYgKHRoaXMuX2FuYWx5c2lzVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2FuYWx5c2lzVGltZW91dCk7XG4gICAgICB0aGlzLl9hbmFseXNpc1RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnNob3dNb3ZlQXJyb3dzID0gIXRoaXMuc2hvd01vdmVBcnJvd3M7XG4gICAgaWYgKHRoaXMuc2hvd01vdmVBcnJvd3MgJiYgT2JqZWN0LmtleXModGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzKS5sZW5ndGggPT09IDAgJiYgIXRoaXMuaXNBbmFseXppbmdNb3Zlcykge1xuICAgICAgLy8gQXV0by1hbmFseXplIGlmIGFycm93cyBhcmUgZW5hYmxlZCBhbmQgd2UgZG9uJ3QgaGF2ZSBhbmFseXNpcyB5ZXRcbiAgICAgIHRoaXMuYW5hbHl6ZUFsbE1vdmVzKCkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JvYXJkVmlld01vZGVsXSBGYWlsZWQgdG8gYW5hbHl6ZSBtb3ZlczonLCBlcnIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5zaG93TW92ZUFycm93cykge1xuICAgICAgLy8gQ2xlYXIgYW5hbHlzaXMgd2hlbiBhcnJvd3MgYXJlIGRpc2FibGVkIHRvIGZyZWUgbWVtb3J5XG4gICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBzZXRTaG93TW92ZUFycm93c0VuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLnNob3dNb3ZlQXJyb3dzICE9PSBlbmFibGVkKSB7XG4gICAgICB0aGlzLnRvZ2dsZU1vdmVBcnJvd3MoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoaWNoIHNpZGUncyBtb3ZlcyB0byBzaG93IGFycm93cyBmb3JcbiAgICovXG4gIHNldFNob3dBcnJvd3NGb3JTaWRlKHNpZGU6ICdjdXJyZW50JyB8ICdwbGF5ZXInIHwgJ2VuZ2luZScpOiB2b2lkIHtcbiAgICB0aGlzLnNob3dBcnJvd3NGb3JTaWRlID0gc2lkZTtcbiAgICBsb2dnZXIuZGVidWcoJ1Nob3cgYXJyb3dzIGZvciBzaWRlOicsIHNpZGUpO1xuICAgIC8vIFJlLWFuYWx5emUgaWYgYXJyb3dzIGFyZSBlbmFibGVkXG4gICAgaWYgKHRoaXMuc2hvd01vdmVBcnJvd3MpIHtcbiAgICAgIHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcyA9IHt9O1xuICAgICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPSBudWxsO1xuICAgICAgdGhpcy5hbmFseXplQWxsTW92ZXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSBhbGwgbGVnYWwgbW92ZXMgZm9yIHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gICAqL1xuICBhc3luYyBhbmFseXplQWxsTW92ZXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuaXNHYW1lT3ZlciB8fCB0aGlzLmlzQW5hbHl6aW5nTW92ZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPT09IHRoaXMuZmVuICYmIE9iamVjdC5rZXlzKHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcykubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNBbmFseXppbmdNb3ZlcyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcyA9IHt9OyAvLyBDbGVhclxuICAgICAgfSk7XG5cbiAgICAgIC8vIEdldCBhbGwgbGVnYWwgbW92ZXNcbiAgICAgIGNvbnN0IGxlZ2FsTW92ZXMgPSB0aGlzLmFsbExlZ2FsTW92ZXM7XG4gICAgICBpZiAobGVnYWxNb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaXNBbmFseXppbmdNb3ZlcyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBJbml0aWFsaXplIGVuZ2luZSBpZiBuZWVkZWRcbiAgICAgIGlmICghZW5naW5lVmlld01vZGVsLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgYXdhaXQgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gQW5hbHl6ZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICBjb25zdCBhbmFseXNpcyA9IGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24oXG4gICAgICAgIHRoaXMuZmVuLFxuICAgICAgICBjb25maWdWaWV3TW9kZWwuZGVwdGgsXG4gICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5tdWx0aVBWLFxuICAgICAgICAnYmFja2dyb3VuZCcsXG4gICAgICApO1xuXG4gICAgICBpZiAoYW5hbHlzaXMuaWdub3JlZCB8fCAhY2FuQXBwbHlBbmFseXplZE1vdmUodGhpcy5mZW4sIGFuYWx5c2lzLmFuYWx5emVkRmVuKSkge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBhIG1hcCBvZiBVQ0kgbW92ZXMgdG8gdGhlaXIgcXVhbGl0eSBidWNrZXRzXG4gICAgICBjb25zdCBtb3ZlTWFwID0gbWFwTGVnYWxNb3Zlc1RvQnVja2V0cyhcbiAgICAgICAgbGVnYWxNb3Zlcy5tYXAobW92ZSA9PiBgJHttb3ZlLmZyb219JHttb3ZlLnRvfSR7bW92ZS5wcm9tb3Rpb24gfHwgJyd9YCksXG4gICAgICAgIGFuYWx5c2lzLm1vdmVzLFxuICAgICAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbixcbiAgICAgICk7XG5cbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzID0gbW92ZU1hcDtcbiAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPSB0aGlzLmZlbjtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnQW5hbHl6ZWQnLCBPYmplY3Qua2V5cyhtb3ZlTWFwKS5sZW5ndGgsICdsZWdhbCBtb3ZlcycpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gYW5hbHl6ZSBtb3ZlczonLCBlcnIpO1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbmFseXplIHRoZSBxdWFsaXR5IG9mIGEgcGxheWVyJ3MgbW92ZVxuICAgKiBUaGlzIHNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaXMgbWFkZSwgYW5hbHl6aW5nIHRoZSBwb3NpdGlvbiBiZWZvcmUgdGhlIG1vdmVcbiAgICovXG4gIGFzeW5jIGFuYWx5emVQbGF5ZXJNb3ZlKG1vdmU6IE1vdmUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBSdW4gYXN5bmNocm9ub3VzbHkgc28gaXQgZG9lc24ndCBibG9jayB0aGUgVUlcbiAgICBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGV4cGVjdGVkQWZ0ZXJGZW4gPSBtb3ZlLmFmdGVyO1xuICAgICAgICAvLyBJbml0aWFsaXplIGVuZ2luZSBpZiBuZWVkZWRcbiAgICAgICAgaWYgKCFlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgdGhlIHBvc2l0aW9uIGJlZm9yZSB0aGUgbW92ZSAoZnJvbSBoaXN0b3J5KVxuICAgICAgICBjb25zdCBoaXN0b3J5ID0gdGhpcy5jaGVzcy5oaXN0b3J5KHsgdmVyYm9zZTogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKGhpc3RvcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBObyBoaXN0b3J5LCBjYW4ndCBhbmFseXplXG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbW92ZSB3ZSBqdXN0IG1hZGUgaXMgdGhlIGxhc3Qgb25lIGluIGhpc3RvcnlcbiAgICAgICAgLy8gV2UgbmVlZCB0byBhbmFseXplIHRoZSBwb3NpdGlvbiBiZWZvcmUgaXRcbiAgICAgICAgLy8gY2hlc3MuanMgaGlzdG9yeSB2ZXJib3NlIGluY2x1ZGVzICdiZWZvcmUnIGFuZCAnYWZ0ZXInIEZFTlxuICAgICAgICBjb25zdCBsYXN0TW92ZUluSGlzdG9yeSA9IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSAxXSBhcyBNb3ZlICYgeyBiZWZvcmU/OiBzdHJpbmcgfTtcbiAgICAgICAgY29uc3QgYmVmb3JlRmVuID0gbGFzdE1vdmVJbkhpc3RvcnkuYmVmb3JlIHx8IHRoaXMuZmVuO1xuXG4gICAgICAgIC8vIEFuYWx5emUgdGhlIHBvc2l0aW9uIGJlZm9yZSB0aGUgbW92ZVxuICAgICAgICBjb25zdCBhbmFseXNpcyA9IGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24oXG4gICAgICAgICAgYmVmb3JlRmVuLFxuICAgICAgICAgIE1hdGgubWluKGNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCwgMTUpLCAvLyBVc2Ugc21hbGxlciBkZXB0aCBmb3IgZmFzdGVyIGFuYWx5c2lzXG4gICAgICAgICAgY29uZmlnVmlld01vZGVsLm11bHRpUFYsXG4gICAgICAgICAgJ2JhY2tncm91bmQnLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBhbmFseXNpcy5pZ25vcmVkXG4gICAgICAgICAgfHwgIWNhbkFwcGx5QW5hbHl6ZWRNb3ZlKGJlZm9yZUZlbiwgYW5hbHlzaXMuYW5hbHl6ZWRGZW4pXG4gICAgICAgICAgfHwgdGhpcy5mZW4gIT09IGV4cGVjdGVkQWZ0ZXJGZW5cbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluZCB0aGUgbW92ZSBpbiB0aGUgYW5hbHl6ZWQgbW92ZXNcbiAgICAgICAgY29uc3QgbW92ZVVDSSA9IGAke21vdmUuZnJvbX0ke21vdmUudG99JHttb3ZlLnByb21vdGlvbiB8fCAnJ31gO1xuICAgICAgICBjb25zdCBhbmFseXplZE1vdmUgPSBhbmFseXNpcy5tb3Zlcy5maW5kKG0gPT4gbS5tb3ZlID09PSBtb3ZlVUNJKTtcbiAgICAgICAgaWYgKGFuYWx5emVkTW92ZSkge1xuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gYW5hbHl6ZWRNb3ZlLmJ1Y2tldDtcbiAgICAgICAgICAgIGNvbnN0IHF1YWxpdHlMYWJlbCA9IEJVQ0tFVF9MQUJFTFNbYW5hbHl6ZWRNb3ZlLmJ1Y2tldF07XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn0gKCR7cXVhbGl0eUxhYmVsfSlgO1xuICAgICAgICAgICAgdGhpcy5wdWJsaXNoTW92ZUZlZWRiYWNrKHtcbiAgICAgICAgICAgICAgYWN0b3I6ICdwbGF5ZXInLFxuICAgICAgICAgICAgICBtb3ZlLFxuICAgICAgICAgICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgICAgICAgICAgIHF1YWxpdHlMYWJlbCxcbiAgICAgICAgICAgICAgYnVja2V0OiBhbmFseXplZE1vdmUuYnVja2V0LFxuICAgICAgICAgICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ1BsYXllciBtb3ZlIHF1YWxpdHk6JywgYW5hbHl6ZWRNb3ZlLmJ1Y2tldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZUltcHJvdmVkTW92ZUNsYXNzaWZpY2F0aW9uKSB7XG4gICAgICAgICAgICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gJ2ZhbGxiYWNrJztcbiAgICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYFlvdSBwbGF5ZWQ6ICR7bW92ZS5zYW59IChGYWxsYmFjayBtb3ZlKWA7XG4gICAgICAgICAgICAgIHRoaXMucHVibGlzaE1vdmVGZWVkYmFjayh7XG4gICAgICAgICAgICAgICAgYWN0b3I6ICdwbGF5ZXInLFxuICAgICAgICAgICAgICAgIG1vdmUsXG4gICAgICAgICAgICAgICAgaXNCcmlsbGlhbnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHF1YWxpdHlMYWJlbDogJ0ZhbGxiYWNrIG1vdmUnLFxuICAgICAgICAgICAgICAgIGJ1Y2tldDogJ2ZhbGxiYWNrJyxcbiAgICAgICAgICAgICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPSAnZ29vZCc7XG4gICAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBZb3UgcGxheWVkOiAke21vdmUuc2FufSAoR29vZClgO1xuICAgICAgICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgICAgICAgICBtb3ZlLFxuICAgICAgICAgICAgICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBxdWFsaXR5TGFiZWw6ICdHb29kJyxcbiAgICAgICAgICAgICAgICBidWNrZXQ6ICdnb29kJyxcbiAgICAgICAgICAgICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gYW5hbHl6ZSBwbGF5ZXIgbW92ZTonLCBlcnIpO1xuICAgICAgICAvLyBEb24ndCB1cGRhdGUgc3RhdHVzIG9uIGVycm9yLCBrZWVwIHRoZSBvcmlnaW5hbCBtZXNzYWdlXG4gICAgICB9XG4gICAgfSwgMTAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYXJyb3dzIGRhdGEgZm9yIHJlYWN0LWNoZXNzYm9hcmRcbiAgICogUmV0dXJucyBhcnJheSBvZiBBcnJvdyBvYmplY3RzIHdpdGggc3RhcnRTcXVhcmUsIGVuZFNxdWFyZSwgYW5kIGNvbG9yIHByb3BlcnRpZXNcbiAgICogT25seSBzaG93cyBhcnJvd3MgZm9yIEV4Y2VsbGVudCwgR29vZCwgTWlzdGFrZSwgYW5kIEJsdW5kZXIgbW92ZXNcbiAgICogTGltaXRlZCB0byBtYXhpbXVtIDMgYXJyb3dzIHBlciBxdWFsaXR5IGJ1Y2tldFxuICAgKi9cbiAgZ2V0IG1vdmVBcnJvd3MoKTogQXJyYXk8eyBzdGFydFNxdWFyZTogc3RyaW5nOyBlbmRTcXVhcmU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9PiB7XG4gICAgaWYgKCF0aGlzLnNob3dNb3ZlQXJyb3dzIHx8IE9iamVjdC5rZXlzKHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcykubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gT25seSBzaG93IGFycm93cyBmb3IgdGhlc2Ugc3BlY2lmaWMgbW92ZSBxdWFsaXRpZXNcbiAgICBjb25zdCBhbGxvd2VkQnVja2V0czogTW92ZUJ1Y2tldFtdID0gWydleGNlbGxlbnQnLCAnZ29vZCcsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcbiAgICBjb25zdCBtYXhBcnJvd3NQZXJCdWNrZXQgPSAzO1xuXG4gICAgbGV0IGxlZ2FsTW92ZXMgPSB0aGlzLmFsbExlZ2FsTW92ZXM7XG5cbiAgICAvLyBGaWx0ZXIgbW92ZXMgYnkgc2lkZSBpZiBuZWVkZWRcbiAgICBpZiAodGhpcy5zaG93QXJyb3dzRm9yU2lkZSA9PT0gJ3BsYXllcicpIHtcbiAgICAgIC8vIFNob3cgbW92ZXMgZm9yIHRoZSBzaWRlIHRoYXQgdGhlIGVuZ2luZSBpcyBOT1QgcGxheWluZyBmb3JcbiAgICAgIGNvbnN0IHBsYXllclNpZGUgPSB0aGlzLmVuZ2luZVBsYXlzRm9yID09PSAndycgPyAnYicgOiAndyc7XG4gICAgICBsZWdhbE1vdmVzID0gbGVnYWxNb3Zlcy5maWx0ZXIobW92ZSA9PiB7XG4gICAgICAgIGNvbnN0IHBpZWNlID0gdGhpcy5nZXRQaWVjZUF0KG1vdmUuZnJvbSk7XG4gICAgICAgIHJldHVybiBwaWVjZSAmJiBwaWVjZS5jb2xvciA9PT0gcGxheWVyU2lkZTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zaG93QXJyb3dzRm9yU2lkZSA9PT0gJ2VuZ2luZScpIHtcbiAgICAgIC8vIFNob3cgbW92ZXMgZm9yIHRoZSBzaWRlIHRoYXQgdGhlIGVuZ2luZSBJUyBwbGF5aW5nIGZvclxuICAgICAgbGVnYWxNb3ZlcyA9IGxlZ2FsTW92ZXMuZmlsdGVyKG1vdmUgPT4ge1xuICAgICAgICBjb25zdCBwaWVjZSA9IHRoaXMuZ2V0UGllY2VBdChtb3ZlLmZyb20pO1xuICAgICAgICByZXR1cm4gcGllY2UgJiYgcGllY2UuY29sb3IgPT09IHRoaXMuZW5naW5lUGxheXNGb3I7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gSWYgJ2N1cnJlbnQnLCBzaG93IGFsbCBsZWdhbCBtb3ZlcyAoYWxyZWFkeSBmaWx0ZXJlZCBieSBjaGVzcy5qcyB0byBjdXJyZW50IHR1cm4pXG5cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gdmFsaWRhdGUgc3F1YXJlIGZvcm1hdCAoYS1oLCAxLTgpXG4gICAgY29uc3QgaXNWYWxpZFNxdWFyZSA9IChzcXVhcmU6IHVua25vd24pOiBzcXVhcmUgaXMgU3F1YXJlID0+IHtcbiAgICAgIGlmICghc3F1YXJlIHx8IHR5cGVvZiBzcXVhcmUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gL15bYS1oXVsxLThdJC8udGVzdChzcXVhcmUpO1xuICAgIH07XG5cbiAgICAvLyBHcm91cCBtb3ZlcyBieSBidWNrZXRcbiAgICBjb25zdCBtb3Zlc0J5QnVja2V0OiBSZWNvcmQ8TW92ZUJ1Y2tldCwgQXJyYXk8eyBzdGFydFNxdWFyZTogc3RyaW5nOyBlbmRTcXVhcmU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9Pj4gPSB7XG4gICAgICBleGNlbGxlbnQ6IFtdLFxuICAgICAgZ29vZDogW10sXG4gICAgICBtaXN0YWtlOiBbXSxcbiAgICAgIGJsdW5kZXI6IFtdLFxuICAgICAgYmVzdDogW10sIC8vIE5vdCB1c2VkIGJ1dCBuZWVkZWQgZm9yIHR5cGVcbiAgICAgIGdyZWF0OiBbXSwgLy8gTm90IHVzZWQgYnV0IG5lZWRlZCBmb3IgdHlwZVxuICAgICAgaW5hY2N1cmFjeTogW10sIC8vIE5vdCB1c2VkIGJ1dCBuZWVkZWQgZm9yIHR5cGVcbiAgICB9O1xuXG4gICAgLy8gQ29sbGVjdCBhbGwgdmFsaWQgbW92ZXMgZ3JvdXBlZCBieSBidWNrZXRcbiAgICBmb3IgKGNvbnN0IG1vdmUgb2YgbGVnYWxNb3Zlcykge1xuICAgICAgLy8gVmFsaWRhdGUgdGhhdCBtb3ZlIGhhcyB2YWxpZCBmcm9tIGFuZCB0byBzcXVhcmVzXG4gICAgICBpZiAoIWlzVmFsaWRTcXVhcmUobW92ZS5mcm9tKSB8fCAhaXNWYWxpZFNxdWFyZShtb3ZlLnRvKSkge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ1NraXBwaW5nIGludmFsaWQgbW92ZTonLCBtb3ZlKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVjaSA9IGAke21vdmUuZnJvbX0ke21vdmUudG99JHttb3ZlLnByb21vdGlvbiB8fCAnJ31gO1xuICAgICAgY29uc3QgYnVja2V0ID0gdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzW3VjaV07XG4gICAgICBcbiAgICAgIC8vIE9ubHkgaW5jbHVkZSBtb3ZlcyBmcm9tIGFsbG93ZWQgYnVja2V0c1xuICAgICAgaWYgKGJ1Y2tldCAmJiBidWNrZXQgIT09ICdmYWxsYmFjaycgJiYgYWxsb3dlZEJ1Y2tldHMuaW5jbHVkZXMoYnVja2V0KSAmJiBpc1ZhbGlkU3F1YXJlKG1vdmUuZnJvbSkgJiYgaXNWYWxpZFNxdWFyZShtb3ZlLnRvKSkge1xuICAgICAgICBtb3Zlc0J5QnVja2V0W2J1Y2tldF0ucHVzaCh7XG4gICAgICAgICAgc3RhcnRTcXVhcmU6IG1vdmUuZnJvbSxcbiAgICAgICAgICBlbmRTcXVhcmU6IG1vdmUudG8sXG4gICAgICAgICAgY29sb3I6IEJVQ0tFVF9DT0xPUlNbYnVja2V0XSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGltaXQgdG8gbWF4IDMgYXJyb3dzIHBlciBidWNrZXQgYW5kIGNvbWJpbmVcbiAgICBjb25zdCBhcnJvd3M6IEFycmF5PHsgc3RhcnRTcXVhcmU6IHN0cmluZzsgZW5kU3F1YXJlOiBzdHJpbmc7IGNvbG9yOiBzdHJpbmcgfT4gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBhbGxvd2VkQnVja2V0cykge1xuICAgICAgY29uc3QgYnVja2V0QXJyb3dzID0gbW92ZXNCeUJ1Y2tldFtidWNrZXRdLnNsaWNlKDAsIG1heEFycm93c1BlckJ1Y2tldCk7XG4gICAgICBhcnJvd3MucHVzaCguLi5idWNrZXRBcnJvd3MpO1xuICAgICAgbG9nZ2VyLmRlYnVnKGBBZGRlZCAke2J1Y2tldEFycm93cy5sZW5ndGh9ICR7YnVja2V0fSBhcnJvd3MgKGZvdW5kICR7bW92ZXNCeUJ1Y2tldFtidWNrZXRdLmxlbmd0aH0gdG90YWwpYCk7XG4gICAgfVxuXG4gICAgbG9nZ2VyLmRlYnVnKCdHZW5lcmF0ZWQnLCBhcnJvd3MubGVuZ3RoLCAndG90YWwgYXJyb3dzJyk7XG4gICAgcmV0dXJuIGFycm93cztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW5hbHl6ZWQgbGVnYWwgbW92ZXMgY291bnQgKGZvciBVSSBkaXNwbGF5KVxuICAgKi9cbiAgZ2V0IGFuYWx5emVkTGVnYWxNb3Zlc0NvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcykubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IHR1cm4gKHdoaXRlL2JsYWNrKVxuICAgKi9cbiAgZ2V0IHR1cm4oKTogJ3cnIHwgJ2InIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy50dXJuKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHR1cm4gYXMgc3RyaW5nXG4gICAqL1xuICBnZXQgdHVyblN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnR1cm4gPT09ICd3JyA/ICdXaGl0ZScgOiAnQmxhY2snO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGdhbWUgaXMgb3ZlclxuICAgKi9cbiAgZ2V0IGlzR2FtZU92ZXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaXNHYW1lT3ZlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGl0J3MgY2hlY2ttYXRlXG4gICAqL1xuICBnZXQgaXNDaGVja21hdGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaXNDaGVja21hdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBpdCdzIHN0YWxlbWF0ZVxuICAgKi9cbiAgZ2V0IGlzU3RhbGVtYXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmlzU3RhbGVtYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgaXQncyBhIGRyYXdcbiAgICovXG4gIGdldCBpc0RyYXcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaXNEcmF3KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYga2luZyBpcyBpbiBjaGVja1xuICAgKi9cbiAgZ2V0IGlzQ2hlY2soKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaXNDaGVjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYW1lIHN0YXR1cyB0ZXh0XG4gICAqL1xuICBnZXQgZ2FtZVN0YXR1cygpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmlzQ2hlY2ttYXRlKSB7XG4gICAgICByZXR1cm4gYENoZWNrbWF0ZSEgJHt0aGlzLnR1cm4gPT09ICd3JyA/ICdCbGFjaycgOiAnV2hpdGUnfSB3aW5zYDtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNTdGFsZW1hdGUpIHtcbiAgICAgIHJldHVybiAnU3RhbGVtYXRlISc7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRHJhdykge1xuICAgICAgcmV0dXJuICdEcmF3ISc7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzQ2hlY2spIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLnR1cm5TdHJpbmd9IGlzIGluIGNoZWNrYDtcbiAgICB9XG4gICAgcmV0dXJuIGAke3RoaXMudHVyblN0cmluZ30gdG8gbW92ZWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGxlZ2FsIG1vdmVzIGZvciBhIHNxdWFyZVxuICAgKi9cbiAgZ2V0TGVnYWxNb3ZlcyhzcXVhcmU6IFNxdWFyZSk6IE1vdmVbXSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MubW92ZXMoeyBzcXVhcmUsIHZlcmJvc2U6IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBpZWNlIGF0IHNxdWFyZSAoZm9yIFVJIHZpc3VhbCBpbmRpY2F0b3JzKVxuICAgKi9cbiAgZ2V0UGllY2VBdChzcXVhcmU6IFNxdWFyZSkge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmdldChzcXVhcmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgbGVnYWwgbW92ZXNcbiAgICovXG4gIGdldCBhbGxMZWdhbE1vdmVzKCk6IE1vdmVbXSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MubW92ZXMoeyB2ZXJib3NlOiB0cnVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBtb3ZlIGNvdW50XG4gICAqL1xuICBnZXQgbW92ZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MubW92ZU51bWJlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuZG8gYSBzaW5nbGUgbW92ZSAoZm9yIHRoZSBuZXcgdW5kbyBidXR0b24pXG4gICAqL1xuICB1bmRvU2luZ2xlKCk6IGJvb2xlYW4ge1xuICAgIGxvZ2dlci5kZWJ1ZygndW5kb1NpbmdsZSBjYWxsZWQsIGhpc3RvcnkgbGVuZ3RoOicsIHRoaXMuaGlzdG9yeS5sZW5ndGgpO1xuICAgIFxuICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLnVuZG8oKTtcbiAgICBpZiAobW92ZSkge1xuICAgICAgLy8gQWRkIHRvIHJlZG8gc3RhY2tcbiAgICAgIHRoaXMucmVkb1N0YWNrLnB1c2gobW92ZSk7XG4gICAgICBjb25zdCBhbm5vdGF0aW9uID0gdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMucG9wKCk7XG4gICAgICBpZiAoYW5ub3RhdGlvbikge1xuICAgICAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucy5wdXNoKGFubm90YXRpb24pO1xuICAgICAgfVxuICAgICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgIFxuICAgICAgLy8gVXBkYXRlIGxhc3RNb3ZlIGlmIHRoZXJlIGFyZSBzdGlsbCBtb3ZlcyBpbiBoaXN0b3J5XG4gICAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbGFzdE1vdmVJbkhpc3RvcnkgPSB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5Lmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0geyBmcm9tOiBsYXN0TW92ZUluSGlzdG9yeS5mcm9tIGFzIFNxdWFyZSwgdG86IGxhc3RNb3ZlSW5IaXN0b3J5LnRvIGFzIFNxdWFyZSB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IG51bGw7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnVW5kaWQgMSBtb3ZlJztcbiAgICAgIHRoaXMuY2xlYXJBdXRvUGxheVNjaGVkdWxlKCk7XG4gICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnVW5kaWQgMSBtb3ZlLCByZWRvIHN0YWNrIHNpemU6JywgdGhpcy5yZWRvU3RhY2subGVuZ3RoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVkbyBhIHNpbmdsZSBtb3ZlXG4gICAqL1xuICByZWRvU2luZ2xlKCk6IGJvb2xlYW4ge1xuICAgIGxvZ2dlci5kZWJ1ZygncmVkb1NpbmdsZSBjYWxsZWQsIHJlZG8gc3RhY2sgc2l6ZTonLCB0aGlzLnJlZG9TdGFjay5sZW5ndGgpO1xuICAgIFxuICAgIGlmICh0aGlzLnJlZG9TdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgbW92ZVRvUmVkbyA9IHRoaXMucmVkb1N0YWNrLnBvcCgpO1xuICAgIGlmICghbW92ZVRvUmVkbykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBhbm5vdGF0aW9uVG9SZWRvID0gdGhpcy5yZWRvQW5ub3RhdGlvbnMucG9wKCk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLm1vdmUoe1xuICAgICAgICBmcm9tOiBtb3ZlVG9SZWRvLmZyb20gYXMgU3F1YXJlLFxuICAgICAgICB0bzogbW92ZVRvUmVkby50byBhcyBTcXVhcmUsXG4gICAgICAgIHByb21vdGlvbjogbW92ZVRvUmVkby5wcm9tb3Rpb24sXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgaWYgKG1vdmUpIHtcbiAgICAgICAgdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMucHVzaChcbiAgICAgICAgICBhbm5vdGF0aW9uVG9SZWRvID8/IHRoaXMuY3JlYXRlTW92ZUFubm90YXRpb24obW92ZSwgZmFsc2UsICdyZWRvJyksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IHsgZnJvbTogbW92ZS5mcm9tIGFzIFNxdWFyZSwgdG86IG1vdmUudG8gYXMgU3F1YXJlIH07XG4gICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBSZWRpZDogJHttb3ZlLnNhbn1gO1xuICAgICAgICB0aGlzLnB1Ymxpc2hNb3ZlRmVlZGJhY2soe1xuICAgICAgICAgIGFjdG9yOiAncmVkbycsXG4gICAgICAgICAgbW92ZSxcbiAgICAgICAgICBpc0JyaWxsaWFudDogYW5ub3RhdGlvblRvUmVkbz8uY29uc3VtZWRCcmlsbGlhbnQgPz8gZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdSZWRpZCAxIG1vdmUnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIGF1dG8tcGxheSBpcyBlbmFibGVkIGFuZCBpdCdzIG5vdyB0aGUgZW5naW5lJ3MgdHVybiwgdHJpZ2dlciBhdXRvLXBsYXlcbiAgICAgICAgaWYgKHRoaXMuYXV0b1BsYXlFbmFibGVkICYmICF0aGlzLmlzR2FtZU92ZXIgJiYgdGhpcy5jaGVzcy50dXJuKCkgPT09IHRoaXMuZW5naW5lUGxheXNGb3IpIHtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ1NjaGVkdWxpbmcgYXV0by1wbGF5IGFmdGVyIHJlZG8nKTtcbiAgICAgICAgICB0aGlzLnNjaGVkdWxlQXV0b1BsYXlNb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdSZWRvIGZhaWxlZDonLCBlcnIpO1xuICAgICAgLy8gUHV0IHRoZSBtb3ZlIGJhY2sgb24gdGhlIHN0YWNrIGlmIGl0IGZhaWxlZFxuICAgICAgdGhpcy5yZWRvU3RhY2sucHVzaChtb3ZlVG9SZWRvKTtcbiAgICAgIGlmIChhbm5vdGF0aW9uVG9SZWRvKSB7XG4gICAgICAgIHRoaXMucmVkb0Fubm90YXRpb25zLnB1c2goYW5ub3RhdGlvblRvUmVkbyk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB1bmRvIGlzIGF2YWlsYWJsZVxuICAgKi9cbiAgZ2V0IGNhblVuZG8oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeS5sZW5ndGggPiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHJlZG8gaXMgYXZhaWxhYmxlXG4gICAqL1xuICBnZXQgY2FuUmVkbygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5yZWRvU3RhY2subGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldCBhdXRvUGxheUN1cnJlbnRTaWRlTGFiZWwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5lbmdpbmVQbGF5c0ZvciA9PT0gJ3cnID8gJ1doaXRlJyA6ICdCbGFjayc7XG4gIH1cblxuICBnZXQgaXNBdXRvUGxheUNvdW50aW5nRG93bigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hdXRvUGxheVNjaGVkdWxlZEZvciA+IERhdGUubm93KCk7XG4gIH1cblxuICBnZXQgYXV0b1BsYXlDb3VudGRvd25Nc1JlbWFpbmluZygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmlzQXV0b1BsYXlDb3VudGluZ0Rvd25cbiAgICAgID8gTWF0aC5tYXgoMCwgdGhpcy5hdXRvUGxheVNjaGVkdWxlZEZvciAtIERhdGUubm93KCkpXG4gICAgICA6IDA7XG4gIH1cblxuICBnZXQgbW92ZUhpc3RvcnlSb3dzKCk6IEFycmF5PHsgbW92ZU51bWJlcjogbnVtYmVyOyB3aGl0ZTogTW92ZSB8IG51bGw7IGJsYWNrOiBNb3ZlIHwgbnVsbCB9PiB7XG4gICAgY29uc3Qgcm93czogQXJyYXk8eyBtb3ZlTnVtYmVyOiBudW1iZXI7IHdoaXRlOiBNb3ZlIHwgbnVsbDsgYmxhY2s6IE1vdmUgfCBudWxsIH0+ID0gW107XG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5oaXN0b3J5Lmxlbmd0aDsgaW5kZXggKz0gMikge1xuICAgICAgY29uc3Qgd2hpdGVNb3ZlID0gdGhpcy5oaXN0b3J5W2luZGV4XSA/PyBudWxsO1xuICAgICAgY29uc3QgYmxhY2tNb3ZlID0gdGhpcy5oaXN0b3J5W2luZGV4ICsgMV0gPz8gbnVsbDtcbiAgICAgIGNvbnN0IG1vdmVOdW1iZXIgPSB3aGl0ZU1vdmU/Lm1vdmVOdW1iZXIgPz8gYmxhY2tNb3ZlPy5tb3ZlTnVtYmVyID8/IHJvd3MubGVuZ3RoICsgMTtcbiAgICAgIHJvd3MucHVzaCh7XG4gICAgICAgIG1vdmVOdW1iZXIsXG4gICAgICAgIHdoaXRlOiB3aGl0ZU1vdmUsXG4gICAgICAgIGJsYWNrOiBibGFja01vdmUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGdldCBkZWJ1Z1Nlc3Npb25JZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdhbWVTZXNzaW9uSWQ7XG4gIH1cblxuICBnZXQgbW92ZUFubm90YXRpb25zKCk6IE1vdmVBbm5vdGF0aW9uW10ge1xuICAgIHJldHVybiB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5tYXAoKGFubm90YXRpb24pID0+ICh7IC4uLmFubm90YXRpb24gfSkpO1xuICB9XG5cbiAgZ2V0IGF1dG9QbGF5QWN0aXZlRHVyYXRpb25NcygpOiBudW1iZXIge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiAhdGhpcy5hdXRvUGxheVBhdXNlZCAmJiB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuYXV0b1BsYXlBY2N1bXVsYXRlZE1zICsgKERhdGUubm93KCkgLSB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYXV0b1BsYXlBY2N1bXVsYXRlZE1zO1xuICB9XG5cbiAgZ2V0IGhhc1NraXBwZWRFbmdpbmVNb3ZlTm90aWNlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgIT09IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3J0IGN1cnJlbnQgZ2FtZSBhcyBQR05cbiAgICovXG4gIGdldCBwZ24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5wZ24oKTtcbiAgfVxuXG4gIGdldCBsYXN0UGxheWVyTW92ZVF1YWxpdHlMYWJlbCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPyBESVNQTEFZX0JVQ0tFVF9MQUJFTFNbdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHldIDogbnVsbDtcbiAgfVxuXG4gIGdldCBsYXN0UGxheWVyTW92ZVF1YWxpdHlDb2xvcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPyBESVNQTEFZX0JVQ0tFVF9DT0xPUlNbdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHldIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgd2FpdChkZWxheU1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5TXMpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgY2FuU2NoZWR1bGVBdXRvUGxheSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hdXRvUGxheUVuYWJsZWRcbiAgICAgICYmICF0aGlzLmF1dG9QbGF5UGF1c2VkXG4gICAgICAmJiAhdGhpcy5pc1RoaW5raW5nXG4gICAgICAmJiAhdGhpcy5pc0dhbWVPdmVyXG4gICAgICAmJiB0aGlzLnR1cm4gPT09IHRoaXMuZW5naW5lUGxheXNGb3I7XG4gIH1cblxuICBwcml2YXRlIGJlZ2luU2Vzc2lvblN0YXRlKG9wdGlvbnM6IHtcbiAgICBnYW1lU2Vzc2lvbklkOiBzdHJpbmc7XG4gICAgZ2FtZVN0YXJ0RmVuOiBzdHJpbmc7XG4gICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZzogYm9vbGVhbjtcbiAgICBoaXN0b3J5QW5ub3RhdGlvbnM/OiBNb3ZlQW5ub3RhdGlvbltdO1xuICAgIHJlZG9Bbm5vdGF0aW9ucz86IE1vdmVBbm5vdGF0aW9uW107XG4gICAgc2V0dXBOYW1lPzogc3RyaW5nO1xuICAgIHNldHVwQ2F0ZWdvcnk/OiBzdHJpbmc7XG4gIH0pOiB2b2lkIHtcbiAgICB0aGlzLnN0b3BBdXRvUGxheUR1cmF0aW9uVHJhY2tpbmcoKTtcbiAgICB0aGlzLmdhbWVTZXNzaW9uSWQgPSBvcHRpb25zLmdhbWVTZXNzaW9uSWQ7XG4gICAgdGhpcy5nYW1lU3RhcnRGZW4gPSBvcHRpb25zLmdhbWVTdGFydEZlbjtcbiAgICB0aGlzLnNlc3Npb25TdGFydGVkQXQgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuY3VycmVudFNldHVwTmFtZSA9IG9wdGlvbnMuc2V0dXBOYW1lID8/ICdDdXN0b20gUG9zaXRpb24nO1xuICAgIHRoaXMuY3VycmVudFNldHVwQ2F0ZWdvcnkgPSBvcHRpb25zLnNldHVwQ2F0ZWdvcnkgPz8gJ2N1c3RvbSc7XG4gICAgdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMgPSBbLi4uKG9wdGlvbnMuaGlzdG9yeUFubm90YXRpb25zID8/IFtdKV07XG4gICAgdGhpcy5yZWRvQW5ub3RhdGlvbnMgPSBbLi4uKG9wdGlvbnMucmVkb0Fubm90YXRpb25zID8/IFtdKV07XG4gICAgdGhpcy5yZWRvU3RhY2sgPSB0aGlzLmNyZWF0ZVJlZG9TdGFja0Zyb21Bbm5vdGF0aW9ucyh0aGlzLnJlZG9Bbm5vdGF0aW9ucyk7XG4gICAgdGhpcy5hdXRvUGxheUFjY3VtdWxhdGVkTXMgPSAwO1xuICAgIHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0ID0gdGhpcy5hdXRvUGxheUVuYWJsZWQgJiYgIXRoaXMuYXV0b1BsYXlQYXVzZWQgPyBEYXRlLm5vdygpIDogbnVsbDtcbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuICAgIGlmIChvcHRpb25zLnJlc2V0QnJpbGxpYW50VHJhY2tpbmcpIHtcbiAgICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0QnJpbGxpYW50VHJhY2tpbmcodGhpcy5nYW1lU2Vzc2lvbklkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsZWFyUmVkb1N0YXRlKCk6IHZvaWQge1xuICAgIHRoaXMucmVkb1N0YWNrID0gW107XG4gICAgdGhpcy5yZWRvQW5ub3RhdGlvbnMgPSBbXTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlTW92ZUFubm90YXRpb24oXG4gICAgbW92ZTogTW92ZSAmIHsgYmVmb3JlPzogc3RyaW5nOyBhZnRlcj86IHN0cmluZyB9LFxuICAgIGNvbnN1bWVkQnJpbGxpYW50OiBib29sZWFuLFxuICAgIGFjdG9yOiAncGxheWVyJyB8ICdlbmdpbmUnIHwgJ3JlZG8nLFxuICApOiBNb3ZlQW5ub3RhdGlvbiB7XG4gICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICBjb25zdCBwcmV2aW91c1RpbWVzdGFtcCA9IHRoaXMuaGlzdG9yeUFubm90YXRpb25zW3RoaXMuaGlzdG9yeUFubm90YXRpb25zLmxlbmd0aCAtIDFdPy50aW1lc3RhbXAgPz8gdGhpcy5zZXNzaW9uU3RhcnRlZEF0O1xuICAgIHJldHVybiB7XG4gICAgICBiZWZvcmVGZW46IG1vdmUuYmVmb3JlID8/IHRoaXMuZmVuLFxuICAgICAgYWZ0ZXJGZW46IG1vdmUuYWZ0ZXIgPz8gdGhpcy5jaGVzcy5mZW4oKSxcbiAgICAgIHVjaTogYCR7bW92ZS5mcm9tfSR7bW92ZS50b30ke21vdmUucHJvbW90aW9uIHx8ICcnfWAsXG4gICAgICBtb3ZlTnVtYmVyOiB0aGlzLmNoZXNzLm1vdmVOdW1iZXIoKSxcbiAgICAgIGNvbnN1bWVkQnJpbGxpYW50LFxuICAgICAgYWN0b3IsXG4gICAgICBzYW46IG1vdmUuc2FuLFxuICAgICAgdGltZXN0YW1wLFxuICAgICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IE1hdGgubWF4KDAsIHRpbWVzdGFtcCAtIHByZXZpb3VzVGltZXN0YW1wKSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSByZWNvcmRNb3ZlQW5ub3RhdGlvbihcbiAgICBtb3ZlOiBNb3ZlICYgeyBiZWZvcmU/OiBzdHJpbmc7IGFmdGVyPzogc3RyaW5nIH0sXG4gICAgY29uc3VtZWRCcmlsbGlhbnQ6IGJvb2xlYW4sXG4gICAgYWN0b3I6ICdwbGF5ZXInIHwgJ2VuZ2luZScgfCAncmVkbycsXG4gICk6IHZvaWQge1xuICAgIHRoaXMuaGlzdG9yeUFubm90YXRpb25zLnB1c2godGhpcy5jcmVhdGVNb3ZlQW5ub3RhdGlvbihtb3ZlLCBjb25zdW1lZEJyaWxsaWFudCwgYWN0b3IpKTtcbiAgICB0aGlzLnN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpO1xuICB9XG5cbiAgcHJpdmF0ZSBzeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTogdm9pZCB7XG4gICAgY29uc3QgdXNhZ2UgPSBkZXJpdmVCcmlsbGlhbnRVc2FnZSh0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucyk7XG4gICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVjb25jaWxlQnJpbGxpYW50VHJhY2tpbmcoXG4gICAgICB0aGlzLmdhbWVTZXNzaW9uSWQsXG4gICAgICB1c2FnZS5icmlsbGlhbnRNb3ZlTnVtYmVycyxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZUF1dG9QbGF5TW92ZShkZWxheU1zID0gdWlTdGF0ZVZpZXdNb2RlbC5hdXRvUGxheURlbGF5TXMpOiB2b2lkIHtcbiAgICB0aGlzLmNsZWFyQXV0b1BsYXlTY2hlZHVsZSgpO1xuXG4gICAgaWYgKCF0aGlzLmNhblNjaGVkdWxlQXV0b1BsYXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmF1dG9QbGF5U2NoZWR1bGVkRm9yID0gRGF0ZS5ub3coKSArIGRlbGF5TXM7XG4gICAgdGhpcy5fYXV0b1BsYXlUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuYXV0b1BsYXlTY2hlZHVsZWRGb3IgPSAwO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnNvbHZlTmV4dE1vdmUodHJ1ZSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdBdXRvLXBsYXkgZXJyb3I6JywgZXJyKTtcbiAgICAgIH0pO1xuICAgIH0sIGRlbGF5TXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbGVhckF1dG9QbGF5U2NoZWR1bGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2F1dG9QbGF5VGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2F1dG9QbGF5VGltZW91dCk7XG4gICAgICB0aGlzLl9hdXRvUGxheVRpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLmF1dG9QbGF5U2NoZWR1bGVkRm9yID0gMDtcbiAgfVxuXG4gIHByaXZhdGUgc3RvcEF1dG9QbGF5RHVyYXRpb25UcmFja2luZygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuYXV0b1BsYXlBY2N1bXVsYXRlZE1zICs9IERhdGUubm93KCkgLSB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdDtcbiAgICAgIHRoaXMuYXV0b1BsYXlMYXN0UmVzdW1lZEF0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN0YXJ0QXV0b1BsYXlEdXJhdGlvblRyYWNraW5nKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiAhdGhpcy5hdXRvUGxheVBhdXNlZCAmJiB0aGlzLmF1dG9QbGF5TGFzdFJlc3VtZWRBdCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5hdXRvUGxheUxhc3RSZXN1bWVkQXQgPSBEYXRlLm5vdygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlTGFzdEFubm90YXRpb24ocGFydGlhbDogUGFydGlhbDxNb3ZlQW5ub3RhdGlvbj4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdEluZGV4ID0gdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMubGVuZ3RoIC0gMTtcbiAgICB0aGlzLmhpc3RvcnlBbm5vdGF0aW9uc1tsYXN0SW5kZXhdID0ge1xuICAgICAgLi4udGhpcy5oaXN0b3J5QW5ub3RhdGlvbnNbbGFzdEluZGV4XSxcbiAgICAgIC4uLnBhcnRpYWwsXG4gICAgfTtcbiAgICB0aGlzLnNhdmVGZW5Ub0hpc3RvcnkoKTtcbiAgfVxuXG4gIHByaXZhdGUgcHVibGlzaE1vdmVGZWVkYmFjayhvcHRpb25zOiB7XG4gICAgYWN0b3I6ICdwbGF5ZXInIHwgJ2VuZ2luZScgfCAncmVkbyc7XG4gICAgbW92ZTogTW92ZTtcbiAgICBpc0JyaWxsaWFudDogYm9vbGVhbjtcbiAgICBxdWFsaXR5TGFiZWw/OiBzdHJpbmcgfCBudWxsO1xuICAgIGJ1Y2tldD86IERpc3BsYXlNb3ZlQnVja2V0IHwgTW92ZUJ1Y2tldCB8IG51bGw7XG4gICAgc2lsZW50PzogYm9vbGVhbjtcbiAgfSk6IHZvaWQge1xuICAgIHRoaXMucmVjZW50TW92ZUZlZWRiYWNrID0ge1xuICAgICAgaWQ6IGAke0RhdGUubm93KCl9XyR7b3B0aW9ucy5tb3ZlLnNhbn1fJHtvcHRpb25zLmFjdG9yfWAsXG4gICAgICBhY3Rvcjogb3B0aW9ucy5hY3RvcixcbiAgICAgIHNhbjogb3B0aW9ucy5tb3ZlLnNhbixcbiAgICAgIHF1YWxpdHlMYWJlbDogb3B0aW9ucy5xdWFsaXR5TGFiZWwgPz8gbnVsbCxcbiAgICAgIGJ1Y2tldDogb3B0aW9ucy5idWNrZXQgPz8gbnVsbCxcbiAgICAgIGlzQnJpbGxpYW50OiBvcHRpb25zLmlzQnJpbGxpYW50LFxuICAgICAgaXNDYXB0dXJlOiBvcHRpb25zLm1vdmUuaXNDYXB0dXJlKCksXG4gICAgICBpc0NoZWNrOiBvcHRpb25zLm1vdmUuc2FuLmluY2x1ZGVzKCcrJykgfHwgb3B0aW9ucy5tb3ZlLnNhbi5pbmNsdWRlcygnIycpLFxuICAgICAgaXNHYW1lRW5kOiB0aGlzLmlzR2FtZU92ZXIsXG4gICAgICBzaWxlbnQ6IG9wdGlvbnMuc2lsZW50ID8/IGZhbHNlLFxuICAgICAgY3JlYXRlZEF0OiBEYXRlLm5vdygpLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHVuZG9Nb3Zlcyhjb3VudDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdW5kb25lTW92ZXM6IE1vdmVbXSA9IFtdO1xuICAgIGNvbnN0IHVuZG9uZUFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdID0gW107XG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY291bnQ7IGluZGV4ICs9IDEpIHtcbiAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLnVuZG8oKTtcbiAgICAgIGlmICghbW92ZSkge1xuICAgICAgICBmb3IgKGxldCByZXN0b3JlSW5kZXggPSB1bmRvbmVNb3Zlcy5sZW5ndGggLSAxOyByZXN0b3JlSW5kZXggPj0gMDsgcmVzdG9yZUluZGV4IC09IDEpIHtcbiAgICAgICAgICBjb25zdCByZXN0b3JlTW92ZSA9IHVuZG9uZU1vdmVzW3Jlc3RvcmVJbmRleF07XG4gICAgICAgICAgdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgICAgIGZyb206IHJlc3RvcmVNb3ZlLmZyb20gYXMgU3F1YXJlLFxuICAgICAgICAgICAgdG86IHJlc3RvcmVNb3ZlLnRvIGFzIFNxdWFyZSxcbiAgICAgICAgICAgIHByb21vdGlvbjogcmVzdG9yZU1vdmUucHJvbW90aW9uLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdW5kb25lTW92ZXMucHVzaChtb3ZlKTtcbiAgICAgIGNvbnN0IGFubm90YXRpb24gPSB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5wb3AoKTtcbiAgICAgIGlmIChhbm5vdGF0aW9uKSB7XG4gICAgICAgIHVuZG9uZUFubm90YXRpb25zLnB1c2goYW5ub3RhdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZWRvU3RhY2sucHVzaCguLi51bmRvbmVNb3Zlcyk7XG4gICAgdGhpcy5yZWRvQW5ub3RhdGlvbnMucHVzaCguLi51bmRvbmVBbm5vdGF0aW9ucyk7XG4gICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZFBlcnNpc3RlZEJvYXJkU3RhdGUoKTogUGVyc2lzdGVkQm9hcmRTdGF0ZSB8IG51bGwge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWZlYXR1cmVPcHRpb25zVmlld01vZGVsLnBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5CT0FSRF9TVEFURV9TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHNhdmVkKSBhcyBQYXJ0aWFsPFBlcnNpc3RlZEJvYXJkU3RhdGU+O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVudEZlbjogcGFyc2VkLmN1cnJlbnRGZW4gPz8gJycsXG4gICAgICAgIGZlbkhpc3Rvcnk6IEFycmF5LmlzQXJyYXkocGFyc2VkLmZlbkhpc3RvcnkpID8gcGFyc2VkLmZlbkhpc3RvcnkgOiBbXSxcbiAgICAgICAgZ2FtZVNlc3Npb25JZDogcGFyc2VkLmdhbWVTZXNzaW9uSWQgPz8gY3JlYXRlR2FtZVNlc3Npb25JZCgpLFxuICAgICAgICBnYW1lU3RhcnRGZW46IHBhcnNlZC5nYW1lU3RhcnRGZW4gPz8gcGFyc2VkLmN1cnJlbnRGZW4gPz8gbmV3IENoZXNzKCkuZmVuKCksXG4gICAgICAgIGhpc3RvcnlBbm5vdGF0aW9uczogQXJyYXkuaXNBcnJheShwYXJzZWQuaGlzdG9yeUFubm90YXRpb25zKSA/IHBhcnNlZC5oaXN0b3J5QW5ub3RhdGlvbnMgOiBbXSxcbiAgICAgICAgcmVkb0Fubm90YXRpb25zOiBBcnJheS5pc0FycmF5KHBhcnNlZC5yZWRvQW5ub3RhdGlvbnMpID8gcGFyc2VkLnJlZG9Bbm5vdGF0aW9ucyA6IFtdLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJQZXJzaXN0ZWRCb2FyZFN0YXRlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLkJPQVJEX1NUQVRFX1NUT1JBR0VfS0VZKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gY2xlYXIgYm9hcmQgc3RhdGUgc3RvcmFnZTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVSZWRvU3RhY2tGcm9tQW5ub3RhdGlvbnMoYW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW10pOiBNb3ZlW10ge1xuICAgIHJldHVybiBhbm5vdGF0aW9ucy5tYXAoKGFubm90YXRpb24pID0+ICh7XG4gICAgICBmcm9tOiBhbm5vdGF0aW9uLnVjaS5zbGljZSgwLCAyKSxcbiAgICAgIHRvOiBhbm5vdGF0aW9uLnVjaS5zbGljZSgyLCA0KSxcbiAgICAgIHByb21vdGlvbjogYW5ub3RhdGlvbi51Y2kubGVuZ3RoID4gNCA/IGFubm90YXRpb24udWNpWzRdIDogdW5kZWZpbmVkLFxuICAgIH0pKSBhcyBNb3ZlW107XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgYm9hcmRWaWV3TW9kZWwgPSBuZXcgQm9hcmRWaWV3TW9kZWwoKTtcbiIsICJpbXBvcnQgeyBNb3ZlQW5ub3RhdGlvbiB9IGZyb20gJy4vYnJpbGxpYW50VHJhY2tpbmcnO1xuaW1wb3J0IHsgRGlzcGxheU1vdmVCdWNrZXQsIE1vdmVRdWFsaXR5UHJlc2V0SWQgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBHYW1lQW5hbHl0aWNzU3VtbWFyeSB7XG4gIHNlc3Npb25JZDogc3RyaW5nO1xuICBjcmVhdGVkQXQ6IHN0cmluZztcbiAgZmluaXNoZWRBdDogc3RyaW5nO1xuICByZXN1bHQ6IHN0cmluZztcbiAgZ2FtZVN0YXR1czogc3RyaW5nO1xuICBwZXJzb25hSWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCAnY3VzdG9tJztcbiAgcGVyc29uYUxhYmVsOiBzdHJpbmc7XG4gIHNldHVwTmFtZTogc3RyaW5nO1xuICBzZXR1cENhdGVnb3J5OiBzdHJpbmc7XG4gIG1vdmVDb3VudDogbnVtYmVyO1xuICBicmlsbGlhbnRNb3ZlczogbnVtYmVyO1xuICBpbmFjY3VyYWNpZXM6IG51bWJlcjtcbiAgbWlzdGFrZXM6IG51bWJlcjtcbiAgYmx1bmRlcnM6IG51bWJlcjtcbiAgYXZlcmFnZUV2YWxMb3NzOiBudW1iZXI7XG4gIGF2ZXJhZ2VNb3ZlRGVsYXlNczogbnVtYmVyO1xuICBhdXRvcGxheUR1cmF0aW9uTXM6IG51bWJlcjtcbiAgcXVhbGl0eUNvdW50czogUmVjb3JkPERpc3BsYXlNb3ZlQnVja2V0LCBudW1iZXI+O1xuICBjb21wbGV4aXR5RGlzdHJpYnV0aW9uOiBSZWNvcmQ8J2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJywgbnVtYmVyPjtcbiAgbW92ZVRpbWVsaW5lOiBBcnJheTx7XG4gICAgcGx5OiBudW1iZXI7XG4gICAgYWN0b3I6ICdwbGF5ZXInIHwgJ2VuZ2luZScgfCAncmVkbyc7XG4gICAgc2FuOiBzdHJpbmc7XG4gICAgYnVja2V0OiBzdHJpbmcgfCBudWxsO1xuICAgIGV2YWxMb3NzOiBudW1iZXIgfCBudWxsO1xuICAgIGV2YWx1YXRpb246IG51bWJlciB8IG51bGw7XG4gICAgY29tcGxleGl0eUxldmVsOiAnbG93JyB8ICdtZWRpdW0nIHwgJ2hpZ2gnIHwgbnVsbDtcbiAgICBjb21wbGV4aXR5U2NvcmU6IG51bWJlciB8IG51bGw7XG4gICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IG51bWJlcjtcbiAgICBjb25zdW1lZEJyaWxsaWFudDogYm9vbGVhbjtcbiAgfT47XG4gIGhpZ2hsaWdodGVkQnJpbGxpYW50TW92ZXM6IEFycmF5PHsgcGx5OiBudW1iZXI7IHNhbjogc3RyaW5nIH0+O1xuICBtYWpvck1pc3Rha2VzOiBBcnJheTx7IHBseTogbnVtYmVyOyBzYW46IHN0cmluZzsgYnVja2V0OiBzdHJpbmcgfCBudWxsOyBldmFsTG9zczogbnVtYmVyIHwgbnVsbCB9PjtcbiAgZXZhbFRyZW5kOiBBcnJheTx7IHBseTogbnVtYmVyOyBldmFsdWF0aW9uOiBudW1iZXIgfT47XG4gIGNvbXBsZXhpdHlUcmVuZDogQXJyYXk8eyBwbHk6IG51bWJlcjsgc2NvcmU6IG51bWJlciB9PjtcbiAgcGduOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVjZW50R2FtZUVudHJ5IHtcbiAgc2Vzc2lvbklkOiBzdHJpbmc7XG4gIGZpbmlzaGVkQXQ6IHN0cmluZztcbiAgcmVzdWx0OiBzdHJpbmc7XG4gIHBlcnNvbmFMYWJlbDogc3RyaW5nO1xuICBwZXJzb25hSWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCAnY3VzdG9tJztcbiAgc2V0dXBOYW1lOiBzdHJpbmc7XG4gIGR1cmF0aW9uTXM6IG51bWJlcjtcbiAgbW92ZUNvdW50OiBudW1iZXI7XG4gIGJyaWxsaWFudE1vdmVzOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnVpbGRHYW1lQW5hbHl0aWNzT3B0aW9ucyB7XG4gIHNlc3Npb25JZDogc3RyaW5nO1xuICBjcmVhdGVkQXRNczogbnVtYmVyO1xuICBmaW5pc2hlZEF0TXM6IG51bWJlcjtcbiAgZ2FtZVN0YXR1czogc3RyaW5nO1xuICBwZXJzb25hSWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsO1xuICBwZXJzb25hTGFiZWw6IHN0cmluZztcbiAgc2V0dXBOYW1lPzogc3RyaW5nIHwgbnVsbDtcbiAgc2V0dXBDYXRlZ29yeT86IHN0cmluZyB8IG51bGw7XG4gIGF1dG9wbGF5RHVyYXRpb25NczogbnVtYmVyO1xuICBtb3ZlQW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW107XG4gIHBnbjogc3RyaW5nO1xufVxuXG5jb25zdCBBTExfQlVDS0VUUzogRGlzcGxheU1vdmVCdWNrZXRbXSA9IFtcbiAgJ2Jlc3QnLFxuICAnZ3JlYXQnLFxuICAnZXhjZWxsZW50JyxcbiAgJ2dvb2QnLFxuICAnaW5hY2N1cmFjeScsXG4gICdtaXN0YWtlJyxcbiAgJ2JsdW5kZXInLFxuICAnZmFsbGJhY2snLFxuXTtcblxuZnVuY3Rpb24gY3JlYXRlRW1wdHlRdWFsaXR5Q291bnRzKCk6IFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gIHJldHVybiBBTExfQlVDS0VUUy5yZWR1Y2UoKGNvdW50cywgYnVja2V0KSA9PiB7XG4gICAgY291bnRzW2J1Y2tldF0gPSAwO1xuICAgIHJldHVybiBjb3VudHM7XG4gIH0sIHt9IGFzIFJlY29yZDxEaXNwbGF5TW92ZUJ1Y2tldCwgbnVtYmVyPik7XG59XG5cbmZ1bmN0aW9uIGNsYXNzaWZ5UmVzdWx0KGdhbWVTdGF0dXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICgvY2hlY2ttYXRlL2kudGVzdChnYW1lU3RhdHVzKSkge1xuICAgIGNvbnN0IHdpbm5lciA9IGdhbWVTdGF0dXMuaW5jbHVkZXMoJ1doaXRlIHdpbnMnKSA/ICdXaGl0ZScgOiBnYW1lU3RhdHVzLmluY2x1ZGVzKCdCbGFjayB3aW5zJykgPyAnQmxhY2snIDogJ0RlY2lzaXZlJztcbiAgICByZXR1cm4gYCR7d2lubmVyfSB3b25gO1xuICB9XG5cbiAgaWYgKC9zdGFsZW1hdGV8ZHJhdy9pLnRlc3QoZ2FtZVN0YXR1cykpIHtcbiAgICByZXR1cm4gJ0RyYXcnO1xuICB9XG5cbiAgaWYgKC9jaGVjay9pLnRlc3QoZ2FtZVN0YXR1cykpIHtcbiAgICByZXR1cm4gJ0luIHByb2dyZXNzJztcbiAgfVxuXG4gIHJldHVybiAnSW4gcHJvZ3Jlc3MnO1xufVxuXG5mdW5jdGlvbiByb3VuZFRvT25lRGVjaW1hbCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUgKiAxMCkgLyAxMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkR2FtZUFuYWx5dGljc1N1bW1hcnkob3B0aW9uczogQnVpbGRHYW1lQW5hbHl0aWNzT3B0aW9ucyk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5IHtcbiAgY29uc3QgcXVhbGl0eUNvdW50cyA9IGNyZWF0ZUVtcHR5UXVhbGl0eUNvdW50cygpO1xuICBjb25zdCBjb21wbGV4aXR5RGlzdHJpYnV0aW9uOiBSZWNvcmQ8J2xvdycgfCAnbWVkaXVtJyB8ICdoaWdoJywgbnVtYmVyPiA9IHtcbiAgICBsb3c6IDAsXG4gICAgbWVkaXVtOiAwLFxuICAgIGhpZ2g6IDAsXG4gIH07XG5cbiAgbGV0IGV2YWxMb3NzVG90YWwgPSAwO1xuICBsZXQgZXZhbExvc3NDb3VudCA9IDA7XG4gIGxldCBkZWxheVRvdGFsID0gMDtcbiAgbGV0IGRlbGF5Q291bnQgPSAwO1xuICBsZXQgYnJpbGxpYW50TW92ZXMgPSAwO1xuXG4gIGNvbnN0IG1vdmVUaW1lbGluZSA9IG9wdGlvbnMubW92ZUFubm90YXRpb25zLm1hcCgoYW5ub3RhdGlvbiwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBidWNrZXQgPSAoYW5ub3RhdGlvbi5idWNrZXQgPz8gbnVsbCkgYXMgc3RyaW5nIHwgbnVsbDtcbiAgICBjb25zdCB0eXBlZEJ1Y2tldCA9IEFMTF9CVUNLRVRTLmluY2x1ZGVzKGJ1Y2tldCBhcyBEaXNwbGF5TW92ZUJ1Y2tldClcbiAgICAgID8gKGJ1Y2tldCBhcyBEaXNwbGF5TW92ZUJ1Y2tldClcbiAgICAgIDogbnVsbDtcblxuICAgIGlmICh0eXBlZEJ1Y2tldCkge1xuICAgICAgcXVhbGl0eUNvdW50c1t0eXBlZEJ1Y2tldF0gKz0gMTtcbiAgICB9XG5cbiAgICBpZiAoYW5ub3RhdGlvbi5jb25zdW1lZEJyaWxsaWFudCkge1xuICAgICAgYnJpbGxpYW50TW92ZXMgKz0gMTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFubm90YXRpb24uZXZhbExvc3MgPT09ICdudW1iZXInKSB7XG4gICAgICBldmFsTG9zc1RvdGFsICs9IGFubm90YXRpb24uZXZhbExvc3M7XG4gICAgICBldmFsTG9zc0NvdW50ICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhbm5vdGF0aW9uLmRlbGF5TXNTaW5jZVByZXZpb3VzID09PSAnbnVtYmVyJykge1xuICAgICAgZGVsYXlUb3RhbCArPSBhbm5vdGF0aW9uLmRlbGF5TXNTaW5jZVByZXZpb3VzO1xuICAgICAgZGVsYXlDb3VudCArPSAxO1xuICAgIH1cblxuICAgIGlmIChhbm5vdGF0aW9uLmNvbXBsZXhpdHlMZXZlbCkge1xuICAgICAgY29tcGxleGl0eURpc3RyaWJ1dGlvblthbm5vdGF0aW9uLmNvbXBsZXhpdHlMZXZlbF0gKz0gMTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcGx5OiBpbmRleCArIDEsXG4gICAgICBhY3RvcjogYW5ub3RhdGlvbi5hY3RvciA/PyAncGxheWVyJyxcbiAgICAgIHNhbjogYW5ub3RhdGlvbi5zYW4gPz8gYW5ub3RhdGlvbi51Y2ksXG4gICAgICBidWNrZXQsXG4gICAgICBldmFsTG9zczogYW5ub3RhdGlvbi5ldmFsTG9zcyA/PyBudWxsLFxuICAgICAgZXZhbHVhdGlvbjogYW5ub3RhdGlvbi5ldmFsdWF0aW9uID8/IG51bGwsXG4gICAgICBjb21wbGV4aXR5TGV2ZWw6IGFubm90YXRpb24uY29tcGxleGl0eUxldmVsID8/IG51bGwsXG4gICAgICBjb21wbGV4aXR5U2NvcmU6IGFubm90YXRpb24uY29tcGxleGl0eVNjb3JlID8/IG51bGwsXG4gICAgICBkZWxheU1zU2luY2VQcmV2aW91czogYW5ub3RhdGlvbi5kZWxheU1zU2luY2VQcmV2aW91cyA/PyAwLFxuICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IGFubm90YXRpb24uY29uc3VtZWRCcmlsbGlhbnQsXG4gICAgfTtcbiAgfSk7XG5cbiAgY29uc3QgaGlnaGxpZ2h0ZWRCcmlsbGlhbnRNb3ZlcyA9IG1vdmVUaW1lbGluZVxuICAgIC5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS5jb25zdW1lZEJyaWxsaWFudClcbiAgICAubWFwKChlbnRyeSkgPT4gKHsgcGx5OiBlbnRyeS5wbHksIHNhbjogZW50cnkuc2FuIH0pKTtcbiAgY29uc3QgbWFqb3JNaXN0YWtlcyA9IG1vdmVUaW1lbGluZVxuICAgIC5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS5idWNrZXQgPT09ICdtaXN0YWtlJyB8fCBlbnRyeS5idWNrZXQgPT09ICdibHVuZGVyJylcbiAgICAubWFwKChlbnRyeSkgPT4gKHtcbiAgICAgIHBseTogZW50cnkucGx5LFxuICAgICAgc2FuOiBlbnRyeS5zYW4sXG4gICAgICBidWNrZXQ6IGVudHJ5LmJ1Y2tldCxcbiAgICAgIGV2YWxMb3NzOiBlbnRyeS5ldmFsTG9zcyxcbiAgICB9KSk7XG4gIGNvbnN0IGV2YWxUcmVuZCA9IG1vdmVUaW1lbGluZVxuICAgIC5maWx0ZXIoKGVudHJ5KTogZW50cnkgaXMgdHlwZW9mIGVudHJ5ICYgeyBldmFsdWF0aW9uOiBudW1iZXIgfSA9PiB0eXBlb2YgZW50cnkuZXZhbHVhdGlvbiA9PT0gJ251bWJlcicpXG4gICAgLm1hcCgoZW50cnkpID0+ICh7IHBseTogZW50cnkucGx5LCBldmFsdWF0aW9uOiBlbnRyeS5ldmFsdWF0aW9uIH0pKTtcbiAgY29uc3QgY29tcGxleGl0eVRyZW5kID0gbW92ZVRpbWVsaW5lXG4gICAgLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyB0eXBlb2YgZW50cnkgJiB7IGNvbXBsZXhpdHlTY29yZTogbnVtYmVyIH0gPT4gdHlwZW9mIGVudHJ5LmNvbXBsZXhpdHlTY29yZSA9PT0gJ251bWJlcicpXG4gICAgLm1hcCgoZW50cnkpID0+ICh7IHBseTogZW50cnkucGx5LCBzY29yZTogZW50cnkuY29tcGxleGl0eVNjb3JlIH0pKTtcblxuICByZXR1cm4ge1xuICAgIHNlc3Npb25JZDogb3B0aW9ucy5zZXNzaW9uSWQsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZShvcHRpb25zLmNyZWF0ZWRBdE1zKS50b0lTT1N0cmluZygpLFxuICAgIGZpbmlzaGVkQXQ6IG5ldyBEYXRlKG9wdGlvbnMuZmluaXNoZWRBdE1zKS50b0lTT1N0cmluZygpLFxuICAgIHJlc3VsdDogY2xhc3NpZnlSZXN1bHQob3B0aW9ucy5nYW1lU3RhdHVzKSxcbiAgICBnYW1lU3RhdHVzOiBvcHRpb25zLmdhbWVTdGF0dXMsXG4gICAgcGVyc29uYUlkOiBvcHRpb25zLnBlcnNvbmFJZCA/PyAnY3VzdG9tJyxcbiAgICBwZXJzb25hTGFiZWw6IG9wdGlvbnMucGVyc29uYUxhYmVsLFxuICAgIHNldHVwTmFtZTogb3B0aW9ucy5zZXR1cE5hbWUgPz8gJ05ldyBHYW1lJyxcbiAgICBzZXR1cENhdGVnb3J5OiBvcHRpb25zLnNldHVwQ2F0ZWdvcnkgPz8gJ2N1c3RvbScsXG4gICAgbW92ZUNvdW50OiBtb3ZlVGltZWxpbmUubGVuZ3RoLFxuICAgIGJyaWxsaWFudE1vdmVzLFxuICAgIGluYWNjdXJhY2llczogcXVhbGl0eUNvdW50cy5pbmFjY3VyYWN5LFxuICAgIG1pc3Rha2VzOiBxdWFsaXR5Q291bnRzLm1pc3Rha2UsXG4gICAgYmx1bmRlcnM6IHF1YWxpdHlDb3VudHMuYmx1bmRlcixcbiAgICBhdmVyYWdlRXZhbExvc3M6IGV2YWxMb3NzQ291bnQgPiAwID8gcm91bmRUb09uZURlY2ltYWwoZXZhbExvc3NUb3RhbCAvIGV2YWxMb3NzQ291bnQpIDogMCxcbiAgICBhdmVyYWdlTW92ZURlbGF5TXM6IGRlbGF5Q291bnQgPiAwID8gTWF0aC5yb3VuZChkZWxheVRvdGFsIC8gZGVsYXlDb3VudCkgOiAwLFxuICAgIGF1dG9wbGF5RHVyYXRpb25NczogTWF0aC5tYXgoMCwgb3B0aW9ucy5hdXRvcGxheUR1cmF0aW9uTXMpLFxuICAgIHF1YWxpdHlDb3VudHMsXG4gICAgY29tcGxleGl0eURpc3RyaWJ1dGlvbixcbiAgICBtb3ZlVGltZWxpbmUsXG4gICAgaGlnaGxpZ2h0ZWRCcmlsbGlhbnRNb3ZlcyxcbiAgICBtYWpvck1pc3Rha2VzLFxuICAgIGV2YWxUcmVuZCxcbiAgICBjb21wbGV4aXR5VHJlbmQsXG4gICAgcGduOiBvcHRpb25zLnBnbixcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmVjZW50R2FtZUVudHJ5KHN1bW1hcnk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5KTogUmVjZW50R2FtZUVudHJ5IHtcbiAgcmV0dXJuIHtcbiAgICBzZXNzaW9uSWQ6IHN1bW1hcnkuc2Vzc2lvbklkLFxuICAgIGZpbmlzaGVkQXQ6IHN1bW1hcnkuZmluaXNoZWRBdCxcbiAgICByZXN1bHQ6IHN1bW1hcnkucmVzdWx0LFxuICAgIHBlcnNvbmFMYWJlbDogc3VtbWFyeS5wZXJzb25hTGFiZWwsXG4gICAgcGVyc29uYUlkOiBzdW1tYXJ5LnBlcnNvbmFJZCxcbiAgICBzZXR1cE5hbWU6IHN1bW1hcnkuc2V0dXBOYW1lLFxuICAgIGR1cmF0aW9uTXM6IE1hdGgubWF4KDAsIG5ldyBEYXRlKHN1bW1hcnkuZmluaXNoZWRBdCkuZ2V0VGltZSgpIC0gbmV3IERhdGUoc3VtbWFyeS5jcmVhdGVkQXQpLmdldFRpbWUoKSksXG4gICAgbW92ZUNvdW50OiBzdW1tYXJ5Lm1vdmVDb3VudCxcbiAgICBicmlsbGlhbnRNb3Zlczogc3VtbWFyeS5icmlsbGlhbnRNb3ZlcyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUdhbWVBbmFseXRpY3NTdW1tYXJ5KHN1bW1hcnk6IEdhbWVBbmFseXRpY3NTdW1tYXJ5KTogc3RyaW5nIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHN1bW1hcnksIG51bGwsIDIpO1xufVxuIiwgImltcG9ydCB7IGFjdGlvbiwgbWFrZUF1dG9PYnNlcnZhYmxlLCByZWFjdGlvbiB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSxcbiAgYnVpbGRSZWNlbnRHYW1lRW50cnksXG4gIEdhbWVBbmFseXRpY3NTdW1tYXJ5LFxuICBSZWNlbnRHYW1lRW50cnksXG4gIHNlcmlhbGl6ZUdhbWVBbmFseXRpY3NTdW1tYXJ5LFxufSBmcm9tICcuLi9lbmdpbmUvZ2FtZUFuYWx5dGljcyc7XG5pbXBvcnQgeyBib2FyZFZpZXdNb2RlbCwgQm9hcmRWaWV3TW9kZWwgfSBmcm9tICcuL0JvYXJkVmlld01vZGVsJztcbmltcG9ydCB7IGNvbmZpZ1ZpZXdNb2RlbCwgQ29uZmlnVmlld01vZGVsIH0gZnJvbSAnLi9Db25maWdWaWV3TW9kZWwnO1xuXG5jb25zdCBSRUNFTlRfR0FNRVNfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX3JlY2VudF9nYW1lcyc7XG5jb25zdCBNQVhfUkVDRU5UX0dBTUVTID0gMjA7XG5cbmludGVyZmFjZSBQZXJzaXN0ZWRBbmFseXRpY3NTbmFwc2hvdCB7XG4gIHJlY2VudEdhbWVzOiBHYW1lQW5hbHl0aWNzU3VtbWFyeVtdO1xufVxuXG5pbnRlcmZhY2UgR2FtZUFuYWx5dGljc0RlcGVuZGVuY2llcyB7XG4gIGJvYXJkVmlld01vZGVsOiBQaWNrPFxuICAgIEJvYXJkVmlld01vZGVsLFxuICAgIHwgJ2RlYnVnU2Vzc2lvbklkJ1xuICAgIHwgJ21vdmVBbm5vdGF0aW9ucydcbiAgICB8ICdzZXNzaW9uU3RhcnRlZEF0J1xuICAgIHwgJ2dhbWVTdGF0dXMnXG4gICAgfCAncGduJ1xuICAgIHwgJ2N1cnJlbnRTZXR1cE5hbWUnXG4gICAgfCAnY3VycmVudFNldHVwQ2F0ZWdvcnknXG4gICAgfCAnYXV0b1BsYXlBY3RpdmVEdXJhdGlvbk1zJ1xuICAgIHwgJ2lzR2FtZU92ZXInXG4gID47XG4gIGNvbmZpZ1ZpZXdNb2RlbDogUGljazxDb25maWdWaWV3TW9kZWwsICdhY3RpdmVQZXJzb25hSWQnIHwgJ2FjdGl2ZVBlcnNvbmFMYWJlbCc+O1xufVxuXG5mdW5jdGlvbiBkb3dubG9hZFRleHRGaWxlKGZpbGVOYW1lOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcsIG1pbWVUeXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2NvbnRlbnRzXSwgeyB0eXBlOiBtaW1lVHlwZSB9KTtcbiAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgY29uc3QgYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBhbmNob3IuaHJlZiA9IHVybDtcbiAgYW5jaG9yLmRvd25sb2FkID0gZmlsZU5hbWU7XG4gIGFuY2hvci5jbGljaygpO1xuICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG59XG5cbmZ1bmN0aW9uIHNhZmVQYXJzZVJlY2VudEdhbWVzKHNhdmVkOiBzdHJpbmcgfCBudWxsKTogR2FtZUFuYWx5dGljc1N1bW1hcnlbXSB7XG4gIGlmICghc2F2ZWQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzIFBlcnNpc3RlZEFuYWx5dGljc1NuYXBzaG90IHwgR2FtZUFuYWx5dGljc1N1bW1hcnlbXTtcbiAgICBjb25zdCByZWNlbnRHYW1lcyA9IEFycmF5LmlzQXJyYXkocGFyc2VkKVxuICAgICAgPyBwYXJzZWRcbiAgICAgIDogQXJyYXkuaXNBcnJheShwYXJzZWQucmVjZW50R2FtZXMpXG4gICAgICAgID8gcGFyc2VkLnJlY2VudEdhbWVzXG4gICAgICAgIDogW107XG5cbiAgICByZXR1cm4gcmVjZW50R2FtZXMuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIEdhbWVBbmFseXRpY3NTdW1tYXJ5ID0+IChcbiAgICAgIHR5cGVvZiBlbnRyeT8uc2Vzc2lvbklkID09PSAnc3RyaW5nJ1xuICAgICAgJiYgdHlwZW9mIGVudHJ5Py5maW5pc2hlZEF0ID09PSAnc3RyaW5nJ1xuICAgICAgJiYgdHlwZW9mIGVudHJ5Py5wZXJzb25hTGFiZWwgPT09ICdzdHJpbmcnXG4gICAgICAmJiB0eXBlb2YgZW50cnk/LnNldHVwTmFtZSA9PT0gJ3N0cmluZydcbiAgICApKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lQW5hbHl0aWNzVmlld01vZGVsIHtcbiAgc3VtbWFyeU9wZW4gPSBmYWxzZTtcbiAgcmVjZW50R2FtZXM6IEdhbWVBbmFseXRpY3NTdW1tYXJ5W10gPSBbXTtcbiAgc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgbGFzdENhcHR1cmVkU2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRlcHM6IEdhbWVBbmFseXRpY3NEZXBlbmRlbmNpZXM7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZGVwczogR2FtZUFuYWx5dGljc0RlcGVuZGVuY2llcyA9IHtcbiAgICAgIGJvYXJkVmlld01vZGVsLFxuICAgICAgY29uZmlnVmlld01vZGVsLFxuICAgIH0sXG4gICkge1xuICAgIHRoaXMuZGVwcyA9IGRlcHM7XG5cbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0U3VtbWFyeU9wZW46IGFjdGlvbixcbiAgICAgIHNldFNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZDogYWN0aW9uLFxuICAgICAgY2FwdHVyZUNvbXBsZXRlZEdhbWU6IGFjdGlvbixcbiAgICAgIGNsZWFyUmVjZW50R2FtZXM6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG5cbiAgICByZWFjdGlvbihcbiAgICAgICgpID0+ICh7XG4gICAgICAgIHNlc3Npb25JZDogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmRlYnVnU2Vzc2lvbklkLFxuICAgICAgICBpc0dhbWVPdmVyOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuaXNHYW1lT3ZlcixcbiAgICAgICAgbW92ZUNvdW50OiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwubW92ZUFubm90YXRpb25zLmxlbmd0aCxcbiAgICAgIH0pLFxuICAgICAgKHsgc2Vzc2lvbklkLCBpc0dhbWVPdmVyLCBtb3ZlQ291bnQgfSkgPT4ge1xuICAgICAgICBpZiAoaXNHYW1lT3ZlciAmJiBtb3ZlQ291bnQgPiAwICYmIHRoaXMubGFzdENhcHR1cmVkU2Vzc2lvbklkICE9PSBzZXNzaW9uSWQpIHtcbiAgICAgICAgICB0aGlzLmNhcHR1cmVDb21wbGV0ZWRHYW1lKCk7XG4gICAgICAgICAgdGhpcy5zdW1tYXJ5T3BlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgKTtcbiAgfVxuXG4gIHNldFN1bW1hcnlPcGVuKG9wZW46IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAob3Blbikge1xuICAgICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnN1bW1hcnlPcGVuID0gb3BlbjtcbiAgfVxuXG4gIHNldFNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZChzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCA9IHNlc3Npb25JZDtcbiAgfVxuXG4gIGNhcHR1cmVDb21wbGV0ZWRHYW1lKCk6IHZvaWQge1xuICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLmN1cnJlbnRTdW1tYXJ5O1xuICAgIGlmICghc3VtbWFyeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHVwZGF0ZWQgPSBbc3VtbWFyeSwgLi4udGhpcy5yZWNlbnRHYW1lcy5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS5zZXNzaW9uSWQgIT09IHN1bW1hcnkuc2Vzc2lvbklkKV1cbiAgICAgIC5zbGljZSgwLCBNQVhfUkVDRU5UX0dBTUVTKTtcbiAgICB0aGlzLnJlY2VudEdhbWVzID0gdXBkYXRlZDtcbiAgICB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCA9IHN1bW1hcnkuc2Vzc2lvbklkO1xuICAgIHRoaXMubGFzdENhcHR1cmVkU2Vzc2lvbklkID0gc3VtbWFyeS5zZXNzaW9uSWQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBjbGVhclJlY2VudEdhbWVzKCk6IHZvaWQge1xuICAgIHRoaXMucmVjZW50R2FtZXMgPSBbXTtcbiAgICB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCA9IG51bGw7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBleHBvcnRDdXJyZW50U3VtbWFyeSgpOiB2b2lkIHtcbiAgICBjb25zdCBzdW1tYXJ5ID0gdGhpcy5jdXJyZW50U3VtbWFyeTtcbiAgICBpZiAoIXN1bW1hcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkb3dubG9hZFRleHRGaWxlKGBwZXJzb25hY2hlc3Mtc3VtbWFyeS0ke3N1bW1hcnkuc2Vzc2lvbklkfS5qc29uYCwgc2VyaWFsaXplR2FtZUFuYWx5dGljc1N1bW1hcnkoc3VtbWFyeSksICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gIH1cblxuICBleHBvcnRDdXJyZW50UGduKCk6IHZvaWQge1xuICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLmN1cnJlbnRTdW1tYXJ5O1xuICAgIGlmICghc3VtbWFyeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGRvd25sb2FkVGV4dEZpbGUoYHBlcnNvbmFjaGVzcy1nYW1lLSR7c3VtbWFyeS5zZXNzaW9uSWR9LnBnbmAsIHN1bW1hcnkucGduLCAnYXBwbGljYXRpb24veC1jaGVzcy1wZ24nKTtcbiAgfVxuXG4gIGdldCBjdXJyZW50U3VtbWFyeSgpOiBHYW1lQW5hbHl0aWNzU3VtbWFyeSB8IG51bGwge1xuICAgIGNvbnN0IGFubm90YXRpb25zID0gdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLm1vdmVBbm5vdGF0aW9ucztcbiAgICBpZiAoYW5ub3RhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSh7XG4gICAgICBzZXNzaW9uSWQ6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5kZWJ1Z1Nlc3Npb25JZCxcbiAgICAgIGNyZWF0ZWRBdE1zOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuc2Vzc2lvblN0YXJ0ZWRBdCxcbiAgICAgIGZpbmlzaGVkQXRNczogRGF0ZS5ub3coKSxcbiAgICAgIGdhbWVTdGF0dXM6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5nYW1lU3RhdHVzLFxuICAgICAgcGVyc29uYUlkOiB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmFjdGl2ZVBlcnNvbmFJZCxcbiAgICAgIHBlcnNvbmFMYWJlbDogdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5hY3RpdmVQZXJzb25hTGFiZWwsXG4gICAgICBzZXR1cE5hbWU6IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5jdXJyZW50U2V0dXBOYW1lLFxuICAgICAgc2V0dXBDYXRlZ29yeTogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLmN1cnJlbnRTZXR1cENhdGVnb3J5LFxuICAgICAgYXV0b3BsYXlEdXJhdGlvbk1zOiB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwuYXV0b1BsYXlBY3RpdmVEdXJhdGlvbk1zLFxuICAgICAgbW92ZUFubm90YXRpb25zOiBhbm5vdGF0aW9ucyxcbiAgICAgIHBnbjogdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLnBnbixcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBzZWxlY3RlZFJlY2VudEdhbWUoKTogR2FtZUFuYWx5dGljc1N1bW1hcnkgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5yZWNlbnRHYW1lcy5maW5kKChlbnRyeSkgPT4gZW50cnkuc2Vzc2lvbklkID09PSB0aGlzLnNlbGVjdGVkUmVjZW50R2FtZVNlc3Npb25JZCkgPz8gbnVsbDtcbiAgfVxuXG4gIGdldCByZWNlbnRHYW1lRW50cmllcygpOiBSZWNlbnRHYW1lRW50cnlbXSB7XG4gICAgcmV0dXJuIHRoaXMucmVjZW50R2FtZXMubWFwKChzdW1tYXJ5KSA9PiBidWlsZFJlY2VudEdhbWVFbnRyeShzdW1tYXJ5KSk7XG4gIH1cblxuICBwcml2YXRlIHJlc3RvcmVGcm9tU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5yZWNlbnRHYW1lcyA9IHNhZmVQYXJzZVJlY2VudEdhbWVzKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFJFQ0VOVF9HQU1FU19TVE9SQUdFX0tFWSkpO1xuICAgICAgdGhpcy5zZWxlY3RlZFJlY2VudEdhbWVTZXNzaW9uSWQgPSB0aGlzLnJlY2VudEdhbWVzWzBdPy5zZXNzaW9uSWQgPz8gbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRoaXMucmVjZW50R2FtZXMgPSBbXTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRSZWNlbnRHYW1lU2Vzc2lvbklkID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNuYXBzaG90OiBQZXJzaXN0ZWRBbmFseXRpY3NTbmFwc2hvdCA9IHtcbiAgICAgICAgcmVjZW50R2FtZXM6IHRoaXMucmVjZW50R2FtZXMsXG4gICAgICB9O1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oUkVDRU5UX0dBTUVTX1NUT1JBR0VfS0VZLCBKU09OLnN0cmluZ2lmeShzbmFwc2hvdCkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGxvY2FsU3RvcmFnZSBmYWlsdXJlcyBhbmQga2VlcCBhbmFseXRpY3MgYXZhaWxhYmxlIGZvciB0aGUgY3VycmVudCBzZXNzaW9uLlxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZ2FtZUFuYWx5dGljc1ZpZXdNb2RlbCA9IG5ldyBHYW1lQW5hbHl0aWNzVmlld01vZGVsKCk7XG4iLCAiLyoqXG4gKiBQcmVkZWZpbmVkIGNoZXNzIG9wZW5pbmdzIChQR04gbW92ZSBzZXF1ZW5jZXMpXG4gKiBVc2VkIHRvIGxvYWQgYSBwb3NpdGlvbiBhZnRlciB0aGUgZ2l2ZW4gbW92ZXMgZnJvbSB0aGUgaW5pdGlhbCBwb3NpdGlvbi5cbiAqL1xuXG5leHBvcnQgdHlwZSBPcGVuaW5nU2lkZSA9ICd3aGl0ZScgfCAnYmxhY2snO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wZW5pbmcge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBXaGljaCBzaWRlIHBsYXlzIHRoaXMgb3BlbmluZyAodGhlIG9wZW5pbmcgaXMgbmFtZWQgZnJvbSB0aGlzIHNpZGUncyBwZXJzcGVjdGl2ZSkgKi9cbiAgc2lkZTogT3BlbmluZ1NpZGU7XG4gIC8qKiBTaG9ydCBkZXNjcmlwdGlvbiBvciBFQ08tc3R5bGUgdGFnICovXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICAvKiogUEdOIG1vdmUgc2VxdWVuY2UgZnJvbSB0aGUgc3RhcnRpbmcgcG9zaXRpb24gKGUuZy4gXCIxLiBlNCBlNSAyLiBRaDVcIikgKi9cbiAgcGduOiBzdHJpbmc7XG59XG5cbi8qKiBCdWlsZCBtaW5pbWFsIFBHTiBmb3IgY2hlc3MuanMgKGhlYWRlcnMgKyBibGFuayBsaW5lICsgbW92ZXMgKyByZXN1bHQpICovXG5mdW5jdGlvbiBwZ24obW92ZXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG1vdmVUZXh0ID0gbW92ZXMudHJpbSgpLmVuZHNXaXRoKCcqJykgPyBtb3Zlcy50cmltKCkgOiBgJHttb3Zlcy50cmltKCl9ICpgO1xuICByZXR1cm4gYFtFdmVudCBcIj9cIl1cXG5bU2l0ZSBcIj9cIl1cXG5bRGF0ZSBcIj8/Pz8uPz8uPz9cIl1cXG5bV2hpdGUgXCI/XCJdXFxuW0JsYWNrIFwiP1wiXVxcbltSZXN1bHQgXCIqXCJdXFxuXFxuJHttb3ZlVGV4dH1gO1xufVxuXG5leHBvcnQgY29uc3QgUFJFREVGSU5FRF9PUEVOSU5HUzogT3BlbmluZ1tdID0gW1xuICB7XG4gICAgaWQ6ICduYXBvbGVvbicsXG4gICAgbmFtZTogXCJLaW5nJ3MgUGF3bjogTmFwb2xlb24gQXR0YWNrXCIsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGU1IDIuIFFoNScsXG4gICAgcGduOiBwZ24oJzEuIGU0IGU1IDIuIFFoNScpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdpdGFsaWFuJyxcbiAgICBuYW1lOiBcIkl0YWxpYW4gR2FtZVwiLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJjNCcsXG4gICAgcGduOiBwZ24oJzEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmM0JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ3J1eV9sb3BleicsXG4gICAgbmFtZTogJ1J1eSBMb3BleicsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmI1JyxcbiAgICBwZ246IHBnbignMS4gZTQgZTUgMi4gTmYzIE5jNiAzLiBCYjUnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAnc2ljaWxpYW4nLFxuICAgIG5hbWU6ICdTaWNpbGlhbiBEZWZlbnNlJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgYzUnLFxuICAgIHBnbjogcGduKCcxLiBlNCBjNScpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdmcmVuY2gnLFxuICAgIG5hbWU6ICdGcmVuY2ggRGVmZW5zZScsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGU2JyxcbiAgICBwZ246IHBnbignMS4gZTQgZTYnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAnY2Fyb19rYW5uJyxcbiAgICBuYW1lOiAnQ2Fyby1LYW5uJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgYzYnLFxuICAgIHBnbjogcGduKCcxLiBlNCBjNicpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdxdWVlbnNfZ2FtYml0JyxcbiAgICBuYW1lOiBcIlF1ZWVuJ3MgR2FtYml0XCIsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGQ0IGQ1IDIuIGM0JyxcbiAgICBwZ246IHBnbignMS4gZDQgZDUgMi4gYzQnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAnbG9uZG9uJyxcbiAgICBuYW1lOiAnTG9uZG9uIFN5c3RlbScsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGQ0IGQ1IDIuIEJmNCcsXG4gICAgcGduOiBwZ24oJzEuIGQ0IGQ1IDIuIEJmNCcpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdraW5nc19pbmRpYW4nLFxuICAgIG5hbWU6IFwiS2luZydzIEluZGlhbiBEZWZlbnNlXCIsXG4gICAgc2lkZTogJ2JsYWNrJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGQ0IE5mNiAyLiBjNCBnNicsXG4gICAgcGduOiBwZ24oJzEuIGQ0IE5mNiAyLiBjNCBnNicpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdwaXJjJyxcbiAgICBuYW1lOiAnUGlyYyBEZWZlbnNlJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgZDYgMi4gZDQgTmY2JyxcbiAgICBwZ246IHBnbignMS4gZTQgZDYgMi4gZDQgTmY2JyksXG4gIH0sXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3BlbmluZ0J5SWQoaWQ6IHN0cmluZyk6IE9wZW5pbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gUFJFREVGSU5FRF9PUEVOSU5HUy5maW5kKG8gPT4gby5pZCA9PT0gaWQpO1xufVxuIiwgImltcG9ydCB7IGdldE9wZW5pbmdCeUlkLCBPcGVuaW5nU2lkZSwgUFJFREVGSU5FRF9PUEVOSU5HUyB9IGZyb20gJy4vb3BlbmluZ3MnO1xuXG5leHBvcnQgdHlwZSBHYW1lU2V0dXBDYXRlZ29yeSA9ICdvcGVuaW5ncycgfCAndGFjdGljYWwnIHwgJ2VuZGdhbWVzJyB8ICdjdXN0b20tZmVuJyB8ICdjdXN0b20tcGduJztcbmV4cG9ydCB0eXBlIEdhbWVTZXR1cERpZmZpY3VsdHkgPSAnZWFzeScgfCAnbWVkaXVtJyB8ICdoYXJkJztcbmV4cG9ydCB0eXBlIEdhbWVTZXR1cFNvdXJjZVR5cGUgPSAnZmVuJyB8ICdwZ24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdhbWVTZXR1cFByZXNldCB7XG4gIGlkOiBzdHJpbmc7XG4gIGNhdGVnb3J5OiBFeGNsdWRlPEdhbWVTZXR1cENhdGVnb3J5LCAnY3VzdG9tLWZlbicgfCAnY3VzdG9tLXBnbic+O1xuICBuYW1lOiBzdHJpbmc7XG4gIHNpZGU6IE9wZW5pbmdTaWRlO1xuICBkaWZmaWN1bHR5OiBHYW1lU2V0dXBEaWZmaWN1bHR5O1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICB0YWdzOiBzdHJpbmdbXTtcbiAgc291cmNlVHlwZTogR2FtZVNldHVwU291cmNlVHlwZTtcbiAgc291cmNlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBHQU1FX1NFVFVQX0NBVEVHT1JZX09QVElPTlM6IEFycmF5PHsgdmFsdWU6IEdhbWVTZXR1cENhdGVnb3J5OyBsYWJlbDogc3RyaW5nIH0+ID0gW1xuICB7IHZhbHVlOiAnb3BlbmluZ3MnLCBsYWJlbDogJ09wZW5pbmdzJyB9LFxuICB7IHZhbHVlOiAndGFjdGljYWwnLCBsYWJlbDogJ1RhY3RpY2FsIHBvc2l0aW9ucycgfSxcbiAgeyB2YWx1ZTogJ2VuZGdhbWVzJywgbGFiZWw6ICdFbmRnYW1lcycgfSxcbiAgeyB2YWx1ZTogJ2N1c3RvbS1mZW4nLCBsYWJlbDogJ0N1c3RvbSBGRU4nIH0sXG4gIHsgdmFsdWU6ICdjdXN0b20tcGduJywgbGFiZWw6ICdDdXN0b20gUEdOJyB9LFxuXTtcblxuZnVuY3Rpb24gb3BlbmluZ0RpZmZpY3VsdHlUYWcobmFtZTogc3RyaW5nKTogR2FtZVNldHVwRGlmZmljdWx0eSB7XG4gIGlmICgvbmFwb2xlb24vaS50ZXN0KG5hbWUpKSB7XG4gICAgcmV0dXJuICdlYXN5JztcbiAgfVxuXG4gIGlmICgvaXRhbGlhbnxsb25kb258cXVlZW4vaS50ZXN0KG5hbWUpKSB7XG4gICAgcmV0dXJuICdtZWRpdW0nO1xuICB9XG5cbiAgcmV0dXJuICdoYXJkJztcbn1cblxuY29uc3QgT1BFTklOR19QUkVTRVRTOiBHYW1lU2V0dXBQcmVzZXRbXSA9IFBSRURFRklORURfT1BFTklOR1MubWFwKChvcGVuaW5nKSA9PiAoe1xuICBpZDogb3BlbmluZy5pZCxcbiAgY2F0ZWdvcnk6ICdvcGVuaW5ncycsXG4gIG5hbWU6IG9wZW5pbmcubmFtZSxcbiAgc2lkZTogb3BlbmluZy5zaWRlLFxuICBkaWZmaWN1bHR5OiBvcGVuaW5nRGlmZmljdWx0eVRhZyhvcGVuaW5nLm5hbWUpLFxuICBkZXNjcmlwdGlvbjogb3BlbmluZy5kZXNjcmlwdGlvbiA/PyBgJHtvcGVuaW5nLm5hbWV9IHNldHVwYCxcbiAgdGFnczogWydvcGVuaW5nJywgb3BlbmluZy5zaWRlLCBvcGVuaW5nLm5hbWUudG9Mb3dlckNhc2UoKV0sXG4gIHNvdXJjZVR5cGU6ICdwZ24nLFxuICBzb3VyY2U6IG9wZW5pbmcucGduLFxufSkpO1xuXG5jb25zdCBUQUNUSUNBTF9QUkVTRVRTOiBHYW1lU2V0dXBQcmVzZXRbXSA9IFtcbiAge1xuICAgIGlkOiAndGFjdGljLWJhY2stcmFuay1uZXQnLFxuICAgIGNhdGVnb3J5OiAndGFjdGljYWwnLFxuICAgIG5hbWU6ICdCYWNrIFJhbmsgTmV0JyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRpZmZpY3VsdHk6ICdtZWRpdW0nLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hpdGUgdG8gbW92ZSB3aXRoIGEgZGlyZWN0IGF0dGFja2luZyBpZGVhIGFnYWluc3QgYW4gZXhwb3NlZCBiYWNrIHJhbmsuJyxcbiAgICB0YWdzOiBbJ3RhY3RpY2FsJywgJ21hdGUtdGhyZWF0JywgJ2F0dGFjaycsICd3aGl0ZS10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAnNmsxLzVwcHAvM1E0LzgvOC84LzVQUFAvNksxIHcgLSAtIDAgMScsXG4gIH0sXG4gIHtcbiAgICBpZDogJ3RhY3RpYy1rbmlnaHQtZm9yaycsXG4gICAgY2F0ZWdvcnk6ICd0YWN0aWNhbCcsXG4gICAgbmFtZTogJ0tuaWdodCBGb3JrIE9wcG9ydHVuaXR5JyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRpZmZpY3VsdHk6ICdlYXN5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0EgdHJhaW5pbmcgcG9zaXRpb24gYnVpbHQgYXJvdW5kIHNwb3R0aW5nIGEgc2ltcGxlIGZvcmsgbW90aWYuJyxcbiAgICB0YWdzOiBbJ3RhY3RpY2FsJywgJ2ZvcmsnLCAnd2hpdGUtdG8tbW92ZSddLFxuICAgIHNvdXJjZVR5cGU6ICdmZW4nLFxuICAgIHNvdXJjZTogJ3IzazJyL3BwcHExcHBwLzJucGJuMi8zTnAzLzJCMVAzLzJONS9QUFAyUFBQL1IxQlExUksxIHcga3EgLSAwIDEnLFxuICB9LFxuICB7XG4gICAgaWQ6ICd0YWN0aWMtZGVmbGVjdGlvbicsXG4gICAgY2F0ZWdvcnk6ICd0YWN0aWNhbCcsXG4gICAgbmFtZTogJ0RlZmxlY3Rpb24gU3RyaWtlJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRpZmZpY3VsdHk6ICdoYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0JsYWNrIHRvIG1vdmUgaW4gYSBzaGFycCBtaWRkbGVnYW1lIHdoZXJlIGNhbGN1bGF0aW9uIG1hdHRlcnMgbW9yZSB0aGFuIG1lbW9yaXphdGlvbi4nLFxuICAgIHRhZ3M6IFsndGFjdGljYWwnLCAnZGVmbGVjdGlvbicsICdjYWxjdWxhdGlvbicsICdibGFjay10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAncjJxMXJrMS9wcDFiMXBwcC8ybjFwbjIvMmJwNC8yUDUvMk5QMU5QMS9QUDJQUEJQL1IxQlExUksxIGIgLSAtIDQgOScsXG4gIH0sXG5dO1xuXG5jb25zdCBFTkRHQU1FX1BSRVNFVFM6IEdhbWVTZXR1cFByZXNldFtdID0gW1xuICB7XG4gICAgaWQ6ICdlbmRnYW1lLWx1Y2VuYS1icmlkZ2UnLFxuICAgIGNhdGVnb3J5OiAnZW5kZ2FtZXMnLFxuICAgIG5hbWU6ICdMdWNlbmEgQnJpZGdlIFNldHVwJyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRpZmZpY3VsdHk6ICdoYXJkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0NsYXNzaWMgcm9vayBlbmRnYW1lIGNvbnZlcnNpb24gcHJhY3RpY2Ugd2l0aCBXaGl0ZSBwcmVzc2luZyBmb3IgdGhlIHdpbi4nLFxuICAgIHRhZ3M6IFsnZW5kZ2FtZScsICdyb29rJywgJ2x1Y2VuYScsICd3aGl0ZS10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAnOC8yazUvMlA1LzJLUjQvOC84LzgvOCB3IC0gLSAwIDEnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdlbmRnYW1lLW9wcG9zaXRpb24nLFxuICAgIGNhdGVnb3J5OiAnZW5kZ2FtZXMnLFxuICAgIG5hbWU6ICdLaW5nIE9wcG9zaXRpb24nLFxuICAgIHNpZGU6ICd3aGl0ZScsXG4gICAgZGlmZmljdWx0eTogJ2Vhc3knLFxuICAgIGRlc2NyaXB0aW9uOiAnQSBwdXJlIGtpbmctYW5kLXBhd24gZW5kaW5nIGZvY3VzZWQgb24gZ2FpbmluZyBvcHBvc2l0aW9uIGNsZWFubHkuJyxcbiAgICB0YWdzOiBbJ2VuZGdhbWUnLCAna2luZy1hbmQtcGF3bicsICdvcHBvc2l0aW9uJywgJ3doaXRlLXRvLW1vdmUnXSxcbiAgICBzb3VyY2VUeXBlOiAnZmVuJyxcbiAgICBzb3VyY2U6ICc4LzgvOC8zazQvM1A0LzRLMy84LzggdyAtIC0gMCAxJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnZW5kZ2FtZS1xdWVlbi12cy1wYXduJyxcbiAgICBjYXRlZ29yeTogJ2VuZGdhbWVzJyxcbiAgICBuYW1lOiAnUXVlZW4gdnMgUGFzc2VkIFBhd24nLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGlmZmljdWx0eTogJ21lZGl1bScsXG4gICAgZGVzY3JpcHRpb246ICdCbGFjayBkZWZlbmRzIGFnYWluc3QgcHJvbW90aW9uIHRocmVhdHMgaW4gYSBwcmVjaXNlIHF1ZWVuIGVuZGluZy4nLFxuICAgIHRhZ3M6IFsnZW5kZ2FtZScsICdxdWVlbicsICdwYXNzZWQtcGF3bicsICdibGFjay10by1tb3ZlJ10sXG4gICAgc291cmNlVHlwZTogJ2ZlbicsXG4gICAgc291cmNlOiAnNmsxLzVwcDEvOC84LzgvNlExLzVQMi82SzEgYiAtIC0gMCAxJyxcbiAgfSxcbl07XG5cbmV4cG9ydCBjb25zdCBHQU1FX1NFVFVQX1BSRVNFVFM6IEdhbWVTZXR1cFByZXNldFtdID0gW1xuICAuLi5PUEVOSU5HX1BSRVNFVFMsXG4gIC4uLlRBQ1RJQ0FMX1BSRVNFVFMsXG4gIC4uLkVOREdBTUVfUFJFU0VUUyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRHYW1lU2V0dXBQcmVzZXRCeUlkKGlkOiBzdHJpbmcpOiBHYW1lU2V0dXBQcmVzZXQgfCB1bmRlZmluZWQge1xuICByZXR1cm4gR0FNRV9TRVRVUF9QUkVTRVRTLmZpbmQoKHByZXNldCkgPT4gcHJlc2V0LmlkID09PSBpZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcGVuaW5nUHJlc2V0QnlJZChpZDogc3RyaW5nKTogR2FtZVNldHVwUHJlc2V0IHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIE9QRU5JTkdfUFJFU0VUUy5maW5kKChwcmVzZXQpID0+IHByZXNldC5pZCA9PT0gaWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyR2FtZVNldHVwUHJlc2V0cyhcbiAgcHJlc2V0czogR2FtZVNldHVwUHJlc2V0W10sXG4gIGNhdGVnb3J5OiBHYW1lU2V0dXBDYXRlZ29yeSxcbiAgcXVlcnk6IHN0cmluZyxcbik6IEdhbWVTZXR1cFByZXNldFtdIHtcbiAgaWYgKGNhdGVnb3J5ID09PSAnY3VzdG9tLWZlbicgfHwgY2F0ZWdvcnkgPT09ICdjdXN0b20tcGduJykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0IG5vcm1hbGl6ZWRRdWVyeSA9IHF1ZXJ5LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG4gIHJldHVybiBwcmVzZXRzLmZpbHRlcigocHJlc2V0KSA9PiB7XG4gICAgaWYgKHByZXNldC5jYXRlZ29yeSAhPT0gY2F0ZWdvcnkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW5vcm1hbGl6ZWRRdWVyeSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgaGF5c3RhY2sgPSBbXG4gICAgICBwcmVzZXQubmFtZSxcbiAgICAgIHByZXNldC5kZXNjcmlwdGlvbixcbiAgICAgIHByZXNldC5zaWRlLFxuICAgICAgcHJlc2V0LmRpZmZpY3VsdHksXG4gICAgICAuLi5wcmVzZXQudGFncyxcbiAgICBdLmpvaW4oJyAnKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgcmV0dXJuIGhheXN0YWNrLmluY2x1ZGVzKG5vcm1hbGl6ZWRRdWVyeSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzY3JpYmVHYW1lU2V0dXBQcmVzZXQocHJlc2V0OiBHYW1lU2V0dXBQcmVzZXQpOiBzdHJpbmcge1xuICBjb25zdCBzaWRlTGFiZWwgPSBwcmVzZXQuc2lkZSA9PT0gJ3doaXRlJyA/ICdXaGl0ZScgOiAnQmxhY2snO1xuICByZXR1cm4gYCR7cHJlc2V0Lm5hbWV9IFx1MjAyMiAke3NpZGVMYWJlbH0gXHUyMDIyICR7cHJlc2V0LmRpZmZpY3VsdHl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvQ29tcGF0aWJsZU9wZW5pbmdQcmVzZXQoaWQ6IHN0cmluZyk6IEdhbWVTZXR1cFByZXNldCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IG9wZW5pbmcgPSBnZXRPcGVuaW5nQnlJZChpZCk7XG4gIGlmICghb3BlbmluZykge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gT1BFTklOR19QUkVTRVRTLmZpbmQoKHByZXNldCkgPT4gcHJlc2V0LmlkID09PSBvcGVuaW5nLmlkKTtcbn1cbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgZmlsdGVyR2FtZVNldHVwUHJlc2V0cyxcbiAgR0FNRV9TRVRVUF9QUkVTRVRTLFxuICBHYW1lU2V0dXBDYXRlZ29yeSxcbiAgR0FNRV9TRVRVUF9DQVRFR09SWV9PUFRJT05TLFxuICBHYW1lU2V0dXBQcmVzZXQsXG4gIGdldEdhbWVTZXR1cFByZXNldEJ5SWQsXG59IGZyb20gJy4uL2VuZ2luZS9nYW1lU2V0dXBQcmVzZXRzJztcbmltcG9ydCB7IGJvYXJkVmlld01vZGVsLCBCb2FyZFZpZXdNb2RlbCB9IGZyb20gJy4vQm9hcmRWaWV3TW9kZWwnO1xuXG5pbnRlcmZhY2UgR2FtZVNldHVwVmlld01vZGVsRGVwZW5kZW5jaWVzIHtcbiAgYm9hcmRWaWV3TW9kZWw6IFBpY2s8Qm9hcmRWaWV3TW9kZWwsICdsb2FkRmVuJyB8ICdsb2FkUGduJyB8ICdsb2FkR2FtZVNldHVwUHJlc2V0JyB8ICdzdGF0dXNNZXNzYWdlJz47XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lU2V0dXBWaWV3TW9kZWwge1xuICBvcGVuID0gZmFsc2U7XG4gIHNlbGVjdGVkQ2F0ZWdvcnk6IEdhbWVTZXR1cENhdGVnb3J5ID0gJ29wZW5pbmdzJztcbiAgc2VhcmNoUXVlcnkgPSAnJztcbiAgc2VsZWN0ZWRQcmVzZXRJZDogc3RyaW5nIHwgbnVsbCA9IEdBTUVfU0VUVVBfUFJFU0VUU1swXT8uaWQgPz8gbnVsbDtcbiAgY3VzdG9tRmVuSW5wdXQgPSAnJztcbiAgY3VzdG9tUGduSW5wdXQgPSAnJztcblxuICBwcml2YXRlIHJlYWRvbmx5IGRlcHM6IEdhbWVTZXR1cFZpZXdNb2RlbERlcGVuZGVuY2llcztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZXBzOiBHYW1lU2V0dXBWaWV3TW9kZWxEZXBlbmRlbmNpZXMgPSB7XG4gICAgICBib2FyZFZpZXdNb2RlbCxcbiAgICB9LFxuICApIHtcbiAgICB0aGlzLmRlcHMgPSBkZXBzO1xuXG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldE9wZW46IGFjdGlvbixcbiAgICAgIG9wZW5BdENhdGVnb3J5OiBhY3Rpb24sXG4gICAgICBzZXRTZWxlY3RlZENhdGVnb3J5OiBhY3Rpb24sXG4gICAgICBzZXRTZWFyY2hRdWVyeTogYWN0aW9uLFxuICAgICAgc2V0U2VsZWN0ZWRQcmVzZXRJZDogYWN0aW9uLFxuICAgICAgc2V0Q3VzdG9tRmVuSW5wdXQ6IGFjdGlvbixcbiAgICAgIHNldEN1c3RvbVBnbklucHV0OiBhY3Rpb24sXG4gICAgICBsb2FkU2VsZWN0ZWRQcmVzZXQ6IGFjdGlvbixcbiAgICAgIGxvYWRDdXN0b21GZW46IGFjdGlvbixcbiAgICAgIGxvYWRDdXN0b21QZ246IGFjdGlvbixcbiAgICAgIHN5bmNTZWxlY3Rpb25Gcm9tQ2F0ZWdvcnk6IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMuc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeSgpO1xuICB9XG5cbiAgc2V0T3BlbihvcGVuOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5vcGVuID0gb3BlbjtcbiAgfVxuXG4gIG9wZW5BdENhdGVnb3J5KGNhdGVnb3J5OiBHYW1lU2V0dXBDYXRlZ29yeSk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRDYXRlZ29yeSA9IGNhdGVnb3J5O1xuICAgIHRoaXMuc2VhcmNoUXVlcnkgPSAnJztcbiAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgIHRoaXMuc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeSgpO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRDYXRlZ29yeShjYXRlZ29yeTogR2FtZVNldHVwQ2F0ZWdvcnkpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkQ2F0ZWdvcnkgPSBjYXRlZ29yeTtcbiAgICB0aGlzLnNlYXJjaFF1ZXJ5ID0gJyc7XG4gICAgdGhpcy5zeW5jU2VsZWN0aW9uRnJvbUNhdGVnb3J5KCk7XG4gIH1cblxuICBzZXRTZWFyY2hRdWVyeSh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zZWFyY2hRdWVyeSA9IHZhbHVlO1xuICAgIHRoaXMuc3luY1NlbGVjdGlvbkZyb21DYXRlZ29yeSgpO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRQcmVzZXRJZChpZDogc3RyaW5nIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCA9IGlkO1xuICB9XG5cbiAgc2V0Q3VzdG9tRmVuSW5wdXQodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY3VzdG9tRmVuSW5wdXQgPSB2YWx1ZTtcbiAgfVxuXG4gIHNldEN1c3RvbVBnbklucHV0KHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmN1c3RvbVBnbklucHV0ID0gdmFsdWU7XG4gIH1cblxuICBsb2FkU2VsZWN0ZWRQcmVzZXQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJlc2V0ID0gdGhpcy5zZWxlY3RlZFByZXNldDtcbiAgICBpZiAoIXByZXNldCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGxvYWRlZCA9IHRoaXMuZGVwcy5ib2FyZFZpZXdNb2RlbC5sb2FkR2FtZVNldHVwUHJlc2V0KHByZXNldCk7XG4gICAgaWYgKGxvYWRlZCkge1xuICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBsb2FkZWQ7XG4gIH1cblxuICBsb2FkQ3VzdG9tRmVuKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5jdXN0b21GZW5JbnB1dC50cmltKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2FkZWQgPSB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwubG9hZEZlbih0aGlzLmN1c3RvbUZlbklucHV0LnRyaW0oKSk7XG4gICAgaWYgKGxvYWRlZCkge1xuICAgICAgdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLnN0YXR1c01lc3NhZ2UgPSAnQ3VzdG9tIEZFTiBsb2FkZWQnO1xuICAgICAgdGhpcy5jdXN0b21GZW5JbnB1dCA9ICcnO1xuICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBsb2FkZWQ7XG4gIH1cblxuICBsb2FkQ3VzdG9tUGduKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5jdXN0b21QZ25JbnB1dC50cmltKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2FkZWQgPSB0aGlzLmRlcHMuYm9hcmRWaWV3TW9kZWwubG9hZFBnbih0aGlzLmN1c3RvbVBnbklucHV0LnRyaW0oKSk7XG4gICAgaWYgKGxvYWRlZCkge1xuICAgICAgdGhpcy5kZXBzLmJvYXJkVmlld01vZGVsLnN0YXR1c01lc3NhZ2UgPSAnQ3VzdG9tIFBHTiBsb2FkZWQnO1xuICAgICAgdGhpcy5jdXN0b21QZ25JbnB1dCA9ICcnO1xuICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBsb2FkZWQ7XG4gIH1cblxuICBzeW5jU2VsZWN0aW9uRnJvbUNhdGVnb3J5KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNlbGVjdGVkQ2F0ZWdvcnkgPT09ICdjdXN0b20tZmVuJyB8fCB0aGlzLnNlbGVjdGVkQ2F0ZWdvcnkgPT09ICdjdXN0b20tcGduJykge1xuICAgICAgdGhpcy5zZWxlY3RlZFByZXNldElkID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB2aXNpYmxlUHJlc2V0SWRzID0gdGhpcy5maWx0ZXJlZFByZXNldHMubWFwKChwcmVzZXQpID0+IHByZXNldC5pZCk7XG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCAmJiB2aXNpYmxlUHJlc2V0SWRzLmluY2x1ZGVzKHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdGVkUHJlc2V0SWQgPSB2aXNpYmxlUHJlc2V0SWRzWzBdID8/IG51bGw7XG4gIH1cblxuICBnZXQgY2F0ZWdvcmllcygpIHtcbiAgICByZXR1cm4gR0FNRV9TRVRVUF9DQVRFR09SWV9PUFRJT05TO1xuICB9XG5cbiAgZ2V0IGZpbHRlcmVkUHJlc2V0cygpOiBHYW1lU2V0dXBQcmVzZXRbXSB7XG4gICAgcmV0dXJuIGZpbHRlckdhbWVTZXR1cFByZXNldHMoR0FNRV9TRVRVUF9QUkVTRVRTLCB0aGlzLnNlbGVjdGVkQ2F0ZWdvcnksIHRoaXMuc2VhcmNoUXVlcnkpO1xuICB9XG5cbiAgZ2V0IHNlbGVjdGVkUHJlc2V0KCk6IEdhbWVTZXR1cFByZXNldCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGVkUHJlc2V0SWQgPyBnZXRHYW1lU2V0dXBQcmVzZXRCeUlkKHRoaXMuc2VsZWN0ZWRQcmVzZXRJZCkgPz8gbnVsbCA6IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGdhbWVTZXR1cFZpZXdNb2RlbCA9IG5ldyBHYW1lU2V0dXBWaWV3TW9kZWwoKTtcbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgaXNEZWJ1Z0xvZ2dpbmdFbmFibGVkLFxuICBpc0RldmVsb3BtZW50QnVpbGQsXG4gIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQsXG59IGZyb20gJy4uL3NoYXJlZC9kZWJ1Zyc7XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z1ZpZXdNb2RlbCB7XG4gIGRlYnVnTG9nZ2luZ0VuYWJsZWQgPSBpc0RlYnVnTG9nZ2luZ0VuYWJsZWQoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0RGVidWdMb2dnaW5nRW5hYmxlZDogYWN0aW9uLFxuICAgICAgdG9nZ2xlRGVidWdMb2dnaW5nOiBhY3Rpb24sXG4gICAgfSk7XG4gIH1cblxuICBzZXREZWJ1Z0xvZ2dpbmdFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRlYnVnTG9nZ2luZ0VuYWJsZWQgPSBlbmFibGVkO1xuICAgIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQoZW5hYmxlZCk7XG4gIH1cblxuICB0b2dnbGVEZWJ1Z0xvZ2dpbmcoKTogdm9pZCB7XG4gICAgdGhpcy5zZXREZWJ1Z0xvZ2dpbmdFbmFibGVkKCF0aGlzLmRlYnVnTG9nZ2luZ0VuYWJsZWQpO1xuICB9XG5cbiAgZ2V0IGlzRGV2ZWxvcG1lbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRGV2ZWxvcG1lbnRCdWlsZCgpO1xuICB9XG5cbiAgZ2V0IHNob3dEZWJ1Z0NvbnRyb2xzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzRGV2ZWxvcG1lbnQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGRlYnVnVmlld01vZGVsID0gbmV3IERlYnVnVmlld01vZGVsKCk7XG5cbiIsICJpbXBvcnQge1xuICBCcmlsbGlhbnRBbGxvd2VkUGhhc2UsXG4gIEJyaWxsaWFudE1vdmVzUGVyR2FtZSxcbiAgRmVhdHVyZU9wdGlvbnMsXG4gIG1lcmdlRmVhdHVyZU9wdGlvbnMsXG59IGZyb20gJy4vZmVhdHVyZU9wdGlvbnMnO1xuaW1wb3J0IHtcbiAgQnVja2V0Q29uZmlnLFxuICBERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gIE1vdmVRdWFsaXR5UHJlc2V0SWQsXG4gIE1PVkVfUVVBTElUWV9QUkVTRVRTLFxufSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IHR5cGUgUGVyc29uYVByb2ZpbGVUaGVtZU1vZGUgPSAnZGFyaycgfCAnbGlnaHQnIHwgJ21pbmltYWwnIHwgJ3BlcnNvbmEnO1xuXG5leHBvcnQgY29uc3QgUEVSU09OQV9QUk9GSUxFX0tJTkQgPSAncGVyc29uYWNoZXNzLnBlcnNvbmEtcHJvZmlsZSc7XG5leHBvcnQgY29uc3QgUEVSU09OQV9QUk9GSUxFX1ZFUlNJT04gPSAxO1xuXG5leHBvcnQgaW50ZXJmYWNlIFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCB7XG4gIGJ1Y2tldENvbmZpZzogQnVja2V0Q29uZmlnO1xuICBjdXJyZW50UHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsO1xuICBkZXB0aDogbnVtYmVyO1xuICBtdWx0aVBWOiBudW1iZXI7XG4gIGZlYXR1cmVPcHRpb25zOiBGZWF0dXJlT3B0aW9ucztcbiAgYnJpbGxpYW50OiB7XG4gICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWU7XG4gICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiBCcmlsbGlhbnRBbGxvd2VkUGhhc2U7XG4gIH07XG4gIHVpOiB7XG4gICAgdGhlbWVNb2RlOiBQZXJzb25hUHJvZmlsZVRoZW1lTW9kZTtcbiAgICBiYXNpY01vZGU6IGJvb2xlYW47XG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc29uYVByb2ZpbGVFeHBvcnQge1xuICBraW5kOiB0eXBlb2YgUEVSU09OQV9QUk9GSUxFX0tJTkQ7XG4gIHZlcnNpb246IHR5cGVvZiBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTjtcbiAgbmFtZTogc3RyaW5nO1xuICBzZXR0aW5nczogUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNhdmVkUGVyc29uYVByb2ZpbGUgZXh0ZW5kcyBQZXJzb25hUHJvZmlsZUV4cG9ydCB7XG4gIGlkOiBzdHJpbmc7XG4gIGNyZWF0ZWRBdDogc3RyaW5nO1xuICB1cGRhdGVkQXQ6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQZXJzb25hUHJvZmlsZVN0b3JlU25hcHNob3Qge1xuICBwcm9maWxlczogU2F2ZWRQZXJzb25hUHJvZmlsZVtdO1xuICBzZWxlY3RlZFByb2ZpbGVJZDogc3RyaW5nIHwgbnVsbDtcbn1cblxuY29uc3QgVkFMSURfUFJFU0VUX0lEUyA9IG5ldyBTZXQ8TW92ZVF1YWxpdHlQcmVzZXRJZD4oTU9WRV9RVUFMSVRZX1BSRVNFVFMubWFwKChwcmVzZXQpID0+IHByZXNldC5pZCkpO1xuY29uc3QgVkFMSURfVEhFTUVfTU9ERVMgPSBuZXcgU2V0PFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlPihbJ2RhcmsnLCAnbGlnaHQnLCAnbWluaW1hbCcsICdwZXJzb25hJ10pO1xuY29uc3QgVkFMSURfQlJJTExJQU5UX1BIQVNFUyA9IG5ldyBTZXQ8QnJpbGxpYW50QWxsb3dlZFBoYXNlPihbJ29wZW5pbmcnLCAnbWlkZGxlZ2FtZScsICdlbmRnYW1lJywgJ2FueSddKTtcbmNvbnN0IFZBTElEX0JSSUxMSUFOVF9CVURHRVRTID0gbmV3IFNldDxCcmlsbGlhbnRNb3Zlc1BlckdhbWU+KFswLCAxLCAyLCAzLCA0XSk7XG5cbmZ1bmN0aW9uIGlzUmVjb3JkKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gY2xhbXBJbnRlZ2VyKHZhbHVlOiB1bmtub3duLCBtaW5pbXVtOiBudW1iZXIsIG1heGltdW06IG51bWJlciwgZmFsbGJhY2s6IG51bWJlcik6IG51bWJlciB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbGxiYWNrO1xuICB9XG5cbiAgcmV0dXJuIE1hdGgubWF4KG1pbmltdW0sIE1hdGgubWluKG1heGltdW0sIE1hdGgucm91bmQodmFsdWUpKSk7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplQnVja2V0Q29uZmlnKHZhbHVlOiB1bmtub3duKTogQnVja2V0Q29uZmlnIHtcbiAgaWYgKCFpc1JlY29yZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYmVzdDogY2xhbXBJbnRlZ2VyKHZhbHVlLmJlc3QsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmJlc3QpLFxuICAgIGdyZWF0OiBjbGFtcEludGVnZXIodmFsdWUuZ3JlYXQsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmdyZWF0KSxcbiAgICBleGNlbGxlbnQ6IGNsYW1wSW50ZWdlcih2YWx1ZS5leGNlbGxlbnQsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmV4Y2VsbGVudCksXG4gICAgZ29vZDogY2xhbXBJbnRlZ2VyKHZhbHVlLmdvb2QsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmdvb2QpLFxuICAgIGluYWNjdXJhY3k6IGNsYW1wSW50ZWdlcih2YWx1ZS5pbmFjY3VyYWN5LCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5pbmFjY3VyYWN5KSxcbiAgICBtaXN0YWtlOiBjbGFtcEludGVnZXIodmFsdWUubWlzdGFrZSwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcubWlzdGFrZSksXG4gICAgYmx1bmRlcjogY2xhbXBJbnRlZ2VyKHZhbHVlLmJsdW5kZXIsIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmJsdW5kZXIpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZVByZXNldElkKHZhbHVlOiB1bmtub3duKTogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGwge1xuICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIFZBTElEX1BSRVNFVF9JRFMuaGFzKHZhbHVlIGFzIE1vdmVRdWFsaXR5UHJlc2V0SWQpXG4gICAgPyAodmFsdWUgYXMgTW92ZVF1YWxpdHlQcmVzZXRJZClcbiAgICA6ICdtZWRpdW0nO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZVRoZW1lTW9kZSh2YWx1ZTogdW5rbm93bik6IFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgVkFMSURfVEhFTUVfTU9ERVMuaGFzKHZhbHVlIGFzIFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlKVxuICAgID8gKHZhbHVlIGFzIFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlKVxuICAgIDogJ2RhcmsnO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZUJyaWxsaWFudE1vdmVzUGVyR2FtZSh2YWx1ZTogdW5rbm93bik6IEJyaWxsaWFudE1vdmVzUGVyR2FtZSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIFZBTElEX0JSSUxMSUFOVF9CVURHRVRTLmhhcyh2YWx1ZSBhcyBCcmlsbGlhbnRNb3Zlc1BlckdhbWUpXG4gICAgPyAodmFsdWUgYXMgQnJpbGxpYW50TW92ZXNQZXJHYW1lKVxuICAgIDogMDtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVCcmlsbGlhbnRBbGxvd2VkUGhhc2UodmFsdWU6IHVua25vd24pOiBCcmlsbGlhbnRBbGxvd2VkUGhhc2Uge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBWQUxJRF9CUklMTElBTlRfUEhBU0VTLmhhcyh2YWx1ZSBhcyBCcmlsbGlhbnRBbGxvd2VkUGhhc2UpXG4gICAgPyAodmFsdWUgYXMgQnJpbGxpYW50QWxsb3dlZFBoYXNlKVxuICAgIDogJ2FueSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCh2YWx1ZTogdW5rbm93bik6IFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCB7XG4gIGNvbnN0IHJlY29yZCA9IGlzUmVjb3JkKHZhbHVlKSA/IHZhbHVlIDoge307XG4gIGNvbnN0IGJyaWxsaWFudCA9IGlzUmVjb3JkKHJlY29yZC5icmlsbGlhbnQpID8gcmVjb3JkLmJyaWxsaWFudCA6IHt9O1xuICBjb25zdCB1aSA9IGlzUmVjb3JkKHJlY29yZC51aSkgPyByZWNvcmQudWkgOiB7fTtcblxuICByZXR1cm4ge1xuICAgIGJ1Y2tldENvbmZpZzogc2FuaXRpemVCdWNrZXRDb25maWcocmVjb3JkLmJ1Y2tldENvbmZpZyksXG4gICAgY3VycmVudFByZXNldElkOiBzYW5pdGl6ZVByZXNldElkKHJlY29yZC5jdXJyZW50UHJlc2V0SWQpLFxuICAgIGRlcHRoOiBjbGFtcEludGVnZXIocmVjb3JkLmRlcHRoLCAxLCAzMCwgOCksXG4gICAgbXVsdGlQVjogY2xhbXBJbnRlZ2VyKHJlY29yZC5tdWx0aVBWLCAxLCAyMCwgMTIpLFxuICAgIGZlYXR1cmVPcHRpb25zOiBtZXJnZUZlYXR1cmVPcHRpb25zKGlzUmVjb3JkKHJlY29yZC5mZWF0dXJlT3B0aW9ucykgPyAocmVjb3JkLmZlYXR1cmVPcHRpb25zIGFzIFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+KSA6IHVuZGVmaW5lZCksXG4gICAgYnJpbGxpYW50OiB7XG4gICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IHNhbml0aXplQnJpbGxpYW50TW92ZXNQZXJHYW1lKGJyaWxsaWFudC5icmlsbGlhbnRNb3Zlc1BlckdhbWUpLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiBzYW5pdGl6ZUJyaWxsaWFudEFsbG93ZWRQaGFzZShicmlsbGlhbnQuYnJpbGxpYW50QWxsb3dlZFBoYXNlKSxcbiAgICB9LFxuICAgIHVpOiB7XG4gICAgICB0aGVtZU1vZGU6IHNhbml0aXplVGhlbWVNb2RlKHVpLnRoZW1lTW9kZSksXG4gICAgICBiYXNpY01vZGU6IHR5cGVvZiB1aS5iYXNpY01vZGUgPT09ICdib29sZWFuJyA/IHVpLmJhc2ljTW9kZSA6IHRydWUsXG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplUGVyc29uYVByb2ZpbGVFeHBvcnQoXG4gIHZhbHVlOiB1bmtub3duLFxuICBmYWxsYmFja05hbWUgPSAnSW1wb3J0ZWQgUHJvZmlsZScsXG4pOiBQZXJzb25hUHJvZmlsZUV4cG9ydCB8IG51bGwge1xuICBpZiAoIWlzUmVjb3JkKHZhbHVlKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKHZhbHVlLmtpbmQgIT09IFBFUlNPTkFfUFJPRklMRV9LSU5EIHx8IHZhbHVlLnZlcnNpb24gIT09IFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBuYW1lID0gdHlwZW9mIHZhbHVlLm5hbWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLm5hbWUudHJpbSgpID8gdmFsdWUubmFtZS50cmltKCkgOiBmYWxsYmFja05hbWU7XG5cbiAgcmV0dXJuIHtcbiAgICBraW5kOiBQRVJTT05BX1BST0ZJTEVfS0lORCxcbiAgICB2ZXJzaW9uOiBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTixcbiAgICBuYW1lLFxuICAgIHNldHRpbmdzOiBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCh2YWx1ZS5zZXR0aW5ncyksXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBlcnNvbmFQcm9maWxlSW1wb3J0KFxuICBqc29uOiBzdHJpbmcsXG4pOiB7IG9rOiB0cnVlOyBwcm9maWxlOiBQZXJzb25hUHJvZmlsZUV4cG9ydCB9IHwgeyBvazogZmFsc2U7IGVycm9yOiBzdHJpbmcgfSB7XG4gIGlmICghanNvbi50cmltKCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb2s6IGZhbHNlLFxuICAgICAgZXJyb3I6ICdJbXBvcnQgSlNPTiBpcyBlbXB0eS4nLFxuICAgIH07XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvbikgYXMgdW5rbm93bjtcbiAgICBjb25zdCBwcm9maWxlID0gc2FuaXRpemVQZXJzb25hUHJvZmlsZUV4cG9ydChwYXJzZWQpO1xuXG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvazogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnSW1wb3J0ZWQgSlNPTiBkb2VzIG5vdCBtYXRjaCB0aGUgUGVyc29uYUNoZXNzIHByb2ZpbGUgc2NoZW1hLicsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IG9rOiB0cnVlLCBwcm9maWxlIH07XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB7XG4gICAgICBvazogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ltcG9ydGVkIEpTT04gY291bGQgbm90IGJlIHBhcnNlZC4nLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKHByb2ZpbGU6IFBlcnNvbmFQcm9maWxlRXhwb3J0KTogc3RyaW5nIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHByb2ZpbGUsIG51bGwsIDIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2F2ZWRQZXJzb25hUHJvZmlsZShcbiAgcHJvZmlsZTogUGVyc29uYVByb2ZpbGVFeHBvcnQsXG4gIGlkOiBzdHJpbmcsXG4gIG5vd0lzbzogc3RyaW5nLFxuKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB7XG4gIHJldHVybiB7XG4gICAgLi4ucHJvZmlsZSxcbiAgICBpZCxcbiAgICBjcmVhdGVkQXQ6IG5vd0lzbyxcbiAgICB1cGRhdGVkQXQ6IG5vd0lzbyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNhdmVkUGVyc29uYVByb2ZpbGUoXG4gIHByb2ZpbGU6IFNhdmVkUGVyc29uYVByb2ZpbGUsXG4gIG5leHQ6IFBlcnNvbmFQcm9maWxlRXhwb3J0LFxuICBub3dJc286IHN0cmluZyxcbik6IFNhdmVkUGVyc29uYVByb2ZpbGUge1xuICByZXR1cm4ge1xuICAgIC4uLnByb2ZpbGUsXG4gICAgLi4ubmV4dCxcbiAgICBpZDogcHJvZmlsZS5pZCxcbiAgICBjcmVhdGVkQXQ6IHByb2ZpbGUuY3JlYXRlZEF0LFxuICAgIHVwZGF0ZWRBdDogbm93SXNvLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHVwbGljYXRlUGVyc29uYVByb2ZpbGUoXG4gIHByb2ZpbGU6IFNhdmVkUGVyc29uYVByb2ZpbGUsXG4gIGlkOiBzdHJpbmcsXG4gIG5hbWU6IHN0cmluZyxcbiAgbm93SXNvOiBzdHJpbmcsXG4pOiBTYXZlZFBlcnNvbmFQcm9maWxlIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5wcm9maWxlLFxuICAgIGlkLFxuICAgIG5hbWUsXG4gICAgY3JlYXRlZEF0OiBub3dJc28sXG4gICAgdXBkYXRlZEF0OiBub3dJc28sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVNhdmVkUGVyc29uYVByb2ZpbGUodmFsdWU6IHVua25vd24pOiBTYXZlZFBlcnNvbmFQcm9maWxlIHwgbnVsbCB7XG4gIGlmICghaXNSZWNvcmQodmFsdWUpIHx8IHR5cGVvZiB2YWx1ZS5pZCAhPT0gJ3N0cmluZycgfHwgIXZhbHVlLmlkLnRyaW0oKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgZXhwb3J0ZWQgPSBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlRXhwb3J0KHZhbHVlKTtcbiAgaWYgKCFleHBvcnRlZCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY3JlYXRlZEF0ID0gdHlwZW9mIHZhbHVlLmNyZWF0ZWRBdCA9PT0gJ3N0cmluZycgJiYgdmFsdWUuY3JlYXRlZEF0LnRyaW0oKVxuICAgID8gdmFsdWUuY3JlYXRlZEF0XG4gICAgOiBuZXcgRGF0ZSgwKS50b0lTT1N0cmluZygpO1xuICBjb25zdCB1cGRhdGVkQXQgPSB0eXBlb2YgdmFsdWUudXBkYXRlZEF0ID09PSAnc3RyaW5nJyAmJiB2YWx1ZS51cGRhdGVkQXQudHJpbSgpXG4gICAgPyB2YWx1ZS51cGRhdGVkQXRcbiAgICA6IGNyZWF0ZWRBdDtcblxuICByZXR1cm4ge1xuICAgIC4uLmV4cG9ydGVkLFxuICAgIGlkOiB2YWx1ZS5pZCxcbiAgICBjcmVhdGVkQXQsXG4gICAgdXBkYXRlZEF0LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVQZXJzb25hUHJvZmlsZVN0b3JlU25hcHNob3QodmFsdWU6IHVua25vd24pOiBQZXJzb25hUHJvZmlsZVN0b3JlU25hcHNob3Qge1xuICBpZiAoIWlzUmVjb3JkKHZhbHVlKSkge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9maWxlczogW10sXG4gICAgICBzZWxlY3RlZFByb2ZpbGVJZDogbnVsbCxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgcHJvZmlsZXMgPSBBcnJheS5pc0FycmF5KHZhbHVlLnByb2ZpbGVzKVxuICAgID8gdmFsdWUucHJvZmlsZXNcbiAgICAgIC5tYXAoKGVudHJ5KSA9PiBzYW5pdGl6ZVNhdmVkUGVyc29uYVByb2ZpbGUoZW50cnkpKVxuICAgICAgLmZpbHRlcigoZW50cnkpOiBlbnRyeSBpcyBTYXZlZFBlcnNvbmFQcm9maWxlID0+IGVudHJ5ICE9PSBudWxsKVxuICAgIDogW107XG4gIGNvbnN0IHNlbGVjdGVkUHJvZmlsZUlkID0gdHlwZW9mIHZhbHVlLnNlbGVjdGVkUHJvZmlsZUlkID09PSAnc3RyaW5nJyA/IHZhbHVlLnNlbGVjdGVkUHJvZmlsZUlkIDogbnVsbDtcblxuICByZXR1cm4ge1xuICAgIHByb2ZpbGVzLFxuICAgIHNlbGVjdGVkUHJvZmlsZUlkOiBwcm9maWxlcy5zb21lKChwcm9maWxlKSA9PiBwcm9maWxlLmlkID09PSBzZWxlY3RlZFByb2ZpbGVJZCkgPyBzZWxlY3RlZFByb2ZpbGVJZCA6IG51bGwsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFBlcnNvbmFQcm9maWxlRXhwb3J0RmlsZW5hbWUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qgc2x1ZyA9IG5hbWVcbiAgICAudHJpbSgpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tK3wtKyQvZywgJycpIHx8ICdwZXJzb25hLXByb2ZpbGUnO1xuXG4gIHJldHVybiBgcGVyc29uYWNoZXNzLSR7c2x1Z30uanNvbmA7XG59XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIGJ1aWxkUGVyc29uYVByb2ZpbGVFeHBvcnRGaWxlbmFtZSxcbiAgY3JlYXRlU2F2ZWRQZXJzb25hUHJvZmlsZSxcbiAgZHVwbGljYXRlUGVyc29uYVByb2ZpbGUsXG4gIHBhcnNlUGVyc29uYVByb2ZpbGVJbXBvcnQsXG4gIFBFUlNPTkFfUFJPRklMRV9LSU5ELFxuICBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTixcbiAgUGVyc29uYVByb2ZpbGVFeHBvcnQsXG4gIFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCxcbiAgc2FuaXRpemVQZXJzb25hUHJvZmlsZVN0b3JlU25hcHNob3QsXG4gIFNhdmVkUGVyc29uYVByb2ZpbGUsXG4gIHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlLFxuICB1cGRhdGVTYXZlZFBlcnNvbmFQcm9maWxlLFxufSBmcm9tICcuLi9lbmdpbmUvcGVyc29uYVByb2ZpbGVzJztcbmltcG9ydCB7IGNvbmZpZ1ZpZXdNb2RlbCwgQ29uZmlnVmlld01vZGVsIH0gZnJvbSAnLi9Db25maWdWaWV3TW9kZWwnO1xuaW1wb3J0IHsgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwsIEZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gZnJvbSAnLi9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCc7XG5pbXBvcnQgeyB1aVN0YXRlVmlld01vZGVsLCBVaVN0YXRlVmlld01vZGVsIH0gZnJvbSAnLi9VaVN0YXRlVmlld01vZGVsJztcblxuY29uc3QgUEVSU09OQV9QUk9GSUxFU19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfcGVyc29uYV9wcm9maWxlcyc7XG5cbmludGVyZmFjZSBQZXJzb25hUHJvZmlsZXNEZXBlbmRlbmNpZXMge1xuICBjb25maWdWaWV3TW9kZWw6IFBpY2s8Q29uZmlnVmlld01vZGVsLCAnYnVja2V0Q29uZmlnJyB8ICdjdXJyZW50UHJlc2V0SWQnIHwgJ2RlcHRoJyB8ICdtdWx0aVBWJyB8ICdhcHBseVByb2ZpbGVTbmFwc2hvdCc+O1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbDogUGljazxcbiAgICBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCxcbiAgICB8ICdvcHRpb25zJ1xuICAgIHwgJ2JyaWxsaWFudE1vdmVzUGVyR2FtZSdcbiAgICB8ICdicmlsbGlhbnRBbGxvd2VkUGhhc2UnXG4gICAgfCAnYXBwbHlQcm9maWxlU2V0dGluZ3MnXG4gID47XG4gIHVpU3RhdGVWaWV3TW9kZWw6IFBpY2s8XG4gICAgVWlTdGF0ZVZpZXdNb2RlbCxcbiAgICB8ICd0aGVtZU1vZGUnXG4gICAgfCAnYmFzaWNNb2RlJ1xuICAgIHwgJ2FwcGx5UHJvZmlsZVByZWZlcmVuY2VzJ1xuICA+O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm9maWxlSWQoKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBwcm9maWxlXyR7RGF0ZS5ub3coKS50b1N0cmluZygzNil9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMiwgOCl9YDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGltZXN0YW1wKCk6IHN0cmluZyB7XG4gIHJldHVybiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwge1xuICBwcm9maWxlczogU2F2ZWRQZXJzb25hUHJvZmlsZVtdID0gW107XG4gIHNlbGVjdGVkUHJvZmlsZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgcHJvZmlsZU5hbWVEcmFmdCA9ICcnO1xuICBleGNoYW5nZUpzb24gPSAnJztcbiAgbGFzdEFjdGlvbk1lc3NhZ2UgPSAnJztcbiAgaW1wb3J0RXJyb3IgPSAnJztcblxuICBwcml2YXRlIHJlYWRvbmx5IGRlcHM6IFBlcnNvbmFQcm9maWxlc0RlcGVuZGVuY2llcztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZXBzOiBQZXJzb25hUHJvZmlsZXNEZXBlbmRlbmNpZXMgPSB7XG4gICAgICBjb25maWdWaWV3TW9kZWwsXG4gICAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCxcbiAgICAgIHVpU3RhdGVWaWV3TW9kZWwsXG4gICAgfSxcbiAgKSB7XG4gICAgdGhpcy5kZXBzID0gZGVwcztcblxuICAgIG1ha2VBdXRvT2JzZXJ2YWJsZSh0aGlzLCB7XG4gICAgICBzZXRTZWxlY3RlZFByb2ZpbGVJZDogYWN0aW9uLFxuICAgICAgc2V0UHJvZmlsZU5hbWVEcmFmdDogYWN0aW9uLFxuICAgICAgc2V0RXhjaGFuZ2VKc29uOiBhY3Rpb24sXG4gICAgICBjbGVhckV4Y2hhbmdlU3RhdGU6IGFjdGlvbixcbiAgICAgIHNhdmVDdXJyZW50UHJvZmlsZTogYWN0aW9uLFxuICAgICAgbG9hZFNlbGVjdGVkUHJvZmlsZTogYWN0aW9uLFxuICAgICAgZHVwbGljYXRlU2VsZWN0ZWRQcm9maWxlOiBhY3Rpb24sXG4gICAgICByZW5hbWVTZWxlY3RlZFByb2ZpbGU6IGFjdGlvbixcbiAgICAgIGRlbGV0ZVNlbGVjdGVkUHJvZmlsZTogYWN0aW9uLFxuICAgICAgaW1wb3J0UHJvZmlsZUZyb21Kc29uOiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc3RvcmVGcm9tU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRQcm9maWxlSWQoaWQ6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gaWQ7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU/Lm5hbWUgPz8gJyc7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9ICcnO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgfVxuXG4gIHNldFByb2ZpbGVOYW1lRHJhZnQodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHZhbHVlO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSAnJztcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gIH1cblxuICBzZXRFeGNoYW5nZUpzb24odmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gdmFsdWU7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9ICcnO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgfVxuXG4gIGNsZWFyRXhjaGFuZ2VTdGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9ICcnO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSAnJztcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gIH1cblxuICBzYXZlQ3VycmVudFByb2ZpbGUobmFtZSA9IHRoaXMucHJvZmlsZU5hbWVEcmFmdCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHRyaW1tZWROYW1lID0gbmFtZS50cmltKCk7XG4gICAgaWYgKCF0cmltbWVkTmFtZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdFbnRlciBhIHByb2ZpbGUgbmFtZSBiZWZvcmUgc2F2aW5nLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgc25hcHNob3QgPSB0aGlzLmJ1aWxkQ3VycmVudFNuYXBzaG90KCk7XG4gICAgY29uc3QgZXhwb3J0ZWQgPSB0aGlzLmNyZWF0ZUV4cG9ydCh0cmltbWVkTmFtZSwgc25hcHNob3QpO1xuICAgIGNvbnN0IG5vd0lzbyA9IGNyZWF0ZVRpbWVzdGFtcCgpO1xuICAgIGNvbnN0IGV4aXN0aW5nQnlTZWxlY3RlZCA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGNvbnN0IGV4aXN0aW5nQnlOYW1lID0gdGhpcy5maW5kQnlOYW1lKHRyaW1tZWROYW1lKTtcblxuICAgIGlmIChleGlzdGluZ0J5U2VsZWN0ZWQgJiYgZXhpc3RpbmdCeVNlbGVjdGVkLm5hbWUgPT09IHRyaW1tZWROYW1lKSB7XG4gICAgICB0aGlzLnByb2ZpbGVzID0gdGhpcy5wcm9maWxlcy5tYXAoKHByb2ZpbGUpID0+IChcbiAgICAgICAgcHJvZmlsZS5pZCA9PT0gZXhpc3RpbmdCeVNlbGVjdGVkLmlkXG4gICAgICAgICAgPyB1cGRhdGVTYXZlZFBlcnNvbmFQcm9maWxlKHByb2ZpbGUsIGV4cG9ydGVkLCBub3dJc28pXG4gICAgICAgICAgOiBwcm9maWxlXG4gICAgICApKTtcbiAgICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgVXBkYXRlZCBwcm9maWxlIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFELmA7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKGV4cG9ydGVkKTtcbiAgICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGV4aXN0aW5nQnlOYW1lKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gYEEgcHJvZmlsZSBuYW1lZCBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRCBhbHJlYWR5IGV4aXN0cy5gO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHNhdmVkID0gY3JlYXRlU2F2ZWRQZXJzb25hUHJvZmlsZShleHBvcnRlZCwgY3JlYXRlUHJvZmlsZUlkKCksIG5vd0lzbyk7XG4gICAgdGhpcy5wcm9maWxlcyA9IFtzYXZlZCwgLi4udGhpcy5wcm9maWxlc107XG4gICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IHNhdmVkLmlkO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHNhdmVkLm5hbWU7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZShleHBvcnRlZCk7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBTYXZlZCBwcm9maWxlIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgbG9hZFNlbGVjdGVkUHJvZmlsZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ1NlbGVjdCBhIHNhdmVkIHByb2ZpbGUgdG8gbG9hZC4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuYXBwbHlTbmFwc2hvdChwcm9maWxlLnNldHRpbmdzKTtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSBwcm9maWxlLm5hbWU7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZSh0aGlzLnRvRXhwb3J0KHByb2ZpbGUpKTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYExvYWRlZCBwcm9maWxlIFx1MjAxQyR7cHJvZmlsZS5uYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGR1cGxpY2F0ZVNlbGVjdGVkUHJvZmlsZShuYW1lID0gdGhpcy5wcm9maWxlTmFtZURyYWZ0KTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdTZWxlY3QgYSBzYXZlZCBwcm9maWxlIHRvIGR1cGxpY2F0ZS4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHRyaW1tZWROYW1lID0gbmFtZS50cmltKCkgfHwgYCR7cHJvZmlsZS5uYW1lfSBDb3B5YDtcbiAgICBpZiAodGhpcy5maW5kQnlOYW1lKHRyaW1tZWROYW1lKSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9IGBBIHByb2ZpbGUgbmFtZWQgXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQgYWxyZWFkeSBleGlzdHMuYDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBub3dJc28gPSBjcmVhdGVUaW1lc3RhbXAoKTtcbiAgICBjb25zdCBkdXBsaWNhdGUgPSBkdXBsaWNhdGVQZXJzb25hUHJvZmlsZShwcm9maWxlLCBjcmVhdGVQcm9maWxlSWQoKSwgdHJpbW1lZE5hbWUsIG5vd0lzbyk7XG4gICAgdGhpcy5wcm9maWxlcyA9IFtkdXBsaWNhdGUsIC4uLnRoaXMucHJvZmlsZXNdO1xuICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBkdXBsaWNhdGUuaWQ7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gZHVwbGljYXRlLm5hbWU7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZSh0aGlzLnRvRXhwb3J0KGR1cGxpY2F0ZSkpO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgRHVwbGljYXRlZCBwcm9maWxlIGFzIFx1MjAxQyR7ZHVwbGljYXRlLm5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVuYW1lU2VsZWN0ZWRQcm9maWxlKG5hbWUgPSB0aGlzLnByb2ZpbGVOYW1lRHJhZnQpOiBib29sZWFuIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ1NlbGVjdCBhIHNhdmVkIHByb2ZpbGUgdG8gcmVuYW1lLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgdHJpbW1lZE5hbWUgPSBuYW1lLnRyaW0oKTtcbiAgICBpZiAoIXRyaW1tZWROYW1lKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ0VudGVyIGEgcHJvZmlsZSBuYW1lIGJlZm9yZSByZW5hbWluZy4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChwcm9maWxlLm5hbWUgPT09IHRyaW1tZWROYW1lKSB7XG4gICAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gJ1Byb2ZpbGUgbmFtZSBpcyBhbHJlYWR5IHVwIHRvIGRhdGUuJztcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nQnlOYW1lID0gdGhpcy5maW5kQnlOYW1lKHRyaW1tZWROYW1lKTtcbiAgICBpZiAoZXhpc3RpbmdCeU5hbWUgJiYgZXhpc3RpbmdCeU5hbWUuaWQgIT09IHByb2ZpbGUuaWQpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSBgQSBwcm9maWxlIG5hbWVkIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFEIGFscmVhZHkgZXhpc3RzLmA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgbm93SXNvID0gY3JlYXRlVGltZXN0YW1wKCk7XG4gICAgdGhpcy5wcm9maWxlcyA9IHRoaXMucHJvZmlsZXMubWFwKChlbnRyeSkgPT4gKFxuICAgICAgZW50cnkuaWQgPT09IHByb2ZpbGUuaWRcbiAgICAgICAgPyB7IC4uLmVudHJ5LCBuYW1lOiB0cmltbWVkTmFtZSwgdXBkYXRlZEF0OiBub3dJc28gfVxuICAgICAgICA6IGVudHJ5XG4gICAgKSk7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gdHJpbW1lZE5hbWU7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBSZW5hbWVkIHByb2ZpbGUgdG8gXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBkZWxldGVTZWxlY3RlZFByb2ZpbGUoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcHJvZmlsZSA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlO1xuICAgIGlmICghcHJvZmlsZSkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICdTZWxlY3QgYSBzYXZlZCBwcm9maWxlIHRvIGRlbGV0ZS4nO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMucHJvZmlsZXMgPSB0aGlzLnByb2ZpbGVzLmZpbHRlcigoZW50cnkpID0+IGVudHJ5LmlkICE9PSBwcm9maWxlLmlkKTtcbiAgICBjb25zdCBuZXh0U2VsZWN0ZWRJZCA9IHRoaXMucHJvZmlsZXNbMF0/LmlkID8/IG51bGw7XG4gICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IG5leHRTZWxlY3RlZElkO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlPy5uYW1lID8/ICcnO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gJyc7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBEZWxldGVkIHByb2ZpbGUgXHUyMDFDJHtwcm9maWxlLm5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZXhwb3J0U2VsZWN0ZWRQcm9maWxlKCk6IHsgZmlsZU5hbWU6IHN0cmluZzsganNvbjogc3RyaW5nIH0gfCBudWxsIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ1NlbGVjdCBhIHNhdmVkIHByb2ZpbGUgdG8gZXhwb3J0Lic7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBleHBvcnRlZCA9IHRoaXMudG9FeHBvcnQocHJvZmlsZSk7XG4gICAgY29uc3QganNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKGV4cG9ydGVkKTtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IGpzb247XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBFeHBvcnRlZCBwcm9maWxlIFx1MjAxQyR7cHJvZmlsZS5uYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcblxuICAgIHJldHVybiB7XG4gICAgICBmaWxlTmFtZTogYnVpbGRQZXJzb25hUHJvZmlsZUV4cG9ydEZpbGVuYW1lKHByb2ZpbGUubmFtZSksXG4gICAgICBqc29uLFxuICAgIH07XG4gIH1cblxuICBpbXBvcnRQcm9maWxlRnJvbUpzb24oanNvbiA9IHRoaXMuZXhjaGFuZ2VKc29uKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VQZXJzb25hUHJvZmlsZUltcG9ydChqc29uKTtcbiAgICBpZiAoIXBhcnNlZC5vaykge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9IHBhcnNlZC5lcnJvcjtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBpbmNvbWluZ05hbWUgPSBwYXJzZWQucHJvZmlsZS5uYW1lLnRyaW0oKTtcbiAgICBjb25zdCBmaW5hbE5hbWUgPSB0aGlzLmVuc3VyZVVuaXF1ZU5hbWUoaW5jb21pbmdOYW1lKTtcbiAgICBjb25zdCBleHBvcnRlZCA9IHtcbiAgICAgIC4uLnBhcnNlZC5wcm9maWxlLFxuICAgICAgbmFtZTogZmluYWxOYW1lLFxuICAgIH07XG4gICAgY29uc3Qgbm93SXNvID0gY3JlYXRlVGltZXN0YW1wKCk7XG4gICAgY29uc3Qgc2F2ZWQgPSBjcmVhdGVTYXZlZFBlcnNvbmFQcm9maWxlKGV4cG9ydGVkLCBjcmVhdGVQcm9maWxlSWQoKSwgbm93SXNvKTtcblxuICAgIHRoaXMucHJvZmlsZXMgPSBbc2F2ZWQsIC4uLnRoaXMucHJvZmlsZXNdO1xuICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBzYXZlZC5pZDtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSBzYXZlZC5uYW1lO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQpO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBmaW5hbE5hbWUgPT09IGluY29taW5nTmFtZVxuICAgICAgPyBgSW1wb3J0ZWQgcHJvZmlsZSBcdTIwMUMke2ZpbmFsTmFtZX1cdTIwMUQuYFxuICAgICAgOiBgSW1wb3J0ZWQgcHJvZmlsZSBhcyBcdTIwMUMke2ZpbmFsTmFtZX1cdTIwMUQgdG8gYXZvaWQgYSBkdXBsaWNhdGUgbmFtZS5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGdldCBzZWxlY3RlZFByb2ZpbGUoKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnByb2ZpbGVzLmZpbmQoKHByb2ZpbGUpID0+IHByb2ZpbGUuaWQgPT09IHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQpID8/IG51bGw7XG4gIH1cblxuICBwcml2YXRlIGJ1aWxkQ3VycmVudFNuYXBzaG90KCk6IFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJ1Y2tldENvbmZpZzogeyAuLi50aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmJ1Y2tldENvbmZpZyB9LFxuICAgICAgY3VycmVudFByZXNldElkOiB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmN1cnJlbnRQcmVzZXRJZCxcbiAgICAgIGRlcHRoOiB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLmRlcHRoLFxuICAgICAgbXVsdGlQVjogdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5tdWx0aVBWLFxuICAgICAgZmVhdHVyZU9wdGlvbnM6IHsgLi4udGhpcy5kZXBzLmZlYXR1cmVPcHRpb25zVmlld01vZGVsLm9wdGlvbnMgfSxcbiAgICAgIGJyaWxsaWFudDoge1xuICAgICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IHRoaXMuZGVwcy5mZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3Zlc1BlckdhbWUsXG4gICAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogdGhpcy5kZXBzLmZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudEFsbG93ZWRQaGFzZSxcbiAgICAgIH0sXG4gICAgICB1aToge1xuICAgICAgICB0aGVtZU1vZGU6IHRoaXMuZGVwcy51aVN0YXRlVmlld01vZGVsLnRoZW1lTW9kZSxcbiAgICAgICAgYmFzaWNNb2RlOiB0aGlzLmRlcHMudWlTdGF0ZVZpZXdNb2RlbC5iYXNpY01vZGUsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGFwcGx5U25hcHNob3Qoc25hcHNob3Q6IFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCk6IHZvaWQge1xuICAgIHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuYXBwbHlQcm9maWxlU25hcHNob3Qoe1xuICAgICAgYnVja2V0Q29uZmlnOiBzbmFwc2hvdC5idWNrZXRDb25maWcsXG4gICAgICBjdXJyZW50UHJlc2V0SWQ6IHNuYXBzaG90LmN1cnJlbnRQcmVzZXRJZCxcbiAgICAgIGRlcHRoOiBzbmFwc2hvdC5kZXB0aCxcbiAgICAgIG11bHRpUFY6IHNuYXBzaG90Lm11bHRpUFYsXG4gICAgfSk7XG4gICAgdGhpcy5kZXBzLmZlYXR1cmVPcHRpb25zVmlld01vZGVsLmFwcGx5UHJvZmlsZVNldHRpbmdzKHNuYXBzaG90LmZlYXR1cmVPcHRpb25zLCBzbmFwc2hvdC5icmlsbGlhbnQpO1xuICAgIHRoaXMuZGVwcy51aVN0YXRlVmlld01vZGVsLmFwcGx5UHJvZmlsZVByZWZlcmVuY2VzKHNuYXBzaG90LnVpKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlRXhwb3J0KG5hbWU6IHN0cmluZywgc2V0dGluZ3M6IFBlcnNvbmFQcm9maWxlU2V0dGluZ3NTbmFwc2hvdCk6IFBlcnNvbmFQcm9maWxlRXhwb3J0IHtcbiAgICByZXR1cm4ge1xuICAgICAga2luZDogUEVSU09OQV9QUk9GSUxFX0tJTkQsXG4gICAgICB2ZXJzaW9uOiBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTixcbiAgICAgIG5hbWUsXG4gICAgICBzZXR0aW5ncyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSB0b0V4cG9ydChwcm9maWxlOiBTYXZlZFBlcnNvbmFQcm9maWxlKTogUGVyc29uYVByb2ZpbGVFeHBvcnQge1xuICAgIHJldHVybiB7XG4gICAgICBraW5kOiBwcm9maWxlLmtpbmQsXG4gICAgICB2ZXJzaW9uOiBwcm9maWxlLnZlcnNpb24sXG4gICAgICBuYW1lOiBwcm9maWxlLm5hbWUsXG4gICAgICBzZXR0aW5nczogcHJvZmlsZS5zZXR0aW5ncyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5kQnlOYW1lKG5hbWU6IHN0cmluZyk6IFNhdmVkUGVyc29uYVByb2ZpbGUgfCBudWxsIHtcbiAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IG5hbWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHRoaXMucHJvZmlsZXMuZmluZCgocHJvZmlsZSkgPT4gcHJvZmlsZS5uYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZSkgPz8gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlVW5pcXVlTmFtZShiYXNlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB0cmltbWVkQmFzZU5hbWUgPSBiYXNlTmFtZS50cmltKCkgfHwgJ0ltcG9ydGVkIFByb2ZpbGUnO1xuICAgIGlmICghdGhpcy5maW5kQnlOYW1lKHRyaW1tZWRCYXNlTmFtZSkpIHtcbiAgICAgIHJldHVybiB0cmltbWVkQmFzZU5hbWU7XG4gICAgfVxuXG4gICAgbGV0IGluZGV4ID0gMjtcbiAgICBsZXQgY2FuZGlkYXRlID0gYCR7dHJpbW1lZEJhc2VOYW1lfSAke2luZGV4fWA7XG4gICAgd2hpbGUgKHRoaXMuZmluZEJ5TmFtZShjYW5kaWRhdGUpKSB7XG4gICAgICBpbmRleCArPSAxO1xuICAgICAgY2FuZGlkYXRlID0gYCR7dHJpbW1lZEJhc2VOYW1lfSAke2luZGV4fWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFBFUlNPTkFfUFJPRklMRVNfU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKCFzYXZlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNuYXBzaG90ID0gc2FuaXRpemVQZXJzb25hUHJvZmlsZVN0b3JlU25hcHNob3QoSlNPTi5wYXJzZShzYXZlZCkgYXMgdW5rbm93bik7XG4gICAgICB0aGlzLnByb2ZpbGVzID0gc25hcHNob3QucHJvZmlsZXM7XG4gICAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gc25hcHNob3Quc2VsZWN0ZWRQcm9maWxlSWQgPz8gc25hcHNob3QucHJvZmlsZXNbMF0/LmlkID8/IG51bGw7XG4gICAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZT8ubmFtZSA/PyAnJztcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBpbnZhbGlkIHNhdmVkIHBlcnNvbmEgcHJvZmlsZXMgYW5kIGNvbnRpbnVlIHdpdGggYW4gZW1wdHkgbGlzdC5cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHBlcnNpc3RUb1N0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICBQRVJTT05BX1BST0ZJTEVTX1NUT1JBR0VfS0VZLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgcHJvZmlsZXM6IHRoaXMucHJvZmlsZXMsXG4gICAgICAgICAgc2VsZWN0ZWRQcm9maWxlSWQ6IHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQsXG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBsb2NhbFN0b3JhZ2UgZmFpbHVyZXMgdG8ga2VlcCBzZXR0aW5ncyB1c2FibGUuXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBwZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwgPSBuZXcgUGVyc29uYVByb2ZpbGVzVmlld01vZGVsKCk7XG5cbmV4cG9ydCB7IFBFUlNPTkFfUFJPRklMRVNfU1RPUkFHRV9LRVkgfTtcbiIsICIvKipcbiAqIFZpZXdNb2RlbHMgTW9kdWxlXG4gKiBSZS1leHBvcnRzIGFsbCBWaWV3TW9kZWwgaW5zdGFuY2VzXG4gKi9cblxuZXhwb3J0IHsgQm9hcmRWaWV3TW9kZWwsIGJvYXJkVmlld01vZGVsIH0gZnJvbSAnLi9Cb2FyZFZpZXdNb2RlbCc7XG5leHBvcnQgeyBFbmdpbmVWaWV3TW9kZWwsIGVuZ2luZVZpZXdNb2RlbCB9IGZyb20gJy4vRW5naW5lVmlld01vZGVsJztcbmV4cG9ydCB7IENvbmZpZ1ZpZXdNb2RlbCwgY29uZmlnVmlld01vZGVsIH0gZnJvbSAnLi9Db25maWdWaWV3TW9kZWwnO1xuZXhwb3J0IHsgRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gZnJvbSAnLi9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCc7XG5leHBvcnQgeyBHYW1lQW5hbHl0aWNzVmlld01vZGVsLCBnYW1lQW5hbHl0aWNzVmlld01vZGVsIH0gZnJvbSAnLi9HYW1lQW5hbHl0aWNzVmlld01vZGVsJztcbmV4cG9ydCB7IEdhbWVTZXR1cFZpZXdNb2RlbCwgZ2FtZVNldHVwVmlld01vZGVsIH0gZnJvbSAnLi9HYW1lU2V0dXBWaWV3TW9kZWwnO1xuZXhwb3J0IHsgRGVidWdWaWV3TW9kZWwsIGRlYnVnVmlld01vZGVsIH0gZnJvbSAnLi9EZWJ1Z1ZpZXdNb2RlbCc7XG5leHBvcnQgeyBVaVN0YXRlVmlld01vZGVsLCB1aVN0YXRlVmlld01vZGVsIH0gZnJvbSAnLi9VaVN0YXRlVmlld01vZGVsJztcbmV4cG9ydCB7IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCwgcGVyc29uYVByb2ZpbGVzVmlld01vZGVsIH0gZnJvbSAnLi9QZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwnO1xuIiwgImltcG9ydCBhc3NlcnQgZnJvbSAnbm9kZTphc3NlcnQvc3RyaWN0JztcbmltcG9ydCB0ZXN0IGZyb20gJ25vZGU6dGVzdCc7XG5cbmNsYXNzIE1lbW9yeVN0b3JhZ2Uge1xuICBwcml2YXRlIHN0b3JlID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICBnZXRJdGVtKGtleTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuaGFzKGtleSkgPyAodGhpcy5zdG9yZS5nZXQoa2V5KSA/PyBudWxsKSA6IG51bGw7XG4gIH1cblxuICBzZXRJdGVtKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZS5zZXQoa2V5LCB2YWx1ZSk7XG4gIH1cblxuICByZW1vdmVJdGVtKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZS5kZWxldGUoa2V5KTtcbiAgfVxuXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMuc3RvcmUuY2xlYXIoKTtcbiAgfVxufVxuXG5jb25zdCBsb2NhbFN0b3JhZ2VNb2NrID0gbmV3IE1lbW9yeVN0b3JhZ2UoKTtcbihnbG9iYWxUaGlzIGFzIHVua25vd24gYXMgeyBsb2NhbFN0b3JhZ2U6IE1lbW9yeVN0b3JhZ2UgfSkubG9jYWxTdG9yYWdlID0gbG9jYWxTdG9yYWdlTW9jaztcblxudGVzdCgnYW5hbHlzaXMgc2FmZXR5IGlnbm9yZXMgc3RhbGUgcmVxdWVzdHMgYW5kIHN0YWxlIGRlbGF5ZWQgbW92ZXMnLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgY2FuQXBwbHlBbmFseXplZE1vdmUsIGlzU3RhbGVBbmFseXNpc1JlcXVlc3QgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9hbmFseXNpc1NhZmV0eScpO1xuXG4gIGFzc2VydC5lcXVhbChpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0KDEsIDIpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGlzU3RhbGVBbmFseXNpc1JlcXVlc3QoNCwgNCksIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGNhbkFwcGx5QW5hbHl6ZWRNb3ZlKCdmZW4tYScsICdmZW4tYicpLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChjYW5BcHBseUFuYWx5emVkTW92ZSgnZmVuLWEnLCAnZmVuLWEnKSwgdHJ1ZSk7XG59KTtcblxudGVzdCgnYW5hbHlzaXMgY2FjaGUga2V5LCB0cmltbWluZywgYW5kIGludmFsaWRhdGlvbiBiZWhhdmUgY29ycmVjdGx5JywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IEFuYWx5c2lzQ2FjaGUsIGJ1aWxkQW5hbHlzaXNDYWNoZUtleSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2FuYWx5c2lzQ2FjaGUnKTtcblxuICBhc3NlcnQuZXF1YWwoXG4gICAgYnVpbGRBbmFseXNpc0NhY2hlS2V5KCdmZW4nLCA4LCAxMiksXG4gICAgJ2ZlbnxkZXB0aDo4fG11bHRpcHY6MTInLFxuICApO1xuXG4gIGNvbnN0IGNhY2hlID0gbmV3IEFuYWx5c2lzQ2FjaGUoMik7XG4gIGNhY2hlLnNldCh7IGtleTogJ2EnLCBtb3ZlczogW10sIHRpbWVzdGFtcDogMSB9KTtcbiAgY2FjaGUuc2V0KHsga2V5OiAnYicsIG1vdmVzOiBbXSwgdGltZXN0YW1wOiAyIH0pO1xuICBjYWNoZS5zZXQoeyBrZXk6ICdjJywgbW92ZXM6IFtdLCB0aW1lc3RhbXA6IDMgfSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGNhY2hlLnNpemUsIDIpO1xuICBhc3NlcnQuZXF1YWwoY2FjaGUuZ2V0KCdhJyksIG51bGwpO1xuICBhc3NlcnQubm90RXF1YWwoY2FjaGUuZ2V0KCdiJyksIG51bGwpO1xuICBhc3NlcnQubm90RXF1YWwoY2FjaGUuZ2V0KCdjJyksIG51bGwpO1xuXG4gIGNhY2hlLmludmFsaWRhdGUoJ2InKTtcbiAgYXNzZXJ0LmVxdWFsKGNhY2hlLmdldCgnYicpLCBudWxsKTtcblxuICBjYWNoZS5pbnZhbGlkYXRlKCk7XG4gIGFzc2VydC5lcXVhbChjYWNoZS5zaXplLCAwKTtcbn0pO1xuXG50ZXN0KCdkZXRlcm1pbmlzdGljIFJORyBjaGFuZ2VzIHN0cmVhbSB3aGVuIEZFTiBjaGFuZ2VzIGF0IHRoZSBzYW1lIG1vdmUgbnVtYmVyJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQsIGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3JhbmRvbScpO1xuXG4gIGNvbnN0IHNlZWRBID0gYnVpbGREZXRlcm1pbmlzdGljU2VlZCh7XG4gICAgZ2FtZVN0YXJ0RmVuOiAnc3RhcnQtZmVuJyxcbiAgICBjdXJyZW50RmVuOiAnZmVuLWEnLFxuICAgIG1vdmVDb3VudDogMTIsXG4gICAgc2lkZVRvTW92ZTogJ3cnLFxuICAgIHBlcnNvbmE6ICdtZWRpdW0nLFxuICB9KTtcbiAgY29uc3Qgc2VlZEIgPSBidWlsZERldGVybWluaXN0aWNTZWVkKHtcbiAgICBnYW1lU3RhcnRGZW46ICdzdGFydC1mZW4nLFxuICAgIGN1cnJlbnRGZW46ICdmZW4tYicsXG4gICAgbW92ZUNvdW50OiAxMixcbiAgICBzaWRlVG9Nb3ZlOiAndycsXG4gICAgcGVyc29uYTogJ21lZGl1bScsXG4gIH0pO1xuXG4gIGNvbnN0IHJuZ0EgPSBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2Uoc2VlZEEpO1xuICBjb25zdCBybmdCID0gY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlKHNlZWRCKTtcblxuICBhc3NlcnQubm90RXF1YWwocm5nQS5uZXh0KCksIHJuZ0IubmV4dCgpKTtcbn0pO1xuXG50ZXN0KCdQR04gY3VzdG9tIHN0YXJ0IEZFTiBpcyByZXNwZWN0ZWQnLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgcmVzb2x2ZVBnblN0YXJ0RmVuIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvZ2FtZVNlc3Npb24nKTtcblxuICBjb25zdCBmZW4gPSByZXNvbHZlUGduU3RhcnRGZW4oXG4gICAge1xuICAgICAgU2V0VXA6ICcxJyxcbiAgICAgIEZFTjogJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScsXG4gICAgfSxcbiAgICAnZmFsbGJhY2snLFxuICApO1xuXG4gIGFzc2VydC5lcXVhbChmZW4sICc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnKTtcbn0pO1xuXG50ZXN0KCdicmlsbGlhbnQgdXNhZ2UgZGVyaXZlcyBmcm9tIG1vdmUgaGlzdG9yeSBtZXRhZGF0YScsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBkZXJpdmVCcmlsbGlhbnRVc2FnZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2JyaWxsaWFudFRyYWNraW5nJyk7XG5cbiAgY29uc3QgdXNhZ2UgPSBkZXJpdmVCcmlsbGlhbnRVc2FnZShbXG4gICAge1xuICAgICAgYmVmb3JlRmVuOiAnYScsXG4gICAgICBhZnRlckZlbjogJ2InLFxuICAgICAgdWNpOiAnZTJlNCcsXG4gICAgICBtb3ZlTnVtYmVyOiAxLFxuICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IGZhbHNlLFxuICAgIH0sXG4gICAge1xuICAgICAgYmVmb3JlRmVuOiAnYicsXG4gICAgICBhZnRlckZlbjogJ2MnLFxuICAgICAgdWNpOiAnZTdlNScsXG4gICAgICBtb3ZlTnVtYmVyOiAxLFxuICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUsXG4gICAgfSxcbiAgXSk7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbCh1c2FnZSwge1xuICAgIGJyaWxsaWFudFVzZWRDb3VudDogMSxcbiAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogWzFdLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdicmlsbGlhbnQgYnVkZ2V0IGlzIGNvbnN1bWVkIG9ubHkgYWZ0ZXIgYSBzdWNjZXNzZnVsIGVuZ2luZSBtb3ZlIGFuZCByb2xscyBiYWNrIG9uIHVuZG8vcmVkbycsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsIHRydWUpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWUoMik7XG5cbiAgY29uc3QgaW52YWxpZE1vdmUgPSBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnYTFhMScsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChpbnZhbGlkTW92ZSwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcblxuICBjb25zdCBzdWNjZXNzZnVsTW92ZSA9IGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdlMmU0JywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKHN1Y2Nlc3NmdWxNb3ZlLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZU51bWJlcnMsIFsxXSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLnVuZG9TaW5nbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuICBhc3NlcnQuZGVlcEVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVOdW1iZXJzLCBbXSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLnJlZG9TaW5nbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuICBhc3NlcnQuZGVlcEVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVOdW1iZXJzLCBbMV0pO1xufSk7XG5cbnRlc3QoJ25ldyBGRU4sIFBHTiwgYW5kIG9wZW5pbmcgbG9hZHMgcmVzZXQgYnJpbGxpYW50IHN0YXRlIGFuZCBQR04gc3RhcnQgRkVOIHVwZGF0ZXMgZ2FtZSBzdGFydCcsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwsIGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG4gIGNvbnN0IHsgUFJFREVGSU5FRF9PUEVOSU5HUyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL29wZW5pbmdzJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsIHRydWUpO1xuICBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnZTJlNCcsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuXG4gIGJvYXJkVmlld01vZGVsLmxvYWRGZW4oJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcblxuICBib2FyZFZpZXdNb2RlbC5sb2FkUGduKCdbU2V0VXAgXCIxXCJdXFxuW0ZFTiBcIjgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMVwiXVxcblxcbjEuIEthMiAqJyk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5nYW1lU3RhcnRGZW4sICc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG5cbiAgYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2gxaDInLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcblxuICBib2FyZFZpZXdNb2RlbC5sb2FkUGduKFBSRURFRklORURfT1BFTklOR1NbMF0ucGduKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG59KTtcblxudGVzdCgnc29sdmVOZXh0TW92ZSBkcm9wcyBzdGFsZSBkZWxheWVkIGF1dG9wbGF5IG1vdmVzIHNhZmVseScsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgYm9hcmRWaWV3TW9kZWwsIGVuZ2luZVZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwsIGNvbmZpZ1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGJvYXJkVmlld01vZGVsLnJlc2V0KCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3VzZUh1bWFuRGVsYXlTaW11bGF0aW9uJywgdHJ1ZSk7XG4gIGNvbmZpZ1ZpZXdNb2RlbC5hcHBseVByZXNldCgnbWVkaXVtJyk7XG5cbiAgY29uc3Qgb3JpZ2luYWxJbml0aWFsaXplID0gZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUuYmluZChlbmdpbmVWaWV3TW9kZWwpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5emVQb3NpdGlvbiA9IGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24uYmluZChlbmdpbmVWaWV3TW9kZWwpO1xuICBjb25zdCBvcmlnaW5hbFBpY2tNb3ZlID0gZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzLmJpbmQoZW5naW5lVmlld01vZGVsKTtcblxuICBsZXQgcmVsZWFzZURlbGF5OiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcblxuICBlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gIGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplID0gYXN5bmMgKCkgPT4gdW5kZWZpbmVkO1xuICBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uID0gYXN5bmMgKGZlbjogc3RyaW5nKSA9PiAoe1xuICAgIHJlcXVlc3RJZDogMSxcbiAgICBhbmFseXplZEZlbjogZmVuLFxuICAgIG1vdmVzOiBbXG4gICAgICB7XG4gICAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgICAgZXZhbHVhdGlvbjogMzAsXG4gICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICBwdjogWydlMmU0J10sXG4gICAgICAgIG11bHRpcHY6IDEsXG4gICAgICAgIGRlcHRoOiA4LFxuICAgICAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBjb21wbGV4aXR5OiB7XG4gICAgICBsZXZlbDogJ21lZGl1bScsXG4gICAgICBzY29yZTogMC41LFxuICAgICAgc3ByZWFkOiAzMCxcbiAgICAgIGNsb3NlQ2FuZGlkYXRlczogMixcbiAgICAgIHZvbGF0aWxpdHk6IDIwLFxuICAgIH0sXG4gICAgaWdub3JlZDogZmFsc2UsXG4gICAgZnJvbUNhY2hlOiBmYWxzZSxcbiAgICBwdXJwb3NlOiAnZW5naW5lTW92ZScsXG4gIH0pO1xuICBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMgPSAoKSA9PiAoe1xuICAgIG1vdmU6IHtcbiAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgIGV2YWx1YXRpb246IDMwLFxuICAgICAgZXZhbExvc3M6IDAsXG4gICAgICBwdjogWydlMmU0J10sXG4gICAgICBtdWx0aXB2OiAxLFxuICAgICAgZGVwdGg6IDgsXG4gICAgICBidWNrZXQ6ICdiZXN0JyxcbiAgICB9LFxuICAgIGJ1Y2tldDogJ2Jlc3QnLFxuICAgIGlzQnJpbGxpYW50OiBmYWxzZSxcbiAgfSk7XG5cbiAgKGJvYXJkVmlld01vZGVsIGFzIHVua25vd24gYXMgeyB3YWl0OiAoZGVsYXlNczogbnVtYmVyKSA9PiBQcm9taXNlPHZvaWQ+IH0pLndhaXQgPSAoKSA9PlxuICAgIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICByZWxlYXNlRGVsYXkgPSByZXNvbHZlO1xuICAgIH0pO1xuXG4gIGNvbnN0IHBlbmRpbmdNb3ZlID0gYm9hcmRWaWV3TW9kZWwuc29sdmVOZXh0TW92ZSh0cnVlKTtcbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzZXRUaW1lb3V0KHJlc29sdmUsIDApO1xuICB9KTtcbiAgYm9hcmRWaWV3TW9kZWwubG9hZEZlbignOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyk7XG4gIHJlbGVhc2VEZWxheT8uKCk7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBlbmRpbmdNb3ZlO1xuXG4gIGFzc2VydC5lcXVhbChyZXN1bHQsIG51bGwpO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuZmVuLCAnOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyk7XG5cbiAgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUgPSBvcmlnaW5hbEluaXRpYWxpemU7XG4gIGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24gPSBvcmlnaW5hbEFuYWx5emVQb3NpdGlvbjtcbiAgZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzID0gb3JpZ2luYWxQaWNrTW92ZTtcbn0pO1xuXG50ZXN0KCdiYWNrZ3JvdW5kIGFuYWx5c2lzIGRvZXMgbm90IGNhbmNlbCBhIHZhbGlkIHBlbmRpbmcgZW5naW5lIG1vdmUgcmVxdWVzdCcsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgRW5naW5lVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG4gIGNvbnN0IHsgc3RvY2tmaXNoU2VydmljZSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3N0b2NrZmlzaC5zZXJ2aWNlJyk7XG4gIGNvbnN0IGVuZ2luZSA9IG5ldyBFbmdpbmVWaWV3TW9kZWwoKTtcblxuICBjb25zdCBvcmlnaW5hbEluaXRpYWxpemUgPSBlbmdpbmUuaW5pdGlhbGl6ZS5iaW5kKGVuZ2luZSk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHl6ZSA9IHN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uLmJpbmQoc3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsQ29uZmlndXJlID0gc3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUuYmluZChzdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxTdG9wID0gc3RvY2tmaXNoU2VydmljZS5zdG9wLmJpbmQoc3RvY2tmaXNoU2VydmljZSk7XG5cbiAgbGV0IHJlbGVhc2VBbmFseXNpczogKCgpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG4gIGxldCBhbmFseXplQ2FsbHMgPSAwO1xuXG4gIGVuZ2luZS5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgZW5naW5lLmluaXRpYWxpemUgPSBhc3luYyAoKSA9PiB1bmRlZmluZWQ7XG4gIHN0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gKCkgPT4gdW5kZWZpbmVkO1xuICBzdG9ja2Zpc2hTZXJ2aWNlLnN0b3AgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIHN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gYXN5bmMgKCkgPT4ge1xuICAgIGFuYWx5emVDYWxscyArPSAxO1xuICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICByZWxlYXNlQW5hbHlzaXMgPSByZXNvbHZlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgICBldmFsdWF0aW9uOiA0MixcbiAgICAgICAgZXZhbExvc3M6IDAsXG4gICAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgICAgbXVsdGlwdjogMSxcbiAgICAgICAgZGVwdGg6IDEwLFxuICAgICAgfSxcbiAgICBdO1xuICB9O1xuXG4gIGNvbnN0IGVuZ2luZU1vdmVQcm9taXNlID0gZW5naW5lLmFuYWx5emVQb3NpdGlvbignZmVuLXNoYXJlZCcsIDEwLCAyLCAnZW5naW5lTW92ZScpO1xuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCAwKSk7XG4gIGNvbnN0IGJhY2tncm91bmRQcm9taXNlID0gZW5naW5lLmFuYWx5emVQb3NpdGlvbignZmVuLXNoYXJlZCcsIDEwLCAyLCAnYmFja2dyb3VuZCcpO1xuXG4gIHJlbGVhc2VBbmFseXNpcz8uKCk7XG5cbiAgY29uc3QgW2VuZ2luZU1vdmVSZXN1bHQsIGJhY2tncm91bmRSZXN1bHRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW2VuZ2luZU1vdmVQcm9taXNlLCBiYWNrZ3JvdW5kUHJvbWlzZV0pO1xuXG4gIGFzc2VydC5lcXVhbChhbmFseXplQ2FsbHMsIDEpO1xuICBhc3NlcnQuZXF1YWwoZW5naW5lTW92ZVJlc3VsdC5pZ25vcmVkLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChiYWNrZ3JvdW5kUmVzdWx0Lmlnbm9yZWQsIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGJhY2tncm91bmRSZXN1bHQuYW5hbHl6ZWRGZW4sICdmZW4tc2hhcmVkJyk7XG5cbiAgZW5naW5lLmluaXRpYWxpemUgPSBvcmlnaW5hbEluaXRpYWxpemU7XG4gIHN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gb3JpZ2luYWxBbmFseXplO1xuICBzdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9IG9yaWdpbmFsQ29uZmlndXJlO1xuICBzdG9ja2Zpc2hTZXJ2aWNlLnN0b3AgPSBvcmlnaW5hbFN0b3A7XG59KTtcblxudGVzdCgncmVzdG9yZWQgbW92ZSBhbm5vdGF0aW9ucyBwcmVzZXJ2ZSBicmlsbGlhbnQgdW5kby9yZWRvIHRyYWNraW5nIGFmdGVyIHJlc3RhcnQnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IEJvYXJkVmlld01vZGVsLCBib2FyZFZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCdwZXJzaXN0RW5naW5lQ29uZmlnJywgdHJ1ZSk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsIHRydWUpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWUoMik7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgY29uc3QgbW92ZUFwcGxpZWQgPSBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnZTJlNCcsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChtb3ZlQXBwbGllZCwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuXG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC51bmRvU2luZ2xlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmNhblJlZG8sIHRydWUpO1xuXG4gIGNvbnN0IHJlc3RvcmVkQm9hcmQgPSBuZXcgQm9hcmRWaWV3TW9kZWwoKTtcbiAgYXNzZXJ0LmVxdWFsKHJlc3RvcmVkQm9hcmQuY2FuUmVkbywgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuXG4gIGFzc2VydC5lcXVhbChyZXN0b3JlZEJvYXJkLnJlZG9TaW5nbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuICBhc3NlcnQuZGVlcEVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVOdW1iZXJzLCBbMV0pO1xuXG4gIGFzc2VydC5lcXVhbChyZXN0b3JlZEJvYXJkLnVuZG9TaW5nbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xufSk7XG5cbnRlc3QoJ2NhY2hlLWhpdCBpbmRpY2F0b3IgcmVmbGVjdHMgd2hldGhlciBhbmFseXNpcyBjYW1lIGZyb20gY2FjaGUnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IEVuZ2luZVZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBzdG9ja2Zpc2hTZXJ2aWNlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvc3RvY2tmaXNoLnNlcnZpY2UnKTtcbiAgY29uc3QgeyBhbmFseXNpc0NhY2hlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvYW5hbHlzaXNDYWNoZScpO1xuICBjb25zdCBlbmdpbmUgPSBuZXcgRW5naW5lVmlld01vZGVsKCk7XG5cbiAgY29uc3Qgb3JpZ2luYWxJbml0aWFsaXplID0gZW5naW5lLmluaXRpYWxpemUuYmluZChlbmdpbmUpO1xuICBjb25zdCBvcmlnaW5hbEFuYWx5emUgPSBzdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbi5iaW5kKHN0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbENvbmZpZ3VyZSA9IHN0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlLmJpbmQoc3RvY2tmaXNoU2VydmljZSk7XG5cbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlTW92ZUFuYWx5c2lzQ2FjaGUnLCB0cnVlKTtcbiAgYW5hbHlzaXNDYWNoZS5pbnZhbGlkYXRlKCk7XG5cbiAgZW5naW5lLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IGFzeW5jICgpID0+IHVuZGVmaW5lZDtcbiAgc3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIHN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uID0gYXN5bmMgKCkgPT4gW1xuICAgIHtcbiAgICAgIG1vdmU6ICdlMmU0JyxcbiAgICAgIGV2YWx1YXRpb246IDM1LFxuICAgICAgZXZhbExvc3M6IDAsXG4gICAgICBwdjogWydlMmU0J10sXG4gICAgICBtdWx0aXB2OiAxLFxuICAgICAgZGVwdGg6IDEyLFxuICAgIH0sXG4gIF07XG5cbiAgY29uc3QgZmlyc3QgPSBhd2FpdCBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tY2FjaGUnLCAxMiwgMiwgJ2JhY2tncm91bmQnKTtcbiAgY29uc3Qgc2Vjb25kID0gYXdhaXQgZW5naW5lLmFuYWx5emVQb3NpdGlvbignZmVuLWNhY2hlJywgMTIsIDIsICdiYWNrZ3JvdW5kJyk7XG5cbiAgYXNzZXJ0LmVxdWFsKGZpcnN0LmZyb21DYWNoZSwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoc2Vjb25kLmZyb21DYWNoZSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChlbmdpbmUubGFzdEFuYWx5c2lzRnJvbUNhY2hlLCB0cnVlKTtcblxuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IG9yaWdpbmFsSW5pdGlhbGl6ZTtcbiAgc3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBvcmlnaW5hbEFuYWx5emU7XG4gIHN0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gb3JpZ2luYWxDb25maWd1cmU7XG59KTtcblxudGVzdCgncGVyc29uYSBwcm9maWxlcyBzYXZlIGFuZCBsb2FkIHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24gc25hcHNob3QnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IERFRkFVTFRfQlVDS0VUX0NPTkZJRyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3R5cGVzJyk7XG4gIGNvbnN0IHsgREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9mZWF0dXJlT3B0aW9ucycpO1xuXG4gIGxldCBhcHBsaWVkQ29uZmlnOiB1bmtub3duID0gbnVsbDtcbiAgbGV0IGFwcGxpZWRGZWF0dXJlT3B0aW9uczogdW5rbm93biA9IG51bGw7XG4gIGxldCBhcHBsaWVkQnJpbGxpYW50U2V0dGluZ3M6IHVua25vd24gPSBudWxsO1xuICBsZXQgYXBwbGllZFVpOiB1bmtub3duID0gbnVsbDtcblxuICBjb25zdCBwcm9maWxlcyA9IG5ldyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwoe1xuICAgIGNvbmZpZ1ZpZXdNb2RlbDoge1xuICAgICAgYnVja2V0Q29uZmlnOiB7XG4gICAgICAgIC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgICAgICAgYmVzdDogMjgsXG4gICAgICAgIGdyZWF0OiAyMixcbiAgICAgIH0sXG4gICAgICBjdXJyZW50UHJlc2V0SWQ6ICdhZ2dyZXNzaXZlJyxcbiAgICAgIGRlcHRoOiAxMyxcbiAgICAgIG11bHRpUFY6IDcsXG4gICAgICBhcHBseVByb2ZpbGVTbmFwc2hvdDogKHNuYXBzaG90KSA9PiB7XG4gICAgICAgIGFwcGxpZWRDb25maWcgPSBzbmFwc2hvdDtcbiAgICAgIH0sXG4gICAgfSxcbiAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbDoge1xuICAgICAgb3B0aW9uczoge1xuICAgICAgICAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyxcbiAgICAgICAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogdHJ1ZSxcbiAgICAgICAgdXNlTW92ZUFuYWx5c2lzQ2FjaGU6IGZhbHNlLFxuICAgICAgICB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0OiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMyxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ21pZGRsZWdhbWUnLFxuICAgICAgYXBwbHlQcm9maWxlU2V0dGluZ3M6IChvcHRpb25zLCBicmlsbGlhbnQpID0+IHtcbiAgICAgICAgYXBwbGllZEZlYXR1cmVPcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgYXBwbGllZEJyaWxsaWFudFNldHRpbmdzID0gYnJpbGxpYW50O1xuICAgICAgfSxcbiAgICB9LFxuICAgIHVpU3RhdGVWaWV3TW9kZWw6IHtcbiAgICAgIHRoZW1lTW9kZTogJ3BlcnNvbmEnLFxuICAgICAgYmFzaWNNb2RlOiBmYWxzZSxcbiAgICAgIGFwcGx5UHJvZmlsZVByZWZlcmVuY2VzOiAocHJlZmVyZW5jZXMpID0+IHtcbiAgICAgICAgYXBwbGllZFVpID0gcHJlZmVyZW5jZXM7XG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIHByb2ZpbGVzLnNldFByb2ZpbGVOYW1lRHJhZnQoJ1NoYXJwIFRhY3RpY2lhbicpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMuc2F2ZUN1cnJlbnRQcm9maWxlKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXMubGVuZ3RoLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5uYW1lLCAnU2hhcnAgVGFjdGljaWFuJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8uc2V0dGluZ3MuZGVwdGgsIDEzKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy5mZWF0dXJlT3B0aW9ucy51c2VEZXRlcm1pbmlzdGljUm5nLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy5icmlsbGlhbnQuYnJpbGxpYW50TW92ZXNQZXJHYW1lLCAzKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy51aS50aGVtZU1vZGUsICdwZXJzb25hJyk7XG5cbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLmxvYWRTZWxlY3RlZFByb2ZpbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoYXBwbGllZENvbmZpZywge1xuICAgIGJ1Y2tldENvbmZpZzoge1xuICAgICAgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICAgICAgYmVzdDogMjgsXG4gICAgICBncmVhdDogMjIsXG4gICAgfSxcbiAgICBjdXJyZW50UHJlc2V0SWQ6ICdhZ2dyZXNzaXZlJyxcbiAgICBkZXB0aDogMTMsXG4gICAgbXVsdGlQVjogNyxcbiAgfSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoYXBwbGllZEZlYXR1cmVPcHRpb25zLCB7XG4gICAgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gICAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogdHJ1ZSxcbiAgICB1c2VNb3ZlQW5hbHlzaXNDYWNoZTogZmFsc2UsXG4gICAgdXNlQnJpbGxpYW50TW92ZUJ1ZGdldDogdHJ1ZSxcbiAgfSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoYXBwbGllZEJyaWxsaWFudFNldHRpbmdzLCB7XG4gICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAzLFxuICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ21pZGRsZWdhbWUnLFxuICB9KTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChhcHBsaWVkVWksIHtcbiAgICB0aGVtZU1vZGU6ICdwZXJzb25hJyxcbiAgICBiYXNpY01vZGU6IGZhbHNlLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdwZXJzb25hIHByb2ZpbGUgaW1wb3J0IHZhbGlkYXRlcyBKU09OIHNhZmVseSBhbmQgZGVkdXBsaWNhdGVzIG5hbWVzJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBERUZBVUxUX0JVQ0tFVF9DT05GSUcgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS90eXBlcycpO1xuICBjb25zdCB7IERFRkFVTFRfRkVBVFVSRV9PUFRJT05TIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvZmVhdHVyZU9wdGlvbnMnKTtcblxuICBjb25zdCBwcm9maWxlcyA9IG5ldyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwoe1xuICAgIGNvbmZpZ1ZpZXdNb2RlbDoge1xuICAgICAgYnVja2V0Q29uZmlnOiB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyB9LFxuICAgICAgY3VycmVudFByZXNldElkOiAnbWVkaXVtJyxcbiAgICAgIGRlcHRoOiA4LFxuICAgICAgbXVsdGlQVjogMTIsXG4gICAgICBhcHBseVByb2ZpbGVTbmFwc2hvdDogKCkgPT4gdW5kZWZpbmVkLFxuICAgIH0sXG4gICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWw6IHtcbiAgICAgIG9wdGlvbnM6IHsgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfSxcbiAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogMCxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ2FueScsXG4gICAgICBhcHBseVByb2ZpbGVTZXR0aW5nczogKCkgPT4gdW5kZWZpbmVkLFxuICAgIH0sXG4gICAgdWlTdGF0ZVZpZXdNb2RlbDoge1xuICAgICAgdGhlbWVNb2RlOiAnZGFyaycsXG4gICAgICBiYXNpY01vZGU6IHRydWUsXG4gICAgICBhcHBseVByb2ZpbGVQcmVmZXJlbmNlczogKCkgPT4gdW5kZWZpbmVkLFxuICAgIH0sXG4gIH0pO1xuXG4gIHByb2ZpbGVzLnNldFByb2ZpbGVOYW1lRHJhZnQoJ0JhbGFuY2VkJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5zYXZlQ3VycmVudFByb2ZpbGUoKSwgdHJ1ZSk7XG5cbiAgcHJvZmlsZXMuc2V0RXhjaGFuZ2VKc29uKCd7YmFkIGpzb24nKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLmltcG9ydFByb2ZpbGVGcm9tSnNvbigpLCBmYWxzZSk7XG4gIGFzc2VydC5tYXRjaChwcm9maWxlcy5pbXBvcnRFcnJvciwgL2NvdWxkIG5vdCBiZSBwYXJzZWQvaSk7XG5cbiAgcHJvZmlsZXMuc2V0RXhjaGFuZ2VKc29uKFxuICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGtpbmQ6ICdwZXJzb25hY2hlc3MucGVyc29uYS1wcm9maWxlJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBuYW1lOiAnQmFsYW5jZWQnLFxuICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgYnVja2V0Q29uZmlnOiBERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gICAgICAgIGN1cnJlbnRQcmVzZXRJZDogJ2hhcmQnLFxuICAgICAgICBkZXB0aDogMTUsXG4gICAgICAgIG11bHRpUFY6IDQsXG4gICAgICAgIGZlYXR1cmVPcHRpb25zOiB7XG4gICAgICAgICAgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMsXG4gICAgICAgICAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgYnJpbGxpYW50OiB7XG4gICAgICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAyLFxuICAgICAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ2VuZGdhbWUnLFxuICAgICAgICB9LFxuICAgICAgICB1aToge1xuICAgICAgICAgIHRoZW1lTW9kZTogJ2xpZ2h0JyxcbiAgICAgICAgICBiYXNpY01vZGU6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSxcbiAgKTtcblxuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMuaW1wb3J0UHJvZmlsZUZyb21Kc29uKCksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXMubGVuZ3RoLCAyKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5uYW1lLCAnQmFsYW5jZWQgMicpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLmN1cnJlbnRQcmVzZXRJZCwgJ2hhcmQnKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy51aS50aGVtZU1vZGUsICdsaWdodCcpO1xufSk7XG5cbnRlc3QoJ2dhbWUgc2V0dXAgcHJlc2V0cyByZW1haW4gc2VhcmNoYWJsZSBhbmQgY29tcGF0aWJsZSB3aXRoIHRoZSBleGlzdGluZyBvcGVuaW5nIGxpYnJhcnknLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgUFJFREVGSU5FRF9PUEVOSU5HUyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL29wZW5pbmdzJyk7XG4gIGNvbnN0IHtcbiAgICBHQU1FX1NFVFVQX1BSRVNFVFMsXG4gICAgZmlsdGVyR2FtZVNldHVwUHJlc2V0cyxcbiAgICB0b0NvbXBhdGlibGVPcGVuaW5nUHJlc2V0LFxuICB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2dhbWVTZXR1cFByZXNldHMnKTtcblxuICBhc3NlcnQub2soR0FNRV9TRVRVUF9QUkVTRVRTLmxlbmd0aCA+PSBQUkVERUZJTkVEX09QRU5JTkdTLmxlbmd0aCk7XG5cbiAgY29uc3QgZmlsdGVyZWQgPSBmaWx0ZXJHYW1lU2V0dXBQcmVzZXRzKEdBTUVfU0VUVVBfUFJFU0VUUywgJ29wZW5pbmdzJywgJ3NpY2lsaWFuJyk7XG4gIGFzc2VydC5lcXVhbChmaWx0ZXJlZC5sZW5ndGgsIDEpO1xuICBhc3NlcnQubWF0Y2goZmlsdGVyZWRbMF0/Lm5hbWUgPz8gJycsIC9zaWNpbGlhbi9pKTtcblxuICBjb25zdCBvcGVuaW5nUHJlc2V0ID0gdG9Db21wYXRpYmxlT3BlbmluZ1ByZXNldChQUkVERUZJTkVEX09QRU5JTkdTWzBdPy5pZCA/PyAnJyk7XG4gIGFzc2VydC5lcXVhbChvcGVuaW5nUHJlc2V0Py5zb3VyY2VUeXBlLCAncGduJyk7XG4gIGFzc2VydC5lcXVhbChvcGVuaW5nUHJlc2V0Py5zb3VyY2UsIFBSRURFRklORURfT1BFTklOR1NbMF0/LnBnbik7XG59KTtcblxudGVzdCgnbG9hZGluZyBhIGdhbWUgc2V0dXAgcHJlc2V0IHJlc2V0cyBzZXNzaW9uIHN0YXRlIGFuZCBicmlsbGlhbnQgdHJhY2tpbmcnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IGJvYXJkVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IGdldEdhbWVTZXR1cFByZXNldEJ5SWQgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9nYW1lU2V0dXBQcmVzZXRzJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlQnJpbGxpYW50TW92ZUJ1ZGdldCcsIHRydWUpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRCcmlsbGlhbnRNb3Zlc1BlckdhbWUoMik7XG5cbiAgY29uc3QgYmFzZWxpbmVTZXNzaW9uSWQgPSBib2FyZFZpZXdNb2RlbC5kZWJ1Z1Nlc3Npb25JZDtcbiAgYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2UyZTQnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcblxuICBjb25zdCBwcmVzZXQgPSBnZXRHYW1lU2V0dXBQcmVzZXRCeUlkKCdpdGFsaWFuJyk7XG4gIGFzc2VydC5vayhwcmVzZXQpO1xuICBpZiAoIXByZXNldCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgaXRhbGlhbiBwcmVzZXQgdG8gZXhpc3QnKTtcbiAgfVxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwubG9hZEdhbWVTZXR1cFByZXNldChwcmVzZXQpLCB0cnVlKTtcbiAgYXNzZXJ0Lm5vdEVxdWFsKGJvYXJkVmlld01vZGVsLmRlYnVnU2Vzc2lvbklkLCBiYXNlbGluZVNlc3Npb25JZCk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuICBhc3NlcnQubWF0Y2goYm9hcmRWaWV3TW9kZWwuc3RhdHVzTWVzc2FnZSwgL2l0YWxpYW4vaSk7XG59KTtcblxudGVzdCgnZ2FtZSBhbmFseXRpY3Mgc3VtbWFyeSBhZ2dyZWdhdGVzIHF1YWxpdHksIHRpbWluZywgY29tcGxleGl0eSwgYW5kIGhpZ2hsaWdodHMnLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2dhbWVBbmFseXRpY3MnKTtcblxuICBjb25zdCBzdW1tYXJ5ID0gYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSh7XG4gICAgc2Vzc2lvbklkOiAnc2Vzc2lvbl90ZXN0JyxcbiAgICBjcmVhdGVkQXRNczogMTAwMCxcbiAgICBmaW5pc2hlZEF0TXM6IDkwMDAsXG4gICAgZ2FtZVN0YXR1czogJ0NoZWNrbWF0ZSEgV2hpdGUgd2lucycsXG4gICAgcGVyc29uYUlkOiAnYWdncmVzc2l2ZScsXG4gICAgcGVyc29uYUxhYmVsOiAnQWdncmVzc2l2ZScsXG4gICAgc2V0dXBOYW1lOiAnSXRhbGlhbiBHYW1lJyxcbiAgICBzZXR1cENhdGVnb3J5OiAnb3BlbmluZ3MnLFxuICAgIGF1dG9wbGF5RHVyYXRpb25NczogMjYwMCxcbiAgICBwZ246ICcxLiBlNCBlNSAqJyxcbiAgICBtb3ZlQW5ub3RhdGlvbnM6IFtcbiAgICAgIHtcbiAgICAgICAgYmVmb3JlRmVuOiAnYScsXG4gICAgICAgIGFmdGVyRmVuOiAnYicsXG4gICAgICAgIHVjaTogJ2UyZTQnLFxuICAgICAgICBtb3ZlTnVtYmVyOiAxLFxuICAgICAgICBjb25zdW1lZEJyaWxsaWFudDogZmFsc2UsXG4gICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgc2FuOiAnZTQnLFxuICAgICAgICBidWNrZXQ6ICdnb29kJyxcbiAgICAgICAgZXZhbExvc3M6IDQyLFxuICAgICAgICBldmFsdWF0aW9uOiAxOCxcbiAgICAgICAgY29tcGxleGl0eUxldmVsOiAnbWVkaXVtJyxcbiAgICAgICAgY29tcGxleGl0eVNjb3JlOiAwLjUsXG4gICAgICAgIHRpbWVzdGFtcDogMjAwMCxcbiAgICAgICAgZGVsYXlNc1NpbmNlUHJldmlvdXM6IDcwMCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZm9yZUZlbjogJ2InLFxuICAgICAgICBhZnRlckZlbjogJ2MnLFxuICAgICAgICB1Y2k6ICdlN2U1JyxcbiAgICAgICAgbW92ZU51bWJlcjogMSxcbiAgICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUsXG4gICAgICAgIGFjdG9yOiAnZW5naW5lJyxcbiAgICAgICAgc2FuOiAnZTUrJyxcbiAgICAgICAgYnVja2V0OiAnYmVzdCcsXG4gICAgICAgIGV2YWxMb3NzOiAwLFxuICAgICAgICBldmFsdWF0aW9uOiAzMixcbiAgICAgICAgY29tcGxleGl0eUxldmVsOiAnaGlnaCcsXG4gICAgICAgIGNvbXBsZXhpdHlTY29yZTogMC44LFxuICAgICAgICB0aW1lc3RhbXA6IDI4MDAsXG4gICAgICAgIGRlbGF5TXNTaW5jZVByZXZpb3VzOiA4MDAsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBiZWZvcmVGZW46ICdjJyxcbiAgICAgICAgYWZ0ZXJGZW46ICdkJyxcbiAgICAgICAgdWNpOiAnZzFmMycsXG4gICAgICAgIG1vdmVOdW1iZXI6IDIsXG4gICAgICAgIGNvbnN1bWVkQnJpbGxpYW50OiBmYWxzZSxcbiAgICAgICAgYWN0b3I6ICdwbGF5ZXInLFxuICAgICAgICBzYW46ICdOZjMnLFxuICAgICAgICBidWNrZXQ6ICdtaXN0YWtlJyxcbiAgICAgICAgZXZhbExvc3M6IDMxMCxcbiAgICAgICAgZXZhbHVhdGlvbjogLTkwLFxuICAgICAgICBjb21wbGV4aXR5TGV2ZWw6ICdsb3cnLFxuICAgICAgICBjb21wbGV4aXR5U2NvcmU6IDAuMixcbiAgICAgICAgdGltZXN0YW1wOiA0MzAwLFxuICAgICAgICBkZWxheU1zU2luY2VQcmV2aW91czogMTUwMCxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSk7XG5cbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucmVzdWx0LCAnV2hpdGUgd29uJyk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmJyaWxsaWFudE1vdmVzLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkubW92ZUNvdW50LCAzKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucXVhbGl0eUNvdW50cy5iZXN0LCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucXVhbGl0eUNvdW50cy5nb29kLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkucXVhbGl0eUNvdW50cy5taXN0YWtlLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuYXZlcmFnZUV2YWxMb3NzLCAxMTcuMyk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmF2ZXJhZ2VNb3ZlRGVsYXlNcywgMTAwMCk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmNvbXBsZXhpdHlEaXN0cmlidXRpb24ubG93LCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuY29tcGxleGl0eURpc3RyaWJ1dGlvbi5tZWRpdW0sIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5jb21wbGV4aXR5RGlzdHJpYnV0aW9uLmhpZ2gsIDEpO1xuICBhc3NlcnQuZXF1YWwoc3VtbWFyeS5oaWdobGlnaHRlZEJyaWxsaWFudE1vdmVzLmxlbmd0aCwgMSk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5Lm1ham9yTWlzdGFrZXMubGVuZ3RoLCAxKTtcbiAgYXNzZXJ0LmVxdWFsKHN1bW1hcnkuZXZhbFRyZW5kLmxlbmd0aCwgMyk7XG4gIGFzc2VydC5lcXVhbChzdW1tYXJ5LmNvbXBsZXhpdHlUcmVuZC5sZW5ndGgsIDMpO1xufSk7XG5cbnRlc3QoJ2dhbWUgYW5hbHl0aWNzIHZpZXdtb2RlbCBzdG9yZXMgY29tcGxldGVkIHNlc3Npb25zIGluIHJlY2VudCBnYW1lcycsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgR2FtZUFuYWx5dGljc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGNvbnN0IGFuYWx5dGljcyA9IG5ldyBHYW1lQW5hbHl0aWNzVmlld01vZGVsKHtcbiAgICBib2FyZFZpZXdNb2RlbDoge1xuICAgICAgZGVidWdTZXNzaW9uSWQ6ICdzZXNzaW9uX2NhcHR1cmUnLFxuICAgICAgbW92ZUFubm90YXRpb25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBiZWZvcmVGZW46ICdhJyxcbiAgICAgICAgICBhZnRlckZlbjogJ2InLFxuICAgICAgICAgIHVjaTogJ2UyZTQnLFxuICAgICAgICAgIG1vdmVOdW1iZXI6IDEsXG4gICAgICAgICAgY29uc3VtZWRCcmlsbGlhbnQ6IGZhbHNlLFxuICAgICAgICAgIGFjdG9yOiAncGxheWVyJyxcbiAgICAgICAgICBzYW46ICdlNCcsXG4gICAgICAgICAgYnVja2V0OiAnZ29vZCcsXG4gICAgICAgICAgZXZhbExvc3M6IDQwLFxuICAgICAgICAgIGV2YWx1YXRpb246IDE1LFxuICAgICAgICAgIGNvbXBsZXhpdHlMZXZlbDogJ21lZGl1bScsXG4gICAgICAgICAgY29tcGxleGl0eVNjb3JlOiAwLjQ1LFxuICAgICAgICAgIHRpbWVzdGFtcDogMTAwMCxcbiAgICAgICAgICBkZWxheU1zU2luY2VQcmV2aW91czogNjAwLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHNlc3Npb25TdGFydGVkQXQ6IDAsXG4gICAgICBnYW1lU3RhdHVzOiAnRHJhdyEnLFxuICAgICAgcGduOiAnMS4gZTQgKicsXG4gICAgICBjdXJyZW50U2V0dXBOYW1lOiAnQ3VzdG9tIFBvc2l0aW9uJyxcbiAgICAgIGN1cnJlbnRTZXR1cENhdGVnb3J5OiAnY3VzdG9tJyxcbiAgICAgIGF1dG9QbGF5QWN0aXZlRHVyYXRpb25NczogOTAwLFxuICAgICAgaXNHYW1lT3ZlcjogdHJ1ZSxcbiAgICB9LFxuICAgIGNvbmZpZ1ZpZXdNb2RlbDoge1xuICAgICAgYWN0aXZlUGVyc29uYUlkOiAnbWVkaXVtJyxcbiAgICAgIGFjdGl2ZVBlcnNvbmFMYWJlbDogJ01lZGl1bScsXG4gICAgfSxcbiAgfSk7XG5cbiAgYW5hbHl0aWNzLmNhcHR1cmVDb21wbGV0ZWRHYW1lKCk7XG5cbiAgYXNzZXJ0LmVxdWFsKGFuYWx5dGljcy5yZWNlbnRHYW1lcy5sZW5ndGgsIDEpO1xuICBhc3NlcnQuZXF1YWwoYW5hbHl0aWNzLnJlY2VudEdhbWVzWzBdPy5zZXNzaW9uSWQsICdzZXNzaW9uX2NhcHR1cmUnKTtcbiAgYXNzZXJ0LmVxdWFsKGFuYWx5dGljcy5yZWNlbnRHYW1lRW50cmllc1swXT8ucGVyc29uYUxhYmVsLCAnTWVkaXVtJyk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FB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aUI7QUFDbkUsU0FBTyxNQUFNLFVBQVUsa0JBQWtCLENBQUMsR0FBRyxjQUFjLFFBQVE7QUFDckUsQ0FBQzsiLAogICJuYW1lcyI6IFsiQ2hlc3MiLCAiUElFQ0VfVkFMVUVTIiwgIkJVQ0tFVF9PUkRFUiIsICJDaGVzcyIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgImxvZ2dlciIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgInJlYWN0aW9uIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJyZWFjdGlvbiIsICJydW5JbkFjdGlvbiIsICJDaGVzcyIsICJsb2dnZXIiLCAicGduIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAicmVhY3Rpb24iLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJhY3Rpb24iLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiY2FuQXBwbHlBbmFseXplZE1vdmUiLCAiaXNTdGFsZUFuYWx5c2lzUmVxdWVzdCIsICJBbmFseXNpc0NhY2hlIiwgImJ1aWxkQW5hbHlzaXNDYWNoZUtleSIsICJidWlsZERldGVybWluaXN0aWNTZWVkIiwgImNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZSIsICJyZXNvbHZlUGduU3RhcnRGZW4iLCAiZGVyaXZlQnJpbGxpYW50VXNhZ2UiLCAiYm9hcmRWaWV3TW9kZWwiLCAiZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwiLCAiUFJFREVGSU5FRF9PUEVOSU5HUyIsICJlbmdpbmVWaWV3TW9kZWwiLCAiY29uZmlnVmlld01vZGVsIiwgIkVuZ2luZVZpZXdNb2RlbCIsICJzdG9ja2Zpc2hTZXJ2aWNlIiwgIkJvYXJkVmlld01vZGVsIiwgImFuYWx5c2lzQ2FjaGUiLCAiUGVyc29uYVByb2ZpbGVzVmlld01vZGVsIiwgIkRFRkFVTFRfQlVDS0VUX0NPTkZJRyIsICJERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyIsICJHQU1FX1NFVFVQX1BSRVNFVFMiLCAiZmlsdGVyR2FtZVNldHVwUHJlc2V0cyIsICJ0b0NvbXBhdGlibGVPcGVuaW5nUHJlc2V0IiwgImdldEdhbWVTZXR1cFByZXNldEJ5SWQiLCAiYnVpbGRHYW1lQW5hbHl0aWNzU3VtbWFyeSIsICJHYW1lQW5hbHl0aWNzVmlld01vZGVsIl0KfQo=
