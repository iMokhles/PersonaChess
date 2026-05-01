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

// src/viewmodels/BoardViewModel.ts
import { makeAutoObservable as makeAutoObservable4, action as action4, reaction as reaction3, runInAction as runInAction2 } from "mobx";
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
    logger3 = createDebugLogger("BoardViewModel");
    BoardViewModel = class {
      chess = new Chess4();
      fen = this.chess.fen();
      gameStartFen = this.chess.fen();
      gameSessionId = createGameSessionId();
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
      // Store analyzed moves as an object for MobX observability
      _analyzedLegalMoves = {};
      redoStack = [];
      // Stack of moves that were undone for redo functionality
      historyAnnotations = [];
      redoAnnotations = [];
      analyzedLegalMovesFen = null;
      _analysisTimeout = null;
      // Timeout for debouncing move analysis
      FEN_STORAGE_KEY = "personachess_current_fen";
      FEN_HISTORY_KEY = "personachess_fen_history";
      BOARD_STATE_STORAGE_KEY = "personachess_board_state";
      MAX_HISTORY = 50;
      // Maximum number of FEN positions to store
      constructor() {
        makeAutoObservable4(this, {
          loadFen: action4,
          loadPgn: action4,
          makeMove: action4,
          solveNextMove: action4,
          reset: action4,
          undo: action4,
          undoSingle: action4,
          redoSingle: action4,
          setAutoPlay: action4,
          setEnginePlaysFor: action4,
          flipBoard: action4,
          setBoardFlipped: action4,
          saveFenToHistory: action4,
          loadFenFromHistory: action4,
          toggleMoveArrows: action4,
          setShowMoveArrowsEnabled: action4,
          setShowArrowsForSide: action4,
          analyzeAllMoves: action4,
          analyzePlayerMove: action4
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
        this.autoPlayEnabled = enabled;
        logger3.debug("Auto-play set to:", enabled);
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
            redoAnnotations
          } = options;
          logger3.debug("loadFen called:", fen);
          const newChess = new Chess4(fen);
          this.chess = newChess;
          this.beginSessionState({
            gameSessionId: sessionId ?? createGameSessionId(),
            gameStartFen: gameStartFen ?? fen,
            resetBrilliantTracking,
            historyAnnotations,
            redoAnnotations
          });
          this.updateState();
          this.statusMessage = "Position loaded";
          this.lastSkippedEngineMoveMessage = null;
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
          const { resetBrilliantTracking = true, sessionId } = options;
          logger3.debug("loadPgn called");
          const newChess = new Chess4();
          newChess.loadPgn(pgn2);
          const gameStartFen = resolvePgnStartFen(newChess.header(), new Chess4().fen());
          this.chess = newChess;
          this.beginSessionState({
            gameSessionId: sessionId ?? createGameSessionId(),
            gameStartFen,
            resetBrilliantTracking
          });
          this.updateState();
          this.statusMessage = "PGN loaded";
          this.lastSkippedEngineMoveMessage = null;
          engineViewModel.reset();
          return true;
        } catch (err) {
          logger3.error("loadPgn error:", err);
          this.statusMessage = `Invalid PGN: ${err}`;
          return false;
        }
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
            this.recordMoveAnnotation(move, false);
            this.updateState();
            this.lastMove = { from, to };
            this.lastPlayedBucket = null;
            this.statusMessage = `You played: ${move.san}`;
            engineViewModel.reset();
            this.lastSkippedEngineMoveMessage = null;
            this.analyzePlayerMove(move);
            if (this.autoPlayEnabled && !this.isGameOver && this.chess.turn() === this.enginePlaysFor) {
              logger3.debug("Scheduling auto-play for engine side:", this.enginePlaysFor);
              setTimeout(() => {
                this.solveNextMove(true).catch((err) => {
                  logger3.error("Auto-play error:", err);
                });
              }, 500);
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
            this.recordMoveAnnotation(move, options.consumedBrilliant ?? false);
            this.updateState();
            this.lastMove = { from, to };
            this.lastPlayedBucket = null;
            this.statusMessage = `Engine played: ${move.san}`;
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
          resetBrilliantTracking: true
        });
        this.updateState();
        this.lastMove = null;
        this.lastPlayedBucket = null;
        this.statusMessage = "Board reset";
        this.lastSkippedEngineMoveMessage = null;
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
                  redoAnnotations: restoredBoardState.redoAnnotations
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
              });
              logger3.debug("Player move quality:", analyzedMove.bucket);
            } else {
              runInAction2(() => {
                if (featureOptionsViewModel.useImprovedMoveClassification) {
                  this.lastPlayerMoveQuality = "fallback";
                  this.statusMessage = `You played: ${move.san} (Fallback move)`;
                } else {
                  this.lastPlayerMoveQuality = "good";
                  this.statusMessage = `You played: ${move.san} (Good)`;
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
              annotationToRedo ?? this.createMoveAnnotation(move, false)
            );
            this.syncBrilliantTrackingFromAnnotations();
            this.updateState();
            this.lastMove = { from: move.from, to: move.to };
            this.lastPlayedBucket = null;
            this.statusMessage = `Redid: ${move.san}`;
            engineViewModel.reset();
            logger3.debug("Redid 1 move");
            if (this.autoPlayEnabled && !this.isGameOver && this.chess.turn() === this.enginePlaysFor) {
              logger3.debug("Scheduling auto-play after redo");
              setTimeout(() => {
                this.solveNextMove(true).catch((err) => {
                  logger3.error("Auto-play error after redo:", err);
                });
              }, 500);
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
      beginSessionState(options) {
        this.gameSessionId = options.gameSessionId;
        this.gameStartFen = options.gameStartFen;
        this.historyAnnotations = [...options.historyAnnotations ?? []];
        this.redoAnnotations = [...options.redoAnnotations ?? []];
        this.redoStack = this.createRedoStackFromAnnotations(this.redoAnnotations);
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
      createMoveAnnotation(move, consumedBrilliant) {
        return {
          beforeFen: move.before ?? this.fen,
          afterFen: move.after ?? this.chess.fen(),
          uci: `${move.from}${move.to}${move.promotion || ""}`,
          moveNumber: this.chess.moveNumber(),
          consumedBrilliant
        };
      }
      recordMoveAnnotation(move, consumedBrilliant) {
        this.historyAnnotations.push(this.createMoveAnnotation(move, consumedBrilliant));
        this.syncBrilliantTrackingFromAnnotations();
      }
      syncBrilliantTrackingFromAnnotations() {
        const usage = deriveBrilliantUsage(this.historyAnnotations);
        featureOptionsViewModel.reconcileBrilliantTracking(
          this.gameSessionId,
          usage.brilliantMoveNumbers
        );
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

// src/viewmodels/DebugViewModel.ts
import { action as action5, makeAutoObservable as makeAutoObservable5 } from "mobx";
var DebugViewModel, debugViewModel;
var init_DebugViewModel = __esm({
  "src/viewmodels/DebugViewModel.ts"() {
    "use strict";
    init_debug();
    DebugViewModel = class {
      debugLoggingEnabled = isDebugLoggingEnabled();
      constructor() {
        makeAutoObservable5(this, {
          setDebugLoggingEnabled: action5,
          toggleDebugLogging: action5
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

// src/viewmodels/UiStateViewModel.ts
import { action as action6, makeAutoObservable as makeAutoObservable6 } from "mobx";
var BOARD_SIZE_PRESET_PIXELS, UI_PREFERENCES_STORAGE_KEY, DEFAULT_UI_PREFERENCES, UiStateViewModel, uiStateViewModel;
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
      soundEnabled: false,
      themeMode: "dark",
      boardSizePreset: "medium",
      selectedSettingsTab: "general"
    };
    UiStateViewModel = class {
      settingsOpen = false;
      loadFenOpen = false;
      loadPgnOpen = false;
      basicMode = DEFAULT_UI_PREFERENCES.basicMode;
      animationSpeed = DEFAULT_UI_PREFERENCES.animationSpeed;
      soundEnabled = DEFAULT_UI_PREFERENCES.soundEnabled;
      themeMode = DEFAULT_UI_PREFERENCES.themeMode;
      boardSizePreset = DEFAULT_UI_PREFERENCES.boardSizePreset;
      selectedSettingsTab = DEFAULT_UI_PREFERENCES.selectedSettingsTab;
      constructor() {
        makeAutoObservable6(this, {
          setSettingsOpen: action6,
          setLoadFenOpen: action6,
          setLoadPgnOpen: action6,
          applyProfilePreferences: action6,
          setBasicMode: action6,
          setAnimationSpeed: action6,
          setSoundEnabled: action6,
          setThemeMode: action6,
          setBoardSizePreset: action6,
          setSelectedSettingsTab: action6
        });
        this.restoreFromStorage();
      }
      setSettingsOpen(open) {
        this.settingsOpen = open;
      }
      setLoadFenOpen(open) {
        this.loadFenOpen = open;
      }
      setLoadPgnOpen(open) {
        this.loadPgnOpen = open;
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
import { action as action7, makeAutoObservable as makeAutoObservable7 } from "mobx";
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
        makeAutoObservable7(this, {
          setSelectedProfileId: action7,
          setProfileNameDraft: action7,
          setExchangeJson: action7,
          clearExchangeState: action7,
          saveCurrentProfile: action7,
          loadSelectedProfile: action7,
          duplicateSelectedProfile: action7,
          renameSelectedProfile: action7,
          deleteSelectedProfile: action7,
          importProfileFromJson: action7
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
  PersonaProfilesViewModel: () => PersonaProfilesViewModel,
  UiStateViewModel: () => UiStateViewModel,
  boardViewModel: () => boardViewModel,
  configViewModel: () => configViewModel,
  debugViewModel: () => debugViewModel,
  engineViewModel: () => engineViewModel,
  featureOptionsViewModel: () => featureOptionsViewModel,
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
    init_DebugViewModel();
    init_UiStateViewModel();
    init_PersonaProfilesViewModel();
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
  const { BoardViewModel: BoardViewModel2, boardViewModel: boardViewModel2, featureOptionsViewModel: featureOptionsViewModel2 } = await Promise.resolve().then(() => (init_viewmodels(), viewmodels_exports));
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
  const restoredBoard = new BoardViewModel2();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL2VuZ2luZS9hbmFseXNpc1NhZmV0eS50cyIsICIuLi8uLi9zcmMvZW5naW5lL2FuYWx5c2lzQ2FjaGUudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9yYW5kb20udHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9nYW1lU2Vzc2lvbi50cyIsICIuLi8uLi9zcmMvZW5naW5lL2JyaWxsaWFudFRyYWNraW5nLnRzIiwgIi4uLy4uL3NyYy9zaGFyZWQvZGVidWcudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZS50cyIsICIuLi8uLi9zcmMvZW5naW5lL3R5cGVzLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvbW92ZUNsYXNzaWZpZXIudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9tb3ZlUGlja2VyLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvZmVhdHVyZU9wdGlvbnMudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudHMiLCAiLi4vLi4vc3JjL2VuZ2luZS9icmlsbGlhbnRNb3ZlLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvZ2FtZVBoYXNlLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvcG9zaXRpb25Db21wbGV4aXR5LnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvcGVyc29uYUJpYXMudHMiLCAiLi4vLi4vc3JjL3ZpZXdtb2RlbHMvRW5naW5lVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL0NvbmZpZ1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9Cb2FyZFZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9EZWJ1Z1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9VaVN0YXRlVmlld01vZGVsLnRzIiwgIi4uLy4uL3NyYy9lbmdpbmUvcGVyc29uYVByb2ZpbGVzLnRzIiwgIi4uLy4uL3NyYy92aWV3bW9kZWxzL1BlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbC50cyIsICIuLi8uLi9zcmMvdmlld21vZGVscy9pbmRleC50cyIsICIuLi8uLi9zcmMvZW5naW5lL29wZW5pbmdzLnRzIiwgIi4uL3BlcnNvbmFjaGVzcy50ZXN0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgaW50ZXJmYWNlIEFuYWx5c2lzU25hcHNob3Q8VE1vdmVzPiB7XG4gIHJlcXVlc3RJZDogbnVtYmVyO1xuICBhbmFseXplZEZlbjogc3RyaW5nO1xuICBtb3ZlczogVE1vdmVzO1xufVxuXG5leHBvcnQgdHlwZSBBbmFseXNpc1B1cnBvc2UgPSAnZW5naW5lTW92ZScgfCAnYmFja2dyb3VuZCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0KFxuICByZXF1ZXN0SWQ6IG51bWJlcixcbiAgbGF0ZXN0UmVxdWVzdElkOiBudW1iZXIsXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIHJlcXVlc3RJZCAhPT0gbGF0ZXN0UmVxdWVzdElkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuQXBwbHlBbmFseXplZE1vdmUoXG4gIGN1cnJlbnRGZW46IHN0cmluZyxcbiAgYW5hbHl6ZWRGZW46IHN0cmluZyxcbik6IGJvb2xlYW4ge1xuICByZXR1cm4gY3VycmVudEZlbiA9PT0gYW5hbHl6ZWRGZW47XG59XG4iLCAiaW1wb3J0IHsgQW5hbHl6ZWRNb3ZlLCBDbGFzc2lmaWVkTW92ZSB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFuYWx5c2lzQ2FjaGVFbnRyeSB7XG4gIGtleTogc3RyaW5nO1xuICBtb3ZlczogQW5hbHl6ZWRNb3ZlW107XG4gIGNsYXNzaWZpZWRNb3Zlcz86IENsYXNzaWZpZWRNb3ZlW107XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRBbmFseXNpc0NhY2hlS2V5KFxuICBmZW46IHN0cmluZyxcbiAgZGVwdGg6IG51bWJlcixcbiAgbXVsdGlQVjogbnVtYmVyLFxuKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke2Zlbn18ZGVwdGg6JHtkZXB0aH18bXVsdGlwdjoke211bHRpUFZ9YDtcbn1cblxuZXhwb3J0IGNsYXNzIEFuYWx5c2lzQ2FjaGUge1xuICBwcml2YXRlIGVudHJpZXMgPSBuZXcgTWFwPHN0cmluZywgQW5hbHlzaXNDYWNoZUVudHJ5PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbWF4U2l6ZTogbnVtYmVyID0gMjAwKSB7fVxuXG4gIGNvbmZpZ3VyZShtYXhTaXplOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLm1heFNpemUgPSBNYXRoLm1heCgxLCBtYXhTaXplKTtcbiAgICB0aGlzLnRyaW0oKTtcbiAgfVxuXG4gIGdldChrZXk6IHN0cmluZyk6IEFuYWx5c2lzQ2FjaGVFbnRyeSB8IG51bGwge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5lbnRyaWVzLmdldChrZXkpO1xuXG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5lbnRyaWVzLmRlbGV0ZShrZXkpO1xuICAgIHRoaXMuZW50cmllcy5zZXQoa2V5LCBlbnRyeSk7XG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cbiAgc2V0KGVudHJ5OiBBbmFseXNpc0NhY2hlRW50cnkpOiB2b2lkIHtcbiAgICB0aGlzLmVudHJpZXMuc2V0KGVudHJ5LmtleSwgZW50cnkpO1xuICAgIHRoaXMudHJpbSgpO1xuICB9XG5cbiAgaW52YWxpZGF0ZShrZXk/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoa2V5KSB7XG4gICAgICB0aGlzLmVudHJpZXMuZGVsZXRlKGtleSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5lbnRyaWVzLmNsZWFyKCk7XG4gIH1cblxuICBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXMuc2l6ZTtcbiAgfVxuXG4gIHByaXZhdGUgdHJpbSgpOiB2b2lkIHtcbiAgICB3aGlsZSAodGhpcy5lbnRyaWVzLnNpemUgPiB0aGlzLm1heFNpemUpIHtcbiAgICAgIGNvbnN0IG9sZGVzdEtleSA9IHRoaXMuZW50cmllcy5rZXlzKCkubmV4dCgpLnZhbHVlO1xuXG4gICAgICBpZiAoIW9sZGVzdEtleSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbnRyaWVzLmRlbGV0ZShvbGRlc3RLZXkpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgYW5hbHlzaXNDYWNoZSA9IG5ldyBBbmFseXNpc0NhY2hlKCk7XG4iLCAiaW1wb3J0IHsgUGVyc29uYUlkIH0gZnJvbSAnLi9mZWF0dXJlT3B0aW9ucyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmFuZG9tU291cmNlIHtcbiAgbmV4dCgpOiBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIGhhc2hTdHJpbmcoaW5wdXQ6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBoYXNoID0gMjE2NjEzNjI2MTtcblxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgaW5wdXQubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgaGFzaCBePSBpbnB1dC5jaGFyQ29kZUF0KGluZGV4KTtcbiAgICBoYXNoID0gTWF0aC5pbXVsKGhhc2gsIDE2Nzc3NjE5KTtcbiAgfVxuXG4gIHJldHVybiBoYXNoID4+PiAwO1xufVxuXG5mdW5jdGlvbiBtdWxiZXJyeTMyKHNlZWQ6IG51bWJlcik6ICgpID0+IG51bWJlciB7XG4gIGxldCB2YWx1ZSA9IHNlZWQgPj4+IDA7XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICB2YWx1ZSArPSAweDZkMmI3OWY1O1xuICAgIGxldCByZXN1bHQgPSBNYXRoLmltdWwodmFsdWUgXiAodmFsdWUgPj4+IDE1KSwgdmFsdWUgfCAxKTtcbiAgICByZXN1bHQgXj0gcmVzdWx0ICsgTWF0aC5pbXVsKHJlc3VsdCBeIChyZXN1bHQgPj4+IDcpLCByZXN1bHQgfCA2MSk7XG4gICAgcmV0dXJuICgocmVzdWx0IF4gKHJlc3VsdCA+Pj4gMTQpKSA+Pj4gMCkgLyA0Mjk0OTY3Mjk2O1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTGVnYWN5UmFuZG9tU291cmNlKCk6IFJhbmRvbVNvdXJjZSB7XG4gIHJldHVybiB7XG4gICAgbmV4dDogKCkgPT4gTWF0aC5yYW5kb20oKSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZShzZWVkOiBzdHJpbmcpOiBSYW5kb21Tb3VyY2Uge1xuICBjb25zdCBnZW5lcmF0b3IgPSBtdWxiZXJyeTMyKGhhc2hTdHJpbmcoc2VlZCkpO1xuXG4gIHJldHVybiB7XG4gICAgbmV4dDogKCkgPT4gZ2VuZXJhdG9yKCksXG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGV0ZXJtaW5pc3RpY1NlZWRDb250ZXh0IHtcbiAgZ2FtZVN0YXJ0RmVuOiBzdHJpbmc7XG4gIGN1cnJlbnRGZW46IHN0cmluZztcbiAgbW92ZUNvdW50OiBudW1iZXI7XG4gIHNpZGVUb01vdmU6ICd3JyB8ICdiJztcbiAgcGVyc29uYTogUGVyc29uYUlkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREZXRlcm1pbmlzdGljU2VlZCh7XG4gIGdhbWVTdGFydEZlbixcbiAgY3VycmVudEZlbixcbiAgbW92ZUNvdW50LFxuICBzaWRlVG9Nb3ZlLFxuICBwZXJzb25hLFxufTogRGV0ZXJtaW5pc3RpY1NlZWRDb250ZXh0KTogc3RyaW5nIHtcbiAgcmV0dXJuIFtnYW1lU3RhcnRGZW4sIGN1cnJlbnRGZW4sIFN0cmluZyhtb3ZlQ291bnQpLCBzaWRlVG9Nb3ZlLCBwZXJzb25hXS5qb2luKCd8Jyk7XG59XG4iLCAiaW1wb3J0IHsgTW92ZUFubm90YXRpb24gfSBmcm9tICcuL2JyaWxsaWFudFRyYWNraW5nJztcblxuZXhwb3J0IGludGVyZmFjZSBQZXJzaXN0ZWRCb2FyZFN0YXRlIHtcbiAgY3VycmVudEZlbjogc3RyaW5nO1xuICBmZW5IaXN0b3J5OiBzdHJpbmdbXTtcbiAgZ2FtZVNlc3Npb25JZDogc3RyaW5nO1xuICBnYW1lU3RhcnRGZW46IHN0cmluZztcbiAgaGlzdG9yeUFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdO1xuICByZWRvQW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHYW1lU2Vzc2lvbklkKCk6IHN0cmluZyB7XG4gIHJldHVybiBgc2Vzc2lvbl8ke0RhdGUubm93KCkudG9TdHJpbmcoMzYpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDEwKX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBnblN0YXJ0RmVuKFxuICBoZWFkZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudWxsPixcbiAgZmFsbGJhY2tGZW46IHN0cmluZyxcbik6IHN0cmluZyB7XG4gIHJldHVybiBoZWFkZXJzLlNldFVwID09PSAnMScgJiYgdHlwZW9mIGhlYWRlcnMuRkVOID09PSAnc3RyaW5nJ1xuICAgID8gaGVhZGVycy5GRU5cbiAgICA6IGZhbGxiYWNrRmVuO1xufVxuIiwgImV4cG9ydCBpbnRlcmZhY2UgTW92ZUFubm90YXRpb24ge1xuICBiZWZvcmVGZW46IHN0cmluZztcbiAgYWZ0ZXJGZW46IHN0cmluZztcbiAgdWNpOiBzdHJpbmc7XG4gIG1vdmVOdW1iZXI6IG51bWJlcjtcbiAgY29uc3VtZWRCcmlsbGlhbnQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnJpbGxpYW50VXNhZ2Uge1xuICBicmlsbGlhbnRVc2VkQ291bnQ6IG51bWJlcjtcbiAgYnJpbGxpYW50TW92ZU51bWJlcnM6IG51bWJlcltdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVyaXZlQnJpbGxpYW50VXNhZ2UoXG4gIGFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdLFxuKTogQnJpbGxpYW50VXNhZ2Uge1xuICBjb25zdCBicmlsbGlhbnRNb3ZlTnVtYmVycyA9IGFubm90YXRpb25zXG4gICAgLmZpbHRlcigoYW5ub3RhdGlvbikgPT4gYW5ub3RhdGlvbi5jb25zdW1lZEJyaWxsaWFudClcbiAgICAubWFwKChhbm5vdGF0aW9uKSA9PiBhbm5vdGF0aW9uLm1vdmVOdW1iZXIpO1xuXG4gIHJldHVybiB7XG4gICAgYnJpbGxpYW50VXNlZENvdW50OiBicmlsbGlhbnRNb3ZlTnVtYmVycy5sZW5ndGgsXG4gICAgYnJpbGxpYW50TW92ZU51bWJlcnMsXG4gIH07XG59XG4iLCAiY29uc3QgREVCVUdfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX2RlYnVnX2xvZ2dpbmcnO1xuXG5mdW5jdGlvbiByZWFkQnJvd3NlckRlYnVnRmxhZygpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3aW5kb3cubG9jYWxTdG9yYWdlID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShERUJVR19TVE9SQUdFX0tFWSkgPT09ICcxJztcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRQcm9jZXNzRGVidWdGbGFnKCk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHByb2Nlc3MuZW52LlBFUlNPTkFDSEVTU19ERUJVRyA9PT0gJzEnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZWJ1Z0xvZ2dpbmdFbmFibGVkKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gcmVhZEJyb3dzZXJEZWJ1Z0ZsYWcoKSB8fCByZWFkUHJvY2Vzc0RlYnVnRmxhZygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0RGVidWdMb2dnaW5nRW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2luZG93LmxvY2FsU3RvcmFnZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIGlmIChlbmFibGVkKSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oREVCVUdfU1RPUkFHRV9LRVksICcxJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShERUJVR19TVE9SQUdFX0tFWSk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBJZ25vcmUgbG9jYWxTdG9yYWdlIGZhaWx1cmVzIGFuZCBrZWVwIHRoZSBhcHAgcnVubmluZy5cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVidWdMb2dnZXIoc2NvcGU6IHN0cmluZykge1xuICByZXR1cm4ge1xuICAgIGRlYnVnOiAoLi4uYXJnczogdW5rbm93bltdKSA9PiB7XG4gICAgICBpZiAoaXNEZWJ1Z0xvZ2dpbmdFbmFibGVkKCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFske3Njb3BlfV1gLCAuLi5hcmdzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVycm9yOiAoLi4uYXJnczogdW5rbm93bltdKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKGBbJHtzY29wZX1dYCwgLi4uYXJncyk7XG4gICAgfSxcbiAgICB3YXJuOiAoLi4uYXJnczogdW5rbm93bltdKSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oYFske3Njb3BlfV1gLCAuLi5hcmdzKTtcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZXZlbG9wbWVudEJ1aWxkKCk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIE1BSU5fV0lORE9XX1ZJVEVfREVWX1NFUlZFUl9VUkwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oTUFJTl9XSU5ET1dfVklURV9ERVZfU0VSVkVSX1VSTCk7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBCb29sZWFuKGltcG9ydC5tZXRhLmVudj8uREVWKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbiIsICIvKipcbiAqIFN0b2NrZmlzaCBVQ0kgRW5naW5lIFNlcnZpY2VcbiAqIE1vZGVsIGxheWVyIC0gUHVyZSBUeXBlU2NyaXB0LCBubyBSZWFjdCwgbm8gTW9iWFxuICogXG4gKiBIYW5kbGVzIGNvbW11bmljYXRpb24gd2l0aCBTdG9ja2Zpc2ggV0FTTSBlbmdpbmUgdmlhIFdlYiBXb3JrZXJcbiAqL1xuXG5pbXBvcnQgeyBBbmFseXplZE1vdmUsIFN0b2NrZmlzaEluZm8gfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGNyZWF0ZURlYnVnTG9nZ2VyIH0gZnJvbSAnLi4vc2hhcmVkL2RlYnVnJztcblxudHlwZSBNZXNzYWdlSGFuZGxlciA9IChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQ7XG5jb25zdCBsb2dnZXIgPSBjcmVhdGVEZWJ1Z0xvZ2dlcignU3RvY2tmaXNoU2VydmljZScpO1xuXG5leHBvcnQgY2xhc3MgU3RvY2tmaXNoU2VydmljZSB7XG4gIHByaXZhdGUgd29ya2VyOiBXb3JrZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBtZXNzYWdlSGFuZGxlcnM6IFNldDxNZXNzYWdlSGFuZGxlcj4gPSBuZXcgU2V0KCk7XG4gIHByaXZhdGUgaXNSZWFkeSA9IGZhbHNlO1xuICBwcml2YXRlIHJlYWR5UmVzb2x2ZXJzOiBBcnJheTwoKSA9PiB2b2lkPiA9IFtdO1xuICBwcml2YXRlIG11bHRpUFYgPSAxMjtcbiAgcHJpdmF0ZSBkZXB0aCA9IDIwO1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIFN0b2NrZmlzaCBXQVNNIGVuZ2luZVxuICAgKi9cbiAgYXN5bmMgaW5pdGlhbGl6ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy53b3JrZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQ3JlYXRlIHdvcmtlciB1c2luZyBzdG9ja2Zpc2guanNcbiAgICAgICAgLy8gSW4gVml0ZSwgd2UgbmVlZCB0byB1c2UgP3dvcmtlciBzdWZmaXggb3IgY3JlYXRlIGlubGluZSB3b3JrZXJcbiAgICAgICAgY29uc3Qgd29ya2VyQ29kZSA9IGBcbiAgICAgICAgICBpbXBvcnRTY3JpcHRzKCcke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59L3N0b2NrZmlzaC5qcycpO1xuICAgICAgICBgO1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3dvcmtlckNvZGVdLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0JyB9KTtcbiAgICAgICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuXG4gICAgICAgIHRoaXMud29ya2VyLm9ubWVzc2FnZSA9IChldmVudDogTWVzc2FnZUV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHR5cGVvZiBldmVudC5kYXRhID09PSAnc3RyaW5nJyA/IGV2ZW50LmRhdGEgOiBTdHJpbmcoZXZlbnQuZGF0YSk7XG4gICAgICAgICAgdGhpcy5oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMud29ya2VyLm9uZXJyb3IgPSAoZXJyb3IpID0+IHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1dvcmtlciBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXYWl0IGZvciBVQ0kgaW5pdGlhbGl6YXRpb25cbiAgICAgICAgY29uc3QgcmVhZHlIYW5kbGVyID0gKG1zZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKG1zZyA9PT0gJ3VjaW9rJykge1xuICAgICAgICAgICAgdGhpcy5pc1JlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcbiAgICAgICAgICAgIHRoaXMucmVhZHlSZXNvbHZlcnMuZm9yRWFjaChyID0+IHIoKSk7XG4gICAgICAgICAgICB0aGlzLnJlYWR5UmVzb2x2ZXJzID0gW107XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWRkTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNtYWxsIGRlbGF5IHRvIGVuc3VyZSB3b3JrZXIgaXMgcmVhZHlcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZCgndWNpJyk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIGVuZ2luZSBpbnN0YW5jZVxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53b3JrZXIpIHtcbiAgICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgdGhpcy53b3JrZXIgPSBudWxsO1xuICAgICAgdGhpcy5pc1JlYWR5ID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzLmNsZWFyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBVQ0kgY29tbWFuZCB0byBlbmdpbmVcbiAgICovXG4gIHByaXZhdGUgc2VuZENvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLndvcmtlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdG9ja2Zpc2ggbm90IGluaXRpYWxpemVkJyk7XG4gICAgfVxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKGNvbW1hbmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBpbmNvbWluZyBtZXNzYWdlIGZyb20gZW5naW5lXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKG1lc3NhZ2UgJiYgKG1lc3NhZ2Uuc3RhcnRzV2l0aCgnYmVzdG1vdmUnKSB8fCBtZXNzYWdlID09PSAncmVhZHlvaycgfHwgbWVzc2FnZSA9PT0gJ3VjaW9rJykpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnTWVzc2FnZTonLCBtZXNzYWdlKTtcbiAgICB9XG4gICAgdGhpcy5tZXNzYWdlSGFuZGxlcnMuZm9yRWFjaChoYW5kbGVyID0+IGhhbmRsZXIobWVzc2FnZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIG1lc3NhZ2UgaGFuZGxlclxuICAgKi9cbiAgYWRkTWVzc2FnZUhhbmRsZXIoaGFuZGxlcjogTWVzc2FnZUhhbmRsZXIpOiB2b2lkIHtcbiAgICB0aGlzLm1lc3NhZ2VIYW5kbGVycy5hZGQoaGFuZGxlcik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgbWVzc2FnZSBoYW5kbGVyXG4gICAqL1xuICByZW1vdmVNZXNzYWdlSGFuZGxlcihoYW5kbGVyOiBNZXNzYWdlSGFuZGxlcik6IHZvaWQge1xuICAgIHRoaXMubWVzc2FnZUhhbmRsZXJzLmRlbGV0ZShoYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0IGZvciBlbmdpbmUgdG8gYmUgcmVhZHlcbiAgICovXG4gIGFzeW5jIHdhaXRGb3JSZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5pc1JlYWR5KSByZXR1cm47XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5yZWFkeVJlc29sdmVycy5wdXNoKHJlc29sdmUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBNdWx0aVBWIG9wdGlvblxuICAgKi9cbiAgc2V0TXVsdGlQVih2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5tdWx0aVBWID0gdmFsdWU7XG4gICAgaWYgKHRoaXMuaXNSZWFkeSkge1xuICAgICAgdGhpcy5zZW5kQ29tbWFuZChgc2V0b3B0aW9uIG5hbWUgTXVsdGlQViB2YWx1ZSAke3ZhbHVlfWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgc2VhcmNoIGRlcHRoXG4gICAqL1xuICBzZXREZXB0aCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5kZXB0aCA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZSBlbmdpbmUgb3B0aW9uc1xuICAgKi9cbiAgY29uZmlndXJlKG9wdGlvbnM6IHsgbXVsdGlQVj86IG51bWJlcjsgZGVwdGg/OiBudW1iZXIgfSk6IHZvaWQge1xuICAgIGlmIChvcHRpb25zLm11bHRpUFYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZXRNdWx0aVBWKG9wdGlvbnMubXVsdGlQVik7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmRlcHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2V0RGVwdGgob3B0aW9ucy5kZXB0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFuYWx5emUgYSBwb3NpdGlvbiBhbmQgcmV0dXJuIGFsbCBjYW5kaWRhdGUgbW92ZXNcbiAgICovXG4gIGFzeW5jIGFuYWx5emVQb3NpdGlvbihmZW46IHN0cmluZyk6IFByb21pc2U8QW5hbHl6ZWRNb3ZlW10+IHtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JSZWFkeSgpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBtb3ZlczogTWFwPG51bWJlciwgU3RvY2tmaXNoSW5mbz4gPSBuZXcgTWFwKCk7XG4gICAgICBsZXQgYmVzdFNjb3JlID0gMDtcbiAgICAgIGxldCBoYXNSZWNlaXZlZEJlc3RNb3ZlID0gZmFsc2U7XG4gICAgICBsZXQgbWF4RGVwdGhSZWFjaGVkID0gMDtcblxuICAgICAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbXBsZXRlIGFuYWx5c2lzIHdpdGggY29sbGVjdGVkIG1vdmVzXG4gICAgICBjb25zdCBjb21wbGV0ZUFuYWx5c2lzID0gKCkgPT4ge1xuICAgICAgICBpZiAoaGFzUmVjZWl2ZWRCZXN0TW92ZSkgcmV0dXJuO1xuICAgICAgICBoYXNSZWNlaXZlZEJlc3RNb3ZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihhbmFseXNpc0hhbmRsZXIpO1xuXG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnQ29tcGxldGluZyBhbmFseXNpcywgY29sbGVjdGVkJywgbW92ZXMuc2l6ZSwgJ21vdmVzJyk7XG5cbiAgICAgICAgLy8gQ29udmVydCB0byBBbmFseXplZE1vdmUgYXJyYXlcbiAgICAgICAgY29uc3QgYW5hbHl6ZWRNb3ZlczogQW5hbHl6ZWRNb3ZlW10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHRoaXMubXVsdGlQVjsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgaW5mbyA9IG1vdmVzLmdldChpKTtcbiAgICAgICAgICBpZiAoaW5mbyAmJiBpbmZvLnB2Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGV2YWxMb3NzID0gTWF0aC5hYnMoYmVzdFNjb3JlIC0gaW5mby5zY29yZSk7XG4gICAgICAgICAgICBhbmFseXplZE1vdmVzLnB1c2goe1xuICAgICAgICAgICAgICBtb3ZlOiBpbmZvLnB2WzBdLFxuICAgICAgICAgICAgICBldmFsdWF0aW9uOiBpbmZvLnNjb3JlLFxuICAgICAgICAgICAgICBldmFsTG9zcyxcbiAgICAgICAgICAgICAgcHY6IGluZm8ucHYsXG4gICAgICAgICAgICAgIG11bHRpcHY6IGluZm8ubXVsdGlwdixcbiAgICAgICAgICAgICAgZGVwdGg6IGluZm8uZGVwdGgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYW5hbHl6ZWRNb3Zlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdSZXR1cm5pbmcnLCBhbmFseXplZE1vdmVzLmxlbmd0aCwgJ2FuYWx5emVkIG1vdmVzJyk7XG4gICAgICAgICAgcmVzb2x2ZShhbmFseXplZE1vdmVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGlzIGEgZ2FtZSBvdmVyIHBvc2l0aW9uIChjaGVja21hdGUvc3RhbGVtYXRlKVxuICAgICAgICAgIC8vIElmIHdlIHJlY2VpdmVkIG1hdGUgc2NvcmVzIGJ1dCBubyBtb3ZlcywgaXQncyBnYW1lIG92ZXJcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ05vIG1vdmVzIGNvbGxlY3RlZCAtIGxpa2VseSBnYW1lIG92ZXIgcG9zaXRpb24nKTtcbiAgICAgICAgICByZXNvbHZlKFtdKTsgLy8gUmV0dXJuIGVtcHR5IGFycmF5IGluc3RlYWQgb2YgcmVqZWN0aW5nIGZvciBnYW1lIG92ZXIgcG9zaXRpb25zXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIEFkZCB0aW1lb3V0IHRvIGZvcmNlIHN0b3AgYWZ0ZXIgcmVhc29uYWJsZSB0aW1lXG4gICAgICBjb25zdCBmb3JjZVN0b3BUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghaGFzUmVjZWl2ZWRCZXN0TW92ZSkge1xuICAgICAgICAgIGxvZ2dlci53YXJuKCdGb3JjaW5nIHN0b3AgYWZ0ZXIgMTAgc2Vjb25kcyB0byBnZXQgYmVzdG1vdmUnKTtcbiAgICAgICAgICB0aGlzLnNlbmRDb21tYW5kKCdzdG9wJyk7XG4gICAgICAgICAgLy8gR2l2ZSBpdCBhIG1vbWVudCB0byByZXNwb25kIHdpdGggYmVzdG1vdmVcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmICghaGFzUmVjZWl2ZWRCZXN0TW92ZSkge1xuICAgICAgICAgICAgICBsb2dnZXIud2FybignTm8gYmVzdG1vdmUgYWZ0ZXIgc3RvcCwgdXNpbmcgY29sbGVjdGVkIG1vdmVzJyk7XG4gICAgICAgICAgICAgIGNvbXBsZXRlQW5hbHlzaXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfVxuICAgICAgfSwgMTAwMDApOyAvLyAxMCBzZWNvbmQgdGltZW91dCB0byBmb3JjZSBzdG9wXG5cbiAgICAgIC8vIEFkZCBhYnNvbHV0ZSB0aW1lb3V0IHRvIHByZXZlbnQgaGFuZ2luZ1xuICAgICAgY29uc3QgYWJzb2x1dGVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghaGFzUmVjZWl2ZWRCZXN0TW92ZSkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignQW5hbHlzaXMgdGltZW91dCBhZnRlciAzMCBzZWNvbmRzJyk7XG4gICAgICAgICAgdGhpcy5yZW1vdmVNZXNzYWdlSGFuZGxlcihhbmFseXNpc0hhbmRsZXIpO1xuICAgICAgICAgIGNsZWFyVGltZW91dChmb3JjZVN0b3BUaW1lb3V0KTtcbiAgICAgICAgICBjb21wbGV0ZUFuYWx5c2lzKCk7IC8vIFRyeSB0byB1c2Ugd2hhdCB3ZSBoYXZlXG4gICAgICAgIH1cbiAgICAgIH0sIDMwMDAwKTsgLy8gMzAgc2Vjb25kIGFic29sdXRlIHRpbWVvdXRcblxuICAgICAgY29uc3QgYW5hbHlzaXNIYW5kbGVyID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBDaGVjayBmb3IgbWF0ZSBzY29yZXMgKGdhbWUgb3ZlciBwb3NpdGlvbnMpXG4gICAgICAgIGlmIChtZXNzYWdlLmluY2x1ZGVzKCdzY29yZSBtYXRlJykpIHtcbiAgICAgICAgICAvLyBFeHRyYWN0IG1hdGUgc2NvcmUgdG8gZGV0ZWN0IGNoZWNrbWF0ZS9zdGFsZW1hdGVcbiAgICAgICAgICBjb25zdCBtYXRlTWF0Y2ggPSBtZXNzYWdlLm1hdGNoKC9zY29yZSBtYXRlICgtP1xcZCspLyk7XG4gICAgICAgICAgaWYgKG1hdGVNYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgbWF0ZUluID0gcGFyc2VJbnQobWF0ZU1hdGNoWzFdLCAxMCk7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0RldGVjdGVkIG1hdGUgc2NvcmU6JywgbWF0ZUluKTtcbiAgICAgICAgICAgIC8vIElmIG1hdGUgaXMgMCBvciBuZWdhdGl2ZSwgaXQncyBjaGVja21hdGUvc3RhbGVtYXRlIChubyBtb3ZlcyBhdmFpbGFibGUpXG4gICAgICAgICAgICBpZiAobWF0ZUluIDw9IDApIHtcbiAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdHYW1lIG92ZXIgcG9zaXRpb24gZGV0ZWN0ZWQgKGNoZWNrbWF0ZS9zdGFsZW1hdGUpJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBQYXJzZSBpbmZvIGxpbmVzXG4gICAgICAgIGlmIChtZXNzYWdlLnN0YXJ0c1dpdGgoJ2luZm8nKSAmJiBtZXNzYWdlLmluY2x1ZGVzKCdtdWx0aXB2JykpIHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gdGhpcy5wYXJzZUluZm9MaW5lKG1lc3NhZ2UpO1xuICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICBtb3Zlcy5zZXQoaW5mby5tdWx0aXB2LCBpbmZvKTtcbiAgICAgICAgICAgIGlmIChpbmZvLm11bHRpcHYgPT09IDEpIHtcbiAgICAgICAgICAgICAgYmVzdFNjb3JlID0gaW5mby5zY29yZTtcbiAgICAgICAgICAgICAgbWF4RGVwdGhSZWFjaGVkID0gTWF0aC5tYXgobWF4RGVwdGhSZWFjaGVkLCBpbmZvLmRlcHRoKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIElmIHdlJ3ZlIHJlYWNoZWQgdGhlIHRhcmdldCBkZXB0aCBhbmQgaGF2ZSBlbm91Z2ggbW92ZXMsIHdlIGNhbiBzdG9wIGVhcmx5XG4gICAgICAgICAgICAgIGlmIChpbmZvLmRlcHRoID49IHRoaXMuZGVwdGggJiYgbW92ZXMuc2l6ZSA+PSBNYXRoLm1pbigzLCB0aGlzLm11bHRpUFYpKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdSZWFjaGVkIHRhcmdldCBkZXB0aCwgc3RvcHBpbmcgZWFybHknKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRDb21tYW5kKCdzdG9wJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBbmFseXNpcyBjb21wbGV0ZVxuICAgICAgICBpZiAobWVzc2FnZS5zdGFydHNXaXRoKCdiZXN0bW92ZScpKSB7XG4gICAgICAgICAgaGFzUmVjZWl2ZWRCZXN0TW92ZSA9IHRydWU7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGZvcmNlU3RvcFRpbWVvdXQpO1xuICAgICAgICAgIGNsZWFyVGltZW91dChhYnNvbHV0ZVRpbWVvdXQpO1xuICAgICAgICAgIHRoaXMucmVtb3ZlTWVzc2FnZUhhbmRsZXIoYW5hbHlzaXNIYW5kbGVyKTtcblxuICAgICAgICAgIC8vIENoZWNrIGlmIGJlc3Rtb3ZlIGlzIFwibm9uZVwiIChubyBsZWdhbCBtb3ZlcyAtIGNoZWNrbWF0ZS9zdGFsZW1hdGUpXG4gICAgICAgICAgY29uc3QgYmVzdG1vdmVNYXRjaCA9IG1lc3NhZ2UubWF0Y2goL2Jlc3Rtb3ZlXFxzKyhcXFMrKS8pO1xuICAgICAgICAgIGlmIChiZXN0bW92ZU1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBiZXN0bW92ZSA9IGJlc3Rtb3ZlTWF0Y2hbMV07XG4gICAgICAgICAgICBpZiAoYmVzdG1vdmUgPT09ICcobm9uZSknIHx8IGJlc3Rtb3ZlID09PSAnbm9uZScgfHwgYmVzdG1vdmUgPT09ICcwMDAwJykge1xuICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoJ05vIGxlZ2FsIG1vdmVzIChjaGVja21hdGUvc3RhbGVtYXRlKScpO1xuICAgICAgICAgICAgICByZXNvbHZlKFtdKTsgLy8gUmV0dXJuIGVtcHR5IGFycmF5IGZvciBnYW1lIG92ZXIgcG9zaXRpb25zXG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ1JlY2VpdmVkIGJlc3Rtb3ZlLCBjb2xsZWN0ZWQnLCBtb3Zlcy5zaXplLCAnbW92ZXMnKTtcblxuICAgICAgICAgIC8vIENvbnZlcnQgdG8gQW5hbHl6ZWRNb3ZlIGFycmF5XG4gICAgICAgICAgY29uc3QgYW5hbHl6ZWRNb3ZlczogQW5hbHl6ZWRNb3ZlW10gPSBbXTtcbiAgICAgICAgICBcbiAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSB0aGlzLm11bHRpUFY7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IG1vdmVzLmdldChpKTtcbiAgICAgICAgICAgIGlmIChpbmZvICYmIGluZm8ucHYubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBjb25zdCBldmFsTG9zcyA9IE1hdGguYWJzKGJlc3RTY29yZSAtIGluZm8uc2NvcmUpO1xuICAgICAgICAgICAgICBhbmFseXplZE1vdmVzLnB1c2goe1xuICAgICAgICAgICAgICAgIG1vdmU6IGluZm8ucHZbMF0sXG4gICAgICAgICAgICAgICAgZXZhbHVhdGlvbjogaW5mby5zY29yZSxcbiAgICAgICAgICAgICAgICBldmFsTG9zcyxcbiAgICAgICAgICAgICAgICBwdjogaW5mby5wdixcbiAgICAgICAgICAgICAgICBtdWx0aXB2OiBpbmZvLm11bHRpcHYsXG4gICAgICAgICAgICAgICAgZGVwdGg6IGluZm8uZGVwdGgsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHdlIGhhdmUgbm8gbW92ZXMgYnV0IGdvdCBhIGJlc3Rtb3ZlLCBpdCBtaWdodCBzdGlsbCBiZSBnYW1lIG92ZXJcbiAgICAgICAgICBpZiAoYW5hbHl6ZWRNb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnTm8gbW92ZXMgaW4gYmVzdG1vdmUgcmVzcG9uc2UgLSBnYW1lIG92ZXIgcG9zaXRpb24nKTtcbiAgICAgICAgICAgIHJlc29sdmUoW10pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ1JldHVybmluZycsIGFuYWx5emVkTW92ZXMubGVuZ3RoLCAnYW5hbHl6ZWQgbW92ZXMnKTtcbiAgICAgICAgICAgIHJlc29sdmUoYW5hbHl6ZWRNb3Zlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmFkZE1lc3NhZ2VIYW5kbGVyKGFuYWx5c2lzSGFuZGxlcik7XG5cbiAgICAgIC8vIFdhaXQgZm9yIHJlYWR5b2sgYmVmb3JlIHNlbmRpbmcgcG9zaXRpb25cbiAgICAgIGNvbnN0IHJlYWR5SGFuZGxlciA9IChtc2c6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAobXNnID09PSAncmVhZHlvaycpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZU1lc3NhZ2VIYW5kbGVyKHJlYWR5SGFuZGxlcik7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdFbmdpbmUgcmVhZHksIHNlbmRpbmcgcG9zaXRpb24gYW5kIHN0YXJ0aW5nIGFuYWx5c2lzJyk7XG4gICAgICAgICAgdGhpcy5zZW5kQ29tbWFuZChgcG9zaXRpb24gZmVuICR7ZmVufWApO1xuICAgICAgICAgIHRoaXMuc2VuZENvbW1hbmQoYGdvIGRlcHRoICR7dGhpcy5kZXB0aH1gKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRoaXMuYWRkTWVzc2FnZUhhbmRsZXIocmVhZHlIYW5kbGVyKTtcblxuICAgICAgLy8gU2VuZCBwb3NpdGlvbiBhbmQgc3RhcnQgYW5hbHlzaXNcbiAgICAgIGxvZ2dlci5kZWJ1ZygnU3RhcnRpbmcgYW5hbHlzaXMgZm9yIEZFTjonLCBmZW4sICdNdWx0aVBWPScsIHRoaXMubXVsdGlQViwgJ0RlcHRoPScsIHRoaXMuZGVwdGgpO1xuICAgICAgXG4gICAgICB0aGlzLnNlbmRDb21tYW5kKGBzZXRvcHRpb24gbmFtZSBNdWx0aVBWIHZhbHVlICR7dGhpcy5tdWx0aVBWfWApO1xuICAgICAgdGhpcy5zZW5kQ29tbWFuZCgnaXNyZWFkeScpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIFVDSSBpbmZvIGxpbmUgaW50byBzdHJ1Y3R1cmVkIGRhdGFcbiAgICovXG4gIHByaXZhdGUgcGFyc2VJbmZvTGluZShsaW5lOiBzdHJpbmcpOiBTdG9ja2Zpc2hJbmZvIHwgbnVsbCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnRzID0gbGluZS5zcGxpdCgnICcpO1xuICAgICAgXG4gICAgICBjb25zdCBnZXRWYWx1ZUFmdGVyID0gKGtleTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCA9PiB7XG4gICAgICAgIGNvbnN0IGlkeCA9IHBhcnRzLmluZGV4T2Yoa2V5KTtcbiAgICAgICAgcmV0dXJuIGlkeCA+PSAwICYmIGlkeCA8IHBhcnRzLmxlbmd0aCAtIDEgPyBwYXJ0c1tpZHggKyAxXSA6IG51bGw7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBtdWx0aXB2U3RyID0gZ2V0VmFsdWVBZnRlcignbXVsdGlwdicpO1xuICAgICAgY29uc3QgZGVwdGhTdHIgPSBnZXRWYWx1ZUFmdGVyKCdkZXB0aCcpO1xuICAgICAgXG4gICAgICBpZiAoIW11bHRpcHZTdHIgfHwgIWRlcHRoU3RyKSByZXR1cm4gbnVsbDtcblxuICAgICAgY29uc3QgbXVsdGlwdiA9IHBhcnNlSW50KG11bHRpcHZTdHIsIDEwKTtcbiAgICAgIGNvbnN0IGRlcHRoID0gcGFyc2VJbnQoZGVwdGhTdHIsIDEwKTtcblxuICAgICAgLy8gR2V0IHNjb3JlIHZhbHVlXG4gICAgICBsZXQgc2NvcmUgPSAwO1xuICAgICAgbGV0IG1hdGU6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHNjb3JlSWR4ID0gcGFydHMuaW5kZXhPZignc2NvcmUnKTtcbiAgICAgIFxuICAgICAgaWYgKHNjb3JlSWR4ID49IDAgJiYgcGFydHNbc2NvcmVJZHggKyAxXSA9PT0gJ2NwJykge1xuICAgICAgICBzY29yZSA9IHBhcnNlSW50KHBhcnRzW3Njb3JlSWR4ICsgMl0sIDEwKTtcbiAgICAgIH0gZWxzZSBpZiAoc2NvcmVJZHggPj0gMCAmJiBwYXJ0c1tzY29yZUlkeCArIDFdID09PSAnbWF0ZScpIHtcbiAgICAgICAgbWF0ZSA9IHBhcnNlSW50KHBhcnRzW3Njb3JlSWR4ICsgMl0sIDEwKTtcbiAgICAgICAgLy8gQ29udmVydCBtYXRlIHRvIGEgbGFyZ2UgY2VudGlwYXduIHZhbHVlXG4gICAgICAgIHNjb3JlID0gbWF0ZSA+IDAgPyAxMDAwMCAtIG1hdGUgKiAxMDAgOiAtMTAwMDAgLSBtYXRlICogMTAwO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgUFYgKHByaW5jaXBhbCB2YXJpYXRpb24pXG4gICAgICBjb25zdCBwdklkeCA9IHBhcnRzLmluZGV4T2YoJ3B2Jyk7XG4gICAgICBjb25zdCBwdiA9IHB2SWR4ID49IDAgPyBwYXJ0cy5zbGljZShwdklkeCArIDEpIDogW107XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG11bHRpcHYsXG4gICAgICAgIGRlcHRoLFxuICAgICAgICBzY29yZSxcbiAgICAgICAgbWF0ZSxcbiAgICAgICAgcHYsXG4gICAgICB9O1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgY3VycmVudCBhbmFseXNpc1xuICAgKi9cbiAgc3RvcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53b3JrZXIpIHtcbiAgICAgIHRoaXMuc2VuZENvbW1hbmQoJ3N0b3AnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgYSBuZXcgZ2FtZVxuICAgKi9cbiAgbmV3R2FtZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy53b3JrZXIpIHtcbiAgICAgIHRoaXMuc2VuZENvbW1hbmQoJ3VjaW5ld2dhbWUnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgZW5naW5lIGlzIGluaXRpYWxpemVkXG4gICAqL1xuICBnZXQgaW5pdGlhbGl6ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNSZWFkeTtcbiAgfVxufVxuXG4vLyBTaW5nbGV0b24gaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBzdG9ja2Zpc2hTZXJ2aWNlID0gbmV3IFN0b2NrZmlzaFNlcnZpY2UoKTtcbiIsICIvKipcbiAqIFR5cGVzIGZvciB0aGUgY2hlc3MgZW5naW5lIG1vZGVsIGxheWVyXG4gKiBQdXJlIFR5cGVTY3JpcHQgLSBubyBSZWFjdCwgbm8gTW9iWFxuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5hbHl6ZWRNb3ZlIHtcbiAgbW92ZTogc3RyaW5nOyAgICAgICAgLy8gVUNJIGZvcm1hdCAoZS5nLiwgXCJlMmU0XCIpXG4gIGV2YWx1YXRpb246IG51bWJlcjsgIC8vIENlbnRpcGF3biBldmFsdWF0aW9uXG4gIGV2YWxMb3NzOiBudW1iZXI7ICAgIC8vIExvc3MgY29tcGFyZWQgdG8gYmVzdCBtb3ZlXG4gIHB2OiBzdHJpbmdbXTsgICAgICAgIC8vIFByaW5jaXBhbCB2YXJpYXRpb25cbiAgbXVsdGlwdjogbnVtYmVyOyAgICAgLy8gTXVsdGlQViByYW5rICgxID0gYmVzdClcbiAgZGVwdGg6IG51bWJlcjsgICAgICAgLy8gU2VhcmNoIGRlcHRoXG59XG5cbmV4cG9ydCB0eXBlIE1vdmVCdWNrZXQgPSBcbiAgfCAnYmVzdCdcbiAgfCAnZ3JlYXQnXG4gIHwgJ2V4Y2VsbGVudCdcbiAgfCAnZ29vZCdcbiAgfCAnaW5hY2N1cmFjeSdcbiAgfCAnbWlzdGFrZSdcbiAgfCAnYmx1bmRlcic7XG5cbmV4cG9ydCB0eXBlIERpc3BsYXlNb3ZlQnVja2V0ID0gTW92ZUJ1Y2tldCB8ICdmYWxsYmFjayc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2xhc3NpZmllZE1vdmUgZXh0ZW5kcyBBbmFseXplZE1vdmUge1xuICBidWNrZXQ6IE1vdmVCdWNrZXQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnVja2V0Q29uZmlnIHtcbiAgYmVzdDogbnVtYmVyO1xuICBncmVhdDogbnVtYmVyO1xuICBleGNlbGxlbnQ6IG51bWJlcjtcbiAgZ29vZDogbnVtYmVyO1xuICBpbmFjY3VyYWN5OiBudW1iZXI7XG4gIG1pc3Rha2U6IG51bWJlcjtcbiAgYmx1bmRlcjogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0b2NrZmlzaEluZm8ge1xuICBtdWx0aXB2OiBudW1iZXI7XG4gIGRlcHRoOiBudW1iZXI7XG4gIHNjb3JlOiBudW1iZXI7XG4gIG1hdGU/OiBudW1iZXI7XG4gIHB2OiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQaWNrZWRNb3ZlUmVzdWx0IHtcbiAgbW92ZTogQ2xhc3NpZmllZE1vdmU7XG4gIGJ1Y2tldDogTW92ZUJ1Y2tldDtcbiAgaXNCcmlsbGlhbnQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9CVUNLRVRfQ09ORklHOiBCdWNrZXRDb25maWcgPSB7XG4gIGJlc3Q6IDQwLFxuICBncmVhdDogMjUsXG4gIGV4Y2VsbGVudDogMjAsXG4gIGdvb2Q6IDEwLFxuICBpbmFjY3VyYWN5OiA0LFxuICBtaXN0YWtlOiAxLFxuICBibHVuZGVyOiAwLFxufTtcblxuLyoqIFByZXNldCBpZCBmb3IgbW92ZSBxdWFsaXR5IGRpc3RyaWJ1dGlvbiAqL1xuZXhwb3J0IHR5cGUgTW92ZVF1YWxpdHlQcmVzZXRJZCA9ICdsb3cnIHwgJ21lZGl1bScgfCAnaGFyZCcgfCAnc3VwZXJfaGFyZCcgfCAnYWdncmVzc2l2ZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW92ZVF1YWxpdHlQcmVzZXQge1xuICBpZDogTW92ZVF1YWxpdHlQcmVzZXRJZDtcbiAgbGFiZWw6IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgY29uZmlnOiBCdWNrZXRDb25maWc7XG59XG5cbi8qKiBQcmVkZWZpbmVkIG1vdmUgcXVhbGl0eSBkaXN0cmlidXRpb25zIChwZXJjZW50YWdlcyBzdW0gdG8gMTAwKSAqL1xuZXhwb3J0IGNvbnN0IE1PVkVfUVVBTElUWV9QUkVTRVRTOiBNb3ZlUXVhbGl0eVByZXNldFtdID0gW1xuICB7XG4gICAgaWQ6ICdsb3cnLFxuICAgIGxhYmVsOiAnTG93JyxcbiAgICBkZXNjcmlwdGlvbjogJ0Vhc2llciBcdTIwMTQgbW9yZSBnb29kL2luYWNjdXJhY3kvbWlzdGFrZSBtb3ZlcycsXG4gICAgY29uZmlnOiB7XG4gICAgICBiZXN0OiAxNSxcbiAgICAgIGdyZWF0OiAxNSxcbiAgICAgIGV4Y2VsbGVudDogMjAsXG4gICAgICBnb29kOiAyNSxcbiAgICAgIGluYWNjdXJhY3k6IDE1LFxuICAgICAgbWlzdGFrZTogNyxcbiAgICAgIGJsdW5kZXI6IDMsXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAnbWVkaXVtJyxcbiAgICBsYWJlbDogJ01lZGl1bScsXG4gICAgZGVzY3JpcHRpb246ICdCYWxhbmNlZCBtaXggb2YgcXVhbGl0aWVzJyxcbiAgICBjb25maWc6IHtcbiAgICAgIGJlc3Q6IDQwLFxuICAgICAgZ3JlYXQ6IDI1LFxuICAgICAgZXhjZWxsZW50OiAyMCxcbiAgICAgIGdvb2Q6IDEwLFxuICAgICAgaW5hY2N1cmFjeTogNCxcbiAgICAgIG1pc3Rha2U6IDEsXG4gICAgICBibHVuZGVyOiAwLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hhcmQnLFxuICAgIGxhYmVsOiAnSGFyZCcsXG4gICAgZGVzY3JpcHRpb246ICdGYXZvcnMgYmVzdCBhbmQgZ3JlYXQgbW92ZXMnLFxuICAgIGNvbmZpZzoge1xuICAgICAgYmVzdDogNTUsXG4gICAgICBncmVhdDogMjUsXG4gICAgICBleGNlbGxlbnQ6IDE1LFxuICAgICAgZ29vZDogNSxcbiAgICAgIGluYWNjdXJhY3k6IDAsXG4gICAgICBtaXN0YWtlOiAwLFxuICAgICAgYmx1bmRlcjogMCxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgaWQ6ICdzdXBlcl9oYXJkJyxcbiAgICBsYWJlbDogJ1N1cGVyIEhhcmQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQWxtb3N0IG9ubHkgYmVzdCBhbmQgZ3JlYXQnLFxuICAgIGNvbmZpZzoge1xuICAgICAgYmVzdDogNzAsXG4gICAgICBncmVhdDogMjUsXG4gICAgICBleGNlbGxlbnQ6IDUsXG4gICAgICBnb29kOiAwLFxuICAgICAgaW5hY2N1cmFjeTogMCxcbiAgICAgIG1pc3Rha2U6IDAsXG4gICAgICBibHVuZGVyOiAwLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ2FnZ3Jlc3NpdmUnLFxuICAgIGxhYmVsOiAnQWdncmVzc2l2ZScsXG4gICAgZGVzY3JpcHRpb246ICdSaXNreSBcdTIwMTQgbW9yZSBpbmFjY3VyYWNpZXMgYW5kIG1pc3Rha2VzJyxcbiAgICBjb25maWc6IHtcbiAgICAgIGJlc3Q6IDIwLFxuICAgICAgZ3JlYXQ6IDIwLFxuICAgICAgZXhjZWxsZW50OiAxNSxcbiAgICAgIGdvb2Q6IDE1LFxuICAgICAgaW5hY2N1cmFjeTogMTUsXG4gICAgICBtaXN0YWtlOiAxMCxcbiAgICAgIGJsdW5kZXI6IDUsXG4gICAgfSxcbiAgfSxcbl07XG5cbmV4cG9ydCBjb25zdCBCVUNLRVRfRVZBTF9SQU5HRVM6IFJlY29yZDxNb3ZlQnVja2V0LCBbbnVtYmVyLCBudW1iZXJdPiA9IHtcbiAgYmVzdDogWzAsIDEwXSxcbiAgZ3JlYXQ6IFsxMCwgMzBdLFxuICBleGNlbGxlbnQ6IFszMCwgNzBdLFxuICBnb29kOiBbNzAsIDE1MF0sXG4gIGluYWNjdXJhY3k6IFsxNTAsIDMwMF0sXG4gIG1pc3Rha2U6IFszMDAsIDYwMF0sXG4gIGJsdW5kZXI6IFs2MDAsIEluZmluaXR5XSxcbn07XG5cbmV4cG9ydCBjb25zdCBCVUNLRVRfTEFCRUxTOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgc3RyaW5nPiA9IHtcbiAgYmVzdDogJ0Jlc3QnLFxuICBncmVhdDogJ0dyZWF0JyxcbiAgZXhjZWxsZW50OiAnRXhjZWxsZW50JyxcbiAgZ29vZDogJ0dvb2QnLFxuICBpbmFjY3VyYWN5OiAnSW5hY2N1cmFjeScsXG4gIG1pc3Rha2U6ICdNaXN0YWtlJyxcbiAgYmx1bmRlcjogJ0JsdW5kZXInLFxufTtcblxuZXhwb3J0IGNvbnN0IERJU1BMQVlfQlVDS0VUX0xBQkVMUzogUmVjb3JkPERpc3BsYXlNb3ZlQnVja2V0LCBzdHJpbmc+ID0ge1xuICAuLi5CVUNLRVRfTEFCRUxTLFxuICBmYWxsYmFjazogJ0ZhbGxiYWNrIG1vdmUnLFxufTtcblxuZXhwb3J0IGNvbnN0IEJVQ0tFVF9DT0xPUlM6IFJlY29yZDxNb3ZlQnVja2V0LCBzdHJpbmc+ID0ge1xuICBiZXN0OiAnIzI2YTY0MScsXG4gIGdyZWF0OiAnIzJlYTA0MycsXG4gIGV4Y2VsbGVudDogJyM1N2FiNWEnLFxuICBnb29kOiAnIzhiOTQ5ZScsXG4gIGluYWNjdXJhY3k6ICcjZDI5OTIyJyxcbiAgbWlzdGFrZTogJyNmODUxNDknLFxuICBibHVuZGVyOiAnI2RhMzYzMycsXG59O1xuXG5leHBvcnQgY29uc3QgRElTUExBWV9CVUNLRVRfQ09MT1JTOiBSZWNvcmQ8RGlzcGxheU1vdmVCdWNrZXQsIHN0cmluZz4gPSB7XG4gIC4uLkJVQ0tFVF9DT0xPUlMsXG4gIGZhbGxiYWNrOiAnIzZlNzY4MScsXG59O1xuIiwgIi8qKlxuICogTW92ZSBDbGFzc2lmaWVyXG4gKiBNb2RlbCBsYXllciAtIFB1cmUgVHlwZVNjcmlwdCwgbm8gUmVhY3QsIG5vIE1vYlhcbiAqIFxuICogQ2xhc3NpZmllcyBjaGVzcyBtb3ZlcyBpbnRvIHF1YWxpdHkgYnVja2V0cyBiYXNlZCBvbiBldmFsdWF0aW9uIGxvc3NcbiAqL1xuXG5pbXBvcnQgeyBcbiAgQW5hbHl6ZWRNb3ZlLCBcbiAgQ2xhc3NpZmllZE1vdmUsIFxuICBEaXNwbGF5TW92ZUJ1Y2tldCxcbiAgTW92ZUJ1Y2tldCwgXG4gIEJVQ0tFVF9FVkFMX1JBTkdFUyBcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogQ2xhc3NpZnkgYSBzaW5nbGUgbW92ZSBpbnRvIGEgcXVhbGl0eSBidWNrZXQgYmFzZWQgb24gZXZhbCBsb3NzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc2lmeU1vdmUobW92ZTogQW5hbHl6ZWRNb3ZlKTogQ2xhc3NpZmllZE1vdmUge1xuICBjb25zdCBidWNrZXQgPSBnZXRCdWNrZXRGb3JFdmFsTG9zcyhtb3ZlLmV2YWxMb3NzKTtcbiAgcmV0dXJuIHtcbiAgICAuLi5tb3ZlLFxuICAgIGJ1Y2tldCxcbiAgfTtcbn1cblxuLyoqXG4gKiBDbGFzc2lmeSBhbGwgYW5hbHl6ZWQgbW92ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzaWZ5TW92ZXMobW92ZXM6IEFuYWx5emVkTW92ZVtdKTogQ2xhc3NpZmllZE1vdmVbXSB7XG4gIHJldHVybiBtb3Zlcy5tYXAoY2xhc3NpZnlNb3ZlKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGJ1Y2tldCBmb3IgYSBnaXZlbiBldmFsIGxvc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEJ1Y2tldEZvckV2YWxMb3NzKGV2YWxMb3NzOiBudW1iZXIpOiBNb3ZlQnVja2V0IHtcbiAgY29uc3QgYWJzTG9zcyA9IE1hdGguYWJzKGV2YWxMb3NzKTtcbiAgXG4gIGZvciAoY29uc3QgW2J1Y2tldCwgW21pbiwgbWF4XV0gb2YgT2JqZWN0LmVudHJpZXMoQlVDS0VUX0VWQUxfUkFOR0VTKSkge1xuICAgIGlmIChhYnNMb3NzID49IG1pbiAmJiBhYnNMb3NzIDwgbWF4KSB7XG4gICAgICByZXR1cm4gYnVja2V0IGFzIE1vdmVCdWNrZXQ7XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gJ2JsdW5kZXInO1xufVxuXG4vKipcbiAqIEdyb3VwIGNsYXNzaWZpZWQgbW92ZXMgYnkgdGhlaXIgYnVja2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cE1vdmVzQnlCdWNrZXQobW92ZXM6IENsYXNzaWZpZWRNb3ZlW10pOiBNYXA8TW92ZUJ1Y2tldCwgQ2xhc3NpZmllZE1vdmVbXT4ge1xuICBjb25zdCBncm91cHMgPSBuZXcgTWFwPE1vdmVCdWNrZXQsIENsYXNzaWZpZWRNb3ZlW10+KCk7XG4gIFxuICAvLyBJbml0aWFsaXplIGFsbCBidWNrZXRzIHdpdGggZW1wdHkgYXJyYXlzXG4gIGNvbnN0IGJ1Y2tldHM6IE1vdmVCdWNrZXRbXSA9IFsnYmVzdCcsICdncmVhdCcsICdleGNlbGxlbnQnLCAnZ29vZCcsICdpbmFjY3VyYWN5JywgJ21pc3Rha2UnLCAnYmx1bmRlciddO1xuICBidWNrZXRzLmZvckVhY2goYnVja2V0ID0+IGdyb3Vwcy5zZXQoYnVja2V0LCBbXSkpO1xuICBcbiAgLy8gR3JvdXAgbW92ZXNcbiAgbW92ZXMuZm9yRWFjaChtb3ZlID0+IHtcbiAgICBjb25zdCBidWNrZXRNb3ZlcyA9IGdyb3Vwcy5nZXQobW92ZS5idWNrZXQpIHx8IFtdO1xuICAgIGJ1Y2tldE1vdmVzLnB1c2gobW92ZSk7XG4gICAgZ3JvdXBzLnNldChtb3ZlLmJ1Y2tldCwgYnVja2V0TW92ZXMpO1xuICB9KTtcbiAgXG4gIHJldHVybiBncm91cHM7XG59XG5cbi8qKlxuICogR2V0IHN0YXRpc3RpY3MgYWJvdXQgdGhlIG1vdmUgZGlzdHJpYnV0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNb3ZlU3RhdHMobW92ZXM6IENsYXNzaWZpZWRNb3ZlW10pOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiB7XG4gIGNvbnN0IHN0YXRzOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiA9IHtcbiAgICBiZXN0OiAwLFxuICAgIGdyZWF0OiAwLFxuICAgIGV4Y2VsbGVudDogMCxcbiAgICBnb29kOiAwLFxuICAgIGluYWNjdXJhY3k6IDAsXG4gICAgbWlzdGFrZTogMCxcbiAgICBibHVuZGVyOiAwLFxuICB9O1xuICBcbiAgbW92ZXMuZm9yRWFjaChtb3ZlID0+IHtcbiAgICBzdGF0c1ttb3ZlLmJ1Y2tldF0rKztcbiAgfSk7XG4gIFxuICByZXR1cm4gc3RhdHM7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlcmUgYXJlIGFueSBtb3ZlcyBpbiBhIGdpdmVuIGJ1Y2tldFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzTW92ZUluQnVja2V0KG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLCBidWNrZXQ6IE1vdmVCdWNrZXQpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1vdmVzLnNvbWUobW92ZSA9PiBtb3ZlLmJ1Y2tldCA9PT0gYnVja2V0KTtcbn1cblxuLyoqXG4gKiBHZXQgYWxsIG1vdmVzIGZyb20gYSBzcGVjaWZpYyBidWNrZXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1vdmVzRnJvbUJ1Y2tldChtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSwgYnVja2V0OiBNb3ZlQnVja2V0KTogQ2xhc3NpZmllZE1vdmVbXSB7XG4gIHJldHVybiBtb3Zlcy5maWx0ZXIobW92ZSA9PiBtb3ZlLmJ1Y2tldCA9PT0gYnVja2V0KTtcbn1cblxuY29uc3QgQlVDS0VUX09SREVSOiBNb3ZlQnVja2V0W10gPSBbJ2Jlc3QnLCAnZ3JlYXQnLCAnZXhjZWxsZW50JywgJ2dvb2QnLCAnaW5hY2N1cmFjeScsICdtaXN0YWtlJywgJ2JsdW5kZXInXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzaWZ5VW5hbmFseXplZE1vdmUoKTogRGlzcGxheU1vdmVCdWNrZXQge1xuICByZXR1cm4gJ2ZhbGxiYWNrJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcExlZ2FsTW92ZXNUb0J1Y2tldHMoXG4gIGxlZ2FsTW92ZXM6IHN0cmluZ1tdLFxuICBhbmFseXplZE1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICB1c2VJbXByb3ZlZEZhbGxiYWNrOiBib29sZWFuLFxuKTogUmVjb3JkPHN0cmluZywgRGlzcGxheU1vdmVCdWNrZXQ+IHtcbiAgY29uc3QgbW92ZU1hcDogUmVjb3JkPHN0cmluZywgRGlzcGxheU1vdmVCdWNrZXQ+ID0ge307XG5cbiAgZm9yIChjb25zdCBhbmFseXplZE1vdmUgb2YgYW5hbHl6ZWRNb3Zlcykge1xuICAgIG1vdmVNYXBbYW5hbHl6ZWRNb3ZlLm1vdmVdID0gYW5hbHl6ZWRNb3ZlLmJ1Y2tldDtcbiAgfVxuXG4gIGZvciAoY29uc3QgbW92ZSBvZiBsZWdhbE1vdmVzKSB7XG4gICAgaWYgKCFtb3ZlTWFwW21vdmVdKSB7XG4gICAgICBtb3ZlTWFwW21vdmVdID0gdXNlSW1wcm92ZWRGYWxsYmFjayA/IGNsYXNzaWZ5VW5hbmFseXplZE1vdmUoKSA6ICdnb29kJztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbW92ZU1hcDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRDbG9zZXN0QXZhaWxhYmxlQnVja2V0KFxuICB0YXJnZXRCdWNrZXQ6IE1vdmVCdWNrZXQsXG4gIGF2YWlsYWJsZUJ1Y2tldHM6IE1vdmVCdWNrZXRbXSxcbik6IE1vdmVCdWNrZXQgfCBudWxsIHtcbiAgaWYgKGF2YWlsYWJsZUJ1Y2tldHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB0YXJnZXRJbmRleCA9IEJVQ0tFVF9PUkRFUi5pbmRleE9mKHRhcmdldEJ1Y2tldCk7XG4gIGlmICh0YXJnZXRJbmRleCA9PT0gLTEpIHtcbiAgICByZXR1cm4gYXZhaWxhYmxlQnVja2V0c1swXTtcbiAgfVxuXG4gIGZvciAobGV0IG9mZnNldCA9IDE7IG9mZnNldCA8IEJVQ0tFVF9PUkRFUi5sZW5ndGg7IG9mZnNldCArPSAxKSB7XG4gICAgY29uc3QgYmV0dGVySW5kZXggPSB0YXJnZXRJbmRleCAtIG9mZnNldDtcbiAgICBpZiAoYmV0dGVySW5kZXggPj0gMCkge1xuICAgICAgY29uc3QgYmV0dGVyQnVja2V0ID0gQlVDS0VUX09SREVSW2JldHRlckluZGV4XTtcbiAgICAgIGlmIChhdmFpbGFibGVCdWNrZXRzLmluY2x1ZGVzKGJldHRlckJ1Y2tldCkpIHtcbiAgICAgICAgcmV0dXJuIGJldHRlckJ1Y2tldDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB3b3JzZUluZGV4ID0gdGFyZ2V0SW5kZXggKyBvZmZzZXQ7XG4gICAgaWYgKHdvcnNlSW5kZXggPCBCVUNLRVRfT1JERVIubGVuZ3RoKSB7XG4gICAgICBjb25zdCB3b3JzZUJ1Y2tldCA9IEJVQ0tFVF9PUkRFUlt3b3JzZUluZGV4XTtcbiAgICAgIGlmIChhdmFpbGFibGVCdWNrZXRzLmluY2x1ZGVzKHdvcnNlQnVja2V0KSkge1xuICAgICAgICByZXR1cm4gd29yc2VCdWNrZXQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGF2YWlsYWJsZUJ1Y2tldHNbMF07XG59XG4iLCAiLyoqXG4gKiBNb3ZlIFBpY2tlclxuICogTW9kZWwgbGF5ZXIgLSBQdXJlIFR5cGVTY3JpcHQsIG5vIFJlYWN0LCBubyBNb2JYXG4gKiBcbiAqIFBpY2tzIGEgbW92ZSBiYXNlZCBvbiB3ZWlnaHRlZCBwcm9iYWJpbGl0eSBmcm9tIHF1YWxpdHkgYnVja2V0c1xuICovXG5cbmltcG9ydCB7IFxuICBDbGFzc2lmaWVkTW92ZSwgXG4gIE1vdmVCdWNrZXQsIFxuICBCdWNrZXRDb25maWcsIFxuICBQaWNrZWRNb3ZlUmVzdWx0LFxuICBERUZBVUxUX0JVQ0tFVF9DT05GSUcgXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgZmluZENsb3Nlc3RBdmFpbGFibGVCdWNrZXQsIGdyb3VwTW92ZXNCeUJ1Y2tldCB9IGZyb20gJy4vbW92ZUNsYXNzaWZpZXInO1xuXG5leHBvcnQgdHlwZSBSYW5kb21OdW1iZXJHZW5lcmF0b3IgPSAoKSA9PiBudW1iZXI7XG5cbmludGVyZmFjZSBCdWNrZXRTZWxlY3Rpb24ge1xuICBidWNrZXQ6IE1vdmVCdWNrZXQ7XG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdO1xufVxuXG5mdW5jdGlvbiBnZXRCdWNrZXRPcmRlcigpOiBNb3ZlQnVja2V0W10ge1xuICByZXR1cm4gWydiZXN0JywgJ2dyZWF0JywgJ2V4Y2VsbGVudCcsICdnb29kJywgJ2luYWNjdXJhY3knLCAnbWlzdGFrZScsICdibHVuZGVyJ107XG59XG5cbmZ1bmN0aW9uIGdldEF2YWlsYWJsZUJ1Y2tldHMoXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICBjb25maWc6IEJ1Y2tldENvbmZpZyxcbik6IEJ1Y2tldFNlbGVjdGlvbltdIHtcbiAgY29uc3QgZ3JvdXBlZCA9IGdyb3VwTW92ZXNCeUJ1Y2tldChtb3Zlcyk7XG4gIGNvbnN0IGF2YWlsYWJsZUJ1Y2tldHM6IEJ1Y2tldFNlbGVjdGlvbltdID0gW107XG5cbiAgZm9yIChjb25zdCBidWNrZXQgb2YgZ2V0QnVja2V0T3JkZXIoKSkge1xuICAgIGNvbnN0IGJ1Y2tldE1vdmVzID0gZ3JvdXBlZC5nZXQoYnVja2V0KSB8fCBbXTtcbiAgICBpZiAoYnVja2V0TW92ZXMubGVuZ3RoID4gMCAmJiBjb25maWdbYnVja2V0XSA+IDApIHtcbiAgICAgIGF2YWlsYWJsZUJ1Y2tldHMucHVzaCh7IGJ1Y2tldCwgbW92ZXM6IGJ1Y2tldE1vdmVzIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdmFpbGFibGVCdWNrZXRzO1xufVxuXG5mdW5jdGlvbiBwaWNrV2VpZ2h0ZWRCdWNrZXQoXG4gIHdlaWdodGVkQnVja2V0czogQXJyYXk8eyBidWNrZXQ6IE1vdmVCdWNrZXQ7IHdlaWdodDogbnVtYmVyIH0+LFxuICByYW5kb206IFJhbmRvbU51bWJlckdlbmVyYXRvcixcbik6IE1vdmVCdWNrZXQgfCBudWxsIHtcbiAgY29uc3QgdG90YWxXZWlnaHQgPSB3ZWlnaHRlZEJ1Y2tldHMucmVkdWNlKChzdW0sIGVudHJ5KSA9PiBzdW0gKyBlbnRyeS53ZWlnaHQsIDApO1xuXG4gIGlmICh0b3RhbFdlaWdodCA8PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZXQgc2VsZWN0aW9uID0gcmFuZG9tKCkgKiB0b3RhbFdlaWdodDtcblxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIHdlaWdodGVkQnVja2V0cykge1xuICAgIHNlbGVjdGlvbiAtPSBlbnRyeS53ZWlnaHQ7XG4gICAgaWYgKHNlbGVjdGlvbiA8PSAwKSB7XG4gICAgICByZXR1cm4gZW50cnkuYnVja2V0O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB3ZWlnaHRlZEJ1Y2tldHNbd2VpZ2h0ZWRCdWNrZXRzLmxlbmd0aCAtIDFdPy5idWNrZXQgPz8gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tCdWNrZXRMZWdhY3koXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuICBjb25maWc6IEJ1Y2tldENvbmZpZyA9IERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgcmFuZG9tOiBSYW5kb21OdW1iZXJHZW5lcmF0b3IgPSBNYXRoLnJhbmRvbSxcbik6IEJ1Y2tldFNlbGVjdGlvbiB8IG51bGwge1xuICBpZiAobW92ZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBhdmFpbGFibGVCdWNrZXRzID0gZ2V0QXZhaWxhYmxlQnVja2V0cyhtb3ZlcywgY29uZmlnKTtcbiAgaWYgKGF2YWlsYWJsZUJ1Y2tldHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJ1Y2tldDogbW92ZXNbMF0uYnVja2V0LFxuICAgICAgbW92ZXM6IFttb3Zlc1swXV0sXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHdlaWdodGVkQnVja2V0cyA9IGF2YWlsYWJsZUJ1Y2tldHMubWFwKChlbnRyeSkgPT4gKHtcbiAgICBidWNrZXQ6IGVudHJ5LmJ1Y2tldCxcbiAgICB3ZWlnaHQ6IGNvbmZpZ1tlbnRyeS5idWNrZXRdLFxuICB9KSk7XG4gIGNvbnN0IHNlbGVjdGVkQnVja2V0ID0gcGlja1dlaWdodGVkQnVja2V0KHdlaWdodGVkQnVja2V0cywgcmFuZG9tKTtcblxuICBpZiAoIXNlbGVjdGVkQnVja2V0KSB7XG4gICAgcmV0dXJuIGF2YWlsYWJsZUJ1Y2tldHNbMF07XG4gIH1cblxuICByZXR1cm4gYXZhaWxhYmxlQnVja2V0cy5maW5kKChlbnRyeSkgPT4gZW50cnkuYnVja2V0ID09PSBzZWxlY3RlZEJ1Y2tldCkgPz8gYXZhaWxhYmxlQnVja2V0c1swXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tCdWNrZXRXaXRoQ2xvc2VzdEZhbGxiYWNrKFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgY29uZmlnOiBCdWNrZXRDb25maWcgPSBERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gIHJhbmRvbTogUmFuZG9tTnVtYmVyR2VuZXJhdG9yID0gTWF0aC5yYW5kb20sXG4pOiBCdWNrZXRTZWxlY3Rpb24gfCBudWxsIHtcbiAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgZ3JvdXBlZCA9IGdyb3VwTW92ZXNCeUJ1Y2tldChtb3Zlcyk7XG4gIGNvbnN0IHdlaWdodGVkQnVja2V0cyA9IGdldEJ1Y2tldE9yZGVyKClcbiAgICAuZmlsdGVyKChidWNrZXQpID0+IGNvbmZpZ1tidWNrZXRdID4gMClcbiAgICAubWFwKChidWNrZXQpID0+ICh7IGJ1Y2tldCwgd2VpZ2h0OiBjb25maWdbYnVja2V0XSB9KSk7XG4gIGNvbnN0IHNlbGVjdGVkQnVja2V0ID0gcGlja1dlaWdodGVkQnVja2V0KHdlaWdodGVkQnVja2V0cywgcmFuZG9tKTtcblxuICBpZiAoIXNlbGVjdGVkQnVja2V0KSB7XG4gICAgcmV0dXJuIHBpY2tCdWNrZXRMZWdhY3kobW92ZXMsIGNvbmZpZywgcmFuZG9tKTtcbiAgfVxuXG4gIGNvbnN0IHNlbGVjdGVkTW92ZXMgPSBncm91cGVkLmdldChzZWxlY3RlZEJ1Y2tldCkgfHwgW107XG4gIGlmIChzZWxlY3RlZE1vdmVzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgYnVja2V0OiBzZWxlY3RlZEJ1Y2tldCxcbiAgICAgIG1vdmVzOiBzZWxlY3RlZE1vdmVzLFxuICAgIH07XG4gIH1cblxuICBjb25zdCBhdmFpbGFibGVCdWNrZXRzID0gZ2V0QnVja2V0T3JkZXIoKS5maWx0ZXIoKGJ1Y2tldCkgPT4gKGdyb3VwZWQuZ2V0KGJ1Y2tldCkgfHwgW10pLmxlbmd0aCA+IDApO1xuICBjb25zdCBmYWxsYmFja0J1Y2tldCA9IGZpbmRDbG9zZXN0QXZhaWxhYmxlQnVja2V0KHNlbGVjdGVkQnVja2V0LCBhdmFpbGFibGVCdWNrZXRzKTtcbiAgaWYgKCFmYWxsYmFja0J1Y2tldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBidWNrZXQ6IGZhbGxiYWNrQnVja2V0LFxuICAgIG1vdmVzOiBncm91cGVkLmdldChmYWxsYmFja0J1Y2tldCkgfHwgW10sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWNrUmFuZG9tTW92ZUZyb21CdWNrZXQoXG4gIGJ1Y2tldFNlbGVjdGlvbjogQnVja2V0U2VsZWN0aW9uLFxuICByYW5kb206IFJhbmRvbU51bWJlckdlbmVyYXRvciA9IE1hdGgucmFuZG9tLFxuKTogQ2xhc3NpZmllZE1vdmUge1xuICBjb25zdCByYW5kb21Nb3ZlSW5kZXggPSBNYXRoLmZsb29yKHJhbmRvbSgpICogYnVja2V0U2VsZWN0aW9uLm1vdmVzLmxlbmd0aCk7XG4gIHJldHVybiBidWNrZXRTZWxlY3Rpb24ubW92ZXNbcmFuZG9tTW92ZUluZGV4XTtcbn1cblxuLyoqXG4gKiBQaWNrIGEgbW92ZSBiYXNlZCBvbiBidWNrZXQgY29uZmlndXJhdGlvbiAod2VpZ2h0ZWQgcmFuZG9tKVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGlja01vdmUoXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLCBcbiAgY29uZmlnOiBCdWNrZXRDb25maWcgPSBERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gIHJhbmRvbTogUmFuZG9tTnVtYmVyR2VuZXJhdG9yID0gTWF0aC5yYW5kb20sXG4pOiBQaWNrZWRNb3ZlUmVzdWx0IHwgbnVsbCB7XG4gIGNvbnN0IHNlbGVjdGVkQnVja2V0ID0gcGlja0J1Y2tldExlZ2FjeShtb3ZlcywgY29uZmlnLCByYW5kb20pO1xuICBpZiAoIXNlbGVjdGVkQnVja2V0KSByZXR1cm4gbnVsbDtcbiAgY29uc3Qgc2VsZWN0ZWRNb3ZlID0gcGlja1JhbmRvbU1vdmVGcm9tQnVja2V0KHNlbGVjdGVkQnVja2V0LCByYW5kb20pO1xuXG4gIHJldHVybiB7XG4gICAgbW92ZTogc2VsZWN0ZWRNb3ZlLFxuICAgIGJ1Y2tldDogc2VsZWN0ZWRCdWNrZXQuYnVja2V0LFxuICB9O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBidWNrZXQgY29uZmlnIHNvIHBlcmNlbnRhZ2VzIHN1bSB0byAxMDBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUJ1Y2tldENvbmZpZyhjb25maWc6IEJ1Y2tldENvbmZpZyk6IEJ1Y2tldENvbmZpZyB7XG4gIGNvbnN0IHRvdGFsID0gT2JqZWN0LnZhbHVlcyhjb25maWcpLnJlZHVjZSgoc3VtLCB2YWwpID0+IHN1bSArIHZhbCwgMCk7XG4gIFxuICBpZiAodG90YWwgPT09IDAgfHwgdG90YWwgPT09IDEwMCkge1xuICAgIHJldHVybiBjb25maWc7XG4gIH1cbiAgXG4gIGNvbnN0IGZhY3RvciA9IDEwMCAvIHRvdGFsO1xuICBcbiAgcmV0dXJuIHtcbiAgICBiZXN0OiBNYXRoLnJvdW5kKGNvbmZpZy5iZXN0ICogZmFjdG9yKSxcbiAgICBncmVhdDogTWF0aC5yb3VuZChjb25maWcuZ3JlYXQgKiBmYWN0b3IpLFxuICAgIGV4Y2VsbGVudDogTWF0aC5yb3VuZChjb25maWcuZXhjZWxsZW50ICogZmFjdG9yKSxcbiAgICBnb29kOiBNYXRoLnJvdW5kKGNvbmZpZy5nb29kICogZmFjdG9yKSxcbiAgICBpbmFjY3VyYWN5OiBNYXRoLnJvdW5kKGNvbmZpZy5pbmFjY3VyYWN5ICogZmFjdG9yKSxcbiAgICBtaXN0YWtlOiBNYXRoLnJvdW5kKGNvbmZpZy5taXN0YWtlICogZmFjdG9yKSxcbiAgICBibHVuZGVyOiBNYXRoLnJvdW5kKGNvbmZpZy5ibHVuZGVyICogZmFjdG9yKSxcbiAgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSBidWNrZXQgY29uZmlnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUJ1Y2tldENvbmZpZyhjb25maWc6IEJ1Y2tldENvbmZpZyk6IHsgdmFsaWQ6IGJvb2xlYW47IHRvdGFsOiBudW1iZXIgfSB7XG4gIGNvbnN0IHRvdGFsID0gT2JqZWN0LnZhbHVlcyhjb25maWcpLnJlZHVjZSgoc3VtLCB2YWwpID0+IHN1bSArIHZhbCwgMCk7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHRvdGFsID09PSAxMDAsXG4gICAgdG90YWwsXG4gIH07XG59XG5cbi8qKlxuICogR2V0IHByb2JhYmlsaXR5IG9mIHBpY2tpbmcgZnJvbSBlYWNoIGJ1Y2tldCBnaXZlbiBjdXJyZW50IGNvbmZpZyBhbmQgYXZhaWxhYmxlIG1vdmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFZmZlY3RpdmVQcm9iYWJpbGl0aWVzKFxuICBtb3ZlczogQ2xhc3NpZmllZE1vdmVbXSxcbiAgY29uZmlnOiBCdWNrZXRDb25maWdcbik6IFJlY29yZDxNb3ZlQnVja2V0LCBudW1iZXI+IHtcbiAgY29uc3QgZ3JvdXBlZCA9IGdyb3VwTW92ZXNCeUJ1Y2tldChtb3Zlcyk7XG4gIFxuICBjb25zdCBwcm9iYWJpbGl0aWVzOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPiA9IHtcbiAgICBiZXN0OiAwLFxuICAgIGdyZWF0OiAwLFxuICAgIGV4Y2VsbGVudDogMCxcbiAgICBnb29kOiAwLFxuICAgIGluYWNjdXJhY3k6IDAsXG4gICAgbWlzdGFrZTogMCxcbiAgICBibHVuZGVyOiAwLFxuICB9O1xuICBcbiAgLy8gQ2FsY3VsYXRlIGVmZmVjdGl2ZSB3ZWlnaHRzIChvbmx5IGJ1Y2tldHMgd2l0aCBtb3ZlcylcbiAgbGV0IHRvdGFsRWZmZWN0aXZlV2VpZ2h0ID0gMDtcbiAgY29uc3QgYnVja2V0czogTW92ZUJ1Y2tldFtdID0gWydiZXN0JywgJ2dyZWF0JywgJ2V4Y2VsbGVudCcsICdnb29kJywgJ2luYWNjdXJhY3knLCAnbWlzdGFrZScsICdibHVuZGVyJ107XG4gIFxuICBmb3IgKGNvbnN0IGJ1Y2tldCBvZiBidWNrZXRzKSB7XG4gICAgY29uc3QgYnVja2V0TW92ZXMgPSBncm91cGVkLmdldChidWNrZXQpIHx8IFtdO1xuICAgIGlmIChidWNrZXRNb3Zlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0b3RhbEVmZmVjdGl2ZVdlaWdodCArPSBjb25maWdbYnVja2V0XTtcbiAgICB9XG4gIH1cbiAgXG4gIGlmICh0b3RhbEVmZmVjdGl2ZVdlaWdodCA9PT0gMCkge1xuICAgIHJldHVybiBwcm9iYWJpbGl0aWVzO1xuICB9XG4gIFxuICAvLyBDYWxjdWxhdGUgbm9ybWFsaXplZCBwcm9iYWJpbGl0aWVzXG4gIGZvciAoY29uc3QgYnVja2V0IG9mIGJ1Y2tldHMpIHtcbiAgICBjb25zdCBidWNrZXRNb3ZlcyA9IGdyb3VwZWQuZ2V0KGJ1Y2tldCkgfHwgW107XG4gICAgaWYgKGJ1Y2tldE1vdmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHByb2JhYmlsaXRpZXNbYnVja2V0XSA9IChjb25maWdbYnVja2V0XSAvIHRvdGFsRWZmZWN0aXZlV2VpZ2h0KSAqIDEwMDtcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBwcm9iYWJpbGl0aWVzO1xufVxuIiwgImltcG9ydCB7IE1vdmVRdWFsaXR5UHJlc2V0SWQgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBGZWF0dXJlT3B0aW9ucyB7XG4gIHNlY3VyaXR5RGV2VG9vbHNPbmx5OiBib29sZWFuO1xuICBwZXJzaXN0RW5naW5lQ29uZmlnOiBib29sZWFuO1xuICB1c2VEZXRlcm1pbmlzdGljUm5nOiBib29sZWFuO1xuICB1c2VNb3ZlQW5hbHlzaXNDYWNoZTogYm9vbGVhbjtcbiAgdXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb246IGJvb2xlYW47XG4gIHVzZVBvc2l0aW9uQ29tcGxleGl0eTogYm9vbGVhbjtcbiAgdXNlUGVyc29uYUJlaGF2aW9yQmlhczogYm9vbGVhbjtcbiAgdXNlSHVtYW5EZWxheVNpbXVsYXRpb246IGJvb2xlYW47XG4gIHVzZUJyaWxsaWFudE1vdmVCdWRnZXQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCB0eXBlIEZlYXR1cmVPcHRpb25LZXkgPSBrZXlvZiBGZWF0dXJlT3B0aW9ucztcblxuZXhwb3J0IGludGVyZmFjZSBGZWF0dXJlT3B0aW9uRGVzY3JpcHRvciB7XG4gIGtleTogRmVhdHVyZU9wdGlvbktleTtcbiAgbGFiZWw6IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgUGVyc29uYUlkID0gTW92ZVF1YWxpdHlQcmVzZXRJZCB8ICdjdXN0b20nO1xuZXhwb3J0IHR5cGUgQnJpbGxpYW50TW92ZXNQZXJHYW1lID0gMCB8IDEgfCAyIHwgMyB8IDQ7XG5leHBvcnQgdHlwZSBCcmlsbGlhbnRBbGxvd2VkUGhhc2UgPSAnb3BlbmluZycgfCAnbWlkZGxlZ2FtZScgfCAnZW5kZ2FtZScgfCAnYW55JztcblxuZXhwb3J0IGludGVyZmFjZSBCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnIHtcbiAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiBCcmlsbGlhbnRNb3Zlc1BlckdhbWU7XG4gIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogQnJpbGxpYW50QWxsb3dlZFBoYXNlO1xuICBicmlsbGlhbnRVc2VkQ291bnQ6IG51bWJlcjtcbiAgYnJpbGxpYW50TW92ZU51bWJlcnM6IG51bWJlcltdO1xuICBnYW1lU2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9GRUFUVVJFX09QVElPTlM6IEZlYXR1cmVPcHRpb25zID0ge1xuICBzZWN1cml0eURldlRvb2xzT25seTogdHJ1ZSxcbiAgcGVyc2lzdEVuZ2luZUNvbmZpZzogdHJ1ZSxcbiAgdXNlRGV0ZXJtaW5pc3RpY1JuZzogZmFsc2UsXG4gIHVzZU1vdmVBbmFseXNpc0NhY2hlOiB0cnVlLFxuICB1c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbjogdHJ1ZSxcbiAgdXNlUG9zaXRpb25Db21wbGV4aXR5OiBmYWxzZSxcbiAgdXNlUGVyc29uYUJlaGF2aW9yQmlhczogZmFsc2UsXG4gIHVzZUh1bWFuRGVsYXlTaW11bGF0aW9uOiBmYWxzZSxcbiAgdXNlQnJpbGxpYW50TW92ZUJ1ZGdldDogZmFsc2UsXG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9CUklMTElBTlRfTU9WRV9CVURHRVRfQ09ORklHOiBCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnID0ge1xuICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IDAsXG4gIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogJ2FueScsXG4gIGJyaWxsaWFudFVzZWRDb3VudDogMCxcbiAgYnJpbGxpYW50TW92ZU51bWJlcnM6IFtdLFxuICBnYW1lU2Vzc2lvbklkOiBudWxsLFxufTtcblxuZXhwb3J0IGNvbnN0IEZFQVRVUkVfT1BUSU9OX0RFU0NSSVBUT1JTOiBGZWF0dXJlT3B0aW9uRGVzY3JpcHRvcltdID0gW1xuICB7XG4gICAga2V5OiAnc2VjdXJpdHlEZXZUb29sc09ubHknLFxuICAgIGxhYmVsOiAnRGV2VG9vbHMgT25seSBJbiBEZXZlbG9wbWVudCcsXG4gICAgZGVzY3JpcHRpb246ICdPcGVuIENocm9taXVtIERldlRvb2xzIG9ubHkgaW4gZGV2ZWxvcG1lbnQgbW9kZS4nLFxuICB9LFxuICB7XG4gICAga2V5OiAncGVyc2lzdEVuZ2luZUNvbmZpZycsXG4gICAgbGFiZWw6ICdQZXJzaXN0IEVuZ2luZSBDb25maWd1cmF0aW9uJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NhdmUgZGVwdGgsIE11bHRpUFYsIHByZXNldHMsIGJ1Y2tldCB3ZWlnaHRzLCBhbmQgYWR2YW5jZWQgZmVhdHVyZSBvcHRpb25zLicsXG4gIH0sXG4gIHtcbiAgICBrZXk6ICd1c2VEZXRlcm1pbmlzdGljUm5nJyxcbiAgICBsYWJlbDogJ0RldGVybWluaXN0aWMgUk5HJyxcbiAgICBkZXNjcmlwdGlvbjogJ1VzZSBhIHNlZWRlZCByYW5kb20gc291cmNlIHNvIG1vdmUgc2VsZWN0aW9uIGlzIHJlcHJvZHVjaWJsZS4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlTW92ZUFuYWx5c2lzQ2FjaGUnLFxuICAgIGxhYmVsOiAnQW5hbHlzaXMgQ2FjaGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmV1c2UgU3RvY2tmaXNoIGFuYWx5c2lzIGZvciB0aGUgc2FtZSBGRU4sIGRlcHRoLCBhbmQgTXVsdGlQViBzZXR0aW5ncy4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb24nLFxuICAgIGxhYmVsOiAnSW1wcm92ZWQgTW92ZSBDbGFzc2lmaWNhdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdLZWVwIHVua25vd24gbW92ZXMgc2VwYXJhdGUgYW5kIHVzZSBzbWFydGVyIGJ1Y2tldCBmYWxsYmFjayBzZWxlY3Rpb24uJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZVBvc2l0aW9uQ29tcGxleGl0eScsXG4gICAgbGFiZWw6ICdQb3NpdGlvbiBDb21wbGV4aXR5JyxcbiAgICBkZXNjcmlwdGlvbjogJ0FkanVzdCBtb3ZlIHF1YWxpdHkgd2VpZ2h0cyBiYXNlZCBvbiBob3cgc2hhcnAgdGhlIGN1cnJlbnQgcG9zaXRpb24gaXMuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZVBlcnNvbmFCZWhhdmlvckJpYXMnLFxuICAgIGxhYmVsOiAnUGVyc29uYSBCZWhhdmlvciBCaWFzJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xheWVyIHNpbXBsZSBhZ2dyZXNzaXZlIG9yIHNhZmUgbW92ZSBwcmVmZXJlbmNlcyBvbiB0b3Agb2YgYnVja2V0IHNlbGVjdGlvbi4nLFxuICB9LFxuICB7XG4gICAga2V5OiAndXNlSHVtYW5EZWxheVNpbXVsYXRpb24nLFxuICAgIGxhYmVsOiAnSHVtYW4gRGVsYXkgU2ltdWxhdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdEZWxheSBhdXRvLXBsYXkgbW92ZXMgYmFzZWQgb24gY29tcGxleGl0eSwgcGVyc29uYSwgYW5kIGNob3NlbiBtb3ZlIHF1YWxpdHkuJyxcbiAgfSxcbiAge1xuICAgIGtleTogJ3VzZUJyaWxsaWFudE1vdmVCdWRnZXQnLFxuICAgIGxhYmVsOiAnQnJpbGxpYW50IE1vdmUgQnVkZ2V0JyxcbiAgICBkZXNjcmlwdGlvbjogJ1Jlc2VydmUgYSBmaXhlZCBudW1iZXIgb2YgdGFjdGljYWwgYnJpbGxpYW50IG1vdmVzIGZvciBlYWNoIGdhbWUuJyxcbiAgfSxcbl07XG5cbmV4cG9ydCBjb25zdCBGRUFUVVJFX09QVElPTlNfU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX2ZlYXR1cmVfb3B0aW9ucyc7XG5leHBvcnQgY29uc3QgRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfZW5naW5lX2NvbmZpZyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUZlYXR1cmVPcHRpb25zKFxuICBwYXJ0aWFsPzogUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4gfCBudWxsLFxuKTogRmVhdHVyZU9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIC4uLkRFRkFVTFRfRkVBVFVSRV9PUFRJT05TLFxuICAgIC4uLihwYXJ0aWFsID8/IHt9KSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyhcbiAgcGFydGlhbD86IFBhcnRpYWw8QnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZz4gfCBudWxsLFxuKTogQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyB7XG4gIHJldHVybiB7XG4gICAgLi4uREVGQVVMVF9CUklMTElBTlRfTU9WRV9CVURHRVRfQ09ORklHLFxuICAgIC4uLihwYXJ0aWFsID8/IHt9KSxcbiAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogcGFydGlhbD8uYnJpbGxpYW50TW92ZU51bWJlcnMgPz8gREVGQVVMVF9CUklMTElBTlRfTU9WRV9CVURHRVRfQ09ORklHLmJyaWxsaWFudE1vdmVOdW1iZXJzLFxuICAgIGdhbWVTZXNzaW9uSWQ6IHBhcnRpYWw/LmdhbWVTZXNzaW9uSWQgPz8gREVGQVVMVF9CUklMTElBTlRfTU9WRV9CVURHRVRfQ09ORklHLmdhbWVTZXNzaW9uSWQsXG4gIH07XG59XG4iLCAiaW1wb3J0IHsgYWN0aW9uLCBtYWtlQXV0b09ic2VydmFibGUsIHJlYWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQge1xuICBCcmlsbGlhbnRBbGxvd2VkUGhhc2UsXG4gIEJyaWxsaWFudE1vdmVCdWRnZXRDb25maWcsXG4gIEJyaWxsaWFudE1vdmVzUGVyR2FtZSxcbiAgREVGQVVMVF9CUklMTElBTlRfTU9WRV9CVURHRVRfQ09ORklHLFxuICBERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyxcbiAgRkVBVFVSRV9PUFRJT05TX1NUT1JBR0VfS0VZLFxuICBGZWF0dXJlT3B0aW9uS2V5LFxuICBGZWF0dXJlT3B0aW9ucyxcbiAgbWVyZ2VCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnLFxuICBtZXJnZUZlYXR1cmVPcHRpb25zLFxufSBmcm9tICcuLi9lbmdpbmUvZmVhdHVyZU9wdGlvbnMnO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBXaW5kb3cge1xuICAgIHBlcnNvbmFDaGVzc0JyaWRnZT86IHtcbiAgICAgIHN5bmNGZWF0dXJlT3B0aW9uczogKG9wdGlvbnM6IEZlYXR1cmVPcHRpb25zKSA9PiB2b2lkO1xuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZlYXR1cmVPcHRpb25zVmlld01vZGVsIHtcbiAgb3B0aW9uczogRmVhdHVyZU9wdGlvbnMgPSB7IC4uLkRFRkFVTFRfRkVBVFVSRV9PUFRJT05TIH07XG4gIGJyaWxsaWFudENvbmZpZzogQnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZyA9IHsgLi4uREVGQVVMVF9CUklMTElBTlRfTU9WRV9CVURHRVRfQ09ORklHIH07XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldE9wdGlvbjogYWN0aW9uLFxuICAgICAgc2V0T3B0aW9uczogYWN0aW9uLFxuICAgICAgYXBwbHlQcm9maWxlU2V0dGluZ3M6IGFjdGlvbixcbiAgICAgIHNldEJyaWxsaWFudE1vdmVzUGVyR2FtZTogYWN0aW9uLFxuICAgICAgc2V0QnJpbGxpYW50QWxsb3dlZFBoYXNlOiBhY3Rpb24sXG4gICAgICByZWNvbmNpbGVCcmlsbGlhbnRUcmFja2luZzogYWN0aW9uLFxuICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZzogYWN0aW9uLFxuICAgICAgcmVzZXRUb0RlZmF1bHRzOiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc3RvcmVGcm9tU3RvcmFnZSgpO1xuXG4gICAgcmVhY3Rpb24oXG4gICAgICAoKSA9PiAoe1xuICAgICAgICBvcHRpb25zOiB7IC4uLnRoaXMub3B0aW9ucyB9LFxuICAgICAgICBicmlsbGlhbnRDb25maWc6IHtcbiAgICAgICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgICAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogWy4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVOdW1iZXJzXSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgKHNuYXBzaG90KSA9PiB7XG4gICAgICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgICAgICB0aGlzLnN5bmNUb01haW5Qcm9jZXNzKHNuYXBzaG90Lm9wdGlvbnMpO1xuICAgICAgfSxcbiAgICAgIHsgZmlyZUltbWVkaWF0ZWx5OiB0cnVlIH0sXG4gICAgKTtcbiAgfVxuXG4gIHNldE9wdGlvbjxLZXkgZXh0ZW5kcyBGZWF0dXJlT3B0aW9uS2V5PihrZXk6IEtleSwgdmFsdWU6IEZlYXR1cmVPcHRpb25zW0tleV0pOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAuLi50aGlzLm9wdGlvbnMsXG4gICAgICBba2V5XTogdmFsdWUsXG4gICAgfTtcblxuICAgIGlmIChrZXkgPT09ICdwZXJzaXN0RW5naW5lQ29uZmlnJyAmJiB2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuY2xlYXJQZXJzaXN0ZWRTdG9yYWdlKCk7XG4gICAgfVxuICB9XG5cbiAgc2V0T3B0aW9ucyhvcHRpb25zOiBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPik6IHZvaWQge1xuICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlRmVhdHVyZU9wdGlvbnMoe1xuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcbiAgfVxuXG4gIGFwcGx5UHJvZmlsZVNldHRpbmdzKFxuICAgIG9wdGlvbnM6IFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+LFxuICAgIGJyaWxsaWFudFNldHRpbmdzOiBQYXJ0aWFsPFBpY2s8QnJpbGxpYW50TW92ZUJ1ZGdldENvbmZpZywgJ2JyaWxsaWFudE1vdmVzUGVyR2FtZScgfCAnYnJpbGxpYW50QWxsb3dlZFBoYXNlJz4+LFxuICApOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBtZXJnZUZlYXR1cmVPcHRpb25zKHtcbiAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSk7XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogYnJpbGxpYW50U2V0dGluZ3MuYnJpbGxpYW50TW92ZXNQZXJHYW1lID8/IHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVzUGVyR2FtZSxcbiAgICAgIGJyaWxsaWFudEFsbG93ZWRQaGFzZTogYnJpbGxpYW50U2V0dGluZ3MuYnJpbGxpYW50QWxsb3dlZFBoYXNlID8/IHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudEFsbG93ZWRQaGFzZSxcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudFVzZWRDb3VudCA+IHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVzUGVyR2FtZSkge1xuICAgICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgICBicmlsbGlhbnRVc2VkQ291bnQ6IHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVzUGVyR2FtZSxcbiAgICAgICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVOdW1iZXJzLnNsaWNlKDAsIHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVzUGVyR2FtZSksXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHNldEJyaWxsaWFudE1vdmVzUGVyR2FtZSh2YWx1ZTogQnJpbGxpYW50TW92ZXNQZXJHYW1lKTogdm9pZCB7XG4gICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAuLi50aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogdmFsdWUsXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRVc2VkQ291bnQgPiB2YWx1ZSkge1xuICAgICAgdGhpcy5icmlsbGlhbnRDb25maWcgPSB7XG4gICAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgICBicmlsbGlhbnRVc2VkQ291bnQ6IHZhbHVlLFxuICAgICAgICBicmlsbGlhbnRNb3ZlTnVtYmVyczogdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZU51bWJlcnMuc2xpY2UoMCwgdmFsdWUpLFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBzZXRCcmlsbGlhbnRBbGxvd2VkUGhhc2UodmFsdWU6IEJyaWxsaWFudEFsbG93ZWRQaGFzZSk6IHZvaWQge1xuICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5icmlsbGlhbnRDb25maWcsXG4gICAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IHZhbHVlLFxuICAgIH07XG4gIH1cblxuICByZWNvbmNpbGVCcmlsbGlhbnRUcmFja2luZyhcbiAgICBnYW1lU2Vzc2lvbklkOiBzdHJpbmcsXG4gICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IG51bWJlcltdLFxuICApOiB2b2lkIHtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgZ2FtZVNlc3Npb25JZCxcbiAgICAgIGJyaWxsaWFudFVzZWRDb3VudDogYnJpbGxpYW50TW92ZU51bWJlcnMubGVuZ3RoLFxuICAgICAgYnJpbGxpYW50TW92ZU51bWJlcnM6IFsuLi5icmlsbGlhbnRNb3ZlTnVtYmVyc10sXG4gICAgfTtcbiAgfVxuXG4gIHJlc2V0QnJpbGxpYW50VHJhY2tpbmcoZ2FtZVNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCA9IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuYnJpbGxpYW50Q29uZmlnLFxuICAgICAgZ2FtZVNlc3Npb25JZCxcbiAgICAgIGJyaWxsaWFudFVzZWRDb3VudDogMCxcbiAgICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgcmVzZXRUb0RlZmF1bHRzKCk6IHZvaWQge1xuICAgIHRoaXMub3B0aW9ucyA9IHsgLi4uREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfTtcbiAgICB0aGlzLmJyaWxsaWFudENvbmZpZyA9IHsgLi4uREVGQVVMVF9CUklMTElBTlRfTU9WRV9CVURHRVRfQ09ORklHIH07XG4gIH1cblxuICBwcml2YXRlIHJlc3RvcmVGcm9tU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShGRUFUVVJFX09QVElPTlNfU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKCFzYXZlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzXG4gICAgICAgIHwgUGFydGlhbDxGZWF0dXJlT3B0aW9ucz5cbiAgICAgICAgfCB7IG9wdGlvbnM/OiBQYXJ0aWFsPEZlYXR1cmVPcHRpb25zPjsgYnJpbGxpYW50Q29uZmlnPzogUGFydGlhbDxCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnPiB9O1xuXG4gICAgICBpZiAoJ29wdGlvbnMnIGluIHBhcnNlZCB8fCAnYnJpbGxpYW50Q29uZmlnJyBpbiBwYXJzZWQpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gbWVyZ2VGZWF0dXJlT3B0aW9ucyhwYXJzZWQub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuYnJpbGxpYW50Q29uZmlnID0gbWVyZ2VCcmlsbGlhbnRNb3ZlQnVkZ2V0Q29uZmlnKHBhcnNlZC5icmlsbGlhbnRDb25maWcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlRmVhdHVyZU9wdGlvbnMocGFyc2VkIGFzIFBhcnRpYWw8RmVhdHVyZU9wdGlvbnM+KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0ZlYXR1cmVPcHRpb25zVmlld01vZGVsXSBGYWlsZWQgdG8gcmVzdG9yZSBmZWF0dXJlIG9wdGlvbnM6JywgZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGVyc2lzdFRvU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucGVyc2lzdEVuZ2luZUNvbmZpZykge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShGRUFUVVJFX09QVElPTlNfU1RPUkFHRV9LRVkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICBGRUFUVVJFX09QVElPTlNfU1RPUkFHRV9LRVksXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgYnJpbGxpYW50Q29uZmlnOiB0aGlzLmJyaWxsaWFudENvbmZpZyxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWxdIEZhaWxlZCB0byBwZXJzaXN0IGZlYXR1cmUgb3B0aW9uczonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclBlcnNpc3RlZFN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKEZFQVRVUkVfT1BUSU9OU19TVE9SQUdFX0tFWSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbF0gRmFpbGVkIHRvIGNsZWFyIGZlYXR1cmUgb3B0aW9ucyBzdG9yYWdlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN5bmNUb01haW5Qcm9jZXNzKG9wdGlvbnM6IEZlYXR1cmVPcHRpb25zKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2VyaWFsaXphYmxlT3B0aW9ucyA9IG1lcmdlRmVhdHVyZU9wdGlvbnMoe1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9KTtcblxuICAgIHdpbmRvdy5wZXJzb25hQ2hlc3NCcmlkZ2U/LnN5bmNGZWF0dXJlT3B0aW9ucyhzZXJpYWxpemFibGVPcHRpb25zKTtcbiAgfVxuXG4gIGdldCBzZWN1cml0eURldlRvb2xzT25seSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnNlY3VyaXR5RGV2VG9vbHNPbmx5O1xuICB9XG5cbiAgZ2V0IHBlcnNpc3RFbmdpbmVDb25maWcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5wZXJzaXN0RW5naW5lQ29uZmlnO1xuICB9XG5cbiAgZ2V0IHVzZURldGVybWluaXN0aWNSbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VEZXRlcm1pbmlzdGljUm5nO1xuICB9XG5cbiAgZ2V0IHVzZU1vdmVBbmFseXNpc0NhY2hlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlTW92ZUFuYWx5c2lzQ2FjaGU7XG4gIH1cblxuICBnZXQgdXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbjtcbiAgfVxuXG4gIGdldCB1c2VQb3NpdGlvbkNvbXBsZXhpdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VQb3NpdGlvbkNvbXBsZXhpdHk7XG4gIH1cblxuICBnZXQgdXNlUGVyc29uYUJlaGF2aW9yQmlhcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnVzZVBlcnNvbmFCZWhhdmlvckJpYXM7XG4gIH1cblxuICBnZXQgdXNlSHVtYW5EZWxheVNpbXVsYXRpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy51c2VIdW1hbkRlbGF5U2ltdWxhdGlvbjtcbiAgfVxuXG4gIGdldCB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudXNlQnJpbGxpYW50TW92ZUJ1ZGdldDtcbiAgfVxuXG4gIGdldCBicmlsbGlhbnRNb3Zlc1BlckdhbWUoKTogQnJpbGxpYW50TW92ZXNQZXJHYW1lIHtcbiAgICByZXR1cm4gdGhpcy5icmlsbGlhbnRDb25maWcuYnJpbGxpYW50TW92ZXNQZXJHYW1lO1xuICB9XG5cbiAgZ2V0IGJyaWxsaWFudEFsbG93ZWRQaGFzZSgpOiBCcmlsbGlhbnRBbGxvd2VkUGhhc2Uge1xuICAgIHJldHVybiB0aGlzLmJyaWxsaWFudENvbmZpZy5icmlsbGlhbnRBbGxvd2VkUGhhc2U7XG4gIH1cblxuICBnZXQgYnJpbGxpYW50VXNlZENvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudFVzZWRDb3VudDtcbiAgfVxuXG4gIGdldCBicmlsbGlhbnRNb3ZlTnVtYmVycygpOiBudW1iZXJbXSB7XG4gICAgcmV0dXJuIHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVOdW1iZXJzO1xuICB9XG5cbiAgZ2V0IGJyaWxsaWFudEdhbWVTZXNzaW9uSWQoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuYnJpbGxpYW50Q29uZmlnLmdhbWVTZXNzaW9uSWQ7XG4gIH1cblxuICBnZXQgaGFzUmVtYWluaW5nQnJpbGxpYW50TW92ZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudFVzZWRDb3VudCA8IHRoaXMuYnJpbGxpYW50Q29uZmlnLmJyaWxsaWFudE1vdmVzUGVyR2FtZTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgPSBuZXcgRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwoKTtcbiIsICJpbXBvcnQgeyBDaGVzcywgUGllY2VTeW1ib2wgfSBmcm9tICdjaGVzcy5qcyc7XG5pbXBvcnQgeyBDbGFzc2lmaWVkTW92ZSwgTW92ZUJ1Y2tldCB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgUmFuZG9tU291cmNlIH0gZnJvbSAnLi9yYW5kb20nO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJyaWxsaWFudE1vdmVDYW5kaWRhdGUge1xuICBtb3ZlOiBDbGFzc2lmaWVkTW92ZTtcbiAgdGFjdGljYWxTY29yZTogbnVtYmVyO1xufVxuXG5jb25zdCBQSUVDRV9WQUxVRVM6IFJlY29yZDxQaWVjZVN5bWJvbCwgbnVtYmVyPiA9IHtcbiAgcDogMSxcbiAgbjogMyxcbiAgYjogMyxcbiAgcjogNSxcbiAgcTogOSxcbiAgazogMCxcbn07XG5cbmNvbnN0IEJSSUxMSUFOVF9CVUNLRVRTOiBNb3ZlQnVja2V0W10gPSBbJ2Jlc3QnLCAnZ3JlYXQnXTtcblxuZnVuY3Rpb24gZ2V0UGllY2VWYWx1ZSh0eXBlPzogUGllY2VTeW1ib2wpOiBudW1iZXIge1xuICByZXR1cm4gdHlwZSA/IFBJRUNFX1ZBTFVFU1t0eXBlXSA6IDA7XG59XG5cbmZ1bmN0aW9uIGdldFRhY3RpY2FsU2NvcmUoZmVuOiBzdHJpbmcsIG1vdmU6IENsYXNzaWZpZWRNb3ZlLCBiZXN0RXZhbHVhdGlvbjogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgY2hlc3MgPSBuZXcgQ2hlc3MoZmVuKTtcbiAgY29uc3QgZnJvbSA9IG1vdmUubW92ZS5zbGljZSgwLCAyKTtcbiAgY29uc3QgdG8gPSBtb3ZlLm1vdmUuc2xpY2UoMiwgNCk7XG4gIGNvbnN0IG1vdmluZ1BpZWNlID0gY2hlc3MuZ2V0KGZyb20pO1xuICBjb25zdCB0YXJnZXRQaWVjZSA9IGNoZXNzLmdldCh0byk7XG4gIGNvbnN0IHBsYXllZE1vdmUgPSBjaGVzcy5tb3ZlKHtcbiAgICBmcm9tLFxuICAgIHRvLFxuICAgIHByb21vdGlvbjogbW92ZS5tb3ZlWzRdIGFzICdxJyB8ICdyJyB8ICdiJyB8ICduJyB8IHVuZGVmaW5lZCxcbiAgfSk7XG5cbiAgaWYgKCFwbGF5ZWRNb3ZlKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBjb25zdCBpc0NhcHR1cmUgPSBwbGF5ZWRNb3ZlLmZsYWdzLmluY2x1ZGVzKCdjJykgfHwgcGxheWVkTW92ZS5mbGFncy5pbmNsdWRlcygnZScpO1xuICBjb25zdCBpc1Byb21vdGlvbiA9IEJvb2xlYW4ocGxheWVkTW92ZS5wcm9tb3Rpb24pO1xuICBjb25zdCBpc0NoZWNrID0gY2hlc3MuaXNDaGVjaygpO1xuICBjb25zdCBldmFsR2FpbiA9IE1hdGgubWF4KDAsIGJlc3RFdmFsdWF0aW9uIC0gbW92ZS5ldmFsdWF0aW9uKTtcbiAgY29uc3QgbWF0ZXJpYWxTd2luZyA9IGdldFBpZWNlVmFsdWUodGFyZ2V0UGllY2U/LnR5cGUpIC0gZ2V0UGllY2VWYWx1ZShtb3ZpbmdQaWVjZT8udHlwZSk7XG4gIGNvbnN0IGlzU2FjcmlmaWNlID0gaXNDYXB0dXJlICYmIG1hdGVyaWFsU3dpbmcgPCAwO1xuXG4gIGxldCB0YWN0aWNhbFNjb3JlID0gMDtcbiAgdGFjdGljYWxTY29yZSArPSBpc0NoZWNrID8gMiA6IDA7XG4gIHRhY3RpY2FsU2NvcmUgKz0gaXNDYXB0dXJlID8gMS41IDogMDtcbiAgdGFjdGljYWxTY29yZSArPSBpc1Byb21vdGlvbiA/IDIuNSA6IDA7XG4gIHRhY3RpY2FsU2NvcmUgKz0gaXNTYWNyaWZpY2UgPyAxLjc1IDogMDtcbiAgdGFjdGljYWxTY29yZSArPSBldmFsR2FpbiA+PSA4MCA/IDEuNSA6IGV2YWxHYWluID49IDQwID8gMC43NSA6IDA7XG5cbiAgcmV0dXJuIHRhY3RpY2FsU2NvcmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCcmlsbGlhbnRNb3ZlQ2FuZGlkYXRlcyhcbiAgZmVuOiBzdHJpbmcsXG4gIG1vdmVzOiBDbGFzc2lmaWVkTW92ZVtdLFxuKTogQnJpbGxpYW50TW92ZUNhbmRpZGF0ZVtdIHtcbiAgaWYgKG1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0IGJlc3RFdmFsdWF0aW9uID0gbW92ZXNbMF0uZXZhbHVhdGlvbjtcblxuICByZXR1cm4gbW92ZXNcbiAgICAuZmlsdGVyKG1vdmUgPT4gQlJJTExJQU5UX0JVQ0tFVFMuaW5jbHVkZXMobW92ZS5idWNrZXQpKVxuICAgIC5tYXAobW92ZSA9PiAoe1xuICAgICAgbW92ZSxcbiAgICAgIHRhY3RpY2FsU2NvcmU6IGdldFRhY3RpY2FsU2NvcmUoZmVuLCBtb3ZlLCBiZXN0RXZhbHVhdGlvbiksXG4gICAgfSkpXG4gICAgLmZpbHRlcihjYW5kaWRhdGUgPT4gY2FuZGlkYXRlLnRhY3RpY2FsU2NvcmUgPiAwKVxuICAgIC5zb3J0KChsZWZ0LCByaWdodCkgPT4gcmlnaHQudGFjdGljYWxTY29yZSAtIGxlZnQudGFjdGljYWxTY29yZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwaWNrQnJpbGxpYW50TW92ZShcbiAgY2FuZGlkYXRlczogQnJpbGxpYW50TW92ZUNhbmRpZGF0ZVtdLFxuICByYW5kb21Tb3VyY2U6IFJhbmRvbVNvdXJjZSxcbik6IENsYXNzaWZpZWRNb3ZlIHwgbnVsbCB7XG4gIGlmIChjYW5kaWRhdGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgdG90YWxXZWlnaHQgPSBjYW5kaWRhdGVzLnJlZHVjZSgoc3VtLCBjYW5kaWRhdGUpID0+IHN1bSArIGNhbmRpZGF0ZS50YWN0aWNhbFNjb3JlLCAwKTtcbiAgbGV0IHNlbGVjdGlvbiA9IHJhbmRvbVNvdXJjZS5uZXh0KCkgKiB0b3RhbFdlaWdodDtcblxuICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzKSB7XG4gICAgc2VsZWN0aW9uIC09IGNhbmRpZGF0ZS50YWN0aWNhbFNjb3JlO1xuICAgIGlmIChzZWxlY3Rpb24gPD0gMCkge1xuICAgICAgcmV0dXJuIGNhbmRpZGF0ZS5tb3ZlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjYW5kaWRhdGVzW2NhbmRpZGF0ZXMubGVuZ3RoIC0gMV0ubW92ZTtcbn1cbiIsICJpbXBvcnQgeyBDaGVzcywgUGllY2VTeW1ib2wgfSBmcm9tICdjaGVzcy5qcyc7XG5cbmV4cG9ydCB0eXBlIEdhbWVQaGFzZSA9ICdvcGVuaW5nJyB8ICdtaWRkbGVnYW1lJyB8ICdlbmRnYW1lJztcblxuY29uc3QgUElFQ0VfVkFMVUVTOiBSZWNvcmQ8UGllY2VTeW1ib2wsIG51bWJlcj4gPSB7XG4gIHA6IDEsXG4gIG46IDMsXG4gIGI6IDMsXG4gIHI6IDUsXG4gIHE6IDksXG4gIGs6IDAsXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIEdhbWVQaGFzZVJlc3VsdCB7XG4gIHBoYXNlOiBHYW1lUGhhc2U7XG4gIHRvdGFsTWF0ZXJpYWw6IG51bWJlcjtcbiAgcXVlZW5zVHJhZGVkOiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VG90YWxNYXRlcmlhbChmZW46IHN0cmluZyk6IG51bWJlciB7XG4gIGNvbnN0IGNoZXNzID0gbmV3IENoZXNzKGZlbik7XG4gIHJldHVybiBjaGVzc1xuICAgIC5ib2FyZCgpXG4gICAgLmZsYXQoKVxuICAgIC5yZWR1Y2UoKHRvdGFsLCBwaWVjZSkgPT4gdG90YWwgKyAocGllY2UgPyBQSUVDRV9WQUxVRVNbcGllY2UudHlwZV0gOiAwKSwgMCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcmVRdWVlbnNUcmFkZWQoZmVuOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgY2hlc3MgPSBuZXcgQ2hlc3MoZmVuKTtcbiAgY29uc3QgcXVlZW5zID0gY2hlc3NcbiAgICAuYm9hcmQoKVxuICAgIC5mbGF0KClcbiAgICAuZmlsdGVyKHBpZWNlID0+IHBpZWNlPy50eXBlID09PSAncScpLmxlbmd0aDtcblxuICByZXR1cm4gcXVlZW5zIDwgMjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdEdhbWVQaGFzZShmZW46IHN0cmluZywgbW92ZU51bWJlcjogbnVtYmVyKTogR2FtZVBoYXNlUmVzdWx0IHtcbiAgY29uc3QgdG90YWxNYXRlcmlhbCA9IGdldFRvdGFsTWF0ZXJpYWwoZmVuKTtcbiAgY29uc3QgcXVlZW5zVHJhZGVkID0gYXJlUXVlZW5zVHJhZGVkKGZlbik7XG5cbiAgaWYgKG1vdmVOdW1iZXIgPD0gMTApIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGhhc2U6ICdvcGVuaW5nJyxcbiAgICAgIHRvdGFsTWF0ZXJpYWwsXG4gICAgICBxdWVlbnNUcmFkZWQsXG4gICAgfTtcbiAgfVxuXG4gIGlmIChxdWVlbnNUcmFkZWQgfHwgdG90YWxNYXRlcmlhbCA8PSAyNCkge1xuICAgIHJldHVybiB7XG4gICAgICBwaGFzZTogJ2VuZGdhbWUnLFxuICAgICAgdG90YWxNYXRlcmlhbCxcbiAgICAgIHF1ZWVuc1RyYWRlZCxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwaGFzZTogJ21pZGRsZWdhbWUnLFxuICAgIHRvdGFsTWF0ZXJpYWwsXG4gICAgcXVlZW5zVHJhZGVkLFxuICB9O1xufVxuIiwgImltcG9ydCB7IEJ1Y2tldENvbmZpZywgTW92ZUJ1Y2tldCwgQW5hbHl6ZWRNb3ZlIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0IHtcbiAgbGV2ZWw6ICdsb3cnIHwgJ21lZGl1bScgfCAnaGlnaCc7XG4gIHNjb3JlOiBudW1iZXI7XG4gIHNwcmVhZDogbnVtYmVyO1xuICBjbG9zZUNhbmRpZGF0ZXM6IG51bWJlcjtcbiAgdm9sYXRpbGl0eTogbnVtYmVyO1xufVxuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZTogbnVtYmVyLCBtaW4gPSAwLCBtYXggPSAxKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgubWluKG1heCwgTWF0aC5tYXgobWluLCB2YWx1ZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb25Db21wbGV4aXR5KFxuICBtb3ZlczogQW5hbHl6ZWRNb3ZlW10sXG4pOiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQge1xuICBpZiAobW92ZXMubGVuZ3RoIDw9IDEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGV2ZWw6ICdsb3cnLFxuICAgICAgc2NvcmU6IDAsXG4gICAgICBzcHJlYWQ6IDAsXG4gICAgICBjbG9zZUNhbmRpZGF0ZXM6IG1vdmVzLmxlbmd0aCxcbiAgICAgIHZvbGF0aWxpdHk6IDAsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGV2YWx1YXRpb25zID0gbW92ZXMubWFwKChtb3ZlKSA9PiBtb3ZlLmV2YWx1YXRpb24pLnNvcnQoKGEsIGIpID0+IGIgLSBhKTtcbiAgY29uc3QgYmVzdCA9IGV2YWx1YXRpb25zWzBdO1xuICBjb25zdCBzcHJlYWQgPSBNYXRoLmFicyhiZXN0IC0gZXZhbHVhdGlvbnNbZXZhbHVhdGlvbnMubGVuZ3RoIC0gMV0pO1xuICBjb25zdCBjbG9zZUNhbmRpZGF0ZXMgPSBtb3Zlcy5maWx0ZXIoKG1vdmUpID0+IE1hdGguYWJzKGJlc3QgLSBtb3ZlLmV2YWx1YXRpb24pIDw9IDM1KS5sZW5ndGg7XG4gIGNvbnN0IHZvbGF0aWxpdHkgPSBtb3Zlcy5sZW5ndGggPiAxXG4gICAgPyBNYXRoLmFicyhiZXN0IC0gZXZhbHVhdGlvbnNbTWF0aC5taW4oMiwgZXZhbHVhdGlvbnMubGVuZ3RoIC0gMSldKVxuICAgIDogMDtcblxuICBjb25zdCBzcHJlYWRGYWN0b3IgPSAxIC0gY2xhbXAoc3ByZWFkIC8gMjUwKTtcbiAgY29uc3QgY2xvc2VGYWN0b3IgPSBjbGFtcCgoY2xvc2VDYW5kaWRhdGVzIC0gMSkgLyA1KTtcbiAgY29uc3Qgdm9sYXRpbGl0eUZhY3RvciA9IGNsYW1wKHZvbGF0aWxpdHkgLyAxNTApO1xuICBjb25zdCBzY29yZSA9IGNsYW1wKHNwcmVhZEZhY3RvciAqIDAuNDUgKyBjbG9zZUZhY3RvciAqIDAuMzUgKyB2b2xhdGlsaXR5RmFjdG9yICogMC4yKTtcblxuICBsZXQgbGV2ZWw6IFBvc2l0aW9uQ29tcGxleGl0eVJlc3VsdFsnbGV2ZWwnXSA9ICdtZWRpdW0nO1xuICBpZiAoc2NvcmUgPCAwLjMzKSBsZXZlbCA9ICdsb3cnO1xuICBpZiAoc2NvcmUgPiAwLjY2KSBsZXZlbCA9ICdoaWdoJztcblxuICByZXR1cm4ge1xuICAgIGxldmVsLFxuICAgIHNjb3JlLFxuICAgIHNwcmVhZCxcbiAgICBjbG9zZUNhbmRpZGF0ZXMsXG4gICAgdm9sYXRpbGl0eSxcbiAgfTtcbn1cblxuY29uc3QgQlVDS0VUX09SREVSOiBNb3ZlQnVja2V0W10gPSBbXG4gICdiZXN0JyxcbiAgJ2dyZWF0JyxcbiAgJ2V4Y2VsbGVudCcsXG4gICdnb29kJyxcbiAgJ2luYWNjdXJhY3knLFxuICAnbWlzdGFrZScsXG4gICdibHVuZGVyJyxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGp1c3RCdWNrZXRDb25maWdGb3JDb21wbGV4aXR5KFxuICBjb25maWc6IEJ1Y2tldENvbmZpZyxcbiAgY29tcGxleGl0eTogUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0LFxuKTogQnVja2V0Q29uZmlnIHtcbiAgY29uc3QgYWRqdXN0ZWQgPSB7IC4uLmNvbmZpZyB9O1xuICBjb25zdCBpbnRlbnNpdHkgPSBjb21wbGV4aXR5LnNjb3JlO1xuXG4gIGlmIChjb21wbGV4aXR5LmxldmVsID09PSAnaGlnaCcpIHtcbiAgICBhZGp1c3RlZC5iZXN0ID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuYmVzdCAtIE1hdGgucm91bmQoNiAqIGludGVuc2l0eSkpO1xuICAgIGFkanVzdGVkLmdyZWF0ID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQuZ3JlYXQgLSBNYXRoLnJvdW5kKDMgKiBpbnRlbnNpdHkpKTtcbiAgICBhZGp1c3RlZC5pbmFjY3VyYWN5ICs9IE1hdGgucm91bmQoNCAqIGludGVuc2l0eSk7XG4gICAgYWRqdXN0ZWQubWlzdGFrZSArPSBNYXRoLnJvdW5kKDMgKiBpbnRlbnNpdHkpO1xuICAgIGFkanVzdGVkLmJsdW5kZXIgKz0gTWF0aC5yb3VuZCgyICogaW50ZW5zaXR5KTtcbiAgfSBlbHNlIGlmIChjb21wbGV4aXR5LmxldmVsID09PSAnbG93Jykge1xuICAgIGFkanVzdGVkLmJlc3QgKz0gTWF0aC5yb3VuZCg1ICogKDEgLSBpbnRlbnNpdHkpKTtcbiAgICBhZGp1c3RlZC5ncmVhdCArPSBNYXRoLnJvdW5kKDMgKiAoMSAtIGludGVuc2l0eSkpO1xuICAgIGFkanVzdGVkLmV4Y2VsbGVudCArPSBNYXRoLnJvdW5kKDIgKiAoMSAtIGludGVuc2l0eSkpO1xuICAgIGFkanVzdGVkLm1pc3Rha2UgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5taXN0YWtlIC0gMik7XG4gICAgYWRqdXN0ZWQuYmx1bmRlciA9IE1hdGgubWF4KDAsIGFkanVzdGVkLmJsdW5kZXIgLSAxKTtcbiAgfVxuXG4gIGNvbnN0IHRvdGFsID0gQlVDS0VUX09SREVSLnJlZHVjZSgoc3VtLCBidWNrZXQpID0+IHN1bSArIGFkanVzdGVkW2J1Y2tldF0sIDApO1xuICBpZiAodG90YWwgPD0gMCkge1xuICAgIHJldHVybiBjb25maWc7XG4gIH1cblxuICBjb25zdCBub3JtYWxpemVkID0gQlVDS0VUX09SREVSLnJlZHVjZSgocmVzdWx0LCBidWNrZXQpID0+IHtcbiAgICByZXN1bHRbYnVja2V0XSA9IE1hdGgucm91bmQoKGFkanVzdGVkW2J1Y2tldF0gLyB0b3RhbCkgKiAxMDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sIHt9IGFzIEJ1Y2tldENvbmZpZyk7XG5cbiAgY29uc3Qgbm9ybWFsaXplZFRvdGFsID0gQlVDS0VUX09SREVSLnJlZHVjZSgoc3VtLCBidWNrZXQpID0+IHN1bSArIG5vcm1hbGl6ZWRbYnVja2V0XSwgMCk7XG4gIGNvbnN0IGRpZmYgPSAxMDAgLSBub3JtYWxpemVkVG90YWw7XG4gIG5vcm1hbGl6ZWQuYmVzdCArPSBkaWZmO1xuXG4gIHJldHVybiBub3JtYWxpemVkO1xufVxuIiwgImltcG9ydCB7IENoZXNzIH0gZnJvbSAnY2hlc3MuanMnO1xuaW1wb3J0IHsgUGVyc29uYUlkIH0gZnJvbSAnLi9mZWF0dXJlT3B0aW9ucyc7XG5pbXBvcnQgeyBDbGFzc2lmaWVkTW92ZSwgTW92ZUJ1Y2tldCB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgUmFuZG9tU291cmNlIH0gZnJvbSAnLi9yYW5kb20nO1xuaW1wb3J0IHsgUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0IH0gZnJvbSAnLi9wb3NpdGlvbkNvbXBsZXhpdHknO1xuXG5leHBvcnQgdHlwZSBQZXJzb25hQmVoYXZpb3JNb2RlID0gJ2FnZ3Jlc3NpdmUnIHwgJ3NhZmUnIHwgJ2JhbGFuY2VkJztcblxuY29uc3QgU0FGRV9CVUNLRVRTOiBNb3ZlQnVja2V0W10gPSBbJ2Jlc3QnLCAnZ3JlYXQnLCAnZXhjZWxsZW50J107XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQZXJzb25hQmVoYXZpb3JNb2RlKHBlcnNvbmE6IFBlcnNvbmFJZCk6IFBlcnNvbmFCZWhhdmlvck1vZGUge1xuICBpZiAocGVyc29uYSA9PT0gJ2FnZ3Jlc3NpdmUnKSB7XG4gICAgcmV0dXJuICdhZ2dyZXNzaXZlJztcbiAgfVxuXG4gIGlmIChwZXJzb25hID09PSAnaGFyZCcgfHwgcGVyc29uYSA9PT0gJ3N1cGVyX2hhcmQnKSB7XG4gICAgcmV0dXJuICdzYWZlJztcbiAgfVxuXG4gIHJldHVybiAnYmFsYW5jZWQnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlQZXJzb25hQnVja2V0QmlhcyhcbiAgY29uZmlnOiBSZWNvcmQ8TW92ZUJ1Y2tldCwgbnVtYmVyPixcbiAgcGVyc29uYTogUGVyc29uYUlkLFxuKTogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICBjb25zdCBtb2RlID0gZ2V0UGVyc29uYUJlaGF2aW9yTW9kZShwZXJzb25hKTtcbiAgY29uc3QgYWRqdXN0ZWQgPSB7IC4uLmNvbmZpZyB9O1xuXG4gIGlmIChtb2RlID09PSAnYWdncmVzc2l2ZScpIHtcbiAgICBhZGp1c3RlZC5nb29kICs9IDM7XG4gICAgYWRqdXN0ZWQuaW5hY2N1cmFjeSArPSAyO1xuICAgIGFkanVzdGVkLmJlc3QgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5iZXN0IC0gMyk7XG4gICAgYWRqdXN0ZWQuZ3JlYXQgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5ncmVhdCAtIDIpO1xuICB9IGVsc2UgaWYgKG1vZGUgPT09ICdzYWZlJykge1xuICAgIGZvciAoY29uc3QgYnVja2V0IG9mIFNBRkVfQlVDS0VUUykge1xuICAgICAgYWRqdXN0ZWRbYnVja2V0XSArPSAyO1xuICAgIH1cbiAgICBhZGp1c3RlZC5taXN0YWtlID0gTWF0aC5tYXgoMCwgYWRqdXN0ZWQubWlzdGFrZSAtIDIpO1xuICAgIGFkanVzdGVkLmJsdW5kZXIgPSBNYXRoLm1heCgwLCBhZGp1c3RlZC5ibHVuZGVyIC0gMik7XG4gIH1cblxuICByZXR1cm4gYWRqdXN0ZWQ7XG59XG5cbmZ1bmN0aW9uIGdldE1vdmVUcmFpdFNjb3JlKGZlbjogc3RyaW5nLCBtb3ZlVWNpOiBzdHJpbmcsIHBlcnNvbmE6IFBlcnNvbmFJZCk6IG51bWJlciB7XG4gIGNvbnN0IG1vZGUgPSBnZXRQZXJzb25hQmVoYXZpb3JNb2RlKHBlcnNvbmEpO1xuICBpZiAobW9kZSA9PT0gJ2JhbGFuY2VkJykge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgY29uc3QgY2hlc3MgPSBuZXcgQ2hlc3MoZmVuKTtcbiAgY29uc3QgbW92ZSA9IGNoZXNzLm1vdmUoe1xuICAgIGZyb206IG1vdmVVY2kuc2xpY2UoMCwgMiksXG4gICAgdG86IG1vdmVVY2kuc2xpY2UoMiwgNCksXG4gICAgcHJvbW90aW9uOiBtb3ZlVWNpWzRdIGFzICdxJyB8ICdyJyB8ICdiJyB8ICduJyB8IHVuZGVmaW5lZCxcbiAgfSk7XG5cbiAgaWYgKCFtb3ZlKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBjb25zdCBpc0NhcHR1cmUgPSBtb3ZlLmZsYWdzLmluY2x1ZGVzKCdjJykgfHwgbW92ZS5mbGFncy5pbmNsdWRlcygnZScpO1xuICBjb25zdCBpc1Byb21vdGlvbiA9IEJvb2xlYW4obW92ZS5wcm9tb3Rpb24pO1xuICBjb25zdCBpc0Nhc3RsZSA9IG1vdmUuZmxhZ3MuaW5jbHVkZXMoJ2snKSB8fCBtb3ZlLmZsYWdzLmluY2x1ZGVzKCdxJyk7XG4gIGNvbnN0IGlzQ2hlY2sgPSBjaGVzcy5pc0NoZWNrKCk7XG5cbiAgaWYgKG1vZGUgPT09ICdhZ2dyZXNzaXZlJykge1xuICAgIHJldHVybiAxXG4gICAgICArIChpc0NhcHR1cmUgPyAwLjM1IDogMClcbiAgICAgICsgKGlzQ2hlY2sgPyAwLjM1IDogMClcbiAgICAgICsgKGlzUHJvbW90aW9uID8gMC40NSA6IDApXG4gICAgICArIChpc0Nhc3RsZSA/IDAuMDUgOiAwKTtcbiAgfVxuXG4gIHJldHVybiAxXG4gICAgKyAoaXNDYXN0bGUgPyAwLjIgOiAwKVxuICAgICsgKCFpc0NhcHR1cmUgPyAwLjEgOiAwKVxuICAgIC0gKGlzUHJvbW90aW9uID8gMC4wNSA6IDApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGlja1BlcnNvbmFCaWFzZWRNb3ZlKFxuICBmZW46IHN0cmluZyxcbiAgbW92ZXM6IENsYXNzaWZpZWRNb3ZlW10sXG4gIHBlcnNvbmE6IFBlcnNvbmFJZCxcbiAgcmFuZG9tU291cmNlOiBSYW5kb21Tb3VyY2UsXG4pOiBDbGFzc2lmaWVkTW92ZSB7XG4gIGlmIChtb3Zlcy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbW92ZXNbMF07XG4gIH1cblxuICBjb25zdCB3ZWlnaHRlZE1vdmVzID0gbW92ZXMubWFwKChtb3ZlKSA9PiAoe1xuICAgIG1vdmUsXG4gICAgd2VpZ2h0OiBNYXRoLm1heCgwLjEsIGdldE1vdmVUcmFpdFNjb3JlKGZlbiwgbW92ZS5tb3ZlLCBwZXJzb25hKSksXG4gIH0pKTtcbiAgY29uc3QgdG90YWxXZWlnaHQgPSB3ZWlnaHRlZE1vdmVzLnJlZHVjZSgoc3VtLCBlbnRyeSkgPT4gc3VtICsgZW50cnkud2VpZ2h0LCAwKTtcbiAgbGV0IHNlbGVjdGlvbiA9IHJhbmRvbVNvdXJjZS5uZXh0KCkgKiB0b3RhbFdlaWdodDtcblxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIHdlaWdodGVkTW92ZXMpIHtcbiAgICBzZWxlY3Rpb24gLT0gZW50cnkud2VpZ2h0O1xuICAgIGlmIChzZWxlY3Rpb24gPD0gMCkge1xuICAgICAgcmV0dXJuIGVudHJ5Lm1vdmU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHdlaWdodGVkTW92ZXNbd2VpZ2h0ZWRNb3Zlcy5sZW5ndGggLSAxXS5tb3ZlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlSHVtYW5EZWxheU1zKG9wdGlvbnM6IHtcbiAgY29tcGxleGl0eTogUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0IHwgbnVsbDtcbiAgcGVyc29uYTogUGVyc29uYUlkO1xuICBidWNrZXQ6IE1vdmVCdWNrZXQ7XG59KTogbnVtYmVyIHtcbiAgY29uc3QgeyBjb21wbGV4aXR5LCBwZXJzb25hLCBidWNrZXQgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IG1vZGUgPSBnZXRQZXJzb25hQmVoYXZpb3JNb2RlKHBlcnNvbmEpO1xuICBjb25zdCBiYXNlID0gMzUwO1xuICBjb25zdCBjb21wbGV4aXR5RGVsYXkgPSBjb21wbGV4aXR5ID8gTWF0aC5yb3VuZCg5MDAgKiBjb21wbGV4aXR5LnNjb3JlKSA6IDA7XG4gIGNvbnN0IHBlcnNvbmFEZWxheSA9IG1vZGUgPT09ICdzYWZlJyA/IDIyMCA6IG1vZGUgPT09ICdhZ2dyZXNzaXZlJyA/IDgwIDogMTQwO1xuICBjb25zdCBidWNrZXREZWxheSA9XG4gICAgYnVja2V0ID09PSAnYmVzdCcgfHwgYnVja2V0ID09PSAnZ3JlYXQnXG4gICAgICA/IDEyMFxuICAgICAgOiBidWNrZXQgPT09ICdtaXN0YWtlJyB8fCBidWNrZXQgPT09ICdibHVuZGVyJ1xuICAgICAgICA/IDQwXG4gICAgICAgIDogODA7XG5cbiAgcmV0dXJuIGJhc2UgKyBjb21wbGV4aXR5RGVsYXkgKyBwZXJzb25hRGVsYXkgKyBidWNrZXREZWxheTtcbn1cbiIsICIvKipcbiAqIEVuZ2luZSBWaWV3TW9kZWxcbiAqIFZpZXdNb2RlbCBsYXllciAtIE1vYlggc3RvcmUgZm9yIFN0b2NrZmlzaCBlbmdpbmUgc3RhdGVcbiAqL1xuXG5pbXBvcnQgeyBtYWtlQXV0b09ic2VydmFibGUsIGFjdGlvbiwgcnVuSW5BY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7XG4gIEFuYWx5c2lzUHVycG9zZSxcbiAgQW5hbHlzaXNTbmFwc2hvdCxcbiAgaXNTdGFsZUFuYWx5c2lzUmVxdWVzdCxcbn0gZnJvbSAnLi4vZW5naW5lL2FuYWx5c2lzU2FmZXR5JztcbmltcG9ydCB7IHN0b2NrZmlzaFNlcnZpY2UgfSBmcm9tICcuLi9lbmdpbmUvc3RvY2tmaXNoLnNlcnZpY2UnO1xuaW1wb3J0IHsgY2xhc3NpZnlNb3ZlcywgZ2V0TW92ZVN0YXRzLCBncm91cE1vdmVzQnlCdWNrZXQgfSBmcm9tICcuLi9lbmdpbmUvbW92ZUNsYXNzaWZpZXInO1xuaW1wb3J0IHtcbiAgcGlja0J1Y2tldExlZ2FjeSxcbiAgcGlja0J1Y2tldFdpdGhDbG9zZXN0RmFsbGJhY2ssXG4gIHBpY2tSYW5kb21Nb3ZlRnJvbUJ1Y2tldCxcbn0gZnJvbSAnLi4vZW5naW5lL21vdmVQaWNrZXInO1xuaW1wb3J0IHsgXG4gIEFuYWx5emVkTW92ZSxcbiAgQ2xhc3NpZmllZE1vdmUsIFxuICBQaWNrZWRNb3ZlUmVzdWx0LCBcbiAgTW92ZUJ1Y2tldCxcbiAgQnVja2V0Q29uZmlnLFxufSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuaW1wb3J0IHsgYW5hbHlzaXNDYWNoZSwgYnVpbGRBbmFseXNpc0NhY2hlS2V5IH0gZnJvbSAnLi4vZW5naW5lL2FuYWx5c2lzQ2FjaGUnO1xuaW1wb3J0IHsgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcbmltcG9ydCB7IGdldEJyaWxsaWFudE1vdmVDYW5kaWRhdGVzLCBwaWNrQnJpbGxpYW50TW92ZSB9IGZyb20gJy4uL2VuZ2luZS9icmlsbGlhbnRNb3ZlJztcbmltcG9ydCB7IGRldGVjdEdhbWVQaGFzZSB9IGZyb20gJy4uL2VuZ2luZS9nYW1lUGhhc2UnO1xuaW1wb3J0IHtcbiAgYWRqdXN0QnVja2V0Q29uZmlnRm9yQ29tcGxleGl0eSxcbiAgY2FsY3VsYXRlUG9zaXRpb25Db21wbGV4aXR5LFxuICBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQsXG59IGZyb20gJy4uL2VuZ2luZS9wb3NpdGlvbkNvbXBsZXhpdHknO1xuaW1wb3J0IHtcbiAgYXBwbHlQZXJzb25hQnVja2V0QmlhcyxcbiAgcGlja1BlcnNvbmFCaWFzZWRNb3ZlLFxufSBmcm9tICcuLi9lbmdpbmUvcGVyc29uYUJpYXMnO1xuaW1wb3J0IHtcbiAgYnVpbGREZXRlcm1pbmlzdGljU2VlZCxcbiAgY3JlYXRlTGVnYWN5UmFuZG9tU291cmNlLFxuICBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2UsXG59IGZyb20gJy4uL2VuZ2luZS9yYW5kb20nO1xuaW1wb3J0IHsgUGVyc29uYUlkIH0gZnJvbSAnLi4vZW5naW5lL2ZlYXR1cmVPcHRpb25zJztcbmltcG9ydCB7IGNyZWF0ZURlYnVnTG9nZ2VyIH0gZnJvbSAnLi4vc2hhcmVkL2RlYnVnJztcblxuaW50ZXJmYWNlIE1vdmVTZWxlY3Rpb25Db250ZXh0IHtcbiAgZmVuOiBzdHJpbmc7XG4gIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICBtb3ZlQ291bnQ6IG51bWJlcjtcbiAgc2lkZVRvTW92ZTogJ3cnIHwgJ2InO1xuICBwZXJzb25hOiBQZXJzb25hSWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9zaXRpb25BbmFseXNpc1Jlc3VsdCBleHRlbmRzIEFuYWx5c2lzU25hcHNob3Q8Q2xhc3NpZmllZE1vdmVbXT4ge1xuICBjb21wbGV4aXR5OiBQb3NpdGlvbkNvbXBsZXhpdHlSZXN1bHQ7XG4gIGlnbm9yZWQ6IGJvb2xlYW47XG4gIGZyb21DYWNoZTogYm9vbGVhbjtcbiAgcHVycG9zZTogQW5hbHlzaXNQdXJwb3NlO1xufVxuXG5pbnRlcmZhY2UgQWN0aXZlQW5hbHlzaXNSdW4ge1xuICBjYWNoZUtleTogc3RyaW5nO1xuICBmZW46IHN0cmluZztcbiAgcHVycG9zZTogQW5hbHlzaXNQdXJwb3NlO1xuICBwcm9taXNlOiBQcm9taXNlPFBvc2l0aW9uQW5hbHlzaXNSZXN1bHQ+O1xufVxuXG5jb25zdCBsb2dnZXIgPSBjcmVhdGVEZWJ1Z0xvZ2dlcignRW5naW5lVmlld01vZGVsJyk7XG5cbmZ1bmN0aW9uIGNhblVzZUJyaWxsaWFudE1vdmVCdWRnZXQobW92ZUNvdW50OiBudW1iZXIsIGZlbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlQnJpbGxpYW50TW92ZUJ1ZGdldCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuaGFzUmVtYWluaW5nQnJpbGxpYW50TW92ZXMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZXNQZXJHYW1lID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgcGhhc2UgPSBkZXRlY3RHYW1lUGhhc2UoZmVuLCBtb3ZlQ291bnQpLnBoYXNlO1xuICByZXR1cm4gZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50QWxsb3dlZFBoYXNlID09PSAnYW55J1xuICAgIHx8IGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudEFsbG93ZWRQaGFzZSA9PT0gcGhhc2U7XG59XG5cbmV4cG9ydCBjbGFzcyBFbmdpbmVWaWV3TW9kZWwge1xuICBpc0luaXRpYWxpemVkID0gZmFsc2U7XG4gIGlzSW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gIGlzQW5hbHl6aW5nID0gZmFsc2U7XG4gIGFuYWx5emVkTW92ZXM6IENsYXNzaWZpZWRNb3ZlW10gPSBbXTtcbiAgbGFzdFBpY2tlZE1vdmU6IFBpY2tlZE1vdmVSZXN1bHQgfCBudWxsID0gbnVsbDtcbiAgZXJyb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBsYXN0Q29tcGxleGl0eTogUG9zaXRpb25Db21wbGV4aXR5UmVzdWx0IHwgbnVsbCA9IG51bGw7XG4gIGxhc3RBbmFseXNpc0Zyb21DYWNoZSA9IGZhbHNlO1xuICBsYXN0QW5hbHlzaXNQdXJwb3NlOiBBbmFseXNpc1B1cnBvc2UgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBuZXh0UmVxdWVzdElkczogUmVjb3JkPEFuYWx5c2lzUHVycG9zZSwgbnVtYmVyPiA9IHtcbiAgICBlbmdpbmVNb3ZlOiAwLFxuICAgIGJhY2tncm91bmQ6IDAsXG4gIH07XG4gIHByaXZhdGUgbGF0ZXN0UmVxdWVzdElkczogUmVjb3JkPEFuYWx5c2lzUHVycG9zZSwgbnVtYmVyPiA9IHtcbiAgICBlbmdpbmVNb3ZlOiAwLFxuICAgIGJhY2tncm91bmQ6IDAsXG4gIH07XG4gIHByaXZhdGUgYWN0aXZlQW5hbHlzaXNSdW46IEFjdGl2ZUFuYWx5c2lzUnVuIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIGluaXRpYWxpemU6IGFjdGlvbixcbiAgICAgIGFuYWx5emVQb3NpdGlvbjogYWN0aW9uLFxuICAgICAgcGlja01vdmVGcm9tQW5hbHlzaXM6IGFjdGlvbixcbiAgICAgIHJlc2V0OiBhY3Rpb24sXG4gICAgICBzZXRFcnJvcjogYWN0aW9uLFxuICAgIH0pO1xuICAgIFxuICAgIGxvZ2dlci5kZWJ1ZygnSW5pdGlhbGl6ZWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBTdG9ja2Zpc2ggZW5naW5lXG4gICAqL1xuICBhc3luYyBpbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnQWxyZWFkeSBpbml0aWFsaXplZCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgICAgICB0aGlzLmlzSW5pdGlhbGl6aW5nID0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgICAgYXdhaXQgc3RvY2tmaXNoU2VydmljZS5pbml0aWFsaXplKCk7XG4gICAgICBcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc0luaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICBsb2dnZXIuZGVidWcoJ0luaXRpYWxpemF0aW9uIGNvbXBsZXRlJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0luaXRpYWxpemF0aW9uIGVycm9yOicsIGVycik7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBgRmFpbGVkIHRvIGluaXRpYWxpemUgZW5naW5lOiAke2Vycn1gO1xuICAgICAgICB0aGlzLmlzSW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlndXJlIGVuZ2luZSBzZXR0aW5nc1xuICAgKi9cbiAgY29uZmlndXJlKG9wdGlvbnM6IHsgbXVsdGlQVj86IG51bWJlcjsgZGVwdGg/OiBudW1iZXIgfSk6IHZvaWQge1xuICAgIGxvZ2dlci5kZWJ1ZygnQ29uZmlndXJpbmc6Jywgb3B0aW9ucyk7XG4gICAgc3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUob3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSBhIHBvc2l0aW9uIGFuZCBjbGFzc2lmeSBtb3Zlc1xuICAgKi9cbiAgYXN5bmMgYW5hbHl6ZVBvc2l0aW9uKFxuICAgIGZlbjogc3RyaW5nLFxuICAgIGRlcHRoID0gMjAsXG4gICAgbXVsdGlQViA9IDEyLFxuICAgIHB1cnBvc2U6IEFuYWx5c2lzUHVycG9zZSA9ICdiYWNrZ3JvdW5kJyxcbiAgKTogUHJvbWlzZTxQb3NpdGlvbkFuYWx5c2lzUmVzdWx0PiB7XG4gICAgbG9nZ2VyLmRlYnVnKCdhbmFseXplUG9zaXRpb24gY2FsbGVkJywgeyBmZW4sIGRlcHRoLCBtdWx0aVBWLCBwdXJwb3NlIH0pO1xuICAgIFxuICAgIGlmICghdGhpcy5pc0luaXRpYWxpemVkKSB7XG4gICAgICBhd2FpdCB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgY2FjaGVLZXkgPSBidWlsZEFuYWx5c2lzQ2FjaGVLZXkoZmVuLCBkZXB0aCwgbXVsdGlQVik7XG4gICAgICBjb25zdCByZXF1ZXN0SWQgPSArK3RoaXMubmV4dFJlcXVlc3RJZHNbcHVycG9zZV07XG4gICAgICB0aGlzLmxhdGVzdFJlcXVlc3RJZHNbcHVycG9zZV0gPSByZXF1ZXN0SWQ7XG5cbiAgICAgIGlmICh0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuKSB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuLmNhY2hlS2V5ID09PSBjYWNoZUtleSkge1xuICAgICAgICAgIGNvbnN0IHNoYXJlZFJlc3VsdCA9IGF3YWl0IHRoaXMuYWN0aXZlQW5hbHlzaXNSdW4ucHJvbWlzZTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uc2hhcmVkUmVzdWx0LFxuICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgcHVycG9zZSxcbiAgICAgICAgICAgIGlnbm9yZWQ6IGlzU3RhbGVBbmFseXNpc1JlcXVlc3QocmVxdWVzdElkLCB0aGlzLmxhdGVzdFJlcXVlc3RJZHNbcHVycG9zZV0pIHx8IHNoYXJlZFJlc3VsdC5pZ25vcmVkLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHVycG9zZSA9PT0gJ2VuZ2luZU1vdmUnKSB7XG4gICAgICAgICAgdGhpcy5sYXRlc3RSZXF1ZXN0SWRzW3RoaXMuYWN0aXZlQW5hbHlzaXNSdW4ucHVycG9zZV0gKz0gMTtcbiAgICAgICAgICBzdG9ja2Zpc2hTZXJ2aWNlLnN0b3AoKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuLnByb21pc2UuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwdXJwb3NlID09PSAnYmFja2dyb3VuZCcpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuLnByb21pc2UuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNBbmFseXppbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICAgICAgaWYgKHB1cnBvc2UgPT09ICdlbmdpbmVNb3ZlJykge1xuICAgICAgICAgIHRoaXMuYW5hbHl6ZWRNb3ZlcyA9IFtdO1xuICAgICAgICAgIHRoaXMubGFzdFBpY2tlZE1vdmUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcnVuUHJvbWlzZSA9IHRoaXMucGVyZm9ybVBvc2l0aW9uQW5hbHlzaXMoe1xuICAgICAgICBmZW4sXG4gICAgICAgIGRlcHRoLFxuICAgICAgICBtdWx0aVBWLFxuICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICBwdXJwb3NlLFxuICAgICAgfSk7XG4gICAgICB0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuID0ge1xuICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgZmVuLFxuICAgICAgICBwdXJwb3NlLFxuICAgICAgICBwcm9taXNlOiBydW5Qcm9taXNlLFxuICAgICAgfTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJ1blByb21pc2U7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmVBbmFseXNpc1J1bj8ucHJvbWlzZSA9PT0gcnVuUHJvbWlzZSkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlQW5hbHlzaXNSdW4gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0FuYWx5c2lzIGVycm9yOicsIGVycik7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBgQW5hbHlzaXMgZmFpbGVkOiAke2Vycn1gO1xuICAgICAgICB0aGlzLmlzQW5hbHl6aW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGljayBhIG1vdmUgZnJvbSB0aGUgYW5hbHl6ZWQgbW92ZXMgdXNpbmcgYnVja2V0IGNvbmZpZ3VyYXRpb25cbiAgICovXG4gIHBpY2tNb3ZlRnJvbUFuYWx5c2lzKFxuICAgIGFuYWx5c2lzOiBQb3NpdGlvbkFuYWx5c2lzUmVzdWx0LFxuICAgIGNvbmZpZzogQnVja2V0Q29uZmlnLFxuICAgIGNvbnRleHQ6IE1vdmVTZWxlY3Rpb25Db250ZXh0LFxuICApOiBQaWNrZWRNb3ZlUmVzdWx0IHwgbnVsbCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdwaWNrTW92ZUZyb21BbmFseXNpcyBjYWxsZWQnLCB7XG4gICAgICBhbmFseXplZE1vdmVzQ291bnQ6IGFuYWx5c2lzLm1vdmVzLmxlbmd0aCxcbiAgICAgIGNvbmZpZyBcbiAgICB9KTtcbiAgICBcbiAgICBpZiAoYW5hbHlzaXMuaWdub3JlZCB8fCBhbmFseXNpcy5tb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnTm8gYW5hbHl6ZWQgbW92ZXMgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByYW5kb21Tb3VyY2UgPSBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VEZXRlcm1pbmlzdGljUm5nXG4gICAgICA/IGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZShcbiAgICAgICAgICBidWlsZERldGVybWluaXN0aWNTZWVkKHtcbiAgICAgICAgICAgIGdhbWVTdGFydEZlbjogY29udGV4dC5nYW1lU3RhcnRGZW4sXG4gICAgICAgICAgICBjdXJyZW50RmVuOiBjb250ZXh0LmZlbixcbiAgICAgICAgICAgIG1vdmVDb3VudDogY29udGV4dC5tb3ZlQ291bnQsXG4gICAgICAgICAgICBzaWRlVG9Nb3ZlOiBjb250ZXh0LnNpZGVUb01vdmUsXG4gICAgICAgICAgICBwZXJzb25hOiBjb250ZXh0LnBlcnNvbmEsXG4gICAgICAgICAgfSksXG4gICAgICAgIClcbiAgICAgIDogY3JlYXRlTGVnYWN5UmFuZG9tU291cmNlKCk7XG5cbiAgICBsZXQgZWZmZWN0aXZlQ29uZmlnOiBCdWNrZXRDb25maWcgPSB7IC4uLmNvbmZpZyB9O1xuXG4gICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZVBvc2l0aW9uQ29tcGxleGl0eSkge1xuICAgICAgZWZmZWN0aXZlQ29uZmlnID0gYWRqdXN0QnVja2V0Q29uZmlnRm9yQ29tcGxleGl0eShlZmZlY3RpdmVDb25maWcsIGFuYWx5c2lzLmNvbXBsZXhpdHkpO1xuICAgIH1cblxuICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VQZXJzb25hQmVoYXZpb3JCaWFzKSB7XG4gICAgICBlZmZlY3RpdmVDb25maWcgPSBhcHBseVBlcnNvbmFCdWNrZXRCaWFzKGVmZmVjdGl2ZUNvbmZpZywgY29udGV4dC5wZXJzb25hKSBhcyBCdWNrZXRDb25maWc7XG4gICAgfVxuXG4gICAgaWYgKGNhblVzZUJyaWxsaWFudE1vdmVCdWRnZXQoY29udGV4dC5tb3ZlQ291bnQsIGNvbnRleHQuZmVuKSkge1xuICAgICAgY29uc3QgYnJpbGxpYW50Q2FuZGlkYXRlcyA9IGdldEJyaWxsaWFudE1vdmVDYW5kaWRhdGVzKGNvbnRleHQuZmVuLCBhbmFseXNpcy5tb3Zlcyk7XG4gICAgICBjb25zdCBzaG91bGRQaWNrQnJpbGxpYW50ID0gYnJpbGxpYW50Q2FuZGlkYXRlcy5sZW5ndGggPiAwICYmIHJhbmRvbVNvdXJjZS5uZXh0KCkgPCAwLjM1O1xuXG4gICAgICBpZiAoc2hvdWxkUGlja0JyaWxsaWFudCkge1xuICAgICAgICBjb25zdCBicmlsbGlhbnRNb3ZlID0gcGlja0JyaWxsaWFudE1vdmUoYnJpbGxpYW50Q2FuZGlkYXRlcywgcmFuZG9tU291cmNlKTtcblxuICAgICAgICBpZiAoYnJpbGxpYW50TW92ZSkge1xuICAgICAgICAgIGNvbnN0IGJyaWxsaWFudFJlc3VsdCA9IHtcbiAgICAgICAgICAgIG1vdmU6IGJyaWxsaWFudE1vdmUsXG4gICAgICAgICAgICBidWNrZXQ6IGJyaWxsaWFudE1vdmUuYnVja2V0LFxuICAgICAgICAgICAgaXNCcmlsbGlhbnQ6IHRydWUsXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFBpY2tlZE1vdmUgPSBicmlsbGlhbnRSZXN1bHQ7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gYnJpbGxpYW50UmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVja2V0U2VsZWN0aW9uID0gZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb25cbiAgICAgID8gcGlja0J1Y2tldFdpdGhDbG9zZXN0RmFsbGJhY2soYW5hbHlzaXMubW92ZXMsIGVmZmVjdGl2ZUNvbmZpZywgKCkgPT4gcmFuZG9tU291cmNlLm5leHQoKSlcbiAgICAgIDogcGlja0J1Y2tldExlZ2FjeShhbmFseXNpcy5tb3ZlcywgZWZmZWN0aXZlQ29uZmlnLCAoKSA9PiByYW5kb21Tb3VyY2UubmV4dCgpKTtcblxuICAgIGlmICghYnVja2V0U2VsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBzZWxlY3RlZE1vdmUgPSBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VQZXJzb25hQmVoYXZpb3JCaWFzXG4gICAgICA/IHBpY2tQZXJzb25hQmlhc2VkTW92ZShjb250ZXh0LmZlbiwgYnVja2V0U2VsZWN0aW9uLm1vdmVzLCBjb250ZXh0LnBlcnNvbmEsIHJhbmRvbVNvdXJjZSlcbiAgICAgIDogcGlja1JhbmRvbU1vdmVGcm9tQnVja2V0KGJ1Y2tldFNlbGVjdGlvbiwgKCkgPT4gcmFuZG9tU291cmNlLm5leHQoKSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICBtb3ZlOiBzZWxlY3RlZE1vdmUsXG4gICAgICBidWNrZXQ6IGJ1Y2tldFNlbGVjdGlvbi5idWNrZXQsXG4gICAgICBpc0JyaWxsaWFudDogZmFsc2UsXG4gICAgfTtcbiAgICBsb2dnZXIuZGVidWcoJ1BpY2tlZCBtb3ZlOicsIHJlc3VsdCk7XG4gICAgXG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5sYXN0UGlja2VkTW92ZSA9IHJlc3VsdDtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBjdXJyZW50IGFuYWx5c2lzXG4gICAqL1xuICBzdG9wQW5hbHlzaXMoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdzdG9wQW5hbHlzaXMgY2FsbGVkJyk7XG4gICAgc3RvY2tmaXNoU2VydmljZS5zdG9wKCk7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5pc0FuYWx5emluZyA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGEgbmV3IGdhbWVcbiAgICovXG4gIG5ld0dhbWUoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCduZXdHYW1lIGNhbGxlZCcpO1xuICAgIHN0b2NrZmlzaFNlcnZpY2UubmV3R2FtZSgpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBzdGF0ZVxuICAgKi9cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdyZXNldCBjYWxsZWQnKTtcbiAgICB0aGlzLmFuYWx5emVkTW92ZXMgPSBbXTtcbiAgICB0aGlzLmxhc3RQaWNrZWRNb3ZlID0gbnVsbDtcbiAgICB0aGlzLmxhc3RDb21wbGV4aXR5ID0gbnVsbDtcbiAgICB0aGlzLmxhc3RBbmFseXNpc0Zyb21DYWNoZSA9IGZhbHNlO1xuICAgIHRoaXMubGFzdEFuYWx5c2lzUHVycG9zZSA9IG51bGw7XG4gICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgdGhpcy5pc0luaXRpYWxpemluZyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBlcnJvciBtZXNzYWdlXG4gICAqL1xuICBzZXRFcnJvcihtZXNzYWdlOiBzdHJpbmcgfCBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5lcnJvciA9IG1lc3NhZ2U7XG4gIH1cblxuICAvKipcbiAgICogR2V0IG1vdmUgc3RhdGlzdGljcyBieSBidWNrZXRcbiAgICovXG4gIGdldCBtb3ZlU3RhdHMoKTogUmVjb3JkPE1vdmVCdWNrZXQsIG51bWJlcj4ge1xuICAgIHJldHVybiBnZXRNb3ZlU3RhdHModGhpcy5hbmFseXplZE1vdmVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbW92ZXMgZ3JvdXBlZCBieSBidWNrZXRcbiAgICovXG4gIGdldCBtb3Zlc0J5QnVja2V0KCk6IE1hcDxNb3ZlQnVja2V0LCBDbGFzc2lmaWVkTW92ZVtdPiB7XG4gICAgcmV0dXJuIGdyb3VwTW92ZXNCeUJ1Y2tldCh0aGlzLmFuYWx5emVkTW92ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYmVzdCBtb3ZlIChpZiBhdmFpbGFibGUpXG4gICAqL1xuICBnZXQgYmVzdE1vdmUoKTogQ2xhc3NpZmllZE1vdmUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5hbmFseXplZE1vdmVzLmxlbmd0aCA+IDAgPyB0aGlzLmFuYWx5emVkTW92ZXNbMF0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZXJlIGFyZSBhbmFseXplZCBtb3Zlc1xuICAgKi9cbiAgZ2V0IGhhc0FuYWx5emVkTW92ZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYW5hbHl6ZWRNb3Zlcy5sZW5ndGggPiAwO1xuICB9XG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBlbmdpbmVcbiAgICovXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgbG9nZ2VyLmRlYnVnKCdkZXN0cm95IGNhbGxlZCcpO1xuICAgIHN0b2NrZmlzaFNlcnZpY2UuZGVzdHJveSgpO1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwZXJmb3JtUG9zaXRpb25BbmFseXNpcyhvcHRpb25zOiB7XG4gICAgZmVuOiBzdHJpbmc7XG4gICAgZGVwdGg6IG51bWJlcjtcbiAgICBtdWx0aVBWOiBudW1iZXI7XG4gICAgY2FjaGVLZXk6IHN0cmluZztcbiAgICByZXF1ZXN0SWQ6IG51bWJlcjtcbiAgICBwdXJwb3NlOiBBbmFseXNpc1B1cnBvc2U7XG4gIH0pOiBQcm9taXNlPFBvc2l0aW9uQW5hbHlzaXNSZXN1bHQ+IHtcbiAgICBjb25zdCB7IGZlbiwgZGVwdGgsIG11bHRpUFYsIGNhY2hlS2V5LCByZXF1ZXN0SWQsIHB1cnBvc2UgfSA9IG9wdGlvbnM7XG4gICAgbGV0IGNhY2hlZENsYXNzaWZpZWRNb3ZlczogQ2xhc3NpZmllZE1vdmVbXSB8IHVuZGVmaW5lZDtcbiAgICBsZXQgZnJvbUNhY2hlID0gZmFsc2U7XG4gICAgbGV0IG1vdmVzOiBBbmFseXplZE1vdmVbXSA9IFtdO1xuXG4gICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZU1vdmVBbmFseXNpc0NhY2hlKSB7XG4gICAgICBjb25zdCBjYWNoZWQgPSBhbmFseXNpc0NhY2hlLmdldChjYWNoZUtleSk7XG4gICAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAgIG1vdmVzID0gY2FjaGVkLm1vdmVzO1xuICAgICAgICBjYWNoZWRDbGFzc2lmaWVkTW92ZXMgPSBjYWNoZWQuY2xhc3NpZmllZE1vdmVzO1xuICAgICAgICBmcm9tQ2FjaGUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHN0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlKHsgZGVwdGgsIG11bHRpUFYgfSk7XG4gICAgICBsb2dnZXIuZGVidWcoJ1N0YXJ0aW5nIGFuYWx5c2lzLi4uJyk7XG4gICAgICBtb3ZlcyA9IGF3YWl0IHN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uKGZlbik7XG4gICAgICBsb2dnZXIuZGVidWcoJ0FuYWx5c2lzIGNvbXBsZXRlLCBnb3QnLCBtb3Zlcy5sZW5ndGgsICdtb3ZlcycpO1xuXG4gICAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlTW92ZUFuYWx5c2lzQ2FjaGUpIHtcbiAgICAgICAgYW5hbHlzaXNDYWNoZS5zZXQoe1xuICAgICAgICAgIGtleTogY2FjaGVLZXksXG4gICAgICAgICAgbW92ZXMsXG4gICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdVc2luZyBjYWNoZWQgYW5hbHlzaXMgZm9yIGN1cnJlbnQgcG9zaXRpb24nKTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc2lmaWVkID0gY2FjaGVkQ2xhc3NpZmllZE1vdmVzID8/IGNsYXNzaWZ5TW92ZXMobW92ZXMpO1xuICAgIGNvbnN0IGNvbXBsZXhpdHkgPSBjYWxjdWxhdGVQb3NpdGlvbkNvbXBsZXhpdHkobW92ZXMpO1xuICAgIGNvbnN0IGlnbm9yZWQgPSBpc1N0YWxlQW5hbHlzaXNSZXF1ZXN0KHJlcXVlc3RJZCwgdGhpcy5sYXRlc3RSZXF1ZXN0SWRzW3B1cnBvc2VdKTtcblxuICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VNb3ZlQW5hbHlzaXNDYWNoZSAmJiBtb3Zlcy5sZW5ndGggPiAwKSB7XG4gICAgICBhbmFseXNpc0NhY2hlLnNldCh7XG4gICAgICAgIGtleTogY2FjaGVLZXksXG4gICAgICAgIG1vdmVzLFxuICAgICAgICBjbGFzc2lmaWVkTW92ZXM6IGNsYXNzaWZpZWQsXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghaWdub3JlZCkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmxhc3RBbmFseXNpc0Zyb21DYWNoZSA9IGZyb21DYWNoZTtcbiAgICAgICAgdGhpcy5sYXN0QW5hbHlzaXNQdXJwb3NlID0gcHVycG9zZTtcbiAgICAgICAgaWYgKHB1cnBvc2UgPT09ICdlbmdpbmVNb3ZlJykge1xuICAgICAgICAgIHRoaXMuYW5hbHl6ZWRNb3ZlcyA9IGNsYXNzaWZpZWQ7XG4gICAgICAgICAgdGhpcy5sYXN0Q29tcGxleGl0eSA9IGNvbXBsZXhpdHk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc0FuYWx5emluZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmFjdGl2ZUFuYWx5c2lzUnVuPy5wdXJwb3NlID09PSBwdXJwb3NlKSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNBbmFseXppbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICByZXF1ZXN0SWQsXG4gICAgICBhbmFseXplZEZlbjogZmVuLFxuICAgICAgbW92ZXM6IGNsYXNzaWZpZWQsXG4gICAgICBjb21wbGV4aXR5LFxuICAgICAgaWdub3JlZCxcbiAgICAgIGZyb21DYWNoZSxcbiAgICAgIHB1cnBvc2UsXG4gICAgfTtcbiAgfVxuXG4gIGdldCBhbmFseXNpc1N0YXR1c0xhYmVsKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuZXJyb3IpIHtcbiAgICAgIHJldHVybiAnRW5naW5lIGVycm9yJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0luaXRpYWxpemluZykge1xuICAgICAgcmV0dXJuICdTdGFydGluZyBlbmdpbmUnO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQW5hbHl6aW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5sYXN0QW5hbHlzaXNQdXJwb3NlID09PSAnYmFja2dyb3VuZCdcbiAgICAgICAgPyAnUnVubmluZyBiYWNrZ3JvdW5kIGFuYWx5c2lzJ1xuICAgICAgICA6ICdBbmFseXppbmcgcG9zaXRpb24nO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc0luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm4gJ05vdCBpbml0aWFsaXplZCc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubGFzdEFuYWx5c2lzUHVycG9zZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICdSZWFkeSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubGFzdEFuYWx5c2lzRnJvbUNhY2hlID8gJ1JlYWR5IChjYWNoZSB3YXJtKScgOiAnUmVhZHknO1xuICB9XG59XG5cbi8vIFNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGVuZ2luZVZpZXdNb2RlbCA9IG5ldyBFbmdpbmVWaWV3TW9kZWwoKTtcbiIsICIvKipcbiAqIENvbmZpZyBWaWV3TW9kZWxcbiAqIFZpZXdNb2RlbCBsYXllciAtIE1vYlggc3RvcmUgZm9yIGJ1Y2tldCBjb25maWd1cmF0aW9uXG4gKi9cblxuaW1wb3J0IHsgbWFrZUF1dG9PYnNlcnZhYmxlLCBhY3Rpb24sIHJlYWN0aW9uIH0gZnJvbSAnbW9ieCc7XG5pbXBvcnQgeyBCdWNrZXRDb25maWcsIE1vdmVCdWNrZXQsIERFRkFVTFRfQlVDS0VUX0NPTkZJRywgTW92ZVF1YWxpdHlQcmVzZXRJZCwgTU9WRV9RVUFMSVRZX1BSRVNFVFMgfSBmcm9tICcuLi9lbmdpbmUvdHlwZXMnO1xuaW1wb3J0IHsgRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSB9IGZyb20gJy4uL2VuZ2luZS9mZWF0dXJlT3B0aW9ucyc7XG5pbXBvcnQgeyBub3JtYWxpemVCdWNrZXRDb25maWcsIHZhbGlkYXRlQnVja2V0Q29uZmlnIH0gZnJvbSAnLi4vZW5naW5lL21vdmVQaWNrZXInO1xuaW1wb3J0IHsgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcblxuaW50ZXJmYWNlIFBlcnNpc3RlZEVuZ2luZUNvbmZpZyB7XG4gIGJ1Y2tldENvbmZpZzogQnVja2V0Q29uZmlnO1xuICBjdXJyZW50UHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQgfCBudWxsO1xuICBkZXB0aDogbnVtYmVyO1xuICBtdWx0aVBWOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBDb25maWdWaWV3TW9kZWwge1xuICBidWNrZXRDb25maWc6IEJ1Y2tldENvbmZpZyA9IHsgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHIH07XG4gIC8qKiBJZCBvZiB0aGUgYWN0aXZlIHByZXNldCwgb3IgbnVsbCBpZiB1c2luZyBjdXN0b20gZGlzdHJpYnV0aW9uICovXG4gIGN1cnJlbnRQcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGwgPSAnbWVkaXVtJztcbiAgZGVwdGggPSA4O1xuICBtdWx0aVBWID0gMTI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldEJ1Y2tldFZhbHVlOiBhY3Rpb24sXG4gICAgICBzZXRCdWNrZXRDb25maWc6IGFjdGlvbixcbiAgICAgIGFwcGx5UHJvZmlsZVNuYXBzaG90OiBhY3Rpb24sXG4gICAgICBhcHBseVByZXNldDogYWN0aW9uLFxuICAgICAgcmVzZXRUb0RlZmF1bHRzOiBhY3Rpb24sXG4gICAgICBub3JtYWxpemVDb25maWc6IGFjdGlvbixcbiAgICAgIHNldERlcHRoOiBhY3Rpb24sXG4gICAgICBzZXRNdWx0aVBWOiBhY3Rpb24sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc3RvcmVGcm9tU3RvcmFnZSgpO1xuXG4gICAgcmVhY3Rpb24oXG4gICAgICAoKSA9PiAoe1xuICAgICAgICBidWNrZXRDb25maWc6IHRoaXMuYnVja2V0Q29uZmlnLFxuICAgICAgICBjdXJyZW50UHJlc2V0SWQ6IHRoaXMuY3VycmVudFByZXNldElkLFxuICAgICAgICBkZXB0aDogdGhpcy5kZXB0aCxcbiAgICAgICAgbXVsdGlQVjogdGhpcy5tdWx0aVBWLFxuICAgICAgICBwZXJzaXN0RW5naW5lQ29uZmlnOiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5wZXJzaXN0RW5naW5lQ29uZmlnLFxuICAgICAgfSksXG4gICAgICAoeyBwZXJzaXN0RW5naW5lQ29uZmlnIH0pID0+IHtcbiAgICAgICAgaWYgKCFwZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZFN0b3JhZ2UoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICAgIH0sXG4gICAgICB7IGZpcmVJbW1lZGlhdGVseTogdHJ1ZSB9LFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBwZXJjZW50YWdlIHZhbHVlIGZvciBhIHNwZWNpZmljIGJ1Y2tldFxuICAgKi9cbiAgc2V0QnVja2V0VmFsdWUoYnVja2V0OiBNb3ZlQnVja2V0LCB2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY2xhbXBlZFZhbHVlID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCB2YWx1ZSkpO1xuICAgIHRoaXMuY3VycmVudFByZXNldElkID0gbnVsbDsgLy8gc3dpdGNoaW5nIHRvIGN1c3RvbVxuICAgIHRoaXMuYnVja2V0Q29uZmlnID0ge1xuICAgICAgLi4udGhpcy5idWNrZXRDb25maWcsXG4gICAgICBbYnVja2V0XTogY2xhbXBlZFZhbHVlLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBmdWxsIGJ1Y2tldCBjb25maWcgKGUuZy4gd2hlbiBhcHBseWluZyBhIHByZXNldClcbiAgICovXG4gIHNldEJ1Y2tldENvbmZpZyhjb25maWc6IEJ1Y2tldENvbmZpZyk6IHZvaWQge1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5jb25maWcgfTtcbiAgfVxuXG4gIGFwcGx5UHJvZmlsZVNuYXBzaG90KHNuYXBzaG90OiB7XG4gICAgYnVja2V0Q29uZmlnOiBCdWNrZXRDb25maWc7XG4gICAgY3VycmVudFByZXNldElkOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbDtcbiAgICBkZXB0aDogbnVtYmVyO1xuICAgIG11bHRpUFY6IG51bWJlcjtcbiAgfSk6IHZvaWQge1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5zbmFwc2hvdC5idWNrZXRDb25maWcgfTtcbiAgICB0aGlzLmN1cnJlbnRQcmVzZXRJZCA9IHNuYXBzaG90LmN1cnJlbnRQcmVzZXRJZDtcbiAgICB0aGlzLmRlcHRoID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMzAsIHNuYXBzaG90LmRlcHRoKSk7XG4gICAgdGhpcy5tdWx0aVBWID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMjAsIHNuYXBzaG90Lm11bHRpUFYpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBhIHByZWRlZmluZWQgbW92ZSBxdWFsaXR5IHByZXNldCBieSBpZFxuICAgKi9cbiAgYXBwbHlQcmVzZXQocHJlc2V0SWQ6IE1vdmVRdWFsaXR5UHJlc2V0SWQpOiB2b2lkIHtcbiAgICBjb25zdCBwcmVzZXQgPSBNT1ZFX1FVQUxJVFlfUFJFU0VUUy5maW5kKHAgPT4gcC5pZCA9PT0gcHJlc2V0SWQpO1xuICAgIGlmIChwcmVzZXQpIHtcbiAgICAgIHRoaXMuY3VycmVudFByZXNldElkID0gcHJlc2V0SWQ7XG4gICAgICB0aGlzLmJ1Y2tldENvbmZpZyA9IHsgLi4ucHJlc2V0LmNvbmZpZyB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBidWNrZXQgY29uZmlndXJhdGlvbiB0byBkZWZhdWx0cyAobWVkaXVtIHByZXNldClcbiAgICovXG4gIHJlc2V0VG9EZWZhdWx0cygpOiB2b2lkIHtcbiAgICB0aGlzLmN1cnJlbnRQcmVzZXRJZCA9ICdtZWRpdW0nO1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemUgdGhlIGNvbmZpZ3VyYXRpb24gc28gcGVyY2VudGFnZXMgc3VtIHRvIDEwMFxuICAgKi9cbiAgbm9ybWFsaXplQ29uZmlnKCk6IHZvaWQge1xuICAgIHRoaXMuYnVja2V0Q29uZmlnID0gbm9ybWFsaXplQnVja2V0Q29uZmlnKHRoaXMuYnVja2V0Q29uZmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYW5hbHlzaXMgZGVwdGhcbiAgICovXG4gIHNldERlcHRoKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmRlcHRoID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMzAsIHZhbHVlKSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IE11bHRpUFYgdmFsdWVcbiAgICovXG4gIHNldE11bHRpUFYodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMubXVsdGlQViA9IE1hdGgubWF4KDEsIE1hdGgubWluKDIwLCB2YWx1ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0b3RhbCBwZXJjZW50YWdlIHN1bVxuICAgKi9cbiAgZ2V0IHRvdGFsUGVyY2VudGFnZSgpOiBudW1iZXIge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuYnVja2V0Q29uZmlnKS5yZWR1Y2UoKHN1bSwgdmFsKSA9PiBzdW0gKyB2YWwsIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNvbmZpZ3VyYXRpb24gaXMgdmFsaWQgKHN1bXMgdG8gMTAwKVxuICAgKi9cbiAgZ2V0IGlzVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyB2YWxpZCB9ID0gdmFsaWRhdGVCdWNrZXRDb25maWcodGhpcy5idWNrZXRDb25maWcpO1xuICAgIHJldHVybiB2YWxpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHZhbGlkYXRpb24gc3RhdGVcbiAgICovXG4gIGdldCB2YWxpZGF0aW9uU3RhdGUoKTogeyB2YWxpZDogYm9vbGVhbjsgdG90YWw6IG51bWJlciB9IHtcbiAgICByZXR1cm4gdmFsaWRhdGVCdWNrZXRDb25maWcodGhpcy5idWNrZXRDb25maWcpO1xuICB9XG5cbiAgZ2V0IGFjdGl2ZVBlcnNvbmFJZCgpOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFByZXNldElkO1xuICB9XG5cbiAgZ2V0IGFjdGl2ZVBlcnNvbmFMYWJlbCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmN1cnJlbnRQcmVzZXRJZCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuICdDdXN0b20nO1xuICAgIH1cblxuICAgIHJldHVybiBNT1ZFX1FVQUxJVFlfUFJFU0VUUy5maW5kKChwcmVzZXQpID0+IHByZXNldC5pZCA9PT0gdGhpcy5jdXJyZW50UHJlc2V0SWQpPy5sYWJlbCA/PyAnQ3VzdG9tJztcbiAgfVxuXG4gIHByaXZhdGUgcmVzdG9yZUZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKEVOR0lORV9DT05GSUdfU1RPUkFHRV9LRVkpO1xuICAgICAgaWYgKCFzYXZlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc2F2ZWQpIGFzIFBhcnRpYWw8UGVyc2lzdGVkRW5naW5lQ29uZmlnPjtcbiAgICAgIGlmIChwYXJzZWQuYnVja2V0Q29uZmlnKSB7XG4gICAgICAgIHRoaXMuYnVja2V0Q29uZmlnID0geyAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcsIC4uLnBhcnNlZC5idWNrZXRDb25maWcgfTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJzZWQuY3VycmVudFByZXNldElkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UHJlc2V0SWQgPSBwYXJzZWQuY3VycmVudFByZXNldElkO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBwYXJzZWQuZGVwdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHRoaXMuZGVwdGggPSBNYXRoLm1heCgxLCBNYXRoLm1pbigzMCwgcGFyc2VkLmRlcHRoKSk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhcnNlZC5tdWx0aVBWID09PSAnbnVtYmVyJykge1xuICAgICAgICB0aGlzLm11bHRpUFYgPSBNYXRoLm1heCgxLCBNYXRoLm1pbigyMCwgcGFyc2VkLm11bHRpUFYpKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0NvbmZpZ1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHJlc3RvcmUgZW5naW5lIGNvbmZpZzonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJzaXN0VG9TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzbmFwc2hvdDogUGVyc2lzdGVkRW5naW5lQ29uZmlnID0ge1xuICAgICAgICBidWNrZXRDb25maWc6IHRoaXMuYnVja2V0Q29uZmlnLFxuICAgICAgICBjdXJyZW50UHJlc2V0SWQ6IHRoaXMuY3VycmVudFByZXNldElkLFxuICAgICAgICBkZXB0aDogdGhpcy5kZXB0aCxcbiAgICAgICAgbXVsdGlQVjogdGhpcy5tdWx0aVBWLFxuICAgICAgfTtcblxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oRU5HSU5FX0NPTkZJR19TVE9SQUdFX0tFWSwgSlNPTi5zdHJpbmdpZnkoc25hcHNob3QpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignW0NvbmZpZ1ZpZXdNb2RlbF0gRmFpbGVkIHRvIHBlcnNpc3QgZW5naW5lIGNvbmZpZzonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbGVhclBlcnNpc3RlZFN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKEVOR0lORV9DT05GSUdfU1RPUkFHRV9LRVkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdbQ29uZmlnVmlld01vZGVsXSBGYWlsZWQgdG8gY2xlYXIgZW5naW5lIGNvbmZpZyBzdG9yYWdlOicsIGVycm9yKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgY29uZmlnVmlld01vZGVsID0gbmV3IENvbmZpZ1ZpZXdNb2RlbCgpO1xuIiwgIi8qKlxuICogQm9hcmQgVmlld01vZGVsXG4gKiBWaWV3TW9kZWwgbGF5ZXIgLSBNb2JYIHN0b3JlIGZvciBjaGVzcyBib2FyZCBzdGF0ZVxuICovXG5cbmltcG9ydCB7IG1ha2VBdXRvT2JzZXJ2YWJsZSwgYWN0aW9uLCByZWFjdGlvbiwgcnVuSW5BY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IENoZXNzLCBNb3ZlLCBTcXVhcmUgfSBmcm9tICdjaGVzcy5qcyc7XG5pbXBvcnQgeyBjYW5BcHBseUFuYWx5emVkTW92ZSB9IGZyb20gJy4uL2VuZ2luZS9hbmFseXNpc1NhZmV0eSc7XG5pbXBvcnQgeyBkZXJpdmVCcmlsbGlhbnRVc2FnZSwgTW92ZUFubm90YXRpb24gfSBmcm9tICcuLi9lbmdpbmUvYnJpbGxpYW50VHJhY2tpbmcnO1xuaW1wb3J0IHsgUGVyc2lzdGVkQm9hcmRTdGF0ZSwgY3JlYXRlR2FtZVNlc3Npb25JZCwgcmVzb2x2ZVBnblN0YXJ0RmVuIH0gZnJvbSAnLi4vZW5naW5lL2dhbWVTZXNzaW9uJztcbmltcG9ydCB7IGVuZ2luZVZpZXdNb2RlbCB9IGZyb20gJy4vRW5naW5lVmlld01vZGVsJztcbmltcG9ydCB7IGNvbmZpZ1ZpZXdNb2RlbCB9IGZyb20gJy4vQ29uZmlnVmlld01vZGVsJztcbmltcG9ydCB7IGZlYXR1cmVPcHRpb25zVmlld01vZGVsIH0gZnJvbSAnLi9GZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCc7XG5pbXBvcnQgeyBjcmVhdGVEZWJ1Z0xvZ2dlciB9IGZyb20gJy4uL3NoYXJlZC9kZWJ1Zyc7XG5pbXBvcnQge1xuICBQaWNrZWRNb3ZlUmVzdWx0LFxuICBNb3ZlQnVja2V0LFxuICBEaXNwbGF5TW92ZUJ1Y2tldCxcbiAgRElTUExBWV9CVUNLRVRfTEFCRUxTLFxuICBCVUNLRVRfTEFCRUxTLFxuICBCVUNLRVRfQ09MT1JTLFxuICBESVNQTEFZX0JVQ0tFVF9DT0xPUlMsXG59IGZyb20gJy4uL2VuZ2luZS90eXBlcyc7XG5pbXBvcnQgeyBjYWxjdWxhdGVIdW1hbkRlbGF5TXMgfSBmcm9tICcuLi9lbmdpbmUvcGVyc29uYUJpYXMnO1xuaW1wb3J0IHsgbWFwTGVnYWxNb3Zlc1RvQnVja2V0cyB9IGZyb20gJy4uL2VuZ2luZS9tb3ZlQ2xhc3NpZmllcic7XG5cbmNvbnN0IGxvZ2dlciA9IGNyZWF0ZURlYnVnTG9nZ2VyKCdCb2FyZFZpZXdNb2RlbCcpO1xuXG5leHBvcnQgY2xhc3MgQm9hcmRWaWV3TW9kZWwge1xuICBwcml2YXRlIGNoZXNzOiBDaGVzcyA9IG5ldyBDaGVzcygpO1xuICBmZW4gPSB0aGlzLmNoZXNzLmZlbigpO1xuICBnYW1lU3RhcnRGZW4gPSB0aGlzLmNoZXNzLmZlbigpO1xuICBnYW1lU2Vzc2lvbklkID0gY3JlYXRlR2FtZVNlc3Npb25JZCgpO1xuICBoaXN0b3J5OiBNb3ZlW10gPSBbXTtcbiAgbGFzdE1vdmU6IHsgZnJvbTogU3F1YXJlOyB0bzogU3F1YXJlIH0gfCBudWxsID0gbnVsbDtcbiAgbGFzdFBsYXllZEJ1Y2tldDogTW92ZUJ1Y2tldCB8IG51bGwgPSBudWxsO1xuICBzdGF0dXNNZXNzYWdlID0gJ1JlYWR5JztcbiAgbGFzdFNraXBwZWRFbmdpbmVNb3ZlTWVzc2FnZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgYXV0b1BsYXlFbmFibGVkID0gdHJ1ZTsgLy8gQXV0by1wbGF5IGVuZ2luZSBtb3ZlcyBhZnRlciBodW1hbiBtb3Zlc1xuICBlbmdpbmVQbGF5c0ZvcjogJ3cnIHwgJ2InID0gJ2InOyAvLyBXaGljaCBzaWRlIHRoZSBlbmdpbmUgcGxheXMgZm9yIChkZWZhdWx0OiBibGFjaylcbiAgYm9hcmRGbGlwcGVkID0gZmFsc2U7IC8vIEJvYXJkIG9yaWVudGF0aW9uIChmYWxzZSA9IHdoaXRlIG9uIGJvdHRvbSwgdHJ1ZSA9IGJsYWNrIG9uIGJvdHRvbSlcbiAgc2hvd01vdmVBcnJvd3MgPSBmYWxzZTsgLy8gU2hvdyBhcnJvd3MgZm9yIGFsbCBwb3NzaWJsZSBtb3Zlc1xuICBzaG93QXJyb3dzRm9yU2lkZTogJ2N1cnJlbnQnIHwgJ3BsYXllcicgfCAnZW5naW5lJyA9ICdjdXJyZW50JzsgLy8gV2hpY2ggc2lkZSdzIG1vdmVzIHRvIHNob3cgYXJyb3dzIGZvclxuICBsYXN0UGxheWVyTW92ZVF1YWxpdHk6IERpc3BsYXlNb3ZlQnVja2V0IHwgbnVsbCA9IG51bGw7IC8vIFF1YWxpdHkgb2YgdGhlIGxhc3QgcGxheWVyIG1vdmVcbiAgaXNBbmFseXppbmdNb3ZlcyA9IGZhbHNlOyAvLyBXaGV0aGVyIHdlJ3JlIGN1cnJlbnRseSBhbmFseXppbmcgbW92ZXNcbiAgXG4gIC8vIFN0b3JlIGFuYWx5emVkIG1vdmVzIGFzIGFuIG9iamVjdCBmb3IgTW9iWCBvYnNlcnZhYmlsaXR5XG4gIHByaXZhdGUgX2FuYWx5emVkTGVnYWxNb3ZlczogUmVjb3JkPHN0cmluZywgRGlzcGxheU1vdmVCdWNrZXQ+ID0ge307XG4gIHByaXZhdGUgcmVkb1N0YWNrOiBNb3ZlW10gPSBbXTsgLy8gU3RhY2sgb2YgbW92ZXMgdGhhdCB3ZXJlIHVuZG9uZSBmb3IgcmVkbyBmdW5jdGlvbmFsaXR5XG4gIHByaXZhdGUgaGlzdG9yeUFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdID0gW107XG4gIHByaXZhdGUgcmVkb0Fubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdID0gW107XG4gIHByaXZhdGUgYW5hbHl6ZWRMZWdhbE1vdmVzRmVuOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfYW5hbHlzaXNUaW1lb3V0OiBOb2RlSlMuVGltZW91dCB8IG51bGwgPSBudWxsOyAvLyBUaW1lb3V0IGZvciBkZWJvdW5jaW5nIG1vdmUgYW5hbHlzaXNcbiAgcHJpdmF0ZSByZWFkb25seSBGRU5fU1RPUkFHRV9LRVkgPSAncGVyc29uYWNoZXNzX2N1cnJlbnRfZmVuJztcbiAgcHJpdmF0ZSByZWFkb25seSBGRU5fSElTVE9SWV9LRVkgPSAncGVyc29uYWNoZXNzX2Zlbl9oaXN0b3J5JztcbiAgcHJpdmF0ZSByZWFkb25seSBCT0FSRF9TVEFURV9TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfYm9hcmRfc3RhdGUnO1xuICBwcml2YXRlIHJlYWRvbmx5IE1BWF9ISVNUT1JZID0gNTA7IC8vIE1heGltdW0gbnVtYmVyIG9mIEZFTiBwb3NpdGlvbnMgdG8gc3RvcmVcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgbG9hZEZlbjogYWN0aW9uLFxuICAgICAgbG9hZFBnbjogYWN0aW9uLFxuICAgICAgbWFrZU1vdmU6IGFjdGlvbixcbiAgICAgIHNvbHZlTmV4dE1vdmU6IGFjdGlvbixcbiAgICAgIHJlc2V0OiBhY3Rpb24sXG4gICAgICB1bmRvOiBhY3Rpb24sXG4gICAgICB1bmRvU2luZ2xlOiBhY3Rpb24sXG4gICAgICByZWRvU2luZ2xlOiBhY3Rpb24sXG4gICAgICBzZXRBdXRvUGxheTogYWN0aW9uLFxuICAgICAgc2V0RW5naW5lUGxheXNGb3I6IGFjdGlvbixcbiAgICAgIGZsaXBCb2FyZDogYWN0aW9uLFxuICAgICAgc2V0Qm9hcmRGbGlwcGVkOiBhY3Rpb24sXG4gICAgICBzYXZlRmVuVG9IaXN0b3J5OiBhY3Rpb24sXG4gICAgICBsb2FkRmVuRnJvbUhpc3Rvcnk6IGFjdGlvbixcbiAgICAgIHRvZ2dsZU1vdmVBcnJvd3M6IGFjdGlvbixcbiAgICAgIHNldFNob3dNb3ZlQXJyb3dzRW5hYmxlZDogYWN0aW9uLFxuICAgICAgc2V0U2hvd0Fycm93c0ZvclNpZGU6IGFjdGlvbixcbiAgICAgIGFuYWx5emVBbGxNb3ZlczogYWN0aW9uLFxuICAgICAgYW5hbHl6ZVBsYXllck1vdmU6IGFjdGlvbixcbiAgICB9KTtcbiAgICBcbiAgICAvLyBUcnkgdG8gcmVzdG9yZSBGRU4gZnJvbSBsb2NhbFN0b3JhZ2Ugb24gaW5pdGlhbGl6YXRpb25cbiAgICB0aGlzLnJlc3RvcmVGZW5Gcm9tU3RvcmFnZSgpO1xuXG4gICAgcmVhY3Rpb24oXG4gICAgICAoKSA9PiBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5wZXJzaXN0RW5naW5lQ29uZmlnLFxuICAgICAgKHBlcnNpc3RFbmdpbmVDb25maWcpID0+IHtcbiAgICAgICAgaWYgKCFwZXJzaXN0RW5naW5lQ29uZmlnKSB7XG4gICAgICAgICAgdGhpcy5jbGVhclBlcnNpc3RlZEJvYXJkU3RhdGUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNhdmVGZW5Ub0hpc3RvcnkoKTtcbiAgICAgIH0sXG4gICAgICB7IGZpcmVJbW1lZGlhdGVseTogdHJ1ZSB9LFxuICAgICk7XG4gICAgXG4gICAgbG9nZ2VyLmRlYnVnKCdJbml0aWFsaXplZCB3aXRoIEZFTjonLCB0aGlzLmZlbik7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGF1dG8tcGxheSBtb2RlXG4gICAqL1xuICBzZXRBdXRvUGxheShlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5hdXRvUGxheUVuYWJsZWQgPSBlbmFibGVkO1xuICAgIGxvZ2dlci5kZWJ1ZygnQXV0by1wbGF5IHNldCB0bzonLCBlbmFibGVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hpY2ggc2lkZSB0aGUgZW5naW5lIHBsYXlzIGZvclxuICAgKi9cbiAgc2V0RW5naW5lUGxheXNGb3Ioc2lkZTogJ3cnIHwgJ2InKTogdm9pZCB7XG4gICAgdGhpcy5lbmdpbmVQbGF5c0ZvciA9IHNpZGU7XG4gICAgbG9nZ2VyLmRlYnVnKCdFbmdpbmUgcGxheXMgZm9yOicsIHNpZGUgPT09ICd3JyA/ICdXaGl0ZScgOiAnQmxhY2snKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIGEgcG9zaXRpb24gZnJvbSBGRU4gc3RyaW5nXG4gICAqL1xuICBsb2FkRmVuKFxuICAgIGZlbjogc3RyaW5nLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc/OiBib29sZWFuO1xuICAgICAgc2Vzc2lvbklkPzogc3RyaW5nO1xuICAgICAgZ2FtZVN0YXJ0RmVuPzogc3RyaW5nO1xuICAgICAgaGlzdG9yeUFubm90YXRpb25zPzogTW92ZUFubm90YXRpb25bXTtcbiAgICAgIHJlZG9Bbm5vdGF0aW9ucz86IE1vdmVBbm5vdGF0aW9uW107XG4gICAgfSA9IHt9LFxuICApOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qge1xuICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nID0gdHJ1ZSxcbiAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICBnYW1lU3RhcnRGZW4sXG4gICAgICAgIGhpc3RvcnlBbm5vdGF0aW9ucyxcbiAgICAgICAgcmVkb0Fubm90YXRpb25zLFxuICAgICAgfSA9IG9wdGlvbnM7XG4gICAgICBsb2dnZXIuZGVidWcoJ2xvYWRGZW4gY2FsbGVkOicsIGZlbik7XG4gICAgICBjb25zdCBuZXdDaGVzcyA9IG5ldyBDaGVzcyhmZW4pO1xuICAgICAgdGhpcy5jaGVzcyA9IG5ld0NoZXNzO1xuICAgICAgdGhpcy5iZWdpblNlc3Npb25TdGF0ZSh7XG4gICAgICAgIGdhbWVTZXNzaW9uSWQ6IHNlc3Npb25JZCA/PyBjcmVhdGVHYW1lU2Vzc2lvbklkKCksXG4gICAgICAgIGdhbWVTdGFydEZlbjogZ2FtZVN0YXJ0RmVuID8/IGZlbixcbiAgICAgICAgcmVzZXRCcmlsbGlhbnRUcmFja2luZyxcbiAgICAgICAgaGlzdG9yeUFubm90YXRpb25zLFxuICAgICAgICByZWRvQW5ub3RhdGlvbnMsXG4gICAgICB9KTtcbiAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdQb3NpdGlvbiBsb2FkZWQnO1xuICAgICAgdGhpcy5sYXN0U2tpcHBlZEVuZ2luZU1vdmVNZXNzYWdlID0gbnVsbDtcbiAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgbG9nZ2VyLmRlYnVnKCdGRU4gbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ2xvYWRGZW4gZXJyb3I6JywgZXJyKTtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBJbnZhbGlkIEZFTjogJHtlcnJ9YDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBhIGdhbWUgZnJvbSBQR04gc3RyaW5nXG4gICAqL1xuICBsb2FkUGduKFxuICAgIHBnbjogc3RyaW5nLFxuICAgIG9wdGlvbnM6IHsgcmVzZXRCcmlsbGlhbnRUcmFja2luZz86IGJvb2xlYW47IHNlc3Npb25JZD86IHN0cmluZyB9ID0ge30sXG4gICk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHJlc2V0QnJpbGxpYW50VHJhY2tpbmcgPSB0cnVlLCBzZXNzaW9uSWQgfSA9IG9wdGlvbnM7XG4gICAgICBsb2dnZXIuZGVidWcoJ2xvYWRQZ24gY2FsbGVkJyk7XG4gICAgICBjb25zdCBuZXdDaGVzcyA9IG5ldyBDaGVzcygpO1xuICAgICAgbmV3Q2hlc3MubG9hZFBnbihwZ24pO1xuICAgICAgY29uc3QgZ2FtZVN0YXJ0RmVuID0gcmVzb2x2ZVBnblN0YXJ0RmVuKG5ld0NoZXNzLmhlYWRlcigpLCBuZXcgQ2hlc3MoKS5mZW4oKSk7XG4gICAgICB0aGlzLmNoZXNzID0gbmV3Q2hlc3M7XG4gICAgICB0aGlzLmJlZ2luU2Vzc2lvblN0YXRlKHtcbiAgICAgICAgZ2FtZVNlc3Npb25JZDogc2Vzc2lvbklkID8/IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKSxcbiAgICAgICAgZ2FtZVN0YXJ0RmVuLFxuICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnUEdOIGxvYWRlZCc7XG4gICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignbG9hZFBnbiBlcnJvcjonLCBlcnIpO1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gYEludmFsaWQgUEdOOiAke2Vycn1gO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGEgbW92ZSBvbiB0aGUgYm9hcmQgKHNpbWlsYXIgdG8gdGhlIGV4YW1wbGUgcGF0dGVybilcbiAgICogVGhpcyBpcyBzeW5jaHJvbm91cyBmb3IgaW1tZWRpYXRlIFVJIGZlZWRiYWNrLCBqdXN0IGxpa2UgdGhlIGV4YW1wbGVcbiAgICovXG4gIG1ha2VNb3ZlKGZyb206IFNxdWFyZSwgdG86IFNxdWFyZSwgcHJvbW90aW9uID0gJ3EnKTogYm9vbGVhbiB7XG4gICAgbG9nZ2VyLmRlYnVnKCdtYWtlTW92ZSBjYWxsZWQnLCB7IGZyb20sIHRvLCBwcm9tb3Rpb24sIGN1cnJlbnRGZW46IHRoaXMuZmVuLCBjdXJyZW50VHVybjogdGhpcy5jaGVzcy50dXJuKCkgfSk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIC8vIFRyeSB0byBtYWtlIHRoZSBtb3ZlIGFjY29yZGluZyB0byBjaGVzcy5qcyBsb2dpYyAoZXhhY3RseSBsaWtlIHRoZSBleGFtcGxlKVxuICAgICAgLy8gY2hlc3MuanMgd2lsbCB2YWxpZGF0ZSB0aGUgbW92ZSBhdXRvbWF0aWNhbGx5XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgZnJvbSxcbiAgICAgICAgdG8sXG4gICAgICAgIHByb21vdGlvbjogcHJvbW90aW9uIGFzICdxJyB8ICdyJyB8ICdiJyB8ICduJyB8IHVuZGVmaW5lZCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobW92ZSkge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ01vdmUgc3VjY2Vzc2Z1bDonLCBtb3ZlLnNhbik7XG4gICAgICAgIC8vIENsZWFyIHJlZG8gc3RhY2sgd2hlbiBhIG5ldyBtb3ZlIGlzIG1hZGVcbiAgICAgICAgdGhpcy5jbGVhclJlZG9TdGF0ZSgpO1xuICAgICAgICB0aGlzLnJlY29yZE1vdmVBbm5vdGF0aW9uKG1vdmUsIGZhbHNlKTtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBwb3NpdGlvbiBzdGF0ZSB0byB0cmlnZ2VyIGEgcmUtcmVuZGVyICh2aWEgTW9iWCBvYnNlcnZhYmxlKVxuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSB7IGZyb20sIHRvIH07XG4gICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IGBZb3UgcGxheWVkOiAke21vdmUuc2FufWA7XG4gICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8gQW5hbHl6ZSB0aGUgcGxheWVyJ3MgbW92ZSBxdWFsaXR5XG4gICAgICAgIHRoaXMuYW5hbHl6ZVBsYXllck1vdmUobW92ZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBNYWtlIGVuZ2luZSBtb3ZlIGFmdGVyIGEgc2hvcnQgZGVsYXkgaWY6XG4gICAgICAgIC8vIDEuIEF1dG8tcGxheSBpcyBlbmFibGVkXG4gICAgICAgIC8vIDIuIEdhbWUgaXMgbm90IG92ZXJcbiAgICAgICAgLy8gMy4gSXQncyBub3cgdGhlIGVuZ2luZSdzIHR1cm4gKHRoZSB0dXJuIGNoYW5nZWQgYWZ0ZXIgdGhlIGh1bWFuIG1vdmUpXG4gICAgICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiAhdGhpcy5pc0dhbWVPdmVyICYmIHRoaXMuY2hlc3MudHVybigpID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yKSB7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdTY2hlZHVsaW5nIGF1dG8tcGxheSBmb3IgZW5naW5lIHNpZGU6JywgdGhpcy5lbmdpbmVQbGF5c0Zvcik7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNvbHZlTmV4dE1vdmUodHJ1ZSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdBdXRvLXBsYXkgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sIDUwMCk7IC8vIFNpbWlsYXIgZGVsYXkgdG8gdGhlIGV4YW1wbGVcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gUmV0dXJuIHRydWUgYXMgdGhlIG1vdmUgd2FzIHN1Y2Nlc3NmdWxcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ01vdmUgZmFpbGVkIC0gY2hlc3MuanMgcmV0dXJuZWQgbnVsbCcpO1xuICAgICAgICAvLyBSZXR1cm4gZmFsc2UgYXMgdGhlIG1vdmUgd2FzIG5vdCBzdWNjZXNzZnVsXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnTW92ZSBleGNlcHRpb246JywgZXJyKTtcbiAgICAgIC8vIFJldHVybiBmYWxzZSBhcyB0aGUgbW92ZSB3YXMgbm90IHN1Y2Nlc3NmdWxcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBhIG1vdmUgZnJvbSBVQ0kgbm90YXRpb24gKGUuZy4sIFwiZTJlNFwiKVxuICAgKiBVc2VkIGJ5IHRoZSBlbmdpbmVcbiAgICovXG4gIGFzeW5jIG1ha2VNb3ZlVUNJKFxuICAgIHVjaTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IHsgY29uc3VtZWRCcmlsbGlhbnQ/OiBib29sZWFuIH0gPSB7fSxcbiAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHVjaS5sZW5ndGggPCA0KSByZXR1cm4gZmFsc2U7XG4gICAgXG4gICAgY29uc3QgZnJvbSA9IHVjaS5zbGljZSgwLCAyKSBhcyBTcXVhcmU7XG4gICAgY29uc3QgdG8gPSB1Y2kuc2xpY2UoMiwgNCkgYXMgU3F1YXJlO1xuICAgIGNvbnN0IHByb21vdGlvbiA9IHVjaS5sZW5ndGggPiA0ID8gdWNpWzRdIDogdW5kZWZpbmVkO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgZnJvbSxcbiAgICAgICAgdG8sXG4gICAgICAgIHByb21vdGlvbjogcHJvbW90aW9uIGFzICdxJyB8ICdyJyB8ICdiJyB8ICduJyB8IHVuZGVmaW5lZCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobW92ZSkge1xuICAgICAgICAvLyBDbGVhciByZWRvIHN0YWNrIHdoZW4gYSBuZXcgbW92ZSBpcyBtYWRlXG4gICAgICAgIHRoaXMuY2xlYXJSZWRvU3RhdGUoKTtcbiAgICAgICAgdGhpcy5yZWNvcmRNb3ZlQW5ub3RhdGlvbihtb3ZlLCBvcHRpb25zLmNvbnN1bWVkQnJpbGxpYW50ID8/IGZhbHNlKTtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICB0aGlzLmxhc3RNb3ZlID0geyBmcm9tLCB0byB9O1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgRW5naW5lIHBsYXllZDogJHttb3ZlLnNhbn1gO1xuICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNvbHZlIGFuZCBwbGF5IHRoZSBuZXh0IG1vdmUgdXNpbmcgdGhlIGVuZ2luZSBhbmQgYnVja2V0IGNvbmZpZ3VyYXRpb25cbiAgICovXG4gIGFzeW5jIHNvbHZlTmV4dE1vdmUoYXV0b1RyaWdnZXJlZCA9IGZhbHNlKTogUHJvbWlzZTxQaWNrZWRNb3ZlUmVzdWx0IHwgbnVsbD4ge1xuICAgIGlmICh0aGlzLmlzR2FtZU92ZXIpIHtcbiAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdHYW1lIGlzIG92ZXInO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ0VuZ2luZSB0aGlua2luZy4uLic7XG4gICAgICB9KTtcblxuICAgICAgLy8gSW5pdGlhbGl6ZSBlbmdpbmUgaWYgbmVlZGVkXG4gICAgICBpZiAoIWVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkKSB7XG4gICAgICAgIGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFuYWx5emUgY3VycmVudCBwb3NpdGlvblxuICAgICAgY29uc3QgYW5hbHlzaXMgPSBhd2FpdCBlbmdpbmVWaWV3TW9kZWwuYW5hbHl6ZVBvc2l0aW9uKFxuICAgICAgICB0aGlzLmZlbixcbiAgICAgICAgY29uZmlnVmlld01vZGVsLmRlcHRoLFxuICAgICAgICBjb25maWdWaWV3TW9kZWwubXVsdGlQVixcbiAgICAgICAgJ2VuZ2luZU1vdmUnLFxuICAgICAgKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgYW5hbHlzaXMgcmV0dXJuZWQgbm8gbW92ZXMgKGdhbWUgb3ZlciBwb3NpdGlvbilcbiAgICAgIGlmIChhbmFseXNpcy5pZ25vcmVkIHx8IGFuYWx5c2lzLm1vdmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgaWYgKGFuYWx5c2lzLmlnbm9yZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdFbmdpbmUgYW5hbHlzaXMgZXhwaXJlZCc7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzQ2hlY2ttYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnQ2hlY2ttYXRlISBHYW1lIG92ZXIuJztcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNTdGFsZW1hdGUpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdTdGFsZW1hdGUhIEdhbWUgb3Zlci4nO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0RyYXcpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdEcmF3ISBHYW1lIG92ZXIuJztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ05vIGxlZ2FsIG1vdmVzIGF2YWlsYWJsZSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubGFzdFNraXBwZWRFbmdpbmVNb3ZlTWVzc2FnZSA9IGFuYWx5c2lzLmlnbm9yZWQgPyAnQSBuZXdlciBlbmdpbmUgYW5hbHlzaXMgcmVwbGFjZWQgdGhpcyBtb3ZlIHJlcXVlc3QuJyA6IG51bGw7XG4gICAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gUGljayBhIG1vdmUgYmFzZWQgb24gYnVja2V0IGNvbmZpZ3VyYXRpb25cbiAgICAgIGNvbnN0IHBlcnNvbmEgPSBjb25maWdWaWV3TW9kZWwuY3VycmVudFByZXNldElkID8/ICdjdXN0b20nO1xuICAgICAgY29uc3QgcmVzdWx0ID0gZW5naW5lVmlld01vZGVsLnBpY2tNb3ZlRnJvbUFuYWx5c2lzKGFuYWx5c2lzLCBjb25maWdWaWV3TW9kZWwuYnVja2V0Q29uZmlnLCB7XG4gICAgICAgIGZlbjogdGhpcy5mZW4sXG4gICAgICAgIGdhbWVTdGFydEZlbjogdGhpcy5nYW1lU3RhcnRGZW4sXG4gICAgICAgIG1vdmVDb3VudDogdGhpcy5tb3ZlQ291bnQsXG4gICAgICAgIHNpZGVUb01vdmU6IHRoaXMudHVybixcbiAgICAgICAgcGVyc29uYSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGlmIChhdXRvVHJpZ2dlcmVkICYmIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnVzZUh1bWFuRGVsYXlTaW11bGF0aW9uKSB7XG4gICAgICAgICAgY29uc3QgZGVsYXlNcyA9IGNhbGN1bGF0ZUh1bWFuRGVsYXlNcyh7XG4gICAgICAgICAgICBjb21wbGV4aXR5OiBhbmFseXNpcy5jb21wbGV4aXR5LFxuICAgICAgICAgICAgcGVyc29uYSxcbiAgICAgICAgICAgIGJ1Y2tldDogcmVzdWx0LmJ1Y2tldCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBhd2FpdCB0aGlzLndhaXQoZGVsYXlNcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNhbkFwcGx5QW5hbHl6ZWRNb3ZlKHRoaXMuZmVuLCBhbmFseXNpcy5hbmFseXplZEZlbikpIHtcbiAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnUG9zaXRpb24gY2hhbmdlZCwgc3RhbGUgZW5naW5lIG1vdmUgZGlzY2FyZGVkJztcbiAgICAgICAgICAgIHRoaXMubGFzdFNraXBwZWRFbmdpbmVNb3ZlTWVzc2FnZSA9ICdTa2lwcGVkIGVuZ2luZSBtb3ZlIGJlY2F1c2UgdGhlIGJvYXJkIGNoYW5nZWQgYmVmb3JlIGl0IGNvdWxkIGJlIHBsYXllZC4nO1xuICAgICAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBcHBseSB0aGUgcGlja2VkIG1vdmVcbiAgICAgICAgY29uc3QgbW92ZVN1Y2Nlc3MgPSBhd2FpdCB0aGlzLm1ha2VNb3ZlVUNJKHJlc3VsdC5tb3ZlLm1vdmUsIHtcbiAgICAgICAgICBjb25zdW1lZEJyaWxsaWFudDogcmVzdWx0LmlzQnJpbGxpYW50ID8/IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChtb3ZlU3VjY2Vzcykge1xuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IHJlc3VsdC5idWNrZXQ7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSByZXN1bHQuaXNCcmlsbGlhbnRcbiAgICAgICAgICAgICAgPyAnRW5naW5lIHBsYXllZDogQnJpbGxpYW50IG1vdmUnXG4gICAgICAgICAgICAgIDogYEVuZ2luZSBwbGF5ZWQ6ICR7QlVDS0VUX0xBQkVMU1tyZXN1bHQuYnVja2V0XX0gbW92ZWA7XG4gICAgICAgICAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ0VuZ2luZSBtb3ZlIGZhaWxlZCc7XG4gICAgICAgICAgICB0aGlzLmlzVGhpbmtpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ05vIG1vdmVzIGF2YWlsYWJsZSc7XG4gICAgICAgICAgdGhpcy5pc1RoaW5raW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignc29sdmVOZXh0TW92ZSBlcnJvcjonLCBlcnIpO1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgRXJyb3I6ICR7ZXJyfWA7XG4gICAgICAgIHRoaXMuaXNUaGlua2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIGJvYXJkIHRvIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAqL1xuICByZXNldCgpOiB2b2lkIHtcbiAgICBsb2dnZXIuZGVidWcoJ3Jlc2V0IGNhbGxlZCcpO1xuICAgIHRoaXMuY2hlc3MgPSBuZXcgQ2hlc3MoKTtcbiAgICB0aGlzLmJlZ2luU2Vzc2lvblN0YXRlKHtcbiAgICAgIGdhbWVTZXNzaW9uSWQ6IGNyZWF0ZUdhbWVTZXNzaW9uSWQoKSxcbiAgICAgIGdhbWVTdGFydEZlbjogdGhpcy5jaGVzcy5mZW4oKSxcbiAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IHRydWUsXG4gICAgfSk7XG4gICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ0JvYXJkIHJlc2V0JztcbiAgICB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgPSBudWxsO1xuICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgIGxvZ2dlci5kZWJ1ZygnQm9hcmQgcmVzZXQsIG5ldyBGRU46JywgdGhpcy5mZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuZG8gdGhlIGxhc3QgbW92ZSAob3IgbGFzdCB0d28gbW92ZXMgaWYgYXV0by1wbGF5IGlzIG9uIGFuZCBlbmdpbmUganVzdCBtb3ZlZClcbiAgICovXG4gIHVuZG8oKTogYm9vbGVhbiB7XG4gICAgbG9nZ2VyLmRlYnVnKCd1bmRvIGNhbGxlZCwgaGlzdG9yeSBsZW5ndGg6JywgdGhpcy5oaXN0b3J5Lmxlbmd0aCk7XG4gICAgXG4gICAgLy8gSWYgYXV0by1wbGF5IGlzIGVuYWJsZWQgYW5kIHRoZSBsYXN0IG1vdmUgd2FzIGJ5IHRoZSBlbmdpbmUsIHVuZG8gYm90aCBtb3Zlc1xuICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiB0aGlzLmhpc3RvcnkubGVuZ3RoID49IDIpIHtcbiAgICAgIC8vIENoZWNrIGlmIHRoZSBsYXN0IG1vdmUgd2FzIGJ5IHRoZSBlbmdpbmVcbiAgICAgIGNvbnN0IGxhc3RNb3ZlID0gdGhpcy5oaXN0b3J5W3RoaXMuaGlzdG9yeS5sZW5ndGggLSAxXTtcbiAgICAgIGNvbnN0IGxhc3RNb3ZlQ29sb3IgPSBsYXN0TW92ZS5jb2xvcjtcbiAgICAgIFxuICAgICAgLy8gSWYgbGFzdCBtb3ZlIHdhcyBieSBlbmdpbmUsIHVuZG8gYm90aCAoZW5naW5lIG1vdmUgKyBodW1hbiBtb3ZlKVxuICAgICAgaWYgKGxhc3RNb3ZlQ29sb3IgPT09IHRoaXMuZW5naW5lUGxheXNGb3IpIHtcbiAgICAgICAgaWYgKHRoaXMudW5kb01vdmVzKDIpKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xuICAgICAgICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ1VuZGlkIGxhc3QgMiBtb3ZlcyAoaHVtYW4gKyBlbmdpbmUpJztcbiAgICAgICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoJ1VuZGlkIDIgbW92ZXMnKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTGFzdCBtb3ZlIHdhcyBieSBodW1hbiwganVzdCB1bmRvIG9uZVxuICAgICAgICBpZiAodGhpcy51bmRvTW92ZXMoMSkpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgICAgdGhpcy5sYXN0TW92ZSA9IG51bGw7XG4gICAgICAgICAgdGhpcy5sYXN0UGxheWVkQnVja2V0ID0gbnVsbDtcbiAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSAnTW92ZSB1bmRvbmUnO1xuICAgICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnVW5kaWQgMSBtb3ZlJyk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXV0by1wbGF5IGRpc2FibGVkIG9yIG5vdCBlbm91Z2ggbW92ZXMsIHVuZG8ganVzdCBvbmUgbW92ZVxuICAgICAgaWYgKHRoaXMudW5kb01vdmVzKDEpKSB7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdGUoKTtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdFBsYXllZEJ1Y2tldCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9ICdNb3ZlIHVuZG9uZSc7XG4gICAgICAgIGVuZ2luZVZpZXdNb2RlbC5yZXNldCgpO1xuICAgICAgICBsb2dnZXIuZGVidWcoJ1VuZGlkIDEgbW92ZScpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgbG9nZ2VyLmRlYnVnKCdVbmRvIGZhaWxlZCAtIG5vIG1vdmVzIHRvIHVuZG8nKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIGludGVybmFsIHN0YXRlIGZyb20gY2hlc3MgaW5zdGFuY2VcbiAgICovXG4gIHByaXZhdGUgdXBkYXRlU3RhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5mZW4gPSB0aGlzLmNoZXNzLmZlbigpO1xuICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuY2hlc3MuaGlzdG9yeSh7IHZlcmJvc2U6IHRydWUgfSk7XG4gICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPSBudWxsO1xuICAgIC8vIFNhdmUgRkVOIHRvIGxvY2FsU3RvcmFnZSB3aGVuZXZlciBpdCBjaGFuZ2VzXG4gICAgdGhpcy5zYXZlRmVuVG9IaXN0b3J5KCk7XG4gICAgbG9nZ2VyLmRlYnVnKCd1cGRhdGVTdGF0ZSAtIEZFTjonLCB0aGlzLmZlbiwgJ0hpc3RvcnkgbGVuZ3RoOicsIHRoaXMuaGlzdG9yeS5sZW5ndGgpO1xuICAgIFxuICAgIC8vIEF1dG9tYXRpY2FsbHkgcmUtYW5hbHl6ZSBtb3ZlcyBpZiBhcnJvd3MgYXJlIGVuYWJsZWQgKGRlYm91bmNlZCB0byBwcmV2ZW50IGV4Y2Vzc2l2ZSBjYWxscylcbiAgICBpZiAodGhpcy5zaG93TW92ZUFycm93cyAmJiAhdGhpcy5pc0dhbWVPdmVyICYmICF0aGlzLmlzQW5hbHl6aW5nTW92ZXMpIHtcbiAgICAgIC8vIENsZWFyIHByZXZpb3VzIGFuYWx5c2lzIGFuZCB0cmlnZ2VyIG5ldyBhbmFseXNpcyBhc3luY2hyb25vdXNseVxuICAgICAgLy8gVXNlIHNldFRpbWVvdXQgdG8gZGVib3VuY2UgYW5kIHByZXZlbnQgcmUtcmVuZGVyIGxvb3BzXG4gICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICAgIC8vIENsZWFyIGFueSBwZW5kaW5nIGFuYWx5c2lzIHRpbWVvdXRcbiAgICAgIGlmICh0aGlzLl9hbmFseXNpc1RpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2FuYWx5c2lzVGltZW91dCk7XG4gICAgICB9XG4gICAgICAvLyBEZWJvdW5jZSBhbmFseXNpcyB0byBwcmV2ZW50IGV4Y2Vzc2l2ZSBjYWxsc1xuICAgICAgdGhpcy5fYW5hbHlzaXNUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYW5hbHl6ZUFsbE1vdmVzKCkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBhbmFseXplIG1vdmVzOicsIGVycik7XG4gICAgICAgIH0pO1xuICAgICAgfSwgMzAwKTsgLy8gMzAwbXMgZGVib3VuY2VcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmxpcCB0aGUgYm9hcmQgb3JpZW50YXRpb24gYW5kIGVuZ2luZSBwbGF5aW5nIGNvbG9yXG4gICAqL1xuICBmbGlwQm9hcmQoKTogdm9pZCB7XG4gICAgdGhpcy5ib2FyZEZsaXBwZWQgPSAhdGhpcy5ib2FyZEZsaXBwZWQ7XG4gICAgLy8gRmxpcCB0aGUgZW5naW5lJ3MgcGxheWluZyBjb2xvciB3aGVuIGJvYXJkIGlzIGZsaXBwZWRcbiAgICB0aGlzLmVuZ2luZVBsYXlzRm9yID0gdGhpcy5lbmdpbmVQbGF5c0ZvciA9PT0gJ3cnID8gJ2InIDogJ3cnO1xuICAgIGxvZ2dlci5kZWJ1ZygnQm9hcmQgZmxpcHBlZCwgb3JpZW50YXRpb246JywgdGhpcy5ib2FyZEZsaXBwZWQgPyAnYmxhY2snIDogJ3doaXRlJywgJ0VuZ2luZSBub3cgcGxheXMgZm9yOicsIHRoaXMuZW5naW5lUGxheXNGb3IgPT09ICd3JyA/ICdXaGl0ZScgOiAnQmxhY2snKTtcbiAgfVxuXG4gIHNldEJvYXJkRmxpcHBlZChmbGlwcGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYm9hcmRGbGlwcGVkICE9PSBmbGlwcGVkKSB7XG4gICAgICB0aGlzLmZsaXBCb2FyZCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIGN1cnJlbnQgRkVOIHRvIGxvY2FsU3RvcmFnZSBoaXN0b3J5XG4gICAqL1xuICBzYXZlRmVuVG9IaXN0b3J5KCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjdXJyZW50RmVuID0gdGhpcy5mZW47XG4gICAgICBcbiAgICAgIC8vIFNhdmUgY3VycmVudCBGRU5cbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuRkVOX1NUT1JBR0VfS0VZLCBjdXJyZW50RmVuKTtcbiAgICAgIFxuICAgICAgLy8gR2V0IGV4aXN0aW5nIGhpc3RvcnlcbiAgICAgIGNvbnN0IGhpc3RvcnlKc29uID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5GRU5fSElTVE9SWV9LRVkpO1xuICAgICAgbGV0IGhpc3Rvcnk6IHN0cmluZ1tdID0gaGlzdG9yeUpzb24gPyBKU09OLnBhcnNlKGhpc3RvcnlKc29uKSA6IFtdO1xuICAgICAgXG4gICAgICBpZiAoaGlzdG9yeS5sZW5ndGggPT09IDAgfHwgaGlzdG9yeVtoaXN0b3J5Lmxlbmd0aCAtIDFdICE9PSBjdXJyZW50RmVuKSB7XG4gICAgICAgIGhpc3RvcnkucHVzaChjdXJyZW50RmVuKTtcblxuICAgICAgICBpZiAoaGlzdG9yeS5sZW5ndGggPiB0aGlzLk1BWF9ISVNUT1JZKSB7XG4gICAgICAgICAgaGlzdG9yeSA9IGhpc3Rvcnkuc2xpY2UoLXRoaXMuTUFYX0hJU1RPUlkpO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5GRU5fSElTVE9SWV9LRVksIEpTT04uc3RyaW5naWZ5KGhpc3RvcnkpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgY29uc3QgYm9hcmRTdGF0ZTogUGVyc2lzdGVkQm9hcmRTdGF0ZSA9IHtcbiAgICAgICAgICBjdXJyZW50RmVuLFxuICAgICAgICAgIGZlbkhpc3Rvcnk6IGhpc3RvcnksXG4gICAgICAgICAgZ2FtZVNlc3Npb25JZDogdGhpcy5nYW1lU2Vzc2lvbklkLFxuICAgICAgICAgIGdhbWVTdGFydEZlbjogdGhpcy5nYW1lU3RhcnRGZW4sXG4gICAgICAgICAgaGlzdG9yeUFubm90YXRpb25zOiB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucyxcbiAgICAgICAgICByZWRvQW5ub3RhdGlvbnM6IHRoaXMucmVkb0Fubm90YXRpb25zLFxuICAgICAgICB9O1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLkJPQVJEX1NUQVRFX1NUT1JBR0VfS0VZLCBKU09OLnN0cmluZ2lmeShib2FyZFN0YXRlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNsZWFyUGVyc2lzdGVkQm9hcmRTdGF0ZSgpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBsb2dnZXIuZGVidWcoJ1NhdmVkIEZFTiB0byBoaXN0b3J5LCB0b3RhbCBlbnRyaWVzOicsIGhpc3RvcnkubGVuZ3RoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHNhdmUgRkVOIHRvIGhpc3Rvcnk6JywgZXJyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZSBGRU4gZnJvbSBsb2NhbFN0b3JhZ2Ugb24gYXBwIHN0YXJ0dXBcbiAgICovXG4gIHByaXZhdGUgcmVzdG9yZUZlbkZyb21TdG9yYWdlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYXZlZEZlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX1NUT1JBR0VfS0VZKTtcbiAgICAgIGlmIChzYXZlZEZlbikge1xuICAgICAgICAvLyBWYWxpZGF0ZSBGRU4gYmVmb3JlIGxvYWRpbmdcbiAgICAgICAgY29uc3QgdGVzdENoZXNzID0gbmV3IENoZXNzKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGVzdENoZXNzLmxvYWQoc2F2ZWRGZW4pO1xuICAgICAgICAgIC8vIEZFTiBpcyB2YWxpZCwgbG9hZCBpdFxuICAgICAgICAgIGNvbnN0IHJlc3RvcmVkQm9hcmRTdGF0ZSA9IHRoaXMucmVhZFBlcnNpc3RlZEJvYXJkU3RhdGUoKTtcbiAgICAgICAgICBpZiAocmVzdG9yZWRCb2FyZFN0YXRlPy5jdXJyZW50RmVuID09PSBzYXZlZEZlbikge1xuICAgICAgICAgICAgdGhpcy5sb2FkRmVuKHNhdmVkRmVuLCB7XG4gICAgICAgICAgICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICBzZXNzaW9uSWQ6IHJlc3RvcmVkQm9hcmRTdGF0ZS5nYW1lU2Vzc2lvbklkLFxuICAgICAgICAgICAgICBnYW1lU3RhcnRGZW46IHJlc3RvcmVkQm9hcmRTdGF0ZS5nYW1lU3RhcnRGZW4sXG4gICAgICAgICAgICAgIGhpc3RvcnlBbm5vdGF0aW9uczogcmVzdG9yZWRCb2FyZFN0YXRlLmhpc3RvcnlBbm5vdGF0aW9ucyxcbiAgICAgICAgICAgICAgcmVkb0Fubm90YXRpb25zOiByZXN0b3JlZEJvYXJkU3RhdGUucmVkb0Fubm90YXRpb25zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEZlbihzYXZlZEZlbiwge1xuICAgICAgICAgICAgICByZXNldEJyaWxsaWFudFRyYWNraW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRHYW1lU2Vzc2lvbklkICE9PSB0aGlzLmdhbWVTZXNzaW9uSWQpIHtcbiAgICAgICAgICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0QnJpbGxpYW50VHJhY2tpbmcodGhpcy5nYW1lU2Vzc2lvbklkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ1Jlc3RvcmVkIHBvc2l0aW9uIGZyb20gcHJldmlvdXMgc2Vzc2lvbic7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdSZXN0b3JlZCBGRU4gZnJvbSBzdG9yYWdlOicsIHNhdmVkRmVuKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgbG9nZ2VyLndhcm4oJ1NhdmVkIEZFTiBpcyBpbnZhbGlkLCB1c2luZyBkZWZhdWx0OicsIGVycik7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5GRU5fU1RPUkFHRV9LRVkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byByZXN0b3JlIEZFTiBmcm9tIHN0b3JhZ2U6JywgZXJyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBGRU4gZnJvbSBoaXN0b3J5IGJ5IGluZGV4XG4gICAqL1xuICBsb2FkRmVuRnJvbUhpc3RvcnkoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBoaXN0b3J5SnNvbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX0hJU1RPUllfS0VZKTtcbiAgICAgIGlmICghaGlzdG9yeUpzb24pIHJldHVybiBmYWxzZTtcbiAgICAgIFxuICAgICAgY29uc3QgaGlzdG9yeTogc3RyaW5nW10gPSBKU09OLnBhcnNlKGhpc3RvcnlKc29uKTtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gaGlzdG9yeS5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIFxuICAgICAgY29uc3QgZmVuID0gaGlzdG9yeVtpbmRleF07XG4gICAgICByZXR1cm4gdGhpcy5sb2FkRmVuKGZlbik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIEZFTiBmcm9tIGhpc3Rvcnk6JywgZXJyKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IEZFTiBoaXN0b3J5XG4gICAqL1xuICBnZXQgZmVuSGlzdG9yeSgpOiBzdHJpbmdbXSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhpc3RvcnlKc29uID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5GRU5fSElTVE9SWV9LRVkpO1xuICAgICAgcmV0dXJuIGhpc3RvcnlKc29uID8gSlNPTi5wYXJzZShoaXN0b3J5SnNvbikgOiBbXTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBsYXN0IHNhdmVkIEZFTlxuICAgKi9cbiAgZ2V0IGxhc3RTYXZlZEZlbigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuRkVOX1NUT1JBR0VfS0VZKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGUgc2hvd2luZyBtb3ZlIGFycm93c1xuICAgKi9cbiAgdG9nZ2xlTW92ZUFycm93cygpOiB2b2lkIHtcbiAgICAvLyBDbGVhciBhbnkgcGVuZGluZyBhbmFseXNpcyB0aW1lb3V0XG4gICAgaWYgKHRoaXMuX2FuYWx5c2lzVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2FuYWx5c2lzVGltZW91dCk7XG4gICAgICB0aGlzLl9hbmFseXNpc1RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnNob3dNb3ZlQXJyb3dzID0gIXRoaXMuc2hvd01vdmVBcnJvd3M7XG4gICAgaWYgKHRoaXMuc2hvd01vdmVBcnJvd3MgJiYgT2JqZWN0LmtleXModGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzKS5sZW5ndGggPT09IDAgJiYgIXRoaXMuaXNBbmFseXppbmdNb3Zlcykge1xuICAgICAgLy8gQXV0by1hbmFseXplIGlmIGFycm93cyBhcmUgZW5hYmxlZCBhbmQgd2UgZG9uJ3QgaGF2ZSBhbmFseXNpcyB5ZXRcbiAgICAgIHRoaXMuYW5hbHl6ZUFsbE1vdmVzKCkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW0JvYXJkVmlld01vZGVsXSBGYWlsZWQgdG8gYW5hbHl6ZSBtb3ZlczonLCBlcnIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5zaG93TW92ZUFycm93cykge1xuICAgICAgLy8gQ2xlYXIgYW5hbHlzaXMgd2hlbiBhcnJvd3MgYXJlIGRpc2FibGVkIHRvIGZyZWUgbWVtb3J5XG4gICAgICB0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMgPSB7fTtcbiAgICAgIHRoaXMuYW5hbHl6ZWRMZWdhbE1vdmVzRmVuID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBzZXRTaG93TW92ZUFycm93c0VuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLnNob3dNb3ZlQXJyb3dzICE9PSBlbmFibGVkKSB7XG4gICAgICB0aGlzLnRvZ2dsZU1vdmVBcnJvd3MoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoaWNoIHNpZGUncyBtb3ZlcyB0byBzaG93IGFycm93cyBmb3JcbiAgICovXG4gIHNldFNob3dBcnJvd3NGb3JTaWRlKHNpZGU6ICdjdXJyZW50JyB8ICdwbGF5ZXInIHwgJ2VuZ2luZScpOiB2b2lkIHtcbiAgICB0aGlzLnNob3dBcnJvd3NGb3JTaWRlID0gc2lkZTtcbiAgICBsb2dnZXIuZGVidWcoJ1Nob3cgYXJyb3dzIGZvciBzaWRlOicsIHNpZGUpO1xuICAgIC8vIFJlLWFuYWx5emUgaWYgYXJyb3dzIGFyZSBlbmFibGVkXG4gICAgaWYgKHRoaXMuc2hvd01vdmVBcnJvd3MpIHtcbiAgICAgIHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcyA9IHt9O1xuICAgICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPSBudWxsO1xuICAgICAgdGhpcy5hbmFseXplQWxsTW92ZXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5hbHl6ZSBhbGwgbGVnYWwgbW92ZXMgZm9yIHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gICAqL1xuICBhc3luYyBhbmFseXplQWxsTW92ZXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuaXNHYW1lT3ZlciB8fCB0aGlzLmlzQW5hbHl6aW5nTW92ZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPT09IHRoaXMuZmVuICYmIE9iamVjdC5rZXlzKHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcykubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNBbmFseXppbmdNb3ZlcyA9IHRydWU7XG4gICAgICAgIHRoaXMuX2FuYWx5emVkTGVnYWxNb3ZlcyA9IHt9OyAvLyBDbGVhclxuICAgICAgfSk7XG5cbiAgICAgIC8vIEdldCBhbGwgbGVnYWwgbW92ZXNcbiAgICAgIGNvbnN0IGxlZ2FsTW92ZXMgPSB0aGlzLmFsbExlZ2FsTW92ZXM7XG4gICAgICBpZiAobGVnYWxNb3Zlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaXNBbmFseXppbmdNb3ZlcyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBJbml0aWFsaXplIGVuZ2luZSBpZiBuZWVkZWRcbiAgICAgIGlmICghZW5naW5lVmlld01vZGVsLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgYXdhaXQgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gQW5hbHl6ZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICBjb25zdCBhbmFseXNpcyA9IGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24oXG4gICAgICAgIHRoaXMuZmVuLFxuICAgICAgICBjb25maWdWaWV3TW9kZWwuZGVwdGgsXG4gICAgICAgIGNvbmZpZ1ZpZXdNb2RlbC5tdWx0aVBWLFxuICAgICAgICAnYmFja2dyb3VuZCcsXG4gICAgICApO1xuXG4gICAgICBpZiAoYW5hbHlzaXMuaWdub3JlZCB8fCAhY2FuQXBwbHlBbmFseXplZE1vdmUodGhpcy5mZW4sIGFuYWx5c2lzLmFuYWx5emVkRmVuKSkge1xuICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBhIG1hcCBvZiBVQ0kgbW92ZXMgdG8gdGhlaXIgcXVhbGl0eSBidWNrZXRzXG4gICAgICBjb25zdCBtb3ZlTWFwID0gbWFwTGVnYWxNb3Zlc1RvQnVja2V0cyhcbiAgICAgICAgbGVnYWxNb3Zlcy5tYXAobW92ZSA9PiBgJHttb3ZlLmZyb219JHttb3ZlLnRvfSR7bW92ZS5wcm9tb3Rpb24gfHwgJyd9YCksXG4gICAgICAgIGFuYWx5c2lzLm1vdmVzLFxuICAgICAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC51c2VJbXByb3ZlZE1vdmVDbGFzc2lmaWNhdGlvbixcbiAgICAgICk7XG5cbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5fYW5hbHl6ZWRMZWdhbE1vdmVzID0gbW92ZU1hcDtcbiAgICAgICAgdGhpcy5pc0FuYWx5emluZ01vdmVzID0gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5hbmFseXplZExlZ2FsTW92ZXNGZW4gPSB0aGlzLmZlbjtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnQW5hbHl6ZWQnLCBPYmplY3Qua2V5cyhtb3ZlTWFwKS5sZW5ndGgsICdsZWdhbCBtb3ZlcycpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gYW5hbHl6ZSBtb3ZlczonLCBlcnIpO1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLmlzQW5hbHl6aW5nTW92ZXMgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbmFseXplIHRoZSBxdWFsaXR5IG9mIGEgcGxheWVyJ3MgbW92ZVxuICAgKiBUaGlzIHNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaXMgbWFkZSwgYW5hbHl6aW5nIHRoZSBwb3NpdGlvbiBiZWZvcmUgdGhlIG1vdmVcbiAgICovXG4gIGFzeW5jIGFuYWx5emVQbGF5ZXJNb3ZlKG1vdmU6IE1vdmUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBSdW4gYXN5bmNocm9ub3VzbHkgc28gaXQgZG9lc24ndCBibG9jayB0aGUgVUlcbiAgICBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGV4cGVjdGVkQWZ0ZXJGZW4gPSBtb3ZlLmFmdGVyO1xuICAgICAgICAvLyBJbml0aWFsaXplIGVuZ2luZSBpZiBuZWVkZWRcbiAgICAgICAgaWYgKCFlbmdpbmVWaWV3TW9kZWwuaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5pbml0aWFsaXplKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgdGhlIHBvc2l0aW9uIGJlZm9yZSB0aGUgbW92ZSAoZnJvbSBoaXN0b3J5KVxuICAgICAgICBjb25zdCBoaXN0b3J5ID0gdGhpcy5jaGVzcy5oaXN0b3J5KHsgdmVyYm9zZTogdHJ1ZSB9KTtcbiAgICAgICAgaWYgKGhpc3RvcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuOyAvLyBObyBoaXN0b3J5LCBjYW4ndCBhbmFseXplXG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbW92ZSB3ZSBqdXN0IG1hZGUgaXMgdGhlIGxhc3Qgb25lIGluIGhpc3RvcnlcbiAgICAgICAgLy8gV2UgbmVlZCB0byBhbmFseXplIHRoZSBwb3NpdGlvbiBiZWZvcmUgaXRcbiAgICAgICAgLy8gY2hlc3MuanMgaGlzdG9yeSB2ZXJib3NlIGluY2x1ZGVzICdiZWZvcmUnIGFuZCAnYWZ0ZXInIEZFTlxuICAgICAgICBjb25zdCBsYXN0TW92ZUluSGlzdG9yeSA9IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSAxXSBhcyBNb3ZlICYgeyBiZWZvcmU/OiBzdHJpbmcgfTtcbiAgICAgICAgY29uc3QgYmVmb3JlRmVuID0gbGFzdE1vdmVJbkhpc3RvcnkuYmVmb3JlIHx8IHRoaXMuZmVuO1xuXG4gICAgICAgIC8vIEFuYWx5emUgdGhlIHBvc2l0aW9uIGJlZm9yZSB0aGUgbW92ZVxuICAgICAgICBjb25zdCBhbmFseXNpcyA9IGF3YWl0IGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24oXG4gICAgICAgICAgYmVmb3JlRmVuLFxuICAgICAgICAgIE1hdGgubWluKGNvbmZpZ1ZpZXdNb2RlbC5kZXB0aCwgMTUpLCAvLyBVc2Ugc21hbGxlciBkZXB0aCBmb3IgZmFzdGVyIGFuYWx5c2lzXG4gICAgICAgICAgY29uZmlnVmlld01vZGVsLm11bHRpUFYsXG4gICAgICAgICAgJ2JhY2tncm91bmQnLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBhbmFseXNpcy5pZ25vcmVkXG4gICAgICAgICAgfHwgIWNhbkFwcGx5QW5hbHl6ZWRNb3ZlKGJlZm9yZUZlbiwgYW5hbHlzaXMuYW5hbHl6ZWRGZW4pXG4gICAgICAgICAgfHwgdGhpcy5mZW4gIT09IGV4cGVjdGVkQWZ0ZXJGZW5cbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluZCB0aGUgbW92ZSBpbiB0aGUgYW5hbHl6ZWQgbW92ZXNcbiAgICAgICAgY29uc3QgbW92ZVVDSSA9IGAke21vdmUuZnJvbX0ke21vdmUudG99JHttb3ZlLnByb21vdGlvbiB8fCAnJ31gO1xuICAgICAgICBjb25zdCBhbmFseXplZE1vdmUgPSBhbmFseXNpcy5tb3Zlcy5maW5kKG0gPT4gbS5tb3ZlID09PSBtb3ZlVUNJKTtcbiAgICAgICAgaWYgKGFuYWx5emVkTW92ZSkge1xuICAgICAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gYW5hbHl6ZWRNb3ZlLmJ1Y2tldDtcbiAgICAgICAgICAgIGNvbnN0IHF1YWxpdHlMYWJlbCA9IEJVQ0tFVF9MQUJFTFNbYW5hbHl6ZWRNb3ZlLmJ1Y2tldF07XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn0gKCR7cXVhbGl0eUxhYmVsfSlgO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnUGxheWVyIG1vdmUgcXVhbGl0eTonLCBhbmFseXplZE1vdmUuYnVja2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwudXNlSW1wcm92ZWRNb3ZlQ2xhc3NpZmljYXRpb24pIHtcbiAgICAgICAgICAgICAgdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPSAnZmFsbGJhY2snO1xuICAgICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn0gKEZhbGxiYWNrIG1vdmUpYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMubGFzdFBsYXllck1vdmVRdWFsaXR5ID0gJ2dvb2QnO1xuICAgICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgWW91IHBsYXllZDogJHttb3ZlLnNhbn0gKEdvb2QpYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIGFuYWx5emUgcGxheWVyIG1vdmU6JywgZXJyKTtcbiAgICAgICAgLy8gRG9uJ3QgdXBkYXRlIHN0YXR1cyBvbiBlcnJvciwga2VlcCB0aGUgb3JpZ2luYWwgbWVzc2FnZVxuICAgICAgfVxuICAgIH0sIDEwMCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFycm93cyBkYXRhIGZvciByZWFjdC1jaGVzc2JvYXJkXG4gICAqIFJldHVybnMgYXJyYXkgb2YgQXJyb3cgb2JqZWN0cyB3aXRoIHN0YXJ0U3F1YXJlLCBlbmRTcXVhcmUsIGFuZCBjb2xvciBwcm9wZXJ0aWVzXG4gICAqIE9ubHkgc2hvd3MgYXJyb3dzIGZvciBFeGNlbGxlbnQsIEdvb2QsIE1pc3Rha2UsIGFuZCBCbHVuZGVyIG1vdmVzXG4gICAqIExpbWl0ZWQgdG8gbWF4aW11bSAzIGFycm93cyBwZXIgcXVhbGl0eSBidWNrZXRcbiAgICovXG4gIGdldCBtb3ZlQXJyb3dzKCk6IEFycmF5PHsgc3RhcnRTcXVhcmU6IHN0cmluZzsgZW5kU3F1YXJlOiBzdHJpbmc7IGNvbG9yOiBzdHJpbmcgfT4ge1xuICAgIGlmICghdGhpcy5zaG93TW92ZUFycm93cyB8fCBPYmplY3Qua2V5cyh0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIE9ubHkgc2hvdyBhcnJvd3MgZm9yIHRoZXNlIHNwZWNpZmljIG1vdmUgcXVhbGl0aWVzXG4gICAgY29uc3QgYWxsb3dlZEJ1Y2tldHM6IE1vdmVCdWNrZXRbXSA9IFsnZXhjZWxsZW50JywgJ2dvb2QnLCAnbWlzdGFrZScsICdibHVuZGVyJ107XG4gICAgY29uc3QgbWF4QXJyb3dzUGVyQnVja2V0ID0gMztcblxuICAgIGxldCBsZWdhbE1vdmVzID0gdGhpcy5hbGxMZWdhbE1vdmVzO1xuXG4gICAgLy8gRmlsdGVyIG1vdmVzIGJ5IHNpZGUgaWYgbmVlZGVkXG4gICAgaWYgKHRoaXMuc2hvd0Fycm93c0ZvclNpZGUgPT09ICdwbGF5ZXInKSB7XG4gICAgICAvLyBTaG93IG1vdmVzIGZvciB0aGUgc2lkZSB0aGF0IHRoZSBlbmdpbmUgaXMgTk9UIHBsYXlpbmcgZm9yXG4gICAgICBjb25zdCBwbGF5ZXJTaWRlID0gdGhpcy5lbmdpbmVQbGF5c0ZvciA9PT0gJ3cnID8gJ2InIDogJ3cnO1xuICAgICAgbGVnYWxNb3ZlcyA9IGxlZ2FsTW92ZXMuZmlsdGVyKG1vdmUgPT4ge1xuICAgICAgICBjb25zdCBwaWVjZSA9IHRoaXMuZ2V0UGllY2VBdChtb3ZlLmZyb20pO1xuICAgICAgICByZXR1cm4gcGllY2UgJiYgcGllY2UuY29sb3IgPT09IHBsYXllclNpZGU7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hvd0Fycm93c0ZvclNpZGUgPT09ICdlbmdpbmUnKSB7XG4gICAgICAvLyBTaG93IG1vdmVzIGZvciB0aGUgc2lkZSB0aGF0IHRoZSBlbmdpbmUgSVMgcGxheWluZyBmb3JcbiAgICAgIGxlZ2FsTW92ZXMgPSBsZWdhbE1vdmVzLmZpbHRlcihtb3ZlID0+IHtcbiAgICAgICAgY29uc3QgcGllY2UgPSB0aGlzLmdldFBpZWNlQXQobW92ZS5mcm9tKTtcbiAgICAgICAgcmV0dXJuIHBpZWNlICYmIHBpZWNlLmNvbG9yID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIElmICdjdXJyZW50Jywgc2hvdyBhbGwgbGVnYWwgbW92ZXMgKGFscmVhZHkgZmlsdGVyZWQgYnkgY2hlc3MuanMgdG8gY3VycmVudCB0dXJuKVxuXG4gICAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIHZhbGlkYXRlIHNxdWFyZSBmb3JtYXQgKGEtaCwgMS04KVxuICAgIGNvbnN0IGlzVmFsaWRTcXVhcmUgPSAoc3F1YXJlOiB1bmtub3duKTogc3F1YXJlIGlzIFNxdWFyZSA9PiB7XG4gICAgICBpZiAoIXNxdWFyZSB8fCB0eXBlb2Ygc3F1YXJlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuIC9eW2EtaF1bMS04XSQvLnRlc3Qoc3F1YXJlKTtcbiAgICB9O1xuXG4gICAgLy8gR3JvdXAgbW92ZXMgYnkgYnVja2V0XG4gICAgY29uc3QgbW92ZXNCeUJ1Y2tldDogUmVjb3JkPE1vdmVCdWNrZXQsIEFycmF5PHsgc3RhcnRTcXVhcmU6IHN0cmluZzsgZW5kU3F1YXJlOiBzdHJpbmc7IGNvbG9yOiBzdHJpbmcgfT4+ID0ge1xuICAgICAgZXhjZWxsZW50OiBbXSxcbiAgICAgIGdvb2Q6IFtdLFxuICAgICAgbWlzdGFrZTogW10sXG4gICAgICBibHVuZGVyOiBbXSxcbiAgICAgIGJlc3Q6IFtdLCAvLyBOb3QgdXNlZCBidXQgbmVlZGVkIGZvciB0eXBlXG4gICAgICBncmVhdDogW10sIC8vIE5vdCB1c2VkIGJ1dCBuZWVkZWQgZm9yIHR5cGVcbiAgICAgIGluYWNjdXJhY3k6IFtdLCAvLyBOb3QgdXNlZCBidXQgbmVlZGVkIGZvciB0eXBlXG4gICAgfTtcblxuICAgIC8vIENvbGxlY3QgYWxsIHZhbGlkIG1vdmVzIGdyb3VwZWQgYnkgYnVja2V0XG4gICAgZm9yIChjb25zdCBtb3ZlIG9mIGxlZ2FsTW92ZXMpIHtcbiAgICAgIC8vIFZhbGlkYXRlIHRoYXQgbW92ZSBoYXMgdmFsaWQgZnJvbSBhbmQgdG8gc3F1YXJlc1xuICAgICAgaWYgKCFpc1ZhbGlkU3F1YXJlKG1vdmUuZnJvbSkgfHwgIWlzVmFsaWRTcXVhcmUobW92ZS50bykpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdTa2lwcGluZyBpbnZhbGlkIG1vdmU6JywgbW92ZSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB1Y2kgPSBgJHttb3ZlLmZyb219JHttb3ZlLnRvfSR7bW92ZS5wcm9tb3Rpb24gfHwgJyd9YDtcbiAgICAgIGNvbnN0IGJ1Y2tldCA9IHRoaXMuX2FuYWx5emVkTGVnYWxNb3Zlc1t1Y2ldO1xuICAgICAgXG4gICAgICAvLyBPbmx5IGluY2x1ZGUgbW92ZXMgZnJvbSBhbGxvd2VkIGJ1Y2tldHNcbiAgICAgIGlmIChidWNrZXQgJiYgYnVja2V0ICE9PSAnZmFsbGJhY2snICYmIGFsbG93ZWRCdWNrZXRzLmluY2x1ZGVzKGJ1Y2tldCkgJiYgaXNWYWxpZFNxdWFyZShtb3ZlLmZyb20pICYmIGlzVmFsaWRTcXVhcmUobW92ZS50bykpIHtcbiAgICAgICAgbW92ZXNCeUJ1Y2tldFtidWNrZXRdLnB1c2goe1xuICAgICAgICAgIHN0YXJ0U3F1YXJlOiBtb3ZlLmZyb20sXG4gICAgICAgICAgZW5kU3F1YXJlOiBtb3ZlLnRvLFxuICAgICAgICAgIGNvbG9yOiBCVUNLRVRfQ09MT1JTW2J1Y2tldF0sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExpbWl0IHRvIG1heCAzIGFycm93cyBwZXIgYnVja2V0IGFuZCBjb21iaW5lXG4gICAgY29uc3QgYXJyb3dzOiBBcnJheTx7IHN0YXJ0U3F1YXJlOiBzdHJpbmc7IGVuZFNxdWFyZTogc3RyaW5nOyBjb2xvcjogc3RyaW5nIH0+ID0gW107XG4gICAgZm9yIChjb25zdCBidWNrZXQgb2YgYWxsb3dlZEJ1Y2tldHMpIHtcbiAgICAgIGNvbnN0IGJ1Y2tldEFycm93cyA9IG1vdmVzQnlCdWNrZXRbYnVja2V0XS5zbGljZSgwLCBtYXhBcnJvd3NQZXJCdWNrZXQpO1xuICAgICAgYXJyb3dzLnB1c2goLi4uYnVja2V0QXJyb3dzKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgQWRkZWQgJHtidWNrZXRBcnJvd3MubGVuZ3RofSAke2J1Y2tldH0gYXJyb3dzIChmb3VuZCAke21vdmVzQnlCdWNrZXRbYnVja2V0XS5sZW5ndGh9IHRvdGFsKWApO1xuICAgIH1cblxuICAgIGxvZ2dlci5kZWJ1ZygnR2VuZXJhdGVkJywgYXJyb3dzLmxlbmd0aCwgJ3RvdGFsIGFycm93cycpO1xuICAgIHJldHVybiBhcnJvd3M7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFuYWx5emVkIGxlZ2FsIG1vdmVzIGNvdW50IChmb3IgVUkgZGlzcGxheSlcbiAgICovXG4gIGdldCBhbmFseXplZExlZ2FsTW92ZXNDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9hbmFseXplZExlZ2FsTW92ZXMpLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCB0dXJuICh3aGl0ZS9ibGFjaylcbiAgICovXG4gIGdldCB0dXJuKCk6ICd3JyB8ICdiJyB7XG4gICAgcmV0dXJuIHRoaXMuY2hlc3MudHVybigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0dXJuIGFzIHN0cmluZ1xuICAgKi9cbiAgZ2V0IHR1cm5TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy50dXJuID09PSAndycgPyAnV2hpdGUnIDogJ0JsYWNrJztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBnYW1lIGlzIG92ZXJcbiAgICovXG4gIGdldCBpc0dhbWVPdmVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmlzR2FtZU92ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBpdCdzIGNoZWNrbWF0ZVxuICAgKi9cbiAgZ2V0IGlzQ2hlY2ttYXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmlzQ2hlY2ttYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgaXQncyBzdGFsZW1hdGVcbiAgICovXG4gIGdldCBpc1N0YWxlbWF0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5pc1N0YWxlbWF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGl0J3MgYSBkcmF3XG4gICAqL1xuICBnZXQgaXNEcmF3KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmlzRHJhdygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGtpbmcgaXMgaW4gY2hlY2tcbiAgICovXG4gIGdldCBpc0NoZWNrKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLmlzQ2hlY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZ2FtZSBzdGF0dXMgdGV4dFxuICAgKi9cbiAgZ2V0IGdhbWVTdGF0dXMoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5pc0NoZWNrbWF0ZSkge1xuICAgICAgcmV0dXJuIGBDaGVja21hdGUhICR7dGhpcy50dXJuID09PSAndycgPyAnQmxhY2snIDogJ1doaXRlJ30gd2luc2A7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzU3RhbGVtYXRlKSB7XG4gICAgICByZXR1cm4gJ1N0YWxlbWF0ZSEnO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0RyYXcpIHtcbiAgICAgIHJldHVybiAnRHJhdyEnO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0NoZWNrKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy50dXJuU3RyaW5nfSBpcyBpbiBjaGVja2A7XG4gICAgfVxuICAgIHJldHVybiBgJHt0aGlzLnR1cm5TdHJpbmd9IHRvIG1vdmVgO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBsZWdhbCBtb3ZlcyBmb3IgYSBzcXVhcmVcbiAgICovXG4gIGdldExlZ2FsTW92ZXMoc3F1YXJlOiBTcXVhcmUpOiBNb3ZlW10ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLm1vdmVzKHsgc3F1YXJlLCB2ZXJib3NlOiB0cnVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwaWVjZSBhdCBzcXVhcmUgKGZvciBVSSB2aXN1YWwgaW5kaWNhdG9ycylcbiAgICovXG4gIGdldFBpZWNlQXQoc3F1YXJlOiBTcXVhcmUpIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5nZXQoc3F1YXJlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIGxlZ2FsIG1vdmVzXG4gICAqL1xuICBnZXQgYWxsTGVnYWxNb3ZlcygpOiBNb3ZlW10ge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLm1vdmVzKHsgdmVyYm9zZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgbW92ZSBjb3VudFxuICAgKi9cbiAgZ2V0IG1vdmVDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmNoZXNzLm1vdmVOdW1iZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbmRvIGEgc2luZ2xlIG1vdmUgKGZvciB0aGUgbmV3IHVuZG8gYnV0dG9uKVxuICAgKi9cbiAgdW5kb1NpbmdsZSgpOiBib29sZWFuIHtcbiAgICBsb2dnZXIuZGVidWcoJ3VuZG9TaW5nbGUgY2FsbGVkLCBoaXN0b3J5IGxlbmd0aDonLCB0aGlzLmhpc3RvcnkubGVuZ3RoKTtcbiAgICBcbiAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBcbiAgICBjb25zdCBtb3ZlID0gdGhpcy5jaGVzcy51bmRvKCk7XG4gICAgaWYgKG1vdmUpIHtcbiAgICAgIC8vIEFkZCB0byByZWRvIHN0YWNrXG4gICAgICB0aGlzLnJlZG9TdGFjay5wdXNoKG1vdmUpO1xuICAgICAgY29uc3QgYW5ub3RhdGlvbiA9IHRoaXMuaGlzdG9yeUFubm90YXRpb25zLnBvcCgpO1xuICAgICAgaWYgKGFubm90YXRpb24pIHtcbiAgICAgICAgdGhpcy5yZWRvQW5ub3RhdGlvbnMucHVzaChhbm5vdGF0aW9uKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk7XG4gICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICBcbiAgICAgIC8vIFVwZGF0ZSBsYXN0TW92ZSBpZiB0aGVyZSBhcmUgc3RpbGwgbW92ZXMgaW4gaGlzdG9yeVxuICAgICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGxhc3RNb3ZlSW5IaXN0b3J5ID0gdGhpcy5oaXN0b3J5W3RoaXMuaGlzdG9yeS5sZW5ndGggLSAxXTtcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IHsgZnJvbTogbGFzdE1vdmVJbkhpc3RvcnkuZnJvbSBhcyBTcXVhcmUsIHRvOiBsYXN0TW92ZUluSGlzdG9yeS50byBhcyBTcXVhcmUgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSBudWxsO1xuICAgICAgfVxuICAgICAgXG4gICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0gJ1VuZGlkIDEgbW92ZSc7XG4gICAgICBlbmdpbmVWaWV3TW9kZWwucmVzZXQoKTtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnVW5kaWQgMSBtb3ZlLCByZWRvIHN0YWNrIHNpemU6JywgdGhpcy5yZWRvU3RhY2subGVuZ3RoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmVkbyBhIHNpbmdsZSBtb3ZlXG4gICAqL1xuICByZWRvU2luZ2xlKCk6IGJvb2xlYW4ge1xuICAgIGxvZ2dlci5kZWJ1ZygncmVkb1NpbmdsZSBjYWxsZWQsIHJlZG8gc3RhY2sgc2l6ZTonLCB0aGlzLnJlZG9TdGFjay5sZW5ndGgpO1xuICAgIFxuICAgIGlmICh0aGlzLnJlZG9TdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgY29uc3QgbW92ZVRvUmVkbyA9IHRoaXMucmVkb1N0YWNrLnBvcCgpO1xuICAgIGlmICghbW92ZVRvUmVkbykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBhbm5vdGF0aW9uVG9SZWRvID0gdGhpcy5yZWRvQW5ub3RhdGlvbnMucG9wKCk7XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLm1vdmUoe1xuICAgICAgICBmcm9tOiBtb3ZlVG9SZWRvLmZyb20gYXMgU3F1YXJlLFxuICAgICAgICB0bzogbW92ZVRvUmVkby50byBhcyBTcXVhcmUsXG4gICAgICAgIHByb21vdGlvbjogbW92ZVRvUmVkby5wcm9tb3Rpb24sXG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgaWYgKG1vdmUpIHtcbiAgICAgICAgdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMucHVzaChcbiAgICAgICAgICBhbm5vdGF0aW9uVG9SZWRvID8/IHRoaXMuY3JlYXRlTW92ZUFubm90YXRpb24obW92ZSwgZmFsc2UpLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLnN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XG4gICAgICAgIHRoaXMubGFzdE1vdmUgPSB7IGZyb206IG1vdmUuZnJvbSBhcyBTcXVhcmUsIHRvOiBtb3ZlLnRvIGFzIFNxdWFyZSB9O1xuICAgICAgICB0aGlzLmxhc3RQbGF5ZWRCdWNrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UgPSBgUmVkaWQ6ICR7bW92ZS5zYW59YDtcbiAgICAgICAgZW5naW5lVmlld01vZGVsLnJlc2V0KCk7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnUmVkaWQgMSBtb3ZlJyk7XG4gICAgICAgIFxuICAgICAgICAvLyBJZiBhdXRvLXBsYXkgaXMgZW5hYmxlZCBhbmQgaXQncyBub3cgdGhlIGVuZ2luZSdzIHR1cm4sIHRyaWdnZXIgYXV0by1wbGF5XG4gICAgICAgIGlmICh0aGlzLmF1dG9QbGF5RW5hYmxlZCAmJiAhdGhpcy5pc0dhbWVPdmVyICYmIHRoaXMuY2hlc3MudHVybigpID09PSB0aGlzLmVuZ2luZVBsYXlzRm9yKSB7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCdTY2hlZHVsaW5nIGF1dG8tcGxheSBhZnRlciByZWRvJyk7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNvbHZlTmV4dE1vdmUodHJ1ZSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdBdXRvLXBsYXkgZXJyb3IgYWZ0ZXIgcmVkbzonLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ1JlZG8gZmFpbGVkOicsIGVycik7XG4gICAgICAvLyBQdXQgdGhlIG1vdmUgYmFjayBvbiB0aGUgc3RhY2sgaWYgaXQgZmFpbGVkXG4gICAgICB0aGlzLnJlZG9TdGFjay5wdXNoKG1vdmVUb1JlZG8pO1xuICAgICAgaWYgKGFubm90YXRpb25Ub1JlZG8pIHtcbiAgICAgICAgdGhpcy5yZWRvQW5ub3RhdGlvbnMucHVzaChhbm5vdGF0aW9uVG9SZWRvKTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHVuZG8gaXMgYXZhaWxhYmxlXG4gICAqL1xuICBnZXQgY2FuVW5kbygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5Lmxlbmd0aCA+IDA7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgcmVkbyBpcyBhdmFpbGFibGVcbiAgICovXG4gIGdldCBjYW5SZWRvKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlZG9TdGFjay5sZW5ndGggPiAwO1xuICB9XG5cbiAgZ2V0IG1vdmVIaXN0b3J5Um93cygpOiBBcnJheTx7IG1vdmVOdW1iZXI6IG51bWJlcjsgd2hpdGU6IE1vdmUgfCBudWxsOyBibGFjazogTW92ZSB8IG51bGwgfT4ge1xuICAgIGNvbnN0IHJvd3M6IEFycmF5PHsgbW92ZU51bWJlcjogbnVtYmVyOyB3aGl0ZTogTW92ZSB8IG51bGw7IGJsYWNrOiBNb3ZlIHwgbnVsbCB9PiA9IFtdO1xuXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuaGlzdG9yeS5sZW5ndGg7IGluZGV4ICs9IDIpIHtcbiAgICAgIGNvbnN0IHdoaXRlTW92ZSA9IHRoaXMuaGlzdG9yeVtpbmRleF0gPz8gbnVsbDtcbiAgICAgIGNvbnN0IGJsYWNrTW92ZSA9IHRoaXMuaGlzdG9yeVtpbmRleCArIDFdID8/IG51bGw7XG4gICAgICBjb25zdCBtb3ZlTnVtYmVyID0gd2hpdGVNb3ZlPy5tb3ZlTnVtYmVyID8/IGJsYWNrTW92ZT8ubW92ZU51bWJlciA/PyByb3dzLmxlbmd0aCArIDE7XG4gICAgICByb3dzLnB1c2goe1xuICAgICAgICBtb3ZlTnVtYmVyLFxuICAgICAgICB3aGl0ZTogd2hpdGVNb3ZlLFxuICAgICAgICBibGFjazogYmxhY2tNb3ZlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3M7XG4gIH1cblxuICBnZXQgZGVidWdTZXNzaW9uSWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nYW1lU2Vzc2lvbklkO1xuICB9XG5cbiAgZ2V0IGhhc1NraXBwZWRFbmdpbmVNb3ZlTm90aWNlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxhc3RTa2lwcGVkRW5naW5lTW92ZU1lc3NhZ2UgIT09IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3J0IGN1cnJlbnQgZ2FtZSBhcyBQR05cbiAgICovXG4gIGdldCBwZ24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5jaGVzcy5wZ24oKTtcbiAgfVxuXG4gIGdldCBsYXN0UGxheWVyTW92ZVF1YWxpdHlMYWJlbCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPyBESVNQTEFZX0JVQ0tFVF9MQUJFTFNbdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHldIDogbnVsbDtcbiAgfVxuXG4gIGdldCBsYXN0UGxheWVyTW92ZVF1YWxpdHlDb2xvcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHkgPyBESVNQTEFZX0JVQ0tFVF9DT0xPUlNbdGhpcy5sYXN0UGxheWVyTW92ZVF1YWxpdHldIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgd2FpdChkZWxheU1zOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KHJlc29sdmUsIGRlbGF5TXMpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBiZWdpblNlc3Npb25TdGF0ZShvcHRpb25zOiB7XG4gICAgZ2FtZVNlc3Npb25JZDogc3RyaW5nO1xuICAgIGdhbWVTdGFydEZlbjogc3RyaW5nO1xuICAgIHJlc2V0QnJpbGxpYW50VHJhY2tpbmc6IGJvb2xlYW47XG4gICAgaGlzdG9yeUFubm90YXRpb25zPzogTW92ZUFubm90YXRpb25bXTtcbiAgICByZWRvQW5ub3RhdGlvbnM/OiBNb3ZlQW5ub3RhdGlvbltdO1xuICB9KTogdm9pZCB7XG4gICAgdGhpcy5nYW1lU2Vzc2lvbklkID0gb3B0aW9ucy5nYW1lU2Vzc2lvbklkO1xuICAgIHRoaXMuZ2FtZVN0YXJ0RmVuID0gb3B0aW9ucy5nYW1lU3RhcnRGZW47XG4gICAgdGhpcy5oaXN0b3J5QW5ub3RhdGlvbnMgPSBbLi4uKG9wdGlvbnMuaGlzdG9yeUFubm90YXRpb25zID8/IFtdKV07XG4gICAgdGhpcy5yZWRvQW5ub3RhdGlvbnMgPSBbLi4uKG9wdGlvbnMucmVkb0Fubm90YXRpb25zID8/IFtdKV07XG4gICAgdGhpcy5yZWRvU3RhY2sgPSB0aGlzLmNyZWF0ZVJlZG9TdGFja0Zyb21Bbm5vdGF0aW9ucyh0aGlzLnJlZG9Bbm5vdGF0aW9ucyk7XG4gICAgaWYgKG9wdGlvbnMucmVzZXRCcmlsbGlhbnRUcmFja2luZykge1xuICAgICAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRCcmlsbGlhbnRUcmFja2luZyh0aGlzLmdhbWVTZXNzaW9uSWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJSZWRvU3RhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5yZWRvU3RhY2sgPSBbXTtcbiAgICB0aGlzLnJlZG9Bbm5vdGF0aW9ucyA9IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVNb3ZlQW5ub3RhdGlvbihcbiAgICBtb3ZlOiBNb3ZlICYgeyBiZWZvcmU/OiBzdHJpbmc7IGFmdGVyPzogc3RyaW5nIH0sXG4gICAgY29uc3VtZWRCcmlsbGlhbnQ6IGJvb2xlYW4sXG4gICk6IE1vdmVBbm5vdGF0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgYmVmb3JlRmVuOiBtb3ZlLmJlZm9yZSA/PyB0aGlzLmZlbixcbiAgICAgIGFmdGVyRmVuOiBtb3ZlLmFmdGVyID8/IHRoaXMuY2hlc3MuZmVuKCksXG4gICAgICB1Y2k6IGAke21vdmUuZnJvbX0ke21vdmUudG99JHttb3ZlLnByb21vdGlvbiB8fCAnJ31gLFxuICAgICAgbW92ZU51bWJlcjogdGhpcy5jaGVzcy5tb3ZlTnVtYmVyKCksXG4gICAgICBjb25zdW1lZEJyaWxsaWFudCxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSByZWNvcmRNb3ZlQW5ub3RhdGlvbihcbiAgICBtb3ZlOiBNb3ZlICYgeyBiZWZvcmU/OiBzdHJpbmc7IGFmdGVyPzogc3RyaW5nIH0sXG4gICAgY29uc3VtZWRCcmlsbGlhbnQ6IGJvb2xlYW4sXG4gICk6IHZvaWQge1xuICAgIHRoaXMuaGlzdG9yeUFubm90YXRpb25zLnB1c2godGhpcy5jcmVhdGVNb3ZlQW5ub3RhdGlvbihtb3ZlLCBjb25zdW1lZEJyaWxsaWFudCkpO1xuICAgIHRoaXMuc3luY0JyaWxsaWFudFRyYWNraW5nRnJvbUFubm90YXRpb25zKCk7XG4gIH1cblxuICBwcml2YXRlIHN5bmNCcmlsbGlhbnRUcmFja2luZ0Zyb21Bbm5vdGF0aW9ucygpOiB2b2lkIHtcbiAgICBjb25zdCB1c2FnZSA9IGRlcml2ZUJyaWxsaWFudFVzYWdlKHRoaXMuaGlzdG9yeUFubm90YXRpb25zKTtcbiAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZWNvbmNpbGVCcmlsbGlhbnRUcmFja2luZyhcbiAgICAgIHRoaXMuZ2FtZVNlc3Npb25JZCxcbiAgICAgIHVzYWdlLmJyaWxsaWFudE1vdmVOdW1iZXJzLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHVuZG9Nb3Zlcyhjb3VudDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdW5kb25lTW92ZXM6IE1vdmVbXSA9IFtdO1xuICAgIGNvbnN0IHVuZG9uZUFubm90YXRpb25zOiBNb3ZlQW5ub3RhdGlvbltdID0gW107XG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY291bnQ7IGluZGV4ICs9IDEpIHtcbiAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLnVuZG8oKTtcbiAgICAgIGlmICghbW92ZSkge1xuICAgICAgICBmb3IgKGxldCByZXN0b3JlSW5kZXggPSB1bmRvbmVNb3Zlcy5sZW5ndGggLSAxOyByZXN0b3JlSW5kZXggPj0gMDsgcmVzdG9yZUluZGV4IC09IDEpIHtcbiAgICAgICAgICBjb25zdCByZXN0b3JlTW92ZSA9IHVuZG9uZU1vdmVzW3Jlc3RvcmVJbmRleF07XG4gICAgICAgICAgdGhpcy5jaGVzcy5tb3ZlKHtcbiAgICAgICAgICAgIGZyb206IHJlc3RvcmVNb3ZlLmZyb20gYXMgU3F1YXJlLFxuICAgICAgICAgICAgdG86IHJlc3RvcmVNb3ZlLnRvIGFzIFNxdWFyZSxcbiAgICAgICAgICAgIHByb21vdGlvbjogcmVzdG9yZU1vdmUucHJvbW90aW9uLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdW5kb25lTW92ZXMucHVzaChtb3ZlKTtcbiAgICAgIGNvbnN0IGFubm90YXRpb24gPSB0aGlzLmhpc3RvcnlBbm5vdGF0aW9ucy5wb3AoKTtcbiAgICAgIGlmIChhbm5vdGF0aW9uKSB7XG4gICAgICAgIHVuZG9uZUFubm90YXRpb25zLnB1c2goYW5ub3RhdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZWRvU3RhY2sucHVzaCguLi51bmRvbmVNb3Zlcyk7XG4gICAgdGhpcy5yZWRvQW5ub3RhdGlvbnMucHVzaCguLi51bmRvbmVBbm5vdGF0aW9ucyk7XG4gICAgdGhpcy5zeW5jQnJpbGxpYW50VHJhY2tpbmdGcm9tQW5ub3RhdGlvbnMoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVhZFBlcnNpc3RlZEJvYXJkU3RhdGUoKTogUGVyc2lzdGVkQm9hcmRTdGF0ZSB8IG51bGwge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWZlYXR1cmVPcHRpb25zVmlld01vZGVsLnBlcnNpc3RFbmdpbmVDb25maWcpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5CT0FSRF9TVEFURV9TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHNhdmVkKSBhcyBQYXJ0aWFsPFBlcnNpc3RlZEJvYXJkU3RhdGU+O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVudEZlbjogcGFyc2VkLmN1cnJlbnRGZW4gPz8gJycsXG4gICAgICAgIGZlbkhpc3Rvcnk6IEFycmF5LmlzQXJyYXkocGFyc2VkLmZlbkhpc3RvcnkpID8gcGFyc2VkLmZlbkhpc3RvcnkgOiBbXSxcbiAgICAgICAgZ2FtZVNlc3Npb25JZDogcGFyc2VkLmdhbWVTZXNzaW9uSWQgPz8gY3JlYXRlR2FtZVNlc3Npb25JZCgpLFxuICAgICAgICBnYW1lU3RhcnRGZW46IHBhcnNlZC5nYW1lU3RhcnRGZW4gPz8gcGFyc2VkLmN1cnJlbnRGZW4gPz8gbmV3IENoZXNzKCkuZmVuKCksXG4gICAgICAgIGhpc3RvcnlBbm5vdGF0aW9uczogQXJyYXkuaXNBcnJheShwYXJzZWQuaGlzdG9yeUFubm90YXRpb25zKSA/IHBhcnNlZC5oaXN0b3J5QW5ub3RhdGlvbnMgOiBbXSxcbiAgICAgICAgcmVkb0Fubm90YXRpb25zOiBBcnJheS5pc0FycmF5KHBhcnNlZC5yZWRvQW5ub3RhdGlvbnMpID8gcGFyc2VkLnJlZG9Bbm5vdGF0aW9ucyA6IFtdLFxuICAgICAgfTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2xlYXJQZXJzaXN0ZWRCb2FyZFN0YXRlKCk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLkJPQVJEX1NUQVRFX1NUT1JBR0VfS0VZKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gY2xlYXIgYm9hcmQgc3RhdGUgc3RvcmFnZTonLCBlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVSZWRvU3RhY2tGcm9tQW5ub3RhdGlvbnMoYW5ub3RhdGlvbnM6IE1vdmVBbm5vdGF0aW9uW10pOiBNb3ZlW10ge1xuICAgIHJldHVybiBhbm5vdGF0aW9ucy5tYXAoKGFubm90YXRpb24pID0+ICh7XG4gICAgICBmcm9tOiBhbm5vdGF0aW9uLnVjaS5zbGljZSgwLCAyKSxcbiAgICAgIHRvOiBhbm5vdGF0aW9uLnVjaS5zbGljZSgyLCA0KSxcbiAgICAgIHByb21vdGlvbjogYW5ub3RhdGlvbi51Y2kubGVuZ3RoID4gNCA/IGFubm90YXRpb24udWNpWzRdIDogdW5kZWZpbmVkLFxuICAgIH0pKSBhcyBNb3ZlW107XG4gIH1cbn1cblxuLy8gU2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgYm9hcmRWaWV3TW9kZWwgPSBuZXcgQm9hcmRWaWV3TW9kZWwoKTtcbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgaXNEZWJ1Z0xvZ2dpbmdFbmFibGVkLFxuICBpc0RldmVsb3BtZW50QnVpbGQsXG4gIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQsXG59IGZyb20gJy4uL3NoYXJlZC9kZWJ1Zyc7XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z1ZpZXdNb2RlbCB7XG4gIGRlYnVnTG9nZ2luZ0VuYWJsZWQgPSBpc0RlYnVnTG9nZ2luZ0VuYWJsZWQoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBtYWtlQXV0b09ic2VydmFibGUodGhpcywge1xuICAgICAgc2V0RGVidWdMb2dnaW5nRW5hYmxlZDogYWN0aW9uLFxuICAgICAgdG9nZ2xlRGVidWdMb2dnaW5nOiBhY3Rpb24sXG4gICAgfSk7XG4gIH1cblxuICBzZXREZWJ1Z0xvZ2dpbmdFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRlYnVnTG9nZ2luZ0VuYWJsZWQgPSBlbmFibGVkO1xuICAgIHNldERlYnVnTG9nZ2luZ0VuYWJsZWQoZW5hYmxlZCk7XG4gIH1cblxuICB0b2dnbGVEZWJ1Z0xvZ2dpbmcoKTogdm9pZCB7XG4gICAgdGhpcy5zZXREZWJ1Z0xvZ2dpbmdFbmFibGVkKCF0aGlzLmRlYnVnTG9nZ2luZ0VuYWJsZWQpO1xuICB9XG5cbiAgZ2V0IGlzRGV2ZWxvcG1lbnQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRGV2ZWxvcG1lbnRCdWlsZCgpO1xuICB9XG5cbiAgZ2V0IHNob3dEZWJ1Z0NvbnRyb2xzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzRGV2ZWxvcG1lbnQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGRlYnVnVmlld01vZGVsID0gbmV3IERlYnVnVmlld01vZGVsKCk7XG5cbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHsgTW92ZVF1YWxpdHlQcmVzZXRJZCB9IGZyb20gJy4uL2VuZ2luZS90eXBlcyc7XG5cbnR5cGUgU2V0dGluZ3NUYWJJZCA9XG4gIHwgJ2dlbmVyYWwnXG4gIHwgJ2VuZ2luZSdcbiAgfCAncGVyc29uYWxpdHknXG4gIHwgJ2JyaWxsaWFudCdcbiAgfCAnYWR2YW5jZWQnXG4gIHwgJ2RlYnVnJ1xuICB8ICdhYm91dCc7XG5cbnR5cGUgQW5pbWF0aW9uU3BlZWQgPSAnc2xvdycgfCAnbm9ybWFsJyB8ICdmYXN0JztcbnR5cGUgVGhlbWVNb2RlID0gJ2RhcmsnIHwgJ2xpZ2h0JyB8ICdtaW5pbWFsJyB8ICdwZXJzb25hJztcbnR5cGUgQm9hcmRTaXplUHJlc2V0ID0gJ3NtYWxsJyB8ICdtZWRpdW0nIHwgJ2xhcmdlJyB8ICd4bGFyZ2UnO1xuXG5jb25zdCBCT0FSRF9TSVpFX1BSRVNFVF9QSVhFTFM6IFJlY29yZDxCb2FyZFNpemVQcmVzZXQsIG51bWJlcj4gPSB7XG4gIHNtYWxsOiA0ODAsXG4gIG1lZGl1bTogNjQwLFxuICBsYXJnZTogODAwLFxuICB4bGFyZ2U6IDk2MCxcbn07XG5cbmludGVyZmFjZSBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzIHtcbiAgYmFzaWNNb2RlOiBib29sZWFuO1xuICBhbmltYXRpb25TcGVlZDogQW5pbWF0aW9uU3BlZWQ7XG4gIHNvdW5kRW5hYmxlZDogYm9vbGVhbjtcbiAgdGhlbWVNb2RlOiBUaGVtZU1vZGU7XG4gIGJvYXJkU2l6ZVByZXNldDogQm9hcmRTaXplUHJlc2V0O1xuICBzZWxlY3RlZFNldHRpbmdzVGFiOiBTZXR0aW5nc1RhYklkO1xufVxuXG5jb25zdCBVSV9QUkVGRVJFTkNFU19TVE9SQUdFX0tFWSA9ICdwZXJzb25hY2hlc3NfdWlfcHJlZmVyZW5jZXMnO1xuXG5jb25zdCBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTOiBQZXJzaXN0ZWRVaVByZWZlcmVuY2VzID0ge1xuICBiYXNpY01vZGU6IHRydWUsXG4gIGFuaW1hdGlvblNwZWVkOiAnbm9ybWFsJyxcbiAgc291bmRFbmFibGVkOiBmYWxzZSxcbiAgdGhlbWVNb2RlOiAnZGFyaycsXG4gIGJvYXJkU2l6ZVByZXNldDogJ21lZGl1bScsXG4gIHNlbGVjdGVkU2V0dGluZ3NUYWI6ICdnZW5lcmFsJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBVaVN0YXRlVmlld01vZGVsIHtcbiAgc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gIGxvYWRGZW5PcGVuID0gZmFsc2U7XG4gIGxvYWRQZ25PcGVuID0gZmFsc2U7XG4gIGJhc2ljTW9kZSA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYmFzaWNNb2RlO1xuICBhbmltYXRpb25TcGVlZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuYW5pbWF0aW9uU3BlZWQ7XG4gIHNvdW5kRW5hYmxlZCA9IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc291bmRFbmFibGVkO1xuICB0aGVtZU1vZGUgPSBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnRoZW1lTW9kZTtcbiAgYm9hcmRTaXplUHJlc2V0ID0gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5ib2FyZFNpemVQcmVzZXQ7XG4gIHNlbGVjdGVkU2V0dGluZ3NUYWI6IFNldHRpbmdzVGFiSWQgPSBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnNlbGVjdGVkU2V0dGluZ3NUYWI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldFNldHRpbmdzT3BlbjogYWN0aW9uLFxuICAgICAgc2V0TG9hZEZlbk9wZW46IGFjdGlvbixcbiAgICAgIHNldExvYWRQZ25PcGVuOiBhY3Rpb24sXG4gICAgICBhcHBseVByb2ZpbGVQcmVmZXJlbmNlczogYWN0aW9uLFxuICAgICAgc2V0QmFzaWNNb2RlOiBhY3Rpb24sXG4gICAgICBzZXRBbmltYXRpb25TcGVlZDogYWN0aW9uLFxuICAgICAgc2V0U291bmRFbmFibGVkOiBhY3Rpb24sXG4gICAgICBzZXRUaGVtZU1vZGU6IGFjdGlvbixcbiAgICAgIHNldEJvYXJkU2l6ZVByZXNldDogYWN0aW9uLFxuICAgICAgc2V0U2VsZWN0ZWRTZXR0aW5nc1RhYjogYWN0aW9uLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZXN0b3JlRnJvbVN0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldFNldHRpbmdzT3BlbihvcGVuOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zZXR0aW5nc09wZW4gPSBvcGVuO1xuICB9XG5cbiAgc2V0TG9hZEZlbk9wZW4ob3BlbjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMubG9hZEZlbk9wZW4gPSBvcGVuO1xuICB9XG5cbiAgc2V0TG9hZFBnbk9wZW4ob3BlbjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMubG9hZFBnbk9wZW4gPSBvcGVuO1xuICB9XG5cbiAgYXBwbHlQcm9maWxlUHJlZmVyZW5jZXMocHJlZmVyZW5jZXM6IFBhcnRpYWw8UGljazxQZXJzaXN0ZWRVaVByZWZlcmVuY2VzLCAnYmFzaWNNb2RlJyB8ICd0aGVtZU1vZGUnPj4pOiB2b2lkIHtcbiAgICB0aGlzLmJhc2ljTW9kZSA9IHByZWZlcmVuY2VzLmJhc2ljTW9kZSA/PyB0aGlzLmJhc2ljTW9kZTtcbiAgICB0aGlzLnRoZW1lTW9kZSA9IHByZWZlcmVuY2VzLnRoZW1lTW9kZSA/PyB0aGlzLnRoZW1lTW9kZTtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldEJhc2ljTW9kZShlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5iYXNpY01vZGUgPSBlbmFibGVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0QW5pbWF0aW9uU3BlZWQoc3BlZWQ6IEFuaW1hdGlvblNwZWVkKTogdm9pZCB7XG4gICAgdGhpcy5hbmltYXRpb25TcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U291bmRFbmFibGVkKGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNvdW5kRW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRUaGVtZU1vZGUodGhlbWVNb2RlOiBUaGVtZU1vZGUpOiB2b2lkIHtcbiAgICB0aGlzLnRoZW1lTW9kZSA9IHRoZW1lTW9kZTtcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgfVxuXG4gIHNldEJvYXJkU2l6ZVByZXNldChib2FyZFNpemVQcmVzZXQ6IEJvYXJkU2l6ZVByZXNldCk6IHZvaWQge1xuICAgIHRoaXMuYm9hcmRTaXplUHJlc2V0ID0gYm9hcmRTaXplUHJlc2V0O1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWRTZXR0aW5nc1RhYih0YWI6IFNldHRpbmdzVGFiSWQpOiB2b2lkIHtcbiAgICB0aGlzLnNlbGVjdGVkU2V0dGluZ3NUYWIgPSB0YWI7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gIH1cblxuICBwcml2YXRlIHJlc3RvcmVGcm9tU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2F2ZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShVSV9QUkVGRVJFTkNFU19TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZCkgYXMgUGFydGlhbDxQZXJzaXN0ZWRVaVByZWZlcmVuY2VzPjtcbiAgICAgIHRoaXMuYmFzaWNNb2RlID0gcGFyc2VkLmJhc2ljTW9kZSA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmJhc2ljTW9kZTtcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3BlZWQgPSBwYXJzZWQuYW5pbWF0aW9uU3BlZWQgPz8gREVGQVVMVF9VSV9QUkVGRVJFTkNFUy5hbmltYXRpb25TcGVlZDtcbiAgICAgIHRoaXMuc291bmRFbmFibGVkID0gcGFyc2VkLnNvdW5kRW5hYmxlZCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnNvdW5kRW5hYmxlZDtcbiAgICAgIHRoaXMudGhlbWVNb2RlID0gcGFyc2VkLnRoZW1lTW9kZSA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLnRoZW1lTW9kZTtcbiAgICAgIHRoaXMuYm9hcmRTaXplUHJlc2V0ID0gcGFyc2VkLmJvYXJkU2l6ZVByZXNldCA/PyBERUZBVUxUX1VJX1BSRUZFUkVOQ0VTLmJvYXJkU2l6ZVByZXNldDtcbiAgICAgIHRoaXMuc2VsZWN0ZWRTZXR0aW5nc1RhYiA9IHBhcnNlZC5zZWxlY3RlZFNldHRpbmdzVGFiID8/IERFRkFVTFRfVUlfUFJFRkVSRU5DRVMuc2VsZWN0ZWRTZXR0aW5nc1RhYjtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBpbnZhbGlkIFVJIHByZWZlcmVuY2Ugc25hcHNob3RzLlxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGVyc2lzdFRvU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgIFVJX1BSRUZFUkVOQ0VTX1NUT1JBR0VfS0VZLFxuICAgICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgYmFzaWNNb2RlOiB0aGlzLmJhc2ljTW9kZSxcbiAgICAgICAgICBhbmltYXRpb25TcGVlZDogdGhpcy5hbmltYXRpb25TcGVlZCxcbiAgICAgICAgICBzb3VuZEVuYWJsZWQ6IHRoaXMuc291bmRFbmFibGVkLFxuICAgICAgICAgIHRoZW1lTW9kZTogdGhpcy50aGVtZU1vZGUsXG4gICAgICAgICAgYm9hcmRTaXplUHJlc2V0OiB0aGlzLmJvYXJkU2l6ZVByZXNldCxcbiAgICAgICAgICBzZWxlY3RlZFNldHRpbmdzVGFiOiB0aGlzLnNlbGVjdGVkU2V0dGluZ3NUYWIsXG4gICAgICAgIH0gYXMgUGVyc2lzdGVkVWlQcmVmZXJlbmNlcyksXG4gICAgICApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGxvY2FsU3RvcmFnZSBpc3N1ZXMgYW5kIGtlZXAgVUkgcmVzcG9uc2l2ZS5cbiAgICB9XG4gIH1cblxuICBnZXQgYm9hcmRTaXplUHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gQk9BUkRfU0laRV9QUkVTRVRfUElYRUxTW3RoaXMuYm9hcmRTaXplUHJlc2V0XTtcbiAgfVxuXG4gIGdldFBlcnNvbmFBY2NlbnRUb25lKHBlcnNvbmFJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGwpOiAncmVkJyB8ICdnb2xkJyB8ICdibHVlJyB8ICdncmVlbicge1xuICAgIHN3aXRjaCAocGVyc29uYUlkKSB7XG4gICAgICBjYXNlICdhZ2dyZXNzaXZlJzpcbiAgICAgICAgcmV0dXJuICdyZWQnO1xuICAgICAgY2FzZSAnaGFyZCc6XG4gICAgICBjYXNlICdzdXBlcl9oYXJkJzpcbiAgICAgICAgcmV0dXJuICdnb2xkJztcbiAgICAgIGNhc2UgJ2xvdyc6XG4gICAgICAgIHJldHVybiAnZ3JlZW4nO1xuICAgICAgY2FzZSAnbWVkaXVtJzpcbiAgICAgIGNhc2UgbnVsbDpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnYmx1ZSc7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCB1aVN0YXRlVmlld01vZGVsID0gbmV3IFVpU3RhdGVWaWV3TW9kZWwoKTtcblxuZXhwb3J0IHsgQk9BUkRfU0laRV9QUkVTRVRfUElYRUxTIH07XG5leHBvcnQgdHlwZSB7IEFuaW1hdGlvblNwZWVkLCBCb2FyZFNpemVQcmVzZXQsIFNldHRpbmdzVGFiSWQsIFRoZW1lTW9kZSB9O1xuIiwgImltcG9ydCB7XG4gIEJyaWxsaWFudEFsbG93ZWRQaGFzZSxcbiAgQnJpbGxpYW50TW92ZXNQZXJHYW1lLFxuICBGZWF0dXJlT3B0aW9ucyxcbiAgbWVyZ2VGZWF0dXJlT3B0aW9ucyxcbn0gZnJvbSAnLi9mZWF0dXJlT3B0aW9ucyc7XG5pbXBvcnQge1xuICBCdWNrZXRDb25maWcsXG4gIERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgTW92ZVF1YWxpdHlQcmVzZXRJZCxcbiAgTU9WRV9RVUFMSVRZX1BSRVNFVFMsXG59IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgdHlwZSBQZXJzb25hUHJvZmlsZVRoZW1lTW9kZSA9ICdkYXJrJyB8ICdsaWdodCcgfCAnbWluaW1hbCcgfCAncGVyc29uYSc7XG5cbmV4cG9ydCBjb25zdCBQRVJTT05BX1BST0ZJTEVfS0lORCA9ICdwZXJzb25hY2hlc3MucGVyc29uYS1wcm9maWxlJztcbmV4cG9ydCBjb25zdCBQRVJTT05BX1BST0ZJTEVfVkVSU0lPTiA9IDE7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90IHtcbiAgYnVja2V0Q29uZmlnOiBCdWNrZXRDb25maWc7XG4gIGN1cnJlbnRQcmVzZXRJZDogTW92ZVF1YWxpdHlQcmVzZXRJZCB8IG51bGw7XG4gIGRlcHRoOiBudW1iZXI7XG4gIG11bHRpUFY6IG51bWJlcjtcbiAgZmVhdHVyZU9wdGlvbnM6IEZlYXR1cmVPcHRpb25zO1xuICBicmlsbGlhbnQ6IHtcbiAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IEJyaWxsaWFudE1vdmVzUGVyR2FtZTtcbiAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IEJyaWxsaWFudEFsbG93ZWRQaGFzZTtcbiAgfTtcbiAgdWk6IHtcbiAgICB0aGVtZU1vZGU6IFBlcnNvbmFQcm9maWxlVGhlbWVNb2RlO1xuICAgIGJhc2ljTW9kZTogYm9vbGVhbjtcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQZXJzb25hUHJvZmlsZUV4cG9ydCB7XG4gIGtpbmQ6IHR5cGVvZiBQRVJTT05BX1BST0ZJTEVfS0lORDtcbiAgdmVyc2lvbjogdHlwZW9mIFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OO1xuICBuYW1lOiBzdHJpbmc7XG4gIHNldHRpbmdzOiBQZXJzb25hUHJvZmlsZVNldHRpbmdzU25hcHNob3Q7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2F2ZWRQZXJzb25hUHJvZmlsZSBleHRlbmRzIFBlcnNvbmFQcm9maWxlRXhwb3J0IHtcbiAgaWQ6IHN0cmluZztcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XG4gIHVwZGF0ZWRBdDogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBlcnNvbmFQcm9maWxlU3RvcmVTbmFwc2hvdCB7XG4gIHByb2ZpbGVzOiBTYXZlZFBlcnNvbmFQcm9maWxlW107XG4gIHNlbGVjdGVkUHJvZmlsZUlkOiBzdHJpbmcgfCBudWxsO1xufVxuXG5jb25zdCBWQUxJRF9QUkVTRVRfSURTID0gbmV3IFNldDxNb3ZlUXVhbGl0eVByZXNldElkPihNT1ZFX1FVQUxJVFlfUFJFU0VUUy5tYXAoKHByZXNldCkgPT4gcHJlc2V0LmlkKSk7XG5jb25zdCBWQUxJRF9USEVNRV9NT0RFUyA9IG5ldyBTZXQ8UGVyc29uYVByb2ZpbGVUaGVtZU1vZGU+KFsnZGFyaycsICdsaWdodCcsICdtaW5pbWFsJywgJ3BlcnNvbmEnXSk7XG5jb25zdCBWQUxJRF9CUklMTElBTlRfUEhBU0VTID0gbmV3IFNldDxCcmlsbGlhbnRBbGxvd2VkUGhhc2U+KFsnb3BlbmluZycsICdtaWRkbGVnYW1lJywgJ2VuZGdhbWUnLCAnYW55J10pO1xuY29uc3QgVkFMSURfQlJJTExJQU5UX0JVREdFVFMgPSBuZXcgU2V0PEJyaWxsaWFudE1vdmVzUGVyR2FtZT4oWzAsIDEsIDIsIDMsIDRdKTtcblxuZnVuY3Rpb24gaXNSZWNvcmQodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBjbGFtcEludGVnZXIodmFsdWU6IHVua25vd24sIG1pbmltdW06IG51bWJlciwgbWF4aW11bTogbnVtYmVyLCBmYWxsYmFjazogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsbGJhY2s7XG4gIH1cblxuICByZXR1cm4gTWF0aC5tYXgobWluaW11bSwgTWF0aC5taW4obWF4aW11bSwgTWF0aC5yb3VuZCh2YWx1ZSkpKTtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVCdWNrZXRDb25maWcodmFsdWU6IHVua25vd24pOiBCdWNrZXRDb25maWcge1xuICBpZiAoIWlzUmVjb3JkKHZhbHVlKSkge1xuICAgIHJldHVybiB7IC4uLkRFRkFVTFRfQlVDS0VUX0NPTkZJRyB9O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiZXN0OiBjbGFtcEludGVnZXIodmFsdWUuYmVzdCwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuYmVzdCksXG4gICAgZ3JlYXQ6IGNsYW1wSW50ZWdlcih2YWx1ZS5ncmVhdCwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuZ3JlYXQpLFxuICAgIGV4Y2VsbGVudDogY2xhbXBJbnRlZ2VyKHZhbHVlLmV4Y2VsbGVudCwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuZXhjZWxsZW50KSxcbiAgICBnb29kOiBjbGFtcEludGVnZXIodmFsdWUuZ29vZCwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuZ29vZCksXG4gICAgaW5hY2N1cmFjeTogY2xhbXBJbnRlZ2VyKHZhbHVlLmluYWNjdXJhY3ksIDAsIDEwMCwgREVGQVVMVF9CVUNLRVRfQ09ORklHLmluYWNjdXJhY3kpLFxuICAgIG1pc3Rha2U6IGNsYW1wSW50ZWdlcih2YWx1ZS5taXN0YWtlLCAwLCAxMDAsIERFRkFVTFRfQlVDS0VUX0NPTkZJRy5taXN0YWtlKSxcbiAgICBibHVuZGVyOiBjbGFtcEludGVnZXIodmFsdWUuYmx1bmRlciwgMCwgMTAwLCBERUZBVUxUX0JVQ0tFVF9DT05GSUcuYmx1bmRlciksXG4gIH07XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplUHJlc2V0SWQodmFsdWU6IHVua25vd24pOiBNb3ZlUXVhbGl0eVByZXNldElkIHwgbnVsbCB7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgVkFMSURfUFJFU0VUX0lEUy5oYXModmFsdWUgYXMgTW92ZVF1YWxpdHlQcmVzZXRJZClcbiAgICA/ICh2YWx1ZSBhcyBNb3ZlUXVhbGl0eVByZXNldElkKVxuICAgIDogJ21lZGl1bSc7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplVGhlbWVNb2RlKHZhbHVlOiB1bmtub3duKTogUGVyc29uYVByb2ZpbGVUaGVtZU1vZGUge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBWQUxJRF9USEVNRV9NT0RFUy5oYXModmFsdWUgYXMgUGVyc29uYVByb2ZpbGVUaGVtZU1vZGUpXG4gICAgPyAodmFsdWUgYXMgUGVyc29uYVByb2ZpbGVUaGVtZU1vZGUpXG4gICAgOiAnZGFyayc7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplQnJpbGxpYW50TW92ZXNQZXJHYW1lKHZhbHVlOiB1bmtub3duKTogQnJpbGxpYW50TW92ZXNQZXJHYW1lIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgVkFMSURfQlJJTExJQU5UX0JVREdFVFMuaGFzKHZhbHVlIGFzIEJyaWxsaWFudE1vdmVzUGVyR2FtZSlcbiAgICA/ICh2YWx1ZSBhcyBCcmlsbGlhbnRNb3Zlc1BlckdhbWUpXG4gICAgOiAwO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZUJyaWxsaWFudEFsbG93ZWRQaGFzZSh2YWx1ZTogdW5rbm93bik6IEJyaWxsaWFudEFsbG93ZWRQaGFzZSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIFZBTElEX0JSSUxMSUFOVF9QSEFTRVMuaGFzKHZhbHVlIGFzIEJyaWxsaWFudEFsbG93ZWRQaGFzZSlcbiAgICA/ICh2YWx1ZSBhcyBCcmlsbGlhbnRBbGxvd2VkUGhhc2UpXG4gICAgOiAnYW55Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90KHZhbHVlOiB1bmtub3duKTogUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90IHtcbiAgY29uc3QgcmVjb3JkID0gaXNSZWNvcmQodmFsdWUpID8gdmFsdWUgOiB7fTtcbiAgY29uc3QgYnJpbGxpYW50ID0gaXNSZWNvcmQocmVjb3JkLmJyaWxsaWFudCkgPyByZWNvcmQuYnJpbGxpYW50IDoge307XG4gIGNvbnN0IHVpID0gaXNSZWNvcmQocmVjb3JkLnVpKSA/IHJlY29yZC51aSA6IHt9O1xuXG4gIHJldHVybiB7XG4gICAgYnVja2V0Q29uZmlnOiBzYW5pdGl6ZUJ1Y2tldENvbmZpZyhyZWNvcmQuYnVja2V0Q29uZmlnKSxcbiAgICBjdXJyZW50UHJlc2V0SWQ6IHNhbml0aXplUHJlc2V0SWQocmVjb3JkLmN1cnJlbnRQcmVzZXRJZCksXG4gICAgZGVwdGg6IGNsYW1wSW50ZWdlcihyZWNvcmQuZGVwdGgsIDEsIDMwLCA4KSxcbiAgICBtdWx0aVBWOiBjbGFtcEludGVnZXIocmVjb3JkLm11bHRpUFYsIDEsIDIwLCAxMiksXG4gICAgZmVhdHVyZU9wdGlvbnM6IG1lcmdlRmVhdHVyZU9wdGlvbnMoaXNSZWNvcmQocmVjb3JkLmZlYXR1cmVPcHRpb25zKSA/IChyZWNvcmQuZmVhdHVyZU9wdGlvbnMgYXMgUGFydGlhbDxGZWF0dXJlT3B0aW9ucz4pIDogdW5kZWZpbmVkKSxcbiAgICBicmlsbGlhbnQ6IHtcbiAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogc2FuaXRpemVCcmlsbGlhbnRNb3Zlc1BlckdhbWUoYnJpbGxpYW50LmJyaWxsaWFudE1vdmVzUGVyR2FtZSksXG4gICAgICBicmlsbGlhbnRBbGxvd2VkUGhhc2U6IHNhbml0aXplQnJpbGxpYW50QWxsb3dlZFBoYXNlKGJyaWxsaWFudC5icmlsbGlhbnRBbGxvd2VkUGhhc2UpLFxuICAgIH0sXG4gICAgdWk6IHtcbiAgICAgIHRoZW1lTW9kZTogc2FuaXRpemVUaGVtZU1vZGUodWkudGhlbWVNb2RlKSxcbiAgICAgIGJhc2ljTW9kZTogdHlwZW9mIHVpLmJhc2ljTW9kZSA9PT0gJ2Jvb2xlYW4nID8gdWkuYmFzaWNNb2RlIDogdHJ1ZSxcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVQZXJzb25hUHJvZmlsZUV4cG9ydChcbiAgdmFsdWU6IHVua25vd24sXG4gIGZhbGxiYWNrTmFtZSA9ICdJbXBvcnRlZCBQcm9maWxlJyxcbik6IFBlcnNvbmFQcm9maWxlRXhwb3J0IHwgbnVsbCB7XG4gIGlmICghaXNSZWNvcmQodmFsdWUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAodmFsdWUua2luZCAhPT0gUEVSU09OQV9QUk9GSUxFX0tJTkQgfHwgdmFsdWUudmVyc2lvbiAhPT0gUEVSU09OQV9QUk9GSUxFX1ZFUlNJT04pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IG5hbWUgPSB0eXBlb2YgdmFsdWUubmFtZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUubmFtZS50cmltKCkgPyB2YWx1ZS5uYW1lLnRyaW0oKSA6IGZhbGxiYWNrTmFtZTtcblxuICByZXR1cm4ge1xuICAgIGtpbmQ6IFBFUlNPTkFfUFJPRklMRV9LSU5ELFxuICAgIHZlcnNpb246IFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OLFxuICAgIG5hbWUsXG4gICAgc2V0dGluZ3M6IHNhbml0aXplUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90KHZhbHVlLnNldHRpbmdzKSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUGVyc29uYVByb2ZpbGVJbXBvcnQoXG4gIGpzb246IHN0cmluZyxcbik6IHsgb2s6IHRydWU7IHByb2ZpbGU6IFBlcnNvbmFQcm9maWxlRXhwb3J0IH0gfCB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9IHtcbiAgaWYgKCFqc29uLnRyaW0oKSkge1xuICAgIHJldHVybiB7XG4gICAgICBvazogZmFsc2UsXG4gICAgICBlcnJvcjogJ0ltcG9ydCBKU09OIGlzIGVtcHR5LicsXG4gICAgfTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShqc29uKSBhcyB1bmtub3duO1xuICAgIGNvbnN0IHByb2ZpbGUgPSBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlRXhwb3J0KHBhcnNlZCk7XG5cbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9rOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdJbXBvcnRlZCBKU09OIGRvZXMgbm90IG1hdGNoIHRoZSBQZXJzb25hQ2hlc3MgcHJvZmlsZSBzY2hlbWEuJyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgb2s6IHRydWUsIHByb2ZpbGUgfTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9rOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnSW1wb3J0ZWQgSlNPTiBjb3VsZCBub3QgYmUgcGFyc2VkLicsXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUocHJvZmlsZTogUGVyc29uYVByb2ZpbGVFeHBvcnQpOiBzdHJpbmcge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJvZmlsZSwgbnVsbCwgMik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTYXZlZFBlcnNvbmFQcm9maWxlKFxuICBwcm9maWxlOiBQZXJzb25hUHJvZmlsZUV4cG9ydCxcbiAgaWQ6IHN0cmluZyxcbiAgbm93SXNvOiBzdHJpbmcsXG4pOiBTYXZlZFBlcnNvbmFQcm9maWxlIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5wcm9maWxlLFxuICAgIGlkLFxuICAgIGNyZWF0ZWRBdDogbm93SXNvLFxuICAgIHVwZGF0ZWRBdDogbm93SXNvLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU2F2ZWRQZXJzb25hUHJvZmlsZShcbiAgcHJvZmlsZTogU2F2ZWRQZXJzb25hUHJvZmlsZSxcbiAgbmV4dDogUGVyc29uYVByb2ZpbGVFeHBvcnQsXG4gIG5vd0lzbzogc3RyaW5nLFxuKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB7XG4gIHJldHVybiB7XG4gICAgLi4ucHJvZmlsZSxcbiAgICAuLi5uZXh0LFxuICAgIGlkOiBwcm9maWxlLmlkLFxuICAgIGNyZWF0ZWRBdDogcHJvZmlsZS5jcmVhdGVkQXQsXG4gICAgdXBkYXRlZEF0OiBub3dJc28sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkdXBsaWNhdGVQZXJzb25hUHJvZmlsZShcbiAgcHJvZmlsZTogU2F2ZWRQZXJzb25hUHJvZmlsZSxcbiAgaWQ6IHN0cmluZyxcbiAgbmFtZTogc3RyaW5nLFxuICBub3dJc286IHN0cmluZyxcbik6IFNhdmVkUGVyc29uYVByb2ZpbGUge1xuICByZXR1cm4ge1xuICAgIC4uLnByb2ZpbGUsXG4gICAgaWQsXG4gICAgbmFtZSxcbiAgICBjcmVhdGVkQXQ6IG5vd0lzbyxcbiAgICB1cGRhdGVkQXQ6IG5vd0lzbyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplU2F2ZWRQZXJzb25hUHJvZmlsZSh2YWx1ZTogdW5rbm93bik6IFNhdmVkUGVyc29uYVByb2ZpbGUgfCBudWxsIHtcbiAgaWYgKCFpc1JlY29yZCh2YWx1ZSkgfHwgdHlwZW9mIHZhbHVlLmlkICE9PSAnc3RyaW5nJyB8fCAhdmFsdWUuaWQudHJpbSgpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBleHBvcnRlZCA9IHNhbml0aXplUGVyc29uYVByb2ZpbGVFeHBvcnQodmFsdWUpO1xuICBpZiAoIWV4cG9ydGVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBjcmVhdGVkQXQgPSB0eXBlb2YgdmFsdWUuY3JlYXRlZEF0ID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5jcmVhdGVkQXQudHJpbSgpXG4gICAgPyB2YWx1ZS5jcmVhdGVkQXRcbiAgICA6IG5ldyBEYXRlKDApLnRvSVNPU3RyaW5nKCk7XG4gIGNvbnN0IHVwZGF0ZWRBdCA9IHR5cGVvZiB2YWx1ZS51cGRhdGVkQXQgPT09ICdzdHJpbmcnICYmIHZhbHVlLnVwZGF0ZWRBdC50cmltKClcbiAgICA/IHZhbHVlLnVwZGF0ZWRBdFxuICAgIDogY3JlYXRlZEF0O1xuXG4gIHJldHVybiB7XG4gICAgLi4uZXhwb3J0ZWQsXG4gICAgaWQ6IHZhbHVlLmlkLFxuICAgIGNyZWF0ZWRBdCxcbiAgICB1cGRhdGVkQXQsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlU3RvcmVTbmFwc2hvdCh2YWx1ZTogdW5rbm93bik6IFBlcnNvbmFQcm9maWxlU3RvcmVTbmFwc2hvdCB7XG4gIGlmICghaXNSZWNvcmQodmFsdWUpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb2ZpbGVzOiBbXSxcbiAgICAgIHNlbGVjdGVkUHJvZmlsZUlkOiBudWxsLFxuICAgIH07XG4gIH1cblxuICBjb25zdCBwcm9maWxlcyA9IEFycmF5LmlzQXJyYXkodmFsdWUucHJvZmlsZXMpXG4gICAgPyB2YWx1ZS5wcm9maWxlc1xuICAgICAgLm1hcCgoZW50cnkpID0+IHNhbml0aXplU2F2ZWRQZXJzb25hUHJvZmlsZShlbnRyeSkpXG4gICAgICAuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIFNhdmVkUGVyc29uYVByb2ZpbGUgPT4gZW50cnkgIT09IG51bGwpXG4gICAgOiBbXTtcbiAgY29uc3Qgc2VsZWN0ZWRQcm9maWxlSWQgPSB0eXBlb2YgdmFsdWUuc2VsZWN0ZWRQcm9maWxlSWQgPT09ICdzdHJpbmcnID8gdmFsdWUuc2VsZWN0ZWRQcm9maWxlSWQgOiBudWxsO1xuXG4gIHJldHVybiB7XG4gICAgcHJvZmlsZXMsXG4gICAgc2VsZWN0ZWRQcm9maWxlSWQ6IHByb2ZpbGVzLnNvbWUoKHByb2ZpbGUpID0+IHByb2ZpbGUuaWQgPT09IHNlbGVjdGVkUHJvZmlsZUlkKSA/IHNlbGVjdGVkUHJvZmlsZUlkIDogbnVsbCxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUGVyc29uYVByb2ZpbGVFeHBvcnRGaWxlbmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBzbHVnID0gbmFtZVxuICAgIC50cmltKClcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi0rfC0rJC9nLCAnJykgfHwgJ3BlcnNvbmEtcHJvZmlsZSc7XG5cbiAgcmV0dXJuIGBwZXJzb25hY2hlc3MtJHtzbHVnfS5qc29uYDtcbn1cbiIsICJpbXBvcnQgeyBhY3Rpb24sIG1ha2VBdXRvT2JzZXJ2YWJsZSB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHtcbiAgYnVpbGRQZXJzb25hUHJvZmlsZUV4cG9ydEZpbGVuYW1lLFxuICBjcmVhdGVTYXZlZFBlcnNvbmFQcm9maWxlLFxuICBkdXBsaWNhdGVQZXJzb25hUHJvZmlsZSxcbiAgcGFyc2VQZXJzb25hUHJvZmlsZUltcG9ydCxcbiAgUEVSU09OQV9QUk9GSUxFX0tJTkQsXG4gIFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OLFxuICBQZXJzb25hUHJvZmlsZUV4cG9ydCxcbiAgUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90LFxuICBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlU3RvcmVTbmFwc2hvdCxcbiAgU2F2ZWRQZXJzb25hUHJvZmlsZSxcbiAgc2VyaWFsaXplUGVyc29uYVByb2ZpbGUsXG4gIHVwZGF0ZVNhdmVkUGVyc29uYVByb2ZpbGUsXG59IGZyb20gJy4uL2VuZ2luZS9wZXJzb25hUHJvZmlsZXMnO1xuaW1wb3J0IHsgY29uZmlnVmlld01vZGVsLCBDb25maWdWaWV3TW9kZWwgfSBmcm9tICcuL0NvbmZpZ1ZpZXdNb2RlbCc7XG5pbXBvcnQgeyBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCwgRmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcbmltcG9ydCB7IHVpU3RhdGVWaWV3TW9kZWwsIFVpU3RhdGVWaWV3TW9kZWwgfSBmcm9tICcuL1VpU3RhdGVWaWV3TW9kZWwnO1xuXG5jb25zdCBQRVJTT05BX1BST0ZJTEVTX1NUT1JBR0VfS0VZID0gJ3BlcnNvbmFjaGVzc19wZXJzb25hX3Byb2ZpbGVzJztcblxuaW50ZXJmYWNlIFBlcnNvbmFQcm9maWxlc0RlcGVuZGVuY2llcyB7XG4gIGNvbmZpZ1ZpZXdNb2RlbDogUGljazxDb25maWdWaWV3TW9kZWwsICdidWNrZXRDb25maWcnIHwgJ2N1cnJlbnRQcmVzZXRJZCcgfCAnZGVwdGgnIHwgJ211bHRpUFYnIHwgJ2FwcGx5UHJvZmlsZVNuYXBzaG90Jz47XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsOiBQaWNrPFxuICAgIEZlYXR1cmVPcHRpb25zVmlld01vZGVsLFxuICAgIHwgJ29wdGlvbnMnXG4gICAgfCAnYnJpbGxpYW50TW92ZXNQZXJHYW1lJ1xuICAgIHwgJ2JyaWxsaWFudEFsbG93ZWRQaGFzZSdcbiAgICB8ICdhcHBseVByb2ZpbGVTZXR0aW5ncydcbiAgPjtcbiAgdWlTdGF0ZVZpZXdNb2RlbDogUGljazxcbiAgICBVaVN0YXRlVmlld01vZGVsLFxuICAgIHwgJ3RoZW1lTW9kZSdcbiAgICB8ICdiYXNpY01vZGUnXG4gICAgfCAnYXBwbHlQcm9maWxlUHJlZmVyZW5jZXMnXG4gID47XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByb2ZpbGVJZCgpOiBzdHJpbmcge1xuICByZXR1cm4gYHByb2ZpbGVfJHtEYXRlLm5vdygpLnRvU3RyaW5nKDM2KX1fJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCA4KX1gO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUaW1lc3RhbXAoKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbn1cblxuZXhwb3J0IGNsYXNzIFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCB7XG4gIHByb2ZpbGVzOiBTYXZlZFBlcnNvbmFQcm9maWxlW10gPSBbXTtcbiAgc2VsZWN0ZWRQcm9maWxlSWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBwcm9maWxlTmFtZURyYWZ0ID0gJyc7XG4gIGV4Y2hhbmdlSnNvbiA9ICcnO1xuICBsYXN0QWN0aW9uTWVzc2FnZSA9ICcnO1xuICBpbXBvcnRFcnJvciA9ICcnO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVwczogUGVyc29uYVByb2ZpbGVzRGVwZW5kZW5jaWVzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRlcHM6IFBlcnNvbmFQcm9maWxlc0RlcGVuZGVuY2llcyA9IHtcbiAgICAgIGNvbmZpZ1ZpZXdNb2RlbCxcbiAgICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLFxuICAgICAgdWlTdGF0ZVZpZXdNb2RlbCxcbiAgICB9LFxuICApIHtcbiAgICB0aGlzLmRlcHMgPSBkZXBzO1xuXG4gICAgbWFrZUF1dG9PYnNlcnZhYmxlKHRoaXMsIHtcbiAgICAgIHNldFNlbGVjdGVkUHJvZmlsZUlkOiBhY3Rpb24sXG4gICAgICBzZXRQcm9maWxlTmFtZURyYWZ0OiBhY3Rpb24sXG4gICAgICBzZXRFeGNoYW5nZUpzb246IGFjdGlvbixcbiAgICAgIGNsZWFyRXhjaGFuZ2VTdGF0ZTogYWN0aW9uLFxuICAgICAgc2F2ZUN1cnJlbnRQcm9maWxlOiBhY3Rpb24sXG4gICAgICBsb2FkU2VsZWN0ZWRQcm9maWxlOiBhY3Rpb24sXG4gICAgICBkdXBsaWNhdGVTZWxlY3RlZFByb2ZpbGU6IGFjdGlvbixcbiAgICAgIHJlbmFtZVNlbGVjdGVkUHJvZmlsZTogYWN0aW9uLFxuICAgICAgZGVsZXRlU2VsZWN0ZWRQcm9maWxlOiBhY3Rpb24sXG4gICAgICBpbXBvcnRQcm9maWxlRnJvbUpzb246IGFjdGlvbixcbiAgICB9KTtcblxuICAgIHRoaXMucmVzdG9yZUZyb21TdG9yYWdlKCk7XG4gIH1cblxuICBzZXRTZWxlY3RlZFByb2ZpbGVJZChpZDogc3RyaW5nIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBpZDtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZT8ubmFtZSA/PyAnJztcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gJyc7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICB9XG5cbiAgc2V0UHJvZmlsZU5hbWVEcmFmdCh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gdmFsdWU7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9ICcnO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgfVxuXG4gIHNldEV4Y2hhbmdlSnNvbih2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSB2YWx1ZTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gJyc7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICB9XG5cbiAgY2xlYXJFeGNoYW5nZVN0YXRlKCk6IHZvaWQge1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gJyc7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9ICcnO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgfVxuXG4gIHNhdmVDdXJyZW50UHJvZmlsZShuYW1lID0gdGhpcy5wcm9maWxlTmFtZURyYWZ0KTogYm9vbGVhbiB7XG4gICAgY29uc3QgdHJpbW1lZE5hbWUgPSBuYW1lLnRyaW0oKTtcbiAgICBpZiAoIXRyaW1tZWROYW1lKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ0VudGVyIGEgcHJvZmlsZSBuYW1lIGJlZm9yZSBzYXZpbmcuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBzbmFwc2hvdCA9IHRoaXMuYnVpbGRDdXJyZW50U25hcHNob3QoKTtcbiAgICBjb25zdCBleHBvcnRlZCA9IHRoaXMuY3JlYXRlRXhwb3J0KHRyaW1tZWROYW1lLCBzbmFwc2hvdCk7XG4gICAgY29uc3Qgbm93SXNvID0gY3JlYXRlVGltZXN0YW1wKCk7XG4gICAgY29uc3QgZXhpc3RpbmdCeVNlbGVjdGVkID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgY29uc3QgZXhpc3RpbmdCeU5hbWUgPSB0aGlzLmZpbmRCeU5hbWUodHJpbW1lZE5hbWUpO1xuXG4gICAgaWYgKGV4aXN0aW5nQnlTZWxlY3RlZCAmJiBleGlzdGluZ0J5U2VsZWN0ZWQubmFtZSA9PT0gdHJpbW1lZE5hbWUpIHtcbiAgICAgIHRoaXMucHJvZmlsZXMgPSB0aGlzLnByb2ZpbGVzLm1hcCgocHJvZmlsZSkgPT4gKFxuICAgICAgICBwcm9maWxlLmlkID09PSBleGlzdGluZ0J5U2VsZWN0ZWQuaWRcbiAgICAgICAgICA/IHVwZGF0ZVNhdmVkUGVyc29uYVByb2ZpbGUocHJvZmlsZSwgZXhwb3J0ZWQsIG5vd0lzbylcbiAgICAgICAgICA6IHByb2ZpbGVcbiAgICAgICkpO1xuICAgICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBVcGRhdGVkIHByb2ZpbGUgXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQuYDtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICAgIHRoaXMuZXhjaGFuZ2VKc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQpO1xuICAgICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoZXhpc3RpbmdCeU5hbWUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSBgQSBwcm9maWxlIG5hbWVkIFx1MjAxQyR7dHJpbW1lZE5hbWV9XHUyMDFEIGFscmVhZHkgZXhpc3RzLmA7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgc2F2ZWQgPSBjcmVhdGVTYXZlZFBlcnNvbmFQcm9maWxlKGV4cG9ydGVkLCBjcmVhdGVQcm9maWxlSWQoKSwgbm93SXNvKTtcbiAgICB0aGlzLnByb2ZpbGVzID0gW3NhdmVkLCAuLi50aGlzLnByb2ZpbGVzXTtcbiAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gc2F2ZWQuaWQ7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gc2F2ZWQubmFtZTtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKGV4cG9ydGVkKTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYFNhdmVkIHByb2ZpbGUgXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBsb2FkU2VsZWN0ZWRQcm9maWxlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnU2VsZWN0IGEgc2F2ZWQgcHJvZmlsZSB0byBsb2FkLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5hcHBseVNuYXBzaG90KHByb2ZpbGUuc2V0dGluZ3MpO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHByb2ZpbGUubmFtZTtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKHRoaXMudG9FeHBvcnQocHJvZmlsZSkpO1xuICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSBgTG9hZGVkIHByb2ZpbGUgXHUyMDFDJHtwcm9maWxlLm5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZHVwbGljYXRlU2VsZWN0ZWRQcm9maWxlKG5hbWUgPSB0aGlzLnByb2ZpbGVOYW1lRHJhZnQpOiBib29sZWFuIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ1NlbGVjdCBhIHNhdmVkIHByb2ZpbGUgdG8gZHVwbGljYXRlLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgdHJpbW1lZE5hbWUgPSBuYW1lLnRyaW0oKSB8fCBgJHtwcm9maWxlLm5hbWV9IENvcHlgO1xuICAgIGlmICh0aGlzLmZpbmRCeU5hbWUodHJpbW1lZE5hbWUpKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gYEEgcHJvZmlsZSBuYW1lZCBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRCBhbHJlYWR5IGV4aXN0cy5gO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IG5vd0lzbyA9IGNyZWF0ZVRpbWVzdGFtcCgpO1xuICAgIGNvbnN0IGR1cGxpY2F0ZSA9IGR1cGxpY2F0ZVBlcnNvbmFQcm9maWxlKHByb2ZpbGUsIGNyZWF0ZVByb2ZpbGVJZCgpLCB0cmltbWVkTmFtZSwgbm93SXNvKTtcbiAgICB0aGlzLnByb2ZpbGVzID0gW2R1cGxpY2F0ZSwgLi4udGhpcy5wcm9maWxlc107XG4gICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IGR1cGxpY2F0ZS5pZDtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSBkdXBsaWNhdGUubmFtZTtcbiAgICB0aGlzLmV4Y2hhbmdlSnNvbiA9IHNlcmlhbGl6ZVBlcnNvbmFQcm9maWxlKHRoaXMudG9FeHBvcnQoZHVwbGljYXRlKSk7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGBEdXBsaWNhdGVkIHByb2ZpbGUgYXMgXHUyMDFDJHtkdXBsaWNhdGUubmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZW5hbWVTZWxlY3RlZFByb2ZpbGUobmFtZSA9IHRoaXMucHJvZmlsZU5hbWVEcmFmdCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnU2VsZWN0IGEgc2F2ZWQgcHJvZmlsZSB0byByZW5hbWUuJztcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB0cmltbWVkTmFtZSA9IG5hbWUudHJpbSgpO1xuICAgIGlmICghdHJpbW1lZE5hbWUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnRW50ZXIgYSBwcm9maWxlIG5hbWUgYmVmb3JlIHJlbmFtaW5nLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHByb2ZpbGUubmFtZSA9PT0gdHJpbW1lZE5hbWUpIHtcbiAgICAgIHRoaXMubGFzdEFjdGlvbk1lc3NhZ2UgPSAnUHJvZmlsZSBuYW1lIGlzIGFscmVhZHkgdXAgdG8gZGF0ZS4nO1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RpbmdCeU5hbWUgPSB0aGlzLmZpbmRCeU5hbWUodHJpbW1lZE5hbWUpO1xuICAgIGlmIChleGlzdGluZ0J5TmFtZSAmJiBleGlzdGluZ0J5TmFtZS5pZCAhPT0gcHJvZmlsZS5pZCkge1xuICAgICAgdGhpcy5pbXBvcnRFcnJvciA9IGBBIHByb2ZpbGUgbmFtZWQgXHUyMDFDJHt0cmltbWVkTmFtZX1cdTIwMUQgYWxyZWFkeSBleGlzdHMuYDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBub3dJc28gPSBjcmVhdGVUaW1lc3RhbXAoKTtcbiAgICB0aGlzLnByb2ZpbGVzID0gdGhpcy5wcm9maWxlcy5tYXAoKGVudHJ5KSA9PiAoXG4gICAgICBlbnRyeS5pZCA9PT0gcHJvZmlsZS5pZFxuICAgICAgICA/IHsgLi4uZW50cnksIG5hbWU6IHRyaW1tZWROYW1lLCB1cGRhdGVkQXQ6IG5vd0lzbyB9XG4gICAgICAgIDogZW50cnlcbiAgICApKTtcbiAgICB0aGlzLnByb2ZpbGVOYW1lRHJhZnQgPSB0cmltbWVkTmFtZTtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYFJlbmFtZWQgcHJvZmlsZSB0byBcdTIwMUMke3RyaW1tZWROYW1lfVx1MjAxRC5gO1xuICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnJztcbiAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRlbGV0ZVNlbGVjdGVkUHJvZmlsZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU7XG4gICAgaWYgKCFwcm9maWxlKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gJ1NlbGVjdCBhIHNhdmVkIHByb2ZpbGUgdG8gZGVsZXRlLic7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9maWxlcyA9IHRoaXMucHJvZmlsZXMuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkuaWQgIT09IHByb2ZpbGUuaWQpO1xuICAgIGNvbnN0IG5leHRTZWxlY3RlZElkID0gdGhpcy5wcm9maWxlc1swXT8uaWQgPz8gbnVsbDtcbiAgICB0aGlzLnNlbGVjdGVkUHJvZmlsZUlkID0gbmV4dFNlbGVjdGVkSWQ7XG4gICAgdGhpcy5wcm9maWxlTmFtZURyYWZ0ID0gdGhpcy5zZWxlY3RlZFByb2ZpbGU/Lm5hbWUgPz8gJyc7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSAnJztcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYERlbGV0ZWQgcHJvZmlsZSBcdTIwMUMke3Byb2ZpbGUubmFtZX1cdTIwMUQuYDtcbiAgICB0aGlzLmltcG9ydEVycm9yID0gJyc7XG4gICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBleHBvcnRTZWxlY3RlZFByb2ZpbGUoKTogeyBmaWxlTmFtZTogc3RyaW5nOyBqc29uOiBzdHJpbmcgfSB8IG51bGwge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLnNlbGVjdGVkUHJvZmlsZTtcbiAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgIHRoaXMuaW1wb3J0RXJyb3IgPSAnU2VsZWN0IGEgc2F2ZWQgcHJvZmlsZSB0byBleHBvcnQuJztcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGV4cG9ydGVkID0gdGhpcy50b0V4cG9ydChwcm9maWxlKTtcbiAgICBjb25zdCBqc29uID0gc2VyaWFsaXplUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQpO1xuICAgIHRoaXMuZXhjaGFuZ2VKc29uID0ganNvbjtcbiAgICB0aGlzLmxhc3RBY3Rpb25NZXNzYWdlID0gYEV4cG9ydGVkIHByb2ZpbGUgXHUyMDFDJHtwcm9maWxlLm5hbWV9XHUyMDFELmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGZpbGVOYW1lOiBidWlsZFBlcnNvbmFQcm9maWxlRXhwb3J0RmlsZW5hbWUocHJvZmlsZS5uYW1lKSxcbiAgICAgIGpzb24sXG4gICAgfTtcbiAgfVxuXG4gIGltcG9ydFByb2ZpbGVGcm9tSnNvbihqc29uID0gdGhpcy5leGNoYW5nZUpzb24pOiBib29sZWFuIHtcbiAgICBjb25zdCBwYXJzZWQgPSBwYXJzZVBlcnNvbmFQcm9maWxlSW1wb3J0KGpzb24pO1xuICAgIGlmICghcGFyc2VkLm9rKSB7XG4gICAgICB0aGlzLmltcG9ydEVycm9yID0gcGFyc2VkLmVycm9yO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGluY29taW5nTmFtZSA9IHBhcnNlZC5wcm9maWxlLm5hbWUudHJpbSgpO1xuICAgIGNvbnN0IGZpbmFsTmFtZSA9IHRoaXMuZW5zdXJlVW5pcXVlTmFtZShpbmNvbWluZ05hbWUpO1xuICAgIGNvbnN0IGV4cG9ydGVkID0ge1xuICAgICAgLi4ucGFyc2VkLnByb2ZpbGUsXG4gICAgICBuYW1lOiBmaW5hbE5hbWUsXG4gICAgfTtcbiAgICBjb25zdCBub3dJc28gPSBjcmVhdGVUaW1lc3RhbXAoKTtcbiAgICBjb25zdCBzYXZlZCA9IGNyZWF0ZVNhdmVkUGVyc29uYVByb2ZpbGUoZXhwb3J0ZWQsIGNyZWF0ZVByb2ZpbGVJZCgpLCBub3dJc28pO1xuXG4gICAgdGhpcy5wcm9maWxlcyA9IFtzYXZlZCwgLi4udGhpcy5wcm9maWxlc107XG4gICAgdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCA9IHNhdmVkLmlkO1xuICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHNhdmVkLm5hbWU7XG4gICAgdGhpcy5leGNoYW5nZUpzb24gPSBzZXJpYWxpemVQZXJzb25hUHJvZmlsZShleHBvcnRlZCk7XG4gICAgdGhpcy5sYXN0QWN0aW9uTWVzc2FnZSA9IGZpbmFsTmFtZSA9PT0gaW5jb21pbmdOYW1lXG4gICAgICA/IGBJbXBvcnRlZCBwcm9maWxlIFx1MjAxQyR7ZmluYWxOYW1lfVx1MjAxRC5gXG4gICAgICA6IGBJbXBvcnRlZCBwcm9maWxlIGFzIFx1MjAxQyR7ZmluYWxOYW1lfVx1MjAxRCB0byBhdm9pZCBhIGR1cGxpY2F0ZSBuYW1lLmA7XG4gICAgdGhpcy5pbXBvcnRFcnJvciA9ICcnO1xuICAgIHRoaXMucGVyc2lzdFRvU3RvcmFnZSgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZ2V0IHNlbGVjdGVkUHJvZmlsZSgpOiBTYXZlZFBlcnNvbmFQcm9maWxlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucHJvZmlsZXMuZmluZCgocHJvZmlsZSkgPT4gcHJvZmlsZS5pZCA9PT0gdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCkgPz8gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgYnVpbGRDdXJyZW50U25hcHNob3QoKTogUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90IHtcbiAgICByZXR1cm4ge1xuICAgICAgYnVja2V0Q29uZmlnOiB7IC4uLnRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuYnVja2V0Q29uZmlnIH0sXG4gICAgICBjdXJyZW50UHJlc2V0SWQ6IHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuY3VycmVudFByZXNldElkLFxuICAgICAgZGVwdGg6IHRoaXMuZGVwcy5jb25maWdWaWV3TW9kZWwuZGVwdGgsXG4gICAgICBtdWx0aVBWOiB0aGlzLmRlcHMuY29uZmlnVmlld01vZGVsLm11bHRpUFYsXG4gICAgICBmZWF0dXJlT3B0aW9uczogeyAuLi50aGlzLmRlcHMuZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwub3B0aW9ucyB9LFxuICAgICAgYnJpbGxpYW50OiB7XG4gICAgICAgIGJyaWxsaWFudE1vdmVzUGVyR2FtZTogdGhpcy5kZXBzLmZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudE1vdmVzUGVyR2FtZSxcbiAgICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiB0aGlzLmRlcHMuZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50QWxsb3dlZFBoYXNlLFxuICAgICAgfSxcbiAgICAgIHVpOiB7XG4gICAgICAgIHRoZW1lTW9kZTogdGhpcy5kZXBzLnVpU3RhdGVWaWV3TW9kZWwudGhlbWVNb2RlLFxuICAgICAgICBiYXNpY01vZGU6IHRoaXMuZGVwcy51aVN0YXRlVmlld01vZGVsLmJhc2ljTW9kZSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlTbmFwc2hvdChzbmFwc2hvdDogUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90KTogdm9pZCB7XG4gICAgdGhpcy5kZXBzLmNvbmZpZ1ZpZXdNb2RlbC5hcHBseVByb2ZpbGVTbmFwc2hvdCh7XG4gICAgICBidWNrZXRDb25maWc6IHNuYXBzaG90LmJ1Y2tldENvbmZpZyxcbiAgICAgIGN1cnJlbnRQcmVzZXRJZDogc25hcHNob3QuY3VycmVudFByZXNldElkLFxuICAgICAgZGVwdGg6IHNuYXBzaG90LmRlcHRoLFxuICAgICAgbXVsdGlQVjogc25hcHNob3QubXVsdGlQVixcbiAgICB9KTtcbiAgICB0aGlzLmRlcHMuZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYXBwbHlQcm9maWxlU2V0dGluZ3Moc25hcHNob3QuZmVhdHVyZU9wdGlvbnMsIHNuYXBzaG90LmJyaWxsaWFudCk7XG4gICAgdGhpcy5kZXBzLnVpU3RhdGVWaWV3TW9kZWwuYXBwbHlQcm9maWxlUHJlZmVyZW5jZXMoc25hcHNob3QudWkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVFeHBvcnQobmFtZTogc3RyaW5nLCBzZXR0aW5nczogUGVyc29uYVByb2ZpbGVTZXR0aW5nc1NuYXBzaG90KTogUGVyc29uYVByb2ZpbGVFeHBvcnQge1xuICAgIHJldHVybiB7XG4gICAgICBraW5kOiBQRVJTT05BX1BST0ZJTEVfS0lORCxcbiAgICAgIHZlcnNpb246IFBFUlNPTkFfUFJPRklMRV9WRVJTSU9OLFxuICAgICAgbmFtZSxcbiAgICAgIHNldHRpbmdzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHRvRXhwb3J0KHByb2ZpbGU6IFNhdmVkUGVyc29uYVByb2ZpbGUpOiBQZXJzb25hUHJvZmlsZUV4cG9ydCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6IHByb2ZpbGUua2luZCxcbiAgICAgIHZlcnNpb246IHByb2ZpbGUudmVyc2lvbixcbiAgICAgIG5hbWU6IHByb2ZpbGUubmFtZSxcbiAgICAgIHNldHRpbmdzOiBwcm9maWxlLnNldHRpbmdzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGZpbmRCeU5hbWUobmFtZTogc3RyaW5nKTogU2F2ZWRQZXJzb25hUHJvZmlsZSB8IG51bGwge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWROYW1lID0gbmFtZS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gdGhpcy5wcm9maWxlcy5maW5kKChwcm9maWxlKSA9PiBwcm9maWxlLm5hbWUudHJpbSgpLnRvTG93ZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lKSA/PyBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVVbmlxdWVOYW1lKGJhc2VOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHRyaW1tZWRCYXNlTmFtZSA9IGJhc2VOYW1lLnRyaW0oKSB8fCAnSW1wb3J0ZWQgUHJvZmlsZSc7XG4gICAgaWYgKCF0aGlzLmZpbmRCeU5hbWUodHJpbW1lZEJhc2VOYW1lKSkge1xuICAgICAgcmV0dXJuIHRyaW1tZWRCYXNlTmFtZTtcbiAgICB9XG5cbiAgICBsZXQgaW5kZXggPSAyO1xuICAgIGxldCBjYW5kaWRhdGUgPSBgJHt0cmltbWVkQmFzZU5hbWV9ICR7aW5kZXh9YDtcbiAgICB3aGlsZSAodGhpcy5maW5kQnlOYW1lKGNhbmRpZGF0ZSkpIHtcbiAgICAgIGluZGV4ICs9IDE7XG4gICAgICBjYW5kaWRhdGUgPSBgJHt0cmltbWVkQmFzZU5hbWV9ICR7aW5kZXh9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FuZGlkYXRlO1xuICB9XG5cbiAgcHJpdmF0ZSByZXN0b3JlRnJvbVN0b3JhZ2UoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oUEVSU09OQV9QUk9GSUxFU19TVE9SQUdFX0tFWSk7XG4gICAgICBpZiAoIXNhdmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc25hcHNob3QgPSBzYW5pdGl6ZVBlcnNvbmFQcm9maWxlU3RvcmVTbmFwc2hvdChKU09OLnBhcnNlKHNhdmVkKSBhcyB1bmtub3duKTtcbiAgICAgIHRoaXMucHJvZmlsZXMgPSBzbmFwc2hvdC5wcm9maWxlcztcbiAgICAgIHRoaXMuc2VsZWN0ZWRQcm9maWxlSWQgPSBzbmFwc2hvdC5zZWxlY3RlZFByb2ZpbGVJZCA/PyBzbmFwc2hvdC5wcm9maWxlc1swXT8uaWQgPz8gbnVsbDtcbiAgICAgIHRoaXMucHJvZmlsZU5hbWVEcmFmdCA9IHRoaXMuc2VsZWN0ZWRQcm9maWxlPy5uYW1lID8/ICcnO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGludmFsaWQgc2F2ZWQgcGVyc29uYSBwcm9maWxlcyBhbmQgY29udGludWUgd2l0aCBhbiBlbXB0eSBsaXN0LlxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGVyc2lzdFRvU3RvcmFnZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICAgIFBFUlNPTkFfUFJPRklMRVNfU1RPUkFHRV9LRVksXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBwcm9maWxlczogdGhpcy5wcm9maWxlcyxcbiAgICAgICAgICBzZWxlY3RlZFByb2ZpbGVJZDogdGhpcy5zZWxlY3RlZFByb2ZpbGVJZCxcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGxvY2FsU3RvcmFnZSBmYWlsdXJlcyB0byBrZWVwIHNldHRpbmdzIHVzYWJsZS5cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCA9IG5ldyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwoKTtcblxuZXhwb3J0IHsgUEVSU09OQV9QUk9GSUxFU19TVE9SQUdFX0tFWSB9O1xuIiwgIi8qKlxuICogVmlld01vZGVscyBNb2R1bGVcbiAqIFJlLWV4cG9ydHMgYWxsIFZpZXdNb2RlbCBpbnN0YW5jZXNcbiAqL1xuXG5leHBvcnQgeyBCb2FyZFZpZXdNb2RlbCwgYm9hcmRWaWV3TW9kZWwgfSBmcm9tICcuL0JvYXJkVmlld01vZGVsJztcbmV4cG9ydCB7IEVuZ2luZVZpZXdNb2RlbCwgZW5naW5lVmlld01vZGVsIH0gZnJvbSAnLi9FbmdpbmVWaWV3TW9kZWwnO1xuZXhwb3J0IHsgQ29uZmlnVmlld01vZGVsLCBjb25maWdWaWV3TW9kZWwgfSBmcm9tICcuL0NvbmZpZ1ZpZXdNb2RlbCc7XG5leHBvcnQgeyBGZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSBmcm9tICcuL0ZlYXR1cmVPcHRpb25zVmlld01vZGVsJztcbmV4cG9ydCB7IERlYnVnVmlld01vZGVsLCBkZWJ1Z1ZpZXdNb2RlbCB9IGZyb20gJy4vRGVidWdWaWV3TW9kZWwnO1xuZXhwb3J0IHsgVWlTdGF0ZVZpZXdNb2RlbCwgdWlTdGF0ZVZpZXdNb2RlbCB9IGZyb20gJy4vVWlTdGF0ZVZpZXdNb2RlbCc7XG5leHBvcnQgeyBQZXJzb25hUHJvZmlsZXNWaWV3TW9kZWwsIHBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCB9IGZyb20gJy4vUGVyc29uYVByb2ZpbGVzVmlld01vZGVsJztcbiIsICIvKipcbiAqIFByZWRlZmluZWQgY2hlc3Mgb3BlbmluZ3MgKFBHTiBtb3ZlIHNlcXVlbmNlcylcbiAqIFVzZWQgdG8gbG9hZCBhIHBvc2l0aW9uIGFmdGVyIHRoZSBnaXZlbiBtb3ZlcyBmcm9tIHRoZSBpbml0aWFsIHBvc2l0aW9uLlxuICovXG5cbmV4cG9ydCB0eXBlIE9wZW5pbmdTaWRlID0gJ3doaXRlJyB8ICdibGFjayc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3BlbmluZyB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIFdoaWNoIHNpZGUgcGxheXMgdGhpcyBvcGVuaW5nICh0aGUgb3BlbmluZyBpcyBuYW1lZCBmcm9tIHRoaXMgc2lkZSdzIHBlcnNwZWN0aXZlKSAqL1xuICBzaWRlOiBPcGVuaW5nU2lkZTtcbiAgLyoqIFNob3J0IGRlc2NyaXB0aW9uIG9yIEVDTy1zdHlsZSB0YWcgKi9cbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIC8qKiBQR04gbW92ZSBzZXF1ZW5jZSBmcm9tIHRoZSBzdGFydGluZyBwb3NpdGlvbiAoZS5nLiBcIjEuIGU0IGU1IDIuIFFoNVwiKSAqL1xuICBwZ246IHN0cmluZztcbn1cblxuLyoqIEJ1aWxkIG1pbmltYWwgUEdOIGZvciBjaGVzcy5qcyAoaGVhZGVycyArIGJsYW5rIGxpbmUgKyBtb3ZlcyArIHJlc3VsdCkgKi9cbmZ1bmN0aW9uIHBnbihtb3Zlczogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbW92ZVRleHQgPSBtb3Zlcy50cmltKCkuZW5kc1dpdGgoJyonKSA/IG1vdmVzLnRyaW0oKSA6IGAke21vdmVzLnRyaW0oKX0gKmA7XG4gIHJldHVybiBgW0V2ZW50IFwiP1wiXVxcbltTaXRlIFwiP1wiXVxcbltEYXRlIFwiPz8/Py4/Py4/P1wiXVxcbltXaGl0ZSBcIj9cIl1cXG5bQmxhY2sgXCI/XCJdXFxuW1Jlc3VsdCBcIipcIl1cXG5cXG4ke21vdmVUZXh0fWA7XG59XG5cbmV4cG9ydCBjb25zdCBQUkVERUZJTkVEX09QRU5JTkdTOiBPcGVuaW5nW10gPSBbXG4gIHtcbiAgICBpZDogJ25hcG9sZW9uJyxcbiAgICBuYW1lOiBcIktpbmcncyBQYXduOiBOYXBvbGVvbiBBdHRhY2tcIixcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgZTUgMi4gUWg1JyxcbiAgICBwZ246IHBnbignMS4gZTQgZTUgMi4gUWg1JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ2l0YWxpYW4nLFxuICAgIG5hbWU6IFwiSXRhbGlhbiBHYW1lXCIsXG4gICAgc2lkZTogJ3doaXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJzEuIGU0IGU1IDIuIE5mMyBOYzYgMy4gQmM0JyxcbiAgICBwZ246IHBnbignMS4gZTQgZTUgMi4gTmYzIE5jNiAzLiBCYzQnKSxcbiAgfSxcbiAge1xuICAgIGlkOiAncnV5X2xvcGV6JyxcbiAgICBuYW1lOiAnUnV5IExvcGV6JyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgZTUgMi4gTmYzIE5jNiAzLiBCYjUnLFxuICAgIHBnbjogcGduKCcxLiBlNCBlNSAyLiBOZjMgTmM2IDMuIEJiNScpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdzaWNpbGlhbicsXG4gICAgbmFtZTogJ1NpY2lsaWFuIERlZmVuc2UnLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBjNScsXG4gICAgcGduOiBwZ24oJzEuIGU0IGM1JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ2ZyZW5jaCcsXG4gICAgbmFtZTogJ0ZyZW5jaCBEZWZlbnNlJyxcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZTQgZTYnLFxuICAgIHBnbjogcGduKCcxLiBlNCBlNicpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdjYXJvX2thbm4nLFxuICAgIG5hbWU6ICdDYXJvLUthbm4nLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBjNicsXG4gICAgcGduOiBwZ24oJzEuIGU0IGM2JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ3F1ZWVuc19nYW1iaXQnLFxuICAgIG5hbWU6IFwiUXVlZW4ncyBHYW1iaXRcIixcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZDQgZDUgMi4gYzQnLFxuICAgIHBnbjogcGduKCcxLiBkNCBkNSAyLiBjNCcpLFxuICB9LFxuICB7XG4gICAgaWQ6ICdsb25kb24nLFxuICAgIG5hbWU6ICdMb25kb24gU3lzdGVtJyxcbiAgICBzaWRlOiAnd2hpdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZDQgZDUgMi4gQmY0JyxcbiAgICBwZ246IHBnbignMS4gZDQgZDUgMi4gQmY0JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ2tpbmdzX2luZGlhbicsXG4gICAgbmFtZTogXCJLaW5nJ3MgSW5kaWFuIERlZmVuc2VcIixcbiAgICBzaWRlOiAnYmxhY2snLFxuICAgIGRlc2NyaXB0aW9uOiAnMS4gZDQgTmY2IDIuIGM0IGc2JyxcbiAgICBwZ246IHBnbignMS4gZDQgTmY2IDIuIGM0IGc2JyksXG4gIH0sXG4gIHtcbiAgICBpZDogJ3BpcmMnLFxuICAgIG5hbWU6ICdQaXJjIERlZmVuc2UnLFxuICAgIHNpZGU6ICdibGFjaycsXG4gICAgZGVzY3JpcHRpb246ICcxLiBlNCBkNiAyLiBkNCBOZjYnLFxuICAgIHBnbjogcGduKCcxLiBlNCBkNiAyLiBkNCBOZjYnKSxcbiAgfSxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcGVuaW5nQnlJZChpZDogc3RyaW5nKTogT3BlbmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBQUkVERUZJTkVEX09QRU5JTkdTLmZpbmQobyA9PiBvLmlkID09PSBpZCk7XG59XG4iLCAiaW1wb3J0IGFzc2VydCBmcm9tICdub2RlOmFzc2VydC9zdHJpY3QnO1xuaW1wb3J0IHRlc3QgZnJvbSAnbm9kZTp0ZXN0JztcblxuY2xhc3MgTWVtb3J5U3RvcmFnZSB7XG4gIHByaXZhdGUgc3RvcmUgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gIGdldEl0ZW0oa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5zdG9yZS5oYXMoa2V5KSA/ICh0aGlzLnN0b3JlLmdldChrZXkpID8/IG51bGwpIDogbnVsbDtcbiAgfVxuXG4gIHNldEl0ZW0oa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlLnNldChrZXksIHZhbHVlKTtcbiAgfVxuXG4gIHJlbW92ZUl0ZW0oa2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnN0b3JlLmRlbGV0ZShrZXkpO1xuICB9XG5cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgdGhpcy5zdG9yZS5jbGVhcigpO1xuICB9XG59XG5cbmNvbnN0IGxvY2FsU3RvcmFnZU1vY2sgPSBuZXcgTWVtb3J5U3RvcmFnZSgpO1xuKGdsb2JhbFRoaXMgYXMgdW5rbm93biBhcyB7IGxvY2FsU3RvcmFnZTogTWVtb3J5U3RvcmFnZSB9KS5sb2NhbFN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2VNb2NrO1xuXG50ZXN0KCdhbmFseXNpcyBzYWZldHkgaWdub3JlcyBzdGFsZSByZXF1ZXN0cyBhbmQgc3RhbGUgZGVsYXllZCBtb3ZlcycsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBjYW5BcHBseUFuYWx5emVkTW92ZSwgaXNTdGFsZUFuYWx5c2lzUmVxdWVzdCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2FuYWx5c2lzU2FmZXR5Jyk7XG5cbiAgYXNzZXJ0LmVxdWFsKGlzU3RhbGVBbmFseXNpc1JlcXVlc3QoMSwgMiksIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoaXNTdGFsZUFuYWx5c2lzUmVxdWVzdCg0LCA0KSwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoY2FuQXBwbHlBbmFseXplZE1vdmUoJ2Zlbi1hJywgJ2Zlbi1iJyksIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGNhbkFwcGx5QW5hbHl6ZWRNb3ZlKCdmZW4tYScsICdmZW4tYScpLCB0cnVlKTtcbn0pO1xuXG50ZXN0KCdhbmFseXNpcyBjYWNoZSBrZXksIHRyaW1taW5nLCBhbmQgaW52YWxpZGF0aW9uIGJlaGF2ZSBjb3JyZWN0bHknLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgQW5hbHlzaXNDYWNoZSwgYnVpbGRBbmFseXNpc0NhY2hlS2V5IH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvYW5hbHlzaXNDYWNoZScpO1xuXG4gIGFzc2VydC5lcXVhbChcbiAgICBidWlsZEFuYWx5c2lzQ2FjaGVLZXkoJ2ZlbicsIDgsIDEyKSxcbiAgICAnZmVufGRlcHRoOjh8bXVsdGlwdjoxMicsXG4gICk7XG5cbiAgY29uc3QgY2FjaGUgPSBuZXcgQW5hbHlzaXNDYWNoZSgyKTtcbiAgY2FjaGUuc2V0KHsga2V5OiAnYScsIG1vdmVzOiBbXSwgdGltZXN0YW1wOiAxIH0pO1xuICBjYWNoZS5zZXQoeyBrZXk6ICdiJywgbW92ZXM6IFtdLCB0aW1lc3RhbXA6IDIgfSk7XG4gIGNhY2hlLnNldCh7IGtleTogJ2MnLCBtb3ZlczogW10sIHRpbWVzdGFtcDogMyB9KTtcblxuICBhc3NlcnQuZXF1YWwoY2FjaGUuc2l6ZSwgMik7XG4gIGFzc2VydC5lcXVhbChjYWNoZS5nZXQoJ2EnKSwgbnVsbCk7XG4gIGFzc2VydC5ub3RFcXVhbChjYWNoZS5nZXQoJ2InKSwgbnVsbCk7XG4gIGFzc2VydC5ub3RFcXVhbChjYWNoZS5nZXQoJ2MnKSwgbnVsbCk7XG5cbiAgY2FjaGUuaW52YWxpZGF0ZSgnYicpO1xuICBhc3NlcnQuZXF1YWwoY2FjaGUuZ2V0KCdiJyksIG51bGwpO1xuXG4gIGNhY2hlLmludmFsaWRhdGUoKTtcbiAgYXNzZXJ0LmVxdWFsKGNhY2hlLnNpemUsIDApO1xufSk7XG5cbnRlc3QoJ2RldGVybWluaXN0aWMgUk5HIGNoYW5nZXMgc3RyZWFtIHdoZW4gRkVOIGNoYW5nZXMgYXQgdGhlIHNhbWUgbW92ZSBudW1iZXInLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgYnVpbGREZXRlcm1pbmlzdGljU2VlZCwgY3JlYXRlU2VlZGVkUmFuZG9tU291cmNlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvcmFuZG9tJyk7XG5cbiAgY29uc3Qgc2VlZEEgPSBidWlsZERldGVybWluaXN0aWNTZWVkKHtcbiAgICBnYW1lU3RhcnRGZW46ICdzdGFydC1mZW4nLFxuICAgIGN1cnJlbnRGZW46ICdmZW4tYScsXG4gICAgbW92ZUNvdW50OiAxMixcbiAgICBzaWRlVG9Nb3ZlOiAndycsXG4gICAgcGVyc29uYTogJ21lZGl1bScsXG4gIH0pO1xuICBjb25zdCBzZWVkQiA9IGJ1aWxkRGV0ZXJtaW5pc3RpY1NlZWQoe1xuICAgIGdhbWVTdGFydEZlbjogJ3N0YXJ0LWZlbicsXG4gICAgY3VycmVudEZlbjogJ2Zlbi1iJyxcbiAgICBtb3ZlQ291bnQ6IDEyLFxuICAgIHNpZGVUb01vdmU6ICd3JyxcbiAgICBwZXJzb25hOiAnbWVkaXVtJyxcbiAgfSk7XG5cbiAgY29uc3Qgcm5nQSA9IGNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZShzZWVkQSk7XG4gIGNvbnN0IHJuZ0IgPSBjcmVhdGVTZWVkZWRSYW5kb21Tb3VyY2Uoc2VlZEIpO1xuXG4gIGFzc2VydC5ub3RFcXVhbChybmdBLm5leHQoKSwgcm5nQi5uZXh0KCkpO1xufSk7XG5cbnRlc3QoJ1BHTiBjdXN0b20gc3RhcnQgRkVOIGlzIHJlc3BlY3RlZCcsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyByZXNvbHZlUGduU3RhcnRGZW4gfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9nYW1lU2Vzc2lvbicpO1xuXG4gIGNvbnN0IGZlbiA9IHJlc29sdmVQZ25TdGFydEZlbihcbiAgICB7XG4gICAgICBTZXRVcDogJzEnLFxuICAgICAgRkVOOiAnOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyxcbiAgICB9LFxuICAgICdmYWxsYmFjaycsXG4gICk7XG5cbiAgYXNzZXJ0LmVxdWFsKGZlbiwgJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScpO1xufSk7XG5cbnRlc3QoJ2JyaWxsaWFudCB1c2FnZSBkZXJpdmVzIGZyb20gbW92ZSBoaXN0b3J5IG1ldGFkYXRhJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IGRlcml2ZUJyaWxsaWFudFVzYWdlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvYnJpbGxpYW50VHJhY2tpbmcnKTtcblxuICBjb25zdCB1c2FnZSA9IGRlcml2ZUJyaWxsaWFudFVzYWdlKFtcbiAgICB7XG4gICAgICBiZWZvcmVGZW46ICdhJyxcbiAgICAgIGFmdGVyRmVuOiAnYicsXG4gICAgICB1Y2k6ICdlMmU0JyxcbiAgICAgIG1vdmVOdW1iZXI6IDEsXG4gICAgICBjb25zdW1lZEJyaWxsaWFudDogZmFsc2UsXG4gICAgfSxcbiAgICB7XG4gICAgICBiZWZvcmVGZW46ICdiJyxcbiAgICAgIGFmdGVyRmVuOiAnYycsXG4gICAgICB1Y2k6ICdlN2U1JyxcbiAgICAgIG1vdmVOdW1iZXI6IDEsXG4gICAgICBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSxcbiAgICB9LFxuICBdKTtcblxuICBhc3NlcnQuZGVlcEVxdWFsKHVzYWdlLCB7XG4gICAgYnJpbGxpYW50VXNlZENvdW50OiAxLFxuICAgIGJyaWxsaWFudE1vdmVOdW1iZXJzOiBbMV0sXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2JyaWxsaWFudCBidWRnZXQgaXMgY29uc3VtZWQgb25seSBhZnRlciBhIHN1Y2Nlc3NmdWwgZW5naW5lIG1vdmUgYW5kIHJvbGxzIGJhY2sgb24gdW5kby9yZWRvJywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0JywgdHJ1ZSk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldEJyaWxsaWFudE1vdmVzUGVyR2FtZSgyKTtcblxuICBjb25zdCBpbnZhbGlkTW92ZSA9IGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdhMWExJywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKGludmFsaWRNb3ZlLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuXG4gIGNvbnN0IHN1Y2Nlc3NmdWxNb3ZlID0gYXdhaXQgYm9hcmRWaWV3TW9kZWwubWFrZU1vdmVVQ0koJ2UyZTQnLCB7IGNvbnN1bWVkQnJpbGxpYW50OiB0cnVlIH0pO1xuICBhc3NlcnQuZXF1YWwoc3VjY2Vzc2Z1bE1vdmUsIHRydWUpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAxKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRNb3ZlTnVtYmVycywgWzFdKTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwudW5kb1NpbmdsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG4gIGFzc2VydC5kZWVwRXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZU51bWJlcnMsIFtdKTtcblxuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwucmVkb1NpbmdsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZU51bWJlcnMsIFsxXSk7XG59KTtcblxudGVzdCgnbmV3IEZFTiwgUEdOLCBhbmQgb3BlbmluZyBsb2FkcyByZXNldCBicmlsbGlhbnQgc3RhdGUgYW5kIFBHTiBzdGFydCBGRU4gdXBkYXRlcyBnYW1lIHN0YXJ0JywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCwgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBQUkVERUZJTkVEX09QRU5JTkdTIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvb3BlbmluZ3MnKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0JywgdHJ1ZSk7XG4gIGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdlMmU0JywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG5cbiAgYm9hcmRWaWV3TW9kZWwubG9hZEZlbignOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxJyk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuXG4gIGJvYXJkVmlld01vZGVsLmxvYWRQZ24oJ1tTZXRVcCBcIjFcIl1cXG5bRkVOIFwiOC84LzgvOC84LzgvOC9LNmsgdyAtIC0gMCAxXCJdXFxuXFxuMS4gS2EyIConKTtcbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLmdhbWVTdGFydEZlbiwgJzgvOC84LzgvOC84LzgvSzZrIHcgLSAtIDAgMScpO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcblxuICBhd2FpdCBib2FyZFZpZXdNb2RlbC5tYWtlTW92ZVVDSSgnaDFoMicsIHsgY29uc3VtZWRCcmlsbGlhbnQ6IHRydWUgfSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDEpO1xuXG4gIGJvYXJkVmlld01vZGVsLmxvYWRQZ24oUFJFREVGSU5FRF9PUEVOSU5HU1swXS5wZ24pO1xuICBhc3NlcnQuZXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50VXNlZENvdW50LCAwKTtcbn0pO1xuXG50ZXN0KCdzb2x2ZU5leHRNb3ZlIGRyb3BzIHN0YWxlIGRlbGF5ZWQgYXV0b3BsYXkgbW92ZXMgc2FmZWx5JywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBib2FyZFZpZXdNb2RlbCwgZW5naW5lVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCwgY29uZmlnVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG5cbiAgYm9hcmRWaWV3TW9kZWwucmVzZXQoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwucmVzZXRUb0RlZmF1bHRzKCk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldE9wdGlvbigndXNlSHVtYW5EZWxheVNpbXVsYXRpb24nLCB0cnVlKTtcbiAgY29uZmlnVmlld01vZGVsLmFwcGx5UHJlc2V0KCdtZWRpdW0nKTtcblxuICBjb25zdCBvcmlnaW5hbEluaXRpYWxpemUgPSBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZS5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHl6ZVBvc2l0aW9uID0gZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbi5iaW5kKGVuZ2luZVZpZXdNb2RlbCk7XG4gIGNvbnN0IG9yaWdpbmFsUGlja01vdmUgPSBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMuYmluZChlbmdpbmVWaWV3TW9kZWwpO1xuXG4gIGxldCByZWxlYXNlRGVsYXk6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuXG4gIGVuZ2luZVZpZXdNb2RlbC5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgZW5naW5lVmlld01vZGVsLmluaXRpYWxpemUgPSBhc3luYyAoKSA9PiB1bmRlZmluZWQ7XG4gIGVuZ2luZVZpZXdNb2RlbC5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoZmVuOiBzdHJpbmcpID0+ICh7XG4gICAgcmVxdWVzdElkOiAxLFxuICAgIGFuYWx5emVkRmVuOiBmZW4sXG4gICAgbW92ZXM6IFtcbiAgICAgIHtcbiAgICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgICBldmFsdWF0aW9uOiAzMCxcbiAgICAgICAgZXZhbExvc3M6IDAsXG4gICAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgICAgbXVsdGlwdjogMSxcbiAgICAgICAgZGVwdGg6IDgsXG4gICAgICAgIGJ1Y2tldDogJ2Jlc3QnLFxuICAgICAgfSxcbiAgICBdLFxuICAgIGNvbXBsZXhpdHk6IHtcbiAgICAgIGxldmVsOiAnbWVkaXVtJyxcbiAgICAgIHNjb3JlOiAwLjUsXG4gICAgICBzcHJlYWQ6IDMwLFxuICAgICAgY2xvc2VDYW5kaWRhdGVzOiAyLFxuICAgICAgdm9sYXRpbGl0eTogMjAsXG4gICAgfSxcbiAgICBpZ25vcmVkOiBmYWxzZSxcbiAgICBmcm9tQ2FjaGU6IGZhbHNlLFxuICAgIHB1cnBvc2U6ICdlbmdpbmVNb3ZlJyxcbiAgfSk7XG4gIGVuZ2luZVZpZXdNb2RlbC5waWNrTW92ZUZyb21BbmFseXNpcyA9ICgpID0+ICh7XG4gICAgbW92ZToge1xuICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgZXZhbHVhdGlvbjogMzAsXG4gICAgICBldmFsTG9zczogMCxcbiAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgIG11bHRpcHY6IDEsXG4gICAgICBkZXB0aDogOCxcbiAgICAgIGJ1Y2tldDogJ2Jlc3QnLFxuICAgIH0sXG4gICAgYnVja2V0OiAnYmVzdCcsXG4gICAgaXNCcmlsbGlhbnQ6IGZhbHNlLFxuICB9KTtcblxuICAoYm9hcmRWaWV3TW9kZWwgYXMgdW5rbm93biBhcyB7IHdhaXQ6IChkZWxheU1zOiBudW1iZXIpID0+IFByb21pc2U8dm9pZD4gfSkud2FpdCA9ICgpID0+XG4gICAgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIHJlbGVhc2VEZWxheSA9IHJlc29sdmU7XG4gICAgfSk7XG5cbiAgY29uc3QgcGVuZGluZ01vdmUgPSBib2FyZFZpZXdNb2RlbC5zb2x2ZU5leHRNb3ZlKHRydWUpO1xuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgMCk7XG4gIH0pO1xuICBib2FyZFZpZXdNb2RlbC5sb2FkRmVuKCc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnKTtcbiAgcmVsZWFzZURlbGF5Py4oKTtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGVuZGluZ01vdmU7XG5cbiAgYXNzZXJ0LmVxdWFsKHJlc3VsdCwgbnVsbCk7XG4gIGFzc2VydC5lcXVhbChib2FyZFZpZXdNb2RlbC5mZW4sICc4LzgvOC84LzgvOC84L0s2ayB3IC0gLSAwIDEnKTtcblxuICBlbmdpbmVWaWV3TW9kZWwuaW5pdGlhbGl6ZSA9IG9yaWdpbmFsSW5pdGlhbGl6ZTtcbiAgZW5naW5lVmlld01vZGVsLmFuYWx5emVQb3NpdGlvbiA9IG9yaWdpbmFsQW5hbHl6ZVBvc2l0aW9uO1xuICBlbmdpbmVWaWV3TW9kZWwucGlja01vdmVGcm9tQW5hbHlzaXMgPSBvcmlnaW5hbFBpY2tNb3ZlO1xufSk7XG5cbnRlc3QoJ2JhY2tncm91bmQgYW5hbHlzaXMgZG9lcyBub3QgY2FuY2VsIGEgdmFsaWQgcGVuZGluZyBlbmdpbmUgbW92ZSByZXF1ZXN0JywgYXN5bmMgKCkgPT4ge1xuICBsb2NhbFN0b3JhZ2VNb2NrLmNsZWFyKCk7XG5cbiAgY29uc3QgeyBFbmdpbmVWaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL3ZpZXdtb2RlbHMnKTtcbiAgY29uc3QgeyBzdG9ja2Zpc2hTZXJ2aWNlIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvc3RvY2tmaXNoLnNlcnZpY2UnKTtcbiAgY29uc3QgZW5naW5lID0gbmV3IEVuZ2luZVZpZXdNb2RlbCgpO1xuXG4gIGNvbnN0IG9yaWdpbmFsSW5pdGlhbGl6ZSA9IGVuZ2luZS5pbml0aWFsaXplLmJpbmQoZW5naW5lKTtcbiAgY29uc3Qgb3JpZ2luYWxBbmFseXplID0gc3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24uYmluZChzdG9ja2Zpc2hTZXJ2aWNlKTtcbiAgY29uc3Qgb3JpZ2luYWxDb25maWd1cmUgPSBzdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZS5iaW5kKHN0b2NrZmlzaFNlcnZpY2UpO1xuICBjb25zdCBvcmlnaW5hbFN0b3AgPSBzdG9ja2Zpc2hTZXJ2aWNlLnN0b3AuYmluZChzdG9ja2Zpc2hTZXJ2aWNlKTtcblxuICBsZXQgcmVsZWFzZUFuYWx5c2lzOiAoKCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcbiAgbGV0IGFuYWx5emVDYWxscyA9IDA7XG5cbiAgZW5naW5lLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IGFzeW5jICgpID0+IHVuZGVmaW5lZDtcbiAgc3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSAoKSA9PiB1bmRlZmluZWQ7XG4gIHN0b2NrZmlzaFNlcnZpY2Uuc3RvcCA9ICgpID0+IHVuZGVmaW5lZDtcbiAgc3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgYW5hbHl6ZUNhbGxzICs9IDE7XG4gICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIHJlbGVhc2VBbmFseXNpcyA9IHJlc29sdmU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBtb3ZlOiAnZTJlNCcsXG4gICAgICAgIGV2YWx1YXRpb246IDQyLFxuICAgICAgICBldmFsTG9zczogMCxcbiAgICAgICAgcHY6IFsnZTJlNCddLFxuICAgICAgICBtdWx0aXB2OiAxLFxuICAgICAgICBkZXB0aDogMTAsXG4gICAgICB9LFxuICAgIF07XG4gIH07XG5cbiAgY29uc3QgZW5naW5lTW92ZVByb21pc2UgPSBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tc2hhcmVkJywgMTAsIDIsICdlbmdpbmVNb3ZlJyk7XG4gIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDApKTtcbiAgY29uc3QgYmFja2dyb3VuZFByb21pc2UgPSBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tc2hhcmVkJywgMTAsIDIsICdiYWNrZ3JvdW5kJyk7XG5cbiAgcmVsZWFzZUFuYWx5c2lzPy4oKTtcblxuICBjb25zdCBbZW5naW5lTW92ZVJlc3VsdCwgYmFja2dyb3VuZFJlc3VsdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbZW5naW5lTW92ZVByb21pc2UsIGJhY2tncm91bmRQcm9taXNlXSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGFuYWx5emVDYWxscywgMSk7XG4gIGFzc2VydC5lcXVhbChlbmdpbmVNb3ZlUmVzdWx0Lmlnbm9yZWQsIGZhbHNlKTtcbiAgYXNzZXJ0LmVxdWFsKGJhY2tncm91bmRSZXN1bHQuaWdub3JlZCwgZmFsc2UpO1xuICBhc3NlcnQuZXF1YWwoYmFja2dyb3VuZFJlc3VsdC5hbmFseXplZEZlbiwgJ2Zlbi1zaGFyZWQnKTtcblxuICBlbmdpbmUuaW5pdGlhbGl6ZSA9IG9yaWdpbmFsSW5pdGlhbGl6ZTtcbiAgc3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBvcmlnaW5hbEFuYWx5emU7XG4gIHN0b2NrZmlzaFNlcnZpY2UuY29uZmlndXJlID0gb3JpZ2luYWxDb25maWd1cmU7XG4gIHN0b2NrZmlzaFNlcnZpY2Uuc3RvcCA9IG9yaWdpbmFsU3RvcDtcbn0pO1xuXG50ZXN0KCdyZXN0b3JlZCBtb3ZlIGFubm90YXRpb25zIHByZXNlcnZlIGJyaWxsaWFudCB1bmRvL3JlZG8gdHJhY2tpbmcgYWZ0ZXIgcmVzdGFydCcsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgQm9hcmRWaWV3TW9kZWwsIGJvYXJkVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuXG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnJlc2V0VG9EZWZhdWx0cygpO1xuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5zZXRPcHRpb24oJ3BlcnNpc3RFbmdpbmVDb25maWcnLCB0cnVlKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0JywgdHJ1ZSk7XG4gIGZlYXR1cmVPcHRpb25zVmlld01vZGVsLnNldEJyaWxsaWFudE1vdmVzUGVyR2FtZSgyKTtcblxuICBib2FyZFZpZXdNb2RlbC5yZXNldCgpO1xuICBjb25zdCBtb3ZlQXBwbGllZCA9IGF3YWl0IGJvYXJkVmlld01vZGVsLm1ha2VNb3ZlVUNJKCdlMmU0JywgeyBjb25zdW1lZEJyaWxsaWFudDogdHJ1ZSB9KTtcbiAgYXNzZXJ0LmVxdWFsKG1vdmVBcHBsaWVkLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG5cbiAgYXNzZXJ0LmVxdWFsKGJvYXJkVmlld01vZGVsLnVuZG9TaW5nbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5icmlsbGlhbnRVc2VkQ291bnQsIDApO1xuICBhc3NlcnQuZXF1YWwoYm9hcmRWaWV3TW9kZWwuY2FuUmVkbywgdHJ1ZSk7XG5cbiAgY29uc3QgcmVzdG9yZWRCb2FyZCA9IG5ldyBCb2FyZFZpZXdNb2RlbCgpO1xuICBhc3NlcnQuZXF1YWwocmVzdG9yZWRCb2FyZC5jYW5SZWRvLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG5cbiAgYXNzZXJ0LmVxdWFsKHJlc3RvcmVkQm9hcmQucmVkb1NpbmdsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMSk7XG4gIGFzc2VydC5kZWVwRXF1YWwoZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuYnJpbGxpYW50TW92ZU51bWJlcnMsIFsxXSk7XG5cbiAgYXNzZXJ0LmVxdWFsKHJlc3RvcmVkQm9hcmQudW5kb1NpbmdsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGZlYXR1cmVPcHRpb25zVmlld01vZGVsLmJyaWxsaWFudFVzZWRDb3VudCwgMCk7XG59KTtcblxudGVzdCgnY2FjaGUtaGl0IGluZGljYXRvciByZWZsZWN0cyB3aGV0aGVyIGFuYWx5c2lzIGNhbWUgZnJvbSBjYWNoZScsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgRW5naW5lVmlld01vZGVsLCBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IHN0b2NrZmlzaFNlcnZpY2UgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9zdG9ja2Zpc2guc2VydmljZScpO1xuICBjb25zdCB7IGFuYWx5c2lzQ2FjaGUgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9hbmFseXNpc0NhY2hlJyk7XG4gIGNvbnN0IGVuZ2luZSA9IG5ldyBFbmdpbmVWaWV3TW9kZWwoKTtcblxuICBjb25zdCBvcmlnaW5hbEluaXRpYWxpemUgPSBlbmdpbmUuaW5pdGlhbGl6ZS5iaW5kKGVuZ2luZSk7XG4gIGNvbnN0IG9yaWdpbmFsQW5hbHl6ZSA9IHN0b2NrZmlzaFNlcnZpY2UuYW5hbHl6ZVBvc2l0aW9uLmJpbmQoc3RvY2tmaXNoU2VydmljZSk7XG4gIGNvbnN0IG9yaWdpbmFsQ29uZmlndXJlID0gc3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUuYmluZChzdG9ja2Zpc2hTZXJ2aWNlKTtcblxuICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbC5yZXNldFRvRGVmYXVsdHMoKTtcbiAgZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwuc2V0T3B0aW9uKCd1c2VNb3ZlQW5hbHlzaXNDYWNoZScsIHRydWUpO1xuICBhbmFseXNpc0NhY2hlLmludmFsaWRhdGUoKTtcblxuICBlbmdpbmUuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gIGVuZ2luZS5pbml0aWFsaXplID0gYXN5bmMgKCkgPT4gdW5kZWZpbmVkO1xuICBzdG9ja2Zpc2hTZXJ2aWNlLmNvbmZpZ3VyZSA9ICgpID0+IHVuZGVmaW5lZDtcbiAgc3RvY2tmaXNoU2VydmljZS5hbmFseXplUG9zaXRpb24gPSBhc3luYyAoKSA9PiBbXG4gICAge1xuICAgICAgbW92ZTogJ2UyZTQnLFxuICAgICAgZXZhbHVhdGlvbjogMzUsXG4gICAgICBldmFsTG9zczogMCxcbiAgICAgIHB2OiBbJ2UyZTQnXSxcbiAgICAgIG11bHRpcHY6IDEsXG4gICAgICBkZXB0aDogMTIsXG4gICAgfSxcbiAgXTtcblxuICBjb25zdCBmaXJzdCA9IGF3YWl0IGVuZ2luZS5hbmFseXplUG9zaXRpb24oJ2Zlbi1jYWNoZScsIDEyLCAyLCAnYmFja2dyb3VuZCcpO1xuICBjb25zdCBzZWNvbmQgPSBhd2FpdCBlbmdpbmUuYW5hbHl6ZVBvc2l0aW9uKCdmZW4tY2FjaGUnLCAxMiwgMiwgJ2JhY2tncm91bmQnKTtcblxuICBhc3NlcnQuZXF1YWwoZmlyc3QuZnJvbUNhY2hlLCBmYWxzZSk7XG4gIGFzc2VydC5lcXVhbChzZWNvbmQuZnJvbUNhY2hlLCB0cnVlKTtcbiAgYXNzZXJ0LmVxdWFsKGVuZ2luZS5sYXN0QW5hbHlzaXNGcm9tQ2FjaGUsIHRydWUpO1xuXG4gIGVuZ2luZS5pbml0aWFsaXplID0gb3JpZ2luYWxJbml0aWFsaXplO1xuICBzdG9ja2Zpc2hTZXJ2aWNlLmFuYWx5emVQb3NpdGlvbiA9IG9yaWdpbmFsQW5hbHl6ZTtcbiAgc3RvY2tmaXNoU2VydmljZS5jb25maWd1cmUgPSBvcmlnaW5hbENvbmZpZ3VyZTtcbn0pO1xuXG50ZXN0KCdwZXJzb25hIHByb2ZpbGVzIHNhdmUgYW5kIGxvYWQgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBzbmFwc2hvdCcsIGFzeW5jICgpID0+IHtcbiAgbG9jYWxTdG9yYWdlTW9jay5jbGVhcigpO1xuXG4gIGNvbnN0IHsgUGVyc29uYVByb2ZpbGVzVmlld01vZGVsIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy92aWV3bW9kZWxzJyk7XG4gIGNvbnN0IHsgREVGQVVMVF9CVUNLRVRfQ09ORklHIH0gPSBhd2FpdCBpbXBvcnQoJy4uL3NyYy9lbmdpbmUvdHlwZXMnKTtcbiAgY29uc3QgeyBERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL2ZlYXR1cmVPcHRpb25zJyk7XG5cbiAgbGV0IGFwcGxpZWRDb25maWc6IHVua25vd24gPSBudWxsO1xuICBsZXQgYXBwbGllZEZlYXR1cmVPcHRpb25zOiB1bmtub3duID0gbnVsbDtcbiAgbGV0IGFwcGxpZWRCcmlsbGlhbnRTZXR0aW5nczogdW5rbm93biA9IG51bGw7XG4gIGxldCBhcHBsaWVkVWk6IHVua25vd24gPSBudWxsO1xuXG4gIGNvbnN0IHByb2ZpbGVzID0gbmV3IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCh7XG4gICAgY29uZmlnVmlld01vZGVsOiB7XG4gICAgICBidWNrZXRDb25maWc6IHtcbiAgICAgICAgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHLFxuICAgICAgICBiZXN0OiAyOCxcbiAgICAgICAgZ3JlYXQ6IDIyLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRQcmVzZXRJZDogJ2FnZ3Jlc3NpdmUnLFxuICAgICAgZGVwdGg6IDEzLFxuICAgICAgbXVsdGlQVjogNyxcbiAgICAgIGFwcGx5UHJvZmlsZVNuYXBzaG90OiAoc25hcHNob3QpID0+IHtcbiAgICAgICAgYXBwbGllZENvbmZpZyA9IHNuYXBzaG90O1xuICAgICAgfSxcbiAgICB9LFxuICAgIGZlYXR1cmVPcHRpb25zVmlld01vZGVsOiB7XG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIC4uLkRFRkFVTFRfRkVBVFVSRV9PUFRJT05TLFxuICAgICAgICB1c2VEZXRlcm1pbmlzdGljUm5nOiB0cnVlLFxuICAgICAgICB1c2VNb3ZlQW5hbHlzaXNDYWNoZTogZmFsc2UsXG4gICAgICAgIHVzZUJyaWxsaWFudE1vdmVCdWRnZXQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAzLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnbWlkZGxlZ2FtZScsXG4gICAgICBhcHBseVByb2ZpbGVTZXR0aW5nczogKG9wdGlvbnMsIGJyaWxsaWFudCkgPT4ge1xuICAgICAgICBhcHBsaWVkRmVhdHVyZU9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICBhcHBsaWVkQnJpbGxpYW50U2V0dGluZ3MgPSBicmlsbGlhbnQ7XG4gICAgICB9LFxuICAgIH0sXG4gICAgdWlTdGF0ZVZpZXdNb2RlbDoge1xuICAgICAgdGhlbWVNb2RlOiAncGVyc29uYScsXG4gICAgICBiYXNpY01vZGU6IGZhbHNlLFxuICAgICAgYXBwbHlQcm9maWxlUHJlZmVyZW5jZXM6IChwcmVmZXJlbmNlcykgPT4ge1xuICAgICAgICBhcHBsaWVkVWkgPSBwcmVmZXJlbmNlcztcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgcHJvZmlsZXMuc2V0UHJvZmlsZU5hbWVEcmFmdCgnU2hhcnAgVGFjdGljaWFuJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5zYXZlQ3VycmVudFByb2ZpbGUoKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlcy5sZW5ndGgsIDEpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/Lm5hbWUsICdTaGFycCBUYWN0aWNpYW4nKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnByb2ZpbGVzWzBdPy5zZXR0aW5ncy5kZXB0aCwgMTMpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLmZlYXR1cmVPcHRpb25zLnVzZURldGVybWluaXN0aWNSbmcsIHRydWUpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLmJyaWxsaWFudC5icmlsbGlhbnRNb3Zlc1BlckdhbWUsIDMpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLnVpLnRoZW1lTW9kZSwgJ3BlcnNvbmEnKTtcblxuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMubG9hZFNlbGVjdGVkUHJvZmlsZSgpLCB0cnVlKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChhcHBsaWVkQ29uZmlnLCB7XG4gICAgYnVja2V0Q29uZmlnOiB7XG4gICAgICAuLi5ERUZBVUxUX0JVQ0tFVF9DT05GSUcsXG4gICAgICBiZXN0OiAyOCxcbiAgICAgIGdyZWF0OiAyMixcbiAgICB9LFxuICAgIGN1cnJlbnRQcmVzZXRJZDogJ2FnZ3Jlc3NpdmUnLFxuICAgIGRlcHRoOiAxMyxcbiAgICBtdWx0aVBWOiA3LFxuICB9KTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChhcHBsaWVkRmVhdHVyZU9wdGlvbnMsIHtcbiAgICAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyxcbiAgICB1c2VEZXRlcm1pbmlzdGljUm5nOiB0cnVlLFxuICAgIHVzZU1vdmVBbmFseXNpc0NhY2hlOiBmYWxzZSxcbiAgICB1c2VCcmlsbGlhbnRNb3ZlQnVkZ2V0OiB0cnVlLFxuICB9KTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChhcHBsaWVkQnJpbGxpYW50U2V0dGluZ3MsIHtcbiAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IDMsXG4gICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnbWlkZGxlZ2FtZScsXG4gIH0pO1xuICBhc3NlcnQuZGVlcEVxdWFsKGFwcGxpZWRVaSwge1xuICAgIHRoZW1lTW9kZTogJ3BlcnNvbmEnLFxuICAgIGJhc2ljTW9kZTogZmFsc2UsXG4gIH0pO1xufSk7XG5cbnRlc3QoJ3BlcnNvbmEgcHJvZmlsZSBpbXBvcnQgdmFsaWRhdGVzIEpTT04gc2FmZWx5IGFuZCBkZWR1cGxpY2F0ZXMgbmFtZXMnLCBhc3luYyAoKSA9PiB7XG4gIGxvY2FsU3RvcmFnZU1vY2suY2xlYXIoKTtcblxuICBjb25zdCB7IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvdmlld21vZGVscycpO1xuICBjb25zdCB7IERFRkFVTFRfQlVDS0VUX0NPTkZJRyB9ID0gYXdhaXQgaW1wb3J0KCcuLi9zcmMvZW5naW5lL3R5cGVzJyk7XG4gIGNvbnN0IHsgREVGQVVMVF9GRUFUVVJFX09QVElPTlMgfSA9IGF3YWl0IGltcG9ydCgnLi4vc3JjL2VuZ2luZS9mZWF0dXJlT3B0aW9ucycpO1xuXG4gIGNvbnN0IHByb2ZpbGVzID0gbmV3IFBlcnNvbmFQcm9maWxlc1ZpZXdNb2RlbCh7XG4gICAgY29uZmlnVmlld01vZGVsOiB7XG4gICAgICBidWNrZXRDb25maWc6IHsgLi4uREVGQVVMVF9CVUNLRVRfQ09ORklHIH0sXG4gICAgICBjdXJyZW50UHJlc2V0SWQ6ICdtZWRpdW0nLFxuICAgICAgZGVwdGg6IDgsXG4gICAgICBtdWx0aVBWOiAxMixcbiAgICAgIGFwcGx5UHJvZmlsZVNuYXBzaG90OiAoKSA9PiB1bmRlZmluZWQsXG4gICAgfSxcbiAgICBmZWF0dXJlT3B0aW9uc1ZpZXdNb2RlbDoge1xuICAgICAgb3B0aW9uczogeyAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyB9LFxuICAgICAgYnJpbGxpYW50TW92ZXNQZXJHYW1lOiAwLFxuICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnYW55JyxcbiAgICAgIGFwcGx5UHJvZmlsZVNldHRpbmdzOiAoKSA9PiB1bmRlZmluZWQsXG4gICAgfSxcbiAgICB1aVN0YXRlVmlld01vZGVsOiB7XG4gICAgICB0aGVtZU1vZGU6ICdkYXJrJyxcbiAgICAgIGJhc2ljTW9kZTogdHJ1ZSxcbiAgICAgIGFwcGx5UHJvZmlsZVByZWZlcmVuY2VzOiAoKSA9PiB1bmRlZmluZWQsXG4gICAgfSxcbiAgfSk7XG5cbiAgcHJvZmlsZXMuc2V0UHJvZmlsZU5hbWVEcmFmdCgnQmFsYW5jZWQnKTtcbiAgYXNzZXJ0LmVxdWFsKHByb2ZpbGVzLnNhdmVDdXJyZW50UHJvZmlsZSgpLCB0cnVlKTtcblxuICBwcm9maWxlcy5zZXRFeGNoYW5nZUpzb24oJ3tiYWQganNvbicpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMuaW1wb3J0UHJvZmlsZUZyb21Kc29uKCksIGZhbHNlKTtcbiAgYXNzZXJ0Lm1hdGNoKHByb2ZpbGVzLmltcG9ydEVycm9yLCAvY291bGQgbm90IGJlIHBhcnNlZC9pKTtcblxuICBwcm9maWxlcy5zZXRFeGNoYW5nZUpzb24oXG4gICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAga2luZDogJ3BlcnNvbmFjaGVzcy5wZXJzb25hLXByb2ZpbGUnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIG5hbWU6ICdCYWxhbmNlZCcsXG4gICAgICBzZXR0aW5nczoge1xuICAgICAgICBidWNrZXRDb25maWc6IERFRkFVTFRfQlVDS0VUX0NPTkZJRyxcbiAgICAgICAgY3VycmVudFByZXNldElkOiAnaGFyZCcsXG4gICAgICAgIGRlcHRoOiAxNSxcbiAgICAgICAgbXVsdGlQVjogNCxcbiAgICAgICAgZmVhdHVyZU9wdGlvbnM6IHtcbiAgICAgICAgICAuLi5ERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyxcbiAgICAgICAgICB1c2VEZXRlcm1pbmlzdGljUm5nOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBicmlsbGlhbnQ6IHtcbiAgICAgICAgICBicmlsbGlhbnRNb3Zlc1BlckdhbWU6IDIsXG4gICAgICAgICAgYnJpbGxpYW50QWxsb3dlZFBoYXNlOiAnZW5kZ2FtZScsXG4gICAgICAgIH0sXG4gICAgICAgIHVpOiB7XG4gICAgICAgICAgdGhlbWVNb2RlOiAnbGlnaHQnLFxuICAgICAgICAgIGJhc2ljTW9kZTogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pLFxuICApO1xuXG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5pbXBvcnRQcm9maWxlRnJvbUpzb24oKSwgdHJ1ZSk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlcy5sZW5ndGgsIDIpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/Lm5hbWUsICdCYWxhbmNlZCAyJyk7XG4gIGFzc2VydC5lcXVhbChwcm9maWxlcy5wcm9maWxlc1swXT8uc2V0dGluZ3MuY3VycmVudFByZXNldElkLCAnaGFyZCcpO1xuICBhc3NlcnQuZXF1YWwocHJvZmlsZXMucHJvZmlsZXNbMF0/LnNldHRpbmdzLnVpLnRoZW1lTW9kZSwgJ2xpZ2h0Jyk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVFPLFNBQVMsdUJBQ2QsV0FDQSxpQkFDUztBQUNULFNBQU8sY0FBYztBQUN2QjtBQUVPLFNBQVMscUJBQ2QsWUFDQSxhQUNTO0FBQ1QsU0FBTyxlQUFlO0FBQ3hCO0FBcEJBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVNPLFNBQVMsc0JBQ2QsS0FDQSxPQUNBLFNBQ1E7QUFDUixTQUFPLEdBQUcsR0FBRyxVQUFVLEtBQUssWUFBWSxPQUFPO0FBQ2pEO0FBZkEsSUFpQmEsZUFxREE7QUF0RWI7QUFBQTtBQUFBO0FBaUJPLElBQU0sZ0JBQU4sTUFBb0I7QUFBQSxNQUd6QixZQUFvQixVQUFrQixLQUFLO0FBQXZCO0FBQUEsTUFBd0I7QUFBQSxNQUZwQyxVQUFVLG9CQUFJLElBQWdDO0FBQUEsTUFJdEQsVUFBVSxTQUF1QjtBQUMvQixhQUFLLFVBQVUsS0FBSyxJQUFJLEdBQUcsT0FBTztBQUNsQyxhQUFLLEtBQUs7QUFBQSxNQUNaO0FBQUEsTUFFQSxJQUFJLEtBQXdDO0FBQzFDLGNBQU0sUUFBUSxLQUFLLFFBQVEsSUFBSSxHQUFHO0FBRWxDLFlBQUksQ0FBQyxPQUFPO0FBQ1YsaUJBQU87QUFBQSxRQUNUO0FBRUEsYUFBSyxRQUFRLE9BQU8sR0FBRztBQUN2QixhQUFLLFFBQVEsSUFBSSxLQUFLLEtBQUs7QUFDM0IsZUFBTztBQUFBLE1BQ1Q7QUFBQSxNQUVBLElBQUksT0FBaUM7QUFDbkMsYUFBSyxRQUFRLElBQUksTUFBTSxLQUFLLEtBQUs7QUFDakMsYUFBSyxLQUFLO0FBQUEsTUFDWjtBQUFBLE1BRUEsV0FBVyxLQUFvQjtBQUM3QixZQUFJLEtBQUs7QUFDUCxlQUFLLFFBQVEsT0FBTyxHQUFHO0FBQ3ZCO0FBQUEsUUFDRjtBQUVBLGFBQUssUUFBUSxNQUFNO0FBQUEsTUFDckI7QUFBQSxNQUVBLElBQUksT0FBZTtBQUNqQixlQUFPLEtBQUssUUFBUTtBQUFBLE1BQ3RCO0FBQUEsTUFFUSxPQUFhO0FBQ25CLGVBQU8sS0FBSyxRQUFRLE9BQU8sS0FBSyxTQUFTO0FBQ3ZDLGdCQUFNLFlBQVksS0FBSyxRQUFRLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFFN0MsY0FBSSxDQUFDLFdBQVc7QUFDZDtBQUFBLFVBQ0Y7QUFFQSxlQUFLLFFBQVEsT0FBTyxTQUFTO0FBQUEsUUFDL0I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVPLElBQU0sZ0JBQWdCLElBQUksY0FBYztBQUFBO0FBQUE7OztBQ3RFL0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTUEsU0FBUyxXQUFXLE9BQXVCO0FBQ3pDLE1BQUksT0FBTztBQUVYLFdBQVMsUUFBUSxHQUFHLFFBQVEsTUFBTSxRQUFRLFNBQVMsR0FBRztBQUNwRCxZQUFRLE1BQU0sV0FBVyxLQUFLO0FBQzlCLFdBQU8sS0FBSyxLQUFLLE1BQU0sUUFBUTtBQUFBLEVBQ2pDO0FBRUEsU0FBTyxTQUFTO0FBQ2xCO0FBRUEsU0FBUyxXQUFXLE1BQTRCO0FBQzlDLE1BQUksUUFBUSxTQUFTO0FBRXJCLFNBQU8sTUFBTTtBQUNYLGFBQVM7QUFDVCxRQUFJLFNBQVMsS0FBSyxLQUFLLFFBQVMsVUFBVSxJQUFLLFFBQVEsQ0FBQztBQUN4RCxjQUFVLFNBQVMsS0FBSyxLQUFLLFNBQVUsV0FBVyxHQUFJLFNBQVMsRUFBRTtBQUNqRSxhQUFTLFNBQVUsV0FBVyxRQUFTLEtBQUs7QUFBQSxFQUM5QztBQUNGO0FBRU8sU0FBUywyQkFBeUM7QUFDdkQsU0FBTztBQUFBLElBQ0wsTUFBTSxNQUFNLEtBQUssT0FBTztBQUFBLEVBQzFCO0FBQ0Y7QUFFTyxTQUFTLHlCQUF5QixNQUE0QjtBQUNuRSxRQUFNLFlBQVksV0FBVyxXQUFXLElBQUksQ0FBQztBQUU3QyxTQUFPO0FBQUEsSUFDTCxNQUFNLE1BQU0sVUFBVTtBQUFBLEVBQ3hCO0FBQ0Y7QUFVTyxTQUFTLHVCQUF1QjtBQUFBLEVBQ3JDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLEdBQXFDO0FBQ25DLFNBQU8sQ0FBQyxjQUFjLFlBQVksT0FBTyxTQUFTLEdBQUcsWUFBWSxPQUFPLEVBQUUsS0FBSyxHQUFHO0FBQ3BGO0FBMURBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFXTyxTQUFTLHNCQUE4QjtBQUM1QyxTQUFPLFdBQVcsS0FBSyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ3RGO0FBRU8sU0FBUyxtQkFDZCxTQUNBLGFBQ1E7QUFDUixTQUFPLFFBQVEsVUFBVSxPQUFPLE9BQU8sUUFBUSxRQUFRLFdBQ25ELFFBQVEsTUFDUjtBQUNOO0FBdEJBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBYU8sU0FBUyxxQkFDZCxhQUNnQjtBQUNoQixRQUFNLHVCQUF1QixZQUMxQixPQUFPLENBQUMsZUFBZSxXQUFXLGlCQUFpQixFQUNuRCxJQUFJLENBQUMsZUFBZSxXQUFXLFVBQVU7QUFFNUMsU0FBTztBQUFBLElBQ0wsb0JBQW9CLHFCQUFxQjtBQUFBLElBQ3pDO0FBQUEsRUFDRjtBQUNGO0FBeEJBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0VBLFNBQVMsdUJBQWdDO0FBQ3ZDLE1BQUksT0FBTyxXQUFXLGVBQWUsT0FBTyxPQUFPLGlCQUFpQixhQUFhO0FBQy9FLFdBQU87QUFBQSxFQUNUO0FBRUEsTUFBSTtBQUNGLFdBQU8sT0FBTyxhQUFhLFFBQVEsaUJBQWlCLE1BQU07QUFBQSxFQUM1RCxRQUFRO0FBQ04sV0FBTztBQUFBLEVBQ1Q7QUFDRjtBQUVBLFNBQVMsdUJBQWdDO0FBQ3ZDLE1BQUksT0FBTyxZQUFZLGFBQWE7QUFDbEMsV0FBTztBQUFBLEVBQ1Q7QUFFQSxTQUFPLFFBQVEsSUFBSSx1QkFBdUI7QUFDNUM7QUFFTyxTQUFTLHdCQUFpQztBQUMvQyxTQUFPLHFCQUFxQixLQUFLLHFCQUFxQjtBQUN4RDtBQUVPLFNBQVMsdUJBQXVCLFNBQXdCO0FBQzdELE1BQUksT0FBTyxXQUFXLGVBQWUsT0FBTyxPQUFPLGlCQUFpQixhQUFhO0FBQy9FO0FBQUEsRUFDRjtBQUVBLE1BQUk7QUFDRixRQUFJLFNBQVM7QUFDWCxhQUFPLGFBQWEsUUFBUSxtQkFBbUIsR0FBRztBQUFBLElBQ3BELE9BQU87QUFDTCxhQUFPLGFBQWEsV0FBVyxpQkFBaUI7QUFBQSxJQUNsRDtBQUFBLEVBQ0YsUUFBUTtBQUFBLEVBRVI7QUFDRjtBQUVPLFNBQVMsa0JBQWtCLE9BQWU7QUFDL0MsU0FBTztBQUFBLElBQ0wsT0FBTyxJQUFJLFNBQW9CO0FBQzdCLFVBQUksc0JBQXNCLEdBQUc7QUFDM0IsZ0JBQVEsSUFBSSxJQUFJLEtBQUssS0FBSyxHQUFHLElBQUk7QUFBQSxNQUNuQztBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU8sSUFBSSxTQUFvQjtBQUM3QixjQUFRLE1BQU0sSUFBSSxLQUFLLEtBQUssR0FBRyxJQUFJO0FBQUEsSUFDckM7QUFBQSxJQUNBLE1BQU0sSUFBSSxTQUFvQjtBQUM1QixjQUFRLEtBQUssSUFBSSxLQUFLLEtBQUssR0FBRyxJQUFJO0FBQUEsSUFDcEM7QUFBQSxFQUNGO0FBQ0Y7QUFFTyxTQUFTLHFCQUE4QjtBQUM1QyxNQUFJLE9BQU8sb0NBQW9DLGFBQWE7QUFDMUQsV0FBTyxRQUFRLCtCQUErQjtBQUFBLEVBQ2hEO0FBRUEsTUFBSTtBQUNGLFdBQU8sUUFBUSxZQUFZLEtBQUssR0FBRztBQUFBLEVBQ3JDLFFBQVE7QUFDTixXQUFPO0FBQUEsRUFDVDtBQUNGO0FBcEVBLElBQU07QUFBTjtBQUFBO0FBQUE7QUFBQSxJQUFNLG9CQUFvQjtBQUFBO0FBQUE7OztBQ0ExQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFXTSxRQUVPLGtCQTZZQTtBQTFaYjtBQUFBO0FBQUE7QUFRQTtBQUdBLElBQU0sU0FBUyxrQkFBa0Isa0JBQWtCO0FBRTVDLElBQU0sbUJBQU4sTUFBdUI7QUFBQSxNQUNwQixTQUF3QjtBQUFBLE1BQ3hCLGtCQUF1QyxvQkFBSSxJQUFJO0FBQUEsTUFDL0MsVUFBVTtBQUFBLE1BQ1YsaUJBQW9DLENBQUM7QUFBQSxNQUNyQyxVQUFVO0FBQUEsTUFDVixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLaEIsTUFBTSxhQUE0QjtBQUNoQyxZQUFJLEtBQUssUUFBUTtBQUNmO0FBQUEsUUFDRjtBQUVBLGVBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3RDLGNBQUk7QUFHRixrQkFBTSxhQUFhO0FBQUEsMkJBQ0EsT0FBTyxTQUFTLE1BQU07QUFBQTtBQUV6QyxrQkFBTSxPQUFPLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDdEUsaUJBQUssU0FBUyxJQUFJLE9BQU8sSUFBSSxnQkFBZ0IsSUFBSSxDQUFDO0FBRWxELGlCQUFLLE9BQU8sWUFBWSxDQUFDLFVBQXdCO0FBQy9DLG9CQUFNLFVBQVUsT0FBTyxNQUFNLFNBQVMsV0FBVyxNQUFNLE9BQU8sT0FBTyxNQUFNLElBQUk7QUFDL0UsbUJBQUssY0FBYyxPQUFPO0FBQUEsWUFDNUI7QUFFQSxpQkFBSyxPQUFPLFVBQVUsQ0FBQyxVQUFVO0FBQy9CLHFCQUFPLE1BQU0saUJBQWlCLEtBQUs7QUFDbkMscUJBQU8sS0FBSztBQUFBLFlBQ2Q7QUFHQSxrQkFBTSxlQUFlLENBQUMsUUFBZ0I7QUFDcEMsa0JBQUksUUFBUSxTQUFTO0FBQ25CLHFCQUFLLFVBQVU7QUFDZixxQkFBSyxxQkFBcUIsWUFBWTtBQUN0QyxxQkFBSyxlQUFlLFFBQVEsT0FBSyxFQUFFLENBQUM7QUFDcEMscUJBQUssaUJBQWlCLENBQUM7QUFDdkIsd0JBQVE7QUFBQSxjQUNWO0FBQUEsWUFDRjtBQUVBLGlCQUFLLGtCQUFrQixZQUFZO0FBR25DLHVCQUFXLE1BQU07QUFDZixtQkFBSyxZQUFZLEtBQUs7QUFBQSxZQUN4QixHQUFHLEdBQUc7QUFBQSxVQUNSLFNBQVMsT0FBTztBQUNkLG1CQUFPLEtBQUs7QUFBQSxVQUNkO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsVUFBZ0I7QUFDZCxZQUFJLEtBQUssUUFBUTtBQUNmLGVBQUssT0FBTyxVQUFVO0FBQ3RCLGVBQUssU0FBUztBQUNkLGVBQUssVUFBVTtBQUFBLFFBQ2pCO0FBQ0EsYUFBSyxnQkFBZ0IsTUFBTTtBQUFBLE1BQzdCO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLUSxZQUFZLFNBQXVCO0FBQ3pDLFlBQUksQ0FBQyxLQUFLLFFBQVE7QUFDaEIsZ0JBQU0sSUFBSSxNQUFNLDJCQUEyQjtBQUFBLFFBQzdDO0FBQ0EsYUFBSyxPQUFPLFlBQVksT0FBTztBQUFBLE1BQ2pDO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLUSxjQUFjLFNBQXVCO0FBQzNDLFlBQUksWUFBWSxRQUFRLFdBQVcsVUFBVSxLQUFLLFlBQVksYUFBYSxZQUFZLFVBQVU7QUFDL0YsaUJBQU8sTUFBTSxZQUFZLE9BQU87QUFBQSxRQUNsQztBQUNBLGFBQUssZ0JBQWdCLFFBQVEsYUFBVyxRQUFRLE9BQU8sQ0FBQztBQUFBLE1BQzFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxrQkFBa0IsU0FBK0I7QUFDL0MsYUFBSyxnQkFBZ0IsSUFBSSxPQUFPO0FBQUEsTUFDbEM7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLHFCQUFxQixTQUErQjtBQUNsRCxhQUFLLGdCQUFnQixPQUFPLE9BQU87QUFBQSxNQUNyQztBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsTUFBTSxlQUE4QjtBQUNsQyxZQUFJLEtBQUssUUFBUztBQUNsQixlQUFPLElBQUksUUFBUSxhQUFXO0FBQzVCLGVBQUssZUFBZSxLQUFLLE9BQU87QUFBQSxRQUNsQyxDQUFDO0FBQUEsTUFDSDtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsV0FBVyxPQUFxQjtBQUM5QixhQUFLLFVBQVU7QUFDZixZQUFJLEtBQUssU0FBUztBQUNoQixlQUFLLFlBQVksZ0NBQWdDLEtBQUssRUFBRTtBQUFBLFFBQzFEO0FBQUEsTUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsU0FBUyxPQUFxQjtBQUM1QixhQUFLLFFBQVE7QUFBQSxNQUNmO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxVQUFVLFNBQXFEO0FBQzdELFlBQUksUUFBUSxZQUFZLFFBQVc7QUFDakMsZUFBSyxXQUFXLFFBQVEsT0FBTztBQUFBLFFBQ2pDO0FBQ0EsWUFBSSxRQUFRLFVBQVUsUUFBVztBQUMvQixlQUFLLFNBQVMsUUFBUSxLQUFLO0FBQUEsUUFDN0I7QUFBQSxNQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxNQUFNLGdCQUFnQixLQUFzQztBQUMxRCxjQUFNLEtBQUssYUFBYTtBQUV4QixlQUFPLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDOUIsZ0JBQU0sUUFBb0Msb0JBQUksSUFBSTtBQUNsRCxjQUFJLFlBQVk7QUFDaEIsY0FBSSxzQkFBc0I7QUFDMUIsY0FBSSxrQkFBa0I7QUFHdEIsZ0JBQU0sbUJBQW1CLE1BQU07QUFDN0IsZ0JBQUksb0JBQXFCO0FBQ3pCLGtDQUFzQjtBQUN0QixpQkFBSyxxQkFBcUIsZUFBZTtBQUV6QyxtQkFBTyxNQUFNLGtDQUFrQyxNQUFNLE1BQU0sT0FBTztBQUdsRSxrQkFBTSxnQkFBZ0MsQ0FBQztBQUV2QyxxQkFBUyxJQUFJLEdBQUcsS0FBSyxLQUFLLFNBQVMsS0FBSztBQUN0QyxvQkFBTSxPQUFPLE1BQU0sSUFBSSxDQUFDO0FBQ3hCLGtCQUFJLFFBQVEsS0FBSyxHQUFHLFNBQVMsR0FBRztBQUM5QixzQkFBTSxXQUFXLEtBQUssSUFBSSxZQUFZLEtBQUssS0FBSztBQUNoRCw4QkFBYyxLQUFLO0FBQUEsa0JBQ2pCLE1BQU0sS0FBSyxHQUFHLENBQUM7QUFBQSxrQkFDZixZQUFZLEtBQUs7QUFBQSxrQkFDakI7QUFBQSxrQkFDQSxJQUFJLEtBQUs7QUFBQSxrQkFDVCxTQUFTLEtBQUs7QUFBQSxrQkFDZCxPQUFPLEtBQUs7QUFBQSxnQkFDZCxDQUFDO0FBQUEsY0FDSDtBQUFBLFlBQ0Y7QUFFQSxnQkFBSSxjQUFjLFNBQVMsR0FBRztBQUM1QixxQkFBTyxNQUFNLGFBQWEsY0FBYyxRQUFRLGdCQUFnQjtBQUNoRSxzQkFBUSxhQUFhO0FBQUEsWUFDdkIsT0FBTztBQUdMLHFCQUFPLE1BQU0sZ0RBQWdEO0FBQzdELHNCQUFRLENBQUMsQ0FBQztBQUFBLFlBQ1o7QUFBQSxVQUNGO0FBR0EsZ0JBQU0sbUJBQW1CLFdBQVcsTUFBTTtBQUN4QyxnQkFBSSxDQUFDLHFCQUFxQjtBQUN4QixxQkFBTyxLQUFLLCtDQUErQztBQUMzRCxtQkFBSyxZQUFZLE1BQU07QUFFdkIseUJBQVcsTUFBTTtBQUNmLG9CQUFJLENBQUMscUJBQXFCO0FBQ3hCLHlCQUFPLEtBQUssK0NBQStDO0FBQzNELG1DQUFpQjtBQUFBLGdCQUNuQjtBQUFBLGNBQ0YsR0FBRyxHQUFJO0FBQUEsWUFDVDtBQUFBLFVBQ0YsR0FBRyxHQUFLO0FBR1IsZ0JBQU0sa0JBQWtCLFdBQVcsTUFBTTtBQUN2QyxnQkFBSSxDQUFDLHFCQUFxQjtBQUN4QixxQkFBTyxNQUFNLG1DQUFtQztBQUNoRCxtQkFBSyxxQkFBcUIsZUFBZTtBQUN6QywyQkFBYSxnQkFBZ0I7QUFDN0IsK0JBQWlCO0FBQUEsWUFDbkI7QUFBQSxVQUNGLEdBQUcsR0FBSztBQUVSLGdCQUFNLGtCQUFrQixDQUFDLFlBQW9CO0FBRTNDLGdCQUFJLFFBQVEsU0FBUyxZQUFZLEdBQUc7QUFFbEMsb0JBQU0sWUFBWSxRQUFRLE1BQU0sb0JBQW9CO0FBQ3BELGtCQUFJLFdBQVc7QUFDYixzQkFBTSxTQUFTLFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRTtBQUN4Qyx1QkFBTyxNQUFNLHdCQUF3QixNQUFNO0FBRTNDLG9CQUFJLFVBQVUsR0FBRztBQUNmLHlCQUFPLE1BQU0sbURBQW1EO0FBQUEsZ0JBQ2xFO0FBQUEsY0FDRjtBQUFBLFlBQ0Y7QUFHQSxnQkFBSSxRQUFRLFdBQVcsTUFBTSxLQUFLLFFBQVEsU0FBUyxTQUFTLEdBQUc7QUFDN0Qsb0JBQU0sT0FBTyxLQUFLLGNBQWMsT0FBTztBQUN2QyxrQkFBSSxNQUFNO0FBQ1Isc0JBQU0sSUFBSSxLQUFLLFNBQVMsSUFBSTtBQUM1QixvQkFBSSxLQUFLLFlBQVksR0FBRztBQUN0Qiw4QkFBWSxLQUFLO0FBQ2pCLG9DQUFrQixLQUFLLElBQUksaUJBQWlCLEtBQUssS0FBSztBQUd0RCxzQkFBSSxLQUFLLFNBQVMsS0FBSyxTQUFTLE1BQU0sUUFBUSxLQUFLLElBQUksR0FBRyxLQUFLLE9BQU8sR0FBRztBQUN2RSwyQkFBTyxNQUFNLHNDQUFzQztBQUNuRCx5QkFBSyxZQUFZLE1BQU07QUFBQSxrQkFDekI7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBR0EsZ0JBQUksUUFBUSxXQUFXLFVBQVUsR0FBRztBQUNsQyxvQ0FBc0I7QUFDdEIsMkJBQWEsZ0JBQWdCO0FBQzdCLDJCQUFhLGVBQWU7QUFDNUIsbUJBQUsscUJBQXFCLGVBQWU7QUFHekMsb0JBQU0sZ0JBQWdCLFFBQVEsTUFBTSxrQkFBa0I7QUFDdEQsa0JBQUksZUFBZTtBQUNqQixzQkFBTSxXQUFXLGNBQWMsQ0FBQztBQUNoQyxvQkFBSSxhQUFhLFlBQVksYUFBYSxVQUFVLGFBQWEsUUFBUTtBQUN2RSx5QkFBTyxNQUFNLHNDQUFzQztBQUNuRCwwQkFBUSxDQUFDLENBQUM7QUFDVjtBQUFBLGdCQUNGO0FBQUEsY0FDRjtBQUVBLHFCQUFPLE1BQU0sZ0NBQWdDLE1BQU0sTUFBTSxPQUFPO0FBR2hFLG9CQUFNLGdCQUFnQyxDQUFDO0FBRXZDLHVCQUFTLElBQUksR0FBRyxLQUFLLEtBQUssU0FBUyxLQUFLO0FBQ3RDLHNCQUFNLE9BQU8sTUFBTSxJQUFJLENBQUM7QUFDeEIsb0JBQUksUUFBUSxLQUFLLEdBQUcsU0FBUyxHQUFHO0FBQzlCLHdCQUFNLFdBQVcsS0FBSyxJQUFJLFlBQVksS0FBSyxLQUFLO0FBQ2hELGdDQUFjLEtBQUs7QUFBQSxvQkFDakIsTUFBTSxLQUFLLEdBQUcsQ0FBQztBQUFBLG9CQUNmLFlBQVksS0FBSztBQUFBLG9CQUNqQjtBQUFBLG9CQUNBLElBQUksS0FBSztBQUFBLG9CQUNULFNBQVMsS0FBSztBQUFBLG9CQUNkLE9BQU8sS0FBSztBQUFBLGtCQUNkLENBQUM7QUFBQSxnQkFDSDtBQUFBLGNBQ0Y7QUFHQSxrQkFBSSxjQUFjLFdBQVcsR0FBRztBQUM5Qix1QkFBTyxNQUFNLG9EQUFvRDtBQUNqRSx3QkFBUSxDQUFDLENBQUM7QUFBQSxjQUNaLE9BQU87QUFDTCx1QkFBTyxNQUFNLGFBQWEsY0FBYyxRQUFRLGdCQUFnQjtBQUNoRSx3QkFBUSxhQUFhO0FBQUEsY0FDdkI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUVBLGVBQUssa0JBQWtCLGVBQWU7QUFHdEMsZ0JBQU0sZUFBZSxDQUFDLFFBQWdCO0FBQ3BDLGdCQUFJLFFBQVEsV0FBVztBQUNyQixtQkFBSyxxQkFBcUIsWUFBWTtBQUN0QyxxQkFBTyxNQUFNLHNEQUFzRDtBQUNuRSxtQkFBSyxZQUFZLGdCQUFnQixHQUFHLEVBQUU7QUFDdEMsbUJBQUssWUFBWSxZQUFZLEtBQUssS0FBSyxFQUFFO0FBQUEsWUFDM0M7QUFBQSxVQUNGO0FBQ0EsZUFBSyxrQkFBa0IsWUFBWTtBQUduQyxpQkFBTyxNQUFNLDhCQUE4QixLQUFLLFlBQVksS0FBSyxTQUFTLFVBQVUsS0FBSyxLQUFLO0FBRTlGLGVBQUssWUFBWSxnQ0FBZ0MsS0FBSyxPQUFPLEVBQUU7QUFDL0QsZUFBSyxZQUFZLFNBQVM7QUFBQSxRQUM1QixDQUFDO0FBQUEsTUFDSDtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS1EsY0FBYyxNQUFvQztBQUN4RCxZQUFJO0FBQ0YsZ0JBQU0sUUFBUSxLQUFLLE1BQU0sR0FBRztBQUU1QixnQkFBTSxnQkFBZ0IsQ0FBQyxRQUErQjtBQUNwRCxrQkFBTSxNQUFNLE1BQU0sUUFBUSxHQUFHO0FBQzdCLG1CQUFPLE9BQU8sS0FBSyxNQUFNLE1BQU0sU0FBUyxJQUFJLE1BQU0sTUFBTSxDQUFDLElBQUk7QUFBQSxVQUMvRDtBQUVBLGdCQUFNLGFBQWEsY0FBYyxTQUFTO0FBQzFDLGdCQUFNLFdBQVcsY0FBYyxPQUFPO0FBRXRDLGNBQUksQ0FBQyxjQUFjLENBQUMsU0FBVSxRQUFPO0FBRXJDLGdCQUFNLFVBQVUsU0FBUyxZQUFZLEVBQUU7QUFDdkMsZ0JBQU0sUUFBUSxTQUFTLFVBQVUsRUFBRTtBQUduQyxjQUFJLFFBQVE7QUFDWixjQUFJO0FBQ0osZ0JBQU0sV0FBVyxNQUFNLFFBQVEsT0FBTztBQUV0QyxjQUFJLFlBQVksS0FBSyxNQUFNLFdBQVcsQ0FBQyxNQUFNLE1BQU07QUFDakQsb0JBQVEsU0FBUyxNQUFNLFdBQVcsQ0FBQyxHQUFHLEVBQUU7QUFBQSxVQUMxQyxXQUFXLFlBQVksS0FBSyxNQUFNLFdBQVcsQ0FBQyxNQUFNLFFBQVE7QUFDMUQsbUJBQU8sU0FBUyxNQUFNLFdBQVcsQ0FBQyxHQUFHLEVBQUU7QUFFdkMsb0JBQVEsT0FBTyxJQUFJLE1BQVEsT0FBTyxNQUFNLE9BQVMsT0FBTztBQUFBLFVBQzFEO0FBR0EsZ0JBQU0sUUFBUSxNQUFNLFFBQVEsSUFBSTtBQUNoQyxnQkFBTSxLQUFLLFNBQVMsSUFBSSxNQUFNLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQztBQUVsRCxpQkFBTztBQUFBLFlBQ0w7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFFBQ0YsUUFBUTtBQUNOLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLE9BQWE7QUFDWCxZQUFJLEtBQUssUUFBUTtBQUNmLGVBQUssWUFBWSxNQUFNO0FBQUEsUUFDekI7QUFBQSxNQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxVQUFnQjtBQUNkLFlBQUksS0FBSyxRQUFRO0FBQ2YsZUFBSyxZQUFZLFlBQVk7QUFBQSxRQUMvQjtBQUFBLE1BQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksY0FBdUI7QUFDekIsZUFBTyxLQUFLO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFHTyxJQUFNLG1CQUFtQixJQUFJLGlCQUFpQjtBQUFBO0FBQUE7OztBQzFackQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQXFEYSx1QkFxQkEsc0JBeUVBLG9CQVVBLGVBVUEsdUJBS0EsZUFVQTtBQXRMYjtBQUFBO0FBQUE7QUFxRE8sSUFBTSx3QkFBc0M7QUFBQSxNQUNqRCxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsTUFDWCxNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixTQUFTO0FBQUEsTUFDVCxTQUFTO0FBQUEsSUFDWDtBQWFPLElBQU0sdUJBQTRDO0FBQUEsTUFDdkQ7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLE1BQU07QUFBQSxVQUNOLFlBQVk7QUFBQSxVQUNaLFNBQVM7QUFBQSxVQUNULFNBQVM7QUFBQSxRQUNYO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLE1BQU07QUFBQSxVQUNOLFlBQVk7QUFBQSxVQUNaLFNBQVM7QUFBQSxVQUNULFNBQVM7QUFBQSxRQUNYO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLE1BQU07QUFBQSxVQUNOLFlBQVk7QUFBQSxVQUNaLFNBQVM7QUFBQSxVQUNULFNBQVM7QUFBQSxRQUNYO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLE1BQU07QUFBQSxVQUNOLFlBQVk7QUFBQSxVQUNaLFNBQVM7QUFBQSxVQUNULFNBQVM7QUFBQSxRQUNYO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxVQUNQLFdBQVc7QUFBQSxVQUNYLE1BQU07QUFBQSxVQUNOLFlBQVk7QUFBQSxVQUNaLFNBQVM7QUFBQSxVQUNULFNBQVM7QUFBQSxRQUNYO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFFTyxJQUFNLHFCQUEyRDtBQUFBLE1BQ3RFLE1BQU0sQ0FBQyxHQUFHLEVBQUU7QUFBQSxNQUNaLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFBQSxNQUNkLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFBQSxNQUNsQixNQUFNLENBQUMsSUFBSSxHQUFHO0FBQUEsTUFDZCxZQUFZLENBQUMsS0FBSyxHQUFHO0FBQUEsTUFDckIsU0FBUyxDQUFDLEtBQUssR0FBRztBQUFBLE1BQ2xCLFNBQVMsQ0FBQyxLQUFLLFFBQVE7QUFBQSxJQUN6QjtBQUVPLElBQU0sZ0JBQTRDO0FBQUEsTUFDdkQsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLE1BQ1AsV0FBVztBQUFBLE1BQ1gsTUFBTTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osU0FBUztBQUFBLE1BQ1QsU0FBUztBQUFBLElBQ1g7QUFFTyxJQUFNLHdCQUEyRDtBQUFBLE1BQ3RFLEdBQUc7QUFBQSxNQUNILFVBQVU7QUFBQSxJQUNaO0FBRU8sSUFBTSxnQkFBNEM7QUFBQSxNQUN2RCxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsTUFDWCxNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixTQUFTO0FBQUEsTUFDVCxTQUFTO0FBQUEsSUFDWDtBQUVPLElBQU0sd0JBQTJEO0FBQUEsTUFDdEUsR0FBRztBQUFBLE1BQ0gsVUFBVTtBQUFBLElBQ1o7QUFBQTtBQUFBOzs7QUN2S08sU0FBUyxhQUFhLE1BQW9DO0FBQy9ELFFBQU0sU0FBUyxxQkFBcUIsS0FBSyxRQUFRO0FBQ2pELFNBQU87QUFBQSxJQUNMLEdBQUc7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUNGO0FBS08sU0FBUyxjQUFjLE9BQXlDO0FBQ3JFLFNBQU8sTUFBTSxJQUFJLFlBQVk7QUFDL0I7QUFLTyxTQUFTLHFCQUFxQixVQUE4QjtBQUNqRSxRQUFNLFVBQVUsS0FBSyxJQUFJLFFBQVE7QUFFakMsYUFBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLE9BQU8sUUFBUSxrQkFBa0IsR0FBRztBQUNyRSxRQUFJLFdBQVcsT0FBTyxVQUFVLEtBQUs7QUFDbkMsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBRUEsU0FBTztBQUNUO0FBS08sU0FBUyxtQkFBbUIsT0FBNEQ7QUFDN0YsUUFBTSxTQUFTLG9CQUFJLElBQWtDO0FBR3JELFFBQU0sVUFBd0IsQ0FBQyxRQUFRLFNBQVMsYUFBYSxRQUFRLGNBQWMsV0FBVyxTQUFTO0FBQ3ZHLFVBQVEsUUFBUSxZQUFVLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBR2hELFFBQU0sUUFBUSxVQUFRO0FBQ3BCLFVBQU0sY0FBYyxPQUFPLElBQUksS0FBSyxNQUFNLEtBQUssQ0FBQztBQUNoRCxnQkFBWSxLQUFLLElBQUk7QUFDckIsV0FBTyxJQUFJLEtBQUssUUFBUSxXQUFXO0FBQUEsRUFDckMsQ0FBQztBQUVELFNBQU87QUFDVDtBQUtPLFNBQVMsYUFBYSxPQUFxRDtBQUNoRixRQUFNLFFBQW9DO0FBQUEsSUFDeEMsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsV0FBVztBQUFBLElBQ1gsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLEVBQ1g7QUFFQSxRQUFNLFFBQVEsVUFBUTtBQUNwQixVQUFNLEtBQUssTUFBTTtBQUFBLEVBQ25CLENBQUM7QUFFRCxTQUFPO0FBQ1Q7QUFrQk8sU0FBUyx5QkFBNEM7QUFDMUQsU0FBTztBQUNUO0FBRU8sU0FBUyx1QkFDZCxZQUNBLGVBQ0EscUJBQ21DO0FBQ25DLFFBQU0sVUFBNkMsQ0FBQztBQUVwRCxhQUFXLGdCQUFnQixlQUFlO0FBQ3hDLFlBQVEsYUFBYSxJQUFJLElBQUksYUFBYTtBQUFBLEVBQzVDO0FBRUEsYUFBVyxRQUFRLFlBQVk7QUFDN0IsUUFBSSxDQUFDLFFBQVEsSUFBSSxHQUFHO0FBQ2xCLGNBQVEsSUFBSSxJQUFJLHNCQUFzQix1QkFBdUIsSUFBSTtBQUFBLElBQ25FO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFDVDtBQUVPLFNBQVMsMkJBQ2QsY0FDQSxrQkFDbUI7QUFDbkIsTUFBSSxpQkFBaUIsV0FBVyxHQUFHO0FBQ2pDLFdBQU87QUFBQSxFQUNUO0FBRUEsUUFBTSxjQUFjLGFBQWEsUUFBUSxZQUFZO0FBQ3JELE1BQUksZ0JBQWdCLElBQUk7QUFDdEIsV0FBTyxpQkFBaUIsQ0FBQztBQUFBLEVBQzNCO0FBRUEsV0FBUyxTQUFTLEdBQUcsU0FBUyxhQUFhLFFBQVEsVUFBVSxHQUFHO0FBQzlELFVBQU0sY0FBYyxjQUFjO0FBQ2xDLFFBQUksZUFBZSxHQUFHO0FBQ3BCLFlBQU0sZUFBZSxhQUFhLFdBQVc7QUFDN0MsVUFBSSxpQkFBaUIsU0FBUyxZQUFZLEdBQUc7QUFDM0MsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBRUEsVUFBTSxhQUFhLGNBQWM7QUFDakMsUUFBSSxhQUFhLGFBQWEsUUFBUTtBQUNwQyxZQUFNLGNBQWMsYUFBYSxVQUFVO0FBQzNDLFVBQUksaUJBQWlCLFNBQVMsV0FBVyxHQUFHO0FBQzFDLGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxTQUFPLGlCQUFpQixDQUFDO0FBQzNCO0FBaktBLElBdUdNO0FBdkdOO0FBQUE7QUFBQTtBQU9BO0FBZ0dBLElBQU0sZUFBNkIsQ0FBQyxRQUFRLFNBQVMsYUFBYSxRQUFRLGNBQWMsV0FBVyxTQUFTO0FBQUE7QUFBQTs7O0FDaEY1RyxTQUFTLGlCQUErQjtBQUN0QyxTQUFPLENBQUMsUUFBUSxTQUFTLGFBQWEsUUFBUSxjQUFjLFdBQVcsU0FBUztBQUNsRjtBQUVBLFNBQVMsb0JBQ1AsT0FDQSxRQUNtQjtBQUNuQixRQUFNLFVBQVUsbUJBQW1CLEtBQUs7QUFDeEMsUUFBTSxtQkFBc0MsQ0FBQztBQUU3QyxhQUFXLFVBQVUsZUFBZSxHQUFHO0FBQ3JDLFVBQU0sY0FBYyxRQUFRLElBQUksTUFBTSxLQUFLLENBQUM7QUFDNUMsUUFBSSxZQUFZLFNBQVMsS0FBSyxPQUFPLE1BQU0sSUFBSSxHQUFHO0FBQ2hELHVCQUFpQixLQUFLLEVBQUUsUUFBUSxPQUFPLFlBQVksQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFDVDtBQUVBLFNBQVMsbUJBQ1AsaUJBQ0EsUUFDbUI7QUFDbkIsUUFBTSxjQUFjLGdCQUFnQixPQUFPLENBQUMsS0FBSyxVQUFVLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFFaEYsTUFBSSxlQUFlLEdBQUc7QUFDcEIsV0FBTztBQUFBLEVBQ1Q7QUFFQSxNQUFJLFlBQVksT0FBTyxJQUFJO0FBRTNCLGFBQVcsU0FBUyxpQkFBaUI7QUFDbkMsaUJBQWEsTUFBTTtBQUNuQixRQUFJLGFBQWEsR0FBRztBQUNsQixhQUFPLE1BQU07QUFBQSxJQUNmO0FBQUEsRUFDRjtBQUVBLFNBQU8sZ0JBQWdCLGdCQUFnQixTQUFTLENBQUMsR0FBRyxVQUFVO0FBQ2hFO0FBRU8sU0FBUyxpQkFDZCxPQUNBLFNBQXVCLHVCQUN2QixTQUFnQyxLQUFLLFFBQ2I7QUFDeEIsTUFBSSxNQUFNLFdBQVcsRUFBRyxRQUFPO0FBRS9CLFFBQU0sbUJBQW1CLG9CQUFvQixPQUFPLE1BQU07QUFDMUQsTUFBSSxpQkFBaUIsV0FBVyxHQUFHO0FBQ2pDLFdBQU87QUFBQSxNQUNMLFFBQVEsTUFBTSxDQUFDLEVBQUU7QUFBQSxNQUNqQixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFBQSxJQUNsQjtBQUFBLEVBQ0Y7QUFFQSxRQUFNLGtCQUFrQixpQkFBaUIsSUFBSSxDQUFDLFdBQVc7QUFBQSxJQUN2RCxRQUFRLE1BQU07QUFBQSxJQUNkLFFBQVEsT0FBTyxNQUFNLE1BQU07QUFBQSxFQUM3QixFQUFFO0FBQ0YsUUFBTSxpQkFBaUIsbUJBQW1CLGlCQUFpQixNQUFNO0FBRWpFLE1BQUksQ0FBQyxnQkFBZ0I7QUFDbkIsV0FBTyxpQkFBaUIsQ0FBQztBQUFBLEVBQzNCO0FBRUEsU0FBTyxpQkFBaUIsS0FBSyxDQUFDLFVBQVUsTUFBTSxXQUFXLGNBQWMsS0FBSyxpQkFBaUIsQ0FBQztBQUNoRztBQUVPLFNBQVMsOEJBQ2QsT0FDQSxTQUF1Qix1QkFDdkIsU0FBZ0MsS0FBSyxRQUNiO0FBQ3hCLE1BQUksTUFBTSxXQUFXLEVBQUcsUUFBTztBQUUvQixRQUFNLFVBQVUsbUJBQW1CLEtBQUs7QUFDeEMsUUFBTSxrQkFBa0IsZUFBZSxFQUNwQyxPQUFPLENBQUMsV0FBVyxPQUFPLE1BQU0sSUFBSSxDQUFDLEVBQ3JDLElBQUksQ0FBQyxZQUFZLEVBQUUsUUFBUSxRQUFRLE9BQU8sTUFBTSxFQUFFLEVBQUU7QUFDdkQsUUFBTSxpQkFBaUIsbUJBQW1CLGlCQUFpQixNQUFNO0FBRWpFLE1BQUksQ0FBQyxnQkFBZ0I7QUFDbkIsV0FBTyxpQkFBaUIsT0FBTyxRQUFRLE1BQU07QUFBQSxFQUMvQztBQUVBLFFBQU0sZ0JBQWdCLFFBQVEsSUFBSSxjQUFjLEtBQUssQ0FBQztBQUN0RCxNQUFJLGNBQWMsU0FBUyxHQUFHO0FBQzVCLFdBQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLE9BQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUVBLFFBQU0sbUJBQW1CLGVBQWUsRUFBRSxPQUFPLENBQUMsWUFBWSxRQUFRLElBQUksTUFBTSxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDbkcsUUFBTSxpQkFBaUIsMkJBQTJCLGdCQUFnQixnQkFBZ0I7QUFDbEYsTUFBSSxDQUFDLGdCQUFnQjtBQUNuQixXQUFPO0FBQUEsRUFDVDtBQUVBLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLE9BQU8sUUFBUSxJQUFJLGNBQWMsS0FBSyxDQUFDO0FBQUEsRUFDekM7QUFDRjtBQUVPLFNBQVMseUJBQ2QsaUJBQ0EsU0FBZ0MsS0FBSyxRQUNyQjtBQUNoQixRQUFNLGtCQUFrQixLQUFLLE1BQU0sT0FBTyxJQUFJLGdCQUFnQixNQUFNLE1BQU07QUFDMUUsU0FBTyxnQkFBZ0IsTUFBTSxlQUFlO0FBQzlDO0FBdUJPLFNBQVMsc0JBQXNCLFFBQW9DO0FBQ3hFLFFBQU0sUUFBUSxPQUFPLE9BQU8sTUFBTSxFQUFFLE9BQU8sQ0FBQyxLQUFLLFFBQVEsTUFBTSxLQUFLLENBQUM7QUFFckUsTUFBSSxVQUFVLEtBQUssVUFBVSxLQUFLO0FBQ2hDLFdBQU87QUFBQSxFQUNUO0FBRUEsUUFBTSxTQUFTLE1BQU07QUFFckIsU0FBTztBQUFBLElBQ0wsTUFBTSxLQUFLLE1BQU0sT0FBTyxPQUFPLE1BQU07QUFBQSxJQUNyQyxPQUFPLEtBQUssTUFBTSxPQUFPLFFBQVEsTUFBTTtBQUFBLElBQ3ZDLFdBQVcsS0FBSyxNQUFNLE9BQU8sWUFBWSxNQUFNO0FBQUEsSUFDL0MsTUFBTSxLQUFLLE1BQU0sT0FBTyxPQUFPLE1BQU07QUFBQSxJQUNyQyxZQUFZLEtBQUssTUFBTSxPQUFPLGFBQWEsTUFBTTtBQUFBLElBQ2pELFNBQVMsS0FBSyxNQUFNLE9BQU8sVUFBVSxNQUFNO0FBQUEsSUFDM0MsU0FBUyxLQUFLLE1BQU0sT0FBTyxVQUFVLE1BQU07QUFBQSxFQUM3QztBQUNGO0FBS08sU0FBUyxxQkFBcUIsUUFBeUQ7QUFDNUYsUUFBTSxRQUFRLE9BQU8sT0FBTyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssUUFBUSxNQUFNLEtBQUssQ0FBQztBQUNyRSxTQUFPO0FBQUEsSUFDTCxPQUFPLFVBQVU7QUFBQSxJQUNqQjtBQUFBLEVBQ0Y7QUFDRjtBQTdMQTtBQUFBO0FBQUE7QUFPQTtBQU9BO0FBQUE7QUFBQTs7O0FDZEE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUF5R08sU0FBUyxvQkFDZCxTQUNnQjtBQUNoQixTQUFPO0FBQUEsSUFDTCxHQUFHO0FBQUEsSUFDSCxHQUFJLFdBQVcsQ0FBQztBQUFBLEVBQ2xCO0FBQ0Y7QUFFTyxTQUFTLCtCQUNkLFNBQzJCO0FBQzNCLFNBQU87QUFBQSxJQUNMLEdBQUc7QUFBQSxJQUNILEdBQUksV0FBVyxDQUFDO0FBQUEsSUFDaEIsc0JBQXNCLFNBQVMsd0JBQXdCLHFDQUFxQztBQUFBLElBQzVGLGVBQWUsU0FBUyxpQkFBaUIscUNBQXFDO0FBQUEsRUFDaEY7QUFDRjtBQTNIQSxJQWtDYSx5QkFZQSxzQ0FRQSw0QkFnREEsNkJBQ0E7QUF2R2I7QUFBQTtBQUFBO0FBa0NPLElBQU0sMEJBQTBDO0FBQUEsTUFDckQsc0JBQXNCO0FBQUEsTUFDdEIscUJBQXFCO0FBQUEsTUFDckIscUJBQXFCO0FBQUEsTUFDckIsc0JBQXNCO0FBQUEsTUFDdEIsK0JBQStCO0FBQUEsTUFDL0IsdUJBQXVCO0FBQUEsTUFDdkIsd0JBQXdCO0FBQUEsTUFDeEIseUJBQXlCO0FBQUEsTUFDekIsd0JBQXdCO0FBQUEsSUFDMUI7QUFFTyxJQUFNLHVDQUFrRTtBQUFBLE1BQzdFLHVCQUF1QjtBQUFBLE1BQ3ZCLHVCQUF1QjtBQUFBLE1BQ3ZCLG9CQUFvQjtBQUFBLE1BQ3BCLHNCQUFzQixDQUFDO0FBQUEsTUFDdkIsZUFBZTtBQUFBLElBQ2pCO0FBRU8sSUFBTSw2QkFBd0Q7QUFBQSxNQUNuRTtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLE1BQ2Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsTUFDZjtBQUFBLE1BQ0E7QUFBQSxRQUNFLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxNQUNmO0FBQUEsTUFDQTtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLE1BQ2Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsTUFDZjtBQUFBLE1BQ0E7QUFBQSxRQUNFLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxNQUNmO0FBQUEsTUFDQTtBQUFBLFFBQ0UsS0FBSztBQUFBLFFBQ0wsT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLE1BQ2Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxLQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsTUFDZjtBQUFBLE1BQ0E7QUFBQSxRQUNFLEtBQUs7QUFBQSxRQUNMLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxNQUNmO0FBQUEsSUFDRjtBQUVPLElBQU0sOEJBQThCO0FBQ3BDLElBQU0sNEJBQTRCO0FBQUE7QUFBQTs7O0FDdkd6QyxTQUFTLFFBQVEsb0JBQW9CLGdCQUFnQjtBQUFyRCxJQXNCYSx5QkFzUEE7QUE1UWI7QUFBQTtBQUFBO0FBQ0E7QUFxQk8sSUFBTSwwQkFBTixNQUE4QjtBQUFBLE1BQ25DLFVBQTBCLEVBQUUsR0FBRyx3QkFBd0I7QUFBQSxNQUN2RCxrQkFBNkMsRUFBRSxHQUFHLHFDQUFxQztBQUFBLE1BRXZGLGNBQWM7QUFDWiwyQkFBbUIsTUFBTTtBQUFBLFVBQ3ZCLFdBQVc7QUFBQSxVQUNYLFlBQVk7QUFBQSxVQUNaLHNCQUFzQjtBQUFBLFVBQ3RCLDBCQUEwQjtBQUFBLFVBQzFCLDBCQUEwQjtBQUFBLFVBQzFCLDRCQUE0QjtBQUFBLFVBQzVCLHdCQUF3QjtBQUFBLFVBQ3hCLGlCQUFpQjtBQUFBLFFBQ25CLENBQUM7QUFFRCxhQUFLLG1CQUFtQjtBQUV4QjtBQUFBLFVBQ0UsT0FBTztBQUFBLFlBQ0wsU0FBUyxFQUFFLEdBQUcsS0FBSyxRQUFRO0FBQUEsWUFDM0IsaUJBQWlCO0FBQUEsY0FDZixHQUFHLEtBQUs7QUFBQSxjQUNSLHNCQUFzQixDQUFDLEdBQUcsS0FBSyxnQkFBZ0Isb0JBQW9CO0FBQUEsWUFDckU7QUFBQSxVQUNGO0FBQUEsVUFDQSxDQUFDLGFBQWE7QUFDWixpQkFBSyxpQkFBaUI7QUFDdEIsaUJBQUssa0JBQWtCLFNBQVMsT0FBTztBQUFBLFVBQ3pDO0FBQUEsVUFDQSxFQUFFLGlCQUFpQixLQUFLO0FBQUEsUUFDMUI7QUFBQSxNQUNGO0FBQUEsTUFFQSxVQUF3QyxLQUFVLE9BQWtDO0FBQ2xGLGFBQUssVUFBVTtBQUFBLFVBQ2IsR0FBRyxLQUFLO0FBQUEsVUFDUixDQUFDLEdBQUcsR0FBRztBQUFBLFFBQ1Q7QUFFQSxZQUFJLFFBQVEseUJBQXlCLFVBQVUsT0FBTztBQUNwRCxlQUFLLHNCQUFzQjtBQUFBLFFBQzdCO0FBQUEsTUFDRjtBQUFBLE1BRUEsV0FBVyxTQUF3QztBQUNqRCxhQUFLLFVBQVUsb0JBQW9CO0FBQUEsVUFDakMsR0FBRyxLQUFLO0FBQUEsVUFDUixHQUFHO0FBQUEsUUFDTCxDQUFDO0FBQUEsTUFDSDtBQUFBLE1BRUEscUJBQ0UsU0FDQSxtQkFDTTtBQUNOLGFBQUssVUFBVSxvQkFBb0I7QUFBQSxVQUNqQyxHQUFHLEtBQUs7QUFBQSxVQUNSLEdBQUc7QUFBQSxRQUNMLENBQUM7QUFDRCxhQUFLLGtCQUFrQjtBQUFBLFVBQ3JCLEdBQUcsS0FBSztBQUFBLFVBQ1IsdUJBQXVCLGtCQUFrQix5QkFBeUIsS0FBSyxnQkFBZ0I7QUFBQSxVQUN2Rix1QkFBdUIsa0JBQWtCLHlCQUF5QixLQUFLLGdCQUFnQjtBQUFBLFFBQ3pGO0FBRUEsWUFBSSxLQUFLLGdCQUFnQixxQkFBcUIsS0FBSyxnQkFBZ0IsdUJBQXVCO0FBQ3hGLGVBQUssa0JBQWtCO0FBQUEsWUFDckIsR0FBRyxLQUFLO0FBQUEsWUFDUixvQkFBb0IsS0FBSyxnQkFBZ0I7QUFBQSxZQUN6QyxzQkFBc0IsS0FBSyxnQkFBZ0IscUJBQXFCLE1BQU0sR0FBRyxLQUFLLGdCQUFnQixxQkFBcUI7QUFBQSxVQUNySDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFFQSx5QkFBeUIsT0FBb0M7QUFDM0QsYUFBSyxrQkFBa0I7QUFBQSxVQUNyQixHQUFHLEtBQUs7QUFBQSxVQUNSLHVCQUF1QjtBQUFBLFFBQ3pCO0FBRUEsWUFBSSxLQUFLLGdCQUFnQixxQkFBcUIsT0FBTztBQUNuRCxlQUFLLGtCQUFrQjtBQUFBLFlBQ3JCLEdBQUcsS0FBSztBQUFBLFlBQ1Isb0JBQW9CO0FBQUEsWUFDcEIsc0JBQXNCLEtBQUssZ0JBQWdCLHFCQUFxQixNQUFNLEdBQUcsS0FBSztBQUFBLFVBQ2hGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUVBLHlCQUF5QixPQUFvQztBQUMzRCxhQUFLLGtCQUFrQjtBQUFBLFVBQ3JCLEdBQUcsS0FBSztBQUFBLFVBQ1IsdUJBQXVCO0FBQUEsUUFDekI7QUFBQSxNQUNGO0FBQUEsTUFFQSwyQkFDRSxlQUNBLHNCQUNNO0FBQ04sYUFBSyxrQkFBa0I7QUFBQSxVQUNyQixHQUFHLEtBQUs7QUFBQSxVQUNSO0FBQUEsVUFDQSxvQkFBb0IscUJBQXFCO0FBQUEsVUFDekMsc0JBQXNCLENBQUMsR0FBRyxvQkFBb0I7QUFBQSxRQUNoRDtBQUFBLE1BQ0Y7QUFBQSxNQUVBLHVCQUF1QixnQkFBK0IsTUFBWTtBQUNoRSxhQUFLLGtCQUFrQjtBQUFBLFVBQ3JCLEdBQUcsS0FBSztBQUFBLFVBQ1I7QUFBQSxVQUNBLG9CQUFvQjtBQUFBLFVBQ3BCLHNCQUFzQixDQUFDO0FBQUEsUUFDekI7QUFBQSxNQUNGO0FBQUEsTUFFQSxrQkFBd0I7QUFDdEIsYUFBSyxVQUFVLEVBQUUsR0FBRyx3QkFBd0I7QUFDNUMsYUFBSyxrQkFBa0IsRUFBRSxHQUFHLHFDQUFxQztBQUFBLE1BQ25FO0FBQUEsTUFFUSxxQkFBMkI7QUFDakMsWUFBSTtBQUNGLGdCQUFNLFFBQVEsYUFBYSxRQUFRLDJCQUEyQjtBQUM5RCxjQUFJLENBQUMsT0FBTztBQUNWO0FBQUEsVUFDRjtBQUVBLGdCQUFNLFNBQVMsS0FBSyxNQUFNLEtBQUs7QUFJL0IsY0FBSSxhQUFhLFVBQVUscUJBQXFCLFFBQVE7QUFDdEQsaUJBQUssVUFBVSxvQkFBb0IsT0FBTyxPQUFPO0FBQ2pELGlCQUFLLGtCQUFrQiwrQkFBK0IsT0FBTyxlQUFlO0FBQzVFO0FBQUEsVUFDRjtBQUVBLGVBQUssVUFBVSxvQkFBb0IsTUFBaUM7QUFBQSxRQUN0RSxTQUFTLE9BQU87QUFDZCxrQkFBUSxNQUFNLGdFQUFnRSxLQUFLO0FBQUEsUUFDckY7QUFBQSxNQUNGO0FBQUEsTUFFUSxtQkFBeUI7QUFDL0IsWUFBSTtBQUNGLGNBQUksQ0FBQyxLQUFLLFFBQVEscUJBQXFCO0FBQ3JDLHlCQUFhLFdBQVcsMkJBQTJCO0FBQ25EO0FBQUEsVUFDRjtBQUVBLHVCQUFhO0FBQUEsWUFDWDtBQUFBLFlBQ0EsS0FBSyxVQUFVO0FBQUEsY0FDYixTQUFTLEtBQUs7QUFBQSxjQUNkLGlCQUFpQixLQUFLO0FBQUEsWUFDeEIsQ0FBQztBQUFBLFVBQ0g7QUFBQSxRQUNGLFNBQVMsT0FBTztBQUNkLGtCQUFRLE1BQU0sZ0VBQWdFLEtBQUs7QUFBQSxRQUNyRjtBQUFBLE1BQ0Y7QUFBQSxNQUVRLHdCQUE4QjtBQUNwQyxZQUFJO0FBQ0YsdUJBQWEsV0FBVywyQkFBMkI7QUFBQSxRQUNyRCxTQUFTLE9BQU87QUFDZCxrQkFBUSxNQUFNLHNFQUFzRSxLQUFLO0FBQUEsUUFDM0Y7QUFBQSxNQUNGO0FBQUEsTUFFUSxrQkFBa0IsU0FBK0I7QUFDdkQsWUFBSSxPQUFPLFdBQVcsYUFBYTtBQUNqQztBQUFBLFFBQ0Y7QUFFQSxjQUFNLHNCQUFzQixvQkFBb0I7QUFBQSxVQUM5QyxHQUFHO0FBQUEsUUFDTCxDQUFDO0FBRUQsZUFBTyxvQkFBb0IsbUJBQW1CLG1CQUFtQjtBQUFBLE1BQ25FO0FBQUEsTUFFQSxJQUFJLHVCQUFnQztBQUNsQyxlQUFPLEtBQUssUUFBUTtBQUFBLE1BQ3RCO0FBQUEsTUFFQSxJQUFJLHNCQUErQjtBQUNqQyxlQUFPLEtBQUssUUFBUTtBQUFBLE1BQ3RCO0FBQUEsTUFFQSxJQUFJLHNCQUErQjtBQUNqQyxlQUFPLEtBQUssUUFBUTtBQUFBLE1BQ3RCO0FBQUEsTUFFQSxJQUFJLHVCQUFnQztBQUNsQyxlQUFPLEtBQUssUUFBUTtBQUFBLE1BQ3RCO0FBQUEsTUFFQSxJQUFJLGdDQUF5QztBQUMzQyxlQUFPLEtBQUssUUFBUTtBQUFBLE1BQ3RCO0FBQUEsTUFFQSxJQUFJLHdCQUFpQztBQUNuQyxlQUFPLEtBQUssUUFBUTtBQUFBLE1BQ3RCO0FBQUEsTUFFQSxJQUFJLHlCQUFrQztBQUNwQyxlQUFPLEtBQUssUUFBUTtBQUFBLE1BQ3RCO0FBQUEsTUFFQSxJQUFJLDBCQUFtQztBQUNyQyxlQUFPLEtBQUssUUFBUTtBQUFBLE1BQ3RCO0FBQUEsTUFFQSxJQUFJLHlCQUFrQztBQUNwQyxlQUFPLEtBQUssUUFBUTtBQUFBLE1BQ3RCO0FBQUEsTUFFQSxJQUFJLHdCQUErQztBQUNqRCxlQUFPLEtBQUssZ0JBQWdCO0FBQUEsTUFDOUI7QUFBQSxNQUVBLElBQUksd0JBQStDO0FBQ2pELGVBQU8sS0FBSyxnQkFBZ0I7QUFBQSxNQUM5QjtBQUFBLE1BRUEsSUFBSSxxQkFBNkI7QUFDL0IsZUFBTyxLQUFLLGdCQUFnQjtBQUFBLE1BQzlCO0FBQUEsTUFFQSxJQUFJLHVCQUFpQztBQUNuQyxlQUFPLEtBQUssZ0JBQWdCO0FBQUEsTUFDOUI7QUFBQSxNQUVBLElBQUkseUJBQXdDO0FBQzFDLGVBQU8sS0FBSyxnQkFBZ0I7QUFBQSxNQUM5QjtBQUFBLE1BRUEsSUFBSSw2QkFBc0M7QUFDeEMsZUFBTyxLQUFLLGdCQUFnQixxQkFBcUIsS0FBSyxnQkFBZ0I7QUFBQSxNQUN4RTtBQUFBLElBQ0Y7QUFFTyxJQUFNLDBCQUEwQixJQUFJLHdCQUF3QjtBQUFBO0FBQUE7OztBQzVRbkUsU0FBUyxhQUEwQjtBQW9CbkMsU0FBUyxjQUFjLE1BQTRCO0FBQ2pELFNBQU8sT0FBTyxhQUFhLElBQUksSUFBSTtBQUNyQztBQUVBLFNBQVMsaUJBQWlCLEtBQWEsTUFBc0IsZ0JBQWdDO0FBQzNGLFFBQU0sUUFBUSxJQUFJLE1BQU0sR0FBRztBQUMzQixRQUFNLE9BQU8sS0FBSyxLQUFLLE1BQU0sR0FBRyxDQUFDO0FBQ2pDLFFBQU0sS0FBSyxLQUFLLEtBQUssTUFBTSxHQUFHLENBQUM7QUFDL0IsUUFBTSxjQUFjLE1BQU0sSUFBSSxJQUFJO0FBQ2xDLFFBQU0sY0FBYyxNQUFNLElBQUksRUFBRTtBQUNoQyxRQUFNLGFBQWEsTUFBTSxLQUFLO0FBQUEsSUFDNUI7QUFBQSxJQUNBO0FBQUEsSUFDQSxXQUFXLEtBQUssS0FBSyxDQUFDO0FBQUEsRUFDeEIsQ0FBQztBQUVELE1BQUksQ0FBQyxZQUFZO0FBQ2YsV0FBTztBQUFBLEVBQ1Q7QUFFQSxRQUFNLFlBQVksV0FBVyxNQUFNLFNBQVMsR0FBRyxLQUFLLFdBQVcsTUFBTSxTQUFTLEdBQUc7QUFDakYsUUFBTSxjQUFjLFFBQVEsV0FBVyxTQUFTO0FBQ2hELFFBQU0sVUFBVSxNQUFNLFFBQVE7QUFDOUIsUUFBTSxXQUFXLEtBQUssSUFBSSxHQUFHLGlCQUFpQixLQUFLLFVBQVU7QUFDN0QsUUFBTSxnQkFBZ0IsY0FBYyxhQUFhLElBQUksSUFBSSxjQUFjLGFBQWEsSUFBSTtBQUN4RixRQUFNLGNBQWMsYUFBYSxnQkFBZ0I7QUFFakQsTUFBSSxnQkFBZ0I7QUFDcEIsbUJBQWlCLFVBQVUsSUFBSTtBQUMvQixtQkFBaUIsWUFBWSxNQUFNO0FBQ25DLG1CQUFpQixjQUFjLE1BQU07QUFDckMsbUJBQWlCLGNBQWMsT0FBTztBQUN0QyxtQkFBaUIsWUFBWSxLQUFLLE1BQU0sWUFBWSxLQUFLLE9BQU87QUFFaEUsU0FBTztBQUNUO0FBRU8sU0FBUywyQkFDZCxLQUNBLE9BQzBCO0FBQzFCLE1BQUksTUFBTSxXQUFXLEdBQUc7QUFDdEIsV0FBTyxDQUFDO0FBQUEsRUFDVjtBQUVBLFFBQU0saUJBQWlCLE1BQU0sQ0FBQyxFQUFFO0FBRWhDLFNBQU8sTUFDSixPQUFPLFVBQVEsa0JBQWtCLFNBQVMsS0FBSyxNQUFNLENBQUMsRUFDdEQsSUFBSSxXQUFTO0FBQUEsSUFDWjtBQUFBLElBQ0EsZUFBZSxpQkFBaUIsS0FBSyxNQUFNLGNBQWM7QUFBQSxFQUMzRCxFQUFFLEVBQ0QsT0FBTyxlQUFhLFVBQVUsZ0JBQWdCLENBQUMsRUFDL0MsS0FBSyxDQUFDLE1BQU0sVUFBVSxNQUFNLGdCQUFnQixLQUFLLGFBQWE7QUFDbkU7QUFFTyxTQUFTLGtCQUNkLFlBQ0EsY0FDdUI7QUFDdkIsTUFBSSxXQUFXLFdBQVcsR0FBRztBQUMzQixXQUFPO0FBQUEsRUFDVDtBQUVBLFFBQU0sY0FBYyxXQUFXLE9BQU8sQ0FBQyxLQUFLLGNBQWMsTUFBTSxVQUFVLGVBQWUsQ0FBQztBQUMxRixNQUFJLFlBQVksYUFBYSxLQUFLLElBQUk7QUFFdEMsYUFBVyxhQUFhLFlBQVk7QUFDbEMsaUJBQWEsVUFBVTtBQUN2QixRQUFJLGFBQWEsR0FBRztBQUNsQixhQUFPLFVBQVU7QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7QUFFQSxTQUFPLFdBQVcsV0FBVyxTQUFTLENBQUMsRUFBRTtBQUMzQztBQWhHQSxJQVNNLGNBU0E7QUFsQk47QUFBQTtBQUFBO0FBU0EsSUFBTSxlQUE0QztBQUFBLE1BQ2hELEdBQUc7QUFBQSxNQUNILEdBQUc7QUFBQSxNQUNILEdBQUc7QUFBQSxNQUNILEdBQUc7QUFBQSxNQUNILEdBQUc7QUFBQSxNQUNILEdBQUc7QUFBQSxJQUNMO0FBRUEsSUFBTSxvQkFBa0MsQ0FBQyxRQUFRLE9BQU87QUFBQTtBQUFBOzs7QUNsQnhELFNBQVMsU0FBQUEsY0FBMEI7QUFtQjVCLFNBQVMsaUJBQWlCLEtBQXFCO0FBQ3BELFFBQU0sUUFBUSxJQUFJQSxPQUFNLEdBQUc7QUFDM0IsU0FBTyxNQUNKLE1BQU0sRUFDTixLQUFLLEVBQ0wsT0FBTyxDQUFDLE9BQU8sVUFBVSxTQUFTLFFBQVFDLGNBQWEsTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDO0FBQy9FO0FBRU8sU0FBUyxnQkFBZ0IsS0FBc0I7QUFDcEQsUUFBTSxRQUFRLElBQUlELE9BQU0sR0FBRztBQUMzQixRQUFNLFNBQVMsTUFDWixNQUFNLEVBQ04sS0FBSyxFQUNMLE9BQU8sV0FBUyxPQUFPLFNBQVMsR0FBRyxFQUFFO0FBRXhDLFNBQU8sU0FBUztBQUNsQjtBQUVPLFNBQVMsZ0JBQWdCLEtBQWEsWUFBcUM7QUFDaEYsUUFBTSxnQkFBZ0IsaUJBQWlCLEdBQUc7QUFDMUMsUUFBTSxlQUFlLGdCQUFnQixHQUFHO0FBRXhDLE1BQUksY0FBYyxJQUFJO0FBQ3BCLFdBQU87QUFBQSxNQUNMLE9BQU87QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsTUFBSSxnQkFBZ0IsaUJBQWlCLElBQUk7QUFDdkMsV0FBTztBQUFBLE1BQ0wsT0FBTztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQUEsSUFDTCxPQUFPO0FBQUEsSUFDUDtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0Y7QUE5REEsSUFJTUM7QUFKTjtBQUFBO0FBQUE7QUFJQSxJQUFNQSxnQkFBNEM7QUFBQSxNQUNoRCxHQUFHO0FBQUEsTUFDSCxHQUFHO0FBQUEsTUFDSCxHQUFHO0FBQUEsTUFDSCxHQUFHO0FBQUEsTUFDSCxHQUFHO0FBQUEsTUFDSCxHQUFHO0FBQUEsSUFDTDtBQUFBO0FBQUE7OztBQ0RBLFNBQVMsTUFBTSxPQUFlLE1BQU0sR0FBRyxNQUFNLEdBQVc7QUFDdEQsU0FBTyxLQUFLLElBQUksS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLENBQUM7QUFDM0M7QUFFTyxTQUFTLDRCQUNkLE9BQzBCO0FBQzFCLE1BQUksTUFBTSxVQUFVLEdBQUc7QUFDckIsV0FBTztBQUFBLE1BQ0wsT0FBTztBQUFBLE1BQ1AsT0FBTztBQUFBLE1BQ1AsUUFBUTtBQUFBLE1BQ1IsaUJBQWlCLE1BQU07QUFBQSxNQUN2QixZQUFZO0FBQUEsSUFDZDtBQUFBLEVBQ0Y7QUFFQSxRQUFNLGNBQWMsTUFBTSxJQUFJLENBQUMsU0FBUyxLQUFLLFVBQVUsRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQztBQUM3RSxRQUFNLE9BQU8sWUFBWSxDQUFDO0FBQzFCLFFBQU0sU0FBUyxLQUFLLElBQUksT0FBTyxZQUFZLFlBQVksU0FBUyxDQUFDLENBQUM7QUFDbEUsUUFBTSxrQkFBa0IsTUFBTSxPQUFPLENBQUMsU0FBUyxLQUFLLElBQUksT0FBTyxLQUFLLFVBQVUsS0FBSyxFQUFFLEVBQUU7QUFDdkYsUUFBTSxhQUFhLE1BQU0sU0FBUyxJQUM5QixLQUFLLElBQUksT0FBTyxZQUFZLEtBQUssSUFBSSxHQUFHLFlBQVksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUNoRTtBQUVKLFFBQU0sZUFBZSxJQUFJLE1BQU0sU0FBUyxHQUFHO0FBQzNDLFFBQU0sY0FBYyxPQUFPLGtCQUFrQixLQUFLLENBQUM7QUFDbkQsUUFBTSxtQkFBbUIsTUFBTSxhQUFhLEdBQUc7QUFDL0MsUUFBTSxRQUFRLE1BQU0sZUFBZSxPQUFPLGNBQWMsT0FBTyxtQkFBbUIsR0FBRztBQUVyRixNQUFJLFFBQTJDO0FBQy9DLE1BQUksUUFBUSxLQUFNLFNBQVE7QUFDMUIsTUFBSSxRQUFRLEtBQU0sU0FBUTtBQUUxQixTQUFPO0FBQUEsSUFDTDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0Y7QUFZTyxTQUFTLGdDQUNkLFFBQ0EsWUFDYztBQUNkLFFBQU0sV0FBVyxFQUFFLEdBQUcsT0FBTztBQUM3QixRQUFNLFlBQVksV0FBVztBQUU3QixNQUFJLFdBQVcsVUFBVSxRQUFRO0FBQy9CLGFBQVMsT0FBTyxLQUFLLElBQUksR0FBRyxTQUFTLE9BQU8sS0FBSyxNQUFNLElBQUksU0FBUyxDQUFDO0FBQ3JFLGFBQVMsUUFBUSxLQUFLLElBQUksR0FBRyxTQUFTLFFBQVEsS0FBSyxNQUFNLElBQUksU0FBUyxDQUFDO0FBQ3ZFLGFBQVMsY0FBYyxLQUFLLE1BQU0sSUFBSSxTQUFTO0FBQy9DLGFBQVMsV0FBVyxLQUFLLE1BQU0sSUFBSSxTQUFTO0FBQzVDLGFBQVMsV0FBVyxLQUFLLE1BQU0sSUFBSSxTQUFTO0FBQUEsRUFDOUMsV0FBVyxXQUFXLFVBQVUsT0FBTztBQUNyQyxhQUFTLFFBQVEsS0FBSyxNQUFNLEtBQUssSUFBSSxVQUFVO0FBQy9DLGFBQVMsU0FBUyxLQUFLLE1BQU0sS0FBSyxJQUFJLFVBQVU7QUFDaEQsYUFBUyxhQUFhLEtBQUssTUFBTSxLQUFLLElBQUksVUFBVTtBQUNwRCxhQUFTLFVBQVUsS0FBSyxJQUFJLEdBQUcsU0FBUyxVQUFVLENBQUM7QUFDbkQsYUFBUyxVQUFVLEtBQUssSUFBSSxHQUFHLFNBQVMsVUFBVSxDQUFDO0FBQUEsRUFDckQ7QUFFQSxRQUFNLFFBQVFDLGNBQWEsT0FBTyxDQUFDLEtBQUssV0FBVyxNQUFNLFNBQVMsTUFBTSxHQUFHLENBQUM7QUFDNUUsTUFBSSxTQUFTLEdBQUc7QUFDZCxXQUFPO0FBQUEsRUFDVDtBQUVBLFFBQU0sYUFBYUEsY0FBYSxPQUFPLENBQUMsUUFBUSxXQUFXO0FBQ3pELFdBQU8sTUFBTSxJQUFJLEtBQUssTUFBTyxTQUFTLE1BQU0sSUFBSSxRQUFTLEdBQUc7QUFDNUQsV0FBTztBQUFBLEVBQ1QsR0FBRyxDQUFDLENBQWlCO0FBRXJCLFFBQU0sa0JBQWtCQSxjQUFhLE9BQU8sQ0FBQyxLQUFLLFdBQVcsTUFBTSxXQUFXLE1BQU0sR0FBRyxDQUFDO0FBQ3hGLFFBQU0sT0FBTyxNQUFNO0FBQ25CLGFBQVcsUUFBUTtBQUVuQixTQUFPO0FBQ1Q7QUFuR0EsSUFxRE1BO0FBckROO0FBQUE7QUFBQTtBQXFEQSxJQUFNQSxnQkFBNkI7QUFBQSxNQUNqQztBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQTtBQUFBOzs7QUM3REEsU0FBUyxTQUFBQyxjQUFhO0FBVWYsU0FBUyx1QkFBdUIsU0FBeUM7QUFDOUUsTUFBSSxZQUFZLGNBQWM7QUFDNUIsV0FBTztBQUFBLEVBQ1Q7QUFFQSxNQUFJLFlBQVksVUFBVSxZQUFZLGNBQWM7QUFDbEQsV0FBTztBQUFBLEVBQ1Q7QUFFQSxTQUFPO0FBQ1Q7QUFFTyxTQUFTLHVCQUNkLFFBQ0EsU0FDNEI7QUFDNUIsUUFBTSxPQUFPLHVCQUF1QixPQUFPO0FBQzNDLFFBQU0sV0FBVyxFQUFFLEdBQUcsT0FBTztBQUU3QixNQUFJLFNBQVMsY0FBYztBQUN6QixhQUFTLFFBQVE7QUFDakIsYUFBUyxjQUFjO0FBQ3ZCLGFBQVMsT0FBTyxLQUFLLElBQUksR0FBRyxTQUFTLE9BQU8sQ0FBQztBQUM3QyxhQUFTLFFBQVEsS0FBSyxJQUFJLEdBQUcsU0FBUyxRQUFRLENBQUM7QUFBQSxFQUNqRCxXQUFXLFNBQVMsUUFBUTtBQUMxQixlQUFXLFVBQVUsY0FBYztBQUNqQyxlQUFTLE1BQU0sS0FBSztBQUFBLElBQ3RCO0FBQ0EsYUFBUyxVQUFVLEtBQUssSUFBSSxHQUFHLFNBQVMsVUFBVSxDQUFDO0FBQ25ELGFBQVMsVUFBVSxLQUFLLElBQUksR0FBRyxTQUFTLFVBQVUsQ0FBQztBQUFBLEVBQ3JEO0FBRUEsU0FBTztBQUNUO0FBRUEsU0FBUyxrQkFBa0IsS0FBYSxTQUFpQixTQUE0QjtBQUNuRixRQUFNLE9BQU8sdUJBQXVCLE9BQU87QUFDM0MsTUFBSSxTQUFTLFlBQVk7QUFDdkIsV0FBTztBQUFBLEVBQ1Q7QUFFQSxRQUFNLFFBQVEsSUFBSUEsT0FBTSxHQUFHO0FBQzNCLFFBQU0sT0FBTyxNQUFNLEtBQUs7QUFBQSxJQUN0QixNQUFNLFFBQVEsTUFBTSxHQUFHLENBQUM7QUFBQSxJQUN4QixJQUFJLFFBQVEsTUFBTSxHQUFHLENBQUM7QUFBQSxJQUN0QixXQUFXLFFBQVEsQ0FBQztBQUFBLEVBQ3RCLENBQUM7QUFFRCxNQUFJLENBQUMsTUFBTTtBQUNULFdBQU87QUFBQSxFQUNUO0FBRUEsUUFBTSxZQUFZLEtBQUssTUFBTSxTQUFTLEdBQUcsS0FBSyxLQUFLLE1BQU0sU0FBUyxHQUFHO0FBQ3JFLFFBQU0sY0FBYyxRQUFRLEtBQUssU0FBUztBQUMxQyxRQUFNLFdBQVcsS0FBSyxNQUFNLFNBQVMsR0FBRyxLQUFLLEtBQUssTUFBTSxTQUFTLEdBQUc7QUFDcEUsUUFBTSxVQUFVLE1BQU0sUUFBUTtBQUU5QixNQUFJLFNBQVMsY0FBYztBQUN6QixXQUFPLEtBQ0YsWUFBWSxPQUFPLE1BQ25CLFVBQVUsT0FBTyxNQUNqQixjQUFjLE9BQU8sTUFDckIsV0FBVyxPQUFPO0FBQUEsRUFDekI7QUFFQSxTQUFPLEtBQ0YsV0FBVyxNQUFNLE1BQ2pCLENBQUMsWUFBWSxNQUFNLE1BQ25CLGNBQWMsT0FBTztBQUM1QjtBQUVPLFNBQVMsc0JBQ2QsS0FDQSxPQUNBLFNBQ0EsY0FDZ0I7QUFDaEIsTUFBSSxNQUFNLFdBQVcsR0FBRztBQUN0QixXQUFPLE1BQU0sQ0FBQztBQUFBLEVBQ2hCO0FBRUEsUUFBTSxnQkFBZ0IsTUFBTSxJQUFJLENBQUMsVUFBVTtBQUFBLElBQ3pDO0FBQUEsSUFDQSxRQUFRLEtBQUssSUFBSSxLQUFLLGtCQUFrQixLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFBQSxFQUNsRSxFQUFFO0FBQ0YsUUFBTSxjQUFjLGNBQWMsT0FBTyxDQUFDLEtBQUssVUFBVSxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzlFLE1BQUksWUFBWSxhQUFhLEtBQUssSUFBSTtBQUV0QyxhQUFXLFNBQVMsZUFBZTtBQUNqQyxpQkFBYSxNQUFNO0FBQ25CLFFBQUksYUFBYSxHQUFHO0FBQ2xCLGFBQU8sTUFBTTtBQUFBLElBQ2Y7QUFBQSxFQUNGO0FBRUEsU0FBTyxjQUFjLGNBQWMsU0FBUyxDQUFDLEVBQUU7QUFDakQ7QUFFTyxTQUFTLHNCQUFzQixTQUkzQjtBQUNULFFBQU0sRUFBRSxZQUFZLFNBQVMsT0FBTyxJQUFJO0FBQ3hDLFFBQU0sT0FBTyx1QkFBdUIsT0FBTztBQUMzQyxRQUFNLE9BQU87QUFDYixRQUFNLGtCQUFrQixhQUFhLEtBQUssTUFBTSxNQUFNLFdBQVcsS0FBSyxJQUFJO0FBQzFFLFFBQU0sZUFBZSxTQUFTLFNBQVMsTUFBTSxTQUFTLGVBQWUsS0FBSztBQUMxRSxRQUFNLGNBQ0osV0FBVyxVQUFVLFdBQVcsVUFDNUIsTUFDQSxXQUFXLGFBQWEsV0FBVyxZQUNqQyxLQUNBO0FBRVIsU0FBTyxPQUFPLGtCQUFrQixlQUFlO0FBQ2pEO0FBOUhBLElBUU07QUFSTjtBQUFBO0FBQUE7QUFRQSxJQUFNLGVBQTZCLENBQUMsUUFBUSxTQUFTLFdBQVc7QUFBQTtBQUFBOzs7QUNIaEUsU0FBUyxzQkFBQUMscUJBQW9CLFVBQUFDLFNBQVEsbUJBQW1CO0FBaUV4RCxTQUFTLDBCQUEwQixXQUFtQixLQUFzQjtBQUMxRSxNQUFJLENBQUMsd0JBQXdCLHdCQUF3QjtBQUNuRCxXQUFPO0FBQUEsRUFDVDtBQUVBLE1BQUksQ0FBQyx3QkFBd0IsNEJBQTRCO0FBQ3ZELFdBQU87QUFBQSxFQUNUO0FBRUEsTUFBSSx3QkFBd0IsMEJBQTBCLEdBQUc7QUFDdkQsV0FBTztBQUFBLEVBQ1Q7QUFFQSxRQUFNLFFBQVEsZ0JBQWdCLEtBQUssU0FBUyxFQUFFO0FBQzlDLFNBQU8sd0JBQXdCLDBCQUEwQixTQUNwRCx3QkFBd0IsMEJBQTBCO0FBQ3pEO0FBdEZBLElBb0VNQyxTQW9CTyxpQkE2YUE7QUFyZ0JiO0FBQUE7QUFBQTtBQU1BO0FBS0E7QUFDQTtBQUNBO0FBWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUtBO0FBSUE7QUFNQTtBQXdCQSxJQUFNQSxVQUFTLGtCQUFrQixpQkFBaUI7QUFvQjNDLElBQU0sa0JBQU4sTUFBc0I7QUFBQSxNQUMzQixnQkFBZ0I7QUFBQSxNQUNoQixpQkFBaUI7QUFBQSxNQUNqQixjQUFjO0FBQUEsTUFDZCxnQkFBa0MsQ0FBQztBQUFBLE1BQ25DLGlCQUEwQztBQUFBLE1BQzFDLFFBQXVCO0FBQUEsTUFDdkIsaUJBQWtEO0FBQUEsTUFDbEQsd0JBQXdCO0FBQUEsTUFDeEIsc0JBQThDO0FBQUEsTUFDdEMsaUJBQWtEO0FBQUEsUUFDeEQsWUFBWTtBQUFBLFFBQ1osWUFBWTtBQUFBLE1BQ2Q7QUFBQSxNQUNRLG1CQUFvRDtBQUFBLFFBQzFELFlBQVk7QUFBQSxRQUNaLFlBQVk7QUFBQSxNQUNkO0FBQUEsTUFDUSxvQkFBOEM7QUFBQSxNQUV0RCxjQUFjO0FBQ1osUUFBQUYsb0JBQW1CLE1BQU07QUFBQSxVQUN2QixZQUFZQztBQUFBLFVBQ1osaUJBQWlCQTtBQUFBLFVBQ2pCLHNCQUFzQkE7QUFBQSxVQUN0QixPQUFPQTtBQUFBLFVBQ1AsVUFBVUE7QUFBQSxRQUNaLENBQUM7QUFFRCxRQUFBQyxRQUFPLE1BQU0sYUFBYTtBQUFBLE1BQzVCO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxNQUFNLGFBQTRCO0FBQ2hDLFlBQUksS0FBSyxlQUFlO0FBQ3RCLFVBQUFBLFFBQU8sTUFBTSxxQkFBcUI7QUFDbEM7QUFBQSxRQUNGO0FBRUEsWUFBSTtBQUNGLHNCQUFZLE1BQU07QUFDaEIsaUJBQUssUUFBUTtBQUNiLGlCQUFLLGlCQUFpQjtBQUFBLFVBQ3hCLENBQUM7QUFDRCxnQkFBTSxpQkFBaUIsV0FBVztBQUVsQyxzQkFBWSxNQUFNO0FBQ2hCLGlCQUFLLGdCQUFnQjtBQUNyQixpQkFBSyxpQkFBaUI7QUFBQSxVQUN4QixDQUFDO0FBQ0QsVUFBQUEsUUFBTyxNQUFNLHlCQUF5QjtBQUFBLFFBQ3hDLFNBQVMsS0FBSztBQUNaLFVBQUFBLFFBQU8sTUFBTSx5QkFBeUIsR0FBRztBQUN6QyxzQkFBWSxNQUFNO0FBQ2hCLGlCQUFLLFFBQVEsZ0NBQWdDLEdBQUc7QUFDaEQsaUJBQUssaUJBQWlCO0FBQUEsVUFDeEIsQ0FBQztBQUNELGdCQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLFVBQVUsU0FBcUQ7QUFDN0QsUUFBQUEsUUFBTyxNQUFNLGdCQUFnQixPQUFPO0FBQ3BDLHlCQUFpQixVQUFVLE9BQU87QUFBQSxNQUNwQztBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsTUFBTSxnQkFDSixLQUNBLFFBQVEsSUFDUixVQUFVLElBQ1YsVUFBMkIsY0FDTTtBQUNqQyxRQUFBQSxRQUFPLE1BQU0sMEJBQTBCLEVBQUUsS0FBSyxPQUFPLFNBQVMsUUFBUSxDQUFDO0FBRXZFLFlBQUksQ0FBQyxLQUFLLGVBQWU7QUFDdkIsZ0JBQU0sS0FBSyxXQUFXO0FBQUEsUUFDeEI7QUFFQSxZQUFJO0FBQ0YsZ0JBQU0sV0FBVyxzQkFBc0IsS0FBSyxPQUFPLE9BQU87QUFDMUQsZ0JBQU0sWUFBWSxFQUFFLEtBQUssZUFBZSxPQUFPO0FBQy9DLGVBQUssaUJBQWlCLE9BQU8sSUFBSTtBQUVqQyxjQUFJLEtBQUssbUJBQW1CO0FBQzFCLGdCQUFJLEtBQUssa0JBQWtCLGFBQWEsVUFBVTtBQUNoRCxvQkFBTSxlQUFlLE1BQU0sS0FBSyxrQkFBa0I7QUFDbEQscUJBQU87QUFBQSxnQkFDTCxHQUFHO0FBQUEsZ0JBQ0g7QUFBQSxnQkFDQTtBQUFBLGdCQUNBLFNBQVMsdUJBQXVCLFdBQVcsS0FBSyxpQkFBaUIsT0FBTyxDQUFDLEtBQUssYUFBYTtBQUFBLGNBQzdGO0FBQUEsWUFDRjtBQUVBLGdCQUFJLFlBQVksY0FBYztBQUM1QixtQkFBSyxpQkFBaUIsS0FBSyxrQkFBa0IsT0FBTyxLQUFLO0FBQ3pELCtCQUFpQixLQUFLO0FBQ3RCLG9CQUFNLEtBQUssa0JBQWtCLFFBQVEsTUFBTSxNQUFNLE1BQVM7QUFBQSxZQUM1RDtBQUVBLGdCQUFJLFlBQVksY0FBYztBQUM1QixvQkFBTSxLQUFLLGtCQUFrQixRQUFRLE1BQU0sTUFBTSxNQUFTO0FBQUEsWUFDNUQ7QUFBQSxVQUNGO0FBRUEsc0JBQVksTUFBTTtBQUNoQixpQkFBSyxjQUFjO0FBQ25CLGlCQUFLLFFBQVE7QUFDYixnQkFBSSxZQUFZLGNBQWM7QUFDNUIsbUJBQUssZ0JBQWdCLENBQUM7QUFDdEIsbUJBQUssaUJBQWlCO0FBQUEsWUFDeEI7QUFBQSxVQUNGLENBQUM7QUFFRCxnQkFBTSxhQUFhLEtBQUssd0JBQXdCO0FBQUEsWUFDOUM7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0YsQ0FBQztBQUNELGVBQUssb0JBQW9CO0FBQUEsWUFDdkI7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0EsU0FBUztBQUFBLFVBQ1g7QUFFQSxjQUFJO0FBQ0YsbUJBQU8sTUFBTTtBQUFBLFVBQ2YsVUFBRTtBQUNBLGdCQUFJLEtBQUssbUJBQW1CLFlBQVksWUFBWTtBQUNsRCxtQkFBSyxvQkFBb0I7QUFBQSxZQUMzQjtBQUFBLFVBQ0Y7QUFBQSxRQUNGLFNBQVMsS0FBSztBQUNaLFVBQUFBLFFBQU8sTUFBTSxtQkFBbUIsR0FBRztBQUNuQyxzQkFBWSxNQUFNO0FBQ2hCLGlCQUFLLFFBQVEsb0JBQW9CLEdBQUc7QUFDcEMsaUJBQUssY0FBYztBQUFBLFVBQ3JCLENBQUM7QUFDRCxnQkFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxxQkFDRSxVQUNBLFFBQ0EsU0FDeUI7QUFDekIsUUFBQUEsUUFBTyxNQUFNLCtCQUErQjtBQUFBLFVBQzFDLG9CQUFvQixTQUFTLE1BQU07QUFBQSxVQUNuQztBQUFBLFFBQ0YsQ0FBQztBQUVELFlBQUksU0FBUyxXQUFXLFNBQVMsTUFBTSxXQUFXLEdBQUc7QUFDbkQsVUFBQUEsUUFBTyxNQUFNLDZCQUE2QjtBQUMxQyxpQkFBTztBQUFBLFFBQ1Q7QUFFQSxjQUFNLGVBQWUsd0JBQXdCLHNCQUN6QztBQUFBLFVBQ0UsdUJBQXVCO0FBQUEsWUFDckIsY0FBYyxRQUFRO0FBQUEsWUFDdEIsWUFBWSxRQUFRO0FBQUEsWUFDcEIsV0FBVyxRQUFRO0FBQUEsWUFDbkIsWUFBWSxRQUFRO0FBQUEsWUFDcEIsU0FBUyxRQUFRO0FBQUEsVUFDbkIsQ0FBQztBQUFBLFFBQ0gsSUFDQSx5QkFBeUI7QUFFN0IsWUFBSSxrQkFBZ0MsRUFBRSxHQUFHLE9BQU87QUFFaEQsWUFBSSx3QkFBd0IsdUJBQXVCO0FBQ2pELDRCQUFrQixnQ0FBZ0MsaUJBQWlCLFNBQVMsVUFBVTtBQUFBLFFBQ3hGO0FBRUEsWUFBSSx3QkFBd0Isd0JBQXdCO0FBQ2xELDRCQUFrQix1QkFBdUIsaUJBQWlCLFFBQVEsT0FBTztBQUFBLFFBQzNFO0FBRUEsWUFBSSwwQkFBMEIsUUFBUSxXQUFXLFFBQVEsR0FBRyxHQUFHO0FBQzdELGdCQUFNLHNCQUFzQiwyQkFBMkIsUUFBUSxLQUFLLFNBQVMsS0FBSztBQUNsRixnQkFBTSxzQkFBc0Isb0JBQW9CLFNBQVMsS0FBSyxhQUFhLEtBQUssSUFBSTtBQUVwRixjQUFJLHFCQUFxQjtBQUN2QixrQkFBTSxnQkFBZ0Isa0JBQWtCLHFCQUFxQixZQUFZO0FBRXpFLGdCQUFJLGVBQWU7QUFDakIsb0JBQU0sa0JBQWtCO0FBQUEsZ0JBQ3RCLE1BQU07QUFBQSxnQkFDTixRQUFRLGNBQWM7QUFBQSxnQkFDdEIsYUFBYTtBQUFBLGNBQ2Y7QUFFQSwwQkFBWSxNQUFNO0FBQ2hCLHFCQUFLLGlCQUFpQjtBQUFBLGNBQ3hCLENBQUM7QUFFRCxxQkFBTztBQUFBLFlBQ1Q7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUVBLGNBQU0sa0JBQWtCLHdCQUF3QixnQ0FDNUMsOEJBQThCLFNBQVMsT0FBTyxpQkFBaUIsTUFBTSxhQUFhLEtBQUssQ0FBQyxJQUN4RixpQkFBaUIsU0FBUyxPQUFPLGlCQUFpQixNQUFNLGFBQWEsS0FBSyxDQUFDO0FBRS9FLFlBQUksQ0FBQyxpQkFBaUI7QUFDcEIsaUJBQU87QUFBQSxRQUNUO0FBRUEsY0FBTSxlQUFlLHdCQUF3Qix5QkFDekMsc0JBQXNCLFFBQVEsS0FBSyxnQkFBZ0IsT0FBTyxRQUFRLFNBQVMsWUFBWSxJQUN2Rix5QkFBeUIsaUJBQWlCLE1BQU0sYUFBYSxLQUFLLENBQUM7QUFFdkUsY0FBTSxTQUFTO0FBQUEsVUFDYixNQUFNO0FBQUEsVUFDTixRQUFRLGdCQUFnQjtBQUFBLFVBQ3hCLGFBQWE7QUFBQSxRQUNmO0FBQ0EsUUFBQUEsUUFBTyxNQUFNLGdCQUFnQixNQUFNO0FBRW5DLG9CQUFZLE1BQU07QUFDaEIsZUFBSyxpQkFBaUI7QUFBQSxRQUN4QixDQUFDO0FBRUQsZUFBTztBQUFBLE1BQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLGVBQXFCO0FBQ25CLFFBQUFBLFFBQU8sTUFBTSxxQkFBcUI7QUFDbEMseUJBQWlCLEtBQUs7QUFDdEIsb0JBQVksTUFBTTtBQUNoQixlQUFLLGNBQWM7QUFBQSxRQUNyQixDQUFDO0FBQUEsTUFDSDtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsVUFBZ0I7QUFDZCxRQUFBQSxRQUFPLE1BQU0sZ0JBQWdCO0FBQzdCLHlCQUFpQixRQUFRO0FBQ3pCLGFBQUssTUFBTTtBQUFBLE1BQ2I7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLFFBQWM7QUFDWixRQUFBQSxRQUFPLE1BQU0sY0FBYztBQUMzQixhQUFLLGdCQUFnQixDQUFDO0FBQ3RCLGFBQUssaUJBQWlCO0FBQ3RCLGFBQUssaUJBQWlCO0FBQ3RCLGFBQUssd0JBQXdCO0FBQzdCLGFBQUssc0JBQXNCO0FBQzNCLGFBQUssUUFBUTtBQUNiLGFBQUssaUJBQWlCO0FBQUEsTUFDeEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLFNBQVMsU0FBOEI7QUFDckMsYUFBSyxRQUFRO0FBQUEsTUFDZjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsSUFBSSxZQUF3QztBQUMxQyxlQUFPLGFBQWEsS0FBSyxhQUFhO0FBQUEsTUFDeEM7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksZ0JBQW1EO0FBQ3JELGVBQU8sbUJBQW1CLEtBQUssYUFBYTtBQUFBLE1BQzlDO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxJQUFJLFdBQWtDO0FBQ3BDLGVBQU8sS0FBSyxjQUFjLFNBQVMsSUFBSSxLQUFLLGNBQWMsQ0FBQyxJQUFJO0FBQUEsTUFDakU7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksbUJBQTRCO0FBQzlCLGVBQU8sS0FBSyxjQUFjLFNBQVM7QUFBQSxNQUNyQztBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSUEsVUFBZ0I7QUFDZCxRQUFBQSxRQUFPLE1BQU0sZ0JBQWdCO0FBQzdCLHlCQUFpQixRQUFRO0FBQ3pCLG9CQUFZLE1BQU07QUFDaEIsZUFBSyxnQkFBZ0I7QUFBQSxRQUN2QixDQUFDO0FBQUEsTUFDSDtBQUFBLE1BRUEsTUFBYyx3QkFBd0IsU0FPRjtBQUNsQyxjQUFNLEVBQUUsS0FBSyxPQUFPLFNBQVMsVUFBVSxXQUFXLFFBQVEsSUFBSTtBQUM5RCxZQUFJO0FBQ0osWUFBSSxZQUFZO0FBQ2hCLFlBQUksUUFBd0IsQ0FBQztBQUU3QixZQUFJLHdCQUF3QixzQkFBc0I7QUFDaEQsZ0JBQU0sU0FBUyxjQUFjLElBQUksUUFBUTtBQUN6QyxjQUFJLFFBQVE7QUFDVixvQkFBUSxPQUFPO0FBQ2Ysb0NBQXdCLE9BQU87QUFDL0Isd0JBQVk7QUFBQSxVQUNkO0FBQUEsUUFDRjtBQUVBLFlBQUksTUFBTSxXQUFXLEdBQUc7QUFDdEIsMkJBQWlCLFVBQVUsRUFBRSxPQUFPLFFBQVEsQ0FBQztBQUM3QyxVQUFBQSxRQUFPLE1BQU0sc0JBQXNCO0FBQ25DLGtCQUFRLE1BQU0saUJBQWlCLGdCQUFnQixHQUFHO0FBQ2xELFVBQUFBLFFBQU8sTUFBTSwwQkFBMEIsTUFBTSxRQUFRLE9BQU87QUFFNUQsY0FBSSx3QkFBd0Isc0JBQXNCO0FBQ2hELDBCQUFjLElBQUk7QUFBQSxjQUNoQixLQUFLO0FBQUEsY0FDTDtBQUFBLGNBQ0EsV0FBVyxLQUFLLElBQUk7QUFBQSxZQUN0QixDQUFDO0FBQUEsVUFDSDtBQUFBLFFBQ0YsT0FBTztBQUNMLFVBQUFBLFFBQU8sTUFBTSw0Q0FBNEM7QUFBQSxRQUMzRDtBQUVBLGNBQU0sYUFBYSx5QkFBeUIsY0FBYyxLQUFLO0FBQy9ELGNBQU0sYUFBYSw0QkFBNEIsS0FBSztBQUNwRCxjQUFNLFVBQVUsdUJBQXVCLFdBQVcsS0FBSyxpQkFBaUIsT0FBTyxDQUFDO0FBRWhGLFlBQUksd0JBQXdCLHdCQUF3QixNQUFNLFNBQVMsR0FBRztBQUNwRSx3QkFBYyxJQUFJO0FBQUEsWUFDaEIsS0FBSztBQUFBLFlBQ0w7QUFBQSxZQUNBLGlCQUFpQjtBQUFBLFlBQ2pCLFdBQVcsS0FBSyxJQUFJO0FBQUEsVUFDdEIsQ0FBQztBQUFBLFFBQ0g7QUFFQSxZQUFJLENBQUMsU0FBUztBQUNaLHNCQUFZLE1BQU07QUFDaEIsaUJBQUssd0JBQXdCO0FBQzdCLGlCQUFLLHNCQUFzQjtBQUMzQixnQkFBSSxZQUFZLGNBQWM7QUFDNUIsbUJBQUssZ0JBQWdCO0FBQ3JCLG1CQUFLLGlCQUFpQjtBQUFBLFlBQ3hCO0FBQ0EsaUJBQUssY0FBYztBQUFBLFVBQ3JCLENBQUM7QUFBQSxRQUNILFdBQVcsS0FBSyxtQkFBbUIsWUFBWSxTQUFTO0FBQ3RELHNCQUFZLE1BQU07QUFDaEIsaUJBQUssY0FBYztBQUFBLFVBQ3JCLENBQUM7QUFBQSxRQUNIO0FBRUEsZUFBTztBQUFBLFVBQ0w7QUFBQSxVQUNBLGFBQWE7QUFBQSxVQUNiLE9BQU87QUFBQSxVQUNQO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUVBLElBQUksc0JBQThCO0FBQ2hDLFlBQUksS0FBSyxPQUFPO0FBQ2QsaUJBQU87QUFBQSxRQUNUO0FBRUEsWUFBSSxLQUFLLGdCQUFnQjtBQUN2QixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxZQUFJLEtBQUssYUFBYTtBQUNwQixpQkFBTyxLQUFLLHdCQUF3QixlQUNoQyxnQ0FDQTtBQUFBLFFBQ047QUFFQSxZQUFJLENBQUMsS0FBSyxlQUFlO0FBQ3ZCLGlCQUFPO0FBQUEsUUFDVDtBQUVBLFlBQUksS0FBSyx3QkFBd0IsTUFBTTtBQUNyQyxpQkFBTztBQUFBLFFBQ1Q7QUFFQSxlQUFPLEtBQUssd0JBQXdCLHVCQUF1QjtBQUFBLE1BQzdEO0FBQUEsSUFDRjtBQUdPLElBQU0sa0JBQWtCLElBQUksZ0JBQWdCO0FBQUE7QUFBQTs7O0FDaGdCbkQsU0FBUyxzQkFBQUMscUJBQW9CLFVBQUFDLFNBQVEsWUFBQUMsaUJBQWdCO0FBTHJELElBa0JhLGlCQW9NQTtBQXROYjtBQUFBO0FBQUE7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQVNPLElBQU0sa0JBQU4sTUFBc0I7QUFBQSxNQUMzQixlQUE2QixFQUFFLEdBQUcsc0JBQXNCO0FBQUE7QUFBQSxNQUV4RCxrQkFBOEM7QUFBQSxNQUM5QyxRQUFRO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFFVixjQUFjO0FBQ1osUUFBQUYsb0JBQW1CLE1BQU07QUFBQSxVQUN2QixnQkFBZ0JDO0FBQUEsVUFDaEIsaUJBQWlCQTtBQUFBLFVBQ2pCLHNCQUFzQkE7QUFBQSxVQUN0QixhQUFhQTtBQUFBLFVBQ2IsaUJBQWlCQTtBQUFBLFVBQ2pCLGlCQUFpQkE7QUFBQSxVQUNqQixVQUFVQTtBQUFBLFVBQ1YsWUFBWUE7QUFBQSxRQUNkLENBQUM7QUFFRCxhQUFLLG1CQUFtQjtBQUV4QixRQUFBQztBQUFBLFVBQ0UsT0FBTztBQUFBLFlBQ0wsY0FBYyxLQUFLO0FBQUEsWUFDbkIsaUJBQWlCLEtBQUs7QUFBQSxZQUN0QixPQUFPLEtBQUs7QUFBQSxZQUNaLFNBQVMsS0FBSztBQUFBLFlBQ2QscUJBQXFCLHdCQUF3QjtBQUFBLFVBQy9DO0FBQUEsVUFDQSxDQUFDLEVBQUUsb0JBQW9CLE1BQU07QUFDM0IsZ0JBQUksQ0FBQyxxQkFBcUI7QUFDeEIsbUJBQUssc0JBQXNCO0FBQzNCO0FBQUEsWUFDRjtBQUVBLGlCQUFLLGlCQUFpQjtBQUFBLFVBQ3hCO0FBQUEsVUFDQSxFQUFFLGlCQUFpQixLQUFLO0FBQUEsUUFDMUI7QUFBQSxNQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxlQUFlLFFBQW9CLE9BQXFCO0FBQ3RELGNBQU0sZUFBZSxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksS0FBSyxLQUFLLENBQUM7QUFDckQsYUFBSyxrQkFBa0I7QUFDdkIsYUFBSyxlQUFlO0FBQUEsVUFDbEIsR0FBRyxLQUFLO0FBQUEsVUFDUixDQUFDLE1BQU0sR0FBRztBQUFBLFFBQ1o7QUFBQSxNQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxnQkFBZ0IsUUFBNEI7QUFDMUMsYUFBSyxlQUFlLEVBQUUsR0FBRyxPQUFPO0FBQUEsTUFDbEM7QUFBQSxNQUVBLHFCQUFxQixVQUtaO0FBQ1AsYUFBSyxlQUFlLEVBQUUsR0FBRyxTQUFTLGFBQWE7QUFDL0MsYUFBSyxrQkFBa0IsU0FBUztBQUNoQyxhQUFLLFFBQVEsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksU0FBUyxLQUFLLENBQUM7QUFDckQsYUFBSyxVQUFVLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLFNBQVMsT0FBTyxDQUFDO0FBQUEsTUFDM0Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLFlBQVksVUFBcUM7QUFDL0MsY0FBTSxTQUFTLHFCQUFxQixLQUFLLE9BQUssRUFBRSxPQUFPLFFBQVE7QUFDL0QsWUFBSSxRQUFRO0FBQ1YsZUFBSyxrQkFBa0I7QUFDdkIsZUFBSyxlQUFlLEVBQUUsR0FBRyxPQUFPLE9BQU87QUFBQSxRQUN6QztBQUFBLE1BQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLGtCQUF3QjtBQUN0QixhQUFLLGtCQUFrQjtBQUN2QixhQUFLLGVBQWUsRUFBRSxHQUFHLHNCQUFzQjtBQUFBLE1BQ2pEO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxrQkFBd0I7QUFDdEIsYUFBSyxlQUFlLHNCQUFzQixLQUFLLFlBQVk7QUFBQSxNQUM3RDtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsU0FBUyxPQUFxQjtBQUM1QixhQUFLLFFBQVEsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksS0FBSyxDQUFDO0FBQUEsTUFDOUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLFdBQVcsT0FBcUI7QUFDOUIsYUFBSyxVQUFVLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEtBQUssQ0FBQztBQUFBLE1BQ2hEO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxJQUFJLGtCQUEwQjtBQUM1QixlQUFPLE9BQU8sT0FBTyxLQUFLLFlBQVksRUFBRSxPQUFPLENBQUMsS0FBSyxRQUFRLE1BQU0sS0FBSyxDQUFDO0FBQUEsTUFDM0U7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksVUFBbUI7QUFDckIsY0FBTSxFQUFFLE1BQU0sSUFBSSxxQkFBcUIsS0FBSyxZQUFZO0FBQ3hELGVBQU87QUFBQSxNQUNUO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxJQUFJLGtCQUFxRDtBQUN2RCxlQUFPLHFCQUFxQixLQUFLLFlBQVk7QUFBQSxNQUMvQztBQUFBLE1BRUEsSUFBSSxrQkFBOEM7QUFDaEQsZUFBTyxLQUFLO0FBQUEsTUFDZDtBQUFBLE1BRUEsSUFBSSxxQkFBNkI7QUFDL0IsWUFBSSxLQUFLLG9CQUFvQixNQUFNO0FBQ2pDLGlCQUFPO0FBQUEsUUFDVDtBQUVBLGVBQU8scUJBQXFCLEtBQUssQ0FBQyxXQUFXLE9BQU8sT0FBTyxLQUFLLGVBQWUsR0FBRyxTQUFTO0FBQUEsTUFDN0Y7QUFBQSxNQUVRLHFCQUEyQjtBQUNqQyxZQUFJO0FBQ0YsZ0JBQU0sUUFBUSxhQUFhLFFBQVEseUJBQXlCO0FBQzVELGNBQUksQ0FBQyxPQUFPO0FBQ1Y7QUFBQSxVQUNGO0FBRUEsZ0JBQU0sU0FBUyxLQUFLLE1BQU0sS0FBSztBQUMvQixjQUFJLE9BQU8sY0FBYztBQUN2QixpQkFBSyxlQUFlLEVBQUUsR0FBRyx1QkFBdUIsR0FBRyxPQUFPLGFBQWE7QUFBQSxVQUN6RTtBQUNBLGNBQUksT0FBTyxvQkFBb0IsUUFBVztBQUN4QyxpQkFBSyxrQkFBa0IsT0FBTztBQUFBLFVBQ2hDO0FBQ0EsY0FBSSxPQUFPLE9BQU8sVUFBVSxVQUFVO0FBQ3BDLGlCQUFLLFFBQVEsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksT0FBTyxLQUFLLENBQUM7QUFBQSxVQUNyRDtBQUNBLGNBQUksT0FBTyxPQUFPLFlBQVksVUFBVTtBQUN0QyxpQkFBSyxVQUFVLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLE9BQU8sT0FBTyxDQUFDO0FBQUEsVUFDekQ7QUFBQSxRQUNGLFNBQVMsT0FBTztBQUNkLGtCQUFRLE1BQU0sc0RBQXNELEtBQUs7QUFBQSxRQUMzRTtBQUFBLE1BQ0Y7QUFBQSxNQUVRLG1CQUF5QjtBQUMvQixZQUFJO0FBQ0YsZ0JBQU0sV0FBa0M7QUFBQSxZQUN0QyxjQUFjLEtBQUs7QUFBQSxZQUNuQixpQkFBaUIsS0FBSztBQUFBLFlBQ3RCLE9BQU8sS0FBSztBQUFBLFlBQ1osU0FBUyxLQUFLO0FBQUEsVUFDaEI7QUFFQSx1QkFBYSxRQUFRLDJCQUEyQixLQUFLLFVBQVUsUUFBUSxDQUFDO0FBQUEsUUFDMUUsU0FBUyxPQUFPO0FBQ2Qsa0JBQVEsTUFBTSxzREFBc0QsS0FBSztBQUFBLFFBQzNFO0FBQUEsTUFDRjtBQUFBLE1BRVEsd0JBQThCO0FBQ3BDLFlBQUk7QUFDRix1QkFBYSxXQUFXLHlCQUF5QjtBQUFBLFFBQ25ELFNBQVMsT0FBTztBQUNkLGtCQUFRLE1BQU0sNERBQTRELEtBQUs7QUFBQSxRQUNqRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBR08sSUFBTSxrQkFBa0IsSUFBSSxnQkFBZ0I7QUFBQTtBQUFBOzs7QUNqTm5ELFNBQVMsc0JBQUFDLHFCQUFvQixVQUFBQyxTQUFRLFlBQUFDLFdBQVUsZUFBQUMsb0JBQW1CO0FBQ2xFLFNBQVMsU0FBQUMsY0FBMkI7QUFOcEMsSUEwQk1DLFNBRU8sZ0JBNHZDQTtBQXh4Q2I7QUFBQTtBQUFBO0FBT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNBO0FBQ0E7QUFFQSxJQUFNQSxVQUFTLGtCQUFrQixnQkFBZ0I7QUFFMUMsSUFBTSxpQkFBTixNQUFxQjtBQUFBLE1BQ2xCLFFBQWUsSUFBSUQsT0FBTTtBQUFBLE1BQ2pDLE1BQU0sS0FBSyxNQUFNLElBQUk7QUFBQSxNQUNyQixlQUFlLEtBQUssTUFBTSxJQUFJO0FBQUEsTUFDOUIsZ0JBQWdCLG9CQUFvQjtBQUFBLE1BQ3BDLFVBQWtCLENBQUM7QUFBQSxNQUNuQixXQUFnRDtBQUFBLE1BQ2hELG1CQUFzQztBQUFBLE1BQ3RDLGdCQUFnQjtBQUFBLE1BQ2hCLCtCQUE4QztBQUFBLE1BQzlDLGFBQWE7QUFBQSxNQUNiLGtCQUFrQjtBQUFBO0FBQUEsTUFDbEIsaUJBQTRCO0FBQUE7QUFBQSxNQUM1QixlQUFlO0FBQUE7QUFBQSxNQUNmLGlCQUFpQjtBQUFBO0FBQUEsTUFDakIsb0JBQXFEO0FBQUE7QUFBQSxNQUNyRCx3QkFBa0Q7QUFBQTtBQUFBLE1BQ2xELG1CQUFtQjtBQUFBO0FBQUE7QUFBQSxNQUdYLHNCQUF5RCxDQUFDO0FBQUEsTUFDMUQsWUFBb0IsQ0FBQztBQUFBO0FBQUEsTUFDckIscUJBQXVDLENBQUM7QUFBQSxNQUN4QyxrQkFBb0MsQ0FBQztBQUFBLE1BQ3JDLHdCQUF1QztBQUFBLE1BQ3ZDLG1CQUEwQztBQUFBO0FBQUEsTUFDakMsa0JBQWtCO0FBQUEsTUFDbEIsa0JBQWtCO0FBQUEsTUFDbEIsMEJBQTBCO0FBQUEsTUFDMUIsY0FBYztBQUFBO0FBQUEsTUFFL0IsY0FBYztBQUNaLFFBQUFKLG9CQUFtQixNQUFNO0FBQUEsVUFDdkIsU0FBU0M7QUFBQSxVQUNULFNBQVNBO0FBQUEsVUFDVCxVQUFVQTtBQUFBLFVBQ1YsZUFBZUE7QUFBQSxVQUNmLE9BQU9BO0FBQUEsVUFDUCxNQUFNQTtBQUFBLFVBQ04sWUFBWUE7QUFBQSxVQUNaLFlBQVlBO0FBQUEsVUFDWixhQUFhQTtBQUFBLFVBQ2IsbUJBQW1CQTtBQUFBLFVBQ25CLFdBQVdBO0FBQUEsVUFDWCxpQkFBaUJBO0FBQUEsVUFDakIsa0JBQWtCQTtBQUFBLFVBQ2xCLG9CQUFvQkE7QUFBQSxVQUNwQixrQkFBa0JBO0FBQUEsVUFDbEIsMEJBQTBCQTtBQUFBLFVBQzFCLHNCQUFzQkE7QUFBQSxVQUN0QixpQkFBaUJBO0FBQUEsVUFDakIsbUJBQW1CQTtBQUFBLFFBQ3JCLENBQUM7QUFHRCxhQUFLLHNCQUFzQjtBQUUzQixRQUFBQztBQUFBLFVBQ0UsTUFBTSx3QkFBd0I7QUFBQSxVQUM5QixDQUFDLHdCQUF3QjtBQUN2QixnQkFBSSxDQUFDLHFCQUFxQjtBQUN4QixtQkFBSyx5QkFBeUI7QUFDOUI7QUFBQSxZQUNGO0FBRUEsaUJBQUssaUJBQWlCO0FBQUEsVUFDeEI7QUFBQSxVQUNBLEVBQUUsaUJBQWlCLEtBQUs7QUFBQSxRQUMxQjtBQUVBLFFBQUFHLFFBQU8sTUFBTSx5QkFBeUIsS0FBSyxHQUFHO0FBQUEsTUFDaEQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLFlBQVksU0FBd0I7QUFDbEMsYUFBSyxrQkFBa0I7QUFDdkIsUUFBQUEsUUFBTyxNQUFNLHFCQUFxQixPQUFPO0FBQUEsTUFDM0M7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLGtCQUFrQixNQUF1QjtBQUN2QyxhQUFLLGlCQUFpQjtBQUN0QixRQUFBQSxRQUFPLE1BQU0scUJBQXFCLFNBQVMsTUFBTSxVQUFVLE9BQU87QUFBQSxNQUNwRTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsUUFDRSxLQUNBLFVBTUksQ0FBQyxHQUNJO0FBQ1QsWUFBSTtBQUNGLGdCQUFNO0FBQUEsWUFDSix5QkFBeUI7QUFBQSxZQUN6QjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0YsSUFBSTtBQUNKLFVBQUFBLFFBQU8sTUFBTSxtQkFBbUIsR0FBRztBQUNuQyxnQkFBTSxXQUFXLElBQUlELE9BQU0sR0FBRztBQUM5QixlQUFLLFFBQVE7QUFDYixlQUFLLGtCQUFrQjtBQUFBLFlBQ3JCLGVBQWUsYUFBYSxvQkFBb0I7QUFBQSxZQUNoRCxjQUFjLGdCQUFnQjtBQUFBLFlBQzlCO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGLENBQUM7QUFDRCxlQUFLLFlBQVk7QUFDakIsZUFBSyxnQkFBZ0I7QUFDckIsZUFBSywrQkFBK0I7QUFDcEMsMEJBQWdCLE1BQU07QUFDdEIsVUFBQUMsUUFBTyxNQUFNLHlCQUF5QjtBQUN0QyxpQkFBTztBQUFBLFFBQ1QsU0FBUyxLQUFLO0FBQ1osVUFBQUEsUUFBTyxNQUFNLGtCQUFrQixHQUFHO0FBQ2xDLGVBQUssZ0JBQWdCLGdCQUFnQixHQUFHO0FBQ3hDLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLFFBQ0VDLE1BQ0EsVUFBb0UsQ0FBQyxHQUM1RDtBQUNULFlBQUk7QUFDRixnQkFBTSxFQUFFLHlCQUF5QixNQUFNLFVBQVUsSUFBSTtBQUNyRCxVQUFBRCxRQUFPLE1BQU0sZ0JBQWdCO0FBQzdCLGdCQUFNLFdBQVcsSUFBSUQsT0FBTTtBQUMzQixtQkFBUyxRQUFRRSxJQUFHO0FBQ3BCLGdCQUFNLGVBQWUsbUJBQW1CLFNBQVMsT0FBTyxHQUFHLElBQUlGLE9BQU0sRUFBRSxJQUFJLENBQUM7QUFDNUUsZUFBSyxRQUFRO0FBQ2IsZUFBSyxrQkFBa0I7QUFBQSxZQUNyQixlQUFlLGFBQWEsb0JBQW9CO0FBQUEsWUFDaEQ7QUFBQSxZQUNBO0FBQUEsVUFDRixDQUFDO0FBQ0QsZUFBSyxZQUFZO0FBQ2pCLGVBQUssZ0JBQWdCO0FBQ3JCLGVBQUssK0JBQStCO0FBQ3BDLDBCQUFnQixNQUFNO0FBQ3RCLGlCQUFPO0FBQUEsUUFDVCxTQUFTLEtBQUs7QUFDWixVQUFBQyxRQUFPLE1BQU0sa0JBQWtCLEdBQUc7QUFDbEMsZUFBSyxnQkFBZ0IsZ0JBQWdCLEdBQUc7QUFDeEMsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFNQSxTQUFTLE1BQWMsSUFBWSxZQUFZLEtBQWM7QUFDM0QsUUFBQUEsUUFBTyxNQUFNLG1CQUFtQixFQUFFLE1BQU0sSUFBSSxXQUFXLFlBQVksS0FBSyxLQUFLLGFBQWEsS0FBSyxNQUFNLEtBQUssRUFBRSxDQUFDO0FBRTdHLFlBQUk7QUFHRixnQkFBTSxPQUFPLEtBQUssTUFBTSxLQUFLO0FBQUEsWUFDM0I7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0YsQ0FBQztBQUVELGNBQUksTUFBTTtBQUNSLFlBQUFBLFFBQU8sTUFBTSxvQkFBb0IsS0FBSyxHQUFHO0FBRXpDLGlCQUFLLGVBQWU7QUFDcEIsaUJBQUsscUJBQXFCLE1BQU0sS0FBSztBQUVyQyxpQkFBSyxZQUFZO0FBQ2pCLGlCQUFLLFdBQVcsRUFBRSxNQUFNLEdBQUc7QUFDM0IsaUJBQUssbUJBQW1CO0FBQ3hCLGlCQUFLLGdCQUFnQixlQUFlLEtBQUssR0FBRztBQUM1Qyw0QkFBZ0IsTUFBTTtBQUN0QixpQkFBSywrQkFBK0I7QUFHcEMsaUJBQUssa0JBQWtCLElBQUk7QUFNM0IsZ0JBQUksS0FBSyxtQkFBbUIsQ0FBQyxLQUFLLGNBQWMsS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLGdCQUFnQjtBQUN6RixjQUFBQSxRQUFPLE1BQU0seUNBQXlDLEtBQUssY0FBYztBQUN6RSx5QkFBVyxNQUFNO0FBQ2YscUJBQUssY0FBYyxJQUFJLEVBQUUsTUFBTSxTQUFPO0FBQ3BDLGtCQUFBQSxRQUFPLE1BQU0sb0JBQW9CLEdBQUc7QUFBQSxnQkFDdEMsQ0FBQztBQUFBLGNBQ0gsR0FBRyxHQUFHO0FBQUEsWUFDUjtBQUdBLG1CQUFPO0FBQUEsVUFDVCxPQUFPO0FBQ0wsWUFBQUEsUUFBTyxNQUFNLHNDQUFzQztBQUVuRCxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGLFNBQVMsS0FBSztBQUNaLFVBQUFBLFFBQU8sTUFBTSxtQkFBbUIsR0FBRztBQUVuQyxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQU1BLE1BQU0sWUFDSixLQUNBLFVBQTJDLENBQUMsR0FDMUI7QUFDbEIsWUFBSSxJQUFJLFNBQVMsRUFBRyxRQUFPO0FBRTNCLGNBQU0sT0FBTyxJQUFJLE1BQU0sR0FBRyxDQUFDO0FBQzNCLGNBQU0sS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDO0FBQ3pCLGNBQU0sWUFBWSxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSTtBQUU1QyxZQUFJO0FBQ0YsZ0JBQU0sT0FBTyxLQUFLLE1BQU0sS0FBSztBQUFBLFlBQzNCO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGLENBQUM7QUFFRCxjQUFJLE1BQU07QUFFUixpQkFBSyxlQUFlO0FBQ3BCLGlCQUFLLHFCQUFxQixNQUFNLFFBQVEscUJBQXFCLEtBQUs7QUFDbEUsaUJBQUssWUFBWTtBQUNqQixpQkFBSyxXQUFXLEVBQUUsTUFBTSxHQUFHO0FBQzNCLGlCQUFLLG1CQUFtQjtBQUN4QixpQkFBSyxnQkFBZ0Isa0JBQWtCLEtBQUssR0FBRztBQUMvQyw0QkFBZ0IsTUFBTTtBQUN0QixtQkFBTztBQUFBLFVBQ1Q7QUFDQSxpQkFBTztBQUFBLFFBQ1QsUUFBUTtBQUNOLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLE1BQU0sY0FBYyxnQkFBZ0IsT0FBeUM7QUFDM0UsWUFBSSxLQUFLLFlBQVk7QUFDbkIsZUFBSyxnQkFBZ0I7QUFDckIsaUJBQU87QUFBQSxRQUNUO0FBRUEsWUFBSTtBQUNGLFVBQUFGLGFBQVksTUFBTTtBQUNoQixpQkFBSyxhQUFhO0FBQ2xCLGlCQUFLLGdCQUFnQjtBQUFBLFVBQ3ZCLENBQUM7QUFHRCxjQUFJLENBQUMsZ0JBQWdCLGVBQWU7QUFDbEMsa0JBQU0sZ0JBQWdCLFdBQVc7QUFBQSxVQUNuQztBQUdBLGdCQUFNLFdBQVcsTUFBTSxnQkFBZ0I7QUFBQSxZQUNyQyxLQUFLO0FBQUEsWUFDTCxnQkFBZ0I7QUFBQSxZQUNoQixnQkFBZ0I7QUFBQSxZQUNoQjtBQUFBLFVBQ0Y7QUFHQSxjQUFJLFNBQVMsV0FBVyxTQUFTLE1BQU0sV0FBVyxHQUFHO0FBQ25ELFlBQUFBLGFBQVksTUFBTTtBQUNoQixrQkFBSSxTQUFTLFNBQVM7QUFDcEIscUJBQUssZ0JBQWdCO0FBQUEsY0FDdkIsV0FBVyxLQUFLLGFBQWE7QUFDM0IscUJBQUssZ0JBQWdCO0FBQUEsY0FDdkIsV0FBVyxLQUFLLGFBQWE7QUFDM0IscUJBQUssZ0JBQWdCO0FBQUEsY0FDdkIsV0FBVyxLQUFLLFFBQVE7QUFDdEIscUJBQUssZ0JBQWdCO0FBQUEsY0FDdkIsT0FBTztBQUNMLHFCQUFLLGdCQUFnQjtBQUFBLGNBQ3ZCO0FBQ0EsbUJBQUssK0JBQStCLFNBQVMsVUFBVSx3REFBd0Q7QUFDL0csbUJBQUssYUFBYTtBQUFBLFlBQ3BCLENBQUM7QUFDRCxtQkFBTztBQUFBLFVBQ1Q7QUFHQSxnQkFBTSxVQUFVLGdCQUFnQixtQkFBbUI7QUFDbkQsZ0JBQU0sU0FBUyxnQkFBZ0IscUJBQXFCLFVBQVUsZ0JBQWdCLGNBQWM7QUFBQSxZQUMxRixLQUFLLEtBQUs7QUFBQSxZQUNWLGNBQWMsS0FBSztBQUFBLFlBQ25CLFdBQVcsS0FBSztBQUFBLFlBQ2hCLFlBQVksS0FBSztBQUFBLFlBQ2pCO0FBQUEsVUFDRixDQUFDO0FBRUQsY0FBSSxRQUFRO0FBQ1YsZ0JBQUksaUJBQWlCLHdCQUF3Qix5QkFBeUI7QUFDcEUsb0JBQU0sVUFBVSxzQkFBc0I7QUFBQSxnQkFDcEMsWUFBWSxTQUFTO0FBQUEsZ0JBQ3JCO0FBQUEsZ0JBQ0EsUUFBUSxPQUFPO0FBQUEsY0FDakIsQ0FBQztBQUNELG9CQUFNLEtBQUssS0FBSyxPQUFPO0FBQUEsWUFDekI7QUFFQSxnQkFBSSxDQUFDLHFCQUFxQixLQUFLLEtBQUssU0FBUyxXQUFXLEdBQUc7QUFDekQsY0FBQUEsYUFBWSxNQUFNO0FBQ2hCLHFCQUFLLGdCQUFnQjtBQUNyQixxQkFBSywrQkFBK0I7QUFDcEMscUJBQUssYUFBYTtBQUFBLGNBQ3BCLENBQUM7QUFDRCxxQkFBTztBQUFBLFlBQ1Q7QUFHQSxrQkFBTSxjQUFjLE1BQU0sS0FBSyxZQUFZLE9BQU8sS0FBSyxNQUFNO0FBQUEsY0FDM0QsbUJBQW1CLE9BQU8sZUFBZTtBQUFBLFlBQzNDLENBQUM7QUFFRCxnQkFBSSxhQUFhO0FBQ2YsY0FBQUEsYUFBWSxNQUFNO0FBQ2hCLHFCQUFLLG1CQUFtQixPQUFPO0FBQy9CLHFCQUFLLGdCQUFnQixPQUFPLGNBQ3hCLGtDQUNBLGtCQUFrQixjQUFjLE9BQU8sTUFBTSxDQUFDO0FBQ2xELHFCQUFLLCtCQUErQjtBQUNwQyxxQkFBSyxhQUFhO0FBQUEsY0FDcEIsQ0FBQztBQUFBLFlBQ0gsT0FBTztBQUNMLGNBQUFBLGFBQVksTUFBTTtBQUNoQixxQkFBSyxnQkFBZ0I7QUFDckIscUJBQUssYUFBYTtBQUFBLGNBQ3BCLENBQUM7QUFBQSxZQUNIO0FBRUEsbUJBQU87QUFBQSxVQUNULE9BQU87QUFDTCxZQUFBQSxhQUFZLE1BQU07QUFDaEIsbUJBQUssZ0JBQWdCO0FBQ3JCLG1CQUFLLGFBQWE7QUFBQSxZQUNwQixDQUFDO0FBQ0QsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRixTQUFTLEtBQUs7QUFDWixVQUFBRSxRQUFPLE1BQU0sd0JBQXdCLEdBQUc7QUFDeEMsVUFBQUYsYUFBWSxNQUFNO0FBQ2hCLGlCQUFLLGdCQUFnQixVQUFVLEdBQUc7QUFDbEMsaUJBQUssYUFBYTtBQUFBLFVBQ3BCLENBQUM7QUFDRCxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxRQUFjO0FBQ1osUUFBQUUsUUFBTyxNQUFNLGNBQWM7QUFDM0IsYUFBSyxRQUFRLElBQUlELE9BQU07QUFDdkIsYUFBSyxrQkFBa0I7QUFBQSxVQUNyQixlQUFlLG9CQUFvQjtBQUFBLFVBQ25DLGNBQWMsS0FBSyxNQUFNLElBQUk7QUFBQSxVQUM3Qix3QkFBd0I7QUFBQSxRQUMxQixDQUFDO0FBQ0QsYUFBSyxZQUFZO0FBQ2pCLGFBQUssV0FBVztBQUNoQixhQUFLLG1CQUFtQjtBQUN4QixhQUFLLGdCQUFnQjtBQUNyQixhQUFLLCtCQUErQjtBQUNwQyx3QkFBZ0IsTUFBTTtBQUN0QixRQUFBQyxRQUFPLE1BQU0seUJBQXlCLEtBQUssR0FBRztBQUFBLE1BQ2hEO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxPQUFnQjtBQUNkLFFBQUFBLFFBQU8sTUFBTSxnQ0FBZ0MsS0FBSyxRQUFRLE1BQU07QUFHaEUsWUFBSSxLQUFLLG1CQUFtQixLQUFLLFFBQVEsVUFBVSxHQUFHO0FBRXBELGdCQUFNLFdBQVcsS0FBSyxRQUFRLEtBQUssUUFBUSxTQUFTLENBQUM7QUFDckQsZ0JBQU0sZ0JBQWdCLFNBQVM7QUFHL0IsY0FBSSxrQkFBa0IsS0FBSyxnQkFBZ0I7QUFDekMsZ0JBQUksS0FBSyxVQUFVLENBQUMsR0FBRztBQUNyQixtQkFBSyxZQUFZO0FBQ2pCLG1CQUFLLFdBQVc7QUFDaEIsbUJBQUssbUJBQW1CO0FBQ3hCLG1CQUFLLGdCQUFnQjtBQUNyQiw4QkFBZ0IsTUFBTTtBQUN0QixjQUFBQSxRQUFPLE1BQU0sZUFBZTtBQUM1QixxQkFBTztBQUFBLFlBQ1Q7QUFBQSxVQUNGLE9BQU87QUFFTCxnQkFBSSxLQUFLLFVBQVUsQ0FBQyxHQUFHO0FBQ3JCLG1CQUFLLFlBQVk7QUFDakIsbUJBQUssV0FBVztBQUNoQixtQkFBSyxtQkFBbUI7QUFDeEIsbUJBQUssZ0JBQWdCO0FBQ3JCLDhCQUFnQixNQUFNO0FBQ3RCLGNBQUFBLFFBQU8sTUFBTSxjQUFjO0FBQzNCLHFCQUFPO0FBQUEsWUFDVDtBQUFBLFVBQ0Y7QUFBQSxRQUNGLE9BQU87QUFFTCxjQUFJLEtBQUssVUFBVSxDQUFDLEdBQUc7QUFDckIsaUJBQUssWUFBWTtBQUNqQixpQkFBSyxXQUFXO0FBQ2hCLGlCQUFLLG1CQUFtQjtBQUN4QixpQkFBSyxnQkFBZ0I7QUFDckIsNEJBQWdCLE1BQU07QUFDdEIsWUFBQUEsUUFBTyxNQUFNLGNBQWM7QUFDM0IsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUVBLFFBQUFBLFFBQU8sTUFBTSxnQ0FBZ0M7QUFDN0MsZUFBTztBQUFBLE1BQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtRLGNBQW9CO0FBQzFCLGFBQUssTUFBTSxLQUFLLE1BQU0sSUFBSTtBQUMxQixhQUFLLFVBQVUsS0FBSyxNQUFNLFFBQVEsRUFBRSxTQUFTLEtBQUssQ0FBQztBQUNuRCxhQUFLLHdCQUF3QjtBQUU3QixhQUFLLGlCQUFpQjtBQUN0QixRQUFBQSxRQUFPLE1BQU0sc0JBQXNCLEtBQUssS0FBSyxtQkFBbUIsS0FBSyxRQUFRLE1BQU07QUFHbkYsWUFBSSxLQUFLLGtCQUFrQixDQUFDLEtBQUssY0FBYyxDQUFDLEtBQUssa0JBQWtCO0FBR3JFLGVBQUssc0JBQXNCLENBQUM7QUFFNUIsY0FBSSxLQUFLLGtCQUFrQjtBQUN6Qix5QkFBYSxLQUFLLGdCQUFnQjtBQUFBLFVBQ3BDO0FBRUEsZUFBSyxtQkFBbUIsV0FBVyxNQUFNO0FBQ3ZDLGlCQUFLLGdCQUFnQixFQUFFLE1BQU0sU0FBTztBQUNsQyxjQUFBQSxRQUFPLE1BQU0sNEJBQTRCLEdBQUc7QUFBQSxZQUM5QyxDQUFDO0FBQUEsVUFDSCxHQUFHLEdBQUc7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsWUFBa0I7QUFDaEIsYUFBSyxlQUFlLENBQUMsS0FBSztBQUUxQixhQUFLLGlCQUFpQixLQUFLLG1CQUFtQixNQUFNLE1BQU07QUFDMUQsUUFBQUEsUUFBTyxNQUFNLCtCQUErQixLQUFLLGVBQWUsVUFBVSxTQUFTLHlCQUF5QixLQUFLLG1CQUFtQixNQUFNLFVBQVUsT0FBTztBQUFBLE1BQzdKO0FBQUEsTUFFQSxnQkFBZ0IsU0FBd0I7QUFDdEMsWUFBSSxLQUFLLGlCQUFpQixTQUFTO0FBQ2pDLGVBQUssVUFBVTtBQUFBLFFBQ2pCO0FBQUEsTUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsbUJBQXlCO0FBQ3ZCLFlBQUk7QUFDRixnQkFBTSxhQUFhLEtBQUs7QUFHeEIsdUJBQWEsUUFBUSxLQUFLLGlCQUFpQixVQUFVO0FBR3JELGdCQUFNLGNBQWMsYUFBYSxRQUFRLEtBQUssZUFBZTtBQUM3RCxjQUFJLFVBQW9CLGNBQWMsS0FBSyxNQUFNLFdBQVcsSUFBSSxDQUFDO0FBRWpFLGNBQUksUUFBUSxXQUFXLEtBQUssUUFBUSxRQUFRLFNBQVMsQ0FBQyxNQUFNLFlBQVk7QUFDdEUsb0JBQVEsS0FBSyxVQUFVO0FBRXZCLGdCQUFJLFFBQVEsU0FBUyxLQUFLLGFBQWE7QUFDckMsd0JBQVUsUUFBUSxNQUFNLENBQUMsS0FBSyxXQUFXO0FBQUEsWUFDM0M7QUFFQSx5QkFBYSxRQUFRLEtBQUssaUJBQWlCLEtBQUssVUFBVSxPQUFPLENBQUM7QUFBQSxVQUNwRTtBQUVBLGNBQUksd0JBQXdCLHFCQUFxQjtBQUMvQyxrQkFBTSxhQUFrQztBQUFBLGNBQ3RDO0FBQUEsY0FDQSxZQUFZO0FBQUEsY0FDWixlQUFlLEtBQUs7QUFBQSxjQUNwQixjQUFjLEtBQUs7QUFBQSxjQUNuQixvQkFBb0IsS0FBSztBQUFBLGNBQ3pCLGlCQUFpQixLQUFLO0FBQUEsWUFDeEI7QUFDQSx5QkFBYSxRQUFRLEtBQUsseUJBQXlCLEtBQUssVUFBVSxVQUFVLENBQUM7QUFBQSxVQUMvRSxPQUFPO0FBQ0wsaUJBQUsseUJBQXlCO0FBQUEsVUFDaEM7QUFFQSxVQUFBQSxRQUFPLE1BQU0sd0NBQXdDLFFBQVEsTUFBTTtBQUFBLFFBQ3JFLFNBQVMsS0FBSztBQUNaLFVBQUFBLFFBQU8sTUFBTSxrQ0FBa0MsR0FBRztBQUFBLFFBQ3BEO0FBQUEsTUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS1Esd0JBQThCO0FBQ3BDLFlBQUk7QUFDRixnQkFBTSxXQUFXLGFBQWEsUUFBUSxLQUFLLGVBQWU7QUFDMUQsY0FBSSxVQUFVO0FBRVosa0JBQU0sWUFBWSxJQUFJRCxPQUFNO0FBQzVCLGdCQUFJO0FBQ0Ysd0JBQVUsS0FBSyxRQUFRO0FBRXZCLG9CQUFNLHFCQUFxQixLQUFLLHdCQUF3QjtBQUN4RCxrQkFBSSxvQkFBb0IsZUFBZSxVQUFVO0FBQy9DLHFCQUFLLFFBQVEsVUFBVTtBQUFBLGtCQUNyQix3QkFBd0I7QUFBQSxrQkFDeEIsV0FBVyxtQkFBbUI7QUFBQSxrQkFDOUIsY0FBYyxtQkFBbUI7QUFBQSxrQkFDakMsb0JBQW9CLG1CQUFtQjtBQUFBLGtCQUN2QyxpQkFBaUIsbUJBQW1CO0FBQUEsZ0JBQ3RDLENBQUM7QUFBQSxjQUNILE9BQU87QUFDTCxxQkFBSyxRQUFRLFVBQVU7QUFBQSxrQkFDckIsd0JBQXdCO0FBQUEsZ0JBQzFCLENBQUM7QUFBQSxjQUNIO0FBRUEsa0JBQUksd0JBQXdCLDJCQUEyQixLQUFLLGVBQWU7QUFDekUsd0NBQXdCLHVCQUF1QixLQUFLLGFBQWE7QUFBQSxjQUNuRTtBQUNBLG1CQUFLLGdCQUFnQjtBQUNyQixjQUFBQyxRQUFPLE1BQU0sOEJBQThCLFFBQVE7QUFBQSxZQUNyRCxTQUFTLEtBQUs7QUFDWixjQUFBQSxRQUFPLEtBQUssd0NBQXdDLEdBQUc7QUFDdkQsMkJBQWEsV0FBVyxLQUFLLGVBQWU7QUFBQSxZQUM5QztBQUFBLFVBQ0Y7QUFBQSxRQUNGLFNBQVMsS0FBSztBQUNaLFVBQUFBLFFBQU8sTUFBTSx1Q0FBdUMsR0FBRztBQUFBLFFBQ3pEO0FBQUEsTUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsbUJBQW1CLE9BQXdCO0FBQ3pDLFlBQUk7QUFDRixnQkFBTSxjQUFjLGFBQWEsUUFBUSxLQUFLLGVBQWU7QUFDN0QsY0FBSSxDQUFDLFlBQWEsUUFBTztBQUV6QixnQkFBTSxVQUFvQixLQUFLLE1BQU0sV0FBVztBQUNoRCxjQUFJLFFBQVEsS0FBSyxTQUFTLFFBQVEsT0FBUSxRQUFPO0FBRWpELGdCQUFNLE1BQU0sUUFBUSxLQUFLO0FBQ3pCLGlCQUFPLEtBQUssUUFBUSxHQUFHO0FBQUEsUUFDekIsU0FBUyxLQUFLO0FBQ1osVUFBQUEsUUFBTyxNQUFNLG9DQUFvQyxHQUFHO0FBQ3BELGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksYUFBdUI7QUFDekIsWUFBSTtBQUNGLGdCQUFNLGNBQWMsYUFBYSxRQUFRLEtBQUssZUFBZTtBQUM3RCxpQkFBTyxjQUFjLEtBQUssTUFBTSxXQUFXLElBQUksQ0FBQztBQUFBLFFBQ2xELFFBQVE7QUFDTixpQkFBTyxDQUFDO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksZUFBOEI7QUFDaEMsWUFBSTtBQUNGLGlCQUFPLGFBQWEsUUFBUSxLQUFLLGVBQWU7QUFBQSxRQUNsRCxRQUFRO0FBQ04saUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsbUJBQXlCO0FBRXZCLFlBQUksS0FBSyxrQkFBa0I7QUFDekIsdUJBQWEsS0FBSyxnQkFBZ0I7QUFDbEMsZUFBSyxtQkFBbUI7QUFBQSxRQUMxQjtBQUVBLGFBQUssaUJBQWlCLENBQUMsS0FBSztBQUM1QixZQUFJLEtBQUssa0JBQWtCLE9BQU8sS0FBSyxLQUFLLG1CQUFtQixFQUFFLFdBQVcsS0FBSyxDQUFDLEtBQUssa0JBQWtCO0FBRXZHLGVBQUssZ0JBQWdCLEVBQUUsTUFBTSxTQUFPO0FBQ2xDLG9CQUFRLE1BQU0sNkNBQTZDLEdBQUc7QUFBQSxVQUNoRSxDQUFDO0FBQUEsUUFDSCxXQUFXLENBQUMsS0FBSyxnQkFBZ0I7QUFFL0IsZUFBSyxzQkFBc0IsQ0FBQztBQUM1QixlQUFLLHdCQUF3QjtBQUFBLFFBQy9CO0FBQUEsTUFDRjtBQUFBLE1BRUEseUJBQXlCLFNBQXdCO0FBQy9DLFlBQUksS0FBSyxtQkFBbUIsU0FBUztBQUNuQyxlQUFLLGlCQUFpQjtBQUFBLFFBQ3hCO0FBQUEsTUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EscUJBQXFCLE1BQTZDO0FBQ2hFLGFBQUssb0JBQW9CO0FBQ3pCLFFBQUFBLFFBQU8sTUFBTSx5QkFBeUIsSUFBSTtBQUUxQyxZQUFJLEtBQUssZ0JBQWdCO0FBQ3ZCLGVBQUssc0JBQXNCLENBQUM7QUFDNUIsZUFBSyx3QkFBd0I7QUFDN0IsZUFBSyxnQkFBZ0I7QUFBQSxRQUN2QjtBQUFBLE1BQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLE1BQU0sa0JBQWlDO0FBQ3JDLFlBQUksS0FBSyxjQUFjLEtBQUssa0JBQWtCO0FBQzVDO0FBQUEsUUFDRjtBQUVBLFlBQUksS0FBSywwQkFBMEIsS0FBSyxPQUFPLE9BQU8sS0FBSyxLQUFLLG1CQUFtQixFQUFFLFNBQVMsR0FBRztBQUMvRjtBQUFBLFFBQ0Y7QUFFQSxZQUFJO0FBQ0YsVUFBQUYsYUFBWSxNQUFNO0FBQ2hCLGlCQUFLLG1CQUFtQjtBQUN4QixpQkFBSyxzQkFBc0IsQ0FBQztBQUFBLFVBQzlCLENBQUM7QUFHRCxnQkFBTSxhQUFhLEtBQUs7QUFDeEIsY0FBSSxXQUFXLFdBQVcsR0FBRztBQUMzQixZQUFBQSxhQUFZLE1BQU07QUFDaEIsbUJBQUssbUJBQW1CO0FBQUEsWUFDMUIsQ0FBQztBQUNEO0FBQUEsVUFDRjtBQUdBLGNBQUksQ0FBQyxnQkFBZ0IsZUFBZTtBQUNsQyxrQkFBTSxnQkFBZ0IsV0FBVztBQUFBLFVBQ25DO0FBR0EsZ0JBQU0sV0FBVyxNQUFNLGdCQUFnQjtBQUFBLFlBQ3JDLEtBQUs7QUFBQSxZQUNMLGdCQUFnQjtBQUFBLFlBQ2hCLGdCQUFnQjtBQUFBLFlBQ2hCO0FBQUEsVUFDRjtBQUVBLGNBQUksU0FBUyxXQUFXLENBQUMscUJBQXFCLEtBQUssS0FBSyxTQUFTLFdBQVcsR0FBRztBQUM3RSxZQUFBQSxhQUFZLE1BQU07QUFDaEIsbUJBQUssbUJBQW1CO0FBQUEsWUFDMUIsQ0FBQztBQUNEO0FBQUEsVUFDRjtBQUdBLGdCQUFNLFVBQVU7QUFBQSxZQUNkLFdBQVcsSUFBSSxVQUFRLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxFQUFFLEdBQUcsS0FBSyxhQUFhLEVBQUUsRUFBRTtBQUFBLFlBQ3RFLFNBQVM7QUFBQSxZQUNULHdCQUF3QjtBQUFBLFVBQzFCO0FBRUEsVUFBQUEsYUFBWSxNQUFNO0FBQ2hCLGlCQUFLLHNCQUFzQjtBQUMzQixpQkFBSyxtQkFBbUI7QUFBQSxVQUMxQixDQUFDO0FBRUQsZUFBSyx3QkFBd0IsS0FBSztBQUNsQyxVQUFBRSxRQUFPLE1BQU0sWUFBWSxPQUFPLEtBQUssT0FBTyxFQUFFLFFBQVEsYUFBYTtBQUFBLFFBQ3JFLFNBQVMsS0FBSztBQUNaLFVBQUFBLFFBQU8sTUFBTSw0QkFBNEIsR0FBRztBQUM1QyxVQUFBRixhQUFZLE1BQU07QUFDaEIsaUJBQUssbUJBQW1CO0FBQUEsVUFDMUIsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQU1BLE1BQU0sa0JBQWtCLE1BQTJCO0FBRWpELG1CQUFXLFlBQVk7QUFDckIsY0FBSTtBQUNGLGtCQUFNLG1CQUFtQixLQUFLO0FBRTlCLGdCQUFJLENBQUMsZ0JBQWdCLGVBQWU7QUFDbEMsb0JBQU0sZ0JBQWdCLFdBQVc7QUFBQSxZQUNuQztBQUdBLGtCQUFNLFVBQVUsS0FBSyxNQUFNLFFBQVEsRUFBRSxTQUFTLEtBQUssQ0FBQztBQUNwRCxnQkFBSSxRQUFRLFdBQVcsR0FBRztBQUN4QjtBQUFBLFlBQ0Y7QUFLQSxrQkFBTSxvQkFBb0IsUUFBUSxRQUFRLFNBQVMsQ0FBQztBQUNwRCxrQkFBTSxZQUFZLGtCQUFrQixVQUFVLEtBQUs7QUFHbkQsa0JBQU0sV0FBVyxNQUFNLGdCQUFnQjtBQUFBLGNBQ3JDO0FBQUEsY0FDQSxLQUFLLElBQUksZ0JBQWdCLE9BQU8sRUFBRTtBQUFBO0FBQUEsY0FDbEMsZ0JBQWdCO0FBQUEsY0FDaEI7QUFBQSxZQUNGO0FBRUEsZ0JBQ0UsU0FBUyxXQUNOLENBQUMscUJBQXFCLFdBQVcsU0FBUyxXQUFXLEtBQ3JELEtBQUssUUFBUSxrQkFDaEI7QUFDQTtBQUFBLFlBQ0Y7QUFHQSxrQkFBTSxVQUFVLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxFQUFFLEdBQUcsS0FBSyxhQUFhLEVBQUU7QUFDN0Qsa0JBQU0sZUFBZSxTQUFTLE1BQU0sS0FBSyxPQUFLLEVBQUUsU0FBUyxPQUFPO0FBQ2hFLGdCQUFJLGNBQWM7QUFDaEIsY0FBQUEsYUFBWSxNQUFNO0FBQ2hCLHFCQUFLLHdCQUF3QixhQUFhO0FBQzFDLHNCQUFNLGVBQWUsY0FBYyxhQUFhLE1BQU07QUFDdEQscUJBQUssZ0JBQWdCLGVBQWUsS0FBSyxHQUFHLEtBQUssWUFBWTtBQUFBLGNBQy9ELENBQUM7QUFDRCxjQUFBRSxRQUFPLE1BQU0sd0JBQXdCLGFBQWEsTUFBTTtBQUFBLFlBQzFELE9BQU87QUFDTCxjQUFBRixhQUFZLE1BQU07QUFDaEIsb0JBQUksd0JBQXdCLCtCQUErQjtBQUN6RCx1QkFBSyx3QkFBd0I7QUFDN0IsdUJBQUssZ0JBQWdCLGVBQWUsS0FBSyxHQUFHO0FBQUEsZ0JBQzlDLE9BQU87QUFDTCx1QkFBSyx3QkFBd0I7QUFDN0IsdUJBQUssZ0JBQWdCLGVBQWUsS0FBSyxHQUFHO0FBQUEsZ0JBQzlDO0FBQUEsY0FDRixDQUFDO0FBQUEsWUFDSDtBQUFBLFVBQ0YsU0FBUyxLQUFLO0FBQ1osWUFBQUUsUUFBTyxNQUFNLGtDQUFrQyxHQUFHO0FBQUEsVUFFcEQ7QUFBQSxRQUNGLEdBQUcsR0FBRztBQUFBLE1BQ1I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQVFBLElBQUksYUFBK0U7QUFDakYsWUFBSSxDQUFDLEtBQUssa0JBQWtCLE9BQU8sS0FBSyxLQUFLLG1CQUFtQixFQUFFLFdBQVcsR0FBRztBQUM5RSxpQkFBTyxDQUFDO0FBQUEsUUFDVjtBQUdBLGNBQU0saUJBQStCLENBQUMsYUFBYSxRQUFRLFdBQVcsU0FBUztBQUMvRSxjQUFNLHFCQUFxQjtBQUUzQixZQUFJLGFBQWEsS0FBSztBQUd0QixZQUFJLEtBQUssc0JBQXNCLFVBQVU7QUFFdkMsZ0JBQU0sYUFBYSxLQUFLLG1CQUFtQixNQUFNLE1BQU07QUFDdkQsdUJBQWEsV0FBVyxPQUFPLFVBQVE7QUFDckMsa0JBQU0sUUFBUSxLQUFLLFdBQVcsS0FBSyxJQUFJO0FBQ3ZDLG1CQUFPLFNBQVMsTUFBTSxVQUFVO0FBQUEsVUFDbEMsQ0FBQztBQUFBLFFBQ0gsV0FBVyxLQUFLLHNCQUFzQixVQUFVO0FBRTlDLHVCQUFhLFdBQVcsT0FBTyxVQUFRO0FBQ3JDLGtCQUFNLFFBQVEsS0FBSyxXQUFXLEtBQUssSUFBSTtBQUN2QyxtQkFBTyxTQUFTLE1BQU0sVUFBVSxLQUFLO0FBQUEsVUFDdkMsQ0FBQztBQUFBLFFBQ0g7QUFJQSxjQUFNLGdCQUFnQixDQUFDLFdBQXNDO0FBQzNELGNBQUksQ0FBQyxVQUFVLE9BQU8sV0FBVyxTQUFVLFFBQU87QUFDbEQsaUJBQU8sZUFBZSxLQUFLLE1BQU07QUFBQSxRQUNuQztBQUdBLGNBQU0sZ0JBQXNHO0FBQUEsVUFDMUcsV0FBVyxDQUFDO0FBQUEsVUFDWixNQUFNLENBQUM7QUFBQSxVQUNQLFNBQVMsQ0FBQztBQUFBLFVBQ1YsU0FBUyxDQUFDO0FBQUEsVUFDVixNQUFNLENBQUM7QUFBQTtBQUFBLFVBQ1AsT0FBTyxDQUFDO0FBQUE7QUFBQSxVQUNSLFlBQVksQ0FBQztBQUFBO0FBQUEsUUFDZjtBQUdBLG1CQUFXLFFBQVEsWUFBWTtBQUU3QixjQUFJLENBQUMsY0FBYyxLQUFLLElBQUksS0FBSyxDQUFDLGNBQWMsS0FBSyxFQUFFLEdBQUc7QUFDeEQsWUFBQUEsUUFBTyxNQUFNLDBCQUEwQixJQUFJO0FBQzNDO0FBQUEsVUFDRjtBQUVBLGdCQUFNLE1BQU0sR0FBRyxLQUFLLElBQUksR0FBRyxLQUFLLEVBQUUsR0FBRyxLQUFLLGFBQWEsRUFBRTtBQUN6RCxnQkFBTSxTQUFTLEtBQUssb0JBQW9CLEdBQUc7QUFHM0MsY0FBSSxVQUFVLFdBQVcsY0FBYyxlQUFlLFNBQVMsTUFBTSxLQUFLLGNBQWMsS0FBSyxJQUFJLEtBQUssY0FBYyxLQUFLLEVBQUUsR0FBRztBQUM1SCwwQkFBYyxNQUFNLEVBQUUsS0FBSztBQUFBLGNBQ3pCLGFBQWEsS0FBSztBQUFBLGNBQ2xCLFdBQVcsS0FBSztBQUFBLGNBQ2hCLE9BQU8sY0FBYyxNQUFNO0FBQUEsWUFDN0IsQ0FBQztBQUFBLFVBQ0g7QUFBQSxRQUNGO0FBR0EsY0FBTSxTQUEyRSxDQUFDO0FBQ2xGLG1CQUFXLFVBQVUsZ0JBQWdCO0FBQ25DLGdCQUFNLGVBQWUsY0FBYyxNQUFNLEVBQUUsTUFBTSxHQUFHLGtCQUFrQjtBQUN0RSxpQkFBTyxLQUFLLEdBQUcsWUFBWTtBQUMzQixVQUFBQSxRQUFPLE1BQU0sU0FBUyxhQUFhLE1BQU0sSUFBSSxNQUFNLGtCQUFrQixjQUFjLE1BQU0sRUFBRSxNQUFNLFNBQVM7QUFBQSxRQUM1RztBQUVBLFFBQUFBLFFBQU8sTUFBTSxhQUFhLE9BQU8sUUFBUSxjQUFjO0FBQ3ZELGVBQU87QUFBQSxNQUNUO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxJQUFJLDBCQUFrQztBQUNwQyxlQUFPLE9BQU8sS0FBSyxLQUFLLG1CQUFtQixFQUFFO0FBQUEsTUFDL0M7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksT0FBa0I7QUFDcEIsZUFBTyxLQUFLLE1BQU0sS0FBSztBQUFBLE1BQ3pCO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxJQUFJLGFBQXFCO0FBQ3ZCLGVBQU8sS0FBSyxTQUFTLE1BQU0sVUFBVTtBQUFBLE1BQ3ZDO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxJQUFJLGFBQXNCO0FBQ3hCLGVBQU8sS0FBSyxNQUFNLFdBQVc7QUFBQSxNQUMvQjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsSUFBSSxjQUF1QjtBQUN6QixlQUFPLEtBQUssTUFBTSxZQUFZO0FBQUEsTUFDaEM7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksY0FBdUI7QUFDekIsZUFBTyxLQUFLLE1BQU0sWUFBWTtBQUFBLE1BQ2hDO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxJQUFJLFNBQWtCO0FBQ3BCLGVBQU8sS0FBSyxNQUFNLE9BQU87QUFBQSxNQUMzQjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsSUFBSSxVQUFtQjtBQUNyQixlQUFPLEtBQUssTUFBTSxRQUFRO0FBQUEsTUFDNUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksYUFBcUI7QUFDdkIsWUFBSSxLQUFLLGFBQWE7QUFDcEIsaUJBQU8sY0FBYyxLQUFLLFNBQVMsTUFBTSxVQUFVLE9BQU87QUFBQSxRQUM1RDtBQUNBLFlBQUksS0FBSyxhQUFhO0FBQ3BCLGlCQUFPO0FBQUEsUUFDVDtBQUNBLFlBQUksS0FBSyxRQUFRO0FBQ2YsaUJBQU87QUFBQSxRQUNUO0FBQ0EsWUFBSSxLQUFLLFNBQVM7QUFDaEIsaUJBQU8sR0FBRyxLQUFLLFVBQVU7QUFBQSxRQUMzQjtBQUNBLGVBQU8sR0FBRyxLQUFLLFVBQVU7QUFBQSxNQUMzQjtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsY0FBYyxRQUF3QjtBQUNwQyxlQUFPLEtBQUssTUFBTSxNQUFNLEVBQUUsUUFBUSxTQUFTLEtBQUssQ0FBQztBQUFBLE1BQ25EO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxXQUFXLFFBQWdCO0FBQ3pCLGVBQU8sS0FBSyxNQUFNLElBQUksTUFBTTtBQUFBLE1BQzlCO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxJQUFJLGdCQUF3QjtBQUMxQixlQUFPLEtBQUssTUFBTSxNQUFNLEVBQUUsU0FBUyxLQUFLLENBQUM7QUFBQSxNQUMzQztBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS0EsSUFBSSxZQUFvQjtBQUN0QixlQUFPLEtBQUssTUFBTSxXQUFXO0FBQUEsTUFDL0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLGFBQXNCO0FBQ3BCLFFBQUFBLFFBQU8sTUFBTSxzQ0FBc0MsS0FBSyxRQUFRLE1BQU07QUFFdEUsWUFBSSxLQUFLLFFBQVEsV0FBVyxHQUFHO0FBQzdCLGlCQUFPO0FBQUEsUUFDVDtBQUVBLGNBQU0sT0FBTyxLQUFLLE1BQU0sS0FBSztBQUM3QixZQUFJLE1BQU07QUFFUixlQUFLLFVBQVUsS0FBSyxJQUFJO0FBQ3hCLGdCQUFNLGFBQWEsS0FBSyxtQkFBbUIsSUFBSTtBQUMvQyxjQUFJLFlBQVk7QUFDZCxpQkFBSyxnQkFBZ0IsS0FBSyxVQUFVO0FBQUEsVUFDdEM7QUFDQSxlQUFLLHFDQUFxQztBQUMxQyxlQUFLLFlBQVk7QUFHakIsY0FBSSxLQUFLLFFBQVEsU0FBUyxHQUFHO0FBQzNCLGtCQUFNLG9CQUFvQixLQUFLLFFBQVEsS0FBSyxRQUFRLFNBQVMsQ0FBQztBQUM5RCxpQkFBSyxXQUFXLEVBQUUsTUFBTSxrQkFBa0IsTUFBZ0IsSUFBSSxrQkFBa0IsR0FBYTtBQUFBLFVBQy9GLE9BQU87QUFDTCxpQkFBSyxXQUFXO0FBQUEsVUFDbEI7QUFFQSxlQUFLLG1CQUFtQjtBQUN4QixlQUFLLGdCQUFnQjtBQUNyQiwwQkFBZ0IsTUFBTTtBQUN0QixVQUFBQSxRQUFPLE1BQU0sa0NBQWtDLEtBQUssVUFBVSxNQUFNO0FBQ3BFLGlCQUFPO0FBQUEsUUFDVDtBQUVBLGVBQU87QUFBQSxNQUNUO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxhQUFzQjtBQUNwQixRQUFBQSxRQUFPLE1BQU0sdUNBQXVDLEtBQUssVUFBVSxNQUFNO0FBRXpFLFlBQUksS0FBSyxVQUFVLFdBQVcsR0FBRztBQUMvQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxjQUFNLGFBQWEsS0FBSyxVQUFVLElBQUk7QUFDdEMsWUFBSSxDQUFDLFlBQVk7QUFDZixpQkFBTztBQUFBLFFBQ1Q7QUFDQSxjQUFNLG1CQUFtQixLQUFLLGdCQUFnQixJQUFJO0FBRWxELFlBQUk7QUFDRixnQkFBTSxPQUFPLEtBQUssTUFBTSxLQUFLO0FBQUEsWUFDM0IsTUFBTSxXQUFXO0FBQUEsWUFDakIsSUFBSSxXQUFXO0FBQUEsWUFDZixXQUFXLFdBQVc7QUFBQSxVQUN4QixDQUFDO0FBRUQsY0FBSSxNQUFNO0FBQ1IsaUJBQUssbUJBQW1CO0FBQUEsY0FDdEIsb0JBQW9CLEtBQUsscUJBQXFCLE1BQU0sS0FBSztBQUFBLFlBQzNEO0FBQ0EsaUJBQUsscUNBQXFDO0FBQzFDLGlCQUFLLFlBQVk7QUFDakIsaUJBQUssV0FBVyxFQUFFLE1BQU0sS0FBSyxNQUFnQixJQUFJLEtBQUssR0FBYTtBQUNuRSxpQkFBSyxtQkFBbUI7QUFDeEIsaUJBQUssZ0JBQWdCLFVBQVUsS0FBSyxHQUFHO0FBQ3ZDLDRCQUFnQixNQUFNO0FBQ3RCLFlBQUFBLFFBQU8sTUFBTSxjQUFjO0FBRzNCLGdCQUFJLEtBQUssbUJBQW1CLENBQUMsS0FBSyxjQUFjLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxnQkFBZ0I7QUFDekYsY0FBQUEsUUFBTyxNQUFNLGlDQUFpQztBQUM5Qyx5QkFBVyxNQUFNO0FBQ2YscUJBQUssY0FBYyxJQUFJLEVBQUUsTUFBTSxTQUFPO0FBQ3BDLGtCQUFBQSxRQUFPLE1BQU0sK0JBQStCLEdBQUc7QUFBQSxnQkFDakQsQ0FBQztBQUFBLGNBQ0gsR0FBRyxHQUFHO0FBQUEsWUFDUjtBQUVBLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0YsU0FBUyxLQUFLO0FBQ1osVUFBQUEsUUFBTyxNQUFNLGdCQUFnQixHQUFHO0FBRWhDLGVBQUssVUFBVSxLQUFLLFVBQVU7QUFDOUIsY0FBSSxrQkFBa0I7QUFDcEIsaUJBQUssZ0JBQWdCLEtBQUssZ0JBQWdCO0FBQUEsVUFDNUM7QUFBQSxRQUNGO0FBRUEsZUFBTztBQUFBLE1BQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksVUFBbUI7QUFDckIsZUFBTyxLQUFLLFFBQVEsU0FBUztBQUFBLE1BQy9CO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLQSxJQUFJLFVBQW1CO0FBQ3JCLGVBQU8sS0FBSyxVQUFVLFNBQVM7QUFBQSxNQUNqQztBQUFBLE1BRUEsSUFBSSxrQkFBeUY7QUFDM0YsY0FBTSxPQUE4RSxDQUFDO0FBRXJGLGlCQUFTLFFBQVEsR0FBRyxRQUFRLEtBQUssUUFBUSxRQUFRLFNBQVMsR0FBRztBQUMzRCxnQkFBTSxZQUFZLEtBQUssUUFBUSxLQUFLLEtBQUs7QUFDekMsZ0JBQU0sWUFBWSxLQUFLLFFBQVEsUUFBUSxDQUFDLEtBQUs7QUFDN0MsZ0JBQU0sYUFBYSxXQUFXLGNBQWMsV0FBVyxjQUFjLEtBQUssU0FBUztBQUNuRixlQUFLLEtBQUs7QUFBQSxZQUNSO0FBQUEsWUFDQSxPQUFPO0FBQUEsWUFDUCxPQUFPO0FBQUEsVUFDVCxDQUFDO0FBQUEsUUFDSDtBQUVBLGVBQU87QUFBQSxNQUNUO0FBQUEsTUFFQSxJQUFJLGlCQUF5QjtBQUMzQixlQUFPLEtBQUs7QUFBQSxNQUNkO0FBQUEsTUFFQSxJQUFJLDZCQUFzQztBQUN4QyxlQUFPLEtBQUssaUNBQWlDO0FBQUEsTUFDL0M7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtBLElBQUksTUFBYztBQUNoQixlQUFPLEtBQUssTUFBTSxJQUFJO0FBQUEsTUFDeEI7QUFBQSxNQUVBLElBQUksNkJBQTRDO0FBQzlDLGVBQU8sS0FBSyx3QkFBd0Isc0JBQXNCLEtBQUsscUJBQXFCLElBQUk7QUFBQSxNQUMxRjtBQUFBLE1BRUEsSUFBSSw2QkFBNEM7QUFDOUMsZUFBTyxLQUFLLHdCQUF3QixzQkFBc0IsS0FBSyxxQkFBcUIsSUFBSTtBQUFBLE1BQzFGO0FBQUEsTUFFUSxLQUFLLFNBQWdDO0FBQzNDLGVBQU8sSUFBSSxRQUFRLGFBQVc7QUFDNUIscUJBQVcsU0FBUyxPQUFPO0FBQUEsUUFDN0IsQ0FBQztBQUFBLE1BQ0g7QUFBQSxNQUVRLGtCQUFrQixTQU1qQjtBQUNQLGFBQUssZ0JBQWdCLFFBQVE7QUFDN0IsYUFBSyxlQUFlLFFBQVE7QUFDNUIsYUFBSyxxQkFBcUIsQ0FBQyxHQUFJLFFBQVEsc0JBQXNCLENBQUMsQ0FBRTtBQUNoRSxhQUFLLGtCQUFrQixDQUFDLEdBQUksUUFBUSxtQkFBbUIsQ0FBQyxDQUFFO0FBQzFELGFBQUssWUFBWSxLQUFLLCtCQUErQixLQUFLLGVBQWU7QUFDekUsWUFBSSxRQUFRLHdCQUF3QjtBQUNsQyxrQ0FBd0IsdUJBQXVCLEtBQUssYUFBYTtBQUFBLFFBQ25FLE9BQU87QUFDTCxlQUFLLHFDQUFxQztBQUFBLFFBQzVDO0FBQUEsTUFDRjtBQUFBLE1BRVEsaUJBQXVCO0FBQzdCLGFBQUssWUFBWSxDQUFDO0FBQ2xCLGFBQUssa0JBQWtCLENBQUM7QUFBQSxNQUMxQjtBQUFBLE1BRVEscUJBQ04sTUFDQSxtQkFDZ0I7QUFDaEIsZUFBTztBQUFBLFVBQ0wsV0FBVyxLQUFLLFVBQVUsS0FBSztBQUFBLFVBQy9CLFVBQVUsS0FBSyxTQUFTLEtBQUssTUFBTSxJQUFJO0FBQUEsVUFDdkMsS0FBSyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRSxHQUFHLEtBQUssYUFBYSxFQUFFO0FBQUEsVUFDbEQsWUFBWSxLQUFLLE1BQU0sV0FBVztBQUFBLFVBQ2xDO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUVRLHFCQUNOLE1BQ0EsbUJBQ007QUFDTixhQUFLLG1CQUFtQixLQUFLLEtBQUsscUJBQXFCLE1BQU0saUJBQWlCLENBQUM7QUFDL0UsYUFBSyxxQ0FBcUM7QUFBQSxNQUM1QztBQUFBLE1BRVEsdUNBQTZDO0FBQ25ELGNBQU0sUUFBUSxxQkFBcUIsS0FBSyxrQkFBa0I7QUFDMUQsZ0NBQXdCO0FBQUEsVUFDdEIsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsTUFFUSxVQUFVLE9BQXdCO0FBQ3hDLGNBQU0sY0FBc0IsQ0FBQztBQUM3QixjQUFNLG9CQUFzQyxDQUFDO0FBRTdDLGlCQUFTLFFBQVEsR0FBRyxRQUFRLE9BQU8sU0FBUyxHQUFHO0FBQzdDLGdCQUFNLE9BQU8sS0FBSyxNQUFNLEtBQUs7QUFDN0IsY0FBSSxDQUFDLE1BQU07QUFDVCxxQkFBUyxlQUFlLFlBQVksU0FBUyxHQUFHLGdCQUFnQixHQUFHLGdCQUFnQixHQUFHO0FBQ3BGLG9CQUFNLGNBQWMsWUFBWSxZQUFZO0FBQzVDLG1CQUFLLE1BQU0sS0FBSztBQUFBLGdCQUNkLE1BQU0sWUFBWTtBQUFBLGdCQUNsQixJQUFJLFlBQVk7QUFBQSxnQkFDaEIsV0FBVyxZQUFZO0FBQUEsY0FDekIsQ0FBQztBQUFBLFlBQ0g7QUFDQSxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxzQkFBWSxLQUFLLElBQUk7QUFDckIsZ0JBQU0sYUFBYSxLQUFLLG1CQUFtQixJQUFJO0FBQy9DLGNBQUksWUFBWTtBQUNkLDhCQUFrQixLQUFLLFVBQVU7QUFBQSxVQUNuQztBQUFBLFFBQ0Y7QUFFQSxhQUFLLFVBQVUsS0FBSyxHQUFHLFdBQVc7QUFDbEMsYUFBSyxnQkFBZ0IsS0FBSyxHQUFHLGlCQUFpQjtBQUM5QyxhQUFLLHFDQUFxQztBQUMxQyxlQUFPO0FBQUEsTUFDVDtBQUFBLE1BRVEsMEJBQXNEO0FBQzVELFlBQUk7QUFDRixjQUFJLENBQUMsd0JBQXdCLHFCQUFxQjtBQUNoRCxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxnQkFBTSxRQUFRLGFBQWEsUUFBUSxLQUFLLHVCQUF1QjtBQUMvRCxjQUFJLENBQUMsT0FBTztBQUNWLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGdCQUFNLFNBQVMsS0FBSyxNQUFNLEtBQUs7QUFDL0IsaUJBQU87QUFBQSxZQUNMLFlBQVksT0FBTyxjQUFjO0FBQUEsWUFDakMsWUFBWSxNQUFNLFFBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxhQUFhLENBQUM7QUFBQSxZQUNwRSxlQUFlLE9BQU8saUJBQWlCLG9CQUFvQjtBQUFBLFlBQzNELGNBQWMsT0FBTyxnQkFBZ0IsT0FBTyxjQUFjLElBQUlELE9BQU0sRUFBRSxJQUFJO0FBQUEsWUFDMUUsb0JBQW9CLE1BQU0sUUFBUSxPQUFPLGtCQUFrQixJQUFJLE9BQU8scUJBQXFCLENBQUM7QUFBQSxZQUM1RixpQkFBaUIsTUFBTSxRQUFRLE9BQU8sZUFBZSxJQUFJLE9BQU8sa0JBQWtCLENBQUM7QUFBQSxVQUNyRjtBQUFBLFFBQ0YsUUFBUTtBQUNOLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxNQUVRLDJCQUFpQztBQUN2QyxZQUFJO0FBQ0YsdUJBQWEsV0FBVyxLQUFLLHVCQUF1QjtBQUFBLFFBQ3RELFNBQVMsT0FBTztBQUNkLFVBQUFDLFFBQU8sTUFBTSx3Q0FBd0MsS0FBSztBQUFBLFFBQzVEO0FBQUEsTUFDRjtBQUFBLE1BRVEsK0JBQStCLGFBQXVDO0FBQzVFLGVBQU8sWUFBWSxJQUFJLENBQUMsZ0JBQWdCO0FBQUEsVUFDdEMsTUFBTSxXQUFXLElBQUksTUFBTSxHQUFHLENBQUM7QUFBQSxVQUMvQixJQUFJLFdBQVcsSUFBSSxNQUFNLEdBQUcsQ0FBQztBQUFBLFVBQzdCLFdBQVcsV0FBVyxJQUFJLFNBQVMsSUFBSSxXQUFXLElBQUksQ0FBQyxJQUFJO0FBQUEsUUFDN0QsRUFBRTtBQUFBLE1BQ0o7QUFBQSxJQUNGO0FBR08sSUFBTSxpQkFBaUIsSUFBSSxlQUFlO0FBQUE7QUFBQTs7O0FDeHhDakQsU0FBUyxVQUFBRSxTQUFRLHNCQUFBQywyQkFBMEI7QUFBM0MsSUFPYSxnQkE0QkE7QUFuQ2I7QUFBQTtBQUFBO0FBQ0E7QUFNTyxJQUFNLGlCQUFOLE1BQXFCO0FBQUEsTUFDMUIsc0JBQXNCLHNCQUFzQjtBQUFBLE1BRTVDLGNBQWM7QUFDWixRQUFBQSxvQkFBbUIsTUFBTTtBQUFBLFVBQ3ZCLHdCQUF3QkQ7QUFBQSxVQUN4QixvQkFBb0JBO0FBQUEsUUFDdEIsQ0FBQztBQUFBLE1BQ0g7QUFBQSxNQUVBLHVCQUF1QixTQUF3QjtBQUM3QyxhQUFLLHNCQUFzQjtBQUMzQiwrQkFBdUIsT0FBTztBQUFBLE1BQ2hDO0FBQUEsTUFFQSxxQkFBMkI7QUFDekIsYUFBSyx1QkFBdUIsQ0FBQyxLQUFLLG1CQUFtQjtBQUFBLE1BQ3ZEO0FBQUEsTUFFQSxJQUFJLGdCQUF5QjtBQUMzQixlQUFPLG1CQUFtQjtBQUFBLE1BQzVCO0FBQUEsTUFFQSxJQUFJLG9CQUE2QjtBQUMvQixlQUFPLEtBQUs7QUFBQSxNQUNkO0FBQUEsSUFDRjtBQUVPLElBQU0saUJBQWlCLElBQUksZUFBZTtBQUFBO0FBQUE7OztBQ25DakQsU0FBUyxVQUFBRSxTQUFRLHNCQUFBQywyQkFBMEI7QUFBM0MsSUFnQk0sMEJBZ0JBLDRCQUVBLHdCQVNPLGtCQXNJQTtBQWpMYjtBQUFBO0FBQUE7QUFnQkEsSUFBTSwyQkFBNEQ7QUFBQSxNQUNoRSxPQUFPO0FBQUEsTUFDUCxRQUFRO0FBQUEsTUFDUixPQUFPO0FBQUEsTUFDUCxRQUFRO0FBQUEsSUFDVjtBQVdBLElBQU0sNkJBQTZCO0FBRW5DLElBQU0seUJBQWlEO0FBQUEsTUFDckQsV0FBVztBQUFBLE1BQ1gsZ0JBQWdCO0FBQUEsTUFDaEIsY0FBYztBQUFBLE1BQ2QsV0FBVztBQUFBLE1BQ1gsaUJBQWlCO0FBQUEsTUFDakIscUJBQXFCO0FBQUEsSUFDdkI7QUFFTyxJQUFNLG1CQUFOLE1BQXVCO0FBQUEsTUFDNUIsZUFBZTtBQUFBLE1BQ2YsY0FBYztBQUFBLE1BQ2QsY0FBYztBQUFBLE1BQ2QsWUFBWSx1QkFBdUI7QUFBQSxNQUNuQyxpQkFBaUIsdUJBQXVCO0FBQUEsTUFDeEMsZUFBZSx1QkFBdUI7QUFBQSxNQUN0QyxZQUFZLHVCQUF1QjtBQUFBLE1BQ25DLGtCQUFrQix1QkFBdUI7QUFBQSxNQUN6QyxzQkFBcUMsdUJBQXVCO0FBQUEsTUFFNUQsY0FBYztBQUNaLFFBQUFBLG9CQUFtQixNQUFNO0FBQUEsVUFDdkIsaUJBQWlCRDtBQUFBLFVBQ2pCLGdCQUFnQkE7QUFBQSxVQUNoQixnQkFBZ0JBO0FBQUEsVUFDaEIseUJBQXlCQTtBQUFBLFVBQ3pCLGNBQWNBO0FBQUEsVUFDZCxtQkFBbUJBO0FBQUEsVUFDbkIsaUJBQWlCQTtBQUFBLFVBQ2pCLGNBQWNBO0FBQUEsVUFDZCxvQkFBb0JBO0FBQUEsVUFDcEIsd0JBQXdCQTtBQUFBLFFBQzFCLENBQUM7QUFFRCxhQUFLLG1CQUFtQjtBQUFBLE1BQzFCO0FBQUEsTUFFQSxnQkFBZ0IsTUFBcUI7QUFDbkMsYUFBSyxlQUFlO0FBQUEsTUFDdEI7QUFBQSxNQUVBLGVBQWUsTUFBcUI7QUFDbEMsYUFBSyxjQUFjO0FBQUEsTUFDckI7QUFBQSxNQUVBLGVBQWUsTUFBcUI7QUFDbEMsYUFBSyxjQUFjO0FBQUEsTUFDckI7QUFBQSxNQUVBLHdCQUF3QixhQUFxRjtBQUMzRyxhQUFLLFlBQVksWUFBWSxhQUFhLEtBQUs7QUFDL0MsYUFBSyxZQUFZLFlBQVksYUFBYSxLQUFLO0FBQy9DLGFBQUssaUJBQWlCO0FBQUEsTUFDeEI7QUFBQSxNQUVBLGFBQWEsU0FBd0I7QUFDbkMsYUFBSyxZQUFZO0FBQ2pCLGFBQUssaUJBQWlCO0FBQUEsTUFDeEI7QUFBQSxNQUVBLGtCQUFrQixPQUE2QjtBQUM3QyxhQUFLLGlCQUFpQjtBQUN0QixhQUFLLGlCQUFpQjtBQUFBLE1BQ3hCO0FBQUEsTUFFQSxnQkFBZ0IsU0FBd0I7QUFDdEMsYUFBSyxlQUFlO0FBQ3BCLGFBQUssaUJBQWlCO0FBQUEsTUFDeEI7QUFBQSxNQUVBLGFBQWEsV0FBNEI7QUFDdkMsYUFBSyxZQUFZO0FBQ2pCLGFBQUssaUJBQWlCO0FBQUEsTUFDeEI7QUFBQSxNQUVBLG1CQUFtQixpQkFBd0M7QUFDekQsYUFBSyxrQkFBa0I7QUFDdkIsYUFBSyxpQkFBaUI7QUFBQSxNQUN4QjtBQUFBLE1BRUEsdUJBQXVCLEtBQTBCO0FBQy9DLGFBQUssc0JBQXNCO0FBQzNCLGFBQUssaUJBQWlCO0FBQUEsTUFDeEI7QUFBQSxNQUVRLHFCQUEyQjtBQUNqQyxZQUFJO0FBQ0YsZ0JBQU0sUUFBUSxhQUFhLFFBQVEsMEJBQTBCO0FBQzdELGNBQUksQ0FBQyxPQUFPO0FBQ1Y7QUFBQSxVQUNGO0FBRUEsZ0JBQU0sU0FBUyxLQUFLLE1BQU0sS0FBSztBQUMvQixlQUFLLFlBQVksT0FBTyxhQUFhLHVCQUF1QjtBQUM1RCxlQUFLLGlCQUFpQixPQUFPLGtCQUFrQix1QkFBdUI7QUFDdEUsZUFBSyxlQUFlLE9BQU8sZ0JBQWdCLHVCQUF1QjtBQUNsRSxlQUFLLFlBQVksT0FBTyxhQUFhLHVCQUF1QjtBQUM1RCxlQUFLLGtCQUFrQixPQUFPLG1CQUFtQix1QkFBdUI7QUFDeEUsZUFBSyxzQkFBc0IsT0FBTyx1QkFBdUIsdUJBQXVCO0FBQUEsUUFDbEYsUUFBUTtBQUFBLFFBRVI7QUFBQSxNQUNGO0FBQUEsTUFFUSxtQkFBeUI7QUFDL0IsWUFBSTtBQUNGLHVCQUFhO0FBQUEsWUFDWDtBQUFBLFlBQ0EsS0FBSyxVQUFVO0FBQUEsY0FDYixXQUFXLEtBQUs7QUFBQSxjQUNoQixnQkFBZ0IsS0FBSztBQUFBLGNBQ3JCLGNBQWMsS0FBSztBQUFBLGNBQ25CLFdBQVcsS0FBSztBQUFBLGNBQ2hCLGlCQUFpQixLQUFLO0FBQUEsY0FDdEIscUJBQXFCLEtBQUs7QUFBQSxZQUM1QixDQUEyQjtBQUFBLFVBQzdCO0FBQUEsUUFDRixRQUFRO0FBQUEsUUFFUjtBQUFBLE1BQ0Y7QUFBQSxNQUVBLElBQUksY0FBc0I7QUFDeEIsZUFBTyx5QkFBeUIsS0FBSyxlQUFlO0FBQUEsTUFDdEQ7QUFBQSxNQUVBLHFCQUFxQixXQUEwRTtBQUM3RixnQkFBUSxXQUFXO0FBQUEsVUFDakIsS0FBSztBQUNILG1CQUFPO0FBQUEsVUFDVCxLQUFLO0FBQUEsVUFDTCxLQUFLO0FBQ0gsbUJBQU87QUFBQSxVQUNULEtBQUs7QUFDSCxtQkFBTztBQUFBLFVBQ1QsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0w7QUFDRSxtQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVPLElBQU0sbUJBQW1CLElBQUksaUJBQWlCO0FBQUE7QUFBQTs7O0FDeEhyRCxTQUFTLFNBQVMsT0FBa0Q7QUFDbEUsU0FBTyxPQUFPLFVBQVUsWUFBWSxVQUFVO0FBQ2hEO0FBRUEsU0FBUyxhQUFhLE9BQWdCLFNBQWlCLFNBQWlCLFVBQTBCO0FBQ2hHLE1BQUksT0FBTyxVQUFVLFlBQVksQ0FBQyxPQUFPLFNBQVMsS0FBSyxHQUFHO0FBQ3hELFdBQU87QUFBQSxFQUNUO0FBRUEsU0FBTyxLQUFLLElBQUksU0FBUyxLQUFLLElBQUksU0FBUyxLQUFLLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFDL0Q7QUFFQSxTQUFTLHFCQUFxQixPQUE4QjtBQUMxRCxNQUFJLENBQUMsU0FBUyxLQUFLLEdBQUc7QUFDcEIsV0FBTyxFQUFFLEdBQUcsc0JBQXNCO0FBQUEsRUFDcEM7QUFFQSxTQUFPO0FBQUEsSUFDTCxNQUFNLGFBQWEsTUFBTSxNQUFNLEdBQUcsS0FBSyxzQkFBc0IsSUFBSTtBQUFBLElBQ2pFLE9BQU8sYUFBYSxNQUFNLE9BQU8sR0FBRyxLQUFLLHNCQUFzQixLQUFLO0FBQUEsSUFDcEUsV0FBVyxhQUFhLE1BQU0sV0FBVyxHQUFHLEtBQUssc0JBQXNCLFNBQVM7QUFBQSxJQUNoRixNQUFNLGFBQWEsTUFBTSxNQUFNLEdBQUcsS0FBSyxzQkFBc0IsSUFBSTtBQUFBLElBQ2pFLFlBQVksYUFBYSxNQUFNLFlBQVksR0FBRyxLQUFLLHNCQUFzQixVQUFVO0FBQUEsSUFDbkYsU0FBUyxhQUFhLE1BQU0sU0FBUyxHQUFHLEtBQUssc0JBQXNCLE9BQU87QUFBQSxJQUMxRSxTQUFTLGFBQWEsTUFBTSxTQUFTLEdBQUcsS0FBSyxzQkFBc0IsT0FBTztBQUFBLEVBQzVFO0FBQ0Y7QUFFQSxTQUFTLGlCQUFpQixPQUE0QztBQUNwRSxNQUFJLFVBQVUsTUFBTTtBQUNsQixXQUFPO0FBQUEsRUFDVDtBQUVBLFNBQU8sT0FBTyxVQUFVLFlBQVksaUJBQWlCLElBQUksS0FBNEIsSUFDaEYsUUFDRDtBQUNOO0FBRUEsU0FBUyxrQkFBa0IsT0FBeUM7QUFDbEUsU0FBTyxPQUFPLFVBQVUsWUFBWSxrQkFBa0IsSUFBSSxLQUFnQyxJQUNyRixRQUNEO0FBQ047QUFFQSxTQUFTLDhCQUE4QixPQUF1QztBQUM1RSxTQUFPLE9BQU8sVUFBVSxZQUFZLHdCQUF3QixJQUFJLEtBQThCLElBQ3pGLFFBQ0Q7QUFDTjtBQUVBLFNBQVMsOEJBQThCLE9BQXVDO0FBQzVFLFNBQU8sT0FBTyxVQUFVLFlBQVksdUJBQXVCLElBQUksS0FBOEIsSUFDeEYsUUFDRDtBQUNOO0FBRU8sU0FBUyx1Q0FBdUMsT0FBZ0Q7QUFDckcsUUFBTSxTQUFTLFNBQVMsS0FBSyxJQUFJLFFBQVEsQ0FBQztBQUMxQyxRQUFNLFlBQVksU0FBUyxPQUFPLFNBQVMsSUFBSSxPQUFPLFlBQVksQ0FBQztBQUNuRSxRQUFNLEtBQUssU0FBUyxPQUFPLEVBQUUsSUFBSSxPQUFPLEtBQUssQ0FBQztBQUU5QyxTQUFPO0FBQUEsSUFDTCxjQUFjLHFCQUFxQixPQUFPLFlBQVk7QUFBQSxJQUN0RCxpQkFBaUIsaUJBQWlCLE9BQU8sZUFBZTtBQUFBLElBQ3hELE9BQU8sYUFBYSxPQUFPLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFBQSxJQUMxQyxTQUFTLGFBQWEsT0FBTyxTQUFTLEdBQUcsSUFBSSxFQUFFO0FBQUEsSUFDL0MsZ0JBQWdCLG9CQUFvQixTQUFTLE9BQU8sY0FBYyxJQUFLLE9BQU8saUJBQTZDLE1BQVM7QUFBQSxJQUNwSSxXQUFXO0FBQUEsTUFDVCx1QkFBdUIsOEJBQThCLFVBQVUscUJBQXFCO0FBQUEsTUFDcEYsdUJBQXVCLDhCQUE4QixVQUFVLHFCQUFxQjtBQUFBLElBQ3RGO0FBQUEsSUFDQSxJQUFJO0FBQUEsTUFDRixXQUFXLGtCQUFrQixHQUFHLFNBQVM7QUFBQSxNQUN6QyxXQUFXLE9BQU8sR0FBRyxjQUFjLFlBQVksR0FBRyxZQUFZO0FBQUEsSUFDaEU7QUFBQSxFQUNGO0FBQ0Y7QUFFTyxTQUFTLDZCQUNkLE9BQ0EsZUFBZSxvQkFDYztBQUM3QixNQUFJLENBQUMsU0FBUyxLQUFLLEdBQUc7QUFDcEIsV0FBTztBQUFBLEVBQ1Q7QUFFQSxNQUFJLE1BQU0sU0FBUyx3QkFBd0IsTUFBTSxZQUFZLHlCQUF5QjtBQUNwRixXQUFPO0FBQUEsRUFDVDtBQUVBLFFBQU0sT0FBTyxPQUFPLE1BQU0sU0FBUyxZQUFZLE1BQU0sS0FBSyxLQUFLLElBQUksTUFBTSxLQUFLLEtBQUssSUFBSTtBQUV2RixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVDtBQUFBLElBQ0EsVUFBVSx1Q0FBdUMsTUFBTSxRQUFRO0FBQUEsRUFDakU7QUFDRjtBQUVPLFNBQVMsMEJBQ2QsTUFDNEU7QUFDNUUsTUFBSSxDQUFDLEtBQUssS0FBSyxHQUFHO0FBQ2hCLFdBQU87QUFBQSxNQUNMLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUVBLE1BQUk7QUFDRixVQUFNLFNBQVMsS0FBSyxNQUFNLElBQUk7QUFDOUIsVUFBTSxVQUFVLDZCQUE2QixNQUFNO0FBRW5ELFFBQUksQ0FBQyxTQUFTO0FBQ1osYUFBTztBQUFBLFFBQ0wsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBRUEsV0FBTyxFQUFFLElBQUksTUFBTSxRQUFRO0FBQUEsRUFDN0IsUUFBUTtBQUNOLFdBQU87QUFBQSxNQUNMLElBQUk7QUFBQSxNQUNKLE9BQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUNGO0FBRU8sU0FBUyx3QkFBd0IsU0FBdUM7QUFDN0UsU0FBTyxLQUFLLFVBQVUsU0FBUyxNQUFNLENBQUM7QUFDeEM7QUFFTyxTQUFTLDBCQUNkLFNBQ0EsSUFDQSxRQUNxQjtBQUNyQixTQUFPO0FBQUEsSUFDTCxHQUFHO0FBQUEsSUFDSDtBQUFBLElBQ0EsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLEVBQ2I7QUFDRjtBQUVPLFNBQVMsMEJBQ2QsU0FDQSxNQUNBLFFBQ3FCO0FBQ3JCLFNBQU87QUFBQSxJQUNMLEdBQUc7QUFBQSxJQUNILEdBQUc7QUFBQSxJQUNILElBQUksUUFBUTtBQUFBLElBQ1osV0FBVyxRQUFRO0FBQUEsSUFDbkIsV0FBVztBQUFBLEVBQ2I7QUFDRjtBQUVPLFNBQVMsd0JBQ2QsU0FDQSxJQUNBLE1BQ0EsUUFDcUI7QUFDckIsU0FBTztBQUFBLElBQ0wsR0FBRztBQUFBLElBQ0g7QUFBQSxJQUNBO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsRUFDYjtBQUNGO0FBRU8sU0FBUyw0QkFBNEIsT0FBNEM7QUFDdEYsTUFBSSxDQUFDLFNBQVMsS0FBSyxLQUFLLE9BQU8sTUFBTSxPQUFPLFlBQVksQ0FBQyxNQUFNLEdBQUcsS0FBSyxHQUFHO0FBQ3hFLFdBQU87QUFBQSxFQUNUO0FBRUEsUUFBTSxXQUFXLDZCQUE2QixLQUFLO0FBQ25ELE1BQUksQ0FBQyxVQUFVO0FBQ2IsV0FBTztBQUFBLEVBQ1Q7QUFFQSxRQUFNLFlBQVksT0FBTyxNQUFNLGNBQWMsWUFBWSxNQUFNLFVBQVUsS0FBSyxJQUMxRSxNQUFNLGFBQ04sb0JBQUksS0FBSyxDQUFDLEdBQUUsWUFBWTtBQUM1QixRQUFNLFlBQVksT0FBTyxNQUFNLGNBQWMsWUFBWSxNQUFNLFVBQVUsS0FBSyxJQUMxRSxNQUFNLFlBQ047QUFFSixTQUFPO0FBQUEsSUFDTCxHQUFHO0FBQUEsSUFDSCxJQUFJLE1BQU07QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDRjtBQUVPLFNBQVMsb0NBQW9DLE9BQTZDO0FBQy9GLE1BQUksQ0FBQyxTQUFTLEtBQUssR0FBRztBQUNwQixXQUFPO0FBQUEsTUFDTCxVQUFVLENBQUM7QUFBQSxNQUNYLG1CQUFtQjtBQUFBLElBQ3JCO0FBQUEsRUFDRjtBQUVBLFFBQU0sV0FBVyxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQ3pDLE1BQU0sU0FDTCxJQUFJLENBQUMsVUFBVSw0QkFBNEIsS0FBSyxDQUFDLEVBQ2pELE9BQU8sQ0FBQyxVQUF3QyxVQUFVLElBQUksSUFDL0QsQ0FBQztBQUNMLFFBQU0sb0JBQW9CLE9BQU8sTUFBTSxzQkFBc0IsV0FBVyxNQUFNLG9CQUFvQjtBQUVsRyxTQUFPO0FBQUEsSUFDTDtBQUFBLElBQ0EsbUJBQW1CLFNBQVMsS0FBSyxDQUFDLFlBQVksUUFBUSxPQUFPLGlCQUFpQixJQUFJLG9CQUFvQjtBQUFBLEVBQ3hHO0FBQ0Y7QUFFTyxTQUFTLGtDQUFrQyxNQUFzQjtBQUN0RSxRQUFNLE9BQU8sS0FDVixLQUFLLEVBQ0wsWUFBWSxFQUNaLFFBQVEsZUFBZSxHQUFHLEVBQzFCLFFBQVEsWUFBWSxFQUFFLEtBQUs7QUFFOUIsU0FBTyxnQkFBZ0IsSUFBSTtBQUM3QjtBQS9SQSxJQWVhLHNCQUNBLHlCQW9DUCxrQkFDQSxtQkFDQSx3QkFDQTtBQXZETjtBQUFBO0FBQUE7QUFBQTtBQU1BO0FBU08sSUFBTSx1QkFBdUI7QUFDN0IsSUFBTSwwQkFBMEI7QUFvQ3ZDLElBQU0sbUJBQW1CLElBQUksSUFBeUIscUJBQXFCLElBQUksQ0FBQyxXQUFXLE9BQU8sRUFBRSxDQUFDO0FBQ3JHLElBQU0sb0JBQW9CLG9CQUFJLElBQTZCLENBQUMsUUFBUSxTQUFTLFdBQVcsU0FBUyxDQUFDO0FBQ2xHLElBQU0seUJBQXlCLG9CQUFJLElBQTJCLENBQUMsV0FBVyxjQUFjLFdBQVcsS0FBSyxDQUFDO0FBQ3pHLElBQU0sMEJBQTBCLG9CQUFJLElBQTJCLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFBQTtBQUFBOzs7QUN2RDlFLFNBQVMsVUFBQUUsU0FBUSxzQkFBQUMsMkJBQTBCO0FBc0MzQyxTQUFTLGtCQUEwQjtBQUNqQyxTQUFPLFdBQVcsS0FBSyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3JGO0FBRUEsU0FBUyxrQkFBMEI7QUFDakMsVUFBTyxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUNoQztBQTVDQSxJQW1CTSw4QkEyQk8sMEJBNFZBO0FBMVliO0FBQUE7QUFBQTtBQUNBO0FBY0E7QUFDQTtBQUNBO0FBRUEsSUFBTSwrQkFBK0I7QUEyQjlCLElBQU0sMkJBQU4sTUFBK0I7QUFBQSxNQUNwQyxXQUFrQyxDQUFDO0FBQUEsTUFDbkMsb0JBQW1DO0FBQUEsTUFDbkMsbUJBQW1CO0FBQUEsTUFDbkIsZUFBZTtBQUFBLE1BQ2Ysb0JBQW9CO0FBQUEsTUFDcEIsY0FBYztBQUFBLE1BRUc7QUFBQSxNQUVqQixZQUNFLE9BQW9DO0FBQUEsUUFDbEM7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0YsR0FDQTtBQUNBLGFBQUssT0FBTztBQUVaLFFBQUFBLG9CQUFtQixNQUFNO0FBQUEsVUFDdkIsc0JBQXNCRDtBQUFBLFVBQ3RCLHFCQUFxQkE7QUFBQSxVQUNyQixpQkFBaUJBO0FBQUEsVUFDakIsb0JBQW9CQTtBQUFBLFVBQ3BCLG9CQUFvQkE7QUFBQSxVQUNwQixxQkFBcUJBO0FBQUEsVUFDckIsMEJBQTBCQTtBQUFBLFVBQzFCLHVCQUF1QkE7QUFBQSxVQUN2Qix1QkFBdUJBO0FBQUEsVUFDdkIsdUJBQXVCQTtBQUFBLFFBQ3pCLENBQUM7QUFFRCxhQUFLLG1CQUFtQjtBQUFBLE1BQzFCO0FBQUEsTUFFQSxxQkFBcUIsSUFBeUI7QUFDNUMsYUFBSyxvQkFBb0I7QUFDekIsYUFBSyxtQkFBbUIsS0FBSyxpQkFBaUIsUUFBUTtBQUN0RCxhQUFLLG9CQUFvQjtBQUN6QixhQUFLLGNBQWM7QUFBQSxNQUNyQjtBQUFBLE1BRUEsb0JBQW9CLE9BQXFCO0FBQ3ZDLGFBQUssbUJBQW1CO0FBQ3hCLGFBQUssb0JBQW9CO0FBQ3pCLGFBQUssY0FBYztBQUFBLE1BQ3JCO0FBQUEsTUFFQSxnQkFBZ0IsT0FBcUI7QUFDbkMsYUFBSyxlQUFlO0FBQ3BCLGFBQUssb0JBQW9CO0FBQ3pCLGFBQUssY0FBYztBQUFBLE1BQ3JCO0FBQUEsTUFFQSxxQkFBMkI7QUFDekIsYUFBSyxlQUFlO0FBQ3BCLGFBQUssb0JBQW9CO0FBQ3pCLGFBQUssY0FBYztBQUFBLE1BQ3JCO0FBQUEsTUFFQSxtQkFBbUIsT0FBTyxLQUFLLGtCQUEyQjtBQUN4RCxjQUFNLGNBQWMsS0FBSyxLQUFLO0FBQzlCLFlBQUksQ0FBQyxhQUFhO0FBQ2hCLGVBQUssY0FBYztBQUNuQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxjQUFNLFdBQVcsS0FBSyxxQkFBcUI7QUFDM0MsY0FBTSxXQUFXLEtBQUssYUFBYSxhQUFhLFFBQVE7QUFDeEQsY0FBTSxTQUFTLGdCQUFnQjtBQUMvQixjQUFNLHFCQUFxQixLQUFLO0FBQ2hDLGNBQU0saUJBQWlCLEtBQUssV0FBVyxXQUFXO0FBRWxELFlBQUksc0JBQXNCLG1CQUFtQixTQUFTLGFBQWE7QUFDakUsZUFBSyxXQUFXLEtBQUssU0FBUyxJQUFJLENBQUMsWUFDakMsUUFBUSxPQUFPLG1CQUFtQixLQUM5QiwwQkFBMEIsU0FBUyxVQUFVLE1BQU0sSUFDbkQsT0FDTDtBQUNELGVBQUssb0JBQW9CLHlCQUFvQixXQUFXO0FBQ3hELGVBQUssY0FBYztBQUNuQixlQUFLLGVBQWUsd0JBQXdCLFFBQVE7QUFDcEQsZUFBSyxpQkFBaUI7QUFDdEIsaUJBQU87QUFBQSxRQUNUO0FBRUEsWUFBSSxnQkFBZ0I7QUFDbEIsZUFBSyxjQUFjLHlCQUFvQixXQUFXO0FBQ2xELGlCQUFPO0FBQUEsUUFDVDtBQUVBLGNBQU0sUUFBUSwwQkFBMEIsVUFBVSxnQkFBZ0IsR0FBRyxNQUFNO0FBQzNFLGFBQUssV0FBVyxDQUFDLE9BQU8sR0FBRyxLQUFLLFFBQVE7QUFDeEMsYUFBSyxvQkFBb0IsTUFBTTtBQUMvQixhQUFLLG1CQUFtQixNQUFNO0FBQzlCLGFBQUssZUFBZSx3QkFBd0IsUUFBUTtBQUNwRCxhQUFLLG9CQUFvQix1QkFBa0IsV0FBVztBQUN0RCxhQUFLLGNBQWM7QUFDbkIsYUFBSyxpQkFBaUI7QUFDdEIsZUFBTztBQUFBLE1BQ1Q7QUFBQSxNQUVBLHNCQUErQjtBQUM3QixjQUFNLFVBQVUsS0FBSztBQUNyQixZQUFJLENBQUMsU0FBUztBQUNaLGVBQUssY0FBYztBQUNuQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxhQUFLLGNBQWMsUUFBUSxRQUFRO0FBQ25DLGFBQUssbUJBQW1CLFFBQVE7QUFDaEMsYUFBSyxlQUFlLHdCQUF3QixLQUFLLFNBQVMsT0FBTyxDQUFDO0FBQ2xFLGFBQUssb0JBQW9CLHdCQUFtQixRQUFRLElBQUk7QUFDeEQsYUFBSyxjQUFjO0FBQ25CLGVBQU87QUFBQSxNQUNUO0FBQUEsTUFFQSx5QkFBeUIsT0FBTyxLQUFLLGtCQUEyQjtBQUM5RCxjQUFNLFVBQVUsS0FBSztBQUNyQixZQUFJLENBQUMsU0FBUztBQUNaLGVBQUssY0FBYztBQUNuQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxjQUFNLGNBQWMsS0FBSyxLQUFLLEtBQUssR0FBRyxRQUFRLElBQUk7QUFDbEQsWUFBSSxLQUFLLFdBQVcsV0FBVyxHQUFHO0FBQ2hDLGVBQUssY0FBYyx5QkFBb0IsV0FBVztBQUNsRCxpQkFBTztBQUFBLFFBQ1Q7QUFFQSxjQUFNLFNBQVMsZ0JBQWdCO0FBQy9CLGNBQU0sWUFBWSx3QkFBd0IsU0FBUyxnQkFBZ0IsR0FBRyxhQUFhLE1BQU07QUFDekYsYUFBSyxXQUFXLENBQUMsV0FBVyxHQUFHLEtBQUssUUFBUTtBQUM1QyxhQUFLLG9CQUFvQixVQUFVO0FBQ25DLGFBQUssbUJBQW1CLFVBQVU7QUFDbEMsYUFBSyxlQUFlLHdCQUF3QixLQUFLLFNBQVMsU0FBUyxDQUFDO0FBQ3BFLGFBQUssb0JBQW9CLCtCQUEwQixVQUFVLElBQUk7QUFDakUsYUFBSyxjQUFjO0FBQ25CLGFBQUssaUJBQWlCO0FBQ3RCLGVBQU87QUFBQSxNQUNUO0FBQUEsTUFFQSxzQkFBc0IsT0FBTyxLQUFLLGtCQUEyQjtBQUMzRCxjQUFNLFVBQVUsS0FBSztBQUNyQixZQUFJLENBQUMsU0FBUztBQUNaLGVBQUssY0FBYztBQUNuQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxjQUFNLGNBQWMsS0FBSyxLQUFLO0FBQzlCLFlBQUksQ0FBQyxhQUFhO0FBQ2hCLGVBQUssY0FBYztBQUNuQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxZQUFJLFFBQVEsU0FBUyxhQUFhO0FBQ2hDLGVBQUssb0JBQW9CO0FBQ3pCLGVBQUssY0FBYztBQUNuQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxjQUFNLGlCQUFpQixLQUFLLFdBQVcsV0FBVztBQUNsRCxZQUFJLGtCQUFrQixlQUFlLE9BQU8sUUFBUSxJQUFJO0FBQ3RELGVBQUssY0FBYyx5QkFBb0IsV0FBVztBQUNsRCxpQkFBTztBQUFBLFFBQ1Q7QUFFQSxjQUFNLFNBQVMsZ0JBQWdCO0FBQy9CLGFBQUssV0FBVyxLQUFLLFNBQVMsSUFBSSxDQUFDLFVBQ2pDLE1BQU0sT0FBTyxRQUFRLEtBQ2pCLEVBQUUsR0FBRyxPQUFPLE1BQU0sYUFBYSxXQUFXLE9BQU8sSUFDakQsS0FDTDtBQUNELGFBQUssbUJBQW1CO0FBQ3hCLGFBQUssb0JBQW9CLDRCQUF1QixXQUFXO0FBQzNELGFBQUssY0FBYztBQUNuQixhQUFLLGlCQUFpQjtBQUN0QixlQUFPO0FBQUEsTUFDVDtBQUFBLE1BRUEsd0JBQWlDO0FBQy9CLGNBQU0sVUFBVSxLQUFLO0FBQ3JCLFlBQUksQ0FBQyxTQUFTO0FBQ1osZUFBSyxjQUFjO0FBQ25CLGlCQUFPO0FBQUEsUUFDVDtBQUVBLGFBQUssV0FBVyxLQUFLLFNBQVMsT0FBTyxDQUFDLFVBQVUsTUFBTSxPQUFPLFFBQVEsRUFBRTtBQUN2RSxjQUFNLGlCQUFpQixLQUFLLFNBQVMsQ0FBQyxHQUFHLE1BQU07QUFDL0MsYUFBSyxvQkFBb0I7QUFDekIsYUFBSyxtQkFBbUIsS0FBSyxpQkFBaUIsUUFBUTtBQUN0RCxhQUFLLGVBQWU7QUFDcEIsYUFBSyxvQkFBb0IseUJBQW9CLFFBQVEsSUFBSTtBQUN6RCxhQUFLLGNBQWM7QUFDbkIsYUFBSyxpQkFBaUI7QUFDdEIsZUFBTztBQUFBLE1BQ1Q7QUFBQSxNQUVBLHdCQUFtRTtBQUNqRSxjQUFNLFVBQVUsS0FBSztBQUNyQixZQUFJLENBQUMsU0FBUztBQUNaLGVBQUssY0FBYztBQUNuQixpQkFBTztBQUFBLFFBQ1Q7QUFFQSxjQUFNLFdBQVcsS0FBSyxTQUFTLE9BQU87QUFDdEMsY0FBTSxPQUFPLHdCQUF3QixRQUFRO0FBQzdDLGFBQUssZUFBZTtBQUNwQixhQUFLLG9CQUFvQiwwQkFBcUIsUUFBUSxJQUFJO0FBQzFELGFBQUssY0FBYztBQUVuQixlQUFPO0FBQUEsVUFDTCxVQUFVLGtDQUFrQyxRQUFRLElBQUk7QUFBQSxVQUN4RDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFFQSxzQkFBc0IsT0FBTyxLQUFLLGNBQXVCO0FBQ3ZELGNBQU0sU0FBUywwQkFBMEIsSUFBSTtBQUM3QyxZQUFJLENBQUMsT0FBTyxJQUFJO0FBQ2QsZUFBSyxjQUFjLE9BQU87QUFDMUIsaUJBQU87QUFBQSxRQUNUO0FBRUEsY0FBTSxlQUFlLE9BQU8sUUFBUSxLQUFLLEtBQUs7QUFDOUMsY0FBTSxZQUFZLEtBQUssaUJBQWlCLFlBQVk7QUFDcEQsY0FBTSxXQUFXO0FBQUEsVUFDZixHQUFHLE9BQU87QUFBQSxVQUNWLE1BQU07QUFBQSxRQUNSO0FBQ0EsY0FBTSxTQUFTLGdCQUFnQjtBQUMvQixjQUFNLFFBQVEsMEJBQTBCLFVBQVUsZ0JBQWdCLEdBQUcsTUFBTTtBQUUzRSxhQUFLLFdBQVcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRO0FBQ3hDLGFBQUssb0JBQW9CLE1BQU07QUFDL0IsYUFBSyxtQkFBbUIsTUFBTTtBQUM5QixhQUFLLGVBQWUsd0JBQXdCLFFBQVE7QUFDcEQsYUFBSyxvQkFBb0IsY0FBYyxlQUNuQywwQkFBcUIsU0FBUyxZQUM5Qiw2QkFBd0IsU0FBUztBQUNyQyxhQUFLLGNBQWM7QUFDbkIsYUFBSyxpQkFBaUI7QUFDdEIsZUFBTztBQUFBLE1BQ1Q7QUFBQSxNQUVBLElBQUksa0JBQThDO0FBQ2hELGVBQU8sS0FBSyxTQUFTLEtBQUssQ0FBQyxZQUFZLFFBQVEsT0FBTyxLQUFLLGlCQUFpQixLQUFLO0FBQUEsTUFDbkY7QUFBQSxNQUVRLHVCQUF1RDtBQUM3RCxlQUFPO0FBQUEsVUFDTCxjQUFjLEVBQUUsR0FBRyxLQUFLLEtBQUssZ0JBQWdCLGFBQWE7QUFBQSxVQUMxRCxpQkFBaUIsS0FBSyxLQUFLLGdCQUFnQjtBQUFBLFVBQzNDLE9BQU8sS0FBSyxLQUFLLGdCQUFnQjtBQUFBLFVBQ2pDLFNBQVMsS0FBSyxLQUFLLGdCQUFnQjtBQUFBLFVBQ25DLGdCQUFnQixFQUFFLEdBQUcsS0FBSyxLQUFLLHdCQUF3QixRQUFRO0FBQUEsVUFDL0QsV0FBVztBQUFBLFlBQ1QsdUJBQXVCLEtBQUssS0FBSyx3QkFBd0I7QUFBQSxZQUN6RCx1QkFBdUIsS0FBSyxLQUFLLHdCQUF3QjtBQUFBLFVBQzNEO0FBQUEsVUFDQSxJQUFJO0FBQUEsWUFDRixXQUFXLEtBQUssS0FBSyxpQkFBaUI7QUFBQSxZQUN0QyxXQUFXLEtBQUssS0FBSyxpQkFBaUI7QUFBQSxVQUN4QztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFFUSxjQUFjLFVBQWdEO0FBQ3BFLGFBQUssS0FBSyxnQkFBZ0IscUJBQXFCO0FBQUEsVUFDN0MsY0FBYyxTQUFTO0FBQUEsVUFDdkIsaUJBQWlCLFNBQVM7QUFBQSxVQUMxQixPQUFPLFNBQVM7QUFBQSxVQUNoQixTQUFTLFNBQVM7QUFBQSxRQUNwQixDQUFDO0FBQ0QsYUFBSyxLQUFLLHdCQUF3QixxQkFBcUIsU0FBUyxnQkFBZ0IsU0FBUyxTQUFTO0FBQ2xHLGFBQUssS0FBSyxpQkFBaUIsd0JBQXdCLFNBQVMsRUFBRTtBQUFBLE1BQ2hFO0FBQUEsTUFFUSxhQUFhLE1BQWMsVUFBZ0U7QUFDakcsZUFBTztBQUFBLFVBQ0wsTUFBTTtBQUFBLFVBQ04sU0FBUztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUVRLFNBQVMsU0FBb0Q7QUFDbkUsZUFBTztBQUFBLFVBQ0wsTUFBTSxRQUFRO0FBQUEsVUFDZCxTQUFTLFFBQVE7QUFBQSxVQUNqQixNQUFNLFFBQVE7QUFBQSxVQUNkLFVBQVUsUUFBUTtBQUFBLFFBQ3BCO0FBQUEsTUFDRjtBQUFBLE1BRVEsV0FBVyxNQUEwQztBQUMzRCxjQUFNLGlCQUFpQixLQUFLLEtBQUssRUFBRSxZQUFZO0FBQy9DLGVBQU8sS0FBSyxTQUFTLEtBQUssQ0FBQyxZQUFZLFFBQVEsS0FBSyxLQUFLLEVBQUUsWUFBWSxNQUFNLGNBQWMsS0FBSztBQUFBLE1BQ2xHO0FBQUEsTUFFUSxpQkFBaUIsVUFBMEI7QUFDakQsY0FBTSxrQkFBa0IsU0FBUyxLQUFLLEtBQUs7QUFDM0MsWUFBSSxDQUFDLEtBQUssV0FBVyxlQUFlLEdBQUc7QUFDckMsaUJBQU87QUFBQSxRQUNUO0FBRUEsWUFBSSxRQUFRO0FBQ1osWUFBSSxZQUFZLEdBQUcsZUFBZSxJQUFJLEtBQUs7QUFDM0MsZUFBTyxLQUFLLFdBQVcsU0FBUyxHQUFHO0FBQ2pDLG1CQUFTO0FBQ1Qsc0JBQVksR0FBRyxlQUFlLElBQUksS0FBSztBQUFBLFFBQ3pDO0FBRUEsZUFBTztBQUFBLE1BQ1Q7QUFBQSxNQUVRLHFCQUEyQjtBQUNqQyxZQUFJO0FBQ0YsZ0JBQU0sUUFBUSxhQUFhLFFBQVEsNEJBQTRCO0FBQy9ELGNBQUksQ0FBQyxPQUFPO0FBQ1Y7QUFBQSxVQUNGO0FBRUEsZ0JBQU0sV0FBVyxvQ0FBb0MsS0FBSyxNQUFNLEtBQUssQ0FBWTtBQUNqRixlQUFLLFdBQVcsU0FBUztBQUN6QixlQUFLLG9CQUFvQixTQUFTLHFCQUFxQixTQUFTLFNBQVMsQ0FBQyxHQUFHLE1BQU07QUFDbkYsZUFBSyxtQkFBbUIsS0FBSyxpQkFBaUIsUUFBUTtBQUFBLFFBQ3hELFFBQVE7QUFBQSxRQUVSO0FBQUEsTUFDRjtBQUFBLE1BRVEsbUJBQXlCO0FBQy9CLFlBQUk7QUFDRix1QkFBYTtBQUFBLFlBQ1g7QUFBQSxZQUNBLEtBQUssVUFBVTtBQUFBLGNBQ2IsVUFBVSxLQUFLO0FBQUEsY0FDZixtQkFBbUIsS0FBSztBQUFBLFlBQzFCLENBQUM7QUFBQSxVQUNIO0FBQUEsUUFDRixRQUFRO0FBQUEsUUFFUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRU8sSUFBTSwyQkFBMkIsSUFBSSx5QkFBeUI7QUFBQTtBQUFBOzs7QUMxWXJFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7OztBQ1hBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtQkEsU0FBUyxJQUFJLE9BQXVCO0FBQ2xDLFFBQU0sV0FBVyxNQUFNLEtBQUssRUFBRSxTQUFTLEdBQUcsSUFBSSxNQUFNLEtBQUssSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQzVFLFNBQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUEyRixRQUFRO0FBQzVHO0FBMkVPLFNBQVMsZUFBZSxJQUFpQztBQUM5RCxTQUFPLG9CQUFvQixLQUFLLE9BQUssRUFBRSxPQUFPLEVBQUU7QUFDbEQ7QUFuR0EsSUF3QmE7QUF4QmI7QUFBQTtBQUFBO0FBd0JPLElBQU0sc0JBQWlDO0FBQUEsTUFDNUM7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLEtBQUssSUFBSSxpQkFBaUI7QUFBQSxNQUM1QjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLEtBQUssSUFBSSw0QkFBNEI7QUFBQSxNQUN2QztBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLEtBQUssSUFBSSw0QkFBNEI7QUFBQSxNQUN2QztBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLEtBQUssSUFBSSxVQUFVO0FBQUEsTUFDckI7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixhQUFhO0FBQUEsUUFDYixLQUFLLElBQUksVUFBVTtBQUFBLE1BQ3JCO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osTUFBTTtBQUFBLFFBQ04sTUFBTTtBQUFBLFFBQ04sYUFBYTtBQUFBLFFBQ2IsS0FBSyxJQUFJLFVBQVU7QUFBQSxNQUNyQjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLEtBQUssSUFBSSxnQkFBZ0I7QUFBQSxNQUMzQjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLEtBQUssSUFBSSxpQkFBaUI7QUFBQSxNQUM1QjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLEtBQUssSUFBSSxvQkFBb0I7QUFBQSxNQUMvQjtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxRQUNiLEtBQUssSUFBSSxvQkFBb0I7QUFBQSxNQUMvQjtBQUFBLElBQ0Y7QUFBQTtBQUFBOzs7QUMvRkEsT0FBTyxZQUFZO0FBQ25CLE9BQU8sVUFBVTtBQUVqQixJQUFNLGdCQUFOLE1BQW9CO0FBQUEsRUFDVixRQUFRLG9CQUFJLElBQW9CO0FBQUEsRUFFeEMsUUFBUSxLQUE0QjtBQUNsQyxXQUFPLEtBQUssTUFBTSxJQUFJLEdBQUcsSUFBSyxLQUFLLE1BQU0sSUFBSSxHQUFHLEtBQUssT0FBUTtBQUFBLEVBQy9EO0FBQUEsRUFFQSxRQUFRLEtBQWEsT0FBcUI7QUFDeEMsU0FBSyxNQUFNLElBQUksS0FBSyxLQUFLO0FBQUEsRUFDM0I7QUFBQSxFQUVBLFdBQVcsS0FBbUI7QUFDNUIsU0FBSyxNQUFNLE9BQU8sR0FBRztBQUFBLEVBQ3ZCO0FBQUEsRUFFQSxRQUFjO0FBQ1osU0FBSyxNQUFNLE1BQU07QUFBQSxFQUNuQjtBQUNGO0FBRUEsSUFBTSxtQkFBbUIsSUFBSSxjQUFjO0FBQzFDLFdBQTBELGVBQWU7QUFFMUUsS0FBSyxrRUFBa0UsWUFBWTtBQUNqRixRQUFNLEVBQUUsc0JBQUFFLHVCQUFzQix3QkFBQUMsd0JBQXVCLElBQUksTUFBTTtBQUUvRCxTQUFPLE1BQU1BLHdCQUF1QixHQUFHLENBQUMsR0FBRyxJQUFJO0FBQy9DLFNBQU8sTUFBTUEsd0JBQXVCLEdBQUcsQ0FBQyxHQUFHLEtBQUs7QUFDaEQsU0FBTyxNQUFNRCxzQkFBcUIsU0FBUyxPQUFPLEdBQUcsS0FBSztBQUMxRCxTQUFPLE1BQU1BLHNCQUFxQixTQUFTLE9BQU8sR0FBRyxJQUFJO0FBQzNELENBQUM7QUFFRCxLQUFLLG1FQUFtRSxZQUFZO0FBQ2xGLFFBQU0sRUFBRSxlQUFBRSxnQkFBZSx1QkFBQUMsdUJBQXNCLElBQUksTUFBTTtBQUV2RCxTQUFPO0FBQUEsSUFDTEEsdUJBQXNCLE9BQU8sR0FBRyxFQUFFO0FBQUEsSUFDbEM7QUFBQSxFQUNGO0FBRUEsUUFBTSxRQUFRLElBQUlELGVBQWMsQ0FBQztBQUNqQyxRQUFNLElBQUksRUFBRSxLQUFLLEtBQUssT0FBTyxDQUFDLEdBQUcsV0FBVyxFQUFFLENBQUM7QUFDL0MsUUFBTSxJQUFJLEVBQUUsS0FBSyxLQUFLLE9BQU8sQ0FBQyxHQUFHLFdBQVcsRUFBRSxDQUFDO0FBQy9DLFFBQU0sSUFBSSxFQUFFLEtBQUssS0FBSyxPQUFPLENBQUMsR0FBRyxXQUFXLEVBQUUsQ0FBQztBQUUvQyxTQUFPLE1BQU0sTUFBTSxNQUFNLENBQUM7QUFDMUIsU0FBTyxNQUFNLE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSTtBQUNqQyxTQUFPLFNBQVMsTUFBTSxJQUFJLEdBQUcsR0FBRyxJQUFJO0FBQ3BDLFNBQU8sU0FBUyxNQUFNLElBQUksR0FBRyxHQUFHLElBQUk7QUFFcEMsUUFBTSxXQUFXLEdBQUc7QUFDcEIsU0FBTyxNQUFNLE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSTtBQUVqQyxRQUFNLFdBQVc7QUFDakIsU0FBTyxNQUFNLE1BQU0sTUFBTSxDQUFDO0FBQzVCLENBQUM7QUFFRCxLQUFLLDZFQUE2RSxZQUFZO0FBQzVGLFFBQU0sRUFBRSx3QkFBQUUseUJBQXdCLDBCQUFBQywwQkFBeUIsSUFBSSxNQUFNO0FBRW5FLFFBQU0sUUFBUUQsd0JBQXVCO0FBQUEsSUFDbkMsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osU0FBUztBQUFBLEVBQ1gsQ0FBQztBQUNELFFBQU0sUUFBUUEsd0JBQXVCO0FBQUEsSUFDbkMsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLElBQ1osU0FBUztBQUFBLEVBQ1gsQ0FBQztBQUVELFFBQU0sT0FBT0MsMEJBQXlCLEtBQUs7QUFDM0MsUUFBTSxPQUFPQSwwQkFBeUIsS0FBSztBQUUzQyxTQUFPLFNBQVMsS0FBSyxLQUFLLEdBQUcsS0FBSyxLQUFLLENBQUM7QUFDMUMsQ0FBQztBQUVELEtBQUsscUNBQXFDLFlBQVk7QUFDcEQsUUFBTSxFQUFFLG9CQUFBQyxvQkFBbUIsSUFBSSxNQUFNO0FBRXJDLFFBQU0sTUFBTUE7QUFBQSxJQUNWO0FBQUEsTUFDRSxPQUFPO0FBQUEsTUFDUCxLQUFLO0FBQUEsSUFDUDtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRUEsU0FBTyxNQUFNLEtBQUssNkJBQTZCO0FBQ2pELENBQUM7QUFFRCxLQUFLLHNEQUFzRCxZQUFZO0FBQ3JFLFFBQU0sRUFBRSxzQkFBQUMsc0JBQXFCLElBQUksTUFBTTtBQUV2QyxRQUFNLFFBQVFBLHNCQUFxQjtBQUFBLElBQ2pDO0FBQUEsTUFDRSxXQUFXO0FBQUEsTUFDWCxVQUFVO0FBQUEsTUFDVixLQUFLO0FBQUEsTUFDTCxZQUFZO0FBQUEsTUFDWixtQkFBbUI7QUFBQSxJQUNyQjtBQUFBLElBQ0E7QUFBQSxNQUNFLFdBQVc7QUFBQSxNQUNYLFVBQVU7QUFBQSxNQUNWLEtBQUs7QUFBQSxNQUNMLFlBQVk7QUFBQSxNQUNaLG1CQUFtQjtBQUFBLElBQ3JCO0FBQUEsRUFDRixDQUFDO0FBRUQsU0FBTyxVQUFVLE9BQU87QUFBQSxJQUN0QixvQkFBb0I7QUFBQSxJQUNwQixzQkFBc0IsQ0FBQyxDQUFDO0FBQUEsRUFDMUIsQ0FBQztBQUNILENBQUM7QUFFRCxLQUFLLGdHQUFnRyxZQUFZO0FBQy9HLG1CQUFpQixNQUFNO0FBRXZCLFFBQU0sRUFBRSxnQkFBQUMsaUJBQWdCLHlCQUFBQyx5QkFBd0IsSUFBSSxNQUFNO0FBRTFELEVBQUFELGdCQUFlLE1BQU07QUFDckIsRUFBQUMseUJBQXdCLGdCQUFnQjtBQUN4QyxFQUFBQSx5QkFBd0IsVUFBVSwwQkFBMEIsSUFBSTtBQUNoRSxFQUFBQSx5QkFBd0IseUJBQXlCLENBQUM7QUFFbEQsUUFBTSxjQUFjLE1BQU1ELGdCQUFlLFlBQVksUUFBUSxFQUFFLG1CQUFtQixLQUFLLENBQUM7QUFDeEYsU0FBTyxNQUFNLGFBQWEsS0FBSztBQUMvQixTQUFPLE1BQU1DLHlCQUF3QixvQkFBb0IsQ0FBQztBQUUxRCxRQUFNLGlCQUFpQixNQUFNRCxnQkFBZSxZQUFZLFFBQVEsRUFBRSxtQkFBbUIsS0FBSyxDQUFDO0FBQzNGLFNBQU8sTUFBTSxnQkFBZ0IsSUFBSTtBQUNqQyxTQUFPLE1BQU1DLHlCQUF3QixvQkFBb0IsQ0FBQztBQUMxRCxTQUFPLFVBQVVBLHlCQUF3QixzQkFBc0IsQ0FBQyxDQUFDLENBQUM7QUFFbEUsU0FBTyxNQUFNRCxnQkFBZSxXQUFXLEdBQUcsSUFBSTtBQUM5QyxTQUFPLE1BQU1DLHlCQUF3QixvQkFBb0IsQ0FBQztBQUMxRCxTQUFPLFVBQVVBLHlCQUF3QixzQkFBc0IsQ0FBQyxDQUFDO0FBRWpFLFNBQU8sTUFBTUQsZ0JBQWUsV0FBVyxHQUFHLElBQUk7QUFDOUMsU0FBTyxNQUFNQyx5QkFBd0Isb0JBQW9CLENBQUM7QUFDMUQsU0FBTyxVQUFVQSx5QkFBd0Isc0JBQXNCLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLENBQUM7QUFFRCxLQUFLLDhGQUE4RixZQUFZO0FBQzdHLG1CQUFpQixNQUFNO0FBRXZCLFFBQU0sRUFBRSxnQkFBQUQsaUJBQWdCLHlCQUFBQyx5QkFBd0IsSUFBSSxNQUFNO0FBQzFELFFBQU0sRUFBRSxxQkFBQUMscUJBQW9CLElBQUksTUFBTTtBQUV0QyxFQUFBRixnQkFBZSxNQUFNO0FBQ3JCLEVBQUFDLHlCQUF3QixnQkFBZ0I7QUFDeEMsRUFBQUEseUJBQXdCLFVBQVUsMEJBQTBCLElBQUk7QUFDaEUsUUFBTUQsZ0JBQWUsWUFBWSxRQUFRLEVBQUUsbUJBQW1CLEtBQUssQ0FBQztBQUNwRSxTQUFPLE1BQU1DLHlCQUF3QixvQkFBb0IsQ0FBQztBQUUxRCxFQUFBRCxnQkFBZSxRQUFRLDZCQUE2QjtBQUNwRCxTQUFPLE1BQU1DLHlCQUF3QixvQkFBb0IsQ0FBQztBQUUxRCxFQUFBRCxnQkFBZSxRQUFRLDhEQUE4RDtBQUNyRixTQUFPLE1BQU1BLGdCQUFlLGNBQWMsNkJBQTZCO0FBQ3ZFLFNBQU8sTUFBTUMseUJBQXdCLG9CQUFvQixDQUFDO0FBRTFELFFBQU1ELGdCQUFlLFlBQVksUUFBUSxFQUFFLG1CQUFtQixLQUFLLENBQUM7QUFDcEUsU0FBTyxNQUFNQyx5QkFBd0Isb0JBQW9CLENBQUM7QUFFMUQsRUFBQUQsZ0JBQWUsUUFBUUUscUJBQW9CLENBQUMsRUFBRSxHQUFHO0FBQ2pELFNBQU8sTUFBTUQseUJBQXdCLG9CQUFvQixDQUFDO0FBQzVELENBQUM7QUFFRCxLQUFLLDJEQUEyRCxZQUFZO0FBQzFFLG1CQUFpQixNQUFNO0FBRXZCLFFBQU0sRUFBRSxnQkFBQUQsaUJBQWdCLGlCQUFBRyxrQkFBaUIseUJBQUFGLDBCQUF5QixpQkFBQUcsaUJBQWdCLElBQUksTUFBTTtBQUU1RixFQUFBSixnQkFBZSxNQUFNO0FBQ3JCLEVBQUFDLHlCQUF3QixnQkFBZ0I7QUFDeEMsRUFBQUEseUJBQXdCLFVBQVUsMkJBQTJCLElBQUk7QUFDakUsRUFBQUcsaUJBQWdCLFlBQVksUUFBUTtBQUVwQyxRQUFNLHFCQUFxQkQsaUJBQWdCLFdBQVcsS0FBS0EsZ0JBQWU7QUFDMUUsUUFBTSwwQkFBMEJBLGlCQUFnQixnQkFBZ0IsS0FBS0EsZ0JBQWU7QUFDcEYsUUFBTSxtQkFBbUJBLGlCQUFnQixxQkFBcUIsS0FBS0EsZ0JBQWU7QUFFbEYsTUFBSSxlQUFvQztBQUV4QyxFQUFBQSxpQkFBZ0IsZ0JBQWdCO0FBQ2hDLEVBQUFBLGlCQUFnQixhQUFhLFlBQVk7QUFDekMsRUFBQUEsaUJBQWdCLGtCQUFrQixPQUFPLFNBQWlCO0FBQUEsSUFDeEQsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsT0FBTztBQUFBLE1BQ0w7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLFVBQVU7QUFBQSxRQUNWLElBQUksQ0FBQyxNQUFNO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxPQUFPO0FBQUEsUUFDUCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFlBQVk7QUFBQSxNQUNWLE9BQU87QUFBQSxNQUNQLE9BQU87QUFBQSxNQUNQLFFBQVE7QUFBQSxNQUNSLGlCQUFpQjtBQUFBLE1BQ2pCLFlBQVk7QUFBQSxJQUNkO0FBQUEsSUFDQSxTQUFTO0FBQUEsSUFDVCxXQUFXO0FBQUEsSUFDWCxTQUFTO0FBQUEsRUFDWDtBQUNBLEVBQUFBLGlCQUFnQix1QkFBdUIsT0FBTztBQUFBLElBQzVDLE1BQU07QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLFVBQVU7QUFBQSxNQUNWLElBQUksQ0FBQyxNQUFNO0FBQUEsTUFDWCxTQUFTO0FBQUEsTUFDVCxPQUFPO0FBQUEsTUFDUCxRQUFRO0FBQUEsSUFDVjtBQUFBLElBQ0EsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLEVBQ2Y7QUFFQSxFQUFDSCxnQkFBMkUsT0FBTyxNQUNqRixJQUFJLFFBQWMsQ0FBQyxZQUFZO0FBQzdCLG1CQUFlO0FBQUEsRUFDakIsQ0FBQztBQUVILFFBQU0sY0FBY0EsZ0JBQWUsY0FBYyxJQUFJO0FBQ3JELFFBQU0sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM3QixlQUFXLFNBQVMsQ0FBQztBQUFBLEVBQ3ZCLENBQUM7QUFDRCxFQUFBQSxnQkFBZSxRQUFRLDZCQUE2QjtBQUNwRCxpQkFBZTtBQUNmLFFBQU0sU0FBUyxNQUFNO0FBRXJCLFNBQU8sTUFBTSxRQUFRLElBQUk7QUFDekIsU0FBTyxNQUFNQSxnQkFBZSxLQUFLLDZCQUE2QjtBQUU5RCxFQUFBRyxpQkFBZ0IsYUFBYTtBQUM3QixFQUFBQSxpQkFBZ0Isa0JBQWtCO0FBQ2xDLEVBQUFBLGlCQUFnQix1QkFBdUI7QUFDekMsQ0FBQztBQUVELEtBQUssMkVBQTJFLFlBQVk7QUFDMUYsbUJBQWlCLE1BQU07QUFFdkIsUUFBTSxFQUFFLGlCQUFBRSxpQkFBZ0IsSUFBSSxNQUFNO0FBQ2xDLFFBQU0sRUFBRSxrQkFBQUMsa0JBQWlCLElBQUksTUFBTTtBQUNuQyxRQUFNLFNBQVMsSUFBSUQsaUJBQWdCO0FBRW5DLFFBQU0scUJBQXFCLE9BQU8sV0FBVyxLQUFLLE1BQU07QUFDeEQsUUFBTSxrQkFBa0JDLGtCQUFpQixnQkFBZ0IsS0FBS0EsaUJBQWdCO0FBQzlFLFFBQU0sb0JBQW9CQSxrQkFBaUIsVUFBVSxLQUFLQSxpQkFBZ0I7QUFDMUUsUUFBTSxlQUFlQSxrQkFBaUIsS0FBSyxLQUFLQSxpQkFBZ0I7QUFFaEUsTUFBSSxrQkFBdUM7QUFDM0MsTUFBSSxlQUFlO0FBRW5CLFNBQU8sZ0JBQWdCO0FBQ3ZCLFNBQU8sYUFBYSxZQUFZO0FBQ2hDLEVBQUFBLGtCQUFpQixZQUFZLE1BQU07QUFDbkMsRUFBQUEsa0JBQWlCLE9BQU8sTUFBTTtBQUM5QixFQUFBQSxrQkFBaUIsa0JBQWtCLFlBQVk7QUFDN0Msb0JBQWdCO0FBQ2hCLFVBQU0sSUFBSSxRQUFjLENBQUMsWUFBWTtBQUNuQyx3QkFBa0I7QUFBQSxJQUNwQixDQUFDO0FBRUQsV0FBTztBQUFBLE1BQ0w7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLFVBQVU7QUFBQSxRQUNWLElBQUksQ0FBQyxNQUFNO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxPQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsUUFBTSxvQkFBb0IsT0FBTyxnQkFBZ0IsY0FBYyxJQUFJLEdBQUcsWUFBWTtBQUNsRixRQUFNLElBQUksUUFBUSxDQUFDLFlBQVksV0FBVyxTQUFTLENBQUMsQ0FBQztBQUNyRCxRQUFNLG9CQUFvQixPQUFPLGdCQUFnQixjQUFjLElBQUksR0FBRyxZQUFZO0FBRWxGLG9CQUFrQjtBQUVsQixRQUFNLENBQUMsa0JBQWtCLGdCQUFnQixJQUFJLE1BQU0sUUFBUSxJQUFJLENBQUMsbUJBQW1CLGlCQUFpQixDQUFDO0FBRXJHLFNBQU8sTUFBTSxjQUFjLENBQUM7QUFDNUIsU0FBTyxNQUFNLGlCQUFpQixTQUFTLEtBQUs7QUFDNUMsU0FBTyxNQUFNLGlCQUFpQixTQUFTLEtBQUs7QUFDNUMsU0FBTyxNQUFNLGlCQUFpQixhQUFhLFlBQVk7QUFFdkQsU0FBTyxhQUFhO0FBQ3BCLEVBQUFBLGtCQUFpQixrQkFBa0I7QUFDbkMsRUFBQUEsa0JBQWlCLFlBQVk7QUFDN0IsRUFBQUEsa0JBQWlCLE9BQU87QUFDMUIsQ0FBQztBQUVELEtBQUssaUZBQWlGLFlBQVk7QUFDaEcsbUJBQWlCLE1BQU07QUFFdkIsUUFBTSxFQUFFLGdCQUFBQyxpQkFBZ0IsZ0JBQUFQLGlCQUFnQix5QkFBQUMseUJBQXdCLElBQUksTUFBTTtBQUUxRSxFQUFBQSx5QkFBd0IsZ0JBQWdCO0FBQ3hDLEVBQUFBLHlCQUF3QixVQUFVLHVCQUF1QixJQUFJO0FBQzdELEVBQUFBLHlCQUF3QixVQUFVLDBCQUEwQixJQUFJO0FBQ2hFLEVBQUFBLHlCQUF3Qix5QkFBeUIsQ0FBQztBQUVsRCxFQUFBRCxnQkFBZSxNQUFNO0FBQ3JCLFFBQU0sY0FBYyxNQUFNQSxnQkFBZSxZQUFZLFFBQVEsRUFBRSxtQkFBbUIsS0FBSyxDQUFDO0FBQ3hGLFNBQU8sTUFBTSxhQUFhLElBQUk7QUFDOUIsU0FBTyxNQUFNQyx5QkFBd0Isb0JBQW9CLENBQUM7QUFFMUQsU0FBTyxNQUFNRCxnQkFBZSxXQUFXLEdBQUcsSUFBSTtBQUM5QyxTQUFPLE1BQU1DLHlCQUF3QixvQkFBb0IsQ0FBQztBQUMxRCxTQUFPLE1BQU1ELGdCQUFlLFNBQVMsSUFBSTtBQUV6QyxRQUFNLGdCQUFnQixJQUFJTyxnQkFBZTtBQUN6QyxTQUFPLE1BQU0sY0FBYyxTQUFTLElBQUk7QUFDeEMsU0FBTyxNQUFNTix5QkFBd0Isb0JBQW9CLENBQUM7QUFFMUQsU0FBTyxNQUFNLGNBQWMsV0FBVyxHQUFHLElBQUk7QUFDN0MsU0FBTyxNQUFNQSx5QkFBd0Isb0JBQW9CLENBQUM7QUFDMUQsU0FBTyxVQUFVQSx5QkFBd0Isc0JBQXNCLENBQUMsQ0FBQyxDQUFDO0FBRWxFLFNBQU8sTUFBTSxjQUFjLFdBQVcsR0FBRyxJQUFJO0FBQzdDLFNBQU8sTUFBTUEseUJBQXdCLG9CQUFvQixDQUFDO0FBQzVELENBQUM7QUFFRCxLQUFLLGlFQUFpRSxZQUFZO0FBQ2hGLG1CQUFpQixNQUFNO0FBRXZCLFFBQU0sRUFBRSxpQkFBQUksa0JBQWlCLHlCQUFBSix5QkFBd0IsSUFBSSxNQUFNO0FBQzNELFFBQU0sRUFBRSxrQkFBQUssa0JBQWlCLElBQUksTUFBTTtBQUNuQyxRQUFNLEVBQUUsZUFBQUUsZUFBYyxJQUFJLE1BQU07QUFDaEMsUUFBTSxTQUFTLElBQUlILGlCQUFnQjtBQUVuQyxRQUFNLHFCQUFxQixPQUFPLFdBQVcsS0FBSyxNQUFNO0FBQ3hELFFBQU0sa0JBQWtCQyxrQkFBaUIsZ0JBQWdCLEtBQUtBLGlCQUFnQjtBQUM5RSxRQUFNLG9CQUFvQkEsa0JBQWlCLFVBQVUsS0FBS0EsaUJBQWdCO0FBRTFFLEVBQUFMLHlCQUF3QixnQkFBZ0I7QUFDeEMsRUFBQUEseUJBQXdCLFVBQVUsd0JBQXdCLElBQUk7QUFDOUQsRUFBQU8sZUFBYyxXQUFXO0FBRXpCLFNBQU8sZ0JBQWdCO0FBQ3ZCLFNBQU8sYUFBYSxZQUFZO0FBQ2hDLEVBQUFGLGtCQUFpQixZQUFZLE1BQU07QUFDbkMsRUFBQUEsa0JBQWlCLGtCQUFrQixZQUFZO0FBQUEsSUFDN0M7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLFVBQVU7QUFBQSxNQUNWLElBQUksQ0FBQyxNQUFNO0FBQUEsTUFDWCxTQUFTO0FBQUEsTUFDVCxPQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFFQSxRQUFNLFFBQVEsTUFBTSxPQUFPLGdCQUFnQixhQUFhLElBQUksR0FBRyxZQUFZO0FBQzNFLFFBQU0sU0FBUyxNQUFNLE9BQU8sZ0JBQWdCLGFBQWEsSUFBSSxHQUFHLFlBQVk7QUFFNUUsU0FBTyxNQUFNLE1BQU0sV0FBVyxLQUFLO0FBQ25DLFNBQU8sTUFBTSxPQUFPLFdBQVcsSUFBSTtBQUNuQyxTQUFPLE1BQU0sT0FBTyx1QkFBdUIsSUFBSTtBQUUvQyxTQUFPLGFBQWE7QUFDcEIsRUFBQUEsa0JBQWlCLGtCQUFrQjtBQUNuQyxFQUFBQSxrQkFBaUIsWUFBWTtBQUMvQixDQUFDO0FBRUQsS0FBSyxxRUFBcUUsWUFBWTtBQUNwRixtQkFBaUIsTUFBTTtBQUV2QixRQUFNLEVBQUUsMEJBQUFHLDBCQUF5QixJQUFJLE1BQU07QUFDM0MsUUFBTSxFQUFFLHVCQUFBQyx1QkFBc0IsSUFBSSxNQUFNO0FBQ3hDLFFBQU0sRUFBRSx5QkFBQUMseUJBQXdCLElBQUksTUFBTTtBQUUxQyxNQUFJLGdCQUF5QjtBQUM3QixNQUFJLHdCQUFpQztBQUNyQyxNQUFJLDJCQUFvQztBQUN4QyxNQUFJLFlBQXFCO0FBRXpCLFFBQU0sV0FBVyxJQUFJRiwwQkFBeUI7QUFBQSxJQUM1QyxpQkFBaUI7QUFBQSxNQUNmLGNBQWM7QUFBQSxRQUNaLEdBQUdDO0FBQUEsUUFDSCxNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsTUFDVDtBQUFBLE1BQ0EsaUJBQWlCO0FBQUEsTUFDakIsT0FBTztBQUFBLE1BQ1AsU0FBUztBQUFBLE1BQ1Qsc0JBQXNCLENBQUMsYUFBYTtBQUNsQyx3QkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHlCQUF5QjtBQUFBLE1BQ3ZCLFNBQVM7QUFBQSxRQUNQLEdBQUdDO0FBQUEsUUFDSCxxQkFBcUI7QUFBQSxRQUNyQixzQkFBc0I7QUFBQSxRQUN0Qix3QkFBd0I7QUFBQSxNQUMxQjtBQUFBLE1BQ0EsdUJBQXVCO0FBQUEsTUFDdkIsdUJBQXVCO0FBQUEsTUFDdkIsc0JBQXNCLENBQUMsU0FBUyxjQUFjO0FBQzVDLGdDQUF3QjtBQUN4QixtQ0FBMkI7QUFBQSxNQUM3QjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGtCQUFrQjtBQUFBLE1BQ2hCLFdBQVc7QUFBQSxNQUNYLFdBQVc7QUFBQSxNQUNYLHlCQUF5QixDQUFDLGdCQUFnQjtBQUN4QyxvQkFBWTtBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBRUQsV0FBUyxvQkFBb0IsaUJBQWlCO0FBQzlDLFNBQU8sTUFBTSxTQUFTLG1CQUFtQixHQUFHLElBQUk7QUFDaEQsU0FBTyxNQUFNLFNBQVMsU0FBUyxRQUFRLENBQUM7QUFDeEMsU0FBTyxNQUFNLFNBQVMsU0FBUyxDQUFDLEdBQUcsTUFBTSxpQkFBaUI7QUFDMUQsU0FBTyxNQUFNLFNBQVMsU0FBUyxDQUFDLEdBQUcsU0FBUyxPQUFPLEVBQUU7QUFDckQsU0FBTyxNQUFNLFNBQVMsU0FBUyxDQUFDLEdBQUcsU0FBUyxlQUFlLHFCQUFxQixJQUFJO0FBQ3BGLFNBQU8sTUFBTSxTQUFTLFNBQVMsQ0FBQyxHQUFHLFNBQVMsVUFBVSx1QkFBdUIsQ0FBQztBQUM5RSxTQUFPLE1BQU0sU0FBUyxTQUFTLENBQUMsR0FBRyxTQUFTLEdBQUcsV0FBVyxTQUFTO0FBRW5FLFNBQU8sTUFBTSxTQUFTLG9CQUFvQixHQUFHLElBQUk7QUFDakQsU0FBTyxVQUFVLGVBQWU7QUFBQSxJQUM5QixjQUFjO0FBQUEsTUFDWixHQUFHRDtBQUFBLE1BQ0gsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLElBQ1Q7QUFBQSxJQUNBLGlCQUFpQjtBQUFBLElBQ2pCLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxFQUNYLENBQUM7QUFDRCxTQUFPLFVBQVUsdUJBQXVCO0FBQUEsSUFDdEMsR0FBR0M7QUFBQSxJQUNILHFCQUFxQjtBQUFBLElBQ3JCLHNCQUFzQjtBQUFBLElBQ3RCLHdCQUF3QjtBQUFBLEVBQzFCLENBQUM7QUFDRCxTQUFPLFVBQVUsMEJBQTBCO0FBQUEsSUFDekMsdUJBQXVCO0FBQUEsSUFDdkIsdUJBQXVCO0FBQUEsRUFDekIsQ0FBQztBQUNELFNBQU8sVUFBVSxXQUFXO0FBQUEsSUFDMUIsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLEVBQ2IsQ0FBQztBQUNILENBQUM7QUFFRCxLQUFLLHVFQUF1RSxZQUFZO0FBQ3RGLG1CQUFpQixNQUFNO0FBRXZCLFFBQU0sRUFBRSwwQkFBQUYsMEJBQXlCLElBQUksTUFBTTtBQUMzQyxRQUFNLEVBQUUsdUJBQUFDLHVCQUFzQixJQUFJLE1BQU07QUFDeEMsUUFBTSxFQUFFLHlCQUFBQyx5QkFBd0IsSUFBSSxNQUFNO0FBRTFDLFFBQU0sV0FBVyxJQUFJRiwwQkFBeUI7QUFBQSxJQUM1QyxpQkFBaUI7QUFBQSxNQUNmLGNBQWMsRUFBRSxHQUFHQyx1QkFBc0I7QUFBQSxNQUN6QyxpQkFBaUI7QUFBQSxNQUNqQixPQUFPO0FBQUEsTUFDUCxTQUFTO0FBQUEsTUFDVCxzQkFBc0IsTUFBTTtBQUFBLElBQzlCO0FBQUEsSUFDQSx5QkFBeUI7QUFBQSxNQUN2QixTQUFTLEVBQUUsR0FBR0MseUJBQXdCO0FBQUEsTUFDdEMsdUJBQXVCO0FBQUEsTUFDdkIsdUJBQXVCO0FBQUEsTUFDdkIsc0JBQXNCLE1BQU07QUFBQSxJQUM5QjtBQUFBLElBQ0Esa0JBQWtCO0FBQUEsTUFDaEIsV0FBVztBQUFBLE1BQ1gsV0FBVztBQUFBLE1BQ1gseUJBQXlCLE1BQU07QUFBQSxJQUNqQztBQUFBLEVBQ0YsQ0FBQztBQUVELFdBQVMsb0JBQW9CLFVBQVU7QUFDdkMsU0FBTyxNQUFNLFNBQVMsbUJBQW1CLEdBQUcsSUFBSTtBQUVoRCxXQUFTLGdCQUFnQixXQUFXO0FBQ3BDLFNBQU8sTUFBTSxTQUFTLHNCQUFzQixHQUFHLEtBQUs7QUFDcEQsU0FBTyxNQUFNLFNBQVMsYUFBYSxzQkFBc0I7QUFFekQsV0FBUztBQUFBLElBQ1AsS0FBSyxVQUFVO0FBQUEsTUFDYixNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsTUFDVCxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsUUFDUixjQUFjRDtBQUFBLFFBQ2QsaUJBQWlCO0FBQUEsUUFDakIsT0FBTztBQUFBLFFBQ1AsU0FBUztBQUFBLFFBQ1QsZ0JBQWdCO0FBQUEsVUFDZCxHQUFHQztBQUFBLFVBQ0gscUJBQXFCO0FBQUEsUUFDdkI7QUFBQSxRQUNBLFdBQVc7QUFBQSxVQUNULHVCQUF1QjtBQUFBLFVBQ3ZCLHVCQUF1QjtBQUFBLFFBQ3pCO0FBQUEsUUFDQSxJQUFJO0FBQUEsVUFDRixXQUFXO0FBQUEsVUFDWCxXQUFXO0FBQUEsUUFDYjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBRUEsU0FBTyxNQUFNLFNBQVMsc0JBQXNCLEdBQUcsSUFBSTtBQUNuRCxTQUFPLE1BQU0sU0FBUyxTQUFTLFFBQVEsQ0FBQztBQUN4QyxTQUFPLE1BQU0sU0FBUyxTQUFTLENBQUMsR0FBRyxNQUFNLFlBQVk7QUFDckQsU0FBTyxNQUFNLFNBQVMsU0FBUyxDQUFDLEdBQUcsU0FBUyxpQkFBaUIsTUFBTTtBQUNuRSxTQUFPLE1BQU0sU0FBUyxTQUFTLENBQUMsR0FBRyxTQUFTLEdBQUcsV0FBVyxPQUFPO0FBQ25FLENBQUM7IiwKICAibmFtZXMiOiBbIkNoZXNzIiwgIlBJRUNFX1ZBTFVFUyIsICJCVUNLRVRfT1JERVIiLCAiQ2hlc3MiLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJsb2dnZXIiLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJyZWFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiYWN0aW9uIiwgInJlYWN0aW9uIiwgInJ1bkluQWN0aW9uIiwgIkNoZXNzIiwgImxvZ2dlciIsICJwZ24iLCAiYWN0aW9uIiwgIm1ha2VBdXRvT2JzZXJ2YWJsZSIsICJhY3Rpb24iLCAibWFrZUF1dG9PYnNlcnZhYmxlIiwgImFjdGlvbiIsICJtYWtlQXV0b09ic2VydmFibGUiLCAiY2FuQXBwbHlBbmFseXplZE1vdmUiLCAiaXNTdGFsZUFuYWx5c2lzUmVxdWVzdCIsICJBbmFseXNpc0NhY2hlIiwgImJ1aWxkQW5hbHlzaXNDYWNoZUtleSIsICJidWlsZERldGVybWluaXN0aWNTZWVkIiwgImNyZWF0ZVNlZWRlZFJhbmRvbVNvdXJjZSIsICJyZXNvbHZlUGduU3RhcnRGZW4iLCAiZGVyaXZlQnJpbGxpYW50VXNhZ2UiLCAiYm9hcmRWaWV3TW9kZWwiLCAiZmVhdHVyZU9wdGlvbnNWaWV3TW9kZWwiLCAiUFJFREVGSU5FRF9PUEVOSU5HUyIsICJlbmdpbmVWaWV3TW9kZWwiLCAiY29uZmlnVmlld01vZGVsIiwgIkVuZ2luZVZpZXdNb2RlbCIsICJzdG9ja2Zpc2hTZXJ2aWNlIiwgIkJvYXJkVmlld01vZGVsIiwgImFuYWx5c2lzQ2FjaGUiLCAiUGVyc29uYVByb2ZpbGVzVmlld01vZGVsIiwgIkRFRkFVTFRfQlVDS0VUX0NPTkZJRyIsICJERUZBVUxUX0ZFQVRVUkVfT1BUSU9OUyJdCn0K
