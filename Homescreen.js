import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase"; // Import auth from Firebase
import { fetchSchedules } from "../firebase"; // Import fetchSchedules from your firebase.js
import Cely from "../assets/cely.png";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const navigation = useNavigation();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [textIndex, setTextIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [schedules, setSchedules] = useState([]);

  const messages = [
    "How are you?",
    "Greetings",
    "Hi",
    "Hello!",
    "Ready for a new task?",
  ];

  useEffect(() => {
    // Fetch username from Firebase Auth
    const user = auth.currentUser;
    if (user) {
      setUsername(user.email.split("@")[0]); // Set username from email (before the @ symbol)
    }

    let isMounted = true;

    const cycleTexts = () => {
      if (!isMounted) return; // Ensure the component is still mounted

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }).start(() => {
            setTextIndex((prevIndex) => (prevIndex + 1) % messages.length);
            cycleTexts();
          });
        }, 5000);
      });
    };

    cycleTexts();

    // Fetch schedules from Firebase once on component mount
    const getSchedules = async () => {
      try {
        const fetchedSchedules = await fetchSchedules();
        setSchedules(fetchedSchedules);
        console.log("Fetched Schedules:", fetchedSchedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    getSchedules();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card for Hello Message and Profile Image */}
        <View style={styles.card}>
          <Text style={styles.headerTitle}>Hello, {username}!</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, let's get started.
          </Text>
          <View style={styles.floatingSection}>
            <View style={styles.dialogueContainer}>
              <View style={styles.dialogueBox}>
                <Animated.Text
                  style={[styles.alternateText, { opacity: fadeAnim }]}
                >
                  {messages[textIndex]}
                </Animated.Text>
              </View>
              <TouchableOpacity activeOpacity={0.8}>
                <Image source={Cely} style={styles.profileImage} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Scrollable Schedules */}
        <View style={styles.schedulesContainer}>
          <Text style={styles.schedulesTitle}>Your Schedules</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {schedules.map((schedule, index) => (
              <View key={index} style={styles.scheduleCard}>
                <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                <Text style={styles.scheduleDate}>{schedule.date}</Text>
                <Text style={styles.scheduleTime}>{schedule.time}</Text>
                {/* Safeguard against undefined days */}
                <Text style={styles.scheduleDays}>
                  {schedule.days ? schedule.days.join(", ") : ""}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Card for Bottom Navigation Buttons */}
      <View style={styles.buttonCard}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ChatScreen")} // Navigates to ChatScreen
          >
            <Text style={styles.buttonText1}>Start a Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.setScheduleButton]}
            onPress={() => navigation.navigate("ScheduleScreen")} // Navigates to ScheduleScreen
          >
            <Text style={styles.buttonText}>Set Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Light gray background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30, // Reduced padding at the bottom
  },
  card: {
    marginTop: 40,
    backgroundColor: "#FFC0CB", // Pink card background
    borderRadius: 10,
    padding: 10, // Increased padding
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 15,
    elevation: 3, // Add elevation for Android shadow
  },
  headerTitle: {
    fontSize: 33, // Increased font size
    fontWeight: "bold",
    color: "#3e4a7d",
    marginTop: 10,
    marginBottom: 10,
  },
  headerSubtitle: { fontSize: 17, color: "#3e4a7d", marginBottom: 10 }, // Increased font size
  floatingSection: { alignItems: "center" },
  dialogueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dialogueBox: {
    backgroundColor: "#CF9FFF",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    maxWidth: "70%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  profileImage: { width: 110, height: 110, borderRadius: 60 }, // Increased size
  schedulesContainer: {
    marginTop: 20,
  },
  schedulesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3e4a7d",
    marginBottom: 10,
  },
  scheduleCard: {
    backgroundColor: "#CF9FFF",
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    elevation: 3,
    height: 180,
    width: width * 0.6, // Width for the card
  },
  scheduleTitle: {
    fontSize: 18,
    color: "#800080",
    fontWeight: "bold",
  },
  scheduleDate: {
    fontSize: 14,
    color: "#7F00FF",
  },
  scheduleTime: {
    fontSize: 14,
    color: "#7F00FF",
  },
  scheduleDays: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7F00FF",
  },
  buttonCard: {
    backgroundColor: "#fff",
    marginBottom: 100,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    padding: 20, // Increased padding
    height: 100,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Add elevation for Android shadow
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  button: {
    flex: 1,
    backgroundColor: "#FFC0CB",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
    height: 50,
    marginTop: 7,
  },
  setScheduleButton: {
    backgroundColor: "#CF9FFF",
  },
  buttonText: {
    color: "#800080",
    fontSize: 15,
    fontWeight: "bold",
  },
  buttonText1: {
    color: "#FF69B4",
    fontSize: 15,
    fontWeight: "bold",
  },
});
