import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../../../../lib/supabase';
import { Theme } from '../../../../constants/theme';
import { C } from '../../../../components/property/propertyStyles';
import { useAuth } from '../../../../contexts/AuthContext';

// Generic Setting Item Component
const SettingItem = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  isDanger, 
  iconBgColor = C.muted,
  rightElement
}: any) => (
  <Pressable 
    style={({ pressed }) => [styles.itemContainer, pressed && { opacity: 0.7 }]}
    onPress={onPress}
  >
    <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
      {icon}
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.itemTitle, isDanger && { color: C.danger }]}>{title}</Text>
      {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
    </View>
    {rightElement ? (
      rightElement
    ) : (
      <Ionicons name="chevron-forward" size={20} color={C.mutedFg} />
    )}
  </Pressable>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function PropertySettingsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<'name' | 'address' | 'property_type' | 'rent_due_date' | 'rent_reminders' | null>(null);
  const [editValue, setEditValue] = useState('');

  const [addContactVisible, setAddContactVisible] = useState(false);
  const [newContactTitle, setNewContactTitle] = useState('');
  const [newContactContent, setNewContactContent] = useState('');

  const { data: property, isLoading } = useQuery({
    queryKey: ['propertySettings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_contacts(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertySettings', id] });
      queryClient.invalidateQueries({ queryKey: ['propertyData', id] });
      queryClient.invalidateQueries({ queryKey: ['landlordProperties', profile?.id] });
      setEditModalVisible(false);
    },
    onError: (err: any) => {
      Alert.alert('Error updating property', err.message);
    }
  });

  const addContactMutation = useMutation({
    mutationFn: async (contact: { property_id: string, title: string, content: string }) => {
      const { data, error } = await supabase
        .from('property_contacts')
        .insert([contact])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertySettings', id] });
      setAddContactVisible(false);
      setNewContactTitle('');
      setNewContactContent('');
    },
    onError: (err: any) => {
      Alert.alert('Error adding contact', err.message);
    }
  });

  if (isLoading || !property) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const handleOpenEdit = (field: 'name' | 'address' | 'property_type' | 'rent_due_date' | 'rent_reminders', currentValue: any) => {
    setEditField(field);
    setEditValue(String(currentValue || ''));
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editField) return;
    
    let finalValue: any = editValue.trim();
    
    // Parse rent_due_date as integer
    if (editField === 'rent_due_date') {
      const parsed = parseInt(finalValue, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 31) {
        Alert.alert('Invalid Date', 'Please enter a day between 1 and 31.');
        return;
      }
      finalValue = parsed;
    }

    // Parse reminders
    if (editField === 'rent_reminders') {
      finalValue = finalValue.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    updateMutation.mutate({ [editField]: finalValue });
  };

  const handleCopyCode = async () => {
    if (property?.property_code) {
      await Clipboard.setStringAsync(property.property_code);
      Alert.alert('Copied!', 'Property code copied to clipboard.');
    }
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Property',
      'Are you sure you want to archive this property? It will be hidden from your dashboard.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive', 
          style: 'destructive',
          onPress: () => {
            updateMutation.mutate({ is_archived: true }, {
              onSuccess: () => {
                Alert.alert('Archived', 'Property has been archived.');
                router.replace('/(landlord)/(tabs)');
              }
            });
          }
        }
      ]
    );
  };

  const handleAddContact = () => {
    if (!newContactTitle.trim() || !newContactContent.trim()) {
      Alert.alert('Missing Info', 'Please provide both a title and contact details.');
      return;
    }
    addContactMutation.mutate({
      property_id: id as string,
      title: newContactTitle.trim(),
      content: newContactContent.trim()
    });
  };

  // Helper to format reminder text
  const formatReminders = (reminders: any[]) => {
    if (!reminders || reminders.length === 0) return 'No reminders set';
    return reminders.join(' · ');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Property Settings</Text>
          <Text style={styles.headerSubtitle}>{property.address}</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 40) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Essentials */}
        <SectionHeader title="Property Details" />
        <View style={styles.card}>
          <SettingItem 
            icon={<Ionicons name="home-outline" size={18} color={C.primary} />}
            title="Property Name"
            subtitle={property.name}
            onPress={() => handleOpenEdit('name', property.name)}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon={<Ionicons name="location-outline" size={18} color={C.primary} />}
            title="Address"
            subtitle={property.address}
            onPress={() => handleOpenEdit('address', property.address)}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon={<Ionicons name="pricetag-outline" size={18} color={C.primary} />}
            title="Property Type"
            subtitle={property.property_type}
            onPress={() => handleOpenEdit('property_type', property.property_type)}
          />
        </View>

        {/* Rent Settings */}
        <SectionHeader title="Rent Settings" />
        <View style={styles.card}>
          <SettingItem 
            icon={<Ionicons name="calendar-outline" size={18} color={C.primary} />}
            title="Rent Due Date"
            subtitle={`Day ${property.rent_due_date || 1} of each month`}
            onPress={() => handleOpenEdit('rent_due_date', property.rent_due_date || 1)}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon={<Ionicons name="notifications-outline" size={18} color={C.primary} />}
            title="Reminder Schedule"
            subtitle={formatReminders(property.rent_reminders)}
            onPress={() => handleOpenEdit('rent_reminders', (property.rent_reminders || []).join(', '))}
          />
        </View>

        {/* Co-Owner Section */}
        <SectionHeader title="CO-OWNER" />
        <View style={styles.card}>
          <View style={styles.codeContainer}>
            <Text style={styles.codeTitle}>Property Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{property.property_code}</Text>
              <Pressable style={styles.copyBtn} onPress={handleCopyCode}>
                <Ionicons name="copy-outline" size={16} color={C.primary} />
                <Text style={styles.copyBtnText}>Copy</Text>
              </Pressable>
            </View>
            <Text style={styles.codeHelper}>Anyone with this code can join as a co-owner.</Text>
          </View>
        </View>

        {/* Contacts & Services */}
        <SectionHeader title="Contacts & Services" />
        <Text style={styles.sectionDescription}>
          These contacts will be visible to tenants by default in all room details.
        </Text>
        <View style={styles.card}>
          {property.property_contacts?.map((contact: any, index: number) => (
            <React.Fragment key={contact.id}>
              <SettingItem 
                icon={<Ionicons name="call-outline" size={18} color={C.primary} />}
                title={contact.title}
                subtitle={contact.content}
              />
              <View style={styles.divider} />
            </React.Fragment>
          ))}
          <SettingItem 
            icon={<Ionicons name="add" size={18} color={C.primary} />}
            title="Add Contact"
            subtitle="Add new service contact"
            onPress={() => setAddContactVisible(true)}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <View style={[styles.card, { marginBottom: 24 }]}>
          <SettingItem 
            icon={<Ionicons name="archive-outline" size={18} color={C.danger} />}
            iconBgColor="#FEE2E2"
            isDanger={true}
            title="Archive Property"
            subtitle="Hide from dashboard, keep data"
            onPress={handleArchive}
          />
        </View>

      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {
                editField === 'name' ? 'Property Name' : 
                editField === 'address' ? 'Address' : 
                editField === 'property_type' ? 'Property Type' :
                editField === 'rent_due_date' ? 'Rent Due Date (1-31)' :
                'Reminders (comma separated)'
              }
            </Text>
            
            {editField === 'property_type' ? (
              <View style={[styles.grid, { marginBottom: 24 }]}>
                {[
                  { key: 'Shared House', label: 'Shared House', icon: 'home-outline' },
                  { key: 'Flat', label: 'Flat / Apartment', icon: 'business-outline' },
                  { key: 'Studio', label: 'Studio Room', icon: 'bed-outline' },
                  { key: 'Other', label: 'Other Type', icon: 'grid-outline' },
                ].map((type) => {
                  const isSelected = editValue === type.key;
                  return (
                    <Pressable
                      key={type.key}
                      onPress={() => setEditValue(type.key)}
                      style={[
                        styles.gridItem,
                        isSelected && styles.gridItemActive,
                      ]}
                    >
                      <Ionicons 
                        name={type.icon as any} 
                        size={24} 
                        color={isSelected ? C.primary : C.mutedFg} 
                        style={{ marginBottom: 4 }}
                      />
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
            ) : (
              <TextInput
                style={styles.modalInput}
                value={editValue}
                onChangeText={setEditValue}
                autoFocus
                selectionColor={C.primary}
                keyboardType={editField === 'rent_due_date' ? 'number-pad' : 'default'}
                placeholder={editField === 'rent_reminders' ? 'e.g. 5 days before, On due date' : ''}
                placeholderTextColor={C.mutedFg}
              />
            )}

            <View style={styles.modalButtons}>
              <Pressable 
                style={styles.modalBtnCancel} 
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={styles.modalBtnSave} 
                onPress={handleSaveEdit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnSaveText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Contact Modal */}
      <Modal visible={addContactVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Contact</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newContactTitle}
              onChangeText={setNewContactTitle}
              autoFocus
              selectionColor={C.primary}
              placeholder="Title (e.g. Plumber)"
              placeholderTextColor={C.mutedFg}
            />
            
            <TextInput
              style={styles.modalInput}
              value={newContactContent}
              onChangeText={setNewContactContent}
              selectionColor={C.primary}
              placeholder="Details (e.g. Mike's · 07700 900123)"
              placeholderTextColor={C.mutedFg}
            />

            <View style={styles.modalButtons}>
              <Pressable 
                style={styles.modalBtnCancel} 
                onPress={() => {
                  setAddContactVisible(false);
                  setNewContactTitle('');
                  setNewContactContent('');
                }}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={styles.modalBtnSave} 
                onPress={handleAddContact}
                disabled={addContactMutation.isPending}
              >
                {addContactMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnSaveText}>Add</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.card,
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: C.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Theme.fonts.bold,
    color: C.fg,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: Theme.fonts.medium,
    color: C.mutedFg,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
    color: C.mutedFg,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionDescription: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: C.mutedFg,
    marginBottom: 12,
    marginLeft: 4,
    marginTop: -4,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: C.card,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Theme.fonts.semiBold,
    color: C.fg,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: C.mutedFg,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 72, // Aligns exactly with text
  },
  codeContainer: {
    padding: 16,
    backgroundColor: C.card,
  },
  codeTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Theme.fonts.semiBold,
    color: C.fg,
    marginBottom: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.muted,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
    letterSpacing: 2,
    color: C.primary,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Theme.fonts.semiBold,
    color: C.primary,
    marginLeft: 4,
  },
  codeHelper: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: C.mutedFg,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    color: C.fg,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    fontFamily: Theme.fonts.medium,
    color: C.fg,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: C.iconBg,
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontFamily: Theme.fonts.semiBold,
    color: C.mutedFg,
  },
  modalBtnSave: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  modalBtnSaveText: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '48%',
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  gridItemActive: {
    borderColor: C.primary,
    backgroundColor: C.accent,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.mutedFg,
    fontFamily: Theme.fonts.bold,
    textAlign: 'center',
  },
  gridLabelActive: {
    color: C.primary,
  }
});
