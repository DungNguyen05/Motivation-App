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

import { AddReminderForm } from './src/components/AddReminderForm';
import { ReminderItem } from './src/components/ReminderItem';
import { AIGoalForm } from './src/components/AIGoalForm';
import { SettingsModal } from './src/components/SettingsModal';
import { useReminders } from './src/hooks/useReminders';
import { NotificationService } from './src/services/NotificationService';
import { SettingsService } from './src/services/SettingsService';
import { Reminder } from './src/types';

export default function App() {
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'ai' | 'settings'>('list');
  const [apiKey, setApiKey] = useState<string>('');
  
  const {
    reminders,
    loading,
    error,
    addReminder,
    addMultipleReminders,
    cancelReminder,
    deleteReminder,
    clearAllReminders,
    getActiveReminders,
    refreshReminders,
  } = useReminders();

  useEffect(() => {
    initializeApp();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsService = SettingsService.getInstance();
      const settings = await settingsService.getSettings();
      setApiKey(settings.geminiApiKey || '');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const initializeApp = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      const hasPermission = await notificationService.initialize();
      
      if (!hasPermission) {
        Alert.alert(
          'Notification Permission Required',
          'This app needs notification permission to send you reminders.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize the app. Please restart.');
    }
  };

  const handleAddReminder = async (message: string, dateTime: Date): Promise<boolean> => {
    try {
      const success = await addReminder(message, dateTime);
      if (success) {
        setCurrentView('list');
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleAIGoalSubmit = async (remindersToAdd: Reminder[]): Promise<boolean> => {
    try {
      const success = await addMultipleReminders(remindersToAdd);
      if (success) {
        setCurrentView('list');
        Alert.alert('Success', `Created ${remindersToAdd.length} AI-generated reminders!`);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleClearAll = () => {
    if (reminders.length === 0) {
      Alert.alert('Info', 'No reminders to clear');
      return;
    }

    Alert.alert(
      'Clear All Reminders',
      `This will clear all ${reminders.length} reminders. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllReminders },
      ]
    );
  };

  const handleSettingsSave = async (newApiKey: string) => {
    try {
      const settingsService = SettingsService.getInstance();
      await settingsService.updateApiKey(newApiKey);
      setApiKey(newApiKey);
      setCurrentView('list');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
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
      <Text style={styles.emptyStateIcon}>🤖</Text>
      <Text style={styles.emptyStateTitle}>No Reminders</Text>
      <Text style={styles.emptyStateText}>
        Use FREE AI to create smart reminders or add them manually
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>AI Reminders</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setCurrentView('settings')}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>
      {!apiKey && (
        <View style={styles.apiWarning}>
          <Text style={styles.apiWarningText}>
            🆓 Set up FREE Google Gemini API key in settings to use AI features
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

  if (currentView === 'add') {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="dark" />
        <View style={styles.formHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentView('list')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <AddReminderForm onAddReminder={handleAddReminder} />
      </SafeAreaView>
    );
  }

  if (currentView === 'ai') {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="dark" />
        <View style={styles.formHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentView('list')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <AIGoalForm 
          onSubmit={handleAIGoalSubmit}
          apiKey={apiKey}
        />
      </SafeAreaView>
    );
  }

  if (currentView === 'settings') {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="dark" />
        <SettingsModal
          visible={true}
          onClose={() => setCurrentView('list')}
          onSave={handleSettingsSave}
          initialApiKey={apiKey}
        />
      </SafeAreaView>
    );
  }

  // Sort reminders: active first, then by date
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
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
            onPress={refreshReminders}
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
          style={[styles.actionButton, styles.aiButton]}
          onPress={() => setCurrentView('ai')}
          disabled={!apiKey}
        >
          <Text style={[styles.aiButtonText, !apiKey && styles.disabledText]}>
            🤖 FREE AI
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => setCurrentView('add')}
        >
          <Text style={styles.addButtonText}>+ Manual</Text>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  apiWarning: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  apiWarningText: {
    color: '#2e7d2e',
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
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  aiButton: {
    backgroundColor: '#4CAF50',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    color: '#ccc',
  },
});