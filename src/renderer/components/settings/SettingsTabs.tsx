import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { observer } from 'mobx-react-lite';
import { debugViewModel, uiStateViewModel } from '../../../viewmodels';
import { SettingsTabId } from '../../../viewmodels/UiStateViewModel';
import { AboutTab } from './tabs/AboutTab';
import { AdvancedTab } from './tabs/AdvancedTab';
import { BrilliantTab } from './tabs/BrilliantTab';
import { DebugTab } from './tabs/DebugTab';
import { EngineTab } from './tabs/EngineTab';
import { GeneralTab } from './tabs/GeneralTab';
import { PersonalityTab } from './tabs/PersonalityTab';

const ALL_TABS = [
  { id: 'general', label: 'General', component: GeneralTab, advancedOnly: false, devOnly: false },
  { id: 'engine', label: 'Engine', component: EngineTab, advancedOnly: false, devOnly: false },
  { id: 'personality', label: 'Personality', component: PersonalityTab, advancedOnly: false, devOnly: false },
  { id: 'brilliant', label: 'Brilliant', component: BrilliantTab, advancedOnly: true, devOnly: false },
  { id: 'advanced', label: 'Advanced', component: AdvancedTab, advancedOnly: true, devOnly: false },
  { id: 'debug', label: 'Debug', component: DebugTab, advancedOnly: true, devOnly: true },
  { id: 'about', label: 'About', component: AboutTab, advancedOnly: false, devOnly: false },
] as const;

export const SettingsTabs: React.FC = observer(() => {
  const availableTabs = ALL_TABS.filter((tab) => {
    if (tab.advancedOnly && uiStateViewModel.basicMode) {
      return false;
    }

    if (tab.devOnly && !debugViewModel.showDebugControls) {
      return false;
    }

    return true;
  });

  const fallbackTab = availableTabs.some((tab) => tab.id === uiStateViewModel.selectedSettingsTab)
    ? uiStateViewModel.selectedSettingsTab
    : availableTabs[0]?.id ?? 'general';

  return (
    <Tabs.Root
      className="settings-tabs-root"
      value={fallbackTab}
      onValueChange={(value) => uiStateViewModel.setSelectedSettingsTab(value as SettingsTabId)}
    >
      <Tabs.List className="settings-tabs-list" aria-label="PersonaChess settings sections">
        {availableTabs.map((tab) => (
          <Tabs.Trigger key={tab.id} value={tab.id} className="settings-tab-trigger">
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div className="settings-tabs-panels">
        {availableTabs.map((tab) => {
          const Component = tab.component;

          return (
            <Tabs.Content key={tab.id} value={tab.id} className="settings-tab-panel">
              <Component />
            </Tabs.Content>
          );
        })}
      </div>
    </Tabs.Root>
  );
});

SettingsTabs.displayName = 'SettingsTabs';
