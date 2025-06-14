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

  async createReminder(message: string, dateTime: Date, category?: string, isAIGenerated?: boolean): Promise<Reminder | null> {
    try {
      // Validate input
      if (!message.trim()) {
        throw new Error('Message cannot be empty');
      }

      if (dateTime <= new Date()) {
        throw new Error('Reminder time must be in the future');
      }

      // Check if notification service is available (graceful fallback)
      let hasPermission = false;
      try {
        if (typeof this.notificationService.checkPermissionStatus === 'function') {
          hasPermission = await this.notificationService.checkPermissionStatus();
        } else {
          console.log('Using fallback permission check...');
          hasPermission = true;
        }
        
        if (!hasPermission) {
          console.warn('Notification permission not granted, but continuing with reminder creation');
        }
      } catch (error) {
        console.warn('Could not check notification permissions, continuing anyway:', error);
        hasPermission = true;
      }

      console.log('Creating reminder:', { message: message.trim(), dateTime, category, isAIGenerated });

      // Schedule notification
      const notificationId = await this.notificationService.scheduleNotification(
        category ? `${category} Reminder` : 'Reminder',
        message.trim(),
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
        category: category || 'Custom',
        isAIGenerated: isAIGenerated || false,
      };

      // Save to storage
      await this.storageService.addReminder(reminder);

      console.log('Reminder created successfully:', reminder.id);
      return reminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  async createMultipleReminders(remindersData: Partial<Reminder>[]): Promise<Reminder[]> {
    try {
      const createdReminders: Reminder[] = [];
      const errors: string[] = [];

      for (const reminderData of remindersData) {
        try {
          if (!reminderData.message || !reminderData.dateTime) {
            throw new Error('Missing required reminder data');
          }

          const reminder = await this.createReminder(
            reminderData.message,
            new Date(reminderData.dateTime),
            reminderData.category,
            reminderData.isAIGenerated
          );

          if (reminder) {
            createdReminders.push(reminder);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to create reminder "${reminderData.message}": ${errorMsg}`);
          console.error('Error creating individual reminder:', error);
        }
      }

      if (errors.length > 0 && createdReminders.length === 0) {
        throw new Error(`Failed to create any reminders: ${errors.join(', ')}`);
      }

      if (errors.length > 0) {
        console.warn('Some reminders failed to create:', errors);
      }

      console.log(`Successfully created ${createdReminders.length} out of ${remindersData.length} reminders`);
      return createdReminders;
    } catch (error) {
      console.error('Error creating multiple reminders:', error);
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
      const now = new Date();
      return reminders.filter(r => r.isActive && new Date(r.dateTime) > now);
    } catch (error) {
      console.error('Error loading active reminders:', error);
      return [];
    }
  }

  async getAIGeneratedReminders(): Promise<Reminder[]> {
    try {
      const reminders = await this.getAllReminders();
      return reminders.filter(r => r.isAIGenerated === true);
    } catch (error) {
      console.error('Error loading AI-generated reminders:', error);
      return [];
    }
  }

  async getRemindersByCategory(category: string): Promise<Reminder[]> {
    try {
      const reminders = await this.getAllReminders();
      return reminders.filter(r => r.category === category);
    } catch (error) {
      console.error('Error loading reminders by category:', error);
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

      if (!reminder.isActive) {
        throw new Error('Reminder is already cancelled');
      }

      // Cancel notification if it exists
      if (reminder.notificationId) {
        await this.notificationService.cancelNotification(reminder.notificationId);
      }

      // Update reminder status
      const updatedReminder = { ...reminder, isActive: false };
      await this.storageService.updateReminder(updatedReminder);

      console.log('Reminder cancelled:', reminderId);
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
        try {
          await this.notificationService.cancelNotification(reminder.notificationId);
        } catch (notifError) {
          console.warn('Failed to cancel notification, but continuing with deletion:', notifError);
        }
      }

      await this.storageService.deleteReminder(reminderId);
      console.log('Reminder deleted:', reminderId);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  async clearAllReminders(): Promise<void> {
    try {
      console.log('Clearing all reminders...');
      
      // Cancel all notifications
      await this.notificationService.cancelAllNotifications();
      
      // Clear storage
      await this.storageService.clearAllReminders();
      
      console.log('All reminders cleared');
    } catch (error) {
      console.error('Error clearing all reminders:', error);
      throw error;
    }
  }

  async clearAIReminders(): Promise<void> {
    try {
      console.log('Clearing AI-generated reminders...');
      const reminders = await this.getAllReminders();
      const aiReminders = reminders.filter(r => r.isAIGenerated === true);
      
      for (const reminder of aiReminders) {
        await this.deleteReminder(reminder.id);
      }
      
      console.log(`Cleared ${aiReminders.length} AI-generated reminders`);
    } catch (error) {
      console.error('Error clearing AI reminders:', error);
      throw error;
    }
  }

  validateReminderTime(dateTime: Date): boolean {
    return dateTime > new Date();
  }

  formatReminderTime(dateTime: Date): string {
    return dateTime.toLocaleString();
  }

  async getUpcomingReminders(hours: number = 24): Promise<Reminder[]> {
    try {
      const reminders = await this.getActiveReminders();
      const now = new Date();
      const futureTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));
      
      return reminders.filter(r => {
        const reminderDate = new Date(r.dateTime);
        return reminderDate >= now && reminderDate <= futureTime;
      });
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    }
  }

  async getReminderStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    aiGenerated: number;
    manual: number;
    categories: { [key: string]: number };
  }> {
    try {
      const reminders = await this.getAllReminders();
      const now = new Date();
      
      const stats = {
        total: reminders.length,
        active: 0,
        expired: 0,
        aiGenerated: 0,
        manual: 0,
        categories: {} as { [key: string]: number },
      };

      reminders.forEach(reminder => {
        // Count active/expired
        if (reminder.isActive && new Date(reminder.dateTime) > now) {
          stats.active++;
        } else {
          stats.expired++;
        }

        // Count AI vs manual
        if (reminder.isAIGenerated) {
          stats.aiGenerated++;
        } else {
          stats.manual++;
        }

        // Count by category
        const category = reminder.category || 'Custom';
        stats.categories[category] = (stats.categories[category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      return {
        total: 0,
        active: 0,
        expired: 0,
        aiGenerated: 0,
        manual: 0,
        categories: {},
      };
    }
  }

  async syncNotifications(): Promise<void> {
    try {
      console.log('Syncing notifications with stored reminders...');
      
      const reminders = await this.getAllReminders();
      const scheduledNotifications = await this.notificationService.getScheduledNotifications();
      
      const scheduledIds = new Set(scheduledNotifications.map(n => n.identifier));
      
      for (const reminder of reminders) {
        if (reminder.isActive && reminder.notificationId && !scheduledIds.has(reminder.notificationId)) {
          console.log('Re-scheduling missing notification for reminder:', reminder.id);
          
          if (new Date(reminder.dateTime) > new Date()) {
            const newNotificationId = await this.notificationService.scheduleNotification(
              reminder.category ? `${reminder.category} Reminder` : 'Reminder',
              reminder.message,
              new Date(reminder.dateTime)
            );
            
            if (newNotificationId) {
              const updatedReminder = { ...reminder, notificationId: newNotificationId };
              await this.storageService.updateReminder(updatedReminder);
            }
          }
        }
      }
      
      console.log('Notification sync completed');
    } catch (error) {
      console.error('Error syncing notifications:', error);
    }
  }
}