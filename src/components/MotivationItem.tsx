import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      return `Hôm nay lúc ${motivationDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    
    // If it's tomorrow
    if (diffDays === 1) {
      return `Ngày mai lúc ${motivationDate.toLocaleTimeString('vi-VN', {
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

  const getStatusIcon = () => {
    if (!motivation.isActive) return '⚪';
    if (isExpired) return '🔴';
    return '🟢';
  };

  const getStatusText = () => {
    if (!motivation.isActive) return 'Đã hủy';
    if (isExpired) return 'Đã qua';
    return 'Đang hoạt động';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Start': return '🚀';
      case 'Daily': return '📅';
      case 'Weekly Review': return '📊';
      case 'Completion': return '🏆';
      case 'Motivation': return '💪';
      default: return '⭐';
    }
  };

  const getCategoryGradient = (category: string): readonly [string, string, ...string[]] => {
    switch (category) {
      case 'Start': return ['#ff9a9e', '#fecfef'] as const;
      case 'Daily': return ['#a8edea', '#fed6e3'] as const;
      case 'Weekly Review': return ['#fbc2eb', '#a6c1ee'] as const;
      case 'Completion': return ['#ffecd2', '#fcb69f'] as const;
      case 'Motivation': return ['#667eea', '#764ba2'] as const;
      default: return ['#ffeaa7', '#fab1a0'] as const;
    }
  };

  return (
    <View style={[styles.container, !isActive && styles.inactiveContainer]}>
      <LinearGradient
        colors={isActive ? getCategoryGradient(motivation.category) : ['#f5f5f5', '#e0e0e0'] as const}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(motivation.category)}
            </Text>
            <Text style={styles.categoryText}>{motivation.category}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
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
            ⏰ {formatDateTime(motivationDateTime)}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inactiveContainer: {
    opacity: 0.6,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },
  content: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  goalText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255,255,255,0.7)',
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
    color: '#666',
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  inactiveText: {
    color: '#999',
  },
});