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
  const handleGoToProfile = () => {
    navigation.navigate("Profile");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Social Proximity</Text>
      <Text style={styles.welcomeText}>Welcome to Social Proximity</Text>
      <View style={styles.optionsContainer}>
        <Text style={styles.choiceText}>What would you like to do?</Text>

        <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStartApp}>
          <Text style={styles.buttonText}>Start App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.profileButton]} onPress={handleGoToProfile}>
          <Text style={styles.buttonText}>Create Your Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#FFF",
  },
  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
    color: "#FFF",
  },
  optionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  choiceText: {
    fontSize: 18,
    marginBottom: 20,
    color: "#FFF",
    fontWeight: "500",
  },
  button: {
    width: "80%",
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#CF86FC",
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileButton: {
    backgroundColor: "#3700B3",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
