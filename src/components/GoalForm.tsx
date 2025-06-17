import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GoalFormProps {
  onSubmit: (goal: string, timeframe: string) => Promise<boolean>;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSubmit }) => {
  const [goal, setGoal] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const timeframeOptions = [
    { label: '1 tuần', value: '1 week', icon: '⚡' },
    { label: '1 tháng', value: '1 month', icon: '🎯' },
    { label: '3 tháng', value: '3 months', icon: '🚀' },
    { label: '6 tháng', value: '6 months', icon: '💪' },
    { label: '1 năm', value: '1 year', icon: '🏆' },
  ];

  const goalExamples = [
    'Học tiếng Anh giao tiếp',
    'Giảm 5kg',
    'Đọc 12 cuốn sách',
    'Chạy bộ mỗi ngày',
    'Học lập trình Python',
    'Tiết kiệm 10 triệu',
  ];

  const handleSubmit = async () => {
    if (!goal.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mục tiêu của bạn');
      return;
    }

    if (!timeframe) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn thời gian thực hiện');
      return;
    }

    setIsAnalyzing(true);
    try {
      await onSubmit(goal.trim(), timeframe);
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExampleGoal = (example: string) => {
    setGoal(example);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Goal Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Mục tiêu của bạn là gì?</Text>
            <TextInput
              style={styles.goalInput}
              placeholder="Ví dụ: Học tiếng Anh giao tiếp..."
              value={goal}
              onChangeText={setGoal}
              multiline
              maxLength={200}
              editable={!isAnalyzing}
              placeholderTextColor="#999"
            />
            <Text style={styles.characterCount}>{goal.length}/200</Text>
          </View>

          {/* Examples */}
          <View style={styles.section}>
            <Text style={styles.exampleTitle}>💡 Gợi ý mục tiêu:</Text>
            <View style={styles.exampleGrid}>
              {goalExamples.map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exampleChip}
                  onPress={() => handleExampleGoal(example)}
                  disabled={isAnalyzing}
                >
                  <Text style={styles.exampleText}>{example}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Timeframe */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Bạn muốn hoàn thành trong thời gian nào?</Text>
            <View style={styles.timeframeGrid}>
              {timeframeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeframeButton,
                    timeframe === option.value && styles.timeframeButtonSelected
                  ]}
                  onPress={() => setTimeframe(option.value)}
                  disabled={isAnalyzing}
                >
                  <Text style={styles.timeframeIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.timeframeText,
                    timeframe === option.value && styles.timeframeTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isAnalyzing && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isAnalyzing || !goal.trim() || !timeframe}
          >
            <LinearGradient
              colors={isAnalyzing ? ['#ccc', '#999'] as const : ['#667eea', '#764ba2'] as const}
              style={styles.submitGradient}
            >
              {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.loadingText}>AI đang tạo kế hoạch...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>
                  ✨ Tạo kế hoạch động lực
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🤖 AI sẽ giúp bạn:</Text>
            <Text style={styles.infoText}>
              • Phân tích mục tiêu và tạo kế hoạch chi tiết{'\n'}
              • Gửi lời nhắc động lực hàng ngày{'\n'}
              • Theo dõi tiến độ và điều chỉnh phù hợp{'\n'}
              • Tạo câu nói truyền cảm hứng
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  goalInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  exampleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  exampleText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  timeframeGrid: {
    gap: 12,
  },
  timeframeButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeframeButtonSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f3f4ff',
  },
  timeframeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  timeframeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeframeTextSelected: {
    color: '#667eea',
    fontWeight: '600',
  },
  submitButton: {
    marginBottom: 24,
  },
  submitGradient: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d2e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2e7d2e',
    lineHeight: 20,
  },
});