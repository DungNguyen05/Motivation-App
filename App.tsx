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
  StatusBar,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { AddReminderForm } from './src/components/AddReminderForm';
import { ReminderItem } from './src/components/ReminderItem';
import { useReminders } from './src/hooks/useReminders';
import { NotificationService } from './src/services/NotificationService';
import { ReminderService } from './src/services/ReminderService';
import { Reminder } from './src/types';

export default function App() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const {
    reminders,
    loading,
    error,
    addReminder,
    cancelReminder,
    deleteReminder,
    clearAllReminders,
    getActiveReminders,
    refreshReminders,
  } = useReminders();

  useEffect(() => {
    initializeApp();
    setupNotificationListeners();
  }, []);

  // Sync notifications when app becomes active
  useEffect(() => {
    const syncOnFocus = async () => {
      try {
        const reminderService = ReminderService.getInstance();
        await reminderService.syncNotifications();
      } catch (error) {
        console.error('Error syncing notifications:', error);
      }
    };

    // Sync when component mounts
    syncOnFocus();
  }, []);

  const initializeApp = async () => {
    try {
      setIsInitializing(true);
      const notificationService = NotificationService.getInstance();
      const hasPermission = await notificationService.initialize();
      setNotificationPermission(hasPermission);
      
      if (!hasPermission) {
        Alert.alert(
          'Notification Permission Required',
          'This app needs notification permission to send you reminders. Please enable it in your device settings.',
          [
            { text: 'OK' },
            { 
              text: 'Settings', 
              onPress: () => {
                // You might want to add a link to settings here
                console.log('Navigate to settings');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize the app. Please restart the application.');
    } finally {
      setIsInitializing(false);
    }
  };

  const setupNotificationListeners = () => {
    // Listen for notification responses (when user taps notification)
    const notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notification received:', notification);
      }
    );

    const responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification response:', response);
        // Handle notification tap if needed
        // You could navigate to specific reminder or mark as completed
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  };

  const handleAddReminder = async (message: string, dateTime: Date): Promise<boolean> => {
    try {
      const success = await addReminder(message, dateTime);
      if (success) {
        setShowAddForm(false);
        return true;
      }
      return false;
    } catch (error) {
      // Error is already handled in useReminders hook
      return false;
    }
  };

  const handleClearAll = () => {
    if (reminders.length === 0) {
      Alert.alert('Info', 'No reminders to clear');
      return;
    }

    const activeCount = getActiveReminders().length;
    const message = activeCount > 0 
      ? `This will clear all ${reminders.length} reminders (${activeCount} active). This action cannot be undone.`
      : `This will clear all ${reminders.length} reminders. This action cannot be undone.`;

    Alert.alert(
      'Clear All Reminders',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: clearAllReminders 
        },
      ]
    );
  };

  const renderReminderItem = ({ item }: { item: Reminder }) => (
    <ReminderItem
      reminder={item}
      onDelete={deleteReminder}
      onCancel={cancelReminder}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📝</Text>
      <Text style={styles.emptyStateTitle}>No Reminders</Text>
      <Text style={styles.emptyStateText}>
        Tap the "Add Reminder" button to create your first reminder
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>My Reminders</Text>
      {!notificationPermission && (
        <View style={styles.permissionWarning}>
          <Text style={styles.permissionWarningText}>
            ⚠️ Notifications disabled - reminders won't work properly
          </Text>
        </View>
      )}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          Active: {getActiveReminders().length} | Total: {reminders.length}
        </Text>
      </View>
    </View>
  );

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing app...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showAddForm) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="dark" />
        <View style={styles.formHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowAddForm(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <AddReminderForm onAddReminder={handleAddReminder} />
      </SafeAreaView>
    );
  }

  // Sort reminders: active first, then by date
  const sortedReminders = [...reminders].sort((a, b) => {
    // First sort by active status
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Then sort by date
    return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
  });

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      
      {renderHeader()}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              refreshReminders();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={sortedReminders}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={reminders.length === 0 ? styles.emptyListContainer : styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshReminders} />
        }
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add Reminder</Text>
        </TouchableOpacity>
        
        {reminders.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionWarning: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  permissionWarningText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  stats: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  formHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
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
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5c6cb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  retryButton: {
    backgroundColor: '#721c24',
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
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
});