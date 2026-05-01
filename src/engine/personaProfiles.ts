import {
  BrilliantAllowedPhase,
  BrilliantMovesPerGame,
  FeatureOptions,
  mergeFeatureOptions,
} from './featureOptions';
import {
  BucketConfig,
  DEFAULT_BUCKET_CONFIG,
  MoveQualityPresetId,
  MOVE_QUALITY_PRESETS,
} from './types';

export type PersonaProfileThemeMode = 'dark' | 'light' | 'minimal' | 'persona';

export const PERSONA_PROFILE_KIND = 'personachess.persona-profile';
export const PERSONA_PROFILE_VERSION = 1;

export interface PersonaProfileSettingsSnapshot {
  bucketConfig: BucketConfig;
  currentPresetId: MoveQualityPresetId | null;
  depth: number;
  multiPV: number;
  featureOptions: FeatureOptions;
  brilliant: {
    brilliantMovesPerGame: BrilliantMovesPerGame;
    brilliantAllowedPhase: BrilliantAllowedPhase;
  };
  ui: {
    themeMode: PersonaProfileThemeMode;
    basicMode: boolean;
  };
}

export interface PersonaProfileExport {
  kind: typeof PERSONA_PROFILE_KIND;
  version: typeof PERSONA_PROFILE_VERSION;
  name: string;
  settings: PersonaProfileSettingsSnapshot;
}

