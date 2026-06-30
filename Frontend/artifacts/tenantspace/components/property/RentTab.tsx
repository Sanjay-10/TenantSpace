import React from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { C, styles } from './propertyStyles';

interface Props {
  rooms: any[];
  refreshing: boolean;
  onRefresh: () => void;
  renderPropertyHero: () => React.ReactNode;
}

export default function RentTab({ rooms, refreshing, onRefresh, renderPropertyHero }: Props) {
  return (
    <ScrollView 
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderPropertyHero()}
      
      <View style={styles.listContainer}>
        <View style={styles.rentActionsRow}>
          <Pressable style={styles.rentActionOutline}>
            <Text style={styles.rentActionOutlineText}>📤 Send Reminder</Text>
          </Pressable>
          <Pressable style={styles.rentActionPrimary}>
            <Text style={styles.rentActionPrimaryText}>+ Record Payment</Text>
          </Pressable>
        </View>

        {rooms.map(r => (
          <View key={r.id} style={styles.listItemCard}>
            <View style={styles.listItemIconContainer}>
              <Text style={styles.listItemIconText}>▦</Text>
            </View>
            <View style={styles.listItemTextContainer}>
              <Text style={styles.listItemTitle}>{r.name}</Text>
              <Text style={styles.listItemSubtitle}>
                {r.tenants?.length || 0} {(r.tenants?.length || 0) === 1 ? 'tenant' : 'tenants'} · ${r.monthly_rent}/mo
              </Text>
            </View>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: r.rentPaid ? '#D1FAE5' : '#FEF3C7' }
            ]}>
              <Text style={[
                styles.statusBadgeText,
                { color: r.rentPaid ? '#065F46' : '#92400E' }
              ]}>
                {r.rentPaid ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
