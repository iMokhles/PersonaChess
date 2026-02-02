/**
 * Move Classifier
 * Model layer - Pure TypeScript, no React, no MobX
 * 
 * Classifies chess moves into quality buckets based on evaluation loss
 */

import { 
  AnalyzedMove, 
  ClassifiedMove, 
  MoveBucket, 
  BUCKET_EVAL_RANGES 
} from './types';

/**
 * Classify a single move into a quality bucket based on eval loss
 */
export function classifyMove(move: AnalyzedMove): ClassifiedMove {
  const bucket = getBucketForEvalLoss(move.evalLoss);
  return {
    ...move,
    bucket,
  };
}

/**
 * Classify all analyzed moves
 */
export function classifyMoves(moves: AnalyzedMove[]): ClassifiedMove[] {
  return moves.map(classifyMove);
}

/**
 * Get the bucket for a given eval loss
 */
export function getBucketForEvalLoss(evalLoss: number): MoveBucket {
  const absLoss = Math.abs(evalLoss);
  
  for (const [bucket, [min, max]] of Object.entries(BUCKET_EVAL_RANGES)) {
    if (absLoss >= min && absLoss < max) {
      return bucket as MoveBucket;
    }
  }
  
  return 'blunder';
}

/**
 * Group classified moves by their bucket
 */
export function groupMovesByBucket(moves: ClassifiedMove[]): Map<MoveBucket, ClassifiedMove[]> {
  const groups = new Map<MoveBucket, ClassifiedMove[]>();
  
  // Initialize all buckets with empty arrays
  const buckets: MoveBucket[] = ['best', 'great', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'];
  buckets.forEach(bucket => groups.set(bucket, []));
  
  // Group moves
  moves.forEach(move => {
    const bucketMoves = groups.get(move.bucket) || [];
    bucketMoves.push(move);
    groups.set(move.bucket, bucketMoves);
  });
  
  return groups;
}

/**
 * Get statistics about the move distribution
 */
export function getMoveStats(moves: ClassifiedMove[]): Record<MoveBucket, number> {
  const stats: Record<MoveBucket, number> = {
    best: 0,
    great: 0,
    excellent: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
  };
  
  moves.forEach(move => {
    stats[move.bucket]++;
  });
  
  return stats;
}

/**
 * Check if there are any moves in a given bucket
 */
export function hasMoveInBucket(moves: ClassifiedMove[], bucket: MoveBucket): boolean {
  return moves.some(move => move.bucket === bucket);
}

/**
 * Get all moves from a specific bucket
 */
export function getMovesFromBucket(moves: ClassifiedMove[], bucket: MoveBucket): ClassifiedMove[] {
  return moves.filter(move => move.bucket === bucket);
}
