import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState(null); //location data
  const [errorMsg, setErrorMsg] = useState(null); //error message
  const [isTracking, setIsTracking] = useState(false); //tracking status
  const [lastUpdated, setLastUpdated] = useState(null); //last updated time
  const intervalRef = useRef(null); //interval reference for location tracking

  // GET CURRENT LOCATION AND SEND TO SERVER
  async function getLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync(); //ask for permission
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied. Sorry, go away!");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLastUpdated(new Date().toLocaleTimeString());
      console.log("Location data update:", JSON.stringify(location, null, 2));
      sendLocationToServer(location); //send location to server
    } catch (error) {
      console.log("Error retrieving location: ", error);

      setErrorMsg(`Error retrieving location: ${error.message}`);
    }
  }
  // SEND LOCATION TO SERVER
  function sendLocationToServer(location) {
    console.log(`Username: test01\n Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\n`);
    const data = {
      username: "test01",
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    fetch("https://social-proximity-back.onrender.com/save-gps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("Location data sent to server!");
        return response.json();
      })
      .then((data) => {
        console.log("Server response: ", data);
      })
      .catch((error) => {
        console.error("Error sending location data to server: ", error);
      });
  }
  //START LOCATION TRACKING
  function startLocationTracking() {
    if (!isTracking) {
      getLocation();
      intervalRef.current = setInterval(() => {
        getLocation();
      }, 10000); //Here we trigger getLocation() every 10 seconds and then getLocation() will send location to server
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
    // getLocation();
    startLocationTracking();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); //get location when component mounts
  let locationText = "Waiting for location...";

  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = `Username: test01\n Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\n`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Location Data</Text>
      <Text style={styles.locationText}>{locationText}</Text>
      {lastUpdated && <Text>Last updated: {lastUpdated}</Text>}
      <Button title="Get Location Now" onPress={getLocation} />
      {!isTracking ? (
        <Button title="Start Tracking" onPress={startLocationTracking} />
      ) : (
        <Button title="Stop Tracking" onPress={stopLocationTracking} />
      )}

      <StatusBar style={styles.statusBar} />
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
  statusBar: {
    backgroundColor: "#000",
  },
});
