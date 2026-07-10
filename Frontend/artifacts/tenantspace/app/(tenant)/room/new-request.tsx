import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../../constants/theme';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { pickImageOrVideo, uploadFileToSupabase } from '../../../lib/storage';

const CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: 'water-outline' },
  { id: 'electrical', label: 'Electrical', icon: 'flash-outline' },
  { id: 'heating', label: 'Heating', icon: 'flame-outline' },
  { id: 'appliance', label: 'Appliance', icon: 'radio-outline' },
  { id: 'locks', label: 'Locks / Keys', icon: 'key-outline' },
  { id: 'other', label: 'Other', icon: 'build-outline' }
];

const PRIORITIES = [
  { id: 'low', label: 'Low — not urgent', badgeBg: '#F1F5F9', badgeFg: '#475569', badgeLabel: 'Low' },
  { id: 'normal', label: 'Normal — this week', badgeBg: '#FEF3C7', badgeFg: '#92400E', badgeLabel: 'Normal' },
  { id: 'urgent', label: 'Urgent — ASAP', badgeBg: '#FEE2E2', badgeFg: '#991B1B', badgeLabel: 'Urgent' }
];

export default function NewRequestScreen() {
  const { propertyId, roomId } = useLocalSearchParams<{ propertyId: string, roomId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [category, setCategory] = useState<string>('plumbing');
  const [priority, setPriority] = useState<string>('normal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pickedFile, setPickedFile] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const file = await pickImageOrVideo();
    if (file && file.type === 'image') {
      setPickedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please provide a title and description.');
      return;
    }
    if (!profile?.id || !propertyId || !roomId) {
      Alert.alert('Error', 'Missing property or room information.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPhotoUrl = null;

      // Upload the photo to our new strict RLS bucket using the storage utility
      if (pickedFile) {
        const { url, error: uploadError } = await uploadFileToSupabase('maintenance-photos', propertyId, pickedFile);
        if (uploadError) {
          Alert.alert('Upload Failed', 'We could not upload the image.');
          setIsSubmitting(false);
          return;
        }
        finalPhotoUrl = url;
      }

      const { error } = await supabase.from('maintenance_requests').insert([{
        property_id: propertyId,
        room_id: roomId,
        tenant_id: profile.id,
        category,
        priority,
        title: title.trim(),
        description: description.trim(),
        photo_url: finalPhotoUrl,
        status: 'open'
      }]);

      if (error) throw error;
      
      router.back();
    } catch (err: any) {
      Alert.alert('Error submitting request', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back-outline" size={24} color="#64748B" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>New Request</Text>
          <Text style={styles.headerSubtitle}>Submit a maintenance issue</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Category section */}
        <Text style={styles.sectionTitle}>CATEGORY</Text>
        <View style={styles.grid}>
          {CATEGORIES.map(cat => {
            const isActive = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[styles.gridItem, isActive && styles.gridItemActive]}
              >
                <Ionicons 
                    name={cat.icon as any} 
                    size={28} 
                    color={isActive ? Theme.colors.primary : Theme.colors.fg} 
                  />
                <Text style={[styles.gridLabel, isActive && styles.gridLabelActive]}>{cat.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Priority section */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>PRIORITY</Text>
        <View style={styles.priorityList}>
          {PRIORITIES.map(p => {
            const isActive = priority === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPriority(p.id)}
                style={[styles.priorityItem, isActive && styles.priorityItemActive]}
              >
                <View style={styles.priorityLeft}>
                  <View style={[styles.radio, isActive && styles.radioActive]}>
                    {isActive && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.priorityLabel}>
                    <Text style={{ fontWeight: '700', color: Theme.colors.fg }}>{p.label.split('—')[0]}</Text>
                    <Text style={{ color: Theme.colors.mutedFg }}>—{p.label.split('—')[1]}</Text>
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: isActive ? p.badgeBg : Theme.colors.muted }]}>
                  <Text style={[styles.badgeText, { color: isActive ? p.badgeFg : Theme.colors.mutedFg }]}>{p.badgeLabel}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Title section */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>TITLE</Text>
        <TextInput 
          style={styles.input}
          placeholder="e.g. Boiler not heating"
          placeholderTextColor={Theme.colors.mutedFg}
          value={title}
          onChangeText={setTitle}
        />

        {/* Description section */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>DESCRIPTION</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          placeholder="Describe the issue in detail — when it started, how severe it is..."
          placeholderTextColor={Theme.colors.mutedFg}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {/* Photo Attachment */}
        {pickedFile ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: pickedFile.uri }} style={styles.photoPreview} />
            <Pressable style={styles.removePhotoBtn} onPress={() => setPickedFile(null)}>
              <Ionicons name="close-outline" size={16} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.attachBtn} onPress={pickImage}>
            <Ionicons name="images-outline" size={32} color="#475569" style={{ marginRight: 16 }} />
            <View>
              <Text style={styles.attachTitle}>Attach a photo</Text>
              <Text style={styles.attachSub}>Helps the landlord understand the issue faster</Text>
            </View>
          </Pressable>
        )}

        {/* Submit button */}
        <Pressable 
          style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Request</Text>
          )}
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.bg },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Theme.colors.muted, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 16, color: Theme.colors.mutedFg },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.fg, letterSpacing: -0.4 },
  headerSubtitle: { fontSize: 12, color: Theme.colors.mutedFg, marginTop: 1 },
  
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.mutedFg,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '31%',
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  gridItemActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#fff',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIcon: { fontSize: 24 },
  gridLabel: { fontSize: 11, fontWeight: '600', color: Theme.colors.mutedFg },
  gridLabelActive: { color: Theme.colors.fg, fontWeight: '700' },
  
  priorityList: { gap: 10 },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
  },
  priorityItemActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#fff',
  },
  priorityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Theme.colors.mutedFg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Theme.colors.primary },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.primary },
  priorityLabel: { fontSize: 14 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  
  input: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    fontSize: 14,
    color: Theme.colors.fg,
  },
  textArea: {
    height: 120,
  },
  
  attachBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  attachIcon: {
    fontSize: 24,
  },
  attachTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.fg,
  },
  attachSub: {
    fontSize: 11,
    color: Theme.colors.mutedFg,
    marginTop: 2,
  },
  photoContainer: {
    marginTop: 6,
    position: 'relative',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  
  submitBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
