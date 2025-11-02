import { Stack } from "expo-router";
import React from "react";

const ProtectedLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="explore" options={{ headerShown: false }} />
      <Stack.Screen name="verticalVideos" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="anonymous-profile" options={{ headerShown: false }} />
      <Stack.Screen name="personal-info-form" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProtectedLayout;
