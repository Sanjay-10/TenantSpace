import React, { useState, useRef, useEffect } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import ImageViewing from 'react-native-image-viewing';
import { decode } from 'base64-arraybuffer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../../lib/supabase';
import { getTenantColor, getTenantTextColor, getInitials } from '../../../components/ui/AvatarCluster';
import { Theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';

const formatLocalDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDisplayDate = (dateVal: string | Date | null | undefined) => {
  if (!dateVal) return 'Not set';
  if (dateVal === 'Month-to-Month') return 'Month-to-Month';
  
  let d: Date;
  if (typeof dateVal === 'string') {
    const parts = dateVal.split('T')[0].split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      d = new Date(dateVal);
    }
  } else {
    d = dateVal;
  }
  
  if (isNaN(d.getTime())) return String(dateVal);
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

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
  const [leaseStartDate, setLeaseStartDate] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  
  const [editDeposit, setEditDeposit] = useState('');
  const [editRent, setEditRent] = useState('');
  
  const [customDetails, setCustomDetails] = useState<Detail[]>([]);
  
  // Document Viewer State
  const [viewerImages, setViewerImages] = useState<any[]>([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState({ x: 0, y: 0 });
  const menuRefs = useRef<{ [key: string]: any }>({});
  
  const isLocalUri = (uri: string) => uri.startsWith('file://') || uri.startsWith(FileSystem.documentDirectory || '');

  const handleOpenDoc = async (doc: any) => {
    try {
      const ext = doc.name.split('.').pop()?.toLowerCase();
      const isImage = ['jpeg', 'jpg', 'gif', 'png', 'webp'].includes(ext || '');

      if (isImage) {
        setViewerImages([{ uri: doc.file_url }]);
        setViewerIndex(0);
        setViewerVisible(true);
      } else {
        if (Platform.OS === 'android') {
          let fileUri = doc.file_url;
          if (!isLocalUri(fileUri)) {
            const localUri = FileSystem.documentDirectory + (doc.name || 'document');
            const result = await FileSystem.downloadAsync(fileUri, localUri);
            if (result.status !== 200) throw new Error('Could not download document.');
            fileUri = result.uri;
          }
          const contentUri = await FileSystem.getContentUriAsync(fileUri);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
          });
        } else {
          Linking.openURL(doc.file_url);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const getMimeType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls': return 'application/vnd.ms-excel';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'png': return 'image/png';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'txt': return 'text/plain';
      case 'zip': return 'application/zip';
      default: return '*/*';
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      const isLocalUri = (uri: string) => uri?.startsWith('file://');
      let localUri = doc.file_url;
      
      if (!isLocalUri(localUri)) {
        const tempUri = FileSystem.documentDirectory + (doc.name || 'document');
        const result = await FileSystem.downloadAsync(doc.file_url, tempUri);
        localUri = result.uri;
      }

      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64Data = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
          const savedUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            doc.name,
            getMimeType(doc.name)
          );
          await FileSystem.writeAsStringAsync(savedUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
          Alert.alert('Success', 'Document downloaded successfully!');
        }
      } else {
        await Sharing.shareAsync(localUri, { mimeType: getMimeType(doc.name) });
      }
    } catch (err: any) {
      Alert.alert('Download Error', 'Could not save the document.');
    }
  };

  const handleShare = async (doc: any) => {
    try {
      let fileUri = doc.file_url;
      const isLocalUri = (uri: string) => uri?.startsWith('file://');
      if (!isLocalUri(fileUri)) {
        const localUri = FileSystem.documentDirectory + (doc.name || 'document');
        const result = await FileSystem.downloadAsync(fileUri, localUri);
        if (result.status !== 200) throw new Error('Could not download file for sharing.');
        fileUri = result.uri;
      }
      await Sharing.shareAsync(fileUri, { mimeType: getMimeType(doc.name) });
    } catch (err: any) {
      Alert.alert('Share Error', err.message);
    }
  };

  const handleDeleteDoc = async (doc: any) => {
    Alert.alert('Delete Document', 'Are you sure you want to permanently delete this document?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            const { data: dbDoc, error: fetchError } = await supabase
              .from('room_documents')
              .select('file_url')
              .eq('id', doc.id)
              .single();
              
            if (fetchError || !dbDoc) throw new Error('Document no longer exists in database.');
            
            let rawPath = dbDoc.file_url;
            if (rawPath.includes('/public/property-docs/')) {
              rawPath = rawPath.split('/public/property-docs/')[1];
            }
            
            const cleanPath = rawPath.split('?')[0];
            
            const { data, error: storageError } = await supabase.storage.from('property-docs').remove([cleanPath]);
            if (storageError) throw new Error(storageError.message);
            
            const { error: delError } = await supabase.from('room_documents').delete().eq('id', doc.id);
            if (delError) throw delError;
            
            queryClient.invalidateQueries({ queryKey: ['roomData', id] });
          } catch (err: any) {
            Alert.alert('Delete Failed', err.message);
          }
        }
      }
    ]);
  };

  const handleOpenOptions = (doc: any) => {
    Alert.alert(
      'Document Options',
      doc.name,
      [
        { text: 'Download', onPress: () => handleDownload(doc) },
        { text: 'Share', onPress: () => handleShare(doc) },
        { text: 'Delete', onPress: () => handleDeleteDoc(doc), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  useEffect(() => {
    const channel = supabase
      .channel(`landlord_room_docs_${id}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_documents'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['roomData', id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

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
      
      // Generate Signed URLs and Offline Cache for documents
      if (data.room_documents) {
        data.room_documents = await Promise.all(data.room_documents.map(async (doc: any) => {
          let path = doc.file_url;
          if (path.includes('/public/property-docs/')) path = path.split('/public/property-docs/')[1];
          
          const localFileName = path.split('/').pop() || doc.id;
          const localUri = `${FileSystem.documentDirectory}prop-docs_${localFileName}`;
          
          try {
            const fileInfo = await FileSystem.getInfoAsync(localUri);
            if (fileInfo.exists) return { ...doc, file_url: localUri, storage_path: path };
          } catch(e) {}
          
          const { data: signedData } = await supabase.storage.from('property-docs').createSignedUrl(path, 60 * 60);
          const downloadUrl = signedData?.signedUrl;
          
          if (downloadUrl) {
            try {
              const result = await FileSystem.downloadAsync(downloadUrl, localUri);
              if (result.status === 200) return { ...doc, file_url: result.uri, storage_path: path };
            } catch(e) {}
          }
          return { ...doc, file_url: downloadUrl || doc.file_url, storage_path: path };
        }));
      }

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
        finalLeaseEnd = formatLocalDate(leaseDate);
      }

      const { error } = await supabase
        .from('rooms')
        .update({
          created_at: leaseStartDate.toISOString(),
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
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (res.canceled || !res.assets[0].uri) return;
      
      const file = res.assets[0];
      const fileMime = file.mimeType || 'application/octet-stream';
      const fileExt = file.name.split('.').pop() || 'file';
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const filePath = `${id}/${fileName}`;
      
      const base64Data = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
      const fileData = decode(base64Data);

      const { error: uploadError } = await supabase.storage
        .from('property-docs')
        .upload(filePath, fileData, {
          contentType: fileMime,
        });
        
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('room_documents')
        .insert({
          room_id: id,
          name: file.name,
          file_url: filePath,
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
    
    if (roomData.created_at) {
      const sd = new Date(roomData.created_at);
      if (!isNaN(sd.getTime())) setLeaseStartDate(sd);
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
      {openMenuId && (
        <Pressable 
          style={[StyleSheet.absoluteFill, { zIndex: 9998, elevation: 9998 }]} 
          onPress={() => setOpenMenuId(null)} 
        />
      )}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back-outline" size={24} color="#64748B" />
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
              const initials = getInitials(profile?.full_name);
              let since = 'Recently';
              if (tenant.created_at) {
                const d = new Date(tenant.created_at);
                since = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
              }
              return (
                <View key={tenant.id} style={styles.tenantCard}>
                  <View style={styles.tenantLeft}>
                    <View style={[styles.tenantAvatar, { backgroundColor: getTenantColor(profile?.id || tenant.id) }]}>
                      <Text style={[styles.tenantAvatarText, { color: getTenantTextColor(profile?.id || tenant.id) }]}>{initials}</Text>
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
            {/* Lease Start */}
            <View style={styles.cardRow}>
              <Text style={styles.rowLabel}>Lease Start</Text>
              {isEditing ? (
                <View style={{ alignItems: 'flex-end', flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {Platform.OS === 'android' && (
                      <Pressable style={styles.inlineEditInput} onPress={() => setShowStartDatePicker(true)}>
                        <Text style={{ fontSize: 13, color: Theme.colors.fg, fontWeight: '600' }}>
                          {formatDisplayDate(leaseStartDate)}
                        </Text>
                      </Pressable>
                    )}
                    {(Platform.OS === 'ios' || showStartDatePicker) && (
                      <DateTimePicker
                        value={leaseStartDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowStartDatePicker(Platform.OS === 'ios');
                          if (selectedDate) setLeaseStartDate(selectedDate);
                        }}
                      />
                    )}
                  </View>
                </View>
              ) : (
                <Text style={styles.rowValue}>
                  {formatDisplayDate(roomData.created_at)}
                </Text>
              )}
            </View>

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
                            {formatDisplayDate(leaseDate)}
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
                <Text style={styles.rowValue}>{formatDisplayDate(roomData.lease_end)}</Text>
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

          <View style={[styles.card, { overflow: 'visible', zIndex: openMenuId ? 9999 : 1, borderWidth: 0, backgroundColor: 'transparent' }]}>
            {documents.length === 0 ? (
              <View style={[styles.cardRow, styles.cardRowLast, { justifyContent: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border }]}>
                <Text style={{ color: Theme.colors.mutedFg, fontStyle: 'italic' }}>No documents uploaded yet.</Text>
              </View>
            ) : (
              <View style={{ gap: 12, zIndex: openMenuId ? 9999 : 1 }}>
                {documents.map((doc: any, index: number) => {
                  const ext = doc.name.split('.').pop()?.toLowerCase();
                  const isImage = ['jpeg', 'jpg', 'gif', 'png', 'webp'].includes(ext || '');
                  
                  let iconProps = { name: 'file-document' as any, color: '#64748B' };
                  switch(ext) {
                    case 'pdf': iconProps = { name: 'file-pdf-box', color: '#EF4444' }; break;
                    case 'doc':
                    case 'docx': iconProps = { name: 'file-word-box', color: '#3B82F6' }; break;
                    case 'xls':
                    case 'xlsx':
                    case 'csv': iconProps = { name: 'microsoft-excel', color: '#10B981' }; break;
                    case 'ppt':
                    case 'pptx': iconProps = { name: 'microsoft-powerpoint', color: '#F97316' }; break;
                    case 'zip':
                    case 'rar':
                    case '7z': iconProps = { name: 'folder-zip', color: '#EAB308' }; break;
                    case 'txt': iconProps = { name: 'file-document-outline', color: '#64748B' }; break;
                  }

                  return (
                    <View 
                      key={doc.id} 
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        backgroundColor: '#fff', 
                        borderRadius: 12, 
                        padding: 12, 
                        borderWidth: 1, 
                        borderColor: Theme.colors.border,
                        zIndex: openMenuId === doc.id ? 9999 : 1,
                        elevation: openMenuId === doc.id ? 9999 : 1
                      }}
                    >
                      <Pressable 
                        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                        onPress={() => handleOpenDoc(doc)}
                      >
                        <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {isImage ? (
                            <Image source={{ uri: doc.file_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                          ) : (
                            <MaterialCommunityIcons name={iconProps.name} size={24} color={iconProps.color} />
                          )}
                        </View>
                        
                        <View style={{ flex: 1, marginLeft: 12, paddingRight: 12 }}>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: Theme.colors.fg, marginBottom: 2 }} numberOfLines={1}>{doc.name}</Text>
                          <Text style={{ fontSize: 11, color: Theme.colors.mutedFg }}>{new Date(doc.created_at).toLocaleDateString()}</Text>
                        </View>
                      </Pressable>
                      
                      <View style={{ position: 'relative', zIndex: 9999, elevation: 9999 }} ref={el => menuRefs.current[doc.id] = el} collapsable={false}>
                        <Pressable 
                          onPress={() => {
                            menuRefs.current[doc.id]?.measure((fx: number, fy: number, width: number, height: number, px: number, py: number) => {
                              setMenuCoords({ x: px, y: py });
                              setOpenMenuId(doc.id);
                            });
                          }}
                          style={{ padding: 8 }}
                          hitSlop={12}
                        >
                          <Ionicons name="ellipsis-vertical" size={20} color={Theme.colors.mutedFg} />
                        </Pressable>

                        {/* Document Options Modal with exact anchored coordinates */}
                        <Modal visible={openMenuId === doc.id} transparent animationType="fade" onRequestClose={() => setOpenMenuId(null)}>
                          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0)' }} onPress={() => setOpenMenuId(null)}>
                            <Pressable 
                              style={{ 
                                position: 'absolute',
                                top: menuCoords.y + 0,
                                right: 12,
                                backgroundColor: '#262626', 
                                borderRadius: 14, 
                                paddingVertical: 4,
                                minWidth: 160,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 10,
                              }}
                              onPress={e => e.stopPropagation()}
                            >
                              <Pressable 
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 }} 
                                onPress={() => { setOpenMenuId(null); handleShare(doc); }}
                              >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>Share</Text>
                                <Ionicons name="share-outline" size={22} color="#fff" />
                              </Pressable>
                              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                              <Pressable 
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 }} 
                                onPress={() => { setOpenMenuId(null); handleDownload(doc); }} 
                              >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>Download</Text>
                                <Ionicons name="download-outline" size={22} color="#fff" />
                              </Pressable>
                              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                              <Pressable 
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 }} 
                                onPress={() => { setOpenMenuId(null); handleDeleteDoc(doc); }} 
                              >
                                <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '500' }}>Delete</Text>
                                <Ionicons name="trash-outline" size={22} color="#EF4444" />
                              </Pressable>
                            </Pressable>
                          </Pressable>
                        </Modal>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
          
          <ImageViewing
            images={viewerImages}
            imageIndex={viewerIndex}
            visible={viewerVisible}
            onRequestClose={() => setViewerVisible(false)}
          />

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

          <View style={{ height: 80 }} />
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
  scrollContent: { padding: 16, paddingBottom: 136 },
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
