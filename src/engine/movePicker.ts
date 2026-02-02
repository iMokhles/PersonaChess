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
import { groupMovesByBucket } from './moveClassifier';

/**
 * Pick a move based on bucket configuration (weighted random)
 */
export function pickMove(
  moves: ClassifiedMove[], 
  config: BucketConfig = DEFAULT_BUCKET_CONFIG
): PickedMoveResult | null {
  if (moves.length === 0) return null;

  const grouped = groupMovesByBucket(moves);
  
  // Build weighted bucket selection based on available moves
  const availableBuckets: { bucket: MoveBucket; weight: number; moves: ClassifiedMove[] }[] = [];
  
  const bucketOrder: MoveBucket[] = ['best', 'great', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'];
  
  for (const bucket of bucketOrder) {
    const bucketMoves = grouped.get(bucket) || [];
    const weight = config[bucket];
    
    if (bucketMoves.length > 0 && weight > 0) {
      availableBuckets.push({ bucket, weight, moves: bucketMoves });
    }
  }

  if (availableBuckets.length === 0) {
    // Fallback: return the first (best) move
    return {
      move: moves[0],
      bucket: moves[0].bucket,
    };
  }

  // Calculate total weight
  const totalWeight = availableBuckets.reduce((sum, b) => sum + b.weight, 0);
  
  if (totalWeight === 0) {
    // All weights are zero, pick from best available
    return {
      move: availableBuckets[0].moves[0],
      bucket: availableBuckets[0].bucket,
    };
  }

  // Pick bucket using weighted random
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  let selectedBucket = availableBuckets[0];
  
  for (const entry of availableBuckets) {
    cumulative += entry.weight;
    if (random <= cumulative) {
      selectedBucket = entry;
      break;
    }
  }

  // Pick random move from selected bucket
  const bucketMoves = selectedBucket.moves;
  const randomMoveIndex = Math.floor(Math.random() * bucketMoves.length);
  const selectedMove = bucketMoves[randomMoveIndex];

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
