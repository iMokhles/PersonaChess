/**
 * Types for the chess engine model layer
 * Pure TypeScript - no React, no MobX
 */

export interface AnalyzedMove {
  move: string;        // UCI format (e.g., "e2e4")
  evaluation: number;  // Centipawn evaluation
  evalLoss: number;    // Loss compared to best move
  pv: string[];        // Principal variation
  multipv: number;     // MultiPV rank (1 = best)
  depth: number;       // Search depth
}

export type MoveBucket = 
  | 'best'
  | 'great'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

export interface ClassifiedMove extends AnalyzedMove {
  bucket: MoveBucket;
}

export interface BucketConfig {
  best: number;
  great: number;
  excellent: number;
  good: number;
  inaccuracy: number;
  mistake: number;
  blunder: number;
}

export interface StockfishInfo {
  multipv: number;
  depth: number;
  score: number;
  mate?: number;
  pv: string[];
}

export interface PickedMoveResult {
  move: ClassifiedMove;
  bucket: MoveBucket;
}

export const DEFAULT_BUCKET_CONFIG: BucketConfig = {
  best: 40,
  great: 25,
  excellent: 20,
  good: 10,
  inaccuracy: 4,
  mistake: 1,
  blunder: 0,
};

/** Preset id for move quality distribution */
export type MoveQualityPresetId = 'low' | 'medium' | 'hard' | 'super_hard' | 'aggressive';

export interface MoveQualityPreset {
  id: MoveQualityPresetId;
  label: string;
  description: string;
  config: BucketConfig;
}

/** Predefined move quality distributions (percentages sum to 100) */
export const MOVE_QUALITY_PRESETS: MoveQualityPreset[] = [
  {
    id: 'low',
    label: 'Low',
    description: 'Easier — more good/inaccuracy/mistake moves',
    config: {
      best: 15,
      great: 15,
      excellent: 20,
      good: 25,
      inaccuracy: 15,
      mistake: 7,
      blunder: 3,
    },
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'Balanced mix of qualities',
    config: {
      best: 40,
      great: 25,
      excellent: 20,
      good: 10,
      inaccuracy: 4,
      mistake: 1,
      blunder: 0,
    },
  },
  {
    id: 'hard',
    label: 'Hard',
    description: 'Favors best and great moves',
    config: {
      best: 55,
      great: 25,
      excellent: 15,
      good: 5,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
    },
  },
  {
    id: 'super_hard',
    label: 'Super Hard',
    description: 'Almost only best and great',
    config: {
      best: 70,
      great: 25,
      excellent: 5,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
    },
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    description: 'Risky — more inaccuracies and mistakes',
    config: {
      best: 20,
      great: 20,
      excellent: 15,
      good: 15,
      inaccuracy: 15,
      mistake: 10,
      blunder: 5,
    },
  },
];

export const BUCKET_EVAL_RANGES: Record<MoveBucket, [number, number]> = {
  best: [0, 10],
  great: [10, 30],
  excellent: [30, 70],
  good: [70, 150],
  inaccuracy: [150, 300],
  mistake: [300, 600],
  blunder: [600, Infinity],
};

export const BUCKET_LABELS: Record<MoveBucket, string> = {
  best: 'Best',
  great: 'Great',
  excellent: 'Excellent',
  good: 'Good',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
};

export const BUCKET_COLORS: Record<MoveBucket, string> = {
  best: '#26a641',
  great: '#2ea043',
  excellent: '#57ab5a',
  good: '#8b949e',
  inaccuracy: '#d29922',
  mistake: '#f85149',
  blunder: '#da3633',
};
