import { ipcMain, globalShortcut, clipboard, BrowserWindow, app } from 'electron';
import path from 'path';

// Use cases
import { RunTranslationFromClipboard } from '../../application/use-cases/RunTranslationFromClipboard';
// Ports & Gateways
import { ElectronClipboardPort } from '../../infrastructure/os/ElectronClipboardPort';
import { GeminiTranslatorGateway } from '../../infrastructure/ai/GeminiTranslatorGateway';
import { SQLiteVocabRepository } from '../../infrastructure/db/SQLiteVocabRepository';
import { LocalFileSettingsRepository } from '../../infrastructure/os/LocalSettingsRepository';
import { VocabMemo } from '../../domain/entities';

export class ElectronMainInterface {
  private translationUseCase: RunTranslationFromClipboard;
  private settingsRepository: LocalFileSettingsRepository;
  private vocabRepository: SQLiteVocabRepository;

  constructor(private mainWindow: BrowserWindow) {
    const userDataPath = app.getPath('userData');
    
    // Dependencies
    this.settingsRepository = new LocalFileSettingsRepository(userDataPath);
    this.vocabRepository = new SQLiteVocabRepository(path.join(userDataPath, 'paralingo.sqlite'));
    const clipboardPort = new ElectronClipboardPort(clipboard);
    const translatorGateway = new GeminiTranslatorGateway(this.settingsRepository);

    // Use Case definition
    this.translationUseCase = new RunTranslationFromClipboard(clipboardPort, translatorGateway);
  }

  async setup() {
    const settings = await this.settingsRepository.getSettings();
    const shortcutKey = settings.globalShortcut || 'CommandOrControl+Shift+T';

    // 1. Global Shortcut registration
    try {
      const ret = globalShortcut.register(shortcutKey, async () => {
        console.log(`Global shortcut triggered: ${shortcutKey}`);
        try {
          const result = await this.translationUseCase.execute();
          this.mainWindow.webContents.send('translation-result', { pairs: result });
          if (!this.mainWindow.isVisible()) {
            this.mainWindow.show();
          }
        } catch (error: any) {
          this.mainWindow.webContents.send('translation:result', { ok: false, error: error.message });
        }
      });

      if (!ret) {
        console.warn('Registration failed for shortcut:', shortcutKey);
      }
    } catch (e) {
      console.error('Failed to register shortcut', e);
    }

    // 2. IPC handlers for Frontend
    ipcMain.handle('run-translation', async () => {
      try {
        const result = await this.translationUseCase.execute();
        return { ok: true, pairs: result };
      } catch (error: any) {
        return { ok: false, error: error.message };
      }
    });

    ipcMain.handle('save-vocab', async (_, en: string, ja: string) => {
      try {
        // Create a basic VocabMemo
        const memo: VocabMemo = {
          term: en,
          translation: [ja],
          content: [], // Context will be added later if needed
          createdAt: new Date()
        };
        await this.vocabRepository.save(memo);
        return { ok: true };
      } catch (error: any) {
        return { ok: false, error: error.message };
      }
    });

    ipcMain.handle('get-settings', async () => {
      return await this.settingsRepository.getSettings();
    });

    ipcMain.handle('save-settings', async (_, settings: any) => {
      try {
        await this.settingsRepository.saveSettings(settings);
        return { ok: true };
      } catch (error: any) {
        return { ok: false, error: error.message };
      }
    });
    
    // Additional IPC handlers for React to fetch settings, list vocab, etc. can go here
  }

  cleanup() {
    globalShortcut.unregisterAll();
  }
}
