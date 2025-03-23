// src/services/WebSocketService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import * as Haptics from "expo-haptics";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.serverUrl = "ws://54.210.56.10:8080/ws"; // Змінено URL з портом
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.messageListeners = [];
    this.connectionListeners = [];
    this.username = null;
    this.appState = AppState.currentState;

    // Зберігаємо підписку для можливості її видалення пізніше
    this.appStateSubscription = AppState.addEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/inactive|background/) && nextAppState === "active") {
      // App has come to the foreground
      this.reconnect();
    }
    this.appState = nextAppState;
  };

  // Connect to WebSocket server
  async connect(username) {
    if (this.isConnected) return true;

    try {
      if (!username) {
        username = (await AsyncStorage.getItem("username")) || "anonymous";
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

        // Vibrate to indicate connection
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Received WebSocket message:", message);
          this._notifyMessageListeners(message);

          // Vibrate for important messages
          if (message.type === "proximity_alert" || message.type === "notification") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        this.isConnected = false;
        this._notifyConnectionListeners(false);
        this._attemptReconnect();
      };

      return true;
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error);
      return false;
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

  // Attempt to reconnect
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
    clearTimeout(this.reconnectTimeout);

    if (this.socket) {
      try {
        this.socket.close(1000, "User initiated disconnect");
      } catch (error) {
        console.error("Error closing WebSocket:", error);
      }
      this.socket = null;
    }

    this.isConnected = false;
    return true;
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      username: this.username,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Clean up on component unmount
  cleanup() {
    this.disconnect();
    this.messageListeners = [];
    this.connectionListeners = [];

    // Правильно видаляємо підписку
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    return true;
  }
}

// Create a singleton instance
const socketService = new WebSocketService();
export default socketService;
