import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Assuming you're using Expo or have react-native-vector-icons installed
import * as Progress from "react-native-progress"; // New import for progress bar

const phases = [
  {
    title: "Welcome to the App!",
    description:
      "Hi there, my name is Cely, I'm your very own virtual companion. Here, you will get to know more about the amazing features we offer, let me show you around!",
    image: require("../assets/cely.png"),
  },
  {
    title: "Home page",
    description: "You can navigate and interact with me!",
    image: require("../assets/HomeS.png"),
  },
  {
    title: "Medication Reminder",
    description:
      "I can remind you with your daily medication intake or activities.",
    image: require("../assets/AlarmS.png"),
  },
  {
    title: "Event Remider",
    description:
      "I can notify you with upcoming events like birthdays or doctors appointments.",
    image: require("../assets/CalendarS.png"),
  },
  {
    title: "Let's have a chat",
    description:
      "You can talk to me about your day, on how are you feeling, or just casual conversation",
    image: require("../assets/ChatS.png"),
  },
];

export default function Walkthrough({ navigation }) {
  const [currentPhase, setCurrentPhase] = useState(0);

  const handleNext = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const handleGetStarted = () => {
    navigation.replace("Login");
  };

  const progress = (currentPhase + 1) / phases.length;

  return (
    <View style={styles.container}>
      {/* Walkthrough Content */}
      <Image source={phases[currentPhase].image} style={styles.image} />
      <Text style={styles.title}>{phases[currentPhase].title}</Text>
      <Text style={styles.description}>{phases[currentPhase].description}</Text>

      {/* Progress Bar */}
      <Progress.Bar
        progress={progress}
        width={null}
        height={6}
        color="#FFC0CB"
        style={styles.progressBar}
      />

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {/* Previous Icon Button (if not the first phase) */}
        {currentPhase > 0 && (
          <TouchableOpacity onPress={handlePrevious} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Next Icon or Get Started Icon Button */}
        {currentPhase < phases.length - 1 ? (
          <TouchableOpacity onPress={handleNext} style={styles.iconButton}>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleGetStarted}
            style={styles.iconButton}
          >
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sign Up & Login Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    marginTop: 50,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5, // Reduced margin to bring title closer to description
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#808080",
    marginTop: 0, // Removed margin to further close the gap
  },
  progressBar: {
    width: "100%",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  iconButton: {
    backgroundColor: "#C0CBFF",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginHorizontal: 10,
    marginBottom: 50,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  signUpButton: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 30,
    width: "48%",
    height: 50,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  signUpText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000000",
  },
  loginButton: {
    backgroundColor: "#ff69b4",
    padding: 10,
    borderRadius: 30,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loginText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
});
