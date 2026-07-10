import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../../constants/theme';
import { supabase } from '../../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const PRESETS = ["Kitchen", "Bathroom", "Hallway", "Bins", "Living room", "Garden"];
const DAY_OPTS = [
  { label: 'Mon', val: 1 },
  { label: 'Tue', val: 2 },
  { label: 'Wed', val: 3 },
  { label: 'Thu', val: 4 },
  { label: 'Fri', val: 5 },
  { label: 'Sat', val: 6 },
  { label: 'Sun', val: 0 },
];
const FREQ_OPTS = [
  { label: 'Weekly', val: 'weekly' },
  { label: 'Bi-weekly', val: 'bi-weekly' },
  { label: 'Monthly', val: 'monthly' },
];

const COLORS = ['#2563EB', '#8B5CF6', '#F97316', '#10B981', '#EF4444', '#64748B'];

export default function AssignChoreScreen() {
  const { propertyId, choreId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [dutyName, setDutyName] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [freq, setFreq] = useState('weekly');
  const [repeatCycle, setRepeatCycle] = useState(true);
  const [sendReminder, setSendReminder] = useState(true);
  
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [rotation, setRotation] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, [propertyId]);

  const fetchTenants = async () => {
    if (!propertyId) return;
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        name,
        tenant_memberships (
          status,
          profiles ( id, full_name )
        )
      `)
      .eq('property_id', propertyId);

    if (error) {
      console.error(error);
      return;
    }

    const tenants: any[] = [];
    data?.forEach(room => {
      room.tenant_memberships?.filter((m: any) => m.status === 'active').forEach((m: any) => {
        if (m.profiles) {
          tenants.push({
            id: m.profiles.id,
            name: m.profiles.full_name || 'Tenant',
            initials: (m.profiles.full_name || 'T').substring(0, 2).toUpperCase(),
            color: COLORS[tenants.length % COLORS.length],
            room: room.name,
          });
        }
      });
    });

    setAllTenants(tenants);

    if (choreId) {
      fetchExistingChore(tenants);
    } else {
      setRotation(tenants); // default to all tenants
    }
  };

  const fetchExistingChore = async (tenants: any[]) => {
    setLoading(true);
    const { data, error } = await supabase.from('chores').select('*').eq('id', choreId).single();
    setLoading(false);
    if (error || !data) return;

    setDutyName(data.name);
    setSelectedDays(data.days_of_week || []);
    setFreq(data.frequency || 'weekly');
    setRepeatCycle(data.repeat_cycle !== false);
    setSendReminder(data.send_reminder !== false);
    
    if (data.rotation_order) {
      const savedRotation = data.rotation_order.map((tId: string) => tenants.find(t => t.id === tId)).filter(Boolean);
      setRotation(savedRotation);
    }
  };

  const removedTenants = allTenants.filter(p => !rotation.find(r => r.id === p.id));

  const toggleDay = (val: number) => {
    setSelectedDays(prev => 
      prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val].sort()
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newRot = [...rotation];
    [newRot[index - 1], newRot[index]] = [newRot[index], newRot[index - 1]];
    setRotation(newRot);
  };

  const moveDown = (index: number) => {
    if (index === rotation.length - 1) return;
    const newRot = [...rotation];
    [newRot[index], newRot[index + 1]] = [newRot[index + 1], newRot[index]];
    setRotation(newRot);
  };

  const handleSaveChore = async () => {
    if (!dutyName.trim() || selectedDays.length === 0 || rotation.length === 0) {
      Alert.alert("Incomplete", "Please provide a name, select at least one day, and add at least one person.");
      return;
    }
    setLoading(true);
    try {
      const chorePayload = {
        property_id: propertyId,
        name: dutyName.trim(),
        days_of_week: selectedDays,
        frequency: freq,
        rotation_order: rotation.map(r => r.id),
        repeat_cycle: repeatCycle,
        send_reminder: sendReminder,
        status: 'pending'
      };

      let dbError;
      if (choreId) {
        const { error } = await supabase.from('chores').update(chorePayload).eq('id', choreId);
        dbError = error;
      } else {
        const { error } = await supabase.from('chores').insert(chorePayload);
        dbError = error;
      }

      if (dbError) throw dbError;
      router.back();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to save chore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={{ height: insets.top, backgroundColor: Theme.colors.card }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.headerBackBtn}>
            <Ionicons name="arrow-back-outline" size={24} color="#64748B" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>{choreId ? 'Edit Chore' : 'Assign Chore'}</Text>
            <Text style={styles.headerSubtitle}>Maple Grove</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Duty Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CHORE NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Kitchen, Bins…"
            value={dutyName}
            onChangeText={setDutyName}
            placeholderTextColor={Theme.colors.mutedFg}
          />
          <View style={styles.presetsContainer}>
            {PRESETS.map(p => {
              const isSelected = dutyName === p;
              return (
                <Pressable 
                  key={p} 
                  onPress={() => setDutyName(p)}
                  style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                >
                  <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DAY(S)</Text>
          <View style={styles.daysContainer}>
            {DAY_OPTS.map(d => {
              const on = selectedDays.includes(d.val);
              return (
                <Pressable
                  key={d.val}
                  onPress={() => toggleDay(d.val)}
                  style={[styles.dayBtn, on && styles.dayBtnActive]}
                >
                  <Text style={[styles.dayText, on && styles.dayTextActive]}>
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REPEATS</Text>
          <View style={styles.freqContainer}>
            {FREQ_OPTS.map(f => {
              const on = freq === f.val;
              return (
                <Pressable
                  key={f.val}
                  onPress={() => setFreq(f.val)}
                  style={[styles.freqBtn, on && styles.freqBtnActive]}
                >
                  <Text style={[styles.freqText, on && styles.freqTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Rotation Order */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ROTATION ORDER</Text>
          <Text style={styles.sectionSubtitle}>Use arrows to reorder · × to remove</Text>

          <View style={styles.rotationList}>
            {rotation.map((person, i) => (
              <View key={person.id} style={styles.rotationCard}>
                <View style={styles.reorderArrows}>
                  <Pressable onPress={() => moveUp(i)} style={styles.arrowBtn} disabled={i === 0}>
                    <Text style={[styles.arrowText, i === 0 && { color: Theme.colors.border }]}>▲</Text>
                  </Pressable>
                  <Pressable onPress={() => moveDown(i)} style={styles.arrowBtn} disabled={i === rotation.length - 1}>
                    <Text style={[styles.arrowText, i === rotation.length - 1 && { color: Theme.colors.border }]}>▼</Text>
                  </Pressable>
                </View>

                <View style={[styles.positionBadge, i === 0 ? styles.positionBadgeActive : null]}>
                  <Text style={[styles.positionBadgeText, i === 0 ? { color: '#fff' } : null]}>{i + 1}</Text>
                </View>

                <View style={[styles.avatar, { backgroundColor: person.color }]}>
                  <Text style={styles.avatarText}>{person.initials}</Text>
                </View>

                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personRoom}>{person.room}</Text>
                </View>

                <Pressable onPress={() => setRotation(prev => prev.filter(r => r.id !== person.id))} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>×</Text>
                </Pressable>
              </View>
            ))}

            <Pressable onPress={() => setShowAdd(!showAdd)} style={[styles.addPersonBtn, showAdd && styles.addPersonBtnActive]}>
              <Text style={[styles.addPersonText, showAdd && styles.addPersonTextActive]}>
                + Add person to rotation
              </Text>
            </Pressable>

            {showAdd && removedTenants.length > 0 && (
              <View style={styles.removedList}>
                {removedTenants.map(person => (
                  <Pressable key={person.id} onPress={() => {
                    setRotation([...rotation, person]);
                    setShowAdd(false);
                  }} style={styles.removedCard}>
                    <View style={[styles.avatar, { backgroundColor: person.color, width: 26, height: 26, borderRadius: 13 }]}>
                      <Text style={[styles.avatarText, { fontSize: 10 }]}>{person.initials}</Text>
                    </View>
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{person.name}</Text>
                      <Text style={styles.personRoom}>{person.room}</Text>
                    </View>
                    <Text style={styles.addText}>Add</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {showAdd && removedTenants.length === 0 && (
              <View style={styles.allAddedCard}>
                <Text style={styles.allAddedText}>All tenants are already in the rotation</Text>
              </View>
            )}
          </View>
        </View>

        {/* Toggles */}
        <View style={styles.toggleCard}>
          <View>
            <Text style={styles.toggleTitle}>Repeat cycle</Text>
            <Text style={styles.toggleSubtitle}>Once everyone has had a turn, start again</Text>
          </View>
          <Switch value={repeatCycle} onValueChange={setRepeatCycle} trackColor={{ true: Theme.colors.primary }} />
        </View>

        <View style={styles.toggleCard}>
          <View>
            <Text style={styles.toggleTitle}>Send reminder</Text>
            <Text style={styles.toggleSubtitle}>Notify tenant the day before</Text>
          </View>
          <Switch value={sendReminder} onValueChange={setSendReminder} trackColor={{ true: Theme.colors.primary }} />
        </View>

        {/* Preview */}
        {dutyName && selectedDays.length > 0 && rotation.length > 0 && (
          <LinearGradient colors={['#1D4ED8', '#3B82F6']} style={styles.previewCard}>
            <Text style={styles.previewTitle}>ROTATION PREVIEW</Text>
            {rotation.map((person, w) => (
              <View key={w} style={styles.previewRow}>
                <Text style={styles.previewWeekText}>Week {w + 1}</Text>
                <View style={[styles.avatar, { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Text style={[styles.avatarText, { fontSize: 9 }]}>{person.initials}</Text>
                </View>
                <Text style={styles.previewPersonText}>
                  {person.name} <Text style={{ fontWeight: '500', opacity: 0.8 }}>· {person.room}</Text>
                </Text>
              </View>
            ))}
            <View style={styles.previewFooterLine}>
              <Text style={styles.previewFooterText}>
                {repeatCycle ? "…then repeats from Week 1" : "…ends after one full cycle"}
              </Text>
            </View>
          </LinearGradient>
        )}

      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Pressable onPress={handleSaveChore} style={styles.saveBtn} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Chore</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBackBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackText: { fontSize: 16, color: Theme.colors.mutedFg },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.fg, letterSpacing: -0.4, fontFamily: Theme.fonts.bold },
  headerSubtitle: { fontSize: 12, color: Theme.colors.mutedFg, marginTop: 1, fontFamily: Theme.fonts.regular },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 20 },
  section: {},
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Theme.colors.mutedFg, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, fontFamily: Theme.fonts.bold },
  sectionSubtitle: { fontSize: 12, color: Theme.colors.mutedFg, marginBottom: 10, fontFamily: Theme.fonts.regular },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
    fontSize: 14,
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.regular,
  },
  presetsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  presetBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
  },
  presetBtnActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  presetText: { fontSize: 11, fontWeight: '700', color: Theme.colors.mutedFg, fontFamily: Theme.fonts.bold },
  presetTextActive: { color: '#fff' },
  daysContainer: { flexDirection: 'row', gap: 5 },
  dayBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
    alignItems: 'center',
  },
  dayBtnActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  dayText: { fontSize: 11, fontWeight: '700', color: Theme.colors.mutedFg, fontFamily: Theme.fonts.bold },
  dayTextActive: { color: '#fff' },
  freqContainer: { flexDirection: 'row', gap: 6 },
  freqBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
    alignItems: 'center',
  },
  freqBtnActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  freqText: { fontSize: 12, fontWeight: '700', color: Theme.colors.mutedFg, fontFamily: Theme.fonts.bold },
  freqTextActive: { color: '#fff' },
  rotationList: { gap: 6 },
  rotationCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    padding: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reorderArrows: { alignItems: 'center', gap: 2, marginRight: 2 },
  arrowBtn: { paddingHorizontal: 4 },
  arrowText: { fontSize: 10, color: Theme.colors.mutedFg },
  positionBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadgeActive: { backgroundColor: Theme.colors.primary },
  positionBadgeText: { fontSize: 11, fontWeight: '800', color: Theme.colors.mutedFg, fontFamily: Theme.fonts.bold },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 11, fontWeight: '800', color: '#fff', fontFamily: Theme.fonts.bold },
  personInfo: { flex: 1, marginLeft: 6 },
  personName: { fontSize: 13, fontWeight: '700', color: Theme.colors.fg, fontFamily: Theme.fonts.bold },
  personRoom: { fontSize: 11, color: Theme.colors.mutedFg, fontFamily: Theme.fonts.regular },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '800', marginTop: -2 },
  addPersonBtn: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  addPersonBtnActive: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.accent },
  addPersonText: { fontSize: 13, fontWeight: '700', color: Theme.colors.mutedFg, fontFamily: Theme.fonts.bold },
  addPersonTextActive: { color: Theme.colors.primary },
  removedList: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    padding: 10,
    gap: 6,
  },
  removedCard: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.muted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addText: { fontSize: 12, fontWeight: '700', color: Theme.colors.primary, fontFamily: Theme.fonts.bold },
  allAddedCard: { padding: 10, borderRadius: 12, backgroundColor: Theme.colors.muted, alignItems: 'center' },
  allAddedText: { fontSize: 12, color: Theme.colors.mutedFg, fontFamily: Theme.fonts.regular },
  toggleCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.fg, fontFamily: Theme.fonts.bold },
  toggleSubtitle: { fontSize: 12, color: Theme.colors.mutedFg, marginTop: 2, fontFamily: Theme.fonts.regular },
  previewCard: { borderRadius: 14, padding: 14 },
  previewTitle: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, fontFamily: Theme.fonts.bold },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  previewWeekText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)', width: 52, fontFamily: Theme.fonts.bold },
  previewPersonText: { fontSize: 13, fontWeight: '700', color: '#fff', fontFamily: Theme.fonts.bold },
  previewFooterLine: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 8, marginTop: 4 },
  previewFooterText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: Theme.fonts.regular },
  saveContainer: { padding: 16, paddingBottom: 28, backgroundColor: Theme.colors.card, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  saveBtn: {
    padding: 15,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: Theme.fonts.bold },
});
