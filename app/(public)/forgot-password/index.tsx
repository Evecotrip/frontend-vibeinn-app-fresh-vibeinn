import { Ionicons } from "@expo/vector-icons";
import { useSignIn } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { signIn, isLoaded } = useSignIn();

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle reset password request with Clerk
  const handleResetPassword = async () => {
    // Validate email
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    if (!isLoaded || !signIn) {
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      // Request password reset with Clerk
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      console.log("✅ Password reset code sent to email");
      setIsLoading(false);
      setIsSuccess(true);

      // After showing success message, navigate to reset password verification
      setTimeout(() => {
        router.push({
          pathname: "/reset-password",
          params: { email },
        });
      }, 2000);
    } catch (error: any) {
      setIsLoading(false);

      let errorMsg = "An error occurred while sending reset code";

      // Handle Clerk errors
      const clerkError = error.errors?.[0];
      if (clerkError) {
        switch (clerkError.code) {
          case "form_identifier_not_found":
            errorMsg = "No account found with this email address";
            break;
          default:
            errorMsg = clerkError.message || "An error occurred while sending reset code";
        }
      } else {
        errorMsg = error.message || "An error occurred while sending reset code";
      }

      setErrorMessage(errorMsg);
      console.error("❌ Password reset error:", error);
    }
  };

  // ===== SIMULATED RESET PASSWORD - COMMENTED OUT =====
  // const handleResetPassword = () => {
  //   // Validate email
  //   if (!email) {
  //     setErrorMessage("Please enter your email address");
  //     return;
  //   }

  //   if (!isValidEmail(email)) {
  //     setErrorMessage("Please enter a valid email address");
  //     return;
  //   }

  //   setErrorMessage("");
  //   setIsLoading(true);

  //   // Simulate API call
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     setIsSuccess(true);

  //     // After showing success message, navigate to OTP verification
  //     setTimeout(() => {
  //       router.push({
  //         pathname: "/otp",
  //         params: { email },
  //       });
  //     }, 2000);
  //   }, 1500);
  // };
  // ===== END SIMULATED RESET PASSWORD =====

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={styles.placeholderView} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title and Description */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.description}>
              Enter your email address and we'll send you a verification code to
              reset your password
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Error Message */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* Success Message */}
            {isSuccess ? (
              <Text style={styles.successText}>
                Password reset instructions have been sent to your email
              </Text>
            ) : null}

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
                editable={!isSuccess}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                isSuccess && styles.resetButtonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Text style={styles.resetButtonText}>
                  {isSuccess ? "Email Sent" : "Reset Password"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLinkText}> Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Email Icon */}
        {isSuccess && (
          <View style={styles.emailSentContainer}>
            <View style={styles.emailIconCircle}>
              <Ionicons name="mail-open-outline" size={50} color="#FFFFFF" />
            </View>
          </View>
        )}
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 30,
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 15,
  },
  successText: {
    color: "#4CD964",
    marginBottom: 15,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    marginBottom: 25,
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
  resetButton: {
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
  resetButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  resetButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
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
  emailSentContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  emailIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ForgotPasswordScreen;
