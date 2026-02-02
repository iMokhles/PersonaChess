/**
 * Stockfish UCI Engine Service
 * Model layer - Pure TypeScript, no React, no MobX
 * 
 * Handles communication with Stockfish WASM engine via Web Worker
 */

import { AnalyzedMove, StockfishInfo } from './types';

type MessageHandler = (message: string) => void;

export class StockfishService {
  private worker: Worker | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private isReady = false;
  private readyResolvers: Array<() => void> = [];
  private multiPV = 12;
  private depth = 20;

  /**
   * Initialize Stockfish WASM engine
   */
  async initialize(): Promise<void> {
    if (this.worker) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Create worker using stockfish.js
        // In Vite, we need to use ?worker suffix or create inline worker
        const workerCode = `
          importScripts('${window.location.origin}/stockfish.js');
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));

        this.worker.onmessage = (event: MessageEvent) => {
          const message = typeof event.data === 'string' ? event.data : String(event.data);
          this.handleMessage(message);
        };

        this.worker.onerror = (error) => {
          console.error('Stockfish worker error:', error);
          reject(error);
        };

        // Wait for UCI initialization
        const readyHandler = (msg: string) => {
          if (msg === 'uciok') {
            this.isReady = true;
            this.removeMessageHandler(readyHandler);
            this.readyResolvers.forEach(r => r());
            this.readyResolvers = [];
            resolve();
          }
        };

        this.addMessageHandler(readyHandler);
        
        // Small delay to ensure worker is ready
        setTimeout(() => {
          this.sendCommand('uci');
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Destroy the engine instance
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
    this.messageHandlers.clear();
  }

  /**
   * Send UCI command to engine
   */
  private sendCommand(command: string): void {
    if (!this.worker) {
      throw new Error('Stockfish not initialized');
    }
    this.worker.postMessage(command);
  }

  /**
   * Handle incoming message from engine
   */
  private handleMessage(message: string): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  /**
   * Add a message handler
   */
  addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.add(handler);
  }

  /**
   * Remove a message handler
   */
  removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  /**
   * Wait for engine to be ready
   */
  async waitForReady(): Promise<void> {
    if (this.isReady) return;
    return new Promise(resolve => {
      this.readyResolvers.push(resolve);
    });
  }

  /**
   * Set MultiPV option
   */
  setMultiPV(value: number): void {
    this.multiPV = value;
    if (this.isReady) {
      this.sendCommand(`setoption name MultiPV value ${value}`);
    }
  }

  /**
   * Set search depth
   */
  setDepth(value: number): void {
    this.depth = value;
  }

  /**
   * Configure engine options
   */
  configure(options: { multiPV?: number; depth?: number }): void {
    if (options.multiPV !== undefined) {
      this.setMultiPV(options.multiPV);
    }
    if (options.depth !== undefined) {
      this.setDepth(options.depth);
    }
  }

  /**
   * Analyze a position and return all candidate moves
   */
  async analyzePosition(fen: string): Promise<AnalyzedMove[]> {
    await this.waitForReady();

    return new Promise((resolve) => {
      const moves: Map<number, StockfishInfo> = new Map();
      let bestScore = 0;

      const analysisHandler = (message: string) => {
        // Parse info lines
        if (message.startsWith('info') && message.includes('multipv')) {
          const info = this.parseInfoLine(message);
          if (info) {
            moves.set(info.multipv, info);
            if (info.multipv === 1) {
              bestScore = info.score;
            }
          }
        }

        // Analysis complete
        if (message.startsWith('bestmove')) {
          this.removeMessageHandler(analysisHandler);

          // Convert to AnalyzedMove array
          const analyzedMoves: AnalyzedMove[] = [];
          
          for (let i = 1; i <= this.multiPV; i++) {
            const info = moves.get(i);
            if (info && info.pv.length > 0) {
              const evalLoss = Math.abs(bestScore - info.score);
              analyzedMoves.push({
                move: info.pv[0],
                evaluation: info.score,
                evalLoss,
                pv: info.pv,
                multipv: info.multipv,
                depth: info.depth,
              });
            }
          }

          resolve(analyzedMoves);
        }
      };

      this.addMessageHandler(analysisHandler);

      // Send position and start analysis
      this.sendCommand(`setoption name MultiPV value ${this.multiPV}`);
      this.sendCommand('isready');
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${this.depth}`);
    });
  }

  /**
   * Parse UCI info line into structured data
   */
  private parseInfoLine(line: string): StockfishInfo | null {
    try {
      const parts = line.split(' ');
      
      const getValueAfter = (key: string): string | null => {
        const idx = parts.indexOf(key);
        return idx >= 0 && idx < parts.length - 1 ? parts[idx + 1] : null;
      };

      const multipvStr = getValueAfter('multipv');
      const depthStr = getValueAfter('depth');
      
      if (!multipvStr || !depthStr) return null;

      const multipv = parseInt(multipvStr, 10);
      const depth = parseInt(depthStr, 10);

      // Get score value
      let score = 0;
      let mate: number | undefined;
      const scoreIdx = parts.indexOf('score');
      
      if (scoreIdx >= 0 && parts[scoreIdx + 1] === 'cp') {
        score = parseInt(parts[scoreIdx + 2], 10);
      } else if (scoreIdx >= 0 && parts[scoreIdx + 1] === 'mate') {
        mate = parseInt(parts[scoreIdx + 2], 10);
        // Convert mate to a large centipawn value
        score = mate > 0 ? 10000 - mate * 100 : -10000 - mate * 100;
      }

      // Get PV (principal variation)
      const pvIdx = parts.indexOf('pv');
      const pv = pvIdx >= 0 ? parts.slice(pvIdx + 1) : [];

      return {
        multipv,
        depth,
        score,
        mate,
        pv,
      };
    } catch {
      return null;
    }
  }

  /**
   * Stop current analysis
   */
  stop(): void {
    if (this.worker) {
      this.sendCommand('stop');
    }
  }

  /**
   * Start a new game
   */
  newGame(): void {
    if (this.worker) {
      this.sendCommand('ucinewgame');
    }
  }

  /**
   * Check if engine is initialized
   */
  get initialized(): boolean {
    return this.isReady;
  }
}

// Singleton instance
export const stockfishService = new StockfishService();
