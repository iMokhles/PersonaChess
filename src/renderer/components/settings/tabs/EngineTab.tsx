import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  boardViewModel,
  configViewModel,
  featureOptionsViewModel,
  uiStateViewModel,
} from '../../../../viewmodels';
import {
  SettingRow,
  SettingsSection,
  SettingsSelect,
  SettingsSwitch,
  SettingsNumberInput,
} from '../SettingsControls';

const MULTI_PV_OPTIONS = [4, 8, 12, 16, 20].map((value) => ({
  label: `${value} candidates`,
  value: String(value),
}));

export const EngineTab: React.FC = observer(() => {
  const busy = boardViewModel.isThinking || boardViewModel.isAnalyzingMoves;

  return (
    <div className="settings-tab-content">
      <SettingsSection
        title="Core Engine Settings"
        description="Primary analysis settings for everyday play. These remain visible even in Basic Mode."
      >
        <SettingRow
          label="Analysis depth"
          description="How deep Stockfish should search before PersonaChess classifies candidate moves."
          control={(
            <SettingsNumberInput
              value={configViewModel.depth}
              onChange={(value) => configViewModel.setDepth(value)}
              min={1}
              max={30}
              disabled={busy}
            />
          )}
        />
        <SettingRow
          label="MultiPV"
          description="How many engine candidates to inspect before choosing a move."
          control={(
            <SettingsSelect
              value={String(configViewModel.multiPV)}
              onValueChange={(value) => configViewModel.setMultiPV(parseInt(value, 10))}
              options={MULTI_PV_OPTIONS}
              disabled={busy}
            />
          )}
        />
      </SettingsSection>

      {!uiStateViewModel.basicMode && (
        <SettingsSection
          title="Advanced Engine Behavior"
          description="Optional helper systems that influence repeatability, caching, or timing without changing the core chess logic."
        >
          <SettingRow
            label="Analysis cache"
            description="Reuse Stockfish analysis for the same FEN, depth, and MultiPV combination."
            hint="Speeds up repeated inspection of unchanged positions."
            control={(
              <SettingsSwitch
                checked={featureOptionsViewModel.useMoveAnalysisCache}
                onCheckedChange={(checked) => featureOptionsViewModel.setOption('useMoveAnalysisCache', checked)}
              />
            )}
          />
          <SettingRow
            label="Deterministic RNG"
            description="Use a seeded random source so the same session state reproduces the same move choices."
            hint="Helpful when testing personality distributions."
            control={(
              <SettingsSwitch
                checked={featureOptionsViewModel.useDeterministicRng}
                onCheckedChange={(checked) => featureOptionsViewModel.setOption('useDeterministicRng', checked)}
              />
            )}
          />
          <SettingRow
            label="Human delay simulation"
            description="Delay auto-play responses based on complexity and persona."
            hint="Makes automatic replies feel less instantaneous."
            control={(
              <SettingsSwitch
                checked={featureOptionsViewModel.useHumanDelaySimulation}
                onCheckedChange={(checked) => featureOptionsViewModel.setOption('useHumanDelaySimulation', checked)}
              />
            )}
          />
        </SettingsSection>
      )}
    </div>
  );
});

EngineTab.displayName = 'EngineTab';
