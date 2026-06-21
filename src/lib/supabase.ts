import { createClient } from '@supabase/supabase-js';

// Fetch environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use placeholders if variables are missing or empty to prevent initialization errors
const supabaseUrl = envUrl && envUrl.trim() !== "" ? envUrl : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = envKey && envKey.trim() !== "" ? envKey : 'placeholder-key';

if (!envUrl || !envKey) {
  console.warn(
    'Supabase credentials missing or empty. If you just added them to .env, please restart the app using the button above.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);