
import { createClient } from '@supabase/supabase-js';

// These keys were provided by the user.
// In a production environment, you would use process.env or import.meta.env
const supabaseUrl = 'https://egqyacmxppcxrjxwbgmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncXlhY214cHBjeHJqeHdiZ21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTYzMTgsImV4cCI6MjA4NDk5MjMxOH0.NGXzrnPxHsU6BbIXd0wl9ebUggCfY43ve1LeMWuTVgs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const PAYMENT_UPI_ID = "vaddadipickles@upi";
export const PAYMENT_MERCHANT_NAME = "Vaddadi Pickles";
