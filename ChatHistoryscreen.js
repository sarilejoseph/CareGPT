import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Add from "../assets/plus.png"; // Plus icon for adding a new chat
import RenameIcon from "../assets/edit.png"; // Custom rename icon
import DeleteIcon from "../assets/delete.png"; // Custom delete icon
import AddMess from "../assets/new-message.png";
import {
  fetchChatHistories,
  createConversation,
  updateConversationTitle,
  deleteConversation,
} from "../firebase"; // Firebase functions

export default function ChatHistoryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    const getConversations = async () => {
      try {
        const userConversations = await fetchChatHistories();
        setConversations(userConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    getConversations();
  }, []);

  const handleAddChat = async () => {
    try {
      const newChatId = await createConversation(
        `New Chat ${conversations.length + 1}`
      );
      navigation.navigate("Chat", {
        chatId: newChatId,
        title: `New Chat ${conversations.length + 1}`,
      });
      setConversations((prev) => [
        ...prev,
        { id: newChatId, title: `New Chat ${conversations.length + 1}` },
      ]);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleChatPress = (chat) => {
    navigation.navigate("Chat", { chatId: chat.id, title: chat.title });
  };

  const handleRenameChat = async () => {
    try {
      if (selectedChat && newTitle) {
        await updateConversationTitle(selectedChat.id, newTitle);
        setConversations((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat.id ? { ...chat, title: newTitle } : chat
          )
        );
        setSuccessMessage("Successfully renamed!");
        setNewTitle("");
        setRenameModalVisible(false);
        showSuccessMessage();
      }
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const handleDeleteChat = async () => {
    if (selectedChat) {
      try {
        await deleteConversation(selectedChat.id);
        setConversations((prev) =>
          prev.filter((chat) => chat.id !== selectedChat.id)
        );
        setSuccessMessage("Successfully deleted!");
        setDeleteModalVisible(false);
        showSuccessMessage();
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };

  const openRenameModal = (chat) => {
    setSelectedChat(chat);
    setNewTitle(chat.title); // Set the current title for renaming
    setRenameModalVisible(true);
  };

  const openDeleteModal = (chat) => {
    setSelectedChat(chat);
    setDeleteModalVisible(true);
  };

  const showSuccessMessage = () => {
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const filteredChats = conversations.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search chats..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {successMessage ? (
        <Text style={styles.successMessage}>{successMessage}</Text>
      ) : null}

      <View style={styles.chatListContainer}>
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.chatItemContainer, styles.card]}>
              <TouchableOpacity
                onPress={() => handleChatPress(item)}
                style={styles.chatItem}
              >
                <Text style={styles.chatTitle}>{item.title}</Text>
              </TouchableOpacity>
              <View style={styles.chatIcons}>
                <TouchableOpacity
                  onPress={() => openRenameModal(item)}
                  style={styles.iconButton}
                >
                  <Image source={RenameIcon} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openDeleteModal(item)}
                  style={styles.iconButton}
                >
                  <Image source={DeleteIcon} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* Rename Modal */}
      <Modal visible={renameModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Chat</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="New chat name"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleRenameChat}
                style={[styles.confirmButton, styles.modalButton]}
              >
                <Text style={styles.buttonText1}>Rename</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRenameModalVisible(false)}
                style={[styles.cancelButton, styles.modalButton]}
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
              Are you sure you want to delete this chat?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={[styles.cancelButton, styles.modalButton]}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteChat}
                style={[styles.confirmButton, styles.modalButton]}
              >
                <Text style={styles.buttonText1}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={handleAddChat} style={styles.floatingButton}>
        <Image source={AddMess} style={styles.sendIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  searchBar: {
    backgroundColor: "#FFC0CB",
    borderRadius: 5,
    fontWeight: "bold",
    height: 70,
    padding: 10,
    marginTop: 30, // Adjusted for consistent spacing
  },
  chatListContainer: {
    flex: 1, // Allows the FlatList to take remaining space
  },
  floatingButton: {
    position: "absolute",
    bottom: 150, // Adjusted to keep it higher
    right: 30,
    backgroundColor: "#FFC0CB",
    borderRadius: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding: 15,
  },
  sendIcon: {
    width: 24,
    height: 24,
  },
  chatItemContainer: {
    flexDirection: "row", // Changed to row to align title and icons
    justifyContent: "space-between",
    alignItems: "center", // Center the items vertically
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333", // Matching font color to HomeScreen
    flex: 1, // Allow title to take available space
  },
  chatIcons: {
    flexDirection: "row",
    alignItems: "center", // Align icons vertically centered
  },
  iconButton: {
    paddingHorizontal: 10, // Add space between icons
  },
  icon: {
    width: 24,
    height: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    padding: 20,
    alignContent: "center",
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  successMessage: {
    color: "green",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
});
