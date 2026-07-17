import React, { useEffect, useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { uploadFileToSupabase } from '../../../lib/storage';
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { getInitials } from '../../../components/ui/AvatarCluster';
import { supabase } from '../../../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllReadReceipts } from '../../../lib/readReceipts';
import { useCallback } from 'react';

import NewAnnouncementModal from '../../../components/property/NewAnnouncementModal';
import AddRoomModal from '../../../components/property/AddRoomModal';
import RoomsTab from '../../../components/property/RoomsTab';
import RentTab from '../../../components/property/RentTab';
import UpdatesTab from '../../../components/property/UpdatesTab';
import { C, styles } from '../../../components/property/propertyStyles';

type TabKey = "rooms" | "rent" | "updates";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('rooms');
  const [updatesSubTab, setUpdatesSubTab] = useState('Duties');
  const [expandedChore, setExpandedChore] = useState<string | null>(null);
  
  // Announcement Modal State
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [editAnnId, setEditAnnId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annExpiry, setAnnExpiry] = useState<number>(5);
  const [isCustomExpiry, setIsCustomExpiry] = useState(false);
  const [annImageUri, setAnnImageUri] = useState<string | null>(null);
  
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const snackbarAnim = useRef(new Animated.Value(300)).current;

  const showSnackbar = (msg: string) => {
    setSnackbarMessage(msg);
    Animated.timing(snackbarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(snackbarAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setSnackbarMessage(''));
      }, 3000);
    });
  };

  const showCenterFab = activeTab === 'rooms' || (activeTab === 'updates' && (updatesSubTab === 'Duties' || updatesSubTab === 'Announcements'));

  const [fabLabel, setFabLabel] = useState('Add Room');
  useEffect(() => {
    if (showCenterFab) {
      setFabLabel(activeTab === 'rooms' ? 'Add Room' : (updatesSubTab === 'Duties' ? 'Assign Chore' : 'New Post'));
    }
  }, [activeTab, updatesSubTab, showCenterFab]);

  // Animation value for the FAB (0 = visible, 100 = hidden below screen)
  const fabTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fabTranslateY, {
      toValue: showCenterFab ? 0 : 200,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCenterFab]);
  
  const queryClient = useQueryClient();

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['propertyData', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID');
      // Unified 1 API Call utilizing Resource Embedding
      const { data: propData, error } = await supabase
        .from('properties')
        .select(`
          *,
          rooms (*, tenant_memberships (id, status, profiles (id, full_name, role))),
          chores (*),
          announcements (*),
          maintenance_requests (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;

      // Sort announcements by created_at descending (newest first)
      const sortedAnnouncementsRaw = (propData.announcements || []).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Sort requests by created_at descending (newest first)
      const sortedRequests = (propData.maintenance_requests || []).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const sortedChores = (propData.chores || []).sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Generate signed URLs for private images in announcements
      const finalAnnouncements = await Promise.all(sortedAnnouncementsRaw.map(async (ann: any) => {
        if (ann.image_url) {
          try {
            const { data } = await supabase.storage.from('announcements-media').createSignedUrl(ann.image_url, 60 * 60 * 24);
            return { ...ann, signed_image_url: data?.signedUrl };
          } catch(e) {}
        }
        return ann;
      }));

      const tMap: Record<string, any> = {};
      const processedRooms = (propData.rooms || []).map((room: any) => {
        const activeMemberships = room.tenant_memberships?.filter((m: any) => m.status === 'active') || [];
        const tenants = activeMemberships.map((m: any) => {
          const tenantObj = {
            id: m.profiles?.id,
            name: m.profiles?.full_name || 'Tenant',
            initials: getInitials(m.profiles?.full_name),
            color: C.primary,
            roomName: room.name
          };
          if (m.profiles?.id) tMap[m.profiles.id] = tenantObj;
          return tenantObj;
        });
        return { ...room, tenants, rentPaid: true };
      });

      return {
        property: propData,
        rooms: processedRooms,
        tenantMap: tMap,
        chores: sortedChores,
        announcements: finalAnnouncements,
        maintenance_requests: sortedRequests
      };
    },
    enabled: !!id
  });

  const { data: totalUnread = 0 } = useQuery({
    queryKey: ['propertyUnreadCount', id],
    queryFn: async () => {
      if (!id || !profile?.id) return 0;
      
      const receipts = await getAllReadReceipts();
      const { data: recentMsgs } = await supabase
        .from('chat_messages')
        .select('room_id, created_at, sender_id')
        .eq('property_id', id)
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (!recentMsgs) return 0;
      
      let unread = 0;
      for (const msg of recentMsgs) {
        if (msg.sender_id === profile.id) continue;
        const roomIdKey = msg.room_id || (id as string);
        const lastRead = new Date(receipts[roomIdKey] || '1970-01-01T00:00:00.000Z');
        if (new Date(msg.created_at) > lastRead) {
          unread++;
        }
      }
      return unread;
    },
    enabled: !!id && !!profile?.id,
  });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['propertyUnreadCount', id] });
    }, [id, queryClient])
  );

  const property = data?.property;
  const rooms = data?.rooms || [];
  const tenantMap = data?.tenantMap || {};
  const chores = data?.chores || [];
  const announcements = data?.announcements || [];
  const maintenanceRequests = data?.maintenance_requests || [];

  // Realtime WebSockets Subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel(`property-${id}-updates-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements', filter: `property_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['propertyData', id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chores', filter: `property_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['propertyData', id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_requests', filter: `property_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['propertyData', id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tenant_memberships' }, () => {
        queryClient.invalidateQueries({ queryKey: ['propertyData', id] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `property_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['propertyUnreadCount', id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);


  
  const saveAnnouncementMutation = useMutation({
    mutationFn: async ({ title, body, expiryDays, editId, imageUri }: any) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      let image_url = null;
      if (imageUri) {
        if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
          const extension = imageUri.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}_announcement.${extension}`;
          
          try {
            const pickedMedia = {
              uri: imageUri,
              type: 'image' as const,
              name: fileName,
              mimeType: `image/${extension === 'jpg' ? 'jpeg' : extension}`
            };
            
            const { url, error: uploadError } = await uploadFileToSupabase('announcements-media', id as string, pickedMedia);
            if (uploadError || !url) throw new Error(uploadError?.message || 'Upload failed');
            image_url = url;
          } catch (e) {
            console.error('Image upload failed:', e);
            throw e;
          }
        }
      }

      if (editId) {
        const updateData: any = {
          title: title.trim(),
          body: body.trim(),
          expires_at: expiresAt.toISOString(),
        };
        if (image_url) updateData.image_url = image_url;
        
        const { data, error } = await supabase.from('announcements').update(updateData).eq('id', editId).select().single();
        if (error) throw error;
        return data;
      } else {
        const insertData: any = {
          property_id: id,
          title: title.trim(),
          body: body.trim(),
          expires_at: expiresAt.toISOString(),
        };
        if (image_url) insertData.image_url = image_url;
        
        const { data, error } = await supabase.from('announcements').insert(insertData).select().single();
        if (error) throw error;
        return data;
      }
    },
    onMutate: async (newAnn) => {
      await queryClient.cancelQueries({ queryKey: ['propertyData', id] });
      const previousData = queryClient.getQueryData(['propertyData', id]);
      if (previousData) {
        const updatedAnns = newAnn.editId 
          ? (previousData as any).announcements.map((a: any) => a.id === newAnn.editId ? { ...a, title: newAnn.title, body: newAnn.body } : a)
          : [{ id: 'temp-id', title: newAnn.title, body: newAnn.body, created_at: new Date().toISOString() }, ...(previousData as any).announcements];
        
        queryClient.setQueryData(['propertyData', id], { ...(previousData as any), announcements: updatedAnns });
      }
      return { previousData };
    },
    onError: (err, newAnn, context) => {
      queryClient.setQueryData(['propertyData', id], context?.previousData);
      showSnackbar(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyData', id] });
    }
  });

  const handleSaveAnnouncement = () => {
    if (!annTitle.trim() || !annBody.trim()) return;
    
    let finalExpiry = annExpiry;
    if (isNaN(finalExpiry) || finalExpiry <= 0) {
      showSnackbar('Please enter a valid number of days.');
      return;
    }
    
    saveAnnouncementMutation.mutate({ title: annTitle, body: annBody, expiryDays: finalExpiry, editId: editAnnId, imageUri: annImageUri });
    setShowAnnModal(false);
  };


  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Property not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backButtonFallback}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Calculations for Hero
  const totalExpected = rooms.reduce((acc, r) => acc + (r.monthly_rent || 0), 0);
  const totalCollected = 0; // Starts at 0, later hook up rent_payments
  const pct = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
  const totalTenants = rooms.reduce((acc, r) => acc + r.tenants.length, 0);

  const renderPropertyHero = () => (
    <View style={styles.heroWrapper}>
      <LinearGradient
        colors={[C.g1, C.g3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <View style={styles.heroCircle} />
        
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroMonthText}>THIS MONTH</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={styles.heroAmountCollected}>${totalCollected.toLocaleString()}</Text>
              <Text style={styles.heroAmountTotal}> / ${totalExpected.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{pct}% in</Text>
          </View>
        </View>

        <View style={styles.heroProgressBarContainer}>
          <View style={[styles.heroProgressBarFill, { width: `${pct}%` }]} />
        </View>

        <View style={styles.heroStatsRow}>
          <View>
            <Text style={styles.heroStatLabel}>Rooms</Text>
            <Text style={styles.heroStatValue}>{rooms.length}</Text>
          </View>
          <View>
            <Text style={styles.heroStatLabel}>Tenants</Text>
            <Text style={styles.heroStatValue}>{totalTenants}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: C.card }} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.headerIconButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#64748B" />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{property.name}</Text>
            <Text style={styles.headerSubtitle}>{property.address}</Text>
          </View>
        </View>
        <Pressable 
          style={styles.headerIconButton} 
          onPress={() => router.push(`/(landlord)/property/${id}/settings` as any)}
        >
          <Text style={styles.headerIconText}>⋮</Text>
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {activeTab === 'rooms' && (
          <RoomsTab 
            id={id as string}
            rooms={rooms} 
            renderPropertyHero={renderPropertyHero} 
          />
        )}
        {activeTab === 'rent' && (
          <RentTab 
            rooms={rooms} 
            renderPropertyHero={renderPropertyHero} 
          />
        )}
        {activeTab === 'updates' && (
          <UpdatesTab 
            id={id as string}
            chores={chores}
            announcements={announcements}
            maintenanceRequests={maintenanceRequests}
            updatesSubTab={updatesSubTab}
            setUpdatesSubTab={setUpdatesSubTab}
            expandedChore={expandedChore}
            setExpandedChore={setExpandedChore}
            tenantMap={tenantMap}
            setEditAnnId={setEditAnnId}
            setAnnTitle={setAnnTitle}
            setAnnBody={setAnnBody}
            setAnnExpiry={setAnnExpiry}
            setIsCustomExpiry={setIsCustomExpiry}
            setShowAnnModal={setShowAnnModal}
            setAnnouncements={() => queryClient.invalidateQueries({ queryKey: ['propertyData', id] })}
          />
        )}

        {/* Announcements Modal */}
        <NewAnnouncementModal 
          visible={showAnnModal} 
          onClose={() => setShowAnnModal(false)}
          editAnnId={editAnnId}
          annTitle={annTitle}
          setAnnTitle={setAnnTitle}
          annBody={annBody}
          setAnnBody={setAnnBody}
          annExpiry={annExpiry}
          setAnnExpiry={setAnnExpiry}
          isCustomExpiry={isCustomExpiry}
          setIsCustomExpiry={setIsCustomExpiry}
          annImageUri={annImageUri}
          setAnnImageUri={setAnnImageUri}
          isSavingAnn={saveAnnouncementMutation.isPending}
          handleSaveAnnouncement={handleSaveAnnouncement}
        />

        {/* Add Room Modal */}
        <AddRoomModal
          visible={showAddRoomModal}
          onClose={() => setShowAddRoomModal(false)}
          propertyId={id as string}
          propertyName={property?.name}
        />

        {/* Floating Action Buttons */}
        <Animated.View style={[
          styles.fabContainerCenter, 
          { 
            transform: [{ translateY: fabTranslateY }],
            opacity: fabTranslateY.interpolate({
              inputRange: [0, 60],
              outputRange: [1, 0],
              extrapolate: 'clamp'
            })
          }
        ]} pointerEvents="box-none">
          <Pressable 
            style={styles.fabPrimary}
            onPress={() => {
              if (activeTab === 'rooms') {
                setShowAddRoomModal(true);
              } else if (activeTab === 'updates' && updatesSubTab === 'Duties') {
                router.navigate({ pathname: '/(landlord)/property/assign-chore', params: { propertyId: id } } as any);
              } else if (activeTab === 'updates' && updatesSubTab === 'Announcements') {
                setEditAnnId(null);
                setAnnTitle('');
                setAnnBody('');
                setAnnExpiry(5);
                setIsCustomExpiry(false);
                setAnnImageUri(null);
                setShowAnnModal(true);
              }
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>+</Text>
            <Text style={styles.fabPrimaryText}>{fabLabel}</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.fabContainerRight} pointerEvents="box-none">
          <Pressable style={styles.fabChat} onPress={() => router.navigate(`/(landlord)/property/${id}/chats`)}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
            {totalUnread > 0 && (
              <View style={styles.fabChatBadge}>
                <Text style={styles.fabChatBadgeText}>{totalUnread}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
      
      {/* Snackbar */}
      <Animated.View style={[styles.snackbar, { transform: [{ translateY: snackbarAnim }] }]}>
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
      </Animated.View>
      
      {/* Expandable Nav Bar */}
      <View style={[styles.bottomBarWrapper, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.expandableNavBar}>
          {[
            { key: 'rooms', label: 'Rooms', iconBase: 'home' },
            { key: 'rent', label: 'Rent', iconBase: 'cash' },
            { key: 'updates', label: 'Updates', iconBase: 'notifications' }
          ].map(tab => {
            const isActive = tab.key === activeTab;
            const iconName = isActive ? tab.iconBase : `${tab.iconBase}-outline`;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setActiveTab(tab.key as TabKey);
                }}
                style={styles.navItem}
              >
                <View style={[styles.navIconWrapper, isActive && styles.navIconWrapperActive]}>
                  <Ionicons name={iconName as any} size={22} color={isActive ? C.primary : C.mutedFg} />
                </View>
                <Text style={[styles.navText, isActive && styles.navTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
