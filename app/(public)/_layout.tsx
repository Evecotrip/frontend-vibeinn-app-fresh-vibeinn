import { Stack } from "expo-router";
import React from "react";

const PublicLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
      <Stack.Screen name="login/index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up/index" options={{ headerShown: false }} />
      <Stack.Screen name="verify-email/index" options={{ headerShown: false }} />
      <Stack.Screen name="otp/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="forgot-password/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="reset-password/index"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default PublicLayout;
