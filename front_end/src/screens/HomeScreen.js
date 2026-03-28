import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Screen from "@components/Screen";
import BalanceCard from "@components/BalanceCard";
import QuickActions from "@components/QuickActions";
import Section from "@components/Section";
import { useThemeMode } from "@theme/ThemeContext";
import api, { handleApiError } from "@services/api";
import { useAuth } from "@context/AuthContext";

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} RWF`;

const HomeScreen = () => {
  const navigation = useNavigation();
  const { colors, toggleTheme, isDarkMode } = useThemeMode();
  const { user } = useAuth();
  const [savings, setSavings] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  // FIX 8: track co-signer pending requests so the button is only shown when relevant
  const [toApprove, setToApprove] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [savingsRes, withdrawalsRes, coSignerRes] = await Promise.allSettled([
        api.get("/saving"),
        api.get("/withdrawal"),
        api.get("/withdrawal/pending"),
      ]);
      if (savingsRes.status === "fulfilled") setSavings(savingsRes.value.data || []);
      if (withdrawalsRes.status === "fulfilled") setWithdrawals(withdrawalsRes.value.data || []);
      // co-signer endpoint returns [] for non-co-signers — safe to use directly
      if (coSignerRes.status === "fulfilled") setToApprove(coSignerRes.value.data || []);
    } catch (error) {
      Alert.alert("Error", handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const totalBalance = savings.reduce(
    (sum, saving) => sum + (saving.currentAmount || 0),
    0
  );
  const pending = withdrawals.filter((item) => item.status === "pending");
  // FIX 5: previously summed 2% of approved withdrawals which made profit go up
  // the more money was withdrawn - backwards. Now shows % progress toward goal target.
  const progressTowardTarget = primarySaving
    ? Math.min(
        ((primarySaving.currentAmount || 0) / (primarySaving.targetAmount || 1)) * 100,
        100
      ).toFixed(1)
    : 0;
  const primarySaving = savings[0];

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={[styles.logoLabel, { color: colors.primary }]}>
            AGASEKE
          </Text>
        </View>
        <Pressable
          onPress={toggleTheme}
          style={[styles.themeToggle, { borderColor: colors.border }]}
        >
          {isDarkMode ? (
            <Ionicons name="moon" size={20} color={colors.text} />
          ) : (
            <Ionicons name="sunny" size={20} color={colors.text} />
          )}
        </Pressable>
      </View>

      <View style={styles.greetingBlock}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Hello, {user?.name || "Saver"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtitle }]}>
          Your digital piggy bank is secure
        </Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <BalanceCard
            label={
              primarySaving?.goalName
                ? `Goal: ${primarySaving.goalName}`
                : "Total Savings Balance"
            }
            amount={totalBalance}
            growth={`Target ${primarySaving?.targetAmount?.toLocaleString?.() || "N/A"} RWF`}
            onPress={() => navigation.navigate("Activity")}
          />

          {/* FIX 5: replaced misleading profit card with goal progress */}
          <Section title="Goal Progress">
            <View
              style={[
                styles.profitCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View>
                <Text style={[styles.profitAmount, { color: colors.text }]}>
                  {progressTowardTarget}%
                </Text>
                <Text style={[styles.profitLabel, { color: colors.subtitle }]}>
                  of target reached ({formatCurrency(primarySaving?.currentAmount || 0)} saved)
                </Text>
              </View>
              <MaterialIcons name="trending-up" size={32} color={colors.subtitle} />
            </View>
          </Section>

          {pending.length > 0 && (
            <Section title="Pending Withdrawal Requests">
              <View
                style={[
                  styles.pendingCard,
                  { backgroundColor: "#fff3cd", borderColor: "#ffeaa7" },
                ]}
              >
                {pending.map((req) => (
                  <View key={req._id} style={styles.pendingItem}>
                    <View>
                      <Text style={styles.pendingTitle}>
                        {req.amount.toLocaleString()} RWF
                      </Text>
                      <Text style={styles.pendingSubtitle}>
                        Awaiting approval
                      </Text>
                    </View>
                    <Text style={styles.pendingAmount}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          <Section title="Quick Actions">
            <QuickActions
              onDeposit={() =>
                navigation.navigate("Deposit", { onSuccess: fetchData })
              }
              onWithdraw={() =>
                navigation.navigate("Withdraw", { onSuccess: fetchData })
              }
              onTransfer={() => navigation.navigate("Transfer")}
              onGoals={() => navigation.navigate("Goals")}
            />
            {/* FIX 8: only show Pending Approvals if this user is listed as a co-signer
                for someone — checked by seeing if any pending items exist in toApprove */}
            {toApprove.length > 0 && (
              <Pressable
                onPress={() => navigation.navigate('CoSignerPending')}
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>
                  Pending Approvals ({toApprove.length})
                </Text>
              </Pressable>
            )}
          </Section>
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginBottom: 16,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1565C0",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
  },
  logoLabel: {
    fontWeight: "700",
    fontSize: 18,
  },
  themeToggle: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  greetingBlock: {
    marginBottom: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },
  profitCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profitAmount: {
    fontSize: 24,
    fontWeight: "700",
  },
  profitLabel: {
    marginTop: 6,
    fontSize: 13,
  },
  profitIcon: {
    fontSize: 32,
  },
  pendingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  pendingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingTitle: {
    fontWeight: "700",
    color: "#856404",
  },
  pendingSubtitle: {
    color: "#856404",
    fontSize: 12,
  },
  pendingAmount: {
    fontWeight: "700",
    color: "#856404",
  },
  loader: {
    paddingVertical: 60,
    alignItems: "center",
  },
});

export default HomeScreen;