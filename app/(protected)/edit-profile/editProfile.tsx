// Edit Profile Screen
// Updated to use dummy data matching new ProfileInterface schema
// API integration temporarily disabled until backend is ready

// import { getCurrentUserProfile, updateUserProfile } from '@/api/user/user-api'; // Temporarily disabled
import { UpdateProfileRequest, Gender, AcademicRole, ProfileVisibility } from '@/types/userTypes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemes } from '../../../hooks/use-themes';

// Updated FormData to match new ProfileInterface schema
interface FormData {
  fullName: string;
  bio: string;
  location: string;
  website: string;
  dateOfBirth: string;
  gender: Gender | "";
  avatarUrl: string;
  coverImageUrl: string;
  academicRole: AcademicRole | "";
  isPublic: boolean;
}

const EditProfile = () => {
  const { theme, isDark } = useThemes();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    bio: '',
    location: '',
    website: '',
    dateOfBirth: '',
    gender: '',
    avatarUrl: '',
    coverImageUrl: '',
    academicRole: '',
    isPublic: true,
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dummy profile data matching new schema
      const dummyProfile = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
        authUserId: "auth-550e8400-e29b-41d4-a716-446655440000",
        username: "johndoe",
        slug: "johndoe",
        fullName: "John Doe",
        bio: "Computer Science student | Tech enthusiast",
        location: "San Francisco, CA",
        website: "https://johndoe.dev",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=johndoe",
        coverImageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926",
        dateOfBirth: "2000-05-15",
        gender: "MALE" as Gender,
        academicRole: "UNDERGRADUATE" as AcademicRole,
        isPublic: true,
        isVerified: true,
        verificationBadge: "verified_student",
        followerCount: 234,
        followingCount: 189,
        postCount: 42,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-11-03T08:45:00Z",
        deletedAt: null,
      };
      
      setFormData({
        fullName: dummyProfile.fullName || '',
        bio: dummyProfile.bio || '',
        location: dummyProfile.location || '',
        website: dummyProfile.website || '',
        dateOfBirth: dummyProfile.dateOfBirth || '',
        gender: dummyProfile.gender || '',
        avatarUrl: dummyProfile.avatarUrl || '',
        coverImageUrl: dummyProfile.coverImageUrl || '',
        academicRole: dummyProfile.academicRole || '',
        isPublic: dummyProfile.isPublic,
      });
      
      console.log('✅ Loaded dummy profile:', dummyProfile);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Prepare the update data matching new schema
      const updateData: UpdateProfileRequest = {
        fullName: formData.fullName || undefined,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: (formData.gender as Gender) || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        coverImageUrl: formData.coverImageUrl || undefined,
        academicRole: (formData.academicRole as AcademicRole) || undefined,
        isPublic: formData.isPublic,
      };
      
      console.log('✅ Profile updated successfully (dummy):', updateData);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            style={styles.loadingIconContainer}
          >
            <Ionicons name="person" size={40} color="white" />
          </LinearGradient>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your profile...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[
      styles.container, 
      { backgroundColor: theme.background, paddingTop: insets.top }
    ]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.card }]} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
          <Text style={[styles.headerSubtitle, { color: theme.placeholder }]}>Update your information</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={[theme.cardGradientStart, theme.cardGradientEnd]}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              style={styles.sectionBadge}
            >
              <Text style={styles.sectionBadgeText}>👤 Personal Info</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.fullName}
              onChangeText={(text) => setFormData({...formData, fullName: text})}
              placeholder="Enter your full name"
              placeholderTextColor={theme.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.bio}
              onChangeText={(text) => setFormData({...formData, bio: text})}
              placeholder="Tell us about yourself"
              placeholderTextColor={theme.placeholder}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
              placeholder="City, Country"
              placeholderTextColor={theme.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Website</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.website}
              onChangeText={(text) => setFormData({...formData, website: text})}
              placeholder="https://yourwebsite.com"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.dateOfBirth}
              onChangeText={(text) => setFormData({...formData, dateOfBirth: text})}
              placeholder="1995-06-15"
              placeholderTextColor={theme.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Gender</Text>
            <View style={styles.pickerContainer}>
              {['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY', 'OTHER'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.pickerOption,
                    { borderColor: theme.border },
                    formData.gender === option && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setFormData({...formData, gender: option as any})}
                >
                  <Text style={[
                    styles.pickerText,
                    { color: formData.gender === option ? 'white' : theme.text }
                  ]}>
                    {option.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Avatar URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.avatarUrl}
              onChangeText={(text) => setFormData({...formData, avatarUrl: text})}
              placeholder="https://example.com/avatar.jpg"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Cover Image URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.coverImageUrl}
              onChangeText={(text) => setFormData({...formData, coverImageUrl: text})}
              placeholder="https://example.com/cover.jpg"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
            />
          </View>
        </LinearGradient>

        <LinearGradient
          colors={[theme.cardGradientStart, theme.cardGradientEnd]}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              style={styles.sectionBadge}
            >
              <Text style={styles.sectionBadgeText}>🎓 Academic & Social</Text>
            </LinearGradient>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Academic Role</Text>
            <View style={styles.pickerContainer}>
              {['HIGH_SCHOOL_STUDENT', 'UNDERGRADUATE', 'GRADUATE', 'POSTGRADUATE', 'PHD_STUDENT', 'RESEARCHER', 'FACULTY', 'ALUMNI', 'OTHER'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.pickerOption,
                    { borderColor: theme.border },
                    formData.academicRole === option && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setFormData({...formData, academicRole: option as any})}
                >
                  <Text style={[
                    styles.pickerText,
                    { color: formData.academicRole === option ? 'white' : theme.text }
                  ]}>
                    {option.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Text style={[styles.helperText, { color: theme.placeholder }]}>
            Note: Skills, interests, and social links are managed separately through the profile settings.
          </Text>
        </LinearGradient>


        <LinearGradient
          colors={[theme.cardGradientStart, theme.cardGradientEnd]}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              style={styles.sectionBadge}
            >
              <Text style={styles.sectionBadgeText}>🔒 Privacy Settings</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: theme.text }]}>Public Profile</Text>
            <TouchableOpacity
              onPress={() => setFormData({...formData, isPublic: !formData.isPublic})}
            >
              <LinearGradient
                colors={formData.isPublic ? [theme.gradientStart, theme.gradientEnd] : [theme.border, theme.border]}
                style={[styles.switch, formData.isPublic && styles.switchActive]}
              >
                <Text style={[styles.switchText, formData.isPublic && styles.switchTextActive]}>
                  {formData.isPublic ? 'ON' : 'OFF'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={[styles.helperText, { color: theme.placeholder }]}>
            When enabled, your profile will be visible to everyone. When disabled, only you can see your profile.
          </Text>
        </LinearGradient>

        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={saving ? [theme.placeholder, theme.placeholder] : [theme.gradientStart, theme.gradientEnd]}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#1e293b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  sectionBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  switch: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchActive: {
    shadowOpacity: 0.3,
  },
  switchText: {
    fontWeight: '600',
    fontSize: 14,
  },
  switchTextActive: {
    color: '#ffffff',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
  saveButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
})

export default EditProfile