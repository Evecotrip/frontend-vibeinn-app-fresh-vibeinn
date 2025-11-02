import { Ionicons } from "@expo/vector-icons";
import { useEvent, useEventListener } from "expo";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// Memoized component to prevent unnecessary re-renders
const VerticalVideo: React.FC<VerticalVideoProps> = React.memo(({ 
  post, 
  isActive = false,
  onDoubleTap,
  onSingleTap 
}) => {
  const { theme } = useThemes();
  
  // Debug: Track component lifecycle
  const componentCreatedRef = useRef(Date.now());
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  
  console.log(`VerticalVideo ${post.id}: render #${renderCountRef.current}, created at ${componentCreatedRef.current}, isActive=${isActive}`);
  
  // State with initial values from props to reduce re-renders
  const [isLiked, setIsLiked] = useState(() => post.isLiked || false);
  const [likesCount, setLikesCount] = useState(() => post.likes);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Consolidated refs for better cleanup
  const refs = useRef({
    isMounted: true,
    currentPostId: post.id,
    hasTriggeredPlay: false,
    controlsTimer: null as ReturnType<typeof setTimeout> | null,
    progressTimer: null as ReturnType<typeof setInterval> | null,
  });

  // Animation refs grouped for better organization
  const animations = useRef({
    like: new Animated.Value(1),
    heart: new Animated.Value(0),
    controlsOpacity: new Animated.Value(0),
    progress: new Animated.Value(0),
    pulse: new Animated.Value(1),
  });

  // Memoized video player to prevent recreation on every render
  const player = useVideoPlayer(post.videoUrl || null, useCallback((player: any) => {
    if (player) {
      player.loop = true;
      player.muted = isMuted;
      player.timeUpdateEventInterval = 0.5; // Reduced frequency for better performance
    }
  }, [isMuted]));

  // Memoized cleanup functions
  const cleanup = useMemo(() => ({
    clearProgressTimer: () => {
      if (refs.current.progressTimer) {
        clearInterval(refs.current.progressTimer);
        refs.current.progressTimer = null;
      }
    },
    clearControlsTimer: () => {
      if (refs.current.controlsTimer) {
        clearTimeout(refs.current.controlsTimer);
        refs.current.controlsTimer = null;
      }
    },
  }), []);

  // Optimized player operations with better error handling
  const safePlayerOperation = useCallback(async (
    operation: () => Promise<void> | void, 
    operationName: string
  ): Promise<boolean> => {
    if (!refs.current.isMounted || !player || refs.current.currentPostId !== post.id) {
      console.log(`Skipping ${operationName}: invalid state`);
      return false;
    }
    
    try {
      if (player.status === 'error') {
        console.log(`Skipping ${operationName}: player in error state`);
        return false;
      }
      
      await operation();
      console.log(`${operationName} successful for ${post.id}`);
      return true;
    } catch (error) {
      console.log(`Error in ${operationName}:`, error);
      return false;
    }
  }, [player, post.id]);

  // Memoized player control functions
  const playerControls = useMemo(() => ({
    play: () => safePlayerOperation(() => player?.play(), 'play'),
    pause: () => safePlayerOperation(() => player?.pause(), 'pause'),
    replay: () => safePlayerOperation(() => player?.replay(), 'replay'),
  }), [safePlayerOperation, player]);

  // Update refs when post changes
  useEffect(() => {
    refs.current.currentPostId = post.id;
    refs.current.hasTriggeredPlay = false;
  }, [post.id]);

  // Cleanup effect with proper dependencies
  useEffect(() => {
    refs.current.isMounted = true;
    
    return () => {
      console.log(`Cleaning up video ${post.id}`);
      refs.current.isMounted = false;
      refs.current.hasTriggeredPlay = false;
      
      cleanup.clearProgressTimer();
      cleanup.clearControlsTimer();
      
      playerControls.pause();
    };
  }, [post.id, cleanup, playerControls]);

  // Video player events
  const { status } = useEvent(player, 'statusChange', { 
    status: player?.status || 'idle' 
  });
  const { isPlaying: playerIsPlaying } = useEvent(player, 'playingChange', { 
    isPlaying: player?.playing || false 
  });

  // Handle video end with replay
  useEventListener(player, 'playToEnd', useCallback(() => {
    if (isActive && isVideoLoaded && refs.current.isMounted && refs.current.currentPostId === post.id) {
      playerControls.replay().then(() => {
        if (refs.current.isMounted) {
          setProgress(0);
          animations.current.progress.setValue(0);
        }
      });
    }
  }, [isActive, isVideoLoaded, post.id, playerControls]));

  // Reset state when post changes
  useEffect(() => {
    if (refs.current.currentPostId !== post.id) return;
    
    console.log(`Resetting state for ${post.id}`);
    refs.current.hasTriggeredPlay = false;
    
    playerControls.pause();
    setIsVideoLoaded(false);
    setIsPlaying(false);
    setProgress(0);
    setIsBuffering(false);
    animations.current.progress.setValue(0);
    
    cleanup.clearProgressTimer();
    cleanup.clearControlsTimer();
  }, [post.id, playerControls, cleanup]);

  // Handle video status changes
  useEffect(() => {
    if (!refs.current.isMounted || refs.current.currentPostId !== post.id) return;
    
    if (status === 'readyToPlay' && !isVideoLoaded) {
      console.log(`Video ${post.id} ready to play`);
      setIsVideoLoaded(true);
      
      safePlayerOperation(() => {
        if (player?.duration) {
          setDuration(player.duration);
        }
      }, 'setDuration');
    } else if (status === 'loading') {
      setIsBuffering(true);
    } else if (status === 'error') {
      setIsBuffering(false);
      console.log(`Video ${post.id} error`);
    }
  }, [status, isVideoLoaded, post.id, player, safePlayerOperation]);

  // Optimized play/pause logic with debouncing
  useEffect(() => {
    if (!refs.current.isMounted || refs.current.currentPostId !== post.id) return;

    const handlePlayState = async () => {
      if (isActive && isVideoLoaded && status === 'readyToPlay' && !refs.current.hasTriggeredPlay) {
        console.log(`Starting playback for ${post.id}`);
        refs.current.hasTriggeredPlay = true;
        setIsBuffering(true);
        
        const success = await playerControls.play();
        if (refs.current.isMounted) {
          setIsPlaying(success);
          setIsBuffering(false);
          if (success) startProgressTimer();
        }
      } else if (!isActive && refs.current.hasTriggeredPlay) {
        console.log(`Stopping playback for ${post.id}`);
        refs.current.hasTriggeredPlay = false;
        
        await playerControls.pause();
        if (refs.current.isMounted) {
          setIsPlaying(false);
          cleanup.clearProgressTimer();
          setProgress(0);
          animations.current.progress.setValue(0);
        }
      }
    };

    const timeoutId = setTimeout(handlePlayState, 100); // Debounce state changes
    return () => clearTimeout(timeoutId);
  }, [isActive, isVideoLoaded, status, post.id, playerControls, cleanup]);

  // Optimized progress timer with less frequent updates
  const startProgressTimer = useCallback(() => {
    cleanup.clearProgressTimer();
    if (!isActive || !refs.current.isMounted) return;
    
    refs.current.progressTimer = setInterval(() => {
      if (!refs.current.isMounted || !isActive || refs.current.currentPostId !== post.id) {
        cleanup.clearProgressTimer();
        return;
      }
      
      safePlayerOperation(() => {
        if (player && isPlaying && isVideoLoaded && player.duration > 0) {
          const currentProgress = player.currentTime / player.duration;
          
          // Only update if progress changed significantly (reduces renders)
          if (Math.abs(currentProgress - progress) > 0.02) {
            setProgress(currentProgress);
            
            // Use requestAnimationFrame for smoother animation
            requestAnimationFrame(() => {
              if (refs.current.isMounted) {
                Animated.timing(animations.current.progress, {
                  toValue: currentProgress,
                  duration: 100,
                  useNativeDriver: false,
                }).start();
              }
            });
          }
        }
      }, 'updateProgress');
    }, 500); // Reduced frequency from 250ms to 500ms
  }, [isActive, isPlaying, isVideoLoaded, post.id, cleanup, safePlayerOperation, player, progress]);

  // Muted state effect
  useEffect(() => {
    if (!isVideoLoaded || !refs.current.isMounted) return;

    safePlayerOperation(() => {
      if (player) {
        player.muted = isMuted;
        
        // Animate mute button feedback
        Animated.sequence([
          Animated.timing(animations.current.pulse, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(animations.current.pulse, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 'setMuted');
  }, [isMuted, isVideoLoaded, player, safePlayerOperation]);

  // Sync playing state with reduced frequency
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isActive && refs.current.isMounted && playerIsPlaying !== isPlaying) {
        setIsPlaying(playerIsPlaying);
        if (playerIsPlaying && !refs.current.progressTimer) {
          startProgressTimer();
        } else if (!playerIsPlaying) {
          cleanup.clearProgressTimer();
        }
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [playerIsPlaying, isActive, isPlaying, startProgressTimer, cleanup]);

  // Memoized interaction handlers
  const handlers = useMemo(() => ({
    handleLike: () => {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

      // Animate like button
      Animated.sequence([
        Animated.timing(animations.current.like, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animations.current.like, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Show heart animation for likes
      if (newLikedState) {
        animations.current.heart.setValue(0);
        Animated.sequence([
          Animated.timing(animations.current.heart, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animations.current.heart, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },

    handleDoubleTap: () => {
      if (!isLiked) {
        handlers.handleLike();
      }
      onDoubleTap?.();
    },

    handleSingleTap: async () => {
      if (!isVideoLoaded || !isActive || !refs.current.isMounted) return;

      if (isPlaying) {
        const success = await playerControls.pause();
        if (success && refs.current.isMounted) {
          setIsPlaying(false);
          cleanup.clearProgressTimer();
        }
      } else {
        setIsBuffering(true);
        const success = await playerControls.play();
        if (refs.current.isMounted) {
          setIsPlaying(success);
          setIsBuffering(false);
          if (success) startProgressTimer();
        }
      }

      handlers.showControlsBriefly();
      onSingleTap?.();
    },

    toggleMute: () => {
      setIsMuted(!isMuted);
      handlers.showControlsBriefly();
    },

    showControlsBriefly: () => {
      if (!refs.current.isMounted) return;
      
      setShowControls(true);
      Animated.timing(animations.current.controlsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      handlers.hideControlsAfterDelay();
    },

    hideControlsAfterDelay: () => {
      cleanup.clearControlsTimer();
      
      refs.current.controlsTimer = setTimeout(() => {
        if (!refs.current.isMounted) return;
        
        Animated.timing(animations.current.controlsOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          if (refs.current.isMounted) {
            setShowControls(false);
          }
        });
      }, 3000);
    },
  }), [isLiked, isPlaying, isVideoLoaded, isActive, isMuted, onDoubleTap, onSingleTap, playerControls, cleanup, startProgressTimer]);

  // Memoized gestures to prevent recreation
  const gestures = useMemo(() => {
    const singleTapGesture = Gesture.Tap()
      .onEnd(() => runOnJS(handlers.handleSingleTap)());

    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => runOnJS(handlers.handleDoubleTap)());

    return Gesture.Exclusive(doubleTapGesture, singleTapGesture);
  }, [handlers]);

  // Memoized static content to prevent unnecessary re-renders
  const userInfo = useMemo(() => (
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
          <Text style={[styles.university, { color: "rgba(255,255,255,0.8)" }]}>
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
  ), [post.userAvatar, post.username, post.university]);

  const actionButtons = useMemo(() => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={handlers.handleLike}>
        <Animated.View
          style={[
            styles.actionIconContainer,
            { transform: [{ scale: animations.current.like }] },
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
  ), [handlers.handleLike, isLiked, likesCount, post.comments, post.isSaved]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GestureDetector gesture={gestures}>
        <Animated.View style={styles.videoContainer}>
          {post.videoUrl ? (
            <VideoView
              key={`${post.id}-video`}
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
                    width: animations.current.progress.interpolate({
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
                  rotate: animations.current.pulse.interpolate({
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
          {!isPlaying && !isBuffering && isActive && (
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
                opacity: animations.current.heart,
                transform: [
                  {
                    scale: animations.current.heart.interpolate({
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
              style={[styles.videoControls, { opacity: animations.current.controlsOpacity }]}
            >
              <TouchableOpacity onPress={handlers.toggleMute} style={styles.muteButton}>
                <Animated.View style={[{ transform: [{ scale: animations.current.pulse }] }]}>
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

      {userInfo}

      {/* Caption */}
      <View style={styles.captionContainer}>
        <Text style={[styles.caption, { color: "white" }]} numberOfLines={3}>
          {post.content}
        </Text>
      </View>

      {actionButtons}

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
                rotate: isPlaying && isActive ? 
                  animations.current.pulse.interpolate({
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
          Original Audio • {post.username}
        </Text>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  // Only re-render if meaningful props have changed
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.post.videoUrl === nextProps.post.videoUrl &&
    prevProps.post.content === nextProps.post.content &&
    prevProps.post.likes === nextProps.post.likes &&
    prevProps.post.isLiked === nextProps.post.isLiked &&
    prevProps.post.isSaved === nextProps.post.isSaved
  );
});

// Add display name for debugging
VerticalVideo.displayName = 'VerticalVideo';

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