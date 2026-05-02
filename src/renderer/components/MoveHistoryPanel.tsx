import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { boardViewModel, engineViewModel } from '../../viewmodels';
import { DISPLAY_BUCKET_COLORS } from '../../engine/types';
import './MoveHistoryPanel.css';

const engineBusyForBoard = (): boolean =>
  boardViewModel.isThinking
  || boardViewModel.isAnalyzingMoves
  || engineViewModel.isMoveLaneBusy;

export const MoveHistoryPanel: React.FC = observer(() => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const latestMove = boardViewModel.history[boardViewModel.history.length - 1] ?? null;
  const latestFeedback = boardViewModel.recentMoveFeedback;
  const busy = engineBusyForBoard();
  const whiteWinPct = boardViewModel.winChanceWhitePercent;
  const blackWinPct = 100 - whiteWinPct;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [boardViewModel.history.length]);

  return (
    <aside className="move-history-panel">
      <div className="move-history-panel-header">
        <div>
          <h2>Move History</h2>
          <p>Current line, grouped by turn for quick review.</p>
        </div>
        <span className="move-history-count">{boardViewModel.history.length} ply</span>
      </div>

      <div className="move-history-toolbar">
        <button
          type="button"
          className="move-history-flip-button"
          onClick={() => boardViewModel.flipBoard()}
          disabled={busy}
          title={busy ? 'Wait for the engine to finish' : 'Flip board and swap engine side (same as Settings)'}
        >
          Flip board
        </button>
      </div>

      <div
        className={`move-history-win-meter ${boardViewModel.winChancesLoading ? 'move-history-win-meter--loading' : ''}`}
        aria-label="Approximate win share from engine evaluation"
      >
        <div className="move-history-win-meter-labels">
          <span>
            White <strong>{whiteWinPct}%</strong>
          </span>
          <span>
            Black <strong>{blackWinPct}%</strong>
          </span>
        </div>
        <div className="move-history-win-meter-bar" role="img">
          <div
            className="move-history-win-meter-white"
            style={{ width: `${whiteWinPct}%` }}
          />
          <div
            className="move-history-win-meter-black"
            style={{ width: `${blackWinPct}%` }}
          />
        </div>
        <p className="move-history-win-meter-note">Approximate win share from eval; updates after each move.</p>
      </div>

      {boardViewModel.moveHistoryRows.length === 0 ? (
        <div className="move-history-empty">
          <strong>{boardViewModel.isThinking ? 'Analyzing opening position' : 'No moves yet'}</strong>
          <span>
            {boardViewModel.isThinking
              ? 'PersonaChess is preparing the next move. History will appear as soon as play begins.'
              : boardViewModel.autoPlayEnabled
                ? 'Auto-play is ready. Make the first move or load a PGN to start the line.'
                : 'Start a game or load a PGN to build the history list.'}
          </span>
        </div>
      ) : (
        <div className="move-history-table">
          <div className="move-history-table-head">
            <span>#</span>
            <span>White</span>
            <span>Black</span>
          </div>
          <div ref={scrollContainerRef} className="move-history-table-body">
            {boardViewModel.moveHistoryRows.map((row) => {
              const isLatestWhite = latestMove?.san === row.white?.san && latestMove?.color === row.white?.color;
              const isLatestBlack = latestMove?.san === row.black?.san && latestMove?.color === row.black?.color;
              const isBrilliantWhite = isLatestWhite && latestFeedback?.san === row.white?.san && latestFeedback.isBrilliant;
              const isBrilliantBlack = isLatestBlack && latestFeedback?.san === row.black?.san && latestFeedback.isBrilliant;

              const whiteQualityColor =
                row.whiteQualityBucket && row.whiteQualityLabel !== 'Brilliant'
                  ? DISPLAY_BUCKET_COLORS[row.whiteQualityBucket]
                  : undefined;
              const blackQualityColor =
                row.blackQualityBucket && row.blackQualityLabel !== 'Brilliant'
                  ? DISPLAY_BUCKET_COLORS[row.blackQualityBucket]
                  : undefined;

              return (
                <div key={`${row.moveNumber}-${row.white?.san ?? '...'}-${row.black?.san ?? '...'}`} className="move-history-row">
                  <span className="move-history-number">{row.moveNumber}.</span>
                  <div className={`move-history-cell ${isLatestWhite ? 'current' : ''}`}>
                    <span className={`move-history-san ${isBrilliantWhite ? 'brilliant' : ''}`}>{row.white?.san ?? '—'}</span>
                    {row.whiteQualityLabel ? (
                      <span
                        className={`move-history-quality ${row.whiteQualityLabel === 'Brilliant' ? 'brilliant' : ''}`}
                        style={whiteQualityColor ? { color: whiteQualityColor } : undefined}
                      >
                        {row.whiteQualityLabel}
                      </span>
                    ) : null}
                  </div>
                  <div className={`move-history-cell ${isLatestBlack ? 'current' : ''}`}>
                    <span className={`move-history-san ${isBrilliantBlack ? 'brilliant' : ''}`}>{row.black?.san ?? '—'}</span>
                    {row.blackQualityLabel ? (
                      <span
                        className={`move-history-quality ${row.blackQualityLabel === 'Brilliant' ? 'brilliant' : ''}`}
                        style={blackQualityColor ? { color: blackQualityColor } : undefined}
                      >
                        {row.blackQualityLabel}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="move-history-footer">
        <span>{boardViewModel.gameStatus}</span>
        <code>{boardViewModel.turn === 'w' ? 'White' : 'Black'} to move</code>
      </div>
    </aside>
  );
});

MoveHistoryPanel.displayName = 'MoveHistoryPanel';
