import * as Location from "expo-location";

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
    console.log("Location data update:", JSON.stringify(location, null, 2));

    // Send location to server
    sendLocationToServer(location);

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
export const sendLocationToServer = (location) => {
  const data = {
    username: "test01",
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  fetch("https://social-proximity-back.onrender.com/api/save-gps", {
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
};
