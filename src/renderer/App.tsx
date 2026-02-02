/**
 * App Component
 * Main application entry point for PersonaChess
 * View layer - React component
 */

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ChessBoardComponent, ConfigPanel, ControlPanel } from './components';
import { engineViewModel } from '../viewmodels';
import './App.css';

// Fixed board size
const BOARD_SIZE = 250;

export const App: React.FC = observer(() => {
  // Initialize engine on mount
  useEffect(() => {
    engineViewModel.initialize().catch(err => {
      console.error('Failed to initialize Stockfish:', err);
    });

    // Cleanup on unmount
    return () => {
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
          <ConfigPanel />
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
