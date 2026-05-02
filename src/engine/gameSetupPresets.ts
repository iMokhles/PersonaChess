import { getOpeningById, OpeningSide, PREDEFINED_OPENINGS } from './openings';

export type GameSetupCategory = 'openings' | 'tactical' | 'endgames' | 'custom-fen' | 'custom-pgn';
export type GameSetupDifficulty = 'easy' | 'medium' | 'hard';
export type GameSetupSourceType = 'fen' | 'pgn';

export interface GameSetupPreset {
  id: string;
  category: Exclude<GameSetupCategory, 'custom-fen' | 'custom-pgn'>;
  name: string;
  side: OpeningSide;
  difficulty: GameSetupDifficulty;
  description: string;
  tags: string[];
  sourceType: GameSetupSourceType;
  source: string;
}

export const GAME_SETUP_CATEGORY_OPTIONS: Array<{ value: GameSetupCategory; label: string }> = [
  { value: 'openings', label: 'Openings' },
  { value: 'tactical', label: 'Tactical positions' },
  { value: 'endgames', label: 'Endgames' },
  { value: 'custom-fen', label: 'Custom FEN' },
  { value: 'custom-pgn', label: 'Custom PGN' },
];

function openingDifficultyTag(name: string): GameSetupDifficulty {
  if (/napoleon/i.test(name)) {
    return 'easy';
  }

  if (/italian|london|queen/i.test(name)) {
    return 'medium';
  }

  return 'hard';
}

const OPENING_PRESETS: GameSetupPreset[] = PREDEFINED_OPENINGS.map((opening) => ({
  id: opening.id,
  category: 'openings',
  name: opening.name,
  side: opening.side,
  difficulty: openingDifficultyTag(opening.name),
  description: opening.description ?? `${opening.name} setup`,
  tags: ['opening', opening.side, opening.name.toLowerCase()],
  sourceType: 'pgn',
  source: opening.pgn,
}));

const TACTICAL_PRESETS: GameSetupPreset[] = [
  {
    id: 'tactic-back-rank-net',
    category: 'tactical',
    name: 'Back Rank Net',
    side: 'white',
    difficulty: 'medium',
    description: 'White to move with a direct attacking idea against an exposed back rank.',
    tags: ['tactical', 'mate-threat', 'attack', 'white-to-move'],
    sourceType: 'fen',
    source: '6k1/5ppp/3Q4/8/8/8/5PPP/6K1 w - - 0 1',
  },
  {
    id: 'tactic-knight-fork',
    category: 'tactical',
    name: 'Knight Fork Opportunity',
    side: 'white',
    difficulty: 'easy',
    description: 'A training position built around spotting a simple fork motif.',
    tags: ['tactical', 'fork', 'white-to-move'],
    sourceType: 'fen',
    source: 'r3k2r/pppq1ppp/2npbn2/3Np3/2B1P3/2N5/PPP2PPP/R1BQ1RK1 w kq - 0 1',
  },
  {
    id: 'tactic-deflection',
    category: 'tactical',
    name: 'Deflection Strike',
    side: 'black',
    difficulty: 'hard',
    description: 'Black to move in a sharp middlegame where calculation matters more than memorization.',
    tags: ['tactical', 'deflection', 'calculation', 'black-to-move'],
    sourceType: 'fen',
    source: 'r2q1rk1/pp1b1ppp/2n1pn2/2bp4/2P5/2NP1NP1/PP2PPBP/R1BQ1RK1 b - - 4 9',
  },
];

const ENDGAME_PRESETS: GameSetupPreset[] = [
  {
    id: 'endgame-lucena-bridge',
    category: 'endgames',
    name: 'Lucena Bridge Setup',
    side: 'white',
    difficulty: 'hard',
    description: 'Classic rook endgame conversion practice with White pressing for the win.',
    tags: ['endgame', 'rook', 'lucena', 'white-to-move'],
    sourceType: 'fen',
    source: '8/2k5/2P5/2KR4/8/8/8/8 w - - 0 1',
  },
  {
    id: 'endgame-opposition',
    category: 'endgames',
    name: 'King Opposition',
    side: 'white',
    difficulty: 'easy',
    description: 'A pure king-and-pawn ending focused on gaining opposition cleanly.',
    tags: ['endgame', 'king-and-pawn', 'opposition', 'white-to-move'],
    sourceType: 'fen',
    source: '8/8/8/3k4/3P4/4K3/8/8 w - - 0 1',
  },
  {
    id: 'endgame-queen-vs-pawn',
    category: 'endgames',
    name: 'Queen vs Passed Pawn',
    side: 'black',
    difficulty: 'medium',
    description: 'Black defends against promotion threats in a precise queen ending.',
    tags: ['endgame', 'queen', 'passed-pawn', 'black-to-move'],
    sourceType: 'fen',
    source: '6k1/5pp1/8/8/8/6Q1/5P2/6K1 b - - 0 1',
  },
];

export const GAME_SETUP_PRESETS: GameSetupPreset[] = [
  ...OPENING_PRESETS,
  ...TACTICAL_PRESETS,
  ...ENDGAME_PRESETS,
];

export function getGameSetupPresetById(id: string): GameSetupPreset | undefined {
  return GAME_SETUP_PRESETS.find((preset) => preset.id === id);
}

export function getOpeningPresetById(id: string): GameSetupPreset | undefined {
  return OPENING_PRESETS.find((preset) => preset.id === id);
}

export function filterGameSetupPresets(
  presets: GameSetupPreset[],
  category: GameSetupCategory,
  query: string,
): GameSetupPreset[] {
  if (category === 'custom-fen' || category === 'custom-pgn') {
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
      ...preset.tags,
    ].join(' ').toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function describeGameSetupPreset(preset: GameSetupPreset): string {
  const sideLabel = preset.side === 'white' ? 'White' : 'Black';
  return `${preset.name} • ${sideLabel} • ${preset.difficulty}`;
}

export function toCompatibleOpeningPreset(id: string): GameSetupPreset | undefined {
  const opening = getOpeningById(id);
  if (!opening) {
    return undefined;
  }

  return OPENING_PRESETS.find((preset) => preset.id === opening.id);
}
