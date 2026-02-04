import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client with anon key
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Expected database schema for sanctuary_signups table:
 * 
 * CREATE TABLE sanctuary_signups (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   email TEXT UNIQUE NOT NULL,
 *   source TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_sanctuary_signups_email ON sanctuary_signups(email);
 */

export interface SanctuarySignup {
  id?: string;
  email: string;
  source?: string;
  created_at?: string;
}
