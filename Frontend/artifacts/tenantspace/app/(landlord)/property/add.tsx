import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

type Step = 'details' | 'rooms' | 'done';
type PropertyType = 'Shared House' | 'Flat' | 'Studio' | 'Other';

interface GeneratedRoom {
  name: string;
  code: string;
}

export default function AddPropertyScreen() {
  const [step, setStep] = useState<Step>('details');
  
  // Step 1: Details
  const [propertyType, setPropertyType] = useState<PropertyType>('Shared House');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  
  // Step 2: Rooms
  const [roomCount, setRoomCount] = useState(3);
  const [roomNames, setRoomNames] = useState<string[]>(['Room 1', 'Room 2', 'Room 3']);
  const [defaultRent, setDefaultRent] = useState('800');
  
  // Step 3: Success
  const [createdRooms, setCreatedRooms] = useState<GeneratedRoom[]>([]);
  const [createdPropertyId, setCreatedPropertyId] = useState('');
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();

  const handleNextStep = () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setStep('rooms');
  };

  const generateCode = (propName: string, roomIndex: number) => {
    const prefix = propName.slice(0, 4).replace(/\s/g, '').toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${roomIndex + 1}-${random}`;
  };

  const handleCreateProperty = async () => {
    const rentVal = parseInt(defaultRent);
    if (isNaN(rentVal) || rentVal <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly rent amount.');
      return;
    }

    if (!profile?.id) {
      Alert.alert('Session Error', 'You must be logged in to create a property.');
      return;
    }

    setLoading(true);
    try {
      // 1. Insert property into Supabase
      const { data: propData, error: propError } = await supabase
        .from('properties')
        .insert({
          landlord_id: profile.id,
          name: name.trim(),
          address: address.trim(),
          property_type: propertyType,
        })
        .select()
        .single();

      if (propError) throw propError;

      // 2. Generate room array with unique invite codes
      const generatedList: GeneratedRoom[] = [];
      const roomsToInsert = Array.from({ length: roomCount }).map((_, i) => {
        const roomName = roomNames[i] || `Room ${i + 1}`;
        const code = generateCode(name.trim(), i);
        generatedList.push({ name: roomName, code });
        
        return {
          property_id: propData.id,
          name: roomName,
          monthly_rent: rentVal,
          invite_code: code,
          bills_included: true,
        };
      });

      // 3. Bulk insert rooms into Supabase
      const { error: roomsError } = await supabase
        .from('rooms')
        .insert(roomsToInsert);

      if (roomsError) throw roomsError;

      // 4. Trigger Success State
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCreatedRooms(generatedList);
      setCreatedPropertyId(propData.id);
      setStep('done');
    } catch (err) {
      console.error('Error creating property:', err);
      Alert.alert('Error', 'Failed to create property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied!', `Room code ${code} copied to clipboard.`);
  };

  const shareAllCodes = async () => {
    const text = createdRooms.map((r) => `${r.name}: ${r.code}`).join('\n');
    await Clipboard.setStringAsync(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Copied All!', 'All room invite codes copied to clipboard.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Custom Top Navigation */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <View style={styles.topBarContent}>
          {step !== 'done' ? (
            <Pressable
              onPress={() => (step === 'rooms' ? setStep('details') : router.back())}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back-outline" size={24} color="#64748B" />
            </Pressable>
          ) : (
            <View style={{ width: 34 }} />
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Add Property</Text>
            <Text style={styles.subtitle}>
              {step === 'details'
                ? 'Step 1 of 2 — Details'
                : step === 'rooms'
                ? 'Step 2 of 2 — Rooms'
                : 'Finished'}
            </Text>
          </View>
          <View style={styles.stepDots}>
            <View
              style={[
                styles.stepDot,
                step === 'details' && styles.stepDotActive,
                step === 'done' && styles.stepDotComplete,
              ]}
            />
            <View
              style={[
                styles.stepDot,
                step === 'rooms' && styles.stepDotActive,
                step === 'done' && styles.stepDotComplete,
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: DETAILS */}
        {step === 'details' && (
          <View style={styles.stepContainer}>
            {/* Hero Card */}
            <LinearGradient
              colors={[Theme.colors.g1, Theme.colors.g3]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeEmoji}>🏘️</Text>
              </View>
              <Text style={styles.heroTitle}>Create Property</Text>
              <Text style={styles.heroSubtitle}>
                Select the property type and fill in the address to get started.
              </Text>
            </LinearGradient>

            {/* Input Card */}
            <View style={styles.formCard}>
              <Text style={styles.label}>Property Type</Text>
              <View style={styles.grid}>
                {[
                  { key: 'Shared House', label: 'HMO / Shared House', icon: '🏠' },
                  { key: 'Flat', label: 'Flat / Apartment', icon: '🏢' },
                  { key: 'Studio', label: 'Studio Room', icon: '🛋️' },
                  { key: 'Other', label: 'Other Type', icon: '🏘️' },
                ].map((type) => {
                  const isSelected = propertyType === type.key;
                  return (
                    <Pressable
                      key={type.key}
                      onPress={() => setPropertyType(type.key as PropertyType)}
                      style={[
                        styles.gridItem,
                        isSelected && styles.gridItemActive,
                      ]}
                    >
                      <Text style={styles.gridIcon}>{type.icon}</Text>
                      <Text
                        style={[
                          styles.gridLabel,
                          isSelected && styles.gridLabelActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Property Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Maple Grove"
                  placeholderTextColor={Theme.colors.mutedFg}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="e.g. 12 Maple St, London E1 4RD"
                  placeholderTextColor={Theme.colors.mutedFg}
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={handleNextStep}
                style={({ pressed }) => [
                  styles.ctaButton,
                  pressed && styles.ctaButtonPressed,
                ]}
              >
                <Text style={styles.ctaButtonText}>Next — Set up Rooms</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* STEP 2: ROOMS SETUP */}
        {step === 'rooms' && (
          <View style={styles.stepContainer}>
            {/* Info Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>✓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryTitle}>{name}</Text>
                <Text style={styles.summarySubtitle}>{address}</Text>
              </View>
              <Text style={styles.summaryType}>{propertyType}</Text>
            </View>

            {/* Stepper Card */}
            <View style={styles.formCard}>
              <Text style={styles.label}>Number of Rooms</Text>
              <View style={styles.stepperContainer}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setRoomCount((c) => {
                      if (c > 1) {
                        setRoomNames(prev => prev.slice(0, prev.length - 1));
                        return c - 1;
                      }
                      return c;
                    });
                  }}
                  style={styles.stepperButton}
                >
                  <Text style={styles.stepperButtonText}>−</Text>
                </Pressable>
                <Text style={styles.stepperValue}>{roomCount}</Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setRoomCount((c) => {
                      if (c < 20) {
                        setRoomNames(prev => [...prev, `Room ${prev.length + 1}`]);
                        return c + 1;
                      }
                      return c;
                    });
                  }}
                  style={styles.stepperButton}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Default Monthly Rent per Room</Text>
                <View style={styles.currencyInputWrapper}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    value={defaultRent}
                    onChangeText={setDefaultRent}
                    keyboardType="number-pad"
                    style={[styles.input, styles.currencyInput]}
                  />
                </View>
              </View>

              <Text style={styles.previewTitle}>Rooms Preview</Text>
              <View style={styles.previewList}>
                {roomNames.slice(0, 4).map((rName, i) => (
                  <View key={i} style={styles.previewItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <Text style={{ fontSize: 16 }}>🚪</Text>
                      <TextInput 
                        style={styles.previewItemNameInput} 
                        value={rName} 
                        onChangeText={(txt) => {
                          const newNames = [...roomNames];
                          newNames[i] = txt;
                          setRoomNames(newNames);
                        }} 
                      />
                      <Text style={{ fontSize: 14, color: Theme.colors.mutedFg }}>✏️</Text>
                    </View>
                    <View style={styles.vacantBadge}>
                      <Text style={styles.vacantBadgeText}>Vacant</Text>
                    </View>
                  </View>
                ))}
                {roomCount > 4 && (
                  <Text style={styles.previewMoreText}>
                    + {roomCount - 4} more rooms...
                  </Text>
                )}
              </View>

              <Pressable
                onPress={handleCreateProperty}
                disabled={loading}
                style={({ pressed }) => [
                  styles.ctaButton,
                  pressed && styles.ctaButtonPressed,
                  loading && styles.ctaButtonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.ctaButtonText}>Create Property</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* STEP 3: DONE / CELEBRATION */}
        {step === 'done' && (
          <View style={styles.stepContainer}>
            <View style={styles.celebrateCard}>
              <Text style={styles.celebrateEmoji}>🎉</Text>
              <Text style={styles.celebrateTitle}>{name} created!</Text>
              <Text style={styles.celebrateSubtitle}>
                {roomCount} rooms are ready. Share these invite codes with your tenants so they can join their rooms.
              </Text>
            </View>

            <View style={styles.codesCard}>
              <View style={styles.codesHeader}>
                <Text style={styles.codesTitle}>Room Invite Codes</Text>
                <Pressable onPress={shareAllCodes}>
                  <Text style={styles.shareAllText}>Copy All</Text>
                </Pressable>
              </View>

              <View style={styles.codesList}>
                {createdRooms.map((room, i) => (
                  <View key={i} style={styles.codeRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.codeRoomName}>{room.name}</Text>
                      <Text style={styles.codeValue}>{room.code}</Text>
                    </View>
                    <Pressable
                      onPress={() => copyToClipboard(room.code)}
                      style={styles.copyBadge}
                    >
                      <Text style={styles.copyBadgeText}>Copy</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>

            <Pressable
              onPress={() => router.replace(`/(landlord)/property/${createdPropertyId}`)}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
              ]}
            >
              <Text style={styles.ctaButtonText}>View Property</Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace('/(landlord)/home')}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
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
  backButtonText: {
    fontSize: 16,
    color: Theme.colors.mutedFg,
    fontWeight: '700',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
  },
  subtitle: {
    fontSize: 11,
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.regular,
    marginTop: 1,
  },
  stepDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.border,
  },
  stepDotActive: {
    width: 14,
    backgroundColor: Theme.colors.primary,
  },
  stepDotComplete: {
    backgroundColor: Theme.colors.success,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  stepContainer: {
    gap: 16,
  },
  heroCard: {
    borderRadius: Theme.radius.xl,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
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
  heroBadgeEmoji: {
    fontSize: 24,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.6,
    marginBottom: 4,
    fontFamily: Theme.fonts.bold,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: Theme.fonts.regular,
  },
  formCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    gap: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '48%',
    backgroundColor: Theme.colors.bg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  gridItemActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.accent,
  },
  gridIcon: {
    fontSize: 20,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.bold,
    textAlign: 'center',
  },
  gridLabelActive: {
    color: Theme.colors.primary,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.mutedFg,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: Theme.fonts.bold,
  },
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
    fontFamily: Theme.fonts.regular,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 4,
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaButtonDisabled: {
    backgroundColor: Theme.colors.mutedFg,
    opacity: 0.5,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
  },
  // STEP 2: ROOMS SETUP
  summaryCard: {
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
  },
  summarySubtitle: {
    fontSize: 11,
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.regular,
    marginTop: 1,
  },
  summaryType: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.primary,
    backgroundColor: '#fff',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    fontFamily: Theme.fonts.bold,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 4,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 24,
    color: Theme.colors.fg,
    fontWeight: '500',
  },
  stepperValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
    minWidth: 40,
    textAlign: 'center',
  },
  currencyInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: 14,
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.fg,
    zIndex: 5,
  },
  currencyInput: {
    paddingLeft: 30,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.mutedFg,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: Theme.fonts.bold,
    marginTop: 6,
  },
  previewList: {
    gap: 8,
    marginBottom: 16,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  previewItemNameInput: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
    padding: 0,
    flex: 1,
  },
  vacantBadge: {
    backgroundColor: Theme.colors.muted,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  vacantBadgeText: {
    fontSize: 11,
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  previewMoreText: {
    fontSize: 11,
    color: Theme.colors.mutedFg,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
  // STEP 3: DONE
  celebrateCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  celebrateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrateTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  celebrateSubtitle: {
    fontSize: 13,
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.regular,
    lineHeight: 18,
    textAlign: 'center',
  },
  codesCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
  },
  codesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
  },
  shareAllText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
  },
  codesList: {
    gap: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.bg,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  codeRoomName: {
    fontSize: 12,
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.regular,
  },
  codeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  copyBadge: {
    backgroundColor: Theme.colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  copyBadgeText: {
    fontSize: 11,
    color: Theme.colors.primary,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Theme.colors.mutedFg,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
  },
});
