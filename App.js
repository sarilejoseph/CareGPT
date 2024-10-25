import React from "react";
import { AppRegistry } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import HomeScreen from "./screens/Homescreen";
import ChatScreen from "./screens/Chatscreen";
import SettingsScreen from "./screens/Settingscreen";
import ScheduleScreen from "./screens/Schedulescreen";
import ProfileScreen from "./screens/Profilescreen";
import DrawerContent from "./components/DrawerContent";
import { ThemeProvider } from "./components/ThemeContext";
import LoginScreen from "./screens/Loginscreen";
import RegisterScreen from "./screens/Registerscreen";
import ChatHistoryScreen from "./screens/ChatHistoryscreen";
import AlarmScreen from "./screens/alarmscreen";
import CalendarScreen from "./screens/calendarscreen";
import Walkthrough from "./screens/walkthrough"; // Import the Walkthrough screen
import { name as appName } from "./app.json";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Schedule") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "ChatHistory") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return (
            <Icon
              name={iconName}
              size={size}
              color={focused ? "#CF9FFF" : "gray"}
              style={{ alignSelf: "center" }}
            />
          );
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#FFFFFF",
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
        headerShown: false,
        tabBarLabel: () => null, // Remove labels
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="ChatHistory" component={ChatHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="CareGPT"
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
        overlayColor: "rgba(0, 0, 0, 0.2)",
        drawerStyle: {
          width: "60%",
          backgroundColor: "#f8f8f8",
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
        },
      }}
    >
      <Drawer.Screen name="CareGPT" component={TabNavigator} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Walkthrough" // Starts with Walkthrough
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Walkthrough" component={Walkthrough} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Alarm" component={AlarmScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

AppRegistry.registerComponent(appName, () => App);

export default App;
