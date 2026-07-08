import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../../contexts/AuthContext';
import { ChatRoom, ChatParticipant } from '../../../../../components/chat/ChatRoom';
import { Theme } from '../../../../../constants/theme';

export default function LandlordChatScreen() {
  const { id: propertyId, roomId } = useLocalSearchParams<{ id: string, roomId: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  
  const isGroup = roomId === 'group';

  // We need to fetch the property/room data to map participant names
  const { data: roomData, isLoading, error } = useQuery({
    queryKey: ['landlordChatData', propertyId, roomId],
    queryFn: async () => {
      if (!propertyId) throw new Error('No Property ID');
      
      let query = supabase
        .from('properties')
        .select(`
          name,
          rooms (
            id, name,
            tenant_memberships (
              tenant_id, status,
              profiles (id, full_name, avatar_url)
            )
          )
        `)
        .eq('id', propertyId);
        
      const { data, error } = await query.single();
      if (error) throw error;
      
      return data;
    },
    enabled: !!propertyId,
  });

  if (isLoading || !profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (error || !roomData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <Text style={{ color: Theme.colors.danger }}>Failed to load chat data.</Text>
      </View>
    );
  }
  
  // Map all participants
  const participants: Record<string, ChatParticipant> = {};
  
  // Add landlord (Me)
  participants[profile.id] = {
    id: profile.id,
    name: profile.full_name || 'Me',
    initials: (profile.full_name || 'ME').substring(0, 2).toUpperCase(),
    color: '#2563EB',
  };
  
  // Add tenants
  let targetRoomName = '';
  const allRooms = roomData.rooms || [];
  
  allRooms.forEach((r: any) => {
    // If it's a private chat, only add tenants from the target room
    if (!isGroup && r.id !== roomId) return;
    
    if (!isGroup && r.id === roomId) targetRoomName = r.name;
    
    const active = r.tenant_memberships?.filter((m: any) => m.status === 'active') || [];
    active.forEach((m: any) => {
      if (m.profiles) {
        participants[m.tenant_id] = {
          id: m.tenant_id,
          name: m.profiles.full_name || 'Tenant',
          initials: (m.profiles.full_name || 'T').substring(0, 2).toUpperCase(),
          // Group chat -> differentiate by room colors maybe? Just stick to one for now.
          color: '#10B981', 
        };
      }
    });
  });

  const title = isGroup ? `${roomData.name} · All Tenants` : targetRoomName;
  const subtitle = isGroup ? 'Broadcast / House Group Chat' : 'Private room chat';

  return (
    <ChatRoom
      propertyId={propertyId}
      roomId={isGroup ? undefined : roomId}
      currentUserId={profile.id}
      participants={participants}
      title={title}
      subtitle={subtitle}
      onBack={() => router.back()}
    />
  );
}
