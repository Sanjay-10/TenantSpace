import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Theme } from '../../../constants/theme';
import { supabase } from '../../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Removed emoji helper

export function DutiesSubTab({ chores = [], tenantId, tenantMap = {} }: { chores?: any[], tenantId?: string, tenantMap?: Record<string, any> }) {
  const [loadingChore, setLoadingChore] = useState<string | null>(null);
  const [selectedChore, setSelectedChore] = useState<any | null>(null);

  const doneCount = chores.filter(c => c.status === 'done').length;

  const handleMarkDone = async (chore: any) => {
    setLoadingChore(chore.id);
    try {
      const { error } = await supabase.from('chores').update({ status: 'done' }).eq('id', chore.id);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to update chore:", err);
    } finally {
      setLoadingChore(null);
    }
  };

  // Calculate this week's date range
  const today = new Date();
  const first = new Date(today.getTime());
  first.setDate(today.getDate() - today.getDay());
  const last = new Date(today.getTime());
  last.setDate(today.getDate() - today.getDay() + 6);
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekDatesStr = `${formatDate(first)} - ${formatDate(last)}`;

  return (
    <View style={styles.container}>
      {/* Week Header */}
      <View style={styles.weekHeader}>
        <View>
          <Text style={styles.weekHeaderTitle}>This Week</Text>
          <Text style={styles.weekHeaderDate}>{weekDatesStr}</Text>
        </View>
        <View style={styles.weekHeaderBadge}>
          <Text style={styles.weekHeaderBadgeText}>{doneCount}/{chores.length} done</Text>
        </View>
      </View>

      {chores.length === 0 ? (
        <View style={styles.mockCard}>
          <Text style={styles.mockTitle}>No Chores</Text>
          <Text style={styles.mockSub}>There are no chores assigned yet.</Text>
        </View>
      ) : (
        chores.map(chore => {
          const rotation = chore.rotation_order || [];
          const currentIndex = chore.current_assignee_index || 0;
          const currentAssigneeId = rotation.length > 0 ? rotation[currentIndex % rotation.length] : null;
          const currentPerson = currentAssigneeId ? tenantMap[currentAssigneeId] : null;
          
          const isMyDuty = currentAssigneeId === tenantId;
          const isDone = chore.status === 'done';
          const daysStr = (chore.days_of_week || []).map((d: number) => DAYS[d]).join(", ");

          return (
            <Pressable key={chore.id} style={styles.choreCard} onPress={() => setSelectedChore(chore)}>
              <View style={styles.choreMainRow}>
                <View style={styles.choreIconBox}>
                  <Ionicons name="clipboard-outline" size={20} color={Theme.colors.fg} />
                </View>

                <View style={styles.choreInfo}>
                  <Text style={styles.choreName}>{chore.name}</Text>
                  <Text style={styles.choreSchedule}>{chore.frequency} · {daysStr}</Text>
                </View>
              </View>

              <View style={styles.choreFooter}>
                {isMyDuty ? (
                  isDone ? (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>Done ✓</Text>
                    </View>
                  ) : (
                    <Pressable 
                      style={styles.markDoneBtn} 
                      onPress={() => handleMarkDone(chore)}
                      disabled={loadingChore === chore.id}
                    >
                      {loadingChore === chore.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.markDoneBtnText}>Mark as Done</Text>
                      )}
                    </Pressable>
                  )
                ) : (
                  <View style={styles.assigneeRow}>
                    {currentPerson ? (
                      <>
                        <View style={[styles.avatar, { backgroundColor: currentPerson.color }]}>
                          <Text style={styles.avatarText}>{currentPerson.initials}</Text>
                        </View>
                        <Text style={styles.assigneeText}>
                          {currentPerson.name} {isDone ? '(Done ✓)' : ''}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.assigneeText}>Unassigned</Text>
                    )}
                  </View>
                )}
              </View>
            </Pressable>
          );
        })
      )}

      {/* Rotation Modal */}
      <Modal visible={!!selectedChore} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedChore?.name} Rotation</Text>
              <Pressable onPress={() => setSelectedChore(null)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>×</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={{ gap: 12 }}>
                {selectedChore?.rotation_order?.map((tId: string, i: number) => {
                  const p = tenantMap[tId];
                  if (!p) return null;
                  const isCurrent = i === (selectedChore?.current_assignee_index || 0) % (selectedChore?.rotation_order?.length || 1);
                  return (
                    <View key={i} style={styles.rotationRow}>
                      <View style={[styles.rotationIndexBadge, isCurrent && { backgroundColor: Theme.colors.primary }]}>
                        <Text style={[styles.rotationIndexText, isCurrent && { color: '#fff' }]}>{i + 1}</Text>
                      </View>
                      <View style={[styles.avatar, { backgroundColor: p.color, width: 36, height: 36, borderRadius: 18 }]}>
                        <Text style={[styles.avatarText, { fontSize: 13 }]}>{p.initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rotationName, isCurrent && { color: Theme.colors.primary, fontWeight: '700' }]}>{p.name}</Text>
                        {isCurrent && <Text style={styles.thisWeekText}>This week</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  weekHeader: { backgroundColor: Theme.colors.accent, borderRadius: 14, padding: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  weekHeaderTitle: { fontSize: 12, fontWeight: '700', color: Theme.colors.primary },
  weekHeaderDate: { fontSize: 11, color: '#1D4ED8', marginTop: 2 },
  weekHeaderBadge: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: Theme.colors.primary, borderRadius: 20 },
  weekHeaderBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  
  choreCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Theme.colors.border, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  choreMainRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  choreIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: Theme.colors.muted, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  choreIcon: { fontSize: 20 },
  choreInfo: { flex: 1 },
  choreName: { fontSize: 14, fontWeight: '800', color: Theme.colors.fg, marginBottom: 4 },
  choreSchedule: { fontSize: 11, color: Theme.colors.mutedFg },
  
  choreFooter: { borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 12 },
  markDoneBtn: { backgroundColor: Theme.colors.primary, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  markDoneBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  doneBadge: { backgroundColor: '#ECFDF5', paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#A7F3D0' },
  doneBadgeText: { color: '#059669', fontSize: 12, fontWeight: '700' },
  
  assigneeRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  assigneeText: { fontSize: 14, color: Theme.colors.fg, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.fg },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Theme.colors.muted, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 20, color: Theme.colors.mutedFg, marginTop: -2 },
  modalScroll: { paddingBottom: 40 },
  
  rotationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  rotationIndexBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: Theme.colors.muted, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rotationIndexText: { fontSize: 12, fontWeight: '700', color: Theme.colors.mutedFg },
  rotationName: { fontSize: 15, fontWeight: '600', color: Theme.colors.fg },
  thisWeekText: { fontSize: 12, color: Theme.colors.primary, fontWeight: '600', marginTop: 2 },
  
  mockCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  mockTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.fg, marginBottom: 8 },
  mockSub: { fontSize: 13, color: Theme.colors.mutedFg, textAlign: 'center', lineHeight: 20 },
});
