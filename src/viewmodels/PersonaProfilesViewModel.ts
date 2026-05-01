import { action, makeAutoObservable } from 'mobx';
import {
  buildPersonaProfileExportFilename,
  createSavedPersonaProfile,
  duplicatePersonaProfile,
  parsePersonaProfileImport,
  PERSONA_PROFILE_KIND,
  PERSONA_PROFILE_VERSION,
  PersonaProfileExport,
  PersonaProfileSettingsSnapshot,
  sanitizePersonaProfileStoreSnapshot,
  SavedPersonaProfile,
  serializePersonaProfile,
  updateSavedPersonaProfile,
} from '../engine/personaProfiles';
import { configViewModel, ConfigViewModel } from './ConfigViewModel';
import { featureOptionsViewModel, FeatureOptionsViewModel } from './FeatureOptionsViewModel';
import { uiStateViewModel, UiStateViewModel } from './UiStateViewModel';

const PERSONA_PROFILES_STORAGE_KEY = 'personachess_persona_profiles';

interface PersonaProfilesDependencies {
  configViewModel: Pick<ConfigViewModel, 'bucketConfig' | 'currentPresetId' | 'depth' | 'multiPV' | 'applyProfileSnapshot'>;
  featureOptionsViewModel: Pick<
    FeatureOptionsViewModel,
    | 'options'
    | 'brilliantMovesPerGame'
    | 'brilliantAllowedPhase'
    | 'applyProfileSettings'
  >;
  uiStateViewModel: Pick<
    UiStateViewModel,
    | 'themeMode'
    | 'basicMode'
    | 'applyProfilePreferences'
  >;
}

