import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Platform, Alert, Image, ScrollView, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import ImageViewing from 'react-native-image-viewing';
import { Theme } from '../../../constants/theme';

interface DocsTabProps {
  documents: any[];
}

export function DocsTab({ documents }: DocsTabProps) {
  const [viewerImages, setViewerImages] = useState<{uri: string}[]>([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState({ x: 0, y: 0 });
  const menuRefs = useRef<{ [key: string]: any }>({});

  if (!documents || documents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No documents have been shared by your landlord yet.</Text>
      </View>
    );
  }

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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {openMenuId && (
        <Pressable 
          style={[StyleSheet.absoluteFill, { zIndex: 9998, elevation: 9998 }]} 
          onPress={() => setOpenMenuId(null)} 
        />
      )}
      {documents.map(doc => {
        const ext = doc.name.split('.').pop()?.toLowerCase();
        const isImage = ['jpeg', 'jpg', 'gif', 'png', 'webp'].includes(ext || '');
        
        let iconProps = { name: 'file-document-outline', color: '#64748B' };
        switch(ext) {
          case 'pdf': iconProps = { name: 'file-pdf-box', color: '#EF4444' }; break;
          case 'doc':
          case 'docx': iconProps = { name: 'file-word-box', color: '#2563EB' }; break;
          case 'xls':
          case 'xlsx': iconProps = { name: 'file-excel-box', color: '#16A34A' }; break;
          case 'zip':
          case 'rar':
          case '7z': iconProps = { name: 'folder-zip', color: '#EAB308' }; break;
          case 'txt': iconProps = { name: 'file-document-outline', color: '#64748B' }; break;
        }

        return (
          <View 
            key={doc.id} 
            style={[styles.docCard, {
              zIndex: openMenuId === doc.id ? 9999 : 1,
              elevation: openMenuId === doc.id ? 9999 : 1
            }]}
          >
            <Pressable 
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              onPress={() => handleOpenDoc(doc)}
            >
              <View style={styles.iconContainer}>
                {isImage ? (
                  <Image source={{ uri: doc.file_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <MaterialCommunityIcons name={iconProps.name} size={24} color={iconProps.color} />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 12, paddingRight: 12 }}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <Text style={styles.docDate}>
                  {new Date(doc.created_at).toLocaleDateString()}
                </Text>
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
                            </Pressable>
                          </Pressable>
                        </Modal>
                      </View>
          </View>
        );
      })}
      
      <ImageViewing
        images={viewerImages}
        imageIndex={viewerIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 16, paddingBottom: 136, gap: 12 },
  emptyContainer: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Theme.colors.mutedFg, textAlign: 'center', lineHeight: 20 },
  docCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.border, padding: 12, flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  imageThumb: { width: '100%', height: '100%' },
  docName: { fontSize: 13, fontWeight: '600', color: Theme.colors.fg, marginBottom: 2 },
  docDate: { fontSize: 11, color: Theme.colors.mutedFg },
});

