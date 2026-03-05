import { VocabMemo } from "../domain/entities";

export interface ParaLingoAPI {
  runTranslationFromClipboard: () => Promise<{ ok: boolean; sentences?: any[]; error?: string }>;
  saveVocab: (memo: VocabMemo) => Promise<{ ok: boolean; error?: string }>;
  onTranslationResult: (callback: (result: any) => void) => void;
}

declare global {
  interface Window {
    paralingo: ParaLingoAPI;
  }
}
