import React from 'react';
import { observer } from 'mobx-react-lite';
import { featureOptionsViewModel } from '../../../../viewmodels';
import {
  SettingRow,
  SettingsSection,
  SettingsSelect,
  SettingsSwitch,
} from '../SettingsControls';

const BRILLIANT_MOVE_OPTIONS = [0, 1, 2, 3, 4].map((value) => ({
  label: `${value}`,
  value: String(value),
}));

const BRILLIANT_PHASE_OPTIONS = [
  { label: 'Opening', value: 'opening' },
  { label: 'Middlegame', value: 'middlegame' },
  { label: 'Endgame', value: 'endgame' },
  { label: 'Any phase', value: 'any' },
];

export const BrilliantTab: React.FC = observer(() => (
  <div className="settings-tab-content">
    <SettingsSection
      title="Brilliant Move Budget"
      description="Reserve a tactical budget of standout moves per game while keeping the rest of the engine behavior unchanged."
    >
      <SettingRow
        label="Enable brilliant budget"
        description="Allow PersonaChess to spend a limited number of specially selected tactical moves."
        control={(
          <SettingsSwitch
            checked={featureOptionsViewModel.useBrilliantMoveBudget}
            onCheckedChange={(checked) => featureOptionsViewModel.setOption('useBrilliantMoveBudget', checked)}
          />
        )}
      />
      <SettingRow
        label="Brilliant moves per game"
        description="Fixed budget available to the current game session."
        control={(
          <SettingsSelect
            value={String(featureOptionsViewModel.brilliantMovesPerGame)}
            onValueChange={(value) => featureOptionsViewModel.setBrilliantMovesPerGame(parseInt(value, 10) as 0 | 1 | 2 | 3 | 4)}
            options={BRILLIANT_MOVE_OPTIONS}
            disabled={!featureOptionsViewModel.useBrilliantMoveBudget}
          />
        )}
      />
      <SettingRow
        label="Allowed phase"
        description="Limit brilliant moves to a specific part of the game."
        control={(
          <SettingsSelect
            value={featureOptionsViewModel.brilliantAllowedPhase}
            onValueChange={(value) => featureOptionsViewModel.setBrilliantAllowedPhase(value as 'opening' | 'middlegame' | 'endgame' | 'any')}
            options={BRILLIANT_PHASE_OPTIONS}
            disabled={!featureOptionsViewModel.useBrilliantMoveBudget}
          />
        )}
      />
      <div className="settings-inline-note">
        Brilliant used: {featureOptionsViewModel.brilliantUsedCount} / {featureOptionsViewModel.brilliantMovesPerGame}
      </div>
    </SettingsSection>
  </div>
));

BrilliantTab.displayName = 'BrilliantTab';

