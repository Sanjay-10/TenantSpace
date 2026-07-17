import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddPreviousRoomScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate.toISOString().split('T')[0]);
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate.toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    if (!propertyName.trim() || !address.trim()) {
      Alert.alert('Error', 'House Name and Address are required.');
      return;
    }

    setLoading(true);
    try {
      const rentValue = parseInt(rent) || null;
      
      let start_date = null;
      let end_date = null;
      
      if (startDate) {
        const d = new Date(startDate);
        if (!isNaN(d.getTime())) start_date = d.toISOString().split('T')[0];
      }
      if (endDate) {
        const d = new Date(endDate);
        if (!isNaN(d.getTime())) end_date = d.toISOString().split('T')[0];
      }
      
      const { data, error } = await supabase
        .from('tenant_previous_rooms')
        .insert({
          tenant_id: profile?.id,
          property_name: propertyName.trim(),
          room_name: address.trim(),
          monthly_rent: rentValue,
          start_date,
          end_date,
        })
        .select()
        .single();

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['tenantPreviousRooms', profile?.id] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/(tenant)/previous-room/${data.id}`);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to save previous room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Top Navigation */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <View style={styles.topBarContent}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#64748B" />
          </Pressable>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Add Previous Room</Text>
            <Text style={styles.subtitle}>Personal Archive</Text>
          </View>
          <View style={{ width: 34 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Hero Card */}
        <LinearGradient
          colors={[Theme.colors.g1, Theme.colors.g3]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="archive-outline" size={24} color={Theme.colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Archive a Room</Text>
          <Text style={styles.heroSubtitle}>
            Save details about a previous place you lived to keep your history organized.
          </Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>House Name *</Text>
            <TextInput
              value={propertyName}
              onChangeText={setPropertyName}
              placeholder="e.g. Oak House"
              placeholderTextColor={Theme.colors.mutedFg}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 5 Oak Rd, London N4 1BG"
              placeholderTextColor={Theme.colors.mutedFg}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monthly Rent</Text>
            <View style={styles.currencyWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                value={rent}
                onChangeText={setRent}
                placeholder="800"
                placeholderTextColor={Theme.colors.mutedFg}
                keyboardType="number-pad"
                style={[styles.input, styles.currencyInput]}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Move-in Date</Text>
              <Pressable style={styles.dateWrapper} onPress={() => setShowStartPicker(true)}>
                <View pointerEvents="none">
                  <TextInput
                    value={startDate}
                    editable={false}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Theme.colors.mutedFg}
                    style={[styles.input, styles.dateInput]}
                  />
                </View>
                <Ionicons name="calendar-outline" size={20} color={Theme.colors.mutedFg} style={styles.dateIcon} />
              </Pressable>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate ? new Date(startDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onStartDateChange}
                />
              )}
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Move-out Date</Text>
              <Pressable style={styles.dateWrapper} onPress={() => setShowEndPicker(true)}>
                <View pointerEvents="none">
                  <TextInput
                    value={endDate}
                    editable={false}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Theme.colors.mutedFg}
                    style={[styles.input, styles.dateInput]}
                  />
                </View>
                <Ionicons name="calendar-outline" size={20} color={Theme.colors.mutedFg} style={styles.dateIcon} />
              </Pressable>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate ? new Date(endDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onEndDateChange}
                />
              )}
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={loading}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && { opacity: 0.85 },
              loading && { opacity: 0.5 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaButtonText}>Save Room</Text>
            )}
          </Pressable>
        </View>
      <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.bg },
  topBar: {
    backgroundColor: Theme.colors.card,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
    zIndex: 10,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: 14, fontWeight: '700', color: Theme.colors.fg, fontFamily: Theme.fonts.bold },
  subtitle: { fontSize: 11, color: Theme.colors.mutedFg, fontFamily: Theme.fonts.regular, marginTop: 1 },
  scrollContent: { flexGrow: 1, padding: 16, gap: 16 },
  heroCard: {
    borderRadius: Theme.radius.xl,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.6, marginBottom: 4 },
  heroSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 16 },
  formCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    gap: 16,
  },
  inputGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: '700', color: Theme.colors.mutedFg, textTransform: 'uppercase', letterSpacing: 1.2 },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    fontSize: 14,
    color: Theme.colors.fg,
    backgroundColor: Theme.colors.bg,
  },
  currencyWrapper: { position: 'relative', justifyContent: 'center' },
  currencySymbol: { position: 'absolute', left: 14, fontSize: 16, fontWeight: '600', color: Theme.colors.fg, zIndex: 5 },
  currencyInput: { paddingLeft: 30 },
  dateWrapper: { position: 'relative', justifyContent: 'center' },
  dateInput: { paddingRight: 40 },
  dateIcon: { position: 'absolute', right: 14, zIndex: 5 },
  ctaButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: Theme.fonts.bold },
});


