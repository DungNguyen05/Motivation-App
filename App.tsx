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
  const [greeting, setGreeting] = useState('Hello there');
  
  const {
    motivations,
    loading,
    error,
    addGoal,
    deleteMotivation,
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
          {greeting.split(' ').map((word, index) => (
            <Text 
              key={index}
              style={index === 0 ? styles.greetingMain : styles.greetingSecondary}
            >
              {word}
            </Text>
          ))}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity>
            <ClockIconLight size={32} />
          </TouchableOpacity>
          <TouchableOpacity>
            <BellIconDark size={32} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Device Card - Takes remaining height */}
      <View style={styles.mainDeviceCard}>
        {/* Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.deviceHeader}>
            <Text style={styles.deviceTitle}>Your Goals</Text>
            <TouchableOpacity
              onPress={() => setCurrentView('goal')}
              style={styles.circularButton}
            >
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>

          </View>
          <View style={styles.preHeatingBadge}>
            <Text style={styles.preHeatingText}>3 Goals Available</Text>
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

          {/* Goals Section */}
          <View style={styles.goalsSection}>
            <View style={styles.goalsSectionHeader}>
              <Text style={styles.goalsSectionTitle}>Running</Text>
              {motivations.length > 0 && (
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {motivations.length === 0 ? (
              <View style={styles.emptyGoalsState}>
                <View style={styles.emptyGoalsIcon}>
                  <Text style={styles.emptyGoalsIconText}>🎯</Text>
                </View>
                <Text style={styles.emptyGoalsTitle}>No goals yet</Text>
                <Text style={styles.emptyGoalsText}>
                  Let's add your first goal and start your journey!
                </Text>
                <TouchableOpacity
                  style={styles.addGoalButton}
                  onPress={() => setCurrentView('goal')}
                >
                  <Text style={styles.addGoalButtonText}>+ Add Goal</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView 
                style={styles.goalsContainer}
                showsVerticalScrollIndicator={false}
              >
                {motivations.slice(0, 3).map((motivation) => (
                  <View key={motivation.id} style={styles.goalCard}>
                    <View style={styles.goalCardHeader}>
                      <View style={styles.goalCategoryBadge}>
                        <Text style={styles.goalCategoryText}>{motivation.category}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.goalMenuButton}
                        onPress={() => deleteMotivation(motivation.id)}
                      >
                        <Text style={styles.goalMenuDots}>•••</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.goalText}>{motivation.goal}</Text>
                    <Text style={styles.goalMessage}>{motivation.message}</Text>
                    <Text style={styles.goalTime}>
                      {new Date(motivation.scheduledTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                ))}
                
                {motivations.length > 3 && (
                  <TouchableOpacity style={styles.viewMoreGoals}>
                    <Text style={styles.viewMoreGoalsText}>View {motivations.length - 3} more goals</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
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
    backgroundColor: '#f1f2ee',
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
    paddingTop: 0,
    paddingBottom: 5,
    backgroundColor: '#f1f2ee',
  },
  greetingTextContainer: {
    flex: 1,
    marginTop: -3
  },
  greetingMain: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#4a4a49',
    letterSpacing: 0,
    lineHeight: 52,
  },
  greetingSecondary: {
    fontSize: 34,
    fontWeight: '600',
    color: '#999999',
    letterSpacing: 0,
    lineHeight: 52,
    marginTop: -18,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  // Main Device Card - Full height to bottom
  mainDeviceCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flex: 1,
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
    color: '#454545',
  },
  circularButton: {
    backgroundColor: '#f8f8f6', // hoặc màu bạn muốn
    width: 52,
    height: 52,
    borderRadius: 26, // bán kính = 1/2 chiều rộng để tạo hình tròn
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  plusText: {
    fontSize: 35,
    color: '#1b1b1b', // màu chữ, nên là trắng nếu nền tối
    lineHeight: 38,
  },
  
  preHeatingBadge: {
    backgroundColor: '#ea6c2b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 24,
    marginTop: -15
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
    color: '#454545',
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
    borderColor: '#454545',
    borderRightColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#454545',
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
    color: '#454545',
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
    color: '#454545',
    fontWeight: '500',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#454545',
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

  // Goals Section Styles
  goalsSection: {
    marginTop: -5,
    flex: 1,
  },
  goalsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  goalsSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#454545',
  },
  seeAllText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },

  // Empty Goals State
  emptyGoalsState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyGoalsIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyGoalsIconText: {
    fontSize: 28,
  },
  emptyGoalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#454545',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyGoalsText: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addGoalButton: {
    backgroundColor: '#ea6c2b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addGoalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Goals List Styles
  goalsContainer: {
    maxHeight: 300,
  },
  goalCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  goalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalCategoryBadge: {
    backgroundColor: '#ea6c2b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  goalMenuButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalMenuDots: {
    fontSize: 16,
    color: '#999999',
    fontWeight: 'bold',
  },
  goalText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#454545',
    marginBottom: 4,
  },
  goalMessage: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 8,
  },
  goalTime: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  viewMoreGoals: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewMoreGoalsText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
});