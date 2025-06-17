import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Motivation } from '../types';

interface MotivationItemProps {
  motivation: Motivation;
  onDelete: (id: string) => void;
}

export const MotivationItem: React.FC<MotivationItemProps> = ({
  motivation,
  onDelete,
}) => {
  const formatDateTime = (date: Date): string => {
    const now = new Date();
    const motivationDate = new Date(date);
    const diffMs = motivationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    // If it's in the past
    if (diffMs < 0) {
      return motivationDate.toLocaleDateString('vi-VN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    // If it's today
    if (diffDays === 0) {
      if (diffHours === 0) {
        return `Sau ${diffMinutes} phút`;
      }
      return `Hôm nay ${motivationDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    
    // If it's tomorrow
    if (diffDays === 1) {
      return `Ngày mai ${motivationDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    
    // For other days
    return motivationDate.toLocaleDateString('vi-VN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const motivationDateTime = new Date(motivation.scheduledTime);
  const isExpired = motivationDateTime <= new Date();
  const isActive = motivation.isActive && !isExpired;

  const handleDelete = () => {
    Alert.alert(
      'Xóa lời nhắc',
      'Bạn có chắc chắn muốn xóa lời nhắc này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => onDelete(motivation.id) },
      ]
    );
  };

  const getStatusText = () => {
    if (!motivation.isActive) return 'Đã hủy';
    if (isExpired) return 'Đã qua';
    return 'Đang hoạt động';
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Start': return '#f472b6';
      case 'Daily': return '#60a5fa';
      case 'Weekly Review': return '#34d399';
      case 'Completion': return '#fbbf24';
      case 'Motivation': return '#8b5cf6';
      default: return '#9ca3af';
    }
  };

  return (
    <View style={[styles.container, !isActive && styles.inactiveContainer]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: isActive ? getCategoryColor(motivation.category) : '#e5e7eb' }]}>
            <Text style={[styles.categoryText, { color: isActive ? '#ffffff' : '#6b7280' }]}>
              {motivation.category}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, !isActive && styles.inactiveText]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.message, !isActive && styles.inactiveText]}>
            {motivation.message}
          </Text>
          <Text style={[styles.goalText, !isActive && styles.inactiveText]}>
            Mục tiêu: {motivation.goal}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.dateTime, !isActive && styles.inactiveText]}>
            {formatDateTime(motivationDateTime)}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  inactiveContainer: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  content: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  goalText: {
    fontSize: 14,
    color: '#4b5563',
    fontStyle: 'italic',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTime: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  inactiveText: {
    color: '#9ca3af',
  },
});