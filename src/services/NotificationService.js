import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register for push notifications - simplified version
export async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    // Simple approach that works in Expo Go
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Push token:", token);

      // Set up Android channel
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return token;
    } catch (error) {
      console.log("Error getting push token:", error);
      return null;
    }
  } catch (error) {
    console.log("Error in push notification setup:", error);
    return null;
  }
}

// Send a local notification
export async function sendLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // null means send immediately
    });
    return true;
  } catch (error) {
    console.log("Error sending notification:", error);
    return false;
  }
}

// Set up notification listeners
export function setupNotificationListeners(onNotification, onResponse) {
  try {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
      if (onNotification) onNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response);
      if (onResponse) onResponse(response);
    });

    return { notificationListener, responseListener };
  } catch (error) {
    console.log("Error setting up notification listeners:", error);
    return { notificationListener: null, responseListener: null };
  }
}
