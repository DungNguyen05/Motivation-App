import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  geminiApiKey: string;
}

export class SettingsService {
  private static instance: SettingsService;
  private readonly SETTINGS_KEY = 'app_settings';

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  private getDefaultSettings(): AppSettings {
    return {
      geminiApiKey: '',
    };
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (jsonValue === null) {
        return this.getDefaultSettings();
      }
      
      const settings = JSON.parse(jsonValue);
      return { ...this.getDefaultSettings(), ...settings };
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }

  async saveSettings(newSettings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      const jsonValue = JSON.stringify(updatedSettings);
      await AsyncStorage.setItem(this.SETTINGS_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async updateApiKey(apiKey: string): Promise<void> {
    await this.saveSettings({ geminiApiKey: apiKey });
  }

  async getApiKey(): Promise<string> {
    const settings = await this.getSettings();
    return settings.geminiApiKey;
  }

  async clearSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SETTINGS_KEY);
    } catch (error) {
      console.error('Error clearing settings:', error);
      throw error;
    }
  }

  async isApiKeySet(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    return apiKey.trim().length > 0;
  }
}