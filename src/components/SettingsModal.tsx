import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { AIService } from '../services/AIService';
import { SettingsService } from '../services/SettingsService';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  initialApiKey: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialApiKey,
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<'success' | 'error' | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    sound: true,
    vibrate: true,
  });
  const [aiPreferences, setAiPreferences] = useState({
    reminderStyle: 'motivational' as 'motivational' | 'direct' | 'friendly',
    reminderFrequency: 'moderate' as 'minimal' | 'moderate' | 'frequent',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsService = SettingsService.getInstance();
      const settings = await settingsService.getSettings();
      setNotificationSettings(settings.notificationSettings);
      setAiPreferences(settings.aiPreferences);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key first');
      return;
    }

    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const aiService = new AIService(apiKey.trim());
      const isValid = await aiService.testConnection();
      
      if (isValid) {
        setConnectionTestResult('success');
        Alert.alert('Success', 'API key is valid and connection successful!');
      } else {
        setConnectionTestResult('error');
        Alert.alert('Error', 'Failed to connect. Please check your API key.');
      }
    } catch (error) {
      setConnectionTestResult('error');
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    try {
      const settingsService = SettingsService.getInstance();
      
      // Save all settings
      await settingsService.saveSettings({
        huggingFaceApiKey: apiKey.trim(),
        notificationSettings,
        aiPreferences,
      });

      onSave(apiKey.trim());
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleClearSettings = () => {
    Alert.alert(
      'Clear All Settings',
      'This will reset all settings to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const settingsService = SettingsService.getInstance();
              await settingsService.clearSettings();
              setApiKey('');
              setNotificationSettings({ enabled: true, sound: true, vibrate: true });
              setAiPreferences({ reminderStyle: 'motivational', reminderFrequency: 'moderate' });
              setConnectionTestResult(null);
              Alert.alert('Success', 'Settings cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear settings');
            }
          },
        },
      ]
    );
  };

  const getConnectionStatusColor = () => {
    if (connectionTestResult === 'success') return '#4CAF50';
    if (connectionTestResult === 'error') return '#f44336';
    return '#666';
  };

  const getConnectionStatusText = () => {
    if (connectionTestResult === 'success') return '✅ Connected';
    if (connectionTestResult === 'error') return '❌ Failed';
    return 'Not tested';
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* API Key Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 Hugging Face API</Text>
            <Text style={styles.description}>
              Get your free API key from{' '}
              <Text style={styles.link}>huggingface.co/settings/tokens</Text>
            </Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.connectionStatus}>
              <Text style={[styles.statusText, { color: getConnectionStatusColor() }]}>
                Status: {getConnectionStatusText()}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.testButton, isTestingConnection && styles.testButtonDisabled]}
              onPress={handleTestConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.testButtonText}>Test Connection</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Notifications</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Switch
                value={notificationSettings.enabled}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, enabled: value }))
                }
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound</Text>
              <Switch
                value={notificationSettings.sound}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, sound: value }))
                }
                disabled={!notificationSettings.enabled}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Switch
                value={notificationSettings.vibrate}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, vibrate: value }))
                }
                disabled={!notificationSettings.enabled}
              />
            </View>
          </View>

          {/* AI Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 AI Preferences</Text>
            
            <Text style={styles.subSectionTitle}>Reminder Style</Text>
            <View style={styles.optionGroup}>
              {['motivational', 'direct', 'friendly'].map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.optionButton,
                    aiPreferences.reminderStyle === style && styles.optionButtonSelected
                  ]}
                  onPress={() => setAiPreferences(prev => ({ 
                    ...prev, 
                    reminderStyle: style as any 
                  }))}
                >
                  <Text style={[
                    styles.optionText,
                    aiPreferences.reminderStyle === style && styles.optionTextSelected
                  ]}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subSectionTitle}>Reminder Frequency</Text>
            <View style={styles.optionGroup}>
              {['minimal', 'moderate', 'frequent'].map((frequency) => (
                <TouchableOpacity
                  key={frequency}
                  style={[
                    styles.optionButton,
                    aiPreferences.reminderFrequency === frequency && styles.optionButtonSelected
                  ]}
                  onPress={() => setAiPreferences(prev => ({ 
                    ...prev, 
                    reminderFrequency: frequency as any 
                  }))}
                >
                  <Text style={[
                    styles.optionText,
                    aiPreferences.reminderFrequency === frequency && styles.optionTextSelected
                  ]}>
                    {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 How to Get API Key</Text>
            <Text style={styles.instructionText}>
              1. Visit huggingface.co and create a free account{'\n'}
              2. Go to Settings → Access Tokens{'\n'}
              3. Click "New token" and select "Read" permission{'\n'}
              4. Copy the token (starts with "hf_"){'\n'}
              5. Paste it above and test the connection
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearSettings}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  link: {
    color: '#007AFF',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    fontFamily: 'monospace',
  },
  connectionStatus: {
    marginVertical: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  clearButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
    marginBottom: 8,
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: '500',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});