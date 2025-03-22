import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

const WelcomeScreen = ({ navigation, route }) => {
  // Get the startLocationTracking function from route params
  const { startLocationTracking } = route.params;

  const handleStartApp = () => {
    // Start location tracking
    if (startLocationTracking) {
      startLocationTracking();
    }

    // Navigate to location screen
    navigation.navigate("Location");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Social Proximity</Text>
      <Text style={styles.welcomeText}>Welcome to Social Proximity</Text>
      <TouchableOpacity style={styles.startButton} onPress={handleStartApp}>
        <Text style={styles.startButtonText}>Start App</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
