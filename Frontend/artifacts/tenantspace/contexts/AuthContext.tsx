import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  role: 'landlord' | 'tenant';
  avatar_url: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
}

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the profile for the authenticated user
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, it's a new signup or missing record.
        // Suppress the PGRST116 (no rows) error so it doesn't crash the UI.
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error.message);
        }
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  // Sign out user
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  // Switch role between landlord and tenant
  const switchRole = async () => {
    if (!session?.user?.id || !profile) return;

    const newRole = profile.role === 'landlord' ? 'tenant' : 'landlord';

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating role:', error.message);
        alert('Failed to switch role. Please try again.');
      } else {
        setProfile((prev) => (prev ? { ...prev, role: newRole } : null));
      }
    } catch (err) {
      console.error('Unexpected error switching role:', err);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user?.id) {
          setLoading(true);
          await fetchProfile(newSession.user.id);
          setLoading(false);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signOut,
        refreshProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
