import React from 'react';
import { observer } from 'mobx-react-lite';
import { boardViewModel, featureOptionsViewModel } from '../../../../viewmodels';
import {
  SettingRow,
  SettingsSection,
  SettingsSelect,
  SettingsSwitch,
} from '../SettingsControls';

const ARROW_SIDE_OPTIONS = [
  { label: 'Current turn', value: 'current' },
  { label: 'Player side', value: 'player' },
  { label: 'Engine side', value: 'engine' },
];

export const AdvancedTab: React.FC = observer(() => (
  <div className="settings-tab-content">
    <SettingsSection
      title="Persistence And Shell"
      description="Advanced desktop options that control how PersonaChess behaves across launches."
    >
      <SettingRow
        label="Persist engine configuration"
        description="Store board/session state, engine settings, feature options, and brilliant tracking locally."
        control={(
          <SettingsSwitch
            checked={featureOptionsViewModel.persistEngineConfig}
            onCheckedChange={(checked) => featureOptionsViewModel.setOption('persistEngineConfig', checked)}
          />
        )}
      />
      <SettingRow
        label="Development-only DevTools"
        description="Keep Chromium DevTools constrained to development workflows."
        control={(
          <SettingsSwitch
            checked={featureOptionsViewModel.securityDevToolsOnly}
            onCheckedChange={(checked) => featureOptionsViewModel.setOption('securityDevToolsOnly', checked)}
          />
        )}
      />
    </SettingsSection>

    <SettingsSection
      title="Move Classification"
      description="Feature flags that shape supporting UI analysis while preserving the underlying engine behavior."
    >
      <SettingRow
        label="Improved move classification"
        description="Keep unknown moves distinct and use smarter fallback selection when a preferred bucket is empty."
        control={(
          <SettingsSwitch
            checked={featureOptionsViewModel.useImprovedMoveClassification}
            onCheckedChange={(checked) => featureOptionsViewModel.setOption('useImprovedMoveClassification', checked)}
          />
        )}
      />
      <SettingRow
        label="Arrow analysis side"
        description="Choose which side's moves are emphasized when arrows are enabled."
        control={(
          <SettingsSelect
            value={boardViewModel.showArrowsForSide}
            onValueChange={(value) => boardViewModel.setShowArrowsForSide(value as 'current' | 'player' | 'engine')}
            options={ARROW_SIDE_OPTIONS}
          />
        )}
      />
    </SettingsSection>
  </div>
));

AdvancedTab.displayName = 'AdvancedTab';

