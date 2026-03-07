import { contextBridge, ipcRenderer } from 'electron';
import { PosToken, ReviewReason, ReviewStatus } from '../../domain/entities';

contextBridge.exposeInMainWorld('paralingo', {
  runTranslationFromClipboard: () => ipcRenderer.invoke('run-translation'),
  saveVocab: (en: string, ja: string) => ipcRenderer.invoke('save-vocab', { en, ja }),
  saveReviewItem: (payload: { en: string; ja: string; posTokens?: PosToken[]; reason: ReviewReason }) => ipcRenderer.invoke('save-review-item', payload),
  listReviewItems: (status?: ReviewStatus) => ipcRenderer.invoke('list-review-items', status),
  setReviewItemStatus: (payload: { id: string; status: ReviewStatus }) => ipcRenderer.invoke('set-review-item-status', payload),
  onTranslationResult: (callback: any) => ipcRenderer.on('translation-result', (_event, value) => callback(value)),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
});

export interface ParaLingoAPI {
  runTranslationFromClipboard: () => Promise<{ ok: boolean; pairs?: any[]; error?: string }>;
  saveVocab: (en: string, ja: string) => Promise<{ ok: boolean; error?: string }>;
  saveReviewItem: (payload: { en: string; ja: string; posTokens?: PosToken[]; reason: ReviewReason }) => Promise<{ ok: boolean; error?: string }>;
  listReviewItems: (status?: ReviewStatus) => Promise<{ ok: boolean; items?: any[]; error?: string }>;
  setReviewItemStatus: (payload: { id: string; status: ReviewStatus }) => Promise<{ ok: boolean; error?: string }>;
  onTranslationResult: (callback: (result: any) => void) => void;
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<{ ok: boolean; error?: string }>;
}

declare global {
  interface Window {
    paralingo: ParaLingoAPI;
  }
}
