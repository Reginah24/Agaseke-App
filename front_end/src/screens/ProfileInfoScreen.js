import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import Screen from "@components/Screen";
import Section from "@components/Section";
import { useThemeMode } from "@theme/ThemeContext";
import { useAuth } from "@context/AuthContext";

const ProfileInfoScreen = () => {
  const { colors } = useThemeMode();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    const data = await refreshProfile();
    setLoading(false);

    if (!data) {
      Alert.alert("Profile", "Unable to refresh profile information.");
    }
  };

  return (
    <Screen>
      <Section title="Profile Information">
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.subtitle }]}>Full Name</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.name || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.subtitle }]}>Email</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.email || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.subtitle }]}>Co-signer Email</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.coSignerEmail || "-"}</Text>
          </View>
        </View>
      </Section>

      <Pressable
        onPress={handleRefresh}
        disabled={loading}
        style={[styles.refreshBtn, { backgroundColor: colors.primary }]}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.refreshText}>Refresh Profile</Text>
        )}
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  row: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  refreshBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  refreshText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default ProfileInfoScreen;
