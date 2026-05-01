import { action, makeAutoObservable } from 'mobx';
import {
  isDebugLoggingEnabled,
  isDevelopmentBuild,
  setDebugLoggingEnabled,
} from '../shared/debug';

export class DebugViewModel {
  debugLoggingEnabled = isDebugLoggingEnabled();

  constructor() {
    makeAutoObservable(this, {
      setDebugLoggingEnabled: action,
      toggleDebugLogging: action,
    });
  }

  setDebugLoggingEnabled(enabled: boolean): void {
    this.debugLoggingEnabled = enabled;
    setDebugLoggingEnabled(enabled);
  }

  toggleDebugLogging(): void {
    this.setDebugLoggingEnabled(!this.debugLoggingEnabled);
  }

  get isDevelopment(): boolean {
    return isDevelopmentBuild();
  }

  get showDebugControls(): boolean {
    return this.isDevelopment;
  }
}

export const debugViewModel = new DebugViewModel();

