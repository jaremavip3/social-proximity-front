import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  async function getLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied. Sorry, go away!");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log("Location data:", JSON.stringify(location, null, 2));
    } catch (error) {
      console.log("Error retriving location: " + error);
      setErrorMsg("Error retriving location");
    }
  }

  useEffect(() => {
    getLocation();
  }, []); //get location when component mounts
  let locationText = "Waiting for location...";

  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\nAltitude: ${location.coords.altitude}\nAccuracy: ${location.coords.accuracy}m`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Location Data</Text>
      <Text style={styles.locationText}>{locationText}</Text>
      <Button title="Get Current Location" onPress={getLocation} />
      <StatusBar style="auto" />
    </View>
  );
}

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
});
