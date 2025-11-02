import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NotificationDetail from "../../../../components/notifications/NotificationDetail";
import { useThemes } from "../../../../hooks/use-themes";
import {
  getGroupedNotifications,
  getNotificationMessage,
  Notification,
} from "../../../../mock/notifications/notificationData";

const { width } = Dimensions.get("window");
const cardWidth = width - 32;

const NotificationScreen = () => {
  const { theme, isDark } = useThemes();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(getGroupedNotifications());
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  // Animations
  const headerScaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerOpacityAnim = useRef(new Animated.Value(0)).current;

  // Animate header on mount
  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Convert grouped notifications to sections for SectionList
  const sections = [
    { title: "Today", data: notifications.today },
    { title: "Yesterday", data: notifications.yesterday },
    { title: "This Week", data: notifications.thisWeek },
    { title: "Earlier", data: notifications.earlier },
  ].filter((section) => section.data.length > 0);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setNotifications(getGroupedNotifications());
      setRefreshing(false);
    }, 1000);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark notification as read
    const updatedNotifications = { ...notifications };

    // Find and update the notification in the appropriate section
    for (const section of Object.keys(updatedNotifications) as Array<
      keyof typeof updatedNotifications
    >) {
      const index = updatedNotifications[section].findIndex(
        (n) => n.id === notification.id
      );
      if (index !== -1) {
        updatedNotifications[section][index] = {
          ...updatedNotifications[section][index],
          isRead: true,
        };
        break;
      }
    }

    setNotifications(updatedNotifications);
    setSelectedNotification(notification);
  };

  const getNotificationIcon = (type: string) => {
    switch (true) {
      case type.includes("like"):
        return "heart";
      case type.includes("comment"):
        return "chatbubble";
      case type.includes("follow"):
        return "person-add";
      case type.includes("save"):
        return "bookmark";
      case type.includes("tag"):
      case type.includes("mention"):
        return "at";
      case type.includes("share"):
        return "share-social";
      case type.includes("event"):
        return "calendar";
      case type.includes("community"):
        return "people";
      case type.includes("achievement"):
      case type.includes("badge"):
      case type.includes("streak"):
        return "trophy";
      case type === "verification_success":
        return "checkmark-circle";
      case type === "new_feature":
      case type === "app_update":
        return "information-circle";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (true) {
      case type.includes("like"):
        return theme.energetic;
      case type.includes("comment"):
        return theme.accent1;
      case type.includes("follow"):
        return theme.accent2;
      case type.includes("save"):
        return theme.accent3;
      case type.includes("tag"):
      case type.includes("mention"):
        return theme.vibrant;
      case type.includes("share"):
        return "#34C759";
      case type.includes("event"):
        return "#FF2D55";
      case type.includes("community"):
        return "#AF52DE";
      case type.includes("achievement"):
      case type.includes("badge"):
      case type.includes("streak"):
        return "#FFCC00";
      default:
        return theme.primary;
    }
  };

  const renderNotificationItem = ({
    item,
    index,
  }: {
    item: Notification;
    index: number;
  }) => {
    const iconName = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type);
    const message = getNotificationMessage(item);

    // Create a unique animation for each item
    const itemScaleAnim = useRef(new Animated.Value(0.9)).current;
    const itemOpacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Staggered animation for each item
      const delay = index * 50;
      Animated.parallel([
        Animated.spring(itemScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(itemOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          delay,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={{
          transform: [{ scale: itemScaleAnim }],
          opacity: itemOpacityAnim,
          marginHorizontal: 16,
          marginVertical: 6,
          borderRadius: 16,
          shadowColor: iconColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={[
            item.isRead
              ? isDark
                ? theme.card
                : theme.background
              : isDark
              ? theme.cardGradientStart
              : theme.cardGradientStart + "40",
            item.isRead
              ? isDark
                ? theme.card
                : theme.background
              : isDark
              ? theme.cardGradientEnd
              : theme.cardGradientEnd + "30",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.notificationGradient}
        >
          <TouchableOpacity
            style={styles.notificationItem}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[theme.gradientStart, theme.gradientEnd]}
                style={styles.avatarGradient}
              >
                <Image
                  source={{ uri: item.senderAvatar }}
                  style={styles.avatar}
                />
              </LinearGradient>
              <LinearGradient
                colors={[iconColor, iconColor + "CC"]}
                style={styles.iconContainer}
              >
                <Ionicons name={iconName} size={12} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.contentContainer}>
              <Text style={[styles.message, { color: theme.text }]}>
                {message}
              </Text>
              <View style={styles.metaContainer}>
                <View style={styles.timeContainer}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={theme.placeholder}
                    style={styles.timeIcon}
                  />
                  <Text
                    style={[styles.timestamp, { color: theme.placeholder }]}
                  >
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                {item.badgeIcon && (
                  <Text style={styles.badgeIcon}>{item.badgeIcon}</Text>
                )}
              </View>
            </View>
            {!item.isRead && (
              <View
                style={[styles.unreadIndicator, { backgroundColor: iconColor }]}
              />
            )}
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: "transparent" }]}>
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sectionBadge}
      >
        <Text style={styles.sectionBadgeText}>{section.title}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
            colors={[theme.primary, theme.energetic, theme.vibrant]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="notifications-off" size={40} color="white" />
            </LinearGradient>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.placeholder }]}>
              When you get notifications, they'll appear here
            </Text>
          </View>
        }
      />

      {/* Popup Notification Detail */}
      {selectedNotification && (
        <NotificationDetail
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onAction={() => {
            // Handle action based on notification type
            setSelectedNotification(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerGradient: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionBadge: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "white",
  },
  notificationGradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
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
  iconContainer: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    flexShrink: 1,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  badgeIcon: {
    fontSize: 16,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
    alignSelf: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

export default NotificationScreen;
