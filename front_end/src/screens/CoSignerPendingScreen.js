import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import Screen from '@components/Screen';
import Section from '@components/Section';
import api, { handleApiError } from '@services/api';
import { useThemeMode } from '@theme/ThemeContext';

const CoSignerPendingScreen = () => {
  const [myPending, setMyPending] = useState([]);
  const [toApprove, setToApprove] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useThemeMode();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ownRes, coRes] = await Promise.allSettled([
        api.get('/withdrawal'),
        api.get('/withdrawal/pending'),
      ]);
      if (ownRes.status === 'fulfilled') {
        setMyPending((ownRes.value.data || []).filter(w => w.status === 'pending'));
      }
      if (coRes.status === 'fulfilled') {
        setToApprove(coRes.value.data || []);
      }
    } catch (err) {
      Alert.alert('Error', handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAction = (id, action) => {
    api.post(`/withdrawal/approve/${id}`, { status: action })
      .then(() => {
        Alert.alert('Success', `Withdrawal ${action}`);
        fetchAll();
      })
      .catch(err => Alert.alert('Error', handleApiError(err)));
  };

  const statusColor = (status) => {
    if (status === 'approved') return '#2ecc71';
    if (status === 'rejected') return '#e74c3c';
    return '#856404';
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Section title="My Pending Requests">
        {myPending.length === 0 ? (
          <Text style={[styles.empty, { color: colors.subtitle }]}>You have no pending withdrawal requests.</Text>
        ) : (
          myPending.map(item => (
            <View key={item._id} style={[styles.card, { backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }]}>
              <Text style={[styles.amount, { color: '#856404' }]}>{Number(item.amount).toLocaleString()} RWF</Text>
              <Text style={[styles.meta, { color: '#856404' }]}>
                Status: <Text style={{ fontWeight: '700', color: statusColor(item.status) }}>{item.status.toUpperCase()}</Text>
              </Text>
              <Text style={[styles.meta, { color: '#856404' }]}>
                Submitted: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </Section>

      <Section title="Requests to Approve (Co-Signer)">
        {toApprove.length === 0 ? (
          <Text style={[styles.empty, { color: colors.subtitle }]}>No requests waiting for your approval.</Text>
        ) : (
          <FlatList
            data={toApprove}
            keyExtractor={(i) => i._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.amount, { color: colors.text }]}>{Number(item.amount).toLocaleString()} RWF</Text>
                <Text style={[styles.meta, { color: colors.subtitle }]}>
                  From: {item.userId?.name || item.userId?.email || 'Unknown'}
                </Text>
                <Text style={[styles.meta, { color: colors.subtitle }]}>
                  Date: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.actions}>
                  <Pressable style={[styles.btn, styles.approve]} onPress={() => handleAction(item._id, 'approved')}>
                    <Text style={styles.btnText}>Approve</Text>
                  </Pressable>
                  <Pressable style={[styles.btn, styles.reject]} onPress={() => handleAction(item._id, 'rejected')}>
                    <Text style={styles.btnText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  amount: { fontSize: 18, fontWeight: '700' },
  meta: { marginTop: 6, fontSize: 13 },
  actions: { flexDirection: 'row', marginTop: 12 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
  approve: { backgroundColor: '#2ecc71' },
  reject: { backgroundColor: '#e74c3c' },
  btnText: { color: '#fff', fontWeight: '700' },
  empty: { fontSize: 14, paddingVertical: 8 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
});

export default CoSignerPendingScreen;
