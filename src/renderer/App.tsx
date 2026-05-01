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
  MoveHistoryPanel,
  SettingsModal,
  StatusStrip,
} from './components';
import { configViewModel, engineViewModel, uiStateViewModel } from '../viewmodels';
import { createDebugLogger } from '../shared/debug';
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
          </div>
          <StatusStrip />
        </section>

        <aside className="app-side-column">
          <MoveHistoryPanel />
        </aside>
      </main>

      <SettingsModal />
    </div>
  );
});

App.displayName = 'App';

export default App;
