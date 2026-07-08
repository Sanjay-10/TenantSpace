import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllReadReceipts } from '../../../lib/readReceipts';

import { MyRoomTab } from '../../../components/tenant/room/MyRoomTab';
import { RentTab } from '../../../components/tenant/room/RentTab';
import { DocsTab } from '../../../components/tenant/room/DocsTab';
import { UpdatesTab } from '../../../components/tenant/room/UpdatesTab';

type TabKey = 'myroom' | 'rent' | 'updates' | 'docs';

const TABS: { key: TabKey; label: string; icon?: string }[] = [
  { key: 'myroom', label: 'My Room' },
  { key: 'rent', label: 'Rent' },
  { key: 'updates', label: 'Updates' },
  { key: 'docs', label: 'Docs' },
];

export default function TenantRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabKey>('myroom');
  const [readReceipts, setReadReceipts] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      getAllReadReceipts().then(setReadReceipts);
      queryClient.invalidateQueries({ queryKey: ['tenantRoomData', id] });
    }, [id, queryClient])
  );

  const { data: roomData, isLoading, error } = useQuery({
    queryKey: ['tenantRoomData', id],
    queryFn: async () => {
      if (!id) throw new Error('No Room ID');
      
      // Fetch room, property, documents, and memberships
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          properties (
            id, name, address, landlord_id,
            announcements (*),
            chores (*),
            maintenance_requests (*),
            rooms (
              id, name,
              tenant_memberships (
                tenant_id, status,
                profiles (id, full_name, avatar_url)
              )
            )
          ),
          room_documents (*),
          tenant_memberships (
            tenant_id, status,
            profiles (id, full_name, avatar_url)
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;

      // Fetch landlord profile separately to avoid complex nesting issues
      let landlordProfile = null;
      if (data?.properties?.landlord_id) {
        const { data: lp } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.properties.landlord_id)
          .single();
        landlordProfile = lp;
      }

      // Fetch recent messages to calculate unread counts
      const { data: recentMsgs } = await supabase
        .from('chat_messages')
        .select('id, room_id, created_at, sender_id')
        .eq('property_id', data.property_id)
        .order('created_at', { ascending: false })
        .limit(50);

      return { ...data, landlordProfile, recentMsgs: recentMsgs || [] };
    },
    enabled: !!id,
  });

  const propertyId = roomData?.property_id;

  // Realtime WebSockets Subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel(`tenant-room-${id}-updates`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['tenantRoomData', id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tenant_memberships', filter: `room_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['tenantRoomData', id] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `property_id=eq.${propertyId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['tenantRoomData', id] });
      });

    if (propertyId) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'announcements', filter: `property_id=eq.${propertyId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['tenantRoomData', id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chores', filter: `property_id=eq.${propertyId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['tenantRoomData', id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_requests', filter: `property_id=eq.${propertyId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['tenantRoomData', id] });
      });
    }
    
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, propertyId, queryClient]);

  const leaveRoomMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('Not logged in');
      const { error } = await supabase
        .from('tenant_memberships')
        .update({ status: 'ended' })
        .eq('tenant_id', profile.id)
        .eq('room_id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.back();
    },
    onError: (err: any) => Alert.alert('Error leaving room', err.message)
  });

  const handleLeaveRoom = () => {
    Alert.alert(
      'End Tenancy',
      'Are you sure you want to leave this room? This will send a request to your landlord and end your access.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Tenancy', style: 'destructive', onPress: () => leaveRoomMutation.mutate() }
      ]
    );
  };

  const handleChatPress = (type: 'private' | 'group') => {
    router.push({
      pathname: `/(tenant)/room/${id}/chat`,
      params: { type }
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (error || !roomData) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={{ color: Theme.colors.danger }}>Failed to load room data.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Theme.colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const roommates = (roomData.tenant_memberships || [])
    .filter((m: any) => m.status === 'active' && m.tenant_id !== profile?.id)
    .map((m: any) => m.profiles);

  const tenantMap: Record<string, any> = {};
  
  // First, map the current room's tenants
  const activeMemberships = roomData.tenant_memberships?.filter((m: any) => m.status === 'active') || [];
  activeMemberships.forEach((m: any) => {
    if (m.profiles) {
      tenantMap[m.tenant_id] = {
        id: m.tenant_id,
        name: m.profiles.full_name || 'Tenant',
        initials: (m.profiles.full_name || 'T').substring(0, 2).toUpperCase(),
        color: '#2563EB',
      };
    }
  });

  // Second, map ALL housemates across the property (to support viewing their maintenance requests)
  const allRooms = roomData.properties?.rooms || [];
  allRooms.forEach((r: any) => {
    const rActive = r.tenant_memberships?.filter((m: any) => m.status === 'active') || [];
    rActive.forEach((m: any) => {
      if (m.profiles && !tenantMap[m.tenant_id]) {
        tenantMap[m.tenant_id] = {
          id: m.tenant_id,
          name: m.profiles.full_name || 'Tenant',
          initials: (m.profiles.full_name || 'T').substring(0, 2).toUpperCase(),
          color: '#059669', // Give housemates a different color
        };
      }
    });
  });

  return (
    <View style={styles.container}>
      {/* Status / Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{roomData.properties?.name || 'Property'}</Text>
            <Text style={styles.headerSub}>{roomData.name}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Rent Due</Text>
          </View>
        </View>
      </View>

      {/* Tab Content Area */}
      <View style={styles.content}>
        {activeTab === 'myroom' && (() => {
          const recentMsgs = roomData?.recentMsgs || [];
          
          const landlordLastReadDate = new Date(readReceipts[id as string] || '1970-01-01T00:00:00.000Z');
          const privateUnreadCount = recentMsgs.filter((m: any) => m.room_id === id && new Date(m.created_at) > landlordLastReadDate && m.sender_id !== profile?.id).length;

          const groupLastReadDate = new Date(readReceipts[propertyId as string] || '1970-01-01T00:00:00.000Z');
          const groupUnreadCount = recentMsgs.filter((m: any) => m.room_id === null && new Date(m.created_at) > groupLastReadDate && m.sender_id !== profile?.id).length;

          return (
            <MyRoomTab 
              roomData={roomData} 
              landlordProfile={roomData.landlordProfile} 
              roommates={roommates}
              onLeaveRoom={handleLeaveRoom}
              leaving={leaveRoomMutation.isPending}
              onChatPress={handleChatPress}
              privateUnreadCount={privateUnreadCount}
              groupUnreadCount={groupUnreadCount}
            />
          );
        })()}
        {activeTab === 'rent' && <RentTab rentAmount={roomData.monthly_rent} />}
        {activeTab === 'docs' && <DocsTab documents={roomData.room_documents} />}
        {activeTab === 'updates' && <UpdatesTab announcements={roomData.properties?.announcements || []} landlordName={roomData.landlordProfile?.full_name} chores={roomData.properties?.chores || []} maintenanceRequests={roomData.properties?.maintenance_requests || []} tenantId={roomData.tenant_memberships?.[0]?.tenant_id} tenantMap={tenantMap} propertyId={roomData.property_id} roomId={id as string} />}
      </View>

      {/* Custom Bottom Pill Segments */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
        <View style={styles.pillContainer}>
          {TABS.map(tab => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable 
                key={tab.key} 
                onPress={() => setActiveTab(tab.key)}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{tab.label}</Text>
                {/* Mock notification badge for Updates tab */}
                {tab.key === 'updates' && !isActive && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, backgroundColor: Theme.colors.bg, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: Theme.colors.bg },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Theme.colors.muted, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 16, color: Theme.colors.mutedFg },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.fg, letterSpacing: -0.4 },
  headerSub: { fontSize: 12, color: Theme.colors.mutedFg, marginTop: 1 },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#FEF3C7' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  
  content: { flex: 1 },
  
  bottomBar: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 10, paddingHorizontal: 12 },
  pillContainer: { flexDirection: 'row', backgroundColor: Theme.colors.muted, borderRadius: 14, padding: 4, gap: 3 },
  pillBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  pillBtnActive: { backgroundColor: '#fff', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  pillText: { fontSize: 12, fontWeight: '500', color: Theme.colors.mutedFg },
  pillTextActive: { fontWeight: '700', color: Theme.colors.primary },
  
  badge: { position: 'absolute', top: 4, right: 8, width: 14, height: 14, borderRadius: 7, backgroundColor: Theme.colors.danger, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 8, fontWeight: '700', color: '#fff' }
});
