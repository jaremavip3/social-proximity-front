import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import WelcomeScreen from "../screens/WelcomeScreen";
import LocationScreen from "../screens/LocationScreen";

const Stack = createNativeStackNavigator();

// This is a simple navigator that passes the startLocationTracking function to the welcome screen
const AppNavigator = ({ startLocationTracking }) => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} initialParams={{ startLocationTracking }} />
      <Stack.Screen name="Location" component={LocationScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
