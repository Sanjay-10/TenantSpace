import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function AnnouncementsSubTab({ announcements = [], landlordName = 'Landlord' }: { announcements?: any[], landlordName?: string }) {
  if (!announcements || announcements.length === 0) {
    return (
      <View style={styles.mockCard}>
        <Text style={styles.mockTitle}>No Announcements</Text>
        <Text style={styles.mockSub}>You are all caught up!</Text>
      </View>
    );
  }

  const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <View style={{ gap: 12 }}>
      {sortedAnnouncements.map((ann) => {
        const isExpired = new Date(ann.expires_at) < new Date();
        const daysLeft = Math.ceil((new Date(ann.expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        const badgeText = isExpired ? 'Expired' : `${daysLeft} days left`;
        
        const createdDate = new Date(ann.created_at);
        const isToday = createdDate.toDateString() === new Date().toDateString();
        const dateDisplay = isToday 
          ? `Today, ${createdDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
          : createdDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        
        return (
          <View key={ann.id} style={[styles.annCard, !isExpired ? styles.annCardActive : styles.annCardExpired]}>
            <View style={styles.headerRow}>
              <View style={[styles.iconWrap, isExpired && { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="megaphone-outline" size={18} color={isExpired ? Theme.colors.mutedFg : '#DC2626'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.landlordName, isExpired && { color: Theme.colors.mutedFg }]}>{landlordName}</Text>
                <Text style={styles.dateText}>{dateDisplay}</Text>
              </View>
              <View style={[styles.badge, isExpired ? styles.badgeExpired : styles.badgeActive]}>
                <Text style={[styles.badgeText, isExpired ? styles.badgeTextExpired : styles.badgeTextActive]}>
                  {badgeText}
                </Text>
              </View>
            </View>

            <Text style={[styles.annTitle, isExpired && { color: Theme.colors.mutedFg }]}>{ann.title}</Text>
            <Text style={[styles.annBody, isExpired && { opacity: 0.7 }]}>{ann.body}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  annCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Theme.colors.border },
  annCardExpired: { backgroundColor: '#F8FAFC' },
  
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  landlordName: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  dateText: { fontSize: 11, color: Theme.colors.mutedFg, marginTop: 2 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 2 },
  badgeActive: { backgroundColor: '#ECFDF5' },
  badgeExpired: { backgroundColor: '#F1F5F9' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextActive: { color: '#065F46' },
  badgeTextExpired: { color: '#475569' },
  
  annTitle: { fontSize: 15, fontWeight: '700', color: Theme.colors.fg, marginBottom: 6 },
  annBody: { fontSize: 13, color: Theme.colors.mutedFg, lineHeight: 20 },
  
  mockCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  mockTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.fg, marginBottom: 8 },
  mockSub: { fontSize: 13, color: Theme.colors.mutedFg, textAlign: 'center', lineHeight: 20 },
});
