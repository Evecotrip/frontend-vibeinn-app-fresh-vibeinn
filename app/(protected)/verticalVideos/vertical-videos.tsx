import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VerticalVideo from '../../../components/feed/VerticalVideo';
import { useThemes } from '../../../hooks/use-themes';
import { mockVerticalVideoData, Post } from '../../../mock/feed/verticalVideosData';

const { height, width } = Dimensions.get('window');
const REEL_HEIGHT = height;
const BATCH_SIZE = 3;
const MAX_VIDEO_SLOTS = 10; // Fixed number of video slots

// Pre-define styles outside component to avoid recreation
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listContainer: {
    flexGrow: 1,
  },
  reelContainer: {
    height: REEL_HEIGHT,
    width: width,
    backgroundColor: '#000',
  },
  scrollIndicator: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -50 }],
    alignItems: 'center',
    zIndex: 100,
  },
  scrollDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginVertical: 3,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 200,
  },
  loadingText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 200,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

const VerticalVideos = React.memo(() => {
  const { theme } = useThemes();
  const insets = useSafeAreaInsets();
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0); // Force update when needed
  const [isScrolling, setIsScrolling] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // Batch loading state
  const [displayedVideos, setDisplayedVideos] = useState<Post[]>(() => 
    mockVerticalVideoData.slice(0, BATCH_SIZE)
  );
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(mockVerticalVideoData.length > BATCH_SIZE);

  // Create a fixed array of video slots that never changes in length
  const [videoSlots, setVideoSlots] = useState<Post[]>(() => {
    // Initialize with empty posts to maintain consistent array length
    const emptyPost: Post = {
      id: 'empty',
      type: 'video',
      username: '',
      userAvatar: '',
      university: '',
      content: '',
      media: [],
      videoUrl: '',
      likes: 0,
      comments: 0,
      timestamp: '',
      isLiked: false,
      isSaved: false,
      tags: []
    };
    
    const slots = new Array(MAX_VIDEO_SLOTS).fill(null).map((_, index) => ({
      ...emptyPost,
      id: `slot-${index}`,
    }));
    
    // Fill first slots with actual video data
    displayedVideos.forEach((video, index) => {
      if (index < MAX_VIDEO_SLOTS) {
        slots[index] = video;
      }
    });
    
    return slots;
  });

  // Update video slots when displayed videos change
  useEffect(() => {
    setVideoSlots(prevSlots => {
      const newSlots = [...prevSlots];
      
      // Create empty post template for unfilled slots
      const emptyPost: Post = {
        id: 'empty',
        type: 'video',
        username: '',
        userAvatar: '',
        university: '',
        content: '',
        media: [],
        videoUrl: '',
        likes: 0,
        comments: 0,
        timestamp: '',
        isLiked: false,
        isSaved: false,
        tags: []
      };
      
      // Update slots with new video data
      for (let i = 0; i < MAX_VIDEO_SLOTS; i++) {
        if (i < displayedVideos.length) {
          newSlots[i] = displayedVideos[i];
        } else {
          newSlots[i] = { ...emptyPost, id: `slot-${i}` };
        }
      }
      
      return newSlots;
    });
  }, [displayedVideos]);
  
  // Debug logging for activeReelIndex changes
  useEffect(() => {
    console.log(`Active reel index changed to: ${activeReelIndex}`);
    console.log(`Total displayed videos: ${displayedVideos.length}`);
    console.log(`Video IDs in order:`, displayedVideos.map(v => v.id));
  }, [activeReelIndex, displayedVideos]);
  
  const listRef = useRef<any>(null);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const momentumTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (momentumTimeoutRef.current) {
        clearTimeout(momentumTimeoutRef.current);
      }
    };
  }, []);

  // Handle focus and back button
  useFocusEffect(
    useCallback(() => {
      // Hide status bar for full immersion
      StatusBar.setHidden(true, 'slide');
      
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        StatusBar.setHidden(false, 'slide');
        router.back();
        return true;
      });

      return () => {
        StatusBar.setHidden(false, 'slide');
        backHandler.remove();
      };
    }, [])
  );

  // Auto-hide header after inactivity
  useEffect(() => {
    const autoHideHeader = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (!isScrolling) {
          hideHeader();
        }
      }, 3000);
    };

    if (showHeader && !isScrolling) {
      autoHideHeader();
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [showHeader, isScrolling]);

  const loadNextBatch = useCallback(async () => {
    if (isLoadingMore || !hasMoreData) return;
    
    setIsLoadingMore(true);
    
    try {
      // Simulate API delay (remove this in production)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const nextBatch = currentBatch + 1;
      const startIndex = nextBatch * BATCH_SIZE;
      const endIndex = Math.min(startIndex + BATCH_SIZE, mockVerticalVideoData.length);
      
      if (startIndex < mockVerticalVideoData.length) {
        const newVideos = mockVerticalVideoData.slice(startIndex, endIndex);
        
        setDisplayedVideos(prev => [...prev, ...newVideos]);
        setCurrentBatch(nextBatch);
        
        // Check if we've loaded all available data
        if (endIndex >= mockVerticalVideoData.length) {
          setHasMoreData(false);
        }
      }
    } catch (error) {
      console.error('Error loading next batch:', error);
      setVideoError('Failed to load more videos');
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreData, currentBatch]);

  const hideHeader = useCallback(() => {
    if (!showHeader) return;
    
    Animated.timing(headerOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowHeader(false);
    });
  }, [showHeader, headerOpacity]);

  const showHeaderTemporarily = useCallback(() => {
    if (showHeader) return;
    
    setShowHeader(true);
    headerOpacity.setValue(0);
    
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showHeader, headerOpacity]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Only set scrolling to true during active dragging, not passive scrolling
    if (!showHeader) {
      showHeaderTemporarily();
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set a shorter timeout for hiding header
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 100); // Reduced from 150ms
  }, [showHeader, showHeaderTemporarily]);

  const handleMomentumScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = e.nativeEvent.contentOffset.y;
    const newIndex = Math.round(contentOffset / REEL_HEIGHT);
    
    // Ensure index is within bounds of actual video content (not empty slots)
    const clampedIndex = Math.max(0, Math.min(newIndex, displayedVideos.length - 1));
    
    console.log(`Momentum scroll end: newIndex=${newIndex}, clampedIndex=${clampedIndex}, activeReelIndex=${activeReelIndex}, availableVideos=${displayedVideos.length}`);
    
    if (clampedIndex !== activeReelIndex) {
      setActiveReelIndex(clampedIndex);
      setForceUpdateCounter(prev => prev + 1); // Force update to re-render with new active state
    }

    // Load more videos when user is near the end (within 2 videos)
    if (clampedIndex >= displayedVideos.length - 2 && hasMoreData && !isLoadingMore) {
      loadNextBatch();
    }

    // Immediately set scrolling to false on momentum end
    setIsScrolling(false);
    
    // Clear any existing momentum timeout
    if (momentumTimeoutRef.current) {
      clearTimeout(momentumTimeoutRef.current);
      momentumTimeoutRef.current = null;
    }
  }, [activeReelIndex, displayedVideos.length, hasMoreData, isLoadingMore, loadNextBatch]);

  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
    console.log('Scroll drag started');
    if (!showHeader) {
      showHeaderTemporarily();
    }
  }, [showHeader, showHeaderTemporarily]);

  const handleBackPress = useCallback(() => {
    StatusBar.setHidden(false, 'slide');
    router.back();
  }, []);

  const handleVideoTap = useCallback(() => {
    if (!showHeader) {
      showHeaderTemporarily();
    }
  }, [showHeader, showHeaderTemporarily]);

  const handleDoubleTap = useCallback(() => {
    // Handle double tap if needed
  }, []);

  const handleVideoError = useCallback((error: string) => {
    console.error('Video playback error:', error);
    setVideoError(error);
    // Could show a retry button or skip to next video
  }, []);

  // Render item with stable slot approach - keep callback reference stable
  const renderItem = useCallback(({ item, index }: { item: Post; index: number }) => {
    // Skip rendering for empty slots beyond actual video data
    if (item.id.startsWith('slot-') && item.username === '') {
      return <View style={[styles.reelContainer, { backgroundColor: 'transparent' }]} />;
    }
    
    console.log(`Rendering video ${item.id} at slot ${index}: timestamp=${Date.now()}`);
    
    return (
      <View style={styles.reelContainer}>
        <VerticalVideo 
          post={item} 
          isActive={index === activeReelIndex}
          onSingleTap={handleVideoTap}
          onDoubleTap={handleDoubleTap}
        />
      </View>
    );
  }, [activeReelIndex, handleVideoTap, handleDoubleTap]); // Need activeReelIndex for isActive prop

  const keyExtractor = useCallback((item: Post, index: number) => `slot-${index}`, []);

  // Memoize scroll indicator dots to prevent unnecessary re-renders
  const scrollIndicatorDots = useMemo(() => 
    displayedVideos.map((_, index) => (
      <View
        key={index}
        style={[
          styles.scrollDot,
          {
            backgroundColor: index === activeReelIndex 
              ? 'white' 
              : 'rgba(255,255,255,0.3)',
            transform: [{ 
              scale: index === activeReelIndex ? 1.2 : 1 
            }],
          },
        ]}
      />
    )), [activeReelIndex, displayedVideos.length]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Vertical Videos Feed */}
      <FlatList
        ref={listRef}
        data={videoSlots}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        extraData={forceUpdateCounter}
        showsVerticalScrollIndicator={false}
        pagingEnabled={true}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={REEL_HEIGHT}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.listContainer}
        bounces={false}
        removeClippedSubviews={false}
        windowSize={5}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        initialNumToRender={3}
        getItemLayout={(data, index) => ({
          length: REEL_HEIGHT,
          offset: REEL_HEIGHT * index,
          index,
        })}
      />

      {/* Header with back button */}
      {showHeader && (
        <Animated.View 
          style={[
            styles.header, 
            { 
              paddingTop: insets.top + 10,
              opacity: headerOpacity,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Scroll Indicator */}
      <View style={styles.scrollIndicator}>
        {scrollIndicatorDots}
      </View>

      {/* Loading Indicator */}
      {isLoadingMore && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="white" />
          <Text style={styles.loadingText}>Loading more videos...</Text>
        </View>
      )}

      {/* Error Message */}
      {videoError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{videoError}</Text>
          <TouchableOpacity 
            onPress={() => setVideoError(null)}
            style={{ marginTop: 8, padding: 4 }}
          >
            <Text style={[styles.errorText, { fontWeight: 'bold' }]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

export default VerticalVideos;