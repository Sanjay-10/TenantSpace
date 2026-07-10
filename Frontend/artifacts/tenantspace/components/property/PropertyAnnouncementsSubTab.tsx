import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { C, styles } from './propertyStyles';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  announcements: any[];
  setEditAnnId: (id: string | null) => void;
  setAnnTitle: (title: string) => void;
  setAnnBody: (body: string) => void;
  setAnnExpiry: (expiry: number) => void;
  setIsCustomExpiry: (isCustom: boolean) => void;
  setShowAnnModal: (show: boolean) => void;
  setAnnouncements: React.Dispatch<React.SetStateAction<any[]>>;
}

export function PropertyAnnouncementsSubTab({
  announcements,
  setEditAnnId,
  setAnnTitle,
  setAnnBody,
  setAnnExpiry,
  setIsCustomExpiry,
  setShowAnnModal,
  setAnnouncements,
}: Props) {
  const handleDeleteAnnouncement = async (id: string) => {
    Alert.alert('Delete Announcement', 'Are you sure you want to delete this announcement?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          setAnnouncements(prev => prev.filter(a => a.id !== id));
          try {
            await supabase.from('announcements').delete().eq('id', id);
          } catch (err) {
            console.error('Delete error', err);
          }
        }
      }
    ]);
  };

  const handleEditAnnouncement = (ann: any) => {
    setEditAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnBody(ann.body);
    
    // Calculate days until expiry
    if (ann.expires_at) {
      const diffTime = Math.abs(new Date(ann.expires_at).getTime() - new Date().getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setAnnExpiry(diffDays);
      setIsCustomExpiry(![1, 3, 5, 7].includes(diffDays));
    } else {
      setAnnExpiry(5);
      setIsCustomExpiry(false);
    }
    
    setShowAnnModal(true);
  };

  return (
    <ScrollView 
      contentContainerStyle={[styles.tabContentContainer, { paddingHorizontal: 16, paddingTop: 16, gap: 12 }]}
    >
      {announcements.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: C.mutedFg }}>No announcements yet.</Text>
        </View>
      ) : announcements.map(ann => {
        // Calculate badge
        const expiresDate = new Date(ann.expires_at);
        const now = new Date();
        const diffTime = expiresDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isExpired = diffDays <= 0;
        
        // Format created_at date
        const createdDate = new Date(ann.created_at);
        const isToday = createdDate.toDateString() === now.toDateString();
        let dateStr = "";
        if (isToday) {
          dateStr = `Today, ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          const diffTimeCreated = now.getTime() - createdDate.getTime();
          const diffDaysCreated = Math.ceil(diffTimeCreated / (1000 * 60 * 60 * 24));
          dateStr = diffDaysCreated === 1 ? '1 day ago' : `${diffDaysCreated} days ago`;
        }

        return (
          <View key={ann.id} style={styles.annCard}>
            <View style={styles.annHeaderRow}>
              <View style={styles.annHeaderLeft}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isExpired ? C.muted : '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="megaphone-outline" size={18} color={isExpired ? C.mutedFg : '#DC2626'} />
                </View>
                <Text style={styles.annDate}>{dateStr}</Text>
              </View>
              <View style={[styles.annBadge, { backgroundColor: isExpired ? C.muted : "#D1FAE5" }]}>
                <Text style={[styles.annBadgeText, { color: isExpired ? C.mutedFg : "#065F46" }]}>
                  {isExpired ? 'Expired' : `${diffDays} days left`}
                </Text>
              </View>
            </View>
            <Text style={styles.annTitle}>{ann.title}</Text>
            <Text style={styles.annBody}>{ann.body}</Text>
            
            <View style={styles.annFooter}>
              <View style={{ flex: 1 }} />
              <View style={styles.annActions}>
                <Pressable onPress={() => {
                  setEditAnnId(ann.id);
                  setAnnTitle(ann.title);
                  setAnnBody(ann.body);
                  const ed = isExpired ? 5 : diffDays;
                  setAnnExpiry(ed); 
                  setIsCustomExpiry(![1, 3, 5, 7].includes(ed));
                  setShowAnnModal(true);
                }}>
                  <Text style={styles.annActionEditText}>Edit</Text>
                </Pressable>
                <Pressable onPress={async () => {
                  const { error } = await supabase.from('announcements').delete().eq('id', ann.id);
                  if (error) {
                    Alert.alert('Error deleting', error.message);
                  } else {
                    // Update local state without fetching
                    setAnnouncements(prev => prev.filter(a => a.id !== ann.id));
                  }
                }}>
                  <Text style={styles.annActionDeleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
