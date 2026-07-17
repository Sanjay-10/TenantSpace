import React from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getTenantColor, getTenantTextColor } from '../ui/AvatarCluster';
import { C, styles } from './propertyStyles';

interface Props {
  id: string;
  rooms: any[];
  renderPropertyHero: () => React.ReactNode;
}

export default function RoomsTab({ id, rooms, renderPropertyHero }: Props) {
  const router = useRouter();

  return (
    <ScrollView 
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentContainer}
    >
      {renderPropertyHero()}
      
      <View style={styles.listContainer}>


        {rooms.map(r => (
          <Pressable 
            key={r.id} 
            style={({ pressed }) => [styles.listItemCard, pressed && { opacity: 0.9 }]}
            onPress={() => router.navigate(`/(landlord)/room/${r.id}` as any)}
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
              {(() => {
                const tenants = r.tenants || [];
                const max = 3;
                
                if (tenants.length <= max) {
                  return [...tenants].reverse().map((t, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.tenantAvatar, 
                        { 
                          backgroundColor: getTenantColor(t.id),
                          marginLeft: i === tenants.length - 1 ? 0 : -10 
                        }
                      ]}
                    >
                      <Text style={[styles.tenantAvatarText, { color: getTenantTextColor(t.id) }]}>{t.initials}</Text>
                    </View>
                  ));
                }
                
                const visible = [...tenants].slice(0, max - 1).reverse();
                const remaining = tenants.length - (max - 1);
                
                return (
                  <>
                    <View style={[styles.tenantAvatar, { backgroundColor: C.primary, marginLeft: -10 }]}>
                      <Text style={[styles.tenantAvatarText, { color: '#ffffff', fontSize: 10 }]}>+{remaining}</Text>
                    </View>
                    {visible.map((t, i) => (
                      <View 
                        key={i} 
                        style={[
                          styles.tenantAvatar, 
                          { 
                            backgroundColor: getTenantColor(t.id),
                            marginLeft: i === visible.length - 1 ? 0 : -10 
                          }
                        ]}
                      >
                        <Text style={[styles.tenantAvatarText, { color: getTenantTextColor(t.id) }]}>{t.initials}</Text>
                      </View>
                    ))}
                  </>
                );
              })()}
            </View>
            <Text style={styles.chevronIcon}>›</Text>
          </Pressable>
        ))}
      </View>
      
    
    <View style={{ height: 80 }} />
    </ScrollView>
  );
}


