export interface Reminder {
  id: string;
  message: string;
  dateTime: Date;
  notificationId?: string;
  isActive: boolean;
  createdAt: Date;
  category?: string;
  isAIGenerated?: boolean;
  goalId?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibrate: boolean;
}

export interface AIGoal {
  id: string;
  description: string;
  timeframe: string;
  createdAt: Date;
  reminderIds: string[];
  status: 'active' | 'completed' | 'paused';
}

export interface AIAnalysisResult {
  strategy: string;
  reminders: {
    message: string;
    dateTime: Date;
    category: string;
  }[];
  milestones: {
    description: string;
    targetDate: Date;
  }[];
  totalReminders: number;
}

export type ReminderStatus = 'active' | 'completed' | 'cancelled' | 'expired';

export type ReminderCategory = 
  | 'Start'
  | 'Daily'
  | 'Weekly Review'
  | 'Monthly Milestone'
  | 'Milestone'
  | 'Completion'
  | 'Practice'
  | 'Reading'
  | 'Rest Day'
  | 'Custom';

export interface AppSettings {
  huggingFaceApiKey: string;
  notificationSettings: NotificationSettings;
  aiPreferences: {
    reminderStyle: 'motivational' | 'direct' | 'friendly';
    reminderFrequency: 'minimal' | 'moderate' | 'frequent';
  };
}