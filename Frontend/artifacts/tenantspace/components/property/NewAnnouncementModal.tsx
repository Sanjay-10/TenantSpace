import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  Image,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { C } from './propertyStyles';
import { styles } from './propertyStyles'; // Wait, let's just export styles from propertyStyles

interface Props {
  visible: boolean;
  onClose: () => void;
  editAnnId: string | null;
  annTitle: string;
  setAnnTitle: (val: string) => void;
  annBody: string;
  setAnnBody: (val: string) => void;
  annExpiry: number;
  setAnnExpiry: (val: number) => void;
  isCustomExpiry: boolean;
  setIsCustomExpiry: (val: boolean) => void;
  annImageUri: string | null;
  setAnnImageUri: (uri: string | null) => void;
  isSavingAnn: boolean;
  handleSaveAnnouncement: () => void;
}

export default function NewAnnouncementModal({
  visible,
  onClose,
  editAnnId,
  annTitle,
  setAnnTitle,
  annBody,
  setAnnBody,
  annExpiry,
  setAnnExpiry,
  isCustomExpiry,
  setIsCustomExpiry,
  annImageUri,
  setAnnImageUri,
  isSavingAnn,
  handleSaveAnnouncement,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%', flexShrink: 1, overflow: 'hidden', padding: 0 }]}>
          <View style={[styles.modalHeader, { padding: 20, paddingBottom: 0 }]}>
              <Text style={styles.modalTitle}>{editAnnId ? 'Edit Post' : 'New Post'}</Text>
              <Pressable onPress={onClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

          <ScrollView 
            style={{ flexShrink: 1 }} 
            contentContainerStyle={{ padding: 20, paddingTop: 10, paddingBottom: 40 }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.modalLabel, { marginTop: 0 }]}>Title</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Boiler service next Tuesday"
              value={annTitle}
              onChangeText={setAnnTitle}
              placeholderTextColor={C.mutedFg}
            />

            <Text style={styles.modalLabel}>Details</Text>
            <TextInput
              style={[styles.modalInput, styles.modalInputArea, { minHeight: 120, textAlignVertical: 'top' }]}
              placeholder="Add description..."
              multiline
              value={annBody}
              onChangeText={setAnnBody}
              placeholderTextColor={C.mutedFg}
            />

            <Pressable 
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 0, paddingVertical: 8, paddingHorizontal: 4 }}
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0].uri) {
                setAnnImageUri(result.assets[0].uri);
              }
            }}
          >
            <View style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 10, 
              borderWidth: 1, 
              borderColor: '#E2E8F0',
              backgroundColor: '#F8FAFC',
              justifyContent: 'center', 
              alignItems: 'center',
              marginRight: 16
            }}>
              <Ionicons name="add" size={20} color={C.primary} />
            </View>
            <View>
              <Text style={{ color: C.primary, fontSize: 14, fontWeight: '500' }}>
                {annImageUri ? 'Change image' : 'Add an image'}
              </Text>
              <Text style={{ color: C.mutedFg, fontSize: 12, marginTop: 2 }}>
                5 Mb max.
              </Text>
            </View>
          </Pressable>
          {annImageUri && (
            <View style={{ marginBottom: 16 }}>
              <Image source={{ uri: annImageUri }} style={{ width: '100%', height: 120, borderRadius: 8 }} />
              <Pressable 
                style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 16 }}
                onPress={() => setAnnImageUri(null)}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✕</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.modalLabel}>Expires in</Text>
          <View style={styles.expiryOptionsRow}>
            {[1, 3, 5, 7].map(days => (
              <Pressable
                key={days}
                style={[styles.expiryBtn, !isCustomExpiry && annExpiry === days && styles.expiryBtnActive]}
                onPress={() => {
                  setIsCustomExpiry(false);
                  setAnnExpiry(days);
                }}
              >
                <Text style={[styles.expiryBtnText, !isCustomExpiry && annExpiry === days && styles.expiryBtnTextActive]}>
                  {days} {days === 1 ? 'd' : 'd'}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.expiryBtn, isCustomExpiry && styles.expiryBtnActive]}
              onPress={() => setIsCustomExpiry(true)}
            >
              <Text style={[styles.expiryBtnText, isCustomExpiry && styles.expiryBtnTextActive]}>
                Custom
              </Text>
            </Pressable>
          </View>

          {isCustomExpiry && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                style={styles.modalInput}
                placeholder="Number of days..."
                value={String(annExpiry)}
                onChangeText={(text) => setAnnExpiry(parseInt(text) || 0)}
                keyboardType="numeric"
                placeholderTextColor={C.mutedFg}
              />
            </View>
          )}
            <Pressable 
              style={[styles.modalSaveBtn, isSavingAnn && { opacity: 0.7 }, { marginTop: 16, marginBottom: 20 }]} 
              onPress={handleSaveAnnouncement}
              disabled={isSavingAnn}
            >
              {isSavingAnn ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalSaveBtnText}>{editAnnId ? 'Update Post' : 'Post Announcement'}</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
