import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Speech from "expo-speech";
import axios from "axios";
import { useTheme } from "../components/ThemeContext";
import { Entypo, Feather } from "@expo/vector-icons";
import Clipboard from "expo-clipboard";
import UserP from "../assets/user.png";
import RobotP from "../assets/cely.png";
import Arrow from "../assets/arrow2.png";
import Send from "../assets/send.png";
import Mic from "../assets/microphone.png";
import {
  saveMessageInConversation,
  fetchMessagesForConversation,
} from "../firebase";

export default function ChatScreen({ route, navigation }) {
  const { chatId, title } = route.params || {};
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const { theme } = useTheme();
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const messages = await fetchMessagesForConversation(chatId); // Fetch previous messages
        setChatHistory(messages || []); // Set retrieved messages in chatHistory
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
    fetchHistory();
  }, [chatId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "User", message };
    setChatHistory([...chatHistory, userMessage]);
    setMessage("");
    Keyboard.dismiss();

    try {
      const response = await axios.post("http://10.0.2.2:5000/chat", {
        message: userMessage.message,
      });
      const botMessage = { sender: "Bot", message: response.data.response };
      setChatHistory((prevChat) => [...prevChat, botMessage]);
      Speech.speak(botMessage.message);

      await saveMessageInConversation(
        chatId,
        userMessage.message,
        botMessage.message
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prevChat) => [
        ...prevChat,
        { sender: "Bot", message: "Error occurred. Try again later." },
      ]);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory]);

  const renderItem = ({ item }) => (
    <View
      style={
        item.sender === "User"
          ? styles.userMessageWrapper
          : styles.botMessageWrapper
      }
    >
      <Image
        source={item.sender === "User" ? UserP : RobotP}
        style={styles.profilePic}
      />
      <View
        style={item.sender === "User" ? styles.userBubble : styles.botBubble}
      >
        <Text style={[styles.messageText, { color: theme.text }]}>
          {item.message}
        </Text>
      </View>
      <View style={styles.messageIcons}>
        <TouchableOpacity onPress={() => Speech.speak(item.message)}>
          <Entypo
            name="sound"
            size={20}
            color={theme.text}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Clipboard.setString(item.message)}>
          <Feather
            name="copy"
            size={20}
            color={theme.text}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={Arrow} style={styles.sendIcon} />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>{title || "Chat"}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={chatHistory}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.chatHistory}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.text }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor={theme.placeholderText}
        />
        <TouchableOpacity style={styles.micButton}>
          <Image source={Mic} style={styles.sendIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Image source={Send} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#f0f4ff",
  },
  navBar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#BFB9FA",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  navBarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 15,
  },
  chatHistory: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 15,
    height: 45,
    backgroundColor: "#f2f2f2",
    borderColor: "#e0e0e0",
  },
  micButton: {
    marginLeft: 10,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 25,
  },
  userMessageWrapper: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginVertical: 10,
  },
  botMessageWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 10,
  },
  userBubble: {
    backgroundColor: "#D1FFDB",
    borderRadius: 15,
    padding: 10,
    maxWidth: "70%",
  },
  botBubble: {
    backgroundColor: "#FFDEE1",
    borderRadius: 15,
    padding: 10,
    maxWidth: "70%",
  },
  messageText: {
    fontSize: 16,
  },
  messageIcons: {
    flexDirection: "row",
    marginHorizontal: 5,
    alignItems: "center",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  icon: {
    marginHorizontal: 5,
  },
  sendIcon: {
    width: 30,
    height: 30,
  },
});
