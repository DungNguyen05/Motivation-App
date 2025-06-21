import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
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
      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <View style={styles.greetingTextContainer}>
          <Text style={styles.greetingMain}>Good</Text>
          <Text style={styles.greetingSecondary}>morning</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.alarmButton}>
            <Text style={styles.alarmIcon}>⏰</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellButton}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Device Card - Twink Oven */}
      <View style={styles.mainDeviceCard}>
        {/* Main Device Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.deviceHeader}>
            <Text style={styles.deviceTitle}>Twink Oven</Text>
            <TouchableOpacity onPress={() => setCurrentView('goal')}>
              <Text style={styles.addButton}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.preHeatingBadge}>
            <Text style={styles.preHeatingText}>Pre heating</Text>
          </View>
          
          <View style={styles.deviceStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Time still{'\n'}available</Text>
              <View style={styles.statIcon}>
                <View style={styles.circularProgress} />
              </View>
              <Text style={styles.statValue}>{getCurrentTime()}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>heating{'\n'}oven</Text>
              <View style={styles.statIcon}>
                <View style={styles.circularProgress} />
              </View>
              <Text style={styles.statValue}>{getActiveMotivations().length}8°C</Text>
            </View>
          </View>
        </View>

        {/* Bottom Actions inside Main Device Card */}
        <View style={styles.cardBottomActions}>
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

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshMotivations} />
        }
        showsVerticalScrollIndicator={false}
      >
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

        {motivations.length === 0 && renderEmptyState()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9e9eb',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#e9e9eb',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flex: 1, // Take all available space
    justifyContent: 'flex-start', // Start from top
  },
  
  // Greeting Section
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingMain: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: -1,
    lineHeight: 52,
  },
  greetingSecondary: {
    fontSize: 44,
    fontWeight: '300',
    color: '#999999',
    letterSpacing: -1,
    lineHeight: 52,
    marginTop: -8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  alarmButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmIcon: {
    fontSize: 22,
  },
  bellButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#474749',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 22,
  },

  // Card Content
  cardContent: {
    flex: 1, // Take remaining space
  },

  // Main Device Card
  mainDeviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: -24, // Extend to full width
    marginLeft: -24,
    marginRight: -24,
    flex: 1, // Take available space
    minHeight: '80%', // 80% of screen height
    justifyContent: 'space-between', // Distribute content evenly
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000000',
  },
  preHeatingBadge: {
    backgroundColor: '#ea6c2b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  preHeatingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deviceStats: {
    flexDirection: 'row',
    gap: 16,
    flex: 1, // Take remaining space in content
    alignItems: 'center', // Center the stat boxes vertically
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 18,
    padding: 20,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 16,
    lineHeight: 22,
  },
  statIcon: {
    width: 40,
    height: 40,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgress: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#000000',
    borderRightColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: -1,
  },

  // Bottom Actions inside Card
  cardBottomActions: {
    gap: 12,
  },
  newGoalButton: {
    backgroundColor: '#ea6c2b',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
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

  // Form styles
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

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
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

  // Error handling
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
});