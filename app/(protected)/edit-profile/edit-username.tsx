import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentUserProfile } from '../../../api/user/user-api';
import {
    checkUsernameAvailability,
    generateUniqueUsername,
    getUsernameSuggestions,
    updateUsername,
    validateUsername,
} from '../../../api/user/username-user-api';
import { useThemes } from '../../../hooks/use-themes';

const EditUserName = () => {
  const { theme, isDark } = useThemes();
  const insets = useSafeAreaInsets();
  
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({ isValid: false, isAvailable: null, message: '' });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load current username on component mount
  useEffect(() => {
    const loadCurrentUsername = async () => {
      try {
        const profile = await getCurrentUserProfile();
        if (profile?.data?.profile?.userName) {
          const currentUsername = profile.data.profile.userName;
          setUsername(currentUsername);
          setOriginalUsername(currentUsername);
        }
      } catch (error) {
        console.error('Error loading current username:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUsername();
  }, []);

  useEffect(() => {
    // Debounce username validation
    const delayedValidation = setTimeout(() => {
      if (username.trim() && username !== originalUsername) {
        handleUsernameValidation(username);
      } else if (username.trim() === originalUsername) {
        // Reset validation when username matches original
        setValidationStatus({ isValid: true, isAvailable: true, message: 'Current username' });
      } else if (!username.trim()) {
        // Clear validation when username is empty
        setValidationStatus({ isValid: false, isAvailable: null, message: '' });
      }
    }, 500);

    return () => clearTimeout(delayedValidation);
  }, [username, originalUsername]);

  const handleUsernameValidation = async (usernameToCheck: string) => {
    if (!usernameToCheck.trim()) {
      setValidationStatus({ isValid: false, isAvailable: null, message: '' });
      return;
    }

    setIsChecking(true);
    try {
      // First validate format
      const validation = await validateUsername(usernameToCheck);
      
      if (validation.isValid) {
        // Then check availability
        const isAvailable = await checkUsernameAvailability(usernameToCheck);
        setValidationStatus({
          isValid: true,
          isAvailable,
          message: isAvailable ? 'Username is available!' : 'Username is already taken'
        });
      } else {
        setValidationStatus({
          isValid: false,
          isAvailable: null,
          message: validation.message
        });
      }
    } catch (error) {
      setValidationStatus({
        isValid: false,
        isAvailable: null,
        message: 'Error checking username'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username to get suggestions');
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const suggestionList = await getUsernameSuggestions(username);
      setSuggestions(suggestionList);
      setShowSuggestions(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate suggestions. Please try again.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGenerateUnique = async () => {
    try {
      const uniqueUsername = await generateUniqueUsername(username || 'user');
      setUsername(uniqueUsername);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate unique username. Please try again.');
    }
  };

  const handleSaveUsername = async () => {
    if (!validationStatus.isValid || !validationStatus.isAvailable) {
      Alert.alert('Error', 'Please enter a valid and available username');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUsername = await updateUsername(username);
      Alert.alert(
        'Success',
        'Username updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update username. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setUsername(suggestion);
    setShowSuggestions(false);
  };

  const getValidationIcon = () => {
    if (isChecking) {
      return <ActivityIndicator size="small" color={theme.accent1} />;
    }
    
    if (!username.trim() || username === originalUsername) {
      return null;
    }

    if (!validationStatus.isValid) {
      return <Ionicons name="close-circle" size={20} color="#ef4444" />;
    }

    if (validationStatus.isAvailable === true) {
      return <Ionicons name="checkmark-circle" size={20} color="#10b981" />;
    }

    if (validationStatus.isAvailable === false) {
      return <Ionicons name="close-circle" size={20} color="#ef4444" />;
    }

    return null;
  };

  const getValidationColor = () => {
    if (!validationStatus.message) return theme.placeholder;
    if (!validationStatus.isValid || validationStatus.isAvailable === false) return '#ef4444';
    if (validationStatus.isAvailable === true) return '#10b981';
    return theme.placeholder;
  };

  const canSave = username.trim() && 
                 username !== originalUsername && 
                 validationStatus.isValid && 
                 validationStatus.isAvailable === true && 
                 !isChecking;

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientEnd]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <LinearGradient
              colors={[theme.cardGradientStart, theme.cardGradientEnd]}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Username</Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.energetic} />
            <Text style={styles.loadingText}>Loading current username...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
          {/* Main Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Username</Text>
            <Text style={styles.sectionSubtitle}>
              Choose a unique username for your profile
            </Text>

            <View style={styles.inputContainer}>
              <LinearGradient
                colors={[theme.cardGradientStart, theme.cardGradientEnd]}
                style={styles.inputGradient}
              >
                <View style={styles.inputWrapper}>
                  <Text style={[styles.atSymbol, { color: theme.placeholder }]}>@</Text>
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter username"
                    placeholderTextColor={theme.placeholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={30}
                  />
                  <View style={styles.validationIcon}>
                    {getValidationIcon()}
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Validation Message */}
            {validationStatus.message ? (
              <Text style={[styles.validationText, { color: getValidationColor() }]}>
                {validationStatus.message}
              </Text>
            ) : null}

            {/* Character Count */}
            <Text style={[styles.characterCount, { color: theme.placeholder }]}>
              {username.length}/30 characters
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleGenerateSuggestions}
              disabled={isLoadingSuggestions}
            >
              <LinearGradient
                colors={[theme.cardGradientStart, theme.cardGradientEnd]}
                style={styles.actionButtonGradient}
              >
                <View style={styles.actionButtonContent}>
                  <LinearGradient
                    colors={[theme.accent1, theme.accent2]}
                    style={styles.actionButtonIcon}
                  >
                    {isLoadingSuggestions ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name="bulb" size={20} color="white" />
                    )}
                  </LinearGradient>
                  <View style={styles.actionButtonText}>
                    <Text style={[styles.actionButtonTitle, { color: theme.text }]}>
                      Get Suggestions
                    </Text>
                    <Text style={[styles.actionButtonSubtitle, { color: theme.placeholder }]}>
                      Generate username ideas
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.placeholder} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleGenerateUnique}
            >
              <LinearGradient
                colors={[theme.cardGradientStart, theme.cardGradientEnd]}
                style={styles.actionButtonGradient}
              >
                <View style={styles.actionButtonContent}>
                  <LinearGradient
                    colors={[theme.accent2, theme.accent3]}
                    style={styles.actionButtonIcon}
                  >
                    <Ionicons name="refresh" size={20} color="white" />
                  </LinearGradient>
                  <View style={styles.actionButtonText}>
                    <Text style={[styles.actionButtonTitle, { color: theme.text }]}>
                      Generate Unique
                    </Text>
                    <Text style={[styles.actionButtonSubtitle, { color: theme.placeholder }]}>
                      Auto-generate available username
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.placeholder} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionTitle}>Suggestions</Text>
              <View style={styles.suggestionsGrid}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(suggestion)}
                  >
                    <LinearGradient
                      colors={[theme.cardGradientStart, theme.cardGradientEnd]}
                      style={styles.suggestionGradient}
                    >
                      <Text style={[styles.suggestionText, { color: theme.text }]}>
                        @{suggestion}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Save Button */}
          <View style={styles.saveSection}>
            <TouchableOpacity
              style={[styles.saveButton, { opacity: canSave ? 1 : 0.5 }]}
              onPress={handleSaveUsername}
              disabled={!canSave || isSaving}
            >
              <LinearGradient
                colors={canSave ? [theme.energetic, theme.vibrant] : [theme.placeholder, theme.placeholder]}
                style={styles.saveButtonGradient}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.saveButtonText}>Save Username</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputGradient: {
    borderRadius: 16,
    padding: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  atSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 4,
  },
  validationIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  actionSection: {
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 16,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 14,
  },
  suggestionsSection: {
    marginBottom: 32,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionItem: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  suggestionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveSection: {
    marginTop: 20,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default EditUserName;