export interface SavedPersonaProfile extends PersonaProfileExport {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaProfileStoreSnapshot {
  profiles: SavedPersonaProfile[];
  selectedProfileId: string | null;
}

const VALID_PRESET_IDS = new Set<MoveQualityPresetId>(MOVE_QUALITY_PRESETS.map((preset) => preset.id));
const VALID_THEME_MODES = new Set<PersonaProfileThemeMode>(['dark', 'light', 'minimal', 'persona']);
const VALID_BRILLIANT_PHASES = new Set<BrilliantAllowedPhase>(['opening', 'middlegame', 'endgame', 'any']);
const VALID_BRILLIANT_BUDGETS = new Set<BrilliantMovesPerGame>([0, 1, 2, 3, 4]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function clampInteger(value: unknown, minimum: number, maximum: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

function sanitizeBucketConfig(value: unknown): BucketConfig {
  if (!isRecord(value)) {
    return { ...DEFAULT_BUCKET_CONFIG };
  }

  return {
    best: clampInteger(value.best, 0, 100, DEFAULT_BUCKET_CONFIG.best),
    great: clampInteger(value.great, 0, 100, DEFAULT_BUCKET_CONFIG.great),
    excellent: clampInteger(value.excellent, 0, 100, DEFAULT_BUCKET_CONFIG.excellent),
    good: clampInteger(value.good, 0, 100, DEFAULT_BUCKET_CONFIG.good),
    inaccuracy: clampInteger(value.inaccuracy, 0, 100, DEFAULT_BUCKET_CONFIG.inaccuracy),
    mistake: clampInteger(value.mistake, 0, 100, DEFAULT_BUCKET_CONFIG.mistake),
    blunder: clampInteger(value.blunder, 0, 100, DEFAULT_BUCKET_CONFIG.blunder),
  };
}

function sanitizePresetId(value: unknown): MoveQualityPresetId | null {
  if (value === null) {
    return null;
  }

  return typeof value === 'string' && VALID_PRESET_IDS.has(value as MoveQualityPresetId)
    ? (value as MoveQualityPresetId)
    : 'medium';
}

function sanitizeThemeMode(value: unknown): PersonaProfileThemeMode {
  return typeof value === 'string' && VALID_THEME_MODES.has(value as PersonaProfileThemeMode)
    ? (value as PersonaProfileThemeMode)
    : 'dark';
}

function sanitizeBrilliantMovesPerGame(value: unknown): BrilliantMovesPerGame {
  return typeof value === 'number' && VALID_BRILLIANT_BUDGETS.has(value as BrilliantMovesPerGame)
    ? (value as BrilliantMovesPerGame)
    : 0;
}

function sanitizeBrilliantAllowedPhase(value: unknown): BrilliantAllowedPhase {
  return typeof value === 'string' && VALID_BRILLIANT_PHASES.has(value as BrilliantAllowedPhase)
    ? (value as BrilliantAllowedPhase)
    : 'any';
}

export function sanitizePersonaProfileSettingsSnapshot(value: unknown): PersonaProfileSettingsSnapshot {
  const record = isRecord(value) ? value : {};
  const brilliant = isRecord(record.brilliant) ? record.brilliant : {};
  const ui = isRecord(record.ui) ? record.ui : {};

  return {
    bucketConfig: sanitizeBucketConfig(record.bucketConfig),
    currentPresetId: sanitizePresetId(record.currentPresetId),
    depth: clampInteger(record.depth, 1, 30, 8),
    multiPV: clampInteger(record.multiPV, 1, 20, 12),
    featureOptions: mergeFeatureOptions(isRecord(record.featureOptions) ? (record.featureOptions as Partial<FeatureOptions>) : undefined),
    brilliant: {
      brilliantMovesPerGame: sanitizeBrilliantMovesPerGame(brilliant.brilliantMovesPerGame),
      brilliantAllowedPhase: sanitizeBrilliantAllowedPhase(brilliant.brilliantAllowedPhase),
    },
    ui: {
      themeMode: sanitizeThemeMode(ui.themeMode),
      basicMode: typeof ui.basicMode === 'boolean' ? ui.basicMode : true,
    },
  };
}

export function sanitizePersonaProfileExport(
  value: unknown,
  fallbackName = 'Imported Profile',
): PersonaProfileExport | null {
  if (!isRecord(value)) {
    return null;
  }

  if (value.kind !== PERSONA_PROFILE_KIND || value.version !== PERSONA_PROFILE_VERSION) {
    return null;
  }

  const name = typeof value.name === 'string' && value.name.trim() ? value.name.trim() : fallbackName;

  return {
    kind: PERSONA_PROFILE_KIND,
    version: PERSONA_PROFILE_VERSION,
    name,
    settings: sanitizePersonaProfileSettingsSnapshot(value.settings),
  };
}

export function parsePersonaProfileImport(
  json: string,
): { ok: true; profile: PersonaProfileExport } | { ok: false; error: string } {
  if (!json.trim()) {
    return {
      ok: false,
      error: 'Import JSON is empty.',
    };
  }

  try {
    const parsed = JSON.parse(json) as unknown;
    const profile = sanitizePersonaProfileExport(parsed);

    if (!profile) {
      return {
        ok: false,
        error: 'Imported JSON does not match the PersonaChess profile schema.',
      };
    }

    return { ok: true, profile };
  } catch {
    return {
      ok: false,
      error: 'Imported JSON could not be parsed.',
    };
  }
}

export function serializePersonaProfile(profile: PersonaProfileExport): string {
  return JSON.stringify(profile, null, 2);
}

export function createSavedPersonaProfile(
  profile: PersonaProfileExport,
  id: string,
  nowIso: string,
): SavedPersonaProfile {
  return {
    ...profile,
    id,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function updateSavedPersonaProfile(
  profile: SavedPersonaProfile,
  next: PersonaProfileExport,
  nowIso: string,
): SavedPersonaProfile {
  return {
    ...profile,
    ...next,
    id: profile.id,
    createdAt: profile.createdAt,
    updatedAt: nowIso,
  };
}

export function duplicatePersonaProfile(
  profile: SavedPersonaProfile,
  id: string,
  name: string,
  nowIso: string,
): SavedPersonaProfile {
  return {
    ...profile,
    id,
    name,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function sanitizeSavedPersonaProfile(value: unknown): SavedPersonaProfile | null {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim()) {
    return null;
  }

  const exported = sanitizePersonaProfileExport(value);
  if (!exported) {
    return null;
  }

  const createdAt = typeof value.createdAt === 'string' && value.createdAt.trim()
    ? value.createdAt
    : new Date(0).toISOString();
  const updatedAt = typeof value.updatedAt === 'string' && value.updatedAt.trim()
    ? value.updatedAt
    : createdAt;

  return {
    ...exported,
    id: value.id,
    createdAt,
    updatedAt,
  };
}

export function sanitizePersonaProfileStoreSnapshot(value: unknown): PersonaProfileStoreSnapshot {
  if (!isRecord(value)) {
    return {
      profiles: [],
      selectedProfileId: null,
    };
  }

  const profiles = Array.isArray(value.profiles)
    ? value.profiles
      .map((entry) => sanitizeSavedPersonaProfile(entry))
      .filter((entry): entry is SavedPersonaProfile => entry !== null)
    : [];
  const selectedProfileId = typeof value.selectedProfileId === 'string' ? value.selectedProfileId : null;

  return {
    profiles,
    selectedProfileId: profiles.some((profile) => profile.id === selectedProfileId) ? selectedProfileId : null,
  };
}

export function buildPersonaProfileExportFilename(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'persona-profile';

  return `personachess-${slug}.json`;
}
