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

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async initialize(): Promise<boolean> {
    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
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
        console.log('Failed to get push token for push notification!');
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
          }),
          5000
        );
      }

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
      const notificationId = await this.withTimeout(
        Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            date: scheduledDate,
          },
        }),
        8000
      );

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await this.withTimeout(
        Notifications.cancelScheduledNotificationAsync(notificationId),
        5000
      );
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await this.withTimeout(
        Notifications.cancelAllScheduledNotificationsAsync(),
        8000
      );
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await this.withTimeout(
        Notifications.getAllScheduledNotificationsAsync(),
        5000
      );
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}