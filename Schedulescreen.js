import React from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const ScheduleScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.buttonCard}
          onPress={() => navigation.navigate("Alarm")}
        >
          <Image source={require("../assets/alarm.png")} style={styles.icon} />
          <Text style={styles.buttonText}>Set Alarm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonCard2}
          onPress={() => navigation.navigate("Calendar")}
        >
          <Image
            source={require("../assets/calendar.png")}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Set Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%", // Adjust the width of the row to center it
  },
  buttonCard: {
    flex: 1,
    backgroundColor: "#CF9FFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4, // Adds shadow on Android
  },
  buttonCard2: {
    flex: 1,
    backgroundColor: "#FFC0CB",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4, // Adds shadow on Android
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "#3e4a7d",
    fontWeight: "bold",
  },
});

export default ScheduleScreen;
