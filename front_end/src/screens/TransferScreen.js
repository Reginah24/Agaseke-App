import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable } from 'react-native';
import Screen from '@components/Screen';
import Section from '@components/Section';
import NumberPad from '@components/NumberPad';
import PaymentMethodPicker from '@components/PaymentMethodPicker';
import { paymentMethods, feeTiers } from '@data/mockData';
import { useThemeMode } from '@theme/ThemeContext';

const TransferScreen = () => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(paymentMethods[0].id);
  const [recipient, setRecipient] = useState('');
  const { colors } = useThemeMode();

  const summary = useMemo(() => {
    const value = parseFloat(amount.replace(/,/g, '')) || 0;
    const tier = feeTiers.find(t => value <= t.max) || feeTiers[feeTiers.length - 1];
    const fee = value === 0 ? 0 : tier.fee;
    return { value, fee, total: value + fee };
  }, [amount]);

  const formattedAmount = useMemo(() => {
    if (!amount) {
      return '0';
    }

    const [whole, decimal] = amount.split('.');
    const formattedWhole = Number((whole || '0').replace(/,/g, '')).toLocaleString();
    return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
  }, [amount]);

  const handleSubmit = () => {
    if (!recipient.trim()) {
      Alert.alert('Recipient Required', 'Add a phone number to continue.');
      return;
    }
    if (!amount) {
      Alert.alert('Amount Required', 'Enter an amount to send.');
      return;
    }
    Alert.alert(
      'Transfer Sent',
      `Sending ${summary.value.toLocaleString()} RWF (+${summary.fee.toLocaleString()} RWF fee) to ${recipient}.`
    );
  };

  return (
    <Screen>
      <Section title="Recipient">
        <TextInput
          placeholder="078XXXXXXX or +250XXXXXXXXX"
          placeholderTextColor={colors.subtitle}
          value={recipient}
          onChangeText={setRecipient}
          keyboardType="phone-pad"
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
          ]}
        />
      </Section>

      <Section title="Transfer Amount">
        <View style={[styles.amountCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.amountValue, { color: colors.text }]}>{formattedAmount} RWF</Text>
        </View>
      </Section>

      <Section title="Enter Amount">
        <NumberPad value={amount} onChange={setAmount} />
      </Section>

      <Section title="Transfer Fee">
        <View style={[styles.summaryCard, { backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }]}>
          <SummaryRow label="Transfer Amount" value={`${summary.value.toLocaleString()} RWF`} />
          <SummaryRow label="Transfer Fee" value={`${summary.fee.toLocaleString()} RWF`} />
          <SummaryRow label="Total to Deduct" value={`${summary.total.toLocaleString()} RWF`} bold />
          <Text style={styles.feeNote}>
            Up to 1,000 = FREE • 1,001-5,000 = 50 RWF • 5,001-15,000 = 100 RWF • 15,001-50,000 = 200 RWF • 50,001-200,000 = 400 RWF • Above 200,000 = 600 RWF
          </Text>
        </View>
      </Section>

      <Section title="Method">
        <PaymentMethodPicker methods={paymentMethods} selected={method} onSelect={setMethod} />
      </Section>

      <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
        <Text style={styles.primaryBtnText}>Send Money</Text>
      </Pressable>
    </Screen>
  );
};

const SummaryRow = ({ label, value, bold }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={[styles.summaryValue, { fontWeight: bold ? '700' : '500' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  input: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 16
  },
  amountCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700'
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    color: '#856404',
    fontSize: 13
  },
  summaryValue: {
    color: '#856404'
  },
  feeNote: {
    marginTop: 8,
    color: '#856404',
    fontSize: 11
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16
  }
});

export default TransferScreen;

