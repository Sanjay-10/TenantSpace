import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../../constants/theme';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import ImageViewing from 'react-native-image-viewing';
import { decode } from 'base64-arraybuffer';
import { LinearGradient } from 'expo-linear-gradient';

type Tab = 'room' | 'docs';

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateString;
};

export default function PreviousRoomScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<Tab>('room');
  
  // Edit State
  const [propertyName, setPropertyName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [rent, setRent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [customDetails, setCustomDetails] = useState<{label: string, value: string}[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Media Viewer State
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<{uri: string}[]>([]);

  // Fetch Room Data
  const { data: room, isLoading: roomLoading, refetch: refetchRoom } = useQuery({
    queryKey: ['previousRoom', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_previous_rooms')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch Docs Data
  const { data: docs = [], isLoading: docsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ['previousRoomDocs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_previous_room_docs')
        .select('*')
        .eq('previous_room_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      const docsWithLocalUrls = await Promise.all(data.map(async (doc: any) => {
        let path = doc.file_url;
        if (path.includes('tenant-docs/')) {
          path = path.split('tenant-docs/')[1];
        }
        
        const localFileName = path.split('/').pop() || doc.id;
        const localUri = `${FileSystem.documentDirectory}tenant-docs_${localFileName}`;
        
        try {
          const fileInfo = await FileSystem.getInfoAsync(localUri);
          if (fileInfo.exists) {
            return { ...doc, file_url: localUri, storage_path: path };
          }
        } catch (e) {}

        const { data: signedData } = await supabase.storage
          .from('tenant-docs')
          .createSignedUrl(path, 60 * 60);
          
        const downloadUrl = signedData?.signedUrl;
        if (downloadUrl) {
          try {
            const result = await FileSystem.downloadAsync(downloadUrl, localUri);
            if (result.status === 200) {
              return { ...doc, file_url: result.uri, storage_path: path };
            }
          } catch (e) {}
        }
          
        return { ...doc, file_url: downloadUrl || doc.file_url, storage_path: path };
      }));
      
      return docsWithLocalUrls;
    },
    enabled: !!id,
  });

  // Initialize edit state when data loads
  useEffect(() => {
    if (room && !isEditing) {
      setPropertyName(room.property_name || '');
      setRoomName(room.room_name || '');
      setRent(room.monthly_rent ? String(room.monthly_rent) : '');
      setStartDate(room.start_date || '');
      setEndDate(room.end_date || '');
      if (room.notes) {
        try {
          const parsed = JSON.parse(room.notes);
          if (parsed.customDetails || parsed.rawNotes !== undefined) {
            setCustomDetails(parsed.customDetails || []);
            setRawNotes(parsed.rawNotes || '');
          } else {
            setRawNotes(room.notes);
            setCustomDetails([]);
          }
        } catch {
          setRawNotes(room.notes);
          setCustomDetails([]);
        }
      } else {
        setRawNotes('');
        setCustomDetails([]);
      }
    }
  }, [room]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tenant_previous_rooms')
        .update({
          property_name: propertyName.trim(),
          room_name: roomName.trim(),
          monthly_rent: parseInt(rent) || null,
          start_date: startDate || null,
          end_date: endDate || null,
          notes: JSON.stringify({ rawNotes: rawNotes.trim(), customDetails }),
        })
        .eq('id', id);

      if (error) throw error;
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEditing(false);
      refetchRoom();
      queryClient.invalidateQueries({ queryKey: ['tenantPreviousRooms', profile?.id] });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDoc = async (doc: any) => {
    const isImage = doc.name.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
    if (isImage) {
      setViewerImages([{ uri: doc.file_url }]);
      setViewerVisible(true);
    } else {
      if (Platform.OS === 'android') {
        try {
          const contentUri = await FileSystem.getContentUriAsync(doc.file_url);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
          });
        } catch (e) {
          Sharing.shareAsync(doc.file_url);
        }
      } else {
        Sharing.shareAsync(doc.file_url);
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Room',
      'Are you sure you want to delete this previous room and all its documents? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.from('tenant_previous_rooms').delete().eq('id', id);
              queryClient.invalidateQueries({ queryKey: ['tenantPreviousRooms', profile?.id] });
              router.replace('/(tenant)/home');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete room.');
            }
          }
        }
      ]
    );
  };

  const handleUploadDoc = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0].uri) return;

      setUploading(true);
      let fileUri = result.assets[0].uri;
      const fileMime = result.assets[0].mimeType || 'application/octet-stream';
      let fileExt = result.assets[0].name.split('.').pop() || 'file';

      if (fileMime.startsWith('image/')) {
        const manipResult = await ImageManipulator.manipulateAsync(
          fileUri,
          [{ resize: { width: 1200 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        fileUri = manipResult.uri;
        fileExt = 'jpg';
      }

      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile?.id}/${id}/${fileName}`;
      
      const base64Data = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      const fileData = decode(base64Data);

      const { error: uploadError } = await supabase.storage
        .from('tenant-docs')
        .upload(filePath, fileData, {
          contentType: fileMime.startsWith('image/') ? 'image/jpeg' : fileMime,
        });

      if (uploadError) throw uploadError;

      const originalName = result.assets[0].name || 'Document ' + (docs.length + 1);

      const { error: dbError } = await supabase
        .from('tenant_previous_room_docs')
        .insert({
          previous_room_id: id,
          tenant_id: profile?.id,
          name: originalName,
          file_url: filePath,
        });

      if (dbError) throw dbError;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetchDocs();
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload document.');
    } finally {
      setUploading(false);
    }
  };

  if (roomLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Room not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Theme.colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </Pressable>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{room.property_name}</Text>
            <Text style={styles.headerSub}>{room.room_name}</Text>
          </View>
          <Pressable onPress={() => setIsEditing(!isEditing)} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#2563EB' }}>{isEditing ? 'Cancel' : 'Edit'}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {isEditing ? (
          /* EDIT FORM */
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Edit Details</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>House Name</Text>
              <TextInput style={styles.input} value={propertyName} onChangeText={setPropertyName} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput style={styles.input} value={roomName} onChangeText={setRoomName} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monthly Rent ($)</Text>
              <TextInput style={styles.input} value={rent} onChangeText={setRent} keyboardType="number-pad" />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>End Date</Text>
                <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput 
                style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} 
                value={rawNotes} 
                onChangeText={setRawNotes} 
                multiline 
                placeholder="Any past notes, landlord details, etc."
              />
            </View>

            <View style={{ marginTop: 12, gap: 12 }}>
              <Text style={styles.label}>Additional Details</Text>
              {customDetails.map((d, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput style={[styles.input, { flex: 1 }]} value={d.label} onChangeText={(txt) => {
                    const newD = [...customDetails]; newD[i].label = txt; setCustomDetails(newD);
                  }} placeholder="Label (e.g. Deposit)" />
                  <TextInput style={[styles.input, { flex: 1 }]} value={d.value} onChangeText={(txt) => {
                    const newD = [...customDetails]; newD[i].value = txt; setCustomDetails(newD);
                  }} placeholder="Value (e.g. $50)" />
                  <Pressable onPress={() => {
                    const newD = customDetails.filter((_, idx) => idx !== i); setCustomDetails(newD);
                  }} style={{ justifyContent: 'center', paddingHorizontal: 4 }}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
              <Pressable onPress={() => setCustomDetails([...customDetails, {label: '', value: ''}])} style={{ padding: 12, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center' }}>
                <Text style={{ color: '#2563EB', fontWeight: '600' }}>+ Add Detail</Text>
              </Pressable>
            </View>

            <Pressable onPress={handleUpdate} disabled={saving} style={styles.primaryBtn}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save Changes</Text>}
            </Pressable>
            
            <Pressable onPress={handleDelete} style={styles.dangerBtn}>
              <Text style={styles.dangerBtnText}>Delete Room</Text>
            </Pressable>
          </View>
        ) : (
          /* TABS CONTENT */
          <>
            {activeTab === 'room' && (
              <View style={{ gap: 16 }}>
                <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.heroCard}>
                  <Text style={styles.heroSubTitle}>PAST HOUSE</Text>
                  <Text style={styles.heroTitle}>{room.property_name}</Text>
                  <Text style={styles.heroAddress}>{room.room_name}</Text>
                  
                  <View style={styles.heroStats}>
                    <View>
                      <Text style={styles.statLabel}>Monthly Rent</Text>
                      <Text style={styles.statValue}>${room.monthly_rent || 0}</Text>
                    </View>
                    <View>
                      <Text style={styles.statLabel}>Status</Text>
                      <View style={{ backgroundColor: '#FD615A', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 4, alignSelf: 'flex-start' }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>INACTIVE</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>

                <View style={styles.detailsCard}>
                  <Text style={styles.detailsTitle}>House Details</Text>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Lease start</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(room.start_date)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Lease end</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(room.end_date)}
                    </Text>
                  </View>
                  
                  {(() => {
                    let dispNotes = room.notes || '';
                    let dispDetails: {label: string, value: string}[] = [];
                    try {
                      if (room.notes) {
                        const p = JSON.parse(room.notes);
                        if (p.customDetails || p.rawNotes !== undefined) {
                          dispDetails = p.customDetails || [];
                          dispNotes = p.rawNotes || '';
                        }
                      }
                    } catch {}
                    
                    return (
                      <>
                        {dispDetails.map((d, i) => (
                          <View key={i} style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{d.label}</Text>
                            <Text style={styles.detailValue}>{d.value}</Text>
                          </View>
                        ))}
                        
                        {dispNotes ? (
                          <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                            <Text style={[styles.detailLabel, { marginBottom: 4 }]}>Notes</Text>
                            <Text style={styles.detailValue}>{dispNotes}</Text>
                          </View>
                        ) : null}
                      </>
                    );
                  })()}
                </View>
                
                <Text style={{ fontSize: 11, color: Theme.colors.mutedFg, textAlign: 'center', marginTop: 4, fontStyle: 'italic', opacity: 0.8 }}>
                  Tap Edit to add additional house details and notes.
                </Text>
              </View>
            )}

            {activeTab === 'docs' && (
              <View style={styles.card}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={[styles.sectionTitle, { textTransform: 'uppercase' }]}>Documents</Text>
                </View>

                {docsLoading ? (
                  <ActivityIndicator color={Theme.colors.primary} />
                ) : docs.length === 0 ? (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <Ionicons name="document-text-outline" size={48} color={Theme.colors.border} />
                    <Text style={{ color: Theme.colors.mutedFg, marginTop: 8, fontFamily: Theme.fonts.regular }}>No documents yet.</Text>
                  </View>
                ) : (
                  <View style={{ gap: 12 }}>
                    {docs.map((doc: any) => {
                      const ext = doc.name.split('.').pop()?.toLowerCase();
                      const isImage = ['jpeg', 'jpg', 'gif', 'png', 'webp'].includes(ext || '');
                      
                      let iconName = 'file-document';
                      let iconColor = '#64748B';
                      
                      if (!isImage) {
                        switch(ext) {
                          case 'pdf': iconName = 'file-pdf-box'; iconColor = '#EF4444'; break;
                          case 'doc':
                          case 'docx': iconName = 'file-word-box'; iconColor = '#3B82F6'; break;
                          case 'xls':
                          case 'xlsx':
                          case 'csv': iconName = 'microsoft-excel'; iconColor = '#10B981'; break;
                          case 'ppt':
                          case 'pptx': iconName = 'microsoft-powerpoint'; iconColor = '#F97316'; break;
                          case 'zip':
                          case 'rar':
                          case '7z': iconName = 'folder-zip'; iconColor = '#EAB308'; break;
                          case 'txt': iconName = 'file-document-outline'; iconColor = '#64748B'; break;
                          default: iconName = 'file-document'; iconColor = '#64748B'; break;
                        }
                      }

                      return (
                        <Pressable key={doc.id} onPress={() => handleOpenDoc(doc)} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                          <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {isImage ? (
                              <Image source={{ uri: doc.file_url }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                              <MaterialCommunityIcons name={iconName as any} size={28} color={iconColor} />
                            )}
                          </View>
                          
                          <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: '#1E293B' }} numberOfLines={1}>{doc.name}</Text>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Pressable 
                              onPress={() => Sharing.shareAsync(doc.file_url)} 
                              style={{ padding: 8 }}
                              hitSlop={8}
                            >
                              <Ionicons name="share-outline" size={22} color="#64748B" />
                            </Pressable>
                            
                            <Pressable 
                              onPress={() => {
                                Alert.alert('Delete Document', 'Are you sure you want to delete this document?', [
                                  { text: 'Cancel', style: 'cancel' },
                                  { 
                                    text: 'Delete', 
                                    style: 'destructive', 
                                    onPress: async () => {
                                      try {
                                        // 1. Fetch exact original path from DB to bypass ALL local cache issues
                                        const { data: dbDoc, error: fetchError } = await supabase
                                          .from('tenant_previous_room_docs')
                                          .select('file_url')
                                          .eq('id', doc.id)
                                          .single();
                                          
                                        if (fetchError || !dbDoc) throw new Error('Document no longer exists in database.');
                                        
                                        let rawPath = dbDoc.file_url;
                                        if (rawPath.includes('tenant-docs/')) {
                                          rawPath = rawPath.split('tenant-docs/')[1];
                                        }
                                        
                                        const cleanPath = rawPath.split('?')[0];
                                        
                                        // 2. Delete from Storage
                                        const { data, error: storageError } = await supabase.storage.from('tenant-docs').remove([cleanPath]);
                                        
                                        if (storageError) {
                                          throw new Error(storageError.message);
                                        }
                                        if (!data || data.length === 0) {
                                          throw new Error(`Storage returned 0 files deleted for path: ${cleanPath}`);
                                        }
                                        
                                        // 3. Delete from Database
                                        const { error: dbError } = await supabase.from('tenant_previous_room_docs').delete().eq('id', doc.id);
                                        if (dbError) throw dbError;
                                        
                                        refetchDocs();
                                      } catch (err: any) {
                                        Alert.alert('Delete Failed', err.message);
                                      }
                                    }
                                  }
                                ]);
                              }} 
                              style={{ padding: 8 }}
                              hitSlop={8}
                            >
                              <Ionicons name="trash-outline" size={22} color="#EF4444" />
                            </Pressable>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button for Docs */}
      {!isEditing && activeTab === 'docs' && (
        <View style={{ position: 'absolute', bottom: (insets.bottom > 0 ? insets.bottom : 20) + 70, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
          <Pressable 
            onPress={handleUploadDoc} 
            disabled={uploading}
            style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 }}
          >
            {uploading ? <ActivityIndicator color="#fff" /> : <Ionicons name="add" size={32} color="#fff" />}
          </Pressable>
        </View>
      )}

      {/* Custom Bottom Pill Segments */}
      {!isEditing && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
          <View style={styles.pillContainer}>
            <Pressable 
              onPress={() => setActiveTab('room')}
              style={[styles.pillBtn, activeTab === 'room' && styles.pillBtnActive]}
            >
              <Text style={[styles.pillText, activeTab === 'room' && styles.pillTextActive]}>My Room</Text>
            </Pressable>
            <Pressable 
              onPress={() => setActiveTab('docs')}
              style={[styles.pillBtn, activeTab === 'docs' && styles.pillBtnActive]}
            >
              <Text style={[styles.pillText, activeTab === 'docs' && styles.pillTextActive]}>Docs</Text>
            </Pressable>
          </View>
        </View>
      )}
      
      <ImageViewing
        images={viewerImages}
        imageIndex={0}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
        swipeToCloseEnabled
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.bg },
  header: {
    backgroundColor: Theme.colors.card,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.fg, fontFamily: Theme.fonts.bold },
  headerSub: { fontSize: 13, color: Theme.colors.mutedFg, fontFamily: Theme.fonts.regular },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 24,
  },
  tab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.mutedFg,
  },
  activeTabText: {
    color: Theme.colors.primary,
  },
  scrollContent: { padding: 16, gap: 16 },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 12,
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Theme.colors.mutedFg, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
  inputGroup: { gap: 6 },
  label: { fontSize: 11, fontWeight: '700', color: Theme.colors.mutedFg, textTransform: 'uppercase' },
  input: {
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    padding: 12,
    fontSize: 14,
    color: Theme.colors.fg,
    backgroundColor: Theme.colors.bg,
  },
  primaryBtn: {
    backgroundColor: Theme.colors.primary,
    padding: 14,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: Theme.fonts.bold },
  dangerBtn: {
    backgroundColor: Theme.colors.danger + '15',
    padding: 14,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.danger + '30',
  },
  dangerBtnText: { color: Theme.colors.danger, fontSize: 14, fontWeight: '700', fontFamily: Theme.fonts.bold },
  
  heroCard: { borderRadius: 18, padding: 20, color: '#fff' },
  heroSubTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, opacity: 0.8, color: '#fff' },
  heroTitle: { fontSize: 26, fontWeight: '800', marginTop: 4, letterSpacing: -0.5, color: '#fff' },
  heroAddress: { fontSize: 13, opacity: 0.85, marginTop: 2, color: '#fff' },
  heroStats: { flexDirection: 'row', gap: 24, marginTop: 16 },
  statLabel: { fontSize: 11, opacity: 0.75, color: '#fff' },
  statValue: { fontWeight: '700', fontSize: 16, color: '#fff', marginTop: 2 },
  
  detailsCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border, padding: 16 },
  detailsTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.fg, marginBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: Theme.colors.border, marginTop: 8 },
  detailLabel: { fontSize: 12, color: Theme.colors.mutedFg },
  detailValue: { fontSize: 12, fontWeight: '600', color: Theme.colors.fg },
  
  docsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  docItem: { width: '48%', gap: 6 },
  docImage: { width: '100%', height: 120, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.muted },
  docName: { fontSize: 12, color: Theme.colors.fg, fontWeight: '600' },

  bottomBar: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 10, paddingHorizontal: 12 },
  pillContainer: { flexDirection: 'row', backgroundColor: Theme.colors.muted, borderRadius: 14, padding: 4, gap: 3 },
  pillBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pillBtnActive: { backgroundColor: '#fff', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  pillText: { fontSize: 12, fontWeight: '500', color: Theme.colors.mutedFg },
  pillTextActive: { fontWeight: '700', color: Theme.colors.primary },
});
