import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Theme } from '../../../constants/theme';
import { DutiesSubTab } from './DutiesSubTab';
import { RequestsSubTab } from './RequestsSubTab';
import { AnnouncementsSubTab } from './AnnouncementsSubTab';

type SubTab = 'duties' | 'requests' | 'announcements';

export function UpdatesTab({ 
  announcements = [], 
  landlordName, 
  chores = [], 
  maintenanceRequests = [],
  tenantId, 
  tenantMap = {},
  propertyId,
  roomId,
}: { 
  announcements?: any[], 
  landlordName?: string, 
  chores?: any[], 
  maintenanceRequests?: any[],
  tenantId?: string, 
  tenantMap?: Record<string, any>,
  propertyId?: string,
  roomId?: string,
}) {
  const [subTab, setSubTab] = useState<SubTab>('duties');

  return (
    <View style={styles.container}>
      {/* Sub-tab bar */}
      <View style={styles.subTabBar}>
        <View style={styles.segmentedControl}>
          <Pressable 
            style={[styles.segmentBtn, subTab === 'duties' && styles.segmentBtnActive]}
            onPress={() => setSubTab('duties')}
          >
            <Text style={[styles.segmentText, subTab === 'duties' && styles.segmentTextActive]}>Duties</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.segmentBtn, subTab === 'requests' && styles.segmentBtnActive]}
            onPress={() => setSubTab('requests')}
          >
            <Text style={[styles.segmentText, subTab === 'requests' && styles.segmentTextActive]}>Requests</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.segmentBtn, subTab === 'announcements' && styles.segmentBtnActive]}
            onPress={() => setSubTab('announcements')}
          >
            <Text style={[styles.segmentText, subTab === 'announcements' && styles.segmentTextActive]}>Announcements</Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {subTab === 'duties' && <DutiesSubTab chores={chores} tenantId={tenantId} tenantMap={tenantMap} />}
        {subTab === 'requests' && <RequestsSubTab requests={maintenanceRequests} propertyId={propertyId} roomId={roomId} tenantMap={tenantMap} />}
        {subTab === 'announcements' && <AnnouncementsSubTab announcements={announcements} landlordName={landlordName} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.bg },
  subTabBar: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  segmentedControl: { flexDirection: 'row', backgroundColor: Theme.colors.muted, borderRadius: 12, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  segmentBtnActive: { backgroundColor: '#fff', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 2 },
  segmentText: { fontSize: 13, fontWeight: '600', color: Theme.colors.mutedFg },
  segmentTextActive: { color: Theme.colors.primary, fontWeight: '700' },
  
  content: { padding: 16, flex: 1 },
});

