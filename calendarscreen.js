import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars"; // Import Calendar
import {
  saveEvent,
  fetchSchedules,
  updateSchedule,
  deleteSchedule,
} from "../firebase";

const CalendarScreen = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Set default date to today
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // State for delete modal
  const [currentEditEvent, setCurrentEditEvent] = useState(null);
  const [alarmToDelete, setAlarmToDelete] = useState(null); // State to hold alarm ID to delete
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const fetchedEvents = await fetchSchedules();
    const calendarData = fetchedEvents.filter(
      (item) => item.type === "calendar"
    );
    setEvents(calendarData);
  };

  const handleSaveEvent = async () => {
    const eventData = {
      title,
      date,
      alarmOn: isAlarmOn,
      type: "calendar",
    };
    await saveEvent(eventData);
    resetForm();
    fetchEvents();
  };

  const resetForm = () => {
    setTitle("");
    setDate(new Date().toISOString().split("T")[0]);
    setIsAlarmOn(false);
    setModalVisible(false);
  };

  const handleEditEvent = (event) => {
    setTitle(event.title);
    setDate(event.date.split("T")[0]);
    setIsAlarmOn(event.alarmOn);
    setCurrentEditEvent(event);
    setEditModalVisible(true);
  };

  const handleUpdateEvent = async () => {
    if (currentEditEvent) {
      const updatedEvent = {
        ...currentEditEvent,
        title,
        date,
        alarmOn: isAlarmOn,
      };

      await updateSchedule(currentEditEvent.id, updatedEvent);
      setEditModalVisible(false);
      fetchEvents();
    }
  };

  const handleDeleteEvent = (eventId) => {
    setAlarmToDelete(eventId); // Set the alarm ID to delete
    setDeleteModalVisible(true); // Show the delete confirmation modal
  };

  const confirmDeleteEvent = async () => {
    await deleteSchedule(alarmToDelete); // Delete the schedule
    setDeleteModalVisible(false); // Close the modal
    fetchEvents(); // Refresh events
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Calendar Events</Text>
      </View>

      <ScrollView>
        {events.map((event) => (
          <View key={event.id} style={styles.eventContainer}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>
                {new Date(event.date).toLocaleDateString()}
              </Text>
            </View>
            <Switch
              value={event.alarmOn}
              onValueChange={(value) => {
                const updatedEvent = { ...event, alarmOn: value };
                updateSchedule(event.id, updatedEvent);
                fetchEvents();
              }}
            />

            <TouchableOpacity onPress={() => handleEditEvent(event)}>
              <Image
                source={require("../assets/edit.png")}
                style={styles.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteEvent(event.id)}>
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
        <Image
          source={require("../assets/calendar.png")}
          style={styles.bellIcon}
        />
      </TouchableOpacity>

      {/* Modal for adding new event */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Enter Event Title"
              value={title}
              onChangeText={setTitle}
            />

            {/* Calendar inside the modal */}
            <Calendar
              onDayPress={(day) => setDate(day.dateString)} // Set date on day press
              markedDates={{
                [date]: { selected: true, color: "pink" }, // Highlight selected date
              }}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleSaveEvent}
              >
                <Text style={styles.buttonText1}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Edit Event Title"
              value={title}
              onChangeText={setTitle}
            />

            {/* Calendar inside the modal for editing */}
            <Calendar
              onDayPress={(day) => setDate(day.dateString)}
              markedDates={{
                [date]: { selected: true, color: "pink" },
              }}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleUpdateEvent}
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
                onPress={confirmDeleteEvent} // Call confirm delete
                style={[styles.confirmButton, styles.modalButton]}
              >
                <Text style={styles.buttonText1}>Yes</Text>
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
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  eventContainer: {
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
  eventInfo: {
    flex: 1,
  },
  eventActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  eventDate: {
    color: "#999",
    marginTop: 2,
    fontSize: 14,
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 16,
  },
  floatingButton: {
    position: "absolute",
    bottom: 100,
    right: 30,
    backgroundColor: "#FFC0CB",
    borderRadius: 50,
    padding: 16,
    elevation: 4,
  },
  bellIcon: {
    width: 30,
    height: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    backgroundColor: "#FFC0CB",
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  confirmButton: {
    backgroundColor: "#FFC0CB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 7,
  },
  cancelButton: {
    backgroundColor: "#CF9FFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 7,
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
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default CalendarScreen;
