import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Reminder } from '../types';
import { ReminderService } from '../services/ReminderService';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const reminderService = ReminderService.getInstance();

  const loadReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedReminders = await reminderService.getAllReminders();
      setReminders(loadedReminders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reminders';
      setError(errorMessage);
      console.error('Error loading reminders:', err);
    } finally {
      setLoading(false);
    }
  }, [reminderService]);

  const addReminder = useCallback(async (message: string, dateTime: Date) => {
    try {
      setError(null);
      const newReminder = await reminderService.createReminder(message, dateTime);
      
      if (newReminder) {
        setReminders(prev => [...prev, newReminder]);
        Alert.alert('Success', 'Reminder created successfully!');
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reminder';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, [reminderService]);

  const cancelReminder = useCallback(async (reminderId: string) => {
    try {
      setError(null);
      await reminderService.cancelReminder(reminderId);
      
      setReminders(prev =>
        prev.map(reminder =>
          reminder.id === reminderId
            ? { ...reminder, isActive: false }
            : reminder
        )
      );
      
      Alert.alert('Success', 'Reminder cancelled successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel reminder';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, [reminderService]);

  const deleteReminder = useCallback(async (reminderId: string) => {
    try {
      setError(null);
      await reminderService.deleteReminder(reminderId);
      
      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      Alert.alert('Success', 'Reminder deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reminder';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, [reminderService]);

  const clearAllReminders = useCallback(async () => {
    try {
      setError(null);
      await reminderService.clearAllReminders();
      setReminders([]);
      Alert.alert('Success', 'All reminders cleared!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear reminders';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, [reminderService]);

  const getActiveReminders = useCallback(() => {
    return reminders.filter(reminder => 
      reminder.isActive && reminder.dateTime > new Date()
    );
  }, [reminders]);

  const getExpiredReminders = useCallback(() => {
    return reminders.filter(reminder => 
      reminder.dateTime <= new Date()
    );
  }, [reminders]);

  const refreshReminders = useCallback(() => {
    loadReminders();
  }, [loadReminders]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  return {
    reminders,
    loading,
    error,
    addReminder,
    cancelReminder,
    deleteReminder,
    clearAllReminders,
    getActiveReminders,
    getExpiredReminders,
    refreshReminders,
    setError,
  };
};