/**
 * Config ViewModel
 * ViewModel layer - MobX store for bucket configuration
 */

import { makeAutoObservable, action, reaction } from 'mobx';
import { BucketConfig, MoveBucket, DEFAULT_BUCKET_CONFIG, MoveQualityPresetId, MOVE_QUALITY_PRESETS } from '../engine/types';
import { ENGINE_CONFIG_STORAGE_KEY } from '../engine/featureOptions';
import { normalizeBucketConfig, validateBucketConfig } from '../engine/movePicker';
import { featureOptionsViewModel } from './FeatureOptionsViewModel';

interface PersistedEngineConfig {
  bucketConfig: BucketConfig;
  currentPresetId: MoveQualityPresetId | null;
  depth: number;
  multiPV: number;
}

export class ConfigViewModel {
  bucketConfig: BucketConfig = { ...DEFAULT_BUCKET_CONFIG };
  /** Id of the active preset, or null if using custom distribution */
  currentPresetId: MoveQualityPresetId | null = 'medium';
  depth = 8;
  multiPV = 12;

  constructor() {
    makeAutoObservable(this, {
      setBucketValue: action,
      setBucketConfig: action,
      applyProfileSnapshot: action,
      applyPreset: action,
      resetToDefaults: action,
      normalizeConfig: action,
      setDepth: action,
      setMultiPV: action,
    });

    this.restoreFromStorage();

    reaction(
      () => ({
        bucketConfig: this.bucketConfig,
        currentPresetId: this.currentPresetId,
        depth: this.depth,
        multiPV: this.multiPV,
        persistEngineConfig: featureOptionsViewModel.persistEngineConfig,
      }),
      ({ persistEngineConfig }) => {
        if (!persistEngineConfig) {
          this.clearPersistedStorage();
          return;
        }

        this.persistToStorage();
      },
      { fireImmediately: true },
    );
  }

  /**
   * Set the percentage value for a specific bucket
   */
  setBucketValue(bucket: MoveBucket, value: number): void {
    const clampedValue = Math.max(0, Math.min(100, value));
    this.currentPresetId = null; // switching to custom
    this.bucketConfig = {
      ...this.bucketConfig,
      [bucket]: clampedValue,
    };
  }

  /**
   * Set the full bucket config (e.g. when applying a preset)
   */
  setBucketConfig(config: BucketConfig): void {
    this.bucketConfig = { ...config };
  }

  applyProfileSnapshot(snapshot: {
    bucketConfig: BucketConfig;
    currentPresetId: MoveQualityPresetId | null;
    depth: number;
    multiPV: number;
  }): void {
    this.bucketConfig = { ...snapshot.bucketConfig };
    this.currentPresetId = snapshot.currentPresetId;
    this.depth = Math.max(1, Math.min(30, snapshot.depth));
    this.multiPV = Math.max(1, Math.min(20, snapshot.multiPV));
  }

  /**
   * Apply a predefined move quality preset by id
   */
  applyPreset(presetId: MoveQualityPresetId): void {
    const preset = MOVE_QUALITY_PRESETS.find(p => p.id === presetId);
    if (preset) {
      this.currentPresetId = presetId;
      this.bucketConfig = { ...preset.config };
    }
  }

  /**
   * Reset bucket configuration to defaults (medium preset)
   */
  resetToDefaults(): void {
    this.currentPresetId = 'medium';
    this.bucketConfig = { ...DEFAULT_BUCKET_CONFIG };
  }

  /**
   * Normalize the configuration so percentages sum to 100
   */
  normalizeConfig(): void {
    this.bucketConfig = normalizeBucketConfig(this.bucketConfig);
  }

  /**
   * Set analysis depth
   */
  setDepth(value: number): void {
    this.depth = Math.max(1, Math.min(30, value));
  }

  /**
   * Set MultiPV value
   */
  setMultiPV(value: number): void {
    this.multiPV = Math.max(1, Math.min(20, value));
  }

  /**
   * Get total percentage sum
   */
  get totalPercentage(): number {
    return Object.values(this.bucketConfig).reduce((sum, val) => sum + val, 0);
  }

  /**
   * Check if configuration is valid (sums to 100)
   */
  get isValid(): boolean {
    const { valid } = validateBucketConfig(this.bucketConfig);
    return valid;
  }

  /**
   * Get the validation state
   */
  get validationState(): { valid: boolean; total: number } {
    return validateBucketConfig(this.bucketConfig);
  }

  get activePersonaId(): MoveQualityPresetId | null {
    return this.currentPresetId;
  }

  get activePersonaLabel(): string {
    if (this.currentPresetId === null) {
      return 'Custom';
    }

    return MOVE_QUALITY_PRESETS.find((preset) => preset.id === this.currentPresetId)?.label ?? 'Custom';
  }

  private restoreFromStorage(): void {
    try {
      const saved = localStorage.getItem(ENGINE_CONFIG_STORAGE_KEY);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as Partial<PersistedEngineConfig>;
      if (parsed.bucketConfig) {
        this.bucketConfig = { ...DEFAULT_BUCKET_CONFIG, ...parsed.bucketConfig };
      }
      if (parsed.currentPresetId !== undefined) {
        this.currentPresetId = parsed.currentPresetId;
      }
      if (typeof parsed.depth === 'number') {
        this.depth = Math.max(1, Math.min(30, parsed.depth));
      }
      if (typeof parsed.multiPV === 'number') {
        this.multiPV = Math.max(1, Math.min(20, parsed.multiPV));
      }
    } catch (error) {
      console.error('[ConfigViewModel] Failed to restore engine config:', error);
    }
  }

  private persistToStorage(): void {
    try {
      const snapshot: PersistedEngineConfig = {
        bucketConfig: this.bucketConfig,
        currentPresetId: this.currentPresetId,
        depth: this.depth,
        multiPV: this.multiPV,
      };

      localStorage.setItem(ENGINE_CONFIG_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      console.error('[ConfigViewModel] Failed to persist engine config:', error);
    }
  }

  private clearPersistedStorage(): void {
    try {
      localStorage.removeItem(ENGINE_CONFIG_STORAGE_KEY);
    } catch (error) {
      console.error('[ConfigViewModel] Failed to clear engine config storage:', error);
    }
  }
}

// Singleton instance
export const configViewModel = new ConfigViewModel();
