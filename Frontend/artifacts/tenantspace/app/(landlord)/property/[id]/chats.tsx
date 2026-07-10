import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import { Theme } from '../../../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../../contexts/AuthContext';
import { getAllReadReceipts } from '../../../../lib/readReceipts';

export default function LandlordChatsHub() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [readReceipts, setReadReceipts] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      getAllReadReceipts().then(setReadReceipts);
      queryClient.invalidateQueries({ queryKey: ['landlordChatsHub', id] });
    }, [id, queryClient])
  );

  // Keep hub perfectly in sync while in background
  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel(`hub-updates-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `property_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['landlordChatsHub', id] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  const { data: hubData, isLoading, error } = useQuery({
    queryKey: ['landlordChatsHub', id],
    queryFn: async () => {
      if (!id) throw new Error('No Property ID');
      
      // Fetch property and rooms
      const { data: propData, error: propError } = await supabase
        .from('properties')
        .select(`
          name,
          rooms (
            id, name,
            tenant_memberships (
              status,
              profiles (id, full_name)
            )
          )
        `)
        .eq('id', id)
        .single();
        
      if (propError) throw propError;
      
      // Fetch the latest message for each room (and the property group chat)
      // This is a simplified approach. In a production app with huge chat volume, 
      // you'd use a dedicated RPC or view for latest messages.
      const { data: latestMsgs } = await supabase
        .from('chat_messages')
        .select('room_id, text, created_at, sender_id, profiles(full_name)')
        .eq('property_id', id)
        .order('created_at', { ascending: false })
        .limit(100); // Fetch recent messages to find the latest for each room
        
      return { property: propData, recentMessages: latestMsgs || [] };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (error || !hubData) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={{ color: Theme.colors.danger }}>Failed to load chats.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Theme.colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const { property, recentMessages } = hubData;
  const rooms = property.rooms || [];
  
  // Helper to find latest message for a room_id (or null for property group)
  const getLatestMessage = (roomId: string | null) => {
    return recentMessages.find(m => m.room_id === roomId);
  };
  
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHrs < 24) return `${diffHrs}h`;
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Build the list of chat items
  const chatItems = rooms.map((room: any) => {
    const activeTenants = room.tenant_memberships?.filter((m: any) => m.status === 'active') || [];
    const tenantCount = activeTenants.length;
    const initials = room.name.substring(0, 2).toUpperCase();
    
    // Pick a random vibrant color based on room id string length just for UI polish
    const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
    const color = colors[room.id.length % colors.length];
    
    const latestMsg = getLatestMessage(room.id);
    
    // Calculate unread count dynamically
    const lastReadIso = readReceipts[room.id] || '1970-01-01T00:00:00.000Z';
    const lastReadDate = new Date(lastReadIso);
    const unreadCount = recentMessages.filter(m => m.room_id === room.id && new Date(m.created_at) > lastReadDate && m.sender_id !== profile?.id).length;
    
    return {
      id: room.id,
      name: room.name,
      tenantCount,
      initials,
      color,
      latestText: latestMsg ? `${(latestMsg.profiles as any)?.full_name?.split(' ')[0]}: ${latestMsg.text}` : 'No messages yet',
      time: latestMsg ? formatTime(latestMsg.created_at) : '',
      unreadCount,
      timestamp: latestMsg ? new Date(latestMsg.created_at).getTime() : 0
    };
  }).sort((a, b) => b.timestamp - a.timestamp);
  
  const filteredItems = filter === 'unread' ? chatItems.filter(c => c.unreadCount > 0) : chatItems;
  const totalUnread = chatItems.reduce((acc, curr) => acc + curr.unreadCount, 0);

  // Group chat latest message & unread count
  const groupLatestMsg = getLatestMessage(null);
  const groupTime = groupLatestMsg ? formatTime(groupLatestMsg.created_at) : '';
  const groupPreview = groupLatestMsg ? `${(groupLatestMsg.profiles as any)?.full_name?.split(' ')[0]}: ${groupLatestMsg.text}` : 'No messages yet';
  
  const groupLastReadIso = readReceipts[id as string] || '1970-01-01T00:00:00.000Z';
  const groupLastReadDate = new Date(groupLastReadIso);
  const groupUnreadCount = recentMessages.filter(m => m.room_id === null && new Date(m.created_at) > groupLastReadDate && m.sender_id !== profile?.id).length;

  const renderItem = ({ item }: { item: typeof chatItems[0] }) => (
    <Pressable 
      style={styles.chatRow}
      onPress={() => router.push(`/(landlord)/property/${id}/chat/${item.id}`)}
    >
      <View style={[styles.avatar, { backgroundColor: item.color }]}>
        <Text style={styles.avatarText}>{item.initials}</Text>
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.roomName}>{item.name}</Text>
            <Text style={styles.tenantCount}>{item.tenantCount} tenant{item.tenantCount !== 1 && 's'}</Text>
          </View>
        </View>
        <Text style={[styles.msgPreview, item.unreadCount > 0 && styles.msgPreviewUnread]} numberOfLines={1}>
          {item.latestText}
        </Text>
      </View>
      
      <View style={{ alignItems: 'flex-end', justifyContent: 'center', minWidth: 40, gap: 4 }}>
        <Text style={[styles.timeText, item.unreadCount > 0 && styles.timeTextUnread]}>{item.time}</Text>
        {item.unreadCount > 0 ? (
          <View style={[styles.unreadBadge, { marginLeft: 0 }]}>
            <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
          </View>
        ) : <View style={{ height: 20 }} />}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back-outline" size={24} color="#64748B" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>Room Chats</Text>
            <Text style={styles.headerSub}>{property.name} · {rooms.length} rooms</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <View style={[styles.sectionHeading, { marginTop: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeadingText}>Group</Text>
            </View>
            <Pressable 
              style={styles.chatRow}
              onPress={() => router.push(`/(landlord)/property/${id}/chat/group`)}
            >
              <View style={[styles.avatar, { backgroundColor: '#3B82F6' }]}>
                <Text style={[styles.avatarText, { fontSize: 14 }]}>ALL</Text>
              </View>
              
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.roomName}>{property.name}</Text>
                    <Text style={styles.tenantCount}>All tenants</Text>
                  </View>
                </View>
                <Text style={[styles.msgPreview, groupUnreadCount > 0 && styles.msgPreviewUnread]} numberOfLines={1}>
                  {groupPreview}
                </Text>
              </View>
              
              <View style={{ alignItems: 'flex-end', justifyContent: 'center', minWidth: 40, gap: 4 }}>
                <Text style={[styles.timeText, groupUnreadCount > 0 && styles.timeTextUnread]}>{groupTime}</Text>
                {groupUnreadCount > 0 ? (
                  <View style={[styles.unreadBadge, { marginLeft: 0 }]}>
                    <Text style={styles.unreadBadgeText}>{groupUnreadCount}</Text>
                  </View>
                ) : <View style={{ height: 20 }} />}
              </View>
            </Pressable>
            
            <View style={[styles.sectionHeading, { marginTop: 5 }]}>
              <Text style={styles.sectionHeadingText}>Rooms</Text>
            </View>
          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  
  header: { paddingHorizontal: 16, paddingBottom: 6, backgroundColor: '#fff' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 16, color: '#64748B' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.4 },
  headerSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  searchBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  searchIcon: { fontSize: 14 },
  
  listContent: { paddingBottom: 100 },
  listHeader: { paddingBottom: 2 },
  
  broadcastBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginBottom: 16 },
  broadcastGradient: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  broadcastIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  broadcastIcon: { fontSize: 18 },
  broadcastTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  broadcastSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  broadcastChevron: { fontSize: 20, color: '#fff', opacity: 0.8 },
  
  sectionHeading: { paddingTop: 5, paddingHorizontal: 16, marginTop: 4 },
  sectionHeadingText: { fontSize: 14, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 14, position: 'relative' },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  
  chatInfo: { flex: 1, paddingRight: 8 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  roomName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  tenantCount: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  timeText: { fontSize: 12, color: '#94A3B8' },
  timeTextUnread: { color: '#3B82F6', fontWeight: '700' },
  
  msgPreview: { fontSize: 14, color: '#64748B', marginTop: 3 },
  msgPreviewUnread: { color: '#0F172A', fontWeight: '600' },
  
  unreadBadge: { backgroundColor: '#3B82F6', minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, marginLeft: 8 },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' }
});
