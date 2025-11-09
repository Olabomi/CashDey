import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set initial loading state to true
    setLoading(true);
    
    // Get the initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Fetch profile for the initial user
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching initial profile:", error.message);
        } else {
          setProfile(profileData);
        }
      }
      setLoading(false);
    });

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // With the database trigger handling profile creation, we can be confident
          // that a profile exists for any authenticated user. We just need to fetch it.
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile on auth change:', error.message);
            setProfile(null);
          } else {
            setProfile(profileData as Profile);
          }
        } else {
          // User is logged out, clear the profile.
          setProfile(null);
        }
        // This setLoading(false) might be redundant if getSession() already handled it,
        // but it ensures the loading state is false after any auth change.
        if (loading) setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Removed `loading` from dependency array to prevent infinite loop.

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};