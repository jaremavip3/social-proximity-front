import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SvgXml } from "react-native-svg";
import * as Haptics from "expo-haptics";
import socketService from "../services/WebSocketService";

const arrowBack = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.1" d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" fill="#ffffff"></path> <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="#ffffff" stroke-width="2"></path> <path d="M8 12L16 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 9L8.08704 11.913V11.913C8.03897 11.961 8.03897 12.039 8.08704 12.087V12.087L11 15" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
`;

export default function BestMatchScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Connect to WebSocket and listen for messages
  useEffect(() => {
    // Set up WebSocket connection status listener
    socketService.addConnectionListener(setWsConnected);

    // Set up message listener for WebSocket
    socketService.addMessageListener(handleWebSocketMessage);

    // Request a best match when component mounts
    requestBestMatch();

    // Clean up on unmount
    return () => {
      socketService.removeConnectionListener(setWsConnected);
      socketService.removeMessageListener(handleWebSocketMessage);
    };
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = (message) => {
    if (message.type === "best_match") {
      setIsLoading(false);
      setCurrentMatch(message.payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (message.type === "best_match_error") {
      setIsLoading(false);
      Alert.alert("Match Error", message.payload.message || "Failed to find a match for you.");
    }
  };

  // Request a best match from the server
  const requestBestMatch = () => {
    setIsLoading(true);
    if (!wsConnected) {
      // Try to reconnect if not connected
      socketService.reconnect();
      Alert.alert("Connection Required", "Connecting to server to find your best match...", [{ text: "OK" }]);
      return;
    }

    // Send request for best match
    socketService.sendMessage("find_best_match", {
      timestamp: new Date().toISOString(),
    });
  };

  // Handle accepting a match
  const handleAcceptMatch = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Notify server that match was accepted
    socketService.sendMessage("accept_match", {
      matchedUsername: currentMatch.username,
      timestamp: new Date().toISOString(),
    });

    // Navigate to the CommonData screen with the match data
    navigation.navigate("CommonData", { userData: currentMatch });
  };

  // Handle rejecting a match
  const handleRejectMatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Notify server that match was rejected
    socketService.sendMessage("reject_match", {
      matchedUsername: currentMatch.username,
      timestamp: new Date().toISOString(),
    });

    // Request another match
    requestBestMatch();
  };

  const handleGoToWelcome = () => {
    navigation.navigate("Welcome");
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Best Match</Text>
        <TouchableOpacity style={styles.arrowBack} activeOpacity={0.5} onPress={handleGoToWelcome}>
          <SvgXml xml={arrowBack} width={35} height={35} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F5A623" />
          <Text style={styles.loadingText}>Finding your best match...</Text>
        </View>
      ) : currentMatch ? (
        <View style={styles.matchContainer}>
          <View style={styles.matchCard}>
            <Text style={styles.matchName}>{currentMatch.username || currentMatch.name}</Text>

            {currentMatch.match_score && (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Match Score:</Text>
                <Text style={styles.scoreValue}>{Math.round(currentMatch.match_score * 100)}%</Text>
              </View>
            )}

            {currentMatch.skill_overlap && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoLabel}>Skills:</Text>
                <Text style={styles.infoValue}>{currentMatch.skill_overlap}</Text>
              </View>
            )}

            {currentMatch.reason && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoLabel}>Why this match?</Text>
                <Text style={styles.infoValue}>{currentMatch.reason}</Text>
              </View>
            )}
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={handleRejectMatch}>
              <Text style={styles.actionButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={handleAcceptMatch}>
              <Text style={styles.actionButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.noMatchContainer}>
          <Text style={styles.noMatchText}>No matches available right now.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={requestBestMatch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  arrowBack: {
    backgroundColor: "#0052CC",
    padding: 5,
    borderRadius: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    marginTop: 20,
  },
  matchContainer: {
    flex: 1,
    alignItems: "center",
  },
  matchCard: {
    backgroundColor: "#161B2B",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#4169E1",
    padding: 20,
    width: "100%",
    marginBottom: 30,
  },
  matchName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(65, 105, 225, 0.2)",
    padding: 10,
    borderRadius: 10,
  },
  scoreLabel: {
    color: "white",
    fontSize: 16,
    marginRight: 10,
  },
  scoreValue: {
    color: "#F5A623",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoLabel: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    color: "white",
    fontSize: 16,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#757575",
  },
  actionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  noMatchContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMatchText: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#F5A623",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
