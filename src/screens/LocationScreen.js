import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, ScrollView } from "react-native";
import * as Location from "expo-location";
import { fetch } from "expo/fetch";
import { testPostmanExample, debugSaveEndpoint } from "../services/LocationService";

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

  // Add Postman test function
  const handleTestPostman = async () => {
    setPingResult("Testing Postman example...");
    const result = await testPostmanExample();

    if (result.success) {
      setPingResult(`Postman example succeeded: ${JSON.stringify(result.response)}`);
      Alert.alert("Success!", "The Postman example worked. Check logs for details.");
    } else {
      setPingResult(`Postman example failed: ${result.status || result.error}`);
      Alert.alert("Failed", "The Postman example failed. Check logs for details.");
    }
  };

  // Add full debug function
  const handleFullDebug = async () => {
    setPingResult("Running comprehensive debug...");
    Alert.alert(
      "Debug Started",
      "This will try many combinations and may take some time. Check console logs for progress."
    );

    const result = await debugSaveEndpoint();

    if (result.success) {
      setPingResult(
        `Found working solution: ${JSON.stringify({
          url: result.url,
          data: result.data,
        })}`
      );
      Alert.alert("Success!", "Found a working combination. Check logs for details.");
    } else {
      setPingResult("No working combination found.");
      Alert.alert("Debug Complete", "Could not find a working combination. Check logs for details.");
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Location Data</Text>
        <Text style={styles.locationText}>{locationText}</Text>
        {lastUpdated && <Text>Last updated: {lastUpdated}</Text>}

        {/* Ping Test Button and Result */}
        <TouchableOpacity style={styles.testButton} onPress={handlePingTest}>
          <Text style={styles.buttonText}>Test Ping Endpoint</Text>
        </TouchableOpacity>

        {/* Debug section - THIS WAS MISSING FROM YOUR STRUCTURE */}
        <View style={styles.debugContainer}>
          <Text style={styles.sectionTitle}>Advanced Debugging</Text>
          <TouchableOpacity style={styles.debugButton} onPress={handleTestPostman}>
            <Text style={styles.buttonText}>Test Postman Example</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fullDebugButton} onPress={handleFullDebug}>
            <Text style={styles.buttonText}>Run Full Debug</Text>
          </TouchableOpacity>
        </View>

        {pingResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Test Result:</Text>
            <Text>{pingResult}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.exitButton} onPress={handleBackToWelcome}>
          <Text style={styles.exitButtonText}>Back to Welcome</Text>
        </TouchableOpacity>
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  debugContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  testButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  debugButton: {
    backgroundColor: "#ff9800",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
    width: "100%",
  },
  fullDebugButton: {
    backgroundColor: "#f44336",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
  },
  exitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  exitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LocationScreen;
