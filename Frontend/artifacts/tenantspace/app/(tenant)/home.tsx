import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface RoomDetails {
  id: string;
  name: string;
  monthly_rent: number;
  bills_included: boolean;
  property: {
    id: string;
    name: string;
    address: string;
    property_type: string;
  };
}

interface Roommate {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export default function TenantHomeScreen() {
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Membership State
  const [hasRoom, setHasRoom] = useState(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  
  // Join Room Form State
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fetchTenantData = async () => {
    if (!profile?.id) return;
    
    try {
      // 1. Fetch active membership
      const { data: memberships, error: memError } = await supabase
        .from('tenant_memberships')
        .select(`
          room_id,
          rooms (
            id,
            name,
            monthly_rent,
            bills_included,
            properties (
              id,
              name,
              address,
              property_type
            )
          )
        `)
        .eq('tenant_id', profile.id)
        .eq('status', 'active');

      if (memError) throw memError;

      if (memberships && memberships.length > 0) {
        const mem = memberships[0];
        const roomData = mem.rooms as any;
        const propData = roomData.properties;
        
        setRoomDetails({
          id: roomData.id,
          name: roomData.name,
          monthly_rent: roomData.monthly_rent,
          bills_included: roomData.bills_included,
          property: {
            id: propData.id,
            name: propData.name,
            address: propData.address,
            property_type: propData.property_type,
          }
        });
        setHasRoom(true);

        // 2. Fetch roommates (other active memberships in the same property/rooms)
        const { data: matesData } = await supabase
          .from('tenant_memberships')
          .select(`
            tenant_id,
            profiles (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('room_id', roomData.id)
          .eq('status', 'active')
          .neq('tenant_id', profile.id); // exclude current user

        const matesList: Roommate[] = [];
        matesData?.forEach((m: any) => {
          if (m.profiles) {
            matesList.push({
              id: m.profiles.id,
              full_name: m.profiles.full_name,
              avatar_url: m.profiles.avatar_url,
            });
          }
        });
        setRoommates(matesList);
      } else {
        setHasRoom(false);
        setRoomDetails(null);
        setRoommates([]);
      }
    } catch (err) {
      console.error('Error fetching tenant data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, [profile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenantData();
  };

  const handleJoinRoom = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter a valid invite code.');
      return;
    }

    Keyboard.dismiss();
    setJoining(true);
    try {
      // 1. Find room by invite code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single();

      if (roomError || !room) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Invalid Code', 'No room found matching this invite code. Please check and try again.');
        setJoining(false);
        return;
      }

      // 2. Check if already has active membership in this room
      const { data: existing } = await supabase
        .from('tenant_memberships')
        .select('id')
        .eq('tenant_id', profile?.id)
        .eq('room_id', room.id)
        .eq('status', 'active');

      if (existing && existing.length > 0) {
        Alert.alert('Already Joined', 'You are already a member of this room.');
        setJoining(false);
        return;
      }

      // 3. Create active tenant membership
      const { error: insertError } = await supabase
        .from('tenant_memberships')
        .insert({
          tenant_id: profile?.id,
          room_id: room.id,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
        });

      if (insertError) throw insertError;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Joined!', `Successfully joined ${room.name}!`);
      setInviteCode('');
      fetchTenantData();
    } catch (err) {
      console.error('Error joining room:', err);
      Alert.alert('Error', 'Failed to join room. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave this room? You will need a new invite code to join again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            if (!profile?.id || !roomDetails) return;
            try {
              const { error } = await supabase
                .from('tenant_memberships')
                .update({ status: 'ended', end_date: new Date().toISOString().split('T')[0] })
                .eq('tenant_id', profile.id)
                .eq('room_id', roomDetails.id);

              if (error) throw error;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              fetchTenantData();
            } catch (err) {
              console.error('Error leaving room:', err);
              Alert.alert('Error', 'Failed to leave room. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  // A. EMPTY STATE (No Room Membership)
  if (!hasRoom) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerWelcome}>Welcome 👋</Text>
              <Text style={styles.headerName}>{profile?.full_name}</Text>
            </View>
            <Pressable onPress={signOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>⚙️</Text>
            </Pressable>
          </View>

          {/* Hero Invitation Card */}
          <LinearGradient
            colors={[Theme.colors.g1, Theme.colors.g3]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Circles */}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />

            <View style={styles.heroIconWrapper}>
              <Text style={styles.heroIcon}>🔑</Text>
            </View>
            <Text style={styles.heroTitle}>Join a Property</Text>
            <Text style={styles.heroSubtitle}>
              Enter the unique invite code shared by your landlord or property manager to link your account.
            </Text>
          </LinearGradient>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.label}>Room Invite Code</Text>
            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              onFocus={() => setCodeFocused(true)}
              onBlur={() => setCodeFocused(false)}
              placeholder="e.g. MAPL-1-XYZ4"
              placeholderTextColor={Theme.colors.mutedFg}
              autoCapitalize="characters"
              autoCorrect={false}
              style={[
                styles.input,
                codeFocused && styles.inputFocused,
              ]}
            />

            <Pressable
              onPress={handleJoinRoom}
              disabled={joining}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
                joining && styles.ctaButtonDisabled,
              ]}
            >
              {joining ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaButtonText}>Join Room</Text>
              )}
            </Pressable>
          </View>

          {/* Guidelines info card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Need a code?</Text>
            <Text style={styles.infoCardText}>
              Ask your landlord or property manager to add the property on TenantSpace and share your specific Room Invite Code.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // B. ACTIVE ROOM DETAILS
  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <View style={[styles.header, styles.activeHeader]}>
        <View>
          <Text style={styles.headerWelcome}>My Home 🏡</Text>
          <Text style={styles.headerName}>{profile?.full_name}</Text>
        </View>
        <Pressable onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.activeScrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Room Header Banner */}
        <LinearGradient
          colors={[Theme.colors.g1, Theme.colors.g3]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeHeroCard}
        >
          <View style={styles.badgeRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{roomDetails?.property.property_type}</Text>
            </View>
            <View style={[styles.heroBadge, styles.roomBadge]}>
              <Text style={styles.heroBadgeText}>{roomDetails?.name}</Text>
            </View>
          </View>
          <Text style={styles.activeHeroTitle}>{roomDetails?.property.name}</Text>
          <Text style={styles.activeHeroAddress}>{roomDetails?.property.address}</Text>
        </LinearGradient>

        {/* Rent Detail Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Rent Summary</Text>
          <View style={styles.rentRow}>
            <View>
              <Text style={styles.rentLabel}>Monthly Rent</Text>
              <Text style={styles.rentValue}>${roomDetails?.monthly_rent}</Text>
            </View>
            <View style={styles.billsBadge}>
              <Text style={styles.billsBadgeText}>
                {roomDetails?.bills_included ? '⚡ Bills Included' : '🔌 Bills Extra'}
              </Text>
            </View>
          </View>
        </View>

        {/* Roommates Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Roommates</Text>
          {roommates.length === 0 ? (
            <Text style={styles.emptyMatesText}>No other roommates registered in this house yet.</Text>
          ) : (
            <View style={styles.matesList}>
              {roommates.map((mate) => (
                <View key={mate.id} style={styles.mateRow}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {mate.full_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.mateName}>{mate.full_name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZoneCard}>
          <Text style={styles.dangerTitle}>Leave Property</Text>
          <Text style={styles.dangerSubtitle}>
            Unlink your profile from this room and property details.
          </Text>
          <Pressable onPress={handleLeaveRoom} style={styles.leaveButton}>
            <Text style={styles.leaveButtonText}>Leave Room</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 16,
  },
  activeScrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginBottom: 10,
  },
  activeHeader: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
    marginBottom: 16,
  },
  headerWelcome: {
    fontSize: 12,
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.regular,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 20,
  },
  heroCard: {
    borderRadius: Theme.radius.xxl,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  circle1: {
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  circle2: {
    left: -40,
    bottom: -40,
    width: 160,
    height: 160,
  },
  heroIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroIcon: {
    fontSize: 30,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
    marginBottom: 6,
    fontFamily: Theme.fonts.bold,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Theme.fonts.regular,
  },
  formCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 20,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.mutedFg,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: Theme.fonts.bold,
  },
  input: {
    width: '100%',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    fontSize: 15,
    color: Theme.colors.fg,
    backgroundColor: Theme.colors.bg,
    fontFamily: Theme.fonts.regular,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1,
  },
  inputFocused: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.accent,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaButtonDisabled: {
    backgroundColor: Theme.colors.mutedFg,
    opacity: 0.5,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
  },
  infoCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 12,
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.regular,
    lineHeight: 16,
  },
  // ACTIVE STATE STYLES
  activeHeroCard: {
    borderRadius: Theme.radius.xl,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  heroBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  roomBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  activeHeroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    fontFamily: Theme.fonts.bold,
  },
  activeHeroAddress: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Theme.fonts.regular,
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.mutedFg,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: Theme.fonts.bold,
  },
  rentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  rentLabel: {
    fontSize: 12,
    color: Theme.colors.mutedFg,
  },
  rentValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
    marginTop: 2,
  },
  billsBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Theme.colors.bg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  billsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.fg,
  },
  emptyMatesText: {
    fontSize: 12,
    color: Theme.colors.mutedFg,
    fontStyle: 'italic',
    marginTop: 4,
  },
  matesList: {
    gap: 10,
    marginTop: 4,
  },
  mateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  mateName: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.fg,
  },
  dangerZoneCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.dangerLight,
    padding: 16,
    gap: 10,
    marginTop: 8,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.dangerDark,
  },
  dangerSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedFg,
    lineHeight: 16,
  },
  leaveButton: {
    paddingVertical: 12,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.danger,
    marginTop: 4,
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.dangerDark,
  },
});
