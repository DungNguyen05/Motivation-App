export interface Reminder {
    id: string;
    message: string;
    dateTime: Date;
    notificationId?: string;
    isActive: boolean;
    createdAt: Date;
  }
  
  export interface NotificationSettings {
    enabled: boolean;
    sound: boolean;
    vibrate: boolean;
  }
  
  export type ReminderStatus = 'active' | 'completed' | 'cancelled';