function createProfileId(): string {
  return `profile_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createTimestamp(): string {
  return new Date().toISOString();
}

export class PersonaProfilesViewModel {
  profiles: SavedPersonaProfile[] = [];
  selectedProfileId: string | null = null;
  profileNameDraft = '';
  exchangeJson = '';
  lastActionMessage = '';
  importError = '';

  private readonly deps: PersonaProfilesDependencies;

  constructor(
    deps: PersonaProfilesDependencies = {
      configViewModel,
      featureOptionsViewModel,
      uiStateViewModel,
    },
  ) {
    this.deps = deps;

    makeAutoObservable(this, {
      setSelectedProfileId: action,
      setProfileNameDraft: action,
      setExchangeJson: action,
      clearExchangeState: action,
      saveCurrentProfile: action,
      loadSelectedProfile: action,
      duplicateSelectedProfile: action,
      renameSelectedProfile: action,
      deleteSelectedProfile: action,
      importProfileFromJson: action,
    });

    this.restoreFromStorage();
  }

  setSelectedProfileId(id: string | null): void {
    this.selectedProfileId = id;
    this.profileNameDraft = this.selectedProfile?.name ?? '';
    this.lastActionMessage = '';
    this.importError = '';
  }

  setProfileNameDraft(value: string): void {
    this.profileNameDraft = value;
    this.lastActionMessage = '';
    this.importError = '';
  }

  setExchangeJson(value: string): void {
    this.exchangeJson = value;
    this.lastActionMessage = '';
    this.importError = '';
  }

  clearExchangeState(): void {
    this.exchangeJson = '';
    this.lastActionMessage = '';
    this.importError = '';
  }

  saveCurrentProfile(name = this.profileNameDraft): boolean {
    const trimmedName = name.trim();
    if (!trimmedName) {
      this.importError = 'Enter a profile name before saving.';
      return false;
    }

    const snapshot = this.buildCurrentSnapshot();
    const exported = this.createExport(trimmedName, snapshot);
    const nowIso = createTimestamp();
    const existingBySelected = this.selectedProfile;
    const existingByName = this.findByName(trimmedName);

    if (existingBySelected && existingBySelected.name === trimmedName) {
      this.profiles = this.profiles.map((profile) => (
        profile.id === existingBySelected.id
          ? updateSavedPersonaProfile(profile, exported, nowIso)
          : profile
      ));
      this.lastActionMessage = `Updated profile “${trimmedName}”.`;
      this.importError = '';
      this.exchangeJson = serializePersonaProfile(exported);
      this.persistToStorage();
      return true;
    }

    if (existingByName) {
      this.importError = `A profile named “${trimmedName}” already exists.`;
      return false;
    }

    const saved = createSavedPersonaProfile(exported, createProfileId(), nowIso);
    this.profiles = [saved, ...this.profiles];
    this.selectedProfileId = saved.id;
    this.profileNameDraft = saved.name;
    this.exchangeJson = serializePersonaProfile(exported);
    this.lastActionMessage = `Saved profile “${trimmedName}”.`;
    this.importError = '';
    this.persistToStorage();
    return true;
  }

  loadSelectedProfile(): boolean {
    const profile = this.selectedProfile;
    if (!profile) {
      this.importError = 'Select a saved profile to load.';
      return false;
    }

    this.applySnapshot(profile.settings);
    this.profileNameDraft = profile.name;
    this.exchangeJson = serializePersonaProfile(this.toExport(profile));
    this.lastActionMessage = `Loaded profile “${profile.name}”.`;
    this.importError = '';
    return true;
  }

  duplicateSelectedProfile(name = this.profileNameDraft): boolean {
    const profile = this.selectedProfile;
    if (!profile) {
      this.importError = 'Select a saved profile to duplicate.';
      return false;
    }

    const trimmedName = name.trim() || `${profile.name} Copy`;
    if (this.findByName(trimmedName)) {
      this.importError = `A profile named “${trimmedName}” already exists.`;
      return false;
    }

    const nowIso = createTimestamp();
    const duplicate = duplicatePersonaProfile(profile, createProfileId(), trimmedName, nowIso);
    this.profiles = [duplicate, ...this.profiles];
    this.selectedProfileId = duplicate.id;
    this.profileNameDraft = duplicate.name;
    this.exchangeJson = serializePersonaProfile(this.toExport(duplicate));
    this.lastActionMessage = `Duplicated profile as “${duplicate.name}”.`;
    this.importError = '';
    this.persistToStorage();
    return true;
  }

  renameSelectedProfile(name = this.profileNameDraft): boolean {
    const profile = this.selectedProfile;
    if (!profile) {
      this.importError = 'Select a saved profile to rename.';
      return false;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      this.importError = 'Enter a profile name before renaming.';
      return false;
    }

    if (profile.name === trimmedName) {
      this.lastActionMessage = 'Profile name is already up to date.';
      this.importError = '';
      return true;
    }

    const existingByName = this.findByName(trimmedName);
    if (existingByName && existingByName.id !== profile.id) {
      this.importError = `A profile named “${trimmedName}” already exists.`;
      return false;
    }

    const nowIso = createTimestamp();
    this.profiles = this.profiles.map((entry) => (
      entry.id === profile.id
        ? { ...entry, name: trimmedName, updatedAt: nowIso }
        : entry
    ));
    this.profileNameDraft = trimmedName;
    this.lastActionMessage = `Renamed profile to “${trimmedName}”.`;
    this.importError = '';
    this.persistToStorage();
    return true;
  }

  deleteSelectedProfile(): boolean {
    const profile = this.selectedProfile;
    if (!profile) {
      this.importError = 'Select a saved profile to delete.';
      return false;
    }

    this.profiles = this.profiles.filter((entry) => entry.id !== profile.id);
    const nextSelectedId = this.profiles[0]?.id ?? null;
    this.selectedProfileId = nextSelectedId;
    this.profileNameDraft = this.selectedProfile?.name ?? '';
    this.exchangeJson = '';
    this.lastActionMessage = `Deleted profile “${profile.name}”.`;
    this.importError = '';
    this.persistToStorage();
    return true;
  }

  exportSelectedProfile(): { fileName: string; json: string } | null {
    const profile = this.selectedProfile;
    if (!profile) {
      this.importError = 'Select a saved profile to export.';
      return null;
    }

    const exported = this.toExport(profile);
    const json = serializePersonaProfile(exported);
    this.exchangeJson = json;
    this.lastActionMessage = `Exported profile “${profile.name}”.`;
    this.importError = '';

    return {
      fileName: buildPersonaProfileExportFilename(profile.name),
      json,
    };
  }

  importProfileFromJson(json = this.exchangeJson): boolean {
    const parsed = parsePersonaProfileImport(json);
    if (!parsed.ok) {
      this.importError = parsed.error;
      return false;
    }

    const incomingName = parsed.profile.name.trim();
    const finalName = this.ensureUniqueName(incomingName);
    const exported = {
      ...parsed.profile,
      name: finalName,
    };
    const nowIso = createTimestamp();
    const saved = createSavedPersonaProfile(exported, createProfileId(), nowIso);

    this.profiles = [saved, ...this.profiles];
    this.selectedProfileId = saved.id;
    this.profileNameDraft = saved.name;
    this.exchangeJson = serializePersonaProfile(exported);
    this.lastActionMessage = finalName === incomingName
      ? `Imported profile “${finalName}”.`
      : `Imported profile as “${finalName}” to avoid a duplicate name.`;
    this.importError = '';
    this.persistToStorage();
    return true;
  }

  get selectedProfile(): SavedPersonaProfile | null {
    return this.profiles.find((profile) => profile.id === this.selectedProfileId) ?? null;
  }

  private buildCurrentSnapshot(): PersonaProfileSettingsSnapshot {
    return {
      bucketConfig: { ...this.deps.configViewModel.bucketConfig },
      currentPresetId: this.deps.configViewModel.currentPresetId,
      depth: this.deps.configViewModel.depth,
      multiPV: this.deps.configViewModel.multiPV,
      featureOptions: { ...this.deps.featureOptionsViewModel.options },
      brilliant: {
        brilliantMovesPerGame: this.deps.featureOptionsViewModel.brilliantMovesPerGame,
        brilliantAllowedPhase: this.deps.featureOptionsViewModel.brilliantAllowedPhase,
      },
      ui: {
        themeMode: this.deps.uiStateViewModel.themeMode,
        basicMode: this.deps.uiStateViewModel.basicMode,
      },
    };
  }

  private applySnapshot(snapshot: PersonaProfileSettingsSnapshot): void {
    this.deps.configViewModel.applyProfileSnapshot({
      bucketConfig: snapshot.bucketConfig,
      currentPresetId: snapshot.currentPresetId,
      depth: snapshot.depth,
      multiPV: snapshot.multiPV,
    });
    this.deps.featureOptionsViewModel.applyProfileSettings(snapshot.featureOptions, snapshot.brilliant);
    this.deps.uiStateViewModel.applyProfilePreferences(snapshot.ui);
  }

  private createExport(name: string, settings: PersonaProfileSettingsSnapshot): PersonaProfileExport {
    return {
      kind: PERSONA_PROFILE_KIND,
      version: PERSONA_PROFILE_VERSION,
      name,
      settings,
    };
  }

  private toExport(profile: SavedPersonaProfile): PersonaProfileExport {
    return {
      kind: profile.kind,
      version: profile.version,
      name: profile.name,
      settings: profile.settings,
    };
  }

  private findByName(name: string): SavedPersonaProfile | null {
    const normalizedName = name.trim().toLowerCase();
    return this.profiles.find((profile) => profile.name.trim().toLowerCase() === normalizedName) ?? null;
  }

  private ensureUniqueName(baseName: string): string {
    const trimmedBaseName = baseName.trim() || 'Imported Profile';
    if (!this.findByName(trimmedBaseName)) {
      return trimmedBaseName;
    }

    let index = 2;
    let candidate = `${trimmedBaseName} ${index}`;
    while (this.findByName(candidate)) {
      index += 1;
      candidate = `${trimmedBaseName} ${index}`;
    }

    return candidate;
  }

  private restoreFromStorage(): void {
    try {
      const saved = localStorage.getItem(PERSONA_PROFILES_STORAGE_KEY);
      if (!saved) {
        return;
      }

      const snapshot = sanitizePersonaProfileStoreSnapshot(JSON.parse(saved) as unknown);
      this.profiles = snapshot.profiles;
      this.selectedProfileId = snapshot.selectedProfileId ?? snapshot.profiles[0]?.id ?? null;
      this.profileNameDraft = this.selectedProfile?.name ?? '';
    } catch {
      // Ignore invalid saved persona profiles and continue with an empty list.
    }
  }

  private persistToStorage(): void {
    try {
      localStorage.setItem(
        PERSONA_PROFILES_STORAGE_KEY,
        JSON.stringify({
          profiles: this.profiles,
          selectedProfileId: this.selectedProfileId,
        }),
      );
    } catch {
      // Ignore localStorage failures to keep settings usable.
    }
  }
}

export const personaProfilesViewModel = new PersonaProfilesViewModel();

export { PERSONA_PROFILES_STORAGE_KEY };
