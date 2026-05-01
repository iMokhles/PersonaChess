import React from 'react';
import { observer } from 'mobx-react-lite';
import packageJson from '../../../../../package.json';
import { engineViewModel } from '../../../../viewmodels';
import { SettingsSection } from '../SettingsControls';

export const AboutTab: React.FC = observer(() => (
  <div className="settings-tab-content">
    <SettingsSection
      title="PersonaChess"
      description="A desktop chess experience built around personality-weighted Stockfish move selection."
    >
      <div className="settings-kv-list">
        <div><span>App version</span><code>{packageJson.version}</code></div>
        <div><span>Product name</span><code>{packageJson.productName}</code></div>
        <div><span>Renderer mode</span><code>{import.meta.env.MODE}</code></div>
      </div>
    </SettingsSection>

    <SettingsSection
      title="Engine"
      description="Current engine packaging details included with this desktop build."
    >
      <div className="settings-kv-list">
        <div><span>Engine package</span><code>stockfish.js {packageJson.dependencies['stockfish.js']}</code></div>
        <div><span>Engine ready</span><code>{engineViewModel.isInitialized ? 'Yes' : 'No'}</code></div>
        <div><span>Frameworks</span><code>Electron • React • MobX • TypeScript</code></div>
      </div>
    </SettingsSection>
  </div>
));

AboutTab.displayName = 'AboutTab';

