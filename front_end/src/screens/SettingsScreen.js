import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import Screen from "@components/Screen";
import Section from "@components/Section";
import { useNavigation } from "@react-navigation/native";
import { useThemeMode } from "@theme/ThemeContext";
import { useAuth } from "@context/AuthContext";

const getSettingIcon = (iconName) => {
  const size = 24;
  switch (iconName) {
    case "profile":
      return <FontAwesome5 name="user" size={size} color="#1565C0" />;
    case "security":
      return <FontAwesome5 name="shield-alt" size={size} color="#1565C0" />;
    case "download":
      return <MaterialIcons name="download" size={size} color="#1565C0" />;
    case "support":
      return <MaterialIcons name="phone" size={size} color="#1565C0" />;
    case "terms":
      return <MaterialIcons name="description" size={size} color="#1565C0" />;
    case "logout":
      return <MaterialIcons name="exit-to-app" size={size} color="#d84315" />;
    default:
      return null;
  }
};

const settings = [
  {
    title: "Account Settings",
    rows: [
      {
        label: "Profile Information",
        hint: "Update personal details",
        icon: "profile",
        action: "ProfileInfo",
      },
      {
        label: "Security & Privacy",
        hint: "Manage approver, PIN",
        icon: "security",
        action: null,
      },
    ],
  },
  {
    title: "App & Downloads",
    rows: [
      {
        label: "Download AGASEKE App",
        hint: "Regional pricing & links",
        icon: "download",
        action: "DownloadInfo",
      },
    ],
  },
  {
    title: "Support",
    rows: [
      {
        label: "Customer Support",
        hint: "+250 786 739 043",
        icon: "support",
        action: "contact",
      },
      {
        label: "Terms & Conditions",
        hint: "Read our policy",
        icon: "terms",
        action: "Terms",
      },
    ],
  },
];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode, toggleTheme } = useThemeMode();
  const { logout } = useAuth();

  const handleAction = (action) => {
    if (!action) {
      Alert.alert(
        "Coming Soon",
        "This action will be available in the next build."
      );
      return;
    }
    if (action === "contact") {
      Alert.alert(
        "Customer Support",
        "Call +250 786 739 043 or email anthonyregina48@gmail.com"
      );
      return;
    }
    navigation.navigate(action);
  };

  return (
    <Screen>
      <Section title="Theme">
        <Pressable
          onPress={toggleTheme}
          style={[
            styles.row,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View>
            <Text style={[styles.label, { color: colors.text }]}>
              Dark Mode
            </Text>
            <Text style={[styles.hint, { color: colors.subtitle }]}>
              {isDarkMode ? "Enabled" : "Disabled"}
            </Text>
          </View>
          {isDarkMode ? (
            <Ionicons name="moon" size={20} color={colors.text} />
          ) : (
            <Ionicons name="sunny" size={20} color={colors.text} />
          )}
        </Pressable>
      </Section>

      {settings.map((section) => (
        <Section key={section.title} title={section.title}>
          <View style={{ gap: 12 }}>
            {section.rows.map((row) => (
              <Pressable
                key={row.label}
                onPress={() => handleAction(row.action)}
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.rowLeft}>
                  {getSettingIcon(row.icon)}
                  <View>
                    <Text style={[styles.label, { color: colors.text }]}>
                      {row.label}
                    </Text>
                    <Text style={[styles.hint, { color: colors.subtitle }]}>
                      {row.hint}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: colors.subtitle }}>›</Text>
              </Pressable>
            ))}
          </View>
        </Section>
      ))}

      <Section title="Account">
        <Pressable
          onPress={() =>
            Alert.alert("Logout", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Logout", style: "destructive", onPress: logout },
            ])
          }
          style={[
            styles.row,
            { backgroundColor: "#fff5f5", borderColor: "#ffd5d5" },
          ]}
        >
          <View style={styles.rowLeft}>
            {getSettingIcon("logout")}
            <View>
              <Text style={[styles.label, { color: "#d84315" }]}>Logout</Text>
              <Text style={[styles.hint, { color: "#d84315" }]}>
                Sign out of your account
              </Text>
            </View>
          </View>
          <Text style={{ color: "#d84315" }}>›</Text>
        </Pressable>
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  label: {
    fontWeight: "600",
    fontSize: 15,
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default SettingsScreen;
