/**
 * App Component
 * Main application entry point for PersonaChess
 * View layer - React component
 */

import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  ChessBoardComponent,
  DesktopToolbar,
  GameSetupModal,
  GameSummaryModal,
  MoveFeedbackToast,
  MoveHistoryPanel,
  SettingsModal,
  StatusStrip,
} from './components';
import { boardViewModel, configViewModel, engineViewModel, gameSetupViewModel, uiStateViewModel } from '../viewmodels';
import { createDebugLogger } from '../shared/debug';
import { playSoundEffect, SoundEffectKind } from './sound/soundEffects';
import './App.css';

const logger = createDebugLogger('App');

function getResponsiveBoardSize(preferredSize: number, viewportWidth: number): number {
  if (viewportWidth <= 0) {
    return preferredSize;
  }

  const compactLayout = viewportWidth < 1180;
  const sidePadding = compactLayout ? 84 : 500;
  const maxAllowed = Math.max(360, viewportWidth - sidePadding);

  return Math.min(preferredSize, maxAllowed);
}

export const App: React.FC = observer(() => {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth,
  );

  // Initialize engine on mount
  useEffect(() => {
    const initEngine = async () => {
      try {
        await engineViewModel.initialize();
        logger.debug('Engine initialized successfully');
      } catch (err) {
        logger.error('Failed to initialize Stockfish:', err);
      }
    };
    
    initEngine();

    // Cleanup on unmount
    return () => {
      logger.debug('Component unmounting, destroying engine...');
      engineViewModel.destroy();
    };
  }, []);

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', updateViewportWidth);
    return () => {
      window.removeEventListener('resize', updateViewportWidth);
    };
  }, []);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      return target.isContentEditable
        || target.tagName === 'INPUT'
        || target.tagName === 'TEXTAREA'
        || target.tagName === 'SELECT';
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (key === 'escape') {
        if (uiStateViewModel.settingsOpen) {
          uiStateViewModel.setSettingsOpen(false);
        }
        if (gameSetupViewModel.open) {
          gameSetupViewModel.setOpen(false);
        }
        return;
      }

      if (!meta || isEditableTarget(event.target)) {
        return;
      }

      if (key === 'z' && event.shiftKey) {
        event.preventDefault();
        boardViewModel.redoSingle();
        return;
      }

      if (key === 'y') {
        event.preventDefault();
        boardViewModel.redoSingle();
        return;
      }

      if (key === 'z') {
        event.preventDefault();
        boardViewModel.undoSingle();
        return;
      }

      if (key === 'enter') {
        event.preventDefault();
        void boardViewModel.solveNextMove();
        return;
      }

      if (key === ',') {
        event.preventDefault();
        uiStateViewModel.setSettingsOpen(true);
        return;
      }

      if (key === 'o') {
        event.preventDefault();
        gameSetupViewModel.openAtCategory('openings');
        return;
      }

      if (key === 'p' && event.shiftKey) {
        event.preventDefault();
        boardViewModel.toggleAutoPlayPause();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    const feedback = boardViewModel.recentMoveFeedback;
    if (!feedback || feedback.silent) {
      return;
    }

    let sound: SoundEffectKind = 'move';
    if (feedback.isGameEnd) {
      sound = 'game-end';
    } else if (feedback.isBrilliant) {
      sound = 'brilliant';
    } else if (feedback.isCheck) {
      sound = 'check';
    } else if (feedback.isCapture) {
      sound = 'capture';
    }

    void playSoundEffect(sound, {
      enabled: uiStateViewModel.soundEnabled,
      muted: uiStateViewModel.soundMuted,
      volume: uiStateViewModel.effectiveSoundVolume,
    });
  }, [
    boardViewModel.recentMoveFeedback,
    uiStateViewModel.soundEnabled,
    uiStateViewModel.soundMuted,
    uiStateViewModel.effectiveSoundVolume,
  ]);

  const boardSize = useMemo(
    () => getResponsiveBoardSize(uiStateViewModel.boardSizePx, viewportWidth),
    [uiStateViewModel.boardSizePx, viewportWidth],
  );
  const personaAccent = uiStateViewModel.getPersonaAccentTone(configViewModel.activePersonaId);

  return (
    <div
      className="app-shell"
      data-theme={uiStateViewModel.themeMode}
      data-accent={personaAccent}
    >
      <header className="app-topbar">
        <DesktopToolbar />
      </header>

      <main className="app-workspace">
        <section className="app-board-column">
          <div className="app-board-card" style={{ ['--board-size' as string]: `${boardSize}px` }}>
            <ChessBoardComponent boardWidth={boardSize} />
            <MoveFeedbackToast />
          </div>
          <StatusStrip />
        </section>

        <aside className="app-side-column">
          <MoveHistoryPanel />
        </aside>
      </main>

      <SettingsModal />
      <GameSetupModal />
      <GameSummaryModal />
    </div>
  );
});

App.displayName = 'App';

export default App;
