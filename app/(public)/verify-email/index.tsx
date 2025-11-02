import { Ionicons } from "@expo/vector-icons";
import { useSignUp } from "@clerk/clerk-expo";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

const VerifyEmailScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { signUp, setActive, isLoaded } = useSignUp();

  // References for code inputs
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);

  // Start timer for resend code
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, canResend]);

  // Handle code input change
  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0]; // Only take the first character if multiple are pasted
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto focus to next input
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

  // Handle email verification
  const handleVerify = async () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit code");
      return;
    }

    if (!isLoaded || !signUp) {
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      // Verify the email with Clerk
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        console.log("✅ Email verified successfully!");
        // Navigation will be handled automatically by auth state listener
      } else {
        console.error("❌ Email verification not complete:", completeSignUp.status);
        setErrorMessage("Verification failed. Please try again.");
      }

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);

      let errorMsg = "An error occurred during verification";

      // Handle Clerk errors
      const clerkError = error.errors?.[0];
      if (clerkError) {
        switch (clerkError.code) {
          case "form_code_incorrect":
            errorMsg = "Incorrect verification code";
            break;
          case "verification_expired":
            errorMsg = "Verification code expired. Please request a new one";
            break;
          default:
            errorMsg = clerkError.message || "An error occurred during verification";
        }
      } else {
        errorMsg = error.message || "An error occurred during verification";
      }

      setErrorMessage(errorMsg);
      console.error("❌ Verification error:", error);
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (!canResend || !isLoaded || !signUp) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      setCanResend(false);
      setTimer(60);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      console.log("✅ Verification code resent");
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      const errorMsg = error.message || "Failed to resend code";
      setErrorMessage(errorMsg);
      console.error("❌ Resend error:", error);
    }
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Email</Text>
          <View style={styles.placeholderView} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title and Description */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.description}>
              We've sent a 6-digit verification code to{"\n"}
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

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={!canResend || isLoading}>
              <Text
                style={[
                  styles.resendButtonText,
                  (!canResend || isLoading) && styles.resendButtonDisabled,
                ]}
              >
                {canResend ? "Resend" : `Resend in ${timer}s`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Email</Text>
            )}
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
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
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
    width: "100%",
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
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  resendText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
  },
  resendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButtonDisabled: {
    color: "rgba(255,255,255,0.5)",
  },
  verifyButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
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
  verifyButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default VerifyEmailScreen;
