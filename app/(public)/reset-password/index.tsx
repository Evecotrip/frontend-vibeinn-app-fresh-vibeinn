import { Ionicons } from "@expo/vector-icons";
import { useSignIn } from "@clerk/clerk-expo";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
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

const ResetPasswordScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState<"code" | "password">("code");

  const { signIn, setActive, isLoaded } = useSignIn();

  // References for code inputs
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);

  // Handle code input change
  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0];
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key press
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && index > 0 && code[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify code and move to password step
  const handleVerifyCode = () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit code");
      return;
    }

    setErrorMessage("");
    setStep("password");
  };

  // Handle password reset
  const handleResetPassword = async () => {
    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    if (!isLoaded || !signIn) {
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const verificationCode = code.join("");

      // Reset password with Clerk
      const resetAttempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: verificationCode,
        password: newPassword,
      });

      if (resetAttempt.status === "complete") {
        await setActive({ session: resetAttempt.createdSessionId });
        console.log("✅ Password reset successfully!");
        // Navigation will be handled automatically by auth state listener
      } else {
        console.error("❌ Password reset not complete:", resetAttempt.status);
        setErrorMessage("Password reset failed. Please try again.");
      }

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);

      let errorMsg = "An error occurred during password reset";

      // Handle Clerk errors
      const clerkError = error.errors?.[0];
      if (clerkError) {
        switch (clerkError.code) {
          case "form_code_incorrect":
            errorMsg = "Incorrect verification code";
            setStep("code"); // Go back to code step
            break;
          case "form_password_pwned":
            errorMsg = "Password is too common. Please choose a stronger password";
            break;
          case "form_password_length_too_short":
            errorMsg = "Password is too short";
            break;
          default:
            errorMsg = clerkError.message || "An error occurred during password reset";
        }
      } else {
        errorMsg = error.message || "An error occurred during password reset";
      }

      setErrorMessage(errorMsg);
      console.error("❌ Password reset error:", error);
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (step === "password") {
                  setStep("code");
                } else {
                  router.back();
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reset Password</Text>
            <View style={styles.placeholderView} />
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {step === "code" ? (
              <>
                {/* Code Verification Step */}
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Enter Verification Code</Text>
                  <Text style={styles.description}>
                    We've sent a 6-digit code to{"\n"}
                    <Text style={styles.emailText}>{email || "your email"}</Text>
                  </Text>
                </View>

                {/* Error Message */}
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}

                {/* Code Input */}
                <View style={styles.codeContainer}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <TextInput
                      key={index}
                      ref={(input) => {
                        inputRefs.current[index] = input;
                      }}
                      style={styles.codeInput}
                      value={code[index]}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleVerifyCode}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* New Password Step */}
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Create New Password</Text>
                  <Text style={styles.description}>
                    Please enter your new password
                  </Text>
                </View>

                {/* Error Message */}
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}

                {/* New Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="rgba(255,255,255,0.7)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={newPassword}
                    onChangeText={setNewPassword}
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

                {/* Reset Password Button */}
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : (
                    <Text style={styles.resetButtonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 24,
  },
  emailText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 20,
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    gap: 8,
  },
  codeInput: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
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
  continueButton: {
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
  continueButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ResetPasswordScreen;
