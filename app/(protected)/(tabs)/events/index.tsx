import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemes } from "../../../../hooks/use-themes";

const EventsScreen = () => {
  const { theme } = useThemes();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>Events Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default EventsScreen;
