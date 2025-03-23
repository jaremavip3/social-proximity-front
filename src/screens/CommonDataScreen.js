import React, { useEffect, useState } from "react";

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SvgXml } from "react-native-svg";

const arrowBack = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.1" d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" fill="#ffffff"></path> <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="#ffffff" stroke-width="2"></path> <path d="M8 12L16 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 9L8.08704 11.913V11.913C8.03897 11.961 8.03897 12.039 8.08704 12.087V12.087L11 15" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    `;

export default function CommonDataScreen({ navigation }) {
  const handleGoToWelcome = () => {
    navigation.navigate("Welcome");
  };

  const userData = {
    name: "user3",
    ranking_position: 1,
    skill_overlap: "High overlap in Java, SQL, and React skills.",
    complementary_strengths:
      "user3 brings additional expertise in Next.js, Supabase, and REST APIs, enhancing full-stack capabilities.",
    networking_potential:
      "Strong potential for collaboration on AI, backend systems, and ML pipelines due to shared interests and complementary skills.",
    suggested_collaboration: "Joint projects in full-stack development with AI integration.",
    reason: "High skill overlap and complementary strengths in full-stack development and AI-related interests.",
    match_score: 0.9,
  };
  //   PROGRESS CIRCLE COMPONENT
  function CircularProgress({ percentage }) {
    const [displayPercentage, setDisplayPercentage] = useState(0);

    const targetPercentage = Math.round(percentage);
    useEffect(() => {
      let counter = 0;
      setDisplayPercentage(0);
      const interval = setInterval(() => {
        counter++;
        setDisplayPercentage(counter);
        if (counter === targetPercentage) {
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    }, [percentage]);

    const size = 80;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    return (
      <View style={{ width: size, height: size, marginTop: 20 }}>
        <SvgXml
          xml={`
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <circle 
                    cx="${size / 2}" 
                    cy="${size / 2}" 
                    r="${radius}" 
                    fill="transparent"
                    stroke="#1A365D"
                    stroke-width="${strokeWidth}"
                />
                <circle 
                    cx="${size / 2}" 
                    cy="${size / 2}" 
                    r="${radius}" 
                    fill="transparent"
                    stroke="#4169E1"
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${strokeDashoffset}"
                    transform="rotate(-90 ${size / 2} ${size / 2})"
                />
                </svg>
            `}
          width={size}
          height={size}
        />
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{displayPercentage}%</Text>
        </View>
      </View>
    );
  }
  //   CARD COMPONENT
  function InfoCard({ icon, title, description }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{icon}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>UserName</Text>
        <TouchableOpacity style={styles.arrowBack} activeOpacity={0.5} onPress={handleGoToWelcome}>
          <SvgXml xml={arrowBack} width={35} height={35} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{userData.name}</Text>
          <View style={styles.rankContainer}>
            <Text style={styles.rankIcon}>🏆</Text>
            <Text style={styles.rankText}>Rank #{userData.ranking_position}</Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <CircularProgress percentage={userData.match_score * 100} />
          <Text style={styles.scoreLabel}>Match Score</Text>
        </View>
      </View>

      <ScrollView style={styles.contentContainer}>
        <ScrollView style={styles.contentContainer}>
          <InfoCard icon="👥" title="Skill Overlap" description={userData.skill_overlap} />

          <InfoCard icon="⚡" title="Complementary Strengths" description={userData.complementary_strengths} />

          <InfoCard icon="🔗" title="Networking Potential" description={userData.networking_potential} />

          <InfoCard icon="💡" title="Suggested Collaboration" description={userData.suggested_collaboration} />
        </ScrollView>
      </ScrollView>
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
  },
  arrowBack: {
    backgroundColor: "#0052CC",
    padding: 5,
    borderRadius: 13,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
    display: "flex",
  },
  rankIcon: {
    fontSize: 18,
    marginRight: 5,
    color: "#FFD700", // Gold color
  },
  rankText: {
    fontSize: 18,
    color: "#FFD700", // Gold color
  },
  scoreContainer: {
    alignItems: "center",
  },
  progressCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#4169E1", // Royal blue
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  progressCircleInner: {
    width: 70,
    height: 70,
    borderRadius: 35,

    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  scoreLabel: {
    marginTop: 10,
    color: "white",
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "#161B2B", // Dark blue background for cards
    borderRadius: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#4169E1",
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
    color: "white",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  cardDescription: {
    fontSize: 16,
    color: "white",
    opacity: 0.8,
    lineHeight: 22,
  },
  progressTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
