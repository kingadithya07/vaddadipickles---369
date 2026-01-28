import { createClient } from '@supabase/supabase-js';

// Configuration provided by the user
const supabaseUrl = 'https://egqyacmxppcxrjxwbgmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncXlhY214cHBjeHJqeHdiZ21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTYzMTgsImV4cCI6MjA4NDk5MjMxOH0.NGXzrnPxHsU6BbIXd0wl9ebUggCfY43ve1LeMWuTVgs';

// Use a more robust configuration for the browser environment
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: { 'x-application-name': 'vaddadi-pickles' }
  }
}) as any;

export const PAYMENT_UPI_ID = "vaddadipickles@upi";
export const PAYMENT_MERCHANT_NAME = "Vaddadi Pickles";