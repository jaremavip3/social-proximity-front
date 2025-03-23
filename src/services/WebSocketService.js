// src/services/WebSocketService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import * as Haptics from "expo-haptics";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.serverUrl = "ws://54.210.56.10:8080/ws";
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.messageListeners = [];
    this.connectionListeners = [];
    this.username = null;
    this.appState = AppState.currentState;

    // Store app state subscription for cleanup
    this.appStateSubscription = AppState.addEventListener("change", this._handleAppStateChange);
  }

  // Handle app state changes (foreground/background)
  _handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/inactive|background/) && nextAppState === "active") {
      // App has come to the foreground
      console.log("App came to foreground - reconnecting WebSocket...");
      this.reconnect();
    } else if (nextAppState.match(/inactive|background/) && this.appState === "active") {
      // App has gone to the background - perform cleanup if needed
      console.log("App went to background");
    }
    this.appState = nextAppState;
  };

  // Connect to WebSocket server
  async connect(username) {
    if (this.isConnected) {
      console.log("WebSocket already connected");
      return true;
    }

    try {
      if (!username) {
        username = await AsyncStorage.getItem("username");
      }

      this.username = username;

      // Store username for reconnection
      await AsyncStorage.setItem("username", username);

      console.log(`Connecting to WebSocket as ${username}...`);

      // Create WebSocket connection with username as query parameter
      this.socket = new WebSocket(`${this.serverUrl}?username=${encodeURIComponent(username)}`);

      this.socket.onopen = () => {
        console.log("WebSocket connection established");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this._notifyConnectionListeners(true);

        // Notify listeners
        this._notifyMessageListeners({
          type: "connection_status",
          payload: { status: "connected", username },
          timestamp: new Date().toISOString(),
        });

        // Vibrate to indicate connection
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Send initial presence message
        this.sendMessage("presence", {
          username: username,
          status: "online",
          timestamp: new Date().toISOString(),
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`Received WebSocket message:`, message);
          this._notifyMessageListeners(message);

          // Handle specific message types
          this._handleSpecificMessageTypes(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onerror = (error) => {
        console.error(`WebSocket error:`, error);
        this._notifyMessageListeners({
          type: "error",
          payload: { message: "Connection error occurred" },
          timestamp: new Date().toISOString(),
        });
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        this.isConnected = false;
        this._notifyConnectionListeners(false);

        // Notify message listeners about disconnect
        this._notifyMessageListeners({
          type: "connection_status",
          payload: { status: "disconnected", code: event.code, reason: event.reason },
          timestamp: new Date().toISOString(),
        });

        this._attemptReconnect();
      };

      return true;
    } catch (error) {
      console.error(`Failed to establish WebSocket connection:`, error);
      return false;
    }
  }

  // Handle specific message types with special behavior
  _handleSpecificMessageTypes(message) {
    if (!message || !message.type) return;

    switch (message.type) {
      case "proximity_alert":
      case "notification":
      case "match_found":
      case "connection_request":
        // Provide haptic feedback for important messages
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "message":
        // Provide lighter feedback for regular messages
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "match_update":
        // When new matches are found
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  }

  // Send a message through WebSocket
  sendMessage(type, payload) {
    if (!this.isConnected || !this.socket) {
      console.warn("Cannot send message, WebSocket not connected");
      return false;
    }

    try {
      const message = JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString(),
      });

      console.log(`Sending WebSocket message: ${type}`);
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      return false;
    }
  }

  // Add a listener for incoming messages
  addMessageListener(callback) {
    if (typeof callback === "function") {
      this.messageListeners.push(callback);
      return true;
    }
    return false;
  }

  // Remove a message listener
  removeMessageListener(callback) {
    if (!callback) {
      // If no specific callback provided, remove all listeners
      this.messageListeners = [];
      return true;
    }

    const initialLength = this.messageListeners.length;
    this.messageListeners = this.messageListeners.filter((listener) => listener !== callback);
    return initialLength !== this.messageListeners.length;
  }

  // Add a connection status listener
  addConnectionListener(callback) {
    if (typeof callback === "function") {
      this.connectionListeners.push(callback);

      // Immediately notify with current status if connected
      if (this.isConnected) {
        try {
          callback(true);
        } catch (error) {
          console.error("Error in connection listener callback:", error);
        }
      }

      return true;
    }
    return false;
  }

  // Remove a connection listener
  removeConnectionListener(callback) {
    const initialLength = this.connectionListeners.length;
    this.connectionListeners = this.connectionListeners.filter((listener) => listener !== callback);
    return initialLength !== this.connectionListeners.length;
  }

  // Notify all message listeners
  _notifyMessageListeners(message) {
    this.messageListeners.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error("Error in message listener:", error);
      }
    });
  }

  // Notify all connection listeners
  _notifyConnectionListeners(isConnected) {
    this.connectionListeners.forEach((listener) => {
      try {
        listener(isConnected);
      } catch (error) {
        console.error("Error in connection listener:", error);
      }
    });
  }

  // Attempt to reconnect with exponential backoff
  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000); // Exponential backoff with 30s max

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.username);
    }, delay);
  }

  // Manually reconnect
  reconnect() {
    if (this.isConnected) {
      this.disconnect();
    }

    this.reconnectAttempts = 0;
    clearTimeout(this.reconnectTimeout);

    return this.connect(this.username);
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      try {
        // Send offline status before disconnecting
        if (this.isConnected && this.username) {
          this.sendMessage("presence", {
            username: this.username,
            status: "offline",
            timestamp: new Date().toISOString(),
          });
        }

        this.socket.close(1000, "User initiated disconnect");
      } catch (error) {
        console.error("Error closing WebSocket:", error);
      }
      this.socket = null;
      this.isConnected = false;
    }
    return true;
  }

  // Request matches specifically
  requestMatches() {
    if (!this.isConnected || !this.username) {
      console.warn("Cannot request matches, not connected or no username");
      return false;
    }

    return this.sendMessage("request_matches", {
      username: this.username,
      timestamp: new Date().toISOString(),
    });
  }

  // Send response to match (accept/reject)
  sendMatchResponse(matchUsername, response) {
    if (!this.isConnected || !this.username) {
      console.warn("Cannot send match response, not connected or no username");
      return false;
    }

    if (response !== "accept" && response !== "reject") {
      console.warn("Invalid match response, must be 'accept' or 'reject'");
      return false;
    }

    return this.sendMessage("match_response", {
      from_username: this.username,
      to_username: matchUsername,
      response: response,
      timestamp: new Date().toISOString(),
    });
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      username: this.username,
      reconnectAttempts: this.reconnectAttempts,
      serverUrl: this.serverUrl,
    };
  }

  // Clean up on component unmount
  cleanup() {
    this.disconnect();
    this.messageListeners = [];
    this.connectionListeners = [];
    clearTimeout(this.reconnectTimeout);

    // Remove app state subscription
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    return true;
  }
}

// Create a singleton instance
const socketService = new WebSocketService();
export default socketService;
