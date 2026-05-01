/**
 * App Component
 * Main application entry point for PersonaChess
 * View layer - React component
 */

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ChessBoardComponent, ConfigPanel, ControlPanel, FeatureOptionsPanel } from './components';
import { engineViewModel } from '../viewmodels';
import { createDebugLogger } from '../shared/debug';
import './App.css';

// Fixed board size - fits within 750px container
const BOARD_SIZE = 650;
const logger = createDebugLogger('App');

export const App: React.FC = observer(() => {
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">♟</span>
          <h1>PersonaChess</h1>
        </div>
        <p className="tagline">Human-like chess move generator</p>
      </header>

      <main className="app-main">
        <div className="board-section">
          <ChessBoardComponent boardWidth={BOARD_SIZE} />
        </div>

        <div className="controls-section">
          <ControlPanel />
          <div className="settings-section">
            <ConfigPanel />
            <FeatureOptionsPanel />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          PersonaChess uses Stockfish WASM for analysis • 
          Moves are selected based on quality distribution
        </p>
      </footer>
    </div>
  );
});

App.displayName = 'App';

export default App;
