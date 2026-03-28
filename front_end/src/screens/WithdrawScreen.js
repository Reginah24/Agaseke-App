import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Screen from "@components/Screen";
import Section from "@components/Section";
import NumberPad from "@components/NumberPad";
import PaymentMethodPicker from "@components/PaymentMethodPicker";
import { paymentMethods } from "@data/mockData";
import { useThemeMode } from "@theme/ThemeContext";
import api, { handleApiError } from "@services/api";

const WithdrawScreen = () => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState(paymentMethods[0].id);
  const { colors } = useThemeMode();
  const navigation = useNavigation();
  const route = useRoute();
  const onSuccess = route.params?.onSuccess;

  // FIX 6: summary now uses the raw value for display only.
  // The backend receives the raw amount and handles deduction itself.
  // The 2% fee display is kept for transparency but is informational.
  const summary = useMemo(() => {
    const value = parseFloat(amount.replace(/,/g, "")) || 0;
    const fee = value * 0.02;
    const net = Math.max(value - fee, 0);
    return { value, fee, net };
  }, [amount]);

  const formattedAmount = useMemo(() => {
    if (!amount) return "0";
    const [whole, decimal] = amount.split(".");
    const formattedWhole = Number((whole || "0").replace(/,/g, "")).toLocaleString();
    return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
  }, [amount]);

  const handleSubmit = () => {
    if (!summary.value) {
      Alert.alert("Amount Required", "Please enter an amount to withdraw.");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Reason Required", "Tell us why you are withdrawing.");
      return;
    }

    // FIX 3: send reason to the backend so co-signer can see it
    // FIX 6: send summary.value (raw amount) — backend handles the deduction
    api
      .post("/withdrawal/request", { amount: summary.value, reason: reason.trim() })
      .then(() => {
        Alert.alert(
          "Withdrawal Requested",
          "An approver will review your request shortly.",
          [
            {
              text: "OK",
              onPress: () => {
                onSuccess?.();
                navigation.goBack();
              },
            },
          ]
        );
      })
      .catch((error) => Alert.alert("Request Failed", handleApiError(error)));
  };

  return (
    <Screen>
      <View
        style={[
          styles.notice,
          { backgroundColor: "#fff3cd", borderColor: "#ffeaa7" },
        ]}
      >
        <Text style={styles.noticeTitle}>Withdrawal Protection Active</Text>
        <Text style={styles.noticeText}>
          All withdrawal requests require approval from your designated approver
          to keep your savings safe.
        </Text>
      </View>

      <Section title="Withdrawal Amount">
        <View
          style={[
            styles.amountCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.amountValue, { color: colors.text }]}>
            {formattedAmount} RWF
          </Text>
          <Text style={{ color: colors.subtitle }}>2% service fee applies</Text>
        </View>
      </Section>

      <Section title="Enter Amount">
        <NumberPad value={amount} onChange={setAmount} />
      </Section>

      <Section title="Reason">
        <TextInput
          placeholder="e.g., Emergency, School fees"
          placeholderTextColor={colors.subtitle}
          value={reason}
          onChangeText={setReason}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
      </Section>

      <Section title="Destination">
        <PaymentMethodPicker
          methods={paymentMethods}
          selected={method}
          onSelect={setMethod}
        />
      </Section>

      <Section title="Summary">
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <SummaryRow
            label="Withdrawal Amount"
            value={`${summary.value.toLocaleString()} RWF`}
          />
          <SummaryRow
            label="Service Fee (2%)"
            value={`${Math.round(summary.fee).toLocaleString()} RWF`}
          />
          <SummaryRow
            label="You'll Receive"
            value={`${Math.round(summary.net).toLocaleString()} RWF`}
            bold
          />
        </View>
      </Section>

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
      >
        <Text style={styles.primaryBtnText}>Submit Withdrawal Request</Text>
      </Pressable>
    </Screen>
  );
};

const SummaryRow = ({ label, value, bold }) => {
  const { colors } = useThemeMode();
  return (
    <View style={styles.summaryRow}>
      <Text style={{ color: colors.subtitle }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: bold ? "700" : "500" }}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  notice: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  noticeTitle: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#856404",
  },
  noticeText: {
    color: "#856404",
    fontSize: 13,
  },
  amountCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default WithdrawScreen;