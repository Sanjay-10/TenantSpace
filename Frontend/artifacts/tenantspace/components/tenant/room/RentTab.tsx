import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../../constants/theme';

export function RentTab({ rentAmount }: { rentAmount: number }) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.heroCard}>
        <Text style={styles.heroSubTitle}>THIS MONTH</Text>
        <Text style={styles.heroTitle}>${rentAmount} <Text style={{ fontSize: 16, fontWeight: '400', opacity: 0.8 }}>due</Text></Text>
        
        <Pressable style={styles.payBtn}>
          <Text style={styles.payBtnText}>Pay Now</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.historyCard}>
        <View style={styles.historyRow}>
          <Text style={styles.monthText}>Last Month</Text>
          <View style={styles.statusWrap}>
            <Text style={styles.amountText}>${rentAmount}</Text>
            <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.badgeText, { color: '#065F46' }]}>Paid</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, flex: 1 },
  heroCard: { borderRadius: 18, padding: 20 },
  heroSubTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, opacity: 0.8, color: '#fff' },
  heroTitle: { fontSize: 32, fontWeight: '800', marginTop: 4, color: '#fff' },
  payBtn: { marginTop: 16, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  payBtnText: { color: Theme.colors.primary, fontWeight: '700', fontSize: 14 },
  historyCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border, padding: 16 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthText: { fontSize: 14, fontWeight: '600', color: Theme.colors.fg },
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  amountText: { fontSize: 14, fontWeight: '700', color: Theme.colors.fg },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' }
});

