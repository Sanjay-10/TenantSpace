import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../../lib/supabase';
import { Theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';

type Detail = { id: string; label: string; value: string };

function AddDetailRow({ onSave, onCancel }: { onSave: (label: string, value: string) => void; onCancel: () => void }) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  return (
    <View style={styles.addDetailBox}>
      <View style={styles.addDetailInputs}>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder="Label (e.g. Parking)"
          placeholderTextColor={Theme.colors.mutedFg}
          style={styles.inlineInput}
        />
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Value"
          placeholderTextColor={Theme.colors.mutedFg}
          style={styles.inlineInput}
        />
      </View>
      <View style={styles.addDetailActions}>
        <Pressable onPress={onCancel} style={styles.addDetailCancelBtn}>
          <Text style={styles.addDetailCancelBtnText}>Cancel</Text>
        </Pressable>
        <Pressable 
          onPress={() => label.trim() && value.trim() && onSave(label.trim(), value.trim())}
          style={styles.addDetailSaveBtn}
        >
          <Text style={styles.addDetailSaveBtnText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [addingDetail, setAddingDetail] = useState(false);
  
  // Edit State
  const [isMonthToMonth, setIsMonthToMonth] = useState(false);
  const [leaseDate, setLeaseDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [editDeposit, setEditDeposit] = useState('');
  const [editRent, setEditRent] = useState('');
  
  const [customDetails, setCustomDetails] = useState<Detail[]>([]);

  const { data: roomData, isLoading, error } = useQuery({
    queryKey: ['roomData', id],
    queryFn: async () => {
      if (!id) throw new Error('No Room ID');
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          properties (name),
          tenant_memberships (
            id, status, created_at, profiles (id, full_name, role)
          ),
          room_documents (id, name, file_url, created_at)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateRoomMutation = useMutation({
    mutationFn: async () => {
      let finalLeaseEnd = null;
      if (isMonthToMonth) {
        finalLeaseEnd = 'Month-to-Month';
      } else {
        finalLeaseEnd = leaseDate.toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('rooms')
        .update({
          lease_end: finalLeaseEnd,
          deposit_amount: parseInt(editDeposit) || null,
          monthly_rent: parseInt(editRent) || 0,
          additional_details: customDetails,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomData', id] });
      setIsEditing(false);
      setAddingDetail(false);
    },
    onError: (err: any) => Alert.alert('Error saving', err.message)
  });

  const uploadDocMutation = useMutation({
    mutationFn: async () => {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (res.canceled) return;
      
      const file = res.assets[0];
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const filePath = `${id}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, blob);
        
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('room_documents')
        .insert({
          room_id: id,
          name: file.name,
          file_url: publicUrl,
          uploaded_by: session?.user?.id
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roomData', id] }),
    onError: (err: any) => Alert.alert('Upload Failed', err.message)
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(); // Invalidate all to refresh the parent property screen
      router.back();
    },
    onError: (err: any) => Alert.alert('Error deleting room', err.message)
  });

  const confirmDeleteRoom = () => {
    Alert.alert(
      "Delete Room",
      "Are you sure you want to delete this room? All documents and details will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteRoomMutation.mutate() }
      ]
    );
  };

  const startEditing = () => {
    if (!roomData) return;
    
    if (roomData.lease_end === 'Month-to-Month') {
      setIsMonthToMonth(true);
    } else {
      setIsMonthToMonth(false);
      if (roomData.lease_end) {
        // Simple attempt to parse date string back to Date
        const d = new Date(roomData.lease_end);
        if (!isNaN(d.getTime())) setLeaseDate(d);
      }
    }

    setEditDeposit(roomData.deposit_amount !== null && roomData.deposit_amount !== undefined ? roomData.deposit_amount.toString() : '0');
    setEditRent(roomData.monthly_rent !== null && roomData.monthly_rent !== undefined ? roomData.monthly_rent.toString() : '0');
    setCustomDetails(roomData.additional_details || []);
    setIsEditing(true);
  };

  const saveChanges = () => {
    updateRoomMutation.mutate();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (error || !roomData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: Theme.colors.danger, textAlign: 'center' }}>Failed to load room details.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20, padding: 10 }}>
          <Text style={{ color: Theme.colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const propertyName = roomData.properties?.name || 'Unknown Property';
  const activeTenants = (roomData.tenant_memberships || []).filter((m: any) => m.status === 'active');
  const documents = roomData.room_documents || [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>{roomData.name}</Text>
          <Text style={styles.headerSubtitle}>{propertyName}</Text>
        </View>
        <Pressable 
          onPress={isEditing ? saveChanges : startEditing} 
          style={styles.editBtn}
          disabled={updateRoomMutation.isPending}
        >
          {updateRoomMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.editBtnText}>
              {isEditing ? "Done" : "Edit"}
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Tenant Cards */}
          <View style={{ gap: 5, marginBottom: 20 }}>
          {activeTenants.length > 0 ? (
            activeTenants.map((tenant: any) => {
              const profile = tenant.profiles;
              const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'T';
              let since = 'Recently';
              if (tenant.created_at) {
                const d = new Date(tenant.created_at);
                since = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
              }
              return (
                <View key={tenant.id} style={styles.tenantCard}>
                  <View style={styles.tenantLeft}>
                    <View style={styles.tenantAvatar}>
                      <Text style={styles.tenantAvatarText}>{initials}</Text>
                    </View>
                    <View>
                      <Text style={styles.tenantName}>{profile?.full_name || 'Unknown'}</Text>
                      <Text style={styles.tenantSince}>Tenant - Since {since}</Text>
                    </View>
                  </View>
                  <View style={styles.badgePending}>
                    <Text style={styles.badgePendingText}>Rent Pending</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.tenantCard}>
              <View style={styles.tenantLeft}>
                <View style={[styles.tenantAvatar, { backgroundColor: Theme.colors.muted }]}>
                  <Text style={[styles.tenantAvatarText, { color: Theme.colors.mutedFg }]}>?</Text>
                </View>
                <View>
                  <Text style={styles.tenantName}>No Tenant</Text>
                  <Text style={styles.tenantSince}>Share code to invite</Text>
                </View>
              </View>
            </View>
          )}
          </View>

          {/* ROOM DETAILS SECTION */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ROOM DETAILS</Text>
            <Text style={styles.sectionSubtitle}>Tenant sees these</Text>
          </View>

          <View style={styles.card}>
            {/* Lease End - Specialized Edit Row */}
            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>Lease End</Text>
              {isEditing ? (
                <View style={{ alignItems: 'flex-end', flex: 1 }}>
                  <View style={styles.leaseTypeToggle}>
                    <Pressable 
                      style={[styles.leaseTypeBtn, isMonthToMonth && styles.leaseTypeBtnActive]}
                      onPress={() => setIsMonthToMonth(true)}
                    >
                      <Text style={[styles.leaseTypeBtnText, isMonthToMonth && styles.leaseTypeBtnTextActive]}>Month-to-Month</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.leaseTypeBtn, !isMonthToMonth && styles.leaseTypeBtnActive]}
                      onPress={() => setIsMonthToMonth(false)}
                    >
                      <Text style={[styles.leaseTypeBtnText, !isMonthToMonth && styles.leaseTypeBtnTextActive]}>Fixed Date</Text>
                    </Pressable>
                  </View>
                  {!isMonthToMonth && (
                    <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                      {Platform.OS === 'android' && (
                        <Pressable style={styles.inlineEditInput} onPress={() => setShowDatePicker(true)}>
                          <Text style={{ fontSize: 13, color: Theme.colors.fg, fontWeight: '600' }}>
                            {leaseDate.toISOString().split('T')[0]}
                          </Text>
                        </Pressable>
                      )}
                      {(Platform.OS === 'ios' || showDatePicker) && (
                        <DateTimePicker
                          value={leaseDate}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (selectedDate) setLeaseDate(selectedDate);
                          }}
                        />
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <Text style={styles.rowValue}>{roomData.lease_end || '-'}</Text>
              )}
            </View>
            
            {/* Deposit */}
            <View style={[styles.cardRow, (!isEditing && (roomData.additional_details || []).length === 0) && styles.cardRowLast]}>
              <Text style={styles.rowLabel}>Deposit</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineEditInput}
                  value={editDeposit}
                  onChangeText={setEditDeposit}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.rowValue}>${roomData.deposit_amount || 0}</Text>
              )}
            </View>

            {/* Dynamic Custom Details */}
            {(isEditing ? customDetails : (roomData.additional_details || [])).map((d: Detail, i: number) => {
              return (
                <View key={d.id} style={[styles.cardRow, i === (isEditing ? customDetails.length - 1 : (roomData.additional_details || []).length - 1) && styles.cardRowLast]}>
                  {isEditing ? (
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', gap: 10 }}>
                      <TextInput 
                        style={[styles.inlineEditInput, { flex: 1, textAlign: 'left' }]} 
                        value={d.label} 
                        onChangeText={(text) => setCustomDetails(prev => prev.map(item => item.id === d.id ? { ...item, label: text } : item))} 
                      />
                      <TextInput 
                        style={[styles.inlineEditInput, { flex: 1, textAlign: 'right' }]} 
                        value={d.value} 
                        onChangeText={(text) => setCustomDetails(prev => prev.map(item => item.id === d.id ? { ...item, value: text } : item))} 
                      />
                      <Pressable 
                        style={[styles.miniIconBtn, { backgroundColor: '#FEE2E2', borderWidth: 0 }]} 
                        onPress={() => setCustomDetails(prev => prev.filter(x => x.id !== d.id))}
                      >
                        <Text style={styles.miniIconBtnText}>🗑️</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.rowLabel}>{d.label}</Text>
                      <Text style={styles.rowValue}>{d.value}</Text>
                    </>
                  )}
                </View>
              );
            })}
            
          </View>

          {/* Empty Details State */}
          {(!isEditing && (!roomData.additional_details || roomData.additional_details.length === 0)) && (
            <View style={{ paddingHorizontal: 4, marginTop: -4, marginBottom: 12 }}>
              <Text style={{ color: Theme.colors.mutedFg, fontStyle: 'italic', fontSize: 13, textAlign: 'center' }}>
                Tap "Edit" to add custom room details.
              </Text>
            </View>
          )}

          {isEditing && (
            <View style={{ marginBottom: 32 }}>
              {addingDetail ? (
                <AddDetailRow 
                  onSave={(lbl, val) => {
                    setCustomDetails(prev => [...prev, { id: Date.now().toString(), label: lbl, value: val }]);
                    setAddingDetail(false);
                  }} 
                  onCancel={() => setAddingDetail(false)} 
                />
              ) : (
                <Pressable onPress={() => setAddingDetail(true)} style={styles.addDetailBtn}>
                  <Text style={styles.addDetailBtnText}>＋ Add Detail</Text>
                </Pressable>
              )}
            </View>
          )}
          {!isEditing && <View style={{ height: 16 }} />}

          {/* ACCESS SECTION */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Access</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>Room Code</Text>
              <Text style={[styles.rowValue, { letterSpacing: 2 }]}>{roomData.invite_code}</Text>
            </View>
            <View style={[styles.cardRow, styles.cardRowLast]}>
              <Text style={styles.rowLabel}>Monthly Rent</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inlineEditInput}
                  value={editRent}
                  onChangeText={setEditRent}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.rowValue}>${roomData.monthly_rent}</Text>
              )}
            </View>
          </View>

          {/* DOCUMENTS SECTION */}
          <View style={[styles.sectionHeader, { alignItems: 'center' }]}>
            <Text style={[styles.sectionTitle, { textTransform: 'none', fontWeight: '800', color: Theme.colors.fg, fontSize: 14 }]}>
              Documents
            </Text>
            <Pressable onPress={() => uploadDocMutation.mutate()} disabled={uploadDocMutation.isPending}>
              {uploadDocMutation.isPending ? (
                <ActivityIndicator size="small" color={Theme.colors.primary} />
              ) : (
                <Text style={styles.uploadBtnText}>+ Upload</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.card}>
            {documents.length === 0 ? (
              <View style={[styles.cardRow, styles.cardRowLast, { justifyContent: 'center' }]}>
                <Text style={{ color: Theme.colors.mutedFg, fontStyle: 'italic' }}>No documents uploaded yet.</Text>
              </View>
            ) : (
              documents.map((doc: any, index: number) => (
                <Pressable 
                  key={doc.id} 
                  style={[styles.cardRow, index === documents.length - 1 && styles.cardRowLast]}
                  onPress={() => Linking.openURL(doc.file_url)}
                >
                  <View style={styles.docLeft}>
                    <Text style={styles.docIcon}>📄</Text>
                    <Text style={styles.docTitle}>{doc.name}</Text>
                  </View>
                  <Text style={styles.downloadIcon}>↓</Text>
                </Pressable>
              ))
            )}
          </View>

          {isEditing && (
            <Pressable 
              style={styles.deleteRoomBtn} 
              onPress={confirmDeleteRoom}
              disabled={deleteRoomMutation.isPending}
            >
              {deleteRoomMutation.isPending ? (
                <ActivityIndicator size="small" color={Theme.colors.danger} />
              ) : (
                <Text style={styles.deleteRoomBtnText}>Delete Room</Text>
              )}
            </Pressable>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Theme.colors.muted, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 16, color: Theme.colors.mutedFg },
  headerTitles: { flex: 1, paddingHorizontal: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.fg, letterSpacing: -0.4 },
  headerSubtitle: { fontSize: 12, color: Theme.colors.mutedFg, marginTop: 1 },
  editBtn: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 20, backgroundColor: Theme.colors.primary },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  scrollContent: { padding: 16 },
  tenantCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 13, paddingHorizontal: 16, borderWidth: 1, borderColor: Theme.colors.border },
  tenantLeft: { flexDirection: 'row', alignItems: 'center' },
  tenantAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Theme.colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tenantAvatarText: { fontSize: 16, fontWeight: '800', color: Theme.colors.primary },
  tenantName: { fontSize: 14, fontWeight: '700', color: Theme.colors.fg },
  tenantSince: { fontSize: 12, color: Theme.colors.mutedFg, marginTop: 1 },
  badgePending: { backgroundColor: '#FEF3C7', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  badgePendingText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Theme.colors.mutedFg, textTransform: 'uppercase', letterSpacing: 1 },
  sectionSubtitle: { fontSize: 11, color: Theme.colors.mutedFg },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border, marginBottom: 16, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  cardRowLast: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 13, color: Theme.colors.mutedFg, flex: 1 },
  rowValue: { fontSize: 13, fontWeight: '600', color: Theme.colors.fg },
  addDetailBtn: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: Theme.colors.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  addDetailBtnText: { fontSize: 13, fontWeight: '600', color: Theme.colors.mutedFg },
  uploadBtnText: { fontSize: 12, fontWeight: '600', color: Theme.colors.primary },
  docLeft: { flexDirection: 'row', alignItems: 'center' },
  docIcon: { fontSize: 18, marginRight: 10 },
  docTitle: { fontSize: 13, color: Theme.colors.fg },
  downloadIcon: { fontSize: 13, color: Theme.colors.mutedFg },
  inlineEditInput: { backgroundColor: Theme.colors.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, fontWeight: '600', color: Theme.colors.fg, minWidth: 100, textAlign: 'right' },
  miniIconBtn: { width: 26, height: 26, borderRadius: 6, backgroundColor: Theme.colors.muted, borderWidth: 1, borderColor: Theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  miniIconBtnText: { fontSize: 12 },

  addDetailBox: { backgroundColor: Theme.colors.muted, borderRadius: 12, padding: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Theme.colors.primary },
  addDetailInputs: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  inlineInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: Theme.colors.border, borderRadius: 8, padding: 8, fontSize: 12 },
  addDetailActions: { flexDirection: 'row', gap: 6 },
  addDetailCancelBtn: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.border, alignItems: 'center' },
  addDetailCancelBtnText: { fontSize: 12, fontWeight: '600', color: Theme.colors.mutedFg },
  addDetailSaveBtn: { flex: 1, padding: 8, borderRadius: 8, backgroundColor: Theme.colors.primary, alignItems: 'center' },
  addDetailSaveBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  deleteRoomBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', alignItems: 'center' },
  deleteRoomBtnText: { color: Theme.colors.danger, fontSize: 14, fontWeight: '700' },
  leaseTypeToggle: { flexDirection: 'row', backgroundColor: Theme.colors.muted, borderRadius: 8, padding: 4 },
  leaseTypeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  leaseTypeBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  leaseTypeBtnText: { fontSize: 12, fontWeight: '600', color: Theme.colors.mutedFg },
  leaseTypeBtnTextActive: { color: Theme.colors.fg }
});
