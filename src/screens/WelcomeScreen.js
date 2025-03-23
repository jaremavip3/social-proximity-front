import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SvgXml } from "react-native-svg";
import Animated, { useAnimatedStyle, useAnimatedSensor, SensorType, withSpring } from "react-native-reanimated";

const compassSvg = `
<svg height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 496 496" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path style="fill:#D8DCE1;" d="M189.656,178.344c-3.125-3.125-8.188-3.125-11.312,0s-3.125,8.188,0,11.312l128,128 c1.562,1.562,3.609,2.344,5.656,2.344s4.094-0.781,5.656-2.344c3.125-3.125,3.125-8.188,0-11.312L189.656,178.344z"></path> </g> <g> <path style="fill:#D8DCE1;" d="M368,240h-84.703c-4.422,0-8,3.582-8,8s3.578,8,8,8H368c4.422,0,8-3.582,8-8S372.422,240,368,240z "></path> </g> <g> <path style="fill:#D8DCE1;" d="M212.703,240H128c-4.422,0-8,3.582-8,8s3.578,8,8,8h84.703c4.422,0,8-3.582,8-8 S217.125,240,212.703,240z"></path> </g> <g> <path style="fill:#D8DCE1;" d="M248,220.707c4.422,0,8-3.582,8-8V128c0-4.418-3.578-8-8-8s-8,3.582-8,8v84.707 C240,217.125,243.578,220.707,248,220.707z"></path> </g> <g> <path style="fill:#D8DCE1;" d="M248,275.297c-4.422,0-8,3.582-8,8V368c0,4.418,3.578,8,8,8s8-3.582,8-8v-84.703 C256,278.879,252.422,275.297,248,275.297z"></path> </g> </g> <g> <path style="fill:#0052CC;" d="M212.267,230.01l-61.352,109.634c-1.971,3.522,1.921,7.414,5.443,5.444L267.2,283.092"></path> </g> <g> <path style="fill:#F5A623;" d="M283.784,265.891l61.296-109.527c1.971-3.522-1.922-7.415-5.444-5.444l-112.871,63.178"></path> </g> <g> <path style="fill:#D8DCE1;" d="M248,48C137.719,48,48,137.719,48,248s89.719,200,200,200s200-89.719,200-200S358.281,48,248,48z M248,400c-83.814,0-152-68.186-152-152c0-83.814,68.186-152,152-152s152,68.186,152,152C400,331.813,331.814,400,248,400z"></path> </g> <g> <circle style="fill:#5C546A;" cx="248" cy="248" r="40"></circle> </g> <g> <g> <path style="fill:#8B8996;" d="M248,264c-8.82,0-16-7.176-16-16s7.18-16,16-16s16,7.176,16,16S256.82,264,248,264z"></path> </g> </g> <g> <g> <path style="fill:#8B8996;" d="M64,256H40c-4.422,0-8-3.582-8-8s3.578-8,8-8h24c4.422,0,8,3.582,8,8S68.422,256,64,256z"></path> </g> </g> <g> <g> <path style="fill:#8B8996;" d="M456,256h-24c-4.422,0-8-3.582-8-8s3.578-8,8-8h24c4.422,0,8,3.582,8,8S460.422,256,456,256z"></path> </g> </g> <g> <g> <path style="fill:#8B8996;" d="M248,72c-4.422,0-8-3.582-8-8V40c0-4.418,3.578-8,8-8s8,3.582,8,8v24 C256,68.418,252.422,72,248,72z"></path> </g> </g> <g> <g> <path style="fill:#8B8996;" d="M248,464c-4.422,0-8-3.582-8-8v-24c0-4.418,3.578-8,8-8s8,3.582,8,8v24 C256,460.418,252.422,464,248,464z"></path> </g> </g> <g> <path style="fill:#8B8996;" d="M248,0C111.25,0,0,111.254,0,248s111.25,248,248,248s248-111.254,248-248S384.75,0,248,0z M248,448 c-110.281,0-200-89.719-200-200S137.719,48,248,48s200,89.719,200,200S358.281,448,248,448z"></path> </g> <g> <path style="fill:#5C546A;" d="M48,248c0-110.281,89.719-200,200-200V0C111.25,0,0,111.254,0,248s111.25,248,248,248v-48 C137.719,448,48,358.281,48,248z"></path> </g> </g> </g></svg>
`;

const WelcomeScreen = ({ navigation, route }) => {
  // Get the startLocationTracking function from route params
  const { startLocationTracking } = route.params;

  const handleStartApp = () => {
    // Start location tracking
    if (startLocationTracking) {
      startLocationTracking();
    }
    // Navigate to location screen
    navigation.navigate("Location");
  };
  const handleGoToProfile = () => {
    navigation.navigate("Profile");
  };
  // TO BE REMOVED______________!!!_!__!_!__!__!_!__!_!__!___!_!_!
  const handleGoToCOMMOND_DATA_SCREEN = () => {
    navigation.navigate("CommonData");
  };

  //_____ANIMATION_____
  const gravity = useAnimatedSensor(SensorType.GRAVITY);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withSpring(gravity.sensor.value.x * 15) },
        { translateY: withSpring(gravity.sensor.value.y * -15) },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <SvgXml xml={compassSvg} width="50%" height="50%" />
      </Animated.View>
      <Text style={styles.heading}>Social Proximity</Text>
      <Text style={styles.welcomeText}>Welcome to Social Proximity</Text>
      <View style={styles.optionsContainer}>
        <Text style={styles.choiceText}>What would you like to do?</Text>

        <TouchableOpacity style={[styles.button, styles.startButton]} activeOpacity={0.5} onPress={handleStartApp}>
          <Text style={styles.buttonText}>Start App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.profileButton]} activeOpacity={0.5} onPress={handleGoToProfile}>
          <Text style={styles.buttonText}>Create Your Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.profileButton]}
          activeOpacity={0.5}
          onPress={handleGoToCOMMOND_DATA_SCREEN}
        >
          <Text style={styles.buttonText}>TEST COMMOND_DATA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 15,
    color: "#FFF",
  },
  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
    color: "#FFF",
  },
  optionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  choiceText: {
    fontSize: 18,
    marginBottom: 20,
    color: "#FFF",
    fontWeight: "500",
  },
  button: {
    width: "80%",
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#F5A623", // Yellow color
  },
  profileButton: {
    backgroundColor: "#0052CC",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  imageContainer: {
    height: "40%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WelcomeScreen;
