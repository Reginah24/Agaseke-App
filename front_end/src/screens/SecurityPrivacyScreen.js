import { Text, StyleSheet, View } from "react-native";
import Screen from "@components/Screen";
import Section from "@components/Section";
import { useThemeMode } from "@theme/ThemeContext";

const SecurityPrivacyScreen = () => {
  const { colors } = useThemeMode();

  return (
    <Screen>
      <Section title="Security & Privacy">
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Account Security</Text>
          <Text style={[styles.body, { color: colors.subtitle }]}>- Password-protected account access is enabled.</Text>
          <Text style={[styles.body, { color: colors.subtitle }]}>- Co-signer approval is required for protected withdrawals.</Text>
          <Text style={[styles.body, { color: colors.subtitle }]}>- Additional security controls can be added in future builds.</Text>
        </View>
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SecurityPrivacyScreen;
