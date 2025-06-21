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
    
    if (diffMs < 0) {
      return motivationDate.toLocaleDateString('vi-VN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    if (diffDays === 0) {
      if (diffHours === 0) {
        return `Sau ${diffMinutes} phút`;
      }
      return `Hôm nay ${motivationDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    
    if (diffDays === 1) {
      return `Ngày mai ${motivationDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    
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

  return (
    <View style={styles.container}>
      <View style={[styles.card, !isActive && styles.inactiveCard]}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{motivation.category}</Text>
            </View>
            <Text style={[styles.statusText, !isActive && styles.inactiveText]}>
              {getStatusText()}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={handleDelete}
          >
            <Text style={styles.menuDots}>•••</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.message, !isActive && styles.inactiveText]}>
            {motivation.message}
          </Text>
          
          <View style={styles.goalSection}>
            <Text style={[styles.goalText, !isActive && styles.inactiveText]}>
              Mục tiêu: {motivation.goal}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.timeText, !isActive && styles.inactiveText]}>
            {formatDateTime(motivationDateTime)}
          </Text>
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  leftSection: {
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#ea6c2b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusText: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
  },
  menuButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDots: {
    fontSize: 20,
    color: '#999999',
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 16,
  },
  message: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 24,
    marginBottom: 12,
  },
  goalSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
  },
  goalText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  timeText: {
    fontSize: 15,
    color: '#999999',
    fontWeight: '500',
  },
  inactiveText: {
    color: '#cccccc',
  },
});