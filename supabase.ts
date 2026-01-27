import { createClient } from '@supabase/supabase-js';

// NOTE: In a real deployment, these should be environment variables.
// Users must provide their own Supabase credentials.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const PAYMENT_UPI_ID = "vaddadipickles@upi";
export const PAYMENT_MERCHANT_NAME = "Vaddadi Pickles";