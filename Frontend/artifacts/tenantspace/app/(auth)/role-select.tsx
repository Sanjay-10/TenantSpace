import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type Role = 'landlord' | 'tenant';

export default function RoleSelectScreen() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [updating, setUpdating] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, refreshProfile, signOut } = useAuth();

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role to continue.');
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('Session Error', 'You must be logged in to select a role.');
      router.replace('/(auth)/login');
      return;
    }

    setUpdating(true);
    try {
      // Update the user's role in the public profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', session.user.id);

      if (error) {
        Alert.alert('Error', 'Failed to save role. Please try again.');
      } else {
        // Sync our local AuthContext session profile
        await refreshProfile();
        
        // Navigate to the correct dashboard based on selection
        if (selectedRole === 'landlord') {
          router.replace('/(landlord)/home');
        } else {
          router.replace('/(tenant)/home');
        }
      }
    } catch (err) {
      console.error('Role update error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation Row */}
        <View style={styles.topNavRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#64748B" />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Choose your role</Text>
            <Text style={styles.headerStepText}>Step 2 of 2</Text>
          </View>
          <Pressable onPress={async () => { await signOut(); router.replace('/(auth)/login'); }}>
            <Text style={{ color: Theme.colors.g3, fontWeight: '600', marginLeft: 10 }}>Sign Out</Text>
          </Pressable>
        </View>

        {/* Hero Card */}
        <LinearGradient
          colors={[Theme.colors.g1, Theme.colors.g3]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Decorative Circles */}
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />

          <View style={styles.partyContainer}>
            <Text style={styles.partyEmoji}>🎉</Text>
          </View>
          <Text style={styles.heroTitleText}>Almost there!</Text>
          <Text style={styles.heroSubtitle}>
            How will you be using TenantSpace?
          </Text>
        </LinearGradient>

        {/* Landlord Card */}
        <Pressable
          onPress={() => setSelectedRole('landlord')}
          style={[
            styles.roleCard,
            selectedRole === 'landlord' && styles.roleCardActive,
          ]}
        >
          <View style={styles.roleHeaderRow}>
            <View style={styles.roleIconContainer}>
              <Text style={styles.roleIcon}>🏘️</Text>
            </View>
            <View style={styles.roleTitleContainer}>
              <Text style={styles.roleTitle}>I am a Landlord</Text>
              <Text style={styles.roleSubtitleText}>
                I own or manage shared rental properties
              </Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedRole === 'landlord' && styles.radioOuterActive,
              ]}
            >
              {selectedRole === 'landlord' && <View style={styles.radioInner} />}
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.featuresList}>
            {[
              'Manage rooms & tenant profiles',
              'Track rent payments & balances',
              'Assign chores & automatic weekly rotations',
              'Handle tenant maintenance requests',
            ].map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </Pressable>

        {/* Tenant Card */}
        <Pressable
          onPress={() => setSelectedRole('tenant')}
          style={[
            styles.roleCard,
            selectedRole === 'tenant' && styles.roleCardActive,
          ]}
        >
          <View style={styles.roleHeaderRow}>
            <View style={styles.roleIconContainer}>
              <Text style={styles.roleIcon}>🏠</Text>
            </View>
            <View style={styles.roleTitleContainer}>
              <Text style={styles.roleTitle}>I am a Tenant</Text>
              <Text style={styles.roleSubtitleText}>
                I'm renting a room in a shared home
              </Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedRole === 'tenant' && styles.radioOuterActive,
              ]}
            >
              {selectedRole === 'tenant' && <View style={styles.radioInner} />}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.featuresList}>
            {[
              'View room details & shared house rules',
              'Pay rent and check payment history',
              'Check rotating chores assigned to you',
              'Report repair issues to your landlord',
            ].map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </Pressable>

        {/* Bottom Note & CTA */}
        <Text style={styles.noteText}>
          * You can switch roles at any time in settings.
        </Text>

        <Pressable
          onPress={handleContinue}
          disabled={!selectedRole || updating}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
            (!selectedRole || updating) && styles.ctaButtonDisabled,
          ]}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaButtonText}>
              {selectedRole === 'landlord'
                ? 'Continue as Landlord'
                : selectedRole === 'tenant'
                ? 'Continue as Tenant'
                : 'Select a Role'}
            </Text>
          )}
        </Pressable>
      <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
  },
  headerStepText: {
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
  heroCard: {
    borderRadius: Theme.radius.xxl,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  circle1: {
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  circle2: {
    left: -30,
    bottom: -30,
    width: 130,
    height: 130,
  },
  partyContainer: {
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
  partyEmoji: {
    fontSize: 24,
  },
  heroTitleText: {
    fontSize: 22,
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
  roleCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  roleCardActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.accent,
  },
  roleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleIcon: {
    fontSize: 22,
  },
  roleTitleContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.bold,
  },
  roleSubtitleText: {
    fontSize: 12,
    color: Theme.colors.mutedFg,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureBullet: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 12.5,
    color: Theme.colors.fg,
    fontFamily: Theme.fonts.medium,
    lineHeight: 16,
  },
  noteText: {
    fontSize: 11,
    color: Theme.colors.mutedFg,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    fontFamily: Theme.fonts.regular,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaButtonDisabled: {
    backgroundColor: Theme.colors.mutedFg,
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Theme.fonts.bold,
  },
});


