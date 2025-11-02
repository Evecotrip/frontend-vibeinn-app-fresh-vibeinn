import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemes } from "../../hooks/use-themes";

const { width } = Dimensions.get("window");

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

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

const TabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const { theme } = useThemes();
  const insets = useSafeAreaInsets();
  const homeAnimationRef = useRef<LottieView>(null);

  // Calculate the total height including safe area
  const totalHeight = 60 + (insets.bottom || 10);

  // Always play the home animation when component mounts
  useEffect(() => {
    if (homeAnimationRef.current) {
      homeAnimationRef.current.play(1, 50);
    }
  }, []);

  // Calculate tab width (5 tabs total)
  const tabWidth = Math.floor(width / 5);

  return (
    <View style={[styles.container, { height: totalHeight }]}>
      {/* Background */}
      <View style={[styles.background, { backgroundColor: theme.card }]} />

      {/* Tab Items Row */}
      <View style={styles.tabsContainer}>
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

          // For the middle tab (Home), render differently
          if (route.name === "home/index") {
            return <View key={route.key} style={{ width: tabWidth }} />;
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabButton, { width: tabWidth }]}
              android_ripple={{
                color: theme.primary + "20",
                borderless: false,
              }}
            >
              {iconName && (
                <Ionicons
                  name={isFocused && activeIconName ? activeIconName : iconName}
                  size={24}
                  color={isFocused ? theme.primary : theme.text + "80"}
                />
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
            </Pressable>
          );
        })}
      </View>

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
            source={require("../../assets/json/home-icon.json")}
            style={styles.homeLottie}
            autoPlay={true}
            loop={true}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    position: "relative",
  },
  background: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    paddingBottom: 10,
  },
  tabButton: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },
  homeButtonContainer: {
    position: "absolute",
    top: -25,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  homeButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    width: 50,
    height: 50,
  },
});

export default TabBar;
