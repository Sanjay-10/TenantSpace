import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';

// Formatting helpers
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Unknown';
  const d = new Date(dateString);
  return d.toLocaleString('default', { month: 'short', year: 'numeric' });
};

export default function TenantHomeScreen() {
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Membership State
  const [currentMemberships, setCurrentMemberships] = useState<any[]>([]);
  const [pastMemberships, setPastMemberships] = useState<any[]>([]);
  
  // Join Room Form State
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fetchTenantData = async () => {
    if (!profile?.id) return;
    
    try {
      const { data: memberships, error: memError } = await supabase
        .from('tenant_memberships')
        .select(`
          id,
          status,
          created_at,
          room_id,
          rooms (
            id,
            name,
            monthly_rent,
            properties (
              id,
              name,
              address,
              property_type
            )
          )
        `)
        .eq('tenant_id', profile.id);

      if (memError) throw memError;

      const current = memberships?.filter(m => m.status === 'active') || [];
      const past = memberships?.filter(m => m.status === 'ended') || [];
      
      setCurrentMemberships(current);
      setPastMemberships(past);
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
    refetchPrevious();
  };

  const { data: previousRooms = [], refetch: refetchPrevious } = useQuery({
    queryKey: ['tenantPreviousRooms', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_previous_rooms')
        .select('*')
        .eq('tenant_id', profile?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const handleJoinRoom = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter a valid invite code.');
      return;
    }

    Keyboard.dismiss();
    setJoining(true);
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single();

      if (roomError || !room) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Invalid Code', 'No room found matching this invite code.');
        return;
      }

      const { data: existing } = await supabase
        .from('tenant_memberships')
        .select('id')
        .eq('tenant_id', profile?.id)
        .eq('room_id', room.id)
        .eq('status', 'active');

      if (existing && existing.length > 0) {
        Alert.alert('Already Joined', 'You are already a member of this room.');
        return;
      }

      const { error: insertError } = await supabase
        .from('tenant_memberships')
        .insert({
          tenant_id: profile?.id,
          room_id: room.id,
          status: 'active'
        });

      if (insertError) throw insertError;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInviteCode('');
      fetchTenantData();
    } catch (err) {
      console.error('Error joining room:', err);
      Alert.alert('Error', 'Failed to join room. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const hasHomes = currentMemberships.length > 0 || pastMemberships.length > 0 || previousRooms.length > 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Top Navigation / Status Bar Area */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={styles.headerWelcome}>Hi, {profile?.full_name?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={styles.headerName}>{hasHomes ? 'My Homes' : 'Welcome'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {hasHomes && (
            <Pressable style={styles.iconButton} onPress={() => setShowAddMenu(true)}>
              <Ionicons name="add-outline" size={24} color="#0F172A" />
            </Pressable>
          )}
          <Pressable onPress={() => router.navigate('/(tenant)/settings')} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color="#0F172A" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {!hasHomes ? (
          /* EMPTY STATE */
          <View style={styles.emptyStateContainer}>
            <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.heroGradient}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
              
              <View style={styles.heroIconWrap}>
                <Ionicons name="business-outline" size={48} color="#fff" />
              </View>
              <Text style={styles.heroTitle}>No homes yet</Text>
              <Text style={styles.heroSub}>Join your first room with the invite code your landlord sent you.</Text>
            </LinearGradient>

            <View style={styles.formBox}>
              <Text style={styles.formLabel}>INVITE CODE</Text>
              <TextInput
                style={styles.formInput}
                value={inviteCode}
                onChangeText={text => setInviteCode(text.toUpperCase())}
                placeholder="e.g. MAPLE-2B-9X4P"
                placeholderTextColor={Theme.colors.mutedFg}
                autoCapitalize="characters"
              />
              <Pressable 
                style={[styles.formBtn, !inviteCode && { backgroundColor: Theme.colors.muted }]} 
                disabled={!inviteCode || joining}
                onPress={handleJoinRoom}
              >
                {joining ? <ActivityIndicator color="#fff" /> : <Text style={[styles.formBtnText, !inviteCode && { color: Theme.colors.mutedFg }]}>Join Room</Text>}
              </Pressable>
            </View>

            <View style={styles.helpBox}>
              <View style={styles.helpIconWrap}>
                <Ionicons name="bulb-outline" size={24} color="#EAB308" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.helpTitle}>How it works</Text>
                <Text style={styles.helpText}>Ask your landlord for an invite code. Once you join, you'll see your room, rent, and chats here.</Text>
              </View>
            </View>
            
            <Pressable 
              style={styles.emptySecondaryBtn}
              onPress={() => router.navigate('/(tenant)/add-previous-room')}
            >
              <Ionicons name="archive-outline" size={20} color={Theme.colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.emptySecondaryBtnText}>Add a Previous Room instead</Text>
            </Pressable>
          </View>
        ) : (
          /* DASHBOARD STATE */
          <View style={styles.dashboardContainer}>
            
            {/* CURRENT HOMES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CURRENT</Text>
              {currentMemberships.map(mem => {
                const room = mem.rooms;
                const prop = room?.properties;
                return (
                  <Pressable 
                    key={mem.id} 
                    style={styles.currentCard}
                    onPress={() => router.navigate(`/(tenant)/room/${room.id}` as any)}
                  >
                    <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.currentGradient}>
                      <View style={styles.cardCircle1} />
                      <View style={styles.cardCircle2} />
                      
                      <View style={styles.currentCardTop}>
                        <View>
                          <Text style={styles.propName}>{prop?.name}</Text>
                          <Text style={styles.propAddress}>{prop?.address}</Text>
                        </View>
                        <View style={[styles.activeBadge, { flexDirection: 'row', alignItems: 'center' }]}>
                          <Ionicons 
                            name={prop?.property_type === 'Shared House' ? 'home' : prop?.property_type === 'Flat' ? 'business' : prop?.property_type === 'Studio' ? 'bed' : 'grid'} 
                            size={12} 
                            color="#fff" 
                            style={{ marginRight: 4 }} 
                          />
                          <Text style={styles.activeBadgeText}>
                            {prop?.property_type === 'Shared House' ? 'SHARED' : prop?.property_type === 'Flat' ? 'FLAT' : prop?.property_type === 'Studio' ? 'STUDIO' : 'OTHER'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.currentCardStats}>
                        <View>
                          <Text style={styles.statLabel}>Room</Text>
                          <Text style={styles.statValue}>{room?.name}</Text>
                        </View>
                        <View>
                          <Text style={styles.statLabel}>Rent</Text>
                          <Text style={styles.statValue}>${room?.monthly_rent}/mo</Text>
                        </View>
                        <View>
                          <Text style={styles.statLabel}>Since</Text>
                          <Text style={styles.statValue}>{formatDate(mem.created_at)}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                    
                    <View style={styles.updatesBar}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={styles.updateDot} />
                        <Text style={styles.updateText}>0 new updates</Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* PREVIOUS HOMES */}
            {(pastMemberships.length > 0 || previousRooms.length > 0) && (
              <View style={[styles.section, { marginTop: 10 }]}>
                <Text style={styles.sectionTitle}>PREVIOUS</Text>
                
                {/* Official Past Memberships */}
                {pastMemberships.map(mem => {
                  const room = mem.rooms;
                  const prop = room?.properties;
                  return (
                    <Pressable 
                      key={mem.id} 
                      style={styles.pastCard}
                    >
                      <View style={styles.pastIconWrap}><Ionicons name="home-outline" size={22} color="#64748B" /></View>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.pastPropName} numberOfLines={1}>{prop?.name}</Text>
                        <Text style={styles.pastAddress} numberOfLines={1}>{prop?.address}</Text>
                        <Text style={styles.pastDates}>
                          Joined {formatDate(mem.created_at)}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                    </Pressable>
                  );
                })}

                {/* Personal Archive Rooms */}
                {previousRooms.map((room: any) => (
                  <Pressable 
                    key={room.id} 
                    style={styles.pastCard}
                    onPress={() => router.navigate(`/(tenant)/previous-room/${room.id}` as any)}
                  >
                    <View style={styles.pastIconWrap}><Ionicons name="home-outline" size={22} color="#64748B" /></View>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.pastPropName} numberOfLines={1}>{room.property_name}</Text>
                      <Text style={styles.pastAddress} numberOfLines={1}>{room.room_name}</Text>
                      <Text style={styles.pastDates}>
                        {room.start_date ? formatDate(room.start_date) : 'Unknown'} – {room.end_date ? formatDate(room.end_date) : 'Present'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </Pressable>
                ))}
              </View>
            )}

          </View>
        )}
      <View style={{ height: 80 }} />
      </ScrollView>

      {/* Add Menu Modal */}
      <Modal visible={showAddMenu} transparent animationType="slide" onRequestClose={() => setShowAddMenu(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowAddMenu(false)} />
          <View style={styles.actionSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add a Room</Text>
            
            <Pressable 
              style={styles.sheetBtn} 
              onPress={() => {
                setShowAddMenu(false);
                setShowJoinModal(true);
              }}
            >
              <View style={[styles.sheetIconWrap, { backgroundColor: Theme.colors.primary }]}><Ionicons name="link" size={20} color="#fff" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetBtnText}>Join New Room</Text>
                <Text style={styles.sheetBtnSub}>Use an invite code from your landlord</Text>
              </View>
            </Pressable>

            <Pressable 
              style={styles.sheetBtn} 
              onPress={() => {
                setShowAddMenu(false);
                router.navigate('/(tenant)/add-previous-room');
              }}
            >
              <View style={[styles.sheetIconWrap, { backgroundColor: Theme.colors.success }]}><Ionicons name="archive" size={20} color="#fff" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetBtnText}>Add Previous Room</Text>
                <Text style={styles.sheetBtnSub}>Save details & docs from a past rental</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Join Room Modal */}
      <Modal visible={showJoinModal} transparent animationType="slide" onRequestClose={() => setShowJoinModal(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowJoinModal(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.joinModalContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={styles.formLabel}>INVITE CODE</Text>
                <Pressable onPress={() => setShowJoinModal(false)}>
                  <Ionicons name="close" size={24} color={Theme.colors.mutedFg} />
                </Pressable>
              </View>
              <TextInput
                style={styles.formInput}
                value={inviteCode}
                onChangeText={text => setInviteCode(text.toUpperCase())}
                placeholder="e.g. MAPLE-2B-9X4P"
                placeholderTextColor={Theme.colors.mutedFg}
                autoCapitalize="characters"
              />
              <Pressable 
                style={[styles.formBtn, !inviteCode && { backgroundColor: Theme.colors.muted }]} 
                disabled={!inviteCode || joining}
                onPress={async () => {
                  await handleJoinRoom();
                  setShowJoinModal(false);
                }}
              >
                {joining ? <ActivityIndicator color="#fff" /> : <Text style={[styles.formBtnText, !inviteCode && { color: Theme.colors.mutedFg }]}>Join Room</Text>}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerWelcome: { fontSize: 12, color: '#64748B' },
  headerName: { fontSize: 22, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, marginTop: 2 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  iconButtonText: { fontSize: 20, color: '#64748B', fontWeight: '700' },
  scrollContent: { padding: 20 },
  
  // Empty State Styles
  emptyStateContainer: { alignItems: 'center' },
  heroGradient: { width: '100%', borderRadius: 24, padding: 32, alignItems: 'center', position: 'relative', overflow: 'hidden', marginBottom: 24 },
  heroCircle1: { position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: 70, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
  heroCircle2: { position: 'absolute', left: -40, bottom: -40, width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  heroIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroIcon: { fontSize: 36 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.4, marginBottom: 6 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 18 },
  formBox: { width: '100%', backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', padding: 20, marginBottom: 16 },
  formLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 1.2, marginBottom: 10 },
  formInput: { width: '100%', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', fontSize: 16, fontWeight: '600', color: '#0F172A', textAlign: 'center', letterSpacing: 1 },
  formBtn: { width: '100%', marginTop: 12, padding: 14, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center' },
  formBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  helpBox: { width: '100%', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  helpIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  helpIcon: { fontSize: 14 },
  helpTitle: { fontSize: 12, fontWeight: '700', color: '#2563EB', marginBottom: 4 },
  helpText: { fontSize: 12, color: '#1D4ED8', lineHeight: 18 },

  // Dashboard Styles
  dashboardContainer: { gap: 24 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 1.2, textTransform: 'uppercase' },
  currentCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  currentGradient: { padding: 18, position: 'relative', overflow: 'hidden' },
  cardCircle1: { position: 'absolute', right: -20, top: -20, width: 130, height: 130, borderRadius: 65, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
  cardCircle2: { position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  currentCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  propName: { fontSize: 19, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  propAddress: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 3 },
  activeBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, backgroundColor: Theme.colors.success },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  currentCardStats: { flexDirection: 'row', gap: 24 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '800', color: '#fff' },
  updatesBar: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  updateDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB' },
  updateText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  chevron: { fontSize: 18, color: '#64748B' },
  pastCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  pastIconWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  pastIcon: { fontSize: 22 },
  pastPropName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  pastAddress: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  pastDates: { fontSize: 11, color: '#64748B' },
  pastDates: { fontSize: 11, color: '#64748B' },
  pastPremiumName: { fontSize: 19, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3 },
  pastPremiumAddress: { fontSize: 12, color: '#475569', marginTop: 3 },
  pastPremiumLabel: { fontSize: 10, color: '#64748B', marginBottom: 2 },
  pastPremiumValue: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  pastPremiumCircle1: { position: 'absolute', right: -20, top: -20, width: 130, height: 130, borderRadius: 65, borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.03)' },
  pastPremiumCircle2: { position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  emptySecondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: Theme.colors.primary + '15', borderRadius: Theme.radius.lg, marginTop: 16, borderWidth: 1, borderColor: Theme.colors.primary + '30' },
  emptySecondaryBtnText: { color: Theme.colors.primary, fontSize: 14, fontWeight: '700', fontFamily: Theme.fonts.bold },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  actionSheet: { backgroundColor: Theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Theme.colors.border, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.fg, fontFamily: Theme.fonts.bold, marginBottom: 20 },
  sheetBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, gap: 16 },
  sheetIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sheetBtnText: { fontSize: 16, fontWeight: '700', color: Theme.colors.fg, fontFamily: Theme.fonts.bold },
  sheetBtnSub: { fontSize: 13, color: Theme.colors.mutedFg, fontFamily: Theme.fonts.regular, marginTop: 2 },
  joinModalContent: { backgroundColor: Theme.colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 }
});


