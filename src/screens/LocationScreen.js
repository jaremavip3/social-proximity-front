import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import * as Location from "expo-location";

const LocationScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(true); // Assume tracking is already started
  const [lastUpdated, setLastUpdated] = useState(null);

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
    <View style={styles.container}>
      <Text style={styles.heading}>Location Data</Text>
      <Text style={styles.locationText}>{locationText}</Text>
      {lastUpdated && <Text>Last updated: {lastUpdated}</Text>}

      <TouchableOpacity style={styles.exitButton} onPress={handleBackToWelcome}>
        <Text style={styles.exitButtonText}>Back to Welcome</Text>
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
  locationText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
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
