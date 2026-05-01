import { BucketConfig, MoveBucket, AnalyzedMove } from './types';

export interface PositionComplexityResult {
  level: 'low' | 'medium' | 'high';
  score: number;
  spread: number;
  closeCandidates: number;
  volatility: number;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function calculatePositionComplexity(
  moves: AnalyzedMove[],
): PositionComplexityResult {
  if (moves.length <= 1) {
    return {
      level: 'low',
      score: 0,
      spread: 0,
      closeCandidates: moves.length,
      volatility: 0,
    };
  }

  const evaluations = moves.map((move) => move.evaluation).sort((a, b) => b - a);
  const best = evaluations[0];
  const spread = Math.abs(best - evaluations[evaluations.length - 1]);
  const closeCandidates = moves.filter((move) => Math.abs(best - move.evaluation) <= 35).length;
  const volatility = moves.length > 1
    ? Math.abs(best - evaluations[Math.min(2, evaluations.length - 1)])
    : 0;

  const spreadFactor = 1 - clamp(spread / 250);
  const closeFactor = clamp((closeCandidates - 1) / 5);
  const volatilityFactor = clamp(volatility / 150);
  const score = clamp(spreadFactor * 0.45 + closeFactor * 0.35 + volatilityFactor * 0.2);

  let level: PositionComplexityResult['level'] = 'medium';
  if (score < 0.33) level = 'low';
  if (score > 0.66) level = 'high';

  return {
    level,
    score,
    spread,
    closeCandidates,
    volatility,
  };
}

const BUCKET_ORDER: MoveBucket[] = [
  'best',
  'great',
  'excellent',
  'good',
  'inaccuracy',
  'mistake',
  'blunder',
];

export function adjustBucketConfigForComplexity(
  config: BucketConfig,
  complexity: PositionComplexityResult,
): BucketConfig {
  const adjusted = { ...config };
  const intensity = complexity.score;

  if (complexity.level === 'high') {
    adjusted.best = Math.max(0, adjusted.best - Math.round(6 * intensity));
    adjusted.great = Math.max(0, adjusted.great - Math.round(3 * intensity));
    adjusted.inaccuracy += Math.round(4 * intensity);
    adjusted.mistake += Math.round(3 * intensity);
    adjusted.blunder += Math.round(2 * intensity);
  } else if (complexity.level === 'low') {
    adjusted.best += Math.round(5 * (1 - intensity));
    adjusted.great += Math.round(3 * (1 - intensity));
    adjusted.excellent += Math.round(2 * (1 - intensity));
    adjusted.mistake = Math.max(0, adjusted.mistake - 2);
    adjusted.blunder = Math.max(0, adjusted.blunder - 1);
  }

  const total = BUCKET_ORDER.reduce((sum, bucket) => sum + adjusted[bucket], 0);
  if (total <= 0) {
    return config;
  }

  const normalized = BUCKET_ORDER.reduce((result, bucket) => {
    result[bucket] = Math.round((adjusted[bucket] / total) * 100);
    return result;
  }, {} as BucketConfig);

  const normalizedTotal = BUCKET_ORDER.reduce((sum, bucket) => sum + normalized[bucket], 0);
  const diff = 100 - normalizedTotal;
  normalized.best += diff;

  return normalized;
}
