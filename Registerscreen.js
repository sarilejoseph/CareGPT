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
import { auth, db } from "../firebase"; // Ensure the path is correct
import { createUserWithEmailAndPassword } from "firebase/auth"; // Firebase Auth method
import { setDoc, doc } from "firebase/firestore"; // Firestore methods for user data
import Logo from "../assets/cely.png";
import BotProfile from "../assets/cely2.png";

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const handleNextStep = () => {
    if (step === 1 && !username) {
      setErrorMessage("Username is required.");
      setModalVisible(true);
      return;
    }
    if (step === 2 && !email) {
      setErrorMessage("Email is required.");
      setModalVisible(true);
      return;
    }
    if (step === 3 && (!password || /[^a-zA-Z0-9]/.test(password))) {
      setErrorMessage(
        "Password is required and must not contain special characters."
      );
      setModalVisible(true);
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleRegister();
    }
  };

  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
        });
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
      <Text style={styles.stepText}>Step {step} of 3</Text>

      {step === 1 && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#A0AEC0"
            value={username}
            onChangeText={setUsername}
          />
        </View>
      )}

      {step === 2 && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A0AEC0"
            value={email}
            onChangeText={setEmail}
          />
        </View>
      )}

      {step === 3 && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
      )}

      <TouchableOpacity style={styles.registerButton} onPress={handleNextStep}>
        <Text style={styles.buttonText}>{step < 3 ? "Next" : "Register"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>
          Already have and account?
          <Text style={styles.registerText}> Login</Text>
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
  stepText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#CBD5E0",
  },
  input: {
    height: 50,
    fontSize: 16,
    padding: 10,
    color: "#1E3A8A",
  },
  registerButton: {
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
    color: "#0000FF",
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
