export interface AppSettings {
  aiProvider: 'gemini' | 'chatgpt' | 'auto';
  apiKey: string;          // Gemini API Key
  openaiApiKey: string;    // OpenAI API Key
  globalShortcut: string;
}

export interface SettingsRepository {
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: Partial<AppSettings>): Promise<void>;
}
