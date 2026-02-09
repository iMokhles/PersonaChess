/**
 * Predefined chess openings (PGN move sequences)
 * Used to load a position after the given moves from the initial position.
 */

export type OpeningSide = 'white' | 'black';

export interface Opening {
  id: string;
  name: string;
  /** Which side plays this opening (the opening is named from this side's perspective) */
  side: OpeningSide;
  /** Short description or ECO-style tag */
  description?: string;
  /** PGN move sequence from the starting position (e.g. "1. e4 e5 2. Qh5") */
  pgn: string;
}

/** Build minimal PGN for chess.js (headers + blank line + moves + result) */
function pgn(moves: string): string {
  const moveText = moves.trim().endsWith('*') ? moves.trim() : `${moves.trim()} *`;
  return `[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n${moveText}`;
}

export const PREDEFINED_OPENINGS: Opening[] = [
  {
    id: 'napoleon',
    name: "King's Pawn: Napoleon Attack",
    side: 'white',
    description: '1. e4 e5 2. Qh5',
    pgn: pgn('1. e4 e5 2. Qh5'),
  },
  {
    id: 'italian',
    name: "Italian Game",
    side: 'white',
    description: '1. e4 e5 2. Nf3 Nc6 3. Bc4',
    pgn: pgn('1. e4 e5 2. Nf3 Nc6 3. Bc4'),
  },
  {
    id: 'ruy_lopez',
    name: 'Ruy Lopez',
    side: 'white',
    description: '1. e4 e5 2. Nf3 Nc6 3. Bb5',
    pgn: pgn('1. e4 e5 2. Nf3 Nc6 3. Bb5'),
  },
  {
    id: 'sicilian',
    name: 'Sicilian Defense',
    side: 'black',
    description: '1. e4 c5',
    pgn: pgn('1. e4 c5'),
  },
  {
    id: 'french',
    name: 'French Defense',
    side: 'black',
    description: '1. e4 e6',
    pgn: pgn('1. e4 e6'),
  },
  {
    id: 'caro_kann',
    name: 'Caro-Kann',
    side: 'black',
    description: '1. e4 c6',
    pgn: pgn('1. e4 c6'),
  },
  {
    id: 'queens_gambit',
    name: "Queen's Gambit",
    side: 'white',
    description: '1. d4 d5 2. c4',
    pgn: pgn('1. d4 d5 2. c4'),
  },
  {
    id: 'london',
    name: 'London System',
    side: 'white',
    description: '1. d4 d5 2. Bf4',
    pgn: pgn('1. d4 d5 2. Bf4'),
  },
  {
    id: 'kings_indian',
    name: "King's Indian Defense",
    side: 'black',
    description: '1. d4 Nf6 2. c4 g6',
    pgn: pgn('1. d4 Nf6 2. c4 g6'),
  },
  {
    id: 'pirc',
    name: 'Pirc Defense',
    side: 'black',
    description: '1. e4 d6 2. d4 Nf6',
    pgn: pgn('1. e4 d6 2. d4 Nf6'),
  },
];

export function getOpeningById(id: string): Opening | undefined {
  return PREDEFINED_OPENINGS.find(o => o.id === id);
}
