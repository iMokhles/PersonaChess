import { MoveAnnotation } from './brilliantTracking';
import { DisplayMoveBucket, MoveQualityPresetId } from './types';

export interface GameAnalyticsSummary {
  sessionId: string;
  createdAt: string;
  finishedAt: string;
  result: string;
  gameStatus: string;
  personaId: MoveQualityPresetId | 'custom';
  personaLabel: string;
  setupName: string;
  setupCategory: string;
  moveCount: number;
  brilliantMoves: number;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
  averageEvalLoss: number;
  averageMoveDelayMs: number;
  autoplayDurationMs: number;
  qualityCounts: Record<DisplayMoveBucket, number>;
  complexityDistribution: Record<'low' | 'medium' | 'high', number>;
  moveTimeline: Array<{
    ply: number;
    actor: 'player' | 'engine' | 'redo';
    san: string;
    bucket: string | null;
    evalLoss: number | null;
    evaluation: number | null;
    complexityLevel: 'low' | 'medium' | 'high' | null;
    complexityScore: number | null;
    delayMsSincePrevious: number;
    consumedBrilliant: boolean;
  }>;
  highlightedBrilliantMoves: Array<{ ply: number; san: string }>;
  majorMistakes: Array<{ ply: number; san: string; bucket: string | null; evalLoss: number | null }>;
  evalTrend: Array<{ ply: number; evaluation: number }>;
  complexityTrend: Array<{ ply: number; score: number }>;
  pgn: string;
}

export interface RecentGameEntry {
  sessionId: string;
  finishedAt: string;
  result: string;
  personaLabel: string;
  personaId: MoveQualityPresetId | 'custom';
  setupName: string;
  durationMs: number;
  moveCount: number;
  brilliantMoves: number;
}

export interface BuildGameAnalyticsOptions {
  sessionId: string;
  createdAtMs: number;
  finishedAtMs: number;
  gameStatus: string;
  personaId: MoveQualityPresetId | null;
  personaLabel: string;
  setupName?: string | null;
  setupCategory?: string | null;
  autoplayDurationMs: number;
  moveAnnotations: MoveAnnotation[];
  pgn: string;
}

const ALL_BUCKETS: DisplayMoveBucket[] = [
  'best',
  'great',
  'excellent',
  'good',
  'inaccuracy',
  'mistake',
  'blunder',
  'fallback',
];

function createEmptyQualityCounts(): Record<DisplayMoveBucket, number> {
  return ALL_BUCKETS.reduce((counts, bucket) => {
    counts[bucket] = 0;
    return counts;
  }, {} as Record<DisplayMoveBucket, number>);
}

function classifyResult(gameStatus: string): string {
  if (/checkmate/i.test(gameStatus)) {
    const winner = gameStatus.includes('White wins') ? 'White' : gameStatus.includes('Black wins') ? 'Black' : 'Decisive';
    return `${winner} won`;
  }

  if (/stalemate|draw/i.test(gameStatus)) {
    return 'Draw';
  }

  if (/check/i.test(gameStatus)) {
    return 'In progress';
  }

  return 'In progress';
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function buildGameAnalyticsSummary(options: BuildGameAnalyticsOptions): GameAnalyticsSummary {
  const qualityCounts = createEmptyQualityCounts();
  const complexityDistribution: Record<'low' | 'medium' | 'high', number> = {
    low: 0,
    medium: 0,
    high: 0,
  };

  let evalLossTotal = 0;
  let evalLossCount = 0;
  let delayTotal = 0;
  let delayCount = 0;
  let brilliantMoves = 0;

  const moveTimeline = options.moveAnnotations.map((annotation, index) => {
    const bucket = (annotation.bucket ?? null) as string | null;
    const typedBucket = ALL_BUCKETS.includes(bucket as DisplayMoveBucket)
      ? (bucket as DisplayMoveBucket)
      : null;

    if (typedBucket) {
      qualityCounts[typedBucket] += 1;
    }

    if (annotation.consumedBrilliant) {
      brilliantMoves += 1;
    }

    if (typeof annotation.evalLoss === 'number') {
      evalLossTotal += annotation.evalLoss;
      evalLossCount += 1;
    }

    if (typeof annotation.delayMsSincePrevious === 'number') {
      delayTotal += annotation.delayMsSincePrevious;
      delayCount += 1;
    }

    if (annotation.complexityLevel) {
      complexityDistribution[annotation.complexityLevel] += 1;
    }

    return {
      ply: index + 1,
      actor: annotation.actor ?? 'player',
      san: annotation.san ?? annotation.uci,
      bucket,
      evalLoss: annotation.evalLoss ?? null,
      evaluation: annotation.evaluation ?? null,
      complexityLevel: annotation.complexityLevel ?? null,
      complexityScore: annotation.complexityScore ?? null,
      delayMsSincePrevious: annotation.delayMsSincePrevious ?? 0,
      consumedBrilliant: annotation.consumedBrilliant,
    };
  });

  const highlightedBrilliantMoves = moveTimeline
    .filter((entry) => entry.consumedBrilliant)
    .map((entry) => ({ ply: entry.ply, san: entry.san }));
  const majorMistakes = moveTimeline
    .filter((entry) => entry.bucket === 'mistake' || entry.bucket === 'blunder')
    .map((entry) => ({
      ply: entry.ply,
      san: entry.san,
      bucket: entry.bucket,
      evalLoss: entry.evalLoss,
    }));
  const evalTrend = moveTimeline
    .filter((entry): entry is typeof entry & { evaluation: number } => typeof entry.evaluation === 'number')
    .map((entry) => ({ ply: entry.ply, evaluation: entry.evaluation }));
  const complexityTrend = moveTimeline
    .filter((entry): entry is typeof entry & { complexityScore: number } => typeof entry.complexityScore === 'number')
    .map((entry) => ({ ply: entry.ply, score: entry.complexityScore }));

  return {
    sessionId: options.sessionId,
    createdAt: new Date(options.createdAtMs).toISOString(),
    finishedAt: new Date(options.finishedAtMs).toISOString(),
    result: classifyResult(options.gameStatus),
    gameStatus: options.gameStatus,
    personaId: options.personaId ?? 'custom',
    personaLabel: options.personaLabel,
    setupName: options.setupName ?? 'New Game',
    setupCategory: options.setupCategory ?? 'custom',
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
    pgn: options.pgn,
  };
}

export function buildRecentGameEntry(summary: GameAnalyticsSummary): RecentGameEntry {
  return {
    sessionId: summary.sessionId,
    finishedAt: summary.finishedAt,
    result: summary.result,
    personaLabel: summary.personaLabel,
    personaId: summary.personaId,
    setupName: summary.setupName,
    durationMs: Math.max(0, new Date(summary.finishedAt).getTime() - new Date(summary.createdAt).getTime()),
    moveCount: summary.moveCount,
    brilliantMoves: summary.brilliantMoves,
  };
}

export function serializeGameAnalyticsSummary(summary: GameAnalyticsSummary): string {
  return JSON.stringify(summary, null, 2);
}
