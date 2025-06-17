import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { GoalForm } from './src/components/GoalForm';
import { MotivationItem } from './src/components/MotivationItem';
import { useMotivation } from './src/hooks/useMotivation';
import { NotificationService } from './src/services/NotificationService';
import { Motivation } from './src/types';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'goal'>('home');
  
  const {
    motivations,
    loading,
    error,
    addGoal,
    deleteMotivation,
    clearAllMotivations,
    getActiveMotivations,
    refreshMotivations,
  } = useMotivation();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      const hasPermission = await notificationService.initialize();
      
      if (!hasPermission) {
        Alert.alert(
          'Cần quyền thông báo',
          'Ứng dụng cần quyền thông báo để gửi lời nhắc động lực.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Lỗi', 'Không thể khởi động ứng dụng. Vui lòng thử lại.');
    }
  };

  const handleGoalSubmit = async (goal: string, timeframe?: string): Promise<boolean> => {
    try {
      const success = await addGoal(goal, timeframe);
      if (success) {
        setCurrentView('home');
        Alert.alert('Thành công', 'Đã tạo kế hoạch động lực cho mục tiêu của bạn!');
        return true;
      }
      return false;
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo kế hoạch động lực');
      return false;
    }
  };

  const handleClearAll = () => {
    if (motivations.length === 0) {
      Alert.alert('Thông tin', 'Không có lời nhắc nào để xóa');
      return;
    }

    Alert.alert(
      'Xóa tất cả',
      `Điều này sẽ xóa tất cả ${motivations.length} lời nhắc động lực. Bạn có chắc chắn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa tất cả', style: 'destructive', onPress: clearAllMotivations },
      ]
    );
  };

  const renderMotivationItem = ({ item }: { item: Motivation }) => (
    <MotivationItem
      motivation={item}
      onDelete={deleteMotivation}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Chưa có mục tiêu nào</Text>
      <Text style={styles.emptyStateText}>
        Hãy đặt mục tiêu đầu tiên và để AI tạo ra những lời nhắc động lực cho bạn
      </Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => setCurrentView('goal')}
      >
        <Text style={styles.startButtonText}>Bắt đầu ngay</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Motivation</Text>
      <Text style={styles.subtitle}>Hành trình đạt mục tiêu của bạn</Text>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getActiveMotivations().length}</Text>
          <Text style={styles.statLabel}>Đang theo dõi</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{motivations.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
      </View>
    </View>
  );

  if (currentView === 'goal') {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="dark" />
        <View style={styles.formHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentView('home')}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>Đặt mục tiêu mới</Text>
        </View>
        <GoalForm onSubmit={handleGoalSubmit} />
      </SafeAreaView>
    );
  }

  // Sort motivations: active first, then by date
  const sortedMotivations = [...motivations].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
  });

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      
      {renderHeader()}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={refreshMotivations}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={sortedMotivations}
        renderItem={renderMotivationItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={motivations.length === 0 ? styles.emptyListContainer : styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshMotivations} />
        }
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.newGoalButton}
          onPress={() => setCurrentView('goal')}
        >
          <Text style={styles.newGoalButtonText}>Mục tiêu mới</Text>
        </TouchableOpacity>
        
        {motivations.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 24,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 2,
  },
  formHeader: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  list: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  newGoalButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  newGoalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
});