export interface AppSettings {
  aiProvider: 'gemini' | 'chatgpt';
  apiKey: string;
  globalShortcut: string;
}

export interface SettingsRepository {
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: Partial<AppSettings>): Promise<void>;
}
