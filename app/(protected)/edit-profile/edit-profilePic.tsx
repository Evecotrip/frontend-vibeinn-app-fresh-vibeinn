// Edit Profile Picture Screen
// Updated to use dummy data matching new ProfileInterface schema
// API integration temporarily disabled until backend is ready

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { updateUserProfilePic } from '../../../api/user/user-api'; // Temporarily disabled - using dummy data
import { useThemes } from '../../../hooks/use-themes';

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
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous11',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous12',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous13',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous14',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous15',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous16',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous17',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous18',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous19',
  'https://api.dicebear.com/7.x/avataaars/png?seed=anonymous20',
];

const EditProfilePic = () => {
  const { theme, isDark } = useThemes();
  const insets = useSafeAreaInsets();
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatars[0]);
  const [saving, setSaving] = useState(false);

  const handleSaveProfilePic = async () => {
    setSaving(true);
    try {
      console.log('🔄 Updating profile picture to:', selectedAvatar);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Dummy success response matching new schema
      const dummyResult = {
        success: true,
        message: 'Profile picture updated successfully',
        data: {
          profile: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
            authUserId: "auth-550e8400-e29b-41d4-a716-446655440000",
            username: "johndoe",
            slug: "johndoe",
            fullName: "John Doe",
            bio: "Computer Science student | Tech enthusiast",
            location: "San Francisco, CA",
            website: "https://johndoe.dev",
            avatarUrl: selectedAvatar, // Updated avatar
            coverImageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926",
            dateOfBirth: "2000-05-15",
            gender: "MALE" as const,
            academicRole: "UNDERGRADUATE" as const,
            isPublic: true,
            isVerified: true,
            verificationBadge: "verified_student",
            followerCount: 234,
            followingCount: 189,
            postCount: 42,
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          }
        }
      };
      
      console.log('✅ Profile picture updated successfully (dummy):', dummyResult.data.profile);
      Alert.alert(
        'Success',
        'Profile picture updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error updating profile picture:', error);
      Alert.alert(
        'Error', 
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/png?seed=${randomSeed}`;
    setSelectedAvatar(randomAvatar);
  };

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
        <Text style={styles.headerTitle}>Edit Profile Picture</Text>
        <TouchableOpacity 
          style={styles.randomButton}
          onPress={generateRandomAvatar}
        >
          <LinearGradient
            colors={[theme.energetic, theme.vibrant]}
            style={styles.randomButtonGradient}
          >
            <Ionicons name="shuffle" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Selection Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Current Selection</Text>
          <View style={styles.previewContainer}>
            <LinearGradient
              colors={[theme.energetic, theme.vibrant]}
              style={styles.previewGradient}
            >
              <Image source={{ uri: selectedAvatar }} style={styles.previewImage} />
            </LinearGradient>
          </View>
          <Text style={styles.previewText}>This will be your new profile picture</Text>
        </View>

        {/* Avatar Grid */}
        <View style={styles.avatarSection}>
          <Text style={styles.sectionTitle}>Choose from Gallery</Text>
          <Text style={styles.sectionSubtitle}>Select an avatar that represents you</Text>
          
          <View style={styles.avatarGrid}>
            {defaultAvatars.map((avatarUrl, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatarUrl && styles.selectedAvatarOption
                ]}
                onPress={() => setSelectedAvatar(avatarUrl)}
              >
                <LinearGradient
                  colors={
                    selectedAvatar === avatarUrl
                      ? [theme.energetic, theme.vibrant]
                      : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
                  }
                  style={styles.avatarOptionGradient}
                >
                  <Image source={{ uri: avatarUrl }} style={styles.avatarOptionImage} />
                  {selectedAvatar === avatarUrl && (
                    <View style={styles.selectedOverlay}>
                      <Ionicons name="checkmark-circle" size={24} color="white" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Options */}
        <View style={styles.customSection}>
          <Text style={styles.sectionTitle}>More Options</Text>
          
          <TouchableOpacity style={styles.customOption} onPress={generateRandomAvatar}>
            <LinearGradient
              colors={[theme.cardGradientStart, theme.cardGradientEnd]}
              style={styles.customOptionGradient}
            >
              <View style={styles.customOptionContent}>
                <View style={styles.customOptionIconContainer}>
                  <LinearGradient
                    colors={[theme.accent1, theme.accent2]}
                    style={styles.customOptionIcon}
                  >
                    <Ionicons name="dice" size={24} color="white" />
                  </LinearGradient>
                </View>
                <View style={styles.customOptionText}>
                  <Text style={[styles.customOptionTitle, { color: theme.text }]}>
                    Generate Random Avatar
                  </Text>
                  <Text style={[styles.customOptionSubtitle, { color: theme.placeholder }]}>
                    Get a completely unique avatar
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.placeholder} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.customOption}>
            <LinearGradient
              colors={[theme.cardGradientStart, theme.cardGradientEnd]}
              style={styles.customOptionGradient}
            >
              <View style={styles.customOptionContent}>
                <View style={styles.customOptionIconContainer}>
                  <LinearGradient
                    colors={[theme.accent2, theme.accent3]}
                    style={styles.customOptionIcon}
                  >
                    <Ionicons name="camera" size={24} color="white" />
                  </LinearGradient>
                </View>
                <View style={styles.customOptionText}>
                  <Text style={[styles.customOptionTitle, { color: theme.text }]}>
                    Upload Custom Photo
                  </Text>
                  <Text style={[styles.customOptionSubtitle, { color: theme.placeholder }]}>
                    Use your own image (Coming Soon)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.placeholder} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfilePic}
            disabled={saving}
          >
            <LinearGradient
              colors={[theme.energetic, theme.vibrant]}
              style={styles.saveButtonGradient}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={styles.saveButtonText}>Save Profile Picture</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
  randomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  randomButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewContainer: {
    marginBottom: 12,
  },
  previewGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'white',
  },
  previewText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  avatarSection: {
    marginBottom: 32,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarOption: {
    width: '18%',
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: 35,
    overflow: 'hidden',
  },
  selectedAvatarOption: {
    transform: [{ scale: 1.05 }],
  },
  avatarOptionGradient: {
    flex: 1,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: 'white',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
  },
  customSection: {
    marginBottom: 32,
  },
  customOption: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  customOptionGradient: {
    padding: 16,
  },
  customOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customOptionIconContainer: {
    marginRight: 16,
  },
  customOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customOptionText: {
    flex: 1,
  },
  customOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  customOptionSubtitle: {
    fontSize: 14,
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
});

export default EditProfilePic;