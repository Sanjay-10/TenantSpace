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
} from 'react-native';
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
  isSavingAnn,
  handleSaveAnnouncement,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editAnnId ? 'Edit Post' : 'New Post'}</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.modalLabel}>Title</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="e.g. Boiler service next Tuesday"
            value={annTitle}
            onChangeText={setAnnTitle}
            placeholderTextColor={C.mutedFg}
          />

          <Text style={styles.modalLabel}>Details</Text>
          <TextInput
            style={[styles.modalInput, styles.modalInputArea]}
            placeholder="Add description..."
            multiline
            value={annBody}
            onChangeText={setAnnBody}
            placeholderTextColor={C.mutedFg}
          />

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
            style={[styles.modalSaveBtn, isSavingAnn && { opacity: 0.7 }]} 
            onPress={handleSaveAnnouncement}
            disabled={isSavingAnn}
          >
            {isSavingAnn ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.modalSaveBtnText}>{editAnnId ? 'Update Post' : 'Post Announcement'}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
