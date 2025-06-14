export interface Reminder {
  id: string;
  message: string;
  dateTime: Date;
  notificationId?: string;
  isActive: boolean;
  createdAt: Date;
  category?: string;
  isAIGenerated?: boolean;
}

export interface AppSettings {
  openAIApiKey: string;
}

export type ReminderCategory = 
  | 'Start'
  | 'Daily'
  | 'Weekly Review'
  | 'Completion'
  | 'Custom';