import { AnalyzedMove } from './types';
import {
  analysisStockfishService,
  moveStockfishService,
  StockfishService,
} from './stockfish.service';

export type EngineLane = 'move' | 'analysis';

interface EngineCoordinatorDependencies {
  moveService?: StockfishService;
  analysisService?: StockfishService;
}

export class EngineCoordinator {
  private readonly moveService: StockfishService;
  private readonly analysisService: StockfishService;

  constructor(dependencies: EngineCoordinatorDependencies = {}) {
    this.moveService = dependencies.moveService ?? moveStockfishService;
    this.analysisService = dependencies.analysisService ?? analysisStockfishService;
  }

  async initialize(lane?: EngineLane): Promise<void> {
    if (lane === 'move') {
      await this.moveService.initialize();
      return;
    }

    if (lane === 'analysis') {
      await this.analysisService.initialize();
      return;
    }

    await Promise.all([
      this.moveService.initialize(),
      this.analysisService.initialize(),
    ]);
  }

  configure(lane: EngineLane, options: { multiPV?: number; depth?: number }): void {
    this.getService(lane).configure(options);
  }

  async analyzePosition(lane: EngineLane, fen: string): Promise<AnalyzedMove[]> {
    return this.getService(lane).analyzePosition(fen);
  }

  stop(lane?: EngineLane): void {
    if (!lane) {
      this.moveService.stop();
      this.analysisService.stop();
      return;
    }

    this.getService(lane).stop();
  }

  newGame(): void {
    this.moveService.newGame();
    this.analysisService.newGame();
  }

  destroy(): void {
    this.moveService.destroy();
    this.analysisService.destroy();
  }

  private getService(lane: EngineLane): StockfishService {
    return lane === 'move' ? this.moveService : this.analysisService;
  }
}

export const engineCoordinator = new EngineCoordinator();
