import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import registerNNPushToken from "native-notify";

// Native Notify Configuration
const NATIVE_NOTIFY_APP_ID = 28566;
const NATIVE_NOTIFY_APP_TOKEN = "CxKTyFzipAqvpDDOWwZMBA";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
// Get a unique device identifier
const getDeviceIdentifier = async () => {
  try {
    // Try to get stored device ID first
    let deviceId = await AsyncStorage.getItem("deviceId");

    if (!deviceId) {
      // Generate a new device ID
      const deviceName = Device.deviceName || "";
      const deviceModel = Device.modelName || "";
      const randomString = Math.random().toString(36).substring(2, 10);
      deviceId = `${deviceName}-${deviceModel}-${randomString}`;

      // Store it for future use
      await AsyncStorage.setItem("deviceId", deviceId);
    }

    return deviceId;
  } catch (error) {
    console.log("Error getting device identifier:", error);
    return `unknown-${Math.random().toString(36).substring(2, 10)}`;
  }
};

// Register for push notifications with both systems
export async function registerForPushNotificationsAsync(userId) {
  try {
    // 1. First, request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token: permission not granted");
      return null;
    }

    // 2. Get the Expo push token
    const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", expoPushToken);

    // 3. Set up Android channel
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // 4. Get device identifier for Native Notify
    const deviceId = await getDeviceIdentifier();

    // 5. Create composite ID (user@device) for targeted notifications
    const safeUserId = userId || "anonymous";
    const compositeId = `${safeUserId}@${deviceId}`;
    console.log("Registering with Native Notify using composite ID:", compositeId);

    // 6. Register with Native Notify
    registerNNPushToken(NATIVE_NOTIFY_APP_ID, compositeId, NATIVE_NOTIFY_APP_TOKEN);

    // 7. Store the mapping for reference
    await AsyncStorage.setItem("currentUser", safeUserId);

    // Return both tokens for reference
    return {
      expoPushToken,
      compositeId,
    };
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

// Get current registration info (for debugging)
export async function getCurrentRegistrationInfo() {
  try {
    const deviceId = (await AsyncStorage.getItem("deviceId")) || "unknown";
    const userId = (await AsyncStorage.getItem("currentUser")) || "anonymous";
    const compositeId = `${userId}@${deviceId}`;

    return {
      deviceId,
      userId,
      compositeId,
    };
  } catch (error) {
    console.log("Error getting registration info:", error);
    return null;
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

// Remove notification listeners
export function removeNotificationListeners(listeners) {
  if (listeners?.notificationListener) {
    Notifications.removeNotificationSubscription(listeners.notificationListener);
  }
  if (listeners?.responseListener) {
    Notifications.removeNotificationSubscription(listeners.responseListener);
  }
}
