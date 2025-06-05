import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddReminderFormProps {
  onAddReminder: (message: string, dateTime: Date) => Promise<boolean>;
}

export const AddReminderForm: React.FC<AddReminderFormProps> = ({
  onAddReminder,
}) => {
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickTimeOptions = [
    { label: '5 min', minutes: 5 },
    { label: '15 min', minutes: 15 },
    { label: '1 hour', minutes: 60 },
    { label: 'Tomorrow', minutes: 24 * 60 },
  ];

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a reminder message');
      return;
    }

    // Add minimum time buffer of 1 minute
    const minDateTime = new Date();
    minDateTime.setMinutes(minDateTime.getMinutes() + 1);

    if (selectedDate <= minDateTime) {
      Alert.alert('Error', 'Please select a time at least 1 minute in the future');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onAddReminder(message.trim(), selectedDate);
      if (success) {
        setMessage('');
        setSelectedDate(new Date());
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const onTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(time.getHours());
      newDateTime.setMinutes(time.getMinutes());
      setSelectedDate(newDateTime);
    }
  };

  const setQuickTime = (minutes: number) => {
    const newDate = new Date();
    newDate.setMinutes(newDate.getMinutes() + minutes);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageColor = () => {
    if (message.length > 180) return '#d32f2f';
    if (message.length > 150) return '#f57c00';
    return '#333';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Reminder</Text>
      
      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Message</Text>
          <Text style={[styles.characterCount, { color: getMessageColor() }]}>
            {message.length}/200
          </Text>
        </View>
        <TextInput
          style={[
            styles.textInput,
            message.length > 180 && styles.textInputWarning
          ]}
          placeholder="Enter your reminder message..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={200}
          editable={!isSubmitting}
        />
      </View>

      <View style={styles.quickTimeContainer}>
        <Text style={styles.label}>Quick Set:</Text>
        <View style={styles.quickTimeButtons}>
          {quickTimeOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={styles.quickTimeButton}
              onPress={() => setQuickTime(option.minutes)}
              disabled={isSubmitting}
            >
              <Text style={styles.quickTimeText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeItem}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
              disabled={isSubmitting}
            >
              <Text style={styles.dateTimeText}>
                {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateTimeItem}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
              disabled={isSubmitting}
            >
              <Text style={styles.dateTimeText}>
                {formatTime(selectedDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create Reminder</Text>
        )}
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  textInputWarning: {
    borderColor: '#f57c00',
    backgroundColor: '#fff8e1',
  },
  quickTimeContainer: {
    marginBottom: 20,
  },
  quickTimeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickTimeButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2196f3',
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  quickTimeText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '500',
  },
  dateTimeContainer: {
    marginBottom: 20,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});