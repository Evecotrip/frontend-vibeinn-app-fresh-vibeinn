import { Ionicons } from "@expo/vector-icons";
import { useEvent, useEventListener } from "expo";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useThemes } from "../../hooks/use-themes";
import { Post } from "../../mock/feed/verticalVideosData";

interface VerticalVideoProps {
  post: Post;
  isActive?: boolean;
  onDoubleTap?: () => void;
  onSingleTap?: () => void;
}

const { width, height } = Dimensions.get("window");
const VIDEO_HEIGHT = height;

const VerticalVideo: React.FC<VerticalVideoProps> = ({ 
  post, 
  isActive = false,
  onDoubleTap,
  onSingleTap 
}) => {
  const { theme } = useThemes();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Animation refs
  const likeAnimation = useRef(new Animated.Value(1)).current;
  const heartAnimation = useRef(new Animated.Value(0)).current;
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  console.log("Rendering VerticalVideo:", post.id, "isActive:", isActive, "isVideoLoaded:", isVideoLoaded, "videoUrl:", post.videoUrl);

  // Video player
  const player = useVideoPlayer(post.videoUrl || null, (player) => {
    player.loop = true;
    player.muted = isMuted;
    player.timeUpdateEventInterval = 0.1; // Update every 100ms
  });

  // Event handlers
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const { isPlaying: playerIsPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  // Handle video end
  useEventListener(player, 'playToEnd', () => {
    if (isActive && isVideoLoaded) {
      player.replay();
      setProgress(0);
      progressAnimation.setValue(0);
    }
  });

  // Reset video loaded state when post changes
  useEffect(() => {
    setIsVideoLoaded(false);
    setIsPlaying(false);
    setProgress(0);
    progressAnimation.setValue(0);
  }, [post.id]);

  // Handle video setup and cleanup
  useEffect(() => {
    const setupVideo = async () => {
      if (!player || !isVideoLoaded) return;

      try {
        if (isActive) {
          setIsBuffering(true);
          await player.play();
          // Use setTimeout to avoid rapid state updates
          setTimeout(() => {
            setIsPlaying(true);
            setIsBuffering(false);
            startProgressTimer();
            hideControlsAfterDelay();
          }, 0);
        } else {
          player.pause();
          setIsPlaying(false);
          clearProgressTimer();
          setProgress(0);
          progressAnimation.setValue(0);
        }
      } catch (error) {
        console.log("Error controlling video:", error);
        setIsBuffering(false);
      }
    };

    setupVideo();

    return () => {
      clearProgressTimer();
      clearControlsTimer();
    };
  }, [isActive, isVideoLoaded, player]);

  // Update muted state with smooth transition
  useEffect(() => {
    const updateMuted = async () => {
      if (!player || !isVideoLoaded) return;

      try {
        player.muted = isMuted;
        
        // Pulse animation for mute button feedback
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.log("Error setting muted state:", error);
      }
    };

    updateMuted();
  }, [isMuted, isVideoLoaded, player]);

  // Progress timer
  const startProgressTimer = useCallback(() => {
    clearProgressTimer();
    progressTimerRef.current = setInterval(async () => {
      if (player && isPlaying && isVideoLoaded) {
        try {
          const currentProgress = player.duration > 0 ? player.currentTime / player.duration : 0;
          setProgress(currentProgress);
          
          Animated.timing(progressAnimation, {
            toValue: currentProgress,
            duration: 100,
            useNativeDriver: false,
          }).start();
        } catch (error) {
          // Silent error handling for progress updates to avoid spam
          clearProgressTimer();
        }
      }
    }, 100);
  }, [player, isPlaying, isVideoLoaded]);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const clearControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  }, []);

  // Handle video load state using player status
  useEffect(() => {
    const handleStatusChange = async () => {
      if (status === 'readyToPlay' && !isVideoLoaded) {
        // Batch state updates to avoid useInsertionEffect warning
        setIsVideoLoaded(true);
        setDuration(player.duration);
        
        if (isActive) {
          try {
            setIsBuffering(true);
            await player.play();
            // Use setTimeout to ensure state updates are not synchronous
            setTimeout(() => {
              setIsPlaying(true);
              setIsBuffering(false);
              startProgressTimer();
            }, 0);
          } catch (error) {
            setIsBuffering(false);
            console.log("Error playing video:", error);
          }
        }
      } else if (status === 'loading') {
        setIsBuffering(true);
      } else if (status === 'error') {
        setIsBuffering(false);
        console.log("Video loading error");
      }
    };

    handleStatusChange();
  }, [status, isVideoLoaded, isActive, player, startProgressTimer]);

  // Enhanced like animation with heart burst
  const handleLike = useCallback(() => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    // Button scale animation
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Heart burst animation for likes
    if (newLikedState) {
      heartAnimation.setValue(0);
      Animated.sequence([
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLiked, likeAnimation, heartAnimation]);

  // Double tap to like
  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      handleLike();
    }
    onDoubleTap?.();
  }, [isLiked, handleLike, onDoubleTap]);

  // Single tap to toggle play/pause
  const handleSingleTap = useCallback(async () => {
    if (!player || !isVideoLoaded) return;

    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
        clearProgressTimer();
      } else {
        setIsBuffering(true);
        player.play();
        setIsPlaying(true);
        setIsBuffering(false);
        startProgressTimer();
      }

      // Show controls briefly
      showControlsBriefly();
    } catch (error) {
      console.log("Error toggling play/pause:", error);
      setIsBuffering(false);
    }
    
    onSingleTap?.();
  }, [isPlaying, isVideoLoaded, player, onSingleTap]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    showControlsBriefly();
  }, [isMuted]);

  const showControlsBriefly = useCallback(() => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    hideControlsAfterDelay();
  }, []);

  const hideControlsAfterDelay = useCallback(() => {
    clearControlsTimer();
    
    controlsTimerRef.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowControls(false);
      });
    }, 3000);
  }, [clearControlsTimer]);

  // Sync isPlaying state with player
  useEffect(() => {
    setIsPlaying(playerIsPlaying);
    if (playerIsPlaying) {
      startProgressTimer();
    } else {
      clearProgressTimer();
    }
  }, [playerIsPlaying, startProgressTimer, clearProgressTimer]);

  // Modern gesture definitions
  const singleTapGesture = Gesture.Tap()
    .onEnd(() => {
      runOnJS(handleSingleTap)();
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(handleDoubleTap)();
    });

  const composedGesture = Gesture.Exclusive(doubleTapGesture, singleTapGesture);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Video Component with Gestures */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.videoContainer}>
            {post.videoUrl ? (
              <VideoView
                key={post.id}
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
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
                "rgba(0,0,0,0.4)",
                "transparent",
                "transparent",
                "rgba(0,0,0,0.7)",
              ]}
              style={styles.gradientOverlay}
            />

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Buffering Indicator */}
            {isBuffering && (
              <View style={styles.bufferingOverlay}>
                <Animated.View style={[styles.bufferingSpinner, {
                  transform: [{
                    rotate: pulseAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }]
                }]}>
                  <Ionicons name="refresh" size={30} color="white" />
                </Animated.View>
              </View>
            )}

            {/* Play/Pause Overlay */}
            {!isPlaying && !isBuffering && (
              <View style={styles.playPauseOverlay}>
                <BlurView intensity={20} style={styles.blurPlayButton}>
                  <Ionicons name="play" size={50} color="white" />
                </BlurView>
              </View>
            )}

            {/* Heart Animation for Double Tap */}
            <Animated.View
              style={[
                styles.heartBurstContainer,
                {
                  opacity: heartAnimation,
                  transform: [
                    {
                      scale: heartAnimation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1.2, 1.8],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="heart" size={80} color="#FF3B30" />
            </Animated.View>

            {/* Video Controls */}
            {showControls && (
              <Animated.View
                style={[styles.videoControls, { opacity: controlsOpacity }]}
              >
                <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
                  <Animated.View style={[{ transform: [{ scale: pulseAnimation }] }]}>
                    <BlurView intensity={50} style={styles.blurControl}>
                      <Ionicons
                        name={isMuted ? "volume-mute" : "volume-high"}
                        size={24}
                        color="white"
                      />
                    </BlurView>
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
      </GestureDetector>

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
              size={14}
              color="rgba(255,255,255,0.8)"
            />
            <Text
              style={[styles.university, { color: "rgba(255,255,255,0.8)" }]}
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
        <Text style={[styles.caption, { color: "white" }]} numberOfLines={3}>
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
                  : ["rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"]
              }
              style={styles.actionIconBackground}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={28}
                color="white"
              />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.actionText}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"]}
              style={styles.actionIconBackground}
            >
              <Ionicons name="chatbubble-outline" size={26} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"]}
              style={styles.actionIconBackground}
            >
              <Ionicons name="paper-plane-outline" size={26} color="white" />
            </LinearGradient>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <LinearGradient
              colors={
                post.isSaved
                  ? ["#0066FF", "#5B21B6"]
                  : ["rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"]
              }
              style={styles.actionIconBackground}
            >
              <Ionicons
                name={post.isSaved ? "bookmark" : "bookmark-outline"}
                size={26}
                color="white"
              />
            </LinearGradient>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"]}
              style={styles.actionIconBackground}
            >
              <Ionicons name="share-social-outline" size={26} color="white" />
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.slice(0, 3).map((tag, index) => (
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
        <Animated.View 
          style={[
            styles.musicIconContainer,
            {
              transform: [{
                rotate: isPlaying ? 
                  pulseAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  }) : '0deg'
              }]
            }
          ]}
        >
          <Ionicons name="musical-notes" size={16} color="white" />
        </Animated.View>
        <Text style={styles.musicText} numberOfLines={1}>
          Original Audio â€¢ {post.username}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: VIDEO_HEIGHT,
    position: "relative",
    backgroundColor: '#000',
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
    pointerEvents: 'none',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'transparent',
  },
  progressBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066FF',
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  blurPlayButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  bufferingSpinner: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBurstContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: 'none',
  },
  videoControls: {
    position: "absolute",
    bottom: 120,
    right: 20,
  },
  muteButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  blurControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  userInfoContainer: {
    position: "absolute",
    bottom: 140,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: width - 120,
  },
  avatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "white",
  },
  userTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontWeight: "700",
    fontSize: 17,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  universityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  university: {
    fontSize: 14,
    marginLeft: 6,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  followButton: {
    marginLeft: 12,
  },
  followGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  captionContainer: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 100,
  },
  caption: {
    fontSize: 15,
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actionsContainer: {
    position: "absolute",
    right: 16,
    bottom: 140,
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  actionIconContainer: {
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  actionIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagsContainer: {
    position: "absolute",
    bottom: 50,
    left: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: width - 120,
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
    fontSize: 13,
    fontWeight: "600",
  },
  musicInfoContainer: {
    position: "absolute",
    bottom: 50,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: 180,
  },
  musicIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0066FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  musicText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
});

export default VerticalVideo;