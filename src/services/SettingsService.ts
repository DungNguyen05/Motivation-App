import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  huggingFaceApiKey: string;
  notificationSettings: {
    enabled: boolean;
    sound: boolean;
    vibrate: boolean;
  };
  aiPreferences: {
    reminderStyle: 'motivational' | 'direct' | 'friendly';
    reminderFrequency: 'minimal' | 'moderate' | 'frequent';
  };
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
      huggingFaceApiKey: '',
      notificationSettings: {
        enabled: true,
        sound: true,
        vibrate: true,
      },
      aiPreferences: {
        reminderStyle: 'motivational',
        reminderFrequency: 'moderate',
      },
    };
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (jsonValue === null) {
        return this.getDefaultSettings();
      }
      
      const settings = JSON.parse(jsonValue);
      // Merge with defaults to ensure all properties exist
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
    await this.saveSettings({ huggingFaceApiKey: apiKey });
  }

  async getApiKey(): Promise<string> {
    const settings = await this.getSettings();
    return settings.huggingFaceApiKey;
  }

  async updateNotificationSettings(notificationSettings: Partial<AppSettings['notificationSettings']>): Promise<void> {
    const currentSettings = await this.getSettings();
    await this.saveSettings({
      notificationSettings: {
        ...currentSettings.notificationSettings,
        ...notificationSettings,
      },
    });
  }

  async updateAIPreferences(aiPreferences: Partial<AppSettings['aiPreferences']>): Promise<void> {
    const currentSettings = await this.getSettings();
    await this.saveSettings({
      aiPreferences: {
        ...currentSettings.aiPreferences,
        ...aiPreferences,
      },
    });
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