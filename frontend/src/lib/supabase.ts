import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: any = null;

try {
  if (supabaseUrl && supabaseUrl.startsWith('https://') && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn('Supabase URL or Anon Key is missing or invalid in environment variables.');
  }
} catch (error) {
  console.warn('Failed to initialize Supabase client:', error);
}

export default supabase;
