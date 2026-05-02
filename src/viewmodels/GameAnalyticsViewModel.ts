import { action, makeAutoObservable, reaction } from 'mobx';
import {
  buildGameAnalyticsSummary,
  buildRecentGameEntry,
  GameAnalyticsSummary,
  RecentGameEntry,
  serializeGameAnalyticsSummary,
} from '../engine/gameAnalytics';
import { boardViewModel, BoardViewModel } from './BoardViewModel';
import { configViewModel, ConfigViewModel } from './ConfigViewModel';

const RECENT_GAMES_STORAGE_KEY = 'personachess_recent_games';
const MAX_RECENT_GAMES = 20;

interface PersistedAnalyticsSnapshot {
  recentGames: GameAnalyticsSummary[];
}

interface GameAnalyticsDependencies {
  boardViewModel: Pick<
    BoardViewModel,
    | 'debugSessionId'
    | 'moveAnnotations'
    | 'sessionStartedAt'
    | 'gameStatus'
    | 'pgn'
    | 'currentSetupName'
    | 'currentSetupCategory'
    | 'autoPlayActiveDurationMs'
    | 'isGameOver'
  >;
  configViewModel: Pick<ConfigViewModel, 'activePersonaId' | 'activePersonaLabel'>;
}

function downloadTextFile(fileName: string, contents: string, mimeType: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function safeParseRecentGames(saved: string | null): GameAnalyticsSummary[] {
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as PersistedAnalyticsSnapshot | GameAnalyticsSummary[];
    const recentGames = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.recentGames)
        ? parsed.recentGames
        : [];

    return recentGames.filter((entry): entry is GameAnalyticsSummary => (
      typeof entry?.sessionId === 'string'
      && typeof entry?.finishedAt === 'string'
      && typeof entry?.personaLabel === 'string'
      && typeof entry?.setupName === 'string'
    ));
  } catch {
    return [];
  }
}

export class GameAnalyticsViewModel {
  summaryOpen = false;
  recentGames: GameAnalyticsSummary[] = [];
  selectedRecentGameSessionId: string | null = null;
  lastCapturedSessionId: string | null = null;

  private readonly deps: GameAnalyticsDependencies;

  constructor(
    deps: GameAnalyticsDependencies = {
      boardViewModel,
      configViewModel,
    },
  ) {
    this.deps = deps;

    makeAutoObservable(this, {
      setSummaryOpen: action,
      setSelectedRecentGameSessionId: action,
      captureCompletedGame: action,
      clearRecentGames: action,
    });

    this.restoreFromStorage();

    reaction(
      () => ({
        sessionId: this.deps.boardViewModel.debugSessionId,
        isGameOver: this.deps.boardViewModel.isGameOver,
        moveCount: this.deps.boardViewModel.moveAnnotations.length,
      }),
      ({ sessionId, isGameOver, moveCount }) => {
        if (isGameOver && moveCount > 0 && this.lastCapturedSessionId !== sessionId) {
          this.captureCompletedGame();
          this.summaryOpen = true;
        }
      },
    );
  }

  setSummaryOpen(open: boolean): void {
    if (open) {
      this.selectedRecentGameSessionId = null;
    }
    this.summaryOpen = open;
  }

  setSelectedRecentGameSessionId(sessionId: string | null): void {
    this.selectedRecentGameSessionId = sessionId;
  }

  captureCompletedGame(): void {
    const summary = this.currentSummary;
    if (!summary) {
      return;
    }

    const updated = [summary, ...this.recentGames.filter((entry) => entry.sessionId !== summary.sessionId)]
      .slice(0, MAX_RECENT_GAMES);
    this.recentGames = updated;
    this.selectedRecentGameSessionId = summary.sessionId;
    this.lastCapturedSessionId = summary.sessionId;
    this.persistToStorage();
  }

  clearRecentGames(): void {
    this.recentGames = [];
    this.selectedRecentGameSessionId = null;
    this.persistToStorage();
  }

  exportCurrentSummary(): void {
    const summary = this.currentSummary;
    if (!summary) {
      return;
    }

    downloadTextFile(`personachess-summary-${summary.sessionId}.json`, serializeGameAnalyticsSummary(summary), 'application/json');
  }

  exportCurrentPgn(): void {
    const summary = this.currentSummary;
    if (!summary) {
      return;
    }

    downloadTextFile(`personachess-game-${summary.sessionId}.pgn`, summary.pgn, 'application/x-chess-pgn');
  }

  get currentSummary(): GameAnalyticsSummary | null {
    const annotations = this.deps.boardViewModel.moveAnnotations;
    if (annotations.length === 0) {
      return null;
    }

    return buildGameAnalyticsSummary({
      sessionId: this.deps.boardViewModel.debugSessionId,
      createdAtMs: this.deps.boardViewModel.sessionStartedAt,
      finishedAtMs: Date.now(),
      gameStatus: this.deps.boardViewModel.gameStatus,
      personaId: this.deps.configViewModel.activePersonaId,
      personaLabel: this.deps.configViewModel.activePersonaLabel,
      setupName: this.deps.boardViewModel.currentSetupName,
      setupCategory: this.deps.boardViewModel.currentSetupCategory,
      autoplayDurationMs: this.deps.boardViewModel.autoPlayActiveDurationMs,
      moveAnnotations: annotations,
      pgn: this.deps.boardViewModel.pgn,
    });
  }

  get selectedRecentGame(): GameAnalyticsSummary | null {
    return this.recentGames.find((entry) => entry.sessionId === this.selectedRecentGameSessionId) ?? null;
  }

  get recentGameEntries(): RecentGameEntry[] {
    return this.recentGames.map((summary) => buildRecentGameEntry(summary));
  }

  private restoreFromStorage(): void {
    try {
      this.recentGames = safeParseRecentGames(localStorage.getItem(RECENT_GAMES_STORAGE_KEY));
      this.selectedRecentGameSessionId = this.recentGames[0]?.sessionId ?? null;
    } catch {
      this.recentGames = [];
      this.selectedRecentGameSessionId = null;
    }
  }

  private persistToStorage(): void {
    try {
      const snapshot: PersistedAnalyticsSnapshot = {
        recentGames: this.recentGames,
      };
      localStorage.setItem(RECENT_GAMES_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore localStorage failures and keep analytics available for the current session.
    }
  }
}

export const gameAnalyticsViewModel = new GameAnalyticsViewModel();
