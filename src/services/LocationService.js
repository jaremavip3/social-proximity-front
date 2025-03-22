import * as Location from "expo-location";
import { fetch } from "expo/fetch";

// Test function that tries every possible combination
export async function debugSaveEndpoint() {
  console.log("=== STARTING COMPREHENSIVE DEBUG ===");

  // Generate sample location data
  const location = {
    coords: {
      latitude: 43.66079696598118,
      longitude: -79.39654593629973,
    },
  };

  // Try all URL variations
  const baseUrls = [
    "http://54.210.56.10/location/save",
    "http://54.210.56.10/location/save/", // With trailing slash
    "http://54.210.56.10/location-save",
    "http://54.210.56.10/locations/save",
    "http://54.210.56.10/api/location/save",
    "http://54.210.56.10/save-location",
    "http://54.210.56.10/save_location",
    "http://54.210.56.10/save-gps", // From your original code
  ];

  // Try different data formats
  const dataVariations = [
    // Standard format
    {
      username: "test01",
      latitude: String(location.coords.latitude),
      longitude: String(location.coords.longitude),
    },
    // Swapped coordinates
    {
      username: "test01",
      latitude: String(location.coords.longitude),
      longitude: String(location.coords.latitude),
    },
    // Numeric values instead of strings
    {
      username: "test01",
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    },
    // Different property names
    {
      username: "test01",
      lat: String(location.coords.latitude),
      lng: String(location.coords.longitude),
    },
    // Exactly matching your Postman example
    {
      username: "test01",
      latitude: "-79.39669112418683",
      longitude: "43.660632373593735",
    },
  ];

  // Try with different Content-Type headers
  const headers = [
    { "Content-Type": "application/json" },
    { "Content-Type": "application/json", Accept: "application/json" },
    {}, // No headers
  ];

  for (const url of baseUrls) {
    for (const data of dataVariations) {
      for (const header of headers) {
        try {
          console.log(`Trying ${url} with data:`, JSON.stringify(data));
          console.log(`Headers:`, JSON.stringify(header));

          const response = await fetch(url, {
            method: "POST",
            headers: header,
            body: JSON.stringify(data),
          });

          const statusCode = response.status;
          console.log(`Status code: ${statusCode}`);

          let responseText;
          try {
            responseText = await response.text();
            console.log(`Response: ${responseText}`);
          } catch (e) {
            responseText = "Could not read response";
            console.log("Error reading response:", e.message);
          }

          if (response.ok) {
            console.log(`SUCCESS! Found working combination:`);
            console.log(`URL: ${url}`);
            console.log(`Data: ${JSON.stringify(data)}`);
            console.log(`Headers: ${JSON.stringify(header)}`);
            console.log(`Response: ${responseText}`);

            return {
              success: true,
              url,
              data,
              headers: header,
              response: responseText,
            };
          }
        } catch (error) {
          console.log(`Error with ${url}:`, error.message);
        }
      }
    }
  }

  console.log("=== DEBUG COMPLETE - NO SUCCESSFUL COMBINATION FOUND ===");
  return { success: false };
}

// Function to test just the Postman example exactly
export async function testPostmanExample() {
  console.log("Testing with exact Postman values");

  const url = "http://54.210.56.10/location/save";
  const data = {
    username: "test01",
    latitude: "-79.39669112418683",
    longitude: "43.660632373593735",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Status:", response.status);

    const responseText = await response.text();
    console.log("Response:", responseText);

    if (response.ok) {
      console.log("Postman example worked!");
      return { success: true, response: responseText };
    } else {
      console.log("Postman example failed");
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.error("Error with Postman example:", error.message);
    return { success: false, error: error.message };
  }
}

export async function sendLocationToServer(location) {
  // Using string format of coordinates as shown in successful debug output
  const data = {
    username: "test01",
    latitude: String(location.coords.latitude),
    longitude: String(location.coords.longitude),
  };

  console.log("Sending location data:", JSON.stringify(data));

  try {
    const response = await fetch("http://54.210.56.10/location/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
    }

    console.log("Location data sent to server!");
    const responseData = await response.json();
    console.log("Server response:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error sending location data to server:", error);
    return { error: error.message };
  }
}
