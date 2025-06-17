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

interface GoalFormProps {
  onSubmit: (goal: string, timeframe?: string) => Promise<boolean>;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSubmit }) => {
  const [goal, setGoal] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const timeframeOptions = [
    { label: '1 tuần', value: '1 week' },
    { label: '1 tháng', value: '1 month' },
    { label: '3 tháng', value: '3 months' },
    { label: '6 tháng', value: '6 months' },
    { label: '1 năm', value: '1 year' },
  ];

  const handleSubmit = async () => {
    if (!goal.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mục tiêu của bạn');
      return;
    }

    setIsAnalyzing(true);
    try {
      await onSubmit(goal.trim(), timeframe || undefined);
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsAnalyzing(false);
    }
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
            <Text style={styles.sectionTitle}>Mục tiêu của bạn là gì?</Text>
            <TextInput
              style={styles.goalInput}
              placeholder="Nhập mục tiêu của bạn..."
              value={goal}
              onChangeText={setGoal}
              multiline
              maxLength={200}
              editable={!isAnalyzing}
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.characterCount}>{goal.length}/200</Text>
          </View>

          {/* Timeframe */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời gian thực hiện (tùy chọn)</Text>
            <Text style={styles.sectionDescription}>
              Nếu không chọn, AI sẽ tự động đề xuất thời gian phù hợp
            </Text>
            <View style={styles.timeframeGrid}>
              {timeframeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeframeButton,
                    timeframe === option.value && styles.timeframeButtonSelected
                  ]}
                  onPress={() => setTimeframe(timeframe === option.value ? '' : option.value)}
                  disabled={isAnalyzing}
                >
                  <Text style={[
                    styles.timeframeText,
                    timeframe === option.value && styles.timeframeTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {timeframe && (
              <TouchableOpacity
                style={styles.clearTimeframeButton}
                onPress={() => setTimeframe('')}
                disabled={isAnalyzing}
              >
                <Text style={styles.clearTimeframeText}>Xóa lựa chọn</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isAnalyzing && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isAnalyzing || !goal.trim()}
          >
            {isAnalyzing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.loadingText}>AI đang tạo kế hoạch...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>
                Tạo kế hoạch động lực
              </Text>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>AI sẽ giúp bạn:</Text>
            <Text style={styles.infoText}>
              Phân tích mục tiêu và tạo kế hoạch chi tiết{'\n'}
              Gửi lời nhắc động lực hàng ngày{'\n'}
              Theo dõi tiến độ và điều chỉnh phù hợp{'\n'}
              Tạo câu nói truyền cảm hứng
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
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  goalInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
  },
  timeframeGrid: {
    gap: 12,
  },
  timeframeButton: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timeframeButtonSelected: {
    borderColor: '#1f2937',
    backgroundColor: '#f3f4f6',
  },
  timeframeText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  timeframeTextSelected: {
    color: '#1f2937',
    fontWeight: '600',
  },
  clearTimeframeButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearTimeframeText: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
});