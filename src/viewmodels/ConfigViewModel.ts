/**
 * Config ViewModel
 * ViewModel layer - MobX store for bucket configuration
 */

import { makeAutoObservable, action } from 'mobx';
import { BucketConfig, MoveBucket, DEFAULT_BUCKET_CONFIG } from '../engine/types';
import { normalizeBucketConfig, validateBucketConfig } from '../engine/movePicker';

export class ConfigViewModel {
  bucketConfig: BucketConfig = { ...DEFAULT_BUCKET_CONFIG };
  depth = 8;
  multiPV = 12;

  constructor() {
    makeAutoObservable(this, {
      setBucketValue: action,
      resetToDefaults: action,
      normalizeConfig: action,
      setDepth: action,
      setMultiPV: action,
    });
  }

  /**
   * Set the percentage value for a specific bucket
   */
  setBucketValue(bucket: MoveBucket, value: number): void {
    const clampedValue = Math.max(0, Math.min(100, value));
    this.bucketConfig = {
      ...this.bucketConfig,
      [bucket]: clampedValue,
    };
  }

  /**
   * Reset bucket configuration to defaults
   */
  resetToDefaults(): void {
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
}

// Singleton instance
export const configViewModel = new ConfigViewModel();
