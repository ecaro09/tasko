import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "Supabase environment variables are not set. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your .env file.";
  console.error(errorMessage);
  throw new Error(errorMessage); // Throw an error to stop execution if critical config is missing
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);