import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { useStore } from '../store/useStore';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  updateDistricts: (districts: string[]) => Promise<void>;
  updateLanguage: (lang: 'en' | 'hi') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const setStoreProfile = useStore(state => state.setProfile);
  const profile = useStore(state => state.profile);
  const [profileLoading, setProfileLoading] = useState(false);
  const lastFetchedUid = React.useRef<string | null>(null);

  // 1. Manage Auth State
  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (!mounted) return;
      if (error) console.error("getSession error:", error);
      
      console.log("Initial session check:", s?.user?.id || "no user");
      setSession(s);
      setUser(s?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      console.log(`Auth event: ${event}`, s?.user?.id || "no user");
      setSession(s);
      setUser(s?.user ?? null);
      setAuthLoading(false);
    });

    // Safety timeout to ensure loading eventually clears
    const timer = setTimeout(() => {
      if (mounted) setAuthLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // 2. Manage Profile State (reacts to user changes)
  useEffect(() => {
    if (!user) {
      setStoreProfile(null);
      setProfileLoading(false);
      lastFetchedUid.current = null;
      return;
    }

    if (lastFetchedUid.current === user.id) return;

    const fetchProfile = async () => {
      console.log("Fetching profile for:", user.id);
      setProfileLoading(true);
      lastFetchedUid.current = user.id;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        console.log("Profile fetched:", data?.role || "no role");
        setStoreProfile((data as UserProfile) ?? null);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setStoreProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateRole = async (role: UserRole) => {
    if (user && profile) {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);
      
      if (error) throw error;
      setStoreProfile({ ...profile, role });
    }
  };

  const updateDistricts = async (districts: string[]) => {
    if (user && profile) {
      const { error } = await supabase
        .from('profiles')
        .update({ assigned_districts: districts })
        .eq('id', user.id);
      
      if (error) throw error;
      setStoreProfile({ ...profile, assigned_districts: districts });
    }
  };

  const updateLanguage = async (preferredLanguage: 'en' | 'hi') => {
    if (user && profile) {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: preferredLanguage })
        .eq('id', user.id);
      
      if (error) throw error;
      setStoreProfile({ ...profile, preferred_language: preferredLanguage });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      profile, 
      loading: authLoading || profileLoading, 
      signIn, 
      signOut, 
      updateRole, 
      updateDistricts, 
      updateLanguage 
    }}>
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
