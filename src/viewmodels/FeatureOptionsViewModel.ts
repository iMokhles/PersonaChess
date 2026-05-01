import { action, makeAutoObservable, reaction } from 'mobx';
import {
  BrilliantAllowedPhase,
  BrilliantMoveBudgetConfig,
  BrilliantMovesPerGame,
  DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG,
  DEFAULT_FEATURE_OPTIONS,
  FEATURE_OPTIONS_STORAGE_KEY,
  FeatureOptionKey,
  FeatureOptions,
  mergeBrilliantMoveBudgetConfig,
  mergeFeatureOptions,
} from '../engine/featureOptions';

declare global {
  interface Window {
    personaChessBridge?: {
      syncFeatureOptions: (options: FeatureOptions) => void;
    };
  }
}

export class FeatureOptionsViewModel {
  options: FeatureOptions = { ...DEFAULT_FEATURE_OPTIONS };
  brilliantConfig: BrilliantMoveBudgetConfig = { ...DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG };

  constructor() {
    makeAutoObservable(this, {
      setOption: action,
      setOptions: action,
      setBrilliantMovesPerGame: action,
      setBrilliantAllowedPhase: action,
      reconcileBrilliantTracking: action,
      resetBrilliantTracking: action,
      resetToDefaults: action,
    });

    this.restoreFromStorage();

    reaction(
      () => ({
        options: { ...this.options },
        brilliantConfig: {
          ...this.brilliantConfig,
          brilliantMoveNumbers: [...this.brilliantConfig.brilliantMoveNumbers],
        },
      }),
      (snapshot) => {
        this.persistToStorage();
        this.syncToMainProcess(snapshot.options);
      },
      { fireImmediately: true },
    );
  }

  setOption<Key extends FeatureOptionKey>(key: Key, value: FeatureOptions[Key]): void {
    this.options = {
      ...this.options,
      [key]: value,
    };

    if (key === 'persistEngineConfig' && value === false) {
      this.clearPersistedStorage();
    }
  }

  setOptions(options: Partial<FeatureOptions>): void {
    this.options = mergeFeatureOptions({
      ...this.options,
      ...options,
    });
  }

  setBrilliantMovesPerGame(value: BrilliantMovesPerGame): void {
    this.brilliantConfig = {
      ...this.brilliantConfig,
      brilliantMovesPerGame: value,
    };

    if (this.brilliantConfig.brilliantUsedCount > value) {
      this.brilliantConfig = {
        ...this.brilliantConfig,
        brilliantUsedCount: value,
        brilliantMoveNumbers: this.brilliantConfig.brilliantMoveNumbers.slice(0, value),
      };
    }
  }

  setBrilliantAllowedPhase(value: BrilliantAllowedPhase): void {
    this.brilliantConfig = {
      ...this.brilliantConfig,
      brilliantAllowedPhase: value,
    };
  }

  reconcileBrilliantTracking(
    gameSessionId: string,
    brilliantMoveNumbers: number[],
  ): void {
    this.brilliantConfig = {
      ...this.brilliantConfig,
      gameSessionId,
      brilliantUsedCount: brilliantMoveNumbers.length,
      brilliantMoveNumbers: [...brilliantMoveNumbers],
    };
  }

  resetBrilliantTracking(gameSessionId: string | null = null): void {
    this.brilliantConfig = {
      ...this.brilliantConfig,
      gameSessionId,
      brilliantUsedCount: 0,
      brilliantMoveNumbers: [],
    };
  }

  resetToDefaults(): void {
    this.options = { ...DEFAULT_FEATURE_OPTIONS };
    this.brilliantConfig = { ...DEFAULT_BRILLIANT_MOVE_BUDGET_CONFIG };
  }

  private restoreFromStorage(): void {
    try {
      const saved = localStorage.getItem(FEATURE_OPTIONS_STORAGE_KEY);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as
        | Partial<FeatureOptions>
        | { options?: Partial<FeatureOptions>; brilliantConfig?: Partial<BrilliantMoveBudgetConfig> };

      if ('options' in parsed || 'brilliantConfig' in parsed) {
        this.options = mergeFeatureOptions(parsed.options);
        this.brilliantConfig = mergeBrilliantMoveBudgetConfig(parsed.brilliantConfig);
        return;
      }

      this.options = mergeFeatureOptions(parsed as Partial<FeatureOptions>);
    } catch (error) {
      console.error('[FeatureOptionsViewModel] Failed to restore feature options:', error);
    }
  }

  private persistToStorage(): void {
    try {
      if (!this.options.persistEngineConfig) {
        localStorage.removeItem(FEATURE_OPTIONS_STORAGE_KEY);
        return;
      }

      localStorage.setItem(
        FEATURE_OPTIONS_STORAGE_KEY,
        JSON.stringify({
          options: this.options,
          brilliantConfig: this.brilliantConfig,
        }),
      );
    } catch (error) {
      console.error('[FeatureOptionsViewModel] Failed to persist feature options:', error);
    }
  }

  private clearPersistedStorage(): void {
    try {
      localStorage.removeItem(FEATURE_OPTIONS_STORAGE_KEY);
    } catch (error) {
      console.error('[FeatureOptionsViewModel] Failed to clear feature options storage:', error);
    }
  }

  private syncToMainProcess(options: FeatureOptions): void {
    if (typeof window === 'undefined') {
      return;
    }

    const serializableOptions = mergeFeatureOptions({
      ...options,
    });

    window.personaChessBridge?.syncFeatureOptions(serializableOptions);
  }

  get securityDevToolsOnly(): boolean {
    return this.options.securityDevToolsOnly;
  }

  get persistEngineConfig(): boolean {
    return this.options.persistEngineConfig;
  }

  get useDeterministicRng(): boolean {
    return this.options.useDeterministicRng;
  }

  get useMoveAnalysisCache(): boolean {
    return this.options.useMoveAnalysisCache;
  }

  get useImprovedMoveClassification(): boolean {
    return this.options.useImprovedMoveClassification;
  }

  get usePositionComplexity(): boolean {
    return this.options.usePositionComplexity;
  }

  get usePersonaBehaviorBias(): boolean {
    return this.options.usePersonaBehaviorBias;
  }

  get useHumanDelaySimulation(): boolean {
    return this.options.useHumanDelaySimulation;
  }

  get useBrilliantMoveBudget(): boolean {
    return this.options.useBrilliantMoveBudget;
  }

  get brilliantMovesPerGame(): BrilliantMovesPerGame {
    return this.brilliantConfig.brilliantMovesPerGame;
  }

  get brilliantAllowedPhase(): BrilliantAllowedPhase {
    return this.brilliantConfig.brilliantAllowedPhase;
  }

  get brilliantUsedCount(): number {
    return this.brilliantConfig.brilliantUsedCount;
  }

  get brilliantMoveNumbers(): number[] {
    return this.brilliantConfig.brilliantMoveNumbers;
  }

  get brilliantGameSessionId(): string | null {
    return this.brilliantConfig.gameSessionId;
  }

  get hasRemainingBrilliantMoves(): boolean {
    return this.brilliantConfig.brilliantUsedCount < this.brilliantConfig.brilliantMovesPerGame;
  }
}

export const featureOptionsViewModel = new FeatureOptionsViewModel();
