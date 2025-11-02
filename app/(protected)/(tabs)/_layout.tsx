import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NotificationBadge from "../../../components/universal/NotificationBadge";
import { useThemes } from "../../../hooks/use-themes";

const { width } = Dimensions.get("window");

// Define icon names as a type to ensure they are valid Ionicons
type IconName =
  | "calendar-outline"
  | "calendar"
  | "people-outline"
  | "people"
  | "notifications-outline"
  | "notifications"
  | "person-outline"
  | "person";

const TabsLayout = () => {
  const { theme } = useThemes();
  const insets = useSafeAreaInsets();
  const homeAnimationRef = useRef<LottieView>(null);

  // Always play the home animation when component mounts
  useEffect(() => {
    if (homeAnimationRef.current) {
      homeAnimationRef.current.play(1, 50);
    }
  }, []);

  // Custom TabBar component defined inline
  const renderTabBar = ({ state, descriptors, navigation }: any) => {
    return (
      <View style={styles.tabBarContainer}>
        {/* Home Button (Elevated) */}
        <View style={styles.homeButtonContainer}>
          <TouchableOpacity
            style={[styles.homeButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              const route = state.routes.find(
                (r: any) => r.name === "home/index"
              );
              if (route) {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!event.defaultPrevented) {
                  navigation.navigate("home/index");
                }
              }
            }}
            activeOpacity={0.9}
          >
            <LottieView
              ref={homeAnimationRef}
              source={require("../../../assets/json/home-icon.json")}
              style={styles.homeLottie}
              autoPlay={true}
              loop={true}
            />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[theme.card + "E6", theme.card]}
          style={[
            styles.tabBar,
            {
              paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            },
          ]}
        >
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name.replace("/index", "");

            const isFocused = state.index === index;

            // Get icon name based on route
            let iconName: IconName | undefined;
            let activeIconName: IconName | undefined;

            if (route.name === "events/index") {
              iconName = "calendar-outline";
              activeIconName = "calendar";
            } else if (route.name === "community/index") {
              iconName = "people-outline";
              activeIconName = "people";
            } else if (route.name === "notification/index") {
              iconName = "notifications-outline";
              activeIconName = "notifications";
            } else if (route.name === "profile/index") {
              iconName = "person-outline";
              activeIconName = "person";
            }

            // For the middle tab (Home), render an empty space
            if (route.name === "home/index") {
              return <View key={route.key} style={styles.centerButtonSpace} />;
            }

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <View style={styles.tabItemContent}>
                  {iconName && (
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={
                          isFocused && activeIconName
                            ? activeIconName
                            : iconName
                        }
                        size={24}
                        color={isFocused ? theme.primary : theme.text + "80"}
                      />
                      {/* Add notification badge for notification tab */}
                      {route.name === "notification/index" && (
                        <NotificationBadge size="small" />
                      )}
                    </View>
                  )}
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused ? theme.primary : theme.text + "80",
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: "none",
          height: 0,
          opacity: 0,
          position: "absolute",
          bottom: -100, // Move it off-screen
        }, // Completely hide the default tab bar
      }}
      tabBar={renderTabBar} // Use our inline custom TabBar component
      initialRouteName="home/index" // Explicitly set initial route
    >
      {/* Define all tab screens explicitly with proper route names */}
      <Tabs.Screen
        name="events/index"
        options={{
          headerShown: false,
          title: "Events",
          tabBarButton: () => null, // Disable default tab bar button
        }}
      />
      <Tabs.Screen
        name="community/index"
        options={{
          headerShown: false,
          title: "Community",
          tabBarButton: () => null, // Disable default tab bar button
        }}
      />
      <Tabs.Screen
        name="home/index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarButton: () => null, // Disable default tab bar button
        }}
      />
      <Tabs.Screen
        name="notification/index"
        options={{
          headerShown: false,
          title: "Notifications",
          tabBarButton: () => null, // Disable default tab bar button
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarButton: () => null, // Disable default tab bar button
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: Platform.OS === "ios" ? 20 : 15,
    width: width - 40, // 20px margin on each side
    height: 80, // Increased height to accommodate the downward shift
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabItemContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30, // Increased padding to move content even further down
  },
  centerButtonSpace: {
    flex: 1,
    height: "100%",
  },
  homeButtonContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 55 : 50, // Adjusted for the taller tab bar
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  homeButton: {
    width: 80,
    height: 80,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  homeLottie: {
    width: 45,
    height: 45,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },
  iconContainer: {
    position: "relative",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TabsLayout;
