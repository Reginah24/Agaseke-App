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

const SignupScreen = ({ navigation }) => {
  const { colors } = useThemeMode();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    coSignerEmail: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.coSignerEmail.trim()) {
      Alert.alert("Incomplete", "All fields are required.");
      return;
    }
    if (!isValidEmail(form.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!isValidEmail(form.coSignerEmail)) {
      Alert.alert("Invalid Co-signer Email", "Please enter a valid co-signer email address.");
      return;
    }
    if (form.email.trim().toLowerCase() === form.coSignerEmail.trim().toLowerCase()) {
      Alert.alert("Invalid Co-signer", "Co-signer email must be different from your own email.");
      return;
    }
    if (form.password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (!result.success) {
      Alert.alert("Registration failed", result.message);
      return;
    }
    Alert.alert("Success", "Account created. Please sign in.", [
      { text: "OK", onPress: () => navigation.navigate("Login") },
    ]);
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text,
  };

  return (
    <Screen scrollable={false} contentStyle={styles.screenContent}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={[styles.appName, { color: colors.primary }]}>AGASEKE</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          </View>
          <View style={styles.formSection}>
            <View style={{ gap: 16 }}>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor={colors.subtitle}
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
            style={[styles.input, inputStyle]}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.subtitle}
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
            style={[styles.input, inputStyle]}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.subtitle}
            secureTextEntry
            value={form.password}
            onChangeText={(text) => handleChange("password", text)}
            style={[styles.input, inputStyle]}
          />
          <TextInput
            placeholder="Co-signer Email"
            placeholderTextColor={colors.subtitle}
            keyboardType="email-address"
            value={form.coSignerEmail}
            onChangeText={(text) => handleChange("coSignerEmail", text)}
            style={[styles.input, inputStyle]}
          />
        </View>
          </View>

          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? "Creating..." : "Create Account"}
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.link, { color: colors.primary }]}>
              Already have an account? Sign in
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
  formSection: {
    marginBottom: 24,
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
  primaryBtnText: {
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

export default SignupScreen;
