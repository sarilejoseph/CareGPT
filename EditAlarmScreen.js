// EditAlarmScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fetchSchedules, updateSchedule } from "../firebase";

const EditAlarmScreen = ({ route, navigation }) => {
  const { alarm } = route.params; // Get alarm data passed from the previous screen
  const [title, setTitle] = useState(alarm.title);
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState(alarm.days || []);

  useEffect(() => {
    setTime(new Date(`1970-01-01T${alarm.time}`)); // Set time based on alarm time
  }, [alarm]);

  const handleSave = async () => {
    const updatedAlarm = {
      title,
      time: time.toLocaleTimeString(),
      days: selectedDays,
    };

    await updateSchedule(alarm.id, updatedAlarm);
    Alert.alert("Success", "Alarm has been updated");
    navigation.goBack(); // Navigate back to the previous screen
  };

  const toggleDaySelection = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Edit Alarm</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={(text) => setTitle(text)}
      />

      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.timeText}>{time.toLocaleTimeString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="spinner"
          onChange={(event, selectedTime) => {
            setShowPicker(false);
            setTime(selectedTime || time);
          }}
        />
      )}

      <Text style={styles.daysText}>Select Days:</Text>
      <View style={styles.dayButtonsContainer}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDays.includes(day) && styles.selectedDayButton,
            ]}
            onPress={() => toggleDaySelection(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDays.includes(day) && styles.selectedDayButtonText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E8F5E9",
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    fontSize: 20,
    padding: 15,
    borderColor: "#81C784",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#F1F8E9",
  },
  pickerContainer: {
    backgroundColor: "#FFD54F",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    fontSize: 24,
    color: "#6D4C41",
  },
  daysText: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  dayButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  dayButton: {
    backgroundColor: "#BBDEFB",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedDayButton: {
    backgroundColor: "#2196F3",
  },
  dayButtonText: {
    color: "#000000",
    fontSize: 16,
  },
  selectedDayButtonText: {
    color: "#ffffff",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 20,
  },
});

export default EditAlarmScreen;
