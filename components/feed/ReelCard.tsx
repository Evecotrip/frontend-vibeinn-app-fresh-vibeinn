import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemes } from "../../hooks/use-themes";
import { Post } from "../../mock/feed/feedData";

interface ReelCardProps {
  post: Post;
  isActive?: boolean;
}

const { width, height } = Dimensions.get("window");
const REEL_HEIGHT = height - 150; // Adjust based on your tab bar height

const ReelCard: React.FC<ReelCardProps> = ({ post, isActive = false }) => {
  const { theme } = useThemes();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Animation refs
  const likeAnimation = useRef(new Animated.Value(1)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const musicNotePosition = useRef(new Animated.Value(0)).current;
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Video player
  const videoPlayer = useVideoPlayer(post.videoUrl ? { uri: post.videoUrl } : null, (player) => {
    player.muted = isMuted;
    player.loop = true;
  });

  // Auto-play if active
  useEffect(() => {
    const setupVideo = () => {
      if (!videoPlayer) return;

      try {
        if (isActive) {
          videoPlayer.play();
          setIsPlaying(true);
          fadeControlsOut();
        } else {
          videoPlayer.pause();
          setIsPlaying(false);
        }
      } catch (error) {
        console.log("Error controlling video:", error);
      }
    };

    setupVideo();
  }, [isActive, videoPlayer]);

  // Update muted state
  useEffect(() => {
    if (!videoPlayer) return;

    try {
      videoPlayer.muted = isMuted;
    } catch (error) {
      console.log("Error setting muted state:", error);
    }
  }, [isMuted, videoPlayer]);

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

  const togglePlayPause = () => {
    if (!videoPlayer) return;

    try {
      if (isPlaying) {
        videoPlayer.pause();
        setIsPlaying(false);
      } else {
        videoPlayer.play();
        setIsPlaying(true);
      }

      // Show controls briefly when tapped
      setShowControls(true);
      fadeControlsOut();
    } catch (error) {
      console.log("Error toggling play/pause:", error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);

    // Animate music note when unmuting
    if (isMuted) {
      animateMusicNote();
    }
  };

  const fadeControlsOut = () => {
    // Clear any existing timer
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    // Reset opacity to 1
    controlsOpacity.setValue(1);

    // Auto-hide controls after a few seconds
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 2000,
      delay: 2000,
      useNativeDriver: true,
    }).start();

    // Set timer to hide controls completely
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
  };

  const animateMusicNote = () => {
    // Reset position
    musicNotePosition.setValue(0);

    // Animate music note floating up and fading out
    Animated.timing(musicNotePosition, {
      toValue: -100,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Video Component */}
      <Pressable style={styles.videoContainer} onPress={togglePlayPause}>
        {post.videoUrl ? (
          <VideoView
            style={styles.video}
            player={videoPlayer}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            contentFit="cover"
          />
        ) : (
          <Image
            source={{ uri: post.media?.[0] || post.userAvatar }}
            style={styles.video}
            resizeMode="cover"
          />
        )}

        {/* Gradient Overlays */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.5)",
            "transparent",
            "transparent",
            "rgba(0,0,0,0.6)",
          ]}
          style={styles.gradientOverlay}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <View style={styles.playPauseOverlay}>
            <BlurView intensity={30} style={styles.blurPlayButton}>
              <Ionicons name="play" size={40} color="white" />
            </BlurView>
          </View>
        )}

        {/* Video Controls */}
        {showControls && (
          <Animated.View
            style={[styles.videoControls, { opacity: controlsOpacity }]}
          >
            <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
              <BlurView intensity={40} style={styles.blurControl}>
                <Ionicons
                  name={isMuted ? "volume-mute" : "volume-high"}
                  size={22}
                  color="white"
                />
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Music Note Animation */}
        {!isMuted && (
          <Animated.View
            style={[
              styles.musicNote,
              {
                transform: [
                  { translateY: musicNotePosition },
                  {
                    scale: musicNotePosition.interpolate({
                      inputRange: [-100, 0],
                      outputRange: [0, 1],
                    }),
                  },
                ],
                opacity: musicNotePosition.interpolate({
                  inputRange: [-100, -50, 0],
                  outputRange: [0, 1, 1],
                }),
              },
            ]}
          >
            <Ionicons name="musical-note" size={24} color="white" />
          </Animated.View>
        )}
      </Pressable>

      {/* User Info */}
      <View style={styles.userInfoContainer}>
        <LinearGradient
          colors={["#0066FF", "#5B21B6"]}
          style={styles.avatarGradient}
        >
          <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
        </LinearGradient>
        <View style={styles.userTextContainer}>
          <Text style={[styles.username, { color: "white" }]}>
            {post.username}
          </Text>
          <View style={styles.universityRow}>
            <Ionicons
              name="school-outline"
              size={12}
              color="rgba(255,255,255,0.7)"
            />
            <Text
              style={[styles.university, { color: "rgba(255,255,255,0.7)" }]}
            >
              {post.university}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.followButton}>
          <LinearGradient
            colors={["#0066FF", "#5B21B6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.followGradient}
          >
            <Text style={styles.followButtonText}>Follow</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={[styles.caption, { color: "white" }]} numberOfLines={2}>
          {post.content}
        </Text>
      </View>

      {/* Right Side Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Animated.View
            style={[
              styles.actionIconContainer,
              { transform: [{ scale: likeAnimation }] },
            ]}
          >
            <LinearGradient
              colors={
                isLiked
                  ? ["#FF3B30", "#FF375F"]
                  : ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"]
              }
              style={styles.actionIconBackground}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={26}
                color="white"
              />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"]}
              style={styles.actionIconBackground}
            >
              <Ionicons name="chatbubble-outline" size={24} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"]}
              style={styles.actionIconBackground}
            >
              <Ionicons name="paper-plane-outline" size={24} color="white" />
            </LinearGradient>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <LinearGradient
              colors={
                post.isSaved
                  ? ["#0066FF", "#5B21B6"]
                  : ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"]
              }
              style={styles.actionIconBackground}
            >
              <Ionicons
                name={post.isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color="white"
              />
            </LinearGradient>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"]}
              style={styles.actionIconBackground}
            >
              <Ionicons name="share-social-outline" size={24} color="white" />
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tagButton}>
              <LinearGradient
                colors={["#0066FF", "#5B21B6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tagGradient}
              >
                <Text style={styles.tagText}>#{tag}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Music Info */}
      <View style={styles.musicInfoContainer}>
        <View style={styles.musicIconContainer}>
          <Ionicons name="musical-notes" size={16} color="white" />
        </View>
        <Text style={styles.musicText} numberOfLines={1}>
          Original Audio • {post.username}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: REEL_HEIGHT,
    position: "relative",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  blurPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  videoControls: {
    position: "absolute",
    bottom: 100,
    right: 20,
  },
  muteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  blurControl: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  musicNote: {
    position: "absolute",
    right: 30,
    bottom: 150,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfoContainer: {
    position: "absolute",
    bottom: 120,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: width - 100,
  },
  avatarGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  userTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontWeight: "700",
    fontSize: 16,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  universityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  university: {
    fontSize: 14,
    marginLeft: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  followButton: {
    marginLeft: 8,
  },
  followGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  captionContainer: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 80,
  },
  caption: {
    fontSize: 15,
    lineHeight: 20,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actionsContainer: {
    position: "absolute",
    right: 16,
    bottom: 120,
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
    marginBottom: 16,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  actionIconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagsContainer: {
    position: "absolute",
    bottom: 30,
    left: 16,
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
  musicInfoContainer: {
    position: "absolute",
    bottom: 30,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: 150,
  },
  musicIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0066FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  musicText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
});

export default ReelCard;
