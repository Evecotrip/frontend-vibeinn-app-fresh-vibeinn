import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemes } from "../../hooks/use-themes";
import { Post } from "../../mock/feed/feedData";

interface PostCardProps {
  post: Post;
}

const { width } = Dimensions.get("window");
const cardWidth = width - 32;

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { theme, isDark } = useThemes();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Video player
  const player = useVideoPlayer(post.videoUrl || null, (player) => {
    player.loop = true;
    player.muted = isMuted;
  });

  console.log("PostCard Render:", post.id, "isVideoPlaying:", isVideoPlaying, "isMuted:", isMuted, "videoUrl:", post.videoUrl);

  // Event handlers
  const { isPlaying: playerIsPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  // Animations
  const likeAnimation = useRef(new Animated.Value(1)).current;
  const cardScaleAnimation = useRef(new Animated.Value(0.98)).current;
  const tagRotateAnimation = useRef(new Animated.Value(0)).current;

  // Animate card on mount
  useEffect(() => {
    Animated.spring(cardScaleAnimation, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Subtle animation for tags
    Animated.loop(
      Animated.sequence([
        Animated.timing(tagRotateAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(tagRotateAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    // Animate the like button
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleVideoPlayback = async () => {
    if (!player) return;

    try {
      if (isVideoPlaying) {
        player.pause();
        setIsVideoPlaying(false);
      } else {
        player.play();
        setIsVideoPlaying(true);
      }
    } catch (error) {
      console.log("Error toggling video playback:", error);
    }
  };

  const toggleMute = async () => {
    if (!player) return;

    try {
      player.muted = !isMuted;
      setIsMuted(!isMuted);
    } catch (error) {
      console.log("Error toggling mute:", error);
    }
  };

  // Sync playing state with player events
  useEffect(() => {
    setIsVideoPlaying(playerIsPlaying);
  }, [playerIsPlaying]);

  // Update player muted state when isMuted changes
  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [player, isMuted]);

  // Get random accent color based on post id
  const getAccentColor = () => {
    const colors = [
      theme.energetic,
      theme.vibrant,
      theme.accent1,
      theme.accent2,
      theme.accent3,
    ];
    const index = parseInt(post.id.replace(/[^0-9]/g, "")) % colors.length;
    return colors[index];
  };

  const accentColor = getAccentColor();

  // Navigation function to single post
  const navigateToSinglePost = () => {
    router.push({
      pathname: '/(protected)/single-post',
      params: {
        postData: JSON.stringify(post),
      },
    });
  };

  return (
    <Animated.View
      style={[
        styles.containerOuter,
        {
          transform: [{ scale: cardScaleAnimation }],
          shadowColor: accentColor,
        },
      ]}
    >
      <LinearGradient
        colors={[theme.cardGradientStart, theme.cardGradientEnd]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              style={styles.avatarGradient}
            >
              <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
            </LinearGradient>
            <View style={styles.userTextContainer}>
              <View style={styles.usernameRow}>
                <Text style={[styles.username, { color: theme.text }]}>
                  {post.username}
                </Text>
                {post.isFollowing && (
                  <LinearGradient
                    colors={[theme.gradientStart, theme.gradientEnd]}
                    style={styles.followingBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.followingText}>Following</Text>
                  </LinearGradient>
                )}
              </View>
              <View style={styles.universityRow}>
                <Ionicons
                  name="school-outline"
                  size={12}
                  color={theme.placeholder}
                />
                <Text style={[styles.university, { color: theme.placeholder }]}>
                  {post.university}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.moreButton,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={theme.placeholder}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <TouchableOpacity onPress={navigateToSinglePost} activeOpacity={0.7}>
          <Text style={[styles.content, { color: theme.text }]}>
            {post.content}
          </Text>
        </TouchableOpacity>

        {/* Media */}
        {post.media && post.media.length > 0 && (
            <View style={styles.mediaContainer}>
              {post.videoUrl ? (
                <View style={styles.videoWrapper}>
                  <VideoView
                    player={player}
                    style={styles.video}
                    contentFit="cover"
                    nativeControls={false}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.4)"]}
                    style={styles.mediaGradient}
                  />
                  <TouchableOpacity
                    style={styles.videoOverlay}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleVideoPlayback();
                    }}
                  >
                    {!isVideoPlaying && (
                      <BlurView intensity={30} style={styles.playButtonBlur}>
                        <View style={styles.playButton}>
                          <Ionicons name="play" size={24} color="white" />
                        </View>
                      </BlurView>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.muteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                  >
                    <BlurView intensity={30} style={styles.muteButtonBlur}>
                      <Ionicons
                        name={isMuted ? "volume-mute" : "volume-high"}
                        size={18}
                        color="white"
                      />
                    </BlurView>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: post.media[0] }}
                    style={styles.media}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.3)"]}
                    style={styles.mediaGradient}
                  />
                </View>
              )}
            </View>
        )}

        {/* Actions */}
        <View 
          style={styles.actions} 
          onTouchStart={(e) => e.stopPropagation()}
        >
          <View style={styles.leftActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <Animated.View
                style={[
                  styles.actionIconContainer,
                  { transform: [{ scale: likeAnimation }] },
                ]}
              >
                <LinearGradient
                  colors={
                    isLiked
                      ? [theme.energetic, "#FF8A80"]
                      : [
                          isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
                          isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.03)",
                        ]
                  }
                  style={styles.actionIconGradient}
                >
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={20}
                    color={isLiked ? "white" : theme.text}
                  />
                </LinearGradient>
              </Animated.View>
              <Text
                style={[
                  styles.actionText,
                  { color: isLiked ? theme.energetic : theme.placeholder },
                ]}
              >
                {post.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <LinearGradient
                  colors={[
                    isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
                    isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.03)",
                  ]}
                  style={styles.actionIconGradient}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color={theme.text}
                  />
                </LinearGradient>
              </View>
              <Text style={[styles.actionText, { color: theme.placeholder }]}>
                {post.comments}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <LinearGradient
                  colors={[
                    isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
                    isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.03)",
                  ]}
                  style={styles.actionIconGradient}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={18}
                    color={theme.text}
                  />
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <LinearGradient
                colors={
                  post.isSaved
                    ? [theme.gradientStart, theme.gradientEnd]
                    : [
                        isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)",
                        isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.03)",
                      ]
                }
                style={styles.actionIconGradient}
              >
                <Ionicons
                  name={post.isSaved ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color={post.isSaved ? "white" : theme.text}
                />
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tags and Timestamp in one row to save space */}
        <View style={styles.footerContainer}>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <Animated.View
                  key={index}
                  style={{
                    transform: [
                      {
                        rotate: tagRotateAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            `${-1 + (index % 3)}deg`,
                            `${1 - (index % 3)}deg`,
                          ],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity style={styles.tagButton}>
                    <LinearGradient
                      colors={[theme.gradientStart, theme.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.tagGradient}
                    >
                      <Text style={styles.tagText}>#{tag}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}

          {/* Timestamp */}
          <View style={styles.footer}>
            <Ionicons
              name="time-outline"
              size={12}
              color={theme.placeholder}
              style={styles.timeIcon}
            />
            <Text style={[styles.timestamp, { color: theme.placeholder }]}>
              {post.timestamp}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  containerOuter: {
    width: cardWidth,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  container: {
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "white",
  },
  userTextContainer: {
    marginLeft: 12,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontWeight: "700",
    fontSize: 16,
  },
  followingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  followingText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  universityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  university: {
    fontSize: 14,
    marginLeft: 4,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  mediaContainer: {
    width: "100%",
    height: cardWidth * 0.6, // Reduced from 0.75 for a more compact look
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8, // Reduced from 12
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  mediaGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  videoWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonBlur: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  muteButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 10,
  },
  muteButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8, // Reduced from 12
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionIconContainer: {
    width: 32, // Reduced from 40
    height: 32, // Reduced from 40
    justifyContent: "center",
    alignItems: "center",
  },
  actionIconGradient: {
    width: 28, // Reduced from 36
    height: 28, // Reduced from 36
    borderRadius: 14, // Reduced from 18
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 13, // Reduced from 14
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    paddingRight: 8,
  },
  tagButton: {
    marginRight: 6, // Reduced from 8
    marginBottom: 6, // Reduced from 8
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tagGradient: {
    paddingHorizontal: 10, // Reduced from 12
    paddingVertical: 4, // Reduced from 6
    borderRadius: 12, // Reduced from 16
  },
  tagText: {
    color: "white",
    fontSize: 12, // Reduced from 14
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12, // Reduced from 16
  },
});

export default PostCard;
