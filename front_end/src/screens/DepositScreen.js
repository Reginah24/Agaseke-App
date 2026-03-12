import { useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Screen from "@components/Screen";
import Section from "@components/Section";
import NumberPad from "@components/NumberPad";
import PaymentMethodPicker from "@components/PaymentMethodPicker";
import { paymentMethods } from "@data/mockData";
import { useThemeMode } from "@theme/ThemeContext";
import api, { handleApiError } from "@services/api";

const DepositScreen = () => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(paymentMethods[0].id);
  const { colors } = useThemeMode();
  const navigation = useNavigation();
  const route = useRoute();
  const onSuccess = route.params?.onSuccess;

  const formattedAmount = (() => {
    if (!amount) {
      return "0";
    }

    const [whole, decimal] = amount.split(".");
    const formattedWhole = Number((whole || "0").replace(/,/g, "")).toLocaleString();
    return decimal !== undefined
      ? `${formattedWhole}.${decimal}`
      : formattedWhole;
  })();

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount.replace(/,/g, ""));
    if (!numericAmount || Number.isNaN(numericAmount)) {
      Alert.alert("Amount Required", "Please enter an amount to deposit.");
      return;
    }
    api
      .post("/saving/add", { amount: numericAmount })
      .then(() => {
        Alert.alert(
          "Deposit Successful",
          `Deposited ${numericAmount.toLocaleString()} RWF via ${method}.`,
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
      .catch((error) => {
        Alert.alert("Deposit Failed", handleApiError(error));
      });
  };

  return (
    <Screen>
      <Section title="Deposit Amount">
        <View
          style={[
            styles.amountCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.amountLabel, { color: colors.subtitle }]}>
            Amount
          </Text>
          <Text style={[styles.amountValue, { color: colors.text }]}>
            {formattedAmount} RWF
          </Text>
        </View>
      </Section>

      <Section title="Enter Amount">
        <NumberPad value={amount} onChange={setAmount} />
      </Section>

      <Section title="Select Payment Source">
        <PaymentMethodPicker
          methods={paymentMethods}
          selected={method}
          onSelect={setMethod}
        />
      </Section>

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
      >
        <Text style={styles.primaryBtnText}>Confirm Deposit</Text>
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  amountCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  amountLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  amountValue: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: "700",
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

export default DepositScreen;