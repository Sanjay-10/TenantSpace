import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Image, Alert } from 'react-native';
import { Theme } from '../../../constants/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours <= 0) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const STATUS_STYLES: Record<string, any> = {
  open: { bg: '#F1F5F9', fg: '#475569', label: 'open' },
  in_progress: { bg: '#FEF3C7', fg: '#92400E', label: 'in progress' },
  resolved: { bg: '#D1FAE5', fg: '#065F46', label: 'resolved ✓' },
};

export function RequestsSubTab({ requests = [], propertyId, roomId, tenantMap = {} }: { requests?: any[], propertyId?: string, roomId?: string, tenantMap?: Record<string, any> }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [selectedReq, setSelectedReq] = useState<any>(null);

  const handleDelete = (reqId: string) => {
    Alert.alert('Delete Request', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          setSelectedReq(null);
          await supabase.from('maintenance_requests').delete().eq('id', reqId);
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {requests.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: Theme.colors.mutedFg }}>No requests found.</Text>
        </View>
      ) : (
        requests.map((req) => {
          const sStyle = STATUS_STYLES[req.status || 'open'] || STATUS_STYLES.open;
          const tenant = tenantMap[req.tenant_id] || { name: 'Unknown', initials: '?', color: Theme.colors.muted };

          return (
            <Pressable 
              key={req.id} 
              style={styles.card}
              onPress={() => setSelectedReq(req)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                      <View style={[styles.avatar, { backgroundColor: tenant.color }]}>
                        <Text style={styles.avatarText}>{tenant.initials}</Text>
                      </View>
                      <View>
                        <Text style={styles.title}>{req.title}</Text>
                        <Text style={styles.tenantName}>{tenant.name.split(' ')[0]}</Text>
                      </View>
                    </View>
                    <View style={[styles.badge, { backgroundColor: sStyle.bg }]}>
                      <Text style={[styles.badgeText, { color: sStyle.fg }]}>{sStyle.label}</Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Text style={[styles.description, { flex: 1, marginRight: 10, marginBottom: 0 }]} numberOfLines={2}>
                      {req.description}
                    </Text>
                    {!!req.photo_url && (
                      <Ionicons name="image-outline" size={18} color="#64748B" />
                    )}
                  </View>

                  <Text style={[styles.timeText, { marginTop: 12 }]}>{formatTimeAgo(req.created_at)}</Text>
                </View>

                {/* Right Side: Chevron Icon */}
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Theme.colors.muted, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, color: Theme.colors.mutedFg, fontWeight: '600', marginTop: -2 }}>›</Text>
                </View>
              </View>
            </Pressable>
          );
        })
      )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Pressable 
          style={styles.fab}
          onPress={() => router.push({ pathname: '/(tenant)/room/new-request', params: { propertyId, roomId } } as any)}
        >
          <Text style={styles.fabText}>+ New Request</Text>
        </Pressable>
      </View>

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
              const tenant = tenantMap[selectedReq.tenant_id] || { name: 'Unknown', initials: '?', color: Theme.colors.muted };
              const sStyle = STATUS_STYLES[selectedReq.status || 'open'] || STATUS_STYLES.open;
              const isMine = selectedReq.tenant_id === profile?.id;

              return (
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <View style={styles.titleRow}>
                      <View style={[styles.avatar, { backgroundColor: tenant.color }]}>
                        <Text style={styles.avatarText}>{tenant.initials}</Text>
                      </View>
                      <View>
                        <Text style={[styles.title, { fontSize: 16 }]}>{tenant.name}</Text>
                        <Text style={[styles.timeText, { marginTop: 0 }]}>{formatTimeAgo(selectedReq.created_at)}</Text>
                      </View>
                    </View>
                    <Pressable style={styles.closeBtn} onPress={() => setSelectedReq(null)}>
                      <Text style={styles.closeBtnText}>✕</Text>
                    </Pressable>
                  </View>

                  <View style={[styles.badge, { backgroundColor: sStyle.bg, alignSelf: 'flex-start', marginBottom: 12 }]}>
                    <Text style={[styles.badgeText, { color: sStyle.fg }]}>{sStyle.label}</Text>
                  </View>

                  <Text style={[styles.title, { fontSize: 18, marginBottom: 12 }]}>{selectedReq.title}</Text>
                  <Text style={[styles.description, { fontSize: 15, lineHeight: 22, color: Theme.colors.fg }]}>
                    {selectedReq.description}
                  </Text>

                  {selectedReq.photo_url && (
                    <Image source={{ uri: selectedReq.photo_url }} style={styles.modalPhoto} />
                  )}

                  {isMine && (
                    <View style={styles.modalActionsRow}>
                      <Pressable 
                        style={[styles.modalBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 }]}
                        onPress={() => {
                          const reqId = selectedReq.id;
                          setSelectedReq(null);
                          router.push({ pathname: '/(tenant)/room/edit-request', params: { requestId: reqId, propertyId, roomId } } as any);
                        }}
                      >
                        <Text style={[styles.modalBtnText, { color: Theme.colors.primary }]}>Edit Request</Text>
                      </Pressable>
                      <Pressable 
                        style={[styles.modalBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1 }]}
                        onPress={() => handleDelete(selectedReq.id)}
                      >
                        <Text style={[styles.modalBtnText, { color: Theme.colors.danger }]}>Delete</Text>
                      </Pressable>
                    </View>
                  )}
                </ScrollView>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  fab: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: Theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: Theme.colors.mutedFg,
    fontWeight: '800',
  },
  modalPhoto: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: Theme.colors.muted,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.fg,
  },
  tenantName: {
    fontSize: 11,
    color: Theme.colors.mutedFg,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: Theme.colors.mutedFg,
    marginBottom: 12,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 11,
    color: Theme.colors.mutedFg,
  },
});
