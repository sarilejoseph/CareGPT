import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { useTheme } from "../components/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import LockIcon from "../assets/padlock.png";
import NotificationIcon from "../assets/bell.png";
import ContactIcon from "../assets/contact.png";
import TermsIcon from "../assets/contact1.png";
import LogoutIcon from "../assets/logout.png";
import Back from "../assets/arrow2.png";
import User from "../assets/user.png";
import CelyLogo from "../assets/cely2.png";

export default function SettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(true);
  };

  const confirmLogout = () => {
    setModalVisible(false);
    navigation.navigate("Login");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image source={Back} style={styles.optionImage} />
      </TouchableOpacity>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.header}>
          <Image source={User} style={styles.profilePic} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Your Name</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Settings Options */}
      <View style={styles.card}>
        {/* Change Password */}
        <TouchableOpacity style={styles.option}>
          <Image source={LockIcon} style={styles.optionImage} />
          <Text style={[styles.optionText, { color: theme.text }]}>
            Change Password
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity style={styles.option}>
          <Image source={NotificationIcon} style={styles.optionImage} />
          <Text style={[styles.optionText, { color: theme.text }]}>
            Notifications
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Contact Us */}
        <TouchableOpacity style={styles.option}>
          <Image source={ContactIcon} style={styles.optionImage} />
          <Text style={[styles.optionText, { color: theme.text }]}>
            Contact Us
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Terms & Conditions */}
        <TouchableOpacity style={styles.option}>
          <Image source={TermsIcon} style={styles.optionImage} />
          <Text style={[styles.optionText, { color: theme.text }]}>
            Terms & Conditions
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.text} />
        </TouchableOpacity>

        {/* Log Out */}
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Image source={LogoutIcon} style={styles.optionImage} />
          <Text style={[styles.optionText, { color: theme.text }]}>
            Log Out
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Custom Logout Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Image source={CelyLogo} style={styles.modalImage} />
            <Text style={styles.modalText}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonConfirm]}
                onPress={confirmLogout}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F0F4FF",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 80,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    marginLeft: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  editProfileText: {
    color: "#4F46E5",
    fontSize: 14,
    marginTop: 5,
  },
  card: {
    backgroundColor: "#F0F4FF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  optionImage: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    padding: 10,
    borderRadius: 10,
    width: 100,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: "#EEE",
  },
  buttonConfirm: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    fontSize: 16,
  },
});
