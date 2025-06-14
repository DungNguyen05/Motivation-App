import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { AIService } from '../services/AIService';

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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key first');
      return;
    }

    // Dismiss keyboard first
    dismissKeyboard();

    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const aiService = new AIService(apiKey.trim());
      const isValid = await aiService.testConnection();
      
      if (isValid) {
        setConnectionTestResult('success');
        Alert.alert('Success', 'Google Gemini API key is valid!');
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

  const handleSave = () => {
    dismissKeyboard();
    onSave(apiKey.trim());
    Alert.alert('Success', 'API key saved successfully!');
  };

  const handleClose = () => {
    dismissKeyboard();
    onClose();
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
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Google Gemini Settings</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <View style={styles.content}>
                <Text style={styles.sectionTitle}>🤖 Google Gemini API Key (FREE)</Text>
                <Text style={styles.description}>
                  Get your FREE API key from aistudio.google.com/app/apikey
                </Text>
                
                <TextInput
                  style={styles.textInput}
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChangeText={setApiKey}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={dismissKeyboard}
                  blurOnSubmit={true}
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

                <View style={styles.freeInfo}>
                  <Text style={styles.freeTitle}>🎉 FREE TIER LIMITS</Text>
                  <Text style={styles.freeText}>
                    • 15 requests per minute{'\n'}
                    • 1,500 requests per day{'\n'}
                    • Perfect for multiple users!{'\n'}
                    • No credit card required
                  </Text>
                </View>

                <View style={styles.instructions}>
                  <Text style={styles.instructionTitle}>📖 How to Get FREE API Key</Text>
                  <Text style={styles.instructionText}>
                    1. Visit aistudio.google.com{'\n'}
                    2. Sign in with Google account{'\n'}
                    3. Click "Get API key"{'\n'}
                    4. Click "Create API key"{'\n'}
                    5. Copy the key (starts with "AIza"){'\n'}
                    6. Paste it above and test
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
  content: {
    padding: 20,
    maxHeight: 500,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
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
    backgroundColor: '#4285f4',
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
  freeInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  freeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d2e',
    marginBottom: 8,
  },
  freeText: {
    fontSize: 12,
    color: '#2e7d2e',
    lineHeight: 18,
  },
  instructions: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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