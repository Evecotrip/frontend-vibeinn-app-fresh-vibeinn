import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";

const { width, height } = Dimensions.get("window");

// Helper functions similar to wp and hp
const wp = (percentage: number) => {
  return width * (percentage / 100);
};

const hp = (percentage: number) => {
  return height * (percentage / 100);
};

const OnboardingScreen: React.FC = () => {
  const ripple1 = useSharedValue<number>(0);
  const ripple2 = useSharedValue<number>(0);
  const ripple3 = useSharedValue<number>(0);

  const expandConfig = {
    duration: 3500,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  };

  const resetConfig = {
    duration: 0,
  };

  useEffect(() => {
    const animateRipple = (
      ripple: SharedValue<number>,
      delay: number
    ): void => {
      ripple.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            // Start from center (small)
            withTiming(0, resetConfig),
            // Expand outward
            withTiming(4, expandConfig), // Increased scale for bigger ripples
            // Quick reset before next ripple
            withTiming(0, resetConfig)
          ),
          -1
        )
      );
    };

    // Start animations with sequential delays
    animateRipple(ripple1, 0);
    animateRipple(ripple2, 800);
    animateRipple(ripple3, 1600);
  }, []);

  // Create animated styles with scale and opacity based on animation progress
  const createRippleStyle = (ripple: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: ripple.value }],
      opacity: withTiming(ripple.value === 0 ? 0 : 0.25 - ripple.value * 0.05, {
        duration: 300,
      }),
    }));

  const rippleStyle1 = createRippleStyle(ripple1);
  const rippleStyle2 = createRippleStyle(ripple2);
  const rippleStyle3 = createRippleStyle(ripple3);

  // Handle login button press
  const handleLogin = () => {
    router.replace("/login");
  };

  // Handle sign up button press
  const handleSignUp = () => {
    router.replace("/sign-up");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top section with welcome text */}
      <View style={styles.topSection}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appNameText}>Vibeinn</Text>
        <Text style={styles.taglineText}>Connect. Share. Thrive.</Text>
      </View>

      {/* Middle section with logo and ripple effects */}
      <View style={styles.logoContainer}>
        {/* Ripple effects */}
        <Animated.View style={[styles.ripple, rippleStyle3]} />
        <Animated.View style={[styles.ripple, rippleStyle2]} />
        <Animated.View style={[styles.ripple, rippleStyle1]} />

        {/* Logo container */}
        <View style={styles.logoCircle}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>V</Text>
          </View>
        </View>
      </View>

      {/* Bottom section with description and buttons */}
      <View style={styles.bottomSection}>
        <Text style={styles.descriptionText}>
          Connect with students across universities worldwide and build your
          college community
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  topSection: {
    paddingTop: hp(5),
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  appNameText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 5,
  },
  taglineText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 5,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  ripple: {
    position: "absolute",
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  logoCircle: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  logoInner: {
    width: "80%",
    height: "80%",
    borderRadius: wp(10),
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: wp(10),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  bottomSection: {
    paddingHorizontal: wp(10),
    paddingBottom: hp(5),
    alignItems: "center",
  },
  descriptionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: hp(4),
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  signUpButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default OnboardingScreen;
