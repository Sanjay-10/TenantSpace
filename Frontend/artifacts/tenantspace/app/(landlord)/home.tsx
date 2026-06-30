import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';

const C = {
  bg: "#F8FAFC", card: "#FFFFFF", fg: "#0F172A", muted: "#F1F5F9",
  mutedFg: "#64748B", border: "#E2E8F0", primary: "#2563EB",
  primaryLight: "#EFF6FF", success: "#10B981", successLight: "#ECFDF5",
  warning: "#F59E0B", warningLight: "#FFFBEB", danger: "#EF4444",
  g1: "#1D4ED8", g3: "#3B82F6",
};

interface Property {
  id: string;
  name: string;
  address: string;
  rooms: number;
  tenants: number;
  rent: number;
  since: string;
  status: "active" | "past";
  alerts: number;
  unreadChats: number;
}

export default function LandlordHomeScreen() {
  const { profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const { data: properties = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['landlordProperties', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // ONE SINGLE API CALL to get everything!
      const { data, error } = await supabase
        .from('properties')
        .select('*, rooms(id, monthly_rent, tenant_memberships(id, status))')
        .eq('landlord_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const props = data || [];
      return props.map((property: any) => {
        const rooms = property.rooms || [];
        const roomCount = rooms.length;
        
        let tenantCount = 0;
        let propertyExpected = 0;

        rooms.forEach((r: any) => {
          propertyExpected += (r.monthly_rent || 0);
          const activeMemberships = r.tenant_memberships?.filter((m: any) => m.status === 'active') || [];
          tenantCount += activeMemberships.length;
        });

        // Format created_at to "Mon YYYY"
        const date = new Date(property.created_at);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        return {
          id: property.id,
          name: property.name,
          address: property.address,
          rooms: roomCount,
          tenants: tenantCount,
          rent: propertyExpected,
          since: `${month} ${year}`,
          status: "active" as "active" | "past",
          alerts: 0,
          unreadChats: 0,
        };
      });
    },
    enabled: !!profile?.id,
  });

  const onRefresh = async () => {
    setManualRefreshing(true);
    await refetch();
    setManualRefreshing(false);
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SM';

  if (loading && !manualRefreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  // EMPTY STATE
  if (properties.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ height: insets.top, backgroundColor: C.card }} />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Welcome 👋</Text>
            <Text style={styles.nameText}>{profile?.full_name || 'Landlord'}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContentEmpty}
          refreshControl={<RefreshControl refreshing={manualRefreshing} onRefresh={onRefresh} tintColor={C.primary} />}
        >
          {/* Hero illustration card */}
          <LinearGradient
            colors={[C.g1, C.g3]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyHeroCard}
          >
            <View style={styles.emptyCircle1} />
            <View style={styles.emptyCircle2} />

            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIconText}>🏘️</Text>
            </View>
            <Text style={styles.emptyHeroTitle}>No properties yet</Text>
            <Text style={styles.emptyHeroSubtitle}>
              Add your first property to start managing rooms, tenants, and rent.
            </Text>
          </LinearGradient>

          {/* Primary CTA */}
          <Pressable 
            style={({ pressed }) => [styles.emptyPrimaryCta, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/(landlord)/property/add')}
          >
            <Text style={styles.emptyPrimaryCtaIcon}>+</Text>
            <Text style={styles.emptyPrimaryCtaText}>Add Your First Property</Text>
          </Pressable>

          {/* What you can do */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>WHAT YOU CAN DO</Text>
            <View style={styles.featuresList}>
              {[
                { icon: "🚪", title: "Manage rooms", body: "Add rooms with rent, deposit, and details." },
                { icon: "👥", title: "Invite tenants", body: "Generate invite codes for tenants to join." },
                { icon: "💸", title: "Track rent", body: "See who's paid and who's pending each month." },
                { icon: "🛠️", title: "Handle requests", body: "Receive and resolve maintenance requests." },
              ].map(f => (
                <View key={f.title} style={styles.featureRow}>
                  <View style={styles.featureIconContainer}>
                    <Text style={styles.featureIconText}>{f.icon}</Text>
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitleText}>{f.title}</Text>
                    <Text style={styles.featureBodyText}>{f.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Footer hint */}
          <View style={styles.footerHint}>
            <Text style={styles.footerHintText}>
              Are you a tenant?{' '}
              <Text style={styles.footerHintLink} onPress={() => {}}>Switch to tenant mode</Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ACTIVE STATE (1+ Properties)
  const current = properties.filter(p => p.status === 'active');
  const previous = properties.filter(p => p.status === 'past');

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: C.card }} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Welcome back 👋</Text>
          <Text style={styles.nameText}>My Properties</Text>
        </View>
        <View style={styles.activeHeaderActions}>
          <Pressable 
            style={styles.headerIconButton}
            onPress={() => router.push('/(landlord)/property/add')}
          >
            <Text style={styles.headerIconText}>+</Text>
          </Pressable>
          <Pressable 
            style={styles.headerIconButton}
            onPress={signOut}
          >
            <Text style={styles.headerIconText}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContentActive}
        refreshControl={<RefreshControl refreshing={manualRefreshing} onRefresh={onRefresh} />}
      >
        {/* Current Properties */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>CURRENT</Text>
          <View style={styles.propertiesList}>
            {current.map(p => (
              <Pressable 
                key={p.id}
                onPress={() => router.push(`/(landlord)/property/${p.id}`)}
                style={({ pressed }) => [
                  styles.activePropCard,
                  pressed && { opacity: 0.95 }
                ]}
              >
                {/* Gradient header */}
                <LinearGradient
                  colors={[C.g1, C.g3]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activePropGradient}
                >
                  <View style={styles.activePropCircle1} />
                  <View style={styles.activePropCircle2} />
                  
                  <View style={styles.activePropHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activePropName}>{p.name}</Text>
                      <Text style={styles.activePropAddress}>{p.address}</Text>
                    </View>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>● Active</Text>
                    </View>
                  </View>

                  <View style={styles.activePropStatsRow}>
                    {[
                      { label: "Rooms", value: String(p.rooms) },
                      { label: "Tenants", value: String(p.tenants) },
                      { label: "Rent/mo", value: `$${p.rent.toLocaleString()}` },
                      { label: "Since", value: p.since },
                    ].map(s => (
                      <View key={s.label}>
                        <Text style={styles.activePropStatLabel}>{s.label}</Text>
                        <Text style={styles.activePropStatValue}>{s.value}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>

                {/* Compact hint row */}
                <View style={styles.activePropHintRow}>
                  <View style={styles.activePropHintLeft}>
                    <View style={[
                      styles.activePropHintDot, 
                      { backgroundColor: p.alerts > 0 ? C.danger : C.success }
                    ]} />
                    <Text style={styles.activePropHintText}>
                      {p.alerts > 0 ? `${p.alerts} requests · ${p.unreadChats} unread` : "All clear"}
                    </Text>
                  </View>
                  <Text style={styles.activePropHintArrow}>›</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Previous Properties */}
        {previous.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>PREVIOUS</Text>
            <View style={styles.propertiesList}>
              {previous.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/(landlord)/property/${p.id}`)}
                  style={({ pressed }) => [
                    styles.pastPropCard,
                    pressed && { opacity: 0.95 }
                  ]}
                >
                  <View style={styles.pastPropIconContainer}>
                    <Text style={styles.pastPropIcon}>🏠</Text>
                  </View>
                  <View style={styles.pastPropTextContainer}>
                    <Text style={styles.pastPropName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.pastPropAddress} numberOfLines={1}>{p.address}</Text>
                    <Text style={styles.pastPropDate}>{p.since} – {p.status}</Text>
                  </View>
                  <Text style={styles.pastPropArrow}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: C.card,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    fontSize: 12,
    color: C.mutedFg,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: C.fg,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: C.primary,
  },
  activeHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 20,
    color: C.mutedFg,
    fontWeight: '700',
  },

  /* Empty State Styles */
  scrollContentEmpty: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyHeroCard: {
    width: '100%',
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  emptyCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  emptyCircle2: {
    position: 'absolute',
    left: -40,
    bottom: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  emptyIconText: {
    fontSize: 36,
  },
  emptyHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  emptyHeroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 19.5, // 1.5 * 13
  },
  emptyPrimaryCta: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  emptyPrimaryCtaIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  emptyPrimaryCtaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  featuresCard: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.mutedFg,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  featuresList: {
    flexDirection: 'column',
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: 18,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.fg,
  },
  featureBodyText: {
    fontSize: 12,
    color: C.mutedFg,
    marginTop: 2,
    lineHeight: 16.8, // 1.4 * 12
  },
  footerHint: {
    marginTop: 4,
  },
  footerHintText: {
    fontSize: 12,
    color: C.mutedFg,
    textAlign: 'center',
  },
  footerHintLink: {
    color: C.primary,
    fontWeight: '600',
  },

  /* Active State Styles */
  scrollContentActive: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 24,
  },
  sectionContainer: {
    // Gap handled by scrollContentActive
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.mutedFg,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  propertiesList: {
    gap: 12,
  },
  activePropCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  activePropGradient: {
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  activePropCircle1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  activePropCircle2: {
    position: 'absolute',
    right: -60,
    top: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  activePropHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  activePropName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  activePropAddress: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 3,
  },
  activeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  activePropStatsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  activePropStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 2,
  },
  activePropStatValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  activePropHintRow: {
    backgroundColor: C.card,
    paddingVertical: 9,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activePropHintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  activePropHintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activePropHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.mutedFg,
  },
  activePropHintArrow: {
    fontSize: 18,
    color: C.mutedFg,
  },
  pastPropCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pastPropIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastPropIcon: {
    fontSize: 22,
  },
  pastPropTextContainer: {
    flex: 1,
  },
  pastPropName: {
    fontSize: 14,
    fontWeight: '800',
    color: C.fg,
    marginBottom: 3,
  },
  pastPropAddress: {
    fontSize: 11,
    color: C.mutedFg,
    marginBottom: 4,
  },
  pastPropDate: {
    fontSize: 11,
    color: C.mutedFg,
  },
  pastPropArrow: {
    fontSize: 18,
    color: C.mutedFg,
  },
});
