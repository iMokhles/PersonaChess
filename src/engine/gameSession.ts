import { MoveAnnotation } from './brilliantTracking';

export interface PersistedBoardState {
  currentFen: string;
  fenHistory: string[];
  gameSessionId: string;
  gameStartFen: string;
  currentSetupName?: string;
  currentSetupCategory?: string;
  historyAnnotations: MoveAnnotation[];
  redoAnnotations: MoveAnnotation[];
}

export function createGameSessionId(): string {
  return `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function resolvePgnStartFen(
  headers: Record<string, string | null>,
  fallbackFen: string,
): string {
  return headers.SetUp === '1' && typeof headers.FEN === 'string'
    ? headers.FEN
    : fallbackFen;
}
