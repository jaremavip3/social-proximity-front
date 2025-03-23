import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import WelcomeScreen from "../screens/WelcomeScreen";
import LocationScreen from "../screens/LocationScreen";
import ProfileFormScreen from "../screens/ProfileFormScreen";
import CommonDataScreen from "../screens/CommonDataScreen";
import BestMatchScreen from "../screens/BestMatchScreen";

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
      <Stack.Screen name="Profile" component={ProfileFormScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />
      <Stack.Screen name="CommonData" component={CommonDataScreen} />
      <Stack.Screen name="BestMatch" component={BestMatchScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
