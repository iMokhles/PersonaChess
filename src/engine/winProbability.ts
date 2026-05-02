/**
 * Convert engine evaluation (centipawns from side-to-move perspective) into
 * approximate White vs Black win shares for UI (0–100 each, sum 100).
 * Uses a logistic curve; not true WDL — good for live bar feedback.
 */

export function evalFromSideToMoveToWhitePositive(
  evalCpSideToMove: number,
  sideToMove: "w" | "b",
): number {
  return sideToMove === "w" ? evalCpSideToMove : -evalCpSideToMove;
}

export function whitePositiveEvalToWinChances(whitePositiveCp: number): {
  white: number;
  black: number;
} {
  const clamped = Math.max(-8000, Math.min(8000, whitePositiveCp));
  const pWhite = 1 / (1 + Math.pow(10, -clamped / 400));
  const white = Math.round(pWhite * 100);
  return { white: white, black: 100 - white };
}
