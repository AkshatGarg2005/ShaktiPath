import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  emergency_contact: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing authentication...');
      
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase not configured, using demo mode');
        setError('Supabase not configured. Please click "Connect to Supabase" in the top right to set up your database.');
        setIsLoading(false);
        return;
      }

      // Test Supabase connection first
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Supabase session error:', sessionError);
          setError(`Connection error: ${sessionError.message}`);
          setIsLoading(false);
          return;
        }

        console.log('✅ Supabase connection successful');
        
        // If we have an existing session, load the user profile
        if (session?.user) {
          console.log('👤 Found existing session for:', session.user.email);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('👤 No existing session found');
          setIsLoading(false);
        }
        
      } catch (connectionError: any) {
        console.error('❌ Failed to connect to Supabase:', connectionError);
        setError(`Failed to connect to database: ${connectionError.message}`);
        setIsLoading(false);
        return;
      }
      
      // Set up auth state listener for future changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ User signed in, fetching profile...');
            await fetchUserProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out');
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
            setIsLoading(false);
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            console.log('🔄 Token refreshed, maintaining session');
            // Don't fetch profile again, just ensure we're still authenticated
            if (!user) {
              await fetchUserProfile(session.user.id);
            }
          }
        } catch (error: any) {
          console.error('❌ Error handling auth state change:', error);
          setError(`Auth error: ${error.message}`);
          setIsLoading(false);
        }
      });

      setError(null);

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    } catch (error: any) {
      console.error('❌ Auth initialization error:', error);
      setError(`Failed to initialize: ${error.message}`);
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        throw error;
      }

      if (data) {
        console.log('✅ User profile loaded:', data.email);
        setUser(data);
        setIsAuthenticated(true);
        setError(null);
      } else {
        console.log('⏰ User profile not found, might be a new registration');
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error);
      setError(`Failed to load profile: ${error.message}`);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔐 Attempting login for:', email);
      
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setError('Supabase not configured. Please set up your environment variables.');
        setIsLoading(false);
        return false;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ Login error:', error);
        setError(error.message);
        setIsLoading(false);
        return false;
      }

      if (data.user && data.session) {
        console.log('✅ Login successful for:', email);
        // The auth state change listener will handle fetching the profile
        return true;
      }

      setError('Login failed - no session created');
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      setError(`Login failed: ${error.message}`);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📝 Starting registration for:', userData.email);
      
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setError('Supabase not configured. Please set up your environment variables.');
        setIsLoading(false);
        return false;
      }
      
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName
          }
        }
      });

      if (authError) {
        console.error('❌ Auth registration error:', authError);
        setError(authError.message);
        setIsLoading(false);
        return false;
      }

      if (!authData.user) {
        setError('Registration failed - no user created');
        setIsLoading(false);
        return false;
      }

      console.log('✅ Auth user created:', authData.user.id);

      // Create the user profile in our users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            full_name: userData.fullName,
            phone: userData.phone,
            emergency_contact: userData.emergencyContact
          }
        ]);

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        setError(`Failed to create profile: ${profileError.message}`);
        setIsLoading(false);
        return false;
      }

      console.log('✅ User profile created successfully');

      // If email confirmation is disabled, the user will be automatically signed in
      if (authData.session) {
        console.log('✅ Registration successful with auto sign-in');
        // The auth state change listener will handle the rest
        return true;
      } else {
        setIsLoading(false);
        console.log('✅ Registration successful, email confirmation required');
        return true;
      }
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      setError(`Registration failed: ${error.message}`);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user');
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Logout error:', error);
        setError(`Logout failed: ${error.message}`);
      } else {
        console.log('✅ Logout successful');
      }
      
      // Clear state immediately regardless of API response
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error: any) {
      console.error('❌ Logout failed:', error);
      setError(`Logout failed: ${error.message}`);
      // Still clear local state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated, 
      isLoading,
      error 
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