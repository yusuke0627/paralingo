import { ipcMain, globalShortcut, clipboard, BrowserWindow, app } from 'electron';
import path from 'path';

// Use cases
import { RunTranslationFromClipboard } from '../../application/use-cases/RunTranslationFromClipboard';
// Ports & Gateways
import { ElectronClipboardPort } from '../../infrastructure/os/ElectronClipboardPort';
import { MultiProviderTranslatorOrchestrator } from '../../infrastructure/ai/MultiProviderTranslatorOrchestrator';
import { SQLiteVocabRepository } from '../../infrastructure/db/SQLiteVocabRepository';
import { LocalFileSettingsRepository } from '../../infrastructure/os/LocalSettingsRepository';
import { ReviewItem, ReviewStatus, VocabMemo } from '../../domain/entities';

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
    const translatorGateway = new MultiProviderTranslatorOrchestrator(this.settingsRepository);

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
        
        // Show window immediately to provide feedback
        if (!this.mainWindow.isVisible()) {
          this.mainWindow.show();
          this.mainWindow.focus();
        }

        try {
          // Tell frontend we are starting
          this.mainWindow.webContents.send('translation-result', { loading: true });
          
          const result = await this.translationUseCase.execute();
          this.mainWindow.webContents.send('translation-result', { pairs: result });
        } catch (error: any) {
          console.error('Translation error:', error);
          this.mainWindow.webContents.send('translation-result', { ok: false, error: error.message });
          // Ensure window is visible even on error
          if (!this.mainWindow.isVisible()) {
            this.mainWindow.show();
          }
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

    ipcMain.handle('save-vocab', async (_, payloadOrEn: any, jaMaybe?: string) => {
      try {
        const en = typeof payloadOrEn === 'object' ? payloadOrEn?.en : payloadOrEn;
        const ja = typeof payloadOrEn === 'object' ? payloadOrEn?.ja : jaMaybe;
        if (!en || !ja) {
          throw new Error('Invalid save-vocab payload');
        }

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

    ipcMain.handle('save-review-item', async (_, payload: any) => {
      try {
        const reason = payload?.reason === 'unknown' ? 'unknown' : 'later';
        const item: ReviewItem = {
          en: payload?.en,
          ja: payload?.ja,
          posTokens: Array.isArray(payload?.posTokens) ? payload.posTokens : undefined,
          reason,
          status: 'pending',
          createdAt: new Date(),
        };
        if (!item.en || !item.ja) {
          throw new Error('Invalid review payload');
        }
        await this.vocabRepository.saveReview(item);
        return { ok: true };
      } catch (error: any) {
        return { ok: false, error: error.message };
      }
    });

    ipcMain.handle('list-review-items', async (_, status?: ReviewStatus) => {
      try {
        const items = await this.vocabRepository.listReviews(status);
        return { ok: true, items };
      } catch (error: any) {
        return { ok: false, error: error.message };
      }
    });

    ipcMain.handle('set-review-item-status', async (_, payload: any) => {
      try {
        if (!payload?.id) throw new Error('Missing review id');
        const status: ReviewStatus = payload.status === 'resolved' ? 'resolved' : 'pending';
        await this.vocabRepository.updateReviewStatus(payload.id, status);
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
