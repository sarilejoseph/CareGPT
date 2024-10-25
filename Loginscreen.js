import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import { auth } from "../firebase"; // Import auth from Firebase
import { signInWithEmailAndPassword } from "firebase/auth"; // Firebase Auth method
import Logo from "../assets/cely.png"; // Your logo
import BotProfile from "../assets/cely2.png"; // Profile image for the bot
import Ionicons from "react-native-vector-icons/Ionicons"; // Icon library for eye icon

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility

  const handleLogin = () => {
    if (!username || !password) {
      setErrorMessage("Username and password are required.");
      setModalVisible(true);
      return;
    }

    // Firebase login
    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        navigation.navigate("Main");
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setModalVisible(true);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.title}>Cely</Text>
      </View>
      <Text style={styles.subtitle}>by careGPT</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0AEC0"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A0AEC0"
          secureTextEntry={!passwordVisible} // Toggle between visible and hidden password
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          <Ionicons
            name={passwordVisible ? "eye-off" : "eye"} // Toggle icon
            size={20}
            color="#A0AEC0"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>
          Don't have an account?
          <Text style={styles.registerText}> Register</Text>
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image source={BotProfile} style={styles.botImage} />
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#CBD5E0",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    height: 50,
    fontSize: 16,
    padding: 10,
    color: "#1E3A8A",
    flex: 1,
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: "#FFC0CB",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#C0C0C0",
    textAlign: "center",
    marginTop: 10,
  },
  registerText: {
    color: "#0000FF", // Light blue color for the "Register" text
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
  },
  botImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#C53030", // Red color for error
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
