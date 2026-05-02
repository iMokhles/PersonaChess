import React, { useEffect, useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import * as Tooltip from '@radix-ui/react-tooltip';
import { observer } from 'mobx-react-lite';
import { boardViewModel, configViewModel, engineViewModel, gameAnalyticsViewModel, gameSetupViewModel, uiStateViewModel } from '../../viewmodels';
import './DesktopToolbar.css';

interface ToolbarButtonProps {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ label, shortcut, onClick, disabled = false, variant = 'secondary' }) => (
  <Tooltip.Root delayDuration={250}>
    <Tooltip.Trigger asChild>
      <button
        type="button"
        className={`desktop-toolbar-button ${variant}`}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content side="bottom" className="pc-tooltip">
        {shortcut ? `${label} • ${shortcut}` : label}
        <Tooltip.Arrow className="pc-tooltip-arrow" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
);

export const DesktopToolbar: React.FC = observer(() => {
  const engineBusy = boardViewModel.isThinking
    || boardViewModel.isAnalyzingMoves
    || engineViewModel.isAnalyzing
    || engineViewModel.isInitializing;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!boardViewModel.isAutoPlayCountingDown) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [boardViewModel.autoPlayScheduledFor, boardViewModel.isAutoPlayCountingDown]);

  const countdownSeconds = Math.max(0, Math.ceil((boardViewModel.autoPlayScheduledFor - now) / 100) / 10);
  const personaBadge = configViewModel.activePersonaLabel;

  return (
    <Tooltip.Provider>
      <div className="desktop-toolbar-shell">
        <div className="desktop-toolbar-brand">
          <span className="desktop-toolbar-brand-mark">♟</span>
          <div className="desktop-toolbar-brand-copy">
            <span className="desktop-toolbar-brand-title">PersonaChess</span>
            <span className="desktop-toolbar-brand-subtitle">Desktop personality chess lab</span>
          </div>
          <div className="desktop-toolbar-persona-badge">
            <span>Persona</span>
            <strong>{personaBadge}</strong>
          </div>
        </div>

        <div className="desktop-toolbar-groups">
          <div className="desktop-toolbar-group">
            <ToolbarButton label="New Game" shortcut="Reset board" onClick={() => boardViewModel.reset()} disabled={engineBusy} />
            <ToolbarButton label="Game Setup" shortcut="Cmd/Ctrl+O" onClick={() => gameSetupViewModel.openAtCategory('openings')} disabled={engineBusy} />
            <ToolbarButton label="Summary" onClick={() => gameAnalyticsViewModel.setSummaryOpen(true)} disabled={!gameAnalyticsViewModel.currentSummary && gameAnalyticsViewModel.recentGames.length === 0} />
          </div>

          <div className="desktop-toolbar-group">
            <ToolbarButton label="Undo" shortcut="Cmd/Ctrl+Z" onClick={() => boardViewModel.undoSingle()} disabled={engineBusy || !boardViewModel.canUndo} />
            <ToolbarButton label="Redo" shortcut="Cmd/Ctrl+Shift+Z" onClick={() => boardViewModel.redoSingle()} disabled={engineBusy || !boardViewModel.canRedo} />
            <ToolbarButton
              label={engineViewModel.isInitializing ? 'Starting…' : boardViewModel.isThinking ? 'Solving…' : 'Solve Move'}
              shortcut="Cmd/Ctrl+Enter"
              variant="primary"
              onClick={() => {
                void boardViewModel.solveNextMove();
              }}
              disabled={engineBusy || boardViewModel.isGameOver || boardViewModel.autoPlayEnabled}
            />
          </div>

          <div className="desktop-toolbar-group desktop-toolbar-group-switch">
            <label className="desktop-toolbar-switch">
              <span className="desktop-toolbar-switch-label">Auto Play</span>
              <Switch.Root
                checked={boardViewModel.autoPlayEnabled}
                onCheckedChange={(checked) => boardViewModel.setAutoPlay(checked)}
                disabled={engineBusy}
                className="desktop-switch-root"
              >
                <Switch.Thumb className="desktop-switch-thumb" />
              </Switch.Root>
            </label>
            <div className="desktop-toolbar-autoplay-meta">
              <span>{boardViewModel.autoPlayCurrentSideLabel}</span>
              <strong>
                {boardViewModel.autoPlayEnabled
                  ? boardViewModel.autoPlayPaused
                    ? 'Paused'
                    : boardViewModel.isAutoPlayCountingDown
                      ? `${countdownSeconds.toFixed(1)}s`
                      : 'Ready'
                  : 'Off'}
              </strong>
            </div>
            <ToolbarButton
              label={boardViewModel.autoPlayPaused ? 'Resume' : 'Pause'}
              shortcut="Cmd/Ctrl+Shift+P"
              onClick={() => boardViewModel.toggleAutoPlayPause()}
              disabled={!boardViewModel.autoPlayEnabled || engineBusy}
            />
            <ToolbarButton label="Settings" shortcut="Cmd/Ctrl+," onClick={() => uiStateViewModel.setSettingsOpen(true)} disabled={false} />
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
});

DesktopToolbar.displayName = 'DesktopToolbar';
