import { Ionicons } from "@expo/vector-icons";
// import auth from "@react-native-firebase/auth";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";

const { width } = Dimensions.get("window");

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: "oauth_apple" });

  // Handle email/password login with Clerk
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    if (!isLoaded) {
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      // Sign in with Clerk
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        console.log("✅ User signed in successfully!");
        // Navigation will be handled automatically by the auth state listener in _layout.tsx
      } else {
        console.error("❌ Sign in not complete:", signInAttempt.status);
        setErrorMessage("Sign in failed. Please try again.");
      }

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);

      let errorMsg = "An error occurred during login";

      // Handle Clerk errors
      const clerkError = error.errors?.[0];
      if (clerkError) {
        switch (clerkError.code) {
          case "form_identifier_not_found":
            errorMsg = "No account found with this email address";
            break;
          case "form_password_incorrect":
            errorMsg = "Incorrect password";
            break;
          case "form_identifier_invalid":
            errorMsg = "Invalid email address";
            break;
          default:
            errorMsg = clerkError.message || "An error occurred during login";
        }
      } else {
        errorMsg = error.message || "An error occurred during login";
      }

      setErrorMessage(errorMsg);
      console.error("❌ Login error:", error);
    }
  };

  // ===== FIREBASE LOGIN - COMMENTED OUT =====
  // const handleLogin = async () => {
  //   if (!email || !password) {
  //     setErrorMessage("Please enter both email and password");
  //     return;
  //   }

  //   // Email validation
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!emailRegex.test(email)) {
  //     setErrorMessage("Please enter a valid email address");
  //     return;
  //   }

  //   setErrorMessage("");
  //   setIsLoading(true);

  //   try {
  //     // Sign in with Firebase Auth
  //     const userCredential = await auth().signInWithEmailAndPassword(
  //       email,
  //       password
  //     );

  //     console.log("✅ User signed in successfully!", userCredential.user);

  //     // Navigation will be handled automatically by the auth state listener in _layout.tsx
  //     setIsLoading(false);
  //   } catch (error: any) {
  //     setIsLoading(false);

  //     let errorMsg = "An error occurred during login";

  //     switch (error.code) {
  //       case "auth/user-not-found":
  //         errorMsg = "No account found with this email address";
  //         break;
  //       case "auth/wrong-password":
  //         errorMsg = "Incorrect password";
  //         break;
  //       case "auth/invalid-email":
  //         errorMsg = "Invalid email address";
  //         break;
  //       case "auth/user-disabled":
  //         errorMsg = "This account has been disabled";
  //         break;
  //       case "auth/too-many-requests":
  //         errorMsg = "Too many failed attempts. Please try again later";
  //         break;
  //       case "auth/network-request-failed":
  //         errorMsg = "Network error. Please check your connection";
  //         break;
  //       case "auth/invalid-credential":
  //         errorMsg = "Invalid email or password";
  //         break;
  //       default:
  //         errorMsg = error.message || "An error occurred during login";
  //     }

  //     setErrorMessage(errorMsg);
  //     console.error("❌ Login error:", error);
  //   }
  // };
  // ===== END FIREBASE LOGIN =====

  // Handle Google OAuth Sign-In with Clerk
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const { createdSessionId, setActive: oAuthSetActive } = await startGoogleOAuth();

      if (createdSessionId) {
        await oAuthSetActive!({ session: createdSessionId });
        console.log("✅ User signed in with Google via Clerk!");
        // Navigation will be handled automatically by auth state listener
      }

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      
      // User cancelled or other error
      if (error.code === "user_cancelled") {
        return;
      }

      const errorMsg = error.message || "An error occurred during Google sign in";
      setErrorMessage(errorMsg);
      console.error("❌ Google OAuth error:", error);
    }
  };

  // Handle Apple OAuth Sign-In with Clerk
  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const { createdSessionId, setActive: oAuthSetActive } = await startAppleOAuth();

      if (createdSessionId) {
        await oAuthSetActive!({ session: createdSessionId });
        console.log("✅ User signed in with Apple via Clerk!");
        // Navigation will be handled automatically by auth state listener
      }

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      
      // User cancelled or other error
      if (error.code === "user_cancelled") {
        return;
      }

      const errorMsg = error.message || "An error occurred during Apple sign in";
      setErrorMessage(errorMsg);
      console.error("❌ Apple OAuth error:", error);
    }
  };

  // Handle social logins (removed as requested)

  // Navigate to sign up screen
  const handleSignUp = () => {
    router.push("/sign-up");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.placeholderView} />
          <Text style={styles.headerTitle}>Login</Text>
          <View style={styles.placeholderView} />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>V</Text>
          </View>
          <Text style={styles.appNameText}>Vibeinn</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="rgba(255,255,255,0.7)"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="rgba(255,255,255,0.7)"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Social Login */}
        <View style={styles.socialLoginContainer}>
          <Text style={styles.orText}>OR</Text>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleLogin}
              disabled={isLoading}
            >
              <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpLinkText}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  placeholderView: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  appNameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 10,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 15,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    marginBottom: 15,
    height: 55,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    color: "#FFFFFF",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 16,
    fontWeight: "600",
  },
  socialLoginContainer: {
    paddingHorizontal: 30,
    marginTop: 30,
  },
  orText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  signUpText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  signUpLinkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default LoginScreen;
