import { contextBridge, ipcRenderer } from 'electron';
import type { FeatureOptions } from './engine/featureOptions';

contextBridge.exposeInMainWorld('personaChessBridge', {
  syncFeatureOptions: (options: FeatureOptions) => {
    ipcRenderer.send('feature-options:sync', options);
  },
} as const);
