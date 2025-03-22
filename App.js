import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";

import { sendLocationToServer } from "./src/services/LocationService";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  // GET CURRENT LOCATION AND SEND TO SERVER
  async function getLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied. Sorry, go away!");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLastUpdated(new Date().toLocaleTimeString());
      // console.log("Location data update:", JSON.stringify(location, null, 2));
      await sendLocationToServer(location);
    } catch (error) {
      console.log("Error retrieving location: ", error);
      setErrorMsg(`Error retrieving location: ${error.message}`);
    }
  }

  //START LOCATION TRACKING
  function startLocationTracking() {
    if (!isTracking) {
      getLocation();
      intervalRef.current = setInterval(() => {
        getLocation();
      }, 10000);
      setIsTracking(true);
    }
  }

  // STOP LOCATION TRACKING
  function stopLocationTracking() {
    if (isTracking) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsTracking(false);
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Pass location data and functions to the screens
  const locationProps = {
    location,
    errorMsg,
    isTracking,
    lastUpdated,
    getLocation,
    startLocationTracking,
    stopLocationTracking,
  };

  return (
    <NavigationContainer>
      <AppNavigator startLocationTracking={startLocationTracking} />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
