import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { getTenantColor, getTenantTextColor } from '../ui/AvatarCluster';
import { Ionicons } from '@expo/vector-icons';
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

const getChoreIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('bin') || n.includes('trash') || n.includes('garbage') || n.includes('rubbish')) return 'trash-outline';
  if (n.includes('bath') || n.includes('toilet') || n.includes('shower')) return 'water-outline';
  if (n.includes('kitchen') || n.includes('dish')) return 'restaurant-outline';
  if (n.includes('vacuum') || n.includes('floor') || n.includes('sweep') || n.includes('mop') || n.includes('clean')) return 'sparkles-outline';
  if (n.includes('hall') || n.includes('corridor') || n.includes('stair') || n.includes('steps')) return 'footsteps-outline';
  if (n.includes('living') || n.includes('lounge') || n.includes('tv')) return 'tv-outline';
  if (n.includes('laundry') || n.includes('cloth') || n.includes('wash')) return 'shirt-outline';
  if (n.includes('plant') || n.includes('garden') || n.includes('water') || n.includes('lawn')) return 'leaf-outline';
  if (n.includes('pet') || n.includes('dog') || n.includes('cat') || n.includes('feed')) return 'paw-outline';
  return 'clipboard-outline';
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

  // Calculate this week's date range (Monday to Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0=Mon, 6=Sun
  const first = new Date(today.getTime());
  first.setDate(today.getDate() - dayOfWeek);
  const last = new Date(today.getTime());
  last.setDate(today.getDate() - dayOfWeek + 6);
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekDatesStr = `${formatDate(first)} - ${formatDate(last)} (Mon - Sun)`;

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
        const days = chore.days_of_week || [];
        const daysStr = days.map((d: number) => DAYS[d]).join(", ");
        let dateBadge = "";
        if (days.length > 0) {
          const minDayOffset = Math.min(...days.map((d: number) => d === 0 ? 6 : d - 1));
          const targetDate = new Date(first);
          targetDate.setDate(first.getDate() + minDayOffset);
          dateBadge = `${targetDate.getDate()} ${targetDate.toLocaleDateString('en-US', { month: 'short' })}`;
        }
        
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
                <Ionicons name={getChoreIcon(chore.name) as any} size={20} color={C.fg} />
              </View>

              <View style={styles.choreInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.choreName}>{chore.name}</Text>
                  <View style={[styles.choreStatusBadge, { backgroundColor: ss.bg }]}>
                    <Text style={[styles.choreStatusText, { color: ss.fg }]}>{ss.label}</Text>
                  </View>
                </View>
                <Text style={styles.choreSchedule}>
                  {chore.frequency}{daysStr ? ` · ${daysStr}` : ''}{dateBadge ? ` · ${dateBadge}` : ''}
                </Text>
              </View>

              {current && (
                <View style={styles.choreCurrentAssignee}>
                  <View style={[styles.choreAvatar, { backgroundColor: getTenantColor(current.id) }]}>
                    <Text style={[styles.choreAvatarText, { color: getTenantTextColor(current.id) }]}>{current.initials}</Text>
                  </View>
                  <Text style={styles.choreCurrentName} numberOfLines={1}>
                    {current.name.split(' ')[0]}
                  </Text>
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
                      <View style={[styles.rotationAvatar, { backgroundColor: getTenantColor(p.id) }]}>
                        <Text style={[styles.rotationAvatarText, { color: getTenantTextColor(p.id) }]}>{p.initials}</Text>
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
                  router.navigate({
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
            
            <View style={{ height: 80 }} />
    </ScrollView>
          </View>
        </View>
      </Modal>
      
    
    <View style={{ height: 80 }} />
    </ScrollView>
  );
}


