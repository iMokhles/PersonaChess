import React from 'react';
import { observer } from 'mobx-react-lite';
import { MOVE_QUALITY_PRESETS, MoveBucket, BUCKET_COLORS, BUCKET_LABELS } from '../../../../engine/types';
import {
  boardViewModel,
  configViewModel,
  featureOptionsViewModel,
  personaProfilesViewModel,
  uiStateViewModel,
} from '../../../../viewmodels';
import {
  SettingRow,
  SettingsButton,
  SettingsButtonGroup,
  SettingsSection,
  SettingsSelect,
  SettingsSwitch,
  SettingsTextarea,
  SettingsTextInput,
} from '../SettingsControls';

const BUCKETS: MoveBucket[] = ['best', 'great', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder'];

export const PersonalityTab: React.FC = observer(() => {
  const busy = boardViewModel.isThinking || boardViewModel.isAnalyzingMoves;
  const selectedProfile = personaProfilesViewModel.selectedProfile;
  const profileOptions = personaProfilesViewModel.profiles.map((profile) => ({
    label: profile.name,
    value: profile.id,
  }));

  const handleExport = (): void => {
    const exported = personaProfilesViewModel.exportSelectedProfile();
    if (!exported) {
      return;
    }

    const blob = new Blob([exported.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exported.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="settings-tab-content">
      <SettingsSection
        title="Persona Presets"
        description="Start with a preset, then optionally fine-tune the move distribution when Advanced Mode is enabled."
      >
        <SettingsButtonGroup>
          {MOVE_QUALITY_PRESETS.map((preset) => (
            <SettingsButton
              key={preset.id}
              active={configViewModel.currentPresetId === preset.id}
              disabled={busy}
              onClick={() => configViewModel.applyPreset(preset.id)}
            >
              {preset.label}
            </SettingsButton>
          ))}
        </SettingsButtonGroup>
        <p className="settings-inline-note">
          {configViewModel.currentPresetId
            ? MOVE_QUALITY_PRESETS.find((preset) => preset.id === configViewModel.currentPresetId)?.description
            : 'Custom bucket distribution in use.'}
        </p>
      </SettingsSection>

      <SettingsSection
        title="Saved Profiles"
        description="Capture a full personality setup, then reload or share it later without touching the underlying engine rules."
      >
        <SettingRow
          label="Saved profiles"
          description="Select a profile to load, export, rename, duplicate, or delete."
          control={(
            <SettingsSelect
              value={personaProfilesViewModel.selectedProfileId ?? ''}
              onValueChange={(value) => personaProfilesViewModel.setSelectedProfileId(value || null)}
              options={profileOptions}
              placeholder={personaProfilesViewModel.profiles.length ? 'Select profile' : 'No saved profiles yet'}
              disabled={!personaProfilesViewModel.profiles.length || busy}
            />
          )}
        />
        <SettingRow
          label="Profile name"
          description="Used when saving the current setup or renaming and duplicating an existing profile."
          control={(
            <SettingsTextInput
              value={personaProfilesViewModel.profileNameDraft}
              onChange={(value) => personaProfilesViewModel.setProfileNameDraft(value)}
              placeholder="Example: Sharp Tactician"
              disabled={busy}
            />
          )}
        />
        <SettingsButtonGroup>
          <SettingsButton disabled={busy} onClick={() => personaProfilesViewModel.saveCurrentProfile()}>
            Save Current
          </SettingsButton>
          <SettingsButton disabled={busy || !selectedProfile} onClick={() => personaProfilesViewModel.loadSelectedProfile()}>
            Load
          </SettingsButton>
          <SettingsButton disabled={busy || !selectedProfile} onClick={() => personaProfilesViewModel.duplicateSelectedProfile()}>
            Duplicate
          </SettingsButton>
          <SettingsButton disabled={busy || !selectedProfile} onClick={() => personaProfilesViewModel.renameSelectedProfile()}>
            Rename
          </SettingsButton>
          <SettingsButton disabled={busy || !selectedProfile} onClick={() => personaProfilesViewModel.deleteSelectedProfile()}>
            Delete
          </SettingsButton>
          <SettingsButton disabled={busy || !selectedProfile} onClick={handleExport}>
            Export
          </SettingsButton>
          <SettingsButton disabled={busy} onClick={() => personaProfilesViewModel.importProfileFromJson()}>
            Import
          </SettingsButton>
        </SettingsButtonGroup>
        <div className="settings-profile-exchange">
          <div className="settings-profile-exchange-header">
            <strong>Profile JSON</strong>
            <span>Paste JSON here to import, or export a selected profile for sharing.</span>
          </div>
          <SettingsTextarea
            value={personaProfilesViewModel.exchangeJson}
            onChange={(value) => personaProfilesViewModel.setExchangeJson(value)}
            placeholder="Exported PersonaChess profile JSON appears here."
            rows={8}
            disabled={busy}
          />
        </div>
        {(personaProfilesViewModel.lastActionMessage || personaProfilesViewModel.importError) && (
          <div className={`settings-profile-feedback ${personaProfilesViewModel.importError ? 'error' : 'success'}`}>
            {personaProfilesViewModel.importError || personaProfilesViewModel.lastActionMessage}
          </div>
        )}
      </SettingsSection>

      {!uiStateViewModel.basicMode && (
        <>
          <SettingsSection
            title="Bucket Distribution"
            description="Fine-tune how often PersonaChess reaches into each move-quality bucket."
          >
            <div className="settings-slider-list">
              {BUCKETS.map((bucket) => (
                <label key={bucket} className="settings-slider-row">
                  <div className="settings-slider-copy">
                    <span className="settings-slider-label">
                      <span className="settings-slider-dot" style={{ backgroundColor: BUCKET_COLORS[bucket] }} />
                      {BUCKET_LABELS[bucket]}
                    </span>
                    <strong>{configViewModel.bucketConfig[bucket]}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={configViewModel.bucketConfig[bucket]}
                    onChange={(event) => configViewModel.setBucketValue(bucket, parseInt(event.target.value, 10))}
                    disabled={busy}
                  />
                </label>
              ))}
            </div>
            <div className={`settings-total-banner ${configViewModel.isValid ? 'valid' : 'invalid'}`}>
              Total: {configViewModel.totalPercentage}% {configViewModel.isValid ? '• balanced' : '• normalize recommended'}
            </div>
            <SettingsButtonGroup>
              <SettingsButton disabled={busy || configViewModel.isValid} onClick={() => configViewModel.normalizeConfig()}>
                Normalize to 100%
              </SettingsButton>
              <SettingsButton disabled={busy} onClick={() => configViewModel.resetToDefaults()}>
                Reset Distribution
              </SettingsButton>
            </SettingsButtonGroup>
          </SettingsSection>

          <SettingsSection
            title="Behavior Layers"
            description="Optional weighting systems that sit on top of the core quality buckets."
          >
            <SettingRow
              label="Position complexity"
              description="Slightly adjust quality probabilities based on how sharp or quiet the current position looks."
              control={(
                <SettingsSwitch
                  checked={featureOptionsViewModel.usePositionComplexity}
                  onCheckedChange={(checked) => featureOptionsViewModel.setOption('usePositionComplexity', checked)}
                />
              )}
            />
            <SettingRow
              label="Persona behavior bias"
              description="Apply lightweight aggressive or safe preferences when choosing among already-legal candidates."
              control={(
                <SettingsSwitch
                  checked={featureOptionsViewModel.usePersonaBehaviorBias}
                  onCheckedChange={(checked) => featureOptionsViewModel.setOption('usePersonaBehaviorBias', checked)}
                />
              )}
            />
          </SettingsSection>
        </>
      )}
    </div>
  );
});

PersonalityTab.displayName = 'PersonalityTab';
