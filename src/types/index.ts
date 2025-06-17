export interface Motivation {
  id: string;
  message: string;
  scheduledTime: Date;
  notificationId?: string;
  isActive: boolean;
  createdAt: Date;
  category: MotivationCategory;
  goal: string;
}

export type MotivationCategory = 
  | 'Start'
  | 'Daily'
  | 'Weekly Review'
  | 'Motivation'
  | 'Completion'
  | 'Custom';

export interface MotivationPlan {
  goal: string;
  timeframe: string;
  strategy: string;
  motivations: Motivation[];
  createdAt: Date;
}

export interface AppStats {
  totalMotivations: number;
  activeMotivations: number;
  expiredMotivations: number;
  completedGoals: number;
  byCategory: { [key: string]: number };
  byGoal: { [key: string]: number };
}