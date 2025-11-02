import { LegendList } from "@legendapp/list";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import PostCard from "../../../../components/feed/PostCard";
import { useThemes } from "../../../../hooks/use-themes";
import { mockFeedData, Post } from "../../../../mock/feed/feedData";

type TabType = "Global" | "Yours" | "Videos";

const { height, width } = Dimensions.get("window");
const REEL_HEIGHT = height - 150; // Adjust based on your tab bar height
const SCROLL_THRESHOLD = 60; // Increased threshold for better animation

export default function HomeScreen() {
  const { theme } = useThemes();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("Global");
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;

  // Memoize animation interpolations for better performance
  const animations = useMemo(() => ({
    headerHeight: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [80, 60],
      extrapolate: "clamp",
    }),
    headerMarginTop: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [insets.top, insets.top + 15],
      extrapolate: "clamp",
    }),
    logoTranslateY: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [0, -50],
      extrapolate: "clamp",
    }),
    logoOpacity: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD * 0.6],
      outputRange: [1, 0],
      extrapolate: "clamp",
    }),
    switchTranslateY: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [0, -50],
      extrapolate: "clamp",
    }),
    switchOpacity: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD * 0.6],
      outputRange: [1, 0],
      extrapolate: "clamp",
    }),
    tabsTranslateY: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [0, -15],
      extrapolate: "clamp",
    }),
    tabsScale: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [1, 1.1],
      extrapolate: "clamp",
    }),
    tabsPillOpacity: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD * 0.4, SCROLL_THRESHOLD],
      outputRange: [0, 0.7, 1],
      extrapolate: "clamp",
    }),
    tabsPillScale: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD * 0.4, SCROLL_THRESHOLD],
      outputRange: [0.8, 0.95, 1],
      extrapolate: "clamp",
    }),
    tabsWidth: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [width * 0.6, width * 0.7],
      extrapolate: "clamp",
    }),
    tabsPadding: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [8, 12],
      extrapolate: "clamp",
    }),
    tabsBorderRadius: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [16, 25],
      extrapolate: "clamp",
    }),
    tabsShadowOpacity: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD * 0.5, SCROLL_THRESHOLD],
      outputRange: [0, 0.1, 0.25],
      extrapolate: "clamp",
    }),
    tabsShadowRadius: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [0, 8],
      extrapolate: "clamp",
    }),
    tabsElevation: scrollY.interpolate({
      inputRange: [0, SCROLL_THRESHOLD],
      outputRange: [0, 8],
      extrapolate: "clamp",
    }),
  }), [scrollY, insets.top]);

  // Toggle switch handler
  const toggleSwitch = useCallback(() => setIsEnabled((previousState) => !previousState), []);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const handleTabPress = useCallback((tab: string) => {
    if (tab === "Videos") {
      // if Videos tab is pressed, navigate to VerticalVideos screen
      router.push("/(protected)/verticalVideos/vertical-videos");
    } else {
      setActiveTab(tab as TabType);
    }
  }, []);

  const handleExplorePress = useCallback(() => {
    router.push("/(protected)/explore/explore-page");
  }, []);

  const onMomentumScrollEnd = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (activeTab === "Videos") {
      const index = Math.round(
        e.nativeEvent.contentOffset.y / REEL_HEIGHT
      );
      setActiveReelIndex(index);
    }
  }, [activeTab]);

  // Filter posts based on type for reels view
  const reels = useMemo(() => 
    mockFeedData.filter((post) => post.type === "video"),
    []
  );

  // Get the appropriate feed data based on active tab
  const getFeedData = useCallback(() => {
    switch (activeTab) {
      case "Global":
        return mockFeedData;
      case "Yours":
        return mockFeedData
          .filter(
            (post, index) =>
              post.tags?.includes("study") ||
              post.tags?.includes("campus") ||
              post.university === "Stanford University" ||
              post.university === "MIT" ||
              index % 3 === 0
          )
          .map((post) => ({
            ...post,
            isFollowing: true,
            likes: post.likes + Math.floor(Math.random() * 50),
          }));
      case "Videos":
        return reels;
      default:
        return mockFeedData;
    }
  }, [activeTab, reels]);

  const feedData = useMemo(() => getFeedData(), [getFeedData]);

  const renderItem = useCallback(({ item, index }: { item: Post; index: number }) => {
    return <PostCard post={item} />;
  }, []);

  // Filter posts based on type for reels view

  return (
    <SafeAreaView
      edges={["left", "right"]} // Only apply SafeArea to left, right - not top and bottom
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Content */}
      <Animated.View style={styles.contentContainer}>
        <LegendList
          data={feedData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          pagingEnabled={activeTab === "Videos"}
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={activeTab === "Videos" ? REEL_HEIGHT : undefined}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={[
            activeTab !== "Videos"
              ? styles.feedContainer
              : styles.reelsContainer,
            { paddingTop: insets.top + 90 }, // Use safe area top + header space
          ]}
        />
      </Animated.View>

      {/* Floating Header */}
      <Animated.View
        style={[
          styles.floatingHeaderContainer,
          {
            height: animations.headerHeight,
            zIndex: 100,
          },
        ]}
      >
        {/* Header Content */}
        <Animated.View
          style={[
            styles.header,
            {
              marginTop: animations.headerMarginTop,
            },
          ]}
        >
          {/* Left - V Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: animations.logoOpacity,
                transform: [{ translateY: animations.logoTranslateY }],
              },
            ]}
          >
            <Text style={[styles.logo, { color: theme.primary }]}>V</Text>
          </Animated.View>

          {/* Middle - Tabs with Pill Background */}
          <Animated.View
            style={[
              styles.tabsOuterContainer,
              {
                transform: [
                  { translateY: animations.tabsTranslateY },
                  { scale: animations.tabsScale },
                ],
                width: animations.tabsWidth,
              },
            ]}
          >
            {/* Floating Pill Background */}
            <Animated.View
              style={[
                styles.tabsPillBackground,
                {
                  opacity: animations.tabsPillOpacity,
                  backgroundColor: theme.card,
                  borderRadius: animations.tabsBorderRadius,
                  paddingVertical: animations.tabsPadding,
                  paddingHorizontal: animations.tabsPadding,
                  shadowOpacity: animations.tabsShadowOpacity,
                  shadowRadius: animations.tabsShadowRadius,
                  elevation: animations.tabsElevation,
                  transform: [{ scale: animations.tabsPillScale }],
                },
              ]}
            />

            <View style={styles.tabsContainer}>
              {["Global", "Yours", "Videos"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tab,
                    activeTab === tab && {
                      borderBottomColor: theme.primary,
                      borderBottomWidth: 2,
                    },
                  ]}
                  onPress={() => handleTabPress(tab)}
                  accessible={true}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === tab }}
                  accessibilityLabel={`${tab} tab`}
                  accessibilityHint={tab === "Videos" ? "Navigates to vertical videos screen" : `Shows ${tab.toLowerCase()} feed`}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color:
                          activeTab === tab ? theme.primary : theme.placeholder,
                      },
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Right - Switch */}
          {/* Right - Switch 
          <Animated.View
            style={[
              styles.sliderContainer,
              {
                opacity: switchOpacity,
                transform: [{ translateY: switchTranslateY }],
              },
            ]}
          >
            <Switch
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor={isEnabled ? "#ffffff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </Animated.View>
          */}

          {/* Search icon -> Redirect user to Explore page */}
          <Animated.View
            style={[
              styles.sliderContainer,
              {
                opacity: animations.switchOpacity,
                transform: [{ translateY: animations.switchTranslateY }],
              },
            ]}
          >
            <TouchableOpacity 
              onPress={handleExplorePress}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Search and explore"
              accessibilityHint="Opens the explore page to search for content"
            >
              <Text style={{ fontSize: 24, color: theme.primary }}>🔍</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  floatingHeaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    height: "100%",
    // Removed fixed marginTop - now handled by animation
  },
  logoContainer: {
    width: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
  },
  tabsOuterContainer: {
    position: "relative",
    alignSelf: "center",
    justifyContent: "center",
    height: 50,
  },
  tabsPillBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    // iOS shadow
    shadowOpacity: 0.25,
    shadowRadius: 8,
    // Android shadow
    elevation: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    zIndex: 1,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  sliderContainer: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  feedContainer: {
    paddingBottom: 20,
  },
  reelsContainer: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  reelContainer: {
    height: REEL_HEIGHT,
  },
});
