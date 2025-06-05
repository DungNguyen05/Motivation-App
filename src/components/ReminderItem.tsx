import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Reminder } from '../types';

interface ReminderItemProps {
  reminder: Reminder;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
}

export const ReminderItem: React.FC<ReminderItemProps> = ({
  reminder,
  onDelete,
  onCancel,
}) => {
  const formatDateTime = (date: Date): string => {
    const now = new Date();
    const reminderDate = new Date(date);
    const diffMs = reminderDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    // If it's in the past
    if (diffMs < 0) {
      return reminderDate.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    
    // If it's today
    if (diffDays === 0) {
      if (diffHours === 0) {
        return `In ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
      }
      return `Today at ${reminderDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
    }
    
    // If it's tomorrow
    if (diffDays === 1) {
      return `Tomorrow at ${reminderDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
    }
    
    // For other days
    return reminderDate.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Fixed date comparison
  const reminderDateTime = new Date(reminder.dateTime);
  const isExpired = reminderDateTime <= new Date();
  const isActive = reminder.isActive && !isExpired;

  const handleDelete = () => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(reminder.id) },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Reminder',
      'Are you sure you want to cancel this reminder?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'default', onPress: () => onCancel(reminder.id) },
      ]
    );
  };

  const getStatusIcon = () => {
    if (!reminder.isActive) return '⚪';
    if (isExpired) return '🔴';
    return '🟢';
  };

  return (
    <View style={[styles.container, !isActive && styles.inactiveContainer]}>
      <View style={styles.content}>
        <Text style={[styles.message, !isActive && styles.inactiveText]}>
          {reminder.message}
        </Text>
        <Text style={[styles.dateTime, !isActive && styles.inactiveText]}>
          {formatDateTime(reminderDateTime)}
        </Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={[styles.status, getStatusStyle(reminder, isExpired)]}>
            {getStatusText(reminder, isExpired)}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {isActive && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStatusText = (reminder: Reminder, isExpired: boolean): string => {
  if (!reminder.isActive) return 'Cancelled';
  if (isExpired) return 'Expired';
  return 'Active';
};

const getStatusStyle = (reminder: Reminder, isExpired: boolean) => {
  if (!reminder.isActive) return styles.cancelledStatus;
  if (isExpired) return styles.expiredStatus;
  return styles.activeStatus;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inactiveContainer: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inactiveText: {
    color: '#999',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeStatus: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d2e',
  },
  expiredStatus: {
    backgroundColor: '#ffeaea',
    color: '#d32f2f',
  },
  cancelledStatus: {
    backgroundColor: '#f0f0f0',
    color: '#757575',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  cancelButtonText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '500',
  },
});