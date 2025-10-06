import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_URL_PLACEHOLDER = "your_vite_supabase_url_here";
const SUPABASE_ANON_KEY_PLACEHOLDER = "your_vite_supabase_anon_key_here";

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === SUPABASE_URL_PLACEHOLDER || supabaseAnonKey === SUPABASE_ANON_KEY_PLACEHOLDER) {
  const errorMessage = "Supabase URL and/or Anon Key are missing or still using placeholder values. Please update your .env file with the correct Supabase project URL and Anon Key (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).";
  console.error(errorMessage);
  toast.error(errorMessage);
  // Throw an error to prevent the app from starting with an invalid Supabase client
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);