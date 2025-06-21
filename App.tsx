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
import { AIService } from './src/services/AIService';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'goal'>('home');
  const [greeting, setGreeting] = useState('Good morning');
  
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
    generateGreeting();
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

  const generateGreeting = async () => {
    try {
      const aiService = new AIService();
      const hour = new Date().getHours();
      
      let timeOfDay = '';
      if (hour >= 5 && hour < 12) {
        timeOfDay = 'morning';
      } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'afternoon';
      } else if (hour >= 17 && hour < 22) {
        timeOfDay = 'evening';
      } else {
        timeOfDay = 'night';
      }

      const aiGreeting = await aiService.generateGreeting(timeOfDay);
      setGreeting(aiGreeting);
    } catch (error) {
      console.error('Error generating greeting:', error);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
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
      <View style={styles.emptyCard}>
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
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{greeting}</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Text style={styles.bellText}>🔔</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Time still available</Text>
            <Text style={styles.statValue}>{getCurrentTime()}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>heating oven</Text>
            <Text style={styles.statValue}>{getActiveMotivations().length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.otherDevicesSection}>
        <Text style={styles.sectionTitle}>Others Devices</Text>
        <TouchableOpacity onPress={() => setCurrentView('goal')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
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
    backgroundColor: '#e9e9eb',
  },
  header: {
    backgroundColor: '#e9e9eb',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: -1,
  },
  bellButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#474749',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellText: {
    fontSize: 24,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    minHeight: 100,
  },
  statLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: -1,
  },
  otherDevicesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 17,
    color: '#999999',
    fontWeight: '500',
  },
  formHeader: {
    backgroundColor: '#e9e9eb',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 17,
    color: '#000000',
    fontWeight: '500',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  list: {
    flex: 1,
    backgroundColor: '#e9e9eb',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 4,
  },
  emptyListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 17,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#ea6c2b',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 15,
    flex: 1,
    marginRight: 12,
  },
  retryButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#e9e9eb',
  },
  newGoalButton: {
    backgroundColor: '#ea6c2b',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  newGoalButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff3b30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ff3b30',
    fontSize: 15,
    fontWeight: '500',
  },
});