import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Switch,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import * as Speech from "expo-speech"; // For Text-to-Speech
import * as Notifications from "expo-notifications"; // For push notifications

// Import firebase-related functions
import {
  saveAlarm,
  fetchSchedules,
  updateSchedule,
  deleteSchedule,
} from "../firebase";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AlarmScreen = () => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [alarmSwitches, setAlarmSwitches] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false); // Edit modal visibility
  const [selectedDays, setSelectedDays] = useState([]);
  const [currentEditAlarm, setCurrentEditAlarm] = useState(null); // For editing alarms
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [alarmToDelete, setAlarmToDelete] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    registerForPushNotificationsAsync(); // Register for push notifications
    fetchAlarms(); // Fetch alarms on component mount
  }, []);

  const handleSaveAlarm = async () => {
    const alarmData = {
      title,
      time: time.toLocaleTimeString(),
      days: selectedDays,
    };
    await saveAlarm(alarmData);
    setTitle("");
    setTime(new Date());
    setSelectedDays([]);

    // Text-to-Speech confirmation
    Speech.speak(
      `Alarm set for ${time.toLocaleTimeString()} on ${selectedDays.join(", ")}`
    );

    Alert.alert("Success", "Alarm has been saved");
    setModalVisible(false); // Hide modal after saving

    // Schedule notifications for the alarm
    if (alarmSwitches[alarmData.id]) {
      scheduleNotifications(alarmData);
    }

    fetchAlarms(); // Refresh alarms list
  };

  const handleEditAlarm = (alarm) => {
    setTitle(alarm.title);
    setTime(new Date(`1970-01-01T${alarm.time}`));
    setSelectedDays(alarm.days);
    setCurrentEditAlarm(alarm);
    setEditModalVisible(true);
  };

  const handleDeleteAlarm = (alarmId) => {
    // Logic to delete the alarm from your data source
    deleteSchedule(alarmId).then(fetchAlarms);
    setDeleteModalVisible(false);
  };

  const handleUpdateAlarm = async () => {
    if (currentEditAlarm) {
      const updatedAlarm = {
        ...currentEditAlarm,
        title,
        time: time.toLocaleTimeString(),
        days: selectedDays,
      };

      await updateSchedule(currentEditAlarm.id, updatedAlarm);
      setEditModalVisible(false); // Close the edit modal
      fetchAlarms(); // Refresh alarms list
    }
  };

  const scheduleNotifications = async (alarm) => {
    const currentDay = new Date().getDay();
    const currentTime = new Date().getTime();

    alarm.days.forEach(async (day) => {
      const dayNumber = getDayNumber(day);
      const dayDifference = dayNumber - currentDay;

      const alarmTime = new Date();
      alarmTime.setHours(time.getHours());
      alarmTime.setMinutes(time.getMinutes());
      alarmTime.setSeconds(0);

      const timeDifference = alarmTime.getTime() - currentTime;
      const totalMillisecondsUntilAlarm =
        (dayDifference >= 0 ? dayDifference : 7 + dayDifference) *
          24 *
          60 *
          60 *
          1000 +
        timeDifference;

      if (totalMillisecondsUntilAlarm >= 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Reminder",
            body: `${alarm.title} alarm at ${alarm.time}`,
            sound: true,
          },
          trigger: { milliseconds: totalMillisecondsUntilAlarm },
        });
      }
    });
  };

  const fetchAlarms = async () => {
    const fetchedAlarms = await fetchSchedules();
    const alarmData = fetchedAlarms.filter((item) => item.type === "alarm");

    const initialSwitchState = alarmData.reduce((acc, alarm) => {
      acc[alarm.id] = alarm.isActive || false;
      return acc;
    }, {});

    setAlarmSwitches(initialSwitchState);
    setAlarms(alarmData);
  };

  const handleToggleSwitch = (alarmId, value) => {
    setAlarmSwitches((prev) => ({ ...prev, [alarmId]: value }));
    updateSchedule(alarmId, { isActive: value });

    if (value) {
      const alarm = alarms.find((a) => a.id === alarmId);
      scheduleNotifications(alarm); // Schedule notification if active
    } else {
      Notifications.cancelAllScheduledNotificationsAsync(); // Cancel notifications if inactive
    }
  };

  const toggleDaySelection = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert("Failed to get push token for push notifications!");
      return;
    }
    return token;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Medicine Reminder</Text>
      </View>

      <ScrollView>
        {alarms.map((alarm) => (
          <View key={alarm.id} style={styles.alarmContainer}>
            <View>
              <Text style={styles.alarmTitle}>{alarm.title}</Text>
              <Text style={styles.alarmTime}>{alarm.time}</Text>
              <Text style={styles.alarmDays}>
                {alarm.days && alarm.days.join(", ")}
              </Text>
            </View>
            <Switch
              value={alarmSwitches[alarm.id]}
              onValueChange={(value) => handleToggleSwitch(alarm.id, value)}
            />
            <TouchableOpacity onPress={() => handleEditAlarm(alarm)}>
              <Image
                source={require("../assets/edit.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setAlarmToDelete(alarm.id); // Set the alarm ID to delete
                setDeleteModalVisible(true); // Show delete confirmation modal
              }}
            >
              <Image
                source={require("../assets/delete.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Image source={require("../assets/bell.png")} style={styles.bellIcon} />
      </TouchableOpacity>

      {/* Modal for adding new alarm */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          fetchAlarms(); // Refresh on close
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Enter Medicine Name"
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
                  if (selectedTime) {
                    setTime(selectedTime);
                  }
                }}
              />
            )}

            {/* Days of the week selection */}
            <View style={styles.daysOfWeekContainer}>
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day) && styles.dayButtonSelected,
                  ]}
                  onPress={() => toggleDaySelection(day)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDays.includes(day) &&
                        styles.dayButtonTextSelected,
                    ]}
                  >
                    {day.charAt(0)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAlarm}
              >
                <Text style={styles.buttonText1}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Are you sure you want to delete this reminder?
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={[styles.cancelButton, styles.modalButton]}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteAlarm(alarmToDelete)} // Pass the alarm ID here
                style={[styles.confirmButton, styles.modalButton]}
              >
                <Text style={styles.buttonText1}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Alarm Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(false);
          fetchAlarms(); // Refresh on close
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Edit Medicine Name"
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
                  if (selectedTime) {
                    setTime(selectedTime);
                  }
                }}
              />
            )}

            {/* Days of the week selection */}
            <View style={styles.daysOfWeekContainer}>
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day) && styles.dayButtonSelected,
                  ]}
                  onPress={() => toggleDaySelection(day)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDays.includes(day) &&
                        styles.dayButtonTextSelected,
                    ]}
                  >
                    {day.charAt(0)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateAlarm}
              >
                <Text style={styles.buttonText1}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4ff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    justifyContent: "center",
    backgroundColor: "#FFC0CB",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFC0CB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bellIcon: {
    width: 24,
    height: 24,
  },
  alarmContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  alarmTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  alarmTime: {
    fontSize: 14,
    color: "#999",
  },
  alarmDays: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#999",
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    fontWeight: "bold",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: "#f0f4ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  daysOfWeekContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  dayButton: {
    padding: 10,
    backgroundColor: "#f0f4ff",
    borderRadius: 5,
  },
  dayButtonSelected: {
    backgroundColor: "#FFC0CB",
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  dayButtonTextSelected: {
    color: "#fff",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: "#FFC0CB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 4,
  },
  cancelButton: {
    backgroundColor: "#CF9FFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 4,
  },
  buttonText2: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#800080",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: "#FFC0CB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: "#CF9FFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#800080",
  },
  buttonText1: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF69B4",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default AlarmScreen;
