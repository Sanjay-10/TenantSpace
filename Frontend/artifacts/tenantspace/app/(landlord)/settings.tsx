import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function LandlordSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  
  const [pushNotifs, setPushNotifs] = useState(true);
  const [chatNotifs, setChatNotifs] = useState(true);
  const [reqUpdates, setReqUpdates] = useState(true);

  // Edit Modal State
  const [editField, setEditField] = useState<'name' | 'email' | 'phone' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const { refreshProfile } = useAuth();

  const handleOpenEdit = (field: 'name' | 'email' | 'phone', currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (!editField || !profile?.id) return;
    setSaving(true);
    try {
      const updatePayload: any = {};
      if (editField === 'name') updatePayload.full_name = editValue;
      else if (editField === 'email') updatePayload.email = editValue;
      else if (editField === 'phone') updatePayload.phone = editValue;

      const { error } = await supabase.from('profiles').update(updatePayload).eq('id', profile.id);
      if (error) throw error;

      if (editField === 'email') {
        // Attempt to update auth user email as well, though it may require confirmation
        await supabase.auth.updateUser({ email: editValue });
      }

      await refreshProfile();
      setEditField(null);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AT';
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut }
    ]);
  };

  const handleSwitchToTenant = async () => {
    try {
      const { error } = await supabase.from('profiles').update({ role: 'tenant' }).eq('id', profile?.id);
      if (error) throw error;
      router.replace('/(tenant)/home');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not switch role.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account', 
      'This action is permanent and cannot be undone. All your data will be lost.', 
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Notice', 'Account deletion requires contacting support in this version.') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(profile?.full_name)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name || '--'}</Text>
            <Text style={styles.profileContact}>{profile?.email || '--'}</Text>
            <Text style={styles.profileContact}>{profile?.phone || '--'}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Landlord</Text>
          </View>
        </View>

        {/* ACCOUNT SECTION */}
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <View style={styles.sectionBlock}>
          <Pressable style={styles.rowItem} onPress={() => handleOpenEdit('name', profile?.full_name || '')}>
            <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="person" size={16} color="#7E22CE" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>Change Name</Text>
              <Text style={styles.rowSub}>{profile?.full_name || '--'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </Pressable>
          <View style={styles.divider} />
          
          <Pressable style={styles.rowItem} onPress={() => handleOpenEdit('email', profile?.email || '')}>
            <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="mail" size={16} color="#4338CA" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>Change Email</Text>
              <Text style={styles.rowSub}>{profile?.email || '--'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </Pressable>
          <View style={styles.divider} />

          <Pressable style={styles.rowItem} onPress={() => handleOpenEdit('phone', profile?.phone || '')}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF08A' }]}>
              <Ionicons name="phone-portrait" size={16} color="#A16207" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>Change Phone</Text>
              <Text style={styles.rowSub}>{profile?.phone || '--'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </Pressable>
        </View>

        {/* NOTIFICATIONS SECTION */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.sectionBlock}>
          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="notifications" size={16} color="#D97706" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>Push Notifications</Text>
              <Text style={styles.rowSub}>Messages, rent reminders & updates</Text>
            </View>
            <Switch 
              value={pushNotifs} 
              onValueChange={setPushNotifs} 
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              ios_backgroundColor="#E2E8F0"
            />
          </View>
          <View style={styles.divider} />
          
          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: '#F8FAFC' }]}>
              <Ionicons name="chatbubbles" size={16} color="#64748B" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>Chat Notifications</Text>
              <Text style={styles.rowSub}>New messages from landlord & group</Text>
            </View>
            <Switch 
              value={chatNotifs} 
              onValueChange={setChatNotifs} 
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              ios_backgroundColor="#E2E8F0"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="clipboard" size={16} color="#475569" />
            </View>
            <View style={styles.rowTextCol}>
              <Text style={styles.rowTitle}>Request Updates</Text>
              <Text style={styles.rowSub}>Status changes on your requests</Text>
            </View>
            <Switch 
              value={reqUpdates} 
              onValueChange={setReqUpdates} 
              trackColor={{ false: '#E2E8F0', true: '#2563EB' }}
              ios_backgroundColor="#E2E8F0"
            />
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={{ marginTop: 8, gap: 12 }}>
          <Pressable style={styles.actionBtn} onPress={handleSignOut}>
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2', opacity: 0.8 }]}>
              <Ionicons name="log-out" size={16} color="#DC2626" />
            </View>
            <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Sign Out</Text>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={handleSwitchToTenant}>
            <View style={[styles.iconBox, { backgroundColor: '#DBEAFE', opacity: 0.8 }]}>
              <Ionicons name="person" size={16} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionBtnText, { color: '#2563EB' }]}>Switch to Tenant</Text>
              <Text style={styles.actionSubText}>View as a tenant</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
          </Pressable>

          <Pressable style={[styles.actionBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]} onPress={handleDeleteAccount}>
            <View style={[styles.iconBox, { backgroundColor: '#FECACA', opacity: 0.8 }]}>
              <Ionicons name="trash" size={16} color="#DC2626" />
            </View>
            <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Delete Account</Text>
          </Pressable>
        </View>

      <View style={{ height: 80 }} />

      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={!!editField}
        transparent
        animationType="fade"
        onRequestClose={() => setEditField(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Change {editField === 'name' ? 'Name' : editField === 'email' ? 'Email' : 'Phone'}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              autoCapitalize={editField === 'name' ? 'words' : 'none'}
              keyboardType={editField === 'email' ? 'email-address' : editField === 'phone' ? 'phone-pad' : 'default'}
              autoFocus
            />

            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalBtn, { backgroundColor: '#F1F5F9' }]} 
                onPress={() => setEditField(null)}
                disabled={saving}
              >
                <Text style={[styles.modalBtnText, { color: '#64748B' }]}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalBtn, { backgroundColor: Theme.colors.primary }]} 
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  profileContact: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 12,
  },
  roleBadgeText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 24,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 56,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 12,
    color: '#64748B',
  },
  actionBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionSubText: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 2,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
  }
});


