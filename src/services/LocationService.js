import * as Location from "expo-location";
import { fetch } from "expo/fetch";

// Get current location and permission
export const getLocationData = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return {
        error: "Permission to access location was denied. Sorry, go away!",
      };
    }

    let location = await Location.getCurrentPositionAsync({});
    // console.log("Location data update:", JSON.stringify(location, null, 2));

    // Send location to server
    const result = await sendLocationToServer(location);
    if (result.error) {
      console.error("Failed to send location:", result.error);
    }

    return { location };
  } catch (error) {
    console.log("Error retrieving location: ", error);
    return {
      error: `Error retrieving location: ${error.message}`,
    };
  }
};

// Start tracking location at intervals
export const startTracking = (onSuccess, onError) => {
  // Get location immediately
  getLocationData().then((result) => {
    if (result.location) onSuccess(result.location);
    if (result.error) onError(result.error);
  });

  // Set interval for continuous tracking
  const interval = setInterval(() => {
    getLocationData().then((result) => {
      if (result.location) onSuccess(result.location);
      if (result.error) onError(result.error);
    });
  }, 3000); // Every 3 seconds

  return interval;
};
// Stop tracking location
export const stopTracking = (interval) => {
  if (interval) {
    clearInterval(interval);
  }
};

// Send location data to server
export async function sendLocationToServer(location) {
  const data = {
    username: "test01",
    latitude: String(location.coords.longitude),
    longitude: String(location.coords.latitude),
  };

  try {
    // console.log("Sending location data to server...");
    // console.log("Data:", JSON.stringify(data));
    const response = await fetch("http://54.210.56.10/location/save", {
      method: "POST", // Changed from GET to POST since we're sending data
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // This is correct for a POST request
    });

    console.log("Response status:", response.status);
    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${responseText}`);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }
    return responseData;
  } catch (error) {
    console.error("Error sending location data to server: ", error);
    return { error: error.message };
  }
}
