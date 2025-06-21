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

// Import your icon package
import { ClockIconLight, BellIconDark } from './src/components/Icons';

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
    <View style={styles.emptyStateContent}>
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
    <View style={styles.fullHeightContainer}>
      {/* Greeting Section - Fixed height */}
      <View style={styles.greetingSection}>
        <View style={styles.greetingTextContainer}>
          <Text style={styles.greetingMain}>Good</Text>
          <Text style={styles.greetingSecondary}>morning</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity>
            <ClockIconLight size={25} />
          </TouchableOpacity>
          <TouchableOpacity>
            <BellIconDark size={25} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Device Card - Takes remaining height */}
      <View style={styles.mainDeviceCard}>
        {/* Card Content */}
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

          {/* Empty state content or motivations list */}
          {motivations.length === 0 && renderEmptyState()}
        </View>

        {/* Bottom Actions - Fixed at bottom */}
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

        {/* Error overlay inside white container */}
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
      
      {renderHeader()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9e9eb',
  },
  fullHeightContainer: {
    flex: 1,
  },
  
  // Greeting Section - Fixed height
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    backgroundColor: '#e9e9eb',
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

  // Main Device Card - Full height to bottom
  mainDeviceCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  
  // Card Content
  cardContent: {
    flex: 1,
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
    marginBottom: 32,
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

  // Empty state within card content
  emptyStateContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingHorizontal: 20,
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

  // Bottom Actions - Fixed at bottom of white card
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

  // Error handling - Now positioned inside white container
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
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