import { action, makeAutoObservable } from 'mobx';
import { MoveQualityPresetId } from '../engine/types';

type SettingsTabId =
  | 'general'
  | 'engine'
  | 'personality'
  | 'brilliant'
  | 'advanced'
  | 'debug'
  | 'about';

type AnimationSpeed = 'slow' | 'normal' | 'fast';
type ThemeMode = 'dark' | 'light' | 'minimal' | 'persona';
type BoardSizePreset = 'small' | 'medium' | 'large' | 'xlarge';
type AutoPlaySpeed = 'slow' | 'normal' | 'fast';

const BOARD_SIZE_PRESET_PIXELS: Record<BoardSizePreset, number> = {
  small: 480,
  medium: 640,
  large: 800,
  xlarge: 960,
};

interface PersistedUiPreferences {
  basicMode: boolean;
  animationSpeed: AnimationSpeed;
  soundEnabled: boolean;
  soundMuted: boolean;
  soundVolume: number;
  autoPlaySpeed: AutoPlaySpeed;
  themeMode: ThemeMode;
  boardSizePreset: BoardSizePreset;
  selectedSettingsTab: SettingsTabId;
}

const UI_PREFERENCES_STORAGE_KEY = 'personachess_ui_preferences';

const DEFAULT_UI_PREFERENCES: PersistedUiPreferences = {
  basicMode: true,
  animationSpeed: 'normal',
  soundEnabled: true,
  soundMuted: false,
  soundVolume: 70,
  autoPlaySpeed: 'normal',
  themeMode: 'dark',
  boardSizePreset: 'medium',
  selectedSettingsTab: 'general',
};

const AUTO_PLAY_SPEED_DELAYS: Record<AutoPlaySpeed, number> = {
  slow: 1200,
  normal: 700,
  fast: 350,
};

export class UiStateViewModel {
  settingsOpen = false;
  basicMode = DEFAULT_UI_PREFERENCES.basicMode;
  animationSpeed = DEFAULT_UI_PREFERENCES.animationSpeed;
  soundEnabled = DEFAULT_UI_PREFERENCES.soundEnabled;
  soundMuted = DEFAULT_UI_PREFERENCES.soundMuted;
  soundVolume = DEFAULT_UI_PREFERENCES.soundVolume;
  autoPlaySpeed = DEFAULT_UI_PREFERENCES.autoPlaySpeed;
  themeMode = DEFAULT_UI_PREFERENCES.themeMode;
  boardSizePreset = DEFAULT_UI_PREFERENCES.boardSizePreset;
  selectedSettingsTab: SettingsTabId = DEFAULT_UI_PREFERENCES.selectedSettingsTab;

  constructor() {
    makeAutoObservable(this, {
      setSettingsOpen: action,
      applyProfilePreferences: action,
      setBasicMode: action,
      setAnimationSpeed: action,
      setSoundEnabled: action,
      setSoundMuted: action,
      setSoundVolume: action,
      setAutoPlaySpeed: action,
      setThemeMode: action,
      setBoardSizePreset: action,
      setSelectedSettingsTab: action,
    });

    this.restoreFromStorage();
  }

  setSettingsOpen(open: boolean): void {
    this.settingsOpen = open;
  }

  applyProfilePreferences(preferences: Partial<Pick<PersistedUiPreferences, 'basicMode' | 'themeMode'>>): void {
    this.basicMode = preferences.basicMode ?? this.basicMode;
    this.themeMode = preferences.themeMode ?? this.themeMode;
    this.persistToStorage();
  }

  setBasicMode(enabled: boolean): void {
    this.basicMode = enabled;
    this.persistToStorage();
  }

  setAnimationSpeed(speed: AnimationSpeed): void {
    this.animationSpeed = speed;
    this.persistToStorage();
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.persistToStorage();
  }

  setSoundMuted(muted: boolean): void {
    this.soundMuted = muted;
    this.persistToStorage();
  }

