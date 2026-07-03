import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { styles } from './propertyStyles';
import { PropertyDutiesSubTab } from './PropertyDutiesSubTab';
import { PropertyAnnouncementsSubTab } from './PropertyAnnouncementsSubTab';
import { PropertyRequestsSubTab } from './PropertyRequestsSubTab';

interface Props {
  id: string;
  chores: any[];
  announcements: any[];
  maintenanceRequests: any[];
  updatesSubTab: string;
  setUpdatesSubTab: (t: string) => void;
  expandedChore: string | null;
  setExpandedChore: (id: string | null) => void;
  tenantMap: Record<string, any>;
  setEditAnnId: (id: string | null) => void;
  setAnnTitle: (title: string) => void;
  setAnnBody: (body: string) => void;
  setAnnExpiry: (expiry: number) => void;
  setIsCustomExpiry: (isCustom: boolean) => void;
  setShowAnnModal: (show: boolean) => void;
  setAnnouncements: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function UpdatesTab({
  id,
  chores,
  announcements,
  maintenanceRequests,
  updatesSubTab,
  setUpdatesSubTab,
  expandedChore,
  setExpandedChore,
  tenantMap,
  setEditAnnId,
  setAnnTitle,
  setAnnBody,
  setAnnExpiry,
  setIsCustomExpiry,
  setShowAnnModal,
  setAnnouncements,
}: Props) {
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
        <PropertyDutiesSubTab 
          chores={chores}
          expandedChore={expandedChore}
          setExpandedChore={setExpandedChore}
          tenantMap={tenantMap}
        />
      )}

      {updatesSubTab === 'Announcements' && (
        <PropertyAnnouncementsSubTab 
          announcements={announcements}
          setEditAnnId={setEditAnnId}
          setAnnTitle={setAnnTitle}
          setAnnBody={setAnnBody}
          setAnnExpiry={setAnnExpiry}
          setIsCustomExpiry={setIsCustomExpiry}
          setShowAnnModal={setShowAnnModal}
          setAnnouncements={setAnnouncements}
        />
      )}

      {updatesSubTab === 'Requests' && (
        <PropertyRequestsSubTab 
          propertyId={id}
          requests={maintenanceRequests}
          tenantMap={tenantMap}
        />
      )}
    </View>
  );
}
