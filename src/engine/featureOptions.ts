import { MoveQualityPresetId } from './types';

export interface FeatureOptions {
  securityDevToolsOnly: boolean;
  persistEngineConfig: boolean;
  useDeterministicRng: boolean;
  useMoveAnalysisCache: boolean;
  useImprovedMoveClassification: boolean;
  usePositionComplexity: boolean;
  usePersonaBehaviorBias: boolean;
  useHumanDelaySimulation: boolean;
  useBrilliantMoveBudget: boolean;
}

export type FeatureOptionKey = keyof FeatureOptions;

export interface FeatureOptionDescriptor {
  key: FeatureOptionKey;
  label: string;
  description: string;
}

export type PersonaId = MoveQualityPresetId | 'custom';
export type BrilliantMovesPerGame = 0 | 1 | 2 | 3 | 4;
export type BrilliantAllowedPhase = 'opening' | 'middlegame' | 'endgame' | 'any';

export interface BrilliantMoveBudgetConfig {
  brilliantMovesPerGame: BrilliantMovesPerGame;
  brilliantAllowedPhase: BrilliantAllowedPhase;
  brilliantUsedCount: number;
  brilliantMoveNumbers: number[];
  gameSessionId: string | null;
}

export const DEFAULT_FEATURE_OPTIONS: FeatureOptions = {
  securityDevToolsOnly: true,
  persistEngineConfig: true,
  useDeterministicRng: false,
  useMoveAnalysisCache: true,
  useImprovedMoveClassification: true,
  usePositionComplexity: false,
  usePersonaBehaviorBias: false,
  useHumanDelaySimulation: false,
  useBrilliantMoveBudget: false,
};

export const DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG: BrilliantMoveBudgetConfig = {
  brilliantMovesPerGame: 0,
  brilliantAllowedPhase: 'any',
  brilliantUsedCount: 0,
  brilliantMoveNumbers: [],
  gameSessionId: null,
};

export const FEATURE_OPTION_DESCRIPTORS: FeatureOptionDescriptor[] = [
  {
    key: 'securityDevToolsOnly',
    label: 'DevTools Only In Development',
    description: 'Open Chromium DevTools only in development mode.',
  },
  {
    key: 'persistEngineConfig',
    label: 'Persist Engine Configuration',
    description: 'Save depth, MultiPV, presets, bucket weights, and advanced feature options.',
  },
  {
    key: 'useDeterministicRng',
    label: 'Deterministic RNG',
    description: 'Use a seeded random source so move selection is reproducible.',
  },
  {
    key: 'useMoveAnalysisCache',
    label: 'Analysis Cache',
    description: 'Reuse Stockfish analysis for the same FEN, depth, and MultiPV settings.',
  },
  {
    key: 'useImprovedMoveClassification',
    label: 'Improved Move Classification',
    description: 'Keep unknown moves separate and use smarter bucket fallback selection.',
  },
  {
    key: 'usePositionComplexity',
    label: 'Position Complexity',
    description: 'Adjust move quality weights based on how sharp the current position is.',
  },
  {
    key: 'usePersonaBehaviorBias',
    label: 'Persona Behavior Bias',
    description: 'Layer simple aggressive or safe move preferences on top of bucket selection.',
  },
  {
    key: 'useHumanDelaySimulation',
    label: 'Human Delay Simulation',
    description: 'Delay auto-play moves based on complexity, persona, and chosen move quality.',
  },
  {
    key: 'useBrilliantMoveBudget',
    label: 'Brilliant Move Budget',
    description: 'Reserve a fixed number of tactical brilliant moves for each game.',
  },
];

export const FEATURE_OPTIONS_STORAGE_KEY = 'personachess_feature_options';
export const ENGINE_CONFIG_STORAGE_KEY = 'personachess_engine_config';

export function mergeFeatureOptions(
  partial?: Partial<FeatureOptions> | null,
): FeatureOptions {
  return {
    ...DEFAULT_FEATURE_OPTIONS,
    ...(partial ?? {}),
  };
}

export function mergeBrilliantMoveBudgetConfig(
  partial?: Partial<BrilliantMoveBudgetConfig> | null,
): BrilliantMoveBudgetConfig {
  return {
    ...DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG,
    ...(partial ?? {}),
    brilliantMoveNumbers: partial?.brilliantMoveNumbers ?? DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG.brilliantMoveNumbers,
    gameSessionId: partial?.gameSessionId ?? DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG.gameSessionId,
  };
}
