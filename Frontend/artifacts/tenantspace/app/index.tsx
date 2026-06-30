import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      // Not logged in -> go to login screen
      router.replace('/(auth)/login');
    } else if (profile) {
      // Logged in and profile loaded -> route to appropriate dashboard
      if (profile.role === 'landlord') {
        router.replace('/(landlord)/home');
      } else {
        router.replace('/(tenant)/home');
      }
    } else {
      // Logged in but profile record not found or not yet created -> go to role selection
      router.replace('/(auth)/role-select');
    }
  }, [session, profile, loading]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
      }}
    >
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}
