import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, ScrollView } from "react-native";
import * as Location from "expo-location";
import { fetch } from "expo/fetch";

const LocationScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(true); // Assume tracking is already started
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pingResult, setPingResult] = useState(null); // For storing test results

  // Test ping endpoint
  async function testPingEndpoint() {
    try {
      const response = await fetch("http://54.210.56.10/ping");

      console.log("Ping status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Ping response:", data);
      setPingResult(`Success: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      console.error("Error testing ping endpoint:", error);
      setPingResult(`Error: ${error.message}`);
      return { error: error.message };
    }
  }

  // Handle ping test
  const handlePingTest = async () => {
    const result = await testPingEndpoint();
    if (result.error) {
      Alert.alert("Ping Failed", result.error);
    } else {
      Alert.alert("Ping Successful", JSON.stringify(result));
    }
  };

  // This screen just displays the location - tracking is handled in App.js
  useEffect(() => {
    // Get location once when screen loads (for display purposes)
    const getInitialLocation = async () => {
      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.log("Error getting initial location:", error);
      }
    };

    getInitialLocation();

    // Set up interval to update display (not for tracking - that's in App.js)
    const displayInterval = setInterval(() => {
      Location.getCurrentPositionAsync({})
        .then((location) => {
          setLocation(location);
          setLastUpdated(new Date().toLocaleTimeString());
        })
        .catch((error) => {
          console.log("Error updating display:", error);
        });
    }, 5000);

    return () => {
      clearInterval(displayInterval);
    };
  }, []);

  let locationText = "Waiting for location...";

  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = `Username: test01\nLatitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`;
  }

  const handleBackToWelcome = () => {
    // Navigate back to welcome
    navigation.navigate("Welcome");
  };
  const handleFindNetwork = () => {
    // Navigate to find network screen
    navigation.navigate("FindNetwork");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Location Data</Text>
        <Text style={styles.locationText}>{locationText}</Text>
        {lastUpdated && <Text>Last updated: {lastUpdated}</Text>}

        <View style={styles.buttonContainer}>
          {/* Ping Test Button and Result */}
          <TouchableOpacity style={[styles.testButton, styles.button]} activeOpacity={0.5} onPress={handlePingTest}>
            <Text style={styles.buttonText}>Test Ping Endpoint</Text>
          </TouchableOpacity>
          {pingResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>Test Result:</Text>
              <Text>{pingResult}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.exitButton, styles.button]}
            activeOpacity={0.5}
            onPress={handleBackToWelcome}
          >
            <Text style={styles.buttonText}>Back to Welcome</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
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
    marginBottom: 20,
    color: "#FFF",
  },
  locationText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  resultContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    width: "100%",
  },
  resultText: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  exitButton: {
    backgroundColor: "#0052CC",
  },
  testButton: {
    backgroundColor: "#0052CC",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {},
});

export default LocationScreen;
