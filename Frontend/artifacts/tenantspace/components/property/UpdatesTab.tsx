import React from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { C, styles } from './propertyStyles';

interface Props {
  id: string;
  chores: any[];
  announcements: any[];
  updatesSubTab: string;
  setUpdatesSubTab: (t: string) => void;
  expandedChore: string | null;
  setExpandedChore: (id: string | null) => void;
  tenantMap: Record<string, any>;
  refreshing: boolean;
  onRefresh: () => void;
  setEditAnnId: (id: string | null) => void;
  setAnnTitle: (title: string) => void;
  setAnnBody: (body: string) => void;
  setAnnExpiry: (expiry: number) => void;
  setIsCustomExpiry: (isCustom: boolean) => void;
  setShowAnnModal: (show: boolean) => void;
  setAnnouncements: React.Dispatch<React.SetStateAction<any[]>>;
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

export default function UpdatesTab({
  id,
  chores,
  announcements,
  updatesSubTab,
  setUpdatesSubTab,
  expandedChore,
  setExpandedChore,
  tenantMap,
  refreshing,
  onRefresh,
  setEditAnnId,
  setAnnTitle,
  setAnnBody,
  setAnnExpiry,
  setIsCustomExpiry,
  setShowAnnModal,
  setAnnouncements,
}: Props) {
  const router = useRouter();
  const doneCount = chores.filter(c => c.status === 'done').length;

  return (
    <View style={styles.tabContent}>
      {/* Sub-tabs segment control */}
      <View style={styles.updatesSegmentContainer}>
        {['Duties', 'Requests', 'Announcements'].map(tab => {
          const active = updatesSubTab === tab;
          return (
            <Pressable 
              key={tab} 
              onPress={() => setUpdatesSubTab(tab)}
              style={[styles.updatesSegmentBtn, active && styles.updatesSegmentBtnActive]}
            >
              <Text style={[styles.updatesSegmentText, active && styles.updatesSegmentTextActive]}>
                {tab}
              </Text>
              {tab === 'Requests' && (
                <View style={styles.requestsBadge}>
                  <Text style={styles.requestsBadgeText}>3</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {updatesSubTab === 'Duties' && (
        <ScrollView 
          contentContainerStyle={[styles.tabContentContainer, { paddingHorizontal: 16, paddingTop: 16 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Week header */}
          <View style={styles.weekHeader}>
            <View>
              <Text style={styles.weekHeaderTitle}>This Week</Text>
              <Text style={styles.weekHeaderDate}>29 Apr – 4 May 2026</Text>
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
          <View key={chore.id} style={[
            styles.choreCard, 
            { borderColor: chore.status === "done" ? "#D1FAE5" : chore.status === "missed" ? "#FEE2E2" : C.border }
          ]}>
            <Pressable 
              style={styles.choreMainRow}
              onPress={() => setExpandedChore(isExpanded ? null : chore.id)}
            >
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

              <Text style={[styles.chevronIcon, { transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }]}>
                ›
              </Text>
            </Pressable>

            {isExpanded && (
              <View style={styles.choreExpanded}>
                <Text style={styles.rotationTitle}>ROTATION</Text>
                <View style={{ gap: 6 }}>
                  {rotation.map((tenantId: string, i: number) => {
                    const p = tenantMap[tenantId];
                    if (!p) return null;
                    const isCurrent = i === currentIndex;
                    return (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[
                          styles.rotationIndexBadge,
                          { backgroundColor: isCurrent ? C.primary : C.border }
                        ]}>
                          <Text style={[
                            styles.rotationIndexText,
                            { color: isCurrent ? '#fff' : C.mutedFg }
                          ]}>{i + 1}</Text>
                        </View>
                        <View style={[
                          styles.rotationAvatar,
                          { backgroundColor: p.color, borderWidth: isCurrent ? 2 : 0, borderColor: C.primary }
                        ]}>
                          <Text style={styles.rotationAvatarText}>{p.initials}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={[
                            styles.rotationName,
                            { color: isCurrent ? C.primary : C.fg, fontWeight: isCurrent ? '800' : '600' }
                          ]}>{p.name}</Text>
                          <Text style={styles.rotationRoom}> · {p.roomName}</Text>
                        </View>
                        {isCurrent && (
                          <View style={styles.thisWeekBadge}>
                            <Text style={styles.thisWeekText}>This week</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
                <View style={styles.choreActions}>
                  <Pressable style={styles.editChoreBtn}>
                    <Text style={styles.editChoreBtnText}>Edit</Text>
                  </Pressable>
                  <Pressable style={styles.deleteChoreBtn}>
                    <Text style={styles.deleteChoreBtnText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        );
      })}
      <View style={{ height: 100 }} />
      </ScrollView>
      )}

      {updatesSubTab === 'Announcements' && (
        <ScrollView 
          contentContainerStyle={[styles.tabContentContainer, { paddingHorizontal: 16, paddingTop: 16 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {announcements.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: C.mutedFg }}>No announcements yet.</Text>
            </View>
          ) : announcements.map(ann => {
            // Calculate badge
            const expiresDate = new Date(ann.expires_at);
            const now = new Date();
            const diffTime = expiresDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isExpired = diffDays <= 0;
            
            // Format created_at date
            const createdDate = new Date(ann.created_at);
            const isToday = createdDate.toDateString() === now.toDateString();
            let dateStr = "";
            if (isToday) {
              dateStr = `Today, ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else {
              const diffTimeCreated = now.getTime() - createdDate.getTime();
              const diffDaysCreated = Math.ceil(diffTimeCreated / (1000 * 60 * 60 * 24));
              dateStr = diffDaysCreated === 1 ? '1 day ago' : `${diffDaysCreated} days ago`;
            }

            return (
              <View key={ann.id} style={styles.annCard}>
                <View style={styles.annHeaderRow}>
                  <View style={styles.annHeaderLeft}>
                    <Text style={styles.annIcon}>📢</Text>
                    <Text style={styles.annDate}>{dateStr}</Text>
                  </View>
                  <View style={[styles.annBadge, { backgroundColor: isExpired ? C.muted : "#D1FAE5" }]}>
                    <Text style={[styles.annBadgeText, { color: isExpired ? C.mutedFg : "#065F46" }]}>
                      {isExpired ? 'Expired' : `${diffDays} days left`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.annTitle}>{ann.title}</Text>
                <Text style={styles.annBody}>{ann.body}</Text>
                
                <View style={styles.annFooter}>
                  <View style={{ flex: 1 }} />
                  <View style={styles.annActions}>
                    <Pressable onPress={() => {
                      setEditAnnId(ann.id);
                      setAnnTitle(ann.title);
                      setAnnBody(ann.body);
                      const ed = isExpired ? 5 : diffDays;
                      setAnnExpiry(ed); 
                      setIsCustomExpiry(![1, 3, 5, 7].includes(ed));
                      setShowAnnModal(true);
                    }}>
                      <Text style={styles.annActionEditText}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={async () => {
                      const { error } = await supabase.from('announcements').delete().eq('id', ann.id);
                      if (error) {
                        Alert.alert('Error deleting', error.message);
                      } else {
                        // Update local state without fetching
                        setAnnouncements(prev => prev.filter(a => a.id !== ann.id));
                      }
                    }}>
                      <Text style={styles.annActionDeleteText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {updatesSubTab === 'Requests' && (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Requests functionality coming soon!</Text>
        </View>
      )}
    </View>
  );
}
