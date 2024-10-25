import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useTheme } from "../components/ThemeContext";
import Settings from "../assets/settings.png";
import User from "../assets/user.png";
import EditIcon from "../assets/edit.png"; // Replace with your edit icon PNG
import TrashIcon from "../assets/delete.png"; // Replace with your trash icon PNG
import SaveIcon from "../assets/diskette.png"; // Replace with your save icon PNG
import {
  fetchChatHistories,
  fetchSchedules,
  deleteConversation,
  updateConversationTitle,
  deleteSchedule,
  updateScheduleTitle,
} from "../firebase";

const ProfileDetail = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("schedules");
  const [chatHistories, setChatHistories] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const loadChatHistories = async () => {
      setLoadingChats(true);
      try {
        const histories = await fetchChatHistories();
        setChatHistories(histories);
      } catch (error) {
        console.error("Error fetching chat histories:", error);
      } finally {
        setLoadingChats(false);
      }
    };

    const loadSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const fetchedSchedules = await fetchSchedules();
        setSchedules(fetchedSchedules);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setLoadingSchedules(false);
      }
    };

    loadChatHistories();
    loadSchedules();
  }, []);

  const handleDelete = (id, type) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete this ${type}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (type === "conversation") {
                await deleteConversation(id);
                setChatHistories(chatHistories.filter((c) => c.id !== id));
              } else if (type === "schedule") {
                await deleteSchedule(id);
                setSchedules(schedules.filter((s) => s.id !== id));
              }
            } catch (error) {
              console.error(`Error deleting ${type}:`, error);
            }
          },
        },
      ]
    );
  };

  const handleRename = async (id, type) => {
    if (!newTitle.trim()) {
      Alert.alert("Error", "Title cannot be empty.");
      return;
    }
    try {
      if (type === "conversation") {
        await updateConversationTitle(id, newTitle);
        setChatHistories(
          chatHistories.map((c) =>
            c.id === id ? { ...c, title: newTitle } : c
          )
        );
      } else if (type === "schedule") {
        await updateScheduleTitle(id, newTitle);
        setSchedules(
          schedules.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
        );
      }
      setEditingId(null);
      setNewTitle("");
    } catch (error) {
      console.error(`Error renaming ${type}:`, error);
    }
  };

  const renderItemColor = (index) => {
    // This function can be modified if you want specific logic for different items.
    return {};
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={User} style={styles.profilePic} resizeMode="cover" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Your Name</Text>
            <Text style={styles.email}>your@email.com</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Image source={Settings} style={styles.optionImage} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Section */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "schedules" && styles.activeTab,
            { backgroundColor: "#CF9FFF" }, // Schedules button color
          ]}
          onPress={() => setActiveTab("schedules")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "schedules" && styles.activeTabText,
            ]}
          >
            Schedules
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "chatHistory" && styles.activeTab,
            { backgroundColor: "#FFC0CB" }, // Chat History button color
          ]}
          onPress={() => setActiveTab("chatHistory")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "chatHistory" && styles.activeTabText,
            ]}
          >
            Chat History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Schedule Section */}
      {activeTab === "schedules" ? (
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>Schedules</Text>

          {loadingSchedules ? (
            <ActivityIndicator size="large" color="#4F8EF7" />
          ) : (
            <ScrollView style={styles.scheduleList}>
              {schedules.length > 0 ? (
                schedules.map((schedule, index) => (
                  <View
                    key={schedule.id}
                    style={[
                      styles.scheduleItem,
                      { backgroundColor: "#CF9FFF" },
                    ]} // Schedule item color
                  >
                    {editingId === schedule.id ? (
                      <TextInput
                        value={newTitle}
                        onChangeText={setNewTitle}
                        style={styles.input}
                      />
                    ) : (
                      <Text style={styles.scheduleText}>
                        {schedule.title} - {schedule.date} at {schedule.time}
                      </Text>
                    )}
                    <View style={styles.actionButtons}>
                      {editingId === schedule.id ? (
                        <TouchableOpacity
                          onPress={() => handleRename(schedule.id, "schedule")}
                        >
                          <Image source={SaveIcon} style={styles.icon} />
                        </TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingId(schedule.id);
                              setNewTitle(schedule.title);
                            }}
                          >
                            <Image source={EditIcon} style={styles.icon} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              handleDelete(schedule.id, "schedule")
                            }
                          >
                            <Image source={TrashIcon} style={styles.icon} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.scheduleText}>No schedules available.</Text>
              )}
            </ScrollView>
          )}
        </View>
      ) : (
        <View style={styles.chatHistoryCard}>
          <Text style={styles.chatHistoryTitle}>Chat History</Text>

          {loadingChats ? (
            <ActivityIndicator size="large" color="#4F8EF7" />
          ) : (
            <ScrollView style={styles.chatHistoryList}>
              {chatHistories.length > 0 ? (
                chatHistories.map((history, index) => (
                  <View
                    key={history.id}
                    style={[
                      styles.chatHistoryItem,
                      { backgroundColor: "#FFC0CB" },
                    ]} // Chat history item color
                  >
                    {editingId === history.id ? (
                      <TextInput
                        value={newTitle}
                        onChangeText={setNewTitle}
                        style={styles.input}
                      />
                    ) : (
                      <Text style={styles.chatHistoryText}>
                        {history.title}
                      </Text>
                    )}
                    <View style={styles.actionButtons}>
                      {editingId === history.id ? (
                        <TouchableOpacity
                          onPress={() =>
                            handleRename(history.id, "conversation")
                          }
                        >
                          <Image source={SaveIcon} style={styles.icon} />
                        </TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingId(history.id);
                              setNewTitle(history.title);
                            }}
                          >
                            <Image source={EditIcon} style={styles.icon} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              handleDelete(history.id, "conversation")
                            }
                          >
                            <Image source={TrashIcon} style={styles.icon} />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.chatHistoryText}>
                  No chat histories available.
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4ff",
  },
  profileCard: {
    padding: 16,
    marginTop: 40,
    backgroundColor: "white",
    borderRadius: 10,
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 10,
  },
  profilePic: {
    width: "100%",
    height: "100%",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    color: "gray",
  },
  optionImage: {
    width: 30,
    height: 30,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  activeTab: {
    elevation: 5,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "white",
  },
  scheduleCard: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 2,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scheduleList: {
    maxHeight: 200,
  },
  scheduleItem: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduleText: {
    fontWeight: "bold",
    color: "#800080",
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
  },
  chatHistoryCard: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    margin: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 2,
  },
  chatHistoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chatHistoryList: {
    maxHeight: 200,
  },
  chatHistoryItem: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatHistoryText: {
    fontWeight: "bold",
    color: "#FF69B4",
    fontSize: 16,
  },
  input: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
  },
});

export default ProfileDetail;
