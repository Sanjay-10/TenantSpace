import React from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { C, styles } from './propertyStyles';

interface Props {
  id: string;
  rooms: any[];
  refreshing: boolean;
  onRefresh: () => void;
  renderPropertyHero: () => React.ReactNode;
}

export default function RoomsTab({ id, rooms, refreshing, onRefresh, renderPropertyHero }: Props) {
  const router = useRouter();

  return (
    <ScrollView 
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {renderPropertyHero()}
      
      <View style={styles.listContainer}>


        {rooms.map(r => (
          <Pressable 
            key={r.id} 
            style={({ pressed }) => [styles.listItemCard, pressed && { opacity: 0.9 }]}
            onPress={() => router.push(`/(landlord)/room/${r.id}` as any)}
          >
            <View style={styles.listItemIconContainer}>
              <Text style={styles.listItemIconText}>▦</Text>
            </View>
            <View style={styles.listItemTextContainer}>
              <Text style={styles.listItemTitle}>{r.name}</Text>
              <Text style={styles.listItemSubtitle}>
                {r.tenants?.length || 0} {(r.tenants?.length || 0) === 1 ? 'Tenant' : 'Tenants'}
              </Text>
            </View>
            <View style={styles.tenantAvatarsContainer}>
              {[...(r.tenants || [])].reverse().map((t, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.tenantAvatar, 
                    { 
                      backgroundColor: t.color,
                      marginLeft: i === (r.tenants?.length || 0) - 1 ? 0 : -10 
                    }
                  ]}
                >
                  <Text style={styles.tenantAvatarText}>{t.initials}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.chevronIcon}>›</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 90 }} />
    </ScrollView>
  );
}
