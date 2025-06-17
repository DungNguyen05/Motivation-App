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
  ImageBackground,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

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
          'Thông báo cần thiết',
          'Ứng dụng cần quyền thông báo để gửi lời nhắc động lực cho bạn.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Lỗi', 'Không thể khởi động ứng dụng. Vui lòng thử lại.');
    }
  };

  const handleGoalSubmit = async (goal: string, timeframe: string): Promise<boolean> => {
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
      <Text style={styles.emptyStateIcon}>🎯</Text>
      <Text style={styles.emptyStateTitle}>Chưa có mục tiêu nào</Text>
      <Text style={styles.emptyStateText}>
        Hãy đặt mục tiêu đầu tiên và để AI tạo ra những lời nhắc động lực cho bạn!
      </Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => setCurrentView('goal')}
      >
        <Text style={styles.startButtonText}>🚀 Bắt đầu ngay</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <Text style={styles.title}>💪 Motivation</Text>
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
    </LinearGradient>
  );

  if (currentView === 'goal') {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="light" />
        <LinearGradient
          colors={['#667eea', '#764ba2'] as const}
          style={styles.formHeader}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentView('home')}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>Đặt mục tiêu mới</Text>
        </LinearGradient>
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
      <ExpoStatusBar style="light" />
      
      {renderHeader()}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
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
          <LinearGradient
            colors={['#4facfe', '#00f2fe'] as const}
            style={styles.gradientButton}
          >
            <Text style={styles.newGoalButtonText}>🎯 Mục tiêu mới</Text>
          </LinearGradient>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  formHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  list: {
    flex: 1,
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
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  retryButton: {
    backgroundColor: '#c33',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  newGoalButton: {
    marginBottom: 12,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newGoalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
  },
});