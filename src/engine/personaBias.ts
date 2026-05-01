import { Chess } from 'chess.js';
import { PersonaId } from './featureOptions';
import { ClassifiedMove, MoveBucket } from './types';
import { RandomSource } from './random';
import { PositionComplexityResult } from './positionComplexity';

export type PersonaBehaviorMode = 'aggressive' | 'safe' | 'balanced';

const SAFE_BUCKETS: MoveBucket[] = ['best', 'great', 'excellent'];

export function getPersonaBehaviorMode(persona: PersonaId): PersonaBehaviorMode {
  if (persona === 'aggressive') {
    return 'aggressive';
  }

  if (persona === 'hard' || persona === 'super_hard') {
    return 'safe';
  }

  return 'balanced';
}

export function applyPersonaBucketBias(
  config: Record<MoveBucket, number>,
  persona: PersonaId,
): Record<MoveBucket, number> {
  const mode = getPersonaBehaviorMode(persona);
  const adjusted = { ...config };

  if (mode === 'aggressive') {
    adjusted.good += 3;
    adjusted.inaccuracy += 2;
    adjusted.best = Math.max(0, adjusted.best - 3);
    adjusted.great = Math.max(0, adjusted.great - 2);
  } else if (mode === 'safe') {
    for (const bucket of SAFE_BUCKETS) {
      adjusted[bucket] += 2;
    }
    adjusted.mistake = Math.max(0, adjusted.mistake - 2);
    adjusted.blunder = Math.max(0, adjusted.blunder - 2);
  }

  return adjusted;
}

function getMoveTraitScore(fen: string, moveUci: string, persona: PersonaId): number {
  const mode = getPersonaBehaviorMode(persona);
  if (mode === 'balanced') {
    return 1;
  }

  const chess = new Chess(fen);
  const move = chess.move({
    from: moveUci.slice(0, 2),
    to: moveUci.slice(2, 4),
    promotion: moveUci[4] as 'q' | 'r' | 'b' | 'n' | undefined,
  });

  if (!move) {
    return 1;
  }

  const isCapture = move.flags.includes('c') || move.flags.includes('e');
  const isPromotion = Boolean(move.promotion);
  const isCastle = move.flags.includes('k') || move.flags.includes('q');
  const isCheck = chess.isCheck();

  if (mode === 'aggressive') {
    return 1
      + (isCapture ? 0.35 : 0)
      + (isCheck ? 0.35 : 0)
      + (isPromotion ? 0.45 : 0)
      + (isCastle ? 0.05 : 0);
  }

  return 1
    + (isCastle ? 0.2 : 0)
    + (!isCapture ? 0.1 : 0)
    - (isPromotion ? 0.05 : 0);
}

export function pickPersonaBiasedMove(
  fen: string,
  moves: ClassifiedMove[],
  persona: PersonaId,
  randomSource: RandomSource,
): ClassifiedMove {
  if (moves.length === 1) {
    return moves[0];
  }

  const weightedMoves = moves.map((move) => ({
    move,
    weight: Math.max(0.1, getMoveTraitScore(fen, move.move, persona)),
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

export function calculateHumanDelayMs(options: {
  complexity: PositionComplexityResult | null;
  persona: PersonaId;
  bucket: MoveBucket;
}): number {
  const { complexity, persona, bucket } = options;
  const mode = getPersonaBehaviorMode(persona);
  const base = 350;
  const complexityDelay = complexity ? Math.round(900 * complexity.score) : 0;
  const personaDelay = mode === 'safe' ? 220 : mode === 'aggressive' ? 80 : 140;
  const bucketDelay =
    bucket === 'best' || bucket === 'great'
      ? 120
      : bucket === 'mistake' || bucket === 'blunder'
        ? 40
        : 80;

  return base + complexityDelay + personaDelay + bucketDelay;
}
