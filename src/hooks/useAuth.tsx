import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  updateDistricts: (districts: string[]) => Promise<void>;
  updateLanguage: (lang: 'en' | 'hi') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              role: 'registrar',
              assignedDistricts: [],
              preferredLanguage: 'en',
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateRole = async (role: UserRole) => {
    if (user && profile) {
      const docRef = doc(db, 'users', user.uid);
      const newProfile = { ...profile, role };
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    }
  };

  const updateDistricts = async (districts: string[]) => {
    if (user && profile) {
      const docRef = doc(db, 'users', user.uid);
      const newProfile = { ...profile, assignedDistricts: districts };
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    }
  };

  const updateLanguage = async (preferredLanguage: 'en' | 'hi') => {
    if (user && profile) {
      const docRef = doc(db, 'users', user.uid);
      const newProfile = { ...profile, preferredLanguage };
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateRole, updateDistricts, updateLanguage }}>
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
