import { View, Pressable, Text, StyleSheet } from "react-native";
import { useThemeMode } from "@theme/ThemeContext";

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

const NumberPad = ({ value, onChange }) => {
  const { colors } = useThemeMode();

  const formatNumericString = (input) => {
    const [integerPart, decimalPart] = input.split(".");
    const normalizedInteger = integerPart.replace(/^0+(?=\d)/, "") || "0";
    const formattedInteger = Number(normalizedInteger).toLocaleString();

    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  const handlePress = (key) => {
    const rawValue = (value || "").replace(/,/g, "");

    if (key === "⌫") {
      const nextRaw = rawValue.slice(0, -1);
      onChange(nextRaw ? formatNumericString(nextRaw) : "");
      return;
    }

    if (key === "." && rawValue.includes(".")) {
      return;
    }

    const nextRaw = `${rawValue}${key}`;
    onChange(formatNumericString(nextRaw));
  };

  return (
    <View style={styles.grid}>
      {keys.map((key) => (
        <Pressable
          key={key}
          onPress={() => handlePress(key)}
          style={[
            styles.key,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  key: {
    width: "31%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  keyText: {
    fontSize: 20,
    fontWeight: "600",
  },
});

export default NumberPad;