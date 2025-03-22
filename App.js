import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use a physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification! 📬",
      body: "This is a test notification from our app",
      data: { data: 'This is some test data' },
    },
    trigger: { seconds: 2 }, // 2秒后发送通知
  });
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  
  const [appStarted, setAppStarted] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      console.log("Expo Push Token: ", token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log("Notification received:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("User interacted with notification:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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
    if (appStarted) {
      startLocationTracking();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [appStarted]); //get location when component mounts

  // Function to handle starting the app
  function handleStartApp() {
    setAppStarted(true);
  }
  function handleExitApp() {
    setAppStarted(false);
  }

  let locationText = "Waiting for location...";

  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = `Username: test01\n Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\n`;
  }
  if (!appStarted) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Social Proximity</Text>
        <Text style={styles.welcomeText}>Welcome to Social Proximity</Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStartApp}>
          <Text style={styles.startButtonText}>Start App</Text>
        </TouchableOpacity>
        <StatusBar style={styles.statusBar} />
      </View>
    );
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
      <TouchableOpacity 
        style={[styles.startButton, { backgroundColor: '#007AFF' }]} 
        onPress={sendTestNotification}
      >
        <Text style={styles.startButtonText}>Send Test Notification</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.startButton} onPress={handleExitApp}>
        <Text style={styles.startButtonText}>Exit the App</Text>
      </TouchableOpacity>
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
  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});