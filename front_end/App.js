import "react-native-gesture-handler";
import React, { useMemo, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { ThemeContext, useThemeMode } from "./src/theme/ThemeContext";
import { lightColors, darkColors, navigationThemes } from "./src/theme/colors";
import { AuthProvider, useAuth } from "@context/AuthContext";
import HomeScreen from "./src/screens/HomeScreen";
import ActivityScreen from "./src/screens/ActivityScreen";
import TermsScreen from "./src/screens/TermsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import DepositScreen from "./src/screens/DepositScreen";
import WithdrawScreen from "./src/screens/WithdrawScreen";
import TransferScreen from "./src/screens/TransferScreen";
import GoalsScreen from "./src/screens/GoalsScreen";
import NewGoalScreen from "./src/screens/NewGoalScreen";
import DownloadInfoScreen from "./src/screens/DownloadInfoScreen";
import SignupScreen from "./src/screens/SignupScreen";
import LoginScreen from "./src/screens/LoginScreen";
import GetStartedScreen from "./src/screens/GetStartedScreen";
import CoSignerPendingScreen from "./src/screens/CoSignerPendingScreen";
import ProfileInfoScreen from "./src/screens/ProfileInfoScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

const getTabIcon = (routeName, color, focused) => {
  const size = 22;
  switch (routeName) {
    case "Home":
      return <FontAwesome5 name="home" size={size} color={color} solid={focused} />;
    case "Activity":
      return <MaterialIcons name="bar-chart" size={size} color={color} />;
    case "Terms":
      return <MaterialIcons name="description" size={size} color={color} />;
    case "Settings":
      return <Ionicons name="settings" size={size} color={color} />;
    default:
      return null;
  }
};

const MainTabs = () => {
  const { colors } = useThemeMode();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { height: 72, paddingBottom: 12, paddingTop: 8 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtitle,
        tabBarIcon: ({ color, focused }) => getTabIcon(route.name, color, focused),
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{ title: "Activity" }}
      />
      <Tab.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: "Terms" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Tab.Navigator>
  );
};

const AuthFlow = () => {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        setIsFirstLaunch(hasLaunched === null);
      } catch (error) {
        setIsFirstLaunch(true);
      } finally {
        setIsLoading(false);
      }
    };
    checkFirstLaunch();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <AuthStack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={isFirstLaunch ? "GetStarted" : "Login"}
    >
      <AuthStack.Screen name="GetStarted" component={GetStartedScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

const AppFlow = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Main"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Deposit"
      component={DepositScreen}
      options={{ title: "Deposit Money" }}
    />
    <Stack.Screen
      name="Withdraw"
      component={WithdrawScreen}
      options={{ title: "Request Withdrawal" }}
    />
    <Stack.Screen
      name="Transfer"
      component={TransferScreen}
      options={{ title: "Send Money" }}
    />
    <Stack.Screen
      name="Goals"
      component={GoalsScreen}
      options={{ title: "My Goals" }}
    />
    <Stack.Screen
      name="NewGoal"
      component={NewGoalScreen}
      options={{ title: "Create New Goal" }}
    />
    <Stack.Screen
      name="DownloadInfo"
      component={DownloadInfoScreen}
      options={{ title: "Download AGASEKE" }}
    />
    <Stack.Screen
      name="ProfileInfo"
      component={ProfileInfoScreen}
      options={{ title: "Profile Information" }}
    />
    <Stack.Screen
      name="CoSignerPending"
      component={CoSignerPendingScreen}
      options={{ title: "Pending Approvals" }}
    />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { token, isInitializing } = useAuth();
  const { colors } = useThemeMode();

  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return token ? <AppFlow /> : <AuthFlow />;
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colors = useMemo(
    () => (isDarkMode ? darkColors : lightColors),
    [isDarkMode]
  );
  const navTheme = isDarkMode ? navigationThemes.dark : navigationThemes.light;

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}
