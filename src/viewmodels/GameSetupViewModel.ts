import { action, makeAutoObservable } from 'mobx';
import {
  filterGameSetupPresets,
  GAME_SETUP_PRESETS,
  GameSetupCategory,
  GAME_SETUP_CATEGORY_OPTIONS,
  GameSetupPreset,
  getGameSetupPresetById,
} from '../engine/gameSetupPresets';
import { boardViewModel, BoardViewModel } from './BoardViewModel';

interface GameSetupViewModelDependencies {
  boardViewModel: Pick<BoardViewModel, 'loadFen' | 'loadPgn' | 'loadGameSetupPreset' | 'statusMessage'>;
}

export class GameSetupViewModel {
  open = false;
  selectedCategory: GameSetupCategory = 'openings';
  searchQuery = '';
  selectedPresetId: string | null = GAME_SETUP_PRESETS[0]?.id ?? null;
  customFenInput = '';
  customPgnInput = '';

  private readonly deps: GameSetupViewModelDependencies;

  constructor(
    deps: GameSetupViewModelDependencies = {
      boardViewModel,
    },
  ) {
    this.deps = deps;

    makeAutoObservable(this, {
      setOpen: action,
      openAtCategory: action,
      setSelectedCategory: action,
      setSearchQuery: action,
      setSelectedPresetId: action,
      setCustomFenInput: action,
      setCustomPgnInput: action,
      loadSelectedPreset: action,
      loadCustomFen: action,
      loadCustomPgn: action,
      syncSelectionFromCategory: action,
    });

    this.syncSelectionFromCategory();
  }

  setOpen(open: boolean): void {
    this.open = open;
  }

  openAtCategory(category: GameSetupCategory): void {
    this.selectedCategory = category;
    this.searchQuery = '';
    this.open = true;
    this.syncSelectionFromCategory();
  }

  setSelectedCategory(category: GameSetupCategory): void {
    this.selectedCategory = category;
    this.searchQuery = '';
    this.syncSelectionFromCategory();
  }

  setSearchQuery(value: string): void {
    this.searchQuery = value;
    this.syncSelectionFromCategory();
  }

  setSelectedPresetId(id: string | null): void {
    this.selectedPresetId = id;
  }

  setCustomFenInput(value: string): void {
    this.customFenInput = value;
  }

  setCustomPgnInput(value: string): void {
    this.customPgnInput = value;
  }

  loadSelectedPreset(): boolean {
    const preset = this.selectedPreset;
    if (!preset) {
      return false;
    }

    const loaded = this.deps.boardViewModel.loadGameSetupPreset(preset);
    if (loaded) {
      this.open = false;
    }
    return loaded;
  }

  loadCustomFen(): boolean {
    if (!this.customFenInput.trim()) {
      return false;
    }

    const loaded = this.deps.boardViewModel.loadFen(this.customFenInput.trim());
    if (loaded) {
      this.deps.boardViewModel.statusMessage = 'Custom FEN loaded';
      this.customFenInput = '';
      this.open = false;
    }
    return loaded;
  }

  loadCustomPgn(): boolean {
    if (!this.customPgnInput.trim()) {
      return false;
    }

    const loaded = this.deps.boardViewModel.loadPgn(this.customPgnInput.trim());
    if (loaded) {
      this.deps.boardViewModel.statusMessage = 'Custom PGN loaded';
      this.customPgnInput = '';
      this.open = false;
    }
    return loaded;
  }

  syncSelectionFromCategory(): void {
    if (this.selectedCategory === 'custom-fen' || this.selectedCategory === 'custom-pgn') {
      this.selectedPresetId = null;
      return;
    }

    const visiblePresetIds = this.filteredPresets.map((preset) => preset.id);
    if (this.selectedPresetId && visiblePresetIds.includes(this.selectedPresetId)) {
      return;
    }

    this.selectedPresetId = visiblePresetIds[0] ?? null;
  }

  get categories() {
    return GAME_SETUP_CATEGORY_OPTIONS;
  }

  get filteredPresets(): GameSetupPreset[] {
    return filterGameSetupPresets(GAME_SETUP_PRESETS, this.selectedCategory, this.searchQuery);
  }

  get selectedPreset(): GameSetupPreset | null {
    return this.selectedPresetId ? getGameSetupPresetById(this.selectedPresetId) ?? null : null;
  }
}

export const gameSetupViewModel = new GameSetupViewModel();
