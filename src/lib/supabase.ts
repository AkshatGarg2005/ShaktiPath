import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
});

let supabase: any;

// Check for missing or placeholder values
const isValidUrl = supabaseUrl && !supabaseUrl.includes('your_supabase_url_here') && supabaseUrl.startsWith('http');
const isValidKey = supabaseAnonKey && !supabaseAnonKey.includes('your_supabase_anon_key_here') && supabaseAnonKey.length > 20;

if (!isValidUrl || !isValidKey) {
  console.error('❌ Missing or invalid Supabase environment variables');
  console.error('Please make sure you have valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  console.error('Current values appear to be placeholders. Please replace with actual Supabase credentials.');
  
  // Create a mock client for development
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
      insert: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
    })
  };
} else {
  console.log('✅ Supabase environment variables found');
  
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      storage: window.localStorage, // Explicitly use localStorage for session persistence
      storageKey: 'shaktipath-auth-token', // Custom storage key
      debug: false
    },
    global: {
      headers: {
        'X-Client-Info': 'shaktipath-web'
      }
    }
  });
  
  // Add session recovery on page load
  console.log('🔄 Checking for existing session...');
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.error('❌ Session recovery error:', error);
    } else if (session) {
      console.log('✅ Session recovered for:', session.user.email);
    } else {
      console.log('👤 No existing session to recover');
    }
  });
}

export { supabase };

// Database types matching the actual schema
export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  emergency_contact: string
  created_at: string
  updated_at: string
}

export interface RouteHistory {
  id: string
  user_id: string
  source_lat: number
  source_lng: number
  source_address: string
  destination_lat: number
  destination_lng: number
  destination_address: string
  safety_score: number
  distance: string
  duration: string
  route_data: any
  created_at: string
}

export interface EmergencyAlert {
  id: string
  user_id: string
  lat: number
  lng: number
  address: string
  alert_type: 'sos' | 'panic' | 'manual'
  status: 'active' | 'resolved' | 'false_alarm'
  status: 'active' | 'resolved' | 'false_alarm'
  created_at: string
  resolved_at?: string
}