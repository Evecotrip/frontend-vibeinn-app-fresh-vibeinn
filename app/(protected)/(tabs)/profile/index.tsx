import { logoutUser } from "@/api/auth/auth-api";
import { ProfileInterface } from "@/types/userTypes";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
// import { getCurrentUserProfile } from "../../../../api/user/user-api"; // Temporarily disabled
import { useThemes } from "../../../../hooks/use-themes";

const { width: screenWidth } = Dimensions.get("window");
const profileImageSize = 120;

interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

const ProfileScreen = () => {
  const { theme, isDark } = useThemes();
  const [profile, setProfile] = useState<ProfileInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { signOut } = useClerk()
  const clerkUser = useUser()

  // Stats derived from profile counters
  const stats: ProfileStats = {
    posts: profile?.postCount || 0,
    followers: profile?.followerCount || 0,
    following: profile?.followingCount || 0,
  };

  // Dummy profile data matching new schema
  const loadProfile = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dummy data matching ProfileInterface from new schema
      const dummyProfile: ProfileInterface = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
        authUserId: clerkUser?.user?.id || "user_123456",
        
        // Core profile data
        username: "aryanjagarwal",
        slug: "aryanjagarwal",
        fullName: clerkUser?.user?.fullName || "Aryan Jagarwal",
        bio: "Building the future of campus social networking 🚀 | Tech enthusiast | Coffee lover ☕",
        location: "Mumbai, India",
        website: "https://aryanjagarwal.com",
        
        // Media
        avatarUrl: clerkUser?.user?.imageUrl || null,
        coverImageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926",
        
        // Personal info
        dateOfBirth: "2000-01-15",
        gender: "MALE",
        academicRole: "UNDERGRADUATE",
        
        // Status
        isPublic: true,
        isVerified: true,
        verificationBadge: "VERIFIED_STUDENT",
        
        // Counters
        followerCount: 1240,
        followingCount: 380,
        postCount: 42,
        
        // Timestamps
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-11-03T08:45:00Z",
        deletedAt: null,
        
        // Related data (optional)
        privacySettings: {
          id: "privacy-123",
          tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
          userProfileId: "550e8400-e29b-41d4-a716-446655440000",
          profileVisibility: "PUBLIC",
          showEmail: false,
          showPhone: false,
          showFollowers: true,
          showFollowing: true,
          allowMessages: "EVERYONE",
          allowTags: "EVERYONE",
          showOnlineStatus: true,
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-11-03T08:45:00Z",
        },
        socialLinks: [
          {
            id: "link-1",
            tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
            userProfileId: "550e8400-e29b-41d4-a716-446655440000",
            platform: "GITHUB",
            url: "https://github.com/aryanjagarwal",
            displayOrder: 1,
            createdAt: "2024-01-15T10:30:00Z",
          },
          {
            id: "link-2",
            tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
            userProfileId: "550e8400-e29b-41d4-a716-446655440000",
            platform: "LINKEDIN",
            url: "https://linkedin.com/in/aryanjagarwal",
            displayOrder: 2,
            createdAt: "2024-01-15T10:30:00Z",
          },
        ],
        interests: [
          {
            id: "interest-1",
            tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
            userProfileId: "550e8400-e29b-41d4-a716-446655440000",
            interest: "Web Development",
            category: "Technology",
            createdAt: "2024-01-15T10:30:00Z",
          },
          {
            id: "interest-2",
            tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
            userProfileId: "550e8400-e29b-41d4-a716-446655440000",
            interest: "Photography",
            category: "Arts",
            createdAt: "2024-01-15T10:30:00Z",
          },
          {
            id: "interest-3",
            tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
            userProfileId: "550e8400-e29b-41d4-a716-446655440000",
            interest: "Travel",
            category: "Lifestyle",
            createdAt: "2024-01-15T10:30:00Z",
          },
        ],
        skills: [
          {
            id: "skill-1",
            tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
            userProfileId: "550e8400-e29b-41d4-a716-446655440000",
            skillName: "React Native",
            proficiency: "ADVANCED",
            verified: true,
            createdAt: "2024-01-15T10:30:00Z",
          },
          {
            id: "skill-2",
            tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
            userProfileId: "550e8400-e29b-41d4-a716-446655440000",
            skillName: "TypeScript",
            proficiency: "EXPERT",
            verified: true,
            createdAt: "2024-01-15T10:30:00Z",
          },
          {
            id: "skill-3",
            tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
            userProfileId: "550e8400-e29b-41d4-a716-446655440000",
            skillName: "Node.js",
            proficiency: "INTERMEDIATE",
            verified: false,
            createdAt: "2024-01-15T10:30:00Z",
          },
        ],
        badges: [
          {
            id: "badge-1",
            tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
            userProfileId: "550e8400-e29b-41d4-a716-446655440000",
            badgeType: "EARLY_ADOPTER",
            badgeName: "Early Adopter",
            badgeIcon: "🚀",
            badgeColor: "#FFD700",
            description: "One of the first users on the platform",
            awardedAt: "2024-01-15T10:30:00Z",
            expiresAt: null,
          },
        ],
        metadata: {
          id: "metadata-123",
          tenantId: "504c6199-53b3-46c6-84d4-1a940c7bbd01",
          userProfileId: "550e8400-e29b-41d4-a716-446655440000",
          onboardingCompleted: true,
          profileCompletion: 85,
          lastActiveAt: "2024-11-03T08:45:00Z",
          timezone: "Asia/Kolkata",
          language: "en",
          customFields: null,
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-11-03T08:45:00Z",
        },
      };
      
      setProfile(dummyProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // logout function -> Clerk + Secure Storage + API
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Step 1: Revoke tokens and clear secure storage
              await logoutUser();
              console.log("✅ Backend tokens revoked and storage cleared");
              
              // Step 2: Sign out from Clerk
              await signOut();
              console.log("✅ User signed out from Clerk");
            } catch (error) {
              console.error("❌ Logout error:", error);
              // Even if there's an error, try to sign out from Clerk
              try {
                await signOut();
              } catch (signOutError) {
                console.error("❌ Clerk sign out error:", signOutError);
              }
            }
          },
        },
      ]
    );
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.placeholder }]}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[theme.gradientStart, theme.gradientEnd]}
          tintColor={theme.gradientStart}
          title="Pull to refresh"
          titleColor={theme.gradientEnd}
          progressViewOffset={50}
          progressBackgroundColor={theme.gradientStart}
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <BlurView intensity={20} style={styles.settingsButtonBlur}>
                <Ionicons name="settings-outline" size={24} color="white" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <LinearGradient
              colors={["#FFD700", "#FFA500", "#FF6B35"]}
              style={styles.profileImageGradient}
            >
              {profile?.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>
                    {profile?.fullName?.charAt(0)?.toUpperCase() || profile?.username?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </LinearGradient>
            <TouchableOpacity style={styles.editImageButton}
              onPress={() => {router.push("/(protected)/edit-profile/edit-profilePic")}}
            >
              <LinearGradient
                colors={[theme.gradientStart, theme.gradientEnd]}
                style={styles.editImageButtonGradient}
              >
                <Ionicons name="camera" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>
              {profile?.fullName || profile?.username || "Username"}
            </Text>
            {profile?.username && (
              <View style={styles.usernameContainer}>
                <Text style={styles.username}>@{profile.username}</Text>
                <TouchableOpacity 
                  style={styles.editUsernameButton}
                  onPress={() => router.push("/(protected)/edit-profile/edit-username")}
                >
                  <Ionicons name="pencil" size={14} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            )}
            {profile?.bio && (
              <Text style={styles.bio}>{profile.bio}</Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(stats.posts)}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(stats.followers)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(stats.following)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.editProfileButton} onPress={() => {router.push("/(protected)/edit-profile/editProfile")}}>
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd]}
            style={styles.editProfileButtonGradient}
          >
            <Ionicons name="create-outline" size={20} color={theme.text} />
            <Text style={[styles.editProfileButtonText, { color: theme.text }]}>
              Edit Profile
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareProfileButton}>
          <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            style={styles.shareProfileButtonGradient}
          >
            <Ionicons name="share-outline" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Anonymous Profile Button - Full Width */}
      <View style={styles.anonymousButtonContainer}>
        <TouchableOpacity style={styles.anonymousProfileButton}
          onPress={() => {router.push("/(protected)/anonymous-profile/anonymousProfile")}}
        >
          <LinearGradient
            colors={[theme.energetic, theme.vibrant]}
            style={styles.anonymousProfileButtonGradient}
          >
            <Ionicons name="person-circle-outline" size={20} color="white" />
            <Text style={styles.anonymousProfileButtonText}>
              Anonymous Profile
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Profile Details Card */}
      <View style={styles.detailsContainer}>
        <LinearGradient
          colors={[theme.cardGradientStart, theme.cardGradientEnd]}
          style={styles.detailsCard}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Personal Information
          </Text>

          {/* Email */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="mail-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.placeholder }]}>
                Email
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {clerkUser?.user?.emailAddresses?.[0]?.emailAddress || "Not provided"}
              </Text>
            </View>
          </View>

          {/* Location */}
          {profile?.location && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="location-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.placeholder }]}>
                  Location
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {profile.location}
                </Text>
              </View>
            </View>
          )}

          {/* Date of Birth */}
          {profile?.dateOfBirth && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.placeholder }]}>
                  Date of Birth
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {new Date(profile.dateOfBirth).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {/* Website */}
          {profile?.website && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="link-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.placeholder }]}>
                  Website
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {profile.website}
                </Text>
              </View>
            </View>
          )}

          {/* Gender */}
          {profile?.gender && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="transgender-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.placeholder }]}>
                  Gender
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase().replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
          )}

          {/* Profile Visibility */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons 
                name={profile?.privacySettings?.profileVisibility === 'PUBLIC' ? 'globe-outline' : 
                      profile?.privacySettings?.profileVisibility === 'PRIVATE' ? 'lock-closed-outline' : 
                      'people-outline'} 
                size={20} 
                color={theme.primary} 
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.placeholder }]}>
                Profile Visibility
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {profile?.privacySettings?.profileVisibility || profile?.isPublic ? 'Public' : 'Private'}
              </Text>
            </View>
          </View>

          {/* Academic Role */}
          {profile?.academicRole && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="school-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.placeholder }]}>
                  Academic Role
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {profile.academicRole.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Skills & Interests */}
      {(profile?.skills && profile.skills.length > 0) || 
       (profile?.interests && profile.interests.length > 0) ? (
        <View style={styles.skillsContainer}>
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd]}
            style={styles.skillsCard}
          >
            {profile?.skills && profile.skills.length > 0 && (
              <View style={styles.skillsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Skills
                </Text>
                <View style={styles.tagsContainer}>
                  {profile.skills.map((skill) => (
                    <TouchableOpacity key={skill.id} style={styles.tagButton}>
                      <LinearGradient
                        colors={[theme.gradientStart, theme.gradientEnd]}
                        style={styles.tagGradient}
                      >
                        <Text style={styles.tagText}>
                          {skill.skillName}
                          {skill.verified && " ✓"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {profile?.interests && profile.interests.length > 0 && (
              <View style={styles.skillsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Interests
                </Text>
                <View style={styles.tagsContainer}>
                  {profile.interests.map((interestObj) => (
                    <TouchableOpacity key={interestObj.id} style={styles.tagButton}>
                      <LinearGradient
                        colors={[theme.accent1, theme.accent2]}
                        style={styles.tagGradient}
                      >
                        <Text style={styles.tagText}>{interestObj.interest}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </LinearGradient>
        </View>
      ) : null}

      {/* Social Links */}
      {profile?.socialLinks && profile.socialLinks.length > 0 && (
        <View style={styles.socialLinksContainer}>
          <LinearGradient
            colors={[theme.cardGradientStart, theme.cardGradientEnd]}
            style={styles.socialLinksCard}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Social Links
            </Text>
            <View style={styles.socialLinksGrid}>
              {Object.entries(profile.socialLinks).map(([platform, url]) => (
                <TouchableOpacity key={platform} style={styles.socialLinkItem}>
                  <LinearGradient
                    colors={[theme.gradientStart, theme.gradientEnd]}
                    style={styles.socialLinkGradient}
                  >
                    <Ionicons 
                      name={
                        platform.toLowerCase().includes('twitter') ? 'logo-twitter' :
                        platform.toLowerCase().includes('linkedin') ? 'logo-linkedin' :
                        platform.toLowerCase().includes('github') ? 'logo-github' :
                        platform.toLowerCase().includes('instagram') ? 'logo-instagram' :
                        platform.toLowerCase().includes('facebook') ? 'logo-facebook' :
                        'link-outline'
                      } 
                      size={24} 
                      color="white" 
                    />
                  </LinearGradient>
                  <Text style={[styles.socialLinkText, { color: theme.text }]}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Account Information */}
      <View style={styles.accountInfoContainer}>
        <LinearGradient
          colors={[theme.cardGradientStart, theme.cardGradientEnd]}
          style={styles.accountInfoCard}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Account Information
          </Text>

          {/* Profile ID */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="finger-print-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.placeholder }]}>
                Profile ID
              </Text>
              <Text style={[styles.detailValue, { color: theme.text, fontSize: 14 }]}>
                {profile?.id?.substring(0, 8)}...
              </Text>
            </View>
          </View>

          {/* Created At */}
          {profile?.createdAt && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="time-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.placeholder }]}>
                  Member Since
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </Text>
              </View>
            </View>
          )}

          {/* Last Updated */}
          {profile?.updatedAt && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="refresh-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.placeholder }]}>
                  Last Updated
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {new Date(profile.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={["#FF3B30", "#FF375F"]}
            style={styles.logoutButtonGradient}
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  settingsButtonBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImageGradient: {
    width: profileImageSize,
    height: profileImageSize,
    borderRadius: profileImageSize / 2,
    padding: 4,
  },
  profileImage: {
    width: profileImageSize - 8,
    height: profileImageSize - 8,
    borderRadius: (profileImageSize - 8) / 2,
  },
  profileImagePlaceholder: {
    width: profileImageSize - 8,
    height: profileImageSize - 8,
    borderRadius: (profileImageSize - 8) / 2,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#0066FF",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  editImageButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  editUsernameButton: {
    marginLeft: 6,
    padding: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  bio: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  editProfileButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  editProfileButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  editProfileButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  anonymousButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  anonymousProfileButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  anonymousProfileButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  anonymousProfileButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  shareProfileButton: {
    width: 50,
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  shareProfileButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailsCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 102, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  skillsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skillsCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  skillsSection: {
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  socialLinksContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  socialLinksCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  socialLinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  socialLinkItem: {
    alignItems: "center",
    minWidth: 80,
  },
  socialLinkGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  socialLinkText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  accountInfoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  accountInfoCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  logoutButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProfileScreen;
