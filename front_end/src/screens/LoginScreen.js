import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import Screen from "@components/Screen";
import { useThemeMode } from "@theme/ThemeContext";
import { useAuth } from "@context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { colors } = useThemeMode();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Missing information", "Please enter email and password.");
      return;
    }
    if (!isValidEmail(form.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (!result.success) {
      Alert.alert("Login failed", result.message || "Check your credentials.");
    }
  };

  return (
    <Screen scrollable={false} contentStyle={styles.screenContent}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={[styles.appName, { color: colors.primary }]}>AGASEKE</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.subtitle }]}>
              Sign in to access your Agaseke savings.
            </Text>
          </View>
          <View style={styles.formSection}>
        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.subtitle}
            value={form.email}
            onChangeText={(value) => handleChange("email", value)}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.subtitle}
            value={form.password}
            onChangeText={(value) => handleChange("password", value)}
            secureTextEntry
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
        </View>
          </View>

          <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.primaryText}>
          {loading ? "Signing in..." : "Sign In"}
        </Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Signup")}>
        <Text style={[styles.link, { color: colors.primary }]}>
          Don't have an account? Create one
        </Text>
      </Pressable>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  formContainer: {
    width: "100%",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  formSection: {
    marginBottom: 24,
  },
  form: {
    marginTop: 16,
    gap: 16,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    marginTop: 16,
    fontWeight: "600",
  },
});

export default LoginScreen;
