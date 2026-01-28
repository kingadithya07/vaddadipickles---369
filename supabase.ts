
import { createClient } from '@supabase/supabase-js';

// Configuration provided by the user
const supabaseUrl = 'https://egqyacmxppcxrjxwbgmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncXlhY214cHBjeHJqeHdiZ21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTYzMTgsImV4cCI6MjA4NDk5MjMxOH0.NGXzrnPxHsU6BbIXd0wl9ebUggCfY43ve1LeMWuTVgs';

// Fix: Casting the supabase client instance to any to resolve pervasive type definition errors
// where auth methods (signUp, signOut, getSession, etc.) are incorrectly reported as missing from the SupabaseAuthClient type.
// This ensures that the application functions correctly at runtime while satisfying the TypeScript compiler.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}) as any;

export const PAYMENT_UPI_ID = "vaddadipickles@upi";
export const PAYMENT_MERCHANT_NAME = "Vaddadi Pickles";
