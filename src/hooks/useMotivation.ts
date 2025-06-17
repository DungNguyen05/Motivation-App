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

  const addGoal = useCallback(async (goal: string, timeframe?: string): Promise<boolean> => {
    try {
      setError(null);
      
      if (!goal.trim()) {
        throw new Error('Vui lòng nhập mục tiêu');
      }
      
      // This will throw detailed AI errors
      const newMotivations = await motivationService.createMotivationPlan(goal.trim(), timeframe);
      
      if (newMotivations.length > 0) {
        setMotivations(prev => [...prev, ...newMotivations]);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo kế hoạch động lực';
      setError(errorMessage);
      console.error('Error adding goal:', err);
      
      // Show detailed error to user
      let alertTitle = 'Lỗi tạo kế hoạch';
      let alertMessage = errorMessage;
      
      // Categorize errors for better user experience
      if (errorMessage.includes('API key')) {
        alertTitle = 'Lỗi cấu hình';
        alertMessage = 'API key không hợp lệ. Vui lòng kiểm tra file .env và khởi động lại ứng dụng.';
      } else if (errorMessage.includes('quota') || errorMessage.includes('giới hạn')) {
        alertTitle = 'Vượt giới hạn';
        alertMessage = 'Đã vượt quá giới hạn sử dụng AI hôm nay. Vui lòng thử lại vào ngày mai.';
      } else if (errorMessage.includes('kết nối') || errorMessage.includes('internet')) {
        alertTitle = 'Lỗi kết nối';
        alertMessage = 'Không thể kết nối với AI. Vui lòng kiểm tra kết nối internet và thử lại.';
      } else if (errorMessage.includes('không hợp lệ') || errorMessage.includes('định dạng')) {
        alertTitle = 'Lỗi AI';
        alertMessage = 'AI trả về kết quả không hợp lệ. Vui lòng thử lại với mục tiêu cụ thể hơn.';
      } else if (errorMessage.includes('quyền thông báo')) {
        alertTitle = 'Cần quyền thông báo';
        alertMessage = 'Vui lòng cấp quyền thông báo trong cài đặt điện thoại để nhận lời nhắc động lực.';
      }
      
      Alert.alert(alertTitle, alertMessage, [
        { text: 'OK' },
        ...(alertTitle === 'Lỗi cấu hình' ? [
          { 
            text: 'Hướng dẫn', 
            onPress: () => Alert.alert(
              'Cách khắc phục', 
              '1. Mở file .env trong thư mục gốc\n2. Thêm EXPO_PUBLIC_GEMINI_API_KEY=your_api_key\n3. Lấy API key từ: https://aistudio.google.com/app/apikey\n4. Khởi động lại ứng dụng: npm start'
            )
          }
        ] : [])
      ]);
      
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

  const testAIConnection = useCallback(async (): Promise<boolean> => {
    try {
      return await motivationService.testAIConnection();
    } catch (error) {
      console.error('AI connection test failed:', error);
      return false;
    }
  }, [motivationService]);

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
    testAIConnection,
    setError,
  };
};