import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, Image, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { getTenantColor, getTenantTextColor } from '../ui/AvatarCluster';
import { C, styles as baseStyles } from './propertyStyles';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';
import { getAuthenticatedMediaUrl } from '../../lib/storage';

import { useQueryClient } from '@tanstack/react-query';

interface Props {
  propertyId: string;
  requests: any[];
  tenantMap: Record<string, any>;
}

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours <= 0) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const PRIORITY_STYLES: Record<string, any> = {
  low: { bg: '#F1F5F9', fg: '#475569', label: 'Low Priority' },
  normal: { bg: '#FEF3C7', fg: '#92400E', label: 'Normal' },
  urgent: { bg: '#FEE2E2', fg: '#991B1B', label: 'Urgent' },
};

export function PropertyRequestsSubTab({ propertyId, requests, tenantMap }: Props) {
  const queryClient = useQueryClient();
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({});
  const [authToken, setAuthToken] = useState('');
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthToken(data.session?.access_token || ''));
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => setAuthToken(session?.access_token || ''));
    return () => authListener.subscription.unsubscribe();
  }, []);
  
  const syncOfflineQueue = async () => {
    try {
      const queueStr = await AsyncStorage.getItem('OFFLINE_REQ_QUEUE');
      if (!queueStr) return false;
      
      const queue = JSON.parse(queueStr);
      const ids = Object.keys(queue);
      if (ids.length === 0) return false;

      let syncedSomething = false;
      for (const reqId of ids) {
        try {
          const { error } = await supabase.from('maintenance_requests').update({ status: queue[reqId] }).eq('id', reqId);
          if (!error) {
            // Instantly patch the parent's React Query cache so the true prop updates immediately
            queryClient.setQueryData(['propertyData', propertyId], (oldData: any) => {
              if (!oldData) return oldData;
              const newReqs = (oldData.maintenance_requests || []).map((r: any) => 
                r.id === reqId ? { ...r, status: queue[reqId] } : r
              );
              return { ...oldData, maintenance_requests: newReqs };
            });
            delete queue[reqId];
            syncedSomething = true;
          } else {
            console.log(`Failed to sync req ${reqId}, keeping in queue. Error:`, error);
          }
        } catch (err) {
          console.log(`Exception syncing req ${reqId}:`, err);
        }
      }

      // Save the remaining queue (or delete if empty)
      if (Object.keys(queue).length === 0) {
        await AsyncStorage.removeItem('OFFLINE_REQ_QUEUE');
      } else if (syncedSomething) {
        await AsyncStorage.setItem('OFFLINE_REQ_QUEUE', JSON.stringify(queue));
      }

      return syncedSomething;
    } catch (e) {
      console.log('Error syncing offline queue:', e);
      return false;
    }
  };

  // Listen for network to sync offline queue
  useEffect(() => {
    // 1. Load existing offline queue into optimistic UI immediately on mount
    AsyncStorage.getItem('OFFLINE_REQ_QUEUE').then(queueStr => {
      if (queueStr) {
        try {
          const parsed = JSON.parse(queueStr);
          setOptimisticStatuses(prev => ({ ...prev, ...parsed }));
        } catch (e) {}
      }
    });

    let wasConnected = true;

    // Try syncing immediately on mount
    syncOfflineQueue();

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const isConnected = !!state.isConnected;
      
      if (isConnected && !wasConnected) {
        // We just came back online!
        // 1. Push any offline changes to DB
        const synced = await syncOfflineQueue();
        
        if (synced) {
          // 2. Delay wiping the optimistic UI by 2 seconds to guarantee
          // WebSockets and the Query Cache have fully received the new DB state.
          // This prevents the UI from momentarily flashing back to the old status.
          setTimeout(async () => {
            await queryClient.invalidateQueries({ queryKey: ['propertyData'] });
            setOptimisticStatuses({});
          }, 2000);
        } else {
          setOptimisticStatuses({});
        }
      }
      
      wasConnected = isConnected;
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, currentStatus: string, tappedStatus: string) => {
    const newStatus = currentStatus === tappedStatus ? 'open' : tappedStatus;
    
    // 1. Optimistic UI update (Instant)
    setOptimisticStatuses(prev => ({ ...prev, [id]: newStatus }));

    const queueOffline = async () => {
      try {
        const queueStr = await AsyncStorage.getItem('OFFLINE_REQ_QUEUE');
        const queue = queueStr ? JSON.parse(queueStr) : {};
        queue[id] = newStatus;
        await AsyncStorage.setItem('OFFLINE_REQ_QUEUE', JSON.stringify(queue));
      } catch (e) {
        console.log('Error saving to offline queue:', e);
      }
    };

    // 2. Check network state
    let netState;
    try {
      netState = await NetInfo.fetch();
    } catch (e) {
      netState = { isConnected: false };
    }
    
    if (!netState.isConnected) {
      // 3a. If offline, save to AsyncStorage Queue
      await queueOffline();
    } else {
      // 3b. If online, update DB directly
      try {
        const { error } = await supabase.from('maintenance_requests').update({ status: newStatus }).eq('id', id);
        if (error) {
          console.log('Supabase update failed, queuing offline:', error);
          await queueOffline();
        } else {
          // Instantly patch the parent's React Query cache
          queryClient.setQueryData(['propertyData', propertyId], (oldData: any) => {
            if (!oldData) return oldData;
            const newReqs = (oldData.maintenance_requests || []).map((r: any) => 
              r.id === id ? { ...r, status: newStatus } : r
            );
            return { ...oldData, maintenance_requests: newReqs };
          });

          // Remove from optimistic state after a slight delay
          setTimeout(() => {
            setOptimisticStatuses(prev => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          }, 1000);
        }
      } catch (err) {
        // Exception thrown (e.g. Failed to fetch)
        console.log('Supabase threw exception, queuing offline:', err);
        await queueOffline();
      }
    }
  };

  const activeReqs = requests.filter((r: any) => (optimisticStatuses[r.id] || r.status || 'open') !== 'resolved');
  const resolvedReqs = requests.filter((r: any) => (optimisticStatuses[r.id] || r.status || 'open') === 'resolved');

  const renderReq = (req: any) => {
    const tenant = tenantMap[req.tenant_id] || { name: 'Unknown', initials: '?', color: C.muted, roomName: 'Unknown' };
    const pStyle = PRIORITY_STYLES[req.priority || 'normal'] || PRIORITY_STYLES.normal;
    const hasPhoto = !!req.photo_url;
    
    // Use the optimistic status if one exists, otherwise fall back to DB status
    const effectiveStatus = optimisticStatuses[req.id] || req.status || 'open';

    return (
      <Pressable key={req.id} style={styles.card} onPress={() => setSelectedReq(req)}>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Left Side: Header & Description */}
          <View style={{ flex: 1, paddingRight: 10 }}>
            
            <View style={styles.headerRow}>
              <View style={[styles.avatar, { backgroundColor: getTenantColor(req.tenant_id) }]}>
                <Text style={[styles.avatarText, { color: getTenantTextColor(req.tenant_id) }]}>{tenant.initials}</Text>
              </View>
              <View style={styles.titleCol}>
                <Text style={styles.title}>{req.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{tenant.roomName} · {tenant.name.split(' ')[0]} · {formatTimeAgo(req.created_at)}</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: pStyle.bg, alignSelf: 'flex-start' }]}>
                <Text style={[styles.badgeText, { color: pStyle.fg }]}>{pStyle.label}</Text>
              </View>
            </View>

            {/* Description & Photo Symbol */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Text style={[styles.description, { flex: 1, marginRight: 10, marginBottom: 0 }]} numberOfLines={2}>
                {req.description}
              </Text>
              {hasPhoto && (
                <Ionicons name="image-outline" size={18} color="#64748B" />
              )}
            </View>
          </View>

          {/* Right Side: Chevron Icon */}
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.muted, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, color: C.mutedFg, fontWeight: '600', marginTop: -2 }}>›</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionsRow, { marginTop: 12 }]}>
          <Pressable 
            style={[styles.btn, effectiveStatus === 'in_progress' ? styles.btnActive : styles.btnInactive]}
            onPress={() => updateStatus(req.id, effectiveStatus, 'in_progress')}
          >
            <Text style={[styles.btnText, effectiveStatus === 'in_progress' ? styles.btnTextInProgress : styles.btnTextInactive]}>
              In Progress
            </Text>
          </Pressable>
          
          <Pressable 
            style={[styles.btn, effectiveStatus === 'resolved' ? styles.btnResolvedActive : styles.btnInactive]}
            onPress={() => updateStatus(req.id, effectiveStatus, 'resolved')}
          >
            <Text style={[styles.btnText, effectiveStatus === 'resolved' ? styles.btnTextResolved : styles.btnTextInactive]}>
              Resolved ✓
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <ScrollView 
        contentContainerStyle={[baseStyles.tabContentContainer, { paddingHorizontal: 16, paddingTop: 16, gap: 12 }]}
      >
        {requests.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: C.mutedFg }}>No maintenance requests.</Text>
          </View>
        ) : (
          <>
            {activeReqs.map(renderReq)}
            {resolvedReqs.length > 0 && (
              <View style={{ marginTop: 24, marginBottom: 8, paddingHorizontal: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: C.mutedFg, textTransform: 'uppercase', letterSpacing: 1.2 }}>Resolved</Text>
              </View>
            )}
            {resolvedReqs.map(renderReq)}
          </>
        )}
        
      
      <View style={{ height: 80 }} />
    </ScrollView>

      {/* Pop-up Modal for Request Details */}
      <Modal
        visible={!!selectedReq}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedReq(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReq && (() => {
              const tenant = tenantMap[selectedReq.tenant_id] || { name: 'Unknown', initials: '?', color: C.muted, roomName: 'Unknown' };
              const pStyle = PRIORITY_STYLES[selectedReq.priority || 'normal'] || PRIORITY_STYLES.normal;

              return (
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <View style={styles.headerRow}>
                      <View style={[styles.avatar, { backgroundColor: getTenantColor(selectedReq.tenant_id) }]}>
                        <Text style={[styles.avatarText, { color: getTenantTextColor(selectedReq.tenant_id) }]}>{tenant.initials}</Text>
                      </View>
                      <View>
                        <Text style={styles.metaText}>{tenant.name}</Text>
                        <Text style={[styles.metaText, { fontSize: 11 }]}>{tenant.roomName} · {formatTimeAgo(selectedReq.created_at)}</Text>
                      </View>
                    </View>
                    <Pressable style={styles.closeBtn} onPress={() => setSelectedReq(null)}>
                      <Text style={styles.closeBtnText}>✕</Text>
                    </Pressable>
                  </View>

                  <View style={[styles.badge, { backgroundColor: pStyle.bg, alignSelf: 'flex-start', marginBottom: 12 }]}>
                    <Text style={[styles.badgeText, { color: pStyle.fg }]}>{pStyle.label}</Text>
                  </View>

                  <Text style={[styles.title, { fontSize: 18, marginBottom: 12 }]}>{selectedReq.title}</Text>
                  <Text style={[styles.description, { fontSize: 15, lineHeight: 22, color: C.fg }]}>
                    {selectedReq.description}
                  </Text>

                  {selectedReq.photo_url && (
                    <ExpoImage 
                      source={{ 
                        uri: getAuthenticatedMediaUrl('maintenance-photos', selectedReq.photo_url),
                        headers: { Authorization: `Bearer ${authToken}` }
                      }} 
                      style={styles.modalPhoto} 
                      contentFit="cover"
                      transition={200}
                    />
                  )}
                
                <View style={{ height: 80 }} />
    </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  titleCol: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: C.fg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: C.mutedFg,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: C.mutedFg,
    lineHeight: 18,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
    marginTop: 4,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: C.muted,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnInactive: {
    borderColor: C.border,
    backgroundColor: '#fff',
  },
  btnActive: {
    borderColor: '#FDE68A',
    backgroundColor: '#FEF3C7',
  },
  btnResolvedActive: {
    borderColor: '#A7F3D0',
    backgroundColor: '#D1FAE5',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  btnTextInactive: {
    color: C.fg,
  },
  btnTextInProgress: {
    color: '#92400E',
  },
  btnTextResolved: {
    color: '#065F46',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: C.mutedFg,
    fontWeight: '800',
  },
  modalPhoto: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: C.muted,
  },
});


