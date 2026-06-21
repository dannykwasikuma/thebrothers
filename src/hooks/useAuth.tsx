import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  role: 'customer' | 'staff' | 'admin';
  staffId: string | null;
  staffTitle: string | null;
  status: 'active' | 'disabled';
  isMainAdmin: boolean;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    fullName: row.full_name,
    role: row.role,
    staffId: row.staff_id,
    staffTitle: row.staff_title,
    status: row.status,
    isMainAdmin: row.is_main_admin,
    bio: row.bio ?? null,
    avatarUrl: row.avatar_url ?? null,
    createdAt: row.created_at,
  };
}

interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: SupabaseUser | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  /** Updates the signed-in user's own display name. Only fullName is editable
   *  here — email/phone are tied to how they sign in and shouldn't be casually
   *  changed from a plain form field (that needs Supabase's dedicated
   *  re-verification flow, not a simple update). */
  updateProfile: (updates: { fullName?: string }) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('Failed to load profile:', error.message);
      setProfile(null);
      return;
    }
    setProfile(mapProfile(data));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await fetchProfile(session.user.id);
  }, [session, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoaded(true);
      if (data.session?.user) fetchProfile(data.session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates: { fullName?: string }) => {
    if (!session?.user) return { ok: false, error: 'Not signed in.' };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', session.user.id);
    if (error) return { ok: false, error: error.message };
    await fetchProfile(session.user.id);
    return { ok: true };
  }, [session, fetchProfile]);

  const value: AuthState = {
    isLoaded,
    isSignedIn: Boolean(session?.user),
    user: session?.user ?? null,
    profile,
    refreshProfile,
    updateProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
