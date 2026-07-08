import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';
import { ChatRoom, ChatParticipant } from '../../../../components/chat/ChatRoom';
import { Theme } from '../../../../constants/theme';

export default function TenantChatScreen() {
  const { id: roomId, type } = useLocalSearchParams<{ id: string, type: 'private' | 'group' }>();
  const router = useRouter();
  const { profile } = useAuth();
  
  // We need to fetch the room data to know the propertyId and participant names
  const { data: roomData, isLoading, error } = useQuery({
    queryKey: ['tenantRoomChatData', roomId],
    queryFn: async () => {
      if (!roomId) throw new Error('No Room ID');
      
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          properties (
            id, name, landlord_id,
            rooms (
              id, name,
              tenant_memberships (
                tenant_id, status,
                profiles (id, full_name, avatar_url)
              )
            )
          ),
          tenant_memberships (
            tenant_id, status,
            profiles (id, full_name, avatar_url)
          )
        `)
        .eq('id', roomId)
        .single();
        
      if (error) throw error;
      
      let landlordProfile = null;
      if (data?.properties?.landlord_id) {
        const { data: lp } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.properties.landlord_id)
          .single();
        landlordProfile = lp;
      }
      
      return { ...data, landlordProfile };
    },
    enabled: !!roomId,
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

  const isGroup = type === 'group';
  const propertyId = roomData.property_id;
  
  // Map all participants
  const participants: Record<string, ChatParticipant> = {};
  
  // Add landlord
  if (roomData.landlordProfile) {
    participants[roomData.landlordProfile.id] = {
      id: roomData.landlordProfile.id,
      name: roomData.landlordProfile.full_name || 'Landlord',
      initials: (roomData.landlordProfile.full_name || 'L').substring(0, 2).toUpperCase(),
      color: Theme.colors.accent,
    };
  }
  
  // Add tenants
  if (isGroup) {
    const allRooms = roomData.properties?.rooms || [];
    allRooms.forEach((r: any) => {
      const active = r.tenant_memberships?.filter((m: any) => m.status === 'active') || [];
      active.forEach((m: any) => {
        if (m.profiles) {
          participants[m.tenant_id] = {
            id: m.tenant_id,
            name: m.profiles.full_name || 'Tenant',
            initials: (m.profiles.full_name || 'T').substring(0, 2).toUpperCase(),
            color: m.tenant_id === profile.id ? '#2563EB' : '#059669',
          };
        }
      });
    });
  } else {
    // Only this room's tenants
    const active = roomData.tenant_memberships?.filter((m: any) => m.status === 'active') || [];
    active.forEach((m: any) => {
      if (m.profiles) {
        participants[m.tenant_id] = {
          id: m.tenant_id,
          name: m.profiles.full_name || 'Tenant',
          initials: (m.profiles.full_name || 'T').substring(0, 2).toUpperCase(),
          color: m.tenant_id === profile.id ? '#2563EB' : '#059669',
        };
      }
    });
  }

  const title = isGroup ? `${roomData.properties?.name} · All Tenants` : roomData.landlordProfile?.full_name || 'Landlord';
  const subtitle = isGroup ? 'House Group Chat' : 'Private chat with landlord';

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