  setSoundVolume(volume: number): void {
    this.soundVolume = Math.max(0, Math.min(100, Math.round(volume)));
    this.persistToStorage();
  }

  setAutoPlaySpeed(speed: AutoPlaySpeed): void {
    this.autoPlaySpeed = speed;
    this.persistToStorage();
  }

  setThemeMode(themeMode: ThemeMode): void {
    this.themeMode = themeMode;
    this.persistToStorage();
  }

  setBoardSizePreset(boardSizePreset: BoardSizePreset): void {
    this.boardSizePreset = boardSizePreset;
    this.persistToStorage();
  }

  setSelectedSettingsTab(tab: SettingsTabId): void {
    this.selectedSettingsTab = tab;
    this.persistToStorage();
  }

  private restoreFromStorage(): void {
    try {
      const saved = localStorage.getItem(UI_PREFERENCES_STORAGE_KEY);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as Partial<PersistedUiPreferences>;
      this.basicMode = parsed.basicMode ?? DEFAULT_UI_PREFERENCES.basicMode;
      this.animationSpeed = parsed.animationSpeed ?? DEFAULT_UI_PREFERENCES.animationSpeed;
      this.soundEnabled = parsed.soundEnabled ?? DEFAULT_UI_PREFERENCES.soundEnabled;
      this.soundMuted = parsed.soundMuted ?? DEFAULT_UI_PREFERENCES.soundMuted;
      this.soundVolume = typeof parsed.soundVolume === 'number'
        ? Math.max(0, Math.min(100, Math.round(parsed.soundVolume)))
        : DEFAULT_UI_PREFERENCES.soundVolume;
      this.autoPlaySpeed = parsed.autoPlaySpeed ?? DEFAULT_UI_PREFERENCES.autoPlaySpeed;
      this.themeMode = parsed.themeMode ?? DEFAULT_UI_PREFERENCES.themeMode;
      this.boardSizePreset = parsed.boardSizePreset ?? DEFAULT_UI_PREFERENCES.boardSizePreset;
      this.selectedSettingsTab = parsed.selectedSettingsTab ?? DEFAULT_UI_PREFERENCES.selectedSettingsTab;
    } catch {
      // Ignore invalid UI preference snapshots.
    }
  }

  private persistToStorage(): void {
    try {
      localStorage.setItem(
        UI_PREFERENCES_STORAGE_KEY,
        JSON.stringify({
          basicMode: this.basicMode,
          animationSpeed: this.animationSpeed,
          soundEnabled: this.soundEnabled,
          soundMuted: this.soundMuted,
          soundVolume: this.soundVolume,
          autoPlaySpeed: this.autoPlaySpeed,
          themeMode: this.themeMode,
          boardSizePreset: this.boardSizePreset,
          selectedSettingsTab: this.selectedSettingsTab,
        } as PersistedUiPreferences),
      );
    } catch {
      // Ignore localStorage issues and keep UI responsive.
    }
  }

  get boardSizePx(): number {
    return BOARD_SIZE_PRESET_PIXELS[this.boardSizePreset];
  }

  get autoPlayDelayMs(): number {
    return AUTO_PLAY_SPEED_DELAYS[this.autoPlaySpeed];
  }

  get effectiveSoundVolume(): number {
    if (!this.soundEnabled || this.soundMuted) {
      return 0;
    }

    return this.soundVolume / 100;
  }

  getPersonaAccentTone(personaId: MoveQualityPresetId | null): 'red' | 'gold' | 'blue' | 'green' {
    switch (personaId) {
      case 'aggressive':
        return 'red';
      case 'hard':
      case 'super_hard':
        return 'gold';
      case 'low':
        return 'green';
      case 'medium':
      case null:
      default:
        return 'blue';
    }
  }
}

export const uiStateViewModel = new UiStateViewModel();

export { BOARD_SIZE_PRESET_PIXELS };
export type { AnimationSpeed, AutoPlaySpeed, BoardSizePreset, SettingsTabId, ThemeMode };
