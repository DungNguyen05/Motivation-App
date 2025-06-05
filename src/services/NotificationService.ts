import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number = 10000
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Notification operation timeout')), timeoutMs)
      )
    ]);
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      console.log('Notification permission status:', finalStatus);
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing notification service...');
      
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Request permissions with timeout
      const hasPermission = await this.withTimeout(
        this.requestPermissions(),
        15000 // 15 seconds timeout for permissions
      );

      if (!hasPermission) {
        console.log('Failed to get notification permissions');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await this.withTimeout(
          Notifications.setNotificationChannelAsync('default', {
            name: 'Reminders',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
            description: 'Notifications for your reminders',
          }),
          5000
        );
        console.log('Android notification channel configured');
      }

      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async scheduleNotification(
    title: string,
    body: string,
    scheduledDate: Date
  ): Promise<string | null> {
    try {
      // Validate input
      if (scheduledDate <= new Date()) {
        throw new Error('Cannot schedule notification for past time');
      }

      console.log('Scheduling notification for:', scheduledDate.toISOString());
      
      const notificationId = await this.withTimeout(
        Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            categoryIdentifier: 'reminder',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: scheduledDate,
          },
        }),
        8000
      );

      console.log(`Notification scheduled with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error; // Re-throw for better error handling upstream
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      console.log(`Cancelling notification: ${notificationId}`);
      await this.withTimeout(
        Notifications.cancelScheduledNotificationAsync(notificationId),
        5000
      );
      console.log(`Notification cancelled: ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      console.log('Cancelling all notifications...');
      await this.withTimeout(
        Notifications.cancelAllScheduledNotificationsAsync(),
        8000
      );
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await this.withTimeout(
        Notifications.getAllScheduledNotificationsAsync(),
        5000
      );
      console.log(`Found ${notifications.length} scheduled notifications`);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  async checkPermissionStatus(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking permission status:', error);
      return false;
    }
  }

  async hasPermissions(): Promise<boolean> {
    return await this.checkPermissionStatus();
  }
}