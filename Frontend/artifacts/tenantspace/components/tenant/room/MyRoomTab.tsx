import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AvatarCluster } from '../../ui/AvatarCluster';
import { useAuth } from '../../../contexts/AuthContext';

interface MyRoomTabProps {
  roomData: any;
  landlordProfile: any;
  roommates: any[];
  onLeaveRoom: () => void;
  leaving: boolean;
  onChatPress: (type: 'private' | 'group') => void;
  privateUnreadCount?: number;
  groupUnreadCount?: number;
}

import { UpdatesTab } from '../../../components/tenant/room/UpdatesTab';

const formatDisplayDate = (dateVal: string | Date | null | undefined) => {
  if (!dateVal) return 'Not set';
  if (dateVal === 'Month-to-Month') return 'Month-to-Month';
  
  let d: Date;
  if (typeof dateVal === 'string') {
    const parts = dateVal.split('T')[0].split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      d = new Date(dateVal);
    }
  } else {
    d = dateVal;
  }
  
  if (isNaN(d.getTime())) return String(dateVal);
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export function MyRoomTab({ roomData, landlordProfile, roommates, onLeaveRoom, leaving, onChatPress, privateUnreadCount = 0, groupUnreadCount = 0 }: MyRoomTabProps) {
  const { profile } = useAuth();
  const prop = roomData?.properties;
  
  // Convert additional_details back to simple map for display
  const customDetails = roomData?.additional_details || [];

  const allPropertyTenants: any[] = [];
  if (prop?.rooms) {
    prop.rooms.forEach((r: any) => {
      const active = r.tenant_memberships?.filter((m: any) => m.status === 'active') || [];
      active.forEach((m: any) => {
        if (m.profiles && m.profiles.id !== profile?.id) {
          allPropertyTenants.push(m.profiles);
        }
      });
    });
  }

  // Include the landlord in the group chat avatar stack
  if (landlordProfile) {
    allPropertyTenants.unshift({
      ...landlordProfile,
      id: landlordProfile.id
    });
  }

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
        <Pressable style={styles.chatCard} onPress={() => onChatPress('private')}>
          <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <AvatarCluster tenants={[{ full_name: landlordProfile?.full_name || 'Landlord', id: landlordProfile?.id || 'landlord' }]} size={44} fallbackInitials="L" fallbackColor="#EFF6FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{landlordProfile?.full_name || 'Landlord'}</Text>
            <Text style={[styles.chatSub, privateUnreadCount > 0 && styles.chatSubUnread]} numberOfLines={1}>
              {privateUnreadCount > 0 ? `${privateUnreadCount} new message${privateUnreadCount !== 1 ? 's' : ''}` : 'Your Landlord · Tap to message'}
            </Text>
          </View>
          {privateUnreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{privateUnreadCount}</Text>
            </View>
          ) : (
            <Text style={styles.chevron}>›</Text>
          )}
        </Pressable>

        {/* Group Chat */}
        <Pressable style={[styles.chatCard, { marginTop: 8 }]} onPress={() => onChatPress('group')}>
          <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <AvatarCluster tenants={allPropertyTenants} size={44} fallbackInitials="ALL" fallbackColor="#EFF6FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{prop?.name} · All Tenants</Text>
            <Text style={[styles.chatSub, groupUnreadCount > 0 && styles.chatSubUnread]} numberOfLines={1}>
              {groupUnreadCount > 0 ? `${groupUnreadCount} new message${groupUnreadCount !== 1 ? 's' : ''}` : 'Property group chat'}
            </Text>
          </View>
          {groupUnreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{groupUnreadCount}</Text>
            </View>
          ) : (
            <Text style={styles.chevron}>›</Text>
          )}
        </Pressable>
      </View>

      {/* ROOM DETAILS */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Room Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Lease start</Text>
          <Text style={styles.detailValue}>{formatDisplayDate(roomData?.created_at)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Lease end</Text>
          <Text style={styles.detailValue}>{formatDisplayDate(roomData?.lease_end)}</Text>
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
          {leaving ? <ActivityIndicator size="small" color="#DC2626" /> : (
            <>
              <Ionicons name="exit-outline" size={18} color="#DC2626" />
              <Text style={styles.dangerBtnText}>End Tenancy</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.dangerHint}>Sends a move-out request to your landlord</Text>
      </View>
      
      <View style={{ height: 20 }} />
    
    <View style={{ height: 80 }} />
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
  chatSubUnread: { color: '#2563EB', fontWeight: '600' },
  chevron: { fontSize: 18, color: Theme.colors.mutedFg },
  
  unreadBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  unreadBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  
  detailsCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border, padding: 16 },
  detailsTitle: { fontSize: 12, fontWeight: '700', color: Theme.colors.fg, marginBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: Theme.colors.border, marginTop: 8 },
  detailLabel: { fontSize: 12, color: Theme.colors.mutedFg },
  detailValue: { fontSize: 12, fontWeight: '600', color: Theme.colors.fg },
  
  dangerZone: { marginTop: 8 },
  dangerBtn: { width: '100%', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dangerBtnText: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  dangerHint: { fontSize: 11, color: Theme.colors.mutedFg, textAlign: 'center', marginTop: 8 }
});


