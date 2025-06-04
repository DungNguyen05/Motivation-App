import * as Crypto from 'expo-crypto';
import { Reminder } from '../types';
import { NotificationService } from './NotificationService';
import { StorageService } from './StorageService';

export class ReminderService {
  private static instance: ReminderService;
  private notificationService: NotificationService;
  private storageService: StorageService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.storageService = StorageService.getInstance();
  }

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  async createReminder(message: string, dateTime: Date): Promise<Reminder | null> {
    try {
      // Validate input
      if (!message.trim()) {
        throw new Error('Message cannot be empty');
      }

      if (dateTime <= new Date()) {
        throw new Error('Reminder time must be in the future');
      }

      // Schedule notification
      const notificationId = await this.notificationService.scheduleNotification(
        'Reminder',
        message,
        dateTime
      );

      if (!notificationId) {
        throw new Error('Failed to schedule notification');
      }

      // Create reminder object
      const reminder: Reminder = {
        id: Crypto.randomUUID(),
        message: message.trim(),
        dateTime,
        notificationId,
        isActive: true,
        createdAt: new Date(),
      };

      // Save to storage
      await this.storageService.addReminder(reminder);

      return reminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  async getAllReminders(): Promise<Reminder[]> {
    try {
      return await this.storageService.loadReminders();
    } catch (error) {
      console.error('Error loading reminders:', error);
      return [];
    }
  }

  async getActiveReminders(): Promise<Reminder[]> {
    try {
      const reminders = await this.getAllReminders();
      return reminders.filter(r => r.isActive && r.dateTime > new Date());
    } catch (error) {
      console.error('Error loading active reminders:', error);
      return [];
    }
  }

  async cancelReminder(reminderId: string): Promise<void> {
    try {
      const reminders = await this.storageService.loadReminders();
      const reminder = reminders.find(r => r.id === reminderId);

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Cancel notification if it exists
      if (reminder.notificationId) {
        await this.notificationService.cancelNotification(reminder.notificationId);
      }

      // Update reminder status
      const updatedReminder = { ...reminder, isActive: false };
      await this.storageService.updateReminder(updatedReminder);
    } catch (error) {
      console.error('Error cancelling reminder:', error);
      throw error;
    }
  }

  async deleteReminder(reminderId: string): Promise<void> {
    try {
      const reminders = await this.storageService.loadReminders();
      const reminder = reminders.find(r => r.id === reminderId);

      if (reminder && reminder.notificationId) {
        await this.notificationService.cancelNotification(reminder.notificationId);
      }

      await this.storageService.deleteReminder(reminderId);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  async clearAllReminders(): Promise<void> {
    try {
      // Cancel all notifications
      await this.notificationService.cancelAllNotifications();
      
      // Clear storage
      await this.storageService.clearAllReminders();
    } catch (error) {
      console.error('Error clearing all reminders:', error);
      throw error;
    }
  }

  validateReminderTime(dateTime: Date): boolean {
    return dateTime > new Date();
  }

  formatReminderTime(dateTime: Date): string {
    return dateTime.toLocaleString();
  }
}