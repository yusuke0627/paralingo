import fs from "fs";
import path from "path";
import { AppSettings, SettingsRepository } from "../../application/ports/SettingsRepository";

export class LocalFileSettingsRepository implements SettingsRepository {
  private configPath: string;
  private defaultSettings: AppSettings = {
    aiProvider: "auto",
    apiKey: "",
    openaiApiKey: "",
    globalShortcut: "CommandOrControl+Shift+T"
  };

  /**
   * @param userDataPath e.g. app.getPath('userData')
   */
  constructor(userDataPath: string) {
    this.configPath = path.join(userDataPath, "paralingo-settings.json");
  }

  async getSettings(): Promise<AppSettings> {
    if (!fs.existsSync(this.configPath)) {
      return this.defaultSettings;
    }
    try {
      const data = fs.readFileSync(this.configPath, "utf-8");
      return { ...this.defaultSettings, ...JSON.parse(data) };
    } catch (err) {
      console.error("Failed to read settings file:", err);
      return this.defaultSettings;
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    fs.writeFileSync(this.configPath, JSON.stringify(updated, null, 2), "utf-8");
  }
}
