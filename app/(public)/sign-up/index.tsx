// import { syncUserToDatabase } from "@/api/auth/auth-api";
import { Ionicons } from "@expo/vector-icons";
// import auth, { GoogleAuthProvider } from "@react-native-firebase/auth";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: "oauth_apple" });


  // Handle sign up with email/password using Clerk
  const handleSignUp = async () => {
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
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
      // Create user with Clerk
      const signUpAttempt = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || undefined,
      });

      // Prepare email verification
      await signUpAttempt.prepareEmailAddressVerification({ strategy: "email_code" });

      console.log("✅ User account created! Verification email sent.");

      // Navigate to email verification screen
      setIsLoading(false);
      router.push({
        pathname: "/verify-email",
        params: { email }
      });
    } catch (error: any) {
      setIsLoading(false);

      let errorMsg = "An error occurred during sign up";

      // Handle Clerk errors
      const clerkError = error.errors?.[0];
      if (clerkError) {
        switch (clerkError.code) {
          case "form_identifier_exists":
            errorMsg = "This email address is already in use";
            break;
          case "form_password_pwned":
            errorMsg = "Password is too common. Please choose a stronger password";
            break;
          case "form_password_length_too_short":
            errorMsg = "Password is too short";
            break;
          default:
            errorMsg = clerkError.message || "An error occurred during sign up";
        }
      } else {
        errorMsg = error.message || "An error occurred during sign up";
      }

      setErrorMessage(errorMsg);
      console.error("❌ Sign up error:", error);
    }
  };

  // ===== FIREBASE SIGN UP - COMMENTED OUT =====
  // const handleSignUp = async () => {
  //   // Form validation
  //   if (!name || !email || !password || !confirmPassword) {
  //     setErrorMessage("Please fill in all fields");
  //     return;
  //   }

  //   if (password !== confirmPassword) {
  //     setErrorMessage("Passwords do not match");
  //     return;
  //   }

  //   if (password.length < 8) {
  //     setErrorMessage("Password must be at least 8 characters");
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
  //     // Create user with Firebase Auth
  //     const userCredential = await auth().createUserWithEmailAndPassword(
  //       email,
  //       password
  //     );

  //     // Update the user's display name
  //     await userCredential.user.updateProfile({
  //       displayName: name,
  //     });

  //     console.log("✅ User account created & signed in!", userCredential.user);

  //     // Navigation will be handled automatically by the auth state listener in _layout.tsx
  //     setIsLoading(false);
  //   } catch (error: any) {
  //     setIsLoading(false);

  //     let errorMsg = "An error occurred during sign up";

  //     switch (error.code) {
  //       case "auth/email-already-in-use":
  //         errorMsg = "This email address is already in use";
  //         break;
  //       case "auth/invalid-email":
  //         errorMsg = "Invalid email address";
  //         break;
  //       case "auth/weak-password":
  //         errorMsg = "Password is too weak";
  //         break;
  //       case "auth/network-request-failed":
  //         errorMsg = "Network error. Please check your connection";
  //         break;
  //       default:
  //         errorMsg = error.message || "An error occurred during sign up";
  //     }

  //     setErrorMessage(errorMsg);
  //     console.error("❌ Sign up error:", error);
  //   }
  // };
  // ===== END FIREBASE SIGN UP =====

  // Handle Google OAuth Sign-In with Clerk
  const handleGoogleSignUp = async () => {
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
  const handleAppleSignUp = async () => {
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

  // ===== FIREBASE GOOGLE SIGN-IN - COMMENTED OUT =====
  // const onGoogleButtonPress = async () => {
  //   try {
  //     setIsLoading(true);
  //     setErrorMessage("");

  //     // Check if your device supports Google Play
  //     await GoogleSignin.hasPlayServices({
  //       showPlayServicesUpdateDialog: true,
  //     });

  //     // Get the users ID token
  //     const signInResult = await GoogleSignin.signIn();

  //     // Try the new style of google-sign in result, from v13+ of that module
  //     let idToken = signInResult.data?.idToken;
  //     if (!idToken) {
  //       // if you are using older versions of google-signin, try old style result
  //       idToken = (signInResult as any).idToken;
  //     }
  //     if (!idToken) {
  //       throw new Error("No ID token found");
  //     }

  //     // Create a Google credential with the token
  //     const googleCredential = GoogleAuthProvider.credential(idToken);

  //     // Sign-in the user with the credential
  //     const userCredential = await auth().signInWithCredential(
  //       googleCredential
  //     );

  //     //console.log("✅ User signed in with Google!", userCredential.user);
  //     
  //     // Get the Firebase token from the user credential
  //     const firebaseToken = await userCredential.user.getIdToken();

  //     //console.log("✅ Firebase Token after USER CREATED:", firebaseToken);
  //     
  //     // syncing user to database if OAuth used and user got created
  //     await syncUserToDatabase(firebaseToken, "google");

  //     console.log("✅ User synced to database via Google OAuth");

  //     // Navigation will be handled automatically by the auth state listener in _layout.tsx
  //     setIsLoading(false);
  //   } catch (error: any) {
  //     setIsLoading(false);

  //     let errorMsg = "An error occurred during Google sign in";

  //     if (error.code === "statusCodes.SIGN_IN_CANCELLED") {
  //       // User cancelled the sign-in
  //       return;
  //     } else if (error.code === "statusCodes.IN_PROGRESS") {
  //       errorMsg = "Sign in is already in progress";
  //     } else if (error.code === "statusCodes.PLAY_SERVICES_NOT_AVAILABLE") {
  //       errorMsg = "Google Play Services not available";
  //     } else {
  //       errorMsg = error.message || "An error occurred during Google sign in";
  //     }

  //     setErrorMessage(errorMsg);
  //     console.error("❌ Google sign in error:", error);
  //   }
  // };
  // ===== END FIREBASE GOOGLE SIGN-IN =====

  // Handle social sign ups (removed as requested)

  // Navigate to login screen
  const handleLogin = () => {
    router.push("/login");
  };

  // Handle back navigation with fallback
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback to onboarding if no previous screen
      router.replace("/onboarding");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={styles.placeholderView} />
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Join Vibeinn</Text>
            <Text style={styles.subtitleText}>
              Connect with students worldwide
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="rgba(255,255,255,0.7)"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Email Input */}
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

            {/* Password Input */}
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

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="rgba(255,255,255,0.7)"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Social Sign Up */}
          <View style={styles.socialSignUpContainer}>
            <Text style={styles.orText}>OR</Text>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleSignUp}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleAppleSignUp}
                disabled={isLoading}
              >
                <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLinkText}> Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeholderView: {
    width: 24,
  },
  welcomeContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
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
  termsContainer: {
    marginVertical: 15,
  },
  termsText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  signUpButton: {
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
    marginTop: 10,
  },
  signUpButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  socialSignUpContainer: {
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  loginText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  loginLinkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SignUp;
