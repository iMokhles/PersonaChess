/**
 * Move Picker
 * Model layer - Pure TypeScript, no React, no MobX
 * 
 * Picks a move based on weighted probability from quality buckets
 */

import { 
  ClassifiedMove, 
  MoveBucket, 
  BucketConfig, 
  PickedMoveResult,
  DEFAULT_BUCKET_CONFIG 
} from './types';
import { findClosestAvailableBucket, groupMovesByBucket } from './moveClassifier';

export type RandomNumberGenerator = () => number;

interface BucketSelection {
  bucket: MoveBucket;
  moves: ClassifiedMove[];
}

function getBucketOrder(): MoveBucket[] {
  return ['best', 'great', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'];
}

function getAvailableBuckets(
  moves: ClassifiedMove[],
  config: BucketConfig,
): BucketSelection[] {
  const grouped = groupMovesByBucket(moves);
  const availableBuckets: BucketSelection[] = [];

  for (const bucket of getBucketOrder()) {
    const bucketMoves = grouped.get(bucket) || [];
    if (bucketMoves.length > 0 && config[bucket] > 0) {
      availableBuckets.push({ bucket, moves: bucketMoves });
    }
  }

  return availableBuckets;
}

function pickWeightedBucket(
  weightedBuckets: Array<{ bucket: MoveBucket; weight: number }>,
  random: RandomNumberGenerator,
): MoveBucket | null {
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

export function pickBucketLegacy(
  moves: ClassifiedMove[],
  config: BucketConfig = DEFAULT_BUCKET_CONFIG,
  random: RandomNumberGenerator = Math.random,
): BucketSelection | null {
  if (moves.length === 0) return null;

  const availableBuckets = getAvailableBuckets(moves, config);
  if (availableBuckets.length === 0) {
    return {
      bucket: moves[0].bucket,
      moves: [moves[0]],
    };
  }

  const weightedBuckets = availableBuckets.map((entry) => ({
    bucket: entry.bucket,
    weight: config[entry.bucket],
  }));
  const selectedBucket = pickWeightedBucket(weightedBuckets, random);

  if (!selectedBucket) {
    return availableBuckets[0];
  }

  return availableBuckets.find((entry) => entry.bucket === selectedBucket) ?? availableBuckets[0];
}

export function pickBucketWithClosestFallback(
  moves: ClassifiedMove[],
  config: BucketConfig = DEFAULT_BUCKET_CONFIG,
  random: RandomNumberGenerator = Math.random,
): BucketSelection | null {
  if (moves.length === 0) return null;

  const grouped = groupMovesByBucket(moves);
  const weightedBuckets = getBucketOrder()
    .filter((bucket) => config[bucket] > 0)
    .map((bucket) => ({ bucket, weight: config[bucket] }));
  const selectedBucket = pickWeightedBucket(weightedBuckets, random);

  if (!selectedBucket) {
    return pickBucketLegacy(moves, config, random);
  }

  const selectedMoves = grouped.get(selectedBucket) || [];
  if (selectedMoves.length > 0) {
    return {
      bucket: selectedBucket,
      moves: selectedMoves,
    };
  }

  const availableBuckets = getBucketOrder().filter((bucket) => (grouped.get(bucket) || []).length > 0);
  const fallbackBucket = findClosestAvailableBucket(selectedBucket, availableBuckets);
  if (!fallbackBucket) {
    return null;
  }

  return {
    bucket: fallbackBucket,
    moves: grouped.get(fallbackBucket) || [],
  };
}

export function pickRandomMoveFromBucket(
  bucketSelection: BucketSelection,
  random: RandomNumberGenerator = Math.random,
): ClassifiedMove {
  const randomMoveIndex = Math.floor(random() * bucketSelection.moves.length);
  return bucketSelection.moves[randomMoveIndex];
}

/**
 * Pick a move based on bucket configuration (weighted random)
 */
export function pickMove(
  moves: ClassifiedMove[], 
  config: BucketConfig = DEFAULT_BUCKET_CONFIG,
  random: RandomNumberGenerator = Math.random,
): PickedMoveResult | null {
  const selectedBucket = pickBucketLegacy(moves, config, random);
  if (!selectedBucket) return null;
  const selectedMove = pickRandomMoveFromBucket(selectedBucket, random);

  return {
    move: selectedMove,
    bucket: selectedBucket.bucket,
  };
}

/**
 * Normalize bucket config so percentages sum to 100
 */
export function normalizeBucketConfig(config: BucketConfig): BucketConfig {
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
    blunder: Math.round(config.blunder * factor),
  };
}

/**
 * Validate bucket config
 */
export function validateBucketConfig(config: BucketConfig): { valid: boolean; total: number } {
  const total = Object.values(config).reduce((sum, val) => sum + val, 0);
  return {
    valid: total === 100,
    total,
  };
}

/**
 * Get probability of picking from each bucket given current config and available moves
 */
export function getEffectiveProbabilities(
  moves: ClassifiedMove[],
  config: BucketConfig
): Record<MoveBucket, number> {
  const grouped = groupMovesByBucket(moves);
  
  const probabilities: Record<MoveBucket, number> = {
    best: 0,
    great: 0,
    excellent: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };
  
  // Calculate effective weights (only buckets with moves)
  let totalEffectiveWeight = 0;
  const buckets: MoveBucket[] = ['best', 'great', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'];
  
  for (const bucket of buckets) {
    const bucketMoves = grouped.get(bucket) || [];
    if (bucketMoves.length > 0) {
      totalEffectiveWeight += config[bucket];
    }
  }
  
  if (totalEffectiveWeight === 0) {
    return probabilities;
  }
  
  // Calculate normalized probabilities
  for (const bucket of buckets) {
    const bucketMoves = grouped.get(bucket) || [];
    if (bucketMoves.length > 0) {
      probabilities[bucket] = (config[bucket] / totalEffectiveWeight) * 100;
    }
  }
  
  return probabilities;
}
