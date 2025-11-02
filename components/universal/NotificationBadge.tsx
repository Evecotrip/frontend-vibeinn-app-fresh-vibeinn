import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getUnreadCount } from "../../mock/notifications/notificationData";

interface NotificationBadgeProps {
  size?: "small" | "medium" | "large";
}

const NotificationBadge = ({ size = "medium" }: NotificationBadgeProps) => {
  const unreadCount = getUnreadCount();

  if (unreadCount === 0) return null;

  // Determine badge size
  const badgeSize = {
    small: 16,
    medium: 20,
    large: 24,
  }[size];

  const fontSize = {
    small: 10,
    medium: 12,
    large: 14,
  }[size];

  return (
    <View style={[styles.badge, { width: badgeSize, height: badgeSize }]}>
      <Text style={[styles.text, { fontSize }]}>
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#FF3B30", // Red color for notification
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 20,
    paddingHorizontal: 2,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default NotificationBadge;
