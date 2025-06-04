import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types';

export class StorageService {
  private static instance: StorageService;
  private readonly REMINDERS_KEY = 'reminders';

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number = 5000
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Storage operation timeout')), timeoutMs)
      )
    ]);
  }

  async saveReminders(reminders: Reminder[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(reminders);
      await this.withTimeout(
        AsyncStorage.setItem(this.REMINDERS_KEY, jsonValue)
      );
    } catch (error) {
      console.error('Error saving reminders:', error);
      throw error;
    }
  }

  async loadReminders(): Promise<Reminder[]> {
    try {
      const jsonValue = await this.withTimeout(
        AsyncStorage.getItem(this.REMINDERS_KEY)
      );
      
      if (jsonValue === null) {
        return [];
      }
      
      const reminders = JSON.parse(jsonValue);
      // Convert date strings back to Date objects
      return reminders.map((reminder: any) => ({
        ...reminder,
        dateTime: new Date(reminder.dateTime),
        createdAt: new Date(reminder.createdAt),
      }));
    } catch (error) {
      console.error('Error loading reminders:', error);
      return [];
    }
  }

  async addReminder(reminder: Reminder): Promise<void> {
    try {
      const reminders = await this.loadReminders();
      reminders.push(reminder);
      await this.saveReminders(reminders);
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  }

  async updateReminder(updatedReminder: Reminder): Promise<void> {
    try {
      const reminders = await this.loadReminders();
      const index = reminders.findIndex(r => r.id === updatedReminder.id);
      
      if (index !== -1) {
        reminders[index] = updatedReminder;
        await this.saveReminders(reminders);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }

  async deleteReminder(reminderId: string): Promise<void> {
    try {
      const reminders = await this.loadReminders();
      const filteredReminders = reminders.filter(r => r.id !== reminderId);
      await this.saveReminders(filteredReminders);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  async clearAllReminders(): Promise<void> {
    try {
      await this.withTimeout(
        AsyncStorage.removeItem(this.REMINDERS_KEY)
      );
    } catch (error) {
      console.error('Error clearing reminders:', error);
      throw error;
    }
  }
}