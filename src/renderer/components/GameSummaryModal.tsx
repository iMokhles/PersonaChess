import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { observer } from 'mobx-react-lite';
import { GameAnalyticsSummary } from '../../engine/gameAnalytics';
import { BUCKET_LABELS } from '../../engine/types';
import { gameAnalyticsViewModel } from '../../viewmodels';
import { SettingsButton, SettingsButtonGroup } from './settings/SettingsControls';
import './GameSummaryModal.css';

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const QUALITY_ORDER: Array<keyof GameAnalyticsSummary['qualityCounts']> = [
  'best',
  'great',
  'excellent',
  'good',
  'inaccuracy',
  'mistake',
  'blunder',
  'fallback',
];

const QUALITY_COLORS: Record<string, string> = {
  best: '#26a641',
  great: '#2ea043',
  excellent: '#57ab5a',
  good: '#8b949e',
  inaccuracy: '#d29922',
  mistake: '#f85149',
  blunder: '#da3633',
  fallback: '#6e7681',
};

const BarChart: React.FC<{ summary: GameAnalyticsSummary }> = ({ summary }) => {
  const total = QUALITY_ORDER.reduce((count, bucket) => count + summary.qualityCounts[bucket], 0) || 1;

  return (
    <div className="summary-chart-bars">
      {QUALITY_ORDER.map((bucket) => (
        <div key={bucket} className="summary-chart-bar-row">
          <span>{bucket === 'fallback' ? 'Fallback' : BUCKET_LABELS[bucket]}</span>
          <div className="summary-chart-bar-track">
            <div
              className="summary-chart-bar-fill"
              style={{
                width: `${(summary.qualityCounts[bucket] / total) * 100}%`,
                background: QUALITY_COLORS[bucket],
              }}
            />
          </div>
          <strong>{summary.qualityCounts[bucket]}</strong>
        </div>
      ))}
    </div>
  );
};

