import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { observer } from 'mobx-react-lite';
import { debugViewModel, uiStateViewModel } from '../../../viewmodels';
import { SettingsSwitch } from './SettingsControls';
import { SettingsTabs } from './SettingsTabs';
import './SettingsModal.css';

export const SettingsModal: React.FC = observer(() => (
  <Tooltip.Provider>
    <Dialog.Root open={uiStateViewModel.settingsOpen} onOpenChange={(open) => uiStateViewModel.setSettingsOpen(open)}>
      <Dialog.Portal>
        <Dialog.Overlay className="pc-overlay" />
        <Dialog.Content className="pc-dialog settings-modal">
          <div className="settings-modal-header">
            <div>
              <Dialog.Title className="pc-dialog-title">Settings</Dialog.Title>
              <Dialog.Description className="pc-dialog-description">
                Keep the main window focused on play while the full personality toolkit lives here.
              </Dialog.Description>
            </div>

            <div className="settings-modal-header-actions">
              <label className="settings-modal-mode-toggle">
                <div>
                  <span>Basic Mode</span>
                  <small>{uiStateViewModel.basicMode ? 'Common controls only' : 'All advanced tabs visible'}</small>
                </div>
                <SettingsSwitch
                  checked={uiStateViewModel.basicMode}
                  onCheckedChange={(checked) => uiStateViewModel.setBasicMode(checked)}
                />
              </label>

              {debugViewModel.showDebugControls && (
                <div className="settings-modal-dev-badge">Development</div>
              )}
            </div>
          </div>

          <SettingsTabs />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </Tooltip.Provider>
));

SettingsModal.displayName = 'SettingsModal';

