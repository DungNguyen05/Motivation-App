import AsyncStorage from '@react-native-async-storage/async-storage';
import { Motivation } from '../types';

export class StorageService {
  private static instance: StorageService;
  private readonly MOTIVATIONS_KEY = 'motivations';

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
        setTimeout(() => reject(new Error('Thao tác lưu trữ hết thời gian')), timeoutMs)
      )
    ]);
  }

  async saveMotivations(motivations: Motivation[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(motivations);
      await this.withTimeout(
        AsyncStorage.setItem(this.MOTIVATIONS_KEY, jsonValue)
      );
    } catch (error) {
      console.error('Error saving motivations:', error);
      throw error;
    }
  }

  async loadMotivations(): Promise<Motivation[]> {
    try {
      const jsonValue = await this.withTimeout(
        AsyncStorage.getItem(this.MOTIVATIONS_KEY)
      );
      
      if (jsonValue === null) {
        return [];
      }
      
      const motivations = JSON.parse(jsonValue);
      // Convert date strings back to Date objects
      return motivations.map((motivation: any) => ({
        ...motivation,
        scheduledTime: new Date(motivation.scheduledTime),
        createdAt: new Date(motivation.createdAt),
      }));
    } catch (error) {
      console.error('Error loading motivations:', error);
      return [];
    }
  }

  async addMotivation(motivation: Motivation): Promise<void> {
    try {
      const motivations = await this.loadMotivations();
      motivations.push(motivation);
      await this.saveMotivations(motivations);
    } catch (error) {
      console.error('Error adding motivation:', error);
      throw error;
    }
  }

  async updateMotivation(updatedMotivation: Motivation): Promise<void> {
    try {
      const motivations = await this.loadMotivations();
      const index = motivations.findIndex(m => m.id === updatedMotivation.id);
      
      if (index !== -1) {
        motivations[index] = updatedMotivation;
        await this.saveMotivations(motivations);
      }
    } catch (error) {
      console.error('Error updating motivation:', error);
      throw error;
    }
  }

  async deleteMotivation(motivationId: string): Promise<void> {
    try {
      const motivations = await this.loadMotivations();
      const filteredMotivations = motivations.filter(m => m.id !== motivationId);
      await this.saveMotivations(filteredMotivations);
    } catch (error) {
      console.error('Error deleting motivation:', error);
      throw error;
    }
  }

  async clearAllMotivations(): Promise<void> {
    try {
      await this.withTimeout(
        AsyncStorage.removeItem(this.MOTIVATIONS_KEY)
      );
    } catch (error) {
      console.error('Error clearing motivations:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility (in case old reminder data exists)
  async migrateOldReminders(): Promise<void> {
    try {
      const oldReminders = await AsyncStorage.getItem('reminders');
      if (oldReminders) {
        console.log('Found old reminders, migrating...');
        // Clear old reminders after migration
        await AsyncStorage.removeItem('reminders');
        console.log('Old reminders migrated and cleared');
      }
    } catch (error) {
      console.error('Error migrating old reminders:', error);
    }
  }
}