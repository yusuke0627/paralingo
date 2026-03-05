import { ipcMain, globalShortcut, clipboard, BrowserWindow } from 'electron';
import { RunTranslationFromClipboard } from '../../application/use-cases/RunTranslationFromClipboard';
import { ElectronClipboardPort } from '../../infrastructure/os/ElectronClipboardPort';
import { MockTranslatorGateway } from '../../infrastructure/ai/MockTranslatorGateway';

export class ElectronMainInterface {
  private translationUseCase: RunTranslationFromClipboard;

  constructor(private mainWindow: BrowserWindow) {
    const clipboardPort = new ElectronClipboardPort(clipboard);
    const translatorGateway = new MockTranslatorGateway();
    this.translationUseCase = new RunTranslationFromClipboard(clipboardPort, translatorGateway);
  }

  setup() {
    // 1. Global Shortcut registration
    globalShortcut.register('CommandOrControl+Shift+T', async () => {
      console.log('Global shortcut triggered: Cmd+Shift+T');
      try {
        const result = await this.translationUseCase.execute();
        this.mainWindow.webContents.send('translation:result', { ok: true, sentences: result });
        // Make window visible if hidden
        if (!this.mainWindow.isVisible()) {
          this.mainWindow.show();
        }
      } catch (error: any) {
        this.mainWindow.webContents.send('translation:result', { ok: false, error: error.message });
      }
    });

    // 2. IPC handlers
    ipcMain.handle('translation:runFromClipboard', async () => {
      try {
        const result = await this.translationUseCase.execute();
        return { ok: true, sentences: result };
      } catch (error: any) {
        return { ok: false, error: error.message };
      }
    });
  }
}
