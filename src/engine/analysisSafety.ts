export interface AnalysisSnapshot<TMoves> {
  requestId: number;
  analyzedFen: string;
  moves: TMoves;
}

export type AnalysisPurpose = 'engineMove' | 'background';

export function isStaleAnalysisRequest(
  requestId: number,
  latestRequestId: number,
): boolean {
  return requestId !== latestRequestId;
}

export function canApplyAnalyzedMove(
  currentFen: string,
  analyzedFen: string,
): boolean {
  return currentFen === analyzedFen;
}
