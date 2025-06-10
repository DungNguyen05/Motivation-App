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

  const addReminder = useCallback(async (message: string, dateTime: Date): Promise<boolean> => {
    try {
      setError(null);
      
      // Client-side validation
      if (!message.trim()) {
        throw new Error('Please enter a reminder message');
      }
      
      if (dateTime <= new Date()) {
        throw new Error('Please select a future date and time');
      }
      
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
      console.error('Error adding reminder:', err);
      throw err; // Re-throw for component to handle
    }
  }, [reminderService]);

  const addMultipleReminders = useCallback(async (newReminders: Reminder[]): Promise<boolean> => {
    try {
      setError(null);
      
      if (newReminders.length === 0) {
        throw new Error('No reminders to add');
      }

      // Validate all reminders
      const now = new Date();
      for (const reminder of newReminders) {
        if (!reminder.message.trim()) {
          throw new Error('All reminders must have a message');
        }
        if (new Date(reminder.dateTime) <= now) {
          throw new Error('All reminders must be scheduled for future time');
        }
      }

      const createdReminders = await reminderService.createMultipleReminders(newReminders);
      
      if (createdReminders.length > 0) {
        setReminders(prev => [...prev, ...createdReminders]);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reminders';
      setError(errorMessage);
      console.error('Error adding multiple reminders:', err);
      throw err;
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
      console.error('Error cancelling reminder:', err);
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
      console.error('Error deleting reminder:', err);
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
      console.error('Error clearing reminders:', err);
    }
  }, [reminderService]);

  const getActiveReminders = useCallback(() => {
    const now = new Date();
    return reminders.filter(reminder => 
      reminder.isActive && new Date(reminder.dateTime) > now
    );
  }, [reminders]);

  const getExpiredReminders = useCallback(() => {
    const now = new Date();
    return reminders.filter(reminder => 
      new Date(reminder.dateTime) <= now
    );
  }, [reminders]);

  const getAIGeneratedReminders = useCallback(() => {
    return reminders.filter(reminder => reminder.isAIGenerated === true);
  }, [reminders]);

  const getManualReminders = useCallback(() => {
    return reminders.filter(reminder => !reminder.isAIGenerated);
  }, [reminders]);

  const getRemindersByCategory = useCallback((category: string) => {
    return reminders.filter(reminder => reminder.category === category);
  }, [reminders]);

  const refreshReminders = useCallback(() => {
    loadReminders();
  }, [loadReminders]);

  // Auto-refresh every minute to update status
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update "expired" status
      setReminders(prev => [...prev]);
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  return {
    reminders,
    loading,
    error,
    addReminder,
    addMultipleReminders,
    cancelReminder,
    deleteReminder,
    clearAllReminders,
    getActiveReminders,
    getExpiredReminders,
    getAIGeneratedReminders,
    getManualReminders,
    getRemindersByCategory,
    refreshReminders,
    setError,
  };
};