import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { BlurView } from 'expo-blur';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { C } from './propertyStyles';

interface AddRoomModalProps {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName?: string;
}

export default function AddRoomModal({ visible, onClose, propertyId, propertyName = 'PROP' }: AddRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('800');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const generateCode = (propName: string) => {
    const prefix = propName.slice(0, 4).replace(/\s/g, '').toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomNum = Math.floor(Math.random() * 90 + 10); // 10-99
    return `${prefix}-${randomNum}-${random}`;
  };

  const addRoomMutation = useMutation({
    mutationFn: async () => {
      const rentVal = parseInt(monthlyRent);
      if (isNaN(rentVal) || rentVal < 0) {
        throw new Error('Please enter a valid monthly rent amount.');
      }
      if (!roomName.trim()) {
        throw new Error('Please enter a room name.');
      }

      const inviteCode = generateCode(propertyName);

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          property_id: propertyId,
          name: roomName.trim(),
          monthly_rent: rentVal,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['propertyData', propertyId] });
      if (data && data.invite_code) {
        setCreatedCode(data.invite_code);
      } else {
        resetAndClose();
      }
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to add room.');
    }
  });

  const handleSave = () => {
    addRoomMutation.mutate();
  };

  const resetAndClose = () => {
    setCreatedCode(null);
    setRoomName('');
    setMonthlyRent('800');
    onClose();
  };

  const copyCode = async () => {
    if (createdCode) {
      await Clipboard.setStringAsync(createdCode);
      Alert.alert('Copied!', 'Invite code copied to clipboard.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={resetAndClose} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Room</Text>
              <Pressable onPress={resetAndClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {createdCode ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successEmoji}>🎉</Text>
                  <Text style={styles.successTitle}>Room Created!</Text>
                  <Text style={styles.successSubtitle}>Share this invite code with the new tenant so they can join.</Text>
                  <Pressable style={styles.codeBox} onPress={copyCode}>
                    <Text style={styles.codeText}>{createdCode}</Text>
                    <Text style={styles.copyBtnText}>Copy</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Room Name</Text>
                    <TextInput
                  style={styles.input}
                  placeholder="e.g. Master Bedroom"
                  placeholderTextColor={C.mutedFg}
                  value={roomName}
                  onChangeText={setRoomName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Monthly Rent ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="800"
                    placeholderTextColor={C.mutedFg}
                    value={monthlyRent}
                    onChangeText={setMonthlyRent}
                    keyboardType="numeric"
                  />
                </View>
              </>
              )}
            </ScrollView>

            {!createdCode && (
              <View style={styles.modalFooter}>
                <Pressable 
                  style={[styles.saveBtn, addRoomMutation.isPending && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={addRoomMutation.isPending}
                >
                  {addRoomMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Create Room</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: C.card,
    borderRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.fg,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.mutedFg,
  },
  scrollContent: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.fg,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.muted,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: C.fg,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalFooter: {
    padding: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  saveBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: C.fg,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: C.mutedFg,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.muted,
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
  },
  codeText: {
    fontSize: 22,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 1,
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
  },
});
