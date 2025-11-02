import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemes } from "../../hooks/use-themes";
import { Notification } from "../../mock/notifications/notificationData";

interface NotificationDetailProps {
  notification: Notification;
  onClose: () => void;
  onAction?: () => void;
}

const { width, height } = Dimensions.get("window");
const cardWidth = width * 0.85;
const cardHeight = height * 0.6;

const NotificationDetail = ({
  notification,
  onClose,
  onAction,
}: NotificationDetailProps) => {
  const { theme, isDark } = useThemes();
  const insets = useSafeAreaInsets();

  // Animations
  const modalAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const actionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animations for different elements
    Animated.sequence([
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(actionAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  // Get appropriate action button text based on notification type
  const getActionText = () => {
    const { type } = notification;

    if (type === "follow") return "Follow Back";
    if (type.includes("event")) return "View Event";
    if (type.includes("community")) return "View Community";
    if (
      type === "like" ||
      type === "comment" ||
      type === "mention" ||
      type === "tag"
    )
      return "View Post";
    if (type === "save" || type === "share") return "Thank";
    if (
      type.includes("achievement") ||
      type.includes("badge") ||
      type.includes("streak")
    )
      return "Share";
    if (type === "verification_success") return "Complete Profile";
    if (type === "new_feature") return "Explore";
    if (type === "app_update") return "Update";

    return "View";
  };

  // Get icon for the notification type
  const getIcon = () => {
    const { type } = notification;

    if (type === "like") return "heart";
    if (type === "comment") return "chatbubble";
    if (type === "follow") return "person-add";
    if (type === "save") return "bookmark";
    if (type === "tag" || type === "mention") return "at";
    if (type === "share") return "share-social";
    if (type.includes("event")) return "calendar";
    if (type.includes("community")) return "people";
    if (
      type.includes("achievement") ||
      type.includes("badge") ||
      type.includes("streak")
    )
      return "trophy";
    if (type === "verification_success") return "checkmark-circle";
    if (type === "new_feature" || type === "app_update")
      return "information-circle";

    return "notifications";
  };

  // Get color for the notification type
  const getColor = () => {
    const { type } = notification;

    if (type === "like") return theme.energetic;
    if (type === "comment") return theme.accent1;
    if (type === "follow") return theme.accent2;
    if (type === "save") return theme.accent3;
    if (type === "tag" || type === "mention") return theme.vibrant;
    if (type === "share") return "#34C759";
    if (type.includes("event")) return "#FF2D55";
    if (type.includes("community")) return "#AF52DE";
    if (
      type.includes("achievement") ||
      type.includes("badge") ||
      type.includes("streak")
    )
      return "#FFCC00";

    return theme.primary;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handleClose}>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: modalAnim,
          },
        ]}
      >
        <BlurView
          intensity={isDark ? 60 : 80}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.container,
              {
                backgroundColor: theme.card,
                opacity: modalAnim,
                transform: [
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header */}
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
              <Text style={styles.headerTitle}>Notification</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <BlurView intensity={80} style={styles.closeButtonBlur}>
                  <Ionicons name="close" size={20} color="white" />
                </BlurView>
              </TouchableOpacity>
            </LinearGradient>

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={[
                  styles.content,
                  {
                    opacity: contentAnim,
                    transform: [
                      {
                        translateY: contentAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {/* User info */}
                <View style={styles.userSection}>
                  <LinearGradient
                    colors={[theme.gradientStart, theme.gradientEnd]}
                    style={styles.avatarGradient}
                  >
                    <Image
                      source={{ uri: notification.senderAvatar }}
                      style={styles.avatar}
                    />
                  </LinearGradient>
                  <View style={styles.userInfo}>
                    <Text style={[styles.username, { color: theme.text }]}>
                      {notification.senderName}
                    </Text>
                    {notification.university && (
                      <View style={styles.universityContainer}>
                        <Ionicons
                          name="school-outline"
                          size={14}
                          color={theme.placeholder}
                        />
                        <Text
                          style={[
                            styles.university,
                            { color: theme.placeholder },
                          ]}
                        >
                          {notification.university}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Notification icon and timestamp */}
                <LinearGradient
                  colors={[getColor(), getColor() + "CC"]}
                  style={styles.iconContainer}
                >
                  <Ionicons name={getIcon()} size={24} color="white" />
                </LinearGradient>

                <View style={styles.timeContainer}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={theme.placeholder}
                    style={styles.timeIcon}
                  />
                  <Text
                    style={[styles.timestamp, { color: theme.placeholder }]}
                  >
                    {formatTime(notification.timestamp)}
                  </Text>
                </View>

                {/* Notification content */}
                {notification.contentPreview && (
                  <LinearGradient
                    colors={[
                      isDark
                        ? theme.cardGradientStart
                        : theme.cardGradientStart + "30",
                      isDark
                        ? theme.cardGradientEnd
                        : theme.cardGradientEnd + "20",
                    ]}
                    style={styles.previewContainer}
                  >
                    <Text style={[styles.previewText, { color: theme.text }]}>
                      {notification.contentPreview}
                    </Text>
                  </LinearGradient>
                )}

                {/* Event details */}
                {notification.eventName && (
                  <LinearGradient
                    colors={[
                      isDark
                        ? theme.cardGradientStart
                        : theme.cardGradientStart + "30",
                      isDark
                        ? theme.cardGradientEnd
                        : theme.cardGradientEnd + "20",
                    ]}
                    style={styles.eventContainer}
                  >
                    <LinearGradient
                      colors={["#FF2D55", "#FF9500"]}
                      style={styles.eventIconContainer}
                    >
                      <Ionicons name="calendar" size={20} color="white" />
                    </LinearGradient>
                    <View style={styles.eventDetails}>
                      <Text style={[styles.eventName, { color: theme.text }]}>
                        {notification.eventName}
                      </Text>
                      {notification.eventDate && (
                        <View style={styles.eventDateContainer}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={theme.placeholder}
                            style={styles.timeIcon}
                          />
                          <Text
                            style={[
                              styles.eventDate,
                              { color: theme.placeholder },
                            ]}
                          >
                            {new Date(
                              notification.eventDate
                            ).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                )}

                {/* Community details */}
                {notification.communityName && (
                  <LinearGradient
                    colors={[
                      isDark
                        ? theme.cardGradientStart
                        : theme.cardGradientStart + "30",
                      isDark
                        ? theme.cardGradientEnd
                        : theme.cardGradientEnd + "20",
                    ]}
                    style={styles.communityContainer}
                  >
                    <LinearGradient
                      colors={["#AF52DE", "#5856D6"]}
                      style={styles.communityIconContainer}
                    >
                      <Ionicons name="people" size={20} color="white" />
                    </LinearGradient>
                    <Text style={[styles.communityName, { color: theme.text }]}>
                      {notification.communityName}
                    </Text>
                  </LinearGradient>
                )}

                {/* Achievement details */}
                {notification.achievementName && (
                  <LinearGradient
                    colors={[
                      isDark
                        ? theme.cardGradientStart
                        : theme.cardGradientStart + "30",
                      isDark
                        ? theme.cardGradientEnd
                        : theme.cardGradientEnd + "20",
                    ]}
                    style={styles.achievementContainer}
                  >
                    <View style={styles.badgeIconContainer}>
                      <Text style={styles.badgeIcon}>
                        {notification.badgeIcon || "🏆"}
                      </Text>
                    </View>
                    <Text
                      style={[styles.achievementName, { color: theme.text }]}
                    >
                      {notification.achievementName}
                    </Text>
                  </LinearGradient>
                )}
              </Animated.View>
            </ScrollView>

            {/* Action buttons */}
            <Animated.View
              style={[
                styles.actions,
                {
                  transform: [
                    {
                      translateY: actionAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                  opacity: actionAnim,
                },
              ]}
            >
              <LinearGradient
                colors={[theme.gradientStart, theme.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButtonGradient}
              >
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    handleClose();
                    if (onAction) onAction();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionText}>{getActionText()}</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="white"
                    style={styles.actionIcon}
                  />
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    width: cardWidth,
    maxHeight: cardHeight,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    position: "relative",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: 0 }],
  },
  closeButtonBlur: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  scrollView: {
    maxHeight: cardHeight - 130, // Account for header and action button
  },
  content: {
    padding: 16,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "white",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  universityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  university: {
    fontSize: 14,
    marginLeft: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
  },
  timeIcon: {
    marginRight: 4,
  },
  timestamp: {
    fontSize: 14,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
  eventContainer: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  eventDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventDate: {
    fontSize: 14,
  },
  communityContainer: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  communityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  communityName: {
    fontSize: 16,
    fontWeight: "700",
  },
  achievementContainer: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 204, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  badgeIcon: {
    fontSize: 24,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "700",
  },
  actions: {
    padding: 16,
  },
  actionButtonGradient: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  actionIcon: {
    marginLeft: 8,
  },
});

export default NotificationDetail;
