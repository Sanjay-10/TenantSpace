import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../../constants/theme';

interface MyRoomTabProps {
  roomData: any;
  landlordProfile: any;
  roommates: any[];
  onLeaveRoom: () => void;
  leaving: boolean;
}

export function MyRoomTab({ roomData, landlordProfile, roommates, onLeaveRoom, leaving }: MyRoomTabProps) {
  const prop = roomData?.properties;
  
  // Convert additional_details back to simple map for display
  const customDetails = roomData?.additional_details || [];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.heroCard}>
        <Text style={styles.heroSubTitle}>YOUR ROOM</Text>
        <Text style={styles.heroTitle}>{roomData?.name}</Text>
        <Text style={styles.heroAddress}>{prop?.name} · Floor 1</Text>
        
        <View style={styles.heroStats}>
          <View>
            <Text style={styles.statLabel}>Monthly Rent</Text>
            <Text style={styles.statValue}>${roomData?.monthly_rent}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={[styles.statValue, { color: '#FCD34D' }]}>Active</Text>
          </View>
        </View>
      </LinearGradient>

      {/* CHATS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CHATS</Text>
        
        {/* Landlord Chat */}
        <Pressable style={styles.chatCard}>
          <View style={[styles.avatarWrap, { backgroundColor: Theme.colors.accent }]}>
            <Text style={{ fontSize: 20 }}>🏠</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{landlordProfile?.full_name || 'Landlord'}</Text>
            <Text style={styles.chatSub} numberOfLines={1}>Your Landlord · Tap to message</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        {/* Group Chat */}
        <Pressable style={[styles.chatCard, { marginTop: 8 }]}>
          <View style={styles.groupAvatarWrap}>
            <View style={[styles.miniAvatar, { backgroundColor: '#EFF6FF', left: 0, zIndex: 3 }]}><Text style={styles.miniText}>JL</Text></View>
            <View style={[styles.miniAvatar, { backgroundColor: '#FEF3C7', left: 10, top: 6, zIndex: 2 }]}><Text style={[styles.miniText, { color: '#92400E' }]}>PP</Text></View>
            <View style={[styles.miniAvatar, { backgroundColor: '#F0FDF4', left: 20, zIndex: 1 }]}><Text style={[styles.miniText, { color: '#065F46' }]}>TC</Text></View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{prop?.name} · All Tenants</Text>
            <Text style={styles.chatSub} numberOfLines={1}>Group chat coming soon...</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      {/* ROOM DETAILS */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Room Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Lease end</Text>
          <Text style={styles.detailValue}>{roomData?.lease_end || 'Not set'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Deposit</Text>
          <Text style={styles.detailValue}>${roomData?.deposit_amount || 0}</Text>
        </View>
        
        {customDetails.map((d: any) => (
          <View key={d.id} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{d.label}</Text>
            <Text style={styles.detailValue}>{d.value}</Text>
          </View>
        ))}
      </View>

      {/* END TENANCY */}
      <View style={styles.dangerZone}>
        <Pressable style={styles.dangerBtn} onPress={onLeaveRoom} disabled={leaving}>
          {leaving ? <ActivityIndicator size="small" color={Theme.colors.mutedFg} /> : (
            <>
              <Text style={{ fontSize: 16 }}>🚪</Text>
              <Text style={styles.dangerBtnText}>End Tenancy</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.dangerHint}>Sends a move-out request to your landlord</Text>
      </View>
      
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  heroCard: { borderRadius: 18, padding: 20, color: '#fff' },
  heroSubTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, opacity: 0.8, color: '#fff' },
  heroTitle: { fontSize: 26, fontWeight: '800', marginTop: 4, letterSpacing: -0.5, color: '#fff' },
  heroAddress: { fontSize: 13, opacity: 0.85, marginTop: 2, color: '#fff' },
  heroStats: { flexDirection: 'row', gap: 24, marginTop: 16 },
  statLabel: { fontSize: 11, opacity: 0.75, color: '#fff' },
  statValue: { fontWeight: '700', fontSize: 16, color: '#fff', marginTop: 2 },
  
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Theme.colors.mutedFg, letterSpacing: 1, paddingLeft: 4 },
  chatCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  groupAvatarWrap: { width: 44, height: 44, position: 'relative' },
  miniAvatar: { position: 'absolute', width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  miniText: { fontSize: 9, fontWeight: '800', color: Theme.colors.primary },
  chatName: { fontSize: 13, fontWeight: '700', color: Theme.colors.fg },
  chatSub: { fontSize: 11, color: Theme.colors.mutedFg, marginTop: 2 },
  chevron: { fontSize: 18, color: Theme.colors.mutedFg },
  
  detailsCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border, padding: 16 },
  detailsTitle: { fontSize: 12, fontWeight: '700', color: Theme.colors.fg, marginBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: Theme.colors.border, marginTop: 8 },
  detailLabel: { fontSize: 12, color: Theme.colors.mutedFg },
  detailValue: { fontSize: 12, fontWeight: '600', color: Theme.colors.fg },
  
  dangerZone: { marginTop: 8 },
  dangerBtn: { width: '100%', padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: Theme.colors.border, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dangerBtnText: { fontSize: 13, fontWeight: '700', color: Theme.colors.mutedFg },
  dangerHint: { fontSize: 11, color: Theme.colors.mutedFg, textAlign: 'center', marginTop: 8 }
});
