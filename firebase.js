import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJIq6xwKkDgFDj8_Fe0oO0yetrfxzBAOM",
  authDomain: "caregpt-4eefa.firebaseapp.com",
  databaseURL: "https://caregpt-4eefa-default-rtdb.firebaseio.com",
  projectId: "caregpt-4eefa",
  storageBucket: "caregpt-4eefa.appspot.com",
  messagingSenderId: "31646389579",
  appId: "1:31646389579:web:267c9d9714e4d2e05204ce",
  measurementId: "G-22KQYQPNZB",
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // If already initialized, use the existing instance
}

// Initialize Auth with AsyncStorage for persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Helper constants for collections
const SCHEDULES_COLLECTION = (uid) => `users/${uid}/schedules`;
const CONVERSATIONS_COLLECTION = (uid) => `users/${uid}/conversations`;

// Function to get current user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

// --- Alarm and Calendar Event Functions ---

// Function to save an alarm in Firestore
export const saveAlarm = async (alarmData) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      const alarmRef = collection(db, SCHEDULES_COLLECTION(user.uid));
      const newAlarm = await addDoc(alarmRef, {
        ...alarmData,
        type: "alarm",
        createdAt: new Date().toISOString(),
      });
      return newAlarm.id;
    } else {
      throw new Error("No authenticated user found.");
    }
  } catch (error) {
    console.error("Error saving alarm:", error);
  }
};

// Function to save a calendar event in Firestore
export const saveEvent = async (eventData) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      const eventRef = collection(db, SCHEDULES_COLLECTION(user.uid));
      const newEvent = await addDoc(eventRef, {
        ...eventData,
        type: "calendar",
        createdAt: new Date().toISOString(),
      });
      return newEvent.id;
    } else {
      throw new Error("No authenticated user found.");
    }
  } catch (error) {
    console.error("Error saving calendar event:", error);
  }
};

// Function to fetch all alarms and calendar events
export const fetchSchedules = async () => {
  try {
    const user = await getCurrentUser();
    if (user) {
      const scheduleRef = collection(db, SCHEDULES_COLLECTION(user.uid));
      const schedulesSnapshot = await getDocs(scheduleRef);
      const schedules = schedulesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return schedules;
    } else {
      throw new Error("No authenticated user found.");
    }
  } catch (error) {
    console.error("Error fetching schedules:", error);
  }
};

// Function to update an alarm or calendar event
export const updateSchedule = async (scheduleId, updatedData) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      const scheduleRef = doc(db, SCHEDULES_COLLECTION(user.uid), scheduleId);
      await updateDoc(scheduleRef, { ...updatedData });
    }
  } catch (error) {
    console.error("Error updating schedule:", error);
  }
};

// Function to delete an alarm or calendar event
export const deleteSchedule = async (scheduleId) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      const scheduleRef = doc(db, SCHEDULES_COLLECTION(user.uid), scheduleId);
      await deleteDoc(scheduleRef);
    }
  } catch (error) {
    console.error("Error deleting schedule:", error);
  }
};

// --- Chat Functions (No changes made) ---

// Function to create a conversation in Firestore for the authenticated user
export const createConversation = async (conversationTitle) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      const conversationRef = collection(
        db,
        CONVERSATIONS_COLLECTION(user.uid)
      );
      const newConversation = await addDoc(conversationRef, {
        title: conversationTitle,
        createdAt: new Date().toISOString(),
      });
      return newConversation.id;
    } else {
      throw new Error("No authenticated user found.");
    }
  } catch (error) {
    console.error("Error creating conversation:", error);
  }
};

// Function to update the title of a conversation
export const updateConversationTitle = async (conversationId, newTitle) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      const conversationRef = doc(
        db,
        CONVERSATIONS_COLLECTION(user.uid),
        conversationId
      );
      await updateDoc(conversationRef, { title: newTitle });
    }
  } catch (error) {
    console.error("Error updating conversation title:", error);
  }
};

// Function to delete a conversation
export const deleteConversation = async (conversationId) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      const conversationRef = doc(
        db,
        CONVERSATIONS_COLLECTION(user.uid),
        conversationId
      );
      await deleteDoc(conversationRef);
    }
  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
};

// Function to fetch chat histories for the authenticated user
export const fetchChatHistories = async () => {
  try {
    const user = await getCurrentUser();
    if (user) {
      const conversationRef = collection(
        db,
        CONVERSATIONS_COLLECTION(user.uid)
      );
      const conversationsSnapshot = await getDocs(conversationRef);

      // Map through each conversation and fetch messages
      const conversations = await Promise.all(
        conversationsSnapshot.docs.map(async (doc) => {
          const messagesRef = collection(
            db,
            `${CONVERSATIONS_COLLECTION(user.uid)}/${doc.id}/messages`
          );
          const messagesSnapshot = await getDocs(messagesRef);
          const messages = messagesSnapshot.docs.map((messageDoc) => ({
            id: messageDoc.id,
            ...messageDoc.data(),
          }));

          return {
            id: doc.id,
            ...doc.data(),
            messages, // Include the messages in each conversation
          };
        })
      );

      return conversations;
    } else {
      throw new Error("No authenticated user found.");
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
  }
};

// Function to save messages in a conversation
export const saveMessageInConversation = async (
  conversationId,
  userMessage,
  botResponse
) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const messageRef = collection(
        db,
        `${CONVERSATIONS_COLLECTION(user.uid)}/${conversationId}/messages`
      );
      await addDoc(messageRef, {
        userMessage,
        botResponse,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error saving message:", error);
  }
};

export const fetchMessagesForConversation = async (chatId) => {
  if (!chatId) throw new Error("Chat ID is required");

  try {
    const conversationRef = firestore().collection("conversations").doc(chatId);
    const conversationSnapshot = await conversationRef.get();

    if (conversationSnapshot.exists) {
      const { messages } = conversationSnapshot.data();
      const messagePromises = messages.map(async (messageId) => {
        const messageSnapshot = await firestore()
          .collection("messages")
          .doc(messageId)
          .get();
        return { id: messageId, ...messageSnapshot.data() };
      });
      return await Promise.all(messagePromises); // Resolves to an array of message objects
    } else {
      return []; // Return empty array if no conversation found
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};
// Exporting auth and db for other usage
export { auth, db };
