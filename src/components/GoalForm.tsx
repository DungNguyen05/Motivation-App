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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mục tiêu của bạn là gì?</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.goalInput}
                placeholder="Nhập mục tiêu của bạn..."
                value={goal}
                onChangeText={setGoal}
                multiline
                maxLength={200}
                editable={!isAnalyzing}
                placeholderTextColor="#999999"
              />
              <Text style={styles.characterCount}>{goal.length}/200</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời gian thực hiện</Text>
            <Text style={styles.sectionDescription}>
              Tùy chọn - AI sẽ tự động đề xuất nếu không chọn
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

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>AI sẽ giúp bạn:</Text>
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
    backgroundColor: '#e9e9eb',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
  },
  goalInput: {
    padding: 20,
    fontSize: 17,
    minHeight: 120,
    textAlignVertical: 'top',
    color: '#000000',
    borderRadius: 18,
  },
  characterCount: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'right',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  timeframeGrid: {
    gap: 12,
  },
  timeframeButton: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
  },
  timeframeButtonSelected: {
    backgroundColor: '#ea6c2b',
  },
  timeframeText: {
    fontSize: 17,
    color: '#000000',
    fontWeight: '500',
  },
  timeframeTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  clearTimeframeButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  clearTimeframeText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#ea6c2b',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 18,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
});