import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { C, styles } from './propertyStyles';

interface Props {
  chores: any[];
  expandedChore: string | null;
  setExpandedChore: (id: string | null) => void;
  tenantMap: Record<string, any>;
}

const statusStyle: Record<string, { bg: string; fg: string; label: string }> = {
  pending: { bg: C.muted,    fg: C.mutedFg,  label: "Pending"  },
  done:    { bg: "#D1FAE5",  fg: "#065F46",  label: "Done ✓"   },
  missed:  { bg: "#FEE2E2",  fg: "#991B1B",  label: "Missed"   },
};

const getIconForChore = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('kitchen')) return '🍳';
  if (n.includes('bath')) return '🚿';
  if (n.includes('bin')) return '🗑️';
  if (n.includes('hall')) return '🧹';
  if (n.includes('garden')) return '🪴';
  return '📋';
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PropertyDutiesSubTab({
  chores,
  expandedChore,
  setExpandedChore,
  tenantMap,
}: Props) {
  const router = useRouter();
  const [selectedChore, setSelectedChore] = useState<any | null>(null);
  
  const doneCount = chores.filter(c => c.status === 'done').length;

  // Calculate this week's date range
  const today = new Date();
  const first = new Date(today.getTime());
  first.setDate(today.getDate() - today.getDay());
  const last = new Date(today.getTime());
  last.setDate(today.getDate() - today.getDay() + 6);
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekDatesStr = `${formatDate(first)} - ${formatDate(last)}`;

  return (
    <ScrollView 
      contentContainerStyle={[styles.tabContentContainer, { paddingHorizontal: 16, paddingTop: 16 }]}
    >
      {/* Week header */}
      <View style={styles.weekHeader}>
        <View>
          <Text style={styles.weekHeaderTitle}>This Week</Text>
          <Text style={styles.weekHeaderDate}>{weekDatesStr}</Text>
        </View>
        <View style={styles.weekHeaderBadge}>
          <Text style={styles.weekHeaderBadgeText}>{doneCount}/{chores.length} done</Text>
        </View>
      </View>

      {/* Chore cards */}
      {chores.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: C.mutedFg }}>No chores assigned yet.</Text>
        </View>
      ) : chores.map((chore: any) => {
        const ss = statusStyle[chore.status || 'pending'] || statusStyle.pending;
        const isExpanded = expandedChore === chore.id;
        const daysStr = (chore.days_of_week || []).map((d: number) => DAYS[d]).join(", ");
        
        // Resolve current assignee
        const rotation = chore.rotation_order || [];
        const currentIndex = chore.current_assignee_index || 0;
        const currentAssigneeId = rotation.length > 0 ? rotation[currentIndex % rotation.length] : null;
        const current = currentAssigneeId ? tenantMap[currentAssigneeId] : null;

        return (
          <Pressable 
            key={chore.id} 
            style={[
              styles.choreCard, 
              { borderColor: chore.status === "done" ? "#D1FAE5" : chore.status === "missed" ? "#FEE2E2" : C.border }
            ]}
            onPress={() => setSelectedChore(chore)}
          >
            <View style={styles.choreMainRow}>
              <View style={styles.choreIconBox}>
                <Text style={styles.choreIcon}>{getIconForChore(chore.name)}</Text>
              </View>

              <View style={styles.choreInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.choreName}>{chore.name}</Text>
                  <View style={[styles.choreStatusBadge, { backgroundColor: ss.bg }]}>
                    <Text style={[styles.choreStatusText, { color: ss.fg }]}>{ss.label}</Text>
                  </View>
                </View>
                <Text style={styles.choreSchedule}>{chore.frequency} · {daysStr}</Text>
              </View>

              {current && (
                <View style={styles.choreCurrentAssignee}>
                  <View style={[styles.choreAvatar, { backgroundColor: current.color }]}>
                    <Text style={styles.choreAvatarText}>{current.initials}</Text>
                  </View>
                  <Text style={styles.choreCurrentName}>{current.name}</Text>
                </View>
              )}

              <Text style={styles.chevronIcon}>›</Text>
            </View>
          </Pressable>
        );
      })}

      {/* Rotation Modal */}
      <Modal visible={!!selectedChore} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedChore?.name}</Text>
              <Pressable onPress={() => setSelectedChore(null)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>×</Text>
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.rotationTitle}>Current Rotation</Text>
              <View style={{ gap: 12, marginBottom: 24 }}>
                {selectedChore?.rotation_order?.map((tId: string, i: number) => {
                  const p = tenantMap[tId];
                  if (!p) return null;
                  const isCurrent = i === (selectedChore?.current_assignee_index || 0) % (selectedChore?.rotation_order?.length || 1);
                  return (
                    <View key={i} style={styles.rotationRow}>
                      <View style={[styles.rotationIndexBadge, isCurrent && { backgroundColor: C.primary }]}>
                        <Text style={[styles.rotationIndexText, isCurrent && { color: '#fff' }]}>{i + 1}</Text>
                      </View>
                      <View style={[styles.rotationAvatar, { backgroundColor: p.color }]}>
                        <Text style={styles.rotationAvatarText}>{p.initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rotationName, isCurrent && { color: C.primary, fontWeight: '700' }]}>{p.name}</Text>
                        {isCurrent && <Text style={styles.thisWeekText}>This week's assignee</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.choreActions}>
                <Pressable style={styles.editChoreBtn} onPress={() => {
                  if (!selectedChore) return;
                  const id = selectedChore.id;
                  const propertyId = selectedChore.property_id;
                  setSelectedChore(null);
                  router.push({
                    pathname: '/(landlord)/property/assign-chore',
                    params: { propertyId, choreId: id }
                  } as any);
                }}>
                  <Text style={styles.editChoreBtnText}>Edit Chore</Text>
                </Pressable>
                <Pressable style={styles.deleteChoreBtn} onPress={async () => {
                  if (!selectedChore) return;
                  const idToDelete = selectedChore.id;
                  setSelectedChore(null);
                  await supabase.from('chores').delete().eq('id', idToDelete);
                }}>
                  <Text style={styles.deleteChoreBtnText}>Delete</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
