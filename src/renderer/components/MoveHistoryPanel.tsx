import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { boardViewModel } from '../../viewmodels';
import './MoveHistoryPanel.css';

export const MoveHistoryPanel: React.FC = observer(() => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const latestMove = boardViewModel.history[boardViewModel.history.length - 1] ?? null;

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

              return (
                <div key={`${row.moveNumber}-${row.white?.san ?? '...'}-${row.black?.san ?? '...'}`} className="move-history-row">
                  <span className="move-history-number">{row.moveNumber}.</span>
                  <span className={`move-history-move ${isLatestWhite ? 'current' : ''}`}>{row.white?.san ?? '—'}</span>
                  <span className={`move-history-move ${isLatestBlack ? 'current' : ''}`}>{row.black?.san ?? '—'}</span>
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
