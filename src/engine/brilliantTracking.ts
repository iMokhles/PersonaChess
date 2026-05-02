export interface MoveAnnotation {
  beforeFen: string;
  afterFen: string;
  uci: string;
  moveNumber: number;
  consumedBrilliant: boolean;
  actor?: 'player' | 'engine' | 'redo';
  san?: string;
  bucket?: string | null;
  evalLoss?: number | null;
  evaluation?: number | null;
  complexityLevel?: 'low' | 'medium' | 'high' | null;
  complexityScore?: number | null;
  timestamp?: number;
  delayMsSincePrevious?: number;
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
