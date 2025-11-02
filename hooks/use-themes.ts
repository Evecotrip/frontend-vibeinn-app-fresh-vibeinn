// use-themes.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";

// Define theme types
export type ThemeType = "light" | "dark" | "system";

// Define theme colors interface
export interface ThemeColors {
  primary: string;
  background: string;
  text: string;
  card: string;
  border: string;
  notification: string;
  placeholder: string;
  inputBackground: string;
  error: string;
  success: string;
  // Youth-oriented colors
  energetic: string;
  vibrant: string;
  accent1: string;
  accent2: string;
  accent3: string;
  gradientStart: string;
  gradientEnd: string;
  cardGradientStart: string;
  cardGradientEnd: string;
}

// Storage key for theme preference
const THEME_STORAGE_KEY = "user_theme_preference";

export const useThemes = () => {
  // Get system color scheme
  const systemColorScheme = useColorScheme();
  
  // State for user's theme preference
  const [themePreference, setThemePreference] = useState<ThemeType>("system");
  
  // Derived current theme (light/dark) based on preference and system
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() => {
    return systemColorScheme === "dark" ? "dark" : "light";
  });

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
          setThemePreference(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      }
    };
    
    loadThemePreference();
  }, []);

  // Update current theme when preference or system theme changes
  useEffect(() => {
    if (themePreference === "system") {
      setCurrentTheme(systemColorScheme === "dark" ? "dark" : "light");
    } else {
      setCurrentTheme(themePreference);
    }
  }, [themePreference, systemColorScheme]);

  // Change theme preference and save to storage
  const changeTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemePreference(newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  // Define theme colors
  const lightTheme: ThemeColors = {
    primary: Colors.primary,
    background: Colors.lightBackground,
    text: Colors.darkText,
    card: "#FFFFFF",
    border: "#E1E1E1",
    notification: "#FF3B30",
    placeholder: "#A9A9A9",
    inputBackground: "rgba(0, 0, 0, 0.05)",
    error: "#FF3B30",
    success: "#34C759",
    // Youth-oriented colors for light theme
    energetic: "#FF3B5C", // Vibrant pink/red
    vibrant: "#5E17EB", // Bright purple
    accent1: "#00D1FF", // Bright cyan
    accent2: "#FFD600", // Bright yellow
    accent3: "#00E676", // Bright green
    gradientStart: "#0066FF",
    gradientEnd: "#5E17EB",
    cardGradientStart: "#FFFFFF",
    cardGradientEnd: "#F5F8FF",
  };

  const darkTheme: ThemeColors = {
    primary: Colors.primary,
    background: Colors.darkBackground,
    text: Colors.lightText,
    card: "#1E1E1E",
    border: "#2C2C2C",
    notification: "#FF453A",
    placeholder: "#8E8E93",
    inputBackground: "rgba(255, 255, 255, 0.1)",
    error: "#FF453A",
    success: "#30D158",
    // Youth-oriented colors for dark theme
    energetic: "#FF3B5C", // Vibrant pink/red
    vibrant: "#7C4DFF", // Bright purple (slightly lighter for dark mode)
    accent1: "#00D1FF", // Bright cyan
    accent2: "#FFD600", // Bright yellow
    accent3: "#00E676", // Bright green
    gradientStart: "#0066FF",
    gradientEnd: "#5E17EB",
    cardGradientStart: "#252525",
    cardGradientEnd: "#1A1A1A",
  };

  // Get current theme colors
  const theme = currentTheme === "dark" ? darkTheme : lightTheme;

  // Check if current theme is from system or manual
  const isUsingSystemTheme = themePreference === "system";

  return {
    theme,
    isDark: currentTheme === "dark",
    isLight: currentTheme === "light",
    themePreference,
    isUsingSystemTheme,
    systemColorScheme,
    changeTheme,
  };
};