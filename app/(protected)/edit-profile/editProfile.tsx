import { getCurrentUserProfile, updateUserProfile } from '@/api/user/user-api';
import { UpdateProfileRequest, Gender, AcademicRole, ProfileVisibilityRequest } from '@/types/userTypes';
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

interface FormData {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender | "";
  profileImageUrl: string;
  coverImageUrl: string;
  academicRole: AcademicRole | "";
  socialRoles: string;
  skills: string;
  interests: string;
  twitterUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  profileVisibility: ProfileVisibilityRequest;
  showEmail: boolean;
  showPhone: boolean;
}

const EditProfile = () => {
  const { theme, isDark } = useThemes();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    profileImageUrl: '',
    coverImageUrl: '',
    academicRole: '',
    socialRoles: '',
    skills: '',
    interests: '',
    twitterUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    profileVisibility: 'PUBLIC',
    showEmail: false,
    showPhone: false,
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    setLoading(true)
    try {
      const response = await getCurrentUserProfile()
      if (response?.success && response.data.profile) {
        const profile = response.data.profile
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          displayName: profile.displayName || '',
          bio: profile.bio || '',
          phoneNumber: profile.phoneNumber || '',
          dateOfBirth: profile.dateOfBirth || '',
          gender: (profile.gender as Gender) || '',
          profileImageUrl: profile.profileImageUrl || '',
          coverImageUrl: profile.coverImageUrl || '',
          academicRole: (profile.academicRole as AcademicRole) || '',
          socialRoles: Array.isArray(profile.socialRoles) ? profile.socialRoles.join(', ') : '',
          skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
          interests: Array.isArray(profile.interests) ? profile.interests.join(', ') : '',
          twitterUrl: profile.socialLinks?.twitter || '',
          linkedinUrl: profile.socialLinks?.linkedin || '',
          githubUrl: profile.socialLinks?.github || '',
          profileVisibility: (profile.profileVisibility as ProfileVisibilityRequest) || 'PUBLIC',
          showEmail: profile.showEmail || false,
          showPhone: profile.showPhone || false,
        })
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Prepare the update data
      const updateData: UpdateProfileRequest = {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        displayName: formData.displayName || undefined,
        bio: formData.bio || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: (formData.gender as Gender) || undefined,
        profileImageUrl: formData.profileImageUrl || undefined,
        coverImageUrl: formData.coverImageUrl || undefined,
        academicRole: (formData.academicRole as AcademicRole) || undefined,
        socialRoles: formData.socialRoles ? formData.socialRoles.split(',').map(role => role.trim()).filter(role => role) : undefined,
        skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : undefined,
        interests: formData.interests ? formData.interests.split(',').map(interest => interest.trim()).filter(interest => interest) : undefined,
        socialLinks: {
          twitter: formData.twitterUrl || undefined,
          linkedin: formData.linkedinUrl || undefined,
          github: formData.githubUrl || undefined,
        },
        profileVisibility: formData.profileVisibility,
        showEmail: formData.showEmail,
        showPhone: formData.showPhone,
      }

      const response = await updateUserProfile(updateData)
      if (response?.success) {
        Alert.alert('Success', 'Profile updated successfully!')
      } else {
        Alert.alert('Error', 'Failed to update profile')
      }
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
            <Text style={[styles.label, { color: theme.text }]}>First Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
              placeholder="Enter first name"
              placeholderTextColor={theme.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Last Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
              placeholder="Enter last name"
              placeholderTextColor={theme.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.displayName}
              onChangeText={(text) => setFormData({...formData, displayName: text})}
              placeholder="Enter display name"
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
            <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
              placeholder="+1234567890"
              placeholderTextColor={theme.placeholder}
              keyboardType="phone-pad"
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
            <Text style={[styles.label, { color: theme.text }]}>Profile Image URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.profileImageUrl}
              onChangeText={(text) => setFormData({...formData, profileImageUrl: text})}
              placeholder="https://example.com/profile.jpg"
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
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Skills (comma-separated)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.skills}
              onChangeText={(text) => setFormData({...formData, skills: text})}
              placeholder="JavaScript, React, Node.js"
              placeholderTextColor={theme.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Interests (comma-separated)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.interests}
              onChangeText={(text) => setFormData({...formData, interests: text})}
              placeholder="Technology, Music, Sports"
              placeholderTextColor={theme.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Social Roles (comma-separated)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.socialRoles}
              onChangeText={(text) => setFormData({...formData, socialRoles: text})}
              placeholder="Student, Developer"
              placeholderTextColor={theme.placeholder}
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
              <Text style={styles.sectionBadgeText}>🔗 Social Links</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Twitter URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.twitterUrl}
              onChangeText={(text) => setFormData({...formData, twitterUrl: text})}
              placeholder="https://twitter.com/username"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>LinkedIn URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.linkedinUrl}
              onChangeText={(text) => setFormData({...formData, linkedinUrl: text})}
              placeholder="https://linkedin.com/in/username"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>GitHub URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
              value={formData.githubUrl}
              onChangeText={(text) => setFormData({...formData, githubUrl: text})}
              placeholder="https://github.com/username"
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
              <Text style={styles.sectionBadgeText}>🔒 Privacy Settings</Text>
            </LinearGradient>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Profile Visibility</Text>
            <View style={styles.pickerContainer}>
              {['PUBLIC', 'FRIENDS', 'COLLEGE', 'PRIVATE'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.pickerOption,
                    { borderColor: theme.border },
                    formData.profileVisibility === option && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setFormData({...formData, profileVisibility: option as any})}
                >
                  <Text style={[
                    styles.pickerText,
                    { color: formData.profileVisibility === option ? 'white' : theme.text }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: theme.text }]}>Show Email</Text>
            <TouchableOpacity
              onPress={() => setFormData({...formData, showEmail: !formData.showEmail})}
            >
              <LinearGradient
                colors={formData.showEmail ? [theme.gradientStart, theme.gradientEnd] : [theme.border, theme.border]}
                style={[styles.switch, formData.showEmail && styles.switchActive]}
              >
                <Text style={[styles.switchText, formData.showEmail && styles.switchTextActive]}>
                  {formData.showEmail ? 'ON' : 'OFF'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: theme.text }]}>Show Phone</Text>
            <TouchableOpacity
              onPress={() => setFormData({...formData, showPhone: !formData.showPhone})}
            >
              <LinearGradient
                colors={formData.showPhone ? [theme.gradientStart, theme.gradientEnd] : [theme.border, theme.border]}
                style={[styles.switch, formData.showPhone && styles.switchActive]}
              >
                <Text style={[styles.switchText, formData.showPhone && styles.switchTextActive]}>
                  {formData.showPhone ? 'ON' : 'OFF'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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