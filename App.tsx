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
import { Reminder } from './src/types';

export default function App() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  
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

  const initializeApp = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      const hasPermission = await notificationService.initialize();
      setNotificationPermission(hasPermission);
      
      if (!hasPermission) {
        Alert.alert(
          'Notification Permission Required',
          'This app needs notification permission to send you reminders. Please enable it in settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize the app');
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
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  };

  const handleAddReminder = async (message: string, dateTime: Date) => {
    const success = await addReminder(message, dateTime);
    if (success) {
      setShowAddForm(false);
    }
  };

  const handleClearAll = () => {
    if (reminders.length === 0) {
      Alert.alert('Info', 'No reminders to clear');
      return;
    }

    Alert.alert(
      'Clear All Reminders',
      'Are you sure you want to clear all reminders? This action cannot be undone.',
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
            ⚠️ Notifications disabled - reminders won't work
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

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      
      {renderHeader()}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      <FlatList
        data={reminders.sort((a, b) => 
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        )}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={reminders.length === 0 ? styles.emptyListContainer : undefined}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshReminders} />
        }
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
  },
  permissionWarningText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
  },
  stats: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
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
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    textAlign: 'center',
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