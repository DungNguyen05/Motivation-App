import * as Crypto from 'expo-crypto';
import { Motivation, MotivationCategory } from '../types';
import { NotificationService } from './NotificationService';
import { StorageService } from './StorageService';
import { AIService } from './AIService';


export class MotivationService {
  private static instance: MotivationService;
  private notificationService: NotificationService;
  private storageService: StorageService;
  private aiService: AIService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.storageService = StorageService.getInstance();
    this.aiService = new AIService(); // No API key needed, using fixed key
  }

  public static getInstance(): MotivationService {
    if (!MotivationService.instance) {
      MotivationService.instance = new MotivationService();
    }
    return MotivationService.instance;
  }

  async createMotivationPlan(goal: string, timeframe: string): Promise<Motivation[]> {
    try {
      console.log('Creating motivation plan for:', { goal, timeframe });
      
      // Get AI analysis
      const analysis = await this.aiService.analyzeGoal(goal, timeframe);
      
      if (!analysis.motivations || analysis.motivations.length === 0) {
        throw new Error('AI không thể tạo kế hoạch động lực. Vui lòng thử lại.');
      }

      const createdMotivations: Motivation[] = [];
      const errors: string[] = [];

      for (const motivationData of analysis.motivations) {
        try {
          const motivation = await this.createMotivation(
            motivationData.message,
            motivationData.scheduledTime,
            motivationData.category,
            goal
          );

          if (motivation) {
            createdMotivations.push(motivation);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Lỗi không xác định';
          errors.push(`Không thể tạo lời nhắc "${motivationData.message}": ${errorMsg}`);
          console.error('Error creating individual motivation:', error);
        }
      }

      if (errors.length > 0 && createdMotivations.length === 0) {
        throw new Error(`Không thể tạo kế hoạch động lực: ${errors.join(', ')}`);
      }

      if (errors.length > 0) {
        console.warn('Some motivations failed to create:', errors);
      }

      console.log(`Successfully created ${createdMotivations.length} motivations for goal: ${goal}`);
      return createdMotivations;
    } catch (error) {
      console.error('Error creating motivation plan:', error);
      throw error;
    }
  }

  async createMotivation(
    message: string, 
    scheduledTime: Date, 
    category: MotivationCategory,
    goal: string
  ): Promise<Motivation | null> {
    try {
      // Validate input
      if (!message.trim()) {
        throw new Error('Nội dung lời nhắc không được để trống');
      }

      if (scheduledTime <= new Date()) {
        throw new Error('Thời gian lời nhắc phải ở tương lai');
      }

      console.log('Creating motivation:', { message: message.trim(), scheduledTime, category, goal });

      // Schedule notification
      const notificationId = await this.notificationService.scheduleNotification(
        '💪 Động lực',
        message.trim(),
        scheduledTime
      );

      if (!notificationId) {
        throw new Error('Không thể đặt lịch thông báo');
      }

      // Create motivation object
      const motivation: Motivation = {
        id: Crypto.randomUUID(),
        message: message.trim(),
        scheduledTime,
        notificationId,
        isActive: true,
        createdAt: new Date(),
        category,
        goal,
      };

      // Save to storage
      await this.storageService.addMotivation(motivation);

      console.log('Motivation created successfully:', motivation.id);
      return motivation;
    } catch (error) {
      console.error('Error creating motivation:', error);
      throw error;
    }
  }

  async getAllMotivations(): Promise<Motivation[]> {
    try {
      return await this.storageService.loadMotivations();
    } catch (error) {
      console.error('Error loading motivations:', error);
      return [];
    }
  }

  async getActiveMotivations(): Promise<Motivation[]> {
    try {
      const motivations = await this.getAllMotivations();
      const now = new Date();
      return motivations.filter(m => m.isActive && new Date(m.scheduledTime) > now);
    } catch (error) {
      console.error('Error loading active motivations:', error);
      return [];
    }
  }

  async getMotivationsByGoal(goal: string): Promise<Motivation[]> {
    try {
      const motivations = await this.getAllMotivations();
      return motivations.filter(m => m.goal === goal);
    } catch (error) {
      console.error('Error loading motivations by goal:', error);
      return [];
    }
  }

  async getMotivationsByCategory(category: string): Promise<Motivation[]> {
    try {
      const motivations = await this.getAllMotivations();
      return motivations.filter(m => m.category === category);
    } catch (error) {
      console.error('Error loading motivations by category:', error);
      return [];
    }
  }

  async deleteMotivation(motivationId: string): Promise<void> {
    try {
      const motivations = await this.storageService.loadMotivations();
      const motivation = motivations.find(m => m.id === motivationId);

      if (motivation && motivation.notificationId) {
        try {
          await this.notificationService.cancelNotification(motivation.notificationId);
        } catch (notifError) {
          console.warn('Failed to cancel notification, but continuing with deletion:', notifError);
        }
      }

      await this.storageService.deleteMotivation(motivationId);
      console.log('Motivation deleted:', motivationId);
    } catch (error) {
      console.error('Error deleting motivation:', error);
      throw error;
    }
  }

  async clearAllMotivations(): Promise<void> {
    try {
      console.log('Clearing all motivations...');
      
      // Cancel all notifications
      await this.notificationService.cancelAllNotifications();
      
      // Clear storage
      await this.storageService.clearAllMotivations();
      
      console.log('All motivations cleared');
    } catch (error) {
      console.error('Error clearing all motivations:', error);
      throw error;
    }
  }

  async getMotivationStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byCategory: { [key: string]: number };
    byGoal: { [key: string]: number };
  }> {
    try {
      const motivations = await this.getAllMotivations();
      const now = new Date();
      
      const stats = {
        total: motivations.length,
        active: 0,
        expired: 0,
        byCategory: {} as { [key: string]: number },
        byGoal: {} as { [key: string]: number },
      };

      motivations.forEach(motivation => {
        // Count active/expired
        if (motivation.isActive && new Date(motivation.scheduledTime) > now) {
          stats.active++;
        } else {
          stats.expired++;
        }

        // Count by category
        const category = motivation.category || 'Custom';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

        // Count by goal
        const goal = motivation.goal || 'Unknown';
        stats.byGoal[goal] = (stats.byGoal[goal] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting motivation stats:', error);
      return {
        total: 0,
        active: 0,
        expired: 0,
        byCategory: {},
        byGoal: {},
      };
    }
  }

  formatMotivationTime(scheduledTime: Date): string {
    return scheduledTime.toLocaleString('vi-VN');
  }

  validateMotivationTime(scheduledTime: Date): boolean {
    return scheduledTime > new Date();
  }
}