export interface MoveAnnotation {
  beforeFen: string;
  afterFen: string;
  uci: string;
  moveNumber: number;
  consumedBrilliant: boolean;
}

export interface BrilliantUsage {
  brilliantUsedCount: number;
  brilliantMoveNumbers: number[];
}

export function deriveBrilliantUsage(
  annotations: MoveAnnotation[],
): BrilliantUsage {
  const brilliantMoveNumbers = annotations
    .filter((annotation) => annotation.consumedBrilliant)
    .map((annotation) => annotation.moveNumber);

  return {
    brilliantUsedCount: brilliantMoveNumbers.length,
    brilliantMoveNumbers,
  };
}
