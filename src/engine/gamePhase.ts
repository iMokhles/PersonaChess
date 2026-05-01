import { Chess, PieceSymbol } from 'chess.js';

export type GamePhase = 'opening' | 'middlegame' | 'endgame';

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export interface GamePhaseResult {
  phase: GamePhase;
  totalMaterial: number;
  queensTraded: boolean;
}

export function getTotalMaterial(fen: string): number {
  const chess = new Chess(fen);
  return chess
    .board()
    .flat()
    .reduce((total, piece) => total + (piece ? PIECE_VALUES[piece.type] : 0), 0);
}

export function areQueensTraded(fen: string): boolean {
  const chess = new Chess(fen);
  const queens = chess
    .board()
    .flat()
    .filter(piece => piece?.type === 'q').length;

  return queens < 2;
}

export function detectGamePhase(fen: string, moveNumber: number): GamePhaseResult {
  const totalMaterial = getTotalMaterial(fen);
  const queensTraded = areQueensTraded(fen);

  if (moveNumber <= 10) {
    return {
      phase: 'opening',
      totalMaterial,
      queensTraded,
    };
  }

  if (queensTraded || totalMaterial <= 24) {
    return {
      phase: 'endgame',
      totalMaterial,
      queensTraded,
    };
  }

  return {
    phase: 'middlegame',
    totalMaterial,
    queensTraded,
  };
}
