import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('paralingo', {
  runTranslationFromClipboard: () => ipcRenderer.invoke('run-translation'),
  saveVocab: (en: string, ja: string) => ipcRenderer.invoke('save-vocab', { en, ja }),
  onTranslationResult: (callback: any) => ipcRenderer.on('translation-result', (_event, value) => callback(value)),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
});

export interface ParaLingoAPI {
  runTranslationFromClipboard: () => Promise<{ ok: boolean; pairs?: any[]; error?: string }>;
  saveVocab: (en: string, ja: string) => Promise<{ ok: boolean; error?: string }>;
  onTranslationResult: (callback: (result: any) => void) => void;
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<{ ok: boolean; error?: string }>;
}

declare global {
  interface Window {
    paralingo: ParaLingoAPI;
  }
}
