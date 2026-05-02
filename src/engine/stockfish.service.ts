/**
 * Stockfish UCI Engine Service
 * Model layer - Pure TypeScript, no React, no MobX
 * 
 * Handles communication with Stockfish WASM engine via Web Worker
 */

import { AnalyzedMove, StockfishInfo } from './types';
import { createDebugLogger } from '../shared/debug';

type MessageHandler = (message: string) => void;

export class StockfishService {
  private worker: Worker | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private isReady = false;
  private readyResolvers: Array<() => void> = [];
  private multiPV = 12;
  private depth = 20;
  private readonly logger;

  constructor(private readonly serviceName = 'StockfishService') {
    this.logger = createDebugLogger(serviceName);
  }

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
          this.logger.error('Worker error:', error);
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
    if (message && (message.startsWith('bestmove') || message === 'readyok' || message === 'uciok')) {
      this.logger.debug('Message:', message);
    }
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
      let hasReceivedBestMove = false;
      let maxDepthReached = 0;

      // Helper function to complete analysis with collected moves
      const completeAnalysis = () => {
        if (hasReceivedBestMove) return;
        hasReceivedBestMove = true;
        this.removeMessageHandler(analysisHandler);

        this.logger.debug('Completing analysis, collected', moves.size, 'moves');

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

        if (analyzedMoves.length > 0) {
          this.logger.debug('Returning', analyzedMoves.length, 'analyzed moves');
          resolve(analyzedMoves);
        } else {
          // Check if this is a game over position (checkmate/stalemate)
          // If we received mate scores but no moves, it's game over
          this.logger.debug('No moves collected - likely game over position');
          resolve([]); // Return empty array instead of rejecting for game over positions
        }
      };

      // Add timeout to force stop after reasonable time
      const forceStopTimeout = setTimeout(() => {
        if (!hasReceivedBestMove) {
          this.logger.warn('Forcing stop after 10 seconds to get bestmove');
          this.sendCommand('stop');
          // Give it a moment to respond with bestmove
          setTimeout(() => {
            if (!hasReceivedBestMove) {
              this.logger.warn('No bestmove after stop, using collected moves');
              completeAnalysis();
            }
          }, 1000);
        }
      }, 10000); // 10 second timeout to force stop

      // Add absolute timeout to prevent hanging
      const absoluteTimeout = setTimeout(() => {
        if (!hasReceivedBestMove) {
          this.logger.error('Analysis timeout after 30 seconds');
          this.removeMessageHandler(analysisHandler);
          clearTimeout(forceStopTimeout);
          completeAnalysis(); // Try to use what we have
        }
      }, 30000); // 30 second absolute timeout

      const analysisHandler = (message: string) => {
        // Check for mate scores (game over positions)
        if (message.includes('score mate')) {
          // Extract mate score to detect checkmate/stalemate
          const mateMatch = message.match(/score mate (-?\d+)/);
          if (mateMatch) {
            const mateIn = parseInt(mateMatch[1], 10);
            this.logger.debug('Detected mate score:', mateIn);
            // If mate is 0 or negative, it's checkmate/stalemate (no moves available)
            if (mateIn <= 0) {
              this.logger.debug('Game over position detected (checkmate/stalemate)');
            }
          }
        }
        
        // Parse info lines
        if (message.startsWith('info') && message.includes('multipv')) {
          const info = this.parseInfoLine(message);
          if (info) {
            moves.set(info.multipv, info);
            if (info.multipv === 1) {
              bestScore = info.score;
              maxDepthReached = Math.max(maxDepthReached, info.depth);
              
              // If we've reached the target depth and have enough moves, we can stop early
              if (info.depth >= this.depth && moves.size >= Math.min(3, this.multiPV)) {
                this.logger.debug('Reached target depth, stopping early');
                this.sendCommand('stop');
              }
            }
          }
        }

        // Analysis complete
        if (message.startsWith('bestmove')) {
          hasReceivedBestMove = true;
          clearTimeout(forceStopTimeout);
          clearTimeout(absoluteTimeout);
          this.removeMessageHandler(analysisHandler);

          // Check if bestmove is "none" (no legal moves - checkmate/stalemate)
          const bestmoveMatch = message.match(/bestmove\s+(\S+)/);
          if (bestmoveMatch) {
            const bestmove = bestmoveMatch[1];
            if (bestmove === '(none)' || bestmove === 'none' || bestmove === '0000') {
              this.logger.debug('No legal moves (checkmate/stalemate)');
              resolve([]); // Return empty array for game over positions
              return;
            }
          }

          this.logger.debug('Received bestmove, collected', moves.size, 'moves');

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

          // If we have no moves but got a bestmove, it might still be game over
          if (analyzedMoves.length === 0) {
            this.logger.debug('No moves in bestmove response - game over position');
            resolve([]);
          } else {
            this.logger.debug('Returning', analyzedMoves.length, 'analyzed moves');
            resolve(analyzedMoves);
          }
        }
      };

      this.addMessageHandler(analysisHandler);

      // Wait for readyok before sending position
      const readyHandler = (msg: string) => {
        if (msg === 'readyok') {
          this.removeMessageHandler(readyHandler);
          this.logger.debug('Engine ready, sending position and starting analysis');
          this.sendCommand(`position fen ${fen}`);
          this.sendCommand(`go depth ${this.depth}`);
        }
      };
      this.addMessageHandler(readyHandler);

      // Send position and start analysis
      this.logger.debug('Starting analysis for FEN:', fen, 'MultiPV=', this.multiPV, 'Depth=', this.depth);
      
      this.sendCommand(`setoption name MultiPV value ${this.multiPV}`);
      this.sendCommand('isready');
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
export const moveStockfishService = new StockfishService('MoveStockfishService');
export const analysisStockfishService = new StockfishService('AnalysisStockfishService');
export const stockfishService = analysisStockfishService;
