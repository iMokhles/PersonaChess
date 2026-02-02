/**
 * Renderer Entry Point
 * Mounts the React application
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { configure } from 'mobx';
import App from './App';
import './styles/global.css';

// Configure MobX for strict mode
configure({
  enforceActions: 'observed',
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
});

// Get the root container
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

// Create React root and render
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
