import React from 'react';
import { observer } from 'mobx-react-lite';
import { analysisCache } from '../../../../engine/analysisCache';
import { boardViewModel, debugViewModel, engineViewModel } from '../../../../viewmodels';
import {
  SettingRow,
  SettingsSection,
  SettingsSwitch,
} from '../SettingsControls';

export const DebugTab: React.FC = observer(() => (
  <div className="settings-tab-content">
    <SettingsSection
      title="Debug Controls"
      description="Development-only visibility for logging and runtime inspection."
    >
      <SettingRow
        label="Verbose debug logging"
        description="Toggle additional renderer and engine logs while testing UI and state transitions."
        control={(
          <SettingsSwitch
            checked={debugViewModel.debugLoggingEnabled}
            onCheckedChange={(checked) => debugViewModel.setDebugLoggingEnabled(checked)}
          />
        )}
      />
    </SettingsSection>

    <SettingsSection
      title="Runtime Snapshot"
      description="Quick internal state references that are useful during iteration."
    >
      <div className="settings-kv-list">
        <div><span>Session</span><code>{boardViewModel.debugSessionId}</code></div>
        <div><span>Engine status</span><code>{engineViewModel.analysisStatusLabel}</code></div>
        <div><span>Analysis cache entries</span><code>{analysisCache.size}</code></div>
        <div><span>Current FEN</span><code>{boardViewModel.fen}</code></div>
      </div>
    </SettingsSection>
  </div>
));

DebugTab.displayName = 'DebugTab';

