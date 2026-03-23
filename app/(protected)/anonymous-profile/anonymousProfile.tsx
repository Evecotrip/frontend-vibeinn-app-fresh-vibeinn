import { AnonymousProfileInterface, CreateAnonymousProfileRequest } from '@/types/userTypes';
// import { clearStoredAnonymousUserId, createAnonymousProfile, fetchAnonymousProfileById, generateAnonymousName, getStoredAnonymousUserId, updateAnonymousProfile } from '@/api/user/anonymous-user-api'; // Temporarily disabled
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemes } from '../../../hooks/use-themes';

interface FormData {
  anonymousName: string;
  anonymousAvatar?: string; // Default avatar
  anonymousAvatarUrl?: string; // Custom avatar
  anonymousBio?: string;
}

// Removed colorThemes - not in new schema

const defaultAvatars = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous1',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous2',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous3',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous4',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous5',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous6',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous7',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous8',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous9',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous10',
];

const AnonymousProfile = () => {
  const { theme, isDark } = useThemes();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingName, setGeneratingName] = useState(false);
  const [existingProfile, setExistingProfile] = useState<AnonymousProfileInterface | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    anonymousName: '',
    anonymousAvatar: defaultAvatars[0], // Default avatar
    anonymousAvatarUrl: undefined, // Custom avatar
    anonymousBio: '',
  });

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dummy anonymous profile data matching new schema
      const dummyProfile: AnonymousProfileInterface = {
        id: "anon-550e8400-e29b-41d4-a716-446655440000",
        tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
        userProfileId: "550e8400-e29b-41d4-a716-446655440000",
        
        // Anonymous identity
        anonymousName: "Mystery Owl",
        anonymousAvatar: defaultAvatars[2], // Default avatar
        anonymousAvatarUrl: null, // Custom avatar (null = using default)
        anonymousBio: "Just another anonymous user exploring the campus 🦉",
        
        // Status
        isActive: true,
        activatedAt: "2024-10-15T10:30:00Z",
        deactivatedAt: null,
        
        // Timestamps
        createdAt: "2024-10-15T10:30:00Z",
        updatedAt: "2024-11-03T08:45:00Z",
      };
      
      console.log("✅ Loaded dummy anonymous profile:", dummyProfile);
      setExistingProfile(dummyProfile);
      
      // Populate form data with existing profile
      setFormData({
        anonymousName: dummyProfile.anonymousName || '',
        anonymousAvatar: dummyProfile.anonymousAvatar || defaultAvatars[0],
        anonymousAvatarUrl: dummyProfile.anonymousAvatarUrl || undefined,
        anonymousBio: dummyProfile.anonymousBio || '',
      });
    } catch (error) {
      console.error('Error checking existing profile:', error);
      setExistingProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateName = async () => {
    setGeneratingName(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate random anonymous name
      const adjectives = ['Mystery', 'Silent', 'Hidden', 'Shadow', 'Secret', 'Phantom', 'Ghost', 'Ninja', 'Stealth', 'Cosmic'];
      const nouns = ['Owl', 'Fox', 'Wolf', 'Eagle', 'Tiger', 'Dragon', 'Phoenix', 'Raven', 'Hawk', 'Panther'];
      const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const generatedName = `${randomAdj} ${randomNoun}`;
      
      setFormData(prev => ({ ...prev, anonymousName: generatedName }));
    } catch (error) {
      Alert.alert('Error', 'Failed to generate anonymous name. Please try again.');
    } finally {
      setGeneratingName(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.anonymousName.trim()) {
      Alert.alert('Error', 'Please provide an anonymous name');
      return;
    }

    setSaving(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const profileData: CreateAnonymousProfileRequest = {
        anonymousName: formData.anonymousName.trim(),
        anonymousAvatar: formData.anonymousAvatar,
        anonymousAvatarUrl: formData.anonymousAvatarUrl,
        anonymousBio: formData.anonymousBio?.trim(),
      };

      console.log('📝 Creating anonymous profile (dummy):', profileData);
      
      Alert.alert(
        'Success',
        'Anonymous profile created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              checkExistingProfile(); // Refresh the profile data
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create anonymous profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditingMode(true);
  };

  const handleCancelEdit = () => {
    if (existingProfile) {
      // Reset form data to existing profile
      setFormData({
        anonymousName: existingProfile.anonymousName || '',
        anonymousAvatar: existingProfile.anonymousAvatar || defaultAvatars[0],
        anonymousAvatarUrl: existingProfile.anonymousAvatarUrl || undefined,
        anonymousBio: existingProfile.anonymousBio || '',
      });
    }
    setIsEditingMode(false);
  };

  const handleUpdateProfile = async () => {
    if (!formData.anonymousName.trim()) {
      Alert.alert('Error', 'Please provide an anonymous name');
      return;
    }

    if (!existingProfile?.id) {
      Alert.alert('Error', 'No profile ID found');
      return;
    }

    setSaving(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const updateData: CreateAnonymousProfileRequest = {
        anonymousName: formData.anonymousName.trim(),
        anonymousAvatar: formData.anonymousAvatar,
        anonymousAvatarUrl: formData.anonymousAvatarUrl,
        anonymousBio: formData.anonymousBio?.trim(),
      };

      console.log("🔄 Updating profile (dummy):", updateData);
      
      Alert.alert(
        'Success',
        'Anonymous profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsEditingMode(false);
              checkExistingProfile(); // Refresh the profile data
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update anonymous profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Anonymous Profile',
      'Are you sure you want to delete your anonymous profile? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Simulate deletion
              console.log('🗑️ Deleting anonymous profile (dummy)');
              setExistingProfile(null);
              setIsEditingMode(false);
              setFormData({
                anonymousName: '',
                anonymousAvatar: defaultAvatars[0],
                anonymousAvatarUrl: undefined,
                anonymousBio: '',
              });
              Alert.alert('Success', 'Anonymous profile deleted successfully!');
            } catch (error) {
              console.error('Error deleting profile:', error);
              Alert.alert('Error', 'Failed to delete anonymous profile.');
            }
          },
        },
      ]
    );
  };

  // Removed selectedTheme - colorTheme not in new schema

  if (loading) {
    return (
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientEnd]}
      style={[styles.container, { paddingTop: insets.top }]}
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
        <Text style={styles.headerTitle}>Anonymous Profile</Text>
        {existingProfile && !isEditingMode ? (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <LinearGradient
              colors={[theme.cardGradientStart, theme.cardGradientEnd]}
              style={styles.editButtonGradient}
            >
              <Ionicons name="create-outline" size={20} color={theme.text} />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {existingProfile && !isEditingMode ? (
          // Show existing profile view
          <>
            {/* Profile Display */}
            <View style={styles.section}>
              <View style={styles.profileDisplayContainer}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={[theme.gradientStart, `${theme.gradientStart}80`]}
                    style={styles.avatarGradient}
                  >
                    <Image source={{ uri: formData.anonymousAvatarUrl || defaultAvatars[0] }} style={styles.avatar} />
                  </LinearGradient>
                </View>
                
                <Text style={styles.profileName}>{existingProfile.anonymousName}</Text>
                
                {existingProfile.anonymousBio && existingProfile.anonymousBio.trim() && (
                  <View style={styles.bioDisplayContainer}>
                    <Text style={styles.bioDisplayText}>{existingProfile.anonymousBio}</Text>
                  </View>
                )}
                
                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleEditProfile}
                  >
                    <LinearGradient
                      colors={[theme.gradientStart, `${theme.gradientStart}80`]}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="create-outline" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Edit Profile</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteProfile}
                  >
                    <LinearGradient
                      colors={['#EF4444', '#DC2626']}
                      style={styles.deleteButtonGradient}
                    >
                      <Ionicons name="trash-outline" size={20} color="white" />
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        ) : (
          // Show creation/editing form
          <>
            {/* Avatar Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Avatar</Text>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[theme.gradientStart, `${theme.gradientStart}80`]}
                  style={styles.avatarGradient}
                >
                  <Image source={{ uri: formData.anonymousAvatarUrl || defaultAvatars[0] }} style={styles.avatar} />
                </LinearGradient>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.avatarOptions}
                contentContainerStyle={styles.avatarOptionsContent}
              >
                {defaultAvatars.map((avatarUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.avatarOption,
                      formData.anonymousAvatarUrl === avatarUrl && styles.selectedAvatarOption
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, anonymousAvatarUrl: avatarUrl }))}
                  >
                    <Image source={{ uri: avatarUrl }} style={styles.avatarOptionImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Name Input */}
            <View style={styles.section}>
              <View style={styles.inputHeader}>
                <Text style={styles.sectionTitle}>Anonymous Name</Text>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateName}
                  disabled={generatingName}
                >
                  <LinearGradient
                    colors={[theme.gradientStart, `${theme.gradientStart}80`]}
                    style={styles.generateButtonGradient}
                  >
                    {generatingName ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="refresh" size={16} color="white" />
                        <Text style={styles.generateButtonText}>Generate</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
                <Ionicons name="person-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter anonymous name"
                  placeholderTextColor={theme.placeholder}
                  value={formData.anonymousName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, anonymousName: text }))}
                  maxLength={50}
                />
              </View>
            </View>

            {/* Bio Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <View style={[styles.inputContainer, styles.bioContainer, { backgroundColor: theme.inputBackground }]}>
                <Ionicons name="document-text-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.bioInput, { color: theme.text }]}
                  placeholder="Tell us about yourself anonymously..."
                  placeholderTextColor={theme.placeholder}
                  value={formData.anonymousBio}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, anonymousBio: text }))}
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                />
              </View>
              <Text style={styles.characterCount}>{(formData.anonymousBio || '').length}/300</Text>
            </View>

            {/* Note: Interests and Color Theme removed from new schema */}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {isEditingMode ? (
                <View style={styles.editActionsContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                      style={styles.cancelButtonGradient}
                    >
                      <Ionicons name="close-outline" size={20} color="white" />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateProfile}
                    disabled={saving}
                  >
                    <LinearGradient
                      colors={[theme.gradientStart, `${theme.gradientStart}80`]}
                      style={styles.updateButtonGradient}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-outline" size={20} color="white" />
                          <Text style={styles.updateButtonText}>Update Profile</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  <LinearGradient
                    colors={[theme.gradientStart, `${theme.gradientStart}80`]}
                    style={styles.saveButtonGradient}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="save-outline" size={20} color="white" />
                        <Text style={styles.saveButtonText}>Create Anonymous Profile</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'white',
  },
  avatarOptions: {
    maxHeight: 80,
  },
  avatarOptionsContent: {
    paddingHorizontal: 8,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedAvatarOption: {
    borderColor: 'white',
  },
  avatarOptionImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  bioContainer: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 24,
  },
  bioInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  characterCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'right',
  },
  helperText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  colorThemeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorThemeOption: {
    alignItems: 'center',
    width: '30%',
  },
  colorThemeGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedColorTheme: {
    opacity: 1,
  },
  colorThemeLabel: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
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
  // Header styles
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  editButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Profile display styles
  profileDisplayContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 16,
    marginBottom: 12,
  },
  bioDisplayContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  bioDisplayText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Edit mode styles
  editActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cancelButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  updateButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AnonymousProfile;