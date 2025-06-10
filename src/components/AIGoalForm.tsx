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
} from 'react-native';
import { Reminder } from '../types';
import { AIService } from '../services/AIService';
import * as Crypto from 'expo-crypto';

interface AIGoalFormProps {
  onSubmit: (reminders: Reminder[]) => Promise<boolean>;
  apiKey: string;
}

interface PreviewReminder {
  message: string;
  dateTime: Date;
  category: string;
}

export const AIGoalForm: React.FC<AIGoalFormProps> = ({
  onSubmit,
  apiKey,
}) => {
  const [goal, setGoal] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewReminders, setPreviewReminders] = useState<PreviewReminder[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const quickGoals = [
    'Learn a new language',
    'Exercise regularly',
    'Read more books',
    'Drink more water',
    'Improve sleep schedule',
    'Learn programming',
  ];

  const timeframeOptions = [
    { label: '1 Week', value: '1 week' },
    { label: '2 Weeks', value: '2 weeks' },
    { label: '1 Month', value: '1 month' },
    { label: '3 Months', value: '3 months' },
    { label: '6 Months', value: '6 months' },
    { label: '1 Year', value: '1 year' },
  ];

  const handleAnalyzeGoal = async () => {
    if (!goal.trim()) {
      Alert.alert('Error', 'Please enter your goal');
      return;
    }

    if (!timeframe) {
      Alert.alert('Error', 'Please select a timeframe');
      return;
    }

    if (!apiKey) {
      Alert.alert('Error', 'Please set up Hugging Face API key in settings');
      return;
    }

    setIsAnalyzing(true);
    try {
      const aiService = new AIService(apiKey);
      const analysis = await aiService.analyzeGoal(goal.trim(), timeframe);
      
      if (analysis.reminders && analysis.reminders.length > 0) {
        setPreviewReminders(analysis.reminders);
        setShowPreview(true);
      } else {
        Alert.alert('No Results', 'AI could not generate reminders for this goal. Please try rephrasing your goal or check your API key.');
      }
    } catch (error) {
      console.error('Error analyzing goal:', error);
      Alert.alert(
        'Analysis Failed', 
        error instanceof Error ? error.message : 'Failed to analyze goal. Please check your API key and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateReminders = async () => {
    if (previewReminders.length === 0) return;

    try {
      const reminders: Reminder[] = previewReminders.map(reminder => ({
        id: Crypto.randomUUID(),
        message: reminder.message,
        dateTime: reminder.dateTime,
        isActive: true,
        createdAt: new Date(),
        category: reminder.category,
        isAIGenerated: true,
      }));

      const success = await onSubmit(reminders);
      if (success) {
        setGoal('');
        setTimeframe('');
        setPreviewReminders([]);
        setShowPreview(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create reminders');
    }
  };

  const handleEditReminder = (index: number, newMessage: string) => {
    const updated = [...previewReminders];
    updated[index].message = newMessage;
    setPreviewReminders(updated);
  };

  const handleRemoveReminder = (index: number) => {
    const updated = previewReminders.filter((_, i) => i !== index);
    setPreviewReminders(updated);
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <Text style={styles.previewTitle}>AI Generated Reminders ({previewReminders.length})</Text>
      <Text style={styles.previewSubtitle}>Review and edit before creating</Text>
      
      <ScrollView style={styles.previewList}>
        {previewReminders.map((reminder, index) => (
          <View key={index} style={styles.previewItem}>
            <View style={styles.previewItemHeader}>
              <Text style={styles.previewCategory}>{reminder.category}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveReminder(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.previewMessage}
              value={reminder.message}
              onChangeText={(text) => handleEditReminder(index, text)}
              multiline
            />
            <Text style={styles.previewTime}>{formatDateTime(reminder.dateTime)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.previewActions}>
        <TouchableOpacity
          style={styles.backToEditButton}
          onPress={() => setShowPreview(false)}
        >
          <Text style={styles.backToEditButtonText}>← Edit Goal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.createRemindersButton}
          onPress={handleCreateReminders}
          disabled={previewReminders.length === 0}
        >
          <Text style={styles.createRemindersButtonText}>
            Create {previewReminders.length} Reminders
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (showPreview) {
    return (
      <ScrollView style={styles.container}>
        {renderPreview()}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>AI Goal Planner</Text>
        <Text style={styles.subtitle}>Let AI create smart reminders for your goals</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>What's your goal?</Text>
          <TextInput
            style={styles.goalInput}
            placeholder="E.g., Learn Spanish, Exercise regularly, Read 12 books this year..."
            value={goal}
            onChangeText={setGoal}
            multiline
            maxLength={500}
            editable={!isAnalyzing}
          />
          <Text style={styles.characterCount}>{goal.length}/500</Text>
        </View>

        <View style={styles.quickGoalsContainer}>
          <Text style={styles.label}>Quick Goal Ideas:</Text>
          <View style={styles.quickGoalsGrid}>
            {quickGoals.map((quickGoal) => (
              <TouchableOpacity
                key={quickGoal}
                style={styles.quickGoalButton}
                onPress={() => setGoal(quickGoal)}
                disabled={isAnalyzing}
              >
                <Text style={styles.quickGoalText}>{quickGoal}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.timeframeContainer}>
          <Text style={styles.label}>Timeframe:</Text>
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

        <TouchableOpacity
          style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
          onPress={handleAnalyzeGoal}
          disabled={isAnalyzing || !apiKey}
        >
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>AI is analyzing your goal...</Text>
            </View>
          ) : (
            <Text style={styles.analyzeButtonText}>
              🤖 Analyze Goal with AI
            </Text>
          )}
        </TouchableOpacity>

        {!apiKey && (
          <View style={styles.apiKeyWarning}>
            <Text style={styles.apiKeyWarningText}>
              ⚠️ Please set up your Hugging Face API key in settings to use AI features
            </Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            • AI analyzes your goal and timeframe{'\n'}
            • Creates a structured reminder plan{'\n'}
            • Sets appropriate intervals and milestones{'\n'}
            • You can review and edit before creating
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  goalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  quickGoalsContainer: {
    marginBottom: 24,
  },
  quickGoalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickGoalButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  quickGoalText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '500',
  },
  timeframeContainer: {
    marginBottom: 24,
  },
  timeframeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeframeButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeframeButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timeframeText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  timeframeTextSelected: {
    color: '#fff',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  apiKeyWarning: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  apiKeyWarningText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 400,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewList: {
    maxHeight: 400,
    marginBottom: 20,
  },
  previewItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  previewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
  },
  previewTime: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backToEditButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  backToEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  createRemindersButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createRemindersButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});