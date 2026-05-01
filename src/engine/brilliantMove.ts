import { Chess, PieceSymbol } from 'chess.js';
import { ClassifiedMove, MoveBucket } from './types';
import { RandomSource } from './random';

export interface BrilliantMoveCandidate {
  move: ClassifiedMove;
  tacticalScore: number;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const BRILLIANT_BUCKETS: MoveBucket[] = ['best', 'great'];

function getPieceValue(type?: PieceSymbol): number {
  return type ? PIECE_VALUES[type] : 0;
}

function getTacticalScore(fen: string, move: ClassifiedMove, bestEvaluation: number): number {
  const chess = new Chess(fen);
  const from = move.move.slice(0, 2);
  const to = move.move.slice(2, 4);
  const movingPiece = chess.get(from);
  const targetPiece = chess.get(to);
  const playedMove = chess.move({
    from,
    to,
    promotion: move.move[4] as 'q' | 'r' | 'b' | 'n' | undefined,
  });

  if (!playedMove) {
    return 0;
  }

  const isCapture = playedMove.flags.includes('c') || playedMove.flags.includes('e');
  const isPromotion = Boolean(playedMove.promotion);
  const isCheck = chess.isCheck();
  const evalGain = Math.max(0, bestEvaluation - move.evaluation);
  const materialSwing = getPieceValue(targetPiece?.type) - getPieceValue(movingPiece?.type);
  const isSacrifice = isCapture && materialSwing < 0;

  let tacticalScore = 0;
  tacticalScore += isCheck ? 2 : 0;
  tacticalScore += isCapture ? 1.5 : 0;
  tacticalScore += isPromotion ? 2.5 : 0;
  tacticalScore += isSacrifice ? 1.75 : 0;
  tacticalScore += evalGain >= 80 ? 1.5 : evalGain >= 40 ? 0.75 : 0;

  return tacticalScore;
}

export function getBrilliantMoveCandidates(
  fen: string,
  moves: ClassifiedMove[],
): BrilliantMoveCandidate[] {
  if (moves.length === 0) {
    return [];
  }

  const bestEvaluation = moves[0].evaluation;

  return moves
    .filter(move => BRILLIANT_BUCKETS.includes(move.bucket))
    .map(move => ({
      move,
      tacticalScore: getTacticalScore(fen, move, bestEvaluation),
    }))
    .filter(candidate => candidate.tacticalScore > 0)
    .sort((left, right) => right.tacticalScore - left.tacticalScore);
}

export function pickBrilliantMove(
  candidates: BrilliantMoveCandidate[],
  randomSource: RandomSource,
): ClassifiedMove | null {
  if (candidates.length === 0) {
    return null;
  }

  const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.tacticalScore, 0);
  let selection = randomSource.next() * totalWeight;

  for (const candidate of candidates) {
    selection -= candidate.tacticalScore;
    if (selection <= 0) {
      return candidate.move;
    }
  }

  return candidates[candidates.length - 1].move;
}
