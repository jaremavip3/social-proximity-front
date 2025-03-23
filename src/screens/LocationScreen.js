import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, ScrollView, Animated, Easing } from "react-native";
import * as Location from "expo-location";
import { fetch } from "expo/fetch";
import { SvgXml } from "react-native-svg";
// import Animated from "react-native-reanimated";

const sandTimer = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="255.467" y="248.533" style="fill:#F5A623;" width="1.067" height="16"></rect> <path style="fill:#7f7ebe;" d="M372.267,194.133H139.733c-8.836,0-16-7.164-16-16v-108.8c0-8.836,7.164-16,16-16h232.533 c8.836,0,16,7.164,16,16v108.8C388.267,186.97,381.103,194.133,372.267,194.133z"></path> <path style="fill:#0052CC;" d="M372.267,53.333H256v140.8h116.267c8.836,0,16-7.164,16-16v-108.8 C388.267,60.497,381.103,53.333,372.267,53.333z"></path> <path style="fill:#A7A9AC;" d="M393.6,85.333H118.4c-8.836,0-16-7.164-16-16V16c0-8.836,7.164-16,16-16h275.2 c8.836,0,16,7.164,16,16v53.333C409.6,78.17,402.436,85.333,393.6,85.333z"></path> <path style="fill:#F5A623;" d="M123.733,162.133c0,15.069-2.09,25.287,8.507,30.905l116.267,61.632 c2.343,1.243,4.918,1.863,7.493,1.863c2.575,0,5.15-0.621,7.493-1.863l116.267-61.632c5.233-2.774,8.507-8.212,8.507-14.137v-0.768 v-16C381.102,162.133,130.495,162.133,123.733,162.133z"></path> <path style="fill:#FF9900;" d="M256,162.133v94.4c2.575,0,5.15-0.621,7.493-1.863l116.267-61.632 c5.233-2.774,8.507-8.212,8.507-14.137v-0.768v-16C384.687,162.133,320.342,162.133,256,162.133z"></path> <path style="fill:#7f7ebe;" d="M372.267,391.467H139.733c-8.836,0-16-7.164-16-16v-41.301c0-5.924,3.273-11.362,8.507-14.137 l116.267-61.632c4.688-2.485,10.3-2.485,14.988,0l116.267,61.632c5.233,2.774,8.507,8.212,8.507,14.137v41.301 C388.267,384.304,381.103,391.467,372.267,391.467z"></path> <path style="fill:#0052CC;" d="M379.761,320.03l-116.267-61.632c-2.343-1.243-4.918-1.865-7.493-1.865v134.933h116.267 c8.836,0,16-7.164,16-16v-41.301C388.267,328.242,384.994,322.803,379.761,320.03z"></path> <path style="fill:#F5A623;" d="M372.267,459.733H139.733c-8.836,0-16-7.164-16-16v-84.267h264.533v84.267 C388.267,452.571,381.104,459.733,372.267,459.733z"></path> <path style="fill:#FF9900;" d="M256,359.467v100.267h116.267c8.836,0,16-7.164,16-16v-84.267H256z"></path> <path style="fill:#A7A9AC;" d="M393.6,512H118.4c-8.836,0-16-7.164-16-16v-53.333c0-8.836,7.164-16,16-16h275.2 c8.836,0,16,7.164,16,16V496C409.6,504.837,402.436,512,393.6,512z"></path> <g> <path style="fill:#808285;" d="M393.6,0H256v85.333h137.6c8.836,0,16-7.164,16-16V16C409.6,7.164,402.436,0,393.6,0z"></path> <path style="fill:#808285;" d="M393.6,426.667H256V512h137.6c8.836,0,16-7.164,16-16v-53.333 C409.6,433.83,402.436,426.667,393.6,426.667z"></path> </g> </g></svg>`;
const sandTimerUpsideDown = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000" transform="rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="255.467" y="248.533" style="fill:#F5A623;" width="1.067" height="16"></rect> <path style="fill:#7f7ebe;" d="M372.267,194.133H139.733c-8.836,0-16-7.164-16-16v-108.8c0-8.836,7.164-16,16-16h232.533 c8.836,0,16,7.164,16,16v108.8C388.267,186.97,381.103,194.133,372.267,194.133z"></path> <path style="fill:#0052CC;" d="M372.267,53.333H256v140.8h116.267c8.836,0,16-7.164,16-16v-108.8 C388.267,60.497,381.103,53.333,372.267,53.333z"></path> <path style="fill:#A7A9AC;" d="M393.6,85.333H118.4c-8.836,0-16-7.164-16-16V16c0-8.836,7.164-16,16-16h275.2 c8.836,0,16,7.164,16,16v53.333C409.6,78.17,402.436,85.333,393.6,85.333z"></path> <path style="fill:#F5A623;" d="M123.733,162.133c0,15.069-2.09,25.287,8.507,30.905l116.267,61.632 c2.343,1.243,4.918,1.863,7.493,1.863c2.575,0,5.15-0.621,7.493-1.863l116.267-61.632c5.233-2.774,8.507-8.212,8.507-14.137v-0.768 v-16C381.102,162.133,130.495,162.133,123.733,162.133z"></path> <path style="fill:#FF9900;" d="M256,162.133v94.4c2.575,0,5.15-0.621,7.493-1.863l116.267-61.632 c5.233-2.774,8.507-8.212,8.507-14.137v-0.768v-16C384.687,162.133,320.342,162.133,256,162.133z"></path> <path style="fill:#7f7ebe;" d="M372.267,391.467H139.733c-8.836,0-16-7.164-16-16v-41.301c0-5.924,3.273-11.362,8.507-14.137 l116.267-61.632c4.688-2.485,10.3-2.485,14.988,0l116.267,61.632c5.233,2.774,8.507,8.212,8.507,14.137v41.301 C388.267,384.304,381.103,391.467,372.267,391.467z"></path> <path style="fill:#0052CC;" d="M379.761,320.03l-116.267-61.632c-2.343-1.243-4.918-1.865-7.493-1.865v134.933h116.267 c8.836,0,16-7.164,16-16v-41.301C388.267,328.242,384.994,322.803,379.761,320.03z"></path> <path style="fill:#F5A623;" d="M372.267,459.733H139.733c-8.836,0-16-7.164-16-16v-84.267h264.533v84.267 C388.267,452.571,381.104,459.733,372.267,459.733z"></path> <path style="fill:#FF9900;" d="M256,359.467v100.267h116.267c8.836,0,16-7.164,16-16v-84.267H256z"></path> <path style="fill:#A7A9AC;" d="M393.6,512H118.4c-8.836,0-16-7.164-16-16v-53.333c0-8.836,7.164-16,16-16h275.2 c8.836,0,16,7.164,16,16V496C409.6,504.837,402.436,512,393.6,512z"></path> <g> <path style="fill:#808285;" d="M393.6,0H256v85.333h137.6c8.836,0,16-7.164,16-16V16C409.6,7.164,402.436,0,393.6,0z"></path> <path style="fill:#808285;" d="M393.6,426.667H256V512h137.6c8.836,0,16-7.164,16-16v-53.333 C409.6,433.83,402.436,426.667,393.6,426.667z"></path> </g> </g></svg>`;

const LocationScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(true); // Assume tracking is already started
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pingResult, setPingResult] = useState(null); // For storing test results
  const [currentSvg, setCurrentSvg] = useState(sandTimer); // Track which SVG to display

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
  // Animation related values
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        // Initial pause for 1 second
        Animated.delay(1000),

        // Rotate to 180 degrees
        Animated.timing(spinValue, {
          toValue: 0.5,
          duration: 1500, // Slower rotation (increase this number)
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        // Pause at 180 degrees for 1 second
        Animated.delay(1000),

        // Complete rotation to 360 degrees
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500, // Slower rotation (increase this number)
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        // Fade out
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start((finished) => {
        if (finished) {
          // Reset rotation without animation
          spinValue.setValue(0);

          // Fade back in
          Animated.timing(fadeValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            // Start the whole sequence again
            startAnimation();
          });
        }
      });
    };

    startAnimation();

    return () => {
      spinValue.stopAnimation();
      fadeValue.stopAnimation();
    };
  }, [spinValue, fadeValue]);

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
        {lastUpdated && <Text style={{ color: "#fff" }}>Last updated: {lastUpdated}</Text>}

        {/* Animated Sand Timer */}
        <View style={styles.sandTimerContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }], opacity: fadeValue }}>
            <SvgXml xml={sandTimer} width={100} height={100} />
          </Animated.View>
        </View>

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
    backgroundColor: "#f5f5f5", // Light gray
    borderRadius: 5,
    width: "100%",
  },
  resultText: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "white",
  },
  exitButton: {
    backgroundColor: "#0052CC", // Blue
  },
  testButton: {
    backgroundColor: "#0052CC", //
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
  sandTimerContainer: {
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 100, // Add this line
  },
});

export default LocationScreen;