const LineChart: React.FC<{
  data: Array<{ ply: number; value: number }>;
  color: string;
  emptyLabel: string;
}> = ({ data, color, emptyLabel }) => {
  if (data.length === 0) {
    return <div className="summary-chart-empty">{emptyLabel}</div>;
  }

  const width = 320;
  const height = 96;
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = data.map((point, index) => {
    const x = (index / Math.max(1, data.length - 1)) * (width - 12) + 6;
    const y = height - (((point.value - min) / span) * (height - 16) + 8);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="summary-line-chart" aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const SummaryDetails: React.FC<{ summary: GameAnalyticsSummary }> = ({ summary }) => (
  <>
    <div className="summary-header">
      <div>
        <h2>{summary.setupName}</h2>
        <p>{summary.personaLabel} persona • {summary.result} • {new Date(summary.finishedAt).toLocaleString()}</p>
      </div>
      <div className="summary-header-badges">
        <span className="summary-chip">{summary.setupCategory}</span>
        <span className="summary-chip">{summary.moveCount} ply</span>
      </div>
    </div>

    <div className="summary-metrics-grid">
      <div className="summary-metric-card"><span>Brilliant</span><strong>{summary.brilliantMoves}</strong></div>
      <div className="summary-metric-card"><span>Avg eval loss</span><strong>{summary.averageEvalLoss}</strong></div>
      <div className="summary-metric-card"><span>Avg move delay</span><strong>{formatDuration(summary.averageMoveDelayMs)}</strong></div>
      <div className="summary-metric-card"><span>Autoplay time</span><strong>{formatDuration(summary.autoplayDurationMs)}</strong></div>
      <div className="summary-metric-card warning"><span>Inaccuracies</span><strong>{summary.inaccuracies}</strong></div>
      <div className="summary-metric-card warning"><span>Mistakes / Blunders</span><strong>{summary.mistakes + summary.blunders}</strong></div>
    </div>

    <div className="summary-chart-section">
      <div>
        <h3>Move Quality Distribution</h3>
        <BarChart summary={summary} />
      </div>
      <div>
        <h3>Complexity Over Time</h3>
        <LineChart
          data={summary.complexityTrend.map((point) => ({ ply: point.ply, value: point.score }))}
          color="var(--pc-accent)"
          emptyLabel="No complexity samples yet."
        />
      </div>
      <div>
        <h3>Eval Trend</h3>
        <LineChart
          data={summary.evalTrend.map((point) => ({ ply: point.ply, value: point.evaluation }))}
          color="#d8a93d"
          emptyLabel="No eval samples yet."
        />
      </div>
    </div>

    <div className="summary-detail-columns">
      <div className="summary-detail-card">
        <h3>Brilliant Moves</h3>
        {summary.highlightedBrilliantMoves.length === 0 ? (
          <p className="summary-empty-note">No brilliant moves were used in this game.</p>
        ) : (
          <ul className="summary-event-list">
            {summary.highlightedBrilliantMoves.map((entry) => (
              <li key={`${entry.ply}-${entry.san}`}>
                <span>{entry.ply}.</span>
                <strong>{entry.san}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="summary-detail-card">
        <h3>Major Mistakes</h3>
        {summary.majorMistakes.length === 0 ? (
          <p className="summary-empty-note">No major mistakes recorded.</p>
        ) : (
          <ul className="summary-event-list">
            {summary.majorMistakes.map((entry) => (
              <li key={`${entry.ply}-${entry.san}`}>
                <span>{entry.ply}.</span>
                <strong>{entry.san}</strong>
                <small>{entry.bucket ?? 'unknown'}{typeof entry.evalLoss === 'number' ? ` • ${entry.evalLoss} cp` : ''}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </>
);

export const GameSummaryModal: React.FC = observer(() => {
  const currentSummary = gameAnalyticsViewModel.currentSummary;
  const activeSummary = gameAnalyticsViewModel.selectedRecentGame ?? currentSummary;

  return (
    <Dialog.Root open={gameAnalyticsViewModel.summaryOpen} onOpenChange={(open) => gameAnalyticsViewModel.setSummaryOpen(open)}>
      <Dialog.Portal>
        <Dialog.Overlay className="pc-overlay" />
        <Dialog.Content className="pc-dialog game-summary-modal">
          <div className="game-summary-modal-header">
            <div>
              <Dialog.Title className="pc-dialog-title">Game Summary</Dialog.Title>
              <Dialog.Description className="pc-dialog-description">
                Review quality breakdowns, timing, complexity, and recent completed sessions.
              </Dialog.Description>
            </div>
            <SettingsButtonGroup>
              <SettingsButton disabled={!gameAnalyticsViewModel.currentSummary} onClick={() => gameAnalyticsViewModel.exportCurrentSummary()}>
                Export JSON
              </SettingsButton>
              <SettingsButton disabled={!gameAnalyticsViewModel.currentSummary} onClick={() => gameAnalyticsViewModel.exportCurrentPgn()}>
                Export PGN
              </SettingsButton>
            </SettingsButtonGroup>
          </div>

          <div className="game-summary-modal-body">
            <div className="game-summary-main">
              {activeSummary ? (
                <>
                  {currentSummary && gameAnalyticsViewModel.selectedRecentGameSessionId && (
                    <div className="summary-return-row">
                      <button type="button" className="summary-link-button" onClick={() => gameAnalyticsViewModel.setSelectedRecentGameSessionId(null)}>
                        Return to current game
                      </button>
                    </div>
                  )}
                  <SummaryDetails summary={activeSummary} />
                </>
              ) : (
                <div className="summary-empty-state">
                  <strong>No game summary yet</strong>
                  <span>Play a game or finish a session to unlock analytics and recent-game history.</span>
                </div>
              )}
            </div>

            <aside className="game-summary-sidebar">
              <div className="summary-sidebar-header">
                <h3>Recent Games</h3>
                <button type="button" className="summary-link-button" onClick={() => gameAnalyticsViewModel.clearRecentGames()}>
                  Clear
                </button>
              </div>
              {gameAnalyticsViewModel.recentGameEntries.length === 0 ? (
                <div className="summary-empty-note">Completed games will appear here.</div>
              ) : (
                <div className="summary-recent-list">
                  {gameAnalyticsViewModel.recentGameEntries.map((entry) => (
                    <button
                      key={entry.sessionId}
                      type="button"
                      className={`summary-recent-item ${gameAnalyticsViewModel.selectedRecentGameSessionId === entry.sessionId ? 'active' : ''}`}
                      onClick={() => gameAnalyticsViewModel.setSelectedRecentGameSessionId(entry.sessionId)}
                    >
                      <strong>{entry.setupName}</strong>
                      <span>{entry.personaLabel} • {entry.result}</span>
                      <small>{new Date(entry.finishedAt).toLocaleString()} • {formatDuration(entry.durationMs)}</small>
                    </button>
                  ))}
                </div>
              )}
            </aside>
          </div>

          <div className="game-summary-modal-footer">
            <SettingsButtonGroup>
              <Dialog.Close asChild>
                <button type="button" className="settings-pill-button">Close</button>
              </Dialog.Close>
            </SettingsButtonGroup>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

GameSummaryModal.displayName = 'GameSummaryModal';
