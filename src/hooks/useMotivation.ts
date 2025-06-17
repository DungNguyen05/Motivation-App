import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Motivation } from '../types';
import { MotivationService } from '../services/MotivationService';

export const useMotivation = () => {
  const [motivations, setMotivations] = useState<Motivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const motivationService = MotivationService.getInstance();

  const loadMotivations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedMotivations = await motivationService.getAllMotivations();
      setMotivations(loadedMotivations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu';
      setError(errorMessage);
      console.error('Error loading motivations:', err);
    } finally {
      setLoading(false);
    }
  }, [motivationService]);

  const addGoal = useCallback(async (goal: string, timeframe: string): Promise<boolean> => {
    try {
      setError(null);
      
      if (!goal.trim()) {
        throw new Error('Vui lòng nhập mục tiêu');
      }
      
      if (!timeframe) {
        throw new Error('Vui lòng chọn thời gian thực hiện');
      }
      
      const newMotivations = await motivationService.createMotivationPlan(goal, timeframe);
      
      if (newMotivations.length > 0) {
        setMotivations(prev => [...prev, ...newMotivations]);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo kế hoạch động lực';
      setError(errorMessage);
      console.error('Error adding goal:', err);
      throw err;
    }
  }, [motivationService]);

  const deleteMotivation = useCallback(async (motivationId: string) => {
    try {
      setError(null);
      await motivationService.deleteMotivation(motivationId);
      
      setMotivations(prev => prev.filter(motivation => motivation.id !== motivationId));
      Alert.alert('Thành công', 'Đã xóa lời nhắc');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa lời nhắc';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
      console.error('Error deleting motivation:', err);
    }
  }, [motivationService]);

  const clearAllMotivations = useCallback(async () => {
    try {
      setError(null);
      await motivationService.clearAllMotivations();
      setMotivations([]);
      Alert.alert('Thành công', 'Đã xóa tất cả lời nhắc!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa tất cả lời nhắc';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
      console.error('Error clearing motivations:', err);
    }
  }, [motivationService]);

  const getActiveMotivations = useCallback(() => {
    const now = new Date();
    return motivations.filter(motivation => 
      motivation.isActive && new Date(motivation.scheduledTime) > now
    );
  }, [motivations]);

  const getExpiredMotivations = useCallback(() => {
    const now = new Date();
    return motivations.filter(motivation => 
      new Date(motivation.scheduledTime) <= now
    );
  }, [motivations]);

  const getMotivationsByCategory = useCallback((category: string) => {
    return motivations.filter(motivation => motivation.category === category);
  }, [motivations]);

  const getMotivationsByGoal = useCallback((goal: string) => {
    return motivations.filter(motivation => motivation.goal === goal);
  }, [motivations]);

  const refreshMotivations = useCallback(() => {
    loadMotivations();
  }, [loadMotivations]);

  // Auto-refresh every minute to update status
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update "expired" status
      setMotivations(prev => [...prev]);
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadMotivations();
  }, [loadMotivations]);

  return {
    motivations,
    loading,
    error,
    addGoal,
    deleteMotivation,
    clearAllMotivations,
    getActiveMotivations,
    getExpiredMotivations,
    getMotivationsByCategory,
    getMotivationsByGoal,
    refreshMotivations,
    setError,
  };
};