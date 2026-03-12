import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Pressable, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Screen from '@components/Screen';
import Section from '@components/Section';
import { useThemeMode } from '@theme/ThemeContext';
import api, { handleApiError } from '@services/api';

const NewGoalScreen = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [targetDate, setTargetDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useThemeMode();
  const navigation = useNavigation();
  const route = useRoute();
  const onSuccess = route.params?.onSuccess;

  const formatAmountWithCommas = value => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    if (!digitsOnly) {
      return '';
    }
    return Number(digitsOnly).toLocaleString();
  };

  const formatDateLabel = dateValue => {
    if (!dateValue) {
      return 'Select Target Date';
    }
    return dateValue.toISOString().slice(0, 10);
  };

  const handleAmountChange = value => {
    setAmount(formatAmountWithCommas(value));
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event?.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  const handleCreate = async () => {
    const numericAmount = Number(amount.replace(/,/g, ''));

    if (!name.trim() || !amount.trim() || !targetDate) {
      Alert.alert('Missing Fields', 'Please fill out all fields to create a goal.');
      return;
    }

    if (!numericAmount || Number.isNaN(numericAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount.');
      return;
    }

    try {
      await api.post('/saving/create', {
        goalName: name,
        targetAmount: numericAmount,
        lockUntil: targetDate.toISOString()
      });
      Alert.alert('Goal Created', `${name} target set for ${numericAmount.toLocaleString()} RWF by ${formatDateLabel(targetDate)}.`, [
        {
          text: 'OK',
          onPress: () => {
            onSuccess?.();
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', handleApiError(error));
    }
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text
  };

  return (
    <Screen>
      <Section title="Create New Goal">
        <View style={{ gap: 16 }}>
          <TextInput
            placeholder="Goal Name"
            placeholderTextColor={colors.subtitle}
            value={name}
            onChangeText={setName}
            style={[styles.input, inputStyle]}
          />
          <TextInput
            placeholder="Target Amount (RWF)"
            placeholderTextColor={colors.subtitle}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            style={[styles.input, inputStyle]}
          />
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, styles.dateInput, inputStyle]}
          >
            <Text
              style={{
                color: targetDate ? colors.text : colors.subtitle,
                fontSize: 16
              }}
            >
              {formatDateLabel(targetDate)}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={targetDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {showDatePicker && Platform.OS === 'ios' && (
            <Pressable
              onPress={() => setShowDatePicker(false)}
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Done</Text>
            </Pressable>
          )}
        </View>
      </Section>

      <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleCreate}>
        <Text style={styles.primaryBtnText}>Create Savings Goal</Text>
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 16
  },
  dateInput: {
    justifyContent: 'center'
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16
  },
  secondaryBtn: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center'
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16
  },
  secondaryBtnText: {
    fontWeight: '600',
    fontSize: 15
  }
});

export default NewGoalScreen;

